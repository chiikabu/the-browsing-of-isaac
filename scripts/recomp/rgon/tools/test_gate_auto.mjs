// test_gate_auto.mjs -- the layer's own decision of which mods see REPENTOGON (round 122),
// through the page: eight small mods are installed the way a player installs one, with the
// packed layer, and the game is started three times.
//
//   node scripts/recomp/rgon/tools/test_gate_auto.mjs <play.html url> <layer.zip> <fresh out-dir>
//
// Start 1 (ISAAC_RGON_ALLOW=zz-g-forced): what every mod reads, what the layer says of each,
//         the stand-in for a global table the layer lacks.
// Start 2 (?modscan=0): the page writes no scan; nobody but the hand list sees REPENTOGON, and
//         the file of start 1 is not lying about.
// Start 3 (ISAAC_RGON_AUTO=0): the scan is there and the layer keeps to its list.
//
// What each mod is expected to read is written here by hand, not worked out from the rule.
// Exit code 1 when a check fails. Logs: <out-dir>/start<N>.game.log and .console.log.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { zipStore } from '../../web/zip.mjs';

const [URL0, LAYER, OUT, ...rest] = process.argv.slice(2);
if (!URL0 || !LAYER || !OUT) { console.log('usage: node test_gate_auto.mjs <play.html url> <layer.zip> <fresh out-dir> [gl=hw|sw] [boot=420]'); process.exit(2); }
if (existsSync(OUT)) { console.log(`test_gate_auto: ${OUT} exists; give a fresh directory`); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')).map(([k, ...v]) => [k, v.join('=')]));
const BOOT_MS = Number(opt.boot || 420) * 1000;
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- the mods ---------------------------------------------------------------------------
// Each says what it reads at the top of its main.lua, and again where its file ends.
const top = (id) => `Isaac.DebugString("GATEAUTO ${id} top " .. tostring(REPENTOGON ~= nil))\n`;
const end = (id) => `Isaac.DebugString("GATEAUTO ${id} end " .. tostring(REPENTOGON ~= nil))\n`;
const MODS = {
  // does not run without REPENTOGON, and the layer has what it uses
  'zz-g-needs': (id) => top(id) + `if not REPENTOGON then
  Isaac.DebugString("GATEAUTO ${id} quit")
  return
end
local m = RegisterMod("${id}", 1)
local function later() return Game():GetLevel():GetDimension() end
m:AddCallback(ModCallbacks.MC_HUD_RENDER, function() end)
` + end(id),
  // does not run without it, and uses a global table, a function and a callback the layer lacks
  'zz-g-needs-gaps': (id) => top(id) + `if REPENTOGON == nil then
  Isaac.DebugString("GATEAUTO ${id} quit")
  error("${id} needs REPENTOGON")
end
local m = RegisterMod("${id}", 1)
local ok, got = pcall(function()
  ImGui.Show()
  local deep = ImGui.Some.Thing
  ImGui:Whatever(1, 2)
  return tostring(ImGui)
end)
Isaac.DebugString("GATEAUTO ${id} standin " .. tostring(ok) .. " " .. tostring(got))
local function later(p) return p:AddBestiaryKill(1) end
m:AddCallback(ModCallbacks.MC_PRE_PICKUP_VOIDED, function() end)
` + end(id),
  // runs either way; the layer has all it uses
  'zz-g-covered': (id) => top(id) + `local m = RegisterMod("${id}", 1)
local function dim()
  if REPENTOGON then return Game():GetLevel():GetDimension() end
  return 0
end
` + end(id),
  // runs either way; the layer lacks part of what it uses
  'zz-g-gaps': (id) => top(id) + `local m = RegisterMod("${id}", 1)
if REPENTOGON then
  ImGui.Show()
  Isaac.DebugString("GATEAUTO ${id} used ImGui")
end
local function dim() return Game():GetLevel():GetDimension() end
` + end(id),
  // steps aside where REPENTOGON does the job itself
  'zz-g-yields': (id) => top(id) + `local m = RegisterMod("${id}", 1)
function m:Own()
  if REPENTOGON then return end
  return Game():GetLevel():GetDimension()
end
` + end(id),
  // names it and uses nothing of it
  'zz-g-says': (id) => top(id) + `local m = RegisterMod("${id}", 1)
local with = REPENTOGON and "with" or "without"
` + end(id),
  // names it in a comment and in a string only: the page does not list it
  'zz-g-comment': (id) => `-- works with REPENTOGON
local note = "REPENTOGON"
Isaac.DebugString("GATEAUTO ${id} top " .. tostring(_G[note] ~= nil))
local m = RegisterMod("${id}", 1)
Isaac.DebugString("GATEAUTO ${id} end " .. tostring(_G[note] ~= nil))
`,
  // the same as zz-g-says, named by hand for start 1 (ISAAC_RGON_ALLOW): the hand's word wins
  'zz-g-forced': (id) => top(id) + `local m = RegisterMod("${id}", 1)
local with = REPENTOGON and "with" or "without"
` + end(id),
};
const enc = new TextEncoder();
const modZip = async (id) => {
  const files = {
    'metadata.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n  <name>${id}</name>\n  <directory>${id}</directory>\n  <description>Round 122 gate test.</description>\n  <version>1</version>\n</metadata>\n`,
    'main.lua': MODS[id](id),
  };
  const blob = zipStore(Object.entries(files).map(([name, text]) => ({ name: `${id}/${name}`, bytes: enc.encode(text) })));
  return Buffer.from(await blob.arrayBuffer());
};

// ---- what must be read -------------------------------------------------------------------
// [sees at the top, reaches its end, the layer's word for it (null: the layer says nothing)]
const START1 = {
  'zz-g-needs':      [true,  true,  /is shown REPENTOGON: it does not run without REPENTOGON \(\d+ name\(s\) of REPENTOGON's used, 0 missing\)/],
  'zz-g-needs-gaps': [true,  true,  /is shown REPENTOGON: it does not run without REPENTOGON, though the layer lacks part of what it uses \(\d+ name\(s\) of REPENTOGON's used, 3 missing: AddBestiaryKill, ImGui, MC_PRE_PICKUP_VOIDED\)/],
  'zz-g-covered':    [true,  true,  /is shown REPENTOGON: the layer has every name of REPENTOGON's it uses \(1 name\(s\) of REPENTOGON's used, 0 missing\)/],
  'zz-g-gaps':       [false, true,  /is not shown REPENTOGON: the layer lacks part of what it uses, and it runs without REPENTOGON \(2 name\(s\) of REPENTOGON's used, 1 missing: ImGui\)/],
  'zz-g-yields':     [false, true,  /is not shown REPENTOGON: it steps aside where REPENTOGON does the job itself/],
  'zz-g-says':       [false, true,  /is not shown REPENTOGON: it names REPENTOGON and uses nothing of it \(0 name/],
  'zz-g-comment':    [false, true,  null],
  'zz-g-forced':     [true,  true,  null],
};
// without the scan, or with the layer told to keep to its list: the two mods that need it stop at their test
const LISTONLY = Object.fromEntries(Object.keys(MODS).map((id) => [id, [false, !/^zz-g-needs/.test(id), null]]));

let checks = 0, failed = 0;
const T = (name, cond, detail) => {
  checks++;
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail !== undefined && !cond ? ' -- ' + String(detail).slice(0, 300) : ''}`);
};

const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'] });
const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
let con = [];
page.on('console', (m) => con.push(m.text()));
page.on('pageerror', (e) => con.push(`PAGEERROR ${e}`));

// one start: follow the log until every mod's main.lua has run and six quiet seconds have passed
async function start(n, query) {
  con = [];
  const u = new globalThis.URL(URL0);
  for (const [k, v] of new URLSearchParams(query)) u.searchParams.set(k, v);
  await page.goto(u.href, { waitUntil: 'domcontentloaded' });
  const log = [];
  let seen = 0, lastScript = 0, stop = null;
  const t0 = Date.now();
  while (Date.now() - t0 < BOOT_MS) {
    const r = await page.evaluate((f) => { const l = window.isaacLog || []; return { lines: l.slice(f).map(String), n: l.length, frame: window.isaacFrame || 0 }; }, seen)
      .catch(() => ({ lines: [], n: seen, frame: 0 }));
    seen = r.n;
    for (const l of r.lines) {
      log.push(l);
      if (/Running Lua Script: \/\/mods\//.test(l)) lastScript = Date.now();
      if (/TRAP in |RESULT: aborted|The module stopped/.test(l)) stop = l;
    }
    if (stop) break;
    if (lastScript && Date.now() - lastScript > 6000 && r.frame > 30) break;
    await sleep(1000);
  }
  writeFileSync(join(OUT, `start${n}.game.log`), log.join('\n') + '\n');
  writeFileSync(join(OUT, `start${n}.console.log`), con.join('\n') + '\n');
  const all = log.concat(con);
  console.log(`-- start ${n} (${query || 'no query'}): ${log.length} log line(s) in ${((Date.now() - t0) / 1000).toFixed(0)} s${stop ? ', STOPPED: ' + stop.slice(0, 160) : ''}`);
  T(`start ${n}: the game did not stop`, !stop, stop);
  return {
    all,
    said: (id, what) => { const m = all.map((l) => new RegExp(`GATEAUTO ${id} ${what} (\\S+)`).exec(l)).find(Boolean); return m ? m[1] : null; },
    has: (re) => all.some((l) => re.test(l)),
    gate: (id) => all.filter((l) => l.includes(`gate: ${id} is `)),
    count: (re) => all.filter((l) => re.test(l)).length,
  };
}
function expect(n, r, table) {
  for (const [id, [sees, ends, word]] of Object.entries(table)) {
    T(`start ${n}: ${id} reads REPENTOGON as ${sees ? 'the layer' : 'nil'} at its top`, r.said(id, 'top') === String(sees), `it said ${r.said(id, 'top')}`);
    if (ends) T(`start ${n}: ${id} runs to its end, reading the same there`, r.said(id, 'end') === String(sees), `it said ${r.said(id, 'end')}`);
    else T(`start ${n}: ${id} stops at its own test`, r.said(id, 'end') === null && r.has(new RegExp(`GATEAUTO ${id} quit`)), `end: ${r.said(id, 'end')}`);
    const g = r.gate(id);
    if (word) T(`start ${n}: the layer says of ${id} what is expected, once`, g.length === 1 && word.test(g[0]), g.join(' | ') || 'nothing said');
    else T(`start ${n}: the layer decides nothing of ${id}`, g.length === 0, g.join(' | '));
    T(`start ${n}: the host ${sees ? 'names' : 'does not name'} ${id} as a mod REPENTOGON is visible to`, r.has(new RegExp(`REPENTOGON is visible to the mod '${id}'`)) === sees);
  }
}

try {
  // install, as a player does: the page's own file input
  const zips = [['repentogon.zip', readFileSync(LAYER)]];
  for (const id of Object.keys(MODS)) zips.push([`${id}.zip`, await modZip(id)]);
  await page.goto(URL0.split('?')[0] + '?autoplay=0&persist=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mods-file', { state: 'attached', timeout: 120000 });
  for (const [name, buffer] of zips) {
    const before = con.filter((l) => /^\[mods\] .*: \d+ file\(s\)$/.test(l)).length;
    await page.setInputFiles('#mods-file', { name, mimeType: 'application/zip', buffer });
    const deadline = Date.now() + 240000;
    for (;;) {
      if (con.filter((l) => /^\[mods\] .*: \d+ file\(s\)$/.test(l)).length > before) break;
      const bad = con.find((l) => /^\[mods\] import failed:/.test(l));
      if (bad) throw new Error(`${name}: ${bad}`);
      if (Date.now() > deadline) throw new Error(`${name} never finished importing`);
      await sleep(250);
    }
  }
  console.log(`installed ${zips.map((z) => z[0]).join(', ')}`);

  let r = await start(1, 'ISAAC_RGON_ALLOW=zz-g-forced');
  T('start 1: the page says it wrote the scan, with the seven mods that name REPENTOGON in code', r.has(/REPENTOGON layer: 7 mod\(s\) name REPENTOGON in their code; modscan\.lua written/),
    r.all.filter((l) => /modscan|REPENTOGON layer/.test(l)).join(' | '));
  expect(1, r, START1);
  T('start 1: a global table the layer lacks is a stand-in for the mod that needs it: indexed, called, printed',
    r.said('zz-g-needs-gaps', 'standin') === 'true' && r.has(/GATEAUTO zz-g-needs-gaps standin true <REPENTOGON stand-in ImGui>/), r.all.filter((l) => /standin/.test(l)).join(' | '));
  T('start 1: and the log names it as not implemented', r.has(/\[REPENTOGON\] not implemented: ImGui \(a stand-in, for zz-g-needs-gaps\)/));
  T('start 1: the mod with gaps that runs without REPENTOGON never reaches its REPENTOGON branch', !r.has(/GATEAUTO zz-g-gaps used ImGui/));
  T('start 1: no Lua error from a test mod', r.count(/zz-g-[a-z-]+\/main\.lua.*(error|ERR)|ERR: .*zz-g-/i) === 0, r.all.filter((l) => /ERR/.test(l) && /zz-g-/.test(l)).join(' | '));

  r = await start(2, 'modscan=0');
  T('start 2: the page wrote no scan', !r.has(/modscan\.lua written/));
  T('start 2: the layer says there is none', r.has(/gate: no scan of the installed mods \(modscan\.lua\)/), r.all.filter((l) => /gate:/.test(l)).join(' | '));
  expect(2, r, LISTONLY);

  r = await start(3, 'ISAAC_RGON_AUTO=0');
  T('start 3: the page wrote the scan', r.has(/modscan\.lua written/));
  T('start 3: the layer says nothing of a gate', r.count(/\[rgon\] gate:/) === 0, r.all.filter((l) => /gate:/.test(l)).join(' | '));
  expect(3, r, LISTONLY);
} catch (e) {
  T('the test ran', false, e && e.stack || e);
} finally {
  await browser.close();
}
console.log(`GATEAUTO END ${checks} ${failed}`);
process.exit(failed ? 1 : 0);
