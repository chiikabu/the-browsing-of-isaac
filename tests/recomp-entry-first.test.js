// Execute the public entry-first pass on an isolated CRLF translation unit.
// The Wasm uses the generated SLEIGH CpuState and production recomp runtime.
// Parent command: node --test tests/recomp-entry-first.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const python = [
  process.env.PYTHON,
  process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3', 'python',
].find((path) => path && spawnSync(path, ['-B', '-c', 'import capstone, pypcode'], {
  encoding: 'utf8', timeout: 10000,
}).status === 0);

let receipt;
function runFixture(t, execution = true) {
  if (!python) {
    t.skip('no Python with capstone+pypcode available');
    return null;
  }
  if (!receipt) {
    const temporary = mkdtempSync(join(tmpdir(), 'isaac-entry-first-'));
    try {
      const script = join(temporary, 'fixture.py');
      writeFileSync(script, fixtureProbe);
      const result = spawnSync(python, ['-B', script, lift, process.execPath], {
        cwd: root, encoding: 'utf8', timeout: 240000,
        env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', PYTHONHASHSEED: '0' },
      });
      assert.equal(result.status, 0,
        result.error?.message || `Python exited ${result.status}\n${result.stdout}\n${result.stderr}`);
      receipt = JSON.parse(result.stdout);
    } finally {
      rmSync(temporary, { recursive: true, force: true });
    }
  }
  if (execution && receipt.skipExecution) {
    t.skip(receipt.skipExecution);
    return null;
  }
  return receipt;
}

const fixtureProbe = String.raw`
import hashlib, json, os, subprocess, sys, tempfile
from pathlib import Path
import pypcode

sys.dont_write_bytecode = True
lift = Path(sys.argv[1])
node = sys.argv[2]
sys.path.insert(0, str(lift))
from build_boot import ensure_emsdk_env, find_emcc
from emit import gen_state_header
from lift import LANG, RegMap

# Address-ordered blocks put the shared epilogue before the original entry.
# Both paths spill the local EAX and perform a real guest return.
unit = r'''
#include "lifted_decls.h"

void sub_00a27038(CpuState *restrict s) {
  uint32_t EAX = s->EAX;
  if (g_reentry_eip != 0u) {
    uint32_t _rva = g_reentry_eip;
    g_reentry_eip = 0u;
    switch (_rva) {
    case 0x00a2706fu: goto L_00a2706f;
    default: break;
    }
  }
  (void)0;
  RECOMP_VA(0xa2701bu);
L_00a2701b: ;
  s->EAX = EAX + 7u;
  s->EDI += 1u;
  s->EDX = 0x00a2701bu;
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
  return;
  RECOMP_VA(0xa27038u);
  EAX = 0x11110000u;
  s->EBX = 0x22220000u;
  s->ECX = 0x00a27038u;
  goto L_00a2701b;
  RECOMP_VA(0xa2706fu);
L_00a2706f: ;
  EAX = 0x33330000u;
  s->ECX = 0x00a2706fu;
  goto L_00a2701b;
}

void sub_00a27138(CpuState *restrict s) {
  uint32_t EAX = s->EAX;
  if (g_reentry_eip != 0u) {
    uint32_t _rva = g_reentry_eip;
    g_reentry_eip = 0u;
    switch (_rva) {
    case 0x00a2716fu: goto L_00a2716f;
    default: break;
    }
  }
  (void)0;
  goto L_00a27138; /* A producer may describe this jump however it likes. */
  RECOMP_VA(0xa2711bu);
L_00a2711b: ;
  s->EAX = EAX + 3u;
  s->EDI += 2u;
  s->EDX = 0x00a2711bu;
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4u;
  return;
  RECOMP_VA(0xa27138u);
L_00a27138: ;
  EAX = 0x44440000u;
  s->ECX = 0x00a27138u;
  goto L_00a2711b;
  RECOMP_VA(0xa2716fu);
L_00a2716f: ;
  EAX = 0x55550000u;
  s->ECX = 0x00a2716fu;
  goto L_00a2711b;
}

'''.lstrip().replace('\n', '\r\n')

driver = r'''
#include "lifted_decls.h"
uint32_t g_reentry_eip;

void fixture_run(uint32_t which, uint32_t input, uint32_t reentry, uint32_t *out) {
  CpuState cpu = {0};
  cpu.EAX = input;
  cpu.EBX = 0x11223344u;
  cpu.EDI = 9u;
  cpu.ESP = 0x30000u;
  MEMW32(cpu.ESP, 0xfaceb00cu);
  g_reentry_eip = reentry;
  switch (which) {
  case 0: sub_00a27038(&cpu); break;
  case 1: sub_00a27138(&cpu); break;
  default: abort();
  }
  uint32_t fields[] = { cpu.EAX, cpu.EBX, cpu.ECX, cpu.EDX, cpu.EDI,
    cpu.ESP, cpu.EIP, g_reentry_eip, MEMR32(0x30000u) };
  memcpy(out, fields, sizeof(fields));
}
'''

runner = r'''
import { pathToFileURL } from 'node:url';
const { default: create } = await import(pathToFileURL(process.argv[2]));
const module = await create();
const out = module._malloc(36);
try {
  const scenarios = {
    entry: [0, 5, 0],
    reentry: [0, 5, 0x00a2706f],
    unknownReentry: [0, 5, 0xdeadbeef],
    emitterEntry: [1, 5, 0],
    emitterReentry: [1, 5, 0x00a2716f],
  };
  const result = {};
  for (const [name, args] of Object.entries(scenarios)) {
    module._fixture_run(...args, out);
    result[name] = Array.from(module.HEAPU32.subarray(out >>> 2, (out >>> 2) + 9));
  }
  console.log(JSON.stringify(result));
} finally {
  module._free(out);
}
'''

ensure_emsdk_env()
emcc = find_emcc()
env = dict(os.environ, PYTHONDONTWRITEBYTECODE='1', PYTHONHASHSEED='0')
for key in list(env):
    if key.startswith('ISAAC_'):
        del env[key]

def run(args, allowed=(0,), timeout=60):
    result = subprocess.run([str(arg) for arg in args], env=env, text=True,
                            capture_output=True, timeout=timeout)
    if result.returncode not in allowed:
        raise RuntimeError('command failed: ' + repr(args) + '\n' + result.stdout + result.stderr)
    return result

with tempfile.TemporaryDirectory(prefix='isaac-entry-first-wasm-') as temporary:
    directory = Path(temporary)
    tu = directory / 'lifted_000.c'
    tu.write_bytes(unit.encode('utf-8'))
    header, _ = gen_state_header(RegMap(pypcode.Context(LANG)))
    (directory / 'recomp_state.h').write_text(header)
    declarations = '#include "recomp_state.h"\n#include "recomp_rt.h"\n'
    declarations += ''.join('void sub_%08x(CpuState *restrict s);\n' % va
                           for va in (0xa27038, 0xa27138))
    (directory / 'lifted_decls.h').write_text(declarations)
    source = directory / 'fixture.c'
    source.write_text(driver)
    script = directory / 'run.mjs'
    script.write_text(runner)

    def execute(name):
        module = directory / (name + '.mjs')
        run([emcc, source, tu, lift / 'recomp_rt.c', '-O1', '-std=gnu11',
             '-ffunction-sections', '-fdata-sections', '-Wl,--gc-sections',
             '-DRECOMP_MEM_IDENTITY=1', '-I', directory, '-I', lift,
             '--no-entry', '-sENVIRONMENT=node', '-sMODULARIZE=1', '-sEXPORT_ES6=1',
             '-sSINGLE_FILE=1', '-sGLOBAL_BASE=16777216', '-sINITIAL_MEMORY=33554432',
             '-sSTACK_SIZE=1048576', '-sERROR_ON_UNDEFINED_SYMBOLS=1',
             '-sEXPORTED_FUNCTIONS=["_fixture_run","_malloc","_free"]',
             '-sEXPORTED_RUNTIME_METHODS=HEAPU8,HEAPU32', '-o', module], timeout=90)
        return json.loads(run([node, script, module]).stdout)

    result = {}
    if emcc is None:
        result['skipExecution'] = 'Emscripten emcc unavailable; set EMCC or EMSDK'
    else:
        result['before'] = execute('before')
    original = tu.read_bytes()
    command = [sys.executable, '-B', lift / 'lift_patches.py', '--dir', directory, '--entry-first']
    pending = run(command + ['--check'], allowed=(0, 1))
    result['pendingCheck'] = pending.returncode
    result['pendingReadOnly'] = tu.read_bytes() == original
    result['firstApply'] = run(command).returncode
    applied = tu.read_bytes()
    if emcc is not None:
        result['after'] = execute('after')
    result['secondApply'] = run(command).returncode
    result['appliedDigest'] = hashlib.sha256(applied).hexdigest()
    result['secondDigest'] = hashlib.sha256(tu.read_bytes()).hexdigest()
    result['fixedCheck'] = run(command + ['--check'], allowed=(0, 1)).returncode
    result['fixedReadOnly'] = tu.read_bytes() == applied
    print(json.dumps(result))
`;

const EBX = 0x11223344;
const STACK = 0x30000;
const RETURN = 0xfaceb00c;
function state(eax, ecx, edx, edi = 9, ebx = EBX) {
  return [eax, ebx, ecx, edx, edi, STACK + 4, RETURN, 0, RETURN];
}

test('entry-first executes original entry before a lower shared epilogue', (t) => {
  const result = runFixture(t);
  if (!result) return;
  const premature = state(12, 0, 0x00a2701b, 10);
  const correct = state(0x11110007, 0x00a27038, 0x00a2701b, 10, 0x22220000);
  assert.deepEqual(result.before.entry, premature, 'unpatched entry falls into the lower epilogue');
  assert.deepEqual(result.after.entry, correct, 'entry computes its marker before one shared epilogue and guest return');
  assert.deepEqual(result.before.unknownReentry, premature);
  assert.deepEqual(result.after.unknownReentry, correct, 'unknown reentry is consumed and falls back to the original entry');
});

test('entry-first preserves explicit reentry and emitter gotos with arbitrary comments', (t) => {
  const result = runFixture(t);
  if (!result) return;
  const reentry = state(0x33330007, 0x00a2706f, 0x00a2701b, 10);
  const emitterEntry = state(0x44440003, 0x00a27138, 0x00a2711b, 11);
  const emitterReentry = state(0x55550003, 0x00a2716f, 0x00a2711b, 11);
  for (const phase of ['before', 'after']) {
    assert.deepEqual(result[phase].reentry, reentry, `${phase}: reentry bypasses the entry's EBX overwrite`);
    assert.deepEqual(result[phase].emitterEntry, emitterEntry, `${phase}: existing producer jump executes entry`);
    assert.deepEqual(result[phase].emitterReentry, emitterReentry, `${phase}: existing producer reentry remains distinct`);
  }
});

test('--check remains read-only and entry-first application is byte-idempotent', (t) => {
  const result = runFixture(t, false);
  if (!result) return;
  assert.equal(result.pendingCheck, 1, 'pending repair returns exit 1');
  assert.equal(result.pendingReadOnly, true, 'pending check preserves original CRLF artifact bytes');
  assert.equal(result.firstApply, 0);
  assert.equal(result.secondApply, 0);
  assert.equal(result.secondDigest, result.appliedDigest, 'second application preserves artifact bytes');
  assert.equal(result.fixedCheck, 0, 'applied repair returns exit 0');
  assert.equal(result.fixedReadOnly, true, 'fixed check preserves applied artifact bytes');
});
