// Issue #12: a controller that appears after the boot (on Android Chrome,
// always: a pad is shown to the page only once one of its buttons is pressed)
// was never given to the game. The hot-plug poller 0x00a220c0 runs as a
// per-frame slice (host_shims_module.c), and a slice is abandoned where a real
// thread would block -- among other places at the "idle lap" of a lock loop,
// which was the same lock acquired a third time with no host-boundary call in
// between. Lifted code calls most imports directly, so "no host call" was
// often only "no host call that host_trap saw", and the poller's connect
// callback 0x00a21d40 lost its slice twice over:
//   - the engine logger 0x00a112c0 takes its Mutex for every line and calls
//     OutputDebugStringA directly; the callback logs six lines, and the slice
//     was abandoned after "Gamepad Connected:";
//   - with the logger counted, it was abandoned further on, on a device
//     handle's refcount Mutex taken three times running (measured with
//     ?ISAAC_IDLE_LAPS=2&ISAAC_THR_TRACE=1: "job #1 0x00a220c0 yields at an
//     idle lap: lock 0x00d2228c taken 3 times running", the keyboard Gamepad
//     handle's lock), before the InputManager had the new device.
// Either way the XInput record existed and was polled, and the game never had
// a device for it. Now OutputDebugStringA is progress, and an idle lap is
// ISAAC_IDLE_LAPS (64) repeats.
//
// These compile the real slicer (host_shims_module.c) and the real
// OutputDebugStringA shim (host_shims_gl.c) into a small Wasm module, enter a
// job through slice_job() and play the patterns at it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const host = join(root, 'scripts', 'recomp', 'host');
const require = createRequire(import.meta.url);

const harness = String.raw`
#include "host_shims_module.c"
#include <emscripten.h>

#define LOGGER_CS 0x1000u            /* the logger Mutex's critical section */
#define HANDLE_CS 0x2000u            /* a device handle's refcount Mutex */
#define QUEUE_CS  0x3000u            /* a work queue's lock */

/* The runtime state slice_job saves and restores around a slice
 * (mkdispatch.py's dispatcher owns these in the engine). */
uint32_t g_reentry_eip, g_guest_call_esp;
struct CpuState *recomp_last_cpu;
double recomp_last_log_ms;
void isaac_guest_jmp_save(void *dst) { (void)dst; }
void isaac_guest_jmp_restore(const void *src) { (void)src; }

static uint32_t g_stack[0x4000];     /* the scratch guest stack slices run on */
static char g_text[] = "[INFO] - Gamepad Connected:";
static int g_scenario, g_lines, g_locks, g_laps, g_done;

/* What the engine logger does per line: Lock (the fast mutex path reports
 * the acquire, host_fastpath.c isaac_fast_mutex_take), format, the direct
 * OutputDebugStringA call, Unlock (a no-op). */
static void log_line(void) {
    isaac_threads_note_cs(LOGGER_CS);
    uint32_t args[2] = { 0u, isaac_va(g_text) };
    CpuState c = {0};
    c.ESP = isaac_va(args);
    imp_kernel32__OutputDebugStringA(&c);
    ++g_lines;
}

/* The job a slice enters.
 *   1: six log lines in a row (the connect callback's head);
 *   2: the connect callback: six log lines, then a device handle's refcount
 *      lock taken three times running (copy, copy, release), then done;
 *   3: the idle lap of a queue loop: lock, nothing to do, lock again. */
void isaac_guest_call(uint32_t va, CpuState *restrict cpu) {
    (void)va; (void)cpu;
    if (g_scenario == 1 || g_scenario == 2) {
        for (int i = 0; i < 6; ++i) log_line();
        if (g_scenario == 2)
            for (g_locks = 0; g_locks < 3; ) { isaac_threads_note_cs(HANDLE_CS); ++g_locks; }
        g_done = 1;
    } else {
        for (g_laps = 0; g_laps < 100000; ++g_laps) isaac_threads_note_cs(QUEUE_CS);
        g_done = 1;
    }
}

EMSCRIPTEN_KEEPALIVE void set_laps(int n) {     /* before the first acquire: the count is read once */
    char v[16];
    snprintf(v, sizeof v, "%d", n);
    setenv("ISAAC_IDLE_LAPS", v, 1);
}
EMSCRIPTEN_KEEPALIVE int run(int scenario) {
    g_scenario = scenario; g_lines = 0; g_locks = 0; g_laps = 0; g_done = 0;
    memset(&g_thr[0], 0, sizeof g_thr[0]);
    g_thr[0].entry = 0x00a220c0u;
    g_thr_n = 1u;
    CpuState cpu = {0};
    cpu.ESP = isaac_va(&g_stack[0x3ff0]);
    slice_job(0u, &cpu);
    return g_done;
}
EMSCRIPTEN_KEEPALIVE int lines(void) { return g_lines; }
EMSCRIPTEN_KEEPALIVE int locks(void) { return g_locks; }
EMSCRIPTEN_KEEPALIVE int laps(void) { return g_laps; }
EMSCRIPTEN_KEEPALIVE int yields(void) { return (int)g_thr[0].yields; }
EMSCRIPTEN_KEEPALIVE int retired(void) { return g_thr[0].retired; }
`;

test('the hot-plug poller keeps its slice through a pad connect; the idle lap of a lock still yields', async (t) => {
  const emsdk = process.env.EMSDK || join(homedir(), 'emsdk');
  const emcc = [
    process.env.EMCC,
    join(emsdk, 'upstream', 'emscripten', 'emcc.exe'),
    join(emsdk, 'upstream', 'emscripten', 'emcc'),
  ].find((path) => path && existsSync(path));
  if (!emcc) return t.skip('Emscripten emcc missing; set EMCC');

  const dir = mkdtempSync(join(tmpdir(), 'isaac-pad-hotplug-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'slices.c');
  const modulePath = join(dir, 'slices.cjs');
  writeFileSync(source, harness);
  const built = spawnSync(emcc, [
    source, join(host, 'src', 'host_trap.c'), join(host, 'src', 'host_shims_gl.c'),
    '-I', join(host, 'include'), '-I', join(host, 'generated'), '-I', join(host, 'src'),
    '-O2', '-ffunction-sections', '-fdata-sections', '-Wl,--gc-sections',
    '--no-entry', '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sSINGLE_FILE=1',
    '-sERROR_ON_UNDEFINED_SYMBOLS=1', '-o', modulePath,
  ], { cwd: root, encoding: 'utf8', timeout: 180000 });
  assert.equal(built.status, 0, built.error?.message || built.stderr || built.stdout);
  const createSlices = require(modulePath);
  const quiet = { printErr: () => {}, print: () => {} };

  await t.test('a log line is progress: six in a row survive even the old count of 2', async () => {
    const m = await createSlices(quiet);
    m._set_laps(2);
    assert.equal(m._run(1), 1, 'the job was not abandoned between two log lines');
    assert.equal(m._lines(), 6, 'every line was written');
    assert.equal(m._yields(), 0);
    assert.equal(m._retired(), 1, 'it returned through the slice runner');
  });

  await t.test('the connect callback runs to its end at the default count', async () => {
    const m = await createSlices(quiet);
    assert.equal(m._run(2), 1, 'the device handle lock taken three times running is not an idle lap');
    assert.equal(m._lines(), 6);
    assert.equal(m._locks(), 3);
    assert.equal(m._yields(), 0);
    assert.equal(m._retired(), 1);
  });

  await t.test('at the old count of 2 the same callback is abandoned on the handle lock (the #12 failure)', async () => {
    const m = await createSlices(quiet);
    m._set_laps(2);
    assert.equal(m._run(2), 0, 'abandoned');
    assert.equal(m._lines(), 6, 'after the log lines');
    assert.equal(m._locks(), 2, 'at the third acquire of the handle lock');
    assert.equal(m._yields(), 1);
  });

  await t.test('a lock taken again and again with nothing between is still the idle lap', async () => {
    const m = await createSlices(quiet);
    assert.equal(m._run(3), 0, 'the slice was abandoned');
    assert.equal(m._laps(), 64, 'after 64 repeats of the same lock (ISAAC_IDLE_LAPS default)');
    assert.equal(m._yields(), 1);
    assert.equal(m._retired(), 0, 'a yielded job lives on for the next frame');
  });
});
