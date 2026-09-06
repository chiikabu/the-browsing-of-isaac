// play.mjs -- the shipping page (round 34). The pipeline is boot_web.mjs,
// unchanged: this script draws the loading screen, the Play button, the
// canvas chrome, the saves menu and the error panel around it, and hands the
// pipeline a few hooks through window.isaacPageHooks before importing it:
//   url(u)            every synchronous fetch the RAM-FS makes (the windowed
//                     archive reads during play) is rewritten: the page's own
//                     directory as the root, ?v=<sha256 prefix> from dist.json
//                     so the server may answer `immutable`
//   fetchBytes(u)     the boot stages (memory image, index, the six eagerly
//                     seeded archives, the Lua) fetched asynchronously with a
//                     byte-level progress bar
//   instantiateWasm   the module streamed through a counting ReadableStream
//   onLog(line)       the stage markers and the error triggers
//   beforeMain(m)     awaited right before main: the Play click (a user gesture,
//                     so the AudioContext the AL shim creates starts running)
// Defaults: ISAAC_YIELD=1 (live page, JSPI) and no frame budget -- the query
// is normalised before boot_web.mjs reads it. ?frames=N ends the run after N
// frames (the drivers), ?autoplay=1 skips the Play button (headless runs),
// ?persist=0 turns the save store off, ISAAC_*=... goes into the module's ENV.
const $ = (id) => document.getElementById(id);
import { createEditFileMenu } from './menu_overlay.mjs';
const ROOT = new URL('.', location.href).pathname.replace(/\/$/, '');
const params = new URLSearchParams(location.search);
if (!params.has('ISAAC_YIELD')) {
  // the pipeline's defaults follow the query: ISAAC_YIELD=1 selects the live
  // page and, with no frames=, an unlimited budget
  params.set('ISAAC_YIELD', '1');
  history.replaceState(null, '', `${location.pathname}?${params}${location.hash}`);
}
const AUTOPLAY = params.get('autoplay') !== '0';   // the page starts on its own; autoplay=0 keeps the Play button (a gesture before any audio)
const PERSIST = params.get('persist') !== '0';

// the six archives boot_web.mjs seeds eagerly (its `seed packed archives`
// stage); the rest of resources/packed is registered lazily and read as
// slices once the game runs. Pinned against boot_web.mjs by tests/recomp-ship.test.js.
const EAGER_ARCHIVES = ['graphics.a', 'config.a', 'fonts.a', 'animations.a', 'rooms.a', 'sfx.a'];
const SAVE_DB = 'isaac-saves', SAVE_STORE = 'files';      // the pipeline's IndexedDB store (boot_web.mjs), same pin

const canvas = $('canvas'), overlay = $('overlay'), playBtn = $('play'), statusEl = $('status'), streamingEl = $('streaming');
// opt-in chrome (round 51): ?stats=1 shows the live status line, ?saves=1 the
// saves button; the page is otherwise the game alone, and a click anywhere
// gives the canvas the keyboard
if (params.get('stats') === '1') $('fps').hidden = false;
if (params.get('saves') === '1') $('saves-btn').hidden = false;
document.addEventListener('pointerdown', () => { if (!$('saves').open) canvas.focus(); });
// F toggles fullscreen on the stage (the keydown is the gesture requestFullscreen
// needs); the key still reaches the game, which does not bind F by default
const toggleFullscreen = () => {
  const stage = $('stage');
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  else if (stage.requestFullscreen) stage.requestFullscreen().then(() => canvas.focus()).catch(() => {});
};
window.addEventListener('keydown', (ev) => {
  if (ev.code === 'KeyF' && !ev.repeat && !ev.ctrlKey && !ev.altKey && !ev.metaKey && !$('saves').open && !(window.isaacEditFileMenu && window.isaacEditFileMenu.isOpen())) toggleFullscreen();
  // N flips the FPS readout (round 52c-e; unbound in the game's default keys); the key still reaches the game
  if (ev.code === 'KeyN' && !ev.repeat && !ev.ctrlKey && !ev.altKey && !ev.metaKey && !$('saves').open && window.isaacEditFileMenu && !window.isaacEditFileMenu.isOpen()) window.isaacEditFileMenu.toggleFps();
});
const mb = (n) => (n / 1048576).toFixed(1);
const fmtBytes = (n) => n >= 1048576 ? `${mb(n)} MB` : n >= 1024 ? `${(n / 1024).toFixed(0)} KB` : `${n} B`;

// ---- the loading screen -------------------------------------------------------
const stages = {
  module: { total: 0, received: 0, done: false },
  image: { total: 0, received: 0, done: false },
  archives: { total: 0, received: 0, done: false },
  boot: { total: 1, received: 0, done: false },
};
let renderQueued = false;
function render() {
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    for (const [name, s] of Object.entries(stages)) {
      const p = $(`p-${name}`), b = $(`b-${name}`), n = $(`n-${name}`);
      if (s.total) { p.max = s.total; p.value = s.done ? s.total : Math.min(s.received, s.total); }
      else if (s.done) { p.max = 1; p.value = 1; } else p.removeAttribute('value');
      b.textContent = name === 'boot' ? (s.done ? 'done' : s.received ? 'running' : '')
        : s.total ? `${mb(s.done ? s.total : s.received)} / ${mb(s.total)} MB` : (s.received ? `${mb(s.received)} MB` : '');
      n.className = 'name' + (s.done ? ' done' : s.received ? ' active' : '');
    }
    // the one bar: the bytes of the three fetch stages, the boot as the last per cent
    let tot = 0, got = 0;
    for (const name of ['module', 'image', 'archives']) { const s = stages[name]; if (s.total) { tot += s.total; got += s.done ? s.total : Math.min(s.received, s.total); } }
    const pct = stages.boot.done ? 100 : tot ? Math.min(99, 100 * got / tot) : 0;
    $('bar-fill').style.width = `${pct.toFixed(1)}%`;
  });
}
function setStatus(text) { statusEl.textContent = text; }

// ---- manifest + index: the totals, the versions ------------------------------
let manifest = null;
try { manifest = await (await fetch(`${ROOT}/dist.json`, { cache: 'no-cache' })).json(); } catch { manifest = null; }
const fileInfo = new Map((manifest && manifest.files || []).map((f) => [f.path, f]));
const sizeOf = (rel) => { const f = fileInfo.get(rel); return f ? f.size : 0; };
const versionOf = (rel) => { const f = fileInfo.get(rel); return f && f.sha256 ? f.sha256.slice(0, 16) : null; };
// a pipeline URL ('/instance/x?off=1&len=2') -> the served URL under this page's directory, versioned
function rewrite(url) {
  const [path, query] = url.split('?');
  const rel = path.replace(/^\//, '');
  const v = versionOf(rel);
  const q = (query ? query + '&' : '') + (v && !/(^|&)v=/.test(query || '') ? `v=${v}` : '');
  return `${ROOT}/${rel}${q ? '?' + q.replace(/&$/, '') : ''}`;
}
let indexBytes = null, index = [];
try {
  indexBytes = new Uint8Array(await (await fetch(rewrite('/instance_index.json'), { cache: 'no-cache' })).arrayBuffer());
  index = JSON.parse(new TextDecoder().decode(indexBytes));
} catch (e) { setStatus(`instance_index.json: ${e.message}`); }
const indexSize = new Map(index.map((e) => [e.p, e.s]));
stages.module.total = sizeOf('boot.wasm');
stages.image.total = sizeOf('isaac.segs.bin');
stages.archives.total = EAGER_ARCHIVES.reduce((s, n) => s + (indexSize.get(`resources/packed/${n}`) || 0), 0)
  + index.filter((e) => e.p.startsWith('resources/scripts/')).reduce((s, e) => s + e.s, 0);
const stageFor = (rel) => rel === 'isaac.segs.bin' ? stages.image
  : rel.startsWith('instance/resources/packed/') || rel.startsWith('instance/resources/scripts/') ? stages.archives : null;
render();
if (location.protocol === 'file:') setStatus('this page needs a server (node scripts/recomp/web/serve_dist.mjs <dist>): the game reads its archives as byte slices');
else setStatus(manifest ? 'loading\u2026' : 'no dist.json: sizes unknown');

// ---- the hooks -----------------------------------------------------------------
let streamed = 0, streamedRequests = 0;
const hooks = {};
hooks.url = (url) => {
  // the windowed reads once the game runs: count what the engine streams
  const m = /[?&]len=(\d+)/.exec(url);
  if (m) streamed += Number(m[1]); else { const rel = url.split('?')[0].replace(/^\/instance\//, ''); streamed += indexSize.get(rel) || 0; }
  streamedRequests += 1;
  return rewrite(url);
};
hooks.fetchBytes = async (url) => {
  const rel = url.split('?')[0].replace(/^\//, '');
  if (rel === 'instance_index.json' && indexBytes) return indexBytes;
  const st = stageFor(rel);
  const res = await fetch(rewrite(url));
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const expected = rel.startsWith('instance/') ? (indexSize.get(rel.slice('instance/'.length)) || 0) : sizeOf(rel);
  const chunks = [];
  let got = 0;
  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    if (st) { st.received += value.length; render(); }
  }
  const out = new Uint8Array(got);
  let o = 0;
  for (const c of chunks) { out.set(c, o); o += c.length; }
  if (expected && got !== expected) console.warn(`${rel}: ${got} bytes, the index says ${expected}`);
  return out;
};
hooks.instantiateWasm = (info, receive) => {
  (async () => {
    const st = stages.module;
    st.received = 0; render();
    const res = await fetch(rewrite('/boot.wasm'));
    if (!res.ok) throw new Error(`boot.wasm: HTTP ${res.status}`);
    // Round 40: the fetch's own Response goes to instantiateStreaming. V8 keeps
    // the optimised machine code of a module in the HTTP cache entry of the
    // response it was compiled from (a cacheable URL, >= 128 KB, streaming);
    // a synthetic `new Response(stream)` has no cache entry, so every visit
    // compiled 50 MB with the baseline tier and ran slower for minutes while
    // the optimiser caught up. The progress bar reads a clone of the body.
    const counted = res.clone().body.getReader();
    (async () => {
      for (;;) {
        const { done, value } = await counted.read();
        if (done) return;
        st.received += value.length; render();
      }
    })().catch(() => {});
    const { instance, module } = await WebAssembly.instantiateStreaming(res, info);
    st.done = true; render();
    setStatus('loading\u2026');
    receive(instance, module);
  })().catch((e) => showError('The module failed to load', e.message));
  return {};
};
let moduleRef = null;
hooks.beforeMain = (m) => new Promise((resolve) => {
  moduleRef = m;
  stages.boot.done = true; render();
  const start = () => {
    unlockAudio(m);
    playBtn.hidden = true;
    $('stages').hidden = true;
    setStatus('starting\u2026');
    resolve();
    // Round 46: a frame-rate readout in the status line once the engine runs --
    // the host's frame counter sampled each second, the median of the last
    // ten -- so a test on the target machine reports numbers without tooling.
    let last = window.isaacFrame || 0, lastT = performance.now(), first = true;
    let lastNoRaf = 0;   // round 49: frames the yield ticked on its timer (no animation frames)
    const recent = [];
    // the machine, once: cores, memory (Chrome rounds it), the GPU renderer --
    // what a report from the target has to say alongside the frame rate
    let machine = '';
    try {
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'gpu?';
      machine = ` -- ${navigator.hardwareConcurrency || '?'} cores, ${navigator.deviceMemory || '?'} GB, ${renderer}`;
    } catch (e) { machine = ''; }
    setInterval(() => {
      const f = window.isaacFrame || 0, t = performance.now();
      if (f <= 0) return;
      const nr = window.isaacYieldNoRaf || 0, nrDelta = nr - lastNoRaf; lastNoRaf = nr;
      const fps = (f - last) * 1000 / Math.max(1, t - lastT);
      last = f; lastT = t;
      recent.push(fps); if (recent.length > 10) recent.shift();
      const med = [...recent].sort((a, b) => a - b)[Math.floor(recent.length / 2)];
      if (first) { first = false; render(); }
      const note = document.hidden ? ' -- paused while hidden' : (nrDelta > 0 ? ` -- no animation frames (${nrDelta} timer tick(s) this second: occluded?)` : '');
      const line = `${fps.toFixed(0)} fps (median of the last ${recent.length} s: ${med.toFixed(0)}) -- frame ${f}${note}`;
      setStatus(line + machine);                       // the overlay's line, until the first frame hides the overlay
      const fpsEl = $('fps'); fpsEl.textContent = line; fpsEl.title = line + machine;   // the header's, live during play
      editMenu.setFps(fps);                                                          // the in-game FPS VIEWER, when on
    }, 1000);
  };
  if (AUTOPLAY) { start(); return; }
  setStatus('ready');
  playBtn.hidden = false;
  playBtn.focus();
  playBtn.addEventListener('click', start, { once: true });
});
hooks.onLog = (line) => {
  if (line.startsWith('=== ')) {
    const name = line.slice(4, -4);
    if (name === 'layout') { stages.image.done = true; }
    else if (name === 'host boot (IAT + TEB + TLS + _initterm)') { stages.archives.done = true; stages.boot.received = 1; }
    else if (name.startsWith('main @')) { stages.boot.done = true; }
    setStatus(name);
    render();
    return;
  }
  if (/^\s*isaac_boot_init -> /.test(line)) { stages.boot.done = true; render(); }
  if (/^\s*TRAP in |^RESULT: aborted|module instantiation failed|lazy (read|pread) FAILED/.test(line)) showError('The module stopped', line.trim());
};
window.isaacPageHooks = hooks;

// The click is the user gesture: an AudioContext created inside it starts
// running, so the AL shim's lazily created context (host_audio_web.c) is
// created here first, and resumed if the browser still has it suspended.
function unlockAudio(m) {
  try {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return;
    if (!m.isaacAudio) m.isaacAudio = { ctx: null, buffers: new Map(), sources: new Map() };
    if (!m.isaacAudio.ctx) m.isaacAudio.ctx = new C();
    if (m.isaacAudio.ctx.state === 'suspended') m.isaacAudio.ctx.resume();
  } catch (e) { /* audio never blocks the game */ }
  canvas.focus();
}

// ---- the error / ended panel ----------------------------------------------------
let errorShown = false;
function showError(title, text, ended = false) {
  if (errorShown && !ended) return;
  errorShown = true;
  const panel = $('error');
  panel.className = ended ? 'ended' : '';
  $('error-title').textContent = title;
  $('error-text').textContent = text || '';
  $('errlog').textContent = (window.isaacLog || []).slice(-24).join('\n');
  panel.hidden = false;
}
$('reload-btn').addEventListener('click', () => location.reload());
$('dismiss-btn').addEventListener('click', () => { $('error').hidden = true; });
window.addEventListener('error', (ev) => showError('A script error', ev.message));
window.addEventListener('unhandledrejection', (ev) => showError('The pipeline failed', String(ev.reason && ev.reason.message || ev.reason)));

// ---- the EDIT FILE menu (round 52) -----------------------------------------------------
// The save-select screen's DELETE FILE strip reads EDIT FILE (page_assets.py
// patched the sheet in the bundle's afterbirthp.a); confirming on a file in
// that mode asks the host gate, which calls window.isaacEditFile(slot): the
// menu opens over the game with the game's own art, font and sounds
// (menu_overlay.mjs). Export and import work the saves store for that file's
// persistentgamedata / gamestate; Delete hands the flow back to the engine.
const slotPattern = (slot) => new RegExp(`(^|/)(rep_)?(persistentgamedata|gamestate)${slot + 1}\\.dat$`, 'i');
const renumber = (name, slot) => name.replace(/(persistentgamedata|gamestate)\d(\.dat)$/i, (m, a, b) => `${a}${slot + 1}${b}`);
async function exportSlot(slot) {
  const db = await openStore();
  if (!db) throw new Error('NO SAVE STORE HERE');
  const items = (await readAllSaves(db)).filter((it) => slotPattern(slot).test(entryName(it.key, it.src)));
  if (!items.length) throw new Error('NO SAVE IN THIS FILE');
  const meta = { format: 'isaac-recomp-saves/1', exported: new Date().toISOString(), slot: slot + 1,
    files: items.map((it) => ({ key: it.key, src: it.src, name: entryName(it.key, it.src) })) };
  const entries = items.map((it) => ({ name: entryName(it.key, it.src), bytes: it.bytes }));
  entries.push({ name: 'isaac-saves.json', bytes: new TextEncoder().encode(JSON.stringify(meta, null, 1)) });
  download(zipStore(entries), `isaac-file${slot + 1}-${stamp()}.zip`);
  return `EXPORTED ${items.length} FILE${items.length === 1 ? '' : 'S'}`;
}
async function importSlot(slot) {
  const input = $('import-file');
  const file = await new Promise((resolve) => {
    const onChange = () => { input.removeEventListener('change', onChange); resolve(input.files && input.files[0]); input.value = ''; };
    input.addEventListener('change', onChange);
    input.click();
    console.log('[menu] the file chooser was asked for');
  });
  if (!file) throw new Error('NO FILE CHOSEN');
  const db = await openStore();
  if (!db) throw new Error('NO SAVE STORE HERE');
  const existing = (await readAllSaves(db)).filter((it) => slotPattern(slot).test(entryName(it.key, it.src)));
  const buf = new Uint8Array(await file.arrayBuffer());
  const items = [];
  if (buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4b) {
    const entries = await unzip(buf.buffer);
    const metaEntry = entries.find((e) => e.name === 'isaac-saves.json');
    const meta = metaEntry ? JSON.parse(new TextDecoder().decode(metaEntry.bytes)) : null;
    const byName = new Map(((meta && meta.files) || []).map((f) => [f.name, f]));
    for (const e of entries) {
      if (e.name === 'isaac-saves.json' || !/(persistentgamedata|gamestate)\d\.dat$/i.test(e.name)) continue;
      const f = byName.get(e.name);
      // whatever file number the export carried, it lands in THIS file's slot
      items.push({ key: renumber(f && f.key ? f.key : e.name, slot), src: renumber(f && f.src ? f.src : e.name, slot), bytes: e.bytes });
    }
  } else {
    // a bare .dat: this file's persistentgamedata (or gamestate, by its name)
    const kind = /gamestate/i.test(file.name) ? 'gamestate' : 'persistentgamedata';
    const hit = existing.find((it) => new RegExp(`${kind}${slot + 1}\\.dat$`, 'i').test(entryName(it.key, it.src)));
    items.push({ key: hit ? hit.key : `c:/isaac/documents/my games/binding of isaac repentance+/${kind}${slot + 1}.dat`, src: hit ? hit.src : '', bytes: buf });
  }
  if (!items.length) throw new Error('NOTHING TO IMPORT');
  await writeSaves(db, items, false);
  setTimeout(() => location.reload(), 1500);               // the engine holds the old data: a reload applies the import
  return 'IMPORTED. RELOADING...';
}
const editMenu = createEditFileMenu({
  stage: $('stage'), canvas, assetsUrl: `${ROOT}/instance/page-assets`,
  audioContext: () => (moduleRef && moduleRef.isaacAudio && moduleRef.isaacAudio.ctx) || null,
  injectKey: (name, down) => { if (typeof window.isaacInjectKey === 'function') window.isaacInjectKey(name, down); },
  log: (line) => console.log(line),
  actions: { export: exportSlot, import: importSlot },
});
window.isaacEditFile = (slot) => { editMenu.open(slot); };
window.isaacEditFileDelete = -1;
window.isaacKeyCapture = (ev, down) => editMenu.onKey(ev, down);
window.isaacEditFileMenu = editMenu;                      // the drivers look at it

// ---- chrome: fullscreen, fps, the live status --------------------------------------
let lastFrame = 0, lastT = performance.now(), firstFrameSeen = false, finished = false;
setInterval(() => {
  const f = window.isaacFrame || 0;
  const now = performance.now();
  if (f > 0 && !firstFrameSeen) { firstFrameSeen = true; overlay.hidden = true; canvas.focus(); }
  if (firstFrameSeen) {
    const fps = (f - lastFrame) / ((now - lastT) / 1000);
    // (#fps is written by the status interval above: fps, median, frame, the hidden / no-animation-frames notes; the machine in its tooltip)
    lastFrame = f; lastT = now;
  } else if (!streamingEl.hidden) {
    streamingEl.textContent = `streamed ${mb(streamed)} MB of archives in ${streamedRequests} reads`;
  }
  const done = window.isaacDone;
  if (done && !finished) {
    finished = true;
    $('fps').textContent = '';
    if (done.error || done.mainRc !== 0) showError('The run ended with an error', done.error || `main returned ${done.mainRc}`);
    else showError('The run ended', `main returned 0 after ${done.presented} frames (the frames= budget). Reload to play again.`, true);
  }
}, 500);

// ---- the saves menu ------------------------------------------------------------------
function openStore() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { resolve(null); return; }
    const req = indexedDB.open(SAVE_DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(SAVE_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
function readAllSaves(db) {
  return new Promise((resolve, reject) => {
    const out = [];
    const req = db.transaction(SAVE_STORE, 'readonly').objectStore(SAVE_STORE).openCursor();
    req.onsuccess = () => { const c = req.result; if (!c) { resolve(out); return; } out.push({ key: String(c.key), src: c.value.src || '', bytes: c.value.bytes }); c.continue(); };
    req.onerror = () => reject(req.error);
  });
}
function writeSaves(db, items, clear) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SAVE_STORE, 'readwrite'), st = tx.objectStore(SAVE_STORE);
    if (clear) st.clear();
    for (const it of items) st.put({ src: it.src, bytes: it.bytes }, it.key);
    tx.oncomplete = () => resolve(items.length);
    tx.onerror = () => reject(tx.error);
  });
}
// the name a save travels under: its seed path, else its FS key without the
// fake cwd root the host answers USERPROFILE with (the node driver's rule)
const entryName = (key, src) => (src || key.replace(/^c:\/isaac\//i, '')).replace(/^\/+/, '');
const b64enc = (bytes) => { let s = ''; for (let i = 0; i < bytes.length; i += 8192) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192)); return btoa(s); };
const b64dec = (s) => { const bin = atob(s), out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
const stamp = () => new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// a store-only zip writer and a reader for stored / deflated entries
const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c; }
function crc32(bytes) { let c = -1; for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function zipStore(entries) {
  const enc = new TextEncoder(), parts = [], central = [];
  const d = new Date();
  const dosTime = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const dosDate = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  let offset = 0;
  for (const { name, bytes } of entries) {
    const n = enc.encode(name), crc = crc32(bytes);
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
    lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true); lh.setUint32(14, crc, true);
    lh.setUint32(18, bytes.length, true); lh.setUint32(22, bytes.length, true); lh.setUint16(26, n.length, true); lh.setUint16(28, 0, true);
    parts.push(new Uint8Array(lh.buffer), n, bytes);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true); cd.setUint16(10, 0, true);
    cd.setUint16(12, dosTime, true); cd.setUint16(14, dosDate, true); cd.setUint32(16, crc, true);
    cd.setUint32(20, bytes.length, true); cd.setUint32(24, bytes.length, true); cd.setUint16(28, n.length, true);
    cd.setUint16(30, 0, true); cd.setUint16(32, 0, true); cd.setUint16(34, 0, true); cd.setUint16(36, 0, true); cd.setUint32(38, 0, true); cd.setUint32(42, offset, true);
    central.push(new Uint8Array(cd.buffer), n);
    offset += 30 + n.length + bytes.length;
  }
  let cdLen = 0;
  for (const c of central) cdLen += c.length;
  const eocd = new DataView(new ArrayBuffer(22));
  eocd.setUint32(0, 0x06054b50, true); eocd.setUint16(4, 0, true); eocd.setUint16(6, 0, true);
  eocd.setUint16(8, entries.length, true); eocd.setUint16(10, entries.length, true); eocd.setUint32(12, cdLen, true); eocd.setUint32(16, offset, true); eocd.setUint16(20, 0, true);
  return new Blob([...parts, ...central, new Uint8Array(eocd.buffer)], { type: 'application/zip' });
}
async function unzip(buf) {
  const u8 = new Uint8Array(buf), dv = new DataView(buf);
  let eocd = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 65557); i--) if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not a zip file');
  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);
  const out = [];
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) throw new Error('bad central directory');
    const method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true);
    const nlen = dv.getUint16(p + 28, true), elen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), lho = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(u8.subarray(p + 46, p + 46 + nlen));
    const start = lho + 30 + dv.getUint16(lho + 26, true) + dv.getUint16(lho + 28, true);
    const raw = u8.slice(start, start + csize);
    let bytes;
    if (method === 0) bytes = raw;
    else if (method === 8) bytes = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer());
    else throw new Error(`unsupported zip method ${method} for ${name}`);
    if (!name.endsWith('/')) out.push({ name, bytes });
    p += 46 + nlen + elen + clen;
  }
  return out;
}

const savesDialog = $('saves');
async function refreshSaves() {
  const list = $('saves-list');
  list.innerHTML = '';
  try {
    const db = await openStore();
    const items = db ? await readAllSaves(db) : [];
    if (!items.length) list.innerHTML = '<tr><td class="note">nothing saved yet</td></tr>';
    for (const it of items) {
      const tr = document.createElement('tr');
      const a = document.createElement('td'), b = document.createElement('td');
      a.textContent = entryName(it.key, it.src); b.textContent = fmtBytes(it.bytes.length); b.className = 'n';
      tr.append(a, b); list.appendChild(tr);
    }
    return items;
  } catch (e) { list.innerHTML = `<tr><td class="note">save store unavailable: ${e.message}</td></tr>`; return []; }
}
$('saves-btn').addEventListener('click', async () => { $('saves-status').textContent = PERSIST ? '' : 'persist=0: the store is off for this load'; await refreshSaves(); savesDialog.showModal(); });
$('saves-close').addEventListener('click', () => savesDialog.close());
$('saves-reload').addEventListener('click', () => location.reload());
$('export-zip').addEventListener('click', async () => {
  const items = await refreshSaves();
  const meta = { format: 'isaac-recomp-saves/1', exported: new Date().toISOString(), files: items.map((it) => ({ key: it.key, src: it.src, name: entryName(it.key, it.src), size: it.bytes.length })) };
  const entries = items.map((it) => ({ name: entryName(it.key, it.src), bytes: it.bytes }));
  entries.push({ name: 'isaac-saves.json', bytes: new TextEncoder().encode(JSON.stringify(meta, null, 1)) });
  download(zipStore(entries), `isaac-saves-${stamp()}.zip`);
  $('saves-status').textContent = `${items.length} file(s) exported`;
});
$('export-json').addEventListener('click', async () => {
  const items = await refreshSaves();
  const doc = { format: 'isaac-recomp-saves/1', exported: new Date().toISOString(), files: items.map((it) => ({ key: it.key, src: it.src, name: entryName(it.key, it.src), size: it.bytes.length, base64: b64enc(it.bytes) })) };
  download(new Blob([JSON.stringify(doc, null, 1)], { type: 'application/json' }), `isaac-saves-${stamp()}.json`);
  $('saves-status').textContent = `${items.length} file(s) exported`;
});
$('import-btn').addEventListener('click', () => $('import-file').click());
$('import-file').addEventListener('change', async (ev) => {
  const file = ev.target.files && ev.target.files[0];
  if (!file) return;
  try {
    let items = [];
    if (/\.json$/i.test(file.name)) {
      const doc = JSON.parse(await file.text());
      if (!doc || !Array.isArray(doc.files)) throw new Error('not a saves export');
      items = doc.files.map((f) => ({ key: f.key || f.name, src: f.src || (f.key ? '' : f.name), bytes: b64dec(f.base64) }));
    } else {
      const entries = await unzip(await file.arrayBuffer());
      const metaEntry = entries.find((e) => e.name === 'isaac-saves.json');
      const meta = metaEntry ? JSON.parse(new TextDecoder().decode(metaEntry.bytes)) : null;
      const byName = new Map(((meta && meta.files) || []).map((f) => [f.name, f]));
      for (const e of entries) {
        if (e.name === 'isaac-saves.json') continue;
        const f = byName.get(e.name);
        // an entry the export did not describe (a file added by hand) is seeded under its own name
        items.push(f ? { key: f.key, src: f.src, bytes: e.bytes } : { key: e.name, src: e.name, bytes: e.bytes });
      }
    }
    const db = await openStore();
    if (!db) throw new Error('no IndexedDB here');
    await writeSaves(db, items, false);
    await refreshSaves();
    $('saves-status').textContent = `${items.length} file(s) imported; they are seeded before main at the next boot`;
    $('saves-reload').hidden = false;
  } catch (e) {
    $('saves-status').textContent = `import failed: ${e.message}`;
  }
  ev.target.value = '';
});
$('reset-saves').addEventListener('click', async () => {
  if (!window.confirm('Delete every saved file this browser keeps for the game?')) return;
  try {
    const db = await openStore();
    if (db) await writeSaves(db, [], true);
    await refreshSaves();
    $('saves-status').textContent = 'the store is empty; the game starts fresh at the next boot';
    $('saves-reload').hidden = false;
  } catch (e) { $('saves-status').textContent = `reset failed: ${e.message}`; }
});

// ---- go: the pipeline runs to the end of main; this import resolves when it does
setStatus('loading\u2026');
stages.module.received = 0;
import('./boot_web.mjs').catch((e) => showError('The pipeline failed', e.message));
