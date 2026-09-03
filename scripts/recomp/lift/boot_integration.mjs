// Boot the lifted module: place the memory image, run the host boot path,
// then call main. Every stage is reported separately so a failure names
// the stage it happened in.
import { readFileSync, readdirSync, statSync } from 'node:fs';

// ISAAC_V8_FLAGS: V8 flags for this run, re-exec'd onto the command line
// because node refuses them in NODE_OPTIONS ("--no-wasm-tier-up is not
// allowed in NODE_OPTIONS") and v8.setFlagsFromString is read too late for
// the wasm compiler. Round 15a: `ISAAC_V8_FLAGS=--no-wasm-tier-up` cuts the
// room-entry crawl from 4436 s to 107 s (recomp-architecture.md §21.28).
if (process.env.ISAAC_V8_FLAGS && !process.env.ISAAC_V8_FLAGS_APPLIED) {
  const { spawnSync } = await import('node:child_process');
  const flags = process.env.ISAAC_V8_FLAGS.trim().split(/\s+/).filter(Boolean);
  const r = spawnSync(process.execPath, [...flags, ...process.execArgv, ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, ISAAC_V8_FLAGS_APPLIED: '1' },
  });
  process.exit(r.status === null ? 1 : r.status);
}

const Module = (await import('./boot.mjs')).default;

const segsPath = process.argv[2] || 'output/recomp/host/isaac.segs.bin';
const stage = process.argv[3] || 'main';   // layout | boot | main

Error.stackTraceLimit = 400;   // a V8 RangeError's trace names the wasm frames: a recursion cycle is in there
const m = await Module();

function stageOk(name, fn) {
  process.stdout.write(`\n=== ${name} ===\n`);
  try {
    const r = fn();
    return r;
  } catch (e) {
    console.log(`  TRAP in ${name}: ${e.message}`);
    try { if (typeof m._isaac_dump_va_ring === 'function') m._isaac_dump_va_ring(); } catch (e2) { /* best effort */ }
    const lines = String(e.stack || '').split('\n').slice(1);
    if (e instanceof RangeError || /call stack/i.test(String(e.message))) {
      // the whole trace, runs of the same frame collapsed: a cycle reads as a pattern
      let last = null, run = 0;
      const out = [];
      for (const l of lines) {
        const fr = l.trim().replace(/\s+\(.*$/, '');
        if (fr === last) { run += 1; continue; }
        if (last !== null) out.push(run > 1 ? `${last} x${run}` : last);
        last = fr; run = 1;
      }
      if (last !== null) out.push(run > 1 ? `${last} x${run}` : last);
      console.log(`  stack (${lines.length} frames, runs collapsed):`);
      for (const l of out.slice(0, 120)) console.log(`    ${l}`);
    } else {
      const st = lines.slice(0, 3).join('\n');
      if (st) console.log(st);
    }
    return null;
  }
}

// --- place the memory image -------------------------------------------
const blob = readFileSync(segsPath);
const p = m._malloc(blob.length);
m.HEAPU8.set(blob, p);
const nseg = stageOk('place memory image', () => m._isaac_place_image(p, blob.length));
console.log(`  isaac.segs.bin ${blob.length} bytes -> ${nseg} segments`);
if (nseg === null || nseg < 0) { console.log('RESULT: image placement failed'); process.exit(2); }
m._free(p);

// --- layout agreement --------------------------------------------------
const layoutBad = stageOk('layout', () => m._isaac_layout_check());
m._isaac_guard_arm();
console.log('  guard armed');
if (stage === 'layout') { console.log(`\nRESULT: layout ${layoutBad ? 'FAIL' : 'OK'}`); process.exit(layoutBad ? 1 : 0); }

// --- seed the RAM-FS with the packed archives --------------------------
// The lifted HUD load (Manager::LoadImage "gfx/ui/coop menu.png") reads
// resources/packed/graphics.a through the game's own fopen/fread; an empty
// FS returns NULL and the guest faults at 0x009a26c2. Seed the archives the
// game opens from the locally-owned instance BEFORE main so the KAGE loader
// finds them. Requires the boot module to export _isaac_fs_seed (add it to
// the boot link's EXPORTED_FUNCTIONS). music.a/videos.a are not on the boot
// path and are skipped to keep the seed small.
//
// Boot round 10: the archives are NOT the whole install. This instance's
// animations.a holds a single 4 MB compressed bundle (TOC count 1), and the
// .anm2 files the AnmCache asks for by path ("gfx/ui/ui_streak.anm2"), the
// GLSL shaders ("resources/shaders/*.vs") and the Lua scripts
// ("resources/scripts/main.lua") are LOOSE files under resources/ (476 files,
// 38 MB) that KAGE's mount-root scan indexes and resolves by path. Seed that
// tree too, everything except packed/ (handled above by name).
const INSTANCE_DIR = 'C:/Users/Luca/Desktop/isaac/.scratch/game-instance';
const PACKED_DIR = `${INSTANCE_DIR}/resources/packed`;
const BOOT_ARCHIVES = ['graphics.a', 'config.a', 'fonts.a', 'animations.a', 'rooms.a', 'sfx.a'];
function seedFile(relPath, bytes) {
  const pathBytes = Buffer.from(relPath + '\0', 'utf8');
  const pp = m._malloc(pathBytes.length);
  const dp = m._malloc(bytes.length || 1);
  m.HEAPU8.set(pathBytes, pp);
  if (bytes.length) m.HEAPU8.set(bytes, dp);
  const ok = m._isaac_fs_seed(pp, dp, bytes.length);
  m._free(pp); m._free(dp);
  return ok;
}
// Round 12f: the extracted tree is seeded LAZILY. Each file's size is
// registered (directory scans, stat and GetFileSize see it); the bytes are
// read from disk on the game's first open through Module.isaacLazyRead,
// which the RAM-FS calls with the seed path verbatim. Eager seeding cost
// ~3 s and 208 MB of host heap per boot for files most runs never open.
let lazyReads = 0, lazyBytes = 0;
m.isaacLazyRead = (src, dst, len) => {
  try {
    const bytes = readFileSync(`${INSTANCE_DIR}/${src}`);
    if (bytes.length < len) { console.log(`  lazy read of ${src}: ${bytes.length} bytes on disk, ${len} registered`); return 0; }
    m.HEAPU8.set(bytes.subarray(0, len), dst);
    lazyReads += 1; lazyBytes += len;
    return 1;
  } catch (e) {
    console.log(`  lazy read FAILED for ${src}: ${e.message}`);
    return 0;
  }
};
function seedLazy(relPath, size) {
  if (typeof m._isaac_fs_seed_lazy !== 'function') {
    return seedFile(relPath, readFileSync(`${INSTANCE_DIR}/${relPath}`));
  }
  const pathBytes = Buffer.from(relPath + '\0', 'utf8');
  const pp = m._malloc(pathBytes.length);
  m.HEAPU8.set(pathBytes, pp);
  const ok = m._isaac_fs_seed_lazy(pp, size);
  m._free(pp);
  return ok;
}
export function isaacLazyStats() { return { lazyReads, lazyBytes }; }

// Round 14a: scripted input for the node profile too. ISAAC_INPUT holds the
// same timeline syntax as the web runner's input= (frame:Key, frame:mouse:x:y,
// frame:click): the host's PeekMessageW polls m.isaacInputPoll(frame, out)
// and turns each event into a Win32 message for GLFW's pump, so a headless
// node run can navigate the menus and start a run without rendering.
const KEYS = {
  enter: [0x0D, 0x1C, 0], escape: [0x1B, 0x01, 0], space: [0x20, 0x39, 0], tab: [0x09, 0x0F, 0],
  up: [0x26, 0x48, 1], down: [0x28, 0x50, 1], left: [0x25, 0x4B, 1], right: [0x27, 0x4D, 1],
  shift: [0x10, 0x2A, 0], ctrl: [0x11, 0x1D, 0], a: [0x41, 0x1E, 0], d: [0x44, 0x20, 0],
  e: [0x45, 0x12, 0], q: [0x51, 0x10, 0], r: [0x52, 0x13, 0], s: [0x53, 0x1F, 0], w: [0x57, 0x11, 0],
  f: [0x46, 0x21, 0], m: [0x4D, 0x32, 0], '1': [0x31, 0x02, 0], '2': [0x32, 0x03, 0],
};
const inputTimeline = [];
for (const item of (process.env.ISAAC_INPUT || '').split(',').map((t) => t.trim()).filter(Boolean)) {
  const [fr, what, ...rest] = item.split(':');
  const frame = Number(fr), w = (what || '').toLowerCase();
  if (w === 'mouse') inputTimeline.push({ frame, ev: [2, Number(rest[0] || 0), Number(rest[1] || 0), 0] });
  else if (w === 'click' || w === 'rclick') {
    const btn = w === 'click' ? 0 : 1;
    inputTimeline.push({ frame, ev: [3, btn, 1, 0] });
    inputTimeline.push({ frame: frame + 2, ev: [3, btn, 0, 0] });
  } else if (KEYS[w]) {
    const [vk, sc, ext] = KEYS[w];
    const hold = Math.max(1, Number(rest[0] || 2));      // frame:key[:hold] -- held for `hold` frames
    inputTimeline.push({ frame, ev: [1, vk, sc | (ext << 8), 1] });
    inputTimeline.push({ frame: frame + hold, ev: [1, vk, sc | (ext << 8), 0] });
  } else console.log(`  ISAAC_INPUT: unknown key '${what}' in '${item}'`);
}
inputTimeline.sort((a, b) => a.frame - b.frame);
let inputsDelivered = 0;
if (inputTimeline.length) {
  console.log(`  ISAAC_INPUT: ${inputTimeline.length} scripted events`);
  m.isaacInputPoll = (frame, out) => {
    if (!inputTimeline.length || inputTimeline[0].frame > frame) return 0;
    const { ev } = inputTimeline.shift();
    m.HEAP32.set(ev, out >> 2);
    inputsDelivered += 1;
    return 1;
  };
}
if (typeof m._isaac_fs_seed === 'function') {
  stageOk('seed packed archives', () => {
    let seeded = 0;
    for (const name of BOOT_ARCHIVES) {
      let bytes;
      try { bytes = readFileSync(`${PACKED_DIR}/${name}`); }
      catch { console.log(`  (skip ${name}: not present locally)`); continue; }
      const relPath = `resources/packed/${name}`;
      const ok = seedFile(relPath, bytes);
      console.log(`  seed ${relPath} ${bytes.length} bytes -> ${ok ? 'ok' : 'FAIL'}`);
      if (ok) seeded += 1;
    }
    return seeded;
  });
  // Boot round 11: the instance is a ResourceExtractor DUMP, not a Steam
  // layout. The real install keeps everything in resources/packed/*.a
  // (afterbirth.a, afterbirthp.a, repentance.a: 1.1 GB the instance does not
  // carry) and resources/ holds only packed/ + scripts/. The emulator-era
  // instance instead has the archives' contents extracted to the install
  // ROOT (gfx/, font/, data/, *.xml: 10,725 files, 208 MB) and relies on the
  // canonical exe's hand patch at 0x009ab970 (no "resources/" mount root), so
  // every relative key ("players.xml", "gfx/ui/x.anm2") misses the archive
  // index (keyed "resources/...") and resolves through the "" root's scan of
  // that extracted tree. The small archives left in resources/packed/ are
  // STALE (config.a's players.xml is the Afterbirth+ one); with a
  // "resources/" root they shadow the extracted Repentance+ files, because
  // KAGE tries the archive index before a root's loose map. Seed the whole
  // tree the game would see on disk. Skipped: exe/dll/so (not assets), .ogv
  // (63 MB of cutscenes; videos.a is skipped for the same reason), mods/,
  // and the duplicate top-level packed/ (the game opens archives by the
  // resources/packed/ name above).
  stageOk('seed extracted instance tree', () => {
    let files = 0, bytes = 0, failed = 0, skipped = 0;
    const SKIP_DIRS = new Set(['resources/packed', 'packed', 'mods']);
    const SKIP_EXT = /\.(exe|dll|so|ogv)$/i;
    const walk = (dir, rel) => {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = `${dir}/${e.name}`, r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) {
          if (SKIP_DIRS.has(r)) continue;
          walk(p, r);
        } else if (e.isFile()) {
          if (SKIP_EXT.test(e.name) || e.name.startsWith('.')) { skipped += 1; continue; }
          const size = statSync(p).size;
          if (seedLazy(r, size)) { files += 1; bytes += size; }
          else { failed += 1; if (failed <= 5) console.log(`  FAIL seeding ${r}`); }
        }
      }
    };
    walk(INSTANCE_DIR, '');
    console.log(`  registered ${files} loose files lazily (${(bytes / 1048576).toFixed(1)} MB on disk, read on first open) from the instance root, ${skipped} skipped by type${failed ? `, ${failed} FAILED` : ''}`);
    // The host Lua module (upstream 5.3.3 in wasm) opens scripts through its
    // OWN libc, which this link maps to the real Node filesystem
    // (-sNODERAWFS=1) relative to process.cwd() -- not through the RAM-FS.
    // So luaL_loadfilex("resources/scripts/main.lua") only resolves when the
    // boot runs with cwd = the instance dir. Say so instead of guessing.
    if (process.cwd().replace(/\\/g, '/').toLowerCase() !== INSTANCE_DIR.toLowerCase()) {
      console.log(`  NOTE: cwd is not the instance dir; the host Lua loader (NODERAWFS) will not find resources/scripts/*.lua.`);
      console.log(`        run:  cd ${INSTANCE_DIR} && node <boot dir>/boot_integration.mjs <segs> main`);
    }
    return files;
  });
} else {
  console.log('  (seed skipped: boot module has no _isaac_fs_seed export — rebuild the boot link)');
}

// --- host boot: IAT, TEB, TLS, _initterm -------------------------------
const bootRc = stageOk('host boot (IAT + TEB + TLS + _initterm)',
                       () => m._isaac_run_boot(1));
console.log(`  isaac_boot_init -> ${bootRc}`);
let g = m._isaac_guard_check();
console.log(`  guard after boot: ${g ? g + ' words CORRUPTED' : 'intact'}`);
if (bootRc === null) { console.log('\nRESULT: boot trapped'); process.exit(1); }
if (stage === 'boot') { console.log(`\nRESULT: boot rc=${bootRc}`); process.exit(bootRc ? 1 : 0); }

// --- main --------------------------------------------------------------
const mainRc = stageOk('main @ 0x00931050', () => m._isaac_run_main());
console.log(`  isaac_boot_call_main -> ${mainRc}`);
console.log(`  lazy file reads: ${lazyReads} files, ${(lazyBytes / 1048576).toFixed(1)} MB fetched on first open`);
if (inputTimeline.length || inputsDelivered) console.log(`  scripted input: ${inputsDelivered} events delivered, ${inputTimeline.length} pending`);
g = m._isaac_guard_check();
console.log(`  guard after main: ${g ? g + ' words CORRUPTED' : 'intact'}`);
try { m._isaac_stub_report(); } catch (e) { /* best effort */ }
try { m._isaac_heap_report(); } catch (e) { /* absent in older host builds */ }
try { m._isaac_module_report(); } catch (e) { /* absent in older host builds */ }

// --- optional guest-memory dump ---------------------------------------
// ISAAC_DUMP32=0xc379e8:4,0xc37a10:8 prints guest dwords after main. The
// guest address space is identity-mapped into the wasm heap, so a static the
// engine keeps (a vector's begin/end, a manager's this) can be read back
// without rebuilding the 272 MB module just to add a printf.
if (process.env.ISAAC_DUMP32) {
  console.log('\n=== guest dwords (ISAAC_DUMP32) ===');
  for (const spec of process.env.ISAAC_DUMP32.split(',')) {
    const [aStr, nStr] = spec.split(':');
    const va = Number(aStr.trim());
    const n = Number(nStr ?? 1) || 1;
    if (!Number.isFinite(va) || va <= 0) { console.log(`  bad spec '${spec}'`); continue; }
    // HEAPU8 is the only view this link exports; assemble dwords by hand.
    const rd32 = (a) => (m.HEAPU8[a] | (m.HEAPU8[a + 1] << 8) |
                         (m.HEAPU8[a + 2] << 16) | (m.HEAPU8[a + 3] << 24)) >>> 0;
    for (let i = 0; i < n; i += 4) {
      const row = [];
      for (let k = 0; k < 4 && i + k < n; k++)
        row.push(rd32(va + 4 * (i + k)).toString(16).padStart(8, '0'));
      console.log(`  ${(va + 4 * i).toString(16).padStart(8, '0')}: ${row.join(' ')}`);
    }
  }
}

console.log(`\nRESULT: ${mainRc === null ? 'main trapped' : 'main returned ' + mainRc}`);
