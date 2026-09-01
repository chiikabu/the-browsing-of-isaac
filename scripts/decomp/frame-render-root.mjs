/**
 * Browser/Node driver for the Game render root slice (game_render_slice.cpp,
 * ABI v4) — the native/Wasm Game::Render shell on the shipped frame path.
 *
 * Mirrors the Update hybrid (frame-path.mjs runHybridGameUpdateTick): a
 * JS-owned sparse Game-object Uint8Array is loaded into the slice scratch,
 * captured to a sparse state struct, driven step/resume through the typed
 * continuation chain, and applied back. Every boundary is an explicit,
 * address-stable host event delivered to onHostEvent; recaptures come from
 * the live game buffer where the PE re-reads a Game field, and from the
 * caller-supplied `recapture` hook where the PE dereferences a pointer or
 * consumes a host result (room flags, entity arrays, grid slots, stage id).
 *
 * ROOT SLICE ABI, NOT A PE-FREE RENDER. The shell's control flow, gates and
 * arithmetic run natively; draw-side hosts (GL bind, color bind, entity/grid
 * render, RT pops, FUN_00817830 trunk/tail) are events, not GL work.
 *
 * Binary: tools/isaac-ng.unpacked.exe
 * SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 * Evidence: output/decomp/5129df723e64/section-notes/render-slice-v1/ and the
 * render-advance-2 … render-v29 chain; decomp/game-render-slice.json.
 */

import {
  GAME_RENDER_SLICE_ABI_VERSION,
  GAME_RENDER_GAME_OBJECT_MIN_SIZE,
  GAME_RENDER_ENTITY_MAX_STEPS,
  GAME_RENDER_GRID_MAX_STEPS,
  GAME_RENDER_CONTINUE_DONE,
  GAME_RENDER_CONTINUE_AT_EPILOG_820FD0,
  GAME_RENDER_CONTINUE_AT_TREE_ERASE,
  GAME_RENDER_CONTINUE_AT_ENTITY,
  GAME_RENDER_STATE_FIELDS,
  GAME_RENDER_INPUT_FIELDS,
  GAME_RENDER_EVENT_FIELDS,
  GAME_RENDER_OFF,
  GAME_RENDER_HOST_NONE,
  GAME_RENDER_HOST_ENTITY_806C20,
  GAME_RENDER_VA_ENTITY_RENDER,
  gameRenderEmptyEvents,
} from "./game-render-model.mjs";

/* ---------------------------------------------------------------------------
 * Scratch layout (same discipline as the Update slice: 0x100000+; below sits
 * module data and the emscripten shadow stack — low writes corrupt them).
 * The game object lives at 0x110000 and MUST be >= GAME_RENDER_GAME_OBJECT_MIN_SIZE.
 *
 * Wave-30 fix (render-slice v32): the events struct GREW to 516 B, so the
 * old +0x200 events→baseSeq stride made clear_events()' 516-byte
 * memory.fill overlap the first word of base_seq (entity excursion suite
 * caught it: slot[0] came out 0x0 instead of 0x1000). baseSeq moved to
 * +0x400 (1024 B events margin); countSeq/outSlots/gridSlots follow.
 *
 * Render-wiring fix (render-slice v68): the events struct grew AGAIN to
 * 1200 B (packs 83-85 typed rows), so the wave-30 +0x400 margin sat INSIDE
 * the events span (0x100200 + 0x4b0 = 0x1006b0 > 0x100600) and clear_events
 * wiped ALL of base_seq (hostArg0 came out [0, 4, 8] instead of
 * [0x1000, 0x2004, 0x3008]). Seq regions moved to +0x600 stride start
 * 0x100800. LAW: every region below must start AT OR ABOVE
 * eventsAddress + events_size(); loadGameRenderSliceWasm() enforces this
 * at boot so the next events-struct growth fails LOUDLY, not silently.
 */
export const GAME_RENDER_SCRATCH = Object.freeze({
  stateAddress: 0x100000,
  inputsAddress: 0x100100,
  eventsAddress: 0x100200,
  baseSeqAddress: 0x100800,
  countSeqAddress: 0x100a00,
  outSlotsAddress: 0x100c00,
  gridSlotsAddress: 0x100e00,
  gameObjectAddress: 0x110000,
});

export const BROWSER_RENDER_SLICE_WASM_URL =
  "/@decomp/pure/game-render-slice/game-render-slice.wasm";

const RENDER_MAX_STEPS = 64;

export function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

async function loadWasmBytes(source) {
  if (typeof source === "string" && /^https?:\/\//.test(source)) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`fetch ${source} failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  if (isBrowserEnvironment()) {
    const res = await fetch(source);
    if (!res.ok) throw new Error(`fetch ${source} failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  const { readFileSync } = await import("node:fs");
  return new Uint8Array(readFileSync(source));
}

function exported(wasm, name) {
  const fn = wasm[name] ?? wasm[`_${name}`];
  if (typeof fn !== "function") {
    throw new Error(`game render slice missing export ${name}`);
  }
  return fn;
}

/**
 * Load + verify the Game render root slice wasm (zero imports, ABI v4).
 * Browser: URL. Node: path (default output/decomp/game-render-slice/...).
 */
export async function loadGameRenderSliceWasm(wasmSource = null) {
  let source = wasmSource;
  if (source == null) {
    if (isBrowserEnvironment()) {
      source = BROWSER_RENDER_SLICE_WASM_URL;
    } else {
      const { dirname, join, resolve } = await import("node:path");
      const { fileURLToPath } = await import("node:url");
      const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
      source = join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm");
    }
  }
  const bytes = await loadWasmBytes(source);
  const module = await WebAssembly.compile(bytes);
  const imports = WebAssembly.Module.imports(module);
  if (imports.length !== 0) {
    throw new Error(`game render slice must have zero Wasm imports; got ${imports.length}`);
  }
  const instance = await WebAssembly.instantiate(module, {});
  const wasm = instance.exports;
  if (!(wasm.memory instanceof WebAssembly.Memory)) {
    throw new Error("game render slice must export memory");
  }
  const abiVersion = exported(wasm, "isaac_game_render_slice_abi_version")();
  if (abiVersion !== GAME_RENDER_SLICE_ABI_VERSION) {
    throw new Error(`Unexpected game render slice ABI ${abiVersion}; expected ${GAME_RENDER_SLICE_ABI_VERSION}`);
  }
  /* Scratch-layout LAW (see GAME_RENDER_SCRATCH): every seq region must
     start at or above the module's REAL events span, or clear_events()'s
     memory.fill silently wipes the caller-supplied base/count seqs (the
     wave-30 v32 and render-wiring v68 corruption class). Enforce at boot. */
  const scratch = { ...GAME_RENDER_SCRATCH };
  const eventsEnd =
    GAME_RENDER_SCRATCH.eventsAddress + exported(wasm, "isaac_game_render_slice_events_size")();
  for (const key of ["baseSeqAddress", "countSeqAddress", "outSlotsAddress", "gridSlotsAddress"]) {
    if (scratch[key] < eventsEnd) {
      throw new Error(
        `game render slice scratch ${key} (${scratch[key]}) overlaps the ` +
        `events region (ends at ${eventsEnd}); move the seq regions up`,
      );
    }
  }
  return {
    mode: "native-wasm",
    usesX86Emulation: false,
    abiVersion,
    wasm,
    memory: wasm.memory,
    source: typeof source === "string" ? source : "<bytes>",
    scratch,
    gameObjectMinSize: GAME_RENDER_GAME_OBJECT_MIN_SIZE,
    exports: {
      capture: exported(wasm, "isaac_game_render_slice_capture"),
      apply: exported(wasm, "isaac_game_render_slice_apply"),
      step: exported(wasm, "isaac_game_render_slice_step"),
      resumeEpilog: exported(wasm, "isaac_game_render_slice_resume_epilog"),
      resumeFadePrep: exported(wasm, "isaac_game_render_slice_resume_fade_prep"),
      resumeFadeStage: exported(wasm, "isaac_game_render_slice_resume_fade_stage"),
      resumeFadePolls: exported(wasm, "isaac_game_render_slice_resume_fade_polls"),
      boost74efd0Al: exported(wasm, "isaac_game_render_slice_boost_74efd0_al"),
      resumeBoost74efd0: exported(wasm, "isaac_game_render_slice_resume_boost_74efd0"),
      resumeBoost827bc0: exported(wasm, "isaac_game_render_slice_resume_boost_827bc0"),
      resumeFadeClose: exported(wasm, "isaac_game_render_slice_resume_fade_close"),
      resumeTreeErase: exported(wasm, "isaac_game_render_slice_resume_tree_erase"),
      resumeEntity: exported(wasm, "isaac_game_render_slice_resume_entity"),
      resumeGrid: exported(wasm, "isaac_game_render_slice_resume_grid"),
      resumeOverlayGate: exported(wasm, "isaac_game_render_slice_resume_overlay_gate"),
      resumeAuxGate: exported(wasm, "isaac_game_render_slice_resume_aux_gate"),
      resumeAuxPolls: exported(wasm, "isaac_game_render_slice_resume_aux_polls"),
      resume817830Gate: exported(wasm, "isaac_game_render_slice_resume_817830_gate"),
      resume817830Prefix: exported(wasm, "isaac_game_render_slice_resume_817830_prefix"),
      resume817830A14050Value: exported(wasm, "isaac_game_render_slice_resume_817830_a14050_value"),
      resumeRtPopBegin: exported(wasm, "isaac_game_render_slice_resume_rt_pop_begin"),
      resumeRtPopCheck: exported(wasm, "isaac_game_render_slice_resume_rt_pop_check"),
      resumeRtPopFinal: exported(wasm, "isaac_game_render_slice_resume_rt_pop_final"),
      resumeEpilogFinal: exported(wasm, "isaac_game_render_slice_resume_epilog_final"),
      resumeSpritePairA: exported(wasm, "isaac_game_render_slice_resume_sprite_pair_a"),
      resumeSharedPtr: exported(wasm, "isaac_game_render_slice_resume_shared_ptr"),
      resumeRoomType: exported(wasm, "isaac_game_render_slice_resume_room_type"),
      resumeOnceInit: exported(wasm, "isaac_game_render_slice_resume_once_init"),
      needsRecapture: exported(wasm, "isaac_game_render_slice_continuation_needs_recapture"),
      stateSize: exported(wasm, "isaac_game_render_slice_state_size"),
      inputsSize: exported(wasm, "isaac_game_render_slice_runtime_inputs_size"),
      eventsSize: exported(wasm, "isaac_game_render_slice_events_size"),
      gameObjectMinSizeExport: exported(wasm, "isaac_game_render_slice_game_object_min_size"),
    },
  };
}

/* ---------------------------------------------------------------------------
 * Defaults
 * ------------------------------------------------------------------------- */

export function createDefaultRenderState() {
  const out = {};
  for (const f of GAME_RENDER_STATE_FIELDS) out[f] = 0;
  return out;
}

export function createDefaultRenderInputs(overrides = null) {
  const out = {};
  for (const f of GAME_RENDER_INPUT_FIELDS) out[f] = 0;
  return overrides ? { ...out, ...overrides } : out;
}

/* ---------------------------------------------------------------------------
 * Buffer plumbing (explicit game-object address, unlike the Update slice)
 * ------------------------------------------------------------------------- */

export function loadGameObjectIntoRenderScratch(slice, gameObject) {
  const addr = slice.scratch.gameObjectAddress;
  const size = GAME_RENDER_GAME_OBJECT_MIN_SIZE;
  if (!(gameObject instanceof Uint8Array) || gameObject.byteLength < size) {
    throw new Error(`gameObject must be Uint8Array of size >= ${size}`);
  }
  new Uint8Array(slice.memory.buffer, addr, size).set(gameObject.subarray(0, size));
  return size;
}

export function exportGameObjectFromRenderScratch(slice, out = null) {
  const addr = slice.scratch.gameObjectAddress;
  const size = GAME_RENDER_GAME_OBJECT_MIN_SIZE;
  const src = new Uint8Array(slice.memory.buffer, addr, size);
  if (out) {
    if (!(out instanceof Uint8Array) || out.byteLength < size) {
      throw new Error(`out buffer must be Uint8Array of size >= ${size}`);
    }
    out.set(src);
    return out;
  }
  return new Uint8Array(src);
}

export function readRenderStateFromScratch(slice) {
  const view = new DataView(slice.memory.buffer);
  return readStruct(view, slice.scratch.stateAddress, GAME_RENDER_STATE_FIELDS);
}

export function writeRenderStateToScratch(slice, state) {
  const view = new DataView(slice.memory.buffer);
  writeStruct(view, slice.scratch.stateAddress, GAME_RENDER_STATE_FIELDS, state);
}

export function readRenderInputsFromScratch(slice) {
  const view = new DataView(slice.memory.buffer);
  return readStruct(view, slice.scratch.inputsAddress, GAME_RENDER_INPUT_FIELDS);
}

export function writeRenderInputsToScratch(slice, inputs) {
  const view = new DataView(slice.memory.buffer);
  writeStruct(view, slice.scratch.inputsAddress, GAME_RENDER_INPUT_FIELDS, inputs);
}

export function readRenderEventsFromScratch(slice) {
  const view = new DataView(slice.memory.buffer);
  return readStruct(view, slice.scratch.eventsAddress, GAME_RENDER_EVENT_FIELDS);
}

function writeStruct(view, addr, fields, obj) {
  for (let i = 0; i < fields.length; i += 1) {
    view.setUint32(addr + i * 4, (obj?.[fields[i]] ?? 0) >>> 0, true);
  }
}

function readStruct(view, addr, fields) {
  const out = {};
  for (let i = 0; i < fields.length; i += 1) {
    out[fields[i]] = view.getUint32(addr + i * 4, true) >>> 0;
  }
  return out;
}

function writeSeq(view, addr, arr) {
  for (let i = 0; i < arr.length; i += 1) {
    view.setUint32(addr + i * 4, (arr[i] ?? 0) >>> 0, true);
  }
}

/** Read `n` u32 words the slice wrote into a scratch array (fresh view: a
    memory.grow between the write and the read would detach a cached one). */
function readSeq(slice, addr, n) {
  const out = [];
  if (n <= 0) return out;
  const v = new DataView(slice.memory.buffer);
  for (let i = 0; i < n; i += 1) out.push(v.getUint32(addr + i * 4, true) >>> 0);
  return out;
}

/* ---------------------------------------------------------------------------
 * Host event accounting (mirrors createResidualHostHandler's no-PE contract)
 * ------------------------------------------------------------------------- */

export function createRenderHostHandler({ onEvent = null } = {}) {
  const totals = Object.create(null);
  const events = [];
  const handler = (detail) => {
    const kind = detail?.kind ?? 0;
    totals[kind] = (totals[kind] ?? 0) + 1;
    if (typeof onEvent === "function") onEvent(detail);
    events.push(detail);
  };
  return {
    usesX86Emulation: false,
    totals,
    events,
    handler,
    reset() {
      for (const k of Object.keys(totals)) delete totals[k];
      events.length = 0;
    },
  };
}

/* ---------------------------------------------------------------------------
 * Hybrid render tick
 * ------------------------------------------------------------------------- */

function u32(v) {
  return (v ?? 0) >>> 0;
}

/** Read a Game field the PE re-reads after a host boundary. */
function readGameField(view, off, type) {
  if (type === "u8") return view.getUint8(off) >>> 0;
  if (type === "i32") return view.getInt32(off, true) >>> 0;
  return view.getUint32(off, true) >>> 0; // bits (f32/i32/u32 wire)
}

/** Default recapture: game-buffer reads; pointer/host-result values stay 0. */
export function defaultRenderRecapture(kind, ctx) {
  return {};
}

/**
 * Run the native render continuation chain on scratch state.
 * `recapture(kind, ctx)` may return a patch with any of:
 *   flagG2, flagG10, flagG12 (room flags reads), al827bc0,
 *   mgr1830cAfter, treeHeadRight4, entityBaseSeq[], entityCountSeq[],
 *   gridSlots[], roomType, posX, posY, stageId, slotValue, roomWord54,
 *   roomFlags44, fade7240, mgr264f8, treeHeadC379bc, boundIsnil, boundKey,
 *   boundPtr, roomDescType48, valueAt14, byteAtValuePlus4, datC79790,
 *   datC7978c (inputs refreshes).
 */
export function runNativeGameRenderTick(slice, {
  state = null,
  runtimeInputs = null,
  onHostEvent = null,
  recapture = null,
  gameObject = null,
  onStep = null,
} = {}) {
  const ex = slice.exports;
  const view = new DataView(slice.memory.buffer);
  const S = slice.scratch;
  let recaptureGame = gameObject instanceof Uint8Array ? gameObject : null;
  const recaptureFn = typeof recapture === "function" ? recapture : defaultRenderRecapture;

  if (state == null) state = createDefaultRenderState();
  const inputs = runtimeInputs
    ? { ...createDefaultRenderInputs(), ...runtimeInputs }
    : createDefaultRenderInputs();
  writeRenderStateToScratch(slice, state);
  writeRenderInputsToScratch(slice, inputs);

  /* Live JS-owned game buffer view for the recapture re-reads (the PE
     re-reads these Game fields AFTER a host boundary; when the caller
     supplied no live copy we read the slice scratch window instead). */
  const liveGame = recaptureGame
    ? new DataView(recaptureGame.buffer, recaptureGame.byteOffset, recaptureGame.byteLength)
    : null;

  ex.step(S.stateAddress, S.inputsAddress, S.eventsAddress);
  let ev = readRenderEventsFromScratch(slice);

  /* Carried locals (from events across resumes) — the PE keeps them in
     stack slots between hosts; the events re-expose them each step. */
  let fadeLocal = [0, 0, 0];
  let fadeBase = 0;
  let fadeBoost = 0;

  let steps = 0;
  const hostKinds = [];
  const emitHost = (detail) => {
    if (typeof onHostEvent === "function") onHostEvent(detail);
    hostKinds.push(detail.hostKind);
  };

  /* Entity-loop excursion bookkeeping.
     isaac_game_render_slice_resume_entity RUNS the PE's Game::Render loop
     (VA 0x0080eebc…0x0080eed1) INSIDE the resume: it reports the executed
     iterations only as events.entityRenderCalls plus the pushed slot
     addresses in out_slots (game_render_slice.cpp:538-552,
     render_shell_pure_helpers.cpp:389-402). It emits
     HOST_ENTITY_806C20 ONLY on sample exhaustion (cpp:526-528 / 545-547,
     documented at game_render_slice.h:128-131) and that emit is a REQUEST
     for the NEXT iteration, not a completed call — a second resume_entity
     with a longer sequence re-runs from index 0 and re-reports the whole
     prefix. So the driver is the only place a per-entity draw host can be
     produced, and it must de-duplicate the re-run prefix.
     `entityEmitted` = iterations already delivered for this excursion. */
  let entityEmitted = 0;
  let entitySeqLen = -1;

  while (ev.continuationKind !== GAME_RENDER_CONTINUE_DONE &&
         ev.continuationKind !== GAME_RENDER_CONTINUE_AT_EPILOG_820FD0 &&
         steps < RENDER_MAX_STEPS) {
    steps += 1;
    const k = ev.continuationKind;
    if (typeof onStep === "function") onStep(ev, steps);

    /* 1) Host side effect at this boundary (address-stable, no PE).
          AT_ENTITY's host is skipped here on purpose: it is the sample
          exhaustion REQUEST described above, and the iteration it asks for
          is delivered per-call after the next resume_entity re-run. */
    if (ev.hostKind !== GAME_RENDER_HOST_NONE &&
        k !== GAME_RENDER_CONTINUE_AT_ENTITY) {
      emitHost({
        kind: ev.hostKind,
        hostKind: ev.hostKind,
        hostVa: ev.hostVa,
        hostReceiver: ev.hostReceiver,
        hostVtableSlot: ev.hostVtableSlot,
        hostArg0: ev.hostArg0,
        hostArg1: ev.hostArg1,
        hostRepeat: ev.hostRepeat,
        continuationKind: k,
      });
    }

    /* 2) Recapture: game-buffer reads + caller patch + input refreshes. */
    const patch = recaptureFn(k, { events: ev, state, inputs, slice, gameObject: recaptureGame }) || {};
    const game = liveGame ||
      new DataView(slice.memory.buffer, S.gameObjectAddress, GAME_RENDER_GAME_OBJECT_MIN_SIZE);

    /* 3) Resume dispatch (signatures mirror tests/decomp-game-render-slice.test.js). */
    if (k === 1) { /* AT_EPILOG_825DE0 */
      const flag11f6 = (patch.flag11f6 ?? readGameField(game, GAME_RENDER_OFF.flag11f6, "u8"));
      ex.resumeEpilog(S.stateAddress, flag11f6, S.eventsAddress);
    } else if (k === 2) { /* AT_RT_REBIND */
      const fade1b5c = u32(patch.fade1b5c ?? readGameField(game, GAME_RENDER_OFF.fadeSrcR, "bits"));
      const fade1b60 = u32(patch.fade1b60 ?? readGameField(game, GAME_RENDER_OFF.fadeSrcG, "bits"));
      const fade1b64 = u32(patch.fade1b64 ?? readGameField(game, GAME_RENDER_OFF.fadeSrcB, "bits"));
      const fade1b68 = u32(patch.fade1b68 ?? readGameField(game, GAME_RENDER_OFF.fadeSrcA, "bits"));
      const fadeWord1b6c = u32(patch.fadeWord1b6c ?? readGameField(game, GAME_RENDER_OFF.fadeWord6c, "bits"));
      const flagsG2 = u32(patch.flagG2);
      ex.resumeFadePrep(S.stateAddress, S.inputsAddress, fade1b5c, fade1b60, fade1b64, fade1b68, fadeWord1b6c, flagsG2, S.eventsAddress);
    } else if (k === 3) { /* AT_BIND_A1DFD0 */
      const stage1d18 = u32(patch.stage1d18 ?? readGameField(game, GAME_RENDER_OFF.stage1d18, "i32"));
      const game1204 = u32(patch.game1204 ?? readGameField(game, GAME_RENDER_OFF.cameraBaseX, "bits"));
      const game1208 = u32(patch.game1208 ?? readGameField(game, GAME_RENDER_OFF.cameraBaseY, "bits"));
      const flagsG10 = u32(patch.flagG10);
      ex.resumeFadeStage(S.stateAddress, S.inputsAddress, stage1d18, game1204, game1208, flagsG10, S.eventsAddress);
    } else if (k === 4 || k === 9 || k === 10) { /* AT_STAGE39 / AT_COLOR_BIND / AT_TREE_ERASE_ENTRY */
      const treeHead = u32(patch.treeHead ?? readGameField(game, GAME_RENDER_OFF.treeHead, "bits"));
      const headRight4 = u32(patch.treeHeadRight4);
      ex.resumeTreeErase(S.stateAddress, S.inputsAddress, treeHead, headRight4, S.eventsAddress);
    } else if (k === 5) { /* AT_FADE_POLLS */
      const gameModeEd55 = u32(patch.gameModeEd55 ?? readGameField(game, GAME_RENDER_OFF.gameMode, "i32"));
      ex.resumeFadePolls(S.stateAddress, S.inputsAddress, gameModeEd55, S.eventsAddress);
    } else if (k === 6) { /* AT_BOOST_74EFD0 — body PURE at v5, no host */
      const mgr1830cAfter = u32(patch.mgr1830cAfter ?? inputs.mgr1830c);
      ex.resumeBoost74efd0(S.stateAddress, S.inputsAddress, mgr1830cAfter, S.eventsAddress);
    } else if (k === 7) { /* AT_BOOST_827BC0 */
      const al827bc0 = u32(patch.al827bc0);
      ex.resumeBoost827bc0(S.stateAddress, S.inputsAddress, al827bc0, S.eventsAddress);
    } else if (k === 8) { /* AT_FADE_CLOSE */
      const flagsG12 = u32(patch.flagG12);
      const dst0 = u32(patch.dst0 ?? readGameField(game, GAME_RENDER_OFF.fadeDstR, "bits"));
      const dst1 = u32(patch.dst1 ?? readGameField(game, GAME_RENDER_OFF.fadeDstG, "bits"));
      const dst2 = u32(patch.dst2 ?? readGameField(game, GAME_RENDER_OFF.fadeDstB, "bits"));
      const dst3 = u32(patch.dst3 ?? readGameField(game, GAME_RENDER_OFF.fadeDstA, "bits"));
      ex.resumeFadeClose(S.stateAddress, S.inputsAddress, fadeBase, fadeBoost, flagsG12,
        fadeLocal[0], fadeLocal[1], fadeLocal[2], dst0, dst1, dst2, dst3, S.eventsAddress);
    } else if (k === 11 || k === 12) { /* AT_TREE_ERASE / AT_ENTITY */
      /* AT_TREE_ERASE is the entry into the loop (VA 0x0080eead gate);
         AT_ENTITY is a re-entry after exhaustion. Only the entry resets the
         per-excursion delivered count. */
      if (k === GAME_RENDER_CONTINUE_AT_TREE_ERASE) {
        entityEmitted = 0;
        entitySeqLen = -1;
      }
      const entryCount0 = u32(patch.entryCount ?? readGameField(game, GAME_RENDER_OFF.entityCount, "i32"));
      const baseSeq = Array.isArray(patch.entityBaseSeq) ? patch.entityBaseSeq : [];
      const countSeq = Array.isArray(patch.entityCountSeq) ? patch.entityCountSeq : [];
      const suppliedLen = Math.min(baseSeq.length, countSeq.length, GAME_RENDER_ENTITY_MAX_STEPS);
      let seqLen = suppliedLen;
      let entryCount = entryCount0;
      if (seqLen === 0) {
        /* No per-iteration arrays supplied: close the loop instead of
           looping forever on a sample-exhausted signal. */
        entryCount = 0;
      } else if (k === GAME_RENDER_CONTINUE_AT_ENTITY && seqLen <= entitySeqLen) {
        /* The slice asked for one more Game::Render and the caller re-supplied
           a sequence no longer than the exhausted one. resume_entity restarts
           at index 0, so re-running would report the same prefix forever. The
           missing iteration is real PE work; never silently drop it. */
        throw new Error(
          `game render tick: entity loop exhausted after ${entityEmitted} Game::Render ` +
          `call(s); recapture re-supplied only ${seqLen} sample(s) at ` +
          "AT_ENTITY (supply a longer entityBaseSeq/entityCountSeq, or none at all)");
      } else {
        entitySeqLen = seqLen;
      }
      writeSeq(view, S.baseSeqAddress, baseSeq.slice(0, seqLen));
      writeSeq(view, S.countSeqAddress, countSeq.slice(0, seqLen));
      ex.resumeEntity(S.stateAddress, entryCount, S.baseSeqAddress, S.countSeqAddress,
        seqLen, S.outSlotsAddress, S.eventsAddress);
      /* Expand the iterations this resume actually ran into one draw host
         each, in PE order, BEFORE the next continuation's host is emitted.
         Slot address per iteration i is [Game+0x125c](i) + i*4, i.e. the
         base RE-READ at the top of that iteration (VA 0x0080eebc) — folding
         one base across the loop is exactly the defect this ABI prevents,
         so the argument comes from out_slots and never from state. */
      const ranEvents = readRenderEventsFromScratch(slice);
      const ranCalls = u32(ranEvents.entityRenderCalls);
      if (ranCalls > entityEmitted) {
        const slots = readSeq(slice, S.outSlotsAddress, ranCalls);
        for (let i = entityEmitted; i < ranCalls; i += 1) {
          emitHost({
            kind: GAME_RENDER_HOST_ENTITY_806C20,
            hostKind: GAME_RENDER_HOST_ENTITY_806C20,
            hostVa: GAME_RENDER_VA_ENTITY_RENDER,
            hostReceiver: 0, /* ecx = Game* */
            hostVtableSlot: 0, /* direct call, host_is_vtable(4) == 0 */
            hostArg0: slots[i] >>> 0, /* pushed Entity* slot ADDRESS */
            hostArg1: 0,
            hostRepeat: 1,
            continuationKind: k,
            entityIndex: i,
            entitySlotAddress: slots[i] >>> 0,
          });
        }
        entityEmitted = ranCalls;
      }
    } else if (k === 13) { /* AT_GRID_ENTRY */
      const gridW = u32(patch.gridW ?? readGameField(game, GAME_RENDER_OFF.gridW, "i32"));
      const gridH = u32(patch.gridH ?? readGameField(game, GAME_RENDER_OFF.gridH, "i32"));
      const slots = Array.isArray(patch.gridSlots) ? patch.gridSlots : [];
      let slotLen = Math.min(slots.length, GAME_RENDER_GRID_MAX_STEPS);
      let useW = gridW;
      let useH = gridH;
      if (slotLen === 0 && (gridW !== 0 || gridH !== 0)) {
        useW = 0; useH = 0;
      }
      writeSeq(view, S.gridSlotsAddress, slots.slice(0, slotLen));
      ex.resumeGrid(S.stateAddress, useW, useH, S.gridSlotsAddress, slotLen, S.eventsAddress);
    } else if (k === 14 || k === 15) { /* AT_GRID / AT_OVERLAY_GATE */
      const gameModeEf08 = u32(patch.gameModeEf08 ?? readGameField(game, GAME_RENDER_OFF.gameMode, "i32"));
      const roomType = u32(patch.roomType);
      const posX = u32(patch.posX);
      const posY = u32(patch.posY);
      const flag6f49 = u32(patch.flag6f49 ?? readGameField(game, GAME_RENDER_OFF.overlayDrawFlag, "u8"));
      const flag6eb0 = u32(patch.flag6eb0 ?? readGameField(game, GAME_RENDER_OFF.overlaySwapFlag, "u8"));
      ex.resumeOverlayGate(S.stateAddress, S.inputsAddress, gameModeEf08, roomType, posX, posY, flag6f49, flag6eb0, S.eventsAddress);
    } else if (k === 16 || k === 17) { /* AT_ANIM_RENDER / AT_AUX_GATE */
      ex.resumeAuxGate(S.stateAddress, S.inputsAddress, S.eventsAddress);
    } else if (k === 18) { /* AT_AUX_POLLS */
      ex.resumeAuxPolls(S.stateAddress, S.inputsAddress, S.eventsAddress);
    } else if (k === 25) { /* AT_GET_STAGE_ID_817830 */
      const stageId = u32(patch.stageId);
      const slotValue = u32(patch.slotValue);
      const roomWord54 = u32(patch.roomWord54);
      const roomFlags44 = u32(patch.roomFlags44);
      const fade7240 = u32(patch.fade7240);
      ex.resume817830Gate(S.stateAddress, S.inputsAddress, stageId, slotValue, roomWord54, roomFlags44, fade7240, S.eventsAddress);
    } else if (k === 26) { /* AT_TRUNK_817830 */
      const stageId = u32(patch.stageId);
      const roomWord54 = u32(patch.roomWord54);
      const roomFlags44 = u32(patch.roomFlags44);
      const fade7240 = u32(patch.fade7240);
      const mgr264f8 = u32(patch.mgr264f8 ?? inputs.mgr264f8);
      const treeHeadC379bc = u32(patch.treeHeadC379bc ?? inputs.datC379bc);
      const boundIsnil = u32(patch.boundIsnil);
      const boundKey = u32(patch.boundKey);
      const boundPtr = u32(patch.boundPtr);
      const roomDescType48 = u32(patch.roomDescType48);
      ex.resume817830Prefix(S.stateAddress, S.inputsAddress, stageId, roomWord54, roomFlags44, fade7240,
        mgr264f8, treeHeadC379bc, boundIsnil, boundKey, boundPtr, roomDescType48, S.eventsAddress);
      /* The prefix may branch straight into the a14050 value recapture;
         it runs inside the same loop iteration via the next events read. */
    } else if (k === 27) { /* AT_A14050_VALUE_817830 */
      const stageId = u32(patch.stageId);
      const roomWord54 = u32(patch.roomWord54);
      const roomFlags44 = u32(patch.roomFlags44);
      const fade7240 = u32(patch.fade7240);
      const mgr264f8 = u32(patch.mgr264f8 ?? inputs.mgr264f8);
      const roomDescType48 = u32(patch.roomDescType48);
      const valueAt14 = u32(patch.valueAt14);
      const byteAtValuePlus4 = u32(patch.byteAtValuePlus4);
      ex.resume817830A14050Value(S.stateAddress, S.inputsAddress, stageId, roomWord54, roomFlags44, fade7240,
        mgr264f8, roomDescType48, valueAt14, byteAtValuePlus4, S.eventsAddress);
    } else if (k === 19 || k === 28) { /* AT_BODY_817830 / AT_TAIL_817830 */
      ex.resumeRtPopBegin(S.stateAddress, S.inputsAddress, S.eventsAddress);
    } else if (k === 20) { /* AT_RT_POP_A19180 */
      if (patch.datC79790 !== undefined) {
        inputs.datC79790 = u32(patch.datC79790);
        writeRenderInputsToScratch(slice, inputs);
      }
      ex.resumeRtPopCheck(S.stateAddress, S.inputsAddress, S.eventsAddress);
    } else if (k === 21) { /* AT_RT_POP_RESTORE */
      if (patch.datC79790 !== undefined) {
        inputs.datC79790 = u32(patch.datC79790);
        writeRenderInputsToScratch(slice, inputs);
      }
      if (patch.datC7978c !== undefined) {
        inputs.datC7978c = u32(patch.datC7978c);
        writeRenderInputsToScratch(slice, inputs);
      }
      ex.resumeRtPopFinal(S.stateAddress, S.inputsAddress, S.eventsAddress);
    } else if (k === 22) { /* AT_EPILOG_826AE0 */
      ex.resumeEpilogFinal(S.stateAddress, S.eventsAddress);
    } else {
      throw new Error(`game render tick: unsupported continuation kind ${k}`);
    }

    /* carry locals/base/boost from the new events */
    ev = readRenderEventsFromScratch(slice);
    if (ev.fadeLocalRBits !== 0 || ev.fadeLocalGBits !== 0 || ev.fadeLocalBBits !== 0) {
      fadeLocal = [u32(ev.fadeLocalRBits), u32(ev.fadeLocalGBits), u32(ev.fadeLocalBBits)];
    }
    if (ev.fadeBaseBits !== 0) fadeBase = u32(ev.fadeBaseBits);
    if (ev.fadeBoost !== 0) fadeBoost = u32(ev.fadeBoost);
  }

  if (steps >= RENDER_MAX_STEPS && ev.continuationKind !== GAME_RENDER_CONTINUE_DONE &&
      ev.continuationKind !== GAME_RENDER_CONTINUE_AT_EPILOG_820FD0) {
    throw new Error(`game render tick: chain did not terminate after ${RENDER_MAX_STEPS} steps (kind ${ev.continuationKind})`);
  }

  return {
    mode: "native-wasm",
    usesX86Emulation: false,
    state: readRenderStateFromScratch(slice),
    events: ev,
    continuationKind: ev.continuationKind,
    steps,
    hostKinds,
    hostTotals: null,
  };
}

/**
 * Hybrid render tick over a JS-owned Game-object Uint8Array (shared with the
 * Update session; >= 0x3bb20 required).
 */
export function runHybridGameRenderTick(slice, {
  gameObject,
  runtimeInputs = null,
  onHostEvent = null,
  recapture = null,
  onStep = null,
} = {}) {
  if (!slice || slice.mode !== "native-wasm" || slice.usesX86Emulation) {
    throw new Error("runHybridGameRenderTick requires a native-wasm render slice");
  }
  if (!(gameObject instanceof Uint8Array) || gameObject.byteLength < GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be Uint8Array of size >= ${GAME_RENDER_GAME_OBJECT_MIN_SIZE}`);
  }
  loadGameObjectIntoRenderScratch(slice, gameObject);
  // capture export over the scratch window (parity with the Update hybrid)
  const capOk = slice.exports.capture(slice.scratch.gameObjectAddress, GAME_RENDER_GAME_OBJECT_MIN_SIZE, slice.scratch.stateAddress);
  if (capOk !== 1) throw new Error("game render capture failed");
  const sparseState = readRenderStateFromScratch(slice);

  const host = typeof onHostEvent === "function"
    ? { handler: onHostEvent, totals: null }
    : createRenderHostHandler({ onEvent: onHostEvent });

  const result = runNativeGameRenderTick(slice, {
    state: sparseState,
    runtimeInputs,
    onHostEvent: host.handler,
    recapture,
    gameObject,
    onStep,
  });

  // apply sparse state back (marker-gated writes only)
  const appOk = slice.exports.apply(slice.scratch.stateAddress, slice.scratch.gameObjectAddress, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  if (appOk !== 1) throw new Error("game render apply failed");
  exportGameObjectFromRenderScratch(slice, gameObject);

  return {
    ...result,
    gameObject,
  };
}

/**
 * Per-frame render session sharing the Update session's Game-object buffer.
 */
export function createNativeRenderSession(slice, {
  gameObject = null,
  runtimeInputs = null,
  onHostEvent = null,
  recapture = null,
} = {}) {
  if (!slice || slice.mode !== "native-wasm" || slice.usesX86Emulation) {
    throw new Error("createNativeRenderSession requires a native-wasm render slice");
  }
  let liveGameObject = gameObject;
  if (liveGameObject == null) {
    liveGameObject = new Uint8Array(GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  } else if (!(liveGameObject instanceof Uint8Array) || liveGameObject.byteLength < GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be Uint8Array of size >= ${GAME_RENDER_GAME_OBJECT_MIN_SIZE}`);
  }
  const sparseRuntime = runtimeInputs
    ? { ...createDefaultRenderInputs(), ...runtimeInputs }
    : createDefaultRenderInputs();
  const host = typeof onHostEvent === "function"
    ? { handler: onHostEvent, totals: null, events: [] }
    : createRenderHostHandler({ onEvent: onHostEvent });
  let ticks = 0;
  let last = null;
  return {
    mode: "native-wasm",
    usesX86Emulation: false,
    abiVersion: slice.abiVersion,
    get gameObject() {
      return liveGameObject;
    },
    get ticks() {
      return ticks;
    },
    get last() {
      return last;
    },
    get hostTotals() {
      return host.totals || null;
    },
    get hostEvents() {
      return host.events || null;
    },
    tick(extraRuntime = null) {
      const runtime = extraRuntime
        ? { ...sparseRuntime, ...extraRuntime }
        : sparseRuntime;
      const result = runHybridGameRenderTick(slice, {
        gameObject: liveGameObject,
        runtimeInputs: runtime,
        onHostEvent: host.handler,
        recapture,
      });
      last = result;
      ticks += 1;
      return result;
    },
  };
}

export { GAME_RENDER_SLICE_ABI_VERSION as RENDER_SLICE_EXPECTED_ABI };
