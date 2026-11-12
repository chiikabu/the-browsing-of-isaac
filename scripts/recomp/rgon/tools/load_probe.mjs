// load_probe.mjs -- boot a dist until its mods have loaded, and say what went wrong.
//
//   node scripts/recomp/rgon/tools/load_probe.mjs <url> <out-dir> [secs=20] [run=1] [gl=hw|sw]
//
// The quick loop for working on the REPENTOGON layer against one mod (a dist
// made by dev_dist.py): no test mod is installed and nothing is imported. The
// page is opened, the game's log is followed until the last mod's main.lua
// has run, then for `secs` more seconds (run=1 holds Enter to start a run
// first), and the log is written to <out-dir>/game.log and console.log.
//
// Printed: each mod's load result, the Lua errors by place (most frequent
// first), and the names the layer said it does not have.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) { console.log('usage: node load_probe.mjs <url> <out-dir> [secs=20] [run=1] [gl=hw|sw]'); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')).map(([k, ...v]) => [k, v.join('=')]));
const SECS = Number(opt.secs || 20), RUN = opt.run === '1', BOOT_MS = Number(opt.boot || 420) * 1000;
mkdirSync(OUT, { recursive: true });

const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync', '--mute-audio'] });
const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
const con = [];
const t0 = Date.now();
page.on('console', (m) => con.push(`${((Date.now() - t0) / 1000).toFixed(1).padStart(7)} ${m.text()}`));
page.on('pageerror', (e) => con.push(`PAGEERROR ${e}`));
await page.goto(URL, { waitUntil: 'domcontentloaded' });

const read = (from) => page.evaluate((f) => { const l = window.isaacLog || []; return { lines: l.slice(f).map(String), n: l.length, frame: window.isaacFrame || 0, done: window.isaacDone || null }; }, from)
  .catch(() => ({ lines: [], n: from, frame: 0, done: null }));
const log = [];
let seen = 0, loadedAt = 0, lastScript = 0, frame = 0, stop = null, pressed = 0, runAt = 0;
const deadline = Date.now() + BOOT_MS + SECS * 1000 + (RUN ? 300000 : 0);
while (Date.now() < deadline) {
  const r = await read(seen);
  seen = r.n; frame = r.frame;
  for (const l of r.lines) {
    log.push(l);
    if (/Running Lua Script: \/\/mods\//.test(l)) lastScript = Date.now();
    if (/TRAP in |RESULT: aborted|The module stopped/.test(l)) stop = l;
    if (!runAt && /RNG Start Seed:/.test(l)) runAt = Date.now();          // the game logs this when a run begins
  }
  if (r.done || stop) { stop = stop || `done: ${JSON.stringify(r.done).slice(0, 200)}`; break; }
  // loaded: a mod's script has run and none has started for 6 s while frames are drawn
  if (!loadedAt && lastScript && Date.now() - lastScript > 6000 && frame > 30) loadedAt = Date.now();
  if (loadedAt) {
    // run=1: Enter through the menus until the run begins (a busy machine takes its time), then `secs` of play
    if (RUN && !runAt && pressed < 600) { await page.keyboard.press('Enter').catch(() => {}); pressed += 1; }
    if (Date.now() - (RUN ? (runAt || Date.now()) : loadedAt) > SECS * 1000) break;
    if (RUN && !runAt && Date.now() - loadedAt > 300000) break;            // five minutes of menus: give up
  }
  await new Promise((res) => setTimeout(res, RUN && loadedAt ? 350 : 1000));
}
const tail = await read(seen);
for (const l of tail.lines) log.push(l);
writeFileSync(join(OUT, 'game.log'), log.join('\n') + '\n');
writeFileSync(join(OUT, 'console.log'), con.join('\n') + '\n');
await browser.close();

const text = log.concat(con);
console.log(`[load] ${loadedAt ? 'mods loaded' : 'mods NOT seen loading'} after ${((Date.now() - t0) / 1000).toFixed(0)} s, frame ${frame}${RUN ? (runAt ? ', a run began' : ', NO run began') : ''}${stop ? ', STOP: ' + String(stop).slice(0, 200) : ''}`);
for (let i = 0; i < log.length; i++) {
  const m = /Running Lua Script: (\/\/mods\/[^/]+\/main\.lua)/.exec(log[i]);
  if (!m) continue;
  let err = null;
  for (let j = i + 1; j < log.length && !/Running Lua Script: \/\/mods\//.test(log[j]); j++) {
    const e = /ERR: (.*)$/.exec(log[j]);
    if (e) { err = e[1]; break; }
  }
  console.log(`  ${m[1]}: ${err ? 'STOPPED: ' + err.slice(0, 260) : 'ok'}`);
}
const count = (re, key) => {
  const c = new Map();
  for (const l of text) { const m = re.exec(l); if (m) { const k = key(m); c.set(k, (c.get(k) || 0) + 1); } }
  return [...c].sort((a, b) => b[1] - a[1]);
};
const errs = count(/(?:Error in "([^"]+)" call: |"(MC_[A-Z0-9_]+)" from "[^"]*" failed: )(.*)$/, (m) => `${m[1] || m[2]}: ${m[3].replace(/^\.\.\./, '').slice(0, 200)}`);
console.log(`[load] ${errs.length} distinct callback error(s), ${errs.reduce((n, e) => n + e[1], 0)} line(s)`);
for (const [k, n] of errs.slice(0, Number(opt.top || 40))) console.log(`  ${String(n).padStart(6)}  ${k}`);
const miss = count(/\[REPENTOGON\] not implemented: (.*)$/, (m) => m[1].trim());
console.log(`[load] ${miss.length} name(s) the layer said it does not have`);
const fns = miss.map((m) => m[0]).filter((n) => !/^callback /.test(n)).sort();
const cbs = miss.map((m) => m[0]).filter((n) => /^callback /.test(n)).map((n) => n.replace(/^callback (\S+) \((\d+)\).*$/, '$1')).sort();
if (fns.length) console.log('  names: ' + fns.join(' '));
if (cbs.length) console.log('  callbacks: ' + cbs.join(' '));
const rg = con.filter((l) => /\[isaac\]\[rgon\]/.test(l)).map((l) => l.replace(/^.*\[isaac\]\[rgon\] /, ''));
console.log(`[load] the layer said:`);
for (const l of rg.slice(0, Number(opt.said || 30))) console.log('  ' + l.slice(0, 220));
