// The MMX ops at their real width (lift_patches.apply_mmx64 + recomp_rt.c
// recomp_other64_*, round 124, issue 18 "endings play audio but video remains
// black"). The lifter's by-value CALLOTHER path cast every MMX operand to
// uint32_t, so lanes 2..3 of paddsw/pmulhw/psraw/... were lost; all 200 such
// sites are libtheora's MMX kernels, and every decoded video plane came out
// with two of every four bytes zero. The pass rewrites each site to the 64-bit
// helper; the helpers compute all four (eight) lanes.
// Parent command: node --test tests/recomp-mmx64.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const python = [process.env.PYTHON, 'python3', 'python'].find((path) => path
  && spawnSync(path, ['-B', '-c', 'import re'], { encoding: 'utf8', timeout: 10000 }).status === 0);
const cc = ['cc', 'gcc', 'clang'].find((c) => spawnSync(c, ['--version'], { encoding: 'utf8', timeout: 10000 }).status === 0);

// Two sites exactly as the lift emits them (0x00ae4630 and 0x00ae4bf0), one
// narrow 32-bit site of another op that must not move, and a declaration line.
const unit = [
  '#include "lifted_decls.h"',
  '',
  'void sub_00ae4630(CpuState *restrict s) {',
  '  recomp_wr64(&s->ST0[0], (uint64_t)recomp_other_psraw(s, (uint32_t)(recomp_rd64(&s->ST0[0])), (uint32_t)(((uint64_t)0x1ull))));',
  '  recomp_wr64(&s->ST4[0], (uint64_t)recomp_other_paddsw(s, (uint32_t)(recomp_rd64(&s->ST4[0])), (uint32_t)(u5300_8)));',
  '  u1_4 = (uint32_t)recomp_other_pmulhw(s, (uint32_t)(EAX), (uint32_t)(ECX));',
  '}',
  '',
].join('\n');

const probe = String.raw`
import json, sys, tempfile
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import lift_patches as L
unit = Path(sys.argv[2]).read_text()
out = {}
new, n = L.mmx64_text(unit)
again, n2 = L.mmx64_text(new)
out["text"] = {"n": n, "again": n2, "text": new}
try:
    L.mmx64_text("  x = (uint64_t)recomp_other_paddsw(s, (uint32_t)(A), B);\n"); out["refused"] = False
except SystemExit as e:
    out["refused"] = "unexpected site shape" in str(e)
with tempfile.TemporaryDirectory() as d:
    tu = Path(d) / "lifted_000.c"
    tu.write_text(unit)
    (Path(d) / "lifted_000.o").write_text("stale")
    check = len(L.apply_mmx64(Path(d), check_only=True))
    unchanged = tu.read_text() == unit
    first = len(L.apply_mmx64(Path(d)))
    text = tu.read_text()
    out["applied"] = {"check": check, "checkUnchanged": unchanged, "first": first, "twice": len(L.apply_mmx64(Path(d))),
                      "text": text, "objectDropped": not (Path(d) / "lifted_000.o").exists()}
# the state header the helpers compile against (the same generator the lift uses)
try:
    import pypcode
    from emit import gen_state_header
    from lift import RegMap
    hdr, _ = gen_state_header(RegMap(pypcode.Context("x86:LE:32:default")))
    Path(sys.argv[3]).write_text(hdr)
    out["stateHeader"] = True
except Exception as e:
    out["stateHeader"] = "no state header: %s" % e
print(json.dumps(out))
`;

// Expected lanes worked out from the SDM by hand, each case with a lane above
// bit 31 that the old 32-bit view lost.
const driver = String.raw`
#include <stdint.h>
#include <stdio.h>
#include <stddef.h>
#include "recomp_state.h"
#include "recomp_rt.h"
uint8_t *recomp_mem_base;
void isaac_dump_regs(const struct CpuState *s, const char *tag) { (void)s; (void)tag; }
const uint32_t g_dva[1] = { 0u };
const uint32_t g_ndispatch = 0u;
void isaac_stub_report(void) {}
uint64_t recomp_other64_paddsw(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_pmulhw(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_psraw(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_psllw(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_paddusb(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_psubusb(CpuState *restrict s, uint64_t a, uint64_t b);
uint64_t recomp_other64_packsswb(CpuState *restrict s, uint64_t a, uint64_t b);
#define P(name, a, b) printf("\"%s\": \"%016llx\",\n", #name, (unsigned long long)recomp_other64_##name(0, a, b))
#define Q(tag, name, a, b) printf("\"%s\": \"%016llx\",\n", tag, (unsigned long long)recomp_other64_##name(0, a, b))
int main(void) {
  printf("{\n");
  P(paddsw, 0x12340001801f7ff0ull, 0x1111ffffffe00020ull);
  P(pmulhw, 0xffff010080004000ull, 0x0002010080004000ull);
  P(psraw, 0x0100fff07fff8000ull, 4ull);
  Q("psraw_wide_count", psraw, 0x0100fff07fff8000ull, 0x100000000ull);
  P(psllw, 0xffff123400ff8001ull, 4ull);
  Q("psllw_16", psllw, 0xffff123400ff8001ull, 16ull);
  P(paddusb, 0xff800102030405feull, 0x0180000000000503ull);
  P(psubusb, 0xff800102030405feull, 0x017f0000000501ffull);
  P(packsswb, 0xfffb0005ff7f0080ull, 0x7fff00008000007full);
  printf("\"end\": 0\n}\n");
  return 0;
}
`;

let receipt;
function run(t) {
  if (!python) { t.skip('no Python'); return null; }
  if (!receipt) {
    const dir = mkdtempSync(join(tmpdir(), 'isaac-mmx64-'));
    try {
      writeFileSync(join(dir, 'probe.py'), probe);
      writeFileSync(join(dir, 'unit.c'), unit);
      const r = spawnSync(python, ['-B', join(dir, 'probe.py'), lift, join(dir, 'unit.c'), join(dir, 'recomp_state.h')], {
        encoding: 'utf8', timeout: 120000, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' },
      });
      assert.equal(r.status, 0, `${r.stdout}\n${r.stderr}`);
      receipt = JSON.parse(r.stdout.trim().split('\n').pop());
      receipt.lanes = null;
      if (receipt.stateHeader === true && cc) {
        writeFileSync(join(dir, 'driver.c'), driver);
        const exe = join(dir, process.platform === 'win32' ? 'lanes.exe' : 'lanes');
        const b = spawnSync(cc, ['-O1', '-DRECOMP_MEM_IDENTITY=0', '-I', dir, '-I', lift, join(dir, 'driver.c'),
          join(lift, 'recomp_rt.c'), '-lm', '-o', exe], { encoding: 'utf8', timeout: 120000 });
        assert.equal(b.status, 0, `${b.stdout}\n${b.stderr}`);
        assert.ok(existsSync(exe));
        const x = spawnSync(exe, [], { encoding: 'utf8', timeout: 30000 });
        assert.equal(x.status, 0, x.stderr);
        receipt.lanes = JSON.parse(x.stdout);
      }
    } finally { rmSync(dir, { recursive: true, force: true }); }
  }
  return receipt;
}

test('each 64-bit MMX site calls the 64-bit helper with uint64_t operands; a 32-bit site stays', (t) => {
  const r = run(t); if (!r) return;
  assert.equal(r.text.n, 2);
  assert.equal(r.text.again, 0, 'a second pass finds nothing');
  const text = r.text.text;
  assert.ok(text.includes('(uint64_t)recomp_other64_psraw(s, (uint64_t)(recomp_rd64(&s->ST0[0])), (uint64_t)(((uint64_t)0x1ull)))'), text);
  assert.ok(text.includes('(uint64_t)recomp_other64_paddsw(s, (uint64_t)(recomp_rd64(&s->ST4[0])), (uint64_t)(u5300_8))'), text);
  assert.ok(text.includes('u1_4 = (uint32_t)recomp_other_pmulhw(s, (uint32_t)(EAX), (uint32_t)(ECX));'), 'the 32-bit site is untouched');
  assert.equal(r.refused, true, 'an argument the pass does not recognise stops the build');
});

test('the pass on a lift dir: check reports without writing, apply declares once and drops the object', (t) => {
  const r = run(t); if (!r) return;
  const a = r.applied;
  assert.equal(a.check, 1);
  assert.equal(a.checkUnchanged, true);
  assert.equal(a.first, 1);
  assert.equal(a.twice, 0);
  assert.equal(a.objectDropped, true);
  assert.equal(a.text.split('LIFT-PATCH mmx64').length - 1, 1, 'one declaration block');
  assert.ok(a.text.indexOf('uint64_t recomp_other64_psraw(CpuState *restrict s, uint64_t a, uint64_t b);')
    > a.text.indexOf('#include "lifted_decls.h"'), 'declared after the decls include');
  assert.ok(a.text.indexOf('LIFT-PATCH mmx64') < a.text.indexOf('void sub_00ae4630'));
});

test('the 64-bit helpers compute every lane (the SDM, worked by hand)', (t) => {
  const r = run(t); if (!r) return;
  if (!r.lanes) { t.skip(`no native compiler or state header (${r.stateHeader})`); return; }
  const L = r.lanes;
  assert.equal(L.paddsw, '2345000080007fff', 'saturates both ways, lanes 2..3 kept');
  assert.equal(L.pmulhw, 'ffff000140001000');
  assert.equal(L.psraw, '0010ffff07fff800');
  assert.equal(L.psraw_wide_count, '0000ffff0000ffff', 'a count above 15 in the high dword fills with the sign');
  assert.equal(L.psllw, 'fff023400ff00010');
  assert.equal(L.psllw_16, '0000000000000000', 'a count of 16 clears every lane');
  assert.equal(L.paddusb, 'ffff010203040aff', 'eight byte lanes, saturating at 0xff');
  assert.equal(L.psubusb, 'fe01010203000400', 'eight byte lanes, saturating at 0');
  assert.equal(L.packsswb, '7f00807ffb05807f');
});
