import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as R from "../scripts/decomp/game-render-model.mjs";
import {
  BROWSER_RENDER_SLICE_WASM_URL,
  RENDER_SLICE_EXPECTED_ABI,
  createDefaultRenderInputs,
  createNativeRenderSession,
  createRenderHostHandler,
  runHybridGameRenderTick,
  loadGameRenderSliceWasm,
} from "../scripts/decomp/frame-render-root.mjs";

/* Frame-path wiring test for the Game render root slice (ABI v5).
   Validates the browser-driver surface that wires Render into the native
   route:
     - loader: zero-import ABI-v5 artifact at the canonical server URL;
     - closed option gate: native shell control flow to the terminal epilog,
       untranslated bytes preserved, only the G0-epilog host emitted;
     - open chain: driver vs JS oracle agree on EVERY continuation event;
     - entity/grid excursion: recapture supplies iteration arrays, chain
       terminates, entity/grid host kinds fire in PE order. resume_entity
       RUNS the Game::Render loop inside the resume and reports it only as
       events.entityRenderCalls + out_slots (it emits HOST_ENTITY_806C20
       only as a sample-exhaustion REQUEST), so the per-entity draw hosts,
       their per-iteration slot addresses and the re-run de-duplication are
       driver behaviour and are asserted here;
     - session: multi-frame session shares one Update-size buffer.
   ROOT SLICE ABI, NOT A PE-FREE RENDER. */

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sliceSource = join(root, "native", "decomp", "game_render_slice.cpp");
const helperSource = join(root, "native", "decomp", "render_shell_pure_helpers.cpp");
const outDir = join(root, "output", "decomp", "game-render-slice");
const wasmPath = join(outDir, "game-render-slice.wasm");

const EXPORTS = [
  "isaac_game_render_slice_capture", "isaac_game_render_slice_apply",
  "isaac_game_render_slice_step",
  "isaac_game_render_slice_resume_fade_prep",
  "isaac_game_render_slice_resume_fade_stage",
  "isaac_game_render_slice_resume_fade_polls",
  "isaac_game_render_slice_boost_74efd0_al",
  "isaac_game_render_slice_resume_boost_74efd0",
  "isaac_game_render_slice_resume_boost_827bc0",
  "isaac_game_render_slice_resume_fade_close",
  "isaac_game_render_slice_resume_tree_erase",
  "isaac_game_render_slice_resume_entity",
  "isaac_game_render_slice_resume_grid",
  "isaac_game_render_slice_resume_overlay_gate",
  "isaac_game_render_slice_resume_aux_gate",
  "isaac_game_render_slice_resume_aux_polls",
  "isaac_game_render_slice_resume_817830_gate",
  "isaac_game_render_slice_817830_slot_offset",
  "isaac_game_render_slice_resume_817830_prefix",
  "isaac_game_render_slice_resume_817830_a14050_value",
  "isaac_game_render_slice_817830_kage_hash",
  "isaac_game_render_slice_resume_rt_pop_begin",
  "isaac_game_render_slice_resume_rt_pop_check",
  "isaac_game_render_slice_resume_rt_pop_final",
  "isaac_game_render_slice_resume_epilog",
  "isaac_game_render_slice_resume_epilog_final",
  "isaac_game_render_slice_resume_sprite_pair_a",
  "isaac_game_render_slice_resume_shared_ptr",
  "isaac_game_render_slice_resume_room_type",
  "isaac_game_render_slice_resume_once_init",
  "isaac_game_render_slice_abi_version",
  "isaac_game_render_slice_state_size",
  "isaac_game_render_slice_runtime_inputs_size",
  "isaac_game_render_slice_events_size",
  "isaac_game_render_slice_game_object_min_size",
  "isaac_game_render_slice_root_va",
  "isaac_game_render_slice_entity_render_va",
  "isaac_game_render_slice_host_is_vtable",
  "isaac_game_render_slice_continuation_needs_recapture",
];

function firstExisting(paths, label) {
  const found = paths.find((p) => p && existsSync(p));
  assert.ok(found, label);
  return found;
}

function ensureWasm() {
  if (existsSync(wasmPath)) {
    try {
      const mod = new WebAssembly.Module(readFileSync(wasmPath));
      if (WebAssembly.Module.imports(mod).length === 0) return;
    } catch { /* rebuild */ }
  }
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting([
    process.env.CLANGXX,
    join(emsdk, "upstream", "bin", "clang++.exe"),
    join(emsdk, "upstream", "bin", "clang++"),
  ], "Host clang++ missing");
  const emxx = firstExisting([
    process.env.EMXX,
    join(emsdk, "upstream", "emscripten", "em++.exe"),
    join(emsdk, "upstream", "emscripten", "em++"),
  ], "Emscripten em++ missing");
  const syntax = spawnSync(clang, [
    sliceSource, "-std=c++20", "-I", join(root, "native", "decomp"),
    "-fsyntax-only", "-Wall", "-Wextra", "-Werror",
  ], { cwd: root, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  const exportArgs = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
  const built = spawnSync(emxx, [
    sliceSource, helperSource, "-std=c++20", "-O2",
    "-I", join(root, "native", "decomp"), "--no-entry",
    "-sSTANDALONE_WASM=1", "-sERROR_ON_UNDEFINED_SYMBOLS=1",
    ...exportArgs, "-o", wasmPath,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

ensureWasm();

const u32 = (v) => (v ?? 0) >>> 0;

function paintGame(size = R.GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
  const buf = new Uint8Array(size);
  for (let i = 0; i < size; i += 1) buf[i] = (i * 31 + 7) & 0xff;
  return { buf, view: new DataView(buf.buffer) };
}

function readField(view, off, type) {
  if (type === "u8") return view.getUint8(off) >>> 0;
  if (type === "i32") return view.getInt32(off, true) >>> 0;
  return view.getUint32(off, true) >>> 0;
}

/* Oracle mirror of the driver dispatch; must equal the wasm driver on every
   continuation event (same recaptures, same dispatch). */
function oracleRun({ state, inputs, gameView, patchFn }) {
  const evs = [];
  let fadeLocal = [0, 0, 0];
  let fadeBase = 0;
  let fadeBoost = 0;
  const absorb = (e) => {
    if (e.fadeLocalRBits !== 0 || e.fadeLocalGBits !== 0 || e.fadeLocalBBits !== 0) {
      fadeLocal = [u32(e.fadeLocalRBits), u32(e.fadeLocalGBits), u32(e.fadeLocalBBits)];
    }
    if (e.fadeBaseBits !== 0) fadeBase = u32(e.fadeBaseBits);
    if (e.fadeBoost !== 0) fadeBoost = u32(e.fadeBoost);
  };
  let ev = R.gameRenderStep(state, inputs);
  evs.push(ev);
  let guard = 0;
  while (ev.continuationKind !== R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0 && guard++ < 40) {
    const k = ev.continuationKind;
    const p = patchFn ? patchFn(k) || {} : {};
    const g = gameView;
    if (k === R.GAME_RENDER_CONTINUE_AT_EPILOG_825DE0) {
      ev = R.gameRenderResumeEpilog(state,
        p.flag11f6 !== undefined ? u32(p.flag11f6) : readField(g, R.GAME_RENDER_OFF.flag11f6, "u8"));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_RT_REBIND) {
      ev = R.gameRenderResumeFadePrep(state, inputs,
        readField(g, R.GAME_RENDER_OFF.fadeSrcR, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeSrcG, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeSrcB, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeSrcA, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeWord6c, "u32"),
        u32(p.flagG2));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_BIND_A1DFD0) {
      ev = R.gameRenderResumeFadeStage(state, inputs,
        readField(g, R.GAME_RENDER_OFF.stage1d18, "i32"),
        readField(g, R.GAME_RENDER_OFF.cameraBaseX, "u32"),
        readField(g, R.GAME_RENDER_OFF.cameraBaseY, "u32"),
        u32(p.flagG10));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_FADE_POLLS) {
      ev = R.gameRenderResumeFadePolls(state, inputs,
        readField(g, R.GAME_RENDER_OFF.gameMode, "i32"));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0) {
      ev = R.gameRenderResumeBoost74efd0(state, inputs,
        p.mgr1830cAfter !== undefined ? u32(p.mgr1830cAfter) : inputs.mgr1830c);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_BOOST_827BC0) {
      ev = R.gameRenderResumeBoost827bc0(state, inputs, u32(p.al827bc0));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_FADE_CLOSE) {
      ev = R.gameRenderResumeFadeClose(state, inputs, fadeBase, fadeBoost,
        u32(p.flagG12), fadeLocal[0], fadeLocal[1], fadeLocal[2],
        readField(g, R.GAME_RENDER_OFF.fadeDstR, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeDstG, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeDstB, "u32"),
        readField(g, R.GAME_RENDER_OFF.fadeDstA, "u32"));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_STAGE39 ||
               k === R.GAME_RENDER_CONTINUE_AT_COLOR_BIND ||
               k === R.GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY) {
      ev = R.gameRenderResumeTreeErase(state, inputs,
        readField(g, R.GAME_RENDER_OFF.treeHead, "u32"),
        u32(p.treeHeadRight4));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_TREE_ERASE ||
               k === R.GAME_RENDER_CONTINUE_AT_ENTITY) {
      const entryCount = u32(p.entryCount !== undefined ? p.entryCount :
        readField(g, R.GAME_RENDER_OFF.entityCount, "i32"));
      const baseSeq = Array.isArray(p.entityBaseSeq) ? p.entityBaseSeq : [];
      const countSeq = Array.isArray(p.entityCountSeq) ? p.entityCountSeq : [];
      const seqLen = Math.min(baseSeq.length, countSeq.length, R.GAME_RENDER_ENTITY_MAX_STEPS);
      const useCount = seqLen === 0 ? 0 : entryCount;
      ev = R.gameRenderResumeEntity(state, useCount, baseSeq.slice(0, seqLen), countSeq.slice(0, seqLen));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_GRID_ENTRY) {
      const gridW = u32(p.gridW !== undefined ? p.gridW : readField(g, R.GAME_RENDER_OFF.gridW, "i32"));
      const gridH = u32(p.gridH !== undefined ? p.gridH : readField(g, R.GAME_RENDER_OFF.gridH, "i32"));
      const slots = Array.isArray(p.gridSlots) ? p.gridSlots : [];
      const slotLen = Math.min(slots.length, R.GAME_RENDER_GRID_MAX_STEPS);
      const useW = slotLen === 0 && (gridW !== 0 || gridH !== 0) ? 0 : gridW;
      const useH = slotLen === 0 && (gridW !== 0 || gridH !== 0) ? 0 : gridH;
      ev = R.gameRenderResumeGrid(state, useW, useH, slots.slice(0, slotLen));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_GRID ||
               k === R.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE) {
      ev = R.gameRenderResumeOverlayGate(state, inputs,
        readField(g, R.GAME_RENDER_OFF.gameMode, "i32"),
        u32(p.roomType), u32(p.posX), u32(p.posY),
        p.flag6f49 !== undefined ? u32(p.flag6f49) : readField(g, R.GAME_RENDER_OFF.overlayDrawFlag, "u8"),
        p.flag6eb0 !== undefined ? u32(p.flag6eb0) : readField(g, R.GAME_RENDER_OFF.overlaySwapFlag, "u8"));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_ANIM_RENDER ||
               k === R.GAME_RENDER_CONTINUE_AT_AUX_GATE) {
      ev = R.gameRenderResumeAuxGate(state, inputs);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_AUX_POLLS) {
      ev = R.gameRenderResumeAuxPolls(state, inputs);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830) {
      ev = R.gameRenderResume817830Gate(state, inputs, u32(p.stageId), u32(p.slotValue),
        u32(p.roomWord54), u32(p.roomFlags44), u32(p.fade7240));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_TRUNK_817830) {
      ev = R.gameRenderResume817830Prefix(state, inputs, u32(p.stageId), u32(p.roomWord54),
        u32(p.roomFlags44), u32(p.fade7240),
        p.mgr264f8 !== undefined ? u32(p.mgr264f8) : inputs.mgr264f8,
        p.treeHeadC379bc !== undefined ? u32(p.treeHeadC379bc) : inputs.datC379bc,
        u32(p.boundIsnil), u32(p.boundKey), u32(p.boundPtr), u32(p.roomDescType48));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830) {
      ev = R.gameRenderResume817830A14050Value(state, inputs, u32(p.stageId), u32(p.roomWord54),
        u32(p.roomFlags44), u32(p.fade7240),
        p.mgr264f8 !== undefined ? u32(p.mgr264f8) : inputs.mgr264f8,
        u32(p.roomDescType48), u32(p.valueAt14), u32(p.byteAtValuePlus4));
    } else if (k === R.GAME_RENDER_CONTINUE_AT_BODY_817830 ||
               k === R.GAME_RENDER_CONTINUE_AT_TAIL_817830) {
      ev = R.gameRenderResumeRtPopBegin(state, inputs);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_RT_POP_A19180) {
      if (p.datC79790 !== undefined) inputs.datC79790 = u32(p.datC79790);
      ev = R.gameRenderResumeRtPopCheck(state, inputs);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE) {
      if (p.datC79790 !== undefined) inputs.datC79790 = u32(p.datC79790);
      if (p.datC7978c !== undefined) inputs.datC7978c = u32(p.datC7978c);
      ev = R.gameRenderResumeRtPopFinal(state, inputs);
    } else if (k === R.GAME_RENDER_CONTINUE_AT_EPILOG_826AE0) {
      ev = R.gameRenderResumeEpilogFinal(state);
    } else {
      assert.fail("oracle: unexpected continuation " + k);
    }
    evs.push(ev);
    absorb(ev);
  }
  assert.ok(guard < 40, "oracle chain did not terminate");
  return { evs, last: ev };
}

let sliceCache = null;
async function slice() {
  if (!sliceCache) sliceCache = await loadGameRenderSliceWasm(wasmPath);
  return sliceCache;
}

function sceneWithClosedLoops() {
  const game = paintGame();
  const w = game.view;
  w.setFloat32(R.GAME_RENDER_OFF.cameraBaseX, 12.5, true);
  w.setFloat32(R.GAME_RENDER_OFF.cameraBaseY, -3.25, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcR, 0.25, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcG, 0.5, true);
  w.setFloat32(R.GAME_RENDER_OFF.fadeSrcB, 0.75, true);
  w.setUint32(R.GAME_RENDER_OFF.entityCount, 0, true);
  w.setUint32(R.GAME_RENDER_OFF.gridW, 0, true);
  w.setUint32(R.GAME_RENDER_OFF.gridH, 0, true);
  w.setUint8(R.GAME_RENDER_OFF.flag11f6, 0);
  return game;
}

test("render slice loader: server URL contract, zero imports, ABI pin", async () => {
  assert.equal(RENDER_SLICE_EXPECTED_ABI, R.GAME_RENDER_SLICE_ABI_VERSION);
  assert.equal(BROWSER_RENDER_SLICE_WASM_URL,
    "/@decomp/pure/game-render-slice/game-render-slice.wasm");
  const s = await slice();
  assert.equal(s.usesX86Emulation, false);
  assert.equal(s.abiVersion, R.GAME_RENDER_SLICE_ABI_VERSION);
  assert.equal(s.gameObjectMinSize, 0x3bb20);
  assert.equal(s.exports.stateSize() >>> 0, R.GAME_RENDER_STATE_FIELDS.length * 4);
  assert.equal(s.exports.inputsSize() >>> 0, R.GAME_RENDER_INPUT_FIELDS.length * 4);
  assert.equal(s.exports.eventsSize() >>> 0, R.GAME_RENDER_EVENT_FIELDS.length * 4);
  const mod = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(WebAssembly.Module.imports(mod).length, 0, "zero imports");
});

test("closed option gate: native shell terminates at epilog, bytes preserved", async () => {
  const s = await slice();
  const host = createRenderHostHandler();
  const game = paintGame();
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: createDefaultRenderInputs(),
    onHostEvent: host.handler,
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  assert.deepEqual(
    Object.keys(host.totals).map(Number).sort((a, b) => a - b),
    [R.GAME_RENDER_HOST_EPILOG_825DE0],
  );
  for (let i = 0; i < game.buf.length; i += 1) {
    assert.equal(game.buf[i], (i * 31 + 7) & 0xff, "byte 0x" + i.toString(16) + " mutated");
  }
});

test("open chain: driver vs oracle agree on every continuation step", async () => {
  const s = await slice();
  const inputs = createDefaultRenderInputs({ option2a3c3: 1 });
  const game = sceneWithClosedLoops();
  const wasmSteps = [];
  const host = createRenderHostHandler();
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: inputs,
    onStep: (ev) => wasmSteps.push({ ...ev }),
    onHostEvent: host.handler,
    recapture: () => ({ flagG2: 0, flagG10: 0, flagG12: 0 }),
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  const capturedState = R.gameRenderCapture(game.view, game.buf.byteLength);
  const oracle = oracleRun({
    state: capturedState,
    inputs: { ...inputs },
    gameView: game.view,
    patchFn: () => ({ flagG2: 0, flagG10: 0, flagG12: 0 }),
  });
  assert.equal(wasmSteps.length, oracle.evs.length - 1, "step count agrees");
  for (let i = 0; i < wasmSteps.length; i += 1) {
    assert.equal(wasmSteps[i].continuationKind, oracle.evs[i].continuationKind, "step " + i + " kind");
    assert.equal(wasmSteps[i].hostKind, oracle.evs[i].hostKind, "step " + i + " host");
    assert.equal(wasmSteps[i].hostVa, oracle.evs[i].hostVa, "step " + i + " va");
    assert.equal(wasmSteps[i].hostReceiver, oracle.evs[i].hostReceiver, "step " + i + " receiver");
  }
  for (const f of R.GAME_RENDER_EVENT_FIELDS) {
    assert.equal(result.events[f] >>> 0, oracle.last[f] >>> 0, "final events." + f);
  }
});

/* Entity/grid excursion scene: 2 entities, a 3x2 grid, everything else as in
   sceneWithClosedLoops. `entityCountSeq` is [Game+0x1264] RE-READ after each
   Game::Render (VA 0x0080eecb) — for a stable 2-entity list it stays 2, and
   `inc esi; cmp esi,[Game+0x1264]; jb` runs exactly two iterations. */
function excursionScene() {
  const game = sceneWithClosedLoops();
  game.view.setUint32(R.GAME_RENDER_OFF.entityCount, 2, true);
  game.view.setUint32(R.GAME_RENDER_OFF.gridW, 3, true);
  game.view.setUint32(R.GAME_RENDER_OFF.gridH, 2, true);
  return game;
}

function excursionPatch({ baseSeq, countSeq, gridSlots }) {
  return (k) => {
    const p = { flagG2: 0, flagG10: 0, flagG12: 0 };
    if (k === R.GAME_RENDER_CONTINUE_AT_TREE_ERASE ||
        k === R.GAME_RENDER_CONTINUE_AT_ENTITY) {
      p.entryCount = 2;
      p.entityBaseSeq = baseSeq;
      p.entityCountSeq = countSeq;
    }
    if (k === R.GAME_RENDER_CONTINUE_AT_GRID_ENTRY) {
      p.gridW = 3;
      p.gridH = 2;
      p.gridSlots = gridSlots;
    }
    return p;
  };
}

test("entity+grid excursion: supplied recaptures drive draw hosts in PE order", async () => {
  const s = await slice();
  const inputs = createDefaultRenderInputs({ option2a3c3: 1 });
  const game = excursionScene();
  /* base_seq[i] = [Game+0x125c] RE-READ at the top of iteration i
     (VA 0x0080eebc). Deliberately DIFFERENT per iteration: folding one base
     across the loop is the exact defect this ABI exists to prevent, and the
     pushed slot addresses below discriminate it. */
  const patch = excursionPatch({
    baseSeq: [0x1000, 0x2000],
    countSeq: [2, 2],
    gridSlots: [1, 2, 3, 4, 5, 6],
  });
  const wasmSteps = [];
  const host = createRenderHostHandler();
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: inputs,
    onStep: (ev) => wasmSteps.push({ ...ev }),
    onHostEvent: host.handler,
    recapture: patch,
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  assert.ok(result.steps < 40, "terminated");

  /* --- entity: one HOST_ENTITY_806C20 per PE Game::Render ---------------- */
  const entityEvents = host.events.filter((e) => e.kind === R.GAME_RENDER_HOST_ENTITY_806C20);
  assert.equal(host.totals[R.GAME_RENDER_HOST_ENTITY_806C20] || 0, 2, "two entity draw hosts");
  assert.equal(entityEvents.length, 2, "two entity draw host events");
  /* VA 0x0080eebc/0x0080eec2: push [ [Game+0x125c] + esi*4 ] — the base is
     re-read per iteration, so iteration 1's slot is 0x2000+4, NOT 0x1000+4. */
  assert.deepEqual(entityEvents.map((e) => e.hostArg0), [0x1000, 0x2004],
    "per-iteration slot addresses use the re-read base");
  assert.deepEqual(entityEvents.map((e) => e.entityIndex), [0, 1], "esi advances 0,1");
  for (const e of entityEvents) {
    assert.equal(e.hostVa, R.GAME_RENDER_VA_ENTITY_RENDER, "Game::Render VA");
    assert.equal(e.hostReceiver, 0, "ecx = Game*");
    assert.equal(e.hostVtableSlot, 0, "direct call, not a vtable dispatch");
    assert.equal(e.hostRepeat, 1, "one Game::Render per entity event");
  }

  /* --- grid: ONE event carrying the folded repeat (deliberate asymmetry) -- */
  const gridEvents = host.events.filter((e) => e.kind === R.GAME_RENDER_HOST_GRID_80C810);
  assert.equal(gridEvents.length, 1, "grid product is folded once (VA 0x0080eed6)");
  assert.equal(gridEvents[0].hostRepeat, 6, "all six grid slots drawn");
  assert.equal(gridEvents[0].hostArg0, 1, "first non-null slot pushed");
  assert.equal(gridEvents[0].hostVa, R.GAME_RENDER_VA_GRID_DRAW, "0x0080c810");

  /* --- PE order: tree erase -> N x Game::Render -> grid draw ------------- */
  const order = host.events.map((e) => e.kind);
  const iTree = order.indexOf(R.GAME_RENDER_HOST_TREE_ERASE_424540);
  const iEntity0 = order.indexOf(R.GAME_RENDER_HOST_ENTITY_806C20);
  const iEntity1 = order.lastIndexOf(R.GAME_RENDER_HOST_ENTITY_806C20);
  const iGrid = order.indexOf(R.GAME_RENDER_HOST_GRID_80C810);
  assert.ok(iTree >= 0 && iTree < iEntity0, "tree erase precedes the entity loop");
  assert.equal(iEntity1, iEntity0 + 1, "entity draws are adjacent");
  assert.equal(iGrid, iEntity1 + 1, "grid loop follows the entity loop");
  assert.deepEqual(result.hostKinds.slice(iTree, iGrid + 1), [
    R.GAME_RENDER_HOST_TREE_ERASE_424540,
    R.GAME_RENDER_HOST_ENTITY_806C20,
    R.GAME_RENDER_HOST_ENTITY_806C20,
    R.GAME_RENDER_HOST_GRID_80C810,
  ], "result.hostKinds records the same PE order");

  /* --- independent JS oracle lockstep, including the slot addresses ------ */
  const capturedState = R.gameRenderCapture(game.view, game.buf.byteLength);
  const oracle = oracleRun({
    state: capturedState, inputs: { ...inputs }, gameView: game.view, patchFn: patch,
  });
  assert.equal(wasmSteps.length, oracle.evs.length - 1, "excursion step count agrees");
  for (let i = 0; i < wasmSteps.length; i += 1) {
    assert.equal(wasmSteps[i].continuationKind, oracle.evs[i].continuationKind, "exc step " + i);
  }
  const oracleEntity = oracle.evs.find((e) => Array.isArray(e.slots) && e.slots.length > 0);
  assert.ok(oracleEntity, "oracle ran the entity loop");
  assert.equal(oracleEntity.entityRenderCalls, 2, "oracle agrees on the call count");
  assert.deepEqual(oracleEntity.slots, entityEvents.map((e) => e.hostArg0),
    "driver slot addresses match the independent JS oracle");
});

test("entity loop bound is the RE-READ count, not the entry count", async () => {
  /* VA 0x0080eecb: cmp esi,[Game+0x1264]; jb — the count is re-read AFTER
     every Game::Render. entityCountSeq[0]=0 means the list emptied during
     iteration 0, so `inc esi` -> 1 < 0 is false and the PE stops after ONE
     call even though the entry gate at VA 0x0080eead saw 2. A driver that
     replayed `entryCount` (or the captured state field) would emit two. */
  const s = await slice();
  const host = createRenderHostHandler();
  const game = excursionScene();
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: createDefaultRenderInputs({ option2a3c3: 1 }),
    onHostEvent: host.handler,
    recapture: excursionPatch({
      baseSeq: [0x1000, 0x2000], countSeq: [0, 0], gridSlots: [1, 2, 3, 4, 5, 6],
    }),
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  const entityEvents = host.events.filter((e) => e.kind === R.GAME_RENDER_HOST_ENTITY_806C20);
  assert.equal(entityEvents.length, 1, "re-read count closed the loop after one draw");
  assert.equal(entityEvents[0].hostArg0, 0x1000, "iteration 0 slot only");
});

test("grid host skips null slots without a call (G6 @ VA 0x0080eee7)", async () => {
  const s = await slice();
  const host = createRenderHostHandler();
  const game = excursionScene();
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: createDefaultRenderInputs({ option2a3c3: 1 }),
    onHostEvent: host.handler,
    recapture: excursionPatch({
      baseSeq: [0x1000, 0x2000], countSeq: [2, 2], gridSlots: [0, 7, 0, 9, 0, 11],
    }),
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  const gridEvents = host.events.filter((e) => e.kind === R.GAME_RENDER_HOST_GRID_80C810);
  assert.equal(gridEvents.length, 1, "one grid event");
  assert.equal(gridEvents[0].hostRepeat, 3, "three non-null slots drawn out of six cells");
  assert.equal(gridEvents[0].hostArg0, 7, "first non-null slot pushed");
});

test("entity sample exhaustion: a grown supply resumes without replaying draws", async () => {
  /* countSeq [2,3] leaves `inc esi` -> 2 < 3 true with no third sample, so
     resume_entity sets sample_exhausted and emits AT_ENTITY as a REQUEST for
     the next Game::Render (game_render_slice.cpp:541-549). resume_entity
     restarts at index 0, so the re-run re-reports iterations 0..1; the driver
     must deliver each PE call exactly once. */
  const s = await slice();
  const host = createRenderHostHandler();
  const game = excursionScene();
  let entityAsks = 0;
  const result = runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: createDefaultRenderInputs({ option2a3c3: 1 }),
    onHostEvent: host.handler,
    recapture: (k) => {
      const p = { flagG2: 0, flagG10: 0, flagG12: 0 };
      if (k === R.GAME_RENDER_CONTINUE_AT_TREE_ERASE ||
          k === R.GAME_RENDER_CONTINUE_AT_ENTITY) {
        entityAsks += 1;
        p.entryCount = 2;
        p.entityBaseSeq = entityAsks === 1 ? [0x1000, 0x2000] : [0x1000, 0x2000, 0x3000];
        p.entityCountSeq = entityAsks === 1 ? [2, 3] : [2, 3, 3];
      }
      if (k === R.GAME_RENDER_CONTINUE_AT_GRID_ENTRY) {
        p.gridW = 3; p.gridH = 2; p.gridSlots = [1, 2, 3, 4, 5, 6];
      }
      return p;
    },
  });
  assert.equal(result.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  assert.equal(entityAsks, 2, "the slice asked for more samples exactly once");
  const entityEvents = host.events.filter((e) => e.kind === R.GAME_RENDER_HOST_ENTITY_806C20);
  assert.equal(entityEvents.length, 3, "three draws, the re-run prefix not replayed");
  assert.deepEqual(entityEvents.map((e) => e.hostArg0), [0x1000, 0x2004, 0x3008],
    "each iteration keeps its own re-read base");
  assert.deepEqual(entityEvents.map((e) => e.entityIndex), [0, 1, 2], "esi advances 0,1,2");
});

test("entity sample exhaustion: an ungrown supply is surfaced, never spun", async () => {
  const s = await slice();
  const game = excursionScene();
  assert.throws(() => runHybridGameRenderTick(s, {
    gameObject: game.buf,
    runtimeInputs: createDefaultRenderInputs({ option2a3c3: 1 }),
    onHostEvent: createRenderHostHandler().handler,
    recapture: excursionPatch({
      baseSeq: [0x1000, 0x2000], countSeq: [2, 3], gridSlots: [1, 2, 3, 4, 5, 6],
    }),
  }), /entity loop exhausted after 2 Game::Render call\(s\)/,
    "under-supply names the shortfall instead of hitting the step cap");
});

test("session: multi-frame ticks share one buffer and accumulate host totals", async () => {
  const s = await slice();
  const updateSize = 0x68d70; // Update session buffer size (>= render min)
  const game = paintGame(updateSize);
  const host = createRenderHostHandler();
  const session = createNativeRenderSession(s, { gameObject: game.buf, onHostEvent: host.handler });
  assert.equal(session.gameObject, game.buf, "session owns the shared buffer");
  for (let i = 0; i < 8; i += 1) {
    const r = session.tick();
    assert.equal(r.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  }
  assert.equal(session.ticks, 8);
  assert.equal(session.last.continuationKind, R.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
});

