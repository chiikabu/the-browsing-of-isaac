// The call-slim pass (lift_patches.apply_call_slim, round 96): the EIP and
// FS_OFFSET spill/reload lines leave every call site, nothing else moves, and
// a lifted line that uses either register any other way stops the build.
// Parent command: node --test tests/recomp-call-slim.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const python = [process.env.PYTHON, 'python3', 'python'].find((path) => path
  && spawnSync(path, ['-B', '-c', 'import re'], { encoding: 'utf8', timeout: 10000 }).status === 0);

// A call site as the lifter emits it, the re-entry reload, a continuation
// one-liner, an fs: address, a ret and a host-import return.
const unit = [
  'void sub_00401000(CpuState *restrict s) {',
  '  uint32_t EBX = s->EBX;',
  '  uint32_t ESP = s->ESP;',
  '  uint32_t FS_OFFSET = s->FS_OFFSET;',
  '  uint32_t EIP = s->EIP;',
  '  if (g_reentry_eip != 0u) {',
  '    EBX = s->EBX;',
  '    FS_OFFSET = s->FS_OFFSET;',
  '    EIP = s->EIP;',
  '  }',
  '  u9100_4 = (uint32_t)(FS_OFFSET + ((uint32_t)0x0u));',
  '  s->EBX = EBX;',
  '  s->ESP = ESP;',
  '  s->FS_OFFSET = FS_OFFSET;',
  '  s->EIP = EIP;',
  '  sub_00402000(s); if (recomp_jmp_pending) recomp_run_pending(s);',
  '  EBX = s->EBX;',
  '  ESP = s->ESP;',
  '  FS_OFFSET = s->FS_OFFSET;',
  '  EIP = s->EIP;',
  '  imp_X(s);',
  '  s->EIP = MEMR32(s->ESP);',
  '  { s->EBX = EBX; s->FS_OFFSET = FS_OFFSET; s->EIP = EIP; sub_00401000__next = 0x401010u; sub_00401000__pend = 1u; return; }',
  '  EIP = MEMR32(ESP);',
  '  s->EBX = EBX; /* EIP stays */',
  '}',
  '',
].join('\n');

const probe = String.raw`
import json, sys, tempfile
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import lift_patches as L
unit = Path(sys.argv[2]).read_bytes()
out = {}
for tag, text in (("lf", unit), ("crlf", unit.replace(b"\n", b"\r\n"))):
    slim, n = L.slim_call_text(text)
    again, n2 = L.slim_call_text(slim)
    out[tag] = {"n": n, "again": n2, "text": slim.decode(), "violations": [v.decode() for v in L.slim_violations(text)]}
bad = {}
for name, line in (("fs_write", b"  FS_OFFSET = EAX;\n"), ("eip_read", b"  u1_4 = EIP + 4u;\n"),
                   ("eip_call", b"  recomp_jump_indirect(s, EIP); return;\n"), ("fs_other", b"  u1_4 = FS_OFFSET * 2u;\n"),
                   ("comment", b"  /* EIP and FS_OFFSET are spill-only */\n")):
    bad[name] = len(L.slim_violations(unit + line))
out["bad"] = bad
with tempfile.TemporaryDirectory() as d:
    tu = Path(d) / "lifted_000.c"
    tu.write_bytes(unit)
    touched = L.apply_call_slim(Path(d))
    out["applied"] = {"touched": len(touched), "text": tu.read_bytes().decode(), "twice": len(L.apply_call_slim(Path(d)))}
    tu.write_bytes(unit + b"  FS_OFFSET = EAX;\n")
    try:
        L.apply_call_slim(Path(d)); out["refused"] = False
    except SystemExit as e:
        out["refused"] = "FS_OFFSET = EAX" in str(e)
    out["refusedUnchanged"] = tu.read_bytes() == unit + b"  FS_OFFSET = EAX;\n"
# round 101: the ret's own store, which the replay after a longjmp or a catch reads
ret = {}
for tag, text in (("lf", unit), ("crlf", unit.replace(b"\n", b"\r\n"))):
    slim, _ = L.slim_call_text(text)
    fixed, n = L.ret_eip_text(slim)
    again, n2 = L.ret_eip_text(fixed)
    reslim, n3 = L.slim_call_text(fixed)
    ret[tag] = {"missingBefore": L.ret_eip_missing(slim), "n": n, "again": n2, "missingAfter": L.ret_eip_missing(fixed),
                "text": fixed.decode(), "slimTakes": n3, "violations": [v.decode() for v in L.slim_violations(fixed)]}
with tempfile.TemporaryDirectory() as d:
    tu = Path(d) / "lifted_000.c"
    tu.write_bytes(unit)
    L.apply_call_slim(Path(d))
    first = len(L.apply_ret_eip(Path(d)))
    ret["applied"] = {"first": first, "text": tu.read_bytes().decode(), "twice": len(L.apply_ret_eip(Path(d))),
                      "check": len(L.apply_ret_eip(Path(d), check_only=True))}
    tu.write_bytes(L.slim_call_text(unit)[0])
    ret["checkOnly"] = {"reported": len(L.apply_ret_eip(Path(d), check_only=True)), "unchanged": tu.read_bytes() == L.slim_call_text(unit)[0]}
out["ret"] = ret
print(json.dumps(out))
`;

let receipt;
function run(t) {
  if (!python) { t.skip('no Python'); return null; }
  if (!receipt) {
    const dir = mkdtempSync(join(tmpdir(), 'isaac-call-slim-'));
    try {
      writeFileSync(join(dir, 'probe.py'), probe);
      writeFileSync(join(dir, 'unit.c'), unit);
      const r = spawnSync(python, ['-B', join(dir, 'probe.py'), lift, join(dir, 'unit.c')], {
        encoding: 'utf8', timeout: 60000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1', ISAAC_CALL_SLIM: '' },
      });
      assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
      receipt = JSON.parse(r.stdout.trim().split('\n').pop());
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  return receipt;
}

const lines = (text) => text.split(/\r?\n/);
const standalone = (text, stmt) => lines(text).filter((l) => l.trim() === stmt).length;

test('every standalone EIP/FS_OFFSET spill and reload goes, LF and CRLF alike', (t) => {
  const r = run(t); if (!r) return;
  for (const tag of ['lf', 'crlf']) {
    assert.equal(r[tag].n, 6, tag);
    for (const stmt of ['s->EIP = EIP;', 'EIP = s->EIP;', 's->FS_OFFSET = FS_OFFSET;', 'FS_OFFSET = s->FS_OFFSET;'])
      assert.equal(standalone(r[tag].text, stmt), 0, `${tag}: ${stmt}`);
    assert.equal(r[tag].again, 0, `${tag}: a second pass finds nothing`);
  }
  assert.ok(lines(r.crlf.text).length > 1 && r.crlf.text.includes('\r\n') && !/[^\r]\n/.test(r.crlf.text), 'CRLF kept');
});

test('nothing else moves: other registers, declarations, one-liners, rets, fs: addresses', (t) => {
  const r = run(t); if (!r) return;
  const kept = r.lf.text;
  assert.equal(lines(kept).length, lines(unit).length - 6);
  for (const stmt of ['s->EBX = EBX;', 'EBX = s->EBX;', 's->ESP = ESP;', 'ESP = s->ESP;'])
    assert.equal(standalone(kept, stmt), standalone(unit, stmt), stmt);
  for (const keep of ['  uint32_t FS_OFFSET = s->FS_OFFSET;', '  uint32_t EIP = s->EIP;', '  EIP = MEMR32(ESP);',
    '  s->EIP = MEMR32(s->ESP);', 's->FS_OFFSET = FS_OFFSET; s->EIP = EIP; sub_00401000__next',
    '(uint32_t)(FS_OFFSET + ((uint32_t)0x0u))', '  s->EBX = EBX; /* EIP stays */'])
    assert.ok(kept.includes(keep), keep);
  assert.deepEqual(r.lf.violations, []);
});

test('a lifted line that uses either register otherwise is a violation', (t) => {
  const r = run(t); if (!r) return;
  assert.deepEqual(r.bad, { fs_write: 1, eip_read: 1, eip_call: 1, fs_other: 1, comment: 0 });
});

test('apply_call_slim rewrites in place once, and refuses a violating tree untouched', (t) => {
  const r = run(t); if (!r) return;
  assert.equal(r.applied.touched, 1);
  assert.equal(r.applied.text, r.lf.text);
  assert.equal(r.applied.twice, 0);
  assert.equal(r.refused, true);
  assert.equal(r.refusedUnchanged, true);
});

// Round 101. The replay loop in isaac_guest_call_inner dispatches cpu->EIP after
// every frame it re-enters, so a ret has to leave its return address in CpuState.
// Call-slim took that store away with the call-site spills, and a caught Lua
// error then resumed once and ran garbage (releases 14 to 18).
test('a ret stores its return address into CpuState again, on its own line, once', (t) => {
  const r = run(t); if (!r) return;
  for (const tag of ['lf', 'crlf']) {
    const x = r.ret[tag];
    assert.equal(x.missingBefore, 1, `${tag}: call-slim leaves the ret without its store`);
    assert.equal(x.n, 1, tag);
    assert.equal(x.again, 0, `${tag}: a second pass finds nothing`);
    assert.equal(x.missingAfter, 0, tag);
    assert.ok(x.text.includes('  EIP = MEMR32(ESP); s->EIP = EIP;'), `${tag}: the store is on the ret's line`);
    assert.equal(x.slimTakes, 0, `${tag}: call-slim does not take it back`);
    assert.deepEqual(x.violations, [], tag);
    // the direct form already stores it and stays as it is
    assert.equal(lines(x.text).filter((l) => l.trim() === 's->EIP = MEMR32(s->ESP);').length, 1, tag);
  }
  assert.ok(r.ret.crlf.text.includes('s->EIP = EIP;\r\n'), 'CRLF kept');
});

test('apply_ret_eip rewrites in place once; --check reports and leaves the tree alone', (t) => {
  const r = run(t); if (!r) return;
  assert.equal(r.ret.applied.first, 1);
  assert.equal(r.ret.applied.text, r.ret.lf.text);
  assert.equal(r.ret.applied.twice, 0);
  assert.equal(r.ret.applied.check, 0);
  assert.equal(r.ret.checkOnly.reported, 1);
  assert.equal(r.ret.checkOnly.unchanged, true);
});
