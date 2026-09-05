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

function patchesIn(startMarker, endMarker) {
  const lp = readFileSync(join(lift, 'lift_patches.py'), 'utf8');
  const a = lp.indexOf(startMarker);
  const b = lp.indexOf(endMarker, a);
  assert.ok(a > 0 && b > a, `${startMarker} block found`);
  const block = lp.slice(a, b);
  const out = [];
  for (const m of block.matchAll(/^\s*(0x[0-9a-f]{8}): """([\s\S]*?)^""",/gm)) {
    out.push({ va: m[1], body: m[2] });
  }
  return out;
}
// the fastpath wrappers stop where the probe table starts: they are different
// categories with different contracts (round 23)
const wrapPatches = () => patchesIn('WRAP_PATCHES: dict', 'PROBE_PATCHES: dict');
const probePatches = () => patchesIn('PROBE_PATCHES: dict', 'def apply_wrap_patches');

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
    // the host path must end with the callee's ret: pop EIP, ESP += 4 (+ the
    // callee's own purge for a `ret N`, spelled `4u + Nu`)
    const ret = /s->EIP = MEMR32\(s->ESP\);\s*\n\s*s->ESP \+= 4u(?: \+ \d+u)?;\s*\n}\s*$/;
    assert.match(body, ret, `${name}: host path ends with the ret emulation (pop EIP, ESP += 4 [+ purge])`);
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

// the body of a host function: from its definition line (not a declaration or
// a call -- the round-27 functions call one another) to the closing brace
function hostBody(src, fn) {
  const m = src.match(new RegExp(`^[a-z0-9_ *]*\\b${fn}\\([^)]*\\) \\{`, 'm'));
  assert.ok(m, `${fn} defined in host_fastpath.c`);
  return src.slice(m.index, src.indexOf('\n}\n', m.index));
}

test('host_fastpath.c: bounds-checked guest access and the verify counter', () => {
  const fast = readFileSync(join(hostSrc, 'host_fastpath.c'), 'utf8');
  for (const fn of ['isaac_fast_unfilter', 'isaac_fast_adler32', 'isaac_fast_premultiply', 'isaac_fast_pathhash']) {
    assert.ok(hostBody(fast, fn).includes('isaac_is_guest_va('), `${fn}: checks its guest range before touching memory`);
  }
  // round 27: the deciding predicates check the ranges; the workers they gate
  // (keystream_xor, read_window, mutex_take/drop) run only behind them
  for (const fn of ['isaac_fast_guest_range', 'isaac_fast_isaac', 'isaac_fast_keystream_ok', 'isaac_fast_read_plan',
                    'isaac_fast_mutex_std']) {
    assert.match(hostBody(fast, fn), /isaac_is_guest_va\(|isaac_fast_guest_range\(/,
      `${fn}: checks its guest range before touching memory`);
  }
  assert.ok(hostBody(fast, 'isaac_fast_guest_range').includes('va + len >= va'),
    'guest_range: a range that wraps around the address space is rejected');
  assert.ok(fast.includes('uint32_t isaac_fastpath_mismatches(void)'), 'mismatch counter exported');
  assert.ok(/getenv\("ISAAC_FASTPATH"\)/.test(fast) && /getenv\("ISAAC_FASTPATH_VERIFY"\)/.test(fast),
    'mode switches documented in the env');
});

// Round 27: the leaves of the fast profile's dispatch census (recomp-
// architecture.md 21.42). Two rules on top of the round-12 contract: the host
// path's purge equals the callee's `ret N` (a wrong purge is the one-slot
// stack drift again), and a verify path runs the trampoline after the lifted
// body, because these bodies end in tail jumps -- the ISAAC core's jump-table
// cases, AddRef's jump into Unlock -- that are only parked when the body
// returns, so a compare without it would read the state mid-function.
const ROUND27 = {
  '0x00aa94a0': { purge: 0, host: 'isaac_fast_isaac' },            // ISAAC core: thiscall, no args
  '0x00a89d70': { purge: 8, host: 'isaac_fast_keystream_xor' },    // keystream XOR: thiscall (buf, len)
  '0x00a69510': { purge: 12, host: 'isaac_fast_read_window' },     // ArchivedFile::read: thiscall (buf, size, count)
  '0x00a157f0': { purge: 4, host: 'isaac_fast_mutex_take' },       // Mutex::Lock(timeout)
  '0x00a159a0': { purge: 0, host: 'isaac_fast_mutex_drop' },       // Mutex::Unlock
  '0x0040c690': { purge: 0, host: 'isaac_fast_mutex_take' },       // handle AddRef
  '0x0040c6b0': { purge: 0, host: 'isaac_fast_mutex_take' },       // handle TryAddRef
  '0x0040c630': { purge: 0, host: 'isaac_fast_mutex_take' },       // handle Release
  '0x00a12240': { purge: 0, host: 'isaac_fast_mutex_take' },       // owner check: cdecl(holder)
};

test('round 27 wrappers: present, purge = ret N, verify runs the trampoline, host work behind the decision', () => {
  const patches = new Map(wrapPatches().map((p) => [p.va, p.body]));
  for (const [va, { purge, host }] of Object.entries(ROUND27)) {
    const body = patches.get(va);
    assert.ok(body, `${va}: wrapped`);
    const tail = purge ? `s->ESP += 4u + ${purge}u;` : 's->ESP += 4u;';
    assert.ok(body.trimEnd().endsWith(`${tail}\n}`), `${va}: the host path pops the return address and ${purge} bytes of arguments`);
    assert.match(body, /__lifted\(s\);\s*\n\s*if \(recomp_jmp_pending\) recomp_run_pending\(s\);/,
      `${va}: the verify path runs the parked tail jump before comparing`);
    assert.equal((body.match(/isaac_fastpath_mode\(\)/g) || []).length, 1, `${va}: the mode is read once`);
    // the exit census (isaac_fastpath_report): every lifted fallback and every
    // completed verify compare is counted, so "0 mismatches" comes with the
    // number of calls that were actually compared
    const short = va.slice(2).replace(/^0+/, '');
    for (const m of body.matchAll(/__lifted\(s\); return; \}/g)) {
      const line = body.slice(body.lastIndexOf('\n', m.index), m.index);
      assert.ok(line.includes(`isaac_fastpath_count(0x${short}u, 1);`), `${va}: each lifted fallback is counted`);
    }
    assert.match(body, new RegExp(`recomp_run_pending\\(s\\);[^\\n]*\\n\\s*isaac_fastpath_count\\(0x${short}u, 2\\);`),
      `${va}: a completed verify compare is counted`);
    // the host worker runs only after the mode test: never before the wrapper
    // has decided against the lifted body
    const decide = body.indexOf('__lifted(s); return; }');
    const work = body.indexOf(`${host}(`);
    assert.ok(decide > 0 && work > decide, `${va}: ${host} runs only after the lifted-body decision`);
  }
});

test('round 27: the lock-based wrappers take a mutex only through the standard-pair predicate', () => {
  const patches = new Map(wrapPatches().map((p) => [p.va, p.body]));
  for (const va of ['0x0040c690', '0x0040c6b0', '0x0040c630', '0x00a12240']) {
    const body = patches.get(va);
    assert.ok(body.includes('isaac_fast_mutex_std('), `${va}: checks the embedded mutex's vtable is the engine's Lock/Unlock pair`);
    // every take is matched by a drop on the host path
    assert.equal((body.match(/isaac_fast_mutex_take\(/g) || []).length, (body.match(/isaac_fast_mutex_drop\(/g) || []).length,
      `${va}: lock and unlock in equal number`);
  }
  const lock = patches.get('0x00a157f0');
  assert.ok(lock.includes('timeout != 0xffffffffu') && lock.includes('isaac_fast_mutex_free('),
    'Lock: only the uncontended INFINITE wait is taken on the host');
});

// Round 23: observe-only probes. The dispatch watch can only see functions
// reached through the dispatcher, and the audio investigation kept needing the
// other question -- did this directly called function run, and with what?
// A probe answers it, and its contract is the opposite of a fastpath wrapper's:
// it must NOT emulate the ret, because the lifted body it always calls does
// that itself, and it must not depend on the fastpath mode.
test('PROBE_PATCHES: every probe delegates once and leaves the guest untouched', () => {
  for (const { va, body } of probePatches()) {
    const name = `sub_${va.slice(2)}`;
    assert.ok(body.startsWith(`void ${name}(CpuState *restrict s) {`), `${name}: wrapper signature`);
    assert.ok(body.includes(`RECOMP_VA(0x${va.slice(2).replace(/^0+/, '')}u);`), `${name}: stamps its VA`);
    assert.equal((body.match(new RegExp(`${name}__lifted\\(s\\)`, 'g')) || []).length, 1,
      `${name}: calls the lifted body exactly once`);
    assert.ok(!/s->EIP\s*=/.test(body), `${name}: a probe must not touch EIP -- the lifted body owns the ret`);
    assert.ok(!/s->ESP\s*(\+|-)?=/.test(body), `${name}: a probe must not touch ESP`);
    assert.ok(body.includes('isaac_probe_on()'), `${name}: logging is off unless ISAAC_PROBE=1`);
  }
});

test('the probe helpers exist where lifted code can reach them', () => {
  const fast = readFileSync(join(hostSrc, 'host_fastpath.c'), 'utf8');
  const rt = readFileSync(join(lift, 'recomp_rt.h'), 'utf8');
  for (const fn of ['isaac_probe_on', 'isaac_probe_hit', 'isaac_probe_str']) {
    assert.match(fast, new RegExp(`^[a-z0-9_ ]*\\b${fn}\\(`, 'm'), `${fn}: defined in host_fastpath.c`);
    assert.ok(rt.includes(`${fn}(`), `${fn}: declared in recomp_rt.h`);
  }
});

test('round 38: the dispatcher has a direct-mapped cache in front of its index, tried before the shim check, off under any dispatch mode', () => {
  const gen = readFileSync(join(root, 'scripts', 'recomp', 'lift', 'mkdispatch.py'), 'utf8');
  assert.ok(gen.includes('int isaac_lifted_dispatch_cached(uint32_t va, CpuState *restrict cpu) {'), 'the cached entry exists');
  assert.ok(gen.includes('if (!g_dfast || !va) return 0;') && gen.includes('else return 0;'), 'a miss, a mode, or a null target falls through');
  assert.ok(gen.includes('  ++g_dcalls; ++g_dchits;\n  g_dcount[id]++;\n  g_dfn[id](cpu);\n  return 1;'), 'a hit still counts (the census stays exact)');
  assert.ok(gen.includes('typedef struct { uint32_t va[2]; uint16_t id[2]; uint8_t next; } dcache_set;'), 'two ways per set');
  assert.ok(gen.includes('cache %u hits / %u fills'), 'the census reports the hit rate');
  assert.ok(gen.includes('if (!g_dfast && g_hb_every == 0 && g_watch_n == 0 && g_dtime_on == 0 && g_dcount) g_dfast = 1;'),
    'the cache turns on only when heartbeat, watch and timing are all off');
  assert.ok(gen.includes("c->va[w] = va; c->id[w] = id; c->next = (uint8_t)(w ^ 1u);"), 'a resolved function entry fills the older way');
  const trap = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_trap.c'), 'utf8');
  assert.ok(/void recomp_call_indirect\(CpuState \*restrict s, uint32_t target\) \{\s*if \(isaac_lifted_dispatch_cached\(target, s\)\)\s*return;\s*if \(isaac_indirect_call\(target, s\)\)/.test(trap),
    'the indirect call tries the cache before the shim check');
  assert.ok(trap.includes('__attribute__((weak)) int isaac_lifted_dispatch_cached('), 'a weak fallback keeps the host linking without the lifted module');
});
