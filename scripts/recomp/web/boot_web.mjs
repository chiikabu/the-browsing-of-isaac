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
cfg.isaacPresent = (ptr, w, h) => {
  presented += 1;
  window.isaacFrames.push({ n: presented, w, h, rgba: m.HEAPU8.slice(ptr, ptr + w * h * 4) });
  if (window.isaacFrames.length > KEEP_FRAMES) window.isaacFrames.shift();
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
      if (rel.startsWith('resources/packed/')) continue;
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
log(`  frames presented: ${presented}; lazy reads: ${lazyReads} files, ${(lazyBytes / 1048576).toFixed(1)} MB`);
logEl.textContent = window.isaacLog.slice(-12).join('\n');
window.isaacDone = done;
