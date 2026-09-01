/**
 * Behavioural tests for the browser keyboard -> Update-slice input bridge.
 *
 * These are NOT shape tests. Every menu-lane assertion drives the REAL
 * standalone Game::Update slice Wasm (output/decomp/wasm-slice/game-update-slice.wasm)
 * through a REAL `createNativeUpdateSession`, and every "the key did something"
 * assertion is paired with a no-key baseline tick proving it did not happen
 * without the key edge.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

import {
  BRIDGE_VK,
  DEFAULT_MENU_KEYMAP,
  GENERIC_PROMPT_ACTIVE_SENTINEL,
  MENU_ACTION,
  MENU_LANE_CONTINUATIONS,
  MENU_LANE_RUNTIME_INPUTS,
  MENU_LANE_SPARSE_FIELDS,
  bridgeCodeToVk,
  createInputBridge,
  describeMenuOpenGate,
} from "../scripts/decomp/frame-input-bridge.mjs";
import {
  createDefaultNativeRuntimeInputs,
  createDefaultNativeState,
  createNativeUpdateSession,
  loadGameUpdateSliceWasm,
  runHybridGameUpdateTick,
  writeSparseFieldsToGameObject,
} from "../scripts/decomp/frame-path.mjs";
import {
  BINARY_LAYOUT,
  GAME_OBJECT_MIN_SIZE,
  UPDATE_CONTINUATION,
  RUNTIME_INPUTS_LAYOUT,
  resumeGameUpdateRoomUpdateHead,
} from "../scripts/decomp/game-update-model.mjs";
import {
  roomB1CornerIndices,
  roomB1CornerPick,
  roomB1CornerWorldXy,
  roomB16NeedsLavaBandGrid,
  roomB16NeedsType7Grid,
  roomB1RngXorshift,
  roomB1SpawnBaseCount,
} from "../scripts/decomp/room-pure-model.mjs";
import { VK as PLATFORM_VK, codeToVk as platformCodeToVk } from "../web/platform/input.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const wasmPath = join(repoRoot, "output", "decomp", "wasm-slice", "game-update-slice.wasm");

let cachedSlice = null;
async function slice() {
  if (!cachedSlice) cachedSlice = await loadGameUpdateSliceWasm(wasmPath);
  return cachedSlice;
}

/** Fresh session on the shared slice instance; default sparse state. */
async function freshSession(stateOverrides = {}) {
  return createNativeUpdateSession(await slice(), {
    state: createDefaultNativeState(stateOverrides),
  });
}

/* The `warmSlice()` workaround that lived here is RETIRED (ABI v67). It
 * papered over a real defect: `isaac_game_update_slice_capture` used to skip
 * the host-owned (Room-side) state members, so a fresh session inherited the
 * previous session's `roomDescFlags44 |= 1` from Wasm memory and the room
 * trigger-clear chain fired once per MODULE INSTANCE instead of per
 * RoomDescriptor state. Since v67, capture pins host-owned members to the
 * deterministic 0 default and `createNativeUpdateSession` threads its own
 * sparseState through the hybrid overlay (HOST_OWNED_STATE_CONTRACT), so
 * identical fresh sessions tick identically — pinned by
 * tests/decomp-frame-path.test.js ("fresh sessions on one warm module are
 * deterministic"). Cross-session comparisons below therefore need no warm-up:
 * both sides of each comparison now emit the same (PE-faithful) tick-1
 * trigger-clear chain for the zeroed default Room state. */

/** One Update tick driven exactly as the rAF host must drive it. */
function bridgeTick(session, bridge) {
  const runtimeInputs = bridge.toRuntimeInputs();
  const statePatch = bridge.toStatePatch();
  const result = session.tick(runtimeInputs, statePatch);
  bridge.consumeEdges();
  return { result, runtimeInputs, statePatch };
}

/* ------------------------------------------------------------------ */
/* 1. The names/offsets this bridge claims must be the tracked ones.    */
/* ------------------------------------------------------------------ */

test("menu-lane sparse field offsets match the tracked BINARY_LAYOUT", () => {
  assert.deepEqual(Object.keys(MENU_LANE_SPARSE_FIELDS), [
    "menuState23a74",
    "genericPromptActiveObject",
    "genericPromptActiveFlag",
    "genericPromptSubmittedSelection",
    "genericPromptPostUpdateFlag",
  ]);
  assert.equal(MENU_LANE_SPARSE_FIELDS.menuState23a74.binaryOffset, 0x23a74);
  assert.equal(MENU_LANE_SPARSE_FIELDS.genericPromptActiveObject.binaryOffset, 0x267ac);
  assert.equal(MENU_LANE_SPARSE_FIELDS.genericPromptActiveFlag.binaryOffset, 0x267bc);
  assert.equal(MENU_LANE_SPARSE_FIELDS.genericPromptSubmittedSelection.binaryOffset, 0x268a4);
  assert.equal(MENU_LANE_SPARSE_FIELDS.genericPromptPostUpdateFlag.binaryOffset, 0x268a8);
  for (const [name, spec] of Object.entries(MENU_LANE_SPARSE_FIELDS)) {
    assert.ok(BINARY_LAYOUT[name], `${name} missing from BINARY_LAYOUT`);
    assert.equal(BINARY_LAYOUT[name].offset, spec.binaryOffset, `${name} offset drift`);
  }
  // Every field the bridge patches must be a real sparse-state key, or
  // createNativeUpdateSession.tick() rejects the patch.
  const defaults = createDefaultNativeState();
  for (const name of Object.keys(MENU_LANE_SPARSE_FIELDS)) {
    assert.ok(name in defaults, `${name} is not a createDefaultNativeState() key`);
  }
});

test("menu-lane runtime inputs exist with the documented browser defaults", () => {
  const defaults = createDefaultNativeRuntimeInputs();
  assert.equal(defaults.globalMenuGuard4b3ca, 1); // menu closed
  assert.equal(defaults.globalMenuEnable2a3a5, 0);
  assert.equal(defaults.globalRangeByteLength, 8);
  for (const [name, spec] of Object.entries(MENU_LANE_RUNTIME_INPUTS)) {
    assert.ok(name in defaults, `${name} missing from createDefaultNativeRuntimeInputs()`);
    assert.equal(defaults[name], spec.browserDefault, `${name} browserDefault drift`);
  }
});

test("menu-lane continuation ids match the tracked slice model", () => {
  /* Continuation ids are renumbered in the tracked slice model (ABI v7x):
     RETURNs group first (1..10), then CONTINUEs (11..14), then RESUMEs
     (15..). Pins must track the header enum + UPDATE_CONTINUATION.
     (RETURN_AFTER_GENERIC_PROMPT_TRANSITION sits at 4, RETURN_AFTER_MENU_
     GATE_EXIT at 9 — the old 8/9/15/16/17 layout was renumbered.) */
  assert.equal(MENU_LANE_CONTINUATIONS.RESUME_AFTER_GENERIC_PROMPT_UPDATE, 15);
  assert.equal(MENU_LANE_CONTINUATIONS.RETURN_AFTER_GENERIC_PROMPT_TRANSITION, 4);
  assert.equal(MENU_LANE_CONTINUATIONS.RESUME_AFTER_MENU_OPEN, 17);
  assert.equal(MENU_LANE_CONTINUATIONS.RESUME_AFTER_MENU_UPDATE, 18);
  assert.equal(MENU_LANE_CONTINUATIONS.RETURN_AFTER_MENU_GATE_EXIT, 9);
  for (const [name, value] of Object.entries(MENU_LANE_CONTINUATIONS)) {
    assert.equal(value, UPDATE_CONTINUATION[name], `${name} continuation drift`);
  }
});

test("re-derived VK codes are value-identical to web/platform/input.js", () => {
  // The bridge cannot import web/platform/input.js (different browser mount);
  // this pins the duplicate so the two cannot drift.
  assert.equal(BRIDGE_VK.RETURN, PLATFORM_VK.RETURN);
  assert.equal(BRIDGE_VK.ESCAPE, PLATFORM_VK.ESCAPE);
  assert.equal(BRIDGE_VK.LEFT, PLATFORM_VK.LEFT);
  assert.equal(BRIDGE_VK.UP, PLATFORM_VK.UP);
  assert.equal(BRIDGE_VK.RIGHT, PLATFORM_VK.RIGHT);
  assert.equal(BRIDGE_VK.DOWN, PLATFORM_VK.DOWN);
  for (const code of ["Enter", "Escape", "ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"]) {
    assert.equal(bridgeCodeToVk(code), platformCodeToVk(code, ""), `${code} maps differently`);
  }
  // Movement keys joined the bridge when the native input lanes landed
  // (BRIDGE_VK.W @ 0x57); a non-movement, non-menu key still maps to 0.
  assert.equal(bridgeCodeToVk("KeyW"), 0x57);
  assert.equal(bridgeCodeToVk("KeyQ"), 0);
  assert.equal(bridgeCodeToVk("", "Escape"), BRIDGE_VK.ESCAPE); // key fallback
});

/* ------------------------------------------------------------------ */
/* 2. Tracker semantics (DOM-free, edges, latch).                       */
/* ------------------------------------------------------------------ */

test("edges are recorded once per transition and drained per tick", () => {
  const bridge = createInputBridge();
  assert.equal(DEFAULT_MENU_KEYMAP[BRIDGE_VK.ESCAPE], MENU_ACTION.TOGGLE);

  assert.equal(bridge.setKey(BRIDGE_VK.ESCAPE, true).edge, "press");
  assert.equal(bridge.setKey(BRIDGE_VK.ESCAPE, true).edge, null); // auto-repeat ignored
  let snap = bridge.snapshot();
  assert.ok(snap.vkDown instanceof Set);
  assert.ok(snap.actions instanceof Set);
  assert.deepEqual(snap.edges.pressed, [BRIDGE_VK.ESCAPE]);
  assert.ok(snap.actions.has(MENU_ACTION.TOGGLE));
  assert.equal(snap.menu.open, true);
  // The presentation layer reads this.
  assert.equal(snap.menu.selection, 1);

  assert.deepEqual(bridge.consumeEdges(), { pressed: [BRIDGE_VK.ESCAPE], released: [] });
  assert.deepEqual(bridge.snapshot().edges, { pressed: [], released: [] });

  assert.equal(bridge.setKey(BRIDGE_VK.ESCAPE, false).edge, "release");
  assert.deepEqual(bridge.consumeEdges().released, [BRIDGE_VK.ESCAPE]);

  // clear() releases held keys but does not dismiss the latched menu.
  bridge.setKey(BRIDGE_VK.DOWN, true);
  bridge.clear();
  snap = bridge.snapshot();
  assert.equal(snap.vkDown.size, 0);
  assert.equal(snap.menu.open, true);
});

test("the bridge module is DOM-free", async () => {
  const { readFileSync } = await import("node:fs");
  const src = readFileSync(join(repoRoot, "scripts", "decomp", "frame-input-bridge.mjs"), "utf8");
  const body = src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ""); // strip comments
  for (const banned of ["window", "document", "KeyboardEvent", "addEventListener", "node:"]) {
    assert.ok(!body.includes(banned), `bridge body must not reference ${banned}`);
  }
});

/* ------------------------------------------------------------------ */
/* 3. The recovered menu-open gate and its non-keyboard blocker.        */
/* ------------------------------------------------------------------ */

test("describeMenuOpenGate names globalRangeByteLength as the non-keyboard blocker", () => {
  const bridge = createInputBridge({ emptyGlobalRangeOnMenuOpen: false });
  bridge.setKeyByCode("Escape", true);
  const gate = describeMenuOpenGate(bridge.toRuntimeInputs(), { menuState23a74: 0 });
  assert.equal(gate.opens, false);
  assert.deepEqual(gate.blockedBy, ["globalRangeByteLength"]);
  const blocker = gate.conjuncts.find((c) => c.name === "globalRangeByteLength");
  assert.equal(blocker.site, "game_update_slice.cpp:1754");
  assert.equal(blocker.ownedByBridge, false);
  assert.equal(blocker.value, 8);

  const enabled = createInputBridge();
  enabled.setKeyByCode("Escape", true);
  const openGate = describeMenuOpenGate(enabled.toRuntimeInputs(), { menuState23a74: 0 });
  assert.equal(openGate.opens, true);
  assert.deepEqual(openGate.blockedBy, []);
});

test("guard/enable alone cannot open the menu lane (globalRangeByteLength blocks it)", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);
  // Real wasm proof of the blocker documented in the module header: with the
  // browser default globalRangeByteLength = 8, driving both recovered menu
  // bytes produces a tick indistinguishable from the no-key baseline — the
  // ENTIRE events struct is equal, not just the menu counters.
  const baselineSession = await freshSession();
  const baseline = baselineSession.tick(createDefaultNativeRuntimeInputs(), null);

  const blocked = createInputBridge({ emptyGlobalRangeOnMenuOpen: false });
  blocked.setKeyByCode("Escape", true);
  const blockedSession = await freshSession();
  const blockedRun = bridgeTick(blockedSession, blocked);

  assert.equal(blockedRun.result.events.opaqueCall009b7680, 0);
  assert.equal(baseline.events.opaqueCall009b7680, 0);
  assert.deepEqual(blockedRun.result.events, baseline.events);
  assert.deepEqual(blockedRun.result.state, baseline.state);
  assert.equal(blockedRun.runtimeInputs.globalMenuGuard4b3ca, 0);
  assert.equal(blockedRun.runtimeInputs.globalMenuEnable2a3a5, 1);
  assert.equal(blockedRun.runtimeInputs.globalRangeByteLength, 8);
});

/* ------------------------------------------------------------------ */
/* 4. Escape press edge measurably changes the real Update tick.        */
/* ------------------------------------------------------------------ */

test("Escape press edge opens the menu lane in the real Update slice", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);

  // --- baseline: identical session, no key ever pressed -------------
  const baselineBridge = createInputBridge();
  const baselineSession = await freshSession();
  const base1 = bridgeTick(baselineSession, baselineBridge).result;
  const base2 = bridgeTick(baselineSession, baselineBridge).result;

  assert.equal(base1.events.opaqueCall009b7680, 0, "baseline must not open the menu");
  assert.equal(base2.events.opaqueCall009b7680, 0);
  assert.equal(base2.events.opaqueCall009b6840, 0, "baseline must not run the menu gate body");
  assert.equal(base2.events.menuAuxListClear, 0);
  assert.equal(base2.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE);
  assert.equal(base2.state.menuState23a74, 0);

  // --- keyed: one Escape press edge ---------------------------------
  const bridge = createInputBridge();
  const session = await freshSession();
  bridge.setKeyByCode("Escape", true);

  const t1 = bridgeTick(session, bridge);
  // Behaviour first: the menu-open host edge VA 0x009b7680 fires only when all
  // four conjuncts of game_update_slice.cpp:1752-1755 hold, and the baseline
  // above proves it does not fire without the key.
  assert.equal(t1.result.events.opaqueCall009b7680, 1, "Escape must enter the menu-open lane");
  // Then the three conjuncts the bridge is responsible for supplying.
  assert.equal(t1.runtimeInputs.globalMenuGuard4b3ca, 0);
  assert.equal(t1.runtimeInputs.globalMenuEnable2a3a5, 1);
  assert.equal(t1.runtimeInputs.globalRangeByteLength, 0);
  assert.equal(t1.statePatch.menuState23a74, 0);

  // Second tick: the lane reports the post-open menuState and the Update tick
  // short-circuits at the translated menu-gate exit (cpp:1647-1653).
  const t2 = bridgeTick(session, bridge).result;
  assert.equal(t2.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_MENU_GATE_EXIT);
  assert.equal(t2.state.menuState23a74, 1);
  assert.equal(t2.events.opaqueCall009b6840, 1);
  assert.equal(t2.events.menuAuxListClear, 1);
  // The whole rest of the frame is skipped while the menu is up.
  assert.equal(t2.events.opaqueCall0098dba0PlayerWalk, 0);
  assert.notEqual(t2.continuationKind, base2.continuationKind);

  // --- close: a second Escape press edge restores the full frame ----
  bridge.setKeyByCode("Escape", false);
  bridge.setKeyByCode("Escape", true);
  const t3 = bridgeTick(session, bridge);
  assert.equal(t3.result.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE);
  assert.equal(t3.result.state.menuState23a74, 0);
  assert.equal(t3.result.events.opaqueCall009b7680, 0);
  assert.equal(t3.result.events.opaqueCall009b6840, 0);
  assert.equal(t3.runtimeInputs.globalMenuGuard4b3ca, 1);
  assert.equal(t3.runtimeInputs.globalMenuEnable2a3a5, 0);
  assert.equal(t3.runtimeInputs.globalRangeByteLength, 8);
});

/* ------------------------------------------------------------------ */
/* 5. Enter submits; arrows change what gets submitted.                 */
/* ------------------------------------------------------------------ */

/** Open the menu lane and settle it (one tick), returning session+bridge. */
async function openedMenu() {
  const bridge = createInputBridge();
  const session = await freshSession();
  bridge.setKeyByCode("Escape", true);
  bridgeTick(session, bridge); // menu-open host edge tick
  bridge.setKeyByCode("Escape", false);
  return { bridge, session };
}

test("Enter press edge drives the generic-prompt lane; no-Enter baseline does not", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);

  // baseline: menu open, no Enter
  const idle = await openedMenu();
  const idleTick = bridgeTick(idle.session, idle.bridge).result;
  assert.equal(idleTick.events.genericPromptUpdateCalls, 0);
  assert.equal(idleTick.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_MENU_GATE_EXIT);
  assert.equal(idleTick.state.transitionMode, 0);

  // keyed: menu open + Enter press edge
  const submit = await openedMenu();
  submit.bridge.setKeyByCode("Enter", true);
  const patch = submit.bridge.toStatePatch();
  const result = submit.session.tick(submit.bridge.toRuntimeInputs(), patch);
  submit.bridge.consumeEdges();

  assert.equal(result.events.genericPromptUpdateCalls, 1, "Enter must call GenericPrompt::Update");
  assert.equal(
    result.continuationKind,
    UPDATE_CONTINUATION.RETURN_AFTER_GENERIC_PROMPT_TRANSITION,
  );
  // Recovered mode-7 transition (game_update_slice.cpp:1535-1541).
  assert.equal(result.state.transitionMode, 7);
  assert.equal(result.state.transitionRate, Math.fround(0.08));
  // The bridge-convention captures that got it there.
  assert.equal(patch.genericPromptActiveObject, GENERIC_PROMPT_ACTIVE_SENTINEL);
  assert.equal(patch.genericPromptActiveFlag, 1);
  assert.equal(patch.genericPromptSubmittedSelection, 1);
  assert.equal(patch.genericPromptPostUpdateFlag, 0);

  // Enter is a one-shot edge: holding it does not re-submit next tick.
  const held = bridgeTick(submit.session, submit.bridge).result;
  assert.equal(held.events.genericPromptUpdateCalls, 0);
});

test("arrow press edges change the submitted selection the slice acts on", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);

  // ArrowDown moves the selection off 1, and the recovered predicate at
  // game_update_slice.cpp:1536 (== 1) then refuses the mode-7 transition.
  const moved = await openedMenu();
  moved.bridge.setKeyByCode("ArrowDown", true);
  assert.equal(moved.bridge.menu.selection, 2);
  moved.bridge.setKeyByCode("Enter", true);
  const movedPatch = moved.bridge.toStatePatch();
  const movedResult = moved.session.tick(moved.bridge.toRuntimeInputs(), movedPatch);
  moved.bridge.consumeEdges();
  assert.equal(movedResult.events.genericPromptUpdateCalls, 1);
  assert.equal(movedResult.continuationKind, UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL);
  assert.equal(movedResult.state.transitionMode, 0, "selection 2 must not start mode 7");
  assert.equal(movedPatch.genericPromptSubmittedSelection, 2);

  // ArrowUp walks it back to 1 and the same Enter now takes the transition.
  const back = await openedMenu();
  back.bridge.setKeyByCode("ArrowDown", true);
  back.bridge.setKeyByCode("ArrowDown", false);
  back.bridge.setKeyByCode("ArrowUp", true);
  assert.equal(back.bridge.menu.selection, 1);
  back.bridge.setKeyByCode("Enter", true);
  const backPatch = back.bridge.toStatePatch();
  const backResult = back.session.tick(back.bridge.toRuntimeInputs(), backPatch);
  back.bridge.consumeEdges();
  assert.equal(
    backResult.continuationKind,
    UPDATE_CONTINUATION.RETURN_AFTER_GENERIC_PROMPT_TRANSITION,
  );
  assert.equal(backResult.state.transitionMode, 7);
  assert.equal(backPatch.genericPromptSubmittedSelection, 1);

  // Selection is clamped at 0 (no recovered entry count exists).
  const floor = await openedMenu();
  for (let i = 0; i < 4; i += 1) {
    floor.bridge.setKeyByCode("ArrowUp", true);
    floor.bridge.setKeyByCode("ArrowUp", false);
  }
  assert.equal(floor.bridge.menu.selection, 0);
});

/* ------------------------------------------------------------------ */
/* 6. applyToGameObject on a caller-owned hybrid buffer.                */
/* ------------------------------------------------------------------ */

test("applyToGameObject writes the sparse menu fields and steers a hybrid tick", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);
  const s = await slice();

  const buffer = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  writeSparseFieldsToGameObject(buffer, createDefaultNativeState());
  const view = new DataView(buffer.buffer);

  const bridge = createInputBridge();
  bridge.setKeyByCode("Escape", true);
  bridge.consumeEdges(); // retire openPending -> lane reports menuState23a74 == 1
  const written = bridge.applyToGameObject(buffer);
  assert.equal(written.menuState23a74, 1);
  assert.equal(view.getInt32(0x23a74, true), 1);
  assert.equal(view.getInt32(0x267ac, true), 0);
  assert.equal(view.getUint8(0x267bc), 0);

  const hybrid = runHybridGameUpdateTick(s, {
    gameObject: buffer,
    runtimeInputs: bridge.toRuntimeInputs(),
  });
  assert.equal(hybrid.usesX86Emulation, false);
  assert.equal(hybrid.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_MENU_GATE_EXIT);
  assert.equal(hybrid.events.opaqueCall009b6840, 1);

  // Baseline: same buffer contents without the bridge write stays a full frame.
  const baselineBuffer = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  writeSparseFieldsToGameObject(baselineBuffer, createDefaultNativeState());
  const baseline = runHybridGameUpdateTick(s, {
    gameObject: baselineBuffer,
    runtimeInputs: createDefaultNativeRuntimeInputs(),
  });
  assert.equal(baseline.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE);
  assert.equal(baseline.events.opaqueCall009b6840, 0);

  assert.throws(() => bridge.applyToGameObject(new Uint8Array(16)), />= \d+ bytes/);
  assert.throws(() => bridge.applyToGameObject(null), /Uint8Array/);
});

/* ------------------------------------------------------------------ */
/* 7. The patch contract the session enforces.                          */
/* ------------------------------------------------------------------ */

test("toStatePatch emits only real sparse-state keys and goes quiet when idle", async (t) => {
  if (!existsSync(wasmPath)) return t.skip(`missing ${wasmPath}`);
  const bridge = createInputBridge();
  assert.equal(bridge.toStatePatch(), null, "idle bridge must not patch state");

  bridge.setKeyByCode("Escape", true);
  const open = bridge.toStatePatch();
  const defaults = createDefaultNativeState();
  for (const key of Object.keys(open)) {
    assert.ok(key in defaults, `${key} would be rejected by session.tick statePatch`);
  }

  // A session accepts it (the unknown-key guard in tick() does not fire).
  const session = await freshSession();
  assert.doesNotThrow(() => session.tick(bridge.toRuntimeInputs(), open));
  bridge.consumeEdges();

  // Closing publishes one trailing zeroed patch, then goes quiet again.
  bridge.setKeyByCode("Escape", false);
  bridge.setKeyByCode("Escape", true);
  const closed = bridge.toStatePatch();
  assert.equal(closed.menuState23a74, 0);
  assert.equal(closed.genericPromptActiveObject, 0);
  bridge.consumeEdges();
  assert.equal(bridge.toStatePatch(), null);
});

/* ------------------------------------------------------------------ */
/* 8. §W31 runtime capture packs (record idx 30 greed probe + record    */
/*    idx 36 B16 spawn rows) — live sources wired in the bridge.        */
/* ------------------------------------------------------------------ */
/**
 * Import the REAL browser bridge under Node by rewriting only its
 * /@decomp/scripts/* import specifiers to file URLs (the render-wiring
 * suite's pattern, local to this section).
 */
let nativeBridgePromise = null;
function nativeBridge() {
  if (!nativeBridgePromise) {
    const source = readFileSync(
      join(repoRoot, "web", "js", "native-update-bridge.js"), "utf8");
    const rewritten = source.replace(
      /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
      (_match, file) =>
        JSON.stringify(pathToFileURL(join(repoRoot, "scripts", "decomp", file)).href),
    );
    assert.ok(
      !/from\s*"\/@decomp\//.test(rewritten),
      "every /@decomp/scripts/* bridge import must be rewritable for Node",
    );
    const dir = mkdtempSync(join(tmpdir(), "isaac-update-bridge-"));
    const file = join(dir, "native-update-bridge.mjs");
    writeFileSync(file, rewritten);
    nativeBridgePromise = import(pathToFileURL(file).href);
  }
  return nativeBridgePromise;
}

/** Sparse guest memory: absolute address -> byte, LE writers + reader. */
function makeGuestMemory() {
  const bytes = new Map();
  return {
    u32(addr, value) {
      const v = value >>> 0;
      for (let i = 0; i < 4; i += 1) bytes.set((addr >>> 0) + i, (v >>> (i * 8)) & 0xff);
    },
    f32(addr, value) {
      const u = new Uint32Array(new Float32Array([value]).buffer)[0];
      this.u32(addr, u);
    },
    u8(addr, value) {
      bytes.set(addr >>> 0, value & 0xff);
    },
    /** Materialize `size` zero bytes at `addr` (unmapped reads are null,
     *  so logically-zero PE memory must be present explicitly). */
    zero(addr, size) {
      for (let i = 0; i < size; i += 1) {
        if (!bytes.has((addr >>> 0) + i)) bytes.set((addr >>> 0) + i, 0);
      }
    },
    drop(addr, size) {
      for (let i = 0; i < size; i += 1) bytes.delete((addr >>> 0) + i);
    },
    reader() {
      return (addr, size) => {
        const out = new Uint8Array(size);
        for (let i = 0; i < size; i += 1) {
          const b = bytes.get((addr >>> 0) + i);
          if (b === undefined) return null;
          out[i] = b;
        }
        return out;
      };
    },
  };
}

/** Game buffer with one word poked (room ptr @0x18300 etc.). */
function makeGameBuffer(words = {}) {
  const buf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  const view = new DataView(buf.buffer);
  for (const [off, value] of Object.entries(words)) {
    view.setUint32(off, value >>> 0, true);
  }
  return view;
}

const f32OfBits = (bits) => new Float32Array(new Uint32Array([bits]).buffer)[0];

test("greed-probe capture pack: player-vector walk rows are the raw probe truth", async () => {
  const { captureUpdateGreedProbe } = await nativeBridge();
  const GPV = 0x50000000;
  const BEGIN = 0x60000000;
  const E1 = 0x60010000; /* parentless element, byte clear */
  const E2 = 0x60020000; /* parent P frame 3 < self 7 -> qualifies; byte set */
  const E3 = 0x60040000; /* parent IS self */
  const P2 = 0x60030000;
  const mem = makeGuestMemory();
  /* Entity objects must EXIST byte-for-byte (unmapped reads are null):
     zero each player object across every offset the pack reads. */
  for (const obj of [E1, E2, E3, P2]) mem.zero(obj, 0x2100);
  mem.u32(GPV + 0x1baa8, BEGIN);
  mem.u32(GPV + 0x1baac, BEGIN + 3 * 4);
  mem.u32(BEGIN + 0 * 4, E1);
  mem.u32(BEGIN + 1 * 4, E2);
  mem.u32(BEGIN + 2 * 4, E3);
  mem.u32(E1 + 0x161c, 5);
  mem.u32(E2 + 0x161c, 7);
  mem.u32(P2 + 0x161c, 3); /* < self 7 AND parent != e -> PE counts it */
  mem.u32(E2 + 0x1e68, P2);
  mem.u32(E3 + 0x161c, 9);
  mem.u32(E3 + 0x1e68, E3); /* parent pointer == e */
  mem.u8(E2 + 0x20a9, 0x41);

  const patch = captureUpdateGreedProbe({
    gameView: makeGameBuffer(),
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });

  assert.equal(patch.greedProbePackReady, 1, "all reads resolved -> voucher");
  assert.equal(patch.greedProbeElemCount, 3);
  assert.equal(patch.greedProbeF2c0, 0);
  assert.equal(patch.greedProbeF3bc0, 0);
  assert.equal(patch.greedProbeHasParent0, 0, "parentless element");
  assert.equal(patch.greedProbeParent161c0, 0, "parent_161c valid iff has_parent");
  assert.equal(patch.greedProbeSelf161c0, 5);
  assert.equal(patch.greedProbeParentIsSelf0, 0);
  assert.equal(patch.greedProbeF20a90, 0, "byte widened low-byte only");
  assert.equal(patch.greedProbeHasParent1, 1);
  assert.equal(patch.greedProbeParent161c1, 3);
  assert.equal(patch.greedProbeSelf161c1, 7);
  assert.equal(patch.greedProbeParentIsSelf1, 0, "P2 != E2");
  assert.equal(patch.greedProbeF20a91, 0x41);
  assert.equal(patch.greedProbeHasParent2, 1);
  assert.equal(patch.greedProbeParent161c2, 9);
  assert.equal(patch.greedProbeParentIsSelf2, 1, "E3's parent is itself");

  /* Every emitted key must exist in RUNTIME_INPUTS_LAYOUT — a casing typo
     would silently normalize to 0 (silent-zero class). */
  for (const key of Object.keys(patch)) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }

  /* Over-cap poisons the whole voucher (cap 8). */
  const bigBegin = 0x61000000;
  mem.u32(GPV + 0x1baa8, bigBegin);
  mem.u32(GPV + 0x1baac, bigBegin + 9 * 4);
  for (let i = 0; i < 9; i += 1) mem.u32(bigBegin + i * 4, 0x61001000 + i * 0x100);
  const overCap = captureUpdateGreedProbe({
    gameView: makeGameBuffer(),
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });
  assert.ok(!("greedProbePackReady" in overCap), "over-cap keeps the monolith");

  /* Negative span / unresolved read / null slot -> absent. */
  mem.u32(GPV + 0x1baa8, BEGIN + 16);
  const negative = captureUpdateGreedProbe({
    gameView: makeGameBuffer(),
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });
  assert.ok(!("greedProbePackReady" in negative), "negative span -> absent");
  mem.u32(GPV + 0x1baa8, BEGIN);
  mem.drop(E1 + 0x161c, 1);
  const tornRead = captureUpdateGreedProbe({
    gameView: makeGameBuffer(),
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });
  assert.ok(!("greedProbePackReady" in tornRead), "any failed read -> absent");
});

test("B16 spawn-row capture pack: interior type-7 enumeration gated on module-truth arms", async () => {
  const { captureUpdateB16SpawnRows, UPDATE_CAPTURE_B16_SPAWN_ROOM_OFFSETS: R } =
    await nativeBridge();
  const ROOM = 0x70000000;
  const W = 6;
  const H = 5;
  const C_HIT_A = 0x60040000; /* type 7 at (x=2,y=1), idx 8 */
  const C_HIT_B = 0x60050000; /* type 7 at (x=4,y=3), idx 22 */
  const C_TYPE5 = 0x60060000; /* non-hit interior cell (x=1,y=2), idx 13 */
  const C_BOUNDARY = 0x60070000; /* type 7 OUTSIDE the interior (x=0,y=1) */
  const cellAddr = (idx) => ROOM + R.gridBase + idx * 4;
  const mem = makeGuestMemory();
  /* The whole slot array + each cell object must EXIST (unmapped reads
     are null): zero the full w*h slot array and 16 B per cell object. */
  mem.zero(ROOM + R.gridBase, W * H * 4);
  for (const cell of [C_HIT_A, C_HIT_B, C_TYPE5, C_BOUNDARY]) {
    mem.zero(cell, 16);
  }
  mem.u32(ROOM + R.gridW, W);
  mem.u32(ROOM + R.gridH, H);
  mem.u32(cellAddr(8), C_HIT_A);
  mem.u32(cellAddr(22), C_HIT_B);
  mem.u32(cellAddr(13), C_TYPE5);
  mem.u32(cellAddr(6), C_BOUNDARY); /* x=0 -> never iterated */
  mem.u32(C_HIT_A + R.cellType4, 7);
  mem.u32(C_HIT_B + R.cellType4, 7);
  mem.u32(C_TYPE5 + R.cellType4, 5);
  mem.u32(C_BOUNDARY + R.cellType4, 7);

  /* Module-truth arming inputs, bit-exact against the landed laws. */
  const waterPre = Math.fround(
    (f32OfBits(0x3f63d70a) + f32OfBits(0x3f68f5c3)) / 2 - f32OfBits(0x3dcccccd));
  const lavaBand = f32OfBits(0x3e4ccccd);
  const armedBoth = {
    challenge0x123: 1,
    roomType8: 0,
    waterPre,
    lavaPre: lavaBand,
    descFlags44: 32,
  };
  assert.equal(roomB16NeedsType7Grid(1, 0, waterPre, 32), 1, "water arm opens");
  assert.equal(roomB16NeedsLavaBandGrid(lavaBand,
    Math.fround(lavaBand * f32OfBits(0x3f6b851f))), 1, "lava arm opens");

  const gameView = makeGameBuffer({ 0x18300: ROOM });
  const patch = captureUpdateB16SpawnRows({
    gameView,
    guestRead: mem.reader(),
    armState: armedBoth,
  });
  assert.equal(patch.waterB16SpawnRowsReady, 1, "both arms walked -> voucher");
  assert.equal(patch.waterB16WaterHitCount, 2);
  assert.equal(patch.waterB16LavaHitCount, 2);
  assert.equal(patch.waterB16GridWEcho, W, "dims echo guards mid-frame mutation");
  assert.equal(patch.waterB16GridHEcho, H);
  assert.deepEqual(
    [patch.waterB16WaterHitCellIdx0, patch.waterB16WaterHitCellIdx1],
    [8, 22],
    "PE order: outer x ascending, inner y ascending",
  );
  assert.deepEqual(
    [patch.waterB16LavaHitCellIdx0, patch.waterB16LavaHitCellIdx1],
    [8, 22],
  );
  assert.ok(!(6 in []) && patch.waterB16WaterHitCellIdx2 === undefined,
    "boundary cells and non-type-7 interiors are not hits");

  /* A disarmed lane reports ZERO hits — the echo carriers must not claim
     casts the PE-equivalent walk did not perform. */
  const waterOnly = captureUpdateB16SpawnRows({
    gameView,
    guestRead: mem.reader(),
    armState: { ...armedBoth, challenge0x123: 0 }, /* type7 gate closed */
  });
  assert.equal(waterOnly.waterB16SpawnRowsReady, 1);
  assert.equal(waterOnly.waterB16WaterHitCount, 0, "disarmed water arm");
  assert.equal(waterOnly.waterB16LavaHitCount, 2, "lava arm unaffected");
  const lavaDisarmed = captureUpdateB16SpawnRows({
    gameView,
    guestRead: mem.reader(),
    armState: { ...armedBoth, lavaPre: Math.fround(lavaBand * 4) },
  });
  assert.equal(lavaDisarmed.waterB16LavaHitCount, 0, "disarmed lava arm");
  assert.equal(lavaDisarmed.waterB16WaterHitCount, 2);
  /* Both arms closed -> zero pack WITHOUT a grid scan: an unmapped slot
     array cannot poison a voucher about walks that never run. */
  const bareRoom = 0x72000000;
  mem.u32(bareRoom + R.gridW, 6);
  mem.u32(bareRoom + R.gridH, 5);
  const bothClosed = captureUpdateB16SpawnRows({
    gameView: makeGameBuffer({ 0x18300: bareRoom }),
    guestRead: mem.reader(),
    armState: { ...armedBoth, challenge0x123: 0, lavaPre: Math.fround(lavaBand * 4) },
  });
  assert.equal(bothClosed.waterB16SpawnRowsReady, 1);
  assert.equal(bothClosed.waterB16WaterHitCount, 0);
  assert.equal(bothClosed.waterB16LavaHitCount, 0);
  assert.equal(bothClosed.waterB16GridWEcho, 6);

  /* Layout-key guard for the whole emitted pack. */
  for (const key of Object.keys(patch)) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }

  /* Over-cap (> 64 per arm) poisons the voucher; torn grid reads too. */
  const bigRoom = 0x71000000;
  const wideView = makeGameBuffer({ 0x18300: bigRoom });
  mem.u32(bigRoom + R.gridW, 12);
  mem.u32(bigRoom + R.gridH, 10);
  const allSeven = 0x60080000;
  mem.zero(allSeven, 16);
  mem.u32(allSeven + R.cellType4, 7);
  for (let x = 1; x <= 10; x += 1) {
    for (let y = 1; y <= 8; y += 1) mem.u32(bigRoom + R.gridBase + (y * 12 + x) * 4, allSeven);
  }
  const overCap = captureUpdateB16SpawnRows({
    gameView: wideView,
    guestRead: mem.reader(),
    armState: armedBoth,
  });
  assert.ok(!("waterB16SpawnRowsReady" in overCap), "80 hits > cap 64 -> absent");
  mem.drop(ROOM + R.gridBase + 8 * 4, 1);
  const torn = captureUpdateB16SpawnRows({
    gameView,
    guestRead: mem.reader(),
    armState: armedBoth,
  });
  assert.ok(!("waterB16SpawnRowsReady" in torn), "any failed grid read -> absent");
  const noRoom = captureUpdateB16SpawnRows({
    gameView: makeGameBuffer({ 0x18300: 0 }),
    guestRead: mem.reader(),
    armState: armedBoth,
  });
  assert.ok(!("waterB16SpawnRowsReady" in noRoom), "null room -> absent");
});

test("captureUpdateLanes wires both packs live; absence keeps every voucher quiet", async () => {
  const { captureUpdateLanes } = await nativeBridge();
  const GPV = 0x50000000;
  const ROOM = 0x70000000;
  const mem = makeGuestMemory();
  /* Greed world: empty player vector (count 0 IS captured). */
  mem.u32(GPV + 0x1baa8, 0x60000000);
  mem.u32(GPV + 0x1baac, 0x60000000);
  /* B16 world: minimal armed room with zero interior hits. */
  const R = { gridW: 0xc, gridH: 0x10, gridBase: 0x24 };
  mem.zero(ROOM + R.gridBase, 3 * 3 * 4);
  mem.u32(ROOM + R.gridW, 3);
  mem.u32(ROOM + R.gridH, 3);
  const armState = {
    challenge0x123: 1,
    roomType8: 0,
    waterPre: Math.fround(
      (f32OfBits(0x3f63d70a) + f32OfBits(0x3f68f5c3)) / 2 - f32OfBits(0x3dcccccd)),
    lavaPre: f32OfBits(0x3e4ccccd),
    descFlags44: 32,
  };
  const gameView = makeGameBuffer({ 0x18300: ROOM });
  const live = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
    b16ArmState: armState,
  });
  assert.equal(live.greedProbePackReady, 1, "greed pack rides the lanes");
  assert.equal(live.greedProbeElemCount, 0);
  assert.equal(live.waterB16SpawnRowsReady, 1, "b16 pack rides the lanes");
  assert.equal(live.waterB16WaterHitCount, 0, "3x3 interior is empty");
  for (const key of ["greedProbePackReady", "greedProbeElemCount",
    "waterB16SpawnRowsReady", "waterB16WaterHitCount",
    "waterB16LavaHitCount", "waterB16GridWEcho", "waterB16GridHEcho"]) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }

  /* No arming state -> ONLY the b16 group stays absent (voucher 0 after
     normalize -> pre-v132 monolith), the greed pack still captures. */
  const noArm = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });
  assert.equal(noArm.greedProbePackReady, 1);
  assert.ok(!("waterB16SpawnRowsReady" in noArm), "absent armState -> b16 absent");

  /* Capture not installed (no reader, no pointer) -> BOTH vouchers 0:
     the byte-for-byte fallback the module already pins. */
  const off = captureUpdateLanes({ gameView });
  assert.ok(!("greedProbePackReady" in off));
  assert.ok(!("waterB16SpawnRowsReady" in off));
});
/* ------------------------------------------------------------------ */
/* 8b. §W31 record idx 36 B16 water-wire BLOB pack — the second v132    */
/*     FULL-CARRY conjunction arm, driven LIVE from guest state.        */
/* ------------------------------------------------------------------ */

/** Build an MSVC std::map<int,..> action map in sparse guest memory:
 *  balanced BST over sorted `keys`; sentinel head with _Isnil=1;
 *  node layout _Left+0/_Parent+4/_Right+8/_Isnil byte +0xd/key +0x10
 *  (PE 0x6f941d..0x6f947b derefs). Returns nothing; memory is mutated. */
function buildActionMap(mem, headAddr, nodeBase, keysSorted) {
  const addrs = keysSorted.map((_k, i) => (nodeBase + i * 0x100) >>> 0);
  const build = (lo, hi, parent) => {
    if (lo > hi) return headAddr;
    const mid = (lo + hi) >> 1;
    const addr = addrs[mid];
    mem.zero(addr, 0x18);
    mem.u8(addr + 0xd, 0); /* real node */
    mem.u32(addr + 0x10, keysSorted[mid]);
    mem.u32(addr, build(lo, mid - 1, addr)); /* _Left */
    mem.u32(addr + 8, build(mid + 1, hi, addr)); /* _Right */
    mem.u32(addr + 4, parent); /* _Parent */
    return addr;
  };
  /* Head sentinel: _Left/_Right self, _Isnil = 1, _Parent = root. */
  mem.zero(headAddr, 0x18);
  const root = build(0, keysSorted.length - 1, headAddr);
  mem.u32(headAddr + 4, root);
}

/** Deterministic B16 blob world: Game buffer words + guest memory with
 *  the action map and a fully readable Room. `keys` are the action-map
 *  ids present; `overrides` patch the Game word table. */
function makeB16BlobWorld(mem, {
  keys = [0x38, 0x39, 0x40],
  overrides = {},
} = {}) {
  const HEAD = 0x3f000000;
  const NODES = 0x40000000;
  const ROOM = 0x70000000;
  buildActionMap(mem, HEAD, NODES, [...keys].sort((a, b) => a - b));
  /* Room-homed blob lanes: the full 6-dword source vector
     (+0x1b10..+0x1b1c then +0x1b24/+0x1b28). +0x1b20 is deliberately
     LEFT UNMAPPED — a wrong contiguous read fails loudly instead of
     lying about the PE's skip. grid_flags_44 / cell_dword_54 live
     behind the Room desc pointer ([Room+4]+0x44 / +0x54). */
  const DESC = 0x71000000;
  mem.u32(ROOM + 4, DESC);
  mem.zero(DESC, 0x60);
  mem.u32(DESC + 0x44, 0x220); /* grid_flags_44: bit9 + bit5 */
  mem.u32(DESC + 0x54, 7); /* cell_dword_54 */
  mem.f32(ROOM + 0x1b10, 0.5);
  mem.u32(ROOM + 0x1b14, 0);
  mem.u32(ROOM + 0x1b18, 0);
  mem.u32(ROOM + 0x1b1c, 0);
  mem.f32(ROOM + 0x1b24, 0.25);
  mem.f32(ROOM + 0x1b28, 1);
  mem.u32(ROOM + 0x1d18, 0); /* NOT the 0x20 lava-displacement world */
  mem.u32(ROOM + 0xc, 6);
  mem.u32(ROOM + 0x10, 5);
  return makeGameBuffer({
    0x18300: ROOM,
    0x1bbd8: HEAD,
    0x0: 3, /* [Game+0]: gate39 stage word AND 74efd0 arg type */
    0x4: 4, /* [Game+4] subtype */
    0xc: 0,
    0x26550: 0,
    0x26584: 0,
    0x269c8: 0,
    0x183a0: 0x100, /* WIDE byte lane: low byte 0 -> spray flag ON */
    0x269e9: 0,
    ...overrides,
  });
}

test("B16 blob capture pack: live poll-mask walk + room lanes drive waterB16BlobReady", async () => {
  const { captureUpdateB16Blob } = await nativeBridge();
  const mem = makeGuestMemory();
  const gameView = makeB16BlobWorld(mem);
  const patch = captureUpdateB16Blob({
    gameView,
    guestRead: mem.reader(),
  });
  assert.equal(patch.waterB16BlobReady, 1, "all reads resolved -> voucher");
  /* Poll masks walked live: keys {38,39,40} present, gate39 open
     (mode!=0x2c, stage 3 odd <8, diff 0) -> maskA=0b011, maskB=0b010
     (0x40 present); acc = maskA | [Game+0xc] | [Game+0x26550] = 3. */
  assert.equal(patch.waterB16UnlockAcc, 3);
  assert.equal(patch.waterB16UnlockClear, 2);
  assert.equal(patch.waterB16GameByte183a0, 0x100, "byte lane carried WIDE");
  assert.equal(patch.waterB16GameByte269e9, 0);
  assert.equal(patch.waterB16GameType0, 3);
  assert.equal(patch.waterB16GameSubtype4, 4);
  assert.deepEqual(
    [
      patch.waterB16Src1b10_0, patch.waterB16Src1b10_1,
      patch.waterB16Src1b10_2, patch.waterB16Src1b10_3,
      patch.waterB16Src1b10_4, patch.waterB16Src1b10_5,
    ],
    [0x3f000000, 0, 0, 0, 0x3e800000, 0x3f800000],
    "src vector: dwords +0x1b10..1c then +0x1b24/28 (skips +0x1b20)",
  );
  assert.equal(patch.waterB16GridFlags44, 0x220);
  assert.equal(patch.waterB16CellDword54, 7);
  /* Reused-capture echoes ride the same all-or-nothing group. */
  assert.equal(patch.ambientRoom1d18, 0);
  assert.equal(patch.b3b7WidthC, 6);
  assert.equal(patch.b3b7Height10, 5);

  /* Silent-zero key guard: every emitted key must be a tracked lane. */
  for (const key of Object.keys(patch)) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }

  /* gate39 mode exclude (Game+0x26584 == 0x2c) drops maskA bit1. */
  const gated = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem, { overrides: { 0x26584: 0x2c } }),
    guestRead: mem.reader(),
  });
  assert.equal(gated.waterB16UnlockAcc, 1, "gate39 closed -> no maskA bit1");
  /* Even stage word closes gate39 too (signed %2 != 1). */
  const evenStage = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem, { overrides: { 0x0: 4 } }),
    guestRead: mem.reader(),
  });
  assert.equal(evenStage.waterB16UnlockAcc, 1, "even stage -> no maskA bit1");
  /* Missing action id 0x39 -> presence walk finds nothing at 0x39. */
  const no39 = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem, { keys: [0x38, 0x40] }),
    guestRead: mem.reader(),
  });
  assert.equal(no39.waterB16UnlockAcc, 1, "absent 0x39 -> no maskA bit1");
  /* Key 0x46 present REPLACES maskB with 0x7f (cmovne 0x6f96ec). */
  const with46 = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem, { keys: [0x38, 0x39, 0x40, 0x46] }),
    guestRead: mem.reader(),
  });
  assert.equal(with46.waterB16UnlockClear, 0x7f, "0x46 replaces maskB");

  const ROOM = 0x70000000;
  mem.drop(0x3f000005, 1); /* the head->_Parent hop byte */
  const torn = captureUpdateB16Blob({ gameView, guestRead: mem.reader() });
  assert.ok(!("waterB16BlobReady" in torn), "torn map walk -> absent");
  const fresh = makeGuestMemory();
  const noMap = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(fresh, { overrides: { 0x1bbd8: 0 } }),
    guestRead: fresh.reader(),
  });
  assert.ok(!("waterB16BlobReady" in noMap), "null map head -> absent");

  const noRoom = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(makeGuestMemory(), { overrides: { 0x18300: 0 } }),
    guestRead: makeGuestMemory().reader(),
  });
  assert.ok(!("waterB16BlobReady" in noRoom), "null room -> absent");
  const tornRoom = makeGuestMemory();
  const view3 = makeB16BlobWorld(tornRoom);
  tornRoom.drop(0x71000000 + 0x54, 1); /* cell_dword_54 unreadable */
  const tornCell = captureUpdateB16Blob({
    gameView: view3,
    guestRead: tornRoom.reader(),
  });
  assert.ok(!("waterB16BlobReady" in tornCell), "torn room lane -> absent");
});

test("B16 blob lane opens the v132 FULL-CARRY conjunction in the model", async () => {
  const { captureUpdateB16Blob } = await nativeBridge();
  const ev0 = {
    continuationKind: UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD,
  };
  const st = {
    roomWaterAmount7240: 0.5,   /* post-step water > 0 -> 823540 gate open */
    roomLavaIntensity7740: 0.5, /* pre lava > 0 */
    roomType8: 1,
    roomTransitionMode1830c: 1,
    difficulty269c8: 0,
    flags2654c: 0,
    roomDescFlags44: 0,
    fxCur676b8: 0, fxCur676bc: 0, fxCur676c0: 0,
    fxCur676c4: 0, fxCur676c8: 0, fxCur676cc: 0,
    fxLerpGate676b4: 0,
  };

  /* Type 4/subtype 4 world: 74efd0 pure-open + 1830c==1 -> lerp ALWAYS. */
  const mem4 = makeGuestMemory();
  const patch4 = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem4, { overrides: { 0x0: 4 } }),
    guestRead: mem4.reader(),
  });
  const outLive = resumeGameUpdateRoomUpdateHead(
    st, { challenge0x123: 0, ...patch4 }, { ...ev0 });
  assert.equal(outLive.events.opaqueRoomUpdateTailWaterB16, 0,
    "blob lane live + gate open + neither walk armed -> coarse RETIRED");
  assert.equal(outLive.events.waterB16WireApplied, 1, "wire ran");
  assert.equal(outLive.events.waterB16Step0, 0x3f600000,
    "step[0] = lerp(0.5 -> 0.875) driven by the captured src lane");
  assert.equal(outLive.events.waterB16Gate, 1,
    "spray flag ON (both WIDE bytes low-byte 0)");
  /* THE control: the same tick with the blob voucher silent-zeroed —
     the conjunction never opens, the pre-v95 monolith keeps firing. */
  const outNoBlob = resumeGameUpdateRoomUpdateHead(
    st, { challenge0x123: 0, ...patch4, waterB16BlobReady: 0 }, { ...ev0 });
  assert.equal(outNoBlob.events.opaqueRoomUpdateTailWaterB16, 1,
    "without the blob lane the coarse edge still fires");
  assert.equal(outNoBlob.events.waterB16WireApplied, 0, "no wire");

  /* Type 3 world: 74efd0 falls to the challenge-mask law
     (unlock_acc & ~unlock_clear & 2) — the value the bridge computed by
     WALKING the action map decides the lerp. Keys {38,39} (0x40 ABSENT):
     acc=bit0|bit1=3, clear=0 -> bit1 survives -> lerp ON
     (step[0] 0.5 -> 0.875). */
  const mem3 = makeGuestMemory();
  const patch3 = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem3, { keys: [0x38, 0x39] }),
    guestRead: mem3.reader(),
  });
  assert.equal(patch3.waterB16UnlockAcc, 3);
  assert.equal(patch3.waterB16UnlockClear, 0);
  const outT3 = resumeGameUpdateRoomUpdateHead(
    st, { challenge0x123: 0, ...patch3 }, { ...ev0 });
  assert.equal(outT3.events.waterB16Step0, 0x3f600000,
    "walked mask bit1 opens the type-3 lerp");
  /* Same world minus action id 0x39 -> walked acc loses bit1 -> the
     machine-equivalent lerp gate CLOSES (step stays the raw source). */
  const mem3b = makeGuestMemory();
  const patch3b = captureUpdateB16Blob({
    gameView: makeB16BlobWorld(mem3b, { keys: [0x38] }),
    guestRead: mem3b.reader(),
  });
  assert.equal(patch3b.waterB16UnlockAcc, 1);
  const outT3b = resumeGameUpdateRoomUpdateHead(
    st, { challenge0x123: 0, ...patch3b }, { ...ev0 });
  assert.equal(outT3b.events.waterB16Step0, 0x3f000000,
    "no mask bit1 -> lerp closed -> step is the raw src vector");
});

test("captureUpdateLanes wires the B16 blob pack live beside the spawn-row pack", async () => {
  const { captureUpdateLanes } = await nativeBridge();
  const GPV = 0x50000000;
  const mem = makeGuestMemory();
  /* Greed world: empty player vector (count 0 IS captured). */
  mem.u32(GPV + 0x1baa8, 0x60000000);
  mem.u32(GPV + 0x1baac, 0x60000000);
  const gameView = makeB16BlobWorld(mem);
  /* Spawn-row pack shares the room: zero the full 6x5 slot array so the
     interior type-7 enumeration resolves (empty -> counts 0). */
  mem.zero(0x70000000 + 0x24, 6 * 5 * 4);
  /* Spawn-row arming state (module truth; the 6x5 interior is empty). */
  const armState = {
    challenge0x123: 1,
    roomType8: 0,
    waterPre: Math.fround(
      (f32OfBits(0x3f63d70a) + f32OfBits(0x3f68f5c3)) / 2 - f32OfBits(0x3dcccccd)),
    lavaPre: f32OfBits(0x3e4ccccd),
    descFlags44: 32,
  };
  const live = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
    b16ArmState: armState,
  });
  assert.equal(live.waterB16BlobReady, 1, "blob pack rides the lanes");
  assert.equal(live.waterB16SpawnRowsReady, 1, "spawn pack still rides");
  assert.equal(live.waterB16UnlockClear, 2);
  assert.equal(live.b3b7WidthC, 6);

  /* Capture not installed (no reader) -> every voucher quiet. */
  const off = captureUpdateLanes({ gameView });
  assert.ok(!("waterB16BlobReady" in off));
  assert.ok(!("waterB16SpawnRowsReady" in off));

  /* Group independence: a torn ROOM src lane kills ONLY the blob pack;
     the spawn-row enumeration still captures. */
  const ROOM = 0x70000000;
  mem.drop(ROOM + 0x1b10, 1);
  const half = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
    b16ArmState: armState,
  });
  assert.ok(!("waterB16BlobReady" in half), "torn blob lane -> blob absent");
  assert.equal(half.waterB16SpawnRowsReady, 1, "spawn row pack unaffected");
});

/* ------------------------------------------------------------------ */
/* 8c. ABI v139 records idx13/idx35 B1 rain shared-half ROW pack —      */
/*     live decor-vector + descriptor-seed sources, seam-supplied host  */
/*     leaves (midRestockOwner precedent).                              */
/* ------------------------------------------------------------------ */

const bitsOfF32 = (value) =>
  new Uint32Array(new Float32Array([Math.fround(value)]).buffer)[0] >>> 0;

/** Model/cpp voucher law mirror (game-update-model.mjs b1RainVoucherLive /
 *  game_update_slice.cpp isaac_slice_b1_rain_voucher_live): proves the
 *  producer's rows flow into a LIVE voucher, not just well-formed lanes. */
function b1RainVoucherLive(rt) {
  if ((rt.b1RainRowsReady | 0) === 0) return false;
  const n = rt.b1RainSpawnCount | 0;
  if (n < 0 || n > 64) return false; /* over-cap poisons; never truncate */
  const q = rt.b1RainQualityEcho >>> 0;
  const d = rt.b1RainDecorCountEcho >>> 0;
  if ((n >>> 0) !== (q <= d ? q : d)) return false;
  if ((rt.b1RainRow0ShuffleSeedIn >>> 0) !== (rt.b1RainSeed0Echo >>> 0)) return false;
  for (let k = 0; k + 1 < n; k += 1) {
    if ((rt[`b1RainRow${k}ShuffleSeedOut`] >>> 0) !==
        (rt[`b1RainRow${k + 1}ShuffleSeedIn`] >>> 0)) return false;
  }
  for (let k = 0; k < n; k += 1) {
    if ((rt[`b1RainRow${k}IterIndex`] >>> 0) !== (k >>> 0)) return false;
  }
  return true;
}

/** Deterministic B1 rain world: Game buffer words + guest Room/desc.
 *  `elements` = decor vector length in 0x78-byte slots. */
function makeB1RainWorld(mem, { elements = 3, seed0 = 0x12345678 } = {}) {
  const ROOM = 0x70000000;
  const DESC = 0x74000000;
  const BEGIN = 0x60000000;
  mem.zero(ROOM, 0x800);
  mem.u32(ROOM + 4, DESC);
  mem.zero(DESC, 0x100);
  mem.u32(DESC + 0x58, seed0);
  mem.u32(ROOM + 0xc, 15); /* widthC */
  mem.u32(ROOM + 0x10, 9); /* height10 */
  const gameView = makeGameBuffer({
    0x18300: ROOM,
    0x183a4: BEGIN,
    0x183a8: BEGIN + elements * 0x78,
  });
  return { gameView, ROOM };
}

test("B1 rain row capture pack: seed-chain rows flow from the live decor vector + descriptor seed", async () => {
  const { captureUpdateB1RainRows } = await nativeBridge();
  const mem = makeGuestMemory();
  const SEED0 = 0x12345678;
  const { gameView } = makeB1RainWorld(mem, { elements: 5, seed0: SEED0 });

  /* owner latch set + raw quality 3 -> base 8 (the 4/6/8 seam law);
     count = UNSIGNED min(8, 5) = 5 executed rows. */
  const patch = captureUpdateB1RainRows({
    gameView,
    guestRead: mem.reader(),
    ownerState: { ownerNonzero: 1, quality: 3 },
  });
  assert.equal(patch.b1RainRowsReady, 1, "all reads resolved -> voucher");
  assert.equal(patch.b1RainSpawnCount, 5, "count == min(base, decor)");
  assert.equal(patch.b1RainQualityEcho, roomB1SpawnBaseCount(1, 3), "8 arm");
  assert.equal(patch.b1RainOwnerNonzeroEcho, 1);
  assert.equal(patch.b1RainDecorCountEcho, 5);
  assert.equal(patch.b1RainSeed0Echo, SEED0 >>> 0);

  /* Row truth vs the landed pure laws, recomputed HERE independently:
     chain closure, corner pick, and world xy bits. */
  const corners = roomB1CornerIndices(15, 9);
  let seed = SEED0 >>> 0;
  for (let k = 0; k < 5; k += 1) {
    assert.equal(patch[`b1RainRow${k}IterIndex`], k, "dense PE order");
    assert.equal(patch[`b1RainRow${k}ShuffleSeedIn`] >>> 0, seed);
    const shuffled = roomB1RngXorshift(seed);
    const seedOut = roomB1RngXorshift(shuffled);
    assert.equal(patch[`b1RainRow${k}ShuffleSeedOut`] >>> 0, seedOut,
      `row ${k} carries both xorshift steps`);
    assert.equal(patch[`b1RainRow${k}CornerPick`], seedOut & 3);
    const xy = roomB1CornerWorldXy(roomB1CornerPick(corners, seedOut), 15);
    assert.equal(patch[`b1RainRow${k}WorldX`], bitsOfF32(xy.x));
    assert.equal(patch[`b1RainRow${k}WorldY`], bitsOfF32(xy.y));
    /* Host-domain outcome fields: no bridge-side producer -> zeros
       (the B16 entity_ptr precedent). */
    for (const f of ["SearchOk", "SearchDraws", "CreateEntityPtr",
      "BindRepositioned", "BindReposDraws", "ReposX", "ReposY",
      "BindStore7764"]) {
      assert.equal(patch[`b1RainRow${k}${f}`], 0, `${f} row ${k}`);
    }
    seed = seedOut;
  }
  assert.ok(!("b1RainRow5IterIndex" in patch), "no rows past spawn_count");

  /* Every emitted key must be a tracked lane (silent-zero class guard). */
  for (const key of Object.keys(patch)) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }
  /* And the whole pack satisfies the module-side voucher law. */
  assert.equal(b1RainVoucherLive(patch), true, "voucher goes LIVE");

  /* owner==0 keeps base at 4 regardless of quality; rows stop at the
     count law's min. */
  const ownerZero = captureUpdateB1RainRows({
    gameView,
    guestRead: mem.reader(),
    ownerState: { ownerNonzero: 0, quality: 99 },
  });
  assert.equal(ownerZero.b1RainOwnerNonzeroEcho, 0);
  assert.equal(ownerZero.b1RainQualityEcho, 4, "base 4 with no owner");
  assert.equal(ownerZero.b1RainSpawnCount, 4, "min(4, 5)");
  assert.equal(b1RainVoucherLive(ownerZero), true);

  /* All-or-nothing absence arms — each keeps EVERY lane off. */
  const absent = (label, world) => {
    const p = captureUpdateB1RainRows(world);
    assert.ok(!("b1RainRowsReady" in p), label);
    assert.equal(Object.keys(p).length, 0, `${label} emits nothing`);
  };
  absent("missing ownerState", { gameView, guestRead: mem.reader() });
  absent("null room ptr", {
    gameView: makeGameBuffer({ 0x18300: 0 }),
    guestRead: mem.reader(),
    ownerState: { ownerNonzero: 1, quality: 3 },
  });
  absent("torn seed read", {
    gameView,
    guestRead: (() => { mem.drop(0x74000000 + 0x58, 1); return mem.reader(); })(),
    ownerState: { ownerNonzero: 1, quality: 3 },
  });
  /* Zero seed -> xorshift fatal before row 0 -> partial rows impossible. */
  mem.u32(0x74000000 + 0x58, 0);
  absent("zero seed fatal", {
    gameView,
    guestRead: mem.reader(),
    ownerState: { ownerNonzero: 1, quality: 3 },
  });
});

test("captureUpdateLanes wires the B1 rain pack beside the other packs; missing seam state keeps its voucher quiet", async () => {
  const { captureUpdateLanes } = await nativeBridge();
  const GPV = 0x50000000;
  const mem = makeGuestMemory();
  /* Greed world: empty player vector (count 0 IS captured). */
  mem.u32(GPV + 0x1baa8, 0x60000000);
  mem.u32(GPV + 0x1baac, 0x60000000);
  const { gameView } = makeB1RainWorld(mem, { elements: 2 });
  const ownerState = { ownerNonzero: 1, quality: 2 }; /* base 6 -> min(6,2)=2 */

  const live = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
    b1RainOwnerState: ownerState,
  });
  assert.equal(live.b1RainRowsReady, 1, "rain pack rides the lanes");
  assert.equal(live.b1RainSpawnCount, 2);
  assert.equal(live.greedProbePackReady, 1, "greed pack unaffected");
  for (const key of Object.keys(live).filter((k) => k.startsWith("b1Rain"))) {
    assert.ok(key in RUNTIME_INPUTS_LAYOUT, `${key} must be a tracked lane`);
  }
  assert.equal(b1RainVoucherLive(live), true, "merged lanes keep the voucher live");

  /* No seam state -> ONLY the rain group stays absent (the byte-for-byte
     fallback both records already pin); the greed walk still captures. */
  const noSeam = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
  });
  assert.ok(!("b1RainRowsReady" in noSeam), "absent ownerState -> rain absent");
  assert.equal(noSeam.greedProbePackReady, 1);

  /* A torn descriptor seed read poisons the rain voucher inside the full
     merge without touching any other pack. */
  mem.drop(0x74000000 + 0x58, 1);
  const torn = captureUpdateLanes({
    gameView,
    guestRead: mem.reader(),
    gamePointerValue: GPV,
    b1RainOwnerState: ownerState,
  });
  assert.ok(!("b1RainRowsReady" in torn), "torn read -> absent");
  assert.equal(torn.greedProbePackReady, 1);
});
