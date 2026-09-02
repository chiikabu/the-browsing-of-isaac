// Host fastpath (recomp boot round 12d): the three deterministic leaf
// functions that dominated the boot (PNG unfilter, adler32, premultiply) are
// re-implemented on the host and installed by lift_patches.py WRAP_PATCHES as
// wrappers around the lifted bodies. A wrapper owns the callee's `ret`; one
// that forgets to pop the return address is the one-slot stack drift the
// project keeps meeting (AGENTS.md), so the contract is pinned here:
//   - every wrapper keeps the lifted body reachable (ISAAC_FASTPATH=0),
//   - consults isaac_fastpath_mode() (0 lifted / 1 host / 2 verify),
//   - ends the host path with the exact ret emulation,
//   - calls a host function that host_fastpath.c defines and recomp_rt.h
//     declares, and the verify path reports through isaac_fastpath_mismatch.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lift = join(root, 'scripts', 'recomp', 'lift');
const hostSrc = join(root, 'scripts', 'recomp', 'host', 'src');

function wrapPatches() {
  const lp = readFileSync(join(lift, 'lift_patches.py'), 'utf8');
  const a = lp.indexOf('WRAP_PATCHES: dict');
  const b = lp.indexOf('def apply_wrap_patches');
  assert.ok(a > 0 && b > a, 'WRAP_PATCHES block found');
  const block = lp.slice(a, b);
  const out = [];
  for (const m of block.matchAll(/^\s*(0x[0-9a-f]{8}): """([\s\S]*?)^""",/gm)) {
    out.push({ va: m[1], body: m[2] });
  }
  return out;
}

test('WRAP_PATCHES: every wrapper keeps the lifted body, consults the mode, and owns the ret', () => {
  const patches = wrapPatches();
  assert.ok(patches.length >= 3, `expected the three round-12 wrap patches, parsed ${patches.length}`);
  const fast = readFileSync(join(hostSrc, 'host_fastpath.c'), 'utf8');
  const rt = readFileSync(join(lift, 'recomp_rt.h'), 'utf8');
  for (const { va, body } of patches) {
    const name = `sub_${va.slice(2)}`;
    assert.ok(body.startsWith(`void ${name}(CpuState *restrict s) {`), `${name}: wrapper signature`);
    assert.ok(body.includes(`RECOMP_VA(0x${va.slice(2).replace(/^0+/, '')}u);`), `${name}: stamps its VA`);
    assert.ok(body.includes(`${name}__lifted(s)`), `${name}: lifted body reachable (ISAAC_FASTPATH=0)`);
    assert.ok(body.includes('isaac_fastpath_mode()'), `${name}: consults the fastpath mode`);
    assert.ok(body.includes('isaac_fastpath_mismatch('), `${name}: verify path reports mismatches`);
    // the host path must end with the callee's ret: pop EIP, ESP += 4
    const ret = /s->EIP = MEMR32\(s->ESP\);\s*\n\s*s->ESP \+= 4u;\s*\n}\s*$/;
    assert.match(body, ret, `${name}: host path ends with the ret emulation (pop EIP, ESP += 4)`);
    // the lifted fallback returns without touching the stack (the lifted
    // body performs its own ret)
    for (const m of body.matchAll(/__lifted\(s\);\s*(return;)?/g)) {
      assert.ok(m[1] || /__lifted\(s\);\s*\n\s*if \(/.test(body.slice(m.index)),
        `${name}: after the lifted body the wrapper must return or compare, never ret again`);
    }
    // each host function called is defined in host_fastpath.c and declared in recomp_rt.h
    const calls = new Set([...body.matchAll(/\b(isaac_fast_[a-z0-9_]+)\(/g)].map((m) => m[1]));
    assert.ok(calls.size >= 1, `${name}: calls a host fastpath function`);
    for (const fn of calls) {
      assert.match(fast, new RegExp(`^[a-z0-9_ ]*\\b${fn}\\(`, 'm'), `${fn}: defined in host_fastpath.c`);
      assert.ok(rt.includes(`${fn}(`), `${fn}: declared in recomp_rt.h for the lifted TUs`);
    }
  }
});

test('WRAP_PATCHES target lifted functions (when the lift output is present)', () => {
  const tbl = join(root, 'output', 'recomp', 'lift', 'gu', 'dispatch_tbl.c');
  if (!existsSync(tbl)) return;   // binary-derived output is not in the tree
  const text = readFileSync(tbl, 'utf8');
  for (const { va } of wrapPatches()) {
    const name = `sub_${va.slice(2)}`;
    assert.ok(text.includes(name), `${name}: present in the dispatch table`);
  }
});

test('host_fastpath.c: bounds-checked guest access and the verify counter', () => {
  const fast = readFileSync(join(hostSrc, 'host_fastpath.c'), 'utf8');
  for (const fn of ['isaac_fast_unfilter', 'isaac_fast_adler32', 'isaac_fast_premultiply']) {
    const a = fast.indexOf(`${fn}(`);
    assert.ok(a > 0, `${fn} defined`);
    const bodyEnd = fast.indexOf('\n}\n', a);
    const body = fast.slice(a, bodyEnd);
    assert.ok(body.includes('isaac_is_guest_va('), `${fn}: checks its guest range before touching memory`);
  }
  assert.ok(fast.includes('uint32_t isaac_fastpath_mismatches(void)'), 'mismatch counter exported');
  assert.ok(/getenv\("ISAAC_FASTPATH"\)/.test(fast) && /getenv\("ISAAC_FASTPATH_VERIFY"\)/.test(fast),
    'mode switches documented in the env');
});
