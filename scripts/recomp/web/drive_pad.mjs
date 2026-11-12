// drive_pad.mjs -- a controller on a phone, end to end (issue #12).
//
//   node scripts/recomp/web/drive_pad.mjs <url> [kind=phone|desktop] [late=1|0] [timeout=900] [cpu=1]
//
// An Android phone emulated in Chromium (Android Chrome user agent, touch,
// a landscape phone viewport) with a scripted Xbox Series pad standing in for
// navigator.getGamepads(): standard mapping, the id Chrome gives a 045e:0b13.
// As Chrome on Android does, the pad is not there when the page loads: it
// appears with its first button press, after the boot, with a
// gamepadconnected event (late=0 has it there from the start instead).
// Then, the way the reporter of #12 played:
//   1. the game takes the pad in: its log reaches "Gamepad identified as"
//      (the hot-plug poller's connect callback ran to the end, so the
//      InputManager has a Gamepad for it);
//   2. A on the pad goes through the title and the file screen;
//   3. a run is started with the touch keys (source 'touch'), so the
//      keyboard has the player;
//   4. pause -> OPTIONS -> CHANGE CONTROLLER -> A on the pad at
//      "SELECT A CONTROLLER!": the player is given the pad's controller id;
//   5. back in the run, the left stick at 30 degrees walks Isaac at that
//      angle (keys give 0 or 45) and the right stick fires.
// Prints one line per check and exits 0 only when all pass (1 on a failed
// check, 2 on a usage error, 3 when the page never booted).
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', '..', 'package.json'));
const { chromium } = require('playwright');

const URL = process.argv[2];
const opt = Object.fromEntries(process.argv.slice(3).map((a) => [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)]));
if (!URL) { console.log('usage: node drive_pad.mjs <url> [kind=phone|desktop] [late=1|0] [timeout=900] [cpu=1]'); process.exit(2); }
const KIND = opt.kind || 'phone';
const LATE = opt.late !== '0';
const TIMEOUT_MS = Number(opt.timeout || 900) * 1000;
const CPU = Number(opt.cpu || 1);
const PHONE = KIND === 'phone';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 15; 23049PCD8G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36';
const PAD_ID = 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e Product: 0b13)';
// the standard mapping's indices
const A = 0, B = 1;

// In the page, before any of its scripts: a Gamepad the driver moves.
function fakePad({ id, late }) {
  const pad = { id, index: 0, connected: true, mapping: 'standard', timestamp: 0, vibrationActuator: null,
    axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })) };
  let shown = !late;
  window.__pad = {
    press(i, on) { pad.buttons[i] = { pressed: on, touched: on, value: on ? 1 : 0 }; pad.timestamp += 1; },
    axes(a) { pad.axes = a.slice(); pad.timestamp += 1; },
    // Chrome shows a pad to a page with the press that wakes it
    connect() {
      shown = true;
      const e = new Event('gamepadconnected');
      e.gamepad = pad;
      window.dispatchEvent(e);
    },
  };
  navigator.getGamepads = () => (shown ? [pad, null, null, null] : [null, null, null, null]);
}

const results = [];
const thrLines = [];
const check = (ok, what, detail = '') => { results.push(!!ok); console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${detail ? ' -- ' + detail : ''}`); };

async function boot(browser) {
  const context = await browser.newContext(PHONE
    ? { viewport: { width: 915, height: 412 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, userAgent: ANDROID_UA }
    : { viewport: { width: 960, height: 540 } });
  await context.addInitScript(fakePad, { id: PAD_ID, late: LATE });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log(`pageerror ${e.message}`));
  // the host's own lines (isaac_log is console.warn, not isaacLog)
  page.on('console', (m) => { const t = m.text(); if (/\[isaac\]\[thr\]/.test(t)) thrLines.push(t); });
  await page.goto(`${URL}${URL.includes('?') ? '&' : '?'}persist=0`);
  await page.waitForFunction(() => window.isaacGuest && window.isaacFrame > 30 && document.getElementById('overlay').hidden,
    null, { timeout: TIMEOUT_MS });
  return { context, page };
}

const browser = await chromium.launch({ headless: true,
  args: ['--use-angle=default', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
let s = null;
for (let attempt = 1; attempt <= 2 && !s; attempt++) {
  const t0 = Date.now();
  try {
    s = await boot(browser);
    console.log(`booted (${KIND}, pad ${LATE ? 'appears after the boot' : 'there from the start'}) in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  } catch (e) {
    console.log(`boot attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
  }
}
if (!s) { await browser.close(); console.log('FAIL the page never booted'); process.exit(3); }
const { page } = s;
if (CPU > 1) { const cdp = await s.context.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU }); }

const SRC = PHONE ? 'touch' : 'injected';
const key = async (k, ms = 120) => {
  await page.evaluate(([k, src]) => window.isaacInjectKey(k, true, src), [k, SRC]); await sleep(ms);
  await page.evaluate(([k, src]) => window.isaacInjectKey(k, false, src), [k, SRC]); await sleep(200);
};
const press = async (i, ms = 150) => {
  await page.evaluate((i) => window.__pad.press(i, true), i); await sleep(ms);
  await page.evaluate((i) => window.__pad.press(i, false), i); await sleep(200);
};
const axes = (a) => page.evaluate((a) => window.__pad.axes(a), a);
const logFrom = (n) => page.evaluate((n) => (window.isaacLog || []).slice(n), n);
const logLen = () => page.evaluate(() => (window.isaacLog || []).length);
const screen = () => page.evaluate(() => { const G = window.isaacGuest, m = G.u32(0xc72a20); return m ? G.u32(m + 0x40) | 0 : -1; });
const inRun = () => page.evaluate(() => { const G = window.isaacGuest, g = G.u32(0xc71678); return !!g && G.u32(g + 0x264f8) > 0; });
const gameCursor = () => page.evaluate(() => { const G = window.isaacGuest, m = G.u32(0xc72a20); return m ? G.u32(m + 0xb94) | 0 : -1; });
const pause = () => page.evaluate(() => {
  const G = window.isaacGuest, g = G.u32(0xc71678);
  return g ? { state: G.u32(g + 0x23a74) | 0, cursor: G.u32(g + 0x23a7c) | 0, options: G.u32(g + 0x2402c) | 0 } : { state: -1 };
});
// InputManager's device vector (0xc57b18: begin +8, end +0xc, 8-byte entries)
const devices = () => page.evaluate(() => { const G = window.isaacGuest; return ((G.u32(0xc57b24) - G.u32(0xc57b20)) | 0) >> 3; });
const f32 = 'const f32 = (u) => { const v = new DataView(new ArrayBuffer(4)); v.setUint32(0, u >>> 0, true); return v.getFloat32(0, true); };';
const player = () => page.evaluate(`(() => { ${f32} const G = window.isaacGuest, g = G.u32(0x00c71678), p = G.u32(G.u32(g + 0x1baa8));
  return { x: f32(G.u32(p + 0x33c)), y: f32(G.u32(p + 0x340)), vx: f32(G.u32(p + 0x360)), vy: f32(G.u32(p + 0x364)) }; })()`);
const tears = () => page.evaluate(() => {
  const G = window.isaacGuest, game = G.u32(0x00c71678), room = G.u32(game + 0x18300), list = room + 0x1218 + 0x40;
  const data = G.u32(list + 4), n = G.u32(list + 0xc); let c = 0;
  for (let i = 0; i < Math.min(n, 512); i++) { const e = G.u32(data + 4 * i); if (e && G.u32(e + 0x28) === 2) c++; }
  return c;
});
const waitFor = async (fn, ms, step = 250) => { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(step); } };

try {
  await sleep(2000);
  // 1. the pad arrives (or is already there) and the game takes it in
  const at = LATE ? await logLen() : 0;
  const thrAt = thrLines.length;
  const devs0 = await devices();
  if (LATE) {
    await page.evaluate((a) => { window.__pad.press(a, true); window.__pad.connect(); }, A);
    await sleep(150);
    await page.evaluate((a) => window.__pad.press(a, false), A);
  }
  const identified = await waitFor(async () => (await logFrom(at)).some((l) => /Gamepad identified as/.test(l)), 8000);
  const connectLines = (await logFrom(at)).filter((l) => /Gamepad|XInput|Description/.test(l)).map((l) => l.replace(/\s+$/, ''));
  check(identified, 'the game takes the pad in (its connect callback runs to the end)', connectLines.slice(0, 4).join(' | '));
  const gotDevice = (await devices()) > devs0 || (!LATE && (await devices()) > 0);
  check(gotDevice, 'the InputManager has a Gamepad for it', `devices ${devs0} -> ${await devices()}`);
  if (!gotDevice) {
    // with ?ISAAC_THR_TRACE=1: where the thread slices yielded meanwhile
    for (const l of [...new Set(thrLines.slice(thrAt))].slice(0, 8)) console.log(`     ${l}`);
  }

  // 2. A on the pad through the title and the files
  const seen = [await screen()];
  for (let i = 0; i < 30 && (await screen()) !== 3; i++) {
    await press(A); await sleep(700);
    const sc = await screen(); if (sc !== seen[seen.length - 1]) seen.push(sc);
  }
  check((await screen()) === 3, 'A on the pad goes through the title and the file screen', `screens ${seen.join(' -> ')}`);
  // a pad that did not get there: the keys do, so the checks below still run
  for (let i = 0; i < 30 && (await screen()) !== 3; i++) { await key('enter'); await sleep(700); }
  await sleep(1200);

  // 3. a run started with the touch keys: the keyboard has the player
  for (let i = 0; i < 6 && (await gameCursor()) !== 0; i++) { await key('up'); await sleep(300); }
  await key('enter');
  await waitFor(async () => (await screen()) === 5, 5000);
  await sleep(1500);
  await key('enter');
  check(await waitFor(inRun, 30000, 300), 'the touch keys start a run');
  await sleep(3000);

  // 4. pause -> OPTIONS -> CHANGE CONTROLLER -> A on the pad
  await key('escape'); await sleep(800);
  for (let i = 0; i < 6 && (await pause()).cursor !== 0; i++) { await key('up'); await sleep(250); }
  await key('enter'); await sleep(800);
  for (let i = 0; i < 12 && (await pause()).options !== 0; i++) { await key('up'); await sleep(250); }
  const before = await logLen();
  await key('enter'); await sleep(1200);
  const atPrompt = await pause();
  await press(A); await sleep(1500);
  const changed = (await logFrom(before)).map((l) => /Setting controller ID to (-?\d+)/.exec(l)).filter(Boolean).map((m) => Number(m[1]));
  const last = changed.length ? changed[changed.length - 1] : null;
  check(last !== null && last > 0, 'A on the pad at SELECT A CONTROLLER! gives the player the pad',
    `pause ${JSON.stringify(atPrompt)}; controller ids set: ${changed.join(', ') || 'none'}`);

  // 5. back in the run: the sticks. The pause paper now answers to the pad
  // (the player's controller), so B on the pad backs out of it; the keys
  // only if the pad did not get the player.
  for (let i = 0; i < 6 && (await pause()).state !== 0; i++) { await press(B); await sleep(600); }
  for (let i = 0; i < 6 && (await pause()).state !== 0; i++) { await key('escape'); await sleep(600); }
  await sleep(1000);
  const a = Math.PI / 6;
  const p0 = await player();
  await axes([Math.cos(a), Math.sin(a), 0, 0]);
  await sleep(700);
  const p1 = await player();
  await axes([0, 0, 0, 0]);
  const dx = p1.x - p0.x, dy = p1.y - p0.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  check(Math.hypot(dx, dy) > 10 && angle > 5 && angle < 40, 'the left stick walks Isaac between the axes (keys give 0 or 45)',
    `moved ${dx.toFixed(1)},${dy.toFixed(1)} px = ${angle.toFixed(1)} degrees (stick at 30)`);
  await sleep(1200);
  await axes([0, 0, -1, 0]);
  await sleep(900);
  const t = await tears();
  await axes([0, 0, 0, 0]);
  check(t > 0, 'the right stick fires', `${t} tear(s) in the room`);

  const traps = (await logFrom(0)).filter((l) => /\[isaac\]\[TRAP\]|abort\(/.test(l)).slice(0, 2);
  check(!traps.length, 'no trap', traps.join(' | '));
} catch (e) {
  check(false, 'the drive ran to the end', e.message.split('\n')[0]);
}
await browser.close();
console.log(`${results.every(Boolean) ? 'PASS' : 'FAIL'} ${results.filter(Boolean).length}/${results.length}`);
process.exit(results.every(Boolean) ? 0 : 1);
