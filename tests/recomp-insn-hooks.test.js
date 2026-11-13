// The REPENTOGON layer's instruction hooks (lift_patches.apply_insn_hooks,
// round 110): a hook is a block of C right after one instruction's RECOMP_VA
// marker (and its label), spilling exactly the function's register locals,
// with one goto per allowed target; it is idempotent, replaced when its entry
// changes, removed byte-for-byte when the entry goes, carried through the
// wrapper and the split of giants, and every way of naming a wrong place is a
// build error. host_rgon.c refuses a redirect the C has no label for.
// Parent command: node --test tests/recomp-insn-hooks.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const host = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_rgon.c'), 'utf8');
const python = [process.env.PYTHON, 'python3', 'python'].find((path) => path
  && spawnSync(path, ['-B', '-c', 'import re'], { encoding: 'utf8', timeout: 10000 }).status === 0);

// Every scenario runs in one Python process over temporary lift dirs and
// prints one JSON object.
const probe = String.raw`
import json, sys, tempfile, shutil
from pathlib import Path
sys.dont_write_bytecode = True
sys.path.insert(0, sys.argv[1])
import lift_patches as L
import split_giants as G

FN = "\n".join([
  "void sub_00401000(CpuState *restrict s) {",
  "  uint32_t EAX = s->EAX;",
  "  uint32_t ESP = s->ESP;",
  "  uint32_t EIP = s->EIP;",
  "  uint8_t ZF = s->ZF;",
  "  uint32_t u1 = 0;",
  "  (void)0;",
  "  RECOMP_VA(0x401000u);",
  "  EAX = 1u;",
  "  RECOMP_VA(0x401005u);",
  "L_00401005: ;",
  "  EAX = 2u;",
  "  RECOMP_VA(0x40100au);",
  "  ZF = 1u;",
  "  RECOMP_VA(0x40100cu);",
  "L_0040100c: ;",
  "  s->EAX = EAX;",
  "}",
  "",
])
OTHER = "void sub_00402000(CpuState *restrict s) {\n  uint32_t EAX = s->EAX;\n  (void)0;\n  RECOMP_VA(0x402000u);\n}\n"
H = (170, 0x00401000, 0x00401005, "Test::f@a", (0x0040100c,))
out = {}

def tree(text, extra=None, crlf=False):
    d = Path(tempfile.mkdtemp(prefix="insn-"))
    t = text.replace("\n", "\r\n") if crlf else text
    (d / "lifted_000.c").write_bytes(t.encode())
    (d / "lifted_001.c").write_bytes((extra or OTHER).encode())
    return d

def read(d):
    return (d / "lifted_000.c").read_bytes().decode()

def err(text, hooks, extra=None):
    d = tree(text, extra)
    try:
        L.apply_insn_hooks(d, hooks=hooks)
        return None
    except SystemExit as e:
        return str(e)
    finally:
        shutil.rmtree(d)

# install, then again, then a check run
d = tree(FN)
out["first"] = [p.name for p in L.apply_insn_hooks(d, hooks=[H])]
out["installed"] = read(d)
out["second"] = [p.name for p in L.apply_insn_hooks(d, hooks=[H])]
out["check"] = [p.name for p in L.apply_insn_hooks(d, hooks=[H], check_only=True)]
out["stable"] = read(d) == out["installed"]
# a changed entry is replaced (one block), a removed one leaves the function as it was
L.apply_insn_hooks(d, hooks=[(170, 0x00401000, 0x00401005, "Test::f@renamed", ())])
out["renamed"] = read(d)
out["retire_check"] = [p.name for p in L.apply_insn_hooks(d, hooks=[], check_only=True)]
L.apply_insn_hooks(d, hooks=[])
out["retired_equal"] = read(d) == FN
shutil.rmtree(d)
# no label after the marker: the block follows the marker itself
d = tree(FN)
L.apply_insn_hooks(d, hooks=[(171, 0x00401000, 0x0040100a, "Test::f@b", ())])
out["nolabel"] = read(d)
shutil.rmtree(d)
# CRLF stays CRLF
d = tree(FN, crlf=True)
L.apply_insn_hooks(d, hooks=[H])
raw = (d / "lifted_000.c").read_bytes()
out["crlf_bare_lf"] = raw.replace(b"\r\n", b"").count(b"\n")
L.apply_insn_hooks(d, hooks=[])
out["crlf_retired_equal"] = raw != (d / "lifted_000.c").read_bytes() and (d / "lifted_000.c").read_bytes() == FN.replace("\n", "\r\n").encode()
shutil.rmtree(d)
# a wrapped function: the hook goes into the lifted body, not the wrapper
WR = FN.replace("void sub_00401000(", "void sub_00401000__lifted(") + "void sub_00401000(CpuState *restrict s) {\n  RECOMP_VA(0x401000u);\n  sub_00401000__lifted(s);\n}\n"
d = tree(WR)
L.apply_insn_hooks(d, hooks=[H])
w = read(d)
out["wrapped_in_body"] = w.index("LIFT-PATCH insn 0x00401005") < w.index("void sub_00401000(CpuState")
shutil.rmtree(d)
# the split of a giant: the target in another part is reached the split's way, and a second run is stable
d = tree(FN)
L.apply_insn_hooks(d, hooks=[H])
split, done, skipped = G.split_text(read(d), 5, 3)
out["split_done"] = len(done)
(d / "lifted_000.c").write_bytes(split.encode())
out["split_text"] = split
out["split_again"] = [p.name for p in L.apply_insn_hooks(d, hooks=[H])]
out["split_stable"] = read(d) == split
shutil.rmtree(d)
# hooked after the split: the cut left the marker at the end of one part and the label at the head of the next
d = tree(FN)
split0, _, _ = G.split_text(FN, 5, 3)
(d / "lifted_000.c").write_bytes(split0.encode())
L.apply_insn_hooks(d, hooks=[H])
out["split_first"] = read(d)
shutil.rmtree(d)
# the label before the marker (the lifter's order after a call): the block follows the marker
LF_FIRST = FN.replace("  RECOMP_VA(0x40100cu);\nL_0040100c: ;", "L_0040100c: ;\n  RECOMP_VA(0x40100cu);")
d = tree(LF_FIRST)
L.apply_insn_hooks(d, hooks=[(173, 0x00401000, 0x0040100c, "Test::f@c", (0x00401005,))])
out["label_first"] = read(d)
shutil.rmtree(d)
# build errors
out["errors"] = {
  "no_marker": err(FN, [(170, 0x00401000, 0x00401007, "Test::f@x", ())]),
  "no_label": err(FN, [(170, 0x00401000, 0x00401005, "Test::f@a", (0x0040100a,))]),
  "no_function": err(FN, [(170, 0x00403000, 0x00403005, "Test::g@a", ())]),
  "two_tus": err(FN, [H], extra=FN),
  "marker_twice": err(FN.replace("  ZF = 1u;", "  RECOMP_VA(0x401005u);\n  ZF = 1u;"), [H]),
  "slot_of_function_hook": err(FN, [(0, 0x00401000, 0x00401005, "Test::f@a", ())]),
  "slot_twice": err(FN, [H, (170, 0x00401000, 0x0040100a, "Test::f@b", ())]),
  "address_twice": err(FN, [H, (172, 0x00401000, 0x00401005, "Test::f@b", ())]),
  "entry": err(FN, [(170, 0x00401000, 0x00401000, "Test::f@entry", ())]),
  "slot_range": err(FN, [(192, 0x00401000, 0x00401005, "Test::f@a", ())]),
}
# apply_lift_patches (what build_boot.py and --check run) carries the shipped table: on a tree without
# its functions that is a build error, not a silent skip
d = tree(FN)
try:
    L.apply_lift_patches(d)
    out["wired"] = None
except SystemExit as e:
    out["wired"] = str(e)
shutil.rmtree(d)
# the shipped table passes its own rules
L.check_insn_table()
out["table"] = [list(h[:4]) + [list(h[4])] for h in L.RGON_INSN_HOOKS]
out["function_slots"] = [s for s, _, _ in L.RGON_HOOKS]
print(json.dumps(out))
`;

let result;
function run(t) {
  if (!python) { t.skip('no Python'); return null; }
  if (!result) {
    const r = spawnSync(python, ['-B', '-c', probe, lift], { encoding: 'utf8', timeout: 120000 });
    assert.equal(r.status, 0, r.stderr);
    result = JSON.parse(r.stdout.trim().split('\n').pop());
  }
  return result;
}

test('a hook goes right after its instruction marker and label, spills only the register locals, and jumps only to its targets', (t) => {
  const o = run(t); if (!o) return;
  assert.deepEqual(o.first, ['lifted_000.c']);
  const text = o.installed;
  const at = text.indexOf('L_00401005: ;\n  /* LIFT-PATCH insn 0x00401005 slot 170 begin: Test::f@a');
  assert.ok(at > 0, 'after the label that follows the marker');
  const block = text.slice(at, text.indexOf('/* LIFT-PATCH insn 0x00401005 end */'));
  assert.ok(block.includes('if (g_rgon_hook_on[170]) {'), 'the one-byte test first');
  assert.ok(block.includes('s->EAX = EAX; s->ESP = ESP;') && block.includes('EAX = s->EAX; ESP = s->ESP;'), 'spill and reload');
  assert.ok(!/EIP|ZF/.test(block), 'neither EIP (call-slim) nor the flags');
  assert.ok(block.includes('static const uint32_t rgon_to[] = { 0x40100cu, 0u };'));
  assert.ok(block.includes('isaac_rgon_insn_hook(170, s, 0x401005u, rgon_to);'));
  assert.ok(block.includes('if (rgon_go == 0x40100cu) goto L_0040100c;'));
  assert.ok(text.indexOf('end */\n  EAX = 2u;') > at, 'the instruction itself follows the block');
});

test('idempotent; a changed entry is replaced, a removed one leaves the function byte for byte', (t) => {
  const o = run(t); if (!o) return;
  assert.deepEqual(o.second, []);
  assert.deepEqual(o.check, []);
  assert.equal(o.stable, true);
  assert.equal((o.renamed.match(/LIFT-PATCH insn 0x00401005 slot/g) || []).length, 1);
  assert.ok(o.renamed.includes('Test::f@renamed') && !o.renamed.includes('Test::f@a') && !o.renamed.includes('goto'));
  assert.deepEqual(o.retire_check, ['lifted_000.c'], 'a check run reports a block no entry asks for');
  assert.equal(o.retired_equal, true);
});

test('with no label after the marker the block follows the marker; CRLF stays CRLF', (t) => {
  const o = run(t); if (!o) return;
  assert.ok(o.nolabel.includes('  RECOMP_VA(0x40100au);\n  /* LIFT-PATCH insn 0x0040100a slot 171 begin'));
  assert.equal(o.crlf_bare_lf, 0);
  assert.equal(o.crlf_retired_equal, true);
});

test('a wrapped function gets the hook in its lifted body; a split one keeps it, reaching a target in another part the split way', (t) => {
  const o = run(t); if (!o) return;
  assert.equal(o.wrapped_in_body, true);
  assert.equal(o.split_done, 1);
  assert.match(o.split_text, /if \(rgon_go == 0x40100cu\) \{ s->EAX = EAX; s->ESP = ESP; s->EIP = EIP; s->ZF = ZF; sub_00401000__next = 0x0040100cu; sub_00401000__pend = 1u; return; \}/);
  assert.deepEqual(o.split_again, [], 'the pass reads the split form as its own');
  assert.equal(o.split_stable, true);
  // hooked after the split: in the part the label heads, not after the marker the cut left behind
  const p1 = o.split_first.indexOf('sub_00401000__p1(');
  const blk = o.split_first.indexOf('/* LIFT-PATCH insn 0x00401005 slot 170 begin');
  assert.ok(p1 > 0 && blk > p1 && o.split_first.indexOf('L_00401005: ;\n  /* LIFT-PATCH insn 0x00401005') > p1, 'after the label, in its part');
  assert.match(o.split_first, /if \(rgon_go == 0x40100cu\) \{ s->EAX = EAX; s->ESP = ESP; s->EIP = EIP; s->ZF = ZF; sub_00401000__next = 0x0040100cu;/);
});

test('when the label comes before the marker the block follows the marker, and a jump back is a goto', (t) => {
  const o = run(t); if (!o) return;
  assert.ok(o.label_first.includes('L_0040100c: ;\n  RECOMP_VA(0x40100cu);\n  /* LIFT-PATCH insn 0x0040100c slot 173 begin'));
  assert.ok(o.label_first.includes('if (rgon_go == 0x401005u) goto L_00401005;'));
});

test('every wrong place is a build error', (t) => {
  const o = run(t); if (!o) return;
  const e = o.errors;
  assert.match(e.no_marker, /RECOMP_VA\(0x401007u\) occurs 0 time/);
  assert.match(e.no_label, /target 0x0040100a has no label/);
  assert.match(e.no_function, /sub_00403000 is in 0 TU/);
  assert.match(e.two_tus, /sub_00401000 is in 2 TU/);
  assert.match(e.marker_twice, /occurs 2 time/);
  assert.match(e.slot_of_function_hook, /slot 0 is a function hook's/);
  assert.match(e.slot_twice, /both on slot 170/);
  assert.match(e.address_twice, /both at 0x00401005/);
  assert.match(e.entry, /function's entry/);
  assert.match(e.slot_range, /outside 0\.\.191/);
});

test('apply_lift_patches runs the instruction hooks: a tree without the hooked functions stops the build', (t) => {
  const o = run(t); if (!o) return;
  assert.match(o.wired || '', /insn hook Entity_Player::EvaluateItems@TearsUp: sub_00763570 is in 0 TU/);
});

test('the shipped table: slots past the function hooks, below the host count, each in the function it names', (t) => {
  const o = run(t); if (!o) return;
  const max = Number(/#define RGON_HOOKS (\d+)/.exec(host)[1]);
  const fn = new Set(o.function_slots);
  assert.ok(o.table.length >= 6);
  for (const [slot, fva, iva, name, targets] of o.table) {
    assert.ok(slot >= 160 && slot < max && !fn.has(slot), `${name}: slot ${slot}`);
    assert.ok(iva > fva, `${name}: inside its function`);
    for (const x of targets) assert.ok(x > fva, `${name}: target 0x${x.toString(16)}`);
  }
  const slots = readFileSync(join(root, 'scripts', 'recomp', 'rgon', 'hook_slots.lua'), 'utf8');
  for (const [slot, , iva, name] of o.table) {
    assert.ok(slots.includes(`["${name}"] = { ${slot}, false, 0x${iva.toString(16).padStart(8, '0')} },`), `hook_slots.lua has ${name}`);
  }
});

test('host_rgon.c: the handler runs on the hook\'s CpuState and a redirect is taken only when the C lists it', () => {
  const fn = host.slice(host.indexOf('uint32_t isaac_rgon_insn_hook('), host.indexOf('void isaac_rgon_report(void) {\n    if'));
  assert.ok(fn.includes('g_hook_cpu = s;') && fn.includes('g_hook_cpu = outer;'));
  assert.match(fn, /for \(const uint32_t \*t = to; want && \*t; \+\+t\)\s+if \(\*t == want\) \{ go = want; break; \}/);
  assert.match(host, /\{"reg", l_reg\}/);
  assert.match(host, /if \(i == 4\) return luaL_error\(L, "rgon: esp cannot be set from a handler"\);/);
  assert.match(host, /lua_setfield\(L, -2, "INSN"\);/);
  assert.match(host, /uint32_t isaac_rgon_insn_hook\(int slot, CpuState \*restrict s, uint32_t va, const uint32_t \*to\) \{ \(void\)slot;/, 'the no-Lua build links it too');
});
