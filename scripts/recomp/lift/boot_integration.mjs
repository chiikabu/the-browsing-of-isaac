// Boot the lifted module: place the memory image, run the host boot path,
// then call main. Every stage is reported separately so a failure names
// the stage it happened in.
import { readFileSync } from 'node:fs';
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
console.log(`\nRESULT: ${mainRc === null ? 'main trapped' : 'main returned ' + mainRc}`);
