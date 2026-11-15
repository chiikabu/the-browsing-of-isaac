// drive_console.mjs -- the debug console's switch on the game's OPTIONS screen, and the
// console itself, the way a player meets them (round 124).
//
//   node scripts/recomp/web/drive_console.mjs <play.html url> <fresh out-dir> [gl=hw|sw]
//
// A fresh browser profile. What is checked, in order:
//   1. off by default: the game's switch reads off; in the first run the console key opens nothing
//   2. on the OPTIONS screen the page's paper is up; C turns the switch on, C again off, a
//      click on the paper on again; each time the stored options.ini says the same
//   3. in a run the console key opens the console; the letters f and n typed into it are text
//      (no fullscreen request, the FPS readout does not flip) and the line holds what was typed;
//      a held Backspace erases more than one character; Enter on the empty line closes it
//   4. with the console closed F and N are the page's keys again
//   5. after a reload the switch is still on
// Screenshots and logs go to the out-dir. Exit code 1 when a check fails.
import { chromium } from 'playwright';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [URL0, OUT, ...rest] = process.argv.slice(2);
if (!URL0 || !OUT) { console.log('usage: node drive_console.mjs <play.html url> <fresh out-dir> [gl=hw|sw]'); process.exit(2); }
if (existsSync(OUT)) { console.log(`drive_console: ${OUT} exists; give a fresh directory`); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')).map(([k, ...v]) => [k, v.join('=')]));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let checks = 0, failed = 0;
const T = (name, cond, detail) => {
  checks++;
  if (!cond) failed++;
  console.log(`${cond ? 'ok  ' : 'FAIL'} ${name}${detail !== undefined && !cond ? ' -- ' + String(detail).slice(0, 300) : ''}`);
};

const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const page = await (await browser.newContext({ viewport: { width: 960, height: 540 } })).newPage();
const con = [];
page.on('console', (m) => con.push(m.text()));
page.on('pageerror', (e) => con.push('PAGEERROR ' + e));
// every request for fullscreen is counted (a headless page may refuse it; the request is what the F key makes)
await page.addInitScript(() => {
  window.__fsAsked = 0;
  const real = Element.prototype.requestFullscreen;
  Element.prototype.requestFullscreen = function (...a) { window.__fsAsked += 1; return real ? real.apply(this, a).catch(() => {}) : Promise.resolve(); };
});

// the game's state, read where the page reads it: the menu screen (MenuManager+0x40), the
// console (Game+0x68d78: state, and the line it is editing, an MSVC std::string at +0x1c)
const state = () => page.evaluate(() => {
  const G = window.isaacGuest;
  if (!G) return { frame: 0, menu: -1, console: -1, line: '' };
  const mgr = G.u32(0x00c72a20), game = G.u32(0x00c71678);
  let line = '';
  if (game) {
    const s = game + 0x68d94, size = G.u32(s + 0x10), cap = G.u32(s + 0x14);
    const at = cap >= 16 ? G.u32(s) : s;
    for (let i = 0; i < Math.min(size, 200); i++) line += String.fromCharCode(G.u8(at + i));
  }
  return { frame: window.isaacFrame | 0, menu: mgr ? G.u32(mgr + 0x40) : -1, console: game ? G.u32(game + 0x68d78) : -1, line,
    on: window.isaacDebugConsole ? window.isaacDebugConsole.get() : null,
    tagUp: window.isaacConsoleTag ? window.isaacConsoleTag.up() : null,
    tagShown: !!(document.getElementById('console-tag') && !document.getElementById('console-tag').hidden),
    fs: window.__fsAsked | 0, fps: !!(document.getElementById('fps-viewer') && !document.getElementById('fps-viewer').hidden) };
});
const stored = () => page.evaluate(async () => {
  const dbs = await indexedDB.databases();
  for (const d of dbs) {
    const db = await new Promise((res) => { const r = indexedDB.open(d.name); r.onsuccess = () => res(r.result); r.onerror = () => res(null); });
    if (!db) continue;
    for (const name of db.objectStoreNames) {
      const got = await new Promise((res) => {
        try { const r = db.transaction(name, 'readonly').objectStore(name).get('c:/isaac/documents/my games/binding of isaac repentance+/options.ini'); r.onsuccess = () => res(r.result || null); r.onerror = () => res(null); }
        catch { res(null); }
      });
      if (got && got.bytes) { db.close(); return (/^EnableDebugConsole=(\d)/m.exec(new TextDecoder().decode(got.bytes)) || [])[1] || 'no line'; }
    }
    db.close();
  }
  return 'no file';
});
const press = async (code, ms = 110, after = 450) => { await page.keyboard.down(code); await sleep(ms); await page.keyboard.up(code); await sleep(after); };
const shot = (name) => page.screenshot({ path: join(OUT, `${name}.png`) });
const until = async (fn, ms, step = 250) => { const t = Date.now(); for (;;) { const v = await fn(); if (v) return v; if (Date.now() - t > ms) return null; await sleep(step); } };
const logHas = (re) => page.evaluate((src) => (window.isaacLog || []).some((l) => new RegExp(src).test(String(l))), re.source);

async function boot() {
  await page.goto(URL0, { waitUntil: 'domcontentloaded' });
  await until(async () => (await state()).frame > 300, 420000, 500);
  await sleep(1500);
}
async function toGameMenu() {
  for (let i = 0; i < 8; i++) { if ((await state()).menu === 3) return true; await press('Enter', 110, 800); }
  return (await state()).menu === 3;
}
async function toOptions() {
  // the game menu's rows are walked until Enter lands on OPTIONS (10)
  for (let row = 0; row < 8; row++) {
    await press('Enter', 110, 900);
    const id = (await state()).menu;
    if (id === 10) return true;
    if (id !== 3) await press('Escape', 110, 900);
    await press('ArrowDown', 110, 500);
  }
  return false;
}
async function startRun() {
  // back at the game menu: its rows are walked (the list wraps) until Enter lands on the
  // character screen (5), then Enter until the run begins
  for (let i = 0; i < 6 && (await state()).menu !== 3; i++) await press('Escape', 110, 900);
  for (let row = 0; row < 8; row++) {
    await press('Enter', 110, 900);
    const id = (await state()).menu;
    if (id === 5) break;
    if (id !== 3) await press('Escape', 110, 900);
    await press('ArrowDown', 110, 500);
  }
  for (let i = 0; i < 40 && !(await logHas(/RNG Start Seed/)); i++) await press('Enter', 110, 1200);
  const began = await logHas(/RNG Start Seed/);
  await sleep(3500);
  return began;
}

try {
  await boot();
  let s = await state();
  T('a fresh profile: the game\'s console switch is off', s.on === false, JSON.stringify(s));
  T('the game reached its menus', await toGameMenu(), JSON.stringify(await state()));

  // ---- 2. the OPTIONS screen
  T('OPTIONS is screen 10', await toOptions(), JSON.stringify(await state()));
  await sleep(1200);
  s = await until(async () => { const v = await state(); return v.tagShown ? v : null; }, 6000) || await state();
  T('the page\'s paper is up on the OPTIONS screen', s.tagUp === true && s.tagShown === true, JSON.stringify(s));
  await shot('1-options-off');
  await press('KeyC');
  s = await state();
  T('C turns the switch on', s.on === true && s.menu === 10, JSON.stringify(s));
  T('and the stored options.ini says 1', await until(async () => (await stored()) === '1', 4000), await stored());
  await sleep(500);
  await shot('2-options-on');
  await press('KeyC');
  s = await state();
  T('C again turns it off', s.on === false, JSON.stringify(s));
  T('and the stored options.ini says 0', await until(async () => (await stored()) === '0', 4000), await stored());
  // a click on the paper: its face is about (69, 39) into the widget at (336, 150), in a 480x270 game
  const box = await page.evaluate(() => { const r = document.getElementById('stage').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  await page.mouse.click(box.x + (336 + 69) / 480 * box.w, box.y + (150 + 39) / 270 * box.h);
  await sleep(500);
  s = await state();
  T('a click on the paper turns it on', s.on === true, JSON.stringify(s));
  T('and the stored options.ini says 1 again', await until(async () => (await stored()) === '1', 4000), await stored());

  // ---- 1b and 3. a run
  // (the switch is turned off for the first half of the run, to see the key do nothing)
  await press('KeyC');
  T('off again for the first half of the run', (await state()).on === false);
  T('a run begins', await startRun());
  s = await state();
  T('in a run the paper is gone', s.tagShown === false && s.tagUp === false, JSON.stringify(s));
  await press('Backquote', 110, 900);
  s = await state();
  T('with the switch off the console key opens nothing', s.console === 0, JSON.stringify(s));
  // on, from here: the game's own switch, as the paper sets it
  await page.evaluate(() => window.isaacDebugConsole.set(true));
  await press('Backquote', 110, 1200);
  s = await until(async () => { const v = await state(); return v.console === 2 ? v : null; }, 5000) || await state();
  T('with the switch on the console key opens the console', s.console === 2, JSON.stringify(s));
  T('the page says the console is open', await page.evaluate(() => window.isaacConsoleOpen()) === true);
  const fs0 = s.fs, fps0 = s.fps;
  for (const code of ['KeyG', 'KeyO', 'KeyT', 'KeyO', 'Space', 'KeyF', 'KeyN', 'KeyF', 'KeyN']) await press(code, 70, 160);
  s = await state();
  T('letters typed into it are its line', s.line === 'goto fnfn', JSON.stringify(s.line));
  T('an f in a command asks for no fullscreen', s.fs === fs0, `${fs0} -> ${s.fs}`);
  T('an n in a command does not flip the FPS readout', s.fps === fps0, `${fps0} -> ${s.fps}`);
  await shot('3-console-open');
  // a held Backspace: the browser repeats the key, and the console must erase more than one character
  await page.keyboard.down('Backspace');
  for (let i = 0; i < 12; i++) { await sleep(120); await page.keyboard.down('Backspace'); }   // key repeat, as a held key sends it
  await page.keyboard.up('Backspace');
  await sleep(500);
  s = await state();
  T('a held Backspace erases more than one character', s.line.length <= 'goto fnfn'.length - 2, JSON.stringify(s.line));
  for (let i = 0; i < 12 && (await state()).line.length; i++) await press('Backspace', 70, 160);
  T('the line can be emptied', (await state()).line === '', JSON.stringify((await state()).line));
  await press('Enter', 110, 1200);
  s = await until(async () => { const v = await state(); return v.console === 0 ? v : null; }, 5000) || await state();
  T('Enter on the empty line closes it', s.console === 0, JSON.stringify(s));

  // ---- 4. the page's keys again
  const fs1 = s.fs, fps1 = s.fps;
  await press('KeyN', 110, 500);
  T('with the console closed N flips the FPS readout', (await state()).fps !== fps1);
  await press('KeyN', 110, 500);
  await press('KeyF', 110, 800);
  T('and F asks for fullscreen', (await state()).fs === fs1 + 1, `${fs1} -> ${(await state()).fs}`);
  await page.evaluate(() => { if (document.fullscreenElement) return document.exitFullscreen(); return null; }).catch(() => {});

  // ---- 5. after a reload
  // the choice as the paper stores it (the run above set the game's switch directly)
  await page.evaluate(() => window.isaacConsoleTag.toggle());       // on -> off
  await page.evaluate(() => window.isaacConsoleTag.toggle());       // off -> on, stored
  T('the stored options.ini says 1 before the reload', await until(async () => (await stored()) === '1', 4000), await stored());
  writeFileSync(join(OUT, 'first.console.log'), con.join('\n') + '\n');
  await boot();
  s = await state();
  T('after a reload the switch is still on', s.on === true, JSON.stringify(s));
  T('no page error', !con.some((l) => /PAGEERROR/.test(l)), con.filter((l) => /PAGEERROR/.test(l)).slice(0, 2).join(' | '));
} catch (e) {
  T('the drive ran', false, e && e.stack || e);
} finally {
  writeFileSync(join(OUT, 'console.log'), con.join('\n') + '\n');
  await browser.close();
}
console.log(`CONSOLE END ${checks} ${failed}`);
process.exit(failed ? 1 : 0);
