// drive_nomods.mjs -- the three ways out of a mod that stops the boot (round 101):
//
//   node scripts/recomp/web/drive_nomods.mjs http://127.0.0.1:8200/play.html <out-dir>
//
// A player installed a mod that broke the start of the game and could not get
// back in to turn it off: the only switch was behind the boot. This installs a
// mod the way a player does and then checks, against the engine's own log:
//   1. a boot that never reached the game is asked about before the next one,
//      "Try again" boots with the mod, and reaching the game clears the mark;
//   2. "Start without mods" turns the mod off (not seeded, still installed);
//   3. ?mods=0 does the same from the address bar;
//   4. the error panel offers "Reload without ..." when a mod is on.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { zipStore } from './zip.mjs';

const [URL, OUT] = process.argv.slice(2);
if (!URL || !OUT) { console.log('usage: node drive_nomods.mjs <url> <out-dir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (ok, what, detail) => { checks.push({ ok: !!ok, what, detail: detail || '' }); console.log(`[nomods] ${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' -- ' + detail : ''}`); };

const enc = new TextEncoder();
const modZip = async () => Buffer.from(await zipStore([
  { name: 'safe mode probe/metadata.xml', bytes: enc.encode('<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n  <name>safe mode probe</name>\n  <directory>safe mode probe</directory>\n  <description>x</description>\n  <version>1</version>\n</metadata>\n') },
  { name: 'safe mode probe/main.lua', bytes: enc.encode('local m = RegisterMod("safe mode probe", 1)\nIsaac.DebugString("PROBE MOD RAN")\n') },
]).arrayBuffer());

const browser = await chromium.launch({ headless: true, args: ['--use-angle=default', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
const context = await browser.newContext({ viewport: { width: 960, height: 540 } });
const page = await context.newPage();
const con = [];
page.on('console', (m) => con.push(m.text()));
const logHas = (re) => page.evaluate((src) => (window.isaacLog || []).some((l) => new RegExp(src).test(String(l))), re.source).catch(() => false);
const until = async (fn, ms, what) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v) return v; if (Date.now() > end) throw new Error('timeout: ' + what); await sleep(300); } };
const mark = () => page.evaluate(() => localStorage.getItem('isaac-boot-with-mods'));
const ready = () => page.evaluate(() => document.getElementById('overlay') && document.getElementById('overlay').hidden === true).catch(() => false);
const panel = () => page.evaluate(() => { const p = document.getElementById('error'); return p && !p.hidden ? { title: document.getElementById('error-title').textContent, nomods: !document.getElementById('nomods-btn').hidden, label: document.getElementById('nomods-btn').textContent } : null; }).catch(() => null);
const base = URL.split('?')[0];

try {
  // install, on a page that does not boot by itself
  await page.goto(base + '?autoplay=0', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#mods-file', { state: 'attached', timeout: 120000 });
  await page.setInputFiles('#mods-file', { name: 'probe.zip', mimeType: 'application/zip', buffer: await modZip() });
  await until(() => con.some((l) => /^\[mods\] .*: \d+ file\(s\)$/.test(l)), 60000, 'the import');
  check(true, 'a mod installed through the page');

  // 1. an ordinary boot with the mod: no question, the mark is set and then cleared
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await until(async () => (await mark()) || (await ready()), 60000, 'the mark');
  check(!(await panel()), 'no question on an ordinary boot');
  await until(ready, 240000, 'the game');
  check(await logHas(/PROBE MOD RAN/), 'the mod ran');
  check((await mark()) === null, 'reaching the game clears the mark');

  // a boot that never arrived: the mark is still there at the next load
  await page.evaluate(() => localStorage.setItem('isaac-boot-with-mods', String(Date.now())));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const q = await until(panel, 60000, 'the question');
  check(/did not finish starting/.test(q.title) && q.nomods, 'the next load asks before booting', `${q.title} / ${q.label}`);
  check(!(await page.evaluate(() => (window.isaacLog || []).some((l) => /=== place memory image ===/.test(String(l))))), 'nothing has booted while it asks');
  await page.click('#dismiss-btn');
  await until(ready, 240000, 'the game after Try again');
  check(await logHas(/PROBE MOD RAN/), '"Try again" boots with the mod');

  // 2. the same question, answered the other way
  await page.evaluate(() => localStorage.setItem('isaac-boot-with-mods', String(Date.now())));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await until(panel, 60000, 'the question again');
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), page.click('#nomods-btn')]);
  await until(ready, 240000, 'the game without mods');
  check(!(await logHas(/PROBE MOD RAN/)), '"Start without mods" boots without the mod');
  const still = await page.evaluate(() => new Promise((res) => { const q = indexedDB.open('isaac-mods'); q.onsuccess = () => { try { const r = q.result.transaction('mods').objectStore('mods').getAll(); r.onsuccess = () => res(r.result.map((m) => ({ id: m.id, enabled: m.enabled }))); r.onerror = () => res(null); } catch (e) { res(String(e)); } }; q.onerror = () => res(null); }));
  check(Array.isArray(still) && still.length === 1 && still[0].enabled === false, 'the mod is off, not deleted', JSON.stringify(still));
  check((await mark()) === null, 'no mark without mods');

  // 3. ?mods=0, with the mod switched back on first
  await page.evaluate(() => new Promise((res) => { const q = indexedDB.open('isaac-mods'); q.onsuccess = () => { const tx = q.result.transaction('mods', 'readwrite'), st = tx.objectStore('mods'); const c = st.openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { const v = cur.value; v.enabled = true; cur.update(v); cur.continue(); } }; tx.oncomplete = () => res(true); }; }));
  await page.goto(base + '?mods=0', { waitUntil: 'domcontentloaded' });
  await until(ready, 240000, 'the game with ?mods=0');
  check(!(await logHas(/PROBE MOD RAN/)) && con.some((l) => /\?mods=0: starting without mods \(1 turned off/.test(l)), '?mods=0 boots without the mod and says so');

  // 4. the error panel, with the mod on again
  await page.evaluate(() => new Promise((res) => { const q = indexedDB.open('isaac-mods'); q.onsuccess = () => { const tx = q.result.transaction('mods', 'readwrite'), st = tx.objectStore('mods'); const c = st.openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { const v = cur.value; v.enabled = true; cur.update(v); cur.continue(); } }; tx.oncomplete = () => res(true); }; }));
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await until(ready, 240000, 'the game with the mod back on');
  await page.evaluate(() => window.isaacPageHooks.onLog('  TRAP in main @ 0x00931050: a stop made up by drive_nomods'));
  const e = await until(async () => { const p = await panel(); return p && p.nomods ? p : null; }, 20000, 'the error panel');
  check(/module stopped/i.test(e.title) && /Reload without the mod/.test(e.label), 'the error panel offers a reload without the mod', `${e.title} / ${e.label}`);
  await Promise.all([page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 }), page.click('#nomods-btn')]);
  await until(ready, 240000, 'the game after the panel button');
  check(!(await logHas(/PROBE MOD RAN/)), 'the panel button reloads without the mod');
} catch (err) {
  check(false, 'the drive', String(err && err.message || err));
  try { await page.screenshot({ path: join(OUT, 'failure.png') }); } catch (e2) { /* page gone */ }
}
writeFileSync(join(OUT, 'nomods.json'), JSON.stringify({ url: URL, checks }, null, 1));
writeFileSync(join(OUT, 'console.log'), con.join('\n'));
await browser.close();
const bad = checks.filter((c) => !c.ok).length;
console.log(`[nomods] ${bad ? 'FAIL' : 'PASS'}: ${checks.length - bad}/${checks.length} checks`);
process.exit(bad ? 1 : 0);
