// drive_mods.mjs -- a mod imported the way a player would, on the shipping page
// (round 74):
//   node scripts/recomp/web/drive_mods.mjs http://127.0.0.1:8200/play.html <out-dir> [gl=hw|swiftshader] [options=<ini>]
//
// Title -> file select -> file 1 -> Tab for the mods list -> Enter on the IMPORT
// MOD row. That row is a mod the pipeline seeds, so the engine lists it like any
// other, and Enter on it makes the engine write a disable.it into its folder --
// which the page claims instead of storing, and opens its own menu with. Then a
// zip built here goes through the picker, the page reloads, and the engine is
// asked whether it found the mod: `LOADED MOD` in its own log, from its own scan.
//
// It also checks the thing that would be worst to get wrong: a save written
// before the import is still there afterwards, byte for byte, and removing the
// mod again does not touch it. Mods and saves are separate databases and this is
// the test that says so.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateRawSync } from 'node:zlib';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) { console.log('usage: node drive_mods.mjs <url> <out-dir> [gl=hw] [options=<ini>]'); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const consoleLines = [];
page.on('console', (m) => consoleLines.push(m.text()));
page.on('pageerror', (e) => consoleLines.push('PAGEERROR ' + e));
const checks = [];
const check = (ok, what, detail) => { checks.push(!!ok); console.log(`[mods] ${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' -- ' + detail : ''}`); };
const hold = async (key, ms = 90) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); };
const until = async (fn, ms, what) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v) return v; if (Date.now() > end) throw new Error(`timeout: ${what}`); await sleep(150); } };
const frame = () => page.evaluate(() => window.isaacFrame | 0);
const menuOpen = () => page.evaluate(() => !!(window.isaacModsMenu && window.isaacModsMenu.isOpen()));
const logMatch = (re) => page.evaluate((src) => {
  const r = new RegExp(src), log = window.isaacLog || [];
  for (let i = log.length - 1; i >= 0; i--) if (r.test(String(log[i]))) return String(log[i]).slice(0, 200);
  return null;
}, re.source);

// ---- a mod, zipped here: deflated entries and a folder above them, which is how
// a mod comes off a download page and the shape the importer has to see through
const MOD_DIR = 'Driver Test Mod';
const MOD_FILES = [
  [`${MOD_DIR}/metadata.xml`, '<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n  <name>Driver Test Mod</name>\n'
    + '  <directory>drivertestmod</directory>\n  <description>written by drive_mods.mjs</description>\n  <version>1</version>\n</metadata>\n'],
  [`${MOD_DIR}/main.lua`, 'local mod = RegisterMod("Driver Test Mod", 1)\nreturn mod\n'],
  [`${MOD_DIR}/content/isaac.xml`, '<!-- a file deep enough to prove the tree survives -->\n'],
];
function zipOf(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c; }
  const crc32 = (b) => { let c = -1; for (let i = 0; i < b.length; i++) c = table[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; };
  let offset = 0;
  for (const [name, text] of files) {
    const raw = enc.encode(text), comp = deflateRawSync(raw), n = enc.encode(name), crc = crc32(raw);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 8, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, comp.length, true); lh.setUint32(22, raw.length, true);
    lh.setUint16(26, n.length, true);
    parts.push(Buffer.from(lh.buffer), Buffer.from(n), comp);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true); cd.setUint16(10, 8, true);
    cd.setUint32(16, crc, true); cd.setUint32(20, comp.length, true); cd.setUint32(24, raw.length, true);
    cd.setUint16(28, n.length, true); cd.setUint32(42, offset, true);
    central.push(Buffer.from(cd.buffer), Buffer.from(n));
    offset += 30 + n.length + comp.length;
  }
  const cdBuf = Buffer.concat(central);
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(8, files.length, true); eocd.setUint16(10, files.length, true);
  eocd.setUint32(12, cdBuf.length, true); eocd.setUint32(16, offset, true);
  return Buffer.concat([...parts, cdBuf, Buffer.from(eocd.buffer)]);
}
const zip = zipOf(MOD_FILES);
writeFileSync(join(OUT, 'driver-test-mod.zip'), zip);

// A witness in the save store rather than a real persistentgamedata1.dat: the
// engine validates those at the file-select screen and would stop on a made-up
// one. What is being tested is the store, and any key in it proves the point.
const SAVE_KEY = 'c:/isaac/documents/my games/binding of isaac repentance+/drive-mods-witness.dat';
const SAVE_BYTES = [...Buffer.from('a save written before any mod existed')];

try {
  const origin = new globalThis.URL(URL).origin;
  await page.goto(origin + '/instance_index.json').catch(() => {});
  // a save, and the options the drivers use, before anything else happens
  const seeded = await page.evaluate(async ([ini, save, saveKey, optKey]) => new Promise((resolve) => {
    const req = indexedDB.open('isaac-saves', 1);
    req.onupgradeneeded = () => { req.result.createObjectStore('files'); };
    req.onerror = () => resolve('open failed: ' + req.error);
    req.onsuccess = () => {
      const db = req.result, tx = db.transaction('files', 'readwrite'), st = tx.objectStore('files');
      if (ini) st.put({ src: null, bytes: new Uint8Array(ini) }, optKey);
      st.put({ src: null, bytes: new Uint8Array(save) }, saveKey);
      tx.oncomplete = () => { db.close(); resolve('ok'); };
      tx.onerror = () => resolve('tx failed: ' + tx.error);
    };
  }), [opt.options ? [...readFileSync(opt.options)] : null, SAVE_BYTES, SAVE_KEY,
       'c:/isaac/documents/my games/binding of isaac repentance+/options.ini']);
  check(seeded === 'ok', 'a save and the options are in the save store before the run', String(seeded));

  await page.goto(URL);
  await until(async () => (await frame()) > 0, 600000, 'first frame');
  await until(async () => (await frame()) > 150, 120000, 'the engine running');
  check(!!(await logMatch(/=== seed mods ===/)), 'the pipeline seeded mods');
  check(!!(await logMatch(/LOADED MOD .*import mod/i)), 'the engine found the IMPORT MOD row on its own scan',
    (await logMatch(/LOADED MOD .*import mod/i)) || '');

  // title -> file select -> file 1 -> the mods list
  await hold('Enter'); await sleep(1800);
  await hold('Enter'); await sleep(2600);
  await hold('Enter'); await sleep(2200);
  await hold('Tab'); await sleep(2000);
  await page.screenshot({ path: join(OUT, '1-mods-list.png') });
  await hold('Enter');
  await until(menuOpen, 8000, 'the import menu opening');
  check(true, 'Enter on the IMPORT MOD row opened the import menu');
  await sleep(400);
  await page.screenshot({ path: join(OUT, '2-import-menu.png') });

  // the zip through the picker, exactly as a chosen file arrives
  await page.setInputFiles('#mods-file', { name: 'driver-test-mod.zip', mimeType: 'application/zip', buffer: zip });
  const status = await until(async () => {
    const t = await page.evaluate(() => (document.getElementById('mods-status') || {}).textContent || '');
    return t && !/^reading/.test(t) ? t : null;
  }, 15000, 'the import finishing');
  check(/Driver Test Mod: 3 file\(s\)/.test(status), 'the zip imported, folder above it and all', status);
  const rows = await page.evaluate(() => Array.from(document.querySelectorAll('#mods-rows tr')).map((r) => r.children[0].textContent));
  check(rows.length === 1 && rows[0] === 'Driver Test Mod', 'the menu lists it', JSON.stringify(rows));
  const reloadShown = await page.evaluate(() => !document.getElementById('mods-reload').hidden);
  check(reloadShown, 'the menu asks for a reload rather than pretending it landed live');
  await page.screenshot({ path: join(OUT, '3-imported.png') });

  // the store, from the outside: the mod is in its own database and the save is untouched
  const stores = await page.evaluate(async ([saveKey]) => {
    const open = (name) => new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const readAll = (db, store) => new Promise((res) => {
      const out = []; const r = db.transaction(store, 'readonly').objectStore(store).openCursor();
      r.onsuccess = () => { const c = r.result; if (!c) { res(out); return; } out.push([String(c.key), c.value]); c.continue(); };
      r.onerror = () => res(out);
    });
    const md = await open('isaac-mods'), sd = await open('isaac-saves');
    const files = await readAll(md, 'files'), mods = await readAll(md, 'mods');
    const saves = await readAll(sd, 'files');
    const save = saves.find(([k]) => k === saveKey);
    md.close(); sd.close();
    return {
      modFiles: files.map(([k]) => k).sort(),
      modIds: mods.map(([k]) => k),
      saveText: save ? new TextDecoder().decode(save[1].bytes) : null,
      saveKeysWithMods: saves.map(([k]) => k).filter((k) => k.includes('/mods/')),
    };
  }, [SAVE_KEY]);
  check(stores.modIds.length === 1 && stores.modIds[0] === 'drivertestmod', 'the mod is keyed by its own directory', JSON.stringify(stores.modIds));
  check(stores.modFiles.join('|') === 'drivertestmod/content/isaac.xml|drivertestmod/main.lua|drivertestmod/metadata.xml',
    'the tree survived the zip, root folder peeled off', stores.modFiles.join(' '));
  check(stores.saveText === 'a save written before any mod existed', 'the save is byte for byte what it was', String(stores.saveText).slice(0, 40));
  check(stores.saveKeysWithMods.length === 0, 'nothing under mods/ leaked into the save store', JSON.stringify(stores.saveKeysWithMods));

  // the reload: the engine's own scan is the only witness that counts
  await page.reload();
  await until(async () => (await frame()) > 0, 600000, 'first frame after the reload');
  await until(async () => (await frame()) > 150, 120000, 'the engine running again');
  const seedLine = await logMatch(/Driver Test Mod \(drivertestmod\)/);
  check(!!seedLine, 'the pipeline seeded it at the next boot', seedLine || '');
  const loaded = await logMatch(/LOADED MOD .*drivertestmod/i);
  check(!!loaded, 'the engine loaded it from mods/ by its own scan', loaded || '');
  await hold('Enter'); await sleep(1800);
  await hold('Enter'); await sleep(2600);
  await hold('Enter'); await sleep(2200);
  await hold('Tab'); await sleep(2000);
  await page.screenshot({ path: join(OUT, '4-mods-list-after.png') });
  // two mods now, and the import row is still the one the cursor starts on: its
  // folder name begins with a space, so the engine's sort keeps it at the top
  const listed = await page.evaluate(() => {
    const c = document.getElementById('canvas');
    return c ? c.width + 'x' + c.height : 'no canvas';
  });
  check(listed !== 'no canvas', 'the game is still running after the reload', listed);

  // and taking it away again
  await hold('Enter');
  await until(menuOpen, 8000, 'the import menu opening again');
  await page.evaluate(() => document.querySelector('#mods-rows button').click());
  const gone = await until(async () => {
    const t = await page.evaluate(() => (document.getElementById('mods-status') || {}).textContent || '');
    return /removed/.test(t) ? t : null;
  }, 8000, 'the removal');
  check(/Driver Test Mod removed/.test(gone), 'removing it says so', gone);
  const after = await page.evaluate(async ([saveKey]) => {
    const open = (name) => new Promise((res, rej) => { const r = indexedDB.open(name); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const readAll = (db, store) => new Promise((res) => {
      const out = []; const r = db.transaction(store, 'readonly').objectStore(store).openCursor();
      r.onsuccess = () => { const c = r.result; if (!c) { res(out); return; } out.push([String(c.key), c.value]); c.continue(); };
      r.onerror = () => res(out);
    });
    const md = await open('isaac-mods'), sd = await open('isaac-saves');
    const files = await readAll(md, 'files'), saves = await readAll(sd, 'files');
    const save = saves.find(([k]) => k === saveKey);
    md.close(); sd.close();
    return { left: files.length, saveText: save ? new TextDecoder().decode(save[1].bytes) : null };
  }, [SAVE_KEY]);
  check(after.left === 0, 'its files went with it', `${after.left} left`);
  check(after.saveText === 'a save written before any mod existed', 'the save survived the removal too');
  await page.screenshot({ path: join(OUT, '5-removed.png') });
} catch (e) {
  check(false, 'the run finished', e.message);
} finally {
  writeFileSync(join(OUT, 'console.log'), consoleLines.join('\n'));
  await browser.close();
  const bad = checks.filter((c) => !c).length;
  console.log(`[mods] ${bad ? 'FAIL' : 'PASS'}: ${checks.length - bad}/${checks.length} checks`);
  process.exit(bad ? 1 : 0);
}
