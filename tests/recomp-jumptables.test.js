// Jump-table recovery in the lifter (scripts/recomp/lift/jumptables.py).
// Round 14b: a `cmp esi, 2 / je` on the way to `jmp [esi*4 + 0x9b1210]` was
// taken as the table bound, the fourth case was never emitted, and the game
// ran off the lifted table into an unlifted address while generating the
// Basement. The bound must be a real range guard (cmp on the index register
// followed by an unsigned jcc); otherwise the table is walked to the end of
// the function. The check runs the classifier on the binary itself, so it
// only runs where the tools/ tree is present (never committed).
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const exe = join(root, 'tools', 'isaac-ng.unpacked.exe');

test('jumptables: a bare cmp before the jump is not a table bound', () => {
  const src = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'jumptables.py'), 'utf8');
  assert.ok(src.includes('GUARD_JCC'), 'the guard-jcc rule exists');
  assert.ok(/def _bound_before\(self, va, body_addrs, idx_reg=0\)/.test(src), 'the bound takes the index register');
  assert.ok(src.includes('self._bound_before(va, body_addrs, idx_reg)'), 'classify passes the index register');
});

test('jumptables: the Basement generator switch at 0x009b0d7b recovers all four cases (needs tools/)', () => {
  if (!existsSync(exe)) return;
  const py = [
    'import sys, capstone',
    `sys.path.insert(0, ${JSON.stringify(join(root, 'scripts', 'recomp', 'lift'))})`,
    'from pe import PE32',
    'from jumptables import JumpTables',
    `pe = PE32(${JSON.stringify(exe)})`,
    'jt = JumpTables(pe)',
    'md = capstone.Cs(capstone.CS_ARCH_X86, capstone.CS_MODE_32)',
    'body = []',
    'for ins in md.disasm(pe.read(0x009b0d40, 0x50), 0x009b0d40):',
    '    body.append(ins.address)',
    '    if ins.address >= 0x009b0d7b: break',
    'kind, targets = jt.classify(0x009b0d7b, body, 0x009b0b00, 0x009b120e)',
    'print(kind, " ".join(hex(t) for t in targets))',
  ].join('\n');
  const r = spawnSync('python', ['-c', py], { encoding: 'utf8', cwd: root });
  assert.equal(r.status, 0, `python failed: ${r.stderr}`);
  assert.equal(r.stdout.trim(), 'table 0x9b0d82 0x9b0f26 0x9b0f5d 0x9b0f8a');
});

test('lifter: data in the code stream ends the path, not the function (needs tools/)', () => {
  if (!existsSync(exe)) return;
  // 0x006261f0 absorbs the jump table at 0x0062a838 through a fall-through after a
  // noreturn call; before round 14c the whole function failed with SLEIGH's
  // BadDataError. 0x0081516d decodes table bytes as `lds` ("load size 6") at emit
  // time and is lowered as a trap at that instruction instead.
  const { mkdtempSync, rmSync } = require('node:fs');
  const os = require('node:os');
  const out = mkdtempSync(join(os.tmpdir(), 'isaac-softstop-'));
  try {
    const args = ['scripts/recomp/lift/emit.py', '--exe', exe,
      '--ghidra-functions', 'output/recomp/export/functions.jsonl',
      '--fragments-tsv', 'output/recomp/export/recovered-functions.tsv',
      '--imports', 'output/recomp/census/imports.json',
      '--shim-table', 'output/recomp/host/shim-table.json',
      '--va', '0x006261f0', '--va', '0x0081516d',
      '--hand-written', 'scripts/recomp/host/src/missing_fns.c',
      '--dispatch', 'auto', '--trace-va', '--max-insns', '100000',
      '--out', out, '--module', 'lifted', '--stats', join(out, 'stats.json')];
    if (!existsSync(join(root, 'output', 'recomp', 'export', 'functions.jsonl'))) return;
    const r = spawnSync('python', args, { encoding: 'utf8', cwd: root, timeout: 600000 });
    assert.equal(r.status, 0, `emit failed: ${r.stderr.slice(-800)}`);
    const summary = JSON.parse(readFileSync(join(out, 'summary.json'), 'utf8'));
    assert.equal(summary.failed, 0, 'both functions lift');
    assert.ok(summary.data_stops >= 1, 'the jump-table bytes are recorded as a data stop');
    const c = readFileSync(join(out, 'lifted.c'), 'utf8');
    assert.ok(c.includes('void sub_006261f0(') && c.includes('void sub_0081516d('), 'both bodies emitted');
    assert.ok(c.includes('recomp_unreachable(s, 0x8151bcu); return;'), 'the undecodable instruction became a trap');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});
