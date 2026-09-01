/**
 * Ground-truth oracle (scripts/recomp/oracle) regression test.
 *
 * The oracle emulates the real x86 of tools/isaac-ng.unpacked.exe under
 * Unicorn and diffs the result against work that is already known-correct:
 *
 *   A  MT19937 core inside Isaac::genrand_int32 (0x006eef60) vs the reference
 *      mt19937ar sequence for seed 5489 -- ground truth from OUTSIDE this
 *      repository, so it validates the emulator and not just self-consistency.
 *   B  std::string tidy 0x0040d040 vs frameOpaque40d040TidyPlan.
 *   C  std::map lower_bound 0x00685bc0 vs exitMapLowerBound.
 *
 * The test SKIPS (does not fail) when the game binary, the python venv or
 * unicorn is unavailable, because tools/ is gitignored and absent on a clean
 * source-only checkout.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exe = join(root, 'tools', 'isaac-ng.unpacked.exe');
const verify = join(root, 'scripts', 'recomp', 'oracle', 'verify.py');
const resultPath = join(root, 'output', 'recomp', 'oracle', 'verify.json');

const PYTHONS = [
  join(process.env.LOCALAPPDATA ?? '', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3',
  'python',
];

function findPython() {
  for (const p of PYTHONS) {
    if (!p) continue;
    const r = spawnSync(p, ['-c', 'import unicorn, capstone'], { stdio: 'pipe' });
    if (r.status === 0) return p;
  }
  return null;
}

test('recomp oracle agrees with the hand-verified translations', (t) => {
  if (!existsSync(exe)) {
    t.skip('tools/isaac-ng.unpacked.exe not present (gitignored)');
    return;
  }
  const python = findPython();
  if (!python) {
    t.skip('no python with unicorn+capstone available');
    return;
  }

  const run = spawnSync(python, [verify], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 15 * 60 * 1000,
  });
  assert.equal(run.status, 0,
    `verify.py exited ${run.status}\n${run.stdout}\n${run.stderr}`);

  const results = JSON.parse(readFileSync(resultPath, 'utf8'));
  assert.equal(results.length, 3, 'expected three independent checks');

  for (const r of results) {
    assert.ok(r.ok, `oracle disagreed with known-correct work: ${r.name}\n` +
      JSON.stringify(r, null, 1));
  }

  const mt = results.find((r) => r.name.includes('mt19937'));
  assert.ok(mt, 'mt19937 check missing');
  // Canonical first output of MT19937 seeded with 5489.
  assert.equal(mt.first_8_oracle[0], '0xd091bb5c');
  assert.deepEqual(mt.first_8_oracle, mt.first_8_reference);
  assert.equal(mt.pure_vectors, mt.n,
    'every MT19937 draw must be a pure (stub-free, fault-free) vector');

  const lb = results.find((r) => r.name.includes('685bc0'));
  assert.equal(lb.mismatches, 0);
  assert.equal(lb.pure_vectors, lb.n);
  assert.equal(lb.block_coverage, '12/12',
    'lower_bound vectors should cover every static basic block');

  const tidy = results.find((r) => r.name.includes('40d040'));
  assert.equal(tidy.mismatches, 0);
  // All four control-flow paths must actually be exercised, otherwise a
  // green result would only mean "we never tried the hard cases".
  for (const path of ['sso', 'small-free', 'aligned-free', 'invalid']) {
    assert.ok(tidy.path_coverage[path] > 0, `path ${path} never exercised`);
  }
});

test('oracle api serves ground-truth vectors on a stable contract', (t) => {
  if (!existsSync(exe)) {
    t.skip('tools/isaac-ng.unpacked.exe not present (gitignored)');
    return;
  }
  const python = findPython();
  if (!python) {
    t.skip('no python with unicorn+capstone available');
    return;
  }
  const api = join(root, 'scripts', 'recomp', 'oracle', 'api.py');

  // hand-spec path: must be fully pure and fully covering
  const run = spawnSync(python,
    [api, '--va', '0x00685bc0', '--n', '100', '--pure-only'],
    { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 10 * 60 * 1000 });
  assert.equal(run.status, 0, `api.py exited ${run.status}\n${run.stderr}`);
  const res = JSON.parse(run.stdout);

  assert.equal(res.source, 'hand-spec');
  assert.equal(res.coverage_pct, 100);
  assert.equal(res.pure, 100);
  assert.equal(res.n_vectors, 100, '--pure-only must drop nothing here');

  // the consumer-facing schema the lifter depends on
  const v = res.vectors[0];
  for (const k of ['i', 'cc', 'in', 'out', 'writes', 'calls', 'term',
    'fault', 'stubs', 'models', 'blocks', 'pure', 'pure_modulo_models']) {
    assert.ok(k in v, `vector missing required key ${k}`);
  }
  for (const k of ['eax', 'edx', 'ecx', 'esp_delta', 'eflags']) {
    assert.ok(k in v.out, `vector.out missing ${k}`);
  }
  assert.ok(Array.isArray(v.in.stack));
  // thiscall with `ret 8`: the callee pops the return address and both args
  assert.equal(v.out.esp_delta, 12);

  // Full entry register state must be published, otherwise a consumer cannot
  // check callee-saved registers at all: the expected output of EBX/ESI/EDI/
  // EBP *is* the entry value. Starting them at zero makes every
  // register-preserving function mismatch and traps [EBP-N] dereferences.
  for (const reg of ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi', 'ebp', 'esp']) {
    assert.equal(typeof v.in.regs[reg], 'number',
      `in.regs.${reg} must be published`);
  }
  assert.equal(typeof v.in.eflags, 'number');
  assert.equal(v.in.regs.ebp, v.in.regs.esp, 'EBP starts equal to ESP');
  assert.equal(v.in.regs.ecx, v.in.ecx, 'in.regs.ecx must agree with in.ecx');
  // this function preserves all four callee-saved registers
  for (const vec of res.vectors) {
    for (const reg of ['ebx', 'esi', 'edi', 'ebp']) {
      assert.equal(vec.out[reg], vec.in.regs[reg],
        `callee-saved ${reg} not recoverable from in.regs`);
    }
  }

  // every vector handed out under --pure-only really is ground truth
  for (const vec of res.vectors) {
    assert.equal(vec.pure, true);
    assert.equal(vec.stubs.length, 0);
    assert.equal(vec.models.length, 0);
    assert.equal(vec.fault, null);
    assert.equal(vec.term, 'ret');
  }

  // autospec path: no hand-written spec involved at all
  const auto = spawnSync(python,
    [api, '--va', '0x00423480', '--n', '40', '--source', 'autospec',
      '--summary-only'],
    { cwd: root, encoding: 'utf8', stdio: 'pipe', timeout: 10 * 60 * 1000 });
  assert.equal(auto.status, 0, `api.py autospec exited ${auto.status}\n${auto.stderr}`);
  const ares = JSON.parse(auto.stdout);
  assert.equal(ares.source, 'autospec');
  assert.ok(ares.pure > 0,
    'fault-driven layout discovery produced no pure vectors');
});
