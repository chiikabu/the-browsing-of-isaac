/**
 * Wide (SSE) p-code lowering differential.
 *
 * scripts/recomp/oracle/wideops.py lifts ONE x86 instruction at a time with
 * the real lifter, compiles it against the real recomp_rt.c, and diffs the
 * result against Unicorn over random XMM inputs.  Whole-function replay
 * cannot do this: the functions that motivated these lowerings all call
 * other functions, so a mismatch there never names the instruction.
 *
 * The list deliberately includes controls (paddd/pxor/pand/movdqa) whose
 * lowerings the boot already exercises: if the harness itself breaks, they
 * go red too, so a green run cannot mean "nothing was actually compared".
 *
 * SKIPS (does not fail) without the game binary, unicorn, or a native C
 * compiler -- tools/ is gitignored and absent on a source-only checkout.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const harness = join(root, 'scripts', 'recomp', 'oracle', 'wideops.py');
const resultPath = join(root, 'output', 'recomp', 'oracle', 'wideops.json');

const PYTHONS = [
  join(process.env.LOCALAPPDATA ?? '', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
  'python3',
  'python',
];

function findPython() {
  for (const p of PYTHONS) {
    if (!p) continue;
    const r = spawnSync(p, ['-c', 'import unicorn, pypcode'], { stdio: 'pipe' });
    if (r.status === 0) return p;
  }
  return null;
}

test('lifted SSE instructions match Unicorn one instruction at a time', (t) => {
  const python = findPython();
  if (!python) {
    t.skip('no python with unicorn+pypcode available');
    return;
  }

  const run = spawnSync(python, [harness], {
    cwd: root,
    encoding: 'utf8',
    stdio: 'pipe',
    timeout: 15 * 60 * 1000,
    env: { ...process.env, WIDEOPS_N: '200' },
  });
  assert.equal(run.status, 0,
    `wideops.py exited ${run.status}\n${run.stdout}\n${run.stderr}`);

  const res = JSON.parse(readFileSync(resultPath, 'utf8'));
  if (res.skipped) {
    t.skip(res.skipped);
    return;
  }

  assert.equal(res.vectors_per_case, 200);
  assert.deepEqual(res.failed_cases, [],
    `lifted instructions disagreed with hardware:\n${JSON.stringify(res, null, 1)}`);

  const byName = new Map(res.cases.map((c) => [c.name, c]));
  // Every case must have actually run its vectors; a case that errored out
  // early would otherwise pass the failed_cases check with pass === 0.
  for (const c of res.cases) {
    assert.equal(c.pass, res.vectors_per_case, `${c.name} ran ${c.pass} vectors`);
    assert.equal(c.fail, 0, `${c.name} had ${c.fail} mismatches`);
  }

  // The lowerings this file exists to pin, named so a deletion is visible.
  for (const name of ['pshuflw', 'pshufhw', 'psrad', 'pslld', 'psllq', 'pandn']) {
    assert.ok(byName.has(name), `case ${name} disappeared from the harness`);
  }
  // Controls: if these ever go missing the run proves much less.
  for (const name of ['paddd', 'pxor', 'pand', 'movdqa']) {
    assert.ok(byName.has(name), `control ${name} disappeared from the harness`);
  }
});
