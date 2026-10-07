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
const PM_NOREMOVE = 0;
const PM_REMOVE = 1;
const PM_NOYIELD = 2;
const WM_QUIT = 0x12;
const WM_KEYDOWN = 0x100;
const WM_KEYUP = 0x101;
const WM_CHAR = 0x102;
const WM_MOUSEMOVE = 0x200;
const VK_CONTROL = 0x11;
const VK_LCONTROL = 0xa2;
const VK_SPACE = 0x20;

// Include the real shim to arrange wrapped/thread-message fixtures without a
// production debug API. Retrieval, queue mutation, and key state are not stubbed.
const harness = String.raw`
#include "host_shims_win.c"

double recomp_last_log_ms;
static uint32_t guest_stack[6];
static uint32_t received[7];

EMSCRIPTEN_KEEPALIVE uint32_t peek(uint32_t hwnd, uint32_t min,
                                  uint32_t max, uint32_t flags) {
    CpuState cpu = {0};
    guest_stack[0] = 0;
    guest_stack[1] = isaac_va(received);
    guest_stack[2] = hwnd;
    guest_stack[3] = min;
    guest_stack[4] = max;
    guest_stack[5] = flags;
    cpu.ESP = isaac_va(guest_stack);
    imp_user32__PeekMessageW(&cpu);
    return cpu.EAX;
}

EMSCRIPTEN_KEEPALIVE uint32_t message_word(unsigned index) {
    return received[index];
}

EMSCRIPTEN_KEEPALIVE uint32_t key_state(uint32_t vk) {
    CpuState cpu = {0};
    guest_stack[1] = vk;
    cpu.ESP = isaac_va(guest_stack);
    imp_user32__GetKeyState(&cpu);
    return cpu.EAX;
}

EMSCRIPTEN_KEEPALIVE void queue_key(uint32_t vk, uint32_t scancode,
                                   int extended, int down) {
    isaac_input_key(vk, scancode, extended, down);
}

EMSCRIPTEN_KEEPALIVE unsigned queued(void) {
    return isaac_input_queued();
}

EMSCRIPTEN_KEEPALIVE void start_wrapped_queue(void) {
    g_msgq_head = MSGQ_MAX - 2u;
}

EMSCRIPTEN_KEEPALIVE void queue_message(uint32_t hwnd, uint32_t message,
                                       uint32_t wParam, uint32_t lParam) {
    unsigned before = g_msgq_count;
    msgq_push(message, wParam, lParam);
    if (g_msgq_count != before)
        g_msgq[(g_msgq_head + g_msgq_count - 1u) % MSGQ_MAX].hwnd = hwnd;
}

EMSCRIPTEN_KEEPALIVE void reach_frame_cap(void) {
    setenv("ISAAC_MAX_FRAMES", "1", 1);
    g_frames_presented = 1u;
}
`;

function message(input) {
  const words = Array.from({ length: 7 }, (_, index) => input._message_word(index) >>> 0);
  return {
    hwnd: words[0], message: words[1], wParam: words[2], lParam: words[3],
    time: words[4], x: words[5], y: words[6],
  };
}

function keyState(input, vk) {
  return input._key_state(vk) & 0xffff;
}

test('compiled Win32 input shim preserves lookahead and removes only matching messages', async (t) => {
  const emsdk = process.env.EMSDK || join(homedir(), 'emsdk');
  const emcc = [
    process.env.EMCC,
    join(emsdk, 'upstream', 'emscripten', 'emcc.exe'),
    join(emsdk, 'upstream', 'emscripten', 'emcc'),
  ].find((path) => path && existsSync(path));
  if (!emcc) return t.skip('Emscripten emcc missing; set EMCC');

  const dir = mkdtempSync(join(tmpdir(), 'isaac-host-input-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const source = join(dir, 'input.c');
  const modulePath = join(dir, 'input.cjs');
  writeFileSync(source, harness);
  const built = spawnSync(emcc, [
    source, join(host, 'src', 'host_trap.c'),
    '-I', join(host, 'include'), '-I', join(host, 'generated'), '-I', join(host, 'src'),
    '-O2', '-ffunction-sections', '-fdata-sections', '-Wl,--gc-sections',
    '--no-entry', '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sSINGLE_FILE=1',
    '-sERROR_ON_UNDEFINED_SYMBOLS=1', '-o', modulePath,
  ], { cwd: root, encoding: 'utf8', timeout: 120000 });
  assert.equal(built.status, 0, built.error?.message || built.stderr || built.stdout);
  const createInput = require(modulePath);

  await t.test('Ctrl removal followed by GLFW lookahead leaves Space available for dispatch', async () => {
    const input = await createInput();
    input._queue_key(VK_CONTROL, 0x1d, 0, 1);
    input._queue_key(VK_SPACE, 0x39, 0, 1);
    assert.equal(keyState(input, VK_CONTROL), 0, 'queued Ctrl is not synchronously pressed yet');
    assert.equal(keyState(input, VK_SPACE), 0, 'queued Space is not synchronously pressed yet');

    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
    assert.equal(message(input).wParam, VK_CONTROL);
    assert.equal(keyState(input, VK_CONTROL), 0x8000);
    assert.equal(keyState(input, VK_LCONTROL), 0x8000, 'removed generic Ctrl also updates its left-side state');
    assert.equal(keyState(input, VK_SPACE), 0);

    assert.equal(input._peek(0, 0, 0, PM_NOREMOVE), 1);
    const space = message(input);
    assert.equal(space.message, WM_KEYDOWN);
    assert.equal(space.wParam, VK_SPACE);
    assert.equal(space.lParam, 1 | (0x39 << 16));
    assert.equal(input._queued(), 1, 'GLFW AltGr lookahead must not consume Space following Ctrl');
    assert.equal(keyState(input, VK_SPACE), 0, 'PM_NOREMOVE must not advance synchronous key state');
    assert.equal(input._peek(0, 0, 0, PM_NOREMOVE), 1);
    assert.deepEqual(message(input), space, 'repeated lookahead returns the same complete MSG');
    assert.equal(input._queued(), 1);
    assert.equal(keyState(input, VK_SPACE), 0);

    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
    assert.deepEqual(message(input), space, 'dispatch retrieves exactly the Space that lookahead inspected');
    assert.equal(input._queued(), 0);
    assert.equal(keyState(input, VK_SPACE), 0x8000);
    assert.equal(keyState(input, VK_CONTROL), 0x8000);

    input._queue_key(VK_SPACE, 0x39, 0, 0);
    assert.equal(keyState(input, VK_SPACE), 0x8000, 'physical release waits for removal to change synchronous state');
    assert.equal(input._peek(0, 0, 0, PM_NOREMOVE), 1);
    const release = message(input);
    assert.equal(release.message, WM_KEYUP);
    assert.equal(keyState(input, VK_SPACE), 0x8000, 'inspecting key-up must not release the synchronous key');
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
    assert.deepEqual(message(input), release);
    assert.equal(keyState(input, VK_SPACE), 0);
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 0);
  });

  await t.test('window and inclusive range filters preserve unmatched order across a wrapped ring', async () => {
    const input = await createInput();
    const firstWindow = 0x20000;
    const secondWindow = 0x20001;
    input._start_wrapped_queue();
    input._queue_message(firstWindow, WM_MOUSEMOVE, 11, 0);
    input._queue_message(secondWindow, WM_KEYDOWN, VK_SPACE, 1 | (0x39 << 16));
    input._queue_message(firstWindow, WM_KEYDOWN, 0x41, 1 | (0x1e << 16));
    input._queue_message(0, WM_CHAR, 0x74, 1);
    input._queue_message(firstWindow, WM_MOUSEMOVE, 22, 0);

    assert.equal(input._peek(0x20002, WM_KEYDOWN, WM_KEYDOWN, PM_REMOVE), 0, 'no matching window means no retrieval');
    assert.equal(input._queued(), 5, 'a filter miss preserves every queued message');
    assert.equal(keyState(input, VK_SPACE), 0);
    assert.equal(input._peek(firstWindow, WM_KEYUP, WM_KEYUP, PM_REMOVE), 0, 'no matching message range means no retrieval');
    assert.equal(input._queued(), 5);

    assert.equal(input._peek(firstWindow, WM_KEYDOWN, WM_KEYDOWN, PM_REMOVE), 1);
    assert.equal(message(input).wParam, 0x41, 'range and window filters both select the interior A event');
    assert.equal(keyState(input, 0x41), 0x8000);
    assert.equal(keyState(input, VK_SPACE), 0, 'removing A must not apply the skipped Space key-down');
    assert.equal(input._peek(secondWindow, WM_KEYDOWN, WM_KEYDOWN, PM_NOREMOVE), 1);
    const space = message(input);
    assert.equal(space.hwnd, secondWindow);
    assert.equal(space.wParam, VK_SPACE);
    assert.equal(input._queued(), 4);
    assert.equal(keyState(input, VK_SPACE), 0);
    assert.equal(input._peek(secondWindow, WM_KEYDOWN, WM_KEYDOWN, PM_REMOVE), 1);
    assert.deepEqual(message(input), space);
    assert.equal(keyState(input, VK_SPACE), 0x8000);

    assert.equal(input._peek(-1, 0, 0, PM_NOYIELD), 1, 'HWND -1 selects the thread message, not a window message');
    const thread = message(input);
    assert.equal(thread.hwnd, 0);
    assert.equal(thread.message, WM_CHAR);
    assert.equal(thread.wParam, 0x74);
    assert.equal(input._queued(), 3, 'PM_NOYIELD alone does not request removal');
    assert.equal(input._peek(-1, 0, 0, PM_REMOVE | PM_NOYIELD), 1);
    assert.deepEqual(message(input), thread);
    for (const expected of [11, 22]) {
      assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
      assert.equal(message(input).message, WM_MOUSEMOVE);
      assert.equal(message(input).wParam, expected, 'filtered removals preserve the remaining FIFO order');
    }
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 0);
  });

  await t.test('queued WM_QUIT bypasses the message range without removing preceding input', async () => {
    const input = await createInput();
    input._queue_message(0x20000, WM_MOUSEMOVE, 17, 0);
    input._queue_message(0, WM_QUIT, 7, 0);
    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_NOREMOVE), 1);
    const quit = message(input);
    assert.equal(quit.message, WM_QUIT, 'WM_QUIT remains retrievable outside the requested keyboard range');
    assert.equal(quit.wParam, 7);
    assert.equal(input._queued(), 2);
    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_NOREMOVE), 1);
    assert.deepEqual(message(input), quit);
    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_REMOVE), 1);
    assert.deepEqual(message(input), quit);
    assert.equal(input._queued(), 1);
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
    assert.equal(message(input).message, WM_MOUSEMOVE);
    assert.equal(message(input).wParam, 17, 'retrieving WM_QUIT leaves the skipped input intact');
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 0);
  });

  await t.test('frame-cap WM_QUIT waits for input and remains available until PM_REMOVE', async () => {
    const input = await createInput();
    input._reach_frame_cap();
    input._queue_key(VK_SPACE, 0x39, 0, 1);
    assert.equal(input._peek(0, WM_MOUSEMOVE, WM_MOUSEMOVE, PM_REMOVE), 0, 'a filter miss cannot trigger frame-cap quit while input remains queued');
    assert.equal(input._queued(), 1);
    assert.equal(keyState(input, VK_SPACE), 0);
    assert.equal(input._peek(0, 0, 0, PM_REMOVE), 1);
    assert.equal(message(input).wParam, VK_SPACE);

    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_NOREMOVE), 1);
    const quit = message(input);
    assert.equal(quit.message, WM_QUIT);
    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_NOYIELD), 1, 'inspecting synthetic WM_QUIT does not consume the one-shot quit');
    assert.deepEqual(message(input), quit);
    assert.equal(input._peek(0, WM_KEYDOWN, WM_KEYUP, PM_REMOVE), 1);
    assert.deepEqual(message(input), quit);
    assert.equal(input._peek(0, 0, 0, PM_NOREMOVE), 0, 'frame-cap quit is consumed exactly once by removal');
  });
});
