/**
 * One-room tech demo proving the Isaac wasm hybrid architecture end-to-end.
 * SELF-CONTAINED: no dependency on scripts/serve.mjs's custom /@decomp/*
 * mounts — serves correctly from ANY static file server.
 *
 *   fetch(wasm: relative, then /@decomp/wasm/ fallback)
 *   WebAssembly.instantiate(bytes, {})                    ← ZERO imports
 *   → populate a test Room + entities in the module's linear memory
 *   → [Game+0x18300] = Room* (the real room-pointer field)
 *   → rAF loop (~60 fps): minimal hybrid tick, inline:
 *      · reset scratch, load the Game-object buffer (capture seam)
 *      · capture_scratch → overlay player position into the sparse state
 *      · native step + continuation resumes (wasm-published events only)
 *      · residual host body — the player-walk body applies input lanes to
 *        the player entity in linear memory (the capture-apply seam)
 *      · apply_scratch → export the Game-object buffer back
 *   → renderer draws grid cells + entities by reading linear memory directly
 *
 * The constants/runtime-inputs scratch blobs below are the frozen default
 * bytes scripts/decomp/frame-path.mjs writes every tick (createDefault-
 * NativeConstants / createDefaultNativeRuntimeInputs); encoded as offset:byte
 * pairs over zero-filled regions so the demo needs no layout tables.
 */

import { Renderer } from "./renderer.js";
import { initInput } from "./input.js";

/* ------------------------------------------------------------------ */
/* Proto-Room memory layout (lives above the scratch base 0x100000).   */
/* ------------------------------------------------------------------ */
const ROOM_BASE = 0x100000;
const ROOM_MAGIC = 0x49534143; // 'ISAC'
const CELLS_OFF = 0x40;
const GRID_W = 14;
const GRID_H = 8;
const ENT_BASE = ROOM_BASE + 0x400;
const ENT_STRIDE = 32;

const GAME_ROOM_PTR_OFF = 0x18300; // [Game+0x18300] = Room*
const PLAYER_SPEED = 3.4; // grid cells per second

/* Sparse-state field offsets within the slice's state struct. */
const STATE_POS_X_BITS_OFF = 8;
const STATE_POS_Y_BITS_OFF = 12;
/* Event-struct offsets (EVENTS_LAYOUT): continuation kind + walk residual. */
const EVENTS_CONTINUATION_OFF = 36;
const EVENTS_WALK_COUNT_OFF = 64;

/* Frozen default constants blob (32 bytes; see file header). */
const CONSTANTS_SIZE = 32;
const CONSTANT_BYTES = [
  2, 96, 3, 63, 6, 128, 7, 60, 10, 128, 11, 63, 12, 49, 13, 12,
  14, 67, 15, 61, 16, 137, 17, 136, 18, 8, 19, 61, 22, 80, 23, 192,
  26, 240, 27, 64, 30, 128, 31, 63,
]; // flat [offset, byte, ...]

/* Frozen default runtime-inputs blob (23696 bytes; see file header). */
const RUNTIME_INPUTS_SIZE = 23696;
const RUNTIME_INPUT_BYTES = [
  24, 1, 28, 8, 40, 1, 48, 1, 52, 5, 192, 1, 196, 1, 200, 15, 264, 1,
  692, 1, 696, 1, 1556, 1, 1560, 1, 1564, 1, 1568, 1, 1572, 1, 1576, 1,
  1580, 1, 1584, 1, 1588, 1, 1592, 1, 1596, 1, 1600, 1, 1604, 1, 1608, 1,
  1612, 1, 1616, 1, 1620, 1, 1624, 1, 1628, 1, 1632, 1, 1636, 1, 1640, 1,
  1644, 1, 1648, 1, 1652, 1, 1656, 1, 1660, 1, 1664, 1, 1668, 1, 1672, 1,
  1676, 1, 1680, 1,
]; // flat [offset, byte, ...]

/* Continuation-kind names (index = value published at events+36). */
const CONTINUATION_NAMES = [
  "RETURN_AFTER_GAME_UPDATE",
  "RETURN_AFTER_GATE_1D520",
  "RETURN_AFTER_GATE_1D654",
  "RETURN_AFTER_STATE_24ECC_UPDATE",
  "RETURN_AFTER_GENERIC_PROMPT_TRANSITION",
  "RETURN_AFTER_ITEM_OVERLAY_MENU",
  "RETURN_AFTER_HUD_DELAY",
  "RETURN_AFTER_GATE_1BA78",
  "RETURN_AFTER_GATE_1B83C",
  "RETURN_AFTER_MENU_GATE_EXIT",
  "RETURN_AFTER_TIMED_TRANSITION_HUD",
  "CONTINUE_NEXT_GATE",
  "CONTINUE_AT_TIMED_TRANSITION",
  "CONTINUE_AFTER_TIMED_TRANSITION",
  "CONTINUE_AT_COMMON_TAIL",
  "RESUME_AFTER_GENERIC_PROMPT_UPDATE",
  "RESUME_AFTER_ITEM_OVERLAY_UPDATE",
  "RESUME_AFTER_MENU_OPEN",
  "RESUME_AFTER_MENU_UPDATE",
  "RESUME_AFTER_GATE_1B83C_UPDATES",
  "RESUME_AFTER_92F1C0",
  "RESUME_AFTER_98DBA0_PLAYER_WALK",
  "RESUME_AFTER_FRAME_AUX_UPDATES",
  "RESUME_AFTER_STAGE_TRANSITION_EFFECT",
  "RESUME_AFTER_ENGINE_PREFIX",
  "RESUME_AFTER_ROOM_TRANSITION_EFFECT",
  "RESUME_AFTER_ROOM_UPDATE_PREFIX_B1",
  "RESUME_AFTER_ROOM_UPDATE_PREFIX_B2",
  "RESUME_AFTER_ROOM_UPDATE_PREFIX",
  "RESUME_AFTER_ROOM_CLEAR_NESTED",
  "RESUME_AFTER_ROOM_UPDATE_CLEAR",
  "RESUME_AFTER_ROOM_UPDATE_HEAD",
  "RESUME_AFTER_4257B0_PASS_A",
  "RESUME_AFTER_FRAME_MANAGER_UPDATES",
];

/* Resume/continue scratch exports keyed by continuation-kind value. The wasm
   publishes the kind; the host drives the matching *_scratch export. */
const CONTINUATION_EXPORTS = {
  12: "continue_timed_transition",
  13: "continue_menu_gates",
  15: "resume_generic_prompt",
  16: "resume_item_overlay",
  17: "resume_menu_open",
  18: "resume_menu_update",
  19: "resume_gate_1b83c",
  20: "resume_92f1c0",
  21: "resume_98dba0_player_walk",
  22: "resume_frame_aux_updates",
  23: "resume_stage_transition_effect",
  24: "resume_engine_prefix",
  25: "resume_room_transition_effect",
  26: "resume_room_update_prefix_b1",
  27: "resume_room_update_prefix_b2",
  28: "resume_room_update_prefix",
  29: "resume_room_clear_nested",
  30: "resume_room_update_clear",
  31: "resume_room_update_head",
  32: "resume_4257b0_pass_a",
  33: "resume_frame_manager_updates",
};

function status(msg, isErr = false) {
  const el = document.getElementById("status");
  el.textContent = msg;
  el.classList.toggle("err", isErr);
}

/** Fatal errors surface on the page as well as the console. */
window.addEventListener("error", (e) => status(`error: ${e.message}`, true));
window.addEventListener("unhandledrejection", (e) =>
  status(`error: ${e.reason?.message ?? e.reason}`, true));

/* ------------------------------------------------------------------ */
/* Slice loading                                                       */
/* ------------------------------------------------------------------ */

async function loadSliceWasm() {
  /* Relative first (self-contained deploys drop the wasm next to this file);
     the dev server's /@decomp/wasm/ mount is the fallback so the tracked tree
     never needs a binary copy inside web/ (check-repo-safety). */
  const candidates = [
    new URL("./game-update-slice.wasm", import.meta.url),
    new URL("/@decomp/wasm/game-update-slice.wasm", import.meta.url),
  ];
  let res = null;
  let url = null;
  for (const candidate of candidates) {
    url = candidate;
    try {
      res = await fetch(candidate);
      if (res.ok) break;
    } catch (_) { res = null; }
  }
  if (!res || !res.ok) throw new Error(`wasm fetch failed: ${res?.status} ${url}`);
  const bytes = await res.arrayBuffer();
  const module = await WebAssembly.compile(bytes);
  const imports = WebAssembly.Module.imports(module);
  if (imports.length !== 0) {
    throw new Error(`Game::Update slice must have zero Wasm imports; got ${imports.length}`);
  }
  const instance = await WebAssembly.instantiate(module, {});
  const wasm = instance.exports;
  if (!(wasm.memory instanceof WebAssembly.Memory)) {
    throw new Error("Game::Update slice must export memory");
  }
  const exp = (suffix) => {
    const fn = wasm[`isaac_game_update_slice_${suffix}`];
    if (typeof fn !== "function") throw new Error(`missing export ${suffix}`);
    return fn;
  };
  return {
    abiVersion: exp("abi_version")(),
    wasm,
    memory: wasm.memory,
    paths: {
      step: exp("step_scratch"),
      resumes: Object.fromEntries(
        Object.entries(CONTINUATION_EXPORTS).map(([k, v]) => [k, exp(`${v}_scratch`)]),
      ),
      reset: exp("reset_scratch"),
      stateAddress: exp("state_address"),
      stateSize: exp("state_size"),
      constantsAddress: exp("constants_address"),
      runtimeInputsAddress: exp("runtime_inputs_address"),
      eventsAddress: exp("events_address"),
      eventsSize: exp("events_size"),
      gameObjectAddress: exp("game_object_address"),
      gameObjectSize: exp("game_object_size"),
      captureScratch: exp("capture_scratch"),
      applyScratch: exp("apply_scratch"),
    },
  };
}

/* ------------------------------------------------------------------ */
/* Minimal hybrid tick                                                 */
/* ------------------------------------------------------------------ */

/**
 * One capture → native-step(+continuations) → apply tick over the slice.
 * @returns {{ continuationKind:number, walkEventCount:number,
 *             residualKinds:number, stateXBits:number, stateYBits:number }}
 */
function tickSlice(slice, gameObject, posXBits, posYBits) {
  const view = new DataView(slice.memory.buffer);
  const mem = new Uint8Array(slice.memory.buffer);
  const { paths } = slice;

  paths.reset();

  /* Capture seam: publish the caller-owned Game object into scratch. */
  mem.set(gameObject, paths.gameObjectAddress());
  if (paths.captureScratch() !== 1) throw new Error("wasm capture_scratch failed");

  /* Sparse state: deterministic zero base + this frame's player position. */
  const stateAddr = paths.stateAddress();
  new Uint8Array(slice.memory.buffer, stateAddr, paths.stateSize()).fill(0);
  view.setUint32(stateAddr + STATE_POS_X_BITS_OFF, posXBits >>> 0, true);
  view.setUint32(stateAddr + STATE_POS_Y_BITS_OFF, posYBits >>> 0, true);

  /* Frozen default constants/runtime-inputs blobs (zero base + pairs). */
  const constAddr = paths.constantsAddress();
  new Uint8Array(slice.memory.buffer, constAddr, CONSTANTS_SIZE).fill(0);
  for (let i = 0; i < CONSTANT_BYTES.length; i += 2) {
    mem[constAddr + CONSTANT_BYTES[i]] = CONSTANT_BYTES[i + 1];
  }
  const rtAddr = paths.runtimeInputsAddress();
  new Uint8Array(slice.memory.buffer, rtAddr, RUNTIME_INPUTS_SIZE).fill(0);
  for (let i = 0; i < RUNTIME_INPUT_BYTES.length; i += 2) {
    mem[rtAddr + RUNTIME_INPUT_BYTES[i]] = RUNTIME_INPUT_BYTES[i + 1];
  }

  /* Native Update step, then drive whatever continuations the wasm asks for. */
  paths.step();
  for (let guard = 0; guard < 24; guard++) {
    const kind = view.getInt32(
      paths.eventsAddress() + EVENTS_CONTINUATION_OFF, true);
    if (kind === 0 /* RETURN_AFTER_GAME_UPDATE */) break;
    const resume = paths.resumes[kind];
    if (!resume) throw new Error(`no resume export for continuation ${kind}`);
    if (resume() !== 1) throw new Error(`wasm resume rejected for continuation ${kind}`);
  }

  /* Apply seam: sparse state back into scratch, then reclaim the buffer. */
  if (paths.applyScratch() !== 1) throw new Error("wasm apply_scratch failed");
  gameObject.set(mem.subarray(
    paths.gameObjectAddress(),
    paths.gameObjectAddress() + paths.gameObjectSize(),
  ));

  /* Residual events published by this tick. */
  const evBase = paths.eventsAddress();
  let residualKinds = 0;
  for (let off = 0; off < paths.eventsSize(); off += 4) {
    if (view.getUint32(evBase + off, true) !== 0) residualKinds++;
  }
  return {
    continuationKind: view.getInt32(evBase + EVENTS_CONTINUATION_OFF, true),
    walkEventCount: view.getUint32(evBase + EVENTS_WALK_COUNT_OFF, true),
    residualKinds,
    stateXBits: view.getUint32(stateAddr + STATE_POS_X_BITS_OFF, true),
    stateYBits: view.getUint32(stateAddr + STATE_POS_Y_BITS_OFF, true),
  };
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

async function boot() {
  const t0 = performance.now();
  const slice = await loadSliceWasm();
  const view = new DataView(slice.memory.buffer);
  status(`wasm loaded abi=${slice.abiVersion} in ${(performance.now() - t0).toFixed(0)}ms`);

  /* --- populate the test room in linear memory --------------------- */
  view.setUint32(ROOM_BASE + 0x00, ROOM_MAGIC, true);
  view.setUint32(ROOM_BASE + 0x04, CELLS_OFF, true);
  view.setUint32(ROOM_BASE + 0x0c, GRID_W, true); // Room+0xc width_c
  view.setUint32(ROOM_BASE + 0x10, GRID_H, true); // Room+0x10 height_10

  let cellCount = 0;
  for (let y = 0; y < GRID_H; y++) {
    for (let x = 0; x < GRID_W; x++) {
      let type = 0; // floor
      if (x === 0 || y === 0 || x === GRID_W - 1 || y === GRID_H - 1) type = 7; // rock ring
      if ((x === 4 && y === 3) || (x === 10 && y === 2)) type = 7; // rock obstacles
      if (x === 8 && y === 5) type = 1; // pit
      view.setUint32(ROOM_BASE + CELLS_OFF + cellCount * 4, type, true);
      cellCount++;
    }
  }

  /* Entities: [count u32][{id,type,variant,x,y,hp,pad} × n]. Entity 0 is the
     player; its x/y live in wasm memory and are moved by the walk residual. */
  const entities = [
    { id: 0, type: 1, variant: 0, x: 6.5, y: 4.0 }, // player
    { id: 1, type: 10, variant: 2, x: 3.5, y: 2.0 }, // enemies
    { id: 2, type: 10, variant: 2, x: 11.5, y: 6.0 },
  ];
  const writeEntities = () => {
    view.setUint32(ENT_BASE, entities.length, true);
    entities.forEach((e, i) => {
      const b = ENT_BASE + 4 + i * ENT_STRIDE;
      view.setUint32(b + 0, e.id >>> 0, true);
      view.setUint32(b + 4, e.type >>> 0, true);
      view.setUint32(b + 8, e.variant >>> 0, true);
      view.setFloat32(b + 12, e.x, true);
      view.setFloat32(b + 16, e.y, true);
      view.setUint32(b + 20, i === 0 ? 0x1 : 0x0, true); // flags: bit0 = player
    });
  };
  writeEntities();

  /* --- session ------------------------------------------------------ */
  const gameObject = new Uint8Array(slice.paths.gameObjectSize());
  const gameView = new DataView(gameObject.buffer);
  gameView.setUint32(GAME_ROOM_PTR_OFF, ROOM_BASE >>> 0, true); // [Game+0x18300]

  const input = initInput();

  /* Residual host body. The module DECIDES that a Player::Walk runs this
     tick (PE 0x0098dba0) and publishes the event; the HOST body performs the
     observable side effect — here, applying the keyboard lanes to the player
     entity in linear memory. No x86 emulation anywhere. */
  let lastMove = { x: 0, y: 0 };
  let walkApplications = 0;
  const runWalkResidual = (count) => {
    if (!count) return false;
    if (lastMove.x === 0 && lastMove.y === 0) return false;
    tryMove(entities[0], lastMove.x, lastMove.y);
    walkApplications++;
    return true;
  };

  /** Rock/pit collision: sample the target cell, keep to floor tiles. */
  function tryMove(p, dx, dy) {
    const nx = clamp(p.x + dx, 1.35, GRID_W - 1.35);
    const ny = clamp(p.y + dy, 1.35, GRID_H - 1.35);
    if (cellAt(nx, ny) === 0) { p.x = nx; p.y = ny; return; }
    if (cellAt(nx, p.y) === 0) { p.x = nx; return; }
    if (cellAt(p.x, ny) === 0) { p.y = ny; }
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function cellAt(x, y) {
    const cx = Math.floor(x);
    const cy = Math.floor(y);
    if (cx < 0 || cy < 0 || cx >= GRID_W || cy >= GRID_H) return 7;
    return view.getUint32(
      ROOM_BASE + CELLS_OFF + (cy * GRID_W + cx) * 4, true);
  }

  /* --- main loop ---------------------------------------------------- */
  const canvas = document.getElementById("room");
  const overlay = document.getElementById("overlay");
  const renderer = new Renderer(canvas, view);
  renderer.setBlocks(ROOM_BASE, ENT_BASE);

  let ticks = 0;
  let prev = performance.now();
  let fpsAccumMs = 0;
  let fpsFrames = 0;
  let fps = 0;
  let lastResult = null;

  function frame(now) {
    const dtMs = now - prev;
    prev = now;
    fpsAccumMs += dtMs;
    fpsFrames++;
    if (fpsAccumMs >= 500) {
      fps = (fpsFrames * 1000) / fpsAccumMs;
      fpsAccumMs = 0;
      fpsFrames = 0;
    }

    // 1. input → movement lanes (cells/tick)
    const move = input.getMove();
    const len = Math.hypot(move.x, move.y) || 1;
    lastMove = {
      x: (move.x / len) * (PLAYER_SPEED * dtMs / 1000),
      y: (move.y / len) * (PLAYER_SPEED * dtMs / 1000),
    };

    // 2. one hybrid Update tick: capture → native step (+resumes)
    //    → walk residual → apply. The player's position rides the sparse
    //    state fields positionXBits/positionYBits through the round trip.
    const p = entities[0];
    lastResult = tickSlice(slice, gameObject, f32Bits(p.x), f32Bits(p.y));
    runWalkResidual(lastResult.walkEventCount);
    ticks++;
    writeEntities(); // publish any residual-applied movement to memory

    // 3. render straight from wasm linear memory
    renderer.draw();

    // 4. debug overlay
    const ev = lastResult;
    overlay.textContent =
      `tick ${ticks}` +
      `\nframe ${dtMs.toFixed(1)} ms  (${fps.toFixed(0)} fps)` +
      `\nentities ${entities.length}  cells ${cellCount}` +
      `\nopaque residuals fired: ${ev.residualKinds}` +
      `\nwalk applications: ${walkApplications}` +
      `\ncontinuation: ${CONTINUATION_NAMES[ev.continuationKind] ?? ev.continuationKind}` +
      `\nwasm abi ${slice.abiVersion}  mem ${(slice.memory.buffer.byteLength / 1048576).toFixed(0)} MiB` +
      `\nplayer (${p.x.toFixed(2)}, ${p.y.toFixed(2)})` +
      ` state-echo (${bitsF32(ev.stateXBits).toFixed(2)}, ${bitsF32(ev.stateYBits).toFixed(2)})`;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  status(`running — arrow keys / WASD to move`);
}

function f32Bits(v) {
  scratchF[0] = v;
  return scratchU[0] >>> 0;
}
function bitsF32(bits) {
  scratchU[0] = bits >>> 0;
  return scratchF[0];
}
const scratchF = new Float32Array(1);
const scratchU = new Uint32Array(scratchF.buffer);

boot().catch((err) => {
  console.error(err);
  status(`fatal: ${err.message}`, true);
});
