// bench_decode.mjs -- what one archive window costs the page's main thread to
// read synchronously (round 56): the base64 XHR the RAM-FS uses, decoded the
// legacy way (atob + a charCodeAt loop) against the native Uint8Array.fromBase64,
// and the fetch of the raw bytes for comparison; each at a CPU throttle.
//   node scripts/recomp/web/bench_decode.mjs http://127.0.0.1:8200 [cpu=4] [reps=8]
import { chromium } from 'playwright';

const [ORIGIN, ...rest] = process.argv.slice(2);
if (!ORIGIN) { console.log('usage: node bench_decode.mjs <origin> [cpu=4] [reps=8]'); process.exit(2); }
const opt = Object.fromEntries(rest.map((a) => a.split('=')));
const cpu = Number(opt.cpu || '4'), reps = Number(opt.reps || '8');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
console.log(`[decode] ${browser.version()}, cpu x${cpu}, ${reps} reps`);
await page.goto(ORIGIN + '/play.html?autoplay=0');
const cdp = await page.context().newCDPSession(page);
await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
const r = await page.evaluate(async ([reps]) => {
  const url = '/instance/resources/packed/afterbirthp.a?off=0&len=1048576';
  const out = { fromBase64: typeof Uint8Array.fromBase64 === 'function' };
  const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[s.length >> 1]; };
  const xhr = () => { const x = new XMLHttpRequest(); x.open('GET', url + '&b64=1', false); x.send(null); return x.responseText; };
  const legacy = (txt) => { const bin = atob(txt), o = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) o[i] = bin.charCodeAt(i); return o; };
  let t = [], td = [], tn = [], tf = [], tx = [];
  for (let i = 0; i < reps; i++) {
    let t0 = performance.now(); const txt = xhr(); let t1 = performance.now(); tx.push(t1 - t0);
    t0 = performance.now(); const a = legacy(txt); t1 = performance.now(); td.push(t1 - t0); out.len = a.length;
    if (out.fromBase64) { t0 = performance.now(); const b = Uint8Array.fromBase64(txt); t1 = performance.now(); tn.push(t1 - t0); out.same = b.length === a.length && b[12345] === a[12345] && b[a.length - 1] === a[a.length - 1]; }
    t0 = performance.now(); const buf = await fetch(url).then((r) => r.arrayBuffer()); t1 = performance.now(); tf.push(t1 - t0); out.rawLen = buf.byteLength;
  }
  out.xhrMs = +med(tx).toFixed(1); out.legacyDecodeMs = +med(td).toFixed(1); out.nativeDecodeMs = out.fromBase64 ? +med(tn).toFixed(1) : null; out.rawFetchMs = +med(tf).toFixed(1);
  return out;
}, [reps]);
console.log(`[decode] Uint8Array.fromBase64 ${r.fromBase64 ? 'present' : 'ABSENT'}; one 1 MiB window (medians): sync XHR ${r.xhrMs} ms, legacy decode ${r.legacyDecodeMs} ms, native decode ${r.nativeDecodeMs} ms${r.fromBase64 ? (r.same ? ' (same bytes)' : ' (DIFFERENT BYTES)') : ''}, raw async fetch ${r.rawFetchMs} ms`);
await browser.close();
