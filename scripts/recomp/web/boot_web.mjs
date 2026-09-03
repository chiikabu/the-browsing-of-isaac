// boot_web.mjs -- page-side driver for the WEB build of the lifted module.
// Mirrors boot_integration.mjs stage for stage: place the memory image, check
// the layout, arm the guard, seed the packed archives, register the instance
// tree lazily, run the host boot, run main. Files arrive from the runner's
// local HTTP server (run_web.mjs, 127.0.0.1 only).
//
// Everything the runner reads back lives on window: isaacLog (every line the
// module printed), isaacFrames (the last frames the host's SwapBuffers shim
// read back from the WebGL framebuffer), isaacDone ({mainRc, bootRc, ...}).
import Module from './boot.mjs';

const logEl = document.getElementById('log');
window.isaacLog = [];
window.isaacFrames = [];
window.isaacDone = null;
const KEEP_FRAMES = 6;
function log(line) {
  window.isaacLog.push(String(line));
  if (window.isaacLog.length % 50 === 0 || /RESULT|TRAP|frame\]/.test(line)) {
    logEl.textContent = window.isaacLog.slice(-12).join('\n');
  }
}

// Synchronous binary fetch: the RAM-FS asks for lazy bytes from inside a
// blocking call into wasm, so the answer cannot be awaited. A synchronous
// XHR in the window context may only read text, and Chromium strips a
// leading UTF-8 BOM from text responses whatever the charset label (the
// x-user-defined trick lost three bytes of every BOM-prefixed .anm2/.fs),
// so the runner serves ?b64=1 as base64 and the bytes are decoded here.
function fetchSync(url) {
  const x = new XMLHttpRequest();
  x.open('GET', url + (url.includes('?') ? '&' : '?') + 'b64=1', false);
  x.send(null);
  if (x.status !== 200) throw new Error(`${url}: HTTP ${x.status}`);
  const bin = atob(x.responseText), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const params = new URLSearchParams(location.search);
const cfg = {
  canvas: document.getElementById('canvas'),
  print: log,
  printErr: log,
  preRun: [() => {
    cfg.ENV.ISAAC_MAX_FRAMES = params.get('frames') || '5';
    cfg.ENV.ISAAC_LOG_TIME = '1';
    for (const [k, v] of params) if (k.startsWith('ISAAC_')) cfg.ENV[k] = v;
  }],
};
let lazyReads = 0, lazyBytes = 0;
cfg.isaacLazyRead = (src, dst, len) => {
  try {
    const bytes = fetchSync(`/instance/${src}`);
    if (bytes.length < len) { log(`  lazy read of ${src}: ${bytes.length} bytes served, ${len} registered`); return 0; }
    m.HEAPU8.set(bytes.subarray(0, len), dst);
    lazyReads += 1; lazyBytes += len;
    return 1;
  } catch (e) {
    log(`  lazy read FAILED for ${src}: ${e.message}`);
    return 0;
  }
};
let presented = 0;
const keepEvery = Number(params.get('keep') || '0');      // also keep every Nth frame
cfg.isaacPresent = (ptr, w, h) => {
  presented += 1;
  const frame = { n: presented, w, h, rgba: m.HEAPU8.slice(ptr, ptr + w * h * 4) };
  window.isaacFrames.push(frame);
  // the last KEEP_FRAMES always survive; sampled frames are pinned
  const pinned = window.isaacFrames.filter((f) => keepEvery && f.n % keepEvery === 0);
  const tail = window.isaacFrames.filter((f) => !(keepEvery && f.n % keepEvery === 0)).slice(-KEEP_FRAMES);
  window.isaacFrames = [...pinned, ...tail].sort((a, b) => a.n - b.n);
};

// ---- scripted input ---------------------------------------------------------
// The page's main thread is inside main() for the whole run, so no browser
// event can reach the game; input is a timeline keyed by presented frame:
//   ?input=130:Enter,160:Enter,200:Down,230:Enter,300:mouse:480:270,301:click,400:w:30
// A key entry presses at its frame and releases `hold` frames later (default 2). The host's
// PeekMessageW asks Module.isaacInputPoll(frame, out) for the events due at
// or before `frame`, one per call, packed as four int32s at `out`:
//   [1, vk, scancode | (extended << 8), down]   key
//   [2, x, y, 0]                                 mouse move (client coords)
//   [3, button, down, 0]                         mouse button (0 left, 1 right)
const KEYS = {
  enter: [0x0D, 0x1C, 0], escape: [0x1B, 0x01, 0], space: [0x20, 0x39, 0], tab: [0x09, 0x0F, 0],
  backspace: [0x08, 0x0E, 0], up: [0x26, 0x48, 1], down: [0x28, 0x50, 1], left: [0x25, 0x4B, 1],
  right: [0x27, 0x4D, 1], shift: [0x10, 0x2A, 0], ctrl: [0x11, 0x1D, 0], alt: [0x12, 0x38, 0],
  a: [0x41, 0x1E, 0], b: [0x42, 0x30, 0], c: [0x43, 0x2E, 0], d: [0x44, 0x20, 0], e: [0x45, 0x12, 0],
  f: [0x46, 0x21, 0], g: [0x47, 0x22, 0], h: [0x48, 0x23, 0], i: [0x49, 0x17, 0], j: [0x4A, 0x24, 0],
  k: [0x4B, 0x25, 0], l: [0x4C, 0x26, 0], m: [0x4D, 0x32, 0], n: [0x4E, 0x31, 0], o: [0x4F, 0x18, 0],
  p: [0x50, 0x19, 0], q: [0x51, 0x10, 0], r: [0x52, 0x13, 0], s: [0x53, 0x1F, 0], t: [0x54, 0x14, 0],
  u: [0x55, 0x16, 0], v: [0x56, 0x2F, 0], w: [0x57, 0x11, 0], x: [0x58, 0x2D, 0], y: [0x59, 0x15, 0],
  z: [0x5A, 0x2C, 0], '0': [0x30, 0x0B, 0], '1': [0x31, 0x02, 0], '2': [0x32, 0x03, 0], '3': [0x33, 0x04, 0],
  '4': [0x34, 0x05, 0], '5': [0x35, 0x06, 0], '6': [0x36, 0x07, 0], '7': [0x37, 0x08, 0], '8': [0x38, 0x09, 0],
  '9': [0x39, 0x0A, 0], f1: [0x70, 0x3B, 0], f2: [0x71, 0x3C, 0], f3: [0x72, 0x3D, 0], f4: [0x73, 0x3E, 0],
};
const timeline = [];
for (const item of (params.get('input') || '').split(',').map((t) => t.trim()).filter(Boolean)) {
  const [fr, what, ...rest] = item.split(':');
  const frame = Number(fr);
  const w = (what || '').toLowerCase();
  if (w === 'mouse') timeline.push({ frame, ev: [2, Number(rest[0] || 0), Number(rest[1] || 0), 0] });
  else if (w === 'click' || w === 'rclick') {
    const btn = w === 'click' ? 0 : 1;
    timeline.push({ frame, ev: [3, btn, 1, 0] });
    timeline.push({ frame: frame + 2, ev: [3, btn, 0, 0] });
  } else if (KEYS[w]) {
    const [vk, sc, ext] = KEYS[w];
    const hold = Math.max(1, Number(rest[0] || 2));      // frame:key[:hold] -- held for `hold` frames
    timeline.push({ frame, ev: [1, vk, sc | (ext << 8), 1] });
    timeline.push({ frame: frame + hold, ev: [1, vk, sc | (ext << 8), 0] });
  } else log(`  input: unknown key '${what}' in '${item}'`);
}
timeline.sort((a, b) => a.frame - b.frame);
let inputsDelivered = 0;
cfg.isaacInputPoll = (frame, out) => {
  if (!timeline.length || timeline[0].frame > frame) return 0;
  const { ev } = timeline.shift();
  m.HEAP32.set(ev, out >> 2);
  inputsDelivered += 1;
  return 1;
};

let m;
try {
  m = await Module(cfg);
} catch (e) {
  log(`module instantiation failed: ${e.message}`);
  window.isaacDone = { error: `instantiate: ${e.message}` };
  throw e;
}

function stageOk(name, fn) {
  log(`=== ${name} ===`);
  try {
    return fn();
  } catch (e) {
    log(`  TRAP in ${name}: ${e.message}`);
    try { if (typeof m._isaac_dump_va_ring === 'function') m._isaac_dump_va_ring(); } catch (e2) { /* best effort */ }
    log(String(e.stack || '').split('\n').slice(1, 4).join('\n'));
    return null;
  }
}
function cstr(s) {
  const bytes = new TextEncoder().encode(s + '\0');
  const p = m._malloc(bytes.length);
  m.HEAPU8.set(bytes, p);
  return p;
}

const done = { mainRc: null, bootRc: null, presented: 0, lazyReads: 0, lazyBytes: 0 };
try {
  // --- memory image
  const blob = fetchSync('/isaac.segs.bin');
  const p = m._malloc(blob.length);
  m.HEAPU8.set(blob, p);
  const nseg = stageOk('place memory image', () => m._isaac_place_image(p, blob.length));
  log(`  isaac.segs.bin ${blob.length} bytes -> ${nseg} segments`);
  m._free(p);
  if (nseg === null || nseg < 0) throw new Error('image placement failed');

  // --- layout + guard
  const layoutBad = stageOk('layout', () => m._isaac_layout_check());
  m._isaac_guard_arm();
  log(`  guard armed (layout ${layoutBad ? 'FAIL' : 'OK'})`);

  // --- seed the packed archives eagerly, the tree lazily
  const LAZY_ARCHIVES = new Set(['resources/packed/music.a', 'resources/packed/videos.a']);
  const index = JSON.parse(new TextDecoder().decode(fetchSync('/instance_index.json')));
  stageOk('seed packed archives', () => {
    let n = 0;
    for (const name of ['graphics.a', 'config.a', 'fonts.a', 'animations.a', 'rooms.a', 'sfx.a']) {
      const rel = `resources/packed/${name}`;
      let bytes;
      try { bytes = fetchSync(`/instance/${rel}`); } catch { log(`  (skip ${name}: not served)`); continue; }
      const pp = cstr(rel), dp = m._malloc(bytes.length || 1);
      m.HEAPU8.set(bytes, dp);
      const ok = m._isaac_fs_seed(pp, dp, bytes.length);
      m._free(pp); m._free(dp);
      log(`  seed ${rel} ${bytes.length} bytes -> ${ok ? 'ok' : 'FAIL'}`);
      n += ok ? 1 : 0;
    }
    return n;
  });
  stageOk('register instance tree lazily', () => {
    let files = 0, bytes = 0;
    for (const { p: rel, s: size } of index) {
      // packed/ is seeded eagerly above -- except the two archives the game
      // opens only once it is playing (music 182 MB, videos 93 MB), which get
      // the same lazy treatment as the tree so they cost nothing until asked
      // for. Node does the same (round 15d).
      if (rel.startsWith('resources/packed/') && !LAZY_ARCHIVES.has(rel)) continue;
      const pp = cstr(rel);
      if (m._isaac_fs_seed_lazy(pp, size)) { files += 1; bytes += size; }
      m._free(pp);
    }
    log(`  registered ${files} files lazily (${(bytes / 1048576).toFixed(1)} MB)`);
    return files;
  });
  // --- the host Lua's libc reads scripts through MEMFS: put them there
  stageOk('lua scripts into MEMFS', () => {
    let n = 0;
    for (const { p: rel } of index) {
      if (!rel.startsWith('resources/scripts/')) continue;
      const dir = rel.slice(0, rel.lastIndexOf('/'));
      m.FS.mkdirTree('/' + dir);
      m.FS.writeFile('/' + rel, fetchSync(`/instance/${rel}`));
      n += 1;
    }
    log(`  ${n} lua scripts written`);
    return n;
  });

  // --- boot + main
  done.bootRc = stageOk('host boot (IAT + TEB + TLS + _initterm)', () => m._isaac_run_boot(1));
  log(`  isaac_boot_init -> ${done.bootRc}`);
  if (done.bootRc === null) throw new Error('boot trapped');
  done.mainRc = stageOk('main @ 0x00931050', () => m._isaac_run_main());
  log(`  isaac_boot_call_main -> ${done.mainRc}`);
  try { m._isaac_stub_report(); } catch (e) { log(`  stub report failed: ${e.message}`); }
  try { m._isaac_heap_report(); } catch (e) { /* best effort */ }
  log(`RESULT: ${done.mainRc === null ? 'main trapped' : 'main returned ' + done.mainRc}`);
} catch (e) {
  log(`RESULT: aborted: ${e.message}`);
  done.error = e.message;
}
done.presented = presented;
done.lazyReads = lazyReads;
done.lazyBytes = lazyBytes;
log(`  frames presented: ${presented}; lazy reads: ${lazyReads} files, ${(lazyBytes / 1048576).toFixed(1)} MB; scripted inputs delivered: ${inputsDelivered}, pending: ${timeline.length}`);
logEl.textContent = window.isaacLog.slice(-12).join('\n');
window.isaacDone = done;
