// The REPENTOGON-compatible layer (round 102), as far as it can be checked
// without a game: the hook slots the Lua layer names are the ones the lift
// wraps, each wrapper is the shape host_rgon.c expects, and the mod archive
// carries the layer, REPENTOGON's enum table and its licence.
// The layer itself is checked inside a running game (scripts/recomp/rgon/README.md).
// Parent command: node --test tests/recomp-rgon.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const rgon = join(root, 'scripts', 'recomp', 'rgon');
const layer = readFileSync(join(rgon, 'rgon.lua'), 'utf8');
const host = readFileSync(join(root, 'scripts', 'recomp', 'host', 'src', 'host_rgon.c'), 'utf8');
const python = [process.env.PYTHON, 'python3', 'python'].find((p) => p
  && spawnSync(p, ['-B', '-c', 'import re'], { encoding: 'utf8', timeout: 10000 }).status === 0);

let hooks;
function liftHooks(t) {
  if (!python) { t.skip('no Python'); return null; }
  if (!hooks) {
    const r = spawnSync(python, ['-B', '-c', [
      'import json, sys',
      'sys.dont_write_bytecode = True',
      `sys.path.insert(0, ${JSON.stringify(join(root, 'scripts', 'recomp', 'lift'))})`,
      'import lift_patches as L',
      'print(json.dumps([{"slot": s, "va": v, "what": w, "body": L.WRAP_PATCHES[v]} for s, v, w in L.RGON_HOOKS]))',
    ].join('\n')], { encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 0, r.stderr);
    hooks = JSON.parse(r.stdout.trim().split('\n').pop());
  }
  return hooks;
}

// the SLOT table of rgon.lua: Name = n
const slotBlock = /local SLOT = \{([\s\S]*?)\n\}/.exec(layer);
const slots = new Map([...slotBlock[1].matchAll(/([A-Za-z]+)\s*=\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]));
const defined = [...layer.matchAll(/define\(SLOT\.([A-Za-z]+),\s*\{([^}]*)\}/g)].map((m) => ({ name: m[1], ids: m[2].split(',').map((s) => Number(s.trim())) }));

test('every slot the layer names is a function the lift wraps, and no two share one', (t) => {
  const h = liftHooks(t); if (!h) return;
  assert.ok(slots.size >= 10);
  const bySlot = new Map(h.map((x) => [x.slot, x]));
  assert.equal(bySlot.size, h.length, 'a slot is listed once');
  assert.equal(new Set(h.map((x) => x.va)).size, h.length, 'an address is wrapped once');
  for (const [name, n] of slots) assert.ok(bySlot.has(n), `SLOT.${name} = ${n} has no wrapper in RGON_HOOKS`);
  assert.equal(new Set(slots.values()).size, slots.size, 'two names for one slot');
  const max = Number(/#define RGON_HOOKS (\d+)/.exec(host)[1]);
  for (const x of h) assert.ok(x.slot >= 0 && x.slot < max, `slot ${x.slot} is past the host's ${max}`);
});

test('a wrapper tests its own slot first, runs the lifted body, then any parked jump, then the handler after', (t) => {
  const h = liftHooks(t); if (!h) return;
  for (const x of h) {
    const name = `sub_${x.va.toString(16).padStart(8, '0')}`;
    const b = x.body;
    assert.ok(b.startsWith(`void ${name}(CpuState *restrict s) {\n`) && b.endsWith('\n}\n'), name);
    assert.ok(b.includes(`RECOMP_VA(0x${x.va.toString(16)}u);`), `${name}: its RECOMP_VA marker`);
    const off = b.indexOf(`if (!g_rgon_hook_on[${x.slot}] || g_reentry_eip) { ${name}__lifted(s); return; }`);
    const pre = b.indexOf(`if (isaac_rgon_hook_pre(${x.slot}, s, frame)) return;`);
    const body = b.indexOf(`${name}__lifted(s);\n  if (recomp_jmp_pending) recomp_run_pending(s);`);
    const post = b.indexOf(`isaac_rgon_hook_post(${x.slot}, s, frame);`);
    assert.ok(off > 0 && pre > off && body > pre && post > body, `${name}: the order of its four steps`);
    assert.ok(b.includes('uint32_t frame[4];'), `${name}: the frame is four words, as host_rgon.c's rgon_frame`);
  }
  assert.match(host, /typedef struct \{ uint32_t esp, ecx, edx; int ref; \} rgon_frame;/);
});

test('hook_slots.lua, which the handlers read, is the list the lift wraps', (t) => {
  const h = liftHooks(t); if (!h) return;
  const text = readFileSync(join(rgon, 'hook_slots.lua'), 'utf8');
  const named = [...text.matchAll(/\["([A-Za-z_]+::[A-Za-z_]+)"\] = \{ (\d+), (false|0x[0-9a-f]+) \}/g)];
  const alias = [...text.matchAll(/\["([A-Za-z_]+::[A-Za-z_]+)"\] = "([A-Za-z_]+::[A-Za-z_]+)"/g)];
  assert.equal(named.length, h.length, 'one entry per wrapped function');
  const byWhat = new Map(h.map((x) => [x.what, x.slot]));
  for (const m of named) assert.equal(byWhat.get(m[1]), Number(m[2]), `${m[1]} is slot ${m[2]} in the lift`);
  const names = new Set(named.map((m) => m[1]));
  for (const m of alias) assert.ok(names.has(m[2]), `${m[1]} shares ${m[2]}, which is in the table`);
  // every function a handler asks for by name is in the table
  const hooksLua = readFileSync(join(rgon, 'api_hooks.lua'), 'utf8');
  for (const m of hooksLua.matchAll(/(?:on|fired|head_body|status)\("([A-Za-z_]+::[A-Za-z_]+)"/g)) {
    assert.ok(names.has(m[1]) || alias.some((a) => a[1] === m[1]), `api_hooks.lua hooks ${m[1]}, which has no slot`);
  }
});

test('every hook the layer defines names callbacks from 1000 up, each once per slot', () => {
  assert.ok(defined.length >= 9);
  for (const d of defined) {
    assert.ok(slots.has(d.name), `define(SLOT.${d.name}) is not in SLOT`);
    for (const id of d.ids) assert.ok(Number.isInteger(id) && id >= 1000 && id < 2000, `${d.name}: ${id}`);
    assert.equal(new Set(d.ids).size, d.ids.length, d.name);
  }
  assert.equal(new Set(defined.map((d) => d.name)).size, defined.length, 'a slot is defined once');
});

test('the layer never takes the bridge as a global, and gates REPENTOGON last', () => {
  assert.match(layer, /^local B = \.\.\.$/m);
  assert.ok(!/\b_G\.B\b|rawset\(_G, "B"/.test(layer));
  const gate = layer.lastIndexOf('B.gate(R, ALLOW)');
  assert.ok(gate > 0 && gate > layer.lastIndexOf('method('), 'the gate comes after every method is in');
  // a mod is let in by name only; the list starts with the layer itself
  assert.match(layer, /local ALLOW = \{\s*\["repentogon"\] = true,/);
});

test('the bridge refuses what is not guest memory and what is not in the image', () => {
  assert.match(host, /a < 0x1000u \|\| !isaac_is_guest_va\(a\)/);
  assert.match(host, /if \(!isaac_in_image\(va\)\) return luaL_error\(L, "rgon: call to/);
  assert.match(host, /strstr\(name, "\.\."\)/, 'load() takes a sibling file only');
});

test('pack.mjs: the mod carries the layer, the enum table and its licence', (t) => {
  if (!existsSync(join(root, 'third_party', 'REPENTOGON', 'repentogon', 'resources', 'scripts', 'enums_ex.lua'))) { t.skip('the REPENTOGON submodule is not checked out'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'isaac-rgon-'));
  try {
    const out = join(dir, 'r.zip');
    const r = spawnSync(process.execPath, [join(rgon, 'pack.mjs'), out], { encoding: 'utf8', timeout: 60000 });
    assert.equal(r.status, 0, r.stderr);
    const zip = readFileSync(out);
    const names = [];
    for (let i = 0; i + 46 <= zip.length; i++) {
      if (zip.readUInt32LE(i) !== 0x02014b50) continue;
      names.push(zip.toString('utf8', i + 46, i + 46 + zip.readUInt16LE(i + 28)));
      i += 45;
    }
    // rgon.lua's parts go in with it, and none of the development scripts (lab_*, test_*)
    const parts = readdirSync(rgon).filter((n) => /^api_[a-z_]+\.lua$/.test(n)).map((n) => `repentogon/${n}`);
    assert.ok(parts.length >= 5, 'the layer has its parts');
    assert.deepEqual(names.sort(), ['repentogon/LICENSE-REPENTOGON.txt', 'repentogon/NOTICE.txt', 'repentogon/enums_ex.lua',
      'repentogon/hook_slots.lua', 'repentogon/main.lua', 'repentogon/metadata.xml', 'repentogon/rgon.lua', ...parts].sort());
    for (const part of [...layer.matchAll(/"(api_[a-z_]+\.lua)"/g)].map((m) => m[1])) {
      if (existsSync(join(rgon, part))) assert.ok(names.includes(`repentogon/${part}`), `${part} is loaded by rgon.lua and packed`);
    }
    assert.ok(zip.includes(Buffer.from('ModCallbacks.MC_PRE_ADD_COLLECTIBLE = 1004')), 'the enum table is in, unchanged');
    assert.ok(zip.includes(Buffer.from('GNU GENERAL PUBLIC LICENSE')) && zip.includes(Buffer.from('<directory>repentogon</directory>')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
