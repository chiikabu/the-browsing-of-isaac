// What the page reads in a mod's Lua for the REPENTOGON layer's gate (round 122):
// mods.mjs stripLua, scanLua, createModScan, and seedMods writing modscan.lua.
import test from 'node:test';
import assert from 'node:assert/strict';
import { stripLua, scanLua, createModScan, seedMods, RGON_LAYER_ID, MODSCAN_FILE, GUEST_ROOTS } from '../scripts/recomp/web/mods.mjs';

const enc = (s) => new TextEncoder().encode(s);
const file = (rel, text) => ({ rel, bytes: enc(text) });

test('comments and strings are not code, and every line stays where it was', () => {
  const src = [
    'local a = "REPENTOGON in a string" -- REPENTOGON in a comment',
    "local b = 'it\\'s REPENTOGON' .. x",
    '--[[ a long comment',
    'REPENTOGON ]] local c = 1',
    'local d = [==[ long string ]] REPENTOGON ]==] .. REPENTOGON',
    '--[==[ REPENTOGON',
    ']==] e = 2',
  ].join('\n');
  const out = stripLua(src);
  assert.equal(out.split('\n').length, src.split('\n').length);
  assert.equal((out.match(/REPENTOGON/g) || []).length, 1, 'only the one outside strings and comments is left');
  assert.match(out.split('\n')[3], /local c = 1/);
  assert.match(out.split('\n')[6], /e = 2/);
  assert.match(out.split('\n')[1], /\.\. x/, 'an escaped quote does not end the string');
});

test('a file that never names REPENTOGON in code says 0, whatever its comments say', () => {
  const r = scanLua('-- needs REPENTOGON\nprint("REPENTOGON")\nlocal x = Game():GetRoom():GetBackdropType()\n');
  assert.equal(r.says, 0);
  assert.equal(r.quits, 0);
  assert.ok(r.names.has('GetBackdropType'), 'its names are still read: another file may name REPENTOGON');
});

test('a test of `not REPENTOGON` at the top level that ends the file or raises is a quit', () => {
  assert.equal(scanLua('if not REPENTOGON then\n  print("needs it")\n  return\nend\nlocal m = RegisterMod("x", 1)').quits, 1);
  assert.equal(scanLua('if not REPENTOGON then error("needs REPENTOGON") end').quits, 1);
  assert.equal(scanLua('if not REPENTOGON then error "needs REPENTOGON" end').quits, 1);
  assert.equal(scanLua('if REPENTOGON == nil then return end').quits, 1);
  assert.equal(scanLua('if (not REPENTOGON) then return end').quits, 1);
  assert.equal(scanLua('if not REPENTOGON or not REPENTOGON.Real then return end').quits, 1);
  assert.equal(scanLua('if REPENTOGON then\n  x = 1\nelse\n  error("needs REPENTOGON")\nend').quits, 1);
  assert.equal(scanLua('assert(REPENTOGON, "needs REPENTOGON")').quits, 1);
  assert.equal(scanLua('if not REPENTOGON then\n  if x then return end\nend').quits, 1, 'a return in a block inside the test still ends the file');
});

test('what is not a quit', () => {
  assert.equal(scanLua('if not REPENTOGON then\n  useFallback()\nend').quits, 0, 'no return, no error');
  assert.equal(scanLua('function f()\n  if not REPENTOGON then return end\n  g()\nend').quits, 0, 'inside a function it ends the function');
  assert.equal(scanLua('local f = function()\n  if not REPENTOGON then return end\nend').quits, 0);
  assert.equal(scanLua('if not REPENTOGON then\n  cb = function() return 1 end\nend').quits, 0, 'a return of a function defined in the test');
  assert.equal(scanLua('if not REPENTOGON and x then return end').quits, 0, 'another condition with it');
  assert.equal(scanLua('if REPENTOGON then return end').quits, 0, 'the other way round is a yield, not a quit');
  assert.equal(scanLua('if not REPENTOGON then\n  a()\nelse\n  return\nend').quits, 0, 'the return is in the branch that has REPENTOGON');
  assert.equal(scanLua('if REPENTOGON then\n  a()\nelseif x then\n  return\nend').quits, 0);
  assert.equal(scanLua('if x then\n  for i = 1, 2 do\n    while y do repeat z() until w end\n  end\nend\nif not REPENTOGON then return end').quits, 1, 'blocks before it are closed by their own ends');
});

test('`if REPENTOGON then return end` is a yield, at any depth', () => {
  assert.equal(scanLua('function m:f()\n  if REPENTOGON then return end\n  own()\nend').yields, 1);
  assert.equal(scanLua('local function ok()\n  if REPENTOGON then return false end\n  return true\nend').yields, 1);
  assert.equal(scanLua('if (REPENTOGON) then return nil end').yields, 1);
  assert.equal(scanLua('function f()\n  if REPENTOGON then return level:GetDimension() end\nend').yields, 0, 'a return of something REPENTOGON gives is a use');
  assert.equal(scanLua('if REPENTOGON then\n  a()\n  return\nend').yields, 0, 'only the bare form');
  assert.equal(scanLua('if REPENTOGON and x then return end').yields, 0);
});

test('the names: calls after . or :, MC_ names, capitalised tables; and what the file defines', () => {
  const r = scanLua([
    'if REPENTOGON then',
    '  local d = Game():GetLevel():GetDimension()',
    '  mod:AddCallback(ModCallbacks.MC_HUD_RENDER, f)',
    '  ImGui.Show()',
    '  local n = PlayerManager.GetNumCoins()',
    '  local e = REPENTOGON.Extras.Version()',
    'end',
    'function mod.GetPlayerIndex(p) return 1 end',
    'function mod:Helper() end',
    'mod.Other = function() end',
    'local i = mod.GetPlayerIndex(p)',
    'print("x:NotACall(")',
  ].join('\n'));
  for (const n of ['GetDimension', 'MC_HUD_RENDER', 'ImGui', 'PlayerManager', 'GetNumCoins', 'GetPlayerIndex']) assert.ok(r.names.has(n), n);
  assert.ok(!r.names.has('NotACall'), 'not from a string');
  assert.ok(!r.names.has('REPENTOGON'));
  for (const n of ['GetPlayerIndex', 'Helper', 'Other']) assert.ok(r.defined.has(n), 'defined: ' + n);
  assert.ok(!r.defined.has('GetDimension'));
});

test('a mod: its quits are main.lua only, its own functions are not names, a mod that never says it is not listed', () => {
  const scan = createModScan();
  assert.equal(scan.add('Plain-Mod', [file('main.lua', 'local m = RegisterMod("p", 1)\n-- REPENTOGON\nprint("REPENTOGON")')]), null);
  assert.equal(scan.size(), 0);
  const row = scan.add('Some_Mod', [
    file('main.lua', 'if not REPENTOGON then return end\nlocal i = mod.GetPlayerIndex(p)\nlocal d = level:GetDimension()'),
    file('scripts/extra.lua', 'if not REPENTOGON then return end\nfunction mod.GetPlayerIndex(p) return 1 end\nRoomTransition.GetTransitionMode()'),
    file('scripts/yield.lua', 'function f() if REPENTOGON then return end end'),
    file('readme.txt', 'REPENTOGON'),
  ]);
  assert.equal(row.quits, 1, 'the test at the top of another file is that file only');
  assert.equal(row.yields, 1);
  assert.equal(row.says, 3);
  assert.equal(row.files, 3);
  assert.ok(row.names.has('GetDimension') && row.names.has('RoomTransition') && row.names.has('GetTransitionMode'));
  assert.ok(!row.names.has('GetPlayerIndex'), 'defined in another file of the mod');
  assert.equal(scan.size(), 1);
  const nested = createModScan().add('n', [file('sub/main.lua', 'if not REPENTOGON then return end'), file('main.lua', 'if REPENTOGON then x() end')]);
  assert.equal(nested.quits, 0, 'a main.lua in a subfolder is not the mod\'s entry');
});

test('the file for the layer is a Lua table of plain words', () => {
  const scan = createModScan();
  scan.add('B-mod', [file('main.lua', 'if REPENTOGON then ImGui.Show() end')]);
  scan.add('a"]]mod', [file('main.lua', 'if not REPENTOGON then return end\nx:GetDimension()')]);
  const lua = scan.lua();
  assert.match(lua, /^-- generated/);
  assert.match(lua, /return \{ version = 1, mods = \{/);
  assert.match(lua, /\["b-mod"\] = \{ says = 1, quits = 0, yields = 0, files = 1, names = "ImGui Show" \},/);
  assert.match(lua, /\["a___mod"\] = \{ says = 1, quits = 1, yields = 0, files = 1, names = "GetDimension" \},/, 'an id cannot break out of its string');
  assert.ok(lua.indexOf('a___mod') < lua.indexOf('b-mod'), 'in order');
  assert.equal(createModScan().lua(), '-- generated by the page at this start (mods.mjs createModScan): what the Lua of each installed mod says about REPENTOGON\nreturn { version = 1, mods = {\n\n} }\n');
});

// seedMods with a stand-in store (the module reads through its own cursor helpers; a stub
// database that answers each store's rows is enough, as in recomp-mods.test.js)
const fakeDb = (store) => ({
  transaction: (name) => ({ objectStore: () => ({ openCursor: () => {
    const rows = (store[name] || []).slice();
    const req = {};
    queueMicrotask(function step() {
      if (!rows.length) { req.result = null; req.onsuccess(); return; }
      const r = rows.shift();
      req.result = { key: r.key, value: r.value, continue: () => queueMicrotask(step) };
      req.onsuccess();
    });
    return req;
  } }) }),
});
const storeOf = (ids, off) => ({
  mods: ids.map((id) => ({ key: id, value: { id, name: id, files: 1, bytes: 1, added: 1, enabled: !(off || []).includes(id) } })),
  files: ids.map((id) => (id === RGON_LAYER_ID
    ? { key: `${id}/rgon.lua`, value: { bytes: enc('local R = {}\nif not REPENTOGON then REPENTOGON = R end\nR.Extras = ImGui.Show()') } }
    : { key: `${id}/main.lua`, value: { bytes: enc('if not REPENTOGON then return end\nlevel:GetDimension()') } })),
  state: [],
});
const seedWith = async (ids, scan, off) => {
  const seeded = new Map();
  const lines = [];
  const out = await seedMods(fakeDb(storeOf(ids, off)), (path, bytes) => { seeded.set(path, bytes); return true; }, (l) => lines.push(l), { sentinel: false, scan });
  return { seeded, out, lines };
};

test('seedMods writes modscan.lua into the folder of the layer when the layer is installed and on', async () => {
  const a = await seedWith([RGON_LAYER_ID, 'Needs-It', 'plain'], createModScan());
  for (const root of GUEST_ROOTS) {
    const body = a.seeded.get(`${root}${RGON_LAYER_ID}/${MODSCAN_FILE}`);
    assert.ok(body, 'written under ' + root);
    assert.match(new TextDecoder().decode(body), /\["needs-it"\] = \{ says = 1, quits = 1, yields = 0, files = 1, names = "GetDimension" \},/);
    assert.ok(!new TextDecoder().decode(body).includes(RGON_LAYER_ID + '"]'), 'the layer itself is not weighed');
  }
  assert.equal(a.out.scanned, 2);
  assert.ok(a.lines.some((l) => /2 mod\(s\) name REPENTOGON in their code; modscan\.lua written/.test(l)), a.lines.join('|'));
});

test('no layer, the layer switched off, or the scan switched off: no file', async () => {
  const none = (r) => ![...r.seeded.keys()].some((k) => k.endsWith('/' + MODSCAN_FILE));
  assert.ok(none(await seedWith(['needs-it'], createModScan())), 'the layer is not installed');
  assert.ok(none(await seedWith([RGON_LAYER_ID, 'needs-it'], createModScan(), [RGON_LAYER_ID])), 'the layer is off');
  assert.ok(none(await seedWith([RGON_LAYER_ID, 'needs-it'], null)), '?modscan=0');
  const empty = await seedWith([RGON_LAYER_ID], createModScan());
  assert.ok(!none(empty), 'with the layer alone the file is written, empty: the layer then knows the page looked');
  assert.equal(empty.out.scanned, 0);
});
