/**
 * Browser glue: mounts user game files, boots isaac-host.wasm, drives rAF.
 * Uses plain classic scripts for file:// safety — this module is also loaded
 * as type=module from http(s). On file: protocol, index.html shows serve help.
 */
import {
  applyCanvasSize,
  createGlContext,
  DEFAULT_INTERNAL,
} from '../platform/window.js';
import { createFrameLoop } from '../platform/frame-loop.js';
import { createInputState, codeToVk } from '../platform/input.js';
import { createMountController, applyPlanToEmscriptenFS } from '../platform/browser-mount.js';
import { VIRTUAL_ROOTS } from '../platform/path.js';
import { planEmscriptenMount, indexFromPathList, validateGameMount } from '../platform/mount.js';

const $ = (id) => document.getElementById(id);

function log(msg, cls = '') {
  const el = $('log');
  if (!el) { console.log(msg); return; }
  const line = document.createElement('div');
  if (cls) line.className = cls;
  line.textContent = `[${new Date().toISOString().slice(11, 19)}] ${msg}`;
  el.appendChild(line);
  el.scrollTop = el.scrollHeight;
  console.log(msg);
}

function setStatus(t) {
  const el = $('status');
  if (el) el.textContent = t;
}

export async function boot() {
  if (location.protocol === 'file:') {
    setStatus('file:// blocked for ES modules — run: npm run serve');
    log('Open via local server for Chromebook: npm run serve', 'err');
    return;
  }

  const canvas = $('canvas');
  if (!canvas) throw new Error('#canvas missing');

  // Size canvas before WASM init
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const size = applyCanvasSize(
    canvas,
    rect.width || DEFAULT_INTERNAL.width,
    rect.height || DEFAULT_INTERNAL.height,
    dpr,
    { fitInternal: true, internalWidth: 960, internalHeight: 540 },
  );
  log(`canvas buffer ${size.width}x${size.height} (dpr=${size.dpr})`);

  // Prove WebGL exists even before wasm
  try {
    const { webgl2 } = createGlContext(canvas, { preserveDrawingBuffer: true });
    log(`WebGL probe ok (webgl2=${webgl2})`);
  } catch (e) {
    log(`WebGL probe failed: ${e.message}`, 'err');
  }

  setStatus('Loading WASM…');
  const createIsaacHost = (await import('../isaac-host.js')).default;
  const Module = await createIsaacHost({
    canvas,
    print: (t) => log(t),
    printErr: (t) => log(t, 'err'),
    locateFile: (path) => new URL('../' + path, import.meta.url).href,
  });

  const ok = Module._isaac_init(size.width, size.height);
  if (!ok) {
    setStatus('WASM init failed');
    log(Module.UTF8ToString(Module._isaac_get_last_error()), 'err');
    return;
  }
  setStatus('WASM ready — mount game directory');
  log('isaac-host initialized');

  const input = createInputState();
  window.addEventListener('keydown', (e) => {
    const r = input.onKeyDown(e);
    if (r.vk) Module._isaac_key_event(r.vk, 1);
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    const r = input.onKeyUp(e);
    if (r.vk) Module._isaac_key_event(r.vk, 0);
  });

  window.addEventListener('resize', () => {
    const r2 = canvas.getBoundingClientRect();
    const s2 = applyCanvasSize(canvas, r2.width, r2.height, window.devicePixelRatio || 1, {
      fitInternal: true,
      internalWidth: 960,
      internalHeight: 540,
    });
    Module._isaac_set_canvas_size(s2.width, s2.height);
  });

  async function materializeMount(mount) {
    setStatus('Mounting into MEMFS…');
    const plan = mount.plan;
    // Ensure dirs
    for (const d of plan.directories) {
      try {
        Module.FS.mkdirTree(d);
      } catch (_) {
        try { Module.FS.mkdir(d); } catch (__) {}
      }
    }

    // For picker handles
    if (mount.listed && mount.handle) {
      let n = 0;
      const total = mount.listed.length;
      for (const { relativePath, handle } of mount.listed) {
        const virt = `${VIRTUAL_ROOTS.game}/${relativePath}`.replace(/\\/g, '/');
        // ensure parent
        const parent = virt.slice(0, virt.lastIndexOf('/'));
        try { Module.FS.mkdirTree(parent); } catch (_) {}
        const file = await handle.getFile();
        const buf = new Uint8Array(await file.arrayBuffer());
        Module.FS.writeFile(virt, buf);
        n++;
        if (n % 25 === 0 || n === total) {
          log(`mounted ${n}/${total}: ${relativePath}`);
          setStatus(`Mounting ${n}/${total}`);
        }
      }
    } else if (mount.files) {
      let n = 0;
      for (const { relativePath, file } of mount.files) {
        const virt = `${VIRTUAL_ROOTS.game}/${relativePath}`.replace(/\\/g, '/');
        const parent = virt.slice(0, virt.lastIndexOf('/'));
        try { Module.FS.mkdirTree(parent); } catch (_) {}
        const buf = new Uint8Array(await file.arrayBuffer());
        Module.FS.writeFile(virt, buf);
        n++;
        if (n % 25 === 0) log(`mounted ${n}: ${relativePath}`);
      }
    }

    Module._isaac_set_mounted(1);
    log(`mount validation: ${JSON.stringify(mount.validation)}`);
    // Load PE for signature scan (cwrap handles string→UTF8)
    const pePath = `${VIRTUAL_ROOTS.game}/isaac-ng.exe`;
    try {
      Module.FS.stat(pePath);
      const load = Module.cwrap('isaac_load_pe', 'number', ['string']);
      const loaded = load(pePath);
      log(`PE load result=${loaded} sigs=${Module._isaac_sig_count()}`);
    } catch (e) {
      log(`PE load failed: ${e.message}`, 'err');
    }

    // Lua mod surface: load resources/scripts/main.lua if present
    try {
      const mainLua = `${VIRTUAL_ROOTS.game}/resources/scripts/main.lua`;
      Module.FS.stat(mainLua);
      const loadMod = Module.cwrap('isaac_lua_load_mod_script', 'number', ['string']);
      const r = loadMod(mainLua);
      log(`main.lua register=${r} mods=${Module._isaac_lua_mods_loaded()}`);
    } catch (e) {
      log(`main.lua not mounted or failed: ${e.message}`);
    }

    setStatus(`Mounted phase=${Module._isaac_get_phase()}`);
  }

  const mountCtl = createMountController({
    requireValid: true,
    onMounted: materializeMount,
  });

  $('btn-pick')?.addEventListener('click', async () => {
    try {
      await mountCtl.mountFromPicker();
    } catch (e) {
      log(`Picker mount failed: ${e.message}`, 'err');
      setStatus('Mount failed');
    }
  });

  const drop = $('drop');
  if (drop) {
    drop.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('drag');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('drag'));
    drop.addEventListener('drop', async (e) => {
      e.preventDefault();
      drop.classList.remove('drag');
      try {
        await mountCtl.mountFromDrop(e.dataTransfer);
      } catch (err) {
        log(`Drop mount failed: ${err.message}`, 'err');
      }
    });
  }

  // Frame loop
  const loop = createFrameLoop();
  loop.start(({ time }) => {
    Module._isaac_tick(time);
    if (Module._isaac_frame_count() % 60 === 0) {
      const phase = Module._isaac_get_phase();
      const statusPtr = Module._isaac_get_status();
      const status = Module.UTF8ToString(statusPtr);
      setStatus(`phase=${phase} ${status} fps~${loop.getStats().fps.toFixed?.(1) ?? loop.getStats().fps}`);
    }
  });

  // Expose for playwright / tests
  window.__ISAAC__ = {
    Module,
    loop,
    mountCtl,
    input,
    VIRTUAL_ROOTS,
  };
  log('boot complete');
}

// Auto-boot when loaded as module from page
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot().catch((e) => log(String(e), 'err')));
  } else {
    boot().catch((e) => log(String(e), 'err'));
  }
}

