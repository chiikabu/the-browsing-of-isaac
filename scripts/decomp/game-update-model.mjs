/** Independent JS oracle for Game::Update slice (restored from
 *  native/decomp/game_update_slice.cpp step/resume + header layouts).
 *  Frozen HUD/SFX/FO/PM/room/RTE/PlayerHUD/ANM2 helpers are consumed BY REFERENCE.
 *  ABI number matches tests/header/cpp (88). Full resume oracles restored.
 */
import {
  hudGate92f1c0TryPure,
  hudGate92f1c0Plan,
  hud8318a0RatioF32Bits,
  tryHudPostUpdatePure,
  statHudCountdownTick,
} from "./hud-post-update-pure-model.mjs";
import {
  frameOpaqueList6772cSweep,
  frameOpaque4257b0PassANeedsHost,
  frameOpaque4257b0PassBNeedsHost,
  frameOpaque4257b0NeedsHost,
  frameOpaque4257b0ListCountFromBounds,
  frameOpaque4257b0PassACountEvolution,
  frameOpaque4257b0PassBNeedsHostRecaptured,
  frameOpaque4257b0PassAPairsFromSamples,
  frameOpaque4257b0PassBApply,
  frameOpaque9b9480PlayerCounted,
  tryFrameOpaque4212c0Pure,
  frameOpaque409030PairNeedsHost,
  frameOpaque409030NeedsHost,
  frameOpaque409030ResidualPlan,
  frameOpaque409030ApplyNoLoopClear,
  frameOpaque40add0BitResult,
  frameOpaque40add0ProbeFromEqualFlags,
  frameOpaque4212c0Secondary3AfterProbeFalse,
  frameOpaque98dba0Bvar2CounterStep,
  frameOpaque98dba0ClampFloats,
  frameOpaque98dba0ModeFloatStep,
  frameOpaque98dba0MpRangeEmpty,
  frameOpaque98dba0VectorCount,
  menuGateUpdateNeedsHost,
} from "./frame-opaque-pure-model.mjs";
import {
  frameEffect6fd7c0ApplyTerminals,
  frameEffect6fd7c0Mode4SfxEarly,
  frameEffect6fd7c0ForceDimRoomNeg2,
  frameEffect6fd7c0BlueRoomEligible,
  frameEffect6fd7c0Needs705ee0NullPlayer,
  frameEffect6fd7c0Mode4SfxSeed,
  frameEffect6fd7c0SpecialSfxSeed,
  frameEffect6fd7c0SfxRareHit,
  frameEffect6fd7c0SfxPlayId,
  frameEffect6fd7c0SfxPlayArgs,
  frameEffect6fd7c0SfxManagerReceiver,
  /* ABI v102 (record idx 12): transition-pack lane-free laws consume the
     family arm-selection gates BY REFERENCE (never re-derived). */
  frameEffect6fd7c0ArgsValid,
  frameEffect6fd7c0ValidateFailKind,
  frameEffect6fd7c0FatalStringVa,
  frameEffect6fd7c0FatalLevel,
  frameEffect6fd7c0ApplyBlueRoomIndex,
} from "./frame-effect-pure-model.mjs";
import {
  playerHudEntryClearHeartByte1,
  playerHudUpdateHeartsUsesTwin,
  playerHudCriticalHeartBlink,
  playerHudActiveSlotCountdownTick,
  playerHudTailFloatStep,
  playerHudTailCharCountdown,
  playerHudStatBarTween,
} from "./playerhud-post-update-pure-model.mjs";
import {
  roomGenrandNext,
  roomAmbient824a70GenrandMtSamples,
  doorSlots710dd0AnyNeedsHost,
  doorSlots710dd0AnyType5NeedsHost,
  stepDoorHelper710dd0EarlyOut,
  roomB1WireDecide,
  roomB1FlagOr80000,
  roomB1OnceFlagClear,
  roomB1SpawnCountResolved,
  roomB1CornerIndices,
  roomB1CornerPick,
  roomB1CornerWorldXy,
  roomB15RainLoopStep,
  roomB15RainSpawnArgs,
  roomB3B7WireDecide,
  roomB3TempEffectsGate,
  roomB3TempEffectsListEmpty,
  roomB3TempEffectsEntryMatch,
  roomB3TempEffectsListContinue,
  roomB4PickupVariantFromRem,
  roomB4SecondBandKind,
  roomB4OptionGate,
  roomB4ThirdSpawnGate,
  roomB4CleanupNeeded,
  roomB4RewardSeedChain,
  roomB5EntityTypeCandidate,
  roomB5EntityFlagClear,
  roomB5EntityTypeExcluded,
  roomB5Pass2CountGate,
  roomB5EntityRngStep,
  roomB5EntityRngAppendGate,
  roomB5ListAtCapacity,
  roomB5ListEndAfterStore,
  roomB5Pass2AppendBudget,
  roomB6DestroyTreeGate,
  roomB6GridIndexValid,
  roomB7CellCount,
  roomB7CellLoopEnter,
  roomB7CellNeedsVcall,
  roomB8PathCostGridStep,
  roomB8NeedsPathCostHost,
  roomB9B11WireDecide,
  stepRoomEntryClear7220 as roomEntryClear7220,
  stepRoomCountdownDecIfNonnegative as roomCountdownDecIfNonnegative,
  stepRoomCountdownDecIfPositive as roomCountdownDecIfPositive,
  stepRoomCountdownDecExpireNeg1 as roomCountdownDecExpireNeg1,
  stepRoomBossCountSnapshot as roomBossCountSnapshot,
  stepRoomClearDelay as roomClearDelayStep,
  stepRoomTriggerClearEntry as roomTriggerClearEntry,
  roomTriggerClearIsGreedMode,
  roomTriggerClearNeedsNonGreedHost,
  roomTriggerClearNeedsAwardsBit7Walk,
  /* ABI v131 (record idx 30): room-pure ABI v81 greed-probe band, consumed
     BY REFERENCE (never re-derived). */
  roomGreedProbe9bf990,
  roomGreedProbe9bfa00,
  roomGreedProbe9bfa70,
  roomGreedFire9bfae0Plan,
  /* ABI v133 (records idx26/27): room-pure ABI v81/v82 spawn-tail plans,
     consumed BY REFERENCE (never re-derived). */
  roomTriggerClearAudio7f7a40TailRot,
  roomTriggerClearAudio7f7a40TailBase,
  roomTriggerClearAudio7f7a40TailItemPlan,
  roomTriggerClearAudio83B0TailItemPlan,
  /* ABI v139 (records idx13/idx35): frozen spawn-relay arg-relayout law
     (0x00428b20 pure forwarder -> 0x6fe410), consumed BY REFERENCE for
     the shared-half create contract's arg-pack identity. */
  roomSpawn428b20Relayout,
  /* ABI v138 (record idx27): frozen ALT-tail plan (v84), consumed BY
     REFERENCE. */
  roomTriggerClearAudio83B0TailAltItemPlan,
  /* ABI v136 (record idx26): room-pure ABI v67a head gates/fail laws,
     consumed BY REFERENCE (never re-derived). */
  roomTriggerClearAudio7f7a40Gates,
  roomTriggerClearAudio7f7a40Fail,
  /* ABI v134 (records idx28/29): room-pure ABI v83 award-spawner head
     plan, consumed BY REFERENCE (never re-derived). */
  /* ABI v137 (record idx27): frozen 83b0 head decision laws, consumed
     BY REFERENCE (never re-derived). */
  roomTca83b0Skip,
  roomTca83b0Music,
  roomTca83b0DoorWalkMusicCount,
  roomAwardSpawn7fb250HeadPlan,
/* ABI v140 (record idx29): room-pure ABI v85 SPAWN-LOOP continuation
   laws, consumed BY REFERENCE (never re-derived). */
  roomAwardSpawn7fb250IterPlan,
  roomAwardSpawn7fb250B1LuckGate,
/* ABI v141 (record idx29): room-pure ABI v86 0xb-block probe laws,
   consumed BY REFERENCE (never re-derived). */
  roomIdx29At9b92c0,
  roomCount7cb6e0Plan,
  roomRoll7c3980Core,
  roomRoll7c3980FollowupGate,
  roomIdx29RollPlan,
  stepRoomAmbient824800Float as roomAmbient824800FloatStep,
  roomAmbientGreedStageRemap,
  roomAmbient824a70BodyBounds,
  roomAmbient824a70GenrandMtPlan,
  roomAmbient824a70NeedsHost,
  roomAmbient24ee0NeedsHost,
  roomAmbient74e9b0PureFalse,
  roomAmbient7f01c0NeedsHost,
  roomAmbient8024f0FlagsEarlyOut,
  roomAmbient824800NeedsSpawnHost,
  roomAmbientModeSfxNeedsHost,
  roomAmbientSpecial1023NeedsHost,
  roomAmbientStageSpawnMayRng,
  roomB16NeedsGridHost,
  roomB16Needs823540,
  roomB16NeedsType7Grid,
  roomB16NeedsLavaBandGrid,
  roomB18NeedsEntityWalkHost,
  roomB18ListEmpty,
  roomB18ListContinue,
  roomB18EntityIsType5,
  roomB18EntityType1ModeGate,
  roomB18EntityTypeInRange,
  roomB18EntityPathBCandidate,
  roomB18EntityAction,
  roomB18PathBNeedsHost,
  roomB19NeedsPathRebuildHost,
  roomB20ListCount,
  roomB20Pass1TypeMatch,
  roomB20FlagOr4000,
  roomB20Pass2Action,
  roomB20FlaggedMultispawnEnter,
  roomB20ChainContinue,
  roomB20SpawnFlagOr80,
  roomB20PairXLeft,
  roomB20PairXRight,
  roomB20PairYUp,
  roomB20PairYDown,
  room706cNeedsExpireHost,
  room7230NeedsSpawnHost,
  roomMidRestockWireDecide,
  stepRoomCameraFxLerp as roomCameraFxLerpStep,
  stepRoomWaterLavaFloat as roomWaterLavaFloatStep,
  ROOM_B1_RESIDUAL_NONE,
  ROOM_B1_RESIDUAL_SFX,
  ROOM_B1_RESIDUAL_SPAWN,
  ROOM_B1_RESIDUAL_SFX_SPAWN,
  ROOM_B1_RESIDUAL_MONOLITHIC,
  ROOM_B19_RESIDUAL_NONE,
  ROOM_B19_RESIDUAL_HOST_REBUILD,
  ROOM_B19_RESIDUAL_MONOLITHIC,
  ROOM_B20_RESIDUAL_NONE,
  ROOM_B20_RESIDUAL_HOST_TRAIL,
  ROOM_B20_RESIDUAL_MONOLITHIC,
  ROOM_B20_ACTION_FLAGGED,
  ROOM_B20_ACTION_PAIR_X,
  ROOM_B20_ACTION_PAIR_Y,
  ROOM_B20_ACTION_DEFAULT,
  ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE,
  ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL,
  ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC,
} from "./room-pure-model.mjs";
import {
  roomTransitionEngine82ee40ApplySetup,
  roomTransitionEngine82ee40ApplyStartState,
  roomTransitionEngine82ee40EarlySkipSetup,
  roomTransitionEngine82ee40EffectiveDim,
  roomTransitionEngine82eb90Predicate,
  roomTransitionEngine82ee40PlayerEntryFloatReset,
  roomTransitionEngine82ee40RewriteSlot,
  roomTransitionEnginePlayerLoopNeedsHost,
  roomTransitionEngine956780Gate,
} from "./room-transition-engine-pure-model.mjs";
import {
  pmDeathWireDecide,
  pmDeathPlayerEligible,
  PM_DEATH_RESIDUAL_WALK,
  pmIntensityWireDecide,
  pmSfxMutatorPureComplete,
  pmSfxEntryGate,
  PM_INTENSITY_SFX_ID,
  PM_SFX_GATE_DISABLED,
  PM_SFX_GATE_LIVE,
  PM_SFX_GATE_MISS,
  PM_SFX_GATE_NO_SAMPLES,
  PM_INTENSITY_SFX_RESIDUAL_NONE,
  PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC,
  PM_INTENSITY_SFX_RESIDUAL_UPDATE,
  PM_INTENSITY_SFX_RESIDUAL_PLAY,
  PM_INTENSITY_SFX_RESIDUAL_STOP,
} from "./player-manager-update-pure-model.mjs";
import {
  sfxStopAllPlan,
  sfxStopAllGroupAction,
  sfxStopAllVoiceDecide,
  sfxStopPlan,
  sfxVoiceLoopContinue,
  sfxPlayGate,
  sfxPlayNoSamplesHost,
  sfxPlayPreloadHost,
  sfxPlayBodyHost,
  sfxEntryCount,
  sfxPlayWindowOpen,
  sfxRngNext,
  sfxVoiceSelect,
  sfxVoicePickOffset,
  sfxVoiceVolumeClamped,
  SFX_PLAY_GATE_MISS,
  SFX_ENTRY_STRIDE,
  SFX_GATE_NO_SAMPLES,
  SFX_STOP_ALL_GROUP_DISABLED,
  SFX_STOP_ALL_GROUP_EMPTY,
  SFX_STOP_ALL_GROUP_WALK,
} from "./sfx-pure-model.mjs";

export const ABI_VERSION = 101;
/* ABI v97 (wave-26 merge, PLAN update-v102-abi97-plan): the walker
   freeze-lift — 4 runtime lanes @14276..14292 + 3 walker probe events
   @956..968; record-4 store-plan APPLICATION arm (3 exports); record-12
   transition-pack lane-free laws (7 exports). */
/* ABI v98 (wave-27 merge, PLAN update-v104-abi98-plan): the record-12
   transition-pack FREEZE-LIFT — 9 runtime lanes @14292..14328 + 3 typed
   events @968..980; the 6 capture-dependent laws (stage_transition_reach /
   anim0xc_route / player_loop_reach / room_dispatch_reach /
   engine_room_arg / terminal_265c0_clear); k-block live behind the
   two-voucher ready gate. */
/* ABI v99 (wave-28 merge): the entity-surface capture REBIND (idx 5/32) —
   the v95 provisional rows @8040..8396 / @640 collided with the committed
   b3b7 lanes and are rebound to the tail: ready @14328 + 8x44 B capture
   blobs @14332..14684 (runtime 14328 -> 14684) + the accept-pure proof
   event @980 (events 980 -> 984); the RTTI-block bl-fold law
   (isaac_game_update_slice_entity_surface_rtti_fold) + the walk_step
   accept-AL byte-gate correction are S3-landed; record-16 B8 capture-feed
   contract frozen (abiV98); record-0 tail close-out (abiV103). */
/* ABI v95 (record idx 10 R4 equal-flags capture): the 40add0 walk capture
   cap (stride 0x18 entries of the animation-name list at [data+0x8c]/+0x90).
   A host that sees more live entries than this must NOT set
   equalFlagsReady (the module falls back to the v91 matchIndex path). */
export const FRAME_OPAQUE_40ADD0_MAX_ENTRIES = 64;
/* ABI v102 (wave update-v102-record0-wire, PLAN update-v102-abi97-plan):
   the walker capture lanes + walker probe events are committed at the
   PLAN offsets (runtime 14276..14292, events 956..968); the wave-26
   merge owns the ABI 96->97 bump + the JSON rows. */
export const ABI_SIZES = Object.freeze({
  state: 524,
  constants: 32,
  /* ABI v96 coordinator-merged tail: 13736 -> 14276 = record-4 SFX-manager
     store-plan capture + per-player entry pack (13736..14152) + record-10
     true-probe manager blob (14152..14200) + record-9 TAIL-A slot pair +
     optional seed (14200..14212) + record-22 ANM2::Load pre-lane host half
     (14212..14276; loadgraphics_flags = 32 inline bytes). The record-12
     LIVE seam stays @11592..13736 (mid-wave landing). ABI v102 (walker
     live wiring): +4 walker lanes @14276..14292. ABI v104 (record-12
     transition-pack wiring): +9 pack lanes @14292..14328. ABI v99
     (wave-28 entity-surface REBIND, idx 5/32): +ready @14328 + 8x44 B
     capture blobs @14332..14684 (the v95 provisional rows @8040..8396
     were removed — collided with the committed b3b7 lanes). ABI v127
     (update-v127-706c-restock-removal): +shop-restock pack
     @14684..15484 (8 scalars + 6 per-item u32 lanes, cap 32). ABI v128
     scalars @15484..15504. */
  /* ABI v131 (update-v131-greed-probe-pack): +232 (greed probe pack
     15504..15736: voucher + count + 8 elems x 7 u32). */
  runtimeInputs: 23700, // v136 audio head pack 17696..17852; v137 83b0 head/ALT-walk/tail-RNG pack 17856..18012; v139 b1-rain outcome rows @18392..21999; v140 award SPAWN-LOOP pack @22000..22571 (15 shared lanes + 16 x stride-32 rows); v141 0xb-block probe pack @22572..23695 (17 shared lanes + tail-create trio + 8 elem values + 8 x stride-128 rows)
  /* ABI v96 coordinator-merged tail: 932 -> 956 = opaque_008318a0_
     sfx_manager_stores @932 + frame_opaque_4212c0_true_probe_interior
     @936 + hud_stat_walk_fatal_empty @940 (C11 plan) + the record-22
     engine_anm2_prefix trio @944/948/952 (W22-S2 §lane-requests).
     ABI v102 (walker live wiring): +3 typed walker probe events
     @956..968. ABI v104 (record-12 transition-pack wiring): +3 typed
     pack events @968..980. ABI v99 (wave-28 entity-surface REBIND):
     +1 accept-pure proof event @980..984 (the v95 provisional @640 was
     removed — collided with the committed tcsStats region). ABI v107
     (wave-29 mid-restock typed drop): +1 mid_restock_seed_zero_drop
    @984..988. ABI v115 (update-v115-clearpath-removal): +1
    clear_path_flag_store @988..992 (the idx-23 coarse retirement). ABI
    v119 (update-v119-door-removal): +1 type5DoorForcedRerun @992..996
    (the idx-33 forced-arm carrier; idx-24/33 coarse retirement). ABI
    v126 (update-v126-7230-spawn-removal): +1 tailMid7230SpawnArmed
    @996..1000 (the idx-40 coarse retirement carrier). ABI v127
    (update-v127-706c-restock-removal): +5 shop-restock residual events
    @1000..1020. ABI v128 (update-v128-heartbeat-sfxupd-removal): +9
    update-lane residual events @1020..1056. */
  /* ABI v131: +20 (greed probe/fire carriers @1056..1072). */
  events: 1260, // v135 deep-music fire carrier @1140; v137: +4 ALT-path tail-spawns carrier @1144; v139 b1-rain echoes @1148..1168; v140 SPAWN_LOOP carriers @1172..1200; v141 0xb-block carriers @1204..1240; v142 rt_band_pop composite carrier @1244..1256
});

/* ABI v95: record idx 48 0x008607a0 set-arm lua_pcallk call-ARG laws
   (typed-event arg-prep). PE sites: 0x860803/0x872996/0x8729e4 registry
   index; 0x8729c8/0x8729c6 nargs/nresults; 0x8729c0/c2/c4 pcallk context
   (errfunc/ctx/k all 0); 0x8607d1/0x8607d8 the two pushed call args
   (holder+4/+8 -> pushinteger 1 / -1). The pcallk itself stays typed-host
   (registry[fn_key] is mod bytecode; fn_key = P[4], P=[engine+0x10]). */
export const OPAQUE_008607A0_SET_REGISTRY_INDEX = 0xfff0b9d8; /* LUA_REGISTRYINDEX (-1001000) */
export const OPAQUE_008607A0_SET_NARGS = 2;
export const OPAQUE_008607A0_SET_NRESULTS = 1;
export const OPAQUE_008607A0_SET_PCALLK_CONTEXT = 0; /* errfunc/ctx/k all zero */
export const OPAQUE_008607A0_SET_ARG1 = 1;
export const OPAQUE_008607A0_SET_ARG2 = 0xffffffff; /* -1 as lua_Integer */

export const ROOM_B8_MAX_CELLS = 448;
export const ENGINE_PLAYER_MAX = 8;
export const UPDATE_LIST_MAX_NODES = 32;
export const GLOBAL_TREE_4ABA0_MAX_NODES = 32;
export const OPAQUE_0092E300_MAX_GROUPS = 8;
export const OPAQUE_0092E300_GROUP_STRIDE = 440;
export const OPAQUE_0092E300_MAX_VOICES = 32;
export const MENU_AUX_TREE_MAX_NODES = 32;
export const MENU_AUX_TREE_NODE_SIZE = 0x2c;
export const MENU_AUX_SENTINEL_OUT_WORDS = 5;
export const GENRAND_STATE_WORDS = 624;
export const GENRAND_MAX_SAMPLES = 448;
export const HUD_STAT_COUNTDOWN_COUNT = 20;
export const HUD_STAT_WALK_PLAYER_MAX = 8;
export const HUD_STAT_WALK_PACK_SIZE = 64;
export const HUD_STAT_WALK_SLOT_COUNT = 2;
export const HUD_STAT_WALK_K_COUNT = 10;
export const HUD_STAT_WALK_SLOTS = 20;
export const HUD_STAT_WALK_MASK = 0xfffffeff;
export const FRAME_OPAQUE_4257B0_MAX_PLAYERS = 8;
export const FRAME_OPAQUE_4257B0_MAX_ELEMS = 16;
export const FRAME_OPAQUE_4257B0_MAX_LIST = 16;
export const PLAYER_HUD_MAX_SLOTS = 8;
export const PLAYER_HUD_SLOT_PACK_SIZE = 52;
export const GAME_OBJECT_MIN_SIZE = 0x68d70;
export const SHELL_SITE_DIRECTION = -1;
export const SHELL_REWIND_ARG = -1;
/* ABI v96 (record idx 12 opaqueCall006fd7c0): FUN_00705ee0 write-block
   decision constants (PE census in section-notes update-v96-record12-705ee0).
   Slot records at Game+0x269ec (slot0) / Game+0x4704c (slot1), stride
   0x20660; slot1 ENDS at Game+0x676ac == the slot-index field. The payload
   copy is 0x20b dwords from *[0xc7169c]+0x2d0 into newslot+0x1fe34. The
   nine-site store mask (S1..S9 = bits 0..8): base 0x1f6 in the write block;
   S1 (0x1) on the room/tag mismatch path; S4 (0x8) on the match path. */
export const REWIND_705EE0_SLOT0_OFF = 0x269ec;
export const REWIND_705EE0_SLOT_STRIDE = 0x20660;
export const REWIND_705EE0_PAYLOAD_WORDS = 0x20b;
export const REWIND_705EE0_PAYLOAD_SRC_OFF = 0x2d0;
export const REWIND_705EE0_STORE_MASK_BASE = 0x1f6;
export const REWIND_705EE0_STORE_MASK_S1 = 0x1;
export const REWIND_705EE0_STORE_MASK_S4 = 0x8;
export const REWIND_705EE0_SAVESTATE_VA = 0x006f9000;
/* ABI v96 (record idx 46): SFXManager::Play continuation RNG stream
   (0x00c5d2a0) defaults from .rdata 0x00b1f6c0 — (5, 27, 8). */
export const SFX_PLAY_RNG_SHIFT1 = 5;
export const SFX_PLAY_RNG_SHIFT2 = 27;
export const SFX_PLAY_RNG_SHIFT3 = 8;
export const BLUE_ROOM_74D4A0_CALL_COOKIE = 0;
export const BLUE_ROOM_74D4A0_CALL_HOST = 1;
export const BLUE_ROOM_74D4A0_STORE_OWN_FRAME = "own-frame";
export const BLUE_ROOM_74D4A0_STORE_TEB_SEH = "teb-seh";
export const REWIND_705EE0_STORE_OWN_FRAME = 1;
export const REWIND_705EE0_STORE_GAME = 2;
export const REWIND_705EE0_CALL_HOST = 3;
export const FRAME_EFFECT_SHELL_HOST_705EE0 = 1;
export const FRAME_EFFECT_SHELL_HOST_BLUE_ROOM = 2;

export const UPDATE_CONTINUATION = Object.freeze({
  RETURN_AFTER_GAME_UPDATE: 0,
  RETURN_AFTER_GATE_1D520: 1,
  RETURN_AFTER_GATE_1D654: 2,
  RETURN_AFTER_STATE_24ECC_UPDATE: 3,
  RETURN_AFTER_GENERIC_PROMPT_TRANSITION: 4,
  RETURN_AFTER_ITEM_OVERLAY_MENU: 5,
  RETURN_AFTER_HUD_DELAY: 6,
  RETURN_AFTER_GATE_1BA78: 7,
  RETURN_AFTER_GATE_1B83C: 8,
  RETURN_AFTER_MENU_GATE_EXIT: 9,
  RETURN_AFTER_TIMED_TRANSITION_HUD: 10,
  CONTINUE_NEXT_GATE: 11,
  CONTINUE_AT_TIMED_TRANSITION: 12,
  CONTINUE_AFTER_TIMED_TRANSITION: 13,
  CONTINUE_AT_COMMON_TAIL: 14,
  RESUME_AFTER_GENERIC_PROMPT_UPDATE: 15,
  RESUME_AFTER_ITEM_OVERLAY_UPDATE: 16,
  RESUME_AFTER_MENU_OPEN: 17,
  RESUME_AFTER_MENU_UPDATE: 18,
  RESUME_AFTER_GATE_1B83C_UPDATES: 19,
  RESUME_AFTER_92F1C0: 20,
  RESUME_AFTER_98DBA0_PLAYER_WALK: 21,
  RESUME_AFTER_FRAME_AUX_UPDATES: 22,
  RESUME_AFTER_STAGE_TRANSITION_EFFECT: 23,
  RESUME_AFTER_ENGINE_PREFIX: 24,
  RESUME_AFTER_ROOM_TRANSITION_EFFECT: 25,
  RESUME_AFTER_ROOM_UPDATE_PREFIX_B1: 26,
  RESUME_AFTER_ROOM_UPDATE_PREFIX_B2: 27,
  RESUME_AFTER_ROOM_UPDATE_PREFIX: 28,
  RESUME_AFTER_ROOM_CLEAR_NESTED: 29,
  RESUME_AFTER_ROOM_UPDATE_CLEAR: 30,
  RESUME_AFTER_ROOM_UPDATE_HEAD: 31,
  RESUME_AFTER_4257B0_PASS_A: 32,
  RESUME_AFTER_FRAME_MANAGER_UPDATES: 33,
});

export const TRANSITION_DISPATCH = Object.freeze({
  NONE: 0,
  QUEUE_SCREEN: 1,
  RESTART_FLOW: 2,
  NEXT_VICTORY_LAP: 3,
  OPAQUE_MODE: 4,
  NO_OP: 5,
  UNKNOWN: 6,
});

export const FRAME_OPAQUE_98DBA0_SITE = Object.freeze({ GATE: 0, FRAME_AUX: 1 });
export const HOST_FUN_746560_SITE = Object.freeze({ NONE: 0, TIMED_CLEANUP: 1, WALK_COUNTER: 2 });
export const ENGINE_PREFIX_ANM2_LOAD_OBSERVABLE_STORES = 6;
export const ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS = 32;
export const ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS = 32;
export const ISAAC_GAME_UPDATE_ANM2_NAME_BYTES = 8;

/** Prefix FUN_0082ee40 entry .. 0x0082ef74 join, PE-ordered. */
export const ENGINE_PREFIX_TRACE = Object.freeze([
  Object.freeze({ va: 0x0082ee50, kind: "ownFrameStore" }),
  Object.freeze({ va: 0x0082ee6f, kind: "ownFrameStore" }),
  Object.freeze({ va: 0x0082ee78, kind: "balancedStore" }),
  Object.freeze({ va: 0x0082ee96, kind: "platformCall", target: 0x00a112c0 }),
  Object.freeze({ va: 0x0082ee9e, kind: "byteGateSkipTo", target: 0x0082ef74 }),
  Object.freeze({ va: 0x0082eeab, kind: "scratchStore" }),
  Object.freeze({ va: 0x0082eeb8, kind: "scratchStore" }),
  Object.freeze({ va: 0x0082eec0, kind: "platformCall", target: 0x0040cf00 }),
  Object.freeze({ va: 0x0082eed0, kind: "scratchStore" }),
  Object.freeze({ va: 0x0082eee0, kind: "scratchStore" }),
  Object.freeze({ va: 0x0082eef0, kind: "platformCall", target: 0x00b18894 }),
  Object.freeze({ va: 0x0082ef1d, kind: "gameLogicCall", target: 0x0040bd50 }),
  Object.freeze({ va: 0x0082ef40, kind: "scratchStore" }),
  Object.freeze({ va: 0x0082ef57, kind: "platformCall", target: 0x00aef15c }),
]);

export const STATE_LAYOUT = Object.freeze({
  shortTimer: Object.freeze({ offset: 0, type: "i32" }),
  positionResetTimer: Object.freeze({ offset: 4, type: "i32" }),
  positionXBits: Object.freeze({ offset: 8, type: "u32" }),
  positionYBits: Object.freeze({ offset: 12, type: "u32" }),
  secondaryTimer: Object.freeze({ offset: 16, type: "i32" }),
  decayValue: Object.freeze({ offset: 20, type: "f32" }),
  transitionProgress: Object.freeze({ offset: 24, type: "f32" }),
  transitionRate: Object.freeze({ offset: 28, type: "f32" }),
  transitionMode: Object.freeze({ offset: 32, type: "i32" }),
  postUpdateDelay: Object.freeze({ offset: 36, type: "i32" }),
  gate1d520: Object.freeze({ offset: 40, type: "i32" }),
  oneShot1d63c: Object.freeze({ offset: 44, type: "i32" }),
  state24ecc: Object.freeze({ offset: 48, type: "i32" }),
  value24ed0: Object.freeze({ offset: 52, type: "i32" }),
  mode24ed8: Object.freeze({ offset: 56, type: "i32" }),
  gate1d654: Object.freeze({ offset: 60, type: "i32" }),
  gate1ba78: Object.freeze({ offset: 64, type: "i32" }),
  gate1b83c: Object.freeze({ offset: 68, type: "i32" }),
  predicate1ba74: Object.freeze({ offset: 72, type: "i32" }),
  counter265c0: Object.freeze({ offset: 76, type: "i32" }),
  itemOverlayState: Object.freeze({ offset: 80, type: "i32" }),
  menuState23a74: Object.freeze({ offset: 84, type: "i32" }),
  genericPromptActiveObject: Object.freeze({ offset: 88, type: "i32" }),
  genericPromptActiveFlag: Object.freeze({ offset: 92, type: "i32" }),
  genericPromptSubmittedSelection: Object.freeze({ offset: 96, type: "i32" }),
  genericPromptPostUpdateFlag: Object.freeze({ offset: 100, type: "i32" }),
  skipTimedTransitionFlag: Object.freeze({ offset: 104, type: "i32" }),
  transitionColorRBits: Object.freeze({ offset: 108, type: "u32" }),
  transitionColorGBits: Object.freeze({ offset: 112, type: "u32" }),
  transitionColorBBits: Object.freeze({ offset: 116, type: "u32" }),
  transitionAuxBits: Object.freeze({ offset: 120, type: "u32" }),
  timedTransitionProgress: Object.freeze({ offset: 124, type: "f32" }),
  timedTransitionForceFinish: Object.freeze({ offset: 128, type: "i32" }),
  status22ed4: Object.freeze({ offset: 132, type: "i32" }),
  status22edc: Object.freeze({ offset: 136, type: "i32" }),
  timedTransitionCleanupMode: Object.freeze({ offset: 140, type: "i32" }),
  effectCounter67788: Object.freeze({ offset: 144, type: "i32" }),
  effectCounter68d6c: Object.freeze({ offset: 148, type: "i32" }),
  roomTransitionMode1830c: Object.freeze({ offset: 152, type: "i32" }),
  roomTransitionMarker18318: Object.freeze({ offset: 156, type: "i32" }),
  roomTransitionIndex18900: Object.freeze({ offset: 160, type: "i32" }),
  roomTransitionDimension18904: Object.freeze({ offset: 164, type: "i32" }),
  frameCounter264fc: Object.freeze({ offset: 168, type: "i32" }),
  frameCounter264f8: Object.freeze({ offset: 172, type: "i32" }),
  fadeCounter26514: Object.freeze({ offset: 176, type: "i32" }),
  fadeProgress26518: Object.freeze({ offset: 180, type: "f32" }),
  shakeCurrent67738: Object.freeze({ offset: 184, type: "f32" }),
  shakeTarget6773c: Object.freeze({ offset: 188, type: "f32" }),
  shakeStep67740: Object.freeze({ offset: 192, type: "f32" }),
  timer269e0: Object.freeze({ offset: 196, type: "i32" }),
  listCount67730: Object.freeze({ offset: 200, type: "i32" }),
  roomFxCounter70d8: Object.freeze({ offset: 204, type: "i32" }),
  roomFxValue70cc: Object.freeze({ offset: 208, type: "i32" }),
  roomFxStep70d4: Object.freeze({ offset: 212, type: "i32" }),
  roomFxLimit70dc: Object.freeze({ offset: 216, type: "i32" }),
  roomFxValue70e8: Object.freeze({ offset: 220, type: "i32" }),
  roomFxCounter70f4: Object.freeze({ offset: 224, type: "i32" }),
  roomFxLimit70f8: Object.freeze({ offset: 228, type: "i32" }),
  roomFxStep70f0: Object.freeze({ offset: 232, type: "i32" }),
  roomClearDelay11ec: Object.freeze({ offset: 236, type: "i32" }),
  roomAlive12c0: Object.freeze({ offset: 240, type: "i32" }),
  roomAlive12c4: Object.freeze({ offset: 244, type: "i32" }),
  roomGreedWave723c: Object.freeze({ offset: 248, type: "i32" }),
  roomType8: Object.freeze({ offset: 252, type: "i32" }),
  roomDescSubtype: Object.freeze({ offset: 256, type: "i32" }),
  roomByte7220: Object.freeze({ offset: 260, type: "i32" }),
  roomWaterLerpCountdown7298: Object.freeze({ offset: 264, type: "i32" }),
  roomBossCount12c8: Object.freeze({ offset: 268, type: "i32" }),
  roomBossCount12cc: Object.freeze({ offset: 272, type: "i32" }),
  roomBossSnapshot7224: Object.freeze({ offset: 276, type: "i32" }),
  roomTimer722c: Object.freeze({ offset: 280, type: "i32" }),
  roomCollectibleTimer7764: Object.freeze({ offset: 284, type: "i32" }),
  roomTimer7214: Object.freeze({ offset: 288, type: "i32" }),
  roomTimer706c: Object.freeze({ offset: 292, type: "i32" }),
  roomTimer7230: Object.freeze({ offset: 296, type: "i32" }),
  roomWaterAmount7240: Object.freeze({ offset: 300, type: "f32" }),
  roomLavaIntensity7740: Object.freeze({ offset: 304, type: "f32" }),
  frameOpaque4212c0Mode: Object.freeze({ offset: 308, type: "i32" }),
  frameOpaque4212c0Secondary: Object.freeze({ offset: 312, type: "i32" }),
  frameOpaque4212c0Field3c: Object.freeze({ offset: 316, type: "i32" }),
  frameOpaque4212c0Flag4c: Object.freeze({ offset: 320, type: "u32" }),
  frameOpaque4212c0Flag111: Object.freeze({ offset: 324, type: "u32" }),
  roomDescFlags44: Object.freeze({ offset: 328, type: "i32" }),
  roomDescClearCount4a: Object.freeze({ offset: 332, type: "i32" }),
  byte67744: Object.freeze({ offset: 336, type: "u32" }),
  roomFlag7894: Object.freeze({ offset: 340, type: "i32" }),
  roomFlag7769: Object.freeze({ offset: 344, type: "i32" }),
  engineField8: Object.freeze({ offset: 348, type: "i32" }),
  engineFieldC: Object.freeze({ offset: 352, type: "i32" }),
  engineFloat22c: Object.freeze({ offset: 356, type: "f32" }),
  engineFloat230: Object.freeze({ offset: 360, type: "f32" }),
  engineField4: Object.freeze({ offset: 364, type: "i32" }),
  engineField10: Object.freeze({ offset: 368, type: "i32" }),
  engineField14: Object.freeze({ offset: 372, type: "i32" }),
  engineField18: Object.freeze({ offset: 376, type: "i32" }),
  engineField1c: Object.freeze({ offset: 380, type: "i32" }),
  engineField20: Object.freeze({ offset: 384, type: "i32" }),
  engineField24: Object.freeze({ offset: 388, type: "i32" }),
  frameOpaque98dba0Mode: Object.freeze({ offset: 392, type: "i32" }),
  frameOpaque98dba0Flag: Object.freeze({ offset: 396, type: "u32" }),
  frameOpaque98dba0Counter: Object.freeze({ offset: 400, type: "i32" }),
  frameOpaque98dba0Float170: Object.freeze({ offset: 404, type: "f32" }),
  frameOpaque98dba0Float2d0: Object.freeze({ offset: 408, type: "f32" }),
  difficulty269c8: Object.freeze({ offset: 412, type: "i32" }),
  enginePlayer1bb74: Object.freeze({ offset: 416, type: "i32" }),
  roomAmbientCount7454: Object.freeze({ offset: 420, type: "i32" }),
  roomAmbientIntensity7458: Object.freeze({ offset: 424, type: "f32" }),
  roomAmbientFlag745c: Object.freeze({ offset: 428, type: "i32" }),
  mode26584: Object.freeze({ offset: 432, type: "i32" }),
  flags2654c: Object.freeze({ offset: 436, type: "u32" }),
  gameFlags1839c: Object.freeze({ offset: 440, type: "u32" }),
  roomDescShortAe: Object.freeze({ offset: 444, type: "i32" }),
  hudMessageFlag8: Object.freeze({ offset: 448, type: "u32" }),
  hudMessagePlayed64: Object.freeze({ offset: 452, type: "u32" }),
  rankDisplaySwitchAfter: Object.freeze({ offset: 456, type: "i32" }),
  rankDisplayStateAfter: Object.freeze({ offset: 460, type: "i32" }),
  rankDisplayClear3b0Out: Object.freeze({ offset: 464, type: "u32" }),
  rankDisplayTailOut: Object.freeze({ offset: 468, type: "u32" }),
  itemOverlayCounter11d1d0: Object.freeze({ offset: 472, type: "i32" }),
  transitionTailByte29fb8: Object.freeze({ offset: 476, type: "u32" }),
  fxLerpGate676b4: Object.freeze({ offset: 480, type: "u32" }),
  fxCur676b8: Object.freeze({ offset: 484, type: "f32" }),
  fxCur676bc: Object.freeze({ offset: 488, type: "f32" }),
  fxCur676c0: Object.freeze({ offset: 492, type: "f32" }),
  fxCur676c4: Object.freeze({ offset: 496, type: "f32" }),
  fxCur676c8: Object.freeze({ offset: 500, type: "f32" }),
  fxCur676cc: Object.freeze({ offset: 504, type: "f32" }),
  engineAnm2Loaded: Object.freeze({ offset: 508, type: "u32" }),
  engineAnm2Slot10c: Object.freeze({ offset: 512, type: "u32" }),
  engineAnm2Bitflags110: Object.freeze({ offset: 516, type: "u32" }),
  globalTree4aba0Result: Object.freeze({ offset: 520, type: "u8" }),
  hudHistoryLatch5c7c: Object.freeze({ offset: 521, type: "u8" }),
});
export const CONSTANTS_LAYOUT = Object.freeze({
  decayFactor: Object.freeze({ offset: 0, type: "f32" }),
  decayThreshold: Object.freeze({ offset: 4, type: "f32" }),
  fadeComplete: Object.freeze({ offset: 8, type: "f32" }),
  fadeInStep: Object.freeze({ offset: 12, type: "f32" }),
  fadeOutStep: Object.freeze({ offset: 16, type: "f32" }),
  resetPositionXBits: Object.freeze({ offset: 20, type: "u32" }),
  resetPositionYBits: Object.freeze({ offset: 24, type: "u32" }),
  transitionComplete: Object.freeze({ offset: 28, type: "f32" }),
});
export const RUNTIME_INPUTS_LAYOUT = Object.freeze({
    monotonicCounterLow: Object.freeze({ offset: 0, type: "u32" }),
    monotonicCounterHigh: Object.freeze({ offset: 4, type: "u32" }),
    monotonicBaselineLow: Object.freeze({ offset: 8, type: "u32" }),
    monotonicBaselineHigh: Object.freeze({ offset: 12, type: "u32" }),
    globalClearSkip997a: Object.freeze({ offset: 16, type: "u32" }),
    globalMenuEnable2a3a5: Object.freeze({ offset: 20, type: "u32" }),
    globalMenuGuard4b3ca: Object.freeze({ offset: 24, type: "u32" }),
    globalRangeByteLength: Object.freeze({ offset: 28, type: "u32" }),
    challenge0x123: Object.freeze({ offset: 32, type: "u32" }),
    frameOpaque4212c0SlotChar: Object.freeze({ offset: 36, type: "u32" }),
    doorSlot0Present: Object.freeze({ offset: 40, type: "u32" }),
    doorSlot0Field3a0: Object.freeze({ offset: 44, type: "u32" }),
    doorSlot0Field8: Object.freeze({ offset: 48, type: "u32" }),
    doorSlot0FieldC: Object.freeze({ offset: 52, type: "u32" }),
    doorSlot1Present: Object.freeze({ offset: 56, type: "u32" }),
    doorSlot1Field3a0: Object.freeze({ offset: 60, type: "u32" }),
    doorSlot1Field8: Object.freeze({ offset: 64, type: "u32" }),
    doorSlot1FieldC: Object.freeze({ offset: 68, type: "u32" }),
    doorSlot2Present: Object.freeze({ offset: 72, type: "u32" }),
    doorSlot2Field3a0: Object.freeze({ offset: 76, type: "u32" }),
    doorSlot2Field8: Object.freeze({ offset: 80, type: "u32" }),
    doorSlot2FieldC: Object.freeze({ offset: 84, type: "u32" }),
    doorSlot3Present: Object.freeze({ offset: 88, type: "u32" }),
    doorSlot3Field3a0: Object.freeze({ offset: 92, type: "u32" }),
    doorSlot3Field8: Object.freeze({ offset: 96, type: "u32" }),
    doorSlot3FieldC: Object.freeze({ offset: 100, type: "u32" }),
    doorSlot4Present: Object.freeze({ offset: 104, type: "u32" }),
    doorSlot4Field3a0: Object.freeze({ offset: 108, type: "u32" }),
    doorSlot4Field8: Object.freeze({ offset: 112, type: "u32" }),
    doorSlot4FieldC: Object.freeze({ offset: 116, type: "u32" }),
    doorSlot5Present: Object.freeze({ offset: 120, type: "u32" }),
    doorSlot5Field3a0: Object.freeze({ offset: 124, type: "u32" }),
    doorSlot5Field8: Object.freeze({ offset: 128, type: "u32" }),
    doorSlot5FieldC: Object.freeze({ offset: 132, type: "u32" }),
    doorSlot6Present: Object.freeze({ offset: 136, type: "u32" }),
    doorSlot6Field3a0: Object.freeze({ offset: 140, type: "u32" }),
    doorSlot6Field8: Object.freeze({ offset: 144, type: "u32" }),
    doorSlot6FieldC: Object.freeze({ offset: 148, type: "u32" }),
    doorSlot7Present: Object.freeze({ offset: 152, type: "u32" }),
    doorSlot7Field3a0: Object.freeze({ offset: 156, type: "u32" }),
    doorSlot7Field8: Object.freeze({ offset: 160, type: "u32" }),
    doorSlot7FieldC: Object.freeze({ offset: 164, type: "u32" }),
    engineCallRoom: Object.freeze({ offset: 168, type: "u32" }),
    engineCallDim: Object.freeze({ offset: 172, type: "u32" }),
    engineGame18304: Object.freeze({ offset: 176, type: "u32" }),
    frameOpaque98dba0Bvar2: Object.freeze({ offset: 180, type: "u32" }),
    frameOpaque98dba0Manager2a35c: Object.freeze({ offset: 184, type: "f32" }),
    frameOpaque98dba0Game216e9: Object.freeze({ offset: 188, type: "u32" }),
    frameOpaque4257b0IdCount: Object.freeze({ offset: 192, type: "u32" }),
    frameOpaque4257b0ListCount: Object.freeze({ offset: 196, type: "u32" }),
    roomGridCells: Object.freeze({ offset: 200, type: "u32" }),
    roomB8BlobReady: Object.freeze({ offset: 204, type: "u32" }),
    enginePlayerCount: Object.freeze({ offset: 208, type: "u32" }),
    enginePlayerBlobReady: Object.freeze({ offset: 212, type: "u32" }),
    playerHudOccupiedMask: Object.freeze({ offset: 216, type: "u32" }),
    managerHistoryCount: Object.freeze({ offset: 220, type: "u32" }),
    managerStatFlag: Object.freeze({ offset: 224, type: "u32" }),
    ambientDescPresent: Object.freeze({ offset: 228, type: "u32" }),
    ambientDescId: Object.freeze({ offset: 232, type: "u32" }),
    ambientPlayerCount: Object.freeze({ offset: 236, type: "u32" }),
    ambientVelX7460: Object.freeze({ offset: 240, type: "u32" }),
    ambientVelY7464: Object.freeze({ offset: 244, type: "u32" }),
    ambientStage: Object.freeze({ offset: 248, type: "u32" }),
    ambientStageType: Object.freeze({ offset: 252, type: "u32" }),
    ambientStageId: Object.freeze({ offset: 256, type: "u32" }),
    ambientRoomSubtype1bb0: Object.freeze({ offset: 260, type: "u32" }),
    ambientRoomActive: Object.freeze({ offset: 264, type: "u32" }),
    ambientRoomEntry11f0: Object.freeze({ offset: 268, type: "u32" }),
    playerHudBlobReady: Object.freeze({ offset: 272, type: "u32" }),
    playerHudSlot0TwinPtr: Object.freeze({ offset: 276, type: "u32" }),
    playerHudSlot0PlayerType: Object.freeze({ offset: 280, type: "i32" }),
    playerHudSlot0Field3bc: Object.freeze({ offset: 284, type: "i32" }),
    playerHudSlot0HeartsSum: Object.freeze({ offset: 288, type: "i32" }),
    playerHudSlot0Flag1519: Object.freeze({ offset: 292, type: "u32" }),
    playerHudSlot0TrampSuppress: Object.freeze({ offset: 296, type: "i32" }),
    playerHudSlot0Active0: Object.freeze({ offset: 300, type: "i32" }),
    playerHudSlot0Active1: Object.freeze({ offset: 304, type: "i32" }),
    playerHudSlot0Active2: Object.freeze({ offset: 308, type: "i32" }),
    playerHudSlot0Active3: Object.freeze({ offset: 312, type: "i32" }),
    playerHudSlot0Float6b8: Object.freeze({ offset: 316, type: "f32" }),
    playerHudSlot0TailChars: Object.freeze({ offset: 324, type: "u32" }),
    playerHudSlot0TailPred: Object.freeze({ offset: 320, type: "i32" }),
    playerHudSlot1TwinPtr: Object.freeze({ offset: 328, type: "u32" }),
    playerHudSlot1PlayerType: Object.freeze({ offset: 332, type: "i32" }),
    playerHudSlot1Field3bc: Object.freeze({ offset: 336, type: "i32" }),
    playerHudSlot1HeartsSum: Object.freeze({ offset: 340, type: "i32" }),
    playerHudSlot1Flag1519: Object.freeze({ offset: 344, type: "u32" }),
    playerHudSlot1TrampSuppress: Object.freeze({ offset: 348, type: "i32" }),
    playerHudSlot1Active0: Object.freeze({ offset: 352, type: "i32" }),
    playerHudSlot1Active1: Object.freeze({ offset: 356, type: "i32" }),
    playerHudSlot1Active2: Object.freeze({ offset: 360, type: "i32" }),
    playerHudSlot1Active3: Object.freeze({ offset: 364, type: "i32" }),
    playerHudSlot1Float6b8: Object.freeze({ offset: 368, type: "f32" }),
    playerHudSlot1TailChars: Object.freeze({ offset: 376, type: "u32" }),
    playerHudSlot1TailPred: Object.freeze({ offset: 372, type: "i32" }),
    playerHudSlot2TwinPtr: Object.freeze({ offset: 380, type: "u32" }),
    playerHudSlot2PlayerType: Object.freeze({ offset: 384, type: "i32" }),
    playerHudSlot2Field3bc: Object.freeze({ offset: 388, type: "i32" }),
    playerHudSlot2HeartsSum: Object.freeze({ offset: 392, type: "i32" }),
    playerHudSlot2Flag1519: Object.freeze({ offset: 396, type: "u32" }),
    playerHudSlot2TrampSuppress: Object.freeze({ offset: 400, type: "i32" }),
    playerHudSlot2Active0: Object.freeze({ offset: 404, type: "i32" }),
    playerHudSlot2Active1: Object.freeze({ offset: 408, type: "i32" }),
    playerHudSlot2Active2: Object.freeze({ offset: 412, type: "i32" }),
    playerHudSlot2Active3: Object.freeze({ offset: 416, type: "i32" }),
    playerHudSlot2Float6b8: Object.freeze({ offset: 420, type: "f32" }),
    playerHudSlot2TailChars: Object.freeze({ offset: 428, type: "u32" }),
    playerHudSlot2TailPred: Object.freeze({ offset: 424, type: "i32" }),
    playerHudSlot3TwinPtr: Object.freeze({ offset: 432, type: "u32" }),
    playerHudSlot3PlayerType: Object.freeze({ offset: 436, type: "i32" }),
    playerHudSlot3Field3bc: Object.freeze({ offset: 440, type: "i32" }),
    playerHudSlot3HeartsSum: Object.freeze({ offset: 444, type: "i32" }),
    playerHudSlot3Flag1519: Object.freeze({ offset: 448, type: "u32" }),
    playerHudSlot3TrampSuppress: Object.freeze({ offset: 452, type: "i32" }),
    playerHudSlot3Active0: Object.freeze({ offset: 456, type: "i32" }),
    playerHudSlot3Active1: Object.freeze({ offset: 460, type: "i32" }),
    playerHudSlot3Active2: Object.freeze({ offset: 464, type: "i32" }),
    playerHudSlot3Active3: Object.freeze({ offset: 468, type: "i32" }),
    playerHudSlot3Float6b8: Object.freeze({ offset: 472, type: "f32" }),
    playerHudSlot3TailChars: Object.freeze({ offset: 480, type: "u32" }),
    playerHudSlot3TailPred: Object.freeze({ offset: 476, type: "i32" }),
    playerHudSlot4TwinPtr: Object.freeze({ offset: 484, type: "u32" }),
    playerHudSlot4PlayerType: Object.freeze({ offset: 488, type: "i32" }),
    playerHudSlot4Field3bc: Object.freeze({ offset: 492, type: "i32" }),
    playerHudSlot4HeartsSum: Object.freeze({ offset: 496, type: "i32" }),
    playerHudSlot4Flag1519: Object.freeze({ offset: 500, type: "u32" }),
    playerHudSlot4TrampSuppress: Object.freeze({ offset: 504, type: "i32" }),
    playerHudSlot4Active0: Object.freeze({ offset: 508, type: "i32" }),
    playerHudSlot4Active1: Object.freeze({ offset: 512, type: "i32" }),
    playerHudSlot4Active2: Object.freeze({ offset: 516, type: "i32" }),
    playerHudSlot4Active3: Object.freeze({ offset: 520, type: "i32" }),
    playerHudSlot4Float6b8: Object.freeze({ offset: 524, type: "f32" }),
    playerHudSlot4TailChars: Object.freeze({ offset: 532, type: "u32" }),
    playerHudSlot4TailPred: Object.freeze({ offset: 528, type: "i32" }),
    playerHudSlot5TwinPtr: Object.freeze({ offset: 536, type: "u32" }),
    playerHudSlot5PlayerType: Object.freeze({ offset: 540, type: "i32" }),
    playerHudSlot5Field3bc: Object.freeze({ offset: 544, type: "i32" }),
    playerHudSlot5HeartsSum: Object.freeze({ offset: 548, type: "i32" }),
    playerHudSlot5Flag1519: Object.freeze({ offset: 552, type: "u32" }),
    playerHudSlot5TrampSuppress: Object.freeze({ offset: 556, type: "i32" }),
    playerHudSlot5Active0: Object.freeze({ offset: 560, type: "i32" }),
    playerHudSlot5Active1: Object.freeze({ offset: 564, type: "i32" }),
    playerHudSlot5Active2: Object.freeze({ offset: 568, type: "i32" }),
    playerHudSlot5Active3: Object.freeze({ offset: 572, type: "i32" }),
    playerHudSlot5Float6b8: Object.freeze({ offset: 576, type: "f32" }),
    playerHudSlot5TailChars: Object.freeze({ offset: 584, type: "u32" }),
    playerHudSlot5TailPred: Object.freeze({ offset: 580, type: "i32" }),
    playerHudSlot6TwinPtr: Object.freeze({ offset: 588, type: "u32" }),
    playerHudSlot6PlayerType: Object.freeze({ offset: 592, type: "i32" }),
    playerHudSlot6Field3bc: Object.freeze({ offset: 596, type: "i32" }),
    playerHudSlot6HeartsSum: Object.freeze({ offset: 600, type: "i32" }),
    playerHudSlot6Flag1519: Object.freeze({ offset: 604, type: "u32" }),
    playerHudSlot6TrampSuppress: Object.freeze({ offset: 608, type: "i32" }),
    playerHudSlot6Active0: Object.freeze({ offset: 612, type: "i32" }),
    playerHudSlot6Active1: Object.freeze({ offset: 616, type: "i32" }),
    playerHudSlot6Active2: Object.freeze({ offset: 620, type: "i32" }),
    playerHudSlot6Active3: Object.freeze({ offset: 624, type: "i32" }),
    playerHudSlot6Float6b8: Object.freeze({ offset: 628, type: "f32" }),
    playerHudSlot6TailChars: Object.freeze({ offset: 636, type: "u32" }),
    playerHudSlot6TailPred: Object.freeze({ offset: 632, type: "i32" }),
    playerHudSlot7TwinPtr: Object.freeze({ offset: 640, type: "u32" }),
    playerHudSlot7PlayerType: Object.freeze({ offset: 644, type: "i32" }),
    playerHudSlot7Field3bc: Object.freeze({ offset: 648, type: "i32" }),
    playerHudSlot7HeartsSum: Object.freeze({ offset: 652, type: "i32" }),
    playerHudSlot7Flag1519: Object.freeze({ offset: 656, type: "u32" }),
    playerHudSlot7TrampSuppress: Object.freeze({ offset: 660, type: "i32" }),
    playerHudSlot7Active0: Object.freeze({ offset: 664, type: "i32" }),
    playerHudSlot7Active1: Object.freeze({ offset: 668, type: "i32" }),
    playerHudSlot7Active2: Object.freeze({ offset: 672, type: "i32" }),
    playerHudSlot7Active3: Object.freeze({ offset: 676, type: "i32" }),
    playerHudSlot7Float6b8: Object.freeze({ offset: 680, type: "f32" }),
    playerHudSlot7TailChars: Object.freeze({ offset: 688, type: "u32" }),
    playerHudSlot7TailPred: Object.freeze({ offset: 684, type: "i32" }),
    midRestockOwner0x209: Object.freeze({ offset: 692, type: "u32" }),
    pmIntensityPlayerCount: Object.freeze({ offset: 696, type: "u32" }),
    pmIntensitySfxPlaying: Object.freeze({ offset: 700, type: "f32" }),
    pmIntensityBlobReady: Object.freeze({ offset: 704, type: "u32" }),
    b1SfxReady: Object.freeze({ offset: 804, type: "u32" }),
    b1BufferReady: Object.freeze({ offset: 808, type: "u32" }),
    b1DescField40: Object.freeze({ offset: 812, type: "u32" }),
    b1NestedField10: Object.freeze({ offset: 816, type: "u32" }),
    b1Begin183a4: Object.freeze({ offset: 820, type: "u32" }),
    b1End183a8: Object.freeze({ offset: 824, type: "u32" }),
    midRestockDescReady: Object.freeze({ offset: 828, type: "u32" }),
    midRestockDescAc: Object.freeze({ offset: 832, type: "u32" }),
    midRestockDescAe: Object.freeze({ offset: 836, type: "u32" }),
    midRestockDescSeed58: Object.freeze({ offset: 840, type: "u32" }),
    h5BodyBlobReady: Object.freeze({ offset: 844, type: "u32" }),
    ambientRoomF14: Object.freeze({ offset: 848, type: "f32" }),
    ambientRoomF18: Object.freeze({ offset: 852, type: "f32" }),
    ambientRoomF1c: Object.freeze({ offset: 856, type: "f32" }),
    ambientRoomF20: Object.freeze({ offset: 860, type: "f32" }),
    ambientRoom1d18: Object.freeze({ offset: 864, type: "u32" }),
    b3b7SparseReady: Object.freeze({ offset: 868, type: "u32" }),
    b3b7TeByte7321: Object.freeze({ offset: 872, type: "u32" }),
    b3b7TeBegin: Object.freeze({ offset: 876, type: "u32" }),
    b3b7TeEnd: Object.freeze({ offset: 880, type: "u32" }),
    b3b7DescType0: Object.freeze({ offset: 884, type: "u32" }),
    b3b7TreeCount7238: Object.freeze({ offset: 888, type: "u32" }),
    b3b7WidthC: Object.freeze({ offset: 892, type: "u32" }),
    b3b7Height10: Object.freeze({ offset: 896, type: "u32" }),
    b9b11InputsReady: Object.freeze({ offset: 900, type: "u32" }),
    b9b11ChallengeResultNonzero: Object.freeze({ offset: 904, type: "u32" }),
    b9b11RoomByte11f4: Object.freeze({ offset: 908, type: "u32" }),
    b9b11RoomByte1d0d: Object.freeze({ offset: 912, type: "u32" }),
    b9b11RoomByte7321: Object.freeze({ offset: 916, type: "u32" }),
    b9b11ListBegin7314: Object.freeze({ offset: 920, type: "u32" }),
    b9b11ListEnd7318: Object.freeze({ offset: 924, type: "u32" }),
    updateListBlobReady: Object.freeze({ offset: 928, type: "u32" }),
    updateListTimer0: Object.freeze({ offset: 932, type: "i32" }),
    updateListTimer1: Object.freeze({ offset: 936, type: "i32" }),
    updateListTimer2: Object.freeze({ offset: 940, type: "i32" }),
    updateListTimer3: Object.freeze({ offset: 944, type: "i32" }),
    updateListTimer4: Object.freeze({ offset: 948, type: "i32" }),
    updateListTimer5: Object.freeze({ offset: 952, type: "i32" }),
    updateListTimer6: Object.freeze({ offset: 956, type: "i32" }),
    updateListTimer7: Object.freeze({ offset: 960, type: "i32" }),
    updateListTimer8: Object.freeze({ offset: 964, type: "i32" }),
    updateListTimer9: Object.freeze({ offset: 968, type: "i32" }),
    updateListTimer10: Object.freeze({ offset: 972, type: "i32" }),
    updateListTimer11: Object.freeze({ offset: 976, type: "i32" }),
    updateListTimer12: Object.freeze({ offset: 980, type: "i32" }),
    updateListTimer13: Object.freeze({ offset: 984, type: "i32" }),
    updateListTimer14: Object.freeze({ offset: 988, type: "i32" }),
    updateListTimer15: Object.freeze({ offset: 992, type: "i32" }),
    updateListTimer16: Object.freeze({ offset: 996, type: "i32" }),
    updateListTimer17: Object.freeze({ offset: 1000, type: "i32" }),
    updateListTimer18: Object.freeze({ offset: 1004, type: "i32" }),
    updateListTimer19: Object.freeze({ offset: 1008, type: "i32" }),
    updateListTimer20: Object.freeze({ offset: 1012, type: "i32" }),
    updateListTimer21: Object.freeze({ offset: 1016, type: "i32" }),
    updateListTimer22: Object.freeze({ offset: 1020, type: "i32" }),
    updateListTimer23: Object.freeze({ offset: 1024, type: "i32" }),
    updateListTimer24: Object.freeze({ offset: 1028, type: "i32" }),
    updateListTimer25: Object.freeze({ offset: 1032, type: "i32" }),
    updateListTimer26: Object.freeze({ offset: 1036, type: "i32" }),
    updateListTimer27: Object.freeze({ offset: 1040, type: "i32" }),
    updateListTimer28: Object.freeze({ offset: 1044, type: "i32" }),
    updateListTimer29: Object.freeze({ offset: 1048, type: "i32" }),
    updateListTimer30: Object.freeze({ offset: 1052, type: "i32" }),
    updateListTimer31: Object.freeze({ offset: 1056, type: "i32" }),
    playerFlag410Ready: Object.freeze({ offset: 1060, type: "u32" }),
    playerFlag410Count: Object.freeze({ offset: 1064, type: "u32" }),
    opaque0092e300Ready: Object.freeze({ offset: 1068, type: "u32" }),
    opaque0092e300GroupCount: Object.freeze({ offset: 1072, type: "u32" }),
    opaque0092e300PacksReady: Object.freeze({ offset: 1076, type: "u32" }),
    opaque0092e300GroupEnabled0: Object.freeze({ offset: 1080, type: "u32" }),
    opaque0092e300GroupEntryCount0: Object.freeze({ offset: 1112, type: "u32" }),
    opaque0092e300GroupEnabled1: Object.freeze({ offset: 1084, type: "u32" }),
    opaque0092e300GroupEntryCount1: Object.freeze({ offset: 1116, type: "u32" }),
    opaque0092e300GroupEnabled2: Object.freeze({ offset: 1088, type: "u32" }),
    opaque0092e300GroupEntryCount2: Object.freeze({ offset: 1120, type: "u32" }),
    opaque0092e300GroupEnabled3: Object.freeze({ offset: 1092, type: "u32" }),
    opaque0092e300GroupEntryCount3: Object.freeze({ offset: 1124, type: "u32" }),
    opaque0092e300GroupEnabled4: Object.freeze({ offset: 1096, type: "u32" }),
    opaque0092e300GroupEntryCount4: Object.freeze({ offset: 1128, type: "u32" }),
    opaque0092e300GroupEnabled5: Object.freeze({ offset: 1100, type: "u32" }),
    opaque0092e300GroupEntryCount5: Object.freeze({ offset: 1132, type: "u32" }),
    opaque0092e300GroupEnabled6: Object.freeze({ offset: 1104, type: "u32" }),
    opaque0092e300GroupEntryCount6: Object.freeze({ offset: 1136, type: "u32" }),
    opaque0092e300GroupEnabled7: Object.freeze({ offset: 1108, type: "u32" }),
    opaque0092e300GroupEntryCount7: Object.freeze({ offset: 1140, type: "u32" }),
    opaque857450Ready: Object.freeze({ offset: 1144, type: "u32" }),
    opaque857450Manager4abbc: Object.freeze({ offset: 1148, type: "u32" }),
    menuAuxTreeReady: Object.freeze({ offset: 1152, type: "u32" }),
    menuAuxTreeRoot: Object.freeze({ offset: 1156, type: "u32" }),
    menuAuxTreeNodeCount: Object.freeze({ offset: 1160, type: "u32" }),
    menuAuxAccountingLo: Object.freeze({ offset: 1164, type: "u32" }),
    menuAuxAccountingHi: Object.freeze({ offset: 1168, type: "u32" }),
    genrandMtReady: Object.freeze({ offset: 1940, type: "u32" }),
    genrandIndexIn: Object.freeze({ offset: 1944, type: "u32" }),
    genrandModeFlag: Object.freeze({ offset: 1948, type: "u32" }),
    frameOpaque4257b0PostPassAListCount: Object.freeze({ offset: 1952, type: "u32" }),
    menuAuxSentinelReady: Object.freeze({ offset: 1956, type: "u32" }),
    menuAuxSentinelAddr: Object.freeze({ offset: 1960, type: "u32" }),
    menuAuxMenuAddr: Object.freeze({ offset: 1964, type: "u32" }),
    hudMessageTextPtr54: Object.freeze({ offset: 1968, type: "u32" }),
    hudMessageTextWords0: Object.freeze({ offset: 1972, type: "u32" }),
    hudMessageTextWords1: Object.freeze({ offset: 1976, type: "u32" }),
    rankDisplaySwitch: Object.freeze({ offset: 1980, type: "u32" }),
    rankDisplayByte22d: Object.freeze({ offset: 1984, type: "u32" }),
    rankDisplayDword158: Object.freeze({ offset: 1988, type: "u32" }),
    rankDisplayByte168: Object.freeze({ offset: 1992, type: "u32" }),
    rankDisplayDword248: Object.freeze({ offset: 1996, type: "u32" }),
    rankDisplayByte119: Object.freeze({ offset: 2000, type: "u32" }),
    rankDisplayPtr44: Object.freeze({ offset: 2004, type: "u32" }),
    rankDisplayByte54: Object.freeze({ offset: 2008, type: "u32" }),
    rankDisplayByte39c: Object.freeze({ offset: 2012, type: "u32" }),
    rankDisplayByte39d: Object.freeze({ offset: 2016, type: "u32" }),
    rankDisplayByte3b0: Object.freeze({ offset: 2020, type: "u32" }),
    rankDisplayDispWord0: Object.freeze({ offset: 2024, type: "u32" }),
    rankDisplayDispWord1: Object.freeze({ offset: 2028, type: "u32" }),
    rankDisplayDispWord2: Object.freeze({ offset: 2032, type: "u32" }),
    rankDisplayDispWord3: Object.freeze({ offset: 2036, type: "u32" }),
    rankDisplayDispEos: Object.freeze({ offset: 2040, type: "u32" }),
    rankDisplayIsPlayingAl: Object.freeze({ offset: 2044, type: "u32" }),
    rankDisplayStUpd: Object.freeze({ offset: 2048, type: "u32" }),
    rankDisplayStAfterLoading: Object.freeze({ offset: 2052, type: "u32" }),
    rankDisplayStAfterIdle: Object.freeze({ offset: 2056, type: "u32" }),
    rankDisplayStAfterDisplay: Object.freeze({ offset: 2060, type: "u32" }),
    luaFrameUnrefReady: Object.freeze({ offset: 2064, type: "u32" }),
    luaFrameUnrefFlagByte: Object.freeze({ offset: 2068, type: "u32" }),
    state24ecc22ed0Ready: Object.freeze({ offset: 2072, type: "u32" }),
    sfxStopReady: Object.freeze({ offset: 2080, type: "u32" }),
    sfxStopSpan: Object.freeze({ offset: 2084, type: "u32" }),
    sfxStopVoices190: Object.freeze({ offset: 2088, type: "u32" }),
    sfxStopEnabled198: Object.freeze({ offset: 2092, type: "u32" }),
    menuAuxTreeLeft0: Object.freeze({ offset: 1172, type: "u32" }),
    menuAuxTreeRight0: Object.freeze({ offset: 1300, type: "u32" }),
    menuAuxTreeIsnil0: Object.freeze({ offset: 1556, type: "u32" }),
    menuAuxTreeFlag1c0: Object.freeze({ offset: 1428, type: "u32" }),
    menuAuxTreePayloadPresent0: Object.freeze({ offset: 1684, type: "u32" }),
    menuAuxTreePayloadSize0: Object.freeze({ offset: 1812, type: "u32" }),
    menuAuxTreeLeft1: Object.freeze({ offset: 1176, type: "u32" }),
    menuAuxTreeRight1: Object.freeze({ offset: 1304, type: "u32" }),
    menuAuxTreeIsnil1: Object.freeze({ offset: 1560, type: "u32" }),
    menuAuxTreeFlag1c1: Object.freeze({ offset: 1432, type: "u32" }),
    menuAuxTreePayloadPresent1: Object.freeze({ offset: 1688, type: "u32" }),
    menuAuxTreePayloadSize1: Object.freeze({ offset: 1816, type: "u32" }),
    menuAuxTreeLeft2: Object.freeze({ offset: 1180, type: "u32" }),
    menuAuxTreeRight2: Object.freeze({ offset: 1308, type: "u32" }),
    menuAuxTreeIsnil2: Object.freeze({ offset: 1564, type: "u32" }),
    menuAuxTreeFlag1c2: Object.freeze({ offset: 1436, type: "u32" }),
    menuAuxTreePayloadPresent2: Object.freeze({ offset: 1692, type: "u32" }),
    menuAuxTreePayloadSize2: Object.freeze({ offset: 1820, type: "u32" }),
    menuAuxTreeLeft3: Object.freeze({ offset: 1184, type: "u32" }),
    menuAuxTreeRight3: Object.freeze({ offset: 1312, type: "u32" }),
    menuAuxTreeIsnil3: Object.freeze({ offset: 1568, type: "u32" }),
    menuAuxTreeFlag1c3: Object.freeze({ offset: 1440, type: "u32" }),
    menuAuxTreePayloadPresent3: Object.freeze({ offset: 1696, type: "u32" }),
    menuAuxTreePayloadSize3: Object.freeze({ offset: 1824, type: "u32" }),
    menuAuxTreeLeft4: Object.freeze({ offset: 1188, type: "u32" }),
    menuAuxTreeRight4: Object.freeze({ offset: 1316, type: "u32" }),
    menuAuxTreeIsnil4: Object.freeze({ offset: 1572, type: "u32" }),
    menuAuxTreeFlag1c4: Object.freeze({ offset: 1444, type: "u32" }),
    menuAuxTreePayloadPresent4: Object.freeze({ offset: 1700, type: "u32" }),
    menuAuxTreePayloadSize4: Object.freeze({ offset: 1828, type: "u32" }),
    menuAuxTreeLeft5: Object.freeze({ offset: 1192, type: "u32" }),
    menuAuxTreeRight5: Object.freeze({ offset: 1320, type: "u32" }),
    menuAuxTreeIsnil5: Object.freeze({ offset: 1576, type: "u32" }),
    menuAuxTreeFlag1c5: Object.freeze({ offset: 1448, type: "u32" }),
    menuAuxTreePayloadPresent5: Object.freeze({ offset: 1704, type: "u32" }),
    menuAuxTreePayloadSize5: Object.freeze({ offset: 1832, type: "u32" }),
    menuAuxTreeLeft6: Object.freeze({ offset: 1196, type: "u32" }),
    menuAuxTreeRight6: Object.freeze({ offset: 1324, type: "u32" }),
    menuAuxTreeIsnil6: Object.freeze({ offset: 1580, type: "u32" }),
    menuAuxTreeFlag1c6: Object.freeze({ offset: 1452, type: "u32" }),
    menuAuxTreePayloadPresent6: Object.freeze({ offset: 1708, type: "u32" }),
    menuAuxTreePayloadSize6: Object.freeze({ offset: 1836, type: "u32" }),
    menuAuxTreeLeft7: Object.freeze({ offset: 1200, type: "u32" }),
    menuAuxTreeRight7: Object.freeze({ offset: 1328, type: "u32" }),
    menuAuxTreeIsnil7: Object.freeze({ offset: 1584, type: "u32" }),
    menuAuxTreeFlag1c7: Object.freeze({ offset: 1456, type: "u32" }),
    menuAuxTreePayloadPresent7: Object.freeze({ offset: 1712, type: "u32" }),
    menuAuxTreePayloadSize7: Object.freeze({ offset: 1840, type: "u32" }),
    menuAuxTreeLeft8: Object.freeze({ offset: 1204, type: "u32" }),
    menuAuxTreeRight8: Object.freeze({ offset: 1332, type: "u32" }),
    menuAuxTreeIsnil8: Object.freeze({ offset: 1588, type: "u32" }),
    menuAuxTreeFlag1c8: Object.freeze({ offset: 1460, type: "u32" }),
    menuAuxTreePayloadPresent8: Object.freeze({ offset: 1716, type: "u32" }),
    menuAuxTreePayloadSize8: Object.freeze({ offset: 1844, type: "u32" }),
    menuAuxTreeLeft9: Object.freeze({ offset: 1208, type: "u32" }),
    menuAuxTreeRight9: Object.freeze({ offset: 1336, type: "u32" }),
    menuAuxTreeIsnil9: Object.freeze({ offset: 1592, type: "u32" }),
    menuAuxTreeFlag1c9: Object.freeze({ offset: 1464, type: "u32" }),
    menuAuxTreePayloadPresent9: Object.freeze({ offset: 1720, type: "u32" }),
    menuAuxTreePayloadSize9: Object.freeze({ offset: 1848, type: "u32" }),
    menuAuxTreeLeft10: Object.freeze({ offset: 1212, type: "u32" }),
    menuAuxTreeRight10: Object.freeze({ offset: 1340, type: "u32" }),
    menuAuxTreeIsnil10: Object.freeze({ offset: 1596, type: "u32" }),
    menuAuxTreeFlag1c10: Object.freeze({ offset: 1468, type: "u32" }),
    menuAuxTreePayloadPresent10: Object.freeze({ offset: 1724, type: "u32" }),
    menuAuxTreePayloadSize10: Object.freeze({ offset: 1852, type: "u32" }),
    menuAuxTreeLeft11: Object.freeze({ offset: 1216, type: "u32" }),
    menuAuxTreeRight11: Object.freeze({ offset: 1344, type: "u32" }),
    menuAuxTreeIsnil11: Object.freeze({ offset: 1600, type: "u32" }),
    menuAuxTreeFlag1c11: Object.freeze({ offset: 1472, type: "u32" }),
    menuAuxTreePayloadPresent11: Object.freeze({ offset: 1728, type: "u32" }),
    menuAuxTreePayloadSize11: Object.freeze({ offset: 1856, type: "u32" }),
    menuAuxTreeLeft12: Object.freeze({ offset: 1220, type: "u32" }),
    menuAuxTreeRight12: Object.freeze({ offset: 1348, type: "u32" }),
    menuAuxTreeIsnil12: Object.freeze({ offset: 1604, type: "u32" }),
    menuAuxTreeFlag1c12: Object.freeze({ offset: 1476, type: "u32" }),
    menuAuxTreePayloadPresent12: Object.freeze({ offset: 1732, type: "u32" }),
    menuAuxTreePayloadSize12: Object.freeze({ offset: 1860, type: "u32" }),
    menuAuxTreeLeft13: Object.freeze({ offset: 1224, type: "u32" }),
    menuAuxTreeRight13: Object.freeze({ offset: 1352, type: "u32" }),
    menuAuxTreeIsnil13: Object.freeze({ offset: 1608, type: "u32" }),
    menuAuxTreeFlag1c13: Object.freeze({ offset: 1480, type: "u32" }),
    menuAuxTreePayloadPresent13: Object.freeze({ offset: 1736, type: "u32" }),
    menuAuxTreePayloadSize13: Object.freeze({ offset: 1864, type: "u32" }),
    menuAuxTreeLeft14: Object.freeze({ offset: 1228, type: "u32" }),
    menuAuxTreeRight14: Object.freeze({ offset: 1356, type: "u32" }),
    menuAuxTreeIsnil14: Object.freeze({ offset: 1612, type: "u32" }),
    menuAuxTreeFlag1c14: Object.freeze({ offset: 1484, type: "u32" }),
    menuAuxTreePayloadPresent14: Object.freeze({ offset: 1740, type: "u32" }),
    menuAuxTreePayloadSize14: Object.freeze({ offset: 1868, type: "u32" }),
    menuAuxTreeLeft15: Object.freeze({ offset: 1232, type: "u32" }),
    menuAuxTreeRight15: Object.freeze({ offset: 1360, type: "u32" }),
    menuAuxTreeIsnil15: Object.freeze({ offset: 1616, type: "u32" }),
    menuAuxTreeFlag1c15: Object.freeze({ offset: 1488, type: "u32" }),
    menuAuxTreePayloadPresent15: Object.freeze({ offset: 1744, type: "u32" }),
    menuAuxTreePayloadSize15: Object.freeze({ offset: 1872, type: "u32" }),
    menuAuxTreeLeft16: Object.freeze({ offset: 1236, type: "u32" }),
    menuAuxTreeRight16: Object.freeze({ offset: 1364, type: "u32" }),
    menuAuxTreeIsnil16: Object.freeze({ offset: 1620, type: "u32" }),
    menuAuxTreeFlag1c16: Object.freeze({ offset: 1492, type: "u32" }),
    menuAuxTreePayloadPresent16: Object.freeze({ offset: 1748, type: "u32" }),
    menuAuxTreePayloadSize16: Object.freeze({ offset: 1876, type: "u32" }),
    menuAuxTreeLeft17: Object.freeze({ offset: 1240, type: "u32" }),
    menuAuxTreeRight17: Object.freeze({ offset: 1368, type: "u32" }),
    menuAuxTreeIsnil17: Object.freeze({ offset: 1624, type: "u32" }),
    menuAuxTreeFlag1c17: Object.freeze({ offset: 1496, type: "u32" }),
    menuAuxTreePayloadPresent17: Object.freeze({ offset: 1752, type: "u32" }),
    menuAuxTreePayloadSize17: Object.freeze({ offset: 1880, type: "u32" }),
    menuAuxTreeLeft18: Object.freeze({ offset: 1244, type: "u32" }),
    menuAuxTreeRight18: Object.freeze({ offset: 1372, type: "u32" }),
    menuAuxTreeIsnil18: Object.freeze({ offset: 1628, type: "u32" }),
    menuAuxTreeFlag1c18: Object.freeze({ offset: 1500, type: "u32" }),
    menuAuxTreePayloadPresent18: Object.freeze({ offset: 1756, type: "u32" }),
    menuAuxTreePayloadSize18: Object.freeze({ offset: 1884, type: "u32" }),
    menuAuxTreeLeft19: Object.freeze({ offset: 1248, type: "u32" }),
    menuAuxTreeRight19: Object.freeze({ offset: 1376, type: "u32" }),
    menuAuxTreeIsnil19: Object.freeze({ offset: 1632, type: "u32" }),
    menuAuxTreeFlag1c19: Object.freeze({ offset: 1504, type: "u32" }),
    menuAuxTreePayloadPresent19: Object.freeze({ offset: 1760, type: "u32" }),
    menuAuxTreePayloadSize19: Object.freeze({ offset: 1888, type: "u32" }),
    menuAuxTreeLeft20: Object.freeze({ offset: 1252, type: "u32" }),
    menuAuxTreeRight20: Object.freeze({ offset: 1380, type: "u32" }),
    menuAuxTreeIsnil20: Object.freeze({ offset: 1636, type: "u32" }),
    menuAuxTreeFlag1c20: Object.freeze({ offset: 1508, type: "u32" }),
    menuAuxTreePayloadPresent20: Object.freeze({ offset: 1764, type: "u32" }),
    menuAuxTreePayloadSize20: Object.freeze({ offset: 1892, type: "u32" }),
    menuAuxTreeLeft21: Object.freeze({ offset: 1256, type: "u32" }),
    menuAuxTreeRight21: Object.freeze({ offset: 1384, type: "u32" }),
    menuAuxTreeIsnil21: Object.freeze({ offset: 1640, type: "u32" }),
    menuAuxTreeFlag1c21: Object.freeze({ offset: 1512, type: "u32" }),
    menuAuxTreePayloadPresent21: Object.freeze({ offset: 1768, type: "u32" }),
    menuAuxTreePayloadSize21: Object.freeze({ offset: 1896, type: "u32" }),
    menuAuxTreeLeft22: Object.freeze({ offset: 1260, type: "u32" }),
    menuAuxTreeRight22: Object.freeze({ offset: 1388, type: "u32" }),
    menuAuxTreeIsnil22: Object.freeze({ offset: 1644, type: "u32" }),
    menuAuxTreeFlag1c22: Object.freeze({ offset: 1516, type: "u32" }),
    menuAuxTreePayloadPresent22: Object.freeze({ offset: 1772, type: "u32" }),
    menuAuxTreePayloadSize22: Object.freeze({ offset: 1900, type: "u32" }),
    menuAuxTreeLeft23: Object.freeze({ offset: 1264, type: "u32" }),
    menuAuxTreeRight23: Object.freeze({ offset: 1392, type: "u32" }),
    menuAuxTreeIsnil23: Object.freeze({ offset: 1648, type: "u32" }),
    menuAuxTreeFlag1c23: Object.freeze({ offset: 1520, type: "u32" }),
    menuAuxTreePayloadPresent23: Object.freeze({ offset: 1776, type: "u32" }),
    menuAuxTreePayloadSize23: Object.freeze({ offset: 1904, type: "u32" }),
    menuAuxTreeLeft24: Object.freeze({ offset: 1268, type: "u32" }),
    menuAuxTreeRight24: Object.freeze({ offset: 1396, type: "u32" }),
    menuAuxTreeIsnil24: Object.freeze({ offset: 1652, type: "u32" }),
    menuAuxTreeFlag1c24: Object.freeze({ offset: 1524, type: "u32" }),
    menuAuxTreePayloadPresent24: Object.freeze({ offset: 1780, type: "u32" }),
    menuAuxTreePayloadSize24: Object.freeze({ offset: 1908, type: "u32" }),
    menuAuxTreeLeft25: Object.freeze({ offset: 1272, type: "u32" }),
    menuAuxTreeRight25: Object.freeze({ offset: 1400, type: "u32" }),
    menuAuxTreeIsnil25: Object.freeze({ offset: 1656, type: "u32" }),
    menuAuxTreeFlag1c25: Object.freeze({ offset: 1528, type: "u32" }),
    menuAuxTreePayloadPresent25: Object.freeze({ offset: 1784, type: "u32" }),
    menuAuxTreePayloadSize25: Object.freeze({ offset: 1912, type: "u32" }),
    menuAuxTreeLeft26: Object.freeze({ offset: 1276, type: "u32" }),
    menuAuxTreeRight26: Object.freeze({ offset: 1404, type: "u32" }),
    menuAuxTreeIsnil26: Object.freeze({ offset: 1660, type: "u32" }),
    menuAuxTreeFlag1c26: Object.freeze({ offset: 1532, type: "u32" }),
    menuAuxTreePayloadPresent26: Object.freeze({ offset: 1788, type: "u32" }),
    menuAuxTreePayloadSize26: Object.freeze({ offset: 1916, type: "u32" }),
    menuAuxTreeLeft27: Object.freeze({ offset: 1280, type: "u32" }),
    menuAuxTreeRight27: Object.freeze({ offset: 1408, type: "u32" }),
    menuAuxTreeIsnil27: Object.freeze({ offset: 1664, type: "u32" }),
    menuAuxTreeFlag1c27: Object.freeze({ offset: 1536, type: "u32" }),
    menuAuxTreePayloadPresent27: Object.freeze({ offset: 1792, type: "u32" }),
    menuAuxTreePayloadSize27: Object.freeze({ offset: 1920, type: "u32" }),
    menuAuxTreeLeft28: Object.freeze({ offset: 1284, type: "u32" }),
    menuAuxTreeRight28: Object.freeze({ offset: 1412, type: "u32" }),
    menuAuxTreeIsnil28: Object.freeze({ offset: 1668, type: "u32" }),
    menuAuxTreeFlag1c28: Object.freeze({ offset: 1540, type: "u32" }),
    menuAuxTreePayloadPresent28: Object.freeze({ offset: 1796, type: "u32" }),
    menuAuxTreePayloadSize28: Object.freeze({ offset: 1924, type: "u32" }),
    menuAuxTreeLeft29: Object.freeze({ offset: 1288, type: "u32" }),
    menuAuxTreeRight29: Object.freeze({ offset: 1416, type: "u32" }),
    menuAuxTreeIsnil29: Object.freeze({ offset: 1672, type: "u32" }),
    menuAuxTreeFlag1c29: Object.freeze({ offset: 1544, type: "u32" }),
    menuAuxTreePayloadPresent29: Object.freeze({ offset: 1800, type: "u32" }),
    menuAuxTreePayloadSize29: Object.freeze({ offset: 1928, type: "u32" }),
    menuAuxTreeLeft30: Object.freeze({ offset: 1292, type: "u32" }),
    menuAuxTreeRight30: Object.freeze({ offset: 1420, type: "u32" }),
    menuAuxTreeIsnil30: Object.freeze({ offset: 1676, type: "u32" }),
    menuAuxTreeFlag1c30: Object.freeze({ offset: 1548, type: "u32" }),
    menuAuxTreePayloadPresent30: Object.freeze({ offset: 1804, type: "u32" }),
    menuAuxTreePayloadSize30: Object.freeze({ offset: 1932, type: "u32" }),
    menuAuxTreeLeft31: Object.freeze({ offset: 1296, type: "u32" }),
    menuAuxTreeRight31: Object.freeze({ offset: 1424, type: "u32" }),
    menuAuxTreeIsnil31: Object.freeze({ offset: 1680, type: "u32" }),
    menuAuxTreeFlag1c31: Object.freeze({ offset: 1552, type: "u32" }),
    menuAuxTreePayloadPresent31: Object.freeze({ offset: 1808, type: "u32" }),
    menuAuxTreePayloadSize31: Object.freeze({ offset: 1936, type: "u32" }),
    fxStep676d0: Object.freeze({ offset: 2096, type: "f32" }),
    fxStep676d4: Object.freeze({ offset: 2100, type: "f32" }),
    fxStep676d8: Object.freeze({ offset: 2104, type: "f32" }),
    fxStep676dc: Object.freeze({ offset: 2108, type: "f32" }),
    fxStep676e0: Object.freeze({ offset: 2112, type: "f32" }),
    fxStep676e4: Object.freeze({ offset: 2116, type: "f32" }),
    fxGoal676e8: Object.freeze({ offset: 2120, type: "f32" }),
    fxGoal676ec: Object.freeze({ offset: 2124, type: "f32" }),
    fxGoal676f0: Object.freeze({ offset: 2128, type: "f32" }),
    fxGoal676f4: Object.freeze({ offset: 2132, type: "f32" }),
    fxGoal676f8: Object.freeze({ offset: 2136, type: "f32" }),
    fxGoal676fc: Object.freeze({ offset: 2140, type: "f32" }),
    hostFun746560PostReady: Object.freeze({ offset: 2144, type: "u32" }),
    frameOpaque98dba0TimerReady: Object.freeze({ offset: 2148, type: "u32" }),
    frameOpaque98dba0Timer264e8: Object.freeze({ offset: 2152, type: "u32" }),
    pmDeathPlayerCount: Object.freeze({ offset: 2156, type: "u32" }),
    pmDeathBlobReady: Object.freeze({ offset: 2160, type: "u32" }),
    pmDeathAnim7c0: Object.freeze({ offset: 2164, type: "u32" }),
    pmDeathTwinAnim7c0: Object.freeze({ offset: 2196, type: "u32" }),
    pmDeathAnim8c0: Object.freeze({ offset: 2260, type: "u32" }),
    pmDeathTwinNull0: Object.freeze({ offset: 2292, type: "u32" }),
    pmDeathTwinAnim8c0: Object.freeze({ offset: 2324, type: "u32" }),
    pmDeathAnim7c1: Object.freeze({ offset: 2168, type: "u32" }),
    pmDeathTwinAnim7c1: Object.freeze({ offset: 2200, type: "u32" }),
    pmDeathAnim8c1: Object.freeze({ offset: 2264, type: "u32" }),
    pmDeathTwinNull1: Object.freeze({ offset: 2296, type: "u32" }),
    pmDeathTwinAnim8c1: Object.freeze({ offset: 2328, type: "u32" }),
    pmDeathAnim7c2: Object.freeze({ offset: 2172, type: "u32" }),
    pmDeathTwinAnim7c2: Object.freeze({ offset: 2204, type: "u32" }),
    pmDeathAnim8c2: Object.freeze({ offset: 2268, type: "u32" }),
    pmDeathTwinNull2: Object.freeze({ offset: 2300, type: "u32" }),
    pmDeathTwinAnim8c2: Object.freeze({ offset: 2332, type: "u32" }),
    pmDeathAnim7c3: Object.freeze({ offset: 2176, type: "u32" }),
    pmDeathTwinAnim7c3: Object.freeze({ offset: 2208, type: "u32" }),
    pmDeathAnim8c3: Object.freeze({ offset: 2272, type: "u32" }),
    pmDeathTwinNull3: Object.freeze({ offset: 2304, type: "u32" }),
    pmDeathTwinAnim8c3: Object.freeze({ offset: 2336, type: "u32" }),
    pmDeathAnim7c4: Object.freeze({ offset: 2180, type: "u32" }),
    pmDeathTwinAnim7c4: Object.freeze({ offset: 2212, type: "u32" }),
    pmDeathAnim8c4: Object.freeze({ offset: 2276, type: "u32" }),
    pmDeathTwinNull4: Object.freeze({ offset: 2308, type: "u32" }),
    pmDeathTwinAnim8c4: Object.freeze({ offset: 2340, type: "u32" }),
    pmDeathAnim7c5: Object.freeze({ offset: 2184, type: "u32" }),
    pmDeathTwinAnim7c5: Object.freeze({ offset: 2216, type: "u32" }),
    pmDeathAnim8c5: Object.freeze({ offset: 2280, type: "u32" }),
    pmDeathTwinNull5: Object.freeze({ offset: 2312, type: "u32" }),
    pmDeathTwinAnim8c5: Object.freeze({ offset: 2344, type: "u32" }),
    pmDeathAnim7c6: Object.freeze({ offset: 2188, type: "u32" }),
    pmDeathTwinAnim7c6: Object.freeze({ offset: 2220, type: "u32" }),
    pmDeathAnim8c6: Object.freeze({ offset: 2284, type: "u32" }),
    pmDeathTwinNull6: Object.freeze({ offset: 2316, type: "u32" }),
    pmDeathTwinAnim8c6: Object.freeze({ offset: 2348, type: "u32" }),
    pmDeathAnim7c7: Object.freeze({ offset: 2192, type: "u32" }),
    pmDeathTwinAnim7c7: Object.freeze({ offset: 2224, type: "u32" }),
    pmDeathAnim8c7: Object.freeze({ offset: 2288, type: "u32" }),
    pmDeathTwinNull7: Object.freeze({ offset: 2320, type: "u32" }),
    pmDeathTwinAnim8c7: Object.freeze({ offset: 2352, type: "u32" }),
    frameOpaque98dba0TimerPureReady: Object.freeze({ offset: 2356, type: "u32" }),
    frameOpaque98dba0TimerSample: Object.freeze({ offset: 2360, type: "u32" }),
    frameOpaque98dba0TimerUseCrtRand: Object.freeze({ offset: 2364, type: "u32" }),
    frameOpaque98dba0TimerX264ecBits: Object.freeze({ offset: 2368, type: "u32" }),
    frameOpaque98dba0TimerY264f0Bits: Object.freeze({ offset: 2372, type: "u32" }),
    frameOpaque98dba0TimerCosBitsLo: Object.freeze({ offset: 2376, type: "u32" }),
    frameOpaque98dba0TimerCosBitsHi: Object.freeze({ offset: 2380, type: "u32" }),
    frameOpaque98dba0TimerSinBitsLo: Object.freeze({ offset: 2384, type: "u32" }),
    frameOpaque98dba0TimerSinBitsHi: Object.freeze({ offset: 2388, type: "u32" }),
    frameOpaque4257b0BlobReady: Object.freeze({ offset: 2392, type: "u32" }),
    frameOpaque4257b0ListBegin: Object.freeze({ offset: 2396, type: "u32" }),
    frameOpaque4257b0ListEnd: Object.freeze({ offset: 2400, type: "u32" }),
    frameOpaque4257b0ListCap: Object.freeze({ offset: 2404, type: "u32" }),
    frameOpaque4257b0PostListBegin: Object.freeze({ offset: 2408, type: "u32" }),
    frameOpaque4257b0PostListEnd: Object.freeze({ offset: 2412, type: "u32" }),
    frameOpaque4257b0IdvecBegin: Object.freeze({ offset: 2416, type: "u32" }),
    frameOpaque4257b0IdvecEnd: Object.freeze({ offset: 2420, type: "u32" }),
    frameOpaque4257b0CtrBegin: Object.freeze({ offset: 2424, type: "u32" }),
    frameOpaque4257b0CtrEnd: Object.freeze({ offset: 2428, type: "u32" }),
    frameOpaque4257b0InitialByte13: Object.freeze({ offset: 2432, type: "u32" }),
    frameOpaque4257b0PPtr0: Object.freeze({ offset: 2436, type: "u32" }),
    frameOpaque4257b0P161c0: Object.freeze({ offset: 2500, type: "i32" }),
    frameOpaque4257b0QPtr0: Object.freeze({ offset: 2532, type: "u32" }),
    frameOpaque4257b0Q161c0: Object.freeze({ offset: 2564, type: "i32" }),
    frameOpaque4257b0QqPtr0: Object.freeze({ offset: 2628, type: "u32" }),
    frameOpaque4257b0Qq161c0: Object.freeze({ offset: 2660, type: "i32" }),
    frameOpaque4257b0PPtr1: Object.freeze({ offset: 2440, type: "u32" }),
    frameOpaque4257b0P161c1: Object.freeze({ offset: 2504, type: "i32" }),
    frameOpaque4257b0QPtr1: Object.freeze({ offset: 2536, type: "u32" }),
    frameOpaque4257b0Q161c1: Object.freeze({ offset: 2568, type: "i32" }),
    frameOpaque4257b0QqPtr1: Object.freeze({ offset: 2632, type: "u32" }),
    frameOpaque4257b0Qq161c1: Object.freeze({ offset: 2664, type: "i32" }),
    frameOpaque4257b0PPtr2: Object.freeze({ offset: 2444, type: "u32" }),
    frameOpaque4257b0P161c2: Object.freeze({ offset: 2508, type: "i32" }),
    frameOpaque4257b0QPtr2: Object.freeze({ offset: 2540, type: "u32" }),
    frameOpaque4257b0Q161c2: Object.freeze({ offset: 2572, type: "i32" }),
    frameOpaque4257b0QqPtr2: Object.freeze({ offset: 2636, type: "u32" }),
    frameOpaque4257b0Qq161c2: Object.freeze({ offset: 2668, type: "i32" }),
    frameOpaque4257b0PPtr3: Object.freeze({ offset: 2448, type: "u32" }),
    frameOpaque4257b0P161c3: Object.freeze({ offset: 2512, type: "i32" }),
    frameOpaque4257b0QPtr3: Object.freeze({ offset: 2544, type: "u32" }),
    frameOpaque4257b0Q161c3: Object.freeze({ offset: 2576, type: "i32" }),
    frameOpaque4257b0QqPtr3: Object.freeze({ offset: 2640, type: "u32" }),
    frameOpaque4257b0Qq161c3: Object.freeze({ offset: 2672, type: "i32" }),
    frameOpaque4257b0PPtr4: Object.freeze({ offset: 2452, type: "u32" }),
    frameOpaque4257b0P161c4: Object.freeze({ offset: 2516, type: "i32" }),
    frameOpaque4257b0QPtr4: Object.freeze({ offset: 2548, type: "u32" }),
    frameOpaque4257b0Q161c4: Object.freeze({ offset: 2580, type: "i32" }),
    frameOpaque4257b0QqPtr4: Object.freeze({ offset: 2644, type: "u32" }),
    frameOpaque4257b0Qq161c4: Object.freeze({ offset: 2676, type: "i32" }),
    frameOpaque4257b0PPtr5: Object.freeze({ offset: 2456, type: "u32" }),
    frameOpaque4257b0P161c5: Object.freeze({ offset: 2520, type: "i32" }),
    frameOpaque4257b0QPtr5: Object.freeze({ offset: 2552, type: "u32" }),
    frameOpaque4257b0Q161c5: Object.freeze({ offset: 2584, type: "i32" }),
    frameOpaque4257b0QqPtr5: Object.freeze({ offset: 2648, type: "u32" }),
    frameOpaque4257b0Qq161c5: Object.freeze({ offset: 2680, type: "i32" }),
    frameOpaque4257b0PPtr6: Object.freeze({ offset: 2460, type: "u32" }),
    frameOpaque4257b0P161c6: Object.freeze({ offset: 2524, type: "i32" }),
    frameOpaque4257b0QPtr6: Object.freeze({ offset: 2556, type: "u32" }),
    frameOpaque4257b0Q161c6: Object.freeze({ offset: 2588, type: "i32" }),
    frameOpaque4257b0QqPtr6: Object.freeze({ offset: 2652, type: "u32" }),
    frameOpaque4257b0Qq161c6: Object.freeze({ offset: 2684, type: "i32" }),
    frameOpaque4257b0PPtr7: Object.freeze({ offset: 2464, type: "u32" }),
    frameOpaque4257b0P161c7: Object.freeze({ offset: 2528, type: "i32" }),
    frameOpaque4257b0QPtr7: Object.freeze({ offset: 2560, type: "u32" }),
    frameOpaque4257b0Q161c7: Object.freeze({ offset: 2592, type: "i32" }),
    frameOpaque4257b0QqPtr7: Object.freeze({ offset: 2656, type: "u32" }),
    frameOpaque4257b0Qq161c7: Object.freeze({ offset: 2688, type: "i32" }),
    frameOpaque4257b0ElemSubPtr0: Object.freeze({ offset: 2788, type: "u32" }),
    frameOpaque4257b0ElemSubPtr1: Object.freeze({ offset: 2792, type: "u32" }),
    frameOpaque4257b0ElemSubPtr2: Object.freeze({ offset: 2796, type: "u32" }),
    frameOpaque4257b0ElemSubPtr3: Object.freeze({ offset: 2800, type: "u32" }),
    frameOpaque4257b0ElemSubPtr4: Object.freeze({ offset: 2804, type: "u32" }),
    frameOpaque4257b0ElemSubPtr5: Object.freeze({ offset: 2808, type: "u32" }),
    frameOpaque4257b0ElemSubPtr6: Object.freeze({ offset: 2812, type: "u32" }),
    frameOpaque4257b0ElemSubPtr7: Object.freeze({ offset: 2816, type: "u32" }),
    frameOpaque4257b0ElemSubPtr8: Object.freeze({ offset: 2820, type: "u32" }),
    frameOpaque4257b0ElemSubPtr9: Object.freeze({ offset: 2824, type: "u32" }),
    frameOpaque4257b0ElemSubPtr10: Object.freeze({ offset: 2828, type: "u32" }),
    frameOpaque4257b0ElemSubPtr11: Object.freeze({ offset: 2832, type: "u32" }),
    frameOpaque4257b0ElemSubPtr12: Object.freeze({ offset: 2836, type: "u32" }),
    frameOpaque4257b0ElemSubPtr13: Object.freeze({ offset: 2840, type: "u32" }),
    frameOpaque4257b0ElemSubPtr14: Object.freeze({ offset: 2844, type: "u32" }),
    frameOpaque4257b0ElemSubPtr15: Object.freeze({ offset: 2848, type: "u32" }),
    frameOpaque4257b0ListLo0: Object.freeze({ offset: 2980, type: "u32" }),
    frameOpaque4257b0ListHi0: Object.freeze({ offset: 3044, type: "u32" }),
    frameOpaque4257b0ListLo1: Object.freeze({ offset: 2984, type: "u32" }),
    frameOpaque4257b0ListHi1: Object.freeze({ offset: 3048, type: "u32" }),
    frameOpaque4257b0ListLo2: Object.freeze({ offset: 2988, type: "u32" }),
    frameOpaque4257b0ListHi2: Object.freeze({ offset: 3052, type: "u32" }),
    frameOpaque4257b0ListLo3: Object.freeze({ offset: 2992, type: "u32" }),
    frameOpaque4257b0ListHi3: Object.freeze({ offset: 3056, type: "u32" }),
    frameOpaque4257b0ListLo4: Object.freeze({ offset: 2996, type: "u32" }),
    frameOpaque4257b0ListHi4: Object.freeze({ offset: 3060, type: "u32" }),
    frameOpaque4257b0ListLo5: Object.freeze({ offset: 3000, type: "u32" }),
    frameOpaque4257b0ListHi5: Object.freeze({ offset: 3064, type: "u32" }),
    frameOpaque4257b0ListLo6: Object.freeze({ offset: 3004, type: "u32" }),
    frameOpaque4257b0ListHi6: Object.freeze({ offset: 3068, type: "u32" }),
    frameOpaque4257b0ListLo7: Object.freeze({ offset: 3008, type: "u32" }),
    frameOpaque4257b0ListHi7: Object.freeze({ offset: 3072, type: "u32" }),
    frameOpaque4257b0ListLo8: Object.freeze({ offset: 3012, type: "u32" }),
    frameOpaque4257b0ListHi8: Object.freeze({ offset: 3076, type: "u32" }),
    frameOpaque4257b0ListLo9: Object.freeze({ offset: 3016, type: "u32" }),
    frameOpaque4257b0ListHi9: Object.freeze({ offset: 3080, type: "u32" }),
    frameOpaque4257b0ListLo10: Object.freeze({ offset: 3020, type: "u32" }),
    frameOpaque4257b0ListHi10: Object.freeze({ offset: 3084, type: "u32" }),
    frameOpaque4257b0ListLo11: Object.freeze({ offset: 3024, type: "u32" }),
    frameOpaque4257b0ListHi11: Object.freeze({ offset: 3088, type: "u32" }),
    frameOpaque4257b0ListLo12: Object.freeze({ offset: 3028, type: "u32" }),
    frameOpaque4257b0ListHi12: Object.freeze({ offset: 3092, type: "u32" }),
    frameOpaque4257b0ListLo13: Object.freeze({ offset: 3032, type: "u32" }),
    frameOpaque4257b0ListHi13: Object.freeze({ offset: 3096, type: "u32" }),
    frameOpaque4257b0ListLo14: Object.freeze({ offset: 3036, type: "u32" }),
    frameOpaque4257b0ListHi14: Object.freeze({ offset: 3100, type: "u32" }),
    frameOpaque4257b0ListLo15: Object.freeze({ offset: 3040, type: "u32" }),
    frameOpaque4257b0ListHi15: Object.freeze({ offset: 3104, type: "u32" }),
    frameEffectShellReady: Object.freeze({ offset: 3172, type: "u32" }),
    frameEffectShellRoom18304: Object.freeze({ offset: 3176, type: "u32" }),
    frameEffectShellRoom182d0: Object.freeze({ offset: 3180, type: "u32" }),
    frameEffectShellRoomByte1: Object.freeze({ offset: 3184, type: "u32" }),
    frameEffectRewindReady: Object.freeze({ offset: 3188, type: "u32" }),
    frameEffectRewindGuard269ea: Object.freeze({ offset: 3192, type: "u32" }),
    frameEffectRewindGuard269eb: Object.freeze({ offset: 3196, type: "u32" }),
    frameEffectRewindGuard68d70: Object.freeze({ offset: 3200, type: "u32" }),
    engineAnm2LatchReady: Object.freeze({ offset: 3204, type: "u32" }),
    engineAnm2Latch: Object.freeze({ offset: 3208, type: "u32" }),
    frameOpaque98dba0TimerMtReady: Object.freeze({ offset: 3212, type: "u32" }),
    engineAnm2BlobReady: Object.freeze({ offset: 3220, type: "u32" }),
    engineAnm2LayerCount: Object.freeze({ offset: 3224, type: "u32" }),
    engineAnm2ExtraCount: Object.freeze({ offset: 3228, type: "u32" }),
    engineAnm2Bitflags110Pre: Object.freeze({ offset: 3232, type: "u32" }),
    engineAnm2LayerNames: Object.freeze({ offset: 3236, type: "bytes", size: 256 }),
    engineAnm2ExtraNames: Object.freeze({ offset: 3492, type: "bytes", size: 256 }),
    globalTree4aba0BlobReady: Object.freeze({ offset: 3748, type: "u32" }),
    globalTree4aba0Count: Object.freeze({ offset: 3752, type: "u32" }),
    globalTree4aba0Begin: Object.freeze({ offset: 3756, type: "u32" }),
    globalTree4aba0End: Object.freeze({ offset: 3760, type: "u32" }),
    hudHistorySlotFlag0: Object.freeze({ offset: 4532, type: "u8" }),
    hudHistorySlotFlag1: Object.freeze({ offset: 4533, type: "u8" }),
    hudStatCountdownReady: Object.freeze({ offset: 4536, type: "u32" }),
    hudStatPlayerListBegin: Object.freeze({ offset: 4540, type: "u32" }),
    hudStatPlayerListEnd: Object.freeze({ offset: 4544, type: "u32" }),
    hudStatCountdown0: Object.freeze({ offset: 4548, type: "i32" }),
    hudStatCountdown1: Object.freeze({ offset: 4552, type: "i32" }),
    hudStatCountdown2: Object.freeze({ offset: 4556, type: "i32" }),
    hudStatCountdown3: Object.freeze({ offset: 4560, type: "i32" }),
    hudStatCountdown4: Object.freeze({ offset: 4564, type: "i32" }),
    hudStatCountdown5: Object.freeze({ offset: 4568, type: "i32" }),
    hudStatCountdown6: Object.freeze({ offset: 4572, type: "i32" }),
    hudStatCountdown7: Object.freeze({ offset: 4576, type: "i32" }),
    hudStatCountdown8: Object.freeze({ offset: 4580, type: "i32" }),
    hudStatCountdown9: Object.freeze({ offset: 4584, type: "i32" }),
    hudStatCountdown10: Object.freeze({ offset: 4588, type: "i32" }),
    hudStatCountdown11: Object.freeze({ offset: 4592, type: "i32" }),
    hudStatCountdown12: Object.freeze({ offset: 4596, type: "i32" }),
    hudStatCountdown13: Object.freeze({ offset: 4600, type: "i32" }),
    hudStatCountdown14: Object.freeze({ offset: 4604, type: "i32" }),
    hudStatCountdown15: Object.freeze({ offset: 4608, type: "i32" }),
    hudStatCountdown16: Object.freeze({ offset: 4612, type: "i32" }),
    hudStatCountdown17: Object.freeze({ offset: 4616, type: "i32" }),
    hudStatCountdown18: Object.freeze({ offset: 4620, type: "i32" }),
    hudStatCountdown19: Object.freeze({ offset: 4624, type: "i32" }),
    hudStatWalkBlobReady: Object.freeze({ offset: 4628, type: "u32" }),
    hudStatOwnerByte: Object.freeze({ offset: 4632, type: "u32" }),
    hudStatContainerBegin: Object.freeze({ offset: 4636, type: "u32" }),
    hudStatContainerEnd: Object.freeze({ offset: 4640, type: "u32" }),
    hudStatWalkProbe1: Object.freeze({ offset: 4644, type: "u32" }),
    hudStatWalkProbe2: Object.freeze({ offset: 4648, type: "u32" }),
    hudStatWalkProbe3: Object.freeze({ offset: 4652, type: "u32" }),
    hudStatGame1adb4: Object.freeze({ offset: 4656, type: "u32" }),
    hudStatSlotPtr0: Object.freeze({ offset: 4660, type: "u32" }),
    hudStatSlotPtr1: Object.freeze({ offset: 4664, type: "u32" }),
    hudStatSlot00Current: Object.freeze({ offset: 4668, type: "f32" }),
    hudStatSlot00Prev: Object.freeze({ offset: 4672, type: "f32" }),
    hudStatSlot00Threshold: Object.freeze({ offset: 4676, type: "f32" }),
    hudStatSlot00Timer: Object.freeze({ offset: 4680, type: "i32" }),
    hudStatSlot01Current: Object.freeze({ offset: 4684, type: "f32" }),
    hudStatSlot01Prev: Object.freeze({ offset: 4688, type: "f32" }),
    hudStatSlot01Threshold: Object.freeze({ offset: 4692, type: "f32" }),
    hudStatSlot01Timer: Object.freeze({ offset: 4696, type: "i32" }),
    hudStatSlot02Current: Object.freeze({ offset: 4700, type: "f32" }),
    hudStatSlot02Prev: Object.freeze({ offset: 4704, type: "f32" }),
    hudStatSlot02Threshold: Object.freeze({ offset: 4708, type: "f32" }),
    hudStatSlot02Timer: Object.freeze({ offset: 4712, type: "i32" }),
    hudStatSlot03Current: Object.freeze({ offset: 4716, type: "f32" }),
    hudStatSlot03Prev: Object.freeze({ offset: 4720, type: "f32" }),
    hudStatSlot03Threshold: Object.freeze({ offset: 4724, type: "f32" }),
    hudStatSlot03Timer: Object.freeze({ offset: 4728, type: "i32" }),
    hudStatSlot04Current: Object.freeze({ offset: 4732, type: "f32" }),
    hudStatSlot04Prev: Object.freeze({ offset: 4736, type: "f32" }),
    hudStatSlot04Threshold: Object.freeze({ offset: 4740, type: "f32" }),
    hudStatSlot04Timer: Object.freeze({ offset: 4744, type: "i32" }),
    hudStatSlot05Current: Object.freeze({ offset: 4748, type: "f32" }),
    hudStatSlot05Prev: Object.freeze({ offset: 4752, type: "f32" }),
    hudStatSlot05Threshold: Object.freeze({ offset: 4756, type: "f32" }),
    hudStatSlot05Timer: Object.freeze({ offset: 4760, type: "i32" }),
    hudStatSlot06Current: Object.freeze({ offset: 4764, type: "f32" }),
    hudStatSlot06Prev: Object.freeze({ offset: 4768, type: "f32" }),
    hudStatSlot06Threshold: Object.freeze({ offset: 4772, type: "f32" }),
    hudStatSlot06Timer: Object.freeze({ offset: 4776, type: "i32" }),
    hudStatSlot07Current: Object.freeze({ offset: 4780, type: "f32" }),
    hudStatSlot07Prev: Object.freeze({ offset: 4784, type: "f32" }),
    hudStatSlot07Threshold: Object.freeze({ offset: 4788, type: "f32" }),
    hudStatSlot07Timer: Object.freeze({ offset: 4792, type: "i32" }),
    hudStatSlot08Current: Object.freeze({ offset: 4796, type: "f32" }),
    hudStatSlot08Prev: Object.freeze({ offset: 4800, type: "f32" }),
    hudStatSlot08Threshold: Object.freeze({ offset: 4804, type: "f32" }),
    hudStatSlot08Timer: Object.freeze({ offset: 4808, type: "i32" }),
    hudStatSlot09Current: Object.freeze({ offset: 4812, type: "f32" }),
    hudStatSlot09Prev: Object.freeze({ offset: 4816, type: "f32" }),
    hudStatSlot09Threshold: Object.freeze({ offset: 4820, type: "f32" }),
    hudStatSlot09Timer: Object.freeze({ offset: 4824, type: "i32" }),
    hudStatSlot10Current: Object.freeze({ offset: 4828, type: "f32" }),
    hudStatSlot10Prev: Object.freeze({ offset: 4832, type: "f32" }),
    hudStatSlot10Threshold: Object.freeze({ offset: 4836, type: "f32" }),
    hudStatSlot10Timer: Object.freeze({ offset: 4840, type: "i32" }),
    hudStatSlot11Current: Object.freeze({ offset: 4844, type: "f32" }),
    hudStatSlot11Prev: Object.freeze({ offset: 4848, type: "f32" }),
    hudStatSlot11Threshold: Object.freeze({ offset: 4852, type: "f32" }),
    hudStatSlot11Timer: Object.freeze({ offset: 4856, type: "i32" }),
    hudStatSlot12Current: Object.freeze({ offset: 4860, type: "f32" }),
    hudStatSlot12Prev: Object.freeze({ offset: 4864, type: "f32" }),
    hudStatSlot12Threshold: Object.freeze({ offset: 4868, type: "f32" }),
    hudStatSlot12Timer: Object.freeze({ offset: 4872, type: "i32" }),
    hudStatSlot13Current: Object.freeze({ offset: 4876, type: "f32" }),
    hudStatSlot13Prev: Object.freeze({ offset: 4880, type: "f32" }),
    hudStatSlot13Threshold: Object.freeze({ offset: 4884, type: "f32" }),
    hudStatSlot13Timer: Object.freeze({ offset: 4888, type: "i32" }),
    hudStatSlot14Current: Object.freeze({ offset: 4892, type: "f32" }),
    hudStatSlot14Prev: Object.freeze({ offset: 4896, type: "f32" }),
    hudStatSlot14Threshold: Object.freeze({ offset: 4900, type: "f32" }),
    hudStatSlot14Timer: Object.freeze({ offset: 4904, type: "i32" }),
    hudStatSlot15Current: Object.freeze({ offset: 4908, type: "f32" }),
    hudStatSlot15Prev: Object.freeze({ offset: 4912, type: "f32" }),
    hudStatSlot15Threshold: Object.freeze({ offset: 4916, type: "f32" }),
    hudStatSlot15Timer: Object.freeze({ offset: 4920, type: "i32" }),
    hudStatSlot16Current: Object.freeze({ offset: 4924, type: "f32" }),
    hudStatSlot16Prev: Object.freeze({ offset: 4928, type: "f32" }),
    hudStatSlot16Threshold: Object.freeze({ offset: 4932, type: "f32" }),
    hudStatSlot16Timer: Object.freeze({ offset: 4936, type: "i32" }),
    hudStatSlot17Current: Object.freeze({ offset: 4940, type: "f32" }),
    hudStatSlot17Prev: Object.freeze({ offset: 4944, type: "f32" }),
    hudStatSlot17Threshold: Object.freeze({ offset: 4948, type: "f32" }),
    hudStatSlot17Timer: Object.freeze({ offset: 4952, type: "i32" }),
    hudStatSlot18Current: Object.freeze({ offset: 4956, type: "f32" }),
    hudStatSlot18Prev: Object.freeze({ offset: 4960, type: "f32" }),
    hudStatSlot18Threshold: Object.freeze({ offset: 4964, type: "f32" }),
    hudStatSlot18Timer: Object.freeze({ offset: 4968, type: "i32" }),
    hudStatSlot19Current: Object.freeze({ offset: 4972, type: "f32" }),
    hudStatSlot19Prev: Object.freeze({ offset: 4976, type: "f32" }),
    hudStatSlot19Threshold: Object.freeze({ offset: 4980, type: "f32" }),
    hudStatSlot19Timer: Object.freeze({ offset: 4984, type: "i32" }),
    hudStatPlayer0Ptr: Object.freeze({ offset: 4988, type: "u32" }),
    hudStatPlayer0F2c: Object.freeze({ offset: 4996, type: "u32" }),
    hudStatPlayer0F3bc: Object.freeze({ offset: 5000, type: "u32" }),
    hudStatPlayer0F13c0: Object.freeze({ offset: 5004, type: "u32" }),
    hudStatPlayer0F172: Object.freeze({ offset: 5008, type: "u32" }),
    hudStatPlayer0Other161c: Object.freeze({ offset: 5016, type: "u32" }),
    hudStatPlayer0F161c: Object.freeze({ offset: 5020, type: "u32" }),
    hudStatPlayer0F328: Object.freeze({ offset: 5024, type: "u32" }),
    hudStatPlayer0F1568: Object.freeze({ offset: 5028, type: "u32" }),
    hudStatPlayer0F1460: Object.freeze({ offset: 5032, type: "u32" }),
    hudStatPlayer0F1470: Object.freeze({ offset: 5036, type: "u32" }),
    hudStatPlayer0F1480: Object.freeze({ offset: 5040, type: "u32" }),
    hudStatPlayer0F1464: Object.freeze({ offset: 5044, type: "u32" }),
    hudStatPlayer0F156c: Object.freeze({ offset: 5048, type: "u32" }),
    hudStatPlayer1Ptr: Object.freeze({ offset: 5052, type: "u32" }),
    hudStatPlayer1F2c: Object.freeze({ offset: 5060, type: "u32" }),
    hudStatPlayer1F3bc: Object.freeze({ offset: 5064, type: "u32" }),
    hudStatPlayer1F13c0: Object.freeze({ offset: 5068, type: "u32" }),
    hudStatPlayer1F172: Object.freeze({ offset: 5072, type: "u32" }),
    hudStatPlayer1Other161c: Object.freeze({ offset: 5080, type: "u32" }),
    hudStatPlayer1F161c: Object.freeze({ offset: 5084, type: "u32" }),
    hudStatPlayer1F328: Object.freeze({ offset: 5088, type: "u32" }),
    hudStatPlayer1F1568: Object.freeze({ offset: 5092, type: "u32" }),
    hudStatPlayer1F1460: Object.freeze({ offset: 5096, type: "u32" }),
    hudStatPlayer1F1470: Object.freeze({ offset: 5100, type: "u32" }),
    hudStatPlayer1F1480: Object.freeze({ offset: 5104, type: "u32" }),
    hudStatPlayer1F1464: Object.freeze({ offset: 5108, type: "u32" }),
    hudStatPlayer1F156c: Object.freeze({ offset: 5112, type: "u32" }),
    hudStatPlayer2Ptr: Object.freeze({ offset: 5116, type: "u32" }),
    hudStatPlayer2F2c: Object.freeze({ offset: 5124, type: "u32" }),
    hudStatPlayer2F3bc: Object.freeze({ offset: 5128, type: "u32" }),
    hudStatPlayer2F13c0: Object.freeze({ offset: 5132, type: "u32" }),
    hudStatPlayer2F172: Object.freeze({ offset: 5136, type: "u32" }),
    hudStatPlayer2Other161c: Object.freeze({ offset: 5144, type: "u32" }),
    hudStatPlayer2F161c: Object.freeze({ offset: 5148, type: "u32" }),
    hudStatPlayer2F328: Object.freeze({ offset: 5152, type: "u32" }),
    hudStatPlayer2F1568: Object.freeze({ offset: 5156, type: "u32" }),
    hudStatPlayer2F1460: Object.freeze({ offset: 5160, type: "u32" }),
    hudStatPlayer2F1470: Object.freeze({ offset: 5164, type: "u32" }),
    hudStatPlayer2F1480: Object.freeze({ offset: 5168, type: "u32" }),
    hudStatPlayer2F1464: Object.freeze({ offset: 5172, type: "u32" }),
    hudStatPlayer2F156c: Object.freeze({ offset: 5176, type: "u32" }),
    hudStatPlayer3Ptr: Object.freeze({ offset: 5180, type: "u32" }),
    hudStatPlayer3F2c: Object.freeze({ offset: 5188, type: "u32" }),
    hudStatPlayer3F3bc: Object.freeze({ offset: 5192, type: "u32" }),
    hudStatPlayer3F13c0: Object.freeze({ offset: 5196, type: "u32" }),
    hudStatPlayer3F172: Object.freeze({ offset: 5200, type: "u32" }),
    hudStatPlayer3Other161c: Object.freeze({ offset: 5208, type: "u32" }),
    hudStatPlayer3F161c: Object.freeze({ offset: 5212, type: "u32" }),
    hudStatPlayer3F328: Object.freeze({ offset: 5216, type: "u32" }),
    hudStatPlayer3F1568: Object.freeze({ offset: 5220, type: "u32" }),
    hudStatPlayer3F1460: Object.freeze({ offset: 5224, type: "u32" }),
    hudStatPlayer3F1470: Object.freeze({ offset: 5228, type: "u32" }),
    hudStatPlayer3F1480: Object.freeze({ offset: 5232, type: "u32" }),
    hudStatPlayer3F1464: Object.freeze({ offset: 5236, type: "u32" }),
    hudStatPlayer3F156c: Object.freeze({ offset: 5240, type: "u32" }),
    hudStatPlayer4Ptr: Object.freeze({ offset: 5244, type: "u32" }),
    hudStatPlayer4F2c: Object.freeze({ offset: 5252, type: "u32" }),
    hudStatPlayer4F3bc: Object.freeze({ offset: 5256, type: "u32" }),
    hudStatPlayer4F13c0: Object.freeze({ offset: 5260, type: "u32" }),
    hudStatPlayer4F172: Object.freeze({ offset: 5264, type: "u32" }),
    hudStatPlayer4Other161c: Object.freeze({ offset: 5272, type: "u32" }),
    hudStatPlayer4F161c: Object.freeze({ offset: 5276, type: "u32" }),
    hudStatPlayer4F328: Object.freeze({ offset: 5280, type: "u32" }),
    hudStatPlayer4F1568: Object.freeze({ offset: 5284, type: "u32" }),
    hudStatPlayer4F1460: Object.freeze({ offset: 5288, type: "u32" }),
    hudStatPlayer4F1470: Object.freeze({ offset: 5292, type: "u32" }),
    hudStatPlayer4F1480: Object.freeze({ offset: 5296, type: "u32" }),
    hudStatPlayer4F1464: Object.freeze({ offset: 5300, type: "u32" }),
    hudStatPlayer4F156c: Object.freeze({ offset: 5304, type: "u32" }),
    hudStatPlayer5Ptr: Object.freeze({ offset: 5308, type: "u32" }),
    hudStatPlayer5F2c: Object.freeze({ offset: 5316, type: "u32" }),
    hudStatPlayer5F3bc: Object.freeze({ offset: 5320, type: "u32" }),
    hudStatPlayer5F13c0: Object.freeze({ offset: 5324, type: "u32" }),
    hudStatPlayer5F172: Object.freeze({ offset: 5328, type: "u32" }),
    hudStatPlayer5Other161c: Object.freeze({ offset: 5336, type: "u32" }),
    hudStatPlayer5F161c: Object.freeze({ offset: 5340, type: "u32" }),
    hudStatPlayer5F328: Object.freeze({ offset: 5344, type: "u32" }),
    hudStatPlayer5F1568: Object.freeze({ offset: 5348, type: "u32" }),
    hudStatPlayer5F1460: Object.freeze({ offset: 5352, type: "u32" }),
    hudStatPlayer5F1470: Object.freeze({ offset: 5356, type: "u32" }),
    hudStatPlayer5F1480: Object.freeze({ offset: 5360, type: "u32" }),
    hudStatPlayer5F1464: Object.freeze({ offset: 5364, type: "u32" }),
    hudStatPlayer5F156c: Object.freeze({ offset: 5368, type: "u32" }),
    hudStatPlayer6Ptr: Object.freeze({ offset: 5372, type: "u32" }),
    hudStatPlayer6F2c: Object.freeze({ offset: 5380, type: "u32" }),
    hudStatPlayer6F3bc: Object.freeze({ offset: 5384, type: "u32" }),
    hudStatPlayer6F13c0: Object.freeze({ offset: 5388, type: "u32" }),
    hudStatPlayer6F172: Object.freeze({ offset: 5392, type: "u32" }),
    hudStatPlayer6Other161c: Object.freeze({ offset: 5400, type: "u32" }),
    hudStatPlayer6F161c: Object.freeze({ offset: 5404, type: "u32" }),
    hudStatPlayer6F328: Object.freeze({ offset: 5408, type: "u32" }),
    hudStatPlayer6F1568: Object.freeze({ offset: 5412, type: "u32" }),
    hudStatPlayer6F1460: Object.freeze({ offset: 5416, type: "u32" }),
    hudStatPlayer6F1470: Object.freeze({ offset: 5420, type: "u32" }),
    hudStatPlayer6F1480: Object.freeze({ offset: 5424, type: "u32" }),
    hudStatPlayer6F1464: Object.freeze({ offset: 5428, type: "u32" }),
    hudStatPlayer6F156c: Object.freeze({ offset: 5432, type: "u32" }),
    hudStatPlayer7Ptr: Object.freeze({ offset: 5436, type: "u32" }),
    hudStatPlayer7F2c: Object.freeze({ offset: 5444, type: "u32" }),
    hudStatPlayer7F3bc: Object.freeze({ offset: 5448, type: "u32" }),
    hudStatPlayer7F13c0: Object.freeze({ offset: 5452, type: "u32" }),
    hudStatPlayer7F172: Object.freeze({ offset: 5456, type: "u32" }),
    hudStatPlayer7Other161c: Object.freeze({ offset: 5464, type: "u32" }),
    hudStatPlayer7F161c: Object.freeze({ offset: 5468, type: "u32" }),
    hudStatPlayer7F328: Object.freeze({ offset: 5472, type: "u32" }),
    hudStatPlayer7F1568: Object.freeze({ offset: 5476, type: "u32" }),
    hudStatPlayer7F1460: Object.freeze({ offset: 5480, type: "u32" }),
    hudStatPlayer7F1470: Object.freeze({ offset: 5484, type: "u32" }),
    hudStatPlayer7F1480: Object.freeze({ offset: 5488, type: "u32" }),
    hudStatPlayer7F1464: Object.freeze({ offset: 5492, type: "u32" }),
    hudStatPlayer7F156c: Object.freeze({ offset: 5496, type: "u32" }),
    opaque0092e300VoiceBlobReady: Object.freeze({ offset: 5500, type: "u32" }),
    opaque0092e300VoiceCount: Object.freeze({ offset: 5504, type: "u32" }),
    opaque0092e300FirstVoice0: Object.freeze({ offset: 5508, type: "i32" }),
    opaque0092e300FirstVoice1: Object.freeze({ offset: 5512, type: "i32" }),
    opaque0092e300FirstVoice2: Object.freeze({ offset: 5516, type: "i32" }),
    opaque0092e300FirstVoice3: Object.freeze({ offset: 5520, type: "i32" }),
    opaque0092e300FirstVoice4: Object.freeze({ offset: 5524, type: "i32" }),
    opaque0092e300FirstVoice5: Object.freeze({ offset: 5528, type: "i32" }),
    opaque0092e300FirstVoice6: Object.freeze({ offset: 5532, type: "i32" }),
    opaque0092e300FirstVoice7: Object.freeze({ offset: 5536, type: "i32" }),
    opaque0092e300Voice0ChannelNull: Object.freeze({ offset: 5540, type: "u32" }),
    opaque0092e300Voice0Pending09: Object.freeze({ offset: 5544, type: "u32" }),
    opaque0092e300Voice0ProbeFirst: Object.freeze({ offset: 5548, type: "u32" }),
    opaque0092e300Voice0ProbeSecond: Object.freeze({ offset: 5552, type: "u32" }),
    opaque0092e300Voice0ChannelNullThird: Object.freeze({ offset: 5556, type: "u32" }),
    opaque0092e300Voice0Loop08: Object.freeze({ offset: 5560, type: "u32" }),
    opaque0092e300Voice0Query44: Object.freeze({ offset: 5564, type: "u32" }),
    opaque0092e300Voice0ChannelNullFourth: Object.freeze({ offset: 5568, type: "u32" }),
    opaque0092e300Voice0VoicesReloaded: Object.freeze({ offset: 5572, type: "u32" }),
    opaque0092e300Voice1ChannelNull: Object.freeze({ offset: 5576, type: "u32" }),
    opaque0092e300Voice1Pending09: Object.freeze({ offset: 5580, type: "u32" }),
    opaque0092e300Voice1ProbeFirst: Object.freeze({ offset: 5584, type: "u32" }),
    opaque0092e300Voice1ProbeSecond: Object.freeze({ offset: 5588, type: "u32" }),
    opaque0092e300Voice1ChannelNullThird: Object.freeze({ offset: 5592, type: "u32" }),
    opaque0092e300Voice1Loop08: Object.freeze({ offset: 5596, type: "u32" }),
    opaque0092e300Voice1Query44: Object.freeze({ offset: 5600, type: "u32" }),
    opaque0092e300Voice1ChannelNullFourth: Object.freeze({ offset: 5604, type: "u32" }),
    opaque0092e300Voice1VoicesReloaded: Object.freeze({ offset: 5608, type: "u32" }),
    opaque0092e300Voice2ChannelNull: Object.freeze({ offset: 5612, type: "u32" }),
    opaque0092e300Voice2Pending09: Object.freeze({ offset: 5616, type: "u32" }),
    opaque0092e300Voice2ProbeFirst: Object.freeze({ offset: 5620, type: "u32" }),
    opaque0092e300Voice2ProbeSecond: Object.freeze({ offset: 5624, type: "u32" }),
    opaque0092e300Voice2ChannelNullThird: Object.freeze({ offset: 5628, type: "u32" }),
    opaque0092e300Voice2Loop08: Object.freeze({ offset: 5632, type: "u32" }),
    opaque0092e300Voice2Query44: Object.freeze({ offset: 5636, type: "u32" }),
    opaque0092e300Voice2ChannelNullFourth: Object.freeze({ offset: 5640, type: "u32" }),
    opaque0092e300Voice2VoicesReloaded: Object.freeze({ offset: 5644, type: "u32" }),
    opaque0092e300Voice3ChannelNull: Object.freeze({ offset: 5648, type: "u32" }),
    opaque0092e300Voice3Pending09: Object.freeze({ offset: 5652, type: "u32" }),
    opaque0092e300Voice3ProbeFirst: Object.freeze({ offset: 5656, type: "u32" }),
    opaque0092e300Voice3ProbeSecond: Object.freeze({ offset: 5660, type: "u32" }),
    opaque0092e300Voice3ChannelNullThird: Object.freeze({ offset: 5664, type: "u32" }),
    opaque0092e300Voice3Loop08: Object.freeze({ offset: 5668, type: "u32" }),
    opaque0092e300Voice3Query44: Object.freeze({ offset: 5672, type: "u32" }),
    opaque0092e300Voice3ChannelNullFourth: Object.freeze({ offset: 5676, type: "u32" }),
    opaque0092e300Voice3VoicesReloaded: Object.freeze({ offset: 5680, type: "u32" }),
    opaque0092e300Voice4ChannelNull: Object.freeze({ offset: 5684, type: "u32" }),
    opaque0092e300Voice4Pending09: Object.freeze({ offset: 5688, type: "u32" }),
    opaque0092e300Voice4ProbeFirst: Object.freeze({ offset: 5692, type: "u32" }),
    opaque0092e300Voice4ProbeSecond: Object.freeze({ offset: 5696, type: "u32" }),
    opaque0092e300Voice4ChannelNullThird: Object.freeze({ offset: 5700, type: "u32" }),
    opaque0092e300Voice4Loop08: Object.freeze({ offset: 5704, type: "u32" }),
    opaque0092e300Voice4Query44: Object.freeze({ offset: 5708, type: "u32" }),
    opaque0092e300Voice4ChannelNullFourth: Object.freeze({ offset: 5712, type: "u32" }),
    opaque0092e300Voice4VoicesReloaded: Object.freeze({ offset: 5716, type: "u32" }),
    opaque0092e300Voice5ChannelNull: Object.freeze({ offset: 5720, type: "u32" }),
    opaque0092e300Voice5Pending09: Object.freeze({ offset: 5724, type: "u32" }),
    opaque0092e300Voice5ProbeFirst: Object.freeze({ offset: 5728, type: "u32" }),
    opaque0092e300Voice5ProbeSecond: Object.freeze({ offset: 5732, type: "u32" }),
    opaque0092e300Voice5ChannelNullThird: Object.freeze({ offset: 5736, type: "u32" }),
    opaque0092e300Voice5Loop08: Object.freeze({ offset: 5740, type: "u32" }),
    opaque0092e300Voice5Query44: Object.freeze({ offset: 5744, type: "u32" }),
    opaque0092e300Voice5ChannelNullFourth: Object.freeze({ offset: 5748, type: "u32" }),
    opaque0092e300Voice5VoicesReloaded: Object.freeze({ offset: 5752, type: "u32" }),
    opaque0092e300Voice6ChannelNull: Object.freeze({ offset: 5756, type: "u32" }),
    opaque0092e300Voice6Pending09: Object.freeze({ offset: 5760, type: "u32" }),
    opaque0092e300Voice6ProbeFirst: Object.freeze({ offset: 5764, type: "u32" }),
    opaque0092e300Voice6ProbeSecond: Object.freeze({ offset: 5768, type: "u32" }),
    opaque0092e300Voice6ChannelNullThird: Object.freeze({ offset: 5772, type: "u32" }),
    opaque0092e300Voice6Loop08: Object.freeze({ offset: 5776, type: "u32" }),
    opaque0092e300Voice6Query44: Object.freeze({ offset: 5780, type: "u32" }),
    opaque0092e300Voice6ChannelNullFourth: Object.freeze({ offset: 5784, type: "u32" }),
    opaque0092e300Voice6VoicesReloaded: Object.freeze({ offset: 5788, type: "u32" }),
    opaque0092e300Voice7ChannelNull: Object.freeze({ offset: 5792, type: "u32" }),
    opaque0092e300Voice7Pending09: Object.freeze({ offset: 5796, type: "u32" }),
    opaque0092e300Voice7ProbeFirst: Object.freeze({ offset: 5800, type: "u32" }),
    opaque0092e300Voice7ProbeSecond: Object.freeze({ offset: 5804, type: "u32" }),
    opaque0092e300Voice7ChannelNullThird: Object.freeze({ offset: 5808, type: "u32" }),
    opaque0092e300Voice7Loop08: Object.freeze({ offset: 5812, type: "u32" }),
    opaque0092e300Voice7Query44: Object.freeze({ offset: 5816, type: "u32" }),
    opaque0092e300Voice7ChannelNullFourth: Object.freeze({ offset: 5820, type: "u32" }),
    opaque0092e300Voice7VoicesReloaded: Object.freeze({ offset: 5824, type: "u32" }),
    opaque0092e300Voice8ChannelNull: Object.freeze({ offset: 5828, type: "u32" }),
    opaque0092e300Voice8Pending09: Object.freeze({ offset: 5832, type: "u32" }),
    opaque0092e300Voice8ProbeFirst: Object.freeze({ offset: 5836, type: "u32" }),
    opaque0092e300Voice8ProbeSecond: Object.freeze({ offset: 5840, type: "u32" }),
    opaque0092e300Voice8ChannelNullThird: Object.freeze({ offset: 5844, type: "u32" }),
    opaque0092e300Voice8Loop08: Object.freeze({ offset: 5848, type: "u32" }),
    opaque0092e300Voice8Query44: Object.freeze({ offset: 5852, type: "u32" }),
    opaque0092e300Voice8ChannelNullFourth: Object.freeze({ offset: 5856, type: "u32" }),
    opaque0092e300Voice8VoicesReloaded: Object.freeze({ offset: 5860, type: "u32" }),
    opaque0092e300Voice9ChannelNull: Object.freeze({ offset: 5864, type: "u32" }),
    opaque0092e300Voice9Pending09: Object.freeze({ offset: 5868, type: "u32" }),
    opaque0092e300Voice9ProbeFirst: Object.freeze({ offset: 5872, type: "u32" }),
    opaque0092e300Voice9ProbeSecond: Object.freeze({ offset: 5876, type: "u32" }),
    opaque0092e300Voice9ChannelNullThird: Object.freeze({ offset: 5880, type: "u32" }),
    opaque0092e300Voice9Loop08: Object.freeze({ offset: 5884, type: "u32" }),
    opaque0092e300Voice9Query44: Object.freeze({ offset: 5888, type: "u32" }),
    opaque0092e300Voice9ChannelNullFourth: Object.freeze({ offset: 5892, type: "u32" }),
    opaque0092e300Voice9VoicesReloaded: Object.freeze({ offset: 5896, type: "u32" }),
    opaque0092e300Voice10ChannelNull: Object.freeze({ offset: 5900, type: "u32" }),
    opaque0092e300Voice10Pending09: Object.freeze({ offset: 5904, type: "u32" }),
    opaque0092e300Voice10ProbeFirst: Object.freeze({ offset: 5908, type: "u32" }),
    opaque0092e300Voice10ProbeSecond: Object.freeze({ offset: 5912, type: "u32" }),
    opaque0092e300Voice10ChannelNullThird: Object.freeze({ offset: 5916, type: "u32" }),
    opaque0092e300Voice10Loop08: Object.freeze({ offset: 5920, type: "u32" }),
    opaque0092e300Voice10Query44: Object.freeze({ offset: 5924, type: "u32" }),
    opaque0092e300Voice10ChannelNullFourth: Object.freeze({ offset: 5928, type: "u32" }),
    opaque0092e300Voice10VoicesReloaded: Object.freeze({ offset: 5932, type: "u32" }),
    opaque0092e300Voice11ChannelNull: Object.freeze({ offset: 5936, type: "u32" }),
    opaque0092e300Voice11Pending09: Object.freeze({ offset: 5940, type: "u32" }),
    opaque0092e300Voice11ProbeFirst: Object.freeze({ offset: 5944, type: "u32" }),
    opaque0092e300Voice11ProbeSecond: Object.freeze({ offset: 5948, type: "u32" }),
    opaque0092e300Voice11ChannelNullThird: Object.freeze({ offset: 5952, type: "u32" }),
    opaque0092e300Voice11Loop08: Object.freeze({ offset: 5956, type: "u32" }),
    opaque0092e300Voice11Query44: Object.freeze({ offset: 5960, type: "u32" }),
    opaque0092e300Voice11ChannelNullFourth: Object.freeze({ offset: 5964, type: "u32" }),
    opaque0092e300Voice11VoicesReloaded: Object.freeze({ offset: 5968, type: "u32" }),
    opaque0092e300Voice12ChannelNull: Object.freeze({ offset: 5972, type: "u32" }),
    opaque0092e300Voice12Pending09: Object.freeze({ offset: 5976, type: "u32" }),
    opaque0092e300Voice12ProbeFirst: Object.freeze({ offset: 5980, type: "u32" }),
    opaque0092e300Voice12ProbeSecond: Object.freeze({ offset: 5984, type: "u32" }),
    opaque0092e300Voice12ChannelNullThird: Object.freeze({ offset: 5988, type: "u32" }),
    opaque0092e300Voice12Loop08: Object.freeze({ offset: 5992, type: "u32" }),
    opaque0092e300Voice12Query44: Object.freeze({ offset: 5996, type: "u32" }),
    opaque0092e300Voice12ChannelNullFourth: Object.freeze({ offset: 6000, type: "u32" }),
    opaque0092e300Voice12VoicesReloaded: Object.freeze({ offset: 6004, type: "u32" }),
    opaque0092e300Voice13ChannelNull: Object.freeze({ offset: 6008, type: "u32" }),
    opaque0092e300Voice13Pending09: Object.freeze({ offset: 6012, type: "u32" }),
    opaque0092e300Voice13ProbeFirst: Object.freeze({ offset: 6016, type: "u32" }),
    opaque0092e300Voice13ProbeSecond: Object.freeze({ offset: 6020, type: "u32" }),
    opaque0092e300Voice13ChannelNullThird: Object.freeze({ offset: 6024, type: "u32" }),
    opaque0092e300Voice13Loop08: Object.freeze({ offset: 6028, type: "u32" }),
    opaque0092e300Voice13Query44: Object.freeze({ offset: 6032, type: "u32" }),
    opaque0092e300Voice13ChannelNullFourth: Object.freeze({ offset: 6036, type: "u32" }),
    opaque0092e300Voice13VoicesReloaded: Object.freeze({ offset: 6040, type: "u32" }),
    opaque0092e300Voice14ChannelNull: Object.freeze({ offset: 6044, type: "u32" }),
    opaque0092e300Voice14Pending09: Object.freeze({ offset: 6048, type: "u32" }),
    opaque0092e300Voice14ProbeFirst: Object.freeze({ offset: 6052, type: "u32" }),
    opaque0092e300Voice14ProbeSecond: Object.freeze({ offset: 6056, type: "u32" }),
    opaque0092e300Voice14ChannelNullThird: Object.freeze({ offset: 6060, type: "u32" }),
    opaque0092e300Voice14Loop08: Object.freeze({ offset: 6064, type: "u32" }),
    opaque0092e300Voice14Query44: Object.freeze({ offset: 6068, type: "u32" }),
    opaque0092e300Voice14ChannelNullFourth: Object.freeze({ offset: 6072, type: "u32" }),
    opaque0092e300Voice14VoicesReloaded: Object.freeze({ offset: 6076, type: "u32" }),
    opaque0092e300Voice15ChannelNull: Object.freeze({ offset: 6080, type: "u32" }),
    opaque0092e300Voice15Pending09: Object.freeze({ offset: 6084, type: "u32" }),
    opaque0092e300Voice15ProbeFirst: Object.freeze({ offset: 6088, type: "u32" }),
    opaque0092e300Voice15ProbeSecond: Object.freeze({ offset: 6092, type: "u32" }),
    opaque0092e300Voice15ChannelNullThird: Object.freeze({ offset: 6096, type: "u32" }),
    opaque0092e300Voice15Loop08: Object.freeze({ offset: 6100, type: "u32" }),
    opaque0092e300Voice15Query44: Object.freeze({ offset: 6104, type: "u32" }),
    opaque0092e300Voice15ChannelNullFourth: Object.freeze({ offset: 6108, type: "u32" }),
    opaque0092e300Voice15VoicesReloaded: Object.freeze({ offset: 6112, type: "u32" }),
    opaque0092e300Voice16ChannelNull: Object.freeze({ offset: 6116, type: "u32" }),
    opaque0092e300Voice16Pending09: Object.freeze({ offset: 6120, type: "u32" }),
    opaque0092e300Voice16ProbeFirst: Object.freeze({ offset: 6124, type: "u32" }),
    opaque0092e300Voice16ProbeSecond: Object.freeze({ offset: 6128, type: "u32" }),
    opaque0092e300Voice16ChannelNullThird: Object.freeze({ offset: 6132, type: "u32" }),
    opaque0092e300Voice16Loop08: Object.freeze({ offset: 6136, type: "u32" }),
    opaque0092e300Voice16Query44: Object.freeze({ offset: 6140, type: "u32" }),
    opaque0092e300Voice16ChannelNullFourth: Object.freeze({ offset: 6144, type: "u32" }),
    opaque0092e300Voice16VoicesReloaded: Object.freeze({ offset: 6148, type: "u32" }),
    opaque0092e300Voice17ChannelNull: Object.freeze({ offset: 6152, type: "u32" }),
    opaque0092e300Voice17Pending09: Object.freeze({ offset: 6156, type: "u32" }),
    opaque0092e300Voice17ProbeFirst: Object.freeze({ offset: 6160, type: "u32" }),
    opaque0092e300Voice17ProbeSecond: Object.freeze({ offset: 6164, type: "u32" }),
    opaque0092e300Voice17ChannelNullThird: Object.freeze({ offset: 6168, type: "u32" }),
    opaque0092e300Voice17Loop08: Object.freeze({ offset: 6172, type: "u32" }),
    opaque0092e300Voice17Query44: Object.freeze({ offset: 6176, type: "u32" }),
    opaque0092e300Voice17ChannelNullFourth: Object.freeze({ offset: 6180, type: "u32" }),
    opaque0092e300Voice17VoicesReloaded: Object.freeze({ offset: 6184, type: "u32" }),
    opaque0092e300Voice18ChannelNull: Object.freeze({ offset: 6188, type: "u32" }),
    opaque0092e300Voice18Pending09: Object.freeze({ offset: 6192, type: "u32" }),
    opaque0092e300Voice18ProbeFirst: Object.freeze({ offset: 6196, type: "u32" }),
    opaque0092e300Voice18ProbeSecond: Object.freeze({ offset: 6200, type: "u32" }),
    opaque0092e300Voice18ChannelNullThird: Object.freeze({ offset: 6204, type: "u32" }),
    opaque0092e300Voice18Loop08: Object.freeze({ offset: 6208, type: "u32" }),
    opaque0092e300Voice18Query44: Object.freeze({ offset: 6212, type: "u32" }),
    opaque0092e300Voice18ChannelNullFourth: Object.freeze({ offset: 6216, type: "u32" }),
    opaque0092e300Voice18VoicesReloaded: Object.freeze({ offset: 6220, type: "u32" }),
    opaque0092e300Voice19ChannelNull: Object.freeze({ offset: 6224, type: "u32" }),
    opaque0092e300Voice19Pending09: Object.freeze({ offset: 6228, type: "u32" }),
    opaque0092e300Voice19ProbeFirst: Object.freeze({ offset: 6232, type: "u32" }),
    opaque0092e300Voice19ProbeSecond: Object.freeze({ offset: 6236, type: "u32" }),
    opaque0092e300Voice19ChannelNullThird: Object.freeze({ offset: 6240, type: "u32" }),
    opaque0092e300Voice19Loop08: Object.freeze({ offset: 6244, type: "u32" }),
    opaque0092e300Voice19Query44: Object.freeze({ offset: 6248, type: "u32" }),
    opaque0092e300Voice19ChannelNullFourth: Object.freeze({ offset: 6252, type: "u32" }),
    opaque0092e300Voice19VoicesReloaded: Object.freeze({ offset: 6256, type: "u32" }),
    opaque0092e300Voice20ChannelNull: Object.freeze({ offset: 6260, type: "u32" }),
    opaque0092e300Voice20Pending09: Object.freeze({ offset: 6264, type: "u32" }),
    opaque0092e300Voice20ProbeFirst: Object.freeze({ offset: 6268, type: "u32" }),
    opaque0092e300Voice20ProbeSecond: Object.freeze({ offset: 6272, type: "u32" }),
    opaque0092e300Voice20ChannelNullThird: Object.freeze({ offset: 6276, type: "u32" }),
    opaque0092e300Voice20Loop08: Object.freeze({ offset: 6280, type: "u32" }),
    opaque0092e300Voice20Query44: Object.freeze({ offset: 6284, type: "u32" }),
    opaque0092e300Voice20ChannelNullFourth: Object.freeze({ offset: 6288, type: "u32" }),
    opaque0092e300Voice20VoicesReloaded: Object.freeze({ offset: 6292, type: "u32" }),
    opaque0092e300Voice21ChannelNull: Object.freeze({ offset: 6296, type: "u32" }),
    opaque0092e300Voice21Pending09: Object.freeze({ offset: 6300, type: "u32" }),
    opaque0092e300Voice21ProbeFirst: Object.freeze({ offset: 6304, type: "u32" }),
    opaque0092e300Voice21ProbeSecond: Object.freeze({ offset: 6308, type: "u32" }),
    opaque0092e300Voice21ChannelNullThird: Object.freeze({ offset: 6312, type: "u32" }),
    opaque0092e300Voice21Loop08: Object.freeze({ offset: 6316, type: "u32" }),
    opaque0092e300Voice21Query44: Object.freeze({ offset: 6320, type: "u32" }),
    opaque0092e300Voice21ChannelNullFourth: Object.freeze({ offset: 6324, type: "u32" }),
    opaque0092e300Voice21VoicesReloaded: Object.freeze({ offset: 6328, type: "u32" }),
    opaque0092e300Voice22ChannelNull: Object.freeze({ offset: 6332, type: "u32" }),
    opaque0092e300Voice22Pending09: Object.freeze({ offset: 6336, type: "u32" }),
    opaque0092e300Voice22ProbeFirst: Object.freeze({ offset: 6340, type: "u32" }),
    opaque0092e300Voice22ProbeSecond: Object.freeze({ offset: 6344, type: "u32" }),
    opaque0092e300Voice22ChannelNullThird: Object.freeze({ offset: 6348, type: "u32" }),
    opaque0092e300Voice22Loop08: Object.freeze({ offset: 6352, type: "u32" }),
    opaque0092e300Voice22Query44: Object.freeze({ offset: 6356, type: "u32" }),
    opaque0092e300Voice22ChannelNullFourth: Object.freeze({ offset: 6360, type: "u32" }),
    opaque0092e300Voice22VoicesReloaded: Object.freeze({ offset: 6364, type: "u32" }),
    opaque0092e300Voice23ChannelNull: Object.freeze({ offset: 6368, type: "u32" }),
    opaque0092e300Voice23Pending09: Object.freeze({ offset: 6372, type: "u32" }),
    opaque0092e300Voice23ProbeFirst: Object.freeze({ offset: 6376, type: "u32" }),
    opaque0092e300Voice23ProbeSecond: Object.freeze({ offset: 6380, type: "u32" }),
    opaque0092e300Voice23ChannelNullThird: Object.freeze({ offset: 6384, type: "u32" }),
    opaque0092e300Voice23Loop08: Object.freeze({ offset: 6388, type: "u32" }),
    opaque0092e300Voice23Query44: Object.freeze({ offset: 6392, type: "u32" }),
    opaque0092e300Voice23ChannelNullFourth: Object.freeze({ offset: 6396, type: "u32" }),
    opaque0092e300Voice23VoicesReloaded: Object.freeze({ offset: 6400, type: "u32" }),
    opaque0092e300Voice24ChannelNull: Object.freeze({ offset: 6404, type: "u32" }),
    opaque0092e300Voice24Pending09: Object.freeze({ offset: 6408, type: "u32" }),
    opaque0092e300Voice24ProbeFirst: Object.freeze({ offset: 6412, type: "u32" }),
    opaque0092e300Voice24ProbeSecond: Object.freeze({ offset: 6416, type: "u32" }),
    opaque0092e300Voice24ChannelNullThird: Object.freeze({ offset: 6420, type: "u32" }),
    opaque0092e300Voice24Loop08: Object.freeze({ offset: 6424, type: "u32" }),
    opaque0092e300Voice24Query44: Object.freeze({ offset: 6428, type: "u32" }),
    opaque0092e300Voice24ChannelNullFourth: Object.freeze({ offset: 6432, type: "u32" }),
    opaque0092e300Voice24VoicesReloaded: Object.freeze({ offset: 6436, type: "u32" }),
    opaque0092e300Voice25ChannelNull: Object.freeze({ offset: 6440, type: "u32" }),
    opaque0092e300Voice25Pending09: Object.freeze({ offset: 6444, type: "u32" }),
    opaque0092e300Voice25ProbeFirst: Object.freeze({ offset: 6448, type: "u32" }),
    opaque0092e300Voice25ProbeSecond: Object.freeze({ offset: 6452, type: "u32" }),
    opaque0092e300Voice25ChannelNullThird: Object.freeze({ offset: 6456, type: "u32" }),
    opaque0092e300Voice25Loop08: Object.freeze({ offset: 6460, type: "u32" }),
    opaque0092e300Voice25Query44: Object.freeze({ offset: 6464, type: "u32" }),
    opaque0092e300Voice25ChannelNullFourth: Object.freeze({ offset: 6468, type: "u32" }),
    opaque0092e300Voice25VoicesReloaded: Object.freeze({ offset: 6472, type: "u32" }),
    opaque0092e300Voice26ChannelNull: Object.freeze({ offset: 6476, type: "u32" }),
    opaque0092e300Voice26Pending09: Object.freeze({ offset: 6480, type: "u32" }),
    opaque0092e300Voice26ProbeFirst: Object.freeze({ offset: 6484, type: "u32" }),
    opaque0092e300Voice26ProbeSecond: Object.freeze({ offset: 6488, type: "u32" }),
    opaque0092e300Voice26ChannelNullThird: Object.freeze({ offset: 6492, type: "u32" }),
    opaque0092e300Voice26Loop08: Object.freeze({ offset: 6496, type: "u32" }),
    opaque0092e300Voice26Query44: Object.freeze({ offset: 6500, type: "u32" }),
    opaque0092e300Voice26ChannelNullFourth: Object.freeze({ offset: 6504, type: "u32" }),
    opaque0092e300Voice26VoicesReloaded: Object.freeze({ offset: 6508, type: "u32" }),
    opaque0092e300Voice27ChannelNull: Object.freeze({ offset: 6512, type: "u32" }),
    opaque0092e300Voice27Pending09: Object.freeze({ offset: 6516, type: "u32" }),
    opaque0092e300Voice27ProbeFirst: Object.freeze({ offset: 6520, type: "u32" }),
    opaque0092e300Voice27ProbeSecond: Object.freeze({ offset: 6524, type: "u32" }),
    opaque0092e300Voice27ChannelNullThird: Object.freeze({ offset: 6528, type: "u32" }),
    opaque0092e300Voice27Loop08: Object.freeze({ offset: 6532, type: "u32" }),
    opaque0092e300Voice27Query44: Object.freeze({ offset: 6536, type: "u32" }),
    opaque0092e300Voice27ChannelNullFourth: Object.freeze({ offset: 6540, type: "u32" }),
    opaque0092e300Voice27VoicesReloaded: Object.freeze({ offset: 6544, type: "u32" }),
    opaque0092e300Voice28ChannelNull: Object.freeze({ offset: 6548, type: "u32" }),
    opaque0092e300Voice28Pending09: Object.freeze({ offset: 6552, type: "u32" }),
    opaque0092e300Voice28ProbeFirst: Object.freeze({ offset: 6556, type: "u32" }),
    opaque0092e300Voice28ProbeSecond: Object.freeze({ offset: 6560, type: "u32" }),
    opaque0092e300Voice28ChannelNullThird: Object.freeze({ offset: 6564, type: "u32" }),
    opaque0092e300Voice28Loop08: Object.freeze({ offset: 6568, type: "u32" }),
    opaque0092e300Voice28Query44: Object.freeze({ offset: 6572, type: "u32" }),
    opaque0092e300Voice28ChannelNullFourth: Object.freeze({ offset: 6576, type: "u32" }),
    opaque0092e300Voice28VoicesReloaded: Object.freeze({ offset: 6580, type: "u32" }),
    opaque0092e300Voice29ChannelNull: Object.freeze({ offset: 6584, type: "u32" }),
    opaque0092e300Voice29Pending09: Object.freeze({ offset: 6588, type: "u32" }),
    opaque0092e300Voice29ProbeFirst: Object.freeze({ offset: 6592, type: "u32" }),
    opaque0092e300Voice29ProbeSecond: Object.freeze({ offset: 6596, type: "u32" }),
    opaque0092e300Voice29ChannelNullThird: Object.freeze({ offset: 6600, type: "u32" }),
    opaque0092e300Voice29Loop08: Object.freeze({ offset: 6604, type: "u32" }),
    opaque0092e300Voice29Query44: Object.freeze({ offset: 6608, type: "u32" }),
    opaque0092e300Voice29ChannelNullFourth: Object.freeze({ offset: 6612, type: "u32" }),
    opaque0092e300Voice29VoicesReloaded: Object.freeze({ offset: 6616, type: "u32" }),
    opaque0092e300Voice30ChannelNull: Object.freeze({ offset: 6620, type: "u32" }),
    opaque0092e300Voice30Pending09: Object.freeze({ offset: 6624, type: "u32" }),
    opaque0092e300Voice30ProbeFirst: Object.freeze({ offset: 6628, type: "u32" }),
    opaque0092e300Voice30ProbeSecond: Object.freeze({ offset: 6632, type: "u32" }),
    opaque0092e300Voice30ChannelNullThird: Object.freeze({ offset: 6636, type: "u32" }),
    opaque0092e300Voice30Loop08: Object.freeze({ offset: 6640, type: "u32" }),
    opaque0092e300Voice30Query44: Object.freeze({ offset: 6644, type: "u32" }),
    opaque0092e300Voice30ChannelNullFourth: Object.freeze({ offset: 6648, type: "u32" }),
    opaque0092e300Voice30VoicesReloaded: Object.freeze({ offset: 6652, type: "u32" }),
    opaque0092e300Voice31ChannelNull: Object.freeze({ offset: 6656, type: "u32" }),
    opaque0092e300Voice31Pending09: Object.freeze({ offset: 6660, type: "u32" }),
    opaque0092e300Voice31ProbeFirst: Object.freeze({ offset: 6664, type: "u32" }),
    opaque0092e300Voice31ProbeSecond: Object.freeze({ offset: 6668, type: "u32" }),
    opaque0092e300Voice31ChannelNullThird: Object.freeze({ offset: 6672, type: "u32" }),
    opaque0092e300Voice31Loop08: Object.freeze({ offset: 6676, type: "u32" }),
    opaque0092e300Voice31Query44: Object.freeze({ offset: 6680, type: "u32" }),
    opaque0092e300Voice31ChannelNullFourth: Object.freeze({ offset: 6684, type: "u32" }),
    opaque0092e300Voice31VoicesReloaded: Object.freeze({ offset: 6688, type: "u32" }),
    opaque0092f1c0Ready: Object.freeze({ offset: 6696, type: "u32" }),
    opaque0092f1c0Mode: Object.freeze({ offset: 6700, type: "u32" }),
    opaque0092f1c0Counter: Object.freeze({ offset: 6704, type: "u32" }),
    opaque008318a0Ready: Object.freeze({ offset: 6708, type: "u32" }),
    opaque008318a0Mode: Object.freeze({ offset: 6712, type: "u32" }),
    soundGroupWalkReady: Object.freeze({ offset: 6716, type: "u32" }),
    frameOpaque4212c0PairReady: Object.freeze({ offset: 6720, type: "u32" }),
    frameOpaque4212c0Field5c: Object.freeze({ offset: 6724, type: "u32" }),
    frameOpaque4212c0Flag6c: Object.freeze({ offset: 6728, type: "u32" }),
    frameOpaque4212c0ProbeReady: Object.freeze({ offset: 6732, type: "u32" }),
    frameOpaque4212c0ProbeResolved: Object.freeze({ offset: 6736, type: "u32" }),
    frameOpaque4212c0Add0Field4: Object.freeze({ offset: 6740, type: "u32" }),
    frameOpaque4212c0Add0ListCount: Object.freeze({ offset: 6744, type: "u32" }),
    frameOpaque4212c0Add0MatchIndex: Object.freeze({ offset: 6748, type: "i32" }),
    frameOpaque4212c0Add0Bitfield18: Object.freeze({ offset: 6752, type: "u32" }),
    frameOpaque98dba0WalkReady: Object.freeze({ offset: 6756, type: "u32" }),
    frameOpaque98dba0WalkBegin: Object.freeze({ offset: 6760, type: "u32" }),
    frameOpaque98dba0WalkEnd: Object.freeze({ offset: 6764, type: "u32" }),
    state24ecc8ef990JoinReady: Object.freeze({ offset: 6768, type: "u32" }),
    state24ecc8ef990JoinProbe: Object.freeze({ offset: 6772, type: "u32" }),
    state24ecc8ef990JoinIdx8: Object.freeze({ offset: 6776, type: "u32" }),
    state24ecc8ef990956780Game: Object.freeze({ offset: 6780, type: "u32" }),
    state24ecc8ef990956780NodeBd: Object.freeze({ offset: 6784, type: "u32" }),
    state24ecc8ef990956780NodeF10: Object.freeze({ offset: 6788, type: "u32" }),
    state24ecc8ef990956780NodePtr: Object.freeze({ offset: 6792, type: "u32" }),
    state24ecc8ef990956780Sentinel: Object.freeze({ offset: 6796, type: "u32" }),
    /* ABI v95 (record idx 32, FUN_00956110 phone-home probe capture; wave-29
       merge REBIND): the 18 probe-sample lanes at the module offsets
       6800..6868 (was stale 7108..7176 until the wave-29 merge — the module
       read zeros). vtable_results[8] flattened as VtableResult0..7. */
    frameOpaque98dba0956110Ready: Object.freeze({ offset: 6800, type: "u32" }),
    frameOpaque98dba0956110ManagerMode: Object.freeze({ offset: 6804, type: "u32" }),
    frameOpaque98dba0956110GlobalC71690: Object.freeze({ offset: 6808, type: "u32" }),
    frameOpaque98dba0956110MpBegin: Object.freeze({ offset: 6812, type: "u32" }),
    frameOpaque98dba0956110MpEnd: Object.freeze({ offset: 6816, type: "u32" }),
    frameOpaque98dba0956110Arg2: Object.freeze({ offset: 6820, type: "u32" }),
    frameOpaque98dba0956110NetHostOk: Object.freeze({ offset: 6824, type: "u32" }),
    frameOpaque98dba0956110NetOutByte: Object.freeze({ offset: 6828, type: "u32" }),
    frameOpaque98dba0956110VtableCount: Object.freeze({ offset: 6832, type: "u32" }),
    frameOpaque98dba0956110VtableResult0: Object.freeze({ offset: 6836, type: "u32" }),
    frameOpaque98dba0956110VtableResult1: Object.freeze({ offset: 6840, type: "u32" }),
    frameOpaque98dba0956110VtableResult2: Object.freeze({ offset: 6844, type: "u32" }),
    frameOpaque98dba0956110VtableResult3: Object.freeze({ offset: 6848, type: "u32" }),
    frameOpaque98dba0956110VtableResult4: Object.freeze({ offset: 6852, type: "u32" }),
    frameOpaque98dba0956110VtableResult5: Object.freeze({ offset: 6856, type: "u32" }),
    frameOpaque98dba0956110VtableResult6: Object.freeze({ offset: 6860, type: "u32" }),
    frameOpaque98dba0956110VtableResult7: Object.freeze({ offset: 6864, type: "u32" }),
    frameOpaque98dba0956110GeneralResult: Object.freeze({ offset: 6868, type: "u32" }),
    /* ABI v95 (record idx 3, 0x0092f1c0 gate-1ba78 receiver captures; wave-29
       merge REBIND-conifrmed): limit = [recv+8] (PE 0x92fa0c), field_14 =
       [recv+0x14] (PE 0x92fe51) — module offsets 6872/6876. */
    opaque0092f1c0Limit: Object.freeze({ offset: 6872, type: "u32" }),
    opaque0092f1c0Field14: Object.freeze({ offset: 6876, type: "u32" }),
    /* ABI v101 (record idx 3, case-1 leaf-5 narrow): [Game+0] sampled AT THE
       0x0092f1c0 boundary (PE 0x0092fe5b mov ecx,[0xc71678]; 0x0092fe61 call
       0x0074f090, which reads [ecx]). Site-local on purpose — record 23's
       clearPathGameMode0 is the same guest dword but sampled at a different
       point in the tick, and the b16 lane sets the precedent of capturing
       [Game+0] per site. Default 0 is SAFE and EXACT: 0x74f090 computes
       (u32)(mode-1)<=5, so mode 0 gives 0xffffffff>5 -> AL=0 -> host, which
       is the pre-wire behaviour AND what the machine does for mode 0. */
    opaque0092f1c0GameType0: Object.freeze({ offset: 23696, type: "u32" }),
    clearPathGameMode0: Object.freeze({ offset: 7888, type: "u32" }),
    b3b7FcoResult: Object.freeze({ offset: 8008, type: "u32" }),
    b3b7Hce2a5Hit: Object.freeze({ offset: 8012, type: "u32" }),
    b3b7RoomByte1: Object.freeze({ offset: 8016, type: "u32" }),
    b3b7DescSeed5c: Object.freeze({ offset: 8020, type: "u32" }),
    b3b7LookupCount: Object.freeze({ offset: 8024, type: "u32" }),
    b3b7LookupResultByte: Object.freeze({ offset: 8028, type: "u32" }),
    b3b7MgrByte1b4: Object.freeze({ offset: 8032, type: "u32" }),
    b3b7MgrByte2bf: Object.freeze({ offset: 8036, type: "u32" }),
    b3b7MgrByte1ba: Object.freeze({ offset: 8040, type: "u32" }),
    b3b7MgrMode8: Object.freeze({ offset: 8044, type: "u32" }),
    b3b7GameNonnull: Object.freeze({ offset: 8048, type: "u32" }),
    b3b7Game26630: Object.freeze({ offset: 8052, type: "u32" }),
    b3b7GameByte26589: Object.freeze({ offset: 8056, type: "u32" }),
    b3b7RoomByte0: Object.freeze({ offset: 8060, type: "u32" }),
    b3b7Game26584: Object.freeze({ offset: 8064, type: "u32" }),
    b3b7Game26614: Object.freeze({ offset: 8068, type: "u32" }),
    b3b7EntityCount: Object.freeze({ offset: 8072, type: "u32" }),
    b3b7ListEnd: Object.freeze({ offset: 8076, type: "u32" }),
    b3b7ListCap: Object.freeze({ offset: 8080, type: "u32" }),
    b3b7Count708250: Object.freeze({ offset: 8084, type: "u32" }),
    b3b7TeEntriesCount: Object.freeze({ offset: 8088, type: "u32" }),
    b3b7TeEntryType: Object.freeze({ offset: 8092, type: "bytes", size: 32 }),
    b3b7TeEntryId: Object.freeze({ offset: 8124, type: "bytes", size: 32 }),
    b3b7B5Type: Object.freeze({ offset: 8156, type: "bytes", size: 128 }),
    b3b7B5Variant: Object.freeze({ offset: 8284, type: "bytes", size: 128 }),
    b3b7B5Flags168: Object.freeze({ offset: 8412, type: "bytes", size: 128 }),
    b3b7B5Vt48Al: Object.freeze({ offset: 8540, type: "bytes", size: 128 }),
    b3b7B5Field32c: Object.freeze({ offset: 8668, type: "bytes", size: 128 }),
    b3b7B5Vt4cAl: Object.freeze({ offset: 8796, type: "bytes", size: 128 }),
    b3b7B5Seed3dc: Object.freeze({ offset: 8924, type: "bytes", size: 128 }),
    b3b7B5Shift3e0: Object.freeze({ offset: 9052, type: "bytes", size: 128 }),
    b3b7B5Shift3e4: Object.freeze({ offset: 9180, type: "bytes", size: 128 }),
    b3b7B5Shift3e8: Object.freeze({ offset: 9308, type: "bytes", size: 128 }),
    b3b7B6NodeCount: Object.freeze({ offset: 9436, type: "u32" }),
    b3b7B6NodeIdx: Object.freeze({ offset: 9440, type: "bytes", size: 128 }),
    b3b7B6NodeSlotNonnull: Object.freeze({ offset: 9568, type: "bytes", size: 128 }),
    b3b7B7NonnullSlotCount: Object.freeze({ offset: 9696, type: "u32" }),
    b3b7B7NonnullSlots: Object.freeze({ offset: 9700, type: "bytes", size: 256 }),
    waterB16BlobReady: Object.freeze({ offset: 10972, type: "u32" }),
    waterB16GameByte183a0: Object.freeze({ offset: 10976, type: "u32" }),
    waterB16GameByte269e9: Object.freeze({ offset: 10980, type: "u32" }),
    waterB16GameType0: Object.freeze({ offset: 10984, type: "u32" }),
    waterB16GameSubtype4: Object.freeze({ offset: 10988, type: "u32" }),
    waterB16UnlockAcc: Object.freeze({ offset: 10992, type: "u32" }),
    waterB16UnlockClear: Object.freeze({ offset: 10996, type: "u32" }),
    waterB16Src1b10_0: Object.freeze({ offset: 11000, type: "u32" }),
    waterB16Src1b10_1: Object.freeze({ offset: 11004, type: "u32" }),
    waterB16Src1b10_2: Object.freeze({ offset: 11008, type: "u32" }),
    waterB16Src1b10_3: Object.freeze({ offset: 11012, type: "u32" }),
    waterB16Src1b10_4: Object.freeze({ offset: 11016, type: "u32" }),
    waterB16Src1b10_5: Object.freeze({ offset: 11020, type: "u32" }),
    waterB16GridFlags44: Object.freeze({ offset: 11024, type: "u32" }),
    waterB16CellDword54: Object.freeze({ offset: 11028, type: "u32" }),
    tailPathReady: Object.freeze({ offset: 10056, type: "u32" }),
    tailPathListBeginC82674: Object.freeze({ offset: 10060, type: "u32" }),
    tailPathListEndC82678: Object.freeze({ offset: 10064, type: "u32" }),
    tailPathMode26614: Object.freeze({ offset: 10068, type: "u32" }),
    tailPathGenrandDraws: Object.freeze({ offset: 10072, type: "u32" }),
    tailPathEntries: Object.freeze({ offset: 10076, type: "bytes", size: 896 }),
    enginePlayerEntry173Ready: Object.freeze({ offset: 11032, type: "u32" }),
    enginePlayerEntry173: Object.freeze({ offset: 11036, type: "bytes", size: 32 }),
    b2PoolReady: Object.freeze({ offset: 9956, type: "u32" }),
    b2PoolGate18304: Object.freeze({ offset: 9960, type: "u32" }),
    b2PoolSeed0: Object.freeze({ offset: 10028, type: "u32" }),
    b2PoolSeed1: Object.freeze({ offset: 10032, type: "u32" }),
    b2PoolSeed2: Object.freeze({ offset: 10036, type: "u32" }),
    b2PoolSeed3: Object.freeze({ offset: 10040, type: "u32" }),
    b2PlayerColCount: Object.freeze({ offset: 10044, type: "u32" }),
    b2GridWidth: Object.freeze({ offset: 10048, type: "u32" }),
    b2SpawnCount: Object.freeze({ offset: 10052, type: "u32" }),
    pmIntensityRaw0: Object.freeze({ offset: 708, type: "u32" }),
    pmIntensityFlags0: Object.freeze({ offset: 740, type: "u32" }),
    pmIntensityDead0: Object.freeze({ offset: 772, type: "u32" }),
    pmIntensityRaw1: Object.freeze({ offset: 712, type: "u32" }),
    pmIntensityFlags1: Object.freeze({ offset: 744, type: "u32" }),
    pmIntensityDead1: Object.freeze({ offset: 776, type: "u32" }),
    pmIntensityRaw2: Object.freeze({ offset: 716, type: "u32" }),
    pmIntensityFlags2: Object.freeze({ offset: 748, type: "u32" }),
    pmIntensityDead2: Object.freeze({ offset: 780, type: "u32" }),
    pmIntensityRaw3: Object.freeze({ offset: 720, type: "u32" }),
    pmIntensityFlags3: Object.freeze({ offset: 752, type: "u32" }),
    pmIntensityDead3: Object.freeze({ offset: 784, type: "u32" }),
    pmIntensityRaw4: Object.freeze({ offset: 724, type: "u32" }),
    pmIntensityFlags4: Object.freeze({ offset: 756, type: "u32" }),
    pmIntensityDead4: Object.freeze({ offset: 788, type: "u32" }),
    pmIntensityRaw5: Object.freeze({ offset: 728, type: "u32" }),
    pmIntensityFlags5: Object.freeze({ offset: 760, type: "u32" }),
    pmIntensityDead5: Object.freeze({ offset: 792, type: "u32" }),
    pmIntensityRaw6: Object.freeze({ offset: 732, type: "u32" }),
    pmIntensityFlags6: Object.freeze({ offset: 764, type: "u32" }),
    pmIntensityDead6: Object.freeze({ offset: 796, type: "u32" }),
    pmIntensityRaw7: Object.freeze({ offset: 736, type: "u32" }),
    pmIntensityFlags7: Object.freeze({ offset: 768, type: "u32" }),
    pmIntensityDead7: Object.freeze({ offset: 800, type: "u32" }),
    state24ecc22ed0Flag: Object.freeze({ offset: 2076, type: "u32" }),
    pmDeathDead1730: Object.freeze({ offset: 2228, type: "u32" }),
    pmDeathDead1731: Object.freeze({ offset: 2232, type: "u32" }),
    pmDeathDead1732: Object.freeze({ offset: 2236, type: "u32" }),
    pmDeathDead1733: Object.freeze({ offset: 2240, type: "u32" }),
    pmDeathDead1734: Object.freeze({ offset: 2244, type: "u32" }),
    pmDeathDead1735: Object.freeze({ offset: 2248, type: "u32" }),
    pmDeathDead1736: Object.freeze({ offset: 2252, type: "u32" }),
    pmDeathDead1737: Object.freeze({ offset: 2256, type: "u32" }),
    frameOpaque4257b0PId16180: Object.freeze({ offset: 2468, type: "i32" }),
    frameOpaque4257b0QId16180: Object.freeze({ offset: 2596, type: "i32" }),
    frameOpaque4257b0PChar13c00: Object.freeze({ offset: 2692, type: "u32" }),
    frameOpaque4257b0PId16181: Object.freeze({ offset: 2472, type: "i32" }),
    frameOpaque4257b0QId16181: Object.freeze({ offset: 2600, type: "i32" }),
    frameOpaque4257b0PChar13c01: Object.freeze({ offset: 2696, type: "u32" }),
    frameOpaque4257b0PId16182: Object.freeze({ offset: 2476, type: "i32" }),
    frameOpaque4257b0QId16182: Object.freeze({ offset: 2604, type: "i32" }),
    frameOpaque4257b0PChar13c02: Object.freeze({ offset: 2700, type: "u32" }),
    frameOpaque4257b0PId16183: Object.freeze({ offset: 2480, type: "i32" }),
    frameOpaque4257b0QId16183: Object.freeze({ offset: 2608, type: "i32" }),
    frameOpaque4257b0PChar13c03: Object.freeze({ offset: 2704, type: "u32" }),
    frameOpaque4257b0PId16184: Object.freeze({ offset: 2484, type: "i32" }),
    frameOpaque4257b0QId16184: Object.freeze({ offset: 2612, type: "i32" }),
    frameOpaque4257b0PChar13c04: Object.freeze({ offset: 2708, type: "u32" }),
    frameOpaque4257b0PId16185: Object.freeze({ offset: 2488, type: "i32" }),
    frameOpaque4257b0QId16185: Object.freeze({ offset: 2616, type: "i32" }),
    frameOpaque4257b0PChar13c05: Object.freeze({ offset: 2712, type: "u32" }),
    frameOpaque4257b0PId16186: Object.freeze({ offset: 2492, type: "i32" }),
    frameOpaque4257b0QId16186: Object.freeze({ offset: 2620, type: "i32" }),
    frameOpaque4257b0PChar13c06: Object.freeze({ offset: 2716, type: "u32" }),
    frameOpaque4257b0PId16187: Object.freeze({ offset: 2496, type: "i32" }),
    frameOpaque4257b0QId16187: Object.freeze({ offset: 2624, type: "i32" }),
    frameOpaque4257b0PChar13c07: Object.freeze({ offset: 2720, type: "u32" }),
    frameOpaque4257b0ElemId0: Object.freeze({ offset: 2724, type: "u32" }),
    frameOpaque4257b0ElemSubLo0: Object.freeze({ offset: 2852, type: "u32" }),
    frameOpaque4257b0ElemSubHi0: Object.freeze({ offset: 2916, type: "u32" }),
    frameOpaque4257b0ElemId1: Object.freeze({ offset: 2728, type: "u32" }),
    frameOpaque4257b0ElemSubLo1: Object.freeze({ offset: 2856, type: "u32" }),
    frameOpaque4257b0ElemSubHi1: Object.freeze({ offset: 2920, type: "u32" }),
    frameOpaque4257b0ElemId2: Object.freeze({ offset: 2732, type: "u32" }),
    frameOpaque4257b0ElemSubLo2: Object.freeze({ offset: 2860, type: "u32" }),
    frameOpaque4257b0ElemSubHi2: Object.freeze({ offset: 2924, type: "u32" }),
    frameOpaque4257b0ElemId3: Object.freeze({ offset: 2736, type: "u32" }),
    frameOpaque4257b0ElemSubLo3: Object.freeze({ offset: 2864, type: "u32" }),
    frameOpaque4257b0ElemSubHi3: Object.freeze({ offset: 2928, type: "u32" }),
    frameOpaque4257b0ElemId4: Object.freeze({ offset: 2740, type: "u32" }),
    frameOpaque4257b0ElemSubLo4: Object.freeze({ offset: 2868, type: "u32" }),
    frameOpaque4257b0ElemSubHi4: Object.freeze({ offset: 2932, type: "u32" }),
    frameOpaque4257b0ElemId5: Object.freeze({ offset: 2744, type: "u32" }),
    frameOpaque4257b0ElemSubLo5: Object.freeze({ offset: 2872, type: "u32" }),
    frameOpaque4257b0ElemSubHi5: Object.freeze({ offset: 2936, type: "u32" }),
    frameOpaque4257b0ElemId6: Object.freeze({ offset: 2748, type: "u32" }),
    frameOpaque4257b0ElemSubLo6: Object.freeze({ offset: 2876, type: "u32" }),
    frameOpaque4257b0ElemSubHi6: Object.freeze({ offset: 2940, type: "u32" }),
    frameOpaque4257b0ElemId7: Object.freeze({ offset: 2752, type: "u32" }),
    frameOpaque4257b0ElemSubLo7: Object.freeze({ offset: 2880, type: "u32" }),
    frameOpaque4257b0ElemSubHi7: Object.freeze({ offset: 2944, type: "u32" }),
    frameOpaque4257b0ElemId8: Object.freeze({ offset: 2756, type: "u32" }),
    frameOpaque4257b0ElemSubLo8: Object.freeze({ offset: 2884, type: "u32" }),
    frameOpaque4257b0ElemSubHi8: Object.freeze({ offset: 2948, type: "u32" }),
    frameOpaque4257b0ElemId9: Object.freeze({ offset: 2760, type: "u32" }),
    frameOpaque4257b0ElemSubLo9: Object.freeze({ offset: 2888, type: "u32" }),
    frameOpaque4257b0ElemSubHi9: Object.freeze({ offset: 2952, type: "u32" }),
    frameOpaque4257b0ElemId10: Object.freeze({ offset: 2764, type: "u32" }),
    frameOpaque4257b0ElemSubLo10: Object.freeze({ offset: 2892, type: "u32" }),
    frameOpaque4257b0ElemSubHi10: Object.freeze({ offset: 2956, type: "u32" }),
    frameOpaque4257b0ElemId11: Object.freeze({ offset: 2768, type: "u32" }),
    frameOpaque4257b0ElemSubLo11: Object.freeze({ offset: 2896, type: "u32" }),
    frameOpaque4257b0ElemSubHi11: Object.freeze({ offset: 2960, type: "u32" }),
    frameOpaque4257b0ElemId12: Object.freeze({ offset: 2772, type: "u32" }),
    frameOpaque4257b0ElemSubLo12: Object.freeze({ offset: 2900, type: "u32" }),
    frameOpaque4257b0ElemSubHi12: Object.freeze({ offset: 2964, type: "u32" }),
    frameOpaque4257b0ElemId13: Object.freeze({ offset: 2776, type: "u32" }),
    frameOpaque4257b0ElemSubLo13: Object.freeze({ offset: 2904, type: "u32" }),
    frameOpaque4257b0ElemSubHi13: Object.freeze({ offset: 2968, type: "u32" }),
    frameOpaque4257b0ElemId14: Object.freeze({ offset: 2780, type: "u32" }),
    frameOpaque4257b0ElemSubLo14: Object.freeze({ offset: 2908, type: "u32" }),
    frameOpaque4257b0ElemSubHi14: Object.freeze({ offset: 2972, type: "u32" }),
    frameOpaque4257b0ElemId15: Object.freeze({ offset: 2784, type: "u32" }),
    frameOpaque4257b0ElemSubLo15: Object.freeze({ offset: 2912, type: "u32" }),
    frameOpaque4257b0ElemSubHi15: Object.freeze({ offset: 2976, type: "u32" }),
    frameOpaque4257b0ListSlot80: Object.freeze({ offset: 3108, type: "u32" }),
    frameOpaque4257b0ListSlot81: Object.freeze({ offset: 3112, type: "u32" }),
    frameOpaque4257b0ListSlot82: Object.freeze({ offset: 3116, type: "u32" }),
    frameOpaque4257b0ListSlot83: Object.freeze({ offset: 3120, type: "u32" }),
    frameOpaque4257b0ListSlot84: Object.freeze({ offset: 3124, type: "u32" }),
    frameOpaque4257b0ListSlot85: Object.freeze({ offset: 3128, type: "u32" }),
    frameOpaque4257b0ListSlot86: Object.freeze({ offset: 3132, type: "u32" }),
    frameOpaque4257b0ListSlot87: Object.freeze({ offset: 3136, type: "u32" }),
    frameOpaque4257b0ListSlot88: Object.freeze({ offset: 3140, type: "u32" }),
    frameOpaque4257b0ListSlot89: Object.freeze({ offset: 3144, type: "u32" }),
    frameOpaque4257b0ListSlot810: Object.freeze({ offset: 3148, type: "u32" }),
    frameOpaque4257b0ListSlot811: Object.freeze({ offset: 3152, type: "u32" }),
    frameOpaque4257b0ListSlot812: Object.freeze({ offset: 3156, type: "u32" }),
    frameOpaque4257b0ListSlot813: Object.freeze({ offset: 3160, type: "u32" }),
    frameOpaque4257b0ListSlot814: Object.freeze({ offset: 3164, type: "u32" }),
    frameOpaque4257b0ListSlot815: Object.freeze({ offset: 3168, type: "u32" }),
    frameOpaque98dba0TimerMtiIn: Object.freeze({ offset: 3216, type: "u32" }),
    globalTree4aba0Addr0: Object.freeze({ offset: 3764, type: "u32" }),
    globalTree4aba0Next0: Object.freeze({ offset: 3768, type: "u32" }),
    globalTree4aba0Prev0: Object.freeze({ offset: 3772, type: "u32" }),
    globalTree4aba0Child0: Object.freeze({ offset: 3776, type: "u32" }),
    globalTree4aba0F0d0: Object.freeze({ offset: 3780, type: "u32" }),
    globalTree4aba0F180: Object.freeze({ offset: 3784, type: "u32" }),
    globalTree4aba0Addr1: Object.freeze({ offset: 3788, type: "u32" }),
    globalTree4aba0Next1: Object.freeze({ offset: 3792, type: "u32" }),
    globalTree4aba0Prev1: Object.freeze({ offset: 3796, type: "u32" }),
    globalTree4aba0Child1: Object.freeze({ offset: 3800, type: "u32" }),
    globalTree4aba0F0d1: Object.freeze({ offset: 3804, type: "u32" }),
    globalTree4aba0F181: Object.freeze({ offset: 3808, type: "u32" }),
    globalTree4aba0Addr2: Object.freeze({ offset: 3812, type: "u32" }),
    globalTree4aba0Next2: Object.freeze({ offset: 3816, type: "u32" }),
    globalTree4aba0Prev2: Object.freeze({ offset: 3820, type: "u32" }),
    globalTree4aba0Child2: Object.freeze({ offset: 3824, type: "u32" }),
    globalTree4aba0F0d2: Object.freeze({ offset: 3828, type: "u32" }),
    globalTree4aba0F182: Object.freeze({ offset: 3832, type: "u32" }),
    globalTree4aba0Addr3: Object.freeze({ offset: 3836, type: "u32" }),
    globalTree4aba0Next3: Object.freeze({ offset: 3840, type: "u32" }),
    globalTree4aba0Prev3: Object.freeze({ offset: 3844, type: "u32" }),
    globalTree4aba0Child3: Object.freeze({ offset: 3848, type: "u32" }),
    globalTree4aba0F0d3: Object.freeze({ offset: 3852, type: "u32" }),
    globalTree4aba0F183: Object.freeze({ offset: 3856, type: "u32" }),
    globalTree4aba0Addr4: Object.freeze({ offset: 3860, type: "u32" }),
    globalTree4aba0Next4: Object.freeze({ offset: 3864, type: "u32" }),
    globalTree4aba0Prev4: Object.freeze({ offset: 3868, type: "u32" }),
    globalTree4aba0Child4: Object.freeze({ offset: 3872, type: "u32" }),
    globalTree4aba0F0d4: Object.freeze({ offset: 3876, type: "u32" }),
    globalTree4aba0F184: Object.freeze({ offset: 3880, type: "u32" }),
    globalTree4aba0Addr5: Object.freeze({ offset: 3884, type: "u32" }),
    globalTree4aba0Next5: Object.freeze({ offset: 3888, type: "u32" }),
    globalTree4aba0Prev5: Object.freeze({ offset: 3892, type: "u32" }),
    globalTree4aba0Child5: Object.freeze({ offset: 3896, type: "u32" }),
    globalTree4aba0F0d5: Object.freeze({ offset: 3900, type: "u32" }),
    globalTree4aba0F185: Object.freeze({ offset: 3904, type: "u32" }),
    globalTree4aba0Addr6: Object.freeze({ offset: 3908, type: "u32" }),
    globalTree4aba0Next6: Object.freeze({ offset: 3912, type: "u32" }),
    globalTree4aba0Prev6: Object.freeze({ offset: 3916, type: "u32" }),
    globalTree4aba0Child6: Object.freeze({ offset: 3920, type: "u32" }),
    globalTree4aba0F0d6: Object.freeze({ offset: 3924, type: "u32" }),
    globalTree4aba0F186: Object.freeze({ offset: 3928, type: "u32" }),
    globalTree4aba0Addr7: Object.freeze({ offset: 3932, type: "u32" }),
    globalTree4aba0Next7: Object.freeze({ offset: 3936, type: "u32" }),
    globalTree4aba0Prev7: Object.freeze({ offset: 3940, type: "u32" }),
    globalTree4aba0Child7: Object.freeze({ offset: 3944, type: "u32" }),
    globalTree4aba0F0d7: Object.freeze({ offset: 3948, type: "u32" }),
    globalTree4aba0F187: Object.freeze({ offset: 3952, type: "u32" }),
    globalTree4aba0Addr8: Object.freeze({ offset: 3956, type: "u32" }),
    globalTree4aba0Next8: Object.freeze({ offset: 3960, type: "u32" }),
    globalTree4aba0Prev8: Object.freeze({ offset: 3964, type: "u32" }),
    globalTree4aba0Child8: Object.freeze({ offset: 3968, type: "u32" }),
    globalTree4aba0F0d8: Object.freeze({ offset: 3972, type: "u32" }),
    globalTree4aba0F188: Object.freeze({ offset: 3976, type: "u32" }),
    globalTree4aba0Addr9: Object.freeze({ offset: 3980, type: "u32" }),
    globalTree4aba0Next9: Object.freeze({ offset: 3984, type: "u32" }),
    globalTree4aba0Prev9: Object.freeze({ offset: 3988, type: "u32" }),
    globalTree4aba0Child9: Object.freeze({ offset: 3992, type: "u32" }),
    globalTree4aba0F0d9: Object.freeze({ offset: 3996, type: "u32" }),
    globalTree4aba0F189: Object.freeze({ offset: 4000, type: "u32" }),
    globalTree4aba0Addr10: Object.freeze({ offset: 4004, type: "u32" }),
    globalTree4aba0Next10: Object.freeze({ offset: 4008, type: "u32" }),
    globalTree4aba0Prev10: Object.freeze({ offset: 4012, type: "u32" }),
    globalTree4aba0Child10: Object.freeze({ offset: 4016, type: "u32" }),
    globalTree4aba0F0d10: Object.freeze({ offset: 4020, type: "u32" }),
    globalTree4aba0F1810: Object.freeze({ offset: 4024, type: "u32" }),
    globalTree4aba0Addr11: Object.freeze({ offset: 4028, type: "u32" }),
    globalTree4aba0Next11: Object.freeze({ offset: 4032, type: "u32" }),
    globalTree4aba0Prev11: Object.freeze({ offset: 4036, type: "u32" }),
    globalTree4aba0Child11: Object.freeze({ offset: 4040, type: "u32" }),
    globalTree4aba0F0d11: Object.freeze({ offset: 4044, type: "u32" }),
    globalTree4aba0F1811: Object.freeze({ offset: 4048, type: "u32" }),
    globalTree4aba0Addr12: Object.freeze({ offset: 4052, type: "u32" }),
    globalTree4aba0Next12: Object.freeze({ offset: 4056, type: "u32" }),
    globalTree4aba0Prev12: Object.freeze({ offset: 4060, type: "u32" }),
    globalTree4aba0Child12: Object.freeze({ offset: 4064, type: "u32" }),
    globalTree4aba0F0d12: Object.freeze({ offset: 4068, type: "u32" }),
    globalTree4aba0F1812: Object.freeze({ offset: 4072, type: "u32" }),
    globalTree4aba0Addr13: Object.freeze({ offset: 4076, type: "u32" }),
    globalTree4aba0Next13: Object.freeze({ offset: 4080, type: "u32" }),
    globalTree4aba0Prev13: Object.freeze({ offset: 4084, type: "u32" }),
    globalTree4aba0Child13: Object.freeze({ offset: 4088, type: "u32" }),
    globalTree4aba0F0d13: Object.freeze({ offset: 4092, type: "u32" }),
    globalTree4aba0F1813: Object.freeze({ offset: 4096, type: "u32" }),
    globalTree4aba0Addr14: Object.freeze({ offset: 4100, type: "u32" }),
    globalTree4aba0Next14: Object.freeze({ offset: 4104, type: "u32" }),
    globalTree4aba0Prev14: Object.freeze({ offset: 4108, type: "u32" }),
    globalTree4aba0Child14: Object.freeze({ offset: 4112, type: "u32" }),
    globalTree4aba0F0d14: Object.freeze({ offset: 4116, type: "u32" }),
    globalTree4aba0F1814: Object.freeze({ offset: 4120, type: "u32" }),
    globalTree4aba0Addr15: Object.freeze({ offset: 4124, type: "u32" }),
    globalTree4aba0Next15: Object.freeze({ offset: 4128, type: "u32" }),
    globalTree4aba0Prev15: Object.freeze({ offset: 4132, type: "u32" }),
    globalTree4aba0Child15: Object.freeze({ offset: 4136, type: "u32" }),
    globalTree4aba0F0d15: Object.freeze({ offset: 4140, type: "u32" }),
    globalTree4aba0F1815: Object.freeze({ offset: 4144, type: "u32" }),
    globalTree4aba0Addr16: Object.freeze({ offset: 4148, type: "u32" }),
    globalTree4aba0Next16: Object.freeze({ offset: 4152, type: "u32" }),
    globalTree4aba0Prev16: Object.freeze({ offset: 4156, type: "u32" }),
    globalTree4aba0Child16: Object.freeze({ offset: 4160, type: "u32" }),
    globalTree4aba0F0d16: Object.freeze({ offset: 4164, type: "u32" }),
    globalTree4aba0F1816: Object.freeze({ offset: 4168, type: "u32" }),
    globalTree4aba0Addr17: Object.freeze({ offset: 4172, type: "u32" }),
    globalTree4aba0Next17: Object.freeze({ offset: 4176, type: "u32" }),
    globalTree4aba0Prev17: Object.freeze({ offset: 4180, type: "u32" }),
    globalTree4aba0Child17: Object.freeze({ offset: 4184, type: "u32" }),
    globalTree4aba0F0d17: Object.freeze({ offset: 4188, type: "u32" }),
    globalTree4aba0F1817: Object.freeze({ offset: 4192, type: "u32" }),
    globalTree4aba0Addr18: Object.freeze({ offset: 4196, type: "u32" }),
    globalTree4aba0Next18: Object.freeze({ offset: 4200, type: "u32" }),
    globalTree4aba0Prev18: Object.freeze({ offset: 4204, type: "u32" }),
    globalTree4aba0Child18: Object.freeze({ offset: 4208, type: "u32" }),
    globalTree4aba0F0d18: Object.freeze({ offset: 4212, type: "u32" }),
    globalTree4aba0F1818: Object.freeze({ offset: 4216, type: "u32" }),
    globalTree4aba0Addr19: Object.freeze({ offset: 4220, type: "u32" }),
    globalTree4aba0Next19: Object.freeze({ offset: 4224, type: "u32" }),
    globalTree4aba0Prev19: Object.freeze({ offset: 4228, type: "u32" }),
    globalTree4aba0Child19: Object.freeze({ offset: 4232, type: "u32" }),
    globalTree4aba0F0d19: Object.freeze({ offset: 4236, type: "u32" }),
    globalTree4aba0F1819: Object.freeze({ offset: 4240, type: "u32" }),
    globalTree4aba0Addr20: Object.freeze({ offset: 4244, type: "u32" }),
    globalTree4aba0Next20: Object.freeze({ offset: 4248, type: "u32" }),
    globalTree4aba0Prev20: Object.freeze({ offset: 4252, type: "u32" }),
    globalTree4aba0Child20: Object.freeze({ offset: 4256, type: "u32" }),
    globalTree4aba0F0d20: Object.freeze({ offset: 4260, type: "u32" }),
    globalTree4aba0F1820: Object.freeze({ offset: 4264, type: "u32" }),
    globalTree4aba0Addr21: Object.freeze({ offset: 4268, type: "u32" }),
    globalTree4aba0Next21: Object.freeze({ offset: 4272, type: "u32" }),
    globalTree4aba0Prev21: Object.freeze({ offset: 4276, type: "u32" }),
    globalTree4aba0Child21: Object.freeze({ offset: 4280, type: "u32" }),
    globalTree4aba0F0d21: Object.freeze({ offset: 4284, type: "u32" }),
    globalTree4aba0F1821: Object.freeze({ offset: 4288, type: "u32" }),
    globalTree4aba0Addr22: Object.freeze({ offset: 4292, type: "u32" }),
    globalTree4aba0Next22: Object.freeze({ offset: 4296, type: "u32" }),
    globalTree4aba0Prev22: Object.freeze({ offset: 4300, type: "u32" }),
    globalTree4aba0Child22: Object.freeze({ offset: 4304, type: "u32" }),
    globalTree4aba0F0d22: Object.freeze({ offset: 4308, type: "u32" }),
    globalTree4aba0F1822: Object.freeze({ offset: 4312, type: "u32" }),
    globalTree4aba0Addr23: Object.freeze({ offset: 4316, type: "u32" }),
    globalTree4aba0Next23: Object.freeze({ offset: 4320, type: "u32" }),
    globalTree4aba0Prev23: Object.freeze({ offset: 4324, type: "u32" }),
    globalTree4aba0Child23: Object.freeze({ offset: 4328, type: "u32" }),
    globalTree4aba0F0d23: Object.freeze({ offset: 4332, type: "u32" }),
    globalTree4aba0F1823: Object.freeze({ offset: 4336, type: "u32" }),
    globalTree4aba0Addr24: Object.freeze({ offset: 4340, type: "u32" }),
    globalTree4aba0Next24: Object.freeze({ offset: 4344, type: "u32" }),
    globalTree4aba0Prev24: Object.freeze({ offset: 4348, type: "u32" }),
    globalTree4aba0Child24: Object.freeze({ offset: 4352, type: "u32" }),
    globalTree4aba0F0d24: Object.freeze({ offset: 4356, type: "u32" }),
    globalTree4aba0F1824: Object.freeze({ offset: 4360, type: "u32" }),
    globalTree4aba0Addr25: Object.freeze({ offset: 4364, type: "u32" }),
    globalTree4aba0Next25: Object.freeze({ offset: 4368, type: "u32" }),
    globalTree4aba0Prev25: Object.freeze({ offset: 4372, type: "u32" }),
    globalTree4aba0Child25: Object.freeze({ offset: 4376, type: "u32" }),
    globalTree4aba0F0d25: Object.freeze({ offset: 4380, type: "u32" }),
    globalTree4aba0F1825: Object.freeze({ offset: 4384, type: "u32" }),
    globalTree4aba0Addr26: Object.freeze({ offset: 4388, type: "u32" }),
    globalTree4aba0Next26: Object.freeze({ offset: 4392, type: "u32" }),
    globalTree4aba0Prev26: Object.freeze({ offset: 4396, type: "u32" }),
    globalTree4aba0Child26: Object.freeze({ offset: 4400, type: "u32" }),
    globalTree4aba0F0d26: Object.freeze({ offset: 4404, type: "u32" }),
    globalTree4aba0F1826: Object.freeze({ offset: 4408, type: "u32" }),
    globalTree4aba0Addr27: Object.freeze({ offset: 4412, type: "u32" }),
    globalTree4aba0Next27: Object.freeze({ offset: 4416, type: "u32" }),
    globalTree4aba0Prev27: Object.freeze({ offset: 4420, type: "u32" }),
    globalTree4aba0Child27: Object.freeze({ offset: 4424, type: "u32" }),
    globalTree4aba0F0d27: Object.freeze({ offset: 4428, type: "u32" }),
    globalTree4aba0F1827: Object.freeze({ offset: 4432, type: "u32" }),
    globalTree4aba0Addr28: Object.freeze({ offset: 4436, type: "u32" }),
    globalTree4aba0Next28: Object.freeze({ offset: 4440, type: "u32" }),
    globalTree4aba0Prev28: Object.freeze({ offset: 4444, type: "u32" }),
    globalTree4aba0Child28: Object.freeze({ offset: 4448, type: "u32" }),
    globalTree4aba0F0d28: Object.freeze({ offset: 4452, type: "u32" }),
    globalTree4aba0F1828: Object.freeze({ offset: 4456, type: "u32" }),
    globalTree4aba0Addr29: Object.freeze({ offset: 4460, type: "u32" }),
    globalTree4aba0Next29: Object.freeze({ offset: 4464, type: "u32" }),
    globalTree4aba0Prev29: Object.freeze({ offset: 4468, type: "u32" }),
    globalTree4aba0Child29: Object.freeze({ offset: 4472, type: "u32" }),
    globalTree4aba0F0d29: Object.freeze({ offset: 4476, type: "u32" }),
    globalTree4aba0F1829: Object.freeze({ offset: 4480, type: "u32" }),
    globalTree4aba0Addr30: Object.freeze({ offset: 4484, type: "u32" }),
    globalTree4aba0Next30: Object.freeze({ offset: 4488, type: "u32" }),
    globalTree4aba0Prev30: Object.freeze({ offset: 4492, type: "u32" }),
    globalTree4aba0Child30: Object.freeze({ offset: 4496, type: "u32" }),
    globalTree4aba0F0d30: Object.freeze({ offset: 4500, type: "u32" }),
    globalTree4aba0F1830: Object.freeze({ offset: 4504, type: "u32" }),
    globalTree4aba0Addr31: Object.freeze({ offset: 4508, type: "u32" }),
    globalTree4aba0Next31: Object.freeze({ offset: 4512, type: "u32" }),
    globalTree4aba0Prev31: Object.freeze({ offset: 4516, type: "u32" }),
    globalTree4aba0Child31: Object.freeze({ offset: 4520, type: "u32" }),
    globalTree4aba0F0d31: Object.freeze({ offset: 4524, type: "u32" }),
    globalTree4aba0F1831: Object.freeze({ offset: 4528, type: "u32" }),
    hudStatPlayer0PredA: Object.freeze({ offset: 4992, type: "u32" }),
    hudStatPlayer0OtherPtr: Object.freeze({ offset: 5012, type: "u32" }),
    hudStatPlayer1PredA: Object.freeze({ offset: 5056, type: "u32" }),
    hudStatPlayer1OtherPtr: Object.freeze({ offset: 5076, type: "u32" }),
    hudStatPlayer2PredA: Object.freeze({ offset: 5120, type: "u32" }),
    hudStatPlayer2OtherPtr: Object.freeze({ offset: 5140, type: "u32" }),
    hudStatPlayer3PredA: Object.freeze({ offset: 5184, type: "u32" }),
    hudStatPlayer3OtherPtr: Object.freeze({ offset: 5204, type: "u32" }),
    hudStatPlayer4PredA: Object.freeze({ offset: 5248, type: "u32" }),
    hudStatPlayer4OtherPtr: Object.freeze({ offset: 5268, type: "u32" }),
    hudStatPlayer5PredA: Object.freeze({ offset: 5312, type: "u32" }),
    hudStatPlayer5OtherPtr: Object.freeze({ offset: 5332, type: "u32" }),
    hudStatPlayer6PredA: Object.freeze({ offset: 5376, type: "u32" }),
    hudStatPlayer6OtherPtr: Object.freeze({ offset: 5396, type: "u32" }),
    hudStatPlayer7PredA: Object.freeze({ offset: 5440, type: "u32" }),
    hudStatPlayer7OtherPtr: Object.freeze({ offset: 5460, type: "u32" }),
    b2PoolCounts0: Object.freeze({ offset: 9964, type: "u16" }),
    b2PoolCounts1: Object.freeze({ offset: 9966, type: "u16" }),
    b2PoolCounts2: Object.freeze({ offset: 9968, type: "u16" }),
    b2PoolCounts3: Object.freeze({ offset: 9970, type: "u16" }),
    b2PoolCounts4: Object.freeze({ offset: 9972, type: "u16" }),
    b2PoolCounts5: Object.freeze({ offset: 9974, type: "u16" }),
    b2PoolCounts6: Object.freeze({ offset: 9976, type: "u16" }),
    b2PoolCounts7: Object.freeze({ offset: 9978, type: "u16" }),
    b2PoolCounts8: Object.freeze({ offset: 9980, type: "u16" }),
    b2PoolCounts9: Object.freeze({ offset: 9982, type: "u16" }),
    b2PoolCounts10: Object.freeze({ offset: 9984, type: "u16" }),
    b2PoolCounts11: Object.freeze({ offset: 9986, type: "u16" }),
    b2PoolCounts12: Object.freeze({ offset: 9988, type: "u16" }),
    b2PoolCounts13: Object.freeze({ offset: 9990, type: "u16" }),
    b2PoolCounts14: Object.freeze({ offset: 9992, type: "u16" }),
    b2PoolCounts15: Object.freeze({ offset: 9994, type: "u16" }),
    b2PoolCounts16: Object.freeze({ offset: 9996, type: "u16" }),
    b2PoolCounts17: Object.freeze({ offset: 9998, type: "u16" }),
    b2PoolCounts18: Object.freeze({ offset: 10000, type: "u16" }),
    b2PoolCounts19: Object.freeze({ offset: 10002, type: "u16" }),
    b2PoolCounts20: Object.freeze({ offset: 10004, type: "u16" }),
    b2PoolCounts21: Object.freeze({ offset: 10006, type: "u16" }),
    b2PoolCounts22: Object.freeze({ offset: 10008, type: "u16" }),
    b2PoolCounts23: Object.freeze({ offset: 10010, type: "u16" }),
    b2PoolCounts24: Object.freeze({ offset: 10012, type: "u16" }),
    b2PoolCounts25: Object.freeze({ offset: 10014, type: "u16" }),
    b2PoolCounts26: Object.freeze({ offset: 10016, type: "u16" }),
    b2PoolCounts27: Object.freeze({ offset: 10018, type: "u16" }),
    b2PoolCounts28: Object.freeze({ offset: 10020, type: "u16" }),
    b2PoolCounts29: Object.freeze({ offset: 10022, type: "u16" }),
    b2PoolCounts30: Object.freeze({ offset: 10024, type: "u16" }),
    frameOpaque4212c0Add0EqualFlagsReady: Object.freeze({ offset: 7892, type: "u32" }),
    frameOpaque4212c0Add0EqualFlags0: Object.freeze({ offset: 7896, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags1: Object.freeze({ offset: 7897, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags2: Object.freeze({ offset: 7898, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags3: Object.freeze({ offset: 7899, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags4: Object.freeze({ offset: 7900, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags5: Object.freeze({ offset: 7901, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags6: Object.freeze({ offset: 7902, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags7: Object.freeze({ offset: 7903, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags8: Object.freeze({ offset: 7904, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags9: Object.freeze({ offset: 7905, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags10: Object.freeze({ offset: 7906, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags11: Object.freeze({ offset: 7907, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags12: Object.freeze({ offset: 7908, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags13: Object.freeze({ offset: 7909, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags14: Object.freeze({ offset: 7910, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags15: Object.freeze({ offset: 7911, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags16: Object.freeze({ offset: 7912, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags17: Object.freeze({ offset: 7913, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags18: Object.freeze({ offset: 7914, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags19: Object.freeze({ offset: 7915, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags20: Object.freeze({ offset: 7916, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags21: Object.freeze({ offset: 7917, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags22: Object.freeze({ offset: 7918, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags23: Object.freeze({ offset: 7919, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags24: Object.freeze({ offset: 7920, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags25: Object.freeze({ offset: 7921, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags26: Object.freeze({ offset: 7922, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags27: Object.freeze({ offset: 7923, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags28: Object.freeze({ offset: 7924, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags29: Object.freeze({ offset: 7925, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags30: Object.freeze({ offset: 7926, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags31: Object.freeze({ offset: 7927, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags32: Object.freeze({ offset: 7928, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags33: Object.freeze({ offset: 7929, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags34: Object.freeze({ offset: 7930, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags35: Object.freeze({ offset: 7931, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags36: Object.freeze({ offset: 7932, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags37: Object.freeze({ offset: 7933, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags38: Object.freeze({ offset: 7934, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags39: Object.freeze({ offset: 7935, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags40: Object.freeze({ offset: 7936, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags41: Object.freeze({ offset: 7937, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags42: Object.freeze({ offset: 7938, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags43: Object.freeze({ offset: 7939, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags44: Object.freeze({ offset: 7940, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags45: Object.freeze({ offset: 7941, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags46: Object.freeze({ offset: 7942, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags47: Object.freeze({ offset: 7943, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags48: Object.freeze({ offset: 7944, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags49: Object.freeze({ offset: 7945, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags50: Object.freeze({ offset: 7946, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags51: Object.freeze({ offset: 7947, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags52: Object.freeze({ offset: 7948, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags53: Object.freeze({ offset: 7949, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags54: Object.freeze({ offset: 7950, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags55: Object.freeze({ offset: 7951, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags56: Object.freeze({ offset: 7952, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags57: Object.freeze({ offset: 7953, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags58: Object.freeze({ offset: 7954, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags59: Object.freeze({ offset: 7955, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags60: Object.freeze({ offset: 7956, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags61: Object.freeze({ offset: 7957, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags62: Object.freeze({ offset: 7958, type: "u8" }),
    frameOpaque4212c0Add0EqualFlags63: Object.freeze({ offset: 7959, type: "u8" }),
    /* ABI v95 (record idx 25 stats-residual vector capture; wave-29 merge
       REBIND): the 7 tcsStatsVec lanes at the module offsets 7960..7984
       (was stale 8356..8380 — the module read zeros so the tcsStats
       growth sim never ran in the differential). */
    tcsStatsVecReady: Object.freeze({ offset: 7960, type: "u32" }),
    tcsStatsVecBegin: Object.freeze({ offset: 7964, type: "u32" }),
    tcsStatsVecEnd: Object.freeze({ offset: 7968, type: "u32" }),
    tcsStatsVecCap: Object.freeze({ offset: 7972, type: "u32" }),
    tcsStatsDesc10_48: Object.freeze({ offset: 7976, type: "u32" }),
    tcsStatsLookupBits: Object.freeze({ offset: 7980, type: "u32" }),
    tcsStatsGameByte8: Object.freeze({ offset: 7984, type: "u32" }),
    /* ABI v95 (record idx 27): the always-music seam captures (PE
       0x7f84b9..0x7f8520; offsets per the header struct). */
    roomTriggerClearAudioSeed: Object.freeze({ offset: 7988, type: "u32" }),
    roomTriggerClearAudioValue: Object.freeze({ offset: 7992, type: "u32" }),
    roomTriggerClearAudioPlaySound: Object.freeze({ offset: 7996, type: "u32" }),
    roomTriggerClearAudioGate749830: Object.freeze({ offset: 8000, type: "u32" }),
    roomTriggerClearAudioRoomMatch: Object.freeze({ offset: 8004, type: "u32" }),
    /* ABI v135 (update-v135-deep-music-pack, record idx28):
       deep-music gate capture @17652..17692 (contracts-deep-music
       NOTES §1/§2): voucher + head-clear byte + two packed probe rows
       (bits[7:0]=al, bit8=RAN) + byte26588 + MANAGER vec pair
       0x4b3d8/dc + count334 + room-match ret+8 / game18314 operands
       + game4. All-or-nothing voucher; absence -> monolith. */
    tcaDmGateReady: Object.freeze({ offset: 17652, type: "u32" }),
    tcaDmHeadClear1bb84: Object.freeze({ offset: 17656, type: "u32" }),
    tcaDmProbeA9e9b50: Object.freeze({ offset: 17660, type: "u32" }),
    tcaDmProbeB9595e0: Object.freeze({ offset: 17664, type: "u32" }),
    tcaDmByte26588: Object.freeze({ offset: 17668, type: "u32" }),
    tcaDmVecBegin4b3d8: Object.freeze({ offset: 17672, type: "u32" }),
    tcaDmVecEnd4b3dc: Object.freeze({ offset: 17676, type: "u32" }),
    tcaDmCount334: Object.freeze({ offset: 17680, type: "u32" }),
    tcaDmRoomMatchRet8: Object.freeze({ offset: 17684, type: "u32" }),
    tcaDmGame18314: Object.freeze({ offset: 17688, type: "u32" }),
    tcaDmGame4: Object.freeze({ offset: 17692, type: "u32" }),
    /* ABI v136 (update-v136-audio-head-pack, record idx26):
       head-gate + ABI-67 fail capture @17696..17852 (contracts-audio-head
       NOTES §2): voucher + RanBits bitmap + 17 gate/seam rows + 8 packed
       host-result rows + fail-chain rows Obj1E3/Game18314/SlotSeed/Bm1/
       Bm2 + SlotOcc0..7 + Slot8 + GenrandTail + pass-through echoes
       RoomF10F8/R74Bba0F10F8/R74Bba0BF10F8. All-or-nothing voucher;
       absence -> monolith byte-for-byte. */
    tca40HeadPackReady: Object.freeze({ offset: 17696, type: "u32" }),
    tca40HeadRanBits: Object.freeze({ offset: 17700, type: "u32" }),
    tca40HeadDescF10F10: Object.freeze({ offset: 17704, type: "u32" }),
    tca40HeadObj2c7: Object.freeze({ offset: 17708, type: "u32" }),
    tca40HeadObj8: Object.freeze({ offset: 17712, type: "u32" }),
    tca40HeadGame26630: Object.freeze({ offset: 17716, type: "u32" }),
    tca40HeadGameByte26589: Object.freeze({ offset: 17720, type: "u32" }),
    tca40HeadGame26550: Object.freeze({ offset: 17724, type: "u32" }),
    tca40HeadGameC: Object.freeze({ offset: 17728, type: "u32" }),
    tca40HeadGame18304: Object.freeze({ offset: 17732, type: "u32" }),
    tca40HeadGame182D0: Object.freeze({ offset: 17736, type: "u32" }),
    tca40HeadGame4: Object.freeze({ offset: 17740, type: "u32" }),
    tca40HeadRoom728: Object.freeze({ offset: 17744, type: "u32" }),
    tca40HeadH74Ea50Al: Object.freeze({ offset: 17748, type: "u32" }),
    tca40HeadH706940H80: Object.freeze({ offset: 17752, type: "u32" }),
    tca40HeadH6F9400: Object.freeze({ offset: 17756, type: "u32" }),
    tca40HeadH6F95A0: Object.freeze({ offset: 17760, type: "u32" }),
    tca40HeadH740Bc0Ret8: Object.freeze({ offset: 17764, type: "u32" }),
    tca40HeadH706940BH80: Object.freeze({ offset: 17768, type: "u32" }),
    tca40HeadH74Bae0: Object.freeze({ offset: 17772, type: "u32" }),
    tca40HeadH74E9B0Al: Object.freeze({ offset: 17776, type: "u32" }),
    tca40HeadH70D360: Object.freeze({ offset: 17780, type: "u32" }),
    tca40HeadObj1E3: Object.freeze({ offset: 17784, type: "u32" }),
    tca40HeadGame18314: Object.freeze({ offset: 17788, type: "u32" }),
    tca40HeadSlotSeed: Object.freeze({ offset: 17792, type: "u32" }),
    tca40HeadBm1: Object.freeze({ offset: 17796, type: "u32" }),
    tca40HeadBm2: Object.freeze({ offset: 17800, type: "u32" }),
    tca40HeadSlotOcc0: Object.freeze({ offset: 17804, type: "u32" }),
    tca40HeadSlotOcc1: Object.freeze({ offset: 17808, type: "u32" }),
    tca40HeadSlotOcc2: Object.freeze({ offset: 17812, type: "u32" }),
    tca40HeadSlotOcc3: Object.freeze({ offset: 17816, type: "u32" }),
    tca40HeadSlotOcc4: Object.freeze({ offset: 17820, type: "u32" }),
    tca40HeadSlotOcc5: Object.freeze({ offset: 17824, type: "u32" }),
    tca40HeadSlotOcc6: Object.freeze({ offset: 17828, type: "u32" }),
    tca40HeadSlotOcc7: Object.freeze({ offset: 17832, type: "u32" }),
    tca40HeadSlot8: Object.freeze({ offset: 17836, type: "u32" }),
    tca40HeadGenrandTail: Object.freeze({ offset: 17840, type: "u32" }),
    tca40HeadRoomF10F8: Object.freeze({ offset: 17844, type: "u32" }),
    /* ABI v137 (update-v137-audio-head-83b0-pack, record idx27):
       head/ALT-walk/tail-RNG capture @17856..18012 (contracts-audio-head-
       83b0 NOTES §2, appended AFTER the design-exact idx26 end — the
       NOTES' indicative base 17852 shifts +4 accordingly; next-free
       18016). Voucher + window A/B/C/D/E/F rows. All-or-nothing per
       window membership (§3); absence -> monolith byte-for-byte. */
    tca83B0HeadPackReady: Object.freeze({ offset: 17856, type: "u32" }),
    tca83B0HeadGate749830: Object.freeze({ offset: 17860, type: "u32" }),
    tca83B0HeadGame18304: Object.freeze({ offset: 17864, type: "u32" }),
    tca83B0HeadRoomIdxRet8: Object.freeze({ offset: 17868, type: "u32" }),
    tca83B0HeadGame18314: Object.freeze({ offset: 17872, type: "u32" }),
    tca83B0HeadValue92B0Bits: Object.freeze({ offset: 17876, type: "u32" }),
    tca83B0HeadMusicSeed: Object.freeze({ offset: 17880, type: "u32" }),
    tca83B0HeadOwnerProbe: Object.freeze({ offset: 17884, type: "u32" }),
    tca83B0HeadTlsChainA: Object.freeze({ offset: 17888, type: "u32" }),
    tca83B0HeadC8108CA: Object.freeze({ offset: 17892, type: "u32" }),
    tca83B0HeadTlsChainB: Object.freeze({ offset: 17896, type: "u32" }),
    tca83B0HeadC8108CB: Object.freeze({ offset: 17900, type: "u32" }),
    tca83B0HeadGame1830C: Object.freeze({ offset: 17904, type: "u32" }),
    tca83B0HeadBm2NonNull: Object.freeze({ offset: 17908, type: "u32" }),
    tca83B0HeadDescF58: Object.freeze({ offset: 17912, type: "u32" }),
    tca83B0HeadRandomIntRnd: Object.freeze({ offset: 17916, type: "u32" }),
    tca83B0HeadBm1_38: Object.freeze({ offset: 17920, type: "u32" }),
    tca83B0HeadSlotOcc0: Object.freeze({ offset: 17924, type: "u32" }),
    tca83B0HeadSlotOcc1: Object.freeze({ offset: 17928, type: "u32" }),
    tca83B0HeadSlotOcc2: Object.freeze({ offset: 17932, type: "u32" }),
    tca83B0HeadSlotOcc3: Object.freeze({ offset: 17936, type: "u32" }),
    tca83B0HeadSlotOcc4: Object.freeze({ offset: 17940, type: "u32" }),
    tca83B0HeadSlotOcc5: Object.freeze({ offset: 17944, type: "u32" }),
    tca83B0HeadSlotOcc6: Object.freeze({ offset: 17948, type: "u32" }),
    tca83B0HeadSlotOcc7: Object.freeze({ offset: 17952, type: "u32" }),
    tca83B0AltWalkGame1830C: Object.freeze({ offset: 17956, type: "u32" }),
    tca83B0AltWalkGame18308: Object.freeze({ offset: 17960, type: "u32" }),
    tca83B0AltWalkGame1831C: Object.freeze({ offset: 17964, type: "u32" }),
    tca83B0AltWalkBm1_38: Object.freeze({ offset: 17968, type: "u32" }),
    tca83B0AltWalkSeedF58: Object.freeze({ offset: 17972, type: "u32" }),
    tca83B0AltWalkBm2_38: Object.freeze({ offset: 17976, type: "u32" }),
    tca83B0AltWalkBm2_34: Object.freeze({ offset: 17980, type: "u32" }),
    tca83B0AltWalkMode269C8: Object.freeze({ offset: 17984, type: "u32" }),
    tca83B0HeadDoorMagic: Object.freeze({ offset: 17988, type: "u32" }),
    tca83B0HeadGame4: Object.freeze({ offset: 17992, type: "u32" }),
    tca83B0HeadGameStage0: Object.freeze({ offset: 17996, type: "u32" }),
    tca83B0TailRngSeedIn: Object.freeze({ offset: 18000, type: "u32" }),
    tca83B0TailRngSh1: Object.freeze({ offset: 18004, type: "u32" }),
    tca83B0TailRngSh2: Object.freeze({ offset: 18008, type: "u32" }),
    tca83B0TailRngSh3: Object.freeze({ offset: 18012, type: "u32" }),
    /* ABI v138 (update-v138-audio-alt-tail-pack, record idx27): ALT-tail
       capture @18016..18391 (NOTES 6C.1/6C.2 structure;
       real ledger base 18016 -- NOTES' 18012 assumed Sh3 @18008).
       Route-agnostic voucher + 5 header lanes + 8 x stride-44 rows.
       magic_eq_e DERIVED from tca83B0HeadDoorMagic @17984 == 0xe.
       iter_count <= 8 tripwire kept (falsifier 5). */
    tca83B0AltTailPackReady: Object.freeze({ offset: 18016, type: "u32" }),
    tca83B0AltTailIterCount: Object.freeze({ offset: 18020, type: "u32" }),
    tca83B0AltTailDoorF24: Object.freeze({ offset: 18024, type: "u32" }),
    tca83B0AltTailGameC: Object.freeze({ offset: 18028, type: "u32" }),
    tca83B0AltTailVecABits: Object.freeze({ offset: 18032, type: "u32" }),
    tca83B0AltTailVecBBits: Object.freeze({ offset: 18036, type: "u32" }),
    tca83B0AltTailRb0: Object.freeze({ offset: 18040, type: "u32" }),
    tca83B0AltTailRc0: Object.freeze({ offset: 18044, type: "u32" }),
    tca83B0AltTailRd0: Object.freeze({ offset: 18048, type: "u32" }),
    tca83B0AltTailRe0: Object.freeze({ offset: 18052, type: "u32" }),
    tca83B0AltTailRf0: Object.freeze({ offset: 18056, type: "u32" }),
    tca83B0AltTailRg0: Object.freeze({ offset: 18060, type: "u32" }),
    tca83B0AltTailRh0: Object.freeze({ offset: 18064, type: "u32" }),
    tca83B0AltTailCosH0: Object.freeze({ offset: 18068, type: "u32" }),
    tca83B0AltTailSinH0: Object.freeze({ offset: 18072, type: "u32" }),
    tca83B0AltTailItemPx0: Object.freeze({ offset: 18076, type: "u32" }),
    tca83B0AltTailItemPy0: Object.freeze({ offset: 18080, type: "u32" }),
    tca83B0AltTailRb1: Object.freeze({ offset: 18084, type: "u32" }),
    tca83B0AltTailRc1: Object.freeze({ offset: 18088, type: "u32" }),
    tca83B0AltTailRd1: Object.freeze({ offset: 18092, type: "u32" }),
    tca83B0AltTailRe1: Object.freeze({ offset: 18096, type: "u32" }),
    tca83B0AltTailRf1: Object.freeze({ offset: 18100, type: "u32" }),
    tca83B0AltTailRg1: Object.freeze({ offset: 18104, type: "u32" }),
    tca83B0AltTailRh1: Object.freeze({ offset: 18108, type: "u32" }),
    tca83B0AltTailCosH1: Object.freeze({ offset: 18112, type: "u32" }),
    tca83B0AltTailSinH1: Object.freeze({ offset: 18116, type: "u32" }),
    tca83B0AltTailItemPx1: Object.freeze({ offset: 18120, type: "u32" }),
    tca83B0AltTailItemPy1: Object.freeze({ offset: 18124, type: "u32" }),
    tca83B0AltTailRb2: Object.freeze({ offset: 18128, type: "u32" }),
    tca83B0AltTailRc2: Object.freeze({ offset: 18132, type: "u32" }),
    tca83B0AltTailRd2: Object.freeze({ offset: 18136, type: "u32" }),
    tca83B0AltTailRe2: Object.freeze({ offset: 18140, type: "u32" }),
    tca83B0AltTailRf2: Object.freeze({ offset: 18144, type: "u32" }),
    tca83B0AltTailRg2: Object.freeze({ offset: 18148, type: "u32" }),
    tca83B0AltTailRh2: Object.freeze({ offset: 18152, type: "u32" }),
    tca83B0AltTailCosH2: Object.freeze({ offset: 18156, type: "u32" }),
    tca83B0AltTailSinH2: Object.freeze({ offset: 18160, type: "u32" }),
    tca83B0AltTailItemPx2: Object.freeze({ offset: 18164, type: "u32" }),
    tca83B0AltTailItemPy2: Object.freeze({ offset: 18168, type: "u32" }),
    tca83B0AltTailRb3: Object.freeze({ offset: 18172, type: "u32" }),
    tca83B0AltTailRc3: Object.freeze({ offset: 18176, type: "u32" }),
    tca83B0AltTailRd3: Object.freeze({ offset: 18180, type: "u32" }),
    tca83B0AltTailRe3: Object.freeze({ offset: 18184, type: "u32" }),
    tca83B0AltTailRf3: Object.freeze({ offset: 18188, type: "u32" }),
    tca83B0AltTailRg3: Object.freeze({ offset: 18192, type: "u32" }),
    tca83B0AltTailRh3: Object.freeze({ offset: 18196, type: "u32" }),
    tca83B0AltTailCosH3: Object.freeze({ offset: 18200, type: "u32" }),
    tca83B0AltTailSinH3: Object.freeze({ offset: 18204, type: "u32" }),
    tca83B0AltTailItemPx3: Object.freeze({ offset: 18208, type: "u32" }),
    tca83B0AltTailItemPy3: Object.freeze({ offset: 18212, type: "u32" }),
    tca83B0AltTailRb4: Object.freeze({ offset: 18216, type: "u32" }),
    tca83B0AltTailRc4: Object.freeze({ offset: 18220, type: "u32" }),
    tca83B0AltTailRd4: Object.freeze({ offset: 18224, type: "u32" }),
    tca83B0AltTailRe4: Object.freeze({ offset: 18228, type: "u32" }),
    tca83B0AltTailRf4: Object.freeze({ offset: 18232, type: "u32" }),
    tca83B0AltTailRg4: Object.freeze({ offset: 18236, type: "u32" }),
    tca83B0AltTailRh4: Object.freeze({ offset: 18240, type: "u32" }),
    tca83B0AltTailCosH4: Object.freeze({ offset: 18244, type: "u32" }),
    tca83B0AltTailSinH4: Object.freeze({ offset: 18248, type: "u32" }),
    tca83B0AltTailItemPx4: Object.freeze({ offset: 18252, type: "u32" }),
    tca83B0AltTailItemPy4: Object.freeze({ offset: 18256, type: "u32" }),
    tca83B0AltTailRb5: Object.freeze({ offset: 18260, type: "u32" }),
    tca83B0AltTailRc5: Object.freeze({ offset: 18264, type: "u32" }),
    tca83B0AltTailRd5: Object.freeze({ offset: 18268, type: "u32" }),
    tca83B0AltTailRe5: Object.freeze({ offset: 18272, type: "u32" }),
    tca83B0AltTailRf5: Object.freeze({ offset: 18276, type: "u32" }),
    tca83B0AltTailRg5: Object.freeze({ offset: 18280, type: "u32" }),
    tca83B0AltTailRh5: Object.freeze({ offset: 18284, type: "u32" }),
    tca83B0AltTailCosH5: Object.freeze({ offset: 18288, type: "u32" }),
    tca83B0AltTailSinH5: Object.freeze({ offset: 18292, type: "u32" }),
    tca83B0AltTailItemPx5: Object.freeze({ offset: 18296, type: "u32" }),
    tca83B0AltTailItemPy5: Object.freeze({ offset: 18300, type: "u32" }),
    tca83B0AltTailRb6: Object.freeze({ offset: 18304, type: "u32" }),
    tca83B0AltTailRc6: Object.freeze({ offset: 18308, type: "u32" }),
    tca83B0AltTailRd6: Object.freeze({ offset: 18312, type: "u32" }),
    tca83B0AltTailRe6: Object.freeze({ offset: 18316, type: "u32" }),
    tca83B0AltTailRf6: Object.freeze({ offset: 18320, type: "u32" }),
    tca83B0AltTailRg6: Object.freeze({ offset: 18324, type: "u32" }),
    tca83B0AltTailRh6: Object.freeze({ offset: 18328, type: "u32" }),
    tca83B0AltTailCosH6: Object.freeze({ offset: 18332, type: "u32" }),
    tca83B0AltTailSinH6: Object.freeze({ offset: 18336, type: "u32" }),
    tca83B0AltTailItemPx6: Object.freeze({ offset: 18340, type: "u32" }),
    tca83B0AltTailItemPy6: Object.freeze({ offset: 18344, type: "u32" }),
    tca83B0AltTailRb7: Object.freeze({ offset: 18348, type: "u32" }),
    tca83B0AltTailRc7: Object.freeze({ offset: 18352, type: "u32" }),
    tca83B0AltTailRd7: Object.freeze({ offset: 18356, type: "u32" }),
    tca83B0AltTailRe7: Object.freeze({ offset: 18360, type: "u32" }),
    tca83B0AltTailRf7: Object.freeze({ offset: 18364, type: "u32" }),
    tca83B0AltTailRg7: Object.freeze({ offset: 18368, type: "u32" }),
    tca83B0AltTailRh7: Object.freeze({ offset: 18372, type: "u32" }),
    tca83B0AltTailCosH7: Object.freeze({ offset: 18376, type: "u32" }),
    tca83B0AltTailSinH7: Object.freeze({ offset: 18380, type: "u32" }),
    tca83B0AltTailItemPx7: Object.freeze({ offset: 18384, type: "u32" }),
    tca83B0AltTailItemPy7: Object.freeze({ offset: 18388, type: "u32" }),
    /* ABI v139 (update-v139-b1-rain-pack, records idx13/idx35): shared-
       half typed search/create/bind outcome rows @18392..21999
       (contracts-b1-rain NOTES 2.3). Element-major pool, 64 x 14-word
       rows; all-or-nothing voucher; over-cap poisons whole voucher;
       seed-chain closure row0<->seed0 echo; count == UNSIGNED
       min(quality, decor_count). Exactly-once application invariant. */
    b1RainRowsReady: Object.freeze({ offset: 18392, type: "u32" }),
    b1RainSpawnCount: Object.freeze({ offset: 18396, type: "u32" }),
    b1RainQualityEcho: Object.freeze({ offset: 18400, type: "u32" }),
    b1RainOwnerNonzeroEcho: Object.freeze({ offset: 18404, type: "u32" }),
    b1RainSeed0Echo: Object.freeze({ offset: 18408, type: "u32" }),
    b1RainDecorCountEcho: Object.freeze({ offset: 18412, type: "u32" }),
    b1RainRow0IterIndex: Object.freeze({ offset: 18416, type: "u32" }),
    b1RainRow0ShuffleSeedIn: Object.freeze({ offset: 18420, type: "u32" }),
    b1RainRow0ShuffleSeedOut: Object.freeze({ offset: 18424, type: "u32" }),
    b1RainRow0CornerPick: Object.freeze({ offset: 18428, type: "u32" }),
    b1RainRow0WorldX: Object.freeze({ offset: 18432, type: "u32" }),
    b1RainRow0WorldY: Object.freeze({ offset: 18436, type: "u32" }),
    b1RainRow0SearchOk: Object.freeze({ offset: 18440, type: "u32" }),
    b1RainRow0SearchDraws: Object.freeze({ offset: 18444, type: "u32" }),
    b1RainRow0CreateEntityPtr: Object.freeze({ offset: 18448, type: "u32" }),
    b1RainRow0BindRepositioned: Object.freeze({ offset: 18452, type: "u32" }),
    b1RainRow0BindReposDraws: Object.freeze({ offset: 18456, type: "u32" }),
    b1RainRow0ReposX: Object.freeze({ offset: 18460, type: "u32" }),
    b1RainRow0ReposY: Object.freeze({ offset: 18464, type: "u32" }),
    b1RainRow0BindStore7764: Object.freeze({ offset: 18468, type: "u32" }),
    b1RainRow1IterIndex: Object.freeze({ offset: 18472, type: "u32" }),
    b1RainRow1ShuffleSeedIn: Object.freeze({ offset: 18476, type: "u32" }),
    b1RainRow1ShuffleSeedOut: Object.freeze({ offset: 18480, type: "u32" }),
    b1RainRow1CornerPick: Object.freeze({ offset: 18484, type: "u32" }),
    b1RainRow1WorldX: Object.freeze({ offset: 18488, type: "u32" }),
    b1RainRow1WorldY: Object.freeze({ offset: 18492, type: "u32" }),
    b1RainRow1SearchOk: Object.freeze({ offset: 18496, type: "u32" }),
    b1RainRow1SearchDraws: Object.freeze({ offset: 18500, type: "u32" }),
    b1RainRow1CreateEntityPtr: Object.freeze({ offset: 18504, type: "u32" }),
    b1RainRow1BindRepositioned: Object.freeze({ offset: 18508, type: "u32" }),
    b1RainRow1BindReposDraws: Object.freeze({ offset: 18512, type: "u32" }),
    b1RainRow1ReposX: Object.freeze({ offset: 18516, type: "u32" }),
    b1RainRow1ReposY: Object.freeze({ offset: 18520, type: "u32" }),
    b1RainRow1BindStore7764: Object.freeze({ offset: 18524, type: "u32" }),
    b1RainRow2IterIndex: Object.freeze({ offset: 18528, type: "u32" }),
    b1RainRow2ShuffleSeedIn: Object.freeze({ offset: 18532, type: "u32" }),
    b1RainRow2ShuffleSeedOut: Object.freeze({ offset: 18536, type: "u32" }),
    b1RainRow2CornerPick: Object.freeze({ offset: 18540, type: "u32" }),
    b1RainRow2WorldX: Object.freeze({ offset: 18544, type: "u32" }),
    b1RainRow2WorldY: Object.freeze({ offset: 18548, type: "u32" }),
    b1RainRow2SearchOk: Object.freeze({ offset: 18552, type: "u32" }),
    b1RainRow2SearchDraws: Object.freeze({ offset: 18556, type: "u32" }),
    b1RainRow2CreateEntityPtr: Object.freeze({ offset: 18560, type: "u32" }),
    b1RainRow2BindRepositioned: Object.freeze({ offset: 18564, type: "u32" }),
    b1RainRow2BindReposDraws: Object.freeze({ offset: 18568, type: "u32" }),
    b1RainRow2ReposX: Object.freeze({ offset: 18572, type: "u32" }),
    b1RainRow2ReposY: Object.freeze({ offset: 18576, type: "u32" }),
    b1RainRow2BindStore7764: Object.freeze({ offset: 18580, type: "u32" }),
    b1RainRow3IterIndex: Object.freeze({ offset: 18584, type: "u32" }),
    b1RainRow3ShuffleSeedIn: Object.freeze({ offset: 18588, type: "u32" }),
    b1RainRow3ShuffleSeedOut: Object.freeze({ offset: 18592, type: "u32" }),
    b1RainRow3CornerPick: Object.freeze({ offset: 18596, type: "u32" }),
    b1RainRow3WorldX: Object.freeze({ offset: 18600, type: "u32" }),
    b1RainRow3WorldY: Object.freeze({ offset: 18604, type: "u32" }),
    b1RainRow3SearchOk: Object.freeze({ offset: 18608, type: "u32" }),
    b1RainRow3SearchDraws: Object.freeze({ offset: 18612, type: "u32" }),
    b1RainRow3CreateEntityPtr: Object.freeze({ offset: 18616, type: "u32" }),
    b1RainRow3BindRepositioned: Object.freeze({ offset: 18620, type: "u32" }),
    b1RainRow3BindReposDraws: Object.freeze({ offset: 18624, type: "u32" }),
    b1RainRow3ReposX: Object.freeze({ offset: 18628, type: "u32" }),
    b1RainRow3ReposY: Object.freeze({ offset: 18632, type: "u32" }),
    b1RainRow3BindStore7764: Object.freeze({ offset: 18636, type: "u32" }),
    b1RainRow4IterIndex: Object.freeze({ offset: 18640, type: "u32" }),
    b1RainRow4ShuffleSeedIn: Object.freeze({ offset: 18644, type: "u32" }),
    b1RainRow4ShuffleSeedOut: Object.freeze({ offset: 18648, type: "u32" }),
    b1RainRow4CornerPick: Object.freeze({ offset: 18652, type: "u32" }),
    b1RainRow4WorldX: Object.freeze({ offset: 18656, type: "u32" }),
    b1RainRow4WorldY: Object.freeze({ offset: 18660, type: "u32" }),
    b1RainRow4SearchOk: Object.freeze({ offset: 18664, type: "u32" }),
    b1RainRow4SearchDraws: Object.freeze({ offset: 18668, type: "u32" }),
    b1RainRow4CreateEntityPtr: Object.freeze({ offset: 18672, type: "u32" }),
    b1RainRow4BindRepositioned: Object.freeze({ offset: 18676, type: "u32" }),
    b1RainRow4BindReposDraws: Object.freeze({ offset: 18680, type: "u32" }),
    b1RainRow4ReposX: Object.freeze({ offset: 18684, type: "u32" }),
    b1RainRow4ReposY: Object.freeze({ offset: 18688, type: "u32" }),
    b1RainRow4BindStore7764: Object.freeze({ offset: 18692, type: "u32" }),
    b1RainRow5IterIndex: Object.freeze({ offset: 18696, type: "u32" }),
    b1RainRow5ShuffleSeedIn: Object.freeze({ offset: 18700, type: "u32" }),
    b1RainRow5ShuffleSeedOut: Object.freeze({ offset: 18704, type: "u32" }),
    b1RainRow5CornerPick: Object.freeze({ offset: 18708, type: "u32" }),
    b1RainRow5WorldX: Object.freeze({ offset: 18712, type: "u32" }),
    b1RainRow5WorldY: Object.freeze({ offset: 18716, type: "u32" }),
    b1RainRow5SearchOk: Object.freeze({ offset: 18720, type: "u32" }),
    b1RainRow5SearchDraws: Object.freeze({ offset: 18724, type: "u32" }),
    b1RainRow5CreateEntityPtr: Object.freeze({ offset: 18728, type: "u32" }),
    b1RainRow5BindRepositioned: Object.freeze({ offset: 18732, type: "u32" }),
    b1RainRow5BindReposDraws: Object.freeze({ offset: 18736, type: "u32" }),
    b1RainRow5ReposX: Object.freeze({ offset: 18740, type: "u32" }),
    b1RainRow5ReposY: Object.freeze({ offset: 18744, type: "u32" }),
    b1RainRow5BindStore7764: Object.freeze({ offset: 18748, type: "u32" }),
    b1RainRow6IterIndex: Object.freeze({ offset: 18752, type: "u32" }),
    b1RainRow6ShuffleSeedIn: Object.freeze({ offset: 18756, type: "u32" }),
    b1RainRow6ShuffleSeedOut: Object.freeze({ offset: 18760, type: "u32" }),
    b1RainRow6CornerPick: Object.freeze({ offset: 18764, type: "u32" }),
    b1RainRow6WorldX: Object.freeze({ offset: 18768, type: "u32" }),
    b1RainRow6WorldY: Object.freeze({ offset: 18772, type: "u32" }),
    b1RainRow6SearchOk: Object.freeze({ offset: 18776, type: "u32" }),
    b1RainRow6SearchDraws: Object.freeze({ offset: 18780, type: "u32" }),
    b1RainRow6CreateEntityPtr: Object.freeze({ offset: 18784, type: "u32" }),
    b1RainRow6BindRepositioned: Object.freeze({ offset: 18788, type: "u32" }),
    b1RainRow6BindReposDraws: Object.freeze({ offset: 18792, type: "u32" }),
    b1RainRow6ReposX: Object.freeze({ offset: 18796, type: "u32" }),
    b1RainRow6ReposY: Object.freeze({ offset: 18800, type: "u32" }),
    b1RainRow6BindStore7764: Object.freeze({ offset: 18804, type: "u32" }),
    b1RainRow7IterIndex: Object.freeze({ offset: 18808, type: "u32" }),
    b1RainRow7ShuffleSeedIn: Object.freeze({ offset: 18812, type: "u32" }),
    b1RainRow7ShuffleSeedOut: Object.freeze({ offset: 18816, type: "u32" }),
    b1RainRow7CornerPick: Object.freeze({ offset: 18820, type: "u32" }),
    b1RainRow7WorldX: Object.freeze({ offset: 18824, type: "u32" }),
    b1RainRow7WorldY: Object.freeze({ offset: 18828, type: "u32" }),
    b1RainRow7SearchOk: Object.freeze({ offset: 18832, type: "u32" }),
    b1RainRow7SearchDraws: Object.freeze({ offset: 18836, type: "u32" }),
    b1RainRow7CreateEntityPtr: Object.freeze({ offset: 18840, type: "u32" }),
    b1RainRow7BindRepositioned: Object.freeze({ offset: 18844, type: "u32" }),
    b1RainRow7BindReposDraws: Object.freeze({ offset: 18848, type: "u32" }),
    b1RainRow7ReposX: Object.freeze({ offset: 18852, type: "u32" }),
    b1RainRow7ReposY: Object.freeze({ offset: 18856, type: "u32" }),
    b1RainRow7BindStore7764: Object.freeze({ offset: 18860, type: "u32" }),
    b1RainRow8IterIndex: Object.freeze({ offset: 18864, type: "u32" }),
    b1RainRow8ShuffleSeedIn: Object.freeze({ offset: 18868, type: "u32" }),
    b1RainRow8ShuffleSeedOut: Object.freeze({ offset: 18872, type: "u32" }),
    b1RainRow8CornerPick: Object.freeze({ offset: 18876, type: "u32" }),
    b1RainRow8WorldX: Object.freeze({ offset: 18880, type: "u32" }),
    b1RainRow8WorldY: Object.freeze({ offset: 18884, type: "u32" }),
    b1RainRow8SearchOk: Object.freeze({ offset: 18888, type: "u32" }),
    b1RainRow8SearchDraws: Object.freeze({ offset: 18892, type: "u32" }),
    b1RainRow8CreateEntityPtr: Object.freeze({ offset: 18896, type: "u32" }),
    b1RainRow8BindRepositioned: Object.freeze({ offset: 18900, type: "u32" }),
    b1RainRow8BindReposDraws: Object.freeze({ offset: 18904, type: "u32" }),
    b1RainRow8ReposX: Object.freeze({ offset: 18908, type: "u32" }),
    b1RainRow8ReposY: Object.freeze({ offset: 18912, type: "u32" }),
    b1RainRow8BindStore7764: Object.freeze({ offset: 18916, type: "u32" }),
    b1RainRow9IterIndex: Object.freeze({ offset: 18920, type: "u32" }),
    b1RainRow9ShuffleSeedIn: Object.freeze({ offset: 18924, type: "u32" }),
    b1RainRow9ShuffleSeedOut: Object.freeze({ offset: 18928, type: "u32" }),
    b1RainRow9CornerPick: Object.freeze({ offset: 18932, type: "u32" }),
    b1RainRow9WorldX: Object.freeze({ offset: 18936, type: "u32" }),
    b1RainRow9WorldY: Object.freeze({ offset: 18940, type: "u32" }),
    b1RainRow9SearchOk: Object.freeze({ offset: 18944, type: "u32" }),
    b1RainRow9SearchDraws: Object.freeze({ offset: 18948, type: "u32" }),
    b1RainRow9CreateEntityPtr: Object.freeze({ offset: 18952, type: "u32" }),
    b1RainRow9BindRepositioned: Object.freeze({ offset: 18956, type: "u32" }),
    b1RainRow9BindReposDraws: Object.freeze({ offset: 18960, type: "u32" }),
    b1RainRow9ReposX: Object.freeze({ offset: 18964, type: "u32" }),
    b1RainRow9ReposY: Object.freeze({ offset: 18968, type: "u32" }),
    b1RainRow9BindStore7764: Object.freeze({ offset: 18972, type: "u32" }),
    b1RainRow10IterIndex: Object.freeze({ offset: 18976, type: "u32" }),
    b1RainRow10ShuffleSeedIn: Object.freeze({ offset: 18980, type: "u32" }),
    b1RainRow10ShuffleSeedOut: Object.freeze({ offset: 18984, type: "u32" }),
    b1RainRow10CornerPick: Object.freeze({ offset: 18988, type: "u32" }),
    b1RainRow10WorldX: Object.freeze({ offset: 18992, type: "u32" }),
    b1RainRow10WorldY: Object.freeze({ offset: 18996, type: "u32" }),
    b1RainRow10SearchOk: Object.freeze({ offset: 19000, type: "u32" }),
    b1RainRow10SearchDraws: Object.freeze({ offset: 19004, type: "u32" }),
    b1RainRow10CreateEntityPtr: Object.freeze({ offset: 19008, type: "u32" }),
    b1RainRow10BindRepositioned: Object.freeze({ offset: 19012, type: "u32" }),
    b1RainRow10BindReposDraws: Object.freeze({ offset: 19016, type: "u32" }),
    b1RainRow10ReposX: Object.freeze({ offset: 19020, type: "u32" }),
    b1RainRow10ReposY: Object.freeze({ offset: 19024, type: "u32" }),
    b1RainRow10BindStore7764: Object.freeze({ offset: 19028, type: "u32" }),
    b1RainRow11IterIndex: Object.freeze({ offset: 19032, type: "u32" }),
    b1RainRow11ShuffleSeedIn: Object.freeze({ offset: 19036, type: "u32" }),
    b1RainRow11ShuffleSeedOut: Object.freeze({ offset: 19040, type: "u32" }),
    b1RainRow11CornerPick: Object.freeze({ offset: 19044, type: "u32" }),
    b1RainRow11WorldX: Object.freeze({ offset: 19048, type: "u32" }),
    b1RainRow11WorldY: Object.freeze({ offset: 19052, type: "u32" }),
    b1RainRow11SearchOk: Object.freeze({ offset: 19056, type: "u32" }),
    b1RainRow11SearchDraws: Object.freeze({ offset: 19060, type: "u32" }),
    b1RainRow11CreateEntityPtr: Object.freeze({ offset: 19064, type: "u32" }),
    b1RainRow11BindRepositioned: Object.freeze({ offset: 19068, type: "u32" }),
    b1RainRow11BindReposDraws: Object.freeze({ offset: 19072, type: "u32" }),
    b1RainRow11ReposX: Object.freeze({ offset: 19076, type: "u32" }),
    b1RainRow11ReposY: Object.freeze({ offset: 19080, type: "u32" }),
    b1RainRow11BindStore7764: Object.freeze({ offset: 19084, type: "u32" }),
    b1RainRow12IterIndex: Object.freeze({ offset: 19088, type: "u32" }),
    b1RainRow12ShuffleSeedIn: Object.freeze({ offset: 19092, type: "u32" }),
    b1RainRow12ShuffleSeedOut: Object.freeze({ offset: 19096, type: "u32" }),
    b1RainRow12CornerPick: Object.freeze({ offset: 19100, type: "u32" }),
    b1RainRow12WorldX: Object.freeze({ offset: 19104, type: "u32" }),
    b1RainRow12WorldY: Object.freeze({ offset: 19108, type: "u32" }),
    b1RainRow12SearchOk: Object.freeze({ offset: 19112, type: "u32" }),
    b1RainRow12SearchDraws: Object.freeze({ offset: 19116, type: "u32" }),
    b1RainRow12CreateEntityPtr: Object.freeze({ offset: 19120, type: "u32" }),
    b1RainRow12BindRepositioned: Object.freeze({ offset: 19124, type: "u32" }),
    b1RainRow12BindReposDraws: Object.freeze({ offset: 19128, type: "u32" }),
    b1RainRow12ReposX: Object.freeze({ offset: 19132, type: "u32" }),
    b1RainRow12ReposY: Object.freeze({ offset: 19136, type: "u32" }),
    b1RainRow12BindStore7764: Object.freeze({ offset: 19140, type: "u32" }),
    b1RainRow13IterIndex: Object.freeze({ offset: 19144, type: "u32" }),
    b1RainRow13ShuffleSeedIn: Object.freeze({ offset: 19148, type: "u32" }),
    b1RainRow13ShuffleSeedOut: Object.freeze({ offset: 19152, type: "u32" }),
    b1RainRow13CornerPick: Object.freeze({ offset: 19156, type: "u32" }),
    b1RainRow13WorldX: Object.freeze({ offset: 19160, type: "u32" }),
    b1RainRow13WorldY: Object.freeze({ offset: 19164, type: "u32" }),
    b1RainRow13SearchOk: Object.freeze({ offset: 19168, type: "u32" }),
    b1RainRow13SearchDraws: Object.freeze({ offset: 19172, type: "u32" }),
    b1RainRow13CreateEntityPtr: Object.freeze({ offset: 19176, type: "u32" }),
    b1RainRow13BindRepositioned: Object.freeze({ offset: 19180, type: "u32" }),
    b1RainRow13BindReposDraws: Object.freeze({ offset: 19184, type: "u32" }),
    b1RainRow13ReposX: Object.freeze({ offset: 19188, type: "u32" }),
    b1RainRow13ReposY: Object.freeze({ offset: 19192, type: "u32" }),
    b1RainRow13BindStore7764: Object.freeze({ offset: 19196, type: "u32" }),
    b1RainRow14IterIndex: Object.freeze({ offset: 19200, type: "u32" }),
    b1RainRow14ShuffleSeedIn: Object.freeze({ offset: 19204, type: "u32" }),
    b1RainRow14ShuffleSeedOut: Object.freeze({ offset: 19208, type: "u32" }),
    b1RainRow14CornerPick: Object.freeze({ offset: 19212, type: "u32" }),
    b1RainRow14WorldX: Object.freeze({ offset: 19216, type: "u32" }),
    b1RainRow14WorldY: Object.freeze({ offset: 19220, type: "u32" }),
    b1RainRow14SearchOk: Object.freeze({ offset: 19224, type: "u32" }),
    b1RainRow14SearchDraws: Object.freeze({ offset: 19228, type: "u32" }),
    b1RainRow14CreateEntityPtr: Object.freeze({ offset: 19232, type: "u32" }),
    b1RainRow14BindRepositioned: Object.freeze({ offset: 19236, type: "u32" }),
    b1RainRow14BindReposDraws: Object.freeze({ offset: 19240, type: "u32" }),
    b1RainRow14ReposX: Object.freeze({ offset: 19244, type: "u32" }),
    b1RainRow14ReposY: Object.freeze({ offset: 19248, type: "u32" }),
    b1RainRow14BindStore7764: Object.freeze({ offset: 19252, type: "u32" }),
    b1RainRow15IterIndex: Object.freeze({ offset: 19256, type: "u32" }),
    b1RainRow15ShuffleSeedIn: Object.freeze({ offset: 19260, type: "u32" }),
    b1RainRow15ShuffleSeedOut: Object.freeze({ offset: 19264, type: "u32" }),
    b1RainRow15CornerPick: Object.freeze({ offset: 19268, type: "u32" }),
    b1RainRow15WorldX: Object.freeze({ offset: 19272, type: "u32" }),
    b1RainRow15WorldY: Object.freeze({ offset: 19276, type: "u32" }),
    b1RainRow15SearchOk: Object.freeze({ offset: 19280, type: "u32" }),
    b1RainRow15SearchDraws: Object.freeze({ offset: 19284, type: "u32" }),
    b1RainRow15CreateEntityPtr: Object.freeze({ offset: 19288, type: "u32" }),
    b1RainRow15BindRepositioned: Object.freeze({ offset: 19292, type: "u32" }),
    b1RainRow15BindReposDraws: Object.freeze({ offset: 19296, type: "u32" }),
    b1RainRow15ReposX: Object.freeze({ offset: 19300, type: "u32" }),
    b1RainRow15ReposY: Object.freeze({ offset: 19304, type: "u32" }),
    b1RainRow15BindStore7764: Object.freeze({ offset: 19308, type: "u32" }),
    b1RainRow16IterIndex: Object.freeze({ offset: 19312, type: "u32" }),
    b1RainRow16ShuffleSeedIn: Object.freeze({ offset: 19316, type: "u32" }),
    b1RainRow16ShuffleSeedOut: Object.freeze({ offset: 19320, type: "u32" }),
    b1RainRow16CornerPick: Object.freeze({ offset: 19324, type: "u32" }),
    b1RainRow16WorldX: Object.freeze({ offset: 19328, type: "u32" }),
    b1RainRow16WorldY: Object.freeze({ offset: 19332, type: "u32" }),
    b1RainRow16SearchOk: Object.freeze({ offset: 19336, type: "u32" }),
    b1RainRow16SearchDraws: Object.freeze({ offset: 19340, type: "u32" }),
    b1RainRow16CreateEntityPtr: Object.freeze({ offset: 19344, type: "u32" }),
    b1RainRow16BindRepositioned: Object.freeze({ offset: 19348, type: "u32" }),
    b1RainRow16BindReposDraws: Object.freeze({ offset: 19352, type: "u32" }),
    b1RainRow16ReposX: Object.freeze({ offset: 19356, type: "u32" }),
    b1RainRow16ReposY: Object.freeze({ offset: 19360, type: "u32" }),
    b1RainRow16BindStore7764: Object.freeze({ offset: 19364, type: "u32" }),
    b1RainRow17IterIndex: Object.freeze({ offset: 19368, type: "u32" }),
    b1RainRow17ShuffleSeedIn: Object.freeze({ offset: 19372, type: "u32" }),
    b1RainRow17ShuffleSeedOut: Object.freeze({ offset: 19376, type: "u32" }),
    b1RainRow17CornerPick: Object.freeze({ offset: 19380, type: "u32" }),
    b1RainRow17WorldX: Object.freeze({ offset: 19384, type: "u32" }),
    b1RainRow17WorldY: Object.freeze({ offset: 19388, type: "u32" }),
    b1RainRow17SearchOk: Object.freeze({ offset: 19392, type: "u32" }),
    b1RainRow17SearchDraws: Object.freeze({ offset: 19396, type: "u32" }),
    b1RainRow17CreateEntityPtr: Object.freeze({ offset: 19400, type: "u32" }),
    b1RainRow17BindRepositioned: Object.freeze({ offset: 19404, type: "u32" }),
    b1RainRow17BindReposDraws: Object.freeze({ offset: 19408, type: "u32" }),
    b1RainRow17ReposX: Object.freeze({ offset: 19412, type: "u32" }),
    b1RainRow17ReposY: Object.freeze({ offset: 19416, type: "u32" }),
    b1RainRow17BindStore7764: Object.freeze({ offset: 19420, type: "u32" }),
    b1RainRow18IterIndex: Object.freeze({ offset: 19424, type: "u32" }),
    b1RainRow18ShuffleSeedIn: Object.freeze({ offset: 19428, type: "u32" }),
    b1RainRow18ShuffleSeedOut: Object.freeze({ offset: 19432, type: "u32" }),
    b1RainRow18CornerPick: Object.freeze({ offset: 19436, type: "u32" }),
    b1RainRow18WorldX: Object.freeze({ offset: 19440, type: "u32" }),
    b1RainRow18WorldY: Object.freeze({ offset: 19444, type: "u32" }),
    b1RainRow18SearchOk: Object.freeze({ offset: 19448, type: "u32" }),
    b1RainRow18SearchDraws: Object.freeze({ offset: 19452, type: "u32" }),
    b1RainRow18CreateEntityPtr: Object.freeze({ offset: 19456, type: "u32" }),
    b1RainRow18BindRepositioned: Object.freeze({ offset: 19460, type: "u32" }),
    b1RainRow18BindReposDraws: Object.freeze({ offset: 19464, type: "u32" }),
    b1RainRow18ReposX: Object.freeze({ offset: 19468, type: "u32" }),
    b1RainRow18ReposY: Object.freeze({ offset: 19472, type: "u32" }),
    b1RainRow18BindStore7764: Object.freeze({ offset: 19476, type: "u32" }),
    b1RainRow19IterIndex: Object.freeze({ offset: 19480, type: "u32" }),
    b1RainRow19ShuffleSeedIn: Object.freeze({ offset: 19484, type: "u32" }),
    b1RainRow19ShuffleSeedOut: Object.freeze({ offset: 19488, type: "u32" }),
    b1RainRow19CornerPick: Object.freeze({ offset: 19492, type: "u32" }),
    b1RainRow19WorldX: Object.freeze({ offset: 19496, type: "u32" }),
    b1RainRow19WorldY: Object.freeze({ offset: 19500, type: "u32" }),
    b1RainRow19SearchOk: Object.freeze({ offset: 19504, type: "u32" }),
    b1RainRow19SearchDraws: Object.freeze({ offset: 19508, type: "u32" }),
    b1RainRow19CreateEntityPtr: Object.freeze({ offset: 19512, type: "u32" }),
    b1RainRow19BindRepositioned: Object.freeze({ offset: 19516, type: "u32" }),
    b1RainRow19BindReposDraws: Object.freeze({ offset: 19520, type: "u32" }),
    b1RainRow19ReposX: Object.freeze({ offset: 19524, type: "u32" }),
    b1RainRow19ReposY: Object.freeze({ offset: 19528, type: "u32" }),
    b1RainRow19BindStore7764: Object.freeze({ offset: 19532, type: "u32" }),
    b1RainRow20IterIndex: Object.freeze({ offset: 19536, type: "u32" }),
    b1RainRow20ShuffleSeedIn: Object.freeze({ offset: 19540, type: "u32" }),
    b1RainRow20ShuffleSeedOut: Object.freeze({ offset: 19544, type: "u32" }),
    b1RainRow20CornerPick: Object.freeze({ offset: 19548, type: "u32" }),
    b1RainRow20WorldX: Object.freeze({ offset: 19552, type: "u32" }),
    b1RainRow20WorldY: Object.freeze({ offset: 19556, type: "u32" }),
    b1RainRow20SearchOk: Object.freeze({ offset: 19560, type: "u32" }),
    b1RainRow20SearchDraws: Object.freeze({ offset: 19564, type: "u32" }),
    b1RainRow20CreateEntityPtr: Object.freeze({ offset: 19568, type: "u32" }),
    b1RainRow20BindRepositioned: Object.freeze({ offset: 19572, type: "u32" }),
    b1RainRow20BindReposDraws: Object.freeze({ offset: 19576, type: "u32" }),
    b1RainRow20ReposX: Object.freeze({ offset: 19580, type: "u32" }),
    b1RainRow20ReposY: Object.freeze({ offset: 19584, type: "u32" }),
    b1RainRow20BindStore7764: Object.freeze({ offset: 19588, type: "u32" }),
    b1RainRow21IterIndex: Object.freeze({ offset: 19592, type: "u32" }),
    b1RainRow21ShuffleSeedIn: Object.freeze({ offset: 19596, type: "u32" }),
    b1RainRow21ShuffleSeedOut: Object.freeze({ offset: 19600, type: "u32" }),
    b1RainRow21CornerPick: Object.freeze({ offset: 19604, type: "u32" }),
    b1RainRow21WorldX: Object.freeze({ offset: 19608, type: "u32" }),
    b1RainRow21WorldY: Object.freeze({ offset: 19612, type: "u32" }),
    b1RainRow21SearchOk: Object.freeze({ offset: 19616, type: "u32" }),
    b1RainRow21SearchDraws: Object.freeze({ offset: 19620, type: "u32" }),
    b1RainRow21CreateEntityPtr: Object.freeze({ offset: 19624, type: "u32" }),
    b1RainRow21BindRepositioned: Object.freeze({ offset: 19628, type: "u32" }),
    b1RainRow21BindReposDraws: Object.freeze({ offset: 19632, type: "u32" }),
    b1RainRow21ReposX: Object.freeze({ offset: 19636, type: "u32" }),
    b1RainRow21ReposY: Object.freeze({ offset: 19640, type: "u32" }),
    b1RainRow21BindStore7764: Object.freeze({ offset: 19644, type: "u32" }),
    b1RainRow22IterIndex: Object.freeze({ offset: 19648, type: "u32" }),
    b1RainRow22ShuffleSeedIn: Object.freeze({ offset: 19652, type: "u32" }),
    b1RainRow22ShuffleSeedOut: Object.freeze({ offset: 19656, type: "u32" }),
    b1RainRow22CornerPick: Object.freeze({ offset: 19660, type: "u32" }),
    b1RainRow22WorldX: Object.freeze({ offset: 19664, type: "u32" }),
    b1RainRow22WorldY: Object.freeze({ offset: 19668, type: "u32" }),
    b1RainRow22SearchOk: Object.freeze({ offset: 19672, type: "u32" }),
    b1RainRow22SearchDraws: Object.freeze({ offset: 19676, type: "u32" }),
    b1RainRow22CreateEntityPtr: Object.freeze({ offset: 19680, type: "u32" }),
    b1RainRow22BindRepositioned: Object.freeze({ offset: 19684, type: "u32" }),
    b1RainRow22BindReposDraws: Object.freeze({ offset: 19688, type: "u32" }),
    b1RainRow22ReposX: Object.freeze({ offset: 19692, type: "u32" }),
    b1RainRow22ReposY: Object.freeze({ offset: 19696, type: "u32" }),
    b1RainRow22BindStore7764: Object.freeze({ offset: 19700, type: "u32" }),
    b1RainRow23IterIndex: Object.freeze({ offset: 19704, type: "u32" }),
    b1RainRow23ShuffleSeedIn: Object.freeze({ offset: 19708, type: "u32" }),
    b1RainRow23ShuffleSeedOut: Object.freeze({ offset: 19712, type: "u32" }),
    b1RainRow23CornerPick: Object.freeze({ offset: 19716, type: "u32" }),
    b1RainRow23WorldX: Object.freeze({ offset: 19720, type: "u32" }),
    b1RainRow23WorldY: Object.freeze({ offset: 19724, type: "u32" }),
    b1RainRow23SearchOk: Object.freeze({ offset: 19728, type: "u32" }),
    b1RainRow23SearchDraws: Object.freeze({ offset: 19732, type: "u32" }),
    b1RainRow23CreateEntityPtr: Object.freeze({ offset: 19736, type: "u32" }),
    b1RainRow23BindRepositioned: Object.freeze({ offset: 19740, type: "u32" }),
    b1RainRow23BindReposDraws: Object.freeze({ offset: 19744, type: "u32" }),
    b1RainRow23ReposX: Object.freeze({ offset: 19748, type: "u32" }),
    b1RainRow23ReposY: Object.freeze({ offset: 19752, type: "u32" }),
    b1RainRow23BindStore7764: Object.freeze({ offset: 19756, type: "u32" }),
    b1RainRow24IterIndex: Object.freeze({ offset: 19760, type: "u32" }),
    b1RainRow24ShuffleSeedIn: Object.freeze({ offset: 19764, type: "u32" }),
    b1RainRow24ShuffleSeedOut: Object.freeze({ offset: 19768, type: "u32" }),
    b1RainRow24CornerPick: Object.freeze({ offset: 19772, type: "u32" }),
    b1RainRow24WorldX: Object.freeze({ offset: 19776, type: "u32" }),
    b1RainRow24WorldY: Object.freeze({ offset: 19780, type: "u32" }),
    b1RainRow24SearchOk: Object.freeze({ offset: 19784, type: "u32" }),
    b1RainRow24SearchDraws: Object.freeze({ offset: 19788, type: "u32" }),
    b1RainRow24CreateEntityPtr: Object.freeze({ offset: 19792, type: "u32" }),
    b1RainRow24BindRepositioned: Object.freeze({ offset: 19796, type: "u32" }),
    b1RainRow24BindReposDraws: Object.freeze({ offset: 19800, type: "u32" }),
    b1RainRow24ReposX: Object.freeze({ offset: 19804, type: "u32" }),
    b1RainRow24ReposY: Object.freeze({ offset: 19808, type: "u32" }),
    b1RainRow24BindStore7764: Object.freeze({ offset: 19812, type: "u32" }),
    b1RainRow25IterIndex: Object.freeze({ offset: 19816, type: "u32" }),
    b1RainRow25ShuffleSeedIn: Object.freeze({ offset: 19820, type: "u32" }),
    b1RainRow25ShuffleSeedOut: Object.freeze({ offset: 19824, type: "u32" }),
    b1RainRow25CornerPick: Object.freeze({ offset: 19828, type: "u32" }),
    b1RainRow25WorldX: Object.freeze({ offset: 19832, type: "u32" }),
    b1RainRow25WorldY: Object.freeze({ offset: 19836, type: "u32" }),
    b1RainRow25SearchOk: Object.freeze({ offset: 19840, type: "u32" }),
    b1RainRow25SearchDraws: Object.freeze({ offset: 19844, type: "u32" }),
    b1RainRow25CreateEntityPtr: Object.freeze({ offset: 19848, type: "u32" }),
    b1RainRow25BindRepositioned: Object.freeze({ offset: 19852, type: "u32" }),
    b1RainRow25BindReposDraws: Object.freeze({ offset: 19856, type: "u32" }),
    b1RainRow25ReposX: Object.freeze({ offset: 19860, type: "u32" }),
    b1RainRow25ReposY: Object.freeze({ offset: 19864, type: "u32" }),
    b1RainRow25BindStore7764: Object.freeze({ offset: 19868, type: "u32" }),
    b1RainRow26IterIndex: Object.freeze({ offset: 19872, type: "u32" }),
    b1RainRow26ShuffleSeedIn: Object.freeze({ offset: 19876, type: "u32" }),
    b1RainRow26ShuffleSeedOut: Object.freeze({ offset: 19880, type: "u32" }),
    b1RainRow26CornerPick: Object.freeze({ offset: 19884, type: "u32" }),
    b1RainRow26WorldX: Object.freeze({ offset: 19888, type: "u32" }),
    b1RainRow26WorldY: Object.freeze({ offset: 19892, type: "u32" }),
    b1RainRow26SearchOk: Object.freeze({ offset: 19896, type: "u32" }),
    b1RainRow26SearchDraws: Object.freeze({ offset: 19900, type: "u32" }),
    b1RainRow26CreateEntityPtr: Object.freeze({ offset: 19904, type: "u32" }),
    b1RainRow26BindRepositioned: Object.freeze({ offset: 19908, type: "u32" }),
    b1RainRow26BindReposDraws: Object.freeze({ offset: 19912, type: "u32" }),
    b1RainRow26ReposX: Object.freeze({ offset: 19916, type: "u32" }),
    b1RainRow26ReposY: Object.freeze({ offset: 19920, type: "u32" }),
    b1RainRow26BindStore7764: Object.freeze({ offset: 19924, type: "u32" }),
    b1RainRow27IterIndex: Object.freeze({ offset: 19928, type: "u32" }),
    b1RainRow27ShuffleSeedIn: Object.freeze({ offset: 19932, type: "u32" }),
    b1RainRow27ShuffleSeedOut: Object.freeze({ offset: 19936, type: "u32" }),
    b1RainRow27CornerPick: Object.freeze({ offset: 19940, type: "u32" }),
    b1RainRow27WorldX: Object.freeze({ offset: 19944, type: "u32" }),
    b1RainRow27WorldY: Object.freeze({ offset: 19948, type: "u32" }),
    b1RainRow27SearchOk: Object.freeze({ offset: 19952, type: "u32" }),
    b1RainRow27SearchDraws: Object.freeze({ offset: 19956, type: "u32" }),
    b1RainRow27CreateEntityPtr: Object.freeze({ offset: 19960, type: "u32" }),
    b1RainRow27BindRepositioned: Object.freeze({ offset: 19964, type: "u32" }),
    b1RainRow27BindReposDraws: Object.freeze({ offset: 19968, type: "u32" }),
    b1RainRow27ReposX: Object.freeze({ offset: 19972, type: "u32" }),
    b1RainRow27ReposY: Object.freeze({ offset: 19976, type: "u32" }),
    b1RainRow27BindStore7764: Object.freeze({ offset: 19980, type: "u32" }),
    b1RainRow28IterIndex: Object.freeze({ offset: 19984, type: "u32" }),
    b1RainRow28ShuffleSeedIn: Object.freeze({ offset: 19988, type: "u32" }),
    b1RainRow28ShuffleSeedOut: Object.freeze({ offset: 19992, type: "u32" }),
    b1RainRow28CornerPick: Object.freeze({ offset: 19996, type: "u32" }),
    b1RainRow28WorldX: Object.freeze({ offset: 20000, type: "u32" }),
    b1RainRow28WorldY: Object.freeze({ offset: 20004, type: "u32" }),
    b1RainRow28SearchOk: Object.freeze({ offset: 20008, type: "u32" }),
    b1RainRow28SearchDraws: Object.freeze({ offset: 20012, type: "u32" }),
    b1RainRow28CreateEntityPtr: Object.freeze({ offset: 20016, type: "u32" }),
    b1RainRow28BindRepositioned: Object.freeze({ offset: 20020, type: "u32" }),
    b1RainRow28BindReposDraws: Object.freeze({ offset: 20024, type: "u32" }),
    b1RainRow28ReposX: Object.freeze({ offset: 20028, type: "u32" }),
    b1RainRow28ReposY: Object.freeze({ offset: 20032, type: "u32" }),
    b1RainRow28BindStore7764: Object.freeze({ offset: 20036, type: "u32" }),
    b1RainRow29IterIndex: Object.freeze({ offset: 20040, type: "u32" }),
    b1RainRow29ShuffleSeedIn: Object.freeze({ offset: 20044, type: "u32" }),
    b1RainRow29ShuffleSeedOut: Object.freeze({ offset: 20048, type: "u32" }),
    b1RainRow29CornerPick: Object.freeze({ offset: 20052, type: "u32" }),
    b1RainRow29WorldX: Object.freeze({ offset: 20056, type: "u32" }),
    b1RainRow29WorldY: Object.freeze({ offset: 20060, type: "u32" }),
    b1RainRow29SearchOk: Object.freeze({ offset: 20064, type: "u32" }),
    b1RainRow29SearchDraws: Object.freeze({ offset: 20068, type: "u32" }),
    b1RainRow29CreateEntityPtr: Object.freeze({ offset: 20072, type: "u32" }),
    b1RainRow29BindRepositioned: Object.freeze({ offset: 20076, type: "u32" }),
    b1RainRow29BindReposDraws: Object.freeze({ offset: 20080, type: "u32" }),
    b1RainRow29ReposX: Object.freeze({ offset: 20084, type: "u32" }),
    b1RainRow29ReposY: Object.freeze({ offset: 20088, type: "u32" }),
    b1RainRow29BindStore7764: Object.freeze({ offset: 20092, type: "u32" }),
    b1RainRow30IterIndex: Object.freeze({ offset: 20096, type: "u32" }),
    b1RainRow30ShuffleSeedIn: Object.freeze({ offset: 20100, type: "u32" }),
    b1RainRow30ShuffleSeedOut: Object.freeze({ offset: 20104, type: "u32" }),
    b1RainRow30CornerPick: Object.freeze({ offset: 20108, type: "u32" }),
    b1RainRow30WorldX: Object.freeze({ offset: 20112, type: "u32" }),
    b1RainRow30WorldY: Object.freeze({ offset: 20116, type: "u32" }),
    b1RainRow30SearchOk: Object.freeze({ offset: 20120, type: "u32" }),
    b1RainRow30SearchDraws: Object.freeze({ offset: 20124, type: "u32" }),
    b1RainRow30CreateEntityPtr: Object.freeze({ offset: 20128, type: "u32" }),
    b1RainRow30BindRepositioned: Object.freeze({ offset: 20132, type: "u32" }),
    b1RainRow30BindReposDraws: Object.freeze({ offset: 20136, type: "u32" }),
    b1RainRow30ReposX: Object.freeze({ offset: 20140, type: "u32" }),
    b1RainRow30ReposY: Object.freeze({ offset: 20144, type: "u32" }),
    b1RainRow30BindStore7764: Object.freeze({ offset: 20148, type: "u32" }),
    b1RainRow31IterIndex: Object.freeze({ offset: 20152, type: "u32" }),
    b1RainRow31ShuffleSeedIn: Object.freeze({ offset: 20156, type: "u32" }),
    b1RainRow31ShuffleSeedOut: Object.freeze({ offset: 20160, type: "u32" }),
    b1RainRow31CornerPick: Object.freeze({ offset: 20164, type: "u32" }),
    b1RainRow31WorldX: Object.freeze({ offset: 20168, type: "u32" }),
    b1RainRow31WorldY: Object.freeze({ offset: 20172, type: "u32" }),
    b1RainRow31SearchOk: Object.freeze({ offset: 20176, type: "u32" }),
    b1RainRow31SearchDraws: Object.freeze({ offset: 20180, type: "u32" }),
    b1RainRow31CreateEntityPtr: Object.freeze({ offset: 20184, type: "u32" }),
    b1RainRow31BindRepositioned: Object.freeze({ offset: 20188, type: "u32" }),
    b1RainRow31BindReposDraws: Object.freeze({ offset: 20192, type: "u32" }),
    b1RainRow31ReposX: Object.freeze({ offset: 20196, type: "u32" }),
    b1RainRow31ReposY: Object.freeze({ offset: 20200, type: "u32" }),
    b1RainRow31BindStore7764: Object.freeze({ offset: 20204, type: "u32" }),
    b1RainRow32IterIndex: Object.freeze({ offset: 20208, type: "u32" }),
    b1RainRow32ShuffleSeedIn: Object.freeze({ offset: 20212, type: "u32" }),
    b1RainRow32ShuffleSeedOut: Object.freeze({ offset: 20216, type: "u32" }),
    b1RainRow32CornerPick: Object.freeze({ offset: 20220, type: "u32" }),
    b1RainRow32WorldX: Object.freeze({ offset: 20224, type: "u32" }),
    b1RainRow32WorldY: Object.freeze({ offset: 20228, type: "u32" }),
    b1RainRow32SearchOk: Object.freeze({ offset: 20232, type: "u32" }),
    b1RainRow32SearchDraws: Object.freeze({ offset: 20236, type: "u32" }),
    b1RainRow32CreateEntityPtr: Object.freeze({ offset: 20240, type: "u32" }),
    b1RainRow32BindRepositioned: Object.freeze({ offset: 20244, type: "u32" }),
    b1RainRow32BindReposDraws: Object.freeze({ offset: 20248, type: "u32" }),
    b1RainRow32ReposX: Object.freeze({ offset: 20252, type: "u32" }),
    b1RainRow32ReposY: Object.freeze({ offset: 20256, type: "u32" }),
    b1RainRow32BindStore7764: Object.freeze({ offset: 20260, type: "u32" }),
    b1RainRow33IterIndex: Object.freeze({ offset: 20264, type: "u32" }),
    b1RainRow33ShuffleSeedIn: Object.freeze({ offset: 20268, type: "u32" }),
    b1RainRow33ShuffleSeedOut: Object.freeze({ offset: 20272, type: "u32" }),
    b1RainRow33CornerPick: Object.freeze({ offset: 20276, type: "u32" }),
    b1RainRow33WorldX: Object.freeze({ offset: 20280, type: "u32" }),
    b1RainRow33WorldY: Object.freeze({ offset: 20284, type: "u32" }),
    b1RainRow33SearchOk: Object.freeze({ offset: 20288, type: "u32" }),
    b1RainRow33SearchDraws: Object.freeze({ offset: 20292, type: "u32" }),
    b1RainRow33CreateEntityPtr: Object.freeze({ offset: 20296, type: "u32" }),
    b1RainRow33BindRepositioned: Object.freeze({ offset: 20300, type: "u32" }),
    b1RainRow33BindReposDraws: Object.freeze({ offset: 20304, type: "u32" }),
    b1RainRow33ReposX: Object.freeze({ offset: 20308, type: "u32" }),
    b1RainRow33ReposY: Object.freeze({ offset: 20312, type: "u32" }),
    b1RainRow33BindStore7764: Object.freeze({ offset: 20316, type: "u32" }),
    b1RainRow34IterIndex: Object.freeze({ offset: 20320, type: "u32" }),
    b1RainRow34ShuffleSeedIn: Object.freeze({ offset: 20324, type: "u32" }),
    b1RainRow34ShuffleSeedOut: Object.freeze({ offset: 20328, type: "u32" }),
    b1RainRow34CornerPick: Object.freeze({ offset: 20332, type: "u32" }),
    b1RainRow34WorldX: Object.freeze({ offset: 20336, type: "u32" }),
    b1RainRow34WorldY: Object.freeze({ offset: 20340, type: "u32" }),
    b1RainRow34SearchOk: Object.freeze({ offset: 20344, type: "u32" }),
    b1RainRow34SearchDraws: Object.freeze({ offset: 20348, type: "u32" }),
    b1RainRow34CreateEntityPtr: Object.freeze({ offset: 20352, type: "u32" }),
    b1RainRow34BindRepositioned: Object.freeze({ offset: 20356, type: "u32" }),
    b1RainRow34BindReposDraws: Object.freeze({ offset: 20360, type: "u32" }),
    b1RainRow34ReposX: Object.freeze({ offset: 20364, type: "u32" }),
    b1RainRow34ReposY: Object.freeze({ offset: 20368, type: "u32" }),
    b1RainRow34BindStore7764: Object.freeze({ offset: 20372, type: "u32" }),
    b1RainRow35IterIndex: Object.freeze({ offset: 20376, type: "u32" }),
    b1RainRow35ShuffleSeedIn: Object.freeze({ offset: 20380, type: "u32" }),
    b1RainRow35ShuffleSeedOut: Object.freeze({ offset: 20384, type: "u32" }),
    b1RainRow35CornerPick: Object.freeze({ offset: 20388, type: "u32" }),
    b1RainRow35WorldX: Object.freeze({ offset: 20392, type: "u32" }),
    b1RainRow35WorldY: Object.freeze({ offset: 20396, type: "u32" }),
    b1RainRow35SearchOk: Object.freeze({ offset: 20400, type: "u32" }),
    b1RainRow35SearchDraws: Object.freeze({ offset: 20404, type: "u32" }),
    b1RainRow35CreateEntityPtr: Object.freeze({ offset: 20408, type: "u32" }),
    b1RainRow35BindRepositioned: Object.freeze({ offset: 20412, type: "u32" }),
    b1RainRow35BindReposDraws: Object.freeze({ offset: 20416, type: "u32" }),
    b1RainRow35ReposX: Object.freeze({ offset: 20420, type: "u32" }),
    b1RainRow35ReposY: Object.freeze({ offset: 20424, type: "u32" }),
    b1RainRow35BindStore7764: Object.freeze({ offset: 20428, type: "u32" }),
    b1RainRow36IterIndex: Object.freeze({ offset: 20432, type: "u32" }),
    b1RainRow36ShuffleSeedIn: Object.freeze({ offset: 20436, type: "u32" }),
    b1RainRow36ShuffleSeedOut: Object.freeze({ offset: 20440, type: "u32" }),
    b1RainRow36CornerPick: Object.freeze({ offset: 20444, type: "u32" }),
    b1RainRow36WorldX: Object.freeze({ offset: 20448, type: "u32" }),
    b1RainRow36WorldY: Object.freeze({ offset: 20452, type: "u32" }),
    b1RainRow36SearchOk: Object.freeze({ offset: 20456, type: "u32" }),
    b1RainRow36SearchDraws: Object.freeze({ offset: 20460, type: "u32" }),
    b1RainRow36CreateEntityPtr: Object.freeze({ offset: 20464, type: "u32" }),
    b1RainRow36BindRepositioned: Object.freeze({ offset: 20468, type: "u32" }),
    b1RainRow36BindReposDraws: Object.freeze({ offset: 20472, type: "u32" }),
    b1RainRow36ReposX: Object.freeze({ offset: 20476, type: "u32" }),
    b1RainRow36ReposY: Object.freeze({ offset: 20480, type: "u32" }),
    b1RainRow36BindStore7764: Object.freeze({ offset: 20484, type: "u32" }),
    b1RainRow37IterIndex: Object.freeze({ offset: 20488, type: "u32" }),
    b1RainRow37ShuffleSeedIn: Object.freeze({ offset: 20492, type: "u32" }),
    b1RainRow37ShuffleSeedOut: Object.freeze({ offset: 20496, type: "u32" }),
    b1RainRow37CornerPick: Object.freeze({ offset: 20500, type: "u32" }),
    b1RainRow37WorldX: Object.freeze({ offset: 20504, type: "u32" }),
    b1RainRow37WorldY: Object.freeze({ offset: 20508, type: "u32" }),
    b1RainRow37SearchOk: Object.freeze({ offset: 20512, type: "u32" }),
    b1RainRow37SearchDraws: Object.freeze({ offset: 20516, type: "u32" }),
    b1RainRow37CreateEntityPtr: Object.freeze({ offset: 20520, type: "u32" }),
    b1RainRow37BindRepositioned: Object.freeze({ offset: 20524, type: "u32" }),
    b1RainRow37BindReposDraws: Object.freeze({ offset: 20528, type: "u32" }),
    b1RainRow37ReposX: Object.freeze({ offset: 20532, type: "u32" }),
    b1RainRow37ReposY: Object.freeze({ offset: 20536, type: "u32" }),
    b1RainRow37BindStore7764: Object.freeze({ offset: 20540, type: "u32" }),
    b1RainRow38IterIndex: Object.freeze({ offset: 20544, type: "u32" }),
    b1RainRow38ShuffleSeedIn: Object.freeze({ offset: 20548, type: "u32" }),
    b1RainRow38ShuffleSeedOut: Object.freeze({ offset: 20552, type: "u32" }),
    b1RainRow38CornerPick: Object.freeze({ offset: 20556, type: "u32" }),
    b1RainRow38WorldX: Object.freeze({ offset: 20560, type: "u32" }),
    b1RainRow38WorldY: Object.freeze({ offset: 20564, type: "u32" }),
    b1RainRow38SearchOk: Object.freeze({ offset: 20568, type: "u32" }),
    b1RainRow38SearchDraws: Object.freeze({ offset: 20572, type: "u32" }),
    b1RainRow38CreateEntityPtr: Object.freeze({ offset: 20576, type: "u32" }),
    b1RainRow38BindRepositioned: Object.freeze({ offset: 20580, type: "u32" }),
    b1RainRow38BindReposDraws: Object.freeze({ offset: 20584, type: "u32" }),
    b1RainRow38ReposX: Object.freeze({ offset: 20588, type: "u32" }),
    b1RainRow38ReposY: Object.freeze({ offset: 20592, type: "u32" }),
    b1RainRow38BindStore7764: Object.freeze({ offset: 20596, type: "u32" }),
    b1RainRow39IterIndex: Object.freeze({ offset: 20600, type: "u32" }),
    b1RainRow39ShuffleSeedIn: Object.freeze({ offset: 20604, type: "u32" }),
    b1RainRow39ShuffleSeedOut: Object.freeze({ offset: 20608, type: "u32" }),
    b1RainRow39CornerPick: Object.freeze({ offset: 20612, type: "u32" }),
    b1RainRow39WorldX: Object.freeze({ offset: 20616, type: "u32" }),
    b1RainRow39WorldY: Object.freeze({ offset: 20620, type: "u32" }),
    b1RainRow39SearchOk: Object.freeze({ offset: 20624, type: "u32" }),
    b1RainRow39SearchDraws: Object.freeze({ offset: 20628, type: "u32" }),
    b1RainRow39CreateEntityPtr: Object.freeze({ offset: 20632, type: "u32" }),
    b1RainRow39BindRepositioned: Object.freeze({ offset: 20636, type: "u32" }),
    b1RainRow39BindReposDraws: Object.freeze({ offset: 20640, type: "u32" }),
    b1RainRow39ReposX: Object.freeze({ offset: 20644, type: "u32" }),
    b1RainRow39ReposY: Object.freeze({ offset: 20648, type: "u32" }),
    b1RainRow39BindStore7764: Object.freeze({ offset: 20652, type: "u32" }),
    b1RainRow40IterIndex: Object.freeze({ offset: 20656, type: "u32" }),
    b1RainRow40ShuffleSeedIn: Object.freeze({ offset: 20660, type: "u32" }),
    b1RainRow40ShuffleSeedOut: Object.freeze({ offset: 20664, type: "u32" }),
    b1RainRow40CornerPick: Object.freeze({ offset: 20668, type: "u32" }),
    b1RainRow40WorldX: Object.freeze({ offset: 20672, type: "u32" }),
    b1RainRow40WorldY: Object.freeze({ offset: 20676, type: "u32" }),
    b1RainRow40SearchOk: Object.freeze({ offset: 20680, type: "u32" }),
    b1RainRow40SearchDraws: Object.freeze({ offset: 20684, type: "u32" }),
    b1RainRow40CreateEntityPtr: Object.freeze({ offset: 20688, type: "u32" }),
    b1RainRow40BindRepositioned: Object.freeze({ offset: 20692, type: "u32" }),
    b1RainRow40BindReposDraws: Object.freeze({ offset: 20696, type: "u32" }),
    b1RainRow40ReposX: Object.freeze({ offset: 20700, type: "u32" }),
    b1RainRow40ReposY: Object.freeze({ offset: 20704, type: "u32" }),
    b1RainRow40BindStore7764: Object.freeze({ offset: 20708, type: "u32" }),
    b1RainRow41IterIndex: Object.freeze({ offset: 20712, type: "u32" }),
    b1RainRow41ShuffleSeedIn: Object.freeze({ offset: 20716, type: "u32" }),
    b1RainRow41ShuffleSeedOut: Object.freeze({ offset: 20720, type: "u32" }),
    b1RainRow41CornerPick: Object.freeze({ offset: 20724, type: "u32" }),
    b1RainRow41WorldX: Object.freeze({ offset: 20728, type: "u32" }),
    b1RainRow41WorldY: Object.freeze({ offset: 20732, type: "u32" }),
    b1RainRow41SearchOk: Object.freeze({ offset: 20736, type: "u32" }),
    b1RainRow41SearchDraws: Object.freeze({ offset: 20740, type: "u32" }),
    b1RainRow41CreateEntityPtr: Object.freeze({ offset: 20744, type: "u32" }),
    b1RainRow41BindRepositioned: Object.freeze({ offset: 20748, type: "u32" }),
    b1RainRow41BindReposDraws: Object.freeze({ offset: 20752, type: "u32" }),
    b1RainRow41ReposX: Object.freeze({ offset: 20756, type: "u32" }),
    b1RainRow41ReposY: Object.freeze({ offset: 20760, type: "u32" }),
    b1RainRow41BindStore7764: Object.freeze({ offset: 20764, type: "u32" }),
    b1RainRow42IterIndex: Object.freeze({ offset: 20768, type: "u32" }),
    b1RainRow42ShuffleSeedIn: Object.freeze({ offset: 20772, type: "u32" }),
    b1RainRow42ShuffleSeedOut: Object.freeze({ offset: 20776, type: "u32" }),
    b1RainRow42CornerPick: Object.freeze({ offset: 20780, type: "u32" }),
    b1RainRow42WorldX: Object.freeze({ offset: 20784, type: "u32" }),
    b1RainRow42WorldY: Object.freeze({ offset: 20788, type: "u32" }),
    b1RainRow42SearchOk: Object.freeze({ offset: 20792, type: "u32" }),
    b1RainRow42SearchDraws: Object.freeze({ offset: 20796, type: "u32" }),
    b1RainRow42CreateEntityPtr: Object.freeze({ offset: 20800, type: "u32" }),
    b1RainRow42BindRepositioned: Object.freeze({ offset: 20804, type: "u32" }),
    b1RainRow42BindReposDraws: Object.freeze({ offset: 20808, type: "u32" }),
    b1RainRow42ReposX: Object.freeze({ offset: 20812, type: "u32" }),
    b1RainRow42ReposY: Object.freeze({ offset: 20816, type: "u32" }),
    b1RainRow42BindStore7764: Object.freeze({ offset: 20820, type: "u32" }),
    b1RainRow43IterIndex: Object.freeze({ offset: 20824, type: "u32" }),
    b1RainRow43ShuffleSeedIn: Object.freeze({ offset: 20828, type: "u32" }),
    b1RainRow43ShuffleSeedOut: Object.freeze({ offset: 20832, type: "u32" }),
    b1RainRow43CornerPick: Object.freeze({ offset: 20836, type: "u32" }),
    b1RainRow43WorldX: Object.freeze({ offset: 20840, type: "u32" }),
    b1RainRow43WorldY: Object.freeze({ offset: 20844, type: "u32" }),
    b1RainRow43SearchOk: Object.freeze({ offset: 20848, type: "u32" }),
    b1RainRow43SearchDraws: Object.freeze({ offset: 20852, type: "u32" }),
    b1RainRow43CreateEntityPtr: Object.freeze({ offset: 20856, type: "u32" }),
    b1RainRow43BindRepositioned: Object.freeze({ offset: 20860, type: "u32" }),
    b1RainRow43BindReposDraws: Object.freeze({ offset: 20864, type: "u32" }),
    b1RainRow43ReposX: Object.freeze({ offset: 20868, type: "u32" }),
    b1RainRow43ReposY: Object.freeze({ offset: 20872, type: "u32" }),
    b1RainRow43BindStore7764: Object.freeze({ offset: 20876, type: "u32" }),
    b1RainRow44IterIndex: Object.freeze({ offset: 20880, type: "u32" }),
    b1RainRow44ShuffleSeedIn: Object.freeze({ offset: 20884, type: "u32" }),
    b1RainRow44ShuffleSeedOut: Object.freeze({ offset: 20888, type: "u32" }),
    b1RainRow44CornerPick: Object.freeze({ offset: 20892, type: "u32" }),
    b1RainRow44WorldX: Object.freeze({ offset: 20896, type: "u32" }),
    b1RainRow44WorldY: Object.freeze({ offset: 20900, type: "u32" }),
    b1RainRow44SearchOk: Object.freeze({ offset: 20904, type: "u32" }),
    b1RainRow44SearchDraws: Object.freeze({ offset: 20908, type: "u32" }),
    b1RainRow44CreateEntityPtr: Object.freeze({ offset: 20912, type: "u32" }),
    b1RainRow44BindRepositioned: Object.freeze({ offset: 20916, type: "u32" }),
    b1RainRow44BindReposDraws: Object.freeze({ offset: 20920, type: "u32" }),
    b1RainRow44ReposX: Object.freeze({ offset: 20924, type: "u32" }),
    b1RainRow44ReposY: Object.freeze({ offset: 20928, type: "u32" }),
    b1RainRow44BindStore7764: Object.freeze({ offset: 20932, type: "u32" }),
    b1RainRow45IterIndex: Object.freeze({ offset: 20936, type: "u32" }),
    b1RainRow45ShuffleSeedIn: Object.freeze({ offset: 20940, type: "u32" }),
    b1RainRow45ShuffleSeedOut: Object.freeze({ offset: 20944, type: "u32" }),
    b1RainRow45CornerPick: Object.freeze({ offset: 20948, type: "u32" }),
    b1RainRow45WorldX: Object.freeze({ offset: 20952, type: "u32" }),
    b1RainRow45WorldY: Object.freeze({ offset: 20956, type: "u32" }),
    b1RainRow45SearchOk: Object.freeze({ offset: 20960, type: "u32" }),
    b1RainRow45SearchDraws: Object.freeze({ offset: 20964, type: "u32" }),
    b1RainRow45CreateEntityPtr: Object.freeze({ offset: 20968, type: "u32" }),
    b1RainRow45BindRepositioned: Object.freeze({ offset: 20972, type: "u32" }),
    b1RainRow45BindReposDraws: Object.freeze({ offset: 20976, type: "u32" }),
    b1RainRow45ReposX: Object.freeze({ offset: 20980, type: "u32" }),
    b1RainRow45ReposY: Object.freeze({ offset: 20984, type: "u32" }),
    b1RainRow45BindStore7764: Object.freeze({ offset: 20988, type: "u32" }),
    b1RainRow46IterIndex: Object.freeze({ offset: 20992, type: "u32" }),
    b1RainRow46ShuffleSeedIn: Object.freeze({ offset: 20996, type: "u32" }),
    b1RainRow46ShuffleSeedOut: Object.freeze({ offset: 21000, type: "u32" }),
    b1RainRow46CornerPick: Object.freeze({ offset: 21004, type: "u32" }),
    b1RainRow46WorldX: Object.freeze({ offset: 21008, type: "u32" }),
    b1RainRow46WorldY: Object.freeze({ offset: 21012, type: "u32" }),
    b1RainRow46SearchOk: Object.freeze({ offset: 21016, type: "u32" }),
    b1RainRow46SearchDraws: Object.freeze({ offset: 21020, type: "u32" }),
    b1RainRow46CreateEntityPtr: Object.freeze({ offset: 21024, type: "u32" }),
    b1RainRow46BindRepositioned: Object.freeze({ offset: 21028, type: "u32" }),
    b1RainRow46BindReposDraws: Object.freeze({ offset: 21032, type: "u32" }),
    b1RainRow46ReposX: Object.freeze({ offset: 21036, type: "u32" }),
    b1RainRow46ReposY: Object.freeze({ offset: 21040, type: "u32" }),
    b1RainRow46BindStore7764: Object.freeze({ offset: 21044, type: "u32" }),
    b1RainRow47IterIndex: Object.freeze({ offset: 21048, type: "u32" }),
    b1RainRow47ShuffleSeedIn: Object.freeze({ offset: 21052, type: "u32" }),
    b1RainRow47ShuffleSeedOut: Object.freeze({ offset: 21056, type: "u32" }),
    b1RainRow47CornerPick: Object.freeze({ offset: 21060, type: "u32" }),
    b1RainRow47WorldX: Object.freeze({ offset: 21064, type: "u32" }),
    b1RainRow47WorldY: Object.freeze({ offset: 21068, type: "u32" }),
    b1RainRow47SearchOk: Object.freeze({ offset: 21072, type: "u32" }),
    b1RainRow47SearchDraws: Object.freeze({ offset: 21076, type: "u32" }),
    b1RainRow47CreateEntityPtr: Object.freeze({ offset: 21080, type: "u32" }),
    b1RainRow47BindRepositioned: Object.freeze({ offset: 21084, type: "u32" }),
    b1RainRow47BindReposDraws: Object.freeze({ offset: 21088, type: "u32" }),
    b1RainRow47ReposX: Object.freeze({ offset: 21092, type: "u32" }),
    b1RainRow47ReposY: Object.freeze({ offset: 21096, type: "u32" }),
    b1RainRow47BindStore7764: Object.freeze({ offset: 21100, type: "u32" }),
    b1RainRow48IterIndex: Object.freeze({ offset: 21104, type: "u32" }),
    b1RainRow48ShuffleSeedIn: Object.freeze({ offset: 21108, type: "u32" }),
    b1RainRow48ShuffleSeedOut: Object.freeze({ offset: 21112, type: "u32" }),
    b1RainRow48CornerPick: Object.freeze({ offset: 21116, type: "u32" }),
    b1RainRow48WorldX: Object.freeze({ offset: 21120, type: "u32" }),
    b1RainRow48WorldY: Object.freeze({ offset: 21124, type: "u32" }),
    b1RainRow48SearchOk: Object.freeze({ offset: 21128, type: "u32" }),
    b1RainRow48SearchDraws: Object.freeze({ offset: 21132, type: "u32" }),
    b1RainRow48CreateEntityPtr: Object.freeze({ offset: 21136, type: "u32" }),
    b1RainRow48BindRepositioned: Object.freeze({ offset: 21140, type: "u32" }),
    b1RainRow48BindReposDraws: Object.freeze({ offset: 21144, type: "u32" }),
    b1RainRow48ReposX: Object.freeze({ offset: 21148, type: "u32" }),
    b1RainRow48ReposY: Object.freeze({ offset: 21152, type: "u32" }),
    b1RainRow48BindStore7764: Object.freeze({ offset: 21156, type: "u32" }),
    b1RainRow49IterIndex: Object.freeze({ offset: 21160, type: "u32" }),
    b1RainRow49ShuffleSeedIn: Object.freeze({ offset: 21164, type: "u32" }),
    b1RainRow49ShuffleSeedOut: Object.freeze({ offset: 21168, type: "u32" }),
    b1RainRow49CornerPick: Object.freeze({ offset: 21172, type: "u32" }),
    b1RainRow49WorldX: Object.freeze({ offset: 21176, type: "u32" }),
    b1RainRow49WorldY: Object.freeze({ offset: 21180, type: "u32" }),
    b1RainRow49SearchOk: Object.freeze({ offset: 21184, type: "u32" }),
    b1RainRow49SearchDraws: Object.freeze({ offset: 21188, type: "u32" }),
    b1RainRow49CreateEntityPtr: Object.freeze({ offset: 21192, type: "u32" }),
    b1RainRow49BindRepositioned: Object.freeze({ offset: 21196, type: "u32" }),
    b1RainRow49BindReposDraws: Object.freeze({ offset: 21200, type: "u32" }),
    b1RainRow49ReposX: Object.freeze({ offset: 21204, type: "u32" }),
    b1RainRow49ReposY: Object.freeze({ offset: 21208, type: "u32" }),
    b1RainRow49BindStore7764: Object.freeze({ offset: 21212, type: "u32" }),
    b1RainRow50IterIndex: Object.freeze({ offset: 21216, type: "u32" }),
    b1RainRow50ShuffleSeedIn: Object.freeze({ offset: 21220, type: "u32" }),
    b1RainRow50ShuffleSeedOut: Object.freeze({ offset: 21224, type: "u32" }),
    b1RainRow50CornerPick: Object.freeze({ offset: 21228, type: "u32" }),
    b1RainRow50WorldX: Object.freeze({ offset: 21232, type: "u32" }),
    b1RainRow50WorldY: Object.freeze({ offset: 21236, type: "u32" }),
    b1RainRow50SearchOk: Object.freeze({ offset: 21240, type: "u32" }),
    b1RainRow50SearchDraws: Object.freeze({ offset: 21244, type: "u32" }),
    b1RainRow50CreateEntityPtr: Object.freeze({ offset: 21248, type: "u32" }),
    b1RainRow50BindRepositioned: Object.freeze({ offset: 21252, type: "u32" }),
    b1RainRow50BindReposDraws: Object.freeze({ offset: 21256, type: "u32" }),
    b1RainRow50ReposX: Object.freeze({ offset: 21260, type: "u32" }),
    b1RainRow50ReposY: Object.freeze({ offset: 21264, type: "u32" }),
    b1RainRow50BindStore7764: Object.freeze({ offset: 21268, type: "u32" }),
    b1RainRow51IterIndex: Object.freeze({ offset: 21272, type: "u32" }),
    b1RainRow51ShuffleSeedIn: Object.freeze({ offset: 21276, type: "u32" }),
    b1RainRow51ShuffleSeedOut: Object.freeze({ offset: 21280, type: "u32" }),
    b1RainRow51CornerPick: Object.freeze({ offset: 21284, type: "u32" }),
    b1RainRow51WorldX: Object.freeze({ offset: 21288, type: "u32" }),
    b1RainRow51WorldY: Object.freeze({ offset: 21292, type: "u32" }),
    b1RainRow51SearchOk: Object.freeze({ offset: 21296, type: "u32" }),
    b1RainRow51SearchDraws: Object.freeze({ offset: 21300, type: "u32" }),
    b1RainRow51CreateEntityPtr: Object.freeze({ offset: 21304, type: "u32" }),
    b1RainRow51BindRepositioned: Object.freeze({ offset: 21308, type: "u32" }),
    b1RainRow51BindReposDraws: Object.freeze({ offset: 21312, type: "u32" }),
    b1RainRow51ReposX: Object.freeze({ offset: 21316, type: "u32" }),
    b1RainRow51ReposY: Object.freeze({ offset: 21320, type: "u32" }),
    b1RainRow51BindStore7764: Object.freeze({ offset: 21324, type: "u32" }),
    b1RainRow52IterIndex: Object.freeze({ offset: 21328, type: "u32" }),
    b1RainRow52ShuffleSeedIn: Object.freeze({ offset: 21332, type: "u32" }),
    b1RainRow52ShuffleSeedOut: Object.freeze({ offset: 21336, type: "u32" }),
    b1RainRow52CornerPick: Object.freeze({ offset: 21340, type: "u32" }),
    b1RainRow52WorldX: Object.freeze({ offset: 21344, type: "u32" }),
    b1RainRow52WorldY: Object.freeze({ offset: 21348, type: "u32" }),
    b1RainRow52SearchOk: Object.freeze({ offset: 21352, type: "u32" }),
    b1RainRow52SearchDraws: Object.freeze({ offset: 21356, type: "u32" }),
    b1RainRow52CreateEntityPtr: Object.freeze({ offset: 21360, type: "u32" }),
    b1RainRow52BindRepositioned: Object.freeze({ offset: 21364, type: "u32" }),
    b1RainRow52BindReposDraws: Object.freeze({ offset: 21368, type: "u32" }),
    b1RainRow52ReposX: Object.freeze({ offset: 21372, type: "u32" }),
    b1RainRow52ReposY: Object.freeze({ offset: 21376, type: "u32" }),
    b1RainRow52BindStore7764: Object.freeze({ offset: 21380, type: "u32" }),
    b1RainRow53IterIndex: Object.freeze({ offset: 21384, type: "u32" }),
    b1RainRow53ShuffleSeedIn: Object.freeze({ offset: 21388, type: "u32" }),
    b1RainRow53ShuffleSeedOut: Object.freeze({ offset: 21392, type: "u32" }),
    b1RainRow53CornerPick: Object.freeze({ offset: 21396, type: "u32" }),
    b1RainRow53WorldX: Object.freeze({ offset: 21400, type: "u32" }),
    b1RainRow53WorldY: Object.freeze({ offset: 21404, type: "u32" }),
    b1RainRow53SearchOk: Object.freeze({ offset: 21408, type: "u32" }),
    b1RainRow53SearchDraws: Object.freeze({ offset: 21412, type: "u32" }),
    b1RainRow53CreateEntityPtr: Object.freeze({ offset: 21416, type: "u32" }),
    b1RainRow53BindRepositioned: Object.freeze({ offset: 21420, type: "u32" }),
    b1RainRow53BindReposDraws: Object.freeze({ offset: 21424, type: "u32" }),
    b1RainRow53ReposX: Object.freeze({ offset: 21428, type: "u32" }),
    b1RainRow53ReposY: Object.freeze({ offset: 21432, type: "u32" }),
    b1RainRow53BindStore7764: Object.freeze({ offset: 21436, type: "u32" }),
    b1RainRow54IterIndex: Object.freeze({ offset: 21440, type: "u32" }),
    b1RainRow54ShuffleSeedIn: Object.freeze({ offset: 21444, type: "u32" }),
    b1RainRow54ShuffleSeedOut: Object.freeze({ offset: 21448, type: "u32" }),
    b1RainRow54CornerPick: Object.freeze({ offset: 21452, type: "u32" }),
    b1RainRow54WorldX: Object.freeze({ offset: 21456, type: "u32" }),
    b1RainRow54WorldY: Object.freeze({ offset: 21460, type: "u32" }),
    b1RainRow54SearchOk: Object.freeze({ offset: 21464, type: "u32" }),
    b1RainRow54SearchDraws: Object.freeze({ offset: 21468, type: "u32" }),
    b1RainRow54CreateEntityPtr: Object.freeze({ offset: 21472, type: "u32" }),
    b1RainRow54BindRepositioned: Object.freeze({ offset: 21476, type: "u32" }),
    b1RainRow54BindReposDraws: Object.freeze({ offset: 21480, type: "u32" }),
    b1RainRow54ReposX: Object.freeze({ offset: 21484, type: "u32" }),
    b1RainRow54ReposY: Object.freeze({ offset: 21488, type: "u32" }),
    b1RainRow54BindStore7764: Object.freeze({ offset: 21492, type: "u32" }),
    b1RainRow55IterIndex: Object.freeze({ offset: 21496, type: "u32" }),
    b1RainRow55ShuffleSeedIn: Object.freeze({ offset: 21500, type: "u32" }),
    b1RainRow55ShuffleSeedOut: Object.freeze({ offset: 21504, type: "u32" }),
    b1RainRow55CornerPick: Object.freeze({ offset: 21508, type: "u32" }),
    b1RainRow55WorldX: Object.freeze({ offset: 21512, type: "u32" }),
    b1RainRow55WorldY: Object.freeze({ offset: 21516, type: "u32" }),
    b1RainRow55SearchOk: Object.freeze({ offset: 21520, type: "u32" }),
    b1RainRow55SearchDraws: Object.freeze({ offset: 21524, type: "u32" }),
    b1RainRow55CreateEntityPtr: Object.freeze({ offset: 21528, type: "u32" }),
    b1RainRow55BindRepositioned: Object.freeze({ offset: 21532, type: "u32" }),
    b1RainRow55BindReposDraws: Object.freeze({ offset: 21536, type: "u32" }),
    b1RainRow55ReposX: Object.freeze({ offset: 21540, type: "u32" }),
    b1RainRow55ReposY: Object.freeze({ offset: 21544, type: "u32" }),
    b1RainRow55BindStore7764: Object.freeze({ offset: 21548, type: "u32" }),
    b1RainRow56IterIndex: Object.freeze({ offset: 21552, type: "u32" }),
    b1RainRow56ShuffleSeedIn: Object.freeze({ offset: 21556, type: "u32" }),
    b1RainRow56ShuffleSeedOut: Object.freeze({ offset: 21560, type: "u32" }),
    b1RainRow56CornerPick: Object.freeze({ offset: 21564, type: "u32" }),
    b1RainRow56WorldX: Object.freeze({ offset: 21568, type: "u32" }),
    b1RainRow56WorldY: Object.freeze({ offset: 21572, type: "u32" }),
    b1RainRow56SearchOk: Object.freeze({ offset: 21576, type: "u32" }),
    b1RainRow56SearchDraws: Object.freeze({ offset: 21580, type: "u32" }),
    b1RainRow56CreateEntityPtr: Object.freeze({ offset: 21584, type: "u32" }),
    b1RainRow56BindRepositioned: Object.freeze({ offset: 21588, type: "u32" }),
    b1RainRow56BindReposDraws: Object.freeze({ offset: 21592, type: "u32" }),
    b1RainRow56ReposX: Object.freeze({ offset: 21596, type: "u32" }),
    b1RainRow56ReposY: Object.freeze({ offset: 21600, type: "u32" }),
    b1RainRow56BindStore7764: Object.freeze({ offset: 21604, type: "u32" }),
    b1RainRow57IterIndex: Object.freeze({ offset: 21608, type: "u32" }),
    b1RainRow57ShuffleSeedIn: Object.freeze({ offset: 21612, type: "u32" }),
    b1RainRow57ShuffleSeedOut: Object.freeze({ offset: 21616, type: "u32" }),
    b1RainRow57CornerPick: Object.freeze({ offset: 21620, type: "u32" }),
    b1RainRow57WorldX: Object.freeze({ offset: 21624, type: "u32" }),
    b1RainRow57WorldY: Object.freeze({ offset: 21628, type: "u32" }),
    b1RainRow57SearchOk: Object.freeze({ offset: 21632, type: "u32" }),
    b1RainRow57SearchDraws: Object.freeze({ offset: 21636, type: "u32" }),
    b1RainRow57CreateEntityPtr: Object.freeze({ offset: 21640, type: "u32" }),
    b1RainRow57BindRepositioned: Object.freeze({ offset: 21644, type: "u32" }),
    b1RainRow57BindReposDraws: Object.freeze({ offset: 21648, type: "u32" }),
    b1RainRow57ReposX: Object.freeze({ offset: 21652, type: "u32" }),
    b1RainRow57ReposY: Object.freeze({ offset: 21656, type: "u32" }),
    b1RainRow57BindStore7764: Object.freeze({ offset: 21660, type: "u32" }),
    b1RainRow58IterIndex: Object.freeze({ offset: 21664, type: "u32" }),
    b1RainRow58ShuffleSeedIn: Object.freeze({ offset: 21668, type: "u32" }),
    b1RainRow58ShuffleSeedOut: Object.freeze({ offset: 21672, type: "u32" }),
    b1RainRow58CornerPick: Object.freeze({ offset: 21676, type: "u32" }),
    b1RainRow58WorldX: Object.freeze({ offset: 21680, type: "u32" }),
    b1RainRow58WorldY: Object.freeze({ offset: 21684, type: "u32" }),
    b1RainRow58SearchOk: Object.freeze({ offset: 21688, type: "u32" }),
    b1RainRow58SearchDraws: Object.freeze({ offset: 21692, type: "u32" }),
    b1RainRow58CreateEntityPtr: Object.freeze({ offset: 21696, type: "u32" }),
    b1RainRow58BindRepositioned: Object.freeze({ offset: 21700, type: "u32" }),
    b1RainRow58BindReposDraws: Object.freeze({ offset: 21704, type: "u32" }),
    b1RainRow58ReposX: Object.freeze({ offset: 21708, type: "u32" }),
    b1RainRow58ReposY: Object.freeze({ offset: 21712, type: "u32" }),
    b1RainRow58BindStore7764: Object.freeze({ offset: 21716, type: "u32" }),
    b1RainRow59IterIndex: Object.freeze({ offset: 21720, type: "u32" }),
    b1RainRow59ShuffleSeedIn: Object.freeze({ offset: 21724, type: "u32" }),
    b1RainRow59ShuffleSeedOut: Object.freeze({ offset: 21728, type: "u32" }),
    b1RainRow59CornerPick: Object.freeze({ offset: 21732, type: "u32" }),
    b1RainRow59WorldX: Object.freeze({ offset: 21736, type: "u32" }),
    b1RainRow59WorldY: Object.freeze({ offset: 21740, type: "u32" }),
    b1RainRow59SearchOk: Object.freeze({ offset: 21744, type: "u32" }),
    b1RainRow59SearchDraws: Object.freeze({ offset: 21748, type: "u32" }),
    b1RainRow59CreateEntityPtr: Object.freeze({ offset: 21752, type: "u32" }),
    b1RainRow59BindRepositioned: Object.freeze({ offset: 21756, type: "u32" }),
    b1RainRow59BindReposDraws: Object.freeze({ offset: 21760, type: "u32" }),
    b1RainRow59ReposX: Object.freeze({ offset: 21764, type: "u32" }),
    b1RainRow59ReposY: Object.freeze({ offset: 21768, type: "u32" }),
    b1RainRow59BindStore7764: Object.freeze({ offset: 21772, type: "u32" }),
    b1RainRow60IterIndex: Object.freeze({ offset: 21776, type: "u32" }),
    b1RainRow60ShuffleSeedIn: Object.freeze({ offset: 21780, type: "u32" }),
    b1RainRow60ShuffleSeedOut: Object.freeze({ offset: 21784, type: "u32" }),
    b1RainRow60CornerPick: Object.freeze({ offset: 21788, type: "u32" }),
    b1RainRow60WorldX: Object.freeze({ offset: 21792, type: "u32" }),
    b1RainRow60WorldY: Object.freeze({ offset: 21796, type: "u32" }),
    b1RainRow60SearchOk: Object.freeze({ offset: 21800, type: "u32" }),
    b1RainRow60SearchDraws: Object.freeze({ offset: 21804, type: "u32" }),
    b1RainRow60CreateEntityPtr: Object.freeze({ offset: 21808, type: "u32" }),
    b1RainRow60BindRepositioned: Object.freeze({ offset: 21812, type: "u32" }),
    b1RainRow60BindReposDraws: Object.freeze({ offset: 21816, type: "u32" }),
    b1RainRow60ReposX: Object.freeze({ offset: 21820, type: "u32" }),
    b1RainRow60ReposY: Object.freeze({ offset: 21824, type: "u32" }),
    b1RainRow60BindStore7764: Object.freeze({ offset: 21828, type: "u32" }),
    b1RainRow61IterIndex: Object.freeze({ offset: 21832, type: "u32" }),
    b1RainRow61ShuffleSeedIn: Object.freeze({ offset: 21836, type: "u32" }),
    b1RainRow61ShuffleSeedOut: Object.freeze({ offset: 21840, type: "u32" }),
    b1RainRow61CornerPick: Object.freeze({ offset: 21844, type: "u32" }),
    b1RainRow61WorldX: Object.freeze({ offset: 21848, type: "u32" }),
    b1RainRow61WorldY: Object.freeze({ offset: 21852, type: "u32" }),
    b1RainRow61SearchOk: Object.freeze({ offset: 21856, type: "u32" }),
    b1RainRow61SearchDraws: Object.freeze({ offset: 21860, type: "u32" }),
    b1RainRow61CreateEntityPtr: Object.freeze({ offset: 21864, type: "u32" }),
    b1RainRow61BindRepositioned: Object.freeze({ offset: 21868, type: "u32" }),
    b1RainRow61BindReposDraws: Object.freeze({ offset: 21872, type: "u32" }),
    b1RainRow61ReposX: Object.freeze({ offset: 21876, type: "u32" }),
    b1RainRow61ReposY: Object.freeze({ offset: 21880, type: "u32" }),
    b1RainRow61BindStore7764: Object.freeze({ offset: 21884, type: "u32" }),
    b1RainRow62IterIndex: Object.freeze({ offset: 21888, type: "u32" }),
    b1RainRow62ShuffleSeedIn: Object.freeze({ offset: 21892, type: "u32" }),
    b1RainRow62ShuffleSeedOut: Object.freeze({ offset: 21896, type: "u32" }),
    b1RainRow62CornerPick: Object.freeze({ offset: 21900, type: "u32" }),
    b1RainRow62WorldX: Object.freeze({ offset: 21904, type: "u32" }),
    b1RainRow62WorldY: Object.freeze({ offset: 21908, type: "u32" }),
    b1RainRow62SearchOk: Object.freeze({ offset: 21912, type: "u32" }),
    b1RainRow62SearchDraws: Object.freeze({ offset: 21916, type: "u32" }),
    b1RainRow62CreateEntityPtr: Object.freeze({ offset: 21920, type: "u32" }),
    b1RainRow62BindRepositioned: Object.freeze({ offset: 21924, type: "u32" }),
    b1RainRow62BindReposDraws: Object.freeze({ offset: 21928, type: "u32" }),
    b1RainRow62ReposX: Object.freeze({ offset: 21932, type: "u32" }),
    b1RainRow62ReposY: Object.freeze({ offset: 21936, type: "u32" }),
    b1RainRow62BindStore7764: Object.freeze({ offset: 21940, type: "u32" }),
    b1RainRow63IterIndex: Object.freeze({ offset: 21944, type: "u32" }),
    b1RainRow63ShuffleSeedIn: Object.freeze({ offset: 21948, type: "u32" }),
    b1RainRow63ShuffleSeedOut: Object.freeze({ offset: 21952, type: "u32" }),
    b1RainRow63CornerPick: Object.freeze({ offset: 21956, type: "u32" }),
    b1RainRow63WorldX: Object.freeze({ offset: 21960, type: "u32" }),
    b1RainRow63WorldY: Object.freeze({ offset: 21964, type: "u32" }),
    b1RainRow63SearchOk: Object.freeze({ offset: 21968, type: "u32" }),
    b1RainRow63SearchDraws: Object.freeze({ offset: 21972, type: "u32" }),
    b1RainRow63CreateEntityPtr: Object.freeze({ offset: 21976, type: "u32" }),
    b1RainRow63BindRepositioned: Object.freeze({ offset: 21980, type: "u32" }),
    b1RainRow63BindReposDraws: Object.freeze({ offset: 21984, type: "u32" }),
    b1RainRow63ReposX: Object.freeze({ offset: 21988, type: "u32" }),
    b1RainRow63ReposY: Object.freeze({ offset: 21992, type: "u32" }),
    b1RainRow63BindStore7764: Object.freeze({ offset: 21996, type: "u32" }),
    /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29):
       SPAWN-LOOP continuation capture @22000..22571 (contracts-awards
       NOTES section 6 companion). All-or-nothing voucher; iter_count
       must EQUAL the head-plan count; over-cap poisons, never
       truncates. Blocker lanes gate retirement on the 0xb-block
       (typed-host: 0x9b92c0/0x7cb6e0/0x7c3980 + vtable [eax-0x18]
       @0x7fbabf stay law-free). */
    awardsSpawnLoopReady: Object.freeze({ offset: 22000, type: "u32" }),
    awardsSpawnLoopIterCount: Object.freeze({ offset: 22004, type: "u32" }),
    awardsSpawnLoopVariant0: Object.freeze({ offset: 22008, type: "i32" }),
    awardsSpawnLoopRoomWC: Object.freeze({ offset: 22012, type: "u32" }),
    awardsSpawnLoopRoomH10: Object.freeze({ offset: 22016, type: "u32" }),
    awardsSpawnLoopB1MusicGateAl: Object.freeze({ offset: 22020, type: "u32" }),
    awardsSpawnLoopB1QualityInt: Object.freeze({ offset: 22024, type: "i32" }),
    awardsSpawnLoopB1QualityFBits: Object.freeze({ offset: 22028, type: "u32" }),
    awardsSpawnLoopB1RndFBits: Object.freeze({ offset: 22032, type: "u32" }),
    awardsSpawnLoopB1SitePosXBits: Object.freeze({ offset: 22036, type: "u32" }),
    awardsSpawnLoopB1SitePosYBits: Object.freeze({ offset: 22040, type: "u32" }),
    awardsSpawnLoopB1SiteDraw: Object.freeze({ offset: 22044, type: "u32" }),
    awardsSpawnLoopB1PickerAl: Object.freeze({ offset: 22048, type: "u32" }),
    awardsSpawnLoopTailGateB1Al: Object.freeze({ offset: 22052, type: "u32" }),
    awardsSpawnLoopGame26584: Object.freeze({ offset: 22056, type: "u32" }),
    awardsSpawnLoopRow0PosXBits: Object.freeze({ offset: 22060, type: "u32" }),
    awardsSpawnLoopRow0PosYBits: Object.freeze({ offset: 22064, type: "u32" }),
    awardsSpawnLoopRow0Draw: Object.freeze({ offset: 22068, type: "u32" }),
    awardsSpawnLoopRow0EntityType28: Object.freeze({ offset: 22072, type: "u32" }),
    awardsSpawnLoopRow0EntityVariant2c: Object.freeze({ offset: 22076, type: "u32" }),
    awardsSpawnLoopRow0EntityField30: Object.freeze({ offset: 22080, type: "u32" }),
    awardsSpawnLoopRow0DoorGateAl: Object.freeze({ offset: 22084, type: "u32" }),
    awardsSpawnLoopRow0SfxOwner: Object.freeze({ offset: 22088, type: "u32" }),
    awardsSpawnLoopRow1PosXBits: Object.freeze({ offset: 22092, type: "u32" }),
    awardsSpawnLoopRow1PosYBits: Object.freeze({ offset: 22096, type: "u32" }),
    awardsSpawnLoopRow1Draw: Object.freeze({ offset: 22100, type: "u32" }),
    awardsSpawnLoopRow1EntityType28: Object.freeze({ offset: 22104, type: "u32" }),
    awardsSpawnLoopRow1EntityVariant2c: Object.freeze({ offset: 22108, type: "u32" }),
    awardsSpawnLoopRow1EntityField30: Object.freeze({ offset: 22112, type: "u32" }),
    awardsSpawnLoopRow1DoorGateAl: Object.freeze({ offset: 22116, type: "u32" }),
    awardsSpawnLoopRow1SfxOwner: Object.freeze({ offset: 22120, type: "u32" }),
    awardsSpawnLoopRow2PosXBits: Object.freeze({ offset: 22124, type: "u32" }),
    awardsSpawnLoopRow2PosYBits: Object.freeze({ offset: 22128, type: "u32" }),
    awardsSpawnLoopRow2Draw: Object.freeze({ offset: 22132, type: "u32" }),
    awardsSpawnLoopRow2EntityType28: Object.freeze({ offset: 22136, type: "u32" }),
    awardsSpawnLoopRow2EntityVariant2c: Object.freeze({ offset: 22140, type: "u32" }),
    awardsSpawnLoopRow2EntityField30: Object.freeze({ offset: 22144, type: "u32" }),
    awardsSpawnLoopRow2DoorGateAl: Object.freeze({ offset: 22148, type: "u32" }),
    awardsSpawnLoopRow2SfxOwner: Object.freeze({ offset: 22152, type: "u32" }),
    awardsSpawnLoopRow3PosXBits: Object.freeze({ offset: 22156, type: "u32" }),
    awardsSpawnLoopRow3PosYBits: Object.freeze({ offset: 22160, type: "u32" }),
    awardsSpawnLoopRow3Draw: Object.freeze({ offset: 22164, type: "u32" }),
    awardsSpawnLoopRow3EntityType28: Object.freeze({ offset: 22168, type: "u32" }),
    awardsSpawnLoopRow3EntityVariant2c: Object.freeze({ offset: 22172, type: "u32" }),
    awardsSpawnLoopRow3EntityField30: Object.freeze({ offset: 22176, type: "u32" }),
    awardsSpawnLoopRow3DoorGateAl: Object.freeze({ offset: 22180, type: "u32" }),
    awardsSpawnLoopRow3SfxOwner: Object.freeze({ offset: 22184, type: "u32" }),
    awardsSpawnLoopRow4PosXBits: Object.freeze({ offset: 22188, type: "u32" }),
    awardsSpawnLoopRow4PosYBits: Object.freeze({ offset: 22192, type: "u32" }),
    awardsSpawnLoopRow4Draw: Object.freeze({ offset: 22196, type: "u32" }),
    awardsSpawnLoopRow4EntityType28: Object.freeze({ offset: 22200, type: "u32" }),
    awardsSpawnLoopRow4EntityVariant2c: Object.freeze({ offset: 22204, type: "u32" }),
    awardsSpawnLoopRow4EntityField30: Object.freeze({ offset: 22208, type: "u32" }),
    awardsSpawnLoopRow4DoorGateAl: Object.freeze({ offset: 22212, type: "u32" }),
    awardsSpawnLoopRow4SfxOwner: Object.freeze({ offset: 22216, type: "u32" }),
    awardsSpawnLoopRow5PosXBits: Object.freeze({ offset: 22220, type: "u32" }),
    awardsSpawnLoopRow5PosYBits: Object.freeze({ offset: 22224, type: "u32" }),
    awardsSpawnLoopRow5Draw: Object.freeze({ offset: 22228, type: "u32" }),
    awardsSpawnLoopRow5EntityType28: Object.freeze({ offset: 22232, type: "u32" }),
    awardsSpawnLoopRow5EntityVariant2c: Object.freeze({ offset: 22236, type: "u32" }),
    awardsSpawnLoopRow5EntityField30: Object.freeze({ offset: 22240, type: "u32" }),
    awardsSpawnLoopRow5DoorGateAl: Object.freeze({ offset: 22244, type: "u32" }),
    awardsSpawnLoopRow5SfxOwner: Object.freeze({ offset: 22248, type: "u32" }),
    awardsSpawnLoopRow6PosXBits: Object.freeze({ offset: 22252, type: "u32" }),
    awardsSpawnLoopRow6PosYBits: Object.freeze({ offset: 22256, type: "u32" }),
    awardsSpawnLoopRow6Draw: Object.freeze({ offset: 22260, type: "u32" }),
    awardsSpawnLoopRow6EntityType28: Object.freeze({ offset: 22264, type: "u32" }),
    awardsSpawnLoopRow6EntityVariant2c: Object.freeze({ offset: 22268, type: "u32" }),
    awardsSpawnLoopRow6EntityField30: Object.freeze({ offset: 22272, type: "u32" }),
    awardsSpawnLoopRow6DoorGateAl: Object.freeze({ offset: 22276, type: "u32" }),
    awardsSpawnLoopRow6SfxOwner: Object.freeze({ offset: 22280, type: "u32" }),
    awardsSpawnLoopRow7PosXBits: Object.freeze({ offset: 22284, type: "u32" }),
    awardsSpawnLoopRow7PosYBits: Object.freeze({ offset: 22288, type: "u32" }),
    awardsSpawnLoopRow7Draw: Object.freeze({ offset: 22292, type: "u32" }),
    awardsSpawnLoopRow7EntityType28: Object.freeze({ offset: 22296, type: "u32" }),
    awardsSpawnLoopRow7EntityVariant2c: Object.freeze({ offset: 22300, type: "u32" }),
    awardsSpawnLoopRow7EntityField30: Object.freeze({ offset: 22304, type: "u32" }),
    awardsSpawnLoopRow7DoorGateAl: Object.freeze({ offset: 22308, type: "u32" }),
    awardsSpawnLoopRow7SfxOwner: Object.freeze({ offset: 22312, type: "u32" }),
    awardsSpawnLoopRow8PosXBits: Object.freeze({ offset: 22316, type: "u32" }),
    awardsSpawnLoopRow8PosYBits: Object.freeze({ offset: 22320, type: "u32" }),
    awardsSpawnLoopRow8Draw: Object.freeze({ offset: 22324, type: "u32" }),
    awardsSpawnLoopRow8EntityType28: Object.freeze({ offset: 22328, type: "u32" }),
    awardsSpawnLoopRow8EntityVariant2c: Object.freeze({ offset: 22332, type: "u32" }),
    awardsSpawnLoopRow8EntityField30: Object.freeze({ offset: 22336, type: "u32" }),
    awardsSpawnLoopRow8DoorGateAl: Object.freeze({ offset: 22340, type: "u32" }),
    awardsSpawnLoopRow8SfxOwner: Object.freeze({ offset: 22344, type: "u32" }),
    awardsSpawnLoopRow9PosXBits: Object.freeze({ offset: 22348, type: "u32" }),
    awardsSpawnLoopRow9PosYBits: Object.freeze({ offset: 22352, type: "u32" }),
    awardsSpawnLoopRow9Draw: Object.freeze({ offset: 22356, type: "u32" }),
    awardsSpawnLoopRow9EntityType28: Object.freeze({ offset: 22360, type: "u32" }),
    awardsSpawnLoopRow9EntityVariant2c: Object.freeze({ offset: 22364, type: "u32" }),
    awardsSpawnLoopRow9EntityField30: Object.freeze({ offset: 22368, type: "u32" }),
    awardsSpawnLoopRow9DoorGateAl: Object.freeze({ offset: 22372, type: "u32" }),
    awardsSpawnLoopRow9SfxOwner: Object.freeze({ offset: 22376, type: "u32" }),
    awardsSpawnLoopRow10PosXBits: Object.freeze({ offset: 22380, type: "u32" }),
    awardsSpawnLoopRow10PosYBits: Object.freeze({ offset: 22384, type: "u32" }),
    awardsSpawnLoopRow10Draw: Object.freeze({ offset: 22388, type: "u32" }),
    awardsSpawnLoopRow10EntityType28: Object.freeze({ offset: 22392, type: "u32" }),
    awardsSpawnLoopRow10EntityVariant2c: Object.freeze({ offset: 22396, type: "u32" }),
    awardsSpawnLoopRow10EntityField30: Object.freeze({ offset: 22400, type: "u32" }),
    awardsSpawnLoopRow10DoorGateAl: Object.freeze({ offset: 22404, type: "u32" }),
    awardsSpawnLoopRow10SfxOwner: Object.freeze({ offset: 22408, type: "u32" }),
    awardsSpawnLoopRow11PosXBits: Object.freeze({ offset: 22412, type: "u32" }),
    awardsSpawnLoopRow11PosYBits: Object.freeze({ offset: 22416, type: "u32" }),
    awardsSpawnLoopRow11Draw: Object.freeze({ offset: 22420, type: "u32" }),
    awardsSpawnLoopRow11EntityType28: Object.freeze({ offset: 22424, type: "u32" }),
    awardsSpawnLoopRow11EntityVariant2c: Object.freeze({ offset: 22428, type: "u32" }),
    awardsSpawnLoopRow11EntityField30: Object.freeze({ offset: 22432, type: "u32" }),
    awardsSpawnLoopRow11DoorGateAl: Object.freeze({ offset: 22436, type: "u32" }),
    awardsSpawnLoopRow11SfxOwner: Object.freeze({ offset: 22440, type: "u32" }),
    awardsSpawnLoopRow12PosXBits: Object.freeze({ offset: 22444, type: "u32" }),
    awardsSpawnLoopRow12PosYBits: Object.freeze({ offset: 22448, type: "u32" }),
    awardsSpawnLoopRow12Draw: Object.freeze({ offset: 22452, type: "u32" }),
    awardsSpawnLoopRow12EntityType28: Object.freeze({ offset: 22456, type: "u32" }),
    awardsSpawnLoopRow12EntityVariant2c: Object.freeze({ offset: 22460, type: "u32" }),
    awardsSpawnLoopRow12EntityField30: Object.freeze({ offset: 22464, type: "u32" }),
    awardsSpawnLoopRow12DoorGateAl: Object.freeze({ offset: 22468, type: "u32" }),
    awardsSpawnLoopRow12SfxOwner: Object.freeze({ offset: 22472, type: "u32" }),
    awardsSpawnLoopRow13PosXBits: Object.freeze({ offset: 22476, type: "u32" }),
    awardsSpawnLoopRow13PosYBits: Object.freeze({ offset: 22480, type: "u32" }),
    awardsSpawnLoopRow13Draw: Object.freeze({ offset: 22484, type: "u32" }),
    awardsSpawnLoopRow13EntityType28: Object.freeze({ offset: 22488, type: "u32" }),
    awardsSpawnLoopRow13EntityVariant2c: Object.freeze({ offset: 22492, type: "u32" }),
    awardsSpawnLoopRow13EntityField30: Object.freeze({ offset: 22496, type: "u32" }),
    awardsSpawnLoopRow13DoorGateAl: Object.freeze({ offset: 22500, type: "u32" }),
    awardsSpawnLoopRow13SfxOwner: Object.freeze({ offset: 22504, type: "u32" }),
    awardsSpawnLoopRow14PosXBits: Object.freeze({ offset: 22508, type: "u32" }),
    awardsSpawnLoopRow14PosYBits: Object.freeze({ offset: 22512, type: "u32" }),
    awardsSpawnLoopRow14Draw: Object.freeze({ offset: 22516, type: "u32" }),
    awardsSpawnLoopRow14EntityType28: Object.freeze({ offset: 22520, type: "u32" }),
    awardsSpawnLoopRow14EntityVariant2c: Object.freeze({ offset: 22524, type: "u32" }),
    awardsSpawnLoopRow14EntityField30: Object.freeze({ offset: 22528, type: "u32" }),
    awardsSpawnLoopRow14DoorGateAl: Object.freeze({ offset: 22532, type: "u32" }),
    awardsSpawnLoopRow14SfxOwner: Object.freeze({ offset: 22536, type: "u32" }),
    awardsSpawnLoopRow15PosXBits: Object.freeze({ offset: 22540, type: "u32" }),
    awardsSpawnLoopRow15PosYBits: Object.freeze({ offset: 22544, type: "u32" }),
    awardsSpawnLoopRow15Draw: Object.freeze({ offset: 22548, type: "u32" }),
    awardsSpawnLoopRow15EntityType28: Object.freeze({ offset: 22552, type: "u32" }),
    awardsSpawnLoopRow15EntityVariant2c: Object.freeze({ offset: 22556, type: "u32" }),
    awardsSpawnLoopRow15EntityField30: Object.freeze({ offset: 22560, type: "u32" }),
    awardsSpawnLoopRow15DoorGateAl: Object.freeze({ offset: 22564, type: "u32" }),
    awardsSpawnLoopRow15SfxOwner: Object.freeze({ offset: 22568, type: "u32" }),
    /* ABI v141 (update-v141-b-block-probe-pack, record idx29):
       post-loop 0xb-block capture @22572..23695 (contracts-awards
       NOTES section 6 companion). Voucher all-or-nothing:
       iter_count must EQUAL sar(vec_end-vec_begin,2) and stay <= 8.
       Consumes the frozen room-pure ABI v86 laws roomIdx29At9b92c0 /
       roomCount7cb6e0Plan / roomRoll7c3980Core / _followupGate /
       roomIdx29RollPlan BY REFERENCE (never re-derived). */
    awardsBBlockReady: Object.freeze({ offset: 22572, type: "u32" }),
    awardsBBlockIterCount: Object.freeze({ offset: 22576, type: "u32" }),
    awardsBBlockDescChainBit: Object.freeze({ offset: 22580, type: "u32" }),
    awardsBBlockPosXBits: Object.freeze({ offset: 22584, type: "u32" }),
    awardsBBlockPosYBits: Object.freeze({ offset: 22588, type: "u32" }),
    awardsBBlockDraw: Object.freeze({ offset: 22592, type: "u32" }),
    awardsBBlockRngS0: Object.freeze({ offset: 22596, type: "u32" }),
    awardsBBlockRngS1: Object.freeze({ offset: 22600, type: "u32" }),
    awardsBBlockRngS2: Object.freeze({ offset: 22604, type: "u32" }),
    awardsBBlockRngS3: Object.freeze({ offset: 22608, type: "u32" }),
    awardsBBlockVecBegin: Object.freeze({ offset: 22612, type: "u32" }),
    awardsBBlockVecEnd: Object.freeze({ offset: 22616, type: "u32" }),
    awardsBBlockMode2663c: Object.freeze({ offset: 22620, type: "u32" }),
    awardsBBlockMgrSeed264f8: Object.freeze({ offset: 22624, type: "u32" }),
    awardsBBlockTailPosXBits: Object.freeze({ offset: 22628, type: "u32" }),
    awardsBBlockTailPosYBits: Object.freeze({ offset: 22632, type: "u32" }),
    awardsBBlockTailDraw: Object.freeze({ offset: 22636, type: "u32" }),
    awardsBBlockElemValue0: Object.freeze({ offset: 22640, type: "u32" }),
    awardsBBlockElemValue1: Object.freeze({ offset: 22644, type: "u32" }),
    awardsBBlockElemValue2: Object.freeze({ offset: 22648, type: "u32" }),
    awardsBBlockElemValue3: Object.freeze({ offset: 22652, type: "u32" }),
    awardsBBlockElemValue4: Object.freeze({ offset: 22656, type: "u32" }),
    awardsBBlockElemValue5: Object.freeze({ offset: 22660, type: "u32" }),
    awardsBBlockElemValue6: Object.freeze({ offset: 22664, type: "u32" }),
    awardsBBlockElemValue7: Object.freeze({ offset: 22668, type: "u32" }),
    awardsBBlockRow0F13C0: Object.freeze({ offset: 22672, type: "u32" }),
    awardsBBlockRow0Gate202c: Object.freeze({ offset: 22676, type: "u32" }),
    awardsBBlockRow0Gate20a9: Object.freeze({ offset: 22680, type: "u32" }),
    awardsBBlockRow0HCount15: Object.freeze({ offset: 22684, type: "i32" }),
    awardsBBlockRow0HCount40: Object.freeze({ offset: 22688, type: "i32" }),
    awardsBBlockRow0HCount4b: Object.freeze({ offset: 22692, type: "i32" }),
    awardsBBlockRow0HBdR: Object.freeze({ offset: 22696, type: "u32" }),
    awardsBBlockRow0HRngRaw: Object.freeze({ offset: 22700, type: "u32" }),
    awardsBBlockRow0Has8b: Object.freeze({ offset: 22704, type: "u32" }),
    awardsBBlockRow0Has1ca: Object.freeze({ offset: 22708, type: "u32" }),
    awardsBBlockRow0Has1b7: Object.freeze({ offset: 22712, type: "u32" }),
    awardsBBlockRow0Slot0: Object.freeze({ offset: 22716, type: "u32" }),
    awardsBBlockRow0Slot1: Object.freeze({ offset: 22720, type: "u32" }),
    awardsBBlockRow0BlockNonNull: Object.freeze({ offset: 22724, type: "u32" }),
    awardsBBlockRow0Block0: Object.freeze({ offset: 22728, type: "u32" }),
    awardsBBlockRow0Block4: Object.freeze({ offset: 22732, type: "u32" }),
    awardsBBlockRow0Flag17cc: Object.freeze({ offset: 22736, type: "u32" }),
    awardsBBlockRow0ItemBegin: Object.freeze({ offset: 22740, type: "u32" }),
    awardsBBlockRow0ItemEnd: Object.freeze({ offset: 22744, type: "u32" }),
    awardsBBlockRow0ItemW0: Object.freeze({ offset: 22748, type: "u32" }),
    awardsBBlockRow0ItemW1: Object.freeze({ offset: 22752, type: "u32" }),
    awardsBBlockRow0ByteBegin: Object.freeze({ offset: 22756, type: "u32" }),
    awardsBBlockRow0ByteEnd: Object.freeze({ offset: 22760, type: "u32" }),
    awardsBBlockRow0ByteVal: Object.freeze({ offset: 22764, type: "u32" }),
    awardsBBlockRow0F2ef8: Object.freeze({ offset: 22768, type: "u32" }),
    awardsBBlockRow0Byte2ef0: Object.freeze({ offset: 22772, type: "u32" }),
    awardsBBlockRow0HAdder17: Object.freeze({ offset: 22776, type: "u32" }),
    awardsBBlockRow0F18dc: Object.freeze({ offset: 22780, type: "u32" }),
    awardsBBlockRow0F18e0: Object.freeze({ offset: 22784, type: "u32" }),
    awardsBBlockRow0RollF3fc: Object.freeze({ offset: 22788, type: "u32" }),
    awardsBBlockRow0RollByte173: Object.freeze({ offset: 22792, type: "u32" }),
    awardsBBlockRow0RollOldFlags1574: Object.freeze({ offset: 22796, type: "u32" }),
    awardsBBlockRow1F13C0: Object.freeze({ offset: 22800, type: "u32" }),
    awardsBBlockRow1Gate202c: Object.freeze({ offset: 22804, type: "u32" }),
    awardsBBlockRow1Gate20a9: Object.freeze({ offset: 22808, type: "u32" }),
    awardsBBlockRow1HCount15: Object.freeze({ offset: 22812, type: "i32" }),
    awardsBBlockRow1HCount40: Object.freeze({ offset: 22816, type: "i32" }),
    awardsBBlockRow1HCount4b: Object.freeze({ offset: 22820, type: "i32" }),
    awardsBBlockRow1HBdR: Object.freeze({ offset: 22824, type: "u32" }),
    awardsBBlockRow1HRngRaw: Object.freeze({ offset: 22828, type: "u32" }),
    awardsBBlockRow1Has8b: Object.freeze({ offset: 22832, type: "u32" }),
    awardsBBlockRow1Has1ca: Object.freeze({ offset: 22836, type: "u32" }),
    awardsBBlockRow1Has1b7: Object.freeze({ offset: 22840, type: "u32" }),
    awardsBBlockRow1Slot0: Object.freeze({ offset: 22844, type: "u32" }),
    awardsBBlockRow1Slot1: Object.freeze({ offset: 22848, type: "u32" }),
    awardsBBlockRow1BlockNonNull: Object.freeze({ offset: 22852, type: "u32" }),
    awardsBBlockRow1Block0: Object.freeze({ offset: 22856, type: "u32" }),
    awardsBBlockRow1Block4: Object.freeze({ offset: 22860, type: "u32" }),
    awardsBBlockRow1Flag17cc: Object.freeze({ offset: 22864, type: "u32" }),
    awardsBBlockRow1ItemBegin: Object.freeze({ offset: 22868, type: "u32" }),
    awardsBBlockRow1ItemEnd: Object.freeze({ offset: 22872, type: "u32" }),
    awardsBBlockRow1ItemW0: Object.freeze({ offset: 22876, type: "u32" }),
    awardsBBlockRow1ItemW1: Object.freeze({ offset: 22880, type: "u32" }),
    awardsBBlockRow1ByteBegin: Object.freeze({ offset: 22884, type: "u32" }),
    awardsBBlockRow1ByteEnd: Object.freeze({ offset: 22888, type: "u32" }),
    awardsBBlockRow1ByteVal: Object.freeze({ offset: 22892, type: "u32" }),
    awardsBBlockRow1F2ef8: Object.freeze({ offset: 22896, type: "u32" }),
    awardsBBlockRow1Byte2ef0: Object.freeze({ offset: 22900, type: "u32" }),
    awardsBBlockRow1HAdder17: Object.freeze({ offset: 22904, type: "u32" }),
    awardsBBlockRow1F18dc: Object.freeze({ offset: 22908, type: "u32" }),
    awardsBBlockRow1F18e0: Object.freeze({ offset: 22912, type: "u32" }),
    awardsBBlockRow1RollF3fc: Object.freeze({ offset: 22916, type: "u32" }),
    awardsBBlockRow1RollByte173: Object.freeze({ offset: 22920, type: "u32" }),
    awardsBBlockRow1RollOldFlags1574: Object.freeze({ offset: 22924, type: "u32" }),
    awardsBBlockRow2F13C0: Object.freeze({ offset: 22928, type: "u32" }),
    awardsBBlockRow2Gate202c: Object.freeze({ offset: 22932, type: "u32" }),
    awardsBBlockRow2Gate20a9: Object.freeze({ offset: 22936, type: "u32" }),
    awardsBBlockRow2HCount15: Object.freeze({ offset: 22940, type: "i32" }),
    awardsBBlockRow2HCount40: Object.freeze({ offset: 22944, type: "i32" }),
    awardsBBlockRow2HCount4b: Object.freeze({ offset: 22948, type: "i32" }),
    awardsBBlockRow2HBdR: Object.freeze({ offset: 22952, type: "u32" }),
    awardsBBlockRow2HRngRaw: Object.freeze({ offset: 22956, type: "u32" }),
    awardsBBlockRow2Has8b: Object.freeze({ offset: 22960, type: "u32" }),
    awardsBBlockRow2Has1ca: Object.freeze({ offset: 22964, type: "u32" }),
    awardsBBlockRow2Has1b7: Object.freeze({ offset: 22968, type: "u32" }),
    awardsBBlockRow2Slot0: Object.freeze({ offset: 22972, type: "u32" }),
    awardsBBlockRow2Slot1: Object.freeze({ offset: 22976, type: "u32" }),
    awardsBBlockRow2BlockNonNull: Object.freeze({ offset: 22980, type: "u32" }),
    awardsBBlockRow2Block0: Object.freeze({ offset: 22984, type: "u32" }),
    awardsBBlockRow2Block4: Object.freeze({ offset: 22988, type: "u32" }),
    awardsBBlockRow2Flag17cc: Object.freeze({ offset: 22992, type: "u32" }),
    awardsBBlockRow2ItemBegin: Object.freeze({ offset: 22996, type: "u32" }),
    awardsBBlockRow2ItemEnd: Object.freeze({ offset: 23000, type: "u32" }),
    awardsBBlockRow2ItemW0: Object.freeze({ offset: 23004, type: "u32" }),
    awardsBBlockRow2ItemW1: Object.freeze({ offset: 23008, type: "u32" }),
    awardsBBlockRow2ByteBegin: Object.freeze({ offset: 23012, type: "u32" }),
    awardsBBlockRow2ByteEnd: Object.freeze({ offset: 23016, type: "u32" }),
    awardsBBlockRow2ByteVal: Object.freeze({ offset: 23020, type: "u32" }),
    awardsBBlockRow2F2ef8: Object.freeze({ offset: 23024, type: "u32" }),
    awardsBBlockRow2Byte2ef0: Object.freeze({ offset: 23028, type: "u32" }),
    awardsBBlockRow2HAdder17: Object.freeze({ offset: 23032, type: "u32" }),
    awardsBBlockRow2F18dc: Object.freeze({ offset: 23036, type: "u32" }),
    awardsBBlockRow2F18e0: Object.freeze({ offset: 23040, type: "u32" }),
    awardsBBlockRow2RollF3fc: Object.freeze({ offset: 23044, type: "u32" }),
    awardsBBlockRow2RollByte173: Object.freeze({ offset: 23048, type: "u32" }),
    awardsBBlockRow2RollOldFlags1574: Object.freeze({ offset: 23052, type: "u32" }),
    awardsBBlockRow3F13C0: Object.freeze({ offset: 23056, type: "u32" }),
    awardsBBlockRow3Gate202c: Object.freeze({ offset: 23060, type: "u32" }),
    awardsBBlockRow3Gate20a9: Object.freeze({ offset: 23064, type: "u32" }),
    awardsBBlockRow3HCount15: Object.freeze({ offset: 23068, type: "i32" }),
    awardsBBlockRow3HCount40: Object.freeze({ offset: 23072, type: "i32" }),
    awardsBBlockRow3HCount4b: Object.freeze({ offset: 23076, type: "i32" }),
    awardsBBlockRow3HBdR: Object.freeze({ offset: 23080, type: "u32" }),
    awardsBBlockRow3HRngRaw: Object.freeze({ offset: 23084, type: "u32" }),
    awardsBBlockRow3Has8b: Object.freeze({ offset: 23088, type: "u32" }),
    awardsBBlockRow3Has1ca: Object.freeze({ offset: 23092, type: "u32" }),
    awardsBBlockRow3Has1b7: Object.freeze({ offset: 23096, type: "u32" }),
    awardsBBlockRow3Slot0: Object.freeze({ offset: 23100, type: "u32" }),
    awardsBBlockRow3Slot1: Object.freeze({ offset: 23104, type: "u32" }),
    awardsBBlockRow3BlockNonNull: Object.freeze({ offset: 23108, type: "u32" }),
    awardsBBlockRow3Block0: Object.freeze({ offset: 23112, type: "u32" }),
    awardsBBlockRow3Block4: Object.freeze({ offset: 23116, type: "u32" }),
    awardsBBlockRow3Flag17cc: Object.freeze({ offset: 23120, type: "u32" }),
    awardsBBlockRow3ItemBegin: Object.freeze({ offset: 23124, type: "u32" }),
    awardsBBlockRow3ItemEnd: Object.freeze({ offset: 23128, type: "u32" }),
    awardsBBlockRow3ItemW0: Object.freeze({ offset: 23132, type: "u32" }),
    awardsBBlockRow3ItemW1: Object.freeze({ offset: 23136, type: "u32" }),
    awardsBBlockRow3ByteBegin: Object.freeze({ offset: 23140, type: "u32" }),
    awardsBBlockRow3ByteEnd: Object.freeze({ offset: 23144, type: "u32" }),
    awardsBBlockRow3ByteVal: Object.freeze({ offset: 23148, type: "u32" }),
    awardsBBlockRow3F2ef8: Object.freeze({ offset: 23152, type: "u32" }),
    awardsBBlockRow3Byte2ef0: Object.freeze({ offset: 23156, type: "u32" }),
    awardsBBlockRow3HAdder17: Object.freeze({ offset: 23160, type: "u32" }),
    awardsBBlockRow3F18dc: Object.freeze({ offset: 23164, type: "u32" }),
    awardsBBlockRow3F18e0: Object.freeze({ offset: 23168, type: "u32" }),
    awardsBBlockRow3RollF3fc: Object.freeze({ offset: 23172, type: "u32" }),
    awardsBBlockRow3RollByte173: Object.freeze({ offset: 23176, type: "u32" }),
    awardsBBlockRow3RollOldFlags1574: Object.freeze({ offset: 23180, type: "u32" }),
    awardsBBlockRow4F13C0: Object.freeze({ offset: 23184, type: "u32" }),
    awardsBBlockRow4Gate202c: Object.freeze({ offset: 23188, type: "u32" }),
    awardsBBlockRow4Gate20a9: Object.freeze({ offset: 23192, type: "u32" }),
    awardsBBlockRow4HCount15: Object.freeze({ offset: 23196, type: "i32" }),
    awardsBBlockRow4HCount40: Object.freeze({ offset: 23200, type: "i32" }),
    awardsBBlockRow4HCount4b: Object.freeze({ offset: 23204, type: "i32" }),
    awardsBBlockRow4HBdR: Object.freeze({ offset: 23208, type: "u32" }),
    awardsBBlockRow4HRngRaw: Object.freeze({ offset: 23212, type: "u32" }),
    awardsBBlockRow4Has8b: Object.freeze({ offset: 23216, type: "u32" }),
    awardsBBlockRow4Has1ca: Object.freeze({ offset: 23220, type: "u32" }),
    awardsBBlockRow4Has1b7: Object.freeze({ offset: 23224, type: "u32" }),
    awardsBBlockRow4Slot0: Object.freeze({ offset: 23228, type: "u32" }),
    awardsBBlockRow4Slot1: Object.freeze({ offset: 23232, type: "u32" }),
    awardsBBlockRow4BlockNonNull: Object.freeze({ offset: 23236, type: "u32" }),
    awardsBBlockRow4Block0: Object.freeze({ offset: 23240, type: "u32" }),
    awardsBBlockRow4Block4: Object.freeze({ offset: 23244, type: "u32" }),
    awardsBBlockRow4Flag17cc: Object.freeze({ offset: 23248, type: "u32" }),
    awardsBBlockRow4ItemBegin: Object.freeze({ offset: 23252, type: "u32" }),
    awardsBBlockRow4ItemEnd: Object.freeze({ offset: 23256, type: "u32" }),
    awardsBBlockRow4ItemW0: Object.freeze({ offset: 23260, type: "u32" }),
    awardsBBlockRow4ItemW1: Object.freeze({ offset: 23264, type: "u32" }),
    awardsBBlockRow4ByteBegin: Object.freeze({ offset: 23268, type: "u32" }),
    awardsBBlockRow4ByteEnd: Object.freeze({ offset: 23272, type: "u32" }),
    awardsBBlockRow4ByteVal: Object.freeze({ offset: 23276, type: "u32" }),
    awardsBBlockRow4F2ef8: Object.freeze({ offset: 23280, type: "u32" }),
    awardsBBlockRow4Byte2ef0: Object.freeze({ offset: 23284, type: "u32" }),
    awardsBBlockRow4HAdder17: Object.freeze({ offset: 23288, type: "u32" }),
    awardsBBlockRow4F18dc: Object.freeze({ offset: 23292, type: "u32" }),
    awardsBBlockRow4F18e0: Object.freeze({ offset: 23296, type: "u32" }),
    awardsBBlockRow4RollF3fc: Object.freeze({ offset: 23300, type: "u32" }),
    awardsBBlockRow4RollByte173: Object.freeze({ offset: 23304, type: "u32" }),
    awardsBBlockRow4RollOldFlags1574: Object.freeze({ offset: 23308, type: "u32" }),
    awardsBBlockRow5F13C0: Object.freeze({ offset: 23312, type: "u32" }),
    awardsBBlockRow5Gate202c: Object.freeze({ offset: 23316, type: "u32" }),
    awardsBBlockRow5Gate20a9: Object.freeze({ offset: 23320, type: "u32" }),
    awardsBBlockRow5HCount15: Object.freeze({ offset: 23324, type: "i32" }),
    awardsBBlockRow5HCount40: Object.freeze({ offset: 23328, type: "i32" }),
    awardsBBlockRow5HCount4b: Object.freeze({ offset: 23332, type: "i32" }),
    awardsBBlockRow5HBdR: Object.freeze({ offset: 23336, type: "u32" }),
    awardsBBlockRow5HRngRaw: Object.freeze({ offset: 23340, type: "u32" }),
    awardsBBlockRow5Has8b: Object.freeze({ offset: 23344, type: "u32" }),
    awardsBBlockRow5Has1ca: Object.freeze({ offset: 23348, type: "u32" }),
    awardsBBlockRow5Has1b7: Object.freeze({ offset: 23352, type: "u32" }),
    awardsBBlockRow5Slot0: Object.freeze({ offset: 23356, type: "u32" }),
    awardsBBlockRow5Slot1: Object.freeze({ offset: 23360, type: "u32" }),
    awardsBBlockRow5BlockNonNull: Object.freeze({ offset: 23364, type: "u32" }),
    awardsBBlockRow5Block0: Object.freeze({ offset: 23368, type: "u32" }),
    awardsBBlockRow5Block4: Object.freeze({ offset: 23372, type: "u32" }),
    awardsBBlockRow5Flag17cc: Object.freeze({ offset: 23376, type: "u32" }),
    awardsBBlockRow5ItemBegin: Object.freeze({ offset: 23380, type: "u32" }),
    awardsBBlockRow5ItemEnd: Object.freeze({ offset: 23384, type: "u32" }),
    awardsBBlockRow5ItemW0: Object.freeze({ offset: 23388, type: "u32" }),
    awardsBBlockRow5ItemW1: Object.freeze({ offset: 23392, type: "u32" }),
    awardsBBlockRow5ByteBegin: Object.freeze({ offset: 23396, type: "u32" }),
    awardsBBlockRow5ByteEnd: Object.freeze({ offset: 23400, type: "u32" }),
    awardsBBlockRow5ByteVal: Object.freeze({ offset: 23404, type: "u32" }),
    awardsBBlockRow5F2ef8: Object.freeze({ offset: 23408, type: "u32" }),
    awardsBBlockRow5Byte2ef0: Object.freeze({ offset: 23412, type: "u32" }),
    awardsBBlockRow5HAdder17: Object.freeze({ offset: 23416, type: "u32" }),
    awardsBBlockRow5F18dc: Object.freeze({ offset: 23420, type: "u32" }),
    awardsBBlockRow5F18e0: Object.freeze({ offset: 23424, type: "u32" }),
    awardsBBlockRow5RollF3fc: Object.freeze({ offset: 23428, type: "u32" }),
    awardsBBlockRow5RollByte173: Object.freeze({ offset: 23432, type: "u32" }),
    awardsBBlockRow5RollOldFlags1574: Object.freeze({ offset: 23436, type: "u32" }),
    awardsBBlockRow6F13C0: Object.freeze({ offset: 23440, type: "u32" }),
    awardsBBlockRow6Gate202c: Object.freeze({ offset: 23444, type: "u32" }),
    awardsBBlockRow6Gate20a9: Object.freeze({ offset: 23448, type: "u32" }),
    awardsBBlockRow6HCount15: Object.freeze({ offset: 23452, type: "i32" }),
    awardsBBlockRow6HCount40: Object.freeze({ offset: 23456, type: "i32" }),
    awardsBBlockRow6HCount4b: Object.freeze({ offset: 23460, type: "i32" }),
    awardsBBlockRow6HBdR: Object.freeze({ offset: 23464, type: "u32" }),
    awardsBBlockRow6HRngRaw: Object.freeze({ offset: 23468, type: "u32" }),
    awardsBBlockRow6Has8b: Object.freeze({ offset: 23472, type: "u32" }),
    awardsBBlockRow6Has1ca: Object.freeze({ offset: 23476, type: "u32" }),
    awardsBBlockRow6Has1b7: Object.freeze({ offset: 23480, type: "u32" }),
    awardsBBlockRow6Slot0: Object.freeze({ offset: 23484, type: "u32" }),
    awardsBBlockRow6Slot1: Object.freeze({ offset: 23488, type: "u32" }),
    awardsBBlockRow6BlockNonNull: Object.freeze({ offset: 23492, type: "u32" }),
    awardsBBlockRow6Block0: Object.freeze({ offset: 23496, type: "u32" }),
    awardsBBlockRow6Block4: Object.freeze({ offset: 23500, type: "u32" }),
    awardsBBlockRow6Flag17cc: Object.freeze({ offset: 23504, type: "u32" }),
    awardsBBlockRow6ItemBegin: Object.freeze({ offset: 23508, type: "u32" }),
    awardsBBlockRow6ItemEnd: Object.freeze({ offset: 23512, type: "u32" }),
    awardsBBlockRow6ItemW0: Object.freeze({ offset: 23516, type: "u32" }),
    awardsBBlockRow6ItemW1: Object.freeze({ offset: 23520, type: "u32" }),
    awardsBBlockRow6ByteBegin: Object.freeze({ offset: 23524, type: "u32" }),
    awardsBBlockRow6ByteEnd: Object.freeze({ offset: 23528, type: "u32" }),
    awardsBBlockRow6ByteVal: Object.freeze({ offset: 23532, type: "u32" }),
    awardsBBlockRow6F2ef8: Object.freeze({ offset: 23536, type: "u32" }),
    awardsBBlockRow6Byte2ef0: Object.freeze({ offset: 23540, type: "u32" }),
    awardsBBlockRow6HAdder17: Object.freeze({ offset: 23544, type: "u32" }),
    awardsBBlockRow6F18dc: Object.freeze({ offset: 23548, type: "u32" }),
    awardsBBlockRow6F18e0: Object.freeze({ offset: 23552, type: "u32" }),
    awardsBBlockRow6RollF3fc: Object.freeze({ offset: 23556, type: "u32" }),
    awardsBBlockRow6RollByte173: Object.freeze({ offset: 23560, type: "u32" }),
    awardsBBlockRow6RollOldFlags1574: Object.freeze({ offset: 23564, type: "u32" }),
    awardsBBlockRow7F13C0: Object.freeze({ offset: 23568, type: "u32" }),
    awardsBBlockRow7Gate202c: Object.freeze({ offset: 23572, type: "u32" }),
    awardsBBlockRow7Gate20a9: Object.freeze({ offset: 23576, type: "u32" }),
    awardsBBlockRow7HCount15: Object.freeze({ offset: 23580, type: "i32" }),
    awardsBBlockRow7HCount40: Object.freeze({ offset: 23584, type: "i32" }),
    awardsBBlockRow7HCount4b: Object.freeze({ offset: 23588, type: "i32" }),
    awardsBBlockRow7HBdR: Object.freeze({ offset: 23592, type: "u32" }),
    awardsBBlockRow7HRngRaw: Object.freeze({ offset: 23596, type: "u32" }),
    awardsBBlockRow7Has8b: Object.freeze({ offset: 23600, type: "u32" }),
    awardsBBlockRow7Has1ca: Object.freeze({ offset: 23604, type: "u32" }),
    awardsBBlockRow7Has1b7: Object.freeze({ offset: 23608, type: "u32" }),
    awardsBBlockRow7Slot0: Object.freeze({ offset: 23612, type: "u32" }),
    awardsBBlockRow7Slot1: Object.freeze({ offset: 23616, type: "u32" }),
    awardsBBlockRow7BlockNonNull: Object.freeze({ offset: 23620, type: "u32" }),
    awardsBBlockRow7Block0: Object.freeze({ offset: 23624, type: "u32" }),
    awardsBBlockRow7Block4: Object.freeze({ offset: 23628, type: "u32" }),
    awardsBBlockRow7Flag17cc: Object.freeze({ offset: 23632, type: "u32" }),
    awardsBBlockRow7ItemBegin: Object.freeze({ offset: 23636, type: "u32" }),
    awardsBBlockRow7ItemEnd: Object.freeze({ offset: 23640, type: "u32" }),
    awardsBBlockRow7ItemW0: Object.freeze({ offset: 23644, type: "u32" }),
    awardsBBlockRow7ItemW1: Object.freeze({ offset: 23648, type: "u32" }),
    awardsBBlockRow7ByteBegin: Object.freeze({ offset: 23652, type: "u32" }),
    awardsBBlockRow7ByteEnd: Object.freeze({ offset: 23656, type: "u32" }),
    awardsBBlockRow7ByteVal: Object.freeze({ offset: 23660, type: "u32" }),
    awardsBBlockRow7F2ef8: Object.freeze({ offset: 23664, type: "u32" }),
    awardsBBlockRow7Byte2ef0: Object.freeze({ offset: 23668, type: "u32" }),
    awardsBBlockRow7HAdder17: Object.freeze({ offset: 23672, type: "u32" }),
    awardsBBlockRow7F18dc: Object.freeze({ offset: 23676, type: "u32" }),
    awardsBBlockRow7F18e0: Object.freeze({ offset: 23680, type: "u32" }),
    awardsBBlockRow7RollF3fc: Object.freeze({ offset: 23684, type: "u32" }),
    awardsBBlockRow7RollByte173: Object.freeze({ offset: 23688, type: "u32" }),
    awardsBBlockRow7RollOldFlags1574: Object.freeze({ offset: 23692, type: "u32" }),
    tca40HeadR74Bba0F10F8: Object.freeze({ offset: 17848, type: "u32" }),
    tca40HeadR74Bba0BF10F8: Object.freeze({ offset: 17852, type: "u32" }),
    /* ABI v134 (update-v134-awards-head-pack, records idx28/29):
       head-plan capture @17540..17648 (contracts-awards NOTES §2):
       voucher + 27 u32 src fields mirroring
       IsaacRoomAwardSpawn7fb250Src field-for-field; ready=1 iff ALL
    rows valid at the 0x806b91 seam; absence -> monolith. */
    awardsHeadReady: Object.freeze({ offset: 17540, type: "u32" }),
    awardsHeadSrcluaGate: Object.freeze({ offset: 17544, type: "u32" }),
    awardsHeadSrcdescF10Present: Object.freeze({ offset: 17548, type: "u32" }),
    awardsHeadSrcdescType8: Object.freeze({ offset: 17552, type: "u32" }),
    awardsHeadSrcdescType00: Object.freeze({ offset: 17556, type: "u32" }),
    awardsHeadSrcroomType8: Object.freeze({ offset: 17560, type: "u32" }),
    awardsHeadSrch74efd0: Object.freeze({ offset: 17564, type: "u32" }),
    awardsHeadSrcgame1830c: Object.freeze({ offset: 17568, type: "u32" }),
    awardsHeadSrcmode269c8: Object.freeze({ offset: 17572, type: "u32" }),
    awardsHeadSrch9be630: Object.freeze({ offset: 17576, type: "u32" }),
    awardsHeadSrcflags1839c: Object.freeze({ offset: 17580, type: "u32" }),
    awardsHeadSrcpickedId: Object.freeze({ offset: 17584, type: "u32" }),
    awardsHeadSrcgateF1: Object.freeze({ offset: 17588, type: "u32" }),
    awardsHeadSrch9be750: Object.freeze({ offset: 17592, type: "u32" }),
    awardsHeadSrch4e4690Bits: Object.freeze({ offset: 17596, type: "u32" }),
    awardsHeadSrch7e9080Bits: Object.freeze({ offset: 17600, type: "u32" }),
    awardsHeadSrchRnd64: Object.freeze({ offset: 17604, type: "u32" }),
    awardsHeadSrch6ee340: Object.freeze({ offset: 17608, type: "u32" }),
    awardsHeadSrch9be140: Object.freeze({ offset: 17612, type: "u32" }),
    awardsHeadSrcxformId: Object.freeze({ offset: 17616, type: "u32" }),
    awardsHeadSrcxformB: Object.freeze({ offset: 17620, type: "u32" }),
    awardsHeadSrcdescF0: Object.freeze({ offset: 17624, type: "u32" }),
    awardsHeadSrch9be6b0: Object.freeze({ offset: 17628, type: "u32" }),
    awardsHeadSrch7cb6e0: Object.freeze({ offset: 17632, type: "u32" }),
    awardsHeadSrcgate202: Object.freeze({ offset: 17636, type: "u32" }),
    awardsHeadSrchRnd4: Object.freeze({ offset: 17640, type: "u32" }),
    awardsHeadSrch9be0801a0: Object.freeze({ offset: 17644, type: "u32" }),
    awardsHeadSrchRnd3: Object.freeze({ offset: 17648, type: "u32" }),
    sfxStopFoldReady: Object.freeze({ offset: 6880, type: "u32" }),
    sfxStopVoiceCount: Object.freeze({ offset: 6884, type: "u32" }),
    sfxStopVoice0ChannelNull: Object.freeze({ offset: 6888, type: "u32" }),
    sfxStopVoice0Pending_09: Object.freeze({ offset: 6892, type: "u32" }),
    sfxStopVoice0ProbeFirst: Object.freeze({ offset: 6896, type: "u32" }),
    sfxStopVoice0ProbeSecond: Object.freeze({ offset: 6900, type: "u32" }),
    sfxStopVoice0ChannelNullReload: Object.freeze({ offset: 6904, type: "u32" }),
    sfxStopVoice0VoicesReloaded: Object.freeze({ offset: 6908, type: "u32" }),
    sfxStopVoice1ChannelNull: Object.freeze({ offset: 6912, type: "u32" }),
    sfxStopVoice1Pending_09: Object.freeze({ offset: 6916, type: "u32" }),
    sfxStopVoice1ProbeFirst: Object.freeze({ offset: 6920, type: "u32" }),
    sfxStopVoice1ProbeSecond: Object.freeze({ offset: 6924, type: "u32" }),
    sfxStopVoice1ChannelNullReload: Object.freeze({ offset: 6928, type: "u32" }),
    sfxStopVoice1VoicesReloaded: Object.freeze({ offset: 6932, type: "u32" }),
    sfxStopVoice2ChannelNull: Object.freeze({ offset: 6936, type: "u32" }),
    sfxStopVoice2Pending_09: Object.freeze({ offset: 6940, type: "u32" }),
    sfxStopVoice2ProbeFirst: Object.freeze({ offset: 6944, type: "u32" }),
    sfxStopVoice2ProbeSecond: Object.freeze({ offset: 6948, type: "u32" }),
    sfxStopVoice2ChannelNullReload: Object.freeze({ offset: 6952, type: "u32" }),
    sfxStopVoice2VoicesReloaded: Object.freeze({ offset: 6956, type: "u32" }),
    sfxStopVoice3ChannelNull: Object.freeze({ offset: 6960, type: "u32" }),
    sfxStopVoice3Pending_09: Object.freeze({ offset: 6964, type: "u32" }),
    sfxStopVoice3ProbeFirst: Object.freeze({ offset: 6968, type: "u32" }),
    sfxStopVoice3ProbeSecond: Object.freeze({ offset: 6972, type: "u32" }),
    sfxStopVoice3ChannelNullReload: Object.freeze({ offset: 6976, type: "u32" }),
    sfxStopVoice3VoicesReloaded: Object.freeze({ offset: 6980, type: "u32" }),
    sfxStopVoice4ChannelNull: Object.freeze({ offset: 6984, type: "u32" }),
    sfxStopVoice4Pending_09: Object.freeze({ offset: 6988, type: "u32" }),
    sfxStopVoice4ProbeFirst: Object.freeze({ offset: 6992, type: "u32" }),
    sfxStopVoice4ProbeSecond: Object.freeze({ offset: 6996, type: "u32" }),
    sfxStopVoice4ChannelNullReload: Object.freeze({ offset: 7000, type: "u32" }),
    sfxStopVoice4VoicesReloaded: Object.freeze({ offset: 7004, type: "u32" }),
    sfxStopVoice5ChannelNull: Object.freeze({ offset: 7008, type: "u32" }),
    sfxStopVoice5Pending_09: Object.freeze({ offset: 7012, type: "u32" }),
    sfxStopVoice5ProbeFirst: Object.freeze({ offset: 7016, type: "u32" }),
    sfxStopVoice5ProbeSecond: Object.freeze({ offset: 7020, type: "u32" }),
    sfxStopVoice5ChannelNullReload: Object.freeze({ offset: 7024, type: "u32" }),
    sfxStopVoice5VoicesReloaded: Object.freeze({ offset: 7028, type: "u32" }),
    sfxStopVoice6ChannelNull: Object.freeze({ offset: 7032, type: "u32" }),
    sfxStopVoice6Pending_09: Object.freeze({ offset: 7036, type: "u32" }),
    sfxStopVoice6ProbeFirst: Object.freeze({ offset: 7040, type: "u32" }),
    sfxStopVoice6ProbeSecond: Object.freeze({ offset: 7044, type: "u32" }),
    sfxStopVoice6ChannelNullReload: Object.freeze({ offset: 7048, type: "u32" }),
    sfxStopVoice6VoicesReloaded: Object.freeze({ offset: 7052, type: "u32" }),
    sfxStopVoice7ChannelNull: Object.freeze({ offset: 7056, type: "u32" }),
    sfxStopVoice7Pending_09: Object.freeze({ offset: 7060, type: "u32" }),
    sfxStopVoice7ProbeFirst: Object.freeze({ offset: 7064, type: "u32" }),
    sfxStopVoice7ProbeSecond: Object.freeze({ offset: 7068, type: "u32" }),
    sfxStopVoice7ChannelNullReload: Object.freeze({ offset: 7072, type: "u32" }),
    sfxStopVoice7VoicesReloaded: Object.freeze({ offset: 7076, type: "u32" }),
    sfxStopVoice8ChannelNull: Object.freeze({ offset: 7080, type: "u32" }),
    sfxStopVoice8Pending_09: Object.freeze({ offset: 7084, type: "u32" }),
    sfxStopVoice8ProbeFirst: Object.freeze({ offset: 7088, type: "u32" }),
    sfxStopVoice8ProbeSecond: Object.freeze({ offset: 7092, type: "u32" }),
    sfxStopVoice8ChannelNullReload: Object.freeze({ offset: 7096, type: "u32" }),
    sfxStopVoice8VoicesReloaded: Object.freeze({ offset: 7100, type: "u32" }),
    sfxStopVoice9ChannelNull: Object.freeze({ offset: 7104, type: "u32" }),
    sfxStopVoice9Pending_09: Object.freeze({ offset: 7108, type: "u32" }),
    sfxStopVoice9ProbeFirst: Object.freeze({ offset: 7112, type: "u32" }),
    sfxStopVoice9ProbeSecond: Object.freeze({ offset: 7116, type: "u32" }),
    sfxStopVoice9ChannelNullReload: Object.freeze({ offset: 7120, type: "u32" }),
    sfxStopVoice9VoicesReloaded: Object.freeze({ offset: 7124, type: "u32" }),
    sfxStopVoice10ChannelNull: Object.freeze({ offset: 7128, type: "u32" }),
    sfxStopVoice10Pending_09: Object.freeze({ offset: 7132, type: "u32" }),
    sfxStopVoice10ProbeFirst: Object.freeze({ offset: 7136, type: "u32" }),
    sfxStopVoice10ProbeSecond: Object.freeze({ offset: 7140, type: "u32" }),
    sfxStopVoice10ChannelNullReload: Object.freeze({ offset: 7144, type: "u32" }),
    sfxStopVoice10VoicesReloaded: Object.freeze({ offset: 7148, type: "u32" }),
    sfxStopVoice11ChannelNull: Object.freeze({ offset: 7152, type: "u32" }),
    sfxStopVoice11Pending_09: Object.freeze({ offset: 7156, type: "u32" }),
    sfxStopVoice11ProbeFirst: Object.freeze({ offset: 7160, type: "u32" }),
    sfxStopVoice11ProbeSecond: Object.freeze({ offset: 7164, type: "u32" }),
    sfxStopVoice11ChannelNullReload: Object.freeze({ offset: 7168, type: "u32" }),
    sfxStopVoice11VoicesReloaded: Object.freeze({ offset: 7172, type: "u32" }),
    sfxStopVoice12ChannelNull: Object.freeze({ offset: 7176, type: "u32" }),
    sfxStopVoice12Pending_09: Object.freeze({ offset: 7180, type: "u32" }),
    sfxStopVoice12ProbeFirst: Object.freeze({ offset: 7184, type: "u32" }),
    sfxStopVoice12ProbeSecond: Object.freeze({ offset: 7188, type: "u32" }),
    sfxStopVoice12ChannelNullReload: Object.freeze({ offset: 7192, type: "u32" }),
    sfxStopVoice12VoicesReloaded: Object.freeze({ offset: 7196, type: "u32" }),
    sfxStopVoice13ChannelNull: Object.freeze({ offset: 7200, type: "u32" }),
    sfxStopVoice13Pending_09: Object.freeze({ offset: 7204, type: "u32" }),
    sfxStopVoice13ProbeFirst: Object.freeze({ offset: 7208, type: "u32" }),
    sfxStopVoice13ProbeSecond: Object.freeze({ offset: 7212, type: "u32" }),
    sfxStopVoice13ChannelNullReload: Object.freeze({ offset: 7216, type: "u32" }),
    sfxStopVoice13VoicesReloaded: Object.freeze({ offset: 7220, type: "u32" }),
    sfxStopVoice14ChannelNull: Object.freeze({ offset: 7224, type: "u32" }),
    sfxStopVoice14Pending_09: Object.freeze({ offset: 7228, type: "u32" }),
    sfxStopVoice14ProbeFirst: Object.freeze({ offset: 7232, type: "u32" }),
    sfxStopVoice14ProbeSecond: Object.freeze({ offset: 7236, type: "u32" }),
    sfxStopVoice14ChannelNullReload: Object.freeze({ offset: 7240, type: "u32" }),
    sfxStopVoice14VoicesReloaded: Object.freeze({ offset: 7244, type: "u32" }),
    sfxStopVoice15ChannelNull: Object.freeze({ offset: 7248, type: "u32" }),
    sfxStopVoice15Pending_09: Object.freeze({ offset: 7252, type: "u32" }),
    sfxStopVoice15ProbeFirst: Object.freeze({ offset: 7256, type: "u32" }),
    sfxStopVoice15ProbeSecond: Object.freeze({ offset: 7260, type: "u32" }),
    sfxStopVoice15ChannelNullReload: Object.freeze({ offset: 7264, type: "u32" }),
    sfxStopVoice15VoicesReloaded: Object.freeze({ offset: 7268, type: "u32" }),
    sfxStopVoice16ChannelNull: Object.freeze({ offset: 7272, type: "u32" }),
    sfxStopVoice16Pending_09: Object.freeze({ offset: 7276, type: "u32" }),
    sfxStopVoice16ProbeFirst: Object.freeze({ offset: 7280, type: "u32" }),
    sfxStopVoice16ProbeSecond: Object.freeze({ offset: 7284, type: "u32" }),
    sfxStopVoice16ChannelNullReload: Object.freeze({ offset: 7288, type: "u32" }),
    sfxStopVoice16VoicesReloaded: Object.freeze({ offset: 7292, type: "u32" }),
    sfxStopVoice17ChannelNull: Object.freeze({ offset: 7296, type: "u32" }),
    sfxStopVoice17Pending_09: Object.freeze({ offset: 7300, type: "u32" }),
    sfxStopVoice17ProbeFirst: Object.freeze({ offset: 7304, type: "u32" }),
    sfxStopVoice17ProbeSecond: Object.freeze({ offset: 7308, type: "u32" }),
    sfxStopVoice17ChannelNullReload: Object.freeze({ offset: 7312, type: "u32" }),
    sfxStopVoice17VoicesReloaded: Object.freeze({ offset: 7316, type: "u32" }),
    sfxStopVoice18ChannelNull: Object.freeze({ offset: 7320, type: "u32" }),
    sfxStopVoice18Pending_09: Object.freeze({ offset: 7324, type: "u32" }),
    sfxStopVoice18ProbeFirst: Object.freeze({ offset: 7328, type: "u32" }),
    sfxStopVoice18ProbeSecond: Object.freeze({ offset: 7332, type: "u32" }),
    sfxStopVoice18ChannelNullReload: Object.freeze({ offset: 7336, type: "u32" }),
    sfxStopVoice18VoicesReloaded: Object.freeze({ offset: 7340, type: "u32" }),
    sfxStopVoice19ChannelNull: Object.freeze({ offset: 7344, type: "u32" }),
    sfxStopVoice19Pending_09: Object.freeze({ offset: 7348, type: "u32" }),
    sfxStopVoice19ProbeFirst: Object.freeze({ offset: 7352, type: "u32" }),
    sfxStopVoice19ProbeSecond: Object.freeze({ offset: 7356, type: "u32" }),
    sfxStopVoice19ChannelNullReload: Object.freeze({ offset: 7360, type: "u32" }),
    sfxStopVoice19VoicesReloaded: Object.freeze({ offset: 7364, type: "u32" }),
    sfxStopVoice20ChannelNull: Object.freeze({ offset: 7368, type: "u32" }),
    sfxStopVoice20Pending_09: Object.freeze({ offset: 7372, type: "u32" }),
    sfxStopVoice20ProbeFirst: Object.freeze({ offset: 7376, type: "u32" }),
    sfxStopVoice20ProbeSecond: Object.freeze({ offset: 7380, type: "u32" }),
    sfxStopVoice20ChannelNullReload: Object.freeze({ offset: 7384, type: "u32" }),
    sfxStopVoice20VoicesReloaded: Object.freeze({ offset: 7388, type: "u32" }),
    sfxStopVoice21ChannelNull: Object.freeze({ offset: 7392, type: "u32" }),
    sfxStopVoice21Pending_09: Object.freeze({ offset: 7396, type: "u32" }),
    sfxStopVoice21ProbeFirst: Object.freeze({ offset: 7400, type: "u32" }),
    sfxStopVoice21ProbeSecond: Object.freeze({ offset: 7404, type: "u32" }),
    sfxStopVoice21ChannelNullReload: Object.freeze({ offset: 7408, type: "u32" }),
    sfxStopVoice21VoicesReloaded: Object.freeze({ offset: 7412, type: "u32" }),
    sfxStopVoice22ChannelNull: Object.freeze({ offset: 7416, type: "u32" }),
    sfxStopVoice22Pending_09: Object.freeze({ offset: 7420, type: "u32" }),
    sfxStopVoice22ProbeFirst: Object.freeze({ offset: 7424, type: "u32" }),
    sfxStopVoice22ProbeSecond: Object.freeze({ offset: 7428, type: "u32" }),
    sfxStopVoice22ChannelNullReload: Object.freeze({ offset: 7432, type: "u32" }),
    sfxStopVoice22VoicesReloaded: Object.freeze({ offset: 7436, type: "u32" }),
    sfxStopVoice23ChannelNull: Object.freeze({ offset: 7440, type: "u32" }),
    sfxStopVoice23Pending_09: Object.freeze({ offset: 7444, type: "u32" }),
    sfxStopVoice23ProbeFirst: Object.freeze({ offset: 7448, type: "u32" }),
    sfxStopVoice23ProbeSecond: Object.freeze({ offset: 7452, type: "u32" }),
    sfxStopVoice23ChannelNullReload: Object.freeze({ offset: 7456, type: "u32" }),
    sfxStopVoice23VoicesReloaded: Object.freeze({ offset: 7460, type: "u32" }),
    sfxStopVoice24ChannelNull: Object.freeze({ offset: 7464, type: "u32" }),
    sfxStopVoice24Pending_09: Object.freeze({ offset: 7468, type: "u32" }),
    sfxStopVoice24ProbeFirst: Object.freeze({ offset: 7472, type: "u32" }),
    sfxStopVoice24ProbeSecond: Object.freeze({ offset: 7476, type: "u32" }),
    sfxStopVoice24ChannelNullReload: Object.freeze({ offset: 7480, type: "u32" }),
    sfxStopVoice24VoicesReloaded: Object.freeze({ offset: 7484, type: "u32" }),
    sfxStopVoice25ChannelNull: Object.freeze({ offset: 7488, type: "u32" }),
    sfxStopVoice25Pending_09: Object.freeze({ offset: 7492, type: "u32" }),
    sfxStopVoice25ProbeFirst: Object.freeze({ offset: 7496, type: "u32" }),
    sfxStopVoice25ProbeSecond: Object.freeze({ offset: 7500, type: "u32" }),
    sfxStopVoice25ChannelNullReload: Object.freeze({ offset: 7504, type: "u32" }),
    sfxStopVoice25VoicesReloaded: Object.freeze({ offset: 7508, type: "u32" }),
    sfxStopVoice26ChannelNull: Object.freeze({ offset: 7512, type: "u32" }),
    sfxStopVoice26Pending_09: Object.freeze({ offset: 7516, type: "u32" }),
    sfxStopVoice26ProbeFirst: Object.freeze({ offset: 7520, type: "u32" }),
    sfxStopVoice26ProbeSecond: Object.freeze({ offset: 7524, type: "u32" }),
    sfxStopVoice26ChannelNullReload: Object.freeze({ offset: 7528, type: "u32" }),
    sfxStopVoice26VoicesReloaded: Object.freeze({ offset: 7532, type: "u32" }),
    sfxStopVoice27ChannelNull: Object.freeze({ offset: 7536, type: "u32" }),
    sfxStopVoice27Pending_09: Object.freeze({ offset: 7540, type: "u32" }),
    sfxStopVoice27ProbeFirst: Object.freeze({ offset: 7544, type: "u32" }),
    sfxStopVoice27ProbeSecond: Object.freeze({ offset: 7548, type: "u32" }),
    sfxStopVoice27ChannelNullReload: Object.freeze({ offset: 7552, type: "u32" }),
    sfxStopVoice27VoicesReloaded: Object.freeze({ offset: 7556, type: "u32" }),
    sfxStopVoice28ChannelNull: Object.freeze({ offset: 7560, type: "u32" }),
    sfxStopVoice28Pending_09: Object.freeze({ offset: 7564, type: "u32" }),
    sfxStopVoice28ProbeFirst: Object.freeze({ offset: 7568, type: "u32" }),
    sfxStopVoice28ProbeSecond: Object.freeze({ offset: 7572, type: "u32" }),
    sfxStopVoice28ChannelNullReload: Object.freeze({ offset: 7576, type: "u32" }),
    sfxStopVoice28VoicesReloaded: Object.freeze({ offset: 7580, type: "u32" }),
    sfxStopVoice29ChannelNull: Object.freeze({ offset: 7584, type: "u32" }),
    sfxStopVoice29Pending_09: Object.freeze({ offset: 7588, type: "u32" }),
    sfxStopVoice29ProbeFirst: Object.freeze({ offset: 7592, type: "u32" }),
    sfxStopVoice29ProbeSecond: Object.freeze({ offset: 7596, type: "u32" }),
    sfxStopVoice29ChannelNullReload: Object.freeze({ offset: 7600, type: "u32" }),
    sfxStopVoice29VoicesReloaded: Object.freeze({ offset: 7604, type: "u32" }),
    sfxStopVoice30ChannelNull: Object.freeze({ offset: 7608, type: "u32" }),
    sfxStopVoice30Pending_09: Object.freeze({ offset: 7612, type: "u32" }),
    sfxStopVoice30ProbeFirst: Object.freeze({ offset: 7616, type: "u32" }),
    sfxStopVoice30ProbeSecond: Object.freeze({ offset: 7620, type: "u32" }),
    sfxStopVoice30ChannelNullReload: Object.freeze({ offset: 7624, type: "u32" }),
    sfxStopVoice30VoicesReloaded: Object.freeze({ offset: 7628, type: "u32" }),
    sfxStopVoice31ChannelNull: Object.freeze({ offset: 7632, type: "u32" }),
    sfxStopVoice31Pending_09: Object.freeze({ offset: 7636, type: "u32" }),
    sfxStopVoice31ProbeFirst: Object.freeze({ offset: 7640, type: "u32" }),
    sfxStopVoice31ProbeSecond: Object.freeze({ offset: 7644, type: "u32" }),
    sfxStopVoice31ChannelNullReload: Object.freeze({ offset: 7648, type: "u32" }),
    sfxStopVoice31VoicesReloaded: Object.freeze({ offset: 7652, type: "u32" }),
    /* ABI v95 (record idx 10 R1, 4212c0 A/B 409030-pair capture pack;
       wave-29 merge REBIND): the 9 pack lanes at the module offsets
       7656..7688 (was stale 6872..6904 = collided with sfxStopVoices —
       the module read zeros so the pure pair never ran in the
       differential). a/b_float_10 = float32 bits (layout u32 cells). */
    frameOpaque4212c0AbPackReady: Object.freeze({ offset: 7656, type: "u32" }),
    frameOpaque4212c0AFloat10: Object.freeze({ offset: 7660, type: "u32" }),
    frameOpaque4212c0BFloat10: Object.freeze({ offset: 7664, type: "u32" }),
    frameOpaque4212c0ALayer104: Object.freeze({ offset: 7668, type: "u32" }),
    frameOpaque4212c0BLayer104: Object.freeze({ offset: 7672, type: "u32" }),
    frameOpaque4212c0AFrameBound: Object.freeze({ offset: 7676, type: "i32" }),
    frameOpaque4212c0BFrameBound: Object.freeze({ offset: 7680, type: "i32" }),
    frameOpaque4212c0ALoopFlag: Object.freeze({ offset: 7684, type: "u32" }),
    frameOpaque4212c0BLoopFlag: Object.freeze({ offset: 7688, type: "u32" }),
    /* ABI v96 (coordinator-merged C11 §1.1 gap fix): the b18 entity walk
       pack at the header offsets 11068..11592 (was missing from the
       layout — the wire read the keys directly). */
    b18EntityReady: Object.freeze({ offset: 11068, type: "u32" }),
    b18EntityCount: Object.freeze({ offset: 11072, type: "u32" }),
    b18EntityMode: Object.freeze({ offset: 11076, type: "u32" }),
    b18EntityTypes: Object.freeze({ offset: 11080, type: "bytes", size: 256 }),
    b18EntityCastResults: Object.freeze({ offset: 11336, type: "bytes", size: 256 }),
    /* ABI v127 (update-v127-706c-restock-removal, ADDENDUM-3 F3 capture
       contract, taken at PE 0x805403 entry): shop-restock walk pack,
       APPENDED at the tail. All lanes u32; per-item arrays cap
       SHOP_RESTOCK_MAX=32 (ready MUST NOT be set when
       [Room+0x7080] > 32 — over-cap keeps the monolith). */
    shopRestockReady: Object.freeze({ offset: 14684, type: "u32" }),
    shopRoomWidth: Object.freeze({ offset: 14688, type: "i32" }),
    shopRestockCount: Object.freeze({ offset: 14692, type: "i32" }),
    shopBucketCount: Object.freeze({ offset: 14696, type: "u32" }),
    shopBucketCursorIn: Object.freeze({ offset: 14700, type: "u32" }),
    shopHashIn: Object.freeze({ offset: 14704, type: "u32" }),
    shopMgrGlobalA: Object.freeze({ offset: 14708, type: "u32" }),
    shopMgrGlobalB: Object.freeze({ offset: 14712, type: "u32" }),
    shopCellIds: Object.freeze({ offset: 14716, type: "bytes", size: 128 }),
    shopCellPtrs: Object.freeze({ offset: 14844, type: "bytes", size: 128 }),
    shopCellValid: Object.freeze({ offset: 14972, type: "bytes", size: 128 }),
    shopCellCounterPre: Object.freeze({ offset: 15100, type: "bytes", size: 128 }),
    shopVcallFired: Object.freeze({ offset: 15228, type: "bytes", size: 128 }),
    shopGenrandRet: Object.freeze({ offset: 15356, type: "bytes", size: 128 }),
    /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45 §2): the
       update-lane capture scalars (per-voice probes reuse the committed
       sfxStopVoices pack; master vol [[0xc7169c]+0x2a358] and [mgr+0x10]
       are mutable host state — captured IN, never folded). */
    sfxUpdReady: Object.freeze({ offset: 15484, type: "u32" }),
    sfxUpdArgVol: Object.freeze({ offset: 15488, type: "u32" }),
    sfxUpdMasterVol: Object.freeze({ offset: 15492, type: "u32" }),
    sfxUpdMgrScalar: Object.freeze({ offset: 15496, type: "u32" }),
    sfxUpdVolMemPre: Object.freeze({ offset: 15500, type: "u32" }),
    /* ABI v131 (update-v131-greed-probe-pack, record idx 30): entity
       capture pack @15504..15736 (voucher + count + 8 elems x 7 u32,
       stride 28) for the room-pure ABI v81 greed-probe band consumed BY
       REFERENCE. */
    greedProbePackReady: Object.freeze({ offset: 15504, type: "u32" }),
    greedProbeElemCount: Object.freeze({ offset: 15508, type: "u32" }),
    greedProbeF2c0: Object.freeze({ offset: 15512, type: "u32" }),
    greedProbeF3bc0: Object.freeze({ offset: 15516, type: "u32" }),
    greedProbeHasParent0: Object.freeze({ offset: 15520, type: "u32" }),
    greedProbeParent161c0: Object.freeze({ offset: 15524, type: "u32" }),
    greedProbeSelf161c0: Object.freeze({ offset: 15528, type: "u32" }),
    greedProbeParentIsSelf0: Object.freeze({ offset: 15532, type: "u32" }),
    greedProbeF20a90: Object.freeze({ offset: 15536, type: "u32" }),
    greedProbeF2c1: Object.freeze({ offset: 15540, type: "u32" }),
    greedProbeF3bc1: Object.freeze({ offset: 15544, type: "u32" }),
    greedProbeHasParent1: Object.freeze({ offset: 15548, type: "u32" }),
    greedProbeParent161c1: Object.freeze({ offset: 15552, type: "u32" }),
    greedProbeSelf161c1: Object.freeze({ offset: 15556, type: "u32" }),
    greedProbeParentIsSelf1: Object.freeze({ offset: 15560, type: "u32" }),
    greedProbeF20a91: Object.freeze({ offset: 15564, type: "u32" }),
    greedProbeF2c2: Object.freeze({ offset: 15568, type: "u32" }),
    greedProbeF3bc2: Object.freeze({ offset: 15572, type: "u32" }),
    greedProbeHasParent2: Object.freeze({ offset: 15576, type: "u32" }),
    greedProbeParent161c2: Object.freeze({ offset: 15580, type: "u32" }),
    greedProbeSelf161c2: Object.freeze({ offset: 15584, type: "u32" }),
    greedProbeParentIsSelf2: Object.freeze({ offset: 15588, type: "u32" }),
    greedProbeF20a92: Object.freeze({ offset: 15592, type: "u32" }),
    greedProbeF2c3: Object.freeze({ offset: 15596, type: "u32" }),
    greedProbeF3bc3: Object.freeze({ offset: 15600, type: "u32" }),
    greedProbeHasParent3: Object.freeze({ offset: 15604, type: "u32" }),
    greedProbeParent161c3: Object.freeze({ offset: 15608, type: "u32" }),
    greedProbeSelf161c3: Object.freeze({ offset: 15612, type: "u32" }),
    greedProbeParentIsSelf3: Object.freeze({ offset: 15616, type: "u32" }),
    greedProbeF20a93: Object.freeze({ offset: 15620, type: "u32" }),
    greedProbeF2c4: Object.freeze({ offset: 15624, type: "u32" }),
    greedProbeF3bc4: Object.freeze({ offset: 15628, type: "u32" }),
    greedProbeHasParent4: Object.freeze({ offset: 15632, type: "u32" }),
    greedProbeParent161c4: Object.freeze({ offset: 15636, type: "u32" }),
    greedProbeSelf161c4: Object.freeze({ offset: 15640, type: "u32" }),
    greedProbeParentIsSelf4: Object.freeze({ offset: 15644, type: "u32" }),
    greedProbeF20a94: Object.freeze({ offset: 15648, type: "u32" }),
    greedProbeF2c5: Object.freeze({ offset: 15652, type: "u32" }),
    greedProbeF3bc5: Object.freeze({ offset: 15656, type: "u32" }),
    greedProbeHasParent5: Object.freeze({ offset: 15660, type: "u32" }),
    greedProbeParent161c5: Object.freeze({ offset: 15664, type: "u32" }),
    greedProbeSelf161c5: Object.freeze({ offset: 15668, type: "u32" }),
    greedProbeParentIsSelf5: Object.freeze({ offset: 15672, type: "u32" }),
    greedProbeF20a95: Object.freeze({ offset: 15676, type: "u32" }),
    greedProbeF2c6: Object.freeze({ offset: 15680, type: "u32" }),
    greedProbeF3bc6: Object.freeze({ offset: 15684, type: "u32" }),
    greedProbeHasParent6: Object.freeze({ offset: 15688, type: "u32" }),
    greedProbeParent161c6: Object.freeze({ offset: 15692, type: "u32" }),
    greedProbeSelf161c6: Object.freeze({ offset: 15696, type: "u32" }),
    greedProbeParentIsSelf6: Object.freeze({ offset: 15700, type: "u32" }),
    greedProbeF20a96: Object.freeze({ offset: 15704, type: "u32" }),
    greedProbeF2c7: Object.freeze({ offset: 15708, type: "u32" }),
    greedProbeF3bc7: Object.freeze({ offset: 15712, type: "u32" }),
    greedProbeHasParent7: Object.freeze({ offset: 15716, type: "u32" }),
    greedProbeParent161c7: Object.freeze({ offset: 15720, type: "u32" }),
    greedProbeSelf161c7: Object.freeze({ offset: 15724, type: "u32" }),
    greedProbeParentIsSelf7: Object.freeze({ offset: 15728, type: "u32" }),
    greedProbeF20a97: Object.freeze({ offset: 15732, type: "u32" }),
    /* ABI v132 (update-v132-b16-spawn-pack, record idx 36): spawn-walk
       enumeration capture @15736..16776 (contracts-b16-spawn NOTES §2/§3,
       Option A): voucher + per-arm counts + dims echo + 64-row pools of
       {cell_index, entity_ptr} for lanes W (water band) / L (lava band),
       PE order. Over-cap arm poisons the voucher -> monolith stays. */
    waterB16SpawnRowsReady: Object.freeze({ offset: 15736, type: "u32" }),
    waterB16WaterHitCount: Object.freeze({ offset: 15740, type: "u32" }),
    waterB16LavaHitCount: Object.freeze({ offset: 15744, type: "u32" }),
    waterB16GridWEcho: Object.freeze({ offset: 15748, type: "u32" }),
    waterB16GridHEcho: Object.freeze({ offset: 15752, type: "u32" }),
    waterB16WaterHitCellIdx0: Object.freeze({ offset: 15756, type: "u32" }),
    waterB16WaterHitCellIdx1: Object.freeze({ offset: 15764, type: "u32" }),
    waterB16WaterHitCellIdx2: Object.freeze({ offset: 15772, type: "u32" }),
    waterB16WaterHitCellIdx3: Object.freeze({ offset: 15780, type: "u32" }),
    waterB16WaterHitCellIdx4: Object.freeze({ offset: 15788, type: "u32" }),
    waterB16WaterHitCellIdx5: Object.freeze({ offset: 15796, type: "u32" }),
    waterB16WaterHitCellIdx6: Object.freeze({ offset: 15804, type: "u32" }),
    waterB16WaterHitCellIdx7: Object.freeze({ offset: 15812, type: "u32" }),
    waterB16WaterHitCellIdx8: Object.freeze({ offset: 15820, type: "u32" }),
    waterB16WaterHitCellIdx9: Object.freeze({ offset: 15828, type: "u32" }),
    waterB16WaterHitCellIdx10: Object.freeze({ offset: 15836, type: "u32" }),
    waterB16WaterHitCellIdx11: Object.freeze({ offset: 15844, type: "u32" }),
    waterB16WaterHitCellIdx12: Object.freeze({ offset: 15852, type: "u32" }),
    waterB16WaterHitCellIdx13: Object.freeze({ offset: 15860, type: "u32" }),
    waterB16WaterHitCellIdx14: Object.freeze({ offset: 15868, type: "u32" }),
    waterB16WaterHitCellIdx15: Object.freeze({ offset: 15876, type: "u32" }),
    waterB16WaterHitCellIdx16: Object.freeze({ offset: 15884, type: "u32" }),
    waterB16WaterHitCellIdx17: Object.freeze({ offset: 15892, type: "u32" }),
    waterB16WaterHitCellIdx18: Object.freeze({ offset: 15900, type: "u32" }),
    waterB16WaterHitCellIdx19: Object.freeze({ offset: 15908, type: "u32" }),
    waterB16WaterHitCellIdx20: Object.freeze({ offset: 15916, type: "u32" }),
    waterB16WaterHitCellIdx21: Object.freeze({ offset: 15924, type: "u32" }),
    waterB16WaterHitCellIdx22: Object.freeze({ offset: 15932, type: "u32" }),
    waterB16WaterHitCellIdx23: Object.freeze({ offset: 15940, type: "u32" }),
    waterB16WaterHitCellIdx24: Object.freeze({ offset: 15948, type: "u32" }),
    waterB16WaterHitCellIdx25: Object.freeze({ offset: 15956, type: "u32" }),
    waterB16WaterHitCellIdx26: Object.freeze({ offset: 15964, type: "u32" }),
    waterB16WaterHitCellIdx27: Object.freeze({ offset: 15972, type: "u32" }),
    waterB16WaterHitCellIdx28: Object.freeze({ offset: 15980, type: "u32" }),
    waterB16WaterHitCellIdx29: Object.freeze({ offset: 15988, type: "u32" }),
    waterB16WaterHitCellIdx30: Object.freeze({ offset: 15996, type: "u32" }),
    waterB16WaterHitCellIdx31: Object.freeze({ offset: 16004, type: "u32" }),
    waterB16WaterHitCellIdx32: Object.freeze({ offset: 16012, type: "u32" }),
    waterB16WaterHitCellIdx33: Object.freeze({ offset: 16020, type: "u32" }),
    waterB16WaterHitCellIdx34: Object.freeze({ offset: 16028, type: "u32" }),
    waterB16WaterHitCellIdx35: Object.freeze({ offset: 16036, type: "u32" }),
    waterB16WaterHitCellIdx36: Object.freeze({ offset: 16044, type: "u32" }),
    waterB16WaterHitCellIdx37: Object.freeze({ offset: 16052, type: "u32" }),
    waterB16WaterHitCellIdx38: Object.freeze({ offset: 16060, type: "u32" }),
    waterB16WaterHitCellIdx39: Object.freeze({ offset: 16068, type: "u32" }),
    waterB16WaterHitCellIdx40: Object.freeze({ offset: 16076, type: "u32" }),
    waterB16WaterHitCellIdx41: Object.freeze({ offset: 16084, type: "u32" }),
    waterB16WaterHitCellIdx42: Object.freeze({ offset: 16092, type: "u32" }),
    waterB16WaterHitCellIdx43: Object.freeze({ offset: 16100, type: "u32" }),
    waterB16WaterHitCellIdx44: Object.freeze({ offset: 16108, type: "u32" }),
    waterB16WaterHitCellIdx45: Object.freeze({ offset: 16116, type: "u32" }),
    waterB16WaterHitCellIdx46: Object.freeze({ offset: 16124, type: "u32" }),
    waterB16WaterHitCellIdx47: Object.freeze({ offset: 16132, type: "u32" }),
    waterB16WaterHitCellIdx48: Object.freeze({ offset: 16140, type: "u32" }),
    waterB16WaterHitCellIdx49: Object.freeze({ offset: 16148, type: "u32" }),
    waterB16WaterHitCellIdx50: Object.freeze({ offset: 16156, type: "u32" }),
    waterB16WaterHitCellIdx51: Object.freeze({ offset: 16164, type: "u32" }),
    waterB16WaterHitCellIdx52: Object.freeze({ offset: 16172, type: "u32" }),
    waterB16WaterHitCellIdx53: Object.freeze({ offset: 16180, type: "u32" }),
    waterB16WaterHitCellIdx54: Object.freeze({ offset: 16188, type: "u32" }),
    waterB16WaterHitCellIdx55: Object.freeze({ offset: 16196, type: "u32" }),
    waterB16WaterHitCellIdx56: Object.freeze({ offset: 16204, type: "u32" }),
    waterB16WaterHitCellIdx57: Object.freeze({ offset: 16212, type: "u32" }),
    waterB16WaterHitCellIdx58: Object.freeze({ offset: 16220, type: "u32" }),
    waterB16WaterHitCellIdx59: Object.freeze({ offset: 16228, type: "u32" }),
    waterB16WaterHitCellIdx60: Object.freeze({ offset: 16236, type: "u32" }),
    waterB16WaterHitCellIdx61: Object.freeze({ offset: 16244, type: "u32" }),
    waterB16WaterHitCellIdx62: Object.freeze({ offset: 16252, type: "u32" }),
    waterB16WaterHitCellIdx63: Object.freeze({ offset: 16260, type: "u32" }),
    waterB16WaterHitEntPtr0: Object.freeze({ offset: 15760, type: "u32" }),
    waterB16WaterHitEntPtr1: Object.freeze({ offset: 15768, type: "u32" }),
    waterB16WaterHitEntPtr2: Object.freeze({ offset: 15776, type: "u32" }),
    waterB16WaterHitEntPtr3: Object.freeze({ offset: 15784, type: "u32" }),
    waterB16WaterHitEntPtr4: Object.freeze({ offset: 15792, type: "u32" }),
    waterB16WaterHitEntPtr5: Object.freeze({ offset: 15800, type: "u32" }),
    waterB16WaterHitEntPtr6: Object.freeze({ offset: 15808, type: "u32" }),
    waterB16WaterHitEntPtr7: Object.freeze({ offset: 15816, type: "u32" }),
    waterB16WaterHitEntPtr8: Object.freeze({ offset: 15824, type: "u32" }),
    waterB16WaterHitEntPtr9: Object.freeze({ offset: 15832, type: "u32" }),
    waterB16WaterHitEntPtr10: Object.freeze({ offset: 15840, type: "u32" }),
    waterB16WaterHitEntPtr11: Object.freeze({ offset: 15848, type: "u32" }),
    waterB16WaterHitEntPtr12: Object.freeze({ offset: 15856, type: "u32" }),
    waterB16WaterHitEntPtr13: Object.freeze({ offset: 15864, type: "u32" }),
    waterB16WaterHitEntPtr14: Object.freeze({ offset: 15872, type: "u32" }),
    waterB16WaterHitEntPtr15: Object.freeze({ offset: 15880, type: "u32" }),
    waterB16WaterHitEntPtr16: Object.freeze({ offset: 15888, type: "u32" }),
    waterB16WaterHitEntPtr17: Object.freeze({ offset: 15896, type: "u32" }),
    waterB16WaterHitEntPtr18: Object.freeze({ offset: 15904, type: "u32" }),
    waterB16WaterHitEntPtr19: Object.freeze({ offset: 15912, type: "u32" }),
    waterB16WaterHitEntPtr20: Object.freeze({ offset: 15920, type: "u32" }),
    waterB16WaterHitEntPtr21: Object.freeze({ offset: 15928, type: "u32" }),
    waterB16WaterHitEntPtr22: Object.freeze({ offset: 15936, type: "u32" }),
    waterB16WaterHitEntPtr23: Object.freeze({ offset: 15944, type: "u32" }),
    waterB16WaterHitEntPtr24: Object.freeze({ offset: 15952, type: "u32" }),
    waterB16WaterHitEntPtr25: Object.freeze({ offset: 15960, type: "u32" }),
    waterB16WaterHitEntPtr26: Object.freeze({ offset: 15968, type: "u32" }),
    waterB16WaterHitEntPtr27: Object.freeze({ offset: 15976, type: "u32" }),
    waterB16WaterHitEntPtr28: Object.freeze({ offset: 15984, type: "u32" }),
    waterB16WaterHitEntPtr29: Object.freeze({ offset: 15992, type: "u32" }),
    waterB16WaterHitEntPtr30: Object.freeze({ offset: 16000, type: "u32" }),
    waterB16WaterHitEntPtr31: Object.freeze({ offset: 16008, type: "u32" }),
    waterB16WaterHitEntPtr32: Object.freeze({ offset: 16016, type: "u32" }),
    waterB16WaterHitEntPtr33: Object.freeze({ offset: 16024, type: "u32" }),
    waterB16WaterHitEntPtr34: Object.freeze({ offset: 16032, type: "u32" }),
    waterB16WaterHitEntPtr35: Object.freeze({ offset: 16040, type: "u32" }),
    waterB16WaterHitEntPtr36: Object.freeze({ offset: 16048, type: "u32" }),
    waterB16WaterHitEntPtr37: Object.freeze({ offset: 16056, type: "u32" }),
    waterB16WaterHitEntPtr38: Object.freeze({ offset: 16064, type: "u32" }),
    waterB16WaterHitEntPtr39: Object.freeze({ offset: 16072, type: "u32" }),
    waterB16WaterHitEntPtr40: Object.freeze({ offset: 16080, type: "u32" }),
    waterB16WaterHitEntPtr41: Object.freeze({ offset: 16088, type: "u32" }),
    waterB16WaterHitEntPtr42: Object.freeze({ offset: 16096, type: "u32" }),
    waterB16WaterHitEntPtr43: Object.freeze({ offset: 16104, type: "u32" }),
    waterB16WaterHitEntPtr44: Object.freeze({ offset: 16112, type: "u32" }),
    waterB16WaterHitEntPtr45: Object.freeze({ offset: 16120, type: "u32" }),
    waterB16WaterHitEntPtr46: Object.freeze({ offset: 16128, type: "u32" }),
    waterB16WaterHitEntPtr47: Object.freeze({ offset: 16136, type: "u32" }),
    waterB16WaterHitEntPtr48: Object.freeze({ offset: 16144, type: "u32" }),
    waterB16WaterHitEntPtr49: Object.freeze({ offset: 16152, type: "u32" }),
    waterB16WaterHitEntPtr50: Object.freeze({ offset: 16160, type: "u32" }),
    waterB16WaterHitEntPtr51: Object.freeze({ offset: 16168, type: "u32" }),
    waterB16WaterHitEntPtr52: Object.freeze({ offset: 16176, type: "u32" }),
    waterB16WaterHitEntPtr53: Object.freeze({ offset: 16184, type: "u32" }),
    waterB16WaterHitEntPtr54: Object.freeze({ offset: 16192, type: "u32" }),
    waterB16WaterHitEntPtr55: Object.freeze({ offset: 16200, type: "u32" }),
    waterB16WaterHitEntPtr56: Object.freeze({ offset: 16208, type: "u32" }),
    waterB16WaterHitEntPtr57: Object.freeze({ offset: 16216, type: "u32" }),
    waterB16WaterHitEntPtr58: Object.freeze({ offset: 16224, type: "u32" }),
    waterB16WaterHitEntPtr59: Object.freeze({ offset: 16232, type: "u32" }),
    waterB16WaterHitEntPtr60: Object.freeze({ offset: 16240, type: "u32" }),
    waterB16WaterHitEntPtr61: Object.freeze({ offset: 16248, type: "u32" }),
    waterB16WaterHitEntPtr62: Object.freeze({ offset: 16256, type: "u32" }),
    waterB16WaterHitEntPtr63: Object.freeze({ offset: 16264, type: "u32" }),
    waterB16LavaHitCellIdx0: Object.freeze({ offset: 15756, type: "u32" }),
    waterB16LavaHitCellIdx1: Object.freeze({ offset: 15764, type: "u32" }),
    waterB16LavaHitCellIdx2: Object.freeze({ offset: 15772, type: "u32" }),
    waterB16LavaHitCellIdx3: Object.freeze({ offset: 15780, type: "u32" }),
    waterB16LavaHitCellIdx4: Object.freeze({ offset: 15788, type: "u32" }),
    waterB16LavaHitCellIdx5: Object.freeze({ offset: 15796, type: "u32" }),
    waterB16LavaHitCellIdx6: Object.freeze({ offset: 15804, type: "u32" }),
    waterB16LavaHitCellIdx7: Object.freeze({ offset: 15812, type: "u32" }),
    waterB16LavaHitCellIdx8: Object.freeze({ offset: 15820, type: "u32" }),
    waterB16LavaHitCellIdx9: Object.freeze({ offset: 15828, type: "u32" }),
    waterB16LavaHitCellIdx10: Object.freeze({ offset: 15836, type: "u32" }),
    waterB16LavaHitCellIdx11: Object.freeze({ offset: 15844, type: "u32" }),
    waterB16LavaHitCellIdx12: Object.freeze({ offset: 15852, type: "u32" }),
    waterB16LavaHitCellIdx13: Object.freeze({ offset: 15860, type: "u32" }),
    waterB16LavaHitCellIdx14: Object.freeze({ offset: 15868, type: "u32" }),
    waterB16LavaHitCellIdx15: Object.freeze({ offset: 15876, type: "u32" }),
    waterB16LavaHitCellIdx16: Object.freeze({ offset: 15884, type: "u32" }),
    waterB16LavaHitCellIdx17: Object.freeze({ offset: 15892, type: "u32" }),
    waterB16LavaHitCellIdx18: Object.freeze({ offset: 15900, type: "u32" }),
    waterB16LavaHitCellIdx19: Object.freeze({ offset: 15908, type: "u32" }),
    waterB16LavaHitCellIdx20: Object.freeze({ offset: 15916, type: "u32" }),
    waterB16LavaHitCellIdx21: Object.freeze({ offset: 15924, type: "u32" }),
    waterB16LavaHitCellIdx22: Object.freeze({ offset: 15932, type: "u32" }),
    waterB16LavaHitCellIdx23: Object.freeze({ offset: 15940, type: "u32" }),
    waterB16LavaHitCellIdx24: Object.freeze({ offset: 15948, type: "u32" }),
    waterB16LavaHitCellIdx25: Object.freeze({ offset: 15956, type: "u32" }),
    waterB16LavaHitCellIdx26: Object.freeze({ offset: 15964, type: "u32" }),
    waterB16LavaHitCellIdx27: Object.freeze({ offset: 15972, type: "u32" }),
    waterB16LavaHitCellIdx28: Object.freeze({ offset: 15980, type: "u32" }),
    waterB16LavaHitCellIdx29: Object.freeze({ offset: 15988, type: "u32" }),
    waterB16LavaHitCellIdx30: Object.freeze({ offset: 15996, type: "u32" }),
    waterB16LavaHitCellIdx31: Object.freeze({ offset: 16004, type: "u32" }),
    waterB16LavaHitCellIdx32: Object.freeze({ offset: 16012, type: "u32" }),
    waterB16LavaHitCellIdx33: Object.freeze({ offset: 16020, type: "u32" }),
    waterB16LavaHitCellIdx34: Object.freeze({ offset: 16028, type: "u32" }),
    waterB16LavaHitCellIdx35: Object.freeze({ offset: 16036, type: "u32" }),
    waterB16LavaHitCellIdx36: Object.freeze({ offset: 16044, type: "u32" }),
    waterB16LavaHitCellIdx37: Object.freeze({ offset: 16052, type: "u32" }),
    waterB16LavaHitCellIdx38: Object.freeze({ offset: 16060, type: "u32" }),
    waterB16LavaHitCellIdx39: Object.freeze({ offset: 16068, type: "u32" }),
    waterB16LavaHitCellIdx40: Object.freeze({ offset: 16076, type: "u32" }),
    waterB16LavaHitCellIdx41: Object.freeze({ offset: 16084, type: "u32" }),
    waterB16LavaHitCellIdx42: Object.freeze({ offset: 16092, type: "u32" }),
    waterB16LavaHitCellIdx43: Object.freeze({ offset: 16100, type: "u32" }),
    waterB16LavaHitCellIdx44: Object.freeze({ offset: 16108, type: "u32" }),
    waterB16LavaHitCellIdx45: Object.freeze({ offset: 16116, type: "u32" }),
    waterB16LavaHitCellIdx46: Object.freeze({ offset: 16124, type: "u32" }),
    waterB16LavaHitCellIdx47: Object.freeze({ offset: 16132, type: "u32" }),
    waterB16LavaHitCellIdx48: Object.freeze({ offset: 16140, type: "u32" }),
    waterB16LavaHitCellIdx49: Object.freeze({ offset: 16148, type: "u32" }),
    waterB16LavaHitCellIdx50: Object.freeze({ offset: 16156, type: "u32" }),
    waterB16LavaHitCellIdx51: Object.freeze({ offset: 16164, type: "u32" }),
    waterB16LavaHitCellIdx52: Object.freeze({ offset: 16172, type: "u32" }),
    waterB16LavaHitCellIdx53: Object.freeze({ offset: 16180, type: "u32" }),
    waterB16LavaHitCellIdx54: Object.freeze({ offset: 16188, type: "u32" }),
    waterB16LavaHitCellIdx55: Object.freeze({ offset: 16196, type: "u32" }),
    waterB16LavaHitCellIdx56: Object.freeze({ offset: 16204, type: "u32" }),
    waterB16LavaHitCellIdx57: Object.freeze({ offset: 16212, type: "u32" }),
    waterB16LavaHitCellIdx58: Object.freeze({ offset: 16220, type: "u32" }),
    waterB16LavaHitCellIdx59: Object.freeze({ offset: 16228, type: "u32" }),
    waterB16LavaHitCellIdx60: Object.freeze({ offset: 16236, type: "u32" }),
    waterB16LavaHitCellIdx61: Object.freeze({ offset: 16244, type: "u32" }),
    waterB16LavaHitCellIdx62: Object.freeze({ offset: 16252, type: "u32" }),
    waterB16LavaHitCellIdx63: Object.freeze({ offset: 16260, type: "u32" }),
    waterB16LavaHitEntPtr0: Object.freeze({ offset: 15760, type: "u32" }),
    waterB16LavaHitEntPtr1: Object.freeze({ offset: 15768, type: "u32" }),
    waterB16LavaHitEntPtr2: Object.freeze({ offset: 15776, type: "u32" }),
    waterB16LavaHitEntPtr3: Object.freeze({ offset: 15784, type: "u32" }),
    waterB16LavaHitEntPtr4: Object.freeze({ offset: 15792, type: "u32" }),
    waterB16LavaHitEntPtr5: Object.freeze({ offset: 15800, type: "u32" }),
    waterB16LavaHitEntPtr6: Object.freeze({ offset: 15808, type: "u32" }),
    waterB16LavaHitEntPtr7: Object.freeze({ offset: 15816, type: "u32" }),
    waterB16LavaHitEntPtr8: Object.freeze({ offset: 15824, type: "u32" }),
    waterB16LavaHitEntPtr9: Object.freeze({ offset: 15832, type: "u32" }),
    waterB16LavaHitEntPtr10: Object.freeze({ offset: 15840, type: "u32" }),
    waterB16LavaHitEntPtr11: Object.freeze({ offset: 15848, type: "u32" }),
    waterB16LavaHitEntPtr12: Object.freeze({ offset: 15856, type: "u32" }),
    waterB16LavaHitEntPtr13: Object.freeze({ offset: 15864, type: "u32" }),
    waterB16LavaHitEntPtr14: Object.freeze({ offset: 15872, type: "u32" }),
    waterB16LavaHitEntPtr15: Object.freeze({ offset: 15880, type: "u32" }),
    waterB16LavaHitEntPtr16: Object.freeze({ offset: 15888, type: "u32" }),
    waterB16LavaHitEntPtr17: Object.freeze({ offset: 15896, type: "u32" }),
    waterB16LavaHitEntPtr18: Object.freeze({ offset: 15904, type: "u32" }),
    waterB16LavaHitEntPtr19: Object.freeze({ offset: 15912, type: "u32" }),
    waterB16LavaHitEntPtr20: Object.freeze({ offset: 15920, type: "u32" }),
    waterB16LavaHitEntPtr21: Object.freeze({ offset: 15928, type: "u32" }),
    waterB16LavaHitEntPtr22: Object.freeze({ offset: 15936, type: "u32" }),
    waterB16LavaHitEntPtr23: Object.freeze({ offset: 15944, type: "u32" }),
    waterB16LavaHitEntPtr24: Object.freeze({ offset: 15952, type: "u32" }),
    waterB16LavaHitEntPtr25: Object.freeze({ offset: 15960, type: "u32" }),
    waterB16LavaHitEntPtr26: Object.freeze({ offset: 15968, type: "u32" }),
    waterB16LavaHitEntPtr27: Object.freeze({ offset: 15976, type: "u32" }),
    waterB16LavaHitEntPtr28: Object.freeze({ offset: 15984, type: "u32" }),
    waterB16LavaHitEntPtr29: Object.freeze({ offset: 15992, type: "u32" }),
    waterB16LavaHitEntPtr30: Object.freeze({ offset: 16000, type: "u32" }),
    waterB16LavaHitEntPtr31: Object.freeze({ offset: 16008, type: "u32" }),
    waterB16LavaHitEntPtr32: Object.freeze({ offset: 16016, type: "u32" }),
    waterB16LavaHitEntPtr33: Object.freeze({ offset: 16024, type: "u32" }),
    waterB16LavaHitEntPtr34: Object.freeze({ offset: 16032, type: "u32" }),
    waterB16LavaHitEntPtr35: Object.freeze({ offset: 16040, type: "u32" }),
    waterB16LavaHitEntPtr36: Object.freeze({ offset: 16048, type: "u32" }),
    waterB16LavaHitEntPtr37: Object.freeze({ offset: 16056, type: "u32" }),
    waterB16LavaHitEntPtr38: Object.freeze({ offset: 16064, type: "u32" }),
    waterB16LavaHitEntPtr39: Object.freeze({ offset: 16072, type: "u32" }),
    waterB16LavaHitEntPtr40: Object.freeze({ offset: 16080, type: "u32" }),
    waterB16LavaHitEntPtr41: Object.freeze({ offset: 16088, type: "u32" }),
    waterB16LavaHitEntPtr42: Object.freeze({ offset: 16096, type: "u32" }),
    waterB16LavaHitEntPtr43: Object.freeze({ offset: 16104, type: "u32" }),
    waterB16LavaHitEntPtr44: Object.freeze({ offset: 16112, type: "u32" }),
    waterB16LavaHitEntPtr45: Object.freeze({ offset: 16120, type: "u32" }),
    waterB16LavaHitEntPtr46: Object.freeze({ offset: 16128, type: "u32" }),
    waterB16LavaHitEntPtr47: Object.freeze({ offset: 16136, type: "u32" }),
    waterB16LavaHitEntPtr48: Object.freeze({ offset: 16144, type: "u32" }),
    waterB16LavaHitEntPtr49: Object.freeze({ offset: 16152, type: "u32" }),
    waterB16LavaHitEntPtr50: Object.freeze({ offset: 16160, type: "u32" }),
    waterB16LavaHitEntPtr51: Object.freeze({ offset: 16168, type: "u32" }),
    waterB16LavaHitEntPtr52: Object.freeze({ offset: 16176, type: "u32" }),
    waterB16LavaHitEntPtr53: Object.freeze({ offset: 16184, type: "u32" }),
    waterB16LavaHitEntPtr54: Object.freeze({ offset: 16192, type: "u32" }),
    waterB16LavaHitEntPtr55: Object.freeze({ offset: 16200, type: "u32" }),
    waterB16LavaHitEntPtr56: Object.freeze({ offset: 16208, type: "u32" }),
    waterB16LavaHitEntPtr57: Object.freeze({ offset: 16216, type: "u32" }),
    waterB16LavaHitEntPtr58: Object.freeze({ offset: 16224, type: "u32" }),
    waterB16LavaHitEntPtr59: Object.freeze({ offset: 16232, type: "u32" }),
    waterB16LavaHitEntPtr60: Object.freeze({ offset: 16240, type: "u32" }),
    waterB16LavaHitEntPtr61: Object.freeze({ offset: 16248, type: "u32" }),
    waterB16LavaHitEntPtr62: Object.freeze({ offset: 16256, type: "u32" }),
    waterB16LavaHitEntPtr63: Object.freeze({ offset: 16264, type: "u32" }),
    /* ABI v133 (update-v133-audio-music-pack, records idx26/27):
       spawn-tail capture packs @16780..17536 (contracts-audio-music
       NOTES §2): per-body voucher + loop bound + header lanes + 8 rows
       x 11 u32 (stride 44; 7 genrand draws verbatim + HOST cos/sin
       bits + ent px/py readbacks). Over-cap/missing -> monolith. */
    tca40TailPackReady: Object.freeze({ offset: 16780, type: "u32" }),
    tca40TailIterCount: Object.freeze({ offset: 16784, type: "u32" }),
    tca40TailDoorF24: Object.freeze({ offset: 16788, type: "u32" }),
    tca40TailGameC: Object.freeze({ offset: 16792, type: "u32" }),
    tca40TailVec0Bits: Object.freeze({ offset: 16796, type: "u32" }),
    tca40TailVec4Bits: Object.freeze({ offset: 16800, type: "u32" }),
    tca40TailRotCosBits: Object.freeze({ offset: 16804, type: "u32" }),
    tca40TailRotSinBits: Object.freeze({ offset: 16808, type: "u32" }),
    tca40TailRa0: Object.freeze({ offset: 16812, type: "u32" }),
    tca40TailRb0: Object.freeze({ offset: 16816, type: "u32" }),
    tca40TailRc0: Object.freeze({ offset: 16820, type: "u32" }),
    tca40TailRd0: Object.freeze({ offset: 16824, type: "u32" }),
    tca40TailRe0: Object.freeze({ offset: 16828, type: "u32" }),
    tca40TailRf0: Object.freeze({ offset: 16832, type: "u32" }),
    tca40TailRg0: Object.freeze({ offset: 16836, type: "u32" }),
    tca40TailCosH0: Object.freeze({ offset: 16840, type: "u32" }),
    tca40TailSinH0: Object.freeze({ offset: 16844, type: "u32" }),
    tca40TailEntPx0: Object.freeze({ offset: 16848, type: "u32" }),
    tca40TailEntPy0: Object.freeze({ offset: 16852, type: "u32" }),
    tca40TailRa1: Object.freeze({ offset: 16856, type: "u32" }),
    tca40TailRb1: Object.freeze({ offset: 16860, type: "u32" }),
    tca40TailRc1: Object.freeze({ offset: 16864, type: "u32" }),
    tca40TailRd1: Object.freeze({ offset: 16868, type: "u32" }),
    tca40TailRe1: Object.freeze({ offset: 16872, type: "u32" }),
    tca40TailRf1: Object.freeze({ offset: 16876, type: "u32" }),
    tca40TailRg1: Object.freeze({ offset: 16880, type: "u32" }),
    tca40TailCosH1: Object.freeze({ offset: 16884, type: "u32" }),
    tca40TailSinH1: Object.freeze({ offset: 16888, type: "u32" }),
    tca40TailEntPx1: Object.freeze({ offset: 16892, type: "u32" }),
    tca40TailEntPy1: Object.freeze({ offset: 16896, type: "u32" }),
    tca40TailRa2: Object.freeze({ offset: 16900, type: "u32" }),
    tca40TailRb2: Object.freeze({ offset: 16904, type: "u32" }),
    tca40TailRc2: Object.freeze({ offset: 16908, type: "u32" }),
    tca40TailRd2: Object.freeze({ offset: 16912, type: "u32" }),
    tca40TailRe2: Object.freeze({ offset: 16916, type: "u32" }),
    tca40TailRf2: Object.freeze({ offset: 16920, type: "u32" }),
    tca40TailRg2: Object.freeze({ offset: 16924, type: "u32" }),
    tca40TailCosH2: Object.freeze({ offset: 16928, type: "u32" }),
    tca40TailSinH2: Object.freeze({ offset: 16932, type: "u32" }),
    tca40TailEntPx2: Object.freeze({ offset: 16936, type: "u32" }),
    tca40TailEntPy2: Object.freeze({ offset: 16940, type: "u32" }),
    tca40TailRa3: Object.freeze({ offset: 16944, type: "u32" }),
    tca40TailRb3: Object.freeze({ offset: 16948, type: "u32" }),
    tca40TailRc3: Object.freeze({ offset: 16952, type: "u32" }),
    tca40TailRd3: Object.freeze({ offset: 16956, type: "u32" }),
    tca40TailRe3: Object.freeze({ offset: 16960, type: "u32" }),
    tca40TailRf3: Object.freeze({ offset: 16964, type: "u32" }),
    tca40TailRg3: Object.freeze({ offset: 16968, type: "u32" }),
    tca40TailCosH3: Object.freeze({ offset: 16972, type: "u32" }),
    tca40TailSinH3: Object.freeze({ offset: 16976, type: "u32" }),
    tca40TailEntPx3: Object.freeze({ offset: 16980, type: "u32" }),
    tca40TailEntPy3: Object.freeze({ offset: 16984, type: "u32" }),
    tca40TailRa4: Object.freeze({ offset: 16988, type: "u32" }),
    tca40TailRb4: Object.freeze({ offset: 16992, type: "u32" }),
    tca40TailRc4: Object.freeze({ offset: 16996, type: "u32" }),
    tca40TailRd4: Object.freeze({ offset: 17000, type: "u32" }),
    tca40TailRe4: Object.freeze({ offset: 17004, type: "u32" }),
    tca40TailRf4: Object.freeze({ offset: 17008, type: "u32" }),
    tca40TailRg4: Object.freeze({ offset: 17012, type: "u32" }),
    tca40TailCosH4: Object.freeze({ offset: 17016, type: "u32" }),
    tca40TailSinH4: Object.freeze({ offset: 17020, type: "u32" }),
    tca40TailEntPx4: Object.freeze({ offset: 17024, type: "u32" }),
    tca40TailEntPy4: Object.freeze({ offset: 17028, type: "u32" }),
    tca40TailRa5: Object.freeze({ offset: 17032, type: "u32" }),
    tca40TailRb5: Object.freeze({ offset: 17036, type: "u32" }),
    tca40TailRc5: Object.freeze({ offset: 17040, type: "u32" }),
    tca40TailRd5: Object.freeze({ offset: 17044, type: "u32" }),
    tca40TailRe5: Object.freeze({ offset: 17048, type: "u32" }),
    tca40TailRf5: Object.freeze({ offset: 17052, type: "u32" }),
    tca40TailRg5: Object.freeze({ offset: 17056, type: "u32" }),
    tca40TailCosH5: Object.freeze({ offset: 17060, type: "u32" }),
    tca40TailSinH5: Object.freeze({ offset: 17064, type: "u32" }),
    tca40TailEntPx5: Object.freeze({ offset: 17068, type: "u32" }),
    tca40TailEntPy5: Object.freeze({ offset: 17072, type: "u32" }),
    tca40TailRa6: Object.freeze({ offset: 17076, type: "u32" }),
    tca40TailRb6: Object.freeze({ offset: 17080, type: "u32" }),
    tca40TailRc6: Object.freeze({ offset: 17084, type: "u32" }),
    tca40TailRd6: Object.freeze({ offset: 17088, type: "u32" }),
    tca40TailRe6: Object.freeze({ offset: 17092, type: "u32" }),
    tca40TailRf6: Object.freeze({ offset: 17096, type: "u32" }),
    tca40TailRg6: Object.freeze({ offset: 17100, type: "u32" }),
    tca40TailCosH6: Object.freeze({ offset: 17104, type: "u32" }),
    tca40TailSinH6: Object.freeze({ offset: 17108, type: "u32" }),
    tca40TailEntPx6: Object.freeze({ offset: 17112, type: "u32" }),
    tca40TailEntPy6: Object.freeze({ offset: 17116, type: "u32" }),
    tca40TailRa7: Object.freeze({ offset: 17120, type: "u32" }),
    tca40TailRb7: Object.freeze({ offset: 17124, type: "u32" }),
    tca40TailRc7: Object.freeze({ offset: 17128, type: "u32" }),
    tca40TailRd7: Object.freeze({ offset: 17132, type: "u32" }),
    tca40TailRe7: Object.freeze({ offset: 17136, type: "u32" }),
    tca40TailRf7: Object.freeze({ offset: 17140, type: "u32" }),
    tca40TailRg7: Object.freeze({ offset: 17144, type: "u32" }),
    tca40TailCosH7: Object.freeze({ offset: 17148, type: "u32" }),
    tca40TailSinH7: Object.freeze({ offset: 17152, type: "u32" }),
    tca40TailEntPx7: Object.freeze({ offset: 17156, type: "u32" }),
    tca40TailEntPy7: Object.freeze({ offset: 17160, type: "u32" }),
    tca83b0TailRa0: Object.freeze({ offset: 17188, type: "u32" }),
    tca83b0TailRb0: Object.freeze({ offset: 17192, type: "u32" }),
    tca83b0TailRc0: Object.freeze({ offset: 17196, type: "u32" }),
    tca83b0TailRd0: Object.freeze({ offset: 17200, type: "u32" }),
    tca83b0TailRe0: Object.freeze({ offset: 17204, type: "u32" }),
    tca83b0TailRf0: Object.freeze({ offset: 17208, type: "u32" }),
    tca83b0TailRg0: Object.freeze({ offset: 17212, type: "u32" }),
    tca83b0TailCosH0: Object.freeze({ offset: 17216, type: "u32" }),
    tca83b0TailSinH0: Object.freeze({ offset: 17220, type: "u32" }),
    tca83b0TailEntPx0: Object.freeze({ offset: 17224, type: "u32" }),
    tca83b0TailEntPy0: Object.freeze({ offset: 17228, type: "u32" }),
    tca83b0TailRa1: Object.freeze({ offset: 17232, type: "u32" }),
    tca83b0TailRb1: Object.freeze({ offset: 17236, type: "u32" }),
    tca83b0TailRc1: Object.freeze({ offset: 17240, type: "u32" }),
    tca83b0TailRd1: Object.freeze({ offset: 17244, type: "u32" }),
    tca83b0TailRe1: Object.freeze({ offset: 17248, type: "u32" }),
    tca83b0TailRf1: Object.freeze({ offset: 17252, type: "u32" }),
    tca83b0TailRg1: Object.freeze({ offset: 17256, type: "u32" }),
    tca83b0TailCosH1: Object.freeze({ offset: 17260, type: "u32" }),
    tca83b0TailSinH1: Object.freeze({ offset: 17264, type: "u32" }),
    tca83b0TailEntPx1: Object.freeze({ offset: 17268, type: "u32" }),
    tca83b0TailEntPy1: Object.freeze({ offset: 17272, type: "u32" }),
    tca83b0TailRa2: Object.freeze({ offset: 17276, type: "u32" }),
    tca83b0TailRb2: Object.freeze({ offset: 17280, type: "u32" }),
    tca83b0TailRc2: Object.freeze({ offset: 17284, type: "u32" }),
    tca83b0TailRd2: Object.freeze({ offset: 17288, type: "u32" }),
    tca83b0TailRe2: Object.freeze({ offset: 17292, type: "u32" }),
    tca83b0TailRf2: Object.freeze({ offset: 17296, type: "u32" }),
    tca83b0TailRg2: Object.freeze({ offset: 17300, type: "u32" }),
    tca83b0TailCosH2: Object.freeze({ offset: 17304, type: "u32" }),
    tca83b0TailSinH2: Object.freeze({ offset: 17308, type: "u32" }),
    tca83b0TailEntPx2: Object.freeze({ offset: 17312, type: "u32" }),
    tca83b0TailEntPy2: Object.freeze({ offset: 17316, type: "u32" }),
    tca83b0TailRa3: Object.freeze({ offset: 17320, type: "u32" }),
    tca83b0TailRb3: Object.freeze({ offset: 17324, type: "u32" }),
    tca83b0TailRc3: Object.freeze({ offset: 17328, type: "u32" }),
    tca83b0TailRd3: Object.freeze({ offset: 17332, type: "u32" }),
    tca83b0TailRe3: Object.freeze({ offset: 17336, type: "u32" }),
    tca83b0TailRf3: Object.freeze({ offset: 17340, type: "u32" }),
    tca83b0TailRg3: Object.freeze({ offset: 17344, type: "u32" }),
    tca83b0TailCosH3: Object.freeze({ offset: 17348, type: "u32" }),
    tca83b0TailSinH3: Object.freeze({ offset: 17352, type: "u32" }),
    tca83b0TailEntPx3: Object.freeze({ offset: 17356, type: "u32" }),
    tca83b0TailEntPy3: Object.freeze({ offset: 17360, type: "u32" }),
    tca83b0TailRa4: Object.freeze({ offset: 17364, type: "u32" }),
    tca83b0TailRb4: Object.freeze({ offset: 17368, type: "u32" }),
    tca83b0TailRc4: Object.freeze({ offset: 17372, type: "u32" }),
    tca83b0TailRd4: Object.freeze({ offset: 17376, type: "u32" }),
    tca83b0TailRe4: Object.freeze({ offset: 17380, type: "u32" }),
    tca83b0TailRf4: Object.freeze({ offset: 17384, type: "u32" }),
    tca83b0TailRg4: Object.freeze({ offset: 17388, type: "u32" }),
    tca83b0TailCosH4: Object.freeze({ offset: 17392, type: "u32" }),
    tca83b0TailSinH4: Object.freeze({ offset: 17396, type: "u32" }),
    tca83b0TailEntPx4: Object.freeze({ offset: 17400, type: "u32" }),
    tca83b0TailEntPy4: Object.freeze({ offset: 17404, type: "u32" }),
    tca83b0TailRa5: Object.freeze({ offset: 17408, type: "u32" }),
    tca83b0TailRb5: Object.freeze({ offset: 17412, type: "u32" }),
    tca83b0TailRc5: Object.freeze({ offset: 17416, type: "u32" }),
    tca83b0TailRd5: Object.freeze({ offset: 17420, type: "u32" }),
    tca83b0TailRe5: Object.freeze({ offset: 17424, type: "u32" }),
    tca83b0TailRf5: Object.freeze({ offset: 17428, type: "u32" }),
    tca83b0TailRg5: Object.freeze({ offset: 17432, type: "u32" }),
    tca83b0TailCosH5: Object.freeze({ offset: 17436, type: "u32" }),
    tca83b0TailSinH5: Object.freeze({ offset: 17440, type: "u32" }),
    tca83b0TailEntPx5: Object.freeze({ offset: 17444, type: "u32" }),
    tca83b0TailEntPy5: Object.freeze({ offset: 17448, type: "u32" }),
    tca83b0TailRa6: Object.freeze({ offset: 17452, type: "u32" }),
    tca83b0TailRb6: Object.freeze({ offset: 17456, type: "u32" }),
    tca83b0TailRc6: Object.freeze({ offset: 17460, type: "u32" }),
    tca83b0TailRd6: Object.freeze({ offset: 17464, type: "u32" }),
    tca83b0TailRe6: Object.freeze({ offset: 17468, type: "u32" }),
    tca83b0TailRf6: Object.freeze({ offset: 17472, type: "u32" }),
    tca83b0TailRg6: Object.freeze({ offset: 17476, type: "u32" }),
    tca83b0TailCosH6: Object.freeze({ offset: 17480, type: "u32" }),
    tca83b0TailSinH6: Object.freeze({ offset: 17484, type: "u32" }),
    tca83b0TailEntPx6: Object.freeze({ offset: 17488, type: "u32" }),
    tca83b0TailEntPy6: Object.freeze({ offset: 17492, type: "u32" }),
    tca83b0TailRa7: Object.freeze({ offset: 17496, type: "u32" }),
    tca83b0TailRb7: Object.freeze({ offset: 17500, type: "u32" }),
    tca83b0TailRc7: Object.freeze({ offset: 17504, type: "u32" }),
    tca83b0TailRd7: Object.freeze({ offset: 17508, type: "u32" }),
    tca83b0TailRe7: Object.freeze({ offset: 17512, type: "u32" }),
    tca83b0TailRf7: Object.freeze({ offset: 17516, type: "u32" }),
    tca83b0TailRg7: Object.freeze({ offset: 17520, type: "u32" }),
    tca83b0TailCosH7: Object.freeze({ offset: 17524, type: "u32" }),
    tca83b0TailSinH7: Object.freeze({ offset: 17528, type: "u32" }),
    tca83b0TailEntPx7: Object.freeze({ offset: 17532, type: "u32" }),
    tca83b0TailEntPy7: Object.freeze({ offset: 17536, type: "u32" }),
    tca83b0TailPackReady: Object.freeze({ offset: 17164, type: "u32" }),
    tca83b0TailIterCount: Object.freeze({ offset: 17168, type: "u32" }),
    tca83b0TailDoorF24: Object.freeze({ offset: 17172, type: "u32" }),
    tca83b0TailGameC: Object.freeze({ offset: 17176, type: "u32" }),
    tca83b0TailVec0Bits: Object.freeze({ offset: 17180, type: "u32" }),
    tca83b0TailVec1Bits: Object.freeze({ offset: 17184, type: "u32" }),
    /* ABI v96 (coordinator-merged C11 §1.1 gap fix): the record-12 LIVE
       seam capture lanes at the header offsets 11592..13736 (was missing
       from the layout — the wire read rt.rewind705ee0* directly). */
    rewind705ee0SlotIndex676ac: Object.freeze({ offset: 11592, type: "i32" }),
    rewind705ee0SlotValidByte: Object.freeze({ offset: 11596, type: "u32" }),
    rewind705ee0SlotRoom19d20: Object.freeze({ offset: 11600, type: "i32" }),
    rewind705ee0SlotTagE8: Object.freeze({ offset: 11604, type: "i32" }),
    rewind705ee0SlotArg1fe2c: Object.freeze({ offset: 11608, type: "i32" }),
    rewind705ee0SlotFrame1fe30: Object.freeze({ offset: 11612, type: "u32" }),
    rewind705ee0GameBase: Object.freeze({ offset: 11616, type: "u32" }),
    rewind705ee0GameTag0: Object.freeze({ offset: 11620, type: "i32" }),
    rewind705ee0GameFrame264f8: Object.freeze({ offset: 11624, type: "u32" }),
    rewind705ee0Game18318: Object.freeze({ offset: 11628, type: "u32" }),
    rewind705ee0PayloadBlobReady: Object.freeze({ offset: 11632, type: "u32" }),
    rewind705ee0PayloadBlobAddr: Object.freeze({ offset: 11636, type: "u32" }),
    rewind705ee0PayloadBlob: Object.freeze({ offset: 11640, type: "bytes", size: 2092 }),
    opaqueCall006fd7c0Ready: Object.freeze({ offset: 13732, type: "u32" }),
    /* ABI v96 (record idx 4 opaqueCall008318a0, coordinator-merged):
       SFX-manager store-plan globals + per-player entry pack. */
    opaque8318a0SfxGlobal798e4: Object.freeze({ offset: 13736, type: "u32" }),
    opaque8318a0SfxGlobal79948: Object.freeze({ offset: 13740, type: "u32" }),
    opaque8318a0SfxGlobal79790: Object.freeze({ offset: 13744, type: "u32" }),
    opaque8318a0SfxGlobal7978c: Object.freeze({ offset: 13748, type: "u32" }),
    opaque8318a0EngineField28: Object.freeze({ offset: 13752, type: "u32" }),
    opaque8318a0EngineByte7c: Object.freeze({ offset: 13756, type: "u32" }),
    opaque8318a0PlayerEntryReady: Object.freeze({ offset: 13760, type: "u32" }),
    opaque8318a0PlayerEntryCount: Object.freeze({ offset: 13764, type: "u32" }),
    opaque8318a0PlayerEntryB173: Object.freeze({ offset: 13768, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryB1398: Object.freeze({ offset: 13800, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryB139a: Object.freeze({ offset: 13832, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryB171: Object.freeze({ offset: 13864, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryW410: Object.freeze({ offset: 13896, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryW3fc: Object.freeze({ offset: 13928, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryPtr7c: Object.freeze({ offset: 13960, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryB34: Object.freeze({ offset: 13992, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryB88: Object.freeze({ offset: 14024, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryW1600: Object.freeze({ offset: 14056, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryW418: Object.freeze({ offset: 14088, type: "bytes", size: 32 }),
    opaque8318a0PlayerEntryW16c: Object.freeze({ offset: 14120, type: "bytes", size: 32 }),
    /* ABI v96 (record idx 10 opaqueCall004212c0, coordinator-merged):
       the true-probe interior SFX-manager blob. */
    frameOpaque4212c0TrueProbeReady: Object.freeze({ offset: 14152, type: "u32" }),
    frameOpaque4212c0TrueProbeMgrBase: Object.freeze({ offset: 14156, type: "u32" }),
    frameOpaque4212c0TrueProbeMgrF18: Object.freeze({ offset: 14160, type: "u32" }),
    frameOpaque4212c0TrueProbeMgrEbc: Object.freeze({ offset: 14164, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr14: Object.freeze({ offset: 14168, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr21618: Object.freeze({ offset: 14172, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr21620: Object.freeze({ offset: 14176, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr21624: Object.freeze({ offset: 14180, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr2161c: Object.freeze({ offset: 14184, type: "u32" }),
    frameOpaque4212c0TrueProbeMgr29fb8: Object.freeze({ offset: 14188, type: "u32" }),
    frameOpaque4212c0TrueProbeVolumeBits: Object.freeze({ offset: 14192, type: "u32" }),
    frameOpaque4212c0TrueProbeVolumeEqOne: Object.freeze({ offset: 14196, type: "u32" }),
    /* ABI v96 (record idx 9 state24ecc0x8ef990 TAIL-A, coordinator-
       merged): MP-slot pair + OPTIONAL seed. */
    state24ecc8ef990TailaSlotBegin: Object.freeze({ offset: 14200, type: "u32" }),
    state24ecc8ef990TailaSlotEnd: Object.freeze({ offset: 14204, type: "u32" }),
    state24ecc8ef990TailaSfxSeed: Object.freeze({ offset: 14208, type: "u32" }),
    /* ABI v96 (record idx 22 opaqueRoomTransitionEnginePrefix, W22-S2
       §lane-requests, coordinator-merged): the ANM2::Load pre-lane host
       half captures. loadgraphics_flags = 32 inline BYTES (u8x32 →
       32 B, cap ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS). */
    engineAnm2FilenameReady: Object.freeze({ offset: 14212, type: "u32" }),
    engineAnm2FilenamePtr: Object.freeze({ offset: 14216, type: "u32" }),
    engineAnm2FilenameSize: Object.freeze({ offset: 14220, type: "u32" }),
    engineAnm2FilenameCap: Object.freeze({ offset: 14224, type: "u32" }),
    engineAnm2AnimFirstPre: Object.freeze({ offset: 14228, type: "u32" }),
    engineAnm2AnimSecondPre: Object.freeze({ offset: 14232, type: "u32" }),
    engineAnm2AnimReady: Object.freeze({ offset: 14236, type: "u32" }),
    engineAnm2LoadgraphicsFlagReady: Object.freeze({ offset: 14240, type: "u32" }),
    engineAnm2LoadgraphicsFlags: Object.freeze({ offset: 14244, type: "bytes", size: 32 }),
    /* ABI v102 (record idx 0 walker live wiring, wave update-v102-record0-
       wire; PLAN update-v102-abi97-plan — offsets pinned by the wave-26
       merge): the 0x84cc40 walker's committed capture lanes (the v100 §6
       FINALIZED requests). player_a = the swap-OUT ptr (arg1 pushes
       0x9bef22/0x9bf3cc); player_b = the swap-IN ptr (arg2 pushes
       0x9bef09/0x9bf3cb; partner exchange 0x9bef03..0x9bef16/0x9bf3bb);
       b_frame328 = the exact [B+0x328] deref the walker-site split reads
       (PE 0x84ccc8); probe1_arg = the [Game+0x18300] ROOM ptr word (PE
       0x84d188; seam twin 0x84cb47, PM swap twin 0x9bf31f). */
    hudStatWalkerPlayerA: Object.freeze({ offset: 14276, type: "u32" }),
    hudStatWalkerPlayerB: Object.freeze({ offset: 14280, type: "u32" }),
    hudStatWalkerBFrame328: Object.freeze({ offset: 14284, type: "u32" }),
    hudStatWalkProbe1Arg: Object.freeze({ offset: 14288, type: "u32" }),
    /* ABI v104 (record idx 12 transition-pack REAL wiring; PLAN
       update-v102-record12-tran §5 — offsets pinned by the wave-27 merge):
       the 9-lane transition pack @14292..14328 (all u32; byte-gated lanes
       are re-narrowed & 0xff in the laws). game0 = [Game+0x0] word (PE
       0x6fd87f); altPathProbe/routeProbe/playerLoopProbe/blueRoomProbe/
       enginePredProbe = captured ALs of 0x74bac0 / 0x6f8120 / 0x8279a0 /
       0x74d4a0 / 0x6f0070; roomType8 = [[Game+0x18300]+8]; subroomFlag44 =
       low byte [[[Game+0x18300]+4]+0x44]; ready = the pack voucher (mirror
       of opaqueCall006fd7c0Ready @13732) — the K-block arms go live only
       when ready AND opaqueCall006fd7c0Ready are set; ready=0 keeps the
       pre-v104 residual byte-for-byte. */
    transition6fd7c0Game0: Object.freeze({ offset: 14292, type: "u32" }),
    transition6fd7c0AltPathProbe: Object.freeze({ offset: 14296, type: "u32" }),
    transition6fd7c0RouteProbe: Object.freeze({ offset: 14300, type: "u32" }),
    transition6fd7c0PlayerLoopProbe: Object.freeze({ offset: 14304, type: "u32" }),
    transition6fd7c0RoomType8: Object.freeze({ offset: 14308, type: "u32" }),
    transition6fd7c0RoomSubroomFlag44: Object.freeze({ offset: 14312, type: "u32" }),
    transition6fd7c0BlueRoomProbe: Object.freeze({ offset: 14316, type: "u32" }),
    transition6fd7c0EnginePredProbe: Object.freeze({ offset: 14320, type: "u32" }),
    transition6fd7c0Ready: Object.freeze({ offset: 14324, type: "u32" }),
    /* ABI v99 (wave-28 entity-surface capture REBIND, idx 5/32; the v95
       provisional rows @8040..8396 were REMOVED — they collided with the
       committed b3b7 lanes). ready = the pack VOUCHER (FULL-DWORD gate);
       the 8 x 44 B blobs hold the per-matched-MP-entry surface the accept
       virtuals 0xa5f260/0xa23970 read (IsaacGameUpdateSliceEntitySurface-
       Capture pack(1): vtable_class_bits/impl_ptr/impl_b0/impl_8/impl_c/
       impl_20/impl_20_10/netman_2b4/global_c73680/global_c73694/
       global_c5ac00); slot i = the i-th matched entry (machine order, cap
       8); the model emit + cpp mirror publish the accept-pure proof only
       when ready != 0 (ready=0 keeps the pre-pack walk surface). Flat
       per-field lanes, cf. hudStatPlayer{i}. */
    frameOpaque98dba0EntitySurfaceReady:
      Object.freeze({ offset: 14328, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0VtableClassBits:
      Object.freeze({ offset: 14332, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0ImplPtr:
      Object.freeze({ offset: 14336, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0ImplB0:
      Object.freeze({ offset: 14340, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0Impl8:
      Object.freeze({ offset: 14344, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0ImplC:
      Object.freeze({ offset: 14348, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0Impl20:
      Object.freeze({ offset: 14352, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0Impl2010:
      Object.freeze({ offset: 14356, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0Netman2b4:
      Object.freeze({ offset: 14360, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0GlobalC73680:
      Object.freeze({ offset: 14364, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0GlobalC73694:
      Object.freeze({ offset: 14368, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture0GlobalC5ac00:
      Object.freeze({ offset: 14372, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1VtableClassBits:
      Object.freeze({ offset: 14376, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1ImplPtr:
      Object.freeze({ offset: 14380, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1ImplB0:
      Object.freeze({ offset: 14384, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1Impl8:
      Object.freeze({ offset: 14388, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1ImplC:
      Object.freeze({ offset: 14392, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1Impl20:
      Object.freeze({ offset: 14396, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1Impl2010:
      Object.freeze({ offset: 14400, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1Netman2b4:
      Object.freeze({ offset: 14404, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1GlobalC73680:
      Object.freeze({ offset: 14408, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1GlobalC73694:
      Object.freeze({ offset: 14412, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture1GlobalC5ac00:
      Object.freeze({ offset: 14416, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2VtableClassBits:
      Object.freeze({ offset: 14420, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2ImplPtr:
      Object.freeze({ offset: 14424, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2ImplB0:
      Object.freeze({ offset: 14428, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2Impl8:
      Object.freeze({ offset: 14432, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2ImplC:
      Object.freeze({ offset: 14436, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2Impl20:
      Object.freeze({ offset: 14440, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2Impl2010:
      Object.freeze({ offset: 14444, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2Netman2b4:
      Object.freeze({ offset: 14448, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2GlobalC73680:
      Object.freeze({ offset: 14452, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2GlobalC73694:
      Object.freeze({ offset: 14456, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture2GlobalC5ac00:
      Object.freeze({ offset: 14460, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3VtableClassBits:
      Object.freeze({ offset: 14464, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3ImplPtr:
      Object.freeze({ offset: 14468, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3ImplB0:
      Object.freeze({ offset: 14472, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3Impl8:
      Object.freeze({ offset: 14476, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3ImplC:
      Object.freeze({ offset: 14480, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3Impl20:
      Object.freeze({ offset: 14484, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3Impl2010:
      Object.freeze({ offset: 14488, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3Netman2b4:
      Object.freeze({ offset: 14492, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3GlobalC73680:
      Object.freeze({ offset: 14496, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3GlobalC73694:
      Object.freeze({ offset: 14500, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture3GlobalC5ac00:
      Object.freeze({ offset: 14504, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4VtableClassBits:
      Object.freeze({ offset: 14508, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4ImplPtr:
      Object.freeze({ offset: 14512, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4ImplB0:
      Object.freeze({ offset: 14516, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4Impl8:
      Object.freeze({ offset: 14520, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4ImplC:
      Object.freeze({ offset: 14524, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4Impl20:
      Object.freeze({ offset: 14528, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4Impl2010:
      Object.freeze({ offset: 14532, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4Netman2b4:
      Object.freeze({ offset: 14536, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4GlobalC73680:
      Object.freeze({ offset: 14540, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4GlobalC73694:
      Object.freeze({ offset: 14544, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture4GlobalC5ac00:
      Object.freeze({ offset: 14548, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5VtableClassBits:
      Object.freeze({ offset: 14552, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5ImplPtr:
      Object.freeze({ offset: 14556, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5ImplB0:
      Object.freeze({ offset: 14560, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5Impl8:
      Object.freeze({ offset: 14564, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5ImplC:
      Object.freeze({ offset: 14568, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5Impl20:
      Object.freeze({ offset: 14572, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5Impl2010:
      Object.freeze({ offset: 14576, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5Netman2b4:
      Object.freeze({ offset: 14580, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5GlobalC73680:
      Object.freeze({ offset: 14584, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5GlobalC73694:
      Object.freeze({ offset: 14588, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture5GlobalC5ac00:
      Object.freeze({ offset: 14592, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6VtableClassBits:
      Object.freeze({ offset: 14596, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6ImplPtr:
      Object.freeze({ offset: 14600, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6ImplB0:
      Object.freeze({ offset: 14604, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6Impl8:
      Object.freeze({ offset: 14608, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6ImplC:
      Object.freeze({ offset: 14612, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6Impl20:
      Object.freeze({ offset: 14616, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6Impl2010:
      Object.freeze({ offset: 14620, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6Netman2b4:
      Object.freeze({ offset: 14624, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6GlobalC73680:
      Object.freeze({ offset: 14628, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6GlobalC73694:
      Object.freeze({ offset: 14632, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture6GlobalC5ac00:
      Object.freeze({ offset: 14636, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7VtableClassBits:
      Object.freeze({ offset: 14640, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7ImplPtr:
      Object.freeze({ offset: 14644, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7ImplB0:
      Object.freeze({ offset: 14648, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7Impl8:
      Object.freeze({ offset: 14652, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7ImplC:
      Object.freeze({ offset: 14656, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7Impl20:
      Object.freeze({ offset: 14660, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7Impl2010:
      Object.freeze({ offset: 14664, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7Netman2b4:
      Object.freeze({ offset: 14668, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7GlobalC73680:
      Object.freeze({ offset: 14672, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7GlobalC73694:
      Object.freeze({ offset: 14676, type: "u32" }),
    frameOpaque98dba0EntitySurfaceCapture7GlobalC5ac00:
      Object.freeze({ offset: 14680, type: "u32" }),
});
export const EVENTS_LAYOUT = Object.freeze({
    transitionCompleted: Object.freeze({ offset: 0, type: "u32" }),
    transitionMode: Object.freeze({ offset: 4, type: "u32" }),
    hudPostUpdateCalls: Object.freeze({ offset: 8, type: "u32" }),
    dispatchKind: Object.freeze({ offset: 12, type: "i32" }),
    queuedScreenId: Object.freeze({ offset: 16, type: "i32" }),
    fadeArgb: Object.freeze({ offset: 20, type: "u32" }),
    payloadCopyRequired: Object.freeze({ offset: 24, type: "u32" }),
    clearTransitionGate: Object.freeze({ offset: 28, type: "u32" }),
    earlyReturnAfterHud: Object.freeze({ offset: 32, type: "u32" }),
    continuationKind: Object.freeze({ offset: 36, type: "i32" }),
    opaqueCall0092e300: Object.freeze({ offset: 40, type: "u32" }),
    opaqueGlobal4aba0Refresh: Object.freeze({ offset: 44, type: "u32" }),
    opaqueCall009b6840: Object.freeze({ offset: 48, type: "u32" }),
    opaqueCall00857450: Object.freeze({ offset: 52, type: "u32" }),
    opaqueCall0092f1c0: Object.freeze({ offset: 56, type: "u32" }),
    opaqueCall008318a0: Object.freeze({ offset: 60, type: "u32" }),
    opaqueCall0098dba0PlayerWalk: Object.freeze({ offset: 64, type: "u32" }),
    genericPromptUpdateCalls: Object.freeze({ offset: 68, type: "u32" }),
    itemOverlayUpdateCalls: Object.freeze({ offset: 72, type: "u32" }),
    opaqueCall00746560: Object.freeze({ offset: 76, type: "u32" }),
    opaqueCall009bea10: Object.freeze({ offset: 80, type: "u32" }),
    opaqueCall0040c7f0: Object.freeze({ offset: 84, type: "u32" }),
    opaqueCall009b7680: Object.freeze({ offset: 88, type: "u32" }),
    menuAuxListClear: Object.freeze({ offset: 92, type: "u32" }),
    opaqueCall008ef990: Object.freeze({ offset: 96, type: "u32" }),
    opaqueCall004212c0: Object.freeze({ offset: 100, type: "u32" }),
    opaqueCall006fdc10: Object.freeze({ offset: 104, type: "u32" }),
    opaqueCall006fd7c0Mode4Sfx: Object.freeze({ offset: 108, type: "u32" }),
    opaqueFrameEffect6fd7c0Shell: Object.freeze({ offset: 112, type: "u32" }),
    opaqueRoomTransitionEnginePrefix: Object.freeze({ offset: 116, type: "u32" }),
    opaqueRoomTransitionEngineBody: Object.freeze({ offset: 120, type: "u32" }),
    roomTransitionIndex: Object.freeze({ offset: 124, type: "u32" }),
    roomTransitionDimension: Object.freeze({ offset: 128, type: "u32" }),
    engineSiteAnim: Object.freeze({ offset: 132, type: "u32" }),
    opaqueRoomUpdatePrefixB1: Object.freeze({ offset: 136, type: "u32" }),
    opaqueRoomUpdatePrefixB2: Object.freeze({ offset: 140, type: "u32" }),
    opaqueRoomUpdatePrefixB3B7: Object.freeze({ offset: 144, type: "u32" }),
    opaqueRoomUpdatePrefixB8: Object.freeze({ offset: 148, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11: Object.freeze({ offset: 152, type: "u32" }),
    roomTriggerOutput: Object.freeze({ offset: 156, type: "u32" }),
    opaqueRoomUpdateClearPath: Object.freeze({ offset: 160, type: "u32" }),
    opaqueRoomUpdateClearDoorSlots: Object.freeze({ offset: 164, type: "u32" }),
    roomTriggerClearStats: Object.freeze({ offset: 168, type: "u32" }),
    roomTriggerClearAudioNonGreed: Object.freeze({ offset: 172, type: "u32" }),
    roomTriggerClearAudio: Object.freeze({ offset: 176, type: "u32" }),
    roomTriggerClearAwardsNonGreed: Object.freeze({ offset: 180, type: "u32" }),
    roomTriggerClearAwardsBit7: Object.freeze({ offset: 184, type: "u32" }),
    roomTriggerClearAwardsGreed: Object.freeze({ offset: 188, type: "u32" }),
    roomTriggerClearAwardsTail: Object.freeze({ offset: 192, type: "u32" }),
    opaqueRoomUpdateClearDoors: Object.freeze({ offset: 196, type: "u32" }),
    opaqueRoomUpdateAmbient: Object.freeze({ offset: 200, type: "u32" }),
    opaqueRoomUpdateTailRain: Object.freeze({ offset: 204, type: "u32" }),
    opaqueRoomUpdateTailWaterB16: Object.freeze({ offset: 208, type: "u32" }),
    opaqueRoomUpdateTailMid: Object.freeze({ offset: 212, type: "u32" }),
    opaqueRoomUpdateTailMid706cExpire: Object.freeze({ offset: 216, type: "u32" }),
    opaqueRoomUpdateTailMidRestock: Object.freeze({ offset: 220, type: "u32" }),
    opaqueRoomUpdateTailMid7230Spawn: Object.freeze({ offset: 224, type: "u32" }),
    opaqueRoomUpdateTailEntity: Object.freeze({ offset: 228, type: "u32" }),
    opaqueRoomUpdateTailPath: Object.freeze({ offset: 232, type: "u32" }),
    playerManagerUpdateDeath: Object.freeze({ offset: 236, type: "u32" }),
    playerManagerUpdateHeartbeat: Object.freeze({ offset: 240, type: "u32" }),
    opaqueCall004257b0PassA: Object.freeze({ offset: 244, type: "u32" }),
    opaqueCall004257b0PassB: Object.freeze({ offset: 248, type: "u32" }),
    opaqueCall008607a0: Object.freeze({ offset: 252, type: "u32" }),
    listUpdate6772c: Object.freeze({ offset: 256, type: "u32" }),
    opaqueCall0098dba0Timer: Object.freeze({ offset: 260, type: "u32" }),
    hudMessageTextOut: Object.freeze({ offset: 264, type: "u32" }),
    frameOpaque98dba0Site: Object.freeze({ offset: 268, type: "u32" }),
    opaqueRoomUpdateAmbient8024f0: Object.freeze({ offset: 272, type: "u32" }),
    opaqueRoomUpdateAmbient7f01c0: Object.freeze({ offset: 276, type: "u32" }),
    opaqueRoomUpdateAmbientStageSpawn: Object.freeze({ offset: 280, type: "u32" }),
    opaqueRoomUpdateAmbientModeSfx: Object.freeze({ offset: 284, type: "u32" }),
    opaqueRoomUpdateAmbient824800Spawn: Object.freeze({ offset: 288, type: "u32" }),
    opaqueRoomUpdateAmbient824a70: Object.freeze({ offset: 292, type: "u32" }),
    opaqueRoomUpdateAmbient24ee0: Object.freeze({ offset: 296, type: "u32" }),
    opaqueRoomUpdateAmbient74e9b0: Object.freeze({ offset: 300, type: "u32" }),
    opaqueRoomUpdateAmbientSpecial1023: Object.freeze({ offset: 304, type: "u32" }),
    playerHudUpdateHearts: Object.freeze({ offset: 308, type: "u32" }),
    playerHudGfxResidual: Object.freeze({ offset: 312, type: "u32" }),
    playerHudDirtyNotify: Object.freeze({ offset: 316, type: "u32" }),
    hudHistoryResidual: Object.freeze({ offset: 320, type: "u32" }),
    hudStatResidual: Object.freeze({ offset: 324, type: "u32" }),
    playerManagerUpdateHeartbeatSfxUpdate: Object.freeze({ offset: 328, type: "u32" }),
    playerManagerUpdateHeartbeatSfxPlay: Object.freeze({ offset: 332, type: "u32" }),
    playerManagerUpdateHeartbeatSfxStop: Object.freeze({ offset: 336, type: "u32" }),
    opaqueRoomUpdatePrefixB1Sfx: Object.freeze({ offset: 340, type: "u32" }),
    opaqueRoomUpdatePrefixB1Spawn: Object.freeze({ offset: 344, type: "u32" }),
    ambient824a70LoopCount: Object.freeze({ offset: 348, type: "u32" }),
    opaqueRoomUpdateAmbient824a70Genrand: Object.freeze({ offset: 352, type: "u32" }),
    opaqueRoomUpdateAmbient824a70Create: Object.freeze({ offset: 356, type: "u32" }),
    listUpdate6772cFree: Object.freeze({ offset: 360, type: "u32" }),
    menuAuxNodeFree: Object.freeze({ offset: 364, type: "u32" }),
    menuAuxPayloadFree: Object.freeze({ offset: 368, type: "u32" }),
    ambient824a70GenrandSamples: Object.freeze({ offset: 372, type: "u32" }),
    rankDisplayCalls: Object.freeze({ offset: 376, type: "u32" }),
    rankDisplayStateUpd: Object.freeze({ offset: 380, type: "u32" }),
    rankDisplayPlayMask: Object.freeze({ offset: 384, type: "u32" }),
    rankDisplayIsPlaying: Object.freeze({ offset: 388, type: "u32" }),
    opaqueCall009a2b30: Object.freeze({ offset: 392, type: "u32" }),
    hostFun746560Site: Object.freeze({ offset: 396, type: "u32" }),
    hostFun746560Param: Object.freeze({ offset: 400, type: "u32" }),
    hostFun746560Byte216e9: Object.freeze({ offset: 404, type: "u32" }),
    hostFun746560DeathmatchSuffix: Object.freeze({ offset: 408, type: "u32" }),
    frameOpaque98dba0TimerPlanApplied: Object.freeze({ offset: 412, type: "u32" }),
    frameOpaque98dba0TimerMtAdvanced: Object.freeze({ offset: 416, type: "u32" }),
    frameOpaque98dba0TimerAfter: Object.freeze({ offset: 420, type: "u32" }),
    frameOpaque98dba0TimerThetaBits: Object.freeze({ offset: 424, type: "u32" }),
    frameOpaque98dba0TimerXBits: Object.freeze({ offset: 428, type: "u32" }),
    frameOpaque98dba0TimerYBits: Object.freeze({ offset: 432, type: "u32" }),
    frameOpaque4257b0PassAApplied: Object.freeze({ offset: 436, type: "u32" }),
    frameOpaque4257b0PassBApplied: Object.freeze({ offset: 440, type: "u32" }),
    frameOpaque4257b0Inserted: Object.freeze({ offset: 448, type: "u32" }),
    frameOpaque4257b0PostCount: Object.freeze({ offset: 452, type: "u32" }),
    frameOpaque4257b0PassBStores: Object.freeze({ offset: 456, type: "u32" }),
    frameOpaque4257b0ListGrow: Object.freeze({ offset: 460, type: "u32" }),
    frameOpaque98dba0TimerMtIndexOut: Object.freeze({ offset: 464, type: "i32" }),
    engineAnm2LaneApplied: Object.freeze({ offset: 468, type: "u32" }),
    engineAnm2StarLayerMask: Object.freeze({ offset: 472, type: "u32" }),
    hudHistoryLoopResidual: Object.freeze({ offset: 476, type: "u32" }),
    opaque0092f1c0CounterOut: Object.freeze({ offset: 480, type: "u32" }),
    opaque0092e300Slot3c: Object.freeze({ offset: 484, type: "u32" }),
    soundGroupWalkStores: Object.freeze({ offset: 488, type: "u32" }),
    soundGroupWalkPendingMask: Object.freeze({ offset: 492, type: "u32" }),
    soundGroupWalkApplied: Object.freeze({ offset: 496, type: "u32" }),
    frameOpaque98dba0WalkEmptySkip: Object.freeze({ offset: 500, type: "u32" }),
    state24ecc8ef990JoinPure: Object.freeze({ offset: 504, type: "u32" }),
    frameOpaque4212c0Add0LogNeeded: Object.freeze({ offset: 508, type: "u32" }),
    opaqueCall008607a0ArgsRegistryIndex: Object.freeze({ offset: 512, type: "u32" }),
    opaqueCall008607a0ArgsNargs: Object.freeze({ offset: 516, type: "u32" }),
    opaqueCall008607a0ArgsNresults: Object.freeze({ offset: 520, type: "u32" }),
    opaqueCall008607a0ArgsPcallkContext: Object.freeze({ offset: 524, type: "u32" }),
    opaqueCall008607a0ArgsArg1: Object.freeze({ offset: 528, type: "u32" }),
    opaqueCall008607a0ArgsArg2: Object.freeze({ offset: 532, type: "u32" }),
    ambient824a70CreateTyped: Object.freeze({ offset: 544, type: "u32" }),
    type5DoorOpenCalls: Object.freeze({ offset: 616, type: "u32" }),
    b3b7HostFco: Object.freeze({ offset: 668, type: "u32" }),
    b3b7HostChallenge: Object.freeze({ offset: 672, type: "u32" }),
    b3b7HostTeCall: Object.freeze({ offset: 676, type: "u32" }),
    b4HostLookup: Object.freeze({ offset: 680, type: "u32" }),
    b4HostPosA: Object.freeze({ offset: 684, type: "u32" }),
    b4HostPosFinish: Object.freeze({ offset: 688, type: "u32" }),
    b4GenrandDraws: Object.freeze({ offset: 692, type: "u32" }),
    b4HostSpawns: Object.freeze({ offset: 696, type: "u32" }),
    b4HostCleanup: Object.freeze({ offset: 700, type: "u32" }),
    b4SeedFatal: Object.freeze({ offset: 704, type: "u32" }),
    b5HostCount708250: Object.freeze({ offset: 708, type: "u32" }),
    b5HostVcall48: Object.freeze({ offset: 712, type: "u32" }),
    b5HostGrow: Object.freeze({ offset: 716, type: "u32" }),
    b5HostVcall4c: Object.freeze({ offset: 720, type: "u32" }),
    b5SeedFatal: Object.freeze({ offset: 724, type: "u32" }),
    b6HostDestroy: Object.freeze({ offset: 728, type: "u32" }),
    b6HostIterate: Object.freeze({ offset: 732, type: "u32" }),
    b6HostClear: Object.freeze({ offset: 736, type: "u32" }),
    b7HostUpdate: Object.freeze({ offset: 740, type: "u32" }),
    frameEffect6fd7c0Mode4SfxPlayTyped: Object.freeze({ offset: 664, type: "u32" }),
    /* ABI v96 (record idx 12 opaqueCall006fd7c0): typed events of the
       705ee0 write-block DECISION seam. Filled ONLY when the v74 rewind
       capture lane frameEffectRewindReady != 0 AND the shell canopy gate
       opens AND the frozen -1 reaches the write block (writeReachedNeg1).
       The nine-store site mask resolves in-module (gameUpdateSlice705ee0StoreMask);
       the SaveState leaf 0x6f9000 fires with receiver Game + arg newslot+4
       (gameUpdateSlice705ee0SaveStateArgPrep). The coarse
       opaqueFrameEffect6fd7c0Shell counter STAYS. ready=0 never sets them
       (the seam is inert until the coordinator merges the
       rewind_705ee0_slot_* capture lanes). Offsets fixed by the
       coordinator merge (intended 912/916 next-free after the landed
       tail 908). */
    rewind705ee0Stores: Object.freeze({ offset: 912, type: "u32" }),
    rewind705ee0SaveState: Object.freeze({ offset: 916, type: "u32" }),
    /* ABI v96 (record idx 0 tween seam, coordinator-merged): typed host
       events telling the host consumer the three probe BODIES ran at the
       RecomputeStats k6/k7 seam (0x84cb39 test bl,0xc0 gate — exactly
       (mask & 0xc0) != 0). 1 per k6/k7-arm entry, all three together:
       hudStatWalkProbe1 = the 0x7f92b0 leaf (f32 clamp source, x87 ST0);
       hudStatWalkProbe2 = the 0x749830 leaf (BOOL in AL; low-byte gate);
       hudStatWalkProbe3 = the 0x7f96f0 leaf (f32 in XMM0; k6/k7
       complement). The probe RESULTS are the runtime blob scalars
       @4644/4648/4652 consumed by the k6/k7 block; the events mirror the
       cpp wire (hud_stat_walk_probe1/2/3, +1 in the same block). Offsets
       920/924/928 = next-free after the record-12 tail @916. */
    hudStatWalkProbe1: Object.freeze({ offset: 920, type: "u32" }),
    hudStatWalkProbe2: Object.freeze({ offset: 924, type: "u32" }),
    hudStatWalkProbe3: Object.freeze({ offset: 928, type: "u32" }),
    /* ABI v96 (coordinator-merged tail): record-4 SFX-manager store plan
       + record-10 true-probe interior + record-0 fatal-empty (932/936/
       940) then the record-22 ANM2::Load pre-lane host trio (944/948/
       952, W22-S2 §lane-requests). All stay 0 until the ABI-96 capture
       lanes activate their seams. */
    opaque008318a0SfxManagerStores: Object.freeze({ offset: 932, type: "u32" }),
    frameOpaque4212c0TrueProbeInterior: Object.freeze({ offset: 936, type: "u32" }),
    hudStatWalkFatalEmpty: Object.freeze({ offset: 940, type: "u32" }),
    engineAnm2PrefixFilenameAssign: Object.freeze({ offset: 944, type: "u32" }),
    engineAnm2PrefixCacheFetch: Object.freeze({ offset: 948, type: "u32" }),
    engineAnm2PrefixLoadImage: Object.freeze({ offset: 952, type: "u32" }),
    /* ABI v102 (record idx 0 walker live wiring; PLAN update-v102-abi97-
       plan — offsets pinned by the wave-26 merge): typed walker probe
       events, twins of the seam trio @920/924/928 (the walker's probe
       calls are NOT counted by the seam counters). probe1 = reached (+1
       per walker k6/k7-arm entry), probe2 = the swap-gate row-arm value
       (1/2/0 from the live A/B lanes), probe3 = the walker-site k6
       target bits. Fired only when the walker capture is live
       (player_a|player_b != 0); lanes all-zero keeps the residual
       byte-for-byte. */
    hudStatWalkerProbe1: Object.freeze({ offset: 956, type: "u32" }),
    hudStatWalkerProbe2: Object.freeze({ offset: 960, type: "u32" }),
    hudStatWalkerProbe3: Object.freeze({ offset: 964, type: "u32" }),
    /* ABI v104 (record idx 12 transition-pack wiring; PLAN §5 — offsets
       pinned by the wave-27 merge): typed events of the capture-decidable
       arms — +1 each when the arm fires with the pack LIVE (Ready @14324
       AND opaqueCall006fd7c0Ready @13732): stageTransition = the anim-0xc
       special routes NESTED (0x6fdc10 @0x6fd8ca); playerLoop = the 0x8279a0
       gate opens (player-loop arm 0x6fd92a); roomDispatch = the anim-3
       dispatch runs 0x425ac0 @0x6fdb1d. Either voucher 0 keeps the
       pre-v104 residual byte-for-byte. */
    frameEffect6fd7c0StageTransition: Object.freeze({ offset: 968, type: "u32" }),
    frameEffect6fd7c0PlayerLoop: Object.freeze({ offset: 972, type: "u32" }),
    frameEffect6fd7c0RoomDispatch: Object.freeze({ offset: 976, type: "u32" }),
    /* ABI v99 (wave-28 entity-surface REBIND, idx 5/32): the accept-pure
       proof event — 1 when a captured matched entry is PURE (class known +
       blob complete) and frameOpaque98dba0EntitySurfaceReady != 0; ready=0
       publishes nothing (the v95 provisional @640 was removed — it collided
       with the committed tcsStats region). Offset fixed by the wave-28
       merge (980, next-free after 976). */
    frameOpaque98dba0EntitySurfaceAcceptPure:
      Object.freeze({ offset: 980, type: "u32" }),
    /* ABI v107 (wave-29 merge, record idx 39 mid-restock 0x00805408): the
       typed-event DROP proof — 1 when the seed==0 fatal dropped the
       restock body (FULL-DWORD seed==0, PE 0x007e9028/0x007e9033).
       Offset fixed by the wave-29 merge (984, next-free after 980). */
    /* ABI v115 (update-v115-clearpath-removal, record idx 23): the
       clear-path flag-store typed carrier — 1 per gate-open tick (PE
       0x00804235..0x0080424b single masked store). Offset fixed by the
       v115 merge (988, next-free after 984). */
    /* ABI v119 (update-v119-door-removal, record idx 33): the type-5
       FORCED-arm carrier — 1 per tick when the clear-path door residual
       ran (idx-24 mask != 0) and the merge law forces the type-5 host
       re-run over POST-clear door states. Offset 992, next-free after
       988; events 992 -> 996. */
    type5DoorForcedRerun: Object.freeze({ offset: 992, type: "u32" }),
    /* ABI v126 (update-v126-7230-spawn-removal): the idx-40 coarse
       retirement carrier — fires iff the retired edge armed (gate open:
       Room+0x7230 pre > 0 SIGNED && pre % 5 == 0 SIGNED idiv), same tick,
       same order position. */
    tailMid7230SpawnArmed: Object.freeze({ offset: 996, type: "u32" }),
    /* ABI v127 (update-v127-706c-restock-removal): the idx-38 shop-restock
       residual typed events (ADDENDUM-3 F3 event set) @1000..1020. */
    shopRestockWarn: Object.freeze({ offset: 1000, type: "u32" }),
    shopRestockCreate1: Object.freeze({ offset: 1004, type: "u32" }),
    shopRestockCreate2: Object.freeze({ offset: 1008, type: "u32" }),
    shopRestockSeedZeroDrop: Object.freeze({ offset: 1012, type: "u32" }),
    shopRestockCopyBackReady: Object.freeze({ offset: 1016, type: "u32" }),
    /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45 §4): the
       update-lane residual typed events @1020..1052. */
    sfxUpdBusyApplied: Object.freeze({ offset: 1020, type: "u32" }),
    sfxUpdWalkCount: Object.freeze({ offset: 1024, type: "u32" }),
    sfxUpdPendingMask: Object.freeze({ offset: 1028, type: "u32" }),
    sfxUpdNoSamplesWarn: Object.freeze({ offset: 1032, type: "u32" }),
    sfxVolSetGroupMem: Object.freeze({ offset: 1036, type: "u32" }),
    sfxVolSetVoice: Object.freeze({ offset: 1040, type: "u32" }),
    sfxDevVolumeCalls: Object.freeze({ offset: 1044, type: "u32" }),
    sfxPitchSetVoice: Object.freeze({ offset: 1048, type: "u32" }),
    sfxDevPitchCalls: Object.freeze({ offset: 1052, type: "u32" }),
    /* ABI v131 (update-v131-greed-probe-pack, record idx 30): the
       in-module probe band + fire plan carriers. */
    roomTriggerClearAwardsGreedProbe9bf990: Object.freeze({ offset: 1056, type: "u32" }),
    roomTriggerClearAwardsGreedProbe9bfa00: Object.freeze({ offset: 1060, type: "u32" }),
    roomTriggerClearAwardsGreedProbe9bfa70: Object.freeze({ offset: 1064, type: "u32" }),
    roomTriggerClearAwardsGreedFireCount: Object.freeze({ offset: 1068, type: "u32" }),
    roomTriggerClearAwardsGreedFireMask: Object.freeze({ offset: 1072, type: "u32" }),
    /* ABI v132 (update-v132-b16-spawn-pack, record idx 36): the
       enumeration echo carriers @1076..1096 (contracts-b16-spawn §4). */
    waterB16SpawnRowsApplied: Object.freeze({ offset: 1076, type: "u32" }),
    waterB16WaterHitCount: Object.freeze({ offset: 1080, type: "u32" }),
    waterB16LavaHitCount: Object.freeze({ offset: 1084, type: "u32" }),
    waterB16WalkArmMask: Object.freeze({ offset: 1088, type: "u32" }),
    waterB16CastCount: Object.freeze({ offset: 1092, type: "u32" }),
    waterB16LeafCallCount: Object.freeze({ offset: 1096, type: "u32" }),
    /* ABI v133 (update-v133-audio-music-pack, records idx26/27): the
       typed spawn-tail carriers @1100..1104. */
    roomTriggerClearAudioNonGreedTailSpawns: Object.freeze({ offset: 1100, type: "u32" }),
    roomTriggerClearAudioMusicPathTailSpawns: Object.freeze({ offset: 1104, type: "u32" }),
    /* ABI v134 (update-v134-awards-head-pack, records idx28/29): the
       head-plan Out carriers @1108..1136 (contracts-awards §2c). */
    roomAwardsHeadExitKind: Object.freeze({ offset: 1108, type: "u32" }),
    roomAwardsHeadSfxArm: Object.freeze({ offset: 1112, type: "u32" }),
    roomAwardsHeadByte6D: Object.freeze({ offset: 1116, type: "u32" }),
    roomAwardsHeadVariantLocal: Object.freeze({ offset: 1120, type: "i32" }),
    roomAwardsHeadCount: Object.freeze({ offset: 1124, type: "u32" }),
    roomAwardsHeadIdFinal: Object.freeze({ offset: 1128, type: "u32" }),
    roomAwardsHeadFlag66: Object.freeze({ offset: 1132, type: "u32" }),
    roomAwardsHeadPlannedSpawns: Object.freeze({ offset: 1136, type: "u32" }),
    /* ABI v135 (update-v135-deep-music-pack, record idx28): the deep-
       challenge fire carrier @1140 (contracts-deep-music NOTES §2b). */
    roomTriggerClearDeepMusicFire: Object.freeze({ offset: 1140, type: "u32" }),
    /* ABI v137 (record idx27): ALT spawn-path carrier @1144 (contracts-
       audio-head-83b0 NOTES §4) = rows consumed from the §6 ALT-tail
       pack (host applies that many alt_item_plan Outs on ALT ticks).
       The ALT capture lanes do NOT exist yet — the carrier stays 0
       until the companion pack lands. */
    roomTriggerClearAudioAltPathTailSpawns: Object.freeze({ offset: 1144, type: "u32" }),
    /* ABI v139 (records idx13/idx35): scalar tail echoes @1148..1168
       (contracts-b1-rain NOTES 3); observe-only mirrors. */
    b1RainRowsApplied: Object.freeze({ offset: 1148, type: "u32" }),
    b1RainSpawnCountEcho: Object.freeze({ offset: 1152, type: "u32" }),
    b1RainSearchOkCount: Object.freeze({ offset: 1156, type: "u32" }),
    b1RainGenrandDrawsTotal: Object.freeze({ offset: 1160, type: "u32" }),
    b1RainBind7764Stores: Object.freeze({ offset: 1164, type: "u32" }),
    b1RainBindRepositioned: Object.freeze({ offset: 1168, type: "u32" }),
    /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29):
       SPAWN_LOOP typed carriers @1172..1200. Published ONLY on
       capture-live retirement ticks; the coarse @184 stays silent
       those ticks. */
    roomAwardsSpawnLoopRowsApplied: Object.freeze({ offset: 1172, type: "u32" }),
    roomAwardsSpawnLoopDoorSpawnFires: Object.freeze({ offset: 1176, type: "u32" }),
    roomAwardsSpawnLoopSfxChaseFires: Object.freeze({ offset: 1180, type: "u32" }),
    roomAwardsSpawnLoopFlagRmwMask: Object.freeze({ offset: 1184, type: "u32" }),
    roomAwardsSpawnLoopVariantFinal: Object.freeze({ offset: 1188, type: "i32" }),
    roomAwardsSpawnLoopB1Pass: Object.freeze({ offset: 1192, type: "u32" }),
    roomAwardsSpawnLoopB1SiteArmed: Object.freeze({ offset: 1196, type: "u32" }),
    roomAwardsSpawnLoopB1ChaseFired: Object.freeze({ offset: 1200, type: "u32" }),
    /* ABI v141 (record idx29): 0xb-block carriers @1204..1240.
       Published ONLY on capture-live retirement ticks; coarse @184
       stays silent those ticks. */
    roomAwardsBBlockRowsApplied: Object.freeze({ offset: 1204, type: "u32" }),
    roomAwardsBBlockOobDefects: Object.freeze({ offset: 1208, type: "u32" }),
    roomAwardsBBlockCountSum: Object.freeze({ offset: 1212, type: "i32" }),
    roomAwardsBBlockRollFirstMask: Object.freeze({ offset: 1216, type: "u32" }),
    roomAwardsBBlockRollSecondMask: Object.freeze({ offset: 1220, type: "u32" }),
    roomAwardsBBlockRollIndexSum: Object.freeze({ offset: 1224, type: "u32" }),
    roomAwardsBBlockFollowupFires: Object.freeze({ offset: 1228, type: "u32" }),
    roomAwardsBBlockRngFinal: Object.freeze({ offset: 1232, type: "u32" }),
    roomAwardsBBlockPreloopCreateVariant: Object.freeze({ offset: 1236, type: "u32" }),
    roomAwardsBBlockTailCreateFired: Object.freeze({ offset: 1240, type: "u32" }),
    /* ABI v142 (update-v142-rt-band-pop, record idx4): the rt_band_pop
       composite carrier @1244..1256 (contracts-idx4-engine-band NOTES
       §4/§5). Published ONLY on capture-live firing ticks of the mode-1
       manager block; capture absence keeps all four lanes 0
       (byte-for-byte pre-v142). params_pack folds the five derived param
       stores 4 bits each: p0 | p1<<4 | p2<<8 | p3<<12 | p4<<16. */
    opaque008318a0RtBandPopFired: Object.freeze({ offset: 1244, type: "u32" }),
    opaque008318a0RtBandPopDepthAfter: Object.freeze({ offset: 1248, type: "u32" }),
    opaque008318a0RtBandPopLatchAfter: Object.freeze({ offset: 1252, type: "u32" }),
    opaque008318a0RtBandPopParamsPack: Object.freeze({ offset: 1256, type: "u32" }),
    clearPathFlagStore: Object.freeze({ offset: 988, type: "u32" }),
    midRestockSeedZeroDrop: Object.freeze({ offset: 984, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11Free: Object.freeze({ offset: 804, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11ModeHooks: Object.freeze({ offset: 808, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11Flag11f4: Object.freeze({ offset: 812, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11B10Fatal: Object.freeze({ offset: 816, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11Manager: Object.freeze({ offset: 820, type: "u32" }),
    opaqueRoomUpdatePrefixB9B11Camera: Object.freeze({ offset: 824, type: "u32" }),
    waterB16Gate: Object.freeze({ offset: 828, type: "u32" }),
    waterB16Step0: Object.freeze({ offset: 832, type: "u32" }),
    waterB16Step1: Object.freeze({ offset: 836, type: "u32" }),
    waterB16Step2: Object.freeze({ offset: 840, type: "u32" }),
    waterB16Step3: Object.freeze({ offset: 844, type: "u32" }),
    waterB16Step4: Object.freeze({ offset: 848, type: "u32" }),
    waterB16Step5: Object.freeze({ offset: 852, type: "u32" }),
    waterB16Goal0: Object.freeze({ offset: 856, type: "u32" }),
    waterB16Goal1: Object.freeze({ offset: 860, type: "u32" }),
    waterB16Goal2: Object.freeze({ offset: 864, type: "u32" }),
    waterB16Goal3: Object.freeze({ offset: 868, type: "u32" }),
    waterB16Goal4: Object.freeze({ offset: 872, type: "u32" }),
    waterB16Goal5: Object.freeze({ offset: 876, type: "u32" }),
    waterB16WireApplied: Object.freeze({ offset: 880, type: "u32" }),
    tailPathPureSteps: Object.freeze({ offset: 744, type: "u32" }),
    tailPathHostRebuild: Object.freeze({ offset: 748, type: "u32" }),
    tailPathHostTrail: Object.freeze({ offset: 752, type: "u32" }),
    tailPathHostPush: Object.freeze({ offset: 756, type: "u32" }),
    tailPathHostSpawn: Object.freeze({ offset: 760, type: "u32" }),
    tailPathHostMultispawnSteps: Object.freeze({ offset: 764, type: "u32" }),
    tailPathHostGenrandDraws: Object.freeze({ offset: 768, type: "u32" }),
    b18EntityWalkType5Calls: Object.freeze({ offset: 884, type: "u32" }),
    b18EntityWalkRttiCasts: Object.freeze({ offset: 888, type: "u32" }),
    b18EntityWalkPathbCalls: Object.freeze({ offset: 892, type: "u32" }),
    b18EntityWalkFrame: Object.freeze({ offset: 896, type: "u32" }),
    opaqueRoomUpdateClearDoorSlotsMask: Object.freeze({ offset: 900, type: "u32" }),
    opaqueRoomTransitionEngineBody7abcc0Calls: Object.freeze({ offset: 904, type: "u32" }),
    opaqueRoomTransitionEngineBody7abe20Calls: Object.freeze({ offset: 908, type: "u32" }),
    b2SpecialGateOpen: Object.freeze({ offset: 772, type: "u32" }),
    b2PickPool: Object.freeze({ offset: 776, type: "u32" }),
    b2SeedAfter: Object.freeze({ offset: 780, type: "u32" }),
    b2SpawnSeed1: Object.freeze({ offset: 784, type: "u32" }),
    b2SpawnPlanCount: Object.freeze({ offset: 788, type: "u32" }),
    b2FatalCollectibleBounds: Object.freeze({ offset: 792, type: "u32" }),
    b2FatalRngZero: Object.freeze({ offset: 796, type: "u32" }),
    b2FatalPickEmpty: Object.freeze({ offset: 800, type: "u32" }),
    frameOpaque4257b0IdCountOut: Object.freeze({ offset: 444, type: "u32" }),
    frameOpaque98dba0956110ProbePure: Object.freeze({ offset: 536, type: "u32" }),
    playerManagerUpdateDeathArgPrep: Object.freeze({ offset: 540, type: "u32" }),
    opaque0092f1c0Case: Object.freeze({ offset: 548, type: "u32" }),
    opaque0092f1c0HostLeaf: Object.freeze({ offset: 552, type: "u32" }),
    frameOpaque4212c0409030Advance: Object.freeze({ offset: 556, type: "u32" }),
    frameOpaque4212c0409030Rewind: Object.freeze({ offset: 560, type: "u32" }),
    sfxStopFoldApplied: Object.freeze({ offset: 564, type: "u32" }),
    sfxStopFoldStopCalls: Object.freeze({ offset: 568, type: "u32" }),
    sfxStopFoldStores: Object.freeze({ offset: 572, type: "u32" }),
    sfxStopFoldPendingMask: Object.freeze({ offset: 576, type: "u32" }),
    b15RainPureSteps: Object.freeze({ offset: 580, type: "u32" }),
    b15RainHostSearch: Object.freeze({ offset: 584, type: "u32" }),
    b15RainHostCreate: Object.freeze({ offset: 588, type: "u32" }),
    b15RainHostBind: Object.freeze({ offset: 592, type: "u32" }),
    b15RainHostSwap: Object.freeze({ offset: 596, type: "u32" }),
    b15RainGenrandDraws: Object.freeze({ offset: 600, type: "u32" }),
    playerManagerUpdateHeartbeatSfxPlayNoSamples: Object.freeze({ offset: 604, type: "u32" }),
    playerManagerUpdateHeartbeatSfxPlayPreload: Object.freeze({ offset: 608, type: "u32" }),
    playerManagerUpdateHeartbeatSfxPlayDevice: Object.freeze({ offset: 612, type: "u32" }),
    opaque008318a0Mode3AdvancePure: Object.freeze({ offset: 620, type: "u32" }),
    opaque008318a0Mode4SfxGateOpen: Object.freeze({ offset: 624, type: "u32" }),
    tcsStatsGrowthCalls: Object.freeze({ offset: 628, type: "u32" }),
    tcsStatsAppendCount: Object.freeze({ offset: 632, type: "u32" }),
    tcsStatsRecordDword: Object.freeze({ offset: 636, type: "u32" }),
    tcsStatsRecordByte: Object.freeze({ offset: 640, type: "u32" }),
    tcsStatsRecordFloat: Object.freeze({ offset: 644, type: "u32" }),
    tcsStatsTailAdd: Object.freeze({ offset: 648, type: "u32" }),
    roomTriggerClearAudioMusic: Object.freeze({ offset: 652, type: "u32" }),
    roomTriggerClearAudioFlagStore: Object.freeze({ offset: 656, type: "u32" }),
    roomTriggerClearAudioSfx: Object.freeze({ offset: 660, type: "u32" }),
});

export const BINARY_LAYOUT = Object.freeze({
  shortTimer: Object.freeze({ offset: 156968, type: "u32" }),
  positionResetTimer: Object.freeze({ offset: 156936, type: "u32" }),
  positionXBits: Object.freeze({ offset: 156940, type: "u32" }),
  positionYBits: Object.freeze({ offset: 156944, type: "u32" }),
  secondaryTimer: Object.freeze({ offset: 156984, type: "u32" }),
  decayValue: Object.freeze({ offset: 423732, type: "f32" }),
  transitionProgress: Object.freeze({ offset: 157104, type: "f32" }),
  transitionRate: Object.freeze({ offset: 157112, type: "f32" }),
  transitionMode: Object.freeze({ offset: 157116, type: "u32" }),
  postUpdateDelay: Object.freeze({ offset: 156916, type: "u32" }),
  gate1d520: Object.freeze({ offset: 120096, type: "u32" }),
  oneShot1d63c: Object.freeze({ offset: 120380, type: "u32" }),
  state24ecc: Object.freeze({ offset: 151244, type: "u32" }),
  value24ed0: Object.freeze({ offset: 151248, type: "u32" }),
  mode24ed8: Object.freeze({ offset: 151256, type: "u32" }),
  gate1d654: Object.freeze({ offset: 120404, type: "u32" }),
  gate1ba78: Object.freeze({ offset: 113272, type: "u32" }),
  gate1b83c: Object.freeze({ offset: 112700, type: "u32" }),
  predicate1ba74: Object.freeze({ offset: 113268, type: "u32" }),
  engineField4: Object.freeze({ offset: 112704, type: "u32" }),
  engineField8: Object.freeze({ offset: 112708, type: "u32" }),
  engineFieldC: Object.freeze({ offset: 112712, type: "u32" }),
  engineField10: Object.freeze({ offset: 112716, type: "u32" }),
  engineField14: Object.freeze({ offset: 112720, type: "u32" }),
  engineField18: Object.freeze({ offset: 112724, type: "u32" }),
  engineField1c: Object.freeze({ offset: 112728, type: "u32" }),
  engineField20: Object.freeze({ offset: 112732, type: "u32" }),
  engineField24: Object.freeze({ offset: 112736, type: "u32" }),
  engineFloat22c: Object.freeze({ offset: 113256, type: "f32" }),
  engineFloat230: Object.freeze({ offset: 113260, type: "f32" }),
  enginePlayer1bb74: Object.freeze({ offset: 113524, type: "u32" }),
  counter265c0: Object.freeze({ offset: 157120, type: "u32" }),
  itemOverlayState: Object.freeze({ offset: 114740, type: "u32" }),
  itemOverlayCounter11d1d0: Object.freeze({ offset: 119248, type: "u32" }),
  menuState23a74: Object.freeze({ offset: 146036, type: "u32" }),
  genericPromptActiveObject: Object.freeze({ offset: 157612, type: "u32" }),
  genericPromptActiveFlag: Object.freeze({ offset: 157628, type: "u32" }),
  genericPromptSubmittedSelection: Object.freeze({ offset: 157860, type: "u32" }),
  genericPromptPostUpdateFlag: Object.freeze({ offset: 157864, type: "u32" }),
  skipTimedTransitionFlag: Object.freeze({ offset: 153940, type: "u32" }),
  transitionColorRBits: Object.freeze({ offset: 157092, type: "u32" }),
  transitionColorGBits: Object.freeze({ offset: 157096, type: "u32" }),
  transitionColorBBits: Object.freeze({ offset: 157100, type: "u32" }),
  transitionAuxBits: Object.freeze({ offset: 157108, type: "u32" }),
  timedTransitionProgress: Object.freeze({ offset: 157080, type: "f32" }),
  timedTransitionForceFinish: Object.freeze({ offset: 158184, type: "u32" }),
  status22ed4: Object.freeze({ offset: 143060, type: "u32" }),
  status22edc: Object.freeze({ offset: 143068, type: "u32" }),
  timedTransitionCleanupMode: Object.freeze({ offset: 157204, type: "u32" }),
  effectCounter67788: Object.freeze({ offset: 423816, type: "u32" }),
  effectCounter68d6c: Object.freeze({ offset: 429420, type: "u32" }),
  roomTransitionMode1830c: Object.freeze({ offset: 99084, type: "u32" }),
  roomTransitionMarker18318: Object.freeze({ offset: 99096, type: "u32" }),
  roomTransitionIndex18900: Object.freeze({ offset: 100608, type: "u32" }),
  roomTransitionDimension18904: Object.freeze({ offset: 100612, type: "u32" }),
  frameCounter264fc: Object.freeze({ offset: 156924, type: "u32" }),
  frameCounter264f8: Object.freeze({ offset: 156920, type: "u32" }),
  fadeCounter26514: Object.freeze({ offset: 156948, type: "u32" }),
  fadeProgress26518: Object.freeze({ offset: 156952, type: "f32" }),
  shakeCurrent67738: Object.freeze({ offset: 423736, type: "f32" }),
  shakeTarget6773c: Object.freeze({ offset: 423740, type: "f32" }),
  shakeStep67740: Object.freeze({ offset: 423744, type: "f32" }),
  timer269e0: Object.freeze({ offset: 158176, type: "u32" }),
  listCount67730: Object.freeze({ offset: 423728, type: "u32" }),
  frameOpaque4212c0Mode: Object.freeze({ offset: 119532, type: "u32" }),
  frameOpaque4212c0Secondary: Object.freeze({ offset: 119536, type: "u32" }),
  frameOpaque4212c0Field3c: Object.freeze({ offset: 119592, type: "u32" }),
  frameOpaque4212c0Flag4c: Object.freeze({ offset: 119608, type: "u32" }),
  frameOpaque4212c0Flag111: Object.freeze({ offset: 119805, type: "u32" }),
  frameOpaque98dba0Mode: Object.freeze({ offset: 155340, type: "u32" }),
  frameOpaque98dba0Flag: Object.freeze({ offset: 155344, type: "u32" }),
  frameOpaque98dba0Counter: Object.freeze({ offset: 155348, type: "u32" }),
  frameOpaque98dba0Float170: Object.freeze({ offset: 155708, type: "f32" }),
  frameOpaque98dba0Float2d0: Object.freeze({ offset: 156060, type: "f32" }),
  difficulty269c8: Object.freeze({ offset: 158152, type: "u32" }),
  byte67744: Object.freeze({ offset: 423748, type: "u32" }),
  mode26584: Object.freeze({ offset: 157060, type: "u32" }),
  flags2654c: Object.freeze({ offset: 157004, type: "u32" }),
  gameFlags1839c: Object.freeze({ offset: 99228, type: "u32" }),
  hudMessageFlag8: Object.freeze({ offset: 136936, type: "u32" }),
  hudMessagePlayed64: Object.freeze({ offset: 137028, type: "u32" }),
  rankDisplaySwitchAfter: Object.freeze({ offset: 120400, type: "u32" }),
  rankDisplayStateAfter: Object.freeze({ offset: 120404, type: "u32" }),
  rankDisplayByte3b0: Object.freeze({ offset: 121344, type: "u32" }),
  transitionTailByte29fb8: Object.freeze({ offset: 171960, type: "u32" }),
  fxLerpGate676b4: Object.freeze({ offset: 423604, type: "u32" }),
  fxCur676b8: Object.freeze({ offset: 423608, type: "f32" }),
  fxCur676bc: Object.freeze({ offset: 423612, type: "f32" }),
  fxCur676c0: Object.freeze({ offset: 423616, type: "f32" }),
  fxCur676c4: Object.freeze({ offset: 423620, type: "f32" }),
  fxCur676c8: Object.freeze({ offset: 423624, type: "f32" }),
  fxCur676cc: Object.freeze({ offset: 423628, type: "f32" }),
  engineAnm2Loaded: Object.freeze({ offset: 113021, type: "u32" }),
  engineAnm2Slot10c: Object.freeze({ offset: 113024, type: "u32" }),
  engineAnm2Bitflags110: Object.freeze({ offset: 113028, type: "u32" }),
  globalTree4aba0Result: Object.freeze({ offset: 306080, type: "u8" }),
  hudHistoryLatch5c7c: Object.freeze({ offset: 145024, type: "u32" }),
  hudHistorySlotFlag0: Object.freeze({ offset: 144988, type: "u8" }),
  hudHistorySlotFlag1: Object.freeze({ offset: 145008, type: "u8" }),
});

export const STATE_TO_BINARY_ALIASES = Object.freeze({
  rankDisplayClear3b0Out: "rankDisplayByte3b0",
});

function hostOwnedAddress(name) {
  if (name === "roomDescFlags44") return "*(Room+0x4)+0x44";
  if (name === "roomDescClearCount4a") return "*(Room+0x4)+0x4a";
  if (name === "roomDescShortAe") return "*(Room+0x4)+0xae";
  if (name === "roomDescSubtype") return "*(Room+0x4)+0x6";
  if (name === "roomType8") return "Room+0x8";
  if (name === "rankDisplayClear3b0Out") return "Game+0x1da00";
  if (name === "rankDisplayTailOut") return "rank-display tail";
  const m = name.match(/([0-9a-f]+)$/i);
  return m ? ("Room+0x" + m[1]) : ("Room+" + name);
}
function hostOwnedSpec(name) {
  const type = STATE_LAYOUT[name]?.type ?? "u32";
  let direction = "inout";
  if (name === "rankDisplayClear3b0Out") direction = "buffer";
  if (name === "rankDisplayTailOut" || name === "roomDescShortAe") direction = "out";
  const bytes = name === "roomDescClearCount4a" ? 2 : (type === "u8" ? 1 : 4);
  return Object.freeze({
    address: hostOwnedAddress(name),
    bytes,
    type,
    direction,
    recapture: direction === "buffer" ? "alias-buffer" : "end-of-tick",
  });
}
export const HOST_OWNED_STATE_CONTRACT = Object.freeze(
  Object.fromEntries(
    Object.keys(STATE_LAYOUT)
      .filter((name) => !(name in BINARY_LAYOUT))
      .map((name) => [name, hostOwnedSpec(name)]),
  ),
);
export const HOST_OWNED_STATE_FIELDS = Object.freeze(
  Object.keys(HOST_OWNED_STATE_CONTRACT).filter(
    (name) => HOST_OWNED_STATE_CONTRACT[name].direction !== "buffer",
  ),
);

function asU32(v) { return (v >>> 0); }
function asI32(v) { return v | 0; }
function clone(o) { return JSON.parse(JSON.stringify(o ?? {})); }

export function overlayHostOwnedState(captured, hostState = null) {
  const out = clone(captured);
  for (const name of HOST_OWNED_STATE_FIELDS) {
    const spec = HOST_OWNED_STATE_CONTRACT[name];
    if (spec.direction === "out") {
      out[name] = 0;
      continue;
    }
    let v = hostState && Object.prototype.hasOwnProperty.call(hostState, name) ? hostState[name] : 0;
    if (spec.type === "f32") v = Math.fround(v);
    out[name] = v;
  }
  return out;
}

function readField(view, base, field) {
  const off = base + field.offset;
  if (field.type === "f32") return view.getFloat32(off, true);
  if (field.type === "i32") return view.getInt32(off, true);
  if (field.type === "u8") return view.getUint8(off);
  if (field.type === "u16") return view.getUint16(off, true);
  if (field.type === "bytes") {
    return new Uint8Array(view.buffer, view.byteOffset + off, field.size || 0);
  }
  return view.getUint32(off, true);
}
function writeField(view, base, field, value) {
  const off = base + field.offset;
  if (value == null) value = 0;
  if (field.type === "f32") view.setFloat32(off, value, true);
  else if (field.type === "i32") view.setInt32(off, value | 0, true);
  else if (field.type === "u8") view.setUint8(off, value & 0xff);
  else if (field.type === "u16") view.setUint16(off, value & 0xffff, true);
  else if (field.type === "bytes") {
    /* sized byte lanes (anm2 name cells): array-like values are written
       in place; the old skip silently zeroed them on both bridge and
       harness paths (measured silent-zero class). */
    if (value != null && typeof value.length === "number" && field.size) {
      const n = Math.min(field.size, value.length);
      for (let i = 0; i < n; i += 1) view.setUint8(off + i, value[i] & 0xff);
    }
  } else view.setUint32(off, value >>> 0, true);
}
/* Layout tables are frozen module constants; entries arrays are cached so the
   per-tick hot path (runtime layout: 4000+ fields) does not re-materialize
   4000 [name, field] pairs on every struct read/write. Pure memoization —
   identical field order, identical behavior. */
const LAYOUT_ENTRIES_CACHE = new WeakMap();
function layoutEntries(layout) {
  let entries = LAYOUT_ENTRIES_CACHE.get(layout);
  if (!entries) {
    entries = Object.entries(layout);
    LAYOUT_ENTRIES_CACHE.set(layout, entries);
  }
  return entries;
}
export function readStruct(view, base, layout) {
  const out = {};
  for (const [name, field] of layoutEntries(layout)) out[name] = readField(view, base, field);
  return out;
}
export function writeStruct(view, base, layout, value) {
  for (const [name, field] of layoutEntries(layout)) writeField(view, base, field, value[name]);
}

export function flattenDoorSlotsRuntime(inputSlots = []) {
  const out = {};
  for (let i = 0; i < 8; i += 1) {
    const s = inputSlots[i] || {};
    out[`doorSlot${i}Present`] = s.present ?? 0;
    out[`doorSlot${i}Field3a0`] = s.field3a0 ?? 0;
    out[`doorSlot${i}Field8`] = s.field8 ?? 0;
    out[`doorSlot${i}FieldC`] = s.fieldC ?? 0;
  }
  return out;
}
export function flattenPlayerHudSlotsRuntime(inputRuntimeInputs = {}) {
  return { ...inputRuntimeInputs };
}
export function normalizePlayerHudSlots(inputRuntimeInputs = {}) {
  return inputRuntimeInputs;
}
/* In-place lane assigner shared by the copying helper below and the hot
   normalize path (which mutates its own freshly built object and must not
   pay another 4000-key copy per tick). Same writes, same values. */
function assignMenuAuxTreeLanes(out) {
  const nodes = Array.isArray(out.menuAuxTreeNodes) ? out.menuAuxTreeNodes : [];
  for (let i = 0; i < MENU_AUX_TREE_MAX_NODES; i += 1) {
    const n = nodes[i] || {};
    out[`menuAuxTreeLeft${i}`] = (n.left ?? 0) >>> 0;
    out[`menuAuxTreeRight${i}`] = (n.right ?? 0) >>> 0;
    out[`menuAuxTreeFlag1c${i}`] = (n.flag1c ?? 0) >>> 0;
    out[`menuAuxTreeIsnil${i}`] = ((n.isnil ?? 1) ? 1 : 0) >>> 0;
    out[`menuAuxTreePayloadPresent${i}`] = (n.payloadPresent ?? 0) >>> 0;
    out[`menuAuxTreePayloadSize${i}`] = (n.payloadSize ?? 0) >>> 0;
  }
  return out;
}
export function flattenMenuAuxTreeRuntime(inputRuntimeInputs = {}) {
  /* The ABI carries the 32-node tree as flat per-field arrays
     (menuAuxTree{Left,Right,Flag1c,Isnil,PayloadPresent,PayloadSize}{i});
     corpus rows supply it as the `menuAuxTreeNodes` array. Without this
     expansion every node lands as ZERO — root 0 with all nodes nil — and
     the pure tree walk silently degenerates to the empty case (measured:
     the coverage guard saw no blob payload). */
  return assignMenuAuxTreeLanes({ ...inputRuntimeInputs });
}
export function flattenOpaque0092e300GroupsRuntime(inputRuntimeInputs = {}) {
  return { ...inputRuntimeInputs };
}
export function flattenOpaque0092e300VoicesRuntime(inputRuntimeInputs = {}) {
  /* The runtime ABI carries the sound-group/voice blob as flat layout keys
     (per-key whitelist: unnamed keys reach the module as ZERO). Expand the
     array forms the oracle consumes into those keys while KEEPING the
     arrays, or the wasm struct sees all-zero group/voice lanes and every
     gate decision diverges from the model.
     NOTE: this helper passes the WHOLE input through — callers MUST spread
     it into per-key whitelist literals BEFORE any f32-bit conversion
     spreads (same measured defect as flattenUpdateListTimersRuntime:
     case-271 walk divergence). */
  const out = { ...inputRuntimeInputs };
  const groups = inputRuntimeInputs.opaque0092e300Groups;
  if (Array.isArray(groups)) {
    for (let i = 0; i < OPAQUE_0092E300_MAX_GROUPS; i += 1) {
      const g = groups[i] || {};
      out[`opaque0092e300GroupEnabled${i}`] = (g.enabled198 ?? g.enabled ?? 0) >>> 0;
      out[`opaque0092e300GroupEntryCount${i}`] = (g.voices190 ?? g.entryCount ?? 0) >>> 0;
    }
  }
  const firstVoice = inputRuntimeInputs.opaque0092e300FirstVoice;
  if (Array.isArray(firstVoice)) {
    for (let i = 0; i < OPAQUE_0092E300_MAX_GROUPS; i += 1) {
      out[`opaque0092e300FirstVoice${i}`] = (firstVoice[i] ?? 0) >>> 0;
    }
  }
  const voices = inputRuntimeInputs.opaque0092e300Voices;
  if (Array.isArray(voices)) {
    for (let i = 0; i < OPAQUE_0092E300_MAX_VOICES; i += 1) {
      const v = voices[i] || {};
      out[`opaque0092e300Voice${i}ChannelNull`] = (v.channelNull ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}Pending09`] = (v.pending09 ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}ProbeFirst`] = (v.probeFirst ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}ProbeSecond`] = (v.probeSecond ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}ChannelNullThird`] = (v.channelNullThird ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}Loop08`] = (v.loop08 ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}Query44`] = (v.query44 ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}ChannelNullFourth`] = (v.channelNullFourth ?? 0) >>> 0;
      out[`opaque0092e300Voice${i}VoicesReloaded`] = (v.voicesReloaded ?? 0) >>> 0;
    }
  }
  return out;
}
function assignUpdateListTimerLanes(out) {
  const timers = out.updateListTimers;
  if (Array.isArray(timers)) {
    for (let i = 0; i < UPDATE_LIST_MAX_NODES; i += 1) {
      out[`updateListTimer${i}`] = (timers[i] ?? 0) | 0;
    }
  }
  return out;
}
export function flattenUpdateListTimersRuntime(inputRuntimeInputs = {}) {
  /* The ABI carries the 32 countdown cells as flat updateListTimer0..31
     keys; corpus rows supply them as the `updateListTimers` array. Without
     this expansion every cell lands as ZERO and the tail-sweep lane is
     silently neutered — every blob case sweeps an all-zero list (evicted ==
     count, pure-complete unreachable), measured by the coverage guard
     (blob=91 evict=91 pure=0).
     NOTE: this helper passes the WHOLE input through — callers MUST spread
     it into per-key whitelist literals BEFORE any f32-bit conversion
     spreads (measured at the ABI-96 merge: spread after syncHudStatPlayer
     leaked the raw corpus row over the hudStatPlayer float stems and
     hudStatWalkProbe1/3 conversions → case-271 walk divergence). */
  return assignUpdateListTimerLanes({ ...inputRuntimeInputs });
}
export function flattenGlobalTree4aba0NodesRuntime(input = {}) {
  const nodes = Array.isArray(input) ? input
    : (Array.isArray(input.nodes) ? input.nodes
      : (Array.isArray(input.globalTree4aba0Nodes) ? input.globalTree4aba0Nodes : null));
  if (!nodes) return { ...input };
  const out = {};
  for (let i = 0; i < nodes.length; i += 1) {
    const n = nodes[i] || {};
    out[`globalTree4aba0Addr${i}`] = (n.addr >>> 0);
    out[`globalTree4aba0Next${i}`] = (n.next >>> 0);
    out[`globalTree4aba0Prev${i}`] = (n.prev >>> 0);
    out[`globalTree4aba0Child${i}`] = (n.child >>> 0);
    out[`globalTree4aba0F0d${i}`] = (n.f0d >>> 0);
    out[`globalTree4aba0F18${i}`] = (n.f18 >>> 0);
  }
  return out;
}
/* Zero-filled template for the runtime layout, built once. The layout is a
   frozen module constant, so the key set never changes; rebuilding a
   4000-key zero object per call was the single hottest line of the live
   frame path (measured ~10 ms/tick with the per-call copies below). */
let PACKED_ZERO_RUNTIME = null;
export function normalizeRuntimeInputsForLayout(inputRuntimeInputs = {}) {
  if (PACKED_ZERO_RUNTIME === null) {
    PACKED_ZERO_RUNTIME = {};
    for (const key of Object.keys(RUNTIME_INPUTS_LAYOUT)) PACKED_ZERO_RUNTIME[key] = 0;
    Object.freeze(PACKED_ZERO_RUNTIME);
  }
  const out = {
    ...PACKED_ZERO_RUNTIME,
    ...flattenDoorSlotsRuntime(inputRuntimeInputs.doorSlots),
    ...inputRuntimeInputs,
  };
  /* ANM2 name lanes are sized bytes regions in the runtime ABI: string
     arrays must be flattened to cells here, or every write path (bridge
     and harness) silently delivers zeros (measured silent-zero class). */
  if (Array.isArray(out.engineAnm2LayerNames) && typeof out.engineAnm2LayerNames[0] === "string") {
    out.engineAnm2LayerNames = flattenAnm2NameCells(out.engineAnm2LayerNames, ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS);
  }
  if (Array.isArray(out.engineAnm2ExtraNames) && typeof out.engineAnm2ExtraNames[0] === "string") {
    out.engineAnm2ExtraNames = flattenAnm2NameCells(out.engineAnm2ExtraNames, ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS);
  }
  /* Array-form corpus rows must reach the wasm as flat ABI lanes: the
     menu-aux tree and the tail-sweep countdowns have no other delivery
     path (measured silent-zero class — both were pass-through stubs and
     every pure arm of both lanes was unreachable). Applied IN PLACE and in
     order (tree lanes first, then timer lanes), exactly the effect of the
     former two sequential Object.assign(out, flattenX(out)) calls without
     re-copying the 4000-key object twice per tick. */
  assignMenuAuxTreeLanes(out);
  assignUpdateListTimerLanes(out);
  return out;
}

/* ---- fused runtime-struct writer (hot path) ------------------------------
   writeStruct(view, base, RUNTIME_INPUTS_LAYOUT,
               normalizeRuntimeInputsForLayout(x)) materializes a 4000-key
   object per call. This writer resolves each layout key through the SAME
   precedence chain — menu-aux lanes (always computed, isnil defaults to 1),
   timer lanes (only when the array form is present), caller keys, door-slot
   flatten, packed zero — and hands the value to the SAME writeField, so the
   bytes written are identical by construction. Byte-equivalence against the
   normalize+writeStruct pair is pinned by
   tests/decomp-frame-path-fastpath.test.js. */
const MENU_AUX_FIELD_PROPS = Object.freeze({
  Left: ["left", 0], Right: ["right", 0], Flag1c: ["flag1c", 0],
  Isnil: ["isnil", 1], PayloadPresent: ["payloadPresent", 0],
  PayloadSize: ["payloadSize", 0],
});
let RUNTIME_LANE_TAGS = null;
function runtimeLaneTags() {
  if (RUNTIME_LANE_TAGS) return RUNTIME_LANE_TAGS;
  RUNTIME_LANE_TAGS = layoutEntries(RUNTIME_INPUTS_LAYOUT).map(([name, field]) => {
    let m = name.match(/^menuAuxTree(Left|Right|Flag1c|Isnil|PayloadPresent|PayloadSize)(\d+)$/);
    if (m && Number(m[2]) < MENU_AUX_TREE_MAX_NODES) {
      const [prop, dflt] = MENU_AUX_FIELD_PROPS[m[1]];
      return { name, field, kind: 1, prop, dflt, i: Number(m[2]) };
    }
    m = name.match(/^updateListTimer(\d+)$/);
    if (m && Number(m[1]) < UPDATE_LIST_MAX_NODES) {
      return { name, field, kind: 2, i: Number(m[1]) };
    }
    m = name.match(/^doorSlot([0-7])(Present|Field3a0|Field8|FieldC)$/);
    if (m) {
      const prop = { Present: "present", Field3a0: "field3a0", Field8: "field8", FieldC: "fieldC" }[m[2]];
      return { name, field, kind: 3, prop, i: Number(m[1]) };
    }
    if (name === "engineAnm2LayerNames") {
      return { name, field, kind: 4, max: ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS };
    }
    if (name === "engineAnm2ExtraNames") {
      return { name, field, kind: 4, max: ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS };
    }
    return { name, field, kind: 0 };
  });
  return RUNTIME_LANE_TAGS;
}
const hasOwn = Object.prototype.hasOwnProperty;
export function writeRuntimeInputsForLayout(view, base, inputRuntimeInputs = {}) {
  const input = inputRuntimeInputs;
  const nodes = Array.isArray(input.menuAuxTreeNodes) ? input.menuAuxTreeNodes : [];
  const timers = Array.isArray(input.updateListTimers) ? input.updateListTimers : null;
  const slots = input.doorSlots;
  for (const t of runtimeLaneTags()) {
    let v;
    if (t.kind === 1) {
      const n = nodes[t.i] || {};
      v = t.prop === "isnil"
        ? (((n.isnil ?? 1) ? 1 : 0) >>> 0)
        : ((n[t.prop] ?? 0) >>> 0);
    } else if (t.kind === 2 && timers) {
      v = (timers[t.i] ?? 0) | 0;
    } else if (hasOwn.call(input, t.name)) {
      v = input[t.name];
      if (t.kind === 4 && Array.isArray(v) && typeof v[0] === "string") {
        v = flattenAnm2NameCells(v, t.max);
      }
    } else if (t.kind === 3 && slots) {
      const s = slots[t.i] || {};
      v = s[t.prop] ?? 0;
    } else {
      v = 0;
    }
    writeField(view, base, t.field, v);
  }
}

export function playerFlag410Broadcast(flag, count) {
  const n = count | 0;
  if (n <= 0) return [];
  const b = (flag | 0) & 0xff;
  return Array.from({ length: n }, () => b);
}

export function opaque0092e300NeedsHost({
  ready = 0, groupCount = 0, packsReady = 0, groups = [],
} = {}) {
  /* Mirrors opaque_0092e300_needs_host exactly: ready -> zero span (the PE
     0x0092e32a je exits at once) -> negative span -> packs/cap -> byte test
     at group+0x198 then unsigned dword at group+0x190. Order matters: a
     zero count with packs_ready == 0 still returns NOT-host. */
  if ((ready | 0) === 0) return true;
  const n = groupCount | 0;
  if (n === 0) return false;
  if (n < 0) return true;
  if ((packsReady | 0) === 0) return true;
  if (n > OPAQUE_0092E300_MAX_GROUPS) return true;
  for (let i = 0; i < n; i += 1) {
    const g = groups[i] || {};
    const enabled = g.enabled198 ?? g.enabled ?? 0;
    const entryCount = g.voices190 ?? g.entryCount ?? 0;
    if (((enabled >>> 0) & 0xff) === 0) continue;
    if ((entryCount >>> 0) === 0) continue;
    return true;
  }
  return false;
}
export function opaque0092e300GroupsFromRuntime(runtimeInputs) {
  return runtimeInputs?.opaque0092e300Groups ?? [];
}
export function opaque0092e300FirstVoiceFromRuntime(runtimeInputs) {
  return runtimeInputs?.firstVoice ?? [];
}
export function opaque0092e300VoicesFromRuntime(runtimeInputs, voiceCount) {
  const v = runtimeInputs?.voices ?? [];
  return v.slice(0, voiceCount | 0);
}
function mapOpaque0092e300Groups(opts = {}) {
  const groups = opts.groups ?? [];
  const firstVoice = opts.firstVoice ?? [];
  const n = opts.groupCount | 0;
  const out = [];
  for (let i = 0; i < n; i += 1) {
    const g = groups[i] || {};
    out.push({
      enabled198: g.enabled198 ?? g.enabled ?? 0,
      voices190: g.voices190 ?? g.entryCount ?? 0,
      firstVoice: firstVoice[i] ?? g.firstVoice ?? 0,
    });
  }
  return out;
}

function emptySoundGroupWalkPlan() {
  return {
    groupsVisited: 0,
    groupsDisabled: 0,
    groupsEmpty: 0,
    groupsWalked: 0,
    voicesVisited: 0,
    probeCalls: 0,
    queryCalls: 0,
    stopCalls: 0,
    stores: 0,
    applied: 0,
    pendingOut: Array(OPAQUE_0092E300_MAX_VOICES).fill(0),
    pendingMask: 0,
  };
}

/** ABI v88 in-module walk. Returns plan.applied=1 when the walk ran. */
export function opaque0092e300Walk(opts = {}) {
  const plan = emptySoundGroupWalkPlan();
  if ((opts.walkReady | 0) !== 1) return plan;
  if ((opts.ready | 0) === 0) return plan;
  if ((opts.voiceBlobReady | 0) !== 1) return plan;
  const groupCount = opts.groupCount | 0;
  const voiceCount = opts.voiceCount | 0;
  if (groupCount < 0 || groupCount > OPAQUE_0092E300_MAX_GROUPS || (opts.packsReady | 0) === 0) {
    return plan;
  }
  if (voiceCount < 0 || voiceCount > OPAQUE_0092E300_MAX_VOICES) return plan;
  plan.applied = 1;
  if (groupCount === 0) return plan;
  const groups = mapOpaque0092e300Groups(opts);
  const voices = opts.voices ?? [];
  for (let g = 0; g < groupCount; g += 1) {
    plan.groupsVisited += 1;
    const grp = groups[g] || {};
    const action = sfxStopAllGroupAction(grp.enabled198, grp.voices190);
    if (action === SFX_STOP_ALL_GROUP_DISABLED) {
      plan.groupsDisabled += 1;
      continue;
    }
    if (action === SFX_STOP_ALL_GROUP_EMPTY) {
      plan.groupsEmpty += 1;
      continue;
    }
    if (action !== SFX_STOP_ALL_GROUP_WALK) continue;
    plan.groupsWalked += 1;
    for (let i = 0; ; i += 1) {
      const slot = (grp.firstVoice | 0) + i;
      if (slot < 0 || slot >= voiceCount) break;
      const sample = voices[slot] || {};
      const d = sfxStopAllVoiceDecide(sample);
      plan.voicesVisited += 1;
      plan.probeCalls += d.probeCalls | 0;
      plan.queryCalls += d.queryNeeded ? 1 : 0;
      plan.stopCalls += d.stopCalled ? 1 : 0;
      plan.stores += d.observableStores | 0;
      let pending = (sample.pending09 >>> 0) & 0xff;
      if (d.pendingClearedEarly || d.pendingClearedLate) pending = 0;
      plan.pendingOut[slot] = pending;
      if (!sfxVoiceLoopContinue(i + 1, sample.voicesReloaded)) break;
    }
  }
  /* ABI v94: the mask loop carries the SAME group-action gate as the walk
     (sfxStopAllGroupAction — PE 0x92e340 BYTE enabled test / 0x92e352
     UNSIGNED count test precede every [e+0x29] store at 0x92e37b/0x92e3c7):
     a disabled/empty group executes NO store, so its firstVoice slots stay
     pending and must NOT set mask bits even when pending09 is non-zero
     (pendingOut init 0 there is "untouched", not "cleared"). */
  let mask = 0;
  for (let g = 0; g < groupCount; g += 1) {
    const grp = groups[g] || {};
    const action = sfxStopAllGroupAction(grp.enabled198, grp.voices190);
    if (action !== SFX_STOP_ALL_GROUP_WALK) continue;
    for (let i = 0; ; i += 1) {
      const slot = (grp.firstVoice | 0) + i;
      if (slot < 0 || slot >= voiceCount) break;
      const sample = voices[slot] || {};
      if ((plan.pendingOut[slot] | 0) === 0 && (((sample.pending09 >>> 0) & 0xff) !== 0)) {
        mask |= (1 << slot) >>> 0;
      }
      if (!sfxVoiceLoopContinue(i + 1, sample.voicesReloaded)) break;
    }
  }
  plan.pendingMask = mask >>> 0;
  return plan;
}

/* ABI v95 (record idx 1, 0x0092e300, LAST in-module leaf L4): the frozen
   sound-group walk EXACTNESS gate (mirror of
   isaac_game_update_slice_0092e300_walk_exact). The PE re-reads the group
   vector span/base/per-group count on EVERY iteration (0x92e3d5/0x92e3d9/
   0x92e3f8/0x92e400); the in-module walk runs on the FROZEN capture. This
   returns 1 iff the capture is exact-by-construction: the frozen span
   divides to the frozen group_count through the PE's OWN signed magic
   divide (sfxEntryCount, 0x094f2095 — PE 0x92e316..0x92e32a +
   0x92e400..0x92e416), caps hold, and every WALK group's voice window
   (first_voice[g] + voices190 <= voice_count) is fully inside the
   captured array. Zero-span -> 1 (PE 0x92e32a je). QUIESCENCE is
   host-time: walk_ready=1 only when exact==1 AND the vector is quiescent
   for the record's duration. Verifier-visible only. */
export function opaque0092e300WalkExact(opts = {}) {
  const spanBytes = opts.spanBytes ?? 0;
  const groupCount = opts.groupCount | 0;
  const voiceCount = opts.voiceCount | 0;
  const derived = sfxEntryCount(spanBytes) | 0;
  if (derived === 0 && groupCount === 0) return 1; /* PE 0x92e32a je */
  if (derived !== groupCount) return 0;
  /* Negative capture: the cpp takes group_count as uint32_t (a negative
     count is unrepresentable -> 0xffffffff/0x80000000 gates via > MAX_GROUPS),
     and the documented law is group_count in [0,8]. A self-consistent
     negative pair (span -440/gc -1, span 0x80000000/gc -4880644) must gate 0
     exactly like the walk (opaque0092e300Walk) and the PE law. C1 audit
     update-v96-record1-audit: 27 tuples, module+law return 0, mirror leaked 1. */
  if (groupCount < 0) return 0;
  if (groupCount > OPAQUE_0092E300_MAX_GROUPS) return 0;
  if (voiceCount > OPAQUE_0092E300_MAX_VOICES) return 0;
  if (groupCount === 0) return 1;
  const groups = mapOpaque0092e300Groups(opts);
  const firstVoice = opts.firstVoice ?? [];
  for (let g = 0; g < groupCount; g += 1) {
    const grp = groups[g] || {};
    if (sfxStopAllGroupAction(grp.enabled198, grp.voices190) !== SFX_STOP_ALL_GROUP_WALK) {
      continue;
    }
    const fv = (firstVoice[g] ?? grp.firstVoice ?? 0) | 0;
    if (fv < 0) return 0;
    if (((fv >>> 0) + (grp.voices190 >>> 0)) > (voiceCount >>> 0)) return 0;
  }
  return 1;
}

export function opaque0092e300EmitsHost(opts = {}) {
  const walk = opaque0092e300Walk(opts);
  if ((walk.applied | 0) !== 0) return (walk.stopCalls | 0) > 0;
  if ((opts.ready | 0) === 0) return true; /* ABI v88: ready=0 stays pre-v50 monolithic */
  const v50 = opaque0092e300NeedsHost(opts) ? 1 : 0;
  if (v50 === 0) return false;
  if ((opts.voiceBlobReady | 0) !== 1) return v50 !== 0;
  const voiceCount = opts.voiceCount | 0;
  const groupCount = opts.groupCount | 0;
  if (voiceCount < 0 || voiceCount > OPAQUE_0092E300_MAX_VOICES) return true;
  if (groupCount < 0 || groupCount > OPAQUE_0092E300_MAX_GROUPS || (opts.packsReady | 0) === 0) return true;
  const groups = mapOpaque0092e300Groups(opts);
  const voices = opts.voices ?? [];
  const spanBytes = opts.spanBytes ?? (groupCount * SFX_ENTRY_STRIDE);
  const plan = sfxStopAllPlan(spanBytes, groups, voices, opts.voiceCount | 0);
  return plan && (plan.pureComplete | 0) === 0;
}

/* ABI v95: record idx 47 (playerManagerUpdateHeartbeatSfxStop) STOP fold of
   0x0092e230 — in-module channel walk + per-voice stop gates, consuming the
   SFX-family whole-body law (sfxStopPlan) BY REFERENCE (never re-stated).

   Per voice, in PE order: the LIVE sentinel [entry+4]=-1 (0x92e2a0, first
   insn of the loop body), the channel-null first read (0x92e2a7), the
   +0x29 pending-byte first-probe gate (0x92e2ae, LOW-BYTE), the two
   vtbl[0x38] probes (0x92e2b8/0x92e2c9 — captured, device), the early
   pending clear (0x92e2be), the act test (0x92e2cb jne / 0x92e2cf cmp —
   stop iff probe2 != 0 || pending_after != 0), the RELOADED channel gate
   for the vtbl[0x3c] STOP (0x92e2d3..0x92e2d6 je) and the late clear
   (0x92e2df). Loop bound RE-READ per iteration (0x92e2e6 unsigned jb).

   Divergence pins vs record idx 1 (0x92e300): NO vtbl[0x44] query stage,
   NO +0x08 loop-byte fallback (divergence #3) — the STOP voice pack has 6
   fields (channelNull, pending09, probeFirst, probeSecond,
   channelNullReload, voicesReloaded), never loop_08/query_44; the fold
   never consults any +0x08 field. Gate classes: MISS (SIGNED id<0 / id>=count)
   and DISABLED (BYTE enabled) are proof-complete no-ops (applied, all 0);
   NO_SAMPLES keeps the warn-log host (NOT applied -> v60 fallback); LIVE
   walks the voices. fold_ready==0 / ready==0 / missing blob -> NOT applied
   (v60 fallback byte-for-byte). stopCalls are the device vtbl+0x3c count,
   published as the typed host event (record-1 slot_3c precedent). */
export const SFX_STOP_FOLD_MAX_VOICES = 32;

export function sfxStopFold(opts = {}) {
  const plan = {
    applied: 0,
    sentinelWritten: 0,
    voicesVisited: 0,
    probeCalls: 0,
    stopCalls: 0,
    stores: 0,
    pendingMask: 0,
  };
  if ((opts.foldReady | 0) !== 1) return plan;
  if ((opts.ready | 0) === 0) return plan; /* pre-v60 monolithic stays */
  const voiceCount = opts.voiceCount | 0;
  if (voiceCount < 0 || voiceCount > SFX_STOP_FOLD_MAX_VOICES) return plan;
  const voices = Array.isArray(opts.voices) ? opts.voices : [];
  /* Pad to voiceCount: the module reads the runtime's inline pack array
     (zero-filled beyond the captured entries — differential case 3949 the
     model iterated only the delivered entries while the module walked the
     zero packs, so stores/visited disagreed). */
  const c = Math.min(Math.max(voiceCount, 0), SFX_STOP_FOLD_MAX_VOICES);
  const padded = [];
  for (let i = 0; i < c; i += 1) {
    const v = voices[i] || {};
    padded.push({
      channelNull: v.channelNull ?? 0,
      pending09: v.pending09 ?? 0,
      probeFirst: v.probeFirst ?? 0,
      probeSecond: v.probeSecond ?? 0,
      channelNullReload: v.channelNullReload ?? 0,
      voicesReloaded: v.voicesReloaded ?? 0,
    });
  }
  const full = sfxStopPlan(
    PM_INTENSITY_SFX_ID,
    opts.span | 0,
    opts.voices190 >>> 0,
    opts.enabled198 >>> 0,
    padded,
  );
  if (!full) return plan;
  if (full.gateKind === SFX_GATE_NO_SAMPLES) return plan; /* warn-log host stays */
  plan.applied = 1;
  plan.sentinelWritten = (full.frameEndWrites | 0) > 0 ? 1 : 0;
  plan.stores = full.observableStores | 0;
  plan.stopCalls = full.stopCalls | 0;
  plan.probeCalls = full.probeCalls | 0;
  plan.voicesVisited = full.voicesVisited | 0;
  /* The record's pending mask (sfxStopFoldPendingMask @620) counts bytes the
     record CLEARED, not clear stores that ran: the cpp call site derives
     `scratch byte 0 && captured low byte nonzero` (game_update_slice.cpp
     fold call site) — a store on an already-zero (or high-bits-only)
     pending byte did not clear anything, so it must not set the bit. The
     family pendingClearMask (sfxStopPlan) marks any early/late clear STORE;
     AND it with the captured-low-byte-nonzero lane of the packs the record
     actually visited (voiceCount cap). */
  let clearedLane = 0;
  for (let i = 0; i < padded.length && i < SFX_STOP_FOLD_MAX_VOICES; i += 1) {
    const v = padded[i];
    if (v && ((v.pending09 ?? 0) & 0xff) !== 0) clearedLane |= (1 << i) >>> 0;
  }
  plan.pendingMask = ((full.pendingClearMask || 0) & clearedLane) >>> 0;
  return plan;
}

/* ABI v95 (record idx 3, 0x0092f1c0 gate-1ba78): case-arm pure laws.
   dispatch_case mirrors PE 0x92f1f0..0x92f1fc (mov eax,[ebx]; dec eax;
   cmp eax,3; ja 0x92ff60; jmp [eax*4+0x92ffa4]) — FULL-DWORD (u32)
   (mode-1)>3: 0x101 / any large high-byte mode is -1 (switch default
   tail). Modes 1 (case 0) and 4 (case 3) are NEVER pure: the Room interior
   0x4186c0 call is UNCONDITIONAL before eligibility (0x92f231 / 0x92fee9).
   try_pure proves the case-1/2 pure-tail exits (PE map in the header
   comment): case 1 (mode==2): (u32)counter < (u32)limit (0x92fa0f cmp /
   0x92fa11 jb) && counter != limit-2 (0x92fd7e..0x92fd83) && (counter !=
   limit-1 (0x92fe46..0x92fe4b jne -> tail) || (field14 & 0xff) != 0
   (0x92fe51 cmp byte / 0x92fe55 jne -> tail)); case 2 (mode==3):
   (u32)counter < (u32)limit (0x92feaa cmp / 0x92fead jb -> tail) &&
   !(counter==2 && (field14 & 0xff) != 0) (0x92fe8b cmp / 0x92fe90 cmp byte
   -> 0x7eb1b0 host). field14 is the machine's BYTE test. counter_next
   mirrors PE 0x92ff60 inc dword ptr [ebx+4] (32-bit wrap). */
export function gameUpdateSlice92f1c0DispatchCase(mode) {
  const m = mode >>> 0;
  if (((m - 1) >>> 0) > 3) return -1;
  return (m - 1) | 0;
}
export function gameUpdateSlice92f1c0TryPure({
  mode = 0, counter = 0, limit = 0, field14 = 0,
  gameType0 = 0, flags2654c = 0,
} = {}) {
  const c = counter >>> 0;
  const lim = limit >>> 0;
  const dc = gameUpdateSlice92f1c0DispatchCase(mode);
  if (dc < 0) return 1; /* switch default: tail only */
  if (dc === 0 || dc === 3) return 0; /* cases 0/3: unconditional 0x4186c0 */
  if (dc === 1) {
    if (c >= lim) return 0;               /* reset arm 0x92fa17 */
    if (c === (lim - 2) >>> 0) return 0;  /* limit-2 arm 0x92fd89 */
    if (c === (lim - 1) >>> 0 && (field14 & 0xff) === 0) {
      /* ABI v101: leaf-5 is NOT unconditionally host. PE 0x0092fe5b mov
         ecx,[0xc71678]; 0x0092fe61 call 0x0074f090; 0x0092fe66 test al,al;
         0x0092fe68 jne 0x92ff60 — AL!=0 jumps straight to the shared pure
         tail. AL==0 stays host (0x92fe6e stores Manager+0x4b2a4/+0x4b2a5,
         and Game+0x1ba84 behind them is NOT captured). */
      return gameUpdateSlice74f090Result(gameType0, flags2654c) !== 0 ? 1 : 0;
    }
    return 1; /* pure tail */
  }
  /* dc === 2 (case 2, mode==3). */
  if (c === 2 && (field14 & 0xff) !== 0) return 0; /* 0x7eb1b0 arm */
  if (c >= lim) return 0;                          /* 0x746560 arm */
  return 1; /* pure tail */
}
export function gameUpdateSlice92f1c0CounterNext(counter) {
  return ((counter | 0) + 1) | 0;
}
/* Typed host-leaf code matching the cpp event (1..8). 0 when not host. */
export function gameUpdateSlice92f1c0HostLeaf({
  mode = 0, counter = 0, limit = 0, field14 = 0,
  gameType0 = 0, flags2654c = 0,
} = {}) {
  const dc = gameUpdateSlice92f1c0DispatchCase(mode);
  if (dc < 0) return 0;
  const c = counter >>> 0;
  const lim = limit >>> 0;
  if (dc === 0) return 1; /* case 0: uncond 0x4186c0 */
  if (dc === 3) return 2; /* case 3: uncond 0x4186c0 */
  if (dc === 1) {
    if (c >= lim) return 3;              /* reset arm */
    if (c === (lim - 2) >>> 0) return 4; /* limit-2 arm */
    /* ABI v101: leaf 5 only survives when 0x74f090 returned AL==0; the
       AL!=0 sub-path took the pure tail and emits no host leaf. */
    if (gameUpdateSlice74f090Result(gameType0, flags2654c) !== 0) return 0;
    return 5;                            /* 0x74f090 arm, AL==0 */
  }
  let leaf = 0;
  if (c === 2 && (field14 & 0xff) !== 0) leaf |= 1; /* 0x7eb1b0 */
  if (c >= lim) leaf |= 2;                           /* 0x746560 */
  return leaf; /* 1/2/3 (both) */
}

/* ABI v116 (record idx 3 case-arm leaves, ABI 99 frozen): 0x0074f090
   complete predicate + 0x007eb1b0 prefix FULL-dword mode gates.
   Independent JS oracle — do not derive from the C++. */
export function gameUpdateSlice74f090TypeOk(type) {
  return (((type >>> 0) - 1) >>> 0) > 5 ? 0 : 1;
}
export function gameUpdateSlice74f090Flag(flags2654c) {
  return ((flags2654c >>> 0) & 0x10000) !== 0 ? 1 : 0;
}
export function gameUpdateSlice74f090Result(type, flags2654c) {
  return (gameUpdateSlice74f090TypeOk(type) !== 0 &&
          gameUpdateSlice74f090Flag(flags2654c) !== 0) ? 1 : 0;
}
export function gameUpdateSlice7eb1b0Mode2c(mode26584) {
  return (mode26584 >>> 0) === 0x2c ? 1 : 0;
}
export function gameUpdateSlice7eb1b0Mode2d(mode26584) {
  return (mode26584 >>> 0) === 0x2d ? 1 : 0;
}
/* ABI v117 (record idx 3, 0x0074f690 mode-44 stage-type helper, ABI 99
   frozen): pure decision layer around the single host GetRoomByIdx call.
   Independent JS oracle — do not derive from the C++. PE map in
   game_update_slice.h. */
export function gameUpdateSlice74f690EntryPlan(mode26584, roomIdx, stage0,
                                               flag183a0) {
  if ((mode26584 >>> 0) !== 0x2c) return 0; /* FULL-dword 0x74f69c */
  const ri = roomIdx | 0;
  if (ri === -10) return (stage0 >>> 0) === 7 ? 1 : 0; /* 0x74f6a8/0x74f6ad */
  if (ri < 0) return 0; /* SIGNED js 0x74f6bf */
  if ((flag183a0 & 0xff) !== 0) return 3; /* BYTE gate 0x74f6c3 */
  return 2; /* host GetRoomByIdx 0x74f6cf */
}
export function gameUpdateSlice74f690ClampDescDword0(descDword0) {
  /* PE 0x74f6da..0x74f6ed: SIGNED cmovle 0 / cmovl 0xa8. */
  const v = descDword0 | 0;
  if (v <= 0) return 0;
  if (v >= 0xa8) return 0xa8;
  return v >>> 0;
}
export function gameUpdateSlice74f690GridDist(slotField, roomIdxFinal) {
  /* PE 0x74f76b..0x74f7a9: SIGNED /13 twice, dist = |r1-r2| + |q1-q2|. */
  const s = slotField | 0;
  const r = roomIdxFinal | 0;
  const dr = (s % 13) - (r % 13);
  const dq = Math.trunc(s / 13) - Math.trunc(r / 13);
  return Math.abs(dr) + Math.abs(dq);
}
export function gameUpdateSlice74f690StageRoute(stageAfter, roomIdxFinal,
                                                slotField) {
  /* PE 0x74f6f0 re-read; 0x74f6f5 jg SIGNED (0xffffffff -> lo table). */
  const s = stageAfter | 0;
  if (s <= 6) return 0;
  if (s === 7 || s === 8) {
    return gameUpdateSlice74f690GridDist(slotField, roomIdxFinal) > 3 ? 2 : 1;
  }
  return 3;
}
/* PE 0x74f703 mulss [0xbaa784]=5.0f; 0x74f70b maxss 0 (NaN folds to 0);
   0x74f70f minss [0xbaa780]=4.999f; 0x74f717 cvttss2si trunc. */
const gameUpdateSlice74f690F32Lane = (bits) => {
  const f = new DataView(new Uint32Array([bits >>> 0]).buffer).getFloat32(0,
                                                                          true);
  const v = f * 5;
  const c = !(v > 0) ? 0 : v > 4.999 ? 4.999 : v;
  return Math.trunc(c);
};
const GAME_UPDATE_SLICE_74F690_TABLE_LO = [
  0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 2, 4, 1, 1, 1, 4, 5, 1, 1, 4, 5, 5];
const GAME_UPDATE_SLICE_74F690_TABLE_HI = [
  0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 1, 1, 2, 1, 1, 1, 1, 2];
export function gameUpdateSlice74f690TableType(tableSel, faBits, fbBits) {
  /* PE 0x74f72e lea a*5; 0x74f741 add c; 0x74f743 / 0x74f80b tables. */
  const idx = gameUpdateSlice74f690F32Lane(faBits) * 5 +
      gameUpdateSlice74f690F32Lane(fbBits);
  return (tableSel >>> 0) === 0 ? GAME_UPDATE_SLICE_74F690_TABLE_LO[idx]
                                : GAME_UPDATE_SLICE_74F690_TABLE_HI[idx];
}


export function opaque0092f1c0NeedsHost({
  ready = 0, mode = 0, counter = 0, limit = 0, field14 = 0,
  gameType0 = 0, flags2654c = 0,
} = {}) {
  if ((ready | 0) === 0) return true;
  return gameUpdateSlice92f1c0TryPure({
    mode, counter, limit, field14, gameType0, flags2654c,
  }) === 0;
}
export function opaque0092f1c0ApplyTail({ mode = 0, counter = 0 } = {}) {
  return hudGate92f1c0Plan({ mode, modeAfterBody: mode, counter });
}
export function opaque008318a0NeedsHost({ ready = 0, mode = 0 } = {}) {
  if ((ready | 0) === 0) return true;
  return !hudGate92f1c0TryPure(mode);
}
/* ABI v95 (record idx 4, 0x008318a0 mode-1/3/4 host bodies): pure decision
   layers. Evidence: cpu-dump/008318a0.txt + 00831900.txt + 008320c6.txt +
   00832290.txt + 0083243b.txt + 008327b0.txt; jump table 0x8327bc raw
   bytes 15 19 83 00 a1 1f 83 00 c6 20 83 00 3b 24 83 00 = {0x831915,
   0x831fa1, 0x8320c6, 0x83243b}. 0x4186c0 + the ANM2 pair stay typed-host;
   these laws publish the dispatch selection, arg prep and the byte/full-word
   gates in-module. */
export function gameUpdateSlice8318a0BodyCase(mode) {
  /* PE 0x831902 mov eax,[ebx] (mode); dec; cmp 3; ja 0x8326a1; jmp
     [eax*4+0x8327bc] — FULL-DWORD (u32)(mode-1) > 3 folds to 0. */
  const m = mode >>> 0;
  if ((m - 1) >>> 0 > 3) return 0;
  return (m - 1) + 1; /* 1..4 */
}
export function gameUpdateSlice8318a0Mode3AdvanceSigned(counter, limit) {
  /* PE 0x8320c6 mov eax,[ebx+4]; cmp eax,[ebx+8]; 0x8320cc jl 0x8320bd —
     SIGNED. WIDE counter 0xffffffff (=-1) with limit 1 MUST advance;
     0x80000000 < 0x7fffffff MUST advance. */
  return (counter | 0) < (limit | 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode4SfxGate(type1c, counter) {
  /* PE 0x83243b cmp [ebx+0x1c],3 / jne + 0x832441 cmp [ebx+4],8 / jne —
     BOTH FULL-DWORD equality. 0x103 / 0x1008 must NOT open. */
  return ((type1c >>> 0) === 3 && (counter >>> 0) === 8) ? 1 : 0;
}
export function gameUpdateSlice8318a04186c0Arg() {
  return 1; /* push 1 at 0x83191a/0x832368/0x8323da/0x832490 */
}
export function gameUpdateSlice8318a04186c0ReceiverOffset() {
  return (0x18300 + 0x1218) >>> 0; /* 0x19518 */
}
export function gameUpdateSlice8318a0Mode1SlotGate(type1c) {
  /* PE 0x83195a cmp [ebx+0x1c],0x13 / jne 0x83199b — FULL-WORD equality. */
  return (type1c >>> 0) === 0x13 ? 1 : 0;
}
/* ABI v96 (record idx 4, 0x008318a0 modes 1/2/4 decision laws): mirrors of
   the cpp exports. Evidence: disasm-8318a0-full.txt (clean single-span;
   extent 0x8318a0..0x8327bb, int3 pad 0x8327dc, next fn 0x8327e0). The
   SFX-manager base 0xc798e0 is .data BSS (file-backed .data ends
   0xc61800) — OUTSIDE BINARY_LAYOUT: plan globals + byte_7c are ABI-96
   lane requests. */
export function gameUpdateSlice8318a0Mode1ManagerBlockGate(candidateFound, type1c, field14) {
  /* PE 0x831c64..0x831e31: (candidate!=0 || type==0x15) && type!=0x13 &&
     !(type in {0xb,0x10} && field14==0x18304). FULL-DWORD compares. */
  const t = type1c >>> 0;
  if ((candidateFound >>> 0) === 0 && t !== 0x15) return 0;
  if (t === 0x13) return 0;
  if ((t === 0xb || t === 0x10) && (field14 >>> 0) === 0x18304) return 0;
  return 1;
}
export function gameUpdateSlice8318a0Mode1ClearWalkGate(field10, type1c) {
  /* PE 0x831dc6..0x831dea: field10 != -1 FULL-DWORD (0xffff00ff must NOT
     match) || type in {3,0xc,0xd,0xb,0x10}. */
  if ((field10 >>> 0) !== 0xffffffff) return 1;
  const t = type1c >>> 0;
  return (t === 3 || t === 0xc || t === 0xd || t === 0xb || t === 0x10) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode1Player171Store(type1c, field10, player, saved1bb74) {
  /* PE 0x831e09..0x831e1f: store fires iff NOT ((type==0||type==2) &&
     field10 != -1 && player == saved). FULL-DWORD compares. */
  const t = type1c >>> 0;
  if ((t === 0 || t === 2) && (field10 >>> 0) !== 0xffffffff &&
      (player >>> 0) === (saved1bb74 >>> 0)) {
    return 0;
  }
  return 1;
}
export const GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES = 9;
/* ABI v102 (store-plan APPLICATION arm): the module's application
   decision — when the mode-1 manager-block gate opens, the 9 store sites
   of 0x831e31..0x831f34 are all part of the block (mask 0x1ff); gate
   miss -> mask 0 (scratch all-zero). Row 0's PE guard @0x831e5d (node+4
   != 0) is a HOST-apply condition on the element=1 rows. */
export const GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK = 0x1ff;
export function gameUpdateSlice8318a0SfxManagerStorePlan(global798e4, global79790, global7978c, global79948) {
  /* PE 0x831e6d..0x831f2f, 9 stores in program order. element=1 -> queue
     node at 0x684f30() return (mgr_off node-relative); element=0 ->
     mgr-relative BSS offset. Width split on 0xc798e4: BYTE &4 vs DWORD
     >>5. Row encodings corrected at v99 (update-v99-record4-fold): row0
     byte store targets node+4 (mgrOff 0x4); row7 0xc79790 = mgr-0x150 ->
     0xfffffeb0; row8 0xc7978c = mgr-0x154 -> 0xfffffeac. */
  const new79790 = (global79790 >>> 0) - 1 >>> 0; /* 32-bit wrap */
  return [
    { mgrOff: 0x4, size: 1, value: ((global798e4 >>> 5) & 1) >>> 0, element: 1 },
    { mgrOff: 0x0, size: 4, value: global79948 >>> 0, element: 1 },
    { mgrOff: 0x20, size: 4, value: 0, element: 0 },
    { mgrOff: 0x24, size: 4, value: ((global798e4 & 4) === 0 ? 6 : 1) >>> 0, element: 0 },
    { mgrOff: 0x28, size: 4, value: 7, element: 0 },
    { mgrOff: 0x2c, size: 4, value: 1, element: 0 },
    { mgrOff: 0x30, size: 4, value: 7, element: 0 },
    { mgrOff: 0xfffffeb0, size: 4, value: new79790, element: 0 },
    { mgrOff: 0xfffffeac, size: 4, value: new79790 === 0 ? 0 : (global7978c >>> 0), element: 0 },
  ];
}
/* ABI v102 (record idx 4, store-plan APPLICATION arm; NOTES
   update-v102-record4-apply §2/§3): the typed per-row apply plan law —
   mirror of the cpp export. storeMask = 0x1ff (the 9 block sites; the
   module's application decision when the gate opens), rows = the v96
   plan law rows (program order; element=1 -> residual 0x684f30() node,
   element=0 -> 0xc798e0-relative BSS). */
export function gameUpdateSlice8318a0SfxManagerStoreApplyPlan(global798e4, global79790, global7978c, global79948) {
  return {
    storeMask: GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK,
    rows: gameUpdateSlice8318a0SfxManagerStorePlan(global798e4, global79790, global7978c, global79948),
  };
}
/* ABI v102 (record idx 4): the seam oracle of the APPLICATION arm —
   mirror of the cpp gate_1b83c mode-1 branch. Returns the composed
   {storeMask, rows} plan when the seam fires (ready != 0 && mode == 1 &&
   pack ready && count <= ENGINE_PLAYER_MAX && the manager-block gate
   opens on the derived candidate_found), else null (nothing emitted —
   residual byte-for-byte; the @932 +1 event is the only event delta).
   candidate_found derives per entry with the v99 type-0 zero-arm law:
   cleared iff type_1c != 0 && b173 byte clear && (b1398||b139a) byte set
   && (ptr7c==0 || byte34==0) && w3fc FULL-DWORD != 4. The model's step
   parity stays the +1 event (the plan scratch has no model-side layout
   channel — 4212c0-scratch precedent); this oracle is the emission
   mirror the host consumer + tests pin. */
export function opaque8318a0SfxManagerStoreApplyPlan(state = {}, runtimeInputs = {}) {
  if (((runtimeInputs.opaque008318a0Ready ?? 0) >>> 0) === 0) return null;
  if (((runtimeInputs.opaque008318a0Mode ?? 0) >>> 0) !== 1) return null;
  if (((runtimeInputs.opaque8318a0PlayerEntryReady ?? 0) >>> 0) === 0) return null;
  const count = (runtimeInputs.opaque8318a0PlayerEntryCount ?? 0) | 0;
  if (count > ENGINE_PLAYER_MAX) return null;
  const type1c8318a0 = (state.engineField1c ?? 0) | 0;
  let candidateFound = 1;
  for (let i = 0; i < count; i += 1) {
    if (type1c8318a0 !== 0 &&
        ((runtimeInputs.opaque8318a0PlayerEntryB173?.[i] ?? 0) & 0xff) === 0 &&
        (((runtimeInputs.opaque8318a0PlayerEntryB1398?.[i] ?? 0) & 0xff) !== 0 ||
         ((runtimeInputs.opaque8318a0PlayerEntryB139a?.[i] ?? 0) & 0xff) !== 0) &&
        (((runtimeInputs.opaque8318a0PlayerEntryPtr7c?.[i] ?? 0) >>> 0) === 0 ||
         ((runtimeInputs.opaque8318a0PlayerEntryB34?.[i] ?? 0) & 0xff) === 0) &&
        ((runtimeInputs.opaque8318a0PlayerEntryW3fc?.[i] ?? 0) >>> 0) !== 4) {
      candidateFound = 0;
      break;
    }
  }
  if (gameUpdateSlice8318a0Mode1ManagerBlockGate(
    candidateFound, type1c8318a0, (state.engineField14 ?? 0) | 0) === 0) {
    return null;
  }
  return gameUpdateSlice8318a0SfxManagerStoreApplyPlan(
    (runtimeInputs.opaque8318a0SfxGlobal798e4 ?? 0) >>> 0,
    (runtimeInputs.opaque8318a0SfxGlobal79790 ?? 0) >>> 0,
    (runtimeInputs.opaque8318a0SfxGlobal7978c ?? 0) >>> 0,
    (runtimeInputs.opaque8318a0SfxGlobal79948 ?? 0) >>> 0,
  );
}
/* ABI v99 (record idx 4, 0x008318a0 mode-1 walk fold): the per-player
   entry-write mirrors of the cpp exports (byte-gate u32 + &0xff; no
   uint8_t). Evidence: update-v99-record4-fold NOTES §2/§4. */
export function gameUpdateSlice8318a0Mode1WalkEntryZeroArm(type1c, b173, b1398, b139a, ptr7c, b34) {
  /* PE 0x831a19..0x831a59: type==0 FULL-DWORD && score-block reach
     (b173 byte clear; byte (1398|139a)!=0; ptr7c==0 || byte34==0) ->
     byte 0 into [e+0x1398] AND [e+0x139a] (4 write sites). Also the
     reason the candidate_found flag never clears for type==0. */
  if ((type1c >>> 0) !== 0) return 0;
  if ((b173 & 0xff) !== 0) return 0;
  if ((b1398 & 0xff) === 0 && (b139a & 0xff) === 0) return 0;
  if ((ptr7c >>> 0) !== 0 && (b34 & 0xff) !== 0) return 0;
  return 1;
}
export function gameUpdateSlice8318a0Mode1WalkEntry171Zero(type1c, b173, b1398, b139a, ptr7c, b34, w3fc) {
  /* PE 0x831a95..0x831af8: [e+0x171]=0 iff score-block reach && (zero-arm
     || FULL-DWORD w3fc==4). The 0x831a8e probe arm stays host. */
  if (gameUpdateSlice8318a0Mode1WalkEntryZeroArm(type1c, b173, b1398, b139a, ptr7c, b34) !== 0) {
    return 1;
  }
  if ((type1c >>> 0) === 0) return 0;
  if ((b173 & 0xff) !== 0) return 0;
  if ((b1398 & 0xff) === 0 && (b139a & 0xff) === 0) return 0;
  if ((ptr7c >>> 0) !== 0 && (b34 & 0xff) !== 0) return 0;
  return (w3fc >>> 0) === 4 ? 1 : 0;
}
/* ABI v142 (record idx4): the rt_band_pop PURE law — mirror of the cpp
   export isaac_game_update_slice_8318a0_rt_band_pop (contracts-idx4-engine-band
   NOTES §1/§4/§5). depthAfter = pre-1 (32-bit wrap); latchAfter = 0 iff
   depthAfter==0 else the pre latch; params = the five constant stores
   {0, byte[e4]&4==0?6:1, 7, 1, 7} derived purely. The four opaque
   thiscall leaves stay host; nothing here re-derives the v96/v99/v102
   frozen laws — they are consumed BY REFERENCE above. */
export const GAME_UPDATE_SLICE_8318A0_RT_BAND_POP_PARAMS = 5;
export function gameUpdateSlice8318a0RtBandPop(global798e4, global79790, global7978c) {
  const depthAfter = ((global79790 >>> 0) - 1) >>> 0; /* 32-bit wrap */
  return {
    depthAfter,
    latchAfter: depthAfter === 0 ? 0 : global7978c >>> 0,
    params: [0, (global798e4 & 4) === 0 ? 6 : 1, 7, 1, 7],
  };
}
export function gameUpdateSlice8318a0RtBandPopParamsPack(params) {
  return (
    (params[0] & 0xf) |
    ((params[1] & 0xf) << 4) |
    ((params[2] & 0xf) << 8) |
    ((params[3] & 0xf) << 12) |
    ((params[4] & 0xf) << 16)
  ) >>> 0;
}
/* ABI v142 (record idx4): the seam oracle of the rt_band_pop carrier —
   mirror of the cpp gate_1b83c mode-1 branch. Returns the composed
   {depthAfter, latchAfter, paramsPack} payload when the carrier publishes
   (the exact same firing condition as opaque8318a0SfxManagerStoreApplyPlan:
   ready != 0 && mode == 1 && pack ready && count <= ENGINE_PLAYER_MAX &&
   the manager-block gate opens), else null (capture-absence arm: lanes
   stay 0, residual byte-for-byte). Theorem arms pinned by tests + the
   verifier differential: capture-live retires the stateful deltas onto
   the lanes; absent keeps. */
export function opaque8318a0RtBandPopCarrier(state = {}, runtimeInputs = {}) {
  if (((runtimeInputs.opaque008318a0Ready ?? 0) >>> 0) === 0) return null;
  if (((runtimeInputs.opaque008318a0Mode ?? 0) >>> 0) !== 1) return null;
  if (((runtimeInputs.opaque8318a0PlayerEntryReady ?? 0) >>> 0) === 0) return null;
  const count = (runtimeInputs.opaque8318a0PlayerEntryCount ?? 0) | 0;
  if (count > ENGINE_PLAYER_MAX) return null;
  const type1c8318a0 = (state.engineField1c ?? 0) | 0;
  let candidateFound = 1;
  for (let i = 0; i < count; i += 1) {
    if (type1c8318a0 !== 0 &&
        ((runtimeInputs.opaque8318a0PlayerEntryB173?.[i] ?? 0) & 0xff) === 0 &&
        (((runtimeInputs.opaque8318a0PlayerEntryB1398?.[i] ?? 0) & 0xff) !== 0 ||
         ((runtimeInputs.opaque8318a0PlayerEntryB139a?.[i] ?? 0) & 0xff) !== 0) &&
        (((runtimeInputs.opaque8318a0PlayerEntryPtr7c?.[i] ?? 0) >>> 0) === 0 ||
         ((runtimeInputs.opaque8318a0PlayerEntryB34?.[i] ?? 0) & 0xff) === 0) &&
        ((runtimeInputs.opaque8318a0PlayerEntryW3fc?.[i] ?? 0) >>> 0) !== 4) {
      candidateFound = 0;
      break;
    }
  }
  if (gameUpdateSlice8318a0Mode1ManagerBlockGate(
    candidateFound, type1c8318a0, (state.engineField14 ?? 0) | 0) === 0) {
    return null;
  }
  const pop = gameUpdateSlice8318a0RtBandPop(
    (runtimeInputs.opaque8318a0SfxGlobal798e4 ?? 0) >>> 0,
    (runtimeInputs.opaque8318a0SfxGlobal79790 ?? 0) >>> 0,
    (runtimeInputs.opaque8318a0SfxGlobal7978c ?? 0) >>> 0,
  );
  return { ...pop, paramsPack: gameUpdateSlice8318a0RtBandPopParamsPack(pop.params) };
}
export function gameUpdateSlice8318a0Mode1ResetSpanClearWrites(type1c, field14) {
  /* PE 0x831d6c..0x831db4: 0xb/0x10 FULL-DWORD && field_14 == 0x18304
     (mode1_manager_block_gate's reset arm BY REFERENCE) -> every non-null
     span slot gets byte 0x171=0 + byte 0x410=1 (0x831d9b/0x831da2). */
  if ((type1c >>> 0) !== 0xb && (type1c >>> 0) !== 0x10) return 0;
  return (field14 >>> 0) === 0x18304 ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode1TailModeSet(type1c, field10) {
  /* PE 0x831f34..0x831f81: 3 iff type not in the je-0x831f81 set &&
     field10 != -1; else 2. FULL-DWORD cmps. */
  const t = type1c >>> 0;
  if (t === 1 || t === 2 || t === 0xb || t === 0xf || t === 0x10 ||
      t === 0x11 || t === 0x12 || t === 0x13 || t === 0x14 || t === 0x15) {
    return 2;
  }
  return (field10 >>> 0) !== 0xffffffff ? 3 : 2;
}
export function gameUpdateSlice8318a0Mode1Tail830950Call(type1c, field10) {
  /* PE 0x831f71 + 0x831f87..0x831f97: mode_set==3 || type in {0xf,0x15}. */
  if (gameUpdateSlice8318a0Mode1TailModeSet(type1c, field10) === 3) return 1;
  const t = type1c >>> 0;
  return (t === 0xf || t === 0x15) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode2LaneGate(predicate238) {
  /* PE 0x831fa1 cmp dword [ebx+0x238],0 / je 0x83209c — FULL-DWORD. */
  return (predicate238 >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode2DirectTailGate(vecBegin, byte7c) {
  /* PE 0x832024..0x83202e: vec_begin (Game+0x1baa8, the v92 walk span
     begin) != 0 FULL-DWORD && byte_7c != 0 -> direct tail (skip 0x7eb1b0). */
  return (vecBegin >>> 0) !== 0 && (byte7c & 0xff) !== 0 ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode2FastReset(counter, limit) {
  /* PE 0x83209c..0x8320a2 jl — SIGNED, same shared-advance law as mode 3.
     1 = advance; 0 = reset ([ebx+4]=0, [ebx]=3, 0x830950). */
  return (counter | 0) < (limit | 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode2Player418Next(cur418) {
  /* PE 0x832076..0x832086 cmovg — SIGNED max: cur > 0xa ? cur : 0xa. */
  return (cur418 | 0) > 0xa ? (cur418 | 0) : 0xa;
}
export function gameUpdateSlice8318a0Mode4WalkCallGate(byte1398, byte139a, ptr7c, byte34) {
  /* PE 0x8324ce..0x8324f4 — BYTE compares on 0x1398/0x139a and [ptr+0x34]:
     fires iff (b1398||b139a) && (ptr==0 || byte34==0). */
  if ((byte1398 & 0xff) === 0 && (byte139a & 0xff) === 0) return 0;
  if ((ptr7c >>> 0) !== 0 && (byte34 & 0xff) !== 0) return 0;
  return 1;
}
export function gameUpdateSlice8318a0Mode4NameStringGate(byte1398, byte139a) {
  /* PE 0x832539/0x83254f — BYTE gates (0x100 must NOT enter). */
  return ((byte1398 & 0xff) !== 0 || (byte139a & 0xff) !== 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode4FinalResetGate(lastLeave) {
  /* PE 0x83260d test cl,cl / je 0x832663 — LOW BYTE of the accumulated
     value ([ebp-0x50] domain {0,1}: cmove from movzx byte 0x8325aa..
     0x8325c0). 0x100 must NOT run the reset; on the EMPTY walk cl =
     [ebp-0x50] = 1 (byte store 0x832492 UNCOND) -> reset RUNS. */
  return (lastLeave & 0xff) !== 0 ? 1 : 0;
}
export function gameUpdateSlice8318a0WalkPureSkip(begin, end) {
  /* v92 precedent BY REFERENCE: count==0 (SAR 2, full dword) -> every
     record-4 player-walk loop is a proof-complete pure skip. Forwards to
     the 98dba0 span law — never restated. */
  return gameUpdateSlice98dba0WalkPureSkip(begin, end);
}
/* ABI v99 exports-only (idx 4, update-v118-8318a0-leftovers): leftover
   pure decision gates of FUN_008318a0. Transcribed from the instruction
   stream — do NOT derive from the C++. Hit bodies stay typed-host. */
export const TO_8318A0_MODE3_ARM_SET4 = 0;
export const TO_8318A0_MODE3_ARM_ANIM = 1;
export const TO_8318A0_MODE3_ARM_ANIM2 = 2;
export const TO_8318A0_MODE3_ARM_SFX_ANIM = 3;
export const TO_8318A0_MODE3_ARM_WALK_410_ALWAYS = 4;
export const TO_8318A0_MODE3_ARM_WALK_410_COND = 5;
export const TO_8318A0_HOST_VA_7AB380 = 0x007ab380;
export const TO_8318A0_HOST_VA_7AB550 = 0x007ab550;
export function gameUpdateSlice8318a0PickupLatch(ptr234, type28, variant2c) {
  /* PE 0x8318eb test eax,eax / je; 0x8318ef cmp [eax+0x28],0x3c5 / jne;
     0x8318f8 cmp [eax+0x2c],0xa / cmove. FULL-DWORD. Twin 0x831c84. */
  if ((ptr234 >>> 0) === 0) return 0;
  return ((type28 >>> 0) === 0x3c5 && (variant2c >>> 0) === 0xa) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode1ScoreBlockGate(type1c, player, candidate, score) {
  /* PE 0x831b16..0x831b43: type in {0xb,0x10,0x13} FULL-DWORD && player!=0
     && candidate!=0 && SIGNED score>=6 (jl skip). */
  const t = type1c >>> 0;
  if (t !== 0xb && t !== 0x10 && t !== 0x13) return 0;
  if ((player >>> 0) === 0) return 0;
  if ((candidate >>> 0) === 0) return 0;
  return ((score | 0) >= 6) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode1Type13PickupGate(type1c, ptr234, type28, variant2c) {
  /* PE 0x831c75 cmp ecx,0x13 / jne 0x831d6c then 0x3c5/0xa re-check. */
  if ((type1c >>> 0) !== 0x13) return 0;
  return gameUpdateSlice8318a0PickupLatch(ptr234, type28, variant2c);
}
export function gameUpdateSlice8318a0Mode1Type13B64Exit(fieldB64) {
  /* PE 0x831ca6 cmp dword [edi+0xb64],4 / je 0x832663. FULL-DWORD. */
  return ((fieldB64 >>> 0) === 4) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode14ce0f0EsiRemap(ret, type1c) {
  /* PE 0x831ceb add eax,-7; cmp eax,3; ja 0x831d0a UNSIGNED; table
     0x8327cc {2,0,3,lea ecx-0x12}. Recapture. 32-bit wrap. */
  const a = (ret - 7) >>> 0;
  if (a > 3) return (type1c - 0x12) >>> 0;
  if (a === 0) return 2;
  if (a === 1) return 0;
  if (a === 2) return 3;
  return (type1c - 0x12) >>> 0;
}
export function gameUpdateSlice8318a0Mode3MembershipHit(al) {
  /* PE 0x8320ed test al,al / je 0x8321ae. LOW BYTE. 0x100 must NOT hit. */
  return ((al & 0xff) !== 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode3Flag2000000Skip(flags16c) {
  /* PE 0x832130 and ecx,0x2000000 / or / jne skip 0x171. FULL-DWORD bit. */
  return ((flags16c & 0x2000000) !== 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode3Type3StringGate(type1c) {
  /* PE 0x832116 cmp dword [ebx+0x1c],3 / jne. FULL-DWORD. */
  return ((type1c >>> 0) === 3) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode3MissArm(type1c) {
  /* PE 0x8321ae..0x83235d cascade after 82eb90 AL==0. FULL-DWORD. */
  const t = type1c >>> 0;
  if (t === 5 || t === 6 || t === 8 || t === 9 || t === 0xa) return TO_8318A0_MODE3_ARM_ANIM;
  if (t === 7) return TO_8318A0_MODE3_ARM_SFX_ANIM;
  if (t === 0xe) return TO_8318A0_MODE3_ARM_ANIM2;
  if (t === 1 || t === 2 || t === 0x12 || t === 0x14) return TO_8318A0_MODE3_ARM_SET4;
  if (t === 0xb || t === 0x10 || t === 0x11 || t === 0x13) return TO_8318A0_MODE3_ARM_WALK_410_ALWAYS;
  return TO_8318A0_MODE3_ARM_WALK_410_COND;
}
export function gameUpdateSlice8318a0Mode3TrueArm(type1c) {
  /* PE 0x832154 cmp 0xc / 0x832181 cmp 0xd else [ebx]=4. FULL-DWORD. */
  const t = type1c >>> 0;
  if (t === 0xc || t === 0xd) return TO_8318A0_MODE3_ARM_ANIM;
  return TO_8318A0_MODE3_ARM_SET4;
}
export function gameUpdateSlice8318a0Mode3AnimArg(type1c, membershipHit) {
  /* Push-imm at each 0x7ab380/0x7ab550 site. Recapture membership BYTE. */
  const t = type1c >>> 0;
  if ((membershipHit & 0xff) !== 0) {
    if (t === 0xc) return 0x1a6;
    if (t === 0xd) return 0x1b5;
    return 0;
  }
  if (t === 5) return 0xa1;
  if (t === 6) return 0x51;
  if (t === 7) return 0xb;
  if (t === 8) return 0xd4;
  if (t === 9) return 0x137;
  if (t === 0xa) return 0x14c;
  if (t === 0xe) return 0x17;
  return 0;
}
export function gameUpdateSlice8318a0Mode3AnimLive(saved1bb74) {
  /* PE 0x83215c / 0x8321b6 test esi/edi,edi. FULL-DWORD. 0x100 is live. */
  return ((saved1bb74 >>> 0) !== 0) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode3Walk410Cond(field26614) {
  /* PE 0x83239e cmp dword [eax+0x26614],2 / jge skip. SIGNED. */
  return ((field26614 | 0) < 2) ? 1 : 0;
}
export function gameUpdateSlice8318a0Mode3HostVa7ab380() {
  return TO_8318A0_HOST_VA_7AB380;
}
export function gameUpdateSlice8318a0Mode3HostVa7ab550() {
  return TO_8318A0_HOST_VA_7AB550;
}

/* ABI v92: FUN_0098dba0 empty-vector player-walk gate. vector_count mirrors
   PE 0x0098dbd2..0x0098dbde (`mov edx,[end]; sub edx,[begin]; sar edx,2` —
   FULL-dword 32-bit wrap, ARITHMETIC shift). pure_skip is the 0x0098dbe1
   `test edx,edx / jne` + 0x0098dc11 `test eax,eax / je` decision: count==0
   -> the entire walk loop is a proof-complete pure skip; the ONLY host
   content left on the walk residual is the fatal log 0xa112c0. Any nonzero
   SAR count (>=4, NEGATIVE end<begin, or wrapped differences) keeps the walk
   body host. A byte-narrow or unsigned-shift translation diverges on wide
   diffs (mutant plan M1/M2). */
export function gameUpdateSlice98dba0WalkVectorCount(begin, end) {
  const delta = (((end >>> 0) - (begin >>> 0)) >>> 0) << 0 >> 0;
  return delta >> 2;
}
export function gameUpdateSlice98dba0WalkPureSkip(begin, end) {
  return gameUpdateSlice98dba0WalkVectorCount(begin, end) === 0 ? 1 : 0;
}
/* ABI v93: record idx 9 (0x008ef990) iterate-arm JOIN (PE 0x8efc92..0x8efce9).
   skip mirrors 0x008efc96 cmp [edi+8],eax / 0x008efc99 je 0x8efe04: idx8
   == the mode-0xe probe out P -> NO-SFX epilogue exit, zero calls.
   956780Closed mirrors the RTE v13 FUN_00956780 gate law
   (0x9567ae test/je game==0, 0x9567d5 cmp byte [node+0xd]/jne,
   0x9567df cmp dword [node+0x10]/jg signed, 0x9567e9 cmp eax,[esi]/je):
   gate==0 means the prep is a pure no-op and Play 0x92dc30 is the only
   residual host call on the JOIN's SFX path. */
export function gameUpdateSlice8ef990JoinSkip(probe, idx8) {
  return (probe >>> 0) === (idx8 >>> 0) ? 1 : 0;
}

/* ABI v94 (R3 log-split, record idx 10): FUN_0040add0 probe-arm split laws.
   log_needed mirrors PE 0x40addc cmp dword [ebx+4],0 / 0x40ade0 jne —
   FULL-DWORD compare (0x100 must NOT log). probe_pure_false mirrors PE
   0x40adfb test ebx,ebx / 0x40adfd je 0x40ae43 -> al=0: the empty-list
   probe is PURE-FALSE — the post-log MISS law, reachable on BOTH field_4
   arms because the log falls through into the probe flow (no field_4
   gate, unlike the old needs_host conflation). */
export function gameUpdateSlice4212c0Add0LogNeeded(field4) {
  return (field4 >>> 0) === 0 ? 1 : 0;
}
export function gameUpdateSlice4212c0Add0ProbePureFalse(listCount) {
  return (listCount >>> 0) === 0 ? 1 : 0;
}

/* ABI v96 (record idx 10 R2, 0x004212c0): the true-probe interior PREFIX
   decision law — blob-gated pure arm per the v92 98dba0-walk precedent.
   PE 0x421343..0x4213cd (wait-gate 0x4213cd/0x4213d3): 9 manager stores +
   the volume ucomiss gate + the 0x6fd7c0 edge + the 0x8318a0 call-mode.
   The interior host edge (0x92e430 / 0x6fd7c0 / 0x8318a0) STAYS; these
   laws pin what the prefix DOES with today's lanes. probeReady==0 is the
   capture-absence always-host boundary (reached returns 0; the v91 host
   edge keeps firing). The probe-false inversion mirrors the apply site
   BY REFERENCE to the frozen frame-opaque 40add0 laws: miss -> false;
   equal-flags arm (ready && count<=64) -> probe_from_equal_flags;
   resolved arm (probe_resolved && match_index>=0) -> bit_result;
   undecided (walk-live) -> NOT provably reached (0). */
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_STORE_MASK = 0x1ff;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_STORE_COUNT = 9;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS = 0x3f800000;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_SE14_BITS = 0x3ba3d70a;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG0 = 0xffffffff;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG1 = 0x0;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG2 = 0x1;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG3 = 0xffffffff;
export const GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG4 = 0xfffffff6;

export function gameUpdateSlice4212c0TrueProbeReached(
  probeReady, probeResolved, equalFlagsReady, equalFlags, listCount, matchIndex, bitfield18
) {
  if ((probeReady >>> 0) === 0) return 0; /* blob-gate: no capture -> host boundary */
  if (gameUpdateSlice4212c0Add0ProbePureFalse(listCount >>> 0) !== 0) return 0;
  if ((equalFlagsReady >>> 0) !== 0 && (listCount >>> 0) <= FRAME_OPAQUE_40ADD0_MAX_ENTRIES) {
    return frameOpaque40add0ProbeFromEqualFlags(equalFlags, listCount >>> 0, bitfield18 >>> 0) ? 1 : 0;
  }
  if ((probeResolved >>> 0) !== 0 && (matchIndex | 0) >= 0) {
    return frameOpaque40add0BitResult(bitfield18 >>> 0, matchIndex | 0) ? 1 : 0;
  }
  return 0; /* undecided — the host walk resolves the probe */
}

/* The 0x4213d3 wait-gate law: the record-4 mode dispatch decides whether
   the 8318a0 call is a PURE epilogue (PE 0x831902..0x831908 dec/cmp 3/ja
   0x8326a1 — FULL-DWORD, body_case BY REFERENCE). ready==0 keeps the v87
   always-host. */
export function gameUpdateSlice4212c0TrueProbe8318a0Drop(gateReady, mode) {
  if ((gateReady >>> 0) === 0) return 0;
  return gameUpdateSlice8318a0BodyCase(mode >>> 0) === 0 ? 1 : 0;
}

/* The COMPOSED interior prefix plan. reached is consumed from
   true_probe_reached; the store mask, the volume gate (bit-exact
   0x3f800000 — ucomiss compares VALUES, NaN/-0.0 can never equal 1.0f),
   the se+0x14 store and the five 0x6fd7c0 args are PE constants;
   call_8318a0_drop comes from the wait-gate law. Returns reached. The
   manager blob has NO layout lanes — ABI-96 §lane-requests. */
export function gameUpdateSlice4212c0TrueProbePrefixPlan(input = {}) {
  const reached = gameUpdateSlice4212c0TrueProbeReached(
    input.probeReady | 0, input.probeResolved | 0, input.equalFlagsReady | 0,
    input.equalFlags, input.listCount | 0, input.matchIndex | 0, input.bitfield18 | 0,
  );
  const volumeBits = input.volumeBits >>> 0;
  const eq = volumeBits === GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS ? 1 : 0;
  return {
    reached,
    storeMask: reached !== 0 ? GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_STORE_MASK : 0,
    volumeEqOne: eq,
    host92e430Needed: eq === 0 ? 1 : 0,
    volumeAfterGate: eq !== 0 ? volumeBits : GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS,
    se14Bits: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_SE14_BITS,
    sixfd7c0Arg0: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG0,
    sixfd7c0Arg1: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG1,
    sixfd7c0Arg2: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG2,
    sixfd7c0Arg3: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG3,
    sixfd7c0Arg4: GAME_UPDATE_SLICE_4212C0_TRUE_PROBE_6FD7C0_ARG4,
    call8318a0Drop: gameUpdateSlice4212c0TrueProbe8318a0Drop(
      input.gate8318a0Ready | 0, input.gate8318a0Mode | 0),
  };
}

/* ABI v96 (record idx 10 R2, v98 interior LIVE seam): standalone oracle
   for the blob-gated interior decision on the APPLY surface — reads the
   LIVE runtime lanes exactly as applyFrameOpaque4212c0Pure does (probe +
   equal-flags blob + the true-probe SFX-manager blob volume_bits + the
   record-4 gate lanes opaque008318a0Ready/_mode for the 8318a0 drop).
   Returns the composed prefix plan when the interior arm fires (blob
   ready + probe ready + probe TRUE + no fatal log), else null (the
   pre-v96 monolithic host edge stays byte-for-byte). */
export function frameOpaque4212c0TrueProbeInteriorPlan(state = {}, runtimeInputs = {}) {
  const probeReady = runtimeInputs.frameOpaque4212c0ProbeReady >>> 0;
  const probeResolved = runtimeInputs.frameOpaque4212c0ProbeResolved >>> 0;
  const equalFlagsReady = runtimeInputs.frameOpaque4212c0Add0EqualFlagsReady >>> 0;
  const listCount = runtimeInputs.frameOpaque4212c0Add0ListCount >>> 0;
  const matchIndex = runtimeInputs.frameOpaque4212c0Add0MatchIndex | 0;
  const bitfield18 = runtimeInputs.frameOpaque4212c0Add0Bitfield18 >>> 0;
  if (probeReady === 0) return null;
  if (gameUpdateSlice4212c0Add0LogNeeded(runtimeInputs.frameOpaque4212c0Add0Field4 >>> 0) !== 0) {
    return null; /* the platform log keeps the host; @936 must not fire */
  }
  if ((runtimeInputs.frameOpaque4212c0TrueProbeReady >>> 0) === 0) return null;
  const reached = gameUpdateSlice4212c0TrueProbeReached(
    probeReady, probeResolved, equalFlagsReady,
    runtimeInputs.frameOpaque4212c0Add0EqualFlags,
    listCount, matchIndex, bitfield18,
  );
  if (reached === 0) return null; /* walk-live undecided -> host walk */
  return gameUpdateSlice4212c0TrueProbePrefixPlan({
    probeReady, probeResolved, equalFlagsReady,
    equalFlags: runtimeInputs.frameOpaque4212c0Add0EqualFlags,
    listCount, matchIndex, bitfield18,
    volumeBits: runtimeInputs.frameOpaque4212c0TrueProbeVolumeBits >>> 0,
    gate8318a0Ready: runtimeInputs.opaque008318a0Ready >>> 0,
    gate8318a0Mode: runtimeInputs.opaque008318a0Mode >>> 0,
  });
}

/* ---- ABI v95 (record idx 23 opaqueRoomUpdateClearPath) pure laws ----
   PE-truth transcribed from cpu-dump 00804180.txt (0x00804212..0x0080424d
   and the always-run type-5 door loop 0x008042be..0x008042f3); do NOT
   derive from the C++ or the game_update_slice.cpp wire. FUN_00710dd0's
   open tail stays typed-host (v25 pin). */

/* flag_gate: 1 = the machine clears bit 0 of the per-player Manager flag.
   PE 0x00804214 cmp eax,0xd / 0x00804217 je SKIP — FULL-DWORD equality
   (0x1000000d must NOT skip); 0x00804219 cmp eax,1 jl CLEAR and
   0x0080421e cmp eax,6 jg CLEAR — SIGNED range; 0x0080422b and ecx,
   0x10000 / 0x00804233 jne SKIP — bit16 of Game+0x2654c closes the gate
   only for modes 1..6. */
export function clearPathFlagGate(gameMode, flags2654c) {
  if ((gameMode >>> 0) === 0xd) return 0;
  const mode = gameMode | 0; /* signed for the jl/jg range */
  if (mode < 1 || mode > 6) return 1;
  return ((flags2654c >>> 0) & 0x10000) === 0 ? 1 : 0;
}

/* flag_mask: PE 0x00804245 and dword [..], 0xfffffffe — clears bit 0 only. */
export function clearPathFlagMask() {
  return 0xfffffffe;
}

/* flag_target: Manager + [Manager+0x29fbc]*0x184 + 0x2a12c, 32-bit wrap
   (PE 0x0080423b imul eax,[ecx+0x29fbc],0x184; 0x00804245 [eax+ecx+
   0x2a12c]). */
export function clearPathFlagTarget(managerBase, count29fbc) {
  return (((managerBase >>> 0) + ((count29fbc >>> 0) * 0x184) + 0x2a12c) >>> 0);
}

/* door_result_merge: post-door type-5 decision. The machine ALWAYS runs the
   type-5 door loop after the clear path; when the clear-path door residual
   ran (anyNeedsHost) door +0x8/+0xc may be mutated, so the pre-clear
   snapshot cannot gate the type-5 loop — host forced. Otherwise the
   pure-gated type-5 decision stands. 1 = emit type-5 door host residual. */
export function clearPathDoorResultMerge(anyNeedsHost, type5NeedsHost) {
  return ((anyNeedsHost | 0) !== 0 || (type5NeedsHost | 0) !== 0) ? 1 : 0;
}

/* ---- ABI v95 (record idx 33 opaqueRoomUpdateClearDoors): type-5 door
   loop frame laws (forced-arm census update-v95-clear-doors-type5/NOTES.md;
   PE-truth from cpu-dump 00804230.txt 0x008042be..0x008042f3 — do NOT
   derive from the C++). The FORCED arm (clear-path door residual ran) runs
   the SAME 8-slot loop over POST-clear door states; the qualifying set is
   host-time (open writes field_c=5), so the forced arm publishes NO typed
   plan. The GATED arm (snapshot valid) types the door open calls. ---- */

/* loop_count: count bound. PE 0x8042be mov eax,8; the loop counter is
   STORED to [ebp-0x98c] (0x8042c9/0x8042ed) and RELOADED after the call
   (0x8042e1) — bound re-derived per iteration, never folded once. */
export function gameUpdateSliceType5DoorLoopCount() {
  return 8;
}

/* door_open_needed: per-door state. PE 0x8042d2 test ecx,ecx / je skip
   (FULL-DWORD null); 0x8042d6 cmp dword [ecx+0xc],5 / jne skip (FULL-DWORD
   field_c == 5). NO low-byte narrowing: 0x100 present qualifies; field_c
   0x1000005 / 0xffffffff do NOT. */
export function gameUpdateSliceType5DoorOpenNeeded(present, fieldC) {
  return ((present >>> 0) !== 0 && (fieldC | 0) === 5) ? 1 : 0;
}

/* host_va / stack_arg_count: arg prep. PE 0x8042dc call 0x710dd0 —
   thiscall ecx = door ptr, 0 stack args. The call stays TYPED HOST. */
export function gameUpdateSliceType5DoorOpenHostVa() {
  return 0x00710dd0;
}
export function gameUpdateSliceType5DoorOpenStackArgCount() {
  return 0;
}

/* ABI v99 leaf peel (idx 23): FUN_00710dd0 OPEN TAIL prefix
   0x00710e0d..0x00710e51. Transcribed from the instruction stream.
   0x748760 stays typed-host. */
export const DOOR_710DD0_OPEN_TAIL_HOST_VA_748760 = 0x00748760;
export function gameUpdateSlice710dd0OpenTailArm0b(field160) {
  /* PE 0x710e19 cmp ebx,0xb / jne. FULL-DWORD. */
  return (field160 >>> 0) === 0xb ? 1 : 0;
}
export function gameUpdateSlice710dd0OpenTailBl(field15c) {
  /* PE 0x710e22 cmp 7 / je; 0x710e27 cmp 8 / je. FULL-DWORD. */
  const v = field15c >>> 0;
  return (v === 7 || v === 8) ? 1 : 0;
}
export function gameUpdateSlice710dd0OpenTailSkipAfter748760(hostAl, field392, bl) {
  /* PE 0x710e43 test al,al / jne join; cmp byte [esi+0x392],al / jne join;
     test bl,bl / je RET. LOW-BYTE all three. */
  if (((hostAl >>> 0) & 0xff) !== 0) return 0;
  if (((field392 >>> 0) & 0xff) !== 0) return 0;
  if (((bl >>> 0) & 0xff) !== 0) return 0;
  return 1;
}
export function gameUpdateSlice710dd0OpenTailHostVa748760() {
  return DOOR_710DD0_OPEN_TAIL_HOST_VA_748760;
}

/* ABI v99 exports-only (idx 23, update-v112-710dd0-rest): FUN_00710dd0
   OPEN TAIL REST 0x00710e51..0x00710f64. Transcribed from the instruction
   stream — do NOT derive from the C++. Complete helpers 0x5cd5f0 /
   0x710f70 / 0x711740 (predicate 0x711740..0x71177f). 0x748760 /
   0x740bc0 / jmp 0x70ee40 / Game+0x2654c store stay typed-host. */
export const DOOR_710DD0_HOST_VA_5CD5F0 = 0x005cd5f0;
export const DOOR_710DD0_HOST_VA_710F70 = 0x00710f70;
export const DOOR_710DD0_HOST_VA_740BC0 = 0x00740bc0;
export const DOOR_710DD0_HOST_VA_711740 = 0x00711740;
export const DOOR_710DD0_HOST_VA_70EE40 = 0x0070ee40;
export const DOOR_710DD0_JOIN_FLAG_OR_MASK = 0x20000;
export const DOOR_710DD0_JOIN_BOSS_FIELD8 = 1;
export const DOOR_710DD0_JOIN_ELSE_FIELD8 = 8;
export const DOOR_710DD0_JOIN_ELSE_FIELD_C = 2;
export const DOOR_710DD0_711740_FALSE_FIELD_C = 5;
export const DOOR_710DD0_GETROOM_ARG1 = 0xffffffff;

export function gameUpdateSlice5cd5f0(field15c, field160, arg) {
  /* PE 0x5cd5f6/0x5cd5fe FULL-DWORD equality vs arg. */
  const a = arg >>> 0;
  return ((field15c >>> 0) === a || (field160 >>> 0) === a) ? 1 : 0;
}
export function gameUpdateSlice710f70(field160, game18334, game269c8) {
  /* PE 0x710f73 cmp edx,0x17 FULL-DWORD; thresh = 10 + (269c8==3);
     SIGNED jge miss -> 1. */
  if ((field160 >>> 0) !== 0x17) return 0;
  const thresh = 0xa + (((game269c8 >>> 0) === 3) ? 1 : 0);
  return ((game18334 | 0) < thresh) ? 1 : 0;
}
export function gameUpdateSlice711740(field394, game18308, mgrBegin, mgrEnd, field154) {
  /* PE 0x71174b FULL-DWORD; begin==end -> 1; sar-2 then UNSIGNED jbe 1;
     else seta field154 > 0x1e UNSIGNED. */
  if ((field394 >>> 0) !== (game18308 >>> 0)) return 1;
  if ((mgrBegin >>> 0) === (mgrEnd >>> 0)) return 1;
  const count = (((mgrEnd >>> 0) - (mgrBegin >>> 0)) | 0) >> 2;
  if ((count >>> 0) <= 1) return 1;
  return ((field154 >>> 0) > 0x1e) ? 1 : 0;
}
export function gameUpdateSlice710dd0JoinFlagOr20000(field8) {
  /* PE 0x710e5a cmp eax,5. FULL-DWORD. */
  return (field8 >>> 0) === 5 ? 1 : 0;
}
export function gameUpdateSlice710dd0JoinFlagOrMask() {
  return DOOR_710DD0_JOIN_FLAG_OR_MASK;
}
export function gameUpdateSlice710dd0JoinBossClose(field8, field160, field394, game18370) {
  /* PE 0x710e7e/0x710e87/0x710e9f. FULL-DWORD all three. */
  return ((field8 >>> 0) === 6
    && (field160 >>> 0) === 4
    && (field394 >>> 0) === (game18370 >>> 0)) ? 1 : 0;
}
export function gameUpdateSlice710dd0JoinBossField8() {
  return DOOR_710DD0_JOIN_BOSS_FIELD8;
}
export function gameUpdateSlice710dd0JoinElseField8() {
  return DOOR_710DD0_JOIN_ELSE_FIELD8;
}
export function gameUpdateSlice710dd0JoinElseFieldC() {
  return DOOR_710DD0_JOIN_ELSE_FIELD_C;
}
export function gameUpdateSlice710dd0Arm15c0b(field15c) {
  /* PE 0x710ebd cmp eax,0xb. FULL-DWORD. */
  return (field15c >>> 0) === 0xb ? 1 : 0;
}
export function gameUpdateSlice710dd0SkipAfter15c0b(game265e8, field392) {
  /* PE 0x710ec7/0x710ed0 LOW-BYTE. RET iff 265e8!=0 AND 392==0. */
  if (((game265e8 >>> 0) & 0xff) === 0) return 0;
  if (((field392 >>> 0) & 0xff) !== 0) return 0;
  return 1;
}
export function gameUpdateSlice710dd0RestField8Arm(field8) {
  /* PE 0x710ee8/eed/f0d. FULL-DWORD. 4/6/1 else 0 (fall to 8-test). */
  const v = field8 >>> 0;
  if (v === 4) return 4;
  if (v === 6) return 6;
  if (v === 1) return 1;
  return 0;
}
export function gameUpdateSlice710dd0RestField8Eq8(field8) {
  /* PE 0x710f2b cmp [esi+8],8. FULL-DWORD re-read. */
  return (field8 >>> 0) === 8 ? 1 : 0;
}
export function gameUpdateSlice710dd0Room40Ja(room40) {
  /* PE 0x710f25 cmp [eax+0x40],0 / ja. UNSIGNED. */
  return (room40 >>> 0) > 0 ? 1 : 0;
}
export function gameUpdateSlice710dd0711740FalseFieldC() {
  return DOOR_710DD0_711740_FALSE_FIELD_C;
}
export function gameUpdateSlice710dd0GetroomArg1() {
  return DOOR_710DD0_GETROOM_ARG1;
}
export function gameUpdateSlice710dd0HostVa5cd5f0() {
  return DOOR_710DD0_HOST_VA_5CD5F0;
}
export function gameUpdateSlice710dd0HostVa710f70() {
  return DOOR_710DD0_HOST_VA_710F70;
}
export function gameUpdateSlice710dd0HostVa740bc0() {
  return DOOR_710DD0_HOST_VA_740BC0;
}
export function gameUpdateSlice710dd0HostVa711740() {
  return DOOR_710DD0_HOST_VA_711740;
}
export function gameUpdateSlice710dd0HostVa70ee40() {
  return DOOR_710DD0_HOST_VA_70EE40;
}


/* type5_door_open_plan: per qualifying door (present && field_c==5 && the
   FUN_00710dd0 early-out prologue NOT taken — the callee's own pure no-op
   gate, stepDoorHelper710dd0EarlyOut) {slot_index, present, field_3a0,
   field_8, field_c} in machine slot order. count == the any_type5_needs_host
   predicate, so the plan fires exactly with the coarse event on the gated
   arm. */
export function type5DoorOpenPlan(inputSlots) {
  const count = gameUpdateSliceType5DoorLoopCount();
  const doors = [];
  for (let i = 0; i < count; i += 1) {
    const s = (inputSlots || [])[i] || {};
    const present = s.present | 0;
    const field3a0 = s.field3a0 | 0;
    const field8 = s.field8 | 0;
    const fieldC = s.fieldC | 0;
    if (gameUpdateSliceType5DoorOpenNeeded(present, fieldC) === 0) continue;
    if (stepDoorHelper710dd0EarlyOut(field3a0, field8, fieldC) !== 0) continue;
    doors.push({
      slotIndex: i,
      present: present >>> 0,
      field3a0: field3a0 >>> 0,
      field8: field8 | 0,
      fieldC: fieldC | 0,
    });
  }
  return { count: doors.length, doors };
}

/* ---- ABI v95 (record idx 41 opaqueRoomUpdateTailEntity): B18 entity walk
   FRAME oracle laws (PE 0x00805527..0x008055a7, census
   update-v95-r41-entity-walk/NOTES.md; room-family laws consumed BY
   REFERENCE — room-pure-model.mjs roomB18*). The walk runs when the
   pre-clear Room+0x7894 low byte is nonzero; count is RE-READ from
   Room+0x1264 EVERY iteration (0x805598 cmp esi,[edi+0x1264] / jb —
   never folded once). The three entity update bodies (0x6e17c0 type-5 /
   0xaf08b1 __RTDynamicCast / 0x6da530 path-B) stay TYPED-HOST. ---- */

export const B18_ENTITY_MAX = 64;
export const B18_ACTION_SKIP = 0;
export const B18_ACTION_TYPE5 = 1;
export const B18_ACTION_RTTI_CANDIDATE = 2;
export const B18_RTTI_SRC_PTR = 0x00c5d5dc;
export const B18_RTTI_DST_PTR = 0x00c5d6ac;
export const B18_HOST_VA_TYPE5 = 0x006e17c0;
export const B18_HOST_VA_RTTI = 0x00af08b1;
export const B18_HOST_VA_PATH_B = 0x006da530;

/* list_empty: FULL-DWORD count==0 (PE 0x805532 cmp dword [edi+0x1264],
   esi / jbe) — 0x100 is NOT empty. */
export function gameUpdateSliceB18ListEmpty(count1264) {
  return roomB18ListEmpty(count1264);
}

/* list_continue: (index+1) < count UNSIGNED (PE 0x805597 inc esi /
   0x805598 cmp esi,[edi+0x1264] / jb) — bound re-derived per iteration,
   never folded once; the PE `inc esi` WRAPS at 32 bits, so 0xffffffff+1
   -> 0 (the room JS mirror does not wrap; re-narrow here to match the
   cpp law + the machine). */
export function gameUpdateSliceB18ListContinue(index, count1264) {
  const next = ((index + 1) >>> 0);
  return next < (count1264 >>> 0) ? 1 : 0;
}

/* entity_is_type5: FULL-DWORD type==5 (PE 0x80554c cmp edx,5 / jne) —
   0x105 is NOT type 5. */
export function gameUpdateSliceB18EntityIsType5(entityType28) {
  return roomB18EntityIsType5(entityType28);
}

/* entity_type1_mode_gate: mode>=2 SIGNED (PE 0x80555d cmp dword
   [eax+0x26614],2 / jl) && type==1 FULL-DWORD (0x805566 cmp edx,1 / je).
   mode 0x80000000 (negative) -> 0; type 0x101 -> 0. The mode lane is
   coerced to int32 (the PE compares the SIGNED dword; the room JS mirror
   compares raw JS numbers, so we re-narrow here to match the cpp). */
export function gameUpdateSliceB18EntityType1ModeGate(mode, entityType28) {
  return roomB18EntityType1ModeGate(mode | 0, entityType28);
}

/* entity_type_in_range: (type-10)u32 < 0x3de UNSIGNED (PE 0x80556b lea
   eax,[edx-0xa] / cmp eax,0x3dd / ja) — types [10,999]; 0x80000000 is NOT
   in range (a signed read would misfire). */
export function gameUpdateSliceB18EntityTypeInRange(entityType28) {
  return roomB18EntityTypeInRange(entityType28);
}

export function gameUpdateSliceB18EntityPathBCandidate(mode, entityType28) {
  return roomB18EntityPathBCandidate(mode | 0, entityType28);
}

/* entity_action: SKIP(0) / TYPE5(1) / RTTI_CANDIDATE(2), PE order. */
export function gameUpdateSliceB18EntityAction(mode, entityType28) {
  return roomB18EntityAction(mode | 0, entityType28);
}

/* path_b_needs_host: FULL-DWORD cast != 0 (PE 0x80558c test eax,eax /
   je) — 0x100 must fire 0x6da530. */
export function gameUpdateSliceB18PathBNeedsHost(rttiCastResult) {
  return roomB18PathBNeedsHost(rttiCastResult);
}

export function gameUpdateSliceB18RttiSrcPtr() {
  return B18_RTTI_SRC_PTR >>> 0;
}
export function gameUpdateSliceB18RttiDstPtr() {
  return B18_RTTI_DST_PTR >>> 0;
}

/* walk_frame: composed frame — re-derives count/bound per iteration
   (list_continue), applies the per-entity decision (entity_action), folds
   host-captured cast results into path-B calls (path_b_needs_host).
   Returns {type5Calls, rttiCasts, pathbCalls, skipCount, walked,
   pureComplete}. count==0 under an open gate -> pureComplete=1 (ZERO host
   calls; the coarse event drops on that arm). */
export function gameUpdateSliceB18WalkFrame({
  count = 0, mode = 0, types = [], castResults = [], maxEntities = B18_ENTITY_MAX,
} = {}) {
  const out = { type5Calls: 0, rttiCasts: 0, pathbCalls: 0, skipCount: 0, walked: 0, pureComplete: 0 };
  const c = count | 0;
  if (c === 0) {
    out.pureComplete = 1;
    return out;
  }
  const cap = Math.min(c, maxEntities | 0);
  const typesArr = Array.isArray(types) ? types : [];
  const castsArr = Array.isArray(castResults) ? castResults : [];
  let i = 0;
  for (;;) {
    const type28 = typesArr[i] | 0;
    const action = gameUpdateSliceB18EntityAction(mode, type28);
    if (action === B18_ACTION_TYPE5) {
      out.type5Calls += 1;
    } else if (action === B18_ACTION_RTTI_CANDIDATE) {
      out.rttiCasts += 1;
      if (gameUpdateSliceB18PathBNeedsHost(castsArr[i] | 0) !== 0) {
        out.pathbCalls += 1;
      }
    } else {
      out.skipCount += 1;
    }
    out.walked += 1;
    if (gameUpdateSliceB18ListContinue(i, cap) === 0) break;
    i += 1;
  }
  return out;
}

/* ABI v95 (record idx 39 mid-restock HOST_FATAL): RNG::RandomInt zero-seed
   law. PE-truth from cpu-dump 007e9020.txt: 0x007e9026 mov edx,[esi] /
   0x007e9028 test edx,edx / 0x007e902a jne 0x7e9042 — FULL-DWORD compare
   on the captured desc+0x58 seed (0x100 must NOT fatal). seed==0 runs the
   0xa112c0 CRT fatal ('RNG Seed is zero!\n' @0xb6bf54) + int3 @0x007e9041
   with ZERO preceding game-memory stores — the mid-restock wire DROPS the
   restock (no desc+0xae write, no monolithic rerun; typed event
   `midRestockSeedZeroDrop`, coordinator layout merge). */
export function gameUpdateSliceMidRestockSeedZero(seed58) {
  return (seed58 >>> 0) === 0 ? 1 : 0;
}

/* ---- ABI v123 (record idx 38 opaqueRoomUpdateTailMid706cExpire):
   shop-restock body 0x008158a0 (Room::ShopRestockPartial) LAW PACK —
   exports-only landing (update-v123-706c-restock-laws; ADDENDUM 3 F1-F4
   in section-notes/update-84c170-tail/NOTES.md). Fresh linear decode
   cpu-dump/008158a0.txt re-verified branch-by-branch: extent
   0x008158a0..0x00815ad0, thiscall this=Room (esi), no stack args.
   Site PE 0x00805403 after the landed countdown gate. The walk math is
   deterministic given captured inputs; the typed-host residual classes
   (F4) keep the boundary counted — the coarse counter STAYS and fires
   exactly as before (capture contract NOT wired into the emission site
   this unit; layouts frozen, ABI stays 99). ---- */

/* xorshift shift keys: .rdata 0xb1f54c/50/54 = {2,7,7} (IMMUTABLE,
   byte-verified against tools/isaac-ng.unpacked.exe raw 0x71db4c). */
export const SHOP_RESTOCK_XORSHIFT_S1 = 2;
export const SHOP_RESTOCK_XORSHIFT_S2 = 7;
export const SHOP_RESTOCK_XORSHIFT_S3 = 7;
export const SHOP_RESTOCK_POS_MUL_40 = 40.0; /* f32 0xbaa904 */
export const SHOP_RESTOCK_POS_X_ADD_40 = 40.0; /* addss xmm1 (same const) */
export const SHOP_RESTOCK_POS_Y_ADD_120 = 120.0; /* f32 0xbaaa00 */
export const SHOP_RESTOCK_ITEM_ID_MAX = 0x1bf; /* UNSIGNED ja skip 0x81599c..a2 */
export const SHOP_RESTOCK_COUNTER_CAP = 0xff; /* jae skip 0x81591c..1e */
export const SHOP_RESTOCK_HOST_VA_CREATE = 0x00428b20; /* x2 per item */
export const SHOP_RESTOCK_HOST_VA_GENRAND_GETTER = 0x006eef60;
export const SHOP_RESTOCK_HOST_VA_WARN_FMT = 0xb6c8e4;

/* shop gate: PE 0x8158ab cmp [esi+8],eax / 0x8158ae cmp eax,2 /
   0x8158b1 jne warn-tail — FULL-DWORD [Room+8]==2. Mismatch -> level-1
   warn log 0xa112c0(1, fmt 0xb6c8e4, arg=[Room+8]) then NORMAL ret. */
export function gameUpdateSlice706cShopGate(roomType8) {
  return ((roomType8 >>> 0) === 2) ? 1 : 0;
}

/* bucket select: PE 0x8158e0..0x81590b — parity = cursor & 1 (and edx,1);
   idx = (cursor >>> 1) & ((count - 1) >>> 0) UNSIGNED shr/and (dec eax /
   shr ecx,1 / and ecx,eax). Pair table [[Room+0x7074] + idx*4];
   item_id = pair[parity*8]; cell_ptr = pair[parity*8 + 4]. */
export function gameUpdateSlice706cBucketParity(cursor) {
  return cursor & 1;
}
export function gameUpdateSlice706cBucketIndex(cursor, count) {
  return ((cursor >>> 1) & ((count - 1) >>> 0)) >>> 0;
}

/* cell counter: PE 0x81590e..0x815922 — cell_ptr SIGNED >= 0 gates
   (test ecx,ecx / js skip); byte compare al,0xff / jae skips at cap
   (UNSIGNED); inc otherwise. A 0xff byte must stay 0xff. */
export function gameUpdateSlice706cCounterIncCap255(byteVal) {
  const b = byteVal & 0xff;
  return b < 0xff ? b + 1 : b;
}

/* grid pos: PE 0x815929..0x815997 — cdq/idiv [esi+0xc] SIGNED (x86
   TRUNCATES toward zero; remainder has the dividend's sign), then
   cvtdq2ps/mulss 40.0f/addss -> posX adds another 40.0f (xmm1),
   posY adds 120.0f (0xbaaa00). Each op rounds to f32. */
export function gameUpdateSlice706cIdivQuot(itemId, width) {
  return Math.trunc((itemId | 0) / (width | 0)) | 0;
}
export function gameUpdateSlice706cIdivRem(itemId, width) {
  const q = Math.trunc((itemId | 0) / (width | 0));
  return ((itemId | 0) - q * (width | 0)) | 0;
}
export function gameUpdateSlice706cPosX(rem) {
  return Math.fround(Math.fround(Math.fround(rem) * 40.0) + 40.0);
}
export function gameUpdateSlice706cPosY(quot) {
  return Math.fround(Math.fround(Math.fround(quot) * 40.0) + 120.0);
}

/* item-def vcall arm: PE 0x81599c..0x8159b4 — id <= 0x1bf UNSIGNED (ja)
   && slot [Room + id*4 + 0x24] != 0 (test/je). Call [[slot]+0x14]
   (slot, 1, &descriptor) — RESULT DISCARDED (effect-freedom unproven,
   F4 blocker 2). */
export function gameUpdateSlice706cVcallArm(slotPtr, itemId) {
  if ((itemId >>> 0) > 0x1bf) return 0;
  return ((slotPtr >>> 0) !== 0) ? 1 : 0;
}

/* hash fatal twin: PE 0x8159b7..0x8159ca (in-loop) AND the flush-tail
   twin 0x815a7f..0x815a92 (REACHABLE incl. empty-loop count==0 via the
   je @0x8158da) — edi==0 fires log 0xa112c0(0x10, "RNG Seed is zero!\n"
   @0xb6bf54) + int3, NORETURN. Typed-drop predicate (midRestock precedent). */
export function gameUpdateSlice706cHashZero(hashIn) {
  return (hashIn >>> 0) === 0 ? 1 : 0;
}

/* xorshift step: PE 0x8159cb..0x8159ea / tail twin 0x815a93..0x815aab —
   x ^= x >>> s1; x ^= x << s2; x ^= x >>> s3 with {2,7,7} (u32 wrap;
   single chain across iterations + flush). */
export function gameUpdateSlice706cXorshiftStep(x) {
  let v = x >>> 0;
  v = (v ^ (v >>> SHOP_RESTOCK_XORSHIFT_S1)) >>> 0;
  v = (v ^ ((v << SHOP_RESTOCK_XORSHIFT_S2) >>> 0)) >>> 0;
  v = (v ^ (v >>> SHOP_RESTOCK_XORSHIFT_S3)) >>> 0;
  return v >>> 0;
}

/* ABI v127 (update-v127-706c-restock-removal): COMPOSED shop-restock walk
   frame (ADDENDUM-3 F3) — runs the whole 0x8158a0 body in-module under
   the shopRestockReady voucher. Branch-by-branch = F2 decode: shop gate
   (warn + NORMAL ret on miss); hash-zero fatal TWIN at ENTRY (reachable
   incl empty loop via je @0x8158da) -> typed drop, everything else 0;
   per-item loop: bucket select (parity/index laws), cell counter inc cap
   255 (host copy-back applies), idiv_pos + f32 pos (host create args),
   vcall arm (host voucher row), mid-loop hash-zero twin, xorshift{2,7,7}
   single chain, create1 + create2 counts (genrand passthrough row),
   cursor advance/reset + count decrement. Flush tail: hash-zero twin +
   final xorshift -> hashOut. copyBackReady = 1 (capture-precedence: the
   next frame's fresh capture supersedes counter/cursor/hash copy-back). */
export const SHOP_RESTOCK_MAX = 32;
export function gameUpdateSlice706cRestockFrame(input = {}) {
  const roomType8 = input.roomType8 >>> 0;
  if (gameUpdateSlice706cShopGate(roomType8) === 0) {
    return { warn: 1, seedZeroDrop: 0, create1: 0, create2: 0, copyBackReady: 0, hashOut: input.hashIn >>> 0, cursorOut: input.cursorIn >>> 0 };
  }
  const hashIn = input.hashIn >>> 0;
  if (gameUpdateSlice706cHashZero(hashIn) !== 0) {
    return { warn: 0, seedZeroDrop: 1, create1: 0, create2: 0, copyBackReady: 0, hashOut: 0, cursorOut: input.cursorIn >>> 0 };
  }
  const count = input.count | 0;
  const bucketCount = input.bucketCount >>> 0;
  const width = input.width | 0;
  const ids = Array.isArray(input.cellIds) ? input.cellIds : [];
  const ptrs = Array.isArray(input.cellPtrs) ? input.cellPtrs : [];
  const valid = Array.isArray(input.cellValid) ? input.cellValid : [];
  const pre = Array.isArray(input.cellCounterPre) ? input.cellCounterPre : [];
  const genrand = Array.isArray(input.genrandRet) ? input.genrandRet : [];
  let hash = hashIn;
  let cursor = input.cursorIn >>> 0;
  let create1 = 0;
  let create2 = 0;
  let left = count;
  for (let i = 0; i < count; i += 1) {
    const parity = gameUpdateSlice706cBucketParity(cursor);
    const idx = gameUpdateSlice706cBucketIndex(cursor, bucketCount);
    const itemId = ids[i] >>> 0;
    const cellPtr = ptrs[i] >>> 0;
    if ((valid[i] | 0) >= 0) gameUpdateSlice706cCounterIncCap255((pre[i] ?? 0) & 0xff);
    const quot = gameUpdateSlice706cIdivQuot(itemId, width);
    const rem = gameUpdateSlice706cIdivRem(itemId, width);
    gameUpdateSlice706cPosX(rem);
    gameUpdateSlice706cPosY(quot);
    gameUpdateSlice706cVcallArm(cellPtr, itemId);
    if (gameUpdateSlice706cHashZero(hash) !== 0) {
      return { warn: 0, seedZeroDrop: 1, create1, create2, copyBackReady: 0, hashOut: 0, cursorOut: cursor };
    }
    hash = gameUpdateSlice706cXorshiftStep(hash);
    create1 += 1;
    void genrand[i];
    create2 += 1;
    left -= 1;
    cursor = (left !== 0) ? ((cursor + 1) >>> 0) : 0;
  }
  if (gameUpdateSlice706cHashZero(hash) !== 0) {
    return { warn: 0, seedZeroDrop: 1, create1, create2, copyBackReady: 0, hashOut: 0, cursorOut: cursor };
  }
  hash = gameUpdateSlice706cXorshiftStep(hash);
  return { warn: 0, seedZeroDrop: 0, create1, create2, copyBackReady: 1, hashOut: hash >>> 0, cursorOut: cursor };
}

const sfxUpdF32Buf = new ArrayBuffer(4);
const sfxUpdF32View = new Float32Array(sfxUpdF32Buf);
const sfxUpdU32View = new Uint32Array(sfxUpdF32Buf);
function sfxUpdF32Of(bits) {
  sfxUpdU32View[0] = bits >>> 0;
  return Math.fround(sfxUpdF32View[0]);
}
function sfxUpdBitsOf(f) {
  sfxUpdF32View[0] = Math.fround(f);
  return sfxUpdU32View[0] >>> 0;
}

/* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45): COMPOSED
   heartbeat SFX UPDATE-lane frame over the predicate 0x0092e560 + volume
   leaf 0x0092df40 + pitch leaf 0x0092e050. Gate law BY REFERENCE
   (pmSfxEntryGate: G1 SIGNED js / G2 SIGNED magic-div jge / G3 UNSIGNED
   SILENT drop pin #A / G4 disabled je). Per voice (chan/pending/probes
   from the committed sfxStopVoices pack): pending cleared iff
   pending_set && probe1 != 0 (bit i in pendingMask); busy(v) iff probe2
   != 0 || pending_after != 0 — short-circuits the walk (walkCount =
   voices visited incl. the busy one). Volume eff = minss(max-with-0
   comiss/ja of [mgr+0x10], * argVol, * master [[0xc7169c]+0x2a358],
   fround per op; minss returns its SECOND operand on NaN -> eff=1.0f);
   pitch is a RAW bit-copy store (pin #C). S1 vol_mem store publishes the
   pre-loop [g+0x194] overwrite bits whenever the LIVE gate opened.
   applied=0 keeps the monolithic edge byte-for-byte (ready=0 / blob
   missing). */
export function gameUpdateSliceSfxUpdFrame(input = {}) {
  const ready = (input.ready | 0) !== 0 ? 1 : 0;
  if (ready === 0) return { applied: 0 };
  const span = input.span | 0;
  const voices190 = input.voices190 >>> 0;
  const enabled198 = input.enabled198 >>> 0;
  const gate = pmSfxEntryGate(PM_INTENSITY_SFX_ID, span, voices190, enabled198);
  if (gate === PM_SFX_GATE_MISS || gate === PM_SFX_GATE_DISABLED) {
    return { applied: 1, busyApplied: 0, walkCount: 0, pendingMask: 0,
      noSamplesWarn: 0, volMemBits: 0, voiceVolSet: 0, devVolumeCalls: 0,
      pitchVoiceSet: 0, devPitchCalls: 0 };
  }
  if (gate === PM_SFX_GATE_NO_SAMPLES) {
    return { applied: 1, busyApplied: 0, walkCount: 0, pendingMask: 0,
      noSamplesWarn: 1, volMemBits: 0, voiceVolSet: 0, devVolumeCalls: 0,
      pitchVoiceSet: 0, devPitchCalls: 0 };
  }
  /* LIVE: S1 vol-mem store happens even with zero applied voices. */
  const out = { applied: 1, busyApplied: 0, walkCount: 0, pendingMask: 0,
    noSamplesWarn: 0, volMemBits: input.argVol >>> 0, voiceVolSet: 0,
    devVolumeCalls: 0, pitchVoiceSet: 0, devPitchCalls: 0 };
  const voices = Array.isArray(input.voices) ? input.voices : [];
  const n = Math.min(voices190 >>> 0, Math.min(voices.length, 32));
  const mgrScalar = sfxUpdF32Of(input.mgrScalar ?? 0);
  const master = sfxUpdF32Of(input.masterVol ?? 0);
  const argVolF = sfxUpdF32Of(input.argVol >>> 0);
  for (let i = 0; i < n; i += 1) {
    const v = voices[i] ?? {};
    const chanNull = (v.channelNull | 0) !== 0 ? 1 : 0;
    const pending = (v.pending09 | 0) & 0xff;
    const probe1 = (v.probeFirst | 0) & 0xff;
    const probe2 = (v.probeSecond | 0) & 0xff;
    if (chanNull === 0) continue; /* V1: null channel -> no probes fired */
    let pendingAfter = pending;
    if (pending !== 0 && probe1 !== 0) {
      pendingAfter = 0;
      out.pendingMask |= (1 << i) >>> 0;
    }
    out.walkCount = i + 1;
    if (probe2 !== 0 || pendingAfter !== 0) {
      void argVolF;
      /* BUSY: short-circuit — volume leaf then pitch leaf hit this voice. */
      out.busyApplied = 1;
      out.voiceVolSet = 1;
      out.devVolumeCalls = 1;
      out.pitchVoiceSet = 1;
      out.devPitchCalls = 1;
      /* S2 eff value (host copy-back): max-with-0 (comiss unordered ->
         0), * vol, * master, minss 1.0f returns its SECOND operand on
         NaN. */
      let eff = mgrScalar > 0 ? mgrScalar : 0;
      eff = Math.fround(eff * argVolF);
      eff = Math.fround(eff * master);
      out.volEffBits = (eff < 1) ? sfxUpdBitsOf(eff) : 0x3f800000;
    }
  }
  return out;
}
/* ---- ABI v95 (record idx 25 roomTriggerClearStats): stats-residual laws
   of Room::TriggerClear -> FUN_009e5960 (this = Game+0x266e4, called
   unconditionally at 0x00806935). Mirrors the cpp exports branch-by-
   branch (cpu-dump 009e5960.txt / 009e6740.txt / 009e6940.txt /
   0069ee50.txt). Callsite pushes (right-to-left): param_2 = Room.field_8
   (record dword + 0xb tail gate), param_3 = [desc.field_10+0x48] (count
   input), param_4 = clearCount word (gate), param_5 = (flags>>10)&1
   (record byte). The guest-alloc growth 0x69ee50 stays typed-host; these
   laws pin the arg prep + growth-count math. */

/* gate: PE 0x009e5970 cmp dword [ebp+0x10],1 / jne 0x9e5a1c — FULL-DWORD
   compare on the movzx-widened clearCount word (param_4). 0x10001 must
   NOT open. */
export function gameUpdateSliceTcsStatsGate(clearCount) {
  return (clearCount >>> 0) === 1 ? 1 : 0;
}

/* count: PE 0x009e6740..0x009e6764 — eax = arg-8 (u32 wrap); cmp eax,4;
   ja -> 0x9e675e (mov eax,1); jmp [eax*4+0x9e6768] — ALL FIVE table
   entries -> 0x9e6755 (mov eax,2). arg in [8..12] -> 2 else 1; UNSIGNED
   bounds (arg < 8 wraps huge -> 1). */
export function gameUpdateSliceTcsStatsCount(arg1048) {
  return (((arg1048 >>> 0) - 8) >>> 0) <= 4 ? 2 : 1;
}

/* float_gate: PE 0x009e59a7 comiss xmm0,[0xba9fe4] (=-18.0f) /
   0x009e59ae jbe 0x9e5a1b. Ordered > -18.0f required; NaN is unordered so
   comiss sets CF -> jbe closes. lookup_bits = 0x9e6940 result float bits
   (host-captured). */
export function gameUpdateSliceTcsStatsFloatGate(lookupBits) {
  const f = bitsToF32(lookupBits >>> 0);
  if (f !== f) return 0; /* NaN -> unordered -> jbe closes */
  return f > -18.0 ? 1 : 0;
}

/* record_dword: PE 0x009e59b0/0x009e59b6 — record[0..3] = Room.field_8
   (param_2, FULL dword). */
export function gameUpdateSliceTcsStatsRecordDword(roomF8) {
  return roomF8 >>> 0;
}

/* record_byte: PE 0x009e59b9/0x009e59bc — record[4] low byte =
   (desc.flags>>10)&1 (param_5). */
export function gameUpdateSliceTcsStatsRecordByte(flags44) {
  return ((flags44 >>> 0) >> 10) & 1;
}

/* growth_sim: per-append replay of PE 0x009e59d3..0x009e5a00 with the
   0x69ee50 capacity law. end RE-READ per iteration; growth iff end==cap
   (0x9e59d6 cmp / 0x9e59d9 je). old_cap = (cap-begin)/12 signed magic
   (0x69ee5b/0x69ee7a imul 0x2aaaaaab, sar 1, + sign); throw when
   old_cap == 0x15555555 or new_cap > 0x15555555 (0x69ee8d/0x69ef15);
   new_cap = max(old_cap+1, old_cap + (old_cap>>>1)) (0x69ef0b..0x69ef12
   cmovae); cap = begin + 12*new_cap u32 wrap (0x69eec4 lea eax,
   [ecx+ecx*2] / shl 2). Returns {growths, endOut, capOut}. */
export function gameUpdateSliceTcsStatsGrowthSim(count, begin, end, cap) {
  let growths = 0;
  let e = end >>> 0;
  let c = cap >>> 0;
  const b = begin >>> 0;
  let n = count | 0;
  if (n < 0) n = 0; /* PE 0x9e59cc test eax,eax / jle — SIGNED skip */
  for (let i = 0; i < n; i += 1) {
    if (e === c) {
      /* old_cap = (cap-begin)/12 via the signed magic imul: delta *
         0x2aaaaaab as a signed 64-bit product, high word >> 1, + sign. */
      const delta = ((c - b) >>> 0) | 0; /* (int32)(cap - begin) */
      const dl = (delta & 0xffff) >>> 0;
      const dh = (delta >>> 16) >>> 0;
      const ml = 0xaaab; /* low 16 bits of 0x2aaaaaab */
      const mh = 0x2aaa; /* high 16 bits */
      const dlml = (dl * ml) >>> 0;
      const mid = ((dl * mh) + (dh * ml) + (dlml >>> 16)) >>> 0;
      let hi = ((dh * mh) + (mid >>> 16)) >>> 0;
      if (delta < 0) hi = (hi + 0x2aaaaaab) >>> 0; /* signed correction */
      const edx = hi >> 1; /* sar edx,1 */
      const oldCap = edx + (edx >>> 31); /* + shr 31 sign fold */
      if (oldCap === 0x15555555) break; /* length_error 0x415bc0 (host) */
      /* new_cap = max(old_cap+1, old_cap + (old_cap>>>1)) — 0x69ef0b lea
         eax,[edx+ecx] / 0x69ef0e mov ecx,ebx / 0x69ef12 cmovae. */
      let newCap = oldCap + ((oldCap >>> 1) | 0);
      if (newCap < oldCap + 1) newCap = oldCap + 1;
      if (newCap > 0x15555555) break; /* length_error 0x40cee0 (host) */
      /* cap = begin + 12*new_cap (0x69eec4 lea eax,[ecx+ecx*2] / shl 2),
         u32 wrap. */
      c = (b + (newCap * 12)) >>> 0;
      growths += 1;
    }
    e = (e + 12) >>> 0; /* PE 0x9e59ea add dword [this+0x60],0xc */
  }
  return { growths, endOut: e >>> 0, capOut: c >>> 0 };
}

/* tail_add: PE 0x009e5a0c cmp dword [ebp+8],0xb / jne + 0x009e5a12 cmp
   byte [Game+8],0 / je + 0x009e5a18 add [this+0x74],count. Room.field_8
   FULL-DWORD (0x10b must NOT match); [Game+8] LOW-BYTE. Dead on the two
   known callers (param_2 = room type, never 0xb on a clear path). */
export function gameUpdateSliceTcsStatsTailAdd(roomF8, gameByte8, count) {
  if ((roomF8 >>> 0) !== 0xb) return 0;
  if (((gameByte8 >>> 0) & 0xff) === 0) return 0;
  return count | 0;
}

/* ---- ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11): B9 challenge-
   result laws + B10 fatal gate + B11 camera/manager decision laws.
   Transcribed branch-by-branch from section-notes/room-b9b11/
   disasm-803ce5.txt (0x803cfe..0x803f8c). All params u32 (Wasm ABI does
   not narrow i32); low-byte tests re-narrow in the body. Bodies stay
   typed-host; the wire emits the typed events (opaqueRoomUpdatePrefixB9B11*).
   PE offsets in each comment. ---- */

export function gameUpdateSliceB9b11ChallengeGate(
  fcoResultNonzero, roomActiveByte0, frame264f8, roomEntry11f0,
  roomType8, roomDescFlags44,
) {
  /* PE 0x803cfe test eax,eax / je 0x803dd3: FULL-DWORD result. */
  if ((fcoResultNonzero >>> 0) === 0) return 0;
  /* PE 0x803d06 cmp byte [edi],0 / je: LOW-BYTE active. */
  if (((roomActiveByte0 >>> 0) & 0xff) === 0) return 0;
  /* PE 0x803d15..0x803d24: sub [Game+0x264f8]-[edi+0x11f0]; cmp 4 / jne. */
  if (((((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0) >>> 0) !== 4) return 0;
  /* PE 0x803d2a..0x803d30 cmp dword [eax+8],0x11 / jne: FULL-DWORD. */
  if ((roomType8 >>> 0) !== 0x11) return 0;
  /* PE 0x803d3a..0x803d45: shr 3 + test al,1 / jne — LOW-BYTE of bit. */
  if ((((roomDescFlags44 >>> 0) >> 3) & 1) !== 0) return 0;
  return 1;
}

export function gameUpdateSliceB9b11FreeHelperNeeded(count) {
  /* PE 0x803d6e cmp dword [ebp-0xa3c],0 / jne: FULL-DWORD. */
  return (count >>> 0) === 0 ? 1 : 0;
}

export function gameUpdateSliceB9b11FreePathNeeded(byte0) {
  /* PE 0x803d8f cmp byte [ebp-0xa48],0 / jne: LOW-BYTE. */
  return (((byte0 >>> 0) & 0xff) === 0) ? 1 : 0;
}

export function gameUpdateSliceB9b11FreePtrNeeded(ptr) {
  /* PE 0x803db2 test ecx,ecx / je: ptr != 0. */
  return (ptr >>> 0) !== 0 ? 1 : 0;
}

export function gameUpdateSliceB9b11FreeHeapLo(heapLo, size) {
  /* PE 0x803dbc sub dword [edx],eax: lo' = lo - size (u32 wrap). */
  return ((heapLo >>> 0) - (size >>> 0)) >>> 0;
}

export function gameUpdateSliceB9b11FreeHeapHi(heapLo, heapHi, size) {
  /* PE 0x803dbf sbb dword [edx+4],0: hi' = hi - (lo < size) UNSIGNED. */
  return ((heapHi >>> 0) - (((heapLo >>> 0) < (size >>> 0)) ? 1 : 0)) >>> 0;
}

export function gameUpdateSliceB9b11B10Enemies(count12c8, count12cc) {
  /* PE 0x803e0a..0x803e1a: xor esi,esi; add; test; cmovg — SIGNED. */
  const sum = (count12c8 | 0) + (count12cc | 0);
  return (sum | 0) > 0 ? (sum | 0) : 0;
}

export function gameUpdateSliceB9b11B10FatalNeeded(enemies, old7224) {
  /* PE 0x803e1d test esi,esi / jg skip: fatal needs enemies <= 0 SIGNED.
     PE 0x803e21 cmp [edi+0x7224],0 / jle skip: fatal needs old > 0. */
  if ((enemies | 0) > 0) return 0;
  if ((old7224 | 0) <= 0) return 0;
  return 1;
}

export function gameUpdateSliceB9b11ModeHooksNeeded(roomType8, gameByte) {
  /* PE 0x803dd9..0x803ded: cmp eax,0xb / je; cmp eax,0x11 / jne;
     cmp byte [ecx+0x265e8],0 / je. Type FULL-DWORD; byte LOW-BYTE. */
  const t = roomType8 >>> 0;
  if (t !== 0xb && t !== 0x11) return 0;
  if (((gameByte >>> 0) & 0xff) === 0) return 0;
  return 1;
}

export function gameUpdateSliceB9b11Flag11f4Needed(roomByte11f4) {
  /* PE 0x803dfa cmp byte [edi+0x11f4],0 / je: LOW-BYTE. */
  return (((roomByte11f4 >>> 0) & 0xff) !== 0) ? 1 : 0;
}

export function gameUpdateSliceB9b11Double409030Needed(roomByte1d0d) {
  /* PE 0x803e82 cmp byte [edi+0x1d0d],0 / je: LOW-BYTE. */
  return (((roomByte1d0d >>> 0) & 0xff) !== 0) ? 1 : 0;
}

export function gameUpdateSliceB9b11Stage1aNeeded(room1d18) {
  /* PE 0x803ea1 cmp dword [edi+0x1d18],0x1a / jne: FULL-DWORD. */
  return (room1d18 >>> 0) === 0x1a ? 1 : 0;
}

export function gameUpdateSliceB9b11Age1Needed(
  roomActiveByte0, frame264f8, roomEntry11f0,
) {
  /* PE 0x803f21 cmp byte [edi],0 / je; 0x803f26..0x803f3a cmp eax,1 / jne. */
  if (((roomActiveByte0 >>> 0) & 0xff) === 0) return 0;
  if (((((frame264f8 | 0) - (roomEntry11f0 | 0)) | 0) >>> 0) !== 1) return 0;
  return 1;
}

export function gameUpdateSliceB9b11TempfxFlagClear(roomByte7321) {
  /* PE 0x803f43 cmp byte [edi+0x7321],0 / jne 0x804101: LOW-BYTE. */
  return (((roomByte7321 >>> 0) & 0xff) === 0) ? 1 : 0;
}

export function gameUpdateSliceB9b11TempfxListEmpty(listBegin7314, listEnd7318) {
  /* PE 0x803f50..0x803f5e: mov eax,[edi+0x7314]; mov esi,[edi+0x7318];
     cmp eax,esi / je 0x804101 — FULL-DWORD equality. */
  return (listBegin7314 >>> 0) === (listEnd7318 >>> 0) ? 1 : 0;
}

export function gameUpdateSliceB9b11TempfxIsCandidate(effectType, effectVariant) {
  /* PE 0x803f68..0x803f77: cmp ecx,1/3/4; cmp dword [edx+4],0x1e1 / je —
     FULL-DWORD. */
  const t = effectType >>> 0;
  if (t !== 1 && t !== 3 && t !== 4) return 0;
  return (effectVariant >>> 0) === 0x1e1 ? 1 : 0;
}

export function gameUpdateSliceB9b11TempfxWalkNext(cur) {
  /* PE 0x803f80 add eax,0x10 — stride 0x10, u32 wrap. */
  return ((cur >>> 0) + 0x10) >>> 0;
}

export function gameUpdateSliceB9b11TempfxWalkContinue(cur, end) {
  /* PE 0x803f83 cmp eax,esi / jne 0x803f64 — cur != end FULL-DWORD. */
  return (cur >>> 0) !== (end >>> 0) ? 1 : 0;
}

function bitsToF32(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

/* ---- ABI v95 (record idx 30 roomTriggerClearAwardsGreed): greedy-arm
   laws of Room::TriggerClear (VA 0x008068f0) — mirror the cpp exports
   branch-by-branch (cpu-dump 008068f0.txt/00806bf0.txt). greed_mode =
   0x806b9e..0x806bac (the machine RE-READS Game+0x269c8 fresh for this
   arm; cmp edi,2 / je + cmp edi,3 / jne 0x806c0a — FULL-DWORD equality:
   0x102/0xffffffff are NOT greed). greed_arm = 0x806bb1 cmp eax,1 / jne +
   0x806be2 cmp eax,5 / jne + 0x806be7 cmp [ebx+0x1bb0],0x3e / jne
   (1 branch A "roomType==1", 2 branch B "roomType==5 && subtype==0x3e",
   0 none). greed_expected = 0x806bd1..0x806bd9 (cmp edi,3 / sete /
   add 0xa: Greedier 11, Greed 10). greed_match = 0x806bdc cmp/jne
   (branch-A stored [Game+0x18334] == expected; FULL-DWORD 0x100 must NOT
   match 10). greed_next = the FUN_009bfae0 fire decision (this=Game+
   0x1baa8 @0x806bff, call @0x806c05): (arm==1 && probe_al LOW-BYTE != 0
   (0x806bcd test al,al) && match) || (arm==2 && probe_al LOW-BYTE != 0
   (0x806bfb test al,al)). greed_tail_always = control-flow: every greed-arm
   exit edge targets LAB_00806c0a (0x806c0a push -1 / 0x806c0c call
   0x705ee0) — the arm NEVER returns early; the record-30 share of
   "0x705ee0 typed-host" is this unconditional control flow (-1 arg law =
   record 31, SaveState typing = records 12/20). */
export function gameUpdateSliceTriggerClearGreedMode(difficulty269c8) {
  return (difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3 ? 1 : 0;
}
export function gameUpdateSliceTriggerClearGreedArm(roomType8, roomSubtype1bb0) {
  if ((roomType8 >>> 0) === 1) return 1;
  if ((roomType8 >>> 0) === 5 && (roomSubtype1bb0 >>> 0) === 0x3e) return 2;
  return 0;
}
export function gameUpdateSliceTriggerClearGreedExpected(difficulty269c8) {
  return (difficulty269c8 | 0) === 3 ? 11 : 10;
}
export function gameUpdateSliceTriggerClearGreedMatch(storeValue18334, difficulty269c8) {
  return (storeValue18334 | 0) ===
    gameUpdateSliceTriggerClearGreedExpected(difficulty269c8)
    ? 1 : 0;
}
export function gameUpdateSliceTriggerClearGreedNext(arm, probeAl, match) {
  if (((probeAl | 0) & 0xff) === 0) return 0;
  if ((arm | 0) === 1) return (match | 0) !== 0 ? 1 : 0;
  if ((arm | 0) === 2) return 1;
  return 0;
}
export function gameUpdateSliceTriggerClearGreedTailAlways() {
  return 1;
}

/* ---- ABI v95 (record idx 32): FUN_00956110 phone-home probe pure laws ----
   PE-truth transcribed from cpu-dump 00956110.txt (0x956110..0x9561d2);
   do NOT derive from the C++. The platform IO tail 0x864c30, the
   walk-path virtual [[entry]+0x30] dispatch, and the general callback
   0xa20940 dispatch stay typed-host. */

/* net_gate: PE 0x956120 cmp dword [edi+8],2 / jne + 0x956126 cmp dword
   [0xc71690],0 / je — FULL-DWORD compares. 0x102 must CLOSE, 0x100 OPEN. */
export function gameUpdateSlice98dba0956110NetGate(managerMode, globalC71690) {
  return ((managerMode >>> 0) === 2 && (globalC71690 >>> 0) !== 0) ? 1 : 0;
}

/* net_early: PE 0x95613e test al,al / je; 0x956142 mov al,[ebp+0xb] — the
   out byte is the return value; BYTE law (0x100 -> 0, 0xff -> 1). */
export function gameUpdateSlice98dba0956110NetEarly(netOutByte) {
  return (((netOutByte >>> 0) & 0xff) !== 0) ? 1 : 0;
}

/* path: PE 0x95615d cmp ecx,eax / je GENERAL + 0x956161 cmp edx,-1 / jne
   GENERAL. WALK iff mp non-empty AND arg2 == 0xffffffff (FULL-DWORD). */
export function gameUpdateSlice98dba0956110Path(mpBegin, mpEnd, arg2) {
  if ((mpBegin >>> 0) === (mpEnd >>> 0)) return 1; /* GENERAL */
  if ((arg2 >>> 0) !== 0xffffffff) return 1; /* GENERAL */
  return 0; /* ID_NEG1_WALK */
}

/* walk_result: PE 0x956166..0x9561a9. count = (end-begin) SAR 2 re-derived
   per iteration, UNSIGNED jb; first (entry_al & 0xff) != 0 wins (test al,al
   is LOW-BYTE; 0x100 -> 0). */
export function gameUpdateSlice98dba0956110WalkResult(vtableResults, count) {
  if (!Array.isArray(vtableResults) || (count | 0) <= 0) return 0;
  const n = Math.min(count | 0, vtableResults.length);
  for (let i = 0; i < n; i += 1) {
    if (((vtableResults[i] >>> 0) & 0xff) !== 0) return 1;
  }
  return 0;
}

/* result_plan: composed FUN_00956110 decision — returns {value, path, pure,
   host864c30, hostVtableWalk, hostGeneral, pureCfOk}. */
export function gameUpdateSlice98dba0956110ResultPlan({
  managerMode = 0, globalC71690 = 0, mpBegin = 0, mpEnd = 0, arg2 = 0,
  netHostOk = 0, netOutByte = 0, vtableResults = [], vtableCount = 0,
  generalResult = 0, maxVtable = 8,
} = {}) {
  const plan = {
    value: 0, path: 1 /* GENERAL */, pure: 0,
    host864c30: 0, hostVtableWalk: 0, hostGeneral: 0, pureCfOk: 1,
  };
  if (gameUpdateSlice98dba0956110NetGate(managerMode, globalC71690) !== 0) {
    plan.host864c30 = 1; /* platform IO tail reachable */
    if ((netHostOk | 0) !== 0) {
      plan.path = 2; /* NET_EARLY */
      plan.value = gameUpdateSlice98dba0956110NetEarly(netOutByte);
      plan.pure = 1;
      return plan;
    }
  }
  if (gameUpdateSlice98dba0956110Path(mpBegin, mpEnd, arg2) === 0) {
    plan.path = 0; /* ID_NEG1_WALK */
    plan.hostVtableWalk = 1;
    if ((vtableCount | 0) <= (maxVtable | 0)) {
      plan.value = gameUpdateSlice98dba0956110WalkResult(vtableResults, vtableCount);
      plan.pure = 1;
    }
    return plan;
  }
  plan.path = 1; /* GENERAL */
  plan.hostGeneral = 1; /* 0xa20940 callback dispatch host */
  plan.value = (((generalResult >>> 0) & 0xff) !== 0) ? 1 : 0;
  return plan;
}

/* arg_prep: the call-argument constants FUN_00956110 composes on each arm
   (net: arg3 passthrough, imm 0, arg1 passthrough, out-buf = arg1 slot +3
   @0x95612f..0x956136; walk: vtable+0x30 with arg1 pushed @0x956174/0x956177;
   general: container 0xc57b18 vtable+0x74, callback 0xa20940, arg1 imm 0xd,
   @0x9561ac..0x9561c7). */
export function gameUpdateSlice98dba0956110ArgPrep() {
  return {
    netArg1Kind: 0,
    netArg2Imm: 0,
    netArg3Kind: 0,
    netOutBufOff: 0xb,
    walkVtblOff: 0x30,
    walkStackArg1: 1,
    generalContainerVa: 0x00c57b18,
    generalVtblOff: 0x74,
    generalCallbackVa: 0x00a20940,
    generalArg1Imm: 0xd,
    generalPushCount: 5,
    generalZeroArgs: 2,
  };
}

/* ---- ABI v95 (record idx 5/32, 0x0098dba0): ENTITY-SURFACE capture
   contract for VIRTUAL [[player+0x370]+0x14] (walk sites 0x98dca2 /
   0x98dd1d). The [matched MP entry]+0x370 subobject vptr is one of
   exactly two .rdata vtables (0xb82d98 DataUpdate_t / 0xb82e20
   Network::KAGE::MultiplayerManager::LobbyDataUpdate_t); slot[0x14] =
   0xa5f260 / 0xa23970. The accept predicates below are PURE (PE-truth
   from cpu-dump 00a5f260.txt + 00a5f2b0.txt + 00a23970.txt +
   00af0750.txt + 00a5f090.txt + 00a5f0ab.txt); the virtual dispatch
   stays TYPED-HOST. Do NOT derive from the C++. */

export const ENTITY_SURFACE_CLASS = Object.freeze({
  DATA_UPDATE_T: 0,
  LOBBY_DATA_UPDATE_T: 1,
  UNKNOWN: 2,
});

/* class_bits: FULL-DWORD decode of the subobject vptr at [entry+0x370]
   (PE 0x98dc93 / 0x98dd0e mov eax,[esi+0x370] + constructor stores of
   0xb82d98 / 0xb82e20). A byte-narrow decode misreads 0xb82e98 (low
   byte 0x98) as DataUpdate_t. */
export function gameUpdateSliceEntitySurfaceClassBits(vtablePtr) {
  if ((vtablePtr >>> 0) === 0x00b82d98) return ENTITY_SURFACE_CLASS.DATA_UPDATE_T;
  if ((vtablePtr >>> 0) === 0x00b82e20) return ENTITY_SURFACE_CLASS.LOBBY_DATA_UPDATE_T;
  return ENTITY_SURFACE_CLASS.UNKNOWN;
}

/* lobby_accept: PE 0xa23970. impl_ptr==0 -> 0; impl_20!=0 &&
   impl_20_10 == c5ac00 (FULL-DWORD) -> 1; else (impl_b0 & 1) — LOW-BYTE
   (0x100 -> 0, 0xff -> 1). */
export function gameUpdateSliceEntitySurfaceLobbyAccept(
  implPtr, implB0, impl20, impl2010, globalC5ac00) {
  if ((implPtr >>> 0) === 0) return 0;
  if ((impl20 >>> 0) !== 0 && (impl2010 >>> 0) === (globalC5ac00 >>> 0)) return 1;
  return ((implB0 >>> 0) & 1) !== 0 ? 1 : 0;
}

/* data_accept: PE 0xa5f260..0xa5f2c9. impl_ptr==0 -> 0; the 0xaf0750
   shift helper at cl=0x20 degenerates to eax=[impl+0xc],edx=0 so the
   gate is impl_c == 0xfefefefe (FULL-DWORD). Match arm: lookup =
   (c73680!=0 && c73694==0x60001) ? netman2b4 : 0 (0xa5f090 arms; the
   log leaves 0xa69f60 are outside the value law); return impl_8 ==
   lookup. Else impl_20!=0 && impl_20_10==c5ac00 -> 1; else impl_b0&1. */
export function gameUpdateSliceEntitySurfaceDataAccept(
  implPtr, implB0, impl8, implC, impl20, impl2010, globalC5ac00,
  globalC73680, globalC73694, netman2b4) {
  if ((implPtr >>> 0) === 0) return 0;
  if ((implC >>> 0) === 0xfefefefe) {
    let lookup = 0;
    if ((globalC73680 >>> 0) !== 0 && (globalC73694 >>> 0) === 0x60001) {
      lookup = netman2b4 >>> 0;
    }
    return (impl8 >>> 0) === (lookup >>> 0) ? 1 : 0;
  }
  if ((impl20 >>> 0) !== 0 && (impl2010 >>> 0) === (globalC5ac00 >>> 0)) return 1;
  return ((implB0 >>> 0) & 1) !== 0 ? 1 : 0;
}

/* accept: composed accept law over the capture blob (class-dispatched). */
export function gameUpdateSliceEntitySurfaceAccept({
  vtableClassBits = 0, implPtr = 0, implB0 = 0, impl8 = 0, implC = 0,
  impl20 = 0, impl2010 = 0, netman2b4 = 0, globalC73680 = 0,
  globalC73694 = 0, globalC5ac00 = 0,
}) {
  if ((vtableClassBits >>> 0) === ENTITY_SURFACE_CLASS.LOBBY_DATA_UPDATE_T) {
    return gameUpdateSliceEntitySurfaceLobbyAccept(
      implPtr, implB0, impl20, impl2010, globalC5ac00);
  }
  return gameUpdateSliceEntitySurfaceDataAccept(
    implPtr, implB0, impl8, implC, impl20, impl2010, globalC5ac00,
    globalC73680, globalC73694, netman2b4);
}

/* plan: composed accept decision + typed-host contract. accept=-1 /
   pure=0 for unknown classes (the wire refuses a pure prediction). */
export function gameUpdateSliceEntitySurfacePlan({
  vtableClassBits = 0, implPtr = 0, implB0 = 0, impl8 = 0, implC = 0,
  impl20 = 0, impl2010 = 0, netman2b4 = 0, globalC73680 = 0,
  globalC73694 = 0, globalC5ac00 = 0,
}) {
  const plan = {
    accept: -1,
    classBits: vtableClassBits >>> 0,
    pure: 0,
    typedHost: 1,   /* the [[entry+0x370]+0x14] dispatch is the host leaf */
    hostVerify: 1,  /* host captures the real AL to verify the prediction */
  };
  if ((vtableClassBits >>> 0) === ENTITY_SURFACE_CLASS.UNKNOWN) return plan;
  plan.accept = gameUpdateSliceEntitySurfaceAccept({
    vtableClassBits, implPtr, implB0, impl8, implC, impl20, impl2010,
    netman2b4, globalC73680, globalC73694, globalC5ac00,
  });
  plan.pure = 1;
  return plan;
}

/* walk_step: one player iteration of the walk's accept-driven state
   machine (PE 0x98dc5c..0x98dcbc phase 1, 0x98dcc0..0x98dd39 phase 2).
   accept1/accept2 are the virtual AL results — BYTE-gated (test al,al
   @0x98dca4 / @0x98dd1f; 0x100 -> 0, corrected v106). probe1_ran =
   (mp_found==0 || (accept1 & 0xff)!=0); bl_after1 = probe1_ran &&
   (probe1_nz & 0xff) != 0 (0x98dcba test al,al LOW-BYTE);
   rtti_enter = found2 ? ((accept2 & 0xff)!=0) : mp_nonempty. */
export function gameUpdateSliceEntitySurfaceWalkStep({
  mpFound = 0, accept1 = 0, probe1Nz = 0, found2 = 0, accept2 = 0,
  mpNonempty = 0,
}) {
  const accept1Al = ((accept1 >>> 0) & 0xff) !== 0;
  const accept2Al = ((accept2 >>> 0) & 0xff) !== 0;
  const probe1Ran = ((mpFound >>> 0) === 0 || accept1Al) ? 1 : 0;
  return {
    blAfter1: (probe1Ran !== 0 && ((probe1Nz >>> 0) & 0xff) !== 0) ? 1 : 0,
    probe1Ran,
    rttiEnter: (found2 >>> 0) !== 0
      ? (accept2Al ? 1 : 0)
      : (((mpNonempty >>> 0) !== 0) ? 1 : 0),
  };
}

/* rtti_fold: the RTTI block of the walk (PE 0x98dd27..0x98dddc) — the
   bl outcome once the block is entered. Block gates are FULL-DWORD
   (rtti_out/cast = test eax,eax; gate378 = cmp [eax+0x378],0); the
   local + probe2 results are LOW-BYTE (test al,al: 0x98ddad, 0x98ddd2)
   → & 0xff (0x100 -> 0, 0xff -> 1). Branch order:
   1. rtti_enter==0 -> bl unchanged (walk_step's gate: found2 ?
      accept2 : mp_nonempty; the mp re-check @0x98dd2d..0x98dd39 folds
      into rtti_enter).
   2. rtti_out==0 || rtti_cast==0 || gate378==0 -> bl unchanged
      (0x98dd60/0x98dd7e/0x98dd82 je 0x98dddc).
   3. bl_after1 != 0 -> 1 (0x98dd8b jne 0x98ddda).
   4. mp empty (0x98dd9b je 0x98ddb1) -> probe2 runs -> bl =
      (probe2_nz & 0xff) != 0 (0x98ddd4 jne 0x98ddda / 0x98ddd6 xor).
   5. (is_idx_local & 0xff) == 0 -> 0 (0x98ddad je 0x98ddd6; probe2
      SKIPPED).
   6. else (probe2_nz & 0xff) != 0 -> 1 : 0. */
export function gameUpdateSliceEntitySurfaceRttiFold({
  rttiEnter = 0, blAfter1 = 0, rttiOut = 0, rttiCast = 0, gate378 = 0,
  mpEmpty = 0, isIdxLocal = 0, probe2Nz = 0,
}) {
  let bl = (blAfter1 >>> 0) !== 0 ? 1 : 0;
  if ((rttiEnter >>> 0) === 0) return bl;
  if ((rttiOut >>> 0) === 0 || (rttiCast >>> 0) === 0 || (gate378 >>> 0) === 0) {
    return bl;
  }
  if (bl !== 0) return 1;
  if ((mpEmpty >>> 0) !== 0) {
    return ((probe2Nz >>> 0) & 0xff) !== 0 ? 1 : 0;
  }
  if (((isIdxLocal >>> 0) & 0xff) === 0) return 0;
  return ((probe2Nz >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/* ---- ABI v95 (record idx 43): TriggerDeath CALL-ARG laws ----
   The PM1 death walk (PlayerManager::Update 0x009bb5d0) composes the
   pre-call pack at 0x009bb67d..0x009bb682 (push 0; call 0x7a1090 with
   ecx = the LIVE cursor element). These laws extend the v69 frozen PM
   death contract (consumed BY REFERENCE) with the arg-prep.

   receiver: PE 0x009bb63c mov eax,[esi] (begin2) / 0x009bb63e sub ecx,eax
   (end2-begin2, 32-bit wrap) / 0x009bb640 sar ecx,2 (count2, ARITHMETIC) /
   0x009bb643 cmp edi,ecx; jae 0x9bb64a (u32 index >= u32 count2 -> cursor
   stays begin2: element 0 dereferenced, NEVER skipped) / 0x009bb647 lea
   eax,[eax+edi*4] (in-range: begin2 + index*4, wrap). */
export function gameUpdateSliceDeathCallReceiver(begin, end, index) {
  const delta = (((end >>> 0) - (begin >>> 0)) >>> 0) << 0 >> 0;
  const count2 = delta >> 2;
  const idx = index >>> 0;
  if (idx < (count2 >>> 0)) {
    return ((begin >>> 0) + ((index * 4) >>> 0)) >>> 0;
  }
  return begin >>> 0;
}

/* flag: PE 0x009bb67d push 0 — the ONLY argument, ALWAYS 0
   (checkOnly=false, PM_DEATH_TRIGGER_ARG_CHECK_ONLY). Independent of the
   index and of the eligibility decision. Cross-pinned to the PM family
   PM_DEATH_TRIGGER_ARG_CHECK_ONLY / pmDeathTriggerArg(). */
export function gameUpdateSliceDeathCallFlag() {
  return 0;
}

/* arg_prep: the composed event's arg-prep record {receiver, flag,
   can_trigger}. can_trigger = (eligible != 0) — the PE fires the call iff
   the eligibility decision passes (0x009bb64c..0x009bb67b); the ARGS are
   fixed regardless. */
export function gameUpdateSliceDeathCallArgPrep({ begin = 0, end = 0, index = 0, eligible = 0 } = {}) {
  return Object.freeze({
    receiver: gameUpdateSliceDeathCallReceiver(begin, end, index),
    flag: gameUpdateSliceDeathCallFlag(),
    canTrigger: (eligible | 0) !== 0 ? 1 : 0,
  });
}

/* ---- ABI v95 (record idx 19 opaqueCall006fd7c0Mode4Sfx): mode-4 SFX
 * ARG/seed laws as the composed typed-event arg-prep. Every law consumes
 * the frame-effect v18 family oracle BY REFERENCE (never re-derived).
 * PE anchors: seed select 0x006fd825 mov [ebp+0x14],0xbb / 0x006fd8e4 mov
 * 0xd7; rare 0x0095685b..0x0095686c (UNSIGNED % 20 == 0); id 0x00956806
 * mov 0x25 / 0x0095686e mov 0x12d; args 0x006fd83a..0x006fd851 (loop slot
 * = the `push 0` at 0x006fd84c); receiver 0x006fd858 lea ecx,
 * [esi+0x2a324]; play leaf 0x0092dc30 (SFXManager::Play). */

/* seed: mode-4 arm seeds 0xbb; the anim-0xc special tail (0x6fd8e4) seeds
   0xd7 and shares the build after 0x006fd82c. special != 0 -> 0xd7. */
export function gameUpdateSlice6fd7c0Mode4SfxSeed(special) {
  return (special | 0) !== 0
    ? frameEffect6fd7c0SpecialSfxSeed()
    : frameEffect6fd7c0Mode4SfxSeed();
}

/* rare_hit: the 0x956780 second-RNG-quad decision — UNSIGNED % 20 == 0.
   WIDE values: 0x100/0x1ff/0xffffffff must MISS (0xffffffff % 20 == 19). */
export function gameUpdateSlice6fd7c0SfxRareHit(mixedCounter) {
  return frameEffect6fd7c0SfxRareHit(mixedCounter >>> 0);
}

/* play_id: effective id at `call 0x92dc30`. Closed remap gate keeps the
   seed (id == seed); open gate -> 0x25 (common) / 0x12d (rare hit). */
export function gameUpdateSlice6fd7c0SfxPlayId(seedId, remapGateOpen, rareHit) {
  return frameEffect6fd7c0SfxPlayId(seedId | 0, remapGateOpen | 0, (rareHit | 0) !== 0 ? 1 : 0);
}

/* play_args: the six-dword pack {id, 1.0f, 2, 0, 1.0f, 0} — the LOOP slot
   is 0 (machine `push 0` at 0x006fd84c, NOT 1). */
export function gameUpdateSlice6fd7c0SfxPlayArgs(sfxId) {
  return frameEffect6fd7c0SfxPlayArgs(sfxId | 0);
}

/* manager_receiver: base + 0x2a324, 32-bit wrap (0x6fd858 lea). */
export function gameUpdateSlice6fd7c0SfxManagerReceiver(base) {
  return frameEffect6fd7c0SfxManagerReceiver(base >>> 0) >>> 0;
}

/* arg_prep: the COMPOSED typed-event arg-prep. playVa names the TYPED HOST
   leaf (SFXManager::Play 0x92dc30) whose call the host consumer re-issues
   with the in-module argument plan. */
export function gameUpdateSlice6fd7c0Mode4SfxArgPrep({ special = 0, remapGateOpen = 0, mixedCounter = 0, base = 0 } = {}) {
  const seed = gameUpdateSlice6fd7c0Mode4SfxSeed(special);
  const rareHit = gameUpdateSlice6fd7c0SfxRareHit(mixedCounter);
  const id = gameUpdateSlice6fd7c0SfxPlayId(seed, remapGateOpen, rareHit);
  /* The family oracle pack (id / frameDelay 2 / loop 0 / volume 1.0f / pan
     0 / pitch 1.0f) drives the raw six-slot array the C++ struct holds;
     1.0f == 0x3f800000 bits. Loop slot is 0 (PE 0x6fd84c push 0). */
  const pack = gameUpdateSlice6fd7c0SfxPlayArgs(id);
  return Object.freeze({
    seed: seed | 0,
    rareHit: rareHit | 0,
    id: id | 0,
    args: Object.freeze([id | 0, 0x3f800000, pack.frameDelay | 0, pack.loop | 0, 0x3f800000, pack.pan | 0]),
    receiver: gameUpdateSlice6fd7c0SfxManagerReceiver(base) | 0,
    playVa: 0x0092dc30,
  });
}

/* ---- ABI v102 (record idx 12 opaqueCall006fd7c0): transition/blue-room
 * capture pack — the LANE-FREE arm-selection laws (site args + state +
 * already-committed lanes only; census update-v102-record12-tran). Every
 * law consumes the frame-effect family oracle BY REFERENCE (never
 * re-derived). The capture-dependent laws (stage-transition route /
 * player-loop gate / anim-3 room dispatch / engine arg0 cmov / 0x6f0070
 * terminal pred) are staged in NOTES §lane-requests (runtime @14292+,
 * events @968+). */

/* The A entry-validation gate (PE 0x6fd7f6 ja UNSIGNED wrap lea /
   0x6fd804 ja UNSIGNED / 0x6fd810 jl SIGNED). */
export function gameUpdateSlice6fd7c0ArgsValid(roomIndex, anim, dimension) {
  return frameEffect6fd7c0ArgsValid(roomIndex | 0, anim >>> 0, dimension | 0) ? 1 : 0;
}

/* The ordered fatal classifier: 0 OK / 1 room / 2 anim / 3 dim, PE order. */
export function gameUpdateSlice6fd7c0ValidateFailKind(roomIndex, anim, dimension) {
  return frameEffect6fd7c0ValidateFailKind(roomIndex | 0, anim >>> 0, dimension | 0);
}

/* The pushed fatal string: 0xb68490 / 0xb684cc / 0xb68508 / 0 (u32 wrap). */
export function gameUpdateSlice6fd7c0FatalStringVa(failKind) {
  return frameEffect6fd7c0FatalStringVa(failKind | 0) >>> 0;
}

/* The shared fatal log level (push 8 at 0x6fdbe2). */
export function gameUpdateSlice6fd7c0FatalLevel() {
  return frameEffect6fd7c0FatalLevel();
}

/* The blue-room arm gate: anim==0 && (dim<0 SIGNED || dim==mode1830c) —
   PE 0x6fdb57 test edi / 0x6fdb5b js / 0x6fdb64 cmp. SITE-DECIDABLE (the
   state mode lane); no new capture (why the v73 drop works). */
export function gameUpdateSlice6fd7c0BlueRoomReach(anim, dimension, mode1830c) {
  return frameEffect6fd7c0BlueRoomEligible({
    anim: anim >>> 0,
    dimension: dimension | 0,
    roomTransitionMode1830c: mode1830c | 0,
  }) ? 1 : 0;
}

/* The blue-room REWRITE value: cmovne 0xfffffff0 (PE 0x6fdb7f/0x6fdb84).
   VALUE law only — the probe RESULT is the staged blue-room probe lane. */
export function gameUpdateSlice6fd7c0BlueRoomApplyIndex(roomIndex) {
  return frameEffect6fd7c0ApplyBlueRoomIndex(roomIndex | 0) | 0;
}

/* The engine-prefix arm gate: the 0x82ee40 call @0x6fdb9b is reached iff
   valid && !mode4 (mode-4 early ret @0x6fd877). The anim-0xc special alt
   tail (jmp 0x6fd82c -> SFX build) is unreachable at the Update sites
   (site A anim 20 / site B anim 0; the special requires anim==0xc +
   [Game+0x0]==1 + the host probes — staged lanes). */
export function gameUpdateSlice6fd7c0EnginePrefixFires(valid, mode4) {
  if ((valid | 0) === 0) return 0;
  if ((mode4 | 0) !== 0) return 0;
  return 1;
}

/* ---- ABI v104 (record idx 12 transition-pack REAL wiring; wave
   update-v104-record12-wire): the 6 CAPTURE-DEPENDENT arm laws of the
   pack (census update-v102-record12-tran §5; disasm anchors in the unit
   NOTES). Byte-gated lanes are FULL-DWORD inputs re-narrowed & 0xff
   in-body (the PE gates are AL byte tests). No uint8_t params. ---- */

/* C arm selector: 0 none / 1 REWRITE {anim 3, dim 0} / 2 NESTED (PE
   0x6fd87a..0x6fd8c1: anim==0xc FULL-DWORD && game0==1 FULL-DWORD &&
   alt AL==0 && eq && byte1; open && route AL!=0 -> rewrite, ==0 ->
   nested 0x6fdc10). */
export function gameUpdateSlice6fd7c0Anim0xcRoute(anim, game0, altProbe, roomEq, roomByte1, routeProbe) {
  if ((anim >>> 0) !== 0xc) return 0;
  if ((game0 >>> 0) !== 1) return 0;
  if (((altProbe | 0) & 0xff) !== 0) return 0;
  if ((roomEq | 0) === 0) return 0;
  if (((roomByte1 | 0) & 0xff) === 0) return 0;
  return (((routeProbe | 0) & 0xff) !== 0) ? 1 : 2;
}

/* The StageTransition typed-event predicate (@968): 1 iff the C arm
   routes NESTED. Consumes the route selector BY REFERENCE. */
export function gameUpdateSlice6fd7c0StageTransitionReach(anim, game0, altProbe, roomEq, roomByte1, routeProbe) {
  return gameUpdateSlice6fd7c0Anim0xcRoute(anim, game0, altProbe, roomEq, roomByte1, routeProbe) === 2 ? 1 : 0;
}

/* D arm: the 0x8279a0 player-loop gate opens iff (anim==3||0xc) &&
   arg3!=0 FULL-DWORD && player AL!=0 (PE 0x6fd8fa/0x6fd904/0x6fd922).
   A SIGNED -1 arg3 opens the arm. */
export function gameUpdateSlice6fd7c0PlayerLoopReach(anim, arg3, playerProbe) {
  const a = anim >>> 0;
  if (a !== 3 && a !== 0xc) return 0;
  if ((arg3 | 0) === 0) return 0;
  if (((playerProbe | 0) & 0xff) === 0) return 0;
  return 1;
}

/* D arm: the anim-3 ROOM-TYPE dispatch — 0 none / 1 0x425ac0 (@976) /
   2 direct-705ee0. Dispatch runs only when anim==3 (0x6fdad2 FULL-DWORD)
   and the player gate CLOSED (AL==0); type FULL-DWORD (0x6fdadd) with
   0xb/0x11 gated on the SUBROOM flag BYTE bit0 (0x6fdae8 testb): flag
   clear -> 0x425ac0; type 0xa/0x3 -> 0x425ac0; else 705ee0. */
export function gameUpdateSlice6fd7c0RoomDispatchReach(anim, playerProbe, roomType8, subroomFlag44) {
  if ((anim >>> 0) !== 3) return 0;
  if (((playerProbe | 0) & 0xff) !== 0) return 0;
  const type = roomType8 >>> 0;
  if ((type === 0xb || type === 0x11) && (((subroomFlag44 | 0) & 0xff & 1) === 0)) return 1;
  if (type === 0xa || type === 0x3) return 1;
  return 2;
}

/* E arm: the 0x82ee40 arg0 cmov (0x6fdb7f/0x6fdb84): blue probe AL!=0 ->
   -0x10. Feeds the host fold re-issue. */
export function gameUpdateSlice6fd7c0EngineRoomArg(roomIndex, blueProbe) {
  return (((blueProbe | 0) & 0xff) !== 0) ? -0x10 : (roomIndex | 0);
}

/* F arm: the 0x6f0070 predicate AL!=0 -> [Game+0x265c0]=0 (0x6fdba6/
   0x6fdbb1; byte 0x67744 stays unconditional on the P4 family law). */
export function gameUpdateSlice6fd7c0Terminal265c0Clear(enginePredProbe) {
  return (((enginePredProbe | 0) & 0xff) !== 0) ? 1 : 0;
}

/* ABI v96 (record idx 46 playerManagerUpdateHeartbeatSfxPlay depth): PLAY
   CONTINUATION body-law mirrors. The v88 typed-leaf split landed the ENTRY
   gate; these FORWARD the continuation body laws BY REFERENCE to the sfx
   family model (never re-derived — sfx-pure-model.mjs SP section):
     A4 window_open  sfxPlayWindowOpen  (PE 0x92dd04..0x92dd0a)
     A6 seed         sfxRngNext         (PE 0x92dd51..0x92dd77)
     A7 voice        sfxVoiceSelect     (PE 0x92dd75..0x92dd80)
     A7 pick_offset  sfxVoicePickOffset (PE 0x92dd82..0x92dd90)
     A9 volume       sfxVoiceVolumeClamped (PE 0x92de22..0x92de41) */
export function gameUpdateSliceSfxPlayWindowOpen(clock4abbc, entryEnd4) {
  return sfxPlayWindowOpen(clock4abbc, entryEnd4) ? 1 : 0;
}

export function gameUpdateSliceSfxPlaySeedNext(seed, shift1, shift2, shift3) {
  return sfxRngNext(seed, shift1, shift2, shift3) >>> 0;
}

export function gameUpdateSliceSfxVoiceSelect(seedOut, voices) {
  return sfxVoiceSelect(seedOut, voices) >>> 0;
}

export function gameUpdateSliceSfxVoicePickOffset(voiceIndex) {
  return sfxVoicePickOffset(voiceIndex) | 0;
}

export function gameUpdateSliceSfxVoiceVolumeClamped(mgrVolumeModifier, volume, masterVolume) {
  return Math.fround(sfxVoiceVolumeClamped(mgrVolumeModifier, volume, masterVolume));
}

/* The COMPOSED continuation plan: the ordered A4->A6->A7->A9 chain gated
   on windowOpen (A4 closed = PE side-effect-free ret 0x92de8b — the seed
   never advances, no voice is picked, volume is not computed). */
export function gameUpdateSliceSfxPlayContinuation({
  clock4abbc = 0, entryEnd4 = 0, rngSeed = 0, voices = 0,
  mgrVolumeModifier = 0, volume = 0, masterVolume = 0,
} = {}) {
  const windowOpen = gameUpdateSliceSfxPlayWindowOpen(clock4abbc, entryEnd4);
  if (windowOpen === 0) {
    return Object.freeze({
      windowOpen: 0,
      seedOut: rngSeed >>> 0,
      voiceIndex: 0,
      voiceOffset: 0,
      volumeBits: 0,
      bodyReached: 0,
    });
  }
  const seedOut = gameUpdateSliceSfxPlaySeedNext(
    rngSeed, SFX_PLAY_RNG_SHIFT1, SFX_PLAY_RNG_SHIFT2, SFX_PLAY_RNG_SHIFT3);
  const voiceIndex = gameUpdateSliceSfxVoiceSelect(seedOut, voices);
  const clamped = Math.fround(gameUpdateSliceSfxVoiceVolumeClamped(
    mgrVolumeModifier, volume, masterVolume));
  return Object.freeze({
    windowOpen: 1,
    seedOut: seedOut >>> 0,
    voiceIndex: voiceIndex >>> 0,
    voiceOffset: gameUpdateSliceSfxVoicePickOffset(voiceIndex) | 0,
    volumeBits: bitsFromF32(clamped) >>> 0,
    bodyReached: 1,
  });
}

/* ABI v95 (record idx 44 PM3 arm laws, PlayerManager::Update PM3 arm
   0x009bb76e..0x009bb835). quietGate mirrors PE 0x009bb774 movss xmm0,
   [0xbaa06c]=0.01f / 0x009bb782 comiss xmm0,xmm1 / 0x009bb78c jb
   0x9bb7ad: comiss CF = (0.01f < maxVol) || unordered, so the QUIET arm
   is ordered 0.01f >= maxVol. NaN maxVol -> unordered -> CF=1 -> LOUD
   (JS `>=` on NaN is false). Boundary: maxVol == 0.01f EXACTLY is quiet
   (CF=0). The quiet arm probes is-playing (0x92e560) and either pure-skips
   (al==0, 0x9bb795 je) or runs the 0x92e230 stop (0x9bb7a2). */
export function gameUpdateSlicePm3QuietGate(maxVol) {
  return Math.fround(0.01) >= Math.fround(maxVol) ? 1 : 0;
}

/* emptyPureSkip: the EMPTY player vector leaves maxVol = 0.0f (PE
   0x009bb6b2 xorps xmm1,xmm1; 0x009bb6c3 test eax,eax / 0x009bb6c5 je
   0x9bb76e skips the loop) -> the arm is QUIET and the probe 0x92e560
   returns al==0 -> PE 0x009bb795 je 0x9bb830: the WHOLE PM3 arm (and thus
   the heartbeat) is a host-free pure skip. FULL-DWORD count compare
   (0x100 must NOT be empty: PE counts (end-begin) SAR 2). */
export function gameUpdateSlicePm3EmptyPureSkip(playerCount, isPlaying) {
  const playing = isPlaying !== 0 ? 1 : 0;
  const quiet = gameUpdateSlicePm3QuietGate(0);
  return (playerCount >>> 0) === 0 && quiet !== 0 && playing === 0 ? 1 : 0;
}

/* emptyStopSplit: empty vector + playing -> the QUIET arm's probe is
   nonzero -> ONLY the 0x92e230 SFX stop runs (PE 0x009bb7a2, epilogue A).
   The whole-heartbeat MONOLITHIC residual must NOT fire for the empty
   vector (the PM2 loop is skipped, maxVol=0 — no pack required). The stop
   body stays the typed record-47 host lane (v60 entry gate). */
export function gameUpdateSlicePm3EmptyStopSplit(playerCount, isPlaying) {
  const playing = isPlaying !== 0 ? 1 : 0;
  const quiet = gameUpdateSlicePm3QuietGate(0);
  return (playerCount >>> 0) === 0 && quiet !== 0 && playing !== 0 ? 1 : 0;
}

/* ABI v95 (record idx 0, FCO): PlayerManager::FirstCollectibleOwner
   (0x009be080) decision laws (wave-18 unit update-v95-record0-fco). Exact
   ZHL `FirstCollectibleOwner(CollectibleType, RNG**, bool)`, 174 direct
   rel32 callers. Fresh census: arg2 RNG** [ebp+0xc] is NEVER READ — no
   CRT/genrand draw in this body (the xorshift draw lives in the sibling
   RandomCollectibleOwner 0x009be150) -> per unit contract NO RNG
   typed-host lands; the sparse hud_stat_owner_byte capture stays. These
   laws transcribe the pure decision CF (bool 3rd arg gate 0x9be0a7..0x9be0c6;
   list empty FULL dword 0x9be0ce; slot gate FULL dword [player+0x2c]==0
   0x9be0d9; HasCollectible hit LOW BYTE 0x9be0e9/0x9be105; twin shared-
   byte-then-ptr gate 0x9be0ed/0x9be0f9; walk iter+4 wrap 0x9be10d; continue
   FULL dword 0x9be110; result select 0x9be115/0x9be120/0x9be12f). Byte-gate
   args are RAW uint32 (WIDE-driven) and re-narrowed in the body. */
export const FCO9BE080_VA = 0x009be080;
export const FCO9BE080_GET_COLLECTIBLE_VA = 0x0072fd10;
export const FCO9BE080_HAS_COLLECTIBLE_VA = 0x007706e0;
export const FCO9BE080_ITEM_FLAGS_OFS = 0xb8; /* item+0xb8 twin bit */
export const FCO9BE080_TWIN_BIT = 0x80000000;
export const FCO9BE080_LIST_STRIDE = 4; /* add esi,4 @0x9be10d */
export const FCO9BE080_PROBE_WORDS = 5; /* ptr,f2c,has1,twin,has2 */
export function fcoTwinFlag(arg3Byte, itemPtr, itemFlagsB8) {
  if ((arg3Byte & 0xff) === 0) return 0;
  if ((itemPtr >>> 0) === 0) return 0;
  return (itemFlagsB8 & FCO9BE080_TWIN_BIT) !== 0 ? 1 : 0;
}
export function fcoListEmpty(listBegin, listEnd) {
  return (listBegin >>> 0) === (listEnd >>> 0) ? 1 : 0;
}
export function fcoSlotCheckable(playerField2c) {
  return (playerField2c >>> 0) === 0 ? 1 : 0;
}
export function fcoHasCollectibleHit(alByte) {
  return (alByte & 0xff) !== 0 ? 1 : 0;
}
export function fcoTwinCheckNeeded(sharedByte, twinPtr) {
  if ((sharedByte & 0xff) === 0) return 0;
  return (twinPtr >>> 0) !== 0 ? 1 : 0;
}
export function fcoWalkNext(iter) {
  return ((iter >>> 0) + FCO9BE080_LIST_STRIDE) >>> 0;
}
export function fcoWalkContinue(nextIter, listEnd) {
  return (nextIter >>> 0) !== (listEnd >>> 0) ? 1 : 0;
}
export function fcoWalkOwner(
  arg3Byte, itemPtr, itemFlagsB8, listBegin, listEnd, probes, probeCount,
) {
  if (probes == null || probeCount === 0) return 0;
  const shared = fcoTwinFlag(arg3Byte, itemPtr, itemFlagsB8);
  if (fcoListEmpty(listBegin, listEnd) !== 0) return 0;
  let iter = listBegin >>> 0;
  for (let i = 0; i < probeCount; i += 1) {
    const entry = i * FCO9BE080_PROBE_WORDS;
    const playerPtr = probes[entry + 0] >>> 0;
    const f2c = probes[entry + 1] >>> 0;
    const hasPrimary = probes[entry + 2] >>> 0;
    const twinPtr = probes[entry + 3] >>> 0;
    const hasTwin = probes[entry + 4] >>> 0;
    if (fcoSlotCheckable(f2c) !== 0) {
      if (fcoHasCollectibleHit(hasPrimary) !== 0) return playerPtr;
      if (
        fcoTwinCheckNeeded(shared, twinPtr) !== 0 &&
        fcoHasCollectibleHit(hasTwin) !== 0
      ) {
        return twinPtr;
      }
    }
    iter = fcoWalkNext(iter);
    if (fcoWalkContinue(iter, listEnd) === 0) break;
  }
  return 0;
}

/* ---- ABI v95 (wave update-v96-record0-tail): record-0 StatHUD tail DECISION
   laws. The tail = the 0x84c170 controller (called at 0x009a2bb2 from
   HUD::PostUpdate, receiver StatHUD). Census this unit: 0x84ca00 3 callers
   (only 0x84c206 on the record-0 path; 0x84d66d in the 0x84cc40 tween
   walker [callers 0x9bef23/0x9bf3d3], 0x9a8b5e in 0x9a8970 — both outside
   record 0); 0x9be080 174 callers; 0xa112c0 3286 callers image-wide (tail
   site 0x84c1da); 0xaef15c sized-free 3702 callers image-wide and ZERO
   inside the tail closure (0x84c170/0x84bf30/0x84ca00/0x9be080) — the
   sized-free edge is REFUTED for the tail. Byte gates re-narrow in bodies
   only where the PE tests a byte; all scalar params uint32. */

export function hudStatTailFatalEmpty(count) {
  /* 0x84c1cf test eax,eax / jne 0x84c1e5 — FULL-DWORD on the per-iteration
     re-derived (end-begin)>>2 count: 0 fires the fatal log 0xa112c0
     (level 0x10, fmt 0xb7e6bc); WIDE 0x100/0xffffffff do NOT fire. In the
     static blob lane the count is invariant and the lane gate requires
     1..8, so the typed host event hudStatWalkFatalEmpty never fires
     in-lane (host-mutation-only arm). */
  return (count >>> 0) === 0 ? 1 : 0;
}

export function hudStatTailOwnerMode(ownerWord) {
  /* 0x84c1a6 test eax,eax / setne al — FULL-DWORD truthiness of the FCO
     (0x9be080) result pointer; the byte stored to StatHUD+0x2ac also
     selects the k=6 tween target formula (0x84cba1). 0x100/0xffffffff
     are owners; only 0 is not. */
  return (ownerWord >>> 0) !== 0 ? 1 : 0;
}

export function hudStatTailRecomputeMode(gameFrame264f8, entryFrame328) {
  /* 0x84ca28..0x84ca3f (RecomputeStats head): flag = (i32[Game+0x264f8] -
     i32[entry+0x328]) SIGNED-diff, cmp eax,1 / setg al -> mode arg of all
     11 tween calls. entry frame 0x80000000 (F328) with game frame 0 ->
     negative diff -> 0 (an unsigned compare would return 1). */
  const diff = ((gameFrame264f8 | 0) - (entryFrame328 | 0)) | 0;
  return diff > 1 ? 1 : 0;
}

/* ---- ABI v95 (wave update-v96-record0-tween): the RecomputeStats
   0x84ca00 SEAM decision laws (record idx 0). The seam = the shared
   per-entry body called from all THREE 0x84ca00 sites — the record-0 walk
   site 0x84c206 (mask 0xfffffeff), the per-frame tween walker 0x84cc40
   site 0x84d66d (mask 0xffffffff, player_index == dead == loop index i),
   and 0x9a8b5e. 0x84cc40 has 4 direct E8 = the three host probe leaves
   0x7f92b0/0x749830/0x7f96f0 (0x84d18e/0x84d1b6/0x84d1c7) + 0x84d66d ->
   0x84ca00 (the single RecomputeStats; it INLINES the v18 tween math);
   0x84ca00 has 14 direct E8 = 11x
   0x84d6b0 (v18 tween, landed) + the three host leaves 0x7f92b0/0x749830/
   0x7f96f0 (typed events hudStatWalkProbe1/2/3, coordinator-merged,
   offset -1, 1 per k6/k7-arm entry). The 0x84cc40 walker stays host; its
   playerhud-family ABI v33 gate/plan laws are consumed BY REFERENCE. All
   scalar params uint32. */

export function hudStatRecomputeRowStride(entryIndex) {
  /* 0x84ca13 imul edi, eax, 0xcc (also 0x84cc90 in the walker loop): the
     per-player ROW STRIDE, u32 wrap. index 2 -> 0x198; 0xffffffff ->
     0xffffff34. */
  return (entryIndex >>> 0) * 0xcc >>> 0;
}

export function hudStatRecomputeEntryValid(entryPtr) {
  /* 0x84ca19..0x84ca22 mov edx,[edi+esi+0x114]; test edx,edx / je
     0x84cc34: FULL-DWORD null gate on the entry ptr [this+0x114] — wide
     tokens (0x100/0xffffffff) are valid, only exactly 0 skips the body. */
  return (entryPtr >>> 0) !== 0 ? 1 : 0;
}

export function hudStatRecomputeSlotRuns(flags, k) {
  /* 0x84ca45..0x84cc11: per-k FLAGS BITMASK gates (test bl,1/2/4/8/0x10/
     0x20 k=0..5; test bl,0xc0 k6/k7 JOINED at 0x84cb39; test ebx,0x100
     k=8; test ebx,0x200 k=9). bit k set -> k-slot tween runs. k masked to
     0x1f (fixed PE bit positions; keeps the JS shift well-defined). */
  const bit = 1 << (k & 0x1f);
  return ((flags >>> 0) & bit) !== 0 ? 1 : 0;
}

export function hudStatRecomputeOwnerByte(ownerByte) {
  /* 0x84cba1 cmp byte ptr [esi+0x2ac], 0 / je 0x84cbba: the FCO-flag
     READ-BACK is LOW-BYTE (contrast: hudStatTailOwnerMode is the
     FULL-DWORD setne STORE of the FCO pointer — 0x100 -> 0 here, 1
     there). On real captures (stored byte 0/1) the two agree. */
  return (ownerByte & 0xff) !== 0 ? 1 : 0;
}

export function hudStatRecomputeProbe2Live(probe2Bits) {
  /* 0x84cb7a test al, al / jne 0x84cb86 (PROBE2 0x749830 returns its BOOL
     in AL; walker twin 0x84d1bb): the LOW BYTE decides whether the clamp
     is zeroed (xorps @0x84cb7e). WIDE: 0x100 -> 0 (a full-dword test
     would wrongly keep the clamp), 0x80/0x1ff/0xffffffff -> 1. Landed at
     record-0's final assessment — every k6/k7-block decision is now a
     named law (block gate slot_runs(6)|slot_runs(7), AL gate
     probe2_live, owner byte owner_byte; k7 formula pinned by test). */
  return (probe2Bits & 0xff) !== 0 ? 1 : 0;
}

/* ---- ABI v96 (wave update-v98-record0-walker): the 0x84cc40 walker's
   remaining PURE decisions (record idx 0, BY-REFERENCE host descriptions;
   the walker stays host — playerhud-family ABI v33 gate/plan consumed BY
   REFERENCE; zero layout bytes, ABI stays 96). All scalar params uint32. */

export function hudStatWalkSiteK8Skipped(mask) {
  /* 0x84cbf0 test ebx,0x100 / je 0x84cc0b — the WALK-SITE mask arm: the
     0xfffffeff pushed @0x84c1f6 survives 0x84bf30 (ret 4, thiscall + 1
     arg) as 0x84ca00's arg2 (arg3 = phantom count, never read), so bit 8
     clear -> the k=8 slot tween is SKIPPED at the record-0 walk site
     0x84c206; the 0x84cc40 walker site 0x84d66d pushes -1 -> k=8 RUNS.
     FULL-dword bit test (0xffffff00 has bit 8 SET -> 0). */
  return ((mask >>> 0) & 0x100) === 0 ? 1 : 0;
}

export function hudStatWalkerK7Target(ownerMode, probe3Bits, clampedBits) {
  /* The walker's INLINE k7 target (0x84d4c7 mode-0 via [ebp-8] =
     clamped*100 / 0x84d280 mode-1 movaps xmm2,xmm1 on the owner arm;
     0x84d31f..0x84d339 fast / 0x84d3d3..0x84d3ed full on the non-owner
     arm): owner ? clamped*100 : probe3*clamped*100 — the S2 caveat's
     true home (the SEAM k7 at 0x84cbd4..0x84cbdd is probe3*clamped*100
     UNCONDITIONAL, already lawed + pinned; on real captures probe3 ==
     1.0 so the two agree). Owner gate 0x84d1cc cmp byte [esi+0x2ac],0
     / je = LOW-BYTE (WIDE 0x100 -> non-owner formula). f32
     single-precision roundings per mulss/subss; returns f32 bits. */
  const f = Math.fround;
  const probe3 = f(fromF32Bits(probe3Bits >>> 0));
  const clamped = f(fromF32Bits(clampedBits >>> 0));
  const target = (ownerMode & 0xff) !== 0
    ? f(clamped * 100.0)
    : f(f(probe3 * clamped) * 100.0);
  return bitsFromF32(target);
}

export function hudStatWalkerK6ProbeLeafVa(mask, siteIndex) {
  /* The walker's k6 call-site dispatch (0x84d18e / 0x84d1b6 / 0x84d1c7):
     site 0/1/2 -> leaf VA 0x7f92b0 / 0x749830 / 0x7f96f0 (PROBE1/2/3),
     else 0. MASK-FREE — the walker's inline block has NO twin of the
     seam's 0x84cb39 test bl,0xc0 joined gate (the mask argument is
     deliberately ignored: this law pins that non-gate; the seam's joined
     gate is slot_runs(6)|slot_runs(7)). Same fixed leaf order as the
     equals the seam formula when probe3 == 1.0. */
  void mask;
  if (siteIndex === 0) return 0x7f92b0;
  if (siteIndex === 1) return 0x749830;
  if (siteIndex === 2) return 0x7f96f0;
  return 0;
}

/* ---- ABI v100 (wave update-v99-record0-walker): the 0x84cc40 walker
   body depth — the probe chain + the 4 direct E8 leaves' call ordering
   (record idx 0, BY-REFERENCE host descriptions; the walker stays host).
   All scalar params uint32. */

export function hudStatWalkerProbe1Clamped(probe1Bits, probe2Bits) {
  /* The walker's probe chain (0x84d199..0x84d1c2; the seam twin
     0x84cb5b..0x84cb7e is byte-identical in gates): fstp the PROBE1 x87
     result, maxss xmm0,[0xba9fe4] = max(x, 0.0) THEN minss xmm0,
     [0xbaa454] = min(x, 1.0) — maxss/minss return the SECOND operand on
     NaN, so probe1 NaN -> 0.0; then 0x84d1bb test al,al / jne —
     0x749830's BOOL is in AL, so the zeroing gate (xorps @0x84d1c2) is
     the LOW BYTE ONLY (`& 0xff`; WIDE 0x100 -> probe2_live 0 -> clamped
     0.0 — a full-dword test would wrongly keep the clamp). Composes the
     lawed hudStatRecomputeProbe2Live (no duplicated byte-gate logic);
     returns f32 bits. */
  let clamped = Math.fround(fromF32Bits(probe1Bits >>> 0));
  if (clamped !== clamped) clamped = 0.0; /* maxss(NaN, 0.0) -> 0.0 */
  if (clamped < 0.0) clamped = 0.0;       /* maxss(x, 0.0) */
  if (clamped > 1.0) clamped = 1.0;       /* minss(x, 1.0) */
  if (!hudStatRecomputeProbe2Live(probe2Bits >>> 0)) clamped = 0.0; /* xorps */
  return bitsFromF32(clamped);
}

export function hudStatWalkerE8CallOrder(position) {
  /* The walker's 4 direct E8 leaves in CALL ORDER (0x84cc40 body census;
     the seam 0x84ca00 has 14 E8, the WALKER exactly 4): position 0 =
     0x84d18e -> 0x7f92b0 (PROBE1), 1 = 0x84d1b6 -> 0x749830 (PROBE2),
     2 = 0x84d1c7 -> 0x7f96f0 (PROBE3), 3 = 0x84d66d -> 0x84ca00 (the
     RecomputeStats seam — LAST of the four, and only on the swap-back
     row arm; the swap-to-B arm inlines everything). Else 0. Completes
     hudStatWalkerK6ProbeLeafVa (v98) with the seam as E8 #4. */
  if (position === 0) return 0x7f92b0;
  if (position === 1) return 0x749830;
  if (position === 2) return 0x7f96f0;
  if (position === 3) return 0x84ca00;
  return 0;
}

/* ---- ABI v101 (wave update-v100-record0-islands): the 0x84cc40
   walker's remaining lane-free PURE islands — the swap-gate row arm,
   the RESET/TWEEN split at the walker site, the swap-back store
   semantics and the probe1-arg read. BY-REFERENCE host descriptions
   (the walker stays host); all four are wired (void) in the k6/k7
   block (v98 k6/k7 (void)-lawing precedent — the live A/B/B.f328/
   [Game+0x18300] inputs are NOT committed lanes, §lane-requests
   @14276/14280/14284/14288). All scalar params u32. */

export function hudStatWalkerRowArm(entry, playerA, playerB) {
  /* Swap-gate + swap-back row arm (0x84cc9d cmp eax,[ebx+8] /
     0x84cca0 jne + 0x84d659 cmp eax,edx / 0x84d65b jne): FULL-DWORD
     compares of the row entry [StatHUD+i*0xcc+0x114] against the live
     swap args (A = arg1 = swap-out, B = arg2 = swap-in): entry==A -> 1
     (swap-to-B store @0x84cca6 + the inline RESET/TWEEN body), entry==B
     -> 2 (swap-back @0x84d666 + the 0x84d66d seam call), else 0; A is
     checked before B (a == b == entry takes arm 1). */
  if ((entry >>> 0) === (playerA >>> 0)) return 1;
  if ((entry >>> 0) === (playerB >>> 0)) return 2;
  return 0;
}

export function hudStatWalkerResetSplit(frameCounter264f8, bFrame328) {
  /* The walker-site RESET/TWEEN split (0x84ccc8 sub eax,[edx+0x328] /
     0x84ccce cmp eax,1 / 0x84ccd1 jg 0x84ce1b): the flag [ebp-1]
     (0 = RESET, 1 = TWEEN) = SIGNED full-dword (i32[Game+0x264f8] -
     i32[B+0x328]) > 1 — the EXACT lawed seam head formula
     hudStatTailRecomputeMode re-derived at the walker's site on B
     (composed, not duplicated). */
  return hudStatTailRecomputeMode(frameCounter264f8, bFrame328);
}

export function hudStatWalkerSwapStore(rowArm, entry, playerA, playerB) {
  /* The swap stores (arm 1: 0x84cca6 entry := B; arm 2: 0x84d666 entry
     := A BEFORE the 0x84d66d seam call — the seam then re-derives mode
     from A.f328 under mask -1; arm 0: no store, the entry passthrough).
     The arm-1 store runs before the FULL-DWORD B==0 bail (0x84ccb5 test
     edx,edx / je — a NULL B still leaves the row at NULL, self-healing
     next frame). */
  if ((rowArm >>> 0) === 1) return playerB >>> 0;
  if ((rowArm >>> 0) === 2) return playerA >>> 0;
  return entry >>> 0;
}

export function hudStatWalkerProbe1Arg(game18300) {
  /* PE 0x84d188 mov ecx,[eax+0x18300] — the probe1 ARG read: the FULL
     dword at Game+0x18300 (the game ROOM ptr word, ABI v67 pinned to 0
     in the sparse lanes; seam twin 0x84cb47, PM swap twin 0x9bf31f) is
     transferred WHOLE into ecx for leaf 0x7f92b0 — no byte gate, no
     narrowing (identity). */
  return game18300 >>> 0;
}

/* ABI v95 (record idx 8 MenuGateOpen 0x009b7680 head laws, wave-18 unit
   update-v95-menu-open-census): the recoverable pure islands of the
   7224-byte 9-function menu-object span (full-body census in NOTES: 1979
   insns / 0 resyncs / 128 direct + 15 indirect; irreducible SFX
   0x92dc30/0x956780/0x92e300 + ANM2 Load/Rewind/GetLayer + 12 alloc sites +
   8 virtual slots keep the record HOST). Each law mirrors one PE spine of
   the head 0x9b7680..0x9b7a1e; all scalars uint32 (Wasm i32 un-narrowed). */
export function menuOpenSlotSelect(menuMode) {
  /* 0x009b772f cmp dword [edi+4],1 / 0x009b7733 mov ebx,0x140 /
     0x009b7738 mov eax,0x2c / 0x009b774c cmovne esi,eax — FULL-DWORD. */
  return (menuMode | 0) === 1 ? 0x140 : 0x2c;
}
export function menuOpenLayer74RangeNonempty(byteLength) {
  /* 0x009b7979 mov ecx,[edx+0x4b3d8] / 0x009b797f cmp ecx,[edx+0x4b3dc] /
     0x009b7989 setne al — FULL-DWORD begin!=end. */
  return (byteLength >>> 0) !== 0 ? 1 : 0;
}
export function menuOpenLayer74CountGtOne(byteLength) {
  /* 0x009b79c4 cmp edx,ecx / je 0; 0x009b79c8 sub ecx,edx /
     0x009b79ca sar ecx,2 / 0x009b79cd cmp ecx,1 / 0x009b79d0 jbe 0:
     count = (end-begin)>>2 ARITHMETIC, UNSIGNED bound > 1. WIDE:
     0x100 -> 0x40 -> 1; 4 -> 1 -> 0; 0xffffffff -> -1 -> u32>1 -> 1. */
  const delta = (byteLength | 0); /* re-narrow i32 */
  const count = delta >> 2; /* SAR */
  return (count >>> 0) > 1 ? 1 : 0;
}
export function menuOpenLayer74DifficultyOne(difficulty269c8) {
  /* 0x009b7a04 cmp dword [ecx+0x269c8],1 / 0x009b7a0b sete cl —
     FULL-DWORD equality. */
  return (difficulty269c8 | 0) === 1 ? 1 : 0;
}
export function menuOpenFacIndex(spanBegin, spanEnd, target, samples, sampleCount) {
  /* 0x009b76ed mov edx,[esi+0x1baa8] / 0x009b76f5 mov esi,[esi+0x1baac] /
     0x009b76fb sub esi,edx / 0x009b76fd sar esi,2 (SAR32 count) /
     0x009b7700 test esi,esi / je 0x9b7710 (count==0 -> -1) /
     0x009b7704 cmp [edx],eax / je (full-dword match -> i) /
     0x009b7708 inc ecx / add edx,4 / 0x009b770c cmp ecx,esi /
     0x009b770e jb (UNSIGNED bound) / 0x009b7710 or ecx,-1. */
  const delta = (((spanEnd >>> 0) - (spanBegin >>> 0)) >>> 0) << 0 >> 0;
  const count = delta >> 2;
  if (count === 0) return -1;
  const bound = count >>> 0; /* UNSIGNED jb compare */
  for (let i = 0; (i >>> 0) < bound; i += 1) {
    if (i >= sampleCount) return -1; /* capture cap (defensive) */
    if ((samples[i] >>> 0) === (target >>> 0)) return i;
  }
  return -1;
}

/* ABI v95 (record idx 34 B13 H5 FUN_00824a70 per-loop create arm): the
   per-loop PURE LAWS landed in-module; entity create 0x6fe410 STAYS TYPED
   HOST. loop_count_from_age mirrors PE 0x00824b60 test ecx,ecx (age =
   Room[0]==0 ? -1 : Game+0x264f8 - Room+0x11f0) / 0x00824b7f sete al /
   0x00824b9c lea eax,[eax*4+1]: age==0 -> 5, else 1. create_args_plan is
   the typed CREATE-arm argument plan (PE 0x00824c97..0x00824cc2): type
   0x3e8 / variant 0x8a / layer 0 / data 0xb1bc54 / a1 1 / seed (=R3
   genrand dword) / game ptr 0xc71678. r4_genrand_needed mirrors PE
   0x00824cd8 test edi,edi ([anm2+0x30] anim_count) / 0x00824cda je skip:
   the R4 anim-frame draw runs iff anim_count != 0 (FULL-DWORD compare —
   WIDE 0x100 / 0xffffffff still draw). */
export const AMBIENT_824A70_MAX_LOOPS = 64; /* matches the slice's loop cap */
export function gameUpdateSliceAmbient824a70LoopCountFromAge(age) {
  return (age >>> 0) === 0 ? 5 : 1;
}
export function gameUpdateSliceAmbient824a70CreateArgsPlan(seed) {
  /* Flat 7-word per-loop scratch order (must match the C++ struct +
     scratch layout): [effect_type, effect_variant, layer_index,
     anm_data_ptr, a1_arg, seed, game_ptr_global]. */
  return Object.freeze({
    effectType: 0x3e8,
    effectVariant: 0x8a,
    layerIndex: 0,
    anmDataPtr: 0xb1bc54,
    a1Arg: 1,
    seed: seed >>> 0,
    gamePtrGlobal: 0xc71678,
  });
}
export function gameUpdateSliceAmbient824a70CreateArgsWords(seed) {
  const p = gameUpdateSliceAmbient824a70CreateArgsPlan(seed);
  return [
    p.effectType >>> 0, p.effectVariant >>> 0, p.layerIndex >>> 0,
    p.anmDataPtr >>> 0, p.a1Arg >>> 0, p.seed >>> 0, p.gamePtrGlobal >>> 0,
  ];
}
export function gameUpdateSliceAmbient824a70R4GenrandNeeded(animCount) {
  return (animCount >>> 0) !== 0 ? 1 : 0;
}

/* ABI v95 (R4 equal-flags capture, record idx 10): full non-empty walk
   decision consumed BY REFERENCE from the frozen frame-opaque 40add0 law
   (frameOpaque40add0ProbeFromEqualFlags = first_match_index over the
   per-entry equal-flag bytes, then the bit test of [A+0x18]). 1 = probe
   TRUE (match + bit set -> true-probe interior 0x421343 stays host);
   0 = probe FALSE (miss or bit clear -> pure 0x4213de clear). */
export function gameUpdateSlice4212c0Add0ProbeFromEqualFlags(equalFlags, listCount, bitfield18) {
  return frameOpaque40add0ProbeFromEqualFlags(equalFlags, listCount, bitfield18) ? 1 : 0;
}
export function gameUpdateSlice8ef990Join956780Closed(
  game, nodeBd, nodeF10, nodePtr, sentinel) {
  const closed = roomTransitionEngine956780Gate(
    game | 0, nodeBd >>> 0, nodeF10 | 0, nodePtr >>> 0, sentinel >>> 0) === 0 ? 1 : 0;
  return closed;
}
/* ABI v96 (wave update-v96-record9-tailalaws, record idx 9): TAIL-A seam
   decision laws (0x8efcea..0x8efdd1). Pure exported mirrors; NO runtime
   lanes/events added (ABI stays 95, layouts frozen) — the host feeds the
   seam operands at the call boundary. */
export function gameUpdateSlice8ef990TailaSlotEmpty(slotBegin, slotEnd) {
  /* D1: PE 0x8efcf4 mov eax,[M+0x4b3d8] / 0x8efcfa cmp eax,[M+0x4b3dc] /
     0x8efd00 je 0x8efd3e — FULL-dword begin==end (MP slot empty -> ARM B). */
  return (slotBegin >>> 0) === (slotEnd >>> 0) ? 1 : 0;
}
export function gameUpdateSlice8ef990ElseResetState() {
  /* PE 0x8efdd1 mov dword ptr [edi],2. */
  return 2;
}
export function gameUpdateSlice8ef990ElseResetMode() {
  /* PE 0x8efdd7 mov dword ptr [edi+0xc],8 (mode24ed8=8). */
  return 8;
}
export function gameUpdateSlice8ef990ElseResetValue() {
  /* PE 0x8efdde mov dword ptr [edi+4],0xffffffff (value24ed0=-1). */
  return 0xffffffff;
}
export function gameUpdateSlice8ef990Taila956780Closed(
  game, nodeBd, nodeF10, nodePtr, sentinel) {
  /* SITE-PINNED (0x8efd9f) re-export of the v93 JOIN law: gate closed ->
     the 0x956780 prep is a pure no-op and the played id stays the fallback
     0x36 (PE 0x8efd97 mov [esp+0x10],0x36). Same 0x4288a0 gate shape. */
  return gameUpdateSlice8ef990Join956780Closed(game, nodeBd, nodeF10, nodePtr, sentinel);
}
export function gameUpdateSlice8ef990TailaSfxId(roll) {
  /* OPEN-path roll select: the xorshift roll output feeds the magic-mul
     mod-20 zero test (PE 0x956850..0x95686c: 0xcccccccd mul / shr edx,4
     exact iff roll % 20 == 0; 0x956806 seeds 0x25; 0x95686e overwrites
     0x12d) — UNsigned % 20 computed in-module (sfx-family rare_hit
     precedent). The xorshift RNG chain [0xc5d2b0] stays host. */
  return ((roll >>> 0) % 20) === 0 ? 0x12d : 0x25;
}
/* ABI v95 (record idx 9 listener registry, 0xc57b18 surface): the pure
   walk/find DECISION laws of the record-9 probe-arm accept gate. The
   virtual Notify dispatch (vtbl+0x74 = 0xa20fb0 walk), the [0xc7e814] hook
   and the obj release chain stay TYPED HOST; the host captures per-element
   class-bits and these laws reproduce the accept decision in-module.
   Element pair {key,obj} stride 8 over [this+8..this+0xc]; key->[+0xc] =
   id; the accept = key->vtbl[0x34](mode) via callback 0xa209e0. Per-element
   bits: bit0 obj present, bit1 obj active (obj->vtbl[1]()), bit2 obj
   release (obj->vtbl[3]()), bits 4..9 accept(mode_k) for the SIX fixed
   record-9 modes k=0..5 -> [0xe,0xf,0x16,0x17,0x14,0x15]. */
export const STATE24ECC_8EF990_LISTENER_MODES = Object.freeze([0xe, 0xf, 0x16, 0x17, 0x14, 0x15]);
export const STATE24ECC_8EF990_LISTENER_MAX_ELEMS = 16;

/* 0xa2100d mov eax,[ebx+0xc] / 0xa21016 mov ecx,[ebx+8] / 0xa21019 sub
   eax,ecx / 0xa2101b sar eax,3 (slot-7 size 0xa20068..0xa2006e): count =
   SAR32(end-begin, 3) — FULL-DWORD arithmetic shift; wrapped/negative spans
   give negative counts (the walk loop still runs -> not the empty arm). */
export function gameUpdateSlice8ef990ListenerCount(begin, end) {
  return ((end - begin) | 0) >> 3;
}

/* 0xa20390 find: 0xa203f0 mov ecx,[eax] / 0xa203f2 cmp [ecx+0xc],edi /
   0xa203f5 je found / 0xa203f7 add eax,8 / 0xa203fa cmp eax,edx / jne.
   FIRST-match linear scan of key ids == value, full-dword equality; the
   stride-copy + release chain are host side effects. */
export function gameUpdateSlice8ef990ListenerFind(count, value, ids) {
  const v = value >>> 0;
  for (let i = 0; i < count; i++) {
    if ((ids[i] >>> 0) === v) return 1;
  }
  return 0;
}

/* Record-9 probe-arm accept on the walk FIND path (arg0 != -1): PE 0xa21116
   cmp [ebp-0x1c],0 / je 0xa2118a (no match -> 0), then the callback
   0xa209e0 accept = key->vtbl[0x34](*arg2 == mode), captured as
   bits[first][4+k]. The six machine mode constants are FIXED by the
   contract; mode_index out of [0,6) -> 0. */
export function gameUpdateSlice8ef990ListenerArmAccept(count, value, modeIndex, ids, bits) {
  const k = modeIndex >>> 0;
  if (k >= STATE24ECC_8EF990_LISTENER_MODES.length) return 0;
  const v = value >>> 0;
  let first = -1;
  for (let i = 0; i < count; i++) {
    if ((ids[i] >>> 0) === v) {
      first = i;
      break;
    }
  }
  if (first < 0) return 0;
  return ((bits[first] >>> 0) >>> (4 + k)) & 1;
}

/* Record-9 walk-all accept (arg0 == -1): PE 0xa21055 test eax,eax / je
   (obj==0 skip), 0xa21059..0xa21061 obj->vtbl[1]() (active), 0xa2106e..0xa21073
   pair.obj->vtbl[3]() (release), commit, then the callback accept on the
   committed key (0xa21093..0xa210b1). cur = last committed element; element
   i commits iff present && active && (none committed yet or the previous
   committed obj releases). No commit ever -> 0 (the machine would call the
   callback with a null key; accept 0 is the pure decision). */
export function gameUpdateSlice8ef990ListenerWalkAccept(count, modeIndex, bits) {
  const k = modeIndex >>> 0;
  if (k >= STATE24ECC_8EF990_LISTENER_MODES.length) return 0;
  let cur = -1;
  for (let i = 0; i < count; i++) {
    const b = bits[i] >>> 0;
    if ((b & 1) !== 0 && (b & 2) !== 0 &&
        (cur < 0 || ((bits[cur] >>> 0) & 4) !== 0)) {
      cur = i;
    }
    if (cur >= 0 && (((bits[cur] >>> 0) >>> (4 + k)) & 1) !== 0) {
      return 1;
    }
  }
  return 0;
}
/* Publishes the v93 proof event when the host captured the JOIN seam blob
   (ready=0 keeps the pre-v93 always-host JOIN with no event). */
function emitState24ecc8ef990JoinPure(runtimeInputs, events) {
  if ((runtimeInputs.state24ecc8ef990JoinReady | 0) === 0) return;
  const skip = gameUpdateSlice8ef990JoinSkip(
    runtimeInputs.state24ecc8ef990JoinProbe >>> 0,
    runtimeInputs.state24ecc8ef990JoinIdx8 >>> 0);
  const closed = gameUpdateSlice8ef990Join956780Closed(
    runtimeInputs.state24ecc8ef990956780Game >>> 0,
    runtimeInputs.state24ecc8ef990956780NodeBd >>> 0,
    runtimeInputs.state24ecc8ef990956780NodeF10 >>> 0,
    runtimeInputs.state24ecc8ef990956780NodePtr >>> 0,
    runtimeInputs.state24ecc8ef990956780Sentinel >>> 0);
  if (skip !== 0 || closed !== 0) {
    events.state24ecc8ef990JoinPure = 1;
  }
}
/* Publishes the v92 proof event when the captured span is empty (ready=0
   keeps the pre-v92 always-host walk with no event). */
function emitWalkEmptySkip(runtimeInputs, events) {
  if ((runtimeInputs.frameOpaque98dba0WalkReady | 0) !== 0 &&
      gameUpdateSlice98dba0WalkPureSkip(
        runtimeInputs.frameOpaque98dba0WalkBegin >>> 0,
        runtimeInputs.frameOpaque98dba0WalkEnd >>> 0) !== 0) {
    events.frameOpaque98dba0WalkEmptySkip = 1;
  }
}
/* ABI v95 (record idx 32): FUN_00956110 probe pure-decision proof. The host
   walk captures per-edge samples (site id = events.frameOpaque98dba0Site);
   ready=0 keeps the pre-v95 always-host probe with no event. A PURE outcome
   (net-early byte law OR the id==-1 walk fold with complete capture)
   publishes probe_pure; the platform IO tail 0x864c30, the walk-path
   [[entry]+0x30] dispatch, and the general callback 0xa20940 dispatch stay
   typed-host (resultPlan.host*). */
function emit98dba0956110Pure(runtimeInputs, events) {
  if ((runtimeInputs.frameOpaque98dba0956110Ready | 0) === 0) return;
  const plan = gameUpdateSlice98dba0956110ResultPlan({
    managerMode: runtimeInputs.frameOpaque98dba0956110ManagerMode >>> 0,
    globalC71690: runtimeInputs.frameOpaque98dba0956110GlobalC71690 >>> 0,
    mpBegin: runtimeInputs.frameOpaque98dba0956110MpBegin >>> 0,
    mpEnd: runtimeInputs.frameOpaque98dba0956110MpEnd >>> 0,
    arg2: runtimeInputs.frameOpaque98dba0956110Arg2 >>> 0,
    netHostOk: runtimeInputs.frameOpaque98dba0956110NetHostOk >>> 0,
    netOutByte: runtimeInputs.frameOpaque98dba0956110NetOutByte >>> 0,
    vtableResults: Array.isArray(runtimeInputs.frameOpaque98dba0956110VtableResults)
      ? runtimeInputs.frameOpaque98dba0956110VtableResults
      : [],
    vtableCount: runtimeInputs.frameOpaque98dba0956110VtableCount >>> 0,
    generalResult: runtimeInputs.frameOpaque98dba0956110GeneralResult >>> 0,
  });
  if (plan.pure !== 0) {
    events.frameOpaque98dba0956110ProbePure = 1;
  }
}

/* ABI v95 (record idx 5/32): entity-surface accept pure-proof. The host
   walk captures the per-matched-entry [[entry+0x370]+0x14] surface (vtable
   class-bits + frame/animation fields, layout fields landed at the
   coordinator merge); ready=0 publishes nothing. A KNOWN class with a
   complete blob makes the accept prediction PURE (plan.pure) even though
   the virtual dispatch stays typed-host (plan.typedHost/hostVerify). */
function emitEntitySurfaceAcceptPure(runtimeInputs, events) {
  const bundle = runtimeInputs;
  if ((bundle.frameOpaque98dba0EntitySurfaceReady | 0) === 0) return;
  let cap = bundle.frameOpaque98dba0EntitySurfaceCapture;
  if (!Array.isArray(cap)) {
    /* ABI v99: the layout feeds the blobs as flat per-field lanes
       (frameOpaque98dba0EntitySurfaceCapture{i}{Field}, cf.
       hudStatPlayer{i}); assemble slot objects from them so the proof
       fires from corpus/live captures too. */
    cap = [];
    for (let i = 0; i < 8; i += 1) {
      const base = `frameOpaque98dba0EntitySurfaceCapture${i}`;
      if (bundle[`${base}VtableClassBits`] === undefined
          && bundle[`${base}ImplPtr`] === undefined) break;
      cap.push({
        vtableClassBits: bundle[`${base}VtableClassBits`] ?? 0,
        implPtr: bundle[`${base}ImplPtr`] ?? 0,
        implB0: bundle[`${base}ImplB0`] ?? 0,
        impl8: bundle[`${base}Impl8`] ?? 0,
        implC: bundle[`${base}ImplC`] ?? 0,
        impl20: bundle[`${base}Impl20`] ?? 0,
        impl2010: bundle[`${base}Impl2010`] ?? 0,
        netman2b4: bundle[`${base}Netman2b4`] ?? 0,
        globalC73680: bundle[`${base}GlobalC73680`] ?? 0,
        globalC73694: bundle[`${base}GlobalC73694`] ?? 0,
        globalC5ac00: bundle[`${base}GlobalC5ac00`] ?? 0,
      });
    }
  }
  if (!Array.isArray(cap) || cap.length === 0) return;
  /* slot 0 = the first matched entry (the walk's per-player capture). */
  const plan = gameUpdateSliceEntitySurfacePlan({
    vtableClassBits: cap[0]?.vtableClassBits ?? 0,
    implPtr: cap[0]?.implPtr ?? 0,
    implB0: cap[0]?.implB0 ?? 0,
    impl8: cap[0]?.impl8 ?? 0,
    implC: cap[0]?.implC ?? 0,
    impl20: cap[0]?.impl20 ?? 0,
    impl2010: cap[0]?.impl2010 ?? 0,
    netman2b4: cap[0]?.netman2b4 ?? 0,
    globalC73680: cap[0]?.globalC73680 ?? 0,
    globalC73694: cap[0]?.globalC73694 ?? 0,
    globalC5ac00: cap[0]?.globalC5ac00 ?? 0,
  });
  if (plan.pure !== 0) {
    events.frameOpaque98dba0EntitySurfaceAcceptPure = 1;
  }
}
export function signedMod2IsOne(value) {
  /* PE law: (int32)v % 2 == 1 fires ONLY for positive odd — a negative odd
     masks to 0x80000001, the fixup turns it into -1, and -1 != 1. The -1
     arm here wrongly early-outs negative odd inputs (measured 857450
     divergence at case 502). */
  return (((value | 0) % 2) | 0) === 1;
}
export function opaque857450NeedsHost({ ready = 0, gate1d654 = 0, manager4abbc = 0 } = {}) {
  if ((ready | 0) === 0) return true;
  if ((gate1d654 | 0) === 0) return false;
  /* Gate 2: positive-odd only. Odd manager skips the host (C++ returns 0). */
  if (signedMod2IsOne(manager4abbc)) return false;
  return true;
}

export function hudStatCountdownLaneActive(runtimeInputs) {
  if (((runtimeInputs?.managerStatFlag | 0) & 0xff) === 0) return false;
  if ((runtimeInputs?.hudStatCountdownReady | 0) === 0) return false;
  const begin = runtimeInputs.hudStatPlayerListBegin | 0;
  const end = runtimeInputs.hudStatPlayerListEnd | 0;
  return (((end - begin) | 0) >> 2) === 0;
}
export function hudStatCountdownValues(runtimeInputs) {
  if (Array.isArray(runtimeInputs?.hudStatCountdownValues)) {
    return runtimeInputs.hudStatCountdownValues.slice(0, HUD_STAT_COUNTDOWN_COUNT);
  }
  const out = [];
  for (let i = 0; i < HUD_STAT_COUNTDOWN_COUNT; i += 1) {
    const key = `hudStatCountdown${i}`;
    out.push(runtimeInputs?.[key] | 0);
  }
  return out;
}
export function hudStatCountdownTick(values, sites = 1) {
  const v = (values ?? []).map((x) => x | 0);
  for (let s = 0; s < (sites | 0); s += 1) {
    for (let i = 0; i < v.length; i += 1) if ((v[i] | 0) > 0) v[i] = (v[i] | 0) - 1;
  }
  return v;
}
export function hudStatWalkLaneActive(runtimeInputs) {
  if (((runtimeInputs?.managerStatFlag | 0) & 0xff) === 0) return false;
  if ((runtimeInputs?.hudStatWalkBlobReady | 0) !== 1) return false;
  const begin = runtimeInputs.hudStatPlayerListBegin | 0;
  const end = runtimeInputs.hudStatPlayerListEnd | 0;
  const count = ((end - begin) | 0) >> 2;
  return count >= 1 && count <= HUD_STAT_WALK_PLAYER_MAX;
}

function toF32Bits(v) {
  if (typeof v !== "number") return 0;
  if (Number.isInteger(v) && Math.abs(v) > 65536) return v >>> 0;
  return bitsFromF32(Math.fround(v));
}
function fromF32Bits(bits) {
  return f32FromBits(bits >>> 0);
}
function hudStatPlayerPack(runtimeInputs, i) {
  const key = (field) => runtimeInputs[`hudStatPlayer${i}${field}`];
  return {
    ptr: (key("Ptr") ?? 0) >>> 0,
    predA: (key("PredA") ?? 0) >>> 0,
    f2c: (key("F2c") ?? 0) >>> 0,
    f3bc: (key("F3bc") ?? 0) >>> 0,
    f13c0: (key("F13c0") ?? 0) >>> 0,
    f172: (key("F172") ?? 0) >>> 0,
    otherPtr: (key("OtherPtr") ?? 0) >>> 0,
    other161c: (key("Other161c") ?? 0) >>> 0,
    f161c: (key("F161c") ?? 0) >>> 0,
    f328: (key("F328") ?? 0) >>> 0,
    f1568: (key("F1568") ?? 0) >>> 0,
    f1460: (key("F1460") ?? 0) >>> 0,
    f1470: (key("F1470") ?? 0) >>> 0,
    f1480: (key("F1480") ?? 0) >>> 0,
    f1464: (key("F1464") ?? 0) >>> 0,
    f156c: (key("F156c") ?? 0) >>> 0,
  };
}
function hudStatSlotGetOrInsert(pack, containerBegin, containerEnd, scratch) {
  if ((containerBegin >>> 0) !== (containerEnd >>> 0) && (pack.predA >>> 0) === 0) return -1;
  if ((pack.f2c >>> 0) !== 0) return -1;
  if ((pack.f3bc >>> 0) !== 0) return -1;
  if ((pack.f13c0 >>> 0) === 0x28) return -1;
  const predB =
    (pack.f172 >>> 0) !== 0 &&
    ((pack.f13c0 >>> 0) === 0x1d || (pack.f13c0 >>> 0) === 0x26) &&
    (pack.otherPtr >>> 0) !== 0 &&
    (pack.otherPtr >>> 0) !== (pack.ptr >>> 0) &&
    (pack.other161c >>> 0) !== 0xffffffff &&
    (pack.other161c | 0) < (pack.f161c | 0);
  if (predB) return -1;
  const entry = pack.ptr >>> 0;
  let freeSlot = -1;
  const ptrs = [scratch.slotPtr0 >>> 0, scratch.slotPtr1 >>> 0];
  for (let s = 0; s < 2; s += 1) {
    if (ptrs[s] === entry) return s;
    if (ptrs[s] === 0 && freeSlot < 0) freeSlot = s;
  }
  if (freeSlot < 0) return -1;
  if (freeSlot === 0) scratch.slotPtr0 = entry;
  else scratch.slotPtr1 = entry;
  return freeSlot;
}

function hudStatWalkTweenSlot(slot, targetBits, mode) {
  const out = playerHudStatBarTween({
    currentBits: toF32Bits(slot.current),
    deltaBits: toF32Bits(slot.delta),
    prevBits: toF32Bits(slot.prev),
    thresholdBits: toF32Bits(slot.threshold),
    timer: slot.timer | 0,
  }, targetBits >>> 0, mode >>> 0);
  slot.current = fromF32Bits(out.currentBits);
  slot.delta = fromF32Bits(out.deltaBits);
  slot.prev = fromF32Bits(out.prevBits);
  slot.timer = out.timer | 0;
}

function hudStatWalkRecompute(runtimeInputs, state, scratch, pack, idx, events = null) {
  if (idx < 0 || idx > 1) return;
  const ptrs = [scratch.slotPtr0 >>> 0, scratch.slotPtr1 >>> 0];
  /* PE 0x84ca13 imul edi, eax, 0xcc — per-player ROW STRIDE (geometry
     seam law; the scratch abstracts the memory layout). */
  hudStatRecomputeRowStride(idx);
  /* PE 0x84ca20 test edx,edx / je — FULL-DWORD entry-ptr null gate. */
  if (!hudStatRecomputeEntryValid(ptrs[idx])) return;
  const mask = HUD_STAT_WALK_MASK >>> 0;
  const mode = hudStatTailRecomputeMode(
    state.frameCounter264f8, pack.f328,
  );
  const slotAt = (k) => scratch.slots[idx * 10 + k];
  const thresholdBits = (k) => toF32Bits(runtimeInputs[`hudStatSlot${idx}${k}Threshold`] ?? slotAt(k).threshold);
  const runs = (k) => hudStatRecomputeSlotRuns(mask, k) !== 0;
  if (runs(0)) hudStatWalkTweenSlot(slotAt(0), pack.f1568, mode);
  if (runs(1)) {
    const target = bitsFromF32(Math.fround(30.0 / Math.fround(fromF32Bits(pack.f1460) + 1.0)));
    hudStatWalkTweenSlot(slotAt(1), target, mode);
  }
  if (runs(2)) hudStatWalkTweenSlot(slotAt(2), pack.f1470, mode);
  if (runs(3)) {
    const target = bitsFromF32(Math.fround(fromF32Bits(pack.f1480) / 40.0));
    hudStatWalkTweenSlot(slotAt(3), target, mode);
  }
  if (runs(4)) hudStatWalkTweenSlot(slotAt(4), pack.f1464, mode);
  if (runs(5)) hudStatWalkTweenSlot(slotAt(5), pack.f156c, mode);
  if (runs(6) || runs(7)) {
    /* 0x84cb39 test bl,0xc0: k6 + k7 gate TOGETHER. */
    if (events) {
      /* Typed host events (coordinator-merged @920/924/928): the three
         probe BODIES ran at the seam — 1 per k6/k7-arm entry, all
         together (mirrors the cpp wire's +1s in this same block). */
      events.hudStatWalkProbe1 = (events.hudStatWalkProbe1 | 0) + 1;
      events.hudStatWalkProbe2 = (events.hudStatWalkProbe2 | 0) + 1;
      events.hudStatWalkProbe3 = (events.hudStatWalkProbe3 | 0) + 1;
    }
    /* ---- ABI v101/102 (wave update-v100-record0-islands + wave
       update-v102-record0-wire): the walker's PURE islands — the
       row-head decisions of the 0x84cc40 body BEFORE the probe chain.
       v101 (void)-lawed all four BY REFERENCE (walker stays host);
       v102 COMMITS the capture lanes and wires the law calls with the
       LIVE lane values — pass-through per the v101 bit-identical
       contract (the lane values do NOT change the seam outputs; only
       the walker-side descriptions become live, evented @956/960/964
       below). */
    const walkerA = (runtimeInputs?.hudStatWalkerPlayerA ?? 0) >>> 0;
    const walkerB = (runtimeInputs?.hudStatWalkerPlayerB ?? 0) >>> 0;
    /* Swap-gate [block+0x114] row-arm (0x84cc9d cmp eax,[ebx+8] /
       0x84cca0 jne 0x84d659 + 0x84d659 cmp eax,edx / 0x84d65b jne):
       entry == A -> arm 1 (swap-to-B store @0x84cca6 + the inline
       RESET/TWEEN body), entry == B -> arm 2 (swap-back @0x84d666 + the
       0x84d66d seam call), else 0 (loop tail, row untouched). The entry
       arg IS the module's row slot (ptrs[idx] — the walker's
       [edi+esi+0x114] for the same row); A/B are the COMMITTED lanes
       (the v101 NULL stand-ins replaced; the arm is evented @960
       below). */
    const arm = hudStatWalkerRowArm(ptrs[idx], walkerA, walkerB);
    /* RESET/TWEEN split at the walker's site (0x84ccbd..0x84ccd1):
       flag [ebp-1] = (i32[Game+0x264f8] - i32[B+0x328]) > 1 ? TWEEN :
       RESET (0x84ccc8 sub / 0x84ccce cmp eax,1 / 0x84ccd1 jg 0x84ce1b) —
       the SEAM head formula hudStatTailRecomputeMode RE-DERIVED on the
       walker's own B (swap-in) frame word; the flag selects the
       k6/k7/k8/k9 fast-vs-full paths. The frame is the module's sparse
       state; B's word is the COMMITTED lane hudStatWalkerBFrame328
       @14284 (the v101 0 stand-in replaced). */
    hudStatWalkerResetSplit(
      state.frameCounter264f8, (runtimeInputs?.hudStatWalkerBFrame328 ?? 0) >>> 0);
    /* Walker k6 call-site dispatch (0x84d18e/0x84d1b6/0x84d1c7): the
       0x84cc40 walker selects the same three probe leaves in FIXED order
       with NO mask gate (no test bl,0xc0 twin — mask ignored by the law;
       the seam's joined gate is the slot_runs(6)|slot_runs(7) check
       above). BY-REFERENCE description of the host walker (the probe1
       ARG read [Game+0x18300] is lawed as hudStatWalkerProbe1Arg (void)
       below; the live value stays host). */
    hudStatWalkerK6ProbeLeafVa(mask, 0);
    hudStatWalkerK6ProbeLeafVa(mask, 1);
    hudStatWalkerK6ProbeLeafVa(mask, 2);
    /* The walker's 4 direct E8 leaves' call ORDER (0x84d18e -> PROBE1,
       0x84d1b6 -> PROBE2, 0x84d1c7 -> PROBE3, then 0x84d66d -> the
       RecomputeStats seam 0x84ca00 LAST — swap-back rows only): decision
       law hudStatWalkerE8CallOrder, pinned per position (completes the
       v98 site-dispatch law with the seam as E8 #4). */
    hudStatWalkerE8CallOrder(0);
    hudStatWalkerE8CallOrder(1);
    hudStatWalkerE8CallOrder(2);
    hudStatWalkerE8CallOrder(3);
    /* The probe1 ARG read [Game+0x18300] (0x84d188 mov ecx,[eax+
       0x18300] — the game ROOM ptr word, ABI v67 pinned to 0 in the
       sparse lanes; seam twin 0x84cb47, PM swap-body twin 0x9bf31f):
       FULL-DWORD transfer into ecx for the host leaf 0x7f92b0 — no byte
       gate (law hudStatWalkerProbe1Arg; the COMMITTED lane
       hudStatWalkProbe1Arg @14288 — the v101 0 operand replaced). */
    hudStatWalkerProbe1Arg((runtimeInputs?.hudStatWalkProbe1Arg ?? 0) >>> 0);
    /* The clamp + probe2-live zeroing is the walker's probe chain law
       hudStatWalkerProbe1Clamped (0x84d199..0x84d1c2; the seam twin
       0x84cb5b..0x84cb7e is byte-identical in gates, so the k6/k7 block
       consumes the law on both sites): NaN -> 0.0 (maxss(NaN,0.0)),
       [0,1] clamp, then the probe2 BOOL LOW-BYTE gate zeroing the
       clamped value @0x84d1bb (oracle parity — cpp + JS call the law). */
    const clamped = Math.fround(fromF32Bits(hudStatWalkerProbe1Clamped(
      (runtimeInputs.hudStatWalkProbe1 ?? 0) >>> 0,
      (runtimeInputs.hudStatWalkProbe2 ?? 0) >>> 0,
    )));
    const probe3 = Math.fround(fromF32Bits((runtimeInputs.hudStatWalkProbe3 ?? 0) >>> 0));
    const clampedBits = bitsFromF32(clamped);
    const f = Math.fround;
    /* PE 0x84cba1 cmp byte [esi+0x2ac],0 / je — the FCO-flag READ-BACK
       seam (LOW-BYTE; the formula below consumes the pinned store-booled
       scratch.ownerByte — the two agree on real 0/1 captures). */
    hudStatRecomputeOwnerByte(runtimeInputs.hudStatOwnerByte ?? 0);
    /* The 0x84cc40 walker's INLINE k7 (0x84d4c7 mode-0 / 0x84d280
       mode-1) DIVERGES on the owner arm: owner ? clamped*100 :
       probe3*clamped*100 (decision law hudStatWalkerK7Target, owner
       LOW-BYTE @0x84d1cc) — the S2 caveat's true home, unobservable on
       real captures (probe3 == 1.0 there). BY-REFERENCE on the same
       inputs, never folded into the seam formula below. */
    hudStatWalkerK7Target(
      runtimeInputs.hudStatOwnerByte ?? 0,
      (runtimeInputs.hudStatWalkProbe3 ?? 0) >>> 0,
      clampedBits,
    );
    /* The swap BACK store semantics (0x84d659..0x84d698): on arm 2 the
       row is re-pointed at A (0x84d666 mov [edi+esi+0x114],eax) BEFORE
       the 0x84d66d seam call — the seam then re-derives mode from A.f328
       under mask -1 (E8 #4, lawed hudStatWalkerE8CallOrder). The store
       VALUE law (arm 1 -> B @0x84cca6, arm 2 -> A @0x84d666, else the
       row keeps its entry) is hudStatWalkerSwapStore; the arm + A/B are
       LIVE (the row_arm result + the committed lanes @14276/14280 — the
       v101 (0u, 0u, 0u) stand-ins replaced). Pass-through: the row slot
       is NOT written here — the seam path stays bit-identical; the
       store value is the walker-side description. */
    hudStatWalkerSwapStore(arm, ptrs[idx], walkerA, walkerB);
    const k6 = (scratch.ownerByte | 0) !== 0
      ? bitsFromF32(f(clamped * 100.0))
      : bitsFromF32(f(f(f(1.0 - probe3) * clamped) * 100.0));
    /* Typed walker probe events (ABI v102; twins of the seam trio
       @920/924/928 — the walker's probe calls are NOT counted by the
       seam counters): probe1 @956 = REACHED (+1 per walker k6/k7-arm
       entry), probe2 @960 = the swap-gate row-ARM value (1/2/0 from the
       live A/B lanes), probe3 @964 = the walker-site probe-K6 target
       bits. Fired ONLY when the walker capture is LIVE (a real PM swap
       captured A/B — player_a|player_b != 0); lanes all-zero (capture
       absent) keeps the residual byte-for-byte. The seam outputs (the
       tween slot states) are NOT affected — the lane drive is
       observable through the events only. */
    if (events && (walkerA !== 0 || walkerB !== 0)) {
      events.hudStatWalkerProbe1 = (events.hudStatWalkerProbe1 | 0) + 1;
      events.hudStatWalkerProbe2 = arm;
      events.hudStatWalkerProbe3 = k6;
    }
    hudStatWalkTweenSlot(slotAt(6), k6, mode);
    hudStatWalkTweenSlot(slotAt(7), bitsFromF32(f(f(probe3 * clamped) * 100.0)), mode);
  }
  if (!hudStatWalkSiteK8Skipped(mask)) {
    /* k=8 (+0x1b8): target 0.0f. The WALK-SITE mask arm (0x84cbf0 test
       ebx,0x100 / je): the walk site's residue mask 0xfffffeff has bit 8
       clear -> SKIPPED here; the 0x84cc40 walker site 0x84d66d pushes
       -1 -> RUNS (decision law hudStatWalkSiteK8Skipped; exact
       complement of hudStatRecomputeSlotRuns(mask, 8)). */
    hudStatWalkTweenSlot(slotAt(8), 0, mode);
  }
  if (runs(9)) {
    const gameBits = (runtimeInputs.hudStatGame1adb4 >>> 0) !== 0 || Number.isInteger(runtimeInputs.hudStatGame1adb4)
      ? (typeof runtimeInputs.hudStatGame1adb4 === "number" && Math.abs(runtimeInputs.hudStatGame1adb4) > 65536
        ? runtimeInputs.hudStatGame1adb4 >>> 0
        : toF32Bits(runtimeInputs.hudStatGame1adb4 ?? 0))
      : toF32Bits(runtimeInputs.hudStatGame1adb4 ?? 0);
    const target = bitsFromF32(Math.fround(fromF32Bits(gameBits) * 100.0));
    hudStatWalkTweenSlot(slotAt(9), target, mode);
  }
}

export function hudStatWalkRun(scratchState, runtimeInputs, state, events = null) {
  const slots = [];
  const src = scratchState?.slots ?? [];
  for (let i = 0; i < HUD_STAT_WALK_SLOTS; i += 1) {
    const s = src[i] || {};
    slots.push({
      current: Math.fround(s.current ?? 0),
      delta: Math.fround(s.delta ?? 0),
      prev: Math.fround(s.prev ?? 0),
      threshold: Math.fround(s.threshold ?? 0),
      timer: s.timer | 0,
    });
  }
  const scratch = {
    ownerByte: (scratchState?.ownerByte | 0) !== 0 ? 1 : 0,
    slotPtr0: (scratchState?.slotPtr0 ?? 0) >>> 0,
    slotPtr1: (scratchState?.slotPtr1 ?? 0) >>> 0,
    slots,
  };
  const begin = runtimeInputs.hudStatPlayerListBegin | 0;
  const end = runtimeInputs.hudStatPlayerListEnd | 0;
  const count = ((end - begin) | 0) >> 2;
  /* PE 0x84c1c1 outer check `je 0x84c224`: count==0 skips the WHOLE loop
     (countdown lane, no log). The INNER 0x84c1cf re-derivation gate fires
     the fatal log 0xa112c0 (typed host event hudStatWalkFatalEmpty) iff a
     per-iteration count re-derivation is 0 — reachable only after a host
     body shrinks the live registry; in the static blob lane the count is
     invariant and the lane gate requires 1..8, so this is provably 0. The
     decision is computed per-iteration (extra scratch keys are ignored by
     the 83-word publisher, walkScratchToWords). */
  scratch.fatalEmpty = 0;
  for (let i = 0; i < count && i < HUD_STAT_WALK_PLAYER_MAX; i += 1) {
    scratch.fatalEmpty = hudStatTailFatalEmpty(count);
    const pack = hudStatPlayerPack(runtimeInputs, i);
    const idx = hudStatSlotGetOrInsert(
      pack,
      runtimeInputs.hudStatContainerBegin >>> 0,
      runtimeInputs.hudStatContainerEnd >>> 0,
      scratch,
    );
    if (idx >= 0) hudStatWalkRecompute(runtimeInputs, state ?? {}, scratch, pack, idx, events);
  }
  for (let s = 0; s < HUD_STAT_WALK_SLOTS; s += 1) {
    if ((scratch.slots[s].timer | 0) > 0) scratch.slots[s].timer = (scratch.slots[s].timer | 0) - 1;
  }
  return scratch;
}

function rankDisplayBitCount(mask) {
  let n = 0;
  let m = mask >>> 0;
  while (m !== 0) {
    n += m & 1;
    m >>>= 1;
  }
  return n;
}
function rankDisplayNameEq(w0, w1, w2, w3, w4) {
  if ((w0 >>> 0) !== 0x70736944) return 0;
  if ((w1 >>> 0) !== 0x5279616c) return 0;
  if ((w2 >>> 0) !== 0x536b6e61) return 0;
  if ((w3 >>> 0) !== 0x74726174) return 0;
  return ((w4 >>> 0) & 0xff) === 0 ? 1 : 0;
}
export function rankDisplayBodyFold(input = {}) {
  const st = input.st >>> 0;
  const sw = input.sw >>> 0;
  let stateUpd = 0;
  let playMask = 0;
  let isPlaying = 0;
  let swAfter = sw;
  let stAfter = st;
  let clear3b = 0;
  if ((sw | 0) === 0) {
    let ebx;
    let ec;
    if ((input.b119 & 0xff) !== 0) {
      stateUpd = 2;
      ec = input.stUpd >>> 0;
    } else {
      ec = st;
    }
    if (ec === 1) {
      if ((input.ptr44 >>> 0) === 0 || (input.b54 & 0xff) === 0) {
        playMask |= 1 << 2;
        stAfter = 2;
        ebx = 2;
      } else {
        ebx = 1;
      }
    } else {
      ebx = ec;
    }
    isPlaying = 1;
    if ((input.al & 0xff) !== 0 && (input.b39c & 0xff) !== 0 && (input.b39d & 0xff) !== 0) {
      playMask |= 1 << 3;
      stAfter = 3;
      ebx = 3;
    }
    if ((input.ptr44 >>> 0) !== 0 && (input.b54 & 0xff) === 0) {
      if (rankDisplayNameEq(input.w0, input.w1, input.w2, input.w3, input.w4) !== 0) {
        playMask |= 1 << 4;
        stAfter = input.stAfterDisplay >>> 0;
        ebx = input.stAfterDisplay >>> 0;
      }
    }
    if (ebx === 4) {
      if ((input.ptr44 >>> 0) === 0 || (input.b54 & 0xff) === 0) {
        playMask |= 1 << 5;
        swAfter = 1;
        stAfter = 1;
      }
    }
    if ((input.b3b0 & 0xff) !== 0) {
      if ((input.ptr44 >>> 0) === 0 || (input.b54 & 0xff) === 0) {
        clear3b = 1;
        stAfter = 0;
      }
    }
  } else if ((sw | 0) === 1) {
    let ec;
    if ((input.b22d & 0xff) === 0) {
      stateUpd = 2;
      ec = input.stUpd >>> 0;
    } else {
      ec = st;
    }
    if (ec === 1) {
      if ((input.d158 | 0) === 0 || (input.b168 & 0xff) === 0) {
        playMask |= 1 << 0;
        stAfter = 2;
        ec = input.stAfterLoading >>> 0;
      }
    }
    if (ec === 2) {
      if ((input.d248 | 0) !== 0) {
        playMask |= 1 << 1;
        stAfter = 3;
        ec = input.stAfterIdle >>> 0;
      }
    }
    if (ec === 4) {
      if ((input.d158 | 0) === 0 || (input.b168 & 0xff) === 0) stAfter = 0;
    }
    if ((input.b3b0 & 0xff) !== 0) {
      if ((input.d158 | 0) === 0 || (input.b54 & 0xff) === 0) {
        clear3b = 1;
        stAfter = 0;
      }
    }
  }
  return {
    stateUpd,
    playCount: rankDisplayBitCount(playMask),
    playMask,
    isPlaying,
    swAfter,
    stAfter,
    clear3b,
    tailCleared: 1,
  };
}

export function menuAuxSentinelWrites({ sentinelAddr = 0 } = {}) {
  const a = sentinelAddr >>> 0;
  return [a, a, a, 0, 0];
}
export function menuAuxTreeErase(input = {}) {
  const count = input.nodeCount ?? input.menuAuxTreeNodeCount ?? 0;
  if ((count | 0) < 0 || (count | 0) > MENU_AUX_TREE_MAX_NODES) return null;
  /* The runtime inputs carry the 32-node pack as flat menuAuxTreeLeft0..31
     lanes; pack them here so callers may pass either the flat runtime
     object or explicit arrays. (menuAuxTreeNodesFromRuntime was removed
     from this module at ABI v54+; the packer lives here now.) */
  const flatLane = (name) => {
    if (Array.isArray(input[name])) return input[name];
    if (input[name + "0"] === undefined) return [];
    const out = [];
    for (let i = 0; i < MENU_AUX_TREE_MAX_NODES; i += 1) {
      if (input[name + i] === undefined) break;
      out.push(input[name + i] | 0);
    }
    return out;
  };
  const left = input.left ?? flatLane("menuAuxTreeLeft");
  const right = input.right ?? flatLane("menuAuxTreeRight");
  const isnil = input.isnil ?? flatLane("menuAuxTreeIsnil");
  const flag1c = input.flag1c ?? flatLane("menuAuxTreeFlag1c");
  const payloadPresent = input.payloadPresent ?? flatLane("menuAuxTreePayloadPresent");
  const payloadSize = input.payloadSize ?? flatLane("menuAuxTreePayloadSize");
  let lo = (input.accountingLo ?? input.menuAuxAccountingLo ?? 0) >>> 0;
  let hi = (input.accountingHi ?? input.menuAuxAccountingHi ?? 0) >>> 0;
  const stack = [];
  const seen = new Uint8Array(MENU_AUX_TREE_MAX_NODES);
  const visitOrder = [];
  const payloadFree = [];
  let node = input.root ?? input.menuAuxTreeRoot ?? 0;
  for (;;) {
    while ((node | 0) >= 0) {
      if ((node | 0) >= (count | 0)) return null;
      if ((isnil[node] | 0) !== 0) break;
      if (seen[node] !== 0) return null;
      seen[node] = 1;
      if (stack.length >= MENU_AUX_TREE_MAX_NODES) return null;
      stack.push(node | 0);
      node = right[node] | 0;
    }
    if ((node | 0) < -1) return null;
    if (stack.length === 0) break;
    const current = stack.pop();
    visitOrder.push(current);
    let freed = 0;
    if (((flag1c[current] | 0) & 0xff) === 0 && (payloadPresent[current] | 0) !== 0) {
      const size = payloadSize[current] >>> 0;
      const newLo = (lo - size) >>> 0;
      const borrow = lo < size ? 1 : 0;
      lo = newLo;
      hi = (hi - borrow) >>> 0;
      freed = 1;
    }
    payloadFree.push(freed);
    node = left[current] | 0;
  }
  return { visitOrder, payloadFree, accountingLo: lo, accountingHi: hi, visited: visitOrder.length };
}

export function scaleMonotonicCounter(low, high = 0) {
  const counter = (BigInt(high >>> 0) << 32n) | BigInt(low >>> 0);
  return (counter * 0x431bde82d7b634dbn) >> 82n;
}

export function updateListSweep(timers) {
  const arr = timers ?? [];
  const count = arr.length;
  const survivors = [];
  const evictFlags = [];
  let evicted = 0;
  for (let i = 0; i < count; i += 1) {
    const timer = arr[i] | 0;
    if (timer === 0) {
      evicted += 1;
      survivors.push(0);
      evictFlags.push(1);
    } else if (timer > 0) {
      survivors.push(timer - 1);
      evictFlags.push(0);
    } else {
      survivors.push(timer);
      evictFlags.push(0);
    }
  }
  return { evicted, survivors, evictFlags };
}
export function updateListTimersFromRuntime(runtimeInputs, count) {
  const out = [];
  for (let i = 0; i < (count | 0); i += 1) out.push(runtimeInputs[`updateListTimer${i}`] | 0);
  return out;
}
function globalTree4aba0NodeIndex(nodes, count, addr) {
  const n = count >>> 0;
  const a = addr >>> 0;
  for (let i = 0; i < n; i += 1) {
    if (((nodes[i]?.addr) >>> 0) === a) return i;
  }
  return -1;
}
export function globalTree4aba0Refresh(begin, end, count, nodes) {
  if ((begin >>> 0) === (end >>> 0)) return -1;
  const n = count >>> 0;
  if (!nodes || n < 1 || n > GLOBAL_TREE_4ABA0_MAX_NODES) return -1;
  const sentinel = nodes[0].addr >>> 0;
  let flag = 0;
  let cur = nodes[0].next >>> 0;
  let guard = 0;
  while (cur !== sentinel) {
    guard += 1;
    if (guard > 4 * n + 4) return -1;
    let ci = globalTree4aba0NodeIndex(nodes, n, cur);
    if (ci < 0) return -1;
    if ((nodes[ci].f18 >>> 0) === 0) flag += 1;
    let node = ci;
    const a = globalTree4aba0NodeIndex(nodes, n, nodes[node].child >>> 0);
    if (a < 0) return -1;
    if ((nodes[a].f0d >>> 0) === 0) {
      let c = globalTree4aba0NodeIndex(nodes, n, nodes[a].next >>> 0);
      if (c < 0) return -1;
      if ((nodes[c].f0d >>> 0) !== 0) {
        cur = nodes[a].addr >>> 0;
      } else {
        let d = nodes[a].addr >>> 0;
        for (;;) {
          const e = globalTree4aba0NodeIndex(nodes, n, nodes[c].next >>> 0);
          if (e < 0) return -1;
          d = nodes[c].addr >>> 0;
          c = e;
          if ((nodes[c].f0d >>> 0) !== 0) break;
        }
        cur = d;
      }
    } else {
      let b = globalTree4aba0NodeIndex(nodes, n, nodes[node].prev >>> 0);
      if (b < 0) return -1;
      if ((nodes[b].f0d >>> 0) !== 0) {
        cur = nodes[b].addr >>> 0;
      } else {
        for (;;) {
          if ((nodes[node].addr >>> 0) !== (nodes[b].child >>> 0)) {
            cur = nodes[b].addr >>> 0;
            break;
          }
          node = b;
          b = globalTree4aba0NodeIndex(nodes, n, nodes[node].prev >>> 0);
          if (b < 0) return -1;
          if ((nodes[b].f0d >>> 0) !== 0) {
            cur = nodes[b].addr >>> 0;
            break;
          }
        }
      }
    }
  }
  return flag === 0 ? 1 : 0;
}
export function globalTree4aba0NodesFromRuntime(runtimeInputs, count) {
  const nodes = [];
  for (let i = 0; i < (count | 0); i += 1) {
    nodes.push({
      addr: runtimeInputs[`globalTree4aba0Addr${i}`] >>> 0,
      next: runtimeInputs[`globalTree4aba0Next${i}`] >>> 0,
      prev: runtimeInputs[`globalTree4aba0Prev${i}`] >>> 0,
      child: runtimeInputs[`globalTree4aba0Child${i}`] >>> 0,
      f0d: runtimeInputs[`globalTree4aba0F0d${i}`] >>> 0,
      f18: runtimeInputs[`globalTree4aba0F18${i}`] >>> 0,
    });
  }
  return nodes;
}

function frameOpaque4257b0IdCountFromRuntime(runtimeInputs, playerCount) {
  let n = 0;
  const count = playerCount | 0;
  for (let i = 0; i < count; i += 1) {
    const qPtr = runtimeInputs[`frameOpaque4257b0QPtr${i}`] >>> 0;
    const pPtr = runtimeInputs[`frameOpaque4257b0PPtr${i}`] >>> 0;
    const q161c = runtimeInputs[`frameOpaque4257b0Q161c${i}`] | 0;
    const p161c = runtimeInputs[`frameOpaque4257b0P161c${i}`] | 0;
    if (frameOpaque9b9480PlayerCounted(qPtr, pPtr, q161c, p161c)) n += 1;
  }
  return n;
}
export function frameOpaque4257b0Plan(runtimeInputs = {}) {
  const rt = runtimeInputs ?? {};
  const out = {
    usable: false,
    idCount: 0,
    preCount: 0,
    capCount: 0,
    playerCount: 0,
    elemCount: 0,
    listCount: rt.frameOpaque4257b0ListCount | 0,
  };
  if ((rt.frameOpaque4257b0BlobReady | 0) === 0) return out;
  const players = frameOpaque98dba0VectorCount(
    rt.frameOpaque4257b0IdvecBegin >>> 0,
    rt.frameOpaque4257b0IdvecEnd >>> 0,
  ) | 0;
  const elems = frameOpaque98dba0VectorCount(
    rt.frameOpaque4257b0CtrBegin >>> 0,
    rt.frameOpaque4257b0CtrEnd >>> 0,
  ) | 0;
  if (players < 0 || players > FRAME_OPAQUE_4257B0_MAX_PLAYERS) return out;
  if (elems < 0 || elems > FRAME_OPAQUE_4257B0_MAX_ELEMS) return out;
  const pre = frameOpaque4257b0ListCountFromBounds(
    rt.frameOpaque4257b0ListBegin >>> 0,
    rt.frameOpaque4257b0ListEnd >>> 0,
  ) >>> 0;
  if (pre > FRAME_OPAQUE_4257B0_MAX_LIST) return out;
  out.playerCount = players >>> 0;
  out.elemCount = elems >>> 0;
  out.preCount = pre;
  out.capCount = frameOpaque4257b0ListCountFromBounds(
    rt.frameOpaque4257b0ListBegin >>> 0,
    rt.frameOpaque4257b0ListCap >>> 0,
  ) >>> 0;
  out.idCount = frameOpaque4257b0IdCountFromRuntime(rt, players);
  if (pre + out.idCount > FRAME_OPAQUE_4257B0_MAX_LIST) {
    out.idCount = 0;
    out.preCount = 0;
    out.capCount = 0;
    out.playerCount = 0;
    out.elemCount = 0;
    return out;
  }
  out.usable = true;
  return out;
}
export function frameOpaque4257b0Outcome(runtimeInputs = {}) {
  const rt = runtimeInputs ?? {};
  const plan = frameOpaque4257b0Plan(rt);
  const triples = { lo: [], hi: [], slot8: [] };
  const pre = plan.preCount >>> 0;
  const initialPairs = [];
  for (let i = 0; i < pre; i += 1) {
    const lo = rt[`frameOpaque4257b0ListLo${i}`] >>> 0;
    const hi = rt[`frameOpaque4257b0ListHi${i}`] >>> 0;
    triples.lo.push(lo);
    triples.hi.push(hi);
    triples.slot8.push(rt[`frameOpaque4257b0ListSlot8${i}`] >>> 0);
    initialPairs.push({ lo, hi });
  }
  let inserted = 0;
  let purePostCount = pre;
  if (plan.usable && (plan.idCount | 0) !== 0) {
    const n = plan.playerCount | 0;
    const e = plan.elemCount | 0;
    const arr = (stem, count) => Array.from({ length: count }, (_, i) => rt[`frameOpaque4257b0${stem}${i}`] ?? 0);
    const samples = {
      idCount: plan.idCount | 0,
      playerCount: n,
      elemCount: e,
      containerEmpty: frameOpaque98dba0MpRangeEmpty(rt.frameOpaque4257b0CtrBegin, rt.frameOpaque4257b0CtrEnd),
      pPtrs: arr("PPtr", n),
      pIds1618: arr("PId1618", n),
      p161cs: arr("P161c", n),
      qPtrs: arr("QPtr", n),
      q161cs: arr("Q161c", n),
      qIds1618: arr("QId1618", n),
      qqPtrs: arr("QqPtr", n),
      qq161cs: arr("Qq161c", n),
      elemIds: arr("ElemId", e),
      elemSubPtrs: arr("ElemSubPtr", e),
      elemSubLos: arr("ElemSubLo", e),
      elemSubHis: arr("ElemSubHi", e),
    };
    const resolved = frameOpaque4257b0PassAPairsFromSamples(samples);
    const ids = [];
    const flat = resolved?.pairs ?? [];
    for (let i = 0; i + 1 < flat.length; i += 2) ids.push({ lo: flat[i] >>> 0, hi: flat[i + 1] >>> 0 });
    const evo = frameOpaque4257b0PassACountEvolution(initialPairs, ids);
    inserted = evo.inserted | 0;
    purePostCount = evo.finalCount | 0;
    for (const p of evo.appended ?? []) {
      triples.lo.push(p.lo >>> 0);
      triples.hi.push(p.hi >>> 0);
      triples.slot8.push(1);
    }
  }
  /* The pure Pass B layer re-writes each entry's +8 value (ELEM_TIMER_INIT
     template + the per-entry store-plan finalValue). The list_out scratch the
     module publishes is post-Pass-B, so the triples' slot8 lane must carry
     those final values or the harness compares pre-Pass-B numbers against
     post-Pass-B memory (measured list_out mismatch at case 242). */
  let passBStores = 0;
  if (plan.usable && purePostCount > 0 && (triples.lo.length | 0) > 0) {
    try {
      const stride = 0x68;
      const bytes = new Uint8Array(triples.lo.length * stride);
      const dv = new DataView(bytes.buffer);
      for (let i = 0; i < triples.lo.length; i += 1) {
        dv.setUint32(i * stride + 0, triples.lo[i] >>> 0, true);
        dv.setUint32(i * stride + 4, triples.hi[i] >>> 0, true);
        dv.setUint32(i * stride + 8, triples.slot8[i] >>> 0, true);
      }
      const pbArr = (stem, count) => Array.from({ length: count }, (_, ii) => rt[`frameOpaque4257b0${stem}${ii}`] ?? 0);
      const pbSamples = {
        passAIdCount: plan.idCount | 0,
        initialByte13: rt.frameOpaque4257b0InitialByte13 >>> 0,
        ctrBegin: rt.frameOpaque4257b0CtrBegin >>> 0,
        ctrEnd: rt.frameOpaque4257b0CtrEnd >>> 0,
        ctrSubPtrs: pbArr("ElemSubPtr", FRAME_OPAQUE_4257B0_MAX_ELEMS),
        ctrSubLo: pbArr("ElemSubLo", FRAME_OPAQUE_4257B0_MAX_ELEMS),
        ctrSubHi: pbArr("ElemSubHi", FRAME_OPAQUE_4257B0_MAX_ELEMS),
        ctrFieldC: pbArr("ElemId", FRAME_OPAQUE_4257B0_MAX_ELEMS),
        idvecBegin: rt.frameOpaque4257b0IdvecBegin >>> 0,
        idvecEnd: rt.frameOpaque4257b0IdvecEnd >>> 0,
        playerIds1618: pbArr("PId1618", FRAME_OPAQUE_4257B0_MAX_PLAYERS),
        playerChars13c0: pbArr("PChar13c0", FRAME_OPAQUE_4257B0_MAX_PLAYERS),
      };
      /* The C++ pass_b consumes the F4 pair that governs THIS entry: the
         recaptured post pair when Pass A ran (blob resume arm), the pre
         list pair on the head arm (id_count == 0, no Pass A). Mirror it or
         the oracle walk starts from the wrong bound. */
      const passARan = (plan.idCount | 0) !== 0;
      const pbBegin = passARan
        ? rt.frameOpaque4257b0PostListBegin >>> 0
        : rt.frameOpaque4257b0ListBegin >>> 0;
      const pbEnd = passARan
        ? rt.frameOpaque4257b0PostListEnd >>> 0
        : rt.frameOpaque4257b0ListEnd >>> 0;
      const pbRes = frameOpaque4257b0PassBApply(bytes, pbBegin, pbEnd, pbSamples);
      passBStores = (pbRes?.stores ?? 0) >>> 0;
      for (let i = 0; i < triples.lo.length; i += 1) {
        triples.slot8[i] = dv.getUint32(i * stride + 8, true);
      }
    } catch (_) { /* keep the append-level slot8 values */ }
  }
  const recaptured = (plan.usable && (plan.idCount | 0) !== 0)
    ? (frameOpaque4257b0ListCountFromBounds(
        rt.frameOpaque4257b0PostListBegin >>> 0,
        rt.frameOpaque4257b0PostListEnd >>> 0,
      ) | 0)
    : 0;
  const recapClamped = recaptured < 0 ? 0 : recaptured;
  return {
    plan,
    ...plan,
    usable: !!plan.usable,
    triples,
    inserted,
    purePostCount,
    passBStores: passBStores >>> 0,
    recaptured: recapClamped,
    mismatch: plan.usable && (plan.idCount | 0) !== 0 && recapClamped !== (purePostCount | 0),
    passAHost: frameOpaque4257b0PassANeedsHost(plan.idCount),
    passBHost: frameOpaque4257b0PassBNeedsHost(plan.idCount, plan.listCount),
    needsHost: frameOpaque4257b0NeedsHost(rt.timedTransitionCleanupMode | 0),
  };
}
export function frameOpaque98dba0TimerBlockLive(timer264e8) {
  return (timer264e8 | 0) > 0 ? 1 : 0;
}
export function hostFun746560NotifyByte(param) {
  const low = (param >>> 0) & 0xff;
  return (low ^ 1) & 0xff;
}
export function hostFun746560DeathmatchSuffix(cleanupMode) {
  return (cleanupMode | 0) >= 2 ? 1 : 0;
}

/* ABI v95: record idx 6 (0x00746560 notify body) string-build DECISION
   laws. All six mirror the instruction stream 1:1 (see the cpp
   transcriptions); the string content builders and the intern/ANM2 widget
   stay typed-host. */
export function hostFun746560StringDataPtr(cap, ptr, base) {
  /* PE 0x74660c/0x746617 cmp+cmovae: UNSIGNED cap >= 0x10 ? heap : SSO. */
  return (cap >>> 0) >= 0x10 ? (ptr >>> 0) : (base >>> 0);
}
export function hostFun746560StringFound(size) {
  /* PE 0x7465fb cmp [ebp-0x1c],0 / 0x746608 setne: _Mysize != 0. */
  return (size >>> 0) !== 0 ? 1 : 0;
}
export function hostFun746560FreePlan(cap, ptr, blockHeader) {
  /* PE 0x746632..0x7466a0: cap<0x10 SSO NONE; cap+1<0x1000 SMALL;
     delta=ptr-*(ptr-4)-4 > 0x1f LARGE; else SMALL — all UNSIGNED, wrap. */
  if ((cap >>> 0) < 0x10) return 0;
  const size = (cap + 1) >>> 0; /* 0x74663d inc edx (wrap at 0xffffffff) */
  if (size < 0x1000) return 1;
  const delta = (ptr - blockHeader - 4) >>> 0; /* 0x74664e/0x746650 */
  return delta > 0x1f ? 2 : 1; /* 0x746656 ja -> operator delete */
}
export function gameUpdateSlice746260WalkCount(end, begin) {
  /* PE 0x7462e8..0x746304: span = end-begin (32-bit wrap); signed magic
     divide by 28 via M=0x92492493, sar 4, sign fixup. BigInt keeps the
     64-bit product exact where the double multiply would lose bits. */
  const span = (end - begin) | 0;
  const prod = BigInt(-1840700269) * BigInt(span); /* 0x92492493 as int32 */
  const hi = Number((prod >> 32n) & 0xffffffffn) | 0; /* high word, int32 */
  const sum = (hi + span) | 0; /* PE 0x7462f6 add edx,ecx (wrap) */
  const shifted = sum >> 4; /* 0x7462f8 sar edx,4 */
  return shifted + (shifted >>> 31); /* 0x7462fd shr eax,31 (LOGICAL 0/1) + 0x746300 */
}
export function gameUpdateSlice746260IndexMatches(acc, clear, index) {
  /* PE 0x74633c..0x746344: not clear; shl eax,cl = 1<<(index&31);
     test acc & ~clear & mask -> jne found. */
  const mask = 1 << (index & 31);
  return ((acc | 0) & ~(clear | 0) & mask) !== 0 ? 1 : 0;
}
export function gameUpdateSlice7460b0Gate26584(mode) {
  /* PE 0x7460c8 cmp [Game+0x26584],0x2c / 0x7460d5 jne: FULL-DWORD. */
  return (mode >>> 0) === 0x2c ? 1 : 0;
}

/** ABI v95 (record idx 27 roomTriggerClearAudio): always-music body
 * decision law of 0x7f83b0 (called by Room::TriggerClear at 0x8069da
 * with arg1=1, arg2=0). music = arg2 != 0 || value > rnd ||
 * value >= 1.0f, where rnd = float32 of xorshift32(seed; {2,0x15,9}) *
 * 0x2f7ffffe. Branch-by-branch from cpu-dump 007f83b0.txt (PE
 * 0x7f8459..0x7f84e1): seed [game+0x182e4]; movq [0xb1f594]={2,0x15} +
 * dword [0xb1f59c]={9}; xorshift: x^=x>>2; x^=x<<0x15; x^=x>>9;
 * uint32->double sign-fix (cvtdq2pd + shr edx,0x1f + addsd
 * [edx*8+0xbacb00]); cvtpd2ps; mulss 0x2f7ffffe; comiss value,rnd /
 * ja + comiss value,1.0f / jae. NaN: comiss sets CF so ja/jae NOT
 * taken -> music==0. All params u32 bits; no uint8_t scalar. */
export function gameUpdateSliceRoomTriggerClearAudioMusic(arg2, valueBits, seed) {
  const force = arg2 >>> 0;
  if (force !== 0) return 1; /* PE 0x7f8453 jne 0x7f8509 */
  const s = seed >>> 0;
  let t = s ^ (s >>> 2);
  t = (t ^ (t << 0x15)) >>> 0;
  t = (t ^ (t >>> 9)) >>> 0;
  let wide = t | 0;
  if ((t >>> 31) !== 0) wide += 4294967296;
  const rnd = Math.fround(Math.fround(wide) * f32FromBits(0x2f7ffffe));
  const value = f32FromBits(valueBits >>> 0);
  if (value > rnd) return 1; /* comiss/ja ordered */
  if (value >= Math.fround(1.0)) return 1; /* comiss/jae ordered */
  return 0;
}

function f32FromBits(bits) {
  const u = new Uint32Array(1);
  u[0] = bits >>> 0;
  return new Float32Array(u.buffer)[0];
}
function bitsFromF32(value) {
  const f = new Float32Array(1);
  f[0] = value;
  return new Uint32Array(f.buffer)[0] >>> 0;
}

/** PE 0x0098de7e..0x0098deb9: cvtdq2pd + u32 fixup + cvtpd2ps + 2^-32 * 3.14f * 2. */
export function frameOpaque98dba0TimerThetaBits(sample) {
  const s = sample >>> 0;
  let wide = s | 0;
  if ((s >>> 31) !== 0) wide += 4294967296;
  const asF32 = Math.fround(wide);
  const unit = Math.fround(asF32 * f32FromBits(0x2f800000));
  const scaled = Math.fround(unit * f32FromBits(0x4048f5c3));
  return bitsFromF32(Math.fround(scaled + scaled));
}
export function frameOpaque98dba0TimerMagBits(timerAfterDec) {
  const t = Math.fround(timerAfterDec | 0);
  return bitsFromF32(Math.fround(t / f32FromBits(0x41200000)));
}
export function frameOpaque98dba0TimerTrigNarrowBits(resultBitsLo, resultBitsHi) {
  const view = new DataView(new ArrayBuffer(8));
  view.setUint32(0, resultBitsLo >>> 0, true);
  view.setUint32(4, resultBitsHi >>> 0, true);
  return bitsFromF32(Math.fround(view.getFloat64(0, true)));
}
export function frameOpaque98dba0TimerAxisBits(trigBits, magBits, oldBits) {
  const scaled = Math.fround(f32FromBits(trigBits >>> 0) * f32FromBits(magBits >>> 0));
  const halved = Math.fround(f32FromBits(oldBits >>> 0) * f32FromBits(0x3f000000));
  return bitsFromF32(Math.fround(scaled + halved));
}

function shellAnim(input) {
  return (input.siteAnim | 0) >>> 0;
}
function shellEffectiveDim(input) {
  const room = input.siteRoom | 0;
  let dim = input.siteDim | 0;
  if (room === -2) dim = 0;
  return dim;
}
function shellNeeds705ee0(input) {
  const anim = shellAnim(input);
  if (anim === 3 || anim === 0x10) return 1;
  const eq = (input.room18304 | 0) === (input.room182d0 | 0) ? 1 : 0;
  const byte1 = ((input.roomByte1 | 0) & 0xff) !== 0 ? 1 : 0;
  if (eq !== 0 && byte1 !== 0 && anim !== 0xc) return 1;
  return 0;
}
function shellBlueEligible(input) {
  if (shellAnim(input) !== 0) return 0;
  const dim = shellEffectiveDim(input);
  if (dim < 0 || dim === (input.mode1830c | 0)) return 1;
  return 0;
}
function shellDirection(input) {
  return input.siteDirection === undefined ? SHELL_SITE_DIRECTION : (input.siteDirection | 0);
}

export function frameEffectShellHostWalk(input = {}) {
  let hostReach = 0;
  if (shellNeeds705ee0(input) !== 0) hostReach |= FRAME_EFFECT_SHELL_HOST_705EE0;
  if (shellBlueEligible(input) !== 0) hostReach |= FRAME_EFFECT_SHELL_HOST_BLUE_ROOM;
  return {
    effectiveDim: shellEffectiveDim(input),
    hostReach,
    drop: hostReach === 0 ? 1 : 0,
  };
}

export function frameEffectShellDrop(input = {}) {
  return frameEffectShellHostWalk(input).drop;
}

export function blueRoom74d4a0Walk({
  currentIdx = 0,
  destinationIdx = 0,
  direction = 0,
} = {}) {
  const cur = currentIdx | 0;
  const dest = destinationIdx | 0;
  const dir = direction | 0;
  void dest;
  const own = (va) => ({ va, kind: BLUE_ROOM_74D4A0_STORE_OWN_FRAME });
  const teb = (va) => ({ va, kind: BLUE_ROOM_74D4A0_STORE_TEB_SEH });
  const stores = [own(0x0074d4b0), teb(0x0074d4c8), own(0x0074d4d6)];
  const cookie = {
    va: 0x0074d708,
    kind: BLUE_ROOM_74D4A0_CALL_COOKIE,
    target: 0x00aef12b,
  };
  if (dir === -1 || cur < 0) {
    stores.push(teb(0x0074d6f8), own(0x0074d6f3));
    return {
      noop: 1,
      al: 0,
      reachedHost: 0,
      sehBalanced: true,
      stores,
      calls: [cookie],
    };
  }
  return {
    noop: 0,
    al: null,
    reachedHost: 1,
    sehBalanced: true,
    stores,
    calls: [{ va: 0x0074d4f2, kind: BLUE_ROOM_74D4A0_CALL_HOST, target: 0x00740bc0 }],
  };
}

export function blueRoom74d4a0Noop(input = {}) {
  return blueRoom74d4a0Walk(input).noop;
}

export function frameEffectShellDropProbed(input = {}) {
  if (shellNeeds705ee0(input) !== 0) return 0;
  if (shellBlueEligible(input) === 0) return 1;
  return blueRoom74d4a0Noop({
    currentIdx: input.room18304 | 0,
    destinationIdx: input.siteRoom | 0,
    direction: shellDirection(input),
  });
}

function rewindWriteStores(extraOldSlot) {
  const gameVas = [
    0x00705fa7, 0x00705faf, 0x00705fd0, 0x00705fdf,
    0x00705fe8, 0x00705ff4, 0x00706005, 0x0070600f,
  ];
  const stores = [{ va: 0x00705ee0, kind: REWIND_705EE0_STORE_OWN_FRAME }];
  if (extraOldSlot) {
    stores.push({ va: 0x00705f95, kind: REWIND_705EE0_STORE_GAME });
  }
  for (const va of gameVas) {
    const rec = { va, kind: REWIND_705EE0_STORE_GAME };
    if (va === 0x00706005) rec.iterations = 0x20b;
    stores.push(rec);
  }
  return stores;
}

export function rewind705ee0Walk(input = {}) {
  const guardA = input.guard269ea | 0;
  const guardB = input.guard269eb | 0;
  const guardC = input.guard68d70 | 0;
  const snapshotArg = input.snapshotArg | 0;
  const slotIndex = input.slotIndex676ac | 0;
  const slotValid = input.slotValidByte | 0;
  const slotRoom = input.slotRoom19d20 | 0;
  const gameRoom = input.gameRoom18304 | 0;
  const slotTag = input.slotTagE8 | 0;
  const gameTag = input.gameTag0 | 0;
  const slotArg = input.slotArg1fe2c | 0;
  const gameFrame = input.gameFrame264f8 | 0;
  const slotFrame = input.slotFrame1fe30 | 0;
  const ownOnly = [{ va: 0x00705ee0, kind: REWIND_705EE0_STORE_OWN_FRAME }];
  const epilogue = {
    noop: 1,
    exitVa: 0x0070601c,
    reachedWriteBlock: 0,
    stores: ownOnly,
    calls: [],
  };
  if ((guardA & 0xff) !== 0) return epilogue;
  if ((guardB & 0xff) !== 0) return epilogue;
  if ((guardC & 0xff) !== 0) return epilogue;
  const write = (extraOldSlot) => ({
    noop: 0,
    exitVa: 0x0070601c,
    reachedWriteBlock: 1,
    stores: rewindWriteStores(extraOldSlot),
    calls: [{ kind: REWIND_705EE0_CALL_HOST, target: 0x006f9000, va: 0x00705fc2 }],
  });
  if (slotIndex < 0) return write(false);
  if ((slotValid & 0xff) === 0) return write(false);
  if (slotRoom !== gameRoom) return write(true);
  if (slotTag !== gameTag) return write(true);
  if (snapshotArg < 0) return write(false);
  if (snapshotArg === slotArg) return epilogue;
  if (slotArg < 0) return write(false);
  const delta = ((gameFrame >>> 0) - (slotFrame >>> 0)) >>> 0;
  if (delta >= 0xf) return write(false);
  return {
    noop: 1,
    exitVa: 0x00705f85,
    reachedWriteBlock: 0,
    stores: ownOnly,
    calls: [],
  };
}

export function rewind705ee0Noop(input = {}) {
  return rewind705ee0Walk(input).noop;
}

export function frameEffectShellDropRewound(input = {}) {
  const dir = shellDirection(input);
  if (shellNeeds705ee0(input) !== 0) {
    const snap = rewind705ee0Noop({
      guard269ea: input.rewindGuard269ea | 0,
      guard269eb: input.rewindGuard269eb | 0,
      guard68d70: input.rewindGuard68d70 | 0,
      snapshotArg: SHELL_REWIND_ARG,
      slotIndex676ac: 0,
      slotValidByte: 0,
      slotRoom19d20: 0,
      gameRoom18304: 0,
      slotTagE8: 0,
      gameTag0: 0,
      slotArg1fe2c: 0,
      gameFrame264f8: 0,
      slotFrame1fe30: 0,
    });
    if (snap === 0) return 0;
  }
  if (shellBlueEligible(input) === 0) return 1;
  return blueRoom74d4a0Noop({
    currentIdx: input.room18304 | 0,
    destinationIdx: input.siteRoom | 0,
    direction: dir,
  });
}

export function gameUpdateSlice705ee0CallArg() {
  /* Frozen -1 at BOTH Update sites (shell 0x006fdb4d push -1 / call
     0x006fdb4f; record-30 rewind tail 0x00806c0a push -1 / call
     0x00806c0c). ret 4 = one 4-byte stack arg; receiver loaded inside
     ([0xc71678]). Negative arg -> 0x705f5a js write block: the dedupe
     exits are unreachable -> write whenever the three entry guards clear. */
  return SHELL_REWIND_ARG;
}

export function gameUpdateSlice705ee0CallOrderPlan() {
  /* The ORDER law of the same seam (8 direct rel32 callers image-wide;
     the two Update sites are pinned here). */
  return {
    shellCallVa: 0x006fdb4f,
    shellArg: 0xffffffff,
    shellFirstInSpan: 1,
    tailCallVa: 0x00806c0c,
    tailArg: 0xffffffff,
    tailLast: 1,
    receiverSelf: 1,
    postCallReread: 1,
  };
}

/** ABI v96 (record idx 12 opaqueCall006fd7c0): FUN_00705ee0 write-block
 * DECISION laws. The v74 noop probe (rewind705ee0Walk) licenses WHETHER the
 * write block runs; these laws license WHAT it does — the nine-store site
 * mask (S1..S9 = bits 0..8), the new slot index (edx), the payload word
 * count and the SaveState call-arg prep (receiver Game self-loaded from
 * [0xc71678], arg = newslot+4). Branch structure mirrors rewind705ee0Walk
 * exactly (the composed plan consumes reached BY REFERENCE); the store
 * census + writer-domain closure are in section-notes
 * update-v96-record12-705ee0. All params u32/i32.
 */

/** The 705ee0 slot-record base: Game+0x269ec + idx*0x20660 (PE 0x705fa1 lea
 * edi,[esi+0x269ec] + 0x705f9b/0x705fb6 imul/add). 32-bit wrap. */
export function gameUpdateSlice705ee0SlotBase(gameBase, slotIndex) {
  return (((gameBase >>> 0) + REWIND_705EE0_SLOT0_OFF +
           Math.imul(slotIndex | 0, REWIND_705EE0_SLOT_STRIDE)) >>> 0);
}

export function gameUpdateSlice705ee0PayloadWords() {
  return REWIND_705EE0_PAYLOAD_WORDS;
}

/** The writer-domain closure: the ONLY .text writers of Game+0x676ac are
 * exit-0x6f4520 init @0x6f46fd (-1), this function @0x705fa7 (edx in
 * {0, 1-edi, edi}) and the 0x706020 sibling @0x70636f/@0x706388 (0/1).
 * Entry indices outside {-1,0,1} cannot occur on the Update path. */
export function gameUpdateSlice705ee0SlotIndexDomain(slotIndex) {
  const i = slotIndex | 0;
  return i === -1 || i === 0 || i === 1 ? 1 : 0;
}

/** Shell-site write-reach with the frozen -1 (PE 0x705f58 test ebx,ebx /
 * 0x705f5a js 0x705f9b): a NEGATIVE snapshot arg jumps straight to the
 * write block, so the two dedupe exits (0x705f62 je / 0x705f7f..0x705f85)
 * are unreachable and the write block runs IFF the three entry byte guards
 * are clear (record-20 law). WIDE guards (0x100 etc.) read as CLEAR — the
 * PE compares ONE byte (0x705eef/0x705efc/0x705f09 cmp byte). */
export function gameUpdateSlice705ee0WriteReachedNeg1(guard269ea, guard269eb, guard68d70) {
  if ((guard269ea | 0) & 0xff) return 0;
  if ((guard269eb | 0) & 0xff) return 0;
  if ((guard68d70 | 0) & 0xff) return 0;
  return 1;
}

/** The new slot index (edx). Paths (mirror of rewind705ee0Walk):
 * idx<0 / slot invalid -> 0 (PE 0x705f1c xor edx,edx);
 * room/tag mismatch -> 1-idx (PE 0x705f8e mov edx,1 / 0x705f93 sub);
 * match (incl. the -1 / slot-arg<0 / delta>=0xf writes) -> idx (0x705f56);
 * dedupe no-op exits -> 0 (no write; the caller gates on reached). */
export function gameUpdateSlice705ee0NewSlotIndex(input = {}) {
  const gA = input.guard269ea | 0;
  const gB = input.guard269eb | 0;
  const gC = input.guard68d70 | 0;
  const arg = input.snapshotArg | 0;
  const idx = input.slotIndex676ac | 0;
  const valid = input.slotValidByte | 0;
  if ((gA & 0xff) !== 0) return 0;
  if ((gB & 0xff) !== 0) return 0;
  if ((gC & 0xff) !== 0) return 0;
  if (idx < 0) return 0;
  if ((valid & 0xff) === 0) return 0;
  if ((input.slotRoom19d20 | 0) !== (input.gameRoom18304 | 0)) return 1 - idx;
  if ((input.slotTagE8 | 0) !== (input.gameTag0 | 0)) return 1 - idx;
  if (arg < 0) return idx;
  if (arg === (input.slotArg1fe2c | 0)) return 0; /* dedupe no-op */
  if ((input.slotArg1fe2c | 0) < 0) return idx;
  const delta = (((input.gameFrame264f8 | 0) >>> 0) - ((input.slotFrame1fe30 | 0) >>> 0)) >>> 0;
  if (delta >= 0xf) return idx;
  return 0; /* dedupe no-op */
}

/** The nine-site store mask. S2/S3/S5/S6/S7/S8/S9 are unconditional in the
 * write block (0x1f6); S1 (bit 0, 0x705f95 oldslot+0x19d54) adds ONLY on
 * the room/tag mismatch path; S4 (bit 3, 0x705fd0 newslot+0x48 restore)
 * adds ONLY on the match path ([ebp-1]==1). 0 when no write. */
export function gameUpdateSlice705ee0StoreMask(input = {}) {
  const gA = input.guard269ea | 0;
  const gB = input.guard269eb | 0;
  const gC = input.guard68d70 | 0;
  const arg = input.snapshotArg | 0;
  const idx = input.slotIndex676ac | 0;
  const valid = input.slotValidByte | 0;
  if ((gA & 0xff) !== 0) return 0;
  if ((gB & 0xff) !== 0) return 0;
  if ((gC & 0xff) !== 0) return 0;
  if (idx < 0) return REWIND_705EE0_STORE_MASK_BASE;
  if ((valid & 0xff) === 0) return REWIND_705EE0_STORE_MASK_BASE;
  if ((input.slotRoom19d20 | 0) !== (input.gameRoom18304 | 0) ||
      (input.slotTagE8 | 0) !== (input.gameTag0 | 0)) {
    return REWIND_705EE0_STORE_MASK_BASE | REWIND_705EE0_STORE_MASK_S1;
  }
  if (arg < 0) return REWIND_705EE0_STORE_MASK_BASE | REWIND_705EE0_STORE_MASK_S4;
  if (arg === (input.slotArg1fe2c | 0)) return 0; /* dedupe no-op */
  if ((input.slotArg1fe2c | 0) < 0) {
    return REWIND_705EE0_STORE_MASK_BASE | REWIND_705EE0_STORE_MASK_S4;
  }
  const delta = (((input.gameFrame264f8 | 0) >>> 0) - ((input.slotFrame1fe30 | 0) >>> 0)) >>> 0;
  if (delta >= 0xf) return REWIND_705EE0_STORE_MASK_BASE | REWIND_705EE0_STORE_MASK_S4;
  return 0; /* dedupe no-op */
}

/** The SaveState call-arg prep: the call site pushes newslot+4 (PE
 * 0x705fbe lea eax,[edi+4] / 0x705fc1 push eax / 0x705fc2 call 0x6f9000)
 * with the receiver loaded inside (esi=[0xc71678] at entry, mov ecx,esi
 * @0x705fad — no thiscall on the caller side). */
export function gameUpdateSlice705ee0SaveStateArgPrep(gameBase, newSlotIndex) {
  return (gameUpdateSlice705ee0SlotBase(gameBase, newSlotIndex) + 4) >>> 0;
}

/** The COMPOSED decision seam. reached is consumed BY REFERENCE from the
 * v74 noop walk (never re-derived); the mask/index/arg laws fill the plan.
 * Returns reached (1 = the host edge runs the write block). */
export function gameUpdateSlice705ee0WritePlan(input = {}) {
  const reached = rewind705ee0Walk(input).reachedWriteBlock;
  const newSlotIndex = gameUpdateSlice705ee0NewSlotIndex(input);
  let mask = 0;
  if (reached) mask = gameUpdateSlice705ee0StoreMask(input);
  const gameBase = input.gameBase >>> 0;
  const plan = {
    reached,
    newSlotIndex,
    storeMask: mask,
    payloadWords: REWIND_705EE0_PAYLOAD_WORDS,
    saveStateFire: reached,
    saveStateArg: gameUpdateSlice705ee0SaveStateArgPrep(gameBase, newSlotIndex),
    oldSlotBase: gameUpdateSlice705ee0SlotBase(gameBase, input.slotIndex676ac | 0),
    newSlotBase: gameUpdateSlice705ee0SlotBase(gameBase, newSlotIndex),
  };
  return plan;
}
export function stringToAnm2NameBytes(s) {
  const out = new Uint8Array(ISAAC_GAME_UPDATE_ANM2_NAME_BYTES);
  if (s == null) return out;
  if (typeof s === "string") {
    for (let i = 0; i < s.length && i < out.length; i += 1) out[i] = s.charCodeAt(i) & 0xff;
    return out;
  }
  const len = s.length | 0;
  for (let i = 0; i < out.length && i < len; i += 1) out[i] = s[i] & 0xff;
  return out;
}

export function flattenAnm2NameCells(names = [], maxCells = ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS) {
  const cap = maxCells | 0;
  const out = new Uint8Array(cap * ISAAC_GAME_UPDATE_ANM2_NAME_BYTES);
  if (names == null) return out;
  if (!Array.isArray(names) && typeof names !== "string" && names.length === cap * ISAAC_GAME_UPDATE_ANM2_NAME_BYTES) {
    out.set(names);
    return out;
  }
  const cells = Array.isArray(names) ? names : [];
  const n = Math.min(cells.length, cap);
  for (let i = 0; i < n; i += 1) out.set(stringToAnm2NameBytes(cells[i]), i * ISAAC_GAME_UPDATE_ANM2_NAME_BYTES);
  return out;
}

export function anm2NameCellAt(flat, i) {
  const out = new Uint8Array(ISAAC_GAME_UPDATE_ANM2_NAME_BYTES);
  const base = (i | 0) * ISAAC_GAME_UPDATE_ANM2_NAME_BYTES;
  if (!flat) return out;
  for (let k = 0; k < out.length && base + k < flat.length; k += 1) out[k] = flat[base + k] & 0xff;
  return out;
}

export function anm2NameIsShadow(bytes) {
  const b = stringToAnm2NameBytes(bytes);
  return b[0] === 0x73 && b[1] === 0x68 && b[2] === 0x61 && b[3] === 0x64 &&
    b[4] === 0x6f && b[5] === 0x77 && b[6] === 0;
}

function anm2NameBytesFromRuntime(names, i) {
  if (names == null) return stringToAnm2NameBytes(null);
  if (Array.isArray(names) && (names.length === 0 || typeof names[0] === "string" || Array.isArray(names[0]) || names[0] instanceof Uint8Array || names[0] == null)) {
    return stringToAnm2NameBytes(names[i]);
  }
  return anm2NameCellAt(names, i);
}

export function enginePrefixResidualCensus(engineAnm2Latch) {
  const skip = ((engineAnm2Latch >>> 0) & 0xff) !== 0;
  const census = {
    observableStores: 0,
    gameLogicCalls: 0,
    platformCalls: 0,
    ownFrameStores: 0,
    balancedStores: 0,
    scratchStores: 0,
    reachedJoinVa: 0x0082ef74,
  };
  for (const step of ENGINE_PREFIX_TRACE) {
    if (step.kind === "byteGateSkipTo") {
      if (skip) break;
      continue;
    }
    if (step.kind === "ownFrameStore") census.ownFrameStores += 1;
    else if (step.kind === "balancedStore") census.balancedStores += 1;
    else if (step.kind === "scratchStore") census.scratchStores += 1;
    else if (step.kind === "platformCall") census.platformCalls += 1;
    else if (step.kind === "gameLogicCall") {
      census.gameLogicCalls += 1;
      if ((step.target | 0) === 0x0040bd50) {
        census.observableStores += ENGINE_PREFIX_ANM2_LOAD_OBSERVABLE_STORES;
      }
    }
  }
  return census;
}

export function enginePrefixDropLatched(engineAnm2Latch) {
  return ((engineAnm2Latch >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function engineAnm2LanePure({
  engineAnm2BlobReady = 0,
  engineAnm2LatchReady = 0,
  engineAnm2LayerCount = 0,
  engineAnm2ExtraCount = 0,
  engineAnm2Latch = 0,
} = {}) {
  if ((engineAnm2BlobReady | 0) === 0 || (engineAnm2LatchReady | 0) === 0) return 0;
  if (((engineAnm2Latch >>> 0) & 0xff) !== 0) return 0;
  if ((engineAnm2LayerCount >>> 0) > ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS) return 0;
  if ((engineAnm2ExtraCount >>> 0) > ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS) return 0;
  return 1;
}

export function applyEngineAnm2LoadLane(state, runtimeInputs, events) {
  if (!state || !runtimeInputs || !events) return 0;
  if (engineAnm2LanePure(runtimeInputs) === 0) return 0;
  const layerCount = runtimeInputs.engineAnm2LayerCount >>> 0;
  const extraCount = runtimeInputs.engineAnm2ExtraCount >>> 0;
  const latchPre = runtimeInputs.engineAnm2Latch >>> 0;
  let flags = runtimeInputs.engineAnm2Bitflags110Pre >>> 0;
  state.engineAnm2Loaded = (latchPre & 0xffffff00) | 1;
  let slot10c = 0xffffffff;
  let starMask = 0;
  for (let i = 0; i < layerCount; i += 1) {
    const name = anm2NameBytesFromRuntime(runtimeInputs.engineAnm2LayerNames, i);
    if (anm2NameIsShadow(name)) slot10c = i >>> 0;
    if (name[0] === 0x2a) {
      starMask |= 1 << i;
      flags |= 0x400;
    }
  }
  state.engineAnm2Slot10c = slot10c;
  for (let j = 0; j < extraCount; j += 1) {
    const name = anm2NameBytesFromRuntime(runtimeInputs.engineAnm2ExtraNames, j);
    if (name[0] === 0x2a) flags |= 0x800;
  }
  state.engineAnm2Bitflags110 = flags;
  events.engineAnm2LaneApplied = 1;
  events.engineAnm2StarLayerMask = starMask;
  return 1;
}

/* ABI v96 (record idx 21 depth): ANM2::Load LATCH one-shot laws. Latch
   byte = Game+0x1b97d = engine+0x141 = recv+0x109; S1 @0x0040bdb2 is the
   ONLY writer on the Update path (image-wide disp-0x141 census: 1 write
   0x70e447 + 2 cmp, none in the prefix closure; absolute Game+0x1b97d:
   zero) -> 0->1 on first load, never cleared -> the prefix arm (PE
   0x82ee9e BYTE test) is FIRST-LOAD-ONLY. */

export function gameUpdateSliceEngineAnm2LatchAfterLoad(latchPre) {
  return (((latchPre >>> 0) & 0xffffff00) | 1) >>> 0;
}

export function gameUpdateSliceEngineAnm2LoadArmRun(latch) {
  return ((latch >>> 0) & 0xff) === 0 ? 1 : 0;
}

export function gameUpdateSliceEngineAnm2LatchOneShot(latchPre, latchAfter) {
  return (latchAfter >>> 0) === gameUpdateSliceEngineAnm2LatchAfterLoad(latchPre) ? 1 : 0;
}

/* ABI v97 (wave-22 Unit A, record 22 rank opaqueRoomTransitionEnginePrefix):
   TYPED HOST-LEAF laws of the record's pre-lane host half — oracle twins of
   the isaac_game_update_slice_engine_anm2_* exports (section-notes
   update-v97-record22-prefix-typed). Exports-only (ABI 95, layouts frozen);
   the H2/H4/LoadImage EMISSIONS + capture lanes are §lane-requests there.
   All u32/i32; wide-value drives pin the FULL-DWORD vs LOW-BYTE gates. */
export function engineAnm2PrologueVa() { return 0x0040e2b0; }
export function engineAnm2PrologueArgc() { return 1; }
export function engineAnm2FilenameAssignNeeded(thisAddr, pathAddr) {
  /* PE 0x40bd68 cmp esi,edi / je 0x40bd81 — ADDRESS equality. */
  return (thisAddr >>> 0) !== (pathAddr >>> 0) ? 1 : 0;
}
export function engineAnm2FilenameAssignSsoSource(sourceCap) {
  /* PE 0x40bd6c cmp dword [edi+0x14],0x10 / jb — UNSIGNED cap < 0x10. */
  return (sourceCap >>> 0) < 0x10 ? 1 : 0;
}
export function engineAnm2FilenameSrcChars(sourceAddr, sourceCap, heapPtr) {
  return (sourceCap >>> 0) < 0x10 ? (sourceAddr >>> 0) : (heapPtr >>> 0);
}
export function engineAnm2FilenamePtrOffset() { return 0x00; }
export function engineAnm2FilenameSizeOffset() { return 0x10; }
export function engineAnm2FilenameCapOffset() { return 0x14; }
export function engineAnm2CacheGuardVa() { return 0x0040db90; }
export function engineAnm2CacheFetchVa() { return 0x0040e110; }
export function engineAnm2CacheFetchGlobalsBase() { return 0x00c798b8; }
export function engineAnm2CacheFetchGlobalsWords() { return 3; }
export function engineAnm2LoadGraphicsVa() { return 0x0040c000; }
export function engineAnm2LoadImageVa() { return 0x009588a0; }
export function engineAnm2LoadGraphicsEntered(layerCount) {
  /* v8 entry fence cmp [this+0x80],0 / jbe — UNSIGNED count != 0. */
  return (layerCount >>> 0) !== 0 ? 1 : 0;
}
export function engineAnm2LoadGraphicsSkipPredicate(flag30) {
  /* v8 skip cmp byte [layer+0x30],0 / jne — LOW-BYTE. */
  return ((flag30 >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function engineAnm2LoadGraphicsFlagNormalize(flag) {
  /* v8 STORE A: exactly 0/1, like the PE's mov byte [ebp-0x11], 1/0. */
  return ((flag >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function engineAnm2AnimApplyFirstOffset() { return 0x30; }
export function engineAnm2AnimApplySecondOffset() { return 0x50; }
export function engineAnm2AnimApplyArg() { return 0; }
export function engineAnm2AnimApplyCount() { return 2; }
export function engineAnm2V8WireDecision({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0, engineAnm2Latch = 0,
  engineAnm2LayerCount = 0, engineAnm2ExtraCount = 0, loadGraphicsIn = 0,
} = {}) {
  /* The 0x40bd97 wire runs iff the LIVE v77 lane machinery is on AND the
     loadgraphics LOW-BYTE gate opens (PE 0x40bd8e). */
  if (engineAnm2LanePure({ engineAnm2BlobReady, engineAnm2LatchReady,
    engineAnm2Latch, engineAnm2LayerCount, engineAnm2ExtraCount }) === 0) return 0;
  return engineAnm2LoadGraphicsNeeded(loadGraphicsIn);
}
export function engineAnm2PrefixTypedHostEvents({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0, engineAnm2Latch = 0,
  engineAnm2LayerCount = 0, engineAnm2ExtraCount = 0, pathSize10 = 0,
  thisAddr = 0, pathAddr = 0, loadGraphicsIn = 0,
} = {}) {
  /* 0 = lane machinery OFF -> pre-v77 monolith (no typed naming);
     bit0 H2 filename assign (!is_self), bit1 H4 cache fetch (ALWAYS),
     bit2 H5 LoadImage (graphics_needed). Site fixed point -> 7. */
  if (engineAnm2LanePure({ engineAnm2BlobReady, engineAnm2LatchReady,
    engineAnm2Latch, engineAnm2LayerCount, engineAnm2ExtraCount }) === 0) return 0;
  let mask = 2; /* bit1: H4 */
  if (engineAnm2LoadPathIsSelf(thisAddr, pathAddr) === 0) mask |= 1; /* H2 */
  if (engineAnm2LoadGraphicsNeeded(loadGraphicsIn) !== 0) mask |= 4; /* LoadImage */
  return mask;
}

/* ABI v98 (wave-22 Unit B, record 22 rank opaqueRoomTransitionEnginePrefix):
   the standing LoadImage/cache decision laws + the H6 anim-apply gate
   translation. Consume the ABI-96 COMMITTED capture lanes (runtime tail
   14212..14244) and drive the typed emissions (events 944/948/952).
   ABI stays 96; layouts frozen; no uint8_t scalar params. */

/* The REMOVAL gate: 1 iff ALL FIVE capture vouchers are LIVE (v77 blob +
   v77 latch + v96 H2 filename + v96 H6 anim + v96 v8-wire loadgraphics).
   The typed path covers every arm of the record only when every committed
   capture is host-set; any 0 keeps the pre-v98 residual byte-for-byte. */
export function engineAnm2PrefixFoldReady({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0,
  engineAnm2FilenameReady = 0, engineAnm2AnimReady = 0,
  engineAnm2LoadgraphicsFlagReady = 0,
} = {}) {
  if ((engineAnm2BlobReady | 0) === 0) return 0;
  if ((engineAnm2LatchReady | 0) === 0) return 0;
  if ((engineAnm2FilenameReady | 0) === 0) return 0;
  if ((engineAnm2AnimReady | 0) === 0) return 0;
  if ((engineAnm2LoadgraphicsFlagReady | 0) === 0) return 0;
  return 1;
}

/* The standing CACHE decision: H4 cache fetch 0x40e110 is STRAIGHT-LINE —
   on the typed arm it ALWAYS fires (globals 0xc798b8/bc/c0, the
   global-cache contract; cache_fetch_globals_base/words name the statics).
   1 iff lane_pure && the H2/H4 capture voucher (filename_ready) is live. */
export function engineAnm2CacheFetchDecision({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0, engineAnm2Latch = 0,
  engineAnm2LayerCount = 0, engineAnm2ExtraCount = 0,
  engineAnm2FilenameReady = 0,
} = {}) {
  if (engineAnm2LanePure({ engineAnm2BlobReady, engineAnm2LatchReady,
    engineAnm2Latch, engineAnm2LayerCount, engineAnm2ExtraCount }) === 0) return 0;
  return (engineAnm2FilenameReady | 0) !== 0 ? 1 : 0;
}

/* The standing LOADIMAGE decision: the leaf Manager::LoadImage 0x9588a0
   fires via the 0x40c000 loader only when the v8 entry fence OPENS
   (entered — UNSIGNED layer_count != 0; a 0 count exits BEFORE the leaf)
   AND the loadgraphics LOW-BYTE gate opens (graphics_needed). The v8-wire
   voucher must be live. Site push 1 -> graphics_needed 1; entered decides. */
export function engineAnm2LoadImageDecision({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0, engineAnm2Latch = 0,
  engineAnm2LayerCount = 0, engineAnm2ExtraCount = 0, loadGraphicsIn = 0,
  engineAnm2LoadgraphicsFlagReady = 0,
} = {}) {
  if (engineAnm2LanePure({ engineAnm2BlobReady, engineAnm2LatchReady,
    engineAnm2Latch, engineAnm2LayerCount, engineAnm2ExtraCount }) === 0) return 0;
  if ((engineAnm2LoadgraphicsFlagReady | 0) === 0) return 0;
  if (engineAnm2LoadGraphicsEntered(engineAnm2LayerCount) === 0) return 0;
  return engineAnm2LoadGraphicsNeeded(loadGraphicsIn);
}

/* The H6 anim-apply GATE translation: the 0x408830 applies fire x2
   (UNCONDITIONAL on the arm, push 0) onto recv+0x30/+0x50 = Game+0x1b8a4/
   0x1b8c4 (pre-states from engine_anm2_anim_first_pre/second_pre; family
   v2 plan consumed by reference). 1 iff lane_pure && the H6 capture
   voucher (anim_ready) is live. PURE — no event; the fold's anim coverage
   is the voucher + this law. */
export function engineAnm2AnimApplyDecision({
  engineAnm2BlobReady = 0, engineAnm2LatchReady = 0, engineAnm2Latch = 0,
  engineAnm2LayerCount = 0, engineAnm2ExtraCount = 0,
  engineAnm2AnimReady = 0,
} = {}) {
  if (engineAnm2LanePure({ engineAnm2BlobReady, engineAnm2LatchReady,
    engineAnm2Latch, engineAnm2LayerCount, engineAnm2ExtraCount }) === 0) return 0;
  return (engineAnm2AnimReady | 0) !== 0 ? 1 : 0;
}

/* ABI v95: record idx 21 ANM2::Load (0x0040bd50, exact ZHL) frame decision
   laws — the PURE part of the frame: WHICH of the six pre-lane host callees
   fire and the ordered host-call count. Transcribed branch-for-branch from
   the 111-instruction body (see section-notes/update-v95-82ee40-anm2-load):

     H1 prologue     0x40e2b0  iff [recv+0x10] != 0  (0x40bd59 cmp dword/je
                                          — FULL-DWORD gate)
     H2 assign       0x40ccd0  iff recv != path      (0x40bd68 cmp esi,edi/je
                                          — ADDRESS equality)
     H3 cache guard  0x40db90  ALWAYS                (0x40bd81)
     H4 cache fetch  0x40e110  ALWAYS                (0x40bd88)
     H5 loader       0x40c000  iff (loadgraphics&0xff) != 0
                                          (0x40bd8e cmp byte/je — LOW-BYTE)
     H6a/H6b anim    0x408830  (recv+0x30, recv+0x50) ALWAYS (0x40bd9c)

   count = 4 + !is_self + path_present + graphics_needed. The 6 observable
   stores S1..S6 need NO body (v77 lane): S1/S2 UNCONDITIONAL, S3/S5/S6
   pure name scans, S4 heap '*' scan (engineAnm2StarLayerMask; closure read
   census shows zero [*+0x8c] readers on the Update path — no typed apply).
   At the Update site (record idx 21 gated arm): path = caller's copy of the
   .rdata constant (never == recv, is_self 0), loadgraphics push 1
   unconditional (0x0082ef0d), latch-clear fixed point proves the pre-call
   filename size 0 -> 4 + 1 + 0 + 1 = 6. */
export function engineAnm2LoadPathPresent(pathSize10) {
  return (pathSize10 >>> 0) !== 0 ? 1 : 0;
}

export function engineAnm2LoadPathIsSelf(thisAddr, pathAddr) {
  return (thisAddr >>> 0) === (pathAddr >>> 0) ? 1 : 0;
}

export function engineAnm2LoadGraphicsNeeded(loadGraphicsIn) {
  /* PE 0x0040bd8e cmp byte [ebp+0xc],0 / je — LOW-BYTE gate on the
     loadgraphics arg: 0x1ff/0xffffffff run the 0x40c000 loader; 0x100 /
     0xffffff00 (clear low byte) are skipped. The wasm i32 arrives
     unmasked — the module owns the narrowing. */
  return ((loadGraphicsIn >>> 0) & 0xff) !== 0 ? 1 : 0;
}

export function engineAnm2LoadFrameHostCalls(
  pathSize10,
  thisAddr,
  pathAddr,
  loadGraphicsIn,
) {
  let count = 4;
  if (engineAnm2LoadPathIsSelf(thisAddr, pathAddr) === 0) count += 1;
  if (engineAnm2LoadPathPresent(pathSize10) !== 0) count += 1;
  if (engineAnm2LoadGraphicsNeeded(loadGraphicsIn) !== 0) count += 1;
  return count;
}

export function engineAnm2LoadSiteHostCalls() {
  /* Fixed point: latch low byte clear (PE 0x0082ee9e BYTE test) = never
     loaded = [recv+0x10] pre-call size 0; path constant never == recv
     Game+0x1b874; loadgraphics push 1 unconditional. 4+1+0+1 = 6. */
  return 6;
}

function signExtendLowByte(v) {
  return (v << 24) >> 24;
}

export function emitFrameEffect6fd7c0HostResiduals(state, events, siteAnim, roomIndex, roomDim, runtimeInputs = null, siteArg3 = 0) {
  events.roomTransitionIndex = roomIndex | 0;
  events.roomTransitionDimension = roomDim | 0;
  events.engineSiteAnim = siteAnim | 0;
  /* ABI v104 (record idx 12 transition-pack REAL wiring): the pack K-block
     is LIVE only when the pack voucher transition6fd7c0Ready @14324 AND the
     record's own ready opaqueCall006fd7c0Ready @13732 are BOTH set —
     either 0 (capture absent) keeps the pre-v104 residual byte-for-byte.
     The pack-live flow follows the PE arm order (A entry validation FIRST
     — the machine fatals before it ever reaches the mode-4 check at
     0x6fd81c). */
  const rt = runtimeInputs ?? {};
  const packLive = ((rt.opaqueCall006fd7c0Ready | 0) !== 0) && ((rt.transition6fd7c0Ready | 0) !== 0);
  let packArm = 0; /* 0 proceed / 1 fatal / 2 mode-4 / 3 nested */
  let packValid = 1;
  let packMode4 = 0;
  let effectiveAnim = siteAnim | 0;
  let effectiveDim = roomDim | 0;
  if (packLive) {
    packValid = gameUpdateSlice6fd7c0ArgsValid(roomIndex | 0, siteAnim | 0, roomDim | 0);
    if (packValid === 0) {
      /* A/G fatal: log (0xa112c0, level 8, string by fail kind) + ret 0x14
         @0x6fdbfd — nothing below runs (no shell/engine/P4). The laws pin
         the push sites (0x6fdbdd room / 0x6fdbd6 anim / dim) for the host
         log re-issue. */
      gameUpdateSlice6fd7c0ValidateFailKind(roomIndex | 0, siteAnim | 0, roomDim | 0);
      gameUpdateSlice6fd7c0FatalStringVa(gameUpdateSlice6fd7c0ValidateFailKind(roomIndex | 0, siteAnim | 0, roomDim | 0));
      gameUpdateSlice6fd7c0FatalLevel();
      packArm = 1;
    } else {
      packMode4 = isaacFrameEffect6fd7c0Mode4SfxEarly(state.timedTransitionCleanupMode | 0);
      if (packMode4 !== 0) {
        packArm = 2;
      } else {
        const roomEq = (rt.frameEffectShellRoom18304 | 0) === (rt.frameEffectShellRoom182d0 | 0) ? 1 : 0;
        const roomByte1 = ((rt.frameEffectShellRoomByte1 | 0) & 0xff) !== 0 ? 1 : 0;
        /* C: the anim-0xc special — the COMMITTED lanes
           transition6fd7c0Game0/AltPathProbe/RouteProbe make the route
           capture-decidable (site anim 20/0 never opens the arm; an
           arbitrary site shape can). */
        const routeKind = gameUpdateSlice6fd7c0Anim0xcRoute(
          siteAnim | 0, rt.transition6fd7c0Game0 | 0, rt.transition6fd7c0AltPathProbe | 0,
          roomEq, roomByte1, rt.transition6fd7c0RouteProbe | 0);
        if (routeKind === 2) {
          /* NESTED: 0x6fdc10(0,6,0) @0x6fd8ca; the arg3!=0 tail runs the
             Play host leaf (log 0x7abe20 + seed 0xd7 + the mode-4 SFX
             build) before the return — either way the body returns BEFORE
             the engine. */
          events.frameEffect6fd7c0StageTransition = (events.frameEffect6fd7c0StageTransition | 0) + 1;
          if ((siteArg3 | 0) !== 0) {
            /* ABI v122: coarse retired — typed Play leaf ONLY. */
            events.frameEffect6fd7c0Mode4SfxPlayTyped =
              (events.frameEffect6fd7c0Mode4SfxPlayTyped | 0) + 1;
          }
          packArm = 3;
        } else {
          if (routeKind === 1) {
            /* REWRITE (0x6fd8b9 lea -0xe / 0x6fd8bc +5 -> room -2, anim 3;
               dim 0 at 0x6fd8f5). */
            effectiveAnim = 3;
            effectiveDim = 0;
          }
          if ((roomIndex | 0) === -2) effectiveDim = 0;
          /* D: the generic arm — player-loop gate + anim-3 dispatch
             consume the player probe / room type / subroom flag lanes. */
          if ((siteArg3 | 0) !== 0 && (effectiveAnim === 3 || effectiveAnim === 0xc)) {
            const playerProbe = rt.transition6fd7c0PlayerLoopProbe | 0;
            if (gameUpdateSlice6fd7c0PlayerLoopReach(effectiveAnim, siteArg3 | 0, playerProbe) !== 0) {
              events.frameEffect6fd7c0PlayerLoop = (events.frameEffect6fd7c0PlayerLoop | 0) + 1;
            } else if (gameUpdateSlice6fd7c0RoomDispatchReach(
                effectiveAnim, playerProbe, rt.transition6fd7c0RoomType8 | 0,
                rt.transition6fd7c0RoomSubroomFlag44 | 0) === 1) {
              events.frameEffect6fd7c0RoomDispatch = (events.frameEffect6fd7c0RoomDispatch | 0) + 1;
            }
            /* dispatch == 2: direct 705ee0 (the needs-law tail follows in
               the shared span below). */
          }
        }
      }
    }
  }
  if (packArm !== 0) {
    if (packArm === 2) {
      /* ABI v122: coarse retired — the typed Play leaf below IS the arm
         capture (same tick, same order, 1:1 with the retired edge). */
      events.frameEffect6fd7c0Mode4SfxPlayTyped =
        (events.frameEffect6fd7c0Mode4SfxPlayTyped | 0) + 1;
    }
    events.continuationKind = (siteAnim | 0) === 20
      ? UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT
      : UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED;
    return;
  }
  if (!packLive &&
      isaacFrameEffect6fd7c0Mode4SfxEarly(state.timedTransitionCleanupMode | 0) !== 0) {
    /* ABI v95 (record idx 19) + ABI v122 (update-v122-mode4-sfx-removal):
       the Play call is a TYPED host leaf — the composed arg-prep laws
       (seed 0xbb/0xd7, %20 rare hit, loop-0 pack, receiver base+0x2a324,
       playVa 0x92dc30) pin what the host consumer re-issues at the
       0x92dc30 seam. ABI v122 retires the coarse counter: it fired 1:1
       with this typed event at EVERY arming site (mode-4 early arm,
       pack-live mode-4 arm, nested arg3!=0 tail — same tick, same order),
       so coarse_old(t) == frameEffect6fd7c0Mode4SfxPlayTyped(t) for all t
       and the counter @108 STAYS in the frozen events ABI, never fires. */
    events.frameEffect6fd7c0Mode4SfxPlayTyped =
      (events.frameEffect6fd7c0Mode4SfxPlayTyped | 0) + 1;
    events.continuationKind = (siteAnim | 0) === 20
      ? UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT
      : UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED;
    return;
  }
  const shellReady = (rt.frameEffectShellReady | 0) !== 0;
  const rewindReady = (rt.frameEffectRewindReady | 0) !== 0;
  const shellInput = {
    siteAnim: effectiveAnim,
    siteRoom: roomIndex | 0,
    siteDim: effectiveDim,
    room18304: rt.frameEffectShellRoom18304 | 0,
    room182d0: rt.frameEffectShellRoom182d0 | 0,
    roomByte1: rt.frameEffectShellRoomByte1 | 0,
    mode1830c: state.roomTransitionMode1830c | 0,
    siteDirection: SHELL_SITE_DIRECTION,
    rewindGuard269ea: rt.frameEffectRewindGuard269ea | 0,
    rewindGuard269eb: rt.frameEffectRewindGuard269eb | 0,
    rewindGuard68d70: rt.frameEffectRewindGuard68d70 | 0,
  };
  /* ABI v129 (update-v129-record20-shell-removal): record idx 20
     opaqueFrameEffect6fd7c0Shell REMOVED under the FULL-CAPTURE voucher
     capLive == frameEffectShellReady @3172 (canopy lanes) &&
     opaqueCall006fd7c0Ready @13732 (the record-12 capture: the
     rewind_705ee0_* slot/game/payload lanes + the v74 guard bytes).
     Arming-identity theorem -- every arm of the coarse edge on a
     capture-live tick:
       - needs_705ee0 == 0 && blue_room_eligible == 0 -> PROVEN pure skip
         (frame-effect family laws consumed BY REFERENCE:
         frameEffect6fd7c0Needs705ee0NullPlayer +
         frameEffect6fd7c0BlueRoomEligible);
       - needs == 0 && blue == 1 -> the PE's ONLY host call is
         Level::TryInitializeBlueRoom 0x74d4a0 @0x006fdb78 with the
         site-frozen direction -1 -> the v73 Update-no-op law;
       - needs == 1 -> FUN_00705ee0 runs @0x006fdb4f: the composed write
         plan reaching the write block publishes the TYPED carriers
         rewind705ee0Stores/rewind705ee0SaveState (v96 seam); an early
         exit is own-frame-only (v74 store census) = no observable
         residual.
     The coarse counter therefore carries no information on capture-live
     ticks and is RETIRED there; capture absence keeps the pre-v72
     monolith byte-for-byte. Slot @112 STAYS in the frozen events ABI. */
  const capLive = shellReady && ((rt.opaqueCall006fd7c0Ready | 0) !== 0);
  let shellDrop = 0;
  if (capLive) {
    const roomEq = (rt.frameEffectShellRoom18304 | 0) === (rt.frameEffectShellRoom182d0 | 0) ? 1 : 0;
    const roomByte1 = ((rt.frameEffectShellRoomByte1 | 0) & 0xff) !== 0 ? 1 : 0;
    if (frameEffect6fd7c0Needs705ee0NullPlayer({
        anim: effectiveAnim,
        roomIndicesEqual: roomEq !== 0,
        roomByte1Nonzero: roomByte1 !== 0,
      })) {
      /* Canopy open: the PE calls 0x705ee0 at 0x006fdb4f with the frozen
         -1 snapshot arg. plan.reached publishes the typed pair; plan.miss
         is the proven own-frame-only exit. Either way: retired. */
      const plan = gameUpdateSlice705ee0WritePlan({
        guard269ea: rt.frameEffectRewindGuard269ea | 0,
        guard269eb: rt.frameEffectRewindGuard269eb | 0,
        guard68d70: rt.frameEffectRewindGuard68d70 | 0,
        snapshotArg: SHELL_REWIND_ARG,
        slotIndex676ac: rt.rewind705ee0SlotIndex676ac | 0,
        slotValidByte: rt.rewind705ee0SlotValidByte | 0,
        slotRoom19d20: rt.rewind705ee0SlotRoom19d20 | 0,
        gameRoom18304: rt.frameEffectShellRoom18304 | 0,
        slotTagE8: rt.rewind705ee0SlotTagE8 | 0,
        gameTag0: rt.rewind705ee0GameTag0 | 0,
        slotArg1fe2c: rt.rewind705ee0SlotArg1fe2c | 0,
        gameFrame264f8: rt.rewind705ee0GameFrame264f8 | 0,
        slotFrame1fe30: rt.rewind705ee0SlotFrame1fe30 | 0,
        gameBase: rt.rewind705ee0GameBase >>> 0,
      });
      if (plan.reached !== 0) {
        events.rewind705ee0Stores = (events.rewind705ee0Stores | 0) + 1;
        events.rewind705ee0SaveState = (events.rewind705ee0SaveState | 0) + 1;
      }
      shellDrop = 1;
    } else if (frameEffect6fd7c0BlueRoomEligible({
        anim: effectiveAnim >>> 0,
        dimension: effectiveDim | 0,
        roomTransitionMode1830c: state.roomTransitionMode1830c | 0,
      })) {
      /* Blue-room arm: 0x74d4a0 with the site-frozen direction -1 is the
         v73 proven Update-no-op (consumed BY REFERENCE). */
      shellDrop = blueRoom74d4a0Noop({
        currentIdx: rt.frameEffectShellRoom18304 | 0,
        destinationIdx: roomIndex | 0,
        direction: SHELL_SITE_DIRECTION,
      });
    } else {
      /* Both gates closed: the 0x006fd8f0..0x006fdb87 span is a proven
         pure skip (the v72 law). */
      shellDrop = 1;
    }
  } else if (shellReady && rewindReady) shellDrop = frameEffectShellDropRewound(shellInput);
  else if (shellReady) shellDrop = frameEffectShellDropProbed(shellInput);
  if (shellDrop === 0) {
    events.opaqueFrameEffect6fd7c0Shell = (events.opaqueFrameEffect6fd7c0Shell | 0) + 1;
  }
  /* ABI v104: the E blue-room arm goes LIVE — blueRoomReach (the
     site-decidable law) gates the probe RESULT consumption: the 0x74d4a0
     AL lane drives the cmovne -0x10 room rewrite — the 0x82ee40 arg0 for
     the host fold re-issue (engineRoomArg, byte-re-narrowed). Pack-live
     only; the v73 noop law still covers the CALL itself. */
  if (packLive && gameUpdateSlice6fd7c0BlueRoomReach(
      effectiveAnim, effectiveDim, state.roomTransitionMode1830c | 0) !== 0) {
    gameUpdateSlice6fd7c0EngineRoomArg(roomIndex | 0, rt.transition6fd7c0BlueRoomProbe | 0);
  }
  /* ABI v104: the F engine arm — enginePrefixFires(valid, mode4) gates the
     0x82ee40 fold: the engine (0x6fdb9b) is reached iff the entry
     validation passed AND the mode-4 early return did not fire. Both are
     pack-decided above; in-module consumption with the LIVE values. */
  if (packLive && gameUpdateSlice6fd7c0EnginePrefixFires(packValid, packMode4) === 0) {
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX;
    return;
  }
  const engineAnm2Ready = (rt.engineAnm2LatchReady | 0) !== 0;
  let prefixDrop = 0;
  if (engineAnm2Ready) prefixDrop = enginePrefixDropLatched(rt.engineAnm2Latch);
  if (prefixDrop === 0) {
    /* ABI v98 (wave-22 Unit B): when every committed capture voucher is
       LIVE the typed path covers every arm of the record — the coarse
       counter is DROPPED and the typed emissions (events 944/948/952)
       carry the fold (H2 assign / H4 cache fetch / H5 LoadImage leaf).
       Any voucher 0, a set latch low byte, or a lane-off keeps the
       pre-v98 residual byte-for-byte (v75 precedent). */
    if (engineAnm2PrefixFoldReady(rt) !== 0 && engineAnm2LanePure(rt) !== 0) {
      /* H2 filename assign 0x40ccd0 — site fixed point (v95 site law:
         the path constant 0xb6cda8 never == recv Game+0x1b874, PE
         0x40bd68 -> assign fires). */
      events.engineAnm2PrefixFilenameAssign = (events.engineAnm2PrefixFilenameAssign | 0) + 1;
      /* H4 cache fetch 0x40e110 — straight-line; the standing cache
         decision names the global-cache contract (0xc798b8/bc/c0). */
      if (engineAnm2CacheFetchDecision(rt) !== 0) {
        events.engineAnm2PrefixCacheFetch = (events.engineAnm2PrefixCacheFetch | 0) + 1;
      }
      /* H5 leaf Manager::LoadImage 0x9588a0 via 0x40c000 — the standing
         LoadImage decision; the site pushes 1 (0x0082ef0d). */
      if (engineAnm2LoadImageDecision({ ...rt, loadGraphicsIn: 1 }) !== 0) {
        events.engineAnm2PrefixLoadImage = (events.engineAnm2PrefixLoadImage | 0) + 1;
      }
    } else {
      events.opaqueRoomTransitionEnginePrefix = (events.opaqueRoomTransitionEnginePrefix | 0) + 1;
    }
    if (engineAnm2LanePure(rt) !== 0) applyEngineAnm2LoadLane(state, rt, events);
  }
  events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX;
}

function continueAfterStageTransitionEffect(state, events, runtimeInputs = null) {
  if ((state.effectCounter68d6c | 0) > 0) {
    state.effectCounter68d6c = (state.effectCounter68d6c | 0) - 1;
    state.positionResetTimer = 10;
    if ((state.effectCounter68d6c | 0) <= 0) {
      state.effectCounter68d6c = 0;
      if ((state.roomTransitionMode1830c | 0) === 2) {
        state.roomTransitionMarker18318 = -1;
        emitFrameEffect6fd7c0HostResiduals(
          state,
          events,
          20,
          state.roomTransitionIndex18900 | 0,
          signExtendLowByte(state.roomTransitionDimension18904 | 0),
          runtimeInputs,
          0,
        );
        return;
      }
    }
  }
  continueToFrameManagerUpdates(state, runtimeInputs ?? {}, events);
}

function emptyEvents() {
  const e = {};
  for (const k of Object.keys(EVENTS_LAYOUT)) e[k] = 0;
  e.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE;
  e.dispatchKind = TRANSITION_DISPATCH.NONE;
  return e;
}
function emptyState() {
  const s = {};
  for (const k of Object.keys(STATE_LAYOUT)) s[k] = 0;
  return s;
}
/* C-shaped adapters over frozen family oracles (consumed by reference). */
function isaacHudPostUpdateTryPure(mask, history, stat) {
  const r = tryHudPostUpdatePure({
    playerHudOccupiedMask: mask,
    managerHistoryCount: history,
    managerStatFlag: stat,
  });
  return r && r.hostRequired ? 1 : 0;
}
function isaacHudGate92f1c0TryPure(mode) { return hudGate92f1c0TryPure(mode) ? 1 : 0; }
function isaacHudGate92f1c0Plan(mode) { return hudGate92f1c0Plan({ mode }); }
function isaacPlayerhudEntryClearHeartByte1(flags) { return playerHudEntryClearHeartByte1(flags); }
function isaacPlayerhudUpdateHeartsUsesTwin(twinPtr, playerType, field3bc) {
  return playerHudUpdateHeartsUsesTwin(twinPtr, playerType, field3bc);
}
function isaacPlayerhudCriticalHeartBlink(heartsSum, flag1519, trampSuppress, frame) {
  return playerHudCriticalHeartBlink({
    heartsSum, playerFlag1519: flag1519, trampSuppress, frameCounter264f8: frame,
  });
}
function isaacPlayerhudActiveSlotCountdownTick(active) {
  const slots = active?.slots ?? [active?.slots0, active?.slots1, active?.slots2, active?.slots3];
  const r = playerHudActiveSlotCountdownTick(slots);
  if (active && r && r.slots) active.slots = r.slots;
  return r && r.dirty ? 1 : 0;
}
function isaacPlayerhudTailFloatStep(value, predicateTrue) {
  const r = playerHudTailFloatStep(value, predicateTrue);
  return typeof r === "number" ? r : value;
}
function isaacPlayerhudTailCharCountdown(chars) { return playerHudTailCharCountdown(chars); }
function isaacPlayerhudStatBarTween(slot, targetBits, mode) { return playerHudStatBarTween(slot, targetBits, mode); }
function isaacMenuGateUpdateNeedsHost(menuState23a74, gate1b83c, predicate1ba74) {
  return menuGateUpdateNeedsHost(menuState23a74, gate1b83c, predicate1ba74) ? 1 : 0;
}
/* ABI v95 (record idx 2 0x009b6840 MenuGateUpdate body): pure gates/arm-
   select/store laws from the full-body census. Same PE transcription as the
   C++ exports (update-v95-menu-update-census/NOTES.md section 5). */
export function gameUpdateSlice9b6840ModeLatchNeeded(status22ed4) {
  /* PE 0x9b6905 cmp dword [Game+0x22ed4],2 / 0x9b690c je skip. FULL-DWORD:
     WIDE 0x100/0x1ff/0xffffffff latch; 0x102 must NOT be read as a low-byte
     2. Returns 1 when the body stores status22ed4=1, status22edc=2. */
  return (status22ed4 >>> 0) !== 2 ? 1 : 0;
}
export function gameUpdateSlice9b6840FcoProbeNeeded(mpBegin, mpEnd) {
  /* PE 0x9b6895..0x9b68a1: FULL-DWORD mp_begin == mp_end -> the FCO probe +
     room-entity walk runs (empty manager container); non-empty -> pure skip. */
  return (mpBegin >>> 0) === (mpEnd >>> 0) ? 1 : 0;
}
export function gameUpdateSlice9b6840WalkCountNeeded(count) {
  /* PE 0x9b68c7 cmp [count],0(esi) / 0x9b68cd jbe skip — UNSIGNED. */
  return (count >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSlice9b6840WalkEntryNeeded(type28, variant2c) {
  /* PE 0x9b68d9 cmp dword [e+0x28],5 / 0x9b68df cmp dword [e+0x2c],0x64 —
     FULL-DWORD both. */
  return (type28 >>> 0) === 5 && (variant2c >>> 0) === 0x64 ? 1 : 0;
}
export function gameUpdateSlice9b6840TailRenderNeeded(mode, byte249, byte135) {
  /* PE 0x9b712a..0x9b713e: mode FULL-DWORD ==1 selects this+0x249 else
     this+0x135; LOW-BYTE test != 0 -> the two 0x409030 renders run. */
  const sel = (mode >>> 0) === 1 ? byte249 : byte135;
  return (sel & 0xff) !== 0 ? 1 : 0;
}
export function gameUpdateSlice9b6840AnimLayerOk(animMax, requested) {
  /* PE 0x9b6a02 cmp [anim+0x80],req / jg ok — SIGNED. 0xffffffff max is
     negative and logs 'LayerId out of bounds\n'. */
  return ((animMax | 0) > (requested | 0)) ? 1 : 0;
}
export function gameUpdateSlice9b6840AnimIdOk(animNonzero, id, count) {
  /* PE 0x9b6a32..0x9b6a3d — SIGNED both ends: anim!=0 && id>=0 && id<count. */
  if ((animNonzero >>> 0) === 0) return 0;
  const sId = id | 0;
  const sCount = count | 0;
  return (sId >= 0 && sId < sCount) ? 1 : 0;
}
function isaacFrameOpaque4257b0PassANeedsHost(idCount) { return frameOpaque4257b0PassANeedsHost(idCount) ? 1 : 0; }
function isaacFrameOpaque4257b0PassBNeedsHost(idCount, listCount) { return frameOpaque4257b0PassBNeedsHost(idCount, listCount) ? 1 : 0; }
function isaacFrameOpaque4257b0NeedsHost(mode) { return frameOpaque4257b0NeedsHost(mode); }
function isaacFrameOpaqueList6772cSweep(timers, count) { return frameOpaqueList6772cSweep(timers, count); }
function isaacFrameEffect6fd7c0ApplyTerminals(input) { return frameEffect6fd7c0ApplyTerminals(input); }
function isaacFrameEffect6fd7c0Mode4SfxEarly(mode) { return frameEffect6fd7c0Mode4SfxEarly(mode) ? 1 : 0; }

const scratchPlayerHudBlink = Array(PLAYER_HUD_MAX_SLOTS).fill(0);
const scratchPlayerHudActive = Array.from({ length: PLAYER_HUD_MAX_SLOTS }, () => ({ slots: [0, 0, 0, 0] }));
const scratchPlayerHudFloat = Array(PLAYER_HUD_MAX_SLOTS).fill(0);
const scratchPlayerHudChars = Array.from({ length: PLAYER_HUD_MAX_SLOTS }, () => ({ c0: 0, c1: 0, c2: 0 }));
const scratch_player_hud_blink = scratchPlayerHudBlink;
const scratch_player_hud_active = scratchPlayerHudActive;
const scratch_player_hud_float = scratchPlayerHudFloat;
const scratch_player_hud_chars = scratchPlayerHudChars;

function emitOpaque0092e300(state, runtimeInputs, events) {
  const groups = runtimeInputs.opaque0092e300Groups ?? [];
  const firstVoice = runtimeInputs.opaque0092e300FirstVoice ?? [];
  const voices = runtimeInputs.opaque0092e300Voices ?? [];
  const opts = {
    walkReady: runtimeInputs.soundGroupWalkReady | 0,
    ready: runtimeInputs.opaque0092e300Ready | 0,
    groupCount: runtimeInputs.opaque0092e300GroupCount | 0,
    packsReady: runtimeInputs.opaque0092e300PacksReady | 0,
    groups,
    firstVoice,
    voiceBlobReady: runtimeInputs.opaque0092e300VoiceBlobReady | 0,
    voiceCount: runtimeInputs.opaque0092e300VoiceCount | 0,
    voices,
  };
  const walk = opaque0092e300Walk(opts);
  if ((walk.applied | 0) !== 0) {
    events.soundGroupWalkApplied = 1;
    events.opaque0092e300Slot3c = (walk.stopCalls | 0) > 0 ? 1 : 0;
    events.soundGroupWalkStores = walk.stores | 0;
    events.soundGroupWalkPendingMask = walk.pendingMask >>> 0;
    return;
  }
  if (opaque0092e300EmitsHost(opts)) events.opaqueCall0092e300 = 1;
}

const kTransitionStepBits = 0x3da3d70a;

function wrapIncrementI32(value) {
  return ((value | 0) + 1) | 0;
}

function classifyTransitionDispatch(mode, events) {
  events.dispatchKind = TRANSITION_DISPATCH.NONE;
  events.queuedScreenId = -1;
  events.fadeArgb = 0;
  events.payloadCopyRequired = 0;
  switch (mode | 0) {
    case 1: events.dispatchKind = TRANSITION_DISPATCH.QUEUE_SCREEN; events.queuedScreenId = 2; break;
    case 2: events.dispatchKind = TRANSITION_DISPATCH.QUEUE_SCREEN; events.queuedScreenId = 3; break;
    case 3: events.dispatchKind = TRANSITION_DISPATCH.QUEUE_SCREEN; events.queuedScreenId = 0x13; break;
    case 4: events.dispatchKind = TRANSITION_DISPATCH.QUEUE_SCREEN; events.queuedScreenId = 1; break;
    case 5:
    case 6: events.dispatchKind = TRANSITION_DISPATCH.RESTART_FLOW; break;
    case 7: events.dispatchKind = TRANSITION_DISPATCH.NEXT_VICTORY_LAP; break;
    case 8:
    case 10: events.dispatchKind = TRANSITION_DISPATCH.OPAQUE_MODE; break;
    case 9: events.dispatchKind = TRANSITION_DISPATCH.NO_OP; break;
    case 11: events.dispatchKind = TRANSITION_DISPATCH.QUEUE_SCREEN; events.queuedScreenId = 0x11; break;
    default: events.dispatchKind = TRANSITION_DISPATCH.UNKNOWN; break;
  }
  if ((events.dispatchKind | 0) === TRANSITION_DISPATCH.QUEUE_SCREEN) {
    events.fadeArgb = 0xff000000;
    events.payloadCopyRequired = 1;
  }
}

function recordHostFun746560(state, events, site, param, cleanupMode, postReady) {
  events.hostFun746560Site = site | 0;
  events.hostFun746560Param = (param >>> 0) & 0xff;
  events.hostFun746560Byte216e9 = hostFun746560NotifyByte(param);
  events.hostFun746560DeathmatchSuffix = hostFun746560DeathmatchSuffix(cleanupMode);
  if ((postReady >>> 0) === 0) return;
  state.hudMessageFlag8 = 1;
}

function seedHudStatWalkScratch(runtimeInputs) {
  const slots = [];
  for (let g = 0; g < 2; g += 1) {
    for (let k = 0; k < 10; k += 1) {
      slots.push({
        current: Math.fround(runtimeInputs[`hudStatSlot${g}${k}Current`] ?? 0),
        delta: 0,
        prev: Math.fround(runtimeInputs[`hudStatSlot${g}${k}Prev`] ?? 0),
        threshold: Math.fround(runtimeInputs[`hudStatSlot${g}${k}Threshold`] ?? 0),
        timer: runtimeInputs[`hudStatSlot${g}${k}Timer`] | 0,
      });
    }
  }
  return {
    ownerByte: hudStatTailOwnerMode(runtimeInputs.hudStatOwnerByte),
    slotPtr0: (runtimeInputs.hudStatSlotPtr0 ?? 0) >>> 0,
    slotPtr1: (runtimeInputs.hudStatSlotPtr1 ?? 0) >>> 0,
    slots,
  };
}

function applyFxLerpGate(state, runtimeInputs) {
  state.fxLerpGate676b4 = (state.fxLerpGate676b4 >>> 0) & 0xff;
  if (state.fxLerpGate676b4 === 0) return;
  const cur = [
    Math.fround(state.fxCur676b8), Math.fround(state.fxCur676bc),
    Math.fround(state.fxCur676c0), Math.fround(state.fxCur676c4),
    Math.fround(state.fxCur676c8), Math.fround(state.fxCur676cc),
  ];
  const goals = [
    runtimeInputs.fxGoal676e8, runtimeInputs.fxGoal676ec, runtimeInputs.fxGoal676f0,
    runtimeInputs.fxGoal676f4, runtimeInputs.fxGoal676f8, runtimeInputs.fxGoal676fc,
  ];
  const steps = [
    runtimeInputs.fxStep676d0, runtimeInputs.fxStep676d4, runtimeInputs.fxStep676d8,
    runtimeInputs.fxStep676dc, runtimeInputs.fxStep676e0, runtimeInputs.fxStep676e4,
  ];
  for (let i = 0; i < 6; i += 1) {
    const c = Math.fround(cur[i]);
    const g = Math.fround(goals[i]);
    const s = Math.fround(steps[i]);
    const sub = Math.fround(c - g);
    const d = f32FromBits(bitsFromF32(sub) & 0x7fffffff);
    let o;
    if (!(s !== s) && !(d !== d) && s >= d) o = g;
    else if (!(g !== g) && !(c !== c) && g > c) o = Math.fround(c + s);
    else o = Math.fround(c - s);
    cur[i] = o;
  }
  state.fxCur676b8 = cur[0]; state.fxCur676bc = cur[1];
  state.fxCur676c0 = cur[2]; state.fxCur676c4 = cur[3];
  state.fxCur676c8 = cur[4]; state.fxCur676cc = cur[5];
  let allMatch = 1;
  for (let i = 0; i < 6; i += 1) {
    if (cur[i] === Math.fround(steps[i])) continue;
    allMatch = 0;
    break;
  }
  if (allMatch === 1) state.fxLerpGate676b4 = 0;
}

function apply857450Body(runtimeInputs, state, events) {
  const fold = rankDisplayBodyFold({
    st: state.gate1d654 >>> 0, sw: runtimeInputs.rankDisplaySwitch >>> 0,
    b119: runtimeInputs.rankDisplayByte119, b22d: runtimeInputs.rankDisplayByte22d,
    d158: runtimeInputs.rankDisplayDword158, b168: runtimeInputs.rankDisplayByte168,
    d248: runtimeInputs.rankDisplayDword248, ptr44: runtimeInputs.rankDisplayPtr44,
    b54: runtimeInputs.rankDisplayByte54, b39c: runtimeInputs.rankDisplayByte39c,
    b39d: runtimeInputs.rankDisplayByte39d, b3b0: runtimeInputs.rankDisplayByte3b0,
    w0: runtimeInputs.rankDisplayDispWord0, w1: runtimeInputs.rankDisplayDispWord1,
    w2: runtimeInputs.rankDisplayDispWord2, w3: runtimeInputs.rankDisplayDispWord3,
    w4: runtimeInputs.rankDisplayDispEos, al: runtimeInputs.rankDisplayIsPlayingAl,
    stUpd: runtimeInputs.rankDisplayStUpd, stAfterLoading: runtimeInputs.rankDisplayStAfterLoading,
    stAfterIdle: runtimeInputs.rankDisplayStAfterIdle, stAfterDisplay: runtimeInputs.rankDisplayStAfterDisplay,
  });
  state.rankDisplaySwitchAfter = fold.swAfter | 0;
  state.rankDisplayStateAfter = fold.stAfter | 0;
  state.rankDisplayClear3b0Out = fold.clear3b | 0;
  state.rankDisplayTailOut = fold.tailCleared | 0;
  events.rankDisplayStateUpd = fold.stateUpd | 0;
  events.rankDisplayPlayMask = fold.playMask | 0;
  events.rankDisplayCalls = ((fold.stateUpd | 0) + (fold.playCount | 0) + (fold.isPlaying | 0)) | 0;
  events.rankDisplayIsPlaying = fold.isPlaying | 0;
}

function doorSlotsFromRuntime(runtimeInputs) {
  if (Array.isArray(runtimeInputs.doorSlots)) {
    return runtimeInputs.doorSlots.map((s) => ({
      present: s?.present | 0, field3a0: s?.field3a0 | 0, field8: s?.field8 | 0, fieldC: s?.fieldC | 0,
    }));
  }
  const out = [];
  for (let i = 0; i < 8; i += 1) {
    out.push({
      present: runtimeInputs[`doorSlot${i}Present`] | 0,
      field3a0: runtimeInputs[`doorSlot${i}Field3a0`] | 0,
      field8: runtimeInputs[`doorSlot${i}Field8`] | 0,
      fieldC: runtimeInputs[`doorSlot${i}FieldC`] | 0,
    });
  }
  return out;
}

/* ABI v95 (record idx 24 opaqueRoomUpdateClearDoorSlots): composed per-slot
   early-out decision over the 8 runtime door slots. bit i set iff slot i is
   PRESENT (FULL-DWORD — PE 0x804262 test ecx,ecx/je, WIDE 0x100 qualifies)
   AND the FUN_00710dd0 early-out prologue FAILS
   (stepDoorHelper710dd0EarlyOut == 0 — the room-family pure no-op gate:
   (f3a0&0x10)&&f8!=8 / (f3a0&0x20)&&f8==4 / fc==2 / f8==7, PE
   0x710ddb..0x710e07). The residual open body (0x710e0d..0x710f4b) runs for
   exactly the failing slots (typed host open); the coarse
   opaqueRoomUpdateClearDoorSlots event fires iff mask != 0. No pre-masking:
   present/fields arrive unmasked (u32 -> the law re-narrows). */
export function doorSlots710dd0FailingMask(inputSlots) {
  if (inputSlots == null) return 0;
  let mask = 0;
  for (let i = 0; i < 8; i += 1) {
    const s = inputSlots[i];
    if (s == null || (s.present | 0) === 0) continue;
    if (stepDoorHelper710dd0EarlyOut(
          (s.field3a0 ?? 0) >>> 0, s.field8 | 0, s.fieldC | 0) === 0) {
      mask |= (1 << i) >>> 0;
    }
  }
  return mask >>> 0;
}

function translatedMenuGateShouldExit(state, runtimeInputs) {
  if ((state.menuState23a74 | 0) === 0) return false;
  const byteLength = runtimeInputs.globalRangeByteLength >>> 0;
  return byteLength === 0 || (byteLength & 0xfffffffc) === 4;
}

function continueAfterMenuUpdate(state, runtimeInputs, events, menuBranchWasEntered) {
  if (menuBranchWasEntered) {
    let erased = -1;
    let payloadFrees = 0;
    if ((runtimeInputs.menuAuxTreeReady | 0) !== 0 && (runtimeInputs.menuAuxSentinelReady | 0) !== 0) {
      /* The erase consumes the flat per-node ABI lanes; the caller's object
         may carry the corpus array form, so normalize first — otherwise the
         walk sees empty lanes, returns null, and this arm wrongly bumps the
         host clear (measured: the menu-update pure arm was unreachable). */
      const result = menuAuxTreeErase(normalizeRuntimeInputsForLayout(runtimeInputs));
      if (result && typeof result.visited === "number") {
        erased = result.visited | 0;
        payloadFrees = (result.payloadFree ?? []).reduce((n, v) => n + ((v | 0) !== 0 ? 1 : 0), 0);
      }
    }
    if (erased < 0) events.menuAuxListClear = (events.menuAuxListClear | 0) + 1;
    else {
      events.menuAuxNodeFree = (events.menuAuxNodeFree | 0) + erased;
      events.menuAuxPayloadFree = (events.menuAuxPayloadFree | 0) + payloadFrees;
    }
    if (translatedMenuGateShouldExit(state, runtimeInputs)) {
      events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_MENU_GATE_EXIT;
      return;
    }
  }
  if ((runtimeInputs.globalRangeByteLength | 0) === 0 && (state.state24ecc | 0) !== 0) {
    /* ABI v59/v89: VA 0x008ef990 State24ecc_Update gates. PE 0x8ef99e cmp
       [edi],1 / jne 0x8efdec; 0x8ef9af cmp byte [Game+0x22ed0],0 / je exit;
       0x8efdec cmp eax,2 / jne exit. v89 re-transcription: state==2 is NOT a
       no-op — mode24ed8 -= 1 (wrap), and when the PRE value is <= 0 the
       state clears (PE test ecx,ecx / jg skip / mov [edi],0). ready=0 keeps
       the pre-v59 always-host behavior (host runs the whole body). */
    const gateReady = runtimeInputs.state24ecc22ed0Ready | 0;
    const gateByte = (runtimeInputs.state24ecc22ed0Flag ?? runtimeInputs.state24ecc22ed0 ?? 0) & 0xff;
    const st24 = state.state24ecc | 0;
    if (gateReady === 0) {
      events.opaqueCall008ef990 = (events.opaqueCall008ef990 | 0) + 1;
    } else if (st24 === 1) {
      if (gateByte !== 0) {
        events.opaqueCall008ef990 = (events.opaqueCall008ef990 | 0) + 1;
        /* ABI v93: iterate-arm JOIN pure-decision proof (PE 0x8efc92..0x8efce9).
           The body stays host; when the host captured the JOIN seam blob the
           model proves the tail is pure: idx8 == probe-0xe -> NO-SFX exit with
           zero calls, OR the RTE 956780 gate closed -> prep no-op and Play
           0x92dc30 is the sole residual host call. ready=0 keeps the pre-v93
           proof-free host edge. */
        emitState24ecc8ef990JoinPure(runtimeInputs, events);
      }
    } else if (st24 === 2) {
      const pre = state.mode24ed8 | 0;
      state.mode24ed8 = (pre - 1) | 0;
      if (pre <= 0) state.state24ecc = 0;
    }
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_STATE_24ECC_UPDATE;
    return;
  }
  state.counter265c0 = wrapIncrementI32(state.counter265c0 | 0);
  /* ABI v92: same blob-gated empty-vector walk arm as the gate-1b83c site —
     a captured count==0 makes the walk loop a pure skip (fatal log stays
     host); ready=0 keeps the pre-v92 always-host walk, no event. */
  emitWalkEmptySkip(runtimeInputs, events);
  events.opaqueCall0098dba0PlayerWalk = (events.opaqueCall0098dba0PlayerWalk | 0) + 1;
  events.frameOpaque98dba0Site = FRAME_OPAQUE_98DBA0_SITE.FRAME_AUX;
  events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK;
}

function continueAfterMenuOpen(state, runtimeInputs, events) {
  if ((state.menuState23a74 | 0) !== 0) {
    if (isaacMenuGateUpdateNeedsHost(state.menuState23a74, state.gate1b83c, state.predicate1ba74) !== 0) {
      events.opaqueCall009b6840 = (events.opaqueCall009b6840 | 0) + 1;
      /* ABI v95 (record idx 2 body): A2 mode-latch store law (PE 0x9b6905..
         0x9b6918) executes on EVERY non-early-out body path after 0x425130
         (which does not touch Game+0x22ed4/0x22edc — verified). Mirror the
         store in-module so the residual host store is idempotent. */
      if (gameUpdateSlice9b6840ModeLatchNeeded(state.status22ed4 | 0) !== 0) {
        state.status22ed4 = 1;
        state.status22edc = 2;
      }
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE;
    return;
  }
  continueAfterMenuUpdate(state, runtimeInputs, events, false);
}

/** ABI v139 (contracts-b1-rain NOTES 2.4/2.5): shared-half voucher law.
 *  All-or-nothing: dense iter_index, UNSIGNED min(quality, decor_count)
 *  count closure, seed-chain closure row0.seed_in == seed0_echo and
 *  seed_out(k) == seed_in(k+1). Over-cap or any break poisons the whole
 *  voucher -> both records' pins fire byte-for-byte. */
function b1RainVoucherLive(runtimeInputs) {
  const rt = runtimeInputs ?? {};
  if ((rt.b1RainRowsReady | 0) === 0) return false;
  const n = rt.b1RainSpawnCount | 0;
  if (n < 0 || n > 64) return false; /* over-cap poisons; never truncate */
  /* count == UNSIGNED min(quality_echo, decor_count_echo) (cmovb @0x802bdc) */
  const q = rt.b1RainQualityEcho >>> 0;
  const d = rt.b1RainDecorCountEcho >>> 0;
  const cmin = q <= d ? q : d;
  if ((n >>> 0) !== cmin) return false;
  if ((rt.b1RainRow0ShuffleSeedIn >>> 0) !== (rt.b1RainSeed0Echo >>> 0)) {
    return false;
  }
  for (let k = 0; k + 1 < n; k += 1) {
    if ((rt[`b1RainRow${k}ShuffleSeedOut`] >>> 0) !==
        (rt[`b1RainRow${k + 1}ShuffleSeedIn`] >>> 0)) {
      return false; /* chain-break poisons the voucher */
    }
  }
  for (let k = 0; k < n; k += 1) {
    if ((rt[`b1RainRow${k}IterIndex`] >>> 0) !== (k >>> 0)) {
      return false; /* PE-order density law */
    }
  }
  return true;
}

/** ABI v139: publish the six scalar echoes once per tick (exactly-once
 *  invariant: mirrors observe, never re-drive). */
function b1RainPublishEchoes(events, runtimeInputs) {
  const rt = runtimeInputs ?? {};
  let searchOkCount = 0;
  let drawsTotal = 0;
  let stores7764 = 0;
  let reposCount = 0;
  const n = rt.b1RainSpawnCount | 0;
  for (let k = 0; k < n; k += 1) {
    searchOkCount += ((rt[`b1RainRow${k}SearchOk`] | 0) !== 0) ? 1 : 0;
    drawsTotal += ((rt[`b1RainRow${k}SearchDraws`] | 0) +
      (rt[`b1RainRow${k}BindReposDraws`] | 0)) >>> 0;
    stores7764 += ((rt[`b1RainRow${k}BindStore7764`] | 0) !== 0) ? 1 : 0;
    reposCount += ((rt[`b1RainRow${k}BindRepositioned`] | 0) !== 0) ? 1 : 0;
  }
  events.b1RainRowsApplied = 1;
  events.b1RainSpawnCountEcho = n >>> 0;
  events.b1RainSearchOkCount = searchOkCount >>> 0;
  events.b1RainGenrandDrawsTotal = drawsTotal >>> 0;
  events.b1RainBind7764Stores = stores7764 >>> 0;
  events.b1RainBindRepositioned = reposCount >>> 0;
}
function continueToFrameManagerUpdates(state, runtimeInputs, events) {
  state.frameCounter264fc = wrapIncrementI32(state.frameCounter264fc | 0);
  state.frameCounter264f8 = wrapIncrementI32(state.frameCounter264f8 | 0);
  if (((state.frameCounter264f8 | 0) % 30) === 0 && (state.status22ed4 | 0) !== 2) {
    state.status22ed4 = 1;
    state.status22edc = 2;
  }
  let byte7220 = (state.roomByte7220 | 0) & 0xff;
  const cleared = roomEntryClear7220(byte7220);
  state.roomByte7220 = typeof cleared === "number" ? cleared : 0;
  const rt = runtimeInputs ?? {};
  const b1 = roomB1WireDecide({
    outerReady: 1,
    sfxReady: (rt.b1SfxReady | 0) !== 0 ? 1 : 0,
    bufferReady: (rt.b1BufferReady | 0) !== 0 ? 1 : 0,
    roomActiveByte0: rt.ambientRoomActive ?? 1,
    frame264f8: state.frameCounter264f8 | 0,
    roomEntry11f0: rt.ambientRoomEntry11f0 | 0,
    roomType8: state.roomType8 | 0,
    descField40: rt.b1DescField40 | 0,
    difficulty269c8: state.difficulty269c8 | 0,
    stage0: rt.ambientStage ?? 1,
    nestedField10: rt.b1NestedField10 | 0,
    flags60e7: state.gameFlags1839c >>> 0,
    bossId1bb0: rt.ambientRoomSubtype1bb0 | 0,
    begin183a4: rt.b1Begin183a4 >>> 0,
    end183a8: rt.b1End183a8 >>> 0,
  });
  if ((b1.pureOnceFlagApply | 0) !== 0) {
    const orr = roomB1FlagOr80000(state.gameFlags1839c >>> 0);
    state.gameFlags1839c = typeof orr === "number" ? orr : (state.gameFlags1839c >>> 0) | 0x80000;
  }
  /* ABI v139: shared-half typed contract -- under a LIVE b1_rain voucher
     the spawn-half residual is carried by the rows + echoes exactly once
     per tick (mirrors observe, never re-drive); capture absence keeps
     today's byte-for-byte monolith. SFX fragments stay standing. */
  const b1RainLive = b1RainVoucherLive(runtimeInputs);
  const b1SpawnResidual = (b1.residualKind | 0) === ROOM_B1_RESIDUAL_SPAWN ||
    (b1.residualKind | 0) === ROOM_B1_RESIDUAL_SFX_SPAWN;
  if (b1SpawnResidual && b1RainLive) {
    b1RainPublishEchoes(events, runtimeInputs);
  }
  if ((b1.pureComplete | 0) !== 0) {
    /* NONE */
  } else if ((b1.residualKind | 0) === ROOM_B1_RESIDUAL_SFX) {
    events.opaqueRoomUpdatePrefixB1Sfx = (events.opaqueRoomUpdatePrefixB1Sfx | 0) + 1;
  } else if ((b1.residualKind | 0) === ROOM_B1_RESIDUAL_SPAWN) {
    if (!b1RainLive) {
      events.opaqueRoomUpdatePrefixB1Spawn = (events.opaqueRoomUpdatePrefixB1Spawn | 0) + 1;
    }
  } else if ((b1.residualKind | 0) === ROOM_B1_RESIDUAL_SFX_SPAWN) {
    events.opaqueRoomUpdatePrefixB1Sfx = (events.opaqueRoomUpdatePrefixB1Sfx | 0) + 1;
    if (!b1RainLive) {
      events.opaqueRoomUpdatePrefixB1Spawn = (events.opaqueRoomUpdatePrefixB1Spawn | 0) + 1;
    }
  } else {
    events.opaqueRoomUpdatePrefixB1 = (events.opaqueRoomUpdatePrefixB1 | 0) + 1;
  }
  events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1;
}

function applyFrameEffect6fd7c0PureAfterHost(state, runtimeInputs, siteAnim) {
  if (frameEffect6fd7c0Mode4SfxEarly(state.timedTransitionCleanupMode | 0) !== 0) return;
  /* ABI v104 (record idx 12 transition-pack wiring): with the pack LIVE the
     terminal pred becomes lane-decidable. The machine ran the engine (the F
     arm), then 0x6f0070 (0x6fdba6) decides the 0x265c0 clear (0x6fdbb1)
     from its captured AL; the 0x67744 byte store stays unconditional
     (family law). The pack-live flow also re-checks the SITE args: an
     invalid entry fataled in the body (ret 0x14 before the engine) so the
     start-state + terminals must NOT run. ready=0 keeps the pre-v104 dual
     approximation byte-for-byte. */
  const rt = runtimeInputs ?? {};
  const packLive = ((rt.opaqueCall006fd7c0Ready | 0) !== 0) && ((rt.transition6fd7c0Ready | 0) !== 0);
  if (packLive) {
    const siteRoom = (siteAnim | 0) === 20 ? state.roomTransitionIndex18900 | 0 : 0;
    const siteDim = (siteAnim | 0) === 20
      ? signExtendLowByte(state.roomTransitionDimension18904 | 0)
      : -1;
    if (gameUpdateSlice6fd7c0ArgsValid(siteRoom, siteAnim | 0, siteDim) === 0) {
      return; /* PE fatal: no engine start-state, no P4 terminals */
    }
  }
  if (roomTransitionEngine82ee40EarlySkipSetup(state.gate1ba78 | 0, siteAnim | 0) === 0) {
    state.predicate1ba74 = 0;
    let start = null;
    try { start = roomTransitionEngine82ee40ApplyStartState(siteAnim | 0, -1); } catch (_) { start = null; }
    if (start && typeof start === "object") {
      if ("field0" in start) state.gate1b83c = start.field0 | 0;
      if ("field8" in start) state.engineField8 = start.field8 | 0;
      if ("fieldC" in start) state.engineFieldC = start.fieldC | 0;
      if ("field22c" in start) state.engineFloat22c = start.field22c;
      if ("field230" in start) state.engineFloat230 = start.field230;
    }
  }
  const dual = packLive
    ? gameUpdateSlice6fd7c0Terminal265c0Clear(rt.transition6fd7c0EnginePredProbe | 0)
    : ((state.gate1b83c | 0) !== 0 && (state.predicate1ba74 | 0) !== 0) ? 1 : 0;
  const term = frameEffect6fd7c0ApplyTerminals({
    counter265c0: state.counter265c0 | 0, dualGateNonzero: dual, byte67744: (state.byte67744 | 0) & 0xff,
  });
  if (term && typeof term === "object") {
    if ("counter265c0" in term) state.counter265c0 = term.counter265c0 | 0;
    if ("byte67744" in term) state.byte67744 = term.byte67744 & 0xff;
  }
}

function applyFrameOpaque4212c0Pure(state, runtimeInputs, events) {
  let mode = state.frameOpaque4212c0Mode | 0;
  let secondary = state.frameOpaque4212c0Secondary | 0;
  const field3c = state.frameOpaque4212c0Field3c | 0;
  const flag4c = state.frameOpaque4212c0Flag4c >>> 0;
  const slotChar = runtimeInputs.frameOpaque4212c0SlotChar >>> 0;
  const flag111 = state.frameOpaque4212c0Flag111 >>> 0;
  /* ABI v90: PE 0x00421300..0x00421316 flag_111 low byte gates the
     sequential 409030 pair on A=+0x38 (field4=[+0x3c], flag14=[+0x4c])
     and B=+0x58 (field4=[+0x5c], flag14=[+0x6c]). Each 409030 is a pure
     no-op when field4==0 or flag14 low byte==0; both no-op folds flag_111
     to 0 so the secondary==3 arm (which follows the pair at 0x0042131b)
     still applies its pure clear. One live 409030 keeps the host. */
  let flag111Eff = 0;
  let pairNeeds = false;
  if ((flag111 & 0xff) !== 0) {
    const pairReady = runtimeInputs.frameOpaque4212c0PairReady >>> 0;
    pairNeeds = pairReady !== 0 && frameOpaque409030PairNeedsHost(
      field3c, flag4c,
      runtimeInputs.frameOpaque4212c0Field5c >>> 0,
      runtimeInputs.frameOpaque4212c0Flag6c >>> 0,
    );
    /* ready==0 keeps the pre-v90 always-host residual (B-sub fields
       unverified). A live 409030 keeps host; both no-op folds flag_111
       so the secondary==3 arm still applies. flag4c/flag6c pass UNMASKED:
       the family 409030 gate is the single source of the low-byte law
       (0x100 must gate as byte 0 on both sides). */
    if (pairReady === 0 || pairNeeds === true) flag111Eff = flag111;
  }
  /* ABI v95 (R1, record idx 10): when the A/B 409030 pair is LIVE
     (pairNeeds) AND the capture pack is present (abPackReady), the pair
     is decided PURELY in-module — the ANM2 state-update plan BY REFERENCE
     (frame-opaque 409030 laws) over the sampled subobject fields — and
     0x408d00 AdvancePosition / 0x40a1b0 Rewind fire as TYPED host events
     (they mutate heap AnimationData outside the Game capture). flag_111
     folds so the PE fall-through (0x42131b secondary==3 arm) still runs
     after the pair. packReady==0 keeps the pre-v95 always-host for a live
     pair. The pair events are published ONLY when the whole record
     resolves pure (host==0 at the commit below). */
  let pairPlanPure = 0;
  let pairAdvance = 0;
  let pairRewind = 0;
  let aNoLoopClear = 0;
  const pairPlan = { entries: [], live: 0, advance: 0, rewind: 0, pure: 0 };
  if (
    (flag111 & 0xff) !== 0 &&
    (runtimeInputs.frameOpaque4212c0AbPackReady >>> 0) !== 0 &&
    pairNeeds === true
  ) {
    flag111Eff = 0;
    pairPlanPure = 1;
    for (let side = 0; side < 2; side += 1) {
      const isA = side === 0;
      const field4 = isA ? (field3c >>> 0) : (runtimeInputs.frameOpaque4212c0Field5c >>> 0);
      const flag14 = isA ? flag4c : (runtimeInputs.frameOpaque4212c0Flag6c >>> 0);
      const ent = {
        receiverOff: isA ? 0x38 : 0x58,
        path: -1, advanceTarget: 0, float10Out: 0, clearFlag14: 0,
      };
      if (frameOpaque409030NeedsHost(field4, flag14) === true) {
        const float10 = f32FromBits(
          isA ? runtimeInputs.frameOpaque4212c0AFloat10 >>> 0
              : runtimeInputs.frameOpaque4212c0BFloat10 >>> 0);
        const layer104 = f32FromBits(
          isA ? runtimeInputs.frameOpaque4212c0ALayer104 >>> 0
              : runtimeInputs.frameOpaque4212c0BLayer104 >>> 0);
        const frameBound = isA
          ? (runtimeInputs.frameOpaque4212c0AFrameBound | 0)
          : (runtimeInputs.frameOpaque4212c0BFrameBound | 0);
        const loopFlag = isA
          ? (runtimeInputs.frameOpaque4212c0ALoopFlag | 0)
          : (runtimeInputs.frameOpaque4212c0BLoopFlag | 0);
        const po = frameOpaque409030ResidualPlan(float10, layer104, frameBound, loopFlag);
        ent.path = po.path;
        ent.advanceTarget = po.advanceFrame | 0;
        ent.float10Out = po.storeFloat10 ? bitsFromF32(po.sum) : 0;
        ent.clearFlag14 = po.clearFlag14 ? 1 : 0;
        pairPlan.live += 1;
        if (po.hostAdvance) pairAdvance += 1;
        if (po.hostRewind) pairRewind += 1;
        if (isA && po.clearFlag14) aNoLoopClear = 1;
      }
      pairPlan.entries.push(ent);
    }
    pairPlan.advance = pairAdvance;
    pairPlan.rewind = pairRewind;
    pairPlan.pure = 1;
  }
  let host = 0;
  if (mode === 0) host = 0;
  else if ((flag111Eff & 0xff) !== 0) host = 1;
  else if (secondary === 3 && field3c !== 0) {
    /* ABI v91: PE 0x42132f..0x42133b `push 0xb1c00c; mov ecx,edi(A);
       call 0x40add0; test al,al; je 0x4213de`. The probe walks the
       animation-name list at [[A]+0x8c]/+0x90 comparing against the
       literal 0xb1c00c and returns a bit test of [A+0x18]. Pure-false
       when the list is EMPTY (frameOpaque40add0NeedsHost(field4,0)==0
       -> al=0) or the host-resolved matchIndex/bitfield18 show the bit
       clear (frameOpaque40add0BitResult). False -> 0x4213de..0x4213ea
       is a pure clear (field3c==0 -> clear both [unreachable here];
       flag4c low==0 -> clear both; else ret) with NO calls — apply
       frameOpaque4212c0Secondary3AfterProbeFalse. True -> 0x421343
       true-probe interior (manager stores + 92e430 + 6fd7c0 + 8318a0)
       stays host. probeReady=0 keeps the pre-v91 always-host.
       ABI v94 (R3 log-split): the 0x40add0 fatal log 'AnimationData is
       NULL\n' (PE 0x40adde..0x40adee push 0xb1a504/0x10, call 0xa112c0,
       add esp,8) on the field_4==0 gate (0x40addc cmp/0x40ade0 jne)
       becomes a TYPED HOST EVENT. The log is NEVER a return: the probe
       flow (miss 0x40adfb/0x40adfd, bit 0x40ae4e..0x40ae6a, false-arm
       clear 0x4213de..0x4213ea) runs on BOTH field_4 arms. The miss law
       (gameUpdateSlice4212c0Add0ProbePureFalse on listCount) applies
       UNCONDITIONALLY and the bit law applies when probeResolved with a
       non-negative matchIndex — the old field_4!=0 gates are dropped
       (the machine re-tests nothing after the log). When the log fires
       the host edge STAYS (platform logger) and the typed event
       frameOpaque4212c0Add0LogNeeded pins the log as the sole host
       content — post-log flow proven pure (record-5 precedent). */
    const probeReady = runtimeInputs.frameOpaque4212c0ProbeReady >>> 0;
    const field4 = runtimeInputs.frameOpaque4212c0Add0Field4 >>> 0;
    const listCount = runtimeInputs.frameOpaque4212c0Add0ListCount >>> 0;
    const matchIndex = runtimeInputs.frameOpaque4212c0Add0MatchIndex | 0;
    const bitfield18 = runtimeInputs.frameOpaque4212c0Add0Bitfield18 >>> 0;
    let probeFalse = 0;
    if (probeReady !== 0) {
      const logNeeded = gameUpdateSlice4212c0Add0LogNeeded(field4);
      if (logNeeded !== 0) {
        events.frameOpaque4212c0Add0LogNeeded = (events.frameOpaque4212c0Add0LogNeeded | 0) + 1;
      }
      if (gameUpdateSlice4212c0Add0ProbePureFalse(listCount) !== 0) {
        probeFalse = 1; /* post-log pure miss: count==0 -> al=0, any field4 */
      } else if (
        (runtimeInputs.frameOpaque4212c0Add0EqualFlagsReady >>> 0) !== 0 &&
        listCount <= FRAME_OPAQUE_40ADD0_MAX_ENTRIES
      ) {
        /* ABI v95 (R4 equal-flag capture): the NON-EMPTY animation-name
           walk (PE 0x40ae05..0x40ae41, 0 E8 / 0 stores) runs ENTIRELY
           in-module via the frozen frame-opaque 40add0 laws — first match
           index over the per-entry equal-flag bytes, then the bit test
           (probeFromEqualFlags). The probe result (al) is fully
           in-module; matchIndex/probeResolved are IGNORED on this arm.
           count over the cap or ready==0 keeps the exact v91/v94
           matchIndex path below (the host must not set ready for a list
           it cannot capture). */
        probeFalse = frameOpaque40add0ProbeFromEqualFlags(
          runtimeInputs.frameOpaque4212c0Add0EqualFlags,
          listCount,
          bitfield18,
        ) === false ? 1 : 0;
      } else if (
        runtimeInputs.frameOpaque4212c0ProbeResolved >>> 0 !== 0 &&
        matchIndex >= 0
      ) {
        probeFalse = frameOpaque40add0BitResult(bitfield18, matchIndex) === false ? 1 : 0;
      }
      if (probeFalse !== 0 && logNeeded === 0) {
        const after = frameOpaque4212c0Secondary3AfterProbeFalse({
          mode, secondary, field3c, flag4c,
        });
        mode = after.mode | 0;
        secondary = after.secondary | 0;
        host = 0;
      } else {
        /* ABI v96 (record idx 10 R2, v98 interior LIVE seam; layouts
           frozen 956/14276): the true-probe interior PREFIX (PE
           0x421343..0x4213cd) becomes an in-module DECISION when the
           ABI-96 SFX-manager blob is captured (TrueProbeReady != 0) AND
           the probe is PROVABLY TRUE (reached — the same equal-flags /
           matchIndex bit arms the probeFalse split uses) AND no fatal
           log is pending. The composed prefix plan (store mask 0x1ff,
           volume gate host92e430Needed, the se+0x14 store, the five
           6fd7c0 args, call8318a0Drop from the LIVE record-4 gate lanes
           opaque008318a0Ready/_mode) is computed, the typed event
           frameOpaque4212c0TrueProbeInterior +1s, and the opaque record
           edge is DROPPED — the bridge applies the typed bodies (9
           manager stores + 0x92e430 + 0x6fd7c0 + 0x8318a0 iff
           call8318a0Drop == 0) from the plan. The prefix has ZERO Game
           stores, so mode/secondary commit unchanged. Blob absent / log
           / walk-live undecided keep the pre-v96 monolithic host edge
           byte-for-byte (@936 stays 0). probeReady==0 is capture-absence
           (the PE probe always runs) — the v91 host edge stays. */
        const interior = frameOpaque4212c0TrueProbeInteriorPlan(state, runtimeInputs);
        if (interior !== null) {
          events.frameOpaque4212c0TrueProbeInterior =
            (events.frameOpaque4212c0TrueProbeInterior | 0) + 1;
          host = 0; /* the typed event replaces the opaque edge */
        } else {
          host = 1; /* log (platform primitive) or walk-live/true-probe */
        }
      }
    } else {
      host = 1;
    }
  } else {
    /* PE 0x4212d4..0x4212fa: mode==1 clear (byte tests). */
    if (mode === 1) {
      if (field3c === 0 || (flag4c & 0xff) === 0) {
        if ((slotChar & 0xff) === 0) mode = 0;
      }
    }
    /* PE 0x42131b..0x4213ea: secondary==3 with field3c==0 clears both. */
    if (secondary === 3) { mode = 0; secondary = 0; }
  }
  if (host !== 0) events.opaqueCall004212c0 = (events.opaqueCall004212c0 | 0) + 1;
  else {
    if (pairPlanPure !== 0) {
      events.frameOpaque4212c0409030Advance =
        (events.frameOpaque4212c0409030Advance | 0) + pairAdvance;
      events.frameOpaque4212c0409030Rewind =
        (events.frameOpaque4212c0409030Rewind | 0) + pairRewind;
      if (aNoLoopClear !== 0) {
        state.frameOpaque4212c0Flag4c =
          frameOpaque409030ApplyNoLoopClear(flag4c) >>> 0;
      }
    }
    state.frameOpaque4212c0Mode = mode;
    state.frameOpaque4212c0Secondary = secondary;
  }
}

/* ABI v95 (record idx 10 R1): standalone oracle for the A/B 409030-pair
   ANM2 state-update plan (mirror of the wasm scratch fill in
   apply_frame_opaque_4212c0_pure). Returns the plan object directly:
   entries[2] {receiverOff, path, advanceTarget, float10Out, clearFlag14},
   live (entered subobjects), advance/rewind (typed event counts), pure.
   path: ISAAC_FRAME_OPAQUE_409030_PATH_ADVANCE_MID/REWIND/NO_LOOP, -1 for a
   store-free no-op subobject. abPackReady==0 -> null (pre-v95 always-host). */
export function frameOpaque4212c0Anm2PairPlan(state, runtimeInputs) {
  const flag111 = (state.frameOpaque4212c0Flag111 >>> 0) & 0xff;
  if (flag111 === 0) return null;
  if ((runtimeInputs.frameOpaque4212c0AbPackReady >>> 0) === 0) return null;
  const field3c = state.frameOpaque4212c0Field3c | 0;
  const flag4c = state.frameOpaque4212c0Flag4c >>> 0;
  const pairNeeds = frameOpaque409030PairNeedsHost(
    field3c, flag4c,
    runtimeInputs.frameOpaque4212c0Field5c >>> 0,
    runtimeInputs.frameOpaque4212c0Flag6c >>> 0,
  );
  if (pairNeeds !== true) return null;
  const plan = { entries: [], live: 0, advance: 0, rewind: 0, pure: 1 };
  for (let side = 0; side < 2; side += 1) {
    const isA = side === 0;
    const field4 = isA ? (field3c >>> 0) : (runtimeInputs.frameOpaque4212c0Field5c >>> 0);
    const flag14 = isA ? flag4c : (runtimeInputs.frameOpaque4212c0Flag6c >>> 0);
    const ent = {
      receiverOff: isA ? 0x38 : 0x58,
      path: -1, advanceTarget: 0, float10Out: 0, clearFlag14: 0,
    };
    if (frameOpaque409030NeedsHost(field4, flag14) === true) {
      const float10 = f32FromBits(
        isA ? runtimeInputs.frameOpaque4212c0AFloat10 >>> 0
            : runtimeInputs.frameOpaque4212c0BFloat10 >>> 0);
      const layer104 = f32FromBits(
        isA ? runtimeInputs.frameOpaque4212c0ALayer104 >>> 0
            : runtimeInputs.frameOpaque4212c0BLayer104 >>> 0);
      const frameBound = isA
        ? (runtimeInputs.frameOpaque4212c0AFrameBound | 0)
        : (runtimeInputs.frameOpaque4212c0BFrameBound | 0);
      const loopFlag = isA
        ? (runtimeInputs.frameOpaque4212c0ALoopFlag | 0)
        : (runtimeInputs.frameOpaque4212c0BLoopFlag | 0);
      const po = frameOpaque409030ResidualPlan(float10, layer104, frameBound, loopFlag);
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
  return plan;
}

function hudMessageTextOutNeed(flag8, ptr54, played64, words0, words1) {
  if (((flag8 >>> 0) & 0xff) === 0) return 0;
  if ((ptr54 >>> 0) === 0) return 1;
  if (((played64 >>> 0) & 0xff) === 0) return 1;
  const words = (BigInt(words0 >>> 0) | (BigInt(words1 >>> 0) << 32n));
  return words === 0x0074754f78746554n ? 0 : 1;
}
function f32c(bits) { return f32FromBits(bits >>> 0); }
function modeFloatStep98dba0(pure, bVar2, manager2a35c) {
  const step01 = f32c(0x3dcccccd), step02 = f32c(0x3e4ccccd), thr09 = f32c(0x3f666666), one = f32c(0x3f800000);
  const bv = (bVar2 | 0) !== 0 ? 1 : 0;
  const mode = pure.mode | 0;
  if (mode === 0) {
    let f170 = Math.fround(pure.float170);
    pure.float170 = f170 < thr09 ? Math.fround(f170 + step01) : one;
    let f2d0 = Math.fround(pure.float2d0);
    pure.float2d0 = f2d0 <= step02 ? 0 : Math.fround(f2d0 - step02);
    if (bv !== 0) { pure.mode = 1; return 0; }
    pure.counter = 0; return 1;
  }
  if (mode === 1) {
    if ((pure.flag | 0) === 0) {
      let f170 = Math.fround(pure.float170);
      pure.float170 = f170 <= step02 ? 0 : Math.fround(f170 - step02);
      if ((pure.counter >>> 0) < 9) {
        if (bv !== 0) { pure.float2d0 = Math.fround(Math.fround(pure.float2d0) + step01); return 0; }
        pure.mode = 2; pure.flag = 1; pure.counter = 0; return 1;
      }
      pure.float2d0 = one;
      if (bv !== 0) return 0;
      pure.mode = 0; pure.counter = 0; return 1;
    }
    pure.float170 = 0;
    if ((pure.counter >>> 0) < 9) {
      if (bv !== 0) { pure.float2d0 = Math.fround(Math.fround(pure.float2d0) + step01); return 0; }
      pure.mode = 0; pure.flag = 0; pure.counter = 0; return 1;
    }
    pure.float2d0 = one;
    if (bv !== 0) return 0;
    pure.mode = 2; pure.counter = 0; return 1;
  }
  if (mode === 2) {
    pure.counter = 0;
    let f170 = Math.fround(pure.float170);
    pure.float170 = f170 <= step02 ? 0 : Math.fround(f170 - step02);
    let f2d0 = Math.fround(pure.float2d0);
    const target = Math.fround(manager2a35c);
    if (f2d0 <= Math.fround(target + step01)) {
      f2d0 = Math.fround(target - step01) <= f2d0 ? target : Math.fround(f2d0 + step01);
    } else f2d0 = Math.fround(f2d0 - step01);
    pure.float2d0 = f2d0;
    if (bv !== 0) { pure.mode = 1; return 0; }
    pure.counter = 0; return 1;
  }
  if (bv !== 0) return 0;
  pure.counter = 0; return 1;
}
function clampFloats98dba0(f170, f2d0) {
  const one = f32c(0x3f800000);
  const clamp = (f) => { let x = Math.fround(f); if (x <= 0) x = 0; if (one <= x) x = one; return x; };
  return { f170: clamp(f170), f2d0: clamp(f2d0) };
}

function apply98dba0AfterPlayerWalk(state, runtimeInputs, events) {
  const bvar2 = runtimeInputs.frameOpaque98dba0Bvar2 | 0;
  let counter = state.frameOpaque98dba0Counter | 0;
  if (bvar2 !== 0) {
    counter = wrapIncrementI32(counter);
    if (counter === 10) {
      events.opaqueCall00746560 = (events.opaqueCall00746560 | 0) + 1;
      recordHostFun746560(state, events, HOST_FUN_746560_SITE.WALK_COUNTER, 1,
        state.timedTransitionCleanupMode | 0, runtimeInputs.hostFun746560PostReady >>> 0);
    }
  }
  state.frameOpaque98dba0Counter = counter;
  const live = frameOpaque98dba0TimerBlockLive(runtimeInputs.frameOpaque98dba0Timer264e8);
  if ((runtimeInputs.frameOpaque98dba0TimerReady | 0) === 0) {
    events.opaqueCall0098dba0Timer = (events.opaqueCall0098dba0Timer | 0) + 1;
  } else if (live) {
    if ((runtimeInputs.frameOpaque98dba0TimerPureReady | 0) === 0) {
      events.opaqueCall0098dba0Timer = (events.opaqueCall0098dba0Timer | 0) + 1;
    } else {
      let sample = runtimeInputs.frameOpaque98dba0TimerSample >>> 0;
      const useCrt = runtimeInputs.frameOpaque98dba0TimerUseCrtRand >>> 0;
      if ((runtimeInputs.frameOpaque98dba0TimerMtReady | 0) !== 0 && (useCrt & 0xff) === 0) {
        try {
          const src = runtimeInputs.genrandState;
          const copy = src && typeof src.length === "number" ? Uint32Array.from(src) : new Uint32Array(624);
          const step = roomGenrandNext(copy, runtimeInputs.frameOpaque98dba0TimerMtiIn);
          if (step && typeof step === "object") {
            sample = step.value >>> 0;
            events.frameOpaque98dba0TimerMtIndexOut = step.indexOut | 0;
            events.frameOpaque98dba0TimerMtAdvanced = 1;
          }
        } catch (_) { /* keep sample */ }
      }
      const after = (runtimeInputs.frameOpaque98dba0Timer264e8 | 0) - 1;
      const mag = frameOpaque98dba0TimerMagBits(after) >>> 0;
      const cos = frameOpaque98dba0TimerTrigNarrowBits(
        runtimeInputs.frameOpaque98dba0TimerCosBitsLo >>> 0,
        runtimeInputs.frameOpaque98dba0TimerCosBitsHi >>> 0,
      ) >>> 0;
      const sin = frameOpaque98dba0TimerTrigNarrowBits(
        runtimeInputs.frameOpaque98dba0TimerSinBitsLo >>> 0,
        runtimeInputs.frameOpaque98dba0TimerSinBitsHi >>> 0,
      ) >>> 0;
      events.frameOpaque98dba0TimerPlanApplied = 1;
      events.frameOpaque98dba0TimerMtAdvanced = (useCrt & 0xff) === 0 ? 1 : 0;
      events.frameOpaque98dba0TimerAfter = after | 0;
      events.frameOpaque98dba0TimerThetaBits = frameOpaque98dba0TimerThetaBits(sample) >>> 0;
      events.frameOpaque98dba0TimerXBits = frameOpaque98dba0TimerAxisBits(
        cos, mag, runtimeInputs.frameOpaque98dba0TimerX264ecBits >>> 0,
      ) >>> 0;
      events.frameOpaque98dba0TimerYBits = frameOpaque98dba0TimerAxisBits(
        sin, mag, runtimeInputs.frameOpaque98dba0TimerY264f0Bits >>> 0,
      ) >>> 0;
    }
  }
  const pure = {
    mode: state.frameOpaque98dba0Mode | 0,
    flag: (state.frameOpaque98dba0Flag | 0) & 0xff,
    counter: state.frameOpaque98dba0Counter | 0,
    float170: state.frameOpaque98dba0Float170,
    float2d0: state.frameOpaque98dba0Float2d0,
  };
  const fallthrough = modeFloatStep98dba0(pure, bvar2, runtimeInputs.frameOpaque98dba0Manager2a35c);
  state.frameOpaque98dba0Mode = pure.mode | 0;
  state.frameOpaque98dba0Flag = pure.flag & 0xff;
  state.frameOpaque98dba0Counter = pure.counter | 0;
  state.frameOpaque98dba0Float170 = pure.float170;
  state.frameOpaque98dba0Float2d0 = pure.float2d0;
  if (fallthrough !== 0 && ((runtimeInputs.frameOpaque98dba0Game216e9 >>> 0) & 0xff) === 0) {
    if (hudMessageTextOutNeed(state.hudMessageFlag8, runtimeInputs.hudMessageTextPtr54,
      state.hudMessagePlayed64, runtimeInputs.hudMessageTextWords0, runtimeInputs.hudMessageTextWords1) !== 0) {
      events.hudMessageTextOut = (events.hudMessageTextOut | 0) + 1;
      state.hudMessagePlayed64 = 1;
    }
  }
  const clamped = clampFloats98dba0(state.frameOpaque98dba0Float170, state.frameOpaque98dba0Float2d0);
  state.frameOpaque98dba0Float170 = clamped.f170;
  state.frameOpaque98dba0Float2d0 = clamped.f2d0;
}

function applyEngineSetupPure(state, runtimeInputs, siteAnim) {
  const room = runtimeInputs.engineCallRoom | 0;
  const dim = runtimeInputs.engineCallDim | 0;
  try {
    const slot = roomTransitionEngine82ee40RewriteSlot(room, -1, dim, runtimeInputs.engineGame18304 | 0, state.roomTransitionMode1830c | 0);
    const effectiveDim = roomTransitionEngine82ee40EffectiveDim(dim, state.roomTransitionMode1830c | 0);
    const setup = roomTransitionEngine82ee40ApplySetup({ room, slot, siteAnim: siteAnim | 0, anim: siteAnim | 0, effectiveDim }) || {};
    if (typeof setup === "object") {
      if ("field4" in setup) state.engineField4 = setup.field4 | 0;
      if ("field10" in setup) state.engineField10 = setup.field10 | 0;
      if ("field14" in setup) state.engineField14 = setup.field14 | 0;
      if ("field18" in setup) state.engineField18 = setup.field18 | 0;
      if ("field1c" in setup) state.engineField1c = setup.field1c | 0;
      if ("field20" in setup) state.engineField20 = setup.field20 | 0;
      if ("field24" in setup) state.engineField24 = setup.field24 | 0;
      if ("field238" in setup) state.predicate1ba74 = setup.field238 | 0;
    }
  } catch (_) { /* family shape may differ */ }
  state.enginePlayer1bb74 = 0;
}

function continueAfterFrameManagerUpdates(state, constants, runtimeInputs, events) {
  if ((state.fadeCounter26514 | 0) < 1) {
    let next = Math.fround(Math.fround(state.fadeProgress26518) - Math.fround(constants.fadeOutStep));
    if (next < 0) next = 0;
    state.fadeProgress26518 = next;
  } else {
    let next = Math.fround(Math.fround(state.fadeProgress26518) + Math.fround(constants.fadeInStep));
    if (Math.fround(constants.fadeComplete) < next) next = Math.fround(constants.fadeComplete);
    state.fadeProgress26518 = next;
    state.fadeCounter26514 = (state.fadeCounter26514 | 0) - 1;
  }
  const current = Math.fround(state.shakeCurrent67738);
  let target = Math.fround(state.shakeTarget6773c);
  if (current !== target) {
    const step = Math.fround(state.shakeStep67740);
    const absd = f32FromBits(bitsFromF32(Math.fround(current - target)) & 0x7fffffff);
    if (step < absd) target = target <= current ? Math.fround(current - step) : Math.fround(step + current);
    state.shakeCurrent67738 = target;
  }
  if ((state.timer269e0 | 0) > 0) state.timer269e0 = (state.timer269e0 | 0) - 1;
  maybeEmitHudPostUpdate(state, runtimeInputs, events);
  if ((state.listCount67730 | 0) !== 0) {
    const count = state.listCount67730 | 0;
    if ((runtimeInputs.updateListBlobReady | 0) !== 0 && count > 0 && count <= UPDATE_LIST_MAX_NODES) {
      const swept = updateListSweep(updateListTimersFromRuntime(runtimeInputs, count));
      const evicted = swept.evicted | 0;
      state.listCount67730 = count - evicted;
      if (evicted > 0) {
        events.listUpdate6772c = (events.listUpdate6772c | 0) + 1;
        events.listUpdate6772cFree = (events.listUpdate6772cFree | 0) + evicted;
      }
    } else events.listUpdate6772c = (events.listUpdate6772c | 0) + 1;
  }
  const luaReady = runtimeInputs.luaFrameUnrefReady | 0;
  const luaSet = (luaReady !== 0 && ((runtimeInputs.luaFrameUnrefFlagByte | 0) & 2) !== 0) ? 1 : 0;
  if (luaReady === 0 || luaSet !== 0) {
    events.opaqueCall008607a0 = (events.opaqueCall008607a0 | 0) + 1;
  }
  /* ABI v95 (record idx 48 0x008607a0 set-arm arg-prep): only the captured
     SET arm (ready!=0 && bit 1 set — PE 0x008607e7 LOW-BYTE test) publishes
     the lua_pcallk call-ARG laws as the typed-event arg-prep; ready==0
     (monolith) and the v57-dropped clear arm leave them 0. The pcallk
     stays typed-host (registry[fn_key] mod bytecode; fn_key host-time). */
  if (luaSet !== 0) {
    events.opaqueCall008607a0ArgsRegistryIndex = OPAQUE_008607A0_SET_REGISTRY_INDEX >>> 0;
    events.opaqueCall008607a0ArgsNargs = OPAQUE_008607A0_SET_NARGS | 0;
    events.opaqueCall008607a0ArgsNresults = OPAQUE_008607A0_SET_NRESULTS | 0;
    events.opaqueCall008607a0ArgsPcallkContext = OPAQUE_008607A0_SET_PCALLK_CONTEXT | 0;
    events.opaqueCall008607a0ArgsArg1 = OPAQUE_008607A0_SET_ARG1 | 0;
    events.opaqueCall008607a0ArgsArg2 = OPAQUE_008607A0_SET_ARG2 >>> 0;
  }
  events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GAME_UPDATE;
}

function run4257b0FromHead(state, runtimeInputs, events) {
  if ((frameOpaque4257b0NeedsHost(state.timedTransitionCleanupMode | 0) ? 1 : 0) === 0) {
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
    return;
  }
  const plan = frameOpaque4257b0Plan(runtimeInputs);
  if ((plan.usable | 0) !== 0) {
    events.frameOpaque4257b0IdCountOut = plan.idCount >>> 0;
    if ((frameOpaque4257b0PassANeedsHost(plan.idCount) ? 1 : 0) !== 0) {
      const outcome = frameOpaque4257b0Outcome(runtimeInputs);
      const post = (outcome.triples?.lo?.length ?? plan.preCount) | 0;
      events.frameOpaque4257b0PassAApplied = 1;
      events.frameOpaque4257b0Inserted = (post - (plan.preCount | 0)) | 0;
      events.frameOpaque4257b0PostCount = post;
      events.frameOpaque4257b0ListGrow = post > (plan.capCount >>> 0) ? 1 : 0;
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A;
      return;
    }
    events.frameOpaque4257b0PostCount = plan.preCount >>> 0;
    events.frameOpaque4257b0PassBApplied = 1;
    if (frameOpaque4257b0PassBNeedsHostRecaptured(plan.preCount)) {
      /* Real store count, not the v70 host-edge predicate: the C++ head
         publishes isaac_frame_opaque_4257b0_pass_b_apply's return. */
      const headOutcome = frameOpaque4257b0Outcome(runtimeInputs);
      events.frameOpaque4257b0PassBStores = (headOutcome.passBStores ?? 0) >>> 0;
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
    return;
  }
  if ((frameOpaque4257b0PassANeedsHost(runtimeInputs.frameOpaque4257b0IdCount | 0) ? 1 : 0) !== 0) {
    events.opaqueCall004257b0PassA = (events.opaqueCall004257b0PassA | 0) + 1;
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A;
    return;
  }
  if (frameOpaque4257b0PassBNeedsHostRecaptured(runtimeInputs.frameOpaque4257b0ListCount | 0)) {
    events.opaqueCall004257b0PassB = (events.opaqueCall004257b0PassB | 0) + 1;
  }
  events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
}

function maybeEmitHudPostUpdate(state, runtimeInputs, events) {
  const rt = runtimeInputs ?? {};
  /* Unshaped runtime (no HUD captures) keeps the pre-try_pure monolithic
     residual. Explicit zeros are the modelled pure no-op. */
  if (!Object.prototype.hasOwnProperty.call(rt, "playerHudOccupiedMask")
    && !Object.prototype.hasOwnProperty.call(rt, "managerHistoryCount")
    && !Object.prototype.hasOwnProperty.call(rt, "managerStatFlag")) {
    events.hudPostUpdateCalls = (events.hudPostUpdateCalls | 0) + 1;
    return;
  }
  const mask = rt.playerHudOccupiedMask >>> 0;
  const history = rt.managerHistoryCount | 0;
  const stat = (rt.managerStatFlag >>> 0) & 0xff;
  if (isaacHudPostUpdateTryPure(mask, history, stat) === 0) return;
  if ((mask & 0xff) !== 0 && (runtimeInputs.playerHudBlobReady | 0) !== 0) {
    for (let slot = 0; slot < PLAYER_HUD_MAX_SLOTS; slot += 1) {
      if ((mask & (1 << slot)) === 0) continue;
      const pack = (runtimeInputs.playerHudSlots && runtimeInputs.playerHudSlots[slot]) || {};
      const twin = isaacPlayerhudUpdateHeartsUsesTwin(pack.twinPtr | 0, pack.playerType | 0, pack.field3bc | 0);
      /* twin is a JS boolean; `!== 0` on a boolean is always true. */
      events.playerHudUpdateHearts = (events.playerHudUpdateHearts | 0) + (twin ? 2 : 1);
      events.playerHudGfxResidual = (events.playerHudGfxResidual | 0) + 1;
      const dirty = isaacPlayerhudActiveSlotCountdownTick({
        slots: [pack.active0 | 0, pack.active1 | 0, pack.active2 | 0, pack.active3 | 0],
      });
      if (dirty !== 0) events.playerHudDirtyNotify = (events.playerHudDirtyNotify | 0) + 1;
    }
    if (history > 0) {
      if ((state.hudHistoryLatch5c7c | 0) === 0) {
        events.hudHistoryResidual = (events.hudHistoryResidual | 0) + 1;
        state.hudHistoryLatch5c7c = 1;
      } else if ((runtimeInputs.hudHistorySlotFlag0 | 0) !== 0 || (runtimeInputs.hudHistorySlotFlag1 | 0) !== 0) {
        events.hudHistoryLoopResidual = (events.hudHistoryLoopResidual | 0) + 1;
      }
    }
    if (stat !== 0) events.hudStatResidual = (events.hudStatResidual | 0) + 1;
    return;
  }
  if (history > 0) state.hudHistoryLatch5c7c = 1;
  events.hudPostUpdateCalls = (events.hudPostUpdateCalls | 0) + 1;
}

function resume3(expected, impl) {
  return (inputState = {}, inputRuntimeInputs = {}, inputEvents = {}) => {
    const state = { ...emptyState(), ...inputState };
    const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
    const events = { ...emptyEvents(), ...inputEvents };
    if ((events.continuationKind | 0) !== expected) return { state, events };
    impl(state, runtimeInputs, events);
    return { state, events };
  };
}

/* ------------------------------------------------------------------ v95 - */
/* Record idx 35 opaqueRoomUpdateTailRain (B15 rain spawn loop): loop-frame
   pure laws + record wire oracle. Room-family laws consumed BY REFERENCE
   (v54 relay 0x428b20, v55 loop step/spawn args, B1 corners/world-xy/
   count/xorshift/once-flag) — mirrors the C++ exports exactly. */

export const B15_RAIN_ONCE_FLAG = 0x80000;
export const B15_RAIN_LOOP_MAX_STEPS = 8;
export const B15_RAIN_SEED_OK = 0;
export const B15_RAIN_SEED_FATAL_PRE_SHUFFLE = 1;
export const B15_RAIN_SEED_FATAL_PRE_CORNER = 2;

function b15F32BitsExact(value) {
  const buf = new ArrayBuffer(4);
  const f = new Float32Array(buf);
  const u = new Uint32Array(buf);
  f[0] = Math.fround(value);
  return u[0] >>> 0;
}

/** Count law 0x00802bb1..0x00802bdc (delegates to the room B1 law). */
export function b15RainSpawnCount(ownerNonzero, quality, begin183a4, end183a8) {
  return roomB1SpawnCountResolved(
      (ownerNonzero | 0) !== 0 ? 1 : 0, quality | 0,
      begin183a4 >>> 0, end183a8 >>> 0);
}

/** One-iteration loop-frame law (0x00802c20..0x00802e08). Composes the v55
    loop step + B1 corners/world-xy + v55 spawn args. */
export function b15RainFrame({
  seedIn, index, spawnCount, roomWC, roomHC,
  slotF0, slotF4, slotF8, slotF34, searchResult,
}) {
  const step = roomB15RainLoopStep({ seedIn, index, spawnCount }) || {};
  const out = {
    remaining: step.remaining | 0,
    seedIn: (step.seedIn ?? (seedIn >>> 0)) >>> 0,
    seedShuffle: (step.seedShuffle ?? 0) >>> 0,
    shuffleRem: (step.shuffleRem ?? 0) >>> 0,
    needsSwap: (step.needsSwap ?? 0) | 0,
    swapIndex: (step.swapIndex ?? (index | 0)) | 0,
    slotOffset: (step.slotOffset ?? 0) | 0,
    swapOffset: (step.swapOffset ?? 0) | 0,
    seedCorner: (step.seedCorner ?? 0) >>> 0,
    seedOut: (step.seedOut ?? 0) >>> 0,
    nextIndex: (step.nextIndex ?? ((index | 0) + 1)) | 0,
    continueLoop: (step.continueLoop ?? 0) | 0,
    seedFatal: (step.seedFatal ?? 0) | 0,
    cornerIndex: 0,
    worldXBits: 0,
    worldYBits: 0,
    argA1: 0, argA2: 0, argA3: 0, argA4: 0, argA5: 0, argA6: 0, argA7: 0,
    spawnSiteVa: 0, bindVa: 0, entityMarkValue: 0,
  };
  if ((out.seedFatal | 0) !== B15_RAIN_SEED_OK) return out;
  const corners = roomB1CornerIndices(roomWC | 0, roomHC | 0) ||
      { c0: -1, c1: -1, c2: -1, c3: -1 };
  out.cornerIndex = roomB1CornerPick(corners, out.seedCorner >>> 0);
  const xy = roomB1CornerWorldXy(out.cornerIndex, roomWC | 0) || { x: 0, y: 0 };
  out.worldXBits = b15F32BitsExact(xy.x);
  out.worldYBits = b15F32BitsExact(xy.y);
  const args = roomB15RainSpawnArgs({
    slotF0: slotF0 >>> 0, slotF4: slotF4 >>> 0,
    slotF8: slotF8 >>> 0, slotF34: slotF34 >>> 0,
    searchResult: searchResult >>> 0,
  }) || {};
  out.argA1 = args.a1 >>> 0;
  out.argA2 = args.a2 >>> 0;
  out.argA3 = args.a3 >>> 0;
  out.argA4 = args.a4 >>> 0;
  out.argA5 = args.a5 >>> 0;
  out.argA6 = args.a6 >>> 0;
  out.argA7 = args.a7 >>> 0;
  out.spawnSiteVa = args.relayVa >>> 0;
  out.bindVa = args.bindVa >>> 0;
  out.entityMarkValue = args.entityMarkValue >>> 0;
  return out;
}

/** Record wire decide: once-flag -> buffer -> count -> loop walk with typed
    host counts + genrand draw typing (roomGenrandNext). Mirrors
    isaac_game_update_slice_b15_rain_wire. slotF0/F4/F8/F34/searchResults =
    arrays (per-iteration captures). */
export function b15RainWireDecide({
  flags1839c, ownerNonzero, quality, begin183a4, end183a8, seed0,
  roomWC, roomHC, slotF0, slotF4, slotF8, slotF34, searchResults,
  genrandCount, genrandMtReady,
}) {
  const plan = {
    onceFlagApply: 0, bufferEmpty: 0, spawnCount: 0, steps: 0, seedOut: seed0 >>> 0,
    seedFatal: B15_RAIN_SEED_OK, loopEnter: 0, hostSearch: 0, hostCreate: 0,
    hostBind: 0, hostSwap: 0, genrandDraws: 0, genrandMtAdvance: 0,
  };
  let draws = (genrandCount ?? 0) >>> 0;
  if (draws > 448) draws = 448;
  plan.genrandDraws = draws;
  if (roomB1OnceFlagClear(flags1839c >>> 0) === 0) return plan;
  plan.onceFlagApply = 1;
  if ((begin183a4 >>> 0) === (end183a8 >>> 0)) {
    plan.bufferEmpty = 1;
    return plan;
  }
  const count = b15RainSpawnCount(
      ownerNonzero, quality, begin183a4 >>> 0, end183a8 >>> 0);
  plan.spawnCount = count | 0;
  if ((count | 0) <= 0) return plan;
  plan.loopEnter = 1;
  const n = Math.min(Math.max(count | 0, 0), B15_RAIN_LOOP_MAX_STEPS);
  const arr = (a, k, i) =>
      (Array.isArray(a) && a[i] !== undefined ? a[i] : 0) >>> 0;
  let seed = seed0 >>> 0;
  for (let i = 0; i < n; i += 1) {
    const frame = b15RainFrame({
      seedIn: seed, index: i, spawnCount: count, roomWC: roomWC | 0,
      roomHC: roomHC | 0,
      slotF0: arr(slotF0, "f0", i), slotF4: arr(slotF4, "f4", i),
      slotF8: arr(slotF8, "f8", i), slotF34: arr(slotF34, "f34", i),
      searchResult: arr(searchResults, "s", i),
    });
    plan.steps = i + 1;
    if ((frame.seedFatal | 0) === B15_RAIN_SEED_FATAL_PRE_SHUFFLE) {
      plan.seedFatal = B15_RAIN_SEED_FATAL_PRE_SHUFFLE;
      break;
    }
    if ((frame.needsSwap | 0) !== 0) plan.hostSwap += 1;
    if ((frame.seedFatal | 0) === B15_RAIN_SEED_FATAL_PRE_CORNER) {
      plan.seedFatal = B15_RAIN_SEED_FATAL_PRE_CORNER;
      break;
    }
    plan.hostSearch += 1;
    plan.hostCreate += 1;
    plan.hostBind += 1;
    seed = frame.seedOut >>> 0;
  }
  plan.seedOut = seed >>> 0;
  if (draws !== 0 && (genrandMtReady | 0) !== 0) plan.genrandMtAdvance = 1;
  return plan;
}

/* ------------------------------------------------------------------ v95 - */
/* Record idx 42 opaqueRoomUpdateTailPath (B19 0x008055a7..0x00806043 path
   rebuild + B20 0x0080608e..0x00806884 trail list): rebuild decision +
   trail-loop frame + record wire. Room-family laws consumed BY REFERENCE
   (B19 v30 / B20 v31-v32) — mirrors the C++ exports exactly. */

export const TAIL_PATH_MAX_NODES = 32;

/** Pack-field order of the 28-B per-entity ABI blob (the pack(1) wasm
    struct IsaacGameUpdateSliceTailPathEntry: 7 x u32 LE — type_28,
    flags_16c, field_3c0, child_3bc, child_type_28, pos_x_bits,
    pos_y_bits; native/decomp/game_update_slice.h:1667). */
export const TAIL_PATH_ENTRY_FIELD_ORDER = Object.freeze([
  "type28", "flags16c", "field3c0", "child3bc", "childType28", "posX", "posY",
]);

/** A flat blob is any array-like whose cells are numbers, not entry
    objects (Uint8Array / number[] of 28*N bytes). */
export function isTailPathEntriesBlob(entries) {
  if (entries instanceof Uint8Array) return true;
  if (!Array.isArray(entries)) return false;
  if (entries.length === 0) return true; /* empty object list == empty blob */
  return typeof entries[0] !== "object" || entries[0] === null;
}

/** Decode the flat 28-B/entry ABI blob (@10076..10972) back into per-entry
    objects (wasm-parity oracle: the module reads the packed struct; the
    model wire must read the very same bytes). Blob length shorter than
    28*count is padded with zero packs. @returns {Array<object>} */
export function decodeTailPathEntriesFromBlob(entries, cap = TAIL_PATH_MAX_NODES) {
  const out = [];
  const isBlob = isTailPathEntriesBlob(entries);
  if (!isBlob || entries == null) return out;
  const n = Math.min(Math.max((entries.length ?? 0) | 0, 0), cap);
  const pick = (i, f) => {
    const off = i * 28 + f * 4;
    if (off + 4 > n) return 0;
    const a = entries;
    return ((a[off] & 0xff) |
      ((a[off + 1] & 0xff) << 8) |
      ((a[off + 2] & 0xff) << 16) |
      ((a[off + 3] & 0xff) << 24)) >>> 0;
  };
  for (let i = 0; i < n; i += 1) {
    if (i * 28 >= n) break;
    const e = {};
    for (let f = 0; f < TAIL_PATH_ENTRY_FIELD_ORDER.length; f += 1) {
      e[TAIL_PATH_ENTRY_FIELD_ORDER[f]] = pick(i, f);
    }
    out.push(e);
  }
  return out;
}

/** Flatten object/per-lane entries into the 896-byte runtime blob
    (32 x 28 B, u32 LE in TAIL_PATH_ENTRY_FIELD_ORDER). Accepts an array
    of entry objects, an object of per-lane arrays (the wire's lane form),
    or a flat blob (copied verbatim). Cap enforces the entries-array bound. */
export function flattenTailPathEntriesRuntime(
  entries = [], cap = TAIL_PATH_MAX_NODES,
) {
  const blob = new Uint8Array(Math.max(cap | 0, 0) * 28);
  if (entries == null) return blob;
  if (isTailPathEntriesBlob(entries)) {
    const n = Math.min(Math.max((entries.length ?? 0) | 0, 0), blob.length);
    for (let i = 0; i < n; i += 1) blob[i] = entries[i] & 0xff;
    return blob;
  }
  const lane = (k) => {
    const v = entries[k];
    return Array.isArray(v) ? v : [];
  };
  const into = (i, f, v) => {
    const off = i * 28 + f * 4;
    const u = (v == null ? 0 : v) >>> 0;
    blob[off] = u & 0xff;
    blob[off + 1] = (u >>> 8) & 0xff;
    blob[off + 2] = (u >>> 16) & 0xff;
    blob[off + 3] = (u >>> 24) & 0xff;
  };
  if (Array.isArray(entries)) {
    const n = Math.min(entries.length, cap);
    for (let i = 0; i < n; i += 1) {
      const e = entries[i];
      if (!e || typeof e !== "object") continue;
      for (let f = 0; f < TAIL_PATH_ENTRY_FIELD_ORDER.length; f += 1) {
        into(i, f, e[TAIL_PATH_ENTRY_FIELD_ORDER[f]]);
      }
    }
  } else if (entries && typeof entries === "object") {
    for (let i = 0; i < cap; i += 1) {
      for (let f = 0; f < TAIL_PATH_ENTRY_FIELD_ORDER.length; f += 1) {
        const k = TAIL_PATH_ENTRY_FIELD_ORDER[f];
        into(i, f, lane(k)[i]);
      }
    }
  }
  return blob;
}

/** B19 rebuild decision (PE 0x008055a7 cmp byte [Room+0x7769],0 / je B20):
    LOW-BYTE test of the PRE-clear flag. 1 = rebuild body must host
    (refcount/memset/tree/pathfinding/spawn/pedestal; flag-on ALWAYS hosts
    even when W*H<=0 and the entity list is empty). */
export function gameUpdateSliceB19RebuildDecision(roomFlag7769) {
  return roomB19NeedsPathRebuildHost(roomFlag7769 >>> 0);
}

/* ABI v99 leaf peel (idx 42): B19 rebuild-body islands. Transcribed from
   the instruction stream. Do NOT derive from the C++. */
export const B19_FLAGS168_CLEAR_MASK = 0xfff7ffff;
export const B19_CELL_BUF_SIZE = 0x1c0;
export const B19_TYPE10 = 0x10;
export const B19_TYPE10_Y_NUDGE_BITS = 0x41f00000; /* 30.0f @0xbaa8d0 */
export const B19_HOST_VA_GET_GRID_COLLISION = 0x007f0800;
export const B19_HOST_VA_QUERY_8000 = 0x0072fe80;
export const B19_HOST_VA_GET_ALT_PEDESTAL = 0x006e1d70;
export const B19_HOST_VA_SET_ALT_PEDESTAL = 0x006e1a80;

export function gameUpdateSliceB19QueryAlProceed(queryAl) {
  /* PE 0x80570e test al,al / jne skip. LOW-BYTE. */
  return ((queryAl >>> 0) & 0xff) === 0 ? 1 : 0;
}
export function gameUpdateSliceB19Flags168ClearBit(flags168) {
  /* PE 0x805718 and dword [esi+0x168], 0xfff7ffff. FULL-DWORD. */
  return (flags168 >>> 0) & B19_FLAGS168_CLEAR_MASK;
}
export function gameUpdateSliceB19CellBufInRange(idx) {
  /* PE 0x805e6e cmp edi,0x1c0 / jae. UNSIGNED. */
  return ((idx >>> 0) < (B19_CELL_BUF_SIZE >>> 0)) ? 1 : 0;
}
export function gameUpdateSliceB19Type10YNudge(roomType8, yBits) {
  /* PE 0x805db3 cmp dword [Room+8],0x10 FULL-DWORD / addss 30.0f. */
  if ((roomType8 >>> 0) !== (B19_TYPE10 >>> 0)) return yBits >>> 0;
  const buf = new ArrayBuffer(4);
  const f = new Float32Array(buf);
  const u = new Uint32Array(buf);
  u[0] = yBits >>> 0;
  const add = new Uint32Array(new ArrayBuffer(4));
  const addf = new Float32Array(add.buffer);
  add[0] = B19_TYPE10_Y_NUDGE_BITS;
  f[0] = Math.fround(f[0] + addf[0]);
  return u[0] >>> 0;
}
export function gameUpdateSliceB19HostVaGetGridCollision() {
  return B19_HOST_VA_GET_GRID_COLLISION;
}
export function gameUpdateSliceB19HostVaQuery8000() {
  return B19_HOST_VA_QUERY_8000;
}
export function gameUpdateSliceB19HostVaGetAltPedestal() {
  return B19_HOST_VA_GET_ALT_PEDESTAL;
}
export function gameUpdateSliceB19HostVaSetAltPedestal() {
  return B19_HOST_VA_SET_ALT_PEDESTAL;
}

/* ABI v99 exports-only (idx 42, update-v113-tailpath-b19b20): leftover
   B19/B20 islands. Transcribed from the instruction stream — do NOT
   derive from the C++. Tree/spawn/vector/SEH stay typed-host. */
export const B19_FATAL_LEVEL = 0x10;
export const B19_FATAL_STRING_VA = 0x00b6bf54;
export const B19_HOST_VA_FATAL = 0x00a112c0;
export const B19_HOST_VA_4288A0 = 0x004288a0;
export const B19_HOST_VA_6EED30 = 0x006eed30;
export const B19_HOST_VA_5CC710 = 0x005cc710;
export const B19_HOST_VA_42C8E0 = 0x0042c8e0;
export const B20_HOST_VA_802740 = 0x00802740;
export const B20_HOST_VA_42C920 = 0x0042c920;

export function gameUpdateSliceB19EntityPresent(entityPtr) {
  /* PE 0x805649 test esi,esi / je. FULL-DWORD. */
  return (entityPtr >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSliceB19SpawnPtrLive(spawnPtr) {
  /* PE 0x805de7 test edx,edx / jne spawn else fatal. FULL-DWORD. */
  return (spawnPtr >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSliceB19FatalLevel() {
  return B19_FATAL_LEVEL;
}
export function gameUpdateSliceB19FatalStringVa() {
  return B19_FATAL_STRING_VA;
}
export function gameUpdateSliceB19Field528Gt0(field528) {
  /* PE 0x805f80 test eax,eax / jle. SIGNED > 0. */
  return ((field528 | 0) > 0) ? 1 : 0;
}
export function gameUpdateSliceB20VectorInplace(vecEnd, vecCap) {
  /* PE 0x806105 cmp edi,ecx / je grow. FULL-DWORD. */
  return ((vecEnd >>> 0) !== (vecCap >>> 0)) ? 1 : 0;
}
export function gameUpdateSliceB20SpawnResultLive(spawnPtr) {
  /* PE 0x8067e8 test ecx,ecx / je skip |0x80. FULL-DWORD. */
  return (spawnPtr >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSliceB19HostVaFatal() {
  return B19_HOST_VA_FATAL;
}
export function gameUpdateSliceB19HostVa4288a0() {
  return B19_HOST_VA_4288A0;
}
export function gameUpdateSliceB19HostVa6eed30() {
  return B19_HOST_VA_6EED30;
}
export function gameUpdateSliceB19HostVa5cc710() {
  return B19_HOST_VA_5CC710;
}
export function gameUpdateSliceB19HostVa42c8e0() {
  return B19_HOST_VA_42C8E0;
}
export function gameUpdateSliceB20HostVa802740() {
  return B20_HOST_VA_802740;
}
export function gameUpdateSliceB20HostVa42c920() {
  return B20_HOST_VA_42C920;
}


function b20F32BitsExact(value) {
  const buf = new ArrayBuffer(4);
  const f = new Float32Array(buf);
  const u = new Uint32Array(buf);
  f[0] = Math.fround(value);
  return u[0] >>> 0;
}

/** One-iteration B20 trail-loop frame law (0x0080608e..0x00806880).
    Per captured entity: pass1 type filter -> |0x4000 post + host push;
    pass2 action route (FLAGGED/PAIR_X/PAIR_Y/DEFAULT) -> spawn |0x80 post
    + host spawn; FLAGGED -> multi-spawn enter + chain continue + genrand
    arm; pair ±offset posts (60.0/30.0 f32 bits). */
export function gameUpdateSliceB20TrailFrame({
  entityType28 = 0, entityFlags16c = 0, field3c0 = 0, childPtr3bc = 0,
  childType28 = 0, mode26614 = 0, posXBits = 0, posYBits = 0,
}) {
  const type = entityType28 | 0;
  const out = {
    pass1Match: roomB20Pass1TypeMatch(type),
    flagOr4000: roomB20FlagOr4000(entityFlags16c >>> 0) >>> 0,
    pass2Action: roomB20Pass2Action(entityFlags16c >>> 0, type),
    spawnFlagOr80: roomB20SpawnFlagOr80(entityFlags16c >>> 0) >>> 0,
    multispawnEnter: 0, chainContinue: 0, hostPush: 0, hostSpawn: 1,
    hostGenrand: 0,
    pairXLeftBits: 0, pairXRightBits: 0, pairYUpBits: 0, pairYDownBits: 0,
  };
  out.hostPush = out.pass1Match;
  if ((out.pass2Action | 0) === ROOM_B20_ACTION_FLAGGED) {
    out.multispawnEnter = roomB20FlaggedMultispawnEnter(field3c0 >>> 0);
    out.chainContinue = roomB20ChainContinue(
        childPtr3bc >>> 0, mode26614 | 0, childType28 | 0);
    out.hostGenrand = 1;
  } else if ((out.pass2Action | 0) === ROOM_B20_ACTION_DEFAULT) {
    out.hostGenrand = 1;
  }
  const px = f32FromBits(posXBits >>> 0);
  const py = f32FromBits(posYBits >>> 0);
  const left = roomB20PairXLeft(px, py) || { x: 0, y: 0 };
  const right = roomB20PairXRight(px, py) || { x: 0, y: 0 };
  const up = roomB20PairYUp(px, py) || { x: 0, y: 0 };
  const down = roomB20PairYDown(px, py) || { x: 0, y: 0 };
  out.pairXLeftBits = b20F32BitsExact(left.x);
  out.pairXRightBits = b20F32BitsExact(right.x);
  out.pairYUpBits = b20F32BitsExact(up.y);
  out.pairYDownBits = b20F32BitsExact(down.y);
  return out;
}

/** Record wire decide: flag_ready (B19) -> list gate (B20) -> count ->
    loop walk. ready=0 -> MONOLITHIC (pre-v95 exact). B19 flag low byte 0
    -> NONE; B20 begin==end -> NONE. genrandDraws = host-reported draws
    (capped at entry count). entries = array of 7-field packs (or an
    object with per-lane arrays type28/flags16c/field3c0/child3bc/
    childType28/posX/posY). */
export function gameUpdateSliceTailPathWire({
  flagReady = 0, roomFlag7769 = 0, listBeginC82674 = 0, listEndC82678 = 0,
  mode26614 = 0, genrandDraws = 0, entries = [],
}) {
  const plan = {
    b19ResidualKind: 0, b20ResidualKind: 0, listCount: 0, pureSteps: 0,
    hostRebuild: 0, hostTrail: 0, hostPush: 0, hostSpawn: 0,
    hostMultispawnSteps: 0, hostDeallocate: 0, hostGenrandDraws: 0,
  };
  const cap = TAIL_PATH_MAX_NODES;
  let draws = (genrandDraws ?? 0) >>> 0;
  if (draws > cap) draws = cap;
  plan.hostGenrandDraws = draws;
  if ((flagReady | 0) === 0) {
    plan.b19ResidualKind = ROOM_B19_RESIDUAL_MONOLITHIC;
    plan.b20ResidualKind = ROOM_B20_RESIDUAL_MONOLITHIC;
    return plan;
  }
  if (gameUpdateSliceB19RebuildDecision(roomFlag7769 >>> 0) !== 0) {
    plan.b19ResidualKind = ROOM_B19_RESIDUAL_HOST_REBUILD;
    plan.hostRebuild = 1;
  } else {
    plan.b19ResidualKind = ROOM_B19_RESIDUAL_NONE;
  }
  if ((listBeginC82674 >>> 0) === (listEndC82678 >>> 0)) {
    plan.b20ResidualKind = ROOM_B20_RESIDUAL_NONE;
    return plan;
  }
  plan.b20ResidualKind = ROOM_B20_RESIDUAL_HOST_TRAIL;
  plan.hostTrail = 1;
  const listCount = roomB20ListCount(listBeginC82674 >>> 0, listEndC82678 >>> 0);
  plan.listCount = listCount | 0;
  if ((listCount | 0) <= 0) {
    plan.hostDeallocate = 1;
    return plan;
  }
  const n = Math.min(Math.max(listCount | 0, 0), TAIL_PATH_MAX_NODES);
  /* A flat ABI blob (bridge/harness shape: 28 B/entry u32 LE packs from
     @10076..10972) is decoded FIRST so the walk reads the exact bytes the
     module reads (wasm parity); object/lane forms flow through unchanged. */
  if (isTailPathEntriesBlob(entries)) {
    entries = decodeTailPathEntriesFromBlob(entries, cap);
  }
  const lane = (a, k, i) => {
    if (Array.isArray(a) && a[i] !== undefined) return a[i];
    if (a && typeof a === "object") {
      const v = a[k] ?? a[k[0].toLowerCase() + k.slice(1)];
      if (Array.isArray(v) && v[i] !== undefined) return v[i];
    }
    return 0;
  };
  /* Walk min(listCount, captured entries): an entry pack list shorter than
     the raw count means the host captured fewer nodes (the capture lane is
     the module's own bound — no phantom zero-entity steps). */
  let captured = 0;
  if (Array.isArray(entries)) captured = entries.length;
  const steps = Math.min(n, captured);
  for (let i = 0; i < steps; i += 1) {
    const entry = Array.isArray(entries) && entries[i] && typeof entries[i] === "object"
      ? entries[i] : {};
    const pick = (k, alt1, alt2) => {
      if (entry[k] !== undefined) return entry[k];
      if (alt1 !== undefined && entry[alt1] !== undefined) return entry[alt1];
      if (alt2 !== undefined && entry[alt2] !== undefined) return entry[alt2];
      return lane(entries, k, i);
    };
    const frame = gameUpdateSliceB20TrailFrame({
      entityType28: pick("type28", "entityType28") ?? 0,
      entityFlags16c: pick("flags16c", "entityFlags16c") ?? 0,
      field3c0: pick("field3c0") ?? 0,
      childPtr3bc: pick("child3bc", "childPtr3bc") ?? 0,
      childType28: pick("childType28") ?? 0,
      mode26614: mode26614 >>> 0,
      posXBits: pick("posX", "posXBits") ?? 0,
      posYBits: pick("posY", "posYBits") ?? 0,
    });
    plan.pureSteps = i + 1;
    plan.hostPush += (frame.hostPush | 0);
    plan.hostSpawn += (frame.hostSpawn | 0);
    plan.hostMultispawnSteps += (frame.multispawnEnter | 0);
  }
  plan.hostDeallocate = 1;
  return plan;
}

export function stepGameUpdateSlice(inputState, inputConstants, inputRuntimeInputs) {
  const state = { ...emptyState(), ...inputState };
  const constants = { ...(inputConstants ?? {}) };
  const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
  const events = emptyEvents();
  events.continuationKind = UPDATE_CONTINUATION.CONTINUE_NEXT_GATE;
  events.dispatchKind = TRANSITION_DISPATCH.NONE;
  events.queuedScreenId = -1;

  if ((state.shortTimer | 0) > 0) state.shortTimer = (state.shortTimer | 0) - 1;
  if ((state.positionResetTimer | 0) > 0) {
    state.positionResetTimer = (state.positionResetTimer | 0) - 1;
    if ((state.positionResetTimer | 0) < 1) {
      state.positionXBits = constants.resetPositionXBits >>> 0;
      state.positionYBits = constants.resetPositionYBits >>> 0;
    }
  }
  if ((state.secondaryTimer | 0) > 0) state.secondaryTimer = (state.secondaryTimer | 0) - 1;
  applyFxLerpGate(state, runtimeInputs);
  if (Math.fround(state.decayValue) > 0) {
    if (Math.fround(state.decayValue) <= Math.fround(constants.decayThreshold)) state.decayValue = 0;
    else state.decayValue = Math.fround(Math.fround(state.decayValue) * Math.fround(constants.decayFactor));
  }
  if (Math.fround(state.transitionProgress) > 0) {
    if ((state.transitionMode | 0) === 0) {
      state.transitionProgress = Math.fround(Math.fround(state.transitionProgress) - Math.fround(state.transitionRate));
      if (Math.fround(state.transitionProgress) < 0) state.transitionProgress = 0;
    } else {
      state.transitionProgress = Math.fround(Math.fround(state.transitionProgress) + Math.fround(state.transitionRate));
      if (Math.fround(state.transitionProgress) >= Math.fround(constants.transitionComplete)) {
        state.transitionProgress = Math.fround(constants.transitionComplete);
        events.transitionCompleted = 1;
        events.transitionMode = state.transitionMode | 0;
        events.clearTransitionGate = 1;
        classifyTransitionDispatch(state.transitionMode | 0, events);
        if ((state.transitionMode | 0) !== 8 && (state.transitionMode | 0) !== 9) state.transitionMode = 0;
      }
    }
    maybeEmitHudPostUpdate(state, runtimeInputs, events);
  }
  state.transitionTailByte29fb8 = 0;
  if ((state.transitionMode | 0) !== 8 && (state.transitionMode | 0) !== 9) state.transitionMode = 0;
  events.opaqueCall009a2b30 = (events.opaqueCall009a2b30 | 0) + 1;
  let walkScratch = null;
  let countdown = null;
  if (hudStatWalkLaneActive(runtimeInputs)) {
    walkScratch = seedHudStatWalkScratch(runtimeInputs);
    hudStatWalkRun(walkScratch, runtimeInputs, state, events);
  } else {
    countdown = hudStatCountdownValues(runtimeInputs);
    if (hudStatCountdownLaneActive(runtimeInputs)) countdown = hudStatCountdownTick(countdown, 1);
  }
  if ((state.postUpdateDelay | 0) > 0) {
    state.postUpdateDelay = (state.postUpdateDelay | 0) - 1;
    events.opaqueCall009a2b30 = (events.opaqueCall009a2b30 | 0) + 1;
    if (hudStatWalkLaneActive(runtimeInputs) && walkScratch) hudStatWalkRun(walkScratch, runtimeInputs, state, events);
    else if (countdown) countdown = hudStatCountdownTick(countdown, 1);
    maybeEmitHudPostUpdate(state, runtimeInputs, events);
    events.earlyReturnAfterHud = 1;
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_HUD_DELAY;
    return { state, events };
  }
  if ((state.gate1d520 | 0) !== 0) {
    if ((state.oneShot1d63c | 0) !== 0) {
      emitOpaque0092e300(state, runtimeInputs, events);
      state.oneShot1d63c = 0;
    }
    const blobReady = runtimeInputs.globalTree4aba0BlobReady | 0;
    const begin = runtimeInputs.globalTree4aba0Begin >>> 0;
    const end = runtimeInputs.globalTree4aba0End >>> 0;
    const count = runtimeInputs.globalTree4aba0Count | 0;
    if (blobReady !== 0 && begin !== end && count <= GLOBAL_TREE_4ABA0_MAX_NODES) {
      const nodes = globalTree4aba0NodesFromRuntime(runtimeInputs, count);
      const treeResult = globalTree4aba0Refresh(begin, end, count, nodes);
      if ((treeResult | 0) >= 0) state.globalTree4aba0Result = treeResult | 0;
      else events.opaqueGlobal4aba0Refresh = 1;
    } else events.opaqueGlobal4aba0Refresh = 1;
    if (isaacMenuGateUpdateNeedsHost(state.menuState23a74, state.gate1b83c, state.predicate1ba74) !== 0) {
      events.opaqueCall009b6840 = 1;
      /* ABI v95 (record idx 2 body): A2 mode-latch store law mirror. */
      if (gameUpdateSlice9b6840ModeLatchNeeded(state.status22ed4 | 0) !== 0) {
        state.status22ed4 = 1;
        state.status22edc = 2;
      }
    }
    if ((state.state24ecc | 0) !== 0) {
      state.state24ecc = 2; state.mode24ed8 = 8; state.value24ed0 = -1;
      events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GATE_1D520;
    } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL;
    return { state, events };
  }
  if ((state.gate1d654 | 0) !== 0) {
    const rankReady = runtimeInputs.opaque857450Ready | 0;
    if (opaque857450NeedsHost({
      ready: rankReady, gate1d654: state.gate1d654 | 0,
      manager4abbc: runtimeInputs.opaque857450Manager4abbc | 0,
    })) {
      events.opaqueCall00857450 = 1;
      if (rankReady !== 0) apply857450Body(runtimeInputs, state, events);
    }
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GATE_1D654;
    return { state, events };
  }
  if ((state.gate1ba78 | 0) !== 0) {
    const ready = runtimeInputs.opaque0092f1c0Ready | 0;
    const mode = runtimeInputs.opaque0092f1c0Mode | 0;
    const counter = runtimeInputs.opaque0092f1c0Counter | 0;
    const limit = (runtimeInputs.opaque0092f1c0Limit ?? 0) >>> 0;
    const field14 = (runtimeInputs.opaque0092f1c0Field14 ?? 0) >>> 0;
    /* ABI v101 (record idx 3 case-1 leaf-5): the 0x74f090 predicate inputs.
       gameType0 is the site-local [Game+0] sample; flags2654c is tick state
       (no writer in the slice, so it is authoritative at this point). */
    const gameType0 = (runtimeInputs.opaque0092f1c0GameType0 ?? 0) >>> 0;
    const flags2654c = (state.flags2654c ?? 0) >>> 0;
    events.opaque0092f1c0Case = 0;
    events.opaque0092f1c0HostLeaf = 0;
    if (opaque0092f1c0NeedsHost({
      ready, mode, counter, limit, field14, gameType0, flags2654c,
    })) {
      events.opaqueCall0092f1c0 = 1;
      /* ABI v95: typed host events pin the dispatch + case-arm decisions
         (ready!=0 only, v94 ready-gated precedent). */
      if (ready !== 0) {
        const dc = gameUpdateSlice92f1c0DispatchCase(mode);
        if (dc >= 0) {
          events.opaque0092f1c0Case = dc;
          events.opaque0092f1c0HostLeaf = gameUpdateSlice92f1c0HostLeaf({
            mode, counter, limit, field14, gameType0, flags2654c,
          });
        }
      }
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_92F1C0;
      return { state, events };
    }
    const plan = opaque0092f1c0ApplyTail({ mode, counter });
    events.opaque0092f1c0CounterOut = plan.counterOut | 0;
    if (plan.tailStoresNeeded) { state.status22ed4 = 2; state.status22edc = 2; }
    maybeEmitHudPostUpdate(state, runtimeInputs, events);
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GATE_1BA78;
    return { state, events };
  }
  if ((state.gate1b83c | 0) !== 0) {
    const ready8318a0 = runtimeInputs.opaque008318a0Ready | 0;
    const mode8318a0 = runtimeInputs.opaque008318a0Mode | 0;
    /* ABI v95 (record idx 4): the mode-3 HEAD pure shared-advance arm
       (PE 0x8320c6..0x8320cc SIGNED jl -> 0x8320bd, ZERO host; common tail
       0x832663 ratio + status stores). Counter/limit are the captured
       receiver lanes engine_field_4 (Game+0x1b840) / engine_field_8
       (Game+0x1b844). On this arm the 8318a0 host edge is DROPPED. */
    if (ready8318a0 !== 0 && (mode8318a0 | 0) === 3 &&
        gameUpdateSlice8318a0Mode3AdvanceSigned(
          state.engineField4 | 0, state.engineField8 | 0) !== 0) {
      events.opaque008318a0Mode3AdvancePure = 1;
      const counterNext = ((state.engineField4 | 0) + 1) | 0; /* 32-bit wrap */
      state.engineField4 = counterNext;
      state.engineFieldC = hud8318a0RatioF32Bits(counterNext, state.engineField8 | 0) | 0;
      state.status22ed4 = 2;
      state.status22edc = 2;
    } else if (opaque008318a0NeedsHost({
      ready: ready8318a0,
      mode: mode8318a0,
    })) {
      events.opaqueCall008318a0 = 1;
      /* ABI v95 (record idx 4): the mode-4 HEAD SFX gate (PE 0x83243b/
         0x832441 FULL-DWORD type==3 && counter==8). SFX stays typed-host;
         the event pins the gate + arg 0xd6. */
      if (ready8318a0 !== 0 && (mode8318a0 | 0) === 4 &&
          gameUpdateSlice8318a0Mode4SfxGate(
            state.engineField1c | 0, state.engineField4 | 0) !== 0) {
        events.opaque008318a0Mode4SfxGateOpen = 1;
      }
    }
    /* ABI v96 (wave-23, record idx 4): the mode-1 SFX-manager store-plan
       seam, LIVE (mirror of the cpp gate_1b83c wire; NOTES
       update-v98-record4-wire §4). Pack lanes are the span slots in order
       (count = (end-begin)>>2, cap = ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX
       == ENGINE_PLAYER_MAX == 8; null-slot rows MUST be all-zero).
       candidate_found = [ebp-0x41]: set 1 @0x83191c, cleared @0x831ae4 iff
       the walk scores an entry with type_1c != 0 && b173==0 &&
       (b1398||b139a) && (ptr7c==0 || byte34==0) && w3fc!=4 (FULL-DWORD
       w3fc; entries with b173!=0 or ptr7c!=0&&byte34!=0 exit 0x831aff
       before the score block). ABI v99 (update-v99-record4-fold): the
       type_1c != 0 term — PE 0x831a1f/0x831a26 zero e+0x1398/e+0x139a for
       type==0 (0x831a19 cmp dword [ebx+0x1c],0), so the 0x831a95 re-check
       always exits at 0x831af8 and the 0x831ae4 clear is unreachable
       (mode1_walk_entry_zero_arm BY REFERENCE).
       The plan fires iff mode1_manager_block_gate(candidate_found,
       engine_field_1c, engine_field_14) opens (PE 0x831c64 cmp byte
       [ebp-0x41],0 / jne 0x831c75). Only net effect: the typed event +1;
       the coarse edge stays; every gate miss is byte-for-byte inert. */
    if (ready8318a0 !== 0 && (mode8318a0 | 0) === 1) {
      const packReady8318a0 = runtimeInputs.opaque8318a0PlayerEntryReady | 0;
      const packCount8318a0 = runtimeInputs.opaque8318a0PlayerEntryCount | 0;
      if (packReady8318a0 !== 0 && packCount8318a0 <= ENGINE_PLAYER_MAX) {
        const b173 = runtimeInputs.opaque8318a0PlayerEntryB173;
        const b1398 = runtimeInputs.opaque8318a0PlayerEntryB1398;
        const b139a = runtimeInputs.opaque8318a0PlayerEntryB139a;
        const ptr7c = runtimeInputs.opaque8318a0PlayerEntryPtr7c;
        const b34 = runtimeInputs.opaque8318a0PlayerEntryB34;
        const w3fc = runtimeInputs.opaque8318a0PlayerEntryW3fc;
        const type1c8318a0 = state.engineField1c | 0;
        let candidateFound = 1;
        for (let i = 0; i < packCount8318a0; i += 1) {
          if ((type1c8318a0 | 0) !== 0 &&
              ((b173?.[i] ?? 0) & 0xff) === 0 &&
              (((b1398?.[i] ?? 0) & 0xff) !== 0 || ((b139a?.[i] ?? 0) & 0xff) !== 0) &&
              ((ptr7c?.[i] ?? 0) >>> 0 === 0 || ((b34?.[i] ?? 0) & 0xff) === 0) &&
              ((w3fc?.[i] ?? 0) >>> 0) !== 4) {
            candidateFound = 0;
            break;
          }
        }
        if (gameUpdateSlice8318a0Mode1ManagerBlockGate(
          candidateFound,
          type1c8318a0,
          state.engineField14 | 0) !== 0) {
          events.opaque008318a0SfxManagerStores = (events.opaque008318a0SfxManagerStores | 0) + 1;
          /* ABI v142 (rt_band_pop typed carrier): capture-live RETIRE
             arm — the stateful deltas (0xc79790 decrement, 0xc7978c
             latch clear) publish on the composite lanes, the five param
             stores fold purely (params_pack); @932 stays as shipped.
             Absence never reaches this arm -> byte-for-byte pre-v142. */
          const rtPop = gameUpdateSlice8318a0RtBandPop(
            runtimeInputs.opaque8318a0SfxGlobal798e4 ?? 0,
            runtimeInputs.opaque8318a0SfxGlobal79790 ?? 0,
            runtimeInputs.opaque8318a0SfxGlobal7978c ?? 0,
          );
          events.opaque008318a0RtBandPopFired =
            (events.opaque008318a0RtBandPopFired | 0) + 1;
          events.opaque008318a0RtBandPopDepthAfter = rtPop.depthAfter >>> 0;
          events.opaque008318a0RtBandPopLatchAfter = rtPop.latchAfter >>> 0;
          events.opaque008318a0RtBandPopParamsPack =
            gameUpdateSlice8318a0RtBandPopParamsPack(rtPop.params);
        }
      }
    }
    /* ABI v92: blob-gated empty-vector walk arm — count==0 makes the walk
       loop a pure skip (fatal log stays host); ready=0 keeps pre-v92. */
    emitWalkEmptySkip(runtimeInputs, events);
    events.opaqueCall0098dba0PlayerWalk = 1;
    events.frameOpaque98dba0Site = FRAME_OPAQUE_98DBA0_SITE.GATE;
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK;
    return { state, events };
  }
  if ((state.itemOverlayState | 0) === 0) {
    const promptActive = (state.genericPromptActiveObject | 0) !== 0 && (state.genericPromptActiveFlag | 0) !== 0;
    if (promptActive) {
      events.genericPromptUpdateCalls = 1;
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE;
    } else if ((state.skipTimedTransitionFlag | 0) !== 0) {
      events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL;
    } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION;
    return { state, events };
  }
  if ((state.menuState23a74 | 0) === 0 || (runtimeInputs.globalRangeByteLength | 0) !== 0) {
    if ((state.itemOverlayState | 0) === 1) {
      const wrapped = ((state.itemOverlayCounter11d1d0 | 0) - 1) | 0;
      state.itemOverlayCounter11d1d0 = wrapped;
      if (wrapped > 0) events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION;
      else {
        state.itemOverlayState = 2;
        events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE;
      }
    } else {
      events.itemOverlayUpdateCalls = 1;
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE;
    }
  } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION;
  return { state, events };
}

export function resumeGameUpdateGate1b83c(inputState = {}, inputEvents = {}) {
  const state = { ...emptyState(), ...inputState };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_GATE_1B83C_UPDATES) return { state, events };
  if ((state.gate1b83c | 0) !== 0 && (state.predicate1ba74 | 0) !== 0) {
    state.counter265c0 = 0;
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GATE_1B83C;
  } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL;
  return { state, events };
}
export const resumeGameUpdate92f1c0 = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_92F1C0,
  (state, runtimeInputs, events) => {
    maybeEmitHudPostUpdate(state, runtimeInputs, events);
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GATE_1BA78;
  },
);
export function resumeGameUpdateGenericPrompt(inputState = {}, inputEvents = {}) {
  const state = { ...emptyState(), ...inputState };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE) return { state, events };
  if ((state.genericPromptPostUpdateFlag | 0) === 0 && (state.genericPromptSubmittedSelection | 0) === 1) {
    const transitionStep = f32FromBits(kTransitionStepBits);
    state.transitionRate = transitionStep;
    state.transitionMode = 7;
    state.transitionColorRBits = 0;
    state.transitionColorGBits = 0;
    state.transitionColorBBits = 0;
    state.transitionAuxBits = 0;
    state.transitionProgress = Math.fround(Math.fround(state.transitionProgress) + transitionStep);
    events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_GENERIC_PROMPT_TRANSITION;
  } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL;
  return { state, events };
}
export const resumeGameUpdateItemOverlay = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ITEM_OVERLAY_UPDATE,
  (state, runtimeInputs, events) => {
    if ((state.itemOverlayState | 0) === 2) {
      maybeEmitHudPostUpdate(state, runtimeInputs, events);
      if ((state.menuState23a74 | 0) !== 0) {
        if (isaacMenuGateUpdateNeedsHost(state.menuState23a74, state.gate1b83c, state.predicate1ba74) !== 0) {
          events.opaqueCall009b6840 = (events.opaqueCall009b6840 | 0) + 1;
          /* ABI v95 (record idx 2 body): A2 mode-latch store law mirror. */
          if (gameUpdateSlice9b6840ModeLatchNeeded(state.status22ed4 | 0) !== 0) {
            state.status22ed4 = 1;
            state.status22edc = 2;
          }
        }
        events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_ITEM_OVERLAY_MENU;
      } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_COMMON_TAIL;
    } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION;
  },
);
export const continueGameUpdateTimedTransition = resume3(
  UPDATE_CONTINUATION.CONTINUE_AT_TIMED_TRANSITION,
  (state, runtimeInputs, events) => {
    if (Math.fround(state.timedTransitionProgress) > 0) {
      let hold = false;
      if ((runtimeInputs.globalRangeByteLength | 0) === 0 && (state.timedTransitionForceFinish | 0) === 0) {
        const elapsed = scaleMonotonicCounter(
          runtimeInputs.monotonicCounterLow >>> 0, runtimeInputs.monotonicCounterHigh >>> 0,
        ) - ((BigInt(runtimeInputs.monotonicBaselineHigh >>> 0) << 32n) | BigInt(runtimeInputs.monotonicBaselineLow >>> 0));
        hold = elapsed <= 3000n;
      }
      if (!hold) {
        state.timedTransitionProgress = Math.fround(Math.fround(state.timedTransitionProgress) - Math.fround(state.transitionRate));
        state.status22ed4 = 2;
        state.status22edc = 2;
        if (Math.fround(state.timedTransitionProgress) <= 0 || (state.timedTransitionForceFinish | 0) !== 0) {
          state.timedTransitionForceFinish = 0;
          state.timedTransitionProgress = 0;
          if ((state.timedTransitionCleanupMode | 0) < 2) {
            events.opaqueCall00746560 = 1;
            recordHostFun746560(state, events, HOST_FUN_746560_SITE.TIMED_CLEANUP, 0,
              state.timedTransitionCleanupMode | 0, runtimeInputs.hostFun746560PostReady >>> 0);
            const flagReady = runtimeInputs.playerFlag410Ready | 0;
            const flagCount = runtimeInputs.playerFlag410Count | 0;
            if (flagReady === 0 || flagCount < 0 || flagCount > ENGINE_PLAYER_MAX) {
              events.opaqueCall009bea10 = 1;
            } else playerFlag410Broadcast(1, flagCount);
          }
          events.opaqueCall0040c7f0 = 2;
        }
      }
    }
    if (Math.fround(state.timedTransitionProgress) > 0) {
      maybeEmitHudPostUpdate(state, runtimeInputs, events);
      events.continuationKind = UPDATE_CONTINUATION.RETURN_AFTER_TIMED_TRANSITION_HUD;
    } else events.continuationKind = UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION;
  },
);
export const continueGameUpdateMenuGates = resume3(
  UPDATE_CONTINUATION.CONTINUE_AFTER_TIMED_TRANSITION,
  (state, runtimeInputs, events) => {
    if (((runtimeInputs.globalMenuGuard4b3ca >>> 0) & 0xff) === 0
      && ((runtimeInputs.globalMenuEnable2a3a5 >>> 0) & 0xff) !== 0
      && (runtimeInputs.globalRangeByteLength | 0) === 0
      && (state.menuState23a74 | 0) === 0) {
      events.opaqueCall009b7680 = (events.opaqueCall009b7680 | 0) + 1;
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN;
    } else continueAfterMenuOpen(state, runtimeInputs, events);
  },
);
export const resumeGameUpdateMenuOpen = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN,
  (state, runtimeInputs, events) => continueAfterMenuOpen(state, runtimeInputs, events),
);
export const resumeGameUpdateMenuUpdate = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE,
  (state, runtimeInputs, events) => continueAfterMenuUpdate(state, runtimeInputs, events, true),
);
export const resumeGameUpdate98dba0PlayerWalk = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_98DBA0_PLAYER_WALK,
  (state, runtimeInputs, events) => {
    apply98dba0AfterPlayerWalk(state, runtimeInputs, events);
    /* ABI v95 (record idx 32): publish the 956110 probe pure-decision proof. */
    emit98dba0956110Pure(runtimeInputs, events);
    /* ABI v95 (record idx 5/32): entity-surface accept pure-proof (the
       virtual [[entry+0x370]+0x14] dispatch stays typed-host). */
    emitEntitySurfaceAcceptPure(runtimeInputs, events);
    if ((events.frameOpaque98dba0Site | 0) === FRAME_OPAQUE_98DBA0_SITE.GATE) {
      maybeEmitHudPostUpdate(state, runtimeInputs, events);
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_GATE_1B83C_UPDATES;
    } else {
      applyFrameOpaque4212c0Pure(state, runtimeInputs, events);
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES;
    }
  },
);
export function resumeGameUpdateFrameAuxUpdates(a = {}, b = {}, c = {}, d) {
  let stateIn = a, constants = {}, runtimeInputs = {}, eventsIn = {};
  if (arguments.length >= 4) {
    constants = b ?? {}; eventsIn = c ?? {}; runtimeInputs = d ?? {};
  } else if (b && typeof b === "object" && Object.prototype.hasOwnProperty.call(b, "continuationKind") && c) {
    eventsIn = b; runtimeInputs = c ?? {};
  } else {
    runtimeInputs = b ?? {}; eventsIn = c ?? {};
  }
  const state = { ...emptyState(), ...stateIn };
  const events = { ...emptyEvents(), ...eventsIn };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_FRAME_AUX_UPDATES) return { state, events };
  if ((state.effectCounter67788 | 0) > 0) {
    state.effectCounter67788 = wrapIncrementI32(state.effectCounter67788 | 0);
    state.positionResetTimer = ((state.effectCounter67788 | 0) / 6 + 2) | 0;
    if ((state.effectCounter67788 | 0) >= 90) {
      state.positionResetTimer = 0;
      state.effectCounter67788 = 0;
      state.positionXBits = constants.resetPositionXBits >>> 0;
      state.positionYBits = constants.resetPositionYBits >>> 0;
      events.opaqueCall006fdc10 = (events.opaqueCall006fdc10 | 0) + 1;
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_STAGE_TRANSITION_EFFECT;
      return { state, events };
    }
  }
  continueAfterStageTransitionEffect(state, events, runtimeInputs);
  return { state, events };
}
export function resumeGameUpdateStageTransitionEffect(inputState = {}, inputEvents = {}, inputRuntimeInputs = {}) {
  const state = { ...emptyState(), ...inputState };
  const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_STAGE_TRANSITION_EFFECT) return { state, events };
  continueAfterStageTransitionEffect(state, events, runtimeInputs);
  return { state, events };
}
/* ---- ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): pre-call
   decision laws of the record-22 player-loop body (FUN_0082ee40, PE
   0x0082f049..0x0082f084; census update-v95-82ee40-body-entry/NOTES.md).
   Mirror the cpp exports branch-by-branch; the 0x7abcc0/0x7abe20 BODIES
   (Rewind 0x40a1b0 / ANM2::Reset 0x407f10 heap zeros, unconditional stores
   [entry+0x139a]/[entry+0x14c]/[entry+0x1398], Sprite::Play 0x40a5d0, the
   0x956780/0x92dc30 SFX leg) stay typed-host (entry objects outside the
   capture ABI). All params travel un-narrowed; the byte-0x173 gate is
   re-narrowed with & 0xff. */

/** PE 0x0082f049 cmp dword [esi+0x2c],0 / jne skip — FULL-DWORD. */
export function gameUpdateSlice82ee40BodyEligible(entry2c) {
  return (entry2c >>> 0) === 0 ? 1 : 0;
}

/** FUN_0082eb90 membership {3, 0xc, 0xd, 0xb} — four FULL-DWORD equalities,
    consumed BY REFERENCE from the RTE family oracle (the v2 source of
    truth; WIDE 0x1000003 must NOT match the 3 arm). */
export function gameUpdateSlice82ee40BodyPredicate(field1c) {
  return roomTransitionEngine82eb90Predicate(field1c | 0);
}

/** PE 0x82f056 test al,al / je + 0x82f05a cmp byte [esi+0x173],0 / jne —
    byte gate. */
export function gameUpdateSlice82ee40Body7abcc0Needed(predicate, entry173Byte) {
  if ((predicate | 0) !== 0 && ((entry173Byte >>> 0) & 0xff) === 0) return 1;
  return 0;
}

/** PE 0x82f063 cmp dword [ebx+0x10],0xb / setne / movzx — FULL-DWORD. */
export function gameUpdateSlice82ee40Body7abcc0Arg(anim) {
  return (anim >>> 0) !== 0xb ? 1 : 0;
}

/** PE 0x82f058 je + 0x82f061 jne converge at 0x82f077 `cmp dword
    [edi+0x1c],0x14 / jne` — fires iff !(pred && byte173==0) && field_1c
    == 0x14 (FULL-DWORD; WIDE 0x114 must NOT fire). */
export function gameUpdateSlice82ee40Body7abe20Needed(field1c, predicate, entry173Byte) {
  if ((predicate | 0) !== 0 && ((entry173Byte >>> 0) & 0xff) === 0) return 0;
  return (field1c >>> 0) === 0x14 ? 1 : 0;
}

/** Composed per-entry plan: `eligible` is the BOOLEAN gate the caller
    already derived from the raw [entry+0x2c] word (0/1 — see
    BodyEligible for the raw-word decision; the cpp export treats the
    parameter the same way, so callers pre-gate). ANY nonzero enters. */
export function gameUpdateSlice82ee40BodyEntryPlan({ eligible = 0, predicate = 0, entry173Byte = 0, field1c = 0, anim = 0 } = {}) {
  const isEligible = (eligible | 0) !== 0 ? 1 : 0;
  const call7abcc0 = isEligible !== 0
    ? gameUpdateSlice82ee40Body7abcc0Needed(predicate, entry173Byte) : 0;
  const call7abe20 = isEligible !== 0
    ? gameUpdateSlice82ee40Body7abe20Needed(field1c, predicate, entry173Byte) : 0;
  const anyHost = isEligible !== 0 && (call7abcc0 !== 0 || call7abe20 !== 0) ? 1 : 0;
  return Object.freeze({
    call7abcc0,
    arg7abcc0: isEligible !== 0 ? gameUpdateSlice82ee40Body7abcc0Arg(anim) : 0,
    call7abe20,
    anyHost,
    gameReread: anyHost,
  });
}

export const resumeGameUpdateEnginePrefix = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ENGINE_PREFIX,
  (state, runtimeInputs, events) => {
    const siteAnim = events.engineSiteAnim | 0;
    if (roomTransitionEngine82ee40EarlySkipSetup(state.gate1ba78 | 0, siteAnim) === 0) {
      applyEngineSetupPure(state, runtimeInputs, siteAnim);
      const playerCount = runtimeInputs.enginePlayerCount | 0;
      if (playerCount > 0) {
        if ((runtimeInputs.enginePlayerBlobReady | 0) !== 0 && playerCount <= ENGINE_PLAYER_MAX) {
          /* ABI v95 (record idx 22): with the per-entry byte-0x173 lanes
             captured, decide PER ENTRY which host body fires (mirror of the
             cpp resume_engine_prefix; the coarse event fires only when some
             eligible entry needs a host call; typed counts published). */
          if ((runtimeInputs.enginePlayerEntry173Ready | 0) !== 0) {
            const field1c = state.engineField1c | 0;
            const predicate = gameUpdateSlice82ee40BodyPredicate(field1c >>> 0);
            let abcc0Calls = 0;
            let abe20Calls = 0;
            for (let i = 0; i < playerCount; i += 1) {
              if ((runtimeInputs.enginePlayerEligible?.[i] ?? 0) === 0) continue;
              const plan = gameUpdateSlice82ee40BodyEntryPlan({
                eligible: 1, predicate,
                entry173Byte: runtimeInputs.enginePlayerEntry173?.[i] ?? 0,
                field1c, anim: siteAnim,
              });
              abcc0Calls += plan.call7abcc0 | 0;
              abe20Calls += plan.call7abe20 | 0;
            }
            events.opaqueRoomTransitionEngineBody7abcc0Calls = abcc0Calls;
            events.opaqueRoomTransitionEngineBody7abe20Calls = abe20Calls;
            if (abcc0Calls !== 0 || abe20Calls !== 0) {
              events.opaqueRoomTransitionEngineBody = (events.opaqueRoomTransitionEngineBody | 0) + 1;
            }
          } else if (roomTransitionEnginePlayerLoopNeedsHost(state.engineField1c | 0) !== 0) {
            events.opaqueRoomTransitionEngineBody = (events.opaqueRoomTransitionEngineBody | 0) + 1;
          }
        } else events.opaqueRoomTransitionEngineBody = (events.opaqueRoomTransitionEngineBody | 0) + 1;
      }
    }
    events.continuationKind = siteAnim === 20
      ? UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT
      : UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED;
  },
);
export function resumeGameUpdateRoomTransitionEffect(inputState = {}, inputEvents = {}, inputRuntimeInputs = {}) {
  const state = { ...emptyState(), ...inputState };
  const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_ROOM_TRANSITION_EFFECT) return { state, events };
  applyFrameEffect6fd7c0PureAfterHost(state, runtimeInputs, 20);
  continueToFrameManagerUpdates(state, runtimeInputs, events);
  return { state, events };
}
export function resumeGameUpdateRoomUpdatePrefixB1(inputState = {}, inputEvents = {}, inputRuntimeInputs = {}) {
  const state = { ...emptyState(), ...inputState };
  const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) return { state, events };
  /* ABI v95 (record idx 14): on the ready path the B2 resume owns the whole
     item-pool/spawn special body in-module (laws + typed leaves), so the
     parent counter opaqueRoomUpdatePrefixB2 must NOT fire; ready=0 keeps
     the pre-v95 monolithic host residual (parent counter +1). */
  if ((runtimeInputs.b2PoolReady | 0) === 0) {
    events.opaqueRoomUpdatePrefixB2 = (events.opaqueRoomUpdatePrefixB2 | 0) + 1;
  }
  events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2;
  return { state, events };
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2): item-pool/spawn
   special + set-to-60 pure laws (PE 0x00802e20..0x00803321; census
   section-notes update-v95-14-prefix-b2-pool). JS mirrors of the
   isaac_game_update_slice_b2_* exports; each is transcribed branch-by-
   branch from the instruction stream (cpu-dump 00802e20/0080311d/
   0049cbf0/007e90f0). */
/* ------------------------------------------------------------------ */

export const B2_POOL_COUNT = 31;
export const B2_SPAWN_MAX_ELEMS = 64;
export const B2_SET_TO_60 = 0x3c;
export const B2_SPECIAL_GAME_18304 = 0xfffffff4;
export const B2_PICK_NONE = 0xffffffff;
export const B2_POS_STRIDE_X = 40;   /* DAT_00baa904 = 40.0f */
export const B2_POS_STRIDE_Y = 120;  /* DAT_00baaa00 = 120.0f */
export const B2_PICK_SHIFT_1 = 5;
export const B2_PICK_SHIFT_2 = 9;
export const B2_PICK_SHIFT_3 = 7;

/* PE 0x802e2b..0x802e40: special body opens only on timer==0 &&
   game18304==0xfffffff4 (FULL-DWORD; WIDE 0x10000004 must NOT open). */
export function gameUpdateSliceB2PoolSpecialGate(timer7764, game18304) {
  return ((timer7764 >>> 0) === 0 && (game18304 >>> 0) === B2_SPECIAL_GAME_18304) ? 1 : 0;
}

/* PE 0x802e60 cmp ecx,0x26e / jg skip (SIGNED): the 0xa112c0 log fires
   when count <= 622 (count = (end-begin) SAR 4). */
export function gameUpdateSliceB2CollectibleBoundsLogNeeded(count) {
  return (count | 0) <= 0x26e ? 1 : 0;
}

/* PE 0x802e8d..0x802e9b: off = min_u((u32)(count-1), 0x26e) * 0x10. */
export function gameUpdateSliceB2LastCollectibleOffset(count) {
  const cm1 = (count - 1) >>> 0;
  const off = cm1 < 0x26e ? cm1 : 0x26e;
  return (off * 0x10) >>> 0;
}

/* PE 0x7e910f..0x7e912a + 0x8031db..0x803209: 3-round xorshift, shifts
   masked to 5 bits (x86 shr/shl cl), u32 wrap. */
export function gameUpdateSliceB2RngXorshift(seed, s1, s2, s3) {
  let v = seed >>> 0;
  v ^= v >>> (s1 & 0x1f);
  v = v >>> 0;
  v ^= (v << (s2 & 0x1f)) >>> 0;
  v = v >>> 0;
  v ^= v >>> (s3 & 0x1f);
  return v >>> 0;
}

/* PE 0x7e90f5 / 0x8031c1 test edx,edx: seed==0 fires the 0xb6bf54 log
   before the advance (FULL-DWORD test). */
export function gameUpdateSliceB2RngZeroLogNeeded(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}

/* PE 0x802ef7..0x802f73: per pool id 0..30, w = (i16)counts[id] (SIGNED
   gate > 0, 0x8000 skips); linear-search the {id, weight} list; found ->
   weight += w, if ((i32)result < 0) weight = 0; else append {id, w}.
   Returns { n, ids, weights } (n == 0 <=> any == 0). */
export function gameUpdateSliceB2PoolAggregate(counts = []) {
  const ids = [];
  const weights = [];
  for (let id = 0; id < B2_POOL_COUNT; id += 1) {
    const raw = (counts[id] ?? 0) & 0xffff;
    const w = raw << 16 >> 16; /* i16 */
    if (w <= 0) continue;
    let j = ids.indexOf(id);
    if (j >= 0) {
      const nw = (weights[j] + w) | 0;
      weights[j] = nw < 0 ? 0 : nw;
    } else {
      ids.push(id);
      weights.push(w);
    }
  }
  return { n: ids.length, ids, weights };
}

/* FUN_0049cbf0: total = SUM weights mod 2^32; draw = total ?
   xorshift(seed1,5,9,7) % total : 0 (u32 div); walk cum (i32 wrap) with
   SIGNED (i32)draw < (i32)cum -> return ids[i]; none -> 0 (total==0 also
   the 0xb1e650 fatal; the caller sees picked 0 + b2FatalPickEmpty). */
export function gameUpdateSliceB2PoolPick(seed1, ids = [], weights = [], n = 0) {
  let total = 0;
  for (let i = 0; i < n; i += 1) total = (total + (weights[i] | 0)) >>> 0;
  let draw = 0;
  if (total !== 0) {
    const drawSeed = gameUpdateSliceB2RngXorshift(seed1, B2_PICK_SHIFT_1, B2_PICK_SHIFT_2, B2_PICK_SHIFT_3);
    draw = drawSeed % total;
  }
  let cum = 0;
  for (let i = 0; i < n; i += 1) {
    cum = (cum + (weights[i] | 0)) | 0;
    if ((draw | 0) < cum) return { picked: ids[i] | 0, total: total | 0 };
  }
  return { picked: 0, total: total | 0 };
}

/* PE 0x803080 dec word: u16 wrap (0 -> 0xffff). */
export function gameUpdateSliceB2PoolCountDecWord(countWord) {
  return ((countWord >>> 0) - 1) & 0xffff;
}

/* PE 0x803130..0x803156: byte[+8]==1 && FULL-DWORD [+4]==5 &&
   word[+4+4]==100 && word[+4+6]==0. */
export function gameUpdateSliceB2SpawnQualify(flag8, d4, w4_4, w4_6) {
  return (((flag8 >>> 0) & 0xff) === 1 && (d4 >>> 0) === 5 &&
          ((w4_4 >>> 0) & 0xffff) === 100 && ((w4_6 >>> 0) & 0xffff) === 0) ? 1 : 0;
}

/* PE 0x80315c..0x803177: grid = (i16)x + 1 + ((i16)y + 1) * width (u32). */
export function gameUpdateSliceB2SpawnGridIndex(xS16, yS16, width) {
  const x = xS16 << 16 >> 16;
  const y = yS16 << 16 >> 16;
  return (((x + 1) + (y + 1) * (width | 0)) >>> 0);
}

function b2SignedDivRem(index, width) {
  /* x86 idiv trunc-toward-zero; int64 math avoids JS double precision loss
     near 2^31; width==-1 is the x86 #DE case (documented, never on the
     wire). */
  const q = Math.trunc(index / width);
  return index - q * width;
}
function b2SignedDivQuot(index, width) {
  return Math.trunc(index / width);
}

/* PE 0x803179..0x8031b9: SIGNED idiv -> f32 x = rem*40+40 (f32 rounding at
   each op: cvtdq2ps / mulss / addss). Returns float bits. */
export function gameUpdateSliceB2PosX(index, width) {
  const rem = b2SignedDivRem(index | 0, width | 0);
  const v = Math.fround(Math.fround(Math.fround(rem) * 40) + 40);
  return bitsFromF32(v);
}
export function gameUpdateSliceB2PosY(index, width) {
  const quot = b2SignedDivQuot(index | 0, width | 0);
  const v = Math.fround(Math.fround(Math.fround(quot) * 40) + 120);
  return bitsFromF32(v);
}

/* PE 0x8032b2..0x8032cb: byte Room+0 != 0 (BYTE) && (i32)(frame-entry) > 4
   (SIGNED jle). */
export function gameUpdateSliceB2Spawn2Gate(roomActiveByte, frame264f8, roomEntry11f0) {
  if (((roomActiveByte >>> 0) & 0xff) === 0) return 0;
  return (((frame264f8 | 0) - (roomEntry11f0 | 0)) > 4) ? 1 : 0;
}

export const resumeGameUpdateRoomUpdatePrefixB2 = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX_B2,
  (state, runtimeInputs, events) => {
    /* ABI v95 (record idx 14): item-pool/spawn special + set-to-60 body
       IN-MODULE when b2PoolReady (the B1 resume already skipped the parent
       counter). Mirrors the C++ resume_room_update_prefix_b2: gate ->
       count-bounds fatal -> seed1 advance -> aggregate -> pure pick ->
       count-dec carrier -> set-to-60 terminal -> spawn-loop plan laws.
       ready=0 -> pre-v95 monolithic (parent counter from B1). */
    if ((runtimeInputs.b2PoolReady | 0) !== 0) {
      const timer = state.roomCollectibleTimer7764 | 0;
      if (gameUpdateSliceB2PoolSpecialGate(
            timer >>> 0, runtimeInputs.b2PoolGate18304 >>> 0) !== 0) {
        events.b2SpecialGateOpen = 1;
        if (gameUpdateSliceB2CollectibleBoundsLogNeeded(
              runtimeInputs.b2PlayerColCount | 0) !== 0) {
          events.b2FatalCollectibleBounds = 1;
        }
        let seed = runtimeInputs.b2PoolSeed0 >>> 0;
        if (gameUpdateSliceB2RngZeroLogNeeded(seed) !== 0) {
          events.b2FatalRngZero = (events.b2FatalRngZero | 0) + 1;
        }
        seed = gameUpdateSliceB2RngXorshift(
          seed, runtimeInputs.b2PoolSeed1 >>> 0,
          runtimeInputs.b2PoolSeed2 >>> 0, runtimeInputs.b2PoolSeed3 >>> 0);
        events.b2SpawnSeed1 = seed;
        const agg = gameUpdateSliceB2PoolAggregate(runtimeInputs.b2PoolCounts ?? []);
        if (agg.n === 0) {
          /* any==0 -> SET-60 (PE 0x802fe9); next resume decs 60 -> 59. */
          state.roomCollectibleTimer7764 = B2_SET_TO_60;
          events.b2PickPool = B2_PICK_NONE;
        } else {
          const pick = gameUpdateSliceB2PoolPick(seed, agg.ids, agg.weights, agg.n);
          if ((pick.total | 0) === 0) events.b2FatalPickEmpty = 1;
          events.b2PickPool = pick.picked;
          if (pick.picked === B2_PICK_NONE) {
            state.roomCollectibleTimer7764 = B2_SET_TO_60;
          } else {
            /* Spawn loop (PE 0x803122..0x803320). */
            const elemCount = runtimeInputs.b2SpawnCount | 0;
            const cap = Math.min(elemCount, B2_SPAWN_MAX_ELEMS);
            const inElems = runtimeInputs.b2SpawnIn ?? [];
            let planCount = 0;
            for (let i = 0; i < cap; i += 1) {
              const e = inElems[i] || {};
              if (gameUpdateSliceB2SpawnQualify(
                    e.flag8 ?? 0, e.d4 ?? 0, e.w44 ?? 0, e.w46 ?? 0) === 0) {
                continue;
              }
              const grid = gameUpdateSliceB2SpawnGridIndex(
                (e.x ?? 0) & 0xffff, (e.y ?? 0) & 0xffff,
                runtimeInputs.b2GridWidth >>> 0);
              if (gameUpdateSliceB2RngZeroLogNeeded(seed) !== 0) {
                events.b2FatalRngZero = (events.b2FatalRngZero | 0) + 1;
              }
              seed = gameUpdateSliceB2RngXorshift(
                seed, runtimeInputs.b2PoolSeed1 >>> 0,
                runtimeInputs.b2PoolSeed2 >>> 0,
                runtimeInputs.b2PoolSeed3 >>> 0);
              const xBits = gameUpdateSliceB2PosX(
                grid, runtimeInputs.b2GridWidth >>> 0);
              const yBits = gameUpdateSliceB2PosY(
                grid, runtimeInputs.b2GridWidth >>> 0);
              const spawn2 = gameUpdateSliceB2Spawn2Gate(
                runtimeInputs.ambientRoomActive | 0,
                state.frameCounter264f8 | 0,
                runtimeInputs.ambientRoomEntry11f0 | 0);
              planCount += 1;
            }
            events.b2SpawnPlanCount = planCount;
          }
        }
        events.b2SeedAfter = seed;
      }
    }
    if ((runtimeInputs.b3b7SparseReady | 0) === 0) {
      /* Pre-v95 monolithic: the host runs the whole B3-B7 residual. */
      const b3b7 = roomB3B7WireDecide({
        sparseReady: 0,
        teByte7321: runtimeInputs.b3b7TeByte7321 | 0,
        teBegin: runtimeInputs.b3b7TeBegin | 0,
        teEnd: runtimeInputs.b3b7TeEnd | 0,
        descType0: runtimeInputs.b3b7DescType0 | 0,
        roomActiveByte0: runtimeInputs.ambientRoomActive | 0,
        frame264f8: state.frameCounter264f8 | 0,
        entry11f0: runtimeInputs.ambientRoomEntry11f0 | 0,
        treeCount7238: runtimeInputs.b3b7TreeCount7238 | 0,
        widthC: runtimeInputs.b3b7WidthC | 0,
        height10: runtimeInputs.b3b7Height10 | 0,
      });
      if ((b3b7.pureComplete | 0) === 0 && (b3b7.hostNeeded | 0) !== 0) {
        events.opaqueRoomUpdatePrefixB3B7 = (events.opaqueRoomUpdatePrefixB3B7 | 0) + 1;
      }
    } else {
      /* ABI v95 (record idx 15): typed-host B3-B7. The decision laws run
         in-module; each plan counter names one host leaf body. */
      const b3b7 = gameUpdateSliceB3b7WireDecide(
        runtimeInputs, state.frameCounter264f8 | 0);
      events.b3b7HostFco = (events.b3b7HostFco | 0) + (b3b7.b3HostFco | 0);
      events.b3b7HostChallenge = (events.b3b7HostChallenge | 0) + (b3b7.b3HostChallenge | 0);
      events.b3b7HostTeCall = (events.b3b7HostTeCall | 0) + (b3b7.b3HostTeCall | 0);
      events.b4HostLookup = (events.b4HostLookup | 0) + (b3b7.b4HostLookup | 0);
      events.b4HostPosA = (events.b4HostPosA | 0) + (b3b7.b4HostPosA | 0);
      events.b4HostPosFinish = (events.b4HostPosFinish | 0) + (b3b7.b4HostPosFinish | 0);
      events.b4GenrandDraws = (events.b4GenrandDraws | 0) + (b3b7.b4GenrandDraws | 0);
      events.b4HostSpawns = (events.b4HostSpawns | 0) + (b3b7.b4HostSpawns | 0);
      events.b4HostCleanup = (events.b4HostCleanup | 0) + (b3b7.b4HostCleanup | 0);
      events.b4SeedFatal = (events.b4SeedFatal | 0) + (b3b7.b4SeedFatal | 0);
      events.b5HostCount708250 = (events.b5HostCount708250 | 0) + (b3b7.b5HostCount708250 | 0);
      events.b5HostVcall48 = (events.b5HostVcall48 | 0) + (b3b7.b5HostVcall48 | 0);
      events.b5HostGrow = (events.b5HostGrow | 0) + (b3b7.b5HostGrow | 0);
      events.b5HostVcall4c = (events.b5HostVcall4c | 0) + (b3b7.b5HostVcall4c | 0);
      events.b5SeedFatal = (events.b5SeedFatal | 0) + (b3b7.b5SeedFatal | 0);
      events.b6HostDestroy = (events.b6HostDestroy | 0) + (b3b7.b6HostDestroy | 0);
      events.b6HostIterate = (events.b6HostIterate | 0) + (b3b7.b6HostIterate | 0);
      events.b6HostClear = (events.b6HostClear | 0) + (b3b7.b6HostClear | 0);
      events.b7HostUpdate = (events.b7HostUpdate | 0) + (b3b7.b7HostUpdate | 0);
    }
    const gridCells = runtimeInputs.roomGridCells | 0;
    if (roomB8NeedsPathCostHost(state.frameCounter264f8 | 0, gridCells) !== 0) {
      if ((runtimeInputs.roomB8BlobReady | 0) !== 0 && gridCells > 0 && gridCells <= ROOM_B8_MAX_CELLS) {
        /* ABI v95 (record idx 16): blob path. The pure grid step
           (roomB8PathCostGridStep over the captured k-blob — costs int32 /
           trails int16 in the exported scratch) REPLACES the host over the
           live Room+0x76c/+0xe6c grids; NO host residual is emitted. The
           scratch is not part of state/events, so the model mirrors the
           decision only; the verifier runs the same room oracle over the
           seeded scratch and compares cell-for-cell (hudStatWalk pattern). */
      } else events.opaqueRoomUpdatePrefixB8 = (events.opaqueRoomUpdatePrefixB8 | 0) + 1;
    }
    const b9 = roomB9B11WireDecide((runtimeInputs.b9b11InputsReady | 0) !== 0 ? 1 : 0, {
      challengeResultNonzero: runtimeInputs.b9b11ChallengeResultNonzero | 0,
      roomActiveByte0: runtimeInputs.ambientRoomActive | 0,
      frame264f8: state.frameCounter264f8 | 0,
      roomEntry11f0: runtimeInputs.ambientRoomEntry11f0 | 0,
      roomType8: state.roomType8 | 0,
      roomDescFlags44: state.roomDescFlags44 | 0,
      globalClearSkip997a: runtimeInputs.globalClearSkip997a | 0,
      roomByte11f4: runtimeInputs.b9b11RoomByte11f4 | 0,
      bossCount12c8: state.roomBossCount12c8 | 0,
      bossCount12cc: state.roomBossCount12cc | 0,
      bossSnapshot7224: state.roomBossSnapshot7224 | 0,
      roomByte1d0d: runtimeInputs.b9b11RoomByte1d0d | 0,
      ambientRoom1d18: runtimeInputs.ambientRoom1d18 | 0,
      roomByte7321: runtimeInputs.b9b11RoomByte7321 | 0,
      listBegin7314: runtimeInputs.b9b11ListBegin7314 | 0,
      listEnd7318: runtimeInputs.b9b11ListEnd7318 | 0,
    });
    if ((b9.pureComplete | 0) === 0 && (b9.hostNeeded | 0) !== 0) {
      events.opaqueRoomUpdatePrefixB9B11 = (events.opaqueRoomUpdatePrefixB9B11 | 0) + 1;
      /* ABI v95 (record idx 17): typed-host bodies (mirror of the cpp wire).
         ready=0 keeps the v48 monolithic parent counter only. */
      if ((runtimeInputs.b9b11InputsReady | 0) !== 0) {
        if (gameUpdateSliceB9b11ChallengeGate(
          runtimeInputs.b9b11ChallengeResultNonzero | 0,
          runtimeInputs.ambientRoomActive | 0,
          state.frameCounter264f8 | 0,
          runtimeInputs.ambientRoomEntry11f0 | 0,
          state.roomType8 | 0,
          state.roomDescFlags44 | 0,
        ) !== 0) {
          events.opaqueRoomUpdatePrefixB9B11Free = (events.opaqueRoomUpdatePrefixB9B11Free | 0) + 1;
        }
        if (gameUpdateSliceB9b11ModeHooksNeeded(
          state.roomType8 | 0, runtimeInputs.globalClearSkip997a | 0,
        ) !== 0) {
          events.opaqueRoomUpdatePrefixB9B11ModeHooks = (events.opaqueRoomUpdatePrefixB9B11ModeHooks | 0) + 1;
        }
        if (gameUpdateSliceB9b11Flag11f4Needed(runtimeInputs.b9b11RoomByte11f4 | 0) !== 0) {
          events.opaqueRoomUpdatePrefixB9B11Flag11f4 = (events.opaqueRoomUpdatePrefixB9B11Flag11f4 | 0) + 1;
        }
        const enemies = gameUpdateSliceB9b11B10Enemies(
          state.roomBossCount12c8 | 0, state.roomBossCount12cc | 0);
        if (gameUpdateSliceB9b11B10FatalNeeded(enemies, state.roomBossSnapshot7224 | 0) !== 0) {
          events.opaqueRoomUpdatePrefixB9B11B10Fatal = (events.opaqueRoomUpdatePrefixB9B11B10Fatal | 0) + 1;
        }
        /* B11 always-host chain: unconditional on the ready arm. */
        events.opaqueRoomUpdatePrefixB9B11Manager = (events.opaqueRoomUpdatePrefixB9B11Manager | 0) + 1;
        if (gameUpdateSliceB9b11TempfxFlagClear(runtimeInputs.b9b11RoomByte7321 | 0) !== 0 &&
            gameUpdateSliceB9b11TempfxListEmpty(
              runtimeInputs.b9b11ListBegin7314 | 0,
              runtimeInputs.b9b11ListEnd7318 | 0,
            ) === 0) {
          events.opaqueRoomUpdatePrefixB9B11Camera = (events.opaqueRoomUpdatePrefixB9B11Camera | 0) + 1;
        }
      }
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX;
  },
);

export const resumeGameUpdateRoomUpdatePrefix = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_PREFIX,
  (state, runtimeInputs, events) => {
    state.roomCollectibleTimer7764 = roomCountdownDecIfNonnegative(state.roomCollectibleTimer7764 | 0);
    state.roomWaterLerpCountdown7298 = roomCountdownDecIfPositive(state.roomWaterLerpCountdown7298 | 0);
    state.roomBossSnapshot7224 = roomBossCountSnapshot(state.roomBossCount12c8 | 0, state.roomBossCount12cc | 0);
    let alive = ((state.roomAlive12c0 | 0) + (state.roomAlive12c4 | 0)) | 0;
    if (alive < 0) alive = 0;
    const skip = (runtimeInputs.globalClearSkip997a >>> 0) & 0xff;
    const delay = roomClearDelayStep({
      aliveA: state.roomAlive12c0 | 0, aliveB: state.roomAlive12c4 | 0,
      roomClearDelay: state.roomClearDelay11ec | 0, greedWaveTimer: state.roomGreedWave723c | 0,
      roomType: state.roomType8 | 0, roomSubtype: state.roomDescSubtype | 0,
      enemiesPresent: (alive > 0 || skip !== 0) ? 1 : 0,
    });
    state.roomClearDelay11ec = delay.roomClearDelay | 0;
    const clearSide = (skip === 0 && alive < 1 && (delay.greedWaveTimer | 0) < 1 && (state.roomClearDelay11ec | 0) < 1) ? 1 : 0;
    let clearPathDoorSlotsEmitted = 0;
    if (clearSide !== 0 && ((state.roomDescFlags44 >>> 0) & 1) === 0) {
      events.roomTriggerOutput = (events.roomTriggerOutput | 0) + 1;
      /* ABI v95 (record idx 18 roomTriggerOutput 0x00823080): BODY pure
         wire — names only, coordinator pins offsets (section-notes
         update-v95-18-trigger-output §Layout). arg = the clear-side
         immediate 9 (PE 0x80416c push 9; caller census: 0x80207e arg0 /
         0x804170 arg9 / 0x985957 arg0..3). All three phases must be
         capturable; otherwise the monolith keeps the residual. */
      const trWalk = roomTriggerOutputWalkFromRuntime(runtimeInputs);
      const trScan = roomTriggerOutputScanFromRuntime(runtimeInputs);
      const trCbReady = runtimeInputs.triggerOutputCallbackReady | 0;
      if (trWalk.ready !== 0 && trScan.ready !== 0 && trCbReady !== 0) {
        const walk = gameUpdateSliceTriggerOutputWalk(trWalk.head, trWalk.nodes, trWalk.table);
        const scan = gameUpdateSliceTriggerOutputScan(ROOM_TRIGGER_OUTPUT_CLEAR_ARG, trScan.entries);
        const cbs = gameUpdateSliceTriggerOutputCallbacks(
          runtimeInputs.triggerOutputCallbackBegin >>> 0,
          runtimeInputs.triggerOutputCallbackEnd >>> 0);
        if (walk.valid !== 0 && scan.valid !== 0 && cbs >= 0) {
          events.roomTriggerOutputWalkDispatches = walk.dispatch >>> 0;
          events.roomTriggerOutputScanMatches = scan.match >>> 0;
          events.roomTriggerOutputCallbacks = cbs >>> 0;
        } else {
          events.opaqueRoomTriggerOutputBody = (events.opaqueRoomTriggerOutputBody | 0) + 1;
        }
      } else {
        events.opaqueRoomTriggerOutputBody = (events.opaqueRoomTriggerOutputBody | 0) + 1;
      }
    }
    if (clearSide !== 0) {
      if ((state.roomType8 | 0) === 0x10 && (state.roomDescSubtype | 0) === 3) {
        emitFrameEffect6fd7c0HostResiduals(state, events, 0, 0, -1, runtimeInputs, 0);
        return;
      }
      if (!((state.roomType8 | 0) === 0x10 && (state.roomDescSubtype | 0) === 2)) {
        /* Flag clear (PE 0x00804212..0x0080424d): gate open -> the machine
           clears bit 0 of the Manager per-player flag; gate closed -> pure
           skip, no event.
           ABI v115 (update-v115-clearpath-removal): the coarse edge is
           RETIRED — the residual is exactly ONE platform-class masked
           store ([0xc7169c] manager outside the Game buffer), carried by
           clearPathFlagStore @988 under the SAME pure gate law. No
           capture gate exists -> no capture-absence arm: the coarse
           counter @160 stays in the frozen ABI but NEVER fires. idx-24 /
           idx-33 arm off different conditions and keep their counters. */
        if (clearPathFlagGate(
              (runtimeInputs.clearPathGameMode0 ?? 0) >>> 0,
              state.flags2654c >>> 0) !== 0) {
          events.clearPathFlagStore = (events.clearPathFlagStore | 0) + 1;
        }
        const slots = doorSlotsFromRuntime(runtimeInputs);
        /* Record idx 24 (ABI v119, update-v119-door-removal): composed
           per-slot early-out decision — bit i set iff present slot i
           fails the FUN_00710dd0 early-out (needs host open). The mask
           event IS the typed carrier: nonzero iff the retired coarse
           edge armed (same expression, same tick, same order position);
           the coarse opaqueRoomUpdateClearDoorSlots @164 STAYS in the
           frozen ABI but NEVER fires. */
        const clearDoorSlotsFailingMask = doorSlots710dd0FailingMask(slots);
        if (clearDoorSlotsFailingMask !== 0) {
          events.opaqueRoomUpdateClearDoorSlotsMask = clearDoorSlotsFailingMask >>> 0;
          clearPathDoorSlotsEmitted = 1;
        }
        if (((state.roomDescFlags44 >>> 0) & 9) === 0) {
          const tc = roomTriggerClearEntry({
            roomDescFlags44: state.roomDescFlags44 | 0,
            roomDescClearCount4a: state.roomDescClearCount4a | 0,
          });
          if (tc && typeof tc === "object") {
            if ("roomDescFlags44" in tc) state.roomDescFlags44 = tc.roomDescFlags44 | 0;
            if ("roomDescClearCount4a" in tc) state.roomDescClearCount4a = tc.roomDescClearCount4a | 0;
          }
          /* ABI v95 (record idx 25): typed stats-residual carriers (mirror
             of the cpp wire). The guest-alloc vector growth 0x69ee50 fires
             tcsStatsGrowthCalls times; the record + append count prep the
             host's replay (vec = Game+0x266e4+0x5c, captured span
             tcsStatsVec*).
             ABI v125 (update-v125-tcs-stats-removal): record idx 25
             roomTriggerClearStats REMOVED (35 -> 34, 15th removal since
             v79) — the LIVE coarse edge is RETIRED under the
             tcsStatsVecReady voucher. The retired increment carried no
             information on capture-valid ticks: with capture present,
             gates closed is a PROVEN pure skip (PE 0x9e5970 clearCount==1
             FULL-DWORD else ret; 0x9e59ae comiss jbe — NaN closes) and
             gates open publishes the full residual via the typed carriers
             below (append count / growth calls / record dword+byte+float /
             tail add, in PE order). The guest-alloc 0x69ee50 growth stays
             the standing allocator platform leaf behind tcsStatsGrowthCalls
             (alloc-v5-frontier platform contract: malloc 0x40cf00 wrapper /
             memmove 0xaf08bd / free 0xaef15c; growth math already
             in-module). ready=0 keeps the pre-v95 monolithic edge
             byte-for-byte: coarse @168 STAYS in the frozen events ABI and
             fires ONLY on capture absence. */
          if ((runtimeInputs.tcsStatsVecReady | 0) !== 0) {
            const clearCount = (state.roomDescClearCount4a | 0) & 0xffff;
            const desc1048 = runtimeInputs.tcsStatsDesc10_48 | 0;
            const lookupBits = runtimeInputs.tcsStatsLookupBits | 0;
            if (gameUpdateSliceTcsStatsGate(clearCount) !== 0 &&
                gameUpdateSliceTcsStatsFloatGate(lookupBits) !== 0) {
              const count = gameUpdateSliceTcsStatsCount(desc1048);
              const sim = gameUpdateSliceTcsStatsGrowthSim(
                count,
                runtimeInputs.tcsStatsVecBegin | 0,
                runtimeInputs.tcsStatsVecEnd | 0,
                runtimeInputs.tcsStatsVecCap | 0,
              );
              events.tcsStatsAppendCount = (events.tcsStatsAppendCount | 0) + count;
              events.tcsStatsGrowthCalls = (events.tcsStatsGrowthCalls | 0) + (sim.growths | 0);
              events.tcsStatsRecordDword =
                gameUpdateSliceTcsStatsRecordDword(state.roomType8 | 0);
              events.tcsStatsRecordByte =
                gameUpdateSliceTcsStatsRecordByte(state.roomDescFlags44 | 0);
              events.tcsStatsRecordFloat = lookupBits >>> 0;
              events.tcsStatsTailAdd = (events.tcsStatsTailAdd | 0) +
                gameUpdateSliceTcsStatsTailAdd(
                  state.roomType8 | 0, runtimeInputs.tcsStatsGameByte8 | 0, count);
            }
          } else {
            /* ABI v125 capture-absence arm: ready=0 keeps the pre-v95
               monolithic residual byte-for-byte. */
            events.roomTriggerClearStats = (events.roomTriggerClearStats | 0) + 1;
          }
          /* ABI v133 (update-v133-audio-music-pack, record idx26
             roomTriggerClearAudioNonGreed): under the tca40TailPackReady
             voucher the spawn tail 0x7f7e34..0x7f817c runs IN-MODULE —
             rot/base once from the header lanes, then per-row item plans
             via the frozen room-pure ABI v81 laws consumed BY REFERENCE.
             The typed carrier roomTriggerClearAudioNonGreedTailSpawns =
             rows consumed; the host applies each plan-Out in PE order
             (spawn 0x428b20 type 0x3e8/variant 0x3b + [ent+0x474] f474 +
             [ent+0x45c/0x460] timers + [vtbl+0xc]). The cast thunk
             0x00af08b1 and the virtuals stay TYPED-HOST leaves. Capture
             absence / over-cap keeps the coarse @172 byte-for-byte. */
                    /* ABI v136 (update-v136-audio-head-pack, record idx26
             roomTriggerClearAwardsNonGreed REMOVED): FULL-CAPTURE theorem
             under the NEW tca40HeadPackReady voucher (@17696; 39 value rows
             + RanBits bitmap @17700..17852). With head+tail packs both
             capture-live, every branch of 0x007f7a40 decides in-module:
               - head decisions via room-pure ABI v67a Gates/Fail laws BY REF
               - spawn tail via ABI v81 rot/base/item-plan laws BY REF
             Coarse @172 carries no information on capture-live ticks and is
             RETIRED; capture absence keeps the monolith byte-for-byte.
             Typed-host leaves stay counted as named leaves in evidence. */
          if (roomTriggerClearNeedsNonGreedHost(state.difficulty269c8 | 0) !== 0) {
            const headLive = (runtimeInputs.tca40HeadPackReady | 0) !== 0;
            const tailLive = (runtimeInputs.tca40TailPackReady | 0) !== 0 &&
              ((runtimeInputs.tca40TailIterCount | 0) >>> 0) <= 8;
            /* coarse @172: fires ONLY on head-capture absence. */
            if (!headLive) {
              events.roomTriggerClearAudioNonGreed =
                (events.roomTriggerClearAudioNonGreed | 0) + 1;
            }
            /* ---- v133 spawn-tail consumption (independent of head). ---- */
            if (tailLive) {
              const n = (runtimeInputs.tca40TailIterCount | 0) >>> 0;
              const rot = roomTriggerClearAudio7f7a40TailRot(
                runtimeInputs.tca40TailVec0Bits >>> 0,
                runtimeInputs.tca40TailVec4Bits >>> 0,
                f32FromBits(runtimeInputs.tca40TailRotCosBits >>> 0),
                f32FromBits(runtimeInputs.tca40TailRotSinBits >>> 0));
              const baseLaw = roomTriggerClearAudio7f7a40TailBase(
                runtimeInputs.tca40TailDoorF24 | 0,
                runtimeInputs.tca40TailGameC | 0);
              let consumed = 0;
              for (let i = 0; i < n; i += 1) {
                const plan = roomTriggerClearAudio7f7a40TailItemPlan({
                  rA: runtimeInputs[`tca40TailRa${i}`] >>> 0,
                  rB: runtimeInputs[`tca40TailRb${i}`] >>> 0,
                  rC: runtimeInputs[`tca40TailRc${i}`] >>> 0,
                  rD: runtimeInputs[`tca40TailRd${i}`] >>> 0,
                  rE: runtimeInputs[`tca40TailRe${i}`] >>> 0,
                  rF: runtimeInputs[`tca40TailRf${i}`] >>> 0,
                  rG: runtimeInputs[`tca40TailRg${i}`] >>> 0,
                  aBits: (runtimeInputs.tca40TailVec0Bits ^ 0x80000000) >>> 0,
                  bBits: (runtimeInputs.tca40TailVec4Bits ^ 0x80000000) >>> 0,
                  r0Bits: rot.r0Bits,
                  r1Bits: rot.r1Bits,
                  baseXBits: baseLaw.xBits,
                  baseYBits: baseLaw.yBits,
                  cosHBits: runtimeInputs[`tca40TailCosH${i}`] >>> 0,
                  sinHBits: runtimeInputs[`tca40TailSinH${i}`] >>> 0,
                  entPxBits: runtimeInputs[`tca40TailEntPx${i}`] >>> 0,
                  entPyBits: runtimeInputs[`tca40TailEntPy${i}`] >>> 0,
                });
                void plan;
                consumed += 1;
              }
              events.roomTriggerClearAudioNonGreedTailSpawns = consumed;
            }
            /* ---- v136 head gates/fail: consume frozen ABI-67a laws. ---- */
            if (headLive) {
              const gates = roomTriggerClearAudio7f7a40Gates({
                a2: 0, a1: 1,
                game_26584: runtimeInputs.mode26584 >>> 0,
                room_type_8: state.roomType8 >>> 0,
                desc_f10_f10: runtimeInputs.tca40HeadDescF10F10 >>> 0,
                h_74ea50: runtimeInputs.tca40HeadH74Ea50Al >>> 0,
                game_stage_0: runtimeInputs.clearPathGameMode0 | 0,
                game_2654c: state.flags2654c >>> 0,
                obj_2c7: runtimeInputs.tca40HeadObj2c7 >>> 0,
                obj_8: runtimeInputs.tca40HeadObj8 >>> 0,
                game_present: 1,
                game_26630: runtimeInputs.tca40HeadGame26630 >>> 0,
                game_26589: runtimeInputs.tca40HeadGameByte26589 >>> 0,
                h_706940_80: runtimeInputs.tca40HeadH706940H80 >>> 0,
                h_6f95a0: runtimeInputs.tca40HeadH6F95A0 | 0,
                h_6f9400: runtimeInputs.tca40HeadH6F9400 | 0,
                game_26550: runtimeInputs.tca40HeadGame26550 >>> 0,
                game_c: runtimeInputs.tca40HeadGameC | 0,
                game_18304: runtimeInputs.tca40HeadGame18304 >>> 0,
                game_182d0: runtimeInputs.tca40HeadGame182D0 >>> 0,
                game_4: runtimeInputs.tca40HeadGame4 >>> 0,
                room_728: runtimeInputs.tca40HeadRoom728 >>> 0,
                room_f10_f8: runtimeInputs.tca40HeadRoomF10F8 >>> 0,
                r74bba0_f10_f8: runtimeInputs.tca40HeadR74Bba0F10F8 >>> 0,
              });
              void gates; /* decision in-module; host leaves stay counted. */
              /* ABI-67 fail chain: when the gates law diverts to the fail
                 path (fail_path == 1), the complete xorshift slot scan +
                 tail-count law runs IN-MODULE from the fail rows (contracts-
                 audio-head §1b). Fire-only leaves stay host-executed; the
                 module publishes no event mass from this chain. */
              if ((gates.fail_path | 0) === 1) {
                const fail = roomTriggerClearAudio7f7a40Fail({
                  a1: 1, a2: 0,
                  game_26584: runtimeInputs.mode26584 >>> 0,
                  game_26630: runtimeInputs.tca40HeadGame26630 >>> 0,
                  game_26589: runtimeInputs.tca40HeadGameByte26589 >>> 0,
                  game_18304: runtimeInputs.tca40HeadGame18304 >>> 0,
                  game_18314: runtimeInputs.tca40HeadGame18314 >>> 0,
                  h_740bc0_ret_8: runtimeInputs.tca40HeadH740Bc0Ret8 >>> 0,
                  h_706940b_80: runtimeInputs.tca40HeadH706940BH80 >>> 0,
                  obj_1e3: runtimeInputs.tca40HeadObj1E3 >>> 0,
                  obj_8: runtimeInputs.tca40HeadObj8 >>> 0,
                  h_74bae0: runtimeInputs.tca40HeadH74Bae0 >>> 0,
                  h_74e9b0: runtimeInputs.tca40HeadH74E9B0Al >>> 0,
                  slot_seed: runtimeInputs.tca40HeadSlotSeed >>> 0,
                  bm1: runtimeInputs.tca40HeadBm1 >>> 0,
                  bm2: runtimeInputs.tca40HeadBm2 >>> 0,
                  slot_occ0: runtimeInputs.tca40HeadSlotOcc0 >>> 0,
                  slot_occ1: runtimeInputs.tca40HeadSlotOcc1 >>> 0,
                  slot_occ2: runtimeInputs.tca40HeadSlotOcc2 >>> 0,
                  slot_occ3: runtimeInputs.tca40HeadSlotOcc3 >>> 0,
                  slot_occ4: runtimeInputs.tca40HeadSlotOcc4 >>> 0,
                  slot_occ5: runtimeInputs.tca40HeadSlotOcc5 >>> 0,
                  slot_occ6: runtimeInputs.tca40HeadSlotOcc6 >>> 0,
                  slot_occ7: runtimeInputs.tca40HeadSlotOcc7 >>> 0,
                  r74bba0b_f10_f8: runtimeInputs.tca40HeadR74Bba0BF10F8 >>> 0,
                  slot_8: runtimeInputs.tca40HeadSlot8 >>> 0,
                  h_70d360: runtimeInputs.tca40HeadH70D360 >>> 0,
                  genrand_tail: runtimeInputs.tca40HeadGenrandTail >>> 0,
                });
                void fail;
              }
            }
          }          const rtcaSeed = runtimeInputs.roomTriggerClearAudioSeed | 0;
          const rtcaValue = runtimeInputs.roomTriggerClearAudioValue | 0;
          const rtcaPlay = runtimeInputs.roomTriggerClearAudioPlaySound | 0;
          const rtcaGate = runtimeInputs.roomTriggerClearAudioGate749830 | 0;
          const rtcaRoom = runtimeInputs.roomTriggerClearAudioRoomMatch | 0;
          const tca83b0Live = (runtimeInputs.tca83b0TailPackReady | 0) !== 0 &&
            ((runtimeInputs.tca83b0TailIterCount | 0) >>> 0) <= 8;
          /* ABI v133 (update-v133-audio-music-pack, record idx27
             roomTriggerClearAudio): the coarse @176 fires ONLY on capture
             absence — the v95 rtca carriers below keep modeling the music
             split on their own seams, and the tca83b0 pack carries the
             spawn tail when the music path reached it (rtcaMusic !== 0).
             ABI v137 (update-v137-audio-head-83b0-pack): under the NEW
             tca83B0HeadPackReady voucher (@17856; 39 rows @17860..18012,
             contracts-audio-head-83b0 NOTES §2) windows A–F decide
             IN-MODULE via the frozen roomTca83b0* laws consumed BY
             REFERENCE: skip/match (L4), music (L1), the window-B dispatch
             probes + collect-walk count (W6a) and its UNSIGNED >=2 gate.
             The coarse retires on the head decision PLUS the tail voucher
             for whichever tail window fired; on ALT-dispatch ticks the
             coarse KEEPS counting — the ALT spawn tail has frozen law v84
             but NO capture lanes yet (§6 companion gap), so its residual
             remains host-side and record idx27 stays NARROWED. */
          const rtcaCaptured = rtcaSeed !== 0 || rtcaValue !== 0 ||
            rtcaPlay !== 0 || rtcaGate !== 0 || rtcaRoom !== 0;
          const head83Live = (runtimeInputs.tca83B0HeadPackReady | 0) !== 0;
          let tca83CoarseFires;
          let nAlt = 0;
          if (!head83Live) {
            tca83CoarseFires = !(rtcaCaptured && tca83b0Live) ? 1 : 0;
          } else {
            const match83 = ((runtimeInputs.tca83B0HeadRoomIdxRet8 | 0) ===
              (runtimeInputs.tca83B0HeadGame18314 | 0)) ? 1 : 0;
            const skip83 = roomTca83b0Skip(0,
              runtimeInputs.tca83B0HeadGate749830 >>> 0, match83);
            if ((skip83 | 0) === 1) {
              tca83CoarseFires = 0; /* pure-skip epilogue: no stores. */
            } else {
              const music83 = roomTca83b0Music(0,
                runtimeInputs.tca83B0HeadValue92B0Bits >>> 0,
                runtimeInputs.tca83B0HeadMusicSeed >>> 0);
              if ((music83 | 0) === 0) {
                tca83CoarseFires = 0; /* flag-store path, window A end. */
              } else {
                let freeMask83 = 0;
                for (let i = 0; i < 8; i += 1) {
                  if (((runtimeInputs[`tca83B0HeadSlotOcc${i}`] |
                    0) >>> 0) === 0) {
                    freeMask83 |= (1 << i);
                  }
                }
                const count83 = roomTca83b0DoorWalkMusicCount(
                  runtimeInputs.tca83B0HeadRandomIntRnd >>> 0,
                  runtimeInputs.tca83B0HeadBm1_38 >>> 0, 0, freeMask83);
                const diverted83 =
                  ((runtimeInputs.tca83B0HeadOwnerProbe | 0) === 0) ||
                  ((runtimeInputs.tca83B0HeadBm2NonNull | 0) !== 0) ||
                  ((count83 >>> 0) < 2);
                /* ABI v138 (update-v138-audio-alt-tail-pack): route-split
                   retirement per NOTES 6C.3 -- the ALT band consumes the
                   stride-44 rows IN-MODULE via the frozen v84 law consumed
                   BY REFERENCE and publishes the rows-consumed count on
                   @1144; magic_eq_e is DERIVED from tca83B0HeadDoorMagic
                   (@17984) == 0xe (single pre-loop latch writer @0x7f8ef5,
                   falsifier 1). A captured game_c == 0 yields div_ok=0 with
                   a zeroed plan Out: no spawn for that row, contract total. */
                const altLive =
                  (runtimeInputs.tca83B0AltTailPackReady | 0) !== 0 &&
                  ((runtimeInputs.tca83B0AltTailIterCount | 0) >>> 0) <= 8;
                if (altLive) {
                  const na = (runtimeInputs.tca83B0AltTailIterCount | 0) >>> 0;
                  for (let i = 0; i < na; i += 1) {
                    const plan = roomTriggerClearAudio83B0TailAltItemPlan({
                      rB: runtimeInputs[`tca83B0AltTailRb${i}`] >>> 0,
                      rC: runtimeInputs[`tca83B0AltTailRc${i}`] >>> 0,
                      rD: runtimeInputs[`tca83B0AltTailRd${i}`] >>> 0,
                      rE: runtimeInputs[`tca83B0AltTailRe${i}`] >>> 0,
                      rF: runtimeInputs[`tca83B0AltTailRf${i}`] >>> 0,
                      rG: runtimeInputs[`tca83B0AltTailRg${i}`] >>> 0,
                      rH: runtimeInputs[`tca83B0AltTailRh${i}`] >>> 0,
                      vecABits: runtimeInputs.tca83B0AltTailVecABits >>> 0,
                      vecBBits: runtimeInputs.tca83B0AltTailVecBBits >>> 0,
                      magicEqE: (runtimeInputs.tca83B0HeadDoorMagic >>> 0) === 0xe ? 1 : 0,
                      doorF24: runtimeInputs.tca83B0AltTailDoorF24 | 0,
                      gameC: runtimeInputs.tca83B0AltTailGameC | 0,
                      cosHBits: runtimeInputs[`tca83B0AltTailCosH${i}`] >>> 0,
                      sinHBits: runtimeInputs[`tca83B0AltTailSinH${i}`] >>> 0,
                      itemPxBits: runtimeInputs[`tca83B0AltTailItemPx${i}`] >>> 0,
                      itemPyBits: runtimeInputs[`tca83B0AltTailItemPy${i}`] >>> 0,
                    });
                    void plan; /* Out[i] lands in the exported scratch (cpp). */
                  }
                  nAlt = na;
                }
                if (diverted83) {
                  /* ALT band route: coarse fires iff the ALT voucher is
                     absent (NOTES 6C.3 row 4 -- THE v137 blocker removed). */
                  tca83CoarseFires = !altLive ? 1 : 0;
                } else {
                  /* Main completion route: unchanged v137 shape. */
                  tca83CoarseFires = !tca83b0Live ? 1 : 0;
                }
              }
            }
          }
          if (tca83CoarseFires === 1) {
            events.roomTriggerClearAudio = (events.roomTriggerClearAudio | 0) + 1;
          }
          events.roomTriggerClearAudioAltPathTailSpawns = nAlt;
          /* ABI v95 (record idx 27 roomTriggerClearAudio): the always-
             music body 0x7f83b0 (called at 0x8069da with arg1=1, arg2=0)
             splits into TYPED HOST leaves when the seam is captured. The
             pure law (gameUpdateSliceRoomTriggerClearAudioMusic) runs the
             xorshift32 {2,0x15,9} + float32 rnd + comiss compares
             in-module; the flag-store/SFX leaves name the residual host
             content. ready=0 (any capture missing) keeps the monolithic
             counter. Gate leaves G1 (0x749830 result) + G2 (GetRoomByIdx
             match) must BOTH open at this callsite (arg2==0): a closed
             gate is a pure skip (PE 0x7f8407/0x7f8439 -> ret 0 with NO
             stores). */
          if (rtcaCaptured) {
            const rtcaGatesOpen = (rtcaGate !== 0) && (rtcaRoom !== 0);
            let rtcaMusicFired = 0;
            if (rtcaGatesOpen) {
              const rtcaMusic = gameUpdateSliceRoomTriggerClearAudioMusic(
                0 /* arg2 == 0 at the 0x8069da callsite */, rtcaValue, rtcaSeed);
              rtcaMusicFired = rtcaMusic !== 0 ? 1 : 0;
              if (rtcaMusic !== 0) {
                events.roomTriggerClearAudioMusic = (events.roomTriggerClearAudioMusic | 0) + 1;
              } else {
                events.roomTriggerClearAudioFlagStore = (events.roomTriggerClearAudioFlagStore | 0) + 1;
              }
            }
            if ((rtcaPlay & 0xff) === 0) {
              /* Caller SFX leaf: record-31 sfx_plan law BY REFERENCE. */
              const r31Sfx = gameUpdateSliceTriggerClearSfxPlan(rtcaPlay);
              if ((r31Sfx.armed | 0) !== 0) {
                events.roomTriggerClearAudioSfx = (events.roomTriggerClearAudioSfx | 0) + 1;
              }
            }
            if (rtcaMusicFired !== 0 && tca83b0Live) {
              /* ABI v133: the music path reached the spawn tail — consume
                 the tca83b0 rows IN-MODULE via the frozen room-pure ABI v82
                 plan (xorps flips, x5 f1 premultiply, both idivs, dir/f474)
                 and publish the typed carrier. Host applies each plan-Out
                 in PE order (spawn 0x428b20 + [ent+0x474] + timers +
                 [vtbl+0xc]). */
              const n = (runtimeInputs.tca83b0TailIterCount | 0) >>> 0;
              let consumed = 0;
              for (let i = 0; i < n; i += 1) {
                const plan = roomTriggerClearAudio83B0TailItemPlan({
                  rA: runtimeInputs[`tca83b0TailRa${i}`] >>> 0,
                  rB: runtimeInputs[`tca83b0TailRb${i}`] >>> 0,
                  rC: runtimeInputs[`tca83b0TailRc${i}`] >>> 0,
                  rD: runtimeInputs[`tca83b0TailRd${i}`] >>> 0,
                  rE: runtimeInputs[`tca83b0TailRe${i}`] >>> 0,
                  rF: runtimeInputs[`tca83b0TailRf${i}`] >>> 0,
                  rG: runtimeInputs[`tca83b0TailRg${i}`] >>> 0,
                  vec0Bits: runtimeInputs.tca83b0TailVec0Bits >>> 0,
                  vec1Bits: runtimeInputs.tca83b0TailVec1Bits >>> 0,
                  doorF24: runtimeInputs.tca83b0TailDoorF24 | 0,
                  gameC: runtimeInputs.tca83b0TailGameC | 0,
                  cosHBits: runtimeInputs[`tca83b0TailCosH${i}`] >>> 0,
                  sinHBits: runtimeInputs[`tca83b0TailSinH${i}`] >>> 0,
                  itemPxBits: runtimeInputs[`tca83b0TailEntPx${i}`] >>> 0,
                  itemPyBits: runtimeInputs[`tca83b0TailEntPy${i}`] >>> 0,
                  firstIter: i === 0 ? 1 : 0,
                });
                void plan; /* Out[i] lands in the exported scratch (cpp). */
                consumed += 1;
              }
              events.roomTriggerClearAudioMusicPathTailSpawns = consumed;
            }
          }
          /* ABI v135 (update-v135-deep-music-pack, record idx28
             roomTriggerClearAwardsNonGreed REMOVED): under the NEW
             tcaDmGateReady voucher (@17652; 11 gate rows @17656..17692,
             contracts-deep-music NOTES §1/§2) the ENTIRE deep-music gate
             band 0x806a65..0x806b63 runs IN-MODULE via the landed law
             gameUpdateSliceTriggerClearDeepMusicGate consumed BY
             REFERENCE (short-circuit-honest packed probe rows: bit8=RAN,
             bits[7:0]=al). When the gate OPENS the typed carrier
             roomTriggerClearDeepMusicFire @1140 carries the whole
             deterministic fire package: flags-or 0x10000 apply-back via
             gameFlags1839c (inout state), SFX seed 0x5a + Play pack to
             [0xc7169c]+0x2a324 (typed-host), Room[+0x72fc]=0. With every
             sub-decision in-module the coarse @180 carries no information
             and is RETIRED on capture-live ticks; absence keeps the
             monolith byte-for-byte. */
          if (roomTriggerClearNeedsNonGreedHost(state.difficulty269c8 | 0) !== 0) {
            const tcaDmLive = (runtimeInputs.tcaDmGateReady | 0) !== 0;
            if (!tcaDmLive) {
              events.roomTriggerClearAwardsNonGreed =
                (events.roomTriggerClearAwardsNonGreed | 0) + 1;
            } else {
              const dm = gameUpdateSliceTriggerClearDeepMusicGate({
                byte1bb84: runtimeInputs.tcaDmHeadClear1bb84 >>> 0,
                probe9e9b50: runtimeInputs.tcaDmProbeA9e9b50 >>> 0,
                probe9595e0: runtimeInputs.tcaDmProbeB9595e0 >>> 0,
                byte26588: runtimeInputs.tcaDmByte26588 >>> 0,
                vecBegin4b3d8: runtimeInputs.tcaDmVecBegin4b3d8 >>> 0,
                vecEnd4b3dc: runtimeInputs.tcaDmVecEnd4b3dc >>> 0,
                count334: runtimeInputs.tcaDmCount334 >>> 0,
                flag1839c: state.gameFlags1839c >>> 0,
                roomMatch: runtimeInputs.tcaDmRoomMatchRet8 >>> 0,
                game0: runtimeInputs.clearPathGameMode0 >>> 0,
                game4: runtimeInputs.tcaDmGame4 >>> 0,
                frame264f8: state.frameCounter264f8 | 0,
              });
              if (dm.fire !== 0) {
                events.roomTriggerClearDeepMusicFire = 1;
                state.gameFlags1839c = ((state.gameFlags1839c >>> 0) |
                  (dm.flagOr10000 >>> 0)) >>> 0;
              }
            }
          }
          if (roomTriggerClearNeedsAwardsBit7Walk(state.roomDescFlags44 | 0) !== 0) {
            /* ABI v134 (update-v134-awards-head-pack, records idx28/29):
               under the awardsHeadReady voucher (@17540; src rows
               @17544..17648 mirroring IsaacRoomAwardSpawn7fb250Src
               field-for-field) the frozen room-pure ABI v83 head plan runs
               IN-MODULE and publishes its Out as eight typed carriers.
               Retirement matrix (contracts-awards §3): exits {0 LUA_TAIL,
               1 SFX_ARM, 2 RT_END, 3 GREED_ARM(dispatch), 5 GATE_END,
               6 RT_ALT} retire the coarse @184 unconditionally; exits
               {7 NO_SPAWNS, 8 ID_ZERO} retire on the full count-law pack
               (all 27 rows delivered = ready). Capture absence keeps the
               coarse byte-for-byte. */
            const awardsHeadLive =
              (runtimeInputs.awardsHeadReady | 0) !== 0;
            if (awardsHeadLive) {
              const headOut = roomAwardSpawn7fb250HeadPlan({
                DBG: 0,
                luaGate: runtimeInputs.awardsHeadSrcluaGate | 0,
                descF10Present: runtimeInputs.awardsHeadSrcdescF10Present | 0,
                descType8: runtimeInputs.awardsHeadSrcdescType8 | 0,
                descType00: runtimeInputs.awardsHeadSrcdescType00 | 0,
                roomType8: state.roomType8 | 0,
                h74efd0: runtimeInputs.awardsHeadSrch74efd0 | 0,
                game1830c: state.roomTransitionMode1830c | 0,
                mode269c8: state.difficulty269c8 | 0,
                h9be630: runtimeInputs.awardsHeadSrch9be630 | 0,
                flags1839c: state.gameFlags1839c | 0,
                pickedId: runtimeInputs.awardsHeadSrcpickedId >>> 0,
                gateF1: runtimeInputs.awardsHeadSrcgateF1 | 0,
                h9be750: runtimeInputs.awardsHeadSrch9be750 >>> 0,
                h4e4690Bits: runtimeInputs.awardsHeadSrch4e4690Bits >>> 0,
                h7e9080Bits: runtimeInputs.awardsHeadSrch7e9080Bits >>> 0,
                hRnd64: runtimeInputs.awardsHeadSrchRnd64 >>> 0,
                h6ee340: runtimeInputs.awardsHeadSrch6ee340 | 0,
                h9be140: runtimeInputs.awardsHeadSrch9be140 >>> 0,
                xformId: runtimeInputs.awardsHeadSrcxformId >>> 0,
                xformB: runtimeInputs.awardsHeadSrcxformB >>> 0,
                descF0: runtimeInputs.awardsHeadSrcdescF0 | 0,
                h9be6b0: runtimeInputs.awardsHeadSrch9be6b0 >>> 0,
                h7cb6e0: runtimeInputs.awardsHeadSrch7cb6e0 >>> 0,
                gate202: runtimeInputs.awardsHeadSrcgate202 | 0,
                hRnd4: runtimeInputs.awardsHeadSrchRnd4 >>> 0,
                h9be0801a0: runtimeInputs.awardsHeadSrch9be0801a0 >>> 0,
                hRnd3: runtimeInputs.awardsHeadSrchRnd3 >>> 0,
              });
              events.roomAwardsHeadExitKind = headOut.exitKind;
              events.roomAwardsHeadSfxArm = headOut.sfxArm;
              events.roomAwardsHeadByte6D = headOut.byte6d;
              events.roomAwardsHeadVariantLocal = headOut.variantLocal;
              events.roomAwardsHeadCount = headOut.count >>> 0;
              events.roomAwardsHeadIdFinal = headOut.idFinal >>> 0;
              events.roomAwardsHeadFlag66 = headOut.flag66;
              events.roomAwardsHeadPlannedSpawns = headOut.plannedSpawns >>> 0;
              /* ABI v140 (update-v140-awards-spawn-loop-pack, record
                 idx29): exit {4 SPAWN_LOOP} retires under the
                 awardsSpawnLoopReady voucher (@22000) when every body leaf
                 is representable: per-iteration body + B1 luck run
                 IN-MODULE via the frozen room-pure ABI v85 laws (consumed
                 BY REFERENCE).
                 ABI v141 (update-v141-b-block-probe-pack): the post-loop
                 0xb-block (0x7fb9cc..0x7fbb04) is NO LONGER a blocker.
                 Its three probes 0x9b92c0/0x7cb6e0/0x7c3980 are FROZEN
                 room-pure ABI v86 laws consumed BY REFERENCE below, and
                 the v140 note's "indirect vtable leaf [eax-0x18]
                 @0x7fbabf" was a linear-decode MISDECODE (fresh span dump
                 007fb9cc.txt: ZERO indirect calls in the window; VA falls
                 mid-instruction inside lea eax,[ebp-0xac]). The band +
                 the {5,0x12c} extra create ([Game+0x26584]==0x2b) retire
                 under the NEW awardsBBlockReady voucher (@22572);
                 absence / over-cap (recount > 8) / recount mismatch keeps
                 the coarse byte-for-byte. */
              const spawnLoopCount = headOut.count >>> 0;
              const iterCount = runtimeInputs.awardsSpawnLoopIterCount >>> 0;
              const bodyLive =
                (runtimeInputs.awardsSpawnLoopReady | 0) !== 0 &&
                iterCount === spawnLoopCount &&
                iterCount <= 16;
              const bbArmed =
                (runtimeInputs.awardsSpawnLoopTailGateB1Al | 0) !== 0 &&
                (state.roomType8 | 0) === 0xb;
              const tail2b =
                (runtimeInputs.awardsSpawnLoopGame26584 >>> 0) === 0x2b;
              /* PE loop recount @0x7fba7f..92 (u32 wrap then shift). */
              const bbCount =
                ((((runtimeInputs.awardsBBlockVecEnd >>> 0) -
                   (runtimeInputs.awardsBBlockVecBegin >>> 0)) >>> 0) >>>
                  2);
              const bbPackLive =
                (runtimeInputs.awardsBBlockReady | 0) !== 0 &&
                (runtimeInputs.awardsBBlockIterCount >>> 0) === bbCount &&
                bbCount <= 8;
              if ((headOut.exitKind | 0) !== 4) {
                /* Non-SPAWN_LOOP exits retire unconditionally (v134
                   matrix): fully decided in-module. */
              } else if (!bodyLive) {
                /* SPAWN_LOOP without the voucher / over-cap / count
                   mismatch: byte-for-byte monolith. */
                events.roomTriggerClearAwardsBit7 =
                  (events.roomTriggerClearAwardsBit7 | 0) + 1;
              } else if ((bbArmed || tail2b) && !bbPackLive) {
                /* Armed 0xb-band or 0x2b extra-create WITHOUT a valid
                   capture pack -> byte-for-byte. */
                events.roomTriggerClearAwardsBit7 =
                  (events.roomTriggerClearAwardsBit7 | 0) + 1;
              } else {
                let variantCur = runtimeInputs.awardsSpawnLoopVariant0 | 0;
                let doorFires = 0;
                let chaseFires = 0;
                let flagMask = 0;
                for (let i = 0; i < iterCount; i += 1) {
                  const iout = roomAwardSpawn7fb250IterPlan({
                    pickedId: headOut.idFinal >>> 0,
                    variantCur: variantCur >>> 0,
                    counter: i,
                    countLimit: spawnLoopCount | 0,
                    flag66: headOut.flag66 | 0,
                    entityType28:
                      runtimeInputs[`awardsSpawnLoopRow${i}EntityType28`] >>> 0,
                    entityVariant2c:
                      runtimeInputs[`awardsSpawnLoopRow${i}EntityVariant2c`] >>> 0,
                    entityField30:
                      runtimeInputs[`awardsSpawnLoopRow${i}EntityField30`] >>> 0,
                    hDoorGate:
                      runtimeInputs[`awardsSpawnLoopRow${i}DoorGateAl`] | 0,
                    hSfxOwner:
                      runtimeInputs[`awardsSpawnLoopRow${i}SfxOwner`] >>> 0,
                    posXBits:
                      runtimeInputs[`awardsSpawnLoopRow${i}PosXBits`] >>> 0,
                    posYBits:
                      runtimeInputs[`awardsSpawnLoopRow${i}PosYBits`] >>> 0,
                    roomW: runtimeInputs.awardsSpawnLoopRoomWC >>> 0,
                    roomH: runtimeInputs.awardsSpawnLoopRoomH10 >>> 0,
                  });
                  doorFires += iout.doorSpawnFired;
                  chaseFires += iout.sfxChase;
                  flagMask |= (iout.flagRmw & 1) << i;
                  variantCur = iout.variantNext | 0;
                }
                const bout = roomAwardSpawn7fb250B1LuckGate({
                  hQualityInt: runtimeInputs.awardsSpawnLoopB1QualityInt | 0,
                  hQualityFBits: runtimeInputs.awardsSpawnLoopB1QualityFBits >>> 0,
                  hRndFBits: runtimeInputs.awardsSpawnLoopB1RndFBits >>> 0,
                });
                events.roomAwardsSpawnLoopRowsApplied = iterCount;
                events.roomAwardsSpawnLoopDoorSpawnFires = doorFires;
                events.roomAwardsSpawnLoopSfxChaseFires = chaseFires;
                events.roomAwardsSpawnLoopFlagRmwMask = flagMask >>> 0;
                events.roomAwardsSpawnLoopVariantFinal = variantCur;
                events.roomAwardsSpawnLoopB1Pass = bout.pass;
                events.roomAwardsSpawnLoopB1SiteArmed = bout.pass;
                events.roomAwardsSpawnLoopB1ChaseFired =
                  (bout.pass | 0) !== 0 &&
                  (runtimeInputs.awardsSpawnLoopB1PickerAl | 0) !== 0
                    ? 1
                    : 0;
                if (bbArmed) {
                  /* ABI v141 capture-live: run the whole 0xb-block
                     in-module via the frozen room-pure ABI v86 laws
                     (BY REFERENCE). RNG s0 threads through [ebp-0xac]. */
                  let oobDefects = 0;
                  let countSum = 0;
                  let rollFirstMask = 0;
                  let rollSecondMask = 0;
                  let rollIndexSum = 0;
                  let followupFires = 0;
                  let rngS0 = runtimeInputs.awardsBBlockRngS0 >>> 0;
                  const rngS1 = runtimeInputs.awardsBBlockRngS1 >>> 0;
                  const rngS2 = runtimeInputs.awardsBBlockRngS2 >>> 0;
                  const rngS3 = runtimeInputs.awardsBBlockRngS3 >>> 0;
                  const elems = [];
                  for (let i = 0; i < 8; i += 1) {
                    elems.push(
                      runtimeInputs[`awardsBBlockElemValue${i}`] >>> 0);
                  }
                  for (let i = 0; i < bbCount; i += 1) {
                    /* Probe A -- 0x009b92c0 (BY REFERENCE); synthetic
                       span begin=0/end=4*count mirrors the in-module
                       elem-value mirror span. The jb loop guard pins
                       index<count so oobDefect stays 0 by construction. */
                    const atout = roomIdx29At9b92c0(elems, 0, bbCount * 4, i);
                    oobDefects += atout.oobDefect;
                    /* Probe B -- FUN_007cb6e0 (BY REFERENCE); id pinned
                       to the 0xb1 arg (push 0xb1 @0x7fba9a). */
                    const cout = roomCount7cb6e0Plan({
                      id: 0xb1,
                      f13c0:
                        runtimeInputs[`awardsBBlockRow${i}F13C0`] >>> 0,
                      gate202c:
                        runtimeInputs[`awardsBBlockRow${i}Gate202c`] >>> 0,
                      gate20a9:
                        runtimeInputs[`awardsBBlockRow${i}Gate20a9`] >>> 0,
                      mode2663c:
                        runtimeInputs.awardsBBlockMode2663c >>> 0,
                      mode26584:
                        runtimeInputs.awardsSpawnLoopGame26584 >>> 0,
                      mgrSeed264f8:
                        runtimeInputs.awardsBBlockMgrSeed264f8 >>> 0,
                      hCount15:
                        runtimeInputs[`awardsBBlockRow${i}HCount15`] | 0,
                      hCount40:
                        runtimeInputs[`awardsBBlockRow${i}HCount40`] | 0,
                      hCount4b:
                        runtimeInputs[`awardsBBlockRow${i}HCount4b`] | 0,
                      hBdR:
                        runtimeInputs[`awardsBBlockRow${i}HBdR`] >>> 0,
                      hRngRaw:
                        runtimeInputs[`awardsBBlockRow${i}HRngRaw`] >>> 0,
                      has8b:
                        runtimeInputs[`awardsBBlockRow${i}Has8b`] >>> 0,
                      has1ca:
                        runtimeInputs[`awardsBBlockRow${i}Has1ca`] >>> 0,
                      has1b7:
                        runtimeInputs[`awardsBBlockRow${i}Has1b7`] >>> 0,
                      slot0:
                        runtimeInputs[`awardsBBlockRow${i}Slot0`] >>> 0,
                      slot1:
                        runtimeInputs[`awardsBBlockRow${i}Slot1`] >>> 0,
                      blockNonNull:
                        runtimeInputs[`awardsBBlockRow${i}BlockNonNull`] >>> 0,
                      block0:
                        runtimeInputs[`awardsBBlockRow${i}Block0`] >>> 0,
                      block4:
                        runtimeInputs[`awardsBBlockRow${i}Block4`] >>> 0,
                      flag17cc:
                        runtimeInputs[`awardsBBlockRow${i}Flag17cc`] >>> 0,
                      itemBegin:
                        runtimeInputs[`awardsBBlockRow${i}ItemBegin`] >>> 0,
                      itemEnd:
                        runtimeInputs[`awardsBBlockRow${i}ItemEnd`] >>> 0,
                      itemW0:
                        runtimeInputs[`awardsBBlockRow${i}ItemW0`] >>> 0,
                      itemW1:
                        runtimeInputs[`awardsBBlockRow${i}ItemW1`] >>> 0,
                      byteBegin:
                        runtimeInputs[`awardsBBlockRow${i}ByteBegin`] >>> 0,
                      byteEnd:
                        runtimeInputs[`awardsBBlockRow${i}ByteEnd`] >>> 0,
                      byteVal:
                        runtimeInputs[`awardsBBlockRow${i}ByteVal`] >>> 0,
                      f2ef8:
                        runtimeInputs[`awardsBBlockRow${i}F2ef8`] >>> 0,
                      byte2ef0:
                        runtimeInputs[`awardsBBlockRow${i}Byte2ef0`] >>> 0,
                      hAdder17:
                        runtimeInputs[`awardsBBlockRow${i}HAdder17`] >>> 0,
                      f18dc:
                        runtimeInputs[`awardsBBlockRow${i}F18dc`] >>> 0,
                      f18e0:
                        runtimeInputs[`awardsBBlockRow${i}F18e0`] >>> 0,
                    });
                    countSum = (countSum + (cout.result | 0)) | 0;
                    /* Caller glue 0x7fbab2/0x7fbacc (SIGNED jle) +
                       Probe C -- FUN_007c3980 (BY REFERENCE). */
                    const rp = roomIdx29RollPlan(cout.result | 0);
                    if (rp.rollFirst !== 0) {
                      const rout =
                        roomRoll7c3980Core(rngS0, rngS1, rngS2, rngS3);
                      rngS0 = rout.newS0 >>> 0;
                      rollFirstMask |= 1 << i;
                      rollIndexSum += rout.index;
                      /* Host apply-backs per fire: 0x763570 unconditional;
                         counters++/[this+0x1574]|=0x41f; 0x7abd30 iff
                         both gates zero. */
                      followupFires +=
                        roomRoll7c3980FollowupGate(
                          runtimeInputs[`awardsBBlockRow${i}RollF3fc`] >>> 0,
                          runtimeInputs[`awardsBBlockRow${i}RollByte173`] >>> 0);
                    }
                    if (rp.rollSecond !== 0) {
                      const rout =
                        roomRoll7c3980Core(rngS0, rngS1, rngS2, rngS3);
                      rngS0 = rout.newS0 >>> 0;
                      rollSecondMask |= 1 << i;
                      rollIndexSum += rout.index;
                      followupFires +=
                        roomRoll7c3980FollowupGate(
                          runtimeInputs[`awardsBBlockRow${i}RollF3fc`] >>> 0,
                          runtimeInputs[`awardsBBlockRow${i}RollByte173`] >>> 0);
                    }
                  }
                  events.roomAwardsBBlockRowsApplied = bbCount;
                  events.roomAwardsBBlockOobDefects = oobDefects;
                  events.roomAwardsBBlockCountSum = countSum | 0;
                  events.roomAwardsBBlockRollFirstMask = rollFirstMask >>> 0;
                  events.roomAwardsBBlockRollSecondMask = rollSecondMask >>> 0;
                  events.roomAwardsBBlockRollIndexSum = rollIndexSum;
                  events.roomAwardsBBlockFollowupFires = followupFires;
                  events.roomAwardsBBlockRngFinal = rngS0 >>> 0;
                  events.roomAwardsBBlockPreloopCreateVariant =
                    (runtimeInputs.awardsBBlockDescChainBit | 0) !== 0
                      ? 0x64
                      : 0x32;
                }
                if (tail2b) {
                  /* {5,0x12c} extra create @0x7fbb11..0x7fbb5f on the
                     same bbPackLive voucher. */
                  events.roomAwardsBBlockTailCreateFired = 1;
                }
              }
            } else {
              events.roomTriggerClearAwardsBit7 =
                (events.roomTriggerClearAwardsBit7 | 0) + 1;
            }
            if (!awardsHeadLive) {
            /* ABI v95 (record idx 29 roomTriggerClearAwardsBit7 /
               FUN_007fb250 award-spawner HEAD): typed carriers (dynamic
               keys pinned for the coordinator merge — section-notes
               update-v95-awards-bit7-head §3). The head dispatch + the
               0x812d00 arithmetic run in-module; the Lua gate 0x866220,
               the arm bodies and the merchant chain stay typed-host (host
               captures 0 until the merge wires them). 0x823ec0 result is
               dead in the machine (written @0x7fb308, clobbered before
               any read) — the law is exported/tested, not wired. */
            const b7Merchant = gameUpdateSliceAwardsBit7MerchantGate(
              runtimeInputs.triggerClearAwardsMerchantPtr | 0,
              runtimeInputs.triggerClearAwardsMerchantKind | 0,
              runtimeInputs.triggerClearAwardsMerchantType | 0);
            const b7Walk = gameUpdateSliceAwardsBit7WalkDecision(
              state.roomType8 | 0);
            const b7LuaSkip = gameUpdateSliceAwardsBit7LuaGateSkip(
              runtimeInputs.triggerClearAwardsGateAl | 0);
            const b7GenericSkip = gameUpdateSliceAwardsBit7GenericSkip(
              runtimeInputs.triggerClearAwardsMineshaftAl | 0,
              state.roomTransitionMode1830c | 0);
            const b7Head = gameUpdateSliceAwardsBit7HeadSelect(
              state.difficulty269c8 | 0, b7Merchant, b7Walk);
            const b7TailFire = gameUpdateSliceAwardsBit7TailStoreFire(b7LuaSkip);
            const b7812d00 = gameUpdateSlice812d00Arithmetic(
              runtimeInputs.triggerClearAwards812d00Chain4 | 0,
              runtimeInputs.triggerClearAwards812d00Chain4_10 | 0,
              runtimeInputs.triggerClearAwards812d00Stage48 | 0,
              runtimeInputs.triggerClearAwards812d00Divisor | 0);
            events.roomTriggerClearAwardsBit7Head = b7Head;
            events.roomTriggerClearAwardsBit7Walk = b7Walk;
            events.roomTriggerClearAwardsBit7Merchant = b7Merchant;
            events.roomTriggerClearAwardsBit7LuaSkip = b7LuaSkip;
            events.roomTriggerClearAwardsBit7GenericSkip = b7GenericSkip;
            events.roomTriggerClearAwardsBit7TailStore = b7TailFire;
            events.roomTriggerClearAwardsBit7TailStoreValue = b7TailFire === 0
              ? 0 : (runtimeInputs.triggerClearAwardsAcFinal | 0);
            events.roomTriggerClearAwardsBit7812d00Fire = b7812d00.fire;
            events.roomTriggerClearAwardsBit7812d00Out0Bits = b7812d00.out0Bits;
            events.roomTriggerClearAwardsBit7812d00Out1Bits = b7812d00.out1Bits;
            }
          }
          if (roomTriggerClearIsGreedMode(state.difficulty269c8 | 0) !== 0) {
            /* ABI v131 (update-v131-greed-probe-pack, record idx 30
               roomTriggerClearAwardsGreed REMOVED): the greedy-arm residual
               was exactly the probe band 0x9bf990/0x9bfa00/0x9bfa70 (pure
               reads over the entity list) + the 0x9bfae0 fire loop
               (typed-host 0x7d93b0(this=e) leaf per qualifying element).
               room-pure ABI v81 freezes those bodies; under the
               greedProbePackReady voucher (@15504, elems @15512..15736,
               cap 8) the module computes all three probes IN-MODULE and
               publishes the fire plan as typed carriers — the coarse edge
               carries no information and is RETIRED. Capture absence or
               over-cap keeps the pre-v95 monolith byte-for-byte. The
               store/next/Tail705ee0 carriers below are unchanged. */
            const greedPackLive =
              (runtimeInputs.greedProbePackReady | 0) !== 0 &&
              ((runtimeInputs.greedProbeElemCount | 0) >>> 0) <=
                ENGINE_PLAYER_MAX;
            if (!greedPackLive) {
              events.roomTriggerClearAwardsGreed =
                (events.roomTriggerClearAwardsGreed | 0) + 1;
            }
            if (greedPackLive) {
              const n = (runtimeInputs.greedProbeElemCount | 0) >>> 0;
              const elems = [];
              for (let i = 0; i < n; i += 1) {
                elems.push({
                  f2c: runtimeInputs[`greedProbeF2c${i}`] | 0,
                  f3bc: runtimeInputs[`greedProbeF3bc${i}`] | 0,
                  hasParent: runtimeInputs[`greedProbeHasParent${i}`] | 0,
                  parent161c: runtimeInputs[`greedProbeParent161c${i}`] | 0,
                  self161c: runtimeInputs[`greedProbeSelf161c${i}`] | 0,
                  parentIsSelf: runtimeInputs[`greedProbeParentIsSelf${i}`] | 0,
                  f20a9: runtimeInputs[`greedProbeF20a9${i}`] | 0,
                });
              }
              events.roomTriggerClearAwardsGreedProbe9bf990 = roomGreedProbe9bf990(elems, n);
              events.roomTriggerClearAwardsGreedProbe9bfa00 = roomGreedProbe9bfa00(elems, n);
              events.roomTriggerClearAwardsGreedProbe9bfa70 = roomGreedProbe9bfa70(elems, n);
              const firePlan = roomGreedFire9bfae0Plan(elems, n);
              events.roomTriggerClearAwardsGreedFireCount = firePlan.fireCount;
              events.roomTriggerClearAwardsGreedFireMask = firePlan.fireMask;
            }
            /* ABI v95 (record idx 30): greedy-arm typed carriers (names
               pinned for the coordinator layout merge — see section-notes
               update-v95-30-trigger-clear-greed-arm §3). Runs on every
               greed-mode TriggerClear; the arm is PURE over existing
               captures (Room+8 type, Room+0x1bb0 subtype). store/next
               consume the host captures triggerClearAwards18334 /
               triggerClearAwardsProbeAl (0 until the merge wires them). */
            const greedDifficulty = state.difficulty269c8 | 0;
            const greedArm = gameUpdateSliceTriggerClearGreedArm(
              state.roomType8 | 0, runtimeInputs.ambientRoomSubtype1bb0 | 0);
            const greedStoreValue = runtimeInputs.triggerClearAwards18334 | 0;
            const greedProbeAl = runtimeInputs.triggerClearAwardsProbeAl | 0;
            const greedMatch = gameUpdateSliceTriggerClearGreedMatch(
              greedStoreValue, greedDifficulty);
            events.roomTriggerClearAwardsGreedArm = greedArm;
            events.roomTriggerClearAwardsGreedStore = greedArm === 1 ? 1 : 0;
            events.roomTriggerClearAwardsGreedMatch = greedMatch;
            events.roomTriggerClearAwardsGreedNext =
              gameUpdateSliceTriggerClearGreedNext(greedArm, greedProbeAl, greedMatch);
            events.roomTriggerClearAwardsGreedTail705ee0 =
              gameUpdateSliceTriggerClearGreedTailAlways();
          }
          events.roomTriggerClearAwardsTail = (events.roomTriggerClearAwardsTail | 0) + 1;
        }
      }
    }
    /* ABI v119 (update-v119-door-removal, record idx 33): the coarse
       opaqueRoomUpdateClearDoors @196 is RETIRED — per-arm typed carriers
       fire under the SAME pure merge law: gated arm -> type5DoorOpenCalls
       = plan.count > 0 (plan predicate present!=0 && fieldC==5 &&
       !early_out is IDENTICAL to the any_type5_needs_host gate); forced
       arm -> type5DoorForcedRerun @992 (the two arms are mutually
       exclusive on clearPathDoorSlotsEmitted, so exactly one carrier
       fires per coarse firing; same tick, same order position). No
       capture gate exists (doorSlots are captured runtime inputs), so
       there is no capture-absence arm: the coarse counter STAYS in the
       frozen ABI but NEVER fires. */
    if (clearPathDoorResultMerge(
          (clearPathDoorSlotsEmitted | 0) !== 0 ? 1 : 0,
          doorSlots710dd0AnyType5NeedsHost(doorSlotsFromRuntime(runtimeInputs))) !== 0) {
      if ((clearPathDoorSlotsEmitted | 0) === 0) {
        /* Gated arm (pre-clear snapshot valid): type the door open calls —
           the type-5 loop frame laws run in-module (count bound 8 /
           per-door present&&field_c==5 full-dword / arg prep thiscall
           door ptr) and the per-door plan is published
           (type5DoorOpenPlan; count > 0 == the any_type5_needs_host gate
           above). The host consumer runs 0x710dd0(Room+0x724[slotIndex])
           per entry. */
        events.type5DoorOpenCalls = type5DoorOpenPlan(doorSlotsFromRuntime(runtimeInputs)).count | 0;
      } else {
        /* Forced arm: the clear-path door residual ran -> the pre-clear
           snapshot is stale, so the machine re-runs the 8-slot type-5
           loop over POST-clear door states (census
           update-v95-clear-doors-type5). Typed carrier @992. */
        events.type5DoorForcedRerun = (events.type5DoorForcedRerun | 0) + 1;
      }
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR;
  },
);
export const resumeGameUpdateRoomClearNested = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ROOM_CLEAR_NESTED,
  (state, runtimeInputs, events) => {
    applyFrameEffect6fd7c0PureAfterHost(state, runtimeInputs, 0);
    /* ABI v119: the coarse edge is RETIRED on the nested site too — the
       gated arm's typed carrier type5DoorOpenCalls (plan.count > 0 ==
       the same gate) is the host signal; the coarse @196 NEVER fires. */
    if (clearPathDoorResultMerge(
          0, doorSlots710dd0AnyType5NeedsHost(doorSlotsFromRuntime(runtimeInputs))) !== 0) {
      /* Nested site: type 0x10/3 skips clear-path, so the snapshot is valid
         (always gated): publish the typed door-open plan like the prefix
         gated arm. */
      events.type5DoorOpenCalls = type5DoorOpenPlan(doorSlotsFromRuntime(runtimeInputs)).count | 0;
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR;
  },
);

export const resumeGameUpdateRoomUpdateClear = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_CLEAR,
  (state, runtimeInputs, events) => {
    let amb = {
      count7454: state.roomAmbientCount7454 | 0,
      intensity7458: state.roomAmbientIntensity7458,
      flag745c: (state.roomAmbientFlag745c | 0) & 0xff,
    };
    amb = roomAmbient824800FloatStep(amb) || amb;
    state.roomAmbientCount7454 = amb.count7454 | 0;
    state.roomAmbientIntensity7458 = amb.intensity7458;
    state.roomAmbientFlag745c = (amb.flag745c | 0) & 0xff;
    if (roomAmbient8024f0FlagsEarlyOut(state.roomDescFlags44 | 0) === 0) {
      events.opaqueRoomUpdateAmbient8024f0 = (events.opaqueRoomUpdateAmbient8024f0 | 0) + 1;
    }
    if (roomAmbient7f01c0NeedsHost(state.gate1b83c | 0, runtimeInputs.ambientDescPresent | 0,
      state.roomType8 | 0, runtimeInputs.ambientDescId | 0, runtimeInputs.ambientPlayerCount | 0) !== 0) {
      events.opaqueRoomUpdateAmbient7f01c0 = (events.opaqueRoomUpdateAmbient7f01c0 | 0) + 1;
    }
    {
      let stage = runtimeInputs.ambientStage | 0;
      let stageType = runtimeInputs.ambientStageType | 0;
      const rem = roomAmbientGreedStageRemap(state.difficulty269c8 | 0, stage, stageType);
      if (rem && typeof rem === "object") {
        if ("stage" in rem) stage = rem.stage | 0;
        if ("stageType" in rem) stageType = rem.stageType | 0;
      }
      if (roomAmbientStageSpawnMayRng(stage, stageType) !== 0) {
        events.opaqueRoomUpdateAmbientStageSpawn = (events.opaqueRoomUpdateAmbientStageSpawn | 0) + 1;
      }
    }
    if (roomAmbientModeSfxNeedsHost(state.mode26584 | 0, state.roomTransitionMode1830c | 0) !== 0) {
      events.opaqueRoomUpdateAmbientModeSfx = (events.opaqueRoomUpdateAmbientModeSfx | 0) + 1;
    }
    if (roomAmbient824800NeedsSpawnHost(amb) !== 0) {
      events.opaqueRoomUpdateAmbient824800Spawn = (events.opaqueRoomUpdateAmbient824800Spawn | 0) + 1;
    }
    if (roomAmbient824a70NeedsHost({
      mode26584: state.mode26584 | 0, dim1830c: state.roomTransitionMode1830c | 0,
      stageIdResolved: runtimeInputs.ambientStageId | 0, roomType8: state.roomType8 | 0,
      roomSubtype1bb0: runtimeInputs.ambientRoomSubtype1bb0 | 0, game18304: runtimeInputs.engineGame18304 | 0,
      difficulty269c8: state.difficulty269c8 | 0, stage0: runtimeInputs.ambientStage | 0,
      stageType4: runtimeInputs.ambientStageType | 0, flags2654c: state.flags2654c >>> 0,
      roomActiveByte0: runtimeInputs.ambientRoomActive | 0, frame264f8: state.frameCounter264f8 | 0,
      roomEntry11f0: runtimeInputs.ambientRoomEntry11f0 | 0,
    })) {
      events.opaqueRoomUpdateAmbient824a70 = (events.opaqueRoomUpdateAmbient824a70 | 0) + 1;
      if ((runtimeInputs.h5BodyBlobReady | 0) !== 0) {
        const bounds = roomAmbient824a70BodyBounds({
          roomActiveByte0: runtimeInputs.ambientRoomActive | 0,
          frame264f8: state.frameCounter264f8 | 0,
          roomEntry11f0: runtimeInputs.ambientRoomEntry11f0 | 0,
          roomF14: runtimeInputs.ambientRoomF14,
          roomF18: runtimeInputs.ambientRoomF18,
          roomF1c: runtimeInputs.ambientRoomF1c,
          roomF20: runtimeInputs.ambientRoomF20,
        }) || {};
        let loops = bounds.loopCount | 0;
        if (loops < 0) loops = 0;
        if (loops > 64) loops = 64;
        events.ambient824a70LoopCount = loops;
        const mtPlan = roomAmbient824a70GenrandMtPlan(loops, (runtimeInputs.genrandMtReady | 0) !== 0 ? 1 : 0, runtimeInputs.genrandModeFlag | 0) || {};
        if ((mtPlan.genrandPure | 0) !== 0) {
          const fill = roomAmbient824a70GenrandMtSamples(null, runtimeInputs.genrandIndexIn | 0, loops, runtimeInputs.genrandModeFlag | 0) || {};
          events.ambient824a70GenrandSamples = fill.count | 0;
          /* ABI v95: per-loop typed CREATE-arm plans — seeds (R3 slot,
             samples[i*7+3]) are in-module on the mt-pure arm, so the
             slice types each loop's entity-create host call (type
             0x3e8/variant 0x8a/layer 0/data 0xb1bc54). Entity create
             0x6fe410 itself stays TYPED HOST; this carrier + the
             create-args scratch hold the per-loop argument plans. */
          events.ambient824a70CreateTyped = (events.ambient824a70CreateTyped | 0) + loops;
        } else events.opaqueRoomUpdateAmbient824a70Genrand = (events.opaqueRoomUpdateAmbient824a70Genrand | 0) + (loops * 7);
        events.opaqueRoomUpdateAmbient824a70Create = (events.opaqueRoomUpdateAmbient824a70Create | 0) + loops;
      }
    }
    if (roomAmbient24ee0NeedsHost(runtimeInputs.ambientVelX7460, runtimeInputs.ambientVelY7464) !== 0) {
      events.opaqueRoomUpdateAmbient24ee0 = (events.opaqueRoomUpdateAmbient24ee0 | 0) + 1;
    }
    if (roomAmbient74e9b0PureFalse(state.difficulty269c8 | 0, runtimeInputs.ambientStage | 0, state.flags2654c >>> 0) === 0) {
      events.opaqueRoomUpdateAmbient74e9b0 = (events.opaqueRoomUpdateAmbient74e9b0 | 0) + 1;
    }
    if (roomAmbientSpecial1023NeedsHost(runtimeInputs.ambientDescPresent | 0, state.roomType8 | 0, runtimeInputs.ambientDescId | 0) !== 0) {
      events.opaqueRoomUpdateAmbientSpecial1023 = (events.opaqueRoomUpdateAmbientSpecial1023 | 0) + 1;
    }
    if ((events.opaqueRoomUpdateAmbient8024f0 | 0) !== 0 || (events.opaqueRoomUpdateAmbient7f01c0 | 0) !== 0
      || (events.opaqueRoomUpdateAmbientStageSpawn | 0) !== 0 || (events.opaqueRoomUpdateAmbientModeSfx | 0) !== 0
      || (events.opaqueRoomUpdateAmbient824800Spawn | 0) !== 0 || (events.opaqueRoomUpdateAmbient824a70 | 0) !== 0
      || (events.opaqueRoomUpdateAmbient24ee0 | 0) !== 0 || (events.opaqueRoomUpdateAmbient74e9b0 | 0) !== 0
      || (events.opaqueRoomUpdateAmbientSpecial1023 | 0) !== 0) {
      events.opaqueRoomUpdateAmbient = 1;
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD;
  },
);

export const resumeGameUpdateRoomUpdateHead = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_ROOM_UPDATE_HEAD,
  (state, runtimeInputs, events) => {
    let fx = {
      counter70d8: state.roomFxCounter70d8 | 0, limit70dc: state.roomFxLimit70dc | 0,
      value70cc: state.roomFxValue70cc | 0, step70d4: state.roomFxStep70d4 | 0,
      counter70f4: state.roomFxCounter70f4 | 0, limit70f8: state.roomFxLimit70f8 | 0,
      value70e8: state.roomFxValue70e8 | 0, step70f0: state.roomFxStep70f0 | 0,
    };
    fx = roomCameraFxLerpStep(fx) || fx;
    state.roomFxCounter70d8 = fx.counter70d8 | 0; state.roomFxLimit70dc = fx.limit70dc | 0;
    state.roomFxValue70cc = fx.value70cc | 0; state.roomFxStep70d4 = fx.step70d4 | 0;
    state.roomFxCounter70f4 = fx.counter70f4 | 0; state.roomFxLimit70f8 = fx.limit70f8 | 0;
    state.roomFxValue70e8 = fx.value70e8 | 0; state.roomFxStep70f0 = fx.step70f0 | 0;
    state.roomTimer7214 = roomCountdownDecIfPositive(state.roomTimer7214 | 0);
    const waterPre = state.roomWaterAmount7240;
    const lavaPre = state.roomLavaIntensity7740;
    let waterLava = {
      waterAmount7240: waterPre, lavaIntensity7740: lavaPre,
      roomType8: state.roomType8 | 0, challenge0x123: runtimeInputs.challenge0x123 | 0,
      roomDescFlags44: state.roomDescFlags44 | 0,
    };
    waterLava = roomWaterLavaFloatStep(waterLava) || waterLava;
    state.roomWaterAmount7240 = waterLava.waterAmount7240;
    state.roomLavaIntensity7740 = waterLava.lavaIntensity7740;
    if ("roomDescFlags44" in waterLava) state.roomDescFlags44 = waterLava.roomDescFlags44 | 0;
    state.roomTimer722c = roomCountdownDecIfPositive(state.roomTimer722c | 0);
    const timer706cPre = state.roomTimer706c | 0;
    const timer7230Pre = state.roomTimer7230 | 0;
    state.roomTimer706c = roomCountdownDecExpireNeg1(state.roomTimer706c | 0);
    state.roomTimer7230 = roomCountdownDecIfPositive(state.roomTimer7230 | 0);
    const flag7894Pre = state.roomFlag7894 >>> 0;
    let f7894 = (state.roomFlag7894 | 0) & 0xff;
    const c7894 = roomEntryClear7220(f7894);
    state.roomFlag7894 = typeof c7894 === "number" ? c7894 : 0;
    /* ABI v95 (record idx 42): capture the PRE-clear Room+0x7769 for the
       B19 rebuild decision (PE 0x008055a7 cmp byte / je B20 runs BEFORE
       the terminal clear at 0x00806043). */
    const flag7769Pre = state.roomFlag7769 >>> 0;
    let f7769 = (state.roomFlag7769 | 0) & 0xff;
    const c7769 = roomEntryClear7220(f7769);
    state.roomFlag7769 = typeof c7769 === "number" ? c7769 : 0;
    /* ABI v139: idx35 MIRROR rule (NOTES 4) -- same fire/no-fire decision
       as idx13's shared-half residual, evaluated against the SAME voucher. */
    if (!b1RainVoucherLive(runtimeInputs)) {
      events.opaqueRoomUpdateTailRain = (events.opaqueRoomUpdateTailRain | 0) + 1;
    }
    /* ABI v95 (record idx 35, B15 rain spawn loop): loop-frame wire. The
       record's host edge still fires; with a captured rain blob the
       loop-frame laws run in-module and the typed carriers publish the
       residual host content (ready=0 keeps the pre-v95 monolith). */
    if ((runtimeInputs.b15RainReady | 0) !== 0) {
      const plan = b15RainWireDecide({
        flags1839c: state.gameFlags1839c >>> 0,
        ownerNonzero: 1,
        quality: runtimeInputs.b15RainQuality | 0,
        begin183a4: runtimeInputs.b15RainBegin183a4 >>> 0,
        end183a8: runtimeInputs.b15RainEnd183a8 >>> 0,
        seed0: runtimeInputs.b15RainSeed58 >>> 0,
        roomWC: runtimeInputs.b15RainRoomWC | 0,
        roomHC: runtimeInputs.b15RainRoomH10 | 0,
        slotF0: runtimeInputs.b15RainSlotF0,
        slotF4: runtimeInputs.b15RainSlotF4,
        slotF8: runtimeInputs.b15RainSlotF8,
        slotF34: runtimeInputs.b15RainSlotF34,
        searchResults: runtimeInputs.b15RainSearchResults,
        genrandCount: runtimeInputs.b15RainGenrandCount >>> 0,
        genrandMtReady: (runtimeInputs.genrandMtReady | 0) !== 0 ? 1 : 0,
      });
      if ((plan.onceFlagApply | 0) !== 0) {
        state.gameFlags1839c = roomB1FlagOr80000(state.gameFlags1839c >>> 0);
      }
      events.b15RainPureSteps = (events.b15RainPureSteps | 0) + (plan.steps | 0);
      events.b15RainHostSearch = (events.b15RainHostSearch | 0) + (plan.hostSearch | 0);
      events.b15RainHostCreate = (events.b15RainHostCreate | 0) + (plan.hostCreate | 0);
      events.b15RainHostBind = (events.b15RainHostBind | 0) + (plan.hostBind | 0);
      events.b15RainHostSwap = (events.b15RainHostSwap | 0) + (plan.hostSwap | 0);
      events.b15RainGenrandDraws = (events.b15RainGenrandDraws | 0) + (plan.genrandDraws | 0);
      /* RNG draw typed-host via roomGenrandNext: mt-advance is a host-side
         scratch effect (not an event); the draws carrier is the typed count. */
    }
    if (roomB16NeedsGridHost(runtimeInputs.challenge0x123 | 0, state.roomType8 | 0, waterPre, lavaPre, state.roomDescFlags44 | 0) !== 0) {
      /* ABI v130 (update-v130-record36-waterb16-close): FULL-CARRY
         conjunction. The fresh recursive-descent decode of the tail span
         (funcmap-802980, entry 0x00802980; block 0x0080521b..0x00805373)
         shows the coarse arm covers FOUR effect groups:
           a) water clamp/band/ceiling + lava decay/zeroing stores —
              Room+0x7240/+0x7740 state floats ALREADY applied in-module
              by stepRoomWaterLavaFloat (v20/v24; model writes
              roomWaterAmount7240 / roomLavaIntensity7740 above);
           b) the pure wrapper chain 0x823370 -> gate bytes -> spray
              0x7067c0 — carried by waterB16Gate/Step/Goal/WireApplied +
              the fx state writes below;
           c) the WATER-BAND type-7 entity-spawn grid walk — arms via
              roomB16NeedsType7Grid (band crossing + desc-flags bit5);
           d) the LAVA-BAND entity-spawn grid walk (PE 0x0080526e..0x00805338:
              walk iff new < band && old >= band, band [0xbaa198],
              decay [0xbaa3f4]; spawns via guest ctor 0xaf08b1 + leaf
              0x714610 per type-7 cell).
         Groups c/d have NO standing typed carriers and NO capture rows
         (per-cell hit enumeration is not in the frozen ABI), so the
         coarse edge is retired ONLY on the conjunction blob live AND
         gate open AND neither spawn walk arms — where the span reduces
         to a+d+b, fully carried. On every other arm the monolith keeps
         firing byte-for-byte. */
      const b16BlobLive = (runtimeInputs.waterB16BlobReady | 0) !== 0;
      const b16GateOpen = roomB16Needs823540(
        Math.fround(state.roomWaterAmount7240), Math.fround(lavaPre)) !== 0;
      const b16Type7Arm = roomB16NeedsType7Grid(
        runtimeInputs.challenge0x123 | 0, state.roomType8 | 0,
        waterPre, state.roomDescFlags44 | 0) !== 0;
      /* PE decay constant [0xbaa3f4] = 0x3f6b851f (stepRoomWaterLavaFloat
         lava_decay); new = f32(old * decay). */
      const b16LavaNew = Math.fround(Math.fround(lavaPre) * f32FromBits(0x3f6b851f));
      const b16LavaArm = roomB16NeedsLavaBandGrid(Math.fround(lavaPre), b16LavaNew) !== 0;
      /* ABI v132 (update-v132-b16-spawn-pack, contracts-b16-spawn NOTES
         §2.6): the FULL-CARRY conjunction extends per walk lane — an armed
         lane is carried when its enumeration rows are ready. Voucher law
         (host side): waterB16SpawnRowsReady=1 IFF both armed walks were
         intercepted per cell, each arm's hit count <= 64 (over-cap
         poisons the WHOLE voucher), and grid_w/h_echo match the dims the
         model knows (b3b7WidthC/Height10) — all-or-nothing, no partial
         mode. The walks' own guest stores are already carried by the
         v20/v24 float shell; the cast thunk 0x00af08b1 + virtuals (lane
         W) and leaf 0x714610 (lane L) stay TYPED-HOST leaves named by the
         echo carriers below — verdict class NARROWED (B18 precedent). */
      const b16RowsOk = (runtimeInputs.waterB16SpawnRowsReady | 0) !== 0 &&
        ((runtimeInputs.waterB16WaterHitCount | 0) >= 0 &&
         (runtimeInputs.waterB16WaterHitCount | 0) <= 64) &&
        ((runtimeInputs.waterB16LavaHitCount | 0) >= 0 &&
         (runtimeInputs.waterB16LavaHitCount | 0) <= 64) &&
        ((runtimeInputs.waterB16GridWEcho | 0) === (runtimeInputs.b3b7WidthC | 0)) &&
        ((runtimeInputs.waterB16GridWEcho | 0) === (runtimeInputs.b3b7WidthC | 0)) &&
        ((runtimeInputs.waterB16GridHEcho | 0) === (runtimeInputs.b3b7Height10 | 0));
      const b16FullCarry = b16BlobLive && b16GateOpen &&
        (!b16Type7Arm || b16RowsOk) && (!b16LavaArm || b16RowsOk);
      events.waterB16WalkArmMask = (b16Type7Arm ? 1 : 0) |
        ((b16LavaArm ? 1 : 0) << 1);
      if (!b16FullCarry) {
        events.opaqueRoomUpdateTailWaterB16 =
          (events.opaqueRoomUpdateTailWaterB16 | 0) + 1;
      }
      if (b16FullCarry) {
        /* Enumeration echo carriers: the counts prove the host performed
           exactly the enumerated casts/virtuals/leaf calls; the module
           derives the implied typed-host leaf counts from the pools. */
        const wHits = runtimeInputs.waterB16WaterHitCount | 0;
        const lHits = runtimeInputs.waterB16LavaHitCount | 0;
        events.waterB16SpawnRowsApplied = 1;
        events.waterB16WaterHitCount = wHits >>> 0;
        events.waterB16LavaHitCount = lHits >>> 0;
        events.waterB16CastCount = (wHits + lHits) >>> 0;
        events.waterB16LeafCallCount = lHits >>> 0;
      }
      if (b16BlobLive && b16GateOpen) {
        const ws = gameUpdateSliceB16WaterWire({
          waterPost: Math.fround(state.roomWaterAmount7240),
          lavaPre: Math.fround(lavaPre),
          gameByte183a0: runtimeInputs.waterB16GameByte183a0 | 0,
          gameByte269e9: runtimeInputs.waterB16GameByte269e9 | 0,
          game1830c: state.roomTransitionMode1830c | 0,
          roomType8: state.roomType8 | 0,
          difficulty269c8: state.difficulty269c8 | 0,
          gameType0: runtimeInputs.waterB16GameType0 | 0,
          gameSubtype4: runtimeInputs.waterB16GameSubtype4 | 0,
          flags2654c: state.flags2654c | 0,
          unlockAcc: runtimeInputs.waterB16UnlockAcc | 0,
          unlockClear: runtimeInputs.waterB16UnlockClear | 0,
          src1b10: [
            f32FromBits(runtimeInputs.waterB16Src1b10_0 | 0),
            f32FromBits(runtimeInputs.waterB16Src1b10_1 | 0),
            f32FromBits(runtimeInputs.waterB16Src1b10_2 | 0),
            f32FromBits(runtimeInputs.waterB16Src1b10_3 | 0),
            f32FromBits(runtimeInputs.waterB16Src1b10_4 | 0),
            f32FromBits(runtimeInputs.waterB16Src1b10_5 | 0),
          ],
          gridFlags44: runtimeInputs.waterB16GridFlags44 | 0,
          room1d18: runtimeInputs.ambientRoom1d18 | 0,
          gridWc: runtimeInputs.b3b7WidthC | 0,
          gridH10: runtimeInputs.b3b7Height10 | 0,
          cellDword54: runtimeInputs.waterB16CellDword54 | 0,
          fxCur: [
            Math.fround(state.fxCur676b8), Math.fround(state.fxCur676bc),
            Math.fround(state.fxCur676c0), Math.fround(state.fxCur676c4),
            Math.fround(state.fxCur676c8), Math.fround(state.fxCur676cc),
          ],
        }) || {};
        const gate = (ws.gate | 0) & 0xff;
        events.waterB16Gate = gate;
        if (Array.isArray(ws.step)) {
          events.waterB16Step0 = bitsFromF32(Math.fround(ws.step[0]));
          events.waterB16Step1 = bitsFromF32(Math.fround(ws.step[1]));
          events.waterB16Step2 = bitsFromF32(Math.fround(ws.step[2]));
          events.waterB16Step3 = bitsFromF32(Math.fround(ws.step[3]));
          events.waterB16Step4 = bitsFromF32(Math.fround(ws.step[4]));
          events.waterB16Step5 = bitsFromF32(Math.fround(ws.step[5]));
        }
        if (gate !== 0 && Array.isArray(ws.goal)) {
          events.waterB16Goal0 = bitsFromF32(Math.fround(ws.goal[0]));
          events.waterB16Goal1 = bitsFromF32(Math.fround(ws.goal[1]));
          events.waterB16Goal2 = bitsFromF32(Math.fround(ws.goal[2]));
          events.waterB16Goal3 = bitsFromF32(Math.fround(ws.goal[3]));
          events.waterB16Goal4 = bitsFromF32(Math.fround(ws.goal[4]));
          events.waterB16Goal5 = bitsFromF32(Math.fround(ws.goal[5]));
        }
        events.waterB16WireApplied = 1;
        if (gate === 0) {
          /* 7067c0 flag==0 arm (PE 0x7068c1..0x7068ca): snap cur[0..3] to
             the vector; the 0x676b4 gate byte is NOT written (keeps its
             pre-call value — the fx lane may hold it set). */
          state.fxCur676b8 = Math.fround(ws.curSnap[0]);
          state.fxCur676bc = Math.fround(ws.curSnap[1]);
          state.fxCur676c0 = Math.fround(ws.curSnap[2]);
          state.fxCur676c4 = Math.fround(ws.curSnap[3]);
        } else {
          state.fxLerpGate676b4 = 1;
        }
      }
    }
    events.opaqueRoomUpdateTailMid = (events.opaqueRoomUpdateTailMid | 0) + 1;
    /* ABI v127 (update-v127-706c-restock-removal): record idx 38
       opaqueRoomUpdateTailMid706cExpire REMOVED (33 -> 32, 17th removal
       since v79) — ADDENDUM-3 F3 capture contract. The countdown gate
       stays pure on state; the BODY 0x008158a0 (Room::ShopRestockPartial,
       F2 decode: shop gate FULL-DWORD [Room+8]==2 warn+ret on miss;
       hash-zero fatal twin entry/in-loop/flush; bucket select parity/
       index; cell counter inc cap 255; idiv_pos SIGNED trunc; f32 pos;
       vcall arm discarded-result; xorshift{2,7,7} single chain; create1+
       create2; cursor advance/reset; count decrement) runs IN-MODULE via
       gameUpdateSlice706cRestockFrame under the shopRestockReady voucher.
       The two entity creates stay the standing guest-memory platform
       leaves behind shopRestockCreate1/Create2 (F4 blocker 1, record-39
       v108 all-or-nothing shape); the [vtbl+0x14] discarded-result call
       stays the host voucher row shopVcallFired (F4 blocker 2); the
       untraced 0x6eef60 getter stays captured per-item (F4 blocker 3).
       ready=0 or over-cap ([Room+0x7080] > 32) keeps the pre-v123
       monolithic byte-for-byte: coarse @216 STAYS in the frozen ABI and
       fires ONLY on capture absence/over-cap. */
    if (room706cNeedsExpireHost(timer706cPre) !== 0) {
      const shopReady = (runtimeInputs.shopRestockReady | 0) !== 0 ? 1 : 0;
      const restockCount = runtimeInputs.shopRestockCount | 0;
      const shopOverCap = ((restockCount >>> 0) > SHOP_RESTOCK_MAX) ? 1 : 0;
      if (shopReady === 0 || shopOverCap !== 0) {
        events.opaqueRoomUpdateTailMid706cExpire =
          (events.opaqueRoomUpdateTailMid706cExpire | 0) + 1;
      } else {
        const frame = gameUpdateSlice706cRestockFrame({
          roomType8: state.roomType8 | 0,
          width: runtimeInputs.shopRoomWidth | 0,
          count: restockCount,
          bucketCount: runtimeInputs.shopBucketCount >>> 0,
          cursorIn: runtimeInputs.shopBucketCursorIn >>> 0,
          hashIn: runtimeInputs.shopHashIn >>> 0,
          cellIds: runtimeInputs.shopCellIds,
          cellPtrs: runtimeInputs.shopCellPtrs,
          cellValid: runtimeInputs.shopCellValid,
          cellCounterPre: runtimeInputs.shopCellCounterPre,
          genrandRet: runtimeInputs.shopGenrandRet,
        });
        events.shopRestockWarn = (events.shopRestockWarn | 0) + (frame.warn | 0);
        events.shopRestockCreate1 = (events.shopRestockCreate1 | 0) + (frame.create1 | 0);
        events.shopRestockCreate2 = (events.shopRestockCreate2 | 0) + (frame.create2 | 0);
        events.shopRestockSeedZeroDrop =
          (events.shopRestockSeedZeroDrop | 0) + (frame.seedZeroDrop | 0);
        events.shopRestockCopyBackReady =
          (events.shopRestockCopyBackReady | 0) + (frame.copyBackReady | 0);
      }
    }
    {
      const restock = roomMidRestockWireDecide({
        outerReady: 1, descReady: (runtimeInputs.midRestockDescReady | 0) !== 0 ? 1 : 0,
        roomType8: state.roomType8 | 0, collectibleOwner0x209Nonzero: runtimeInputs.midRestockOwner0x209 | 0,
        roomActiveByte0: runtimeInputs.ambientRoomActive | 0, frame264f8: state.frameCounter264f8 | 0,
        roomEntry11f0: runtimeInputs.ambientRoomEntry11f0 | 0,
        descShortAc: runtimeInputs.midRestockDescAc | 0, descShortAe: runtimeInputs.midRestockDescAe | 0,
        descSeed58: runtimeInputs.midRestockDescSeed58 | 0,
      });
      if ((restock.residualKind | 0) === ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE && (restock.applied | 0) !== 0) {
        state.roomDescShortAe = restock.outAe | 0;
      } else if ((restock.residualKind | 0) === ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC) {
        events.opaqueRoomUpdateTailMidRestock = (events.opaqueRoomUpdateTailMidRestock | 0) + 1;
      } else if ((restock.residualKind | 0) === ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL) {
        /* ABI v95: RNG::RandomInt zero-seed fatal (0x007e9028 FULL-DWORD
           test / 0xa112c0 log / int3) — TYPED-EVENT DROP. seed==0 makes
           zero game-memory stores before the fatal, so dropping the
           restock body (no desc+0xae write, no monolithic rerun) matches
           the machine's pre-crash state. `midRestockSeedZeroDrop` is the
           typed event key land at the coordinator's layout merge. */
        events.midRestockSeedZeroDrop =
          gameUpdateSliceMidRestockSeedZero(runtimeInputs.midRestockDescSeed58 | 0);
        if ((events.midRestockSeedZeroDrop | 0) === 0) {
          /* unreachable today: HOST_FATAL only from seed58==0; defensive
             coarse edge if the residual source ever grows. */
          events.opaqueRoomUpdateTailMidRestock = (events.opaqueRoomUpdateTailMidRestock | 0) + 1;
        }
      }
    }
    /* ABI v126 (update-v126-7230-spawn-removal): record idx 40
       opaqueRoomUpdateTailMid7230Spawn REMOVED (34 -> 33, 16th removal
       since v79; clearPathFlagStore / type5DoorForcedRerun precedent).
       The gate input is SLICE STATE (roomTimer7230 @296), not
       host-captured memory — no capture-absence arm exists. The retired
       coarse increment was exactly [gate open] and carried the host cue
       "re-issue pos 0x813460 / genrand 0x6eef60 / create 0x428b20 / RTTI
       0xaf08b1 with the v95 arg-prep plan"; the carrier event
       tailMid7230SpawnArmed @996 fires iff the retired edge armed (same
       expression room7230NeedsSpawnHost, same tick, same order
       position) and IS that cue. The pure countdown dec (state
       roomTimer7230 via roomCountdownDecIfPositive) and the whole v95
       law pack stay committed. Coarse @224 STAYS in the frozen events
       ABI but NEVER fires. */
    if (room7230NeedsSpawnHost(timer7230Pre) !== 0) {
      events.tailMid7230SpawnArmed = (events.tailMid7230SpawnArmed | 0) + 1;
    }
    if (roomB18NeedsEntityWalkHost(flag7894Pre) !== 0) {
      /* ABI v95 (record idx 41, B18 entity walk): typed-host wire. With a
         captured entity pack (b18EntityReady) the in-module walk frame
         (re-derived count/bound + per-entity TYPE5/RTTI/SKIP decision)
         types the residual host content: type5/rtti/pathb counters tell
         the host EXACTLY how many 0x6e17c0 / 0xaf08b1 / 0x6da530 calls
         to re-issue. ready=0 keeps the pre-v95 monolithic edge.
         ABI v120 (update-v120-b18-entity-removal): record idx 41 REMOVED
         (39 -> 38, 11th removal since v79) — full-capture theorem over
         the v115 three-body census: on every capture-valid tick
         (ready=1, count <= B18_ENTITY_MAX) the retired live increment
         was exactly [count != 0], byte-for-byte redundant with the typed
         carriers — the span's ONLY store (terminal flag clear 0x8055a0)
         is prior-lawed pure (v23/v32) and every per-entity host call is
         counted by b18EntityWalkType5Calls/RttiCasts/PathbCalls in PE
         order. The counter STAYS in the events ABI @228 and fires ONLY
         on the capture-absence gate miss (ready=0 / pack truncation
         count > 64, incl. negative counts read as huge unsigned). */
      const b18Ready = (runtimeInputs.b18EntityReady | 0) !== 0 ? 1 : 0;
      const b18OverCap = ((runtimeInputs.b18EntityCount >>> 0) > B18_ENTITY_MAX) ? 1 : 0;
      if (b18Ready === 0 || b18OverCap !== 0) {
        /* Capture-absence gate miss: exact pre-v95 monolithic record. */
        events.opaqueRoomUpdateTailEntity = (events.opaqueRoomUpdateTailEntity | 0) + 1;
      } else {
        const b18 = gameUpdateSliceB18WalkFrame({
          count: runtimeInputs.b18EntityCount | 0,
          mode: runtimeInputs.b18EntityMode | 0,
          types: runtimeInputs.b18EntityTypes,
          castResults: runtimeInputs.b18EntityCastResults,
          maxEntities: B18_ENTITY_MAX,
        });
        events.b18EntityWalkType5Calls = (events.b18EntityWalkType5Calls | 0) + (b18.type5Calls | 0);
        events.b18EntityWalkRttiCasts = (events.b18EntityWalkRttiCasts | 0) + (b18.rttiCasts | 0);
        events.b18EntityWalkPathbCalls = (events.b18EntityWalkPathbCalls | 0) + (b18.pathbCalls | 0);
        events.b18EntityWalkFrame = (events.b18EntityWalkFrame | 0) + 1;
      /* ABI v120: no live-capture coarse edge. The carriers ARE the full
         residual capture (count==0 -> zero calls + pure flag clear). */
      }
    }
    /* ABI v95 (record idx 42, opaqueRoomUpdateTailPath B19+B20): record
       wire. With a captured blob (tailPathReady) the rebuild decision +
       trail-loop frame laws run in-module (room B19 v30 / B20 v31-v32
       by reference) and the typed carriers publish the residual host
       content; ready=0 keeps the pre-v95 monolithic record exactly.
       ABI v114 (update-v114-tailpath-removal): the live-capture coarse
       edge is RETIRED (record idx 42 REMOVED, 43 -> 42) — every B19/B20
       leaf is ZHL-typed / platform / pure-relay (v111+v113 census), and
       the retired increment was exactly (hostRebuild|hostTrail) != 0,
       byte-for-byte implied by the typed carriers published below in the
       same order. The counter STAYS in the events ABI @232 and fires
       ONLY on the capture-absence gate miss (ready=0 / MONOLITHIC). */
    {
      const tailPlan = gameUpdateSliceTailPathWire({
        flagReady: (runtimeInputs.tailPathReady | 0) !== 0 ? 1 : 0,
        roomFlag7769: flag7769Pre >>> 0,
        listBeginC82674: runtimeInputs.tailPathListBeginC82674 >>> 0,
        listEndC82678: runtimeInputs.tailPathListEndC82678 >>> 0,
        mode26614: runtimeInputs.tailPathMode26614 >>> 0,
        genrandDraws: runtimeInputs.tailPathGenrandDraws >>> 0,
        entries: runtimeInputs.tailPathEntries ?? [],
      });
      if ((tailPlan.b19ResidualKind | 0) === ROOM_B19_RESIDUAL_MONOLITHIC ||
          (tailPlan.b20ResidualKind | 0) === ROOM_B20_RESIDUAL_MONOLITHIC) {
        /* ready=0 (no capture): exact pre-v95 monolithic record. */
        events.opaqueRoomUpdateTailPath = (events.opaqueRoomUpdateTailPath | 0) + 1;
      } else {
        events.tailPathPureSteps = (events.tailPathPureSteps | 0) + (tailPlan.pureSteps | 0);
        events.tailPathHostRebuild = (events.tailPathHostRebuild | 0) + (tailPlan.hostRebuild | 0);
        events.tailPathHostTrail = (events.tailPathHostTrail | 0) + (tailPlan.hostTrail | 0);
        events.tailPathHostPush = (events.tailPathHostPush | 0) + (tailPlan.hostPush | 0);
        events.tailPathHostSpawn = (events.tailPathHostSpawn | 0) + (tailPlan.hostSpawn | 0);
        events.tailPathHostMultispawnSteps =
          (events.tailPathHostMultispawnSteps | 0) + (tailPlan.hostMultispawnSteps | 0);
        events.tailPathHostGenrandDraws =
          (events.tailPathHostGenrandDraws | 0) + (tailPlan.hostGenrandDraws | 0);
      /* ABI v114: no live-capture coarse edge. hostRebuild/hostTrail
         nonzero = the B19/B20 bodies run under their typed carriers;
         both zero = pure skip (no host residual at all). */
      }
    }
    const deathCount = runtimeInputs.pmDeathPlayerCount ?? 1;
    const deathBlob = (runtimeInputs.pmDeathBlobReady | 0) !== 0 ? 1 : 0;
    const deathPlayers = [];
    if (deathBlob !== 0) {
      const n = Math.max(0, Math.min(deathCount | 0, 8));
      const arr = (k) => Array.isArray(runtimeInputs[k]) ? runtimeInputs[k] : [];
      for (let i = 0; i < n; i += 1) {
        deathPlayers.push({
          anim7c: (arr("pmDeathAnim7c")[i] ?? runtimeInputs[`pmDeathAnim7c${i}`]) | 0,
          twinAnim7c: (arr("pmDeathTwinAnim7c")[i] ?? runtimeInputs[`pmDeathTwinAnim7c${i}`]) | 0,
          dead173: ((arr("pmDeathDead173")[i] ?? runtimeInputs[`pmDeathDead173${i}`]) | 0) & 0xff,
          anim8c: ((arr("pmDeathAnim8c")[i] ?? runtimeInputs[`pmDeathAnim8c${i}`]) | 0) & 0xff,
          twinNull: ((arr("pmDeathTwinNull")[i] ?? runtimeInputs[`pmDeathTwinNull${i}`]) | 0) & 0xff,
          twinAnim8c: ((arr("pmDeathTwinAnim8c")[i] ?? runtimeInputs[`pmDeathTwinAnim8c${i}`]) | 0) & 0xff,
        });
      }
    }
    let deathPlan = { pureComplete: 0 };
    try {
      deathPlan = pmDeathWireDecide({
        gate1b83c: state.gate1b83c | 0, gate1ba78: state.gate1ba78 | 0,
        playerCount: deathCount | 0, blobReady: deathBlob, players: deathPlayers,
      }) || deathPlan;
    } catch (_) { /* family helper may throw; keep host residual */ }
    if ((deathPlan.pureComplete | 0) === 0) {
      events.playerManagerUpdateDeath = (events.playerManagerUpdateDeath | 0) + 1;
    }
    /* ABI v95 (record idx 43): composed-event arg-prep proof. The typed
       event fires iff the death wire resolves WALK (ready packs + at least
       one eligible player) AND the frame's player-vector span is captured
       (frameOpaque98dba0WalkReady — the v92 seam on the SAME Game+0x1baa8
       vector the death walk iterates): the composed TriggerDeath call args
       are pinned by the in-module laws (receiver law + flag 0). MONOLITHIC
       (no packs) and NONE (no host call) publish nothing; ready=0 never
       sets it. The call itself stays typed-host (0x007a1090). The field
       is referenced by name — the coordinator commits the layout offset. */
    if ((deathPlan.residualKind | 0) === PM_DEATH_RESIDUAL_WALK &&
        (runtimeInputs.frameOpaque98dba0WalkReady | 0) !== 0) {
      events.playerManagerUpdateDeathArgPrep =
        (events.playerManagerUpdateDeathArgPrep | 0) + 1;
    }
    const count = runtimeInputs.pmIntensityPlayerCount | 0;
    const blob = (runtimeInputs.pmIntensityBlobReady | 0) !== 0 ? 1 : 0;
    const sfxPlaying = (runtimeInputs.pmIntensitySfxPlaying | 0) !== 0 ? 1 : 0;
    const packs = [];
    if (blob !== 0) {
      const n = Math.max(0, Math.min(count, 8));
      const arr = (k) => Array.isArray(runtimeInputs[k]) ? runtimeInputs[k] : [];
      for (let i = 0; i < n; i += 1) {
        packs.push({
          raw1ea8: (arr("pmIntensityRaw1ea8")[i] ?? runtimeInputs[`pmIntensityRaw${i}`] ?? runtimeInputs[`pmIntensityRaw1ea8${i}`]) | 0,
          flags168: (arr("pmIntensityFlags168")[i] ?? runtimeInputs[`pmIntensityFlags${i}`] ?? runtimeInputs[`pmIntensityFlags168${i}`]) | 0,
          dead173: ((arr("pmIntensityDead173")[i] ?? runtimeInputs[`pmIntensityDead${i}`] ?? runtimeInputs[`pmIntensityDead173${i}`]) | 0) & 0xff,
        });
      }
    }
    /* ABI v95: record idx 44 PM3 arm decision laws (slice oracles). The
       EMPTY vector is decided by gameUpdateSlicePm3EmptyPureSkip /
       gameUpdateSlicePm3EmptyStopSplit (PE 0x9bb6c3 test/je -> maxVol=0
       -> QUIET arm; probe 0x92e560 -> pure skip 0x9bb795 je or 0x92e230
       stop 0x9bb7a2). The NON-EMPTY arm keeps the v44 pack wire below;
       MONOLITHIC never applies to the empty vector (PM2 loop skipped,
       maxVol=0, no pack required). */
    const emptySkip = gameUpdateSlicePm3EmptyPureSkip(count >>> 0, sfxPlaying >>> 0);
    const emptyStop = gameUpdateSlicePm3EmptyStopSplit(count >>> 0, sfxPlaying >>> 0);
    let plan = { pureComplete: 1, residualKind: PM_INTENSITY_SFX_RESIDUAL_NONE, pm2Pure: 1 };
    if (emptySkip === 0 && emptyStop === 0) {
      plan = { pureComplete: 0, residualKind: PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC, pm2Pure: 0 };
      try {
        plan = pmIntensityWireDecide({ playerCount: count, blobReady: blob, sfxPlaying, players: packs }) || plan;
      } catch (_) { /* family helper may throw; keep monolithic residual */ }
    } else if (emptyStop !== 0) {
      /* Empty + playing -> the QUIET arm's probe nonzero -> ONLY the
         0x92e230 stop (record-47 lane below); never MONOLITHIC. */
      plan = { pureComplete: 0, residualKind: PM_INTENSITY_SFX_RESIDUAL_STOP, pm2Pure: 1 };
    }
    /* else empty + not-playing -> NONE: whole-arm pure skip, no host. */
    if ((plan.pureComplete | 0) !== 0) {
      /* NONE */
    } else if ((plan.residualKind | 0) === PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC) {
      events.playerManagerUpdateHeartbeat = (events.playerManagerUpdateHeartbeat | 0) + 1;
    } else if ((plan.residualKind | 0) === PM_INTENSITY_SFX_RESIDUAL_UPDATE) {
      /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45): record
         idx 45 playerManagerUpdateHeartbeatSfxUpdate REMOVED (32 -> 31,
         18th removal since v79). Under the sfxUpdReady voucher the whole
         update lane runs IN-MODULE via gameUpdateSliceSfxUpdFrame:
         predicate 0x0092e560 gates BY REFERENCE (pmSfxEntryGate), the
         pending-clear side effects land as sfxUpdPendingMask bits
         (v95 STOP-fold precedent), the busy short-circuit publishes
         walkCount/busyApplied, the volume leaf's S1 [g+0x194] store
         publishes sfxVolSetGroupMem bits and its S2/D1 pair publish
         sfxVolSetVoice + sfxDevVolumeCalls; the pitch leaf's raw S3/D2
         pair publish sfxPitchSetVoice + sfxDevPitchCalls; the G3
         NO_SAMPLES warn twin publishes sfxUpdNoSamplesWarn (idx-46 @604
         precedent). The device vtbl+0x38/+0x48/+0x58 probes stay the
         standing audio-backend platform leaves behind those counters.
         MISS/DISABLED stay pure drops (pmSfxMutatorPureComplete).
         ready=0 / blob missing keeps the pre-v95 monolithic byte-for-
         byte: coarse @328 STAYS in the frozen events ABI and fires ONLY
         on capture absence. */
      try {
        const gate = pmSfxEntryGate(PM_INTENSITY_SFX_ID, runtimeInputs.sfxStopSpan | 0,
          runtimeInputs.sfxStopVoices190 >>> 0, runtimeInputs.sfxStopEnabled198 >>> 0);
        const upd = gameUpdateSliceSfxUpdFrame({
          ready: runtimeInputs.sfxUpdReady | 0,
          span: runtimeInputs.sfxStopSpan | 0,
          voices190: runtimeInputs.sfxStopVoices190 >>> 0,
          enabled198: runtimeInputs.sfxStopEnabled198 >>> 0,
          argVol: runtimeInputs.sfxUpdArgVol >>> 0,
          masterVol: runtimeInputs.sfxUpdMasterVol >>> 0,
          mgrScalar: runtimeInputs.sfxUpdMgrScalar >>> 0,
          voices: runtimeInputs.sfxStopVoices,
        });
        if ((upd.applied | 0) === 0 ||
            (gate === PM_SFX_GATE_MISS || gate === PM_SFX_GATE_DISABLED)) {
          /* Pre-v128 semantics byte-for-byte on this arm: pure drops stay
             silent under live capture; capture absence keeps the monolith. */
          if ((runtimeInputs.sfxStopReady | 0) === 0 ||
              !pmSfxMutatorPureComplete(gate)) {
            events.playerManagerUpdateHeartbeatSfxUpdate =
              (events.playerManagerUpdateHeartbeatSfxUpdate | 0) + 1;
          }
        } else {
          events.sfxUpdBusyApplied = (events.sfxUpdBusyApplied | 0) + (upd.busyApplied | 0);
          events.sfxUpdWalkCount = (events.sfxUpdWalkCount | 0) + (upd.walkCount | 0);
          events.sfxUpdPendingMask = upd.pendingMask >>> 0;
          events.sfxUpdNoSamplesWarn = (events.sfxUpdNoSamplesWarn | 0) + (upd.noSamplesWarn | 0);
          events.sfxVolSetGroupMem = upd.volMemBits >>> 0;
          events.sfxVolSetVoice = (events.sfxVolSetVoice | 0) + (upd.voiceVolSet | 0);
          events.sfxDevVolumeCalls = (events.sfxDevVolumeCalls | 0) + (upd.devVolumeCalls | 0);
          events.sfxPitchSetVoice = (events.sfxPitchSetVoice | 0) + (upd.pitchVoiceSet | 0);
          events.sfxDevPitchCalls = (events.sfxDevPitchCalls | 0) + (upd.devPitchCalls | 0);
        }
      } catch (_) {
        events.playerManagerUpdateHeartbeatSfxUpdate = (events.playerManagerUpdateHeartbeatSfxUpdate | 0) + 1;
      }
    } else if ((plan.residualKind | 0) === PM_INTENSITY_SFX_RESIDUAL_PLAY) {
      try {
        /* ABI v95: the PLAY lane consumes the SFX family's Play gate BY
           REFERENCE (sfxPlayGate — the exact 0x0092dc30 first three
           tests) and splits the monolithic residual into THREE typed
           host leaves (record idx 46, family v26b): NO_SAMPLES -> the
           warn-log leaf, PRELOAD -> the Load + "not preloaded" +
           counter + continuation edge, LIVE -> the device body. MISS
           drops; ready=0 keeps the monolithic counter. Exactly one of
           the three fires per non-MISS call. */
        const gate = sfxPlayGate(PM_INTENSITY_SFX_ID, runtimeInputs.sfxStopSpan | 0,
          runtimeInputs.sfxStopVoices190 >>> 0, runtimeInputs.sfxStopEnabled198 >>> 0);
        if ((runtimeInputs.sfxStopReady | 0) === 0) {
          events.playerManagerUpdateHeartbeatSfxPlay = (events.playerManagerUpdateHeartbeatSfxPlay | 0) + 1;
        } else if (gate !== SFX_PLAY_GATE_MISS) {
          events.playerManagerUpdateHeartbeatSfxPlayNoSamples = (events.playerManagerUpdateHeartbeatSfxPlayNoSamples | 0) + sfxPlayNoSamplesHost(gate);
          events.playerManagerUpdateHeartbeatSfxPlayPreload = (events.playerManagerUpdateHeartbeatSfxPlayPreload | 0) + sfxPlayPreloadHost(gate);
          events.playerManagerUpdateHeartbeatSfxPlayDevice = (events.playerManagerUpdateHeartbeatSfxPlayDevice | 0) + sfxPlayBodyHost(gate);
        }
      } catch (_) {
        events.playerManagerUpdateHeartbeatSfxPlay = (events.playerManagerUpdateHeartbeatSfxPlay | 0) + 1;
      }
    } else if ((plan.residualKind | 0) === PM_INTENSITY_SFX_RESIDUAL_STOP) {
      try {
        /* ABI v95: record idx 47 STOP fold (VA 0x0092e230). The in-module
           channel walk + per-voice stop gates run when the host captured the
           per-voice blob (sfxStopFoldReady) at a quiescent seam: MISS /
           DISABLED drop (applied, all 0), LIVE folds the walk with the
           device vtbl+0x3c stops published as sfxStopFoldStopCalls (typed
           host, record-1 slot_3c precedent), the sentinel + pending clears
           land in-module (stores / pendingMask). NO_SAMPLES keeps the
           warn-log host; fold_ready=0 / ready=0 / missing blob keep the
           v60 fallback byte-for-byte. */
        const fold = sfxStopFold({
          foldReady: runtimeInputs.sfxStopFoldReady | 0,
          ready: runtimeInputs.sfxStopReady | 0,
          span: runtimeInputs.sfxStopSpan | 0,
          voices190: runtimeInputs.sfxStopVoices190 >>> 0,
          enabled198: runtimeInputs.sfxStopEnabled198 >>> 0,
          voiceCount: runtimeInputs.sfxStopVoiceCount | 0,
          voices: runtimeInputs.sfxStopVoices,
        });
        if ((fold.applied | 0) !== 0) {
          events.sfxStopFoldApplied = 1;
          events.sfxStopFoldStopCalls = fold.stopCalls | 0;
          events.sfxStopFoldStores = fold.stores | 0;
          events.sfxStopFoldPendingMask = fold.pendingMask >>> 0;
        } else {
          const gate = pmSfxEntryGate(PM_INTENSITY_SFX_ID, runtimeInputs.sfxStopSpan | 0,
            runtimeInputs.sfxStopVoices190 >>> 0, runtimeInputs.sfxStopEnabled198 >>> 0);
          if ((runtimeInputs.sfxStopReady | 0) === 0 || !pmSfxMutatorPureComplete(gate)) {
            events.playerManagerUpdateHeartbeatSfxStop = (events.playerManagerUpdateHeartbeatSfxStop | 0) + 1;
          }
        }
      } catch (_) {
        events.playerManagerUpdateHeartbeatSfxStop = (events.playerManagerUpdateHeartbeatSfxStop | 0) + 1;
      }
    } else events.playerManagerUpdateHeartbeat = (events.playerManagerUpdateHeartbeat | 0) + 1;
    run4257b0FromHead(state, runtimeInputs, events);
  },
);
export const resumeGameUpdate4257b0PassA = resume3(
  UPDATE_CONTINUATION.RESUME_AFTER_4257B0_PASS_A,
  (state, runtimeInputs, events) => {
    const plan = frameOpaque4257b0Plan(runtimeInputs);
    if ((plan.usable | 0) !== 0 && (events.frameOpaque4257b0PassAApplied | 0) !== 0) {
      const outcome = frameOpaque4257b0Outcome(runtimeInputs);
      const purePost = (outcome.triples?.lo?.length ?? 0) | 0;
      const recaptured = frameOpaque4257b0ListCountFromBounds(
        runtimeInputs.frameOpaque4257b0PostListBegin >>> 0,
        runtimeInputs.frameOpaque4257b0PostListEnd >>> 0,
      ) >>> 0;
      if (recaptured === (purePost >>> 0)) {
        events.frameOpaque4257b0PassBApplied = 1;
        if (frameOpaque4257b0PassBNeedsHostRecaptured(recaptured) !== 0) {
          /* Real store count, not the v70 host-edge predicate: the C++
             resume publishes isaac_frame_opaque_4257b0_pass_b_apply's
             return over the recaptured pair. */
          events.frameOpaque4257b0PassBStores = (outcome.passBStores ?? 0) >>> 0;
        }
        events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
        return;
      }
      if (frameOpaque4257b0PassBNeedsHostRecaptured(recaptured)) {
        /* Boolean oracle — `!== 0` here would make `false !== 0` == true
           and dead-gate the arm: every mismatch would emit the Pass B host
           edge even when the recapture is empty (PE 0x00425894 je skips
           Pass B entirely). Measured at case 915 of the differential. */
        events.opaqueCall004257b0PassB = (events.opaqueCall004257b0PassB | 0) + 1;
      }
      events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
      return;
    }
    if (frameOpaque4257b0PassBNeedsHostRecaptured(runtimeInputs.frameOpaque4257b0PostPassAListCount | 0)) {
      events.opaqueCall004257b0PassB = (events.opaqueCall004257b0PassB | 0) + 1;
    }
    events.continuationKind = UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES;
  },
);
export function resumeGameUpdateFrameManagerUpdates(inputState = {}, inputConstants = {}, inputRuntimeInputs = {}, inputEvents = {}) {
  const state = { ...emptyState(), ...inputState };
  const constants = { ...(inputConstants ?? {}) };
  const runtimeInputs = { ...(inputRuntimeInputs ?? {}) };
  const events = { ...emptyEvents(), ...inputEvents };
  if ((events.continuationKind | 0) !== UPDATE_CONTINUATION.RESUME_AFTER_FRAME_MANAGER_UPDATES) return { state, events };
  continueAfterFrameManagerUpdates(state, constants, runtimeInputs, events);
  return { state, events };
}

export { roomGenrandNext, playerHudStatBarTween, roomAmbient824a70GenrandMtSamples, pmDeathPlayerEligible };


/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 37, opaqueRoomUpdateTailMid): pure DECISION laws
   of the three always-body calls — curse FUN_00820910 / greed-special
   FUN_00801ee0 / room mid-tail FUN_00800500 (census 0x00805378..
   0x008053e2). Arg prep + gate shapes; the BODIES stay typed-host
   (stateful: genrand/create/vcall, Game stores + wave/music/SFX, entity
   walks + intensity posts). Each oracle is transcribed branch-by-branch
   from the instruction stream; consumed by the C++ exports of the same
   name (which wrap the room family's proven laws by reference). */

export const TAILMID_CURSE_FLAG_BIT = 0x4000;
export const TAILMID_SPECIAL_FLAG_BIT = 0x1000;
export const TAILMID_DESC_CLEAR_BIT40 = 0x40;
export const TAILMID_WAVE_TIMER_GATE = 0x14;
export const TAILMID_WAVE_TIMER_SET = 0x13;
export const TAILMID_CURSE_EFFECT_TYPE = 0x3e8;
export const TAILMID_CURSE_EFFECT_VARIANT = 0x7f;
export const TAILMID_CURSE_POS_VEC_PTR = 0x00c7b640;
export const TAILMID_800500_TYPE_BAND_BASE = 10;
export const TAILMID_800500_TYPE_BAND_SPAN = 0x3dd;
export const TAILMID_800500_TYPE_PLAYER = 1;
export const TAILMID_800500_FLAG_168_MASK = 0x20;
export const TAILMID_800500_FLAG_16C_MASK = 0x2000000;
export const TAILMID_800500_ABS_MASK = 0x7fffffff;
export const TAILMID_800500_DEFAULT_INTENSITY_BITS = 0x3f800000;
export const TAILMID_800500_TIMER_SFX_GATE = 10;
export const TAILMID_800500_TIMER_CLEAR = 0xffffffff;
export const TAILMID_SPECIAL_STAGE = 7;
export const TAILMID_SPECIAL_ROOM_TYPE = 5;

function tailmidF32Of(bits) {
  const u = new Uint32Array(1);
  u[0] = bits >>> 0;
  return new Float32Array(u.buffer)[0];
}

/* Curse outer gate — PE 0x80537e..0x8053aa. Four pure clauses; IsPaused
   sample (0x8053ac) excluded. */
export function gameUpdateSliceTailmidCurseGateOpen(
  gameFlags1839c, roomDescFlags44, roomActiveByte0, frame264f8, roomEntry11f0,
) {
  if (((gameFlags1839c >>> 0) & TAILMID_CURSE_FLAG_BIT) === 0) return 0;
  if (((roomDescFlags44 >>> 0) & TAILMID_CURSE_FLAG_BIT) !== 0) return 0;
  if (((roomActiveByte0 >>> 0) & 0xff) === 0) return 0;
  if (((frame264f8 | 0) - (roomEntry11f0 | 0)) !== 1) return 0;
  return 1;
}

/* Full curse host law — adds PE 0x8053ac call Game::IsPaused; test al;
   0x8053b3 jne skip (host when al==0, LOW-BYTE). */
export function gameUpdateSliceTailmidCurseNeedsHost(
  gameFlags1839c, roomDescFlags44, roomActiveByte0, frame264f8, roomEntry11f0,
  isPaused,
) {
  if (gameUpdateSliceTailmidCurseGateOpen(
    gameFlags1839c, roomDescFlags44, roomActiveByte0, frame264f8, roomEntry11f0,
  ) !== 1) return 0;
  if (((isPaused >>> 0) & 0xff) !== 0) return 0;
  return 1;
}

export function gameUpdateSliceTailmidCurseFlagOr4000(roomDescFlags44) {
  return ((roomDescFlags44 >>> 0) | TAILMID_CURSE_FLAG_BIT) >>> 0;
}
export function gameUpdateSliceTailmidCurseArgZero() {
  return 0;
}
export function gameUpdateSliceTailmidCursePosVecPtr() {
  return TAILMID_CURSE_POS_VEC_PTR >>> 0;
}
export function gameUpdateSliceTailmidCurseEffectType() {
  return TAILMID_CURSE_EFFECT_TYPE >>> 0;
}
export function gameUpdateSliceTailmidCurseEffectVariant() {
  return TAILMID_CURSE_EFFECT_VARIANT >>> 0;
}

/* 801ee0 greed early-out — PE 0x801efa cmp 2 / je + 0x801eff cmp 3 /
   jne exit: greedy iff difficulty == 2 || difficulty == 3. FULL-DWORD. */
export function gameUpdateSliceTailmid801ee0IsGreedMode(difficulty269c8) {
  return (difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3 ? 1 : 0;
}

/* boss = max(0, Room+0x12c0 + Room+0x12c4) — PE 0x801f1b..0x801f29:
   add ecx; test ecx; cmovg (SIGNED sum, cmovg = SF==OF==0). */
export function gameUpdateSliceTailmid801ee0BossCount(count12c0, count12c4) {
  const sum = (count12c0 | 0) + (count12c4 | 0);
  return (sum | 0) > 0 ? sum | 0 : 0;
}

/* PE 0x801f2c test eax / jg skip (boss>0 -> no reset) + 0x801f30
   cmp post,0x14 / jl skip: reset iff boss<=0 && post >= 0x14 (SIGNED). */
export function gameUpdateSliceTailmid801ee0NeedsTimerReset(
  postTimer723c, bossCount,
) {
  if ((bossCount | 0) > 0) return 0;
  return (postTimer723c | 0) >= TAILMID_WAVE_TIMER_GATE ? 1 : 0;
}

/* PE 0x801f0e test pre / jle exit (dec only when pre>0) + 0x801f4d
   test post / jne exit: SpawnGreedModeWave iff pre>0 && post==0. */
export function gameUpdateSliceTailmid801ee0NeedsSpawnWave(
  postTimer723c, preTimer723c,
) {
  if (!((preTimer723c | 0) > 0)) return 0;
  return (postTimer723c | 0) === 0 ? 1 : 0;
}

/* Special gate — PE 0x801f60 cmp [Game],7 / jne exit; 0x801f69 cmp
   [Room+8],5 / jne exit; 0x801f73 test [Game+0x1839c],0x1000 / jne exit;
   0x801f83..0x801f96 count=(end-begin) SAR 2 / test / je exit. */
export function gameUpdateSliceTailmid801ee0NeedsSpecial(
  stage0, roomType8, gameFlags1839c, playerCount,
) {
  if ((stage0 | 0) !== TAILMID_SPECIAL_STAGE) return 0;
  if ((roomType8 | 0) !== TAILMID_SPECIAL_ROOM_TYPE) return 0;
  if (((gameFlags1839c >>> 0) & TAILMID_SPECIAL_FLAG_BIT) !== 0) return 0;
  return (playerCount | 0) !== 0 ? 1 : 0;
}

export function gameUpdateSliceTailmid801ee0TimerSet13() {
  return TAILMID_WAVE_TIMER_SET | 0;
}
export function gameUpdateSliceTailmid801ee0DescClearBit40(roomDescFlags44) {
  return ((roomDescFlags44 >>> 0) & ~TAILMID_DESC_CLEAR_BIT40) >>> 0;
}
export function gameUpdateSliceTailmid801ee0GameFlagOr1000(gameFlags1839c) {
  return ((gameFlags1839c >>> 0) | TAILMID_SPECIAL_FLAG_BIT) >>> 0;
}

/* 800500 early skip — PE 0x800745..0x80074e: IsPaused (LOW-BYTE test)
   && gate_1b83c == 0 -> skip main body to LAB_00801544. */
export function gameUpdateSliceTailmid800500EarlySkip(isPaused, gate1b83c) {
  if (((isPaused >>> 0) & 0xff) === 0) return 0;
  return (gate1b83c | 0) === 0 ? 1 : 0;
}

/* Empty entity list -> default intensity 1.0 — PE 0x80076c cmp
   [Room+0x1264],0 / 0x800772 jbe: FULL-DWORD == 0. */
export function gameUpdateSliceTailmid800500EntityListEmpty(count1264) {
  return (count1264 >>> 0) === 0 ? 1 : 0;
}

/* avg intensity — PE 0x80111c..0x80113f: threat_count==0 -> default;
   else sum/count (cvtdq2ps SIGNED count, divss). */
export function gameUpdateSliceTailmid800500AvgIntensity(threatSum, threatCount) {
  if ((threatCount | 0) <= 0) {
    return tailmidF32Of(TAILMID_800500_DEFAULT_INTENSITY_BITS);
  }
  return Math.fround(threatSum / (threatCount | 0));
}

/* Type band — PE 0x8007a5.. lea [type-10]; cmp 0x3dd; ja out. UNSIGNED
   (type-10) <= 0x3dd (jbe). */
export function gameUpdateSliceTailmid800500TypeInThreatBand(type28) {
  return ((type28 - TAILMID_800500_TYPE_BAND_BASE) >>> 0) <=
         (TAILMID_800500_TYPE_BAND_SPAN >>> 0) ? 1 : 0;
}

/* Outer include candidate — dim-player (dim>=2 && type==1) OR threat band. */
export function gameUpdateSliceTailmid800500OuterIncludeCandidate(
  gameDim26614, type28,
) {
  if ((gameDim26614 | 0) >= 2 && (type28 | 0) === TAILMID_800500_TYPE_PLAYER) {
    return 1;
  }
  return gameUpdateSliceTailmid800500TypeInThreatBand(type28);
}

/* Entity include multi-gate — PE 0x8007ad..0x80081f: entity nonnull &&
   candidate && (u8)+0x173==0 && (i16)+0xc74 <= 0 && (f32)+0x39c > 0 &&
   (i32)+0x31c <= 0 && (flags+0x168 & 0x20)==0 && (flags+0x16c & 0x2000000)==0. */
export function gameUpdateSliceTailmid800500EntityInclude(
  entityNonzero, gameDim26614, type28, flagByte173, shortC74, float39c,
  int31c, flags168, flags16c,
) {
  if ((entityNonzero | 0) === 0) return 0;
  if (gameUpdateSliceTailmid800500OuterIncludeCandidate(gameDim26614, type28) !== 1) return 0;
  if (((flagByte173 >>> 0) & 0xff) !== 0) return 0;
  if ((shortC74 | 0) > 0) return 0;
  if (!(float39c > 0)) return 0;
  if ((int31c | 0) > 0) return 0;
  if ((((flags168 >>> 0) & TAILMID_800500_FLAG_168_MASK) |
       ((flags16c >>> 0) & TAILMID_800500_FLAG_16C_MASK)) !== 0) return 0;
  return 1;
}

/* Approach — PE LAB_00801544: absdiff = |curr-target| (andps 0x7fffffff);
   if step >= absdiff keep target; else if target <= curr: curr-step; else
   curr+step. */
export function gameUpdateSliceTailmid800500Approach(curr, target, step) {
  const delta = curr - target;
  const u = new Uint32Array(1);
  const f = new Float32Array(u.buffer);
  f[0] = delta;
  u[0] = (u[0] & TAILMID_800500_ABS_MASK) >>> 0;
  const absdiff = f[0];
  if (!(step < absdiff)) return target;
  if (target <= curr) return curr - step;
  return curr + step;
}

export function gameUpdateSliceTailmid800500DefaultIntensity() {
  return tailmidF32Of(TAILMID_800500_DEFAULT_INTENSITY_BITS);
}

/* 800500 timer 72fc — PE 0x801bf9..0x801c4e: timer<0 -> return (no host);
   inc; ==10 -> SFX Play; >10 -> IsPlaying host; clear = -1. */
export function gameUpdateSliceTailmid800500Timer72fcNeedsHost(timer72fc) {
  return (timer72fc | 0) >= 0 ? 1 : 0;
}
export function gameUpdateSliceTailmid800500Timer72fcInc(timer72fc) {
  return ((timer72fc | 0) + 1) | 0;
}
export function gameUpdateSliceTailmid800500Timer72fcNeedsSfxPlay(postInc) {
  return (postInc | 0) === TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}
export function gameUpdateSliceTailmid800500Timer72fcNeedsIsplayingHost(postInc) {
  return (postInc | 0) > TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}
export function gameUpdateSliceTailmid800500Timer72fcClearNeg1() {
  return TAILMID_800500_TIMER_CLEAR | 0;
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 40, opaqueRoomUpdateTailMid7230Spawn): spawn-loop
   FRAME pure laws. Frame = PE 0x008054ab..0x00805527 (countdown at
   Room+0x7230 + periodic spawn every 5 frames, signed): the pre gate,
   the PER-ITERATION BOUND RE-READ (0x00805515 re-reads Room+0x7230 AFTER
   the pos/genrand/spawn/RTTI host calls — the decrement is UNCONDITIONAL
   on the re-read, never the folded pre), the 0x00813460 pos math
   (spans/unit/max_span/centers — radius_arg = unit*max_span is THE SQRT
   ARGUMENT), the CRT sqrt platform-primitive gate (0x00435a50: host only
   when ORDERED 0.0 > arg), and the typed spawn-call arg prep (0x00428b20
   push imms type 4 / variant 3 / 0xc7b640 / 0xc5d838 / 0xc5d5dc / zeros).
   Each oracle is transcribed branch-by-branch from the instruction stream
   (cpu-dump/00805490.txt + 00813460.txt + the 0x435a50 sqrt head);
   consumed by the C++ exports of the same name (which wrap the room
   family's proven laws by reference where a room helper exists). */

export const TAILMID_7230_SPAWN_PERIOD = 5;
export const TAILMID_7230_SPAWN_TYPE = 4;
export const TAILMID_7230_SPAWN_VARIANT = 3;
export const TAILMID_7230_SPAWN_POS_VEC_PTR = 0x00c7b640;
export const TAILMID_7230_SPAWN_ARG_PTR_A = 0x00c5d838;
export const TAILMID_7230_SPAWN_ARG_PTR_B = 0x00c5d5dc;
export const TAILMID_7230_SPAWN_GAME_ROOM_OFF = 0x18300;
export const TAILMID_7230_SPAWN_HALF_BITS = 0x3f000000;      /* 0.5f */
export const TAILMID_7230_SPAWN_UNIT_SCALE_BITS = 0x2f800000; /* 2^-32f */
export const TAILMID_7230_POS_CALL_VA = 0x00813460;
export const TAILMID_7230_GENRAND_CALL_VA = 0x006eef60;
export const TAILMID_7230_SPAWN_CALL_VA = 0x00428b20;
export const TAILMID_7230_RTTI_CALL_VA = 0x00af08b1;
export const TAILMID_7230_SPAWN_BODY_VA = 0x008054c3;
export const TAILMID_7230_COUNTDOWN_VA = 0x008054ab;
export const TAILMID_7230_RE_READ_VA = 0x00805515;
export const TAILMID_7230_SQRT_VA = 0x00435a50;

/* Spawn gate — PE 0x8054ab mov ecx,[edi+0x7230] / 0x8054b1 test ecx,ecx /
   0x8054b3 jle 0x805527 (SIGNED: counter <= 0 skips everything) /
   0x8054b7 mov esi,5 / cdq / idiv / 0x8054bf test edx,edx /
   0x8054c1 jne 0x80551e (spawn body iff pre % 5 == 0, SIGNED idiv). */
export function gameUpdateSliceTailmid7230GateOpen(preTimer7230) {
  if (!((preTimer7230 | 0) > 0)) return 0;
  return (preTimer7230 | 0) % TAILMID_7230_SPAWN_PERIOD === 0 ? 1 : 0;
}

/* Per-iteration bound re-read — PE 0x805515 mov ecx,[edi+0x7230] RE-READS
   Room+0x7230 after the four host calls (813460 pos / 6eef60 genrand /
   428b20 spawn / af08b1 RTTI); 0x80551e lea eax,[ecx-1]; 0x805521 store.
   The frame already passed the pre>0 gate, so the decrement is
   UNCONDITIONAL on the re-read: a drained re-read of 0 stores -1, and -1
   wraps to -2 (i32). A fold of the pre value or a conditional dec
   diverges exactly there. */
export function gameUpdateSliceTailmid7230CounterNext(reReadCounter) {
  return ((reReadCounter | 0) - 1) | 0;
}

/* 813460 pos spans — PE 0x81346c movss xmm0,[edi+0x1c] / 0x813471 subss
   xmm0,[edi+0x14] (span_x = x1 - x0); 0x81347c..0x813486 same for
   span_y = y1 - y0 (room+0x20 - room+0x18). f32 subtract. */
export function gameUpdateSliceTailmid7230SpanX(x0, x1) {
  return Math.fround(Math.fround(x1) - Math.fround(x0));
}
export function gameUpdateSliceTailmid7230SpanY(y0, y1) {
  return Math.fround(Math.fround(y1) - Math.fround(y0));
}

/* unit = f32(u32 genrand) * 2^-32 — PE 0x8134a2..0x8134cf: movd xmm0,eax;
   cvtdq2pd xmm0 (SIGNED int32 -> f64); shr eax,31; addsd xmm0,[eax*8+
   0xbacb00] (+2^32 when bit31); cvtpd2ps xmm1 (f64->f32);
   mulss xmm1,[0xba9ff4] (2.3283064e-10 = 2^-32). NOT the ambient 824a70
   twin's 0x2f7ffffe one-ULP-off scale. */
export function gameUpdateSliceTailmid7230UnitFloat(genrand) {
  const asSigned = genrand | 0;
  let d = asSigned;
  if ((genrand >>> 31) !== 0) d += 4294967296.0;
  const f32u = Math.fround(d);
  return Math.fround(f32u * tailmidF32Of(TAILMID_7230_SPAWN_UNIT_SCALE_BITS));
}

/* max_span — PE 0x8134c4 movaps xmm0,span_y; 0x8134d7 maxss xmm0,span_x:
   returns span_y unless span_x is STRICTLY greater. maxss with a NaN
   operand yields the second operand, so NaN span_x yields span_y. */
export function gameUpdateSliceTailmid7230MaxSpan(spanX, spanY) {
  /* JS -> wasm f32 params: both sides must round to f32 BEFORE the
     maxss compare (the PE operates on f32 registers). */
  const x = Math.fround(spanX);
  const y = Math.fround(spanY);
  return (x > y) ? x : y;
}

/* centers — PE 0x8134c7 mulss span_x,[0xbaa2d0] (0.5f); 0x8134ec addss
   room+0x14 (x0): center_x = x0 + span_x*0.5; 0x8134db mulss span_y,0.5;
   0x8134e3 addss room+0x18 (y0): center_y = y0 + span_y*0.5. v47 axis
   fix: X centre uses +0x14, Y centre uses +0x18. */
export function gameUpdateSliceTailmid7230CenterX(x0, spanX) {
  return Math.fround(Math.fround(x0) +
    Math.fround(Math.fround(spanX) * tailmidF32Of(TAILMID_7230_SPAWN_HALF_BITS)));
}
export function gameUpdateSliceTailmid7230CenterY(y0, spanY) {
  return Math.fround(Math.fround(y0) +
    Math.fround(Math.fround(spanY) * tailmidF32Of(TAILMID_7230_SPAWN_HALF_BITS)));
}

/* SQRT ARGUMENT — PE 0x8134e8 mulss xmm1(unit),xmm0(max_span): the
   radius fed to the search head (0x813520) and its CRT sqrt 0x435a50. */
export function gameUpdateSliceTailmid7230SqrtArg(unit, maxSpan) {
  return Math.fround(Math.fround(unit) * Math.fround(maxSpan));
}

/* sqrt platform-primitive gate — PE 0x435a5d ucomisd 0.0,x / 0x435a61 ja
   error: the CRT host runs iff ORDERED 0.0 > x (x < 0). ucomisd sets
   CF=ZF=1 for unordered (NaN) and equal, so NaN and -0.0 do NOT branch
   (sqrt stays the inline sqrtsd platform primitive). */
export function gameUpdateSliceTailmid7230SqrtHostNeeded(sqrtArg) {
  return sqrtArg < Math.fround(0.0) ? 1 : 0;
}

/* Spawn call arg prep (typed host) — PE 0x8054e7..0x80550a pushes in
   order: 0 / 0xc5d838 / 0xc5d5dc / 0 / genrand(eax from 6eef60) / 0 / 0 /
   0xc7b640 / [ebp-0xa38] pos out / 3 (variant) / 4 (type); call 0x428b20.
   The pos out slot is filled by the 813460 call; the genrand dword comes
   from the global RNG advance (host, 0x6eef60). */
export function gameUpdateSliceTailmid7230SpawnType() {
  return TAILMID_7230_SPAWN_TYPE;
}
export function gameUpdateSliceTailmid7230SpawnVariant() {
  return TAILMID_7230_SPAWN_VARIANT;
}
export function gameUpdateSliceTailmid7230SpawnPosVecPtr() {
  return TAILMID_7230_SPAWN_POS_VEC_PTR >>> 0;
}
export function gameUpdateSliceTailmid7230SpawnArgPtrA() {
  return TAILMID_7230_SPAWN_ARG_PTR_A >>> 0;
}
export function gameUpdateSliceTailmid7230SpawnArgPtrB() {
  return TAILMID_7230_SPAWN_ARG_PTR_B >>> 0;
}
export function gameUpdateSliceTailmid7230SpawnPushZero() {
  return 0;
}
export function gameUpdateSliceTailmid7230GameRoomOffset() {
  return TAILMID_7230_SPAWN_GAME_ROOM_OFF >>> 0;
}
/* The typed host call SEQUENCE in PE order (0x8054d7 -> 0x8054dc ->
   0x80550a -> 0x805510). */
export function gameUpdateSliceTailmid7230PosCallVa() {
  return TAILMID_7230_POS_CALL_VA >>> 0;
}
export function gameUpdateSliceTailmid7230GenrandCallVa() {
  return TAILMID_7230_GENRAND_CALL_VA >>> 0;
}
export function gameUpdateSliceTailmid7230SpawnCallVa() {
  return TAILMID_7230_SPAWN_CALL_VA >>> 0;
}
export function gameUpdateSliceTailmid7230RttiCallVa() {
  return TAILMID_7230_RTTI_CALL_VA >>> 0;
}

/* Composed typed-host spawn-call plan: the 11 pushed args in PE order
   with the two host-produced slots (genrand dword, pos out buffer)
   called out explicitly. */
export function gameUpdateSliceTailmid7230SpawnCallPlan(genrand) {
  return {
    order: [
      0,
      TAILMID_7230_SPAWN_ARG_PTR_A >>> 0,
      TAILMID_7230_SPAWN_ARG_PTR_B >>> 0,
      0,
      genrand >>> 0,
      0,
      0,
      TAILMID_7230_SPAWN_POS_VEC_PTR >>> 0,
      "pos_out",
      TAILMID_7230_SPAWN_VARIANT,
      TAILMID_7230_SPAWN_TYPE,
    ],
    type: TAILMID_7230_SPAWN_TYPE,
    variant: TAILMID_7230_SPAWN_VARIANT,
    genrandDword: genrand >>> 0,
  };
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 31, Room::TriggerClear 0x008068f0): CALL-ARG /
   decision laws of the non-greed fragments (census update-v95-8068f0-
   trigger-clear/NOTES.md + disasm-8068f0-full.txt). Bodies stay TYPED-
   HOST; these oracles pin the CALL-ARG packs and the decision gates.
   Zero layout: no events/runtime/state fields; ABI stays 95. */

export const TRIGGER_CLEAR_SFX_RECEIVER_OFF = 0x2a324;
export const TRIGGER_CLEAR_SFX_SEED_NORMAL = 0x24;
export const TRIGGER_CLEAR_SFX_SEED_DEEP = 0x5a;
export const TRIGGER_CLEAR_SFX_VOLUME_BITS = 0x3f800000; /* 1.0f */
export const TRIGGER_CLEAR_SFX_PITCH_BITS = 0x3f800000;  /* 1.0f */
export const TRIGGER_CLEAR_SFX_FRAME_DELAY = 2;
export const TRIGGER_CLEAR_DEEP_FLAG_BIT = 0x10000;
export const TRIGGER_CLEAR_AWARDS_9BB840_RECEIVER_OFF = 0x1baa8;

/* stats 0x9e5960 CALL-ARG pack (PE 0x806918..0x806935). clear_count is
   the pre-truncation word (PE movzx 0x806927); flag_bit10 = (flags44
   >>10)&1 (PE 0x80691e..0x806923). */
export function gameUpdateSliceTriggerClearStatsArgs(
  roomType, stageData, clearCount, flags44,
) {
  return {
    roomType: roomType >>> 0,
    stageData: stageData >>> 0,
    clearCountWord: (clearCount >>> 0) & 0xffff,
    flagBit10: ((flags44 >>> 0) >> 10) & 1,
  };
}

/* music/audio play args (PE 0x8069c9 push 0; push 1 -> cdecl (1, 0),
   this=room). 0x7f7a40 fires only in non-greed; 0x7f83b0 always. */
export function gameUpdateSliceTriggerClearMusicArgs(difficulty269c8) {
  const greed = (difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3;
  return {
    fire7f7a40: greed ? 0 : 1,
    fire7f83b0: 1,
    arg1: 1,
    arg2: 0,
  };
}

/* playSound==0 SFX path (PE 0x8069df cmp byte [ebp+8],0; seed 0x24;
   Play consts; receiver [0xc7169c]+0x2a324). */
export function gameUpdateSliceTriggerClearSfxPlan(playSoundByte) {
  return {
    armed: ((playSoundByte >>> 0) & 0xff) === 0 ? 1 : 0,
    seedId: TRIGGER_CLEAR_SFX_SEED_NORMAL >>> 0,
    volumeBits: TRIGGER_CLEAR_SFX_VOLUME_BITS >>> 0,
    frameDelay: TRIGGER_CLEAR_SFX_FRAME_DELAY >>> 0,
    loop: 0,
    pitchBits: TRIGGER_CLEAR_SFX_PITCH_BITS >>> 0,
    pan: 0,
    receiverOff: TRIGGER_CLEAR_SFX_RECEIVER_OFF >>> 0,
  };
}

/* deep challenge/music path (PE 0x806a65..0x806b59). head-clear:
   byte[Game+0x1bb84]==0 && probe 0x9e9b50 al==0 && probe 0x9595e0 al==0
   && byte[Game+0x26588]==0 -> direct 0x806aad; else vec non-empty
   ([Manager+0x4b3d8]!=[+0x4b3dc]). 0x806aad gates: count[+0x334]>0
   (jbe), [Game+0x1839c]&0x10000==0, room match (host 0x740bc0 ret+8 ==
   [Game+0x18314]), [Game]==1, [Game+4] not 4/5, [Game+0x264f8]<=0x708
   (SIGNED jg). Fire: flag |=0x10000; SFX seed 0x5a; Room+0x72fc=0. */
export function gameUpdateSliceTriggerClearDeepMusicGate(input = {}) {
  const headClear =
    ((input.byte1bb84 >>> 0) & 0xff) === 0 &&
    ((input.probe9e9b50 >>> 0) & 0xff) === 0 &&
    ((input.probe9595e0 >>> 0) & 0xff) === 0 &&
    ((input.byte26588 >>> 0) & 0xff) === 0;
  const vecNonempty = (input.vecBegin4b3d8 >>> 0) !== (input.vecEnd4b3dc >>> 0);
  const reachAad = headClear || vecNonempty;
  const frameSigned = input.frame264f8 | 0;
  const fire =
    reachAad &&
    (input.count334 >>> 0) !== 0 &&
    ((input.flag1839c >>> 0) & TRIGGER_CLEAR_DEEP_FLAG_BIT) === 0 &&
    (input.roomMatch >>> 0) !== 0 &&
    (input.game0 >>> 0) === 1 &&
    (input.game4 >>> 0) !== 4 &&
    (input.game4 >>> 0) !== 5 &&
    frameSigned <= 0x708;
  return {
    fire: fire ? 1 : 0,
    flagOr10000: fire ? TRIGGER_CLEAR_DEEP_FLAG_BIT >>> 0 : 0,
    sfxSeedId: fire ? TRIGGER_CLEAR_SFX_SEED_DEEP >>> 0 : 0,
    room72fcZero: fire ? 1 : 0,
  };
}

/* Awards bit7 walk (PE 0x806b63..0x806b98). walk_active = bit7 clear;
   fire_9bb840 = walk && !(greed && roomType==1); fire_7fb250 = walk;
   receiver 0x9bb840 = Game+0x1baa8. */
export function gameUpdateSliceTriggerClearAwardsWalk(
  flags44, difficulty269c8, roomType8,
) {
  const walkActive = (((flags44 >>> 0) >> 7) & 1) === 0 ? 1 : 0;
  const greed = (difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3;
  const greedRoom1 = greed && (roomType8 >>> 0) === 1;
  return {
    walkActive,
    fire9bb840: walkActive !== 0 && !greedRoom1 ? 1 : 0,
    fire7fb250: walkActive,
    receiver9bb840Off: TRIGGER_CLEAR_AWARDS_9BB840_RECEIVER_OFF >>> 0,
  };
}

/* Rewind tail: push -1 @0x806c0a -> 0x705ee0(0xffffffff) ALWAYS. */
export function gameUpdateSliceTriggerClearRewindTailArg() {
  return { fire: 1, arg: 0xffffffff >>> 0 };
}

/* Awards non-greed music suite (PE 0x806a26..0x806a64): the ordered
   three-call suite. Gate = difficulty not 2/3 (FULL-DWORD 0x806a32
   cmp/je + 0x806a3b cmp/je — WIDE 0x102 must NOT open). Order is
   machine-fixed: 0x7f9960(0,0) -> 0x820170(1,0,0) -> 0x8204b0(0),
   every receiver the ROOM (thiscall). Bodies stay TYPED-HOST; this
   oracle pins gate + call order + args for the host consumer. */
export function gameUpdateSliceTriggerClearAwardsSuite(difficulty269c8) {
  const greed = (difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3;
  const fire = greed ? 0 : 1;
  return {
    fire,
    call1Va: 0x007f9960 >>> 0,
    call1Arg1: 0,
    call1Arg2: 0,
    call2Va: 0x00820170 >>> 0,
    call2Arg1: 1,
    call2Arg2: 0,
    call2Arg3: 0,
    call3Va: 0x008204b0 >>> 0,
    call3Arg1: 0,
    receiverIsRoom: 1,
  };
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 38, opaqueRoomUpdateTailMid706cExpire): pure
   DECISION laws of the 706c expire arm (census 0x008158a0). Countdown
   gate PE 0x8053e2..0x80540a: mov eax,[Room+0x706c]; test; jle skip;
   dec; store; test; jg skip; store 0xffffffff; mov ecx,Room; call
   0x8158a0 — the expire body fires iff pre>0 && (pre-1)<1. The body
   FUN_008158a0 (Room::ShopRestockPartial, this=room) stays TYPED-HOST;
   these oracles publish the expire decision + the body's typed
   arg/state contract. Transcribed branch-by-branch; consumed by the
   C++ exports of the same name (gate wraps isaac_room_706c_needs_
   expire_host by reference). */

export const TAILMID_706C_EXPIRE_DROP_TYPE = 0x96;
export const TAILMID_706C_EXPIRE_DROP_VARIANT = 5;
export const TAILMID_706C_EXPIRE_EXTRA_TYPE = 0x3e8;
export const TAILMID_706C_EXPIRE_EXTRA_VARIANT = 0xf;
export const TAILMID_706C_EXPIRE_ENTITY_ITEM_OFF = 0x32c;
export const TAILMID_706C_EXPIRE_ITEM_DEF_VCALL_MAX = 0x1bf;
export const TAILMID_706C_EXPIRE_HOST_VA = 0x008158a0;
export const TAILMID_706C_EXPIRE_ROOM_SHOP_TYPE = 2;
export const TAILMID_706C_EXPIRE_HASH_SHIFT_MASK = 31;

/* Gate — pre>0 && (pre-1)<1 (fires iff pre == 1, signed). */
export function gameUpdateSliceTailmid706cNeedsExpireHost(preTimer706c) {
  if (!((preTimer706c | 0) > 0)) return 0;
  return ((((preTimer706c | 0) - 1) | 0) < 1) ? 1 : 0;
}

/* Countdown state — pre<=0 unchanged; else pre-1, <1 -> -1 (0xffffffff). */
export function gameUpdateSliceTailmid706cCountdownNext(preTimer706c) {
  const pre = preTimer706c | 0;
  if (!(pre > 0)) return pre;
  const post = (pre - 1) | 0;
  return post < 1 ? -1 : post;
}

/* Body inner gate [Room+8]==2 (0x8158ae cmp/jne assert tail). */
export function gameUpdateSliceTailmid706cExpireRoomIsShop(roomType8) {
  return (roomType8 >>> 0) === TAILMID_706C_EXPIRE_ROOM_SHOP_TYPE ? 1 : 0;
}

/* Body items-remaining gate [Room+0x7080]!=0 (0x8158b7 cmp/je). */
export function gameUpdateSliceTailmid706cExpireHasItems(count7080) {
  return (count7080 >>> 0) !== 0 ? 1 : 0;
}

/* Item counter byte ++ with 0xff cap (0x815915..0x815922; LOW-BYTE
   re-narrow: 0x100 -> 1, 0x1ff/0xffffffff -> 0xff stays 0xff). */
export function gameUpdateSliceTailmid706cExpireItemCounterByteInc(counterByte) {
  const b = (counterByte >>> 0) & 0xff;
  return b >= 0xff ? b : b + 1;
}

/* Bucket cell (idx>>1) & (count-1) — PE 0x8158e8..0x815904: dec eax
   (count) FULL dword wrap; shr ecx,1 LOGICAL; and. */
export function gameUpdateSliceTailmid706cExpireBucketCell(
  index707c, count7078,
) {
  return (((index707c >>> 0) >> 1) & (((count7078 >>> 0) - 1) >>> 0)) >>> 0;
}

/* Parity lane idx&1 (0x8158ee and edx,1). */
export function gameUpdateSliceTailmid706cExpireBucketParity(index707c) {
  return (index707c >>> 0) & 1;
}

/* Item-def vcall gate item<=0x1bf (0x81599c cmp/jа UNSIGNED). */
export function gameUpdateSliceTailmid706cExpireItemDefVcallNeeded(itemId) {
  return (itemId >>> 0) <= TAILMID_706C_EXPIRE_ITEM_DEF_VCALL_MAX ? 1 : 0;
}

/* FNV-ish hash step — PE 0x8159cb..0x8159ea: t=(h>>c1)^h; u=(t<<c2)^t;
   v=(u>>c3)^u, 32-bit wrap. x86 cl masks counts &31 (same as wasm). */
export function gameUpdateSliceTailmid706cExpireHashStep(hash, c1, c2, c3) {
  const h = hash >>> 0;
  const t = ((h >>> ((c1 >>> 0) & TAILMID_706C_EXPIRE_HASH_SHIFT_MASK)) ^ h) >>> 0;
  const u = ((t << ((c2 >>> 0) & TAILMID_706C_EXPIRE_HASH_SHIFT_MASK)) ^ t) >>> 0;
  return ((u >>> ((c3 >>> 0) & TAILMID_706C_EXPIRE_HASH_SHIFT_MASK)) ^ u) >>> 0;
}

/* idiv pos floats — PE 0x815969..0x815974 (y: cvtdq2ps rem; mulss c4;
   addss c4) / 0x815988..0x815997 (x: cvtdq2ps quot; mulss c4; addss
   c5). Each SSE op rounds once (cvtdq2ps -> mulss -> addss); c4=
   [0xbaa904], c5=[0xbaaa00] are host-time .rdata reads passed as f32
   bits. */
export function gameUpdateSliceTailmid706cExpirePosY(remIdiv, c4Bits) {
  const c4 = tailmidF32Of(c4Bits >>> 0);
  const p = Math.fround(Math.fround((remIdiv | 0)) * c4); /* mulss */
  return Math.fround(p + c4); /* addss */
}
export function gameUpdateSliceTailmid706cExpirePosX(
  quotIdiv, c4Bits, c5Bits,
) {
  const c4 = tailmidF32Of(c4Bits >>> 0);
  const c5 = tailmidF32Of(c5Bits >>> 0);
  const p = Math.fround(Math.fround((quotIdiv | 0)) * c4); /* mulss */
  return Math.fround(p + c5); /* addss */
}

/* Create arg preps (typed host contract). */
export function gameUpdateSliceTailmid706cExpireDropType() {
  return TAILMID_706C_EXPIRE_DROP_TYPE >>> 0;
}
export function gameUpdateSliceTailmid706cExpireDropVariant() {
  return TAILMID_706C_EXPIRE_DROP_VARIANT >>> 0;
}
export function gameUpdateSliceTailmid706cExpireExtraType() {
  return TAILMID_706C_EXPIRE_EXTRA_TYPE >>> 0;
}
export function gameUpdateSliceTailmid706cExpireExtraVariant() {
  return TAILMID_706C_EXPIRE_EXTRA_VARIANT >>> 0;
}
export function gameUpdateSliceTailmid706cExpireEntityItemOff() {
  return TAILMID_706C_EXPIRE_ENTITY_ITEM_OFF >>> 0;
}
export function gameUpdateSliceTailmid706cExpireHostVa() {
  return TAILMID_706C_EXPIRE_HOST_VA >>> 0;
}

/* ==========================================================================
 * ABI v95 (record idx 20 depth): Game::SaveState 0x006f9000 pure decision
 * layers — independent JS oracle for the cpp laws (census
 * section-notes/update-v95-savestate-6f9000/NOTES.md). Serialization-order /
 * header laws + per-section write gates; the IO/heap serializers stay
 * typed-host. PE-truth transcribed branch-by-branch from the instruction
 * stream (0x6f9000..0x6f93f8, ret 4).
 * ========================================================================== */
export const SAVESTATE_VERSION_WORD = 0x35;
export const SAVESTATE_FLAGS_COUNT = 0x35;
export const SAVESTATE_PRE_HEADER_STORES = 7;
export const SAVESTATE_POST_HEADER_STORES = 19;
export const SAVESTATE_DWORD_RUN_STORES = 15;
export const SAVESTATE_SECTION_LOOP = 7;
export const SAVESTATE_SECTION_STRIDE = 0x320;
export const SAVESTATE_DWORD_LOOP = 0xe;
export const SAVESTATE_HOST_CALLS = 17;
export const SAVESTATE_HOST_VIRTUAL = 2;
/* 0x21994 - 0x2d0: the 0xe-dword blob source *[0xc7169c]+0x21994 (PE
   0x6f935d add edx,0x21994) sits 0x216c4 past the committed payload blob
   source *[0xc7169c]+0x2d0 (the 0x20b-word S8 copy input captured in the
   LIVE seam lane rewind_705ee0_payload_blob@11640). Same base global
   0xc7169c -> the SaveState blob ADDRESS derives from the committed lane;
   the VALUES stay host (only +0x2d0..+0xafb is captured). */
export const SAVESTATE_BLOB14_SRC_DELTA = 0x216c4;
/* state+0x78 = newslot+0x7c: the ONE SaveState store value that is
   decidable from the committed lanes ([state+0x78] = [game+0x264f8] @
   0x6f919b; source = rewind_705ee0_game_frame_264f8@11624). dst =
   save_state_arg_prep(game_base, new_slot_index) + 0x78, u32 wrap. */
export const SAVESTATE_FRAME_DWORD_DST_OFF = 0x78;

export function gameUpdateSliceSavestateFlagsCount() {
  return SAVESTATE_FLAGS_COUNT;
}
export function gameUpdateSliceSavestateVersionWord() {
  return SAVESTATE_VERSION_WORD;
}
/* PE 0x6f90d0..0x6f9118: flags[i] = bit (i&0x3f) of the first 64-bit badge
   word (@game+0x26548 lo / +0x2654c hi); idx past the 0x35 loop bound -> 0.
   bit<0x20 selects the lo dword, bit>=0x20 the hi dword (bts/cmp 0x20/cmovae
   @0x6f90dd..0x6f90e3). All inputs are u32, NOT pre-masked. */
export function gameUpdateSliceSavestateFlagsByte(idx, wordLo, wordHi) {
  const i = idx >>> 0;
  if (i >= SAVESTATE_FLAGS_COUNT) return 0;
  const bit = i & 0x3f;
  const src = bit < 0x20 ? wordLo >>> 0 : wordHi >>> 0;
  return (src >>> bit) & 1;
}
export function gameUpdateSliceSavestatePreHeaderStores() {
  return SAVESTATE_PRE_HEADER_STORES;
}
export function gameUpdateSliceSavestatePostHeaderStores() {
  return SAVESTATE_POST_HEADER_STORES;
}
export function gameUpdateSliceSavestateDwordRunStores() {
  return SAVESTATE_DWORD_RUN_STORES;
}
/* 0x6f91dd cmp ecx,eax / je 0x6f922e: &state->badges == &game->badges
   -> whole vector-copy section skipped. Pure u32 address equality. */
export function gameUpdateSliceSavestateBadgesAlias(dstFieldAddr, srcFieldAddr) {
  return (dstFieldAddr >>> 0) === (srcFieldAddr >>> 0) ? 1 : 0;
}
/* 0x6f91e6 sub / 0x6f91ef sar 3 — SIGNED element count (i32 >> 3). */
export function gameUpdateSliceSavestateBadgesSrcCount(srcBegin, srcEnd) {
  return (((srcEnd >>> 0) - (srcBegin >>> 0)) | 0) >> 3;
}
/* 0x6f91f8 sub / 0x6f91fd sar 3 — dst capacity count, SIGNED. */
export function gameUpdateSliceSavestateBadgesDstCount(dstBegin, dstEnd) {
  return (((dstEnd >>> 0) - (dstBegin >>> 0)) | 0) >> 3;
}
/* 0x6f9200 cmp / 0x6f9203 jbe: grow iff (u32)src_count > (u32)dst_count
   (UNSIGNED — a wrapped/negative signed count still grows). */
export function gameUpdateSliceSavestateBadgesGrow(srcBegin, srcEnd, dstBegin, dstEnd) {
  const sc = (((srcEnd >>> 0) - (srcBegin >>> 0)) | 0) >> 3;
  const dc = (((dstEnd >>> 0) - (dstBegin >>> 0)) | 0) >> 3;
  return (sc >>> 0) > (dc >>> 0) ? 1 : 0;
}
/* 0x6f921b memcpy size = raw byte span (8-byte elements). */
export function gameUpdateSliceSavestateBadgesCopyBytes(srcBegin, srcEnd) {
  return ((srcEnd >>> 0) - (srcBegin >>> 0)) | 0;
}
/* 0x6f929a sar 2 — ptr-vector count, SIGNED; bound re-read per iteration. */
export function gameUpdateSliceSavestatePtrvecCount(begin, end) {
  return (((end >>> 0) - (begin >>> 0)) >>> 0) >> 2;
}
/* 0x6f92b6 test / je 0x6f92e9 — skip iff count == 0. */
export function gameUpdateSliceSavestatePtrvecSkip(begin, end) {
  return ((((end >>> 0) - (begin >>> 0)) | 0) >> 2) === 0 ? 1 : 0;
}
/* 0x6f9308 cmp dword [esi+0x67788],0 / 0x6f930f setg — SIGNED > 0. */
export function gameUpdateSliceSavestateSetg67788(v) {
  return (v | 0) > 0 ? 1 : 0;
}
/* 0x6f939e test ecx,ecx / 0x6f93a0 lea eax,[ecx-1] / 0x6f93a3 cmovle eax,ecx
   — flags from TEST only: signed ecx <= 0 -> ecx, else ecx-1 (wraps). */
export function gameUpdateSliceSavestateClamp265ec(v) {
  const x = v | 0;
  return x <= 0 ? x : (x - 1) | 0;
}
export function gameUpdateSliceSavestateSectionLoopCount() {
  return SAVESTATE_SECTION_LOOP;
}
export function gameUpdateSliceSavestateSectionStride() {
  return SAVESTATE_SECTION_STRIDE;
}
export function gameUpdateSliceSavestateDwordLoopCount() {
  return SAVESTATE_DWORD_LOOP;
}
/* 0x6f9357 mov edx,[0xc7169c] / 0x6f935d add edx,0x21994: the 0xe-dword
   blob source address = payload_blob_addr(+0x2d0) + 0x216c4 (same base).
   u32 wrap, like every PE address law. */
export function gameUpdateSliceSavestateBlob14SourceAddr(payloadBlobAddr) {
  return ((payloadBlobAddr >>> 0) + SAVESTATE_BLOB14_SRC_DELTA) >>> 0;
}
/* 0x6f919b mov [edi+0x78],eax: dst of the frame-dword store = SaveState
   arg (newslot+4) + 0x78 = newslot+0x7c. Composes the committed slot
   algebra BY REFERENCE (save_state_arg_prep). Value = the committed lane
   rewind_705ee0_game_frame_264f8 (identity, no law). u32 wrap. */
export function gameUpdateSliceSavestateFrameDwordDst(gameBase, newSlotIndex) {
  return (gameUpdateSlice705ee0SaveStateArgPrep(gameBase, newSlotIndex) + SAVESTATE_FRAME_DWORD_DST_OFF) >>> 0;
}
/* Composed plan (mirrors the cpp IsaacGameUpdateSliceSaveStatePlan). */
export function gameUpdateSliceSavestatePlan({
  srcBegin = 0, srcEnd = 0, dstBegin = 0, dstEnd = 0,
  dstFieldAddr = 0, srcFieldAddr = 0, pxBegin = 0, pxEnd = 0,
  game67788 = 0, game265ec = 0,
} = {}) {
  return {
    applied: 1,
    versionWord: SAVESTATE_VERSION_WORD,
    flagsCount: SAVESTATE_FLAGS_COUNT,
    preHeaderStores: SAVESTATE_PRE_HEADER_STORES,
    postHeaderStores: SAVESTATE_POST_HEADER_STORES,
    dwordRunStores: SAVESTATE_DWORD_RUN_STORES,
    badgesAlias: gameUpdateSliceSavestateBadgesAlias(dstFieldAddr, srcFieldAddr),
    badgesSrcCount: gameUpdateSliceSavestateBadgesSrcCount(srcBegin, srcEnd),
    badgesDstCount: gameUpdateSliceSavestateBadgesDstCount(dstBegin, dstEnd),
    badgesGrow: gameUpdateSliceSavestateBadgesGrow(srcBegin, srcEnd, dstBegin, dstEnd),
    badgesCopyBytes: gameUpdateSliceSavestateBadgesCopyBytes(srcBegin, srcEnd),
    ptrvecCount: gameUpdateSliceSavestatePtrvecCount(pxBegin, pxEnd),
    ptrvecSkip: gameUpdateSliceSavestatePtrvecSkip(pxBegin, pxEnd),
    setg1e7b0: gameUpdateSliceSavestateSetg67788(game67788),
    clamp88: gameUpdateSliceSavestateClamp265ec(game265ec),
    sectionLoop: SAVESTATE_SECTION_LOOP,
    dwordLoop: SAVESTATE_DWORD_LOOP,
    hostCalls: SAVESTATE_HOST_CALLS,
    hostVirtual: SAVESTATE_HOST_VIRTUAL,
  };
}

/* ==========================================================================
 * ABI v95 (record idx 29 roomTriggerClearAwardsBit7): FUN_007fb250
 * award-spawner HEAD dispatch + arithmetic laws — independent JS oracle
 * for the cpp exports (census section-notes/update-v95-awards-bit7-head/
 * NOTES.md). PE-truth transcribed branch-by-branch from cpu-dump
 * 007fb250.txt / 00812d00.txt / 00823ec0.txt. The greed-mode gate REUSES
 * gameUpdateSliceTriggerClearGreedMode (identical PE law at 0x7fb3fd /
 * 0x7fb406 — do NOT re-land). Lua gate 0x866220 + arm bodies + merchant
 * chain bodies stay typed-host.
 * ========================================================================== */
export const AWARDS_BIT7_812D00_C4_BITS = 0x42200000; /* 40.0f @0xbaa904 */
export const AWARDS_BIT7_812D00_C5_BITS = 0x42f00000; /* 120.0f @0xbaaa00 */
export const AWARDS_BIT7_823EC0_ADD0_BITS = 0x00000000; /* 0.0f @0xba9fe4 */
export const AWARDS_BIT7_823EC0_SUB80_BITS = 0x42a00000; /* 80.0f @0xbaa9a0 */
export const AWARDS_BIT7_823EC0_HALF_BITS = 0x3f000000; /* 0.5f @0xbaa2d0 */
export const AWARDS_BIT7_MERCHANT_KIND = 0x23;
export const AWARDS_BIT7_MERCHANT_TYPE = 0x10;
export const AWARDS_BIT7_CHAIN_CALL1_VA = 0x00929b40;
export const AWARDS_BIT7_CHAIN_CALL1_ARG1 = 1;
export const AWARDS_BIT7_CHAIN_CALL1_ARG2 = 1;
export const AWARDS_BIT7_CHAIN_CALL1_THIS_OFF = 0x14; /* [0xc7169c]+0x14 */
export const AWARDS_BIT7_CHAIN_CALL2_VA = 0x0095a7b0; /* no receiver */
export const AWARDS_BIT7_CHAIN_CALL2_ARG1 = 0xe;
export const AWARDS_BIT7_CHAIN_CALL3_VA = 0x00929b40;
export const AWARDS_BIT7_CHAIN_CALL3_ARG1 = 0x1ec;
export const AWARDS_BIT7_CHAIN_CALL3_ARG2 = 1;
export const AWARDS_BIT7_CHAIN_CALL3_THIS_OFF = 0x14;
export const AWARDS_BIT7_CHAIN_CALL4_VA = 0x006f9770;
export const AWARDS_BIT7_CHAIN_CALL4_ARG1 = 0xe;
export const AWARDS_BIT7_CHAIN_CALL4_THIS_OFF = 0; /* Game [0xc71678] */

/* walk_decision: 0x7fb464 mov eax,[esi+8] / cmp 5 / je 0x7fbb64 + cmp
   0x11 / je 0x7fbb64 + cmp 0x10 / je 0x7fe087. FULL-DWORD (WIDE
   0x100/0x105/0x101 diverge). 1 walk, 2 skip, 0 other. */
export function gameUpdateSliceAwardsBit7WalkDecision(roomType8) {
  if ((roomType8 >>> 0) === 5 || (roomType8 >>> 0) === 0x11) return 1;
  if ((roomType8 >>> 0) === 0x10) return 2;
  return 0;
}

/* merchant_gate: 0x7fb40f [Room+4] -> +0x10 ptr / test / je + cmp [ptr+8],
   0x10 / jne + cmp [ptr],0x23 / jne. ptr!=0 && kind@0==0x23 &&
   type@8==0x10. FULL-DWORD (0x100/0x23f/0x101 diverge). */
export function gameUpdateSliceAwardsBit7MerchantGate(
  merchantPtrNonzero, merchantKind0, merchantType8,
) {
  if ((merchantPtrNonzero >>> 0) === 0) return 0;
  if ((merchantKind0 >>> 0) !== AWARDS_BIT7_MERCHANT_KIND) return 0;
  if ((merchantType8 >>> 0) !== AWARDS_BIT7_MERCHANT_TYPE) return 0;
  return 1;
}

/* head_select: 0x7fb3f7 fresh [Game+0x269c8] / cmp 2 / je 0x7fd8e2 + cmp
   3 / je 0x7fd8e2 (GREED — reuses gameUpdateSliceTriggerClearGreedMode) /
   merchant -> 2 / walk 1 -> 3 / walk 2 -> 4 / else 0. MACHINE ORDER:
   greed > merchant > walk > skip. */
export function gameUpdateSliceAwardsBit7HeadSelect(
  difficulty269c8, merchantGate, walkDecision,
) {
  if (gameUpdateSliceTriggerClearGreedMode(difficulty269c8 | 0) !== 0) {
    return 1;
  }
  if ((merchantGate | 0) !== 0) return 2;
  if ((walkDecision | 0) === 1) return 3;
  if ((walkDecision | 0) === 2) return 4;
  return 0;
}

/* generic_skip: 0x7fb482 call 0x74efd0 (HOST al) / test al,al / je
   0x7fb49d + cmp [Game+0x1830c],1 / je 0x7fe087. Skip iff
   (al & 0xff) != 0 && dim == 1. LOW-BYTE on al, FULL-DWORD on dim. */
export function gameUpdateSliceAwardsBit7GenericSkip(mineshaftAl, dim1830c) {
  if (((mineshaftAl | 0) & 0xff) === 0) return 0;
  return (dim1830c >>> 0) === 1 ? 1 : 0;
}

/* lua_gate_skip: 0x7fb2c6 call 0x866220 / 0x7fb2cb test al,al / 0x7fb2cd
   jne 0x7fe099 — nonzero LOW BYTE skips ALL award spawning + the tail
   store. WIDE 0x100 -> 0. */
export function gameUpdateSliceAwardsBit7LuaGateSkip(gateAl) {
  return ((gateAl | 0) & 0xff) !== 0 ? 1 : 0;
}

/* tail_store_fire: the 0x7fe087..0x7fe096 store [Room+4+0x60] = final_ac
   runs on EVERY non-Lua-skip path; ONLY 0x7fb2cd jne 0x7fe099 skips it. */
export function gameUpdateSliceAwardsBit7TailStoreFire(luaGateSkip) {
  return (luaGateSkip | 0) === 0 ? 1 : 0;
}

/* 812d00: VA 0x00812d00 — stage48 in [9..12] (UNSIGNED sub-9/ja), jump
   table 0x812dc8 {9:0x148, 10:0x13b, 11:0x84, 12:0x77}, SIGNED idiv by
   [Game+0x18300+0xc], out0 = f32(rem)*40.0f+40.0f (composes
   gameUpdateSliceTailmid706cExpirePosY), out1 = f32(quot)*40.0f+120.0f
   (composes ...ExpirePosX). chain null / stage out / divisor 0 -> fire 0. */
export function gameUpdateSlice812d00Arithmetic(
  chain4Nonzero, chain4_10Nonzero, stage48, divisorC,
) {
  if ((chain4Nonzero >>> 0) === 0) return { fire: 0, out0Bits: 0, out1Bits: 0 };
  if ((chain4_10Nonzero >>> 0) === 0) return { fire: 0, out0Bits: 0, out1Bits: 0 };
  const dec = ((stage48 >>> 0) - 9) >>> 0; /* sub eax,9 — 32-bit wrap */
  if (dec > 3) return { fire: 0, out0Bits: 0, out1Bits: 0 };
  const numer = dec === 0 ? 0x148 : dec === 1 ? 0x13b : dec === 2 ? 0x84 : 0x77;
  const divisor = divisorC | 0;
  if (divisor === 0) return { fire: 0, out0Bits: 0, out1Bits: 0 };
  const quot = ((numer | 0) / divisor) | 0; /* idiv, trunc toward zero */
  const rem = (numer | 0) % divisor; /* sign follows dividend (numer > 0) */
  const out0 = gameUpdateSliceTailmid706cExpirePosY(
    rem, AWARDS_BIT7_812D00_C4_BITS);
  const out1 = gameUpdateSliceTailmid706cExpirePosX(
    quot, AWARDS_BIT7_812D00_C4_BITS, AWARDS_BIT7_812D00_C5_BITS);
  return {
    fire: 1,
    out0Bits: bitsFromF32(out0) >>> 0,
    out1Bits: bitsFromF32(out1) >>> 0,
  };
}

/* 823ec0: VA 0x00823ec0 — x=(out0+0.0f-40.0f)/40.0f+0.5f cvttss2si;
   y=(out1-80.0f-120.0f)/40.0f+0.5f cvttss2si; SIGNED <0 and SIGNED >=
   bounds -> -1; return [Room+0xc]*yd+xd (imul+add 32-bit wrap).
   fire==0 -> PE reads uninitialized stack; -1 (only deterministic branch).
   cvttss2si indefinite (NaN/overflow) -> 0x80000000 -> -1. */
export function gameUpdateSlice823ec0Index(
  fire812d00, out0Bits, out1Bits, roomC, room10,
) {
  if ((fire812d00 | 0) === 0) return -1;
  const f = Math.fround;
  let x = f(f32FromBits(out0Bits >>> 0) + 0.0); /* addss 0.0f */
  let y = f(f32FromBits(out1Bits >>> 0) - 80.0); /* subss 80.0f */
  x = f(f(f(x - 40.0) / 40.0) + 0.5); /* subss/divss/addss 0.5f */
  let xd;
  if (!(x >= -2147483648.0 && x < 2147483648.0)) xd = -2147483648;
  else xd = x | 0; /* cvttss2si trunc */
  if (xd < 0) return -1; /* js */
  if (xd >= (roomC | 0)) return -1; /* jge SIGNED */
  y = f(f(f(y - 120.0) / 40.0) + 0.5); /* subss 120.0f */
  let yd;
  if (!(y >= -2147483648.0 && y < 2147483648.0)) yd = -2147483648;
  else yd = y | 0;
  if (yd < 0) return -1;
  if (yd >= (room10 | 0)) return -1;
  return (Math.imul(roomC | 0, yd) + xd) | 0; /* imul/add wrap */
}

/* merchant_chain: typed-host call-arg pack (0x7fb42e..0x7fb45f) — 4 fixed
   calls: 0x929b40(1,1) Mgr+0x14 / 0x95a7b0(0xe) no receiver / 0x929b40
   (0x1ec,1) Mgr+0x14 / 0x6f9770(0xe) Game. Fires iff merchant_gate. */
export function gameUpdateSliceAwardsBit7MerchantChain(fire) {
  return {
    fire: (fire | 0) !== 0 ? 1 : 0,
    call1Va: AWARDS_BIT7_CHAIN_CALL1_VA,
    call1Arg1: AWARDS_BIT7_CHAIN_CALL1_ARG1,
    call1Arg2: AWARDS_BIT7_CHAIN_CALL1_ARG2,
    call1ThisOff: AWARDS_BIT7_CHAIN_CALL1_THIS_OFF,
    call2Va: AWARDS_BIT7_CHAIN_CALL2_VA,
    call2Arg1: AWARDS_BIT7_CHAIN_CALL2_ARG1,
    call3Va: AWARDS_BIT7_CHAIN_CALL3_VA,
    call3Arg1: AWARDS_BIT7_CHAIN_CALL3_ARG1,
    call3Arg2: AWARDS_BIT7_CHAIN_CALL3_ARG2,
    call3ThisOff: AWARDS_BIT7_CHAIN_CALL3_THIS_OFF,
    call4Va: AWARDS_BIT7_CHAIN_CALL4_VA,
    call4Arg1: AWARDS_BIT7_CHAIN_CALL4_ARG1,
    call4ThisOff: AWARDS_BIT7_CHAIN_CALL4_THIS_OFF,
  };
}

/* ------------------------------------------------------------------ v95 - */
/* Record idx 15 opaqueRoomUpdatePrefixB3B7 — typed-host B3-B7 oracle
   (mirror of isaac_game_update_slice_b3b7_*). The B3 decision laws (FCO
   query gate, challenge id, TE list walk bounds/pre) + the B4-B7 frame
   laws land here; room-family v36/v37/v39 laws consumed BY REFERENCE.
   All byte-gate laws re-narrow in-body (Wasm ABI does not narrow i32). */

export const B3B7_TE_MAX_ENTRIES = 8;
export const B3B7_B5_MAX_ENTITIES = 32;
export const B3B7_B6_MAX_NODES = 32;
export const B3B7_B7_MAX_SLOTS = 64;

/* ---- B3 ---- */
export function gameUpdateSliceB3b7B3FcoFlagGate(fcoResult) {
  /* PE 0x00803340 test eax,eax / 0x0080334d setne al -> Room+0x7768. FULL. */
  return (fcoResult >>> 0) !== 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B3FcoId() {
  return 0x28d;
}
export function gameUpdateSliceB3b7B3HceId() {
  return 0x2a5;
}
export function gameUpdateSliceB3b7B3ChallengeHostGate(hceResult) {
  /* PE 0x0080335b test al,al / je skip. LOW-BYTE. */
  return ((hceResult >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B3TeWalkGate(byte7321) {
  /* PE 0x00803374 cmp byte [edi+0x7321],0 / jne skip. LOW-BYTE. */
  return ((byte7321 >>> 0) & 0xff) === 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B3TeWalkNonempty(begin, end) {
  /* PE 0x00803389 cmp / je skip. FULL-DWORD. */
  return (begin >>> 0) !== (end >>> 0) ? 1 : 0;
}
export function gameUpdateSliceB3b7B3TeEntryMatch(type0, variant4) {
  /* PE 0x00803392 cmp dword [ecx],0 / 0x00803397 cmp dword [ecx+4],0x40.
     FULL-DWORD both (0x1000000 must NOT match). */
  return (type0 >>> 0) === 0 && (variant4 >>> 0) === 0x40 ? 1 : 0;
}
export function gameUpdateSliceB3b7B3TeWalkContinue(next, end) {
  /* PE 0x008033a0 cmp eax,edx / jne loop. FULL-DWORD. */
  return (next >>> 0) !== (end >>> 0) ? 1 : 0;
}
export function gameUpdateSliceB3b7B3TeHostThisOff() {
  return 0x1618;
}
export function gameUpdateSliceB3b7B3TeHostArg() {
  return 0xc5d108;
}

/* ---- B4 ---- */
export function gameUpdateSliceB3b7B4DescTypeGate(descType0) {
  /* PE 0x008033b9 cmp dword [eax],-0x14. FULL-DWORD SIGNED. */
  return (descType0 | 0) === -0x14 ? 1 : 0;
}
export function gameUpdateSliceB3b7B4FrameInRoomGate(roomByte1, frame264f8, entry11f0) {
  /* PE 0x00803472 cmp byte [edi+1],0 / 0x00803487 cmp frame,entry. */
  if (((roomByte1 >>> 0) & 0xff) === 0) return 0;
  return (frame264f8 | 0) === (entry11f0 | 0) ? 1 : 0;
}
export function gameUpdateSliceB3b7B4LookupRoute(lookupCount) {
  /* PE 0x008033eb cmp dword [ebp-0xa74],0 / jne entity-seed. FULL-DWORD. */
  return (lookupCount >>> 0) === 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B4PickupVariantFromRem(rem100) {
  return roomB4PickupVariantFromRem(rem100 >>> 0);
}
export function gameUpdateSliceB3b7B4SecondBandKind(rem100) {
  return roomB4SecondBandKind(rem100 >>> 0);
}
export function gameUpdateSliceB3b7B4BandOptionGate(optionByte, mgrMode8, gameNonnull, game26630, gameByte26589) {
  return roomB4OptionGate(optionByte >>> 0, mgrMode8 | 0, gameNonnull >>> 0, game26630 >>> 0, gameByte26589 >>> 0);
}
export function gameUpdateSliceB3b7B4ThirdSpawnGate(rng3) {
  return roomB4ThirdSpawnGate(rng3 >>> 0);
}
export function gameUpdateSliceB3b7B4CleanupGate(lookupResultByte) {
  return roomB4CleanupNeeded(lookupResultByte >>> 0);
}

/* ---- B5 ---- */
export function gameUpdateSliceB3b7B5OuterGate(roomByte0, frame264f8, entry11f0) {
  /* PE 0x00803886 cmp byte [edi],0 / frame==entry. LOW + FULL. */
  if (((roomByte0 >>> 0) & 0xff) === 0) return 0;
  return (frame264f8 | 0) === (entry11f0 | 0) ? 1 : 0;
}
export function gameUpdateSliceB3b7B5Pass1Mode(game26584) {
  /* PE 0x008038a7 cmp dword [ecx+0x26584],0x28. FULL-DWORD. */
  return (game26584 >>> 0) === 0x28 ? 1 : 0;
}
export function gameUpdateSliceB3b7B5TypeCandidate(mode26614, entityType28) {
  /* (mode>=2 && type==1) || (type-0xa) < 0x3de — UNSIGNED range. */
  return roomB5EntityTypeCandidate(mode26614 | 0, entityType28 | 0);
}
export function gameUpdateSliceB3b7B5FlagClear(flags168) {
  return roomB5EntityFlagClear(flags168 >>> 0);
}
export function gameUpdateSliceB3b7B5ExcludedType(type28, variant2c) {
  return roomB5EntityTypeExcluded(type28 | 0, variant2c | 0);
}
export function gameUpdateSliceB3b7B5PostVcall48Ok(vt48Al, field32c) {
  /* PE 0x00803921 test al,al / 0x00803925 cmp dword [esi+0x32c],0 jl. */
  if (((vt48Al >>> 0) & 0xff) === 0) return 0;
  return (field32c | 0) >= 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B5Pass2CountGate(count708250) {
  /* PE 0x008039ae cmp eax,3 / jle skip. SIGNED. */
  return roomB5Pass2CountGate(count708250 | 0);
}
export function gameUpdateSliceB3b7B5NeedsRng(vt4cAl) {
  /* PE 0x00803a47 test al,al / jne skip. LOW-BYTE. */
  return ((vt4cAl >>> 0) & 0xff) === 0 ? 1 : 0;
}
export function gameUpdateSliceB3b7B5AppendGate(rng) {
  return roomB5EntityRngAppendGate(rng >>> 0);
}
export function gameUpdateSliceB3b7B5SeedFatalGate(seed3dc) {
  /* PE 0x00803a66 test edx,edx / jne continue. FULL-DWORD. */
  return (seed3dc >>> 0) === 0 ? 1 : 0;
}

/* ABI v99 leaf peel (idx 15): FUN_00708250 (0x00708250..0x00708343).
   Transcribed from the instruction stream — do NOT derive from the C++.
   Nested 0x4288a0 is the last-node sample source (HUD-v16 pin); nested
   0x7db860 is the per-included-player addend. 0xa112c0 mid-loop empty
   warn continues and is not in this captured-count model. */
export const B5_COUNT_708250_MAX_PLAYERS = 8;
export const B5_COUNT_708250_SCAN_WANTED = 0x4f;
export const B5_COUNT_708250_BUF_GATE = 0x8f;
export const B5_COUNT_708250_HOST_VA = 0x00708250;
export const B5_COUNT_708250_HOST_VA_7DB860 = 0x007db860;
export const B5_COUNT_708250_HOST_VA_4288A0 = 0x004288a0;
export const B5_COUNT_708250_HOST_VA_FATAL = 0x00a112c0;
export const B5_COUNT_708250_FATAL_STRING = 0x00b7e6bc;
export const B5_COUNT_708250_FATAL_ARG = 0x10;

export function gameUpdateSliceB5Count708250NodeReject(nodeByteD, nodeValue10, nodeIsHead) {
  /* PE 0x70827c cmp byte [eax+0xd],0 / jne. LOW-BYTE. */
  if (((nodeByteD >>> 0) & 0xff) !== 0) return 1;
  /* PE 0x708286 cmp dword [eax+0x10],0x4f / jg. SIGNED. */
  if ((nodeValue10 | 0) > (B5_COUNT_708250_SCAN_WANTED | 0)) return 1;
  /* PE 0x708290 cmp eax,[esi+0x1bbd8] / je. FULL-DWORD. */
  if ((nodeIsHead >>> 0) !== 0) return 1;
  return 0;
}
export function gameUpdateSliceB5Count708250PlayerInclude(field2c, field3bc) {
  /* PE 0x7082fb / 0x708301 cmp dword,0 / jne skip. FULL-DWORD. */
  return ((field2c >>> 0) === 0 && (field3bc >>> 0) === 0) ? 1 : 0;
}
export function gameUpdateSliceB5Count708250Empty(playerCount) {
  /* PE 0x7082b6 test ecx,ecx / je. FULL-DWORD. */
  return (playerCount >>> 0) === 0 ? 1 : 0;
}
export function gameUpdateSliceB5Count708250Continue(index, countNow) {
  /* PE 0x70832b cmp edi,ecx / jb. UNSIGNED. Bound re-read per iteration. */
  return ((index >>> 0) < (countNow >>> 0)) ? 1 : 0;
}
export function gameUpdateSliceB5Count708250_7db860(
  nodeByteD, nodeValue10, nodeIsHead, bufBegin, bufEnd, bufByte,
) {
  /* Nested 0x7db860: same node reject then SIGNED (end-begin) > 0x8f
     then movzx byte [begin+0x8f]. */
  if (gameUpdateSliceB5Count708250NodeReject(nodeByteD, nodeValue10, nodeIsHead) !== 0) {
    return 0;
  }
  const span = (((bufEnd >>> 0) - (bufBegin >>> 0)) | 0);
  if (span <= (B5_COUNT_708250_BUF_GATE | 0)) return 0;
  return (bufByte | 0) & 0xff;
}
export function gameUpdateSliceB5Count708250({
  nodeByteD = 0, nodeValue10 = 0, nodeIsHead = 0, playerCount = 0,
  players = [], counts = null,
} = {}) {
  const plan = { result: 0, nodeReject: 0, emptyVector: 0, host7db860: 0, included: 0 };
  if (gameUpdateSliceB5Count708250NodeReject(nodeByteD, nodeValue10, nodeIsHead) !== 0) {
    plan.nodeReject = 1;
    return plan;
  }
  if (gameUpdateSliceB5Count708250Empty(playerCount) !== 0) {
    plan.emptyVector = 1;
    return plan;
  }
  let acc = 0;
  for (let i = 0; i < B5_COUNT_708250_MAX_PLAYERS; i += 1) {
    const countNow = (counts != null && counts[i] !== undefined) ? counts[i] : playerCount;
    if (gameUpdateSliceB5Count708250Continue(i, countNow) === 0) break;
    const pl = players[i] ?? {};
    if (gameUpdateSliceB5Count708250PlayerInclude(pl.field2c ?? 0, pl.field3bc ?? 0) === 0) {
      continue;
    }
    plan.included += 1;
    plan.host7db860 += 1;
    acc = (acc + (gameUpdateSliceB5Count708250_7db860(
      nodeByteD, nodeValue10, nodeIsHead, pl.bufBegin ?? 0, pl.bufEnd ?? 0, pl.bufByte ?? 0,
    ) >>> 0)) >>> 0;
  }
  plan.result = acc;
  return plan;
}
export function gameUpdateSliceB5Count708250Result(
  nodeByteD, nodeValue10, nodeIsHead, playerCount, players = [],
) {
  return gameUpdateSliceB5Count708250({
    nodeByteD, nodeValue10, nodeIsHead, playerCount, players,
  }).result >>> 0;
}
export function gameUpdateSliceB5Count708250HostVa() {
  return B5_COUNT_708250_HOST_VA;
}
export function gameUpdateSliceB5Count708250HostVa7db860() {
  return B5_COUNT_708250_HOST_VA_7DB860;
}
export function gameUpdateSliceB5Count708250HostVa4288a0() {
  return B5_COUNT_708250_HOST_VA_4288A0;
}


/* ---- B6 ---- */
export function gameUpdateSliceB3b7B6DestroyNeeded(treeCount7238) {
  return roomB6DestroyTreeGate(treeCount7238 >>> 0);
}
export function gameUpdateSliceB3b7B6GridIndexValid(gridIndex, widthC, height10) {
  return roomB6GridIndexValid(gridIndex | 0, widthC | 0, height10 | 0);
}

/* ---- B7 ---- */
export function gameUpdateSliceB3b7B7GridCells(w, h) {
  return roomB7CellCount(w | 0, h | 0);
}
export function gameUpdateSliceB3b7B7GridUpdateNeeded(cells) {
  return roomB7CellLoopEnter(cells | 0);
}
export function gameUpdateSliceB3b7B7SlotUpdateNeeded(slotPtr) {
  return roomB7CellNeedsVcall(slotPtr >>> 0);
}
export function gameUpdateSliceB3b7B7CellBaseOff() {
  return 0x24;
}

/* ---- Record wire decide (mirror of isaac_game_update_slice_b3b7_wire).
   runtimeInputs = the capture pack; frame264f8 = Game+0x264f8 (state).
   Returns the typed plan with per-leaf host counts. ---- */
export function gameUpdateSliceB3b7WireDecide(runtimeInputs, frame264f8) {
  const rt = runtimeInputs ?? {};
  const plan = {
    b3HostFco: 0, b3HostChallenge: 0, b3HostTeCall: 0,
    b4HostLookup: 0, b4HostPosA: 0, b4HostPosFinish: 0,
    b4GenrandDraws: 0, b4HostSpawns: 0, b4HostCleanup: 0, b4SeedFatal: 0,
    b5HostCount708250: 0, b5HostVcall48: 0, b5HostGrow: 0,
    b5HostVcall4c: 0, b5SeedFatal: 0,
    b6HostDestroy: 0, b6HostIterate: 0, b6HostClear: 0, b7HostUpdate: 0,
  };
  const u = (v) => (v >>> 0);
  const i32 = (v) => (v | 0);
  /* Row reads: corpus/bridge ARRAY form is element-per-u32; the bridge's
     flat row staging (update-v107-record15-capture §3) ships u32-LE
     BYTES (Uint8Array — writeField "bytes" emits 1 byte/element). */
  const arr = (a, i) => {
    if (a == null) return 0 >>> 0;
    if (typeof a === "object" && a !== null && typeof a.byteLength === "number" &&
        a.byteLength % 4 === 0 && typeof a.length === "number" &&
        a.length === a.byteLength) {
      if (i * 4 + 4 > a.byteLength) return 0 >>> 0;
      return new DataView(a.buffer, a.byteOffset, a.byteLength).getUint32(i * 4, true);
    }
    return (Array.isArray(a) && a[i] !== undefined ? a[i] : 0) >>> 0;
  };

  /* B3 (0x00803327..0x008033b1). */
  plan.b3HostFco = 1; /* call 0x9be080 @0x0080333b unconditional */
  if (gameUpdateSliceB3b7B3ChallengeHostGate(u(rt.b3b7Hce2a5Hit)) !== 0) {
    plan.b3HostChallenge = 1; /* 0x7ea2d0 @0x00803367 */
  }
  if (gameUpdateSliceB3b7B3TeWalkGate(u(rt.b3b7TeByte7321)) !== 0 &&
      gameUpdateSliceB3b7B3TeWalkNonempty(u(rt.b3b7TeBegin), u(rt.b3b7TeEnd)) !== 0) {
    let n = Math.min(u(rt.b3b7TeEntriesCount), B3B7_TE_MAX_ENTRIES);
    for (let i = 0; i < n; i += 1) {
      if (gameUpdateSliceB3b7B3TeEntryMatch(
          arr(rt.b3b7TeEntryType, i), arr(rt.b3b7TeEntryId, i)) !== 0) {
        plan.b3HostTeCall = 1; /* 0x9960b0 @0x008033b1 */
        break;
      }
    }
  }

  /* B4 (0x008033b6..0x00803854). */
  if (gameUpdateSliceB3b7B4DescTypeGate(u(rt.b3b7DescType0)) !== 0) {
    plan.b4HostLookup = 1; /* 0x41af60 @0x008033df */
    if (gameUpdateSliceB3b7B4LookupRoute(u(rt.b3b7LookupCount)) !== 0) {
      /* G0: pos_a + pos_finish + genrand + spawn. */
      plan.b4HostPosA = 1;
      plan.b4HostPosFinish += 1;
      plan.b4GenrandDraws += 1;
      plan.b4HostSpawns += 1;
    }
    if (gameUpdateSliceB3b7B4FrameInRoomGate(
        u(rt.b3b7RoomByte1), i32(frame264f8), i32(rt.ambientRoomEntry11f0)) !== 0) {
      if (u(rt.b3b7DescSeed5c) === 0) {
        plan.b4SeedFatal = 1; /* 0xa112c0 seed-null + int3 stops the suite */
      } else {
        /* G1: genrand + reward pos_finish + pickup spawn. */
        plan.b4GenrandDraws += 1;
        plan.b4HostPosFinish += 1;
        plan.b4HostSpawns += 1;
        /* Second band + third gate from the pure seed chain. */
        const chain = roomB4RewardSeedChain(u(rt.b3b7DescSeed5c)) || {};
        const bandKind = chain.bandKind | 0;
        if (bandKind !== 0) {
          let bandOk = 1;
          if (bandKind !== 1) {
            const optOff = bandKind === 2 ? 1 : (bandKind === 3 ? 2 : 3);
            const optByte = optOff === 1 ? rt.b3b7MgrByte1b4
              : (optOff === 2 ? rt.b3b7MgrByte2bf : rt.b3b7MgrByte1ba);
            bandOk = gameUpdateSliceB3b7B4BandOptionGate(
              u(optByte), u(rt.b3b7MgrMode8), u(rt.b3b7GameNonnull),
              u(rt.b3b7Game26630), u(rt.b3b7GameByte26589));
          }
          if (bandOk !== 0) {
            plan.b4GenrandDraws += 1;
            plan.b4HostSpawns += 1;
          }
        }
        if ((chain.thirdGate | 0) !== 0) {
          plan.b4HostPosFinish += 1;
          plan.b4GenrandDraws += 1;
          plan.b4HostSpawns += 1;
        }
      }
    }
    /* Cleanup on both routes (result byte == 0 -> 0xa648b0), but NOT after
       the seed-null fatal (int3 terminates the residual). */
    if (plan.b4SeedFatal === 0 &&
        gameUpdateSliceB3b7B4CleanupGate(u(rt.b3b7LookupResultByte)) !== 0) {
      plan.b4HostCleanup = 1;
    }
  }
  /* The seed-null fatal's int3 terminates the process: no B5-B7 content. */
  if (plan.b4SeedFatal !== 0) {
    return plan;
  }

  /* B5 (0x00803854..0x00803b1d). */
  if (gameUpdateSliceB3b7B5OuterGate(
      u(rt.b3b7RoomByte0), i32(frame264f8), i32(rt.ambientRoomEntry11f0)) !== 0) {
    plan.b5HostCount708250 = 1; /* 0x708250 @0x008039a3 */
    let end = u(rt.b3b7ListEnd);
    const cap = u(rt.b3b7ListCap);
    const count = u(rt.b3b7EntityCount);
    const n = Math.min(count, B3B7_B5_MAX_ENTITIES);
    /* pass1 (mode == 0x28). */
    if (gameUpdateSliceB3b7B5Pass1Mode(u(rt.b3b7Game26584)) !== 0) {
      for (let i = 0; i < n; i += 1) {
        if (gameUpdateSliceB3b7B5TypeCandidate(
            u(rt.b3b7Game26614), arr(rt.b3b7B5Type, i)) === 0) continue;
        if (gameUpdateSliceB3b7B5FlagClear(arr(rt.b3b7B5Flags168, i)) === 0) continue;
        plan.b5HostVcall48 += 1; /* [vt+0x48] @0x0080391f */
        if (gameUpdateSliceB3b7B5PostVcall48Ok(
            arr(rt.b3b7B5Vt48Al, i), i32(arr(rt.b3b7B5Field32c, i))) !== 0 &&
            gameUpdateSliceB3b7B5ExcludedType(
              arr(rt.b3b7B5Type, i), arr(rt.b3b7B5Variant, i)) === 0) {
          if (roomB5ListAtCapacity(end, cap) !== 0) plan.b5HostGrow += 1;
          end = roomB5ListEndAfterStore(end);
        }
      }
    }
    /* pass2 (count > 3 signed). */
    if (gameUpdateSliceB3b7B5Pass2CountGate(i32(rt.b3b7Count708250)) !== 0) {
      const budget = roomB5Pass2AppendBudget(i32(rt.b3b7Count708250));
      for (let i = 0; i < n && plan.b5SeedFatal === 0; i += 1) {
        if (gameUpdateSliceB3b7B5TypeCandidate(
            u(rt.b3b7Game26614), arr(rt.b3b7B5Type, i)) === 0) continue;
        if (gameUpdateSliceB3b7B5FlagClear(arr(rt.b3b7B5Flags168, i)) === 0) continue;
        plan.b5HostVcall48 += 1; /* [vt+0x48] @0x00803a24 */
        if (gameUpdateSliceB3b7B5PostVcall48Ok(
            arr(rt.b3b7B5Vt48Al, i), i32(arr(rt.b3b7B5Field32c, i))) === 0) continue;
        plan.b5HostVcall4c += 1; /* [vt+0x4c] @0x00803a42 */
        if (gameUpdateSliceB3b7B5NeedsRng(arr(rt.b3b7B5Vt4cAl, i)) === 0) continue;
        let seed = arr(rt.b3b7B5Seed3dc, i);
        for (let b = 0; b < budget; b += 1) {
          if (gameUpdateSliceB3b7B5SeedFatalGate(seed) !== 0) {
            plan.b5SeedFatal = 1; /* 0xa112c0 + int3 stops the residual */
            seed = 0;
            break;
          }
          seed = roomB5EntityRngStep(
            seed, arr(rt.b3b7B5Shift3e0, i), arr(rt.b3b7B5Shift3e4, i),
            arr(rt.b3b7B5Shift3e8, i));
          if (gameUpdateSliceB3b7B5AppendGate(seed) !== 0) {
            if (roomB5ListAtCapacity(end, cap) !== 0) plan.b5HostGrow += 1;
            end = roomB5ListEndAfterStore(end);
          }
        }
      }
    }
  }

  /* The B5 pass2 seed-null fatal (int3 @0x00803a83) terminates the
     process: B6/B7 never run. */
  if (plan.b5SeedFatal !== 0) {
    return plan;
  }

  /* B6 (0x00803b2e..0x00803bb4). */
  if (gameUpdateSliceB3b7B6DestroyNeeded(u(rt.b3b7TreeCount7238)) !== 0) {
    const m = Math.min(u(rt.b3b7B6NodeCount), B3B7_B6_MAX_NODES);
    for (let i = 0; i < m; i += 1) {
      plan.b6HostIterate += 1; /* 0x414a80 per node */
      if (gameUpdateSliceB3b7B6GridIndexValid(
          i32(arr(rt.b3b7B6NodeIdx, i)), i32(rt.b3b7WidthC),
          i32(rt.b3b7Height10)) === 0) continue;
      if (arr(rt.b3b7B6NodeSlotNonnull, i) === 0) continue;
      plan.b6HostDestroy += 1; /* [vt+0] push 1 @0x00803b6e */
    }
    plan.b6HostClear = 1; /* 0x424540 @0x00803b9d */
  }

  /* B7 (0x00803bb4..0x00803bfb). */
  {
    const cells = gameUpdateSliceB3b7B7GridCells(
      i32(rt.b3b7WidthC), i32(rt.b3b7Height10));
    if (gameUpdateSliceB3b7B7GridUpdateNeeded(cells) !== 0) {
      const k = Math.min(u(rt.b3b7B7NonnullSlotCount), B3B7_B7_MAX_SLOTS);
      /* Each captured non-null slot index -> one [vt+8] call. */
      plan.b7HostUpdate += k;
    }
  }
  return plan;
}

/* ================= ABI v95 (record idx 18): roomTriggerOutput
   0x00823080 BODY pure laws =================
   PE 0x00823080..0x00823145 (ret 4, thiscall Room*): phase-1 per-channel
   intrusive walk (head [this+0x7328+8*arg]; advance 0x414a80; dispatch
   0x823150 when [this+0x24+4*f10] != 0), phase-2 triple-match scan over
   [this+0x125c] (count [this+0x1264]; FULL-DWORD f28==0x3e8 &&
   f2c==0x78 && f450==arg -> byte f173=1 + vtbl+0xc vcall), phase-3
   callback range (begin/end at this+0x7378+12*arg / this+0x737c+12*arg,
   fn-ptr stride 4, plain != loop). Caller census (ALL direct E8):
   0x80207e arg0 (tail-mid residual), 0x804170 arg9 (clear-side arm —
   THE record-18 wire site; PE 0x80416c push 9), 0x985957 arg0..3
   (Game->f18300 room switch). Names only — the coordinator pins layout
   offsets (section-notes/update-v95-18-trigger-output §Layout). ABI
   stays 95. JS twins mirror the C++ exports branch-for-branch. */
export const ROOM_TRIGGER_OUTPUT_CLEAR_ARG = 9;
export const ROOM_TRIGGER_OUTPUT_MAX_WALK_NODES = 128;
export const ROOM_TRIGGER_OUTPUT_MAX_TABLE = 64;
export const ROOM_TRIGGER_OUTPUT_MAX_ENTRIES = 256;
export const ROOM_TRIGGER_OUTPUT_MAX_MATCHES = 64;
export const ROOM_TRIGGER_OUTPUT_MAX_CALLBACKS = 256;
export const ROOM_TRIGGER_OUTPUT_MATCH_TYPE = 0x3e8;
export const ROOM_TRIGGER_OUTPUT_MATCH_VARIANT = 0x78;

function triggerOutputNodeIndex(nodes, addr) {
  for (let i = 0; i < nodes.length; i += 1) {
    if ((nodes[i].addr >>> 0) === (addr >>> 0)) return i;
  }
  return -1;
}

function triggerOutputTableIndex(table, index) {
  for (let i = 0; i < table.length; i += 1) {
    if ((table[i].index >>> 0) === (index >>> 0)) return i;
  }
  return -1;
}

/* advance 0x414a80 over (head, nodes); the head is the virtual slot
   nodes.length. Returns { next } or null when the graph leaves the
   capture (-> monolith). Mirrors room_trigger_output_advance in the C++
   export (0x414ab1 side + 0x414a8f side). */
function triggerOutputAdvance(head, nodes, curAddr) {
  const headAddr = head.addr >>> 0;
  const idxOf = (addr) => {
    if ((addr >>> 0) === headAddr) return nodes.length;
    return triggerOutputNodeIndex(nodes, addr);
  };
  const nextOf = (ci) => (ci === nodes.length ? head.next : nodes[ci].next) >>> 0;
  const parentOf = (ci) => (ci === nodes.length ? head.parent : nodes[ci].parent) >>> 0;
  const childOf = (ci) => (ci === nodes.length ? head.child : nodes[ci].child) >>> 0;
  const flagOf = (ci) => (ci === nodes.length ? head.flag : nodes[ci].flag) & 0xff;
  const nodeCi = idxOf(curAddr);
  if (nodeCi < 0) return null;
  const aAddr = childOf(nodeCi); /* a = node->child (+8) */
  const aCi = idxOf(aAddr);
  if (aCi < 0) return null;
  if (flagOf(aCi) === 0) {
    /* 0x414ab1 side: c = a->next; live c -> local = a; else run to the
       last flag==0 node before a flag!=0 node (0x414ac0 loop). */
    let cAddr = nextOf(aCi);
    let cCi = idxOf(cAddr);
    if (cCi < 0) return null;
    if (flagOf(cCi) !== 0) return { next: aAddr }; /* 0x414ab7 jne */
    let dAddr = aAddr;
    let guard = 0;
    for (;;) {
      guard += 1;
      if (guard > nodes.length + 2) return null; /* malformed cycle */
      const eAddr = nextOf(cCi); /* 0x414ac0 mov eax,[ecx] */
      dAddr = cAddr; /* 0x414ac2 mov edi,ecx */
      cAddr = eAddr; /* 0x414ac4 mov ecx,eax */
      const eCi = idxOf(cAddr);
      if (eCi < 0) return null;
      cCi = eCi;
      if (flagOf(cCi) !== 0) break; /* 0x414ac6 cmp byte / je loop */
    }
    return { next: dAddr }; /* 0x414acc mov [esi],edi */
  }
  /* 0x414a8f side: b = node->parent; climb while node == b->child. */
  let bAddr = parentOf(nodeCi);
  let nodeAddr = curAddr >>> 0;
  let guard = 0;
  for (;;) {
    guard += 1;
    if (guard > nodes.length + 2) return null; /* malformed climb */
    const bCi = idxOf(bAddr);
    if (bCi < 0) return null;
    if (flagOf(bCi) !== 0) return { next: bAddr }; /* 0x414a96 jne */
    if ((nodeAddr >>> 0) !== (childOf(bCi) >>> 0)) {
      return { next: bAddr }; /* 0x414a9b jne */
    }
    nodeAddr = bAddr >>> 0; /* 0x414a9d/0x414a9f */
    bAddr = parentOf(bCi); /* 0x414aa1 */
  }
}

/* Phase-1 walk law: {valid, visited, dispatch}; valid=0 -> monolith. */
export function gameUpdateSliceTriggerOutputWalk(head, nodes, table) {
  if (nodes.length > ROOM_TRIGGER_OUTPUT_MAX_WALK_NODES ||
      table.length > ROOM_TRIGGER_OUTPUT_MAX_TABLE) {
    return { valid: 0, visited: 0, dispatch: 0 }; /* over-cap -> monolith */
  }
  const headAddr = head.addr >>> 0;
  if ((head.next >>> 0) === headAddr) {
    return { valid: 1, visited: 0, dispatch: 0 }; /* 0x82309e je skip */
  }
  let cur = head.next >>> 0;
  let visited = 0;
  let dispatch = 0;
  let guard = 0;
  while ((cur >>> 0) !== headAddr) { /* 0x8230be cmp / 0x8230c5 jne */
    guard += 1;
    if (guard > 2 * nodes.length + 4) return { valid: 0, visited: 0, dispatch: 0 };
    const ci = triggerOutputNodeIndex(nodes, cur);
    if (ci < 0) return { valid: 0, visited: 0, dispatch: 0 };
    const idx = nodes[ci].f10 >>> 0; /* 0x8230a0 mov eax,[eax+0x10] */
    const ti = triggerOutputTableIndex(table, idx);
    if (ti < 0) return { valid: 0, visited: 0, dispatch: 0 };
    if ((table[ti].value >>> 0) !== 0) dispatch += 1; /* 0x8230a7 test/je */
    visited += 1;
    const adv = triggerOutputAdvance(head, nodes, cur); /* 0x8230b5 */
    if (!adv) return { valid: 0, visited: 0, dispatch: 0 };
    cur = adv.next >>> 0;
  }
  return { valid: 1, visited, dispatch };
}

/* Phase-2 scan law: {valid, match, indexes}; match == host vtbl+0xc
   calls == f173 byte stores (PE 0x8230c7..0x823113, unsigned jb loop;
   gate order f28 -> f2c -> f450, FULL-DWORD). */
export function gameUpdateSliceTriggerOutputScan(arg, entries, cap = ROOM_TRIGGER_OUTPUT_MAX_MATCHES) {
  if (entries.length > ROOM_TRIGGER_OUTPUT_MAX_ENTRIES) {
    return { valid: 0, match: 0, indexes: [] };
  }
  const indexes = [];
  for (let i = 0; i < entries.length; i += 1) {
    const e = entries[i];
    if ((e.f28 >>> 0) !== ROOM_TRIGGER_OUTPUT_MATCH_TYPE) continue;
    if ((e.f2c >>> 0) !== ROOM_TRIGGER_OUTPUT_MATCH_VARIANT) continue;
    if ((e.f450 >>> 0) !== (arg >>> 0)) continue;
    if (indexes.length >= cap) return { valid: 0, match: 0, indexes: [] };
    indexes.push(i);
  }
  return { valid: 1, match: indexes.length, indexes };
}

/* Phase-3 callback law (PE 0x823115..0x82313d): (end-begin)/4 host
   fn-pointer calls; -1 = monolith (end < begin / misaligned / over-cap). */
export function gameUpdateSliceTriggerOutputCallbacks(begin, end) {
  const b = begin >>> 0;
  const e = end >>> 0;
  if (b === e) return 0; /* 0x823128 je 0x82313f */
  if (e < b) return -1; /* the 0x82313d jne loop would overrun */
  const span = e - b;
  if ((span & 3) !== 0) return -1; /* 4-byte fn-ptr stride */
  const count = span >>> 2;
  if (count > ROOM_TRIGGER_OUTPUT_MAX_CALLBACKS) return -1;
  return count;
}

/* ABI v99 exports-only (idx 18, update-v114-triggeroutput-dispatch):
   FUN_00823150 gate layer. Transcribed from the instruction stream —
   do NOT derive from the C++. Hit bodies stay typed-host. */
export const TO_823150_ARM_JOIN = 0;
export const TO_823150_ARM_C = 1;
export const TO_823150_ARM_14 = 2;
export const TO_823150_ARM_2 = 3;
export const TO_823150_ARM_7 = 4;
export const TO_823150_ARM_17_EQ = 5;
export const TO_823150_ARM_17_NE = 6;
export const TO_823150_HOST_NONE = 0;
export const TO_823150_HOST_VCALL = 1;
export const TO_823150_HOST_ANM2 = 2;
export const TO_823150_HOST_CTOR = 3;
export const TO_823150_HOST_SPAWN_SFX = 4;
export const TO_823150_ANM2_STRING_14 = 0x00b6c96c;
export const TO_823150_ANM2_STRING_17_EQ = 0x00b60ec4;
export const TO_823150_ANM2_STRING_17_NE = 0x00b60ecc;
export const TO_823150_ANM2_PLAY_VA = 0x0040a380;
export const TO_823150_SFX_PLAY_VA = 0x0092dc30;
export const TO_823150_SFX_PREP_VA = 0x00956780;
export const TO_823150_SPAWN_VA = 0x006fe410;
export const TO_823150_CTOR_VA = 0x00435c70;
export const TO_823150_GENRAND_VA = 0x006eef60;
export const TO_823150_714610_VA = 0x00714610;

export function gameUpdateSlice823150GateTypeC(type, fieldC) {
  /* PE 0x823162 cmp eax,0xc FULL-DWORD; 0x823167 cmp [ebx+0xc],4 UNSIGNED jae. */
  return ((type >>> 0) === 0xc && (fieldC >>> 0) < 4) ? 1 : 0;
}
export function gameUpdateSlice823150GateType14(type, fieldC) {
  /* PE 0x8231d3 cmp 0x14; 0x8231d8 cmp [ebx+0xc],0. FULL-DWORD. */
  return ((type >>> 0) === 0x14 && (fieldC >>> 0) === 0) ? 1 : 0;
}
export function gameUpdateSlice823150GateType2(type, fieldC, field18) {
  /* PE 0x8231fa cmp 2; 0x8231ff field_18!=0; 0x823209 field_c==1. FULL-DWORD. */
  return ((type >>> 0) === 2 && (field18 >>> 0) !== 0 && (fieldC >>> 0) === 1) ? 1 : 0;
}
export function gameUpdateSlice823150GateType7(type, fieldC, field18) {
  /* PE 0x82322f cmp 7; 0x823238 field_18!=0; 0x823242 field_c==0. FULL-DWORD. */
  return ((type >>> 0) === 7 && (field18 >>> 0) !== 0 && (fieldC >>> 0) === 0) ? 1 : 0;
}
export function gameUpdateSlice823150GateType17(type) {
  /* PE 0x823326 cmp eax,0x17. FULL-DWORD. */
  return ((type >>> 0) === 0x17) ? 1 : 0;
}
export function gameUpdateSlice823150Type17FieldCEq2(fieldC) {
  /* PE 0x82332b cmp [ebx+0xc],2. FULL-DWORD. */
  return ((fieldC >>> 0) === 2) ? 1 : 0;
}
export function gameUpdateSlice823150Dispatch(type, fieldC, field18) {
  const t = type >>> 0;
  const c = fieldC >>> 0;
  const f18 = field18 >>> 0;
  if (t === 0xc) {
    if (c < 4) return { arm: TO_823150_ARM_C, hostKind: TO_823150_HOST_VCALL, fieldCStore: 0 };
    return { arm: TO_823150_ARM_JOIN, hostKind: TO_823150_HOST_NONE, fieldCStore: 0 };
  }
  if (t === 0x14) {
    if (c === 0) return { arm: TO_823150_ARM_14, hostKind: TO_823150_HOST_ANM2, fieldCStore: 0 };
    return { arm: TO_823150_ARM_JOIN, hostKind: TO_823150_HOST_NONE, fieldCStore: 0 };
  }
  if (t === 2) {
    if (f18 !== 0 && c === 1) return { arm: TO_823150_ARM_2, hostKind: TO_823150_HOST_CTOR, fieldCStore: 0 };
    return { arm: TO_823150_ARM_JOIN, hostKind: TO_823150_HOST_NONE, fieldCStore: 0 };
  }
  if (t === 7) {
    if (f18 !== 0 && c === 0) return { arm: TO_823150_ARM_7, hostKind: TO_823150_HOST_SPAWN_SFX, fieldCStore: 2 };
    return { arm: TO_823150_ARM_JOIN, hostKind: TO_823150_HOST_NONE, fieldCStore: 0 };
  }
  if (t === 0x17) {
    if (c === 2) return { arm: TO_823150_ARM_17_EQ, hostKind: TO_823150_HOST_ANM2, fieldCStore: 1 };
    return { arm: TO_823150_ARM_17_NE, hostKind: TO_823150_HOST_ANM2, fieldCStore: 2 };
  }
  return { arm: TO_823150_ARM_JOIN, hostKind: TO_823150_HOST_NONE, fieldCStore: 0 };
}
export function gameUpdateSlice823150DispatchArm(type, fieldC, field18) {
  return gameUpdateSlice823150Dispatch(type, fieldC, field18).arm >>> 0;
}
export function gameUpdateSlice823150DispatchHostKind(type, fieldC, field18) {
  return gameUpdateSlice823150Dispatch(type, fieldC, field18).hostKind >>> 0;
}
export function gameUpdateSlice823150DispatchFieldCStore(type, fieldC, field18) {
  return gameUpdateSlice823150Dispatch(type, fieldC, field18).fieldCStore >>> 0;
}
export function gameUpdateSlice823150Type7StoreFires(fieldC) {
  /* PE 0x82330b cmp [ecx+0xc],0 / jne JOIN. Recapture. FULL-DWORD. */
  return ((fieldC >>> 0) === 0) ? 1 : 0;
}
export function gameUpdateSlice823150Anm2ReceiverOff() {
  return 0x40;
}
export function gameUpdateSlice823150Anm2PlayBool() {
  return 0;
}
export function gameUpdateSlice823150Anm2StringVa(arm) {
  const a = arm >>> 0;
  if (a === TO_823150_ARM_14) return TO_823150_ANM2_STRING_14;
  if (a === TO_823150_ARM_17_EQ) return TO_823150_ANM2_STRING_17_EQ;
  if (a === TO_823150_ARM_17_NE) return TO_823150_ANM2_STRING_17_NE;
  return 0;
}
export function gameUpdateSlice823150Anm2PlayVa() {
  return TO_823150_ANM2_PLAY_VA;
}
export function gameUpdateSlice823150SfxId() {
  return 0x89;
}
export function gameUpdateSlice823150SfxVolBits() {
  return 0x3f800000;
}
export function gameUpdateSlice823150SfxDelay() {
  return 2;
}
export function gameUpdateSlice823150SfxLoop() {
  return 0;
}
export function gameUpdateSlice823150SfxPitchBits() {
  return 0x3f800000;
}
export function gameUpdateSlice823150SfxPan() {
  return 0;
}
export function gameUpdateSlice823150SfxReceiverOff() {
  return 0x2a324;
}
export function gameUpdateSlice823150SfxPlayVa() {
  return TO_823150_SFX_PLAY_VA;
}
export function gameUpdateSlice823150SfxPrepVa() {
  return TO_823150_SFX_PREP_VA;
}
export function gameUpdateSlice823150SpawnType() {
  return 0x3e8;
}
export function gameUpdateSlice823150SpawnVariant() {
  return 0xf;
}
export function gameUpdateSlice823150SpawnPosVec() {
  return 0x00c7b640;
}
export function gameUpdateSlice823150SpawnVa() {
  return TO_823150_SPAWN_VA;
}
export function gameUpdateSlice823150HostVaCtor() {
  return TO_823150_CTOR_VA;
}
export function gameUpdateSlice823150HostVaGenrand() {
  return TO_823150_GENRAND_VA;
}
export function gameUpdateSlice823150HostVa714610() {
  return TO_823150_714610_VA;
}
export function gameUpdateSlice823150VcallOff() {
  return 0x14;
}

/* ABI v116 (idx 18 type-2 arm, ABI 99 frozen): FUN_00435c70 complete
   thiscall ctor image. Independent JS oracle — do not derive from C++.
   Float stores are raw bit patterns (uint32). */
export const CTOR_435C70_VA = 0x00435c70;
export const CTOR_435C70_BYTE_LEN = 96;
export const CTOR_435C70_STRUCT_SIZE = 0x28;
export const CTOR_435C70_WORD_COUNT = 10;
export const CTOR_435C70_SRC_640_VA = 0x00c7b640;
export const CTOR_435C70_SRC_644_VA = 0x00c7b644;
export function gameUpdateSlice435c70Va() { return CTOR_435C70_VA; }
export function gameUpdateSlice435c70ByteLen() { return CTOR_435C70_BYTE_LEN; }
export function gameUpdateSlice435c70StructSize() { return CTOR_435C70_STRUCT_SIZE; }
export function gameUpdateSlice435c70WordCount() { return CTOR_435C70_WORD_COUNT; }
export function gameUpdateSlice435c70Src640Va() { return CTOR_435C70_SRC_640_VA; }
export function gameUpdateSlice435c70Src644Va() { return CTOR_435C70_SRC_644_VA; }
export function gameUpdateSlice435c70Word(index, bitsC7b640, bitsC7b644) {
  const i = index >>> 0;
  if (i >= 10) return 0;
  if (i === 4 || i === 6) return bitsC7b640 >>> 0;
  if (i === 5 || i === 7) return bitsC7b644 >>> 0;
  return 0;
}


/* Unflatten the flat capture names (names only — coordinator pins
   offsets at the wave-end merge). */
export function roomTriggerOutputWalkFromRuntime(runtimeInputs) {
  const ready = (runtimeInputs.triggerOutputWalkReady | 0) !== 0 ? 1 : 0;
  const head = {
    addr: runtimeInputs.triggerOutputWalkHeadAddr >>> 0,
    next: runtimeInputs.triggerOutputWalkHeadNext >>> 0,
    parent: runtimeInputs.triggerOutputWalkHeadParent >>> 0,
    child: runtimeInputs.triggerOutputWalkHeadChild >>> 0,
    flag: (runtimeInputs.triggerOutputWalkHeadFlag | 0) & 0xff,
  };
  const nodeCount = runtimeInputs.triggerOutputWalkNodeCount | 0;
  const nodes = [];
  for (let i = 0; i < nodeCount; i += 1) {
    nodes.push({
      addr: runtimeInputs[`triggerOutputWalkNodeAddr${i}`] >>> 0,
      next: runtimeInputs[`triggerOutputWalkNodeNext${i}`] >>> 0,
      parent: runtimeInputs[`triggerOutputWalkNodeParent${i}`] >>> 0,
      child: runtimeInputs[`triggerOutputWalkNodeChild${i}`] >>> 0,
      flag: (runtimeInputs[`triggerOutputWalkNodeFlag${i}`] | 0) & 0xff,
      f10: runtimeInputs[`triggerOutputWalkNodeF10${i}`] >>> 0,
    });
  }
  const tableCount = runtimeInputs.triggerOutputWalkTableCount | 0;
  const table = [];
  for (let i = 0; i < tableCount; i += 1) {
    table.push({
      index: runtimeInputs[`triggerOutputWalkTableIndex${i}`] >>> 0,
      value: runtimeInputs[`triggerOutputWalkTableValue${i}`] >>> 0,
    });
  }
  return { ready, head, nodes, table };
}

export function roomTriggerOutputScanFromRuntime(runtimeInputs) {
  const ready = (runtimeInputs.triggerOutputScanReady | 0) !== 0 ? 1 : 0;
  const entryCount = runtimeInputs.triggerOutputScanEntryCount | 0;
  const entries = [];
  for (let i = 0; i < entryCount; i += 1) {
    entries.push({
      f28: runtimeInputs[`triggerOutputScanEntF28${i}`] >>> 0,
      f2c: runtimeInputs[`triggerOutputScanEntF2c${i}`] >>> 0,
      f450: runtimeInputs[`triggerOutputScanEntF450${i}`] >>> 0,
    });
  }
  return { ready, entries };
}

/* Flatten helpers for tests (mirror flattenGlobalTree4aba0NodesRuntime). */
export function flattenRoomTriggerOutputWalkRuntime({ head, nodes, table }) {
  const flat = {};
  flat.triggerOutputWalkHeadAddr = head.addr >>> 0;
  flat.triggerOutputWalkHeadNext = head.next >>> 0;
  flat.triggerOutputWalkHeadParent = head.parent >>> 0;
  flat.triggerOutputWalkHeadChild = head.child >>> 0;
  flat.triggerOutputWalkHeadFlag = (head.flag | 0) & 0xff;
  flat.triggerOutputWalkNodeCount = nodes.length | 0;
  for (let i = 0; i < nodes.length; i += 1) {
    const n = nodes[i];
    flat[`triggerOutputWalkNodeAddr${i}`] = n.addr >>> 0;
    flat[`triggerOutputWalkNodeNext${i}`] = n.next >>> 0;
    flat[`triggerOutputWalkNodeParent${i}`] = n.parent >>> 0;
    flat[`triggerOutputWalkNodeChild${i}`] = n.child >>> 0;
    flat[`triggerOutputWalkNodeFlag${i}`] = (n.flag | 0) & 0xff;
    flat[`triggerOutputWalkNodeF10${i}`] = n.f10 >>> 0;
  }
  flat.triggerOutputWalkTableCount = table.length | 0;
  for (let i = 0; i < table.length; i += 1) {
    const t = table[i];
    flat[`triggerOutputWalkTableIndex${i}`] = t.index >>> 0;
    flat[`triggerOutputWalkTableValue${i}`] = t.value >>> 0;
  }
  return flat;
}

export function flattenRoomTriggerOutputScanRuntime(entries) {
  const flat = {};
  flat.triggerOutputScanReady = 1;
  flat.triggerOutputScanEntryCount = entries.length | 0;
  for (let i = 0; i < entries.length; i += 1) {
    const e = entries[i];
    flat[`triggerOutputScanEntF28${i}`] = e.f28 >>> 0;
    flat[`triggerOutputScanEntF2c${i}`] = e.f2c >>> 0;
    flat[`triggerOutputScanEntF450${i}`] = e.f450 >>> 0;
  }
  return flat;
}

/* Record idx 42 TailPath consumers use the room-family residual/action
   constants (imported above); re-export for the slice test's named imports. */
export {
  ROOM_B19_RESIDUAL_NONE,
  ROOM_B19_RESIDUAL_HOST_REBUILD,
  ROOM_B19_RESIDUAL_MONOLITHIC,
  ROOM_B20_RESIDUAL_NONE,
  ROOM_B20_RESIDUAL_HOST_TRAIL,
  ROOM_B20_RESIDUAL_MONOLITHIC,
  ROOM_B20_ACTION_FLAGGED,
  ROOM_B20_ACTION_PAIR_X,
  ROOM_B20_ACTION_PAIR_Y,
  ROOM_B20_ACTION_DEFAULT,
} from "./room-pure-model.mjs";

/* ================= ABI v95: water-b16 FUN_00823540 chain (record idx 36) =
   PE-truth transcribed from cpu-dump/00823540.txt + 00823370.txt +
   007067c0.txt + 0074efd0.txt + 00748490.txt (hash-bound exe):
   FUN_00823540 (0x00823540..0x00823585): alloca out[6];
   FUN_00823370(this=Room, out) -> vector; flag = ([Game+0x183a0] byte==0
   && [Game+0x269e9] byte==0); FUN_007067c0(out, flag) — writes the
   Game+0x676xx spray state. Called at 0x805373 exactly when
   needs823540(water_post, lava_pre) (comiss jbe 0x805378).
   FUN_00823370: copy Room+0x1b10/14/18/1c/24/28 (SKIPS +0x1b20);
   lerp gate: type 7/8/0x1d -> lerp ALWAYS, else gate74efd0(Game) &&
   [Game+0x1830c]==1; lerp = v + (target-v)*0.75, target=[1,1,1,0,0,1];
   (grid_flags>>9)&1 -> v[4]+=0.03; room_1d18==0x20 && (grid_flags>>5)&1
   -> lava displacement: vel = (f32(int32 cell_54)/(f32((w-2)*(h-2))))*lava;
   v[0]-=vel; v[1]+=vel*0.4; v[2]+=vel*0.4; v[3]-=vel*0.45; v[5]+=vel*0.2.
   FUN_0074efd0: difficulty 2/3 -> 0; type in [1..6] && flags2654c bit16 ->
   0; subtype {4,5} required; type==4 -> 1; type==3 -> (acc & ~clear & 2)!=0;
   else 0. acc = 0x6f9400()|[Game+0xc]|[Game+0x26550] (host-composed),
   clear = 0x6f95a0() (host) — the 0x4288a0 challenge-store lookups stay
   TYPED-HOST (same contract as gameUpdateSlice746260IndexMatches).
   FUN_007067c0: step[0..5] = vector (Game+0x676d0..676e4); flag==0 ->
   cur_snap[0..3] = vector[0..3] (Game+0x676b8 16B), gate byte 0x676b4 NOT
   written; flag!=0 -> gate=1, goal[i] = |step[i]-cur[i]| * 0.015.
   Mutation legend (each flipped line fails the v95 B16 group, then
   restored sha256-byte-identical — NOTES.md update-v95-823540-water-grid):
   - gate74efd0 type range (type-1)<=5 -> <=4: T1 dies (type 6 + bit16)
   - lerp target 1.0 -> 0.0 on idx 0: T2 dies (exact f32 bits)
   - spray factor 0.015 -> 0.15: T3 dies (goal bits)
   - byte gates &0xff -> full-dword: T4 dies (WIDE 0x100 must open) */
export function gameUpdateSliceB16Gate74efd0(difficulty269c8, gameType0, gameSubtype4, flags2654c, unlockAcc, unlockClear) {
  /* PE 0x74efd0..0x74f02e (arg = Game): cmp [Game+0x269c8],2/3 -> 0;
     lea [type-1] / cmp 5 / ja -> type in [1..6] UNSIGNED gate on bit16
     of flags2654c; subtype==4||5; type==4 -> 1; type==3 -> call
     0x748490 (acc & ~clear & 2); else 0. */
  if ((difficulty269c8 | 0) === 2 || (difficulty269c8 | 0) === 3) return 0;
  const type = (gameType0 | 0) >>> 0;
  if (((type - 1) >>> 0) <= 5 && (((flags2654c | 0) >>> 0) & 0x10000) !== 0) return 0;
  const subtype = (gameSubtype4 | 0) >>> 0;
  if (subtype !== 4 && subtype !== 5) return 0;
  if (type === 4) return 1;
  if (type !== 3) return 0;
  return ((((unlockAcc | 0) >>> 0) & ~((unlockClear | 0) >>> 0) & 2) !== 0) ? 1 : 0;
}

/* Exact IEEE f32 division (divss) for JS: Math.fround(a/b) double-rounds
   the 53-bit quotient and can be one ULP off (differential case 971:
   waterB16Goal4). Compute the 24-bit-rounded quotient from the exact
   mantissa ratio with BigInt. Handles zero/inf/nan per IEEE (b==0 -> the
   divss sign rules; the model only feeds nonzero denoms on the PE lava
   path, so the edges stay minimal). */
function b16F32DivExact(a, b) {
  const fa = Math.fround(a);
  const fb = Math.fround(b);
  if (fb === 0.0 || !Number.isFinite(fa) || !Number.isFinite(fb)) {
    return fa / fb; /* +-inf / NaN edges propagate like divss */
  }
  const parts = (x) => {
    const dv = new DataView(new ArrayBuffer(4));
    dv.setFloat32(0, x, true);
    const u = dv.getUint32(0, true);
    return { sign: u >>> 31, exp: (u >>> 23) & 0xff, mant: (u & 0x7fffff) | 0x800000 };
  };
  const pa = parts(fa);
  const pb = parts(fb);
  if (pa.exp === 0 || pb.exp === 0) {
    return Math.fround(fa / fb); /* denormal edges: b16 inputs are >= 1 */
  }
  /* t = mant_a / mant_b in [0.5, 2). q = t * 2^(e1-e2). Build the
     24-bit mantissa r = round(t * 2^23) with ties-to-even over 50 bits
     of quotient (27 dropped). */
  const shifted = (BigInt(pa.mant) << 50n) / BigInt(pb.mant);
  const rem = (BigInt(pa.mant) << 50n) % BigInt(pb.mant);
  let r = shifted >> 26n; /* round at the t*2^24 scale (the mantissa is
                             normalized AFTER; t < 1 shifts it up) */
  const guard = (shifted >> 25n) & 1n;
  let sticky = shifted & ((1n << 25n) - 1n);
  if (rem !== 0n) sticky |= 1n; /* the floor remainder is true sticky */
  if (guard !== 0n && (sticky !== 0n || (r & 1n) === 1n)) {
    r += 1n; /* round-half-to-even on guard + sticky */
  }
  let field = pa.exp - pb.exp + 126; /* r is t*2^24 (one over the 2^23 mantissa scale); 127-1 */
  if (r >= (1n << 24n)) { r >>= 1n; field += 1; }        /* t rounded up to 2.0 */
  while (r < (1n << 23n)) { r <<= 1n; field -= 1; }      /* t < 1 */
  if (field <= 0) return 0.0;
  if (field >= 255) return pa.sign === pb.sign ? Infinity : -Infinity;
  const dv = new DataView(new ArrayBuffer(4));
  dv.setUint32(0, (((pa.sign ^ pb.sign) << 31) | ((field & 0xff) << 23) | (Number(r) & 0x7fffff)) >>> 0, true);
  return dv.getFloat32(0, true);
}

export function gameUpdateSliceB16WaterWire(input = {}) {
  const f = (x) => Math.fround(Number(x));
  const src = (Array.isArray(input.src1b10) ? input.src1b10 : []);
  const v = [0, 1, 2, 3, 4, 5].map((i) => f(src[i] ?? 0));
  const roomType = (input.roomType8 | 0) >>> 0;
  let lerp = 0;
  if (roomType === 7 || roomType === 8 || roomType === 0x1d) {
    lerp = 1;
  } else if (gameUpdateSliceB16Gate74efd0(
    input.difficulty269c8 | 0, input.gameType0 | 0, input.gameSubtype4 | 0,
    input.flags2654c | 0, input.unlockAcc | 0, input.unlockClear | 0) !== 0 &&
    ((input.game1830c | 0) >>> 0) === 1) {
    lerp = 1;
  }
  if (lerp) {
    /* v + (target - v) * 0.75; target = [1,1,1,0,0,1] (subss/mulss/addss). */
    v[0] = f(v[0] + f(f(1.0 - v[0]) * 0.75));
    v[4] = f(v[4] + f(f(0.0 - v[4]) * 0.75));
    v[1] = f(v[1] + f(f(1.0 - v[1]) * 0.75));
    v[2] = f(v[2] + f(f(1.0 - v[2]) * 0.75));
    v[5] = f(v[5] + f(f(1.0 - v[5]) * 0.75));
    v[3] = f(v[3] + f(f(0.0 - v[3]) * 0.75));
  }
  const gridFlags = (input.gridFlags44 | 0) >>> 0;
  if (((gridFlags >>> 9) & 1) !== 0) v[4] = f(v[4] + 0.03);
  if (((input.room1d18 | 0) >>> 0) === 0x20 && ((gridFlags >>> 5) & 1) !== 0) {
    const w = ((input.gridWc | 0) - 2) | 0;
    const h = ((input.gridH10 | 0) - 2) | 0;
    const cells = (w * h) | 0; /* imul 32-bit wrap */
    const denom = f(cells);    /* cvtdq2ps */
    const cell = f(input.cellDword54 | 0); /* cvtdq2ps int32 */
    const lava = f(input.lavaPre);
    const vel = f(b16F32DivExact(cell, denom) * lava); /* divss + mulss (exact f32 division; JS double-div rounds 1 ULP off — case 971) */
    v[0] = f(v[0] - vel);
    v[1] = f(v[1] + f(vel * 0.4));
    v[2] = f(v[2] + f(vel * 0.4));
    v[3] = f(v[3] - f(vel * 0.45));
    v[5] = f(v[5] + f(vel * 0.2));
  }
  const step = v.map(f);
  const flag = (((input.gameByte183a0 | 0) & 0xff) === 0 && ((input.gameByte269e9 | 0) & 0xff) === 0) ? 1 : 0;
  const gate = flag;
  let goal = [0, 0, 0, 0, 0, 0];
  let curSnap = [0, 0, 0, 0];
  if (flag === 0) {
    curSnap = [v[0], v[1], v[2], v[3]];
  } else {
    const cur = (Array.isArray(input.fxCur) ? input.fxCur : []).map(f);
    for (let i = 0; i < 6; i += 1) {
      const d = f(step[i] - f(cur[i] ?? 0));
      const absBits = (bitsFromF32(d) & 0x7fffffff) >>> 0;
      goal[i] = f(f32FromBits(absBits) * Math.fround(0.015)); /* the PE multiplies by the f32 0.015f; a raw double 0.015 shifts the product 1 ULP (case 971) */
    }
  }
  return { gate, step, goal, curSnap };
}
