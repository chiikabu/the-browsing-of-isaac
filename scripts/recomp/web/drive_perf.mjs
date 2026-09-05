// drive_perf.mjs -- frame rate of the live page under a Chromebook-like budget.
//
// Chromium with the machine's real GPU (ANGLE over D3D11 here; SwiftShader
// with gl=swiftshader) and the CDP CPU throttle (Emulation.setCPUThrottlingRate)
// standing in for a slow CPU. Drives the interactive page like
// drive_interactive.mjs: Enter until the game logs a run, then samples the
// host's frame counter once a second for `seconds` while walking and firing.
//
//   node scripts/recomp/web/drive_perf.mjs <url> <out-dir> [cpu=4] [gl=hw|swiftshader] [seconds=30]
//
// Writes summary.json (fps samples in the menus and in play, medians, the
// page's own present timings if it exposes them) and console.log. Exit 0
// when the run started and play fps was sampled.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', '..', 'package.json'));
const { chromium } = require('playwright');

const URL = process.argv[2];
const OUT = process.argv[3] || join(HERE, '..', '..', '..', 'output', 'recomp', 'web-perf');
const opt = Object.fromEntries(process.argv.slice(4).map((a) => a.split('=')));
const CPU = Number(opt.cpu || '4');
const GL = opt.gl || 'hw';
const SECONDS = Number(opt.seconds || '30');
if (!URL) { console.log('usage: node drive_perf.mjs <url> <out-dir> [cpu=4] [gl=hw|swiftshader] [seconds=30]'); process.exit(2); }
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const glArgs = GL === 'swiftshader'
  ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  : ['--use-gl=angle', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'];
const browser = await chromium.launch({ headless: true, args: [...glArgs, '--autoplay-policy=no-user-gesture-required', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
const consoleLines = [];
page.on('console', (m) => consoleLines.push(m.text()));
const cdp = await page.context().newCDPSession(page);
if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
const t0 = Date.now();
const now = () => Date.now() - t0;
const summary = { url: URL, cpu: CPU, gl: GL, seconds: SECONDS, renderer: null, runStartedFrame: null, runStartedMs: null,
                  fpsMenu: [], fpsPlay: [], medianMenu: null, medianPlay: null, error: null };
const state = () => page.evaluate(() => ({ f: window.isaacFrame || 0, done: window.isaacDone, n: (window.isaacLog || []).length }));
const logMatch = (re) => page.evaluate((src) => {
  const r = new RegExp(src);
  const log = window.isaacLog || [];
  for (let i = log.length - 1; i >= 0; i--) if (r.test(log[i])) return log[i];
  return null;
}, re.source);
const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : null; };
try {
  for (let attempt = 1; ; attempt++) {
    try { await page.goto(URL); break; } catch (e) { if (attempt >= 30) throw e; await sleep(1000); }
  }
  summary.renderer = await page.evaluate(() => {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : (gl ? 'webgl (renderer masked)' : 'no webgl');
    } catch (e) { return 'error: ' + e.message; }
  });
  console.log(`[perf] renderer: ${summary.renderer}; cpu throttle x${CPU}`);
  for (;;) {                                   // first frame
    const s = await state();
    if (s.f > 0) break;
    if (s.done) throw new Error('module ended before the first frame');
    if (now() > 600000) throw new Error('timeout before the first frame');
    await sleep(250);
  }
  // menu fps for 5 s, then Enter until the run starts
  let last = (await state()).f, lastT = now();
  for (let i = 0; i < 5; i++) { await sleep(1000); const s = await state(); summary.fpsMenu.push((s.f - last) * 1000 / (now() - lastT)); last = s.f; lastT = now(); }
  const startRe = /Room 1\.2\(Start Room\)|Starting room transition/;
  let enters = 0;
  for (;;) {
    if (await logMatch(startRe)) { const s = await state(); summary.runStartedFrame = s.f; summary.runStartedMs = now(); break; }
    if (enters >= 40 || now() > 600000) throw new Error(`no run after ${enters} Enter(s)`);
    await page.keyboard.down('Enter'); await sleep(120); await page.keyboard.up('Enter');
    enters += 1; await sleep(1500);
  }
  console.log(`[perf] run started at frame ${summary.runStartedFrame} (${summary.runStartedMs} ms) after ${enters} Enter(s)`);
  // play: walk in a square and fire, sampling fps each second
  const walk = ['KeyD', 'KeyS', 'KeyA', 'KeyW'], fire = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
  last = (await state()).f; lastT = now();
  for (let i = 0; i < SECONDS; i++) {
    const k = walk[i % 4], f = fire[i % 4];
    await page.keyboard.down(k); await page.keyboard.down(f);
    await sleep(1000);
    await page.keyboard.up(k); await page.keyboard.up(f);
    const s = await state();
    summary.fpsPlay.push(Number(((s.f - last) * 1000 / (now() - lastT)).toFixed(1)));
    last = s.f; lastT = now();
    if (s.done) break;
  }
  summary.medianMenu = median(summary.fpsMenu); summary.medianPlay = median(summary.fpsPlay);
  console.log(`[perf] fps menu median ${summary.medianMenu && summary.medianMenu.toFixed(1)}; play median ${summary.medianPlay} over ${summary.fpsPlay.length} s: ${summary.fpsPlay.join(' ')}`);
} catch (e) {
  summary.error = e.message;
  console.log(`[perf] ERROR ${e.message}`);
}
writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
writeFileSync(join(OUT, 'console.log'), consoleLines.join('\n'));
await browser.close();
process.exit(summary.error || !summary.fpsPlay.length ? 1 : 0);
