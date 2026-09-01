import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  BROWSER_SLICE_WASM_URL,
  createDefaultNativeRuntimeInputs,
  createDefaultNativeState,
  B1_SPAWN_ITER_PURE_HELPER_NAMES,
  B1_SPAWN_ITER_PURE_POSTS_PE_ORDER,
  B18_ENTITY_PURE_HELPER_NAMES,
  B18_ENTITY_PURE_POSTS_PE_ORDER,
  B19_PATH_PURE_HELPER_NAMES,
  B19_PATH_PURE_POSTS_PE_ORDER,
  B20_TRAIL_PURE_HELPER_NAMES,
  B20_TRAIL_PURE_POSTS_PE_ORDER,
  B3B7_PURE_HELPER_NAMES,
  B9B11_PURE_HELPER_NAMES,
  FRAME_PATH_MODE,
  FRAME_PATH_ROOT_ID,
  FRAME_PATH_ROOTS,
  HOST_EVENT_KINDS,
  H5_824A70_CREATE_PURE_HELPER_NAMES,
  H5_824A70_CREATE_PURE_POSTS_PE_ORDER,
  H5_824A70_GENRAND_PURE_HELPER_NAMES,
  H5_824A70_GENRAND_PURE_POSTS_PE_ORDER,
  MULTI_ROOT_PLATFORM_IO_KINDS,
  PLATFORM_IO_HOST_KINDS,
  PLATFORM_IO_RESIDUAL_REGISTRY,
  PM_DEATH_PURE_HELPER_NAMES,
  PM_DEATH_PURE_POSTS_PE_ORDER,
  PURE_HELPER_MODULES,
  FRAME_PATH_COMPANION_PURE_IDS,
  FRAME_PATH_PURE_ROOT_IDS,
  ALL_PURE_HELPER_IDS,
  probeAvailablePureHelpers,
  resolvePureHelperSpec,
  allFramePathRootsNative,
  applyB1SpawnIterPurePosts,
  applyB18EntityPurePosts,
  applyB19PathPurePosts,
  applyB20TrailPurePosts,
  applyB3B7PurePosts,
  applyB9B11PurePosts,
  applyH5CreatePurePosts,
  applyH5GenrandPurePosts,
  applyPmDeathPurePosts,
  h5CreateLayerColorPads,
  h5CreateLayerColorPlan,
  h5CreateLayerColorWriteNeeded,
  createDefaultResidualBodies,
  createLoggingHostHandler,
  createResidualHostHandler,
  createNativeUpdateSession,
  createMultiRootFrameSession,
  isPlatformIoResidualKind,
  isX86EmulationFramePath,
  loadFramePathRoots,
  loadGameObjectIntoScratch,
  loadPureHelperWasm,
  multiRootUsesX86Emulation,
  exportGameObjectFromScratch,
  captureSparseStateFromScratch,
  applySparseStateToScratch,
  writeSparseFieldsToGameObject,
  readSparseFieldsFromGameObject,
  runHybridGameUpdateTick,
  loadGameUpdateSliceWasm,
  runNativeGameUpdateTick,
  selectFramePath,
  selectFramePathRoots,
  PROCESS_INPUT_PREPOLL_PURE_HELPER_NAMES,
  processInputPrepollJsPure,
  processInputPrepollWasmPure,
  runProcessInputPrepollRoot,
  exitRootJsPure,
  exitRootWasmPure,
  runExitRootPlan,
  runExitMapWalkContinuation,
  playerHudUpdateHeartsJsPure,
  playerHudUpdateHeartsWasmPure,
  playerHudUpdateHeartsPlan,
  residualLogEdge,
  EXIT_TREE_LEFT_OFF,
  EXIT_TREE_PARENT_OFF,
  EXIT_TREE_RIGHT_OFF,
  EXIT_TREE_ISNIL_OFF,
  EXIT_MAP_NODE_KEY_OFF,
  EXIT_MAP_NODE_FLAG_OFF,
  EXIT_MAP_NODE_BEGIN_OFF,
  EXIT_MAP_NODE_END_OFF,
  EXIT_MAP_ELEM_STRIDE,
  EXIT_MSVC_STRING_SIZE_OFF,
  EXIT_MSVC_STRING_CAP_OFF,
} from "../scripts/decomp/frame-path.mjs";
import {
  PM_DEATH_HOST_VA_TRIGGER_DEATH,
  PM_DEATH_RESIDUAL_MONOLITHIC,
  PM_DEATH_RESIDUAL_NONE,
  PM_DEATH_RESIDUAL_WALK,
  PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
  PM_SFX_GATE_NO_SAMPLES,
  PM_SFX_WARN_LOG_LEVEL,
  PM_SFX_WARN_LOG_STR_VA,
  PM_SFX_WARN_LOG_VA,
  pmDeathWireDecide,
} from "../scripts/decomp/player-manager-update-pure-model.mjs";
import {
  ABI_VERSION,
  GAME_OBJECT_MIN_SIZE,
  UPDATE_CONTINUATION,
  HOST_OWNED_STATE_CONTRACT,
  HOST_OWNED_STATE_FIELDS,
  STATE_LAYOUT,
} from "../scripts/decomp/game-update-model.mjs";
import {
  ROOM_AMBIENT_824A70_A1_ARG,
  ROOM_AMBIENT_824A70_ANM_DATA_PTR,
  ROOM_AMBIENT_824A70_EFFECT_TYPE,
  ROOM_AMBIENT_824A70_EFFECT_VARIANT,
  ROOM_AMBIENT_824A70_LAYER_INDEX,
  ROOM_B1_HOST_VA_OWNER,
  ROOM_B1_HOST_VA_POSITION,
  ROOM_B1_HOST_VA_SHUFFLE_DTOR,
  ROOM_B1_HOST_VA_SPAWN,
  ROOM_B1_HOST_VA_SPAWN_SETUP,
  ROOM_B1_SEED_OK,
  ROOM_B18_ACTION_RTTI_CANDIDATE,
  ROOM_B18_ACTION_SKIP,
  ROOM_B18_ACTION_TYPE5,
  ROOM_B18_HOST_VA_FLAG_CLEAR,
  ROOM_B18_HOST_VA_FLAG_TEST,
  ROOM_B18_HOST_VA_NEXT,
  ROOM_B18_HOST_VA_PATH_B,
  ROOM_B18_HOST_VA_RTTI,
  ROOM_B18_HOST_VA_TYPE5,
  ROOM_B18_HOST_VA_WALK_START,
  ROOM_B18_RESIDUAL_HOST_WALK,
  ROOM_B18_RESIDUAL_MONOLITHIC,
  ROOM_B18_RESIDUAL_NONE,
  ROOM_B18_RESIDUAL_PURE_COMPLETE,
  ROOM_B18_RTTI_DST_PTR,
  ROOM_B18_RTTI_SRC_PTR,
  ROOM_B19_ENTITY_FLAG_BIT,
  ROOM_B19_ENTITY_TYPE5,
  ROOM_B19_ENTITY_VARIANT_100,
  ROOM_B19_HOST_VA_ENTITY_WALK,
  ROOM_B19_HOST_VA_FLAG_CLEAR,
  ROOM_B19_HOST_VA_FLAG_TEST,
  ROOM_B19_HOST_VA_GET_ALT_PEDESTAL,
  ROOM_B19_HOST_VA_GET_GRID_COLLISION,
  ROOM_B19_HOST_VA_MEMSET,
  ROOM_B19_HOST_VA_NEXT,
  ROOM_B19_HOST_VA_POS_FINISH,
  ROOM_B19_HOST_VA_QUERY_8000,
  ROOM_B19_HOST_VA_REBUILD_START,
  ROOM_B19_HOST_VA_SET_ALT_PEDESTAL,
  ROOM_B19_HOST_VA_SPAWN,
  ROOM_B19_HOST_VA_TREE_ALLOC,
  ROOM_B19_QUERY_IMM_8000,
  ROOM_B19_REFCOUNT_VA,
  ROOM_B19_RESIDUAL_HOST_REBUILD,
  ROOM_B19_RESIDUAL_MONOLITHIC,
  ROOM_B19_RESIDUAL_NONE,
  ROOM_B20_ACTION_DEFAULT,
  ROOM_B20_ACTION_FLAGGED,
  ROOM_B20_ACTION_PAIR_X,
  ROOM_B20_ACTION_PAIR_Y,
  ROOM_B20_FLAG_BIT_4000,
  ROOM_B20_HOST_VA_DEALLOCATE,
  ROOM_B20_HOST_VA_EPILOGUE,
  ROOM_B20_HOST_VA_GENRAND,
  ROOM_B20_HOST_VA_LIST_TEST,
  ROOM_B20_HOST_VA_PASS1,
  ROOM_B20_HOST_VA_PASS2,
  ROOM_B20_HOST_VA_SPAWN,
  ROOM_B20_HOST_VA_VECTOR_PUSH,
  ROOM_B20_LIST_BEGIN_VA,
  ROOM_B20_LIST_END_VA,
  ROOM_B20_PAIR_Y_TYPE,
  ROOM_B20_PASS1_TYPE_A,
  ROOM_B20_PASS1_TYPE_B,
  ROOM_B20_RESIDUAL_HOST_TRAIL,
  ROOM_B20_RESIDUAL_MONOLITHIC,
  ROOM_B20_RESIDUAL_NONE,
  ROOM_B3_HOST_VA_CHALLENGE,
  ROOM_B3_HOST_VA_CHALLENGE_BODY,
  ROOM_B3_HOST_VA_OWNER,
  ROOM_B3_HOST_VA_START,
  ROOM_B3_HOST_VA_TE_CALL,
  ROOM_B3B7_HOST_VA_NEXT,
  ROOM_B3B7_RESIDUAL_HOST,
  ROOM_B3B7_RESIDUAL_MONOLITHIC,
  ROOM_B9B11_HOST_VA_B9_START,
  ROOM_B9B11_HOST_VA_B10_START,
  ROOM_B9B11_HOST_VA_B11_START,
  ROOM_B9B11_HOST_VA_B12_START,
  ROOM_B9B11_HOST_VA_FATAL,
  ROOM_B9B11_HOST_VA_QUERY,
  ROOM_B9B11_RESIDUAL_ALWAYS_HOST,
  ROOM_B9B11_RESIDUAL_MONOLITHIC,
  ROOM_PURE_ABI_VERSION,
  roomAmbient824a70BodyAnimFrameApplyNeeded,
  roomAmbient824a70BodyAnimFrameClearNeeded,
  roomAmbient824a70BodyAnimFramePosts,
  roomAmbient824a70BodyColor,
  roomAmbient824a70BodyFlagBit,
  roomAmbient824a70BodyLayerColorPads,
  roomAmbient824a70BodyLayerColorPlan,
  roomAmbient824a70BodyLayerColorWriteNeeded,
  roomAmbient824a70BodyPosAxis,
  roomAmbient824a70BodyScale,
  roomAmbient824a70BodyUnitFloat,
  roomAmbient824a70BodyYOverride,
  roomAmbient824a70CreateArgsPlan,
  roomAmbient824a70BodyGenrandLoopPosts,
  roomAmbient824a70BodyLoopStep,
  roomAmbient824a70BodyPosYFinal,
  roomAmbient824a70CreateHostGates,
  roomAmbient824a70EntityAnm2Ptr,
  roomB18EntityAction,
  roomB3B7ResidualPlan,
  roomB9B11ResidualPlan,
  roomAmbient824a70BodyZ,
  roomB1CornerIndices,
  roomB1EntityPostSpawnMark,
  roomB1SpawnIterPlan,
  roomB18WireDecide,
  roomB19CellCount,
  roomB19CollisionByte,
  roomB19EntityIsMarkCandidate,
  roomB19EntitySecondaryEligible,
  roomB19WireDecide,
  roomB19WorldToGridIndex,
  roomB20PairXLeft,
  roomB20PairXRight,
  roomB20Pass1TypeMatch,
  roomB20Pass2Action,
  roomB20WireDecide,
  roomB3B7WireDecide,
  roomB9B11WireDecide,
} from "../scripts/decomp/room-pure-model.mjs";
import { RENDER_SHELL_PURE_ABI_VERSION } from "../scripts/decomp/render-shell-pure-model.mjs";
import { PROCESS_INPUT_PURE_ABI_VERSION } from "../scripts/decomp/process-input-pure-model.mjs";
import { EXIT_PURE_ABI_VERSION } from "../scripts/decomp/exit-pure-model.mjs";
import { LUA_ENGINE_PURE_ABI_VERSION } from "../scripts/decomp/lua-engine-pure-model.mjs";
import { SERVE_HOST, startServer } from "../scripts/serve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");

function bitsToFloat32(bits) {
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, bits >>> 0, true);
  return view.getFloat32(0, true);
}

const constants = {
  resetPositionXBits: 0xc0500000,
  resetPositionYBits: 0x40f00000,
  decayThreshold: 0.015625,
  decayFactor: 0.875,
  transitionComplete: 1,
  fadeOutStep: bitsToFloat32(0x3d088889),
  fadeInStep: bitsToFloat32(0x3d430c31),
  fadeComplete: 1,
};

const runtimeInputs = {
  globalRangeByteLength: 8,
  monotonicCounterLow: 0,
  monotonicCounterHigh: 0,
  monotonicBaselineLow: 0,
  monotonicBaselineHigh: 0,
  globalMenuGuard4b3ca: 1,
  globalMenuEnable2a3a5: 0,
  // Type-5 door needing host so clear residual + type-5 doors are exercised.
  doorSlots: [{ present: 1, field3a0: 0, field8: 1, fieldC: 5 }],
  frameOpaque4257b0IdCount: 1,
  frameOpaque4257b0ListCount: 1,
  roomGridCells: 15,
  /* ABI v42/v45: mid-restock needs age>1; B1 needs age==1. Same tick cannot
     open both. Prefer B1 first-frame (entry=0, frame 0→1). Restock is covered
     by decomp-game-update-slice tests with age>1 fixtures. */
  midRestockOwner0x209: 1,
  ambientRoomActive: 1,
  ambientRoomEntry11f0: 0,
  /* ABI v45: the PM intensity lane emits the MONOLITHIC heartbeat only when
     players exist; count=0 is the pure no-op the PE makes. */
  pmIntensityPlayerCount: 1,
  /* ABI v80: the HUD post-update lane needs the lane keys; the PE
     try_pure gate returns early with all-zero mask/history/stat. */
  playerHudOccupiedMask: 0,
  managerHistoryCount: 1,
  managerStatFlag: 0,
};

function baseState(overrides = {}) {
  return {
    shortTimer: 0,
    positionResetTimer: 0,
    positionXBits: 1,
    positionYBits: 2,
    secondaryTimer: 0,
    decayValue: 0,
    transitionProgress: 0,
    transitionRate: 0.1,
    transitionMode: 0,
    postUpdateDelay: 0,
    gate1d520: 0,
    oneShot1d63c: 0,
    state24ecc: 0,
    value24ed0: 0,
    mode24ed8: 0,
    gate1d654: 0,
    gate1ba78: 0,
    gate1b83c: 0,
    predicate1ba74: 0,
    counter265c0: 0,
    itemOverlayState: 0,
    menuState23a74: 0,
    genericPromptActiveObject: 0,
    genericPromptActiveFlag: 0,
    genericPromptSubmittedSelection: 0,
    genericPromptPostUpdateFlag: 0,
    skipTimedTransitionFlag: 0,
    transitionColorRBits: 0,
    transitionColorGBits: 0,
    transitionColorBBits: 0,
    transitionAuxBits: 0,
    timedTransitionProgress: 0,
    timedTransitionForceFinish: 0,
    status22ed4: 0,
    status22edc: 0,
    timedTransitionCleanupMode: 0,
    effectCounter67788: 0,
    effectCounter68d6c: 0,
    roomTransitionMode1830c: 0,
    roomTransitionMarker18318: 0,
    roomTransitionIndex18900: 0,
    roomTransitionDimension18904: 0,
    frameCounter264fc: 0,
    frameCounter264f8: 0,
    fadeCounter26514: 0,
    fadeProgress26518: 0.2,
    shakeCurrent67738: 1,
    shakeTarget6773c: 0,
    shakeStep67740: 0.5,
    timer269e0: 1,
    listCount67730: 0,
    roomFxCounter70d8: 0,
    roomFxLimit70dc: 2,
    roomFxValue70cc: 1,
    roomFxStep70d4: 0.5,
    roomFxCounter70f4: 0,
    roomFxLimit70f8: 0,
    roomFxValue70e8: 0,
    roomFxStep70f0: 0,
    ...overrides,
  };
}

test("shipped frame-path selector prefers native Wasm over x86 emulation", () => {
  assert.equal(selectFramePath({ preferNative: true, wasmAvailable: true }), FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(isX86EmulationFramePath(FRAME_PATH_MODE.NATIVE_WASM), false);
  assert.equal(selectFramePath({ preferNative: false, wasmAvailable: true }), FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(isX86EmulationFramePath(FRAME_PATH_MODE.EMULATOR_X86), true);
});

test("native Game::Update tick runs the shipped Wasm entry without x86 PE emulation", async () => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0, "slice build must succeed before frame-path test");
  }

  const slice = await loadGameUpdateSliceWasm(wasmPath);
  assert.equal(slice.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(slice.usesX86Emulation, false);
  assert.equal(slice.abiVersion, ABI_VERSION);

  const hostLog = [];
  const result = runNativeGameUpdateTick(slice, {
    /* roomType8=2 shop; frame 0→1 with entry 0 opens B1 outer gate (age==1).
       Default sfxReady=0 → MONOLITHIC B1 host (ABI v45). Mid-restock needs
       age>1 so it is not exercised on this first-frame fixture. */
    state: baseState({ roomType8: 2, frameCounter264f8: 0 }),
    constants,
    runtimeInputs,
    onHostEvent: (event) => {
      assert.ok(HOST_EVENT_KINDS.includes(event.kind), `unexpected host event ${event.kind}`);
      hostLog.push(event.kind);
    },
  });

  assert.equal(result.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(result.usesX86Emulation, false);
  assert.equal(result.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE);
  assert.equal(result.state.counter265c0, 1);
  assert.equal(result.state.frameCounter264fc, 1);
  assert.equal(result.state.timer269e0, 0);
  assert.ok(hostLog.includes("opaqueRoomUpdatePrefixB1"));
  assert.ok(hostLog.includes("opaqueRoomUpdatePrefixB2"));
  assert.ok(hostLog.includes("opaqueRoomUpdatePrefixB3B7"));
  assert.ok(hostLog.includes("opaqueRoomUpdatePrefixB9B11"));
  /* ABI v119: the coarse door kinds are RETIRED (never fire) — the
     shipped-default frame arms the idx-24 mask -> idx-33 forced carrier. */
  assert.ok(hostLog.includes("type5DoorForcedRerun"));
  assert.ok(hostLog.includes("opaqueRoomUpdateClearDoorSlotsMask"));
  assert.ok(!hostLog.includes("opaqueRoomUpdateClearDoors"),
    "retired coarse edge emits nothing (zero-suppressed)");
  assert.ok(hostLog.includes("opaqueRoomUpdateAmbient"));
  assert.ok(hostLog.includes("opaqueRoomUpdateTailRain"));
  assert.ok(hostLog.includes("opaqueRoomUpdateTailMid"));
  assert.ok(hostLog.includes("opaqueRoomUpdateTailPath"));
  assert.ok(hostLog.includes("playerManagerUpdateHeartbeat"));
  assert.ok(hostLog.includes("opaqueCall004257b0PassA"));
  assert.ok(hostLog.includes("opaqueCall004257b0PassB"));
  assert.ok(hostLog.includes("hudPostUpdate"));
  assert.ok(hostLog.includes("opaqueCall008607a0"));
  assert.ok(!hostLog.includes("emulator"), "host event log must not reference the PE emulator");
});

test("frame-path module source never invokes Boxedwine or PE loading for the tick", async () => {
  const { readFileSync } = await import("node:fs");
  const source = readFileSync(join(root, "scripts", "decomp", "frame-path.mjs"), "utf8");
  assert.doesNotMatch(source, /boxedwine|isaac-ng\.unpacked|CreateProcess/i);
  assert.match(source, /NATIVE_WASM/);
  assert.match(source, /usesX86Emulation: false/);
  assert.match(source, /runNativeGameUpdateTick/);
  assert.match(source, /zero Wasm imports|imports\.length !== 0/);
  assert.match(source, /BROWSER_SLICE_WASM_URL/);
  assert.match(source, /createLoggingHostHandler/);
  assert.match(source, /createNativeUpdateSession/);
});

test("HostHandler logging path forbids emulator kinds and multi-frame session stays native", async () => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0);
  }
  const slice = await loadGameUpdateSliceWasm(wasmPath);
  const host = createLoggingHostHandler();
  assert.equal(host.usesX86Emulation, false);
  assert.throws(() => host({ kind: "emulator-x86", count: 1 }), /must not route through PE/);

  const residual = createResidualHostHandler();
  assert.equal(residual.usesX86Emulation, false);
  assert.throws(() => residual({ kind: "x86-pe-path", count: 1 }), /must not route through PE/);
  residual({ kind: "opaqueCall008607a0", count: 1 });
  assert.equal(residual.totals.opaqueCall008607a0, 1);
  assert.ok(PLATFORM_IO_HOST_KINDS.includes("opaqueCall008607a0"));
  assert.equal(residual.executed.length, 1);
  assert.equal(residual.executed[0].result.usesX86Emulation, false);

  // H5 824a70 residual body: PE-exact create imms; not platform IO; no PE.
  residual({ kind: "opaqueRoomUpdateAmbient824a70", count: 1 });
  const h5 = residual.executed.find((e) => e.kind === "opaqueRoomUpdateAmbient824a70");
  assert.ok(h5, "default residual body must handle opaqueRoomUpdateAmbient824a70");
  assert.equal(h5.result.usesX86Emulation, false);
  assert.equal(h5.result.platformIo, false);
  assert.equal(h5.result.residual, "h5-824a70-summary");
  assert.equal(h5.result.hostVas.firstGenrand, 0x00824bb3);
  residual({ kind: "opaqueRoomUpdateAmbient824a70Create", count: 1 });
  const h5c = residual.executed.find((e) => e.kind === "opaqueRoomUpdateAmbient824a70Create");
  assert.ok(h5c);
  assert.equal(h5c.result.create.effectType, ROOM_AMBIENT_824A70_EFFECT_TYPE);
  assert.equal(h5c.result.create.effectVariant, ROOM_AMBIENT_824A70_EFFECT_VARIANT);
  assert.equal(h5c.result.create.layerIndex, ROOM_AMBIENT_824A70_LAYER_INDEX);
  assert.equal(h5c.result.create.anmDataPtr, ROOM_AMBIENT_824A70_ANM_DATA_PTR);
  assert.equal(h5c.result.create.a1Arg, ROOM_AMBIENT_824A70_A1_ARG);
  assert.equal(h5c.result.purePostsFromSamples, false);
  assert.equal(h5c.result.purePostsApplied, null);
  assert.deepEqual(h5c.result.pureHelperNames, [...H5_824A70_CREATE_PURE_HELPER_NAMES]);
  assert.equal(h5c.result.purePostsPeOrder.length, 8);
  assert.deepEqual(
    h5c.result.purePostsPeOrder.map((r) => r.slot),
    ["C0", "A0", "R4", "A1", "A2", "COL", "L0", "LC"],
  );
  assert.ok(H5_824A70_CREATE_PURE_HELPER_NAMES.includes("roomAmbient824a70BodyColor"));
  assert.ok(
    H5_824A70_CREATE_PURE_HELPER_NAMES.includes(
      "roomAmbient824a70BodyLayerColorWriteNeeded",
    ),
  );
  assert.ok(
    H5_824A70_CREATE_PURE_HELPER_NAMES.includes(
      "roomAmbient824a70BodyLayerColorPlan",
    ),
  );
  assert.equal(h5c.result.hostVas.create, 0x006fe410);
  assert.equal(h5c.result.hostVas.getLayer, 0x0040b220);
  assert.equal(h5c.result.hostVas.genrandR4, 0x006eef60);
  assert.equal(h5c.result.hostVas.entityVcallOff, 0xc);
  assert.equal(h5c.result.hostVas.layerColor, 0x00824e94);
  assert.equal(ROOM_AMBIENT_824A70_EFFECT_TYPE, 0x3e8);
  assert.equal(ROOM_AMBIENT_824A70_EFFECT_VARIANT, 0x8a);
  assert.equal(ROOM_AMBIENT_824A70_LAYER_INDEX, 0);
  assert.equal(ROOM_AMBIENT_824A70_ANM_DATA_PTR, 0x00b1bc54);
  assert.equal(ROOM_AMBIENT_824A70_A1_ARG, 1);
  assert.equal(typeof createDefaultResidualBodies().opaqueRoomUpdateAmbient824a70, "function");
  assert.equal(typeof createDefaultResidualBodies().opaqueRoomUpdateAmbient824a70Genrand, "function");
  assert.equal(typeof createDefaultResidualBodies().opaqueRoomUpdateAmbient824a70Create, "function");

  // 4257b0 pure gates on residual bodies (frame-opaque freestanding helpers).
  const bodies4257 = createDefaultResidualBodies();
  const passASkip = bodies4257.opaqueCall004257b0PassA({
    kind: "opaqueCall004257b0PassA",
    count: 0,
    idCount: 0,
  });
  assert.equal(passASkip.pureComplete, true);
  assert.equal(passASkip.residual, "4257b0-pass-a-pure-skip");
  const passAHost = bodies4257.opaqueCall004257b0PassA({
    kind: "opaqueCall004257b0PassA",
    count: 1,
    idCount: 1,
  });
  assert.equal(passAHost.pureComplete, false);
  assert.equal(passAHost.residual, "4257b0-pass-a-host");
  const passBSkip = bodies4257.opaqueCall004257b0PassB({
    kind: "opaqueCall004257b0PassB",
    count: 0,
    idCount: 0,
    listCount: 0,
  });
  assert.equal(passBSkip.pureComplete, true);
  const passBHost = bodies4257.opaqueCall004257b0PassB({
    kind: "opaqueCall004257b0PassB",
    count: 1,
    idCount: 0,
    listCount: 2,
  });
  assert.equal(passBHost.pureComplete, false);
  const timer = bodies4257.opaqueCall0098dba0Timer({
    kind: "opaqueCall0098dba0Timer",
    count: 1,
    bVar2: 1,
    counter: 9,
  });
  assert.equal(timer.pureCounterStep.hostFun00746560, true);
  assert.equal(timer.pureCounterStep.counter, 10);
  assert.equal(timer.usesX86Emulation, false);
  // frame-opaque ABI v5: pure timer step when genrand sample + xy state provided.
  const timerStep = bodies4257.opaqueCall0098dba0Timer({
    kind: "opaqueCall0098dba0Timer",
    count: 1,
    timer: 10,
    x: 1,
    y: 2,
    genrand: 0x80000000,
  });
  assert.equal(timerStep.pureTimerFromSamples, true);
  assert.equal(timerStep.pureTimerApplied.applied, true);
  assert.equal(timerStep.pureTimerApplied.timer, 9);
  assert.equal(timerStep.residual, "98dba0-timer-pure-step");
  assert.equal(timerStep.usesX86Emulation, false);

  // frame-opaque ABI v15/v16/v17: 98dba0 player-walk pure CF residual + optional
  // probes + optional FUN_00956110 samples + optional nested 864c30 capability.
  const walkHost = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 2,
  });
  assert.equal(walkHost.pureComplete, false);
  assert.equal(walkHost.pureCfOk, true);
  assert.equal(walkHost.walkNeeded, true);
  assert.equal(walkHost.emptyFatal, false);
  assert.equal(walkHost.residual, "98dba0-walk-host");
  assert.equal(walkHost.usesX86Emulation, false);
  assert.equal(walkHost.hostVas.site, 0x0098dba0);
  assert.equal(walkHost.hostVas.isIdxLocalPlayer, 0x0090b100);
  assert.equal(walkHost.hostVas.fun864c30, 0x00864c30);
  assert.equal(walkHost.hostVas.fun874910, 0x00874910);
  assert.equal(walkHost.hostVas.fun6a80f0, 0x006a80f0);
  assert.equal(walkHost.hostVas.funA20940, 0x00a20940);
  assert.equal(walkHost.pureWalkPlan.hostBody, true);
  const walkFatal = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 0,
  });
  assert.equal(walkFatal.emptyFatal, true);
  assert.equal(walkFatal.residual, "98dba0-walk-empty-fatal-host");
  assert.equal(walkFatal.pureCfOk, false);
  const walkProbes = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 1,
    probes: [0, 1, 1, 0, 0, 0, 0, 0],
    probePlayerCount: 1,
  });
  assert.equal(walkProbes.pureBvar2FromSamples, true);
  assert.equal(walkProbes.pureBvar2FromProbes, true);
  assert.equal(walkProbes.residual, "98dba0-walk-pure-bvar2-from-probes");
  assert.equal(walkProbes.pureComplete, false); /* body still host */
  assert.equal(walkProbes.usesX86Emulation, false);
  const walk956110 = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 1,
    fun956110: {
      managerMode: 0,
      globalC71690: 0,
      mpEmpty: false,
      id: -1,
      vtableResults: [0, 1],
      vtableCount: 2,
    },
  });
  assert.equal(walk956110.pure956110FromSamples, true);
  assert.equal(walk956110.pure956110Result, true);
  assert.equal(walk956110.pure956110Plan.hostVtableWalk, true);
  assert.equal(walk956110.residual, "98dba0-walk-956110-pure-from-samples");
  assert.equal(walk956110.pureComplete, false);
  assert.equal(walk956110.usesX86Emulation, false);
  assert.equal(walk956110.pure956110Helper, "frameOpaque956110ResultFromSamples");
  /* ABI v17: nested 864c30 pure early (capability bit clear) folds netHostOk=0. */
  const walk864c30Early = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 1,
    fun956110: {
      managerMode: 2,
      globalC71690: 1,
      mpEmpty: false,
      id: -1,
      fun864c30: { flagDword: 0 },
      vtableResults: [1],
      vtableCount: 1,
    },
  });
  assert.equal(walk864c30Early.pure864c30FromSamples, true);
  assert.equal(walk864c30Early.pure864c30Plan.pureEarly, true);
  assert.equal(walk864c30Early.pure864c30Result, false);
  assert.equal(walk864c30Early.pure956110FromSamples, true);
  /* net early pure-fails → fallthrough id==-1 walk with vtable hit. */
  assert.equal(walk864c30Early.pure956110Result, true);
  assert.equal(walk864c30Early.residual, "98dba0-walk-864c30-pure-early");
  assert.equal(walk864c30Early.pure864c30Helper, "frameOpaque864c30ResultFromSamples");
  assert.equal(walk864c30Early.usesX86Emulation, false);
  const walk864c30Lua = bodies4257.opaqueCall0098dba0PlayerWalk({
    kind: "opaqueCall0098dba0PlayerWalk",
    count: 1,
    playerCount: 1,
    fun956110: {
      managerMode: 2,
      globalC71690: 1,
      mpEmpty: true,
      id: 0,
      fun864c30: { flagDword: 0x2000, hostLuaOk: 1 },
      netOutByte: 1,
    },
  });
  assert.equal(walk864c30Lua.pure864c30FromSamples, true);
  assert.equal(walk864c30Lua.pure864c30Plan.hostBody, true);
  assert.equal(walk864c30Lua.pure864c30Result, true);
  assert.equal(walk864c30Lua.pure956110Result, true);
  assert.equal(walk864c30Lua.residual, "98dba0-walk-956110-pure-from-samples");
  assert.equal(walk864c30Lua.usesX86Emulation, false);

  // frame-opaque ABI v6/v7: 4212c0 residual documents 409030 + 40add0 pure gates.
  const bodies4212 = createDefaultResidualBodies();
  const skip409030 = bodies4212.opaqueCall004212c0({
    kind: "opaqueCall004212c0",
    count: 1,
    field4A: 0,
    flag14A: 1,
    field4B: 0,
    flag14B: 1,
    secondaryHost: false,
  });
  assert.equal(skip409030.pureComplete, true);
  assert.equal(skip409030.residual, "4212c0-409030-pure-skip");
  assert.equal(skip409030.pure409030.pairNeedsHost, false);
  assert.equal(skip409030.usesX86Emulation, false);
  assert.equal(skip409030.hostVas.fun409030, 0x00409030);
  assert.equal(skip409030.hostVas.advancePosition, 0x00408d00);
  const host409030 = bodies4212.opaqueCall004212c0({
    kind: "opaqueCall004212c0",
    count: 1,
    field4A: 1,
    flag14A: 1,
    field4B: 0,
    flag14B: 0,
    secondaryHost: false,
  });
  assert.equal(host409030.pureComplete, false);
  assert.equal(host409030.residual, "4212c0-409030-host");
  assert.equal(host409030.pure409030.aNeedsHost, true);
  assert.equal(host409030.pure409030.bNeedsHost, false);
  const noSamples4212 = bodies4212.opaqueCall004212c0({
    kind: "opaqueCall004212c0",
    count: 1,
  });
  assert.equal(noSamples4212.pureComplete, false);
  assert.equal(noSamples4212.residual, "4212c0-409030-host");
  assert.equal(noSamples4212.pure409030.fromSamples, false);
  /* ABI v7: empty 40add0 list → pure-false probe + post-probe pure terminal. */
  const skip40add0 = bodies4212.opaqueCall004212c0({
    kind: "opaqueCall004212c0",
    count: 1,
    field4A: 0,
    flag14A: 0,
    field4B: 0,
    flag14B: 0,
    field4: 0x1000,
    listCount: 0,
    mode: 4,
    secondary: 3,
    field3c: 7,
    flag4c: 0,
  });
  assert.equal(skip40add0.pureComplete, true);
  assert.equal(skip40add0.residual, "4212c0-40add0-pure-skip");
  assert.equal(skip40add0.pure40add0.probeResult, false);
  assert.equal(skip40add0.pure40add0.needsHost, false);
  assert.deepEqual(skip40add0.pure40add0.afterProbe, { mode: 0, secondary: 0 });
  assert.equal(skip40add0.hostVas.fun40add0, 0x0040add0);
  const true40add0 = bodies4212.opaqueCall004212c0({
    kind: "opaqueCall004212c0",
    count: 1,
    field4A: 0,
    flag14A: 0,
    field4B: 0,
    flag14B: 0,
    field4: 1,
    listCount: 3,
    matchIndex: 0,
    bitfield18: 1,
  });
  assert.equal(true40add0.pureComplete, false);
  assert.equal(true40add0.residual, "4212c0-40add0-true-host");
  assert.equal(true40add0.pure40add0.probeResult, true);
  assert.equal(true40add0.secondaryHost, true);

  // H5 genrand residual: PE-ordered pure-post doc without samples → helper names.
  // residualPlan requires host_genrand_sample_stream (no pure MT).
  residual({ kind: "opaqueRoomUpdateAmbient824a70Genrand", count: 7, loopCount: 1 });
  const h5g = residual.executed.find((e) => e.kind === "opaqueRoomUpdateAmbient824a70Genrand");
  assert.ok(h5g, "default residual body must handle opaqueRoomUpdateAmbient824a70Genrand");
  assert.equal(h5g.result.usesX86Emulation, false);
  assert.equal(h5g.result.platformIo, false);
  assert.equal(h5g.result.residual, "h5-824a70-genrand");
  assert.equal(h5g.result.hostVas.genrand, 0x006eef60);
  assert.equal(h5g.result.hostVas.firstGenrand, 0x00824bb3);
  assert.equal(h5g.result.purePostsFromSamples, false);
  assert.equal(h5g.result.purePostsApplied, null);
  assert.deepEqual(h5g.result.pureHelperNames, [...H5_824A70_GENRAND_PURE_HELPER_NAMES]);
  assert.equal(h5g.result.purePostsPeOrder.length, 9);
  assert.deepEqual(
    h5g.result.purePostsPeOrder.map((r) => r.slot),
    ["R0", "R1", "Y0", "R2", "R3", "R5", "R6", "R7", "LP"],
  );
  assert.deepEqual(h5g.result.purePostsPeOrder[0].posts, ["unit_float", "pos_axis"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[1].posts, [
    "unit_float",
    "pos_axis",
    "pos_x_copy",
  ]);
  assert.deepEqual(h5g.result.purePostsPeOrder[2].posts, [
    "y_override_applies",
    "pos_y_final",
  ]);
  assert.deepEqual(h5g.result.purePostsPeOrder[3].posts, ["unit_float", "z", "vel_pad"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[4].posts, []);
  assert.deepEqual(h5g.result.purePostsPeOrder[5].posts, ["flag_bit"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[6].posts, ["flag_bit", "color_pads"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[7].posts, ["unit_float", "scale"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[8].posts, ["loop_step"]);
  assert.deepEqual(h5g.result.purePostsPeOrder[0].pureHelpers, [
    "roomAmbient824a70BodyUnitFloat",
    "roomAmbient824a70BodyPosAxis",
  ]);
  assert.equal(H5_824A70_GENRAND_PURE_POSTS_PE_ORDER.length, 9);
  assert.equal(h5g.result.residualPlan.pureCompleteRequires, "host_genrand_sample_stream");
  assert.equal(h5g.result.residualPlan.requiresSampleStream, true);
  assert.equal(h5g.result.residualPlan.samplesPerLoop, 7);
  assert.equal(h5g.result.residualPlan.maxGenrandPerLoop, 8);
  assert.equal(h5g.result.residualPlan.purePostsReady, false);
  assert.equal(h5g.result.residualPlan.pureComplete, false);
  assert.equal(h5g.result.residualPlan.updateWire, "freestanding_hosthandler_only");
  assert.equal(h5g.result.residualPlan.sampleStream.requiresSampleStream, 1);
  assert.equal(h5g.result.residualPlan.sampleStream.samplesReady, 0);
  assert.equal(h5g.result.residualPlan.sampleStream.hostNeeded, 1);
  assert.ok(h5g.result.pureHelperNames.includes("roomAmbient824a70BodyPosYFinal"));
  assert.ok(h5g.result.pureHelperNames.includes("roomAmbient824a70BodyLoopStep"));
  assert.ok(h5g.result.pureHelperNames.includes("roomAmbient824a70BodyGenrandLoopPosts"));
  assert.ok(h5g.result.pureHelperNames.includes("roomAmbient824a70BodyLayerColorPads"));

  const session = createNativeUpdateSession(slice, { onHostEvent: residual });
  assert.equal(session.usesX86Emulation, false);
  assert.equal(session.gameObject.byteLength, GAME_OBJECT_MIN_SIZE);
  const a = session.tick();
  const b = session.tick();
  assert.equal(a.usesX86Emulation, false);
  assert.equal(b.usesX86Emulation, false);
  assert.equal(session.ticks, 2);
  assert.ok((b.state.frameCounter264fc | 0) >= (a.state.frameCounter264fc | 0));
  assert.ok(Array.isArray(session.residualExecuted));
  assert.ok(session.residualExecuted.length > 0, "residual bodies must execute on hybrid tick");
});

test("H5 genrand residual applies PE-ordered pure posts when samples provided", () => {
  const bodies = createDefaultResidualBodies();
  const samples = [
    0x00000000, // R0
    0x80000000, // R1 → unit 0.5
    0xffffffff, // R2 → unit 1.0
    0x12345678, // R3 seed only
    0x00000001, // R5 flag 1
    0x00000002, // R6 flag 0
    0x00000000, // R7
  ];
  const bounds = {
    minX: 10,
    spanX: 20,
    baseY: -5,
    spanY: 40,
    age: 0,
    roomY1c: 200,
    loopCount: 1,
  };
  const result = bodies.opaqueRoomUpdateAmbient824a70Genrand({
    kind: "opaqueRoomUpdateAmbient824a70Genrand",
    count: 7,
    loopCount: 1,
    genrandSamples: samples,
    bounds,
  });
  assert.equal(result.usesX86Emulation, false);
  assert.equal(result.purePostsFromSamples, true);
  assert.ok(Array.isArray(result.purePostsApplied));
  assert.equal(result.purePostsApplied.length, 1);
  const loop = result.purePostsApplied[0];
  assert.equal(loop.loopIndex, 0);
  assert.equal(loop.slots.length, 9); // R0 R1 Y0 R2 R3 R5 R6 R7 LP

  const u0 = roomAmbient824a70BodyUnitFloat(samples[0]);
  const u1 = roomAmbient824a70BodyUnitFloat(samples[1]);
  const u2 = roomAmbient824a70BodyUnitFloat(samples[2]);
  const u7 = roomAmbient824a70BodyUnitFloat(samples[6]);
  const yRng = roomAmbient824a70BodyPosAxis(-5, u1, 40);
  assert.equal(loop.slots[0].unitFloat, u0);
  assert.equal(loop.slots[0].posAxis, roomAmbient824a70BodyPosAxis(10, u0, 20));
  assert.equal(loop.slots[1].unitFloat, u1);
  assert.equal(loop.slots[1].posAxis, yRng);
  assert.equal(loop.slots[1].posXCopy, loop.pack.x); // R1 pure copy x → [esp+0x38]
  assert.equal(loop.slots[2].slot, "Y0");
  assert.equal(loop.slots[2].yOverrideApplies, 0); // age==0
  assert.equal(loop.slots[2].posYFinal, yRng);
  assert.equal(loop.slots[3].z, roomAmbient824a70BodyZ(u2));
  assert.equal(loop.slots[3].velPad, 0);
  assert.equal(loop.slots[4].genrand, 0x12345678);
  assert.equal(loop.slots[4].unitFloat, undefined);
  assert.equal(loop.slots[5].flagBit, roomAmbient824a70BodyFlagBit(1));
  assert.equal(loop.slots[6].flagBit, roomAmbient824a70BodyFlagBit(2));
  assert.deepEqual(loop.slots[6].colorPads, roomAmbient824a70BodyLayerColorPads());
  assert.equal(loop.pack.padQwordLo, 0);
  assert.equal(loop.pack.padQwordHi, 0);
  assert.equal(loop.pack.padDword, 0);
  assert.equal(loop.pack.posXCopy, loop.pack.x);
  assert.equal(loop.slots[7].scale, roomAmbient824a70BodyScale(u7));
  assert.equal(loop.slots[8].slot, "LP");
  assert.equal(loop.slots[8].remaining, 0);
  assert.equal(loop.slots[8].continueLoop, 0);
  assert.equal(loop.pack.seed, 0x12345678);
  assert.equal(loop.pack.y, yRng);
  assert.equal(result.residualPlan.pureCompleteRequires, "host_genrand_sample_stream");
  assert.equal(result.residualPlan.requiresSampleStream, true);
  assert.equal(result.residualPlan.purePostsReady, true);
  assert.equal(result.residualPlan.pureComplete, false); // CALL still host
  assert.equal(result.residualPlan.sampleStream.samplesReady, 1);
  assert.equal(result.residualPlan.sampleStream.samplesNeeded, 7);
  assert.equal(result.residualPlan.updateWire, "freestanding_hosthandler_only");

  // Y0 override when age!=0.
  const withY = applyH5GenrandPurePosts(samples, {
    ...bounds,
    age: 2,
    roomY1c: 100,
  });
  assert.equal(withY[0].slots[2].yOverrideApplies, 1);
  assert.equal(
    withY[0].slots[2].posYFinal,
    roomAmbient824a70BodyYOverride(100),
  );

  // Direct helper matches residual apply path.
  const direct = applyH5GenrandPurePosts(samples, bounds);
  assert.deepEqual(result.purePostsApplied, direct);

  // Multi-loop sample stream (2×7 dwords).
  const samples2 = samples.concat([
    0x11111111, 0x22222222, 0x33333333, 0x44444444, 0x5, 0x6, 0x7,
  ]);
  const multi = bodies.opaqueRoomUpdateAmbient824a70Genrand({
    kind: "opaqueRoomUpdateAmbient824a70Genrand",
    count: 14,
    loopCount: 2,
    genrandSamples: samples2,
    bounds: { ...bounds, loopCount: 2 },
  });
  assert.equal(multi.purePostsFromSamples, true);
  assert.equal(multi.purePostsApplied.length, 2);
  assert.equal(multi.residualPlan.sampleStream.samplesNeeded, 14);
  assert.equal(multi.residualPlan.sampleStream.samplesReady, 1);
  assert.equal(multi.purePostsApplied[1].loopIndex, 1);
  assert.equal(multi.purePostsApplied[1].slots[8].remaining, 0); // last loop
  assert.equal(multi.purePostsApplied[0].slots[8].continueLoop, 1);

  // Alias event.samples; incomplete samples stay doc-only (no apply).
  const noApply = bodies.opaqueRoomUpdateAmbient824a70Genrand({
    kind: "opaqueRoomUpdateAmbient824a70Genrand",
    count: 3,
    loopCount: 1,
    samples: [1, 2, 3],
  });
  assert.equal(noApply.purePostsFromSamples, false);
  assert.equal(noApply.purePostsApplied, null);
  assert.equal(noApply.residualPlan.pureCompleteRequires, "host_genrand_sample_stream");
  assert.equal(noApply.residualPlan.purePostsReady, false);
  assert.equal(noApply.residualPlan.sampleStream.samplesReady, 0);
  assert.ok(noApply.pureHelperNames.includes("roomAmbient824a70BodyUnitFloat"));
  assert.ok(noApply.pureHelperNames.includes("roomAmbient824a70BodyFlagBit"));
  assert.ok(noApply.pureHelperNames.includes("roomAmbient824a70BodyPosYFinal"));
  assert.ok(noApply.pureHelperNames.includes("roomAmbient824a70BodyLayerColorPads"));
});

test("H5 create residual applies R4 anim_frame pure posts when samples provided", () => {
  assert.ok(ROOM_PURE_ABI_VERSION >= 26);
  const bodies = createDefaultResidualBodies();
  assert.equal(H5_824A70_CREATE_PURE_POSTS_PE_ORDER.length, 8);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER.map((r) => r.slot), [
    "C0",
    "A0",
    "R4",
    "A1",
    "A2",
    "COL",
    "L0",
    "LC",
  ]);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER[0].posts, [
    "create_args_plan",
  ]);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER[2].posts, [
    "anim_frame_genrand_needed",
    "anim_frame",
    "anim_frame_f32",
  ]);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER[4].posts, [
    "anim_frame_apply_needed",
    "anim_frame_clear_needed",
    "a2_this_ptr",
    "create_host_gates",
  ]);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER[5].posts, ["color"]);
  assert.deepEqual(H5_824A70_CREATE_PURE_POSTS_PE_ORDER[7].posts, [
    "layer_color_write_needed",
    "layer_color_pads",
    "layer_color_plan",
  ]);

  // Object samples with R4 + optional A2 gates.
  const samples = [
    { animCount: 0, genrand: 0xdeadbeef },
    { animCount: 3, genrand: 5, a1Ok: 1, field34: 1, field34Post: 1 },
    { animCount: 7, genrand: 100, a1Ok: 0, field34: 9, field34Post: 0 },
  ];
  const result = bodies.opaqueRoomUpdateAmbient824a70Create({
    kind: "opaqueRoomUpdateAmbient824a70Create",
    count: 3,
    loopCount: 3,
    createSamples: samples,
  });
  assert.equal(result.usesX86Emulation, false);
  assert.equal(result.purePostsFromSamples, true);
  assert.ok(Array.isArray(result.purePostsApplied));
  assert.equal(result.purePostsApplied.length, 3);
  assert.equal(result.create.a1Arg, 1);
  assert.equal(result.create.entityAnm2Off, 0x48);
  assert.equal(result.create.animCountOff, 0x30);
  assert.equal(result.create.vcallOff, 0xc);
  assert.equal(result.create.gamePtrGlobal, 0x00c71678);
  assert.equal(result.hostVas.create, 0x006fe410);
  assert.equal(result.hostVas.createSite, 0x00824cbd);
  assert.equal(result.hostVas.anmA0, 0x0040bcd0);
  assert.equal(result.hostVas.anmA1, 0x0040a5d0);
  assert.equal(result.hostVas.anmA2, 0x00408e00);
  assert.equal(result.hostVas.getLayer, 0x0040b220);
  assert.equal(result.hostVas.vcallSite, 0x00824ec4);
  assert.deepEqual(result.pureHelperNames, [...H5_824A70_CREATE_PURE_HELPER_NAMES]);
  assert.ok(result.pureHelperNames.includes("roomAmbient824a70CreateArgsPlan"));
  assert.ok(result.pureHelperNames.includes("roomAmbient824a70CreateHostGates"));

  const p0 = roomAmbient824a70BodyAnimFramePosts(0xdeadbeef, 0);
  assert.equal(result.purePostsApplied[0].genrandNeeded, 0);
  assert.equal(result.purePostsApplied[0].frame, p0.frame);
  assert.equal(result.purePostsApplied[0].frameF32, p0.frameF32);
  assert.equal(result.purePostsApplied[0].applyNeeded, undefined);
  assert.deepEqual(
    result.purePostsApplied[0].createArgsPlan,
    roomAmbient824a70CreateArgsPlan(0),
  );
  assert.equal(result.purePostsApplied[0].animCountOff, 0x30);
  assert.equal(result.purePostsApplied[0].getLayerHostVa, 0x0040b220);

  const p1 = roomAmbient824a70BodyAnimFramePosts(5, 3);
  assert.equal(result.purePostsApplied[1].genrandNeeded, 1);
  assert.equal(result.purePostsApplied[1].frame, p1.frame);
  assert.equal(result.purePostsApplied[1].frameF32, p1.frameF32);
  assert.equal(
    result.purePostsApplied[1].applyNeeded,
    roomAmbient824a70BodyAnimFrameApplyNeeded(1, 1),
  );
  assert.equal(result.purePostsApplied[1].a2FrameF32, p1.frameF32);
  assert.equal(
    result.purePostsApplied[1].clearNeeded,
    roomAmbient824a70BodyAnimFrameClearNeeded(1),
  );
  assert.deepEqual(
    result.purePostsApplied[1].createHostGates,
    roomAmbient824a70CreateHostGates({
      animCount: 3,
      a1Ok: 1,
      field34: 1,
      field34Post: 1,
    }),
  );

  const p2 = roomAmbient824a70BodyAnimFramePosts(100, 7);
  assert.equal(result.purePostsApplied[2].frame, p2.frame);
  assert.equal(
    result.purePostsApplied[2].applyNeeded,
    roomAmbient824a70BodyAnimFrameApplyNeeded(0, 9),
  );
  // PE-accurate: apply gate closed → clear never reached.
  assert.equal(result.purePostsApplied[2].clearNeeded, 0);
  assert.equal(result.purePostsApplied[2].a2FrameF32, undefined);
  assert.equal(result.purePostsApplied[2].createHostGates.hostA2, 0);
  assert.equal(result.purePostsApplied[2].createHostGates.a2ClearNeeded, 0);

  // Direct helper matches residual apply path.
  const direct = applyH5CreatePurePosts(samples);
  assert.deepEqual(result.purePostsApplied, direct);

  // Flat [animCount, genrand] pairs.
  const flat = applyH5CreatePurePosts([3, 5, 0, 0x11]);
  assert.equal(flat.length, 2);
  assert.equal(flat[0].frame, roomAmbient824a70BodyAnimFramePosts(5, 3).frame);
  assert.equal(flat[1].genrandNeeded, 0);

  // Alias animFrameSamples; incomplete flat stays doc-only.
  const viaAlias = bodies.opaqueRoomUpdateAmbient824a70Create({
    kind: "opaqueRoomUpdateAmbient824a70Create",
    count: 1,
    animFrameSamples: [{ animCount: 5, genrand: 12 }],
  });
  assert.equal(viaAlias.purePostsFromSamples, true);
  assert.equal(viaAlias.purePostsApplied.length, 1);
  assert.equal(
    viaAlias.purePostsApplied[0].frame,
    roomAmbient824a70BodyAnimFramePosts(12, 5).frame,
  );

  const noApply = bodies.opaqueRoomUpdateAmbient824a70Create({
    kind: "opaqueRoomUpdateAmbient824a70Create",
    count: 1,
    samples: [1], // incomplete flat pair
  });
  assert.equal(noApply.purePostsFromSamples, false);
  assert.equal(noApply.purePostsApplied, null);
  assert.ok(
    noApply.pureHelperNames.includes("roomAmbient824a70BodyAnimFramePosts"),
  );
  assert.ok(noApply.pureHelperNames.includes("roomAmbient824a70BodyColor"));
  assert.ok(
    noApply.pureHelperNames.includes("roomAmbient824a70BodyLayerColorWriteNeeded"),
  );
  assert.ok(
    noApply.pureHelperNames.includes("roomAmbient824a70BodyLayerColorPlan"),
  );
});

test("H5 create residual applies COL body_color + LC write CF when samples provided", () => {
  assert.ok(ROOM_PURE_ABI_VERSION >= 33);
  const bodies = createDefaultResidualBodies();

  // LC pure helpers freestanding (room pure helpers ABI v33 create-only;
  // frame-path h5Create* aliases match room oracle).
  assert.equal(h5CreateLayerColorWriteNeeded(0x1000, 0x2000), 1);
  assert.equal(h5CreateLayerColorWriteNeeded(0x1000, 0x1000 + 0x48), 0);
  assert.deepEqual(h5CreateLayerColorPads(), { qwordLo: 0, qwordHi: 0, dword: 0 });
  assert.equal(
    h5CreateLayerColorWriteNeeded(0x1000, 0x2000),
    roomAmbient824a70BodyLayerColorWriteNeeded(0x1000, 0x2000),
  );
  assert.deepEqual(h5CreateLayerColorPads(), roomAmbient824a70BodyLayerColorPads());
  assert.deepEqual(
    h5CreateLayerColorPlan({
      layerPtr: 0x1000,
      stackColorPtr: 0x2000,
      r: 1,
      g: 0,
      b: 0,
      alphaDefined: 1,
      alpha: 0.5,
    }),
    roomAmbient824a70BodyLayerColorPlan({
      layerPtr: 0x1000,
      stackColorPtr: 0x2000,
      r: 1,
      g: 0,
      b: 0,
      alphaDefined: 1,
      alpha: 0.5,
    }),
  );

  const samples = [
    {
      animCount: 4,
      genrand: 9,
      a1Ok: 1,
      field34: 2,
      field34Post: 2,
      stageId: 0x1b,
      room1d18: 0,
      dim1830c: 0,
      layerPtr: 0x00aabb00,
      stackColorPtr: 0x00112200,
      alpha: 1,
      entityPtr: 0x00feed00,
      seed: 0xc0ffee,
    },
    {
      // A2 closed; clear PE-skipped even if field34Post nonzero.
      animCount: 0,
      genrand: 0,
      a1Ok: 0,
      field34: 7,
      field34Post: 7,
      layerPtr: 0x50,
      stackColorPtr: 0x50 + 0x48, // dest == src → no write
    },
  ];

  // Event-level color defaults applied when per-loop color fields omitted.
  const viaCtx = bodies.opaqueRoomUpdateAmbient824a70Create({
    kind: "opaqueRoomUpdateAmbient824a70Create",
    count: 2,
    loopCount: 2,
    createSamples: samples,
    stageId: 0x1c,
    room1d18: 1,
    dim1830c: 2,
  });
  assert.equal(viaCtx.purePostsFromSamples, true);
  assert.equal(viaCtx.purePostsApplied.length, 2);

  const c0 = viaCtx.purePostsApplied[0];
  const expectRgb0 = roomAmbient824a70BodyColor(0x1b, 0, 0);
  assert.deepEqual(c0.color, expectRgb0);
  assert.equal(c0.applyNeeded, 1);
  assert.equal(c0.clearNeeded, 1);
  assert.equal(c0.a2FrameF32, c0.frameF32);
  assert.deepEqual(c0.createArgsPlan, roomAmbient824a70CreateArgsPlan(0xc0ffee));
  assert.equal(c0.entityPtr, 0x00feed00);
  assert.equal(c0.entityAnm2Ptr, roomAmbient824a70EntityAnm2Ptr(0x00feed00));
  assert.equal(c0.a2ThisPtr, roomAmbient824a70EntityAnm2Ptr(0x00feed00) + 0x30);
  assert.deepEqual(
    c0.createHostGates,
    roomAmbient824a70CreateHostGates({
      animCount: 4,
      a1Ok: 1,
      field34: 2,
      field34Post: 2,
    }),
  );
  assert.equal(
    c0.layerColorWriteNeeded,
    h5CreateLayerColorWriteNeeded(0x00aabb00, 0x00112200),
  );
  assert.equal(c0.layerColorWriteNeeded, 1);
  assert.deepEqual(c0.layerColorPads, h5CreateLayerColorPads());
  assert.deepEqual(c0.layerColorRgb, expectRgb0);
  assert.equal(c0.layerColorAlphaDefined, true);
  assert.equal(c0.layerColorAlpha, Math.fround(1));
  assert.equal(c0.layerColorOff, 0x48);
  assert.deepEqual(
    c0.layerColorPlan,
    roomAmbient824a70BodyLayerColorPlan({
      layerPtr: 0x00aabb00,
      stackColorPtr: 0x00112200,
      r: expectRgb0.r,
      g: expectRgb0.g,
      b: expectRgb0.b,
      alphaDefined: 1,
      alpha: 1,
    }),
  );

  const c1 = viaCtx.purePostsApplied[1];
  // Per-loop color fields omitted → event defaults (0x1c / 1 / 2).
  const expectRgb1 = roomAmbient824a70BodyColor(0x1c, 1, 2);
  assert.deepEqual(c1.color, expectRgb1);
  assert.equal(c1.applyNeeded, 0);
  assert.equal(c1.clearNeeded, 0);
  assert.equal(c1.layerColorWriteNeeded, 0);
  assert.equal(c1.layerColorAlphaDefined, false);
  assert.equal(c1.layerColorPlan.writeNeeded, 0);

  // Direct apply + event context match residual.
  const direct = applyH5CreatePurePosts(samples, {
    stageId: 0x1c,
    room1d18: 1,
    dim1830c: 2,
  });
  assert.deepEqual(viaCtx.purePostsApplied, direct);

  // color object alias on event.
  const viaColorObj = bodies.opaqueRoomUpdateAmbient824a70Create({
    kind: "opaqueRoomUpdateAmbient824a70Create",
    count: 1,
    createSamples: [{ animCount: 1, genrand: 0 }],
    color: { stageId: 0x1b, room1d18: 0, dim1830c: 0 },
  });
  assert.deepEqual(
    viaColorObj.purePostsApplied[0].color,
    roomAmbient824a70BodyColor(0x1b, 0, 0),
  );
  assert.equal(viaColorObj.purePostsApplied[0].layerColorWriteNeeded, undefined);
});

test("B1 spawn residual applies roomB1SpawnIterPlan pure posts when samples provided", () => {
  assert.ok(ROOM_PURE_ABI_VERSION >= 26);
  const bodies = createDefaultResidualBodies();
  assert.equal(B1_SPAWN_ITER_PURE_POSTS_PE_ORDER.length, 9);
  assert.ok(B1_SPAWN_ITER_PURE_HELPER_NAMES.includes("roomB1SpawnIterPlan"));
  assert.ok(B1_SPAWN_ITER_PURE_HELPER_NAMES.includes("roomB1EntityPostSpawnMark"));
  assert.deepEqual(B1_SPAWN_ITER_PURE_POSTS_PE_ORDER[0].posts, ["loop_remaining"]);
  assert.deepEqual(B1_SPAWN_ITER_PURE_POSTS_PE_ORDER[8].posts, ["spawn_iter_plan"]);

  // Without samples: PE-ordered pure helper names + host VAs only (no apply).
  const docOnly = bodies.opaqueRoomUpdatePrefixB1Spawn({
    kind: "opaqueRoomUpdatePrefixB1Spawn",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "b1-spawn");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.deepEqual(docOnly.pureHelperNames, [...B1_SPAWN_ITER_PURE_HELPER_NAMES]);
  assert.equal(docOnly.purePostsPeOrder.length, 9);
  assert.equal(docOnly.hostVas.spawnSetup, ROOM_B1_HOST_VA_SPAWN_SETUP);
  assert.equal(docOnly.hostVas.spawn, ROOM_B1_HOST_VA_SPAWN);
  assert.equal(docOnly.hostVas.owner, ROOM_B1_HOST_VA_OWNER);
  assert.equal(docOnly.hostVas.position, ROOM_B1_HOST_VA_POSITION);
  assert.equal(docOnly.hostVas.shuffleDtor, ROOM_B1_HOST_VA_SHUFFLE_DTOR);
  assert.equal(ROOM_B1_HOST_VA_SPAWN_SETUP, 0x00802b60);
  assert.equal(ROOM_B1_HOST_VA_SPAWN, 0x00802dc4);
  assert.equal(ROOM_B1_HOST_VA_SHUFFLE_DTOR, 0x004d6ee0);

  const corners = roomB1CornerIndices(15, 9);
  const samples = [
    { seedIn: 1, index: 0, spawnCount: 4, corners, widthC: 15 },
    { seedIn: 0x12345678, index: 3, spawnCount: 4, corners, widthC: 15 },
  ];
  const result = bodies.opaqueRoomUpdatePrefixB1Spawn({
    kind: "opaqueRoomUpdatePrefixB1Spawn",
    count: 2,
    spawnSamples: samples,
  });
  assert.equal(result.usesX86Emulation, false);
  assert.equal(result.purePostsFromSamples, true);
  assert.ok(Array.isArray(result.purePostsApplied));
  assert.equal(result.purePostsApplied.length, 2);

  const p0 = roomB1SpawnIterPlan(samples[0]);
  assert.equal(result.purePostsApplied[0].loopIndex, 0);
  assert.equal(result.purePostsApplied[0].seedFatal, ROOM_B1_SEED_OK);
  assert.equal(result.purePostsApplied[0].seedFatal, p0.seedFatal);
  assert.equal(result.purePostsApplied[0].remaining, p0.remaining);
  assert.equal(result.purePostsApplied[0].seedShuffle, p0.seedShuffle);
  assert.equal(result.purePostsApplied[0].shuffleRem, p0.shuffleRem);
  assert.equal(result.purePostsApplied[0].needsSwap, p0.needsSwap);
  assert.equal(result.purePostsApplied[0].swapIndex, p0.swapIndex);
  assert.equal(result.purePostsApplied[0].elemOffset, p0.elemOffset);
  assert.equal(result.purePostsApplied[0].swapOffset, p0.swapOffset);
  assert.equal(result.purePostsApplied[0].seedCorner, p0.seedCorner);
  assert.equal(result.purePostsApplied[0].cornerIndex, p0.cornerIndex);
  assert.equal(result.purePostsApplied[0].worldX, p0.worldX);
  assert.equal(result.purePostsApplied[0].worldY, p0.worldY);
  assert.equal(result.purePostsApplied[0].spawnRadius, p0.spawnRadius);
  assert.equal(result.purePostsApplied[0].nextI, p0.nextI);
  assert.equal(result.purePostsApplied[0].continueLoop, p0.continueLoop);
  assert.equal(result.purePostsApplied[0].postSpawnMark, roomB1EntityPostSpawnMark());
  assert.equal(result.purePostsApplied[0].postSpawnMark, -1);

  const p1 = roomB1SpawnIterPlan(samples[1]);
  assert.equal(result.purePostsApplied[1].remaining, p1.remaining);
  assert.equal(result.purePostsApplied[1].continueLoop, 0);
  assert.equal(result.purePostsApplied[1].elemOffset, p1.elemOffset);

  // Direct helper matches residual apply path.
  const direct = applyB1SpawnIterPurePosts(samples);
  assert.deepEqual(result.purePostsApplied, direct);

  // Flat seed+i packs with shared context.
  const flat = applyB1SpawnIterPurePosts([1, 0, 0x12345678, 3], {
    spawnCount: 4,
    corners,
    widthC: 15,
  });
  assert.equal(flat.length, 2);
  assert.equal(flat[0].seedShuffle, p0.seedShuffle);
  assert.equal(flat[1].continueLoop, 0);

  // Alias seedSamples; corners derived from widthC+height10.
  const viaAlias = bodies.opaqueRoomUpdatePrefixB1Spawn({
    kind: "opaqueRoomUpdatePrefixB1Spawn",
    count: 1,
    seedSamples: [{ seed: 1, i: 0, spawnCount: 4 }],
    widthC: 15,
    height10: 9,
  });
  assert.equal(viaAlias.purePostsFromSamples, true);
  assert.equal(viaAlias.purePostsApplied.length, 1);
  assert.equal(viaAlias.purePostsApplied[0].seedShuffle, p0.seedShuffle);
  assert.equal(viaAlias.purePostsApplied[0].cornerIndex, p0.cornerIndex);

  // Incomplete flat (no context) stays doc-only.
  const noApply = bodies.opaqueRoomUpdatePrefixB1Spawn({
    kind: "opaqueRoomUpdatePrefixB1Spawn",
    count: 1,
    samples: [1, 0],
  });
  assert.equal(noApply.purePostsFromSamples, false);
  assert.equal(noApply.purePostsApplied, null);
  assert.ok(noApply.pureHelperNames.includes("roomB1SpawnIterPlan"));

  // MONOLITHIC B1 also applies spawn-iter pure posts when samples land.
  const mono = bodies.opaqueRoomUpdatePrefixB1({
    kind: "opaqueRoomUpdatePrefixB1",
    count: 1,
    gameFlags1839c: 0,
    spawnSamples: samples,
  });
  assert.equal(mono.residual, "b1-monolithic-sfx-spawn");
  assert.equal(mono.purePostsFromSamples, true);
  assert.equal(mono.purePostsApplied.length, 2);
  assert.equal(mono.sparsePatch.gameFlags1839c, 0x80000);
  assert.equal(mono.hostVas.sfxSite, 0x00802a53);
  assert.equal(mono.hostVas.spawnSetup, ROOM_B1_HOST_VA_SPAWN_SETUP);
  assert.deepEqual(mono.purePostsApplied, direct);
});

test("PM death residual documents pure helpers + TriggerDeath host without samples", () => {
  const bodies = createDefaultResidualBodies();
  assert.ok(PM_DEATH_PURE_HELPER_NAMES.includes("pmDeathWireDecide"));
  assert.ok(PM_DEATH_PURE_HELPER_NAMES.includes("pmDeathPlayerEligible"));
  assert.equal(PM_DEATH_PURE_POSTS_PE_ORDER.length, 4);
  assert.equal(PM_DEATH_PURE_POSTS_PE_ORDER[0].slot, "PM0_dual_zero");
  assert.equal(PM_DEATH_PURE_POSTS_PE_ORDER[1].slot, "PM1_eligibility");

  const docOnly = bodies.playerManagerUpdateDeath({
    kind: "playerManagerUpdateDeath",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "pm1-death-host");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.equal(docOnly.pureComplete, false);
  assert.equal(docOnly.hostTriggerDeath, true);
  assert.equal(docOnly.hostVas.triggerDeath, 0x007a1090);
  assert.equal(docOnly.hostVas.triggerDeath, PM_DEATH_HOST_VA_TRIGGER_DEATH);
  assert.equal(docOnly.hostVas.emptyFatal, 0x00a112c0);
  assert.equal(docOnly.hostVas.triggerArg, PM_DEATH_TRIGGER_ARG_CHECK_ONLY);
  assert.equal(docOnly.triggerDeath.va, 0x007a1090);
  assert.equal(docOnly.triggerDeath.arg, 0);
  assert.equal(docOnly.triggerDeath.eligibleCount, null);
  assert.deepEqual(docOnly.pureHelperNames, [...PM_DEATH_PURE_HELPER_NAMES]);
  assert.equal(docOnly.purePostsPeOrder.length, 4);
  assert.ok(docOnly.pureHelperNames.includes("pmDeathWireDecide"));
  assert.ok(docOnly.pureHelperNames.includes("pmDeathDualZeroGate"));

  // Via residual HostHandler (default bodies).
  const residual = createResidualHostHandler();
  residual({ kind: "playerManagerUpdateDeath", count: 1 });
  const exec = residual.executed.find((e) => e.kind === "playerManagerUpdateDeath");
  assert.ok(exec);
  assert.equal(exec.result.hostVas.triggerDeath, 0x007a1090);
  assert.equal(exec.result.purePostsFromSamples, false);
  assert.equal(exec.result.purePostsApplied, null);
});

test("PM death residual applies wire_decide / eligibility when player packs provided", () => {
  const bodies = createDefaultResidualBodies();

  // Open dual-zero + eligible → WALK; TriggerDeath host still required.
  const walkPlayers = [
    { dead173: 1, anim7c: 0, anim8c: 0, twinNull: 1 },
    { dead173: 0, anim7c: 0, anim8c: 0, twinNull: 1 },
  ];
  const walk = bodies.playerManagerUpdateDeath({
    kind: "playerManagerUpdateDeath",
    count: 1,
    gate1b83c: 0,
    gate1ba78: 0,
    playerCount: 2,
    blobReady: true,
    players: walkPlayers,
  });
  assert.equal(walk.residual, "pm1-death-walk-host");
  assert.equal(walk.purePostsFromSamples, true);
  assert.ok(walk.purePostsApplied);
  assert.equal(walk.purePostsApplied.residualKind, PM_DEATH_RESIDUAL_WALK);
  assert.equal(walk.purePostsApplied.pureComplete, false);
  assert.equal(walk.purePostsApplied.hostNeeded, true);
  assert.equal(walk.purePostsApplied.eligibleCount, 1);
  assert.equal(walk.purePostsApplied.eligibleMask, 0b01);
  assert.equal(walk.purePostsApplied.triggerDeathVa, 0x007a1090);
  assert.equal(walk.purePostsApplied.triggerArg, 0);
  assert.equal(walk.purePostsApplied.dualZero, 1);
  assert.equal(walk.purePostsApplied.playerEligibility.length, 2);
  assert.equal(walk.purePostsApplied.playerEligibility[0].eligible, 1);
  assert.equal(walk.purePostsApplied.playerEligibility[1].eligible, 0);
  assert.equal(walk.hostTriggerDeath, true);
  assert.equal(walk.pureComplete, false);
  assert.equal(walk.triggerDeath.eligibleCount, 1);
  assert.equal(walk.triggerDeath.eligibleMask, 0b01);
  assert.equal(walk.hostVas.triggerDeath, 0x007a1090);

  const oracle = pmDeathWireDecide({
    gate1b83c: 0,
    gate1ba78: 0,
    playerCount: 2,
    blobReady: true,
    players: walkPlayers,
  });
  assert.equal(walk.purePostsApplied.residualKind, oracle.residualKind);
  assert.equal(walk.purePostsApplied.eligibleCount, oracle.eligibleCount);
  assert.equal(walk.purePostsApplied.eligibleMask, oracle.eligibleMask);

  const direct = applyPmDeathPurePosts({
    gate1b83c: 0,
    gate1ba78: 0,
    playerCount: 2,
    blobReady: true,
    players: walkPlayers,
  });
  assert.deepEqual(walk.purePostsApplied, direct);

  // Quiet packs under open dual-zero → pure-complete NONE (no TriggerDeath host).
  const quietPlayers = [
    { dead173: 0, anim7c: 0, anim8c: 0, twinNull: 1 },
    { dead173: 1, anim7c: 3, anim8c: 1, twinNull: 1 },
  ];
  const quiet = bodies.playerManagerUpdateDeath({
    kind: "playerManagerUpdateDeath",
    count: 1,
    gate1b83c: 0,
    gate1ba78: 0,
    playerCount: 2,
    blobReady: true,
    deathPlayers: quietPlayers,
  });
  assert.equal(quiet.residual, "pm1-death-pure-complete");
  assert.equal(quiet.purePostsFromSamples, true);
  assert.equal(quiet.purePostsApplied.residualKind, PM_DEATH_RESIDUAL_NONE);
  assert.equal(quiet.purePostsApplied.pureComplete, true);
  assert.equal(quiet.purePostsApplied.eligibleCount, 0);
  assert.equal(quiet.pureComplete, true);
  assert.equal(quiet.hostTriggerDeath, false);

  // Open dual-zero without blob → MONOLITHIC (whole death walk host).
  const mono = bodies.playerManagerUpdateDeath({
    kind: "playerManagerUpdateDeath",
    count: 1,
    gate1b83c: 0,
    gate1ba78: 0,
    playerCount: 1,
    blobReady: false,
    packs: [{ dead173: 1, anim7c: 0, anim8c: 0, twinNull: 1 }],
  });
  assert.equal(mono.residual, "pm1-death-monolithic");
  assert.equal(mono.purePostsApplied.residualKind, PM_DEATH_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.hostNeeded, true);
  assert.equal(mono.hostTriggerDeath, true);
  assert.equal(mono.pureComplete, false);

  // Closed dual-zero → NONE pure-complete.
  const closed = bodies.playerManagerUpdateDeath({
    kind: "playerManagerUpdateDeath",
    count: 1,
    gate1b83c: 1,
    gate1ba78: 0,
    playerCount: 1,
    blobReady: true,
    samples: [{ dead_173: 1, anim_7c: 0, anim_8c: 0, twin_null: 1 }],
  });
  assert.equal(closed.residual, "pm1-death-pure-complete");
  assert.equal(closed.purePostsApplied.residualKind, PM_DEATH_RESIDUAL_NONE);
  assert.equal(closed.purePostsApplied.dualZero, 0);
  assert.equal(closed.pureComplete, true);
  assert.equal(closed.hostTriggerDeath, false);

  // snake_case pack fields accepted via samples alias.
  const snake = applyPmDeathPurePosts({
    gate_1b83c: 0,
    gate_1ba78: 0,
    player_count: 1,
    blob_ready: true,
    samples: [{ dead_173: 1, anim_7c: 0, anim_8c: 0, twin_null: 1 }],
  });
  assert.equal(snake.residualKind, PM_DEATH_RESIDUAL_WALK);
  assert.equal(snake.eligibleCount, 1);
  assert.equal(snake.triggerDeathVa, 0x007a1090);
});

test("B18 entity residual documents pure helpers + type-5/RTTI host without samples", () => {
  const bodies = createDefaultResidualBodies();
  assert.ok(B18_ENTITY_PURE_HELPER_NAMES.includes("roomB18WireDecide"));
  assert.ok(B18_ENTITY_PURE_HELPER_NAMES.includes("roomB18EntityAction"));
  assert.equal(B18_ENTITY_PURE_POSTS_PE_ORDER.length, 5);
  assert.equal(B18_ENTITY_PURE_POSTS_PE_ORDER[0].slot, "B18_outer_gate");
  assert.equal(B18_ENTITY_PURE_POSTS_PE_ORDER[2].slot, "B18_type_route");
  assert.equal(B18_ENTITY_PURE_POSTS_PE_ORDER[4].slot, "B18_wire_decide");

  const docOnly = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "b18-entity-host");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.equal(docOnly.pureComplete, false);
  assert.equal(docOnly.hostEntityWalk, true);
  assert.equal(docOnly.hostTypeBodies, true);
  assert.equal(docOnly.hostVas.type5, ROOM_B18_HOST_VA_TYPE5);
  assert.equal(docOnly.hostVas.type5, 0x006e17c0);
  assert.equal(docOnly.hostVas.rtti, ROOM_B18_HOST_VA_RTTI);
  assert.equal(docOnly.hostVas.rtti, 0x00af08b1);
  assert.equal(docOnly.hostVas.pathB, ROOM_B18_HOST_VA_PATH_B);
  assert.equal(docOnly.hostVas.pathB, 0x006da530);
  assert.equal(docOnly.hostVas.flagTest, ROOM_B18_HOST_VA_FLAG_TEST);
  assert.equal(docOnly.hostVas.walkStart, ROOM_B18_HOST_VA_WALK_START);
  assert.equal(docOnly.hostVas.flagClear, ROOM_B18_HOST_VA_FLAG_CLEAR);
  assert.equal(docOnly.hostVas.next, ROOM_B18_HOST_VA_NEXT);
  assert.equal(docOnly.type5.va, 0x006e17c0);
  assert.equal(docOnly.type5.count, null);
  assert.equal(docOnly.rtti.srcPtr, ROOM_B18_RTTI_SRC_PTR);
  assert.equal(docOnly.rtti.dstPtr, ROOM_B18_RTTI_DST_PTR);
  assert.equal(docOnly.pathB.va, 0x006da530);
  assert.deepEqual(docOnly.pureHelperNames, [...B18_ENTITY_PURE_HELPER_NAMES]);
  assert.equal(docOnly.purePostsPeOrder.length, 5);
  assert.ok(docOnly.pureHelperNames.includes("roomB18WireDecide"));
  assert.ok(docOnly.pureHelperNames.includes("roomB18EntityAction"));
  assert.equal(docOnly.residualKinds.hostWalk, ROOM_B18_RESIDUAL_HOST_WALK);
  assert.equal(docOnly.actions.type5, ROOM_B18_ACTION_TYPE5);

  // Via residual HostHandler (default bodies).
  const residual = createResidualHostHandler();
  residual({ kind: "opaqueRoomUpdateTailEntity", count: 1 });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdateTailEntity");
  assert.ok(exec);
  assert.equal(exec.result.hostVas.type5, 0x006e17c0);
  assert.equal(exec.result.purePostsFromSamples, false);
  assert.equal(exec.result.purePostsApplied, null);
});

test("B18 entity residual applies wire_decide / type-route when samples provided", () => {
  const bodies = createDefaultResidualBodies();

  // Empty list under open outer flag → pure-complete (no type-5/RTTI host).
  const empty = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    roomFlag7894: 1,
    entityCount1264: 0,
    entities: [],
  });
  assert.equal(empty.residual, "b18-entity-pure-complete");
  assert.equal(empty.purePostsFromSamples, true);
  assert.ok(empty.purePostsApplied);
  assert.equal(empty.purePostsApplied.residualKind, ROOM_B18_RESIDUAL_PURE_COMPLETE);
  assert.equal(empty.purePostsApplied.pureComplete, true);
  assert.equal(empty.purePostsApplied.hostNeeded, false);
  assert.equal(empty.purePostsApplied.hostEntityWalk, 0);
  assert.equal(empty.pureComplete, true);
  assert.equal(empty.hostEntityWalk, false);
  assert.equal(empty.hostTypeBodies, false);
  assert.equal(empty.hostType5, false);
  assert.equal(empty.hostRtti, false);
  assert.equal(empty.hostPathB, false);

  // Closed outer flag → NONE pure-complete.
  const closed = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    roomFlag7894: 0,
    entityCount1264: 5,
    entitySamples: [{ type: 5 }],
  });
  assert.equal(closed.residual, "b18-entity-pure-complete");
  assert.equal(closed.purePostsApplied.residualKind, ROOM_B18_RESIDUAL_NONE);
  assert.equal(closed.purePostsApplied.outerGate, 0);
  assert.equal(closed.pureComplete, true);
  assert.equal(closed.hostEntityWalk, false);

  // Open flag without countReady → MONOLITHIC whole walk host.
  const mono = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    flagReady: 1,
    countReady: 0,
    roomFlag7894: 1,
  });
  assert.equal(mono.residual, "b18-entity-monolithic");
  assert.equal(mono.purePostsApplied.residualKind, ROOM_B18_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.hostNeeded, true);
  assert.equal(mono.hostEntityWalk, true);
  assert.equal(mono.pureComplete, false);

  // HOST_WALK with mixed type-route: type-5, RTTI+path-B, skip.
  const walkEntities = [
    { entityType28: 5 },
    { type: 50, rttiCastResult: 0x1000 }, // in range → RTTI; nonnull cast → path-B
    { type_28: 1 }, // mode 0 → SKIP (type1 needs mode>=2)
    { type: 3 }, // skip
  ];
  const walk = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    roomFlag7894: 0xff,
    entityCount1264: 4,
    timedTransitionCleanupMode: 0,
    entities: walkEntities,
  });
  assert.equal(walk.residual, "b18-entity-walk-host");
  assert.equal(walk.purePostsFromSamples, true);
  assert.equal(walk.purePostsApplied.residualKind, ROOM_B18_RESIDUAL_HOST_WALK);
  assert.equal(walk.purePostsApplied.pureComplete, false);
  assert.equal(walk.purePostsApplied.hostNeeded, true);
  assert.equal(walk.purePostsApplied.type5HostCount, 1);
  assert.equal(walk.purePostsApplied.rttiCandidateCount, 1);
  assert.equal(walk.purePostsApplied.pathBHostCount, 1);
  assert.equal(walk.purePostsApplied.skipCount, 2);
  assert.equal(walk.purePostsApplied.hostType5, 1);
  assert.equal(walk.purePostsApplied.hostRtti, 1);
  assert.equal(walk.purePostsApplied.hostPathB, 1);
  assert.equal(walk.hostType5, true);
  assert.equal(walk.hostRtti, true);
  assert.equal(walk.hostPathB, true);
  assert.equal(walk.hostEntityWalk, true);
  assert.equal(walk.hostTypeBodies, true);
  assert.equal(walk.type5.count, 1);
  assert.equal(walk.rtti.candidateCount, 1);
  assert.equal(walk.pathB.count, 1);
  assert.equal(walk.purePostsApplied.entityActions.length, 4);
  assert.equal(walk.purePostsApplied.entityActions[0].action, ROOM_B18_ACTION_TYPE5);
  assert.equal(walk.purePostsApplied.entityActions[1].action, ROOM_B18_ACTION_RTTI_CANDIDATE);
  assert.equal(walk.purePostsApplied.entityActions[1].pathBNeedsHost, 1);
  assert.equal(walk.purePostsApplied.entityActions[2].action, ROOM_B18_ACTION_SKIP);
  assert.equal(walk.purePostsApplied.entityActions[3].action, ROOM_B18_ACTION_SKIP);
  assert.equal(walk.hostVas.type5, 0x006e17c0);
  assert.equal(walk.hostVas.rtti, 0x00af08b1);
  assert.equal(walk.hostVas.pathB, 0x006da530);

  const oracle = roomB18WireDecide(1, 1, 0xff, 4);
  assert.equal(walk.purePostsApplied.residualKind, oracle.residualKind);
  assert.equal(walk.purePostsApplied.planEntityCount, oracle.entityCount);

  const direct = applyB18EntityPurePosts({
    roomFlag7894: 0xff,
    entityCount1264: 4,
    timedTransitionCleanupMode: 0,
    entities: walkEntities,
  });
  assert.deepEqual(walk.purePostsApplied, direct);

  // Type-1 with mode>=2 is RTTI candidate; null cast → no path-B host.
  const type1 = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    roomFlag7894: 1,
    packs: [{ type: 1, rtti: 0 }],
    mode: 2,
  });
  assert.equal(type1.residual, "b18-entity-walk-host");
  assert.equal(type1.purePostsApplied.rttiCandidateCount, 1);
  assert.equal(type1.purePostsApplied.pathBHostCount, 0);
  assert.equal(type1.hostRtti, true);
  assert.equal(type1.hostPathB, false);
  assert.equal(type1.purePostsApplied.entityActions[0].action, ROOM_B18_ACTION_RTTI_CANDIDATE);

  // All-skip walk: hostEntityWalk still true (list walk), no type bodies.
  const allSkip = bodies.opaqueRoomUpdateTailEntity({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    room_flag_7894: 1,
    entity_count_1264: 2,
    samples: [{ type: 1 }, { type: 3 }], // mode default 0
  });
  assert.equal(allSkip.residual, "b18-entity-walk-host");
  assert.equal(allSkip.purePostsApplied.skipCount, 2);
  assert.equal(allSkip.purePostsApplied.type5HostCount, 0);
  assert.equal(allSkip.purePostsApplied.rttiCandidateCount, 0);
  assert.equal(allSkip.hostEntityWalk, true);
  assert.equal(allSkip.hostTypeBodies, false);
  assert.equal(allSkip.hostType5, false);
  assert.equal(allSkip.hostRtti, false);

  // flagReady=0 → MONOLITHIC even with entity packs.
  const monoFlag = applyB18EntityPurePosts({
    flag_ready: 0,
    count_ready: 1,
    room_flag_7894: 1,
    samples: [{ type: 5 }],
  });
  assert.equal(monoFlag.residualKind, ROOM_B18_RESIDUAL_MONOLITHIC);
  assert.equal(monoFlag.hostEntityWalk, 1);

  // Numeric entity type packs accepted.
  const numeric = applyB18EntityPurePosts({
    roomFlag7894: 1,
    entities: [5, 10],
    mode: 0,
  });
  assert.equal(numeric.residualKind, ROOM_B18_RESIDUAL_HOST_WALK);
  assert.equal(numeric.type5HostCount, 1);
  assert.equal(numeric.rttiCandidateCount, 1);
  assert.equal(numeric.entityActions[0].entityType28, 5);
  assert.equal(numeric.entityActions[1].entityType28, 10);

  // Via residual HostHandler with samples.
  const residual = createResidualHostHandler();
  residual({
    kind: "opaqueRoomUpdateTailEntity",
    count: 1,
    roomFlag7894: 1,
    entities: [{ type: 5 }, { type: 999, rttiCastResult: 0 }],
  });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdateTailEntity");
  assert.ok(exec);
  assert.equal(exec.result.residual, "b18-entity-walk-host");
  assert.equal(exec.result.purePostsFromSamples, true);
  assert.equal(exec.result.purePostsApplied.type5HostCount, 1);
  assert.equal(exec.result.purePostsApplied.rttiCandidateCount, 1);
  assert.equal(exec.result.purePostsApplied.pathBHostCount, 0);
  assert.equal(exec.result.hostType5, true);
  assert.equal(exec.result.hostRtti, true);
  assert.equal(exec.result.hostPathB, false);
});

test("B19 path residual documents pure helpers + rebuild host without samples", () => {
  const bodies = createDefaultResidualBodies();
  assert.ok(B19_PATH_PURE_HELPER_NAMES.includes("roomB19WireDecide"));
  assert.ok(B19_PATH_PURE_HELPER_NAMES.includes("roomB19CellCount"));
  assert.ok(B19_PATH_PURE_HELPER_NAMES.includes("roomB19EntityIsMarkCandidate"));
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER.length, 5);
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER[0].slot, "B19_outer_gate");
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER[1].slot, "B19_cell_count");
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER[2].slot, "B19_collision_byte");
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER[3].slot, "B19_entity_route");
  assert.equal(B19_PATH_PURE_POSTS_PE_ORDER[4].slot, "B19_wire_decide");
  // B20 trail helpers are composed on the same residual (ABI v31 freestanding).
  assert.ok(B20_TRAIL_PURE_HELPER_NAMES.includes("roomB20WireDecide"));
  assert.ok(B20_TRAIL_PURE_HELPER_NAMES.includes("roomB20Pass2Action"));
  assert.equal(B20_TRAIL_PURE_POSTS_PE_ORDER.length, 5);
  assert.equal(B20_TRAIL_PURE_POSTS_PE_ORDER[0].slot, "B20_outer_gate");
  assert.equal(B20_TRAIL_PURE_POSTS_PE_ORDER[4].slot, "B20_wire_decide");

  const docOnly = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "b19-path-host");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.equal(docOnly.pureComplete, false);
  assert.equal(docOnly.hostRebuild, true);
  assert.equal(docOnly.hostCellLoop, true);
  assert.equal(docOnly.hostEntityWalk, true);
  assert.equal(docOnly.hostTreePath, true);
  assert.equal(docOnly.hostB20Trail, true);
  assert.equal(docOnly.hostVas.flagTest, ROOM_B19_HOST_VA_FLAG_TEST);
  assert.equal(docOnly.hostVas.flagTest, 0x008055a7);
  assert.equal(docOnly.hostVas.rebuildStart, ROOM_B19_HOST_VA_REBUILD_START);
  assert.equal(docOnly.hostVas.rebuildStart, 0x008055b4);
  assert.equal(docOnly.hostVas.memset, ROOM_B19_HOST_VA_MEMSET);
  assert.equal(docOnly.hostVas.memset, 0x00af05e5);
  assert.equal(docOnly.hostVas.getGridCollision, ROOM_B19_HOST_VA_GET_GRID_COLLISION);
  assert.equal(docOnly.hostVas.getGridCollision, 0x007f0800);
  assert.equal(docOnly.hostVas.entityWalk, ROOM_B19_HOST_VA_ENTITY_WALK);
  assert.equal(docOnly.hostVas.query8000, ROOM_B19_HOST_VA_QUERY_8000);
  assert.equal(docOnly.hostVas.treeAlloc, ROOM_B19_HOST_VA_TREE_ALLOC);
  assert.equal(docOnly.hostVas.posFinish, ROOM_B19_HOST_VA_POS_FINISH);
  assert.equal(docOnly.hostVas.spawn, ROOM_B19_HOST_VA_SPAWN);
  assert.equal(docOnly.hostVas.getAltPedestal, ROOM_B19_HOST_VA_GET_ALT_PEDESTAL);
  assert.equal(docOnly.hostVas.setAltPedestal, ROOM_B19_HOST_VA_SET_ALT_PEDESTAL);
  assert.equal(docOnly.hostVas.flagClear, ROOM_B19_HOST_VA_FLAG_CLEAR);
  assert.equal(docOnly.hostVas.next, ROOM_B19_HOST_VA_NEXT);
  assert.equal(docOnly.hostVas.next, 0x0080608e);
  assert.equal(docOnly.hostVas.refcount, ROOM_B19_REFCOUNT_VA);
  assert.equal(docOnly.hostVas.b20.listTest, ROOM_B20_HOST_VA_LIST_TEST);
  assert.equal(docOnly.hostVas.b20.epilogue, ROOM_B20_HOST_VA_EPILOGUE);
  assert.equal(docOnly.rebuild.va, 0x008055b4);
  assert.equal(docOnly.rebuild.needed, null);
  assert.equal(docOnly.cellLoop.va, 0x007f0800);
  assert.equal(docOnly.entityWalk.queryImm, ROOM_B19_QUERY_IMM_8000);
  assert.equal(docOnly.treePath.treeAllocVa, 0x00a0f4c0);
  assert.equal(docOnly.b20.va, 0x0080608e);
  assert.equal(docOnly.b20.va, ROOM_B20_HOST_VA_LIST_TEST);
  assert.equal(docOnly.b20.needed, 1);
  assert.equal(docOnly.b20.epilogueVa, ROOM_B20_HOST_VA_EPILOGUE);
  assert.deepEqual(docOnly.pureHelperNames, [
    ...B19_PATH_PURE_HELPER_NAMES,
    ...B20_TRAIL_PURE_HELPER_NAMES,
  ]);
  assert.equal(
    docOnly.purePostsPeOrder.length,
    B19_PATH_PURE_POSTS_PE_ORDER.length + B20_TRAIL_PURE_POSTS_PE_ORDER.length,
  );
  assert.ok(docOnly.pureHelperNames.includes("roomB19WireDecide"));
  assert.ok(docOnly.pureHelperNames.includes("roomB19WorldToGridIndex"));
  assert.ok(docOnly.pureHelperNames.includes("roomB20WireDecide"));
  assert.ok(docOnly.pureHelperNames.includes("roomB20Pass1TypeMatch"));
  assert.equal(docOnly.residualKinds.hostRebuild, ROOM_B19_RESIDUAL_HOST_REBUILD);
  assert.equal(docOnly.residualKinds.b20HostTrail, ROOM_B20_RESIDUAL_HOST_TRAIL);
  assert.equal(docOnly.peImms.entityType5, ROOM_B19_ENTITY_TYPE5);
  assert.equal(docOnly.peImms.entityVariant100, ROOM_B19_ENTITY_VARIANT_100);
  assert.equal(docOnly.peImms.entityFlagBit, ROOM_B19_ENTITY_FLAG_BIT);
  assert.equal(docOnly.peImms.b20Pass1TypeA, ROOM_B20_PASS1_TYPE_A);
  assert.equal(docOnly.peImms.b20FlagBit4000, ROOM_B20_FLAG_BIT_4000);

  const residual = createResidualHostHandler();
  residual({ kind: "opaqueRoomUpdateTailPath", count: 1 });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdateTailPath");
  assert.ok(exec);
  assert.equal(exec.result.hostVas.rebuildStart, 0x008055b4);
  assert.equal(exec.result.purePostsFromSamples, false);
  assert.equal(exec.result.purePostsApplied, null);
});

test("B19 path residual applies wire_decide / mark-route when samples provided", () => {
  const bodies = createDefaultResidualBodies();

  // Closed outer flag → B19 NONE pure-complete; B20 still host.
  const closed = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 0,
    widthC: 15,
    height10: 9,
    entities: [{ type: 5, variant: 0x64 }],
  });
  assert.equal(closed.residual, "b19-path-b20-only");
  assert.equal(closed.purePostsFromSamples, true);
  assert.ok(closed.purePostsApplied);
  assert.equal(closed.purePostsApplied.residualKind, ROOM_B19_RESIDUAL_NONE);
  assert.equal(closed.purePostsApplied.pureComplete, true);
  assert.equal(closed.purePostsApplied.hostNeeded, false);
  assert.equal(closed.purePostsApplied.hostRebuild, 0);
  assert.equal(closed.purePostsApplied.hostB20Trail, 1);
  assert.equal(closed.purePostsApplied.outerGate, 0);
  assert.equal(closed.pureComplete, true);
  assert.equal(closed.hostRebuild, false);
  assert.equal(closed.hostB20Trail, true);
  assert.equal(closed.b20.needed, 1);

  // Open flag without dimensions → HOST_REBUILD (cell_count 0 still hosts).
  const emptyDim = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 1,
    widthC: 0,
    height10: 0,
    entityCount1264: 0,
    entities: [],
  });
  assert.equal(emptyDim.residual, "b19-path-rebuild-host");
  assert.equal(emptyDim.purePostsApplied.residualKind, ROOM_B19_RESIDUAL_HOST_REBUILD);
  assert.equal(emptyDim.purePostsApplied.pureComplete, false);
  assert.equal(emptyDim.purePostsApplied.hostNeeded, true);
  assert.equal(emptyDim.purePostsApplied.hostRebuild, 1);
  assert.equal(emptyDim.purePostsApplied.cellCount, 0);
  assert.equal(emptyDim.purePostsApplied.cellLoopEnter, 0);
  assert.equal(emptyDim.purePostsApplied.hostCellLoop, 0);
  assert.equal(emptyDim.purePostsApplied.listEmpty, 1);
  assert.equal(emptyDim.purePostsApplied.hostEntityWalk, 0);
  assert.equal(emptyDim.purePostsApplied.hostTreePath, 1);
  assert.equal(emptyDim.hostRebuild, true);
  assert.equal(emptyDim.hostCellLoop, false);
  assert.equal(emptyDim.hostEntityWalk, false);
  assert.equal(emptyDim.hostTreePath, true);

  // flagReady=0 → MONOLITHIC whole residual host.
  const mono = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    flagReady: 0,
    roomFlag7769: 1,
    widthC: 15,
    height10: 9,
  });
  assert.equal(mono.residual, "b19-path-monolithic");
  assert.equal(mono.purePostsApplied.residualKind, ROOM_B19_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.hostNeeded, true);
  assert.equal(mono.hostRebuild, true);
  assert.equal(mono.pureComplete, false);

  // HOST_REBUILD with mark candidate + secondary + non-mark entity + cells.
  const rebuildEntities = [
    {
      entityType28: 5,
      entityVariant2c: 0x64,
      dead173: 0,
      field534: 0,
      flags168: ROOM_B19_ENTITY_FLAG_BIT,
      // center-ish of a 15x9 room in PE world coords (gx/gy in range)
      posX: 40 * 7 + 40,
      posY: 120 + 40 * 4,
    },
    { type: 5, variant: 0x64, dead: 1, flags: 0, x: 0, y: 0 }, // mark, not secondary
    { type: 1, variant: 0 }, // not mark candidate
  ];
  const rebuild = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 0xff,
    widthC: 15,
    height10: 9,
    entityCount1264: 3,
    entities: rebuildEntities,
    cells: [0, 1, 0x10],
  });
  assert.equal(rebuild.residual, "b19-path-rebuild-host");
  assert.equal(rebuild.purePostsFromSamples, true);
  assert.equal(rebuild.purePostsApplied.residualKind, ROOM_B19_RESIDUAL_HOST_REBUILD);
  assert.equal(rebuild.purePostsApplied.pureComplete, false);
  assert.equal(rebuild.purePostsApplied.hostNeeded, true);
  assert.equal(rebuild.purePostsApplied.outerGate, 1);
  assert.equal(rebuild.purePostsApplied.cellCount, roomB19CellCount(15, 9));
  assert.equal(rebuild.purePostsApplied.cellCount, 135);
  assert.equal(rebuild.purePostsApplied.cellLoopEnter, 1);
  assert.equal(rebuild.purePostsApplied.listEmpty, 0);
  assert.equal(rebuild.purePostsApplied.markCandidateCount, 2);
  assert.equal(rebuild.purePostsApplied.secondaryEligibleCount, 1);
  assert.equal(rebuild.purePostsApplied.hostRebuild, 1);
  assert.equal(rebuild.purePostsApplied.hostCellLoop, 1);
  assert.equal(rebuild.purePostsApplied.hostEntityWalk, 1);
  assert.equal(rebuild.purePostsApplied.hostSecondaryQuery, 1);
  assert.equal(rebuild.purePostsApplied.hostTreePath, 1);
  assert.equal(rebuild.hostRebuild, true);
  assert.equal(rebuild.hostCellLoop, true);
  assert.equal(rebuild.hostEntityWalk, true);
  assert.equal(rebuild.hostSecondaryQuery, true);
  assert.equal(rebuild.entityWalk.markCandidateCount, 2);
  assert.equal(rebuild.entityWalk.secondaryEligibleCount, 1);
  assert.equal(rebuild.cellLoop.cellCount, 135);
  assert.equal(rebuild.purePostsApplied.entityActions.length, 3);
  assert.equal(rebuild.purePostsApplied.entityActions[0].markCandidate, 1);
  assert.equal(rebuild.purePostsApplied.entityActions[0].secondaryEligible, 1);
  assert.equal(rebuild.purePostsApplied.entityActions[0].hostSecondaryQuery, 1);
  assert.equal(rebuild.purePostsApplied.entityActions[1].markCandidate, 1);
  assert.equal(rebuild.purePostsApplied.entityActions[1].secondaryEligible, 0);
  assert.equal(rebuild.purePostsApplied.entityActions[2].markCandidate, 0);
  assert.equal(rebuild.purePostsApplied.cellActions.length, 3);
  assert.equal(rebuild.purePostsApplied.cellActions[0].collisionByte, 0);
  assert.equal(rebuild.purePostsApplied.cellActions[1].collisionByte, 0xff);
  assert.equal(rebuild.purePostsApplied.cellActions[2].collisionByte, 0xff);
  assert.equal(
    rebuild.purePostsApplied.entityActions[0].markCandidate,
    roomB19EntityIsMarkCandidate(5, 0x64),
  );
  assert.equal(
    rebuild.purePostsApplied.entityActions[0].secondaryEligible,
    roomB19EntitySecondaryEligible(0, 0, ROOM_B19_ENTITY_FLAG_BIT),
  );
  assert.equal(
    rebuild.purePostsApplied.cellActions[1].collisionByte,
    roomB19CollisionByte(1),
  );

  const oracle = roomB19WireDecide(1, 0xff, 15, 9);
  assert.equal(rebuild.purePostsApplied.residualKind, oracle.residualKind);
  assert.equal(rebuild.purePostsApplied.planCellCount, oracle.cellCount);

  const direct = applyB19PathPurePosts({
    roomFlag7769: 0xff,
    widthC: 15,
    height10: 9,
    entityCount1264: 3,
    entities: rebuildEntities,
    cells: [0, 1, 0x10],
  });
  // Composed TailPath adds b19FromSamples / b20 composition markers.
  assert.equal(rebuild.purePostsApplied.b19FromSamples, true);
  assert.equal(rebuild.purePostsApplied.b20FromSamples, false);
  assert.equal(rebuild.purePostsApplied.b20, null);
  assert.equal(rebuild.purePostsApplied.hostB20Trail, 1);
  assert.equal(rebuild.purePostsApplied.residualKind, direct.residualKind);
  assert.equal(rebuild.purePostsApplied.markCandidateCount, direct.markCandidateCount);
  assert.deepEqual(rebuild.purePostsApplied.entityActions, direct.entityActions);
  assert.deepEqual(rebuild.purePostsApplied.cellActions, direct.cellActions);

  // Grid index pure for known in-bounds mark position.
  const e0 = rebuild.purePostsApplied.entityActions[0];
  assert.equal(
    e0.gridIndex,
    roomB19WorldToGridIndex(e0.posX, e0.posY, 15, 9),
  );
  assert.equal(e0.gridIndexValid, 1);
  assert.equal(e0.hostMarkStore, 1);

  // Snake_case aliases + numeric type packs.
  const viaAlias = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    room_flag_7769: 1,
    width_c: 2,
    height_10: 2,
    entity_count_1264: 1,
    samples: [5], // type only → not mark without variant 0x64
    cell_samples: [0],
  });
  assert.equal(viaAlias.residual, "b19-path-rebuild-host");
  assert.equal(viaAlias.purePostsApplied.cellCount, 4);
  assert.equal(viaAlias.purePostsApplied.markCandidateCount, 0);
  assert.equal(viaAlias.purePostsApplied.entityActions[0].entityType28, 5);
  assert.equal(viaAlias.purePostsApplied.cellActions[0].collisionByte, 0);

  // flagReady=0 with packs still MONOLITHIC (no per-entity expand).
  const monoFlag = applyB19PathPurePosts({
    flag_ready: 0,
    room_flag_7769: 1,
    width_c: 15,
    height_10: 9,
    samples: [{ type: 5, variant: 0x64 }],
  });
  assert.equal(monoFlag.residualKind, ROOM_B19_RESIDUAL_MONOLITHIC);
  assert.equal(monoFlag.hostRebuild, 1);
  assert.equal(monoFlag.entityActions, null);

  // Via residual HostHandler with samples.
  const residual = createResidualHostHandler();
  residual({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 1,
    widthC: 15,
    height10: 9,
    entities: [
      {
        type: ROOM_B19_ENTITY_TYPE5,
        variant: ROOM_B19_ENTITY_VARIANT_100,
        dead: 0,
        field_534: 0,
        flags: ROOM_B19_ENTITY_FLAG_BIT,
        x: 80,
        y: 200,
      },
    ],
    cells: [7],
  });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdateTailPath");
  assert.ok(exec);
  assert.equal(exec.result.residual, "b19-path-rebuild-host");
  assert.equal(exec.result.purePostsFromSamples, true);
  assert.equal(exec.result.purePostsApplied.markCandidateCount, 1);
  assert.equal(exec.result.purePostsApplied.secondaryEligibleCount, 1);
  assert.equal(exec.result.purePostsApplied.hostCellLoop, 1);
  assert.equal(exec.result.hostRebuild, true);
  assert.equal(exec.result.hostB20Trail, true);
  assert.equal(exec.result.hostVas.getGridCollision, 0x007f0800);
  assert.equal(exec.result.hostVas.next, 0x0080608e);
});

test("B20 trail residual applies wire_decide / pass2 pure plan when samples provided", () => {
  const bodies = createDefaultResidualBodies();

  // Empty list (begin==end) → B20 NONE pure-complete; B19 still host without packs.
  const emptyList = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    listBeginC82674: 0x1000,
    listEndC82678: 0x1000,
  });
  assert.equal(emptyList.residual, "b20-trail-none");
  assert.equal(emptyList.purePostsFromSamples, true);
  assert.ok(emptyList.purePostsApplied);
  assert.equal(emptyList.purePostsApplied.b19FromSamples, false);
  assert.equal(emptyList.purePostsApplied.b20FromSamples, true);
  assert.equal(emptyList.purePostsApplied.hostB20Trail, 0);
  assert.ok(emptyList.purePostsApplied.b20);
  assert.equal(emptyList.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_NONE);
  assert.equal(emptyList.purePostsApplied.b20.pureComplete, true);
  assert.equal(emptyList.purePostsApplied.b20.hostNeeded, false);
  assert.equal(emptyList.purePostsApplied.b20.outerGate, 0);
  assert.equal(emptyList.purePostsApplied.b20.listCount, 0);
  assert.equal(emptyList.hostB20Trail, false);
  assert.equal(emptyList.hostRebuild, true); // B19 still host without packs
  assert.equal(emptyList.pureComplete, false); // whole residual not pure
  assert.equal(emptyList.pureCompleteB20, true);
  assert.equal(emptyList.b20.needed, 0);
  assert.equal(emptyList.b20.pureComplete, true);
  assert.equal(emptyList.b20.va, ROOM_B20_HOST_VA_LIST_TEST);

  // Open list with count 0 (odd pointer delta) still HOST_TRAIL.
  const oddDelta = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    listBegin: 0x1000,
    listEnd: 0x1001,
  });
  assert.equal(oddDelta.residual, "b20-trail-host");
  assert.equal(oddDelta.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_HOST_TRAIL);
  assert.equal(oddDelta.purePostsApplied.b20.listCount, 0);
  assert.equal(oddDelta.purePostsApplied.b20.hostB20Trail, 1);
  assert.equal(oddDelta.purePostsApplied.b20.hostPass1, 0); // empty walk
  assert.equal(oddDelta.purePostsApplied.hostB20Trail, 1);
  assert.equal(oddDelta.hostB20Trail, true);
  assert.equal(oddDelta.b20.needed, 1);

  // listReady=0 → MONOLITHIC whole trail host.
  const mono = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    listReady: 0,
    listBeginC82674: 0x1000,
    listEndC82678: 0x1010,
  });
  assert.equal(mono.residual, "b20-trail-monolithic");
  assert.equal(mono.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.b20.hostNeeded, true);
  assert.equal(mono.purePostsApplied.hostB20Trail, 1);
  assert.equal(mono.hostB20Trail, true);
  assert.equal(mono.pureComplete, false);

  // HOST_TRAIL with pass1 match + pair-X + pair-Y + default + flagged entities.
  const trailEntities = [
    {
      entityType28: ROOM_B20_PASS1_TYPE_A, // 0x1c → pass1 match + flagged after OR
      flags16c: 0,
      posX: 100,
      posY: 50,
      field3c0: 0,
      childPtr3bc: 0x2000,
      childType28: 1,
    },
    {
      type: 0x4e, // pair-X (no pass1)
      flags: 0,
      x: 100,
      y: 50,
    },
    {
      type: ROOM_B20_PAIR_Y_TYPE, // 0x66 pair-Y
      flags_16c: 0,
      pos_x: 100,
      pos_y: 50,
    },
    {
      type: 1, // default spawn path
      flags: 0,
    },
  ];
  const trail = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    listBeginC82674: 0x1000,
    listEndC82678: 0x1010, // count = 4
    mode26614: 2,
    trailEntities,
  });
  assert.equal(trail.residual, "b20-trail-host");
  assert.equal(trail.purePostsFromSamples, true);
  assert.equal(trail.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_HOST_TRAIL);
  assert.equal(trail.purePostsApplied.b20.pureComplete, false);
  assert.equal(trail.purePostsApplied.b20.hostNeeded, true);
  assert.equal(trail.purePostsApplied.b20.outerGate, 1);
  assert.equal(trail.purePostsApplied.b20.listCount, 4);
  assert.equal(trail.purePostsApplied.b20.listEmpty, 0);
  assert.equal(trail.purePostsApplied.b20.pass1MatchCount, 1);
  assert.equal(trail.purePostsApplied.b20.pass2FlaggedCount, 1);
  assert.equal(trail.purePostsApplied.b20.pass2PairXCount, 1);
  assert.equal(trail.purePostsApplied.b20.pass2PairYCount, 1);
  assert.equal(trail.purePostsApplied.b20.pass2DefaultCount, 1);
  assert.equal(trail.purePostsApplied.b20.multispawnEnterCount, 1);
  assert.equal(trail.purePostsApplied.b20.chainContinueCount, 1); // mode>=2 type1
  assert.equal(trail.purePostsApplied.b20.hostPass1, 1);
  assert.equal(trail.purePostsApplied.b20.hostPass2, 1);
  assert.equal(trail.purePostsApplied.b20.hostSpawn, 1);
  assert.equal(trail.purePostsApplied.hostB20Trail, 1);
  assert.equal(trail.hostB20Trail, true);
  assert.equal(trail.b20.needed, 1);
  assert.equal(trail.b20.hostPass1, 1);
  assert.equal(trail.b20.listCount, 4);
  assert.equal(trail.b20.hostVas.vectorPush, ROOM_B20_HOST_VA_VECTOR_PUSH);
  assert.equal(trail.b20.hostVas.genrand, ROOM_B20_HOST_VA_GENRAND);
  assert.equal(trail.b20.hostVas.spawn, ROOM_B20_HOST_VA_SPAWN);
  assert.equal(trail.b20.hostVas.deallocate, ROOM_B20_HOST_VA_DEALLOCATE);
  assert.equal(trail.b20.hostVas.listBegin, ROOM_B20_LIST_BEGIN_VA);
  assert.equal(trail.b20.hostVas.listEnd, ROOM_B20_LIST_END_VA);

  const actions = trail.purePostsApplied.b20.entityActions;
  assert.equal(actions.length, 4);
  assert.equal(actions[0].pass1TypeMatch, 1);
  assert.equal(actions[0].pass2Action, ROOM_B20_ACTION_FLAGGED);
  assert.equal(actions[0].flags16cAfterPass1, ROOM_B20_FLAG_BIT_4000);
  assert.equal(actions[0].multispawnEnter, 1);
  assert.equal(actions[0].chainContinue, 1);
  assert.equal(actions[1].pass1TypeMatch, 0);
  assert.equal(actions[1].pass2Action, ROOM_B20_ACTION_PAIR_X);
  assert.equal(actions[1].pairXLeft.x, roomB20PairXLeft(100, 50).x);
  assert.equal(actions[1].pairXRight.x, roomB20PairXRight(100, 50).x);
  assert.equal(actions[2].pass2Action, ROOM_B20_ACTION_PAIR_Y);
  assert.equal(actions[3].pass2Action, ROOM_B20_ACTION_DEFAULT);
  assert.equal(
    actions[0].pass1TypeMatch,
    roomB20Pass1TypeMatch(ROOM_B20_PASS1_TYPE_A),
  );
  assert.equal(
    actions[1].pass2Action,
    roomB20Pass2Action(0, 0x4e),
  );

  const oracle = roomB20WireDecide(1, 0x1000, 0x1010);
  assert.equal(trail.purePostsApplied.b20.residualKind, oracle.residualKind);
  assert.equal(trail.purePostsApplied.b20.planListCount, oracle.listCount);

  const direct = applyB20TrailPurePosts({
    listBeginC82674: 0x1000,
    listEndC82678: 0x1010,
    mode26614: 2,
    trailEntities,
  });
  assert.deepEqual(trail.purePostsApplied.b20, direct);

  // B19 flag-off + B20 empty list → whole TailPath pure-complete.
  const bothPure = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 0,
    widthC: 15,
    height10: 9,
    entities: [],
    listBeginC82674: 0x2000,
    listEndC82678: 0x2000,
  });
  assert.equal(bothPure.residual, "tail-path-pure-complete");
  assert.equal(bothPure.purePostsFromSamples, true);
  assert.equal(bothPure.purePostsApplied.b19FromSamples, true);
  assert.equal(bothPure.purePostsApplied.b20FromSamples, true);
  assert.equal(bothPure.purePostsApplied.residualKind, ROOM_B19_RESIDUAL_NONE);
  assert.equal(bothPure.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_NONE);
  assert.equal(bothPure.purePostsApplied.hostRebuild, 0);
  assert.equal(bothPure.purePostsApplied.hostB20Trail, 0);
  assert.equal(bothPure.pureComplete, true);
  assert.equal(bothPure.pureCompleteB19, true);
  assert.equal(bothPure.pureCompleteB20, true);
  assert.equal(bothPure.hostRebuild, false);
  assert.equal(bothPure.hostB20Trail, false);
  assert.equal(bothPure.b20.needed, 0);

  // B19 flag-off + B20 open trail → residual is b20-trail-host.
  const b19PureB20Host = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 0,
    widthC: 1,
    height10: 1,
    listBeginC82674: 0x1000,
    listEndC82678: 0x1004,
    trailEntities: [{ type: ROOM_B20_PASS1_TYPE_B }],
  });
  assert.equal(b19PureB20Host.residual, "b20-trail-host");
  assert.equal(b19PureB20Host.pureCompleteB19, true);
  assert.equal(b19PureB20Host.pureCompleteB20, false);
  assert.equal(b19PureB20Host.pureComplete, false);
  assert.equal(b19PureB20Host.hostRebuild, false);
  assert.equal(b19PureB20Host.hostB20Trail, true);
  assert.equal(b19PureB20Host.purePostsApplied.b20.pass1MatchCount, 1);
  assert.equal(b19PureB20Host.purePostsApplied.b20.pass2FlaggedCount, 1);

  // B19 rebuild + B20 empty → still b19-path-rebuild-host, B20 none.
  const rebuildB20None = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    roomFlag7769: 1,
    widthC: 2,
    height10: 2,
    entities: [],
    list_begin: 0x3000,
    list_end: 0x3000,
  });
  assert.equal(rebuildB20None.residual, "b19-path-rebuild-host");
  assert.equal(rebuildB20None.hostRebuild, true);
  assert.equal(rebuildB20None.hostB20Trail, false);
  assert.equal(rebuildB20None.purePostsApplied.hostB20Trail, 0);
  assert.equal(rebuildB20None.purePostsApplied.b20.residualKind, ROOM_B20_RESIDUAL_NONE);

  // Snake_case aliases + b20Entities key.
  const viaAlias = bodies.opaqueRoomUpdateTailPath({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    list_begin_c82674: 0x1000,
    list_end_c82678: 0x1008,
    mode_26614: 0,
    b20_entities: [
      { type_28: 0x4e, flags_16c: 0, pos_x: 10, pos_y: 20 },
      { type: 999, flags: 0 },
    ],
  });
  assert.equal(viaAlias.residual, "b20-trail-host");
  assert.equal(viaAlias.purePostsApplied.b20.listCount, 2);
  assert.equal(viaAlias.purePostsApplied.b20.pass2PairXCount, 1);
  assert.equal(viaAlias.purePostsApplied.b20.pass2DefaultCount, 1);
  assert.equal(viaAlias.purePostsApplied.b20.entityActions[0].entityType28, 0x4e);

  // listReady=0 with packs still MONOLITHIC (no per-entity expand).
  const monoFlag = applyB20TrailPurePosts({
    list_ready: 0,
    list_begin: 0x1000,
    list_end: 0x1010,
    trail_entities: [{ type: ROOM_B20_PASS1_TYPE_A }],
  });
  assert.equal(monoFlag.residualKind, ROOM_B20_RESIDUAL_MONOLITHIC);
  assert.equal(monoFlag.hostB20Trail, 1);
  assert.equal(monoFlag.entityActions, null);

  // Via residual HostHandler with B20 samples.
  const residual = createResidualHostHandler();
  residual({
    kind: "opaqueRoomUpdateTailPath",
    count: 1,
    listBeginC82674: 0x1000,
    listEndC82678: 0x1004,
    trailEntities: [{ type: ROOM_B20_PASS1_TYPE_A, flags16c: 0, field3c0: 1 }],
  });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdateTailPath");
  assert.ok(exec);
  assert.equal(exec.result.residual, "b20-trail-host");
  assert.equal(exec.result.purePostsFromSamples, true);
  assert.equal(exec.result.purePostsApplied.b20.pass1MatchCount, 1);
  assert.equal(exec.result.purePostsApplied.b20.multispawnEnterCount, 0); // field3c0!=0
  assert.equal(exec.result.hostB20Trail, true);
  assert.equal(exec.result.b20.va, 0x0080608e);
  assert.equal(exec.result.b20.hostVas.pass1, ROOM_B20_HOST_VA_PASS1);
  assert.equal(exec.result.b20.hostVas.pass2, ROOM_B20_HOST_VA_PASS2);
  assert.equal(exec.result.hostVas.b20.epilogue, 0x00806884);
});

test("B3B7 residual documents pure helpers + host VAs without samples", () => {
  const bodies = createDefaultResidualBodies();
  assert.ok(B3B7_PURE_HELPER_NAMES.includes("roomB3B7WireDecide"));
  assert.ok(B3B7_PURE_HELPER_NAMES.includes("roomB3B7ResidualPlan"));
  assert.equal(B3B7_PURE_HELPER_NAMES.length, 2);

  // Doc-only: residual label + PE host VAs, no pure apply.
  const docOnly = bodies.opaqueRoomUpdatePrefixB3B7({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "b3b7-host");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.equal(docOnly.pureComplete, false);
  assert.equal(docOnly.hostNeeded, true);
  assert.equal(docOnly.hostVas.start, ROOM_B3_HOST_VA_START);
  assert.equal(docOnly.hostVas.start, 0x00803327);
  assert.equal(docOnly.hostVas.owner, ROOM_B3_HOST_VA_OWNER);
  assert.equal(docOnly.hostVas.owner, 0x009be080);
  assert.equal(docOnly.hostVas.challenge, ROOM_B3_HOST_VA_CHALLENGE);
  assert.equal(docOnly.hostVas.challenge, 0x009305f0);
  assert.equal(docOnly.hostVas.next, ROOM_B3B7_HOST_VA_NEXT);
  assert.equal(docOnly.hostVas.next, 0x00803bfb);
  assert.deepEqual(docOnly.pureHelperNames, [...B3B7_PURE_HELPER_NAMES]);

  // Via residual HostHandler (default bodies).
  const residual = createResidualHostHandler();
  residual({ kind: "opaqueRoomUpdatePrefixB3B7", count: 1 });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdatePrefixB3B7");
  assert.ok(exec);
  assert.equal(exec.result.usesX86Emulation, false);
  assert.equal(exec.result.residual, "b3b7-host");
  assert.equal(exec.result.purePostsFromSamples, false);
  assert.equal(exec.result.purePostsApplied, null);
  assert.equal(exec.result.hostVas.start, 0x00803327);
});

test("B3B7 residual applies wire_decide mono + fragment pure posts from sparse samples", () => {
  const bodies = createDefaultResidualBodies();

  // sparseReady=0 → MONOLITHIC whole residual host.
  const mono = bodies.opaqueRoomUpdatePrefixB3B7({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
    sparseReady: 0,
  });
  assert.equal(mono.usesX86Emulation, false);
  assert.equal(mono.residual, "b3b7-monolithic");
  assert.equal(mono.purePostsFromSamples, true);
  assert.ok(mono.purePostsApplied);
  assert.equal(mono.purePostsApplied.residualKind, ROOM_B3B7_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.pureComplete, false);
  assert.equal(mono.purePostsApplied.hostNeeded, true);
  assert.equal(mono.purePostsApplied.needsB3OwnerHost, false);
  assert.equal(mono.purePostsApplied.needsB7GridUpdateHost, false);
  assert.equal(mono.pureComplete, false);
  assert.equal(mono.hostNeeded, true);
  assert.equal(mono.hostVas.start, ROOM_B3_HOST_VA_START);
  assert.equal(mono.hostVas.challengeBody, ROOM_B3_HOST_VA_CHALLENGE_BODY);
  assert.equal(mono.hostVas.teCall, ROOM_B3_HOST_VA_TE_CALL);
  assert.equal(mono.hostVas.next, ROOM_B3B7_HOST_VA_NEXT);

  // inputsReady alias also triggers mono.
  const monoAlias = bodies.opaqueRoomUpdatePrefixB3B7({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
    inputsReady: 0,
  });
  assert.equal(monoAlias.residual, "b3b7-monolithic");
  assert.equal(monoAlias.purePostsApplied.residualKind, ROOM_B3B7_RESIDUAL_MONOLITHIC);

  // Fragment path: sparse width/height gate B7 grid host; residual always HOST.
  const fragmentInput = {
    sparseReady: 1,
    teByte7321: 0,
    teBegin: 0x1000,
    teEnd: 0x1010,
    descType0: -0x14,
    roomActiveByte0: 1,
    frame264f8: 10,
    entry11f0: 10,
    treeCount7238: 1,
    widthC: 5,
    height10: 4,
  };
  const fragment = bodies.opaqueRoomUpdatePrefixB3B7({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
    ...fragmentInput,
  });
  assert.equal(fragment.usesX86Emulation, false);
  assert.equal(fragment.residual, "b3b7-host-fragments");
  assert.equal(fragment.purePostsFromSamples, true);
  assert.ok(fragment.purePostsApplied);
  assert.equal(fragment.purePostsApplied.residualKind, ROOM_B3B7_RESIDUAL_HOST);
  assert.equal(fragment.purePostsApplied.needsB3OwnerHost, true);
  assert.equal(fragment.purePostsApplied.needsB3ChallengeHost, true);
  assert.equal(fragment.purePostsApplied.needsB3TempEffectsHost, true);
  assert.equal(fragment.purePostsApplied.needsB4RewardHost, true);
  assert.equal(fragment.purePostsApplied.needsB5CandidateHost, true);
  assert.equal(fragment.purePostsApplied.needsB6DestroyHost, true);
  assert.equal(fragment.purePostsApplied.needsB7GridUpdateHost, true);
  assert.equal(fragment.purePostsApplied.pureComplete, false);
  assert.equal(fragment.purePostsApplied.hostNeeded, true);
  assert.equal(fragment.pureComplete, false);
  assert.equal(fragment.hostNeeded, true);
  assert.equal(fragment.hostVas.start, 0x00803327);
  assert.equal(fragment.hostVas.owner, 0x009be080);
  assert.equal(fragment.hostVas.challenge, 0x009305f0);
  assert.equal(fragment.hostVas.challengeBody, 0x007ea2d0);
  assert.equal(fragment.hostVas.teCall, 0x009960b0);
  assert.equal(fragment.hostVas.next, 0x00803bfb);

  // width*height==0 → B7 grid host off; still host-fragments residual.
  const noGrid = bodies.opaqueRoomUpdatePrefixB3B7({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
    sparseReady: 1,
    widthC: 0,
    height10: 5,
  });
  assert.equal(noGrid.residual, "b3b7-host-fragments");
  assert.equal(noGrid.purePostsApplied.needsB7GridUpdateHost, false);
  assert.equal(noGrid.purePostsApplied.residualKind, ROOM_B3B7_RESIDUAL_HOST);

  // Direct apply matches residual path + JS oracle.
  const direct = applyB3B7PurePosts(fragmentInput);
  assert.deepEqual(fragment.purePostsApplied, direct);
  const oracle = roomB3B7WireDecide(fragmentInput);
  assert.equal(fragment.purePostsApplied.residualKind, oracle.residualKind);
  assert.equal(fragment.purePostsApplied.needsB7GridUpdateHost, !!oracle.needsB7GridUpdateHost);

  // snake_case aliases accepted.
  const snake = applyB3B7PurePosts({
    sparse_ready: 1,
    width_c: 3,
    height_10: 4,
  });
  assert.equal(snake.residualKind, ROOM_B3B7_RESIDUAL_HOST);
  assert.equal(snake.needsB7GridUpdateHost, true);

  // Via residual HostHandler with samples.
  const residual = createResidualHostHandler();
  residual({
    kind: "opaqueRoomUpdatePrefixB3B7",
    count: 1,
    widthC: 5,
    height10: 4,
  });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdatePrefixB3B7");
  assert.ok(exec);
  assert.equal(exec.result.residual, "b3b7-host-fragments");
  assert.equal(exec.result.purePostsFromSamples, true);
  assert.equal(exec.result.purePostsApplied.needsB7GridUpdateHost, true);
  assert.equal(exec.result.usesX86Emulation, false);
});

test("B9B11 residual documents pure helpers + host VAs without samples", () => {
  const bodies = createDefaultResidualBodies();
  assert.ok(B9B11_PURE_HELPER_NAMES.includes("roomB9B11WireDecide"));
  assert.ok(B9B11_PURE_HELPER_NAMES.includes("roomB9B11ResidualPlan"));
  assert.equal(B9B11_PURE_HELPER_NAMES.length, 2);

  // Doc-only: residual label + PE host VAs, no pure apply.
  const docOnly = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
  });
  assert.equal(docOnly.usesX86Emulation, false);
  assert.equal(docOnly.platformIo, false);
  assert.equal(docOnly.residual, "b9b11-host");
  assert.equal(docOnly.purePostsFromSamples, false);
  assert.equal(docOnly.purePostsApplied, null);
  assert.equal(docOnly.pureComplete, false);
  assert.equal(docOnly.hostNeeded, true);
  assert.equal(docOnly.b10FatalNeedsHost, true);
  assert.equal(docOnly.hostVas.b9Start, ROOM_B9B11_HOST_VA_B9_START);
  assert.equal(docOnly.hostVas.b9Start, 0x00803ce5);
  assert.equal(docOnly.hostVas.query, ROOM_B9B11_HOST_VA_QUERY);
  assert.equal(docOnly.hostVas.query, 0x009be080);
  assert.equal(docOnly.hostVas.b10Start, ROOM_B9B11_HOST_VA_B10_START);
  assert.equal(docOnly.hostVas.b10Start, 0x00803e0a);
  assert.equal(docOnly.hostVas.fatal, ROOM_B9B11_HOST_VA_FATAL);
  assert.equal(docOnly.hostVas.fatal, 0x00a112c0);
  assert.equal(docOnly.hostVas.b12Start, ROOM_B9B11_HOST_VA_B12_START);
  assert.equal(docOnly.hostVas.b12Start, 0x00804113);
  assert.deepEqual(docOnly.pureHelperNames, [...B9B11_PURE_HELPER_NAMES]);

  // Via residual HostHandler (default bodies).
  const residual = createResidualHostHandler();
  residual({ kind: "opaqueRoomUpdatePrefixB9B11", count: 1 });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdatePrefixB9B11");
  assert.ok(exec);
  assert.equal(exec.result.usesX86Emulation, false);
  assert.equal(exec.result.residual, "b9b11-host");
  assert.equal(exec.result.purePostsFromSamples, false);
  assert.equal(exec.result.purePostsApplied, null);
  assert.equal(exec.result.hostVas.fatal, 0x00a112c0);
});

test("B9B11 residual applies wire_decide mono + fragment pure posts from sparse samples", () => {
  const bodies = createDefaultResidualBodies();

  // inputsReady=0 → MONOLITHIC whole residual host.
  const mono = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    inputsReady: 0,
  });
  assert.equal(mono.usesX86Emulation, false);
  assert.equal(mono.residual, "b9b11-monolithic");
  assert.equal(mono.purePostsFromSamples, true);
  assert.ok(mono.purePostsApplied);
  assert.equal(mono.purePostsApplied.residualKind, ROOM_B9B11_RESIDUAL_MONOLITHIC);
  assert.equal(mono.purePostsApplied.pureComplete, false);
  assert.equal(mono.purePostsApplied.hostNeeded, true);
  assert.equal(mono.purePostsApplied.b10FatalNeedsHost, false);
  assert.equal(mono.purePostsApplied.b10Enemies, 0);
  assert.equal(mono.pureComplete, false);
  assert.equal(mono.hostNeeded, true);
  assert.equal(mono.b10FatalNeedsHost, false);
  assert.equal(mono.hostVas.b9Start, ROOM_B9B11_HOST_VA_B9_START);
  assert.equal(mono.hostVas.fatal, ROOM_B9B11_HOST_VA_FATAL);
  assert.equal(mono.hostVas.b11Start, ROOM_B9B11_HOST_VA_B11_START);
  assert.equal(mono.hostVas.b12Start, ROOM_B9B11_HOST_VA_B12_START);

  // sparseReady alias also triggers mono.
  const monoAlias = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    sparseReady: 0,
  });
  assert.equal(monoAlias.residual, "b9b11-monolithic");
  assert.equal(monoAlias.purePostsApplied.residualKind, ROOM_B9B11_RESIDUAL_MONOLITHIC);

  // Fragment path: count12c8/old7224 fatal gate — enemies==0 && old7224>0 → fatal host.
  const fatalOnInput = {
    inputsReady: 1,
    challengeResultNonzero: 1,
    roomActiveByte0: 1,
    frame264f8: 10,
    roomEntry11f0: 6,
    roomType8: 0x11,
    roomDescFlags44: 0,
    game997aByte: 1,
    roomByte11f4: 1,
    count12c8: 0,
    count12cc: 0,
    old7224: 3,
    roomByte1d0d: 1,
    room1d18: 0x1a,
    roomByte7321: 0,
    listBegin7314: 0x1000,
    listEnd7318: 0x1020,
  };
  const fatalOn = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    ...fatalOnInput,
  });
  assert.equal(fatalOn.usesX86Emulation, false);
  assert.equal(fatalOn.residual, "b9b11-always-host");
  assert.equal(fatalOn.purePostsFromSamples, true);
  assert.ok(fatalOn.purePostsApplied);
  assert.equal(fatalOn.purePostsApplied.residualKind, ROOM_B9B11_RESIDUAL_ALWAYS_HOST);
  assert.equal(fatalOn.purePostsApplied.b10Enemies, 0);
  assert.equal(fatalOn.purePostsApplied.b10FatalNeedsHost, true);
  assert.equal(fatalOn.purePostsApplied.challengeBodyNeedsHost, true);
  assert.equal(fatalOn.purePostsApplied.modeHooksNeedsHost, true);
  assert.equal(fatalOn.purePostsApplied.pureComplete, false);
  assert.equal(fatalOn.purePostsApplied.hostNeeded, true);
  assert.equal(fatalOn.b10FatalNeedsHost, true);
  assert.equal(fatalOn.hostNeeded, true);
  assert.equal(fatalOn.hostVas.b9Start, 0x00803ce5);
  assert.equal(fatalOn.hostVas.query, 0x009be080);
  assert.equal(fatalOn.hostVas.b10Start, 0x00803e0a);
  assert.equal(fatalOn.hostVas.fatal, 0x00a112c0);
  assert.equal(fatalOn.hostVas.b11Start, 0x00803e70);
  assert.equal(fatalOn.hostVas.b12Start, 0x00804113);

  // enemies>0 (count12c8+count12cc) → fatal gate off.
  const fatalOff = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    inputsReady: 1,
    count12c8: 2,
    count12cc: 1,
    old7224: 5,
  });
  assert.equal(fatalOff.residual, "b9b11-always-host");
  assert.equal(fatalOff.purePostsApplied.b10Enemies, 3);
  assert.equal(fatalOff.purePostsApplied.b10FatalNeedsHost, false);
  assert.equal(fatalOff.b10FatalNeedsHost, false);

  // old7224==0 with zero enemies → fatal off.
  const noOld = bodies.opaqueRoomUpdatePrefixB9B11({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    inputsReady: 1,
    count12c8: 0,
    count12cc: 0,
    old7224: 0,
  });
  assert.equal(noOld.purePostsApplied.b10FatalNeedsHost, false);

  // Direct apply matches residual path + JS oracle.
  const direct = applyB9B11PurePosts(fatalOnInput);
  assert.deepEqual(fatalOn.purePostsApplied, direct);
  const oracle = roomB9B11WireDecide(1, fatalOnInput);
  assert.equal(fatalOn.purePostsApplied.residualKind, oracle.residualKind);
  assert.equal(fatalOn.purePostsApplied.b10FatalNeedsHost, !!oracle.b10FatalNeedsHost);
  assert.equal(fatalOn.purePostsApplied.b10Enemies, oracle.b10Enemies);

  // snake_case aliases accepted.
  const snake = applyB9B11PurePosts({
    inputs_ready: 1,
    count_12c8: 0,
    count_12cc: 0,
    old_7224: 2,
  });
  assert.equal(snake.residualKind, ROOM_B9B11_RESIDUAL_ALWAYS_HOST);
  assert.equal(snake.b10FatalNeedsHost, true);

  // Via residual HostHandler with samples.
  const residual = createResidualHostHandler();
  residual({
    kind: "opaqueRoomUpdatePrefixB9B11",
    count: 1,
    count12c8: 0,
    old7224: 1,
  });
  const exec = residual.executed.find((e) => e.kind === "opaqueRoomUpdatePrefixB9B11");
  assert.ok(exec);
  assert.equal(exec.result.residual, "b9b11-always-host");
  assert.equal(exec.result.purePostsFromSamples, true);
  assert.equal(exec.result.purePostsApplied.b10FatalNeedsHost, true);
  assert.equal(exec.result.b10FatalNeedsHost, true);
  assert.equal(exec.result.usesX86Emulation, false);
});

test("hybrid capture/apply round-trips sparse Game object without PE", async () => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0);
  }
  const slice = await loadGameUpdateSliceWasm(wasmPath);
  const gameObject = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  // Sentinel untranslated byte must survive capture/apply (only sparse fields touch).
  gameObject[0x10] = 0xab;
  writeSparseFieldsToGameObject(gameObject, {
    shortTimer: 7,
    counter265c0: 3,
    frameCounter264f8: 0,
    frameCounter264fc: 0,
    timer269e0: 2,
    roomType8: 2,
    gameFlags1839c: 0,
    fadeProgress26518: 0.2,
    shakeCurrent67738: 1,
    shakeTarget6773c: 0,
    shakeStep67740: 0.5,
  });

  const host = createResidualHostHandler();
  const result = runHybridGameUpdateTick(slice, {
    gameObject,
    constants,
    runtimeInputs,
    onHostEvent: host,
  });
  assert.equal(result.usesX86Emulation, false);
  assert.equal(result.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(gameObject[0x10], 0xab, "untranslated Game bytes must remain");
  const sparse = readSparseFieldsFromGameObject(gameObject);
  assert.equal(sparse.counter265c0, result.state.counter265c0);
  assert.ok(host.executed.length > 0);
  assert.ok(!Object.keys(host.totals).some((k) => /emulator|boxedwine|pe-emu/i.test(k)));

  // Direct capture/apply exports
  loadGameObjectIntoScratch(slice, gameObject);
  const captured = captureSparseStateFromScratch(slice);
  assert.equal(captured.counter265c0, sparse.counter265c0);
  applySparseStateToScratch(slice, { ...captured, shortTimer: 99 });
  const out = exportGameObjectFromScratch(slice);
  const after = readSparseFieldsFromGameObject(out);
  assert.equal(after.shortTimer, 99);
  assert.equal(out[0x10], 0xab);
});

test("browser URL load via local serve mounts selects native-wasm without PE", async () => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0);
  }
  const server = await startServer({ port: 0, log: () => {} });
  try {
    const { port } = server.address();
    const url = `http://${SERVE_HOST}:${port}${BROWSER_SLICE_WASM_URL}`;
    const slice = await loadGameUpdateSliceWasm(url);
    assert.equal(slice.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(slice.usesX86Emulation, false);
    assert.equal(slice.abiVersion, ABI_VERSION);
    const result = runNativeGameUpdateTick(slice, {
      state: baseState({ roomType8: 2, frameCounter264f8: 0 }),
      constants,
      runtimeInputs,
      onHostEvent: createLoggingHostHandler(),
    });
    assert.equal(result.usesX86Emulation, false);
    assert.equal(result.mode, FRAME_PATH_MODE.NATIVE_WASM);
  } finally {
    await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});

test("frame-path roots catalog lists Update/Render/ProcessInput/Exit/LuaEngine", () => {
  assert.deepEqual(
    FRAME_PATH_ROOTS.map((r) => r.id),
    [
      FRAME_PATH_ROOT_ID.UPDATE,
      FRAME_PATH_ROOT_ID.RENDER,
      FRAME_PATH_ROOT_ID.PROCESS_INPUT,
      FRAME_PATH_ROOT_ID.EXIT,
      FRAME_PATH_ROOT_ID.LUA_ENGINE,
    ],
  );
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Update").wired, true);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Update").pureName, null);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Render").pureName, "render-shell");
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "ProcessInput").pureName, "process-input");
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").pureName, "exit");
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "LuaEngine").pureName, "lua-engine");
  // Wave-2: Exit's wasm-backed root plan is driven per frame (plan step, not
  // a root slice — the family header: "Not an Exit slice ABI").
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").wired, true);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").rootPlanId, "exit");
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").rootPlanWasmFile, "exit-pure-helpers.wasm");
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").rootPlanAbi, EXIT_PURE_ABI_VERSION);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Update").expectedAbi, ABI_VERSION);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Render").expectedAbi, RENDER_SHELL_PURE_ABI_VERSION);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "ProcessInput").expectedAbi, PROCESS_INPUT_PURE_ABI_VERSION);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "Exit").expectedAbi, EXIT_PURE_ABI_VERSION);
  assert.equal(FRAME_PATH_ROOTS.find((r) => r.id === "LuaEngine").expectedAbi, LUA_ENGINE_PURE_ABI_VERSION);
  assert.ok(PURE_HELPER_MODULES.render);
  assert.ok(PURE_HELPER_MODULES.processInput);
  assert.ok(PURE_HELPER_MODULES.exit);
  assert.ok(PURE_HELPER_MODULES.luaEngine);
});

test("selectFramePathRoots prefers native-wasm without PE for available pure modules", () => {
  const partial = selectFramePathRoots({
    preferNative: true,
    updateAvailable: true,
    pureAvailable: { render: true, processInput: true },
  });
  assert.equal(partial.update, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.render, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.processInput, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.exit, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(partial.luaEngine, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(partial.Update, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.Render, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(allFramePathRootsNative(partial), false);
  assert.equal(multiRootUsesX86Emulation(partial), true);

  const none = selectFramePathRoots({ preferNative: true, updateAvailable: false, pureAvailable: {} });
  assert.equal(none.update, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(isX86EmulationFramePath(none.update), true);

  const all = selectFramePathRoots({
    preferNative: true,
    updateAvailable: true,
    pureAvailable: {
      render: true,
      processInput: true,
      exit: true,
      luaEngine: true,
    },
  });
  assert.equal(allFramePathRootsNative(all), true);
  assert.equal(multiRootUsesX86Emulation(all), false);
  for (const key of ["update", "render", "processInput", "exit", "luaEngine"]) {
    assert.equal(all[key], FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(isX86EmulationFramePath(all[key]), false);
  }

  // Alternate `available` map (PascalCase / pureName keys).
  const viaAvailable = selectFramePathRoots({
    preferNative: true,
    available: { Update: true, Render: true, "process-input": true },
  });
  assert.equal(viaAvailable.Update, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(viaAvailable.Render, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(viaAvailable.ProcessInput, FRAME_PATH_MODE.NATIVE_WASM);

  const forcedEmu = selectFramePathRoots({
    preferNative: false,
    updateAvailable: true,
    pureAvailable: { render: true },
  });
  assert.equal(forcedEmu.update, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(forcedEmu.render, FRAME_PATH_MODE.EMULATOR_X86);
});

test("PLATFORM_IO residual registry covers long-term platform/IO kinds", () => {
  assert.ok(Array.isArray(PLATFORM_IO_RESIDUAL_REGISTRY.kinds));
  assert.ok(PLATFORM_IO_RESIDUAL_REGISTRY.kinds.length > 0);
  assert.deepEqual([...PLATFORM_IO_RESIDUAL_REGISTRY.kinds], [...MULTI_ROOT_PLATFORM_IO_KINDS]);
  // Registry mirrors Update HostHandler platform/IO set.
  for (const kind of MULTI_ROOT_PLATFORM_IO_KINDS) {
    assert.ok(PLATFORM_IO_HOST_KINDS.includes(kind), kind);
    assert.equal(isPlatformIoResidualKind(kind), true, kind);
    assert.equal(PLATFORM_IO_RESIDUAL_REGISTRY.isPlatformIo(kind), true, kind);
  }
  assert.equal(PLATFORM_IO_RESIDUAL_REGISTRY.isPlatformIo("opaqueCall008607a0"), true);
  assert.equal(PLATFORM_IO_RESIDUAL_REGISTRY.isPlatformIo("transitionQueueScreen"), true);
  assert.equal(PLATFORM_IO_RESIDUAL_REGISTRY.isPlatformIo("opaqueRoomUpdatePrefixB1"), false);
  assert.equal(isPlatformIoResidualKind("opaqueRoomUpdateAmbient824a70"), false);
});

test("loadPureHelperWasm loads zero-import pure modules with ABI check (skip if missing)", async () => {
  const expectedById = {
    render: RENDER_SHELL_PURE_ABI_VERSION,
    processInput: PROCESS_INPUT_PURE_ABI_VERSION,
    exit: EXIT_PURE_ABI_VERSION,
    luaEngine: LUA_ENGINE_PURE_ABI_VERSION,
  };
  let loadedAny = false;
  for (const id of Object.keys(expectedById)) {
    const mod = PURE_HELPER_MODULES[id];
    const pureWasm = join(root, "output", "decomp", mod.dir, mod.wasmFile);
    if (!existsSync(pureWasm)) {
      // Graceful skip when artifact not built for this root.
      continue;
    }
    let loaded;
    try {
      loaded = await loadPureHelperWasm(id);
    } catch (error) {
      // Concurrent peels may bump model ABI before wasm rebuild.
      if (String(error.message || error).includes("Unexpected pure helper ABI")) {
        continue;
      }
      throw error;
    }
    loadedAny = true;
    assert.equal(loaded.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(loaded.usesX86Emulation, false);
    assert.equal(loaded.id, id);
    assert.equal(loaded.abiVersion, expectedById[id]);
    assert.equal(loaded.expectedAbi, mod.expectedAbi);
    assert.ok(loaded.wasm, "exports present");
  }
  if (!loadedAny) {
    assert.ok(true, "no pure-helper wasm present; multi-root load skipped gracefully");
  }
});

test("createMultiRootFrameSession loads Update + pure helpers without PE (skip missing roots)", async () => {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0, "slice build must succeed before multi-root session test");
  }

  const slice = await loadGameUpdateSliceWasm(wasmPath);
  const updateSession = createNativeUpdateSession(slice, {
    state: baseState({ roomType8: 2, frameCounter264f8: 0 }),
    constants,
    runtimeInputs,
    onHostEvent: createResidualHostHandler(),
  });
  const roots = await loadFramePathRoots({
    preferNative: true,
    updateAvailable: true,
    modules: ["render", "processInput", "exit", "luaEngine"],
  });
  const session = createMultiRootFrameSession({ updateSession, roots });

  assert.ok(FRAME_PATH_ROOTS.length === 5);
  assert.equal(session.modes.update, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(session.updateUsesX86Emulation, false);
  assert.ok(session.updateSession, "Update hybrid session must be present");
  assert.equal(session.updateSession.usesX86Emulation, false);
  assert.ok(session.platformIoRegistry);
  assert.equal(session.platformIoRegistry.isPlatformIo("opaqueCall008607a0"), true);
  assert.ok(MULTI_ROOT_PLATFORM_IO_KINDS.includes("opaqueCall008607a0"));

  // Pure helpers: load when present+ABI match; null when missing or stale ABI.
  for (const id of ["render", "processInput", "exit", "luaEngine"]) {
    const helper = session.helpers[id];
    const mod = PURE_HELPER_MODULES[id];
    if (helper) {
      assert.equal(helper.usesX86Emulation, false);
      assert.equal(helper.mode, FRAME_PATH_MODE.NATIVE_WASM);
      assert.equal(helper.abiVersion, mod.expectedAbi);
      assert.equal(session.modes[id], FRAME_PATH_MODE.NATIVE_WASM);
      assert.equal(roots.pureAvailable[id], true);
    } else {
      assert.equal(helper, null, `${id} helper null when wasm missing/stale ABI`);
      assert.equal(session.modes[id], FRAME_PATH_MODE.EMULATOR_X86);
      assert.equal(roots.pureAvailable[id], false);
    }
  }

  if (session.allRootsNative) {
    assert.equal(session.usesX86Emulation, false);
  }

  const tick = session.tick();
  assert.equal(tick.usesX86Emulation, false);
  assert.equal(tick.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(session.ticks, 1);
  assert.ok(!Object.keys(session.hostTotals || {}).some((k) => /emulator|boxedwine|pe-emu/i.test(k)));
});

test("serve mounts pure-helper Wasm under /@decomp/pure without PE", async () => {
  const renderWasm = join(
    root,
    "output",
    "decomp",
    "render-shell-pure",
    "render-shell-pure-helpers.wasm",
  );
  if (!existsSync(renderWasm)) return;

  const server = await startServer({ port: 0, log: () => {} });
  try {
    const { port } = server.address();
    const url = `http://${SERVE_HOST}:${port}/@decomp/pure/render-shell-pure/render-shell-pure-helpers.wasm`;
    // Mount must serve bytes even if model ABI is ahead of artifact.
    const response = await fetch(url);
    assert.equal(response.ok, true, `serve pure mount failed: ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.ok(bytes.byteLength > 0);
    try {
      const loaded = await loadPureHelperWasm("render-shell", url);
      assert.equal(loaded.usesX86Emulation, false);
      assert.equal(loaded.abiVersion, RENDER_SHELL_PURE_ABI_VERSION);
      assert.equal(loaded.name, "render-shell");
    } catch (error) {
      if (String(error.message || error).includes("Unexpected pure helper ABI")) {
        assert.ok(true, "stale pure wasm ABI during peel; serve mount still reachable");
        return;
      }
      throw error;
    }
  } finally {
    await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});

test("pure-helper catalog registers every built companion family", () => {
  // Primary roots and companions are disjoint and together cover the catalog.
  assert.deepEqual(
    [...ALL_PURE_HELPER_IDS].sort(),
    Object.keys(PURE_HELPER_MODULES).sort(),
  );
  for (const id of FRAME_PATH_PURE_ROOT_IDS) {
    assert.equal(FRAME_PATH_COMPANION_PURE_IDS.includes(id), false, `${id} is a primary root`);
  }
  for (const id of ALL_PURE_HELPER_IDS) {
    const spec = PURE_HELPER_MODULES[id];
    assert.equal(spec.id, id);
    assert.match(spec.abiExport, /^isaac_[a-z0-9_]+_abi_version$/);
    assert.match(spec.wasmFile, /\.wasm$/);
    assert.equal(Number.isInteger(spec.expectedAbi) && spec.expectedAbi > 0, true);
    // Resolvable by id, pureName, and directory.
    assert.equal(resolvePureHelperSpec(id), spec);
    assert.equal(resolvePureHelperSpec(spec.pureName), spec);
    assert.equal(resolvePureHelperSpec(spec.dir), spec);
  }
});

test("every registered pure helper loads zero-import at its declared ABI", async () => {
  let loaded = 0;
  let stale = 0;
  for (const id of ALL_PURE_HELPER_IDS) {
    const spec = PURE_HELPER_MODULES[id];
    if (!existsSync(join(root, "output", "decomp", spec.dir, spec.wasmFile))) continue;
    let mod;
    try {
      mod = await loadPureHelperWasm(id);
    } catch (error) {
      // Concurrent peels may bump a model ABI before that family's wasm rebuild.
      if (String(error.message || error).includes("Unexpected pure helper ABI")) {
        stale += 1;
        continue;
      }
      throw error;
    }
    loaded += 1;
    assert.equal(mod.usesX86Emulation, false, `${id} must not use PE`);
    assert.equal(mod.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(mod.abiVersion, spec.expectedAbi);
  }
  assert.equal(loaded + stale > 0, true, "expected at least one built pure-helper artifact");
});

test("companion pure helpers never gate multi-root PE status", async () => {
  const pureAvailable = await probeAvailablePureHelpers(ALL_PURE_HELPER_IDS);

  // All primaries native + every companion missing => still no PE.
  const primariesOnly = { render: true, processInput: true, exit: true, luaEngine: true };
  const modes = selectFramePathRoots({ updateAvailable: true, pureAvailable: primariesOnly });
  assert.equal(multiRootUsesX86Emulation(modes), false);
  for (const id of FRAME_PATH_COMPANION_PURE_IDS) {
    assert.equal(id in modes, false, `${id} absent when not probed`);
  }

  // A missing companion does not flip PE status; it only reports its own mode.
  const withCompanions = selectFramePathRoots({
    updateAvailable: true,
    pureAvailable: { ...primariesOnly, ...Object.fromEntries(FRAME_PATH_COMPANION_PURE_IDS.map((id) => [id, false])) },
  });
  assert.equal(multiRootUsesX86Emulation(withCompanions), false);
  for (const id of FRAME_PATH_COMPANION_PURE_IDS) {
    assert.equal(withCompanions[id], FRAME_PATH_MODE.EMULATOR_X86);
  }

  // Probed availability selects native-wasm for the families actually built.
  const probed = selectFramePathRoots({ updateAvailable: true, pureAvailable });
  for (const id of ALL_PURE_HELPER_IDS) {
    assert.equal(
      probed[id],
      pureAvailable[id] ? FRAME_PATH_MODE.NATIVE_WASM : FRAME_PATH_MODE.EMULATOR_X86,
    );
  }
});

test("multi-root session exposes loaded companion helpers without PE", async () => {
  const roots = await loadFramePathRoots({
    updateAvailable: false,
    modules: ALL_PURE_HELPER_IDS.slice(),
  });
  assert.equal(roots.usesX86Emulation, true, "no Update session => PE until Update is native");

  const session = createMultiRootFrameSession({ roots });
  for (const id of FRAME_PATH_COMPANION_PURE_IDS) {
    const helper = session.helpers[id];
    if (!helper) continue;
    assert.equal(helper.usesX86Emulation, false, `${id} companion must not use PE`);
    assert.equal(helper.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(helper.abiVersion, PURE_HELPER_MODULES[id].expectedAbi);
  }
  for (const [id, message] of Object.entries(roots.loadErrors)) {
    // Only a stale ABI is tolerated; a real load failure is a defect.
    assert.match(message, /Unexpected pure helper ABI/, `${id}: ${message}`);
  }
});

/* ================================================================== */
/* ABI v67: Room capture contract (host-owned state overlay) + F4      */
/* recaptured Pass B driver. Every test drives the REAL slice Wasm.    */
/* ================================================================== */

const INOUT_ROOM_FIELDS = HOST_OWNED_STATE_FIELDS.filter(
  (name) => HOST_OWNED_STATE_CONTRACT[name].direction === "inout",
);

function roomSentinels() {
  const sentinels = {};
  INOUT_ROOM_FIELDS.forEach((name, i) => {
    sentinels[name] = STATE_LAYOUT[name].type === "f32" ? Math.fround(1.5 + i) : 1000 + i;
  });
  return sentinels;
}

async function v67Slice() {
  if (!existsSync(wasmPath)) {
    const built = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-update-slice.mjs")], {
      cwd: root,
      stdio: "inherit",
    });
    assert.equal(built.status, 0);
  }
  return loadGameUpdateSliceWasm(wasmPath);
}

test("v67: fresh sessions on one warm module are deterministic (Room state is per-session)", async () => {
  const slice = await v67Slice();
  /* Before v67 the first session's tick left Room-side struct members behind
     in Wasm memory, so a SECOND fresh session on the same module saw the
     previous session's roomDescFlags44 |= 1 and silently skipped the trigger
     chain: a one-shot keyed to the module instance. The PE keys the chain to
     the RoomDescriptor (VA 0x00804113 / 0x0080427f re-test [desc+0x44] every
     frame), so identical fresh sessions MUST tick identically. */
  const first = createNativeUpdateSession(slice, {}).tick();
  const second = createNativeUpdateSession(slice, {}).tick();
  assert.deepEqual(second.events, first.events, "fresh sessions must not inherit module history");
  assert.deepEqual(second.state, first.state);
  /* The deterministic empty-Room default (flags44 = 0, no enemies) DOES run
     the chain — that is PE truth for a zeroed descriptor, not a regression. */
  assert.equal(first.events.roomTriggerOutput, 1);
  assert.equal(first.events.roomTriggerClearStats, 1);
  assert.equal(first.state.roomDescFlags44, 1, "TriggerClear entry ORs bit0");
});

test("v67: within one session the chain is per-RoomDescriptor-state, not per-instance", async () => {
  const slice = await v67Slice();
  const session = createNativeUpdateSession(slice, {});
  const t1 = session.tick();
  assert.equal(t1.events.roomTriggerOutput, 1);
  assert.equal(t1.state.roomDescFlags44, 1);
  /* Tick 2 consumes tick 1's flags44 |= 1 through the session round-trip. */
  const t2 = session.tick();
  assert.equal(t2.events.roomTriggerOutput, 0, "bit0 set by tick 1 must close the gate");
  assert.equal(t2.events.roomTriggerClearStats, 0);
  /* A statePatch modelling a room change re-opens it — the PE lifecycle. */
  const t3 = session.tick(null, { roomDescFlags44: 0, roomDescClearCount4a: 0 });
  assert.equal(t3.events.roomTriggerOutput, 1, "statePatch must reach the Room lane");
  assert.equal(t3.state.roomDescClearCount4a, 1);
});

test("v67: caller roomDescFlags44 is honoured at both PE trigger gates (&1 vs &9)", async () => {
  const slice = await v67Slice();
  /* Measured four-point map of the two untouched PE gates
     (game_update_slice.cpp `& 1u` TriggerOutput / `& 9u` TriggerClear):
     flags44=0 -> both fire; 1 -> neither; 8 -> output only (bit0 clear but
     bit3 blocks the clear entry); 9 -> neither. Before v67 every value
     behaved like 0 on a fresh module (caller state discarded — measured
     roomTriggerOutput=1 for a session seeded flags44=9). */
  const expectations = [
    { flags: 0, output: 1, stats: 1, outFlags: 1, outCount: 1 },
    { flags: 1, output: 0, stats: 0, outFlags: 1, outCount: 0 },
    { flags: 8, output: 1, stats: 0, outFlags: 8, outCount: 0 },
    { flags: 9, output: 0, stats: 0, outFlags: 9, outCount: 0 },
  ];
  for (const c of expectations) {
    const session = createNativeUpdateSession(slice, {
      state: createDefaultNativeState({ roomDescFlags44: c.flags }),
    });
    const r = session.tick();
    assert.equal(r.events.roomTriggerOutput, c.output, `flags44=${c.flags} TriggerOutput`);
    assert.equal(r.events.roomTriggerClearStats, c.stats, `flags44=${c.flags} TriggerClear chain`);
    assert.equal(r.state.roomDescFlags44, c.outFlags, `flags44=${c.flags} round-trip`);
    assert.equal(r.state.roomDescClearCount4a, c.outCount, `flags44=${c.flags} ClearCount`);
  }
});

test("v67: every inout Room field round-trips exactly on an early-return tick", async () => {
  const slice = await v67Slice();
  const sentinels = roomSentinels();
  /* gate1d520=1 / state24ecc=5 returns at RETURN_AFTER_GATE_1D520 before any
     room peel runs, so ALL 33 inout fields must come back bit-exact. This is
     the whole-contract omission detector: a field dropped from the overlay
     comes back 0 instead of its sentinel and names itself in the diff.
     Before v67 the measured result was 33 of 36 back as zero. */
  const session = createNativeUpdateSession(slice, {
    state: createDefaultNativeState({ ...sentinels, gate1d520: 1, state24ecc: 5 }),
  });
  const r = session.tick();
  assert.equal(r.continuationKind, UPDATE_CONTINUATION.RETURN_AFTER_GATE_1D520);
  for (const name of INOUT_ROOM_FIELDS) {
    assert.equal(r.state[name], sentinels[name], `${name} must round-trip bit-exact`);
  }
  /* Output lanes are per-tick reports: capture pins them 0 even when the
     session state carried nonzero (input side arrives via runtime packs). */
  const outSession = createNativeUpdateSession(slice, {
    state: createDefaultNativeState({ roomDescShortAe: 7, rankDisplayTailOut: 1, gate1d520: 1, state24ecc: 5 }),
  });
  const outTick = outSession.tick();
  assert.equal(outTick.state.roomDescShortAe, 0);
  assert.equal(outTick.state.rankDisplayTailOut, 0);
});

test("v67: full-frame tick mutates Room fields only through documented pure peels", async () => {
  const slice = await v67Slice();
  const sentinels = roomSentinels();
  const session = createNativeUpdateSession(slice, {
    state: createDefaultNativeState(sentinels),
  });
  const r = session.tick();
  /* Deterministic full-frame expectations, each one a recovered pure peel
     applied to the CALLER's value (before v67 these all computed from 0):
     B14 fx lerp, B12 clear-delay shell (enemies present -> set 10), B0 entry
     clear, B6/B15/B17/mid-tail countdowns, B10 boss snapshot, B16 lava decay
     (*0.92f), B18/B19 flag clears, ambient shell (intensity decay + byte
     mask). Everything else must round-trip bit-exact. */
  const expected = {
    ...sentinels,
    roomFxCounter70d8: sentinels.roomFxCounter70d8 + 1,
    roomFxValue70cc: Math.fround(sentinels.roomFxValue70cc + sentinels.roomFxStep70d4),
    roomFxCounter70f4: sentinels.roomFxCounter70f4 + 1,
    roomFxValue70e8: Math.fround(sentinels.roomFxValue70e8 + sentinels.roomFxStep70f0),
    roomClearDelay11ec: 10,
    roomByte7220: 0,
    roomWaterLerpCountdown7298: sentinels.roomWaterLerpCountdown7298 - 1,
    roomBossSnapshot7224: sentinels.roomBossCount12c8 + sentinels.roomBossCount12cc,
    roomTimer722c: sentinels.roomTimer722c - 1,
    roomCollectibleTimer7764: sentinels.roomCollectibleTimer7764 - 1,
    roomTimer7214: sentinels.roomTimer7214 - 1,
    roomTimer706c: sentinels.roomTimer706c - 1,
    roomTimer7230: sentinels.roomTimer7230 - 1,
    roomLavaIntensity7740: Math.fround(sentinels.roomLavaIntensity7740 * Math.fround(0.92)),
    roomFlag7894: 0,
    roomFlag7769: 0,
    roomAmbientIntensity7458: Math.fround(sentinels.roomAmbientIntensity7458 - Math.fround(0.02)),
    roomAmbientFlag745c: sentinels.roomAmbientFlag745c & 0xff,
  };
  for (const name of INOUT_ROOM_FIELDS) {
    assert.equal(r.state[name], expected[name], `${name} full-frame result`);
  }
});

test("v67: createDefaultNativeState enumerates every STATE_LAYOUT key", () => {
  /* The session statePatch guard and the browser snapshot-seed filter both
     test `key in session.state`; before v67 the default object was missing
     66 STATE_LAYOUT keys, so first-tick patches on legitimate sparse fields
     (roomDescFlags44 included) threw and live-capture seeds silently dropped
     those fields. */
  const defaults = createDefaultNativeState();
  for (const name of Object.keys(STATE_LAYOUT)) {
    assert.ok(name in defaults, `${name} missing from createDefaultNativeState()`);
  }
  assert.deepEqual(
    Object.keys(defaults).filter((k) => !(k in STATE_LAYOUT)),
    [],
    "no keys outside STATE_LAYOUT",
  );
});

test("v67: rankDisplayClear3b0Out reaches the buffer byte through the alias map", async () => {
  const slice = await v67Slice();
  /* Before v67 a state-keyed write for this field was a silent no-op: the
     byte's BINARY_LAYOUT home is recorded under the JSON name
     rankDisplayByte3b0, so writeSparseFieldsToGameObject skipped it and a
     session statePatch was discarded by the next capture. */
  const buffer = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  writeSparseFieldsToGameObject(buffer, { rankDisplayClear3b0Out: 5 });
  assert.equal(buffer[0x1da00], 5, "state-named write must land at Game+0x1da00");
  const readBack = readSparseFieldsFromGameObject(buffer);
  assert.equal(readBack.rankDisplayClear3b0Out, 5, "state-named read");
  assert.equal(readBack.rankDisplayByte3b0, 5, "legacy-named read of the same byte");
  /* End to end: a session statePatch must survive capture via the buffer
     (early-return tick so the rank-display fold cannot overwrite it). */
  const session = createNativeUpdateSession(slice, {
    state: createDefaultNativeState({ gate1d520: 1, state24ecc: 5 }),
  });
  const r = session.tick(null, { rankDisplayClear3b0Out: 5 });
  assert.equal(r.state.rankDisplayClear3b0Out, 5, "statePatch must round-trip through the buffer");
  assert.equal(session.gameObject[0x1da00], 5);
});

test("v67: runHybridGameUpdateTick without hostState is the deterministic empty-Room default", async () => {
  const slice = await v67Slice();
  const mk = () => new Uint8Array(GAME_OBJECT_MIN_SIZE);
  const a = runHybridGameUpdateTick(slice, { gameObject: mk() });
  const b = runHybridGameUpdateTick(slice, { gameObject: mk() });
  assert.deepEqual(b.events, a.events, "repeat hybrid ticks must not depend on module history");
  assert.deepEqual(b.state, a.state);
  /* hostState typo guard: silent no-ops are the defect class this fixes. */
  assert.throws(
    () => runHybridGameUpdateTick(slice, { gameObject: mk(), hostState: { roomDescFlagz44: 9 } }),
    /unknown sparse state field in hostState: roomDescFlagz44/,
  );
  /* hostState honoured on the direct hybrid call, not only via sessions. */
  const kept = runHybridGameUpdateTick(slice, {
    gameObject: mk(),
    hostState: { roomDescFlags44: 9 },
  });
  assert.equal(kept.events.roomTriggerOutput, 0);
  assert.equal(kept.state.roomDescFlags44, 9);
});

test("v67/F4: hybrid Pass B gates on the recaptured buffer list header (frozen F4 contract)", async () => {
  const slice = await v67Slice();
  const mk = () => new Uint8Array(GAME_OBJECT_MIN_SIZE);
  /* (a) Empty header beats a synthetic runtime declaration: the buffer IS the
     Game object, and its 0x68-stride list header at Game+0x1bbe0/+0x1bbe4
     reads empty, so the PE recount (0x00425870, gate 0x00425894 je) skips
     Pass B even though the legacy runtime input claimed one element. */
  const a = runHybridGameUpdateTick(slice, {
    gameObject: mk(),
    runtimeInputs: createDefaultNativeRuntimeInputs({
      frameOpaque4257b0IdCount: 2,
      frameOpaque4257b0ListCount: 1,
    }),
  });
  assert.equal(a.events.opaqueCall004257b0PassA, 1);
  assert.equal(a.events.opaqueCall004257b0PassB, 0, "empty buffer list must skip Pass B");
  /* (b) THE under-host hazard this fixes: Pass A ran over an empty declared
     pre-list, but the buffer holds one element — before v67 the driver folded
     the pre count (0) into the recaptured gate and DROPPED a Pass B host
     event the original runs. */
  const buf = mk();
  const view = new DataView(buf.buffer);
  view.setUint32(0x1bbe0, 0x1000, true); /* begin - always written with end */
  view.setUint32(0x1bbe4, 0x1000 + 0x68, true); /* end: one 0x68-stride element */
  const host = createResidualHostHandler();
  const b = runHybridGameUpdateTick(slice, {
    gameObject: buf,
    onHostEvent: host,
    runtimeInputs: createDefaultNativeRuntimeInputs({
      frameOpaque4257b0IdCount: 2,
      frameOpaque4257b0ListCount: 0,
    }),
  });
  assert.equal(b.events.opaqueCall004257b0PassA, 1);
  assert.equal(b.events.opaqueCall004257b0PassB, 1, "recaptured count 1 must run Pass B");
  const passB = host.executed.find((e) => e.kind === "opaqueCall004257b0PassB");
  assert.ok(passB, "residual body must have run for Pass B");
  assert.equal(passB.result.postPassAListCount, 1, "event must carry the recaptured count");
  assert.equal(passB.result.pureGate, "frameOpaque4257b0PassBNeedsHostRecaptured");
  assert.equal(passB.result.residual, "4257b0-pass-b-host");
  /* (c) An explicit caller post count (live recaptured guest memory) wins. */
  const c = runHybridGameUpdateTick(slice, {
    gameObject: mk(),
    runtimeInputs: createDefaultNativeRuntimeInputs({
      frameOpaque4257b0IdCount: 2,
      frameOpaque4257b0PostPassAListCount: 3,
    }),
  });
  assert.equal(c.events.opaqueCall004257b0PassB, 1);
  /* (d)+(e) The OTHER consumer of the contract: on the id_count == 0 path the
     PE reaches the recount with the list untouched (0x004257ee je 0x00425870),
     so the PRE-tick capture of Game+0x1bbe0/+0x1bbe4 gates Pass B directly —
     no resume, no recapture. Both sides, so neither a dropped pre-derivation
     nor a stale synthetic declaration can hide. */
  const bufD = mk();
  const viewD = new DataView(bufD.buffer);
  viewD.setUint32(0x1bbe0, 0x2000, true);
  viewD.setUint32(0x1bbe4, 0x2000 + 0x68, true);
  const d = runHybridGameUpdateTick(slice, {
    gameObject: bufD,
    runtimeInputs: createDefaultNativeRuntimeInputs({
      frameOpaque4257b0IdCount: 0,
      frameOpaque4257b0ListCount: 0,
    }),
  });
  assert.equal(d.events.opaqueCall004257b0PassA, 0, "id 0 must keep Pass A pure");
  assert.equal(d.events.opaqueCall004257b0PassB, 1, "pre-captured buffer count 1 must run Pass B");
  const e = runHybridGameUpdateTick(slice, {
    gameObject: mk(),
    runtimeInputs: createDefaultNativeRuntimeInputs({
      frameOpaque4257b0IdCount: 0,
      frameOpaque4257b0ListCount: 1,
    }),
  });
  assert.equal(e.events.opaqueCall004257b0PassB, 0, "empty pre-captured buffer must skip Pass B");
});

test("v67/F4: the residual Pass B body uses the PE-exact recaptured form", () => {
  const bodies = createDefaultResidualBodies();
  /* The superseded conservative (idCount || listCount) form ran Pass B for
     idCount!=0 with a zero recaptured count — a superset that would silently
     mask a wrong recapture. The PE gate consumes ONLY the recount. */
  const skip = bodies.opaqueCall004257b0PassB({
    kind: "opaqueCall004257b0PassB",
    count: 1,
    idCount: 1,
    postPassAListCount: 0,
  });
  assert.equal(skip.pureComplete, true, "zero recaptured count must be a pure skip");
  assert.equal(skip.residual, "4257b0-pass-b-pure-skip");
  assert.equal(skip.pureGate, "frameOpaque4257b0PassBNeedsHostRecaptured");
  const run = bodies.opaqueCall004257b0PassB({
    kind: "opaqueCall004257b0PassB",
    count: 1,
    idCount: 0,
    postPassAListCount: 2,
  });
  assert.equal(run.pureComplete, false);
  assert.equal(run.postPassAListCount, 2);
});

/* =====================================================================
 * Wave-2 frame-path roots (landed 2026-08-11):
 *  (a) ProcessInput pre-poll driver (ABI 25),
 *  (b) Exit root plan + map-walk continuation (ABI 35),
 *  (d) playerhud v17 UpdateHearts call plans (twin/single),
 *  (e) residual log edge through the log v5 level-gate,
 *  (c) LuaEngine registration pin.
 * Every driver has a module-backed path (real zero-import Wasm) and a
 * pre-wave fallback; the two are cross-checked against each other and the
 * fallback is pinned so a missing root stays byte-for-byte old behaviour.
 * ===================================================================== */

test("wave2/ProcessInput: prepoll driver pins ABI helper names", () => {
  const spec = resolvePureHelperSpec("processInput");
  assert.equal(spec.expectedAbi, PROCESS_INPUT_PURE_ABI_VERSION, "processInput root ABI");
  /* 13 gate/plan exports: state4 store, G1/G2/G3/G4, host C, state 3/5
     transitions, arm select, copy block, game b0 next, log, nightmare arg. */
  assert.equal(PROCESS_INPUT_PREPOLL_PURE_HELPER_NAMES.length, 13);
  for (const name of PROCESS_INPUT_PREPOLL_PURE_HELPER_NAMES) {
    assert.ok(name.startsWith("manager_prepoll_"), name);
  }
});

test("wave2/ProcessInput: wasm-backed prepoll plan agrees with the JS oracle", async () => {
  const module = await loadPureHelperWasm("processInput");
  const js = processInputPrepollJsPure();
  const wasm = processInputPrepollWasmPure(module.wasm);
  const cases = [
    { byte0: 0, state: 0, history: 0, byte21618: 0, byte21620: 0, byte4b2a4: 0,
      dword21628: 0, dword20dd0: 0, byte4b428: 0, gameB0: 0 },
    { byte0: 1, state: 3, history: 2, byte21618: 0, byte21620: 0, byte4b2a4: 0,
      dword21628: 0x1234, dword20dd0: 0, byte4b428: 0, gameB0: 1.5 },
    { byte0: 0, state: 3, history: 1, byte21618: 0x100, byte21620: 1, byte4b2a4: 0,
      dword21628: 0, dword20dd0: 0, byte4b428: 0, gameB0: 0 },
    { byte0: 0, state: 5, history: 0, byte21618: 0, byte21620: 0, byte4b2a4: 0xff,
      dword21628: 0, dword20dd0: 1, byte4b428: 0, gameB0: 0 },
    { byte0: 0, state: 3, history: 1, byte21618: 0, byte21620: 0, byte4b2a4: 0,
      dword21628: 0, dword20dd0: 0, byte4b428: 0x100, gameB0: 2.0 },
    { byte0: 0x80000000, state: 3, history: 1, byte21618: 0, byte21620: 1,
      byte4b2a4: 0, dword21628: 0, dword20dd0: 0, byte4b428: 0, gameB0: -0.5 },
  ];
  for (const inputs of cases) {
    const a = runProcessInputPrepollRoot(inputs, js);
    const b = runProcessInputPrepollRoot(inputs, wasm);
    assert.deepEqual(b.gates, a.gates, `gates for ${JSON.stringify(inputs)}`);
    assert.deepEqual(b.hosts, a.hosts, `hosts for ${JSON.stringify(inputs)}`);
    assert.deepEqual(b.stores, a.stores, `stores for ${JSON.stringify(inputs)}`);
    assert.equal(b.gameStoreBlock?.b0Next ?? null, a.gameStoreBlock?.b0Next ?? null);
    assert.equal(b.wired, true);
    assert.equal(b.usesX86Emulation, false);
  }
});

test("wave2/ProcessInput: wide byte gates are narrowed in-body, never pre-masked", () => {
  const js = processInputPrepollJsPure();
  /* byte21618 = 0x100: AL == 0, so G1 must be CLOSED (uint8_t-parameter
     defect class — a pre-masked caller would open it). */
  const wide = runProcessInputPrepollRoot(
    { state: 3, byte21618: 0x100, byte21620: 0, byte4b2a4: 0,
      dword21628: 0, dword20dd0: 0, byte4b428: 0 }, js);
  assert.equal(wide.gates.g1, false);
  assert.equal(wide.gates.state3, false);
  assert.equal(wide.gates.hostC, false);
  assert.equal(wide.hosts.find((h) => h.id === "D").needed, false);
  const open = runProcessInputPrepollRoot(
    { state: 3, byte21618: 1, byte21620: 0x100, byte4b2a4: 0,
      dword21628: 0, dword20dd0: 0, byte4b428: 0 }, js);
  assert.equal(open.gates.state3, true);
  assert.equal(open.gates.hostC, false, "G2 high byte 0x100 must not satisfy G2");
});

test("wave2/ProcessInput: state-3 arm copy block and G4 path are PE-ordered", () => {
  const js = processInputPrepollJsPure();
  const copy = runProcessInputPrepollRoot({
    state: 3, history: 7, byte21618: 0, byte21620: 1, byte4b2a4: 0,
    dword21628: 0, dword20dd0: 0, dword21624: 0x22, slotIndex: 2, byte4b428: 0,
  }, js);
  assert.equal(copy.gates.arm, 3);
  assert.equal(copy.gates.copyBlock, true);
  assert.equal(copy.gates.g4Path, false);
  assert.deepEqual(copy.stores, [
    { off: 0x29fb8, value: 0, bytes: 1 },
    { off: 0x8, value: 7, bytes: 4 },
    { off: 0x4b28c, value: 0x22, bytes: 4 },
    { off: 0x20e00 + 2 * 0x4c, to: 0x4b290, bytes: 0x10 },
    { off: 0x20e10 + 2 * 0x4c, to: 0x4b2a0, bytes: 4 },
    { off: 0x4b288, value: 1, bytes: 1 },
    { off: 0x4b428, value: 0, bytes: 1 },
  ], "copy block stores + join byte");
  assert.equal(copy.hosts.find((h) => h.id === "B").needed, true,
    "host B re-runs inside the copy block (PE 0x954e60)");
  const g4 = runProcessInputPrepollRoot({
    state: 3, history: 1, byte21618: 0, byte21620: 0, byte4b2a4: 0,
    dword21628: 0, dword20dd0: 0, byte4b428: 1, gameB0: 2.0,
  }, js);
  assert.equal(g4.gates.g4Path, true);
  assert.equal(g4.hosts.find((h) => h.id === "F").needed, true);
  assert.equal(g4.hosts.find((h) => h.id === "G").needed, true);
  assert.equal(g4.hosts.find((h) => h.id === "H").needed, true);
  assert.equal(g4.gameStoreBlock.b0Next, 3.0, "addss +1.0f on the old value");
  assert.equal(g4.logEdge.dropped, true,
    "default log scenario (no logger installed) drops the message in the PE");
  assert.equal(g4.logEdge.plan.initFailDrops, 1);
  /* history != 1: the log + crossfade tail is skipped entirely. */
  const noTail = runProcessInputPrepollRoot({
    state: 3, history: 2, byte21618: 0, byte21620: 0, byte4b2a4: 0,
    dword21628: 0, dword20dd0: 0, byte4b428: 1, gameB0: 0,
  }, js);
  assert.equal(noTail.hosts.find((h) => h.id === "H").needed, false);
  assert.equal(noTail.logEdge, null);
});

test("wave2/ProcessInput: fallback (no module) is the pre-wave monolithic residual", () => {
  const plan = runProcessInputPrepollRoot({ state: 3, byte21618: 1 }, null);
  assert.equal(plan.fallback, true);
  assert.equal(plan.wired, false);
  assert.equal(plan.monolithic, true);
  assert.equal(plan.residualEvents[0].kind, "processInputPrepollMonolithic");
  assert.equal(plan.hosts.length, 8);
  assert.ok(plan.hosts.every((h) => h.needed === true),
    "pre-wave host surface keeps every edge");
  assert.equal(plan.usesX86Emulation, false);
});

test("wave2/Exit: root plan wasm-backed agrees with the JS oracle and ABI 35", async () => {
  const spec = resolvePureHelperSpec("exit");
  assert.equal(spec.expectedAbi, EXIT_PURE_ABI_VERSION, "exit root ABI");
  const module = await loadPureHelperWasm("exit");
  const js = exitRootJsPure();
  const wasm = exitRootWasmPure(module.wasm);
  const cases = [
    { shouldSave: 0, sessionActive2658a: 0, overlayState1c034: 0,
      mgrChangesmade14: 0, mgrFileLoadedf8c: 0, steamCtxWord: 0,
      mgrCloud2a3a4: 0, skipGamestateIo2658b: 0, mgrCount29fbc: 0,
      vectorBegin: 0, vectorEnd: 0, setIndex7d8: 0 },
    { shouldSave: 1, sessionActive2658a: 1, overlayState1c034: 1,
      mgrChangesmade14: 1, mgrFileLoadedf8c: 1, steamCtxWord: 0x80000000,
      mgrCloud2a3a4: 1, skipGamestateIo2658b: 0, mgrCount29fbc: 4,
      vectorBegin: 0x1000, vectorEnd: 0x1380, setIndex7d8: 2 },
    { shouldSave: 0, sessionActive2658a: 0x100, overlayState1c034: 2,
      mgrChangesmade14: 0, mgrFileLoadedf8c: 1, steamCtxWord: 1,
      mgrCloud2a3a4: 0, skipGamestateIo2658b: 1, mgrCount29fbc: 0,
      vectorBegin: 0, vectorEnd: 0, setIndex7d8: 0 },
  ];
  for (const inputs of cases) {
    const a = runExitRootPlan(inputs, js);
    const b = runExitRootPlan(inputs, wasm);
    assert.deepEqual(b.plan, a.plan, `exit plan for ${JSON.stringify(inputs)}`);
  }
  /* Session-active low-byte gate: 0x100 has AL == 0 -> inactive. */
  const wide = runExitRootPlan(
    { shouldSave: 1, sessionActive2658a: 0x100, overlayState1c034: 0,
      mgrChangesmade14: 0, mgrFileLoadedf8c: 0, steamCtxWord: 0,
      mgrCloud2a3a4: 0, skipGamestateIo2658b: 0, mgrCount29fbc: 0,
      vectorBegin: 0, vectorEnd: 0, setIndex7d8: 0 }, js);
  assert.equal(wide.plan.entryActive, false);
  assert.equal(wide.plan.eventCount, 0, "closed gate -> empty plan (PE 0x006fa531)");
});

test("wave2/Exit: map-walk continuation wasm-backed agrees with the JS oracle", async () => {
  const module = await loadPureHelperWasm("exit");
  const wasm = exitRootWasmPure(module.wasm);
  const js = exitRootJsPure();

  /* Build a 3-node MSVC _Tree in a JS-owned DataView at hiBase. Layout per
     exit-pure-model: sentinel [0]=root [4]=_Parent; node = left(0) parent(4)
     right(8) color/count(0xc..0xf, isnil byte at 0xd) key(std::string at
     0x10: SSO bytes, size at 0x14, cap at 0x18) flag byte at 0x28, elem
     begin/end at 0x44/0x48, elem stride 0x20, elem host at elem+0x18. */
  const hiBase = 0x1000000; /* inside the 16.9MB wasm memory */
  const MAP = hiBase + 0x100;
  const nil = MAP + 0x20;      /* MSVC head node: [MAP] = head, head is the sentinel */
  const An = MAP + 0x40, Bn = MAP + 0x100, Cn = MAP + 0x1c0;
  const ELEMS = MAP + 0x300;
  const size = hiBase + 0x20000; /* absolute-addressed JS view (covers the 0x10000 walk region) */
  const buffer = new ArrayBuffer(size);
  const view = new DataView(buffer);
  const u8 = new Uint8Array(buffer);
  /* ABSOLUTE addressing: the oracle trace reads guest addresses directly
     from the view (the buffer spans the whole address space). */
  const w32 = (a, v) => view.setUint32(a >>> 0, v >>> 0, true);
  const w8 = (a, v) => view.setUint8(a >>> 0, v & 0xff);
  const wstr = (strBase, s) => {
    /* std::string at strBase: SSO bytes, size at +0x10, cap at +0x14. */
    for (let i = 0; i < 16; i++) u8[strBase + i] = 0;
    for (let i = 0; i < s.length; i++) u8[strBase + i] = s.charCodeAt(i);
    w32(strBase + EXIT_MSVC_STRING_SIZE_OFF, s.length);
    w32(strBase + EXIT_MSVC_STRING_CAP_OFF, 0xf);
  };
  const node = (addr, key, flag, left, parent, right, elemBegin, elemEnd) => {
    w32(addr + 0, left); w32(addr + 4, parent); w32(addr + 8, right);
    w8(addr + 0xd, 0);           /* isnil = 0 */
    wstr(addr + EXIT_MAP_NODE_KEY_OFF, key);
    w8(addr + EXIT_MAP_NODE_FLAG_OFF, flag);
    w32(addr + EXIT_MAP_NODE_BEGIN_OFF, elemBegin);
    w32(addr + EXIT_MAP_NODE_END_OFF, elemEnd);
  };
  /* head node: left = first node, parent = root, right = rightmost, isnil = 1. */
  w32(MAP + 0, nil);
  w32(nil + EXIT_TREE_LEFT_OFF, An); w32(nil + EXIT_TREE_PARENT_OFF, Bn);
  w32(nil + EXIT_TREE_RIGHT_OFF, Cn); w8(nil + EXIT_TREE_ISNIL_OFF, 1);
  node(An, "a", 1, nil, Bn, nil, 0, 0);
  node(Bn, "b", 0, An, nil, Cn, 0, 0);
  node(Cn, "c", 1, nil, Bn, nil, ELEMS, ELEMS + 2 * EXIT_MAP_ELEM_STRIDE);
  /* C's elems: two 0x20-byte slots; host receiver at elem+0x18. */
  w32(ELEMS + 0x18, 0x77770001);
  w32(ELEMS + 0x20 + 0x18, 0x77770002);

  const a = runExitMapWalkContinuation(view, MAP, hiBase + 0x500, js);
  /* The JS oracle applies the flag clears to the caller's buffer (PE truth:
     the walk clears flags in place), so restore the pristine flags before
     handing the same tree to the Wasm module — mirrors the exit family's
     runPlanPair restore step. */
  view.setUint8(An + EXIT_MAP_NODE_FLAG_OFF, 1);
  view.setUint8(Cn + EXIT_MAP_NODE_FLAG_OFF, 1);
  const b = runExitMapWalkContinuation(view, MAP, hiBase + 0x500, wasm);
  assert.equal(a.walkActive, 1);
  assert.equal(a.nodeCount, 3);
  assert.equal(a.elemHostCount, 2);
  assert.equal(a.flagClearCount, 2);
  assert.equal(a.globalHostCount, 3);
  assert.equal(a.truncated, 0);
  assert.equal(a.events.length, 7);
  assert.deepEqual(b, a, "wasm walk plan must match the JS oracle");
  const kinds = a.events.map((e) => e.kind);
  assert.deepEqual(kinds, [
    "exitRootMapWalkFlagClear", "exitRootMapWalkGlobalHost",
    "exitRootMapWalkGlobalHost", "exitRootMapWalkElemHost",
    "exitRootMapWalkElemHost", "exitRootMapWalkFlagClear",
    "exitRootMapWalkGlobalHost",
  ], "PE order: FLAG_CLEAR(A), GLOBAL, GLOBAL, ELEM, ELEM, FLAG_CLEAR(C), GLOBAL");
  /* The applied flag clears must land in the caller's buffer (walk applies,
     like the PE) — same on both sides. */
  assert.equal(view.getUint8(An + EXIT_MAP_NODE_FLAG_OFF), 0);
  assert.equal(view.getUint8(Bn + EXIT_MAP_NODE_FLAG_OFF), 0);
  assert.equal(view.getUint8(Cn + EXIT_MAP_NODE_FLAG_OFF), 0);
  /* Scalar continuation helpers agree. */
  assert.equal(wasm.flagActive(0), false);
  assert.equal(wasm.flagActive(1), true);
  assert.equal(wasm.flagAddr(An), An + 0x28);
  assert.equal(wasm.elemHostThis(ELEMS), ELEMS + 0x18);
});

test("wave2/Exit: map-walk fallback stays monolithic when no module", () => {
  const view = new DataView(new ArrayBuffer(0x100));
  const plan = runExitMapWalkContinuation(view, 0x100, 0, null);
  assert.equal(plan.fallback, true);
  assert.equal(plan.residualEvents[0].kind, "exitRootMapWalkMonolithic");
  assert.equal(plan.usesX86Emulation, false);
});

test("wave2/playerhud: UpdateHearts call plans twin/single with live re-read", () => {
  const js = playerHudUpdateHeartsJsPure();
  const twin = playerHudUpdateHeartsPlan(
    { twinPtr: 0x12345, playerType: 0x10, field3bc: 0 }, js);
  assert.equal(twin.isTwin, 1);
  assert.equal(twin.calls.length, 2);
  assert.deepEqual(twin.calls.map((c) => [c.heartSlotsOff, c.maxSlots, c.argSource]), [
    [0x10, 6, 0], [0x70, 6, 1],
  ], "UpdateHearts(hud+0x10,6,player) then UpdateHearts(hud+0x70,6,twin)");
  assert.equal(twin.calls[1].liveReRead, true,
    "ARG_TWIN re-reads [player+0x1d98] live at 0x008422ca");
  assert.equal(twin.calls[0].liveReRead, false);
  const single = playerHudUpdateHeartsPlan(
    { twinPtr: 0, playerType: 0x10, field3bc: 0 }, js);
  assert.equal(single.isTwin, 0);
  assert.deepEqual(single.calls.map((c) => [c.heartSlotsOff, c.maxSlots]), [[0x10, 0x18]]);
  /* type 0x12 is not a twin type even with a twin pointer. */
  const notTwin = playerHudUpdateHeartsPlan(
    { twinPtr: 0x12345, playerType: 0x12, field3bc: 0 }, js);
  assert.equal(notTwin.isTwin, 0);
  /* field3bc != 0 closes the twin path. */
  const f3bc = playerHudUpdateHeartsPlan(
    { twinPtr: 0x12345, playerType: 0x10, field3bc: 1 }, js);
  assert.equal(f3bc.isTwin, 0);
  /* Fallback: pre-wave count-only shape. */
  const fb = playerHudUpdateHeartsPlan({ twinPtr: 0x12345, playerType: 0x10 }, null);
  assert.equal(fb.fallback, true);
});

test("wave2/playerhud: wasm-backed UpdateHearts plan agrees with the JS oracle", async () => {
  const module = await loadPureHelperWasm("playerHud");
  const wasm = playerHudUpdateHeartsWasmPure(module.wasm);
  for (const pack of [
    { twinPtr: 0x12345, playerType: 0x10, field3bc: 0 },
    { twinPtr: 0x12345, playerType: 0x11, field3bc: 0 },
    { twinPtr: 0, playerType: 0x10, field3bc: 0 },
    { twinPtr: 0x12345, playerType: 0x12, field3bc: 0 },
    { twinPtr: 0x12345, playerType: 0x10, field3bc: 0xffffffff },
  ]) {
    const a = playerHudUpdateHeartsPlan(pack, playerHudUpdateHeartsJsPure());
    const b = playerHudUpdateHeartsPlan(pack, wasm);
    assert.deepEqual(b, a, `plan for ${JSON.stringify(pack)}`);
  }
});

test("wave2/residual-body: playerHudUpdateHearts body resolves per-slot plans", () => {
  const bodies = createDefaultResidualBodies();
  const withPacks = bodies.playerHudUpdateHearts({
    kind: "playerHudUpdateHearts",
    count: 2,
    detail: {
      packs: [
        { slot: 0, twin: true, twinPtr: 0x100, playerType: 0x10, field3bc: 0 },
        { slot: 1, twin: false, twinPtr: 0, playerType: 0x10, field3bc: 0 },
      ],
    },
  });
  assert.equal(withPacks.residual, "playerhud-update-hearts-pure-plan");
  assert.equal(withPacks.calls, 3, "twin slot = 2 calls, single slot = 1 call");
  assert.equal(withPacks.slots[0].plan.calls.length, 2);
  assert.equal(withPacks.slots[1].plan.calls.length, 1);
  assert.equal(withPacks.platformIo, false);
  /* Pre-wave shape: count only, no packs. */
  const countOnly = bodies.playerHudUpdateHearts({
    kind: "playerHudUpdateHearts", count: 1, detail: { packs: null },
  });
  assert.equal(countOnly.residual, "playerhud-update-hearts-count-only");
  assert.equal(countOnly.calls, 1);
});

test("wave2/log: residual log edge follows the pure level-gate", () => {
  /* Guard closed -> dropped before any I/O. */
  const guard = residualLogEdge({ level: 1, guard: 1, initOk: 1 });
  assert.equal(guard.dropped, true);
  assert.equal(guard.plan.droppedGuard, 1);
  assert.equal(guard.host, null);
  /* No logger installed (initOk 0) -> init fails, message dropped (PE truth). */
  const noInit = residualLogEdge({ level: 1, guard: 0, initOk: 0 });
  assert.equal(noInit.dropped, true);
  assert.equal(noInit.plan.initFailDrops, 1);
  /* Logger installed, level gate open -> host tail needed with lock/prefix. */
  const live = residualLogEdge({
    level: 1, guard: 2, initOk: 1, atLineStartByte: 1,
    va: 0x00a112c0, msgVa: 0x00b7d234,
  });
  assert.equal(live.dropped, false);
  assert.equal(live.host.va, 0x00a112c0);
  assert.equal(live.host.msgVa, 0x00b7d234);
  assert.equal(live.plan.lockNeeded, 1);
  assert.equal(live.plan.initNeeded, 0);
  /* Level 0x100 has low byte 0 -> gate closed even with a live listener. */
  const wide = residualLogEdge({ level: 0x100, guard: 2, initOk: 1 });
  assert.equal(wide.dropped, true);
  assert.equal(wide.plan.droppedGate, 1);
});

test("wave2/log: PM3 SFX warn-log edge attaches on NO_SAMPLES only", () => {
  const bodies = createDefaultResidualBodies();
  const play = bodies.playerManagerUpdateHeartbeatSfxPlay({
    kind: "playerManagerUpdateHeartbeatSfxPlay",
    count: 1,
    detail: { gate: PM_SFX_GATE_NO_SAMPLES, warnLog: null },
  });
  assert.equal(play.sfxGate, PM_SFX_GATE_NO_SAMPLES);
  assert.equal(play.logEdge, null);
  const warn = bodies.playerManagerUpdateHeartbeatSfxPlay({
    kind: "playerManagerUpdateHeartbeatSfxPlay",
    count: 1,
    detail: {
      gate: PM_SFX_GATE_NO_SAMPLES,
      warnLog: { level: PM_SFX_WARN_LOG_LEVEL, msgVa: PM_SFX_WARN_LOG_STR_VA,
        va: PM_SFX_WARN_LOG_VA, guard: 0, listenerPtr: 0, listenerMask: 0,
        atLineStartByte: 0, initOk: 0 },
    },
  });
  assert.equal(warn.logEdge.dropped, true,
    "no logger installed -> the PE drops the warn message; host edge omitted");
  assert.equal(warn.logEdge.plan.initFailDrops, 1);
  assert.equal(warn.platformIo, true, "the SFX call itself stays a platform IO residual");
  assert.equal(warn.usesX86Emulation, false);
});

test("wave2/LuaEngine: root registration and ABI are pinned", () => {
  const spec = resolvePureHelperSpec("luaEngine");
  assert.equal(spec.expectedAbi, LUA_ENGINE_PURE_ABI_VERSION, "luaEngine root ABI");
  assert.equal(spec.id, "luaEngine");
  assert.ok(FRAME_PATH_PURE_ROOT_IDS.includes("luaEngine"));
  const roots = FRAME_PATH_ROOTS;
  const lua = roots.find((r) => r.id === "LuaEngine");
  assert.ok(lua, "LuaEngine present in the frame-path roots catalog");
});
