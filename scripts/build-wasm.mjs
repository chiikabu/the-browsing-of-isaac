/**
 * Build isaac-host with Emscripten.
 * Requires emsdk env (emcc on PATH) or EMSDK set.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, existsSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outDir = join(root, 'web');
const native = join(root, 'native', 'isaac_host.cpp');

mkdirSync(outDir, { recursive: true });

const emsdk = process.env.EMSDK || '';
const emccCandidates = [
  process.env.EMCC,
  emsdk && join(emsdk, 'upstream/emscripten/emcc.exe'),
  emsdk && join(emsdk, 'upstream/emscripten/emcc.bat'),
  emsdk && join(emsdk, 'upstream/emscripten/emcc'),
  emsdk && join(emsdk, 'upstream/emscripten/emcc.py'),
  'emcc',
].filter(Boolean);

function findEmcc() {
  for (const c of emccCandidates) {
    if (c === 'emcc' || existsSync(c)) return c;
  }
  return null;
}

const emcc = findEmcc();
if (!emcc) {
  console.error('emcc not found. Install emsdk and set EMSDK.');
  process.exit(1);
}

const flags = [
  native,
  '-O2',
  '-sUSE_WEBGL2=1',
  '-sMIN_WEBGL_VERSION=2',
  '-sMAX_WEBGL_VERSION=2',
  '-sFULL_ES3=1',
  '-sALLOW_MEMORY_GROWTH=1',
  '-sFORCE_FILESYSTEM=1',
  '-sEXIT_RUNTIME=0',
  '-sMODULARIZE=1',
  '-sEXPORT_ES6=1',
  '-sEXPORT_NAME=createIsaacHost',
  '-sEXPORTED_RUNTIME_METHODS=ccall,cwrap,FS,UTF8ToString,stringToUTF8,lengthBytesUTF8,HEAPU8',
  '-sEXPORTED_FUNCTIONS=_main,_isaac_init,_isaac_tick,_isaac_set_canvas_size,_isaac_canvas_width,_isaac_canvas_height,_isaac_set_mounted,_isaac_is_mounted,_isaac_load_pe,_isaac_pe_loaded,_isaac_sig_count,_isaac_find_sig,_isaac_key_event,_isaac_key_down,_isaac_lua_init,_isaac_lua_ready,_isaac_lua_load_mod_script,_isaac_lua_mods_loaded,_isaac_get_phase,_isaac_set_phase,_isaac_get_status,_isaac_get_last_error,_isaac_frame_count,_isaac_gl_ready,_isaac_read_center_pixel,_isaac_count_nonblack_samples,_isaac_mkdir_p,_malloc,_free',
  '-sENVIRONMENT=web',
  '-sGL_SUPPORT_AUTOMATIC_ENABLE_EXTENSIONS=1',
  '-lGL',
  '-o', join(outDir, 'isaac-host.js'),
];

// Build flags documented for reproducibility
const documentedFlags = flags.map((value) => {
  if (value === native) return 'native/isaac_host.cpp';
  if (value === join(outDir, 'isaac-host.js')) return 'web/isaac-host.js';
  return value;
});
const flagDoc = {
  emcc: 'EMCC or $EMSDK/upstream/emscripten/emcc',
  versionHint: 'Emscripten 6.0.5+',
  flags: documentedFlags,
  notes: [
    'MODULARIZE=1 + EXPORT_NAME=createIsaacHost for static page glue',
    'FORCE_FILESYSTEM=1 for MEMFS mounts of user game directory',
    'USE_WEBGL2=1 for browser canvas',
    'Single-threaded host (no pthreads) for Chromebook file:// and simple serve',
  ],
};
writeFileSync(join(root, 'docs', 'build-flags.json'), JSON.stringify(flagDoc, null, 2));

console.log('Running', emcc, flags.join(' '));
const r = spawnSync(emcc, flags, {
  stdio: 'inherit',
  shell: process.platform === 'win32' && /\.(bat|cmd)$/i.test(emcc),
  env: process.env,
});
if (r.status !== 0) {
  console.error('emcc failed', r.status);
  process.exit(r.status || 1);
}
console.log('Built web/isaac-host.js + web/isaac-host.wasm');
