// Boot the lifted module: place the memory image, run the host boot path,
// then call main. Every stage is reported separately so a failure names
// the stage it happened in.
import { readFileSync, readdirSync } from 'node:fs';
import Module from './boot.mjs';

const segsPath = process.argv[2] || 'output/recomp/host/isaac.segs.bin';
const stage = process.argv[3] || 'main';   // layout | boot | main

const m = await Module();

function stageOk(name, fn) {
  process.stdout.write(`\n=== ${name} ===\n`);
  try {
    const r = fn();
    return r;
  } catch (e) {
    console.log(`  TRAP in ${name}: ${e.message}`);
    const st = String(e.stack || '').split('\n').slice(1, 4).join('\n');
    if (st) console.log(st);
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
  stageOk('seed loose resources/ tree', () => {
    let files = 0, bytes = 0, failed = 0;
    const walk = (dir, rel) => {
      let entries;
      try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = `${dir}/${e.name}`, r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) {
          if (r === 'resources/packed') continue;          // archives: by name above
          walk(p, r);
        } else if (e.isFile()) {
          const data = readFileSync(p);
          if (seedFile(r, data)) { files += 1; bytes += data.length; }
          else { failed += 1; if (failed <= 5) console.log(`  FAIL seeding ${r}`); }
        }
      }
    };
    walk(`${INSTANCE_DIR}/resources`, 'resources');
    console.log(`  seeded ${files} loose files (${bytes} bytes) under resources/${failed ? `, ${failed} FAILED` : ''}`);
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
