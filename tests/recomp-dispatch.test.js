// Compile the real generated dispatcher against controlled lifted bodies. No
// private PE or host implementations are needed. Each scenario starts a fresh
// process; observations come from public entrypoints and the dispatch report.
// Parent command: node --test tests/recomp-dispatch.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const python = [
  process.env.PYTHON,
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3', 'python',
].find((path) => path && spawnSync(path, ['-B', '-c', 'import sys; sys.exit(sys.version_info < (3, 9))'], {
  encoding: 'utf8', timeout: 10000,
}).status === 0);

function runFixture(t) {
  if (!python) {
    t.skip('no Python 3.9+ available');
    return null;
  }
  const temporary = mkdtempSync(join(tmpdir(), 'isaac-dispatch-probe-'));
  try {
    // mkdispatch discovers ../host/src/missing_fns.c relative to itself. Copy
    // only its actual dependencies so unrelated hand-written entries cannot leak
    // into this fixture, even when a private lifted tree exists in the checkout.
    const generator = join(temporary, 'generator');
    mkdirSync(generator);
    for (const file of ['mkdispatch.py', 'pe.py', 'split_giants.py']) copyFileSync(join(lift, file), join(generator, file));
    writeFileSync(join(temporary, 'fixture.py'), fixtureProbe);
    writeFileSync(join(temporary, 'lifted_decls.h'), fixtureHeader);
    writeFileSync(join(temporary, 'lifted_fixture.c'), fixtureBodies);
    writeFileSync(join(temporary, 'call_cont.txt'),
      '00401107\n00401108\n00411004\n00401200\n00401220\n00401400\n00401420\n00401440\n00401460\n');
    writeFileSync(join(temporary, 'emscripten.h'), String.raw`
#ifndef DISPATCH_FIXTURE_CLOCK_H
#define DISPATCH_FIXTURE_CLOCK_H
double dispatch_fixture_now(void);
#define emscripten_get_now dispatch_fixture_now
#endif
`);
    // Use the same deterministic clock on native and Wasm. Include the native
    // standard headers before selecting the generated Emscripten clock branch.
    writeFileSync(join(temporary, 'dispatch_fixture.c'), String.raw`
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <setjmp.h>
#ifndef __EMSCRIPTEN__
#define __EMSCRIPTEN__ 1
#endif
#include "dispatch_tbl.c"
`);
    const result = spawnSync(python, ['-B', join(temporary, 'fixture.py'), lift, process.execPath], {
      cwd: root, encoding: 'utf8', timeout: 240000,
      env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONHASHSEED: '0' },
    });
    assert.equal(result.status, 0,
      result.error?.message || `dispatch fixture exited ${result.status}\n${result.stdout}\n${result.stderr}`);
    const data = JSON.parse(result.stdout);
    if (data.skip) {
      t.skip(data.skip);
      return null;
    }
    return Object.fromEntries(Object.entries(data.runs).map(([name, run]) => [name, {
      states: run.states, ...parseReport(run.stderr),
    }]));
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

const fixtureProbe = String.raw`
import json, os, shutil, subprocess, sys
from pathlib import Path

sys.dont_write_bytecode = True
lift = Path(sys.argv[1])
node = sys.argv[2]
temporary = Path(__file__).resolve().parent
sys.path.insert(0, str(lift))
from build_boot import ensure_emsdk_env, find_emcc

env = {key: value for key, value in os.environ.items() if not key.startswith('ISAAC_')}
env.update(PYTHONDONTWRITEBYTECODE='1', PYTHONHASHSEED='0')

def run(argv, timeout=120):
    result = subprocess.run([str(arg) for arg in argv], cwd=temporary, env=env,
                            capture_output=True, text=True, timeout=timeout)
    if result.returncode:
        raise RuntimeError('command %r exited %s\n%s\n%s' %
                           (argv, result.returncode, result.stdout, result.stderr))
    return result

# A compiler on PATH may lack its native SDK (notably clang on Windows).
# Probe that prerequisite separately; a failure compiling the real fixture
# must fail the test, never be disguised as an unavailable compiler.
probe = temporary / 'compiler_probe.c'
probe.write_text('#include <stdint.h>\n#include <stdlib.h>\n#include <stdio.h>\n'
                 'int main(void) { return 0; }\n')
compiler = None
attempted = set()
for name in (os.environ.get('CC'), 'cc', 'gcc', 'clang'):
    candidate = shutil.which(name) if name else None
    if not candidate or candidate in attempted:
        continue
    attempted.add(candidate)
    binary = temporary / ('compiler_probe.exe' if os.name == 'nt' else 'compiler_probe')
    try:
        built = subprocess.run([candidate, '-std=c11', str(probe), '-o', str(binary)],
                               cwd=temporary, env=env, capture_output=True, text=True, timeout=30)
        if built.returncode == 0:
            executed = subprocess.run([str(binary)], cwd=temporary, env=env,
                                      capture_output=True, timeout=10)
            if executed.returncode == 0:
                compiler = candidate
                break
    except (OSError, subprocess.TimeoutExpired):
        continue

emcc = None
if compiler is None:
    ensure_emsdk_env()
    emcc = find_emcc()
    env.update({key: value for key, value in os.environ.items() if not key.startswith('ISAAC_')})
if compiler is None and emcc is None:
    print(json.dumps({'skip': 'no usable native C compiler or Emscripten; set CC, EMCC or EMSDK'}))
    sys.exit(0)

# Compile actual split_giants output, then apply the same public-wrapper rename
# that leaves the split-state stem and ownership marker unchanged.
sys.path.insert(0, str(temporary / 'generator'))
from split_giants import split_function
giant = '''void sub_00401400(CpuState *restrict s) {
  uint32_t EAX = s->EAX;
  uint32_t EBX = s->EBX;
  uint32_t ESP = s->ESP;
  (void)0;
L_00401400: ;
  RECOMP_VA(0x00401400u);
  record(s, 410);
  EAX += 1u;
  goto L_00401440;
L_00401420: ;
  RECOMP_VA(0x00401420u);
  record(s, 420);
  EAX += 10u;
  EBX += 100u;
  goto L_00401460;
L_00401440: ;
  RECOMP_VA(0x00401440u);
  record(s, 440);
  EAX *= 3u;
  EBX += 2u;
  goto L_00401420;
L_00401460: ;
  RECOMP_VA(0x00401460u);
  record(s, 460);
  EAX += EBX;
  s->EAX = EAX; s->EBX = EBX; s->ESP = ESP + 4u;
  s->EIP = s->return_eip;
  return;
}'''
split = '\n'.join(split_function('sub_00401400', giant.splitlines(), part_lines=1))
split = split.replace('void sub_00401400(CpuState *restrict s)',
                      'void sub_00401400__lifted(CpuState *restrict s)', 1)
body_path = temporary / 'lifted_fixture.c'
body_path.write_text(body_path.read_text().replace('/* SPLIT_FIXTURE_BODY */', split))

run([sys.executable, '-B', temporary / 'generator' / 'mkdispatch.py', '--dir', temporary])
sources = [temporary / 'dispatch_fixture.c', temporary / 'lifted_fixture.c']
flags = ['-std=c11', '-O2', '-I', str(temporary)]
if compiler is not None:
    binary = temporary / ('dispatch_fixture.exe' if os.name == 'nt' else 'dispatch_fixture')
    run([compiler, *flags, *sources, '-o', binary])
    command = [binary]
else:
    module = temporary / 'dispatch_fixture.mjs'
    run([emcc, *flags, *sources, '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sEXPORT_ES6=1',
         '-sSINGLE_FILE=1', '-sEXIT_RUNTIME=1', '-sALLOW_MEMORY_GROWTH=1', '-o', module])
    runner = temporary / 'run.mjs'
    runner.write_text("import createModule from './dispatch_fixture.mjs';\n"
                      "await createModule({ arguments: process.argv.slice(2) });\n")
    command = [node, runner]

runs = {}
for name in ('cache', 'lookup', 'heartbeat', 'watch', 'time', 'lazy-enabled', 'lazy-off', 'negative',
             'wrapped-cache', 'wrapped-heartbeat', 'wrapped-watch', 'wrapped-time',
             'split-cache', 'split-heartbeat', 'split-watch', 'split-time'):
    result = run([*command, name], timeout=30)
    runs[name] = dict(states=[json.loads(line) for line in result.stdout.splitlines() if line.strip()],
                      stderr=result.stderr)
print(json.dumps(dict(runs=runs)))
`;

const fixtureHeader = String.raw`
#ifndef LIFTED_DECLS_H
#define LIFTED_DECLS_H
#include <stdint.h>
typedef struct {
  uint32_t EIP, nested, used;
  uint32_t EAX, EBX, ESP, return_eip;
  uint32_t events[64];
} CpuState;
void sub_00401000(CpuState *restrict cpu);
void sub_0040101f(CpuState *restrict cpu);
void sub_00401020(CpuState *restrict cpu);
void sub_00411004(CpuState *restrict cpu);
void sub_00421008(CpuState *restrict cpu);
void sub_004010f0(CpuState *restrict cpu);
void sub_00401200(CpuState *restrict cpu);
void sub_004013f0(CpuState *restrict cpu);
void sub_00401400(CpuState *restrict cpu);
#endif
`;

const fixtureBodies = String.raw`
#define _POSIX_C_SOURCE 200809L
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include "dispatch_tbl.h"

#define A 0x00401000u
#define B 0x00411004u
#define C 0x00421008u
#define EDGE_LEFT 0x0040101fu
#define EDGE_RIGHT 0x00401020u
#define BLOCK_LEFT 0x00401107u
#define BLOCK_RIGHT 0x00401108u
#define ABSENT 0x00403000u
#define THUNK 0x004010f0u
#define WRAPPED 0x00401200u
#define WRAPPED_CALL 0x00401220u
#define WRAPPED_PATCH 0x00401228u
#define PROTOTYPE_ONLY 0x004012f0u
#define SPLIT_THUNK 0x004013f0u
#define SPLIT_ENTRY 0x00401400u
#define SPLIT_LEFT 0x00401420u
#define SPLIT_RIGHT 0x00401440u
#define SPLIT_RET 0x00401460u
#define RECOMP_VA(va) ((void)(va))

uint32_t isaac_dispatch_calls(void);
void isaac_dispatch_report(void);
uint32_t recomp_jmp_pending;
void recomp_run_pending(CpuState *restrict cpu) {
  (void)cpu;
  // Guest-call trampoline execution is outside this fixture.
  abort();
}

static double clock_ms;
double dispatch_fixture_now(void) { double now = clock_ms; clock_ms += 1.0; return now; }
static void record(CpuState *cpu, uint32_t event) {
  if (cpu->used == sizeof(cpu->events) / sizeof(cpu->events[0])) abort();
  cpu->events[cpu->used++] = event;
  cpu->EIP = event;
}
static void nested_call(uint32_t va, CpuState *cpu) {
  if (!isaac_lifted_dispatch_cached(va, cpu) && !isaac_lifted_dispatch(va, cpu)) abort();
}

void sub_00401000(CpuState *restrict cpu) {
  uint32_t entry = g_reentry_eip;
  g_reentry_eip = 0;
  if (entry) {
    switch (entry) {
      case BLOCK_LEFT: RECOMP_VA(0x00401107u); record(cpu, 107); return;
      case BLOCK_RIGHT: RECOMP_VA(0x00401108u); record(cpu, 108); return;
      case B: RECOMP_VA(0x00411004u); record(cpu, 102); return;
      default: abort();
    }
  }
  record(cpu, 1);
  clock_ms += 2.0;
  if (cpu->nested) {
    cpu->nested = 0;
    nested_call(B, cpu);
    nested_call(C, cpu);
  }
  clock_ms += 3.0;
  record(cpu, 10);
}
void sub_0040101f(CpuState *restrict cpu) { record(cpu, 4); }
void sub_00401020(CpuState *restrict cpu) { record(cpu, 5); }
void sub_00411004(CpuState *restrict cpu) { record(cpu, 2); clock_ms += 7.0; }
void sub_00421008(CpuState *restrict cpu) { record(cpu, 3); clock_ms += 11.0; }

/* A renamed original follows an unrelated thunk, as in the real lifted TUs.
 * Its internal declaration is deliberately not in lifted_decls.h. */
void sub_004010f0(CpuState *restrict cpu) { record(cpu, 6); }
void sub_00401200__lifted(CpuState *restrict cpu) {
  RECOMP_VA(0x00401200u);
  uint32_t entry = g_reentry_eip;
  g_reentry_eip = 0;
  /* A block-scope prototype is not a new body or a public dispatch entry. */
void sub_004012f0(CpuState *restrict cpu);
  if (entry) {
    switch (entry) {
      case WRAPPED: record(cpu, 213); return;
      case WRAPPED_CALL: RECOMP_VA(0x00401220u); record(cpu, 221); return;
      case WRAPPED_PATCH: RECOMP_VA(0x00401228u); /* LIFT-PATCH REENTRY */ record(cpu, 228); return;
      case B: RECOMP_VA(0x00411004u); record(cpu, 299); return;
      default: abort();
    }
  }
  record(cpu, 210);
}
void sub_00401200(CpuState *restrict cpu) {
  RECOMP_VA(0x00401200u);
  /* No re-entry guard: older wrappers must never receive a continuation. */
  record(cpu, 200);
  sub_00401200__lifted(cpu);
}

static void recomp_unreachable(CpuState *cpu, uint32_t address) {
  (void)cpu;
  (void)address;
  abort();
}
/* Split parts follow an unrelated body; none belong to this thunk. */
void sub_004013f0(CpuState *restrict cpu) { record(cpu, 390); }
/* SPLIT_FIXTURE_BODY */
void sub_00401400(CpuState *restrict cpu) {
  record(cpu, 400);
  sub_00401400__lifted(cpu);
}

static void mode(const char *name, const char *value) {
#ifdef _WIN32
  if (_putenv_s(name, value)) abort();
#else
  if (setenv(name, value, 1)) abort();
#endif
}
static void modes(const char *heartbeat, const char *watch, const char *timing) {
  mode("ISAAC_HEARTBEAT", heartbeat);
  mode("ISAAC_DISPATCH_WATCH", watch);
  mode("ISAAC_DISPATCH_TIME", timing);
}
static void take(const char *step, char method, uint32_t va, CpuState *cpu) {
  int handled;
  switch (method) {
    case 'c': handled = isaac_lifted_dispatch_cached(va, cpu); break;
    case 'd': handled = isaac_lifted_dispatch(va, cpu); break;
    case 'r': handled = isaac_dispatch_return(va, cpu); break;
    default: abort();
  }
  printf("{\"step\":\"%s\",\"handled\":%d,\"calls\":%u,\"eip\":%u,"
         "\"reentry\":%u,\"nested\":%u,\"eax\":%u,\"ebx\":%u,\"esp\":%u,\"events\":[",
         step, handled, isaac_dispatch_calls(), cpu->EIP, g_reentry_eip, cpu->nested,
         cpu->EAX, cpu->EBX, cpu->ESP);
  for (uint32_t i = 0; i < cpu->used; ++i) printf("%s%u", i ? "," : "", cpu->events[i]);
  puts("]}");
}
static void take_split(const char *step, char method, uint32_t va, CpuState *cpu) {
  cpu->EIP = 0xdecafbadu;
  cpu->EAX = 7;
  cpu->EBX = 9;
  cpu->ESP = 0x8000u;
  cpu->return_eip = 0x00405678u;
  take(step, method, va, cpu);
}

int main(int argc, char **argv) {
  if (argc != 2) return 2;
  CpuState cpu = {0};
  cpu.EIP = 0xdecafbadu;
  modes("", "", "");
  const char *kind = argv[1];
  if (!strcmp(kind, "cache")) {
    g_reentry_eip = 0x0badf00du;
    take("zero-preinit", 'c', 0, &cpu);
    take("known-preinit", 'c', A, &cpu);
    take("invalid-preinit", 'c', UINT32_MAX, &cpu);
    g_reentry_eip = 0;
    take("a-fill", 'd', A, &cpu);
    take("empty-way", 'c', B, &cpu);
    take("a-hit", 'c', A, &cpu);
    take("zero-warm", 'c', 0, &cpu);
    take("invalid-warm", 'c', G_TEXT_HI, &cpu);
    take("unknown-warm", 'c', ABSENT, &cpu);
    take("b-fill", 'd', B, &cpu);
    take("c-fill", 'd', C, &cpu);
    take("a-evicted", 'c', A, &cpu);
    take("b-hit", 'c', B, &cpu);
    take("c-hit", 'c', C, &cpu);
    take("a-refill", 'd', A, &cpu);
    take("b-evicted", 'c', B, &cpu);
    take("a-refill-hit", 'c', A, &cpu);
    take("c-survives", 'c', C, &cpu);
    cpu.nested = 1;
    take("nested-collision", 'c', A, &cpu);
    take("outer-evicted", 'c', A, &cpu);
    take("nested-b-hit", 'c', B, &cpu);
    take("nested-c-hit", 'c', C, &cpu);
  } else if (!strcmp(kind, "lookup")) {
    take("zero", 'd', 0, &cpu);
    take("below-text", 'd', G_TEXT_LO - 1u, &cpu);
    take("past-text", 'd', G_TEXT_HI, &cpu);
    take("unsigned-max", 'd', UINT32_MAX, &cpu);
    take("return-past-text", 'r', G_TEXT_HI, &cpu);
    take("missing-in-first-page", 'd', A + 1u, &cpu);
    take("before-left-entry", 'd', EDGE_LEFT - 1u, &cpu);
    take("after-right-entry", 'd', EDGE_RIGHT + 1u, &cpu);
    take("absent-pages", 'd', ABSENT, &cpu);
    take("last-text-byte", 'd', G_TEXT_HI - 1u, &cpu);
    take("first-entry", 'd', A, &cpu);
    take("left-entry", 'd', EDGE_LEFT, &cpu);
    take("right-entry", 'd', EDGE_RIGHT, &cpu);
    take("left-block", 'd', BLOCK_LEFT, &cpu);
    take("right-block", 'd', BLOCK_RIGHT, &cpu);
    take("before-left-block", 'd', BLOCK_LEFT - 1u, &cpu);
    take("after-right-block", 'd', BLOCK_RIGHT + 1u, &cpu);
    take("shared-entry", 'd', B, &cpu);
    take("shared-cached-entry", 'c', B, &cpu);
    take("shared-return", 'r', B, &cpu);
    take("return-entry-fallback", 'r', EDGE_LEFT, &cpu);
    take("return-left-block", 'r', BLOCK_LEFT, &cpu);
    take("return-right-block", 'r', BLOCK_RIGHT, &cpu);
    take("return-absent-pages", 'r', ABSENT, &cpu);
  } else if (!strcmp(kind, "heartbeat") || !strcmp(kind, "watch") || !strcmp(kind, "time")) {
    if (!strcmp(kind, "heartbeat")) modes(" +2trailing", "", "");
    if (!strcmp(kind, "watch")) modes("", "00401000, 0x00411004,00401000,00421008,0040101f,00401020,00409999,00409998,00421008", "");
    if (!strcmp(kind, "time")) { modes("", "", "false"); cpu.nested = 1; }
    take("a", 'd', A, &cpu);
    take("cached-a", 'c', A, &cpu);
    take("b", 'd', B, &cpu);
    take("a-again", 'd', A, &cpu);
    take("cached-b", 'c', B, &cpu);
    take("c", 'd', C, &cpu);
  } else if (!strcmp(kind, "lazy-enabled") || !strcmp(kind, "lazy-off")) {
    int enabled = !strcmp(kind, "lazy-enabled");
    modes(enabled ? "0" : "2", enabled ? "" : "401000", enabled ? "0" : "1");
    take("preinit-probe", 'c', A, &cpu);
    take("preinit-outside", 'd', 0, &cpu);
    take("preinit-unknown", 'd', ABSENT, &cpu);
    take("preinit-block", 'd', BLOCK_LEFT, &cpu);
    take("preinit-shared-return", 'r', B, &cpu);
    modes(enabled ? "2" : "nonsense", enabled ? "401000, 411004" : "", enabled ? "1" : "01");
    take("still-empty", 'c', A, &cpu);
    take("first-entry", 'd', A, &cpu);
    take("cached-first", 'c', A, &cpu);
    modes(enabled ? "0" : "1", enabled ? "421008" : "411004", enabled ? "0" : "false");
    take("frozen-modes", 'd', B, &cpu);
    if (enabled) take("frozen-heartbeat", 'd', A, &cpu);
    else take("frozen-cache", 'c', B, &cpu);
  } else if (!strcmp(kind, "negative")) {
    modes("-2", "", "0");
    take("negative-heartbeat", 'd', A, &cpu);
    take("negative-no-cache", 'c', A, &cpu);
    modes("0", "401000", "1");
    take("reread-zero", 'd', B, &cpu);
    take("fast-b", 'c', B, &cpu);
    take("unfilled-a", 'c', A, &cpu);
    take("fill-a", 'd', A, &cpu);
    take("fast-a", 'c', A, &cpu);
    modes("2", "401000", "1");
    take("resolved-zero", 'd', C, &cpu);
    take("fast-c", 'c', C, &cpu);
    take("a-survives", 'c', A, &cpu);
  } else if (!strncmp(kind, "wrapped-", 8)) {
    if (!strcmp(kind, "wrapped-heartbeat")) modes("2", "", "");
    if (!strcmp(kind, "wrapped-watch")) modes("", "401200", "");
    if (!strcmp(kind, "wrapped-time")) modes("", "", "1");
    take("wrapped-preinit-return", 'r', WRAPPED_CALL, &cpu);
    take("preceding-thunk", 'd', THUNK, &cpu);
    take("wrapped-entry", 'd', WRAPPED, &cpu);
    take("wrapped-cache-probe", 'c', WRAPPED, &cpu);
    take("wrapped-return-entry", 'r', WRAPPED, &cpu);
    take("wrapped-return-continuation", 'r', WRAPPED_CALL, &cpu);
    take("wrapped-dispatch-continuation", 'd', WRAPPED_CALL, &cpu);
    take("wrapped-explicit-reentry", 'r', WRAPPED_PATCH, &cpu);
    take("shared-first-owner", 'r', B, &cpu);
    take("prototype-is-not-entry", 'd', PROTOTYPE_ONLY, &cpu);
  } else if (!strncmp(kind, "split-", 6)) {
    if (!strcmp(kind, "split-heartbeat")) modes("2", "", "");
    if (!strcmp(kind, "split-watch")) modes("", "401400", "");
    if (!strcmp(kind, "split-time")) modes("", "", "1");
    take_split("split-preinit-return", 'r', SPLIT_RIGHT, &cpu);
    take_split("split-preceding-thunk", 'd', SPLIT_THUNK, &cpu);
    take_split("split-entry", 'd', SPLIT_ENTRY, &cpu);
    take_split("split-cache-probe", 'c', SPLIT_ENTRY, &cpu);
    take_split("split-return-entry", 'r', SPLIT_ENTRY, &cpu);
    take_split("split-return-left", 'r', SPLIT_LEFT, &cpu);
    take_split("split-dispatch-right", 'd', SPLIT_RIGHT, &cpu);
    take_split("split-return-ret", 'r', SPLIT_RET, &cpu);
  } else return 2;
  isaac_dispatch_report();
  return 0;
}
`;

// Parse numeric observations, not prose or generated implementation text.
function parseReport(stderr) {
  const census = stderr.match(/\[isaac\]\[dispatch\]\s+(\d+) dispatches \((\d+) block re-entries, (\d+) misses; cache (\d+) hits \/ (\d+) fills\)/);
  assert.ok(census, `missing dispatch census:\n${stderr}`);
  const pairs = (pattern) => [...stderr.matchAll(pattern)].map((match) => [Number.parseInt(match[2], 16), Number(match[1])]);
  const entries = pairs(/^\[isaac\]\[dispatch\]\s+(\d+) x sub_([0-9a-f]{8})$/gm);
  const durations = pairs(/^\[isaac\]\[dispatch\]\s+([\d.]+) ms\s+sub_([0-9a-f]{8})$/gm);
  const heartbeat = pairs(/^\[isaac\]\[hb\]\s+(\d+) dispatches, [\d.]+ s, now sub_([0-9a-f]{8})$/gm);
  const watch = [...stderr.matchAll(/^\[isaac\]\[watch\] sub_([0-9a-f]{8}) dispatched (\d+) time\(s\)$/gm)]
    .map((match) => [Number.parseInt(match[1], 16), Number(match[2])]);
  const firstWatch = [...stderr.matchAll(/^\[isaac\]\[watch\] sub_([0-9a-f]{8}).*\(after (\d+) dispatches\)$/gm)]
    .map((match) => [Number.parseInt(match[1], 16), Number(match[2])]);
  const timing = stderr.match(/^\[isaac\]\[dispatch\] time inside dispatched entries ([\d.]+) ms .*bookkeeping ([\d.]+) ms;/m);
  return {
    census: census.slice(1).map(Number),
    entries: entries.sort((a, b) => a[0] - b[0]),
    durations: durations.sort((a, b) => a[0] - b[0]),
    heartbeat, watch, firstWatch,
    timing: timing ? timing.slice(1).map(Number) : null,
  };
}

const A = 0x401000, B = 0x411004, C = 0x421008;
const LEFT = 0x40101f, RIGHT = 0x401020;
function step(name, handled, calls, events = [], reentry = 0) {
  return { step: name, handled, calls, eip: events.at(-1) ?? 0xdecafbad, reentry, nested: 0,
    eax: 0, ebx: 0, esp: 0, events };
}
function checkReport(run, census, entries, extra = {}) {
  const { states, ...report } = run;
  assert.deepEqual(report, {
    census, entries: entries.sort((a, b) => a[0] - b[0]),
    durations: [], heartbeat: [], watch: [], firstWatch: [], timing: null, ...extra,
  });
}

test('generated dispatch preserves bodies, census, re-entry and diagnostic modes', async (t) => {
  const cases = runFixture(t);
  if (!cases) return;

  await t.test('colliding cache targets evict and refill without corrupting nested dispatch', () => {
    const events = [];
    const expected = [];
    const add = (name, handled, calls, appended = [], reentry = 0) => {
      events.push(...appended);
      expected.push(step(name, handled, calls, [...events], reentry));
    };
    add('zero-preinit', 0, 0, [], 0x0badf00d);
    add('known-preinit', 0, 0, [], 0x0badf00d);
    add('invalid-preinit', 0, 0, [], 0x0badf00d);
    add('a-fill', 1, 1, [1, 10]);
    add('empty-way', 0, 1);
    add('a-hit', 1, 2, [1, 10]);
    add('zero-warm', 0, 2);
    add('invalid-warm', 0, 2);
    add('unknown-warm', 0, 2);
    add('b-fill', 1, 3, [2]);
    add('c-fill', 1, 4, [3]);
    add('a-evicted', 0, 4);
    add('b-hit', 1, 5, [2]);
    add('c-hit', 1, 6, [3]);
    add('a-refill', 1, 7, [1, 10]);
    add('b-evicted', 0, 7);
    add('a-refill-hit', 1, 8, [1, 10]);
    add('c-survives', 1, 9, [3]);
    add('nested-collision', 1, 12, [1, 2, 3, 10]);
    add('outer-evicted', 0, 12);
    add('nested-b-hit', 1, 13, [2]);
    add('nested-c-hit', 1, 14, [3]);
    assert.deepEqual(cases.cache.states, expected);
    checkReport(cases.cache, [14, 0, 0, 8, 6], [[A, 5], [B, 4], [C, 5]]);
  });

  await t.test('entry and block boundaries preserve missing sentinels and opposite ownership precedence', () => {
    const events = [];
    const expected = [];
    const add = (name, handled, calls, appended = []) => {
      events.push(...appended);
      expected.push(step(name, handled, calls, [...events]));
    };
    ['zero', 'below-text', 'past-text', 'unsigned-max', 'return-past-text',
      'missing-in-first-page', 'before-left-entry', 'after-right-entry', 'absent-pages', 'last-text-byte']
      .forEach((name, index) => add(name, 0, index + 1));
    add('first-entry', 1, 11, [1, 10]);
    add('left-entry', 1, 12, [4]);
    add('right-entry', 1, 13, [5]);
    add('left-block', 1, 14, [107]);
    add('right-block', 1, 15, [108]);
    add('before-left-block', 0, 16);
    add('after-right-block', 0, 17);
    add('shared-entry', 1, 18, [2]);
    add('shared-cached-entry', 1, 19, [2]);
    add('shared-return', 1, 19, [102]);
    add('return-entry-fallback', 1, 20, [4]);
    add('return-left-block', 1, 20, [107]);
    add('return-right-block', 1, 20, [108]);
    add('return-absent-pages', 0, 21);
    assert.deepEqual(cases.lookup.states, expected);
    checkReport(cases.lookup, [21, 10, 5, 1, 5], [[A, 1], [LEFT, 2], [RIGHT, 1], [B, 2]]);
  });

  await t.test('each diagnostic independently disables caching and keeps exact entry counts', () => {
    for (const name of ['heartbeat', 'watch']) {
      assert.deepEqual(cases[name].states, [
        step('a', 1, 1, [1, 10]), step('cached-a', 0, 1, [1, 10]),
        step('b', 1, 2, [1, 10, 2]), step('a-again', 1, 3, [1, 10, 2, 1, 10]),
        step('cached-b', 0, 3, [1, 10, 2, 1, 10]), step('c', 1, 4, [1, 10, 2, 1, 10, 3]),
      ], name);
    }
    checkReport(cases.heartbeat, [4, 0, 0, 0, 0], [[A, 2], [B, 1], [C, 1]], {
      heartbeat: [[B, 2], [C, 4]],
    });
    checkReport(cases.watch, [4, 0, 0, 0, 0], [[A, 2], [B, 1], [C, 1]], {
      watch: [[A, 2], [B, 1], [A, 2], [C, 1], [LEFT, 0], [RIGHT, 0], [0x409999, 0], [0x409998, 0]],
      firstWatch: [[A, 1], [A, 1], [B, 2], [C, 4]],
    });
    assert.deepEqual(cases.time.states, [
      step('a', 1, 3, [1, 2, 3, 10]), step('cached-a', 0, 3, [1, 2, 3, 10]),
      step('b', 1, 4, [1, 2, 3, 10, 2]), step('a-again', 1, 5, [1, 2, 3, 10, 2, 1, 10]),
      step('cached-b', 0, 5, [1, 2, 3, 10, 2, 1, 10]), step('c', 1, 6, [1, 2, 3, 10, 2, 1, 10, 3]),
    ]);
    checkReport(cases.time, [6, 0, 0, 0, 0], [[A, 2], [B, 2], [C, 2]], {
      timing: [76, 6], durations: [[A, 36], [B, 16], [C, 24]],
    });
  });

  await t.test('modes resolve only at valid function entries and remain frozen afterward', () => {
    const before = [
      step('preinit-probe', 0, 0), step('preinit-outside', 0, 1), step('preinit-unknown', 0, 2),
      step('preinit-block', 1, 3, [107]), step('preinit-shared-return', 1, 3, [107, 102]),
      step('still-empty', 0, 3, [107, 102]), step('first-entry', 1, 4, [107, 102, 1, 10]),
    ];
    assert.deepEqual(cases['lazy-enabled'].states, [...before,
      step('cached-first', 0, 4, [107, 102, 1, 10]),
      step('frozen-modes', 1, 5, [107, 102, 1, 10, 2]),
      step('frozen-heartbeat', 1, 6, [107, 102, 1, 10, 2, 1, 10]),
    ]);
    checkReport(cases['lazy-enabled'], [6, 2, 1, 0, 0], [[A, 2], [B, 1]], {
      heartbeat: [[A, 4], [A, 6]], watch: [[A, 2], [B, 1]], firstWatch: [[A, 4], [B, 5]],
      timing: [20, 3], durations: [[A, 12], [B, 8]],
    });
    assert.deepEqual(cases['lazy-off'].states, [...before,
      step('cached-first', 1, 5, [107, 102, 1, 10, 1, 10]),
      step('frozen-modes', 1, 6, [107, 102, 1, 10, 1, 10, 2]),
      step('frozen-cache', 1, 7, [107, 102, 1, 10, 1, 10, 2, 2]),
    ]);
    checkReport(cases['lazy-off'], [7, 2, 1, 2, 2], [[A, 2], [B, 2]]);
  });

  await t.test('negative heartbeat is re-read until zero permits the fast transition', () => {
    assert.deepEqual(cases.negative.states, [
      step('negative-heartbeat', 1, 1, [1, 10]), step('negative-no-cache', 0, 1, [1, 10]),
      step('reread-zero', 1, 2, [1, 10, 2]), step('fast-b', 1, 3, [1, 10, 2, 2]),
      step('unfilled-a', 0, 3, [1, 10, 2, 2]), step('fill-a', 1, 4, [1, 10, 2, 2, 1, 10]),
      step('fast-a', 1, 5, [1, 10, 2, 2, 1, 10, 1, 10]),
      step('resolved-zero', 1, 6, [1, 10, 2, 2, 1, 10, 1, 10, 3]),
      step('fast-c', 1, 7, [1, 10, 2, 2, 1, 10, 1, 10, 3, 3]),
      step('a-survives', 1, 8, [1, 10, 2, 2, 1, 10, 1, 10, 3, 3, 1, 10]),
    ]);
    checkReport(cases.negative, [8, 0, 0, 4, 3], [[A, 4], [B, 2], [C, 2]]);
  });

  await t.test('wrapped entries stay public while continuations resume their original body in every cache mode', () => {
    for (const mode of ['cache', 'heartbeat', 'watch', 'time']) {
      const cached = mode === 'cache';
      const events = [];
      const expected = [];
      const add = (name, handled, calls, appended = []) => {
        events.push(...appended);
        expected.push(step(name, handled, calls, [...events]));
      };
      add('wrapped-preinit-return', 1, 0, [221]);
      add('preceding-thunk', 1, 1, [6]);
      add('wrapped-entry', 1, 2, [200, 210]);
      add('wrapped-cache-probe', cached ? 1 : 0, cached ? 3 : 2, cached ? [200, 210] : []);
      add('wrapped-return-entry', 1, cached ? 3 : 2, [213]);
      add('wrapped-return-continuation', 1, cached ? 3 : 2, [221]);
      add('wrapped-dispatch-continuation', 1, cached ? 4 : 3, [221]);
      add('wrapped-explicit-reentry', 1, cached ? 4 : 3, [228]);
      add('shared-first-owner', 1, cached ? 4 : 3, [102]);
      add('prototype-is-not-entry', 0, cached ? 5 : 4);
      const observed = cases[`wrapped-${mode}`];
      assert.deepEqual(observed.states, expected, mode);
      assert.deepEqual(observed.entries, [[0x4010f0, 1], [0x401200, cached ? 2 : 1]], mode);
      assert.deepEqual(observed.census, cached ? [5, 2, 0, 1, 2] : [4, 2, 0, 0, 0], mode);
    }
  });

  await t.test('real split continuations resume through the renamed trampoline across pending jumps', () => {
    for (const mode of ['cache', 'heartbeat', 'watch', 'time']) {
      const cached = mode === 'cache';
      const events = [];
      const expected = [];
      const add = (name, handled, calls, appended, eax, ebx, eip = 0x405678, esp = 0x8004) => {
        events.push(...appended);
        expected.push({ ...step(name, handled, calls, [...events]), eax, ebx, eip, esp });
      };
      add('split-preinit-return', 1, 0, [440, 420, 460], 142, 111);
      add('split-preceding-thunk', 1, 1, [390], 7, 9, 390, 0x8000);
      add('split-entry', 1, 2, [400, 410, 440, 420, 460], 145, 111);
      if (cached) add('split-cache-probe', 1, 3, [400, 410, 440, 420, 460], 145, 111);
      else add('split-cache-probe', 0, 2, [], 7, 9, 0xdecafbad, 0x8000);
      add('split-return-entry', 1, cached ? 3 : 2, [410, 440, 420, 460], 145, 111);
      add('split-return-left', 1, cached ? 3 : 2, [420, 460], 126, 109);
      add('split-dispatch-right', 1, cached ? 4 : 3, [440, 420, 460], 142, 111);
      add('split-return-ret', 1, cached ? 4 : 3, [460], 16, 9);
      const observed = cases[`split-${mode}`];
      assert.deepEqual(observed.states, expected, mode);
      assert.deepEqual(observed.entries, [[0x4013f0, 1], [0x401400, cached ? 2 : 1]], mode);
      assert.deepEqual(observed.census, cached ? [4, 1, 0, 1, 2] : [3, 1, 0, 0, 0], mode);
    }
  });
});
