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

function isNativeFrameMountPath(path) {
  const p = String(path || '').replace(/\\/g, '/').toLowerCase();
  return p.endsWith('isaac-ng.exe') ||
    p.startsWith('resources/font/') ||
    p.startsWith('resources/gfx/ui/') ||
    p.startsWith('gfx/font/') ||
    p.startsWith('gfx/ui/') ||
    p.includes('001.000_player.anm2') ||
    p.includes('002.000_tear.anm2') ||
    p.includes('033.000_fireplace.anm2') ||
    p.includes('bulletatlas.png') ||
    p.includes('grid/grid_fireplace.png') ||
    p.startsWith('resources/gfx/characters/costumes/') ||
    p.startsWith('gfx/characters/costumes/') ||
    p.includes('gfx/backdrop/01_basement') ||
    p.includes('gfx/grid/rocks_basement') ||
    p.includes('gfx/003.') ||
    p.includes('gfx/familiar/') ||
    p.includes('gfx/monsters/') ||
    p.includes('gfx/effects/') ||
    p.includes('familiar_orbitals_06_sacrificialdagger.png') ||
    p.includes('familiar_104_bigchubby.png') ||
    p.includes('effect_018_electriclaser.png') ||
    p.includes('monster_161_globin_body.png') ||
    p.includes('effect_016_bloodpool.png') ||
    p.includes('007.010_electric laser.anm2') ||
    p.includes('024.000_globin.anm2') ||
    p.includes('1000.012_tear poofa.anm2') ||
    p.includes('1000.025_creep (white).anm2');
}

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
  log('isaac-host initialized');

  const input = createInputState();
  // Native input bridge (created after the native bridge boots, below). Key
  // edges are pushed into it here so PE order Input -> Update -> Render holds:
  // DOM handlers run before rAF, the bridge is read at the top of the tick.
  let inputBridge = null;
  window.addEventListener('keydown', (e) => {
    const r = input.onKeyDown(e);
    if (r.vk) {
      Module._isaac_key_event(r.vk, 1);
      try { inputBridge?.setKey(r.vk, true); } catch (err) { log(`input bridge key: ${err.message}`, 'err'); }
    }
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Escape','Enter','KeyW','KeyA','KeyS','KeyD'].includes(e.code)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    const r = input.onKeyUp(e);
    if (r.vk) {
      Module._isaac_key_event(r.vk, 0);
      try { inputBridge?.setKey(r.vk, false); } catch (err) { log(`input bridge key: ${err.message}`, 'err'); }
    }
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
    } else if (mount.serverFiles) {
      const total = mount.serverFiles.length;
      let n = 0;
      for (const { relativePath, url } of mount.serverFiles) {
        const virt = `${VIRTUAL_ROOTS.game}/${relativePath}`.replace(/\\/g, '/');
        const parent = virt.slice(0, virt.lastIndexOf('/'));
        try { Module.FS.mkdirTree(parent); } catch (_) {}
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`auto-mount fetch ${relativePath}: HTTP ${resp.status}`);
        const buf = new Uint8Array(await resp.arrayBuffer());
        Module.FS.writeFile(virt, buf);
        n++;
        if (n % 25 === 0 || n === total) {
          log(`mounted ${n}/${total} (${((n / total) * 100).toFixed(0)}%): ${relativePath}`);
          setStatus(`Auto-mounting ${n}/${total} (${((n / total) * 100).toFixed(0)}%)`);
        }
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

  // Auto-mount: when the dev server can see a local Isaac install it exposes
  // /@game-index.json + /@game/*, so no picker/drop is needed. Falls back to
  // the picker/drop UI when the server has no game root.
  async function tryAutoServerMount() {
    try {
      const res = await fetch('/@game-index.json');
      if (!res.ok) return false;
      const payload = await res.json();
      if (!payload.ok || !Array.isArray(payload.files) || payload.files.length === 0) {
        return false;
      }
      // Mount only what the native frame path actually reads: the PE (signature
      // scan), menu art and fonts. Copying all 11245 files into MEMFS costs
      // minutes per load and nothing on the native path reads them. Pass
      // ?fullmount=1 to mount everything (needed only for asset work).
      const fullMount = new URLSearchParams(location.search).get('fullmount') === '1';
      const files = fullMount
        ? payload.files
        : payload.files.filter(({ path }) => isNativeFrameMountPath(path));
      log(
        `auto-mount: "${payload.rootName}" ${files.length}/${payload.files.length} files` +
          (fullMount ? ' (full mount)' : ' (native frame path set; ?fullmount=1 for all)'),
      );
      await mountCtl.mountFromServerGame({ files });
      return true;
    } catch (e) {
      log(`auto-mount unavailable: ${e.message}`, 'err');
      return false;
    }
  }

  let autoMounted = false;
  try {
    autoMounted = await tryAutoServerMount();
  } catch (e) {
    log(`auto-mount failed: ${e.message}`, 'err');
  }
  if (autoMounted) {
    $('btn-pick')?.classList.add('hidden');
    $('drop')?.classList.add('hidden');
  } else {
    setStatus('WASM ready — mount game directory');
  }

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

  // Prefer native/Wasm Game::Update slice for the simulation tick when available.
  // Residual hosts are logged; they must not re-enter x86 PE emulation.
  let nativeBridge = null;
  try {
    const { bootNativeUpdateBridge } = await import('./native-update-bridge.js');
    nativeBridge = await bootNativeUpdateBridge({ log });
    if (nativeBridge.usesX86Emulation) {
      log('Update tick fallback: paint-only host (no native slice)');
    } else {
      log(`Update tick owned by ${nativeBridge.mode} (usesX86Emulation=${nativeBridge.usesX86Emulation})`);
      setStatus(`native-wasm Update ready abi=${nativeBridge.slice?.abiVersion ?? '?'}`);
    }
  } catch (e) {
    log(`native bridge failed: ${e.message}`, 'err');
  }

  let seedStatePatch = null;
  let liveGuest = null;
  let updateCaptureArms = null;
  let applyA1f280Posts = null;
  let applyCapturedMotion = null;
  let capturedPlayerAddr = 0;
  let lastTickTime = 0;
try {
    const residual = await import('/@decomp/scripts/process-input-residual.mjs');
    applyA1f280Posts = residual.applyA1f280VcallGatePurePosts;
  } catch (e) {
    log(`a1f280 residual unavailable: ${e.message}`);
  }
  try {
    const {
      loadGameObjectSnapshot,
      loadRenderRootSnapshot,
      loadSnapshotSidecar,
      loadEntitiesSnapshot,
      describeSnapshot,
      describeSnapshotRecapture,
      createSnapshotRenderRecapture,
      packEntityPointerArray,
      applyDirBitsToCapturedEntity,
      GAME_OBJECT_PROBES,
      RENDER_ROOT_PROBES,
      gameObjectSnapshotUrl,
      renderRootSnapshotUrl,
      snapshotSidecarUrl,
      entitiesSnapshotUrl,
      DEFAULT_SNAPSHOT_LABEL,
    } = await import('/@decomp/scripts/game-state-snapshot.mjs');
    applyCapturedMotion = applyDirBitsToCapturedEntity;
    const { createLiveGuestMemory, installUpdateCapture } = await import('./capture-wiring.js');
    const params = new URLSearchParams(location.search);
    let label = params.get('state') || DEFAULT_SNAPSHOT_LABEL;
    let sidecar = await loadSnapshotSidecar(snapshotSidecarUrl(label));
    if (!sidecar && !params.get('state') && label === 'live') {
      label = 'inrun';
      sidecar = await loadSnapshotSidecar(snapshotSidecarUrl(label));
      log('game state: live capture missing, falling back to inrun');
    }
    const gameBytes = await loadGameObjectSnapshot(gameObjectSnapshotUrl(label), {
      warn: (m) => log(m),
    });
    const roomBytes = await loadRenderRootSnapshot(renderRootSnapshotUrl(label), {
      warn: (m) => log(m),
    });
    const entitySnap = await loadEntitiesSnapshot(entitiesSnapshotUrl(label), {
      warn: (m) => log(m),
    });
    if (gameBytes && nativeBridge?.session?.gameObject) {
      const dst = nativeBridge.session.gameObject;
      dst.set(gameBytes.subarray(0, dst.byteLength));
      const desc = describeSnapshot(gameBytes, GAME_OBJECT_PROBES);
      const roomDesc = roomBytes ? describeSnapshot(roomBytes, RENDER_ROOT_PROBES) : null;
      log(
        `game state: seeded ${label} ` +
          `(${desc.nonZeroBytes} nonzero Game bytes` +
          (roomDesc ? `, grid=${roomDesc.values.gridW}x${roomDesc.values.gridH}` : '') +
          `)`,
      );
    }
    if (roomBytes && nativeBridge?.renderGameObject) {
      const dst = nativeBridge.renderGameObject;
      dst.set(roomBytes.subarray(0, dst.byteLength));
      try {
        if (typeof nativeBridge.setRenderRecapture === 'function') {
          nativeBridge.setRenderRecapture(createSnapshotRenderRecapture(dst));
        }
        const recap = describeSnapshotRecapture(dst);
        log(
          `render root: seeded ${label} recapture entities=${recap.entityCount} ` +
            `grid=${recap.gridW}x${recap.gridH}`,
        );
      } catch (e) {
        log(`render recapture unavailable: ${e.message}`, 'err');
      }
    }
    if (sidecar && gameBytes && nativeBridge?.session?.gameObject) {
      const gamePointerValue = parseInt(sidecar.gamePointerValue, 16) >>> 0;
      const renderRootPointerValue = parseInt(sidecar.renderRootPointerValue, 16) >>> 0;
      liveGuest = createLiveGuestMemory();
      liveGuest.addRegion(gamePointerValue, nativeBridge.session.gameObject);
      if (nativeBridge.renderGameObject && renderRootPointerValue) {
        liveGuest.addRegion(renderRootPointerValue, nativeBridge.renderGameObject);
      }
      const entityRows = entitySnap?.entities || [];
      let mapped = 0;
      for (const row of entityRows) {
        if (row.bytes && row.address) {
          liveGuest.addRegion(row.address, row.bytes);
          mapped += 1;
        }
      }
      const entityCount = Number(sidecar.probes?.['render.entityCount@0x1264'] ?? entityRows.length) | 0;
      const entityArray = parseInt(sidecar.probes?.['render.entityArray@0x125c'] || '0', 16) >>> 0;
      if (entityArray && entityCount > 0 && entityRows.length) {
        liveGuest.addRegion(entityArray, packEntityPointerArray(entityRows, entityCount));
      }
      const playerRow = entityRows.find((row) => row.role === 'player') || entityRows[0] || null;
      capturedPlayerAddr = playerRow?.address || 0;
      if (mapped) {
        log(`entities: mapped ${mapped} blobs player@${(capturedPlayerAddr >>> 0).toString(16)}`);
      }
      try {
        updateCaptureArms = installUpdateCapture(nativeBridge, {
          gamePointerValue,
          liveGuest,
          gameView: new DataView(
            nativeBridge.session.gameObject.buffer,
            nativeBridge.session.gameObject.byteOffset,
            nativeBridge.session.gameObject.byteLength,
          ),
        });
        log(
          `update capture: heap-capable guest model armed (game@${gamePointerValue.toString(16)} ` +
            `+ renderRoot@${renderRootPointerValue.toString(16)}; guestWrite live; midRestockOwner walk live)`,
        );
      } catch (e) {
        log(`update capture wiring unavailable: ${e.message}`, 'err');
      }
    }
  } catch (e) {
    log(`game state capture unavailable: ${e.message}`);
  }

  try {
    const { createInputBridge } = await import('/@decomp/scripts/frame-input-bridge.mjs');
    inputBridge = createInputBridge();
    const menuAtCapture = (nativeBridge?.session?.state?.menuState23a74 ?? 0) !== 0;
    if (menuAtCapture) {
      try {
        inputBridge.setKey(0x1b, true);
        inputBridge.setKey(0x1b, false);
        log('menu lane: latched open (Esc / arrows / Enter)');
      } catch (err) {
        log(`menu lane latch failed: ${err.message}`, 'err');
      }
    } else {
      log('menu lane: in-run snapshot (Esc / arrows / Enter still live; no title latch)');
    }
    try { canvas.focus(); } catch (_) {}
    log('native input bridge ready (keys -> Update runtime inputs)');
  } catch (e) {
    log(`native input bridge unavailable: ${e.message}`);
  }

  let glHost = null;
  const { createRenderGlHost, ENTITY_SPRITE_CONVENTION } = await import('./render-host-gl.js');
  try {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('webgl2 context unavailable');
    glHost = createRenderGlHost({
      gl,
      width: size.width,
      height: size.height,
      guestRead: liveGuest?.read ?? null,
    });
    if (typeof nativeBridge?.setRenderHost === 'function') {
      nativeBridge.setRenderHost(glHost.handler);
      log('render host: WebGL2 bodies installed on the native render slice');
    } else {
      log('render host built but the native bridge exposes no setRenderHost');
    }
    if (typeof nativeBridge?.setRenderInputs === 'function') {
      nativeBridge.setRenderInputs({ option2a3c3: 1 });
      log('render inputs: host-side guest-memory model (G0 gate open)');
    }
  } catch (e) {
    log(`render GL host unavailable: ${e.message}`, 'err');
  }

  let menuScene = null;
  try {
    const { createMenuScene } = await import('./menu-scene.js');
    menuScene = createMenuScene({
      readFile: (path) => Module.FS.readFile(path),
      log: (m) => log(`menu-scene: ${m}`),
      root: VIRTUAL_ROOTS.resources,
    });
    await menuScene.load();
    let uploaded = 0;
    for (const tex of menuScene.textures()) {
      if (typeof glHost?.uploadTexture === 'function') {
        await glHost.uploadTexture(tex.key, tex.bytes);
        uploaded += 1;
      }
    }
    log(`menu scene ready: ${menuScene.textures().length} textures (${uploaded} uploaded)`);
  } catch (e) {
    log(`menu scene unavailable: ${e.message}`);
    menuScene = null;
  }

  const inRunRoots = [
    VIRTUAL_ROOTS.resources,
    '/isaac/resources',
    '/game/resources',
    '/isaac',
    '/game',
  ];
  let inRunUploaded = 0;
  if (typeof glHost?.uploadTexture === 'function') {
    const seen = new Set();
    for (const spec of Object.values(ENTITY_SPRITE_CONVENTION || {})) {
      if (!spec || !spec.tex || !spec.sheetRel || seen.has(spec.tex)) continue;
      seen.add(spec.tex);
      // MEMFS is case-sensitive while the game's resource paths mix cases
      // inconsistently (gfx/Monsters vs gfx/effects); resolve each path
      // segment case-insensitively against the mounted tree.
      const rels = [spec.sheetRel, spec.sheetRel.replace(/^gfx\//, '')];
      const resolveCI = (path) => {
        let cur = '';
        for (const part of path.split('/').filter(Boolean)) {
          const dir = cur || '/';
          let names;
          try { names = Module.FS.readdir(dir); } catch (_) { return null; }
          const match = names.includes(part)
            ? part
            : names.find((n) => n.toLowerCase() === part.toLowerCase());
          if (!match) return null;
          cur = `${dir === '/' ? '' : dir}/${match}`;
        }
        return cur;
      };
      let hit = null;
      for (const rel of rels) {
        for (const spriteRoot of inRunRoots) {
          const want = `${String(spriteRoot).replace(/\/$/, '')}/${rel}`.replace(/\/{2,}/g, '/');
          const path = resolveCI(want);
          if (!path) continue;
          try {
            const bytes = Module.FS.readFile(path);
            if (bytes && bytes.length) { hit = { path, bytes }; break; }
          } catch (_) {}
        }
        if (hit) break;
      }
      if (!hit) { log(`in-run sprites: miss ${spec.tex} ${spec.sheetRel}`); continue; }
      await glHost.uploadTexture(spec.tex, hit.bytes);
      inRunUploaded += 1;
      log(`in-run sprites: ${spec.tex} ${hit.path}`);
    }
  }
  log(`in-run sprites: uploaded ${inRunUploaded}`);

  const nativeRenderReady = () =>
    !!glHost && !!nativeBridge && !nativeBridge.usesX86Emulation &&
    typeof nativeBridge.renderTick === 'function';

  const loop = createFrameLoop();
  let frames = 0;
  let lastProcessInput = null;
  let processInputLogged = false;
  loop.start(({ time }) => {
    frames += 1;
    let extraRuntime = null;
    let statePatch = null;
    if (inputBridge) {
      try {
        extraRuntime = inputBridge.toRuntimeInputs?.() ?? null;
        statePatch = inputBridge.toStatePatch?.() ?? null;
        if (seedStatePatch) {
          statePatch = { ...seedStatePatch, ...(statePatch ?? {}) };
          seedStatePatch = null;
        }
        if (!statePatch && nativeBridge?.session?.gameObject &&
            typeof inputBridge.applyToGameObject === 'function') {
          inputBridge.applyToGameObject(nativeBridge.session.gameObject);
        }
      } catch (e) {
        log(`input bridge tick error: ${e.message}`, 'err');
      }
    }
    const renderReady = nativeRenderReady();
    if (renderReady) {
      try {
        glHost.beginFrame?.({
          gameObject: nativeBridge.renderGameObject ?? nativeBridge.session?.gameObject,
        });
      } catch (e) {
        log(`render beginFrame error: ${e.message}`, 'err');
      }
    }
    if (nativeBridge && !nativeBridge.usesX86Emulation &&
        typeof nativeBridge.processInputPrepoll === 'function') {
      try {
        lastProcessInput = nativeBridge.processInputPrepoll({});
        const samples = inputBridge?.toA1f280AxisSamples?.() ?? null;
        if (samples && typeof applyA1f280Posts === 'function') {
          const posts = applyA1f280Posts(samples);
          const axis = posts.find((row) => row.slot === 'A1F280_AXIS_PAIR0') || null;
          lastProcessInput = {
            ...(lastProcessInput || {}),
            a1f280Posts: posts,
            dirBitsMerged: axis?.dirBitsMerged ?? 0,
            axisX: axis?.x ?? samples.pair0?.x ?? 0,
            axisY: axis?.y ?? samples.pair0?.y ?? 0,
          };
        }
        if (capturedPlayerAddr && liveGuest && lastProcessInput &&
            typeof applyCapturedMotion === 'function') {
          const prev = lastTickTime || time;
          const dtMs = Math.max(0, Math.min(100, time - prev));
          lastTickTime = time;
          const moved = applyCapturedMotion(liveGuest, capturedPlayerAddr, {
            dirBits: lastProcessInput.dirBitsMerged || 0,
            axisX: lastProcessInput.axisX || 0,
            axisY: lastProcessInput.axisY || 0,
            tickScale: dtMs / (1000 / 30),
          });
          if (moved) lastProcessInput.capturedPlayer = moved;
        } else {
          lastTickTime = time;
        }
        if (!processInputLogged && lastProcessInput) {
          processInputLogged = true;
          const hosts = (lastProcessInput.residualEvents || []).length;
          log(
            `process-input: ${lastProcessInput.wired ? 'wired' : 'fallback'} ` +
              `pe=${lastProcessInput.usesX86Emulation ? 1 : 0} hosts=${hosts}`,
          );
        }
      } catch (e) {
        log(`process-input tick error: ${e.message}`, 'err');
      }
    }
    if (nativeBridge && !nativeBridge.usesX86Emulation && typeof nativeBridge.tick === 'function') {
      try {
        nativeBridge.tick(time, extraRuntime, statePatch);
      } catch (e) {
        log(`native Update tick error: ${e.message}`, 'err');
      }
    }
    try { inputBridge?.consumeEdges?.(); } catch (e) { log(`input edge drain: ${e.message}`, 'err'); }
    if (nativeBridge?.session) {
      const menuOpen = (nativeBridge.session.state?.menuState23a74 ?? 0) !== 0;
      const want = menuOpen ? 2 : (Module._isaac_is_mounted() ? 1 : 0);
      if (want !== Module._isaac_get_phase()) Module._isaac_set_phase(want);
    }
    let painted = false;
    if (renderReady) {
      try {
        const result = nativeBridge.renderTick(time);
        if (menuScene) {
          const st = nativeBridge.session?.state ?? {};
          menuScene.update({
            ...st,
            selection: inputBridge?.snapshot?.().menu?.selection ?? 0,
            frame: frames,
          });
          const cmds = menuScene.commands();
          if (cmds.length) glHost.submit?.(cmds);
        }
        const drawn = glHost.endFrame?.() ?? 0;
        painted = !!result && drawn > 0;
      } catch (e) {
        log(`native Render tick error: ${e.message}`, 'err');
      }
    }
    if (!painted) Module._isaac_tick(time);

    if (frames % 60 === 0) {
      const phase = Module._isaac_get_phase();
      const status = Module.UTF8ToString(Module._isaac_get_status());
      const path = nativeBridge?.mode ?? 'unknown';
      const pe = nativeBridge?.usesX86Emulation ? 'pe=1' : 'pe=0';
      const paint = painted ? 'render=native' : 'render=stub';
      const menu = (nativeBridge?.session?.state?.menuState23a74 ?? 0) !== 0 ? 'menu=1' : 'menu=0';
      const pi = lastProcessInput
        ? (lastProcessInput.wired ? 'pi=wired' : 'pi=fallback')
        : 'pi=0';
      const dir = lastProcessInput && lastProcessInput.dirBitsMerged != null
        ? `dir=0x${(lastProcessInput.dirBitsMerged >>> 0).toString(16)}`
        : 'dir=?';
      const pos = lastProcessInput?.capturedPlayer
        ? `pos=${lastProcessInput.capturedPlayer.x.toFixed(0)},${lastProcessInput.capturedPlayer.y.toFixed(0)}`
        : 'pos=?';
      setStatus(`path=${path} ${pe} ${paint} ${menu} ${pi} ${dir} ${pos} phase=${phase} ${status} fps~${loop.getStats().fps.toFixed?.(1) ?? loop.getStats().fps}`);
    }
  });

  window.__ISAAC__ = {
    Module,
    loop,
    mountCtl,
    input,
    inputBridge,
    glHost,
    menuScene,
    liveGuest,
    updateCaptureArms,
    VIRTUAL_ROOTS,
    nativeBridge,
    capturedPlayerAddr,
    framePathMode: nativeBridge?.mode ?? null,
    usesX86Emulation: nativeBridge?.usesX86Emulation ?? null,
    renderMode: () => (nativeRenderReady() ? 'native-wasm' : 'host-stub'),
    frames: () => frames,
    lastProcessInput: () => lastProcessInput,
  };
  log('boot complete');
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot().catch((e) => log(String(e), 'err')));
  } else {
    boot().catch((e) => log(String(e), 'err'));
  }
}
