/**
 * Shipped frame-path selector for the native/Wasm Game::Update port.
 *
 * The per-frame simulation tick is driven by the freestanding Wasm slice, not
 * by x86 PE emulation. Residual host events (opaque callees, platform/IO) are
 * delivered through an explicit HostHandler; they must not re-enter the PE
 * emulator for the ported control-flow path.
 *
 * Node: load via filesystem path (default output/decomp/wasm-slice/...).
 * Browser: load via URL (default /@decomp/wasm/game-update-slice.wasm served
 * by scripts/serve.mjs) — never uses readFileSync in the browser.
 */

import {
  ABI_VERSION,
  BINARY_LAYOUT,
  CONSTANTS_LAYOUT,
  EVENTS_LAYOUT,
  GAME_OBJECT_MIN_SIZE,
  RUNTIME_INPUTS_LAYOUT,
  STATE_LAYOUT,
  UPDATE_CONTINUATION,
  readStruct,
  resumeGameUpdateFrameAuxUpdates,
  resumeGameUpdateFrameManagerUpdates,
  resumeGameUpdateGate1b83c,
  resumeGameUpdate92f1c0,
  resumeGameUpdateGenericPrompt,
  resumeGameUpdateItemOverlay,
  resumeGameUpdateMenuOpen,
  resumeGameUpdateMenuUpdate,
  resumeGameUpdateRoomTransitionEffect,
  resumeGameUpdateEnginePrefix,
  resumeGameUpdate98dba0PlayerWalk,
  resumeGameUpdateRoomClearNested,
  resumeGameUpdateRoomUpdateClear,
  resumeGameUpdateRoomUpdateHead,
  resumeGameUpdateRoomUpdatePrefix,
  resumeGameUpdateRoomUpdatePrefixB1,
  resumeGameUpdateRoomUpdatePrefixB2,
  resumeGameUpdateStageTransitionEffect,
  continueGameUpdateMenuGates,
  continueGameUpdateTimedTransition,
  resumeGameUpdate4257b0PassA,
  normalizeRuntimeInputsForLayout,
  overlayHostOwnedState,
  STATE_TO_BINARY_ALIASES,
  stepGameUpdateSlice,
  writeStruct,
} from "./game-update-model.mjs";
// Re-exported tree/string layout constants for the frame-path test tree
// builder (same values the exit family differential uses).
export {
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
  EXIT_MSVC_STRING_SSO_CAP,
};

import {
  PM_DEATH_HOST_VA_EMPTY_FATAL,
  PM_DEATH_HOST_VA_TRIGGER_DEATH,
  PM_DEATH_RESIDUAL_MONOLITHIC,
  PM_DEATH_RESIDUAL_NONE,
  PM_DEATH_RESIDUAL_WALK,
  PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
  PM_INTENSITY_SFX_ID,
  pmDeathDualZeroGate,
  pmDeathEligibleCount,
  pmDeathEligibleMask,
  pmDeathPlayerEligiblePack,
  pmDeathPlanFromPlayers,
  pmDeathTriggerArg,
  pmDeathTriggerVa,
  pmDeathWalkPureComplete,
  pmDeathWireDecide,
  pmIntensityPlayFrameDelay,
  pmIntensityPlayLoop,
  pmIntensityPlayPan,
  pmIntensityPlayPitch,
  pmIntensitySfxId,
} from "./player-manager-update-pure-model.mjs";
import {
  frameOpaque409030NeedsHost,
  frameOpaque409030PairNeedsHost,
  frameOpaque409030ResidualPlan,
  frameOpaque40add0BitResult,
  frameOpaque40add0NeedsHost,
  frameOpaque4212c0Secondary3AfterProbeFalse,
  frameOpaque4257b0PassANeedsHost,
  frameOpaque4257b0PassBNeedsHostRecaptured,
  frameOpaque4257b0ListCountFromBounds,
  FRAME_OPAQUE_4257B0_LIST_RECEIVER_OFF,
  FRAME_OPAQUE_4257B0_LIST_BEGIN_OFF,
  FRAME_OPAQUE_4257B0_LIST_END_OFF,
  FRAME_OPAQUE_HOST_6A80F0_VA,
  FRAME_OPAQUE_HOST_864C30_VA,
  FRAME_OPAQUE_HOST_874910_VA,
  FRAME_OPAQUE_HOST_90B100_VA,
  FRAME_OPAQUE_HOST_956110_VA,
  FRAME_OPAQUE_HOST_98DBA0_VA,
  FRAME_OPAQUE_HOST_A20390_VA,
  FRAME_OPAQUE_HOST_A20940_VA,
  FRAME_OPAQUE_HOST_ASSERT_LOG_VA,
  FRAME_OPAQUE_HOST_746560_VA,
  frameOpaque864c30CapabilityGate,
  frameOpaque864c30ResidualPlan,
  frameOpaque864c30ResultFromSamples,
  frameOpaque956110ResidualPlan,
  frameOpaque956110ResultFromSamples,
  frameOpaque98dba0Bvar2ApplyFromProbes,
  frameOpaque98dba0Bvar2CounterStep,
  frameOpaque98dba0EmptyFatalNeeded,
  frameOpaque98dba0TimerNeedsHost,
  frameOpaque98dba0TimerStep,
  frameOpaque98dba0WalkNeeded,
  frameOpaque98dba0WalkResidualPlan,
} from "./frame-opaque-pure-model.mjs";
import {
  ROOM_AMBIENT_824A70_A1_ARG,
  ROOM_AMBIENT_824A70_ANM_DATA_PTR,
  ROOM_AMBIENT_824A70_ANIM_COUNT_OFF,
  ROOM_AMBIENT_824A70_A2_THIS_OFF,
  ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF,
  ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF,
  ROOM_AMBIENT_824A70_EFFECT_TYPE,
  ROOM_AMBIENT_824A70_EFFECT_VARIANT,
  ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF,
  ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL,
  ROOM_AMBIENT_824A70_HOST_VA_A0,
  ROOM_AMBIENT_824A70_HOST_VA_A0_SITE,
  ROOM_AMBIENT_824A70_HOST_VA_A1,
  ROOM_AMBIENT_824A70_HOST_VA_A1_SITE,
  ROOM_AMBIENT_824A70_HOST_VA_A2,
  ROOM_AMBIENT_824A70_HOST_VA_A2_SITE,
  ROOM_AMBIENT_824A70_HOST_VA_CREATE,
  ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE,
  ROOM_AMBIENT_824A70_HOST_VA_CREATE_START,
  ROOM_AMBIENT_824A70_HOST_VA_GETLAYER,
  ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE,
  ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE,
  ROOM_AMBIENT_824A70_LAYER_COLOR_OFF,
  ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF,
  ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF,
  ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF,
  ROOM_AMBIENT_824A70_LAYER_INDEX,
  ROOM_AMBIENT_824A70_VCALL_OFF,
  ROOM_B1_HOST_VA_CLEANUP,
  ROOM_B1_HOST_VA_OWNER,
  ROOM_B1_HOST_VA_POSITION,
  ROOM_B1_HOST_VA_POST_BIND,
  ROOM_B1_HOST_VA_QUALITY,
  ROOM_B1_HOST_VA_SFX,
  ROOM_B1_HOST_VA_SFX_PLAY,
  ROOM_B1_HOST_VA_SFX_PRE,
  ROOM_B1_HOST_VA_SHUFFLE_ASSIGN,
  ROOM_B1_HOST_VA_SHUFFLE_COPY,
  ROOM_B1_HOST_VA_SHUFFLE_DTOR,
  ROOM_B1_HOST_VA_SPAWN,
  ROOM_B1_HOST_VA_SPAWN_SETUP,
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
  ROOM_B20_FLAG_CLEAR_MASK,
  ROOM_B20_HOST_VA_COS,
  ROOM_B20_HOST_VA_DEALLOCATE,
  ROOM_B20_HOST_VA_EPILOGUE,
  ROOM_B20_HOST_VA_FLAG_CLEAR,
  ROOM_B20_HOST_VA_GENRAND,
  ROOM_B20_HOST_VA_LIST_TEST,
  ROOM_B20_HOST_VA_PASS1,
  ROOM_B20_HOST_VA_PASS2,
  ROOM_B20_HOST_VA_POS_PACK,
  ROOM_B20_HOST_VA_SIN,
  ROOM_B20_HOST_VA_SPAWN,
  ROOM_B20_HOST_VA_VECTOR_PUSH,
  ROOM_B20_LIST_BEGIN_VA,
  ROOM_B20_LIST_CAP_VA,
  ROOM_B20_LIST_END_VA,
  ROOM_B20_PAIR_X_TYPES,
  ROOM_B20_PAIR_Y_TYPE,
  ROOM_B20_PASS1_TYPE_A,
  ROOM_B20_PASS1_TYPE_B,
  ROOM_B20_PASS1_TYPE_C,
  ROOM_B20_PASS1_TYPE_D,
  ROOM_B20_RESIDUAL_HOST_TRAIL,
  ROOM_B20_RESIDUAL_MONOLITHIC,
  ROOM_B20_RESIDUAL_NONE,
  ROOM_B20_SPAWN_FLAG_BIT_80,
  roomAmbient824a70A2ThisPtr,
  roomAmbient824a70BodyAnimFrameApplyNeeded,
  roomAmbient824a70BodyAnimFrameClearNeeded,
  roomAmbient824a70BodyAnimFramePosts,
  roomAmbient824a70BodyColor,
  roomAmbient824a70BodyFlagBit,
  roomAmbient824a70BodyGenrandLoopPosts,
  roomAmbient824a70BodyLayerColorPads,
  roomAmbient824a70BodyLayerColorPlan,
  roomAmbient824a70BodyLayerColorWriteNeeded,
  roomAmbient824a70BodyLoopStep,
  roomAmbient824a70BodyPosAxis,
  roomAmbient824a70BodyPosYFinal,
  roomAmbient824a70CreateArgsPlan,
  roomAmbient824a70CreateHostGates,
  roomAmbient824a70EntityAnm2Ptr,
  roomAmbient824a70BodyScale,
  roomAmbient824a70BodyUnitFloat,
  roomAmbient824a70BodyYOverride,
  roomAmbient824a70BodyYOverrideApplies,
  roomAmbient824a70BodyZ,
  roomAmbient824a70GenrandStreamPlan,
  roomAmbient824a70HostVaGenrand,
  roomAmbient824a70HostVaR0,
  ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP,
  ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP,
  roomB1CornerIndices,
  roomB1EntityPostSpawnMark,
  roomB1FlagOr80000,
  roomB1SfxId,
  roomB1SfxPlayFrameDelay,
  roomB1SfxPlayLoop,
  roomB1SfxPlayPan,
  roomB1SfxPlayPitch,
  roomB1SfxPlayVolume,
  roomB1SpawnIterPlan,
  roomB18EntityAction,
  roomB18EntityIsType5,
  roomB18EntityPathBCandidate,
  roomB18EntityType1ModeGate,
  roomB18EntityTypeInRange,
  roomB18ListContinue,
  roomB18ListEmpty,
  roomB18NeedsEntityWalkHost,
  roomB18PathBNeedsHost,
  roomB18ResidualPlan,
  roomB18WireDecide,
  roomB19CellCount,
  roomB19CellLoopContinue,
  roomB19CellLoopEnter,
  roomB19CollisionByte,
  roomB19EntityIsMarkCandidate,
  roomB19EntitySecondaryEligible,
  roomB19GridIndexValid,
  roomB19ListContinue,
  roomB19ListEmpty,
  roomB19NeedsPathRebuildHost,
  roomB19ResidualPlan,
  roomB19WireDecide,
  roomB19WorldToGridIndex,
  roomB19WorldToGridX,
  roomB19WorldToGridY,
  roomB20ChainContinue,
  roomB20EntityIsFlagged,
  roomB20EntityIsPairX,
  roomB20EntityIsPairY,
  roomB20FlagClear4000,
  roomB20FlagOr4000,
  roomB20FlaggedMultispawnEnter,
  roomB20ListContinue,
  roomB20ListCount,
  roomB20ListEmpty,
  roomB20NeedsTrailHost,
  roomB20PairXLeft,
  roomB20PairXRight,
  roomB20PairYDown,
  roomB20PairYUp,
  roomB20Pass1TypeMatch,
  roomB20Pass2Action,
  roomB20ResidualPlan,
  roomB20SpawnFlagOr80,
  roomB20WireDecide,
  roomTailmidNeedsCurseHost,
  roomTailmidCurseFlagOr4000,
  roomTailmidCurseEffectType,
  roomTailmidCurseEffectVariant,
  roomTailmidCursePosVecPtr,
  roomTailmidCurseCenters,
  roomTailmidCurseDeltas,
  roomTailmid801ee0IsGreedMode,
  roomTailmid801ee0NeedsTimerResetHost,
  roomTailmid801ee0NeedsSpawnWaveHost,
  roomTailmid801ee0NeedsSpecialHost,
  roomTailmid801ee0TimerSet13,
  roomTailmid801ee0DescClearBit40,
  roomTailmid801ee0GameFlagOr1000,
  roomTailmid800500EarlySkip,
  roomTailmidResidualPlan,
  roomTailmidWireDecide,
  ROOM_TAILMID_HOST_VA_GATE,
  ROOM_TAILMID_HOST_VA_ISPAUSED,
  ROOM_TAILMID_HOST_VA_CURSE,
  ROOM_TAILMID_HOST_VA_CURSE_GENRAND,
  ROOM_TAILMID_HOST_VA_CURSE_GETPLAYER,
  ROOM_TAILMID_HOST_VA_CURSE_CREATE,
  ROOM_TAILMID_HOST_VA_CURSE_SQRT,
  ROOM_TAILMID_HOST_VA_801EE0,
  ROOM_TAILMID_HOST_VA_SPAWN_WAVE,
  ROOM_TAILMID_HOST_VA_MUSIC,
  ROOM_TAILMID_HOST_VA_TRIGGER_OUTPUT,
  ROOM_TAILMID_HOST_VA_SFX_PRE,
  ROOM_TAILMID_HOST_VA_SFX_PLAY,
  ROOM_TAILMID_HOST_VA_800500,
  ROOM_TAILMID_HOST_VA_NEXT,
  ROOM_TAILMID_FRAG_NONE,
  ROOM_TAILMID_FRAG_HOST,
  ROOM_TAILMID_FRAG_MONOLITHIC,
  ROOM_TAILMID_RESIDUAL_NONE,
  ROOM_TAILMID_RESIDUAL_HOST,
  ROOM_TAILMID_RESIDUAL_MONOLITHIC,
  ROOM_TAILMID_CURSE_EFFECT_TYPE,
  ROOM_TAILMID_CURSE_EFFECT_VARIANT,
  ROOM_TAILMID_CURSE_POS_VEC_PTR,
  ROOM_TAILMID_SFX_ID,
  ROOM_TAILMID_MUSIC_ID,
  roomB3B7WireDecide,
  roomB3B7ResidualPlan,
  ROOM_B3B7_RESIDUAL_HOST,
  ROOM_B3B7_RESIDUAL_MONOLITHIC,
  ROOM_B3_HOST_VA_START,
  ROOM_B3_HOST_VA_OWNER,
  ROOM_B3_HOST_VA_CHALLENGE,
  ROOM_B3_HOST_VA_CHALLENGE_BODY,
  ROOM_B3_HOST_VA_TE_CALL,
  ROOM_B3B7_HOST_VA_NEXT,
  roomB9B11WireDecide,
  roomB9B11ResidualPlan,
  ROOM_B9B11_RESIDUAL_ALWAYS_HOST,
  ROOM_B9B11_RESIDUAL_MONOLITHIC,
  ROOM_B9B11_HOST_VA_B9_START,
  ROOM_B9B11_HOST_VA_QUERY,
  ROOM_B9B11_HOST_VA_B10_START,
  ROOM_B9B11_HOST_VA_FATAL,
  ROOM_B9B11_HOST_VA_B11_START,
  ROOM_B9B11_HOST_VA_B12_START,
} from "./room-pure-model.mjs";
// Wave-2 frame-path roots: ProcessInput pre-poll (ABI 25), Exit root
// (ABI 35) map-walk continuation, playerhud v17 UpdateHearts call plan,
// and the log v5 shared level-gate (residual log edge). All JS oracles
// are the separately-reasoned family models; the wasm-backed adapters
// below drive the SAME exports the family tests differential-verify.
import {
  playerHudUpdateHeartsCallPlan,
  playerHudUpdateHeartsUsesTwin,
  PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS,
  PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
  PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF,
  PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF,
  PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
  PLAYERHUD_UPDATE_HEARTS_ARG_TWIN,
} from "./playerhud-post-update-pure-model.mjs";
import {
  logEmitPlan,
  LOG_PURE_ABI_VERSION,
} from "./log-pure-model.mjs";
import {
  managerPrepollState4StoreNeeded,
  managerPrepollG1Needed,
  managerPrepollG2Needed,
  managerPrepollHostCNeeded,
  managerPrepollState3TransitionNeeded,
  managerPrepollG3Needed,
  managerPrepollState5TransitionNeeded,
  managerPrepollArmSelect,
  managerPrepollCopyBlockNeeded,
  managerPrepollG4Needed,
  managerPrepollLogNeeded,
  managerPrepollNightmareArg,
  managerPrepollGameB0Next,
  PREPOLL_STATE_OFS,
  PREPOLL_HISTORY_OFS,
  PREPOLL_G1_OFS,
  PREPOLL_G2_OFS,
  PREPOLL_G3_OFS,
  PREPOLL_G4_OFS,
  PREPOLL_CUTSCENE_ID_OFS,
  PREPOLL_COPY_SLOT_INDEX_OFS,
  PREPOLL_COPY_SRC_BASE,
  PREPOLL_COPY_SRC_DW,
  PREPOLL_COPY_STRIDE,
  PREPOLL_COPY_DST_CORE,
  PREPOLL_COPY_DST_DW,
  PREPOLL_COPY_DST_EXT,
  PREPOLL_COPY_EXT_FROM_OFS,
  PREPOLL_COPY_FLAG_OFS,
  PREPOLL_COPY_FLAG_VALUE,
  PREPOLL_GAME_STORE_BASE_OFS,
  PREPOLL_GAME_STORE_B4_OFS,
  PREPOLL_GAME_STORE_B8_OFS,
  PREPOLL_GAME_STORE_BC_OFS,
  PREPOLL_GAME_STORE_B8_BITS,
  PREPOLL_GAME_STORE_BC_VALUE,
  PREPOLL_STATE3ARM_BYTE_OFS,
  PREPOLL_PREDISPATCH_RECV_OFS,
  PREPOLL_STATE5_RECV_OFS,
  PREPOLL_CROSSFADE_RECV_OFS,
  PREPOLL_CROSSFADE_MUSIC_ID,
  PREPOLL_CROSSFADE_RATE_BITS,
  PREPOLL_STATE4_VALUE,
  PREPOLL_STATE3_VALUE,
  PREPOLL_STATE5_VALUE,
  PREPOLL_ARM_POLL,
  PREPOLL_ARM_STATE3,
  PREPOLL_ARM_STATE5,
  PREPOLL_HOST_A_VA,
  PREPOLL_HOST_B_VA,
  PREPOLL_HOST_C_VA,
  PREPOLL_HOST_D_VA,
  PREPOLL_HOST_E_VA,
  PREPOLL_HOST_F_VA,
  PREPOLL_HOST_G_VA,
  PREPOLL_HOST_G_ARG,
  PREPOLL_LOG_VA,
  PREPOLL_LOG_LEVEL,
  PREPOLL_LOG_MSG_VA,
  PREPOLL_HOST_H_VA,
} from "./process-input-pure-model.mjs";
import {
  exitRootPlan,
  exitRootMapWalkPlan,
  exitRootMapWalkFlagActive,
  exitRootMapWalkElemHostThis,
  exitRootMapWalkFlagAddr,
  exitRootMapWalkNext,
  EXIT_ROOT_EVENT_CAP,
  EXIT_ROOT_EVENT_HOST,
  EXIT_ROOT_EVENT_PURE,
  EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP,
  EXIT_ROOT_EVENT_MAP_WALK,
  EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
  EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST,
  EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR,
  EXIT_ROOT_MAP_WALK_ELEM_HOST_VA,
  EXIT_ROOT_MAP_WALK_GLOBAL_VA,
  EXIT_ROOT_MAP_WALK_FIND_VA,
  EXIT_ROOT_MAP_WALK_EVENT_CAP,
  EXIT_ROOT_MAP_WALK_NODE_CAP,
  EXIT_MAP_NODE_KEY_OFF,
  EXIT_MAP_NODE_FLAG_OFF,
  EXIT_MAP_NODE_BEGIN_OFF,
  EXIT_MAP_NODE_END_OFF,
  EXIT_MAP_ELEM_STRIDE,
  EXIT_MAP_ELEM_HOST_OFF,
  EXIT_MAP_ROOT_FROM_SENTINEL_OFF,
  EXIT_TREE_LEFT_OFF,
  EXIT_TREE_PARENT_OFF,
  EXIT_TREE_RIGHT_OFF,
  EXIT_TREE_ISNIL_OFF,
  EXIT_MSVC_STRING_SIZE_OFF,
  EXIT_MSVC_STRING_CAP_OFF,
  EXIT_MSVC_STRING_SSO_CAP,
  EXIT_ROOT_MAP_BASE_OFF,
  EXIT_PURE_ABI_VERSION,
} from "./exit-pure-model.mjs";
import {
  pmSfxEntryGate,
  PM_SFX_GATE_NO_SAMPLES,
  PM_SFX_WARN_LOG_LEVEL,
  PM_SFX_WARN_LOG_STR_VA,
  PM_SFX_WARN_LOG_VA,
} from "./player-manager-update-pure-model.mjs";
import {
  normalizePlayerHudSlots,
  PLAYER_HUD_MAX_SLOTS,
} from "./game-update-model.mjs";

// Multi-root pure-helper wiring: primary roots (Render/ProcessInput/Exit/
// LuaEngine) plus companion families (Room, frame-opaque, frame-effect,
// HUD post-update, PlayerHUD, PlayerManager, room-transition-engine).
// Re-exported so browser bridge and tests load one module path.
// frame-path-roots.mjs must not import this file (ESM cycle).
export {
  PORT_ROOT_IDS,
  PURE_HELPER_MODULES,
  FRAME_PATH_ROOT_ID,
  FRAME_PATH_ROOTS,
  FRAME_PATH_ROOT_BY_ID,
  FRAME_PATH_ROOT_BY_PURE_NAME,
  FRAME_PATH_PURE_ROOT_IDS,
  FRAME_PATH_COMPANION_PURE_IDS,
  ALL_PURE_HELPER_IDS,
  MULTI_ROOT_PLATFORM_IO_KINDS,
  PLATFORM_IO_RESIDUAL_REGISTRY,
  allFramePathRootsNative,
  createMultiRootFrameSession,
  createMultiRootFrameSessionAsync,
  isPlatformIoResidualKind,
  loadFramePathRoots,
  loadPureHelperWasm,
  multiRootUsesX86Emulation,
  probeAvailablePureHelpers,
  probePureHelperAvailability,
  probePureHelperWasm,
  resolvePureHelperSpec,
  resolvePureHelperWasmPath,
  selectFramePathRoots,
} from "./frame-path-roots.mjs";

// ProcessInput a1f280 residual pure-post plan (freestanding; no Update HostHandler
// kind yet). Re-export for multi-root residual documentation / future pin.
export {
  PROCESS_INPUT_RESIDUAL_PLAN_VERSION,
  PROCESS_INPUT_RESIDUAL_PURE_ABI,
  PROCESS_INPUT_A1F280_RESIDUAL_NOTE,
  A1F280_RESIDUAL_NONE,
  A1F280_RESIDUAL_READY_VCALL,
  A1F280_RESIDUAL_FILL_AXIS,
  A1F280_RESIDUAL_ACTION_QUERY,
  A1F280_RESIDUAL_RUMBLE,
  A1F280_RESIDUAL_MONOLITHIC,
  A1F280_RESIDUAL_KINDS,
  A1F280_PURE_POSTS_PE_ORDER,
  A1F280_PURE_HELPER_BY_POST,
  A1F280_PURE_HELPER_NAMES,
  A1F280_HOST_VA_ENTRY,
  A1F280_HOST_VA_READY,
  A1F280_HOST_VA_FILL_PAIR0,
  A1F280_HOST_VA_FILL_PAIR1,
  A1F280_HOST_VA_AXIS_PAIR0,
  A1F280_HOST_VA_AXIS_PAIR1,
  A1F280_HOST_VA_ACTION_QUERY,
  A1F280_HOST_VA_RUMBLE,
  a1f280HostVas,
  a1f280PurePostsInterleaveDoc,
  a1f280PurePostsFromEvent,
  a1f280ResidualLabel,
  a1f280ResidualPlan,
  applyA1f280VcallGatePurePosts,
  normalizeA1f280GateSamples,
} from "./process-input-residual.mjs";

/** H5 FUN_00824a70 host residual entry: first Isaac::genrand_int32 @ 0x00824bb3. */
const ROOM_AMBIENT_824A70_HOST_VA = 0x00824bb3;

/**
 * PM1 death residual pure helpers (player-manager-update pure ABI v4 freestanding).
 * Host still owns Entity_Player::TriggerDeath(false) @ 0x007a1090.
 * PE order: dual-zero gate → per-player eligibility → TriggerDeath host × eligible.
 */
export const PM_DEATH_PURE_HELPER_NAMES = Object.freeze([
  "pmDeathDualZeroGate",
  "pmDeathAnimIdle",
  "pmDeathPlayerEligible",
  "pmDeathPlayerEligiblePack",
  "pmDeathEligibleCount",
  "pmDeathEligibleMask",
  "pmDeathWalkPureComplete",
  "pmDeathPlanFromPlayers",
  "pmDeathWireDecide",
  "pmDeathTriggerVa",
  "pmDeathTriggerArg",
]);

/** PE-ordered pure-post slots before host TriggerDeath (doc when no samples). */
export const PM_DEATH_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "PM0_dual_zero",
    posts: Object.freeze(["dual_zero_gate"]),
    pureHelpers: Object.freeze(["pmDeathDualZeroGate"]),
  }),
  Object.freeze({
    slot: "PM1_eligibility",
    posts: Object.freeze([
      "anim_idle",
      "player_eligible",
      "eligible_count",
      "eligible_mask",
    ]),
    pureHelpers: Object.freeze([
      "pmDeathAnimIdle",
      "pmDeathPlayerEligible",
      "pmDeathPlayerEligiblePack",
      "pmDeathEligibleCount",
      "pmDeathEligibleMask",
    ]),
  }),
  Object.freeze({
    slot: "PM1_wire_decide",
    posts: Object.freeze(["wire_decide", "plan_from_players", "walk_pure_complete"]),
    pureHelpers: Object.freeze([
      "pmDeathWireDecide",
      "pmDeathPlanFromPlayers",
      "pmDeathWalkPureComplete",
    ]),
  }),
  Object.freeze({
    slot: "PM1_host_constants",
    posts: Object.freeze(["trigger_va", "trigger_arg"]),
    pureHelpers: Object.freeze(["pmDeathTriggerVa", "pmDeathTriggerArg"]),
  }),
]);

/**
 * Normalize death player packs from HostHandler event aliases.
 * Accepts event.players | deathPlayers | packs | samples (object array).
 */
export function normalizePmDeathPlayers(samples) {
  if (!Array.isArray(samples) || samples.length === 0) return null;
  const out = [];
  for (const p of samples) {
    if (!p || typeof p !== "object") return null;
    out.push({
      dead173: p.dead173 ?? p.dead_173 ?? 0,
      anim7c: p.anim7c ?? p.anim_7c ?? 0,
      anim8c: p.anim8c ?? p.anim_8c ?? 0,
      twinNull: p.twinNull ?? p.twin_null ?? 0,
      twinAnim7c: p.twinAnim7c ?? p.twin_anim_7c ?? 0,
      twinAnim8c: p.twinAnim8c ?? p.twin_anim_8c ?? 0,
    });
  }
  return out.length > 0 ? out : null;
}

/**
 * Apply freestanding PM0/PM1 death pure plan (wire_decide + eligibility).
 * Host still owns TriggerDeath(false) @ 0x007a1090 for WALK/MONOLITHIC.
 *
 * @param {object} opts
 * @param {number} [opts.gate1b83c]
 * @param {number} [opts.gate1ba78]
 * @param {number} [opts.playerCount]
 * @param {boolean|number} [opts.blobReady]
 * @param {Array<object>} [opts.players]
 * @returns {object|null} frozen purePostsApplied plan, or null if no packs
 */
export function applyPmDeathPurePosts(opts = {}) {
  const players = normalizePmDeathPlayers(
    opts.players ?? opts.deathPlayers ?? opts.packs ?? opts.samples ?? null,
  );
  if (!players) return null;

  const gate1b83c = opts.gate1b83c ?? opts.gate_1b83c ?? 0;
  const gate1ba78 = opts.gate1ba78 ?? opts.gate_1ba78 ?? 0;
  const playerCount =
    opts.playerCount !== undefined && opts.playerCount !== null
      ? opts.playerCount | 0
      : opts.player_count !== undefined && opts.player_count !== null
        ? opts.player_count | 0
        : players.length;
  const blobReady =
    opts.blobReady !== undefined && opts.blobReady !== null
      ? !!opts.blobReady
      : opts.blob_ready !== undefined && opts.blob_ready !== null
        ? !!opts.blob_ready
        : true;

  const dualZero = pmDeathDualZeroGate(gate1b83c, gate1ba78);
  const plan = pmDeathWireDecide({
    gate1b83c,
    gate1ba78,
    playerCount,
    blobReady,
    players,
  });
  const planFromPlayers = pmDeathPlanFromPlayers(gate1b83c, gate1ba78, players);
  const n = Math.min(playerCount, players.length);
  const slice = players.slice(0, n);
  const eligibility = slice.map((p, index) =>
    Object.freeze({
      index,
      eligible: pmDeathPlayerEligiblePack(p) ? 1 : 0,
      dead173: p.dead173 | 0,
      anim7c: p.anim7c | 0,
      anim8c: p.anim8c | 0,
      twinNull: p.twinNull | 0,
      twinAnim7c: p.twinAnim7c | 0,
      twinAnim8c: p.twinAnim8c | 0,
    }),
  );

  return Object.freeze({
    dualZero: dualZero ? 1 : 0,
    residualKind: plan.residualKind | 0,
    pureComplete: !!plan.pureComplete,
    hostNeeded: !!plan.hostNeeded,
    deathWalkGate: !!plan.deathWalkGate,
    pm1Pure: !!plan.pm1Pure,
    eligibleCount: plan.eligibleCount | 0,
    eligibleMask: plan.eligibleMask >>> 0,
    triggerDeathVa: plan.triggerDeathVa >>> 0,
    triggerArg: plan.triggerArg | 0,
    walkPureComplete: pmDeathWalkPureComplete(plan.residualKind) ? 1 : 0,
    // plan_from_players ignores MONOLITHIC paths (blob incomplete / over MAX).
    planFromPlayersKind: planFromPlayers.residualKind | 0,
    planFromPlayersEligible: planFromPlayers.eligibleCount | 0,
    eligibleCountDirect: pmDeathEligibleCount(slice),
    eligibleMaskDirect: pmDeathEligibleMask(slice) >>> 0,
    playerEligibility: Object.freeze(eligibility),
    triggerVaHelper: pmDeathTriggerVa() >>> 0,
    triggerArgHelper: pmDeathTriggerArg() | 0,
  });
}

/**
 * Shared PM1 death residual pure-post path.
 * Samples: event.players | deathPlayers | packs | samples.
 * Gates/count: event.gate1b83c / gate1ba78 / playerCount / blobReady.
 */
function pmDeathPurePostsFromEvent(event) {
  const samples =
    event?.players ??
    event?.deathPlayers ??
    event?.packs ??
    event?.samples ??
    null;
  const players = normalizePmDeathPlayers(samples);
  const hasSamples = Array.isArray(players) && players.length > 0;
  const purePostsApplied = hasSamples
    ? applyPmDeathPurePosts({
        gate1b83c: event?.gate1b83c ?? event?.gate_1b83c,
        gate1ba78: event?.gate1ba78 ?? event?.gate_1ba78,
        playerCount: event?.playerCount ?? event?.player_count,
        blobReady: event?.blobReady ?? event?.blob_ready,
        players,
      })
    : null;
  return {
    purePostsPeOrder: PM_DEATH_PURE_POSTS_PE_ORDER,
    pureHelperNames: PM_DEATH_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasSamples,
  };
}

function pmDeathHostVas() {
  return {
    triggerDeath: PM_DEATH_HOST_VA_TRIGGER_DEATH,
    emptyFatal: PM_DEATH_HOST_VA_EMPTY_FATAL,
    triggerArg: PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
  };
}

function pmDeathResidualLabel(applied) {
  if (!applied) return "pm1-death-host";
  if (applied.pureComplete) return "pm1-death-pure-complete";
  if ((applied.residualKind | 0) === PM_DEATH_RESIDUAL_WALK) {
    return "pm1-death-walk-host";
  }
  if ((applied.residualKind | 0) === PM_DEATH_RESIDUAL_MONOLITHIC) {
    return "pm1-death-monolithic";
  }
  return "pm1-death-host";
}

/**
 * B18 entity residual pure helpers (room pure ABI v29 freestanding).
 * Host still owns type-5 body @ 0x006e17c0, RTTI cast @ 0x00af08b1, and
 * path-B body @ 0x006da530. Outer flag clear Room+0x7894=0 is already pure
 * on Update resume_room_update_head; residual walk excludes that store.
 */
export const B18_ENTITY_PURE_HELPER_NAMES = Object.freeze([
  "roomB18NeedsEntityWalkHost",
  "roomB18ListEmpty",
  "roomB18ListContinue",
  "roomB18EntityIsType5",
  "roomB18EntityType1ModeGate",
  "roomB18EntityTypeInRange",
  "roomB18EntityPathBCandidate",
  "roomB18EntityAction",
  "roomB18PathBNeedsHost",
  "roomB18ResidualPlan",
  "roomB18WireDecide",
]);

/** PE-ordered pure-post slots before type-5 / RTTI / path-B host bodies. */
export const B18_ENTITY_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "B18_outer_gate",
    posts: Object.freeze(["needs_entity_walk_host"]),
    pureHelpers: Object.freeze(["roomB18NeedsEntityWalkHost"]),
  }),
  Object.freeze({
    slot: "B18_list_cf",
    posts: Object.freeze(["list_empty", "list_continue"]),
    pureHelpers: Object.freeze(["roomB18ListEmpty", "roomB18ListContinue"]),
  }),
  Object.freeze({
    slot: "B18_type_route",
    posts: Object.freeze([
      "entity_is_type5",
      "type1_mode_gate",
      "type_in_range",
      "path_b_candidate",
      "entity_action",
    ]),
    pureHelpers: Object.freeze([
      "roomB18EntityIsType5",
      "roomB18EntityType1ModeGate",
      "roomB18EntityTypeInRange",
      "roomB18EntityPathBCandidate",
      "roomB18EntityAction",
    ]),
  }),
  Object.freeze({
    slot: "B18_path_b_gate",
    posts: Object.freeze(["path_b_needs_host"]),
    pureHelpers: Object.freeze(["roomB18PathBNeedsHost"]),
  }),
  Object.freeze({
    slot: "B18_wire_decide",
    posts: Object.freeze(["residual_plan", "wire_decide"]),
    pureHelpers: Object.freeze(["roomB18ResidualPlan", "roomB18WireDecide"]),
  }),
]);

/**
 * Normalize B18 entity packs from HostHandler event aliases.
 * Accepts event.entities | entitySamples | packs | samples (object array).
 * Empty array is valid (empty-list pure-complete under open outer gate).
 */
export function normalizeB18Entities(samples) {
  if (!Array.isArray(samples)) return null;
  const out = [];
  for (const e of samples) {
    if (e === null || e === undefined) {
      out.push({ entityType28: 0, rttiCastResult: 0 });
      continue;
    }
    if (typeof e === "number") {
      out.push({ entityType28: e | 0, rttiCastResult: 0 });
      continue;
    }
    if (typeof e !== "object") return null;
    out.push({
      entityType28:
        e.entityType28 ??
        e.entity_type_28 ??
        e.type28 ??
        e.type_28 ??
        e.type ??
        e.entityType ??
        e.entity_type ??
        0,
      rttiCastResult:
        e.rttiCastResult ??
        e.rtti_cast_result ??
        e.rtti ??
        e.castResult ??
        e.cast_result ??
        0,
    });
  }
  return out;
}

/**
 * Apply freestanding B18 wire_decide + per-entity type-route pure plan.
 * Host still owns FUN_006e17c0 (type-5), __RTDynamicCast (RTTI), FUN_006da530
 * (path-B) for HOST_WALK / MONOLITHIC when actions require them.
 *
 * @param {object} opts
 * @param {number} [opts.flagReady]
 * @param {number} [opts.countReady]
 * @param {number} [opts.roomFlag7894]
 * @param {number} [opts.entityCount1264]
 * @param {number} [opts.timedTransitionCleanupMode]
 * @param {Array<object|number>} [opts.entities]
 * @returns {object} frozen purePostsApplied plan
 */
export function applyB18EntityPurePosts(opts = {}) {
  const entities = normalizeB18Entities(
    opts.entities ??
      opts.entitySamples ??
      opts.entity_samples ??
      opts.packs ??
      opts.samples ??
      null,
  );

  const roomFlag7894 =
    opts.roomFlag7894 ??
    opts.room_flag_7894 ??
    opts.flag7894 ??
    opts.flag ??
    0;
  const entityCount1264 =
    opts.entityCount1264 !== undefined && opts.entityCount1264 !== null
      ? opts.entityCount1264 >>> 0
      : opts.entity_count_1264 !== undefined && opts.entity_count_1264 !== null
        ? opts.entity_count_1264 >>> 0
        : opts.entityCount !== undefined && opts.entityCount !== null
          ? opts.entityCount >>> 0
          : entities
            ? entities.length >>> 0
            : 0;

  const flagReadyRaw = opts.flagReady ?? opts.flag_ready;
  const flagReady =
    flagReadyRaw !== undefined && flagReadyRaw !== null
      ? flagReadyRaw | 0
      : 1; // samples imply outer flag sparse is available

  const countReadyRaw = opts.countReady ?? opts.count_ready;
  const countReady =
    countReadyRaw !== undefined && countReadyRaw !== null
      ? countReadyRaw | 0
      : entities !== null ||
          opts.entityCount1264 !== undefined ||
          opts.entity_count_1264 !== undefined ||
          opts.entityCount !== undefined
        ? 1
        : 0;

  const mode =
    opts.timedTransitionCleanupMode ??
    opts.timed_transition_cleanup_mode ??
    opts.mode26614 ??
    opts.mode_26614 ??
    opts.gameMode26614 ??
    opts.game_mode_26614 ??
    opts.mode ??
    0;

  const plan = roomB18WireDecide(
    flagReady,
    countReady,
    roomFlag7894,
    entityCount1264,
  );
  const planFromResidual = roomB18ResidualPlan(roomFlag7894, entityCount1264);
  const outer = roomB18NeedsEntityWalkHost(roomFlag7894);
  const listEmpty = roomB18ListEmpty(entityCount1264);

  let type5HostCount = 0;
  let rttiCandidateCount = 0;
  let pathBHostCount = 0;
  let skipCount = 0;
  let entityActions = null;

  if (
    entities &&
    (plan.residualKind | 0) === ROOM_B18_RESIDUAL_HOST_WALK
  ) {
    const n = Math.min(entityCount1264 >>> 0, entities.length);
    const rows = [];
    for (let i = 0; i < n; i++) {
      const ent = entities[i];
      const type28 = ent.entityType28 | 0;
      const action = roomB18EntityAction(mode, type28) | 0;
      const isType5 = roomB18EntityIsType5(type28);
      const type1Mode = roomB18EntityType1ModeGate(mode, type28);
      const inRange = roomB18EntityTypeInRange(type28);
      const pathBCand = roomB18EntityPathBCandidate(mode, type28);
      const rtti = ent.rttiCastResult >>> 0;
      const pathBNeeds =
        action === ROOM_B18_ACTION_RTTI_CANDIDATE
          ? roomB18PathBNeedsHost(rtti)
          : 0;
      if (action === ROOM_B18_ACTION_TYPE5) type5HostCount++;
      else if (action === ROOM_B18_ACTION_RTTI_CANDIDATE) {
        rttiCandidateCount++;
        if (pathBNeeds) pathBHostCount++;
      } else {
        skipCount++;
      }
      rows.push(
        Object.freeze({
          index: i,
          entityType28: type28,
          action,
          isType5: isType5 | 0,
          type1ModeGate: type1Mode | 0,
          typeInRange: inRange | 0,
          pathBCandidate: pathBCand | 0,
          rttiCastResult: rtti,
          pathBNeedsHost: pathBNeeds | 0,
          listContinue: roomB18ListContinue(i, entityCount1264) | 0,
          hostType5: action === ROOM_B18_ACTION_TYPE5 ? 1 : 0,
          hostRtti: action === ROOM_B18_ACTION_RTTI_CANDIDATE ? 1 : 0,
          hostPathB: pathBNeeds | 0,
        }),
      );
    }
    entityActions = Object.freeze(rows);
  }

  const hostType5 = type5HostCount > 0 ? 1 : 0;
  const hostRtti = rttiCandidateCount > 0 ? 1 : 0;
  const hostPathB = pathBHostCount > 0 ? 1 : 0;
  // Whole walk host when HOST_WALK without per-entity packs, or MONOLITHIC.
  const hostEntityWalk =
    (plan.hostNeeded | 0) !== 0 &&
    ((plan.residualKind | 0) === ROOM_B18_RESIDUAL_HOST_WALK ||
      (plan.residualKind | 0) === ROOM_B18_RESIDUAL_MONOLITHIC)
      ? 1
      : 0;
  // Any type-5 / RTTI / path-B body still required under walk with packs.
  const hostTypeBodies =
    hostType5 || hostRtti || hostPathB || (hostEntityWalk && !entityActions)
      ? 1
      : 0;

  return Object.freeze({
    flagReady: flagReady | 0,
    countReady: countReady | 0,
    roomFlag7894: roomFlag7894 >>> 0,
    entityCount1264: entityCount1264 >>> 0,
    timedTransitionCleanupMode: mode | 0,
    outerGate: outer | 0,
    listEmpty: listEmpty | 0,
    residualKind: plan.residualKind | 0,
    pureComplete: (plan.pureComplete | 0) !== 0,
    hostNeeded: (plan.hostNeeded | 0) !== 0,
    needsHost: plan.needsHost | 0,
    planEntityCount: plan.entityCount >>> 0,
    planFromResidualKind: planFromResidual.residualKind | 0,
    type5HostCount: type5HostCount | 0,
    rttiCandidateCount: rttiCandidateCount | 0,
    pathBHostCount: pathBHostCount | 0,
    skipCount: skipCount | 0,
    hostType5,
    hostRtti,
    hostPathB,
    hostEntityWalk,
    hostTypeBodies,
    entityActions,
    hostVas: Object.freeze({
      flagTest: ROOM_B18_HOST_VA_FLAG_TEST,
      walkStart: ROOM_B18_HOST_VA_WALK_START,
      type5: ROOM_B18_HOST_VA_TYPE5,
      rtti: ROOM_B18_HOST_VA_RTTI,
      pathB: ROOM_B18_HOST_VA_PATH_B,
      flagClear: ROOM_B18_HOST_VA_FLAG_CLEAR,
      next: ROOM_B18_HOST_VA_NEXT,
    }),
    rttiPtrs: Object.freeze({
      src: ROOM_B18_RTTI_SRC_PTR,
      dst: ROOM_B18_RTTI_DST_PTR,
    }),
    actions: Object.freeze({
      skip: ROOM_B18_ACTION_SKIP,
      type5: ROOM_B18_ACTION_TYPE5,
      rttiCandidate: ROOM_B18_ACTION_RTTI_CANDIDATE,
    }),
    residualKinds: Object.freeze({
      none: ROOM_B18_RESIDUAL_NONE,
      pureComplete: ROOM_B18_RESIDUAL_PURE_COMPLETE,
      hostWalk: ROOM_B18_RESIDUAL_HOST_WALK,
      monolithic: ROOM_B18_RESIDUAL_MONOLITHIC,
    }),
  });
}

/**
 * Shared B18 entity residual pure-post path.
 * Samples: event.entities | entitySamples | packs | samples.
 * Wire inputs: roomFlag7894 / entityCount1264 / flagReady / countReady /
 * timedTransitionCleanupMode (Game+0x26614).
 */
function b18EntityPurePostsFromEvent(event) {
  const samples =
    event?.entities ??
    event?.entitySamples ??
    event?.entity_samples ??
    event?.packs ??
    event?.samples ??
    null;
  const hasEntityArray = Array.isArray(samples);
  const hasWireFields =
    event?.roomFlag7894 !== undefined ||
    event?.room_flag_7894 !== undefined ||
    event?.flag7894 !== undefined ||
    event?.flagReady !== undefined ||
    event?.flag_ready !== undefined ||
    event?.countReady !== undefined ||
    event?.count_ready !== undefined ||
    event?.entityCount1264 !== undefined ||
    event?.entity_count_1264 !== undefined ||
    event?.entityCount !== undefined;
  const hasSamples = hasEntityArray || hasWireFields;
  const purePostsApplied = hasSamples
    ? applyB18EntityPurePosts({
        flagReady: event?.flagReady ?? event?.flag_ready,
        countReady: event?.countReady ?? event?.count_ready,
        roomFlag7894:
          event?.roomFlag7894 ??
          event?.room_flag_7894 ??
          event?.flag7894 ??
          event?.flag,
        entityCount1264:
          event?.entityCount1264 ??
          event?.entity_count_1264 ??
          event?.entityCount,
        timedTransitionCleanupMode:
          event?.timedTransitionCleanupMode ??
          event?.timed_transition_cleanup_mode ??
          event?.mode26614 ??
          event?.mode_26614 ??
          event?.gameMode26614 ??
          event?.game_mode_26614 ??
          event?.mode,
        entities: hasEntityArray ? samples : null,
      })
    : null;
  return {
    purePostsPeOrder: B18_ENTITY_PURE_POSTS_PE_ORDER,
    pureHelperNames: B18_ENTITY_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasSamples,
  };
}

function b18EntityHostVas() {
  return {
    flagTest: ROOM_B18_HOST_VA_FLAG_TEST,
    walkStart: ROOM_B18_HOST_VA_WALK_START,
    type5: ROOM_B18_HOST_VA_TYPE5,
    rtti: ROOM_B18_HOST_VA_RTTI,
    pathB: ROOM_B18_HOST_VA_PATH_B,
    flagClear: ROOM_B18_HOST_VA_FLAG_CLEAR,
    next: ROOM_B18_HOST_VA_NEXT,
  };
}

function b18EntityResidualLabel(applied) {
  if (!applied) return "b18-entity-host";
  if (applied.pureComplete) return "b18-entity-pure-complete";
  if ((applied.residualKind | 0) === ROOM_B18_RESIDUAL_HOST_WALK) {
    return "b18-entity-walk-host";
  }
  if ((applied.residualKind | 0) === ROOM_B18_RESIDUAL_MONOLITHIC) {
    return "b18-entity-monolithic";
  }
  return "b18-entity-host";
}

/**
 * TailMid curse-suite residual pure helpers (room pure ABI v35+ freestanding).
 * Parent residual opaqueRoomUpdateTailMid always-emits on Update path; pure
 * posts classify curse / 801ee0 / 800500 fragments when samples land.
 * Host still owns Game::IsPaused, FUN_00820910 body, FUN_00801ee0 subcalls,
 * and FUN_00800500 body after early skip. Notes:
 * output/decomp/5129df723e64/section-notes/room-tailmid/
 */
export const TAILMID_PURE_HELPER_NAMES = Object.freeze([
  "roomTailmidNeedsCurseHost",
  "roomTailmidCurseFlagOr4000",
  "roomTailmidCurseEffectType",
  "roomTailmidCurseEffectVariant",
  "roomTailmidCursePosVecPtr",
  "roomTailmidCurseCenters",
  "roomTailmidCurseDeltas",
  "roomTailmid801ee0IsGreedMode",
  "roomTailmid801ee0NeedsTimerResetHost",
  "roomTailmid801ee0NeedsSpawnWaveHost",
  "roomTailmid801ee0NeedsSpecialHost",
  "roomTailmid801ee0TimerSet13",
  "roomTailmid801ee0DescClearBit40",
  "roomTailmid801ee0GameFlagOr1000",
  "roomTailmid800500EarlySkip",
  "roomTailmidResidualPlan",
  "roomTailmidWireDecide",
]);

/** PE-ordered pure-post slots inside TailMid residual. */
export const TAILMID_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "TailMid_curse_outer_gate",
    posts: Object.freeze(["needs_curse_host"]),
    pureHelpers: Object.freeze(["roomTailmidNeedsCurseHost"]),
  }),
  Object.freeze({
    slot: "TailMid_curse_posts",
    posts: Object.freeze([
      "curse_flag_or_4000",
      "curse_effect_type",
      "curse_effect_variant",
      "curse_pos_vec_ptr",
      "curse_centers",
      "curse_deltas",
    ]),
    pureHelpers: Object.freeze([
      "roomTailmidCurseFlagOr4000",
      "roomTailmidCurseEffectType",
      "roomTailmidCurseEffectVariant",
      "roomTailmidCursePosVecPtr",
      "roomTailmidCurseCenters",
      "roomTailmidCurseDeltas",
    ]),
  }),
  Object.freeze({
    slot: "TailMid_801ee0_gates",
    posts: Object.freeze([
      "is_greed_mode",
      "needs_timer_reset_host",
      "needs_spawn_wave_host",
      "needs_special_host",
      "timer_set_13",
      "desc_clear_bit40",
      "game_flag_or_1000",
    ]),
    pureHelpers: Object.freeze([
      "roomTailmid801ee0IsGreedMode",
      "roomTailmid801ee0NeedsTimerResetHost",
      "roomTailmid801ee0NeedsSpawnWaveHost",
      "roomTailmid801ee0NeedsSpecialHost",
      "roomTailmid801ee0TimerSet13",
      "roomTailmid801ee0DescClearBit40",
      "roomTailmid801ee0GameFlagOr1000",
    ]),
  }),
  Object.freeze({
    slot: "TailMid_800500_early",
    posts: Object.freeze(["early_skip"]),
    pureHelpers: Object.freeze(["roomTailmid800500EarlySkip"]),
  }),
  Object.freeze({
    slot: "TailMid_wire_decide",
    posts: Object.freeze(["residual_plan", "wire_decide"]),
    pureHelpers: Object.freeze(["roomTailmidResidualPlan", "roomTailmidWireDecide"]),
  }),
]);

/**
 * Apply freestanding TailMid wire_decide + pure posts when samples land.
 * Host still owns IsPaused sample, curse create/genrand, SpawnGreedModeWave,
 * Music/SFX/TriggerOutput, and 800500 body after early skip.
 *
 * @param {object} opts
 * @returns {object} frozen purePostsApplied plan
 */
export function applyTailmidPurePosts(opts = {}) {
  const gameFlags1839c =
    opts.gameFlags1839c ?? opts.game_flags_1839c ?? opts.flags1839c ?? 0;
  const roomDescFlags44 =
    opts.roomDescFlags44 ?? opts.room_desc_flags_44 ?? opts.descFlags44 ?? 0;
  const roomActiveByte0 =
    opts.roomActiveByte0 ?? opts.room_active_byte0 ?? opts.active ?? 0;
  const frame264f8 = opts.frame264f8 ?? opts.frame_264f8 ?? opts.frame ?? 0;
  const roomEntry11f0 =
    opts.roomEntry11f0 ?? opts.room_entry_11f0 ?? opts.entry11f0 ?? 0;
  const isPausedCurse =
    opts.isPausedCurse ?? opts.is_paused_curse ?? opts.isPaused ?? opts.paused ?? 0;
  const difficulty269c8 =
    opts.difficulty269c8 ?? opts.difficulty_269c8 ?? opts.difficulty ?? 0;
  const isPaused800500 =
    opts.isPaused800500 ?? opts.is_paused_800500 ?? isPausedCurse;
  const gate1b83c = opts.gate1b83c ?? opts.gate_1b83c ?? 0;

  const inputsReadyRaw = opts.inputsReady ?? opts.inputs_ready;
  const inputsReady =
    inputsReadyRaw !== undefined && inputsReadyRaw !== null
      ? inputsReadyRaw | 0
      : 1;

  const input = {
    gameFlags1839c: gameFlags1839c >>> 0,
    roomDescFlags44: roomDescFlags44 >>> 0,
    roomActiveByte0: roomActiveByte0 >>> 0,
    frame264f8: frame264f8 | 0,
    roomEntry11f0: roomEntry11f0 | 0,
    isPausedCurse: isPausedCurse >>> 0,
    difficulty269c8: difficulty269c8 | 0,
    isPaused800500: isPaused800500 >>> 0,
    gate1b83c: gate1b83c | 0,
  };

  const plan = roomTailmidWireDecide(inputsReady, input);
  const planFromResidual = roomTailmidResidualPlan(input);
  const needsCurse = roomTailmidNeedsCurseHost(
    input.gameFlags1839c,
    input.roomDescFlags44,
    input.roomActiveByte0,
    input.frame264f8,
    input.roomEntry11f0,
    input.isPausedCurse,
  );
  const earlySkip800500 = roomTailmid800500EarlySkip(
    input.isPaused800500,
    input.gate1b83c,
  );
  const greed = roomTailmid801ee0IsGreedMode(input.difficulty269c8);

  let cursePosts = null;
  if (needsCurse !== 0) {
    const descPost = roomTailmidCurseFlagOr4000(input.roomDescFlags44);
    const roomF14 = opts.roomF14 ?? opts.room_f14;
    const roomF18 = opts.roomF18 ?? opts.room_f18;
    const roomF1c = opts.roomF1c ?? opts.room_f1c;
    const roomF20 = opts.roomF20 ?? opts.room_f20;
    const playerX = opts.playerX ?? opts.player_x;
    const playerY = opts.playerY ?? opts.player_y;
    let centers = null;
    let deltas = null;
    if (
      roomF14 !== undefined &&
      roomF18 !== undefined &&
      roomF1c !== undefined &&
      roomF20 !== undefined
    ) {
      centers = roomTailmidCurseCenters(roomF14, roomF18, roomF1c, roomF20);
      if (playerX !== undefined && playerY !== undefined) {
        deltas = roomTailmidCurseDeltas(
          playerX,
          playerY,
          centers.centerX,
          centers.centerY,
        );
      }
    }
    cursePosts = Object.freeze({
      descFlagsPost: descPost >>> 0,
      effectType: roomTailmidCurseEffectType(),
      effectVariant: roomTailmidCurseEffectVariant(),
      posVecPtr: roomTailmidCursePosVecPtr(),
      centers,
      deltas,
    });
  }

  let posts801ee0 = null;
  if (greed !== 0) {
    const postTimer =
      opts.postTimer723c ?? opts.post_timer_723c ?? opts.timer723c ?? null;
    const preTimer = opts.preTimer723c ?? opts.pre_timer_723c ?? null;
    const bossCount = opts.bossCount ?? opts.boss_count ?? null;
    const stage0 = opts.stage0 ?? opts.stage ?? null;
    const roomType8 = opts.roomType8 ?? opts.room_type_8 ?? opts.roomType ?? null;
    const playerCount = opts.playerCount ?? opts.player_count ?? null;
    posts801ee0 = Object.freeze({
      isGreed: 1,
      timerSet13: roomTailmid801ee0TimerSet13(),
      needsTimerReset:
        postTimer !== null && bossCount !== null
          ? roomTailmid801ee0NeedsTimerResetHost(postTimer, bossCount)
          : null,
      needsSpawnWave:
        postTimer !== null && preTimer !== null
          ? roomTailmid801ee0NeedsSpawnWaveHost(postTimer, preTimer)
          : null,
      needsSpecial:
        stage0 !== null &&
        roomType8 !== null &&
        playerCount !== null
          ? roomTailmid801ee0NeedsSpecialHost(
              stage0,
              roomType8,
              input.gameFlags1839c,
              playerCount,
            )
          : null,
      descClearBit40: roomTailmid801ee0DescClearBit40(input.roomDescFlags44),
      gameFlagOr1000: roomTailmid801ee0GameFlagOr1000(input.gameFlags1839c),
    });
  }

  return Object.freeze({
    inputsReady: inputsReady | 0,
    residualKind: plan.residualKind | 0,
    pureComplete: !!plan.pureComplete,
    hostNeeded: !!plan.hostNeeded,
    curseKind: plan.curseKind | 0,
    kind801ee0: plan.kind801ee0 | 0,
    kind800500: plan.kind800500 | 0,
    needsCurseHost: needsCurse | 0,
    needs801ee0Host: plan.needs801ee0Host | 0,
    needs800500Host: plan.needs800500Host | 0,
    earlySkip800500: earlySkip800500 | 0,
    cursePosts,
    posts801ee0,
    planFromResidual: Object.freeze({ ...planFromResidual }),
    residualKinds: Object.freeze({
      none: ROOM_TAILMID_RESIDUAL_NONE,
      host: ROOM_TAILMID_RESIDUAL_HOST,
      monolithic: ROOM_TAILMID_RESIDUAL_MONOLITHIC,
      fragNone: ROOM_TAILMID_FRAG_NONE,
      fragHost: ROOM_TAILMID_FRAG_HOST,
      fragMonolithic: ROOM_TAILMID_FRAG_MONOLITHIC,
    }),
    imms: Object.freeze({
      curseEffectType: ROOM_TAILMID_CURSE_EFFECT_TYPE,
      curseEffectVariant: ROOM_TAILMID_CURSE_EFFECT_VARIANT,
      cursePosVecPtr: ROOM_TAILMID_CURSE_POS_VEC_PTR,
      sfxId: ROOM_TAILMID_SFX_ID,
      musicId: ROOM_TAILMID_MUSIC_ID,
    }),
    hostVas: Object.freeze({
      gate: ROOM_TAILMID_HOST_VA_GATE,
      isPaused: ROOM_TAILMID_HOST_VA_ISPAUSED,
      curse: ROOM_TAILMID_HOST_VA_CURSE,
      curseGenrand: ROOM_TAILMID_HOST_VA_CURSE_GENRAND,
      curseGetPlayer: ROOM_TAILMID_HOST_VA_CURSE_GETPLAYER,
      curseCreate: ROOM_TAILMID_HOST_VA_CURSE_CREATE,
      curseSqrt: ROOM_TAILMID_HOST_VA_CURSE_SQRT,
      va801ee0: ROOM_TAILMID_HOST_VA_801EE0,
      spawnWave: ROOM_TAILMID_HOST_VA_SPAWN_WAVE,
      music: ROOM_TAILMID_HOST_VA_MUSIC,
      triggerOutput: ROOM_TAILMID_HOST_VA_TRIGGER_OUTPUT,
      sfxPre: ROOM_TAILMID_HOST_VA_SFX_PRE,
      sfxPlay: ROOM_TAILMID_HOST_VA_SFX_PLAY,
      va800500: ROOM_TAILMID_HOST_VA_800500,
      next: ROOM_TAILMID_HOST_VA_NEXT,
    }),
  });
}

function tailmidPurePostsFromEvent(event) {
  const hasWireFields =
    event?.gameFlags1839c !== undefined ||
    event?.game_flags_1839c !== undefined ||
    event?.roomDescFlags44 !== undefined ||
    event?.room_desc_flags_44 !== undefined ||
    event?.frame264f8 !== undefined ||
    event?.frame_264f8 !== undefined ||
    event?.difficulty269c8 !== undefined ||
    event?.difficulty_269c8 !== undefined ||
    event?.inputsReady !== undefined ||
    event?.inputs_ready !== undefined ||
    event?.isPaused !== undefined ||
    event?.isPausedCurse !== undefined;
  const purePostsApplied = hasWireFields
    ? applyTailmidPurePosts({
        inputsReady: event?.inputsReady ?? event?.inputs_ready,
        gameFlags1839c: event?.gameFlags1839c ?? event?.game_flags_1839c,
        roomDescFlags44: event?.roomDescFlags44 ?? event?.room_desc_flags_44,
        roomActiveByte0: event?.roomActiveByte0 ?? event?.room_active_byte0,
        frame264f8: event?.frame264f8 ?? event?.frame_264f8,
        roomEntry11f0: event?.roomEntry11f0 ?? event?.room_entry_11f0,
        isPausedCurse:
          event?.isPausedCurse ?? event?.is_paused_curse ?? event?.isPaused,
        difficulty269c8: event?.difficulty269c8 ?? event?.difficulty_269c8,
        isPaused800500: event?.isPaused800500 ?? event?.is_paused_800500,
        gate1b83c: event?.gate1b83c ?? event?.gate_1b83c,
        roomF14: event?.roomF14 ?? event?.room_f14,
        roomF18: event?.roomF18 ?? event?.room_f18,
        roomF1c: event?.roomF1c ?? event?.room_f1c,
        roomF20: event?.roomF20 ?? event?.room_f20,
        playerX: event?.playerX ?? event?.player_x,
        playerY: event?.playerY ?? event?.player_y,
        postTimer723c: event?.postTimer723c ?? event?.post_timer_723c,
        preTimer723c: event?.preTimer723c ?? event?.pre_timer_723c,
        bossCount: event?.bossCount ?? event?.boss_count,
        stage0: event?.stage0 ?? event?.stage,
        roomType8: event?.roomType8 ?? event?.room_type_8,
        playerCount: event?.playerCount ?? event?.player_count,
      })
    : null;
  return {
    purePostsPeOrder: TAILMID_PURE_POSTS_PE_ORDER,
    pureHelperNames: TAILMID_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasWireFields,
  };
}

function tailmidResidualLabel(applied) {
  if (!applied) return "tailmid-host";
  if (applied.pureComplete) return "tailmid-pure-complete";
  if ((applied.residualKind | 0) === ROOM_TAILMID_RESIDUAL_MONOLITHIC) {
    return "tailmid-monolithic";
  }
  if ((applied.residualKind | 0) === ROOM_TAILMID_RESIDUAL_HOST) {
    return "tailmid-host-fragments";
  }
  return "tailmid-host";
}

/** B3–B7 freestanding pure posts PE order (room helpers ABI v36). */
export const B3B7_PURE_HELPER_NAMES = Object.freeze([
  "roomB3B7WireDecide",
  "roomB3B7ResidualPlan",
]);

/**
 * Apply freestanding B3B7 wire_decide when sparse samples land.
 * Host still owns FirstCollectibleOwner, challenge body, B4–B7 entity/grid bodies.
 */
export function applyB3B7PurePosts(opts = {}) {
  const sparseReady =
    opts.sparseReady !== undefined && opts.sparseReady !== null
      ? opts.sparseReady | 0
      : 1;
  const input = {
    sparseReady,
    teByte7321: opts.teByte7321 ?? opts.te_byte_7321 ?? 0,
    teBegin: opts.teBegin ?? opts.te_begin ?? 0,
    teEnd: opts.teEnd ?? opts.te_end ?? 0,
    descType0: opts.descType0 ?? opts.desc_type0 ?? 0,
    roomActiveByte0: opts.roomActiveByte0 ?? opts.room_active_byte0 ?? 0,
    frame264f8: opts.frame264f8 ?? opts.frame_264f8 ?? 0,
    entry11f0: opts.entry11f0 ?? opts.roomEntry11f0 ?? opts.room_entry_11f0 ?? 0,
    treeCount7238: opts.treeCount7238 ?? opts.tree_count_7238 ?? 0,
    widthC: opts.widthC ?? opts.width_c ?? 0,
    height10: opts.height10 ?? opts.height_10 ?? 0,
  };
  const plan = roomB3B7WireDecide(input);
  return Object.freeze({
    residualKind: plan.residualKind | 0,
    pureComplete: !!plan.pureComplete,
    hostNeeded: !!plan.hostNeeded,
    needsB3OwnerHost: !!plan.needsB3OwnerHost,
    needsB3ChallengeHost: !!plan.needsB3ChallengeHost,
    needsB3TempEffectsHost: !!plan.needsB3TempEffectsHost,
    needsB4RewardHost: !!plan.needsB4RewardHost,
    needsB5CandidateHost: !!plan.needsB5CandidateHost,
    needsB6DestroyHost: !!plan.needsB6DestroyHost,
    needsB7GridUpdateHost: !!plan.needsB7GridUpdateHost,
    pureHelperNames: B3B7_PURE_HELPER_NAMES.slice(),
    hostVas: Object.freeze({
      start: ROOM_B3_HOST_VA_START,
      owner: ROOM_B3_HOST_VA_OWNER,
      challenge: ROOM_B3_HOST_VA_CHALLENGE,
      challengeBody: ROOM_B3_HOST_VA_CHALLENGE_BODY,
      teCall: ROOM_B3_HOST_VA_TE_CALL,
      next: ROOM_B3B7_HOST_VA_NEXT,
    }),
    residualKinds: Object.freeze({
      host: ROOM_B3B7_RESIDUAL_HOST,
      monolithic: ROOM_B3B7_RESIDUAL_MONOLITHIC,
    }),
  });
}

function b3b7PurePostsFromEvent(event) {
  const hasWire =
    event?.sparseReady !== undefined ||
    event?.inputsReady !== undefined ||
    event?.teByte7321 !== undefined ||
    event?.descType0 !== undefined ||
    event?.frame264f8 !== undefined ||
    event?.widthC !== undefined;
  const purePostsApplied = hasWire
    ? applyB3B7PurePosts({
        sparseReady: event?.sparseReady ?? event?.inputsReady,
        teByte7321: event?.teByte7321,
        teBegin: event?.teBegin,
        teEnd: event?.teEnd,
        descType0: event?.descType0,
        roomActiveByte0: event?.roomActiveByte0,
        frame264f8: event?.frame264f8,
        entry11f0: event?.entry11f0 ?? event?.roomEntry11f0,
        treeCount7238: event?.treeCount7238,
        widthC: event?.widthC,
        height10: event?.height10,
      })
    : null;
  return {
    pureHelperNames: B3B7_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasWire,
  };
}

/** B9–B11 freestanding pure posts PE order (room helpers ABI v35+). */
export const B9B11_PURE_HELPER_NAMES = Object.freeze([
  "roomB9B11WireDecide",
  "roomB9B11ResidualPlan",
]);

/**
 * Apply freestanding B9B11 wire_decide when sparse samples land.
 * Host always owns FCO query + manager chain; fatal gated by pure plan.
 */
export function applyB9B11PurePosts(opts = {}) {
  const inputsReady =
    opts.inputsReady !== undefined && opts.inputsReady !== null
      ? opts.inputsReady | 0
      : 1;
  const input = {
    challengeResultNonzero: opts.challengeResultNonzero ?? opts.challenge_result_nonzero ?? 0,
    roomActiveByte0: opts.roomActiveByte0 ?? opts.room_active_byte0 ?? 0,
    frame264f8: opts.frame264f8 ?? opts.frame_264f8 ?? 0,
    roomEntry11f0: opts.roomEntry11f0 ?? opts.room_entry_11f0 ?? 0,
    roomType8: opts.roomType8 ?? opts.room_type_8 ?? 0,
    roomDescFlags44: opts.roomDescFlags44 ?? opts.room_desc_flags_44 ?? 0,
    game997aByte: opts.game997aByte ?? opts.game_997a_byte ?? 0,
    roomByte11f4: opts.roomByte11f4 ?? opts.room_byte_11f4 ?? 0,
    count12c8: opts.count12c8 ?? opts.count_12c8 ?? 0,
    count12cc: opts.count12cc ?? opts.count_12cc ?? 0,
    old7224: opts.old7224 ?? opts.old_7224 ?? 0,
    roomByte1d0d: opts.roomByte1d0d ?? opts.room_byte_1d0d ?? 0,
    room1d18: opts.room1d18 ?? opts.room_1d18 ?? 0,
    roomByte7321: opts.roomByte7321 ?? opts.room_byte_7321 ?? 0,
    listBegin7314: opts.listBegin7314 ?? opts.list_begin_7314 ?? 0,
    listEnd7318: opts.listEnd7318 ?? opts.list_end_7318 ?? 0,
  };
  const plan = roomB9B11WireDecide(inputsReady, input);
  return Object.freeze({
    residualKind: plan.residualKind | 0,
    pureComplete: !!plan.pureComplete,
    hostNeeded: !!plan.hostNeeded,
    b10FatalNeedsHost: !!plan.b10FatalNeedsHost,
    b10Enemies: plan.b10Enemies | 0,
    challengeBodyNeedsHost: !!plan.challengeBodyNeedsHost,
    modeHooksNeedsHost: !!plan.modeHooksNeedsHost,
    pureHelperNames: B9B11_PURE_HELPER_NAMES.slice(),
    hostVas: Object.freeze({
      b9Start: ROOM_B9B11_HOST_VA_B9_START,
      query: ROOM_B9B11_HOST_VA_QUERY,
      b10Start: ROOM_B9B11_HOST_VA_B10_START,
      fatal: ROOM_B9B11_HOST_VA_FATAL,
      b11Start: ROOM_B9B11_HOST_VA_B11_START,
      b12Start: ROOM_B9B11_HOST_VA_B12_START,
    }),
    residualKinds: Object.freeze({
      alwaysHost: ROOM_B9B11_RESIDUAL_ALWAYS_HOST,
      monolithic: ROOM_B9B11_RESIDUAL_MONOLITHIC,
    }),
  });
}

function b9b11PurePostsFromEvent(event) {
  const hasWire =
    event?.inputsReady !== undefined ||
    event?.sparseReady !== undefined ||
    event?.frame264f8 !== undefined ||
    event?.count12c8 !== undefined ||
    event?.room1d18 !== undefined ||
    event?.old7224 !== undefined ||
    event?.roomType8 !== undefined;
  const purePostsApplied = hasWire
    ? applyB9B11PurePosts({
        inputsReady: event?.inputsReady ?? event?.sparseReady,
        challengeResultNonzero: event?.challengeResultNonzero,
        roomActiveByte0: event?.roomActiveByte0,
        frame264f8: event?.frame264f8,
        roomEntry11f0: event?.roomEntry11f0,
        roomType8: event?.roomType8,
        roomDescFlags44: event?.roomDescFlags44,
        game997aByte: event?.game997aByte,
        roomByte11f4: event?.roomByte11f4,
        count12c8: event?.count12c8,
        count12cc: event?.count12cc,
        old7224: event?.old7224,
        roomByte1d0d: event?.roomByte1d0d,
        room1d18: event?.room1d18,
        roomByte7321: event?.roomByte7321,
        listBegin7314: event?.listBegin7314,
        listEnd7318: event?.listEnd7318,
      })
    : null;
  return {
    pureHelperNames: B9B11_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasWire,
  };
}

/**
 * B19 path-rebuild residual pure helpers (room pure ABI v30 freestanding).
 * Host still owns refcount DAT_00c71674, memset 0x1c0, GetGridCollision walk,
 * entity secondary query 0x0072fe80, tree alloc / pathfinding / spawn /
 * pedestal Get/Set / free. B20 trail pure plan is composed separately
 * (helpers ABI v31). Outer flag clear Room+0x7769=0 is already pure on
 * Update resume_room_update_head; residual rebuild excludes that store.
 * Flag-on always hosts (no empty pure-complete like B18).
 */
export const B19_PATH_PURE_HELPER_NAMES = Object.freeze([
  "roomB19NeedsPathRebuildHost",
  "roomB19CellCount",
  "roomB19CellLoopEnter",
  "roomB19CellLoopContinue",
  "roomB19ListEmpty",
  "roomB19ListContinue",
  "roomB19EntityIsMarkCandidate",
  "roomB19EntitySecondaryEligible",
  "roomB19CollisionByte",
  "roomB19WorldToGridX",
  "roomB19WorldToGridY",
  "roomB19WorldToGridIndex",
  "roomB19GridIndexValid",
  "roomB19ResidualPlan",
  "roomB19WireDecide",
]);

/** PE-ordered pure-post slots before path rebuild host bodies. */
export const B19_PATH_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "B19_outer_gate",
    posts: Object.freeze(["needs_path_rebuild_host"]),
    pureHelpers: Object.freeze(["roomB19NeedsPathRebuildHost"]),
  }),
  Object.freeze({
    slot: "B19_cell_count",
    posts: Object.freeze(["cell_count", "cell_loop_enter", "cell_loop_continue"]),
    pureHelpers: Object.freeze([
      "roomB19CellCount",
      "roomB19CellLoopEnter",
      "roomB19CellLoopContinue",
    ]),
  }),
  Object.freeze({
    slot: "B19_collision_byte",
    posts: Object.freeze(["collision_byte"]),
    pureHelpers: Object.freeze(["roomB19CollisionByte"]),
  }),
  Object.freeze({
    slot: "B19_entity_route",
    posts: Object.freeze([
      "list_empty",
      "list_continue",
      "mark_candidate",
      "secondary_eligible",
      "world_to_grid_index",
      "grid_index_valid",
    ]),
    pureHelpers: Object.freeze([
      "roomB19ListEmpty",
      "roomB19ListContinue",
      "roomB19EntityIsMarkCandidate",
      "roomB19EntitySecondaryEligible",
      "roomB19WorldToGridX",
      "roomB19WorldToGridY",
      "roomB19WorldToGridIndex",
      "roomB19GridIndexValid",
    ]),
  }),
  Object.freeze({
    slot: "B19_wire_decide",
    posts: Object.freeze(["residual_plan", "wire_decide"]),
    pureHelpers: Object.freeze(["roomB19ResidualPlan", "roomB19WireDecide"]),
  }),
]);

/**
 * Normalize B19 entity packs from HostHandler event aliases.
 * Accepts event.entities | entitySamples | packs | samples (object array).
 * Empty array is valid (flag-on still HOST_REBUILD — no empty pure-complete).
 */
export function normalizeB19Entities(samples) {
  if (!Array.isArray(samples)) return null;
  const out = [];
  for (const e of samples) {
    if (e === null || e === undefined) {
      out.push({
        entityType28: 0,
        entityVariant2c: 0,
        dead173: 0,
        field534: 0,
        flags168: 0,
        posX: 0,
        posY: 0,
      });
      continue;
    }
    if (typeof e === "number") {
      out.push({
        entityType28: e | 0,
        entityVariant2c: 0,
        dead173: 0,
        field534: 0,
        flags168: 0,
        posX: 0,
        posY: 0,
      });
      continue;
    }
    if (typeof e !== "object") return null;
    out.push({
      entityType28:
        e.entityType28 ??
        e.entity_type_28 ??
        e.type28 ??
        e.type_28 ??
        e.type ??
        e.entityType ??
        e.entity_type ??
        0,
      entityVariant2c:
        e.entityVariant2c ??
        e.entity_variant_2c ??
        e.variant2c ??
        e.variant_2c ??
        e.variant ??
        0,
      dead173:
        e.dead173 ??
        e.dead_173 ??
        e.entityDead173 ??
        e.entity_dead_173 ??
        e.dead ??
        0,
      field534:
        e.field534 ??
        e.field_534 ??
        e.entityField534 ??
        e.entity_field_534 ??
        0,
      flags168:
        e.flags168 ??
        e.flags_168 ??
        e.entityFlags168 ??
        e.entity_flags_168 ??
        e.flags ??
        0,
      posX:
        e.posX ??
        e.pos_x ??
        e.entityPosX ??
        e.entity_pos_x ??
        e.x ??
        0,
      posY:
        e.posY ??
        e.pos_y ??
        e.entityPosY ??
        e.entity_pos_y ??
        e.y ??
        0,
    });
  }
  return out;
}

/**
 * Normalize optional B19 cell collision samples (GetGridCollision pure posts).
 * Accepts event.cells | cellSamples | collisionSamples | gridCollisionResults.
 */
export function normalizeB19Cells(samples) {
  if (!Array.isArray(samples)) return null;
  const out = [];
  for (const c of samples) {
    if (c === null || c === undefined) {
      out.push({ gridCollisionResult: 0 });
      continue;
    }
    if (typeof c === "number") {
      out.push({ gridCollisionResult: c >>> 0 });
      continue;
    }
    if (typeof c !== "object") return null;
    out.push({
      gridCollisionResult:
        c.gridCollisionResult ??
        c.grid_collision_result ??
        c.collision ??
        c.result ??
        c.value ??
        0,
    });
  }
  return out;
}

/**
 * Apply freestanding B19 wire_decide + cell/entity pure plan.
 * Flag-on always hosts rebuild (refcount/memset/tree even when W*H==0 and
 * entity list empty). Flag-off is B19 pure-complete NONE. B20 trail list on
 * the same residual event is composed via applyB20TrailPurePosts when trail
 * packs land (hostB20Trail defaults to 1 here when B20 is not applied).
 *
 * @param {object} opts
 * @param {number} [opts.flagReady]
 * @param {number} [opts.roomFlag7769]
 * @param {number} [opts.widthC]
 * @param {number} [opts.height10]
 * @param {number} [opts.entityCount1264]
 * @param {Array<object|number>} [opts.entities]
 * @param {Array<object|number>} [opts.cells]
 * @returns {object} frozen purePostsApplied plan
 */
export function applyB19PathPurePosts(opts = {}) {
  const entities = normalizeB19Entities(
    opts.entities ??
      opts.entitySamples ??
      opts.entity_samples ??
      opts.packs ??
      opts.samples ??
      null,
  );
  const cells = normalizeB19Cells(
    opts.cells ??
      opts.cellSamples ??
      opts.cell_samples ??
      opts.collisionSamples ??
      opts.collision_samples ??
      opts.gridCollisionResults ??
      opts.grid_collision_results ??
      null,
  );

  const roomFlag7769 =
    opts.roomFlag7769 ??
    opts.room_flag_7769 ??
    opts.flag7769 ??
    opts.flag ??
    0;
  const widthC =
    opts.widthC ??
    opts.width_c ??
    opts.roomWidthC ??
    opts.room_width_c ??
    opts.width ??
    0;
  const height10 =
    opts.height10 ??
    opts.height_10 ??
    opts.roomHeight10 ??
    opts.room_height_10 ??
    opts.height ??
    0;
  const entityCount1264 =
    opts.entityCount1264 !== undefined && opts.entityCount1264 !== null
      ? opts.entityCount1264 >>> 0
      : opts.entity_count_1264 !== undefined && opts.entity_count_1264 !== null
        ? opts.entity_count_1264 >>> 0
        : opts.entityCount !== undefined && opts.entityCount !== null
          ? opts.entityCount >>> 0
          : entities
            ? entities.length >>> 0
            : 0;

  const flagReadyRaw = opts.flagReady ?? opts.flag_ready;
  const flagReady =
    flagReadyRaw !== undefined && flagReadyRaw !== null
      ? flagReadyRaw | 0
      : 1; // samples / wire fields imply outer flag sparse is available

  const plan = roomB19WireDecide(flagReady, roomFlag7769, widthC, height10);
  const planFromResidual = roomB19ResidualPlan(roomFlag7769, widthC, height10);
  const outer = roomB19NeedsPathRebuildHost(roomFlag7769);
  const cellCount = roomB19CellCount(widthC, height10);
  const cellLoopEnter = roomB19CellLoopEnter(cellCount);
  const listEmpty = roomB19ListEmpty(entityCount1264);

  let markCandidateCount = 0;
  let secondaryEligibleCount = 0;
  let gridMarkValidCount = 0;
  let entityActions = null;
  let cellActions = null;

  if (
    entities &&
    (plan.residualKind | 0) === ROOM_B19_RESIDUAL_HOST_REBUILD
  ) {
    const n = Math.min(entityCount1264 >>> 0, entities.length);
    const rows = [];
    for (let i = 0; i < n; i++) {
      const ent = entities[i];
      const type28 = ent.entityType28 | 0;
      const variant2c = ent.entityVariant2c | 0;
      const dead173 = ent.dead173 >>> 0;
      const field534 = ent.field534 >>> 0;
      const flags168 = ent.flags168 >>> 0;
      const posX = +ent.posX;
      const posY = +ent.posY;
      const mark = roomB19EntityIsMarkCandidate(type28, variant2c) | 0;
      const secondary =
        mark !== 0
          ? roomB19EntitySecondaryEligible(dead173, field534, flags168) | 0
          : 0;
      const gridIndex =
        mark !== 0
          ? roomB19WorldToGridIndex(posX, posY, widthC, height10) | 0
          : -1;
      const gridValid = mark !== 0 ? roomB19GridIndexValid(gridIndex) | 0 : 0;
      if (mark) markCandidateCount++;
      if (secondary) secondaryEligibleCount++;
      if (gridValid) gridMarkValidCount++;
      rows.push(
        Object.freeze({
          index: i,
          entityType28: type28,
          entityVariant2c: variant2c,
          dead173: dead173 & 0xff,
          field534: field534 >>> 0,
          flags168: flags168 >>> 0,
          posX,
          posY,
          markCandidate: mark,
          secondaryEligible: secondary,
          gridX: mark !== 0 ? roomB19WorldToGridX(posX) | 0 : 0,
          gridY: mark !== 0 ? roomB19WorldToGridY(posY) | 0 : 0,
          gridIndex,
          gridIndexValid: gridValid,
          listContinue: roomB19ListContinue(i, entityCount1264) | 0,
          hostMarkStore: mark !== 0 && gridValid !== 0 ? 1 : 0,
          hostSecondaryQuery: secondary,
        }),
      );
    }
    entityActions = Object.freeze(rows);
  }

  if (
    cells &&
    (plan.residualKind | 0) === ROOM_B19_RESIDUAL_HOST_REBUILD &&
    cellLoopEnter !== 0
  ) {
    const n = Math.min(cellCount | 0, cells.length);
    const rows = [];
    for (let i = 0; i < n; i++) {
      const result = cells[i].gridCollisionResult >>> 0;
      rows.push(
        Object.freeze({
          index: i,
          gridCollisionResult: result,
          collisionByte: roomB19CollisionByte(result) >>> 0,
          cellLoopContinue: roomB19CellLoopContinue(i, cellCount) | 0,
        }),
      );
    }
    cellActions = Object.freeze(rows);
  }

  // Flag-on always hosts rebuild; MONOLITHIC whole residual host.
  const hostRebuild =
    (plan.hostNeeded | 0) !== 0 &&
    ((plan.residualKind | 0) === ROOM_B19_RESIDUAL_HOST_REBUILD ||
      (plan.residualKind | 0) === ROOM_B19_RESIDUAL_MONOLITHIC)
      ? 1
      : 0;
  const hostCellLoop =
    hostRebuild && cellLoopEnter !== 0 ? 1 : 0;
  const hostEntityWalk =
    hostRebuild && listEmpty === 0 ? 1 : 0;
  // Secondary query / tree / pathfinding / pedestal stay host under rebuild.
  const hostSecondaryQuery = secondaryEligibleCount > 0 ? 1 : 0;
  const hostTreePath = hostRebuild;
  // Default: B20 trail host until applyB20TrailPurePosts composes over this.
  const hostB20Trail = 1;

  return Object.freeze({
    flagReady: flagReady | 0,
    roomFlag7769: roomFlag7769 >>> 0,
    widthC: widthC | 0,
    height10: height10 | 0,
    entityCount1264: entityCount1264 >>> 0,
    outerGate: outer | 0,
    cellCount: cellCount | 0,
    cellLoopEnter: cellLoopEnter | 0,
    listEmpty: listEmpty | 0,
    residualKind: plan.residualKind | 0,
    pureComplete: (plan.pureComplete | 0) !== 0,
    hostNeeded: (plan.hostNeeded | 0) !== 0,
    needsHost: plan.needsHost | 0,
    planCellCount: plan.cellCount | 0,
    planFromResidualKind: planFromResidual.residualKind | 0,
    markCandidateCount: markCandidateCount | 0,
    secondaryEligibleCount: secondaryEligibleCount | 0,
    gridMarkValidCount: gridMarkValidCount | 0,
    hostRebuild,
    hostCellLoop,
    hostEntityWalk,
    hostSecondaryQuery,
    hostTreePath,
    hostB20Trail,
    entityActions,
    cellActions,
    hostVas: Object.freeze({
      flagTest: ROOM_B19_HOST_VA_FLAG_TEST,
      rebuildStart: ROOM_B19_HOST_VA_REBUILD_START,
      memset: ROOM_B19_HOST_VA_MEMSET,
      getGridCollision: ROOM_B19_HOST_VA_GET_GRID_COLLISION,
      entityWalk: ROOM_B19_HOST_VA_ENTITY_WALK,
      query8000: ROOM_B19_HOST_VA_QUERY_8000,
      treeAlloc: ROOM_B19_HOST_VA_TREE_ALLOC,
      posFinish: ROOM_B19_HOST_VA_POS_FINISH,
      spawn: ROOM_B19_HOST_VA_SPAWN,
      getAltPedestal: ROOM_B19_HOST_VA_GET_ALT_PEDESTAL,
      setAltPedestal: ROOM_B19_HOST_VA_SET_ALT_PEDESTAL,
      flagClear: ROOM_B19_HOST_VA_FLAG_CLEAR,
      next: ROOM_B19_HOST_VA_NEXT,
      refcount: ROOM_B19_REFCOUNT_VA,
    }),
    peImms: Object.freeze({
      entityType5: ROOM_B19_ENTITY_TYPE5,
      entityVariant100: ROOM_B19_ENTITY_VARIANT_100,
      entityFlagBit: ROOM_B19_ENTITY_FLAG_BIT,
      queryImm8000: ROOM_B19_QUERY_IMM_8000,
    }),
    residualKinds: Object.freeze({
      none: ROOM_B19_RESIDUAL_NONE,
      hostRebuild: ROOM_B19_RESIDUAL_HOST_REBUILD,
      monolithic: ROOM_B19_RESIDUAL_MONOLITHIC,
    }),
  });
}

/**
 * B20 trail-list residual pure helpers (room pure ABI v31 freestanding).
 * Host still owns SEH/local vector setup+free, vector push/grow 0x0042c920,
 * pass2 spawn suite (0x00428b20 / genrand / sin/cos / pos pack 0x00802740),
 * multi-spawn child walk. Outer begin≠end gate + list CF + pass1 type filter
 * + flag OR/clear + pass2 route + pair ±offset pure posts + chain CF are pure.
 * Composed with B19 on opaqueRoomUpdateTailPath (no Update ABI change).
 */
export const B20_TRAIL_PURE_HELPER_NAMES = Object.freeze([
  "roomB20NeedsTrailHost",
  "roomB20ListCount",
  "roomB20ListEmpty",
  "roomB20ListContinue",
  "roomB20Pass1TypeMatch",
  "roomB20FlagOr4000",
  "roomB20FlagClear4000",
  "roomB20EntityIsFlagged",
  "roomB20EntityIsPairX",
  "roomB20EntityIsPairY",
  "roomB20Pass2Action",
  "roomB20FlaggedMultispawnEnter",
  "roomB20ChainContinue",
  "roomB20SpawnFlagOr80",
  "roomB20PairXLeft",
  "roomB20PairXRight",
  "roomB20PairYUp",
  "roomB20PairYDown",
  "roomB20ResidualPlan",
  "roomB20WireDecide",
]);

/** PE-ordered pure-post slots for B20 trail residual (after B19 on TailPath). */
export const B20_TRAIL_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "B20_outer_gate",
    posts: Object.freeze(["needs_trail_host"]),
    pureHelpers: Object.freeze(["roomB20NeedsTrailHost"]),
  }),
  Object.freeze({
    slot: "B20_list_cf",
    posts: Object.freeze(["list_count", "list_empty", "list_continue"]),
    pureHelpers: Object.freeze([
      "roomB20ListCount",
      "roomB20ListEmpty",
      "roomB20ListContinue",
    ]),
  }),
  Object.freeze({
    slot: "B20_pass1",
    posts: Object.freeze(["pass1_type_match", "flag_or_4000"]),
    pureHelpers: Object.freeze([
      "roomB20Pass1TypeMatch",
      "roomB20FlagOr4000",
    ]),
  }),
  Object.freeze({
    slot: "B20_pass2_route",
    posts: Object.freeze([
      "pass2_action",
      "flagged_multispawn_enter",
      "chain_continue",
      "pair_offsets",
      "spawn_flag_or_80",
      "flag_clear_4000",
    ]),
    pureHelpers: Object.freeze([
      "roomB20Pass2Action",
      "roomB20EntityIsFlagged",
      "roomB20EntityIsPairX",
      "roomB20EntityIsPairY",
      "roomB20FlaggedMultispawnEnter",
      "roomB20ChainContinue",
      "roomB20PairXLeft",
      "roomB20PairXRight",
      "roomB20PairYUp",
      "roomB20PairYDown",
      "roomB20SpawnFlagOr80",
      "roomB20FlagClear4000",
    ]),
  }),
  Object.freeze({
    slot: "B20_wire_decide",
    posts: Object.freeze(["residual_plan", "wire_decide"]),
    pureHelpers: Object.freeze(["roomB20ResidualPlan", "roomB20WireDecide"]),
  }),
]);

/**
 * Normalize B20 trail entity packs from HostHandler event aliases.
 * Distinct from B19 room entities: trailEntities | b20Entities | trailSamples
 * | b20Samples | trailPacks | b20Packs.
 */
export function normalizeB20Entities(samples) {
  if (!Array.isArray(samples)) return null;
  const out = [];
  for (const e of samples) {
    if (e === null || e === undefined) {
      out.push({
        entityType28: 0,
        flags16c: 0,
        posX: 0,
        posY: 0,
        field3c0: 0,
        childPtr3bc: 0,
        childType28: 0,
      });
      continue;
    }
    if (typeof e === "number") {
      out.push({
        entityType28: e | 0,
        flags16c: 0,
        posX: 0,
        posY: 0,
        field3c0: 0,
        childPtr3bc: 0,
        childType28: 0,
      });
      continue;
    }
    if (typeof e !== "object") return null;
    out.push({
      entityType28:
        e.entityType28 ??
        e.entity_type_28 ??
        e.type28 ??
        e.type_28 ??
        e.type ??
        e.entityType ??
        e.entity_type ??
        0,
      flags16c:
        e.flags16c ??
        e.flags_16c ??
        e.entityFlags16c ??
        e.entity_flags_16c ??
        e.flags ??
        0,
      posX:
        e.posX ??
        e.pos_x ??
        e.entityPosX ??
        e.entity_pos_x ??
        e.x ??
        0,
      posY:
        e.posY ??
        e.pos_y ??
        e.entityPosY ??
        e.entity_pos_y ??
        e.y ??
        0,
      field3c0:
        e.field3c0 ??
        e.field_3c0 ??
        e.entityField3c0 ??
        e.entity_field_3c0 ??
        0,
      childPtr3bc:
        e.childPtr3bc ??
        e.child_ptr_3bc ??
        e.field3bc ??
        e.field_3bc ??
        e.childPtr ??
        e.child_ptr ??
        0,
      childType28:
        e.childType28 ??
        e.child_type_28 ??
        e.childType ??
        e.child_type ??
        0,
    });
  }
  return out;
}

/**
 * Apply freestanding B20 wire_decide + pass1/pass2 pure plan.
 * begin==end → RESIDUAL_NONE pure-complete. begin!=end always hosts trail
 * (SEH/vector even when listCount==0). listReady=0 → MONOLITHIC.
 *
 * @param {object} opts
 * @param {number} [opts.listReady]
 * @param {number} [opts.listBeginC82674]
 * @param {number} [opts.listEndC82678]
 * @param {number} [opts.mode26614]
 * @param {Array<object|number>} [opts.entities]
 * @returns {object} frozen purePostsApplied plan
 */
export function applyB20TrailPurePosts(opts = {}) {
  const entities = normalizeB20Entities(
    opts.entities ??
      opts.entitySamples ??
      opts.entity_samples ??
      opts.trailEntities ??
      opts.trail_entities ??
      opts.b20Entities ??
      opts.b20_entities ??
      opts.trailSamples ??
      opts.trail_samples ??
      opts.b20Samples ??
      opts.b20_samples ??
      opts.trailPacks ??
      opts.trail_packs ??
      opts.b20Packs ??
      opts.b20_packs ??
      opts.packs ??
      opts.samples ??
      null,
  );

  const listBegin =
    opts.listBeginC82674 ??
    opts.list_begin_c82674 ??
    opts.listBegin ??
    opts.list_begin ??
    opts.beginC82674 ??
    opts.begin ??
    0;
  const listEnd =
    opts.listEndC82678 ??
    opts.list_end_c82678 ??
    opts.listEnd ??
    opts.list_end ??
    opts.endC82678 ??
    opts.end ??
    0;
  const mode =
    opts.mode26614 ??
    opts.mode_26614 ??
    opts.gameMode26614 ??
    opts.game_mode_26614 ??
    opts.timedTransitionCleanupMode ??
    opts.timed_transition_cleanup_mode ??
    opts.mode ??
    0;

  const listReadyRaw = opts.listReady ?? opts.list_ready;
  const listReady =
    listReadyRaw !== undefined && listReadyRaw !== null
      ? listReadyRaw | 0
      : 1; // packs / wire fields imply DAT begin/end sparse available

  const plan = roomB20WireDecide(listReady, listBegin, listEnd);
  const planFromResidual = roomB20ResidualPlan(listBegin, listEnd);
  const outer = roomB20NeedsTrailHost(listBegin, listEnd);
  const listCount = roomB20ListCount(listBegin, listEnd);
  const listEmpty = roomB20ListEmpty(listCount);

  let pass1MatchCount = 0;
  let pass2FlaggedCount = 0;
  let pass2PairXCount = 0;
  let pass2PairYCount = 0;
  let pass2DefaultCount = 0;
  let multispawnEnterCount = 0;
  let chainContinueCount = 0;
  let entityActions = null;

  if (
    entities &&
    (plan.residualKind | 0) === ROOM_B20_RESIDUAL_HOST_TRAIL
  ) {
    const n = Math.min(
      listCount > 0 ? listCount >>> 0 : entities.length >>> 0,
      entities.length,
    );
    // PE listCount from pointer delta; when count<=0 skip entity expand.
    const walkN = listCount > 0 ? n : 0;
    const rows = [];
    for (let i = 0; i < walkN; i++) {
      const ent = entities[i];
      const type28 = ent.entityType28 | 0;
      const flagsIn = ent.flags16c >>> 0;
      const posX = +ent.posX;
      const posY = +ent.posY;
      const field3c0 = ent.field3c0 >>> 0;
      const childPtr3bc = ent.childPtr3bc >>> 0;
      const childType28 = ent.childType28 | 0;
      const pass1 = roomB20Pass1TypeMatch(type28) | 0;
      const flagsAfterPass1 =
        pass1 !== 0 ? roomB20FlagOr4000(flagsIn) : flagsIn;
      const flagsCleared =
        pass1 !== 0
          ? roomB20FlagClear4000(flagsAfterPass1)
          : flagsAfterPass1 >>> 0;
      const action = roomB20Pass2Action(flagsAfterPass1, type28) | 0;
      const isFlagged = roomB20EntityIsFlagged(flagsAfterPass1) | 0;
      const isPairX = roomB20EntityIsPairX(type28) | 0;
      const isPairY = roomB20EntityIsPairY(type28) | 0;
      const multispawnEnter =
        action === ROOM_B20_ACTION_FLAGGED
          ? roomB20FlaggedMultispawnEnter(field3c0) | 0
          : 0;
      const chainContinue =
        action === ROOM_B20_ACTION_FLAGGED && multispawnEnter !== 0
          ? roomB20ChainContinue(childPtr3bc, mode, childType28) | 0
          : 0;
      const pairXLeft =
        action === ROOM_B20_ACTION_PAIR_X
          ? roomB20PairXLeft(posX, posY)
          : null;
      const pairXRight =
        action === ROOM_B20_ACTION_PAIR_X
          ? roomB20PairXRight(posX, posY)
          : null;
      const pairYUp =
        action === ROOM_B20_ACTION_PAIR_Y
          ? roomB20PairYUp(posX, posY)
          : null;
      const pairYDown =
        action === ROOM_B20_ACTION_PAIR_Y
          ? roomB20PairYDown(posX, posY)
          : null;
      const spawnFlagOr80 = roomB20SpawnFlagOr80(flagsAfterPass1);

      if (pass1) pass1MatchCount++;
      if (action === ROOM_B20_ACTION_FLAGGED) pass2FlaggedCount++;
      else if (action === ROOM_B20_ACTION_PAIR_X) pass2PairXCount++;
      else if (action === ROOM_B20_ACTION_PAIR_Y) pass2PairYCount++;
      else pass2DefaultCount++;
      if (multispawnEnter) multispawnEnterCount++;
      if (chainContinue) chainContinueCount++;

      rows.push(
        Object.freeze({
          index: i,
          entityType28: type28,
          flags16cIn: flagsIn >>> 0,
          flags16cAfterPass1: flagsAfterPass1 >>> 0,
          flags16cCleared: flagsCleared >>> 0,
          posX,
          posY,
          field3c0: field3c0 >>> 0,
          childPtr3bc: childPtr3bc >>> 0,
          childType28: childType28 | 0,
          pass1TypeMatch: pass1,
          pass2Action: action,
          isFlagged,
          isPairX,
          isPairY,
          multispawnEnter,
          chainContinue,
          pairXLeft: pairXLeft
            ? Object.freeze({ x: pairXLeft.x, y: pairXLeft.y })
            : null,
          pairXRight: pairXRight
            ? Object.freeze({ x: pairXRight.x, y: pairXRight.y })
            : null,
          pairYUp: pairYUp
            ? Object.freeze({ x: pairYUp.x, y: pairYUp.y })
            : null,
          pairYDown: pairYDown
            ? Object.freeze({ x: pairYDown.x, y: pairYDown.y })
            : null,
          spawnFlagOr80: spawnFlagOr80 >>> 0,
          listContinue: roomB20ListContinue(i, listCount) | 0,
          hostPass1Push: pass1,
          hostPass2Spawn: 1,
          hostFlaggedMultispawn: multispawnEnter,
        }),
      );
    }
    entityActions = Object.freeze(rows);
  }

  // begin!=end always hosts trail; MONOLITHIC whole residual host.
  const hostB20Trail =
    (plan.hostNeeded | 0) !== 0 &&
    ((plan.residualKind | 0) === ROOM_B20_RESIDUAL_HOST_TRAIL ||
      (plan.residualKind | 0) === ROOM_B20_RESIDUAL_MONOLITHIC)
      ? 1
      : 0;
  const hostVectorSetup = hostB20Trail;
  const hostPass1 =
    hostB20Trail &&
    (plan.residualKind | 0) === ROOM_B20_RESIDUAL_HOST_TRAIL &&
    listEmpty === 0
      ? 1
      : 0;
  const hostPass2 = hostPass1;
  const hostSpawn =
    hostPass2 ||
    (hostB20Trail &&
      (plan.residualKind | 0) === ROOM_B20_RESIDUAL_MONOLITHIC)
      ? 1
      : 0;
  const hostDeallocate = hostB20Trail;

  return Object.freeze({
    listReady: listReady | 0,
    listBeginC82674: listBegin >>> 0,
    listEndC82678: listEnd >>> 0,
    mode26614: mode | 0,
    outerGate: outer | 0,
    listCount: listCount | 0,
    listEmpty: listEmpty | 0,
    residualKind: plan.residualKind | 0,
    pureComplete: (plan.pureComplete | 0) !== 0,
    hostNeeded: (plan.hostNeeded | 0) !== 0,
    needsHost: plan.needsHost | 0,
    planListCount: plan.listCount | 0,
    planFromResidualKind: planFromResidual.residualKind | 0,
    pass1MatchCount: pass1MatchCount | 0,
    pass2FlaggedCount: pass2FlaggedCount | 0,
    pass2PairXCount: pass2PairXCount | 0,
    pass2PairYCount: pass2PairYCount | 0,
    pass2DefaultCount: pass2DefaultCount | 0,
    multispawnEnterCount: multispawnEnterCount | 0,
    chainContinueCount: chainContinueCount | 0,
    hostB20Trail,
    hostVectorSetup,
    hostPass1,
    hostPass2,
    hostSpawn,
    hostDeallocate,
    entityActions,
    hostVas: Object.freeze({
      listTest: ROOM_B20_HOST_VA_LIST_TEST,
      pass1: ROOM_B20_HOST_VA_PASS1,
      pass2: ROOM_B20_HOST_VA_PASS2,
      vectorPush: ROOM_B20_HOST_VA_VECTOR_PUSH,
      spawn: ROOM_B20_HOST_VA_SPAWN,
      genrand: ROOM_B20_HOST_VA_GENRAND,
      sin: ROOM_B20_HOST_VA_SIN,
      cos: ROOM_B20_HOST_VA_COS,
      posPack: ROOM_B20_HOST_VA_POS_PACK,
      deallocate: ROOM_B20_HOST_VA_DEALLOCATE,
      flagClear: ROOM_B20_HOST_VA_FLAG_CLEAR,
      epilogue: ROOM_B20_HOST_VA_EPILOGUE,
      listBegin: ROOM_B20_LIST_BEGIN_VA,
      listEnd: ROOM_B20_LIST_END_VA,
      listCap: ROOM_B20_LIST_CAP_VA,
    }),
    peImms: Object.freeze({
      pass1TypeA: ROOM_B20_PASS1_TYPE_A,
      pass1TypeB: ROOM_B20_PASS1_TYPE_B,
      pass1TypeC: ROOM_B20_PASS1_TYPE_C,
      pass1TypeD: ROOM_B20_PASS1_TYPE_D,
      pairXTypes: ROOM_B20_PAIR_X_TYPES,
      pairYType: ROOM_B20_PAIR_Y_TYPE,
      flagBit4000: ROOM_B20_FLAG_BIT_4000,
      flagClearMask: ROOM_B20_FLAG_CLEAR_MASK,
      spawnFlagBit80: ROOM_B20_SPAWN_FLAG_BIT_80,
    }),
    actions: Object.freeze({
      flagged: ROOM_B20_ACTION_FLAGGED,
      pairX: ROOM_B20_ACTION_PAIR_X,
      pairY: ROOM_B20_ACTION_PAIR_Y,
      default: ROOM_B20_ACTION_DEFAULT,
    }),
    residualKinds: Object.freeze({
      none: ROOM_B20_RESIDUAL_NONE,
      hostTrail: ROOM_B20_RESIDUAL_HOST_TRAIL,
      monolithic: ROOM_B20_RESIDUAL_MONOLITHIC,
    }),
  });
}

/**
 * Shared B19 path residual pure-post path (B19 fields only).
 * Samples: event.entities | entitySamples | packs | samples;
 * cells: event.cells | cellSamples | collisionSamples.
 * Wire inputs: roomFlag7769 / widthC / height10 / flagReady / entityCount1264.
 */
function b19PathPurePostsFromEvent(event) {
  const samples =
    event?.entities ??
    event?.entitySamples ??
    event?.entity_samples ??
    event?.packs ??
    event?.samples ??
    null;
  const cellSamples =
    event?.cells ??
    event?.cellSamples ??
    event?.cell_samples ??
    event?.collisionSamples ??
    event?.collision_samples ??
    event?.gridCollisionResults ??
    event?.grid_collision_results ??
    null;
  const hasEntityArray = Array.isArray(samples);
  const hasCellArray = Array.isArray(cellSamples);
  const hasWireFields =
    event?.roomFlag7769 !== undefined ||
    event?.room_flag_7769 !== undefined ||
    event?.flag7769 !== undefined ||
    event?.flagReady !== undefined ||
    event?.flag_ready !== undefined ||
    event?.widthC !== undefined ||
    event?.width_c !== undefined ||
    event?.width !== undefined ||
    event?.height10 !== undefined ||
    event?.height_10 !== undefined ||
    event?.height !== undefined ||
    event?.entityCount1264 !== undefined ||
    event?.entity_count_1264 !== undefined ||
    event?.entityCount !== undefined;
  const hasSamples = hasEntityArray || hasCellArray || hasWireFields;
  const purePostsApplied = hasSamples
    ? applyB19PathPurePosts({
        flagReady: event?.flagReady ?? event?.flag_ready,
        roomFlag7769:
          event?.roomFlag7769 ??
          event?.room_flag_7769 ??
          event?.flag7769 ??
          event?.flag,
        widthC:
          event?.widthC ??
          event?.width_c ??
          event?.roomWidthC ??
          event?.room_width_c ??
          event?.width,
        height10:
          event?.height10 ??
          event?.height_10 ??
          event?.roomHeight10 ??
          event?.room_height_10 ??
          event?.height,
        entityCount1264:
          event?.entityCount1264 ??
          event?.entity_count_1264 ??
          event?.entityCount,
        entities: hasEntityArray ? samples : null,
        cells: hasCellArray ? cellSamples : null,
      })
    : null;
  return {
    purePostsPeOrder: B19_PATH_PURE_POSTS_PE_ORDER,
    pureHelperNames: B19_PATH_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasSamples,
  };
}

/**
 * Shared B20 trail residual pure-post path (B20 fields only).
 * Samples: trailEntities | b20Entities | trailSamples | b20Samples | trailPacks.
 * Wire: listBeginC82674 / listEndC82678 / listReady / mode26614.
 * Does not consume B19 event.entities / packs / samples keys.
 */
function b20TrailPurePostsFromEvent(event) {
  const samples =
    event?.trailEntities ??
    event?.trail_entities ??
    event?.b20Entities ??
    event?.b20_entities ??
    event?.trailSamples ??
    event?.trail_samples ??
    event?.b20Samples ??
    event?.b20_samples ??
    event?.trailPacks ??
    event?.trail_packs ??
    event?.b20Packs ??
    event?.b20_packs ??
    null;
  const hasEntityArray = Array.isArray(samples);
  const hasWireFields =
    event?.listBeginC82674 !== undefined ||
    event?.list_begin_c82674 !== undefined ||
    event?.listBegin !== undefined ||
    event?.list_begin !== undefined ||
    event?.beginC82674 !== undefined ||
    event?.begin !== undefined ||
    event?.listEndC82678 !== undefined ||
    event?.list_end_c82678 !== undefined ||
    event?.listEnd !== undefined ||
    event?.list_end !== undefined ||
    event?.endC82678 !== undefined ||
    event?.end !== undefined ||
    event?.listReady !== undefined ||
    event?.list_ready !== undefined;
  const hasSamples = hasEntityArray || hasWireFields;
  const purePostsApplied = hasSamples
    ? applyB20TrailPurePosts({
        listReady: event?.listReady ?? event?.list_ready,
        listBeginC82674:
          event?.listBeginC82674 ??
          event?.list_begin_c82674 ??
          event?.listBegin ??
          event?.list_begin ??
          event?.beginC82674 ??
          event?.begin,
        listEndC82678:
          event?.listEndC82678 ??
          event?.list_end_c82678 ??
          event?.listEnd ??
          event?.list_end ??
          event?.endC82678 ??
          event?.end,
        mode26614:
          event?.mode26614 ??
          event?.mode_26614 ??
          event?.gameMode26614 ??
          event?.game_mode_26614 ??
          event?.timedTransitionCleanupMode ??
          event?.timed_transition_cleanup_mode ??
          event?.mode,
        entities: hasEntityArray ? samples : null,
      })
    : null;
  return {
    purePostsPeOrder: B20_TRAIL_PURE_POSTS_PE_ORDER,
    pureHelperNames: B20_TRAIL_PURE_HELPER_NAMES.slice(),
    purePostsApplied,
    purePostsFromSamples: hasSamples,
  };
}

/**
 * Compose B19 path + B20 trail pure posts for opaqueRoomUpdateTailPath.
 * Documents both PE-order plans always; applies each when its packs land.
 */
function pathTailPurePostsFromEvent(event) {
  const b19Part = b19PathPurePostsFromEvent(event);
  const b20Part = b20TrailPurePostsFromEvent(event);
  const hasSamples =
    b19Part.purePostsFromSamples || b20Part.purePostsFromSamples;
  const pureHelperNames = B19_PATH_PURE_HELPER_NAMES.concat(
    B20_TRAIL_PURE_HELPER_NAMES,
  );
  const purePostsPeOrder = B19_PATH_PURE_POSTS_PE_ORDER.concat(
    B20_TRAIL_PURE_POSTS_PE_ORDER,
  );

  let purePostsApplied = null;
  if (hasSamples) {
    const b19 = b19Part.purePostsApplied;
    const b20 = b20Part.purePostsApplied;
    if (b19 && b20) {
      purePostsApplied = Object.freeze({
        ...b19,
        hostB20Trail: b20.hostB20Trail,
        b19FromSamples: true,
        b20FromSamples: true,
        b20,
      });
    } else if (b19) {
      // B19 only: B20 trail remains host (default hostB20Trail=1 on B19 plan).
      purePostsApplied = Object.freeze({
        ...b19,
        b19FromSamples: true,
        b20FromSamples: false,
        b20: null,
      });
    } else {
      // B20 only: B19 residual still host without flag/entity packs.
      purePostsApplied = Object.freeze({
        residualKind: null,
        pureComplete: false,
        hostNeeded: true,
        hostRebuild: 1,
        hostCellLoop: 1,
        hostEntityWalk: 1,
        hostSecondaryQuery: 1,
        hostTreePath: 1,
        hostB20Trail: b20.hostB20Trail,
        b19FromSamples: false,
        b20FromSamples: true,
        b20,
      });
    }
  }

  return {
    purePostsPeOrder,
    pureHelperNames,
    purePostsApplied,
    purePostsFromSamples: hasSamples,
  };
}

function b19PathHostVas() {
  return {
    flagTest: ROOM_B19_HOST_VA_FLAG_TEST,
    rebuildStart: ROOM_B19_HOST_VA_REBUILD_START,
    memset: ROOM_B19_HOST_VA_MEMSET,
    getGridCollision: ROOM_B19_HOST_VA_GET_GRID_COLLISION,
    entityWalk: ROOM_B19_HOST_VA_ENTITY_WALK,
    query8000: ROOM_B19_HOST_VA_QUERY_8000,
    treeAlloc: ROOM_B19_HOST_VA_TREE_ALLOC,
    posFinish: ROOM_B19_HOST_VA_POS_FINISH,
    spawn: ROOM_B19_HOST_VA_SPAWN,
    getAltPedestal: ROOM_B19_HOST_VA_GET_ALT_PEDESTAL,
    setAltPedestal: ROOM_B19_HOST_VA_SET_ALT_PEDESTAL,
    flagClear: ROOM_B19_HOST_VA_FLAG_CLEAR,
    next: ROOM_B19_HOST_VA_NEXT,
    refcount: ROOM_B19_REFCOUNT_VA,
  };
}

function b20TrailHostVas() {
  return {
    listTest: ROOM_B20_HOST_VA_LIST_TEST,
    pass1: ROOM_B20_HOST_VA_PASS1,
    pass2: ROOM_B20_HOST_VA_PASS2,
    vectorPush: ROOM_B20_HOST_VA_VECTOR_PUSH,
    spawn: ROOM_B20_HOST_VA_SPAWN,
    genrand: ROOM_B20_HOST_VA_GENRAND,
    sin: ROOM_B20_HOST_VA_SIN,
    cos: ROOM_B20_HOST_VA_COS,
    posPack: ROOM_B20_HOST_VA_POS_PACK,
    deallocate: ROOM_B20_HOST_VA_DEALLOCATE,
    flagClear: ROOM_B20_HOST_VA_FLAG_CLEAR,
    epilogue: ROOM_B20_HOST_VA_EPILOGUE,
    listBegin: ROOM_B20_LIST_BEGIN_VA,
    listEnd: ROOM_B20_LIST_END_VA,
    listCap: ROOM_B20_LIST_CAP_VA,
  };
}

function b19PathResidualLabel(applied) {
  if (!applied) return "b19-path-host";
  // B19 pure-complete NONE — B20 may still host on this residual event.
  if (applied.pureComplete) return "b19-path-b20-only";
  if ((applied.residualKind | 0) === ROOM_B19_RESIDUAL_HOST_REBUILD) {
    return "b19-path-rebuild-host";
  }
  if ((applied.residualKind | 0) === ROOM_B19_RESIDUAL_MONOLITHIC) {
    return "b19-path-monolithic";
  }
  return "b19-path-host";
}

function b20TrailResidualLabel(b20Applied) {
  if (!b20Applied) return null;
  if (b20Applied.pureComplete) return "b20-trail-none";
  if ((b20Applied.residualKind | 0) === ROOM_B20_RESIDUAL_HOST_TRAIL) {
    return "b20-trail-host";
  }
  if ((b20Applied.residualKind | 0) === ROOM_B20_RESIDUAL_MONOLITHIC) {
    return "b20-trail-monolithic";
  }
  return "b20-trail-host";
}

/**
 * Residual label for composed B19+B20 TailPath pure posts.
 * Prefer B19 labels when B19 packs land; refine with B20 when both pure or
 * B19-only was "b20-only" and B20 packs resolve the trail gate.
 */
function pathTailResidualLabel(applied) {
  if (!applied) return "b19-path-host";
  const b20 = applied.b20 ?? null;
  const b19FromSamples = !!applied.b19FromSamples;
  const b20FromSamples = !!applied.b20FromSamples;

  if (b19FromSamples && b20FromSamples) {
    const b19Pure = !!applied.pureComplete;
    const b20Pure = !!b20?.pureComplete;
    if (b19Pure && b20Pure) return "tail-path-pure-complete";
    if (b19Pure && b20) return b20TrailResidualLabel(b20);
    // B19 still hosts rebuild/monolithic; keep B19 residual name.
    return b19PathResidualLabel(applied);
  }
  if (b19FromSamples) {
    return b19PathResidualLabel(applied);
  }
  if (b20FromSamples) {
    return b20TrailResidualLabel(b20) ?? "b19-path-host";
  }
  return "b19-path-host";
}

/**
 * PE-ordered pure posts between always-on genrand slots R0–R3,R5–R7 plus Y0
 * island (no sample) after R1. R4 anim-frame genrand lives on create residual.
 * Host still owns Isaac::genrand_int32; helpers consume dwords only.
 * Genrand pure-complete requires host_genrand_sample_stream (no pure MT).
 * Stream deepen: R1 pos_x_copy + R6 color_pads between genrands.
 */
export const H5_824A70_GENRAND_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({ slot: "R0", posts: Object.freeze(["unit_float", "pos_axis"]) }),
  Object.freeze({
    slot: "R1",
    posts: Object.freeze(["unit_float", "pos_axis", "pos_x_copy"]),
  }),
  Object.freeze({
    slot: "Y0",
    posts: Object.freeze(["y_override_applies", "pos_y_final"]),
  }),
  Object.freeze({ slot: "R2", posts: Object.freeze(["unit_float", "z", "vel_pad"]) }),
  Object.freeze({ slot: "R3", posts: Object.freeze([]) }), // seed dword for create
  Object.freeze({ slot: "R5", posts: Object.freeze(["flag_bit"]) }),
  Object.freeze({ slot: "R6", posts: Object.freeze(["flag_bit", "color_pads"]) }),
  Object.freeze({ slot: "R7", posts: Object.freeze(["unit_float", "scale"]) }),
  Object.freeze({ slot: "LP", posts: Object.freeze(["loop_step"]) }),
]);

/** Map pure-post kind → room-pure-model export name (HostHandler interleave). */
export const H5_824A70_GENRAND_PURE_HELPER_BY_POST = Object.freeze({
  unit_float: "roomAmbient824a70BodyUnitFloat",
  pos_axis: "roomAmbient824a70BodyPosAxis",
  pos_x_copy: "roomAmbient824a70BodyGenrandLoopPosts", // pack.posXCopy = x
  y_override_applies: "roomAmbient824a70BodyYOverrideApplies",
  pos_y_final: "roomAmbient824a70BodyPosYFinal",
  z: "roomAmbient824a70BodyZ",
  vel_pad: "roomAmbient824a70BodyGenrandLoopPosts", // constant 0 from pack
  scale: "roomAmbient824a70BodyScale",
  flag_bit: "roomAmbient824a70BodyFlagBit",
  color_pads: "roomAmbient824a70BodyLayerColorPads", // R6 PE zeros
  loop_step: "roomAmbient824a70BodyLoopStep",
});

/** Unique pure helper names in first-appearance PE order across genrand posts. */
export const H5_824A70_GENRAND_PURE_HELPER_NAMES = Object.freeze([
  "roomAmbient824a70BodyUnitFloat",
  "roomAmbient824a70BodyPosAxis",
  "roomAmbient824a70BodyGenrandLoopPosts", // pos_x_copy + pack + vel_pad
  "roomAmbient824a70BodyYOverrideApplies",
  "roomAmbient824a70BodyPosYFinal",
  "roomAmbient824a70BodyZ",
  "roomAmbient824a70BodyFlagBit",
  "roomAmbient824a70BodyLayerColorPads",
  "roomAmbient824a70BodyScale",
  "roomAmbient824a70BodyLoopStep",
]);

/**
 * Apply freestanding pure posts for one or more PE-ordered genrand loops.
 * `samples` is flat u32[]: [R0,R1,R2,R3,R5,R6,R7] × loops.
 * `bounds` supplies room float bases for R0/R1 pos_axis plus optional
 * `age` / `roomY1c` for Y0 (defaults: age=0 → no override).
 * Optional `loopCountRemaining` (pre-decrement) drives LP loop_step; when
 * omitted, LP uses (loops remaining after this loop) from sample count.
 * Requires host_genrand_sample_stream — never invents MT dwords.
 */
export function applyH5GenrandPurePosts(samples, bounds = {}) {
  const list = Array.isArray(samples) ? samples : [];
  const minX = Math.fround(bounds.minX ?? 0);
  const spanX = Math.fround(bounds.spanX ?? 0);
  const baseY = Math.fround(bounds.baseY ?? 0);
  const spanY = Math.fround(bounds.spanY ?? 0);
  const age = bounds.age | 0;
  const roomY1c = Math.fround(bounds.roomY1c ?? bounds.room_y_1c ?? 0);
  const totalLoops = Math.floor(list.length / 7) | 0;
  const applied = [];
  let i = 0;
  while (i + 7 <= list.length) {
    const loopIndex = applied.length | 0;
    const g0 = list[i++] >>> 0;
    const g1 = list[i++] >>> 0;
    const g2 = list[i++] >>> 0;
    const g3 = list[i++] >>> 0;
    const g5 = list[i++] >>> 0;
    const g6 = list[i++] >>> 0;
    const g7 = list[i++] >>> 0;

    const pack = roomAmbient824a70BodyGenrandLoopPosts({
      g0,
      g1,
      g2,
      g3,
      g5,
      g6,
      g7,
      minX,
      spanX,
      baseY,
      spanY,
      age,
      roomY1c,
    });
    const u0 = roomAmbient824a70BodyUnitFloat(g0);
    const u1 = roomAmbient824a70BodyUnitFloat(g1);
    const u2 = roomAmbient824a70BodyUnitFloat(g2);
    const u7 = roomAmbient824a70BodyUnitFloat(g7);
    const colorPads = roomAmbient824a70BodyLayerColorPads();

    // Pre-decrement remaining for this iteration: prefer explicit bounds,
    // else PE-shaped countdown totalLoops - loopIndex.
    const preDec =
      bounds.loopCountRemaining != null
        ? (bounds.loopCountRemaining | 0) - loopIndex
        : bounds.loopCount != null
          ? (bounds.loopCount | 0) - loopIndex
          : totalLoops - loopIndex;
    const loopStep = roomAmbient824a70BodyLoopStep(preDec);

    applied.push(
      Object.freeze({
        loopIndex,
        pack: Object.freeze({ ...pack }),
        slots: Object.freeze([
          Object.freeze({
            slot: "R0",
            genrand: g0,
            unitFloat: u0,
            posAxis: pack.x,
          }),
          Object.freeze({
            slot: "R1",
            genrand: g1,
            unitFloat: u1,
            posAxis: pack.yRng,
            posXCopy: pack.posXCopy, // PE copy x → [esp+0x38]
          }),
          Object.freeze({
            slot: "Y0",
            yOverrideApplies: pack.yOverrideApplies,
            posYFinal: pack.y,
            yOverride:
              pack.yOverrideApplies !== 0
                ? roomAmbient824a70BodyYOverride(roomY1c)
                : undefined,
          }),
          Object.freeze({
            slot: "R2",
            genrand: g2,
            unitFloat: u2,
            z: pack.z,
            velPad: pack.velPad,
          }),
          Object.freeze({
            slot: "R3",
            genrand: g3, // create seed; no pure post
          }),
          Object.freeze({
            slot: "R5",
            genrand: g5,
            flagBit: pack.flag148,
          }),
          Object.freeze({
            slot: "R6",
            genrand: g6,
            flagBit: pack.flag149,
            colorPads: Object.freeze({ ...colorPads }),
          }),
          Object.freeze({
            slot: "R7",
            genrand: g7,
            unitFloat: u7,
            scale: pack.scale,
          }),
          Object.freeze({
            slot: "LP",
            remaining: loopStep.remaining,
            continueLoop: loopStep.continueLoop,
          }),
        ]),
      }),
    );
  }
  return applied;
}

function h5GenrandPurePostsInterleaveDoc() {
  return H5_824A70_GENRAND_PURE_POSTS_PE_ORDER.map((row) =>
    Object.freeze({
      slot: row.slot,
      posts: row.posts.slice(),
      pureHelpers: row.posts.map((p) => H5_824A70_GENRAND_PURE_HELPER_BY_POST[p]),
    }),
  );
}

/**
 * PE-ordered pure posts on the create residual path (one create loop).
 * Host still owns C0 create / A0 / R4 genrand CALL / A1 / A2 / L0 / V0.
 * Pure imms/gates around C0/A0/A1/A2/GetLayer (helpers ABI 39 create-only)
 * + R4 anim-frame + A2 gates + COL body_color + LC write CF freestanding when
 * samples land. LC pads are PE zeros (R6 stack writes); ColorMod.a remains
 * sample-supplied (uninit in PE residual). No pure Mersenne.
 */
export const H5_824A70_CREATE_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "C0",
    posts: Object.freeze(["create_args_plan"]),
  }),
  Object.freeze({
    slot: "A0",
    posts: Object.freeze(["entity_anm2_ptr", "anim_count_off"]),
  }),
  Object.freeze({
    slot: "R4",
    posts: Object.freeze(["anim_frame_genrand_needed", "anim_frame", "anim_frame_f32"]),
  }),
  Object.freeze({
    slot: "A1",
    posts: Object.freeze(["a1_arg", "anm_data_ptr"]),
  }),
  Object.freeze({
    slot: "A2",
    posts: Object.freeze([
      "anim_frame_apply_needed",
      "anim_frame_clear_needed",
      "a2_this_ptr",
      "create_host_gates",
    ]),
  }),
  Object.freeze({
    slot: "COL",
    posts: Object.freeze(["color"]),
  }),
  Object.freeze({
    slot: "L0",
    posts: Object.freeze(["layer_index", "getlayer_host_va"]),
  }),
  Object.freeze({
    slot: "LC",
    posts: Object.freeze([
      "layer_color_write_needed",
      "layer_color_pads",
      "layer_color_plan",
    ]),
  }),
]);

/** Map create pure-post kind → pure-helper export name (room-model). */
export const H5_824A70_CREATE_PURE_HELPER_BY_POST = Object.freeze({
  create_args_plan: "roomAmbient824a70CreateArgsPlan",
  entity_anm2_ptr: "roomAmbient824a70EntityAnm2Ptr",
  anim_count_off: "roomAmbient824a70AnimCountOff",
  anim_frame_genrand_needed: "roomAmbient824a70BodyAnimFrameGenrandNeeded",
  anim_frame: "roomAmbient824a70BodyAnimFrame",
  anim_frame_f32: "roomAmbient824a70BodyAnimFrameF32",
  a1_arg: "roomAmbient824a70A1Arg",
  anm_data_ptr: "roomAmbient824a70AnmDataPtr",
  anim_frame_apply_needed: "roomAmbient824a70BodyAnimFrameApplyNeeded",
  anim_frame_clear_needed: "roomAmbient824a70BodyAnimFrameClearNeeded",
  a2_this_ptr: "roomAmbient824a70A2ThisPtr",
  create_host_gates: "roomAmbient824a70CreateHostGates",
  anim_frame_posts: "roomAmbient824a70BodyAnimFramePosts",
  color: "roomAmbient824a70BodyColor",
  layer_index: "roomAmbient824a70LayerIndex",
  getlayer_host_va: "roomAmbient824a70HostVaGetLayer",
  layer_color_write_needed: "roomAmbient824a70BodyLayerColorWriteNeeded",
  layer_color_pads: "roomAmbient824a70BodyLayerColorPads",
  layer_color_plan: "roomAmbient824a70BodyLayerColorPlan",
});

/** Unique pure helper names for create residual (first-appearance PE order). */
export const H5_824A70_CREATE_PURE_HELPER_NAMES = Object.freeze([
  "roomAmbient824a70CreateArgsPlan",
  "roomAmbient824a70EntityAnm2Ptr",
  "roomAmbient824a70AnimCountOff",
  "roomAmbient824a70BodyAnimFrameGenrandNeeded",
  "roomAmbient824a70BodyAnimFrame",
  "roomAmbient824a70BodyAnimFrameF32",
  "roomAmbient824a70BodyAnimFramePosts",
  "roomAmbient824a70A1Arg",
  "roomAmbient824a70AnmDataPtr",
  "roomAmbient824a70BodyAnimFrameApplyNeeded",
  "roomAmbient824a70BodyAnimFrameClearNeeded",
  "roomAmbient824a70A2ThisPtr",
  "roomAmbient824a70CreateHostGates",
  "roomAmbient824a70BodyColor",
  "roomAmbient824a70LayerIndex",
  "roomAmbient824a70HostVaGetLayer",
  "roomAmbient824a70BodyLayerColorWriteNeeded",
  "roomAmbient824a70BodyLayerColorPads",
  "roomAmbient824a70BodyLayerColorPlan",
]);

/**
 * LC pure gate PE 0x00824e94…0x00824e9d (after host GetLayer).
 * Thin alias of room pure helper (ABI v33 create-only).
 */
export function h5CreateLayerColorWriteNeeded(layerPtr, stackColorPtr) {
  return roomAmbient824a70BodyLayerColorWriteNeeded(layerPtr, stackColorPtr);
}

/**
 * LC pad payload PE zeros. Thin alias of room pure helper (ABI v33 create-only).
 */
export function h5CreateLayerColorPads() {
  return Object.freeze(roomAmbient824a70BodyLayerColorPads());
}

/**
 * LC combined plan. Thin alias of room pure helper (ABI v33 create-only).
 */
export function h5CreateLayerColorPlan(input) {
  return roomAmbient824a70BodyLayerColorPlan(input);
}

function h5CreatePurePostsInterleaveDoc() {
  return H5_824A70_CREATE_PURE_POSTS_PE_ORDER.map((row) =>
    Object.freeze({
      slot: row.slot,
      posts: row.posts.slice(),
      pureHelpers: row.posts.map((p) => H5_824A70_CREATE_PURE_HELPER_BY_POST[p]),
    }),
  );
}

/**
 * Normalize create residual sample entries into objects.
 * Accepts:
 *   - [{ animCount, genrand, a1Ok?, field34?, field34Post?,
 *        stageId?, room1d18?, dim1830c?, layerPtr?, stackColorPtr?, alpha?,
 *        entityPtr?, seed? }, ...]
 *   - flat u32 pairs [animCount0, genrand0, animCount1, genrand1, ...]
 */
function normalizeH5CreateSamples(samples) {
  if (!Array.isArray(samples) || samples.length === 0) return null;
  if (typeof samples[0] === "object" && samples[0] !== null) {
    return samples.map((s) => ({
      animCount: (s.animCount ?? s.anim_count ?? 0) >>> 0,
      genrand: (s.genrand ?? s.r4 ?? 0) >>> 0,
      a1Ok: s.a1Ok ?? s.a1_ok,
      field34: s.field34 ?? s.field_34,
      field34Post: s.field34Post ?? s.field_34_post,
      stageId: s.stageId ?? s.stage_id,
      room1d18: s.room1d18 ?? s.room_1d18,
      dim1830c: s.dim1830c ?? s.dim_1830c ?? s.dim,
      layerPtr: s.layerPtr ?? s.layer_ptr,
      stackColorPtr: s.stackColorPtr ?? s.stack_color_ptr,
      alpha: s.alpha ?? s.colorAlpha ?? s.color_alpha,
      entityPtr: s.entityPtr ?? s.entity_ptr,
      seed: s.seed ?? s.r3 ?? s.createSeed ?? s.create_seed,
    }));
  }
  // Flat pairs: need at least one complete [animCount, genrand] pair.
  if (samples.length < 2) return null;
  const out = [];
  for (let i = 0; i + 2 <= samples.length; i += 2) {
    out.push({
      animCount: samples[i] >>> 0,
      genrand: samples[i + 1] >>> 0,
      a1Ok: undefined,
      field34: undefined,
      field34Post: undefined,
      stageId: undefined,
      room1d18: undefined,
      dim1830c: undefined,
      layerPtr: undefined,
      stackColorPtr: undefined,
      alpha: undefined,
      entityPtr: undefined,
      seed: undefined,
    });
  }
  return out.length > 0 ? out : null;
}

/**
 * Apply freestanding pure posts for create residual loops:
 *   C0 create args plan + A0 entity/ANM2 ptr math + R4 anim frame + optional
 *   A2 gates/create_host_gates + optional COL body_color + L0 imms + optional
 *   LC write CF. Host still owns genrand CALL / create / ANM2 / GetLayer /
 *   vcall (no pure Mersenne).
 *
 * `samples`: object array or flat [animCount, genrand] pairs (see
 * normalizeH5CreateSamples). `context` supplies default COL/LC fields for all
 * loops (stageId / room1d18 / dim1830c / stackColorPtr).
 *
 * A2 clear gate is PE-accurate: when applyNeeded is known false, clear is not
 * reached (clearNeeded=0). When applyNeeded is true, field34Post drives clear.
 */
export function applyH5CreatePurePosts(samples, context = {}) {
  const list = normalizeH5CreateSamples(samples);
  if (!list) return [];
  const ctxStage = context.stageId ?? context.stage_id;
  const ctxRoom1d18 = context.room1d18 ?? context.room_1d18;
  const ctxDim = context.dim1830c ?? context.dim_1830c ?? context.dim;
  const ctxStackColorPtr = context.stackColorPtr ?? context.stack_color_ptr;
  const applied = [];
  for (let loopIndex = 0; loopIndex < list.length; loopIndex++) {
    const s = list[loopIndex];
    const posts = roomAmbient824a70BodyAnimFramePosts(s.genrand, s.animCount);
    const entry = {
      loopIndex,
      animCount: s.animCount >>> 0,
      genrand: s.genrand >>> 0,
      genrandNeeded: posts.genrandNeeded | 0,
      frame: posts.frame >>> 0,
      frameF32: posts.frameF32,
      // C0/A0/A1/L0 pure imms always documented (create residual deepen).
      animCountOff: ROOM_AMBIENT_824A70_ANIM_COUNT_OFF >>> 0,
      a1Arg: ROOM_AMBIENT_824A70_A1_ARG >>> 0,
      anmDataPtr: ROOM_AMBIENT_824A70_ANM_DATA_PTR >>> 0,
      layerIndex: ROOM_AMBIENT_824A70_LAYER_INDEX >>> 0,
      entityAnm2Off: ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF >>> 0,
      a2ThisOff: ROOM_AMBIENT_824A70_A2_THIS_OFF >>> 0,
      field34Off: ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF >>> 0,
      field44Off: ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF >>> 0,
      vcallOff: ROOM_AMBIENT_824A70_VCALL_OFF >>> 0,
      getLayerHostVa: ROOM_AMBIENT_824A70_HOST_VA_GETLAYER >>> 0,
    };

    // C0 pure arg pack (seed from sample or R3 alias; else 0).
    const seed =
      s.seed !== undefined && s.seed !== null ? s.seed >>> 0 : 0;
    entry.createArgsPlan = Object.freeze(roomAmbient824a70CreateArgsPlan(seed));
    if (s.seed !== undefined && s.seed !== null) {
      entry.createSeed = seed;
    }

    // A0 pure: entity+0x48 when entity* sample lands.
    if (s.entityPtr !== undefined && s.entityPtr !== null) {
      entry.entityPtr = s.entityPtr >>> 0;
      entry.entityAnm2Ptr = roomAmbient824a70EntityAnm2Ptr(entry.entityPtr);
      entry.a2ThisPtr = roomAmbient824a70A2ThisPtr(entry.entityAnm2Ptr);
    }

    // A2 dual gate + post-clear (PE 0x00824cf5…0x00824d16).
    if (s.a1Ok !== undefined && s.a1Ok !== null &&
        s.field34 !== undefined && s.field34 !== null) {
      entry.a1Ok = s.a1Ok >>> 0;
      entry.field34 = s.field34 >>> 0;
      entry.applyNeeded = roomAmbient824a70BodyAnimFrameApplyNeeded(
        entry.a1Ok,
        entry.field34,
      );
      // A2 prep arg for host 0x408e00 when gate open.
      if ((entry.applyNeeded | 0) !== 0) {
        entry.a2FrameF32 = entry.frameF32;
      }
      // Clear only reached when dual gate passed (PE skips whole A2 block).
      if ((entry.applyNeeded | 0) === 0) {
        entry.clearNeeded = 0;
      } else if (s.field34Post !== undefined && s.field34Post !== null) {
        entry.field34Post = s.field34Post >>> 0;
        entry.clearNeeded = roomAmbient824a70BodyAnimFrameClearNeeded(
          entry.field34Post,
        );
      }
      // Combined create host-gates pack (PE-accurate clear).
      const field34PostForGates =
        s.field34Post !== undefined && s.field34Post !== null
          ? s.field34Post >>> 0
          : 0;
      entry.createHostGates = Object.freeze(
        roomAmbient824a70CreateHostGates({
          animCount: entry.animCount,
          a1Ok: entry.a1Ok,
          field34: entry.field34,
          field34Post: field34PostForGates,
        }),
      );
    } else if (s.field34Post !== undefined && s.field34Post !== null) {
      // Freestanding clear gate alone (no apply samples).
      entry.field34Post = s.field34Post >>> 0;
      entry.clearNeeded = roomAmbient824a70BodyAnimFrameClearNeeded(
        entry.field34Post,
      );
    }

    // COL pure RGB (helpers body_color) when stage/room/dim samples land.
    const stageId = s.stageId ?? ctxStage;
    const room1d18 = s.room1d18 ?? ctxRoom1d18;
    const dim1830c = s.dim1830c ?? ctxDim;
    if (stageId !== undefined && stageId !== null &&
        room1d18 !== undefined && room1d18 !== null &&
        dim1830c !== undefined && dim1830c !== null) {
      entry.stageId = stageId | 0;
      entry.room1d18 = room1d18 | 0;
      entry.dim1830c = dim1830c | 0;
      const rgb = roomAmbient824a70BodyColor(
        entry.stageId,
        entry.room1d18,
        entry.dim1830c,
      );
      entry.color = Object.freeze({ r: rgb.r, g: rgb.g, b: rgb.b });
    }

    // LC write CF when host GetLayer sample + stack color ptr land
    // (room pure helpers ABI v33 create-only).
    const layerPtr = s.layerPtr;
    const stackColorPtr =
      s.stackColorPtr !== undefined && s.stackColorPtr !== null
        ? s.stackColorPtr
        : ctxStackColorPtr;
    if (layerPtr !== undefined && layerPtr !== null &&
        stackColorPtr !== undefined && stackColorPtr !== null) {
      entry.layerPtr = layerPtr >>> 0;
      entry.stackColorPtr = stackColorPtr >>> 0;
      entry.layerColorWriteNeeded = roomAmbient824a70BodyLayerColorWriteNeeded(
        entry.layerPtr,
        entry.stackColorPtr,
      );
      entry.layerColorPads = Object.freeze(roomAmbient824a70BodyLayerColorPads());
      const rgb = entry.color ?? { r: 0, g: 0, b: 0 };
      if (entry.color) {
        entry.layerColorRgb = entry.color;
      }
      const alphaDefined =
        s.alpha !== undefined && s.alpha !== null ? 1 : 0;
      const alpha = alphaDefined ? Math.fround(s.alpha) : 0;
      if (alphaDefined) {
        entry.layerColorAlpha = alpha;
        entry.layerColorAlphaDefined = true;
      } else {
        entry.layerColorAlphaDefined = false;
      }
      entry.layerColorPlan = Object.freeze(
        roomAmbient824a70BodyLayerColorPlan({
          layerPtr: entry.layerPtr,
          stackColorPtr: entry.stackColorPtr,
          r: rgb.r,
          g: rgb.g,
          b: rgb.b,
          alphaDefined,
          alpha,
        }),
      );
      // Document PE ColorMod relative offsets (create residual imms).
      entry.layerColorOff = ROOM_AMBIENT_824A70_LAYER_COLOR_OFF;
      entry.layerColorZero16Off = ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF;
      entry.layerColorPadQwordOff =
        ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF;
      entry.layerColorPadDwordOff =
        ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF;
    }

    applied.push(Object.freeze(entry));
  }
  return applied;
}

/**
 * PE-ordered pure posts inside one B1 spawn-loop iteration
 * (0x00802c20…0x00802e00 arithmetic). Host still owns EntitySaveState shuffle,
 * FUN_00813520 position, FUN_00428b20 spawn, FUN_007ef420 bind, cleanup.
 * `roomB1SpawnIterPlan` packs the pure posts for HostHandler apply.
 */
export const B1_SPAWN_ITER_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({ slot: "REMAINING", posts: Object.freeze(["loop_remaining"]) }),
  Object.freeze({
    slot: "SEED_GATE_SHUFFLE",
    posts: Object.freeze(["seed_nonzero", "rng_xorshift"]),
  }),
  Object.freeze({
    slot: "SHUFFLE",
    posts: Object.freeze([
      "shuffle_remainder",
      "shuffle_needs_swap",
      "shuffle_swap_index",
      "buffer_elem_offset",
    ]),
  }),
  Object.freeze({
    slot: "SEED_GATE_CORNER",
    posts: Object.freeze(["seed_nonzero", "rng_xorshift"]),
  }),
  Object.freeze({
    slot: "CORNER",
    posts: Object.freeze(["corner_pick", "corner_world_xy"]),
  }),
  Object.freeze({
    slot: "POS_IMMS",
    posts: Object.freeze(["spawn_radius", "position_zero_pad"]),
  }),
  Object.freeze({ slot: "CONTINUE", posts: Object.freeze(["loop_continue"]) }),
  Object.freeze({
    slot: "POST_SPAWN",
    posts: Object.freeze(["entity_post_spawn_mark"]),
  }),
  Object.freeze({ slot: "PACK", posts: Object.freeze(["spawn_iter_plan"]) }),
]);

/** Map B1 spawn-iter pure-post kind → room-pure-model export name. */
export const B1_SPAWN_ITER_PURE_HELPER_BY_POST = Object.freeze({
  loop_remaining: "roomB1LoopRemaining",
  seed_nonzero: "roomB1SeedNonzero",
  rng_xorshift: "roomB1RngXorshift",
  shuffle_remainder: "roomB1ShuffleRemainder",
  shuffle_needs_swap: "roomB1ShuffleNeedsSwap",
  shuffle_swap_index: "roomB1ShuffleSwapIndex",
  buffer_elem_offset: "roomB1BufferElemOffset",
  corner_pick: "roomB1CornerPick",
  corner_world_xy: "roomB1CornerWorldXy",
  spawn_radius: "roomB1SpawnRadius",
  position_zero_pad: "roomB1PositionZeroPad",
  loop_continue: "roomB1LoopContinue",
  entity_post_spawn_mark: "roomB1EntityPostSpawnMark",
  spawn_iter_plan: "roomB1SpawnIterPlan",
});

/** Unique pure helper names in first-appearance PE order (B1 spawn iter). */
export const B1_SPAWN_ITER_PURE_HELPER_NAMES = Object.freeze([
  "roomB1LoopRemaining",
  "roomB1SeedNonzero",
  "roomB1RngXorshift",
  "roomB1ShuffleRemainder",
  "roomB1ShuffleNeedsSwap",
  "roomB1ShuffleSwapIndex",
  "roomB1BufferElemOffset",
  "roomB1CornerPick",
  "roomB1CornerWorldXy",
  "roomB1SpawnRadius",
  "roomB1PositionZeroPad",
  "roomB1LoopContinue",
  "roomB1EntityPostSpawnMark",
  "roomB1SpawnIterPlan",
]);

function b1SpawnPurePostsInterleaveDoc() {
  return B1_SPAWN_ITER_PURE_POSTS_PE_ORDER.map((row) =>
    Object.freeze({
      slot: row.slot,
      posts: row.posts.slice(),
      pureHelpers: row.posts.map((p) => B1_SPAWN_ITER_PURE_HELPER_BY_POST[p]),
    }),
  );
}

/**
 * Normalize B1 spawn-iter sample entries for HostHandler pure posts.
 * Accepts:
 *   - [{ seedIn, index, spawnCount, corners|{c0..c3}, widthC }, ...]
 *   - flat seed+i packs [seed0, i0, seed1, i1, ...] with context
 *     { spawnCount, corners|widthC+height10, widthC }
 * Aliases: seed/seed_in, i, width/width_c, height10/height.
 */
function normalizeB1SpawnSamples(samples, context = {}) {
  if (!Array.isArray(samples) || samples.length === 0) return null;

  const defaultWidthC =
    context.widthC ?? context.width ?? context.width_c ?? null;
  const defaultHeight10 =
    context.height10 ?? context.height ?? context.height_10 ?? null;
  let defaultCorners = context.corners ?? null;
  if (
    !defaultCorners &&
    defaultWidthC !== null &&
    defaultWidthC !== undefined &&
    defaultHeight10 !== null &&
    defaultHeight10 !== undefined
  ) {
    defaultCorners = roomB1CornerIndices(defaultWidthC, defaultHeight10);
  }
  const defaultSpawnCount =
    context.spawnCount ?? context.spawn_count ?? null;

  const resolveCorners = (s) => {
    let corners = s?.corners ?? defaultCorners;
    const widthC = s?.widthC ?? s?.width ?? s?.width_c ?? defaultWidthC;
    const height10 =
      s?.height10 ?? s?.height ?? s?.height_10 ?? defaultHeight10;
    if (
      !corners &&
      widthC !== null &&
      widthC !== undefined &&
      height10 !== null &&
      height10 !== undefined
    ) {
      corners = roomB1CornerIndices(widthC, height10);
    }
    return { corners, widthC };
  };

  if (typeof samples[0] === "object" && samples[0] !== null) {
    const out = [];
    for (const s of samples) {
      const seedIn = (s.seedIn ?? s.seed ?? s.seed_in ?? 0) >>> 0;
      const index = (s.index ?? s.i ?? 0) | 0;
      const spawnCount =
        s.spawnCount ?? s.spawn_count ?? defaultSpawnCount;
      const { corners, widthC } = resolveCorners(s);
      if (
        spawnCount === null ||
        spawnCount === undefined ||
        !corners ||
        widthC === null ||
        widthC === undefined
      ) {
        return null;
      }
      out.push({
        seedIn,
        index,
        spawnCount: spawnCount | 0,
        corners: {
          c0: corners.c0 | 0,
          c1: corners.c1 | 0,
          c2: corners.c2 | 0,
          c3: corners.c3 | 0,
        },
        widthC: widthC | 0,
      });
    }
    return out.length > 0 ? out : null;
  }

  // Flat seed+i packs require shared spawnCount / corners / widthC context.
  if (
    defaultSpawnCount === null ||
    defaultSpawnCount === undefined ||
    !defaultCorners ||
    defaultWidthC === null ||
    defaultWidthC === undefined
  ) {
    return null;
  }
  if (samples.length < 2) return null;
  const out = [];
  for (let i = 0; i + 2 <= samples.length; i += 2) {
    out.push({
      seedIn: samples[i] >>> 0,
      index: samples[i + 1] | 0,
      spawnCount: defaultSpawnCount | 0,
      corners: {
        c0: defaultCorners.c0 | 0,
        c1: defaultCorners.c1 | 0,
        c2: defaultCorners.c2 | 0,
        c3: defaultCorners.c3 | 0,
      },
      widthC: defaultWidthC | 0,
    });
  }
  return out.length > 0 ? out : null;
}

/**
 * Apply freestanding B1 spawn-iter pure posts (roomB1SpawnIterPlan pack).
 * Host still owns EntitySaveState shuffle / position / spawn / bind / cleanup.
 *
 * `samples`: object array or flat [seed, i] pairs (see normalizeB1SpawnSamples).
 * `context`: shared spawnCount / corners / widthC / height10 for flat packs.
 */
export function applyB1SpawnIterPurePosts(samples, context = {}) {
  const list = normalizeB1SpawnSamples(samples, context);
  if (!list) return [];
  const applied = [];
  for (let loopIndex = 0; loopIndex < list.length; loopIndex++) {
    const s = list[loopIndex];
    const plan = roomB1SpawnIterPlan(s);
    applied.push(
      Object.freeze({
        loopIndex,
        seedIn: s.seedIn >>> 0,
        index: s.index | 0,
        spawnCount: s.spawnCount | 0,
        seedFatal: plan.seedFatal | 0,
        remaining: plan.remaining | 0,
        seedShuffle: plan.seedShuffle >>> 0,
        shuffleRem: plan.shuffleRem >>> 0,
        needsSwap: plan.needsSwap | 0,
        swapIndex: plan.swapIndex | 0,
        elemOffset: plan.elemOffset | 0,
        swapOffset: plan.swapOffset | 0,
        seedCorner: plan.seedCorner >>> 0,
        cornerIndex: plan.cornerIndex | 0,
        worldX: plan.worldX,
        worldY: plan.worldY,
        spawnRadius: plan.spawnRadius,
        nextI: plan.nextI | 0,
        continueLoop: plan.continueLoop | 0,
        // Pure post after host spawn (entity+0x32c = -1); constant freestanding.
        postSpawnMark: roomB1EntityPostSpawnMark(),
      }),
    );
  }
  return applied;
}

function b1SpawnHostVas() {
  return {
    spawnSetup: ROOM_B1_HOST_VA_SPAWN_SETUP,
    owner: ROOM_B1_HOST_VA_OWNER,
    quality: ROOM_B1_HOST_VA_QUALITY,
    shuffleCopy: ROOM_B1_HOST_VA_SHUFFLE_COPY,
    shuffleAssign: ROOM_B1_HOST_VA_SHUFFLE_ASSIGN,
    shuffleDtor: ROOM_B1_HOST_VA_SHUFFLE_DTOR,
    position: ROOM_B1_HOST_VA_POSITION,
    spawn: ROOM_B1_HOST_VA_SPAWN,
    postBind: ROOM_B1_HOST_VA_POST_BIND,
    cleanup: ROOM_B1_HOST_VA_CLEANUP,
  };
}

/**
 * Shared B1 spawn residual pure-post apply path (SPAWN fragment + MONOLITHIC).
 * Samples: event.spawnSamples | seedSamples | samples.
 * Context: event.spawnCount / corners / widthC / height10.
 */
function b1SpawnPurePostsFromEvent(event) {
  const samples =
    event?.spawnSamples ?? event?.seedSamples ?? event?.samples ?? null;
  const context = {
    spawnCount: event?.spawnCount ?? event?.spawn_count,
    corners: event?.corners,
    widthC: event?.widthC ?? event?.width ?? event?.width_c,
    height10: event?.height10 ?? event?.height ?? event?.height_10,
  };
  const normalized = normalizeB1SpawnSamples(samples, context);
  const hasSamples = Array.isArray(normalized) && normalized.length > 0;
  return {
    purePostsPeOrder: b1SpawnPurePostsInterleaveDoc(),
    pureHelperNames: B1_SPAWN_ITER_PURE_HELPER_NAMES.slice(),
    purePostsApplied: hasSamples
      ? applyB1SpawnIterPurePosts(samples, context)
      : null,
    purePostsFromSamples: hasSamples,
  };
}

function writeBinaryField(view, base, field, value) {
  if (field.type === "f32") view.setFloat32(base + field.offset, Math.fround(value ?? 0), true);
  else if (field.type === "u32") view.setUint32(base + field.offset, (value ?? 0) >>> 0, true);
  else if (field.type === "u8") view.setUint8(base + field.offset, (value ?? 0) & 0xff);
  else view.setInt32(base + field.offset, (value ?? 0) | 0, true);
}

function readBinaryField(view, base, field) {
  if (field.type === "f32") return view.getFloat32(base + field.offset, true);
  if (field.type === "u32") return view.getUint32(base + field.offset, true);
  if (field.type === "u8") return view.getUint8(base + field.offset);
  return view.getInt32(base + field.offset, true);
}

/** Browser URL served by scripts/serve.mjs (project-root output/decomp/wasm-slice). */
export const BROWSER_SLICE_WASM_URL = "/@decomp/wasm/game-update-slice.wasm";

function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

async function loadWasmBytes(source) {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (typeof source !== "string") {
    throw new Error("Wasm source must be a path, URL, or byte buffer");
  }
  const looksUrl =
    /^(https?:)?\/\//.test(source) ||
    source.startsWith("/") ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("@") ||
    source.includes("://");
  if (isBrowserEnvironment() || (typeof fetch === "function" && looksUrl && !/^[A-Za-z]:[\\/]/.test(source))) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch Game::Update slice Wasm: ${response.status} ${source}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  const { readFileSync } = await import("node:fs");
  const { dirname, join, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  const path = source.includes("/") || source.includes("\\")
    ? source
    : join(root, "output", "decomp", "wasm-slice", source);
  return new Uint8Array(readFileSync(path));
}

export const FRAME_PATH_MODE = Object.freeze({
  NATIVE_WASM: "native-wasm",
  EMULATOR_X86: "emulator-x86",
});

/** Residual host events still required after the translated Game::Update body. */
export const HOST_EVENT_KINDS = Object.freeze([
  "hudPostUpdate",
  "playerHudUpdateHearts",
  "playerHudGfxResidual",
  "playerHudDirtyNotify",
  "hudHistoryResidual",
  "hudStatResidual",
  "opaqueCall0092e300",
  "opaqueGlobal4aba0Refresh",
  "opaqueCall009b6840",
  "opaqueCall00857450",
  "opaqueCall0092f1c0",
  "opaqueCall008318a0",
  "opaqueCall0098dba0PlayerWalk",
  "genericPromptUpdate",
  "itemOverlayUpdate",
  "opaqueCall00746560",
  "opaqueCall009bea10",
  "opaqueCall0040c7f0",
  "opaqueCall009b7680",
  "menuAuxListClear",
  "opaqueCall008ef990",
  "opaqueCall004212c0",
  "opaqueCall006fdc10",
  "opaqueCall006fd7c0Mode4Sfx",
  "opaqueFrameEffect6fd7c0Shell",
  "opaqueRoomTransitionEnginePrefix",
  "opaqueRoomTransitionEngineBody",
  "opaqueRoomUpdatePrefixB1",
  "opaqueRoomUpdatePrefixB1Sfx",
  "opaqueRoomUpdatePrefixB1Spawn",
  "opaqueRoomUpdatePrefixB2",
  "opaqueRoomUpdatePrefixB3B7",
  "opaqueRoomUpdatePrefixB8",
  "opaqueRoomUpdatePrefixB9B11",
  "roomTriggerOutput",
  "opaqueRoomUpdateClearPath",
  "clearPathFlagStore",
  "opaqueRoomUpdateClearDoorSlots",
  /* ABI v119 (update-v119-door-removal): idx-24/idx-33 typed carriers —
     the coarse kinds opaqueRoomUpdateClearDoorSlots / opaqueRoomUpdateClearDoors
     stay listed but NEVER fire (retired edges, frozen ABI). */
  "opaqueRoomUpdateClearDoorSlotsMask",
  "roomTriggerClearStats",
  "roomTriggerClearAudioNonGreed",
  "roomTriggerClearAudio",
  "roomTriggerClearAwardsNonGreed",
  "roomTriggerClearAwardsBit7",
  "roomTriggerClearAwardsGreed",
  "roomTriggerClearAwardsTail",
  "opaqueRoomUpdateClearDoors",
  "type5DoorOpenCalls",
  "type5DoorForcedRerun",
  "opaqueRoomUpdateAmbient",
  "opaqueRoomUpdateAmbient824a70",
  "opaqueRoomUpdateAmbient824a70Genrand",
  "opaqueRoomUpdateAmbient824a70Create",
  "opaqueRoomUpdateTailRain",
  "opaqueRoomUpdateTailWaterB16",
  "opaqueRoomUpdateTailMid",
  "opaqueRoomUpdateTailMid706cExpire",
  "opaqueRoomUpdateTailMidRestock",
  "opaqueRoomUpdateTailMid7230Spawn",
  "opaqueRoomUpdateTailEntity",
  "opaqueRoomUpdateTailPath",
  "playerManagerUpdateDeath",
  "playerManagerUpdateHeartbeat",
  "playerManagerUpdateHeartbeatSfxUpdate",
  "playerManagerUpdateHeartbeatSfxPlay",
  "playerManagerUpdateHeartbeatSfxStop",
  "opaqueCall004257b0PassA",
  "opaqueCall004257b0PassB",
  "listUpdate6772c",
  "opaqueCall008607a0",
  "opaqueCall0098dba0Timer",
  "hudMessageTextOut",
  "transitionQueueScreen",
  "transitionRestartFlow",
  "transitionNextVictoryLap",
  "transitionOpaqueMode",
  /* Game::Exit root plan step (ABI 40): PE-ordered event words reported per
     frame by the wired Exit root session. Names match the Exit family's
     exported event kinds (EXIT_ROOT_EVENT_* + map-walk kinds). */
  "exitRootHost",
  "exitRootVectorDtorLoop",
  "exitRootMapWalk",
  "exitRootMapWalkElemHost",
  "exitRootMapWalkGlobalHost",
  "exitRootMapWalkFlagClear",
  "exitRootMapWalkMonolithic",
]);

function exported(wasm, name) {
  const value = wasm[name] ?? wasm[`_${name}`];
  if (typeof value !== "function") throw new Error(`Missing Wasm export: ${name}`);
  return value;
}

/**
 * Resolve which path owns the simulation tick.
 * The shipped default is native-wasm whenever the slice module is available.
 */
export function selectFramePath({ preferNative = true, wasmAvailable = true } = {}) {
  if (preferNative && wasmAvailable) return FRAME_PATH_MODE.NATIVE_WASM;
  return FRAME_PATH_MODE.EMULATOR_X86;
}

export function isX86EmulationFramePath(mode) {
  return mode === FRAME_PATH_MODE.EMULATOR_X86;
}

/**
 * Load the standalone Game::Update slice Wasm module (zero imports).
 * @param {string|Uint8Array|ArrayBuffer} [wasmSource]
 *   Node path, browser URL, or preloaded bytes. Defaults to filesystem path in
 *   Node and {@link BROWSER_SLICE_WASM_URL} in the browser.
 */
export async function loadGameUpdateSliceWasm(wasmSource) {
  let source = wasmSource;
  if (source == null) {
    if (isBrowserEnvironment()) {
      source = BROWSER_SLICE_WASM_URL;
    } else {
      const { dirname, join, resolve } = await import("node:path");
      const { fileURLToPath } = await import("node:url");
      const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
      source = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
    }
  }
  const bytes = await loadWasmBytes(source);
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
  const abiVersion = exported(wasm, "isaac_game_update_slice_abi_version")();
  if (abiVersion !== ABI_VERSION) {
    throw new Error(`Unexpected slice ABI version ${abiVersion}; expected ${ABI_VERSION}`);
  }
  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    usesX86Emulation: false,
    abiVersion,
    wasm,
    memory: wasm.memory,
    source: typeof source === "string" ? source : "<bytes>",
    paths: {
      step: exported(wasm, "isaac_game_update_slice_step_scratch"),
      resumeGate1b83c: exported(wasm, "isaac_game_update_slice_resume_gate_1b83c_scratch"),
      resume92f1c0: exported(wasm, "isaac_game_update_slice_resume_92f1c0_scratch"),
      resumeGenericPrompt: exported(wasm, "isaac_game_update_slice_resume_generic_prompt_scratch"),
      resumeItemOverlay: exported(wasm, "isaac_game_update_slice_resume_item_overlay_scratch"),
      continueTimedTransition: exported(wasm, "isaac_game_update_slice_continue_timed_transition_scratch"),
      continueMenuGates: exported(wasm, "isaac_game_update_slice_continue_menu_gates_scratch"),
      resumeMenuOpen: exported(wasm, "isaac_game_update_slice_resume_menu_open_scratch"),
      resumeMenuUpdate: exported(wasm, "isaac_game_update_slice_resume_menu_update_scratch"),
      resumeFrameAuxUpdates: exported(wasm, "isaac_game_update_slice_resume_frame_aux_updates_scratch"),
      resumeStageTransitionEffect: exported(wasm, "isaac_game_update_slice_resume_stage_transition_effect_scratch"),
      resumeRoomTransitionEffect: exported(wasm, "isaac_game_update_slice_resume_room_transition_effect_scratch"),
      resumeEnginePrefix: exported(wasm, "isaac_game_update_slice_resume_engine_prefix_scratch"),
      resume98dba0PlayerWalk: exported(wasm, "isaac_game_update_slice_resume_98dba0_player_walk_scratch"),
      resumeRoomUpdatePrefixB1: exported(wasm, "isaac_game_update_slice_resume_room_update_prefix_b1_scratch"),
      resumeRoomUpdatePrefixB2: exported(wasm, "isaac_game_update_slice_resume_room_update_prefix_b2_scratch"),
      resumeRoomUpdatePrefix: exported(wasm, "isaac_game_update_slice_resume_room_update_prefix_scratch"),
      resumeRoomClearNested: exported(wasm, "isaac_game_update_slice_resume_room_clear_nested_scratch"),
      resumeRoomUpdateClear: exported(wasm, "isaac_game_update_slice_resume_room_update_clear_scratch"),
      resumeRoomUpdateHead: exported(wasm, "isaac_game_update_slice_resume_room_update_head_scratch"),
      resumeFrameManagerUpdates: exported(wasm, "isaac_game_update_slice_resume_frame_manager_updates_scratch"),
      resume4257b0PassA: exported(wasm, "isaac_game_update_slice_resume_4257b0_pass_a_scratch"),
      reset: exported(wasm, "isaac_game_update_slice_reset_scratch"),
      stateAddress: exported(wasm, "isaac_game_update_slice_state_address"),
      constantsAddress: exported(wasm, "isaac_game_update_slice_constants_address"),
      runtimeInputsAddress: exported(wasm, "isaac_game_update_slice_runtime_inputs_address"),
      eventsAddress: exported(wasm, "isaac_game_update_slice_events_address"),
      gameObjectAddress: exported(wasm, "isaac_game_update_slice_game_object_address"),
      gameObjectSize: exported(wasm, "isaac_game_update_slice_game_object_size"),
      captureScratch: exported(wasm, "isaac_game_update_slice_capture_scratch"),
      applyScratch: exported(wasm, "isaac_game_update_slice_apply_scratch"),
    },
  };
}

/**
 * Platform/IO residual kinds that are acceptable long-term without PE.
 * HostHandler may no-op these after counting (presentation, Lua unref, clocks).
 */
export const PLATFORM_IO_HOST_KINDS = Object.freeze([
  "opaqueCall008607a0", // luaL_unref path
  "transitionQueueScreen",
  "listUpdate6772c",
  "hudMessageTextOut",
  /* ABI v44: PM3 SFX residual bodies are audio platform IO (no PE). */
  "playerManagerUpdateHeartbeatSfxUpdate",
  "playerManagerUpdateHeartbeatSfxPlay",
  "playerManagerUpdateHeartbeatSfxStop",
]);

/**
 * Write sparse field values into a Game-object-sized buffer using BINARY_LAYOUT.
 * Only translated sparse offsets are written; remaining bytes are left as-is.
 */
export function writeSparseFieldsToGameObject(gameObject, sparseFields) {
  if (!(gameObject instanceof Uint8Array)) {
    throw new Error("gameObject must be Uint8Array");
  }
  if (gameObject.byteLength < GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be at least ${GAME_OBJECT_MIN_SIZE} bytes`);
  }
  const view = new DataView(gameObject.buffer, gameObject.byteOffset, gameObject.byteLength);
  for (const [name, value] of Object.entries(sparseFields || {})) {
    /* ABI v67: state names whose buffer home is recorded under a different
       BINARY_LAYOUT key (rankDisplayClear3b0Out → rankDisplayByte3b0) reach
       the buffer through the alias map — before v67 a state-keyed write for
       them was a silent no-op. */
    const field = BINARY_LAYOUT[name] ?? BINARY_LAYOUT[STATE_TO_BINARY_ALIASES[name]];
    if (!field) continue;
    writeBinaryField(view, 0, field, value);
  }
  return gameObject;
}

/**
 * Read sparse translated fields from a Game-object-sized buffer. Aliased
 * fields (STATE_TO_BINARY_ALIASES) are reported under BOTH names so callers
 * that filter to session state keys pick up the state-named value.
 */
export function readSparseFieldsFromGameObject(gameObject) {
  if (!(gameObject instanceof Uint8Array) || gameObject.byteLength < GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be Uint8Array of size >= ${GAME_OBJECT_MIN_SIZE}`);
  }
  const view = new DataView(gameObject.buffer, gameObject.byteOffset, gameObject.byteLength);
  const out = {};
  for (const [name, field] of Object.entries(BINARY_LAYOUT)) {
    out[name] = readBinaryField(view, 0, field);
  }
  for (const [stateName, binaryName] of Object.entries(STATE_TO_BINARY_ALIASES)) {
    out[stateName] = readBinaryField(view, 0, BINARY_LAYOUT[binaryName]);
  }
  return out;
}

/**
 * Copy external game-object bytes into the slice scratch buffer.
 */
export function loadGameObjectIntoScratch(slice, gameObject) {
  if (!slice?.paths?.gameObjectAddress) {
    throw new Error("slice missing gameObjectAddress export");
  }
  const size = slice.paths.gameObjectSize() >>> 0;
  if (size !== GAME_OBJECT_MIN_SIZE) {
    throw new Error(`Unexpected game object size ${size}; expected ${GAME_OBJECT_MIN_SIZE}`);
  }
  if (!(gameObject instanceof Uint8Array) || gameObject.byteLength < size) {
    throw new Error(`gameObject must be Uint8Array of size >= ${size}`);
  }
  const dest = new Uint8Array(slice.memory.buffer, slice.paths.gameObjectAddress(), size);
  dest.set(gameObject.subarray(0, size));
  return size;
}

/**
 * Copy slice scratch game object into a Uint8Array (allocate if needed).
 */
export function exportGameObjectFromScratch(slice, out = null) {
  const size = slice.paths.gameObjectSize() >>> 0;
  const src = new Uint8Array(slice.memory.buffer, slice.paths.gameObjectAddress(), size);
  if (out) {
    if (!(out instanceof Uint8Array) || out.byteLength < size) {
      throw new Error(`out buffer must be Uint8Array of size >= ${size}`);
    }
    out.set(src);
    return out;
  }
  return new Uint8Array(src);
}

/**
 * Capture sparse state from scratch game object via Wasm capture export.
 */
export function captureSparseStateFromScratch(slice) {
  if (slice.paths.captureScratch() !== 1) {
    throw new Error("Wasm capture_scratch failed");
  }
  const view = new DataView(slice.memory.buffer);
  return readStruct(view, slice.paths.stateAddress(), STATE_LAYOUT);
}

/**
 * Apply sparse state from JS object into scratch game object via Wasm apply.
 */
export function applySparseStateToScratch(slice, state) {
  const view = new DataView(slice.memory.buffer);
  writeStruct(view, slice.paths.stateAddress(), STATE_LAYOUT, state);
  if (slice.paths.applyScratch() !== 1) {
    throw new Error("Wasm apply_scratch failed");
  }
}

/**
 * Default sparse constants for browser/dev native ticks (float32 PE steps).
 */
export function createDefaultNativeConstants() {
  const view = new DataView(new ArrayBuffer(4));
  const f32 = (bits) => {
    view.setUint32(0, bits >>> 0, true);
    return view.getFloat32(0, true);
  };
  return {
    resetPositionXBits: 0xc0500000,
    resetPositionYBits: 0x40f00000,
    decayThreshold: 0.015625,
    decayFactor: 0.875,
    transitionComplete: 1,
    fadeOutStep: f32(0x3d088889),
    fadeInStep: f32(0x3d430c31),
    fadeComplete: 1,
  };
}

/**
 * Default runtime inputs that exercise pure-gated residual hosts on common play.
 */
export function createDefaultNativeRuntimeInputs(overrides = {}) {
  return {
    globalRangeByteLength: 8,
    monotonicCounterLow: 0,
    monotonicCounterHigh: 0,
    monotonicBaselineLow: 0,
    monotonicBaselineHigh: 0,
    globalMenuGuard4b3ca: 1,
    globalMenuEnable2a3a5: 0,
    doorSlots: [{ present: 1, field3a0: 0, field8: 1, fieldC: 5 }],
    frameOpaque4257b0IdCount: 1,
    frameOpaque4257b0ListCount: 1,
    roomGridCells: 15,
    midRestockOwner0x209: 1,
    ambientRoomActive: 1,
    /* entry=0 → first frame age==1 opens B1; mid-restock needs age>1 (opt-in). */
    ambientRoomEntry11f0: 0,
    /* ABI v44: count=1 blob=0 forces MONOLITHIC PM heartbeat residual. */
    pmIntensityPlayerCount: 1,
    pmIntensitySfxPlaying: 0,
    pmIntensityBlobReady: 0,
    /* ABI v45: sfxReady=0 forces MONOLITHIC B1 under open outer gate. */
    b1SfxReady: 0,
    b1BufferReady: 0,
    /* ABI v48: sparse packs default 0 → MONOLITHIC B3B7/B9B11 parents. */
    b3b7SparseReady: 0,
    b9b11InputsReady: 0,
    ...overrides,
  };
}

/**
 * Minimal sparse Game state for one native tick (falls through to room/frame path).
 *
 * ABI v67: enumerates EVERY STATE_LAYOUT key (zero unless a browser default
 * below says otherwise). The session's statePatch guard and the browser
 * snapshot-seed filter both test `key in session.state`, so a default object
 * missing keys silently rejected first-tick patches on 66 legitimate sparse
 * fields (including roomDescFlags44) and dropped them from live-capture
 * seeds — the same silently-discarded-caller-state class the Room capture
 * contract exists to close.
 */
export function createDefaultNativeState(overrides = {}) {
  const state = {};
  for (const name of Object.keys(STATE_LAYOUT)) state[name] = 0;
  return {
    ...state,
    /* Browser/dev defaults that differ from zero (pre-v67 values kept). */
    positionXBits: 1,
    positionYBits: 2,
    transitionRate: 0.1,
    fadeProgress26518: 0.2,
    shakeCurrent67738: 1,
    shakeStep67740: 0.5,
    timer269e0: 1,
    roomFxLimit70dc: 2,
    roomFxValue70cc: 1,
    roomFxStep70d4: 0.5,
    roomType8: 2,
    ...overrides,
  };
}

/**
 * Create a residual HostHandler that never re-enters x86 PE emulation.
 * Counts events by kind; optional `onEvent` for logging/bridge hooks.
 */
export function createLoggingHostHandler({ onEvent = null } = {}) {
  const totals = Object.create(null);
  const handler = (event) => {
    if (!event || !event.kind) return;
    if (String(event.kind).toLowerCase().includes("emulator")) {
      throw new Error(`HostHandler must not route through PE emulator: ${event.kind}`);
    }
    totals[event.kind] = (totals[event.kind] || 0) + (event.count || 1);
    if (typeof onEvent === "function") onEvent(event);
  };
  handler.totals = totals;
  handler.usesX86Emulation = false;
  return handler;
}

/**
 * Native residual bodies for hot host fragments (no PE).
 *
 * - B1 (ABI v45): MONOLITHIC or split SFX/SPAWN via roomB1WireDecide; once-flag
 *   pure-applied on Update path. PE-exact Play imms (id 0xbe). Spawn residual
 *   (and MONOLITHIC) documents PE-ordered spawn-iter pure posts
 *   (roomB1SpawnIterPlan pack) and applies them when spawnSamples / seed+i
 *   packs land (helpers ABI v26 freestanding; no Update ABI change).
 * - B18 entity (helpers ABI v29 freestanding): roomB18WireDecide + type-route
 *   pure posts on opaqueRoomUpdateTailEntity. When entity samples / wire
 *   fields land, apply pure plan; type-5 @ 0x006e17c0 / RTTI @ 0x00af08b1 /
 *   path-B @ 0x006da530 remain host for HOST_WALK/MONOLITHIC. Empty-list
 *   under open outer gate is pure-complete. No Update ABI change.
 * - B19 path (helpers ABI v30 freestanding): roomB19WireDecide + cell/entity
 *   pure posts on opaqueRoomUpdateTailPath. When entity/cell samples / wire
 *   fields land, apply pure plan; flag-on always hosts rebuild (refcount /
 *   memset / GetGridCollision / query / tree / pathfinding / pedestal). Flag
 *   off is B19 pure-complete NONE. No Update ABI change.
 * - B20 trail (helpers ABI v31 freestanding): roomB20WireDecide + pass1/pass2
 *   pure posts composed on the same opaqueRoomUpdateTailPath residual. When
 *   trail entity packs / list begin-end wire fields land, apply pure plan;
 *   begin==end is B20 pure-complete NONE; begin!=end always hosts trail
 *   (SEH/vector/spawn). Without B20 samples, trail stays host. No Update ABI
 *   change.
 * - PM1 death: freestanding pure dual-zero + eligibility + wire_decide (helpers
 *   ABI v4). When event.players / deathPlayers / packs / samples land, apply
 *   pure plan and record purePostsApplied; TriggerDeath body @ 0x007a1090
 *   remains host for WALK/MONOLITHIC. Without samples: document pure helpers
 *   + host VAs only. No Update ABI change.
 * - PM2/PM3: monolithic heartbeat or split SFX kinds (id 0x1fc).
 * - H5 824a70: PE-exact create/GetLayer imms (type 0x3e8 / variant 0x8a /
 *   layer 0 / ANM data 0xb1bc54 / A1 arg 1); host residual starts at first
 *   genrand 0x00824bb3. Genrand residual documents PE-ordered pure posts
 *   (unit_float/pos_axis/z/scale/flag_bit) and applies them when samples land.
 *   Create residual applies R4 anim_frame pure posts (+ optional A2 gates +
 *   COL body_color + LC write CF) when createSamples / animFrameSamples /
 *   samples land (event-level stageId/room1d18/dim/stackColorPtr as defaults).
 */
export function createDefaultResidualBodies() {
  const peExactNoEmu = (extra = {}) => ({
    executed: true,
    usesX86Emulation: false,
    ...extra,
  });

  const b1SfxPack = () => ({
    id: roomB1SfxId(),
    volume: roomB1SfxPlayVolume(),
    frameDelay: roomB1SfxPlayFrameDelay(),
    loop: roomB1SfxPlayLoop(),
    pitch: roomB1SfxPlayPitch(),
    pan: roomB1SfxPlayPan(),
  });

  return {
    opaqueRoomUpdatePrefixB1(event) {
      // MONOLITHIC: SFX (0xbe Play) + spawn suite. Dual-OR once-flag idempotent.
      // When spawnSamples / seed+i packs land, apply freestanding spawn-iter
      // pure posts (same path as B1Spawn fragment; helpers v26).
      const flagsPre = event?.gameFlags1839c;
      const flagsPost =
        flagsPre === undefined || flagsPre === null
          ? undefined
          : roomB1FlagOr80000(flagsPre);
      const spawnPosts = b1SpawnPurePostsFromEvent(event);
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "b1-monolithic-sfx-spawn",
        hostVas: {
          sfxPre: ROOM_B1_HOST_VA_SFX_PRE,
          sfxPlay: ROOM_B1_HOST_VA_SFX_PLAY,
          sfxSite: ROOM_B1_HOST_VA_SFX,
          ...b1SpawnHostVas(),
        },
        sfx: b1SfxPack(),
        sparsePatch:
          flagsPost === undefined ? null : { gameFlags1839c: flagsPost >>> 0 },
        ...spawnPosts,
      });
    },

    opaqueRoomUpdatePrefixB1Sfx(event) {
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "b1-sfx",
        platformIo: true,
        hostVas: {
          sfxPre: ROOM_B1_HOST_VA_SFX_PRE,
          sfxPlay: ROOM_B1_HOST_VA_SFX_PLAY,
          sfxSite: ROOM_B1_HOST_VA_SFX,
        },
        sfx: b1SfxPack(),
      });
    },

    /**
     * B1 spawn suite residual (helpers ABI v26 freestanding pure posts).
     * Host owns buffer view / owner / quality / EntitySaveState shuffle /
     * position / spawn / bind / cleanup. When event.spawnSamples (or
     * seedSamples / samples) supplies per-iter seed+i packs + shared
     * spawnCount/corners/widthC, apply roomB1SpawnIterPlan pure posts;
     * otherwise document pure helper names + PE host VAs only.
     */
    opaqueRoomUpdatePrefixB1Spawn(event) {
      const spawnPosts = b1SpawnPurePostsFromEvent(event);
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "b1-spawn",
        platformIo: false,
        hostVas: b1SpawnHostVas(),
        ...spawnPosts,
      });
    },

    /**
     * H5 FUN_00824a70 body residual (game-logic, not platform IO).
     * Records PE-exact create/GetLayer immediates from room-pure-model.
     * Full pure-complete is blocked by genrand×8 host residual (RNG + entity
     * create 0x006fe410 + ANM2::GetLayer + vcall [entity+0xc]); host starts at
     * first genrand 0x00824bb3. Pure posts between genrands interleave via
     * applyH5GenrandPurePosts when HostHandler receives samples.
     */
    opaqueRoomUpdateAmbient824a70(event) {
      // Summary residual when needs_host; when genrand/create fragments also
      // emit, this marks residual open (HostHandler may no-op body work).
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "h5-824a70-summary",
        platformIo: false,
        loopCount: event.loopCount ?? 0,
        hostVas: { firstGenrand: ROOM_AMBIENT_824A70_HOST_VA },
      });
    },

    opaqueRoomUpdateAmbient824a70Genrand(event) {
      // ABI v47 + room pure helpers (stream deepen under ABI 39): host genrand
      // residual (R0–R3,R5–R7 × loop). Pure posts between genrands freestanding
      // (unit_float / pos / pos_x_copy / Y0 / z / scale / flag_bit / color_pads /
      // loop_step / genrand_loop_posts pack). When event.genrandSamples (or
      // .samples) supplies host dwords, apply pure posts via room-pure-model;
      // otherwise record helper names for interleave.
      // Pure-complete body still blocked: no pure MT without PE RNG state.
      // residualPlan.pureCompleteRequires = "host_genrand_sample_stream".
      const samples = event?.genrandSamples ?? event?.samples ?? null;
      const sampleCount = Array.isArray(samples) ? samples.length : 0;
      const srcBounds =
        event?.bounds && typeof event.bounds === "object" ? event.bounds : null;
      const loopCount =
        (srcBounds?.loopCount ?? event?.loopCount ?? 0) | 0;
      // Stream plan: pure posts apply only when host supplies ≥ loop*7 dwords.
      // Freestanding HostHandler only — no Update sparse RNG wire.
      const streamPlan = roomAmbient824a70GenrandStreamPlan(
        loopCount > 0
          ? loopCount
          : sampleCount >= ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP
            ? Math.floor(sampleCount / ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP)
            : 1, // residual open (event fired) → require stream even if loopCount omitted
        sampleCount,
      );
      const hasSamples = streamPlan.samplesReady !== 0 && sampleCount >= 7;
      const bounds = {
        minX: srcBounds?.minX ?? event?.minX,
        spanX: srcBounds?.spanX ?? event?.spanX,
        baseY: srcBounds?.baseY ?? event?.baseY,
        spanY: srcBounds?.spanY ?? event?.spanY,
        age: srcBounds?.age ?? event?.age,
        roomY1c:
          srcBounds?.roomY1c ??
          srcBounds?.room_y_1c ??
          event?.roomY1c ??
          event?.room_y_1c,
        loopCount: srcBounds?.loopCount ?? event?.loopCount,
        loopCountRemaining:
          srcBounds?.loopCountRemaining ?? event?.loopCountRemaining,
      };
      const purePostsPeOrder = h5GenrandPurePostsInterleaveDoc();
      const purePostsApplied = hasSamples
        ? applyH5GenrandPurePosts(samples, bounds)
        : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "h5-824a70-genrand",
        platformIo: false,
        loopCount: event.loopCount ?? 0,
        hostVas: {
          firstGenrand: roomAmbient824a70HostVaR0(),
          genrand: roomAmbient824a70HostVaGenrand(),
          loop: 0x00824ec7,
        },
        // PE-ordered pure posts between genrands (HostHandler interleave plan).
        purePostsPeOrder,
        pureHelperNames: H5_824A70_GENRAND_PURE_HELPER_NAMES.slice(),
        purePostsApplied,
        purePostsFromSamples: hasSamples,
        residualPlan: Object.freeze({
          pureCompleteRequires: "host_genrand_sample_stream",
          requiresSampleStream: streamPlan.requiresSampleStream !== 0,
          sampleLayout: Object.freeze([
            "R0",
            "R1",
            "R2",
            "R3",
            "R5",
            "R6",
            "R7",
          ]),
          samplesPerLoop: ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP,
          maxGenrandPerLoop: ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP,
          sampleStream: Object.freeze({ ...streamPlan }),
          purePostsReady: streamPlan.purePostsReady !== 0,
          pureComplete: streamPlan.pureComplete !== 0, // false while host CALL open
          pureConsumers: H5_824A70_GENRAND_PURE_HELPER_NAMES.slice(),
          stillHost: Object.freeze([
            "Isaac::genrand_int32",
            "opaque_call_006fe410",
            "ANM2 helpers / GetLayer / vcall",
            "entity flag byte stores",
          ]),
          updateWire: "freestanding_hosthandler_only", // no sparse RNG on Game*
        }),
      });
    },

    opaqueRoomUpdateAmbient824a70Create(event) {
      // ABI v47 create residual + helpers create pure posts: create + ANM2 +
      // GetLayer + vcall (R4 cond genrand host inside). When
      // event.createSamples / animFrameSamples / samples supplies per-loop
      // anim_count + optional R4 genrand dword (+ optional A2 / COL / LC
      // inputs), apply freestanding pure posts. Event-level stageId /
      // room1d18 / dim1830c / stackColorPtr seed COL/LC defaults.
      const samples =
        event?.createSamples ??
        event?.animFrameSamples ??
        event?.samples ??
        null;
      const normalized = normalizeH5CreateSamples(samples);
      const hasSamples = Array.isArray(normalized) && normalized.length > 0;
      const purePostsPeOrder = h5CreatePurePostsInterleaveDoc();
      const colorCtx =
        event?.color && typeof event.color === "object" ? event.color : null;
      const createContext = {
        stageId: event?.stageId ?? event?.stage_id ?? colorCtx?.stageId,
        room1d18: event?.room1d18 ?? event?.room_1d18 ?? colorCtx?.room1d18,
        dim1830c:
          event?.dim1830c ??
          event?.dim_1830c ??
          event?.dim ??
          colorCtx?.dim1830c ??
          colorCtx?.dim,
        stackColorPtr:
          event?.stackColorPtr ??
          event?.stack_color_ptr ??
          colorCtx?.stackColorPtr,
      };
      const purePostsApplied = hasSamples
        ? applyH5CreatePurePosts(samples, createContext)
        : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "h5-824a70-create",
        platformIo: false,
        loopCount: event.loopCount ?? 0,
        create: {
          effectType: ROOM_AMBIENT_824A70_EFFECT_TYPE,
          effectVariant: ROOM_AMBIENT_824A70_EFFECT_VARIANT,
          layerIndex: ROOM_AMBIENT_824A70_LAYER_INDEX,
          anmDataPtr: ROOM_AMBIENT_824A70_ANM_DATA_PTR,
          a1Arg: ROOM_AMBIENT_824A70_A1_ARG,
          entityAnm2Off: ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF,
          animCountOff: ROOM_AMBIENT_824A70_ANIM_COUNT_OFF,
          a2ThisOff: ROOM_AMBIENT_824A70_A2_THIS_OFF,
          field34Off: ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF,
          field44Off: ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF,
          vcallOff: ROOM_AMBIENT_824A70_VCALL_OFF,
          gamePtrGlobal: ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL,
        },
        hostVas: {
          create: ROOM_AMBIENT_824A70_HOST_VA_CREATE,
          createSite: ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE,
          createStart: ROOM_AMBIENT_824A70_HOST_VA_CREATE_START,
          anmA0: ROOM_AMBIENT_824A70_HOST_VA_A0,
          anmA0Site: ROOM_AMBIENT_824A70_HOST_VA_A0_SITE,
          genrandR4: 0x006eef60, /* exact Isaac::genrand_int32 (cond) */
          anmA1: ROOM_AMBIENT_824A70_HOST_VA_A1,
          anmA1Site: ROOM_AMBIENT_824A70_HOST_VA_A1_SITE,
          anmA2: ROOM_AMBIENT_824A70_HOST_VA_A2,
          anmA2Site: ROOM_AMBIENT_824A70_HOST_VA_A2_SITE,
          getLayer: ROOM_AMBIENT_824A70_HOST_VA_GETLAYER,
          getLayerSite: ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE,
          /* V0: call dword [entity+0xc] after LC — site only */
          entityVcallOff: ROOM_AMBIENT_824A70_VCALL_OFF,
          vcallSite: ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE,
          layerColor: 0x00824e94, /* LC pure CF after GetLayer */
        },
        purePostsPeOrder,
        pureHelperNames: H5_824A70_CREATE_PURE_HELPER_NAMES.slice(),
        purePostsApplied,
        purePostsFromSamples: hasSamples,
      });
    },

    /**
     * FrameOpaque_4212c0 residual host. Update already pure-gated complete shells;
     * residual covers flag_111 double FUN_00409030 (+0x38/+0x58) and secondary==3
     * field_3c path. When event supplies subobject +4 / +0x14 samples, freestanding
     * frame-opaque helpers ABI v6 document pure early-out of each 409030 call.
     * When event supplies 40add0 samples (field4 / listCount / optional matchIndex
     * + bitfield18), helpers ABI v7 document pure empty-list false + bit-result
     * and the post-false-probe pure terminal. Success-path transition body
     * (manager / 0x006fd7c0 / 0x008318a0) stays address-stable host — no Update
     * ABI change.
     */
    opaqueCall004212c0(event) {
      const hasA =
        event?.field4A !== undefined ||
        event?.subAField4 !== undefined ||
        event?.flag14A !== undefined ||
        event?.subAFlag14 !== undefined;
      const hasB =
        event?.field4B !== undefined ||
        event?.subBField4 !== undefined ||
        event?.flag14B !== undefined ||
        event?.subBFlag14 !== undefined;
      const field4A = (event?.field4A ?? event?.subAField4 ?? 0) >>> 0;
      const flag14A = event?.flag14A ?? event?.subAFlag14 ?? 0;
      const field4B = (event?.field4B ?? event?.subBField4 ?? 0) >>> 0;
      const flag14B = event?.flag14B ?? event?.subBFlag14 ?? 0;
      const aNeeds =
        hasA || hasB
          ? frameOpaque409030NeedsHost(field4A, flag14A)
          : true;
      const bNeeds =
        hasA || hasB
          ? frameOpaque409030NeedsHost(field4B, flag14B)
          : true;
      const pairNeeds =
        hasA || hasB
          ? frameOpaque409030PairNeedsHost(field4A, flag14A, field4B, flag14B)
          : true;

      /* ABI v95 (record idx 10 R1): when the driver attaches the captured
         A/B pack (abPackReady + a/b float_10 + a/b layer_104 + a/b
         frame_bound + a/b loop_flag) with a LIVE pair, the 409030 bodies
         are decided purely in-module (ANM2 state-update plan by reference)
         and 0x408d00/0x40a1b0 fire as TYPED host events — the record host
         edge is NOT needed for the pair. The plan carries per-subobject
         {receiverOff, path, advanceTarget, float10Out, clearFlag14} plus
         advance/rewind counts (the host applies the advance target, the
         post-advance sum store on ADVANCE_MID, the rewind, and the NO_LOOP
         low-byte flag14 clear to the LIVE subobjects). */
      const hasPack =
        event?.abPackReady !== undefined ||
        event?.packReady !== undefined ||
        event?.aFloat10 !== undefined ||
        event?.aLayer104 !== undefined ||
        event?.aFrameBound !== undefined ||
        event?.aLoopFlag !== undefined;
      let pairPlan = null;
      let pairAdvance = 0;
      let pairRewind = 0;
      if (
        hasPack &&
        (event?.abPackReady ?? event?.packReady ?? 0) !== 0 &&
        (hasA || hasB) &&
        pairNeeds === true
      ) {
        const plan = { entries: [], live: 0, advance: 0, rewind: 0, pure: 1 };
        for (let side = 0; side < 2; side += 1) {
          const isA = side === 0;
          const field4 = isA ? field4A : field4B;
          const flag14 = isA ? flag14A : flag14B;
          const ent = {
            receiverOff: isA ? 0x38 : 0x58,
            path: -1, advanceTarget: 0, float10Out: 0, clearFlag14: 0,
          };
          if (frameOpaque409030NeedsHost(field4, flag14) === true) {
            const float10 = isA
              ? (event?.aFloat10 ?? event?.aFloat10Bits ?? 0)
              : (event?.bFloat10 ?? event?.bFloat10Bits ?? 0);
            const layer104 = isA
              ? (event?.aLayer104 ?? 0)
              : (event?.bLayer104 ?? 0);
            const frameBound = isA
              ? (event?.aFrameBound ?? 0)
              : (event?.bFrameBound ?? 0);
            const loopFlag = isA
              ? (event?.aLoopFlag ?? 0)
              : (event?.bLoopFlag ?? 0);
            const po = frameOpaque409030ResidualPlan(
              f32FromBits(float10 >>> 0),
              f32FromBits(layer104 >>> 0),
              frameBound | 0,
              loopFlag | 0,
            );
            ent.path = po.path;
            ent.advanceTarget = po.advanceFrame | 0;
            ent.float10Out = po.storeFloat10 ? bitsFromF32(po.sum) : 0;
            ent.clearFlag14 = po.clearFlag14 ? 1 : 0;
            plan.live += 1;
            if (po.hostAdvance) plan.advance += 1;
            if (po.hostRewind) plan.rewind += 1;
          }
          plan.entries.push(ent);
        }
        pairPlan = plan;
        pairAdvance = plan.advance;
        pairRewind = plan.rewind;
      }

      /* ABI v7: FUN_0040add0 pure gates when samples provided. */
      const has40add0 =
        event?.field4 !== undefined ||
        event?.add0Field4 !== undefined ||
        event?.listCount !== undefined ||
        event?.add0ListCount !== undefined ||
        event?.matchIndex !== undefined ||
        event?.bitfield18 !== undefined;
      const add0Field4 = (event?.field4 ?? event?.add0Field4 ?? 0) >>> 0;
      const add0ListCount = (event?.listCount ?? event?.add0ListCount ?? 0) >>> 0;
      const add0NeedsHost = has40add0
        ? frameOpaque40add0NeedsHost(add0Field4, add0ListCount)
        : true;
      let probeResult = null;
      let probeFromSamples = false;
      if (has40add0 && !add0NeedsHost) {
        probeResult = false; /* pure empty-list → al=0 */
        probeFromSamples = true;
      } else if (
        has40add0 &&
        event?.matchIndex !== undefined &&
        event?.bitfield18 !== undefined
      ) {
        /* Resolved match index skips string walk; pure bit test only. */
        probeResult = frameOpaque40add0BitResult(
          event.bitfield18,
          event.matchIndex,
        );
        probeFromSamples = true;
      }
      let afterProbe = null;
      if (probeFromSamples && probeResult === false) {
        afterProbe = frameOpaque4212c0Secondary3AfterProbeFalse({
          mode: event?.mode ?? 0,
          secondary: event?.secondary ?? 3,
          field3c: event?.field3c ?? event?.field_3c ?? 1,
          flag4c: event?.flag4c ?? event?.flag_4c ?? 0,
        });
      }
      const secondaryFrom40add0 =
        probeFromSamples &&
        (probeResult === false /* false probe is pure-complete secondary path */
          || probeResult === true /* true probe still needs transition host */);
      /* secondary==3 residual: host unless samples prove pure-false probe path,
         or caller forces secondaryHost false (legacy). True probe → host. */
      let secondaryHost;
      if (event?.secondaryHost !== undefined || event?.secondary3Host !== undefined) {
        secondaryHost = !!(event?.secondaryHost ?? event?.secondary3Host);
      } else if (probeFromSamples && probeResult === false) {
        secondaryHost = false;
      } else if (probeFromSamples && probeResult === true) {
        secondaryHost = true;
      } else {
        secondaryHost = true;
      }
      const pureComplete = !pairNeeds && !secondaryHost;
      const residualLabel = pureComplete
        ? (probeFromSamples && probeResult === false
          ? "4212c0-40add0-pure-skip"
          : "4212c0-409030-pure-skip")
        : pairNeeds
          ? "4212c0-409030-host"
          : probeFromSamples && probeResult === true
            ? "4212c0-40add0-true-host"
            : "4212c0-secondary-host";
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: residualLabel,
        platformIo: false,
        pureComplete,
        pureGate: has40add0
          ? "frameOpaque40add0NeedsHost"
          : "frameOpaque409030PairNeedsHost",
        pure409030: {
          aNeedsHost: aNeeds,
          bNeedsHost: bNeeds,
          pairNeedsHost: pairNeeds,
          fromSamples: !!(hasA || hasB),
        },
        pure40add0: {
          needsHost: add0NeedsHost,
          fromSamples: has40add0,
          probeResult,
          probeFromSamples,
          afterProbe,
          secondaryFrom40add0: !!secondaryFrom40add0,
        },
        secondaryHost: !!secondaryHost,
        hostVas: {
          site: 0x004212c0,
          fun409030: 0x00409030,
          advancePosition: 0x00408d00 /* exact AnimationState::AdvancePosition */,
          rewind: 0x0040a1b0 /* exact AnimationState::Rewind */,
          fun40add0: 0x0040add0,
          frameEffect6fd7c0: 0x006fd7c0,
          fun8318a0: 0x008318a0,
        },
      });
    },

    /**
     * FrameOpaque_4257b0 Pass A residual. Pure gate: empty idCount → no host body.
     * When count>0 the PE ID-ensure loop remains address-stable host.
     */
    opaqueCall004257b0PassA(event) {
      const idCount = (event?.idCount ?? event?.frameOpaque4257b0IdCount ?? 0) >>> 0;
      const needsHost = frameOpaque4257b0PassANeedsHost(idCount);
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: needsHost ? "4257b0-pass-a-host" : "4257b0-pass-a-pure-skip",
        platformIo: false,
        pureComplete: !needsHost,
        idCount,
        pureGate: "frameOpaque4257b0PassANeedsHost",
        hostVas: { site: 0x004257b0 },
      });
    },

    /**
     * FrameOpaque_4257b0 Pass B residual. F4 frozen capture contract
     * (frame-opaque ABI v27): the PE gate is the RECAPTURED post-Pass-A
     * element count (recount 0x00425870..0x00425892, gate 0x00425894 je) —
     * zero means NO Pass B, regardless of id count. The superseded
     * conservative (idCount||listCount) form was a superset that would have
     * silently masked a wrong recapture; the driver now emits this event with
     * the recaptured count attached (postPassAListCount), and the legacy
     * listCount keys are read only as that count when the new key is absent.
     */
    opaqueCall004257b0PassB(event) {
      const post = (
        event?.postPassAListCount ??
        event?.frameOpaque4257b0PostPassAListCount ??
        event?.listCount ??
        event?.frameOpaque4257b0ListCount ??
        0
      ) >>> 0;
      const needsHost = frameOpaque4257b0PassBNeedsHostRecaptured(post);
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: needsHost ? "4257b0-pass-b-host" : "4257b0-pass-b-pure-skip",
        platformIo: false,
        pureComplete: !needsHost,
        postPassAListCount: post,
        pureGate: "frameOpaque4257b0PassBNeedsHostRecaptured",
        hostVas: { site: 0x004257b0, recount: 0x00425870, gate: 0x00425894 },
      });
    },

    /**
     * FUN_0098dba0 player-walk residual (empty fatal + player vector walk).
     * Helpers ABI v15 freestanding pure CF: empty_fatal / walk_needed /
     * residual plan; optional bVar2 fold when host supplies per-player probe
     * packs. ABI v16 optional fun956110 / fun956110Sample resolves
     * FUN_00956110 pure CF + nested-host posts when samples are supplied.
     * ABI v17 optional fun956110.fun864c30 / capability folds FUN_00864c30
     * pure capability early-out + host_lua_ok into netHostOk when supplied.
     * Live guest loads, vtables, nested 956110 hosts, RTTI stay host — body
     * is never pure-complete.
     */
    opaqueCall0098dba0PlayerWalk(event) {
      const playerCount =
        event?.playerCount ?? event?.player_count ?? event?.countPlayers;
      const hasCount = playerCount !== undefined && playerCount !== null;
      const plan = hasCount
        ? frameOpaque98dba0WalkResidualPlan(playerCount | 0)
        : null;
      const probes = event?.probes ?? event?.playerProbes ?? null;
      const probeCount =
        event?.probePlayerCount ??
        event?.probe_player_count ??
        (Array.isArray(probes) ? (probes.length / 8) | 0 : 0);
      const hasProbes =
        Array.isArray(probes) && probeCount > 0 && probes.length >= probeCount * 8;
      const pureBvar2 = hasProbes
        ? frameOpaque98dba0Bvar2ApplyFromProbes(probes, probeCount)
        : null;
      const emptyFatal = hasCount
        ? frameOpaque98dba0EmptyFatalNeeded(playerCount | 0)
        : null;
      const walkNeeded = hasCount
        ? frameOpaque98dba0WalkNeeded(playerCount | 0)
        : true;
      /* Optional FUN_00956110 probe samples (helpers ABI v16/v17). */
      const fun956110 =
        event?.fun956110 ?? event?.fun956110Sample ?? event?.probe956110 ?? null;
      let pure956110Plan = null;
      let pure956110Result = null;
      let pure956110FromSamples = false;
      let pure864c30Plan = null;
      let pure864c30Result = null;
      let pure864c30FromSamples = false;
      if (fun956110 && typeof fun956110 === "object") {
        const managerMode =
          fun956110.managerMode ?? fun956110.manager_mode ?? 0;
        const globalC71690 =
          fun956110.globalC71690 ?? fun956110.global_c71690 ?? 0;
        const mpEmpty =
          fun956110.mpEmpty ?? fun956110.mp_empty ?? true;
        const id = fun956110.id ?? 0;
        pure956110Plan = frameOpaque956110ResidualPlan(
          managerMode | 0,
          globalC71690 >>> 0,
          mpEmpty ? 1 : 0,
          id | 0,
        );
        /* Optional nested FUN_00864c30 capability / lua samples (ABI v17). */
        const fun864c30 =
          fun956110.fun864c30 ??
          fun956110.netEarly ??
          fun956110.net_early ??
          event?.fun864c30 ??
          null;
        let netHostOk =
          fun956110.netHostOk ?? fun956110.net_host_ok;
        if (fun864c30 && typeof fun864c30 === "object") {
          let cap01;
          if (fun864c30.capability !== undefined) {
            cap01 = (fun864c30.capability | 0) !== 0 ? 1 : 0;
          } else {
            const flagDword =
              fun864c30.flagDword ??
              fun864c30.flag_dword ??
              fun864c30.capabilityFlag ??
              0;
            cap01 = frameOpaque864c30CapabilityGate(flagDword >>> 0) ? 1 : 0;
          }
          pure864c30Plan = frameOpaque864c30ResidualPlan(cap01);
          const hostLuaOk =
            fun864c30.hostLuaOk ??
            fun864c30.host_lua_ok ??
            fun864c30.luaOk ??
            fun864c30.lua_ok;
          if (hostLuaOk !== undefined || pure864c30Plan.pureEarly) {
            pure864c30Result = frameOpaque864c30ResultFromSamples(
              cap01,
              hostLuaOk ?? 0,
            );
            pure864c30FromSamples = true;
            /* Fold pure 864c30 al into 956110 netHostOk when not explicit. */
            if (netHostOk === undefined) {
              netHostOk = pure864c30Result ? 1 : 0;
            }
          }
        }
        const hasResultSamples =
          netHostOk !== undefined ||
          fun956110.netHostOk !== undefined ||
          fun956110.net_host_ok !== undefined ||
          fun956110.vtableResults !== undefined ||
          fun956110.vtable_results !== undefined ||
          fun956110.generalResult !== undefined ||
          fun956110.general_result !== undefined ||
          pure864c30FromSamples;
        if (hasResultSamples) {
          const vtableResults =
            fun956110.vtableResults ?? fun956110.vtable_results ?? null;
          const vtableCount =
            fun956110.vtableCount ??
            fun956110.vtable_count ??
            (Array.isArray(vtableResults) ? vtableResults.length : 0);
          pure956110Result = frameOpaque956110ResultFromSamples({
            netGateOpen: pure956110Plan.netGate,
            netHostOk: netHostOk ?? 0,
            netOutByte: fun956110.netOutByte ?? fun956110.net_out_byte ?? 0,
            mpEmpty: mpEmpty ? 1 : 0,
            id: id | 0,
            vtableResults,
            vtableCount: vtableCount >>> 0,
            generalResult:
              fun956110.generalResult ?? fun956110.general_result ?? 0,
          });
          pure956110FromSamples = true;
        }
      }
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: hasProbes
          ? "98dba0-walk-pure-bvar2-from-probes"
          : emptyFatal
            ? "98dba0-walk-empty-fatal-host"
            : pure864c30FromSamples && pure864c30Plan?.pureEarly
              ? "98dba0-walk-864c30-pure-early"
              : pure956110FromSamples
                ? "98dba0-walk-956110-pure-from-samples"
                : "98dba0-walk-host",
        platformIo: false,
        pureComplete: false, /* walk body always host (vtables / 956110 / RTTI) */
        pureCfOk: plan?.pureCfOk ?? false,
        pureWalkPlan: plan,
        pureBvar2FromProbes: pureBvar2,
        pureBvar2FromSamples: pureBvar2 !== null,
        pure956110Plan,
        pure956110Result,
        pure956110FromSamples,
        pure864c30Plan,
        pure864c30Result,
        pure864c30FromSamples,
        pureGate: "frameOpaque98dba0WalkResidualPlan",
        pureHelper: hasProbes ? "frameOpaque98dba0Bvar2ApplyFromProbes" : null,
        pure956110Helper: pure956110FromSamples
          ? "frameOpaque956110ResultFromSamples"
          : pure956110Plan
            ? "frameOpaque956110ResidualPlan"
            : null,
        pure864c30Helper: pure864c30FromSamples
          ? "frameOpaque864c30ResultFromSamples"
          : pure864c30Plan
            ? "frameOpaque864c30ResidualPlan"
            : null,
        walkNeeded,
        emptyFatal,
        hostVas: {
          site: FRAME_OPAQUE_HOST_98DBA0_VA,
          emptyFatalLog: FRAME_OPAQUE_HOST_ASSERT_LOG_VA,
          fun956110: FRAME_OPAQUE_HOST_956110_VA,
          fun864c30: FRAME_OPAQUE_HOST_864C30_VA,
          fun874910: FRAME_OPAQUE_HOST_874910_VA,
          fun6a80f0: FRAME_OPAQUE_HOST_6A80F0_VA,
          funA20940: FRAME_OPAQUE_HOST_A20940_VA,
          isIdxLocalPlayer: FRAME_OPAQUE_HOST_90B100_VA,
          rttiLookup: FRAME_OPAQUE_HOST_A20390_VA,
          fun746560: FRAME_OPAQUE_HOST_746560_VA,
        },
      });
    },

    /**
     * FUN_0098dba0 timer residual (genrand / 41d540 / 41d520) after pure counter.
     * When event supplies bVar2+counter, pure counter step is re-documented.
     * When event supplies timer/x/y + genrand sample, apply freestanding
     * frameOpaque98dba0TimerStep (helpers ABI v5) without PE.
     */
    opaqueCall0098dba0Timer(event) {
      const bVar2 = event?.bVar2 ?? 0;
      const counter = event?.counter ?? 0;
      const counterStep =
        event?.bVar2 !== undefined || event?.counter !== undefined
          ? frameOpaque98dba0Bvar2CounterStep(counter, bVar2)
          : null;
      const timer = event?.timer ?? event?.timer61c;
      const genrand = event?.genrand ?? event?.genrandSample ?? event?.sample;
      const hasTimerState =
        timer !== undefined &&
        event?.x !== undefined &&
        event?.y !== undefined &&
        genrand !== undefined &&
        genrand !== null;
      const timerNeedsHost =
        timer !== undefined ? frameOpaque98dba0TimerNeedsHost(timer) : true;
      const pureTimerApplied = hasTimerState
        ? frameOpaque98dba0TimerStep(
            { timer, x: event.x, y: event.y },
            genrand >>> 0,
          )
        : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: pureTimerApplied?.applied
          ? "98dba0-timer-pure-step"
          : "98dba0-timer-host",
        platformIo: false,
        hostVas: {
          genrand: 0x006eef60,
          fun41d540: 0x0041d540,
          fun41d520: 0x0041d520,
          timerSite: 0x0098de4a,
        },
        pureCounterStep: counterStep,
        pureHelper: "frameOpaque98dba0Bvar2CounterStep",
        pureTimerGate: "frameOpaque98dba0TimerNeedsHost",
        pureTimerNeedsHost: timerNeedsHost,
        pureTimerApplied,
        pureTimerFromSamples: !!pureTimerApplied,
        pureTimerHelper: "frameOpaque98dba0TimerStep",
      });
    },

    /**
     * Prefix B3–B7 residual (room pure helpers ABI v36; Update-wired ABI v48).
     * Update emits opaqueRoomUpdatePrefixB3B7 when host_needed (always today).
     * When sparse packs land (emit detail or direct samples), apply
     * roomB3B7WireDecide; host still owns FCO/challenge/entity/grid bodies.
     */
    opaqueRoomUpdatePrefixB3B7(event) {
      const posts = b3b7PurePostsFromEvent(event);
      const applied = posts.purePostsApplied;
      const residual =
        !applied
          ? "b3b7-host"
          : (applied.residualKind | 0) === ROOM_B3B7_RESIDUAL_MONOLITHIC
            ? "b3b7-monolithic"
            : "b3b7-host-fragments";
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual,
        platformIo: false,
        pureComplete: applied ? !!applied.pureComplete : false,
        hostNeeded: applied ? !!applied.hostNeeded : true,
        hostVas: applied
          ? applied.hostVas
          : Object.freeze({
              start: ROOM_B3_HOST_VA_START,
              owner: ROOM_B3_HOST_VA_OWNER,
              challenge: ROOM_B3_HOST_VA_CHALLENGE,
              next: ROOM_B3B7_HOST_VA_NEXT,
            }),
        pureHelperNames: posts.pureHelperNames,
        purePostsApplied: applied,
        purePostsFromSamples: posts.purePostsFromSamples,
      });
    },

    /**
     * Prefix B9–B11 residual (room pure helpers ABI v35+; Update-wired ABI v48).
     * When packs/samples land, apply roomB9B11WireDecide; host owns
     * manager/fatal/camera chain (ALWAYS_HOST when ready).
     */
    opaqueRoomUpdatePrefixB9B11(event) {
      const posts = b9b11PurePostsFromEvent(event);
      const applied = posts.purePostsApplied;
      const residual =
        !applied
          ? "b9b11-host"
          : (applied.residualKind | 0) === ROOM_B9B11_RESIDUAL_MONOLITHIC
            ? "b9b11-monolithic"
            : "b9b11-always-host";
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual,
        platformIo: false,
        pureComplete: applied ? !!applied.pureComplete : false,
        hostNeeded: applied ? !!applied.hostNeeded : true,
        b10FatalNeedsHost: applied ? !!applied.b10FatalNeedsHost : true,
        hostVas: applied
          ? applied.hostVas
          : Object.freeze({
              b9Start: ROOM_B9B11_HOST_VA_B9_START,
              query: ROOM_B9B11_HOST_VA_QUERY,
              b10Start: ROOM_B9B11_HOST_VA_B10_START,
              fatal: ROOM_B9B11_HOST_VA_FATAL,
              b12Start: ROOM_B9B11_HOST_VA_B12_START,
            }),
        pureHelperNames: posts.pureHelperNames,
        purePostsApplied: applied,
        purePostsFromSamples: posts.purePostsFromSamples,
      });
    },

    /**
     * TailMid curse suite residual (room pure helpers ABI v35+ freestanding).
     * Update always emits opaqueRoomUpdateTailMid (curse + 801ee0 + 800500).
     * When event supplies gate samples (flags / frame age / IsPaused /
     * difficulty / gate1b83c), apply roomTailmidWireDecide + pure posts.
     * Host still owns IsPaused, curse genrand/create, SpawnGreedModeWave,
     * Music/SFX/TriggerOutput, and 800500 body after early skip.
     * Without samples: document pure helper names + PE host VAs only.
     */
    opaqueRoomUpdateTailMid(event) {
      const posts = tailmidPurePostsFromEvent(event);
      const applied = posts.purePostsApplied;
      const pureComplete = applied ? !!applied.pureComplete : false;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: tailmidResidualLabel(applied),
        platformIo: false,
        pureComplete,
        hostNeeded: applied ? !!applied.hostNeeded : true,
        needsCurseHost: applied ? !!applied.needsCurseHost : true,
        needs801ee0Host: applied ? !!applied.needs801ee0Host : true,
        needs800500Host: applied ? !!applied.needs800500Host : true,
        hostVas: applied
          ? applied.hostVas
          : Object.freeze({
              gate: ROOM_TAILMID_HOST_VA_GATE,
              isPaused: ROOM_TAILMID_HOST_VA_ISPAUSED,
              curse: ROOM_TAILMID_HOST_VA_CURSE,
              va801ee0: ROOM_TAILMID_HOST_VA_801EE0,
              va800500: ROOM_TAILMID_HOST_VA_800500,
              next: ROOM_TAILMID_HOST_VA_NEXT,
            }),
        purePostsPeOrder: posts.purePostsPeOrder,
        pureHelperNames: posts.pureHelperNames,
        purePostsApplied: applied,
        purePostsFromSamples: posts.purePostsFromSamples,
        residualKinds: Object.freeze({
          none: ROOM_TAILMID_RESIDUAL_NONE,
          host: ROOM_TAILMID_RESIDUAL_HOST,
          monolithic: ROOM_TAILMID_RESIDUAL_MONOLITHIC,
        }),
      });
    },

    /**
     * B18 entity flag-sweep residual (room pure helpers ABI v29 freestanding).
     * Update already pure-gates emission on pre Room+0x7894 and peels the
     * terminal flag clear. When event supplies entity packs (entities /
     * entitySamples / packs / samples) and/or wire fields (roomFlag7894 /
     * entityCount1264 / flagReady / countReady / mode), apply
     * roomB18WireDecide + per-entity type-route pure posts.
     * Type-5 body @ 0x006e17c0, RTTI cast @ 0x00af08b1, path-B @ 0x006da530
     * stay host for HOST_WALK/MONOLITHIC when actions require them.
     * Without samples: document pure helper names + PE host VAs only.
     */
    opaqueRoomUpdateTailEntity(event) {
      const entityPosts = b18EntityPurePostsFromEvent(event);
      const applied = entityPosts.purePostsApplied;
      const pureComplete = applied ? !!applied.pureComplete : false;
      // HOST_WALK/MONOLITHIC still host type-5/RTTI/path-B bodies as needed;
      // pure-complete NONE / empty-list skips host body work.
      // hostEntityWalk: list pointer walk residual (even if every entity skips).
      // hostTypeBodies: at least one type-5 / RTTI / path-B body still required.
      const hostEntityWalk = !applied || !!applied.hostEntityWalk;
      const hostType5 = applied ? !!applied.hostType5 : true;
      const hostRtti = applied ? !!applied.hostRtti : true;
      const hostPathB = applied ? !!applied.hostPathB : true;
      const hostTypeBodies = applied ? !!applied.hostTypeBodies : true;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: b18EntityResidualLabel(applied),
        platformIo: false,
        pureComplete,
        hostEntityWalk,
        hostType5,
        hostRtti,
        hostPathB,
        hostTypeBodies,
        hostVas: b18EntityHostVas(),
        type5: {
          va: ROOM_B18_HOST_VA_TYPE5,
          count: applied ? applied.type5HostCount | 0 : null,
        },
        rtti: {
          va: ROOM_B18_HOST_VA_RTTI,
          srcPtr: ROOM_B18_RTTI_SRC_PTR,
          dstPtr: ROOM_B18_RTTI_DST_PTR,
          candidateCount: applied ? applied.rttiCandidateCount | 0 : null,
        },
        pathB: {
          va: ROOM_B18_HOST_VA_PATH_B,
          count: applied ? applied.pathBHostCount | 0 : null,
        },
        residualKinds: {
          none: ROOM_B18_RESIDUAL_NONE,
          pureComplete: ROOM_B18_RESIDUAL_PURE_COMPLETE,
          hostWalk: ROOM_B18_RESIDUAL_HOST_WALK,
          monolithic: ROOM_B18_RESIDUAL_MONOLITHIC,
        },
        actions: {
          skip: ROOM_B18_ACTION_SKIP,
          type5: ROOM_B18_ACTION_TYPE5,
          rttiCandidate: ROOM_B18_ACTION_RTTI_CANDIDATE,
        },
        ...entityPosts,
      });
    },

    /**
     * B19 path-rebuild + B20 trail residual (room pure helpers ABI v30/v31
     * freestanding). Update already peels pure terminal Room+0x7769=0; residual
     * is rebuild + B20 trail. When event supplies B19 entity/cell packs and/or
     * wire fields (roomFlag7769 / widthC / height10 / flagReady), apply
     * roomB19WireDecide + cell_count / mark-route / collision-byte pure posts.
     * When event supplies B20 trail packs (trailEntities / b20Entities) and/or
     * list begin-end wire fields, apply roomB20WireDecide + pass1/pass2 pure
     * posts. Flag-on always hosts B19 rebuild; begin==end is B20 pure-complete.
     * Without samples: document pure helper names + PE host VAs only.
     */
    opaqueRoomUpdateTailPath(event) {
      const pathPosts = pathTailPurePostsFromEvent(event);
      const applied = pathPosts.purePostsApplied;
      const b20Applied = applied?.b20 ?? null;
      // B19 pureComplete (legacy: event.pureComplete when only B19 packs land).
      const pureCompleteB19 = applied?.b19FromSamples
        ? !!applied.pureComplete
        : false;
      const pureCompleteB20 = b20Applied ? !!b20Applied.pureComplete : false;
      // Whole-event pureComplete: B19-only keeps legacy B19 flag; both packs
      // require both pure; B20-only never marks whole residual pure (B19 host).
      let pureComplete = false;
      if (applied?.b19FromSamples && applied?.b20FromSamples) {
        pureComplete = pureCompleteB19 && pureCompleteB20;
      } else if (applied?.b19FromSamples) {
        pureComplete = pureCompleteB19;
      }
      const hostRebuild = !applied || !!applied.hostRebuild;
      const hostCellLoop = applied ? !!applied.hostCellLoop : true;
      const hostEntityWalk = applied ? !!applied.hostEntityWalk : true;
      const hostSecondaryQuery = applied ? !!applied.hostSecondaryQuery : true;
      const hostTreePath = applied ? !!applied.hostTreePath : true;
      const hostB20Trail = applied ? !!applied.hostB20Trail : true;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: pathTailResidualLabel(applied),
        platformIo: false,
        pureComplete,
        pureCompleteB19,
        pureCompleteB20: applied?.b20FromSamples ? pureCompleteB20 : null,
        hostRebuild,
        hostCellLoop,
        hostEntityWalk,
        hostSecondaryQuery,
        hostTreePath,
        hostB20Trail,
        hostVas: {
          ...b19PathHostVas(),
          b20: b20TrailHostVas(),
        },
        rebuild: {
          va: ROOM_B19_HOST_VA_REBUILD_START,
          refcountVa: ROOM_B19_REFCOUNT_VA,
          needed: applied?.b19FromSamples ? applied.hostRebuild | 0 : null,
        },
        cellLoop: {
          va: ROOM_B19_HOST_VA_GET_GRID_COLLISION,
          memsetVa: ROOM_B19_HOST_VA_MEMSET,
          needed: applied?.b19FromSamples ? applied.hostCellLoop | 0 : null,
          cellCount: applied?.b19FromSamples
            ? (applied.cellCount | 0)
            : null,
        },
        entityWalk: {
          va: ROOM_B19_HOST_VA_ENTITY_WALK,
          queryVa: ROOM_B19_HOST_VA_QUERY_8000,
          queryImm: ROOM_B19_QUERY_IMM_8000,
          markCandidateCount: applied?.b19FromSamples
            ? applied.markCandidateCount | 0
            : null,
          secondaryEligibleCount: applied?.b19FromSamples
            ? applied.secondaryEligibleCount | 0
            : null,
        },
        treePath: {
          treeAllocVa: ROOM_B19_HOST_VA_TREE_ALLOC,
          posFinishVa: ROOM_B19_HOST_VA_POS_FINISH,
          spawnVa: ROOM_B19_HOST_VA_SPAWN,
          getAltPedestalVa: ROOM_B19_HOST_VA_GET_ALT_PEDESTAL,
          setAltPedestalVa: ROOM_B19_HOST_VA_SET_ALT_PEDESTAL,
          needed: applied?.b19FromSamples ? applied.hostTreePath | 0 : null,
        },
        b20: {
          va: ROOM_B20_HOST_VA_LIST_TEST,
          epilogueVa: ROOM_B20_HOST_VA_EPILOGUE,
          needed: applied ? applied.hostB20Trail | 0 : 1,
          hostPass1: b20Applied ? b20Applied.hostPass1 | 0 : null,
          hostPass2: b20Applied ? b20Applied.hostPass2 | 0 : null,
          hostSpawn: b20Applied ? b20Applied.hostSpawn | 0 : null,
          listCount: b20Applied ? b20Applied.listCount | 0 : null,
          residualKind: b20Applied ? b20Applied.residualKind | 0 : null,
          pureComplete: b20Applied ? !!b20Applied.pureComplete : null,
          hostVas: b20TrailHostVas(),
        },
        residualKinds: {
          none: ROOM_B19_RESIDUAL_NONE,
          hostRebuild: ROOM_B19_RESIDUAL_HOST_REBUILD,
          monolithic: ROOM_B19_RESIDUAL_MONOLITHIC,
          b20None: ROOM_B20_RESIDUAL_NONE,
          b20HostTrail: ROOM_B20_RESIDUAL_HOST_TRAIL,
          b20Monolithic: ROOM_B20_RESIDUAL_MONOLITHIC,
        },
        peImms: {
          entityType5: ROOM_B19_ENTITY_TYPE5,
          entityVariant100: ROOM_B19_ENTITY_VARIANT_100,
          entityFlagBit: ROOM_B19_ENTITY_FLAG_BIT,
          queryImm8000: ROOM_B19_QUERY_IMM_8000,
          b20Pass1TypeA: ROOM_B20_PASS1_TYPE_A,
          b20Pass1TypeB: ROOM_B20_PASS1_TYPE_B,
          b20Pass1TypeC: ROOM_B20_PASS1_TYPE_C,
          b20Pass1TypeD: ROOM_B20_PASS1_TYPE_D,
          b20PairYType: ROOM_B20_PAIR_Y_TYPE,
          b20FlagBit4000: ROOM_B20_FLAG_BIT_4000,
        },
        ...pathPosts,
      });
    },

    /**
     * PM1 TriggerDeath walk residual (helpers ABI v4 freestanding pure plan).
     * Update already pure-gates emission on dual-zero (ABI v32). When event
     * supplies player packs (players / deathPlayers / packs / samples) plus
     * optional gate1b83c/gate1ba78/playerCount/blobReady, apply
     * pmDeathWireDecide + eligibility pure posts and record purePostsApplied.
     * TriggerDeath(false) body @ 0x007a1090 stays host for WALK/MONOLITHIC.
     * Without packs: document pure helper names + PE host VAs only.
     */
    playerManagerUpdateDeath(event) {
      const deathPosts = pmDeathPurePostsFromEvent(event);
      const applied = deathPosts.purePostsApplied;
      const pureComplete = applied ? !!applied.pureComplete : false;
      // WALK/MONOLITHIC still host TriggerDeath; pure-complete NONE skips host body.
      const hostTriggerDeath =
        !applied || !!applied.hostNeeded;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: pmDeathResidualLabel(applied),
        platformIo: false,
        pureComplete,
        hostTriggerDeath,
        hostVas: pmDeathHostVas(),
        triggerDeath: {
          va: PM_DEATH_HOST_VA_TRIGGER_DEATH,
          arg: PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
          eligibleCount: applied ? applied.eligibleCount | 0 : null,
          eligibleMask: applied ? applied.eligibleMask >>> 0 : null,
        },
        residualKinds: {
          none: PM_DEATH_RESIDUAL_NONE,
          walk: PM_DEATH_RESIDUAL_WALK,
          monolithic: PM_DEATH_RESIDUAL_MONOLITHIC,
        },
        ...deathPosts,
      });
    },

    /**
     * playerhud v17 UpdateHearts call-site plan (VA 0x008422b3..0x008422ee).
     * When collectHostEvents attached per-slot packs (playerHudBlobReady),
     * each occupied slot resolves to the pure call plan: twin path =
     * UpdateHearts(hud+0x10, 6, player) then UpdateHearts(hud+0x70, 6,
     * twin) with the ARG_TWIN live re-read of [player+0x1d98] at 0x008422ca;
     * single path = UpdateHearts(hud+0x10, 0x18, player). Without packs the
     * body records the pre-wave count-only shape.
     */
    playerHudUpdateHearts(event) {
      const packs = event?.detail?.packs ?? event?.packs ?? null;
      const slotPlans = Array.isArray(packs)
        ? packs.map((pack) => ({
            slot: pack.slot,
            twin: pack.twin,
            plan: playerHudUpdateHeartsPlan(pack, playerHudUpdateHeartsJsPure()),
          }))
        : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: slotPlans ? "playerhud-update-hearts-pure-plan" : "playerhud-update-hearts-count-only",
        platformIo: false,
        hostVa: 0x00841e20,
        slots: slotPlans,
        calls: slotPlans
          ? slotPlans.reduce((n, s) => n + s.plan.calls.length, 0)
          : event.count,
      });
    },

    playerManagerUpdateHeartbeat(event) {
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        residual: "pm2-pm3-monolithic",
        sfxId: pmIntensitySfxId() || PM_INTENSITY_SFX_ID,
      });
    },

    playerManagerUpdateHeartbeatSfxUpdate(event) {
      const warnLog = event?.detail?.warnLog ?? event?.warnLog ?? null;
      const gate = event?.detail?.gate ?? null;
      const logEdge = warnLog ? residualLogEdge(warnLog) : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        logEdge,
        sfxGate: gate,
        residual: "pm3-sfx-update",
        platformIo: true,
        sfxId: pmIntensitySfxId(),
        hostVas: { updateVol: 0x0092df40, updateMix: 0x0092e050 },
      });
    },

    playerManagerUpdateHeartbeatSfxPlay(event) {
      const warnLog = event?.detail?.warnLog ?? event?.warnLog ?? null;
      const gate = event?.detail?.gate ?? null;
      const logEdge = warnLog ? residualLogEdge(warnLog) : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        logEdge,
        sfxGate: gate,
        residual: "pm3-sfx-play",
        platformIo: true,
        sfx: {
          id: pmIntensitySfxId(),
          frameDelay: pmIntensityPlayFrameDelay(),
          loop: pmIntensityPlayLoop(),
          pitch: pmIntensityPlayPitch(),
          pan: pmIntensityPlayPan(),
        },
        hostVas: { pre: 0x00956780, play: 0x0092dc30 },
      });
    },

    playerManagerUpdateHeartbeatSfxStop(event) {
      const warnLog = event?.detail?.warnLog ?? event?.warnLog ?? null;
      const gate = event?.detail?.gate ?? null;
      const logEdge = warnLog ? residualLogEdge(warnLog) : null;
      return peExactNoEmu({
        kind: event.kind,
        count: event.count,
        logEdge,
        sfxGate: gate,
        residual: "pm3-sfx-stop",
        platformIo: true,
        sfxId: pmIntensitySfxId(),
        hostVas: { stop: 0x0092e230 },
      });
    },
  };
}

/**
 * Residual HostHandler that executes native residual *bodies* without PE.
 *
 * - Platform/IO kinds: counted, no-op body (acceptable long residual).
 * - Game-logic kinds: invoke optional per-kind body from `bodies` map, or the
 *   default native residual body (records execution; does not re-enter PE).
 * - Optional `recaptureAfter(kind, ctx)` returns sparse field patches after
 *   a residual that can mutate later predicates (evidence rule §5).
 *
 * Returns patches for the tick's recapture path when residual mutates state.
 */
export function createResidualHostHandler({
  onEvent = null,
  bodies = null,
  recaptureAfter = null,
} = {}) {
  const totals = Object.create(null);
  const executed = [];
  const pendingPatches = [];
  const defaultBodies = createDefaultResidualBodies();
  const bodyMap = bodies ? { ...defaultBodies, ...bodies } : defaultBodies;

  const defaultBody = (event, ctx) => {
    // Native residual body placeholder: pure control flow already ran; residual
    // side effects are recorded without PE. Specific peels replace this via `bodies`.
    return {
      executed: true,
      kind: event.kind,
      count: event.count,
      usesX86Emulation: false,
      platformIo: PLATFORM_IO_HOST_KINDS.includes(event.kind),
    };
  };

  const handler = (event) => {
    if (!event || !event.kind) return;
    const kindLower = String(event.kind).toLowerCase();
    if (kindLower.includes("emulator") || kindLower.includes("pe-emu") || kindLower.includes("x86-pe")) {
      throw new Error(`HostHandler must not route through PE emulator: ${event.kind}`);
    }
    totals[event.kind] = (totals[event.kind] || 0) + (event.count || 1);
    const ctx = { totals, executed, event };
    const bodyFn =
      typeof bodyMap[event.kind] === "function" ? bodyMap[event.kind] : defaultBody;
    const result = bodyFn(event, ctx) || { executed: true, usesX86Emulation: false };
    if (result.usesX86Emulation) {
      throw new Error(`Residual body for ${event.kind} attempted PE emulation`);
    }
    executed.push({ kind: event.kind, count: event.count, result });
    if (result.sparsePatch && typeof result.sparsePatch === "object") {
      pendingPatches.push(result.sparsePatch);
    }
    if (typeof recaptureAfter === "function") {
      const patch = recaptureAfter(event.kind, { event, result, ctx });
      if (patch && typeof patch === "object") pendingPatches.push(patch);
    }
    if (typeof onEvent === "function") onEvent(event, result);
  };

  handler.totals = totals;
  handler.executed = executed;
  handler.usesX86Emulation = false;
  handler.drainPatches = () => {
    const merged = Object.assign({}, ...pendingPatches);
    pendingPatches.length = 0;
    return merged;
  };
  return handler;
}

/**
 * Read the FUN_004257b0 list bounds from the slice's scratch Game object.
 * F4 frozen capture contract (frame-opaque ABI v27): begin at Game+0x1bbe0
 * and end at Game+0x1bbe4 are ALWAYS read together — the 0x004259b0 append
 * can reallocate through 0x00426640 and a grow moves BOTH pointers, so a
 * stale begin beside a fresh end yields a garbage count.
 */
function readF4ListBoundsFromScratch(slice) {
  const view = new DataView(slice.memory.buffer);
  const base = slice.paths.gameObjectAddress() + FRAME_OPAQUE_4257B0_LIST_RECEIVER_OFF;
  return {
    begin: view.getUint32(base + FRAME_OPAQUE_4257B0_LIST_BEGIN_OFF, true),
    end: view.getUint32(base + FRAME_OPAQUE_4257B0_LIST_END_OFF, true),
  };
}

/**
 * Hybrid tick: Game-object buffer → capture sparse → overlay host-owned Room
 * state → native Update → residual HostHandler bodies → apply sparse back to
 * Game-object buffer.
 *
 * Room capture contract (ABI v67): the 35 host-owned STATE_LAYOUT fields
 * (HOST_OWNED_STATE_CONTRACT) live in Room/RoomDescriptor memory the Game
 * buffer cannot carry, so the Wasm capture pins them to 0 and `hostState`
 * supplies the caller's values. Without `hostState` every tick runs the
 * deterministic empty-Room default — equal to tick 1 on a fresh instance,
 * never the previous tick's leftovers.
 *
 * F4 list counts (frame-opaque ABI v27 frozen contract): the 0x68-stride
 * list header IS Game-object-resident (Game+0x1bbe0/+0x1bbe4), so on this
 * buffer-owning path the buffer is authoritative — the pre count is derived
 * from the bounds at capture and the post-Pass-A count is re-derived from
 * the SAME bytes when (and only when) the Pass A host residual ran.
 * Runtime-input list counts are consumed only by non-hybrid drivers.
 *
 * Never selects PE. Residual game-logic bodies run via createResidualHostHandler
 * (native stubs / peels), not x86 emulation.
 */
export function runHybridGameUpdateTick(slice, {
  gameObject,
  constants = null,
  runtimeInputs = null,
  onHostEvent = null,
  residualBodies = null,
  recaptureAfter = null,
  hostState = null,
  lockstep = true,
} = {}) {
  if (!slice || slice.mode !== FRAME_PATH_MODE.NATIVE_WASM || slice.usesX86Emulation) {
    throw new Error("runHybridGameUpdateTick requires a native-wasm slice");
  }
  if (!(gameObject instanceof Uint8Array) || gameObject.byteLength < GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be Uint8Array of size >= ${GAME_OBJECT_MIN_SIZE}`);
  }
  if (hostState != null) {
    for (const key of Object.keys(hostState)) {
      if (!(key in STATE_LAYOUT)) {
        throw new Error(`unknown sparse state field in hostState: ${key}`);
      }
    }
  }

  const host = onHostEvent || createResidualHostHandler({
    bodies: residualBodies,
    recaptureAfter,
  });
  if (host.usesX86Emulation) {
    throw new Error("hybrid tick HostHandler must not enable x86 emulation");
  }

  loadGameObjectIntoScratch(slice, gameObject);
  /* Room capture contract: capture recovers only Game-object-homed fields
     (host-owned members come back as the deterministic 0 default); the
     overlay applied here is what makes caller-supplied Room state reach the
     slice at all. It must run BEFORE the state struct write inside
     runNativeGameUpdateTick — overlaying result.state afterwards would fake
     the round-trip while the slice still ran on the empty-Room default. */
  const captured = overlayHostOwnedState(captureSparseStateFromScratch(slice), hostState);
  const sparseConstants = constants ? { ...constants } : createDefaultNativeConstants();
  const sparseRuntime = runtimeInputs
    ? { ...createDefaultNativeRuntimeInputs(), ...runtimeInputs }
    : createDefaultNativeRuntimeInputs();
  /* F4 pre-tick capture: both pointers together, then the PE's signed
     magic-number division (never unsigned delta/0x68). */
  const f4Pre = readF4ListBoundsFromScratch(slice);
  sparseRuntime.frameOpaque4257b0ListCount =
    frameOpaque4257b0ListCountFromBounds(f4Pre.begin, f4Pre.end);

  // Recapture path: residual HostHandler may supply sparse patches after hosts.
  const recapture = (kind, currentState) => {
    let patch = {};
    if (typeof host.drainPatches === "function") {
      patch = { ...patch, ...host.drainPatches() };
    }
    if (typeof recaptureAfter === "function") {
      const more = recaptureAfter(kind, { state: currentState, host });
      if (more && typeof more === "object") patch = { ...patch, ...more };
    }
    return patch;
  };

  /* Runtime-input recapture: taken ONLY on the path where the Pass A host
     residual ran (the resume asks for it). Re-reads the live scratch bytes at
     that instant, so anything that mutated the buffer's list header between
     capture and resume is honoured.

     NOTE on redundancy (measured, mutation-checked): in TODAY's hybrid the
     residual bodies are deferred to end-of-tick (collectHostEvents runs after
     the continuation chain), so no writer exists between capture and this
     re-read and the value always equals the pre-derived count — dropping this
     lane alone is currently behaviour-equivalent (mutant M5 survives; M5b/M5c
     die on the id==0 / both-lanes tests). It is kept because it IS the F4
     frozen contract's recapture point ("re-read after the Pass A host
     residual ran"), and it becomes load-bearing the moment any host mutates
     the buffer mid-tick (live-PE bridge, modeled Pass-A insertions). Removing
     it would re-fold the post value to a pre-call snapshot — the exact
     defect class the contract exists to prevent. */
  const recaptureRuntime = (kind) => {
    if (kind !== "4257b0PassA") return null;
    const bounds = readF4ListBoundsFromScratch(slice);
    return {
      frameOpaque4257b0PostPassAListCount:
        frameOpaque4257b0ListCountFromBounds(bounds.begin, bounds.end),
    };
  };

  const result = runNativeGameUpdateTick(slice, {
    state: captured,
    constants: sparseConstants,
    runtimeInputs: sparseRuntime,
    onHostEvent: host,
    recapture,
    recaptureRuntime,
    lockstep,
  });

  applySparseStateToScratch(slice, result.state);
  exportGameObjectFromScratch(slice, gameObject);

  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    usesX86Emulation: false,
    state: result.state,
    events: result.events,
    continuationKind: result.continuationKind,
    gameObject,
    hostTotals: host.totals || null,
    residualExecuted: host.executed || null,
  };
}

/**
 * Session object for multi-frame browser/dev native ticks.
 * Owns sparse state across rAF frames; HostHandler never selects PE.
 * Optional `gameObject` enables capture/apply hybrid path each tick.
 *
 * Room capture contract (ABI v67): the session's sparseState is the Room
 * model. Binary-homed fields travel through the Game buffer; the 35
 * host-owned fields (HOST_OWNED_STATE_CONTRACT) travel through the hybrid
 * hostState overlay. Both lanes accept statePatch, and result.state feeds
 * the next tick, so Room state persists per SESSION — not per Wasm module
 * instance, which is what made the pre-v67 trigger-clear chain a one-shot.
 *
 * Optional `recaptureAfter(kind, ctx)` runs inside the tick's pre-resume
 * recapture seam — immediately BEFORE each continuation resume (the same
 * timing class as the F4 post-Pass-A recount). It receives the resume
 * kind ("roomUpdatePrefixB2", "4257b0PassA", ...) and may return a sparse
 * state patch (merged over the resumed state). The bridge uses it to fill
 * the record-16 B8 k-blob scratch at the exact resume_room_update_prefix_b2
 * seam (the per-tick isaac_game_update_slice_reset_scratch zeroes the
 * scratch at tick start, so any pre-tick fill would be wiped).
 */
export function createNativeUpdateSession(slice, {
  state = null,
  constants = null,
  runtimeInputs = null,
  onHostEvent = null,
  gameObject = null,
  residualBodies = null,
  recaptureAfter = null,
  lockstep = true,
} = {}) {
  if (!slice || slice.mode !== FRAME_PATH_MODE.NATIVE_WASM || slice.usesX86Emulation) {
    throw new Error("createNativeUpdateSession requires a native-wasm slice");
  }
  let sparseState = state ? { ...state } : createDefaultNativeState();
  const sparseConstants = constants ? { ...constants } : createDefaultNativeConstants();
  const sparseRuntime = runtimeInputs
    ? { ...createDefaultNativeRuntimeInputs(), ...runtimeInputs }
    : createDefaultNativeRuntimeInputs();
  let liveGameObject = gameObject;
  if (liveGameObject == null) {
    liveGameObject = new Uint8Array(GAME_OBJECT_MIN_SIZE);
    writeSparseFieldsToGameObject(liveGameObject, sparseState);
  } else if (!(liveGameObject instanceof Uint8Array) || liveGameObject.byteLength < GAME_OBJECT_MIN_SIZE) {
    throw new Error(`gameObject must be Uint8Array of size >= ${GAME_OBJECT_MIN_SIZE}`);
  }
  const host = onHostEvent || createResidualHostHandler({ bodies: residualBodies });
  let ticks = 0;
  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    usesX86Emulation: false,
    get state() {
      return sparseState;
    },
    get gameObject() {
      return liveGameObject;
    },
    get ticks() {
      return ticks;
    },
    get hostTotals() {
      return host.totals || null;
    },
    get residualExecuted() {
      return host.executed || null;
    },
    tick(extraRuntime = null, statePatch = null) {
      const runtime = extraRuntime
        ? { ...sparseRuntime, ...extraRuntime }
        : sparseRuntime;
      /* Host-supplied sparse-state deltas (browser input bridge) must be merged
         BEFORE the buffer write below, otherwise writeSparseFieldsToGameObject
         re-stamps the previous tick's values over them and the delta is lost.
         Unknown keys are rejected so a typo cannot silently do nothing. */
      if (statePatch) {
        for (const key of Object.keys(statePatch)) {
          if (!(key in sparseState)) {
            throw new Error(`unknown sparse state field in statePatch: ${key}`);
          }
        }
        sparseState = { ...sparseState, ...statePatch };
      }
      // Always drive hybrid capture/apply so the live Game-object buffer is
      // the source of truth (sparse fields only; untranslated bytes preserved).
      writeSparseFieldsToGameObject(liveGameObject, sparseState);
      /* Room capture contract (ABI v67): the buffer write above cannot carry
         the 35 host-owned fields (no Game-object home), so the session's own
         sparseState — statePatch already merged — is ALSO threaded as the
         hybrid's hostState. That is what makes Room state a real per-session
         lifecycle: tick N's outputs (result.state) become tick N+1's inputs,
         exactly the PE's per-RoomDescriptor persistence, with room changes
         expressed as statePatch writes. */
      const result = runHybridGameUpdateTick(slice, {
        gameObject: liveGameObject,
        constants: sparseConstants,
        runtimeInputs: runtime,
        onHostEvent: host,
        residualBodies,
        recaptureAfter,
        hostState: sparseState,
        lockstep,
      });
      sparseState = { ...result.state };
      ticks += 1;
      return result;
    },
  };
}


/* =====================================================================
 * Wave-2 frame-path drivers (pure-plan side of the PE-free frame loop).
 *
 * Every driver is a three-way switch:
 *   - wasm-backed  : drives the family's zero-import Wasm exports
 *                    (same exports the family tests differential-verify);
 *   - js-oracle    : drives the family's separately-reasoned JS oracle;
 *   - null/fallback: the pre-wave residual shape (monolithic host body,
 *                    no pure posts) so missing roots are byte-for-byte
 *                    the old frame path. Tests pin both states.
 * ===================================================================== */

/** ProcessInput pre-poll block FUN_00954cd0 @ 0x00954d4d..0x00954f46
 *  (family ABI 25). PE-ordered gates + host edges + sparse Manager stores. */
export const PROCESS_INPUT_PREPOLL_PURE_HELPER_NAMES = Object.freeze([
  "manager_prepoll_state4_store_needed",
  "manager_prepoll_g1_needed",
  "manager_prepoll_g2_needed",
  "manager_prepoll_host_c_needed",
  "manager_prepoll_state3_transition_needed",
  "manager_prepoll_g3_needed",
  "manager_prepoll_state5_transition_needed",
  "manager_prepoll_arm_select",
  "manager_prepoll_copy_block_needed",
  "manager_prepoll_g4_needed",
  "manager_prepoll_game_b0_next",
  "manager_prepoll_log_needed",
  "manager_prepoll_nightmare_arg",
]);

export function processInputPrepollJsPure() {
  return {
    state4StoreNeeded: managerPrepollState4StoreNeeded,
    g1Needed: managerPrepollG1Needed,
    g2Needed: managerPrepollG2Needed,
    hostCNeeded: managerPrepollHostCNeeded,
    state3TransitionNeeded: managerPrepollState3TransitionNeeded,
    g3Needed: managerPrepollG3Needed,
    state5TransitionNeeded: managerPrepollState5TransitionNeeded,
    armSelect: managerPrepollArmSelect,
    copyBlockNeeded: managerPrepollCopyBlockNeeded,
    g4Needed: managerPrepollG4Needed,
    logNeeded: managerPrepollLogNeeded,
    nightmareArg: managerPrepollNightmareArg,
    gameB0Next: managerPrepollGameB0Next,
  };
}

export function processInputPrepollWasmPure(wasm) {
  const u32 = (name) => {
    const fn = wasm[`isaac_${name}`];
    if (typeof fn !== "function") {
      throw new Error(`ProcessInput pre-poll Wasm export missing: isaac_${name}`);
    }
    return (...args) => fn(...args.map((v) => (v ?? 0) >>> 0)) >>> 0;
  };
  const bool = (name) => {
    const fn = u32(name);
    return (...args) => (fn(...args) & 0xff) !== 0;
  };
  return {
    state4StoreNeeded: bool("manager_prepoll_state4_store_needed"),
    g1Needed: bool("manager_prepoll_g1_needed"),
    g2Needed: bool("manager_prepoll_g2_needed"),
    hostCNeeded: bool("manager_prepoll_host_c_needed"),
    state3TransitionNeeded: bool("manager_prepoll_state3_transition_needed"),
    g3Needed: bool("manager_prepoll_g3_needed"),
    state5TransitionNeeded: bool("manager_prepoll_state5_transition_needed"),
    armSelect: u32("manager_prepoll_arm_select"),
    copyBlockNeeded: bool("manager_prepoll_copy_block_needed"),
    g4Needed: bool("manager_prepoll_g4_needed"),
    logNeeded: bool("manager_prepoll_log_needed"),
    nightmareArg: u32("manager_prepoll_nightmare_arg"),
    gameB0Next: (oldB0) => u32("manager_prepoll_game_b0_next")(oldB0),
  };
}

/**
 * Runs the pre-poll state machine in PE order. `pure` is a map from
 * processInputPrepollJsPure() / processInputPrepollWasmPure(); when null the
 * driver returns the pre-wave monolithic residual (whole block host).
 * `inputs` are RAW Manager field values (no pre-masking; the gates narrow
 * the low byte inside, PE `cmp byte ptr [...]`).
 */
export function runProcessInputPrepollRoot(inputs = {}, pure = null) {
  const i = (k, d = 0) => (inputs[k] === undefined || inputs[k] === null ? d : inputs[k]);
  const fallback = {
    rootId: "ProcessInput",
    wired: false,
    fallback: true,
    monolithic: true,
    usesX86Emulation: false,
    residualEvents: [{ kind: "processInputPrepollMonolithic", count: 1 }],
    hosts: [
      { id: "A", va: PREPOLL_HOST_A_VA, needed: true },
      { id: "B", va: PREPOLL_HOST_B_VA, needed: true },
      { id: "C", va: PREPOLL_HOST_C_VA, needed: true },
      { id: "D", va: PREPOLL_HOST_D_VA, needed: true },
      { id: "E", va: PREPOLL_HOST_E_VA, needed: true },
      { id: "F", va: PREPOLL_HOST_F_VA, needed: true },
      { id: "G", va: PREPOLL_HOST_G_VA, needed: true },
      { id: "H", va: PREPOLL_HOST_H_VA, needed: true },
    ],
  };
  if (!pure) return fallback;

  const state4Store = pure.state4StoreNeeded(i("byte0"));
  const g1 = pure.g1Needed(i("byte21618"));
  const g2 = pure.g2Needed(i("byte21620"));
  const hostC = pure.hostCNeeded(g1, g2);
  const state3 = pure.state3TransitionNeeded(g1);
  const g3 = pure.g3Needed(i("byte4b2a4"));
  const state5 = pure.state5TransitionNeeded(g3);
  const arm = pure.armSelect(
    i("state"), g3, i("dword21628"), i("dword20dd0"));
  const copyBlock = pure.copyBlockNeeded(arm, i("byte21620"));
  const g4 = pure.g4Needed(i("byte4b428"));
  const g4Path = arm === PREPOLL_ARM_STATE3 && !copyBlock && g4;
  const logNeeded = pure.logNeeded(i("history"));
  const nightmareArg = pure.nightmareArg(i("byte4b2a5"));
  const state = i("state");

  const stores = [];
  if (state4Store) {
    stores.push({ off: PREPOLL_STATE_OFS, value: PREPOLL_STATE4_VALUE, bytes: 4 });
    stores.push({ off: 0, value: 0, bytes: 1 });
  }
  if (hostC) stores.push({ off: 0x4b284, value: 0, bytes: 1 });
  if (state3) {
    stores.push({ off: PREPOLL_HISTORY_OFS, value: state, bytes: 4 });
    stores.push({ off: PREPOLL_STATE_OFS, value: PREPOLL_STATE3_VALUE, bytes: 4 });
    stores.push({ off: PREPOLL_G1_OFS, value: 0, bytes: 1 });
  }
  if (state5) {
    stores.push({ off: PREPOLL_HISTORY_OFS, value: state, bytes: 4 });
    stores.push({ off: PREPOLL_STATE_OFS, value: PREPOLL_STATE5_VALUE, bytes: 4 });
    stores.push({ off: PREPOLL_G3_OFS, value: 0, bytes: 1 });
  }
  if (arm === PREPOLL_ARM_STATE3) {
    stores.push({ off: PREPOLL_STATE3ARM_BYTE_OFS, value: 0, bytes: 1 });
  }
  if (copyBlock) {
    const slot = i("slotIndex");
    /* PE 0x00954e30: state=[history] — the state FIELD gets the history
       value (inverse of the G1/G3 pushes, which write history=[state]). */
    stores.push({ off: PREPOLL_STATE_OFS, value: i("history"), bytes: 4 });
    stores.push({ off: PREPOLL_COPY_DST_EXT, value: i("dword21624"), bytes: 4 });
    stores.push({
      off: PREPOLL_COPY_SRC_BASE + ((slot * PREPOLL_COPY_STRIDE) >>> 0),
      to: PREPOLL_COPY_DST_CORE, bytes: 0x10,
    });
    stores.push({
      off: PREPOLL_COPY_SRC_DW + ((slot * PREPOLL_COPY_STRIDE) >>> 0),
      to: PREPOLL_COPY_DST_DW, bytes: 4,
    });
    stores.push({ off: PREPOLL_COPY_FLAG_OFS, value: PREPOLL_COPY_FLAG_VALUE, bytes: 1 });
  }
  if (arm === PREPOLL_ARM_STATE3) {
    stores.push({ off: PREPOLL_G4_OFS, value: 0, bytes: 1 });
  }
  const gameStoreBlock = g4Path
    ? {
        b0Next: pure.gameB0Next(i("gameB0")),
        baseOfs: PREPOLL_GAME_STORE_BASE_OFS,
        b4Ofs: PREPOLL_GAME_STORE_B4_OFS,
        b8Ofs: PREPOLL_GAME_STORE_B8_OFS,
        bcOfs: PREPOLL_GAME_STORE_BC_OFS,
        b8Bits: PREPOLL_GAME_STORE_B8_BITS,
        bcValue: PREPOLL_GAME_STORE_BC_VALUE,
      }
    : null;
  if (g4Path) {
    /* PE 0x00954e86: state=[history] (same inverse write as the copy block). */
    stores.push({ off: PREPOLL_STATE_OFS, value: i("history"), bytes: 4 });
  }

  const hosts = [
    { id: "A", va: PREPOLL_HOST_A_VA, needed: true, thisOfs: 0 },
    { id: "B", va: PREPOLL_HOST_B_VA, needed: true, thisOfs: 0 },
    { id: "C", va: PREPOLL_HOST_C_VA, needed: hostC, thisOfs: 0 },
    {
      id: "D", va: PREPOLL_HOST_D_VA, needed: state3,
      recvOfs: PREPOLL_PREDISPATCH_RECV_OFS, arg: i("dword2161c"),
    },
    {
      id: "E", va: PREPOLL_HOST_E_VA, needed: state5,
      recvOfs: PREPOLL_STATE5_RECV_OFS, arg: nightmareArg,
    },
    { id: "F", va: PREPOLL_HOST_F_VA, needed: g4Path, thisOfs: 0 },
    { id: "G", va: PREPOLL_HOST_G_VA, needed: g4Path, arg: PREPOLL_HOST_G_ARG },
    {
      id: "H", va: PREPOLL_HOST_H_VA, needed: g4Path && logNeeded,
      recvOfs: PREPOLL_CROSSFADE_RECV_OFS,
      args: [PREPOLL_CROSSFADE_MUSIC_ID, PREPOLL_CROSSFADE_RATE_BITS],
    },
  ];

  const logEdge =
    g4Path && logNeeded
      ? residualLogEdge({
          level: PREPOLL_LOG_LEVEL,
          msgVa: PREPOLL_LOG_MSG_VA,
          va: PREPOLL_LOG_VA,
          guard: i("logGuard"),
          listenerPtr: i("logListenerPtr"),
          listenerMask: i("logListenerMask"),
          atLineStartByte: i("logAtLineStartByte"),
          initOk: i("logInitOk"),
        })
      : null;

  return {
    rootId: "ProcessInput",
    wired: true,
    fallback: false,
    usesX86Emulation: false,
    pureHelperNames: PROCESS_INPUT_PREPOLL_PURE_HELPER_NAMES.slice(),
    gates: {
      state4Store,
      g1,
      g2,
      hostC,
      state3,
      g3,
      state5,
      arm,
      copyBlock,
      g4,
      g4Path,
      logNeeded,
      nightmareArg,
    },
    hosts,
    stores,
    gameStoreBlock,
    logEdge,
    residualEvents: [
      ...hosts.filter((h) => h.needed).map((h) => ({ kind: `processInputPrepollHost${h.id}`, count: 1, va: h.va })),
      ...(logEdge && !logEdge.dropped
        ? [{ kind: "processInputPrepollLog", count: 1, va: PREPOLL_LOG_VA }]
        : []),
    ],
  };
}

/* ------------------------- Exit root plan (ABI 35) ------------------------- */

export const EXIT_ROOT_PURE_HELPER_NAMES = Object.freeze([
  "exit_root_plan",
  "exit_root_map_walk_plan",
  "exit_root_map_walk_flag_active",
  "exit_root_map_walk_elem_host_this",
  "exit_root_map_walk_flag_addr",
  "exit_root_map_walk_next",
]);

/** Normalizes the family JS oracle / Wasm plan struct into one shape
 *  (the oracle's inactive branch returns booleans + a zero-padded 48-word
 *  event array; its active branch returns 1/0 numbers + a short array). */
function normalizeExitRootPlan(plan) {
  const events = new Array(EXIT_ROOT_EVENT_CAP).fill(0);
  const src = Array.isArray(plan.events) ? plan.events : [];
  for (let k = 0; k < EXIT_ROOT_EVENT_CAP && k < src.length; k++) {
    events[k] = src[k] >>> 0;
  }
  return {
    entryActive: !!plan.entryActive,
    shouldSave: plan.shouldSave >>> 0,
    overlayForceNeeded: !!plan.overlayForceNeeded,
    sfxStopCount: plan.sfxStopCount | 0,
    sfxReceiverOff: plan.sfxReceiverOff >>> 0,
    mgrHost7df690Receiver: plan.mgrHost7df690Receiver >>> 0,
    pgdFlushNeeded: !!plan.pgdFlushNeeded,
    pgdSaveCloud: !!plan.pgdSaveCloud,
    gamestateIoNeeded: !!plan.gamestateIoNeeded,
    gamestateShouldWrite: !!plan.gamestateShouldWrite,
    anm2ResetCount: plan.anm2ResetCount | 0,
    anm2ResetThisOff: (plan.anm2ResetThisOff ?? []).slice(),
    vectorDtorCount: plan.vectorDtorCount | 0,
    host8d26c0Needed: !!plan.host8d26c0Needed,
    eventCount: plan.eventCount | 0,
    events,
  };
}

export function exitRootJsPure() {
  /* The oracle takes 12 POSITIONAL inputs; the wasm adapter reads the same
     from the plan struct. */
  return {
    plan: (inputs) => exitRootPlan(
      inputs.shouldSave,
      inputs.sessionActive2658a,
      inputs.overlayState1c034,
      inputs.mgrChangesmade14,
      inputs.mgrFileLoadedf8c,
      inputs.steamCtxWord,
      inputs.mgrCloud2a3a4,
      inputs.skipGamestateIo2658b,
      inputs.mgrCount29fbc,
      inputs.vectorBegin,
      inputs.vectorEnd,
      inputs.setIndex7d8,
    ),
    mapWalk: exitRootMapWalkPlan,
    flagActive: exitRootMapWalkFlagActive,
    elemHostThis: exitRootMapWalkElemHostThis,
    flagAddr: exitRootMapWalkFlagAddr,
    next: exitRootMapWalkNext,
  };
}

/** Wasm-backed plan driver: writes the plan struct to scratch and reads it
 *  back (struct layout must match native/decomp/exit_pure_helpers.h). */
export function exitRootWasmPure(wasm) {
  const plan = wasm.isaac_exit_root_plan;
  const walk = wasm.isaac_exit_root_map_walk_plan;
  const flagActive = wasm.isaac_exit_root_map_walk_flag_active;
  const elemHostThis = wasm.isaac_exit_root_map_walk_elem_host_this;
  const flagAddr = wasm.isaac_exit_root_map_walk_flag_addr;
  const next = wasm.isaac_exit_root_map_walk_next;
  for (const [n, fn] of [["exit_root_plan", plan], ["exit_root_map_walk_plan", walk],
    ["exit_root_map_walk_flag_active", flagActive],
    ["exit_root_map_walk_elem_host_this", elemHostThis],
    ["exit_root_map_walk_flag_addr", flagAddr],
    ["exit_root_map_walk_next", next]]) {
    if (typeof fn !== "function") {
      throw new Error(`Exit root Wasm export missing: isaac_${n}`);
    }
  }
  return {
    plan: (inputs) => {
      const out = 0x100000;
      const u = (v) => (v ?? 0) >>> 0;
      plan(
        out,
        u(inputs.shouldSave),
        u(inputs.sessionActive2658a),
        u(inputs.overlayState1c034),
        u(inputs.mgrChangesmade14),
        u(inputs.mgrFileLoadedf8c),
        u(inputs.steamCtxWord),
        u(inputs.mgrCloud2a3a4),
        u(inputs.skipGamestateIo2658b),
        u(inputs.mgrCount29fbc),
        u(inputs.vectorBegin),
        u(inputs.vectorEnd),
        u(inputs.setIndex7d8),
      );
      const dv = new DataView(wasm.memory.buffer);
      const i32 = (o) => dv.getInt32(out + o, true);
      const u32 = (o) => dv.getUint32(out + o, true);
      const count = i32(64);
      /* The JS oracle zero-pads the event array to CAP; the Wasm struct
         leaves words beyond eventCount unspecified, so pad the same way. */
      const events = new Array(EXIT_ROOT_EVENT_CAP).fill(0);
      for (let k = 0; k < EXIT_ROOT_EVENT_CAP; k++) events[k] = u32(68 + k * 4);
      return {
        entryActive: i32(0) !== 0,
        shouldSave: u32(4),
        overlayForceNeeded: i32(8) !== 0,
        sfxStopCount: i32(12),
        sfxReceiverOff: u32(16),
        mgrHost7df690Receiver: u32(20),
        pgdFlushNeeded: i32(24) !== 0,
        pgdSaveCloud: i32(28) !== 0,
        gamestateIoNeeded: i32(32) !== 0,
        gamestateShouldWrite: i32(36) !== 0,
        anm2ResetCount: i32(40),
        anm2ResetThisOff: [u32(44), u32(48), u32(52)],
        vectorDtorCount: i32(56),
        host8d26c0Needed: i32(60) !== 0,
        eventCount: count,
        events,
      };
    },
    mapWalk: (view, mapAddr, outSlot, copyBytes = 0x10000) => {
      const mem = wasm.memory.buffer;
      const src = new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
      const dst = new Uint8Array(mem);
      const base = mapAddr >>> 0;
      // Copy the walkable region into wasm memory at the SAME addresses.
      dst.set(src.subarray(base, base + copyBytes), base);
      const out = 0x103000;
      walk(out, base, (outSlot ?? 0) >>> 0);
      const dv = new DataView(mem);
      const i32 = (o) => dv.getInt32(out + o, true);
      const u32 = (o) => dv.getUint32(out + o, true);
      const count = i32(20);
      const events = [];
      for (let k = 0; k < count; k++) events.push(u32(28 + k * 4));
      // Copy applied flag clears back so the caller's buffer matches the
      // JS-oracle trace (the walk APPLIES clears, like the PE).
      src.set(dst.subarray(base, base + copyBytes), base);
      return {
        walkActive: i32(0),
        nodeCount: i32(4),
        elemHostCount: i32(8),
        flagClearCount: i32(12),
        globalHostCount: i32(16),
        eventCount: count,
        truncated: i32(24),
        events,
      };
    },
    flagActive: (flag28) => (flagActive(flag28 >>> 0) | 0) !== 0,
    elemHostThis: (elem) => elemHostThis(elem >>> 0) >>> 0,
    flagAddr: (found) => flagAddr(found >>> 0) >>> 0,
    next: (node) => next(node >>> 0) >>> 0,
  };
}

/**
 * Runs the Game::Exit root plan (PE 0x006fa531 early-ret gate + typed
 * continuation). `pure` is exitRootJsPure()/exitRootWasmPure(); null returns
 * the pre-wave un-wired shape (no plan at all).
 */
export function runExitRootPlan(inputs = {}, pure = null) {
  if (!pure) {
    return { rootId: "Exit", wired: false, fallback: true, plan: null };
  }
  return {
    rootId: "Exit",
    wired: true,
    fallback: false,
    usesX86Emulation: false,
    pureHelperNames: EXIT_ROOT_PURE_HELPER_NAMES.slice(),
    plan: normalizeExitRootPlan(pure.plan(inputs)),
  };
}

/**
 * Runs the Game::Exit map-walk continuation (PE 0x006fa457..0x006fa50a) over
 * a linear-memory _Tree at `mapAddr` (sentinel at mapAddr, root at
 * [mapAddr+4]). `pure` is exitRootJsPure()/exitRootWasmPure(); null returns
 * the pre-wave monolithic walk residual.
 */
export function runExitMapWalkContinuation(view, mapAddr, outSlot, pure = null) {
  if (!pure || typeof view?.getUint8 !== "function") {
    return {
      rootId: "ExitMapWalk",
      wired: false,
      fallback: true,
      usesX86Emulation: false,
      residualEvents: [{ kind: "exitRootMapWalkMonolithic", count: 1 }],
    };
  }
  const plan = pure.mapWalk(view, mapAddr >>> 0, (outSlot ?? 0) >>> 0);
  const events = [];
  for (let k = 0; k < plan.eventCount; k++) {
    const w = plan.events[k] >>> 0;
    const kind = w >>> 24;
    const payload = w & 0xffffff;
    if (kind === EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST) {
      events.push({ kind: "exitRootMapWalkElemHost", va: EXIT_ROOT_MAP_WALK_ELEM_HOST_VA, elem: payload });
    } else if (kind === EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST) {
      events.push({ kind: "exitRootMapWalkGlobalHost", va: EXIT_ROOT_MAP_WALK_GLOBAL_VA });
    } else if (kind === EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR) {
      events.push({ kind: "exitRootMapWalkFlagClear", va: EXIT_ROOT_MAP_WALK_FIND_VA, flagAddr: payload });
    }
  }
  return {
    rootId: "ExitMapWalk",
    wired: true,
    fallback: false,
    usesX86Emulation: false,
    pureHelperNames: EXIT_ROOT_PURE_HELPER_NAMES.slice(),
    walkActive: plan.walkActive,
    nodeCount: plan.nodeCount,
    elemHostCount: plan.elemHostCount,
    flagClearCount: plan.flagClearCount,
    globalHostCount: plan.globalHostCount,
    truncated: plan.truncated,
    events,
  };
}

/* ------------------- Exit root per-frame step (plan-driven wiring) -------------------
 *
 * Game::Exit has NO root-slice ABI (the family header is explicit: "Not an
 * Exit slice ABI and not wired into the Update frame path"). The wired Exit
 * root is the wasm-backed ROOT PLAN step: bootNativeUpdateBridge (web/js/
 * native-update-bridge.js) drives runExitRootPlan once per frame over the exit
 * pure-helper module (multiRoot.helpers.exit), the same exports the family
 * tests differential-verify (exitRootWasmPure). This mirrors the Render root
 * slice wiring where the guest-memory inputs cannot come from a live PE bridge:
 * the plan's 12 inputs are caller-supplied (setExitInputs provider on the
 * bridge), and the all-zero default closes the entry gate (no exit in
 * progress) — exactly like Render's G0-closed default. Missing module is
 * non-fatal and never opens x86 PE emulation.
 * ---------------------------------------------------------------------------- */

/** Exit root host-event kinds emitted by the per-frame step (subset of
 *  HOST_EVENT_KINDS; kept adjacent to the plan event-word loop). */
export const EXIT_ROOT_HOST_KINDS = Object.freeze([
  "exitRootHost",
  "exitRootVectorDtorLoop",
  "exitRootMapWalk",
]);

/**
 * Default Game::Exit root plan inputs — all-zero (entry gate closed).
 *
 * The 12 plan inputs are live PE guest-memory fields the bridge cannot read
 * without a sparse bridge, so they are caller-supplied like the Render
 * inputs. Field offsets (names from scripts/decomp/exit-pure-model.mjs):
 *   shouldSave          GameState IO write-vs-delete select (0x006fa20e)
 *   sessionActive2658a  low byte gate Game+0x2658a (0x006fa0d2)
 *   overlayState1c034   Game+0x1c034
 *   mgrChangesmade14    Manager (+0x14; PGD changes)
 *   mgrFileLoadedf8c    Manager (+0xf8c)
 *   steamCtxWord        Steam context (IAT 0x00b18a1c / DAT arg 0x00c5c3a4)
 *   mgrCloud2a3a4       Manager+0x2a3a4
 *   skipGamestateIo2658b low byte gate Game+0x2658b (0x006fa20e)
 *   mgrCount29fbc       Manager+0x29fbc (7df690 receiver count)
 *   vectorBegin/End     Game vector 0x25ebc/0x25ec0 dtor range
 *   setIndex7d8         manager set-index gate (0x008d26c0 drop arm)
 */
export function createDefaultExitRootInputs(overrides = null) {
  return {
    shouldSave: 0,
    sessionActive2658a: 0,
    overlayState1c034: 0,
    mgrChangesmade14: 0,
    mgrFileLoadedf8c: 0,
    steamCtxWord: 0,
    mgrCloud2a3a4: 0,
    skipGamestateIo2658b: 0,
    mgrCount29fbc: 0,
    vectorBegin: 0,
    vectorEnd: 0,
    setIndex7d8: 0,
    ...(overrides && typeof overrides === "object" ? overrides : null),
  };
}

/** Normalize a normalized Exit root plan's PE-ordered event words into host
 *  events for the residual HostHandler (kind names = EXIT_ROOT_HOST_KINDS).
 *  PURE segment words (EXIT_ROOT_EVENT_PURE) are plan data, not host
 *  actions, so they are left out of the host stream. */
export function exitRootPlanHostEvents(plan) {
  if (!plan || !Array.isArray(plan.events)) return [];
  const events = [];
  for (let k = 0; k < (plan.eventCount ?? 0); k++) {
    const word = plan.events[k] >>> 0;
    const kind = word >>> 24;
    const payload = word & 0xffffff;
    if (kind === EXIT_ROOT_EVENT_HOST) {
      events.push({ kind: "exitRootHost", count: 1, va: payload, word });
    } else if (kind === EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP) {
      events.push({ kind: "exitRootVectorDtorLoop", count: 1, elemCount: payload, word });
    } else if (kind === EXIT_ROOT_EVENT_MAP_WALK) {
      events.push({ kind: "exitRootMapWalk", count: 1, word });
    }
  }
  return events;
}

/**
 * Per-frame Game::Exit root step session (plan-driven; no capture/step/resume
 * slice exists for the family). `pure` is exitRootJsPure()/exitRootWasmPure()
 * or null — null returns runExitRootPlan's pre-wave un-wired shape every tick
 * (wired:false, fallback:true) without PE and still advances `ticks`.
 *
 * @param {object} [opts]
 * @param {object|null} [opts.pure] wasm-backed exit root pure adapter (null =
 *   fallback step).
 * @param {Function|null} [opts.onHostEvent] residual HostHandler (must expose
 *   totals; defaults to a counting residual handler).
 */
export function createExitRootSession({ pure = null, onHostEvent = null } = {}) {
  if (pure != null && typeof pure.plan !== "function") {
    throw new Error("createExitRootSession requires an exit pure adapter exposing .plan (or null)");
  }
  const host = onHostEvent || createResidualHostHandler();
  const mode = pure ? FRAME_PATH_MODE.NATIVE_WASM : FRAME_PATH_MODE.EMULATOR_X86;
  let ticks = 0;
  return {
    rootId: "Exit",
    mode,
    usesX86Emulation: false,
    get ticks() {
      return ticks;
    },
    get hostTotals() {
      return host.totals || null;
    },
    /**
     * One Exit root step: overlay caller inputs over the all-zero defaults,
     * run the wasm-backed plan (or fallback), report host events to the
     * residual HostHandler, return the normalized plan result.
     * @param {object|null} [inputsOrOverrides]
     */
    tick(inputsOrOverrides = null) {
      const overrides =
        inputsOrOverrides && typeof inputsOrOverrides === "object"
          ? inputsOrOverrides
          : null;
      const inputs = createDefaultExitRootInputs(overrides);
      const result = runExitRootPlan(inputs, pure);
      if (result.plan) {
        for (const event of exitRootPlanHostEvents(result.plan)) host(event);
      }
      ticks += 1;
      return result;
    },
  };
}

/* ------------------------- playerhud UpdateHearts plan ------------------------- */

/**
 * Pure UpdateHearts call-site plan (VA 0x008422b3..0x008422ee) for one
 * occupied playerHud slot. `pure` is the family JS oracle or a wasm-backed
 * adapter; null returns the pre-wave count-only shape.
 */
export function playerHudUpdateHeartsPlan(pack = {}, pure = null) {
  const twinPtr = (pack.twinPtr ?? 0) >>> 0;
  const playerType = (pack.playerType ?? 0) | 0;
  const field3bc = (pack.field3bc ?? 0) | 0;
  if (!pure) {
    return { wired: false, fallback: true, calls: [], isTwin: 0 };
  }
  const plan = pure.callPlan(twinPtr, playerType, field3bc);
  return {
    wired: true,
    fallback: false,
    usesX86Emulation: false,
    isTwin: plan.isTwin,
    calls: plan.calls.map((c) => ({
      heartSlotsOff: c.heartSlotsOff,
      maxSlots: c.maxSlots,
      argSource: c.argSource,
      // ARG_TWIN re-reads [player+0x1d98] LIVE at 0x008422ca.
      liveReRead: c.argSource === PLAYERHUD_UPDATE_HEARTS_ARG_TWIN,
    })),
  };
}

export function playerHudUpdateHeartsJsPure() {
  return { callPlan: playerHudUpdateHeartsCallPlan };
}

export function playerHudUpdateHeartsWasmPure(wasm) {
  const plan = wasm.isaac_playerhud_update_hearts_call_plan;
  const twin = wasm.isaac_playerhud_update_hearts_uses_twin;
  if (typeof plan !== "function" || typeof twin !== "function") {
    throw new Error("playerhud UpdateHearts Wasm exports missing");
  }
  return {
    callPlan: (twinPtr, playerType, field3bc) => {
      const out = 0x102000;
      plan(out, twinPtr >>> 0, playerType >>> 0, field3bc >>> 0);
      const dv = new DataView(wasm.memory.buffer);
      const isTwin = dv.getInt32(out, true);
      const count = dv.getInt32(out + 4, true);
      const calls = [];
      for (let k = 0; k < count; k++) {
        calls.push({
          heartSlotsOff: dv.getUint32(out + 8 + k * 12, true),
          maxSlots: dv.getUint32(out + 12 + k * 12, true),
          argSource: dv.getUint32(out + 16 + k * 12, true),
        });
      }
      return { isTwin, calls };
    },
  };
}

/* ------------------------- residual log edge (log v5) ------------------------- */

/**
 * Routes one residual log call through the log family level-gate (ABI 5).
 * The gate + init/lock decisions are pure (`logEmitPlan`); only the
 * console/file tail stays a platform host. `dropped` means the PE itself
 * never reaches I/O (guard closed, gate closed, or init failed) — the
 * residual host edge is then omitted.
 */
export function residualLogEdge(scenario = {}) {
  const level = (scenario.level ?? 0) >>> 0;
  const guard = (scenario.guard ?? 0) >>> 0;
  const listenerPtr = (scenario.listenerPtr ?? 0) >>> 0;
  const listenerMask = (scenario.listenerMask ?? 0) >>> 0;
  const atLineStartByte = (scenario.atLineStartByte ?? 0) >>> 0;
  const initOk = (scenario.initOk ?? 0) >>> 0;
  const plan = logEmitPlan({
    level, guard, listenerPtr, listenerMask, atLineStartByte, initOk,
  });
  const dropped =
    plan.droppedGuard !== 0 || plan.droppedGate !== 0 || plan.initFailDrops !== 0;
  return {
    dropped,
    plan,
    host: dropped
      ? null
      : {
          level,
          va: (scenario.va ?? 0) >>> 0,
          msgVa: (scenario.msgVa ?? 0) >>> 0,
          listenerPtr,
          listenerMask,
          lockNeeded: plan.lockNeeded,
          consoleNeeded: plan.consoleNeeded,
          prefixCase: plan.prefixCase,
        },
  };
}

/** PM3 SFX warn-log scenario (v68 residual keeps the warn-log host on
 *  NO_SAMPLES; the log edge itself is level-gated pure). */
function pmSfxWarnLogEdge(runtimeInputs, gate) {
  if (runtimeInputs == null || gate !== PM_SFX_GATE_NO_SAMPLES) return null;
  return residualLogEdge({
    level: PM_SFX_WARN_LOG_LEVEL,
    msgVa: PM_SFX_WARN_LOG_STR_VA,
    va: PM_SFX_WARN_LOG_VA,
    guard: (runtimeInputs.logGuard ?? 0) >>> 0,
    listenerPtr: (runtimeInputs.logListenerPtr ?? 0) >>> 0,
    listenerMask: (runtimeInputs.logListenerMask ?? 0) >>> 0,
    atLineStartByte: (runtimeInputs.logAtLineStartByte ?? 0) >>> 0,
    initOk: (runtimeInputs.logInitOk ?? 0) >>> 0,
  });
}


function collectHostEvents(events, handler, runtimeInputs = null, extras = null) {
  if (typeof handler !== "function") return;
  const emit = (kind, count = 1, detail = {}) => {
    if (!count) return;
    /* Flatten detail onto the event so residual bodies can read event.loopCount /
       event.sparseReady etc. (same shape as direct residual({ ...fields }) calls). */
    handler({ kind, count, ...detail, detail, events });
  };
  /* ABI v48: when sparse packs live, attach wire_decide inputs so HostHandler
     applies B3B7/B9B11 pure posts (MONOLITHIC vs host-fragments residual). */
  const b3b7Detail =
    runtimeInputs != null && ((runtimeInputs.b3b7SparseReady ?? 0) >>> 0) !== 0
      ? {
          sparseReady: 1,
          teByte7321: (runtimeInputs.b3b7TeByte7321 ?? 0) >>> 0,
          teBegin: (runtimeInputs.b3b7TeBegin ?? 0) >>> 0,
          teEnd: (runtimeInputs.b3b7TeEnd ?? 0) >>> 0,
          descType0: (runtimeInputs.b3b7DescType0 ?? 0) | 0,
          roomActiveByte0: (runtimeInputs.ambientRoomActive ?? 1) >>> 0,
          entry11f0: (runtimeInputs.ambientRoomEntry11f0 ?? 0) | 0,
          treeCount7238: (runtimeInputs.b3b7TreeCount7238 ?? 0) >>> 0,
          widthC: (runtimeInputs.b3b7WidthC ?? 0) | 0,
          height10: (runtimeInputs.b3b7Height10 ?? 0) | 0,
        }
      : runtimeInputs != null
        ? { sparseReady: 0 }
        : {};
  const b9b11Detail =
    runtimeInputs != null && ((runtimeInputs.b9b11InputsReady ?? 0) >>> 0) !== 0
      ? {
          inputsReady: 1,
          challengeResultNonzero: (runtimeInputs.b9b11ChallengeResultNonzero ?? 0) | 0,
          roomActiveByte0: (runtimeInputs.ambientRoomActive ?? 1) >>> 0,
          roomEntry11f0: (runtimeInputs.ambientRoomEntry11f0 ?? 0) | 0,
          game997aByte: (runtimeInputs.globalClearSkip997a ?? 0) >>> 0,
          roomByte11f4: (runtimeInputs.b9b11RoomByte11f4 ?? 0) >>> 0,
          roomByte1d0d: (runtimeInputs.b9b11RoomByte1d0d ?? 0) >>> 0,
          room1d18: (runtimeInputs.ambientRoom1d18 ?? 0) | 0,
          roomByte7321: (runtimeInputs.b9b11RoomByte7321 ?? 0) >>> 0,
          listBegin7314: (runtimeInputs.b9b11ListBegin7314 ?? 0) >>> 0,
          listEnd7318: (runtimeInputs.b9b11ListEnd7318 ?? 0) >>> 0,
        }
      : runtimeInputs != null
        ? { inputsReady: 0 }
        : {};

  /* Wave-2 (playerhud v17 + log v5 + PM3 SFX gates): enrich residual events
     with per-slot UpdateHearts pack detail and the PM3 warn-log edge so
     HostHandler bodies run the pure call plans (no Update ABI change). */
  let playerHudPacks = null;
  if (runtimeInputs != null && ((runtimeInputs.playerHudBlobReady ?? 0) >>> 0) !== 0) {
    const mask = (runtimeInputs.playerHudOccupiedMask ?? 1) >>> 0;
    const slots = normalizePlayerHudSlots(runtimeInputs);
    const packs = [];
    for (let slot = 0; slot < PLAYER_HUD_MAX_SLOTS; slot++) {
      if ((mask & (1 << slot)) === 0) continue;
      const pack = slots[slot];
      packs.push({
        slot,
        twin: playerHudUpdateHeartsUsesTwin(pack.twinPtr, pack.playerType, pack.field3bc),
        twinPtr: pack.twinPtr >>> 0,
        playerType: pack.playerType | 0,
        field3bc: pack.field3bc | 0,
        heartsSum: pack.heartsSum >>> 0,
        flag1519: pack.flag1519 >>> 0,
        trampSuppress: pack.trampSuppress,
        tailPred: pack.tailPred | 0,
        tailChars: pack.tailChars >>> 0,
      });
    }
    if (packs.length > 0) playerHudPacks = packs;
  }
  const pmSfxGate = (span, voices, enabled) =>
    runtimeInputs == null
      ? null
      : pmSfxEntryGate(PM_INTENSITY_SFX_ID, span, voices, enabled);
  const pmSfxDetail = (span, voices, enabled) => {
    const gate = pmSfxGate(span, voices, enabled);
    return { gate, warnLog: pmSfxWarnLogEdge(runtimeInputs, gate) };
  };

  emit("hudPostUpdate", events.hudPostUpdateCalls);
  emit("playerHudUpdateHearts", events.playerHudUpdateHearts,
    playerHudPacks ? { packs: playerHudPacks } : { packs: null });
  emit("playerHudGfxResidual", events.playerHudGfxResidual);
  emit("playerHudDirtyNotify", events.playerHudDirtyNotify);
  emit("hudHistoryResidual", events.hudHistoryResidual);
  emit("hudStatResidual", events.hudStatResidual);
  emit("opaqueCall0092e300", events.opaqueCall0092e300);
  emit("opaqueGlobal4aba0Refresh", events.opaqueGlobal4aba0Refresh);
  emit("opaqueCall009b6840", events.opaqueCall009b6840);
  emit("opaqueCall00857450", events.opaqueCall00857450);
  emit("opaqueCall0092f1c0", events.opaqueCall0092f1c0);
  emit("opaqueCall008318a0", events.opaqueCall008318a0);
  emit("opaqueCall0098dba0PlayerWalk", events.opaqueCall0098dba0PlayerWalk);
  emit("genericPromptUpdate", events.genericPromptUpdateCalls);
  emit("itemOverlayUpdate", events.itemOverlayUpdateCalls);
  emit("opaqueCall00746560", events.opaqueCall00746560);
  emit("opaqueCall009bea10", events.opaqueCall009bea10);
  emit("opaqueCall0040c7f0", events.opaqueCall0040c7f0);
  emit("opaqueCall009b7680", events.opaqueCall009b7680);
  emit("menuAuxListClear", events.menuAuxListClear);
  emit("opaqueCall008ef990", events.opaqueCall008ef990);
  emit("opaqueCall004212c0", events.opaqueCall004212c0);
  emit("opaqueCall006fdc10", events.opaqueCall006fdc10);
  /* ABI v99 (wave-28 bridge gap fix — C10 FAIL item 1): the 3 typed
     record-12 transition events reach result.events when the pack is
     LIVE (transition6fd7c0Ready @14324 + opaqueCall006fd7c0Ready both
     set); these rows deliver them as host kinds so the browser handler
     sees the arms fire (ready=0 keeps the pre-pack edge: the words stay
     0 and no kind is emitted). */
  emit("frameEffect6fd7c0StageTransition", events.frameEffect6fd7c0StageTransition);
  emit("frameEffect6fd7c0PlayerLoop", events.frameEffect6fd7c0PlayerLoop);
  emit("frameEffect6fd7c0RoomDispatch", events.frameEffect6fd7c0RoomDispatch);
  /* ABI v107 (update-v107-record12-live): when the record-12 pack was
     CAPTURED on the bridge (host-side reads ran — guestRead hook + the
     probe source reads), publish a row so the browser handler sees the
     probe capture landed. The runtime is NORMALIZED (every layout key is
     present, absent captures zeroed), so the discriminating signal is the
     pack voucher transition6fd7c0Ready (nonzero iff the capture ran);
     the detail carries the five lane values; capture off -> ready 0 ->
     count 0 -> no row. */
  const packCaptured =
    runtimeInputs != null && ((runtimeInputs.transition6fd7c0Ready ?? 0) >>> 0) !== 0 ? 1 : 0;
  emit("frameEffect6fd7c0ProbeHostReads", packCaptured, {
    transition6fd7c0: {
      altPath: (runtimeInputs?.transition6fd7c0AltPathProbe ?? 0) >>> 0,
      route: (runtimeInputs?.transition6fd7c0RouteProbe ?? 0) >>> 0,
      playerLoop: (runtimeInputs?.transition6fd7c0PlayerLoopProbe ?? 0) >>> 0,
      blueRoom: (runtimeInputs?.transition6fd7c0BlueRoomProbe ?? 0) >>> 0,
      enginePred: (runtimeInputs?.transition6fd7c0EnginePredProbe ?? 0) >>> 0,
    },
  });
  const transitionDetail = {
    roomTransitionIndex: events.roomTransitionIndex,
    roomTransitionDimension: events.roomTransitionDimension,
  };
  emit("opaqueCall006fd7c0Mode4Sfx", events.opaqueCall006fd7c0Mode4Sfx, transitionDetail);
  emit("opaqueFrameEffect6fd7c0Shell", events.opaqueFrameEffect6fd7c0Shell, transitionDetail);
  emit("opaqueRoomTransitionEnginePrefix", events.opaqueRoomTransitionEnginePrefix, transitionDetail);
  emit("opaqueRoomTransitionEngineBody", events.opaqueRoomTransitionEngineBody, transitionDetail);
  emit("opaqueRoomUpdatePrefixB1", events.opaqueRoomUpdatePrefixB1);
  emit("opaqueRoomUpdatePrefixB1Sfx", events.opaqueRoomUpdatePrefixB1Sfx);
  emit("opaqueRoomUpdatePrefixB1Spawn", events.opaqueRoomUpdatePrefixB1Spawn);
  emit("opaqueRoomUpdatePrefixB2", events.opaqueRoomUpdatePrefixB2);
  emit("opaqueRoomUpdatePrefixB3B7", events.opaqueRoomUpdatePrefixB3B7, b3b7Detail);
  emit("opaqueRoomUpdatePrefixB8", events.opaqueRoomUpdatePrefixB8);
  emit("opaqueRoomUpdatePrefixB9B11", events.opaqueRoomUpdatePrefixB9B11, b9b11Detail);
  emit("roomTriggerOutput", events.roomTriggerOutput);
  emit("opaqueRoomUpdateClearPath", events.opaqueRoomUpdateClearPath);
  emit("clearPathFlagStore", events.clearPathFlagStore);
  emit("opaqueRoomUpdateClearDoorSlots", events.opaqueRoomUpdateClearDoorSlots);
  emit("opaqueRoomUpdateClearDoorSlotsMask", events.opaqueRoomUpdateClearDoorSlotsMask);
  emit("roomTriggerClearStats", events.roomTriggerClearStats);
  emit("roomTriggerClearAudioNonGreed", events.roomTriggerClearAudioNonGreed);
  emit("roomTriggerClearAudio", events.roomTriggerClearAudio);
  emit("roomTriggerClearAwardsNonGreed", events.roomTriggerClearAwardsNonGreed);
  emit("roomTriggerClearAwardsBit7", events.roomTriggerClearAwardsBit7);
  emit("roomTriggerClearAwardsGreed", events.roomTriggerClearAwardsGreed);
  emit("roomTriggerClearAwardsTail", events.roomTriggerClearAwardsTail);
  emit("opaqueRoomUpdateClearDoors", events.opaqueRoomUpdateClearDoors);
  emit("type5DoorOpenCalls", events.type5DoorOpenCalls);
  emit("type5DoorForcedRerun", events.type5DoorForcedRerun);
  emit("opaqueRoomUpdateAmbient", events.opaqueRoomUpdateAmbient);
  emit("opaqueRoomUpdateAmbient824a70", events.opaqueRoomUpdateAmbient824a70, {
    loopCount: events.ambient824a70LoopCount,
  });
  emit("opaqueRoomUpdateAmbient824a70Genrand", events.opaqueRoomUpdateAmbient824a70Genrand, {
    loopCount: events.ambient824a70LoopCount,
  });
  emit("opaqueRoomUpdateAmbient824a70Create", events.opaqueRoomUpdateAmbient824a70Create, {
    loopCount: events.ambient824a70LoopCount,
  });
  emit("opaqueRoomUpdateTailRain", events.opaqueRoomUpdateTailRain);
  emit("opaqueRoomUpdateTailWaterB16", events.opaqueRoomUpdateTailWaterB16);
  emit("opaqueRoomUpdateTailMid", events.opaqueRoomUpdateTailMid);
  emit("opaqueRoomUpdateTailMid706cExpire", events.opaqueRoomUpdateTailMid706cExpire);
  emit("opaqueRoomUpdateTailMidRestock", events.opaqueRoomUpdateTailMidRestock);
  emit("opaqueRoomUpdateTailMid7230Spawn", events.opaqueRoomUpdateTailMid7230Spawn);
  emit("opaqueRoomUpdateTailEntity", events.opaqueRoomUpdateTailEntity);
  emit("opaqueRoomUpdateTailPath", events.opaqueRoomUpdateTailPath);
  emit("playerManagerUpdateDeath", events.playerManagerUpdateDeath);
  emit("playerManagerUpdateHeartbeat", events.playerManagerUpdateHeartbeat);
  emit("playerManagerUpdateHeartbeatSfxUpdate", events.playerManagerUpdateHeartbeatSfxUpdate,
    pmSfxDetail((runtimeInputs?.sfxStopSpan ?? 0) | 0,
      (runtimeInputs?.sfxStopVoices190 ?? 0) >>> 0,
      (runtimeInputs?.sfxStopEnabled198 ?? 0) >>> 0));
  emit("playerManagerUpdateHeartbeatSfxPlay", events.playerManagerUpdateHeartbeatSfxPlay,
    pmSfxDetail((runtimeInputs?.sfxStopSpan ?? 0) | 0,
      (runtimeInputs?.sfxStopVoices190 ?? 0) >>> 0,
      (runtimeInputs?.sfxStopEnabled198 ?? 0) >>> 0));
  emit("playerManagerUpdateHeartbeatSfxStop", events.playerManagerUpdateHeartbeatSfxStop,
    pmSfxDetail((runtimeInputs?.sfxStopSpan ?? 0) | 0,
      (runtimeInputs?.sfxStopVoices190 ?? 0) >>> 0,
      (runtimeInputs?.sfxStopEnabled198 ?? 0) >>> 0));
  emit("opaqueCall004257b0PassA", events.opaqueCall004257b0PassA, {
    idCount: (runtimeInputs?.frameOpaque4257b0IdCount ?? 0) >>> 0,
  });
  /* F4: attach the recaptured post-Pass-A count so the residual body gates on
     the PE-exact recount (0x00425894), not the superseded pre-count form. */
  emit("opaqueCall004257b0PassB", events.opaqueCall004257b0PassB, {
    postPassAListCount:
      (extras?.f4PostCount ??
        runtimeInputs?.frameOpaque4257b0PostPassAListCount ??
        runtimeInputs?.frameOpaque4257b0ListCount ?? 0) >>> 0,
  });
  emit("listUpdate6772c", events.listUpdate6772c);
  emit("opaqueCall008607a0", events.opaqueCall008607a0);
  emit("opaqueCall0098dba0Timer", events.opaqueCall0098dba0Timer);
  emit("hudMessageTextOut", events.hudMessageTextOut);

  if (events.transitionCompleted) {
    if (events.dispatchKind === 1) {
      emit("transitionQueueScreen", 1, {
        screenId: events.queuedScreenId,
        fadeArgb: events.fadeArgb,
        payloadCopyRequired: events.payloadCopyRequired,
      });
    } else if (events.dispatchKind === 5) {
      emit("transitionRestartFlow", 1, { mode: events.transitionMode });
    } else if (events.dispatchKind === 6) {
      emit("transitionNextVictoryLap", 1, { mode: events.transitionMode });
    } else if (events.dispatchKind === 2 || events.dispatchKind === 4) {
      emit("transitionOpaqueMode", 1, { mode: events.transitionMode });
    }
  }
}

/**
 * Run one Game::Update tick entirely on the native/Wasm path.
 * Host events are reported to `onHostEvent` but never routed through x86 PE emulation.
 */
/* Wasm-only tick driver — the SHIPPED fast path.
 *
 * The lockstep driver below steps the independent JS oracle next to the Wasm
 * module on every tick. That is the right default for tests and for
 * debugging (a divergence throws at the exact continuation), but it is pure
 * verification machinery: measured in the live browser loop it costs ~16-26
 * ms/tick while the Wasm step costs ~1 µs. Verification of the translation
 * belongs to `npm run decomp:verify-slice` (differential corpus), not to
 * every rAF frame.
 *
 * This driver replicates the lockstep driver's continuation chain EXACTLY —
 * same if/else-if structure, same one-path runtime recaptures, same
 * recapture seams (drainPatches/recaptureAfter run before each resume with
 * the CURRENT wasm-side state) — but reads `continuationKind` from the Wasm
 * events struct instead of the oracle, and never writes oracle state over
 * the module's. Equivalence with the lockstep driver is pinned by
 * tests/decomp-frame-path-fastpath.test.js.
 */
export function runNativeGameUpdateTickWasmOnly(slice, {
  state,
  constants,
  runtimeInputs,
  onHostEvent = null,
  recapture = null,
  recaptureRuntime = null,
} = {}) {
  if (!slice || slice.mode !== FRAME_PATH_MODE.NATIVE_WASM) {
    throw new Error("runNativeGameUpdateTickWasmOnly requires a native-wasm slice instance");
  }
  if (slice.usesX86Emulation) {
    throw new Error("native frame path must not enable x86 emulation");
  }

  const view = new DataView(slice.memory.buffer);
  const { paths } = slice;
  paths.reset();
  writeStruct(view, paths.stateAddress(), STATE_LAYOUT, state);
  writeStruct(view, paths.constantsAddress(), CONSTANTS_LAYOUT, constants);
  writeStruct(
    view,
    paths.runtimeInputsAddress(),
    RUNTIME_INPUTS_LAYOUT,
    normalizeRuntimeInputsForLayout(runtimeInputs),
  );

  const kindOff = paths.eventsAddress() + EVENTS_LAYOUT.continuationKind.offset;
  const readKind = () => view.getInt32(kindOff, true);
  const readEventU32 = (name) =>
    view.getUint32(paths.eventsAddress() + EVENTS_LAYOUT[name].offset, true);

  paths.step();

  let effectiveF4PostCount =
    (runtimeInputs.frameOpaque4257b0PostPassAListCount ??
      runtimeInputs.frameOpaque4257b0ListCount ?? 0) >>> 0;

  /* Same seam as the lockstep advance(): host patches (drainPatches /
     recaptureAfter) merge over the CURRENT state before the resume. The
     module already holds that state; we only write when a patch exists. */
  const advance = (kind, resumeWasm, patch = null) => {
    let merged = patch;
    if (typeof recapture === "function") {
      const current = readStruct(view, paths.stateAddress(), STATE_LAYOUT);
      const withPatch = patch ? { ...current, ...patch } : current;
      const recaptured = recapture(kind, withPatch, null);
      merged = { ...(patch || {}), ...(recaptured || {}) };
      if (Object.keys(merged).length === 0) merged = null;
      if (merged) merged = { ...withPatch, ...merged };
    }
    if (merged) writeStruct(view, paths.stateAddress(), STATE_LAYOUT, merged);
    if (resumeWasm() !== 1) throw new Error(`Wasm resume rejected for ${kind}`);
  };

  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    advance("98dba0PlayerWalk", paths.resume98dba0PlayerWalk);
  }
  {
    const k = readKind();
    if (k === UPDATE_CONTINUATION.RESUME_AFTER_GATE_1B83C_UPDATES) {
      advance("gate1b83c", paths.resumeGate1b83c);
    } else if (k === UPDATE_CONTINUATION.RESUME_AFTER_92F1C0) {
      advance("gate1ba78_92f1c0", paths.resume92f1c0);
    } else if (k === UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE) {
      advance("genericPrompt", paths.resumeGenericPrompt);
    } else if (k === UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE) {
      advance("itemOverlay", paths.resumeItemOverlay);
    }
  }
  if (readKind() === UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION) {
    if (paths.continueTimedTransition() !== 1) throw new Error("Timed-transition continuation rejected");
  }
  if (readKind() === UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION) {
    if (paths.continueMenuGates() !== 1) throw new Error("Menu-gate continuation rejected");
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN) {
    advance("menuOpen", paths.resumeMenuOpen);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE) {
    advance("menuUpdate", paths.resumeMenuUpdate);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    advance("98dba0PlayerWalk", paths.resume98dba0PlayerWalk);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES) {
    advance("frameAux", paths.resumeFrameAuxUpdates);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_STAGE_TRANSITION_EFFECT) {
    advance("stageTransition", paths.resumeStageTransitionEffect);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX) {
    const engineRuntime = {
      ...runtimeInputs,
      engineCallRoom: runtimeInputs.engineCallRoom ?? readEventU32("roomTransitionIndex") ?? 0,
      engineCallDim: runtimeInputs.engineCallDim ?? readEventU32("roomTransitionDimension") ?? 0,
      engineGame18304: runtimeInputs.engineGame18304 ?? 0,
    };
    writeStruct(view, paths.runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, normalizeRuntimeInputsForLayout(engineRuntime));
    advance("enginePrefix", paths.resumeEnginePrefix);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT) {
    advance("roomTransition", paths.resumeRoomTransitionEffect);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) {
    advance("roomUpdatePrefixB1", paths.resumeRoomUpdatePrefixB1);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2) {
    advance("roomUpdatePrefixB2", paths.resumeRoomUpdatePrefixB2);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX) {
    advance("roomUpdatePrefix", paths.resumeRoomUpdatePrefix);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED) {
    advance("roomClearNested", paths.resumeRoomClearNested);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR) {
    advance("roomUpdateClear", paths.resumeRoomUpdateClear);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD) {
    advance("roomUpdateHead", paths.resumeRoomUpdateHead);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    advance("frameManager", paths.resumeFrameManagerUpdates);
  }

  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A) {
    let f4PostCount = runtimeInputs.frameOpaque4257b0PostPassAListCount;
    if (f4PostCount == null && typeof recaptureRuntime === "function") {
      const runtimePatch = recaptureRuntime("4257b0PassA", null);
      if (runtimePatch && runtimePatch.frameOpaque4257b0PostPassAListCount != null) {
        f4PostCount = runtimePatch.frameOpaque4257b0PostPassAListCount;
      }
    }
    if (f4PostCount == null) f4PostCount = runtimeInputs.frameOpaque4257b0ListCount ?? 0;
    effectiveF4PostCount = f4PostCount >>> 0;
    const postPassA = {
      ...runtimeInputs,
      frameOpaque4257b0PostPassAListCount: effectiveF4PostCount,
    };
    writeStruct(view, paths.runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, normalizeRuntimeInputsForLayout(postPassA));
    advance("4257b0PassA", paths.resume4257b0PassA);
  }
  if (readKind() === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    advance("frameManager", paths.resumeFrameManagerUpdates);
  }

  const finalState = readStruct(view, paths.stateAddress(), STATE_LAYOUT);
  const finalEvents = readStruct(view, paths.eventsAddress(), EVENTS_LAYOUT);
  collectHostEvents(finalEvents, onHostEvent, runtimeInputs, {
    f4PostCount: effectiveF4PostCount,
  });

  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    usesX86Emulation: false,
    state: finalState,
    events: finalEvents,
    continuationKind: finalEvents.continuationKind,
  };
}

export function runNativeGameUpdateTick(slice, {
  state,
  constants,
  runtimeInputs,
  onHostEvent = null,
  recapture = null,
  recaptureRuntime = null,
  lockstep = true,
} = {}) {
  if (!slice || slice.mode !== FRAME_PATH_MODE.NATIVE_WASM) {
    throw new Error("runNativeGameUpdateTick requires a native-wasm slice instance");
  }
  if (slice.usesX86Emulation) {
    throw new Error("native frame path must not enable x86 emulation");
  }
  if (!lockstep) {
    return runNativeGameUpdateTickWasmOnly(slice, {
      state, constants, runtimeInputs, onHostEvent, recapture, recaptureRuntime,
    });
  }

  const view = new DataView(slice.memory.buffer);
  const { paths } = slice;
  paths.reset();
  writeStruct(view, paths.stateAddress(), STATE_LAYOUT, state);
  writeStruct(view, paths.constantsAddress(), CONSTANTS_LAYOUT, constants);
  writeStruct(
    view,
    paths.runtimeInputsAddress(),
    RUNTIME_INPUTS_LAYOUT,
    normalizeRuntimeInputsForLayout(runtimeInputs),
  );

  // Independent JS oracle drives expected control flow; Wasm is stepped in lockstep.
  let expected = stepGameUpdateSlice(state, constants, runtimeInputs);
  paths.step();

  /* F4 post-Pass-A count of record for this tick's host events. On the
     id_count == 0 path the PE reaches the recount with the list untouched
     (0x004257ee je 0x00425870), so the pre-captured count IS the post value —
     recapture happens only at the Pass A resume below (one-path recapture). */
  let effectiveF4PostCount =
    (runtimeInputs.frameOpaque4257b0PostPassAListCount ??
      runtimeInputs.frameOpaque4257b0ListCount ?? 0) >>> 0;

  const applyRecapture = (kind, currentState) => {
    if (typeof recapture !== "function") return currentState;
    return { ...currentState, ...recapture(kind, currentState, expected.events) };
  };

  const advance = (kind, resumeJs, resumeWasm, patch = null) => {
    const resumedState = applyRecapture(kind, patch ? { ...expected.state, ...patch } : expected.state);
    writeStruct(view, paths.stateAddress(), STATE_LAYOUT, resumedState);
    if (resumeWasm() !== 1) throw new Error(`Wasm resume rejected for ${kind}`);
    expected = resumeJs(resumedState, expected.events);
    if (!expected) throw new Error(`JS oracle rejected resume for ${kind}`);
  };

  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    advance(
      "98dba0PlayerWalk",
      (s, e) => resumeGameUpdate98dba0PlayerWalk(s, runtimeInputs, e),
      paths.resume98dba0PlayerWalk,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_GATE_1B83C_UPDATES) {
    advance("gate1b83c", (s, e) => resumeGameUpdateGate1b83c(s, e), paths.resumeGate1b83c);
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_92F1C0) {
    advance(
      "gate1ba78_92f1c0",
      (s, e) => resumeGameUpdate92f1c0(s, runtimeInputs, e),
      paths.resume92f1c0,
    );
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE) {
    advance("genericPrompt", (s, e) => resumeGameUpdateGenericPrompt(s, e), paths.resumeGenericPrompt);
  } else if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE) {
    advance("itemOverlay", (s, e) => resumeGameUpdateItemOverlay(s, runtimeInputs, e), paths.resumeItemOverlay);
  }

  if (expected.events.continuationKind === UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION) {
    if (paths.continueTimedTransition() !== 1) throw new Error("Timed-transition continuation rejected");
    expected = continueGameUpdateTimedTransition(expected.state, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION) {
    if (paths.continueMenuGates() !== 1) throw new Error("Menu-gate continuation rejected");
    expected = continueGameUpdateMenuGates(expected.state, runtimeInputs, expected.events);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN) {
    advance("menuOpen", (s, e) => resumeGameUpdateMenuOpen(s, runtimeInputs, e), paths.resumeMenuOpen);
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE) {
    advance("menuUpdate", (s, e) => resumeGameUpdateMenuUpdate(s, runtimeInputs, e), paths.resumeMenuUpdate);
  }
  /* Frame-aux path may land on 98dba0 multi-cont after menu update / menu open fallthrough. */
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK) {
    advance(
      "98dba0PlayerWalk",
      (s, e) => resumeGameUpdate98dba0PlayerWalk(s, runtimeInputs, e),
      paths.resume98dba0PlayerWalk,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES) {
    advance(
      "frameAux",
      (s, e) => resumeGameUpdateFrameAuxUpdates(s, constants, e, runtimeInputs),
      paths.resumeFrameAuxUpdates,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_STAGE_TRANSITION_EFFECT) {
    advance(
      "stageTransition",
      (s, e) => resumeGameUpdateStageTransitionEffect(s, e, runtimeInputs),
      paths.resumeStageTransitionEffect,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX) {
    const engineRuntime = {
      ...runtimeInputs,
      engineCallRoom: runtimeInputs.engineCallRoom ?? expected.events.roomTransitionIndex ?? 0,
      engineCallDim: runtimeInputs.engineCallDim ?? expected.events.roomTransitionDimension ?? 0,
      engineGame18304: runtimeInputs.engineGame18304 ?? 0,
    };
    writeStruct(view, paths.runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, normalizeRuntimeInputsForLayout(engineRuntime));
    advance(
      "enginePrefix",
      (s, e) => resumeGameUpdateEnginePrefix(s, engineRuntime, e),
      paths.resumeEnginePrefix,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT) {
    advance(
      "roomTransition",
      (s, e) => resumeGameUpdateRoomTransitionEffect(s, e, runtimeInputs),
      paths.resumeRoomTransitionEffect,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) {
    advance(
      "roomUpdatePrefixB1",
      (s, e) => resumeGameUpdateRoomUpdatePrefixB1(s, e),
      paths.resumeRoomUpdatePrefixB1,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2) {
    advance(
      "roomUpdatePrefixB2",
      (s, e) => resumeGameUpdateRoomUpdatePrefixB2(s, runtimeInputs, e),
      paths.resumeRoomUpdatePrefixB2,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX) {
    advance(
      "roomUpdatePrefix",
      (s, e) => resumeGameUpdateRoomUpdatePrefix(s, runtimeInputs, e),
      paths.resumeRoomUpdatePrefix,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED) {
    advance(
      "roomClearNested",
      (s, e) => resumeGameUpdateRoomClearNested(s, runtimeInputs, e),
      paths.resumeRoomClearNested,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR) {
    advance(
      "roomUpdateClear",
      (s, e) => resumeGameUpdateRoomUpdateClear(s, runtimeInputs, e),
      paths.resumeRoomUpdateClear,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD) {
    advance(
      "roomUpdateHead",
      (s, e) => resumeGameUpdateRoomUpdateHead(s, runtimeInputs, e),
      paths.resumeRoomUpdateHead,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    advance(
      "frameManager",
      (s, e) => resumeGameUpdateFrameManagerUpdates(s, constants, runtimeInputs, e),
      paths.resumeFrameManagerUpdates,
    );
  }

  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A) {
    /* F4 frozen capture contract (frame-opaque ABI v27): the PE re-derives
       the 0x68-stride count from the LIVE list pointers after Pass A ran
       (recount 0x00425870..0x00425892; gate 0x00425894). The post count comes
       from, in order:
         1. an explicit caller runtime input (a host that recaptured real
            guest memory, or a corpus row declaring Pass A's effect);
         2. the recaptureRuntime lane — the hybrid re-reads Game+0x1bbe0 /
            +0x1bbe4 from its buffer at this instant (both together);
         3. the caller's declared pre count — a modeled-list caller supplying
            neither is declaring "my Pass A inserted nothing".
       The hybrid path always provides lane 2, so lane 3 never gates the
       shipped browser tick. Before v67 lane 3 was the ONLY lane, which
       silently DROPPED a Pass B host event the original runs whenever Pass A
       inserted into an empty pre-tick list (wrong-state direction). */
    let f4PostCount = runtimeInputs.frameOpaque4257b0PostPassAListCount;
    if (f4PostCount == null && typeof recaptureRuntime === "function") {
      const runtimePatch = recaptureRuntime("4257b0PassA", expected.events);
      if (runtimePatch && runtimePatch.frameOpaque4257b0PostPassAListCount != null) {
        f4PostCount = runtimePatch.frameOpaque4257b0PostPassAListCount;
      }
    }
    if (f4PostCount == null) f4PostCount = runtimeInputs.frameOpaque4257b0ListCount ?? 0;
    effectiveF4PostCount = f4PostCount >>> 0;
    const postPassA = {
      ...runtimeInputs,
      frameOpaque4257b0PostPassAListCount: effectiveF4PostCount,
    };
    writeStruct(view, paths.runtimeInputsAddress(), RUNTIME_INPUTS_LAYOUT, normalizeRuntimeInputsForLayout(postPassA));
    advance(
      "4257b0PassA",
      (s, e) => resumeGameUpdate4257b0PassA(s, postPassA, e),
      paths.resume4257b0PassA,
    );
  }
  if (expected.events.continuationKind === UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    advance(
      "frameManager",
      (s, e) => resumeGameUpdateFrameManagerUpdates(s, constants, runtimeInputs, e),
      paths.resumeFrameManagerUpdates,
    );
  }

  const finalState = readStruct(view, paths.stateAddress(), STATE_LAYOUT);
  const finalEvents = readStruct(view, paths.eventsAddress(), EVENTS_LAYOUT);
  collectHostEvents(finalEvents, onHostEvent, runtimeInputs, {
    f4PostCount: effectiveF4PostCount,
  });

  return {
    mode: FRAME_PATH_MODE.NATIVE_WASM,
    usesX86Emulation: false,
    state: finalState,
    events: finalEvents,
    continuationKind: finalEvents.continuationKind,
  };
}

