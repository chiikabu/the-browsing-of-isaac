import { frameOpaque4257b0ListCountFromBounds, FRAME_OPAQUE_4257B0_ELEM_TIMER_INIT } from "./frame-opaque-pure-model.mjs";
import { spawnSync } from "node:child_process";import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ABI_SIZES,
  ABI_VERSION,
  BINARY_LAYOUT,
  CONSTANTS_LAYOUT,
  EVENTS_LAYOUT,
  GAME_OBJECT_MIN_SIZE,
  RUNTIME_INPUTS_LAYOUT,
  STATE_LAYOUT,
  UPDATE_CONTINUATION,
  continueGameUpdateMenuGates,
  continueGameUpdateTimedTransition,
  readStruct,
  resumeGameUpdateGate1b83c,
  resumeGameUpdate92f1c0,
  resumeGameUpdateFrameAuxUpdates,
  resumeGameUpdateGenericPrompt,
  resumeGameUpdateItemOverlay,
  resumeGameUpdateMenuOpen,
  resumeGameUpdateMenuUpdate,
  resumeGameUpdateRoomTransitionEffect,
  resumeGameUpdateEnginePrefix,
  resumeGameUpdate98dba0PlayerWalk,
  resumeGameUpdateStageTransitionEffect,
  resumeGameUpdateFrameManagerUpdates,
  resumeGameUpdateRoomClearNested,
  resumeGameUpdateRoomUpdateClear,
  resumeGameUpdateRoomUpdateHead,
  resumeGameUpdate4257b0PassA,
  frameOpaque4257b0Outcome,
  FRAME_OPAQUE_4257B0_MAX_PLAYERS,
  FRAME_OPAQUE_40ADD0_MAX_ENTRIES,
  FRAME_OPAQUE_4257B0_MAX_ELEMS,
  FRAME_OPAQUE_4257B0_MAX_LIST,
  resumeGameUpdateRoomUpdatePrefix,
  resumeGameUpdateRoomUpdatePrefixB1,
  resumeGameUpdateRoomUpdatePrefixB2,
  scaleMonotonicCounter,
  stepGameUpdateSlice,
  gameUpdateSliceB16WaterWire,
  gameUpdateSlice92f1c0TryPure,
  writeStruct,
  normalizeRuntimeInputsForLayout,
  overlayHostOwnedState,
  HOST_OWNED_STATE_FIELDS,
  STATE_TO_BINARY_ALIASES,
  UPDATE_LIST_MAX_NODES,
  updateListSweep,
  updateListTimersFromRuntime,
  HUD_STAT_COUNTDOWN_COUNT,
  hudStatCountdownLaneActive,
  hudStatCountdownTick,
  hudStatCountdownValues,
  ENGINE_PLAYER_MAX,
  OPAQUE_0092E300_MAX_GROUPS,
  OPAQUE_0092E300_MAX_VOICES,
  flattenOpaque0092e300VoicesRuntime,
  playerFlag410Broadcast,
  MENU_AUX_TREE_MAX_NODES,
  MENU_AUX_SENTINEL_OUT_WORDS,
  menuAuxTreeErase,
  menuAuxSentinelWrites,
  flattenUpdateListTimersRuntime,
  GENRAND_STATE_WORDS,
  GENRAND_MAX_SAMPLES,
  HOST_FUN_746560_SITE,
  hostFun746560NotifyByte,
  hostFun746560DeathmatchSuffix,
  hostFun746560StringDataPtr,
  hostFun746560StringFound,
  hostFun746560FreePlan,
  gameUpdateSlice746260WalkCount,
  gameUpdateSlice746260IndexMatches,
  gameUpdateSlice7460b0Gate26584,
  frameOpaque98dba0TimerBlockLive,
  flattenAnm2NameCells,
  ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS,
  ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS,
  GLOBAL_TREE_4ABA0_MAX_NODES,
  PLAYER_HUD_MAX_SLOTS,
  globalTree4aba0Refresh,
  globalTree4aba0NodesFromRuntime,
  flattenGlobalTree4aba0NodesRuntime,
  /* ABI v96 (wave-22 merge): b18 entity pack cap (64) for the pack
     word staging. */
  B18_ENTITY_MAX,
  /* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane oracle (added in
     parallel by the model slice; consumed here by reference). */
  hudStatWalkLaneActive,
  hudStatWalkRun,
  /* ABI v95: record idx 21 ANM2::Load frame laws (export probe oracle). */
  engineAnm2LoadPathPresent,
  engineAnm2LoadPathIsSelf,
  engineAnm2LoadGraphicsNeeded,
  engineAnm2LoadFrameHostCalls,
  engineAnm2LoadSiteHostCalls,
  /* ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11): B9/B10/B11
     decision-law oracles (export probe). */
  gameUpdateSliceB9b11ChallengeGate,
  gameUpdateSliceB9b11FreeHelperNeeded,
  gameUpdateSliceB9b11FreePathNeeded,
  gameUpdateSliceB9b11FreePtrNeeded,
  gameUpdateSliceB9b11FreeHeapLo,
  gameUpdateSliceB9b11FreeHeapHi,
  gameUpdateSliceB9b11B10Enemies,
  gameUpdateSliceB9b11B10FatalNeeded,
  gameUpdateSliceB9b11ModeHooksNeeded,
  gameUpdateSliceB9b11Flag11f4Needed,
  gameUpdateSliceB9b11Double409030Needed,
  gameUpdateSliceB9b11Stage1aNeeded,
  gameUpdateSliceB9b11Age1Needed,
  gameUpdateSliceB9b11TempfxFlagClear,
  gameUpdateSliceB9b11TempfxListEmpty,
  gameUpdateSliceB9b11TempfxIsCandidate,
  gameUpdateSliceB9b11TempfxWalkNext,
  gameUpdateSliceB9b11TempfxWalkContinue,
  /* ABI v142 (record idx4): the rt_band_pop pure law + params pack
     oracle (mutation-check of the applied carrier lanes). */
  gameUpdateSlice8318a0RtBandPop,
  gameUpdateSlice8318a0RtBandPopParamsPack,
} from "./game-update-model.mjs";
import {
  gameUpdateSliceB2PoolSpecialGate,
  gameUpdateSliceB2RngXorshift,
  gameUpdateSliceB2RngZeroLogNeeded,
  gameUpdateSliceB2SpawnQualify,
  gameUpdateSliceB2SpawnGridIndex,
  gameUpdateSliceB2PosX,
  gameUpdateSliceB2PosY,
  gameUpdateSliceB2Spawn2Gate,
} from "./game-update-model.mjs";
import { roomAmbient824a70GenrandMtSamples, roomGenrandNext, roomB8PathCostGridStep, roomB8NeedsPathCostHost, roomB16Needs823540 } from "./room-pure-model.mjs";
/* ABI v95 (record idx 34): per-loop typed CREATE-arm plan laws consumed by
   reference for the scratch oracle (never re-derived here). */
import {
  gameUpdateSliceAmbient824a70CreateArgsWords,
  AMBIENT_824A70_MAX_LOOPS,
} from "./game-update-model.mjs";
/* ABI v69: family eligibility law consumed by reference for death-wire lane
   classification (never re-derived here). */
import { pmDeathPlayerEligible } from "./player-manager-update-pure-model.mjs";
/* Live-frame guard (update-v96): the shipped browser wiring — the exact
   createNativeUpdateSession + createResidualHostHandler drive the C12 probe
   used (output/decomp/5129df723e64/section-notes/update-v96-residual-inventory/). */
import {
  createNativeUpdateSession,
  createResidualHostHandler,
  loadGameUpdateSliceWasm,
} from "./frame-path.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const buildScript = join(root, "scripts", "decomp", "build-game-update-slice.mjs");
const output = join(root, "output", "decomp", "wasm-slice");
const wasmPath = join(output, "game-update-slice.wasm");

/* Slice build guard (memory-trim E): spawnSync the stale-wasm rebuild only
   when the module is missing, or when it is mtime-stale (older than the
   build script — the wave-22 merge closed with the script touched after the
   build) AND its ABI version no longer matches. A fresh module (mtime >=
   build script) or a stale module whose ABI version still matches the
   coordinator's build is used as-is — the 24s rebuild is skipped. The ABI
   check double-instantiates only in the stale case; the module is 94KB. */
function rebuildSlice() {
  const built = spawnSync(process.execPath, [buildScript], { cwd: root, stdio: "inherit" });
  if (built.error) throw built.error;
  if (built.status !== 0) throw new Error(`Slice build failed with status ${built.status}`);
}
function instantiateSlice(bytes) {
  const mod = new WebAssembly.Module(bytes);
  const imports = Object.fromEntries(
    WebAssembly.Module.imports(mod).map(({ module: name }) => [name, {}]));
  return new WebAssembly.Instance(mod, imports).exports;
}
let wasm = null;
if (!existsSync(wasmPath)) {
  /* ABI v129 fix: a FRESH rebuild must also instantiate -- the old guard
     left wasm == null and crashed on the first exported() probe. */
  rebuildSlice();
  wasm = instantiateSlice(readFileSync(wasmPath));
} else {
  wasm = instantiateSlice(readFileSync(wasmPath));
  if (statSync(wasmPath).mtimeMs < statSync(buildScript).mtimeMs) {
    const probeAbi = wasm.isaac_game_update_slice_abi_version ??
      wasm._isaac_game_update_slice_abi_version;
    if (typeof probeAbi !== "function" || probeAbi() !== ABI_VERSION) {
      rebuildSlice();
      wasm = instantiateSlice(readFileSync(wasmPath));
    }
  }
}

function exported(name) {
  const value = wasm[name] ?? wasm[`_${name}`];
  if (typeof value !== "function") throw new Error(`Missing Wasm export: ${name}`);
  return value;
}

const abiVersion = exported("isaac_game_update_slice_abi_version");
const stateSize = exported("isaac_game_update_slice_state_size");
const constantsSize = exported("isaac_game_update_slice_constants_size");
const runtimeInputsSize = exported("isaac_game_update_slice_runtime_inputs_size");
const eventsSize = exported("isaac_game_update_slice_events_size");
const stateAddress = exported("isaac_game_update_slice_state_address");
const constantsAddress = exported("isaac_game_update_slice_constants_address");
const runtimeInputsAddress = exported("isaac_game_update_slice_runtime_inputs_address");
const eventsAddress = exported("isaac_game_update_slice_events_address");
const gameObjectAddress = exported("isaac_game_update_slice_game_object_address");
const gameObjectSize = exported("isaac_game_update_slice_game_object_size");
const reset = exported("isaac_game_update_slice_reset_scratch");
const capture = exported("isaac_game_update_slice_capture_scratch");
const apply = exported("isaac_game_update_slice_apply_scratch");
const step = exported("isaac_game_update_slice_step_scratch");
const resumeGate1b83c = exported("isaac_game_update_slice_resume_gate_1b83c_scratch");
const resume92f1c0 = exported("isaac_game_update_slice_resume_92f1c0_scratch");
const resumeGenericPrompt = exported("isaac_game_update_slice_resume_generic_prompt_scratch");
const resumeItemOverlay = exported("isaac_game_update_slice_resume_item_overlay_scratch");
const continueTimedTransition = exported("isaac_game_update_slice_continue_timed_transition_scratch");
const continueMenuGates = exported("isaac_game_update_slice_continue_menu_gates_scratch");
const resumeMenuOpen = exported("isaac_game_update_slice_resume_menu_open_scratch");
const resumeMenuUpdate = exported("isaac_game_update_slice_resume_menu_update_scratch");
const resumeFrameAuxUpdates = exported("isaac_game_update_slice_resume_frame_aux_updates_scratch");
const resumeStageTransitionEffect = exported("isaac_game_update_slice_resume_stage_transition_effect_scratch");
const resumeRoomTransitionEffect = exported("isaac_game_update_slice_resume_room_transition_effect_scratch");
const resumeEnginePrefix = exported("isaac_game_update_slice_resume_engine_prefix_scratch");
/* ABI v95 (record idx 22): the per-entry eligible lane the engine-player
   body wire reads from the exported scratch (host-filled, entry+0x2c==0
   -> 1); the f360/f364/f410 lanes are pure outputs (float-reset law), so
   only the eligible lane needs seeding. */
const enginePlayerEligibleAddress = exported("isaac_game_update_slice_engine_player_eligible_address");
const resume98dba0PlayerWalk = exported("isaac_game_update_slice_resume_98dba0_player_walk_scratch");
const resumeFrameManagerUpdates = exported("isaac_game_update_slice_resume_frame_manager_updates_scratch");
const updateListTimersOutAddress = exported("isaac_game_update_slice_update_list_timers_out_address");
const updateListEvictFlagsAddress = exported(
  "isaac_game_update_slice_update_list_evict_flags_address",
);
const hudStatCountdownAddress = exported(
  "isaac_game_update_slice_hud_stat_countdown_address",
);
const hudStatCountdownCount = exported(
  "isaac_game_update_slice_hud_stat_countdown_count",
);
/* ABI v84: record-0 StatHUD tail walk-arm scratch (v78 pattern, 83 u32
   words published: ownerByte, slotPtr0/1, then 20 tween k-slots ×
   {current,delta,prev,timer} — threshold stays host-owned). */
const hudStatWalkAddress = exported(
  "isaac_game_update_slice_hud_stat_walk_address",
);
const hudStatWalkCount = exported(
  "isaac_game_update_slice_hud_stat_walk_count",
);
/* ABI v95 (record idx 16): B8 grid-capture k-blob scratch. The host fills
   costs (int32 LE, Room+0x76c dword grid) + trails (int16 LE, Room+0xe6c
   word grid) up to b8MaxCells() == ROOM_B8_MAX_CELLS before the
   RESUME_AFTER_ROOM_UPDATE_PREFIX_B2 resume and reads them back after. */
import { ROOM_B8_MAX_CELLS } from "./game-update-model.mjs";
const b8CostsAddress = exported("isaac_game_update_slice_b8_costs_address");
const b8TrailsAddress = exported("isaac_game_update_slice_b8_trails_address");
const b8MaxCellsExport = exported("isaac_game_update_slice_b8_max_cells");
/* ABI v95 (record idx 14): B2 spawn-plan + pool-list scratch. IN: the host
   captures the spawn element array (16 B per elem) before the B2 resume;
   OUT: the module fills per qualifying element (24 B each). The pool list
   carries the aggregation result for the verifier's oracle comparison. */
const b2SpawnInAddress = exported("isaac_game_update_slice_b2_spawn_in_address");
const b2SpawnOutAddress = exported("isaac_game_update_slice_b2_spawn_out_address");
const b2SpawnMax = exported("isaac_game_update_slice_b2_spawn_max");
const b2PoolListAddress = exported("isaac_game_update_slice_b2_pool_list_address");
const globalTree4aba0PureExport = exported(
  "isaac_game_update_slice_global_tree_4aba0_pure",
);
const fo4257b0ListOutAddress = exported(
  "isaac_game_update_slice_frame_opaque_4257b0_list_out_address");
const fo4257b0MaxList = exported("isaac_game_update_slice_frame_opaque_4257b0_max_list");
const fo4257b0MaxPlayers = exported("isaac_game_update_slice_frame_opaque_4257b0_max_players");
const fo4257b0MaxElems = exported("isaac_game_update_slice_frame_opaque_4257b0_max_elems");
const updateListMaxNodes = exported("isaac_game_update_slice_update_list_max_nodes");
const playerFlag410Address = exported("isaac_game_update_slice_player_flag_410_address");
const playerFlag410Max = exported("isaac_game_update_slice_player_flag_410_max");
const menuAuxVisitOrderAddress = exported("isaac_game_update_slice_menu_aux_visit_order_address");
const menuAuxPayloadFreeAddress = exported("isaac_game_update_slice_menu_aux_payload_free_address");
const menuAuxAccountingOutAddress = exported("isaac_game_update_slice_menu_aux_accounting_out_address");
const menuAuxMaxNodes = exported("isaac_game_update_slice_menu_aux_max_nodes");
const menuAuxSentinelOutAddress = exported("isaac_game_update_slice_menu_aux_sentinel_out_address");
const menuAuxSentinelOutWords = exported("isaac_game_update_slice_menu_aux_sentinel_out_words");
const genrandStateAddress = exported("isaac_game_update_slice_genrand_state_address");
const genrandIndexOutAddress = exported("isaac_game_update_slice_genrand_index_out_address");
const genrandSamplesAddress = exported("isaac_game_update_slice_genrand_samples_address");
const genrandStateWords = exported("isaac_game_update_slice_genrand_state_words");
const genrandMaxSamples = exported("isaac_game_update_slice_genrand_max_samples");
/* ABI v95 (record idx 34): per-loop typed CREATE-arm plan scratch. */
const ambient824a70CreateArgsAddress = exported("isaac_game_update_slice_ambient_824a70_create_args_address");
const resumeRoomUpdatePrefixB1 = exported("isaac_game_update_slice_resume_room_update_prefix_b1_scratch");
const resumeRoomUpdatePrefixB2 = exported("isaac_game_update_slice_resume_room_update_prefix_b2_scratch");
const resumeRoomUpdatePrefix = exported("isaac_game_update_slice_resume_room_update_prefix_scratch");
const resumeRoomClearNested = exported("isaac_game_update_slice_resume_room_clear_nested_scratch");
const resumeRoomUpdateClear = exported("isaac_game_update_slice_resume_room_update_clear_scratch");
const resumeRoomUpdateHead = exported("isaac_game_update_slice_resume_room_update_head_scratch");
const resume4257b0PassA = exported("isaac_game_update_slice_resume_4257b0_pass_a_scratch");
/* ABI v95 (record idx 20 depth): Game::SaveState 0x006f9000 pure decision
   layers — all 21 law exports must exist on the shipped module. */
const savestateFlagsCount = exported("isaac_game_update_slice_savestate_flags_count");
const savestateVersionWord = exported("isaac_game_update_slice_savestate_version_word");
const savestateFlagsByte = exported("isaac_game_update_slice_savestate_flags_byte");
const savestatePreHeaderStores = exported("isaac_game_update_slice_savestate_pre_header_stores");
const savestatePostHeaderStores = exported("isaac_game_update_slice_savestate_post_header_stores");
const savestateDwordRunStores = exported("isaac_game_update_slice_savestate_dword_run_stores");
const savestateBadgesAlias = exported("isaac_game_update_slice_savestate_badges_alias");
const savestateBadgesSrcCount = exported("isaac_game_update_slice_savestate_badges_src_count");
const savestateBadgesDstCount = exported("isaac_game_update_slice_savestate_badges_dst_count");
const savestateBadgesGrow = exported("isaac_game_update_slice_savestate_badges_grow");
const savestateBadgesCopyBytes = exported("isaac_game_update_slice_savestate_badges_copy_bytes");
const savestatePtrvecCount = exported("isaac_game_update_slice_savestate_ptrvec_count");
const savestatePtrvecSkip = exported("isaac_game_update_slice_savestate_ptrvec_skip");
const savestateSetg67788 = exported("isaac_game_update_slice_savestate_setg_67788");
const savestateClamp265ec = exported("isaac_game_update_slice_savestate_clamp_265ec");
const savestateSectionLoopCount = exported("isaac_game_update_slice_savestate_section_loop_count");
const savestateSectionStride = exported("isaac_game_update_slice_savestate_section_stride");
const savestateDwordLoopCount = exported("isaac_game_update_slice_savestate_dword_loop_count");
const savestatePlan = exported("isaac_game_update_slice_savestate_plan");
const savestatePlanAddress = exported("isaac_game_update_slice_savestate_plan_address");
const savestatePlanWords = exported("isaac_game_update_slice_savestate_plan_words");

if (!(wasm.memory instanceof WebAssembly.Memory)) throw new Error("Standalone module does not export memory");
if (abiVersion() !== ABI_VERSION) throw new Error(`Unexpected ABI version ${abiVersion()}`);
if (stateSize() !== ABI_SIZES.state || constantsSize() !== ABI_SIZES.constants ||
    runtimeInputsSize() !== ABI_SIZES.runtimeInputs || eventsSize() !== ABI_SIZES.events) {
  throw new Error("C++ ABI sizes do not match the JavaScript verifier");
}
if (gameObjectSize() !== GAME_OBJECT_MIN_SIZE) throw new Error("Unexpected sparse Game object adapter size");
if (updateListMaxNodes() !== UPDATE_LIST_MAX_NODES) {
  throw new Error("Tail list sweep node cap does not match the JavaScript verifier");
}
if (playerFlag410Max() !== ENGINE_PLAYER_MAX) {
  throw new Error("VA 0x009bea10 broadcast cap does not match the JavaScript verifier");
}
if (menuAuxMaxNodes() !== MENU_AUX_TREE_MAX_NODES) {
  throw new Error("VA 0x0041d030 node cap does not match the JavaScript verifier");
}
if (genrandStateWords() !== GENRAND_STATE_WORDS || genrandMaxSamples() !== GENRAND_MAX_SAMPLES) {
  throw new Error("genrand state/sample caps do not match the JavaScript verifier");
}
/* Fleet requirement: every scratch export must live at 0x100000 or above so a
   large buffer can never sit adjacent to the emscripten shadow stack. */
for (const [name, fn] of Object.entries({
  state: stateAddress, runtimeInputs: runtimeInputsAddress, events: eventsAddress,
  gameObject: gameObjectAddress, b8Costs: exported("isaac_game_update_slice_b8_costs_address"),
  b8Trails: exported("isaac_game_update_slice_b8_trails_address"),
  listTimers: updateListTimersOutAddress, playerFlag410: playerFlag410Address,
  menuAuxOrder: menuAuxVisitOrderAddress, genrandState: genrandStateAddress,
  genrandSamples: genrandSamplesAddress,
  /* ABI v95 (record idx 34): per-loop typed CREATE-arm plan scratch. */
  ambient824a70CreateArgs: exported("isaac_game_update_slice_ambient_824a70_create_args_address"),
})) {
  const addr = fn();
  if (addr < 0x100000) {
    throw new Error(`Scratch export ${name} is at 0x${addr.toString(16)}, below the 0x100000 floor`);
  }
}
if (exported("isaac_game_update_slice_b8_max_cells")() !== ROOM_B8_MAX_CELLS) {
  throw new Error("B8 grid capture cap does not match the JavaScript verifier");
}

/* ABI v65: probe the two new VA 0x00746560 pure exports on the SHIPPED module
   with UNMASKED wide arguments. The Wasm ABI does not narrow i32 arguments, so
   a value above 0xff must reach the callee exactly as written — pre-masking the
   Wasm-side draw is what hid the uint8_t defect for 28 versions. */
const hostFun746560NotifyByteWasm = exported("isaac_game_update_slice_host_746560_notify_byte");
const hostFun746560DeathmatchSuffixWasm = exported(
  "isaac_game_update_slice_host_746560_deathmatch_suffix",
);
let hostFun746560NotifyProbes = 0;
let hostFun746560SuffixProbes = 0;
for (const param of [
  0, 1, 2, 3, 0xfe, 0xff, 0x100, 0x101, 0x102, 0x1ff, 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff,
]) {
  const wasmValue = hostFun746560NotifyByteWasm(param | 0) >>> 0;
  const modelValue = hostFun746560NotifyByte(param) >>> 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746560 notify byte diverged for 0x${(param >>> 0).toString(16)}: wasm ${wasmValue} model ${modelValue}`,
    );
  }
  if (wasmValue > 0xff) {
    throw new Error(`746560 notify byte 0x${wasmValue.toString(16)} is not a byte`);
  }
  hostFun746560NotifyProbes += 1;
}
for (const mode of [
  -0x80000000, -3, -1, 0, 1, 2, 3, 0x7fffffff, 0x80000000, 0xffffffff, 0x100, 0x1ff,
]) {
  const wasmValue = hostFun746560DeathmatchSuffixWasm(mode | 0) | 0;
  const modelValue = hostFun746560DeathmatchSuffix(mode) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746560 deathmatch suffix diverged for ${mode | 0}: wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560SuffixProbes += 1;
}
/* Pinned PE facts, independent of both implementations: 0x0098de41 pushes 1 so
   the widget stores 0; 0x006fb7d2 pushes 0 so it stores 1; `xor al,1` is a bit
   flip (2 -> 3, not 0); the suffix compare is signed. */
if (hostFun746560NotifyByteWasm(1) !== 0) throw new Error("walk-site notify byte must be 0");
if (hostFun746560NotifyByteWasm(0) !== 1) throw new Error("cleanup-site notify byte must be 1");
if (hostFun746560NotifyByteWasm(2) !== 3) throw new Error("xor al,1 is a bit flip, not a negation");
if (hostFun746560NotifyByteWasm(0x100) !== 1) throw new Error("notify byte must narrow to al");
if (hostFun746560DeathmatchSuffixWasm(-1) !== 0) throw new Error("suffix compare must be signed");
if (hostFun746560DeathmatchSuffixWasm(2) !== 1) throw new Error("suffix compare must be jl (>= 2)");

/* ABI v95: probe the six record idx 6 (0x00746560) string-build decision
   law exports on the SHIPPED module with UNMASKED wide arguments. */
const dataPtrWasm = exported("isaac_game_update_slice_746560_string_data_ptr");
const foundWasm = exported("isaac_game_update_slice_746560_string_found");
const freePlanWasm = exported("isaac_game_update_slice_746560_free_plan");
const walkCountWasm = exported("isaac_game_update_slice_746260_walk_count");
const indexMatchesWasm = exported("isaac_game_update_slice_746260_index_matches");
const gate26584Wasm = exported("isaac_game_update_slice_7460b0_gate_26584");
let hostFun746560StringProbes = 0;
for (const cap of [0, 1, 0xf, 0x10, 0x11, 0xff, 0x100, 0x1ff, 0x1000, 0xfffffffe, 0xffffffff]) {
  const wasmValue = dataPtrWasm(cap | 0, 0x9000, 0x1000) >>> 0;
  const modelValue = hostFun746560StringDataPtr(cap, 0x9000, 0x1000) >>> 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746560 data_ptr diverged for cap 0x${(cap >>> 0).toString(16)}: wasm 0x${wasmValue.toString(16)} model 0x${modelValue.toString(16)}`,
    );
  }
  hostFun746560StringProbes += 1;
}
for (const size of [0, 1, 2, 0xff, 0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
  const wasmValue = foundWasm(size | 0) | 0;
  const modelValue = hostFun746560StringFound(size) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746560 found diverged for size 0x${(size >>> 0).toString(16)}: wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560StringProbes += 1;
}
for (const [cap, ptr, bh] of [
  [0, 0x9000, 0x8000], [0xf, 0x9000, 0x8000], [0x10, 0x9000, 0x8000],
  [0xfff, 0x9000, 0x8000], [0xfff, 0x9000, 0x8fdc], [0xfff, 0x9000, 0x8fdd],
  [0xfff, 0x9000, 0x8fe0], [0xffe, 0x9000, 0x8000], [0x1000, 0x9000, 0x8000], [0x1ff, 0x9000, 0x8000],
  [0xffffffff, 0x9000, 0x8000], [0xffffffff, 0, 0xfffffff0],
]) {
  const wasmValue = freePlanWasm(cap | 0, ptr | 0, bh | 0) >>> 0;
  const modelValue = hostFun746560FreePlan(cap, ptr, bh) >>> 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746560 free_plan diverged for cap 0x${(cap >>> 0).toString(16)}: wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560StringProbes += 1;
}
for (const [e, b] of [
  [0, 0], [0x1c, 0], [0x1b, 0], [0x1d, 0], [0x70, 0], [0x2000, 0x1000],
  [0, 0x1c], [0, 0x70], [4, 0xfffffffd], [0x80000000, 0], [0x7fffffff, 0],
  [0xffffffff, 0], [0, 0x80000000], [0x12345678, 0x12345600],
]) {
  const wasmValue = walkCountWasm(e | 0, b | 0) | 0;
  const modelValue = gameUpdateSlice746260WalkCount(e, b) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746260 walk_count diverged for (0x${(e >>> 0).toString(16)}, 0x${(b >>> 0).toString(16)}): wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560StringProbes += 1;
}
for (const [a, c, i] of [
  [0, 0, 0], [3, 1, 1], [3, 1, 0], [0xffffffff, 0xffffffff, 3], [0x80000000, 0, 31],
  [0x80000000, 0, 32], [0x80000000, 0, 33], [1, 0, 32], [2, 0, 0x21],
  [0xffffffff, 0, 0xffffffff], [0xfffffffe, 0, 0], [0x100, 0x1, 0x100],
]) {
  const wasmValue = indexMatchesWasm(a | 0, c | 0, i | 0) | 0;
  const modelValue = gameUpdateSlice746260IndexMatches(a, c, i) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `746260 index_matches diverged for (0x${(a >>> 0).toString(16)}, 0x${(c >>> 0).toString(16)}, 0x${(i >>> 0).toString(16)}): wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560StringProbes += 1;
}
for (const m of [0x2c, 0, 0x2b, 0x2d, 0x12c, 0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
  const wasmValue = gate26584Wasm(m | 0) | 0;
  const modelValue = gameUpdateSlice7460b0Gate26584(m) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `7460b0 gate_26584 diverged for 0x${(m >>> 0).toString(16)}: wasm ${wasmValue} model ${modelValue}`,
    );
  }
  hostFun746560StringProbes += 1;
}
/* Pinned PE facts: the SSO threshold is EXACTLY 0x10 (cap 0x10 -> heap,
   cap 0xf -> SSO); the free-plan large arm needs delta > 0x1f; the walk
   count divide is by 28; index masks use the low 5 bits of the index. */
if (dataPtrWasm(0x10, 0x9000, 0x1000) !== 0x9000) throw new Error("cap 0x10 must select heap");
if (dataPtrWasm(0xf, 0x9000, 0x1000) !== 0x1000) throw new Error("cap 0xf must select SSO");
if (freePlanWasm(0xfff | 0, 0x9000 | 0, 0x8fdc | 0) !== 2) throw new Error("delta 0x20 must be LARGE");
if (freePlanWasm(0xfff | 0, 0x9000 | 0, 0x8fdd | 0) !== 1) throw new Error("delta 0x1f must be SMALL");
if (walkCountWasm(0x70 | 0, 0) !== 4) throw new Error("112/28 must be 4");
if (walkCountWasm(0, 0x70) !== -4) throw new Error("negative span must truncate toward zero");
if (indexMatchesWasm(0x80000000 | 0, 0, 32) !== 0) throw new Error("index 32 must fold to bit 0");
if (gate26584Wasm(0x12c | 0) !== 0) throw new Error("0x12c must not match the full-dword 0x2c gate");

/* ABI v66: probe the FUN_0098dba0 timer-block entry gate on the SHIPPED module
   with UNMASKED arguments. PE 0x0098de52 is `0f 8e` (JLE, SIGNED), so the two
   values that discriminate a signed model from an unsigned one — 0x80000000 and
   0xffffffff — must cross the boundary exactly as written. */
const timerBlockLiveWasm = exported("isaac_game_update_slice_98dba0_timer_block_live");
let timer98dba0GateProbes = 0;
for (const timer of [
  0, 1, 2, 9, 30, 0x7ffffffe, 0x7fffffff, 0x80000000, 0x80000001, 0xfffffffe, 0xffffffff,
  0x100, 0x1ff, -1, -30, -0x80000000,
]) {
  const wasmValue = timerBlockLiveWasm(timer | 0) | 0;
  const modelValue = frameOpaque98dba0TimerBlockLive(timer) | 0;
  if (wasmValue !== modelValue) {
    throw new Error(
      `98dba0 timer gate diverged for 0x${(timer >>> 0).toString(16)}: ` +
        `wasm ${wasmValue} model ${modelValue}`,
    );
  }
  timer98dba0GateProbes += 1;
}
/* Pinned PE facts, independent of both implementations. `jle` skips at exactly
   0 and at every negative value; an unsigned `jbe` model would run the block on
   0x80000000 and 0xffffffff, which is the common-path inversion. */
if (timerBlockLiveWasm(1) !== 1) throw new Error("timer gate must run the block at 1");
if (timerBlockLiveWasm(0) !== 0) throw new Error("jle is <= 0, so 0 skips the block");
if (timerBlockLiveWasm(-1) !== 0) throw new Error("timer gate must be SIGNED (jle, not jbe)");
if (timerBlockLiveWasm(0x80000000 | 0) !== 0) {
  throw new Error("timer gate must skip INT_MIN — an unsigned model runs it");
}
if (timerBlockLiveWasm(0xffffffff | 0) !== 0) {
  throw new Error("timer gate must skip -1 as a full unmasked dword");
}
if (timerBlockLiveWasm(0x7fffffff) !== 1) throw new Error("INT_MAX is strictly positive");

function bitsToFloat32(bits) {
  const view = new DataView(new ArrayBuffer(4));
  view.setUint32(0, bits >>> 0, true);
  return view.getFloat32(0, true);
}

function float32ToBits(value) {
  const view = new DataView(new ArrayBuffer(4));
  view.setFloat32(0, value, true);
  return view.getUint32(0, true);
}

function float64ToBitsPair(value) {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return { lo: view.getUint32(0, true), hi: view.getUint32(4, true) };
}

function bitsPairToFloat64(lo, hi) {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, lo >>> 0, true);
  view.setUint32(4, hi >>> 0, true);
  return view.getFloat64(0, true);
}

/* ABI v70: the harness's OWN re-transcription of the timer-interior float
   chain — deliberately written here again, from the instruction stream, so
   the differential has a third leg that is not imported from either
   implementation (the C++ and the model can only both pass if they also
   agree with THIS). PE 0x0098de7e..0x0098df17:
     (double)(int32)sample; +2^32 when the sign bit is set (addsd
     [eax*8+0xbacb00], qwords {0.0, 2^32}); ONE double->f32 rounding
     (cvtpd2ps); *2^-32f (0xba9ff4); *3.14f (0xbaa704, bits 0x4048f5c3);
     doubled by self-add; mag = (float)(int32)(timer-1) / 10.0f (0xbaa81c);
     each store lane = trig_f32 * mag + old * 0.5f (0xbaa2d0), where trig_f32
     is the cvtsd2ss of the CRT primitive's double result. */
function harnessTimerThetaBits(sample) {
  const raw = sample >>> 0;
  let wide = raw & 0x80000000 ? (raw | 0) + 4294967296 : raw | 0;
  const asF32 = Math.fround(wide);
  const unit = Math.fround(asF32 * bitsToFloat32(0x2f800000));
  const scaled = Math.fround(unit * bitsToFloat32(0x4048f5c3));
  return float32ToBits(Math.fround(scaled + scaled));
}
function harnessTimerMagBits(timerAfter) {
  return float32ToBits(Math.fround(Math.fround(timerAfter | 0) / bitsToFloat32(0x41200000)));
}
function harnessTimerAxisBits(trigBits, magBits, oldBits) {
  const scaled = Math.fround(bitsToFloat32(trigBits) * bitsToFloat32(magBits));
  const halved = Math.fround(bitsToFloat32(oldBits) * bitsToFloat32(0x3f000000));
  return float32ToBits(Math.fround(scaled + halved));
}
function harnessTimerNarrowBits(lo, hi) {
  return float32ToBits(Math.fround(bitsPairToFloat64(lo, hi)));
}

/* ABI v70: probe the four timer-interior exports on the SHIPPED module.
   Arguments cross UNMASKED. The exports return raw f32 bit patterns as
   uint32, so no JS float canonicalization can touch the Wasm result. */
const timerThetaWasm = exported("isaac_game_update_slice_98dba0_timer_theta_bits");
const timerMagWasm = exported("isaac_game_update_slice_98dba0_timer_mag_bits");
const timerNarrowWasm = exported("isaac_game_update_slice_98dba0_timer_trig_narrow_bits");
const timerAxisWasm = exported("isaac_game_update_slice_98dba0_timer_axis_bits");
let timerInteriorProbes = 0;
for (const sample of [
  0, 1, 2, 0x1000, 0x7fffffff, 0x80000000, 0x80000001, 0xbadc0ded, 0xfffffeff,
  0xffffff00, 0xffffff7f, 0xffffff80, 0xfffffffe, 0xffffffff,
]) {
  const wasmValue = timerThetaWasm(sample | 0) >>> 0;
  const harness = harnessTimerThetaBits(sample) >>> 0;
  if (wasmValue !== harness) {
    throw new Error(
      `timer theta diverged for 0x${(sample >>> 0).toString(16)}: wasm 0x${wasmValue.toString(16)} harness 0x${harness.toString(16)}`,
    );
  }
  timerInteriorProbes += 1;
}
for (const timerAfter of [0, 1, 2, 9, 10, 29, 0x1d, 0x1000000, 0x1000001, 0x7ffffffe, 0x7fffffff, 0x80000000, 0xffffffff]) {
  const wasmValue = timerMagWasm(timerAfter | 0) >>> 0;
  const harness = harnessTimerMagBits(timerAfter) >>> 0;
  if (wasmValue !== harness) {
    throw new Error(
      `timer mag diverged for 0x${(timerAfter >>> 0).toString(16)}: wasm 0x${wasmValue.toString(16)} harness 0x${harness.toString(16)}`,
    );
  }
  timerInteriorProbes += 1;
}
for (const [lo, hi] of [
  [0, 0], [0, 0x80000000], [0, 0x3ff00000], [0, 0xbfe00000], [0x10000000, 0x3ff00000],
  [0x30000000, 0x3ff00000], [0, 0x36a00000], [0xffffffff, 0x3fefffff], [0, 0x7ff80000],
  [0, 0x40f00000], [0x55555555, 0x3fd55555],
]) {
  const wasmValue = timerNarrowWasm(lo | 0, hi | 0) >>> 0;
  const harness = harnessTimerNarrowBits(lo, hi) >>> 0;
  if (wasmValue !== harness) {
    throw new Error(
      `timer narrow diverged for ${hi.toString(16)}:${lo.toString(16)}: wasm 0x${wasmValue.toString(16)} harness 0x${harness.toString(16)}`,
    );
  }
  timerInteriorProbes += 1;
}
for (const [trig, mag, old] of [
  [0x3f800000, 0x41200000, 0x00000000], [0x00000000, 0x00000000, 0x80000000],
  [0x80000000, 0x00000000, 0x80000000], [0xbf800000, 0x3dcccccd, 0x3f800000],
  [0x3f000000, 0x4d4ccccd, 0xff7fffff], [0x3f7fffff, 0x3f7fffff, 0x00000001],
  [0x7fc00000, 0x3dcccccd, 0x3f800000], [0x3f800000, 0x3dcccccd, 0x7f800000],
]) {
  const wasmValue = timerAxisWasm(trig | 0, mag | 0, old | 0) >>> 0;
  const harness = harnessTimerAxisBits(trig, mag, old) >>> 0;
  if (wasmValue !== harness) {
    throw new Error(
      `timer axis diverged for ${trig.toString(16)}/${mag.toString(16)}/${old.toString(16)}: ` +
        `wasm 0x${wasmValue.toString(16)} harness 0x${harness.toString(16)}`,
    );
  }
  timerInteriorProbes += 1;
}
/* Pinned PE facts, hand-derived from IEEE-754 semantics on paper — these
   anchor all three implementations to the instruction stream:
   - sample 0x80000000: (double)u32 = 2^31 exactly (pins the +2^32 fixup);
     *2^-32f = 0.5 exactly; *3.14f = exact halving; doubled = exact — theta
     IS the 3.14f constant, bits 0x4048f5c3.
   - sample 0xffffffff: cvtpd2ps(2^32-1) rounds UP to 2^32 (ulp is 256 there),
     unit = exactly 1.0f, theta = 2*3.14f = 0x40c8f5c3 (doubling is exact).
   - sample 0xffffff80 = 2^32-128: the exact round-to-nearest-EVEN tie between
     0x4f7fffff (odd mantissa) and 0x4f800000 (even) — must land on 2^32.
   - sample 0xffffff7f: one below the tie — rounds DOWN to 0x4f7fffff =
     (2^24-1)*2^8, unit = (2^24-1)*2^-24 = 0x3f7fffff exactly, and the 3.14f
     product rounds to 0x4048f5c2, doubled 0x40c8f5c2 — ONE ULP below the
     0xffffffff result. A chain that skips the intermediate rounding or
     pre-folds 2*3.14f cannot reproduce both neighbours. */
if ((timerThetaWasm(0) >>> 0) !== 0x00000000) throw new Error("theta(0) must be +0.0f");
if ((timerThetaWasm(0x80000000 | 0) >>> 0) !== 0x4048f5c3) {
  throw new Error("theta(0x80000000) must be exactly the 3.14f constant (2^32 fixup + exact halving)");
}
if ((timerThetaWasm(0xffffffff | 0) >>> 0) !== 0x40c8f5c3) {
  throw new Error("theta(0xffffffff) must round 2^32-1 UP at cvtpd2ps and reach exactly 2*3.14f");
}
if ((timerThetaWasm(0xffffff80 | 0) >>> 0) !== 0x40c8f5c3) {
  throw new Error("theta(0xffffff80) is the round-to-even tie and must land on 2^32");
}
if ((timerThetaWasm(0xffffff7f | 0) >>> 0) !== 0x40c8f5c2) {
  throw new Error("theta(0xffffff7f) must stay one ULP below (per-instruction f32 rounding)");
}
if ((timerMagWasm(0) >>> 0) !== 0x00000000) throw new Error("mag(0) must be +0.0f");
if ((timerMagWasm(1) >>> 0) !== 0x3dcccccd) throw new Error("mag(1) must be the divss 0.1f");
if ((timerMagWasm(0xffffffff | 0) >>> 0) !== 0xbdcccccd) {
  throw new Error("mag must sign-interpret (cvtdq2ps): 0xffffffff is -1 -> -0.1f");
}
if ((timerNarrowWasm(0, 0x3ff00000) >>> 0) !== 0x3f800000) throw new Error("narrow(1.0) must be 1.0f");
if ((timerNarrowWasm(0, 0x80000000 | 0) >>> 0) !== 0x80000000) {
  throw new Error("narrow(-0.0) must keep the sign bit");
}
if ((timerNarrowWasm(0x10000000, 0x3ff00000) >>> 0) !== 0x3f800000) {
  throw new Error("narrow(1+2^-24) is the tie and must round to even (1.0f)");
}
if ((timerNarrowWasm(0x18000000, 0x3ff00000) >>> 0) !== 0x3f800001) {
  throw new Error("narrow(1+1.5*2^-24) sits at 0.75 ulp and must round up to 0x3f800001");
}
if ((timerNarrowWasm(0x30000000, 0x3ff00000) >>> 0) !== 0x3f800002) {
  throw new Error("narrow(1+3*2^-24) is the upper tie and must round to even (0x3f800002)");
}
if ((timerNarrowWasm(0, 0x36a00000) >>> 0) !== 0x00000001) {
  throw new Error("narrow(2^-149) must produce the minimum f32 denormal");
}
if ((timerAxisWasm(0x3f800000, 0x41200000, 0) >>> 0) !== 0x41200000) {
  throw new Error("axis(1, 10, +0) must be exactly 10.0f");
}
if ((timerAxisWasm(0, 0, 0x80000000 | 0) >>> 0) !== 0x00000000) {
  throw new Error("axis(+0*0) + (-0*0.5): (+0) + (-0) must be +0 under round-to-nearest");
}
if ((timerAxisWasm(0x80000000 | 0, 0, 0x80000000 | 0) >>> 0) !== 0x80000000) {
  throw new Error("axis(-0*+0) + (-0*0.5): (-0) + (-0) must stay -0");
}
{
  const nanAxis = timerAxisWasm(0x7fc00000, 0x3dcccccd, 0x3f800000) >>> 0;
  if ((nanAxis & 0x7fc00000) !== 0x7fc00000) {
    throw new Error("axis with a canonical-NaN trig input must produce a quiet NaN");
  }
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

function completeState(overrides = {}) {
  return {
    engineField8: 0,
    engineFieldC: 0,
    engineFloat22c: 0,
    engineFloat230: 0,
    engineField4: 0,
    engineField10: 0,
    engineField14: 0,
    engineField18: 0,
    engineField1c: 0,
    engineField20: 0,
    engineField24: 0,
    roomAmbientCount7454: 0,
    roomAmbientIntensity7458: 0,
    roomAmbientFlag745c: 0,
    mode26584: 0,
    flags2654c: 0,
    gameFlags1839c: 0,
    roomDescShortAe: 0,
    hudMessageFlag8: 0,
    hudMessagePlayed64: 0,
    rankDisplaySwitchAfter: 0,
    rankDisplayStateAfter: 0,
    rankDisplayClear3b0Out: 0,
    rankDisplayTailOut: 0,
    itemOverlayCounter11d1d0: 0,
    transitionTailByte29fb8: 0,
    fxLerpGate676b4: 0,
    fxCur676b8: 0,
    fxCur676bc: 0,
    fxCur676c0: 0,
    fxCur676c4: 0,
    fxCur676c8: 0,
    fxCur676cc: 0,
    engineAnm2Loaded: 0,
    engineAnm2Slot10c: 0,
    engineAnm2Bitflags110: 0,
    globalTree4aba0Result: 0,
    hudHistoryLatch5c7c: 0,

    shortTimer: 0,
    positionResetTimer: 0,
    positionXBits: 1,
    positionYBits: 2,
    secondaryTimer: 0,
    decayValue: 0,
    transitionProgress: 0,
    transitionRate: Math.fround(0.1),
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
    fadeProgress26518: 0,
    shakeCurrent67738: 0,
    shakeTarget6773c: 0,
    shakeStep67740: 0,
    timer269e0: 0,
    listCount67730: 0,
    roomFxCounter70d8: 0,
    roomFxLimit70dc: 0,
    roomFxValue70cc: 0,
    roomFxStep70d4: 0,
    roomFxCounter70f4: 0,
    roomFxLimit70f8: 0,
    roomFxValue70e8: 0,
    roomFxStep70f0: 0,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 0,
    roomDescSubtype: 0,
    roomByte7220: 0,
    roomWaterLerpCountdown7298: 0,
    roomBossCount12c8: 0,
    roomBossCount12cc: 0,
    roomBossSnapshot7224: 0,
    roomTimer722c: 0,
    roomCollectibleTimer7764: 0,
    roomTimer7214: 0,
    roomTimer706c: 0,
    roomTimer7230: 0,
    roomWaterAmount7240: 0,
    roomLavaIntensity7740: 0,
    frameOpaque4212c0Mode: 0,
    frameOpaque4212c0Secondary: 0,
    frameOpaque4212c0Field3c: 0,
    frameOpaque4212c0Flag4c: 0,
    frameOpaque4212c0Flag111: 0,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Flag: 0,
    frameOpaque98dba0Counter: 0,
    frameOpaque98dba0Float170: 0,
    frameOpaque98dba0Float2d0: 0,
    difficulty269c8: 0,
    enginePlayer1bb74: 0,
    roomDescFlags44: 0,
    roomDescClearCount4a: 0,
    byte67744: 0,
    roomFlag7894: 0,
    roomFlag7769: 0,
    ...overrides,
  };
}

const corpus = [
  completeState({ shortTimer: 2, positionResetTimer: 1, positionXBits: 0x11111111, positionYBits: 0xeeeeeeee, secondaryTimer: 1, decayValue: 0.01 }),
  completeState({ positionResetTimer: 2, secondaryTimer: -1, decayValue: 0.5, transitionProgress: 0.05 }),
  completeState({ shortTimer: -1, secondaryTimer: 3, decayValue: -1, transitionProgress: 0.9, transitionRate: Math.fround(0.2), transitionMode: 1 }),
  completeState({ shortTimer: 4, positionResetTimer: 4, secondaryTimer: 4, decayValue: 1, transitionProgress: 0.9, transitionRate: Math.fround(0.2), transitionMode: 8 }),
  completeState({ shortTimer: 4, positionResetTimer: 4, secondaryTimer: 4, decayValue: 1, transitionProgress: 0.9, transitionRate: Math.fround(0.2), transitionMode: 9 }),
  completeState({ postUpdateDelay: 2 }),
  completeState({ transitionProgress: 0.5, postUpdateDelay: 2 }),
  completeState({
    gate1d520: 1, oneShot1d63c: 0x7f, state24ecc: 5, value24ed0: 123, mode24ed8: 456,
    itemOverlayState: 4, menuState23a74: 5, genericPromptActiveObject: 6, genericPromptActiveFlag: 0x7f,
    genericPromptSubmittedSelection: 8, genericPromptPostUpdateFlag: 0x80, skipTimedTransitionFlag: 0x81,
    transitionColorRBits: 0x11111111, transitionColorGBits: 0x22222222,
    transitionColorBBits: 0x33333333, transitionAuxBits: 0x44444444,
    timedTransitionProgress: 0.75, timedTransitionForceFinish: 0x82,
    status22ed4: 9, status22edc: 10, timedTransitionCleanupMode: 3,
  }),
  completeState({ gate1d520: 1, state24ecc: 0 }),
  completeState({ gate1d654: 1, gate1ba78: 1 }),
  completeState({ gate1ba78: 1 }),
  completeState({ gate1b83c: 1, predicate1ba74: 0, counter265c0: 99, resumeGate1b83c: 1, resumePredicate1ba74: 1 }),
  completeState({ gate1b83c: 1, predicate1ba74: 1, counter265c0: 99, resumeGate1b83c: 0, resumePredicate1ba74: 1 }),
  /* ABI v87: VA 0x008318a0 try_pure lanes. Dedicated so host/drop/ready=0
     cannot go silent if the random draw never reaches the PE site. */
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 0,
    opaque008318a0Mode: 0,
  }),
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 1,
    opaque008318a0Mode: 0,
  }),
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 1,
    opaque008318a0Mode: 5,
  }),
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 1,
    opaque008318a0Mode: 0x100,
  }),
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 1,
    opaque008318a0Mode: 1,
  }),
  completeState({
    gate1b83c: 1,
    opaque008318a0Ready: 1,
    opaque008318a0Mode: 4,
  }),
  /* FUN_0098dba0 multi-cont site gate1b83c: pure counter==10 host + mode0 fallthrough text_out */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Flag: 0,
    frameOpaque98dba0Counter: 9,
    frameOpaque98dba0Float170: 0.5,
    frameOpaque98dba0Float2d0: 0.4,
    frameOpaque98dba0Bvar2: 1,
    frameOpaque98dba0Manager2a35c: 0.3,
    frameOpaque98dba0Game216e9: 0,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v65: walk counter reaches exactly 10, so PE 0x0098de45 emits
     0x00746560 with `push 1`. cleanupMode 5 also opens the callee's own signed
     0x007465b7 `jl` so the "#Online/DEATHMATCH_NAME" suffix decision is 1.
     ready=1 is the 0x00840b61 write path: Game+0x216e8 must come back set. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 9,
    frameOpaque98dba0Float170: 0.5,
    frameOpaque98dba0Float2d0: 0.4,
    frameOpaque98dba0Bvar2: 1,
    frameOpaque98dba0Game216e9: 1,
    hostFun746560PostReady: 1,
    hudMessageFlag8: 0,
    hudMessageTextPtr54: 0,
    timedTransitionCleanupMode: 5,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Same shape with ready=0: the 0x00840bdd assert path stores nothing, so
     Game+0x216e8 must stay exactly as captured. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 9,
    frameOpaque98dba0Float170: 0.5,
    frameOpaque98dba0Float2d0: 0.4,
    frameOpaque98dba0Bvar2: 1,
    frameOpaque98dba0Game216e9: 1,
    hostFun746560PostReady: 0,
    hudMessageFlag8: 0,
    hudMessageTextPtr54: 0,
    timedTransitionCleanupMode: 5,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Wide unmasked capture of Game+0x216e9: 0x100 is zero in the byte the PE
     tests at 0x0098df54, so the text_out gate must open. A word-wide test would
     read 0x100 as nonzero and wrongly close it. bVar2 = 0 so the fallthrough
     path is the one taken (an emission and this gate are mutually exclusive). */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 0x100,
    hostFun746560PostReady: 1,
    hudMessageFlag8: 1,
    hudMessageTextPtr54: 0,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v66: FUN_0098dba0 timer-block gate, SKIP path. Game+0x264e8 = 0 makes
     PE 0x0098de52 `jle` taken, so the whole block (RNG + the two 0x0041d5xx
     float wrappers + the 0x264ec/0x264f0 stores) is skipped and no timer host
     edge may be emitted. bVar2 = 0 keeps the counter tail out of the way. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Same shape, LIVE path: 0x1e is exactly what 0x007401e4 stores, so the block
     runs and the host edge must be emitted. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* SIGNEDNESS, driven UNMASKED across the boundary: 0x80000000 is negative as
     int32, so `jle` skips. An unsigned model reads it as 2147483648 and runs
     the block — this case is what makes the signed→unsigned mutant fail. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x80000000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* 0xffffffff = -1: also skipped, also inverted by an unsigned model. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0xffffffff,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Boundary at exactly 1: `jle` is <= 0, so 1 still RUNS the block. A `< 0`
     mutant agrees here but disagrees on the timer = 0 case above; a `<= 1`
     misreading disagrees here. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 1,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ready = 0 with a timer that WOULD skip: the pre-v66 wire has no capture, so
     the host edge is still emitted unconditionally. This pins the compatibility
     arm and is what the "ready-flag ignored" mutant collides with. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 0,
    frameOpaque98dba0Timer264e8: 0,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v70 PURE arm, MT sub-arm. sample 0x80000000 is the hand-derived exact
     case (theta IS the 3.14f constant); timer 0x1e is the ChangeRoom store, so
     timerAfter = 0x1d and mag = 2.9f; old x/y are 1.0f / -3.0f; the trig
     results are the synthetic exact doubles 1.0 / -0.5 (the plan consumes
     whatever the host supplies — realism is exercised by the randomized rows,
     exactness by these). Expect NO host edge and the published plan. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x80000000,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0xc0400000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0xbfe00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* PURE arm, CRT sub-arm: useCrtRand byte 1 — the PE's 0x006eefa9 early
     return means the MT stream did NOT advance; the sample is the host's CRT
     rand() dword and the float plan is identical. mt_advanced must be 0. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 1,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x3039,
    frameOpaque98dba0TimerUseCrtRand: 1,
    frameOpaque98dba0TimerX264ecBits: 0x3f000000,
    frameOpaque98dba0TimerY264f0Bits: 0x80000000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3fe00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* PURE arm, WIDE useCrtRand capture 0x100: the PE test is `cmp byte ptr
     [0xc7ac68],0` — LOW BYTE ONLY — so 0x100 reads as 0 and mt_advanced must
     be 1. A full-word model reads 0x100 as nonzero and diverges here. Old x
     is the canonical quiet NaN: the recursive 0.5f accumulate propagates it
     (NaN*0.5 + finite = NaN) and both sides must publish canonical bits. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 2,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xffffff7f,
    frameOpaque98dba0TimerUseCrtRand: 0x100,
    frameOpaque98dba0TimerX264ecBits: 0x7fc00000,
    frameOpaque98dba0TimerY264f0Bits: 0x7f7fffff,
    frameOpaque98dba0TimerCosBitsLo: 0xffffffff,
    frameOpaque98dba0TimerCosBitsHi: 0x3fefffff,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0xbff00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Timer 1 PURE: the last shake tick. timerAfter = 0, mag = +0.0f, so each
     store collapses to trig*(+0) + old*0.5f — the halving tail. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 1,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xffffffff,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x40a00000,
    frameOpaque98dba0TimerY264f0Bits: 0xc0a00000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0xbff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x3fe00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* SKIP arm with the interior captures present: the gate still wins — no
     host edge AND no plan. pure_ready alone must never resurrect the block. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x12345678,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0x3f800000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x3ff00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ready = 0 with pure_ready = 1: the gate capture is missing, so the
     pre-v66 unconditional host emission wins and the plan must NOT run —
     pure_ready without the timer value has nothing sound to decrement. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 0,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x80000000,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0x3f800000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x3ff00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* INT_MAX timer PURE: timerAfter = 0x7ffffffe, whose cvtdq2ps rounds to
     2^31 and mag = 0x4d4ccccd — the large-magnitude conversion boundary. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x7fffffff,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xffffff80,
    frameOpaque98dba0TimerUseCrtRand: 0xffffff00,
    frameOpaque98dba0TimerX264ecBits: 0x00000001,
    frameOpaque98dba0TimerY264f0Bits: 0x80000001,
    frameOpaque98dba0TimerCosBitsLo: 0x55555555,
    frameOpaque98dba0TimerCosBitsHi: 0x3fd55555,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x36a00000,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: MT-ready PURE arm. The host captured mt[624] (genrandState) and
     mti at THIS boundary; the draw is computed IN-MODULE from the Room
     family's recovered MT19937 (never supplied as frameOpaque98dba0TimerSample
     on this arm — that field is deliberately left at a DIFFERENT value here so
     a side that consults it instead of drawing diverges). Sample chosen from
     the corpus fill: index 100 is a plain emit; the expected theta is the
     theta of the room-law draw, so the whole chain is pinned end to end. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xdeadbeef, /* NOT consulted on this arm */
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0xc0400000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0xbfe00000,
    frameOpaque98dba0TimerMtReady: 1,
    frameOpaque98dba0TimerMtiIn: 100,
    genrandMtReady: 1,
    genrandIndexIn: 100,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: MT-ready PURE arm, COLD 625 seed path (mti == 625 == 0x271):
     the PE seeds 5489 and reloads before emitting, so the draw is the first
     word of the canonical default-seeded MT19937 stream and indexOut = 1. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 2,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xdeadbeef,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0x3f800000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerMtReady: 1,
    frameOpaque98dba0TimerMtiIn: 0x271,
    genrandMtReady: 1,
    genrandIndexIn: 0x271,
    genrandModeFlag: 0,
    genrandState: new Uint32Array(GENRAND_STATE_WORDS),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: MT-ready PURE arm, 624 strict-reload path (twist WITHOUT the 625
     seed branch). indexOut must be 1 and the whole 2496 B state must come
     back twisted on both sides. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 3,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xdeadbeef,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0x3f800000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerMtReady: 1,
    frameOpaque98dba0TimerMtiIn: 624,
    genrandMtReady: 1,
    genrandIndexIn: 624,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: MT-ready arm with the useCrtRand LOW BYTE set: the PE
     0x006eef91 branch takes CRT rand() WITHOUT touching mt[] — the arm must
     fall back to the v70 host-drawn plan (sample consulted), mt_advanced = 0
     and the scratch must come back UNCHANGED on both sides. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x3039,
    frameOpaque98dba0TimerUseCrtRand: 1,
    frameOpaque98dba0TimerX264ecBits: 0x3f000000,
    frameOpaque98dba0TimerY264f0Bits: 0x80000000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3fe00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0,
    frameOpaque98dba0TimerMtReady: 1,
    frameOpaque98dba0TimerMtiIn: 10,
    genrandMtReady: 1,
    genrandIndexIn: 10,
    genrandModeFlag: 1,
    genrandState: genrandFilledState(),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: MT-ready WIDE-byte arm: useCrtRand 0x100 has a CLEAR low byte,
     so the in-module draw runs (mt_advanced = 1) and indexOut is published. */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0xdeadbeef,
    frameOpaque98dba0TimerUseCrtRand: 0x100,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0xc0400000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0xbfe00000,
    frameOpaque98dba0TimerMtReady: 1,
    frameOpaque98dba0TimerMtiIn: 620,
    genrandMtReady: 1,
    genrandIndexIn: 620,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* ABI v76: mtReady = 0 keeps the v70 host-drawn arm byte-for-byte even when
     a state array and an index were supplied (the host did not vouch for a
     capture at THIS boundary). */
  completeState({
    gate1b83c: 1,
    predicate1ba74: 0,
    counter265c0: 1,
    frameOpaque98dba0Mode: 0,
    frameOpaque98dba0Counter: 4,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    frameOpaque98dba0TimerReady: 1,
    frameOpaque98dba0Timer264e8: 0x1e,
    frameOpaque98dba0TimerPureReady: 1,
    frameOpaque98dba0TimerSample: 0x80000000,
    frameOpaque98dba0TimerUseCrtRand: 0,
    frameOpaque98dba0TimerX264ecBits: 0x3f800000,
    frameOpaque98dba0TimerY264f0Bits: 0xc0400000,
    frameOpaque98dba0TimerCosBitsLo: 0,
    frameOpaque98dba0TimerCosBitsHi: 0x3ff00000,
    frameOpaque98dba0TimerSinBitsLo: 0,
    frameOpaque98dba0TimerSinBitsHi: 0xbfe00000,
    frameOpaque98dba0TimerMtReady: 0,
    frameOpaque98dba0TimerMtiIn: 0,
    genrandMtReady: 1,
    genrandIndexIn: 100,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* FUN_0098dba0 mode1 pure path + text_out gated off */
  completeState({
    gate1b83c: 1,
    frameOpaque98dba0Mode: 1,
    frameOpaque98dba0Flag: 0,
    frameOpaque98dba0Counter: 3,
    frameOpaque98dba0Float170: 0.5,
    frameOpaque98dba0Float2d0: 0.2,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Game216e9: 1,
    resumeGate1b83c: 0,
    resumePredicate1ba74: 0,
  }),
  /* Frame-aux 98dba0 mode2 float toward manager + clamp */
  completeState({
    globalRangeByteLength: 8,
    frameOpaque98dba0Mode: 2,
    frameOpaque98dba0Counter: 5,
    frameOpaque98dba0Float170: 1.5,
    frameOpaque98dba0Float2d0: -0.2,
    frameOpaque98dba0Bvar2: 0,
    frameOpaque98dba0Manager2a35c: 0.55,
    frameOpaque98dba0Game216e9: 0,
  }),
  completeState({ genericPromptActiveObject: 1, genericPromptActiveFlag: 1, transitionProgress: 0, resumePromptSubmittedSelection: 1, resumePromptPostUpdateFlag: 0 }),
  completeState({ genericPromptActiveObject: 1, genericPromptActiveFlag: 1, resumePromptSubmittedSelection: 1, resumePromptPostUpdateFlag: 1 }),
  completeState({ genericPromptActiveObject: 0, genericPromptActiveFlag: 1, skipTimedTransitionFlag: 1 }),
  completeState({ genericPromptActiveObject: 1, genericPromptActiveFlag: 0, skipTimedTransitionFlag: 0 }),
  completeState({ itemOverlayState: 1, menuState23a74: 3, globalRangeByteLength: 4, resumeItemOverlayState: 2, resumeMenuState23a74: 3 }),
  completeState({ itemOverlayState: 1, menuState23a74: 0, resumeItemOverlayState: 0, resumeMenuState23a74: 0 }),
  completeState({ itemOverlayState: 1, menuState23a74: 3, globalRangeByteLength: 0 }),

  /* ABI v58: ItemOverlay::Update state-1 countdown block (pure). Counter 3 →
     dec 2 stays (timed tail); counter 1 → dec 0 flips to 2 (resume); counter 0
     → dec -1 flips to 2 (signed jg); INT_MIN → INT_MAX stays; INT_MAX → stays. */
  completeState({ itemOverlayState: 1, itemOverlayCounter11d1d0: 3, menuState23a74: 0 }),
  completeState({ itemOverlayState: 1, itemOverlayCounter11d1d0: 1, menuState23a74: 0 }),
  completeState({ itemOverlayState: 1, itemOverlayCounter11d1d0: 0, menuState23a74: 0 }),
  completeState({ itemOverlayState: 1, itemOverlayCounter11d1d0: -2147483648, menuState23a74: 0 }),
  completeState({ itemOverlayState: 1, itemOverlayCounter11d1d0: 2147483647, menuState23a74: 0 }),
  completeState({ itemOverlayState: 2, itemOverlayCounter11d1d0: 7, menuState23a74: 0 }),
  completeState({ itemOverlayState: 1, menuState23a74: 3, globalRangeByteLength: 4, resumeItemOverlayState: 2, resumeMenuState23a74: 0 }),
  completeState({ timedTransitionProgress: 0.75, transitionRate: Math.fround(0.1), monotonicElapsed: 3000 }),
  completeState({ timedTransitionProgress: 0.75, transitionRate: Math.fround(0.1), monotonicElapsed: 3001 }),
  completeState({ timedTransitionProgress: 0.05, transitionRate: Math.fround(0.1), timedTransitionForceFinish: 1, timedTransitionCleanupMode: 1, globalRangeByteLength: 4 }),
  /* ABI v65: the other 0x00746560 site (PE 0x006fb7d6, `push 0`). The widget
     stores (0 ^ 1) = 1 into Game+0x216e9 and 1 into Game+0x216e8, so the
     sparse hudMessageFlag8 must come back set. */
  completeState({ timedTransitionProgress: 0.05, transitionRate: Math.fround(0.1), timedTransitionForceFinish: 1, timedTransitionCleanupMode: 1, globalRangeByteLength: 4, hostFun746560PostReady: 1, hudMessageFlag8: 0 }),
  completeState({ timedTransitionProgress: 0.05, transitionRate: Math.fround(0.1), timedTransitionForceFinish: 1, timedTransitionCleanupMode: -1, globalRangeByteLength: 4, hostFun746560PostReady: 1, hudMessageFlag8: 0 }),
  completeState({ timedTransitionProgress: 0, status22ed4: 9, status22edc: 10 }),
  completeState({ globalMenuGuard4b3ca: 0, globalMenuEnable2a3a5: 1, globalRangeByteLength: 0, resumeMenuOpenState: 1, resumeMenuUpdateState: 1 }),
  completeState({ counter265c0: 0x7fffffff, globalMenuGuard4b3ca: 0, globalMenuEnable2a3a5: 1, globalRangeByteLength: 0, resumeMenuOpenState: 0 }),
  completeState({ menuState23a74: 1, globalRangeByteLength: 8, resumeMenuUpdateState: 1 }),
  completeState({ menuState23a74: 1, globalRangeByteLength: 4, resumeMenuUpdateState: 1 }),
  completeState({ state24ecc: 1, globalMenuGuard4b3ca: 1, globalRangeByteLength: 0 }),
  completeState({ state24ecc: 1, counter265c0: -1, globalRangeByteLength: 8 }),
  /* ABI v59/v89: 0x008ef990 State24ecc_Update gate rows. v59: state==1 is a
     no-op when the byte at Game+0x22ed0 is zero. v89: state==2 dropped the
     host edge and runs the pure decrement arm (rows below). Host = ready==0
     fallback or state==1 with the ready byte nonzero. */
  completeState({ menuState23a74: 0, state24ecc: 1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 1, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0xff, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 2, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0xff, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 0x7ffffff0, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0x80, globalRangeByteLength: 0 }),
  /* ABI v89: state==2 is PURE — mode24ed8 -= 1 (32-bit wrap) and, when the
     PRE-decrement value is <= 0, the state clears (PE 0x8efdec..0x8efe04). */
  completeState({ menuState23a74: 0, state24ecc: 2, mode24ed8: 8, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 2, mode24ed8: 1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 2, mode24ed8: 0, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 2, mode24ed8: -1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 2, mode24ed8: 0x80000000, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 0, globalRangeByteLength: 0 }),
  completeState({ menuState23a74: 0, state24ecc: 1, state24ecc22ed0Ready: 1, state24ecc22ed0Flag: 255, globalRangeByteLength: 4 }),
  /* ABI v60: SFX stop gate VA 0x0092e230 — the four PE gate classes under a
     STOP-shaped wire (single eligible-zero player + sfxPlaying => STOP):
     MISS (id<0 or id>=count, PE 0x92e239 js / 0x92e25b jge) and DISABLED
     (entry[0x198] byte clear, 0x92e290 je) are pure no-ops — the host edge
     is DROPPED; NO_SAMPLES keeps the warn log (0x92e272 call 0xa112c0) and
     LIVE keeps the per-voice stop loop. enabled is a BYTE test: 0x100 reads
     disabled. ready=0 keeps the pre-v60 always-host residual. */
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, pmIntensityFlags0: 0, pmIntensityDead0: 0, sfxStopReady: 1, sfxStopSpan: 0, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: -1, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 508 * 0x1b8, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 0, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  /* ABI v63: common-tail WRITE lane (PE 0x006fb38a) — the byte clear runs
     every pass regardless of the transition state (pinned 0xff input must
     become 0), and transitionMode is kept only when 8/9 else zeroed. */
  completeState({ transitionTailByte29fb8: 0xff, transitionMode: 4 }),
  completeState({ transitionTailByte29fb8: 1, transitionMode: 8 }),
  completeState({ transitionTailByte29fb8: 0xff, transitionMode: 9, postUpdateDelay: 1 }),

  /* ABI v63: VA 0x009a2b30 transition-tail sweep — every state passes the
     0x006fb38a common tail (1 host call); postUpdateDelay>0 decrements and
     calls it a second time then EARLY-RETURNS (PE 0x006fb3c7..0x006fb3d0). */
  completeState({ postUpdateDelay: 1 }),
  completeState({ postUpdateDelay: 2 }),
  completeState({ postUpdateDelay: 3, transitionProgress: 0.5 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0x100 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 1 }),
  /* ABI v95: record idx 47 STOP fold pins. fold capture + LIVE all-null ->
     sentinel-only in-module fold, monolithic DROPPED; fold capture + live
     channel with a device stop -> the typed sfx_stop_fold_stop_calls event
     and NO playerManagerUpdateHeartbeatSfxStop. */
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 1, sfxStopEnabled198: 1, sfxStopFoldReady: 1, sfxStopVoiceCount: 1, sfxStopVoices: [{ channelNull: 1, pending09: 0, probeFirst: 0, probeSecond: 0, channelNullReload: 0, voicesReloaded: 1 }] }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 1, sfxStopEnabled198: 1, sfxStopFoldReady: 1, sfxStopVoiceCount: 1, sfxStopVoices: [{ channelNull: 0, pending09: 1, probeFirst: 0, probeSecond: 1, channelNullReload: 0, voicesReloaded: 1 }] }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 0, sfxStopReady: 0, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  /* ABI v62: SFX volume-update gate VA 0x0092df40 (+ twin 0x0092e050,
     callsites 0x009bb7c9 / 0x009bb7dd) under an UPDATE-shaped wire
     (maxVol>0 via raw0=20 => clamp 1.0 + sfxPlaying => residual UPDATE).
     Same four PE classes as the v60 stop fold: MISS (id<0 or id>=count,
     PE 0x92df51 js / 0x92df71 jge) and DISABLED (byte[entry+0x198] clear,
     PE 0x92dfa8 je) are complete no-ops -> both calls dropped; NO_SAMPLES
     (entry[0x190]==0, PE 0x92df7f ja) keeps the warn log 0xa112c0; LIVE
     keeps the per-voice volume hosts. 0x100 reads disabled (byte test).
     ready=0 keeps the pre-v62 always-host residual. */
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, pmIntensityFlags0: 0, pmIntensityDead0: 0, sfxStopReady: 1, sfxStopSpan: 0, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: -1, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 508 * 0x1b8, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 0, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0x100 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 1, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 0, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  /* ABI v68: SFX play gate VA 0x0092dc30 (exact 44-byte ZHL
     SFXManager::Play) under a PLAY-shaped wire (sfxPlaying=0 +
     maxVol=1.0 => residual PLAY). The play entry drop is NARROWER than
     the v60/v62 mutator folds: ONLY MISS (id 0x1fc < 0 or >= count, PE
     0x92dc73 js / 0x92dc96 jge) is a side-effect-free return and the
     host edge is DROPPED. NO_SAMPLES (entry[0x190]==0) keeps the
     warn-log host (PE 0x92dcb5 call 0xa112c0, "[warn] Sound %d has no
     samples."); DISABLED (entry[0x198] byte clear) keeps the host
     because the play path LOADS the entry (PE 0x92dcda call 0x92cfb0
     SoundEffect::Load, "[warn] Sound %d was not preloaded.") and
     CONTINUES into the body — NOT a no-op like the stop/update folds;
     LIVE keeps the per-voice play body. 0x100 reads disabled (byte
     test). ready=0 keeps the pre-v68 always-host residual. */
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, pmIntensityFlags0: 0, pmIntensityDead0: 0, sfxStopReady: 1, sfxStopSpan: 0, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: -1, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 508 * 0x1b8, sfxStopVoices190: 1, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 0, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0x100 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 1 }),
  completeState({ pmIntensityPlayerCount: 1, pmIntensitySfxPlaying: 0, pmIntensityBlobReady: 1, pmIntensityRaw0: 20, sfxStopReady: 0, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2, sfxStopEnabled198: 0 }),
  /* ABI v69: PM0/PM1 death-walk wire (PlayerManager::Update 0x009bb5d0).
     PE facts these pins encode: dual-zero 0x009bb5df/0x009bb5ee; outer
     count==0 `je 0x9bb6a4` skips the loop with NO fatal; eligibility
     0x009bb64c `cmp byte [ecx+0x173],0` (BYTE), 0x009bb655 `cmp dword
     [ecx+0x7c],0` (WORD), 0x009bb65b `cmp byte [ecx+0x8c],0` (BYTE),
     0x009bb66a `test eax,eax` twin null (the pack lane carries its low
     byte), twin 0x7c/0x8c same widths. Zero eligible → walk is a pure
     no-op → event DROPPED; any eligible → ONE monolithic host walk;
     blob=0 / count>8 → monolithic fallback. Byte lanes are driven with
     0x100-shaped values UNMASKED. */
  completeState({ pmDeathPlayerCount: 2, pmDeathBlobReady: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathTwinNull0: 1 }),
  completeState({ pmDeathPlayerCount: 0 }),
  completeState({ pmDeathPlayerCount: 0, pmDeathBlobReady: 1 }),
  completeState({ pmDeathPlayerCount: -3, pmDeathBlobReady: 1, pmDeathDead1730: 1 }),
  completeState({ pmDeathPlayerCount: 9, pmDeathBlobReady: 1, pmDeathDead1730: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 0x100 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 0x101 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathAnim7c0: 5, pmDeathAnim8c0: 1, pmDeathTwinNull0: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathAnim7c0: 5, pmDeathAnim8c0: 0x100, pmDeathTwinNull0: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathTwinNull0: 0, pmDeathTwinAnim7c0: 3, pmDeathTwinAnim8c0: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathTwinNull0: 0x100, pmDeathTwinAnim7c0: 3, pmDeathTwinAnim8c0: 1 }),
  completeState({ pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathTwinNull0: 0, pmDeathTwinAnim7c0: 3, pmDeathTwinAnim8c0: 0x100 }),
  completeState({ pmDeathPlayerCount: 3, pmDeathBlobReady: 1, pmDeathDead1731: 1, pmDeathTwinNull1: 1 }),
  /* Closed-gate arm: a mid-pause host rewrite of Game+0x1b83c / Game+0x1ba78
     (PM0 re-reads both live) must suppress the death walk even with an
     eligible ready pack / with the monolithic fallback inputs. */
  completeState({ resumeHeadGate1b83c: 1, pmDeathPlayerCount: 1, pmDeathBlobReady: 1, pmDeathDead1730: 1, pmDeathTwinNull0: 1 }),
  completeState({ resumeHeadGate1ba78: 7 }),
  // FrameOpaque_4212c0 pure-complete: mode==0 no-op (default) already covered; pure mode==1 clear
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 1,
    frameOpaque4212c0Secondary: 0,
    frameOpaque4212c0Field3c: 0,
    frameOpaque4212c0Flag4c: 0,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0SlotChar: 0,
  }),
  // FrameOpaque_4212c0 pure secondary==3 clear both
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 0,
    frameOpaque4212c0Flag111: 0,
  }),
  // FrameOpaque_4212c0 host residual: flag_111
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 1,
    frameOpaque4212c0Flag111: 1,
  }),
  // FrameOpaque_4212c0 host residual: secondary==3 with field_3c
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
  }),
  /* ---- ABI v95: 4212c0 R4 equal-flags walk lanes --------------
     Every row reaches the probe arm (mode!=0, flag111 folded, secondary
     ==3, field3c!=0) with the equal-flags blob; the anti-aligned v91
     leftover matchIndex discriminates a module that ignores the flags. */
  // TRUE lane: first match idx 1, bit1 SET -> probe TRUE -> interior host.
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 4,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [0, 1, 1, 0],
    frameOpaque4212c0Add0Bitfield18: 0x2,
    frameOpaque4212c0Add0MatchIndex: 2, /* anti-aligned: bit2 clear */
  }),
  // FALSE lane: first match idx 1, bit1 CLEAR -> probe FALSE -> pure clear.
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 4,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [0, 1, 1, 0],
    frameOpaque4212c0Add0Bitfield18: 0x4,
    frameOpaque4212c0Add0MatchIndex: 2, /* anti-aligned: bit2 SET -> would host */
  }),
  // MISS lane: no set flag -> probe FALSE (all-flags-clear).
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 4,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [0, 0, 0, 0],
    frameOpaque4212c0Add0Bitfield18: 0xffffffff,
    frameOpaque4212c0Add0MatchIndex: 0, /* anti-aligned: would probe TRUE */
  }),
  // Over-cap lane: count 65 + ready=1 -> v91 matchIndex path (host TRUE).
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 65,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [1, 0, 0, 0],
    frameOpaque4212c0Add0Bitfield18: 0x4,
    frameOpaque4212c0Add0MatchIndex: 2, /* v91: bit2 SET -> TRUE -> host */
  }),
  // Over-cap lane: count 0x100 wide + ready=1 -> v91 matchIndex path (pure FALSE).
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 0x100,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [1, 0, 0, 0],
    frameOpaque4212c0Add0Bitfield18: 0x2,
    frameOpaque4212c0Add0MatchIndex: 2, /* v91: bit2 CLEAR -> FALSE -> pure */
  }),
  // Log arm keeper: field4==0 + flags MISS -> typed log event + host edge.
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 2,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag111: 0,
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 0,
    frameOpaque4212c0Add0ListCount: 4,
    frameOpaque4212c0Add0EqualFlagsReady: 1,
    frameOpaque4212c0Add0EqualFlags: [0, 0, 0, 0],
    frameOpaque4212c0Add0Bitfield18: 0xffffffff,
    frameOpaque4212c0Add0MatchIndex: 0, /* anti-aligned: would probe TRUE */
  }),
  /* ---- ABI v107 (wave-29 merge REBIND, C1): the A/B 409030 pair + the
     tcsStats vector capture — dedicated rows so the rebound lanes fire
     the pure-pair typed events / the stats growth sim on the Wasm side
     (the whitelist + layout alone would still leave the wires un-exercised
     if the gates never open). */
  // Pair PURE A+B ADVANCE (deterministic; v110 quiesce audit): the v107
  // originals never opened the pair gate — flag_111 0x100 has low byte 0
  // (gate CLOSED) and the flag_111==1 row kept flag_111_eff live, so
  // try_pure HOSTED the arm and the typed events stayed unpublished (the
  // rebind guard starved at capped draw budgets; v109's rebindAbPack=4
  // at 5291 draws were lucky random hits). mode==0 exits pure BEFORE the
  // probe arm (PE 0x4212ce je 0x4213f7) with flag_111_eff folded by the
  // live pair, so the in-module 409030 plan publishes 0x408d00 Advance.
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 0,
    frameOpaque4212c0Secondary: 0,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag4c: 1,
    frameOpaque4212c0Flag111: 1,
    frameOpaque4212c0PairReady: 1,
    frameOpaque4212c0Field5c: 1,
    frameOpaque4212c0Flag6c: 1,
    frameOpaque4212c0AbPackReady: 1,
    frameOpaque4212c0AFloat10: 0x40000000, /* 2.0f */
    frameOpaque4212c0BFloat10: 0x40000000,
    frameOpaque4212c0ALayer104: 0x3f800000, /* 1.0f */
    frameOpaque4212c0BLayer104: 0x3f800000,
    frameOpaque4212c0AFrameBound: 10,
    frameOpaque4212c0BFrameBound: 10,
    frameOpaque4212c0ALoopFlag: 0,
    frameOpaque4212c0BLoopFlag: 0,
  }),
  // Pair PURE REWIND: same gates with frameBound 0 + loop flags set ->
  // the 409030 path takes REWIND and 0x40a1b0 Rewind typed events fire.
  completeState({
    globalRangeByteLength: 8,
    frameOpaque4212c0Mode: 0,
    frameOpaque4212c0Secondary: 0,
    frameOpaque4212c0Field3c: 5,
    frameOpaque4212c0Flag4c: 1,
    frameOpaque4212c0Flag111: 1,
    frameOpaque4212c0PairReady: 1,
    frameOpaque4212c0Field5c: 1,
    frameOpaque4212c0Flag6c: 1,
    frameOpaque4212c0AbPackReady: 1,
    frameOpaque4212c0AFloat10: 0x40000000, /* 2.0f */
    frameOpaque4212c0BFloat10: 0x40000000,
    frameOpaque4212c0ALayer104: 0x3f800000, /* 1.0f */
    frameOpaque4212c0BLayer104: 0x3f800000,
    frameOpaque4212c0AFrameBound: 0,
    frameOpaque4212c0BFrameBound: 0,
    frameOpaque4212c0ALoopFlag: 1,
    frameOpaque4212c0BLoopFlag: 1,
  }),
  // 92f1c0 case-2 PURE TAIL: gate open + ready + mode 3 + counter < limit
  // + field14 low 0 -> no host edge (the rebound limit/field14 lanes
  // discriminate; the tail emits CounterOut + status stores only).
  completeState({
    gate1ba78: 1,
    opaque0092f1c0Ready: 1,
    opaque0092f1c0Mode: 3,
    opaque0092f1c0Counter: 5,
    opaque0092f1c0Limit: 100,
    opaque0092f1c0Field14: 0,
  }),
  // tcsStats growth sim: clear_count==0 pre-entry (entry -> 1, gate opens)
  // + float gate open + vec capture -> typed events fire.
  completeState({
    globalRangeByteLength: 8,
    roomDescClearCount4a: 0,
    tcsStatsVecReady: 1,
    tcsStatsVecBegin: 0x1000,
    tcsStatsVecEnd: 0x1008,
    tcsStatsVecCap: 0x10,
    tcsStatsDesc10_48: 9,
    tcsStatsLookupBits: 0x3f800000, /* 1.0f > -18.0f */
    tcsStatsGameByte8: 1,
  }),
  completeState({ effectCounter67788: 1, globalRangeByteLength: 8 }),
  completeState({ effectCounter67788: 89, globalRangeByteLength: 8, resumeStageEffectCounter68d6c: 2 }),
  completeState({ effectCounter67788: 0x7fffffff, globalRangeByteLength: 8 }),
  completeState({ effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionMarker18318: 7, roomTransitionIndex18900: -7, roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8 }),
  /* ---- ABI v72: FrameEffect_6fd7c0 shell (record 21) no-op gate ----------
     Every case below reaches site A (effectCounter68d6c 1 → 0 with
     roomTransitionMode1830c == 2, cleanup mode != 4). Site A anim is 20, so
     the blue-room gate at PE 0x006fdb57 `test edi,edi / jne` is always closed
     and only the 705ee0 gate decides. */
  // ready = 0: the v71 unconditional shell residual, gate inputs ignored.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 0,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 0,
  }),
  // DROP arm A: room indices differ (PE 0x006fdb34 jne 0x6fdb57).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 5,
    frameEffectShellRoomByte1: 1,
  }),
  // DROP arm B: indices equal but the byte is clear (PE 0x006fdb42 je 0x6fdb57).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 0,
  }),
  // FALLBACK arm: indices equal AND the byte is set → FUN_00705ee0 runs.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
  }),
  // Byte gate driven UNMASKED, low byte CLEAR → drop (0x100 / 0x80000000).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0, frameEffectShellRoom182d0: 0,
    frameEffectShellRoomByte1: 0x100,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0, frameEffectShellRoom182d0: 0,
    frameEffectShellRoomByte1: 0x80000000,
  }),
  // Byte gate driven UNMASKED, low byte SET → host (0x1ff / 0xffffffff).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0, frameEffectShellRoom182d0: 0,
    frameEffectShellRoomByte1: 0x1ff,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0, frameEffectShellRoom182d0: 0,
    frameEffectShellRoomByte1: 0xffffffff,
  }),
  // room == -2 forces the dimension to 0 (PE 0x006fd8f5) before the walk.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -2,
    roomTransitionDimension18904: 0x05, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 1, frameEffectShellRoom182d0: 2,
    frameEffectShellRoomByte1: 0xff,
  }),
  // Mode 4 short-circuits before the shell decision (record 20 arm).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    timedTransitionCleanupMode: 4,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 5,
    frameEffectShellRoomByte1: 0,
  }),
  /* ---- ABI v74: FUN_00705ee0 entry-guard gate --------------------------
     Same site-A shape, but with the shell captures set to the FALLBACK arm
     (indices equal AND byte set) so the PE really does reach 0x006fdb4f.
     Only the rewind guards can drop the residual from here. */
  // rewindReady = 0 → the v73 decision: 705ee0 reached, so the residual stays.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 0,
    frameEffectRewindGuard269ea: 1,
  }),
  // rewindReady = 1, all guards CLEAR → the snapshot really runs: still host.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 0,
    frameEffectRewindGuard269eb: 0,
    frameEffectRewindGuard68d70: 0,
  }),
  // Guard A set (PE 0x00705eef) → no-op exit → DROP.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 1,
  }),
  // Guard B set (PE 0x00705efc) → DROP. Separate observation from guard A.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269eb: 0xff,
  }),
  // Guard C set (PE 0x00705f09, the byte at GAME_OBJECT_MIN_SIZE) → DROP.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard68d70: 0x7f,
  }),
  // Guards driven UNMASKED, low byte CLEAR → the PE's byte compare sees zero,
  // so these must stay HOST (0x100 / 0x80000000 / 0xffffff00).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 0x100,
    frameEffectRewindGuard269eb: 0x80000000,
    frameEffectRewindGuard68d70: 0xffffff00,
  }),
  // Guards driven UNMASKED, low byte SET → DROP (0x1ff / 0xffffffff).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 0x1ff,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard68d70: 0xffffffff,
  }),
  // rewindReady = 1 on an arm that never reaches 0x006fdb4f: the guards must
  // not change anything, drop or no drop (indices differ → already dropped).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 5,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 0,
  }),
  // Rewind captures supplied WITHOUT the shell gate: ready=0 still wins.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 0,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1,
    frameEffectRewindGuard269ea: 1,
    frameEffectRewindGuard269eb: 1,
    frameEffectRewindGuard68d70: 1,
  }),
  /* ---- ABI v129 (update-v129-record20-shell-removal): FULL-CAPTURE
     theorem arms, draw-budget free. Under
     capLive = frameEffectShellReady && opaqueCall006fd7c0Ready every arm
     of the coarse opaqueFrameEffect6fd7c0Shell edge retires (pure skip /
     74d4a0 Update-no-op / typed-carried or own-frame-only); capture
     absence keeps the pre-v72 monolith. Each arm below differs from its
     neighbor by ONE lane so the differential fails if the harness ever
     stops delivering a key. */
  // capLive + both gates closed (rooms differ) -> PROVEN pure skip, no coarse.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1, opaqueCall006fd7c0Ready: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 5,
    frameEffectShellRoomByte1: 1,
  }),
  // capLive + canopy open (rooms equal + byte set) + real slot lanes ->
  // write block runs -> TYPED pair carries it; coarse stays retired.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1, opaqueCall006fd7c0Ready: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    rewind705ee0SlotIndex676ac: 0, rewind705ee0SlotValidByte: 1,
    rewind705ee0SlotRoom19d20: 4, rewind705ee0SlotTagE8: 1, rewind705ee0GameTag0: 1,
  }),
  // Same but guard B set -> plan.miss (own-frame-only exit): NOTHING fires.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1, opaqueCall006fd7c0Ready: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    rewind705ee0SlotIndex676ac: 0, rewind705ee0SlotValidByte: 1,
    frameEffectRewindGuard269eb: 0xff,
  }),
  // WIDE guard low byte CLEAR -> the PE still snapshots (typed pair), and
  // the coarse edge stays retired either way.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1, opaqueCall006fd7c0Ready: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    rewind705ee0SlotIndex676ac: 0, rewind705ee0SlotValidByte: 1,
    frameEffectRewindGuard68d70: 0x100,
  }),
  // record-12 lane 0 -> legacy v74 decision: coarse fires on the needs arm.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1, opaqueCall006fd7c0Ready: 0,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
  }),
  // ---- ABI v75: record 22's engine-prefix latch gate (FUN_0082ee40). ----
  // ready = 0 → v74 behaviour: prefix host event still emitted even though the
  // latch says the ANM2 arm would be skipped. Pins the fallback.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 0, engineAnm2Latch: 1,
  }),
  // ready = 1, latch CLEAR → PE 0x0082eea5 falls through to ANM2::Load, whose
  // store census is 6 observable writes. Must stay HOST.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0,
  }),
  // ready = 1, latch SET → the arm is jumped, census empty → DROP. This row and
  // the one above differ ONLY in engineAnm2Latch, so the differential fails if
  // the harness ever stops delivering the key.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 1,
  }),
  // Latch driven UNMASKED with a CLEAR low byte: the PE compares a byte, so
  // 0x100 / 0x80000000 / 0xffffff00 must all keep the host event.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0x100,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0x80000000,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0xffffff00,
  }),
  // Latch driven UNMASKED with a SET low byte → DROP (0x1ff / 0xffffffff).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0x1ff,
  }),
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 0xffffffff,
  }),
  // The latch gate is independent of the shell gate: both ready, both drop.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 4, frameEffectShellRoom182d0: 4,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindReady: 1, frameEffectRewindGuard269ea: 1,
    engineAnm2LatchReady: 1, engineAnm2Latch: 1,
  }),
  // Mode 4 takes the early SFX arm and never reaches the prefix at all, so a
  // ready latch must NOT invent a drop (the counter is already 0 there).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 4, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2LatchReady: 1, engineAnm2Latch: 1,
  }),
  // ---- ABI v77: record 22's ANM2::Load lane (anm2 family v7 wire). ----
  // Site-A shape; blob + latch ready + latch low byte clear -> the pure lane
  // runs IN-MODULE while the record-22 host event still fires (NARROWED, not
  // removed — the pre-lane host half keeps the record). These rows prove the
  // blob reaches BOTH sides: the differential would fail if the harness
  // delivered zeros (measured defect class).
  // Lane ON: shadow layer 0, star layer 1, star extra 0, latch WIDE 0x100.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0x100,
    engineAnm2LayerCount: 3, engineAnm2ExtraCount: 1, engineAnm2Bitflags110Pre: 0x30,
    engineAnm2LayerNames: ["shadow", "*star", "plain"], engineAnm2ExtraNames: ["*e"],
  }),
  // Lane ON: LAST shadow wins (both layers "shadow"), no stars.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2LayerCount: 2, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0x10,
    engineAnm2LayerNames: ["shadow", "shadow"],
  }),
  // Lane ON: empty body — exactly S1 + S2, flags untouched.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2LayerCount: 0, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
  }),
  // Lane ON: extras-only star — 0x800 without 0x400, no mask bits.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2LayerCount: 0, engineAnm2ExtraCount: 1, engineAnm2Bitflags110Pre: 0,
    engineAnm2ExtraNames: ["*x"],
  }),
  // Lane OFF: latch low byte SET (0x1ff) — the PE jumps the whole arm.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0x1ff,
    engineAnm2LayerCount: 1, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
    engineAnm2LayerNames: ["*s"],
  }),
  // Lane OFF: no blob — the v76 host residual byte-for-byte.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 0, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2LayerCount: 1, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
    engineAnm2LayerNames: ["*s"],
  }),
  // Lane OFF: over-cap layer count (33 > 32) — the cap trips, host wins.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2LayerCount: 33, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
  }),
  // ---- ABI v98 (wave-22 Unit B): record 22 REMOVED — the typed path
  // (all five capture vouchers live + lane_pure + latch low byte clear)
  // drops the coarse opaqueRoomTransitionEnginePrefix counter and fires the
  // typed emissions (944/948/952). Any voucher 0 keeps the pre-v98 coarse
  // fallback byte-for-byte. These rows prove the NEW vouchers reach BOTH
  // sides: the differential fails if the harness delivers zeros. ----
  // Typed path ON: site shape (layer count 1 -> v8 fence opens, leaf fires).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2FilenameReady: 1, engineAnm2FilenamePtr: 0xb6cda8,
    engineAnm2FilenameSize: 0x1d, engineAnm2FilenameCap: 0x1f,
    engineAnm2AnimReady: 1, engineAnm2AnimFirstPre: 0, engineAnm2AnimSecondPre: 0,
    engineAnm2LoadgraphicsFlagReady: 1, engineAnm2LoadgraphicsFlags: [0, 1, 0],
    engineAnm2LayerCount: 1, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
    engineAnm2LayerNames: ["*s"],
  }),
  // Typed path ON but EMPTY layer vector: the v8 entry fence (entered) closes
  // BEFORE the leaf -> cache + assign still fire, loadimage does NOT.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2FilenameReady: 1, engineAnm2AnimReady: 1,
    engineAnm2LoadgraphicsFlagReady: 1,
    engineAnm2LayerCount: 0, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
  }),
  // Fallback: anim_ready = 0 (one voucher missing) -> coarse counter STAYS,
  // typed events stay 0 (byte-for-byte pre-v98).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0,
    engineAnm2FilenameReady: 1, engineAnm2AnimReady: 0,
    engineAnm2LoadgraphicsFlagReady: 1,
    engineAnm2LayerCount: 1, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
  }),
  // Latch low byte SET with ALL vouchers live -> the arm is jumped: nothing
  // fires (typed or coarse).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    engineAnm2BlobReady: 1, engineAnm2LatchReady: 1, engineAnm2Latch: 0x1ff,
    engineAnm2FilenameReady: 1, engineAnm2AnimReady: 1,
    engineAnm2LoadgraphicsFlagReady: 1,
    engineAnm2LayerCount: 1, engineAnm2ExtraCount: 0, engineAnm2Bitflags110Pre: 0,
  }),
  // ---- ABI v95 (record idx 22): engine-player BODY blob (pre-call
  // decision wire — the 82ee40_body laws). The per-entry 173 lane runs
  // in-module only when blob_ready && count fits MAX && entry_173_ready;
  // site A (anim 20) sets engine field_1c = 0x14 so every eligible entry
  // fires the 7abe20 body (the 7abcc0 predicate arm is reachable only for
  // anims {3,0xc,0xd,0xb} — law-covered in the family test drives). ----
  // Lane ON: 2 eligible of 3; 173 lanes WIDE (0x100/0x1ff — the byte gates
  // re-narrow; on the 0x14 arm they do not change the 7abe20 decision).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    enginePlayerBlobReady: 1, enginePlayerCount: 3,
    enginePlayerEligible: [1, 1, 0, 0, 0, 0, 0, 0],
    enginePlayerEntry173Ready: 1,
    enginePlayerEntry173: [0x100, 0x1ff, 0, 0, 0, 0, 0, 0],
  }),
  // Lane ON: zero eligible -> the per-entry decision CLOSES (no body event
  // even though the coarse needs_host(0x14) would fire) — the refinement.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    enginePlayerBlobReady: 1, enginePlayerCount: 2,
    enginePlayerEligible: [0, 0, 0, 0, 0, 0, 0, 0],
    enginePlayerEntry173Ready: 1,
    enginePlayerEntry173: [1, 1, 0, 0, 0, 0, 0, 0],
  }),
  // Lane OFF: entry_173_ready=0 keeps the coarse v36 gate (any eligible &&
  // needs_host(0x14)) — the body event fires for the 1 eligible entry.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    enginePlayerBlobReady: 1, enginePlayerCount: 1,
    enginePlayerEligible: [1, 0, 0, 0, 0, 0, 0, 0],
    enginePlayerEntry173Ready: 0,
    enginePlayerEntry173: [0, 0, 0, 0, 0, 0, 0, 0],
  }),
  // Lane OFF: count over cap (9 > 8) -> full body residual (hosts+floats).
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    enginePlayerBlobReady: 1, enginePlayerCount: 9,
    enginePlayerEligible: [1, 1, 1, 1, 1, 1, 1, 1],
    enginePlayerEntry173Ready: 1,
    enginePlayerEntry173: [0, 0, 0, 0, 0, 0, 0, 0],
  }),
  // Lane OFF: no blob -> full body residual (hosts+floats) — the v34 arm.
  completeState({
    effectCounter68d6c: 1, roomTransitionMode1830c: 2, roomTransitionIndex18900: -7,
    roomTransitionDimension18904: 0xfe, globalRangeByteLength: 8,
    enginePlayerBlobReady: 0, enginePlayerCount: 1,
    enginePlayerEligible: [1, 0, 0, 0, 0, 0, 0, 0],
    enginePlayerEntry173Ready: 0,
    enginePlayerEntry173: [0, 0, 0, 0, 0, 0, 0, 0],
  }),
  completeState({ frameCounter264fc: 0x7fffffff, frameCounter264f8: 29, status22ed4: 0, status22edc: 9, globalRangeByteLength: 8 }),
  completeState({ frameCounter264f8: 29, status22ed4: 2, status22edc: 9, globalRangeByteLength: 8 }),
  completeState({
    globalRangeByteLength: 8,
    fadeCounter26514: 0,
    fadeProgress26518: 0.1,
    shakeCurrent67738: 1,
    shakeTarget6773c: 0,
    shakeStep67740: 0.25,
    timer269e0: 2,
    listCount67730: 0,
  }),
  completeState({
    globalRangeByteLength: 8,
    fadeCounter26514: 3,
    fadeProgress26518: 0.9,
    shakeCurrent67738: 0,
    shakeTarget6773c: 1,
    shakeStep67740: 0.5,
    timer269e0: 0,
    listCount67730: 4,
  }),
  completeState({
    globalRangeByteLength: 8,
    fadeCounter26514: 1,
    fadeProgress26518: 0.99,
    shakeCurrent67738: 0.5,
    shakeTarget6773c: 0.5,
    shakeStep67740: 0.1,
    timer269e0: 1,
    listCount67730: 1,
  }),
  // B12 clear-delay pure shell: enemies force set-to-10
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 3,
    roomAlive12c0: 1,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    resumeRoomClearDelay11ec: 3,
    resumeRoomAlive12c0: 1,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
  }),
  // B12 clear-delay pure shell: no enemies → decrement
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 5,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    resumeRoomClearDelay11ec: 5,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
  }),
  // B12 clear-delay pure shell: boss room type 0x10 subtype 3 → set 20
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 2,
    roomGreedWave723c: 0,
    roomType8: 0x10,
    roomDescSubtype: 3,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 2,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 0x10,
    resumeRoomDescSubtype: 3,
  }),
  // B12 clear residual: nested FrameEffect_6fd7c0 when delay already 0, no enemies, type 0x10 subtype 3
  // (TriggerOutput + nested 6fd7c0 pause → recapture → type-5 doors → ambient)
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 0x10,
    roomDescSubtype: 3,
    roomDescFlags44: 0,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 0x10,
    resumeRoomDescSubtype: 3,
    resumeRoomDescFlags44: 0,
    resumeNestedCounter265c0: 0,
  }),
  /* ABI v72: the SAME site-B reach with the shell captures ready. Site B pushes
     anim 0 and the literal dim -1 (PE 0x008041ee / 0x008041f2), so PE 0x006fdb57
     `test edi,edi` falls through and 0x006fdb5d `js 0x6fdb6c` is taken —
     Level::TryInitializeBlueRoom ALWAYS runs and the drop must be REFUSED,
     whatever the 705ee0 captures say. Both byte polarities are covered. */
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 0x10,
    roomDescSubtype: 3,
    roomDescFlags44: 0,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 0x10,
    resumeRoomDescSubtype: 3,
    resumeRoomDescFlags44: 0,
    resumeNestedCounter265c0: 0,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 3,
    frameEffectShellRoom182d0: 9,
    frameEffectShellRoomByte1: 0,
  }),
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 0x10,
    roomDescSubtype: 3,
    roomDescFlags44: 0,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 0x10,
    resumeRoomDescSubtype: 3,
    resumeRoomDescFlags44: 0,
    resumeNestedCounter265c0: 0,
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 3,
    frameEffectShellRoom182d0: 3,
    frameEffectShellRoomByte1: 0x1ff,
  }),
  // B12 clear residual: ordinary clear path (TriggerOutput + clear path + pure TriggerClear entry + residual + type-5 doors)
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    roomDescFlags44: 0,
    roomDescClearCount4a: 2,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
    resumeRoomDescFlags44: 0,
    resumeRoomDescClearCount4a: 2,
  }),
  // B12 clear residual: type 0x10 subtype 2 skips clear path (TriggerOutput + doors only)
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 0x10,
    roomDescSubtype: 2,
    roomDescFlags44: 0,
    roomDescClearCount4a: 0,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 0x10,
    resumeRoomDescSubtype: 2,
    resumeRoomDescFlags44: 0,
    resumeRoomDescClearCount4a: 0,
  }),
  // B12 clear residual: descriptor bit0 set suppresses TriggerOutput and TriggerClear pure entry
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    roomDescFlags44: 1,
    roomDescClearCount4a: 5,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
    resumeRoomDescFlags44: 1,
    resumeRoomDescClearCount4a: 5,
  }),
  // B12 clear residual: bit3 alone suppresses TriggerClear pure entry; TriggerOutput still fires
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    roomDescFlags44: 8,
    roomDescClearCount4a: 1,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
    resumeRoomDescFlags44: 8,
    resumeRoomDescClearCount4a: 1,
  }),
  // B12 clear residual: ClearCount int16 wrap on pure TriggerClear entry
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    roomDescFlags44: 0,
    roomDescClearCount4a: 32767,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
    resumeRoomDescFlags44: 0,
    resumeRoomDescClearCount4a: 32767,
  }),
  // B12 clear-delay pure shell: Game[0x997a] skip forces set-to-10 with no enemies
  completeState({
    globalRangeByteLength: 8,
    globalClearSkip997a: 1,
    roomClearDelay11ec: 0,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    resumeRoomClearDelay11ec: 0,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
  }),
  // B12 + B14 both active on the same frame-manager path
  completeState({
    globalRangeByteLength: 8,
    roomClearDelay11ec: 4,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    resumeRoomClearDelay11ec: 4,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
    resumeRoomFxCounter70d8: 0,
    resumeRoomFxLimit70dc: 3,
    resumeRoomFxValue70cc: 1,
    resumeRoomFxStep70d4: 0.25,
    resumeRoomFxCounter70f4: 0,
    resumeRoomFxLimit70f8: 0,
    resumeRoomFxValue70e8: 0,
    resumeRoomFxStep70f0: 0,
  }),
  // B0 entry clear of Room+0x7220 before residual prefix host
  completeState({
    globalRangeByteLength: 8,
    roomByte7220: 0xab,
  }),
  // B6 water-lerp countdown decrement when positive
  completeState({
    globalRangeByteLength: 8,
    roomWaterLerpCountdown7298: 3,
    resumeRoomWaterLerpCountdown7298: 3,
  }),
  // B6 countdown stays at zero when non-positive
  completeState({
    globalRangeByteLength: 8,
    roomWaterLerpCountdown7298: 0,
    resumeRoomWaterLerpCountdown7298: 0,
  }),
  // B2 collectible timer: nonnegative countdown (5 → 4)
  completeState({
    globalRangeByteLength: 8,
    roomCollectibleTimer7764: 5,
    resumeRoomCollectibleTimer7764: 5,
  }),
  // B2: zero decrements to -1 (distinct from B6/B17)
  completeState({
    globalRangeByteLength: 8,
    roomCollectibleTimer7764: 0,
    resumeRoomCollectibleTimer7764: 0,
  }),
  // B2: negative unchanged
  completeState({
    globalRangeByteLength: 8,
    roomCollectibleTimer7764: -2,
    resumeRoomCollectibleTimer7764: -2,
  }),
  // B0 + B2 + B6 + B12 together
  completeState({
    globalRangeByteLength: 8,
    roomByte7220: 7,
    roomWaterLerpCountdown7298: 2,
    roomCollectibleTimer7764: 3,
    roomClearDelay11ec: 6,
    roomAlive12c0: 0,
    roomAlive12c4: 0,
    roomGreedWave723c: 0,
    roomType8: 1,
    roomDescSubtype: 0,
    resumeRoomWaterLerpCountdown7298: 2,
    resumeRoomCollectibleTimer7764: 3,
    resumeRoomClearDelay11ec: 6,
    resumeRoomAlive12c0: 0,
    resumeRoomAlive12c4: 0,
    resumeRoomGreedWave723c: 0,
    resumeRoomType8: 1,
    resumeRoomDescSubtype: 0,
  }),
  // ABI v43: B1 once-flag pure OR when outer gate open (age==1) and bit clear
  completeState({
    globalRangeByteLength: 8,
    frameCounter264f8: 0,
    gameFlags1839c: 0,
    ambientRoomActive: 1,
    ambientRoomEntry11f0: 0,
  }),
  // ABI v43: B1 once-flag already set — pure no-op, host residual still when gate open
  completeState({
    globalRangeByteLength: 8,
    frameCounter264f8: 0,
    gameFlags1839c: 0x80000,
    ambientRoomActive: 1,
    ambientRoomEntry11f0: 0,
  }),
  // ABI v43: outer B1 gate closed (age!=1) — once-flag not pure-applied
  completeState({
    globalRangeByteLength: 8,
    frameCounter264f8: 5,
    gameFlags1839c: 0,
    ambientRoomActive: 1,
    ambientRoomEntry11f0: 0,
  }),
  // B10 boss snapshot: positive sum
  completeState({
    globalRangeByteLength: 8,
    roomBossCount12c8: 2,
    roomBossCount12cc: 3,
    roomBossSnapshot7224: 99,
    resumeRoomBossCount12c8: 2,
    resumeRoomBossCount12cc: 3,
  }),
  // B10 boss snapshot: zero/negative sum clamps to 0
  completeState({
    globalRangeByteLength: 8,
    roomBossCount12c8: -4,
    roomBossCount12cc: 1,
    roomBossSnapshot7224: 7,
    resumeRoomBossCount12c8: -4,
    resumeRoomBossCount12cc: 1,
  }),
  // B17 Room+0x722c countdown when positive
  completeState({
    globalRangeByteLength: 8,
    roomTimer722c: 4,
    resumeRoomTimer722c: 4,
  }),
  // B17 countdown stays at zero when non-positive
  completeState({
    globalRangeByteLength: 8,
    roomTimer722c: 0,
    resumeRoomTimer722c: 0,
  }),
  // B15 rain timer +0x7214 pure countdown
  completeState({
    globalRangeByteLength: 8,
    roomTimer7214: 3,
    resumeRoomTimer7214: 3,
  }),
  // B18 entity flag pure clear Room+0x7894 (nonzero → 0)
  completeState({
    globalRangeByteLength: 8,
    roomFlag7894: 0xcd,
    resumeRoomFlag7894: 0xcd,
  }),
  // B18 already-zero stays zero
  completeState({
    globalRangeByteLength: 8,
    roomFlag7894: 0,
    resumeRoomFlag7894: 0,
  }),
  // B19 path flag pure clear Room+0x7769 (nonzero → 0)
  completeState({
    globalRangeByteLength: 8,
    roomFlag7769: 0xef,
    resumeRoomFlag7769: 0xef,
  }),
  // B18 + B19 pure flag clears together
  completeState({
    globalRangeByteLength: 8,
    roomFlag7894: 1,
    roomFlag7769: 2,
    resumeRoomFlag7894: 1,
    resumeRoomFlag7769: 2,
  }),
  // Mid-tail Room+0x706c: 1 → -1 (expire to neg1)
  completeState({
    globalRangeByteLength: 8,
    roomTimer706c: 1,
    resumeRoomTimer706c: 1,
  }),
  // Mid-tail Room+0x706c: 2 → 1 (no expire)
  completeState({
    globalRangeByteLength: 8,
    roomTimer706c: 2,
    resumeRoomTimer706c: 2,
  }),
  // Mid-tail Room+0x7230 pure countdown
  completeState({
    globalRangeByteLength: 8,
    roomTimer7230: 5,
    resumeRoomTimer7230: 5,
  }),
  // B10 + B14 + B15 + B17 + 706c + 7230 together
  completeState({
    globalRangeByteLength: 8,
    roomBossCount12c8: 1,
    roomBossCount12cc: 0,
    roomBossSnapshot7224: 0,
    roomTimer722c: 2,
    roomTimer7214: 1,
    roomTimer706c: 1,
    roomTimer7230: 10,
    resumeRoomBossCount12c8: 1,
    resumeRoomBossCount12cc: 0,
    resumeRoomTimer722c: 2,
    resumeRoomTimer7214: 1,
    resumeRoomTimer706c: 1,
    resumeRoomTimer7230: 10,
    resumeRoomFxCounter70d8: 0,
    resumeRoomFxLimit70dc: 1,
    resumeRoomFxValue70cc: 0.5,
    resumeRoomFxStep70d4: 0.25,
    resumeRoomFxCounter70f4: 0,
    resumeRoomFxLimit70f8: 0,
    resumeRoomFxValue70e8: 0,
    resumeRoomFxStep70f0: 0,
  }),
  // B16 water/lava: challenge on, water step + lava decay
  completeState({
    globalRangeByteLength: 8,
    roomType8: 1,
    roomWaterAmount7240: 0.5,
    roomLavaIntensity7740: 1,
    challenge0x123: 1,
    resumeRoomType8: 1,
    resumeRoomWaterAmount7240: 0.5,
    resumeRoomLavaIntensity7740: 1,
  }),
  // B16 water clamp to 1.0 when challenge and water near ceiling
  completeState({
    globalRangeByteLength: 8,
    roomType8: 2,
    roomWaterAmount7240: 0.95,
    roomLavaIntensity7740: 0,
    challenge0x123: 1,
    resumeRoomType8: 2,
    resumeRoomWaterAmount7240: 0.95,
    resumeRoomLavaIntensity7740: 0,
  }),
  // B16: room type 0x10 skips water step; lava still decays when both positive
  completeState({
    globalRangeByteLength: 8,
    roomType8: 0x10,
    roomWaterAmount7240: 0.4,
    roomLavaIntensity7740: 0.5,
    challenge0x123: 1,
    resumeRoomType8: 0x10,
    resumeRoomWaterAmount7240: 0.4,
    resumeRoomLavaIntensity7740: 0.5,
  }),
  // B16: no challenge → no water step
  completeState({
    globalRangeByteLength: 8,
    roomType8: 1,
    roomWaterAmount7240: 0.2,
    roomLavaIntensity7740: 0.01,
    challenge0x123: 0,
    resumeRoomType8: 1,
    resumeRoomWaterAmount7240: 0.2,
    resumeRoomLavaIntensity7740: 0.01,
  }),
  // B16 pure |0x100 band: post-add water in (DAT_00baa3d8, DAT_00baa3e8) ≈ (0.89, 0.91)
  completeState({
    globalRangeByteLength: 8,
    roomType8: 1,
    roomWaterAmount7240: 0.8,
    roomLavaIntensity7740: 0,
    roomDescFlags44: 0,
    challenge0x123: 1,
    resumeRoomType8: 1,
    resumeRoomWaterAmount7240: 0.8,
    resumeRoomLavaIntensity7740: 0,
    resumeHeadRoomDescFlags44: 0,
  }),
  // B16 pure |0x100 band preserves existing low bits
  completeState({
    globalRangeByteLength: 8,
    roomType8: 1,
    roomWaterAmount7240: 0.8,
    roomLavaIntensity7740: 0,
    roomDescFlags44: 0x21,
    challenge0x123: 1,
    resumeRoomType8: 1,
    resumeRoomWaterAmount7240: 0.8,
    resumeRoomLavaIntensity7740: 0,
    resumeHeadRoomDescFlags44: 0x21,
  }),
  // B16 band miss: post-add 0.6 not in (0.89, 0.91)
  completeState({
    globalRangeByteLength: 8,
    roomType8: 1,
    roomWaterAmount7240: 0.5,
    roomLavaIntensity7740: 0,
    roomDescFlags44: 0,
    challenge0x123: 1,
    resumeRoomType8: 1,
    resumeRoomWaterAmount7240: 0.5,
    resumeRoomLavaIntensity7740: 0,
    resumeHeadRoomDescFlags44: 0,
  }),
  /* ABI v64 FX-lerp lane corpus: gate open, distinct step/goal vectors. */
  completeState({
    fxLerpGate676b4: 1,
    fxCur676b8: 6, fxCur676bc: -2, fxCur676c0: 0.5, fxCur676c4: 1e-6, fxCur676c8: 100, fxCur676cc: -0.25,
    fxStep676d0: 4, fxStep676d4: 0.5, fxStep676d8: 3, fxStep676dc: 1e-7, fxStep676e0: 25, fxStep676e4: 0.125,
    fxGoal676e8: 2, fxGoal676ec: 1, fxGoal676f0: -1.5, fxGoal676f4: 0, fxGoal676f8: 10, fxGoal676fc: -0.25,
  }),
  /* Gate open, cur == step everywhere -> approach runs, then gate clears. */
  completeState({
    fxLerpGate676b4: 1,
    fxCur676b8: 3, fxCur676bc: 3, fxCur676c0: 3, fxCur676c4: 3, fxCur676c8: 3, fxCur676cc: 3,
    fxStep676d0: 3, fxStep676d4: 3, fxStep676d8: 3, fxStep676dc: 3, fxStep676e0: 3, fxStep676e4: 3,
    fxGoal676e8: 3, fxGoal676ec: 3, fxGoal676f0: 3, fxGoal676f4: 3, fxGoal676f8: 3, fxGoal676fc: 3,
  }),
  /* Gate open with one ordered-unequal pair -> gate must stay set. */
  completeState({
    fxLerpGate676b4: 1,
    fxCur676b8: 3, fxCur676bc: 9, fxCur676c0: 3, fxCur676c4: 3, fxCur676c8: 3, fxCur676cc: 3,
    fxStep676d0: 3, fxStep676d4: 3, fxStep676d8: 3, fxStep676dc: 3, fxStep676e0: 3, fxStep676e4: 3,
    fxGoal676e8: 3, fxGoal676ec: 9, fxGoal676f0: 3, fxGoal676f4: 3, fxGoal676f8: 3, fxGoal676fc: 9,
  }),
  /* Wide gate byte: 0x101 must narrow to 1 (gate open) on both sides. */
  completeState({
    fxLerpGate676b4: 0x101,
    fxCur676b8: 6, fxCur676bc: 6, fxCur676c0: 6, fxCur676c4: 6, fxCur676c8: 6, fxCur676cc: 6,
    fxStep676d0: 4, fxStep676d4: 4, fxStep676d8: 4, fxStep676dc: 4, fxStep676e0: 4, fxStep676e4: 4,
    fxGoal676e8: 2, fxGoal676ec: 2, fxGoal676f0: 2, fxGoal676f4: 2, fxGoal676f8: 2, fxGoal676fc: 2,
  }),
];
for (let mode = 1; mode <= 11; mode += 1) {
  corpus.push(completeState({ shortTimer: 1, positionResetTimer: 1, positionXBits: mode, positionYBits: mode, secondaryTimer: 1, decayValue: 0.5, transitionProgress: 0.95, transitionMode: mode }));
}

/* ABI v52 fixed genrand cases. mode26584 == 0x2c forces the H5 gate open before
   any dim/force/cadence logic; roomClearDelay11ec 5 + roomType8 1 routes the
   prefix resume onto RESUME_AFTER_ROOM_UPDATE_CLEAR where the wire lives. The
   initial frame 30 reaches the ambient step as 31, so entry 31 gives age 0
   (5 loops) and entry 24 gives age 7 (1 loop). Deterministic filler is a Weyl
   sequence, NOT the shared LCG, so the randomized tail stays byte-identical. */
function genrandFilledState() {
  return Uint32Array.from(
    { length: GENRAND_STATE_WORDS },
    (_, i) => Math.imul(i + 1, 2654435761) >>> 0,
  );
}
const genrandFixedBase = {
  globalRangeByteLength: 8,
  mode26584: 0x2c,
  frameCounter264f8: 30,
  roomClearDelay11ec: 5,
  roomType8: 1,
  h5BodyBlobReady: 1,
  ambientRoomActive: 1,
  ambientRoomEntry11f0: 31,
  ambientRoomF14: 0,
  ambientRoomF18: 0,
  ambientRoomF1c: 0,
  ambientRoomF20: 0,
};
corpus.push(
  /* Cold BSS: mt[] all-zero, mti 0x271 — PE seeds 5489 and reloads, so the
     pure stream is the canonical default-seeded MT19937. */
  completeState({
    ...genrandFixedBase,
    genrandMtReady: 1,
    genrandIndexIn: 0x271,
    genrandModeFlag: 0,
    genrandState: new Uint32Array(GENRAND_STATE_WORDS),
  }),
  /* Emit-only window: filled state, index 100, 1 loop (7 draws, no reload). */
  completeState({
    ...genrandFixedBase,
    ambientRoomEntry11f0: 24,
    genrandMtReady: 1,
    genrandIndexIn: 100,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
  }),
  /* Twist crossing: filled state, index 620, 5 loops (35 draws, one reload of
     real words — the whole 2496 B must come back identical on both sides). */
  completeState({
    ...genrandFixedBase,
    genrandMtReady: 1,
    genrandIndexIn: 620,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
  }),
  /* Strict jl 624: index 624 reloads WITHOUT the 625 seed path. */
  completeState({
    ...genrandFixedBase,
    ambientRoomEntry11f0: 24,
    genrandMtReady: 1,
    genrandIndexIn: 624,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
  }),
  /* useCrtRand low byte set: draws stay host and mt[] must not advance. */
  completeState({
    ...genrandFixedBase,
    genrandMtReady: 1,
    genrandIndexIn: 10,
    genrandModeFlag: 0x33,
    genrandState: genrandFilledState(),
  }),
  /* LOW-BYTE test: only high bits set must read as CLEAR and go pure. */
  completeState({
    ...genrandFixedBase,
    ambientRoomEntry11f0: 24,
    genrandMtReady: 1,
    genrandIndexIn: 0x271,
    genrandModeFlag: 0x3300,
    genrandState: new Uint32Array(GENRAND_STATE_WORDS),
  }),
  /* Not ready: pre-v52 host stream (7 per loop) even though a state array was
     supplied. */
  completeState({
    ...genrandFixedBase,
    genrandMtReady: 0,
    genrandIndexIn: 0x271,
    genrandModeFlag: 0,
    genrandState: genrandFilledState(),
  }),
);

/* ABI v53 fixed F4 recaptured-gate cases (same head-reaching base shape).
   (a) is the retired divergence itself: Pass A runs but inserts nothing into
   an empty list, so the PE's post-Pass-A count is 0 and Pass B never runs —
   the old conservative gate emitted it. */
const pass4257b0FixedBase = {
  globalRangeByteLength: 8,
  frameCounter264f8: 30,
  roomClearDelay11ec: 5,
  roomType8: 1,
};
corpus.push(
  completeState({
    ...pass4257b0FixedBase,
    frameOpaque4257b0IdCount: 3,
    frameOpaque4257b0ListCount: 0,
    resume4257b0PostPassAListCount: 0,
  }),
  /* Pass A inserted records: recaptured count nonzero, Pass B runs. */
  completeState({
    ...pass4257b0FixedBase,
    frameOpaque4257b0IdCount: 3,
    frameOpaque4257b0ListCount: 0,
    resume4257b0PostPassAListCount: 4,
  }),
  /* Pure no-op Pass A (id_count 0): no continuation, no recapture — the
     pre-captured count gates Pass B directly. */
  completeState({
    ...pass4257b0FixedBase,
    frameOpaque4257b0IdCount: 0,
    frameOpaque4257b0ListCount: 5,
  }),
  /* Pure no-op Pass A over an empty list: neither pass runs. */
  completeState({
    ...pass4257b0FixedBase,
    frameOpaque4257b0IdCount: 0,
    frameOpaque4257b0ListCount: 0,
  }),
);

/* ---- ABI v71: deterministic FUN_004257b0 blob rows -----------------------
 *
 * The randomized tail reaches every arm, but these rows pin each one by name
 * so a corpus reshuffle cannot silently drop it. `foBlob` fills the whole
 * pack with zeros and applies the overrides; every base pointer is chosen so
 * the derived counts are exact.
 */
function foBlob(overrides = {}) {
  const out = {
    frameOpaque4257b0BlobReady: 1,
    frameOpaque4257b0ListBegin: 0x00040000,
    frameOpaque4257b0ListEnd: 0x00040000,
    frameOpaque4257b0ListCap: 0x00040000,
    frameOpaque4257b0PostListBegin: 0x00040000,
    frameOpaque4257b0PostListEnd: 0x00040000,
    frameOpaque4257b0IdvecBegin: 0x00020000,
    frameOpaque4257b0IdvecEnd: 0x00020000,
    frameOpaque4257b0CtrBegin: 0x00030000,
    frameOpaque4257b0CtrEnd: 0x00030000,
    frameOpaque4257b0InitialByte13: 0,
  };
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_PLAYERS; i += 1) {
    for (const stem of ["PPtr", "PId1618", "P161c", "QPtr", "Q161c",
                        "QId1618", "QqPtr", "Qq161c", "PChar13c0"]) {
      out[`frameOpaque4257b0${stem}${i}`] = 0;
    }
  }
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_ELEMS; i += 1) {
    for (const stem of ["ElemId", "ElemSubPtr", "ElemSubLo", "ElemSubHi"]) {
      out[`frameOpaque4257b0${stem}${i}`] = 0;
    }
  }
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_LIST; i += 1) {
    for (const stem of ["ListLo", "ListHi", "ListSlot8"]) {
      out[`frameOpaque4257b0${stem}${i}`] = 0;
    }
  }
  return { ...out, ...overrides };
}
const FO_BASE = 0x00040000;
corpus.push(
  /* (a) idCount == 0 (the 0x004257ee je): NO recapture, Pass B runs on the
     PRE pair over a 2-element list with an EMPTY container, so each entry's
     own dword +0 is the id (PE 0x00425943). */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      /* counted(p) false: q != 0, q161c != -1, q161c < p161c, q != p. */
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0QPtr0: 0x00200000,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0Q161c0: 0,
      frameOpaque4257b0PId16180: 3,
      frameOpaque4257b0PChar13c00: 2,
      frameOpaque4257b0ListEnd: FO_BASE + 2 * 0x68,
      frameOpaque4257b0ListCap: FO_BASE + 4 * 0x68,
      frameOpaque4257b0PostListEnd: FO_BASE + 2 * 0x68,
      frameOpaque4257b0ListLo0: 3,
      frameOpaque4257b0ListHi0: 7,
      frameOpaque4257b0ListLo1: 4,
      frameOpaque4257b0ListHi1: 9,
      frameOpaque4257b0InitialByte13: 0x100,
    }),
  }),
  /* (b) idCount != 0 with a NON-EMPTY container: Pass A resolves a pair,
     appends it, and the recaptured pair (MOVED base — the grow relocated the
     buffer) gates Pass B. Capacity 0 forces the 0x00426640 grow. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0QPtr0: 0,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0PId16180: 3,
      frameOpaque4257b0PChar13c00: 2,
      frameOpaque4257b0CtrEnd: 0x00030004,
      frameOpaque4257b0ElemId0: 3,
      frameOpaque4257b0ElemSubPtr0: 0x00400000,
      frameOpaque4257b0ElemSubLo0: 11,
      frameOpaque4257b0ElemSubHi0: 12,
      frameOpaque4257b0ListEnd: FO_BASE,
      frameOpaque4257b0ListCap: FO_BASE,
      frameOpaque4257b0PostListBegin: FO_BASE + 0x8000,
      frameOpaque4257b0PostListEnd: FO_BASE + 0x8000 + 1 * 0x68,
    }),
  }),
  /* (c) NEGATIVE pointer delta. The PE's SIGNED magic division of a delta in
     [-103, -1] is 0, so the list is empty and Pass B never enters; an
     unsigned delta / 0x68 would be 41297762 and blow the cap. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0ListEnd: (FO_BASE - 50) >>> 0,
      frameOpaque4257b0PostListEnd: (FO_BASE - 50) >>> 0,
      frameOpaque4257b0ListCap: FO_BASE + 2 * 0x68,
    }),
  }),
  /* (d) over the player cap: the blob is refused and the v70 host residuals
     run unchanged. */
  completeState({
    ...pass4257b0FixedBase,
    frameOpaque4257b0IdCount: 2,
    frameOpaque4257b0ListCount: 3,
    resume4257b0PostPassAListCount: 3,
    ...foBlob({ frameOpaque4257b0IdvecEnd: 0x00020000 + 12 * 4 }),
  }),
  /* (e) the recaptured count disagrees with the pure Pass A: the slice must
     fall back to the v70 Pass B host edge rather than trust the blob. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0PId16180: 5,
      frameOpaque4257b0PChar13c00: 0xb,
      frameOpaque4257b0ListEnd: FO_BASE,
      frameOpaque4257b0ListCap: FO_BASE + 4 * 0x68,
      frameOpaque4257b0PostListEnd: FO_BASE + 6 * 0x68,
    }),
  }),
  /* (f) duplicate scan: the pair Pass A resolves is ALREADY in the list, so
     0x0042583e skips the append and the post count is unchanged. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0PId16180: 3,
      frameOpaque4257b0PChar13c00: 4,
      frameOpaque4257b0CtrEnd: 0x00030004,
      frameOpaque4257b0ElemId0: 3,
      frameOpaque4257b0ElemSubPtr0: 0x00400000,
      frameOpaque4257b0ElemSubLo0: 11,
      frameOpaque4257b0ElemSubHi0: 12,
      frameOpaque4257b0ListEnd: FO_BASE + 1 * 0x68,
      frameOpaque4257b0ListCap: FO_BASE + 4 * 0x68,
      frameOpaque4257b0PostListEnd: FO_BASE + 1 * 0x68,
      frameOpaque4257b0ListLo0: 11,
      frameOpaque4257b0ListHi0: 12,
      frameOpaque4257b0ListSlot80: 0x21,
    }),
  }),
  /* (h) idCount == 0 with a post pair reporting an EMPTY list. The PE never
     re-reads it here, so Pass B must walk the TWO elements the PRE pair
     describes; an unconditional recapture would close the 0x00425894 gate. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0QPtr0: 0x00200000,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0Q161c0: 0,
      frameOpaque4257b0PId16180: 3,
      frameOpaque4257b0PChar13c00: 2,
      frameOpaque4257b0ListEnd: FO_BASE + 2 * 0x68,
      frameOpaque4257b0ListCap: FO_BASE + 4 * 0x68,
      frameOpaque4257b0PostListBegin: 0,
      frameOpaque4257b0PostListEnd: 0,
      frameOpaque4257b0ListLo0: 3,
      frameOpaque4257b0ListHi0: 7,
      frameOpaque4257b0ListLo1: 4,
      frameOpaque4257b0ListHi1: 9,
    }),
  }),
  /* (g) the 0x00425812 `(lo & hi) == -1` skip: the resolved pair is
     (-1, -1) because the 0x0090ac70 walk finds nothing, so Pass A considers
     the id and inserts nothing. */
  completeState({
    ...pass4257b0FixedBase,
    ...foBlob({
      frameOpaque4257b0IdvecEnd: 0x00020004,
      frameOpaque4257b0PPtr0: 0x00100000,
      frameOpaque4257b0P161c0: 1,
      frameOpaque4257b0PId16180: 9,
      frameOpaque4257b0PChar13c00: 1,
      frameOpaque4257b0CtrEnd: 0x00030004,
      frameOpaque4257b0ElemId0: 2,
      frameOpaque4257b0ElemSubPtr0: 0x00400000,
      frameOpaque4257b0ElemSubLo0: 1,
      frameOpaque4257b0ElemSubHi0: 2,
      frameOpaque4257b0ListEnd: FO_BASE + 1 * 0x68,
      frameOpaque4257b0ListCap: FO_BASE + 4 * 0x68,
      frameOpaque4257b0PostListEnd: FO_BASE + 1 * 0x68,
      frameOpaque4257b0ListLo0: 6,
      frameOpaque4257b0ListHi0: 6,
    }),
  }),
);

let randomState = 0x6d2b79f5;
function random() {
  randomState ^= randomState << 13;
  randomState ^= randomState >>> 17;
  randomState ^= randomState << 5;
  return (randomState >>> 0) / 0x100000000;
}
function integer(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

/* Build a random well-formed _Tree blob in index space. Index 0 is the shared
   nil sentinel, matching the PE where every leaf points at one _Nil node.
   Occasionally emit a malformed blob (out-of-range child or a cycle) so the
   host fallback path stays covered. */
/* ---- ABI v71: FUN_004257b0 blob corpus ----------------------------------
 *
 * Coverage this generator must reach (asserted at the end of the run):
 * blob absent (legacy host residuals), a count over a cap (same fallback),
 * idCount 0 (NO recapture) and idCount != 0 (recapture), empty and non-empty
 * container, at least one append, at least one 0x00426640 grow, a recaptured
 * pair whose base MOVED (so mixing pre-begin with post-end would diverge), a
 * post pair whose count disagrees with the pure Pass A (host fallback), and a
 * NEGATIVE pointer delta — the case where the PE's SIGNED magic division
 * gives 0 (gate closed) while an unsigned delta / 0x68 gives ~41 million.
 */
const FO_4257B0_STRIDE = 0x68;
function randomFrameOpaque4257b0Case() {
  if (integer(0, 2) === 0) return { frameOpaque4257b0BlobReady: 0 };
  const fields = { frameOpaque4257b0BlobReady: 1 };
  /* Occasionally blow a cap so the fallback stays covered. */
  const players = integer(0, 9) === 0 ? integer(9, 12) : integer(0, 4);
  const elems = integer(0, 9) === 0 ? integer(17, 20) : integer(0, 4);
  const idvecBegin = 0x00020000;
  const ctrBegin = 0x00030000;
  const listBegin = 0x00040000;
  fields.frameOpaque4257b0IdvecBegin = idvecBegin;
  fields.frameOpaque4257b0IdvecEnd = (idvecBegin + players * 4) >>> 0;
  fields.frameOpaque4257b0CtrBegin = ctrBegin;
  fields.frameOpaque4257b0CtrEnd = (ctrBegin + elems * 4) >>> 0;
  const negativeDelta = integer(0, 11) === 0;
  const preCount = negativeDelta ? 0 : (integer(0, 9) === 0 ? integer(17, 19) : integer(0, 4));
  fields.frameOpaque4257b0ListBegin = listBegin;
  fields.frameOpaque4257b0ListEnd = negativeDelta
    /* end < begin: SIGNED law -> 0 elements; unsigned delta/0x68 -> 41297762. */
    ? (listBegin - integer(1, 103)) >>> 0
    : (listBegin + preCount * FO_4257B0_STRIDE) >>> 0;
  /* Capacity sometimes below the post count so the allocator grow is taken. */
  const capSlack = integer(0, 3) === 0 ? 0 : integer(1, 6);
  fields.frameOpaque4257b0ListCap =
    (fields.frameOpaque4257b0ListBegin + (preCount + capSlack) * FO_4257B0_STRIDE) >>> 0;
  fields.frameOpaque4257b0InitialByte13 =
    integer(0, 3) === 0 ? integer(0x100, 0x1ff) : integer(0, 0xff);
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_PLAYERS; i += 1) {
    const pPtr = integer(0, 7) === 0 ? 0 : (0x00100000 + i * 0x2000) >>> 0;
    const qRoll = integer(0, 4);
    fields[`frameOpaque4257b0PPtr${i}`] = pPtr;
    fields[`frameOpaque4257b0QPtr${i}`] =
      qRoll === 0 ? 0 : qRoll === 1 ? pPtr : (0x00200000 + i * 0x2000) >>> 0;
    fields[`frameOpaque4257b0P161c${i}`] = integer(-2, 3);
    fields[`frameOpaque4257b0Q161c${i}`] = integer(-2, 3);
    fields[`frameOpaque4257b0Qq161c${i}`] = integer(-2, 3);
    fields[`frameOpaque4257b0QqPtr${i}`] =
      integer(0, 3) === 0 ? 0 : (0x00300000 + i * 0x2000) >>> 0;
    fields[`frameOpaque4257b0PId1618${i}`] = integer(0, 5);
    fields[`frameOpaque4257b0QId1618${i}`] = integer(0, 5);
    /* Character ids: table hits (0..0x25 minus the holes) and the PROVEN
       absent keys 0xb / 0xc / 0x11 / 0x14 / > 0x25 that drive the stale
       channel, plus wide values that must narrow nowhere (full dword key). */
    const charRoll = integer(0, 5);
    fields[`frameOpaque4257b0PChar13c0${i}`] =
      charRoll === 0 ? 0xb : charRoll === 1 ? 0x14 :
      charRoll === 2 ? integer(0x26, 0x40) : integer(0, 0x25);
  }
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_ELEMS; i += 1) {
    fields[`frameOpaque4257b0ElemId${i}`] = integer(0, 5);
    fields[`frameOpaque4257b0ElemSubPtr${i}`] =
      integer(0, 3) === 0 ? 0 : (0x00400000 + i * 0x40) >>> 0;
    /* 0xffffffff on both halves is the PE 0x00425812 `(lo & hi) == -1` skip. */
    const pairRoll = integer(0, 4);
    fields[`frameOpaque4257b0ElemSubLo${i}`] =
      pairRoll === 0 ? 0xffffffff : integer(0, 4);
    fields[`frameOpaque4257b0ElemSubHi${i}`] =
      pairRoll === 0 ? 0xffffffff : integer(0, 4);
  }
  for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_LIST; i += 1) {
    fields[`frameOpaque4257b0ListLo${i}`] = integer(0, 4);
    fields[`frameOpaque4257b0ListHi${i}`] = integer(0, 4);
    fields[`frameOpaque4257b0ListSlot8${i}`] = integer(0, 0x30);
  }
  /* Probe the oracle for the post-Pass-A count so the recaptured pair can be
     made consistent (and, deliberately, inconsistent) often enough that both
     arms are reached. The differential still compares Wasm against the oracle
     independently — this only shapes the inputs. */
  const probe = frameOpaque4257b0Outcome(fields);
  const post = probe.usable ? probe.purePostCount >>> 0 : 0;
  const moved = integer(0, 1) === 0;
  const postBegin = moved ? (listBegin + 0x8000) >>> 0 : fields.frameOpaque4257b0ListBegin;
  if (probe.usable && ((probe.idCount ?? 0) | 0) === 0 && integer(0, 1) === 0) {
    /* Pass A did NOT run, so the PE never re-reads the pair (0x004257ee je
       0x00425870) and a real host leaves these fields alone. Encoding a
       DIFFERENT count here is what makes an unconditional recapture
       observable — with post == pre the defect is invisible. */
    fields.frameOpaque4257b0PostListBegin = 0;
    fields.frameOpaque4257b0PostListEnd = integer(0, 1) === 0
      ? 0
      : (post + integer(1, 3)) * FO_4257B0_STRIDE;
    return fields;
  }
  const mismatch = integer(0, 6) === 0;
  const postElems = mismatch ? (post + integer(1, 3)) >>> 0 : post;
  fields.frameOpaque4257b0PostListBegin = postBegin;
  fields.frameOpaque4257b0PostListEnd = (postBegin + postElems * FO_4257B0_STRIDE) >>> 0;
  return fields;
}

/* ABI v95 (record idx 16): B8 grid-capture k-blob case. Draws the FULL
   448-cell captured grids (costs int32 / trails int16) with boundary-heavy
   cell values, the cell count, and the ready flag. The count crosses 0
   (gate miss), 1..448 (blob arm) and 449 / 0x100 (over-cap host fallback).
   blob_ready is a FULL-DWORD test in the C++ gate
   (`room_b8_blob_ready != 0`), so WIDE values (0x100) must count as READY. */
function randomRoomB8Case() {
  const cells = [0, 0, 1, 2, 15, 100, 448, 448, 449, 0x100, 0x1ff, 0xffffffff][integer(0, 11)];
  const blobReady = [
    0, 0, 0, 1, 1, 1, 1, 0x100, 0x1ff, 0xffffffff,
  ][integer(0, 9)];
  const cellPool = [
    0, 1, 99, 100, 101, 899, 900, 901, 999, 1000, 1001,
    2900, 2999, 3000, 3998, 3999, 4000, 4999, 0x7fffffff,
    0x80000000, 0xffffffff, 100, 900, 3999,
  ];
  const trailPool = [
    0, 1, 2, 98, 99, 100, 0xffff, 50, 0x8000, 0x7fff,
  ];
  const costs = new Array(ROOM_B8_MAX_CELLS).fill(0);
  const trails = new Array(ROOM_B8_MAX_CELLS).fill(0);
  const n = cells === 0 ? 0 : (cells > ROOM_B8_MAX_CELLS ? ROOM_B8_MAX_CELLS : cells);
  for (let i = 0; i < n; i += 1) {
    costs[i] = cellPool[integer(0, cellPool.length - 1)];
    trails[i] = trailPool[integer(0, trailPool.length - 1)];
  }
  return {
    roomGridCells: cells,
    roomB8BlobReady: blobReady,
    roomB8Costs: costs,
    roomB8Trails: trails,
  };
}

function randomWaterB16Case() {
  /* ABI v95 (record idx 36): water-b16 blob captures at the B16 lava
     sub-block seam. The wire fires ONLY when blob_ready (full dword, WIDE
     0x100/0x1ff count as ready) AND needs823540(water_post, lava_pre).
     Byte lanes are WIDE (high bits must NOT open the low-byte flag gates).
     Water/lava drawn as raw f32 bits around the gates (0, >0, band edges,
     NaN, -0.0). */
  const blobReady = [
    0, 0, 1, 1, 1, 1, 0x100, 0x1ff, 0xffffffff,
  ][integer(0, 8)];
  const b183a0 = [0, 0, 1, 0xff, 0x100, 0x1ff, 0xffffffff][integer(0, 6)];
  const b269e9 = [0, 0, 1, 0xff, 0x100, 0x1ff, 0xffffffff][integer(0, 6)];
  const type0 = [0, 1, 2, 3, 4, 5, 6, 7, 0x1d, 0x100, 0xffffffff][integer(0, 10)];
  const subtype4 = [0, 1, 3, 4, 5, 6, 0x104, 0xffffffff][integer(0, 7)];
  const flags2654c = [0, 1, 0x10000, 0x10001, 0x80000000, 0xffffffff][integer(0, 5)];
  const unlockAcc = [0, 2, 1, 0x100, 0xffffffff][integer(0, 4)];
  const unlockClear = [0, 2, 1, 0x100, 0xffffffff][integer(0, 4)];
  const srcBitsPool = [
    0x00000000, 0x3f800000, 0xbf800000, 0x3f000000, 0x3e99999a,
    0x40000000, 0x7fc00000, 0x80000000, 0x3dcccccd,
  ];
  const src = [];
  for (let i = 0; i < 6; i += 1) src.push(srcBitsPool[integer(0, srcBitsPool.length - 1)]);
  const gridFlags44 = [0, (1 << 5), (1 << 9), (1 << 5) | (1 << 9), 0xffffffff, 0][integer(0, 5)];
  const room1d18 = [0, 0x20, 0x21, 0x10020, 0xffffffff][integer(0, 4)];
  const wc = [0, 2, 3, 4, 10, 0x100, 0xffffffff][integer(0, 6)];
  const h10 = [0, 2, 3, 4, 10, 0x100, 0xffffffff][integer(0, 6)];
  const cellDword54 = [0, 1, 0x64, 0xffffffff, 0x80000000, 0x7fffffff][integer(0, 5)];
  const fxCurBitsPool = [
    0x00000000, 0x3f800000, 0xbf800000, 0x3f000000, 0x40000000,
    0x7fc00000, 0x80000000,
  ];
  const fxCur = [];
  for (let i = 0; i < 6; i += 1) fxCur.push(fxCurBitsPool[integer(0, fxCurBitsPool.length - 1)]);
  const waterBits = [0, 0x3f800000, 0x3f000000, 0x3dcccccd, 0x7fc00000, 0x80000000, 0x40000000][integer(0, 6)];
  const lavaBits = [0, 0x3f800000, 0x3f000000, 0x3e4ccccd, 0x3dcccccd, 0x7fc00000, 0x80000000][integer(0, 6)];
  return {
    waterB16BlobReady: blobReady,
    waterB16GameByte183a0: b183a0,
    waterB16GameByte269e9: b269e9,
    waterB16GameType0: type0,
    waterB16GameSubtype4: subtype4,
    waterB16UnlockAcc: unlockAcc,
    waterB16UnlockClear: unlockClear,
    waterB16Src1b10_0: src[0], waterB16Src1b10_1: src[1],
    waterB16Src1b10_2: src[2], waterB16Src1b10_3: src[3],
    waterB16Src1b10_4: src[4], waterB16Src1b10_5: src[5],
    waterB16GridFlags44: gridFlags44,
    waterB16CellDword54: cellDword54,
    room1d18: room1d18,
    /* The head resume drives the wire: the resume state carries the pre-step
       water/lava the model captures (resumeRoomWaterAmount7240 is post-step
       override; resumeRoomLavaIntensity7740 the pre value). */
    resumeRoomWaterAmount7240: bitsToF32(waterBits),
    resumeRoomLavaIntensity7740: bitsToF32(lavaBits),
    resumeHeadFlags2654c: flags2654c,
    resumeHeadRoomType8: type0 === 0x1d ? 0x1d : (type0 % 8),
    resumeHeadDifficulty269c8: [0, 1, 2, 3, 0x10002][integer(0, 4)],
    resumeHeadGameType0: type0,
    resumeHeadGameSubtype4: subtype4,
    resumeHeadRoomTransitionMode1830c: [0, 1, 2, 0x10001][integer(0, 3)],
    resumeHeadFxCur676b8: bitsToF32(fxCur[0]), resumeHeadFxCur676bc: bitsToF32(fxCur[1]),
    resumeHeadFxCur676c0: bitsToF32(fxCur[2]), resumeHeadFxCur676c4: bitsToF32(fxCur[3]),
    resumeHeadFxCur676c8: bitsToF32(fxCur[4]), resumeHeadFxCur676cc: bitsToF32(fxCur[5]),
  };
}

/* ABI v95 (record idx 22): engine-player BODY blob — per-entry eligible +
   byte-0x173 lanes for the pre-call decision wire. eligible is the
   host-filled u8 lane (entry+0x2c==0 -> 1); 173 lanes are WIDE u32 words
   (the laws re-narrow & 0xff — 0x100 must read CLEAR, 0x1ff SET). blob_ready
   WIDE (0x100/0xffffffff count as ready); count 0..9 covers the empty /
   in-cap / over-cap arms. */
function randomEnginePlayerBodyCase() {
  const blobReady = [0, 0, 1, 1, 1, 1, 0x100, 0xffffffff][integer(0, 7)];
  const count = integer(0, 9);
  const eligible = Array.from({ length: ENGINE_PLAYER_MAX }, (_, i) =>
    i < count ? (integer(0, 4) === 0 ? 0 : 1) : 0);
  const entry173 = Array.from({ length: ENGINE_PLAYER_MAX }, (_, i) =>
    i < count ? [0, 1, 0x100, 0x1ff, 0xffffffff, 0x1000003][integer(0, 5)] : 0);
  const ready173 = blobReady !== 0 && integer(0, 3) !== 0 ? 1 : 0;
  return {
    enginePlayerBlobReady: blobReady,
    enginePlayerCount: count,
    enginePlayerEligible: eligible,
    enginePlayerEntry173Ready: ready173,
    enginePlayerEntry173: entry173,
  };
}

function randomGenrandCase() {
  const ready = integer(0, 3) === 0 ? 0 : 1;
  /* The useCrtRand byte is a LOW-BYTE test: include values whose only set bits
     are above bit 7, which must read as clear. */
  const modeRoll = integer(0, 5);
  const modeFlag = modeRoll === 0 ? integer(1, 0xff) : (modeRoll === 1 ? integer(1, 0xff) * 256 : 0);
  /* Mix emit-range indices with reload (>= 624) and the cold 625 seed path. */
  const idxRoll = integer(0, 5);
  const index = idxRoll === 0 ? 625 : (idxRoll === 1 ? 624 : integer(0, 623));
  const state = new Uint32Array(GENRAND_STATE_WORDS);
  if (integer(0, 5) !== 0) {
    for (let i = 0; i < GENRAND_STATE_WORDS; i += 1) {
      state[i] = ((integer(0, 0xffff) << 16) | integer(0, 0xffff)) >>> 0;
    }
  } /* else leave all-zero to mimic a cold BSS process */
  return {
    genrandMtReady: ready,
    genrandIndexIn: index,
    genrandModeFlag: modeFlag,
    genrandState: state,
  };
}

function randomMenuAuxTreeCase() {
  const ready = integer(0, 3) === 0 ? 0 : 1;
  const realCount = integer(0, 6);
  const nodes = Array.from({ length: MENU_AUX_TREE_MAX_NODES }, () => ({
    left: 0, right: 0, isnil: 1, flag1c: 0, payloadPresent: 0, payloadSize: 0,
  }));
  const ids = [];
  for (let i = 1; i <= realCount; i += 1) ids.push(i);
  const build = (lo, hi) => {
    if (lo >= hi) return 0; /* nil sentinel */
    const mid = integer(lo, hi - 1);
    const id = ids[mid];
    const n = nodes[id];
    n.isnil = 0;
    /* flag1c is a BYTE test at node+0x1c: nonzero low byte suppresses the
       payload free, but a value with only high bits set must NOT — include
       those so a widened full-word test cannot pass the differential. */
    n.flag1c = integer(0, 2) === 0
      ? integer(1, 0xff)
      : (integer(0, 3) === 0 ? integer(1, 0xff) * 256 : 0);
    n.payloadPresent = integer(0, 3) === 0 ? 0 : 1;
    /* Large sizes exercise the 64-bit borrow on the accounting subtract. */
    n.payloadSize = integer(0, 3) === 0 ? integer(0x40000000, 0xfffffff0) : integer(0, 4096);
    n.left = build(lo, mid);
    n.right = build(mid + 1, hi);
    return id;
  };
  let root = build(0, realCount);
  let nodeCount = realCount + 1;
  const malformed = integer(0, 11) === 0;
  if (malformed && realCount > 0) {
    if (integer(0, 1) === 0) nodes[root].left = nodeCount + 3; /* out of range */
    else nodes[root].right = root;                            /* cycle */
  }
  /* ABI v54: sentinel capture for the callsite wrapper. The corpus always
     supplies the addresses when the tree blob is ready; sentinel_ready is 0
     roughly a quarter of the time so the "ready blob but no sentinel -> host
     fallback" gate branch is genuinely covered. Addresses are opaque u32s —
     mostly plausible heap pointers, occasionally tiny/zero to prove the pure
     wrapper treats them as raw values (no masking). */
  const sentinelReady = ready === 0 ? integer(0, 1) : (integer(0, 3) === 0 ? 0 : 1);
  const sentinelAddr =
    integer(0, 7) === 0 ? integer(0, 3) : integer(0x10000, 0xf0000000) * integer(1, 16);
  const menuAddr =
    integer(0, 7) === 0 ? 0 : integer(0x10000, 0xf0000000) * integer(1, 16);
  return {
    menuAuxTreeReady: ready,
    menuAuxTreeRoot: root,
    menuAuxTreeNodeCount: nodeCount,
    /* Start low sometimes so the subtract borrows into the high half. */
    menuAuxAccountingLo: integer(0, 2) === 0 ? integer(0, 512) : (integer(0, 0xffff) * 65537) >>> 0,
    menuAuxAccountingHi: integer(0, 64),
    menuAuxTreeNodes: nodes,
    menuAuxSentinelReady: sentinelReady,
    menuAuxSentinelAddr: sentinelAddr,
    menuAuxMenuAddr: menuAddr,
  };
}
/* ABI v108 (update-v108-record39-removal): targeted-run draw budget.
   Default 5000 (the pre-v108 corpus volume); a wave may cap draws with
   VERIFY_DRAWS=N — the deterministic mid-restock theorem cases below
   keep the record-39 lane guards + the full-capture invariant reachable
   under any budget. */
const VERIFY_DRAWS = Number.parseInt(process.env.VERIFY_DRAWS ?? "5000", 10);
if (!Number.isFinite(VERIFY_DRAWS) || VERIFY_DRAWS < 0) {
  throw new Error("VERIFY_DRAWS must be a non-negative integer");
}
for (let index = 0; index < VERIFY_DRAWS; index += 1) {
  const monotonicCounterLow = (random() * 0x100000000) >>> 0;
  const monotonicCounterHigh = (random() * 0x100000000) >>> 0;
  const scaledCounter = scaleMonotonicCounter(monotonicCounterLow, monotonicCounterHigh);
  const monotonicElapsed = BigInt(integer(0, 6000));
  const monotonicBaseline = BigInt.asUintN(64, scaledCounter - monotonicElapsed);
  /* ABI v84: record-0 StatHUD tail walk-arm vector + entry identity. The
     player list begin/end are drawn COORDINATED so the derived walk count
     (end-begin)>>2 hits 0 (walk-empty -> v83 countdown lane), 1/2/8 (walk
     lane in contract), and 9 (over-cap -> lane OFF). Entry identity per
     RULING 2026-08-11 = pack.ptr, the host-resolved player pointer VALUE
     *(u32*)(begin+4*i) (NOT begin+4i, the element ADDRESS): the slot search
     matches slotPtr[s] == pack.ptr and inserts store pack.ptr, so pack.ptr
     is drawn from the slot-ptr pool {0,0x1234,0x5678} to make the match arm
     reachable; otherPtr draws from a DISJOINT pool plus occasional
     ptr-equal (the predB `other != entry` identity-false arm). All values
     are RAW (no pre-masking); the lane gates decide. */
  const hudStatWalkListBase = 0x1000 + integer(0, 0x400) * 4;
  const hudStatWalkListCount = [0, 0, 0, 1, 2, 8, 9][integer(0, 6)];
  const hudStatWalkSlotPtrPool = [0, 0x1234, 0x5678, 0x9abcdef0];
  const hudStatWalkPtrPool = [0, 0x1234, 0x5678];
  corpus.push(completeState({
    shortTimer: integer(-2, 8),
    positionResetTimer: integer(-2, 8),
    positionXBits: (random() * 0x100000000) >>> 0,
    positionYBits: (random() * 0x100000000) >>> 0,
    secondaryTimer: integer(-2, 8),
    decayValue: Math.fround(random() * 2.5 - 0.5),
    transitionProgress: Math.fround(random() * 1.7 - 0.3),
    transitionRate: Math.fround(random() * 0.4),
    transitionMode: integer(0, 11),
    postUpdateDelay: integer(-2, 4),
    gate1d520: integer(0, 4) === 0 ? 1 : 0,
    oneShot1d63c: integer(0, 255),
    /* ABI v79: record 2 pre byte (Game+0x4aba0); the empty-range arm keeps
       it, the pure arm overwrites it. */
    globalTree4aba0Result: integer(0, 1),
    state24ecc: integer(-2, 4),
    /* ABI v59: 0x22ed0 entry-gate byte + ready. Ready only 1/3 of the time
       so the ready=0 legacy host path stays covered. */
    state24ecc22ed0Ready: integer(0, 2) === 0 ? 1 : 0,
    state24ecc22ed0Flag: integer(0, 255),    value24ed0: integer(-20, 20),
    mode24ed8: integer(-20, 20),
    gate1d654: integer(0, 5) === 0 ? 1 : 0,
    gate1ba78: integer(0, 5) === 0 ? 1 : 0,
    gate1b83c: integer(0, 5) === 0 ? 1 : 0,
    predicate1ba74: integer(0, 1),
    counter265c0: integer(-20, 120),
    resumeGate1b83c: integer(0, 1),
    resumePredicate1ba74: integer(0, 1),
    itemOverlayState: integer(0, 3),
    itemOverlayCounter11d1d0: integer(-2, 300),
    menuState23a74: integer(0, 2),
    genericPromptActiveObject: integer(0, 2),
    genericPromptActiveFlag: integer(0, 1),
    genericPromptSubmittedSelection: integer(0, 2),
    genericPromptPostUpdateFlag: integer(0, 1),
    skipTimedTransitionFlag: integer(0, 1),
    transitionColorRBits: (random() * 0x100000000) >>> 0,
    transitionColorGBits: (random() * 0x100000000) >>> 0,
    transitionColorBBits: (random() * 0x100000000) >>> 0,
    transitionAuxBits: (random() * 0x100000000) >>> 0,
    timedTransitionProgress: Math.fround(random() * 1.5 - 0.25),
    timedTransitionForceFinish: integer(0, 5) === 0 ? 1 : 0,
    status22ed4: integer(-3, 4),
    status22edc: integer(-3, 4),
    timedTransitionCleanupMode: integer(-1, 4),
    effectCounter67788: integer(-2, 100),
    effectCounter68d6c: integer(-2, 5),
    roomTransitionMode1830c: integer(0, 3),
    roomTransitionMarker18318: integer(-5, 8),
    roomTransitionIndex18900: integer(-20, 20),
    roomTransitionDimension18904: integer(0, 255),
    frameCounter264fc: integer(-100, 100),
    frameCounter264f8: integer(-100, 100),
    /* ABI v43: B1 once-flag dword; often clear, sometimes already 0x80000. */
    gameFlags1839c: integer(0, 5) === 0 ? 0x80000 : (integer(0, 0xffff) >>> 0),
    fadeCounter26514: integer(-2, 8),
    fadeProgress26518: Math.fround(random() * 1.5 - 0.25),
    shakeCurrent67738: Math.fround(random() * 2 - 1),
    shakeTarget6773c: Math.fround(random() * 2 - 1),
    shakeStep67740: Math.fround(random() * 0.5),
    timer269e0: integer(-2, 8),
    listCount67730: integer(0, 4),
    resumeFadeCounter26514: integer(-2, 8),
    resumeFadeProgress26518: Math.fround(random() * 1.5 - 0.25),
    resumeShakeCurrent67738: Math.fround(random() * 2 - 1),
    resumeShakeTarget6773c: Math.fround(random() * 2 - 1),
    resumeShakeStep67740: Math.fround(random() * 0.5),
    resumeTimer269e0: integer(-2, 8),
    /* ABI v49 tail list sweep. Mostly small live lists; occasionally a count
       above ISAAC_UPDATE_LIST_MAX_NODES or a negative _Mysize so the
       monolithic fallback branch stays covered on both sides. */
    resumeListCount67730:
      integer(0, 11) === 0 ? integer(33, 40) : (integer(0, 15) === 0 ? -1 : integer(0, 6)),
    updateListBlobReady: integer(0, 2) === 0 ? 0 : 1,
    updateListTimers: integer(0, 7) === 0
      /* Pure-complete arm: no zero cell, so the sweep evicts nothing. */
      ? Array.from({ length: 8 }, () => integer(1, 30))
      : Array.from({ length: 8 }, () => {
          const kind = integer(0, 2);
          if (kind === 0) return 0;
          if (kind === 1) return integer(1, 30);
          return integer(-8, -1);
        }),
    /* ABI v79: record 2 tree blob. Blob mostly on with a small tree; the
       Manager container bounds are nonempty together (begin != end) except
       on the empty-range arm. Trees are built from the sentinel plus a few
       chained nodes whose links always resolve in-table; occasionally the
       blob is over-cap, count 0, or a link is left dangling so the
       monolithic fallback stays covered on both sides. */
    globalTree4aba0BlobReady: integer(0, 3) === 0 ? 0 : 1,
    globalTree4aba0Count: integer(0, 9) === 0 ? 33 : integer(1, 4),
    globalTree4aba0Begin: integer(0, 6),
    globalTree4aba0End: integer(0, 6) === 0 ? integer(0, 6) : integer(1, 8),
    globalTree4aba0Nodes: (() => {
      /* The table draws its OWN count with the key's law (a sibling key
         cannot be referenced); slots >= treeCount are SELF-linked inert
         nodes (f0d 1, f18 1) that no used-node link can reach, so a
         key/table count mismatch still yields a terminating walk on both
         sides (chain links only span [0, treeCount-1] and the sentinel). */
      const treeCount = Math.min(
        GLOBAL_TREE_4ABA0_MAX_NODES,
        Math.max(1, integer(0, 9) === 0 ? 33 : integer(1, 4)),
      );
      /* Chain topology (sentinel + chain nodes) that the verbatim
         0x00414a80 advance provably walks to the sentinel for EVERY f0d mix
         below: node 1's flag forces node 2's (1s-then-0s from the sentinel
         prefix), so the walk can never re-enter a visited node. */
      const sentinelAddr = 0x1000;
      const addrOf = (ni) => 0x1000 + ni * 0x20;
      const nodeA = integer(0, 1);
      return Array.from({ length: GLOBAL_TREE_4ABA0_MAX_NODES }, (_, ni) => {
        const last = treeCount - 1;
        const inTree = ni <= last;
        const isSentinel = ni === 0;
        const f0d = isSentinel ? 1 : (ni === 1 ? nodeA : (ni === 2 ? (nodeA === 1 ? 1 : integer(0, 1)) : 1));
        return {
          addr: addrOf(ni),
          next: !inTree || isSentinel ? sentinelAddr : (ni === last ? sentinelAddr : addrOf(ni + 1)),
          prev: !inTree || isSentinel ? sentinelAddr : addrOf(ni - 1),
          child: !inTree || isSentinel ? sentinelAddr : (ni === last ? sentinelAddr : addrOf(ni + 1)),
          f0d,
          f18: isSentinel ? 1 : integer(0, 1),
        };
      });
    })(),
    /* ABI v50 (a) VA 0x009bea10: exercise pure-complete empty vector, the
       in-cap broadcast, over-cap fallback, and the not-ready default. */
    playerFlag410Ready: integer(0, 2) === 0 ? 0 : 1,
    playerFlag410Count:
      integer(0, 9) === 0 ? integer(ENGINE_PLAYER_MAX + 1, ENGINE_PLAYER_MAX + 4) : integer(0, ENGINE_PLAYER_MAX),
    /* ABI v50 (b) + v85: one group table feeds both the v50 gate and the
       sequential firstVoice walk. Mix empty / skipped / live / over-cap /
       packs-missing / voice-blob polarities / wide pending+loop. */
    ...(() => {
      const groups = Array.from({ length: OPAQUE_0092E300_MAX_GROUPS }, () => ({
        /* Bias toward skipped groups so the closed gate is genuinely reached.
           `enabled` is a BYTE test at group+0x198, so a value with only high bits
           set must read as disabled — include those, otherwise a widened
           full-word test would pass the differential. */
        enabled: integer(0, 3) === 0
          ? integer(1, 0xff)
          : (integer(0, 3) === 0 ? integer(1, 0xff) * 256 : 0),
        entryCount: integer(0, 2) === 0 ? integer(1, 6) : 0,
      }));
      const forceAllNull = integer(0, 5) === 0;
      const voiceBlobReady = forceAllNull ? 1 : (integer(0, 2) === 0 ? 0 : 1);
      const overCap = !forceAllNull && integer(0, 7) === 0;
      let voiceCount = overCap
        ? integer(OPAQUE_0092E300_MAX_VOICES + 1, OPAQUE_0092E300_MAX_VOICES + 4)
        : integer(0, OPAQUE_0092E300_MAX_VOICES);
      if (forceAllNull) {
        groups[0].enabled = 1;
        groups[0].entryCount = 1;
      }
      const firstVoice = [];
      let running = 0;
      for (let i = 0; i < OPAQUE_0092E300_MAX_GROUPS; i += 1) {
        firstVoice.push(running);
        running += groups[i].entryCount >>> 0;
        if (running > OPAQUE_0092E300_MAX_VOICES) running = OPAQUE_0092E300_MAX_VOICES;
      }
      if (forceAllNull) {
        voiceCount = running === 0 ? 1 : running;
      }
      const sampled = voiceCount < 0 ? 0
        : (voiceCount > OPAQUE_0092E300_MAX_VOICES ? OPAQUE_0092E300_MAX_VOICES : voiceCount);
      const voices = Array.from({ length: OPAQUE_0092E300_MAX_VOICES }, (_, i) => {
        if (i >= sampled) {
          return {
            channelNull: 0, pending09: 0, probeFirst: 0, probeSecond: 0,
            channelNullThird: 0, loop08: 0, query44: 0, channelNullFourth: 0,
            voicesReloaded: 0,
          };
        }
        const nullPolarity = forceAllNull ? 1 : integer(0, 1);
        return {
          channelNull: nullPolarity,
          pending09: integer(0, 1) === 0 ? 0x100 : integer(0, 0xff),
          probeFirst: integer(0, 1),
          probeSecond: integer(0, 1),
          channelNullThird: integer(0, 1),
          loop08: integer(0, 1) === 0 ? 0x100 : integer(0, 0xff),
          query44: integer(0, 0xff),
          channelNullFourth: integer(0, 1),
          voicesReloaded: integer(1, 8),
        };
      });
      return {
        opaque0092e300Ready: forceAllNull ? 1 : (integer(0, 2) === 0 ? 0 : 1),
        opaque0092e300GroupCount: forceAllNull
          ? integer(1, OPAQUE_0092E300_MAX_GROUPS)
          : (integer(0, 9) === 0
            ? integer(OPAQUE_0092E300_MAX_GROUPS + 1, OPAQUE_0092E300_MAX_GROUPS + 3)
            : integer(0, OPAQUE_0092E300_MAX_GROUPS)),
        opaque0092e300PacksReady: forceAllNull ? 1 : (integer(0, 3) === 0 ? 0 : 1),
        opaque0092e300Groups: groups,
        opaque0092e300VoiceBlobReady: voiceBlobReady,
        opaque0092e300VoiceCount: voiceCount,
        opaque0092e300FirstVoice: firstVoice,
        opaque0092e300Voices: voices,
      };
    })(),
    /* ABI v86: 0x0092f1c0 HUD-v5 try_pure blob. Bias some cases to
       ready=1 so the drop (mode==0 / mode>4) actually fires. Modes
       1..4 stay host. Counter signed so wrap is visible. */
    opaque0092f1c0Ready: integer(0, 2) === 0 ? 0 : 1,
    opaque0092f1c0Mode: integer(0, 7) === 0
      ? (integer(0, 1) === 0 ? 0 : integer(5, 0xffffffff))
      : integer(0, 6),
    opaque0092f1c0Counter: integer(-4, 12),
    /* ABI v87: 0x008318a0 HUD-v5 try_pure blob. Bias ready=1 so the
       drop (mode==0 / mode>4) actually fires. Modes 1..4 stay host.
       Mode UNMASKED (0x100 / 0xffffffff reach the export). */
    opaque008318a0Ready: integer(0, 2) === 0 ? 0 : 1,
    opaque008318a0Mode: integer(0, 7) === 0
      ? (integer(0, 1) === 0 ? 0 : integer(5, 0xffffffff))
      : integer(0, 6),
    /* ABI v51 (b) VA 0x00857450 gate: cover both signs so the signed `% 2`
       fixup is exercised (negative odd must NOT early-out). */
    opaque857450Ready: integer(0, 2) === 0 ? 0 : 1,
    opaque857450Manager4abbc: integer(-9, 9),
    /* ABI v56: rank-display body captures. When the gate is open and ready=1
       the fold runs on the Wasm side too, so every field below must reach the
       packed struct through normalizeRuntimeInputsForLayout. sw is biased to
       0/1/other; the byte tests get widened values (0x100 etc) to catch any
       accidental uint8_t narrowing in the C++ export. */
    rankDisplaySwitch: integer(0, 4) === 0 ? integer(-2, 3) : 0,
    rankDisplayByte22d: integer(0, 4) === 0 ? integer(1, 0xff) * 256 : 0,
    rankDisplayDword158: integer(0, 3) === 0 ? integer(0, 2) : integer(0, 8),
    rankDisplayByte168: integer(0, 4) === 0 ? integer(1, 0xff) * 256 : 0,
    rankDisplayDword248: integer(0, 3) === 0 ? 0 : integer(1, 3000),
    rankDisplayByte119: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayPtr44: integer(0, 3) === 0 ? 0 : integer(1, 0xffffffff),
    rankDisplayByte54: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayByte39c: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayByte39d: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayByte3b0: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayDispWord0: integer(0, 3) === 0 ? 0x70736944 : integer(0, 0xffffffff),
    rankDisplayDispWord1: integer(0, 3) === 0 ? 0x5279616c : integer(0, 0xffffffff),
    rankDisplayDispWord2: integer(0, 3) === 0 ? 0x536b6e61 : integer(0, 0xffffffff),
    rankDisplayDispWord3: integer(0, 3) === 0 ? 0x74726174 : integer(0, 0xffffffff),
    rankDisplayDispEos: integer(0, 4) === 0 ? integer(1, 0xff) * 256 : 0,
    rankDisplayIsPlayingAl: integer(0, 3) === 0 ? 1 : 0,
    rankDisplayStUpd: integer(0, 3) === 0 ? 1 : integer(0, 4),
    rankDisplayStAfterLoading: integer(0, 3) === 0 ? 1 : integer(0, 4),
    rankDisplayStAfterIdle: integer(0, 3) === 0 ? 2 : integer(0, 4),
    rankDisplayStAfterDisplay: integer(0, 3) === 0 ? 4 : integer(0, 4),
    /* ABI v57: LuaEngine frame-unref 0x008607a0 flag gate. ready=0 exercises
       the pre-v57 fallback; the flag byte gets bit-1 set/clear plus widened
       high-bit values (0x100/0x102/0x300) to prove no narrowing. */
    luaFrameUnrefReady: integer(0, 3) === 0 ? 0 : 1,
    luaFrameUnrefFlagByte:
      integer(0, 5) === 0 ? 0 :
      integer(0, 5) === 1 ? 2 :
      integer(0, 5) === 2 ? 0x102 :
      integer(0, 5) === 3 ? 0x100 :
      integer(0, 5) === 4 ? 0x300 : 0x4,
    /* ABI v44 PM2 intensity wire: draw the PM inputs so the PM3 residual
       branches (incl. the v60 stop gate) are exercised by the differential.
       Default count=1 blob=0 would force MONOLITHIC and never reach STOP. */
    pmIntensityPlayerCount: integer(0, 5) === 0 ? 0 : 1,
    pmIntensitySfxPlaying: integer(0, 2) === 0 ? 0 : 1,
    pmIntensityBlobReady: integer(0, 3) === 0 ? 0 : 1,
    pmIntensityRaw0: integer(0, 0x200),
    pmIntensityFlags0: integer(0, 2),
    pmIntensityDead0: integer(0, 2) === 0 ? 0 : 1,
    /* ABI v60: SFX stop gate captures (VA 0x0092e230). ready=0 keeps the
       pre-v60 always-host residual; with ready=1 the span (0x1b8-stride
       table bytes) drives MISS when <= 508*0x1b8 and in-range otherwise.
       enabled is a BYTE test (entry[0x198]) so widened high-bit values
       (0x100) must read as DISABLED — include them or a widened full-word
       test would pass the differential. */
    sfxStopReady: integer(0, 3) === 0 ? 0 : 1,
    sfxStopSpan: (() => {
      const roll = integer(0, 9);
      if (roll === 0) return 0;
      if (roll === 1) return -1;
      if (roll === 2) return integer(1, 508 * 0x1b8 - 1);
      if (roll === 3) return 509 * 0x1b8 + integer(0, 0x1b8);
      return integer(512, 640) * 0x1b8 + integer(0, 0x1b8);
    })(),
    sfxStopVoices190: integer(0, 5) === 0 ? 0 : integer(1, 8),
    sfxStopEnabled198:
      integer(0, 5) === 0 ? 0 :
      integer(0, 5) === 1 ? 0x100 :
      integer(0, 5) === 2 ? 1 :
      integer(0, 5) === 3 ? 0x7f : 0xff,
    /* ABI v95: record idx 47 STOP fold — per-voice capture blob. fold_ready
       is mostly 1 so the in-module fold runs (the v95 empty+playing split
       routes to the STOP lane); the voice packs randomize the channel walk
       (null / live), the +0x29 pending byte (incl. WIDE 0x100 — low-byte
       test), the two device vtbl[0x38] probe results (captured), the
       RELOADED-channel gate (0x92e2d6 je) and the per-iteration
       [entry+0x190] re-read. voiceCount 33 keeps the over-cap fallback
       covered. */
    sfxStopFoldReady: integer(0, 3) === 0 ? 0 : 1,
    sfxStopVoiceCount: (() => {
      const n = integer(0, 6);
      if (n === 0) return 33;
      if (n === 1) return 0;
      return integer(1, 8);
    })(),
    sfxStopVoices: (() => {
      const count = integer(1, 8);
      return Array.from({ length: count }, () => ({
        channelNull: integer(0, 2) === 0 ? 0 : 1,
        pending09:
          integer(0, 4) === 0 ? 0 :
          integer(0, 5) === 1 ? 0x100 :
          integer(0, 0xff),
        probeFirst: integer(0, 2) === 0 ? 0 : 1,
        probeSecond: integer(0, 2) === 0 ? 0 : 1,
        channelNullReload: integer(0, 2) === 0 ? 0 : 1,
        voicesReloaded: integer(1, 8),
      }));
    })(),
    /* ABI v51 (a) VA 0x0041d030 tree blob. */
    ...randomMenuAuxTreeCase(),
    /* ABI v95 (record idx 16): B8 grid-capture k-blob (costs/trails/cells/
       ready). The random state frameCounter264f8 above is drawn -100..100 so
       the %3 gate opens on roughly a third of rows. */
    ...randomRoomB8Case(),
    /* ABI v95 (record idx 36): water-b16 blob captures (823540 chain). The
       wire fires only when blob_ready && needs823540(water_post, lava_pre)
       — the drawn water/lava + type gates select the arms. */
    ...randomWaterB16Case(),
    /* ABI v95 (record idx 22): engine-player BODY blob — eligible + 0x173
       per-entry lanes for the pre-call decision wire (reaches the engine
       prefix on shell rows; blob absent keeps the full residual). */
    ...randomEnginePlayerBodyCase(),
    /* ABI v47 H5 body blob — required before the genrand wire is reachable. */
    h5BodyBlobReady: integer(0, 2) === 0 ? 0 : 1,
    ambientRoomF14: Math.fround(random() * 200 - 100),
    ambientRoomF18: Math.fround(random() * 200 - 100),
    ambientRoomF1c: Math.fround(random() * 200 - 100),
    ambientRoomF20: Math.fround(random() * 200 - 100),
    /* ABI v52 Isaac::genrand_int32. Cover: not-ready (host), ready+clear byte
       (pure), ready+CRT byte set (host, and mt[] must NOT advance), and an
       index that forces a twist (>= 624) as well as the cold 625 seed path. */
    ...randomGenrandCase(),
    /* ABI v53 F4: randomized id/list/post counts. post=0 with id!=0 is the
       retired divergence (Pass A ran, inserted nothing, PE skips Pass B). */
    frameOpaque4257b0IdCount: integer(0, 3) === 0 ? 0 : integer(1, 5),
    frameOpaque4257b0ListCount: integer(0, 2) === 0 ? 0 : integer(1, 6),
    resume4257b0PostPassAListCount: integer(0, 2) === 0 ? 0 : integer(0, 6),
    /* ABI v71 FUN_004257b0 blob (blobReady 0 keeps the legacy arms above). */
    ...randomFrameOpaque4257b0Case(),
    resumeRoomFxCounter70d8: integer(-2, 8),
    resumeRoomFxLimit70dc: integer(0, 8),
    resumeRoomFxValue70cc: Math.fround(random() * 2 - 1),
    resumeRoomFxStep70d4: Math.fround(random() * 0.5),
    resumeRoomFxCounter70f4: integer(-2, 8),
    resumeRoomFxLimit70f8: integer(0, 8),
    resumeRoomFxValue70e8: Math.fround(random() * 2 - 1),
    resumeRoomFxStep70f0: Math.fround(random() * 0.5),
    resumeRoomClearDelay11ec: integer(-2, 20),
    resumeRoomAlive12c0: integer(-2, 8),
    resumeRoomAlive12c4: integer(-2, 8),
    resumeRoomGreedWave723c: integer(-2, 8),
    resumeRoomType8: integer(0, 0x12),
    resumeRoomDescSubtype: integer(0, 5),
    roomDescFlags44: integer(0, 15),
    roomDescClearCount4a: integer(-4, 8),
    resumeRoomDescFlags44: integer(0, 15),
    resumeRoomDescClearCount4a: integer(-4, 8),
    resumeNestedCounter265c0: integer(-2, 8),
    roomByte7220: integer(0, 255),
    roomFlag7894: integer(0, 255),
    roomFlag7769: integer(0, 255),
    resumeRoomFlag7894: integer(0, 255),
    resumeRoomFlag7769: integer(0, 255),
    roomWaterLerpCountdown7298: integer(-2, 8),
    resumeRoomWaterLerpCountdown7298: integer(-2, 8),
    roomBossCount12c8: integer(-4, 8),
    roomBossCount12cc: integer(-4, 8),
    roomBossSnapshot7224: integer(-2, 8),
    roomTimer722c: integer(-2, 8),
    roomCollectibleTimer7764: integer(-2, 8),
    roomTimer7214: integer(-2, 8),
    roomTimer706c: integer(-2, 8),
    roomTimer7230: integer(-2, 12),
    roomWaterAmount7240: Math.fround(random()),
    roomLavaIntensity7740: Math.fround(random()),
    frameOpaque4212c0Mode: integer(0, 3),
    frameOpaque4212c0Secondary: integer(0, 4),
    frameOpaque4212c0Field3c: integer(0, 4),
    frameOpaque4212c0Flag4c: integer(0, 2),
    frameOpaque4212c0Flag111: integer(0, 2),
    frameOpaque4212c0SlotChar: integer(0, 2),
    /* ABI v90: 4212c0 flag_111 pair blob. pairReady biased nonzero so the
       pure fold is reachable; field5c (B field4, full-dword test) and
       flag6c (B flag14, low-byte test) cross the wide-value shapes so a
       word-vs-byte or dropped-B-gate mutant diverges. field3c/flag4c are
       the A-side gate inputs drawn above (0..4 / 0..2). */
    frameOpaque4212c0PairReady: integer(0, 3) === 0 ? 0 : 1,
    frameOpaque4212c0Field5c: [0, 1, 0x100, 0x1ff, 0xffffffff][integer(0, 4)],
    frameOpaque4212c0Flag6c: [0, 1, 0x100, 0x1ff, 0xffffffff][integer(0, 4)],
    /* ABI v91: 4212c0 secondary==3 false-probe blob. probeReady biased
       nonzero so the false arm is reachable; add0Field4 drawn with the
       A-side nonzero shape (field4==0 forces host via the family gate —
       the empty-list arm needs field4!=0 AND listCount==0); listCount
       drawn 0-heavy with wide values; matchIndex crosses -1 so the
       bit-result arm is only taken when resolved. */
    frameOpaque4212c0ProbeReady: integer(0, 3) === 0 ? 0 : 1,
    frameOpaque4212c0ProbeResolved: integer(0, 2) === 0 ? 0 : 1,
    frameOpaque4212c0Add0Field4: [0, 1, 0x100, 0x7fffffff][integer(0, 3)],
    frameOpaque4212c0Add0ListCount: [0, 0, 0, 1, 3, 5, 0x40, 0x41, 0x100][integer(0, 8)],
    frameOpaque4212c0Add0MatchIndex: [-1, -1, 0, 1, 2, 3][integer(0, 5)],
    frameOpaque4212c0Add0Bitfield18: [0, 1, 2, 4, 0x100, 0xffffffff][integer(0, 5)],
    /* ABI v95 (R4 equal-flags capture): per-entry equal-flag bytes of the
       40add0 walk (host strcmp vs 'End' 0xb1c00c). ready biased nonzero;
       flags carry 0..2 set entries so first-vs-last match semantics and
       bit-set/clear both cross; matchIndex stays drawn INDEPENDENT
       (frequently anti-aligned with the flags) so a module that trusts
       the v91 leftover diverges; listCount 0x41/0x100 with ready=1 pin
       the over-cap fallback to the v91 path. */
    frameOpaque4212c0Add0EqualFlagsReady: integer(0, 3) === 0 ? 0 : 1,
    frameOpaque4212c0Add0EqualFlags: (() => {
      const flags = new Array(FRAME_OPAQUE_40ADD0_MAX_ENTRIES).fill(0);
      flags[integer(0, FRAME_OPAQUE_40ADD0_MAX_ENTRIES - 1)] = 1;
      if (integer(0, 2) === 0) flags[integer(0, FRAME_OPAQUE_40ADD0_MAX_ENTRIES - 1)] = 1;
      return flags;
    })(),
    /* ABI v95 (record idx 14, B2): item-pool ready/spawn draws. The wave-18
       merge dropped the generator rows (the B2 lanes exist in the runtime
       layout and the module reads them — measured defect class 6: the
       ready path never seeded -> the B2 branch unexercised in the
       differential). ready biased nonzero; counts 31 x u16; spawn-in rows
       drawn so the ready path seeds the scratch and the oracle runs. */
    b2PoolReady: integer(0, 3) === 0 ? 0 : 1,
    b2PoolGate18304: integer(0, 3),
    b2PoolSeed0: integer(0, 0xffffffff),
    b2PoolSeed1: integer(0, 0xffffffff),
    b2PoolSeed2: integer(0, 0xffffffff),
    b2PoolSeed3: integer(0, 0xffffffff),
    b2PoolCounts: (() => {
      const a = new Array(31).fill(0);
      a[integer(0, 30)] = 1 + integer(0, 6);
      if (integer(0, 2) === 0) a[integer(0, 30)] = 1 + integer(0, 6);
      return a;
    })(),
    b2SpawnCount: integer(0, 5),
    b2SpawnIn: (() => {
      const n = 4;
      const out = [];
      for (let k = 0; k < n; k += 1) {
        out.push({
          x: integer(0, 0xffff), y: integer(0, 0xffff), flag8: integer(0, 1),
          d4: integer(0, 0xffffffff), w44: integer(0, 0xffff), w46: integer(0, 0xffff),
        });
      }
      return out;
    })(),
    frameOpaque98dba0Mode: integer(0, 3),
    frameOpaque98dba0Flag: integer(0, 2),
    frameOpaque98dba0Counter: integer(0, 12),
    frameOpaque98dba0Float170: Math.fround(random()),
    frameOpaque98dba0Float2d0: Math.fround(random()),
    frameOpaque98dba0Bvar2: integer(0, 1),
    frameOpaque98dba0Manager2a35c: Math.fround(random()),
    /* ABI v65: drive the capture UNMASKED so a word-vs-byte read diverges. */
    frameOpaque98dba0Game216e9: [0, 1, 0x100, 0x1ff, 0xffffffff][integer(0, 4)],
    hostFun746560PostReady: integer(0, 2) === 0 ? 0 : 1,
    /* ABI v66: drive the timer-block gate UNMASKED and across the sign boundary
       so an unsigned model diverges. 0 / 0x80000000 / 0xffffffff / -3 all skip;
       1 / 0x1e / 0x7fffffff all run. */
    frameOpaque98dba0TimerReady: integer(0, 3) === 0 ? 0 : 1,
    frameOpaque98dba0Timer264e8: [
      0, 1, 2, 0x1e, 0x7fffffff, 0x80000000, 0xffffffff, -3,
    ][integer(0, 7)],
    /* ABI v70: timer-interior captures. The sample pool is boundary-heavy
       (the cvtpd2ps tie 0xffffff80 and its neighbour, both sign-bit shapes);
       useCrtRand crosses UNMASKED including the 0x100 wide-byte shape; old
       x/y raw f32 bit patterns cover ±0, denormals, extremes, ±Inf and the
       canonical quiet NaN (payloaded NaNs are excluded: Wasm f32 arithmetic
       may legally return any NaN payload, so pinning them would pin an
       engine, not the PE — the canonical pattern is stable on both sides).
       cos/sin are derived by the harness from its OWN theta transcription of
       the drawn sample via Math.cos/Math.sin on the exact (double)theta_f32
       widening, so the pure arm consumes realistic primitive results. */
    ...(() => {
      const sample = [
        0, 1, 0x1000, 0x7fffffff, 0x80000000, 0xbadc0ded, 0xffffff7f,
        0xffffff80, 0xffffffff,
      ][integer(0, 8)];
      /* ABI v76: when the mt arm is active the PE's sample IS the in-module
         draw, so derive the cos/sin captures from the ORACLE draw of the
         captured state (local copy — the corpus row stays pre-state) instead
         of from the ignored pool sample. */
      const mtReady = integer(0, 2) === 0 ? 0 : 1;
      const useCrtRand = [
        0, 0, 0, 0, 1, 0xff, 0x100, 0x80000000, 0xffffff00,
      ][integer(0, 8)];
      const idxRoll = integer(0, 6);
      const mtiIn = idxRoll === 0
        ? 625
        : (idxRoll === 1 ? 624 : (idxRoll === 2 ? integer(-64, -1) : integer(0, 623)));
      const genrandState = new Uint32Array(GENRAND_STATE_WORDS);
      if (integer(0, 5) !== 0) {
        for (let i = 0; i < GENRAND_STATE_WORDS; i += 1) {
          genrandState[i] = ((integer(0, 0xffff) << 16) | integer(0, 0xffff)) >>> 0;
        }
      }
      let effectiveSample = sample;
      if (mtReady !== 0 && (useCrtRand & 0xff) === 0) {
        effectiveSample = roomGenrandNext(Uint32Array.from(genrandState), mtiIn).value >>> 0;
      }
      const theta = bitsToFloat32(harnessTimerThetaBits(effectiveSample));
      const cos = float64ToBitsPair(Math.cos(theta));
      const sin = float64ToBitsPair(Math.sin(theta));
      const oldPool = [
        0x00000000, 0x80000000, 0x3f800000, 0xbf800000, 0x00000001,
        0x80000001, 0x7f7fffff, 0xff7fffff, 0x7f800000, 0xff800000,
        0x7fc00000, float32ToBits(Math.fround(random() * 8 - 4)),
      ];
      return {
        frameOpaque98dba0TimerPureReady: integer(0, 2) === 0 ? 0 : 1,
        frameOpaque98dba0TimerSample: sample,
        frameOpaque98dba0TimerUseCrtRand: useCrtRand,
        frameOpaque98dba0TimerX264ecBits: oldPool[integer(0, 11)],
        frameOpaque98dba0TimerY264f0Bits: oldPool[integer(0, 11)],
        frameOpaque98dba0TimerCosBitsLo: cos.lo,
        frameOpaque98dba0TimerCosBitsHi: cos.hi,
        frameOpaque98dba0TimerSinBitsLo: sin.lo,
        frameOpaque98dba0TimerSinBitsHi: sin.hi,
        /* ABI v76 timer-interior MT wire (the timer's OWN boundary capture —
           distinct from the H5 boundary's genrand fields, which randomGenrandCase
           supplies separately and which the H5 stage loads from the corpus row). */
        frameOpaque98dba0TimerMtReady: mtReady,
        frameOpaque98dba0TimerMtiIn: mtiIn,
        timerGenrandState: genrandState,
      };
    })(),
    resumeRoomBossCount12c8: integer(-4, 8),
    resumeRoomBossCount12cc: integer(-4, 8),
    resumeRoomTimer722c: integer(-2, 8),
    resumeRoomCollectibleTimer7764: integer(-2, 8),
    resumeRoomTimer7214: integer(-2, 8),
    resumeRoomTimer706c: integer(-2, 8),
    resumeRoomTimer7230: integer(-2, 12),
    resumeRoomWaterAmount7240: Math.fround(random()),
    resumeRoomLavaIntensity7740: Math.fround(random()),
    resumeHeadRoomDescFlags44: integer(0, 0x3ff),
    /* ABI v107 (record idx 39 mid-restock): desc pack + owner draws. The
       C3 lesson: without these rows the five midRestock* keys reach the
       module as ZERO (per-key whitelist; measured silent-zero) and the
       v46 pure walk / v95 typed drop are never differentially exercised.
       ready is a FULL-DWORD test (C++ `!= 0`), so WIDE 0x100/0x1ff/
       0xffffffff count as READY — do not pre-mask. ac/ae are int16 words
       re-narrowed in-law: cross 0/positive/0x7fff/0x8000/0xffff(-1)/
       wide; ae==-1 opens the short gate alone. seed58 0-heavy for the
       typed drop + wide nonzero (0x100 must NOT fatal — FULL-DWORD
       compare). resumeHeadRoomType8 biased to 2 (shop) so the outer gate
       opens on a healthy share; ambientRoomEntry11f0 drawn so age>1 is
       reachable (head resume re-reads frame_counter_264f8 from state). */
    resumeHeadRoomType8: (() => {
      const r = integer(0, 5);
      if (r <= 1) return 2;
      if (r === 2) return 0x10;
      return integer(0, 0x12);
    })(),
    ambientRoomEntry11f0: integer(0, 5),
    midRestockOwner0x209: integer(0, 4) === 0 ? 0 : 1,
    midRestockDescReady: [0, 0, 1, 1, 1, 0x100, 0x1ff, 0xffffffff][integer(0, 7)],
    midRestockDescAc: [0, 0, 1, 2, 5, 0x7fff, 0x8000, 0xffff, 0x100, 0x1ff, 0xffffffff][integer(0, 10)],
    midRestockDescAe: [0, 1, 5, 0x7fff, 0x8000, 0xffff, 0x100, 0x1ff, 0xffffffff][integer(0, 8)],
    midRestockDescSeed58: [0, 0, 0, 1, 0x100, 0x1ff, 0xffffffff][integer(0, 6)],
    /* ABI v107 (wave-29 merge REBIND, C1): discriminating draws for the 36
       rebound lanes — every non-zero draw MUST flip a law output on the
       module side (net/walk/general probe arms, 92f1c0 case-1/2 pure tails,
       the A/B 409030-pair advance/rewind typed events, the tcsStats growth
       sim). Values ride UNMASKED: ready is FULL-DWORD, ac-style narrows
       happen in-law, float lanes are raw f32 bits. */
    frameOpaque98dba0956110Ready: integer(0, 5) === 0 ? 0 : 1,
    frameOpaque98dba0956110ManagerMode: [0, 1, 2, 2, 0x102, 0xffffffff][integer(0, 5)],
    frameOpaque98dba0956110GlobalC71690: [0, 1, 0x100, 0xffffffff][integer(0, 3)],
    frameOpaque98dba0956110MpBegin: (() => {
      const b = integer(0, 0x1000);
      return integer(0, 2) === 0 ? b : b - 8;
    })(),
    frameOpaque98dba0956110MpEnd: (() => {
      const e = integer(1, 0x1000);
      return integer(0, 2) === 0 ? e : e + 8;
    })(),
    frameOpaque98dba0956110Arg2: [0xffffffff, 0xffffffff, 5, 0, 0x100][integer(0, 4)],
    frameOpaque98dba0956110NetHostOk: integer(0, 1),
    frameOpaque98dba0956110NetOutByte: [0, 1, 0xff, 0x100, 0x1ff][integer(0, 4)],
    frameOpaque98dba0956110VtableCount: [1, 2, 3, 8, 9][integer(0, 4)],
    frameOpaque98dba0956110VtableResult0: [0, 1, 0x100, 0x1ff][integer(0, 3)],
    frameOpaque98dba0956110VtableResult1: [0, 1, 0xff][integer(0, 2)],
    frameOpaque98dba0956110VtableResult2: [0, 0, 1][integer(0, 2)],
    frameOpaque98dba0956110VtableResult3: integer(0, 1),
    frameOpaque98dba0956110VtableResult4: integer(0, 1),
    frameOpaque98dba0956110VtableResult5: integer(0, 1),
    frameOpaque98dba0956110VtableResult6: integer(0, 1),
    frameOpaque98dba0956110VtableResult7: integer(0, 1),
    frameOpaque98dba0956110GeneralResult: [0, 1, 0xff, 0x100][integer(0, 3)],
    opaque0092f1c0Limit: [2, 100, 1024, 0xffffffff][integer(0, 3)],
    opaque0092f1c0Field14: [0, 1, 0x100, 0x1ff][integer(0, 3)],
    frameOpaque4212c0AbPackReady: integer(0, 3) === 0 ? 0 : 1,
    frameOpaque4212c0AFloat10: float32ToBits(Math.fround(random() * 12 - 1)),
    frameOpaque4212c0BFloat10: float32ToBits(Math.fround(random() * 12 - 1)),
    frameOpaque4212c0ALayer104: [0, 0x3f800000, 0x3fc00000, 0x4039999a, 0xbf800000][integer(0, 4)],
    frameOpaque4212c0BLayer104: [0, 0x3f800000, 0x3fc00000, 0x4039999a, 0xbf800000][integer(0, 4)],
    frameOpaque4212c0AFrameBound: [0, 4, 5, 10, 0x7fffffff][integer(0, 4)],
    frameOpaque4212c0BFrameBound: [0, 4, 5, 10, 0x7fffffff][integer(0, 4)],
    frameOpaque4212c0ALoopFlag: [0, 1, 0x100][integer(0, 2)],
    frameOpaque4212c0BLoopFlag: [0, 1, 0x100][integer(0, 2)],
    /* The A/B 409030 pair gates (state side + runtime side): without these
       draws the flag_111 low-byte gate stays closed and the rebound
       ab-pack lanes never reach the differential (measured C3). */
    frameOpaque4212c0Flag111: [0, 1, 0x100][integer(0, 2)],
    frameOpaque4212c0Field3c: [0, 5, 7, 0x100][integer(0, 3)],
    frameOpaque4212c0Flag4c: [0, 1, 0x100][integer(0, 2)],
    frameOpaque4212c0PairReady: integer(0, 3) === 0 ? 1 : 0,
    frameOpaque4212c0Field5c: [0, 1, 0x100][integer(0, 2)],
    frameOpaque4212c0Flag6c: [0, 1, 0x100][integer(0, 2)],
    /* TriggerClear stats-residual gate lane: count==1 opens the tcsStats
       growth sim (rebound lane family must change a result). */
    roomDescClearCount4a: [0, 1, 2, 0xffff][integer(0, 3)],
    tcsStatsVecReady: integer(0, 3) === 0 ? 0 : 1,
    tcsStatsVecBegin: integer(0, 2) === 0 ? 0 : integer(0x1000, 0x2000),
    tcsStatsVecEnd: integer(2, 0x2000) + 0x2000,
    tcsStatsVecCap: [4, 8, 16, 0x10][integer(0, 3)],
    tcsStatsDesc10_48: [0, 8, 9, 12, 0x100][integer(0, 4)],
    tcsStatsLookupBits: [0x3f800000, 0xc0000000, 0xbf800000, 0, 0x7fc00000][integer(0, 4)],
    tcsStatsGameByte8: [0, 1, 0xff][integer(0, 2)],
    globalRangeByteLength: integer(0, 4) * 4,
    globalMenuGuard4b3ca: integer(0, 1),
    globalMenuEnable2a3a5: integer(0, 1),
    globalClearSkip997a: integer(0, 4) === 0 ? 1 : 0,
    challenge0x123: integer(0, 1),
    monotonicCounterLow,
    monotonicCounterHigh,
    monotonicBaselineLow: Number(monotonicBaseline & 0xffffffffn),
    monotonicBaselineHigh: Number(monotonicBaseline >> 32n),
    resumePromptSubmittedSelection: integer(0, 2),
    resumePromptPostUpdateFlag: integer(0, 1),
    resumeItemOverlayState: integer(0, 3),
    resumeMenuState23a74: integer(0, 2),
    resumeMenuOpenState: integer(0, 2),
    resumeMenuUpdateState: integer(0, 2),
    /* ABI v36 HUD pure-complete inputs: often force host; occasional pure-idle.
       ABI v80: names are the FLAT layout keys (playerHudSlot${i}*) — the
       earlier unprefixed names never reached the module (measured
       harness-neutering class: the whitelist build reads the indexed keys). */
    playerHudOccupiedMask: integer(0, 7) === 0 ? 0 : integer(1, 0xff),
    /* ABI v41: occasional multi-slot blob peel with randomized packs. */
    playerHudBlobReady: integer(0, 4) === 0 ? 1 : 0,
    ...(() => {
      const pack = {};
      for (let i = 0; i < PLAYER_HUD_MAX_SLOTS; i++) {
        pack[`playerHudSlot${i}TwinPtr`] = integer(0, 1) === 0 ? 0 : integer(1, 0xffff);
        pack[`playerHudSlot${i}PlayerType`] = integer(0, 3) === 0 ? 0x10 : integer(0, 20);
        pack[`playerHudSlot${i}Field3bc`] = integer(0, 1);
        pack[`playerHudSlot${i}HeartsSum`] = integer(0, 6);
        pack[`playerHudSlot${i}Flag1519`] = integer(0, 1);
        pack[`playerHudSlot${i}TrampSuppress`] = integer(0, 1);
        pack[`playerHudSlot${i}Active0`] = integer(-1, 5);
        pack[`playerHudSlot${i}Active1`] = integer(-1, 5);
        pack[`playerHudSlot${i}Active2`] = integer(-1, 5);
        pack[`playerHudSlot${i}Active3`] = integer(-1, 5);
        pack[`playerHudSlot${i}Float6b8`] = Math.fround(random());
        pack[`playerHudSlot${i}TailChars`] = integer(0, 0xffffff);
        pack[`playerHudSlot${i}TailPred`] = integer(0, 1);
      }
      return pack;
    })(),
    managerHistoryCount: integer(0, 5) === 0 ? 0 : integer(-2, 4),
    managerStatFlag: integer(0, 5) === 0 ? 0 : integer(0, 1),
    /* ABI v80: HUD history one-shot latch — both arms must reach the
       differential (latch=1 changes hudHistoryResidual -> LoopResidual). */
    hudHistoryLatch5c7c: integer(0, 1),
    /* ABI v81: 0x83b280 loop slot gates — both-flags-clear (pure no-op) and
       any-flag-set (loop residual) arms must both reach the differential. */
    hudHistorySlotFlag0: integer(0, 1),
    hudHistorySlotFlag1: integer(0, 1),
    /* ABI v83: record-0 StatHUD tail countdown lane inputs. ready ∈ {0,1};
       ABI v84: the player list bounds are drawn COORDINATED so the derived
       walk count (end-begin)>>2 hits 0 (walk-empty -> v83 countdown lane),
       1/2/8 (walk lane in contract), and 9 (over-cap -> lane OFF host
       residual) — the old independent draws only produced 0 / ±1. Counts
       are carried RAW (no pre-masking); the lane gates decide. Counters are
       i32 with negatives and INT_MIN/INT_MAX rows to pin the signed
       `v > 0` decrement. */
    hudStatCountdownReady: integer(0, 3) === 0 ? 0 : 1,
    ...(() => {
      return {
        hudStatPlayerListBegin: hudStatWalkListBase,
        hudStatPlayerListEnd: hudStatWalkListBase + hudStatWalkListCount * 4,
      };
    })(),
    hudStatCountdown0: [0, 1, 2, 3, -1, -3, 0x7fffffff, 0x80000000, 0xffffffff][integer(0, 8)],
    hudStatCountdown1: [0, 1, 4, 10, -1, -5, 0x7ffffffe, 0x80000001, 0xfffffffe][integer(0, 8)],
    hudStatCountdown2: integer(-3, 5),
    hudStatCountdown3: integer(-3, 5),
    hudStatCountdown4: integer(-3, 5),
    hudStatCountdown5: integer(-3, 5),
    hudStatCountdown6: integer(-3, 5),
    hudStatCountdown7: integer(-3, 5),
    hudStatCountdown8: integer(-3, 5),
    hudStatCountdown9: integer(-3, 5),
    hudStatCountdown10: integer(-3, 5),
    hudStatCountdown11: integer(-3, 5),
    hudStatCountdown12: integer(-3, 5),
    hudStatCountdown13: integer(-3, 5),
    hudStatCountdown14: integer(-3, 5),
    hudStatCountdown15: integer(-3, 5),
    hudStatCountdown16: integer(-3, 5),
    hudStatCountdown17: integer(-3, 5),
    hudStatCountdown18: integer(-3, 5),
    hudStatCountdown19: [0, 5, 10, -1, -9, 0x7fffffff, 0x80000000, 0xffffffff][integer(0, 7)],
    /* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane inputs. All new keys
       are drawn RAW (no low-byte pre-masking — the lane gates and the PE's
       byte semantics narrow where the PE does). blobReady ∈ {0,1}; ownerByte
       is the FCO(0x1f2) truthiness; container begin/end drawn EQUAL (predA
       gate skipped) and UNEQUAL (predA decides); probe1/3 carry NaN/Inf to
       pin the maxss/minss clamp and the (1-probe3) NaN target; game1adb4
       travels as raw f32 BITS; slot ptrs/states pre-walk; 8 player packs of
       16 fields (ptr entry token first, then the wide per-field values:
       f2c -1 crosses as 0xffffffff, the signed other161c/f161c rows pin the
       predB `!= -1` and `<` tests). */
    hudStatWalkBlobReady: integer(0, 3) === 0 ? 0 : 1,
    hudStatOwnerByte: integer(0, 1),
    ...(() => {
      /* mode 0 -> EMPTY container (begin==end: the predA gate is skipped);
         modes 1/2 -> non-empty (pack predA decides). */
      const base = 0x1a00 + integer(0, 0x10) * 4;
      const mode = integer(0, 3);
      return {
        hudStatContainerBegin: base,
        hudStatContainerEnd: mode === 0 ? base : base + 8,
      };
    })(),
    hudStatWalkProbe1: [0, 0.5, 1, 2, -1, Number.NaN, Number.POSITIVE_INFINITY][integer(0, 6)],
    hudStatWalkProbe2: integer(0, 1),
    hudStatWalkProbe3: [0, 0.5, 1, Number.NaN][integer(0, 3)],
    hudStatGame1adb4: [0, 0x3f800000, 0x40490fdb, 0x7fc00000][integer(0, 3)],
    hudStatSlotPtr0: hudStatWalkSlotPtrPool[integer(0, hudStatWalkSlotPtrPool.length - 1)],
    hudStatSlotPtr1: hudStatWalkSlotPtrPool[integer(0, hudStatWalkSlotPtrPool.length - 1)],
    ...(() => {
      /* ABI v102 (walker freeze-lift lanes @14276..14288, PLAN
         update-v102-abi97-plan §6.2): the 4 walker lanes drawn so the
         k6/k7 walker events CHANGE from the zero baseline (harness
         lesson — new inputs must flip law outputs). playerA drawn from
         the SAME slot-ptr pool as the walked rows (entry==A -> row_arm
         1); playerB from a pool that also contains the entry values
         (entry==B with A!=entry -> row_arm 2); bFrame328 coordinated
         with a frame draw (frame-2 -> signed diff > 1 -> TWEEN vs
         frame+100 -> RESET); probe1_arg WIDE (identity law — the
         `& 0xff` truncation mutant bait). */
      const f = integer(-100, 100);
      return {
        hudStatWalkerPlayerA:
          hudStatWalkSlotPtrPool[integer(0, hudStatWalkSlotPtrPool.length - 1)],
        hudStatWalkerPlayerB:
          [0, 0x1234, 0x5678, 0x9abcdef0, 0x2222, 0x3333][integer(0, 5)],
        hudStatWalkerBFrame328: [f - 2, f + 100, f - 100][integer(0, 2)],
        hudStatWalkProbe1Arg: [0, 0x12345678, 0xffffffff][integer(0, 2)],
      };
    })(),
    ...(() => {
      /* ABI v98 (record-12 transition pack lanes @14292..14324, PLAN
         update-v104-abi98-plan §6.2): the 9 pack lanes drawn so the six
         capture-dependent laws + the 3 typed events CHANGE from the zero
         baseline (harness lesson — new inputs must flip law outputs).
         game0 1 mostly (FULL-DWORD ==1 gate on the anim-0xc special arm;
         0 closes it before the route probe); alt_probe 0 mostly (non-zero
         short-circuits BEFORE the route probe — StageTransition @968
         suppressed); route_probe 0 mostly (0 -> NESTED 0x6fdc10 + @968,
         non-zero -> rewrite {anim 3, dim 0}); player_loop_probe non-zero
         mostly (opens the @972 arm under anim 3/0xc + arg3!=0);
         room_type_8 0xb/0xa/0x12/0x3/0x11 (the anim-3 dispatch arms —
         @976 on the 0x425ac0 rows; else-2 direct-705ee0); subroom_flag_44
         0/1 (the `& 0xff & 1` bit decides 0x425ac0 vs 705ee0 — mutant
         bait: skips); blue_room_probe 0/1 (cmovne -0x10 engine arg0
         rewrite feeding engine_room_arg); engine_pred_probe 0/1 (the
         0x265c0 conditional clear — terminal_265c0_clear); ready 1 mostly
         (0 keeps the pre-v104 residual — the two-voucher gate inert). */
      return {
        transition6fd7c0Game0: [0, 1, 1, 1, 1, 1][integer(0, 5)],
        transition6fd7c0AltPathProbe: [0, 0, 0, 0, 1, 0][integer(0, 5)],
        transition6fd7c0RouteProbe: [0, 0, 1, 0, 0, 1][integer(0, 5)],
        transition6fd7c0PlayerLoopProbe: [0x1234, 0, 0x5678, 0x1234, 0x1, 0x100][integer(0, 5)],
        transition6fd7c0RoomType8: [0xb, 0xa, 0x12, 0x3, 0xb, 0x11][integer(0, 5)],
        transition6fd7c0RoomSubroomFlag44: [0, 1, 0, 1, 0, 1][integer(0, 5)],
        transition6fd7c0BlueRoomProbe: [0, 1, 0, 1, 0, 1][integer(0, 5)],
        transition6fd7c0EnginePredProbe: [0, 1, 0, 1, 0, 1][integer(0, 5)],
        transition6fd7c0Ready: [1, 1, 1, 1, 0, 1][integer(0, 5)],
      };
    })(),
    ...(() => {
      /* ABI v84 (amended): 20 DISTINCT tween k-slots (2 rows × 10) at
         4668 + (g*10+k)*16 + f*4. Wide timer values incl. INT_MIN/INT_MAX
         pin the signed countdown jle law on every slot. */
      const pack = {};
      const statPool = [0, 1, -1, 30, -30, 100, -100];
      for (let g = 0; g < 2; g++) {
        for (let k = 0; k < 10; k++) {
          pack[`hudStatSlot${g}${k}Current`] = Math.fround(statPool[integer(0, 6)]);
          pack[`hudStatSlot${g}${k}Prev`] = Math.fround(statPool[integer(0, 6)]);
          pack[`hudStatSlot${g}${k}Threshold`] = Math.fround(statPool[integer(0, 6)]);
          pack[`hudStatSlot${g}${k}Timer`] =
            [0, -1, 1, 30, 31, 150, 0x80000000, 0x7fffffff][integer(0, 7)];
        }
      }
      return pack;
    })(),
    ...(() => {
      const pack = {};
      const statPool = [0, 1, -1, 30, -30, 100, -100];
      for (let i = 0; i < 8; i++) {
        /* pack.ptr = entry token (RULING 2026-08-11); drawn from the
           slot-ptr pool so slotPtr[s] == pack.ptr fires the match arm. */
        pack[`hudStatPlayer${i}Ptr`] = hudStatWalkPtrPool[integer(0, 2)];
        pack[`hudStatPlayer${i}PredA`] = integer(0, 1);
        pack[`hudStatPlayer${i}F2c`] = [0, 1, -1][integer(0, 2)];
        pack[`hudStatPlayer${i}F3bc`] = integer(0, 1);
        pack[`hudStatPlayer${i}F13c0`] = [0x28, 0x1d, 0x26, 0, 0x29][integer(0, 4)];
        pack[`hudStatPlayer${i}F172`] = integer(0, 1);
        /* otherPtr: DISJOINT pool {0x1111,0x2222} plus 0 (predB `other != 0`
           reject) and occasional ptr-equal (predB identity-false arm:
           otherPtr == pack.ptr -> `other != entry` false -> no reject). */
        pack[`hudStatPlayer${i}OtherPtr`] =
          [0, 0x1111, 0x2222, pack[`hudStatPlayer${i}Ptr`]][integer(0, 3)];
        pack[`hudStatPlayer${i}Other161c`] = [0, -1, 5, -5][integer(0, 3)];
        pack[`hudStatPlayer${i}F161c`] = [0, 5, -5][integer(0, 2)];
        pack[`hudStatPlayer${i}F328`] = [0, 100, -1][integer(0, 2)];
        /* The six f32 tween targets (NaN-pool safe: tween NaN semantics are
           pinned only for probe1/probe3 and game1adb4, so stats draw no NaN). */
        pack[`hudStatPlayer${i}F1568`] = Math.fround(statPool[integer(0, 6)]);
        pack[`hudStatPlayer${i}F1460`] = Math.fround(statPool[integer(0, 6)]);
        pack[`hudStatPlayer${i}F1470`] = Math.fround(statPool[integer(0, 6)]);
        pack[`hudStatPlayer${i}F1480`] = Math.fround(statPool[integer(0, 6)]);
        pack[`hudStatPlayer${i}F1464`] = Math.fround(statPool[integer(0, 6)]);
        pack[`hudStatPlayer${i}F156c`] = Math.fround(statPool[integer(0, 6)]);
      }
      return pack;
    })(),
    /* ABI v37 ambient sparse + gates for room-update clear resume. */
    roomAmbientCount7454: integer(0, 4) === 0 ? 0 : integer(1, 8),
    roomAmbientIntensity7458: Math.fround(random() * 0.2),
    roomAmbientFlag745c: integer(0, 1),
    ambientDescPresent: integer(0, 1),
    ambientDescId: integer(0, 0x30),
    ambientPlayerCount: integer(0, 4),
    /* C1 (update-v109-whitelist12): ambientVelX7460@240 / ambientVelY7464@244
       are u32 lanes; the old f32 draw (Math.fround(random()*2-1)) staged to
       0 via `>>> 0` for every value in (-1,1), so the module ALWAYS saw a
       zero lane and 0x24ee0_needs_host was a silent no-op (0000). Draw
       full-width u32 patterns: random dwords + discriminating constants
       (1.0f bits 0x3f800000, sentinel-bits 0x3760371c / 0x37873770 as
       INTEGERS — never the float value, which would diverge from the
       u32->f32 lane conversion — plus 0 and 1). Both sides compare the
       lane number against the sentinel float, so no integer ever equals
       the fractional sentinel: the HOST arm is exercised with nonzero
       discrimination and the differential stays bit-consistent. */
    ambientVelX7460: (() => {
      const r = random();
      return r < 0.1 ? [0x3f800000, 0x3760371c, 0x37873770, 0, 1][integer(0, 4)]
        : integer(0, 0xffffffff);
    })(),
    ambientVelY7464: (() => {
      const r = random();
      return r < 0.1 ? [0x3f800000, 0x37873770, 0x3760371c, 0, 1][integer(0, 4)]
        : integer(0, 0xffffffff);
    })(),
    ambientStage: integer(1, 12),
    ambientStageType: integer(0, 5),
    resumeStageEffectCounter68d6c: integer(-2, 5),
    resumeStageRoomTransitionMode1830c: integer(0, 3),
    resumeStageFrameCounter264fc: integer(-100, 100),
    resumeStageFrameCounter264f8: integer(-100, 100),
    resumeRoomFrameCounter264fc: integer(-100, 100),
    resumeRoomFrameCounter264f8: integer(-100, 100),
    /* ABI v96 (wave-22 merge lanes): record-4 SFX-manager store-plan +
       per-player entry pack, record-10 true-probe manager blob, record-9
       TAIL-A MP-slot pair, record-22 ANM2::Load pre-lane host half,
       record-41 b18 entity capture pack + record-12 (0x705ee0) write-block
       seam lanes. All drawn NON-DEFAULT (C3 audit: delivery + draw);
       ready vouchers biased nonzero so the pure arms reach the
       differential on both sides. Word-array lanes are plain u32 arrays
       (the module pack staging + the model laws both index per-entry). */
    ...(() => {
      const u32 = () => ((integer(0, 0xffff) << 16) | integer(0, 0xffff)) >>> 0;
      const signed = () => integer(-0x8000, 0x7fff);
      const entryPack = () => Array.from({ length: ENGINE_PLAYER_MAX }, () => u32());
      const playerEntryReady = integer(0, 3) === 0 ? 0 : 1;
      const playerEntryCount = playerEntryReady === 0 ? 0
        : [0, 1, 2, 8][integer(0, 3)];
      const pack = {
        opaque8318a0SfxGlobal798e4: u32(),
        opaque8318a0SfxGlobal79948: u32(),
        opaque8318a0SfxGlobal79790: u32(),
        opaque8318a0SfxGlobal7978c: u32(),
        opaque8318a0EngineField28: u32(),
        opaque8318a0EngineByte7c: integer(0, 0x100),
        opaque8318a0PlayerEntryReady: playerEntryReady,
        opaque8318a0PlayerEntryCount: playerEntryCount,
      };
      for (const stem of ["B173", "B1398", "B139a", "B171", "W410", "W3fc",
                          "Ptr7c", "B34", "B88", "W1600", "W418", "W16c"]) {
        pack[`opaque8318a0PlayerEntry${stem}`] = entryPack();
      }
      /* record-10 true-probe interior blob. */
      pack.frameOpaque4212c0TrueProbeReady = integer(0, 3) === 0 ? 0 : 1;
      pack.frameOpaque4212c0TrueProbeMgrBase = u32();
      pack.frameOpaque4212c0TrueProbeMgrF18 = u32();
      pack.frameOpaque4212c0TrueProbeMgrEbc = u32();
      pack.frameOpaque4212c0TrueProbeMgr14 = u32();
      pack.frameOpaque4212c0TrueProbeMgr21618 = u32();
      pack.frameOpaque4212c0TrueProbeMgr21620 = u32();
      pack.frameOpaque4212c0TrueProbeMgr21624 = u32();
      pack.frameOpaque4212c0TrueProbeMgr2161c = u32();
      pack.frameOpaque4212c0TrueProbeMgr29fb8 = u32();
      pack.frameOpaque4212c0TrueProbeVolumeBits = u32();
      pack.frameOpaque4212c0TrueProbeVolumeEqOne = integer(0, 1);
      /* record-9 TAIL-A MP-slot pair + optional seed (capture-only lanes). */
      pack.state24ecc8ef990TailaSlotBegin = integer(0, 8);
      pack.state24ecc8ef990TailaSlotEnd = integer(0, 8);
      pack.state24ecc8ef990TailaSfxSeed = u32();
      /* record-22 ANM2::Load pre-lane host half. */
      pack.engineAnm2FilenameReady = integer(0, 3) === 0 ? 0 : 1;
      pack.engineAnm2FilenamePtr = integer(0, 4) === 0 ? 0 : u32();
      pack.engineAnm2FilenameSize = integer(0, 0x4000);
      pack.engineAnm2FilenameCap = [0x10, 0x100, 0x4000][integer(0, 2)];
      pack.engineAnm2AnimFirstPre = integer(0, 2);
      pack.engineAnm2AnimSecondPre = integer(0, 2);
      pack.engineAnm2AnimReady = integer(0, 3) === 0 ? 0 : 1;
      pack.engineAnm2LoadgraphicsFlagReady = integer(0, 3) === 0 ? 0 : 1;
      pack.engineAnm2LoadgraphicsFlags =
        Array.from({ length: ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS }, () => integer(0, 0xff));
      /* record-41 b18 entity capture pack (word arrays; full-dword law). */
      pack.b18EntityReady = integer(0, 3) === 0 ? 0 : 1;
      pack.b18EntityCount = [0, 1, 4, 8, B18_ENTITY_MAX][integer(0, 4)];
      pack.b18EntityMode = integer(0, 4);
      pack.b18EntityTypes = Array.from(
        { length: B18_ENTITY_MAX }, () => [0, 1, 2, 3, 4, 0x1d, 0x100][integer(0, 6)]);
      pack.b18EntityCastResults = Array.from(
        { length: B18_ENTITY_MAX }, () => integer(0, 1));
      /* record-12 705ee0 write-block seam capture. */
      pack.rewind705ee0SlotIndex676ac = [-1, 0, 1, 2][integer(0, 3)];
      pack.rewind705ee0SlotValidByte = integer(0, 1);
      pack.rewind705ee0SlotRoom19d20 = signed();
      pack.rewind705ee0SlotTagE8 = signed();
      pack.rewind705ee0SlotArg1fe2c = signed();
      pack.rewind705ee0SlotFrame1fe30 = u32();
      pack.rewind705ee0GameBase = u32();
      pack.rewind705ee0GameTag0 = signed();
      pack.rewind705ee0GameFrame264f8 = u32();
      pack.rewind705ee0Game18318 = u32();
      pack.rewind705ee0PayloadBlobReady = integer(0, 3) === 0 ? 0 : 1;
      pack.rewind705ee0PayloadBlobAddr = u32();
      pack.rewind705ee0PayloadBlob = Array.from({ length: 0x20b }, () => u32());
      pack.opaqueCall006fd7c0Ready = integer(0, 3) === 0 ? 0 : 1;
      return pack;
    })(),
  }));
}

/* ABI v108 (record idx 39 REMOVAL, update-v108-record39-removal):
   deterministic FULL-CAPTURE-THEOREM arms — draw-budget free (the random
   loop above can be capped via VERIFY_DRAWS without neutering these).
   Every case pins one residual arm of the mid-restock wire on the
   resume_room_update_head seam (roomType8=2 shop, frame 100 > entry 0
   unless overridden): mono (pack absent -> MONOLITHIC coarse @220),
   pure (open desc, seed!=0 -> no coarse), typed drop (seed58==0
   FULL-DWORD -> @984), WIDE seed 0xffffffff NOT fatal, WIDE ready
   0xffffffff counts, inner short gate closed (ac s16 <= 0 -> NONE),
   ae==-1 opens, owner 0 -> NONE, age closed -> NONE, active 0 -> NONE. */
const MID_RESTOCK_THEOREM_CASES = [
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 0, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 } }, /* mono */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 } }, /* pure */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0 } }, /* typed */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0xffffffff } }, /* wide not fatal */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 0xffffffff, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x100 } }, /* wide ready */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 0, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 } }, /* inner closed ac0 */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 0xffff, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 } }, /* inner closed ac -1 */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 0, midRestockDescAe: 7, midRestockDescSeed58: 0 } }, /* inner closed seed0 */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 0xffff, midRestockDescSeed58: 0x1234 } }, /* ae -1 opens */
  { mr: { midRestockOwner0x209: 0, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 } }, /* owner zero */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 }, entry: 200 }, /* age closed */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 5, midRestockDescAe: 7, midRestockDescSeed58: 0x1234 }, active: 0 }, /* active zero */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 0x8000, midRestockDescAe: 0x8000, midRestockDescSeed58: 1 } }, /* ac s16 min -> inner closed */
  { mr: { midRestockOwner0x209: 1, midRestockDescReady: 1, midRestockDescAc: 0x100, midRestockDescAe: 0x100, midRestockDescSeed58: 1 } }, /* ac wide positive -> pure */
];
for (const tc of MID_RESTOCK_THEOREM_CASES) {
  corpus.push(completeState({
    resumeHeadRoomType8: 2,
    frameCounter264f8: 100,
    ambientRoomActive: tc.active ?? 1,
    ambientRoomEntry11f0: tc.entry ?? 0,
    ...tc.mr,
  }));
}
/* ABI v129 (update-v129-record44-heartbeat-close): deterministic
   FULL-CAPTURE-THEOREM arms for the PM intensity parent wire — under the
   blob voucher (complete packs) every residual arm routes to a child
   typed lane (v121/v124/v128) or the proven pure skip, so the coarse
   playerManagerUpdateHeartbeat @240 edge is unreachable; capture absence
   keeps the monolith. Draw-budget free. */
const RECORD44_THEOREM_CASES = [
  /* blob live + quiet + idle -> NONE (pure skip). */
  { pmIntensityPlayerCount: 1, pmIntensityBlobReady: 1, pmIntensitySfxPlaying: 0,
    pmIntensityRaw0: 0, pmIntensityFlags0: 0, pmIntensityDead0: 0 },
  /* blob live + loud + idle -> PLAY residual (child lane carries it). */
  { pmIntensityPlayerCount: 1, pmIntensityBlobReady: 1, pmIntensitySfxPlaying: 0,
    pmIntensityRaw0: 20, pmIntensityFlags0: 0, pmIntensityDead0: 0 },
  /* blob live + loud + playing -> UPDATE residual (child lane). */
  { pmIntensityPlayerCount: 1, pmIntensityBlobReady: 1, pmIntensitySfxPlaying: 1,
    pmIntensityRaw0: 20, pmIntensityFlags0: 0, pmIntensityDead0: 0 },
  /* blob live + quiet + playing + STOP-live lanes -> typed STOP lane. */
  { pmIntensityPlayerCount: 1, pmIntensityBlobReady: 1, pmIntensitySfxPlaying: 1,
    pmIntensityRaw0: 0, pmIntensityFlags0: 0, pmIntensityDead0: 0,
    sfxStopReady: 1, sfxStopSpan: 509 * 0x1b8 + 4, sfxStopVoices190: 2,
    sfxStopEnabled198: 1 },
  /* blob absent -> the pre-v44 monolithic parent edge (byte-for-byte). */
  { pmIntensityPlayerCount: 1, pmIntensityBlobReady: 0 },
];
for (const tc of RECORD44_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v130 (update-v130-record36-waterb16-close): deterministic
   FULL-CARRY theorem arms for the B16 parent wire. Under
   [blob live AND 823540-gate open AND neither entity-spawn walk arms]
   the coarse opaque_room_update_tail_water_b16 @208 edge retires (the
   span reduces to the v20/v24 state floats + the pure wrapper chain);
   each spawn-walk arm and capture absence keep the monolith. */
const RECORD36_THEOREM_CASES = [
  /* Full carry: blob live, water/lava > 0, challenge 0 (no type-7),
     lava NOT crossing under the decay band -> coarse RETIRED, wire runs. */
  { waterB16BlobReady: 1, challenge0x123: 0,
    resumeRoomWaterAmount7240: bitsToF32(0x3f000000),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    resumeHeadRoomType8: 1 },
  /* Lava-band spawn walk arms (old 0.2 >= band, new f32(0.2*decay) <
     band) -> monolith keeps firing. */
  { waterB16BlobReady: 1, challenge0x123: 0,
    resumeRoomWaterAmount7240: bitsToF32(0x3f000000),
    resumeRoomLavaIntensity7740: bitsToF32(0x3e4ccccd),
    resumeHeadRoomType8: 1 },
  /* Water-band type-7 spawn walk arms (challenge != 0, post-add water in
     the |0x100 band, desc-flags bit5) -> monolith keeps firing. */
  { waterB16BlobReady: 1, challenge0x123: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f4ccccd),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    resumeHeadRoomType8: 1, resumeHeadRoomDescFlags44: 32 },
  /* Capture absence -> pre-v95 monolith byte-for-byte. */
  { waterB16BlobReady: 0, challenge0x123: 0,
    resumeRoomWaterAmount7240: bitsToF32(0x3f000000),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    resumeHeadRoomType8: 1 },
];
for (const tc of RECORD36_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v131 (update-v131-greed-probe-pack): deterministic FULL-CAPTURE
   theorem arms for the greed probe band (record idx 30). Under the
   greedProbePackReady voucher the three 0x9bf990/0x9bfa00/0x9bfa70
   probes run in-module and the 0x9bfae0 fire plan publishes as typed
   carriers; capture absence / over-cap keeps the coarse monolith. */
const RECORD30_THEOREM_CASES = [
  /* Pack live: one quiet qualifier + one disqualified loud elem. */
  { resumeHeadDifficulty269c8: 2, resumeHeadRoomType8: 1,
    greedProbePackReady: 1, greedProbeElemCount: 2,
    greedProbeF2c0: 0, greedProbeF3bc0: 0, greedProbeHasParent0: 0,
    greedProbeParent161c0: 0, greedProbeSelf161c0: 0,
    greedProbeParentIsSelf0: 0, greedProbeF20a90: 0,
    greedProbeF2c1: 1, greedProbeF3bc1: 0, greedProbeHasParent1: 0,
    greedProbeParent161c1: 0, greedProbeSelf161c1: 0,
    greedProbeParentIsSelf1: 0, greedProbeF20a91: 5 },
  /* WIDE byte lanes re-narrow to the low byte. */
  { resumeHeadDifficulty269c8: 2, resumeHeadRoomType8: 1,
    greedProbePackReady: 1, greedProbeElemCount: 2,
    greedProbeF2c0: 0, greedProbeF3bc0: 0, greedProbeHasParent0: 0,
    greedProbeParent161c0: 0, greedProbeSelf161c0: 0,
    greedProbeParentIsSelf0: 0, greedProbeF20a90: 0x100,
    greedProbeF2c1: 1, greedProbeF3bc1: 0, greedProbeHasParent1: 0,
    greedProbeParent161c1: 0, greedProbeSelf161c1: 0,
    greedProbeParentIsSelf1: 0, greedProbeF20a91: 5 },
  /* Capture absence -> pre-v95 monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 2, resumeHeadRoomType8: 1,
    greedProbePackReady: 0, greedProbeElemCount: 2,
    greedProbeF2c0: 0, greedProbeF3bc0: 0, greedProbeHasParent0: 0,
    greedProbeParent161c0: 0, greedProbeSelf161c0: 0,
    greedProbeParentIsSelf0: 0, greedProbeF20a90: 0 },
  /* Over-cap -> monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 2, resumeHeadRoomType8: 1,
    greedProbePackReady: 1, greedProbeElemCount: 9 },
];
for (const tc of RECORD30_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v132 (update-v132-b16-spawn-pack): deterministic theorem arms for
   the extended FULL-CARRY conjunction (record idx 36). An armed walk lane
   is carried by its enumeration rows (voucher + counts in cap + dims
   echo); over-cap, missing voucher, or echo mismatch keeps the coarse
   monolith byte-for-byte. Dims echo 0/0 matches the unset b3b7 defaults. */
const RECORD36_V132_CASES = [
  /* Type-7 arm armed AND rows ready -> coarse RETIRED (full carry). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f4ccccd),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    waterB16BlobReady: 1, challenge0x123: 1,
    resumeHeadRoomDescFlags44: 32,
    waterB16SpawnRowsReady: 1, waterB16WaterHitCount: 3,
    waterB16LavaHitCount: 0, waterB16GridWEcho: 0, waterB16GridHEcho: 0 },
  /* Type-7 arm armed, rows NOT ready -> monolith fires. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f4ccccd),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    waterB16BlobReady: 1, challenge0x123: 1,
    resumeHeadRoomDescFlags44: 32,
    waterB16SpawnRowsReady: 0, waterB16WaterHitCount: 3,
    waterB16LavaHitCount: 0, waterB16GridWEcho: 0, waterB16GridHEcho: 0 },
  /* Lava arm armed via a decay-band crossing + rows ready -> RETIRED.
     old = f32(0x3e4ccccd) = band; new = old*decay < band; old >= band. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f000000),
    resumeRoomLavaIntensity7740: bitsToF32(0x3e4ccccd),
    waterB16BlobReady: 1, challenge0x123: 0,
    waterB16SpawnRowsReady: 1, waterB16WaterHitCount: 0,
    waterB16LavaHitCount: 2, waterB16GridWEcho: 0, waterB16GridHEcho: 0 },
  /* Over-cap hit count poisons the voucher -> monolith fires. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f4ccccd),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    waterB16BlobReady: 1, challenge0x123: 1,
    resumeHeadRoomDescFlags44: 32,
    waterB16SpawnRowsReady: 1, waterB16WaterHitCount: 65,
    waterB16LavaHitCount: 0, waterB16GridWEcho: 0, waterB16GridHEcho: 0 },
  /* Echo mismatch poisons the voucher -> monolith fires. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    resumeRoomWaterAmount7240: bitsToF32(0x3f4ccccd),
    resumeRoomLavaIntensity7740: bitsToF32(0x3f000000),
    waterB16BlobReady: 1, challenge0x123: 1,
    resumeHeadRoomDescFlags44: 32,
    waterB16SpawnRowsReady: 1, waterB16WaterHitCount: 1,
    waterB16LavaHitCount: 0, waterB16GridWEcho: 7, waterB16GridHEcho: 0 },
];
for (const tc of RECORD36_V132_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v133 (update-v133-audio-music-pack): deterministic theorem arms
   for the audio/music spawn-tail packs (records idx26/27). Under the
   tca40/tca83b0 vouchers the spawn tails run in-module and publish the
   typed carriers; capture absence / over-cap keeps both coarse monoliths
   byte-for-byte. */
const RECORD2627_THEOREM_CASES = [
  /* Both packs live, count 5, music fires (value exactly 1.0f). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40TailPackReady: 1, tca40TailIterCount: 5,
    tca40TailDoorF24: 10, tca40TailGameC: 2,
    tca40TailVec0Bits: 0x3f800000, tca40TailVec4Bits: 0,
    tca40TailRotCosBits: 0x3f800000, tca40TailRotSinBits: 0,
    tca83b0TailPackReady: 1, tca83b0TailIterCount: 5,
    tca83b0TailDoorF24: 10, tca83b0TailGameC: 2,
    tca83b0TailVec0Bits: 0x3f800000, tca83b0TailVec1Bits: 0,
    roomTriggerClearAudioSeed: 1,
    roomTriggerClearAudioValue: 0x3f800000,
    roomTriggerClearAudioPlaySound: 1,
    roomTriggerClearAudioGate749830: 1,
    roomTriggerClearAudioRoomMatch: 1 },
  /* idx26 pack live alone (idx27 voucher absent -> coarse @176 monolith). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40TailPackReady: 1, tca40TailIterCount: 5,
    tca40TailDoorF24: 10, tca40TailGameC: 2,
    tca40TailVec0Bits: 0x3f800000, tca40TailVec4Bits: 0,
    tca40TailRotCosBits: 0x3f800000, tca40TailRotSinBits: 0,
    tca83b0TailPackReady: 0,
    roomTriggerClearAudioSeed: 1,
    roomTriggerClearAudioValue: 0x3f800000,
    roomTriggerClearAudioGate749830: 1,
    roomTriggerClearAudioRoomMatch: 1 },
  /* Capture absence on BOTH packs -> both monoliths. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40TailPackReady: 0, tca83b0TailPackReady: 0 },
  /* Over-cap counts poison both vouchers -> both monoliths. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40TailPackReady: 1, tca40TailIterCount: 9,
    tca83b0TailPackReady: 1, tca83b0TailIterCount: 12 },
];
for (const tc of RECORD2627_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v136 (update-v136-audio-head-pack): deterministic theorem arms for
   the 0x007f7a40 HEAD pack (record idx26). Under tca40HeadPackReady the
   head gates + ABI-67 fail chain decide in-module and the coarse @172
   retires on the voucher ALONE; capture absence keeps the monolith
   byte-for-byte. The play/fail rows differ by ONE lane each so the
   differential fails if the harness ever stops delivering a key. */
const RECORD26_HEAD_THEOREM_CASES = [
  /* Head live alone -> coarse @172 retired (no tail rows needed). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40HeadPackReady: 1 },
  /* Head live, play arm (h_706940_80 == 3, match legs open) -> gates
     law reaches success/play; coarse stays retired; tail rows absent ->
     no spawn carrier. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40HeadPackReady: 1,
    tca40HeadH706940H80: 3, tca40HeadGame18304: 7, tca40HeadGame182D0: 7,
    tca40HeadGame4: 1, tca40HeadRoom728: 0 },
  /* Head live, fail arm (play == 0 -> fail_path == 1) -> ABI-67 fail
     chain consumes in-module (seed/bm1/bm2/occ scan), publishes nothing;
     coarse stays retired. RanBits bit3..7 set = fail-path probes ran. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40HeadPackReady: 1, tca40HeadRanBits: 0xf8,
    tca40HeadObj1E3: 0, tca40HeadObj8: 2, tca40HeadGame26630: 1,
    tca40HeadGameByte26589: 1, tca40HeadGame18314: 5,
    tca40HeadH740Bc0Ret8: 5, tca40HeadH706940BH80: 2,
    tca40HeadH74Bae0: 4, tca40HeadH74E9B0Al: 0,
    tca40HeadSlotSeed: 0x1234, tca40HeadBm1: 0xff,
    tca40HeadSlotOcc0: 1, tca40HeadSlotOcc3: 2,
    tca40HeadSlot8: 4, tca40HeadGenrandTail: 7 },
  /* Capture absence -> monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca40HeadPackReady: 0, tca40TailPackReady: 1, tca40TailIterCount: 5 },
];
for (const tc of RECORD26_HEAD_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v137 (update-v137-audio-head-83b0-pack): deterministic theorem
   arms for the 0x007f83b0 HEAD pack (record idx27). Under
   tca83B0HeadPackReady windows A-F decide in-module; the coarse @176
   retires on skip/music/flag arms (plus the main-tail voucher when
   music fired), and KEEPS counting on ALT-dispatch ticks (the ALT spawn
   tail has frozen law v84 but no capture lanes yet — record stays
   NARROWED). Each arm differs from its neighbor by ONE lane group. */
const RECORD27_HEAD_THEOREM_CASES = [
  /* Skip arm: gate closed -> pure epilogue, coarse retired. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1 },
  /* Music + main dispatch + tail live -> coarse retired. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 1, tca83B0HeadBm2NonNull: 0,
    tca83B0HeadRandomIntRnd: 0, tca83B0HeadBm1_38: 0xff,
    tca83b0TailPackReady: 1, tca83b0TailIterCount: 5 },
  /* Music + main dispatch but MAIN TAIL voucher absent -> monolith. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 1, tca83B0HeadBm2NonNull: 0,
    tca83B0HeadRandomIntRnd: 0, tca83B0HeadBm1_38: 0xff,
    tca83b0TailPackReady: 0 },
  /* ALT dispatch (owner probe fails) -> coarse STAYS (§6 companion gap). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 0,
    tca83b0TailPackReady: 1, tca83b0TailIterCount: 5 },
  /* Count<2 route (occ all occupied -> freeMask 0 -> count 0) -> ALT walk
     runs -> coarse STAYS. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 1, tca83B0HeadBm2NonNull: 0,
    tca83B0HeadRandomIntRnd: 0, tca83B0HeadBm1_38: 0xff,
    tca83B0HeadSlotOcc0: 1, tca83B0HeadSlotOcc1: 1,
    tca83B0HeadSlotOcc2: 1, tca83B0HeadSlotOcc3: 1,
    tca83B0HeadSlotOcc4: 1, tca83B0HeadSlotOcc5: 1,
    tca83B0HeadSlotOcc6: 1, tca83B0HeadSlotOcc7: 1,
    tca83b0TailPackReady: 1, tca83b0TailIterCount: 5 },
  /* Flag-store arm (music NOT fired via small value + zero seed) ->
     window A end, coarse retired even without any tail voucher. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0, tca83B0HeadMusicSeed: 0x12345678 },
  /* Capture absence -> pre-v137 rule byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 0 },
];
for (const tc of RECORD27_HEAD_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v138 (update-v138-audio-alt-tail-pack): deterministic theorem
   arms for the ALT-tail pack (record idx27 full resolution). Route-
   keyed voucher guard (falsifier 6), iter tripwire (falsifier 5) and
   game_c==0 zeroed plan are each ONE lane apart from their neighbor. */
const RECORD27_ALT_THEOREM_CASES = [
  /* ALT live on an owner-fail diverted tick -> coarse retired, carrier n. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 0, tca83B0HeadDoorMagic: 0xe,
    tca83B0AltTailPackReady: 1, tca83B0AltTailIterCount: 6,
    tca83B0AltTailDoorF24: 10, tca83B0AltTailGameC: 2,
    tca83B0AltTailVecABits: 0x3f800000, tca83B0AltTailVecBBits: 1 },
  /* Route-keyed-voucher guard (falsifier 6): bm2 route, same lanes ->
     identical retirement. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 1, tca83B0HeadBm2NonNull: 1,
    tca83B0HeadDoorMagic: 0xe,
    tca83B0AltTailPackReady: 1, tca83B0AltTailIterCount: 5,
    tca83B0AltTailDoorF24: 10, tca83B0AltTailGameC: 2,
    tca83B0AltTailVecABits: 0x3f800000, tca83B0AltTailVecBBits: 1 },
  /* Voucher absent on a diverted tick -> monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 0,
    tca83B0AltTailPackReady: 0 },
  /* iter_count tripwire (falsifier 5): > 8 -> monolith. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 0, tca83B0HeadDoorMagic: 0xe,
    tca83B0AltTailPackReady: 1, tca83B0AltTailIterCount: 9 },
  /* game_c == 0 -> div_ok=0 zeroed Out; rows still consumed -> carrier n,
     coarse stays retired (contract total). */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    tca83B0HeadPackReady: 1, tca83B0HeadGate749830: 1,
    tca83B0HeadRoomIdxRet8: 7, tca83B0HeadGame18314: 7,
    tca83B0HeadValue92B0Bits: 0x3f800000,
    tca83B0HeadOwnerProbe: 0, tca83B0HeadDoorMagic: 0xe,
    tca83B0AltTailPackReady: 1, tca83B0AltTailIterCount: 5,
    tca83B0AltTailDoorF24: 10, tca83B0AltTailGameC: 0,
    tca83B0AltTailVecABits: 0x3f800000, tca83B0AltTailVecBBits: 1 },
];
for (const tc of RECORD27_ALT_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v139 (update-v139-b1-rain-pack): deterministic theorem arms for
   the shared-half B1 spawn contract (records idx13/idx35, double-booked
   region 0x00802A80..0x00802E0D). Under a LIVE b1RainRowsReady voucher
   the SPAWN residual pin goes quiet and the six scalar echoes publish
   exactly once; capture absence / chain break / over-cap / count-echo
   closure break each keep today's monolith byte-for-byte. Arms differ by
   ONE lane group. */
const RECORD1315_RAIN_THEOREM_CASES = [
  /* Live voucher on an armed tick: quality 3 / decor 5 -> count 3; chain
     closed; search_ok sum 2; draws 24; one 7764 store; one reposition. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 6,
    b1SfxReady: 1, b1BufferReady: 1, b1DescField40: 1, b1NestedField10: 0,
    b1Begin183a4: 0x1000, b1End183a8: 0x2000, ambientStage: 1,
    ambientRoomSubtype1bb0: 0,
    b1RainRowsReady: 1, b1RainSpawnCount: 3,
    b1RainQualityEcho: 3, b1RainDecorCountEcho: 5,
    b1RainSeed0Echo: 0x11111111,
    b1RainRow0IterIndex: 0, b1RainRow0ShuffleSeedIn: 0x11111111,
    b1RainRow0ShuffleSeedOut: 0x22222222, b1RainRow0SearchOk: 1,
    b1RainRow0SearchDraws: 7, b1RainRow0BindReposDraws: 3,
    b1RainRow0BindStore7764: 1, b1RainRow0BindRepositioned: 1,
    b1RainRow1IterIndex: 1, b1RainRow1ShuffleSeedIn: 0x22222222,
    b1RainRow1ShuffleSeedOut: 0x33333333, b1RainRow1SearchOk: 0,
    b1RainRow1SearchDraws: 5,
    b1RainRow2IterIndex: 2, b1RainRow2ShuffleSeedIn: 0x33333333,
    b1RainRow2ShuffleSeedOut: 0x44444444, b1RainRow2SearchOk: 1,
    b1RainRow2SearchDraws: 9 },
  /* Capture absence on the SAME armed tick -> both pins byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 6,
    b1SfxReady: 1, b1BufferReady: 1, b1DescField40: 1, b1NestedField10: 0,
    b1Begin183a4: 0x1000, b1End183a8: 0x2000, ambientStage: 1,
    ambientRoomSubtype1bb0: 0 },
  /* Chain-break mutant bait (falsifier via NOTES 2.4 law 3): row1.seed_in
     != row0.seed_out poisons the WHOLE voucher. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 6,
    b1SfxReady: 1, b1BufferReady: 1, b1DescField40: 1, b1NestedField10: 0,
    b1Begin183a4: 0x1000, b1End183a8: 0x2000, ambientStage: 1,
    ambientRoomSubtype1bb0: 0,
    b1RainRowsReady: 1, b1RainSpawnCount: 3,
    b1RainQualityEcho: 3, b1RainDecorCountEcho: 5,
    b1RainSeed0Echo: 0x11111111,
    b1RainRow0IterIndex: 0, b1RainRow0ShuffleSeedIn: 0x11111111,
    b1RainRow0ShuffleSeedOut: 0x22222222, b1RainRow1IterIndex: 1,
    b1RainRow1ShuffleSeedIn: 0xbadbad00 },
  /* Over-cap poison (falsifier: never truncate) -- count 65 > cap 64. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 6,
    b1SfxReady: 1, b1BufferReady: 1, b1DescField40: 1, b1NestedField10: 0,
    b1Begin183a4: 0x1000, b1End183a8: 0x2000, ambientStage: 1,
    ambientRoomSubtype1bb0: 0,
    b1RainRowsReady: 1, b1RainSpawnCount: 65,
    b1RainQualityEcho: 65, b1RainDecorCountEcho: 70 },
];
for (const tc of RECORD1315_RAIN_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v134 (update-v134-awards-head-pack): deterministic theorem arms
   for the award-spawner HEAD (records idx28/29). Under awardsHeadReady
   every exit except SPAWN_LOOP(4) retires the coarse @184; capture
   absence keeps the monolith byte-for-byte. */
const RECORD2829_THEOREM_CASES = [
  /* Exit 6 RT_ALT: roomType8 == 5, capture live -> retired. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 5,
    roomDescFlags44: 128,
    awardsHeadReady: 1, awardsHeadSrcluaGate: 0,
    awardsHeadSrcdescF10Present: 0, awardsHeadSrcdescType8: 0,
    awardsHeadSrcdescType00: 0, awardsHeadSrch74efd0: 0,
    awardsHeadSrcgame1830c: 0, awardsHeadSrcmode269c8: 0,
    awardsHeadSrch9be630: 0, awardsHeadSrcpickedId: 0x15e,
    awardsHeadSrcgateF1: 0, awardsHeadSrch9be750: 2,
    awardsHeadSrch4e4690Bits: 0x3f800000, awardsHeadSrch7e9080Bits: 0,
    awardsHeadSrchRnd64: 0, awardsHeadSrch6ee340: 0,
    awardsHeadSrch9be140: 0, awardsHeadSrcxformId: 0,
    awardsHeadSrcxformB: 0, awardsHeadSrcdescF0: 0,
    awardsHeadSrch9be6b0: 0, awardsHeadSrch7cb6e0: 0,
    awardsHeadSrcgate202: 0, awardsHeadSrchRnd4: 1,
    awardsHeadSrch9be0801a0: 0, awardsHeadSrchRnd3: 0 },
  /* Capture absence -> monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    roomDescFlags44: 128, awardsHeadReady: 0 },
];
for (const tc of RECORD2829_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v140 (update-v140-awards-spawn-loop-pack): deterministic theorem
   arms for the SPAWN_LOOP continuation (record idx29). Each arm differs
   from the retirement arm by ONE lane group. Under a live
   awardsSpawnLoopReady voucher with inert blocker lanes the coarse @184
   retires and the typed carriers publish; over-cap / count mismatch /
   armed 0xb-block / voucher absence each keep the monolith
   byte-for-byte. Base head shape falls to exit 4 (room type 1, lua gate
   clear, count-law legs neutral -> count=1, id=0x15e). */
const RECORD29_SPAWNLOOP_BASE = {
  resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
  roomDescFlags44: 0,
  awardsHeadReady: 1, awardsHeadSrcluaGate: 0,
  awardsHeadSrcdescF10Present: 0, awardsHeadSrcdescType8: 0,
  awardsHeadSrcdescType00: 0, awardsHeadSrch74efd0: 0,
  awardsHeadSrcgame1830c: 0, awardsHeadSrcmode269c8: 0,
  awardsHeadSrch9be630: 0, awardsHeadSrcpickedId: 0x15e,
  awardsHeadSrcgateF1: 0, awardsHeadSrch9be750: 2,
  awardsHeadSrch4e4690Bits: 0x3f800000, awardsHeadSrch7e9080Bits: 0,
  awardsHeadSrchRnd64: 0, awardsHeadSrch6ee340: 0,
  awardsHeadSrch9be140: 0, awardsHeadSrcxformId: 0,
  awardsHeadSrcxformB: 0, awardsHeadSrcdescF0: 0,
  awardsHeadSrch9be6b0: 0, awardsHeadSrch7cb6e0: 0,
  awardsHeadSrcgate202: 0, awardsHeadSrchRnd4: 1,
  awardsHeadSrch9be0801a0: 0, awardsHeadSrchRnd3: 0,
};
const RECORD29_SPAWNLOOP_LIVE = {
  ...RECORD29_SPAWNLOOP_BASE,
  /* Voucher + PE-order match: one iteration. */
  awardsSpawnLoopReady: 1, awardsSpawnLoopIterCount: 1,
  awardsSpawnLoopVariant0: 0xffffffff,
  awardsSpawnLoopRoomWC: 20, awardsSpawnLoopRoomH10: 7,
  /* Row 0: non-door entity in the 6ee340 set; owner probe hits. */
  awardsSpawnLoopRow0PosXBits: 0x41a00000, awardsSpawnLoopRow0PosYBits: 0x42100000,
  awardsSpawnLoopRow0Draw: 0xdeadbeef,
  awardsSpawnLoopRow0EntityType28: 0, awardsSpawnLoopRow0EntityVariant2c: 0x33,
  awardsSpawnLoopRow0EntityField30: 7,
  awardsSpawnLoopRow0DoorGateAl: 0, awardsSpawnLoopRow0SfxOwner: 2,
  /* B1 section: val = (1.0*0.03f+0.2f)*3 = 0.69 -> minss 0.33 > 0.01. */
  awardsSpawnLoopB1MusicGateAl: 1,
  awardsSpawnLoopB1QualityInt: 3,
  awardsSpawnLoopB1QualityFBits: 0x3f800000,
  awardsSpawnLoopB1RndFBits: 0x3c23d70a, /* 0.01f */
  awardsSpawnLoopB1SitePosXBits: 0x41a00000,
  awardsSpawnLoopB1SitePosYBits: 0x42100000,
  awardsSpawnLoopB1SiteDraw: 0xfeedface,
  awardsSpawnLoopB1PickerAl: 1,
  /* Blockers INERT: gate al 0 AND final spawn gate closed. */
  awardsSpawnLoopTailGateB1Al: 0, awardsSpawnLoopGame26584: 0,
};
const RECORD29_SPAWNLOOP_THEOREM_CASES = [
  { ...RECORD29_SPAWNLOOP_LIVE },
  /* Blocker armed via the FINAL gate ([Game+0x26584] == 0x2b) -> monolith. */
  { ...RECORD29_SPAWNLOOP_LIVE, awardsSpawnLoopGame26584: 0x2b },
  /* Blocker armed via the 0xb-band (gate al != 0 WITH room type 0xb). */
  { ...RECORD29_SPAWNLOOP_LIVE, roomType8: 0xb, resumeHeadRoomType8: 0xb,
    awardsSpawnLoopTailGateB1Al: 1 },
  /* Over-cap poison: count law produces 21 rows (> cap 16), never
     truncates. */
  (() => {
    const overCap = { ...RECORD29_SPAWNLOOP_LIVE };
    overCap.awardsHeadSrcpickedId = 0x14;
    overCap.awardsHeadSrcgateF1 = 1;
    overCap.awardsHeadSrch9be750 = 20;
    overCap.awardsHeadSrch4e4690Bits = 0x3f000000; /* 0.5f -> lhs 0.25 */
    overCap.awardsHeadSrch7e9080Bits = 0x3f800000; /* NOT above -> keep c2 */
    overCap.awardsSpawnLoopIterCount = 21;
    return overCap;
  })(),
  /* Count mismatch poisons the whole voucher (PE order is dense). */
  { ...RECORD29_SPAWNLOOP_LIVE, awardsSpawnLoopIterCount: 2 },
  /* Spawn-loop voucher absence on an exit-4 tick -> monolith. */
  { ...RECORD29_SPAWNLOOP_LIVE, awardsSpawnLoopReady: 0 },
];
for (const tc of RECORD29_SPAWNLOOP_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v141 (update-v141-b-block-probe-pack): deterministic theorem arms
   for the post-loop 0xb-block (record idx29). With the band ARMED
   (gate al!=0 WITH room type 0xb) the three probes decide IN-MODULE via
   the frozen room-pure ABI v86 laws when awardsBBlockReady is valid
   (iter_count == sar(vec diff,2) <= 8); absence / over-cap / recount
   mismatch keeps the monolith byte-for-byte. The {5,0x12c} extra create
   ([Game+0x26584]==0x2b) retires on the same voucher. Row 0 packs
   q = 4 (has-8b width 2 + two nested bit-15 slot matches @0x7cb913) ->
   double roll with open follow-up gates; row 1 stays neutral -> q = 0. */
const RECORD29_BBLOCK_LIVE = {
  ...RECORD29_SPAWNLOOP_LIVE,
  roomType8: 0xb, resumeHeadRoomType8: 0xb,
  awardsSpawnLoopTailGateB1Al: 1,
  awardsBBlockReady: 1, awardsBBlockIterCount: 2,
  awardsBBlockVecBegin: 0x1000, awardsBBlockVecEnd: 0x1008,
  awardsBBlockDescChainBit: 1,
  awardsBBlockPosXBits: 0x41a00000, awardsBBlockPosYBits: 0x42100000,
  awardsBBlockDraw: 0xdeadbeef,
  awardsBBlockRngS0: 0x12345678, awardsBBlockRngS1: 5,
  awardsBBlockRngS2: 7, awardsBBlockRngS3: 3,
  awardsBBlockElemValue0: 0x7fb000, awardsBBlockElemValue1: 0x7fb100,
  awardsBBlockRow0Has8b: 1,
  awardsBBlockRow0Slot0: 0x8000 | 0xb1,
  awardsBBlockRow0Slot1: 0x8000 | 0xb1,
};
const RECORD29_BBLOCK_THEOREM_CASES = [
  { ...RECORD29_BBLOCK_LIVE },
  /* Capture absence with the band armed -> monolith byte-for-byte. */
  { ...RECORD29_BBLOCK_LIVE, awardsBBlockReady: 0 },
  /* Recount mismatch (iter 1 vs PE recount 2) poisons the voucher. */
  { ...RECORD29_BBLOCK_LIVE, awardsBBlockIterCount: 1 },
  /* Over-cap poison: PE recount 9 > cap 8, never truncates. */
  { ...RECORD29_BBLOCK_LIVE, awardsBBlockVecEnd: 0x1024 },
  /* Band inert (gate al == 0): pack irrelevant, SPAWN_LOOP retirement
     stands, no b-block carriers. */
  { ...RECORD29_BBLOCK_LIVE, awardsSpawnLoopTailGateB1Al: 0 },
  /* Final gate 0x2b arms WITH a valid pack -> tail create carrier. */
  { ...RECORD29_BBLOCK_LIVE, awardsSpawnLoopGame26584: 0x2b },
];
for (const tc of RECORD29_BBLOCK_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v135 (update-v135-deep-music-pack): deterministic theorem arms
   for the deep-music gate (record idx28). Under tcaDmGateReady the whole
   0x806a65..0x806b63 band decides in-module and the coarse @180 retires;
   capture absence keeps the monolith byte-for-byte. */
const RECORD28_DM_THEOREM_CASES = [
  /* Gate OPENS: probes skipped (head-clear set), vec non-empty, all six
     common legs pass -> fire carrier + flags apply-back. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    roomDescFlags44: 0, frameCounter264f8: 100,
    tcaDmGateReady: 1, tcaDmHeadClear1bb84: 1,
    tcaDmProbeA9e9b50: 0, tcaDmProbeB9595e0: 0,
    tcaDmByte26588: 0,
    tcaDmVecBegin4b3d8: 0x1000, tcaDmVecEnd4b3dc: 0x1010,
    tcaDmCount334: 3, tcaDmRoomMatchRet8: 7, tcaDmGame18314: 7,
    tcaDmGame4: 0, clearPathGameMode0: 1 },
  /* Gate CLOSED via vec-empty fallback (vec pair equal) -> decision
     in-module, coarse retired, no fire. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    roomDescFlags44: 0, frameCounter264f8: 100,
    tcaDmGateReady: 1, tcaDmHeadClear1bb84: 0,
    tcaDmProbeA9e9b50: 0x100, tcaDmProbeB9595e0: 0x100,
    tcaDmByte26588: 0,
    tcaDmVecBegin4b3d8: 0, tcaDmVecEnd4b3dc: 0,
    tcaDmCount334: 3, tcaDmRoomMatchRet8: 7, tcaDmGame18314: 7,
    tcaDmGame4: 0, clearPathGameMode0: 1 },
  /* Capture absence -> monolith byte-for-byte. */
  { resumeHeadDifficulty269c8: 0, resumeHeadRoomType8: 1,
    roomDescFlags44: 0, frameCounter264f8: 100,
    tcaDmGateReady: 0, tcaDmHeadClear1bb84: 1 },
];
for (const tc of RECORD28_DM_THEOREM_CASES) {
  corpus.push(completeState(tc));
}
/* ABI v108 (targeted-run support): deterministic rare arms other
   families' guards need that the random loop hits rarely — B8
   grid-capture over-cap (cells > ROOM_B8_MAX_CELLS under an open
   `(frame % 3) == 0` gate). Draw-budget free. HEAD frame 98: the
   continuation increments frame_counter_264f8 exactly once before the
   room-prefix resume, so the B8 block sees 99 = 0 mod 3 -> the gate is
   OPEN (a head value 99 would see 100 = 1 mod 3 and miss — that is why
   the v108 arm never fired at 500 draws). */
corpus.push(completeState({
  frameCounter264f8: 98, /* -> B8 block sees 99, gate OPEN */
  roomGridCells: ROOM_B8_MAX_CELLS + 1,
  roomB8BlobReady: 1,
  roomB8Costs: new Array(ROOM_B8_MAX_CELLS).fill(1),
  roomB8Trails: new Array(ROOM_B8_MAX_CELLS).fill(1),
  dtB8Arm: "overcap",
}));
/* ABI v110 (wave-31 record-16 eval, update-v109-record16-eval): the 10
   deterministic B8 theorem arms. Every arm routes into the B2
   continuation (trace-route.mjs) and is counted by dtB8Arm so the
   removal eval's full-capture invariant holds at ANY draw budget:
   blob path (capture present, gate open) -> coarse @148 MUST stay 0;
   gate-open capture-absence (no blob / over-cap) -> EXACTLY 1;
   gate miss (frame %3 != 0 / cells <= 0 SIGNED) -> 0. */
const DT_B8_CELLS = 400;
/* Full-width boundary-heavy grids for the 400-cell arms (the differential
   compares all 400 cells; a short array would step zeros past its end). */
const DT_B8_COSTS = Array.from(
  { length: DT_B8_CELLS },
  (_, i) => [3999, 1234, 0, 5000, 900, 100, 101, 1001, -12, 448][i % 10],
);
const DT_B8_TRAILS = Array.from(
  { length: DT_B8_CELLS },
  (_, i) => [99, 50, 1, 0, 100, 98, 5, 32767, -3, 200][i % 10],
);
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: DT_B8_CELLS, roomB8BlobReady: 1,
  roomB8Costs: DT_B8_COSTS,
  roomB8Trails: DT_B8_TRAILS,
  dtB8Arm: "pure",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: 1, roomB8BlobReady: 1,
  roomB8Costs: [3999], roomB8Trails: [111],
  dtB8Arm: "mini",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: ROOM_B8_MAX_CELLS, roomB8BlobReady: 1,
  roomB8Costs: new Array(ROOM_B8_MAX_CELLS).fill(0x1234),
  roomB8Trails: new Array(ROOM_B8_MAX_CELLS).fill(0x55),
  dtB8Arm: "cap448",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: DT_B8_CELLS, roomB8BlobReady: 0x100, /* FULL-DWORD gate */
  roomB8Costs: DT_B8_COSTS,
  roomB8Trails: DT_B8_TRAILS,
  dtB8Arm: "wideready",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: DT_B8_CELLS, roomB8BlobReady: 0,
  dtB8Arm: "mono",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: 0x1ff, /* 511 > 448, WIDE over-cap */
  roomB8BlobReady: 1,
  roomB8Costs: new Array(ROOM_B8_MAX_CELLS).fill(1),
  roomB8Trails: new Array(ROOM_B8_MAX_CELLS).fill(1),
  dtB8Arm: "overcap-wide",
}));
corpus.push(completeState({
  frameCounter264f8: 97, /* -> B8 block sees 98 = 2 mod 3, gate MISS */
  roomGridCells: DT_B8_CELLS, roomB8BlobReady: 1,
  roomB8Costs: DT_B8_COSTS,
  roomB8Trails: DT_B8_TRAILS,
  dtB8Arm: "gatemiss",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: 0, roomB8BlobReady: 1, /* captured TRUE zero -> gate closed */
  dtB8Arm: "zerocells",
}));
corpus.push(completeState({
  frameCounter264f8: 98,
  roomGridCells: 0xffffffff, roomB8BlobReady: 1, /* int32 -1 -> gate closed */
  dtB8Arm: "negcells",
}));
/* ABI v110 (wave-31 record-16 eval): playerHUD blob-lane SUPPORT rows for
   the capped 500-draw budget — the same cross-family support pattern as
   the v108 B8 over-cap arm (record-39 §4 documented this guard starving
   at reduced volume: blobLane 35 < 50 at 500 draws). All-zero slot lanes
   keep the oracle/wasm comparison deterministic (the 35 random rows at
   500 draws already prove latchMismatch stays 0 on the shape). */
for (let i = 0; i < 20; i += 1) {
  corpus.push(completeState({
    playerHudOccupiedMask: 1,
    playerHudBlobReady: 1,
    managerHistoryCount: 1,
    hudHistoryLatch5c7c: i % 2,
    hudHistorySlotFlag0: i % 3,
    hudHistorySlotFlag1: (i + 1) % 3,
  }));
}
/* W32-S5 (update-v110-bridgecapture §4 suggested draw): the S3 browser
   wiring raises b3b7SparseReady=1 through the B3B7 capture arm; the
   corpus never drew the record-15 pack (C1 whitelist12: b3b7SparseReady
   @868 + the 44 law-pack lanes always 0 -> monolith only). One
   discriminating row locks the precedence fix: ready=1 + B3 challenge
   low-byte open (b3b7Hce2a5Hit=1) + desc-type -0x14 signed open with the
   lookup route CLOSED (b3b7LookupCount=1 -> no genrand) + frame-in-room
   closed (b3b7RoomByte1=0) -> the typed counters b3HostFco (unconditional
   on the wire) + b3HostChallenge + b4HostLookup fire, the coarse
   opaqueRoomUpdatePrefixB3B7 stays 0. */
corpus.push(completeState({
  globalRangeByteLength: 8,
  b3b7SparseReady: 1,
  b3b7Hce2a5Hit: 1,
  b3b7DescType0: 0xffffffec, /* -0x14 as int32 */
  b3b7LookupCount: 1,
  b3b7RoomByte1: 0,
  frameCounter264f8: 3,
}));
/* ABI v142 (update-v142-rt-band-pop, record idx4): one discriminating
   row locks the carrier wire — gate_1b83c open, mode==1, empty entry
   walk (candidate_found stays 1), type 0x15 (manager-block gate opens),
   depth_pre=3 / latch_pre=0xabcdef01 so the applied deltas are
   observable: depth_after MUST be 2 (mutation), the latch must KEEP its
   value (cmove false), e4=0x24 (bit2 set -> param sel 1; bit5 set -> row0
   flag 1). A second row drives the underflow arm: depth_pre=1 ->
   depth_after==0 -> the latch CLEARS. Without these rows the four new
   lanes could stay zero in every differential case (silent no-op). */
corpus.push(completeState({
  gate1b83c: 1,
  engineField1c: 0x15,
  opaque008318a0Ready: 1,
  opaque008318a0Mode: 1,
  opaque8318a0PlayerEntryReady: 1,
  opaque8318a0PlayerEntryCount: 0,
  opaque8318a0SfxGlobal798e4: 0x24,
  opaque8318a0SfxGlobal79790: 3,
  opaque8318a0SfxGlobal7978c: 0xabcdef01,
  opaque8318a0SfxGlobal79948: 0xcafe,
}));
corpus.push(completeState({
  gate1b83c: 1,
  engineField1c: 0x15,
  opaque008318a0Ready: 1,
  opaque008318a0Mode: 1,
  opaque8318a0PlayerEntryReady: 1,
  opaque8318a0PlayerEntryCount: 0,
  opaque8318a0SfxGlobal798e4: 0x20,
  opaque8318a0SfxGlobal79790: 1,
  opaque8318a0SfxGlobal7978c: 0x12345678,
  opaque8318a0SfxGlobal79948: 7,
}));



function sameRecord(left, right, layout = null) {
  /* Oracle-only logical keys (resume* pseudo-state) are not part of the
     wasm ABI: restrict the comparison to the layout keys when given. */
  const keys = layout ? Object.keys(layout) : Object.keys(left);
  for (const key of keys) {
    if (!(key in left) || !(key in right)) return false;
    const type = layout?.[key]?.type;
    if (type === "f32") {
      /* float32 fields round on the module side; the oracle holds the logical double */
      if (!Object.is(Math.fround(right[key]), left[key])) return false;
    } else if (type === "u32") {
      /* bit-exact: the oracle may hold the logical signed view of a uint32 lane */
      if ((left[key] >>> 0) !== (right[key] >>> 0)) return false;
    } else if (type === "i32") {
      if ((left[key] | 0) !== (right[key] | 0)) return false;
    } else if (type === "u8") {
      if ((left[key] & 0xff) !== (right[key] & 0xff)) return false;
    } else if (!Object.is(left[key], right[key])) return false;
  }
  return true;
}

    /* ABI v77: record 22 ANM2::Load lane arms. */
let engineAnm2LaneOnCases = 0;
let engineAnm2LaneOffCases = 0;
let engineAnm2StarMaskCases = 0;
/* Scratch load/verify helpers. The timer boundary uses the SAME genrand
   scratch as the v52 H5 boundary — the Room freeze's "load mt[]+mti at the
   boundary, run pure draws, write back" contract. The H5 stage later in the
   same case reloads that scratch from the CORPUS row, so advancing the
   harness-side shared array here never leaks into the H5 observation. */
let timerMtIndexOutSnapshot = 0;
function primeTimerMtScratch(runtimeInputs) {
  /* Snapshot the scratch's index cell so the non-mt arm can prove the module
     did not write it during this boundary (the scratch is module-private
     between boundaries, and the H5 stage may have left anything there). */
  timerMtIndexOutSnapshot =
    new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0] | 0;
  const mtReady = (runtimeInputs.frameOpaque98dba0TimerMtReady ?? 0) >>> 0;
  const useCrt = (runtimeInputs.frameOpaque98dba0TimerUseCrtRand ?? 0) >>> 0;
  const mtState = runtimeInputs.genrandState;
  if (
    mtReady !== 0 &&
    (useCrt & 0xff) === 0 &&
    mtState != null &&
    mtState.length >= GENRAND_STATE_WORDS
  ) {
    new Uint32Array(wasm.memory.buffer, genrandStateAddress(), GENRAND_STATE_WORDS).set(mtState);
    new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0] =
      (runtimeInputs.frameOpaque98dba0TimerMtiIn ?? 0) | 0;
    return true;
  }
  return false;
}
function assertTimerPlanZero(result, why) {
  if (
    result.events.frameOpaque98dba0TimerPlanApplied !== 0 ||
    result.events.frameOpaque98dba0TimerMtAdvanced !== 0 ||
    result.events.frameOpaque98dba0TimerAfter !== 0 ||
    result.events.frameOpaque98dba0TimerThetaBits !== 0 ||
    result.events.frameOpaque98dba0TimerXBits !== 0 ||
    result.events.frameOpaque98dba0TimerYBits !== 0
  ) {
    throw new Error(`timer plan must stay zeroed ${why}`);
  }
}
/* Classify one resume against the PE's timer-block gate. `preTimer` is the
   event counter before the resume, so the delta is exactly whether the host
   edge was emitted. This is re-derived from the PE fact (signed > 0), NOT from
   the model's own decision, so an inverted model fails here. The ABI v70 pure
   arm is re-derived the same way, against the harness's own transcription of
   the interior (harnessTimer*Bits above) — not against either implementation. */
function countTimer98dba0(result, runtimeInputs, preTimer) {
  const emitted = result.events.opaqueCall0098dba0Timer - preTimer;
  if (emitted !== 0 && emitted !== 1) {
    throw new Error(`timer host edge emitted ${emitted} times in one resume`);
  }
  const ready = (runtimeInputs.frameOpaque98dba0TimerReady ?? 0) >>> 0;

  const raw = (runtimeInputs.frameOpaque98dba0Timer264e8 ?? 0) >>> 0;
  const pureReady = (runtimeInputs.frameOpaque98dba0TimerPureReady ?? 0) >>> 0;
  if (ready === 0) {
    if (emitted !== 1) {
      throw new Error("ready=0 must reproduce the pre-v66 unconditional timer emission");
    }
    assertTimerPlanZero(result, "when the gate capture is missing (ready=0)");
    timer98dba0LegacyCases += 1;
    return;
  }
  /* PE 0x0098de50 `test eax,eax` / 0x0098de52 `jle 0x98df1f`: SIGNED. */
  const live = (raw | 0) > 0 ? 1 : 0;
  if (live === 0) {
    if (emitted !== 0) {
      throw new Error(`timer gate wrong for 0x${raw.toString(16)}: emitted on the skip arm`);
    }
    assertTimerPlanZero(result, "on the jle skip arm");
    timer98dba0SkipCases += 1;
    if ((raw | 0) < 0) timer98dba0NegativeSkipCases += 1;
    if (pureReady !== 0) timer98dba0PureSkipArmCases += 1;
    return;
  }
  timer98dba0LiveCases += 1;
  if (pureReady === 0) {
    if (emitted !== 1) {
      throw new Error("live arm without interior captures must keep the host edge");
    }
    assertTimerPlanZero(result, "on the live host arm (pureReady=0)");
    timer98dba0LiveHostCases += 1;
    return;
  }
  /* ABI v70 pure arm: host edge DROPPED, plan published. Expected values are
     recomputed HERE from the raw runtime inputs via the harness transcription.

     ABI v76: when the host vouched for a THIS-boundary mt[624]+mti capture
     (mtReady) and the useCrtRand low byte is clear, the draw is computed
     IN-MODULE on the scratch — the oracle law is applied HERE to the shared
     harness array (advancing it in place, mirroring what the host applies to
     guest RAM), and the oracle value REPLACES the host-supplied sample in the
     harness transcription. The shared-array advance also chains a second
     timer boundary within the same case (the v58+ loop-back) exactly the way
     the PE's guest-RAM mt[] would. The Wasm scratch must then equal the
     advanced array and the events must carry the new index; both are pinned
     below. A set low byte or missing state keeps the v70 host-drawn arm
     (PE 0x006eef91 takes CRT rand() and does NOT touch mt[]). */
  if (emitted !== 0) {
    throw new Error("pure arm must drop the timer host edge");
  }
  const useCrt = (runtimeInputs.frameOpaque98dba0TimerUseCrtRand ?? 0) >>> 0;
  const mtReady = (runtimeInputs.frameOpaque98dba0TimerMtReady ?? 0) >>> 0;
  const mtState = runtimeInputs.genrandState;
  const mtArmActive =
    mtReady !== 0 &&
    (useCrt & 0xff) === 0 &&
    mtState != null &&
    mtState.length >= GENRAND_STATE_WORDS;
  let timerMtStep = null;
  if (mtArmActive) {
    /* The oracle draw on the SHARED array: mutates it in place (this is the
       harness mirroring the host's guest-RAM write-back) and yields the
       tempered value + post-draw index the PE's single 0x0098de79 call
       produces. */
    timerMtStep = roomGenrandNext(mtState, (runtimeInputs.frameOpaque98dba0TimerMtiIn ?? 0) | 0);
    runtimeInputs.frameOpaque98dba0TimerMtiIn = timerMtStep.indexOut | 0;
  }
  const effectiveSample = timerMtStep ? (timerMtStep.value >>> 0) : (runtimeInputs.frameOpaque98dba0TimerSample ?? 0);
  const timerAfter = ((raw | 0) - 1) | 0;
  const thetaBits = harnessTimerThetaBits(effectiveSample);
  const magBits = harnessTimerMagBits(timerAfter);
  const cosBits = harnessTimerNarrowBits(
    runtimeInputs.frameOpaque98dba0TimerCosBitsLo ?? 0,
    runtimeInputs.frameOpaque98dba0TimerCosBitsHi ?? 0,
  );
  const sinBits = harnessTimerNarrowBits(
    runtimeInputs.frameOpaque98dba0TimerSinBitsLo ?? 0,
    runtimeInputs.frameOpaque98dba0TimerSinBitsHi ?? 0,
  );
  const xBits = harnessTimerAxisBits(
    cosBits, magBits, runtimeInputs.frameOpaque98dba0TimerX264ecBits ?? 0);
  const yBits = harnessTimerAxisBits(
    sinBits, magBits, runtimeInputs.frameOpaque98dba0TimerY264f0Bits ?? 0);
  const mtAdvanced = (useCrt & 0xff) === 0 ? 1 : 0;
  if (result.events.frameOpaque98dba0TimerPlanApplied !== 1) {
    throw new Error("pure arm must publish planApplied = 1");
  }
  if (result.events.frameOpaque98dba0TimerAfter !== timerAfter) {
    throw new Error(
      `pure arm timerAfter ${result.events.frameOpaque98dba0TimerAfter} != PE dec ${timerAfter}`,
    );
  }
  if ((result.events.frameOpaque98dba0TimerThetaBits >>> 0) !== (thetaBits >>> 0)) {
    throw new Error(
      `pure arm theta 0x${(result.events.frameOpaque98dba0TimerThetaBits >>> 0).toString(16)} ` +
        `!= harness 0x${(thetaBits >>> 0).toString(16)}`,
    );
  }
  if ((result.events.frameOpaque98dba0TimerXBits >>> 0) !== (xBits >>> 0)) {
    throw new Error(
      `pure arm x store 0x${(result.events.frameOpaque98dba0TimerXBits >>> 0).toString(16)} ` +
        `!= harness 0x${(xBits >>> 0).toString(16)} (cos lane)`,
    );
  }
  if ((result.events.frameOpaque98dba0TimerYBits >>> 0) !== (yBits >>> 0)) {
    throw new Error(
      `pure arm y store 0x${(result.events.frameOpaque98dba0TimerYBits >>> 0).toString(16)} ` +
        `!= harness 0x${(yBits >>> 0).toString(16)} (sin lane)`,
    );
  }
  if (result.events.frameOpaque98dba0TimerMtAdvanced !== mtAdvanced) {
    throw new Error(
      `pure arm mtAdvanced ${result.events.frameOpaque98dba0TimerMtAdvanced} != low-byte verdict ${mtAdvanced}`,
    );
  }
  if (timerMtStep !== null) {
    /* The Wasm module drew on the primed scratch; verify the full post-draw
       state word-for-word and the index in both the scratch and the events. */
    const actualState = Array.from(
      new Uint32Array(wasm.memory.buffer, genrandStateAddress(), GENRAND_STATE_WORDS),
    );
    for (let i = 0; i < GENRAND_STATE_WORDS; i += 1) {
      if (actualState[i] !== (mtState[i] >>> 0)) {
        throw new Error(
          `timer mt draw: scratch word ${i} mismatch at case pure arm: ` +
            `${actualState[i]} !== ${mtState[i] >>> 0}`,
        );
      }
    }
    const actualOut = new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0];
    if ((actualOut | 0) !== (timerMtStep.indexOut | 0)) {
      throw new Error(
        `timer mt draw: scratch index-out ${actualOut} !== oracle ${timerMtStep.indexOut}`,
      );
    }
    if ((result.events.frameOpaque98dba0TimerMtIndexOut | 0) !== (timerMtStep.indexOut | 0)) {
      throw new Error(
        `timer mt draw: events index-out ${result.events.frameOpaque98dba0TimerMtIndexOut} ` +
          `!== oracle ${timerMtStep.indexOut}`,
      );
    }
    timer98dba0MtInModuleCases += 1;
  } else {
    /* The arm did not draw in-module: the scratch's index cell must be
       EXACTLY what it was before this boundary (the module never touches the
       scratch when the v70 host-drawn plan runs), and the events must NOT
       carry an index. */
    const actualOut = new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0];
    if ((actualOut | 0) !== timerMtIndexOutSnapshot) {
      throw new Error(
        `timer non-mt arm must not touch the genrand scratch: ` +
          `index-out ${actualOut} !== pre-boundary ${timerMtIndexOutSnapshot}`,
      );
    }
    if ((result.events.frameOpaque98dba0TimerMtIndexOut | 0) !== 0) {
      throw new Error("non-mt timer arm must publish index-out 0");
    }
    if (mtAdvanced === 0) timer98dba0MtCrtFallbackCases += 1;
    else timer98dba0MtNoStateFallbackCases += 1;
  }
  timer98dba0PureAppliedCases += 1;
  if (mtAdvanced === 0) timer98dba0PureCrtCases += 1;
  if (useCrt > 0xff && (useCrt & 0xff) === 0) timer98dba0PureWideByteCases += 1;
}
/* Classify one walk-site resume. The typed carrier must describe exactly what
   PE 0x0098de45 pushed (1) and what 0x00840b9c therefore stores into
   Game+0x216e9 (0); the ready side must additionally leave the tracked sparse
   Game+0x216e8 set, which is the store at 0x00840bd7. */
function countHostFun746560Walk(result, runtimeInputs, pre746560, preTextOut) {
  if (result.events.opaqueCall00746560 === pre746560) return;
  if (result.events.hostFun746560Site !== HOST_FUN_746560_SITE.WALK_COUNTER) {
    throw new Error("walk-counter emission did not tag the typed 0x00746560 site");
  }
  if (result.events.hostFun746560Param !== 1 || result.events.hostFun746560Byte216e9 !== 0) {
    throw new Error("walk-counter emission must push 1 and store 0 into Game+0x216e9");
  }
  /* `bl != 0` is required to reach 0x0098de38 and `bl == 0` to reach the
     0x0098df47 gate, so an emission can never be accompanied by a text_out on
     the same invocation. Assert that exclusivity rather than assume it. */
  if (result.events.hudMessageTextOut !== preTextOut) {
    throw new Error("0x00746560 emission and the 0x0098df47 gate must be exclusive");
  }
  if (result.events.hostFun746560DeathmatchSuffix !== 0) hostFun746560SuffixCases += 1;
  if (((runtimeInputs.hostFun746560PostReady ?? 0) >>> 0) === 0) {
    hostFun746560WalkLegacyCases += 1;
    return;
  }
  hostFun746560WalkPostCases += 1;
  if (result.state.hudMessageFlag8 !== 1) {
    throw new Error("0x00840bd7 must leave Game+0x216e8 = 1 on the write path");
  }
}
let resumeCases = 0;
let gate1b83cResumeCases = 0;
let resume98dba0Cases = 0;
let genericPromptResumeCases = 0;
let itemOverlayResumeCases = 0;
let itemOverlayPureStayCases = 0;
let itemOverlayPureFlipCases = 0;
let itemOverlayHostCases = 0;
let state24eccPureSkipCases = 0;
let state24eccHostCases = 0;
let state24eccState2Cases = 0;
let state24eccState2ChangedCases = 0;
let timedTransitionCases = 0;
/* ABI v65: VA 0x00746560 typed carrier coverage. */
let hostFun746560WalkPostCases = 0;
let hostFun746560WalkLegacyCases = 0;
let hostFun746560CleanupPostCases = 0;
let hostFun746560SuffixCases = 0;
/* ABI v66: FUN_0098dba0 timer-block gate coverage. */
let timer98dba0SkipCases = 0;
let timer98dba0LiveCases = 0;
let timer98dba0NegativeSkipCases = 0;
let timer98dba0LegacyCases = 0;
/* ABI v70: timer-interior arms. */
let timer98dba0PureAppliedCases = 0;
let timer98dba0PureCrtCases = 0;
let timer98dba0PureWideByteCases = 0;
let timer98dba0PureSkipArmCases = 0;
let timer98dba0LiveHostCases = 0;
/* ABI v76: timer-interior MT19937 wire arms. */
let timer98dba0MtInModuleCases = 0;
let timer98dba0MtCrtFallbackCases = 0;
let timer98dba0MtNoStateFallbackCases = 0;

let menuGateCases = 0;
let menuOpenResumeCases = 0;
let menuUpdateResumeCases = 0;
let frameAuxResumeCases = 0;
/* ABI v95 (record idx 10 R4 equal-flags capture): non-empty walk lanes. */
let add0EqualFlagsTrueCases = 0;   /* probe TRUE -> interior host */
let add0EqualFlagsPureCases = 0;   /* probe FALSE -> pure clear */
let add0EqualFlagsOverCapCases = 0; /* ready=1 + count > cap -> v91 path */
let add0EqualFlagsLogCases = 0;    /* field4==0 log arm with flags blob */
let stageTransitionResumeCases = 0;
let roomTransitionResumeCases = 0;
let roomUpdatePrefixB1ResumeCases = 0;
let roomUpdatePrefixB2ResumeCases = 0;
let roomUpdatePrefixResumeCases = 0;
/* ABI v95 (record idx 16): B8 grid-capture blob differential arms. */
let b8BlobSeededCases = 0;      /* blob path active, scratch seeded */
let b8BlobPureCases = 0;        /* pure grid step replaced the host */
let b8BlobWideReadyCases = 0;   /* ready >= 0x100 still blob path */
let b8B8OverCapCases = 0;       /* cells > 448 -> host fallback */
let b8B8NoBlobCases = 0;        /* gate open, no usable blob -> host */
let b8B8GateMissCases = 0;      /* gate closed -> nothing */
/* ABI v110 (record-16 eval): deterministic theorem-arm reach counters. */
const dtB8ArmCases = {}
/* ABI v95 (record idx 14): B2 differential arms. */
let b2SeededCases = 0;          /* ready path, spawn-in scratch seeded */
let b2PureCases = 0;            /* out-scratch + carriers matched the oracle */
/* ABI v95 (record idx 36): water-b16 823540-wire differential arms. */
let waterB16WireCases = 0;      /* blob ready + 823540 gate open -> pure chain */
let waterB16NoWireCases = 0;    /* wire not run (no blob / gate closed) */
let waterB16Gate0Cases = 0;     /* chain ran, spray gate=0 (cur snap) */
let waterB16Gate1Cases = 0;     /* chain ran, spray gate=1 (goal deltas) */
/* ABI v95 (record idx 22): engine-player BODY blob differential arms. */
let engineBody173LaneOnCases = 0;    /* per-entry 173 lane ran in-module */
let engineBody173LaneCoarseCases = 0; /* coarse v36 gate arm (ready=0) */
let engineBody173OverCapCases = 0;    /* blob path, count > cap -> residual */
let engineBody173NoBlobCases = 0;     /* blob absent -> full residual */
/* ABI v107 (record idx 39 mid-restock): desc-pack differential arms.
   Guards: midRestockPureLane>=1, midRestockMonoLane>=1,
   midRestockFatalDropLane>=1 — the pure walk and the typed drop must be
   exercised on the Wasm side or the whitelist is neutered again. */
let midRestockPureLaneCases = 0;      /* outer open + desc ready + inner open -> PURE_COMPLETE */
let midRestockMonoLaneCases = 0;      /* outer open + desc_ready=0 -> MONOLITHIC coarse event */
let midRestockFatalDropLaneCases = 0; /* outer open + ready + inner open + seed==0 -> typed drop */
let midRestockSkipLaneCases = 0;      /* outer gate closed / inner closed / gate miss */
/* ABI v107 (wave-29 merge REBIND, C1): the 36 rebound lanes must REACH
   the module and FLIP a law (anti-neuter guards mirroring the S5
   mid-restock guard). */
let rebind956110LaneOnCases = 0;   /* 956110-ready rows delivered */
let rebind956110ProbeCases = 0;    /* module-side probe_pure proof emitted */
let rebind92f1c0LaneOnCases = 0;   /* 92f1c0-ready rows delivered (limit/field14 drawn) */
let rebind92f1c0PureTailCases = 0; /* case-2 pure tail (counter<limit, field14 low 0) */
let rebindAbPackLaneOnCases = 0;   /* ab-pack-ready rows delivered */
let rebindAbPackCases = 0;         /* A/B pair typed advance/rewind events fired */
let rebindTcsStatsLaneOnCases = 0; /* tcsStatsVecReady rows delivered */
let rebindTcsStatsCases = 0;       /* tcsStats growth sim emitted the typed events */
/* The 10 capture-only events (no wasm words — typed-host counters): the
   model EMITS the roomTriggerOutput* family; the corpus must exercise the
   wire or the capture-only comparison is a silent no-op. */
let captureOnlyTriggerEmission = 0;
/* ABI v107 (wave-29 merge, C1 §2): the 10 capture-only events have NO
   words in the module events struct and NO EVENTS_LAYOUT entries (typed-
   host counters: the savestate×6 leaf counters + the record-18 body wire
   roomTriggerOutput×4 — the MODEL emits the latter from the captured
   walk/scan/callback lanes). They cannot enter the EVENTS_LAYOUT
   differential (the module never writes them), so the merge pins them
   here as the explicit capture-only set: the in-loop census above proves
   the corpus exercises the model arms (defect-class-6 guard). */
const CAPTURE_ONLY_EVENTS = Object.freeze([
  "savestateHostCalls", "savestateVirtualCalls", "savestateBadgesGrow",
  "savestateBadgesCopy", "savestatePtrvecReserve", "savestateSectionCalls",
  "roomTriggerOutputWalkDispatches", "roomTriggerOutputScanMatches",
  "roomTriggerOutputCallbacks", "opaqueRoomTriggerOutputBody",
]);
let roomUpdateClearResumeCases = 0;
let roomClearNestedResumeCases = 0;
let roomUpdateHeadResumeCases = 0;
let frameManagerHandoffs = 0;
let listSweepBlobCases = 0;
let listSweepEvictionCases = 0;
let listSweepPureCompleteCases = 0;
/* ABI v83: record-0 StatHUD tail countdown lane arms. */
let hudStatCountdownAppliedCases = 0;
let hudStatCountdownOffGateCases = 0;     /* stat gate closed */
let hudStatCountdownOffReadyCases = 0;    /* host did not capture */
let hudStatCountdownOffWalkCases = 0;     /* player vector non-empty */
let hudStatCountdownDoubleTickCases = 0;
let expectedCountdown = null;
/* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane arms (PE 0x84c170..0x84c2b9
   with the walk blob capture present). walkOffCount0 is the walk-empty arm —
   the v83 countdown lane runs instead. walkOffCountCap is the count > 8
   host residual. */
let hudStatWalkLaneOnCases = 0;
let hudStatWalkDoubleTickCases = 0;
let hudStatWalkOffGateCases = 0;      /* stat gate byte == 0 */
let hudStatWalkOffReadyCases = 0;     /* walk blob not captured */
let hudStatWalkOffCount0Cases = 0;    /* player vector empty -> v83 countdown lane */
let hudStatWalkOffCountCapCases = 0;  /* count > 8 -> host residual */
/* ABI v84 walk scratch helpers (amended slot model). The oracle consumes a
   JS scratch shaped like the contract's scratchState {ownerByte, slotPtr0,
   slotPtr1, slots[20]×{current,delta,prev,threshold,timer}} where slot index
   s = g*10+k (row g, tween k-slot); the wasm publishes 83 u32 words:
   +0 ownerByte, +1 slotPtr0, +2 slotPtr1, then +3 + (g*10+k)*4 + f for the
   20 slots × {current,delta,prev,timer} (threshold stays host-owned). Seed:
   first-call pre-seed from runtime inputs (owner booled as the PE `setne`
   store, ptrs/current/prev/threshold/timer from inputs, delta = 0). */
function walkScratchSlots(scratch) {
  const raw = scratch?.slots;
  if (Array.isArray(raw)) {
    /* flat 20 (index g*10+k) */
    if (raw.length >= 20 && !Array.isArray(raw[0])) return raw;
    /* nested rows[2] x ks[10] */
    const flat = [];
    for (let g = 0; g < 2; g += 1) {
      for (let k = 0; k < 10; k += 1) flat.push(raw[g]?.[k] ?? {});
    }
    return flat;
  }
  return [];
}
function walkScratchSeed(runtimeInputs) {
  const slots = [];
  for (let g = 0; g < 2; g += 1) {
    for (let k = 0; k < 10; k += 1) {
      slots.push({
        current: runtimeInputs[`hudStatSlot${g}${k}Current`] ?? 0,
        delta: 0,
        prev: runtimeInputs[`hudStatSlot${g}${k}Prev`] ?? 0,
        threshold: runtimeInputs[`hudStatSlot${g}${k}Threshold`] ?? 0,
        timer: (runtimeInputs[`hudStatSlot${g}${k}Timer`] ?? 0) | 0,
      });
    }
  }
  return {
    ownerByte: (runtimeInputs.hudStatOwnerByte ?? 0) !== 0 ? 1 : 0,
    slotPtr0: (runtimeInputs.hudStatSlotPtr0 ?? 0) >>> 0,
    slotPtr1: (runtimeInputs.hudStatSlotPtr1 ?? 0) >>> 0,
    slots,
  };
}
function f32Bits(value) {
  const f = new Float32Array(1);
  f[0] = value;
  return new Uint32Array(f.buffer)[0];
}
function bitsToF32(bits) {
  const u = new Uint32Array(1);
  u[0] = bits >>> 0;
  return new Float32Array(u.buffer)[0];
}
function walkScratchToWords(scratch) {
  const slots = walkScratchSlots(scratch);
  const words = [
    (scratch.ownerByte ?? 0) >>> 0,
    (scratch.slotPtr0 ?? 0) >>> 0,
    (scratch.slotPtr1 ?? 0) >>> 0,
  ];
  for (let s = 0; s < 20; s += 1) {
    const slot = slots[s] ?? {};
    words.push(
      f32Bits(slot.current),
      f32Bits(slot.delta),
      f32Bits(slot.prev),
      (slot.timer ?? 0) | 0,
    );
  }
  return words;
}
let globalTree4aba0PureCases = 0;
let globalTree4aba0EmptyRangeCases = 0;
let globalTree4aba0FallbackCases = 0;
let globalTree4aba0ZeroByteGateCase = 0;
let globalTree4aba0OneByteGateCase = 0;
let luaFrameUnrefSkipCases = 0;
let sfxStopPureSkipCases = 0;
let sfxUpdatePureSkipCases = 0;
let opaque9a2b30OnceCases = 0;
let opaque9a2b30TwiceCases = 0;
let tailWriteBytePins = 0;
let tailWriteModePins = 0;
let sfxStopHostCases = 0;
let sfxStopFallbackCases = 0;
let sfxStopFoldCases = 0;
let sfxStopFoldFallbackCases = 0;
let sfxUpdateHostCases = 0;
let sfxUpdateFallbackCases = 0;
let sfxPlayPureSkipCases = 0;
let sfxPlayHostCases = 0;
let sfxPlayFallbackCases = 0;
let luaFrameUnrefActiveCases = 0;
let luaFrameUnrefFallbackCases = 0;
let playerFlag410PureCases = 0;
let playerFlag410EmptyCases = 0;
let playerFlag410HostCases = 0;
let opaque0092e300GateOpenCases = 0;
let opaque0092e300GateClosedCases = 0;
let opaque0092e300V85DropCases = 0;
let opaque0092f1c0HostCases = 0;
let opaque0092f1c0DropCases = 0;
let opaque0092f1c0Ready0Cases = 0;
let opaque008318a0HostCases = 0;
let opaque008318a0DropCases = 0;
let opaque008318a0Ready0Cases = 0;
/* ABI v142 (record idx4): rt_band_pop carrier arm counters — the
   defect-class-6 guard: a whitelist/whitelist-lane regression that
   silently zeroes the composite carrier must fail the run. */
let rtBandPopFiredCases = 0;
let rtBandPopDepthMutatedCases = 0;
let rtBandPopLatchClearedCases = 0;
let rtBandPopParamSel6Cases = 0;
let rtBandPopParamSel1Cases = 0;
let opaque857450GateOpenCases = 0;
let opaque857450GateClosedCases = 0;
let rankDisplayFoldCases = 0;
let menuAuxBlobCases = 0;
let menuAuxFallbackCases = 0;
let menuAuxPayloadCases = 0;
let menuAuxBorrowCases = 0;

let menuAuxSentinelFallbackCases = 0;
let menuAuxSentinelPureCases = 0;
let genrandPureCases = 0;
let genrandHostCases = 0;
let genrandCrtCases = 0;
let genrandReloadCases = 0;
/* ABI v95 (record idx 34): per-loop typed CREATE-arm plan scratch checks. */
let ambient824a70CreateTypedCases = 0;

let pass4257b0ResumeCases = 0;
let pass4257b0EmptyPostCases = 0;
let pass4257b0LivePostCases = 0;
/* ABI v71 blob arms. */
let fo4257b0BlobCases = 0;
let fo4257b0FallbackCases = 0;
let fo4257b0PassAPureCases = 0;
let fo4257b0NoRecaptureCases = 0;
let fo4257b0InsertCases = 0;
let fo4257b0GrowCases = 0;
let fo4257b0MovedBaseCases = 0;
let fo4257b0MismatchCases = 0;
let fo4257b0NegativeDeltaCases = 0;
let fo4257b0EmptyCtrCases = 0;
let fo4257b0NonEmptyCtrCases = 0;
let fo4257b0StoreCases = 0;
/* ABI v64: FX-lerp gate lane (PE 0x006fae80) coverage. */
let fxLerpGateOpenCases = 0;
let fxLerpGateClosedCases = 0;
/* ABI v69: PM0/PM1 death-wire arms. Every arm must be reached. */
let deathGateClosedCases = 0;
let deathCount0DropCases = 0;
let deathMonolithicCases = 0;
let deathPureDropCases = 0;
let deathWalkCases = 0;
let deathWideByteCases = 0;

let blobLaneCases = 0;
let latchSetLaneCases = 0;
let latchMismatchCases = 0;
let flagSetLaneCases = 0;
let flagClearLaneCases = 0;
/* ANM2 name lanes must arrive as flattened cells (the corpus holds
   string arrays; only the flattened form matches the runtime layout's
   bytes lane). Coerce at the runtime write regardless of input shape. */

/* ---- Memory-trim (C): hoisted typed-array views + fast struct writes ----
   The module is built with -sALLOW_MEMORY_GROWTH=0 (fixed 4 MiB), so the
   buffer never detaches and the views can be created once instead of a
   fresh DataView per case. fastWriteStruct mirrors writeField exactly:
   i32 `| 0`, u32 `>>> 0`, u8 `& 0xff`, u16 `& 0xffff`, f32 via Float32Array
   store (identical IEEE-754 single conversion to setFloat32 — including
   -0/NaN passthrough), sized bytes lanes copied in place. */
const view = new DataView(wasm.memory.buffer);
const memU8 = new Uint8Array(wasm.memory.buffer);
const memU32 = new Uint32Array(wasm.memory.buffer);
const memU16 = new Uint16Array(wasm.memory.buffer);
const memF32 = new Float32Array(wasm.memory.buffer);
const STATE_ENTRIES = Object.entries(STATE_LAYOUT);
const CONSTANTS_ENTRIES = Object.entries(CONSTANTS_LAYOUT);
function fastWriteStruct(base, entries, value) {
  for (let i = 0; i < entries.length; i += 1) {
    const [name, field] = entries[i];
    const v = value[name];
    const off = base + field.offset;
    const t = field.type;
    if (t === "f32") memF32[off >> 2] = v;
    else if (t === "i32") memU32[off >> 2] = v | 0;
    else if (t === "u8") memU8[off] = v & 0xff;
    else if (t === "u16") memU16[off >> 1] = v & 0xffff;
    else if (t === "bytes") {
      if (v != null && typeof v.length === "number" && field.size) {
        const n = Math.min(field.size, v.length);
        for (let j = 0; j < n; j += 1) memU8[off + j] = v[j] & 0xff;
      }
    } else memU32[off >> 2] = v >>> 0;
  }
}

/* ---- Memory-trim (A): pooled flat runtime-inputs staging -----------------
   The runtime struct is the dense RUNTIME_INPUTS_LAYOUT lane table (1935
   fields, 11068 bytes). Instead of normalizeRuntimeInputsForLayout — which
   builds a second 1935-key object per case (packed zeros + two spreads) —
   the flat lanes are staged into a pooled buffer and copied into the struct
   with one memcpy. The pool is zeroed per case, reproducing
   reset_scratch's `scratch_runtime_inputs = {}` for every lane a case
   leaves absent, so the module sees byte-identical inputs. */
const RT_END = (() => {
  let end = 0;
  for (const field of Object.values(RUNTIME_INPUTS_LAYOUT)) {
    const stop = field.offset + (field.size ?? 4);
    if (stop > end) end = stop;
  }
  return end;
})();
const rtPool = new Uint32Array(Math.ceil(RT_END / 4));
const rtPool8 = new Uint8Array(rtPool.buffer);
const rtPool16 = new Uint16Array(rtPool.buffer);
const rtPoolF = new Float32Array(rtPool.buffer);
const rtBase = runtimeInputsAddress();
const RT_FIELD = {};
for (const [name, field] of Object.entries(RUNTIME_INPUTS_LAYOUT)) RT_FIELD[name] = field;
/* Per-field write plan. Plain lanes read runtimeInputs[name]; doorSlot and
   menuAuxTree lanes are expanded from the arrayed corpus forms (the only
   place those reach the module — normalize did the same expansion, with the
   menuAuxTreeIsnil default 1). */
const RT_PLAN = Object.entries(RUNTIME_INPUTS_LAYOUT).map(([name, field]) => {
  let kind = 0;
  let index = -1;
  let sub = null;
  const door = /^doorSlot(\d)(Present|Field3a0|Field8|FieldC)$/.exec(name);
  if (door) {
    kind = 1;
    index = Number(door[1]);
    sub = door[2];
  } else {
    const tree = /^menuAuxTree(Left|Right|Flag1c|Isnil|PayloadPresent|PayloadSize)(\d+)$/.exec(name);
    if (tree) {
      kind = 2;
      index = Number(tree[2]);
      sub = tree[1];
    }
  }
  return { name, field, kind, index, sub };
});
function storeRtLane(field, value) {
  const off = field.offset;
  switch (field.type) {
    case "u32": rtPool[off >> 2] = value >>> 0; break;
    case "i32": rtPool[off >> 2] = value | 0; break;
    case "u8": rtPool8[off] = value & 0xff; break;
    case "u16": rtPool16[off >> 1] = value & 0xffff; break;
    default: rtPoolF[off >> 2] = value; break; /* f32 */
  }
}

/* ---- Memory-trim (B): blob-pack lanes -------------------------------------
   The flat blob packs reach ONLY the runtime struct (the model consumes the
   arrayed corpus forms; the verifier's walk oracle reads the hudStatSlot
   lanes through `?? 0`), so they are staged straight into the pooled buffer
   here instead of per-case IIFE objects spread into the literal — only
   lanes whose corpus value differs from the 0 default are stored, and the
   per-case fill covers the rest. The 4257b0 pack is the exception: the
   verifier compares its scalar lanes directly (PostListBegin !== ListBegin),
   so it stays a pooled dense object spread into the literal. */
const FO4257B0_BLOB_KEYS = [
  "frameOpaque4257b0BlobReady", "frameOpaque4257b0ListBegin",
  "frameOpaque4257b0ListEnd", "frameOpaque4257b0ListCap",
  "frameOpaque4257b0PostListBegin", "frameOpaque4257b0PostListEnd",
  "frameOpaque4257b0IdvecBegin", "frameOpaque4257b0IdvecEnd",
  "frameOpaque4257b0CtrBegin", "frameOpaque4257b0CtrEnd",
  "frameOpaque4257b0InitialByte13",
];
for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_PLAYERS; i += 1) {
  for (const stem of ["PPtr", "PId1618", "P161c", "QPtr", "Q161c",
                      "QId1618", "QqPtr", "Qq161c", "PChar13c0"]) {
    FO4257B0_BLOB_KEYS.push(`frameOpaque4257b0${stem}${i}`);
  }
}
for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_ELEMS; i += 1) {
  for (const stem of ["ElemId", "ElemSubPtr", "ElemSubLo", "ElemSubHi"]) {
    FO4257B0_BLOB_KEYS.push(`frameOpaque4257b0${stem}${i}`);
  }
}
for (let i = 0; i < FRAME_OPAQUE_4257B0_MAX_LIST; i += 1) {
  for (const stem of ["ListLo", "ListHi", "ListSlot8"]) {
    FO4257B0_BLOB_KEYS.push(`frameOpaque4257b0${stem}${i}`);
  }
}
const fo4257b0BlobPool = {};
for (const key of FO4257B0_BLOB_KEYS) fo4257b0BlobPool[key] = 0;
function syncFo4257b0Blob(corpusRow) {
  for (let i = 0; i < FO4257B0_BLOB_KEYS.length; i += 1) {
    const key = FO4257B0_BLOB_KEYS[i];
    fo4257b0BlobPool[key] = corpusRow[key] ?? 0;
  }
  return fo4257b0BlobPool;
}

const HUD_STAT_SLOT_KEYS = [];
for (let g = 0; g < 2; g += 1) {
  for (let k = 0; k < 10; k += 1) {
    for (const sub of ["Current", "Prev", "Threshold", "Timer"]) {
      HUD_STAT_SLOT_KEYS.push(`hudStatSlot${g}${k}${sub}`);
    }
  }
}
const hudStatSlotPool = {};
for (const key of HUD_STAT_SLOT_KEYS) hudStatSlotPool[key] = 0;
function syncHudStatSlot(corpusRow) {
  for (let i = 0; i < HUD_STAT_SLOT_KEYS.length; i += 1) {
    const key = HUD_STAT_SLOT_KEYS[i];
    hudStatSlotPool[key] = corpusRow[key] ?? 0;
  }
  return hudStatSlotPool;
}
const WALK_PLAYER_STEMS = [
  "Ptr", "PredA", "F2c", "F3bc", "F13c0", "F172", "OtherPtr",
  "Other161c", "F161c", "F328", "F1568", "F1460", "F1470", "F1480",
  "F1464", "F156c",
];
const WALK_PLAYER_FLOAT_STEMS = new Set([
  "F1568", "F1460", "F1470", "F1480", "F1464", "F156c"]);
const HUD_STAT_PLAYER_KEYS = [];
for (let i = 0; i < 8; i += 1) {
  for (const stem of WALK_PLAYER_STEMS) HUD_STAT_PLAYER_KEYS.push(`hudStatPlayer${i}${stem}`);
}
const hudStatPlayerPool = {};
for (const key of HUD_STAT_PLAYER_KEYS) hudStatPlayerPool[key] = 0;
function syncHudStatPlayer(corpusRow) {
  for (let i = 0; i < HUD_STAT_PLAYER_KEYS.length; i += 1) {
    const key = HUD_STAT_PLAYER_KEYS[i];
    const value = corpusRow[key];
    if (value === undefined || value === null) {
      hudStatPlayerPool[key] = 0;
      continue;
    }
    const stem = key.slice(14);
    hudStatPlayerPool[key] = WALK_PLAYER_FLOAT_STEMS.has(stem)
      ? f32Bits(Math.fround(value))
      : (value >>> 0);
  }
  return hudStatPlayerPool;
}
const b2PoolCountsLanes = Array.from({ length: 31 }, (_, i) => RT_FIELD[`b2PoolCounts${i}`]);
const HUD_STAT_COUNTDOWN_KEYS = Array.from(
  { length: HUD_STAT_COUNTDOWN_COUNT }, (_, i) => `hudStatCountdown${i}`);
const hudStatCountdownPool = {};
for (const key of HUD_STAT_COUNTDOWN_KEYS) hudStatCountdownPool[key] = 0;
function syncHudStatCountdown(corpusRow) {
  for (let i = 0; i < HUD_STAT_COUNTDOWN_KEYS.length; i += 1) {
    const key = HUD_STAT_COUNTDOWN_KEYS[i];
    hudStatCountdownPool[key] = corpusRow[key] ?? 0;
  }
  return hudStatCountdownPool;
}
const hudStatSlotLanes = (() => {
  const a = [];
  for (let g = 0; g < 2; g += 1) {
    for (let k = 0; k < 10; k += 1) {
      a.push([
        RT_FIELD[`hudStatSlot${g}${k}Current`],
        RT_FIELD[`hudStatSlot${g}${k}Prev`],
        RT_FIELD[`hudStatSlot${g}${k}Threshold`],
        RT_FIELD[`hudStatSlot${g}${k}Timer`],
      ]);
    }
  }
  return a;
})();
const HUD_STAT_SLOT_SUBS = ["Current", "Prev", "Threshold", "Timer"];
const HUD_STAT_PLAYER_STEMS = [
  "Ptr", "PredA", "F2c", "F3bc", "F13c0", "F172", "OtherPtr",
  "Other161c", "F161c", "F328", "F1568", "F1460", "F1470", "F1480",
  "F1464", "F156c",
];
const HUD_STAT_PLAYER_FLOAT_STEMS = new Set([
  "F1568", "F1460", "F1470", "F1480", "F1464", "F156c"]);
const hudStatPlayerLanes = Array.from({ length: 8 }, (_, i) =>
  HUD_STAT_PLAYER_STEMS.map((stem) => RT_FIELD[`hudStatPlayer${i}${stem}`]));
const PLAYER_HUD_SLOT_STEMS = [
  "TwinPtr", "PlayerType", "Field3bc", "HeartsSum", "Flag1519", "TrampSuppress",
  "Active0", "Active1", "Active2", "Active3", "Float6b8", "TailChars", "TailPred",
];
const playerHudSlotLanes = Array.from({ length: PLAYER_HUD_MAX_SLOTS }, (_, i) =>
  PLAYER_HUD_SLOT_STEMS.map((stem) => RT_FIELD[`playerHudSlot${i}${stem}`]));
const equalFlagsLanes = Array.from(
  { length: 64 }, (_, i) => RT_FIELD[`frameOpaque4212c0Add0EqualFlags${i}`]);
const pmIntensityLanes = Array.from({ length: 8 }, (_, i) => [
  RT_FIELD[`pmIntensityRaw${i}`], RT_FIELD[`pmIntensityFlags${i}`], RT_FIELD[`pmIntensityDead${i}`]]);
const PM_INTENSITY_SUBS = ["Raw", "Flags", "Dead"];
const SFX_STOP_VOICE_FIELDS = [
  ["ChannelNull", "channelNull"], ["Pending_09", "pending09"],
  ["ProbeFirst", "probeFirst"], ["ProbeSecond", "probeSecond"],
  ["ChannelNullReload", "channelNullReload"], ["VoicesReloaded", "voicesReloaded"],
];
const sfxStopVoiceLanes = Array.from({ length: 32 }, (_, i) =>
  SFX_STOP_VOICE_FIELDS.map(([stem]) => RT_FIELD[`sfxStopVoice${i}${stem}`]));
const PM_DEATH_STEMS = ["Anim7c", "TwinAnim7c", "Dead173", "Anim8c", "TwinNull", "TwinAnim8c"];
const pmDeathLanes = Array.from({ length: 8 }, (_, i) =>
  PM_DEATH_STEMS.map((stem) => RT_FIELD[`pmDeath${stem}${i}`]));
function packLane(field, value) {
  if (value == null) return;
  if (field.type === "f32" || value !== 0) storeRtLane(field, value);
}
function writeRuntimeInputsPacks(row) {
  /* b2PoolCounts: 31 x u16 (Game+0x1af30); the corpus row carries the
     array form for the model oracle. */
  const counts = Array.isArray(row.b2PoolCounts) ? row.b2PoolCounts : [];
  for (let i = 0; i < 31; i += 1) {
    const v = counts[i];
    if (v) storeRtLane(b2PoolCountsLanes[i], v);
  }
  /* hudStatSlot: 2 groups x 10 slots x {current,prev,threshold,timer}. */
  for (let g = 0; g < 2; g += 1) {
    for (let k = 0; k < 10; k += 1) {
      const lanes = hudStatSlotLanes[g * 10 + k];
      for (let s = 0; s < 4; s += 1) {
        const v = row[`hudStatSlot${g}${k}${HUD_STAT_SLOT_SUBS[s]}`];
        if (v) storeRtLane(lanes[s], v);
      }
    }
  }
  /* hudStatPlayer: 8 entries x 16 lanes; the six float-pair lanes ship as
     raw f32 BITS (the PE reads entry+0x1460 etc. via movss). */
  for (let i = 0; i < 8; i += 1) {
    const lanes = hudStatPlayerLanes[i];
    for (let s = 0; s < HUD_STAT_PLAYER_STEMS.length; s += 1) {
      const stem = HUD_STAT_PLAYER_STEMS[s];
      const value = row[`hudStatPlayer${i}${stem}`];
      if (value === undefined || value === null) continue;
      const v = HUD_STAT_PLAYER_FLOAT_STEMS.has(stem)
        ? f32Bits(Math.fround(value))
        : (value >>> 0);
      if (v) storeRtLane(lanes[s], v);
    }
  }
  /* playerHudSlot: 13 lanes per slot; Float6b8 is an f32 layout lane, so
     zero lanes are still stored (they keep +0/-0 identity). */
  for (let i = 0; i < PLAYER_HUD_MAX_SLOTS; i += 1) {
    const lanes = playerHudSlotLanes[i];
    for (let s = 0; s < PLAYER_HUD_SLOT_STEMS.length; s += 1) {
      packLane(lanes[s], row[`playerHudSlot${i}${PLAYER_HUD_SLOT_STEMS[s]}`]);
    }
  }
  /* frameOpaque4212c0Add0EqualFlags: 64 x u8 per-entry equal-flag bytes. */
  const flags = Array.isArray(row.frameOpaque4212c0Add0EqualFlags)
    ? row.frameOpaque4212c0Add0EqualFlags : [];
  for (let i = 0; i < 64; i += 1) {
    const v = flags[i];
    if (v) storeRtLane(equalFlagsLanes[i], v);
  }
  /* pmIntensity: 8 x {raw, flags, dead}. */
  for (let i = 0; i < 8; i += 1) {
    const lanes = pmIntensityLanes[i];
    for (let s = 0; s < 3; s += 1) {
      const v = row[`pmIntensity${PM_INTENSITY_SUBS[s]}${i}`];
      if (v) storeRtLane(lanes[s], v);
    }
  }
  /* sfxStopVoice: up to 32 x 6 semantic lanes from the arrayed voices. */
  const voices = Array.isArray(row.sfxStopVoices) ? row.sfxStopVoices : [];
  const voiceCount = Math.min(voices.length, 32);
  for (let i = 0; i < voiceCount; i += 1) {
    const voice = voices[i] || {};
    const lanes = sfxStopVoiceLanes[i];
    for (let s = 0; s < SFX_STOP_VOICE_FIELDS.length; s += 1) {
      const v = voice[SFX_STOP_VOICE_FIELDS[s][1]];
      if (v) storeRtLane(lanes[s], v);
    }
  }
  /* pmDeath: 8 x 6 byte/word lanes. */
  for (let i = 0; i < 8; i += 1) {
    const lanes = pmDeathLanes[i];
    for (let s = 0; s < PM_DEATH_STEMS.length; s += 1) {
      const v = row[`pmDeath${PM_DEATH_STEMS[s]}${i}`];
      if (v) storeRtLane(lanes[s], v);
    }
  }
  /* ABI v96 (wave-22 merge): word-array capture lanes. The layout types
     them `bytes` (32/256/2092 B spans) but the C++ struct fields are
     uint32_t[] and the model laws index per-entry WORDS — the RT_PLAN
     bytes branch would only copy element low-bytes, so these MUST be
     staged word-wise here (runs after the RT_PLAN loop, overwriting the
     partial byte scribble). Corpus rows supply plain word arrays;
     entries beyond the drawn length stay pool-zero ("null-slot rows MUST
     be all-zero"). */
  /* record-4 per-player entry pack: 12 x 8 u32. */
  const PLAYER_ENTRY_STEMS = [
    "B173", "B1398", "B139a", "B171", "W410", "W3fc",
    "Ptr7c", "B34", "B88", "W1600", "W418", "W16c",
  ];
  for (const stem of PLAYER_ENTRY_STEMS) {
    const arr = row[`opaque8318a0PlayerEntry${stem}`];
    if (!Array.isArray(arr)) continue;
    const field = RT_FIELD[`opaque8318a0PlayerEntry${stem}`];
    for (let i = 0; i < Math.min(arr.length, ENGINE_PLAYER_MAX); i += 1) {
      /* Unconditional: the RT_PLAN bytes branch scribbles element low-bytes
         into this region BEFORE packs run, so a zero word must be rewritten
         as 0 (pool is pre-zeroed) or the scribble leaks into the struct. */
      storeRtLane({ offset: field.offset + i * 4, type: "u32" }, arr[i] >>> 0);
    }
  }
  /* record-41 b18 entity pack: types + cast results, 64 u32 each. */
  for (const stem of ["Types", "CastResults"]) {
    const arr = row[`b18Entity${stem}`];
    if (!Array.isArray(arr)) continue;
    const field = RT_FIELD[`b18Entity${stem}`];
    for (let i = 0; i < Math.min(arr.length, B18_ENTITY_MAX); i += 1) {
      storeRtLane({ offset: field.offset + i * 4, type: "u32" }, arr[i] >>> 0);
    }
  }
  /* record-12 705ee0 payload blob: 0x20b u32 (S8 store source). */
  {
    const arr = row.rewind705ee0PayloadBlob;
    if (Array.isArray(arr)) {
      const field = RT_FIELD.rewind705ee0PayloadBlob;
      for (let i = 0; i < Math.min(arr.length, 0x20b); i += 1) {
        storeRtLane({ offset: field.offset + i * 4, type: "u32" }, arr[i] >>> 0);
      }
    }
  }
}
function writeRuntimeInputsFlat(runtimeInputs, corpusRow) {
  rtPool.fill(0);
  const doorSlots = Array.isArray(runtimeInputs.doorSlots) ? runtimeInputs.doorSlots : [];
  const treeNodes = Array.isArray(runtimeInputs.menuAuxTreeNodes) ? runtimeInputs.menuAuxTreeNodes : [];
  for (let i = 0; i < RT_PLAN.length; i += 1) {
    const e = RT_PLAN[i];
    let v;
    if (e.kind === 1) {
      const s = doorSlots[e.index] || {};
      v = s[e.sub] ?? 0;
    } else if (e.kind === 2) {
      const n = treeNodes[e.index] || {};
      v = e.sub === "Isnil" ? ((n.isnil ?? 1) ? 1 : 0) : (n[e.sub[0].toLowerCase() + e.sub.slice(1)] ?? 0);
    } else {
      v = runtimeInputs[e.name];
      if (v == null) continue; /* pool zero = the packed default */
      if (e.field.type === "bytes") {
        /* The flatten-helper spreads leak the whole corpus row into
           runtimeInputs, so the ANM2 name lanes arrive as STRING arrays —
           normalize's string branch flattened them to name cells; mirror it
           here (raw string chars would mask to 0). */
        let src = v;
        if (e.name === "engineAnm2LayerNames" || e.name === "engineAnm2ExtraNames") {
          if (Array.isArray(src) && typeof src[0] === "string") {
            src = flattenAnm2NameCells(
              src,
              e.name === "engineAnm2LayerNames"
                ? ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS
                : ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS,
            );
          }
        }
        const n = Math.min(e.field.size, src.length);
        for (let j = 0; j < n; j += 1) rtPool8[e.field.offset + j] = src[j] & 0xff;
        continue;
      }
      if (v === 0 && e.field.type !== "f32") continue;
    }
    storeRtLane(e.field, v);
  }
  writeRuntimeInputsPacks(corpusRow);
  memU8.set(rtPool8, rtBase);
}

for (let index = 0; index < corpus.length; index += 1) {
  reset();
  fastWriteStruct(stateAddress(), STATE_ENTRIES, corpus[index]);
  fastWriteStruct(constantsAddress(), CONSTANTS_ENTRIES, constants);
  const monotonicCounterLow = corpus[index].monotonicCounterLow ?? 0x4e729000;
  const monotonicCounterHigh = corpus[index].monotonicCounterHigh ?? 2;
  const scaledCounter = scaleMonotonicCounter(monotonicCounterLow, monotonicCounterHigh);
  const monotonicBaseline = corpus[index].monotonicElapsed === undefined
    ? (BigInt(corpus[index].monotonicBaselineHigh ?? 0) << 32n) | BigInt(corpus[index].monotonicBaselineLow ?? 0)
    : BigInt.asUintN(64, scaledCounter - BigInt(corpus[index].monotonicElapsed));
  const runtimeInputs = {
    /* Whole-row pass-through helpers spread FIRST: they carry orphan
       corpus keys + the updateList/timer/voice flat lanes, and their raw
       values must never override the f32-bit conversion spreads below
       (measured case-271 walk divergence at the ABI-96 merge). */
    ...flattenUpdateListTimersRuntime(corpus[index]),
    ...flattenOpaque0092e300VoicesRuntime(corpus[index]),
    globalRangeByteLength: corpus[index].globalRangeByteLength >>> 0,
    monotonicCounterLow,
    monotonicCounterHigh,
    monotonicBaselineLow: Number(monotonicBaseline & 0xffffffffn),
    monotonicBaselineHigh: Number(monotonicBaseline >> 32n),
    globalMenuGuard4b3ca: corpus[index].globalMenuGuard4b3ca ?? 1,
    globalMenuEnable2a3a5: corpus[index].globalMenuEnable2a3a5 ?? 0,
    globalClearSkip997a: corpus[index].globalClearSkip997a ?? 0,
    challenge0x123: corpus[index].challenge0x123 ?? 0,
    frameOpaque4212c0SlotChar: corpus[index].frameOpaque4212c0SlotChar ?? 0,
    doorSlots: corpus[index].doorSlots,
    frameOpaque98dba0Bvar2: corpus[index].frameOpaque98dba0Bvar2 ?? 0,
    frameOpaque98dba0Manager2a35c: corpus[index].frameOpaque98dba0Manager2a35c ?? 0,
    frameOpaque98dba0Game216e9: corpus[index].frameOpaque98dba0Game216e9 ?? 0,
    hostFun746560PostReady: corpus[index].hostFun746560PostReady ?? 0,
    /* ABI v66: FUN_0098dba0 timer-block gate capture. Carried through UNMASKED
       — no `& 0xff`, no `>>> 0` clamp to a small range — so 0x80000000 and
       0xffffffff actually reach the Wasm export. */
    frameOpaque98dba0TimerReady: corpus[index].frameOpaque98dba0TimerReady ?? 0,
    frameOpaque98dba0Timer264e8: corpus[index].frameOpaque98dba0Timer264e8 ?? 0,
    /* ABI v70: timer-interior captures — raw bit patterns, UNMASKED (the
       useCrtRand low-byte narrowing and the f32/f64 reinterpretation are the
       plan's job on both sides). Defaults 0 keep every legacy row on its
       exact pre-v70 arm. */
    frameOpaque98dba0TimerPureReady: corpus[index].frameOpaque98dba0TimerPureReady ?? 0,
    frameOpaque98dba0TimerSample: corpus[index].frameOpaque98dba0TimerSample ?? 0,
    frameOpaque98dba0TimerUseCrtRand: corpus[index].frameOpaque98dba0TimerUseCrtRand ?? 0,
    frameOpaque98dba0TimerX264ecBits: corpus[index].frameOpaque98dba0TimerX264ecBits ?? 0,
    frameOpaque98dba0TimerY264f0Bits: corpus[index].frameOpaque98dba0TimerY264f0Bits ?? 0,
    frameOpaque98dba0TimerCosBitsLo: corpus[index].frameOpaque98dba0TimerCosBitsLo ?? 0,
    frameOpaque98dba0TimerCosBitsHi: corpus[index].frameOpaque98dba0TimerCosBitsHi ?? 0,
    frameOpaque98dba0TimerSinBitsLo: corpus[index].frameOpaque98dba0TimerSinBitsLo ?? 0,
    frameOpaque98dba0TimerSinBitsHi: corpus[index].frameOpaque98dba0TimerSinBitsHi ?? 0,
    /* ABI v76: timer-interior MT19937 wire. These two lines are the whole
       reason the v76 corpus rows below are not silent no-ops — this object
       is an explicit per-key whitelist (measured defect class: a new runtime
       input not named here reaches the module as ZERO no matter what the
       corpus says). mti is SIGNED: carried through WITHOUT `>>> 0` so the
       cold 625 seed path and negative indexOob arms stay reachable. */
    frameOpaque98dba0TimerMtReady: corpus[index].frameOpaque98dba0TimerMtReady ?? 0,
    frameOpaque98dba0TimerMtiIn: corpus[index].frameOpaque98dba0TimerMtiIn ?? 0,
    /* ABI v33 defaults: non-zero so open-gate still emits both 4257b0 passes
       unless a case opts into empty-count / empty-list pure skips. */
    frameOpaque4257b0IdCount: corpus[index].frameOpaque4257b0IdCount ?? 1,
    frameOpaque4257b0ListCount: corpus[index].frameOpaque4257b0ListCount ?? 1,
    /* ABI v71 blob: every field UNMASKED (the pointer deltas must be able to
       go negative, and initialByte13 must be able to exceed 0xff). Default
       blobReady 0 keeps every legacy row on its exact pre-v71 arm. Memory-
       trim B: pooled dense sync (the verifier compares the scalar lanes
       directly, so they must stay present in the literal). */
    ...syncFo4257b0Blob(corpus[index]),
    roomGridCells: corpus[index].roomGridCells ?? 15,
    roomB8BlobReady: corpus[index].roomB8BlobReady ?? 0,
    /* ABI v95 (record idx 14): B2 item-pool/spawn capture pack. The host
       vouches readiness; the spawn element array rides the corpus row
       (b2SpawnIn) and is seeded into the exported scratch before the
       resume (non-layout; the differential seeds/compares only when the
       array exists). b2PoolCounts = 31 x u16 (Game+0x1af30). */
    b2PoolReady: corpus[index].b2PoolReady ?? 0,
    b2PoolGate18304: corpus[index].b2PoolGate18304 ?? 0,
    /* 31 x u16 (Game+0x1af30): staged straight into the pooled runtime
       struct by writeRuntimeInputsPacks (trim B); the corpus row keeps the
       array form for the model oracle. */
    b2PoolSeed0: corpus[index].b2PoolSeed0 ?? 0,
    b2PoolSeed1: corpus[index].b2PoolSeed1 ?? 0,
    b2PoolSeed2: corpus[index].b2PoolSeed2 ?? 0,
    b2PoolSeed3: corpus[index].b2PoolSeed3 ?? 0,
    b2PlayerColCount: corpus[index].b2PlayerColCount ?? 0,
    b2GridWidth: corpus[index].b2GridWidth ?? 1,
    b2SpawnCount: corpus[index].b2SpawnCount ?? 0,
    b2SpawnIn: corpus[index].b2SpawnIn,
    /* ABI v95 (record idx 16): B8 k-blob capture arrays ride the corpus row
       (non-layout; the module reads them from the exported scratch, the model
       from these keys). Missing arrays with blob_ready!=0 are an incomplete
       capture — the differential seeds/compares only when both exist. */
    roomB8Costs: corpus[index].roomB8Costs,
    roomB8Trails: corpus[index].roomB8Trails,
    /* ABI v95 (record idx 36): water-b16 blob MUST be copied (per-key
       whitelist). waterB16BlobReady=0 keeps the pre-v95 monolithic
       residual; unnamed keys reach the module as ZERO and the pure
       wire is a silent no-op (measured defect class). Byte lanes are
       carried UNMASKED — the law re-narrows (& 0xff) in-module. */
    waterB16BlobReady: corpus[index].waterB16BlobReady ?? 0,
    waterB16GameByte183a0: corpus[index].waterB16GameByte183a0 ?? 0,
    waterB16GameByte269e9: corpus[index].waterB16GameByte269e9 ?? 0,
    waterB16GameType0: corpus[index].waterB16GameType0 ?? 0,
    waterB16GameSubtype4: corpus[index].waterB16GameSubtype4 ?? 0,
    waterB16UnlockAcc: corpus[index].waterB16UnlockAcc ?? 0,
    waterB16UnlockClear: corpus[index].waterB16UnlockClear ?? 0,
    waterB16Src1b10_0: corpus[index].waterB16Src1b10_0 ?? 0,
    waterB16Src1b10_1: corpus[index].waterB16Src1b10_1 ?? 0,
    waterB16Src1b10_2: corpus[index].waterB16Src1b10_2 ?? 0,
    waterB16Src1b10_3: corpus[index].waterB16Src1b10_3 ?? 0,
    waterB16Src1b10_4: corpus[index].waterB16Src1b10_4 ?? 0,
    waterB16Src1b10_5: corpus[index].waterB16Src1b10_5 ?? 0,
    waterB16GridFlags44: corpus[index].waterB16GridFlags44 ?? 0,
    waterB16CellDword54: corpus[index].waterB16CellDword54 ?? 0,
    /* ABI v132 (update-v132-b16-spawn-pack, record idx 36): spawn-walk
       enumeration pack — per-key whitelist (measured silent-zero class). */
    waterB16SpawnRowsReady: corpus[index].waterB16SpawnRowsReady ?? 0,
    waterB16WaterHitCount: corpus[index].waterB16WaterHitCount ?? 0,
    waterB16LavaHitCount: corpus[index].waterB16LavaHitCount ?? 0,
    waterB16GridWEcho: corpus[index].waterB16GridWEcho ?? 0,
    waterB16GridHEcho: corpus[index].waterB16GridHEcho ?? 0,
    waterB16WaterHitCellIdx0: corpus[index].waterB16WaterHitCellIdx0 ?? 0,
    waterB16WaterHitEntPtr0: corpus[index].waterB16WaterHitEntPtr0 ?? 0,
    waterB16LavaHitCellIdx0: corpus[index].waterB16LavaHitCellIdx0 ?? 0,
    waterB16LavaHitEntPtr0: corpus[index].waterB16LavaHitEntPtr0 ?? 0,
    waterB16WaterHitCellIdx1: corpus[index].waterB16WaterHitCellIdx1 ?? 0,
    waterB16WaterHitEntPtr1: corpus[index].waterB16WaterHitEntPtr1 ?? 0,
    waterB16LavaHitCellIdx1: corpus[index].waterB16LavaHitCellIdx1 ?? 0,
    waterB16LavaHitEntPtr1: corpus[index].waterB16LavaHitEntPtr1 ?? 0,
    waterB16WaterHitCellIdx2: corpus[index].waterB16WaterHitCellIdx2 ?? 0,
    waterB16WaterHitEntPtr2: corpus[index].waterB16WaterHitEntPtr2 ?? 0,
    waterB16LavaHitCellIdx2: corpus[index].waterB16LavaHitCellIdx2 ?? 0,
    waterB16LavaHitEntPtr2: corpus[index].waterB16LavaHitEntPtr2 ?? 0,
    waterB16WaterHitCellIdx3: corpus[index].waterB16WaterHitCellIdx3 ?? 0,
    waterB16WaterHitEntPtr3: corpus[index].waterB16WaterHitEntPtr3 ?? 0,
    waterB16LavaHitCellIdx3: corpus[index].waterB16LavaHitCellIdx3 ?? 0,
    waterB16LavaHitEntPtr3: corpus[index].waterB16LavaHitEntPtr3 ?? 0,
    waterB16WaterHitCellIdx4: corpus[index].waterB16WaterHitCellIdx4 ?? 0,
    waterB16WaterHitEntPtr4: corpus[index].waterB16WaterHitEntPtr4 ?? 0,
    waterB16LavaHitCellIdx4: corpus[index].waterB16LavaHitCellIdx4 ?? 0,
    waterB16LavaHitEntPtr4: corpus[index].waterB16LavaHitEntPtr4 ?? 0,
    waterB16WaterHitCellIdx5: corpus[index].waterB16WaterHitCellIdx5 ?? 0,
    waterB16WaterHitEntPtr5: corpus[index].waterB16WaterHitEntPtr5 ?? 0,
    waterB16LavaHitCellIdx5: corpus[index].waterB16LavaHitCellIdx5 ?? 0,
    waterB16LavaHitEntPtr5: corpus[index].waterB16LavaHitEntPtr5 ?? 0,
    waterB16WaterHitCellIdx6: corpus[index].waterB16WaterHitCellIdx6 ?? 0,
    waterB16WaterHitEntPtr6: corpus[index].waterB16WaterHitEntPtr6 ?? 0,
    waterB16LavaHitCellIdx6: corpus[index].waterB16LavaHitCellIdx6 ?? 0,
    waterB16LavaHitEntPtr6: corpus[index].waterB16LavaHitEntPtr6 ?? 0,
    waterB16WaterHitCellIdx7: corpus[index].waterB16WaterHitCellIdx7 ?? 0,
    waterB16WaterHitEntPtr7: corpus[index].waterB16WaterHitEntPtr7 ?? 0,
    waterB16LavaHitCellIdx7: corpus[index].waterB16LavaHitCellIdx7 ?? 0,
    waterB16LavaHitEntPtr7: corpus[index].waterB16LavaHitEntPtr7 ?? 0,
    waterB16WaterHitCellIdx8: corpus[index].waterB16WaterHitCellIdx8 ?? 0,
    waterB16WaterHitEntPtr8: corpus[index].waterB16WaterHitEntPtr8 ?? 0,
    waterB16LavaHitCellIdx8: corpus[index].waterB16LavaHitCellIdx8 ?? 0,
    waterB16LavaHitEntPtr8: corpus[index].waterB16LavaHitEntPtr8 ?? 0,
    waterB16WaterHitCellIdx9: corpus[index].waterB16WaterHitCellIdx9 ?? 0,
    waterB16WaterHitEntPtr9: corpus[index].waterB16WaterHitEntPtr9 ?? 0,
    waterB16LavaHitCellIdx9: corpus[index].waterB16LavaHitCellIdx9 ?? 0,
    waterB16LavaHitEntPtr9: corpus[index].waterB16LavaHitEntPtr9 ?? 0,
    waterB16WaterHitCellIdx10: corpus[index].waterB16WaterHitCellIdx10 ?? 0,
    waterB16WaterHitEntPtr10: corpus[index].waterB16WaterHitEntPtr10 ?? 0,
    waterB16LavaHitCellIdx10: corpus[index].waterB16LavaHitCellIdx10 ?? 0,
    waterB16LavaHitEntPtr10: corpus[index].waterB16LavaHitEntPtr10 ?? 0,
    waterB16WaterHitCellIdx11: corpus[index].waterB16WaterHitCellIdx11 ?? 0,
    waterB16WaterHitEntPtr11: corpus[index].waterB16WaterHitEntPtr11 ?? 0,
    waterB16LavaHitCellIdx11: corpus[index].waterB16LavaHitCellIdx11 ?? 0,
    waterB16LavaHitEntPtr11: corpus[index].waterB16LavaHitEntPtr11 ?? 0,
    waterB16WaterHitCellIdx12: corpus[index].waterB16WaterHitCellIdx12 ?? 0,
    waterB16WaterHitEntPtr12: corpus[index].waterB16WaterHitEntPtr12 ?? 0,
    waterB16LavaHitCellIdx12: corpus[index].waterB16LavaHitCellIdx12 ?? 0,
    waterB16LavaHitEntPtr12: corpus[index].waterB16LavaHitEntPtr12 ?? 0,
    waterB16WaterHitCellIdx13: corpus[index].waterB16WaterHitCellIdx13 ?? 0,
    waterB16WaterHitEntPtr13: corpus[index].waterB16WaterHitEntPtr13 ?? 0,
    waterB16LavaHitCellIdx13: corpus[index].waterB16LavaHitCellIdx13 ?? 0,
    waterB16LavaHitEntPtr13: corpus[index].waterB16LavaHitEntPtr13 ?? 0,
    waterB16WaterHitCellIdx14: corpus[index].waterB16WaterHitCellIdx14 ?? 0,
    waterB16WaterHitEntPtr14: corpus[index].waterB16WaterHitEntPtr14 ?? 0,
    waterB16LavaHitCellIdx14: corpus[index].waterB16LavaHitCellIdx14 ?? 0,
    waterB16LavaHitEntPtr14: corpus[index].waterB16LavaHitEntPtr14 ?? 0,
    waterB16WaterHitCellIdx15: corpus[index].waterB16WaterHitCellIdx15 ?? 0,
    waterB16WaterHitEntPtr15: corpus[index].waterB16WaterHitEntPtr15 ?? 0,
    waterB16LavaHitCellIdx15: corpus[index].waterB16LavaHitCellIdx15 ?? 0,
    waterB16LavaHitEntPtr15: corpus[index].waterB16LavaHitEntPtr15 ?? 0,
    waterB16WaterHitCellIdx16: corpus[index].waterB16WaterHitCellIdx16 ?? 0,
    waterB16WaterHitEntPtr16: corpus[index].waterB16WaterHitEntPtr16 ?? 0,
    waterB16LavaHitCellIdx16: corpus[index].waterB16LavaHitCellIdx16 ?? 0,
    waterB16LavaHitEntPtr16: corpus[index].waterB16LavaHitEntPtr16 ?? 0,
    waterB16WaterHitCellIdx17: corpus[index].waterB16WaterHitCellIdx17 ?? 0,
    waterB16WaterHitEntPtr17: corpus[index].waterB16WaterHitEntPtr17 ?? 0,
    waterB16LavaHitCellIdx17: corpus[index].waterB16LavaHitCellIdx17 ?? 0,
    waterB16LavaHitEntPtr17: corpus[index].waterB16LavaHitEntPtr17 ?? 0,
    waterB16WaterHitCellIdx18: corpus[index].waterB16WaterHitCellIdx18 ?? 0,
    waterB16WaterHitEntPtr18: corpus[index].waterB16WaterHitEntPtr18 ?? 0,
    waterB16LavaHitCellIdx18: corpus[index].waterB16LavaHitCellIdx18 ?? 0,
    waterB16LavaHitEntPtr18: corpus[index].waterB16LavaHitEntPtr18 ?? 0,
    waterB16WaterHitCellIdx19: corpus[index].waterB16WaterHitCellIdx19 ?? 0,
    waterB16WaterHitEntPtr19: corpus[index].waterB16WaterHitEntPtr19 ?? 0,
    waterB16LavaHitCellIdx19: corpus[index].waterB16LavaHitCellIdx19 ?? 0,
    waterB16LavaHitEntPtr19: corpus[index].waterB16LavaHitEntPtr19 ?? 0,
    waterB16WaterHitCellIdx20: corpus[index].waterB16WaterHitCellIdx20 ?? 0,
    waterB16WaterHitEntPtr20: corpus[index].waterB16WaterHitEntPtr20 ?? 0,
    waterB16LavaHitCellIdx20: corpus[index].waterB16LavaHitCellIdx20 ?? 0,
    waterB16LavaHitEntPtr20: corpus[index].waterB16LavaHitEntPtr20 ?? 0,
    waterB16WaterHitCellIdx21: corpus[index].waterB16WaterHitCellIdx21 ?? 0,
    waterB16WaterHitEntPtr21: corpus[index].waterB16WaterHitEntPtr21 ?? 0,
    waterB16LavaHitCellIdx21: corpus[index].waterB16LavaHitCellIdx21 ?? 0,
    waterB16LavaHitEntPtr21: corpus[index].waterB16LavaHitEntPtr21 ?? 0,
    waterB16WaterHitCellIdx22: corpus[index].waterB16WaterHitCellIdx22 ?? 0,
    waterB16WaterHitEntPtr22: corpus[index].waterB16WaterHitEntPtr22 ?? 0,
    waterB16LavaHitCellIdx22: corpus[index].waterB16LavaHitCellIdx22 ?? 0,
    waterB16LavaHitEntPtr22: corpus[index].waterB16LavaHitEntPtr22 ?? 0,
    waterB16WaterHitCellIdx23: corpus[index].waterB16WaterHitCellIdx23 ?? 0,
    waterB16WaterHitEntPtr23: corpus[index].waterB16WaterHitEntPtr23 ?? 0,
    waterB16LavaHitCellIdx23: corpus[index].waterB16LavaHitCellIdx23 ?? 0,
    waterB16LavaHitEntPtr23: corpus[index].waterB16LavaHitEntPtr23 ?? 0,
    waterB16WaterHitCellIdx24: corpus[index].waterB16WaterHitCellIdx24 ?? 0,
    waterB16WaterHitEntPtr24: corpus[index].waterB16WaterHitEntPtr24 ?? 0,
    waterB16LavaHitCellIdx24: corpus[index].waterB16LavaHitCellIdx24 ?? 0,
    waterB16LavaHitEntPtr24: corpus[index].waterB16LavaHitEntPtr24 ?? 0,
    waterB16WaterHitCellIdx25: corpus[index].waterB16WaterHitCellIdx25 ?? 0,
    waterB16WaterHitEntPtr25: corpus[index].waterB16WaterHitEntPtr25 ?? 0,
    waterB16LavaHitCellIdx25: corpus[index].waterB16LavaHitCellIdx25 ?? 0,
    waterB16LavaHitEntPtr25: corpus[index].waterB16LavaHitEntPtr25 ?? 0,
    waterB16WaterHitCellIdx26: corpus[index].waterB16WaterHitCellIdx26 ?? 0,
    waterB16WaterHitEntPtr26: corpus[index].waterB16WaterHitEntPtr26 ?? 0,
    waterB16LavaHitCellIdx26: corpus[index].waterB16LavaHitCellIdx26 ?? 0,
    waterB16LavaHitEntPtr26: corpus[index].waterB16LavaHitEntPtr26 ?? 0,
    waterB16WaterHitCellIdx27: corpus[index].waterB16WaterHitCellIdx27 ?? 0,
    waterB16WaterHitEntPtr27: corpus[index].waterB16WaterHitEntPtr27 ?? 0,
    waterB16LavaHitCellIdx27: corpus[index].waterB16LavaHitCellIdx27 ?? 0,
    waterB16LavaHitEntPtr27: corpus[index].waterB16LavaHitEntPtr27 ?? 0,
    waterB16WaterHitCellIdx28: corpus[index].waterB16WaterHitCellIdx28 ?? 0,
    waterB16WaterHitEntPtr28: corpus[index].waterB16WaterHitEntPtr28 ?? 0,
    waterB16LavaHitCellIdx28: corpus[index].waterB16LavaHitCellIdx28 ?? 0,
    waterB16LavaHitEntPtr28: corpus[index].waterB16LavaHitEntPtr28 ?? 0,
    waterB16WaterHitCellIdx29: corpus[index].waterB16WaterHitCellIdx29 ?? 0,
    waterB16WaterHitEntPtr29: corpus[index].waterB16WaterHitEntPtr29 ?? 0,
    waterB16LavaHitCellIdx29: corpus[index].waterB16LavaHitCellIdx29 ?? 0,
    waterB16LavaHitEntPtr29: corpus[index].waterB16LavaHitEntPtr29 ?? 0,
    waterB16WaterHitCellIdx30: corpus[index].waterB16WaterHitCellIdx30 ?? 0,
    waterB16WaterHitEntPtr30: corpus[index].waterB16WaterHitEntPtr30 ?? 0,
    waterB16LavaHitCellIdx30: corpus[index].waterB16LavaHitCellIdx30 ?? 0,
    waterB16LavaHitEntPtr30: corpus[index].waterB16LavaHitEntPtr30 ?? 0,
    waterB16WaterHitCellIdx31: corpus[index].waterB16WaterHitCellIdx31 ?? 0,
    waterB16WaterHitEntPtr31: corpus[index].waterB16WaterHitEntPtr31 ?? 0,
    waterB16LavaHitCellIdx31: corpus[index].waterB16LavaHitCellIdx31 ?? 0,
    waterB16LavaHitEntPtr31: corpus[index].waterB16LavaHitEntPtr31 ?? 0,
    waterB16WaterHitCellIdx32: corpus[index].waterB16WaterHitCellIdx32 ?? 0,
    waterB16WaterHitEntPtr32: corpus[index].waterB16WaterHitEntPtr32 ?? 0,
    waterB16LavaHitCellIdx32: corpus[index].waterB16LavaHitCellIdx32 ?? 0,
    waterB16LavaHitEntPtr32: corpus[index].waterB16LavaHitEntPtr32 ?? 0,
    waterB16WaterHitCellIdx33: corpus[index].waterB16WaterHitCellIdx33 ?? 0,
    waterB16WaterHitEntPtr33: corpus[index].waterB16WaterHitEntPtr33 ?? 0,
    waterB16LavaHitCellIdx33: corpus[index].waterB16LavaHitCellIdx33 ?? 0,
    waterB16LavaHitEntPtr33: corpus[index].waterB16LavaHitEntPtr33 ?? 0,
    waterB16WaterHitCellIdx34: corpus[index].waterB16WaterHitCellIdx34 ?? 0,
    waterB16WaterHitEntPtr34: corpus[index].waterB16WaterHitEntPtr34 ?? 0,
    waterB16LavaHitCellIdx34: corpus[index].waterB16LavaHitCellIdx34 ?? 0,
    waterB16LavaHitEntPtr34: corpus[index].waterB16LavaHitEntPtr34 ?? 0,
    waterB16WaterHitCellIdx35: corpus[index].waterB16WaterHitCellIdx35 ?? 0,
    waterB16WaterHitEntPtr35: corpus[index].waterB16WaterHitEntPtr35 ?? 0,
    waterB16LavaHitCellIdx35: corpus[index].waterB16LavaHitCellIdx35 ?? 0,
    waterB16LavaHitEntPtr35: corpus[index].waterB16LavaHitEntPtr35 ?? 0,
    waterB16WaterHitCellIdx36: corpus[index].waterB16WaterHitCellIdx36 ?? 0,
    waterB16WaterHitEntPtr36: corpus[index].waterB16WaterHitEntPtr36 ?? 0,
    waterB16LavaHitCellIdx36: corpus[index].waterB16LavaHitCellIdx36 ?? 0,
    waterB16LavaHitEntPtr36: corpus[index].waterB16LavaHitEntPtr36 ?? 0,
    waterB16WaterHitCellIdx37: corpus[index].waterB16WaterHitCellIdx37 ?? 0,
    waterB16WaterHitEntPtr37: corpus[index].waterB16WaterHitEntPtr37 ?? 0,
    waterB16LavaHitCellIdx37: corpus[index].waterB16LavaHitCellIdx37 ?? 0,
    waterB16LavaHitEntPtr37: corpus[index].waterB16LavaHitEntPtr37 ?? 0,
    waterB16WaterHitCellIdx38: corpus[index].waterB16WaterHitCellIdx38 ?? 0,
    waterB16WaterHitEntPtr38: corpus[index].waterB16WaterHitEntPtr38 ?? 0,
    waterB16LavaHitCellIdx38: corpus[index].waterB16LavaHitCellIdx38 ?? 0,
    waterB16LavaHitEntPtr38: corpus[index].waterB16LavaHitEntPtr38 ?? 0,
    waterB16WaterHitCellIdx39: corpus[index].waterB16WaterHitCellIdx39 ?? 0,
    waterB16WaterHitEntPtr39: corpus[index].waterB16WaterHitEntPtr39 ?? 0,
    waterB16LavaHitCellIdx39: corpus[index].waterB16LavaHitCellIdx39 ?? 0,
    waterB16LavaHitEntPtr39: corpus[index].waterB16LavaHitEntPtr39 ?? 0,
    waterB16WaterHitCellIdx40: corpus[index].waterB16WaterHitCellIdx40 ?? 0,
    waterB16WaterHitEntPtr40: corpus[index].waterB16WaterHitEntPtr40 ?? 0,
    waterB16LavaHitCellIdx40: corpus[index].waterB16LavaHitCellIdx40 ?? 0,
    waterB16LavaHitEntPtr40: corpus[index].waterB16LavaHitEntPtr40 ?? 0,
    waterB16WaterHitCellIdx41: corpus[index].waterB16WaterHitCellIdx41 ?? 0,
    waterB16WaterHitEntPtr41: corpus[index].waterB16WaterHitEntPtr41 ?? 0,
    waterB16LavaHitCellIdx41: corpus[index].waterB16LavaHitCellIdx41 ?? 0,
    waterB16LavaHitEntPtr41: corpus[index].waterB16LavaHitEntPtr41 ?? 0,
    waterB16WaterHitCellIdx42: corpus[index].waterB16WaterHitCellIdx42 ?? 0,
    waterB16WaterHitEntPtr42: corpus[index].waterB16WaterHitEntPtr42 ?? 0,
    waterB16LavaHitCellIdx42: corpus[index].waterB16LavaHitCellIdx42 ?? 0,
    waterB16LavaHitEntPtr42: corpus[index].waterB16LavaHitEntPtr42 ?? 0,
    waterB16WaterHitCellIdx43: corpus[index].waterB16WaterHitCellIdx43 ?? 0,
    waterB16WaterHitEntPtr43: corpus[index].waterB16WaterHitEntPtr43 ?? 0,
    waterB16LavaHitCellIdx43: corpus[index].waterB16LavaHitCellIdx43 ?? 0,
    waterB16LavaHitEntPtr43: corpus[index].waterB16LavaHitEntPtr43 ?? 0,
    waterB16WaterHitCellIdx44: corpus[index].waterB16WaterHitCellIdx44 ?? 0,
    waterB16WaterHitEntPtr44: corpus[index].waterB16WaterHitEntPtr44 ?? 0,
    waterB16LavaHitCellIdx44: corpus[index].waterB16LavaHitCellIdx44 ?? 0,
    waterB16LavaHitEntPtr44: corpus[index].waterB16LavaHitEntPtr44 ?? 0,
    waterB16WaterHitCellIdx45: corpus[index].waterB16WaterHitCellIdx45 ?? 0,
    waterB16WaterHitEntPtr45: corpus[index].waterB16WaterHitEntPtr45 ?? 0,
    waterB16LavaHitCellIdx45: corpus[index].waterB16LavaHitCellIdx45 ?? 0,
    waterB16LavaHitEntPtr45: corpus[index].waterB16LavaHitEntPtr45 ?? 0,
    waterB16WaterHitCellIdx46: corpus[index].waterB16WaterHitCellIdx46 ?? 0,
    waterB16WaterHitEntPtr46: corpus[index].waterB16WaterHitEntPtr46 ?? 0,
    waterB16LavaHitCellIdx46: corpus[index].waterB16LavaHitCellIdx46 ?? 0,
    waterB16LavaHitEntPtr46: corpus[index].waterB16LavaHitEntPtr46 ?? 0,
    waterB16WaterHitCellIdx47: corpus[index].waterB16WaterHitCellIdx47 ?? 0,
    waterB16WaterHitEntPtr47: corpus[index].waterB16WaterHitEntPtr47 ?? 0,
    waterB16LavaHitCellIdx47: corpus[index].waterB16LavaHitCellIdx47 ?? 0,
    waterB16LavaHitEntPtr47: corpus[index].waterB16LavaHitEntPtr47 ?? 0,
    waterB16WaterHitCellIdx48: corpus[index].waterB16WaterHitCellIdx48 ?? 0,
    waterB16WaterHitEntPtr48: corpus[index].waterB16WaterHitEntPtr48 ?? 0,
    waterB16LavaHitCellIdx48: corpus[index].waterB16LavaHitCellIdx48 ?? 0,
    waterB16LavaHitEntPtr48: corpus[index].waterB16LavaHitEntPtr48 ?? 0,
    waterB16WaterHitCellIdx49: corpus[index].waterB16WaterHitCellIdx49 ?? 0,
    waterB16WaterHitEntPtr49: corpus[index].waterB16WaterHitEntPtr49 ?? 0,
    waterB16LavaHitCellIdx49: corpus[index].waterB16LavaHitCellIdx49 ?? 0,
    waterB16LavaHitEntPtr49: corpus[index].waterB16LavaHitEntPtr49 ?? 0,
    waterB16WaterHitCellIdx50: corpus[index].waterB16WaterHitCellIdx50 ?? 0,
    waterB16WaterHitEntPtr50: corpus[index].waterB16WaterHitEntPtr50 ?? 0,
    waterB16LavaHitCellIdx50: corpus[index].waterB16LavaHitCellIdx50 ?? 0,
    waterB16LavaHitEntPtr50: corpus[index].waterB16LavaHitEntPtr50 ?? 0,
    waterB16WaterHitCellIdx51: corpus[index].waterB16WaterHitCellIdx51 ?? 0,
    waterB16WaterHitEntPtr51: corpus[index].waterB16WaterHitEntPtr51 ?? 0,
    waterB16LavaHitCellIdx51: corpus[index].waterB16LavaHitCellIdx51 ?? 0,
    waterB16LavaHitEntPtr51: corpus[index].waterB16LavaHitEntPtr51 ?? 0,
    waterB16WaterHitCellIdx52: corpus[index].waterB16WaterHitCellIdx52 ?? 0,
    waterB16WaterHitEntPtr52: corpus[index].waterB16WaterHitEntPtr52 ?? 0,
    waterB16LavaHitCellIdx52: corpus[index].waterB16LavaHitCellIdx52 ?? 0,
    waterB16LavaHitEntPtr52: corpus[index].waterB16LavaHitEntPtr52 ?? 0,
    waterB16WaterHitCellIdx53: corpus[index].waterB16WaterHitCellIdx53 ?? 0,
    waterB16WaterHitEntPtr53: corpus[index].waterB16WaterHitEntPtr53 ?? 0,
    waterB16LavaHitCellIdx53: corpus[index].waterB16LavaHitCellIdx53 ?? 0,
    waterB16LavaHitEntPtr53: corpus[index].waterB16LavaHitEntPtr53 ?? 0,
    waterB16WaterHitCellIdx54: corpus[index].waterB16WaterHitCellIdx54 ?? 0,
    waterB16WaterHitEntPtr54: corpus[index].waterB16WaterHitEntPtr54 ?? 0,
    waterB16LavaHitCellIdx54: corpus[index].waterB16LavaHitCellIdx54 ?? 0,
    waterB16LavaHitEntPtr54: corpus[index].waterB16LavaHitEntPtr54 ?? 0,
    waterB16WaterHitCellIdx55: corpus[index].waterB16WaterHitCellIdx55 ?? 0,
    waterB16WaterHitEntPtr55: corpus[index].waterB16WaterHitEntPtr55 ?? 0,
    waterB16LavaHitCellIdx55: corpus[index].waterB16LavaHitCellIdx55 ?? 0,
    waterB16LavaHitEntPtr55: corpus[index].waterB16LavaHitEntPtr55 ?? 0,
    waterB16WaterHitCellIdx56: corpus[index].waterB16WaterHitCellIdx56 ?? 0,
    waterB16WaterHitEntPtr56: corpus[index].waterB16WaterHitEntPtr56 ?? 0,
    waterB16LavaHitCellIdx56: corpus[index].waterB16LavaHitCellIdx56 ?? 0,
    waterB16LavaHitEntPtr56: corpus[index].waterB16LavaHitEntPtr56 ?? 0,
    waterB16WaterHitCellIdx57: corpus[index].waterB16WaterHitCellIdx57 ?? 0,
    waterB16WaterHitEntPtr57: corpus[index].waterB16WaterHitEntPtr57 ?? 0,
    waterB16LavaHitCellIdx57: corpus[index].waterB16LavaHitCellIdx57 ?? 0,
    waterB16LavaHitEntPtr57: corpus[index].waterB16LavaHitEntPtr57 ?? 0,
    waterB16WaterHitCellIdx58: corpus[index].waterB16WaterHitCellIdx58 ?? 0,
    waterB16WaterHitEntPtr58: corpus[index].waterB16WaterHitEntPtr58 ?? 0,
    waterB16LavaHitCellIdx58: corpus[index].waterB16LavaHitCellIdx58 ?? 0,
    waterB16LavaHitEntPtr58: corpus[index].waterB16LavaHitEntPtr58 ?? 0,
    waterB16WaterHitCellIdx59: corpus[index].waterB16WaterHitCellIdx59 ?? 0,
    waterB16WaterHitEntPtr59: corpus[index].waterB16WaterHitEntPtr59 ?? 0,
    waterB16LavaHitCellIdx59: corpus[index].waterB16LavaHitCellIdx59 ?? 0,
    waterB16LavaHitEntPtr59: corpus[index].waterB16LavaHitEntPtr59 ?? 0,
    waterB16WaterHitCellIdx60: corpus[index].waterB16WaterHitCellIdx60 ?? 0,
    waterB16WaterHitEntPtr60: corpus[index].waterB16WaterHitEntPtr60 ?? 0,
    waterB16LavaHitCellIdx60: corpus[index].waterB16LavaHitCellIdx60 ?? 0,
    waterB16LavaHitEntPtr60: corpus[index].waterB16LavaHitEntPtr60 ?? 0,
    waterB16WaterHitCellIdx61: corpus[index].waterB16WaterHitCellIdx61 ?? 0,
    waterB16WaterHitEntPtr61: corpus[index].waterB16WaterHitEntPtr61 ?? 0,
    waterB16LavaHitCellIdx61: corpus[index].waterB16LavaHitCellIdx61 ?? 0,
    waterB16LavaHitEntPtr61: corpus[index].waterB16LavaHitEntPtr61 ?? 0,
    waterB16WaterHitCellIdx62: corpus[index].waterB16WaterHitCellIdx62 ?? 0,
    waterB16WaterHitEntPtr62: corpus[index].waterB16WaterHitEntPtr62 ?? 0,
    waterB16LavaHitCellIdx62: corpus[index].waterB16LavaHitCellIdx62 ?? 0,
    waterB16LavaHitEntPtr62: corpus[index].waterB16LavaHitEntPtr62 ?? 0,
    waterB16WaterHitCellIdx63: corpus[index].waterB16WaterHitCellIdx63 ?? 0,
    waterB16WaterHitEntPtr63: corpus[index].waterB16WaterHitEntPtr63 ?? 0,
    waterB16LavaHitCellIdx63: corpus[index].waterB16LavaHitCellIdx63 ?? 0,
    waterB16LavaHitEntPtr63: corpus[index].waterB16LavaHitEntPtr63 ?? 0,
    /* ABI v133 (update-v133-greed-probe-pack, record idx 30): element-major
       entity capture rows (stride 28). */
    greedProbePackReady: corpus[index].greedProbePackReady ?? 0,
    greedProbeElemCount: corpus[index].greedProbeElemCount ?? 0,
    greedProbeF2c0: corpus[index].greedProbeF2c0 ?? 0,
    greedProbeF3bc0: corpus[index].greedProbeF3bc0 ?? 0,
    greedProbeHasParent0: corpus[index].greedProbeHasParent0 ?? 0,
    greedProbeParent161c0: corpus[index].greedProbeParent161c0 ?? 0,
    greedProbeSelf161c0: corpus[index].greedProbeSelf161c0 ?? 0,
    greedProbeParentIsSelf0: corpus[index].greedProbeParentIsSelf0 ?? 0,
    greedProbeF20a90: corpus[index].greedProbeF20a90 ?? 0,
    greedProbeF2c1: corpus[index].greedProbeF2c1 ?? 0,
    greedProbeF3bc1: corpus[index].greedProbeF3bc1 ?? 0,
    greedProbeHasParent1: corpus[index].greedProbeHasParent1 ?? 0,
    greedProbeParent161c1: corpus[index].greedProbeParent161c1 ?? 0,
    greedProbeSelf161c1: corpus[index].greedProbeSelf161c1 ?? 0,
    greedProbeParentIsSelf1: corpus[index].greedProbeParentIsSelf1 ?? 0,
    greedProbeF20a91: corpus[index].greedProbeF20a91 ?? 0,
    greedProbeF2c2: corpus[index].greedProbeF2c2 ?? 0,
    greedProbeF3bc2: corpus[index].greedProbeF3bc2 ?? 0,
    greedProbeHasParent2: corpus[index].greedProbeHasParent2 ?? 0,
    greedProbeParent161c2: corpus[index].greedProbeParent161c2 ?? 0,
    greedProbeSelf161c2: corpus[index].greedProbeSelf161c2 ?? 0,
    greedProbeParentIsSelf2: corpus[index].greedProbeParentIsSelf2 ?? 0,
    greedProbeF20a92: corpus[index].greedProbeF20a92 ?? 0,
    greedProbeF2c3: corpus[index].greedProbeF2c3 ?? 0,
    greedProbeF3bc3: corpus[index].greedProbeF3bc3 ?? 0,
    greedProbeHasParent3: corpus[index].greedProbeHasParent3 ?? 0,
    greedProbeParent161c3: corpus[index].greedProbeParent161c3 ?? 0,
    greedProbeSelf161c3: corpus[index].greedProbeSelf161c3 ?? 0,
    greedProbeParentIsSelf3: corpus[index].greedProbeParentIsSelf3 ?? 0,
    greedProbeF20a93: corpus[index].greedProbeF20a93 ?? 0,
    greedProbeF2c4: corpus[index].greedProbeF2c4 ?? 0,
    greedProbeF3bc4: corpus[index].greedProbeF3bc4 ?? 0,
    greedProbeHasParent4: corpus[index].greedProbeHasParent4 ?? 0,
    greedProbeParent161c4: corpus[index].greedProbeParent161c4 ?? 0,
    greedProbeSelf161c4: corpus[index].greedProbeSelf161c4 ?? 0,
    greedProbeParentIsSelf4: corpus[index].greedProbeParentIsSelf4 ?? 0,
    greedProbeF20a94: corpus[index].greedProbeF20a94 ?? 0,
    greedProbeF2c5: corpus[index].greedProbeF2c5 ?? 0,
    greedProbeF3bc5: corpus[index].greedProbeF3bc5 ?? 0,
    greedProbeHasParent5: corpus[index].greedProbeHasParent5 ?? 0,
    greedProbeParent161c5: corpus[index].greedProbeParent161c5 ?? 0,
    greedProbeSelf161c5: corpus[index].greedProbeSelf161c5 ?? 0,
    greedProbeParentIsSelf5: corpus[index].greedProbeParentIsSelf5 ?? 0,
    greedProbeF20a95: corpus[index].greedProbeF20a95 ?? 0,
    greedProbeF2c6: corpus[index].greedProbeF2c6 ?? 0,
    greedProbeF3bc6: corpus[index].greedProbeF3bc6 ?? 0,
    greedProbeHasParent6: corpus[index].greedProbeHasParent6 ?? 0,
    greedProbeParent161c6: corpus[index].greedProbeParent161c6 ?? 0,
    greedProbeSelf161c6: corpus[index].greedProbeSelf161c6 ?? 0,
    greedProbeParentIsSelf6: corpus[index].greedProbeParentIsSelf6 ?? 0,
    greedProbeF20a96: corpus[index].greedProbeF20a96 ?? 0,
    greedProbeF2c7: corpus[index].greedProbeF2c7 ?? 0,
    greedProbeF3bc7: corpus[index].greedProbeF3bc7 ?? 0,
    greedProbeHasParent7: corpus[index].greedProbeHasParent7 ?? 0,
    greedProbeParent161c7: corpus[index].greedProbeParent161c7 ?? 0,
    greedProbeSelf161c7: corpus[index].greedProbeSelf161c7 ?? 0,
    greedProbeParentIsSelf7: corpus[index].greedProbeParentIsSelf7 ?? 0,
    greedProbeF20a97: corpus[index].greedProbeF20a97 ?? 0,
    /* ABI v133 (update-v133-audio-music-pack, records idx26/27):
       audio/music spawn-tail packs. */
    tca40TailPackReady: corpus[index].tca40TailPackReady ?? 0,
    tca40TailIterCount: corpus[index].tca40TailIterCount ?? 0,
    tca40TailDoorF24: corpus[index].tca40TailDoorF24 ?? 0,
    tca40TailGameC: corpus[index].tca40TailGameC ?? 0,
    tca40TailVec0Bits: corpus[index].tca40TailVec0Bits ?? 0,
    tca40TailVec4Bits: corpus[index].tca40TailVec4Bits ?? 0,
    tca40TailRotCosBits: corpus[index].tca40TailRotCosBits ?? 0,
    tca40TailRotSinBits: corpus[index].tca40TailRotSinBits ?? 0,
    tca83b0TailPackReady: corpus[index].tca83b0TailPackReady ?? 0,
    tca83b0TailIterCount: corpus[index].tca83b0TailIterCount ?? 0,
    tca83b0TailDoorF24: corpus[index].tca83b0TailDoorF24 ?? 0,
    tca83b0TailGameC: corpus[index].tca83b0TailGameC ?? 0,
    tca83b0TailVec0Bits: corpus[index].tca83b0TailVec0Bits ?? 0,
    tca83b0TailVec1Bits: corpus[index].tca83b0TailVec1Bits ?? 0,
    /* ABI v134 (update-v134-awards-head-pack, records idx28/29): award
       spawner HEAD capture — per-key whitelist. */
    awardsHeadReady: corpus[index].awardsHeadReady ?? 0,
    awardsHeadSrcluaGate: corpus[index].awardsHeadSrcluaGate ?? 0,
    awardsHeadSrcdescF10Present: corpus[index].awardsHeadSrcdescF10Present ?? 0,
    awardsHeadSrcdescType8: corpus[index].awardsHeadSrcdescType8 ?? 0,
    awardsHeadSrcdescType00: corpus[index].awardsHeadSrcdescType00 ?? 0,
    awardsHeadSrcroomType8: corpus[index].awardsHeadSrcroomType8 ?? 0,
    awardsHeadSrch74efd0: corpus[index].awardsHeadSrch74efd0 ?? 0,
    awardsHeadSrcgame1830c: corpus[index].awardsHeadSrcgame1830c ?? 0,
    awardsHeadSrcmode269c8: corpus[index].awardsHeadSrcmode269c8 ?? 0,
    awardsHeadSrch9be630: corpus[index].awardsHeadSrch9be630 ?? 0,
    awardsHeadSrcflags1839c: corpus[index].awardsHeadSrcflags1839c ?? 0,
    awardsHeadSrcpickedId: corpus[index].awardsHeadSrcpickedId ?? 0,
    awardsHeadSrcgateF1: corpus[index].awardsHeadSrcgateF1 ?? 0,
    awardsHeadSrch9be750: corpus[index].awardsHeadSrch9be750 ?? 0,
    awardsHeadSrch4e4690Bits: corpus[index].awardsHeadSrch4e4690Bits ?? 0,
    awardsHeadSrch7e9080Bits: corpus[index].awardsHeadSrch7e9080Bits ?? 0,
    awardsHeadSrchRnd64: corpus[index].awardsHeadSrchRnd64 ?? 0,
    awardsHeadSrch6ee340: corpus[index].awardsHeadSrch6ee340 ?? 0,
    awardsHeadSrch9be140: corpus[index].awardsHeadSrch9be140 ?? 0,
    awardsHeadSrcxformId: corpus[index].awardsHeadSrcxformId ?? 0,
    awardsHeadSrcxformB: corpus[index].awardsHeadSrcxformB ?? 0,
    awardsHeadSrcdescF0: corpus[index].awardsHeadSrcdescF0 ?? 0,
    awardsHeadSrch9be6b0: corpus[index].awardsHeadSrch9be6b0 ?? 0,
    awardsHeadSrch7cb6e0: corpus[index].awardsHeadSrch7cb6e0 ?? 0,
    awardsHeadSrcgate202: corpus[index].awardsHeadSrcgate202 ?? 0,
    awardsHeadSrchRnd4: corpus[index].awardsHeadSrchRnd4 ?? 0,
    awardsHeadSrch9be0801a0: corpus[index].awardsHeadSrch9be0801a0 ?? 0,
    awardsHeadSrchRnd3: corpus[index].awardsHeadSrchRnd3 ?? 0,
    /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29):
       SPAWN-LOOP continuation capture — per-key whitelist. */
    awardsSpawnLoopReady: corpus[index].awardsSpawnLoopReady ?? 0,
    awardsSpawnLoopIterCount: corpus[index].awardsSpawnLoopIterCount ?? 0,
    awardsSpawnLoopVariant0: corpus[index].awardsSpawnLoopVariant0 ?? 0,
    awardsSpawnLoopRoomWC: corpus[index].awardsSpawnLoopRoomWC ?? 0,
    awardsSpawnLoopRoomH10: corpus[index].awardsSpawnLoopRoomH10 ?? 0,
    awardsSpawnLoopB1MusicGateAl: corpus[index].awardsSpawnLoopB1MusicGateAl ?? 0,
    awardsSpawnLoopB1QualityInt: corpus[index].awardsSpawnLoopB1QualityInt ?? 0,
    awardsSpawnLoopB1QualityFBits: corpus[index].awardsSpawnLoopB1QualityFBits ?? 0,
    awardsSpawnLoopB1RndFBits: corpus[index].awardsSpawnLoopB1RndFBits ?? 0,
    awardsSpawnLoopB1SitePosXBits: corpus[index].awardsSpawnLoopB1SitePosXBits ?? 0,
    awardsSpawnLoopB1SitePosYBits: corpus[index].awardsSpawnLoopB1SitePosYBits ?? 0,
    awardsSpawnLoopB1SiteDraw: corpus[index].awardsSpawnLoopB1SiteDraw ?? 0,
    awardsSpawnLoopB1PickerAl: corpus[index].awardsSpawnLoopB1PickerAl ?? 0,
    awardsSpawnLoopTailGateB1Al: corpus[index].awardsSpawnLoopTailGateB1Al ?? 0,
    awardsSpawnLoopGame26584: corpus[index].awardsSpawnLoopGame26584 ?? 0,
    ...Object.fromEntries(
      [ "PosXBits", "PosYBits", "Draw", "EntityType28", "EntityVariant2c",
        "EntityField30", "DoorGateAl", "SfxOwner" ].flatMap((f) =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((i) => [
          `awardsSpawnLoopRow${i}${f}`,
          corpus[index][`awardsSpawnLoopRow${i}${f}`] ?? 0,
        ]))),
    /* ABI v141 (update-v141-b-block-probe-pack, record idx29):
       0xb-block capture — per-key whitelist. */
    awardsBBlockReady: corpus[index].awardsBBlockReady ?? 0,
    awardsBBlockIterCount: corpus[index].awardsBBlockIterCount ?? 0,
    awardsBBlockDescChainBit: corpus[index].awardsBBlockDescChainBit ?? 0,
    awardsBBlockPosXBits: corpus[index].awardsBBlockPosXBits ?? 0,
    awardsBBlockPosYBits: corpus[index].awardsBBlockPosYBits ?? 0,
    awardsBBlockDraw: corpus[index].awardsBBlockDraw ?? 0,
    awardsBBlockRngS0: corpus[index].awardsBBlockRngS0 ?? 0,
    awardsBBlockRngS1: corpus[index].awardsBBlockRngS1 ?? 0,
    awardsBBlockRngS2: corpus[index].awardsBBlockRngS2 ?? 0,
    awardsBBlockRngS3: corpus[index].awardsBBlockRngS3 ?? 0,
    awardsBBlockVecBegin: corpus[index].awardsBBlockVecBegin ?? 0,
    awardsBBlockVecEnd: corpus[index].awardsBBlockVecEnd ?? 0,
    awardsBBlockMode2663c: corpus[index].awardsBBlockMode2663c ?? 0,
    awardsBBlockMgrSeed264f8: corpus[index].awardsBBlockMgrSeed264f8 ?? 0,
    awardsBBlockTailPosXBits: corpus[index].awardsBBlockTailPosXBits ?? 0,
    awardsBBlockTailPosYBits: corpus[index].awardsBBlockTailPosYBits ?? 0,
    awardsBBlockTailDraw: corpus[index].awardsBBlockTailDraw ?? 0,
    awardsBBlockElemValue0: corpus[index].awardsBBlockElemValue0 ?? 0,
    awardsBBlockElemValue1: corpus[index].awardsBBlockElemValue1 ?? 0,
    awardsBBlockElemValue2: corpus[index].awardsBBlockElemValue2 ?? 0,
    awardsBBlockElemValue3: corpus[index].awardsBBlockElemValue3 ?? 0,
    awardsBBlockElemValue4: corpus[index].awardsBBlockElemValue4 ?? 0,
    awardsBBlockElemValue5: corpus[index].awardsBBlockElemValue5 ?? 0,
    awardsBBlockElemValue6: corpus[index].awardsBBlockElemValue6 ?? 0,
    awardsBBlockElemValue7: corpus[index].awardsBBlockElemValue7 ?? 0,
    awardsBBlockRow0F13C0: corpus[index].awardsBBlockRow0F13C0 ?? 0,
    awardsBBlockRow0Gate202c: corpus[index].awardsBBlockRow0Gate202c ?? 0,
    awardsBBlockRow0Gate20a9: corpus[index].awardsBBlockRow0Gate20a9 ?? 0,
    awardsBBlockRow0HCount15: corpus[index].awardsBBlockRow0HCount15 ?? 0,
    awardsBBlockRow0HCount40: corpus[index].awardsBBlockRow0HCount40 ?? 0,
    awardsBBlockRow0HCount4b: corpus[index].awardsBBlockRow0HCount4b ?? 0,
    awardsBBlockRow0HBdR: corpus[index].awardsBBlockRow0HBdR ?? 0,
    awardsBBlockRow0HRngRaw: corpus[index].awardsBBlockRow0HRngRaw ?? 0,
    awardsBBlockRow0Has8b: corpus[index].awardsBBlockRow0Has8b ?? 0,
    awardsBBlockRow0Has1ca: corpus[index].awardsBBlockRow0Has1ca ?? 0,
    awardsBBlockRow0Has1b7: corpus[index].awardsBBlockRow0Has1b7 ?? 0,
    awardsBBlockRow0Slot0: corpus[index].awardsBBlockRow0Slot0 ?? 0,
    awardsBBlockRow0Slot1: corpus[index].awardsBBlockRow0Slot1 ?? 0,
    awardsBBlockRow0BlockNonNull: corpus[index].awardsBBlockRow0BlockNonNull ?? 0,
    awardsBBlockRow0Block0: corpus[index].awardsBBlockRow0Block0 ?? 0,
    awardsBBlockRow0Block4: corpus[index].awardsBBlockRow0Block4 ?? 0,
    awardsBBlockRow0Flag17cc: corpus[index].awardsBBlockRow0Flag17cc ?? 0,
    awardsBBlockRow0ItemBegin: corpus[index].awardsBBlockRow0ItemBegin ?? 0,
    awardsBBlockRow0ItemEnd: corpus[index].awardsBBlockRow0ItemEnd ?? 0,
    awardsBBlockRow0ItemW0: corpus[index].awardsBBlockRow0ItemW0 ?? 0,
    awardsBBlockRow0ItemW1: corpus[index].awardsBBlockRow0ItemW1 ?? 0,
    awardsBBlockRow0ByteBegin: corpus[index].awardsBBlockRow0ByteBegin ?? 0,
    awardsBBlockRow0ByteEnd: corpus[index].awardsBBlockRow0ByteEnd ?? 0,
    awardsBBlockRow0ByteVal: corpus[index].awardsBBlockRow0ByteVal ?? 0,
    awardsBBlockRow0F2ef8: corpus[index].awardsBBlockRow0F2ef8 ?? 0,
    awardsBBlockRow0Byte2ef0: corpus[index].awardsBBlockRow0Byte2ef0 ?? 0,
    awardsBBlockRow0HAdder17: corpus[index].awardsBBlockRow0HAdder17 ?? 0,
    awardsBBlockRow0F18dc: corpus[index].awardsBBlockRow0F18dc ?? 0,
    awardsBBlockRow0F18e0: corpus[index].awardsBBlockRow0F18e0 ?? 0,
    awardsBBlockRow0RollF3fc: corpus[index].awardsBBlockRow0RollF3fc ?? 0,
    awardsBBlockRow0RollByte173: corpus[index].awardsBBlockRow0RollByte173 ?? 0,
    awardsBBlockRow0RollOldFlags1574: corpus[index].awardsBBlockRow0RollOldFlags1574 ?? 0,
    awardsBBlockRow1F13C0: corpus[index].awardsBBlockRow1F13C0 ?? 0,
    awardsBBlockRow1Gate202c: corpus[index].awardsBBlockRow1Gate202c ?? 0,
    awardsBBlockRow1Gate20a9: corpus[index].awardsBBlockRow1Gate20a9 ?? 0,
    awardsBBlockRow1HCount15: corpus[index].awardsBBlockRow1HCount15 ?? 0,
    awardsBBlockRow1HCount40: corpus[index].awardsBBlockRow1HCount40 ?? 0,
    awardsBBlockRow1HCount4b: corpus[index].awardsBBlockRow1HCount4b ?? 0,
    awardsBBlockRow1HBdR: corpus[index].awardsBBlockRow1HBdR ?? 0,
    awardsBBlockRow1HRngRaw: corpus[index].awardsBBlockRow1HRngRaw ?? 0,
    awardsBBlockRow1Has8b: corpus[index].awardsBBlockRow1Has8b ?? 0,
    awardsBBlockRow1Has1ca: corpus[index].awardsBBlockRow1Has1ca ?? 0,
    awardsBBlockRow1Has1b7: corpus[index].awardsBBlockRow1Has1b7 ?? 0,
    awardsBBlockRow1Slot0: corpus[index].awardsBBlockRow1Slot0 ?? 0,
    awardsBBlockRow1Slot1: corpus[index].awardsBBlockRow1Slot1 ?? 0,
    awardsBBlockRow1BlockNonNull: corpus[index].awardsBBlockRow1BlockNonNull ?? 0,
    awardsBBlockRow1Block0: corpus[index].awardsBBlockRow1Block0 ?? 0,
    awardsBBlockRow1Block4: corpus[index].awardsBBlockRow1Block4 ?? 0,
    awardsBBlockRow1Flag17cc: corpus[index].awardsBBlockRow1Flag17cc ?? 0,
    awardsBBlockRow1ItemBegin: corpus[index].awardsBBlockRow1ItemBegin ?? 0,
    awardsBBlockRow1ItemEnd: corpus[index].awardsBBlockRow1ItemEnd ?? 0,
    awardsBBlockRow1ItemW0: corpus[index].awardsBBlockRow1ItemW0 ?? 0,
    awardsBBlockRow1ItemW1: corpus[index].awardsBBlockRow1ItemW1 ?? 0,
    awardsBBlockRow1ByteBegin: corpus[index].awardsBBlockRow1ByteBegin ?? 0,
    awardsBBlockRow1ByteEnd: corpus[index].awardsBBlockRow1ByteEnd ?? 0,
    awardsBBlockRow1ByteVal: corpus[index].awardsBBlockRow1ByteVal ?? 0,
    awardsBBlockRow1F2ef8: corpus[index].awardsBBlockRow1F2ef8 ?? 0,
    awardsBBlockRow1Byte2ef0: corpus[index].awardsBBlockRow1Byte2ef0 ?? 0,
    awardsBBlockRow1HAdder17: corpus[index].awardsBBlockRow1HAdder17 ?? 0,
    awardsBBlockRow1F18dc: corpus[index].awardsBBlockRow1F18dc ?? 0,
    awardsBBlockRow1F18e0: corpus[index].awardsBBlockRow1F18e0 ?? 0,
    awardsBBlockRow1RollF3fc: corpus[index].awardsBBlockRow1RollF3fc ?? 0,
    awardsBBlockRow1RollByte173: corpus[index].awardsBBlockRow1RollByte173 ?? 0,
    awardsBBlockRow1RollOldFlags1574: corpus[index].awardsBBlockRow1RollOldFlags1574 ?? 0,
    awardsBBlockRow2F13C0: corpus[index].awardsBBlockRow2F13C0 ?? 0,
    awardsBBlockRow2Gate202c: corpus[index].awardsBBlockRow2Gate202c ?? 0,
    awardsBBlockRow2Gate20a9: corpus[index].awardsBBlockRow2Gate20a9 ?? 0,
    awardsBBlockRow2HCount15: corpus[index].awardsBBlockRow2HCount15 ?? 0,
    awardsBBlockRow2HCount40: corpus[index].awardsBBlockRow2HCount40 ?? 0,
    awardsBBlockRow2HCount4b: corpus[index].awardsBBlockRow2HCount4b ?? 0,
    awardsBBlockRow2HBdR: corpus[index].awardsBBlockRow2HBdR ?? 0,
    awardsBBlockRow2HRngRaw: corpus[index].awardsBBlockRow2HRngRaw ?? 0,
    awardsBBlockRow2Has8b: corpus[index].awardsBBlockRow2Has8b ?? 0,
    awardsBBlockRow2Has1ca: corpus[index].awardsBBlockRow2Has1ca ?? 0,
    awardsBBlockRow2Has1b7: corpus[index].awardsBBlockRow2Has1b7 ?? 0,
    awardsBBlockRow2Slot0: corpus[index].awardsBBlockRow2Slot0 ?? 0,
    awardsBBlockRow2Slot1: corpus[index].awardsBBlockRow2Slot1 ?? 0,
    awardsBBlockRow2BlockNonNull: corpus[index].awardsBBlockRow2BlockNonNull ?? 0,
    awardsBBlockRow2Block0: corpus[index].awardsBBlockRow2Block0 ?? 0,
    awardsBBlockRow2Block4: corpus[index].awardsBBlockRow2Block4 ?? 0,
    awardsBBlockRow2Flag17cc: corpus[index].awardsBBlockRow2Flag17cc ?? 0,
    awardsBBlockRow2ItemBegin: corpus[index].awardsBBlockRow2ItemBegin ?? 0,
    awardsBBlockRow2ItemEnd: corpus[index].awardsBBlockRow2ItemEnd ?? 0,
    awardsBBlockRow2ItemW0: corpus[index].awardsBBlockRow2ItemW0 ?? 0,
    awardsBBlockRow2ItemW1: corpus[index].awardsBBlockRow2ItemW1 ?? 0,
    awardsBBlockRow2ByteBegin: corpus[index].awardsBBlockRow2ByteBegin ?? 0,
    awardsBBlockRow2ByteEnd: corpus[index].awardsBBlockRow2ByteEnd ?? 0,
    awardsBBlockRow2ByteVal: corpus[index].awardsBBlockRow2ByteVal ?? 0,
    awardsBBlockRow2F2ef8: corpus[index].awardsBBlockRow2F2ef8 ?? 0,
    awardsBBlockRow2Byte2ef0: corpus[index].awardsBBlockRow2Byte2ef0 ?? 0,
    awardsBBlockRow2HAdder17: corpus[index].awardsBBlockRow2HAdder17 ?? 0,
    awardsBBlockRow2F18dc: corpus[index].awardsBBlockRow2F18dc ?? 0,
    awardsBBlockRow2F18e0: corpus[index].awardsBBlockRow2F18e0 ?? 0,
    awardsBBlockRow2RollF3fc: corpus[index].awardsBBlockRow2RollF3fc ?? 0,
    awardsBBlockRow2RollByte173: corpus[index].awardsBBlockRow2RollByte173 ?? 0,
    awardsBBlockRow2RollOldFlags1574: corpus[index].awardsBBlockRow2RollOldFlags1574 ?? 0,
    awardsBBlockRow3F13C0: corpus[index].awardsBBlockRow3F13C0 ?? 0,
    awardsBBlockRow3Gate202c: corpus[index].awardsBBlockRow3Gate202c ?? 0,
    awardsBBlockRow3Gate20a9: corpus[index].awardsBBlockRow3Gate20a9 ?? 0,
    awardsBBlockRow3HCount15: corpus[index].awardsBBlockRow3HCount15 ?? 0,
    awardsBBlockRow3HCount40: corpus[index].awardsBBlockRow3HCount40 ?? 0,
    awardsBBlockRow3HCount4b: corpus[index].awardsBBlockRow3HCount4b ?? 0,
    awardsBBlockRow3HBdR: corpus[index].awardsBBlockRow3HBdR ?? 0,
    awardsBBlockRow3HRngRaw: corpus[index].awardsBBlockRow3HRngRaw ?? 0,
    awardsBBlockRow3Has8b: corpus[index].awardsBBlockRow3Has8b ?? 0,
    awardsBBlockRow3Has1ca: corpus[index].awardsBBlockRow3Has1ca ?? 0,
    awardsBBlockRow3Has1b7: corpus[index].awardsBBlockRow3Has1b7 ?? 0,
    awardsBBlockRow3Slot0: corpus[index].awardsBBlockRow3Slot0 ?? 0,
    awardsBBlockRow3Slot1: corpus[index].awardsBBlockRow3Slot1 ?? 0,
    awardsBBlockRow3BlockNonNull: corpus[index].awardsBBlockRow3BlockNonNull ?? 0,
    awardsBBlockRow3Block0: corpus[index].awardsBBlockRow3Block0 ?? 0,
    awardsBBlockRow3Block4: corpus[index].awardsBBlockRow3Block4 ?? 0,
    awardsBBlockRow3Flag17cc: corpus[index].awardsBBlockRow3Flag17cc ?? 0,
    awardsBBlockRow3ItemBegin: corpus[index].awardsBBlockRow3ItemBegin ?? 0,
    awardsBBlockRow3ItemEnd: corpus[index].awardsBBlockRow3ItemEnd ?? 0,
    awardsBBlockRow3ItemW0: corpus[index].awardsBBlockRow3ItemW0 ?? 0,
    awardsBBlockRow3ItemW1: corpus[index].awardsBBlockRow3ItemW1 ?? 0,
    awardsBBlockRow3ByteBegin: corpus[index].awardsBBlockRow3ByteBegin ?? 0,
    awardsBBlockRow3ByteEnd: corpus[index].awardsBBlockRow3ByteEnd ?? 0,
    awardsBBlockRow3ByteVal: corpus[index].awardsBBlockRow3ByteVal ?? 0,
    awardsBBlockRow3F2ef8: corpus[index].awardsBBlockRow3F2ef8 ?? 0,
    awardsBBlockRow3Byte2ef0: corpus[index].awardsBBlockRow3Byte2ef0 ?? 0,
    awardsBBlockRow3HAdder17: corpus[index].awardsBBlockRow3HAdder17 ?? 0,
    awardsBBlockRow3F18dc: corpus[index].awardsBBlockRow3F18dc ?? 0,
    awardsBBlockRow3F18e0: corpus[index].awardsBBlockRow3F18e0 ?? 0,
    awardsBBlockRow3RollF3fc: corpus[index].awardsBBlockRow3RollF3fc ?? 0,
    awardsBBlockRow3RollByte173: corpus[index].awardsBBlockRow3RollByte173 ?? 0,
    awardsBBlockRow3RollOldFlags1574: corpus[index].awardsBBlockRow3RollOldFlags1574 ?? 0,
    awardsBBlockRow4F13C0: corpus[index].awardsBBlockRow4F13C0 ?? 0,
    awardsBBlockRow4Gate202c: corpus[index].awardsBBlockRow4Gate202c ?? 0,
    awardsBBlockRow4Gate20a9: corpus[index].awardsBBlockRow4Gate20a9 ?? 0,
    awardsBBlockRow4HCount15: corpus[index].awardsBBlockRow4HCount15 ?? 0,
    awardsBBlockRow4HCount40: corpus[index].awardsBBlockRow4HCount40 ?? 0,
    awardsBBlockRow4HCount4b: corpus[index].awardsBBlockRow4HCount4b ?? 0,
    awardsBBlockRow4HBdR: corpus[index].awardsBBlockRow4HBdR ?? 0,
    awardsBBlockRow4HRngRaw: corpus[index].awardsBBlockRow4HRngRaw ?? 0,
    awardsBBlockRow4Has8b: corpus[index].awardsBBlockRow4Has8b ?? 0,
    awardsBBlockRow4Has1ca: corpus[index].awardsBBlockRow4Has1ca ?? 0,
    awardsBBlockRow4Has1b7: corpus[index].awardsBBlockRow4Has1b7 ?? 0,
    awardsBBlockRow4Slot0: corpus[index].awardsBBlockRow4Slot0 ?? 0,
    awardsBBlockRow4Slot1: corpus[index].awardsBBlockRow4Slot1 ?? 0,
    awardsBBlockRow4BlockNonNull: corpus[index].awardsBBlockRow4BlockNonNull ?? 0,
    awardsBBlockRow4Block0: corpus[index].awardsBBlockRow4Block0 ?? 0,
    awardsBBlockRow4Block4: corpus[index].awardsBBlockRow4Block4 ?? 0,
    awardsBBlockRow4Flag17cc: corpus[index].awardsBBlockRow4Flag17cc ?? 0,
    awardsBBlockRow4ItemBegin: corpus[index].awardsBBlockRow4ItemBegin ?? 0,
    awardsBBlockRow4ItemEnd: corpus[index].awardsBBlockRow4ItemEnd ?? 0,
    awardsBBlockRow4ItemW0: corpus[index].awardsBBlockRow4ItemW0 ?? 0,
    awardsBBlockRow4ItemW1: corpus[index].awardsBBlockRow4ItemW1 ?? 0,
    awardsBBlockRow4ByteBegin: corpus[index].awardsBBlockRow4ByteBegin ?? 0,
    awardsBBlockRow4ByteEnd: corpus[index].awardsBBlockRow4ByteEnd ?? 0,
    awardsBBlockRow4ByteVal: corpus[index].awardsBBlockRow4ByteVal ?? 0,
    awardsBBlockRow4F2ef8: corpus[index].awardsBBlockRow4F2ef8 ?? 0,
    awardsBBlockRow4Byte2ef0: corpus[index].awardsBBlockRow4Byte2ef0 ?? 0,
    awardsBBlockRow4HAdder17: corpus[index].awardsBBlockRow4HAdder17 ?? 0,
    awardsBBlockRow4F18dc: corpus[index].awardsBBlockRow4F18dc ?? 0,
    awardsBBlockRow4F18e0: corpus[index].awardsBBlockRow4F18e0 ?? 0,
    awardsBBlockRow4RollF3fc: corpus[index].awardsBBlockRow4RollF3fc ?? 0,
    awardsBBlockRow4RollByte173: corpus[index].awardsBBlockRow4RollByte173 ?? 0,
    awardsBBlockRow4RollOldFlags1574: corpus[index].awardsBBlockRow4RollOldFlags1574 ?? 0,
    awardsBBlockRow5F13C0: corpus[index].awardsBBlockRow5F13C0 ?? 0,
    awardsBBlockRow5Gate202c: corpus[index].awardsBBlockRow5Gate202c ?? 0,
    awardsBBlockRow5Gate20a9: corpus[index].awardsBBlockRow5Gate20a9 ?? 0,
    awardsBBlockRow5HCount15: corpus[index].awardsBBlockRow5HCount15 ?? 0,
    awardsBBlockRow5HCount40: corpus[index].awardsBBlockRow5HCount40 ?? 0,
    awardsBBlockRow5HCount4b: corpus[index].awardsBBlockRow5HCount4b ?? 0,
    awardsBBlockRow5HBdR: corpus[index].awardsBBlockRow5HBdR ?? 0,
    awardsBBlockRow5HRngRaw: corpus[index].awardsBBlockRow5HRngRaw ?? 0,
    awardsBBlockRow5Has8b: corpus[index].awardsBBlockRow5Has8b ?? 0,
    awardsBBlockRow5Has1ca: corpus[index].awardsBBlockRow5Has1ca ?? 0,
    awardsBBlockRow5Has1b7: corpus[index].awardsBBlockRow5Has1b7 ?? 0,
    awardsBBlockRow5Slot0: corpus[index].awardsBBlockRow5Slot0 ?? 0,
    awardsBBlockRow5Slot1: corpus[index].awardsBBlockRow5Slot1 ?? 0,
    awardsBBlockRow5BlockNonNull: corpus[index].awardsBBlockRow5BlockNonNull ?? 0,
    awardsBBlockRow5Block0: corpus[index].awardsBBlockRow5Block0 ?? 0,
    awardsBBlockRow5Block4: corpus[index].awardsBBlockRow5Block4 ?? 0,
    awardsBBlockRow5Flag17cc: corpus[index].awardsBBlockRow5Flag17cc ?? 0,
    awardsBBlockRow5ItemBegin: corpus[index].awardsBBlockRow5ItemBegin ?? 0,
    awardsBBlockRow5ItemEnd: corpus[index].awardsBBlockRow5ItemEnd ?? 0,
    awardsBBlockRow5ItemW0: corpus[index].awardsBBlockRow5ItemW0 ?? 0,
    awardsBBlockRow5ItemW1: corpus[index].awardsBBlockRow5ItemW1 ?? 0,
    awardsBBlockRow5ByteBegin: corpus[index].awardsBBlockRow5ByteBegin ?? 0,
    awardsBBlockRow5ByteEnd: corpus[index].awardsBBlockRow5ByteEnd ?? 0,
    awardsBBlockRow5ByteVal: corpus[index].awardsBBlockRow5ByteVal ?? 0,
    awardsBBlockRow5F2ef8: corpus[index].awardsBBlockRow5F2ef8 ?? 0,
    awardsBBlockRow5Byte2ef0: corpus[index].awardsBBlockRow5Byte2ef0 ?? 0,
    awardsBBlockRow5HAdder17: corpus[index].awardsBBlockRow5HAdder17 ?? 0,
    awardsBBlockRow5F18dc: corpus[index].awardsBBlockRow5F18dc ?? 0,
    awardsBBlockRow5F18e0: corpus[index].awardsBBlockRow5F18e0 ?? 0,
    awardsBBlockRow5RollF3fc: corpus[index].awardsBBlockRow5RollF3fc ?? 0,
    awardsBBlockRow5RollByte173: corpus[index].awardsBBlockRow5RollByte173 ?? 0,
    awardsBBlockRow5RollOldFlags1574: corpus[index].awardsBBlockRow5RollOldFlags1574 ?? 0,
    awardsBBlockRow6F13C0: corpus[index].awardsBBlockRow6F13C0 ?? 0,
    awardsBBlockRow6Gate202c: corpus[index].awardsBBlockRow6Gate202c ?? 0,
    awardsBBlockRow6Gate20a9: corpus[index].awardsBBlockRow6Gate20a9 ?? 0,
    awardsBBlockRow6HCount15: corpus[index].awardsBBlockRow6HCount15 ?? 0,
    awardsBBlockRow6HCount40: corpus[index].awardsBBlockRow6HCount40 ?? 0,
    awardsBBlockRow6HCount4b: corpus[index].awardsBBlockRow6HCount4b ?? 0,
    awardsBBlockRow6HBdR: corpus[index].awardsBBlockRow6HBdR ?? 0,
    awardsBBlockRow6HRngRaw: corpus[index].awardsBBlockRow6HRngRaw ?? 0,
    awardsBBlockRow6Has8b: corpus[index].awardsBBlockRow6Has8b ?? 0,
    awardsBBlockRow6Has1ca: corpus[index].awardsBBlockRow6Has1ca ?? 0,
    awardsBBlockRow6Has1b7: corpus[index].awardsBBlockRow6Has1b7 ?? 0,
    awardsBBlockRow6Slot0: corpus[index].awardsBBlockRow6Slot0 ?? 0,
    awardsBBlockRow6Slot1: corpus[index].awardsBBlockRow6Slot1 ?? 0,
    awardsBBlockRow6BlockNonNull: corpus[index].awardsBBlockRow6BlockNonNull ?? 0,
    awardsBBlockRow6Block0: corpus[index].awardsBBlockRow6Block0 ?? 0,
    awardsBBlockRow6Block4: corpus[index].awardsBBlockRow6Block4 ?? 0,
    awardsBBlockRow6Flag17cc: corpus[index].awardsBBlockRow6Flag17cc ?? 0,
    awardsBBlockRow6ItemBegin: corpus[index].awardsBBlockRow6ItemBegin ?? 0,
    awardsBBlockRow6ItemEnd: corpus[index].awardsBBlockRow6ItemEnd ?? 0,
    awardsBBlockRow6ItemW0: corpus[index].awardsBBlockRow6ItemW0 ?? 0,
    awardsBBlockRow6ItemW1: corpus[index].awardsBBlockRow6ItemW1 ?? 0,
    awardsBBlockRow6ByteBegin: corpus[index].awardsBBlockRow6ByteBegin ?? 0,
    awardsBBlockRow6ByteEnd: corpus[index].awardsBBlockRow6ByteEnd ?? 0,
    awardsBBlockRow6ByteVal: corpus[index].awardsBBlockRow6ByteVal ?? 0,
    awardsBBlockRow6F2ef8: corpus[index].awardsBBlockRow6F2ef8 ?? 0,
    awardsBBlockRow6Byte2ef0: corpus[index].awardsBBlockRow6Byte2ef0 ?? 0,
    awardsBBlockRow6HAdder17: corpus[index].awardsBBlockRow6HAdder17 ?? 0,
    awardsBBlockRow6F18dc: corpus[index].awardsBBlockRow6F18dc ?? 0,
    awardsBBlockRow6F18e0: corpus[index].awardsBBlockRow6F18e0 ?? 0,
    awardsBBlockRow6RollF3fc: corpus[index].awardsBBlockRow6RollF3fc ?? 0,
    awardsBBlockRow6RollByte173: corpus[index].awardsBBlockRow6RollByte173 ?? 0,
    awardsBBlockRow6RollOldFlags1574: corpus[index].awardsBBlockRow6RollOldFlags1574 ?? 0,
    awardsBBlockRow7F13C0: corpus[index].awardsBBlockRow7F13C0 ?? 0,
    awardsBBlockRow7Gate202c: corpus[index].awardsBBlockRow7Gate202c ?? 0,
    awardsBBlockRow7Gate20a9: corpus[index].awardsBBlockRow7Gate20a9 ?? 0,
    awardsBBlockRow7HCount15: corpus[index].awardsBBlockRow7HCount15 ?? 0,
    awardsBBlockRow7HCount40: corpus[index].awardsBBlockRow7HCount40 ?? 0,
    awardsBBlockRow7HCount4b: corpus[index].awardsBBlockRow7HCount4b ?? 0,
    awardsBBlockRow7HBdR: corpus[index].awardsBBlockRow7HBdR ?? 0,
    awardsBBlockRow7HRngRaw: corpus[index].awardsBBlockRow7HRngRaw ?? 0,
    awardsBBlockRow7Has8b: corpus[index].awardsBBlockRow7Has8b ?? 0,
    awardsBBlockRow7Has1ca: corpus[index].awardsBBlockRow7Has1ca ?? 0,
    awardsBBlockRow7Has1b7: corpus[index].awardsBBlockRow7Has1b7 ?? 0,
    awardsBBlockRow7Slot0: corpus[index].awardsBBlockRow7Slot0 ?? 0,
    awardsBBlockRow7Slot1: corpus[index].awardsBBlockRow7Slot1 ?? 0,
    awardsBBlockRow7BlockNonNull: corpus[index].awardsBBlockRow7BlockNonNull ?? 0,
    awardsBBlockRow7Block0: corpus[index].awardsBBlockRow7Block0 ?? 0,
    awardsBBlockRow7Block4: corpus[index].awardsBBlockRow7Block4 ?? 0,
    awardsBBlockRow7Flag17cc: corpus[index].awardsBBlockRow7Flag17cc ?? 0,
    awardsBBlockRow7ItemBegin: corpus[index].awardsBBlockRow7ItemBegin ?? 0,
    awardsBBlockRow7ItemEnd: corpus[index].awardsBBlockRow7ItemEnd ?? 0,
    awardsBBlockRow7ItemW0: corpus[index].awardsBBlockRow7ItemW0 ?? 0,
    awardsBBlockRow7ItemW1: corpus[index].awardsBBlockRow7ItemW1 ?? 0,
    awardsBBlockRow7ByteBegin: corpus[index].awardsBBlockRow7ByteBegin ?? 0,
    awardsBBlockRow7ByteEnd: corpus[index].awardsBBlockRow7ByteEnd ?? 0,
    awardsBBlockRow7ByteVal: corpus[index].awardsBBlockRow7ByteVal ?? 0,
    awardsBBlockRow7F2ef8: corpus[index].awardsBBlockRow7F2ef8 ?? 0,
    awardsBBlockRow7Byte2ef0: corpus[index].awardsBBlockRow7Byte2ef0 ?? 0,
    awardsBBlockRow7HAdder17: corpus[index].awardsBBlockRow7HAdder17 ?? 0,
    awardsBBlockRow7F18dc: corpus[index].awardsBBlockRow7F18dc ?? 0,
    awardsBBlockRow7F18e0: corpus[index].awardsBBlockRow7F18e0 ?? 0,
    awardsBBlockRow7RollF3fc: corpus[index].awardsBBlockRow7RollF3fc ?? 0,
    awardsBBlockRow7RollByte173: corpus[index].awardsBBlockRow7RollByte173 ?? 0,
    awardsBBlockRow7RollOldFlags1574: corpus[index].awardsBBlockRow7RollOldFlags1574 ?? 0,
    /* ABI v135 (update-v135-deep-music-pack, record idx28): deep-music
       gate capture rows — per-key whitelist. */
    tcaDmGateReady: corpus[index].tcaDmGateReady ?? 0,
    tcaDmHeadClear1bb84: corpus[index].tcaDmHeadClear1bb84 ?? 0,
    tcaDmProbeA9e9b50: corpus[index].tcaDmProbeA9e9b50 ?? 0,
    tcaDmProbeB9595e0: corpus[index].tcaDmProbeB9595e0 ?? 0,
    tcaDmByte26588: corpus[index].tcaDmByte26588 ?? 0,
    tcaDmVecBegin4b3d8: corpus[index].tcaDmVecBegin4b3d8 ?? 0,
    tcaDmVecEnd4b3dc: corpus[index].tcaDmVecEnd4b3dc ?? 0,
    tcaDmCount334: corpus[index].tcaDmCount334 ?? 0,
    tcaDmRoomMatchRet8: corpus[index].tcaDmRoomMatchRet8 ?? 0,
    tcaDmGame18314: corpus[index].tcaDmGame18314 ?? 0,
    tcaDmGame4: corpus[index].tcaDmGame4 ?? 0,
    tca40TailRa0: corpus[index].tca40TailRa0 ?? 0,
    tca40TailRb0: corpus[index].tca40TailRb0 ?? 0,
    tca40TailRc0: corpus[index].tca40TailRc0 ?? 0,
    tca40TailRd0: corpus[index].tca40TailRd0 ?? 0,
    tca40TailRe0: corpus[index].tca40TailRe0 ?? 0,
    tca40TailRf0: corpus[index].tca40TailRf0 ?? 0,
    tca40TailRg0: corpus[index].tca40TailRg0 ?? 0,
    tca40TailCosH0: corpus[index].tca40TailCosH0 ?? 0,
    tca40TailSinH0: corpus[index].tca40TailSinH0 ?? 0,
    tca40TailEntPx0: corpus[index].tca40TailEntPx0 ?? 0,
    tca40TailEntPy0: corpus[index].tca40TailEntPy0 ?? 0,
    tca40TailRa1: corpus[index].tca40TailRa1 ?? 0,
    tca40TailRb1: corpus[index].tca40TailRb1 ?? 0,
    tca40TailRc1: corpus[index].tca40TailRc1 ?? 0,
    tca40TailRd1: corpus[index].tca40TailRd1 ?? 0,
    tca40TailRe1: corpus[index].tca40TailRe1 ?? 0,
    tca40TailRf1: corpus[index].tca40TailRf1 ?? 0,
    tca40TailRg1: corpus[index].tca40TailRg1 ?? 0,
    tca40TailCosH1: corpus[index].tca40TailCosH1 ?? 0,
    tca40TailSinH1: corpus[index].tca40TailSinH1 ?? 0,
    tca40TailEntPx1: corpus[index].tca40TailEntPx1 ?? 0,
    tca40TailEntPy1: corpus[index].tca40TailEntPy1 ?? 0,
    tca40TailRa2: corpus[index].tca40TailRa2 ?? 0,
    tca40TailRb2: corpus[index].tca40TailRb2 ?? 0,
    tca40TailRc2: corpus[index].tca40TailRc2 ?? 0,
    tca40TailRd2: corpus[index].tca40TailRd2 ?? 0,
    tca40TailRe2: corpus[index].tca40TailRe2 ?? 0,
    tca40TailRf2: corpus[index].tca40TailRf2 ?? 0,
    tca40TailRg2: corpus[index].tca40TailRg2 ?? 0,
    tca40TailCosH2: corpus[index].tca40TailCosH2 ?? 0,
    tca40TailSinH2: corpus[index].tca40TailSinH2 ?? 0,
    tca40TailEntPx2: corpus[index].tca40TailEntPx2 ?? 0,
    tca40TailEntPy2: corpus[index].tca40TailEntPy2 ?? 0,
    tca40TailRa3: corpus[index].tca40TailRa3 ?? 0,
    tca40TailRb3: corpus[index].tca40TailRb3 ?? 0,
    tca40TailRc3: corpus[index].tca40TailRc3 ?? 0,
    tca40TailRd3: corpus[index].tca40TailRd3 ?? 0,
    tca40TailRe3: corpus[index].tca40TailRe3 ?? 0,
    tca40TailRf3: corpus[index].tca40TailRf3 ?? 0,
    tca40TailRg3: corpus[index].tca40TailRg3 ?? 0,
    tca40TailCosH3: corpus[index].tca40TailCosH3 ?? 0,
    tca40TailSinH3: corpus[index].tca40TailSinH3 ?? 0,
    tca40TailEntPx3: corpus[index].tca40TailEntPx3 ?? 0,
    tca40TailEntPy3: corpus[index].tca40TailEntPy3 ?? 0,
    tca40TailRa4: corpus[index].tca40TailRa4 ?? 0,
    tca40TailRb4: corpus[index].tca40TailRb4 ?? 0,
    tca40TailRc4: corpus[index].tca40TailRc4 ?? 0,
    tca40TailRd4: corpus[index].tca40TailRd4 ?? 0,
    tca40TailRe4: corpus[index].tca40TailRe4 ?? 0,
    tca40TailRf4: corpus[index].tca40TailRf4 ?? 0,
    tca40TailRg4: corpus[index].tca40TailRg4 ?? 0,
    tca40TailCosH4: corpus[index].tca40TailCosH4 ?? 0,
    tca40TailSinH4: corpus[index].tca40TailSinH4 ?? 0,
    tca40TailEntPx4: corpus[index].tca40TailEntPx4 ?? 0,
    tca40TailEntPy4: corpus[index].tca40TailEntPy4 ?? 0,
    tca40TailRa5: corpus[index].tca40TailRa5 ?? 0,
    tca40TailRb5: corpus[index].tca40TailRb5 ?? 0,
    tca40TailRc5: corpus[index].tca40TailRc5 ?? 0,
    tca40TailRd5: corpus[index].tca40TailRd5 ?? 0,
    tca40TailRe5: corpus[index].tca40TailRe5 ?? 0,
    tca40TailRf5: corpus[index].tca40TailRf5 ?? 0,
    tca40TailRg5: corpus[index].tca40TailRg5 ?? 0,
    tca40TailCosH5: corpus[index].tca40TailCosH5 ?? 0,
    tca40TailSinH5: corpus[index].tca40TailSinH5 ?? 0,
    tca40TailEntPx5: corpus[index].tca40TailEntPx5 ?? 0,
    tca40TailEntPy5: corpus[index].tca40TailEntPy5 ?? 0,
    tca40TailRa6: corpus[index].tca40TailRa6 ?? 0,
    tca40TailRb6: corpus[index].tca40TailRb6 ?? 0,
    tca40TailRc6: corpus[index].tca40TailRc6 ?? 0,
    tca40TailRd6: corpus[index].tca40TailRd6 ?? 0,
    tca40TailRe6: corpus[index].tca40TailRe6 ?? 0,
    tca40TailRf6: corpus[index].tca40TailRf6 ?? 0,
    tca40TailRg6: corpus[index].tca40TailRg6 ?? 0,
    tca40TailCosH6: corpus[index].tca40TailCosH6 ?? 0,
    tca40TailSinH6: corpus[index].tca40TailSinH6 ?? 0,
    tca40TailEntPx6: corpus[index].tca40TailEntPx6 ?? 0,
    tca40TailEntPy6: corpus[index].tca40TailEntPy6 ?? 0,
    tca40TailRa7: corpus[index].tca40TailRa7 ?? 0,
    tca40TailRb7: corpus[index].tca40TailRb7 ?? 0,
    tca40TailRc7: corpus[index].tca40TailRc7 ?? 0,
    tca40TailRd7: corpus[index].tca40TailRd7 ?? 0,
    tca40TailRe7: corpus[index].tca40TailRe7 ?? 0,
    tca40TailRf7: corpus[index].tca40TailRf7 ?? 0,
    tca40TailRg7: corpus[index].tca40TailRg7 ?? 0,
    tca40TailCosH7: corpus[index].tca40TailCosH7 ?? 0,
    tca40TailSinH7: corpus[index].tca40TailSinH7 ?? 0,
    tca40TailEntPx7: corpus[index].tca40TailEntPx7 ?? 0,
    tca40TailEntPy7: corpus[index].tca40TailEntPy7 ?? 0,
    tca83b0TailRa0: corpus[index].tca83b0TailRa0 ?? 0,
    tca83b0TailRb0: corpus[index].tca83b0TailRb0 ?? 0,
    tca83b0TailRc0: corpus[index].tca83b0TailRc0 ?? 0,
    tca83b0TailRd0: corpus[index].tca83b0TailRd0 ?? 0,
    tca83b0TailRe0: corpus[index].tca83b0TailRe0 ?? 0,
    tca83b0TailRf0: corpus[index].tca83b0TailRf0 ?? 0,
    tca83b0TailRg0: corpus[index].tca83b0TailRg0 ?? 0,
    tca83b0TailCosH0: corpus[index].tca83b0TailCosH0 ?? 0,
    tca83b0TailSinH0: corpus[index].tca83b0TailSinH0 ?? 0,
    tca83b0TailEntPx0: corpus[index].tca83b0TailEntPx0 ?? 0,
    tca83b0TailEntPy0: corpus[index].tca83b0TailEntPy0 ?? 0,
    tca83b0TailRa1: corpus[index].tca83b0TailRa1 ?? 0,
    tca83b0TailRb1: corpus[index].tca83b0TailRb1 ?? 0,
    tca83b0TailRc1: corpus[index].tca83b0TailRc1 ?? 0,
    tca83b0TailRd1: corpus[index].tca83b0TailRd1 ?? 0,
    tca83b0TailRe1: corpus[index].tca83b0TailRe1 ?? 0,
    tca83b0TailRf1: corpus[index].tca83b0TailRf1 ?? 0,
    tca83b0TailRg1: corpus[index].tca83b0TailRg1 ?? 0,
    tca83b0TailCosH1: corpus[index].tca83b0TailCosH1 ?? 0,
    tca83b0TailSinH1: corpus[index].tca83b0TailSinH1 ?? 0,
    tca83b0TailEntPx1: corpus[index].tca83b0TailEntPx1 ?? 0,
    tca83b0TailEntPy1: corpus[index].tca83b0TailEntPy1 ?? 0,
    tca83b0TailRa2: corpus[index].tca83b0TailRa2 ?? 0,
    tca83b0TailRb2: corpus[index].tca83b0TailRb2 ?? 0,
    tca83b0TailRc2: corpus[index].tca83b0TailRc2 ?? 0,
    tca83b0TailRd2: corpus[index].tca83b0TailRd2 ?? 0,
    tca83b0TailRe2: corpus[index].tca83b0TailRe2 ?? 0,
    tca83b0TailRf2: corpus[index].tca83b0TailRf2 ?? 0,
    tca83b0TailRg2: corpus[index].tca83b0TailRg2 ?? 0,
    tca83b0TailCosH2: corpus[index].tca83b0TailCosH2 ?? 0,
    tca83b0TailSinH2: corpus[index].tca83b0TailSinH2 ?? 0,
    tca83b0TailEntPx2: corpus[index].tca83b0TailEntPx2 ?? 0,
    tca83b0TailEntPy2: corpus[index].tca83b0TailEntPy2 ?? 0,
    tca83b0TailRa3: corpus[index].tca83b0TailRa3 ?? 0,
    tca83b0TailRb3: corpus[index].tca83b0TailRb3 ?? 0,
    tca83b0TailRc3: corpus[index].tca83b0TailRc3 ?? 0,
    tca83b0TailRd3: corpus[index].tca83b0TailRd3 ?? 0,
    tca83b0TailRe3: corpus[index].tca83b0TailRe3 ?? 0,
    tca83b0TailRf3: corpus[index].tca83b0TailRf3 ?? 0,
    tca83b0TailRg3: corpus[index].tca83b0TailRg3 ?? 0,
    tca83b0TailCosH3: corpus[index].tca83b0TailCosH3 ?? 0,
    tca83b0TailSinH3: corpus[index].tca83b0TailSinH3 ?? 0,
    tca83b0TailEntPx3: corpus[index].tca83b0TailEntPx3 ?? 0,
    tca83b0TailEntPy3: corpus[index].tca83b0TailEntPy3 ?? 0,
    tca83b0TailRa4: corpus[index].tca83b0TailRa4 ?? 0,
    tca83b0TailRb4: corpus[index].tca83b0TailRb4 ?? 0,
    tca83b0TailRc4: corpus[index].tca83b0TailRc4 ?? 0,
    tca83b0TailRd4: corpus[index].tca83b0TailRd4 ?? 0,
    tca83b0TailRe4: corpus[index].tca83b0TailRe4 ?? 0,
    tca83b0TailRf4: corpus[index].tca83b0TailRf4 ?? 0,
    tca83b0TailRg4: corpus[index].tca83b0TailRg4 ?? 0,
    tca83b0TailCosH4: corpus[index].tca83b0TailCosH4 ?? 0,
    tca83b0TailSinH4: corpus[index].tca83b0TailSinH4 ?? 0,
    tca83b0TailEntPx4: corpus[index].tca83b0TailEntPx4 ?? 0,
    tca83b0TailEntPy4: corpus[index].tca83b0TailEntPy4 ?? 0,
    tca83b0TailRa5: corpus[index].tca83b0TailRa5 ?? 0,
    tca83b0TailRb5: corpus[index].tca83b0TailRb5 ?? 0,
    tca83b0TailRc5: corpus[index].tca83b0TailRc5 ?? 0,
    tca83b0TailRd5: corpus[index].tca83b0TailRd5 ?? 0,
    tca83b0TailRe5: corpus[index].tca83b0TailRe5 ?? 0,
    tca83b0TailRf5: corpus[index].tca83b0TailRf5 ?? 0,
    tca83b0TailRg5: corpus[index].tca83b0TailRg5 ?? 0,
    tca83b0TailCosH5: corpus[index].tca83b0TailCosH5 ?? 0,
    tca83b0TailSinH5: corpus[index].tca83b0TailSinH5 ?? 0,
    tca83b0TailEntPx5: corpus[index].tca83b0TailEntPx5 ?? 0,
    tca83b0TailEntPy5: corpus[index].tca83b0TailEntPy5 ?? 0,
    tca83b0TailRa6: corpus[index].tca83b0TailRa6 ?? 0,
    tca83b0TailRb6: corpus[index].tca83b0TailRb6 ?? 0,
    tca83b0TailRc6: corpus[index].tca83b0TailRc6 ?? 0,
    tca83b0TailRd6: corpus[index].tca83b0TailRd6 ?? 0,
    tca83b0TailRe6: corpus[index].tca83b0TailRe6 ?? 0,
    tca83b0TailRf6: corpus[index].tca83b0TailRf6 ?? 0,
    tca83b0TailRg6: corpus[index].tca83b0TailRg6 ?? 0,
    tca83b0TailCosH6: corpus[index].tca83b0TailCosH6 ?? 0,
    tca83b0TailSinH6: corpus[index].tca83b0TailSinH6 ?? 0,
    tca83b0TailEntPx6: corpus[index].tca83b0TailEntPx6 ?? 0,
    tca83b0TailEntPy6: corpus[index].tca83b0TailEntPy6 ?? 0,
    tca83b0TailRa7: corpus[index].tca83b0TailRa7 ?? 0,
    tca83b0TailRb7: corpus[index].tca83b0TailRb7 ?? 0,
    tca83b0TailRc7: corpus[index].tca83b0TailRc7 ?? 0,
    tca83b0TailRd7: corpus[index].tca83b0TailRd7 ?? 0,
    tca83b0TailRe7: corpus[index].tca83b0TailRe7 ?? 0,
    tca83b0TailRf7: corpus[index].tca83b0TailRf7 ?? 0,
    tca83b0TailRg7: corpus[index].tca83b0TailRg7 ?? 0,
    tca83b0TailCosH7: corpus[index].tca83b0TailCosH7 ?? 0,
    tca83b0TailSinH7: corpus[index].tca83b0TailSinH7 ?? 0,
    tca83b0TailEntPx7: corpus[index].tca83b0TailEntPx7 ?? 0,
    tca83b0TailEntPy7: corpus[index].tca83b0TailEntPy7 ?? 0,
    /* ABI v136 (update-v136-audio-head-pack, record idx26): head-gate +
       ABI-67 fail capture rows — explicit per-key whitelist (measured
       silent-zero class: an unnamed lane reaches the module as ZERO and
       every head-decision case silently becomes a no-op). */
    tca40HeadPackReady: corpus[index].tca40HeadPackReady ?? 0,
    tca40HeadRanBits: corpus[index].tca40HeadRanBits ?? 0,
    tca40HeadDescF10F10: corpus[index].tca40HeadDescF10F10 ?? 0,
    tca40HeadObj2c7: corpus[index].tca40HeadObj2c7 ?? 0,
    /* ABI v137 (update-v137-audio-head-83b0-pack, record idx27): head/
       ALT-walk/tail-RNG capture rows — explicit per-key whitelist
       (silent-zero class). */
    tca83B0HeadPackReady: corpus[index].tca83B0HeadPackReady ?? 0,
    tca83B0HeadGate749830: corpus[index].tca83B0HeadGate749830 ?? 0,
    tca83B0HeadGame18304: corpus[index].tca83B0HeadGame18304 ?? 0,
    tca83B0HeadRoomIdxRet8: corpus[index].tca83B0HeadRoomIdxRet8 ?? 0,
    tca83B0HeadGame18314: corpus[index].tca83B0HeadGame18314 ?? 0,
    tca83B0HeadValue92B0Bits: corpus[index].tca83B0HeadValue92B0Bits ?? 0,
    tca83B0HeadMusicSeed: corpus[index].tca83B0HeadMusicSeed ?? 0,
    tca83B0HeadOwnerProbe: corpus[index].tca83B0HeadOwnerProbe ?? 0,
    tca83B0HeadTlsChainA: corpus[index].tca83B0HeadTlsChainA ?? 0,
    tca83B0HeadC8108CA: corpus[index].tca83B0HeadC8108CA ?? 0,
    tca83B0HeadTlsChainB: corpus[index].tca83B0HeadTlsChainB ?? 0,
    tca83B0HeadC8108CB: corpus[index].tca83B0HeadC8108CB ?? 0,
    tca83B0HeadGame1830C: corpus[index].tca83B0HeadGame1830C ?? 0,
    tca83B0HeadBm2NonNull: corpus[index].tca83B0HeadBm2NonNull ?? 0,
    tca83B0HeadDescF58: corpus[index].tca83B0HeadDescF58 ?? 0,
    tca83B0HeadRandomIntRnd: corpus[index].tca83B0HeadRandomIntRnd ?? 0,
    tca83B0HeadBm1_38: corpus[index].tca83B0HeadBm1_38 ?? 0,
    tca83B0HeadSlotOcc0: corpus[index].tca83B0HeadSlotOcc0 ?? 0,
    tca83B0HeadSlotOcc1: corpus[index].tca83B0HeadSlotOcc1 ?? 0,
    tca83B0HeadSlotOcc2: corpus[index].tca83B0HeadSlotOcc2 ?? 0,
    tca83B0HeadSlotOcc3: corpus[index].tca83B0HeadSlotOcc3 ?? 0,
    tca83B0HeadSlotOcc4: corpus[index].tca83B0HeadSlotOcc4 ?? 0,
    tca83B0HeadSlotOcc5: corpus[index].tca83B0HeadSlotOcc5 ?? 0,
    tca83B0HeadSlotOcc6: corpus[index].tca83B0HeadSlotOcc6 ?? 0,
    tca83B0HeadSlotOcc7: corpus[index].tca83B0HeadSlotOcc7 ?? 0,
    tca83B0AltWalkGame1830C: corpus[index].tca83B0AltWalkGame1830C ?? 0,
    tca83B0AltWalkGame18308: corpus[index].tca83B0AltWalkGame18308 ?? 0,
    tca83B0AltWalkGame1831C: corpus[index].tca83B0AltWalkGame1831C ?? 0,
    tca83B0AltWalkBm1_38: corpus[index].tca83B0AltWalkBm1_38 ?? 0,
    tca83B0AltWalkSeedF58: corpus[index].tca83B0AltWalkSeedF58 ?? 0,
    tca83B0AltWalkBm2_38: corpus[index].tca83B0AltWalkBm2_38 ?? 0,
    tca83B0AltWalkBm2_34: corpus[index].tca83B0AltWalkBm2_34 ?? 0,
    tca83B0AltWalkMode269C8: corpus[index].tca83B0AltWalkMode269C8 ?? 0,
    tca83B0HeadDoorMagic: corpus[index].tca83B0HeadDoorMagic ?? 0,
    tca83B0HeadGame4: corpus[index].tca83B0HeadGame4 ?? 0,
    tca83B0HeadGameStage0: corpus[index].tca83B0HeadGameStage0 ?? 0,
    tca83B0TailRngSeedIn: corpus[index].tca83B0TailRngSeedIn ?? 0,
    tca83B0TailRngSh1: corpus[index].tca83B0TailRngSh1 ?? 0,
    tca83B0TailRngSh2: corpus[index].tca83B0TailRngSh2 ?? 0,
    tca83B0TailRngSh3: corpus[index].tca83B0TailRngSh3 ?? 0,
    /* ABI v138 (update-v138-audio-alt-tail-pack, record idx27): ALT-tail
       capture rows — explicit per-key whitelist (silent-zero class). */
    tca83B0AltTailPackReady: corpus[index].tca83B0AltTailPackReady ?? 0,
    tca83B0AltTailIterCount: corpus[index].tca83B0AltTailIterCount ?? 0,
    tca83B0AltTailDoorF24: corpus[index].tca83B0AltTailDoorF24 ?? 0,
    tca83B0AltTailGameC: corpus[index].tca83B0AltTailGameC ?? 0,
    tca83B0AltTailVecABits: corpus[index].tca83B0AltTailVecABits ?? 0,
    tca83B0AltTailVecBBits: corpus[index].tca83B0AltTailVecBBits ?? 0,
    tca83B0AltTailRb0: corpus[index].tca83B0AltTailRb0 ?? 0,
    tca83B0AltTailRc0: corpus[index].tca83B0AltTailRc0 ?? 0,
    tca83B0AltTailRd0: corpus[index].tca83B0AltTailRd0 ?? 0,
    tca83B0AltTailRe0: corpus[index].tca83B0AltTailRe0 ?? 0,
    tca83B0AltTailRf0: corpus[index].tca83B0AltTailRf0 ?? 0,
    tca83B0AltTailRg0: corpus[index].tca83B0AltTailRg0 ?? 0,
    tca83B0AltTailRh0: corpus[index].tca83B0AltTailRh0 ?? 0,
    tca83B0AltTailCosH0: corpus[index].tca83B0AltTailCosH0 ?? 0,
    tca83B0AltTailSinH0: corpus[index].tca83B0AltTailSinH0 ?? 0,
    tca83B0AltTailItemPx0: corpus[index].tca83B0AltTailItemPx0 ?? 0,
    tca83B0AltTailItemPy0: corpus[index].tca83B0AltTailItemPy0 ?? 0,
    tca83B0AltTailRb1: corpus[index].tca83B0AltTailRb1 ?? 0,
    tca83B0AltTailRc1: corpus[index].tca83B0AltTailRc1 ?? 0,
    tca83B0AltTailRd1: corpus[index].tca83B0AltTailRd1 ?? 0,
    tca83B0AltTailRe1: corpus[index].tca83B0AltTailRe1 ?? 0,
    tca83B0AltTailRf1: corpus[index].tca83B0AltTailRf1 ?? 0,
    tca83B0AltTailRg1: corpus[index].tca83B0AltTailRg1 ?? 0,
    tca83B0AltTailRh1: corpus[index].tca83B0AltTailRh1 ?? 0,
    tca83B0AltTailCosH1: corpus[index].tca83B0AltTailCosH1 ?? 0,
    tca83B0AltTailSinH1: corpus[index].tca83B0AltTailSinH1 ?? 0,
    tca83B0AltTailItemPx1: corpus[index].tca83B0AltTailItemPx1 ?? 0,
    tca83B0AltTailItemPy1: corpus[index].tca83B0AltTailItemPy1 ?? 0,
    tca83B0AltTailRb2: corpus[index].tca83B0AltTailRb2 ?? 0,
    tca83B0AltTailRc2: corpus[index].tca83B0AltTailRc2 ?? 0,
    tca83B0AltTailRd2: corpus[index].tca83B0AltTailRd2 ?? 0,
    tca83B0AltTailRe2: corpus[index].tca83B0AltTailRe2 ?? 0,
    tca83B0AltTailRf2: corpus[index].tca83B0AltTailRf2 ?? 0,
    tca83B0AltTailRg2: corpus[index].tca83B0AltTailRg2 ?? 0,
    tca83B0AltTailRh2: corpus[index].tca83B0AltTailRh2 ?? 0,
    tca83B0AltTailCosH2: corpus[index].tca83B0AltTailCosH2 ?? 0,
    tca83B0AltTailSinH2: corpus[index].tca83B0AltTailSinH2 ?? 0,
    tca83B0AltTailItemPx2: corpus[index].tca83B0AltTailItemPx2 ?? 0,
    tca83B0AltTailItemPy2: corpus[index].tca83B0AltTailItemPy2 ?? 0,
    tca83B0AltTailRb3: corpus[index].tca83B0AltTailRb3 ?? 0,
    tca83B0AltTailRc3: corpus[index].tca83B0AltTailRc3 ?? 0,
    tca83B0AltTailRd3: corpus[index].tca83B0AltTailRd3 ?? 0,
    tca83B0AltTailRe3: corpus[index].tca83B0AltTailRe3 ?? 0,
    tca83B0AltTailRf3: corpus[index].tca83B0AltTailRf3 ?? 0,
    tca83B0AltTailRg3: corpus[index].tca83B0AltTailRg3 ?? 0,
    tca83B0AltTailRh3: corpus[index].tca83B0AltTailRh3 ?? 0,
    tca83B0AltTailCosH3: corpus[index].tca83B0AltTailCosH3 ?? 0,
    tca83B0AltTailSinH3: corpus[index].tca83B0AltTailSinH3 ?? 0,
    tca83B0AltTailItemPx3: corpus[index].tca83B0AltTailItemPx3 ?? 0,
    tca83B0AltTailItemPy3: corpus[index].tca83B0AltTailItemPy3 ?? 0,
    tca83B0AltTailRb4: corpus[index].tca83B0AltTailRb4 ?? 0,
    tca83B0AltTailRc4: corpus[index].tca83B0AltTailRc4 ?? 0,
    tca83B0AltTailRd4: corpus[index].tca83B0AltTailRd4 ?? 0,
    tca83B0AltTailRe4: corpus[index].tca83B0AltTailRe4 ?? 0,
    tca83B0AltTailRf4: corpus[index].tca83B0AltTailRf4 ?? 0,
    tca83B0AltTailRg4: corpus[index].tca83B0AltTailRg4 ?? 0,
    tca83B0AltTailRh4: corpus[index].tca83B0AltTailRh4 ?? 0,
    tca83B0AltTailCosH4: corpus[index].tca83B0AltTailCosH4 ?? 0,
    tca83B0AltTailSinH4: corpus[index].tca83B0AltTailSinH4 ?? 0,
    tca83B0AltTailItemPx4: corpus[index].tca83B0AltTailItemPx4 ?? 0,
    tca83B0AltTailItemPy4: corpus[index].tca83B0AltTailItemPy4 ?? 0,
    tca83B0AltTailRb5: corpus[index].tca83B0AltTailRb5 ?? 0,
    tca83B0AltTailRc5: corpus[index].tca83B0AltTailRc5 ?? 0,
    tca83B0AltTailRd5: corpus[index].tca83B0AltTailRd5 ?? 0,
    tca83B0AltTailRe5: corpus[index].tca83B0AltTailRe5 ?? 0,
    tca83B0AltTailRf5: corpus[index].tca83B0AltTailRf5 ?? 0,
    tca83B0AltTailRg5: corpus[index].tca83B0AltTailRg5 ?? 0,
    tca83B0AltTailRh5: corpus[index].tca83B0AltTailRh5 ?? 0,
    tca83B0AltTailCosH5: corpus[index].tca83B0AltTailCosH5 ?? 0,
    tca83B0AltTailSinH5: corpus[index].tca83B0AltTailSinH5 ?? 0,
    tca83B0AltTailItemPx5: corpus[index].tca83B0AltTailItemPx5 ?? 0,
    tca83B0AltTailItemPy5: corpus[index].tca83B0AltTailItemPy5 ?? 0,
    tca83B0AltTailRb6: corpus[index].tca83B0AltTailRb6 ?? 0,
    tca83B0AltTailRc6: corpus[index].tca83B0AltTailRc6 ?? 0,
    tca83B0AltTailRd6: corpus[index].tca83B0AltTailRd6 ?? 0,
    tca83B0AltTailRe6: corpus[index].tca83B0AltTailRe6 ?? 0,
    tca83B0AltTailRf6: corpus[index].tca83B0AltTailRf6 ?? 0,
    tca83B0AltTailRg6: corpus[index].tca83B0AltTailRg6 ?? 0,
    tca83B0AltTailRh6: corpus[index].tca83B0AltTailRh6 ?? 0,
    tca83B0AltTailCosH6: corpus[index].tca83B0AltTailCosH6 ?? 0,
    tca83B0AltTailSinH6: corpus[index].tca83B0AltTailSinH6 ?? 0,
    tca83B0AltTailItemPx6: corpus[index].tca83B0AltTailItemPx6 ?? 0,
    tca83B0AltTailItemPy6: corpus[index].tca83B0AltTailItemPy6 ?? 0,
    tca83B0AltTailRb7: corpus[index].tca83B0AltTailRb7 ?? 0,
    tca83B0AltTailRc7: corpus[index].tca83B0AltTailRc7 ?? 0,
    tca83B0AltTailRd7: corpus[index].tca83B0AltTailRd7 ?? 0,
    tca83B0AltTailRe7: corpus[index].tca83B0AltTailRe7 ?? 0,
    tca83B0AltTailRf7: corpus[index].tca83B0AltTailRf7 ?? 0,
    tca83B0AltTailRg7: corpus[index].tca83B0AltTailRg7 ?? 0,
    tca83B0AltTailRh7: corpus[index].tca83B0AltTailRh7 ?? 0,
    tca83B0AltTailCosH7: corpus[index].tca83B0AltTailCosH7 ?? 0,
    tca83B0AltTailSinH7: corpus[index].tca83B0AltTailSinH7 ?? 0,
    tca83B0AltTailItemPx7: corpus[index].tca83B0AltTailItemPx7 ?? 0,
    tca83B0AltTailItemPy7: corpus[index].tca83B0AltTailItemPy7 ?? 0,
    /* ABI v139 (update-v139-b1-rain-pack, records idx13/idx35): shared-
       half outcome rows — explicit per-key whitelist (silent-zero class). */
    b1RainRowsReady: corpus[index].b1RainRowsReady ?? 0,
    b1RainSpawnCount: corpus[index].b1RainSpawnCount ?? 0,
    b1RainQualityEcho: corpus[index].b1RainQualityEcho ?? 0,
    b1RainOwnerNonzeroEcho: corpus[index].b1RainOwnerNonzeroEcho ?? 0,
    b1RainSeed0Echo: corpus[index].b1RainSeed0Echo ?? 0,
    b1RainDecorCountEcho: corpus[index].b1RainDecorCountEcho ?? 0,
    b1RainRow0IterIndex: corpus[index].b1RainRow0IterIndex ?? 0,
    b1RainRow0ShuffleSeedIn: corpus[index].b1RainRow0ShuffleSeedIn ?? 0,
    b1RainRow0ShuffleSeedOut: corpus[index].b1RainRow0ShuffleSeedOut ?? 0,
    b1RainRow0CornerPick: corpus[index].b1RainRow0CornerPick ?? 0,
    b1RainRow0WorldX: corpus[index].b1RainRow0WorldX ?? 0,
    b1RainRow0WorldY: corpus[index].b1RainRow0WorldY ?? 0,
    b1RainRow0SearchOk: corpus[index].b1RainRow0SearchOk ?? 0,
    b1RainRow0SearchDraws: corpus[index].b1RainRow0SearchDraws ?? 0,
    b1RainRow0CreateEntityPtr: corpus[index].b1RainRow0CreateEntityPtr ?? 0,
    b1RainRow0BindRepositioned: corpus[index].b1RainRow0BindRepositioned ?? 0,
    b1RainRow0BindReposDraws: corpus[index].b1RainRow0BindReposDraws ?? 0,
    b1RainRow0ReposX: corpus[index].b1RainRow0ReposX ?? 0,
    b1RainRow0ReposY: corpus[index].b1RainRow0ReposY ?? 0,
    b1RainRow0BindStore7764: corpus[index].b1RainRow0BindStore7764 ?? 0,
    b1RainRow1IterIndex: corpus[index].b1RainRow1IterIndex ?? 0,
    b1RainRow1ShuffleSeedIn: corpus[index].b1RainRow1ShuffleSeedIn ?? 0,
    b1RainRow1ShuffleSeedOut: corpus[index].b1RainRow1ShuffleSeedOut ?? 0,
    b1RainRow1CornerPick: corpus[index].b1RainRow1CornerPick ?? 0,
    b1RainRow1WorldX: corpus[index].b1RainRow1WorldX ?? 0,
    b1RainRow1WorldY: corpus[index].b1RainRow1WorldY ?? 0,
    b1RainRow1SearchOk: corpus[index].b1RainRow1SearchOk ?? 0,
    b1RainRow1SearchDraws: corpus[index].b1RainRow1SearchDraws ?? 0,
    b1RainRow1CreateEntityPtr: corpus[index].b1RainRow1CreateEntityPtr ?? 0,
    b1RainRow1BindRepositioned: corpus[index].b1RainRow1BindRepositioned ?? 0,
    b1RainRow1BindReposDraws: corpus[index].b1RainRow1BindReposDraws ?? 0,
    b1RainRow1ReposX: corpus[index].b1RainRow1ReposX ?? 0,
    b1RainRow1ReposY: corpus[index].b1RainRow1ReposY ?? 0,
    b1RainRow1BindStore7764: corpus[index].b1RainRow1BindStore7764 ?? 0,
    b1RainRow2IterIndex: corpus[index].b1RainRow2IterIndex ?? 0,
    b1RainRow2ShuffleSeedIn: corpus[index].b1RainRow2ShuffleSeedIn ?? 0,
    b1RainRow2ShuffleSeedOut: corpus[index].b1RainRow2ShuffleSeedOut ?? 0,
    b1RainRow2CornerPick: corpus[index].b1RainRow2CornerPick ?? 0,
    b1RainRow2WorldX: corpus[index].b1RainRow2WorldX ?? 0,
    b1RainRow2WorldY: corpus[index].b1RainRow2WorldY ?? 0,
    b1RainRow2SearchOk: corpus[index].b1RainRow2SearchOk ?? 0,
    b1RainRow2SearchDraws: corpus[index].b1RainRow2SearchDraws ?? 0,
    b1RainRow2CreateEntityPtr: corpus[index].b1RainRow2CreateEntityPtr ?? 0,
    b1RainRow2BindRepositioned: corpus[index].b1RainRow2BindRepositioned ?? 0,
    b1RainRow2BindReposDraws: corpus[index].b1RainRow2BindReposDraws ?? 0,
    b1RainRow2ReposX: corpus[index].b1RainRow2ReposX ?? 0,
    b1RainRow2ReposY: corpus[index].b1RainRow2ReposY ?? 0,
    b1RainRow2BindStore7764: corpus[index].b1RainRow2BindStore7764 ?? 0,
    b1RainRow3IterIndex: corpus[index].b1RainRow3IterIndex ?? 0,
    b1RainRow3ShuffleSeedIn: corpus[index].b1RainRow3ShuffleSeedIn ?? 0,
    b1RainRow3ShuffleSeedOut: corpus[index].b1RainRow3ShuffleSeedOut ?? 0,
    b1RainRow3CornerPick: corpus[index].b1RainRow3CornerPick ?? 0,
    b1RainRow3WorldX: corpus[index].b1RainRow3WorldX ?? 0,
    b1RainRow3WorldY: corpus[index].b1RainRow3WorldY ?? 0,
    b1RainRow3SearchOk: corpus[index].b1RainRow3SearchOk ?? 0,
    b1RainRow3SearchDraws: corpus[index].b1RainRow3SearchDraws ?? 0,
    b1RainRow3CreateEntityPtr: corpus[index].b1RainRow3CreateEntityPtr ?? 0,
    b1RainRow3BindRepositioned: corpus[index].b1RainRow3BindRepositioned ?? 0,
    b1RainRow3BindReposDraws: corpus[index].b1RainRow3BindReposDraws ?? 0,
    b1RainRow3ReposX: corpus[index].b1RainRow3ReposX ?? 0,
    b1RainRow3ReposY: corpus[index].b1RainRow3ReposY ?? 0,
    b1RainRow3BindStore7764: corpus[index].b1RainRow3BindStore7764 ?? 0,
    b1RainRow4IterIndex: corpus[index].b1RainRow4IterIndex ?? 0,
    b1RainRow4ShuffleSeedIn: corpus[index].b1RainRow4ShuffleSeedIn ?? 0,
    b1RainRow4ShuffleSeedOut: corpus[index].b1RainRow4ShuffleSeedOut ?? 0,
    b1RainRow4CornerPick: corpus[index].b1RainRow4CornerPick ?? 0,
    b1RainRow4WorldX: corpus[index].b1RainRow4WorldX ?? 0,
    b1RainRow4WorldY: corpus[index].b1RainRow4WorldY ?? 0,
    b1RainRow4SearchOk: corpus[index].b1RainRow4SearchOk ?? 0,
    b1RainRow4SearchDraws: corpus[index].b1RainRow4SearchDraws ?? 0,
    b1RainRow4CreateEntityPtr: corpus[index].b1RainRow4CreateEntityPtr ?? 0,
    b1RainRow4BindRepositioned: corpus[index].b1RainRow4BindRepositioned ?? 0,
    b1RainRow4BindReposDraws: corpus[index].b1RainRow4BindReposDraws ?? 0,
    b1RainRow4ReposX: corpus[index].b1RainRow4ReposX ?? 0,
    b1RainRow4ReposY: corpus[index].b1RainRow4ReposY ?? 0,
    b1RainRow4BindStore7764: corpus[index].b1RainRow4BindStore7764 ?? 0,
    b1RainRow5IterIndex: corpus[index].b1RainRow5IterIndex ?? 0,
    b1RainRow5ShuffleSeedIn: corpus[index].b1RainRow5ShuffleSeedIn ?? 0,
    b1RainRow5ShuffleSeedOut: corpus[index].b1RainRow5ShuffleSeedOut ?? 0,
    b1RainRow5CornerPick: corpus[index].b1RainRow5CornerPick ?? 0,
    b1RainRow5WorldX: corpus[index].b1RainRow5WorldX ?? 0,
    b1RainRow5WorldY: corpus[index].b1RainRow5WorldY ?? 0,
    b1RainRow5SearchOk: corpus[index].b1RainRow5SearchOk ?? 0,
    b1RainRow5SearchDraws: corpus[index].b1RainRow5SearchDraws ?? 0,
    b1RainRow5CreateEntityPtr: corpus[index].b1RainRow5CreateEntityPtr ?? 0,
    b1RainRow5BindRepositioned: corpus[index].b1RainRow5BindRepositioned ?? 0,
    b1RainRow5BindReposDraws: corpus[index].b1RainRow5BindReposDraws ?? 0,
    b1RainRow5ReposX: corpus[index].b1RainRow5ReposX ?? 0,
    b1RainRow5ReposY: corpus[index].b1RainRow5ReposY ?? 0,
    b1RainRow5BindStore7764: corpus[index].b1RainRow5BindStore7764 ?? 0,
    b1RainRow6IterIndex: corpus[index].b1RainRow6IterIndex ?? 0,
    b1RainRow6ShuffleSeedIn: corpus[index].b1RainRow6ShuffleSeedIn ?? 0,
    b1RainRow6ShuffleSeedOut: corpus[index].b1RainRow6ShuffleSeedOut ?? 0,
    b1RainRow6CornerPick: corpus[index].b1RainRow6CornerPick ?? 0,
    b1RainRow6WorldX: corpus[index].b1RainRow6WorldX ?? 0,
    b1RainRow6WorldY: corpus[index].b1RainRow6WorldY ?? 0,
    b1RainRow6SearchOk: corpus[index].b1RainRow6SearchOk ?? 0,
    b1RainRow6SearchDraws: corpus[index].b1RainRow6SearchDraws ?? 0,
    b1RainRow6CreateEntityPtr: corpus[index].b1RainRow6CreateEntityPtr ?? 0,
    b1RainRow6BindRepositioned: corpus[index].b1RainRow6BindRepositioned ?? 0,
    b1RainRow6BindReposDraws: corpus[index].b1RainRow6BindReposDraws ?? 0,
    b1RainRow6ReposX: corpus[index].b1RainRow6ReposX ?? 0,
    b1RainRow6ReposY: corpus[index].b1RainRow6ReposY ?? 0,
    b1RainRow6BindStore7764: corpus[index].b1RainRow6BindStore7764 ?? 0,
    b1RainRow7IterIndex: corpus[index].b1RainRow7IterIndex ?? 0,
    b1RainRow7ShuffleSeedIn: corpus[index].b1RainRow7ShuffleSeedIn ?? 0,
    b1RainRow7ShuffleSeedOut: corpus[index].b1RainRow7ShuffleSeedOut ?? 0,
    b1RainRow7CornerPick: corpus[index].b1RainRow7CornerPick ?? 0,
    b1RainRow7WorldX: corpus[index].b1RainRow7WorldX ?? 0,
    b1RainRow7WorldY: corpus[index].b1RainRow7WorldY ?? 0,
    b1RainRow7SearchOk: corpus[index].b1RainRow7SearchOk ?? 0,
    b1RainRow7SearchDraws: corpus[index].b1RainRow7SearchDraws ?? 0,
    b1RainRow7CreateEntityPtr: corpus[index].b1RainRow7CreateEntityPtr ?? 0,
    b1RainRow7BindRepositioned: corpus[index].b1RainRow7BindRepositioned ?? 0,
    b1RainRow7BindReposDraws: corpus[index].b1RainRow7BindReposDraws ?? 0,
    b1RainRow7ReposX: corpus[index].b1RainRow7ReposX ?? 0,
    b1RainRow7ReposY: corpus[index].b1RainRow7ReposY ?? 0,
    b1RainRow7BindStore7764: corpus[index].b1RainRow7BindStore7764 ?? 0,
    b1RainRow8IterIndex: corpus[index].b1RainRow8IterIndex ?? 0,
    b1RainRow8ShuffleSeedIn: corpus[index].b1RainRow8ShuffleSeedIn ?? 0,
    b1RainRow8ShuffleSeedOut: corpus[index].b1RainRow8ShuffleSeedOut ?? 0,
    b1RainRow8CornerPick: corpus[index].b1RainRow8CornerPick ?? 0,
    b1RainRow8WorldX: corpus[index].b1RainRow8WorldX ?? 0,
    b1RainRow8WorldY: corpus[index].b1RainRow8WorldY ?? 0,
    b1RainRow8SearchOk: corpus[index].b1RainRow8SearchOk ?? 0,
    b1RainRow8SearchDraws: corpus[index].b1RainRow8SearchDraws ?? 0,
    b1RainRow8CreateEntityPtr: corpus[index].b1RainRow8CreateEntityPtr ?? 0,
    b1RainRow8BindRepositioned: corpus[index].b1RainRow8BindRepositioned ?? 0,
    b1RainRow8BindReposDraws: corpus[index].b1RainRow8BindReposDraws ?? 0,
    b1RainRow8ReposX: corpus[index].b1RainRow8ReposX ?? 0,
    b1RainRow8ReposY: corpus[index].b1RainRow8ReposY ?? 0,
    b1RainRow8BindStore7764: corpus[index].b1RainRow8BindStore7764 ?? 0,
    b1RainRow9IterIndex: corpus[index].b1RainRow9IterIndex ?? 0,
    b1RainRow9ShuffleSeedIn: corpus[index].b1RainRow9ShuffleSeedIn ?? 0,
    b1RainRow9ShuffleSeedOut: corpus[index].b1RainRow9ShuffleSeedOut ?? 0,
    b1RainRow9CornerPick: corpus[index].b1RainRow9CornerPick ?? 0,
    b1RainRow9WorldX: corpus[index].b1RainRow9WorldX ?? 0,
    b1RainRow9WorldY: corpus[index].b1RainRow9WorldY ?? 0,
    b1RainRow9SearchOk: corpus[index].b1RainRow9SearchOk ?? 0,
    b1RainRow9SearchDraws: corpus[index].b1RainRow9SearchDraws ?? 0,
    b1RainRow9CreateEntityPtr: corpus[index].b1RainRow9CreateEntityPtr ?? 0,
    b1RainRow9BindRepositioned: corpus[index].b1RainRow9BindRepositioned ?? 0,
    b1RainRow9BindReposDraws: corpus[index].b1RainRow9BindReposDraws ?? 0,
    b1RainRow9ReposX: corpus[index].b1RainRow9ReposX ?? 0,
    b1RainRow9ReposY: corpus[index].b1RainRow9ReposY ?? 0,
    b1RainRow9BindStore7764: corpus[index].b1RainRow9BindStore7764 ?? 0,
    b1RainRow10IterIndex: corpus[index].b1RainRow10IterIndex ?? 0,
    b1RainRow10ShuffleSeedIn: corpus[index].b1RainRow10ShuffleSeedIn ?? 0,
    b1RainRow10ShuffleSeedOut: corpus[index].b1RainRow10ShuffleSeedOut ?? 0,
    b1RainRow10CornerPick: corpus[index].b1RainRow10CornerPick ?? 0,
    b1RainRow10WorldX: corpus[index].b1RainRow10WorldX ?? 0,
    b1RainRow10WorldY: corpus[index].b1RainRow10WorldY ?? 0,
    b1RainRow10SearchOk: corpus[index].b1RainRow10SearchOk ?? 0,
    b1RainRow10SearchDraws: corpus[index].b1RainRow10SearchDraws ?? 0,
    b1RainRow10CreateEntityPtr: corpus[index].b1RainRow10CreateEntityPtr ?? 0,
    b1RainRow10BindRepositioned: corpus[index].b1RainRow10BindRepositioned ?? 0,
    b1RainRow10BindReposDraws: corpus[index].b1RainRow10BindReposDraws ?? 0,
    b1RainRow10ReposX: corpus[index].b1RainRow10ReposX ?? 0,
    b1RainRow10ReposY: corpus[index].b1RainRow10ReposY ?? 0,
    b1RainRow10BindStore7764: corpus[index].b1RainRow10BindStore7764 ?? 0,
    b1RainRow11IterIndex: corpus[index].b1RainRow11IterIndex ?? 0,
    b1RainRow11ShuffleSeedIn: corpus[index].b1RainRow11ShuffleSeedIn ?? 0,
    b1RainRow11ShuffleSeedOut: corpus[index].b1RainRow11ShuffleSeedOut ?? 0,
    b1RainRow11CornerPick: corpus[index].b1RainRow11CornerPick ?? 0,
    b1RainRow11WorldX: corpus[index].b1RainRow11WorldX ?? 0,
    b1RainRow11WorldY: corpus[index].b1RainRow11WorldY ?? 0,
    b1RainRow11SearchOk: corpus[index].b1RainRow11SearchOk ?? 0,
    b1RainRow11SearchDraws: corpus[index].b1RainRow11SearchDraws ?? 0,
    b1RainRow11CreateEntityPtr: corpus[index].b1RainRow11CreateEntityPtr ?? 0,
    b1RainRow11BindRepositioned: corpus[index].b1RainRow11BindRepositioned ?? 0,
    b1RainRow11BindReposDraws: corpus[index].b1RainRow11BindReposDraws ?? 0,
    b1RainRow11ReposX: corpus[index].b1RainRow11ReposX ?? 0,
    b1RainRow11ReposY: corpus[index].b1RainRow11ReposY ?? 0,
    b1RainRow11BindStore7764: corpus[index].b1RainRow11BindStore7764 ?? 0,
    b1RainRow12IterIndex: corpus[index].b1RainRow12IterIndex ?? 0,
    b1RainRow12ShuffleSeedIn: corpus[index].b1RainRow12ShuffleSeedIn ?? 0,
    b1RainRow12ShuffleSeedOut: corpus[index].b1RainRow12ShuffleSeedOut ?? 0,
    b1RainRow12CornerPick: corpus[index].b1RainRow12CornerPick ?? 0,
    b1RainRow12WorldX: corpus[index].b1RainRow12WorldX ?? 0,
    b1RainRow12WorldY: corpus[index].b1RainRow12WorldY ?? 0,
    b1RainRow12SearchOk: corpus[index].b1RainRow12SearchOk ?? 0,
    b1RainRow12SearchDraws: corpus[index].b1RainRow12SearchDraws ?? 0,
    b1RainRow12CreateEntityPtr: corpus[index].b1RainRow12CreateEntityPtr ?? 0,
    b1RainRow12BindRepositioned: corpus[index].b1RainRow12BindRepositioned ?? 0,
    b1RainRow12BindReposDraws: corpus[index].b1RainRow12BindReposDraws ?? 0,
    b1RainRow12ReposX: corpus[index].b1RainRow12ReposX ?? 0,
    b1RainRow12ReposY: corpus[index].b1RainRow12ReposY ?? 0,
    b1RainRow12BindStore7764: corpus[index].b1RainRow12BindStore7764 ?? 0,
    b1RainRow13IterIndex: corpus[index].b1RainRow13IterIndex ?? 0,
    b1RainRow13ShuffleSeedIn: corpus[index].b1RainRow13ShuffleSeedIn ?? 0,
    b1RainRow13ShuffleSeedOut: corpus[index].b1RainRow13ShuffleSeedOut ?? 0,
    b1RainRow13CornerPick: corpus[index].b1RainRow13CornerPick ?? 0,
    b1RainRow13WorldX: corpus[index].b1RainRow13WorldX ?? 0,
    b1RainRow13WorldY: corpus[index].b1RainRow13WorldY ?? 0,
    b1RainRow13SearchOk: corpus[index].b1RainRow13SearchOk ?? 0,
    b1RainRow13SearchDraws: corpus[index].b1RainRow13SearchDraws ?? 0,
    b1RainRow13CreateEntityPtr: corpus[index].b1RainRow13CreateEntityPtr ?? 0,
    b1RainRow13BindRepositioned: corpus[index].b1RainRow13BindRepositioned ?? 0,
    b1RainRow13BindReposDraws: corpus[index].b1RainRow13BindReposDraws ?? 0,
    b1RainRow13ReposX: corpus[index].b1RainRow13ReposX ?? 0,
    b1RainRow13ReposY: corpus[index].b1RainRow13ReposY ?? 0,
    b1RainRow13BindStore7764: corpus[index].b1RainRow13BindStore7764 ?? 0,
    b1RainRow14IterIndex: corpus[index].b1RainRow14IterIndex ?? 0,
    b1RainRow14ShuffleSeedIn: corpus[index].b1RainRow14ShuffleSeedIn ?? 0,
    b1RainRow14ShuffleSeedOut: corpus[index].b1RainRow14ShuffleSeedOut ?? 0,
    b1RainRow14CornerPick: corpus[index].b1RainRow14CornerPick ?? 0,
    b1RainRow14WorldX: corpus[index].b1RainRow14WorldX ?? 0,
    b1RainRow14WorldY: corpus[index].b1RainRow14WorldY ?? 0,
    b1RainRow14SearchOk: corpus[index].b1RainRow14SearchOk ?? 0,
    b1RainRow14SearchDraws: corpus[index].b1RainRow14SearchDraws ?? 0,
    b1RainRow14CreateEntityPtr: corpus[index].b1RainRow14CreateEntityPtr ?? 0,
    b1RainRow14BindRepositioned: corpus[index].b1RainRow14BindRepositioned ?? 0,
    b1RainRow14BindReposDraws: corpus[index].b1RainRow14BindReposDraws ?? 0,
    b1RainRow14ReposX: corpus[index].b1RainRow14ReposX ?? 0,
    b1RainRow14ReposY: corpus[index].b1RainRow14ReposY ?? 0,
    b1RainRow14BindStore7764: corpus[index].b1RainRow14BindStore7764 ?? 0,
    b1RainRow15IterIndex: corpus[index].b1RainRow15IterIndex ?? 0,
    b1RainRow15ShuffleSeedIn: corpus[index].b1RainRow15ShuffleSeedIn ?? 0,
    b1RainRow15ShuffleSeedOut: corpus[index].b1RainRow15ShuffleSeedOut ?? 0,
    b1RainRow15CornerPick: corpus[index].b1RainRow15CornerPick ?? 0,
    b1RainRow15WorldX: corpus[index].b1RainRow15WorldX ?? 0,
    b1RainRow15WorldY: corpus[index].b1RainRow15WorldY ?? 0,
    b1RainRow15SearchOk: corpus[index].b1RainRow15SearchOk ?? 0,
    b1RainRow15SearchDraws: corpus[index].b1RainRow15SearchDraws ?? 0,
    b1RainRow15CreateEntityPtr: corpus[index].b1RainRow15CreateEntityPtr ?? 0,
    b1RainRow15BindRepositioned: corpus[index].b1RainRow15BindRepositioned ?? 0,
    b1RainRow15BindReposDraws: corpus[index].b1RainRow15BindReposDraws ?? 0,
    b1RainRow15ReposX: corpus[index].b1RainRow15ReposX ?? 0,
    b1RainRow15ReposY: corpus[index].b1RainRow15ReposY ?? 0,
    b1RainRow15BindStore7764: corpus[index].b1RainRow15BindStore7764 ?? 0,
    b1RainRow16IterIndex: corpus[index].b1RainRow16IterIndex ?? 0,
    b1RainRow16ShuffleSeedIn: corpus[index].b1RainRow16ShuffleSeedIn ?? 0,
    b1RainRow16ShuffleSeedOut: corpus[index].b1RainRow16ShuffleSeedOut ?? 0,
    b1RainRow16CornerPick: corpus[index].b1RainRow16CornerPick ?? 0,
    b1RainRow16WorldX: corpus[index].b1RainRow16WorldX ?? 0,
    b1RainRow16WorldY: corpus[index].b1RainRow16WorldY ?? 0,
    b1RainRow16SearchOk: corpus[index].b1RainRow16SearchOk ?? 0,
    b1RainRow16SearchDraws: corpus[index].b1RainRow16SearchDraws ?? 0,
    b1RainRow16CreateEntityPtr: corpus[index].b1RainRow16CreateEntityPtr ?? 0,
    b1RainRow16BindRepositioned: corpus[index].b1RainRow16BindRepositioned ?? 0,
    b1RainRow16BindReposDraws: corpus[index].b1RainRow16BindReposDraws ?? 0,
    b1RainRow16ReposX: corpus[index].b1RainRow16ReposX ?? 0,
    b1RainRow16ReposY: corpus[index].b1RainRow16ReposY ?? 0,
    b1RainRow16BindStore7764: corpus[index].b1RainRow16BindStore7764 ?? 0,
    b1RainRow17IterIndex: corpus[index].b1RainRow17IterIndex ?? 0,
    b1RainRow17ShuffleSeedIn: corpus[index].b1RainRow17ShuffleSeedIn ?? 0,
    b1RainRow17ShuffleSeedOut: corpus[index].b1RainRow17ShuffleSeedOut ?? 0,
    b1RainRow17CornerPick: corpus[index].b1RainRow17CornerPick ?? 0,
    b1RainRow17WorldX: corpus[index].b1RainRow17WorldX ?? 0,
    b1RainRow17WorldY: corpus[index].b1RainRow17WorldY ?? 0,
    b1RainRow17SearchOk: corpus[index].b1RainRow17SearchOk ?? 0,
    b1RainRow17SearchDraws: corpus[index].b1RainRow17SearchDraws ?? 0,
    b1RainRow17CreateEntityPtr: corpus[index].b1RainRow17CreateEntityPtr ?? 0,
    b1RainRow17BindRepositioned: corpus[index].b1RainRow17BindRepositioned ?? 0,
    b1RainRow17BindReposDraws: corpus[index].b1RainRow17BindReposDraws ?? 0,
    b1RainRow17ReposX: corpus[index].b1RainRow17ReposX ?? 0,
    b1RainRow17ReposY: corpus[index].b1RainRow17ReposY ?? 0,
    b1RainRow17BindStore7764: corpus[index].b1RainRow17BindStore7764 ?? 0,
    b1RainRow18IterIndex: corpus[index].b1RainRow18IterIndex ?? 0,
    b1RainRow18ShuffleSeedIn: corpus[index].b1RainRow18ShuffleSeedIn ?? 0,
    b1RainRow18ShuffleSeedOut: corpus[index].b1RainRow18ShuffleSeedOut ?? 0,
    b1RainRow18CornerPick: corpus[index].b1RainRow18CornerPick ?? 0,
    b1RainRow18WorldX: corpus[index].b1RainRow18WorldX ?? 0,
    b1RainRow18WorldY: corpus[index].b1RainRow18WorldY ?? 0,
    b1RainRow18SearchOk: corpus[index].b1RainRow18SearchOk ?? 0,
    b1RainRow18SearchDraws: corpus[index].b1RainRow18SearchDraws ?? 0,
    b1RainRow18CreateEntityPtr: corpus[index].b1RainRow18CreateEntityPtr ?? 0,
    b1RainRow18BindRepositioned: corpus[index].b1RainRow18BindRepositioned ?? 0,
    b1RainRow18BindReposDraws: corpus[index].b1RainRow18BindReposDraws ?? 0,
    b1RainRow18ReposX: corpus[index].b1RainRow18ReposX ?? 0,
    b1RainRow18ReposY: corpus[index].b1RainRow18ReposY ?? 0,
    b1RainRow18BindStore7764: corpus[index].b1RainRow18BindStore7764 ?? 0,
    b1RainRow19IterIndex: corpus[index].b1RainRow19IterIndex ?? 0,
    b1RainRow19ShuffleSeedIn: corpus[index].b1RainRow19ShuffleSeedIn ?? 0,
    b1RainRow19ShuffleSeedOut: corpus[index].b1RainRow19ShuffleSeedOut ?? 0,
    b1RainRow19CornerPick: corpus[index].b1RainRow19CornerPick ?? 0,
    b1RainRow19WorldX: corpus[index].b1RainRow19WorldX ?? 0,
    b1RainRow19WorldY: corpus[index].b1RainRow19WorldY ?? 0,
    b1RainRow19SearchOk: corpus[index].b1RainRow19SearchOk ?? 0,
    b1RainRow19SearchDraws: corpus[index].b1RainRow19SearchDraws ?? 0,
    b1RainRow19CreateEntityPtr: corpus[index].b1RainRow19CreateEntityPtr ?? 0,
    b1RainRow19BindRepositioned: corpus[index].b1RainRow19BindRepositioned ?? 0,
    b1RainRow19BindReposDraws: corpus[index].b1RainRow19BindReposDraws ?? 0,
    b1RainRow19ReposX: corpus[index].b1RainRow19ReposX ?? 0,
    b1RainRow19ReposY: corpus[index].b1RainRow19ReposY ?? 0,
    b1RainRow19BindStore7764: corpus[index].b1RainRow19BindStore7764 ?? 0,
    b1RainRow20IterIndex: corpus[index].b1RainRow20IterIndex ?? 0,
    b1RainRow20ShuffleSeedIn: corpus[index].b1RainRow20ShuffleSeedIn ?? 0,
    b1RainRow20ShuffleSeedOut: corpus[index].b1RainRow20ShuffleSeedOut ?? 0,
    b1RainRow20CornerPick: corpus[index].b1RainRow20CornerPick ?? 0,
    b1RainRow20WorldX: corpus[index].b1RainRow20WorldX ?? 0,
    b1RainRow20WorldY: corpus[index].b1RainRow20WorldY ?? 0,
    b1RainRow20SearchOk: corpus[index].b1RainRow20SearchOk ?? 0,
    b1RainRow20SearchDraws: corpus[index].b1RainRow20SearchDraws ?? 0,
    b1RainRow20CreateEntityPtr: corpus[index].b1RainRow20CreateEntityPtr ?? 0,
    b1RainRow20BindRepositioned: corpus[index].b1RainRow20BindRepositioned ?? 0,
    b1RainRow20BindReposDraws: corpus[index].b1RainRow20BindReposDraws ?? 0,
    b1RainRow20ReposX: corpus[index].b1RainRow20ReposX ?? 0,
    b1RainRow20ReposY: corpus[index].b1RainRow20ReposY ?? 0,
    b1RainRow20BindStore7764: corpus[index].b1RainRow20BindStore7764 ?? 0,
    b1RainRow21IterIndex: corpus[index].b1RainRow21IterIndex ?? 0,
    b1RainRow21ShuffleSeedIn: corpus[index].b1RainRow21ShuffleSeedIn ?? 0,
    b1RainRow21ShuffleSeedOut: corpus[index].b1RainRow21ShuffleSeedOut ?? 0,
    b1RainRow21CornerPick: corpus[index].b1RainRow21CornerPick ?? 0,
    b1RainRow21WorldX: corpus[index].b1RainRow21WorldX ?? 0,
    b1RainRow21WorldY: corpus[index].b1RainRow21WorldY ?? 0,
    b1RainRow21SearchOk: corpus[index].b1RainRow21SearchOk ?? 0,
    b1RainRow21SearchDraws: corpus[index].b1RainRow21SearchDraws ?? 0,
    b1RainRow21CreateEntityPtr: corpus[index].b1RainRow21CreateEntityPtr ?? 0,
    b1RainRow21BindRepositioned: corpus[index].b1RainRow21BindRepositioned ?? 0,
    b1RainRow21BindReposDraws: corpus[index].b1RainRow21BindReposDraws ?? 0,
    b1RainRow21ReposX: corpus[index].b1RainRow21ReposX ?? 0,
    b1RainRow21ReposY: corpus[index].b1RainRow21ReposY ?? 0,
    b1RainRow21BindStore7764: corpus[index].b1RainRow21BindStore7764 ?? 0,
    b1RainRow22IterIndex: corpus[index].b1RainRow22IterIndex ?? 0,
    b1RainRow22ShuffleSeedIn: corpus[index].b1RainRow22ShuffleSeedIn ?? 0,
    b1RainRow22ShuffleSeedOut: corpus[index].b1RainRow22ShuffleSeedOut ?? 0,
    b1RainRow22CornerPick: corpus[index].b1RainRow22CornerPick ?? 0,
    b1RainRow22WorldX: corpus[index].b1RainRow22WorldX ?? 0,
    b1RainRow22WorldY: corpus[index].b1RainRow22WorldY ?? 0,
    b1RainRow22SearchOk: corpus[index].b1RainRow22SearchOk ?? 0,
    b1RainRow22SearchDraws: corpus[index].b1RainRow22SearchDraws ?? 0,
    b1RainRow22CreateEntityPtr: corpus[index].b1RainRow22CreateEntityPtr ?? 0,
    b1RainRow22BindRepositioned: corpus[index].b1RainRow22BindRepositioned ?? 0,
    b1RainRow22BindReposDraws: corpus[index].b1RainRow22BindReposDraws ?? 0,
    b1RainRow22ReposX: corpus[index].b1RainRow22ReposX ?? 0,
    b1RainRow22ReposY: corpus[index].b1RainRow22ReposY ?? 0,
    b1RainRow22BindStore7764: corpus[index].b1RainRow22BindStore7764 ?? 0,
    b1RainRow23IterIndex: corpus[index].b1RainRow23IterIndex ?? 0,
    b1RainRow23ShuffleSeedIn: corpus[index].b1RainRow23ShuffleSeedIn ?? 0,
    b1RainRow23ShuffleSeedOut: corpus[index].b1RainRow23ShuffleSeedOut ?? 0,
    b1RainRow23CornerPick: corpus[index].b1RainRow23CornerPick ?? 0,
    b1RainRow23WorldX: corpus[index].b1RainRow23WorldX ?? 0,
    b1RainRow23WorldY: corpus[index].b1RainRow23WorldY ?? 0,
    b1RainRow23SearchOk: corpus[index].b1RainRow23SearchOk ?? 0,
    b1RainRow23SearchDraws: corpus[index].b1RainRow23SearchDraws ?? 0,
    b1RainRow23CreateEntityPtr: corpus[index].b1RainRow23CreateEntityPtr ?? 0,
    b1RainRow23BindRepositioned: corpus[index].b1RainRow23BindRepositioned ?? 0,
    b1RainRow23BindReposDraws: corpus[index].b1RainRow23BindReposDraws ?? 0,
    b1RainRow23ReposX: corpus[index].b1RainRow23ReposX ?? 0,
    b1RainRow23ReposY: corpus[index].b1RainRow23ReposY ?? 0,
    b1RainRow23BindStore7764: corpus[index].b1RainRow23BindStore7764 ?? 0,
    b1RainRow24IterIndex: corpus[index].b1RainRow24IterIndex ?? 0,
    b1RainRow24ShuffleSeedIn: corpus[index].b1RainRow24ShuffleSeedIn ?? 0,
    b1RainRow24ShuffleSeedOut: corpus[index].b1RainRow24ShuffleSeedOut ?? 0,
    b1RainRow24CornerPick: corpus[index].b1RainRow24CornerPick ?? 0,
    b1RainRow24WorldX: corpus[index].b1RainRow24WorldX ?? 0,
    b1RainRow24WorldY: corpus[index].b1RainRow24WorldY ?? 0,
    b1RainRow24SearchOk: corpus[index].b1RainRow24SearchOk ?? 0,
    b1RainRow24SearchDraws: corpus[index].b1RainRow24SearchDraws ?? 0,
    b1RainRow24CreateEntityPtr: corpus[index].b1RainRow24CreateEntityPtr ?? 0,
    b1RainRow24BindRepositioned: corpus[index].b1RainRow24BindRepositioned ?? 0,
    b1RainRow24BindReposDraws: corpus[index].b1RainRow24BindReposDraws ?? 0,
    b1RainRow24ReposX: corpus[index].b1RainRow24ReposX ?? 0,
    b1RainRow24ReposY: corpus[index].b1RainRow24ReposY ?? 0,
    b1RainRow24BindStore7764: corpus[index].b1RainRow24BindStore7764 ?? 0,
    b1RainRow25IterIndex: corpus[index].b1RainRow25IterIndex ?? 0,
    b1RainRow25ShuffleSeedIn: corpus[index].b1RainRow25ShuffleSeedIn ?? 0,
    b1RainRow25ShuffleSeedOut: corpus[index].b1RainRow25ShuffleSeedOut ?? 0,
    b1RainRow25CornerPick: corpus[index].b1RainRow25CornerPick ?? 0,
    b1RainRow25WorldX: corpus[index].b1RainRow25WorldX ?? 0,
    b1RainRow25WorldY: corpus[index].b1RainRow25WorldY ?? 0,
    b1RainRow25SearchOk: corpus[index].b1RainRow25SearchOk ?? 0,
    b1RainRow25SearchDraws: corpus[index].b1RainRow25SearchDraws ?? 0,
    b1RainRow25CreateEntityPtr: corpus[index].b1RainRow25CreateEntityPtr ?? 0,
    b1RainRow25BindRepositioned: corpus[index].b1RainRow25BindRepositioned ?? 0,
    b1RainRow25BindReposDraws: corpus[index].b1RainRow25BindReposDraws ?? 0,
    b1RainRow25ReposX: corpus[index].b1RainRow25ReposX ?? 0,
    b1RainRow25ReposY: corpus[index].b1RainRow25ReposY ?? 0,
    b1RainRow25BindStore7764: corpus[index].b1RainRow25BindStore7764 ?? 0,
    b1RainRow26IterIndex: corpus[index].b1RainRow26IterIndex ?? 0,
    b1RainRow26ShuffleSeedIn: corpus[index].b1RainRow26ShuffleSeedIn ?? 0,
    b1RainRow26ShuffleSeedOut: corpus[index].b1RainRow26ShuffleSeedOut ?? 0,
    b1RainRow26CornerPick: corpus[index].b1RainRow26CornerPick ?? 0,
    b1RainRow26WorldX: corpus[index].b1RainRow26WorldX ?? 0,
    b1RainRow26WorldY: corpus[index].b1RainRow26WorldY ?? 0,
    b1RainRow26SearchOk: corpus[index].b1RainRow26SearchOk ?? 0,
    b1RainRow26SearchDraws: corpus[index].b1RainRow26SearchDraws ?? 0,
    b1RainRow26CreateEntityPtr: corpus[index].b1RainRow26CreateEntityPtr ?? 0,
    b1RainRow26BindRepositioned: corpus[index].b1RainRow26BindRepositioned ?? 0,
    b1RainRow26BindReposDraws: corpus[index].b1RainRow26BindReposDraws ?? 0,
    b1RainRow26ReposX: corpus[index].b1RainRow26ReposX ?? 0,
    b1RainRow26ReposY: corpus[index].b1RainRow26ReposY ?? 0,
    b1RainRow26BindStore7764: corpus[index].b1RainRow26BindStore7764 ?? 0,
    b1RainRow27IterIndex: corpus[index].b1RainRow27IterIndex ?? 0,
    b1RainRow27ShuffleSeedIn: corpus[index].b1RainRow27ShuffleSeedIn ?? 0,
    b1RainRow27ShuffleSeedOut: corpus[index].b1RainRow27ShuffleSeedOut ?? 0,
    b1RainRow27CornerPick: corpus[index].b1RainRow27CornerPick ?? 0,
    b1RainRow27WorldX: corpus[index].b1RainRow27WorldX ?? 0,
    b1RainRow27WorldY: corpus[index].b1RainRow27WorldY ?? 0,
    b1RainRow27SearchOk: corpus[index].b1RainRow27SearchOk ?? 0,
    b1RainRow27SearchDraws: corpus[index].b1RainRow27SearchDraws ?? 0,
    b1RainRow27CreateEntityPtr: corpus[index].b1RainRow27CreateEntityPtr ?? 0,
    b1RainRow27BindRepositioned: corpus[index].b1RainRow27BindRepositioned ?? 0,
    b1RainRow27BindReposDraws: corpus[index].b1RainRow27BindReposDraws ?? 0,
    b1RainRow27ReposX: corpus[index].b1RainRow27ReposX ?? 0,
    b1RainRow27ReposY: corpus[index].b1RainRow27ReposY ?? 0,
    b1RainRow27BindStore7764: corpus[index].b1RainRow27BindStore7764 ?? 0,
    b1RainRow28IterIndex: corpus[index].b1RainRow28IterIndex ?? 0,
    b1RainRow28ShuffleSeedIn: corpus[index].b1RainRow28ShuffleSeedIn ?? 0,
    b1RainRow28ShuffleSeedOut: corpus[index].b1RainRow28ShuffleSeedOut ?? 0,
    b1RainRow28CornerPick: corpus[index].b1RainRow28CornerPick ?? 0,
    b1RainRow28WorldX: corpus[index].b1RainRow28WorldX ?? 0,
    b1RainRow28WorldY: corpus[index].b1RainRow28WorldY ?? 0,
    b1RainRow28SearchOk: corpus[index].b1RainRow28SearchOk ?? 0,
    b1RainRow28SearchDraws: corpus[index].b1RainRow28SearchDraws ?? 0,
    b1RainRow28CreateEntityPtr: corpus[index].b1RainRow28CreateEntityPtr ?? 0,
    b1RainRow28BindRepositioned: corpus[index].b1RainRow28BindRepositioned ?? 0,
    b1RainRow28BindReposDraws: corpus[index].b1RainRow28BindReposDraws ?? 0,
    b1RainRow28ReposX: corpus[index].b1RainRow28ReposX ?? 0,
    b1RainRow28ReposY: corpus[index].b1RainRow28ReposY ?? 0,
    b1RainRow28BindStore7764: corpus[index].b1RainRow28BindStore7764 ?? 0,
    b1RainRow29IterIndex: corpus[index].b1RainRow29IterIndex ?? 0,
    b1RainRow29ShuffleSeedIn: corpus[index].b1RainRow29ShuffleSeedIn ?? 0,
    b1RainRow29ShuffleSeedOut: corpus[index].b1RainRow29ShuffleSeedOut ?? 0,
    b1RainRow29CornerPick: corpus[index].b1RainRow29CornerPick ?? 0,
    b1RainRow29WorldX: corpus[index].b1RainRow29WorldX ?? 0,
    b1RainRow29WorldY: corpus[index].b1RainRow29WorldY ?? 0,
    b1RainRow29SearchOk: corpus[index].b1RainRow29SearchOk ?? 0,
    b1RainRow29SearchDraws: corpus[index].b1RainRow29SearchDraws ?? 0,
    b1RainRow29CreateEntityPtr: corpus[index].b1RainRow29CreateEntityPtr ?? 0,
    b1RainRow29BindRepositioned: corpus[index].b1RainRow29BindRepositioned ?? 0,
    b1RainRow29BindReposDraws: corpus[index].b1RainRow29BindReposDraws ?? 0,
    b1RainRow29ReposX: corpus[index].b1RainRow29ReposX ?? 0,
    b1RainRow29ReposY: corpus[index].b1RainRow29ReposY ?? 0,
    b1RainRow29BindStore7764: corpus[index].b1RainRow29BindStore7764 ?? 0,
    b1RainRow30IterIndex: corpus[index].b1RainRow30IterIndex ?? 0,
    b1RainRow30ShuffleSeedIn: corpus[index].b1RainRow30ShuffleSeedIn ?? 0,
    b1RainRow30ShuffleSeedOut: corpus[index].b1RainRow30ShuffleSeedOut ?? 0,
    b1RainRow30CornerPick: corpus[index].b1RainRow30CornerPick ?? 0,
    b1RainRow30WorldX: corpus[index].b1RainRow30WorldX ?? 0,
    b1RainRow30WorldY: corpus[index].b1RainRow30WorldY ?? 0,
    b1RainRow30SearchOk: corpus[index].b1RainRow30SearchOk ?? 0,
    b1RainRow30SearchDraws: corpus[index].b1RainRow30SearchDraws ?? 0,
    b1RainRow30CreateEntityPtr: corpus[index].b1RainRow30CreateEntityPtr ?? 0,
    b1RainRow30BindRepositioned: corpus[index].b1RainRow30BindRepositioned ?? 0,
    b1RainRow30BindReposDraws: corpus[index].b1RainRow30BindReposDraws ?? 0,
    b1RainRow30ReposX: corpus[index].b1RainRow30ReposX ?? 0,
    b1RainRow30ReposY: corpus[index].b1RainRow30ReposY ?? 0,
    b1RainRow30BindStore7764: corpus[index].b1RainRow30BindStore7764 ?? 0,
    b1RainRow31IterIndex: corpus[index].b1RainRow31IterIndex ?? 0,
    b1RainRow31ShuffleSeedIn: corpus[index].b1RainRow31ShuffleSeedIn ?? 0,
    b1RainRow31ShuffleSeedOut: corpus[index].b1RainRow31ShuffleSeedOut ?? 0,
    b1RainRow31CornerPick: corpus[index].b1RainRow31CornerPick ?? 0,
    b1RainRow31WorldX: corpus[index].b1RainRow31WorldX ?? 0,
    b1RainRow31WorldY: corpus[index].b1RainRow31WorldY ?? 0,
    b1RainRow31SearchOk: corpus[index].b1RainRow31SearchOk ?? 0,
    b1RainRow31SearchDraws: corpus[index].b1RainRow31SearchDraws ?? 0,
    b1RainRow31CreateEntityPtr: corpus[index].b1RainRow31CreateEntityPtr ?? 0,
    b1RainRow31BindRepositioned: corpus[index].b1RainRow31BindRepositioned ?? 0,
    b1RainRow31BindReposDraws: corpus[index].b1RainRow31BindReposDraws ?? 0,
    b1RainRow31ReposX: corpus[index].b1RainRow31ReposX ?? 0,
    b1RainRow31ReposY: corpus[index].b1RainRow31ReposY ?? 0,
    b1RainRow31BindStore7764: corpus[index].b1RainRow31BindStore7764 ?? 0,
    b1RainRow32IterIndex: corpus[index].b1RainRow32IterIndex ?? 0,
    b1RainRow32ShuffleSeedIn: corpus[index].b1RainRow32ShuffleSeedIn ?? 0,
    b1RainRow32ShuffleSeedOut: corpus[index].b1RainRow32ShuffleSeedOut ?? 0,
    b1RainRow32CornerPick: corpus[index].b1RainRow32CornerPick ?? 0,
    b1RainRow32WorldX: corpus[index].b1RainRow32WorldX ?? 0,
    b1RainRow32WorldY: corpus[index].b1RainRow32WorldY ?? 0,
    b1RainRow32SearchOk: corpus[index].b1RainRow32SearchOk ?? 0,
    b1RainRow32SearchDraws: corpus[index].b1RainRow32SearchDraws ?? 0,
    b1RainRow32CreateEntityPtr: corpus[index].b1RainRow32CreateEntityPtr ?? 0,
    b1RainRow32BindRepositioned: corpus[index].b1RainRow32BindRepositioned ?? 0,
    b1RainRow32BindReposDraws: corpus[index].b1RainRow32BindReposDraws ?? 0,
    b1RainRow32ReposX: corpus[index].b1RainRow32ReposX ?? 0,
    b1RainRow32ReposY: corpus[index].b1RainRow32ReposY ?? 0,
    b1RainRow32BindStore7764: corpus[index].b1RainRow32BindStore7764 ?? 0,
    b1RainRow33IterIndex: corpus[index].b1RainRow33IterIndex ?? 0,
    b1RainRow33ShuffleSeedIn: corpus[index].b1RainRow33ShuffleSeedIn ?? 0,
    b1RainRow33ShuffleSeedOut: corpus[index].b1RainRow33ShuffleSeedOut ?? 0,
    b1RainRow33CornerPick: corpus[index].b1RainRow33CornerPick ?? 0,
    b1RainRow33WorldX: corpus[index].b1RainRow33WorldX ?? 0,
    b1RainRow33WorldY: corpus[index].b1RainRow33WorldY ?? 0,
    b1RainRow33SearchOk: corpus[index].b1RainRow33SearchOk ?? 0,
    b1RainRow33SearchDraws: corpus[index].b1RainRow33SearchDraws ?? 0,
    b1RainRow33CreateEntityPtr: corpus[index].b1RainRow33CreateEntityPtr ?? 0,
    b1RainRow33BindRepositioned: corpus[index].b1RainRow33BindRepositioned ?? 0,
    b1RainRow33BindReposDraws: corpus[index].b1RainRow33BindReposDraws ?? 0,
    b1RainRow33ReposX: corpus[index].b1RainRow33ReposX ?? 0,
    b1RainRow33ReposY: corpus[index].b1RainRow33ReposY ?? 0,
    b1RainRow33BindStore7764: corpus[index].b1RainRow33BindStore7764 ?? 0,
    b1RainRow34IterIndex: corpus[index].b1RainRow34IterIndex ?? 0,
    b1RainRow34ShuffleSeedIn: corpus[index].b1RainRow34ShuffleSeedIn ?? 0,
    b1RainRow34ShuffleSeedOut: corpus[index].b1RainRow34ShuffleSeedOut ?? 0,
    b1RainRow34CornerPick: corpus[index].b1RainRow34CornerPick ?? 0,
    b1RainRow34WorldX: corpus[index].b1RainRow34WorldX ?? 0,
    b1RainRow34WorldY: corpus[index].b1RainRow34WorldY ?? 0,
    b1RainRow34SearchOk: corpus[index].b1RainRow34SearchOk ?? 0,
    b1RainRow34SearchDraws: corpus[index].b1RainRow34SearchDraws ?? 0,
    b1RainRow34CreateEntityPtr: corpus[index].b1RainRow34CreateEntityPtr ?? 0,
    b1RainRow34BindRepositioned: corpus[index].b1RainRow34BindRepositioned ?? 0,
    b1RainRow34BindReposDraws: corpus[index].b1RainRow34BindReposDraws ?? 0,
    b1RainRow34ReposX: corpus[index].b1RainRow34ReposX ?? 0,
    b1RainRow34ReposY: corpus[index].b1RainRow34ReposY ?? 0,
    b1RainRow34BindStore7764: corpus[index].b1RainRow34BindStore7764 ?? 0,
    b1RainRow35IterIndex: corpus[index].b1RainRow35IterIndex ?? 0,
    b1RainRow35ShuffleSeedIn: corpus[index].b1RainRow35ShuffleSeedIn ?? 0,
    b1RainRow35ShuffleSeedOut: corpus[index].b1RainRow35ShuffleSeedOut ?? 0,
    b1RainRow35CornerPick: corpus[index].b1RainRow35CornerPick ?? 0,
    b1RainRow35WorldX: corpus[index].b1RainRow35WorldX ?? 0,
    b1RainRow35WorldY: corpus[index].b1RainRow35WorldY ?? 0,
    b1RainRow35SearchOk: corpus[index].b1RainRow35SearchOk ?? 0,
    b1RainRow35SearchDraws: corpus[index].b1RainRow35SearchDraws ?? 0,
    b1RainRow35CreateEntityPtr: corpus[index].b1RainRow35CreateEntityPtr ?? 0,
    b1RainRow35BindRepositioned: corpus[index].b1RainRow35BindRepositioned ?? 0,
    b1RainRow35BindReposDraws: corpus[index].b1RainRow35BindReposDraws ?? 0,
    b1RainRow35ReposX: corpus[index].b1RainRow35ReposX ?? 0,
    b1RainRow35ReposY: corpus[index].b1RainRow35ReposY ?? 0,
    b1RainRow35BindStore7764: corpus[index].b1RainRow35BindStore7764 ?? 0,
    b1RainRow36IterIndex: corpus[index].b1RainRow36IterIndex ?? 0,
    b1RainRow36ShuffleSeedIn: corpus[index].b1RainRow36ShuffleSeedIn ?? 0,
    b1RainRow36ShuffleSeedOut: corpus[index].b1RainRow36ShuffleSeedOut ?? 0,
    b1RainRow36CornerPick: corpus[index].b1RainRow36CornerPick ?? 0,
    b1RainRow36WorldX: corpus[index].b1RainRow36WorldX ?? 0,
    b1RainRow36WorldY: corpus[index].b1RainRow36WorldY ?? 0,
    b1RainRow36SearchOk: corpus[index].b1RainRow36SearchOk ?? 0,
    b1RainRow36SearchDraws: corpus[index].b1RainRow36SearchDraws ?? 0,
    b1RainRow36CreateEntityPtr: corpus[index].b1RainRow36CreateEntityPtr ?? 0,
    b1RainRow36BindRepositioned: corpus[index].b1RainRow36BindRepositioned ?? 0,
    b1RainRow36BindReposDraws: corpus[index].b1RainRow36BindReposDraws ?? 0,
    b1RainRow36ReposX: corpus[index].b1RainRow36ReposX ?? 0,
    b1RainRow36ReposY: corpus[index].b1RainRow36ReposY ?? 0,
    b1RainRow36BindStore7764: corpus[index].b1RainRow36BindStore7764 ?? 0,
    b1RainRow37IterIndex: corpus[index].b1RainRow37IterIndex ?? 0,
    b1RainRow37ShuffleSeedIn: corpus[index].b1RainRow37ShuffleSeedIn ?? 0,
    b1RainRow37ShuffleSeedOut: corpus[index].b1RainRow37ShuffleSeedOut ?? 0,
    b1RainRow37CornerPick: corpus[index].b1RainRow37CornerPick ?? 0,
    b1RainRow37WorldX: corpus[index].b1RainRow37WorldX ?? 0,
    b1RainRow37WorldY: corpus[index].b1RainRow37WorldY ?? 0,
    b1RainRow37SearchOk: corpus[index].b1RainRow37SearchOk ?? 0,
    b1RainRow37SearchDraws: corpus[index].b1RainRow37SearchDraws ?? 0,
    b1RainRow37CreateEntityPtr: corpus[index].b1RainRow37CreateEntityPtr ?? 0,
    b1RainRow37BindRepositioned: corpus[index].b1RainRow37BindRepositioned ?? 0,
    b1RainRow37BindReposDraws: corpus[index].b1RainRow37BindReposDraws ?? 0,
    b1RainRow37ReposX: corpus[index].b1RainRow37ReposX ?? 0,
    b1RainRow37ReposY: corpus[index].b1RainRow37ReposY ?? 0,
    b1RainRow37BindStore7764: corpus[index].b1RainRow37BindStore7764 ?? 0,
    b1RainRow38IterIndex: corpus[index].b1RainRow38IterIndex ?? 0,
    b1RainRow38ShuffleSeedIn: corpus[index].b1RainRow38ShuffleSeedIn ?? 0,
    b1RainRow38ShuffleSeedOut: corpus[index].b1RainRow38ShuffleSeedOut ?? 0,
    b1RainRow38CornerPick: corpus[index].b1RainRow38CornerPick ?? 0,
    b1RainRow38WorldX: corpus[index].b1RainRow38WorldX ?? 0,
    b1RainRow38WorldY: corpus[index].b1RainRow38WorldY ?? 0,
    b1RainRow38SearchOk: corpus[index].b1RainRow38SearchOk ?? 0,
    b1RainRow38SearchDraws: corpus[index].b1RainRow38SearchDraws ?? 0,
    b1RainRow38CreateEntityPtr: corpus[index].b1RainRow38CreateEntityPtr ?? 0,
    b1RainRow38BindRepositioned: corpus[index].b1RainRow38BindRepositioned ?? 0,
    b1RainRow38BindReposDraws: corpus[index].b1RainRow38BindReposDraws ?? 0,
    b1RainRow38ReposX: corpus[index].b1RainRow38ReposX ?? 0,
    b1RainRow38ReposY: corpus[index].b1RainRow38ReposY ?? 0,
    b1RainRow38BindStore7764: corpus[index].b1RainRow38BindStore7764 ?? 0,
    b1RainRow39IterIndex: corpus[index].b1RainRow39IterIndex ?? 0,
    b1RainRow39ShuffleSeedIn: corpus[index].b1RainRow39ShuffleSeedIn ?? 0,
    b1RainRow39ShuffleSeedOut: corpus[index].b1RainRow39ShuffleSeedOut ?? 0,
    b1RainRow39CornerPick: corpus[index].b1RainRow39CornerPick ?? 0,
    b1RainRow39WorldX: corpus[index].b1RainRow39WorldX ?? 0,
    b1RainRow39WorldY: corpus[index].b1RainRow39WorldY ?? 0,
    b1RainRow39SearchOk: corpus[index].b1RainRow39SearchOk ?? 0,
    b1RainRow39SearchDraws: corpus[index].b1RainRow39SearchDraws ?? 0,
    b1RainRow39CreateEntityPtr: corpus[index].b1RainRow39CreateEntityPtr ?? 0,
    b1RainRow39BindRepositioned: corpus[index].b1RainRow39BindRepositioned ?? 0,
    b1RainRow39BindReposDraws: corpus[index].b1RainRow39BindReposDraws ?? 0,
    b1RainRow39ReposX: corpus[index].b1RainRow39ReposX ?? 0,
    b1RainRow39ReposY: corpus[index].b1RainRow39ReposY ?? 0,
    b1RainRow39BindStore7764: corpus[index].b1RainRow39BindStore7764 ?? 0,
    b1RainRow40IterIndex: corpus[index].b1RainRow40IterIndex ?? 0,
    b1RainRow40ShuffleSeedIn: corpus[index].b1RainRow40ShuffleSeedIn ?? 0,
    b1RainRow40ShuffleSeedOut: corpus[index].b1RainRow40ShuffleSeedOut ?? 0,
    b1RainRow40CornerPick: corpus[index].b1RainRow40CornerPick ?? 0,
    b1RainRow40WorldX: corpus[index].b1RainRow40WorldX ?? 0,
    b1RainRow40WorldY: corpus[index].b1RainRow40WorldY ?? 0,
    b1RainRow40SearchOk: corpus[index].b1RainRow40SearchOk ?? 0,
    b1RainRow40SearchDraws: corpus[index].b1RainRow40SearchDraws ?? 0,
    b1RainRow40CreateEntityPtr: corpus[index].b1RainRow40CreateEntityPtr ?? 0,
    b1RainRow40BindRepositioned: corpus[index].b1RainRow40BindRepositioned ?? 0,
    b1RainRow40BindReposDraws: corpus[index].b1RainRow40BindReposDraws ?? 0,
    b1RainRow40ReposX: corpus[index].b1RainRow40ReposX ?? 0,
    b1RainRow40ReposY: corpus[index].b1RainRow40ReposY ?? 0,
    b1RainRow40BindStore7764: corpus[index].b1RainRow40BindStore7764 ?? 0,
    b1RainRow41IterIndex: corpus[index].b1RainRow41IterIndex ?? 0,
    b1RainRow41ShuffleSeedIn: corpus[index].b1RainRow41ShuffleSeedIn ?? 0,
    b1RainRow41ShuffleSeedOut: corpus[index].b1RainRow41ShuffleSeedOut ?? 0,
    b1RainRow41CornerPick: corpus[index].b1RainRow41CornerPick ?? 0,
    b1RainRow41WorldX: corpus[index].b1RainRow41WorldX ?? 0,
    b1RainRow41WorldY: corpus[index].b1RainRow41WorldY ?? 0,
    b1RainRow41SearchOk: corpus[index].b1RainRow41SearchOk ?? 0,
    b1RainRow41SearchDraws: corpus[index].b1RainRow41SearchDraws ?? 0,
    b1RainRow41CreateEntityPtr: corpus[index].b1RainRow41CreateEntityPtr ?? 0,
    b1RainRow41BindRepositioned: corpus[index].b1RainRow41BindRepositioned ?? 0,
    b1RainRow41BindReposDraws: corpus[index].b1RainRow41BindReposDraws ?? 0,
    b1RainRow41ReposX: corpus[index].b1RainRow41ReposX ?? 0,
    b1RainRow41ReposY: corpus[index].b1RainRow41ReposY ?? 0,
    b1RainRow41BindStore7764: corpus[index].b1RainRow41BindStore7764 ?? 0,
    b1RainRow42IterIndex: corpus[index].b1RainRow42IterIndex ?? 0,
    b1RainRow42ShuffleSeedIn: corpus[index].b1RainRow42ShuffleSeedIn ?? 0,
    b1RainRow42ShuffleSeedOut: corpus[index].b1RainRow42ShuffleSeedOut ?? 0,
    b1RainRow42CornerPick: corpus[index].b1RainRow42CornerPick ?? 0,
    b1RainRow42WorldX: corpus[index].b1RainRow42WorldX ?? 0,
    b1RainRow42WorldY: corpus[index].b1RainRow42WorldY ?? 0,
    b1RainRow42SearchOk: corpus[index].b1RainRow42SearchOk ?? 0,
    b1RainRow42SearchDraws: corpus[index].b1RainRow42SearchDraws ?? 0,
    b1RainRow42CreateEntityPtr: corpus[index].b1RainRow42CreateEntityPtr ?? 0,
    b1RainRow42BindRepositioned: corpus[index].b1RainRow42BindRepositioned ?? 0,
    b1RainRow42BindReposDraws: corpus[index].b1RainRow42BindReposDraws ?? 0,
    b1RainRow42ReposX: corpus[index].b1RainRow42ReposX ?? 0,
    b1RainRow42ReposY: corpus[index].b1RainRow42ReposY ?? 0,
    b1RainRow42BindStore7764: corpus[index].b1RainRow42BindStore7764 ?? 0,
    b1RainRow43IterIndex: corpus[index].b1RainRow43IterIndex ?? 0,
    b1RainRow43ShuffleSeedIn: corpus[index].b1RainRow43ShuffleSeedIn ?? 0,
    b1RainRow43ShuffleSeedOut: corpus[index].b1RainRow43ShuffleSeedOut ?? 0,
    b1RainRow43CornerPick: corpus[index].b1RainRow43CornerPick ?? 0,
    b1RainRow43WorldX: corpus[index].b1RainRow43WorldX ?? 0,
    b1RainRow43WorldY: corpus[index].b1RainRow43WorldY ?? 0,
    b1RainRow43SearchOk: corpus[index].b1RainRow43SearchOk ?? 0,
    b1RainRow43SearchDraws: corpus[index].b1RainRow43SearchDraws ?? 0,
    b1RainRow43CreateEntityPtr: corpus[index].b1RainRow43CreateEntityPtr ?? 0,
    b1RainRow43BindRepositioned: corpus[index].b1RainRow43BindRepositioned ?? 0,
    b1RainRow43BindReposDraws: corpus[index].b1RainRow43BindReposDraws ?? 0,
    b1RainRow43ReposX: corpus[index].b1RainRow43ReposX ?? 0,
    b1RainRow43ReposY: corpus[index].b1RainRow43ReposY ?? 0,
    b1RainRow43BindStore7764: corpus[index].b1RainRow43BindStore7764 ?? 0,
    b1RainRow44IterIndex: corpus[index].b1RainRow44IterIndex ?? 0,
    b1RainRow44ShuffleSeedIn: corpus[index].b1RainRow44ShuffleSeedIn ?? 0,
    b1RainRow44ShuffleSeedOut: corpus[index].b1RainRow44ShuffleSeedOut ?? 0,
    b1RainRow44CornerPick: corpus[index].b1RainRow44CornerPick ?? 0,
    b1RainRow44WorldX: corpus[index].b1RainRow44WorldX ?? 0,
    b1RainRow44WorldY: corpus[index].b1RainRow44WorldY ?? 0,
    b1RainRow44SearchOk: corpus[index].b1RainRow44SearchOk ?? 0,
    b1RainRow44SearchDraws: corpus[index].b1RainRow44SearchDraws ?? 0,
    b1RainRow44CreateEntityPtr: corpus[index].b1RainRow44CreateEntityPtr ?? 0,
    b1RainRow44BindRepositioned: corpus[index].b1RainRow44BindRepositioned ?? 0,
    b1RainRow44BindReposDraws: corpus[index].b1RainRow44BindReposDraws ?? 0,
    b1RainRow44ReposX: corpus[index].b1RainRow44ReposX ?? 0,
    b1RainRow44ReposY: corpus[index].b1RainRow44ReposY ?? 0,
    b1RainRow44BindStore7764: corpus[index].b1RainRow44BindStore7764 ?? 0,
    b1RainRow45IterIndex: corpus[index].b1RainRow45IterIndex ?? 0,
    b1RainRow45ShuffleSeedIn: corpus[index].b1RainRow45ShuffleSeedIn ?? 0,
    b1RainRow45ShuffleSeedOut: corpus[index].b1RainRow45ShuffleSeedOut ?? 0,
    b1RainRow45CornerPick: corpus[index].b1RainRow45CornerPick ?? 0,
    b1RainRow45WorldX: corpus[index].b1RainRow45WorldX ?? 0,
    b1RainRow45WorldY: corpus[index].b1RainRow45WorldY ?? 0,
    b1RainRow45SearchOk: corpus[index].b1RainRow45SearchOk ?? 0,
    b1RainRow45SearchDraws: corpus[index].b1RainRow45SearchDraws ?? 0,
    b1RainRow45CreateEntityPtr: corpus[index].b1RainRow45CreateEntityPtr ?? 0,
    b1RainRow45BindRepositioned: corpus[index].b1RainRow45BindRepositioned ?? 0,
    b1RainRow45BindReposDraws: corpus[index].b1RainRow45BindReposDraws ?? 0,
    b1RainRow45ReposX: corpus[index].b1RainRow45ReposX ?? 0,
    b1RainRow45ReposY: corpus[index].b1RainRow45ReposY ?? 0,
    b1RainRow45BindStore7764: corpus[index].b1RainRow45BindStore7764 ?? 0,
    b1RainRow46IterIndex: corpus[index].b1RainRow46IterIndex ?? 0,
    b1RainRow46ShuffleSeedIn: corpus[index].b1RainRow46ShuffleSeedIn ?? 0,
    b1RainRow46ShuffleSeedOut: corpus[index].b1RainRow46ShuffleSeedOut ?? 0,
    b1RainRow46CornerPick: corpus[index].b1RainRow46CornerPick ?? 0,
    b1RainRow46WorldX: corpus[index].b1RainRow46WorldX ?? 0,
    b1RainRow46WorldY: corpus[index].b1RainRow46WorldY ?? 0,
    b1RainRow46SearchOk: corpus[index].b1RainRow46SearchOk ?? 0,
    b1RainRow46SearchDraws: corpus[index].b1RainRow46SearchDraws ?? 0,
    b1RainRow46CreateEntityPtr: corpus[index].b1RainRow46CreateEntityPtr ?? 0,
    b1RainRow46BindRepositioned: corpus[index].b1RainRow46BindRepositioned ?? 0,
    b1RainRow46BindReposDraws: corpus[index].b1RainRow46BindReposDraws ?? 0,
    b1RainRow46ReposX: corpus[index].b1RainRow46ReposX ?? 0,
    b1RainRow46ReposY: corpus[index].b1RainRow46ReposY ?? 0,
    b1RainRow46BindStore7764: corpus[index].b1RainRow46BindStore7764 ?? 0,
    b1RainRow47IterIndex: corpus[index].b1RainRow47IterIndex ?? 0,
    b1RainRow47ShuffleSeedIn: corpus[index].b1RainRow47ShuffleSeedIn ?? 0,
    b1RainRow47ShuffleSeedOut: corpus[index].b1RainRow47ShuffleSeedOut ?? 0,
    b1RainRow47CornerPick: corpus[index].b1RainRow47CornerPick ?? 0,
    b1RainRow47WorldX: corpus[index].b1RainRow47WorldX ?? 0,
    b1RainRow47WorldY: corpus[index].b1RainRow47WorldY ?? 0,
    b1RainRow47SearchOk: corpus[index].b1RainRow47SearchOk ?? 0,
    b1RainRow47SearchDraws: corpus[index].b1RainRow47SearchDraws ?? 0,
    b1RainRow47CreateEntityPtr: corpus[index].b1RainRow47CreateEntityPtr ?? 0,
    b1RainRow47BindRepositioned: corpus[index].b1RainRow47BindRepositioned ?? 0,
    b1RainRow47BindReposDraws: corpus[index].b1RainRow47BindReposDraws ?? 0,
    b1RainRow47ReposX: corpus[index].b1RainRow47ReposX ?? 0,
    b1RainRow47ReposY: corpus[index].b1RainRow47ReposY ?? 0,
    b1RainRow47BindStore7764: corpus[index].b1RainRow47BindStore7764 ?? 0,
    b1RainRow48IterIndex: corpus[index].b1RainRow48IterIndex ?? 0,
    b1RainRow48ShuffleSeedIn: corpus[index].b1RainRow48ShuffleSeedIn ?? 0,
    b1RainRow48ShuffleSeedOut: corpus[index].b1RainRow48ShuffleSeedOut ?? 0,
    b1RainRow48CornerPick: corpus[index].b1RainRow48CornerPick ?? 0,
    b1RainRow48WorldX: corpus[index].b1RainRow48WorldX ?? 0,
    b1RainRow48WorldY: corpus[index].b1RainRow48WorldY ?? 0,
    b1RainRow48SearchOk: corpus[index].b1RainRow48SearchOk ?? 0,
    b1RainRow48SearchDraws: corpus[index].b1RainRow48SearchDraws ?? 0,
    b1RainRow48CreateEntityPtr: corpus[index].b1RainRow48CreateEntityPtr ?? 0,
    b1RainRow48BindRepositioned: corpus[index].b1RainRow48BindRepositioned ?? 0,
    b1RainRow48BindReposDraws: corpus[index].b1RainRow48BindReposDraws ?? 0,
    b1RainRow48ReposX: corpus[index].b1RainRow48ReposX ?? 0,
    b1RainRow48ReposY: corpus[index].b1RainRow48ReposY ?? 0,
    b1RainRow48BindStore7764: corpus[index].b1RainRow48BindStore7764 ?? 0,
    b1RainRow49IterIndex: corpus[index].b1RainRow49IterIndex ?? 0,
    b1RainRow49ShuffleSeedIn: corpus[index].b1RainRow49ShuffleSeedIn ?? 0,
    b1RainRow49ShuffleSeedOut: corpus[index].b1RainRow49ShuffleSeedOut ?? 0,
    b1RainRow49CornerPick: corpus[index].b1RainRow49CornerPick ?? 0,
    b1RainRow49WorldX: corpus[index].b1RainRow49WorldX ?? 0,
    b1RainRow49WorldY: corpus[index].b1RainRow49WorldY ?? 0,
    b1RainRow49SearchOk: corpus[index].b1RainRow49SearchOk ?? 0,
    b1RainRow49SearchDraws: corpus[index].b1RainRow49SearchDraws ?? 0,
    b1RainRow49CreateEntityPtr: corpus[index].b1RainRow49CreateEntityPtr ?? 0,
    b1RainRow49BindRepositioned: corpus[index].b1RainRow49BindRepositioned ?? 0,
    b1RainRow49BindReposDraws: corpus[index].b1RainRow49BindReposDraws ?? 0,
    b1RainRow49ReposX: corpus[index].b1RainRow49ReposX ?? 0,
    b1RainRow49ReposY: corpus[index].b1RainRow49ReposY ?? 0,
    b1RainRow49BindStore7764: corpus[index].b1RainRow49BindStore7764 ?? 0,
    b1RainRow50IterIndex: corpus[index].b1RainRow50IterIndex ?? 0,
    b1RainRow50ShuffleSeedIn: corpus[index].b1RainRow50ShuffleSeedIn ?? 0,
    b1RainRow50ShuffleSeedOut: corpus[index].b1RainRow50ShuffleSeedOut ?? 0,
    b1RainRow50CornerPick: corpus[index].b1RainRow50CornerPick ?? 0,
    b1RainRow50WorldX: corpus[index].b1RainRow50WorldX ?? 0,
    b1RainRow50WorldY: corpus[index].b1RainRow50WorldY ?? 0,
    b1RainRow50SearchOk: corpus[index].b1RainRow50SearchOk ?? 0,
    b1RainRow50SearchDraws: corpus[index].b1RainRow50SearchDraws ?? 0,
    b1RainRow50CreateEntityPtr: corpus[index].b1RainRow50CreateEntityPtr ?? 0,
    b1RainRow50BindRepositioned: corpus[index].b1RainRow50BindRepositioned ?? 0,
    b1RainRow50BindReposDraws: corpus[index].b1RainRow50BindReposDraws ?? 0,
    b1RainRow50ReposX: corpus[index].b1RainRow50ReposX ?? 0,
    b1RainRow50ReposY: corpus[index].b1RainRow50ReposY ?? 0,
    b1RainRow50BindStore7764: corpus[index].b1RainRow50BindStore7764 ?? 0,
    b1RainRow51IterIndex: corpus[index].b1RainRow51IterIndex ?? 0,
    b1RainRow51ShuffleSeedIn: corpus[index].b1RainRow51ShuffleSeedIn ?? 0,
    b1RainRow51ShuffleSeedOut: corpus[index].b1RainRow51ShuffleSeedOut ?? 0,
    b1RainRow51CornerPick: corpus[index].b1RainRow51CornerPick ?? 0,
    b1RainRow51WorldX: corpus[index].b1RainRow51WorldX ?? 0,
    b1RainRow51WorldY: corpus[index].b1RainRow51WorldY ?? 0,
    b1RainRow51SearchOk: corpus[index].b1RainRow51SearchOk ?? 0,
    b1RainRow51SearchDraws: corpus[index].b1RainRow51SearchDraws ?? 0,
    b1RainRow51CreateEntityPtr: corpus[index].b1RainRow51CreateEntityPtr ?? 0,
    b1RainRow51BindRepositioned: corpus[index].b1RainRow51BindRepositioned ?? 0,
    b1RainRow51BindReposDraws: corpus[index].b1RainRow51BindReposDraws ?? 0,
    b1RainRow51ReposX: corpus[index].b1RainRow51ReposX ?? 0,
    b1RainRow51ReposY: corpus[index].b1RainRow51ReposY ?? 0,
    b1RainRow51BindStore7764: corpus[index].b1RainRow51BindStore7764 ?? 0,
    b1RainRow52IterIndex: corpus[index].b1RainRow52IterIndex ?? 0,
    b1RainRow52ShuffleSeedIn: corpus[index].b1RainRow52ShuffleSeedIn ?? 0,
    b1RainRow52ShuffleSeedOut: corpus[index].b1RainRow52ShuffleSeedOut ?? 0,
    b1RainRow52CornerPick: corpus[index].b1RainRow52CornerPick ?? 0,
    b1RainRow52WorldX: corpus[index].b1RainRow52WorldX ?? 0,
    b1RainRow52WorldY: corpus[index].b1RainRow52WorldY ?? 0,
    b1RainRow52SearchOk: corpus[index].b1RainRow52SearchOk ?? 0,
    b1RainRow52SearchDraws: corpus[index].b1RainRow52SearchDraws ?? 0,
    b1RainRow52CreateEntityPtr: corpus[index].b1RainRow52CreateEntityPtr ?? 0,
    b1RainRow52BindRepositioned: corpus[index].b1RainRow52BindRepositioned ?? 0,
    b1RainRow52BindReposDraws: corpus[index].b1RainRow52BindReposDraws ?? 0,
    b1RainRow52ReposX: corpus[index].b1RainRow52ReposX ?? 0,
    b1RainRow52ReposY: corpus[index].b1RainRow52ReposY ?? 0,
    b1RainRow52BindStore7764: corpus[index].b1RainRow52BindStore7764 ?? 0,
    b1RainRow53IterIndex: corpus[index].b1RainRow53IterIndex ?? 0,
    b1RainRow53ShuffleSeedIn: corpus[index].b1RainRow53ShuffleSeedIn ?? 0,
    b1RainRow53ShuffleSeedOut: corpus[index].b1RainRow53ShuffleSeedOut ?? 0,
    b1RainRow53CornerPick: corpus[index].b1RainRow53CornerPick ?? 0,
    b1RainRow53WorldX: corpus[index].b1RainRow53WorldX ?? 0,
    b1RainRow53WorldY: corpus[index].b1RainRow53WorldY ?? 0,
    b1RainRow53SearchOk: corpus[index].b1RainRow53SearchOk ?? 0,
    b1RainRow53SearchDraws: corpus[index].b1RainRow53SearchDraws ?? 0,
    b1RainRow53CreateEntityPtr: corpus[index].b1RainRow53CreateEntityPtr ?? 0,
    b1RainRow53BindRepositioned: corpus[index].b1RainRow53BindRepositioned ?? 0,
    b1RainRow53BindReposDraws: corpus[index].b1RainRow53BindReposDraws ?? 0,
    b1RainRow53ReposX: corpus[index].b1RainRow53ReposX ?? 0,
    b1RainRow53ReposY: corpus[index].b1RainRow53ReposY ?? 0,
    b1RainRow53BindStore7764: corpus[index].b1RainRow53BindStore7764 ?? 0,
    b1RainRow54IterIndex: corpus[index].b1RainRow54IterIndex ?? 0,
    b1RainRow54ShuffleSeedIn: corpus[index].b1RainRow54ShuffleSeedIn ?? 0,
    b1RainRow54ShuffleSeedOut: corpus[index].b1RainRow54ShuffleSeedOut ?? 0,
    b1RainRow54CornerPick: corpus[index].b1RainRow54CornerPick ?? 0,
    b1RainRow54WorldX: corpus[index].b1RainRow54WorldX ?? 0,
    b1RainRow54WorldY: corpus[index].b1RainRow54WorldY ?? 0,
    b1RainRow54SearchOk: corpus[index].b1RainRow54SearchOk ?? 0,
    b1RainRow54SearchDraws: corpus[index].b1RainRow54SearchDraws ?? 0,
    b1RainRow54CreateEntityPtr: corpus[index].b1RainRow54CreateEntityPtr ?? 0,
    b1RainRow54BindRepositioned: corpus[index].b1RainRow54BindRepositioned ?? 0,
    b1RainRow54BindReposDraws: corpus[index].b1RainRow54BindReposDraws ?? 0,
    b1RainRow54ReposX: corpus[index].b1RainRow54ReposX ?? 0,
    b1RainRow54ReposY: corpus[index].b1RainRow54ReposY ?? 0,
    b1RainRow54BindStore7764: corpus[index].b1RainRow54BindStore7764 ?? 0,
    b1RainRow55IterIndex: corpus[index].b1RainRow55IterIndex ?? 0,
    b1RainRow55ShuffleSeedIn: corpus[index].b1RainRow55ShuffleSeedIn ?? 0,
    b1RainRow55ShuffleSeedOut: corpus[index].b1RainRow55ShuffleSeedOut ?? 0,
    b1RainRow55CornerPick: corpus[index].b1RainRow55CornerPick ?? 0,
    b1RainRow55WorldX: corpus[index].b1RainRow55WorldX ?? 0,
    b1RainRow55WorldY: corpus[index].b1RainRow55WorldY ?? 0,
    b1RainRow55SearchOk: corpus[index].b1RainRow55SearchOk ?? 0,
    b1RainRow55SearchDraws: corpus[index].b1RainRow55SearchDraws ?? 0,
    b1RainRow55CreateEntityPtr: corpus[index].b1RainRow55CreateEntityPtr ?? 0,
    b1RainRow55BindRepositioned: corpus[index].b1RainRow55BindRepositioned ?? 0,
    b1RainRow55BindReposDraws: corpus[index].b1RainRow55BindReposDraws ?? 0,
    b1RainRow55ReposX: corpus[index].b1RainRow55ReposX ?? 0,
    b1RainRow55ReposY: corpus[index].b1RainRow55ReposY ?? 0,
    b1RainRow55BindStore7764: corpus[index].b1RainRow55BindStore7764 ?? 0,
    b1RainRow56IterIndex: corpus[index].b1RainRow56IterIndex ?? 0,
    b1RainRow56ShuffleSeedIn: corpus[index].b1RainRow56ShuffleSeedIn ?? 0,
    b1RainRow56ShuffleSeedOut: corpus[index].b1RainRow56ShuffleSeedOut ?? 0,
    b1RainRow56CornerPick: corpus[index].b1RainRow56CornerPick ?? 0,
    b1RainRow56WorldX: corpus[index].b1RainRow56WorldX ?? 0,
    b1RainRow56WorldY: corpus[index].b1RainRow56WorldY ?? 0,
    b1RainRow56SearchOk: corpus[index].b1RainRow56SearchOk ?? 0,
    b1RainRow56SearchDraws: corpus[index].b1RainRow56SearchDraws ?? 0,
    b1RainRow56CreateEntityPtr: corpus[index].b1RainRow56CreateEntityPtr ?? 0,
    b1RainRow56BindRepositioned: corpus[index].b1RainRow56BindRepositioned ?? 0,
    b1RainRow56BindReposDraws: corpus[index].b1RainRow56BindReposDraws ?? 0,
    b1RainRow56ReposX: corpus[index].b1RainRow56ReposX ?? 0,
    b1RainRow56ReposY: corpus[index].b1RainRow56ReposY ?? 0,
    b1RainRow56BindStore7764: corpus[index].b1RainRow56BindStore7764 ?? 0,
    b1RainRow57IterIndex: corpus[index].b1RainRow57IterIndex ?? 0,
    b1RainRow57ShuffleSeedIn: corpus[index].b1RainRow57ShuffleSeedIn ?? 0,
    b1RainRow57ShuffleSeedOut: corpus[index].b1RainRow57ShuffleSeedOut ?? 0,
    b1RainRow57CornerPick: corpus[index].b1RainRow57CornerPick ?? 0,
    b1RainRow57WorldX: corpus[index].b1RainRow57WorldX ?? 0,
    b1RainRow57WorldY: corpus[index].b1RainRow57WorldY ?? 0,
    b1RainRow57SearchOk: corpus[index].b1RainRow57SearchOk ?? 0,
    b1RainRow57SearchDraws: corpus[index].b1RainRow57SearchDraws ?? 0,
    b1RainRow57CreateEntityPtr: corpus[index].b1RainRow57CreateEntityPtr ?? 0,
    b1RainRow57BindRepositioned: corpus[index].b1RainRow57BindRepositioned ?? 0,
    b1RainRow57BindReposDraws: corpus[index].b1RainRow57BindReposDraws ?? 0,
    b1RainRow57ReposX: corpus[index].b1RainRow57ReposX ?? 0,
    b1RainRow57ReposY: corpus[index].b1RainRow57ReposY ?? 0,
    b1RainRow57BindStore7764: corpus[index].b1RainRow57BindStore7764 ?? 0,
    b1RainRow58IterIndex: corpus[index].b1RainRow58IterIndex ?? 0,
    b1RainRow58ShuffleSeedIn: corpus[index].b1RainRow58ShuffleSeedIn ?? 0,
    b1RainRow58ShuffleSeedOut: corpus[index].b1RainRow58ShuffleSeedOut ?? 0,
    b1RainRow58CornerPick: corpus[index].b1RainRow58CornerPick ?? 0,
    b1RainRow58WorldX: corpus[index].b1RainRow58WorldX ?? 0,
    b1RainRow58WorldY: corpus[index].b1RainRow58WorldY ?? 0,
    b1RainRow58SearchOk: corpus[index].b1RainRow58SearchOk ?? 0,
    b1RainRow58SearchDraws: corpus[index].b1RainRow58SearchDraws ?? 0,
    b1RainRow58CreateEntityPtr: corpus[index].b1RainRow58CreateEntityPtr ?? 0,
    b1RainRow58BindRepositioned: corpus[index].b1RainRow58BindRepositioned ?? 0,
    b1RainRow58BindReposDraws: corpus[index].b1RainRow58BindReposDraws ?? 0,
    b1RainRow58ReposX: corpus[index].b1RainRow58ReposX ?? 0,
    b1RainRow58ReposY: corpus[index].b1RainRow58ReposY ?? 0,
    b1RainRow58BindStore7764: corpus[index].b1RainRow58BindStore7764 ?? 0,
    b1RainRow59IterIndex: corpus[index].b1RainRow59IterIndex ?? 0,
    b1RainRow59ShuffleSeedIn: corpus[index].b1RainRow59ShuffleSeedIn ?? 0,
    b1RainRow59ShuffleSeedOut: corpus[index].b1RainRow59ShuffleSeedOut ?? 0,
    b1RainRow59CornerPick: corpus[index].b1RainRow59CornerPick ?? 0,
    b1RainRow59WorldX: corpus[index].b1RainRow59WorldX ?? 0,
    b1RainRow59WorldY: corpus[index].b1RainRow59WorldY ?? 0,
    b1RainRow59SearchOk: corpus[index].b1RainRow59SearchOk ?? 0,
    b1RainRow59SearchDraws: corpus[index].b1RainRow59SearchDraws ?? 0,
    b1RainRow59CreateEntityPtr: corpus[index].b1RainRow59CreateEntityPtr ?? 0,
    b1RainRow59BindRepositioned: corpus[index].b1RainRow59BindRepositioned ?? 0,
    b1RainRow59BindReposDraws: corpus[index].b1RainRow59BindReposDraws ?? 0,
    b1RainRow59ReposX: corpus[index].b1RainRow59ReposX ?? 0,
    b1RainRow59ReposY: corpus[index].b1RainRow59ReposY ?? 0,
    b1RainRow59BindStore7764: corpus[index].b1RainRow59BindStore7764 ?? 0,
    b1RainRow60IterIndex: corpus[index].b1RainRow60IterIndex ?? 0,
    b1RainRow60ShuffleSeedIn: corpus[index].b1RainRow60ShuffleSeedIn ?? 0,
    b1RainRow60ShuffleSeedOut: corpus[index].b1RainRow60ShuffleSeedOut ?? 0,
    b1RainRow60CornerPick: corpus[index].b1RainRow60CornerPick ?? 0,
    b1RainRow60WorldX: corpus[index].b1RainRow60WorldX ?? 0,
    b1RainRow60WorldY: corpus[index].b1RainRow60WorldY ?? 0,
    b1RainRow60SearchOk: corpus[index].b1RainRow60SearchOk ?? 0,
    b1RainRow60SearchDraws: corpus[index].b1RainRow60SearchDraws ?? 0,
    b1RainRow60CreateEntityPtr: corpus[index].b1RainRow60CreateEntityPtr ?? 0,
    b1RainRow60BindRepositioned: corpus[index].b1RainRow60BindRepositioned ?? 0,
    b1RainRow60BindReposDraws: corpus[index].b1RainRow60BindReposDraws ?? 0,
    b1RainRow60ReposX: corpus[index].b1RainRow60ReposX ?? 0,
    b1RainRow60ReposY: corpus[index].b1RainRow60ReposY ?? 0,
    b1RainRow60BindStore7764: corpus[index].b1RainRow60BindStore7764 ?? 0,
    b1RainRow61IterIndex: corpus[index].b1RainRow61IterIndex ?? 0,
    b1RainRow61ShuffleSeedIn: corpus[index].b1RainRow61ShuffleSeedIn ?? 0,
    b1RainRow61ShuffleSeedOut: corpus[index].b1RainRow61ShuffleSeedOut ?? 0,
    b1RainRow61CornerPick: corpus[index].b1RainRow61CornerPick ?? 0,
    b1RainRow61WorldX: corpus[index].b1RainRow61WorldX ?? 0,
    b1RainRow61WorldY: corpus[index].b1RainRow61WorldY ?? 0,
    b1RainRow61SearchOk: corpus[index].b1RainRow61SearchOk ?? 0,
    b1RainRow61SearchDraws: corpus[index].b1RainRow61SearchDraws ?? 0,
    b1RainRow61CreateEntityPtr: corpus[index].b1RainRow61CreateEntityPtr ?? 0,
    b1RainRow61BindRepositioned: corpus[index].b1RainRow61BindRepositioned ?? 0,
    b1RainRow61BindReposDraws: corpus[index].b1RainRow61BindReposDraws ?? 0,
    b1RainRow61ReposX: corpus[index].b1RainRow61ReposX ?? 0,
    b1RainRow61ReposY: corpus[index].b1RainRow61ReposY ?? 0,
    b1RainRow61BindStore7764: corpus[index].b1RainRow61BindStore7764 ?? 0,
    b1RainRow62IterIndex: corpus[index].b1RainRow62IterIndex ?? 0,
    b1RainRow62ShuffleSeedIn: corpus[index].b1RainRow62ShuffleSeedIn ?? 0,
    b1RainRow62ShuffleSeedOut: corpus[index].b1RainRow62ShuffleSeedOut ?? 0,
    b1RainRow62CornerPick: corpus[index].b1RainRow62CornerPick ?? 0,
    b1RainRow62WorldX: corpus[index].b1RainRow62WorldX ?? 0,
    b1RainRow62WorldY: corpus[index].b1RainRow62WorldY ?? 0,
    b1RainRow62SearchOk: corpus[index].b1RainRow62SearchOk ?? 0,
    b1RainRow62SearchDraws: corpus[index].b1RainRow62SearchDraws ?? 0,
    b1RainRow62CreateEntityPtr: corpus[index].b1RainRow62CreateEntityPtr ?? 0,
    b1RainRow62BindRepositioned: corpus[index].b1RainRow62BindRepositioned ?? 0,
    b1RainRow62BindReposDraws: corpus[index].b1RainRow62BindReposDraws ?? 0,
    b1RainRow62ReposX: corpus[index].b1RainRow62ReposX ?? 0,
    b1RainRow62ReposY: corpus[index].b1RainRow62ReposY ?? 0,
    b1RainRow62BindStore7764: corpus[index].b1RainRow62BindStore7764 ?? 0,
    b1RainRow63IterIndex: corpus[index].b1RainRow63IterIndex ?? 0,
    b1RainRow63ShuffleSeedIn: corpus[index].b1RainRow63ShuffleSeedIn ?? 0,
    b1RainRow63ShuffleSeedOut: corpus[index].b1RainRow63ShuffleSeedOut ?? 0,
    b1RainRow63CornerPick: corpus[index].b1RainRow63CornerPick ?? 0,
    b1RainRow63WorldX: corpus[index].b1RainRow63WorldX ?? 0,
    b1RainRow63WorldY: corpus[index].b1RainRow63WorldY ?? 0,
    b1RainRow63SearchOk: corpus[index].b1RainRow63SearchOk ?? 0,
    b1RainRow63SearchDraws: corpus[index].b1RainRow63SearchDraws ?? 0,
    b1RainRow63CreateEntityPtr: corpus[index].b1RainRow63CreateEntityPtr ?? 0,
    b1RainRow63BindRepositioned: corpus[index].b1RainRow63BindRepositioned ?? 0,
    b1RainRow63BindReposDraws: corpus[index].b1RainRow63BindReposDraws ?? 0,
    b1RainRow63ReposX: corpus[index].b1RainRow63ReposX ?? 0,
    b1RainRow63ReposY: corpus[index].b1RainRow63ReposY ?? 0,
    b1RainRow63BindStore7764: corpus[index].b1RainRow63BindStore7764 ?? 0,
    tca40HeadObj8: corpus[index].tca40HeadObj8 ?? 0,
    tca40HeadGame26630: corpus[index].tca40HeadGame26630 ?? 0,
    tca40HeadGameByte26589: corpus[index].tca40HeadGameByte26589 ?? 0,
    tca40HeadGame26550: corpus[index].tca40HeadGame26550 ?? 0,
    tca40HeadGameC: corpus[index].tca40HeadGameC ?? 0,
    tca40HeadGame18304: corpus[index].tca40HeadGame18304 ?? 0,
    tca40HeadGame182D0: corpus[index].tca40HeadGame182D0 ?? 0,
    tca40HeadGame4: corpus[index].tca40HeadGame4 ?? 0,
    tca40HeadRoom728: corpus[index].tca40HeadRoom728 ?? 0,
    tca40HeadH74Ea50Al: corpus[index].tca40HeadH74Ea50Al ?? 0,
    tca40HeadH706940H80: corpus[index].tca40HeadH706940H80 ?? 0,
    tca40HeadH6F9400: corpus[index].tca40HeadH6F9400 ?? 0,
    tca40HeadH6F95A0: corpus[index].tca40HeadH6F95A0 ?? 0,
    tca40HeadH740Bc0Ret8: corpus[index].tca40HeadH740Bc0Ret8 ?? 0,
    tca40HeadH706940BH80: corpus[index].tca40HeadH706940BH80 ?? 0,
    tca40HeadH74Bae0: corpus[index].tca40HeadH74Bae0 ?? 0,
    tca40HeadH74E9B0Al: corpus[index].tca40HeadH74E9B0Al ?? 0,
    tca40HeadH70D360: corpus[index].tca40HeadH70D360 ?? 0,
    tca40HeadObj1E3: corpus[index].tca40HeadObj1E3 ?? 0,
    tca40HeadGame18314: corpus[index].tca40HeadGame18314 ?? 0,
    tca40HeadSlotSeed: corpus[index].tca40HeadSlotSeed ?? 0,
    tca40HeadBm1: corpus[index].tca40HeadBm1 ?? 0,
    tca40HeadBm2: corpus[index].tca40HeadBm2 ?? 0,
    tca40HeadSlotOcc0: corpus[index].tca40HeadSlotOcc0 ?? 0,
    tca40HeadSlotOcc1: corpus[index].tca40HeadSlotOcc1 ?? 0,
    tca40HeadSlotOcc2: corpus[index].tca40HeadSlotOcc2 ?? 0,
    tca40HeadSlotOcc3: corpus[index].tca40HeadSlotOcc3 ?? 0,
    tca40HeadSlotOcc4: corpus[index].tca40HeadSlotOcc4 ?? 0,
    tca40HeadSlotOcc5: corpus[index].tca40HeadSlotOcc5 ?? 0,
    tca40HeadSlotOcc6: corpus[index].tca40HeadSlotOcc6 ?? 0,
    tca40HeadSlotOcc7: corpus[index].tca40HeadSlotOcc7 ?? 0,
    tca40HeadSlot8: corpus[index].tca40HeadSlot8 ?? 0,
    tca40HeadGenrandTail: corpus[index].tca40HeadGenrandTail ?? 0,
    tca40HeadRoomF10F8: corpus[index].tca40HeadRoomF10F8 ?? 0,
    tca40HeadR74Bba0F10F8: corpus[index].tca40HeadR74Bba0F10F8 ?? 0,
    tca40HeadR74Bba0BF10F8: corpus[index].tca40HeadR74Bba0BF10F8 ?? 0,
    /* ABI v34/v35: default non-empty so engine body residual still emits;
       blob not ready → full body residual (hosts+floats) unless a case opts in. */
    enginePlayerCount: corpus[index].enginePlayerCount ?? 1,
    enginePlayerBlobReady: corpus[index].enginePlayerBlobReady ?? 0,
    /* ABI v95 (record idx 22): engine-player BODY blob lanes — explicit
       per-key whitelist (a lane not named here reaches the module as ZERO
       and every body-decision case silently becomes a no-op; measured
       defect class). eligible = per-entry u8 flag (entry+0x2c==0)
       delivered oracle-side only (the module reads the seeded scratch);
       the 173 lanes are WIDE u32 WORDS (the laws re-narrow & 0xff). */
    enginePlayerEligible: corpus[index].enginePlayerEligible,
    enginePlayerEntry173Ready: corpus[index].enginePlayerEntry173Ready ?? 0,
    enginePlayerEntry173: corpus[index].enginePlayerEntry173,
    /* ABI v36: default mask=1 forces HUD host residual; pure-complete opt-in.
       ABI v80: blobReady + the 8x13 flat slot keys were MISSING from this
       whitelist — the blob lane could never fire in the differential
       (measured: blobLane=0 over 5244 cases). Both sides now receive the
       drawn values; the latch split is exercised on both arms. */
    playerHudOccupiedMask: corpus[index].playerHudOccupiedMask ?? 1,
    playerHudBlobReady: corpus[index].playerHudBlobReady ?? 0,
    /* ABI v82: 0x83b280 loop slot gates are RUNTIME inputs now (the PE
       writes them inside 0x83b850 at 0x83bb6f — the explicit-whitelist
       lesson: a runtime input not named here reaches the module as ZERO).
       The corpus rows below draw (0,0) no-op and (1,0)/(0,1)/(1,1)
       residual arms; BOTH must stay live on both sides. */
    hudHistorySlotFlag0: corpus[index].hudHistorySlotFlag0 ?? 0,
    hudHistorySlotFlag1: corpus[index].hudHistorySlotFlag1 ?? 0,
    /* ABI v83: record-0 StatHUD tail countdown lane inputs (explicit
       whitelist — an input not named here reaches the module as ZERO). */
    hudStatCountdownReady: corpus[index].hudStatCountdownReady ?? 0,
    hudStatPlayerListBegin: corpus[index].hudStatPlayerListBegin ?? 0,
    hudStatPlayerListEnd: corpus[index].hudStatPlayerListEnd ?? 0,
    /* hudStatCountdown cells: pooled dense sync — the countdown oracle
       (hudStatCountdownValues fallback) reads the flat lanes from
       normalizeRuntimeInputsForLayout(runtimeInputs), so they must stay
       present in the literal (trim B). */
    ...syncHudStatCountdown(corpus[index]),
    /* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane inputs (explicit
       whitelist — an input not named here reaches the module as ZERO and
       every walk case silently becomes a no-op; measured defect class).
       All carried UNMASKED: the byte gates narrow low-byte where the PE
       does, probe1/3 and the stat targets keep their f32 identity
       (`?? 0` leaves NaN/Inf/0.5 intact), game1adb4 is f32 BITS. */
    hudStatWalkBlobReady: corpus[index].hudStatWalkBlobReady ?? 0,
    hudStatOwnerByte: corpus[index].hudStatOwnerByte ?? 0,
    hudStatContainerBegin: corpus[index].hudStatContainerBegin ?? 0,
    hudStatContainerEnd: corpus[index].hudStatContainerEnd ?? 0,
    hudStatWalkProbe1: f32Bits(Math.fround(corpus[index].hudStatWalkProbe1 ?? 0)),
    hudStatWalkProbe2: corpus[index].hudStatWalkProbe2 ?? 0,
    hudStatWalkProbe3: f32Bits(Math.fround(corpus[index].hudStatWalkProbe3 ?? 0)),
    hudStatGame1adb4: corpus[index].hudStatGame1adb4 ?? 0,
    hudStatSlotPtr0: corpus[index].hudStatSlotPtr0 ?? 0,
    hudStatSlotPtr1: corpus[index].hudStatSlotPtr1 ?? 0,
    /* ABI v102 (walker freeze-lift lanes @14276..14288): explicit
       per-key whitelist (C3 defect class — a new runtime input not
       named here reaches the module as ZERO no matter what the corpus
       says). playerA/B UNMASKED (row_arm does FULL-DWORD compares),
       bFrame328 signed-coordinated with the state frame draw
       (reset_split SIGNED diff), probe1_arg WIDE (identity law — the
       `& 0xff` truncation mutant bait). */
    hudStatWalkerPlayerA: corpus[index].hudStatWalkerPlayerA ?? 0,
    hudStatWalkerPlayerB: corpus[index].hudStatWalkerPlayerB ?? 0,
    hudStatWalkerBFrame328: corpus[index].hudStatWalkerBFrame328 ?? 0,
    hudStatWalkProbe1Arg: corpus[index].hudStatWalkProbe1Arg ?? 0,
    /* ABI v98 (record-12 transition pack lanes @14292..14324): explicit
       per-key whitelist (same C3 defect class — an unnamed lane reaches
       the module as ZERO and every corpus draw is a silent no-op).
       Unmasked FULL-WORD carries (the laws re-narrow the byte gates
       in-body: alt/route/player/blue/pred compare AL bytes, game0 is a
       FULL-DWORD ==1 compare, subroom_flag_44 carried full-word and
       re-narrowed & 0xff in the law, ready gates the whole pack). */
    transition6fd7c0Game0: corpus[index].transition6fd7c0Game0 ?? 0,
    transition6fd7c0AltPathProbe: corpus[index].transition6fd7c0AltPathProbe ?? 0,
    transition6fd7c0RouteProbe: corpus[index].transition6fd7c0RouteProbe ?? 0,
    transition6fd7c0PlayerLoopProbe: corpus[index].transition6fd7c0PlayerLoopProbe ?? 0,
    transition6fd7c0RoomType8: corpus[index].transition6fd7c0RoomType8 ?? 0,
    transition6fd7c0RoomSubroomFlag44: corpus[index].transition6fd7c0RoomSubroomFlag44 ?? 0,
    transition6fd7c0BlueRoomProbe: corpus[index].transition6fd7c0BlueRoomProbe ?? 0,
    transition6fd7c0EnginePredProbe: corpus[index].transition6fd7c0EnginePredProbe ?? 0,
    transition6fd7c0Ready: corpus[index].transition6fd7c0Ready ?? 0,
    /* hudStatSlot cells: pooled dense sync — the walk oracle seeds its
       scratch from these lanes (walkScratchSeed), so they must stay in
       the literal (trim B). */
    ...syncHudStatSlot(corpus[index]),
    /* hudStatPlayer lanes: pooled dense sync — hudStatWalkRun reads them
       per player (f32-bit conversion preserved for the six float stems). */
    ...syncHudStatPlayer(corpus[index]),
    /* playerHudSlot lanes (incl. the f32 Float6b8): staged by
       writeRuntimeInputsPacks (trim B). */
    /* The oracle model consumes the packs arrayed by slot; the flat keys
       above only reach the wasm struct. Without this the model's Pass
       twin gate sees empty packs and every slot counts a single hearts
       call (measured 4257b0-era differential at case 251). */
    playerHudSlots: Array.from(
      { length: PLAYER_HUD_MAX_SLOTS },
      (_, i) => ({
        twinPtr: corpus[index][`playerHudSlot${i}TwinPtr`] ?? 0,
        playerType: corpus[index][`playerHudSlot${i}PlayerType`] ?? 0,
        field3bc: corpus[index][`playerHudSlot${i}Field3bc`] ?? 0,
        heartsSum: corpus[index][`playerHudSlot${i}HeartsSum`] ?? 0,
        flag1519: corpus[index][`playerHudSlot${i}Flag1519`] ?? 0,
        trampSuppress: corpus[index][`playerHudSlot${i}TrampSuppress`] ?? 0,
        active0: corpus[index][`playerHudSlot${i}Active0`] ?? 0,
        active1: corpus[index][`playerHudSlot${i}Active1`] ?? 0,
        active2: corpus[index][`playerHudSlot${i}Active2`] ?? 0,
        active3: corpus[index][`playerHudSlot${i}Active3`] ?? 0,
        float6b8: corpus[index][`playerHudSlot${i}Float6b8`] ?? 0,
        tailChars: corpus[index][`playerHudSlot${i}TailChars`] ?? 0,
        tailPred: corpus[index][`playerHudSlot${i}TailPred`] ?? 0,
      }),
    ),
    managerHistoryCount: corpus[index].managerHistoryCount ?? 0,
    managerStatFlag: corpus[index].managerStatFlag ?? 0,
    ambientDescPresent: corpus[index].ambientDescPresent ?? 1,
    ambientDescId: corpus[index].ambientDescId ?? 0,
    ambientPlayerCount: corpus[index].ambientPlayerCount ?? 1,
    ambientVelX7460: corpus[index].ambientVelX7460 ?? 0,
    ambientVelY7464: corpus[index].ambientVelY7464 ?? 0,
    ambientStage: corpus[index].ambientStage ?? 1,
    ambientStageType: corpus[index].ambientStageType ?? 0,
    ambientStageId: corpus[index].ambientStageId ?? 0,
    ambientRoomSubtype1bb0: corpus[index].ambientRoomSubtype1bb0 ?? 0,
    ambientRoomActive: corpus[index].ambientRoomActive ?? 1,
    ambientRoomEntry11f0: corpus[index].ambientRoomEntry11f0 ?? 31,
    /* ABI v107 (record idx 39 mid-restock): desc pack + owner MUST be
       copied (per-key whitelist — C3 class: a lane not named here reaches
       the module as ZERO and the v46 pure walk / v95 typed drop are
       silent no-ops in the differential; measured this unit). Wide/shape
       values ride UNMASKED: ready is a FULL-DWORD test, ac/ae re-narrow
       to int16 in-law, seed58 is a FULL-DWORD compare. */
    midRestockOwner0x209: corpus[index].midRestockOwner0x209 ?? 0,
    midRestockDescReady: corpus[index].midRestockDescReady ?? 0,
    midRestockDescAc: corpus[index].midRestockDescAc ?? 0,
    midRestockDescAe: corpus[index].midRestockDescAe ?? 0,
    midRestockDescSeed58: corpus[index].midRestockDescSeed58 ?? 0,
    /* ABI v107 (wave-29 merge REBIND, C1/w29-C1): the 36 rebound lanes —
       18 FUN_00956110 phone-home probe samples @6800..6868 + the
       0x0092f1c0 gate-1ba78 receiver pair @6872/6876 + the 4212c0 A/B
       409030-pair capture pack @7656..7688 + the 7 tcsStats vector
       capture lanes @7960..7984. All are LIVE module fields the module
       READS (wasm load-constants at exactly these offsets); before the
       rebind the per-key whitelist omitted them AND the JSON/layout
       carried stale offsets (7108..7176 / 6872..6904 / 8356..8380) so
       every differential case reached the module as ZERO (measured C3
       class). Values ride UNMASKED (full-dword gates / float-bit lanes
       re-interpret in-law). */
    frameOpaque98dba0956110Ready: corpus[index].frameOpaque98dba0956110Ready ?? 0,
    frameOpaque98dba0956110ManagerMode: corpus[index].frameOpaque98dba0956110ManagerMode ?? 0,
    frameOpaque98dba0956110GlobalC71690: corpus[index].frameOpaque98dba0956110GlobalC71690 ?? 0,
    frameOpaque98dba0956110MpBegin: corpus[index].frameOpaque98dba0956110MpBegin ?? 0,
    frameOpaque98dba0956110MpEnd: corpus[index].frameOpaque98dba0956110MpEnd ?? 0,
    frameOpaque98dba0956110Arg2: corpus[index].frameOpaque98dba0956110Arg2 ?? 0,
    frameOpaque98dba0956110NetHostOk: corpus[index].frameOpaque98dba0956110NetHostOk ?? 0,
    frameOpaque98dba0956110NetOutByte: corpus[index].frameOpaque98dba0956110NetOutByte ?? 0,
    frameOpaque98dba0956110VtableCount: corpus[index].frameOpaque98dba0956110VtableCount ?? 0,
    frameOpaque98dba0956110VtableResult0: corpus[index].frameOpaque98dba0956110VtableResult0 ?? 0,
    frameOpaque98dba0956110VtableResult1: corpus[index].frameOpaque98dba0956110VtableResult1 ?? 0,
    frameOpaque98dba0956110VtableResult2: corpus[index].frameOpaque98dba0956110VtableResult2 ?? 0,
    frameOpaque98dba0956110VtableResult3: corpus[index].frameOpaque98dba0956110VtableResult3 ?? 0,
    frameOpaque98dba0956110VtableResult4: corpus[index].frameOpaque98dba0956110VtableResult4 ?? 0,
    frameOpaque98dba0956110VtableResult5: corpus[index].frameOpaque98dba0956110VtableResult5 ?? 0,
    frameOpaque98dba0956110VtableResult6: corpus[index].frameOpaque98dba0956110VtableResult6 ?? 0,
    frameOpaque98dba0956110VtableResult7: corpus[index].frameOpaque98dba0956110VtableResult7 ?? 0,
    frameOpaque98dba0956110GeneralResult: corpus[index].frameOpaque98dba0956110GeneralResult ?? 0,
    opaque0092f1c0Limit: corpus[index].opaque0092f1c0Limit ?? 0,
    opaque0092f1c0Field14: corpus[index].opaque0092f1c0Field14 ?? 0,
    frameOpaque4212c0AbPackReady: corpus[index].frameOpaque4212c0AbPackReady ?? 0,
    frameOpaque4212c0AFloat10: corpus[index].frameOpaque4212c0AFloat10 ?? 0,
    frameOpaque4212c0BFloat10: corpus[index].frameOpaque4212c0BFloat10 ?? 0,
    frameOpaque4212c0ALayer104: corpus[index].frameOpaque4212c0ALayer104 ?? 0,
    frameOpaque4212c0BLayer104: corpus[index].frameOpaque4212c0BLayer104 ?? 0,
    frameOpaque4212c0AFrameBound: corpus[index].frameOpaque4212c0AFrameBound ?? 0,
    frameOpaque4212c0BFrameBound: corpus[index].frameOpaque4212c0BFrameBound ?? 0,
    frameOpaque4212c0ALoopFlag: corpus[index].frameOpaque4212c0ALoopFlag ?? 0,
    frameOpaque4212c0BLoopFlag: corpus[index].frameOpaque4212c0BLoopFlag ?? 0,
    tcsStatsVecReady: corpus[index].tcsStatsVecReady ?? 0,
    tcsStatsVecBegin: corpus[index].tcsStatsVecBegin ?? 0,
    tcsStatsVecEnd: corpus[index].tcsStatsVecEnd ?? 0,
    tcsStatsVecCap: corpus[index].tcsStatsVecCap ?? 0,
    tcsStatsDesc10_48: corpus[index].tcsStatsDesc10_48 ?? 0,
    tcsStatsLookupBits: corpus[index].tcsStatsLookupBits ?? 0,
    tcsStatsGameByte8: corpus[index].tcsStatsGameByte8 ?? 0,
    engineCallRoom: corpus[index].engineCallRoom ?? 0,
    engineCallDim: corpus[index].engineCallDim ?? 0,
    engineGame18304: corpus[index].engineGame18304 ?? 0,
    /* ABI v72: default ready=0 → the v71 unconditional shell residual. */
    frameEffectShellReady: corpus[index].frameEffectShellReady ?? 0,
    frameEffectShellRoom18304: corpus[index].frameEffectShellRoom18304 ?? 0,
    frameEffectShellRoom182d0: corpus[index].frameEffectShellRoom182d0 ?? 0,
    frameEffectShellRoomByte1: corpus[index].frameEffectShellRoomByte1 ?? 0,
    /* ABI v74: default ready=0 → the v73 decision. These four MUST be copied
       through explicitly: this block is a per-key whitelist, so a new runtime
       input that is not listed here reaches the module as ZERO no matter what
       the corpus says, and every case exercising it silently becomes a no-op.
       Measured on this very unit — a wire mutant survived until these lines
       existed, because the corpus cases below were never actually delivered. */
    frameEffectRewindReady: corpus[index].frameEffectRewindReady ?? 0,
    frameEffectRewindGuard269ea: corpus[index].frameEffectRewindGuard269ea ?? 0,
    frameEffectRewindGuard269eb: corpus[index].frameEffectRewindGuard269eb ?? 0,
    frameEffectRewindGuard68d70: corpus[index].frameEffectRewindGuard68d70 ?? 0,
    /* ABI v75: record 22's engine-prefix latch gate. These two lines are the
       whole reason the v75 corpus rows below are not silent no-ops — this
       object is an explicit per-key whitelist, so a key that is not named here
       reaches the Wasm side as ZERO no matter what the corpus says. Carried
       through UNMASKED so 0x100 / 0x80000000 / 0xffffffff actually reach the
       export and the low-byte narrowing is what decides. */
    engineAnm2LatchReady: corpus[index].engineAnm2LatchReady ?? 0,
    engineAnm2Latch: corpus[index].engineAnm2Latch ?? 0,
    /* ABI v77: record 22 ANM2::Load lane blob. Same whitelist rule: a key
       not named here reaches the module as ZERO and every lane case below
       would be a silent no-op (measured defect class). Name blobs are
       flattened to the 256-byte layout form; counts cross UNMASKED so
       0x10000000..0xffffffff stay able to trip the cap. */
    engineAnm2BlobReady: corpus[index].engineAnm2BlobReady ?? 0,
    engineAnm2LayerCount: corpus[index].engineAnm2LayerCount ?? 0,
    engineAnm2ExtraCount: corpus[index].engineAnm2ExtraCount ?? 0,
    engineAnm2Bitflags110Pre: corpus[index].engineAnm2Bitflags110Pre ?? 0,
    engineAnm2ExtraNames: flattenAnm2NameCells(
      corpus[index].engineAnm2ExtraNames,
      ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS,
    ),
    /* ABI v79: record 2 tree blob. Whitelisted EXPLICITLY (the per-key
       whitelist copies only keys named here; unnamed keys reach the module
       as zero and pure cases would be silent no-ops). */
    globalTree4aba0BlobReady: corpus[index].globalTree4aba0BlobReady ?? 0,
    globalTree4aba0Count: corpus[index].globalTree4aba0Count ?? 0,
    globalTree4aba0Begin: corpus[index].globalTree4aba0Begin ?? 0,
    globalTree4aba0End: corpus[index].globalTree4aba0End ?? 0,
    ...flattenGlobalTree4aba0NodesRuntime(corpus[index].globalTree4aba0Nodes),
    h5BodyBlobReady: corpus[index].h5BodyBlobReady ?? 0,
    /* ABI v47 H5 body pure-prep packs. */
    ambientRoomF14: corpus[index].ambientRoomF14 ?? 0,
    ambientRoomF18: corpus[index].ambientRoomF18 ?? 0,
    ambientRoomF1c: corpus[index].ambientRoomF1c ?? 0,
    ambientRoomF20: corpus[index].ambientRoomF20 ?? 0,
    ambientRoom1d18: corpus[index].ambientRoom1d18 ?? 0,
    /* ABI v48 B3B7 residual wire packs. */
    b3b7SparseReady: corpus[index].b3b7SparseReady ?? 0,
    b3b7TeByte7321: corpus[index].b3b7TeByte7321 ?? 0,
    b3b7TeBegin: corpus[index].b3b7TeBegin ?? 0,
    b3b7TeEnd: corpus[index].b3b7TeEnd ?? 0,
    b3b7DescType0: corpus[index].b3b7DescType0 ?? 0,
    b3b7TreeCount7238: corpus[index].b3b7TreeCount7238 ?? 0,
    b3b7WidthC: corpus[index].b3b7WidthC ?? 0,
    b3b7Height10: corpus[index].b3b7Height10 ?? 0,
    /* ABI v48 B9B11 residual wire packs. */
    b9b11InputsReady: corpus[index].b9b11InputsReady ?? 0,
    b9b11ChallengeResultNonzero: corpus[index].b9b11ChallengeResultNonzero ?? 0,
    b9b11RoomByte11f4: corpus[index].b9b11RoomByte11f4 ?? 0,
    b9b11RoomByte1d0d: corpus[index].b9b11RoomByte1d0d ?? 0,
    b9b11RoomByte7321: corpus[index].b9b11RoomByte7321 ?? 0,
    b9b11ListBegin7314: corpus[index].b9b11ListBegin7314 ?? 0,
    b9b11ListEnd7318: corpus[index].b9b11ListEnd7318 ?? 0,
    /* ABI v49: tail list sweep inputs. */
    updateListBlobReady: corpus[index].updateListBlobReady ?? 0,
    /* ABI v50 (a): both default ready=0 → prior always-host emissions. */
    playerFlag410Ready: corpus[index].playerFlag410Ready ?? 0,
    playerFlag410Count: corpus[index].playerFlag410Count ?? 0,
    opaque0092e300Ready: corpus[index].opaque0092e300Ready ?? 0,
    opaque0092e300GroupCount: corpus[index].opaque0092e300GroupCount ?? 0,
    opaque0092e300PacksReady: corpus[index].opaque0092e300PacksReady ?? 0,
    opaque0092e300Groups: corpus[index].opaque0092e300Groups,
    /* ABI v85: voice blob MUST be copied (per-key whitelist). */
    /* ABI v86: 0x0092f1c0 blob MUST be copied (per-key whitelist).
       Unnamed keys reach the module as ZERO and every drop is a
       silent no-op (measured defect class). Mode carried UNMASKED. */
    opaque0092f1c0Ready: corpus[index].opaque0092f1c0Ready ?? 0,
    opaque0092f1c0Mode: corpus[index].opaque0092f1c0Mode ?? 0,
    opaque0092f1c0Counter: corpus[index].opaque0092f1c0Counter ?? 0,
    /* ABI v87: 0x008318a0 blob MUST be copied (per-key whitelist).
       Unnamed keys reach the module as ZERO and every drop is a
       silent no-op (measured defect class). Mode carried UNMASKED. */
    opaque008318a0Ready: corpus[index].opaque008318a0Ready ?? 0,
    opaque008318a0Mode: corpus[index].opaque008318a0Mode ?? 0,
    /* ABI v90: 4212c0 flag_111 pair gate blob MUST be copied (per-key
       whitelist). pairReady=0 keeps the pre-v90 always-host residual;
       field5c/flag6c are the B-subobject +0x5c/+0x6c bytes read through
       Game+0x1d348/0x1d358 — unnamed keys reach the module as ZERO and
       every pure fold is a silent no-op (measured defect class). */
    frameOpaque4212c0PairReady: corpus[index].frameOpaque4212c0PairReady ?? 0,
    frameOpaque4212c0Field5c: corpus[index].frameOpaque4212c0Field5c ?? 0,
    frameOpaque4212c0Flag6c: corpus[index].frameOpaque4212c0Flag6c ?? 0,
    /* ABI v91: 4212c0 secondary==3 40add0 false-probe blob MUST be copied
       (per-key whitelist). probeReady=0 keeps the pre-v91 always-host;
       the false arm needs listCount==0 (empty list -> al=0) or a
       host-resolved matchIndex/bitfield18 bit-clear. Unnamed keys reach
       the module as ZERO (measured defect class). */
    frameOpaque4212c0ProbeReady: corpus[index].frameOpaque4212c0ProbeReady ?? 0,
    frameOpaque4212c0ProbeResolved: corpus[index].frameOpaque4212c0ProbeResolved ?? 0,
    frameOpaque4212c0Add0Field4: corpus[index].frameOpaque4212c0Add0Field4 ?? 0,
    frameOpaque4212c0Add0ListCount: corpus[index].frameOpaque4212c0Add0ListCount ?? 0,
    frameOpaque4212c0Add0MatchIndex: corpus[index].frameOpaque4212c0Add0MatchIndex ?? -1,
    frameOpaque4212c0Add0Bitfield18: corpus[index].frameOpaque4212c0Add0Bitfield18 ?? 0,
    /* ABI v95: the equal-flags blob MUST be copied (per-key whitelist).
       ready=0 or count over the cap keeps the v91/v94 matchIndex path;
       unnamed keys reach the module as ZERO (measured defect class). */
    frameOpaque4212c0Add0EqualFlagsReady: corpus[index].frameOpaque4212c0Add0EqualFlagsReady ?? 0,
    /* 64 x u8 per-entry equal-flag bytes: staged by writeRuntimeInputsPacks
       (trim B; the array form stays for the model oracle). */
    /* ABI v51: both default ready=0 → prior always-host emissions. */
    opaque857450Ready: corpus[index].opaque857450Ready ?? 0,
    opaque857450Manager4abbc: corpus[index].opaque857450Manager4abbc ?? 0,
    menuAuxTreeReady: corpus[index].menuAuxTreeReady ?? 0,
    menuAuxTreeRoot: corpus[index].menuAuxTreeRoot ?? -1,
    menuAuxTreeNodeCount: corpus[index].menuAuxTreeNodeCount ?? 0,
    menuAuxAccountingLo: corpus[index].menuAuxAccountingLo ?? 0,
    menuAuxAccountingHi: corpus[index].menuAuxAccountingHi ?? 0,
    menuAuxTreeNodes: corpus[index].menuAuxTreeNodes,
    /* ABI v54: sentinel capture for the callsite wrapper. Defaults to 0
       (capture missing) so legacy corpus entries keep the pre-v54 fallback. */
    menuAuxSentinelReady: corpus[index].menuAuxSentinelReady ?? 0,
    menuAuxSentinelAddr: corpus[index].menuAuxSentinelAddr ?? 0,
    menuAuxMenuAddr: corpus[index].menuAuxMenuAddr ?? 0,
    /* ABI v52: default ready=0 keeps the pre-v52 host genrand counts. */
    genrandMtReady: corpus[index].genrandMtReady ?? 0,
    genrandIndexIn: corpus[index].genrandIndexIn ?? 0,
    genrandModeFlag: corpus[index].genrandModeFlag ?? 0,
    /* genrandState in runtimeInputs is the TIMER boundary's capture: random
       rows supply it as timerGenrandState, fixed rows as genrandState. The
       H5 boundary's observation stays untouched below — the H5 stage loads
       its scratch from corpus[index].genrandState directly, so advancing
       this array between timer boundaries never leaks into it. */
    genrandState: corpus[index].timerGenrandState
      ? Uint32Array.from(corpus[index].timerGenrandState)
      : (corpus[index].genrandState
        ? Uint32Array.from(corpus[index].genrandState)
        : undefined),
    /* ABI v53: the recaptured post-Pass-A 0x68-stride count. Default models
       "Pass A inserted nothing" — the pre-Pass-A count carries over. */
    frameOpaque4257b0PostPassAListCount:
      corpus[index].resume4257b0PostPassAListCount ??
      corpus[index].frameOpaque4257b0ListCount ?? 1,
    /* ABI v57: LuaEngine frame-unref 0x008607a0 gate inputs. */
    luaFrameUnrefReady: corpus[index].luaFrameUnrefReady ?? 0,
    luaFrameUnrefFlagByte: corpus[index].luaFrameUnrefFlagByte ?? 0,
    /* ABI v59: 0x008ef990 entry-gate capture. Defaults ready=0 → the wasm
       keeps the pre-v59 always-host behavior; pure cases opt in. */
    state24ecc22ed0Ready: corpus[index].state24ecc22ed0Ready ?? 0,
    state24ecc22ed0Flag: corpus[index].state24ecc22ed0Flag ?? 0,
    /* ABI v44: PM3 intensity wire packs. The corpus pins exercise the
       STOP/UPDATE gates through these; without them the wire sees
       blob=0 → MONOLITHIC and the sfxStop/sfxUpdate gates never run. */
    pmIntensityPlayerCount: corpus[index].pmIntensityPlayerCount ?? 1,
    pmIntensitySfxPlaying: corpus[index].pmIntensitySfxPlaying ?? 0,
    pmIntensityBlobReady: corpus[index].pmIntensityBlobReady ?? 0,
    /* pmIntensity packs: staged by writeRuntimeInputsPacks (trim B). */
    /* ABI v60: SFX stop VA 0x0092e230 gate captures. */
    sfxStopReady: corpus[index].sfxStopReady ?? 0,
    sfxStopSpan: corpus[index].sfxStopSpan ?? 0,
    sfxStopVoices190: corpus[index].sfxStopVoices190 ?? 0,
    sfxStopEnabled198: corpus[index].sfxStopEnabled198 ?? 0,
    /* ABI v95: record idx 47 STOP fold per-voice capture (semantic names;
       the coordinator merge lays them out and pins the offsets). */
    sfxStopFoldReady: corpus[index].sfxStopFoldReady ?? 0,
    sfxStopVoiceCount: corpus[index].sfxStopVoiceCount ?? 0,
    /* sfxStopVoice per-voice lanes: staged by writeRuntimeInputsPacks (trim B;
       the arrayed form stays under sfxStopVoices for the model oracle). */
    sfxStopVoices: Array.isArray(corpus[index].sfxStopVoices)
      ? corpus[index].sfxStopVoices
      : [],
    /* ABI v69: PM0/PM1 death-walk wire packs. Defaults count=1 blob=0 →
       MONOLITHIC under dual-zero (the pre-v69 unconditional emission), so
       every legacy corpus entry keeps its exact event stream. Byte lanes
       are carried UNMASKED — the low-byte narrowing is the pack's job on
       both sides, and 0x100-shaped draws must reach it as written. */
    pmDeathPlayerCount: corpus[index].pmDeathPlayerCount ?? 1,
    pmDeathBlobReady: corpus[index].pmDeathBlobReady ?? 0,
    /* pmDeath wire packs: staged by writeRuntimeInputsPacks (trim B). */
    /* ABI v56: rank-display body captures. When the gate is open and ready=1
       the fold runs on the Wasm side too, so every field below must reach the
       packed struct through normalizeRuntimeInputsForLayout. (Class-6 audit
       fix: these were drawn by the generator but never named in this
       whitelist — the struct received ZEROS and the 857450 fold ran on
       zero inputs in every case.) */
    rankDisplaySwitch: corpus[index].rankDisplaySwitch ?? 0,
    rankDisplayByte22d: corpus[index].rankDisplayByte22d ?? 0,
    rankDisplayDword158: corpus[index].rankDisplayDword158 ?? 0,
    rankDisplayByte168: corpus[index].rankDisplayByte168 ?? 0,
    rankDisplayDword248: corpus[index].rankDisplayDword248 ?? 0,
    rankDisplayByte119: corpus[index].rankDisplayByte119 ?? 0,
    rankDisplayPtr44: corpus[index].rankDisplayPtr44 ?? 0,
    rankDisplayByte54: corpus[index].rankDisplayByte54 ?? 0,
    rankDisplayByte39c: corpus[index].rankDisplayByte39c ?? 0,
    rankDisplayByte39d: corpus[index].rankDisplayByte39d ?? 0,
    rankDisplayByte3b0: corpus[index].rankDisplayByte3b0 ?? 0,
    rankDisplayDispWord0: corpus[index].rankDisplayDispWord0 ?? 0,
    rankDisplayDispWord1: corpus[index].rankDisplayDispWord1 ?? 0,
    rankDisplayDispWord2: corpus[index].rankDisplayDispWord2 ?? 0,
    rankDisplayDispWord3: corpus[index].rankDisplayDispWord3 ?? 0,
    rankDisplayDispEos: corpus[index].rankDisplayDispEos ?? 0,
    rankDisplayIsPlayingAl: corpus[index].rankDisplayIsPlayingAl ?? 0,
    rankDisplayStUpd: corpus[index].rankDisplayStUpd ?? 0,
    rankDisplayStAfterLoading: corpus[index].rankDisplayStAfterLoading ?? 0,
    rankDisplayStAfterIdle: corpus[index].rankDisplayStAfterIdle ?? 0,
    rankDisplayStAfterDisplay: corpus[index].rankDisplayStAfterDisplay ?? 0,
    /* ABI v64: hud-message text-out gate captures (read by the 98dba0
       float-step text-out decision on both sides). Same class-6 fix. */
    hudMessageTextPtr54: corpus[index].hudMessageTextPtr54 ?? 0,
    hudMessageTextWords0: corpus[index].hudMessageTextWords0 ?? 0,
    hudMessageTextWords1: corpus[index].hudMessageTextWords1 ?? 0,
    /* ABI v64: FX-lerp lane read-only vectors (defaults 0 → gate-closed
       corpus entries keep the pre-v64 skip). */
    fxStep676d0: corpus[index].fxStep676d0 ?? 0,
    fxStep676d4: corpus[index].fxStep676d4 ?? 0,
    fxStep676d8: corpus[index].fxStep676d8 ?? 0,
    fxStep676dc: corpus[index].fxStep676dc ?? 0,
    fxStep676e0: corpus[index].fxStep676e0 ?? 0,
    fxStep676e4: corpus[index].fxStep676e4 ?? 0,
    fxGoal676e8: corpus[index].fxGoal676e8 ?? 0,
    fxGoal676ec: corpus[index].fxGoal676ec ?? 0,
    fxGoal676f0: corpus[index].fxGoal676f0 ?? 0,
    fxGoal676f4: corpus[index].fxGoal676f4 ?? 0,
    fxGoal676f8: corpus[index].fxGoal676f8 ?? 0,
    fxGoal676fc: corpus[index].fxGoal676fc ?? 0,
    /* ABI v96 (wave-22 merge): record-4 SFX-manager store-plan capture +
       per-player entry pack. Explicit per-key whitelist (the C3 measured
       defect class: a new runtime input not named here reaches the module
       as ZERO and every future corpus draw is a silent no-op). Byte-array
       lanes ride the corpus row as raw byte blobs (32 B each). */
    opaque8318a0SfxGlobal798e4: corpus[index].opaque8318a0SfxGlobal798e4 ?? 0,
    opaque8318a0SfxGlobal79948: corpus[index].opaque8318a0SfxGlobal79948 ?? 0,
    opaque8318a0SfxGlobal79790: corpus[index].opaque8318a0SfxGlobal79790 ?? 0,
    opaque8318a0SfxGlobal7978c: corpus[index].opaque8318a0SfxGlobal7978c ?? 0,
    opaque8318a0EngineField28: corpus[index].opaque8318a0EngineField28 ?? 0,
    opaque8318a0EngineByte7c: corpus[index].opaque8318a0EngineByte7c ?? 0,
    opaque8318a0PlayerEntryReady: corpus[index].opaque8318a0PlayerEntryReady ?? 0,
    opaque8318a0PlayerEntryCount: corpus[index].opaque8318a0PlayerEntryCount ?? 0,
    opaque8318a0PlayerEntryB173: corpus[index].opaque8318a0PlayerEntryB173,
    opaque8318a0PlayerEntryB1398: corpus[index].opaque8318a0PlayerEntryB1398,
    opaque8318a0PlayerEntryB139a: corpus[index].opaque8318a0PlayerEntryB139a,
    opaque8318a0PlayerEntryB171: corpus[index].opaque8318a0PlayerEntryB171,
    opaque8318a0PlayerEntryW410: corpus[index].opaque8318a0PlayerEntryW410,
    opaque8318a0PlayerEntryW3fc: corpus[index].opaque8318a0PlayerEntryW3fc,
    opaque8318a0PlayerEntryPtr7c: corpus[index].opaque8318a0PlayerEntryPtr7c,
    opaque8318a0PlayerEntryB34: corpus[index].opaque8318a0PlayerEntryB34,
    opaque8318a0PlayerEntryB88: corpus[index].opaque8318a0PlayerEntryB88,
    opaque8318a0PlayerEntryW1600: corpus[index].opaque8318a0PlayerEntryW1600,
    opaque8318a0PlayerEntryW418: corpus[index].opaque8318a0PlayerEntryW418,
    opaque8318a0PlayerEntryW16c: corpus[index].opaque8318a0PlayerEntryW16c,
    /* ABI v96: record-10 true-probe SFX-manager blob (12 words). */
    frameOpaque4212c0TrueProbeReady: corpus[index].frameOpaque4212c0TrueProbeReady ?? 0,
    frameOpaque4212c0TrueProbeMgrBase: corpus[index].frameOpaque4212c0TrueProbeMgrBase ?? 0,
    frameOpaque4212c0TrueProbeMgrF18: corpus[index].frameOpaque4212c0TrueProbeMgrF18 ?? 0,
    frameOpaque4212c0TrueProbeMgrEbc: corpus[index].frameOpaque4212c0TrueProbeMgrEbc ?? 0,
    frameOpaque4212c0TrueProbeMgr14: corpus[index].frameOpaque4212c0TrueProbeMgr14 ?? 0,
    frameOpaque4212c0TrueProbeMgr21618: corpus[index].frameOpaque4212c0TrueProbeMgr21618 ?? 0,
    frameOpaque4212c0TrueProbeMgr21620: corpus[index].frameOpaque4212c0TrueProbeMgr21620 ?? 0,
    frameOpaque4212c0TrueProbeMgr21624: corpus[index].frameOpaque4212c0TrueProbeMgr21624 ?? 0,
    frameOpaque4212c0TrueProbeMgr2161c: corpus[index].frameOpaque4212c0TrueProbeMgr2161c ?? 0,
    frameOpaque4212c0TrueProbeMgr29fb8: corpus[index].frameOpaque4212c0TrueProbeMgr29fb8 ?? 0,
    frameOpaque4212c0TrueProbeVolumeBits: corpus[index].frameOpaque4212c0TrueProbeVolumeBits ?? 0,
    frameOpaque4212c0TrueProbeVolumeEqOne: corpus[index].frameOpaque4212c0TrueProbeVolumeEqOne ?? 0,
    /* ABI v96: record-9 TAIL-A MP-slot pair + OPTIONAL seed. */
    state24ecc8ef990TailaSlotBegin: corpus[index].state24ecc8ef990TailaSlotBegin ?? 0,
    state24ecc8ef990TailaSlotEnd: corpus[index].state24ecc8ef990TailaSlotEnd ?? 0,
    state24ecc8ef990TailaSfxSeed: corpus[index].state24ecc8ef990TailaSfxSeed ?? 0,
    /* ABI v96: record-22 ANM2::Load pre-lane host half (W22-S2
       §lane-requests). loadgraphics_flags = 32 inline BYTES. */
    engineAnm2FilenameReady: corpus[index].engineAnm2FilenameReady ?? 0,
    engineAnm2FilenamePtr: corpus[index].engineAnm2FilenamePtr ?? 0,
    engineAnm2FilenameSize: corpus[index].engineAnm2FilenameSize ?? 0,
    engineAnm2FilenameCap: corpus[index].engineAnm2FilenameCap ?? 0,
    engineAnm2AnimFirstPre: corpus[index].engineAnm2AnimFirstPre ?? 0,
    engineAnm2AnimSecondPre: corpus[index].engineAnm2AnimSecondPre ?? 0,
    engineAnm2AnimReady: corpus[index].engineAnm2AnimReady ?? 0,
    engineAnm2LoadgraphicsFlagReady: corpus[index].engineAnm2LoadgraphicsFlagReady ?? 0,
    engineAnm2LoadgraphicsFlags: corpus[index].engineAnm2LoadgraphicsFlags,
    /* ABI v96 (wave-22 merge §1.3): record-41 B18 entity-draw capture
       pack + record-12 (0x705ee0) write-block seam lanes + the record-12
       ready lane. The merge added the layout keys (11068..13736) without
       wiring them here — a C3-class silent-zero (the oracle reads them via
       normalizeRuntimeInputsForLayout; unnamed keys reach the module as
       ZERO and every future corpus draw is a no-op). Explicit per-key
       whitelist; word-array lanes ride the corpus row (staged to the
       module by writeRuntimeInputsPacks). */
    b18EntityReady: corpus[index].b18EntityReady ?? 0,
    b18EntityCount: corpus[index].b18EntityCount ?? 0,
    b18EntityMode: corpus[index].b18EntityMode ?? 0,
    b18EntityTypes: corpus[index].b18EntityTypes,
    b18EntityCastResults: corpus[index].b18EntityCastResults,
    rewind705ee0SlotIndex676ac: corpus[index].rewind705ee0SlotIndex676ac ?? 0,
    rewind705ee0SlotValidByte: corpus[index].rewind705ee0SlotValidByte ?? 0,
    rewind705ee0SlotRoom19d20: corpus[index].rewind705ee0SlotRoom19d20 ?? 0,
    rewind705ee0SlotTagE8: corpus[index].rewind705ee0SlotTagE8 ?? 0,
    rewind705ee0SlotArg1fe2c: corpus[index].rewind705ee0SlotArg1fe2c ?? 0,
    rewind705ee0SlotFrame1fe30: corpus[index].rewind705ee0SlotFrame1fe30 ?? 0,
    rewind705ee0GameBase: corpus[index].rewind705ee0GameBase ?? 0,
    rewind705ee0GameTag0: corpus[index].rewind705ee0GameTag0 ?? 0,
    rewind705ee0GameFrame264f8: corpus[index].rewind705ee0GameFrame264f8 ?? 0,
    rewind705ee0Game18318: corpus[index].rewind705ee0Game18318 ?? 0,
    rewind705ee0PayloadBlobReady: corpus[index].rewind705ee0PayloadBlobReady ?? 0,
    rewind705ee0PayloadBlobAddr: corpus[index].rewind705ee0PayloadBlobAddr ?? 0,
    rewind705ee0PayloadBlob: corpus[index].rewind705ee0PayloadBlob,
    opaqueCall006fd7c0Ready: corpus[index].opaqueCall006fd7c0Ready ?? 0,
  };
  writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
  step();
  let expected = stepGameUpdateSlice(corpus[index], constants, runtimeInputs);
  /* ABI v64: FX-lerp gate lane (PE 0x006fae80) — gate byte low byte clear
     skips all six wrapped approaches; set (incl. wide 0x101 reads) runs
     them. Counted from corpus inputs like the other pin lanes. */
  if (((corpus[index].fxLerpGate676b4 ?? 0) & 0xff) !== 0) {
    fxLerpGateOpenCases += 1;
  } else {
    fxLerpGateClosedCases += 1;
  }
  /* ABI v61: transition-tail sweep (VA 0x009a2b30) — 1 call on every pass,
     2 calls on the postUpdateDelay>0 early-return path (PE 0x006fb3d0). */
  if (expected.events.opaqueCall009a2b30 >= 2) opaque9a2b30TwiceCases += 1;
  else if (expected.events.opaqueCall009a2b30 === 1) opaque9a2b30OnceCases += 1;
  /* ABI v63: tail-write lane pins — the byte clear and keep-8/9 normalize
     are unconditional per the PE, so pin coverage is counted from the
     corpus inputs themselves. */
  if ((corpus[index].transitionTailByte29fb8 ?? 0) !== 0) tailWriteBytePins += 1;
  if ((corpus[index].transitionMode ?? 0) !== 0 && (corpus[index].transitionMode ?? 0) !== 8 &&
      (corpus[index].transitionMode ?? 0) !== 9) tailWriteModePins += 1;
  /* ABI v58: ItemOverlay::Update state-1 block coverage. Counted from raw
     corpus values (gate-open at this site ⇔ menuState==0 || range!=0). */
  {
    const ov = corpus[index].itemOverlayState ?? 0;
    const gateOpen =
      (corpus[index].menuState23a74 ?? 0) === 0 ||
      (corpus[index].globalRangeByteLength ?? 0) !== 0;
    if (ov === 1 && gateOpen) {
      const dec = ((corpus[index].itemOverlayCounter11d1d0 ?? 0) - 1) | 0;
      if (dec > 0) itemOverlayPureStayCases += 1;
      else itemOverlayPureFlipCases += 1;
    } else if (ov !== 0 && ov !== 1) {
      itemOverlayHostCases += 1;
    }
  }
  /* ABI v59/v89: 0x008ef990 State24ecc_Update gate. Reached only when
     globalRangeByteLength == 0 && state24ecc != 0 (caller PE 0x6fb8ed
     cmp [Game+0x24ecc],0 / je skip). Host = ready==0 fallback or
     state==1 with the 0x22ed0 byte nonzero (full body residual);
     pure skip = state==1 byte zero or any state > 2; v89: state==2 is
     a PURE arm (mode24ed8 -= 1 wrap + state clear when pre<=0) —
     counted separately, changed = drawn mode24ed8 != 0 so the
     decrement is observable in the differential. */
  const st24 = (corpus[index].state24ecc ?? 0) | 0;
  const gReady = (corpus[index].state24ecc22ed0Ready ?? 0) >>> 0;
  const gFlag = (corpus[index].state24ecc22ed0Flag ?? 0) & 0xff;
  if (st24 !== 0 && (corpus[index].globalRangeByteLength ?? 0) === 0) {
    if (gReady === 0 || (st24 === 1 && gFlag !== 0)) {
      state24eccHostCases += 1;
    } else if (st24 === 2) {
      state24eccState2Cases += 1;
      if (((corpus[index].mode24ed8 ?? 0) | 0) !== 0) state24eccState2ChangedCases += 1;
    } else {
      state24eccPureSkipCases += 1;
    }
  }
  /* ABI v50 (b): count both sides of the 0x0092e300 pure gate. The gate only
     runs when the PE reaches the gate1d520 / oneShot1d63c branch. */
  if (corpus[index].gate1d520 !== 0 && corpus[index].oneShot1d63c !== 0) {
    if (expected.events.opaqueCall0092e300 !== 0) opaque0092e300GateOpenCases += 1;
    else opaque0092e300GateClosedCases += 1;
    /* ABI v85: count the new drop — v50 would host (enabled nonempty
       group) AND v85 drops (voice blob ready, all sampled channels
       null → pure_complete). */
    if (expected.events.opaqueCall0092e300 === 0) {
      const ready = (corpus[index].opaque0092e300Ready ?? 0) >>> 0;
      const gc = (corpus[index].opaque0092e300GroupCount ?? 0) | 0;
      const packs = (corpus[index].opaque0092e300PacksReady ?? 0) >>> 0;
      const blob = (corpus[index].opaque0092e300VoiceBlobReady ?? 0) >>> 0;
      const vc = (corpus[index].opaque0092e300VoiceCount ?? 0) | 0;
      const groups = Array.isArray(corpus[index].opaque0092e300Groups)
        ? corpus[index].opaque0092e300Groups : [];
      const voices = Array.isArray(corpus[index].opaque0092e300Voices)
        ? corpus[index].opaque0092e300Voices : [];
      let v50WouldHost = false;
      if (ready !== 0 && gc > 0 && gc <= OPAQUE_0092E300_MAX_GROUPS && packs !== 0) {
        for (let i = 0; i < gc; i += 1) {
          const g = groups[i] ?? {};
          if (((g.enabled ?? 0) & 0xff) === 0) continue;
          if (((g.entryCount ?? 0) >>> 0) === 0) continue;
          v50WouldHost = true;
          break;
        }
      }
      if (v50WouldHost && blob === 1 && vc >= 0 && vc <= OPAQUE_0092E300_MAX_VOICES) {
        let allNull = true;
        for (let i = 0; i < vc; i += 1) {
          if (((voices[i]?.channelNull ?? 0) | 0) === 0) {
            allNull = false;
            break;
          }
        }
        if (allNull) opaque0092e300V85DropCases += 1;
      }
    }
  }
  /* ABI v86: count both sides of the 0x0092f1c0 try_pure drop.
     Only when gate1ba78 is open (the PE site). */
  if ((corpus[index].gate1ba78 ?? 0) !== 0 &&
      (corpus[index].gate1d654 ?? 0) === 0) {
    const r86 = (corpus[index].opaque0092f1c0Ready ?? 0) >>> 0;
    if (r86 === 0) opaque0092f1c0Ready0Cases += 1;
    if (expected.events.opaqueCall0092f1c0 !== 0) opaque0092f1c0HostCases += 1;
    else opaque0092f1c0DropCases += 1;
  }
  /* ABI v87: count both sides of the 0x008318a0 try_pure drop.
     Only when the PE site is reached (earlier gates closed). */
  if ((corpus[index].gate1b83c ?? 0) !== 0 &&
      (corpus[index].gate1ba78 ?? 0) === 0 &&
      (corpus[index].gate1d654 ?? 0) === 0 &&
      (corpus[index].gate1d520 ?? 0) === 0 &&
      (corpus[index].postUpdateDelay ?? 0) <= 0) {
    const r87 = (corpus[index].opaque008318a0Ready ?? 0) >>> 0;
    if (r87 === 0) opaque008318a0Ready0Cases += 1;
    if (expected.events.opaqueCall008318a0 !== 0) opaque008318a0HostCases += 1;
    else opaque008318a0DropCases += 1;
  }
  /* ABI v142 (record idx4): rt_band_pop carrier theorem arms, checked
     against the PE facts (not against either implementation): on a
     capture-live firing tick the four lanes must carry EXACTLY the
     stateful deltas (mutation-check of every applied field — depth is
     pre-1 with 32-bit wrap, latch clears iff the new depth is 0, the
     five param stores fold purely from byte[0xc798e4]&4) and @932 must
     have fired with them; on any other tick all four lanes stay 0
     (absence keeps byte-for-byte). */
  {
    const e4 = (corpus[index].opaque8318a0SfxGlobal798e4 ?? 0) >>> 0;
    const depthPre = (corpus[index].opaque8318a0SfxGlobal79790 ?? 0) >>> 0;
    const latchPre = (corpus[index].opaque8318a0SfxGlobal7978c ?? 0) >>> 0;
    const law = gameUpdateSlice8318a0RtBandPop(e4, depthPre, latchPre);
    const pack = gameUpdateSlice8318a0RtBandPopParamsPack(law.params);
    const fired = expected.events.opaque008318a0RtBandPopFired | 0;
    if (fired !== 0) {
      rtBandPopFiredCases += 1;
      if ((expected.events.opaque008318a0SfxManagerStores | 0) === 0) {
        throw new Error(`Case ${index}: rt_band_pop fired without the @932 store event`);
      }
      if ((expected.events.opaque008318a0RtBandPopFired | 0) !== 1) {
        throw new Error(`Case ${index}: rt_band_pop fired more than once in one step`);
      }
      if ((expected.events.opaque008318a0RtBandPopDepthAfter >>> 0) !== law.depthAfter) {
        throw new Error(`Case ${index}: rt_band_pop depth_after ${expected.events.opaque008318a0RtBandPopDepthAfter >>> 0} != PE sub law ${law.depthAfter}`);
      }
      if ((expected.events.opaque008318a0RtBandPopLatchAfter >>> 0) !== law.latchAfter) {
        throw new Error(`Case ${index}: rt_band_pop latch_after ${expected.events.opaque008318a0RtBandPopLatchAfter >>> 0} != cmove law ${law.latchAfter}`);
      }
      if ((expected.events.opaque008318a0RtBandPopParamsPack >>> 0) !== pack) {
        throw new Error(`Case ${index}: rt_band_pop params_pack ${expected.events.opaque008318a0RtBandPopParamsPack >>> 0} != pure fold ${pack}`);
      }
      /* Mutation checks: the depth RMW actually moved the counter unless
         it wrapped to 0xffffffff (pre==0), and the latch actually cleared
         exactly when the post-decrement depth hit 0. */
      if (depthPre !== 0 && law.depthAfter === depthPre - 1) rtBandPopDepthMutatedCases += 1;
      if (law.depthAfter === 0 && law.latchAfter === 0 && latchPre !== 0) rtBandPopLatchClearedCases += 1;
      if (law.params[1] === 6) rtBandPopParamSel6Cases += 1; else rtBandPopParamSel1Cases += 1;
    } else {
      for (const lane of ["opaque008318a0RtBandPopDepthAfter", "opaque008318a0RtBandPopLatchAfter", "opaque008318a0RtBandPopParamsPack"]) {
        if ((expected.events[lane] | 0) !== 0) {
          throw new Error(`Case ${index}: ${lane} published without the firing arm (absence must keep byte-for-byte)`);
        }
      }
    }
  }
  /* ABI v51 (b): count both sides of the 0x00857450 early-out gate. */
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RETURN_AFTER_GATE_1D654) {
    if (expected.events.opaqueCall00857450 !== 0) opaque857450GateOpenCases += 1;
    else opaque857450GateClosedCases += 1;
  }
  /* ABI v56: the rank-display fold (VA 0x00857450 body). */
  if (expected.events.rankDisplayFold !== 0) {
    rankDisplayFoldCases += 1;
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    resumeCases += 1;
    resume98dba0Cases += 1;
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    const pre746560 = expected.events.opaqueCall00746560;
    const preTextOut = expected.events.hudMessageTextOut;
    const preTimer = expected.events.opaqueCall0098dba0Timer;
    /* ABI v76: load the mt[624]+mti capture into the genrand scratch at THIS
       boundary (mirroring the host's guest-RAM read at PE 0x0098de79). */
    primeTimerMtScratch(runtimeInputs);
    if (index === 3753) {
      const st = readStruct(view, stateAddress(), STATE_LAYOUT);
      console.log("MODULE PRE-98DBA0:", JSON.stringify({
        mode: st.frameOpaque98dba0Mode, flag: st.frameOpaque98dba0Flag,
        counter: st.frameOpaque98dba0Counter, f170: st.frameOpaque98dba0Float170,
        f2d0: st.frameOpaque98dba0Float2d0, cont: st.continuationKind,
      }));
      console.log("MODEL PRE-98DBA0:", JSON.stringify({
        mode: expected.state.frameOpaque98dba0Mode, flag: expected.state.frameOpaque98dba0Flag,
        counter: expected.state.frameOpaque98dba0Counter, f170: expected.state.frameOpaque98dba0Float170,
        f2d0: expected.state.frameOpaque98dba0Float2d0,
      }));
    }
    if (resume98dba0PlayerWalk() !== 1) throw new Error(`98dba0 player-walk resume rejected case ${index}`);
    expected = resumeGameUpdate98dba0PlayerWalk(expected.state, runtimeInputs, expected.events);
    countHostFun746560Walk(expected, runtimeInputs, pre746560, preTextOut);
    countTimer98dba0(expected, runtimeInputs, preTimer);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_GATE_1B83C_UPDATES) {
    resumeCases += 1;
    gate1b83cResumeCases += 1;
    const resumedState = {
      ...expected.state,
      gate1b83c: corpus[index].resumeGate1b83c ?? expected.state.gate1b83c,
      predicate1ba74: corpus[index].resumePredicate1ba74 ?? expected.state.predicate1ba74,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeGate1b83c() !== 1) throw new Error(`Gate 0x1b83c resume rejected case ${index}`);
    expected = resumeGameUpdateGate1b83c(resumedState, expected.events);
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_92F1C0) {
    resumeCases += 1;
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    if (resume92f1c0() !== 1) throw new Error(`Gate 0x1ba78 92f1c0 resume rejected case ${index}`);
    expected = resumeGameUpdate92f1c0(expected.state, runtimeInputs, expected.events);
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE) {
    resumeCases += 1;
    genericPromptResumeCases += 1;
    const resumedState = {
      ...expected.state,
      genericPromptActiveObject: corpus[index].resumePromptActiveObject ?? expected.state.genericPromptActiveObject,
      genericPromptActiveFlag: corpus[index].resumePromptActiveFlag ?? expected.state.genericPromptActiveFlag,
      genericPromptSubmittedSelection: corpus[index].resumePromptSubmittedSelection ?? expected.state.genericPromptSubmittedSelection,
      genericPromptPostUpdateFlag: corpus[index].resumePromptPostUpdateFlag ?? expected.state.genericPromptPostUpdateFlag,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeGenericPrompt() !== 1) throw new Error(`GenericPrompt resume rejected case ${index}`);
    expected = resumeGameUpdateGenericPrompt(resumedState, expected.events);
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE) {
    resumeCases += 1;
    itemOverlayResumeCases += 1;
    const resumedState = {
      ...expected.state,
      itemOverlayState: corpus[index].resumeItemOverlayState ?? expected.state.itemOverlayState,
      menuState23a74: corpus[index].resumeMenuState23a74 ?? expected.state.menuState23a74,
      itemOverlayCounter11d1d0: corpus[index].resumeItemOverlayCounter11d1d0 ?? expected.state.itemOverlayCounter11d1d0,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeItemOverlay() !== 1) throw new Error(`ItemOverlay resume rejected case ${index}`);
    expected = resumeGameUpdateItemOverlay(resumedState, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION) {
    timedTransitionCases += 1;
    const preFlagCall = expected.events.opaqueCall009bea10;
    /* opaque_call_0040c7f0 = 2 is assigned only inside the terminal cleanup
       block, so a 0 -> 2 delta proves that block ran. cleanup_mode is not
       written by the block, so the pre-call value is the one it tested. */
    const preC7f0 = expected.events.opaqueCall0040c7f0;
    const cleanupMode = expected.state.timedTransitionCleanupMode | 0;
    const preFlag8 = expected.state.hudMessageFlag8;
    if (continueTimedTransition() !== 1) throw new Error(`Timed-transition continuation rejected case ${index}`);
    expected = continueGameUpdateTimedTransition(expected.state, runtimeInputs, expected.events);
    /* ABI v65: the terminal cleanup's 0x006fb7d6 emission pushes 0, so the
       widget stores (0 ^ 1) = 1 into Game+0x216e9, and the caller's own
       0x006fb7b8 `jge` guarantees the callee's signed suffix test is false. */
    if (preC7f0 !== 2 && expected.events.opaqueCall0040c7f0 === 2 && cleanupMode < 2) {
      if (expected.events.hostFun746560Site !== HOST_FUN_746560_SITE.TIMED_CLEANUP) {
        throw new Error("terminal cleanup did not tag the typed 0x00746560 site");
      }
      if (expected.events.hostFun746560Param !== 0 ||
          expected.events.hostFun746560Byte216e9 !== 1 ||
          expected.events.hostFun746560DeathmatchSuffix !== 0) {
        throw new Error("terminal cleanup 0x00746560 carrier does not match the PE arguments");
      }
      if (((runtimeInputs.hostFun746560PostReady ?? 0) >>> 0) !== 0) {
        hostFun746560CleanupPostCases += 1;
        if (expected.state.hudMessageFlag8 !== 1) {
          throw new Error("0x00840bd7 must leave Game+0x216e8 = 1 on the cleanup site");
        }
      } else if (expected.state.hudMessageFlag8 !== preFlag8) {
        throw new Error("0x00840bdd assert path must not touch Game+0x216e8");
      }
    }
    /* ABI v50 (a): when the 0x009bea10 body ran pure, the broadcast bytes live
       in module scratch. Compare them against the oracle so the translated body
       is verified, not just the removed host emission. */
    const flagCount = runtimeInputs.playerFlag410Count | 0;
    const cleanupRan =
      preC7f0 !== 2 && expected.events.opaqueCall0040c7f0 === 2 && cleanupMode < 2;
    const ranPure =
      cleanupRan &&
      expected.events.opaqueCall009bea10 === preFlagCall &&
      (runtimeInputs.playerFlag410Ready ?? 0) !== 0 &&
      flagCount >= 0 &&
      flagCount <= ENGINE_PLAYER_MAX;
        if (ranPure) {
      playerFlag410PureCases += 1;
      if (flagCount === 0) playerFlag410EmptyCases += 1;
      const expectedBytes = playerFlag410Broadcast(1, flagCount);
      const actualBytes = Array.from(
        new Uint8Array(wasm.memory.buffer, playerFlag410Address(), flagCount),
      );
      for (let i = 0; i < flagCount; i += 1) {
        if (actualBytes[i] !== expectedBytes[i]) {
          throw new Error(
            `VA 0x009bea10 broadcast mismatch at case ${index} slot ${i}: ` +
              `${actualBytes[i]} !== ${expectedBytes[i]}`,
          );
        }
      }
    } else if (cleanupRan && expected.events.opaqueCall009bea10 !== preFlagCall) {
      playerFlag410HostCases += 1;
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION) {
    menuGateCases += 1;
    if (continueMenuGates() !== 1) throw new Error(`Menu-gate continuation rejected case ${index}`);
    expected = continueGameUpdateMenuGates(expected.state, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN) {
    resumeCases += 1;
    menuOpenResumeCases += 1;
    const resumedState = {
      ...expected.state,
      menuState23a74: corpus[index].resumeMenuOpenState ?? expected.state.menuState23a74,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeMenuOpen() !== 1) throw new Error(`Menu-open resume rejected case ${index}`);
    expected = resumeGameUpdateMenuOpen(resumedState, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE) {
    resumeCases += 1;
    menuUpdateResumeCases += 1;
    const resumedState = {
      ...expected.state,
      menuState23a74: corpus[index].resumeMenuUpdateState ?? expected.state.menuState23a74,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    const preClear = expected.events.menuAuxListClear;
    if (resumeMenuUpdate() !== 1) throw new Error(`Menu-update resume rejected case ${index}`);
    expected = resumeGameUpdateMenuUpdate(resumedState, runtimeInputs, expected.events);
    /* ABI v51 (a): this resume always enters the menu branch, so the _Erase
       peel runs here. Pure owns the free ORDER, the per-visit payload decision
       and the 64-bit accounting; those live in module scratch rather than
       sparse state, so compare them element by element — the aggregate event
       counters alone would not catch a wrong traversal order. */
    if (expected.events.menuAuxListClear !== preClear) {
      menuAuxFallbackCases += 1;
      /* ABI v54: a ready tree blob with the sentinel capture missing must fall
         back — the pure path is gated on BOTH captures. */
      if (
        (runtimeInputs.menuAuxTreeReady ?? 0) !== 0 &&
        (runtimeInputs.menuAuxSentinelReady ?? 0) === 0
      ) {
        menuAuxSentinelFallbackCases += 1;
      }
    } else {
      const oracle = menuAuxTreeErase(
        normalizeRuntimeInputsForLayout(runtimeInputs),
      );
      if (oracle == null) {
        throw new Error(`MenuAux erase oracle rejected at case ${index}`);
      }
      menuAuxBlobCases += 1;
            if (oracle.visitOrder.length > 0) menuAuxPayloadCases += 1;
      if (oracle.accountingHi !== ((runtimeInputs.menuAuxAccountingHi ?? 0) >>> 0)) {
        menuAuxBorrowCases += 1;
      }
      const n = oracle.visitOrder.length;
      const actualOrder = Array.from(
        new Uint32Array(wasm.memory.buffer, menuAuxVisitOrderAddress(), n),
      );
      const actualPayload = Array.from(
        new Uint8Array(wasm.memory.buffer, menuAuxPayloadFreeAddress(), n),
      );
      const actualAcct = Array.from(
        new Uint32Array(wasm.memory.buffer, menuAuxAccountingOutAddress(), 2),
      );
      for (let i = 0; i < n; i += 1) {
        if (actualOrder[i] !== oracle.visitOrder[i]) {
          throw new Error(`MenuAux free order mismatch at case ${index} slot ${i}: ${actualOrder[i]} !== ${oracle.visitOrder[i]}`);
        }
        if ((actualPayload[i] !== 0) !== ((oracle.payloadFree[i] | 0) !== 0)) {
          throw new Error(`MenuAux payload-free mismatch at case ${index} slot ${i}: wasm=${actualPayload[i]} oracle=${oracle.payloadFree[i]}`);
        }
      }
      if (actualAcct[0] !== oracle.accountingLo || actualAcct[1] !== oracle.accountingHi) {
        throw new Error(
          `MenuAux accounting mismatch at case ${index}: ` +
            `${actualAcct[0]}/${actualAcct[1]} !== ${oracle.accountingLo}/${oracle.accountingHi}`,
        );
      }
      /* ABI v54: the pure path must emit the five callsite-wrapper write
         values — three copies of the captured sentinel address, then two
         zeros. The wrapper output sits in scratch (parity with the C++ side),
         so the expectation comes from the pure helper menuAuxSentinelWrites
         rather than the events record. */
      const expectedSentinel = menuAuxSentinelWrites({
        sentinelAddr: runtimeInputs.menuAuxSentinelAddr ?? 0,
      });
      const actualSentinel = Array.from(
        new Uint32Array(wasm.memory.buffer, menuAuxSentinelOutAddress(), MENU_AUX_SENTINEL_OUT_WORDS),
      );
      for (let i = 0; i < MENU_AUX_SENTINEL_OUT_WORDS; i += 1) {
        if (actualSentinel[i] !== expectedSentinel[i]) {
          throw new Error(
            `MenuAux sentinel wrapper mismatch at case ${index} slot ${i}: ` +
              `${actualSentinel[i]} !== ${expectedSentinel[i]}`,
          );
        }
      }
      menuAuxSentinelPureCases += 1;
    }
  }
  /* ABI v58+ chain loop-back: the menu lane re-enters VA 0x0098dba0 on the
     frame-aux site; resume it a second time so stage/room/FM lanes run. */
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    resumeCases += 1;
    resume98dba0Cases += 1;
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    const pre746560 = expected.events.opaqueCall00746560;
    const preTextOut = expected.events.hudMessageTextOut;
    const preTimer = expected.events.opaqueCall0098dba0Timer;
    /* ABI v76: the loop-back RE-ENTERS the timer boundary — re-load the
       scratch from the (oracle-advanced) shared array, which mirrors guest
       RAM after the previous draw. */
    primeTimerMtScratch(runtimeInputs);
    if (resume98dba0PlayerWalk() !== 1) throw new Error(`98dba0 player-walk re-resume rejected case ${index}`);
    expected = resumeGameUpdate98dba0PlayerWalk(expected.state, runtimeInputs, expected.events);
    countHostFun746560Walk(expected, runtimeInputs, pre746560, preTextOut);
    countTimer98dba0(expected, runtimeInputs, preTimer);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES) {
    resumeCases += 1;
    frameAuxResumeCases += 1;
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    if (resumeFrameAuxUpdates() !== 1) throw new Error(`FrameAux resume rejected case ${index}`);
    expected = resumeGameUpdateFrameAuxUpdates(expected.state, constants, expected.events, runtimeInputs);
    /* ABI v95 (R4 equal-flags capture): count the non-empty walk lanes
       REACHED on the frame-aux resume. probeArm is re-derived from the PE
       facts (mode!=0, flag_111 folded to 0, secondary==3, field3c!=0).
       The equal-flags lane splits probe TRUE (host interior) from probe
       FALSE (pure clear); over-cap keeps the v91 matchIndex path. */
    const stMode95 = (corpus[index].frameOpaque4212c0Mode ?? 0) | 0;
    const stSec95 = (corpus[index].frameOpaque4212c0Secondary ?? 0) | 0;
    const stF3c95 = (corpus[index].frameOpaque4212c0Field3c ?? 0) | 0;
    const stF11195 = (corpus[index].frameOpaque4212c0Flag111 ?? 0) >>> 0;
    const eqReady95 = (runtimeInputs.frameOpaque4212c0Add0EqualFlagsReady ?? 0) >>> 0;
    const eqField495 = (runtimeInputs.frameOpaque4212c0Add0Field4 ?? 0) >>> 0;
    const eqCount95 = (runtimeInputs.frameOpaque4212c0Add0ListCount ?? 0) >>> 0;
    const probeArm95 =
      stMode95 !== 0 && (stF11195 & 0xff) === 0 && stSec95 === 3 && stF3c95 !== 0 &&
      (runtimeInputs.frameOpaque4212c0ProbeReady ?? 0) !== 0;
    if (probeArm95 && eqReady95 !== 0) {
      if (eqField495 === 0) {
        add0EqualFlagsLogCases += 1; /* log host edge + typed event */
      } else if (eqCount95 === 0) {
        /* post-log pure miss (unchanged v94 law) — nothing new to count */
      } else if (eqCount95 <= FRAME_OPAQUE_40ADD0_MAX_ENTRIES) {
        if (expected.events.opaqueCall004212c0 !== 0) add0EqualFlagsTrueCases += 1;
        else add0EqualFlagsPureCases += 1;
      } else {
        add0EqualFlagsOverCapCases += 1;
      }
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_STAGE_TRANSITION_EFFECT) {
    resumeCases += 1;
    stageTransitionResumeCases += 1;
    const resumedState = {
      ...expected.state,
      effectCounter68d6c: corpus[index].resumeStageEffectCounter68d6c ?? expected.state.effectCounter68d6c,
      roomTransitionMode1830c: corpus[index].resumeStageRoomTransitionMode1830c ?? expected.state.roomTransitionMode1830c,
      frameCounter264f8: corpus[index].resumeStageFrameCounter264f8 ?? expected.state.frameCounter264f8,
      frameCounter264fc: corpus[index].resumeStageFrameCounter264fc ?? expected.state.frameCounter264fc,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeStageTransitionEffect() !== 1) throw new Error(`Stage-transition resume rejected case ${index}`);
    expected = resumeGameUpdateStageTransitionEffect(resumedState, expected.events, runtimeInputs);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT) {
    resumeCases += 1;
    roomTransitionResumeCases += 1;
    const resumedState = {
      ...expected.state,
      counter265c0: corpus[index].resumeNestedCounter265c0 ?? expected.state.counter265c0,
      frameCounter264fc: corpus[index].resumeRoomFrameCounter264fc ?? expected.state.frameCounter264fc,
      frameCounter264f8: corpus[index].resumeRoomFrameCounter264f8 ?? expected.state.frameCounter264f8,
      byte67744: corpus[index].resumeRoomByte67744 ?? expected.state.byte67744,
      timedTransitionCleanupMode: corpus[index].resumeRoomTimedTransitionCleanupMode ?? expected.state.timedTransitionCleanupMode,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeRoomTransitionEffect() !== 1) throw new Error(`Room-transition resume rejected case ${index}`);
    /* ABI v72 harness fix: the Wasm export takes runtime_inputs and forwards
       them to continue_to_frame_manager_updates (the ABI v45 B1 wire_decide),
       so the oracle must be driven with the SAME object. Omitting it made the
       JS side decide B1 from all-zero defaults while the module used the
       corpus values — the two sides were being driven with different inputs.
       No corpus case reached this block by the mode-4 route until v72, which
       is why it stayed hidden. */
    expected = resumeGameUpdateRoomTransitionEffect(
      resumedState,
      expected.events,
      runtimeInputs,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX) {
    resumeCases += 1;
    const engineRuntimeOverride = {
      engineCallRoom: corpus[index].resumeEngineCallRoom ?? runtimeInputs.engineCallRoom ?? 0,
      engineCallDim: corpus[index].resumeEngineCallDim ?? runtimeInputs.engineCallDim ?? 0,
      engineGame18304: corpus[index].resumeEngineGame18304 ?? runtimeInputs.engineGame18304 ?? 0,
      enginePlayerCount: corpus[index].resumeEnginePlayerCount ?? runtimeInputs.enginePlayerCount ?? 1,
    };
    const engineRuntime = {
      ...runtimeInputs,
      ...engineRuntimeOverride,
    };
    /* ABI v95 (record idx 22): the module reads the per-entry eligible lane
       from the exported scratch (host-filled, entry+0x2c==0 -> 1) and the
       byte-0x173 lanes from the runtime struct. The eligible scratch is
       seeded here from the corpus keys; the 173 lanes are u32 WORDS written
       explicitly AFTER the layout write (the "bytes" layout entry would
       truncate WIDE lanes to bytes — the laws must see the full word and
       re-narrow & 0xff in-module). The oracle consumes the same lanes from
       the object. */
    const epBlob = (engineRuntime.enginePlayerBlobReady ?? 0) >>> 0;
    const epCount = (engineRuntime.enginePlayerCount ?? 0) | 0;
    if (epBlob !== 0 && epCount > 0 && epCount <= ENGINE_PLAYER_MAX && enginePlayerEligibleAddress) {
      const epEligible = Array.isArray(engineRuntime.enginePlayerEligible)
        ? engineRuntime.enginePlayerEligible : [];
      const eligibleBase = enginePlayerEligibleAddress();
      for (let i = 0; i < epCount; i += 1) {
        view.setUint8(eligibleBase + i, (epEligible[i] ?? 0) !== 0 ? 1 : 0);
      }
    }
    writeRuntimeInputsFlat(engineRuntime, corpus[index]);
    if (epBlob !== 0 && epCount > 0 && epCount <= ENGINE_PLAYER_MAX) {
      const epWords = Array.isArray(engineRuntime.enginePlayerEntry173)
        ? engineRuntime.enginePlayerEntry173 : [];
      const epOff = runtimeInputsAddress() + RUNTIME_INPUTS_LAYOUT.enginePlayerEntry173.offset;
      for (let i = 0; i < ENGINE_PLAYER_MAX; i += 1) {
        view.setUint32(epOff + i * 4, (epWords[i] ?? 0) >>> 0, true);
      }
    }
    if (resumeEnginePrefix() !== 1) throw new Error(`Engine-prefix resume rejected case ${index}`);
    expected = resumeGameUpdateEnginePrefix(expected.state, engineRuntime, expected.events);
    /* Count the engine-body blob arms so the coverage guard below fails a
       corpus that never delivers the lanes (measured defect class 6). */
    const epReady173 = (engineRuntime.enginePlayerEntry173Ready ?? 0) >>> 0;
    if (epBlob !== 0) {
      if (epCount <= 0) {
        /* empty player vector — the resume skips the loop entirely (both
           sides), nothing to count */
      } else if (epCount > ENGINE_PLAYER_MAX) engineBody173OverCapCases += 1;
      else if (epReady173 !== 0) engineBody173LaneOnCases += 1;
      else engineBody173LaneCoarseCases += 1;
    } else {
      engineBody173NoBlobCases += 1;
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) {
    resumeCases += 1;
    roomUpdatePrefixB1ResumeCases += 1;
    if (resumeRoomUpdatePrefixB1() !== 1) throw new Error(`Room-update prefix B1 resume rejected case ${index}`);
    expected = resumeGameUpdateRoomUpdatePrefixB1(expected.state, expected.events, runtimeInputs);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2) {
    resumeCases += 1;
    roomUpdatePrefixB2ResumeCases += 1;
    const resumedState = {
      ...expected.state,
      roomDescClearCount4a: corpus[index].resumeRoomDescClearCount4a ?? expected.state.roomDescClearCount4a,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    /* ABI v95 (record idx 16): B8 grid-capture differential. The host fills
       the exported scratch (costs int32 / trails int16) from the live
       Room+0x76c/+0xe6c grids BEFORE the resume whenever the blob gate is
       open and the capture is in contract; the pure grid step then replaces
       the host IN PLACE and the host copies the scratch back. The model
       mirrors the decision only (scratch is not part of state/events), so
       this harness seeds, resumes, reads back and compares cell-for-cell
       against the room oracle on the SAME captured arrays. */
    const b8Cells = (corpus[index].roomGridCells ?? 15) | 0; /* default matches the runtime fill (line ~4694) */
    const b8Ready = (corpus[index].roomB8BlobReady ?? 0) >>> 0;
    const b8GateOpen = roomB8NeedsPathCostHost(resumedState.frameCounter264f8 | 0, b8Cells) !== 0;
    const b8BlobPath = b8GateOpen && b8Ready !== 0 && b8Cells > 0 && b8Cells <= ROOM_B8_MAX_CELLS;
    const b8CostsIn = Array.isArray(corpus[index].roomB8Costs) ? corpus[index].roomB8Costs : null;
    const b8TrailsIn = Array.isArray(corpus[index].roomB8Trails) ? corpus[index].roomB8Trails : null;
    if (b8BlobPath) {
      if (b8CostsIn == null || b8TrailsIn == null) {
        throw new Error(
          `Case ${index}: B8 blob path active but the captured grids are missing ` +
            `(cells=${b8Cells} ready=${b8Ready})`,
        );
      }
      for (let i = 0; i < b8Cells; i += 1) {
        view.setInt32(b8CostsAddress() + i * 4, b8CostsIn[i] | 0, true);
        view.setInt16(b8TrailsAddress() + i * 2, b8TrailsIn[i] & 0xffff, true);
      }
      b8BlobSeededCases += 1;
    }
    /* ABI v95 (record idx 14): B2 spawn-in scratch seeding (ready path
       only — the host vouched the captures). 16 B per element:
       {i16 x @0, i16 y @2, u8 flag8 @4, pad @5..7, u32 d4 @8, u16 w4_4
       @12, u16 w4_6 @14}. The module reads these during the SAME B2 resume
       below; the out-scratch comparison runs after it. */
    const b2Ready = (runtimeInputs.b2PoolReady ?? 0) >>> 0;
    const b2Counts = Array.isArray(runtimeInputs.b2PoolCounts)
      ? runtimeInputs.b2PoolCounts : null;
    if (b2Ready !== 0 && b2Counts == null) {
      throw new Error(`Case ${index}: B2 ready but b2PoolCounts missing`);
    }
    const b2SpawnIn = Array.isArray(runtimeInputs.b2SpawnIn)
      ? runtimeInputs.b2SpawnIn : [];
    const b2SpawnCount = (runtimeInputs.b2SpawnCount ?? 0) >>> 0;
    if (b2Ready !== 0) {
      const b2Cap = Math.min(b2SpawnCount, b2SpawnMax());
      for (let i = 0; i < b2Cap; i += 1) {
        const e = b2SpawnIn[i] || {};
        const base = b2SpawnInAddress() + i * 16;
        view.setInt16(base + 0, (e.x ?? 0) & 0xffff, true);
        view.setInt16(base + 2, (e.y ?? 0) & 0xffff, true);
        view.setUint8(base + 4, (e.flag8 ?? 0) & 0xff);
        view.setUint32(base + 8, (e.d4 ?? 0) >>> 0, true);
        view.setUint16(base + 12, (e.w44 ?? 0) & 0xffff, true);
        view.setUint16(base + 14, (e.w46 ?? 0) & 0xffff, true);
      }
      b2SeededCases += 1;
    }
    const preB8Event = expected.events.opaqueRoomUpdatePrefixB8 | 0;
    if (resumeRoomUpdatePrefixB2() !== 1) throw new Error(`Room-update prefix B2 resume rejected case ${index}`);
    expected = resumeGameUpdateRoomUpdatePrefixB2(resumedState, runtimeInputs, expected.events);
    /* ABI v110 (record-16 eval): the deterministic theorem arms must take
       their EXPECTED law branch — counting mere B2-resume arrival would
       miss a row whose gate/cells edit silently switched arms (M2 mutant
       class: the 'pure' row re-keyed to an over-cap shape still routed to
       the B2 resume and slipped the old counter). */
    {
      const dtArm = corpus[index].dtB8Arm;
      if (dtArm) {
        const dtBranch = b8BlobPath ? "blob" : (b8GateOpen ? "gateOpen" : "gateMiss");
        const DT_B8_EXPECT = {
          pure: "blob", mini: "blob", cap448: "blob", wideready: "blob",
          mono: "gateOpen", overcap: "gateOpen", "overcap-wide": "gateOpen",
          gatemiss: "gateMiss", zerocells: "gateMiss", negcells: "gateMiss",
        };
        if (DT_B8_EXPECT[dtArm] !== dtBranch) {
          throw new Error(
            `ABI v110 B8 deterministic theorem arm ${dtArm} took branch ` +
              `${dtBranch}, expected ${DT_B8_EXPECT[dtArm]} ` +
              `(gate=${b8GateOpen} ready=${b8Ready} cells=${b8Cells})`,
          );
        }
        dtB8ArmCases[dtArm] = (dtB8ArmCases[dtArm] ?? 0) + 1;
      }
    }
    const b8HostDelta = (expected.events.opaqueRoomUpdatePrefixB8 | 0) - preB8Event;
    if (b8BlobPath) {
      if (b8HostDelta !== 0) {
        throw new Error(
          `Case ${index}: B8 blob path must NOT emit the host residual ` +
            `(delta ${b8HostDelta})`,
        );
      }
      /* Oracle on the SAME captured arrays (step a copy; the corpus arrays
         stay pristine for later resume stages). */
      const costsCopy = b8CostsIn.slice(0, b8Cells).map((v) => v | 0);
      const trailsCopy = b8TrailsIn.slice(0, b8Cells).map((v) => v | 0);
      roomB8PathCostGridStep(costsCopy, trailsCopy, b8Cells);
      for (let i = 0; i < b8Cells; i += 1) {
        const actCost = view.getInt32(b8CostsAddress() + i * 4, true);
        const actTrail = view.getInt16(b8TrailsAddress() + i * 2, true);
        if ((actCost >>> 0) !== (costsCopy[i] >>> 0) || (actTrail & 0xffff) !== (trailsCopy[i] & 0xffff)) {
          throw new Error(
            `Case ${index}: B8 grid scratch mismatch at cell ${i}: ` +
              `wasm cost=${actCost} trail=${actTrail} oracle ` +
              `cost=${costsCopy[i] | 0} trail=${trailsCopy[i] | 0}`,
          );
        }
      }
      b8BlobPureCases += 1;
      /* Wide ready value (>= 0x100 with a clear low byte still nonzero as a
         full-dword test) must take the blob path, not fall to host. */
      if (b8Ready >= 0x100) b8BlobWideReadyCases += 1;
    } else if (b8GateOpen) {
      if (b8HostDelta !== 1) {
        throw new Error(
          `Case ${index}: B8 gate open without a usable blob must emit the host ` +
            `residual exactly once (delta ${b8HostDelta})`,
        );
      }
      /* Host residual runs over the LIVE grids — the scratch must be
         untouched (still the reset() zeros). */
      for (let i = 0; i < ROOM_B8_MAX_CELLS; i += 1) {
        if (view.getInt32(b8CostsAddress() + i * 4, true) !== 0 ||
            view.getInt16(b8TrailsAddress() + i * 2, true) !== 0) {
          throw new Error(
            `Case ${index}: B8 host fallback touched the scratch at cell ${i} ` +
              `(gate-open residual must stay host over live grids)`,
          );
        }
      }
      if (b8Cells > ROOM_B8_MAX_CELLS) b8B8OverCapCases += 1;
      else b8B8NoBlobCases += 1;
    } else {
      if (b8HostDelta !== 0) {
        throw new Error(
          `Case ${index}: B8 gate miss must emit nothing (delta ${b8HostDelta})`,
        );
      }
      b8B8GateMissCases += 1;
    }
    /* ABI v95 (record idx 14): B2 out-scratch + carrier comparison. The
       spawn-in scratch was seeded above; the single B2 resume (B8 block)
       ran the module body. Compare the out-scratch plans against the
       model oracles on the SAME captured arrays (the generic sameRecord
       covers the events; this covers the scratch, which is not part of
       state/events). */
    if (b2Ready !== 0) {
      /* The chain (b2SpawnSeed1 advance + spawn loop) runs ONLY when the
         pool special gate opens (the model leaves b2SeedAfter/b2SpawnPlanCount
         at zero otherwise — case 275: the oracle advanced unconditionally). */
      const b2SpecOpen = gameUpdateSliceB2PoolSpecialGate(
        resumedState.roomCollectibleTimer7764 >>> 0,
        runtimeInputs.b2PoolGate18304 >>> 0) !== 0;
      const planCount = expected.events.b2SpawnPlanCount | 0;
      let oracleIdx = 0;
      let seed = runtimeInputs.b2PoolSeed0 >>> 0;
      seed = gameUpdateSliceB2RngXorshift(
        seed, runtimeInputs.b2PoolSeed1 >>> 0,
        runtimeInputs.b2PoolSeed2 >>> 0, runtimeInputs.b2PoolSeed3 >>> 0);
      const oracleCap = Math.min(b2SpawnCount, b2SpawnMax());
      for (let i = 0; i < oracleCap; i += 1) {
        const e = b2SpawnIn[i] || {};
        if (gameUpdateSliceB2SpawnQualify(
              e.flag8 ?? 0, e.d4 ?? 0, e.w44 ?? 0, e.w46 ?? 0) === 0) continue;
        const grid = gameUpdateSliceB2SpawnGridIndex(
          (e.x ?? 0) & 0xffff, (e.y ?? 0) & 0xffff,
          runtimeInputs.b2GridWidth >>> 0);
        seed = gameUpdateSliceB2RngXorshift(
          seed, runtimeInputs.b2PoolSeed1 >>> 0,
          runtimeInputs.b2PoolSeed2 >>> 0, runtimeInputs.b2PoolSeed3 >>> 0);
        const base = b2SpawnOutAddress() + oracleIdx * 24;
        const xBits = gameUpdateSliceB2PosX(
          grid, runtimeInputs.b2GridWidth >>> 0);
        const yBits = gameUpdateSliceB2PosY(
          grid, runtimeInputs.b2GridWidth >>> 0);
        const spawn2 = gameUpdateSliceB2Spawn2Gate(
          runtimeInputs.ambientRoomActive | 0,
          resumedState.frameCounter264f8 | 0,
          runtimeInputs.ambientRoomEntry11f0 | 0);
        if (view.getUint32(base + 0, true) !== xBits ||
            view.getUint32(base + 4, true) !== yBits ||
            view.getUint32(base + 8, true) !== grid ||
            view.getUint32(base + 12, true) !== seed ||
            view.getUint32(base + 16, true) !== spawn2) {
          throw new Error(
            `Case ${index}: B2 spawn plan mismatch at entry ${oracleIdx}: ` +
              `wasm ${view.getUint32(base + 0, true).toString(16)}/` +
              `${view.getUint32(base + 4, true).toString(16)}/` +
              `${view.getUint32(base + 8, true).toString(16)}/` +
              `${view.getUint32(base + 12, true).toString(16)}/` +
              `${view.getUint32(base + 16, true).toString(16)} oracle ` +
              `${xBits.toString(16)}/${yBits.toString(16)}/${grid}/` +
              `${seed}/${spawn2}`,
          );
        }
        oracleIdx += 1;
      }
      if (!b2SpecOpen) {
        /* Gate closed: the module's B2 block does not run; the trap is
           that the ORACLE must also skip (nothing to compare) and the
           module's plan count must be zero. */
        if (planCount !== 0) {
          throw new Error(
            `Case ${index}: B2 special gate closed but wasm planned ${planCount}`,
          );
        }
      } else {
        if (oracleIdx !== planCount) {
          throw new Error(
            `Case ${index}: B2 spawn plan count mismatch wasm ${planCount} ` +
              `oracle ${oracleIdx}`,
          );
        }
        if (expected.events.b2SeedAfter !== seed) {
          throw new Error(
            `Case ${index}: B2 seedAfter mismatch ` +
              `${expected.events.b2SeedAfter} vs ${seed}`,
          );
        }
      }
      b2PureCases += 1;
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX) {
    resumeCases += 1;
    roomUpdatePrefixResumeCases += 1;
    const resumedState = {
      ...expected.state,
      roomDescFlags44: corpus[index].resumeRoomDescFlags44 ?? expected.state.roomDescFlags44,
      roomDescClearCount4a: corpus[index].resumeRoomDescClearCount4a ?? expected.state.roomDescClearCount4a,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeRoomUpdatePrefix() !== 1) throw new Error(`Room-update prefix resume rejected case ${index}`);
    expected = resumeGameUpdateRoomUpdatePrefix(resumedState, runtimeInputs, expected.events);
      }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED) {
    resumeCases += 1;
    roomClearNestedResumeCases += 1;
    const resumedState = {
      ...expected.state,
      roomTransitionMode1830c: corpus[index].resumeRoomTransitionMode1830c ?? expected.state.roomTransitionMode1830c,
      roomTransitionMarker18318: corpus[index].resumeRoomTransitionMarker18318 ?? expected.state.roomTransitionMarker18318,
      roomTransitionIndex18900: corpus[index].resumeRoomTransitionIndex18900 ?? expected.state.roomTransitionIndex18900,
      roomTransitionDimension18904: corpus[index].resumeRoomTransitionDimension18904 ?? expected.state.roomTransitionDimension18904,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeRoomClearNested() !== 1) throw new Error(`Room clear nested resume rejected case ${index}`);
    expected = resumeGameUpdateRoomClearNested(resumedState, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR) {
    resumeCases += 1;
    roomUpdateClearResumeCases += 1;
    const resumedState = {
      ...expected.state,
      roomAlive12c0: corpus[index].resumeRoomAlive12c0 ?? expected.state.roomAlive12c0,
      roomAlive12c4: corpus[index].resumeRoomAlive12c4 ?? expected.state.roomAlive12c4,
      roomBossCount12c8: corpus[index].resumeRoomBossCount12c8 ?? expected.state.roomBossCount12c8,
      roomBossCount12cc: corpus[index].resumeRoomBossCount12cc ?? expected.state.roomBossCount12cc,
      roomClearDelay11ec: corpus[index].resumeRoomClearDelay11ec ?? expected.state.roomClearDelay11ec,
      roomDescSubtype: corpus[index].resumeRoomDescSubtype ?? expected.state.roomDescSubtype,
      roomType8: corpus[index].resumeRoomType8 ?? expected.state.roomType8,
      roomDescFlags44: corpus[index].resumeRoomDescFlags44 ?? expected.state.roomDescFlags44,
      roomTransitionMode1830c: corpus[index].resumeRoomTransitionMode1830c ?? expected.state.roomTransitionMode1830c,
      roomAmbientCount7454: corpus[index].roomAmbientCount7454 ?? expected.state.roomAmbientCount7454 ?? 0,
      roomAmbientIntensity7458: corpus[index].roomAmbientIntensity7458 ?? expected.state.roomAmbientIntensity7458 ?? 0,
      roomAmbientFlag745c: corpus[index].roomAmbientFlag745c ?? expected.state.roomAmbientFlag745c ?? 0,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    /* ABI v52: mt[624] is read/write scratch, so load the module's copy from
       the case (a missing array is "not ready" and never advanced). */
    const mtSource = corpus[index].genrandState
      ? Uint32Array.from(corpus[index].genrandState)
      : new Uint32Array(GENRAND_STATE_WORDS);
    const ambientWillCheck = (corpus[index].genrandMtReady ?? 0) !== 0 || (expected.events.opaqueRoomUpdateAmbient824a70Genrand ?? 0) > 0 || (expected.events.ambient824a70GenrandSamples ?? 0) !== 0;
    if ((runtimeInputs.genrandMtReady ?? 0) !== 0 || ambientWillCheck) {
      new Uint32Array(wasm.memory.buffer, genrandStateAddress(), GENRAND_STATE_WORDS).set(mtSource);
      new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0] = (runtimeInputs.genrandIndexIn ?? 0) | 0;
    }
    if (resumeRoomUpdateClear() !== 1) throw new Error(`Room-update-clear resume rejected case ${index}`);
    expected = resumeGameUpdateRoomUpdateClear(resumedState, runtimeInputs, expected.events);
    /* ABI v53: room 0x824A70 OTIO driver pure draws. The module filled its
       624-word state and sample scratch; the oracle replays the same draws
       from the seeded case copy (index 625 cold-seeds, 624 reloads). */
    if ((corpus[index].genrandMtReady ?? 0) !== 0 || (expected.events.ambient824a70GenrandSamples ?? 0) !== 0) {
      const oracleState = Uint32Array.from(mtSource);
      const genrandLoops = expected.events.ambient824a70LoopCount ?? 0;
      const expectedFill = roomAmbient824a70GenrandMtSamples(
        oracleState,
        (corpus[index].genrandIndexIn ?? 0) | 0,
        genrandLoops,
        (corpus[index].genrandModeFlag ?? 0) >>> 0,
      );
      const samples = (expectedFill && expectedFill.values) ? expectedFill.values.length : 0;
      if ((expected.events.ambient824a70GenrandSamples ?? 0) > 0 && samples > 0) {
        genrandPureCases += 1;
        if (expectedFill.reloads > 0) genrandReloadCases += 1;
        const actualSamples = Array.from(
          new Uint32Array(wasm.memory.buffer, genrandSamplesAddress(), GENRAND_MAX_SAMPLES),
        );
        for (let i = 0; i < samples; i += 1) {
          if (actualSamples[i] !== (expectedFill.values[i] >>> 0)) {
            throw new Error(`Case ${index}: genrand sample ${i} mismatch ${actualSamples[i]} !== ${expectedFill.values[i]}`);
          }
        }
        const actualState = Array.from(
          new Uint32Array(wasm.memory.buffer, genrandStateAddress(), GENRAND_STATE_WORDS),
        );
        for (let i = 0; i < GENRAND_STATE_WORDS; i += 1) {
          if (actualState[i] !== (oracleState[i] >>> 0)) {
            throw new Error(
              `Case ${index}: mt[${i}] mismatch ${actualState[i]} !== ${oracleState[i]}`,
            );
          }
        }
const indexOut = new Uint32Array(wasm.memory.buffer, genrandIndexOutAddress(), 1)[0];
      if (indexOut !== (expectedFill.indexOut | 0)) {
          throw new Error(`Case ${index}: genrand index-out ${indexOut} !== ${expectedFill.indexOut}`);
        }
        /* ABI v95 (record idx 34 B13 H5): the model published typed per-loop
           CREATE-arm plans (ambient824a70CreateTyped == loops) on the
           mt-pure arm. The module must have filled 7 words per loop from
           the R3 seed slot (samples[i*7+3], PE 0x00824ca4): [type 0x3e8,
           variant 0x8a, layer 0, data 0xb1bc54, a1 1, seed, game 0xc71678].
           An R2-slot mutant fails here (NOTES.md update-v95-824a70-create-typed
           M4). */
        const typedPlans = (expected.events.ambient824a70CreateTyped ?? 0) >>> 0;
        if (typedPlans > 0) {
          const planWords = new Uint32Array(
            wasm.memory.buffer, ambient824a70CreateArgsAddress(), AMBIENT_824A70_MAX_LOOPS * 7,
          );
          if (typedPlans > AMBIENT_824A70_MAX_LOOPS) {
            throw new Error(`Case ${index}: typed plan count ${typedPlans} exceeds the scratch cap`);
          }
          for (let i = 0; i < typedPlans; i += 1) {
            const seed = expectedFill.values[i * 7 + 3] >>> 0;
            const want = gameUpdateSliceAmbient824a70CreateArgsWords(seed);
            for (let w = 0; w < 7; w += 1) {
              if (planWords[i * 7 + w] !== want[w]) {
                throw new Error(
                  `Case ${index}: create-args plan ${i} word ${w} mismatch ` +
                    `${planWords[i * 7 + w]} !== ${want[w]}`,
                );
              }
            }
          }
          ambient824a70CreateTypedCases += 1;
        }
      } else if ((expected.events.opaqueRoomUpdateAmbient824a70Genrand ?? 0) > 0) {
        genrandHostCases += 1;
      } else {
        /* CRT-rand active (mode flag low byte set): the PE early-returns
           without touching mt[], so the module must leave its copy intact. */
        const actualState = Array.from(
          new Uint32Array(wasm.memory.buffer, genrandStateAddress(), GENRAND_STATE_WORDS),
        );
        for (let i = 0; i < GENRAND_STATE_WORDS; i += 1) {
          if (actualState[i] !== (mtSource[i] >>> 0)) {
            throw new Error(`Case ${index}: CRT-rand path advanced mt[${i}]`);
          }
        }
        genrandCrtCases += 1;
      }
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD) {
    resumeCases += 1;
    roomUpdateHeadResumeCases += 1;
    const resumedState = {
      ...expected.state,
      roomFxCounter70d8: corpus[index].resumeRoomFxCounter70d8 ?? expected.state.roomFxCounter70d8,
      roomFxLimit70dc: corpus[index].resumeRoomFxLimit70dc ?? expected.state.roomFxLimit70dc,
      roomFxStep70d4: corpus[index].resumeRoomFxStep70d4 ?? expected.state.roomFxStep70d4,
      roomFxValue70cc: corpus[index].resumeRoomFxValue70cc ?? expected.state.roomFxValue70cc,
      roomFxCounter70f4: corpus[index].resumeRoomFxCounter70f4 ?? expected.state.roomFxCounter70f4,
      roomFxLimit70f8: corpus[index].resumeRoomFxLimit70f8 ?? expected.state.roomFxLimit70f8,
      roomFxStep70f0: corpus[index].resumeRoomFxStep70f0 ?? expected.state.roomFxStep70f0,
      roomFxValue70e8: corpus[index].resumeRoomFxValue70e8 ?? expected.state.roomFxValue70e8,
      roomTimer706c: corpus[index].resumeRoomTimer706c ?? expected.state.roomTimer706c,
      roomTimer7214: corpus[index].resumeRoomTimer7214 ?? expected.state.roomTimer7214,
      roomTimer722c: corpus[index].resumeRoomTimer722c ?? expected.state.roomTimer722c,
      roomTimer7230: corpus[index].resumeRoomTimer7230 ?? expected.state.roomTimer7230,
      roomWaterAmount7240: corpus[index].resumeRoomWaterAmount7240 ?? expected.state.roomWaterAmount7240,
      roomLavaIntensity7740: corpus[index].resumeRoomLavaIntensity7740 ?? expected.state.roomLavaIntensity7740,
      roomGreedWave723c: corpus[index].resumeRoomGreedWave723c ?? expected.state.roomGreedWave723c,
      roomWaterLerpCountdown7298: corpus[index].resumeRoomWaterLerpCountdown7298 ?? expected.state.roomWaterLerpCountdown7298,
      roomBossCount12c8: corpus[index].resumeRoomBossCount12c8 ?? expected.state.roomBossCount12c8,
      roomBossCount12cc: corpus[index].resumeRoomBossCount12cc ?? expected.state.roomBossCount12cc,
      roomDescFlags44:
        corpus[index].resumeHeadRoomDescFlags44 ??
        corpus[index].resumeRoomDescFlags44 ??
        expected.state.roomDescFlags44,
      roomFlag7894: corpus[index].resumeRoomFlag7894 ?? expected.state.roomFlag7894,
      roomFlag7769: corpus[index].resumeRoomFlag7769 ?? expected.state.roomFlag7769,
      /* ABI v69: host bodies during the pause can rewrite Game+0x1b83c /
         Game+0x1ba78 — the PE re-reads both LIVE inside PlayerManager::Update
         (0x009bb5df / 0x009bb5ee), which is exactly why PM0 re-tests. These
         lanes model such a mid-pause rewrite so the closed-gate arm of the
         death wire is presented. */
      gate1b83c: corpus[index].resumeHeadGate1b83c ?? expected.state.gate1b83c,
      gate1ba78: corpus[index].resumeHeadGate1ba78 ?? expected.state.gate1ba78,
      /* ABI v95 (record idx 36 water-b16): head-resume state lanes that
         drive the 823540 wire inside the resume (the model captures
         difficulty/flags/type/fx-cur from the resumed state). Defaults keep
         legacy rows on their pre-wire arms. */
      flags2654c: corpus[index].resumeHeadFlags2654c ?? expected.state.flags2654c,
      roomType8: corpus[index].resumeHeadRoomType8 ?? expected.state.roomType8,
      difficulty269c8: corpus[index].resumeHeadDifficulty269c8 ?? expected.state.difficulty269c8,
      fxCur676b8: corpus[index].resumeHeadFxCur676b8 ?? expected.state.fxCur676b8,
      fxCur676bc: corpus[index].resumeHeadFxCur676bc ?? expected.state.fxCur676bc,
      fxCur676c0: corpus[index].resumeHeadFxCur676c0 ?? expected.state.fxCur676c0,
      fxCur676c4: corpus[index].resumeHeadFxCur676c4 ?? expected.state.fxCur676c4,
      fxCur676c8: corpus[index].resumeHeadFxCur676c8 ?? expected.state.fxCur676c8,
      fxCur676cc: corpus[index].resumeHeadFxCur676cc ?? expected.state.fxCur676cc,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeRoomUpdateHead() !== 1) throw new Error(`Room-update head resume rejected case ${index}`);
    const preDeathEmit = expected.events.playerManagerUpdateDeath >>> 0;
    expected = resumeGameUpdateRoomUpdateHead(resumedState, runtimeInputs, expected.events);
    /* ABI v69 death-wire lane pins — expectations derived from the PE facts,
       not from either implementation: dual-zero closed or outer count==0
       emit NOTHING (PE 0x009bb5e8/0x009bb5f5 jne, 0x009bb610 je — no fatal);
       blob=0 / count>8 fall back to exactly ONE monolithic walk emit; ready
       packs emit iff at least one player is eligible under the family law
       (consumed by reference for classification). */
    {
      const deathDelta =
        (expected.events.playerManagerUpdateDeath >>> 0) - preDeathEmit;
      const dwCount = (corpus[index].pmDeathPlayerCount ?? 1) | 0;
      const dwBlob = ((corpus[index].pmDeathBlobReady ?? 0) >>> 0) !== 0;
      const dwDualZero =
        (resumedState.gate1b83c | 0) === 0 && (resumedState.gate1ba78 | 0) === 0;
      if (!dwDualZero) {
        if (deathDelta !== 0) {
          throw new Error(`Case ${index}: death walk emitted with PM0 gate closed`);
        }
        deathGateClosedCases += 1;
      } else if (dwCount <= 0) {
        if (deathDelta !== 0) {
          throw new Error(`Case ${index}: death walk emitted for empty player vector (PE 0x009bb610 je skips, no fatal)`);
        }
        deathCount0DropCases += 1;
      } else if (!dwBlob || dwCount > 8) {
        if (deathDelta !== 1) {
          throw new Error(`Case ${index}: monolithic death fallback must emit exactly once (delta ${deathDelta})`);
        }
        deathMonolithicCases += 1;
      } else {
        let dwEligible = 0;
        for (let i = 0; i < Math.min(dwCount, 8); i += 1) {
          if (
            pmDeathPlayerEligible(
              corpus[index][`pmDeathDead173${i}`] ?? 0,
              corpus[index][`pmDeathAnim7c${i}`] ?? 0,
              corpus[index][`pmDeathAnim8c${i}`] ?? 0,
              corpus[index][`pmDeathTwinNull${i}`] ?? 0,
              corpus[index][`pmDeathTwinAnim7c${i}`] ?? 0,
              corpus[index][`pmDeathTwinAnim8c${i}`] ?? 0,
            )
          ) {
            dwEligible += 1;
          }
        }
        if (dwEligible === 0) {
          if (deathDelta !== 0) {
            throw new Error(`Case ${index}: zero-eligible death walk must be pure-complete (delta ${deathDelta})`);
          }
          deathPureDropCases += 1;
        } else {
          if (deathDelta !== 1) {
            throw new Error(`Case ${index}: eligible death walk must emit the monolithic host once (delta ${deathDelta})`);
          }
          deathWalkCases += 1;
        }
        const wideLane = [0, 1, 2, 3, 4, 5, 6, 7].some((i) => {
          const lanes = [
            corpus[index][`pmDeathDead173${i}`] ?? 0,
            corpus[index][`pmDeathAnim8c${i}`] ?? 0,
            corpus[index][`pmDeathTwinNull${i}`] ?? 0,
            corpus[index][`pmDeathTwinAnim8c${i}`] ?? 0,
          ];
          return lanes.some((v) => (v >>> 0) > 0xff);
        });
        if (wideLane) deathWideByteCases += 1;
      }
    }
    /* ABI v95 (record idx 36): water-b16 823540-wire differential. The
       model's carriers must equal the standalone oracle over the SAME
       resumed capture (independent cross-check), and the fx state must
       match the law. The coarse edge + the wasm events are asserted by
       sameRecord; this block counts arms + pins the pure content. */
    {
      const wReady = (corpus[index].waterB16BlobReady ?? 0) >>> 0;
      const wWaterPost = Math.fround(expected.state.roomWaterAmount7240);
      const wLavaPre = Math.fround(resumedState.roomLavaIntensity7740);
      const wGateOpen = roomB16Needs823540(wWaterPost, wLavaPre) !== 0;
      if (wReady !== 0 && wGateOpen) {
        waterB16WireCases += 1;
        if ((expected.events.waterB16WireApplied | 0) !== 1) {
          throw new Error(`Case ${index}: water-b16 wire must run (blob ready + 823540 gate open)`);
        }
        const ws = gameUpdateSliceB16WaterWire({
          waterPost: wWaterPost,
          lavaPre: wLavaPre,
          gameByte183a0: runtimeInputs.waterB16GameByte183a0 | 0,
          gameByte269e9: runtimeInputs.waterB16GameByte269e9 | 0,
          game1830c: resumedState.roomTransitionMode1830c | 0,
          roomType8: resumedState.roomType8 | 0,
          difficulty269c8: resumedState.difficulty269c8 | 0,
          gameType0: runtimeInputs.waterB16GameType0 | 0,
          gameSubtype4: runtimeInputs.waterB16GameSubtype4 | 0,
          flags2654c: resumedState.flags2654c | 0,
          unlockAcc: runtimeInputs.waterB16UnlockAcc | 0,
          unlockClear: runtimeInputs.waterB16UnlockClear | 0,
          src1b10: [
            bitsToF32(runtimeInputs.waterB16Src1b10_0 | 0),
            bitsToF32(runtimeInputs.waterB16Src1b10_1 | 0),
            bitsToF32(runtimeInputs.waterB16Src1b10_2 | 0),
            bitsToF32(runtimeInputs.waterB16Src1b10_3 | 0),
            bitsToF32(runtimeInputs.waterB16Src1b10_4 | 0),
            bitsToF32(runtimeInputs.waterB16Src1b10_5 | 0),
          ],
          gridFlags44: runtimeInputs.waterB16GridFlags44 | 0,
          room1d18: runtimeInputs.ambientRoom1d18 | 0,
          gridWc: runtimeInputs.b3b7WidthC | 0,
          gridH10: runtimeInputs.b3b7Height10 | 0,
          cellDword54: runtimeInputs.waterB16CellDword54 | 0,
          fxCur: [
            Math.fround(resumedState.fxCur676b8), Math.fround(resumedState.fxCur676bc),
            Math.fround(resumedState.fxCur676c0), Math.fround(resumedState.fxCur676c4),
            Math.fround(resumedState.fxCur676c8), Math.fround(resumedState.fxCur676cc),
          ],
        }) || {};
        const gate = (ws.gate | 0) & 0xff;
        if (gate === 0) waterB16Gate0Cases += 1;
        else waterB16Gate1Cases += 1;
        if ((expected.events.waterB16Gate | 0) !== gate) {
          throw new Error(`Case ${index}: water-b16 gate model=${expected.events.waterB16Gate} oracle=${gate}`);
        }
        if (Array.isArray(ws.step)) {
          for (let i = 0; i < 6; i += 1) {
            const ev = (expected.events[`waterB16Step${i}`] >>> 0);
            const want = f32Bits(Math.fround(ws.step[i])) >>> 0;
            if (ev !== want) {
              throw new Error(`Case ${index}: water-b16 step[${i}] model=${ev} oracle=${want}`);
            }
          }
        }
        if (gate !== 0 && Array.isArray(ws.goal)) {
          for (let i = 0; i < 6; i += 1) {
            const ev = expected.events[`waterB16Goal${i}`] | 0;
            const want = f32Bits(Math.fround(ws.goal[i]));
            if (ev !== want) {
              throw new Error(`Case ${index}: water-b16 goal[${i}] model=${ev} oracle=${want}`);
            }
          }
        }
        if (gate === 0) {
          const fx = [
            Math.fround(expected.state.fxCur676b8), Math.fround(expected.state.fxCur676bc),
            Math.fround(expected.state.fxCur676c0), Math.fround(expected.state.fxCur676c4),
          ];
          for (let i = 0; i < 4; i += 1) {
            if (f32Bits(fx[i]) !== f32Bits(Math.fround(ws.curSnap?.[i] ?? 0))) {
              throw new Error(`Case ${index}: water-b16 cur snap[${i}] mismatch`);
            }
          }
        } else if (((expected.state.fxLerpGate676b4 | 0) & 0xff) === 0) {
          throw new Error(`Case ${index}: water-b16 gate=1 must set fxLerpGate676b4`);
        }
      } else {
        waterB16NoWireCases += 1;
        if ((expected.events.waterB16WireApplied | 0) !== 0) {
          throw new Error(`Case ${index}: water-b16 wire must NOT run (blob=${wReady} gate=${wGateOpen})`);
        }
      }
    }
    /* ABI v107 (record idx 39 mid-restock): desc-pack differential arms.
       Derived from the SAME drawn values the module sees (runtimeInputs
       whitelist) + the resumed state fields the wire reads. The pure
       walk, MONOLITHIC fallback and the seed==0 typed drop must all be
       reached on the Wasm side — a whitelist that silently zeroes the
       pack collapses every arm into skip and this block fails the guard. */
    {
      const mrOwner = (runtimeInputs.midRestockOwner0x209 ?? 0) >>> 0;
      const mrReady = (runtimeInputs.midRestockDescReady ?? 0) >>> 0;
      const mrAc = (runtimeInputs.midRestockDescAc ?? 0) >>> 0;
      const mrAe = (runtimeInputs.midRestockDescAe ?? 0) >>> 0;
      const mrSeed = (runtimeInputs.midRestockDescSeed58 ?? 0) >>> 0;
      const mrRoomType = resumedState.roomType8 | 0;
      const mrActive = (runtimeInputs.ambientRoomActive ?? 0) !== 0;
      const mrAge = (resumedState.frameCounter264f8 | 0) -
        (runtimeInputs.ambientRoomEntry11f0 ?? 0) | 0;
      const mrOuterOpen = mrRoomType === 2 && mrOwner !== 0 && mrActive && mrAge > 1;
      const ac16 = (mrAc << 16) >> 16;
      const ae16 = (mrAe << 16) >> 16;
      const mrInnerOpen = ac16 > 0 && (ae16 >= ac16 || ae16 === -1);
      if (!mrOuterOpen || !mrInnerOpen || mrReady === 0) {
        if (mrOuterOpen && mrReady === 0) midRestockMonoLaneCases += 1;
        else midRestockSkipLaneCases += 1;
      } else if (mrSeed === 0) {
        midRestockFatalDropLaneCases += 1;
        if ((expected.events.opaqueRoomUpdateTailMidRestock | 0) !== 0) {
          throw new Error(`Case ${index}: mid-restock seed==0 must TYPED-DROP (no coarse event, PE 0x007e9033 fatal); got coarse ${expected.events.opaqueRoomUpdateTailMidRestock}`);
        }
      } else {
        midRestockPureLaneCases += 1;
      }
      /* ABI v108 (record idx 39 REMOVAL, update-v108-record39-removal):
         the FULL-CAPTURE invariant. With descReady != 0 (pack vouched)
         the coarse event opaqueRoomUpdateTailMidRestock @220 must NEVER
         fire and the typed drop midRestockSeedZeroDrop @984 must equal
         the seed==0 body-reached law (outer gate closed -> 0, inner
         short gate closed -> 0, seed58 FULL-DWORD == 0 -> 1, any WIDE
         nonzero incl. 0xffffffff -> 0). With the pack ABSENT under an
         open outer gate (capture-absence gate miss) the MONOLITHIC
         residual must fire the coarse exactly once and nothing typed.
         A violation of the capture theorem fails the run — this is the
         discriminating evidence that makes record idx 39 removable. */
      const wantTyped =
        mrOuterOpen && mrInnerOpen && mrReady !== 0 && mrSeed === 0 ? 1 : 0;
      if ((expected.events.midRestockSeedZeroDrop | 0) !== wantTyped) {
        throw new Error(
          `Case ${index}: mid-restock typed-drop law mismatch (seed=0x${mrSeed.toString(16)} ` +
            `outer=${mrOuterOpen} inner=${mrInnerOpen} ready=${mrReady}): ` +
            `want ${wantTyped} got ${expected.events.midRestockSeedZeroDrop}`,
        );
      }
      if (mrReady !== 0) {
        if ((expected.events.opaqueRoomUpdateTailMidRestock | 0) !== 0) {
          throw new Error(
            `Case ${index}: FULL-CAPTURE violation — coarse event fired with ` +
              `descReady=${mrReady} (outer=${mrOuterOpen} inner=${mrInnerOpen} ` +
              `seed=0x${mrSeed.toString(16)}); the typed/pure/NONE law must replace it`,
          );
        }
      } else if (mrOuterOpen) {
        if ((expected.events.opaqueRoomUpdateTailMidRestock | 0) !== 1) {
          throw new Error(
            `Case ${index}: capture-absence gate miss must fire the MONOLITHIC ` +
              `coarse event exactly once (got ${expected.events.opaqueRoomUpdateTailMidRestock})`,
          );
        }
        if ((expected.events.midRestockSeedZeroDrop | 0) !== 0) {
          throw new Error(
            `Case ${index}: typed drop with the pack absent (ready=0) is impossible`,
          );
        }
      }
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A) {
    resumeCases += 1;
    pass4257b0ResumeCases += 1;
    /* ABI v53: the hybrid host recaptures the live 0x68-stride count after the
       Pass A residual ran, then the PE-exact Pass B gate consumes it. */
    writeRuntimeInputsFlat(runtimeInputs, corpus[index]);
    const prePassB = expected.events.opaqueCall004257b0PassB;
    const blobPassA = expected.events.frameOpaque4257b0PassAApplied === 1;
    if (resume4257b0PassA() !== 1) throw new Error(`4257b0 Pass A resume rejected case ${index}`);
    expected = resumeGameUpdate4257b0PassA(expected.state, runtimeInputs, expected.events);
    /* The model gates Pass B on the input of whichever arm ran: the
       recaptured F4 pair on the blob arm, the PostPassA lane on the
       pass-A-resume legacy arm, and the pre ListCount on the head legacy
       arm (no Pass A continuation). Mirror that here so corpus rows with
       independently drawn lanes do not false-positive. */
    const postPassAListCount = blobPassA
      ? frameOpaque4257b0ListCountFromBounds(
          runtimeInputs.frameOpaque4257b0PostListBegin >>> 0,
          runtimeInputs.frameOpaque4257b0PostListEnd >>> 0,
        ) >>> 0
      : (expected.events.opaqueCall004257b0PassA > 0
          ? (runtimeInputs.frameOpaque4257b0PostPassAListCount ?? 0)
          : (runtimeInputs.frameOpaque4257b0ListCount ?? 0)) >>> 0;
    if (blobPassA) {
      /* ABI v71: the pure Pass A ran, so the legacy count input is NOT the
         gate; the recaptured F4 pair is. */
      const outcome = frameOpaque4257b0Outcome(runtimeInputs);
      if (!outcome.usable) {
        throw new Error(`Case ${index}: pass A applied but the blob is not usable`);
      }
      if (expected.events.opaqueCall004257b0PassB !== prePassB && !outcome.mismatch) {
        throw new Error(`Case ${index}: pure Pass B still emitted the 0x004257b0 host edge`);
      }
      if (outcome.mismatch) fo4257b0MismatchCases += 1;
      if (runtimeInputs.frameOpaque4257b0PostListBegin !==
          runtimeInputs.frameOpaque4257b0ListBegin) {
        fo4257b0MovedBaseCases += 1;
      }
    } else if (expected.events.opaqueCall004257b0PassB === 0) {
      if (prePassB !== 0) {
        throw new Error(`Case ${index}: pass A re-capture emptied the list, Pass B host edge still emitted`);
      }
      if (postPassAListCount !== 0) {
        throw new Error(`Case ${index}: pass A re-capture kept a non-empty list but Pass B host edge dropped`);
      }
      pass4257b0EmptyPostCases += 1;
    } else {
      if (postPassAListCount === 0) {
        throw new Error(`Case ${index}: empty re-captured list still emitted Pass B`);
      }
      pass4257b0LivePostCases += 1;
    }
  }
  /* ---- ABI v71: FUN_004257b0 blob arms + the list_out scratch ---------- */
  {
    const blobReady = (runtimeInputs.frameOpaque4257b0BlobReady ?? 0) >>> 0;
    const applied = (expected.events.frameOpaque4257b0PassAApplied >>> 0) !== 0 ||
                    (expected.events.frameOpaque4257b0PassBApplied >>> 0) !== 0;
    if (blobReady !== 0) {
      const outcome = frameOpaque4257b0Outcome(runtimeInputs);
      if (!outcome.usable) {
        if (applied) {
          throw new Error(`Case ${index}: over-cap blob still ran the pure body`);
        }
        /* Only count a fallback that actually reached the block: an unusable
           blob must leave the v70 host edge in place, so a legacy emission is
           the proof the alternative branch ran. */
        if ((expected.events.opaqueCall004257b0PassA >>> 0) !== 0 ||
            (expected.events.opaqueCall004257b0PassB >>> 0) !== 0) {
          fo4257b0FallbackCases += 1;
        }
      } else if (applied) {
        fo4257b0BlobCases += 1;
        if (expected.events.opaqueCall004257b0PassA !== 0) {
          throw new Error(`Case ${index}: pure blob path still emitted the Pass A host edge`);
        }
        /* The outcome spreads the plan, so idCount/capCount are available;
           ranPassA/listGrow were never model fields (stale names made the
           pass-A-pure and grow arms uncountable). */
        if (((outcome.idCount ?? 0) | 0) !== 0) fo4257b0PassAPureCases += 1;
        else fo4257b0NoRecaptureCases += 1;
        if (outcome.inserted > 0) fo4257b0InsertCases += 1;
        if ((outcome.purePostCount >>> 0) > ((outcome.capCount ?? 0) >>> 0)) fo4257b0GrowCases += 1;
        if (outcome.passBStores > 0) fo4257b0StoreCases += 1;
        if (runtimeInputs.frameOpaque4257b0CtrBegin ===
            runtimeInputs.frameOpaque4257b0CtrEnd) {
          fo4257b0EmptyCtrCases += 1;
        } else {
          fo4257b0NonEmptyCtrCases += 1;
        }
        if (((runtimeInputs.frameOpaque4257b0ListEnd >>> 0) -
             (runtimeInputs.frameOpaque4257b0ListBegin >>> 0)) >>> 0 > 0x80000000) {
          fo4257b0NegativeDeltaCases += 1;
        }
        /* The pure body owns the list contents, which live in module scratch
           rather than sparse state — compare them directly. */
        const maxList = fo4257b0MaxList();
        const actual = Array.from(
          new Uint32Array(wasm.memory.buffer, fo4257b0ListOutAddress(), 3 * maxList),
        );
        /* The module publishes the buffer it actually has at the end of the
           step: post-Pass-A bytes when Pass A ran but the recapture
           disagreed (the mismatch arm — pass_b never runs in the module,
           the host edge is emitted instead), post-Pass-B bytes otherwise.
           The model's Outcome simulates pass_b UNCONDITIONALLY into
           triples.slot8, so on the mismatch arm the expected +8 lane must
           be the POST-PASS-A values: input ListSlot8 for the pre entries,
           ELEM_TIMER_INIT for the appended ones (measured list_out
           divergence at case 1944 — the model rewrote an entry the module
           correctly left at the append template). */
        const preCount = (outcome.plan?.preCount ?? 0) >>> 0;
        const slot8Want = (i) => (outcome.mismatch
          ? ((i < preCount)
              ? (runtimeInputs[`frameOpaque4257b0ListSlot8${i}`] >>> 0)
              : FRAME_OPAQUE_4257B0_ELEM_TIMER_INIT)
          : (outcome.triples.slot8[i] >>> 0));
        for (let i = 0; i < outcome.purePostCount && i < maxList; i += 1) {
        const want = [
            outcome.triples.lo[i] >>> 0,
            outcome.triples.hi[i] >>> 0,
            slot8Want(i),
          ];
          const got = [actual[i] >>> 0, actual[maxList + i] >>> 0,
                       actual[2 * maxList + i] >>> 0];
          for (let k = 0; k < 3; k += 1) {
            if (got[k] !== want[k]) {
              throw new Error(
                `FUN_004257b0 list_out mismatch at case ${index} elem ${i} dword ${k}: ` +
                  `${got[k]} !== ${want[k]}`,
              );
            }
          }
        }
      }
    } else if (applied) {
      throw new Error(`Case ${index}: blob absent but the pure 4257b0 body ran`);
    }
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    resumeCases += 1;
    frameManagerHandoffs += 1;
    const resumedState = {
      ...expected.state,
      fadeCounter26514: corpus[index].resumeFadeCounter26514 ?? expected.state.fadeCounter26514,
      fadeProgress26518: corpus[index].resumeFadeProgress26518 ?? expected.state.fadeProgress26518,
      shakeCurrent67738: corpus[index].resumeShakeCurrent67738 ?? expected.state.shakeCurrent67738,
      shakeTarget6773c: corpus[index].resumeShakeTarget6773c ?? expected.state.shakeTarget6773c,
      shakeStep67740: corpus[index].resumeShakeStep67740 ?? expected.state.shakeStep67740,
      timer269e0: corpus[index].resumeTimer269e0 ?? expected.state.timer269e0,
      listCount67730: corpus[index].resumeListCount67730 ?? expected.state.listCount67730,
    };
    fastWriteStruct(stateAddress(), STATE_ENTRIES, resumedState);
    if (resumeFrameManagerUpdates() !== 1) throw new Error(`FrameManager resume rejected case ${index}`);
    expected = resumeGameUpdateFrameManagerUpdates(resumedState, constants, runtimeInputs, expected.events);
    /* ABI v57: count the LuaEngine frame-unref 0x008607a0 gate sides reached
       on this hand-off. A ready capture must exercise both the dropped edge
       (flag bit 1 clear) and the host-open edge (bit 1 set). */
    if ((runtimeInputs.luaFrameUnrefReady ?? 0) !== 0) {
      if (expected.events.opaqueCall008607a0 !== 0) luaFrameUnrefActiveCases += 1;
      else luaFrameUnrefSkipCases += 1;
    } else {
      luaFrameUnrefFallbackCases += 1;
    }
    /* ABI v60: SFX stop gate (VA 0x0092e230) reached only when the PM3 wire
       decides STOP. ready=0 keeps the pre-v60 host residual (fallback);
       ready=1 + MISS/DISABLED drops the host edge (pure skip); NO_SAMPLES /
       LIVE keeps it (host). */
    if ((runtimeInputs.sfxStopReady ?? 0) !== 0) {
      if (expected.events.playerManagerUpdateHeartbeatSfxStop !== 0) {
        sfxStopHostCases += 1;
      } else {
        sfxStopPureSkipCases += 1;
      }
    } else {
      sfxStopFallbackCases += 1;
    }
    /* ABI v95: record idx 47 STOP fold. fold-ready corpora must exercise
       the in-module fold: applied=1 with the typed stop event / dropped
       monolithic (LIVE + all-null) OR the v60 fallback (over-cap, missing
       capture, NO_SAMPLES warn). */
    if ((runtimeInputs.sfxStopFoldReady ?? 0) !== 0) {
      if (expected.events.sfxStopFoldApplied !== 0) {
        sfxStopFoldCases += 1;
      } else {
        sfxStopFoldFallbackCases += 1;
      }
    }
    /* ABI v62: SFX update gate (VA 0x0092df40) under an UPDATE-shaped wire.
       Same four PE classes and the shared sfxStop captures; ready=0 keeps
       the pre-v62 always-host residual. */
    if ((runtimeInputs.sfxStopReady ?? 0) !== 0) {
      if (expected.events.playerManagerUpdateHeartbeatSfxUpdate !== 0) {
        sfxUpdateHostCases += 1;
      } else {
        sfxUpdatePureSkipCases += 1;
      }
    } else {
      sfxUpdateFallbackCases += 1;
    }
    /* ABI v68: SFX play gate (VA 0x0092dc30, exact SFXManager::Play)
       reached only when the PM3 wire decides PLAY. ready=0 keeps the
       pre-v68 host residual (fallback); ready=1 + MISS (id<0 or
       id>=count) is the ONLY pure no-op -> the event is DROPPED;
       NO_SAMPLES / DISABLED / LIVE all keep the host event (warn-log /
       load+continue / body). */
    if ((runtimeInputs.sfxStopReady ?? 0) !== 0) {
      /* ABI v95 (record idx 46): the PLAY residual is THREE typed leaves —
         the monolithic heartbeat_sfx_play counter only fires on ready=0.
         The host arm is the NO_SAMPLES/PRELOAD/DEVICE leaves; MISS is the
         pure drop (all three zero). */
      const playHostEv =
        (expected.events.playerManagerUpdateHeartbeatSfxPlayNoSamples | 0) +
        (expected.events.playerManagerUpdateHeartbeatSfxPlayPreload | 0) +
        (expected.events.playerManagerUpdateHeartbeatSfxPlayDevice | 0);
      if (playHostEv !== 0) {
        sfxPlayHostCases += 1;
      } else {
        sfxPlayPureSkipCases += 1;
      }
    } else {
      sfxPlayFallbackCases += 1;
    }
    /* ABI v68: VA 0x009bea10 pure broadcast into the slice's own scratch.
       The translated body only runs when the terminal-cleanup gate was open
       (cleanup mode < 2); the broadcast occurs during the cleanup on the
       menu lane, and a mode >= 2 path leaves the scratch untouched. Expect
       all ones when the body ran with no host fallback, nothing otherwise. */
    const cleanupModeFm = (corpus[index].timedTransitionCleanupMode ?? expected.state.timedTransitionCleanupMode | 0) | 0;
    if (
      expected.events.opaqueCall0040c7f0 === 2 &&
      cleanupModeFm < 2 &&
      (runtimeInputs.playerFlag410Ready ?? 0) !== 0
    ) {
      const flagCount = Math.min(playerFlag410Max(), Math.max(0, (runtimeInputs.playerFlag410Count ?? 0) | 0));
      if (expected.events.opaqueCall009bea10 === 0) {
        playerFlag410PureCases += 1;
        if (flagCount === 0) playerFlag410EmptyCases += 1;
        const expectedBytes = playerFlag410Broadcast(1, flagCount);
        const actualBytes = Array.from(
          new Uint8Array(wasm.memory.buffer, playerFlag410Address(), flagCount),
        );
        for (let i = 0; i < flagCount; i += 1) {
          if (actualBytes[i] !== expectedBytes[i]) {
            throw new Error(
              `VA 0x009bea10 broadcast mismatch at case ${index} slot ${i}: ` +
                `${actualBytes[i]} !== ${expectedBytes[i]}`,
            );
          }
        }
      } else {
        playerFlag410HostCases += 1;
      }
    }
    /* ABI v49: on the blob path the pure sweep also owns the surviving
       countdowns, which live in module scratch rather than sparse state.
       Compare them directly so the peel is verified beyond its aggregates. */
    const sweepCount = resumedState.listCount67730 | 0;
    if (
      (runtimeInputs.updateListBlobReady ?? 0) !== 0 &&
      sweepCount > 0 &&
      sweepCount <= UPDATE_LIST_MAX_NODES
    ) {
      listSweepBlobCases += 1;
      const normalizedSweep = normalizeRuntimeInputsForLayout(runtimeInputs);
      const { evicted, survivors, evictFlags } = updateListSweep(
        updateListTimersFromRuntime(normalizedSweep, sweepCount),
      );
      if (evicted > 0) listSweepEvictionCases += 1;
      else listSweepPureCompleteCases += 1;
      const actualSurvivors = Array.from(
        new Int32Array(wasm.memory.buffer, updateListTimersOutAddress(), sweepCount),
      );
      for (let i = 0; i < sweepCount; i += 1) {
        if (actualSurvivors[i] !== survivors[i]) {
          throw new Error(
            `Tail list sweep survivor mismatch at case ${index} slot ${i}: ` +
              `${actualSurvivors[i]} !== ${survivors[i]}`,
          );
        }
      }
      /* ABI v78: the frozen frame-opaque v31 contract also publishes
         per-slot evict flags; the slice must mirror them exactly. */
      const actualEvict = Array.from(
        new Int32Array(wasm.memory.buffer, updateListEvictFlagsAddress(), sweepCount),
      );
      for (let i = 0; i < sweepCount; i += 1) {
        if (actualEvict[i] !== evictFlags[i]) {
          throw new Error(
            `Tail list sweep evict-flag mismatch at case ${index} slot ${i}: ` +
              `${actualEvict[i]} !== ${evictFlags[i]}`,
          );
        }
      }
    }
  }
  /* ABI v83: record-0 StatHUD tail countdown lane (PE 0x84c224..0x84c2b0).
     When the lane is active the wasm ticks the 20 host-reported counters
     once per record call (1 per pass, 2 only on the postUpdateDelay > 0
     early-return path) into scratch_hud_stat_countdown; the JS oracle must
     agree exactly. */
  /* Landing G (wave-30 merge, C11-memory10): the LAST unconditional
     per-case normalizeRuntimeInputsForLayout is DELETED (was the Trim-F
     remnant, one 1935-key object build + two spread copies per case).
     The v83 countdown lane + v84 walk lane below are pure flat-key
     readers: every key they touch is in the raw per-case literal and
     every helper read is `| 0` / `?? 0`-guarded (undefined ≡ zero-fill),
     so the raw runtimeInputs object is value-identical by construction.
     Canary-safe: the hard-fail guards (blobLane>=50, latchSet>=1,
     flagSet>=1, flagClear>=1, latchMismatch==0) stay intact. */
  {
    const active = hudStatCountdownLaneActive(runtimeInputs);
    /* The wasm/PE tick the countdown once per record call: the first call
       every pass, a second only on the postUpdateDelay > 0 early-return
       path (PE 0x006fb3d0). The model's stepGameUpdateSlice DECREMENTS
       postUpdateDelay before returning, so expected.state.postUpdateDelay
       is the POST-step value — deriving sites from it would drop the
       second tick whenever the pre-step value was exactly 1 (defect
       class 1, pre-step vs post-step snapshot). Use the raw pre-step
       input from the corpus row instead. */
    const preStepDelay = (corpus[index].postUpdateDelay ?? 0) | 0;
    const sites = 1 + (preStepDelay > 0 ? 1 : 0);
    if (active) {
      expectedCountdown = hudStatCountdownTick(
        hudStatCountdownValues(runtimeInputs),
        sites,
      );
      const actual = Array.from(
        new Int32Array(
          wasm.memory.buffer,
          hudStatCountdownAddress(),
          hudStatCountdownCount(),
        ),
      );
      for (let i = 0; i < hudStatCountdownCount(); i += 1) {
        if (actual[i] !== expectedCountdown[i]) {
          throw new Error(
            `HUD stat tail countdown mismatch at case ${index} slot ${i}: ` +
              `${actual[i]} !== ${expectedCountdown[i]}`,
          );
        }
      }
      hudStatCountdownAppliedCases += 1;
      if (sites >= 2) hudStatCountdownDoubleTickCases += 1;
    } else {
      const stat = (runtimeInputs.managerStatFlag ?? 0) & 0xff;
      const ready = (runtimeInputs.hudStatCountdownReady ?? 0) >>> 0;
      const begin = (runtimeInputs.hudStatPlayerListBegin ?? 0) >>> 0;
      const end = (runtimeInputs.hudStatPlayerListEnd ?? 0) >>> 0;
      const count = ((((end - begin) | 0) >> 2) | 0);
      if (stat === 0) hudStatCountdownOffGateCases += 1;
      else if (ready === 0) hudStatCountdownOffReadyCases += 1;
      else if (count !== 0) hudStatCountdownOffWalkCases += 1;
      /* Lane off: the scratch must hold step-reset zeros (a stale lane
         must never leak into the next consumer). */
      const actual = Array.from(
        new Int32Array(
          wasm.memory.buffer,
          hudStatCountdownAddress(),
          hudStatCountdownCount(),
        ),
      );
      if (actual.some((v) => v !== 0)) {
        throw new Error(
          `HUD stat tail countdown scratch not zero with lane off at case ${index}`,
        );
      }
    }
  }
  /* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane (PE 0x84c170..0x84c2b9).
     Blob-gated: managerStatFlag&0xff != 0 && walkBlobReady == 1 && walk count
     in [1,8]. The wasm runs the full walk (owner byte, per-player slot
     get-or-insert + RecomputeStats over the 20 DISTINCT k-slots, then the
     20-timer countdown) once per record call — 1 per pass at 0x006fb3b8, a
     second only on the postUpdateDelay > 0 early-return path at 0x006fb3d0 —
     and BOTH sites execute inside step(), so the scratch read here already
     includes all sites. The JS oracle chains hudStatWalkRun once per site,
     seeding the first call from the runtime inputs, and the 83 published
     words must agree bit-for-bit. The walk-empty count==0 arm is the v83
     countdown lane (dispatched BEFORE this block, untouched); the walk lane
     is dispatched BEFORE the countdown lane at both record-0 sites. */
  {
    /* Trim F: runtimeInputs declared with the v83 block above — one
       normalize per case, shared (this block runs strictly after it). */
    const preStepDelay = (corpus[index].postUpdateDelay ?? 0) | 0;
    const sites = 1 + (preStepDelay > 0 ? 1 : 0);
    if (hudStatWalkLaneActive(runtimeInputs)) {
      let oracleScratch = hudStatWalkRun(
        walkScratchSeed(runtimeInputs),
        runtimeInputs,
        corpus[index],
      );
      if (sites >= 2) {
        oracleScratch = hudStatWalkRun(
          oracleScratch,
          runtimeInputs,
          corpus[index],
        );
      }
      const expected83 = walkScratchToWords(oracleScratch);
      const actual83 = Array.from(
        new Uint32Array(
          wasm.memory.buffer,
          hudStatWalkAddress(),
          hudStatWalkCount(),
        ),
      );
      if (expected83.length !== 83) {
        throw new Error(
          `Walk oracle published ${expected83.length} words, expected 83 (case ${index})`,
        );
      }
      for (let w = 0; w < 83; w += 1) {
        const exp = expected83[w];
        const act = actual83[w];
        if (!((exp !== exp && act !== act) || (exp >>> 0) === (act >>> 0))) {
          throw new Error(
            `HUD stat tail walk scratch mismatch at case ${index} word ${w}: ` +
              `0x${(act >>> 0).toString(16)} !== 0x${(exp >>> 0).toString(16)}`,
          );
        }
      }
      hudStatWalkLaneOnCases += 1;
      if (sites >= 2) hudStatWalkDoubleTickCases += 1;
    } else {
      const stat = (runtimeInputs.managerStatFlag ?? 0) & 0xff;
      const blobReady = (runtimeInputs.hudStatWalkBlobReady ?? 0) >>> 0;
      const begin = (runtimeInputs.hudStatPlayerListBegin ?? 0) >>> 0;
      const end = (runtimeInputs.hudStatPlayerListEnd ?? 0) >>> 0;
      const count = ((((end - begin) | 0) >> 2) | 0);
      if (stat === 0) hudStatWalkOffGateCases += 1;
      else if (blobReady === 0) hudStatWalkOffReadyCases += 1;
      else if (count === 0) hudStatWalkOffCount0Cases += 1;
      else hudStatWalkOffCountCapCases += 1;
      /* Lane off: the wasm walk scratch must hold step-reset zeros
         (stale-lane guard — a leftover walk must never leak into the next
         consumer; the countdown lane has its own scratch). */
      const actual = Array.from(
        new Uint32Array(
          wasm.memory.buffer,
          hudStatWalkAddress(),
          hudStatWalkCount(),
        ),
      );
      if (actual.some((v) => v !== 0)) {
        throw new Error(
          `HUD stat tail walk scratch not zero with lane off at case ${index}`,
        );
      }
    }
  }
  /* ABI v77: record 22 ANM2::Load lane arms — counted AFTER the
     continuation chain, when expected carries the final events/state, with
     an oracle-side sanity pin so a mis-wired lane fails HERE. */
  {
    const blob = (corpus[index].engineAnm2BlobReady ?? 0) >>> 0;
    const latch = (corpus[index].engineAnm2Latch ?? 0) >>> 0;
    const layer = (corpus[index].engineAnm2LayerCount ?? 0) >>> 0;
    const extra = (corpus[index].engineAnm2ExtraCount ?? 0) >>> 0;
    const laneOn =
      blob !== 0 && (corpus[index].engineAnm2LatchReady ?? 0) !== 0 &&
      (latch & 0xff) === 0 && layer <= 32 && extra <= 32;
    if (laneOn) {
      engineAnm2LaneOnCases += 1;
      if (expected.events.engineAnm2LaneApplied !== 1) {
        throw new Error(`lane-on case ${index} did not apply the lane in the oracle`);
      }
      if ((expected.events.engineAnm2StarLayerMask >>> 0) !== 0) {
        engineAnm2StarMaskCases += 1;
      }
    } else if (
      blob !== 0 ||
      ((corpus[index].engineAnm2LatchReady ?? 0) !== 0 && (latch & 0xff) === 0)
    ) {
      /* off arms: blob present but gated out (latch set / over-cap), or the
         no-blob fallback with an otherwise-lane-ready caller. */
      engineAnm2LaneOffCases += 1;
      if (expected.events.engineAnm2LaneApplied !== 0) {
        throw new Error(`lane-off case ${index} applied the lane in the oracle`);
      }
    }
  }
  /* ABI v95: record idx 21 ANM2::Load frame laws — direct export probe.
     Exports-only contracts (5 pure scalar laws), so the anti-neuter guard
     is wasm/js equality at every row: drive each export with wide values
     plus the PE-proven site constants and require the module to agree with
     the model oracle. The lane-on rows above already prove the wire; this
     proves the exports themselves are whitelisted, compiled, and
     behaviorally identical even when a row routes to the monolith. */
  {
    const pathPresent = exported("isaac_game_update_slice_engine_anm2_load_path_present");
    const pathIsSelf = exported("isaac_game_update_slice_engine_anm2_load_path_is_self");
    const graphicsNeeded = exported("isaac_game_update_slice_engine_anm2_load_graphics_needed");
    const frameHostCalls = exported("isaac_game_update_slice_engine_anm2_load_frame_host_calls");
    const siteHostCalls = exported("isaac_game_update_slice_engine_anm2_load_site_host_calls");
    /* Wide drives cross UNMASKED — the module must narrow, never the
       harness (0x100 path_present PRESENT; 0xffffff00 graphics NOT
       needed — PE 0x40bd59 dword / 0x40bd8e byte). */
    for (const v of [0, 1, 0x100, 0x1ff, 0xffffff00, 0xffffffff]) {
      if (pathPresent(v) !== engineAnm2LoadPathPresent(v)) {
        throw new Error(`v95 path_present mismatch at case ${index} for 0x${v.toString(16)}`);
      }
      if (graphicsNeeded(v) !== engineAnm2LoadGraphicsNeeded(v)) {
        throw new Error(`v95 graphics_needed mismatch at case ${index} for 0x${v.toString(16)}`);
      }
    }
    for (const [a, b] of [[0x1b874, 0x12345678], [0x1b874, 0x1b874],
                          [0, 1], [0xffffffff, 0xffffffff]]) {
      if (pathIsSelf(a, b) !== engineAnm2LoadPathIsSelf(a, b)) {
        throw new Error(`v95 path_is_self mismatch at case ${index} (${a},${b})`);
      }
    }
    for (const [p, a, b, g] of [[0, 0x1b874, 0x12345678, 1],
                                [0x1d, 0x1b874, 0x12345678, 1],
                                [0, 0x1b874, 0x1b874, 1],
                                [0x1d, 0x1b874, 0x1b874, 0],
                                [0, 0x1b874, 0x12345678, 0xffffff00]]) {
      if (frameHostCalls(p, a, b, g) !== engineAnm2LoadFrameHostCalls(p, a, b, g)) {
        throw new Error(
          `v95 frame_host_calls mismatch at case ${index} (${p},${a},${b},${g})`,
        );
      }
    }
    if (siteHostCalls() !== engineAnm2LoadSiteHostCalls() || siteHostCalls() !== 6) {
      throw new Error(`v95 site_host_calls mismatch at case ${index}`);
    }
  }
  /* ABI v79: record 2 (opaqueGlobal4aba0Refresh) arm counters. The blob
     gate: ready=0 -> monolith; ready=1 + begin==end -> PE skips the block
     (byte untouched, event stays); ready=1 + in-contract -> pure byte;
     over-cap/invalid -> monolith. Counters named so a regression that
     silently neuters a lane trips the pins below. */
  const r2BlobReady = (runtimeInputs.globalTree4aba0BlobReady ?? 0) !== 0;
  const r2RangeEmpty =
    (runtimeInputs.globalTree4aba0Begin ?? 0) === (runtimeInputs.globalTree4aba0End ?? 0);
  const r2Count = runtimeInputs.globalTree4aba0Count ?? 0;
  if (r2BlobReady && r2RangeEmpty) {
    globalTree4aba0EmptyRangeCases += 1;
  } else if (
    r2BlobReady &&
    r2Count >= 1 &&
    r2Count <= GLOBAL_TREE_4ABA0_MAX_NODES
  ) {
    if (expected.events.opaqueGlobal4aba0Refresh === 0) {
      globalTree4aba0PureCases += 1;
      if (expected.state.globalTree4aba0Result === 0) {
        globalTree4aba0ZeroByteGateCase += 1;
      } else {
        globalTree4aba0OneByteGateCase += 1;
      }
    } else {
      globalTree4aba0FallbackCases += 1;
    }
  } else {
    globalTree4aba0FallbackCases += 1;
  }
  /* Direct export probe: drive isaac_game_update_slice_global_tree_4aba0_pure
     with the SAME table the step consumed and require it to agree with the
     model law, so the export exists, is whitelisted, and is behaviorally
     identical even when the step gate routes a case to the monolith. */
  if (r2BlobReady && r2Count >= 1 && r2Count <= GLOBAL_TREE_4ABA0_MAX_NODES) {
    const probeNodes = new Uint32Array(6 * GLOBAL_TREE_4ABA0_MAX_NODES);
    for (let ni = 0; ni < GLOBAL_TREE_4ABA0_MAX_NODES; ni += 1) {
      probeNodes[ni * 6 + 0] = runtimeInputs[`globalTree4aba0Addr${ni}`] >>> 0;
      probeNodes[ni * 6 + 1] = runtimeInputs[`globalTree4aba0Next${ni}`] >>> 0;
      probeNodes[ni * 6 + 2] = runtimeInputs[`globalTree4aba0Prev${ni}`] >>> 0;
      probeNodes[ni * 6 + 3] = runtimeInputs[`globalTree4aba0Child${ni}`] >>> 0;
      probeNodes[ni * 6 + 4] = runtimeInputs[`globalTree4aba0F0d${ni}`] >>> 0;
      probeNodes[ni * 6 + 5] = runtimeInputs[`globalTree4aba0F18${ni}`] >>> 0;
    }
    const expectedPure = globalTree4aba0Refresh(
      runtimeInputs.globalTree4aba0Begin >>> 0,
      runtimeInputs.globalTree4aba0End >>> 0,
      r2Count,
      globalTree4aba0NodesFromRuntime(runtimeInputs, r2Count),
    );
    /* Pass a REAL pointer: a typed array coerces to NaN -> i32 0 -> the
       module reads nullptr and returns -1, which makes the probe silently
       agree with nothing (harness-neutering class). The runtime-inputs
       scratch is dead after step(), so reuse it. */
    const r2ProbeBase = runtimeInputsAddress();
    new Uint32Array(
      wasm.memory.buffer,
      r2ProbeBase,
      6 * GLOBAL_TREE_4ABA0_MAX_NODES,
    ).set(probeNodes);
    const actualPure = globalTree4aba0PureExport(
      runtimeInputs.globalTree4aba0Begin >>> 0,
      runtimeInputs.globalTree4aba0End >>> 0,
      r2Count,
      r2ProbeBase,
    );
    if (actualPure !== expectedPure) {
      throw new Error(
        `Record 2 pure export mismatch at case ${index}: ` +
          `${actualPure} !== ${expectedPure}`,
      );
    }
  }
  const actual = {
    state: readStruct(view, stateAddress(), STATE_LAYOUT),
    events: readStruct(view, eventsAddress(), EVENTS_LAYOUT),
  };
  const evDiffs = Object.keys(EVENTS_LAYOUT)
      .filter((k) => actual.events[k] !== expected.events[k])
      .map((k) => `${k}: expected ${expected.events[k]} actual ${actual.events[k]}`)
      .join("; ");
  const stDiffs = Object.keys(STATE_LAYOUT)
      .filter((k) => actual.state[k] !== expected.state[k])
      .map((k) => `${k}: expected ${expected.state[k]} actual ${actual.state[k]}`)
      .join("; ");
   if (!sameRecord(actual.state, expected.state, STATE_LAYOUT) || !sameRecord(actual.events, expected.events, EVENTS_LAYOUT)) {
    throw new Error(`Differential mismatch at case ${index}:\nEVENTS ${evDiffs}\nSTATE ${stDiffs}\n${JSON.stringify({ input: corpus[index] }, null, 2)}`);
  }
  /* ABI v107 (wave-29 merge REBIND, C1): the 36 rebound lanes must
     actually REACH the module and change a result — a whitelist that
     silently zeroes them collapses each arm into skip and the guards
     below fail the run (measured C3 defect class). */
  {
    const r956 = (runtimeInputs.frameOpaque98dba0956110Ready ?? 0) >>> 0;
    if (r956 !== 0) {
      rebind956110LaneOnCases += 1;
      if (expected.events.frameOpaque98dba0956110ProbePure !== 0) {
        rebind956110ProbeCases += 1;
      }
    }
    if ((runtimeInputs.opaque0092f1c0Ready ?? 0) !== 0 &&
        (runtimeInputs.opaque0092f1c0Limit ?? 0) !== 0) {
      rebind92f1c0LaneOnCases += 1;
    }
    /* The pure tail emits NO Case/coarse events (opaque0092f1c0CounterOut
       + status stores only) — derive the limit/field14 decision from the
       SAME drawn inputs (the differential proves model==wasm, so the law
       count == what the module ran). gate1ba78 rows run the 92f1c0 gate. */
    if ((runtimeInputs.opaque0092f1c0Ready ?? 0) !== 0 &&
        (runtimeInputs.opaque0092f1c0Limit ?? 0) !== 0 &&
        (corpus[index].gate1ba78 ?? 0) !== 0 &&
        gameUpdateSlice92f1c0TryPure({
          mode: (runtimeInputs.opaque0092f1c0Mode ?? 0) | 0,
          counter: (runtimeInputs.opaque0092f1c0Counter ?? 0) | 0,
          limit: (runtimeInputs.opaque0092f1c0Limit ?? 0) >>> 0,
          field14: (runtimeInputs.opaque0092f1c0Field14 ?? 0) >>> 0,
        }) === 1) {
      rebind92f1c0PureTailCases += 1;
    }
    if ((runtimeInputs.frameOpaque4212c0AbPackReady ?? 0) !== 0) {
      rebindAbPackLaneOnCases += 1;
      if ((expected.events.frameOpaque4212c0409030Advance | 0) !== 0 ||
          (expected.events.frameOpaque4212c0409030Rewind | 0) !== 0) {
        rebindAbPackCases += 1;
      }
    }
    if ((runtimeInputs.tcsStatsVecReady ?? 0) !== 0) {
      rebindTcsStatsLaneOnCases += 1;
      if ((expected.events.tcsStatsAppendCount | 0) !== 0 ||
          (expected.events.tcsStatsGrowthCalls | 0) !== 0) {
        rebindTcsStatsCases += 1;
      }
    }
    /* Capture-only events (no wasm words): the model EMITS the
       roomTriggerOutput* family from the record-18 body wire; count the
       corpus cases where any of them fired so the guard proves the wire
       is exercised (the events cannot enter the EVENTS_LAYOUT
       differential — the module has no words for them). */
    for (const name of CAPTURE_ONLY_EVENTS) {
      if ((expected.events[name] ?? 0) !== 0) {
        captureOnlyTriggerEmission += 1;
        break;
      }
    }
  }
  if (((runtimeInputs.playerHudOccupiedMask ?? 0) & 0xff) !== 0 && (runtimeInputs.playerHudBlobReady ?? 0) !== 0 && (runtimeInputs.managerHistoryCount ?? 0) > 0) {
    blobLaneCases += 1;
    if (((corpus[index].hudHistoryLatch5c7c ?? 0) & 0xff) !== 0) latchSetLaneCases += 1;
    /* ABI v81: flag-lane arms — (0,0) must exercise the pure no-op,
       (1,0)/(0,1)/(1,1) the loop residual. */
    const f0 = (corpus[index].hudHistorySlotFlag0 ?? 0) & 0xff;
    const f1 = (corpus[index].hudHistorySlotFlag1 ?? 0) & 0xff;
    if (f0 !== 0 || f1 !== 0) flagSetLaneCases += 1;
    else flagClearLaneCases += 1;
    if (actual.events.hudHistoryResidual !== expected.events.hudHistoryResidual ||
        actual.events.hudHistoryLoopResidual !== expected.events.hudHistoryLoopResidual) {
      latchMismatchCases += 1;
    }
  }
  /* ABI v90: 4212c0 flag_111 pair-gate lane. The pure shell runs only on
     the FRAME_AUX walk site; the main corpus chain drives the GATE site
     for 4212c0's 98dba0 sibling, so the pair gate is verified behaviorally
     by the slice tests (wide 0x100 shapes, ready arms, both gates) rather
     than by this harness — an earlier counter here attributed GATE-site
     rows and threw 1407 false mismatches. Keep the whitelist keys and the
     ABI-size pins as the anti-neuter guard. */
}

/* ---- Sparse Game-object adapter round-trip (Room capture contract) --------
 *
 * capture → capture-contract assert → overlayHostOwnedState → step + the
 * continuation chain → apply, per row. Before ABI v67 this block asserted
 * that `capture()` recovers Room-side fields from the Game buffer — which is
 * impossible (they live at *(Game+0x18300) / *(Room+0x4), not in the buffer)
 * — and it passed ONLY because the single row it drove (corpus[7]) carried
 * all-zero Room state, so the `?? 0` expectations coincided with the
 * reset-zeroed scratch. That is the masked-differential shape: any nonzero
 * `roomDescFlags44` row fails the old expectation. The rows below keep that
 * lane permanently unmasked:
 *
 *   1. corpus[7]           — the legacy all-zero-Room fixed row;
 *   2. adapterRoomKeptRow  — NONZERO Room state, roomDescFlags44 = 9: the
 *      regression guard. Capture must pin host-owned fields to 0, the
 *      overlay must present the caller's 9, and the trigger gates
 *      (game_update_slice.cpp `& 1u` / `& 9u`) must NOT fire.
 *   3. adapterRoomClearRow — identical row, roomDescFlags44 = 0: the same
 *      lane must run the trigger-clear chain (TriggerOutput + entry
 *      Flags|=1 / ClearCount++ + stats/audio/awards residuals).
 *
 * The scratch state struct is POISONED (0xa5 fill) before every capture, so
 * a pass also proves the v67 capture contract itself: the state struct after
 * capture is a pure function of the buffer — Game-object-homed members from
 * the bytes, host-owned members pinned to 0 — never instance leftovers.
 */
const adapterRuntime = {
  globalRangeByteLength: 0,
  monotonicCounterLow: 0,
  monotonicCounterHigh: 0,
  monotonicBaselineLow: 0,
  monotonicBaselineHigh: 0,
  globalMenuGuard4b3ca: 1,
  globalMenuEnable2a3a5: 0,
  globalClearSkip997a: 0,
  challenge0x123: 0,
  frameOpaque4212c0SlotChar: 0,
};
const adapterRoomBase = {
  /* Off-flag Room fields cross pure peels so the round-trip is nontrivial:
     B14 fx lerp (+1 / +0.25), B6 water-lerp dec, B10 boss snapshot (2+3),
     B17 dec, B2 collectible dec, B16 lava decay (*0.92f). */
  roomType8: 1,
  roomFxLimit70dc: 2,
  roomFxValue70cc: 0.5,
  roomFxStep70d4: 0.25,
  roomWaterLerpCountdown7298: 3,
  roomBossCount12c8: 2,
  roomBossCount12cc: 3,
  roomTimer722c: 7,
  roomCollectibleTimer7764: 5,
  roomDescClearCount4a: 3,
  roomWaterAmount7240: 0.25,
  roomLavaIntensity7740: 0.5,
};
const adapterRoomKeptRow = completeState({ ...adapterRoomBase, roomDescFlags44: 9 });
const adapterRoomClearRow = completeState({ ...adapterRoomBase, roomDescFlags44: 0 });

/** Continuation drive for the adapter rows, mirroring runNativeGameUpdateTick. */
function driveAdapterChain(view, expected, runtimeInputs) {
  const writeResumeState = (state) => writeStruct(view, stateAddress(), STATE_LAYOUT, state);
  for (let hops = 0; hops < 24; hops += 1) {
    const kind = expected.events.continuationKind;
    if (kind === UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION) {
      if (continueTimedTransition() !== 1) throw new Error("adapter: timed-transition rejected");
      expected = continueGameUpdateTimedTransition(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION) {
      if (continueMenuGates() !== 1) throw new Error("adapter: menu-gate continuation rejected");
      expected = continueGameUpdateMenuGates(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
      writeResumeState(expected.state);
      if (resume98dba0PlayerWalk() !== 1) throw new Error("adapter: 98dba0 resume rejected");
    expected = resumeGameUpdate98dba0PlayerWalk(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES) {
      writeResumeState(expected.state);
      if (resumeFrameAuxUpdates() !== 1) throw new Error("adapter: frame-aux resume rejected");
    expected = resumeGameUpdateFrameAuxUpdates(expected.state, constants, expected.events, runtimeInputs);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) {
      writeResumeState(expected.state);
      if (resumeRoomUpdatePrefixB1() !== 1) throw new Error("adapter: B1 resume rejected");
    expected = resumeGameUpdateRoomUpdatePrefixB1(expected.state, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2) {
      writeResumeState(expected.state);
      if (resumeRoomUpdatePrefixB2() !== 1) throw new Error("adapter: B2 resume rejected");
    expected = resumeGameUpdateRoomUpdatePrefixB2(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX) {
      writeResumeState(expected.state);
      if (resumeRoomUpdatePrefix() !== 1) throw new Error("adapter: prefix resume rejected");
    expected = resumeGameUpdateRoomUpdatePrefix(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR) {
      writeResumeState(expected.state);
      if (resumeRoomUpdateClear() !== 1) throw new Error("adapter: clear resume rejected");
    expected = resumeGameUpdateRoomUpdateClear(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD) {
      writeResumeState(expected.state);
      if (resumeRoomUpdateHead() !== 1) throw new Error("adapter: head resume rejected");
    expected = resumeGameUpdateRoomUpdateHead(expected.state, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
      writeResumeState(expected.state);
      if (resumeFrameManagerUpdates() !== 1) throw new Error("adapter: frame-manager resume rejected");
    expected = resumeGameUpdateFrameManagerUpdates(expected.state, constants, runtimeInputs, expected.events);
    } else if (kind === UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A) {
      /* Modeled-list declaration: this direct-wasm lane has no buffer-derived
         recapture; the row declares Pass A's effect (none here — id 0 rows
         never reach this branch; kept for dispatch completeness). */
      const postPassA = normalizeRuntimeInputsForLayout({
        ...runtimeInputs,
        frameOpaque4257b0PostPassAListCount:
          runtimeInputs.frameOpaque4257b0PostPassAListCount ?? runtimeInputs.frameOpaque4257b0ListCount ?? 0,
      });
      writeStruct(view, runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, postPassA);
      writeResumeState(expected.state);
      if (resume4257b0PassA() !== 1) throw new Error("adapter: pass-A resume rejected");
    expected = resumeGameUpdate4257b0PassA(expected.state, postPassA, expected.events);
    } else {
      return expected; /* terminal RETURN_* kind */
    }
  }
  throw new Error("adapter: continuation chain did not terminate in 24 hops");
}

function runAdapterRoundTrip(adapterInput, label) {
  reset();
  const view = new DataView(wasm.memory.buffer);
  /* The real bridge writes the WHOLE runtime struct every tick — absence is
     not expressible, so the model side must see the same fully-shaped object
     (every key explicit, zeros for the unscoped lanes) or its unshaped-
     runtime fallback emits the monolithic residual while the module gates
     on the zeros (measured adapter divergence on the v88 HUD try_pure
     gate: model emitted hudPostUpdateCalls/B1/pmDeath=1, module 0). */
  const shapedRuntime = normalizeRuntimeInputsForLayout(adapterRuntime);
  /* Poison the state struct AFTER reset: capture alone must fully determine it. */
  new Uint8Array(wasm.memory.buffer, stateAddress(), ABI_SIZES.state).fill(0xa5);
  const bytes = new Uint8Array(wasm.memory.buffer, gameObjectAddress(), gameObjectSize());
  bytes.fill(0x5a);
  writeStruct(view, constantsAddress(), CONSTANTS_LAYOUT, constants);
  writeStruct(view, runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, shapedRuntime);
  writeStruct(view, gameObjectAddress(), BINARY_LAYOUT, adapterInput);
  if (capture() !== 1) throw new Error(`Sparse Game object capture failed (${label})`);
  const captured = readStruct(view, stateAddress(), STATE_LAYOUT);

  /* Capture contract: Game-object-homed fields come from the buffer BYTES
     (read back independently below, not from the row object), host-owned
     fields are pinned to 0. No third source exists — the 0xa5 poison above
     is unrecoverable if capture skips any member. */
  const bufferTruth = readStruct(view, gameObjectAddress(), BINARY_LAYOUT);
  const expectedCapture = Object.fromEntries(
    Object.keys(STATE_LAYOUT).map((name) => {
      if (HOST_OWNED_STATE_FIELDS.includes(name)) return [name, 0];
      const binaryName = name in BINARY_LAYOUT ? name : STATE_TO_BINARY_ALIASES[name];
      return [name, bufferTruth[binaryName]];
    }),
  );
  if (!sameRecord(captured, expectedCapture)) {
    throw new Error(
      `Capture contract violated (${label}):\n${JSON.stringify({ captured, expectedCapture }, null, 2)}`,
    );
  }

  /* Host overlay: the caller's Room values enter here — the lane the old
     harness could never see. Both sides run from the SAME overlaid state. */
  const overlaid = overlayHostOwnedState(captured, adapterInput);
  writeStruct(view, stateAddress(), STATE_LAYOUT, overlaid);
  /* ABI v82: runtime-only binary fields (hudHistorySlotFlag0/1) are NOT in
     the state capture, so the apply never writes them — the game buffer
     keeps the host-supplied bytes. Mirror the real bridge: seed those
     bytes from the adapter runtime inputs before the run so the post-apply
     read back is meaningful. */
  for (const name of Object.keys(BINARY_LAYOUT)) {
    if (name in STATE_LAYOUT || name === "rankDisplayByte3b0") continue;
    view.setUint8(gameObjectAddress() + BINARY_LAYOUT[name].offset, (adapterRuntime[name] ?? 0) & 0xff);
  }
  let expected = stepGameUpdateSlice(overlaid, constants, shapedRuntime);
  step();
  expected = driveAdapterChain(view, expected, shapedRuntime);

  const actual = {
    state: readStruct(view, stateAddress(), STATE_LAYOUT),
    events: readStruct(view, eventsAddress(), EVENTS_LAYOUT),
  };
  if (!sameRecord(actual.state, expected.state, STATE_LAYOUT) || !sameRecord(actual.events, expected.events, EVENTS_LAYOUT)) {
    throw new Error(
      `Adapter differential mismatch (${label}):\n${JSON.stringify({ input: adapterInput, expected, actual }, null, 2)}`,
    );
  }

  if (apply() !== 1) throw new Error(`Sparse Game object apply failed (${label})`);
  const applied = readStruct(view, gameObjectAddress(), BINARY_LAYOUT);
  const expectedGameObject = Object.fromEntries(
    Object.keys(BINARY_LAYOUT).map((name) => [
      name,
      /* ABI v56: the Game byte at +0x1da00 is the fold's clear-3b0 flag. */
      name === "rankDisplayByte3b0"
        ? expected.state.rankDisplayClear3b0Out & 0xff
        : name in STATE_LAYOUT
          ? expected.state[name]
          : /* ABI v82: runtime-only binary fields stay at the host-supplied
               bytes (the slice never applies them). */
            (adapterRuntime[name] ?? 0) & 0xff,
    ]),
  );
  if (!sameRecord(applied, expectedGameObject, BINARY_LAYOUT)) {
    throw new Error(
      `Sparse Game object apply did not reproduce the translated state (${label}):\n${JSON.stringify(
        { applied, expectedGameObject },
        null,
        2,
      )}`,
    );
  }
  return actual;
}

runAdapterRoundTrip(corpus[7], "legacy zero-Room row (corpus[7])");
{
  /* Regression guard: nonzero roomDescFlags44 THROUGH the adapter round-trip.
     Two-sided event pins on the WASM actuals — flags44=9 closes both PE gates
     ((flags&1)!=0 at ~cpp:2697, (flags&9)!=0 at ~cpp:2735); flags44=0 opens
     them and the pure TriggerClear entry must OR bit0 and bump ClearCount. */
  const kept = runAdapterRoundTrip(adapterRoomKeptRow, "nonzero Room row, flags44=9");
  if (kept.events.roomTriggerOutput !== 0 || kept.events.roomTriggerClearStats !== 0) {
    throw new Error(
      `flags44=9 must close the trigger gates: output=${kept.events.roomTriggerOutput} stats=${kept.events.roomTriggerClearStats}`,
    );
  }
  if (kept.state.roomDescFlags44 !== 9 || kept.state.roomDescClearCount4a !== 3) {
    throw new Error(
      `flags44=9 row must round-trip untouched: flags=${kept.state.roomDescFlags44} clearCount=${kept.state.roomDescClearCount4a}`,
    );
  }
  const clear = runAdapterRoundTrip(adapterRoomClearRow, "nonzero Room row, flags44=0");
  if (clear.events.roomTriggerOutput !== 1 || clear.events.roomTriggerClearStats !== 1 ||
      clear.events.roomTriggerClearAwardsTail !== 1) {
    throw new Error(
      `flags44=0 must run the trigger-clear chain: output=${clear.events.roomTriggerOutput} ` +
        `stats=${clear.events.roomTriggerClearStats} awardsTail=${clear.events.roomTriggerClearAwardsTail}`,
    );
  }
  if (clear.state.roomDescFlags44 !== 1 || clear.state.roomDescClearCount4a !== 4) {
    throw new Error(
      `TriggerClear entry must OR bit0 and bump ClearCount: flags=${clear.state.roomDescFlags44} ` +
        `clearCount=${clear.state.roomDescClearCount4a}`,
    );
  }
}

const report = {
  schemaVersion: 1,
  abiVersion: abiVersion(),
  cases: corpus.length,
  /* ABI v67: legacy zero-Room row + the two nonzero-Room regression rows
     (flags44=9 gates closed / flags44=0 chain fires), each with a poisoned
     scratch capture-contract assert. */
  adapterCases: 3,
  resumeCases,
  gate1b83cResumeCases,
  resume98dba0Cases,
  genericPromptResumeCases,
  itemOverlayResumeCases,
  itemOverlayPureStayCases,
  itemOverlayPureFlipCases,
  itemOverlayHostCases,
  state24eccPureSkipCases,
  state24eccHostCases,
  timedTransitionCases,
  hostFun746560NotifyProbes,
  hostFun746560SuffixProbes,
  hostFun746560WalkPostCases,
  hostFun746560WalkLegacyCases,
  hostFun746560CleanupPostCases,
  hostFun746560SuffixCases,
  timer98dba0GateProbes,
  timer98dba0SkipCases,
  timer98dba0LiveCases,
  timer98dba0NegativeSkipCases,
  timer98dba0LegacyCases,
  timerInteriorProbes,
  timer98dba0PureAppliedCases,
  timer98dba0PureCrtCases,
  timer98dba0PureWideByteCases,
  timer98dba0PureSkipArmCases,
  timer98dba0LiveHostCases,
  /* ABI v76: timer-interior MT19937 wire arms. */
  timer98dba0MtInModuleCases,
  timer98dba0MtCrtFallbackCases,
  timer98dba0MtNoStateFallbackCases,
  engineAnm2LaneOnCases,
  engineAnm2LaneOffCases,
  engineAnm2StarMaskCases,
  menuGateCases,
  menuOpenResumeCases,
  menuUpdateResumeCases,
  frameAuxResumeCases,
  /* ABI v95 (record idx 10 R4 equal-flags capture) lane arms. */
  add0EqualFlagsTrueCases,
  add0EqualFlagsPureCases,
  add0EqualFlagsOverCapCases,
  add0EqualFlagsLogCases,
  stageTransitionResumeCases,
  roomTransitionResumeCases,
  roomUpdatePrefixB1ResumeCases,
  roomUpdatePrefixB2ResumeCases,
  roomUpdatePrefixResumeCases,
  /* ABI v95 (record idx 16): B8 grid-capture blob differential arms. */
  b8BlobSeededCases,
  b8BlobPureCases,
  b8BlobWideReadyCases,
  /* ABI v95 (record idx 14): B2 item-pool/spawn differential arms. */
  b2SeededCases,
  b2PureCases,
  waterB16WireCases,
  waterB16NoWireCases,
  waterB16Gate0Cases,
  waterB16Gate1Cases,
  engineBody173LaneOnCases,
  engineBody173LaneCoarseCases,
  engineBody173OverCapCases,
  engineBody173NoBlobCases,
  b8B8OverCapCases,
  b8B8NoBlobCases,
  b8B8GateMissCases,
  roomClearNestedResumeCases,
  roomUpdateClearResumeCases,
  roomUpdateHeadResumeCases,
  frameManagerHandoffs,
  listSweepBlobCases,
  listSweepEvictionCases,
  listSweepPureCompleteCases,
  /* ABI v83: record-0 StatHUD tail countdown lane arms. */
  hudStatCountdownAppliedCases,
  hudStatCountdownOffGateCases,
  hudStatCountdownOffReadyCases,
  hudStatCountdownOffWalkCases,
  hudStatCountdownDoubleTickCases,
  /* ABI v84: record-0 StatHUD tail walk-arm lane arms. */
  hudStatWalkLaneOnCases,
  hudStatWalkDoubleTickCases,
  hudStatWalkOffGateCases,
  hudStatWalkOffReadyCases,
  hudStatWalkOffCount0Cases,
  hudStatWalkOffCountCapCases,
  luaFrameUnrefSkipCases,
  luaFrameUnrefActiveCases,
  luaFrameUnrefFallbackCases,
  sfxStopPureSkipCases,
  sfxStopHostCases,
  sfxStopFallbackCases,
  sfxUpdatePureSkipCases,
  sfxUpdateHostCases,
  sfxUpdateFallbackCases,
  sfxPlayPureSkipCases,
  sfxPlayHostCases,
  sfxPlayFallbackCases,
  opaque9a2b30OnceCases,
  opaque9a2b30TwiceCases,
  tailWriteBytePins,
  tailWriteModePins,
  fxLerpGateOpenCases,
  fxLerpGateClosedCases,
  playerFlag410PureCases,
  playerFlag410EmptyCases,
  playerFlag410HostCases,
  opaque0092e300GateOpenCases,
  opaque0092e300GateClosedCases,
  opaque0092e300V85DropCases,
  opaque0092f1c0HostCases,
  opaque0092f1c0DropCases,
  opaque0092f1c0Ready0Cases,
  opaque008318a0HostCases,
  /* ABI v142 (record idx4): rt_band_pop carrier arm coverage. */
  rtBandPopFiredCases,
  rtBandPopDepthMutatedCases,
  rtBandPopLatchClearedCases,
  rtBandPopParamSel6Cases,
  rtBandPopParamSel1Cases,
  opaque008318a0DropCases,
  opaque008318a0Ready0Cases,
  opaque857450GateOpenCases,
  opaque857450GateClosedCases,
  rankDisplayFoldCases,
  menuAuxBlobCases,
  menuAuxFallbackCases,
  menuAuxPayloadCases,
  menuAuxBorrowCases,
  menuAuxSentinelFallbackCases,
  menuAuxSentinelPureCases,
  genrandPureCases,
  genrandHostCases,
  genrandCrtCases,
  genrandReloadCases,
  ambient824a70CreateTypedCases,
  pass4257b0ResumeCases,
  pass4257b0EmptyPostCases,
  pass4257b0LivePostCases,
  /* ABI v71 FUN_004257b0 blob arms. */
  fo4257b0BlobCases,
  fo4257b0FallbackCases,
  fo4257b0PassAPureCases,
  fo4257b0NoRecaptureCases,
  fo4257b0InsertCases,
  fo4257b0GrowCases,
  fo4257b0MovedBaseCases,
  fo4257b0MismatchCases,
  fo4257b0NegativeDeltaCases,
  fo4257b0EmptyCtrCases,
  fo4257b0NonEmptyCtrCases,
  fo4257b0StoreCases,
  /* ABI v69: PM0/PM1 death-wire arms. */
  deathGateClosedCases,
  deathCount0DropCases,
  deathMonolithicCases,
  deathPureDropCases,
  deathWalkCases,
  deathWideByteCases,
  /* ABI v79: record 2 blob arms. */
  globalTree4aba0PureCases,
  globalTree4aba0EmptyRangeCases,
  globalTree4aba0FallbackCases,
  globalTree4aba0ZeroByteGateCase,
  globalTree4aba0OneByteGateCase,
  seed: "0x6d2b79f5",
  result: "pass",
};

if (listSweepBlobCases === 0 || listSweepEvictionCases === 0 || listSweepPureCompleteCases === 0) {
  throw new Error("Tail list sweep corpus lacks blob/eviction/pure-complete coverage: blob=" + listSweepBlobCases + " evict=" + listSweepEvictionCases + " pure=" + listSweepPureCompleteCases);
}
if (hudStatCountdownAppliedCases === 0) {
  throw new Error("ABI v83 countdown corpus never took the pure lane");
}
if (hudStatCountdownOffGateCases === 0 || hudStatCountdownOffReadyCases === 0 || hudStatCountdownOffWalkCases === 0) {
  throw new Error("ABI v83 countdown off-lane arms lack coverage");
}
if (hudStatWalkLaneOnCases === 0) {
  throw new Error("ABI v84 walk-arm corpus never took the pure lane");
}
if (hudStatWalkOffGateCases === 0 || hudStatWalkOffReadyCases === 0 ||
    hudStatWalkOffCount0Cases === 0 || hudStatWalkOffCountCapCases === 0) {
  throw new Error("ABI v84 walk-arm off-lane arms lack coverage");
}
/* ABI v95 (record idx 10 R4 equal-flags capture): the non-empty walk
   lanes must ALL be reached — TRUE (interior host), FALSE (pure clear),
   over-cap fallback (v91 path), and the log arm with flags present. */
if (add0EqualFlagsTrueCases === 0 || add0EqualFlagsPureCases === 0) {
  throw new Error(
    "ABI v95 equal-flags corpus never split TRUE/FALSE: " +
      `true=${add0EqualFlagsTrueCases} pure=${add0EqualFlagsPureCases}`,
  );
}
if (add0EqualFlagsOverCapCases === 0) {
  throw new Error("ABI v95 equal-flags over-cap fallback lacks coverage");
}
if (add0EqualFlagsLogCases === 0) {
  throw new Error("ABI v95 equal-flags log-arm keeper lacks coverage");
}
/* ABI v95 (record idx 16): B8 grid-capture blob differential must actually
   run. Without these gates a corpus that never supplies the k-blob (or a
   whitelist that drops the arrays) leaves the pure grid step unexercised
   while the suite stays green — measured defect class 6 (v80 lesson). */
if (b8BlobSeededCases === 0 || b8BlobPureCases === 0) {
  throw new Error(
    "ABI v95 B8 grid-capture corpus never took the blob path: " +
      `seeded=${b8BlobSeededCases} pure=${b8BlobPureCases} ` +
      `overCap=${b8B8OverCapCases} noBlob=${b8B8NoBlobCases} ` +
      `gateMiss=${b8B8GateMissCases} wideReady=${b8BlobWideReadyCases}`,
  );
}
if (b8B8OverCapCases === 0 || b8B8NoBlobCases === 0 || b8B8GateMissCases === 0) {
  throw new Error(
    "ABI v95 B8 grid-capture corpus lacks over-cap / no-blob / gate-miss arms: " +
      `overCap=${b8B8OverCapCases} noBlob=${b8B8NoBlobCases} ` +
      `gateMiss=${b8B8GateMissCases}`,
  );
}
if (b8BlobWideReadyCases === 0) {
  throw new Error(
    "ABI v95 B8 grid-capture corpus never drove a WIDE ready value " +
      "(the full-dword blob gate must take the pure path for 0x100)",
  );
}
/* ABI v110 (wave-31 record-16 eval, update-v109-record16-eval): the 10
   deterministic B8 theorem arms must ALL be reached — the removal eval's
   full-capture invariant (capture present + gate open -> coarse @148
   NEVER fires; gate-open capture-absence -> EXACTLY 1; gate miss -> 0)
   holds only when every arm is exercised; a silent-zero arm (C3 class)
   would let the theorem pass on a subset. Draw-budget-free by design so
   the eval holds at VERIFY_DRAWS=500 (record-39 §4's rare-arm blocker:
   the old frame-99 over-cap row saw 100 at the B8 block, gate CLOSED). */
{
  const DT_B8_ARMS = [
    "pure", "mini", "cap448", "wideready", "mono", "overcap",
    "overcap-wide", "gatemiss", "zerocells", "negcells",
  ];
  const missing = DT_B8_ARMS.filter((a) => (dtB8ArmCases[a] ?? 0) < 1);
  if (missing.length > 0) {
    throw new Error(
      "ABI v110 B8 deterministic theorem arms not reached: " +
        `${missing.join(",")} (reached ${JSON.stringify(dtB8ArmCases)})`,
    );
  }
}
/* ABI v95 (record idx 14): the B2 item-pool/spawn differential must run
   on the corpus (ready seeded + out-scratch/oracle matched at least once);
   without it the module branch of opaqueRoomUpdatePrefixB2 is unexercised
   by the verifier (same defect class as the B8 gate above). */
if (b2SeededCases === 0 || b2PureCases === 0) {
  throw new Error(
    "ABI v95 B2 item-pool corpus never took the ready path: " +
      `seeded=${b2SeededCases} pure=${b2PureCases} ` +
      "(the wave-end merge upserts the corpus rows)",
  );
}
/* ABI v95 (record idx 36): the water-b16 823540 wire must have run at least
   once on each spray arm (gate 0 cur-snap + gate 1 goal deltas) and been
   skipped at least once (no blob / 823540 gate closed). Without these the
   pure chain could sit silently dead while the suite stays green. */
if (waterB16WireCases === 0 || waterB16Gate0Cases === 0 || waterB16Gate1Cases === 0) {
  throw new Error(
    "ABI v95 water-b16 823540 wire never exercised: " +
      `wire=${waterB16WireCases} gate0=${waterB16Gate0Cases} ` +
      `gate1=${waterB16Gate1Cases} nowire=${waterB16NoWireCases}`,
  );
}
/* ABI v95 (record idx 22): the engine-player BODY blob lanes must actually
   reach the differential. Without these gates a corpus that never delivers
   the eligible/173 lanes (or a whitelist that drops them) leaves the
   pre-call decision wire unexercised while the suite stays green —
   measured defect class 6 (v80 lesson). */
if (engineBody173LaneOnCases < 2 || engineBody173LaneCoarseCases < 1 ||
    engineBody173OverCapCases < 1 || engineBody173NoBlobCases < 1) {
  throw new Error(
    "ABI v95 engine-player body blob never exercised: " +
      `on=${engineBody173LaneOnCases} coarse=${engineBody173LaneCoarseCases} ` +
      `overcap=${engineBody173OverCapCases} noblob=${engineBody173NoBlobCases}`,
  );
}
if (globalTree4aba0PureCases === 0 || globalTree4aba0FallbackCases === 0 || globalTree4aba0EmptyRangeCases === 0) {
  throw new Error("Record 2 corpus lacks pure, fallback and empty-range coverage");
}

if (listSweepBlobCases === 0 || listSweepEvictionCases === 0 || listSweepPureCompleteCases === 0) {
  throw new Error("Tail list sweep corpus lacks blob/eviction/pure-complete coverage: blob=" + listSweepBlobCases + " evict=" + listSweepEvictionCases + " pure=" + listSweepPureCompleteCases);
}
if (playerFlag410PureCases === 0 || playerFlag410HostCases === 0) {
  throw new Error("VA 0x009bea10 corpus lacks pure or host coverage");
}
if (opaque0092e300GateOpenCases === 0 || opaque0092e300GateClosedCases === 0) {
  throw new Error("VA 0x0092e300 corpus lacks both open and closed gate coverage");
}
if (opaque0092e300V85DropCases === 0) {
  throw new Error("VA 0x0092e300 corpus never dropped an all-null enabled group (v85 channel dead)");
}
if (opaque0092f1c0HostCases === 0 || opaque0092f1c0DropCases === 0 ||
    opaque0092f1c0Ready0Cases === 0) {
  throw new Error(
    "VA 0x0092f1c0 corpus never exercised host/drop/ready=0 " +
      `(host=${opaque0092f1c0HostCases} drop=${opaque0092f1c0DropCases} ` +
      `ready0=${opaque0092f1c0Ready0Cases})`,
  );
}
if (opaque008318a0HostCases === 0 || opaque008318a0DropCases === 0 ||
    opaque008318a0Ready0Cases === 0) {
  throw new Error(
    "VA 0x008318a0 corpus never exercised host/drop/ready=0 " +
      `(host=${opaque008318a0HostCases} drop=${opaque008318a0DropCases} ` +
      `ready0=${opaque008318a0Ready0Cases})`,
  );
}
/* ABI v142 (record idx4): the rt_band_pop carrier must FIRE (both param
   selections, a real depth mutation and an underflow latch clear must all
   be reached) — a whitelist/lane regression that silently zeroes the
   composite carrier fails here (defect-class-6 guard). */
if (rtBandPopFiredCases === 0 || rtBandPopDepthMutatedCases === 0 ||
    rtBandPopLatchClearedCases === 0 || rtBandPopParamSel6Cases === 0 ||
    rtBandPopParamSel1Cases === 0) {
  throw new Error(
    "VA 0x008318a0 rt_band_pop carrier never exercised fired/depth-mutated/" +
      "latch-cleared/param-sel arms " +
      `(fired=${rtBandPopFiredCases} depthMut=${rtBandPopDepthMutatedCases} ` +
      `latchClear=${rtBandPopLatchClearedCases} sel6=${rtBandPopParamSel6Cases} ` +
      `sel1=${rtBandPopParamSel1Cases})`,
  );
}
if (opaque857450GateOpenCases === 0 || opaque857450GateClosedCases === 0) {
  throw new Error("VA 0x00857450 corpus lacks both open and closed gate coverage");
}
if (menuAuxBlobCases === 0 || menuAuxFallbackCases === 0 || menuAuxPayloadCases === 0) {
  throw new Error("Menu-aux corpus lacks blob/fallback/payload: blob=" + menuAuxBlobCases + " fallback=" + menuAuxFallbackCases + " payload=" + menuAuxPayloadCases + " sentinelFb=" + menuAuxSentinelFallbackCases + " sentinelPure=" + menuAuxSentinelPureCases);
}
if (menuAuxSentinelFallbackCases === 0 || menuAuxSentinelPureCases === 0) {
  throw new Error("Menu-aux sentinel corpus lacks both fallback and pure coverage");
}
if (luaFrameUnrefSkipCases === 0 || luaFrameUnrefActiveCases === 0 || luaFrameUnrefFallbackCases === 0) {
  throw new Error("LuaEngine 0x008607a0 corpus lacks skip/active/fallback coverage");
}
if (itemOverlayPureStayCases === 0 || itemOverlayPureFlipCases === 0 || itemOverlayHostCases === 0) {
  throw new Error("ItemOverlay::Update state-1 corpus lacks stay/flip/host coverage");
}
if (state24eccPureSkipCases === 0 || state24eccHostCases === 0) {
  throw new Error("0x008ef990 corpus lacks both pure-skip and host coverage");
}
if (state24eccState2Cases === 0 || state24eccState2ChangedCases === 0) {
  throw new Error(
    "0x008ef990 corpus never exercises the v89 state==2 pure arm with a " +
      "meaningful decrement (state2=" +
      state24eccState2Cases +
      " changed=" +
      state24eccState2ChangedCases +
      ")",
  );
}
if (sfxStopPureSkipCases === 0 || sfxStopHostCases === 0 || sfxStopFallbackCases === 0) {
  console.log("SFXINFO", JSON.stringify({skip: sfxStopPureSkipCases, host: sfxStopHostCases, fb: sfxStopFallbackCases, fold: sfxStopFoldCases, fold_fb: sfxStopFoldFallbackCases, upd_skip: sfxUpdatePureSkipCases, upd_host: sfxUpdateHostCases, upd_fb: sfxUpdateFallbackCases, play_skip: sfxPlayPureSkipCases, play_host: sfxPlayHostCases, play_fb: sfxPlayFallbackCases, lua_a: luaFrameUnrefActiveCases, lua_s: luaFrameUnrefSkipCases, lua_fb: luaFrameUnrefFallbackCases, fm: frameManagerHandoffs, resumes: resumeCases}));
}
/* ABI v95: record idx 47 STOP fold coverage — without at least one
   fold-applied case the in-module channel walk is unexercised while the
   suite stays green (measured defect class 6). */
if (sfxStopFoldCases === 0) {
  throw new Error("record idx 47 STOP fold corpus lacks fold-applied coverage");
}
if (sfxUpdatePureSkipCases === 0 || sfxUpdateHostCases === 0 || sfxUpdateFallbackCases === 0) {
  throw new Error("SFX update gate corpus lacks pure-skip/host/fallback coverage");
}
if (sfxPlayPureSkipCases === 0 || sfxPlayHostCases === 0 || sfxPlayFallbackCases === 0) {
  throw new Error("SFX play gate corpus lacks pure-skip/host/fallback coverage: " +
    `skip=${sfxPlayPureSkipCases} host=${sfxPlayHostCases} fb=${sfxPlayFallbackCases} ` +
    `stop-fold=${sfxStopFoldCases} foldFb=${sfxStopFoldFallbackCases} ` +
    `update skip/host/fb=${sfxUpdatePureSkipCases}/${sfxUpdateHostCases}/${sfxUpdateFallbackCases} ` +
    `stop skip/host/fb=${sfxStopPureSkipCases}/${sfxStopHostCases}/${sfxStopFallbackCases}`);
}
if (opaque9a2b30OnceCases === 0 || opaque9a2b30TwiceCases === 0) {
  throw new Error("VA 0x009a2b30 corpus lacks once/twice coverage");
}
if (tailWriteBytePins < 3 || tailWriteModePins === 0) {
  throw new Error("Tail-write lane corpus lacks pinned byte-clear/mode-zero coverage");
}
if (fxLerpGateOpenCases === 0 || fxLerpGateClosedCases === 0) {
  throw new Error("FX-lerp gate corpus lacks both open and closed gate coverage");
}
if (menuAuxBorrowCases === 0) {
  throw new Error("Menu-aux borrow (64-bit accounting) corpus lacks borrow coverage");
}
if (genrandPureCases === 0 || genrandHostCases === 0 || genrandCrtCases === 0 || genrandReloadCases < 4) {
  throw new Error("Isaac::genrand_int32 corpus lacks pure/host/CRT/reload coverage");
}
/* ABI v95 (record idx 34): the per-loop typed CREATE-arm scratch oracle must
   actually run on the corpus (at least one mt-pure blob H5 case). */
if (ambient824a70CreateTypedCases === 0) {
  throw new Error("ambient 824a70 typed create-args corpus lacks coverage");
}
/* ABI v76: every timer-interior MT arm must be presented. Without these
   gates a corpus that never captures mt[] would leave the in-module draw
   unexercised while the suite stayed green. The advance itself (the state a
   LATER boundary sees) is pinned per-case by the word-for-word scratch
   equality against the ORACLE-ADVANCED array and by the mti runtime input
   being updated in place; both the verifier and the live frame path end the
   driven prefix at CONTINUE_AT_COMMON_TAIL after the gate-1b83c site, so a
   second timer boundary within one case is not drivable here. */
if (timer98dba0MtInModuleCases === 0 || timer98dba0MtCrtFallbackCases === 0 ||
    timer98dba0MtNoStateFallbackCases === 0) {
  throw new Error(
    "FUN_0098dba0 timer MT wire corpus lacks in-module/CRT-fallback/not-ready " +
      "coverage",
  );
}
/* ABI v77: the record-22 lane must actually run on the shipped module and
   the OFF arms must be presented. Without these gates a harness that never
   delivers the blob (or a whitelist that zeros it) leaves the whole lane
   unexercised while the suite stays green — measured defect class 6. */
if (engineAnm2LaneOnCases < 4 || engineAnm2LaneOffCases < 3 || engineAnm2StarMaskCases < 1) {
  throw new Error(
    `record-22 ANM2::Load lane corpus lacks on/off/star-mask coverage ` +
      `(on ${engineAnm2LaneOnCases}, off ${engineAnm2LaneOffCases}, ` +
      `star-mask ${engineAnm2StarMaskCases})`,
  );
}
if (pass4257b0ResumeCases === 0 || pass4257b0EmptyPostCases === 0 || pass4257b0LivePostCases === 0) {
  throw new Error("4257b0 pass-A corpus lacks resume/empty-post/live-post coverage");
}
/* ABI v71: every arm of the pure FUN_004257b0 body must be presented. Without
   this gate a corpus that never supplies a blob would leave the whole
   translation unexercised while the suite stayed green. The negative-delta
   arm is what separates the PE's SIGNED magic division from an unsigned
   delta / 0x68; the moved-base arm is what separates a pair read together
   from a pre-begin beside a post-end. */
if (fo4257b0BlobCases === 0 || fo4257b0FallbackCases === 0 ||
    fo4257b0PassAPureCases === 0 || fo4257b0NoRecaptureCases === 0 ||
    fo4257b0InsertCases === 0 || fo4257b0GrowCases === 0 ||
    fo4257b0MovedBaseCases === 0 || fo4257b0MismatchCases === 0 ||
    fo4257b0NegativeDeltaCases === 0 || fo4257b0EmptyCtrCases === 0 ||
    fo4257b0NonEmptyCtrCases === 0 || fo4257b0StoreCases === 0) {
  throw new Error(
    "FUN_004257b0 blob corpus lacks blob/fallback/passA/no-recapture/insert/" +
      "grow/moved-base/mismatch/negative-delta/empty-ctr/non-empty-ctr/store coverage: blob=" + fo4257b0BlobCases + " fb=" + fo4257b0FallbackCases + " pa=" + fo4257b0PassAPureCases + " nr=" + fo4257b0NoRecaptureCases + " ins=" + fo4257b0InsertCases + " grow=" + fo4257b0GrowCases + " mv=" + fo4257b0MovedBaseCases + " mis=" + fo4257b0MismatchCases + " neg=" + fo4257b0NegativeDeltaCases + " ec=" + fo4257b0EmptyCtrCases + " ne=" + fo4257b0NonEmptyCtrCases + " st=" + fo4257b0StoreCases,
  );
}
if (fo4257b0MaxList() !== FRAME_OPAQUE_4257B0_MAX_LIST ||
    fo4257b0MaxPlayers() !== FRAME_OPAQUE_4257B0_MAX_PLAYERS ||
    fo4257b0MaxElems() !== FRAME_OPAQUE_4257B0_MAX_ELEMS) {
  throw new Error("FUN_004257b0 caps disagree between the module and the model");
}
if (hostFun746560WalkPostCases === 0 || hostFun746560WalkLegacyCases === 0 ||
    hostFun746560CleanupPostCases === 0 || hostFun746560SuffixCases === 0) {
  throw new Error(
    "VA 0x00746560 corpus lacks walk-post / walk-legacy / cleanup-post / suffix coverage",
  );
}
/* ABI v66: the timer-block gate is only verified if BOTH arms were presented,
   and the negative arm is what separates a signed model from an unsigned one.
   Without this gate a corpus that never supplies a capture would leave the
   fold entirely unexercised while the suite stayed green. */
if (timer98dba0SkipCases === 0 || timer98dba0LiveCases === 0 ||
    timer98dba0NegativeSkipCases === 0 || timer98dba0LegacyCases === 0) {
  throw new Error(
    "FUN_0098dba0 timer-block corpus lacks skip / live / negative-skip / legacy coverage",
  );
}
/* ABI v70: every timer-interior arm must be presented — pure-applied (edge
   dropped, plan checked against the harness transcription), the CRT sub-arm
   (mt NOT advanced), the 0x100 wide-byte useCrtRand shape (a full-word model
   survives green without it), pure_ready on the skip arm (the gate must still
   win), and the live host arm (pure_ready=0 keeps the v66..v69 emission). */
if (timer98dba0PureAppliedCases === 0 || timer98dba0PureCrtCases === 0 ||
    timer98dba0PureWideByteCases === 0 || timer98dba0PureSkipArmCases === 0 ||
    timer98dba0LiveHostCases === 0) {
  throw new Error(
    "FUN_0098dba0 timer-interior corpus lacks coverage: " +
      JSON.stringify({
        pureApplied: timer98dba0PureAppliedCases,
        pureCrt: timer98dba0PureCrtCases,
        pureWideByte: timer98dba0PureWideByteCases,
        pureSkipArm: timer98dba0PureSkipArmCases,
        liveHost: timer98dba0LiveHostCases,
      }),
  );
}
/* ABI v69: every death-wire arm must be presented. The wide-byte arm is the
   uint8_t-defect guard: without a 0x100-shaped lane the low-byte narrowing is
   never exercised across the boundary and a full-word model survives green. */
if (deathGateClosedCases === 0 || deathCount0DropCases === 0 ||
    deathMonolithicCases === 0 || deathPureDropCases === 0 ||
    deathWalkCases === 0 || deathWideByteCases < 4) {
  throw new Error(
    "PM death-wire corpus lacks coverage: " +
      JSON.stringify({
        gateClosed: deathGateClosedCases,
        count0Drop: deathCount0DropCases,
        monolithic: deathMonolithicCases,
        pureDrop: deathPureDropCases,
        walk: deathWalkCases,
        wideByte: deathWideByteCases,
      }),
  );
}

/* ABI v95 (record idx 20 depth): Game::SaveState 0x006f9000 decision-law
   spot checks on the shipped module (the full differential lives in the
   family test suite) — without them a build that silently drops the new
   exports stays green (measured defect class 6). */
if (savestateVersionWord() !== 0x35 || savestateFlagsCount() !== 0x35 ||
    savestateFlagsByte(0x20, 0, 1) !== 1 || savestateFlagsByte(0x20, 1, 0) !== 0 ||
    savestateFlagsByte(0x35, 1, 1) !== 0 ||
    savestateBadgesAlias(0x1234, 0x1234) !== 1 ||
    savestateBadgesSrcCount(0x1000, 0x1040) !== 8 ||
    savestateBadgesGrow(0x10, 0, 0x2000, 0x2004) !== 1 ||
    savestateBadgesGrow(0x1000, 0x1010, 0x2000, 0x2080) !== 0 ||
    savestateBadgesCopyBytes(0x1000, 0x1040) !== 0x40 ||
    savestatePtrvecCount(0x108, 0x100) !== -2 ||
    savestatePtrvecSkip(0x100, 0x100) !== 1 ||
    savestateSetg67788(0xffffffff) !== 0 || savestateSetg67788(1) !== 1 ||
    savestateClamp265ec(1) !== 0 || savestateClamp265ec(2) !== 1 ||
    savestatePreHeaderStores() !== 7 || savestatePostHeaderStores() !== 19 ||
    savestateDwordRunStores() !== 15 || savestateSectionLoopCount() !== 7 ||
    savestateSectionStride() !== 0x320 || savestateDwordLoopCount() !== 0xe ||
    savestatePlanWords() !== 19) {
  throw new Error(
    "Game::SaveState 0x006f9000 law exports disagree with the PE transcription",
  );
}

writeFileSync(join(output, "verification.json"), JSON.stringify(report, null, 2) + "\n");
/* ============================================================================
 * ABI-96 lane-delivery guard (wave-22 merge; C3-harness lesson, "or a guard").
 *
 * The 44 new runtime inputs (record-4 store-plan capture + player-entry
 * pack, record-10 true-probe blob, record-9 TAIL-A, record-22 ANM2::Load
 * pre-lane half) have NO step-path consumer yet — their seams activate in
 * later waves. So the differential cannot prove "the input changed the
 * events" for them. What CAN be proven — and is exactly the C3 defect class
 * the whitelist lesson guards against — is that a corpus draw of each new
 * key actually REACHES the module's runtime struct at its pinned offset:
 * a lane missing from the per-key whitelist (or the layout) silently stays
 * ZERO in the module no matter what the corpus says. This block writes each
 * new lane through the SAME writeRuntimeInputsFlat path the differential
 * uses, reads the runtime struct back from module memory at the pinned
 * offset, asserts the drawn value landed, and asserts the clean reset
 * default is zero (the write CHANGED the module's observable state).
 * ========================================================================== */
{
  const u8 = new Uint8Array(wasm.memory.buffer, runtimeInputsAddress());
  const u32 = new Uint32Array(wasm.memory.buffer, runtimeInputsAddress());
  let abi96LaneDeliveries = 0;
  /* New scalar lanes: model name -> pinned offset. */
  const scalarLanes = [
    ["opaque8318a0SfxGlobal798e4", 13736], ["opaque8318a0SfxGlobal79948", 13740],
    ["opaque8318a0SfxGlobal79790", 13744], ["opaque8318a0SfxGlobal7978c", 13748],
    ["opaque8318a0EngineField28", 13752], ["opaque8318a0EngineByte7c", 13756],
    ["opaque8318a0PlayerEntryReady", 13760], ["opaque8318a0PlayerEntryCount", 13764],
    ["frameOpaque4212c0TrueProbeReady", 14152], ["frameOpaque4212c0TrueProbeMgrBase", 14156],
    ["frameOpaque4212c0TrueProbeMgrF18", 14160], ["frameOpaque4212c0TrueProbeMgrEbc", 14164],
    ["frameOpaque4212c0TrueProbeMgr14", 14168], ["frameOpaque4212c0TrueProbeMgr21618", 14172],
    ["frameOpaque4212c0TrueProbeMgr21620", 14176], ["frameOpaque4212c0TrueProbeMgr21624", 14180],
    ["frameOpaque4212c0TrueProbeMgr2161c", 14184], ["frameOpaque4212c0TrueProbeMgr29fb8", 14188],
    ["frameOpaque4212c0TrueProbeVolumeBits", 14192], ["frameOpaque4212c0TrueProbeVolumeEqOne", 14196],
    ["state24ecc8ef990TailaSlotBegin", 14200], ["state24ecc8ef990TailaSlotEnd", 14204],
    ["state24ecc8ef990TailaSfxSeed", 14208],
    ["engineAnm2FilenameReady", 14212], ["engineAnm2FilenamePtr", 14216],
    ["engineAnm2FilenameSize", 14220], ["engineAnm2FilenameCap", 14224],
    ["engineAnm2AnimFirstPre", 14228], ["engineAnm2AnimSecondPre", 14232],
    ["engineAnm2AnimReady", 14236], ["engineAnm2LoadgraphicsFlagReady", 14240],
  ];
  const byteLanes = [
    ["opaque8318a0PlayerEntryB173", 13768], ["opaque8318a0PlayerEntryB1398", 13800],
    ["opaque8318a0PlayerEntryB139a", 13832], ["opaque8318a0PlayerEntryB171", 13864],
    ["opaque8318a0PlayerEntryW410", 13896], ["opaque8318a0PlayerEntryW3fc", 13928],
    ["opaque8318a0PlayerEntryPtr7c", 13960], ["opaque8318a0PlayerEntryB34", 13992],
    ["opaque8318a0PlayerEntryB88", 14024], ["opaque8318a0PlayerEntryW1600", 14056],
    ["opaque8318a0PlayerEntryW418", 14088], ["opaque8318a0PlayerEntryW16c", 14120],
    ["engineAnm2LoadgraphicsFlags", 14244],
  ];
  for (const [name, off] of scalarLanes) {
    const draw = 0x1000 + off;
    reset();
    writeRuntimeInputsFlat({ [name]: draw }, {});
    const laid = u32[off >> 2];
    if (laid !== draw >>> 0) {
      throw new Error(
        `ABI-96 lane-delivery guard: ${name} @${off} did not reach the module ` +
          `(drew 0x${(draw >>> 0).toString(16)}, read 0x${(laid >>> 0).toString(16)}) — ` +
          `missing whitelist/layout key (C3 defect class)`,
      );
    }
    reset();
    writeRuntimeInputsFlat({}, {});
    if (u32[off >> 2] !== 0) {
      throw new Error(`ABI-96 lane-delivery guard: ${name} @${off} not zero after clean reset`);
    }
    abi96LaneDeliveries += 1;
  }
  for (const [name, off] of byteLanes) {
    reset();
    const blob = new Uint8Array(32).map((_, j) => (j + off) & 0xff);
    writeRuntimeInputsFlat({ [name]: blob }, {});
    for (let j = 0; j < 32; j += 1) {
      const got = u8[off + j];
      if (got !== blob[j]) {
        throw new Error(
          `ABI-96 lane-delivery guard: ${name} @${off}[${j}] did not reach the module ` +
            `(drew 0x${blob[j].toString(16)}, read 0x${got.toString(16)})`,
        );
      }
    }
    reset();
    writeRuntimeInputsFlat({}, {});
    for (let j = 0; j < 32; j += 1) {
      if (u8[off + j] !== 0) {
        throw new Error(`ABI-96 lane-delivery guard: ${name} @${off}[${j}] not zero after clean reset`);
      }
    }
    abi96LaneDeliveries += 1;
  }
  /* Events: the 6 new words must exist inside the module's events buffer
     (size 980 — ABI-98 merge; the abi98Lanes block below re-pins 980)
     and reset to zero (the cpp zero-init). */
  const liveEvSize = exported("isaac_game_update_slice_events_size")();
  if (liveEvSize !== ABI_SIZES.events) {
    throw new Error(`ABI-96 events size mismatch: module ${liveEvSize}, expected ${ABI_SIZES.events}`);
  }
  const evLanes = [
    ["opaque008318a0SfxManagerStores", 932], ["frameOpaque4212c0TrueProbeInterior", 936],
    ["hudStatWalkFatalEmpty", 940], ["engineAnm2PrefixFilenameAssign", 944],
    ["engineAnm2PrefixCacheFetch", 948], ["engineAnm2PrefixLoadImage", 952],
  ];
  const evU32 = new Uint32Array(wasm.memory.buffer, eventsAddress());
  reset();
  for (const [name, off] of evLanes) {
    const v = evU32[off >> 2];
    if (v !== 0) {
      throw new Error(`ABI-96 events guard: ${name} @${off} not zero after reset (got ${v})`);
    }
  }
  if (abi96LaneDeliveries < scalarLanes.length + byteLanes.length) {
    throw new Error(`ABI-96 lane-delivery guard incomplete (${abi96LaneDeliveries} deliveries)`);
  }
  console.log(`abi96Lanes=${abi96LaneDeliveries}/${scalarLanes.length + byteLanes.length} delivered events=${evLanes.length}@${liveEvSize}B`);
}
/* ============================================================================
 * ABI-97 lane-delivery guard (wave-26 merge; PLAN update-v102-abi97-plan
 * §6 — same C3 harness lesson as the abi96Lanes block above).
 *
 * The 4 walker capture lanes (@14276..14288) feed the (void)-wired walker
 * laws (row_arm / reset_split / swap_store / probe1_arg); their only
 * step-path consumers are the typed walker probe events @956/960/964,
 * which fire only when the capture is LIVE (player_a | player_b != 0).
 * This block proves each lane reaches the module struct at its pinned
 * offset (write through the SAME writeRuntimeInputsFlat path the
 * differential uses, read back, assert landed; clean reset -> zero) and
 * that the 3 new event words exist inside the module's events buffer
 * (size 980 at ABI-98) and reset to zero (the cpp zero-init).
 * ========================================================================== */
{
  const u32 = new Uint32Array(wasm.memory.buffer, runtimeInputsAddress());
  let abi97LaneDeliveries = 0;
  /* New scalar lanes: model name -> pinned offset. */
  const walkerLanes = [
    ["hudStatWalkerPlayerA", 14276], ["hudStatWalkerPlayerB", 14280],
    ["hudStatWalkerBFrame328", 14284], ["hudStatWalkProbe1Arg", 14288],
  ];
  for (const [name, off] of walkerLanes) {
    const draw = 0x1000 + off;
    reset();
    writeRuntimeInputsFlat({ [name]: draw }, {});
    const laid = u32[off >> 2];
    if (laid !== draw >>> 0) {
      throw new Error(
        `ABI-97 lane-delivery guard: ${name} @${off} did not reach the module ` +
          `(drew 0x${(draw >>> 0).toString(16)}, read 0x${(laid >>> 0).toString(16)}) — ` +
          `missing whitelist/layout key (C3 defect class)`,
      );
    }
    reset();
    writeRuntimeInputsFlat({}, {});
    if (u32[off >> 2] !== 0) {
      throw new Error(`ABI-97 lane-delivery guard: ${name} @${off} not zero after clean reset`);
    }
    abi97LaneDeliveries += 1;
  }
  /* Events: the 3 new walker probe words must exist (size 980 at ABI-98)
     and reset to zero. */
  const liveEvSize97 = exported("isaac_game_update_slice_events_size")();
  if (liveEvSize97 !== ABI_SIZES.events) {
    throw new Error(`ABI-97 events size mismatch: module ${liveEvSize97}, expected ${ABI_SIZES.events}`);
  }
  const walkerEvLanes = [
    ["hudStatWalkerProbe1", 956], ["hudStatWalkerProbe2", 960],
    ["hudStatWalkerProbe3", 964],
  ];
  const evU32 = new Uint32Array(wasm.memory.buffer, eventsAddress());
  reset();
  for (const [name, off] of walkerEvLanes) {
    const v = evU32[off >> 2];
    if (v !== 0) {
      throw new Error(`ABI-97 events guard: ${name} @${off} not zero after reset (got ${v})`);
    }
  }
  if (abi97LaneDeliveries < walkerLanes.length) {
    throw new Error(`ABI-97 lane-delivery guard incomplete (${abi97LaneDeliveries} deliveries)`);
  }
  console.log(`abi97Lanes=${abi97LaneDeliveries}/${walkerLanes.length} delivered events=${walkerEvLanes.length}@${liveEvSize97}B`);
}
/* ============================================================================
 * ABI-98 lane-delivery guard (wave-27 merge; PLAN update-v104-abi98-plan
 * §6 — the same C3 harness lesson as the abi96/abi97Lanes blocks).
 *
 * The 9 record-12 transition pack lanes (@14292..14324) feed the six
 * capture-dependent laws (stage_transition_reach / anim0xc_route /
 * player_loop_reach / room_dispatch_reach / engine_room_arg /
 * terminal_265c0_clear) whose step-path consumers are the 3 typed pack
 * events @968/972/976, gated on the two vouchers
 * (transition6fd7c0Ready @14324 AND opaqueCall006fd7c0Ready @13732).
 * This block proves each lane reaches the module struct at its pinned
 * offset (write through the SAME writeRuntimeInputsFlat path the
 * differential uses, read back, assert landed; clean reset -> zero) and
 * that the 3 new event words exist inside the module's events buffer
 * (size 980) and reset to zero (the cpp zero-init).
 * ========================================================================== */
{
  const u32 = new Uint32Array(wasm.memory.buffer, runtimeInputsAddress());
  let abi98LaneDeliveries = 0;
  /* New scalar lanes: model name -> pinned offset. */
  const packLanes = [
    ["transition6fd7c0Game0", 14292], ["transition6fd7c0AltPathProbe", 14296],
    ["transition6fd7c0RouteProbe", 14300], ["transition6fd7c0PlayerLoopProbe", 14304],
    ["transition6fd7c0RoomType8", 14308], ["transition6fd7c0RoomSubroomFlag44", 14312],
    ["transition6fd7c0BlueRoomProbe", 14316], ["transition6fd7c0EnginePredProbe", 14320],
    ["transition6fd7c0Ready", 14324],
  ];
  for (const [name, off] of packLanes) {
    const draw = 0x1000 + off;
    reset();
    writeRuntimeInputsFlat({ [name]: draw }, {});
    const laid = u32[off >> 2];
    if (laid !== draw >>> 0) {
      throw new Error(
        `ABI-98 lane-delivery guard: ${name} @${off} did not reach the module ` +
          `(drew 0x${(draw >>> 0).toString(16)}, read 0x${(laid >>> 0).toString(16)}) — ` +
          `missing whitelist/layout key (C3 defect class)`,
      );
    }
    reset();
    writeRuntimeInputsFlat({}, {});
    if (u32[off >> 2] !== 0) {
      throw new Error(`ABI-98 lane-delivery guard: ${name} @${off} not zero after clean reset`);
    }
    abi98LaneDeliveries += 1;
  }
  /* Events: the lane words must exist (size 1020 since v127
     — wave-29 bumped 984 -> 988 with the mid-restock typed drop @984;
     v115 bumps 988 -> 992 with the clear-path flag-store carrier @988;
     v119 bumps 992 -> 996 with the type-5 forced-rerun carrier @992;
     v126 bumps 996 -> 1000 with the idx-40 tailMid7230SpawnArmed
     carrier @996; v127 bumps 1000 -> 1020 with the shop-restock set
     @1000..1020) and reset to zero. */
  const liveEvSize98 = exported("isaac_game_update_slice_events_size")();
  if (liveEvSize98 !== 1260) {
    throw new Error(`ABI-98 events size mismatch: module ${liveEvSize98}, expected 1260 (v142 rt_band_pop composite carrier @1244..1256 after the v141 0xb-block carriers ending @1240)`);
  }

  const packEvLanes = [
    ["frameEffect6fd7c0StageTransition", 968], ["frameEffect6fd7c0PlayerLoop", 972],
    ["frameEffect6fd7c0RoomDispatch", 976],
  ];
  const evU32 = new Uint32Array(wasm.memory.buffer, eventsAddress());
  reset();
  for (const [name, off] of packEvLanes) {
    const v = evU32[off >> 2];
    if (v !== 0) {
      throw new Error(`ABI-98 events guard: ${name} @${off} not zero after reset (got ${v})`);
    }
  }
  if (abi98LaneDeliveries < packLanes.length) {
    throw new Error(`ABI-98 lane-delivery guard incomplete (${abi98LaneDeliveries} deliveries)`);
  }
  console.log(`abi98Lanes=${abi98LaneDeliveries}/${packLanes.length} delivered events=${packEvLanes.length}@${liveEvSize98}B`);
}
/* ============================================================================
 * ABI-99 lane-delivery guard (wave-28 merge; update-v106-record5-32-
 * entity-surface §6 — the same C3 harness lesson as the abi96/97/98Lanes
 * blocks).
 *
 * The 9 entity-surface pack lanes (ready @14328 + 8x44 B capture blobs
 * @14332..14684, REBOUND from the v95 provisional rows @8040..8396 that
 * collided with the committed b3b7 lanes) feed the accept-pure proof
 * event @980..984 (model emit + cpp mirror publish it ONLY when ready !=
 * 0). This block proves each lane reaches the module struct at its pinned
 * offset (write through the SAME writeRuntimeInputsFlat path the
 * differential uses, read back, assert landed; clean reset -> zero) and
 * that the accept-pure event word exists inside the module's events
 * buffer (size 984) and resets to zero (the cpp zero-init).
 * ========================================================================== */
{
  const u32 = new Uint32Array(wasm.memory.buffer, runtimeInputsAddress());
  let abi99LaneDeliveries = 0;
  /* Field order of the 44 B pack(1) capture blob (model flat-key suffix
     -> u32 field offset inside the slot). */
  const esFields = [
    "VtableClassBits", "ImplPtr", "ImplB0", "Impl8", "ImplC",
    "Impl20", "Impl2010", "Netman2b4", "GlobalC73680", "GlobalC73694",
    "GlobalC5ac00",
  ];
  const esLanes = [["frameOpaque98dba0EntitySurfaceReady", 14328]];
  for (let i = 0; i < 8; i += 1) {
    const base = 14332 + i * 44;
    for (let j = 0; j < esFields.length; j += 1) {
      esLanes.push([`frameOpaque98dba0EntitySurfaceCapture${i}${esFields[j]}`, base + 4 * j]);
    }
  }
  for (const [name, off] of esLanes) {
    const draw = 0x1000 + off;
    reset();
    writeRuntimeInputsFlat({ [name]: draw }, {});
    const laid = u32[off >> 2];
    if (laid !== draw >>> 0) {
      throw new Error(
        `ABI-99 lane-delivery guard: ${name} @${off} did not reach the module ` +
          `(drew 0x${(draw >>> 0).toString(16)}, read 0x${(laid >>> 0).toString(16)}) — ` +
          `missing whitelist/layout key (C3 defect class)`,
      );
    }
    reset();
    writeRuntimeInputsFlat({}, {});
    if (u32[off >> 2] !== 0) {
      throw new Error(`ABI-99 lane-delivery guard: ${name} @${off} not zero after clean reset`);
    }
    abi99LaneDeliveries += 1;
  }
  /* Events: the accept-pure word must exist (size 1020 — v127 bump
     with the shop-restock event set @1000..1020) and reset to zero. */
  const liveEvSize99 = exported("isaac_game_update_slice_events_size")();
  if (liveEvSize99 !== 1260) {
    throw new Error(`ABI-99 events size mismatch: module ${liveEvSize99}, expected 1260 (v142 rt_band_pop composite carrier @1244..1256 after the v141 0xb-block carriers ending @1240)`);
  }

  const esEvU32 = new Uint32Array(wasm.memory.buffer, eventsAddress());
  const esEventLanes = [["frameOpaque98dba0EntitySurfaceAcceptPure", 980]];
  reset();
  for (const [name, off] of esEventLanes) {
    const v = esEvU32[off >> 2];
    if (v !== 0) {
      throw new Error(`ABI-99 events guard: ${name} @${off} not zero after reset (got ${v})`);
    }
  }
  if (abi99LaneDeliveries < esLanes.length) {
    throw new Error(`ABI-99 lane-delivery guard incomplete (${abi99LaneDeliveries} deliveries)`);
  }
  console.log(`abi99Lanes=${abi99LaneDeliveries}/${esLanes.length} delivered events=${esEventLanes.length}@${liveEvSize99}B`);
}
/* ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11): probe the 18 B9/B10/
   B11 decision-law exports on the SHIPPED module with UNMASKED wide args.
   Each law is a byte-gate (LOW-BYTE re-narrow in the body) or a FULL-DWORD
   equality/signed compare; wide values above 0xff must reach the callee
   exactly (Wasm ABI does not narrow i32), so a uint8_t param or a
   pre-masked model diverges here. */
const b9b11GateWasm = exported("isaac_game_update_slice_b9b11_challenge_gate");
const b9b11HelperWasm = exported("isaac_game_update_slice_b9b11_free_helper_needed");
const b9b11PathWasm = exported("isaac_game_update_slice_b9b11_free_path_needed");
const b9b11PtrWasm = exported("isaac_game_update_slice_b9b11_free_ptr_needed");
const b9b11HeapLoWasm = exported("isaac_game_update_slice_b9b11_free_heap_lo");
const b9b11HeapHiWasm = exported("isaac_game_update_slice_b9b11_free_heap_hi");
const b9b11EnemiesWasm = exported("isaac_game_update_slice_b9b11_b10_enemies");
const b9b11FatalWasm = exported("isaac_game_update_slice_b9b11_b10_fatal_needed");
const b9b11ModeHooksWasm = exported("isaac_game_update_slice_b9b11_mode_hooks_needed");
const b9b11FlagWasm = exported("isaac_game_update_slice_b9b11_flag_11f4_needed");
const b9b11DoubleWasm = exported("isaac_game_update_slice_b9b11_double_409030_needed");
const b9b11StageWasm = exported("isaac_game_update_slice_b9b11_stage_1a_needed");
const b9b11Age1Wasm = exported("isaac_game_update_slice_b9b11_age1_needed");
const b9b11FxFlagWasm = exported("isaac_game_update_slice_b9b11_tempfx_flag_clear");
const b9b11ListWasm = exported("isaac_game_update_slice_b9b11_tempfx_list_empty");
const b9b11CandidateWasm = exported("isaac_game_update_slice_b9b11_tempfx_is_candidate");
const b9b11WalkNextWasm = exported("isaac_game_update_slice_b9b11_tempfx_walk_next");
const b9b11WalkContWasm = exported("isaac_game_update_slice_b9b11_tempfx_walk_continue");
let b9b11Probes = 0;
for (const [r, a, f, e, ty, fl] of [
  [0x226, 1, 100, 96, 0x11, 0], [0, 1, 100, 96, 0x11, 0],
  [0x100, 1, 100, 96, 0x11, 0], [1, 0x100, 100, 96, 0x11, 0],
  [1, 0x1ff, 100, 96, 0x11, 0], [1, 1, 100, 97, 0x11, 0],
  [1, 1, 100, 95, 0x11, 0], [1, 1, 0, 0xfffffffc, 0x11, 0],
  [1, 1, 100, 96, 0x111, 0], [1, 1, 100, 96, 0x10, 0],
  [1, 1, 100, 96, 0x11, 8], [1, 1, 100, 96, 0x11, 0x108],
  [1, 1, 100, 96, 0x11, 0x10],
]) {
  const actual = b9b11GateWasm(r | 0, a | 0, f | 0, e | 0, ty | 0, fl | 0) | 0;
  const want = gameUpdateSliceB9b11ChallengeGate(r, a, f, e, ty, fl);
  if (actual !== want) {
    throw new Error(
      `B9B11 challenge_gate diverged for (r=0x${(r >>> 0).toString(16)},a=0x${(a >>> 0).toString(16)},age=${f - e}): wasm ${actual} model ${want}`,
    );
  }
  b9b11Probes += 1;
}
for (const c of [0, 1, 0xff, 0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
  if ((b9b11HelperWasm(c | 0) | 0) !== gameUpdateSliceB9b11FreeHelperNeeded(c)) {
    throw new Error(`B9B11 free_helper_needed diverged for count 0x${(c >>> 0).toString(16)}`);
  }
  if ((b9b11PathWasm(c | 0) | 0) !== gameUpdateSliceB9b11FreePathNeeded(c)) {
    throw new Error(`B9B11 free_path_needed diverged for byte 0x${(c >>> 0).toString(16)}`);
  }
  if ((b9b11PtrWasm(c | 0) | 0) !== gameUpdateSliceB9b11FreePtrNeeded(c)) {
    throw new Error(`B9B11 free_ptr_needed diverged for ptr 0x${(c >>> 0).toString(16)}`);
  }
  b9b11Probes += 3;
}
for (const [lo, hi, size] of [
  [0x1000, 5, 0x100], [4, 5, 8], [0, 0, 1], [0x80000000, 7, 0x80000000],
  [0xffffffff, 0xffffffff, 1], [0, 0, 0xffffffff],
]) {
  if ((b9b11HeapLoWasm(lo | 0, size | 0) >>> 0) !== gameUpdateSliceB9b11FreeHeapLo(lo, size)) {
    throw new Error(`B9B11 free_heap_lo diverged for (lo=0x${(lo >>> 0).toString(16)},size=0x${(size >>> 0).toString(16)})`);
  }
  if ((b9b11HeapHiWasm(lo | 0, hi | 0, size | 0) >>> 0) !== gameUpdateSliceB9b11FreeHeapHi(lo, hi, size)) {
    throw new Error(`B9B11 free_heap_hi diverged for (lo=0x${(lo >>> 0).toString(16)},hi=0x${(hi >>> 0).toString(16)},size=0x${(size >>> 0).toString(16)})`);
  }
  b9b11Probes += 2;
}
for (const [a, b] of [
  [0, 0], [3, 4], [-5, 2], [-5, 7], [0x7fffffff, 1], [0xffffffff, 1],
  [0x80000000, 0x80000000], [0x80000000, 0x7fffffff],
]) {
  const enemies = gameUpdateSliceB9b11B10Enemies(a, b);
  if ((b9b11EnemiesWasm(a | 0, b | 0) | 0) !== enemies) {
    throw new Error(`B9B11 b10_enemies diverged for (${a | 0},${b | 0})`);
  }
  for (const old of [0, 1, -1, 0x7fffffff, 0x80000000]) {
    if ((b9b11FatalWasm(enemies | 0, old | 0) | 0) !== gameUpdateSliceB9b11B10FatalNeeded(enemies, old)) {
      throw new Error(`B9B11 b10_fatal_needed diverged for (enemies=${enemies},old=${old})`);
    }
    b9b11Probes += 1;
  }
  b9b11Probes += 1;
}
for (const [ty, gb] of [
  [0xb, 1], [0x11, 1], [0xb, 0], [0xb, 0x100], [0xb, 0x1ff],
  [0x10b, 1], [0x111, 1], [0x1, 1],
]) {
  if ((b9b11ModeHooksWasm(ty | 0, gb | 0) | 0) !== gameUpdateSliceB9b11ModeHooksNeeded(ty, gb)) {
    throw new Error(`B9B11 mode_hooks diverged for (type=0x${(ty >>> 0).toString(16)},byte=0x${(gb >>> 0).toString(16)})`);
  }
  b9b11Probes += 1;
}
for (const v of [0, 1, 0x100, 0x1ff, 0xffffffff]) {
  if ((b9b11FlagWasm(v | 0) | 0) !== gameUpdateSliceB9b11Flag11f4Needed(v)) {
    throw new Error(`B9B11 flag_11f4 diverged for 0x${(v >>> 0).toString(16)}`);
  }
  if ((b9b11DoubleWasm(v | 0) | 0) !== gameUpdateSliceB9b11Double409030Needed(v)) {
    throw new Error(`B9B11 double_409030 diverged for 0x${(v >>> 0).toString(16)}`);
  }
  if ((b9b11FxFlagWasm(v | 0) | 0) !== gameUpdateSliceB9b11TempfxFlagClear(v)) {
    throw new Error(`B9B11 tempfx_flag_clear diverged for 0x${(v >>> 0).toString(16)}`);
  }
  b9b11Probes += 3;
}
for (const v of [0x1a, 0x11a, 0x19, 0xffffffff, 0x100, 0x1a00]) {
  if ((b9b11StageWasm(v | 0) | 0) !== gameUpdateSliceB9b11Stage1aNeeded(v)) {
    throw new Error(`B9B11 stage_1a diverged for 0x${(v >>> 0).toString(16)}`);
  }
  b9b11Probes += 1;
}
for (const [active, f, e] of [[1, 100, 99], [0x100, 100, 99], [1, 100, 98], [1, 100, 100], [0, 100, 99], [1, 0, 0xffffffff]]) {
  if ((b9b11Age1Wasm(active | 0, f | 0, e | 0) | 0) !== gameUpdateSliceB9b11Age1Needed(active, f, e)) {
    throw new Error(`B9B11 age1 diverged for (active=0x${(active >>> 0).toString(16)},frame=${f},entry=${e})`);
  }
  b9b11Probes += 1;
}
for (const [b, e] of [[0x1000, 0x1000], [0x1000, 0x1010], [0, 0xffffffff], [0xffffffff, 0xffffffff]]) {
  if ((b9b11ListWasm(b | 0, e | 0) | 0) !== gameUpdateSliceB9b11TempfxListEmpty(b, e)) {
    throw new Error(`B9B11 tempfx_list_empty diverged for (0x${(b >>> 0).toString(16)},0x${(e >>> 0).toString(16)})`);
  }
  b9b11Probes += 1;
}
for (const [ty, v] of [
  [1, 0x1e1], [3, 0x1e1], [4, 0x1e1], [2, 0x1e1], [1, 0x1e0],
  [1, 0x2e1], [1, 0xffffffff], [0x100, 0x1e1],
]) {
  if ((b9b11CandidateWasm(ty | 0, v | 0) | 0) !== gameUpdateSliceB9b11TempfxIsCandidate(ty, v)) {
    throw new Error(`B9B11 tempfx_is_candidate diverged for (type=0x${(ty >>> 0).toString(16)},variant=0x${(v >>> 0).toString(16)})`);
  }
  b9b11Probes += 1;
}
for (const cur of [0x1000, 0xfffffff0, 0xffffffff, 0]) {
  if ((b9b11WalkNextWasm(cur | 0) >>> 0) !== gameUpdateSliceB9b11TempfxWalkNext(cur)) {
    throw new Error(`B9B11 tempfx_walk_next diverged for 0x${(cur >>> 0).toString(16)}`);
  }
  for (const end of [0x1010, 0xffffffff, cur]) {
    if ((b9b11WalkContWasm(cur | 0, end | 0) | 0) !== gameUpdateSliceB9b11TempfxWalkContinue(cur, end)) {
      throw new Error(`B9B11 tempfx_walk_continue diverged for (0x${(cur >>> 0).toString(16)},0x${(end >>> 0).toString(16)})`);
    }
    b9b11Probes += 1;
  }
}
if (b9b11Probes < 120) {
  throw new Error(`B9B11 law probes did not run (${b9b11Probes})`);
}
if (blobLaneCases < 50 || latchSetLaneCases < 1 || latchMismatchCases !== 0 ||
      flagSetLaneCases < 1 || flagClearLaneCases < 1) {
    throw new Error(
      `HUD blob-lane harness coverage broken (measured defect class: the ` +
      `whitelist build silently neuters new inputs): blobLane=${blobLaneCases} ` +
      `latchSet=${latchSetLaneCases} latchMismatch=${latchMismatchCases} ` +
      `flagSet=${flagSetLaneCases} flagClear=${flagClearLaneCases}`,
    );
  }
  /* ABI v107 (record idx 39 mid-restock): the five desc-pack keys must
     actually REACH the module. Before this unit the whitelist omitted
     them (C3 silent-zero) and the v46 pure walk + v95 typed drop never
     ran in the differential — the lane guard makes any future
     neutering fail the run instead of passing silently. */
  if (midRestockPureLaneCases < 1 || midRestockMonoLaneCases < 1 ||
      midRestockFatalDropLaneCases < 1) {
    throw new Error(
      `mid-restock desc-pack lane coverage broken: pure=${midRestockPureLaneCases} ` +
      `mono=${midRestockMonoLaneCases} fatalDrop=${midRestockFatalDropLaneCases} ` +
      `skip=${midRestockSkipLaneCases} (whitelist must name all five midRestock* keys)`,
    );
  }
  /* ABI v107 (wave-29 merge REBIND, C1): the 36 rebound lanes (18
     phone-home probe samples @6800..6868, 92f1c0 limit/field14
     @6872/6876, 4212c0 A/B pack @7656..7688, tcsStatsVec @7960..7984)
     must REACH the module at their REAL offsets AND change a result —
     the JSON/layout/whitelist carried stale offsets until this merge
     (module reads zeros; measured C3 defect class). Each lane family
     needs at least one delivery AND one law-flipping case. */
  if (
    rebind956110LaneOnCases < 1 || rebind956110ProbeCases < 1 ||
    rebind92f1c0LaneOnCases < 1 || rebind92f1c0PureTailCases < 1 ||
    rebindAbPackLaneOnCases < 1 || rebindAbPackCases < 1 ||
    rebindTcsStatsLaneOnCases < 1 || rebindTcsStatsCases < 1
  ) {
    throw new Error(
      `ABI-107 rebind lane coverage broken: 956110 on=${rebind956110LaneOnCases} ` +
      `probe=${rebind956110ProbeCases} 92f1c0 on=${rebind92f1c0LaneOnCases} ` +
      `pureTail=${rebind92f1c0PureTailCases} abPack on=${rebindAbPackLaneOnCases} ` +
      `advRew=${rebindAbPackCases} tcsStats on=${rebindTcsStatsLaneOnCases} ` +
      `sim=${rebindTcsStatsCases} (whitelist/layout must carry the 36 rebound lanes ` +
      `at the module offsets)`,
    );
  }
  /* The 10 capture-only events (JSON rows, NO wasm words): the corpus must
     exercise the model's record-18 body wire at least once (the
     roomTriggerOutput* typed counts + opaqueRoomTriggerOutputBody monolith
     arm) — otherwise nothing ever compares them (C1 §2 gap). */
  if (captureOnlyTriggerEmission < 1) {
    throw new Error(
      `capture-only event coverage broken: the model never emitted any of ` +
        `${CAPTURE_ONLY_EVENTS.length} capture-only events (corpus must draw the ` +
        `triggerOutput capture lanes so the record-18 body wire runs)`,
    );
  }
  console.log(`blobLane=${blobLaneCases} latchSet=${latchSetLaneCases} latchMismatch=${latchMismatchCases} flagSet=${flagSetLaneCases} flagClear=${flagClearLaneCases} walkLane=${hudStatWalkLaneOnCases} walk2x=${hudStatWalkDoubleTickCases} walkOffGate=${hudStatWalkOffGateCases} walkOffReady=${hudStatWalkOffReadyCases} walkOffCount0=${hudStatWalkOffCount0Cases} walkOffCap=${hudStatWalkOffCountCapCases} midRestockPure=${midRestockPureLaneCases} midRestockMono=${midRestockMonoLaneCases} midRestockFatalDrop=${midRestockFatalDropLaneCases} rebind956110=${rebind956110ProbeCases}/${rebind956110LaneOnCases} rebind92f1c0=${rebind92f1c0PureTailCases}/${rebind92f1c0LaneOnCases} rebindAbPack=${rebindAbPackCases}/${rebindAbPackLaneOnCases} rebindTcsStats=${rebindTcsStatsCases}/${rebindTcsStatsLaneOnCases} captureOnly=${captureOnlyTriggerEmission} | DIFFERENTIAL PASSED — ${corpus.length} cases, ABI ${abiVersion()}`);

/* ============================================================================
 * Live-frame regression guard (update-v96 residual inventory -> permanent).
 *
 * Defect-class 1/6 protection for the SHIPPED path: one shipped-default frame
 * driven through the module under the exact wiring web/js/native-update-bridge.js
 * uses (createNativeUpdateSession + createResidualHostHandler, all-zero ready
 * flags -> every narrowing opt-in OFF -> monolithic residual arms), then
 * asserted against the C12 live-frame census
 * (output/decomp/5129df723e64/section-notes/update-v96-residual-inventory/):
 * probe-live-120.mjs measured 25 distinct steady host kinds over 120 frames,
 * probe-live-frame.mjs the frame-1 23-kind set, probe-fragments.mjs the
 * record-0 coarse word opaqueCall009a2b30 == 1 every frame. A module that
 * stops firing a pinned edge, drifts the events layout, or grows memory on a
 * default frame now fails this section instead of going live green.
 * ========================================================================== */

/* Pinned frame-1 host kinds: every kind C12 measured on the shipped-default
   frame 1 (each fired exactly once; live-frame-host-kinds.json). The two
   remaining steady kinds of the 25 (opaqueRoomUpdatePrefixB8 — gate
   frame%3==0, 40/120 — and opaqueRoomUpdateTailMidRestock — gate age>1,
   119/120) are gate-conditioned and intentionally NOT pinned on frame 1. */
const LIVE_FRAME_PINNED_KINDS = Object.freeze([
  "opaqueCall004257b0PassA",
  "opaqueCall008607a0",
  "opaqueCall0098dba0PlayerWalk",
  "opaqueCall0098dba0Timer",
  "opaqueRoomUpdateAmbient",
  /* ABI v119 (update-v119-door-removal): the coarse door kinds are
     RETIRED (never fire) — the pinned frame-1 kinds swap to their typed
     carriers per the v115 precedent. The shipped-default frame arms the
     idx-24 failing mask -> idx-33 rides the FORCED arm
     (type5DoorForcedRerun); type5DoorOpenCalls is gate-conditioned
     (gated arm) and intentionally NOT pinned on frame 1. */
  "opaqueRoomUpdateClearDoorSlotsMask",
  "type5DoorForcedRerun",
  "clearPathFlagStore",
  "opaqueRoomUpdatePrefixB1",
  "opaqueRoomUpdatePrefixB2",
  "opaqueRoomUpdatePrefixB3B7",
  "opaqueRoomUpdatePrefixB9B11",
  "opaqueRoomUpdateTailMid",
  "opaqueRoomUpdateTailPath",
  "opaqueRoomUpdateTailRain",
  "playerManagerUpdateHeartbeat",
  "roomTriggerClearAudio",
  "roomTriggerClearAudioNonGreed",
  "roomTriggerClearAwardsBit7",
  "roomTriggerClearAwardsNonGreed",
  "roomTriggerClearAwardsTail",
  "roomTriggerClearStats",
  "roomTriggerOutput",
]);
/* Record-0 coarse word (HUD::PostUpdate 0x009a2b30): fires every frame in the
   wasm events struct (=1); NOT bridged to a JS host kind (the bridged
   hudPostUpdate family fires only with PlayerHUD blob inputs), so the guard
   asserts the raw event word directly (C12 probe-fragments.mjs). */
const LIVE_FRAME_RECORD0_COARSE_WORD = "opaqueCall009a2b30";

{
  /* (1) Step contract + events-layout bounds. ABI 95 ships the step export
     as VOID (decoded from the wasm type section: 4x i32 params, no result),
     so the step's success observable is the terminal continuation kind
     RETURN_AFTER_GAME_UPDATE; the int32 "return 1" contract lives on the
     resume exports, and the hybrid drive below throws on any non-1
     (runNativeGameUpdateTick advance()). A FRESH instance is mandatory:
     its zeroed memory IS the all-zero state/runtime/events default, and the
     record-0 coarse word ACCUMULATES across repeated steps on one instance
     (measured: 1, then 2), so the raw-step probe must not share the
     frame slice. */
  const stepSlice = await loadGameUpdateSliceWasm(wasmPath);
  stepSlice.paths.step();
  {
    const view = new DataView(stepSlice.memory.buffer);
    const kind = view.getUint32(stepSlice.paths.eventsAddress(), true);
    if (kind !== UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE) {
      throw new Error(
        `Live-frame guard: raw all-zero step did not terminate ` +
          `(continuation_kind ${kind}, expected RETURN_AFTER_GAME_UPDATE ${UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE})`,
      );
    }
  }

  /* (1b) The JS EVENTS_LAYOUT must fit inside the module's events buffer —
     no reads past EVENTS_LAYOUT sizes (layout/ABI drift guard). */
  const frameSlice = await loadGameUpdateSliceWasm(wasmPath);
  const liveEventsSize = frameSlice.wasm.isaac_game_update_slice_events_size();
  let eventsLayoutMaxEnd = 0;
  for (const [name, field] of Object.entries(EVENTS_LAYOUT)) {
    const size = field.type === "u32" || field.type === "i32" ? 4
      : field.type === "u16" ? 2
        : field.type === "u8" ? 1 : 0;
    if (size === 0) {
      throw new Error(`Live-frame guard: unexpected EVENTS_LAYOUT field type ${field.type} for ${name}`);
    }
    eventsLayoutMaxEnd = Math.max(eventsLayoutMaxEnd, field.offset + size);
  }
  if (eventsLayoutMaxEnd > liveEventsSize) {
    throw new Error(
      `Live-frame guard: EVENTS_LAYOUT reads past the module's events buffer ` +
        `(${eventsLayoutMaxEnd} B > ${liveEventsSize} B)`,
    );
  }

  /* (2)+(3) One shipped-default frame through the browser wiring. */
  const host = createResidualHostHandler();
  const session = createNativeUpdateSession(frameSlice, { onHostEvent: host });
  const memoryBefore = frameSlice.memory.buffer.byteLength;
  const result = session.tick(); /* throws if any wasm resume returned !== 1 */
  const memoryAfter = frameSlice.memory.buffer.byteLength;

  if (result.continuationKind !== UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE) {
    throw new Error(
      `Live-frame guard: shipped-default frame did not terminate ` +
        `(continuationKind ${result.continuationKind}, expected RETURN_AFTER_GAME_UPDATE)`,
    );
  }
  const observedKinds = new Set(Object.keys(host.totals || {}));
  const missingKinds = LIVE_FRAME_PINNED_KINDS.filter((k) => !observedKinds.has(k));
  if (missingKinds.length > 0) {
    throw new Error(
      `Live-frame guard: pinned host kinds missing on the shipped-default frame: ${missingKinds.join(", ")}`,
    );
  }
  if (result.events[LIVE_FRAME_RECORD0_COARSE_WORD] !== 1) {
    throw new Error(
      `Live-frame guard: record-0 coarse word ${LIVE_FRAME_RECORD0_COARSE_WORD} must fire ` +
        `exactly once per frame (got ${result.events[LIVE_FRAME_RECORD0_COARSE_WORD]})`,
    );
  }
  if (memoryAfter !== memoryBefore) {
    throw new Error(
      `Live-frame guard: memory grew during the default frame (${memoryBefore} -> ${memoryAfter} B)`,
    );
  }

  console.log(
    `live-frame guard PASSED — ${observedKinds.size} host kinds ` +
      `(${LIVE_FRAME_PINNED_KINDS.length}/${LIVE_FRAME_PINNED_KINDS.length} pinned + ` +
      `${LIVE_FRAME_RECORD0_COARSE_WORD}=${result.events[LIVE_FRAME_RECORD0_COARSE_WORD]}), ` +
      `terminal ${result.continuationKind}, events ${eventsLayoutMaxEnd}/${liveEventsSize} B, ` +
      `memory ${memoryBefore} B stable`,
  );
}
