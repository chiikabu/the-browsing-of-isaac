// drive_memory.mjs -- where the renderer's memory goes, by allocator (round 60):
//   node scripts/recomp/web/drive_memory.mjs http://127.0.0.1:8200/play.html <out-dir> [gl=hw] [cpu=1] [frame=600] [options=<ini> stage=2]
// The page boots, plays to `frame` (and, with options= and stage=, into a floor by
// console as drive_floors does), then Chrome's memory-infra takes a detailed
// dump through CDP tracing: every allocator's effective size in the renderer
// (v8 heaps and code, wasm memory as array buffers, blink, partition_alloc,
// malloc, skia, the discardable and shared memory) and in the GPU process.
// The top allocators and the totals are printed and written to <out-dir>/memory.json.
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [URL, OUT, ...rest] = process.argv.slice(2);
if (!URL || !OUT) { console.log('usage: node drive_memory.mjs <url> <out-dir> [gl=hw] [cpu=1] [frame=600] [options=<ini> stage=2]'); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')));
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const glArgs = (opt.gl || 'hw') === 'hw' ? ['--use-angle=default', '--ignore-gpu-blocklist'] : ['--use-gl=angle', '--use-angle=swiftshader'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
const cdp = await page.context().newCDPSession(page);
const cpu = Number(opt.cpu || '1');
if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
const state = () => page.evaluate(() => ({ f: window.isaacFrame || 0 }));
const until = async (fn, ms, what) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v) return v; if (Date.now() > end) throw new Error(`timeout: ${what}`); await sleep(150); } };
const hold = async (key, ms = 90) => { await page.keyboard.down(key); await sleep(ms); await page.keyboard.up(key); };
const logMatch = (re, since = 0) => page.evaluate(([src, s]) => { const r = new RegExp(src); const log = window.isaacLog || []; for (let i = log.length - 1; i >= s; i--) if (r.test(log[i])) return log[i]; return null; }, [re.source, since]);
const t0 = Date.now();
const out = { url: URL, cpu, frame: Number(opt.frame || '600') };
try {
  if (opt.options) {
    const origin = new globalThis.URL(URL).origin;
    const bytes = [...readFileSync(opt.options)];
    await page.goto(origin + '/instance_index.json').catch(() => {});
    await page.evaluate(async (arr) => new Promise((resolve) => {
      const req = indexedDB.open('isaac-saves', 1);
      req.onupgradeneeded = () => { req.result.createObjectStore('files'); };
      req.onerror = () => resolve('open failed');
      req.onsuccess = () => { const db = req.result, tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put({ src: null, bytes: new Uint8Array(arr) }, 'c:/isaac/documents/my games/binding of isaac repentance+/options.ini'); tx.oncomplete = () => { db.close(); resolve('ok'); }; };
    }), bytes);
  }
  await page.goto(URL);
  await until(async () => (await state()).f >= out.frame, 600000, `frame ${out.frame}`);
  console.log(`[memory] frame ${out.frame} at ${Date.now() - t0} ms`);
  if (opt.stage) {
    // into a run the floors driver's way: Enter until the first level inits, then `stage N` in the console
    let enters = 0;
    for (;;) {
      if (await logMatch(/Level::Init m_Stage|RNG Start Seed/)) break;
      if (enters >= 10) throw new Error('no run after 10 Enters');
      await hold('Enter'); enters += 1; await sleep(1500);
    }
    await sleep(2500);
    const num = parseInt(opt.stage, 10);
    const before = await page.evaluate(() => (window.isaacLog || []).length);
    await hold('Backquote', 120); await sleep(600);
    await page.keyboard.type(`stage ${opt.stage}`, { delay: 70 }); await sleep(200);
    await hold('Enter', 120);
    await until(async () => logMatch(new RegExp(`Level::Init m_Stage ${num}, m_StageType (\\d+)`), before), 15000, `stage ${opt.stage}`);
    await sleep(2500);
    await hold('Backquote', 120); await sleep(400);
    await sleep(2000);
    console.log(`[memory] stage ${opt.stage} at ${Date.now() - t0} ms`);
  }
  await sleep(2000);
  // a detailed memory-infra dump through tracing
  const dumps = [];
  cdp.on('Tracing.dataCollected', (e) => { for (const ev of e.value || []) if (ev.ph === 'v' && ev.args && ev.args.dumps) dumps.push(ev); });
  const done = new Promise((r) => cdp.once('Tracing.tracingComplete', r));
  await cdp.send('Tracing.start', { transferMode: 'ReportEvents', traceConfig: { includedCategories: ['disabled-by-default-memory-infra'], memoryDumpConfig: { triggers: [{ mode: 'detailed', periodic_interval_ms: 1000 }] } } });
  await sleep(2600);
  await cdp.send('Tracing.end');
  await done;
  // the last dump per process; sizes from effective_size (else size)
  const byPid = new Map();
  for (const ev of dumps) byPid.set(ev.pid, ev);
  const hex = (v) => (typeof v === 'string' ? parseInt(v, 16) : Number(v || 0));
  const procs = [];
  for (const [pid, ev] of byPid) {
    const allocs = ev.args.dumps.allocators || {};
    const rows = [];
    for (const [name, a] of Object.entries(allocs)) {
      const attrs = a.attrs || {};
      const eff = attrs.effective_size ? hex(attrs.effective_size.value) : (attrs.size ? hex(attrs.size.value) : 0);
      const size = attrs.size ? hex(attrs.size.value) : 0;
      rows.push({ name, effective: eff, size });
    }
    const totals = ev.args.dumps.process_totals || {};
    const resident = totals.resident_set_bytes ? hex(totals.resident_set_bytes) : 0;
    const priv = totals.private_footprint_bytes ? hex(totals.private_footprint_bytes) : 0;
    // top-level allocators (no slash) carry the roll-ups
    const top = rows.filter((r) => !r.name.includes('/')).sort((a, b) => b.effective - a.effective);
    const leaves = rows.filter((r) => r.name.includes('/')).sort((a, b) => b.effective - a.effective).slice(0, 30);
    procs.push({ pid, resident, privateFootprint: priv, top, leaves, level: ev.args.dumps.level_of_detail });
  }
  procs.sort((a, b) => b.resident - a.resident);
  const mb = (n) => (n / 1048576).toFixed(1);
  for (const p of procs) {
    console.log(`[memory] pid ${p.pid}: resident ${mb(p.resident)} MB, private footprint ${mb(p.privateFootprint)} MB (${p.level})`);
    for (const r of p.top.slice(0, 12)) console.log(`[memory]   ${mb(r.effective).padStart(8)} MB  ${r.name}`);
    console.log('[memory]   -- the largest leaves:');
    for (const r of p.leaves.slice(0, 22)) console.log(`[memory]   ${mb(r.effective).padStart(8)} MB  ${r.name}`);
  }
  out.processes = procs;
  out.errors = errors;
  writeFileSync(join(OUT, 'memory.json'), JSON.stringify(out, null, 1));
  console.log(`[memory] ${dumps.length} dump event(s), ${procs.length} process(es); errors ${errors.length}`);
} catch (e) {
  console.log(`[memory] FAIL ${e.message}`);
  await browser.close();
  process.exit(1);
}
await browser.close();
