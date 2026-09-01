import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as PM from "../scripts/decomp/player-manager-update-pure-model.mjs";

const {
  PM_UPDATE_PURE_ABI_VERSION,
  PM_INTENSITY_OFF_FLAGS_168,
  PM_INTENSITY_OFF_DEAD_173,
  PM_INTENSITY_OFF_RAW_1EA8,
  PM_INTENSITY_FLAG_BIT_40,
  PM_INTENSITY_PLAYER_MAX,
  PM_DEATH_OFF_ANIM_7C,
  PM_DEATH_OFF_ANIM_8C,
  PM_DEATH_OFF_DEAD_173,
  PM_DEATH_OFF_TWIN_1E68,
  PM_DEATH_PLAYER_MAX,
  PM_INTENSITY_F32_SCALE_20_BITS,
  PM_INTENSITY_F32_ONE_BITS,
  PM_INTENSITY_F32_THRESHOLD_BITS,
  PM_INTENSITY_SFX_ID,
  PM_INTENSITY_PLAY_FRAME_DELAY,
  PM_INTENSITY_PLAY_LOOP,
  PM_INTENSITY_PLAY_PITCH_BITS,
  PM_INTENSITY_PLAY_PAN_BITS,
  PM_INTENSITY_HOST_VA_IS_PLAYING,
  PM_INTENSITY_HOST_VA_SET_VOLUME,
  PM_INTENSITY_HOST_VA_SET_PITCH,
  PM_INTENSITY_HOST_VA_PRE_PLAY,
  PM_INTENSITY_HOST_VA_PLAY,
  PM_INTENSITY_HOST_VA_STOP,
  PM_DEATH_HOST_VA_TRIGGER_DEATH,
  PM_DEATH_HOST_VA_EMPTY_FATAL,
  PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
  PM_INTENSITY_SFX_RESIDUAL_NONE,
  PM_INTENSITY_SFX_RESIDUAL_UPDATE,
  PM_INTENSITY_SFX_RESIDUAL_PLAY,
  PM_INTENSITY_SFX_RESIDUAL_STOP,
  PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC,
  PM_DEATH_RESIDUAL_NONE,
  PM_DEATH_RESIDUAL_WALK,
  PM_DEATH_RESIDUAL_MONOLITHIC,
  PM_PLAYER_VECTOR_BEGIN_OFF,
  PM_PLAYER_VECTOR_END_OFF,
  PM_PLAYER_PTR_SHIFT,
  PM_WALK_EMPTY_FATAL_LEVEL,
  PM_WALK_EMPTY_FATAL_STR_VA,
  PM_SFX_ENTRY_STRIDE,
  PM_SFX_ENTRY_OFF_VOICE_COUNT_190,
  PM_SFX_ENTRY_OFF_VOLUME_194,
  PM_SFX_ENTRY_OFF_ENABLED_198,
  PM_SFX_ENTRY_VOICE_STRIDE,
  PM_SFX_ENTRY_DIV_MAGIC,
  PM_SFX_WARN_LOG_VA,
  PM_SFX_WARN_LOG_LEVEL,
  PM_SFX_WARN_LOG_STR_VA,
  PM_SFX_MANAGER_GLOBAL_VA,
  PM_SFX_MANAGER_OFF,
  PM_SFX_GATE_MISS,
  PM_SFX_GATE_NO_SAMPLES,
  PM_SFX_GATE_DISABLED,
  PM_SFX_GATE_LIVE,
  PM_PRE_PLAY_ID_DEFAULT,
  PM_PRE_PLAY_ID_FOUND,
  PM_PRE_PLAY_ID_RARE,
  PM_PRE_PLAY_RARE_MODULUS,
  PM_PRE_PLAY_MAP_OFF,
  PM_PRE_PLAY_MAP_KEY,
  PM_PRE_PLAY_GAME_GLOBAL_VA,
  PM_PRE_PLAY_RNG_SEED_VA,
  PM_PRE_PLAY_RNG_SHIFT1_VA,
  PM_PRE_PLAY_RNG_SHIFT2_VA,
  PM_PRE_PLAY_RNG_SHIFT3_VA,
  PM_PRE_PLAY_RNG_SEED_DEFAULT,
  PM_PRE_PLAY_RNG_SHIFT1_DEFAULT,
  PM_PRE_PLAY_RNG_SHIFT2_DEFAULT,
  PM_PRE_PLAY_RNG_SHIFT3_DEFAULT,
  PM_PRE_PLAY_HOST_VA_MAP_LOOKUP,
  PM_PRE_PLAY_HOST_VA_SEED_ZERO_FATAL,
  PM_PRE_PLAY_SEED_ZERO_FATAL_LEVEL,
  PM_PRE_PLAY_SEED_ZERO_STR_VA,
  PM_TD_OFF_STATE_2C,
  PM_TD_OFF_DEAD_171,
  PM_TD_OFF_TWIN_1E68,
  PM_TD_OFF_ORDER_161C,
  PM_TD_OFF_CHAR_TYPE_13C0,
  PM_TD_OFF_LIST_SKIP_1519,
  PM_TD_OFF_LIST_BEGIN_150C,
  PM_TD_OFF_LIST_END_1510,
  PM_TD_LIST_ELEM_STRIDE,
  PM_TD_LIST_MATCH_TAG,
  PM_TD_LIST_MATCH_ID,
  PM_TD_OFF_POCKET_BASE_17A0,
  PM_TD_POCKET_STRIDE,
  PM_TD_POCKET_SLOTS,
  PM_TD_POCKET_CLAMP_MAX,
  PM_TD_POCKET_MATCH_TYPE,
  PM_TD_POCKET_MATCH_ID,
  PM_TD_POCKET_LAST_ID_OFF,
  PM_TD_POCKET_LAST_TYPE_OFF,
  PM_TD_POCKET_LAST_ID_VALUE,
  PM_TD_POCKET_LAST_TYPE_VALUE,
  PM_TD_COMPACT_DWORD_MASK,
  PM_TD_VEC_BEGIN_VA,
  PM_TD_VEC_END_VA,
  PM_TD_VEC_CAP_VA,
  PM_TD_GUARD_VA,
  PM_TD_TEB_TLS_PTR_OFF,
  PM_TD_TLS_EPOCH_OFF,
  PM_TD_DTOR_THUNK_VA,
  PM_TD_HOST_VA_SELF,
  PM_TD_HOST_VA_PRE_REMOVE,
  PM_TD_HOST_VA_PLAYER_REMOVE,
  PM_TD_HOST_VA_VECTOR_GROW,
  PM_TD_HOST_VA_INIT_HEADER,
  PM_TD_HOST_VA_INIT_FOOTER,
  PM_TD_HOST_VA_DTOR_REGISTER,
  PM_TD_HOST_VA_REVIVE,
  PM_TD_HOST_VA_TRY_PREVENT_DEATH,
  PM_TD_RET_FALSE_VA_EARLY,
  PM_TD_RET_FALSE_VA,
  PM_TD_RET_TRUE_VA,
  PM_TD_EARLY_NONE,
  PM_TD_EARLY_CHECK_ONLY,
  PM_TD_EARLY_REMOVE,
  PM_TD_HOST_VA_PROBE_A,
  PM_TD_HOST_VA_PROBE_B,
  PM_TD_HOST_VA_HAS_COLLECTIBLE,
  PM_TD_HOST_VA_COLLECTIBLE_COUNT,
  PM_TD_HOST_VA_COLLECTIBLE_RNG,
  PM_TD_OFF_PENDING_2EF8,
  PM_TD_OFF_PENDING_FLAG_2EF0,
  PM_TD_PROBE_B_PATH_IMMEDIATE,
  PM_TD_PROBE_B_PATH_COUNT_GT1,
  PM_TD_PROBE_B_PATH_COUNT_GT0,
  PM_TD_CASCADE_STAGES,
  PM_TD_PROBE_KIND_NONE,
  PM_TD_PROBE_KIND_A,
  PM_TD_PROBE_KIND_B,
  PM_TD_GUARD_NONE,
  PM_TD_GUARD_CHAR_TYPE,
  PM_TD_GUARD_RNG_BIT,
  PM_TD_GUARD_STAGE17,
  PM_TD_CASCADE_CHAR_TYPE_MATCH,
  PM_TD_STAGE17_PATH_X,
  PM_TD_STAGE17_PATH_Y,
  PM_TD_STAGE17_RESULT_HOST,
  PM_TD_STAGE17_RESULT_TRUE,
  PM_TD_STAGE17_RESULT_FALSE,
  PM_TD_STAGE17_ACCEPT_VALUE,
  PM_TD_STAGE17_MGR_8_MATCH,
  PM_TD_CASCADE_TABLE,
  PM_TD_RVH_HOST_VA,
  PM_TD_RVH_OFF_ORDER_161C,
  PM_TD_RVH_ID_HIGH_BOUND,
  PM_TD_RVH_TABLE_BIAS,
  PM_TD_RVH_TABLE_LIMIT,
  PM_TD_RVH_BYTE_TABLE_VA,
  PM_TD_RVH_JUMP_TABLE_VA,
  PM_TD_RVH_VA_HIGH,
  PM_TD_RVH_VA_EQ137,
  PM_TD_RVH_VA_DEFAULT,
  PM_TD_RVH_CHAIN_FIELD8_MATCH,
  PM_TD_RVH_CHAIN_FIELD0_MATCH,
  PM_TD_RVH_REGION_TABLE,
  PM_TD_RVH_REGION_EQ137,
  PM_TD_RVH_REGION_HIGH,
  PM_TD_RVH_REGION_DEFAULT,
  PM_TD_RVH_TABLE_ENTRIES,
  PM_TD_RVH_JUMP_TABLE_CASES,
  PM_TD_RVH_TABLE_CASE_DEFAULT,
  PM_TD_RVH_TABLE_SPECIAL,
  PM_TD_RVH_CASE_VA,
  PM_TD_RVH_HIGH_SPECIAL,
  PM_TD_HEART_VA_PROBE,
  PM_TD_HEART_PROBE_ARG_ID,
  PM_TD_HEART_PROBE_ARG_FLAG,
  PM_TD_HEART_GAME_18300_OFF,
  PM_TD_HEART_ACCEPT,
  PM_TD_HEART_VA_UNLOCK,
  PM_TD_HEART_UNLOCK_ACH,
  PM_TD_HEART_MANAGER_GLOBAL_VA,
  PM_TD_HEART_PGD_OFF,
  PM_TD_TAIL_CHAR_MATCH,
  PM_TD_TAIL_ID,
  PM_TD_TAIL_VA_HAS_COLLECTIBLE,
  PM_TD_TAIL_VA_REVIVE_CAST,
  PM_TD_TAIL_VA_RVH,
  PM_TD_TAIL_VA_SHARED,
  PM_TD_VEC_OFF_REC1_BEGIN_1770,
  PM_TD_VEC_OFF_REC1_END_1774,
  PM_TD_VEC_OFF_REC2_BEGIN_177C,
  PM_TD_VEC_OFF_REC2_END_1780,
  PM_TD_VEC_RNG_SEED_OFF,
  PM_TD_VEC_RNG_S1_OFF,
  PM_TD_VEC_RNG_S2_OFF,
  PM_TD_VEC_RNG_S3_OFF,
  PM_TD_VEC_REC1_LIMIT_ENTRIES,
  PM_TD_VEC_REC2_LIMIT_ENTRIES,
  PM_TD_VEC_REC1_LIMIT_BYTES,
  PM_TD_VEC_REC2_LIMIT_BYTES,
  PM_TD_VEC_WARN_REC1_STR_VA,
  PM_TD_VEC_WARN_REC2_STR_VA,
  PM_TD_VEC_WARN_LEVEL,
  PM_TD_VEC_SEED_ZERO_STR_VA,
  PM_TD_VEC_VA_RANDOM_INT,
  PM_TD_VEC_RANDOM_INT_MAX,
  PM_TD_VEC_VA_AFTER_DEATH_A,
  PM_TD_VEC_VA_AFTER_DEATH_B,
  PM_TD_VEC_VIRTUAL_SLOT_60,
  PM_TD_CHAR_PATH_0,
  PM_TD_CHAR_PATH_1,
  PM_TD_CHAR_PATH_2,
  PM_TD_CHAR_SFX_ID_DEFAULT,
  PM_TD_CHAR_SFX_ID_PATH01,
  PM_TD_CHAR_SFX_ID_ALT,
  PM_TD_SEQ_NOT_DEAD,
  PM_TD_SEQ_REMOVE,
  PM_TD_SEQ_ALT,
  PM_TD_SEQ_FULL,
  PM_TD_SEQ_OFF_FATAL_3BC,
  PM_TD_SEQ_OFF_FATAL_STATE_28,
  PM_TD_SEQ_EFFECT_ID_29B,
  PM_TD_SEQ_VA_HAS_EFFECT,
  PM_TD_SEQ_VA_REMOVE,
  PM_TD_SEQ_OFF_171,
  PM_TD_GHOST_OFF_FLAG_20A9,
  PM_TD_GHOST_VA_IS_COOP,
  PM_TD_GHOST_VA_COOP_COUNT,
  PM_TD_GHOST_VA_MORPH,
  PM_TD_RESET_OFF_1340,
  PM_TD_RESET_OFF_1344,
  PM_TD_RESET_OFF_134C,
  PM_TD_RESET_OFF_1348,
  PM_TD_RESET_OFF_1350,
  PM_TD_RESET_OFF_1D88,
  PM_TD_RESET_OFF_1D8C,
  PM_TD_RESET_OFF_1DA4,
  PM_TD_RESET_VA_GET_HEALTH_TYPE,
  PM_TD_RESET_VA_ADD_BONE_HEARTS,
  PM_TD_RESET_BONE_HEARTS_ARG,
  PM_TD_RESET_CHAR_MATCH,
  PM_TD_RESET_BRANCH_GT0_HT1_NE3,
  PM_TD_RESET_BRANCH_GT0_HT1_EQ3,
  PM_TD_RESET_BRANCH_LE0_HT1_EQ4,
  PM_TD_RESET_BRANCH_LE0_HT2_EQ3,
  PM_TD_RESET_BRANCH_CHAR_12,
  PM_TD_RESET_BRANCH_ELSE,
  pmDeathDualZeroGate,
  pmDeathAnimIdle,
  pmDeathPlayerEligible,
  pmDeathPlayerEligiblePack,
  pmDeathEligibleCount,
  pmDeathEligibleMask,
  pmDeathWalkPureComplete,
  pmDeathPlanFromPlayers,
  pmDeathWireDecide,
  pmDeathTriggerVa,
  pmDeathTriggerArg,
  pmIntensityPlayerEligible,
  pmIntensityClampRaw,
  pmIntensityPlayerContrib,
  pmIntensityMaxOverPlayers,
  pmIntensityMaxOverArrays,
  pmIntensitySfxStartNeeded,
  pmIntensitySfxStopCandidate,
  pmIntensityPlanFromPlayers,
  pmIntensityPlanFromArrays,
  pmIntensitySfxResidualKind,
  pmIntensityHeartbeatPureComplete,
  pmIntensityHeartbeatPlan,
  pmIntensityWireDecide,
  pmIntensitySfxId,
  pmIntensityPlayFrameDelay,
  pmIntensityPlayLoop,
  pmIntensityPlayPitch,
  pmIntensityPlayPan,
  pmPlayerCountFromSpan,
  pmPlayerIndexSelect,
  pmWalkEnter,
  pmWalkNeedsEmptyFatal,
  pmWalkContinue,
  pmSfxEntryCountFromSpan,
  pmSfxEntryByteOffset,
  pmSfxEntryIndexInRange,
  pmSfxEntryGate,
  pmSfxIsPlayingKnown,
  pmSfxIsPlayingPureResult,
  pmSfxMutatorPureComplete,
  pmSfxManagerReceiver,
  pmSfxEntryGatePlan,
  pmPrePlayRngNext,
  pmPrePlayRareHit,
  pmPrePlayPlan,
  pmPrePlaySoundId,
  pmIntensityPlayId,
  pmTdEarlyKind,
  pmTdEarlyPureComplete,
  pmTdEarlyReturnsFalse,
  pmTdStaticGuardSlow,
  pmTdStaticGuardRunsInit,
  pmTdStaticGuardGameEffect,
  pmTdTwinFirst,
  pmTdOrderPlan,
  pmTdPushNeedsGrow,
  pmTdPocketSlotClamp,
  pmTdPocketSlotOffset,
  pmTdPocketMatch,
  pmTdPocketFind,
  pmTdPocketCompactDwords,
  pmTdPocketCompact,
  pmTdListScanSkipped,
  pmTdListElemMatch,
  pmTdListWalkTerminates,
  pmTdListWalkSteps,
  pmTdProbeAPlayerMatch,
  pmTdProbeAScan,
  pmTdProbeBPath,
  pmTdProbeBNeedsCountProbe,
  pmTdProbeBPlayerMatch,
  pmTdProbeBScan,
  pmTdCascadeStageCount,
  pmTdCascadeStageId,
  pmTdCascadeProbeKind,
  pmTdCascadeGuardKind,
  pmTdCascadeStageVa,
  pmTdCascadeFirstMatch,
  pmTdStageD4Guard,
  pmTdStage1cValue,
  pmTdStage1cSecondProbeNeeded,
  pmTdStage17Path,
  pmTdStage17Result,
  pmTdCascadeCheckOnlyReturnsTrue,
  pmTdRvhReviveCalled,
  pmTdRvhChainFlag,
  pmTdRvhRegion,
  pmTdRvhTableIndex,
  pmTdRvhRegionVa,
  pmTdRvhTableCase,
  pmTdRvhDispatchVa,
  pmTdRvhIsDefault,
  pmTdHeartGate,
  pmTdTailHold,
  pmTdTailCheckOnlyResult,
  pmTdTailHostReviveNeeded,
  pmTdCheckOnlyTermination,
  pmTdVecSpanAligned,
  pmTdVecWarnNeeded,
  pmTdVecSlotIndex,
  pmTdVecSlotOffset,
  pmTdRngRecordNext,
  pmTdRngSeedZero,
  pmTdRngSeedStillZero,
  pmTdCharDeathPath,
  pmTdDeathSeqKind,
  pmTdGhostMorphGate,
  pmTdResetReviveNeeded,
  pmTdResetHealthBranch,
  pmTdResetBoneHearts,
  pmTdResetProbeCount,
  PM_TD_RVB_ARM_SKIP,
  PM_TD_RVB_ARM_FATAL,
  PM_TD_RVB_ARM_CHAIN_SKIP,
  PM_TD_RVB_ARM_NOTIFY,
  PM_TD_RVB_BODY_CASE0,
  PM_TD_RVB_BODY_CASE1,
  PM_TD_RVB_BODY_CASE2,
  PM_TD_RVB_BODY_CASE3,
  PM_TD_RVB_BODY_EQ137,
  PM_TD_RVB_BODY_HIGH0,
  PM_TD_RVB_BODY_HIGH1,
  PM_TD_RVB_BODY_HIGH2,
  PM_TD_RVB_BODY_DEFAULT,
  PM_TD_RVB_STAGE_CASE0,
  PM_TD_RVB_STAGE_CASE1,
  PM_TD_RVB_STAGE_CASE2,
  PM_TD_RVB_STAGE_CASE3,
  PM_TD_RVB_STAGE_EQ137,
  PM_TD_RVB_CASE0_BRANCH_HT1,
  PM_TD_RVB_CASE0_BRANCH_HT4,
  PM_TD_RVB_CASE0_BRANCH_KEEP,
  PM_TD_RVB_CASE0_BRANCH_HT3,
  PM_TD_RVB_CASE0_BRANCH_CHAR12,
  PM_TD_RVB_CASE0_BRANCH_ELSE,
  PM_TD_RVB_CASE1_BRANCH_HT1,
  PM_TD_RVB_CASE1_BRANCH_HT4,
  PM_TD_RVB_CASE1_BRANCH_HT2,
  PM_TD_RVB_CASE1_BRANCH_ELSE,
  PM_TD_RVB_HIGH0_COSTUME_SKIP,
  PM_TD_RVB_HIGH0_COSTUME_NO_PRE,
  PM_TD_RVB_HIGH0_COSTUME_FULL,
  PM_TD_RVB_ZERO_MASK_CASE0,
  PM_TD_RVB_ZERO_MASK_CASE1,
  PM_TD_RVB_ZERO_MASK_CASE2,
  PM_TD_RVB_ZERO_MASK_CASE3,
  PM_TD_RVB_ZERO_MASK_EQ137,
  PM_TD_RVB_ZERO_MASK_HIGH0,
  PM_TD_RVB_ZERO_MASK_HIGH1,
  PM_TD_RVB_ZERO_MASK_HIGH2,
  PM_TD_RVB_ZERO_MASK_DEFAULT,
  PM_TD_RVB_CASE2_CONST_134C,
  PM_TD_RVB_EQ137_CONST_134C,
  PM_TD_RVB_HIGH1_CONST_134C,
  PM_TD_RVB_EQ137_CONST_1350,
  PM_TD_RVB_FATAL_TIMER_78,
  PM_TD_RVB_TIMER_5A,
  PM_TD_RVB_OFF_TIMER_13BC,
  PM_TD_RVB_OFF_TWIN_1D98,
  PM_TD_RVB_OFF_TWIN_1D9C,
  PM_TD_RVB_OFF_1574,
  PM_TD_RVB_OR_1574_MASK,
  PM_TD_RVB_NOTIFY_OFF_1831C,
  PM_TD_RVB_NOTIFY_OFF_18318,
  PM_TD_RVB_NOTIFY_OFF_18308,
  PM_TD_RVB_NOTIFY_CLAMP_MAX,
  PM_TD_RVB_CFG_OFF_B0,
  PM_TD_RVB_CFG_OFF_B4,
  PM_TD_RVB_CFG_OFF_B8,
  PM_TD_RVB_CASE2_CHAR_KEEP,
  PM_TD_RVB_CASE2_CHAR_NEW,
  PM_TD_RVB_EQ137_CHAR_KEEP,
  PM_TD_RVB_EQ137_CHAR_NEW,
  PM_TD_RVB_HIGH0_CHAR_KEEP_A,
  PM_TD_RVB_HIGH0_CHAR_KEEP_B,
  PM_TD_RVB_HIGH0_CHAR_NEW,
  PM_TD_RVB_HIGH0_CHAR_SKIP_ALL,
  PM_TD_RVB_HIGH0_CHAR_NO_PRE,
  PM_TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF,
  PM_TD_RVB_HIGH0_CFG_VEC_END_OFF,
  PM_TD_RVB_HIGH0_CFG_ELEM_OFF,
  PM_TD_RVB_HIGH0_ITEM_VEC_BEGIN_OFF,
  PM_TD_RVB_HIGH0_ITEM_VEC_END_OFF,
  PM_TD_RVB_HIGH0_ITEM_ELEM_OFF,
  PM_TD_RVB_HIGH0_EXTRA_LIVES_OFF_1E74,
  PM_TD_RVB_HIGH0_EXTRA_LIVES_VALUE,
  PM_TD_RVB_HIGH2_EFFECT_ID_2B0,
  PM_TD_RVB_SFX_1B,
  PM_TD_RVB_SFX_1C,
  PM_TD_RVB_SFX_50,
  PM_TD_RVB_SFX_10A,
  PM_TD_RVB_SFX_VOL_1_25_BITS,
  PM_TD_RVB_SFX_VOL_1_0_BITS,
  PM_TD_RVB_HIGH2_NOTIFY_ARG,
  PM_TD_RVB_HIGH1_NOTIFY_ARG,
  PM_TD_RVB_HIGH2_1EFC_BITS,
  PM_TD_RVB_HEAL_OFF_26614,
  PM_TD_RVB_HEAL_LIMIT,
  PM_TD_RVB_OFF_RED_194C,
  PM_TD_RVB_OFF_BONE_1D88,
  PM_TD_RVB_DEFAULT_LOG_LEVEL,
  PM_TD_RVB_VA_EXIT_FLOOR,
  PM_TD_RVB_VA_EXIT_NOTIFY,
  PM_TD_RVB_VA_NOTIFY_SINK,
  PM_TD_RVB_VA_ANIMATE,
  PM_TD_RVB_VA_CONFIG_BY_CHAR,
  PM_TD_RVB_VA_ADD_BLACK_HEARTS,
  PM_TD_RVB_VA_CASE0_TAIL_HOST,
  PM_TD_RVB_VA_PRE_HOST_7C3620,
  PM_TD_RVB_VA_HOST_763570,
  PM_TD_RVB_VA_HOST_7BEBB0,
  PM_TD_RVB_VA_HOST_7592A0,
  PM_TD_RVB_VA_ADD_COSTUME,
  PM_TD_RVB_VA_EFFECT_ADD_930220,
  PM_TD_RVB_VA_EFFECT_ADD_9302E0,
  PM_TD_RVB_VA_GAME_NOTIFY_703670,
  PM_TD_RVB_VA_HEAL_HOST,
  PM_TD_RVB_VA_UPDATE_RED_HEARTS,
  PM_TD_RVB_VA_GET_COLLECTIBLE,
  PM_TD_RVB_STR_PICKUP_VA,
  PM_TD_RVB_STR_SPARKLE_VA,
  PM_TD_RVB_DEFAULT_FMT_VA,
  pmTdRvbBodyFromId,
  pmTdRvbHasFlagGate,
  pmTdRvbFlagArm,
  pmTdRvbNotifyStage,
  pmTdRvbNotifyClamp,
  pmTdRvbNotifyMod4,
  pmTdRvbExitRouteVa,
  pmTdRvbTimerFloor,
  pmTdRvbHealGate,
  pmTdRvbHealCapacity,
  pmTdRvbHealApplies,
  pmTdRvbHealExcess,
  pmTdRvbCase0Branch,
  pmTdRvbCase0BoneArg,
  pmTdRvbCase0CfgProbes,
  pmTdRvbCase1Branch,
  pmTdRvbCase1Soul2,
  pmTdRvbCase1Recurse,
  pmTdRvbCase3Branch,
  pmTdRvbHigh2Branch,
  pmTdRvbCase2NewChar,
  pmTdRvbEq137NewChar,
  pmTdRvbHigh0NewChar,
  pmTdRvbHigh2CharPath,
  pmTdRvbHigh2FirstSfx,
  pmTdRvbHigh2FirstSfxVolBits,
  pmTdRvbHigh2SfxCount,
  pmTdRvbHigh0CostumeKind,
  pmTdRvbHigh0CfgInBounds,
  pmTdRvbHigh0ItemGate,
  pmTdRvbHigh0FatalUpdate,
  pmTdRvbHigh0SoulUpdate,
  pmTdRvbHigh0ExtraLivesGate,
  pmTdRvbTwinPosAdopt,
  pmTdRvbZeroMask,
  pmTdRvbConst134c,
  PM_TD_RVB_CFG_VEC_OFF,
  PM_TD_RVB_CFG_BEGIN_OFF,
  PM_TD_RVB_CFG_END_OFF,
  PM_TD_RVB_CFG_STRIDE,
  PM_TD_RVB_CFG_DIV_MAGIC,
  PM_TD_RVB_CFG_DIV_SHIFT,
  PM_TD_RVB_CFG_PROBE_0,
  PM_TD_RVB_CFG_PROBE_1,
  PM_TD_RVB_CFG_SITE_UNCHECKED,
  PM_TD_RVB_CFG_SITE_CHECKED,
  PM_TD_RVB_CFG_SITE_UNKNOWN,
  PM_TD_RVB_CFG_VA_RET_IN_RANGE,
  PM_TD_RVB_CFG_VA_RET_FALLBACK,
  PM_TD_RVB_CFG_VA_END,
  PM_TD_RVB_CFG_MANAGER_GLOBAL_VA,
  PM_TD_RVB_CFG_VA_RECEIVER_GETTER,
  PM_TD_RVB_CFG_SITE_5BE49E,
  PM_TD_RVB_CFG_SITE_65D7CE,
  PM_TD_RVB_CFG_SITE_CASE0_HT1_A,
  PM_TD_RVB_CFG_SITE_CASE0_HT1_B,
  PM_TD_RVB_CFG_SITE_CASE0_HT4,
  PM_TD_RVB_CFG_SITE_8ECB88,
  PM_TD_RVB_CFG_SITE_9A2E30,
  pmTdRvbCfgReceiver,
  pmTdRvbCfgCount,
  pmTdRvbCfgInRange,
  pmTdRvbCfgEntry,
  pmTdRvbCfgExitVa,
  pmTdRvbCase0CfgFieldOff,
  pmTdRvbCase0CfgFieldVa,
  pmTdRvbCfgSiteNullChecked,
  PM_C0T_VA_BODY,
  PM_C0T_VA_RET,
  PM_C0T_VA_NEXT_FUNC,
  PM_C0T_BODY_BYTES,
  PM_C0T_CALLSITES,
  PM_C0T_VA_CALLSITE_CASE0,
  PM_C0T_VA_REGISTRATION_PUSH,
  PM_C0T_STR_SETFULLHEARTS_VA,
  PM_C0T_WALK_CHAR,
  PM_C0T_OFF_CHAR_13C0,
  PM_C0T_OFF_FATAL_1340,
  PM_C0T_OFF_SOUL_1344,
  PM_C0T_OFF_134C,
  PM_C0T_GAME_GLOBAL_VA,
  PM_C0T_SCAN_BASE_OFF,
  PM_C0T_SCAN_STRIDE,
  PM_C0T_SCAN_SLOTS,
  PM_C0T_SCAN_BYTE_OFF,
  PM_C0T_SCAN_BYTE_VALUE,
  PM_C0T_SCAN_NO_MATCH,
  PM_C0T_SCAN_SKIPPED,
  PM_C0T_VA_GET_HEALTH_TYPE,
  PM_C0T_VA_UPDATE_BONE_HEARTS,
  PM_C0T_VA_GETTER_7CB060,
  PM_C0T_VA_GET_HEALTH_LIMIT,
  PM_EP_HT_JUMP_TABLE_VA,
  PM_EP_HT_BYTE_TABLE_VA,
  PM_EP_HT_TABLE_LEN,
  PM_EP_HT_CHAR_MIN,
  PM_EP_HT_INDEX_MAX,
  PM_EP_HT_TABLE_BYTES,
  PM_EP_HT_JUMP_RETURNS,
  pmEpGetHealthType,
  pmEpHealthTypeTableByte,
  pmC0tGetter7cb060,
  pmC0tWalkEngaged,
  pmC0tWalkContinue,
  pmC0tTwinWalk,
  pmC0tNew1344,
  pmC0tRecomputeUsesBone,
  pmC0tScanGate,
  pmC0tScanSlotVa,
  pmC0tScanFind,
  pmC0tHealGate,
  pmC0tHealCapacity,
  pmC0tHealApplies,
  pmC0tHealExcess,
  pmC0tRunPre,
  pmC0tHealPlan,
  PM_UBH_VA_BODY,
  PM_UBH_VA_RET_EARLY,
  PM_UBH_VA_RET_TAIL,
  PM_UBH_BODY_BYTES,
  PM_UBH_CALLSITES,
  PM_UBH_OFF_BITS_1D8C,
  PM_UBH_WORD_BITS,
  PM_UBH_GATE_LIMIT,
  PM_GHL_VA_BODY,
  PM_GHL_VA_RET_A0,
  PM_GHL_VA_RET_NULL78,
  PM_GHL_VA_RET_NULL79,
  PM_GHL_VA_RET_COMMON,
  PM_GHL_BODY_BYTES,
  PM_GHL_CALLSITES,
  PM_GHL_VA_REGISTRATION_PUSH,
  PM_GHL_VA_REGISTRATION_SINK,
  PM_GHL_STR_GETHEARTLIMIT_VA,
  PM_GHL_VA_HAS_NULL_EFFECT,
  PM_GHL_VA_HAS_COLLECTIBLE,
  PM_GHL_VA_GULLET,
  PM_GHL_RESULT_GATE_CLOSED,
  PM_GHL_OFF_STATE_2C,
  PM_GHL_OFF_TEMP_EFFECTS_1508,
  PM_GHL_OFF_COINS_1368,
  PM_GHL_OFF_CLAMP_1DA0,
  PM_GHL_NULL_EFFECT_78,
  PM_GHL_NULL_EFFECT_79,
  PM_GHL_CHAR_10_RESULT,
  PM_GHL_CHAR_14_RESULT,
  PM_GHL_BASE_DEFAULT,
  PM_GHL_BASE_SMALL,
  PM_GHL_CHAR1_BONUS,
  PM_GHL_KEEPER_CHAR_E,
  PM_GHL_KEEPER_CHAR_21,
  PM_GHL_KEEPER_SEL_BASE,
  PM_GHL_KEEPER_CAP,
  PM_GHL_KEEPER_26B_BONUS,
  PM_GHL_COLLECTIBLE_26B,
  PM_GHL_COLLECTIBLE_1F5,
  PM_GHL_COIN_DIV_MAGIC,
  PM_GHL_COIN_DIV_SHIFT,
  PM_GHL_COIN_DIV_MODULUS,
  PM_GHL_COIN_SPECIAL_63,
  pmUbhGate,
  pmUbhNewBone,
  pmUbhEarlyZero,
  pmUbhTotalSlots,
  pmUbhMask1d8c,
  pmUbhLoop1Runs,
  pmUbhLoop2Enters,
  pmUbhLoop1,
  pmUbhLoop2,
  pmUbhRun,
  pmGhlGateLt2,
  pmGhlBase,
  pmGhlKeeperFamily,
  pmGhlKeeperSkips,
  pmGhlKeeperSel,
  pmGhlKeeperBase,
  pmGhlCoinBonusQ,
  pmGhlClamp,
  pmGhlPlan,
  pmUbhFullPlan,
  PM_URH_VA_BODY,
  PM_URH_VA_RET,
  PM_URH_VA_END,
  PM_URH_VA_NEXT_FUNC,
  PM_URH_BODY_BYTES,
  PM_URH_CALLSITES,
  PM_URH_OFF_1DA4,
  PM_URH_OFF_ETERNAL_1348,
  PM_URH_OFF_BYTE_1824,
  PM_URH_OFF_BYTE_13B5,
  PM_URH_OFF_FLAG_1574,
  PM_URH_OR_1574_BIT,
  PM_URH_SPRITE_530_OFF,
  PM_URH_SPRITE_644_OFF,
  PM_URH_OFF_ROOM_18300,
  PM_URH_OFF_FRAME_264F8,
  PM_URH_OFF_ROOM_11F0,
  PM_URH_OFF_ROOM_COUNT_1254,
  PM_URH_OFF_ROOM_LIST_124C,
  PM_URH_ROOM_RECENT_MIN,
  PM_URH_ENT_OFF_TYPE_28,
  PM_URH_ENT_OFF_VARIANT_2C,
  PM_URH_ENT_OFF_SUBTYPE_30,
  PM_URH_ENT_OFF_PARENT_410,
  PM_URH_ENT_OFF_DEAD_173,
  PM_URH_ENT_TYPE_3,
  PM_URH_ENT_VARIANT_EE,
  PM_URH_ENT_SUBTYPE_SKIP_7,
  PM_URH_OFF_OVERLAY_1C034,
  PM_URH_SHOW_OVERLAY_ID,
  PM_URH_SHOW_DELAY,
  PM_URH_SHOW_PLAYER_NULL,
  PM_URH_ITEMVEC_BEGIN_OFF,
  PM_URH_ITEMVEC_END_OFF,
  PM_URH_ITEMVEC_SPAN_MIN,
  PM_URH_ITEMVEC_ELEM_OFF,
  PM_URH_ELEM_FIELD_78,
  PM_URH_ID_NULL_6E,
  PM_URH_ID_26B,
  PM_URH_ID_7A,
  PM_URH_ID_19F,
  PM_URH_ID_1BA,
  PM_URH_ID_1ED,
  PM_URH_CHAR_1A,
  PM_URH_CHAR_5,
  PM_URH_THR_LOW,
  PM_URH_THR_HIGH,
  PM_URH_THR2_LOW,
  PM_URH_F32_08_BITS,
  PM_URH_F32_01_BITS,
  PM_URH_F32_03_BITS,
  PM_URH_VA_GULLET_7CE420,
  PM_URH_VA_OVERLAY_SHOW,
  PM_URH_VA_HAS_NULL_EFFECT,
  PM_URH_VA_HAS_EFFECT,
  PM_URH_VA_REMOVE_EFFECT,
  PM_URH_VA_ANM2_PLAY,
  PM_URH_VA_EFFECT_ADD_930220,
  PM_URH_VA_EFFECT_ADD_9302E0,
  PM_URH_VA_HAS_COLLECTIBLE,
  PM_URH_VA_PROBE_6DACD0,
  PM_URH_VA_HOST_763570,
  PM_URH_STR_FLOATGLOW_VA,
  PM_URH_STR_FLOATNOGLOW_VA,
  PM_URH_F32_08_VA,
  PM_URH_F32_01_VA,
  PM_URH_F32_03_VA,
  pmUrhFoldGate,
  pmUrhFoldHalf,
  pmUrhFold1da4,
  pmUrhFoldRed,
  pmUrhFgGate,
  pmUrhFgSum,
  pmUrhFgSumIsOne,
  pmUrhRoomGate,
  pmUrhScanEntityMatch,
  pmUrhScanCount,
  pmUrhItemvecSpan,
  pmUrhItemvecGate,
  pmUrhWThr0,
  pmUrhWThr2,
  pmUrhRatio,
  pmUrhRatioBits,
  pmUrhCHigh,
  pmUrhDAddBand,
  pmUrhProbe6dacd0,
  pmUrhPlan,
  pmUrhApplyModel,
  PM_WALK_VA_LOOP_TOP,
  PM_WALK_VA_FATAL_RELOAD,
  PM_WALK_VA_SELECTOR,
  PM_WALK_VA_TRIGGER_RELOAD,
  PM_WALK_VA_LOOP_BACK,
  PM_WALK_GAME_GLOBAL_VA,
  PM_WALK_PLAN_BYTES,
  PM_WALK_TICK_PLAN_BYTES,
  PM_TD_VA_MAIN,
  PM_TD_VA_REMOVE,
  PM_TD_VA_NOOP,
  PM_CHAIN_VA_STOP_PROBE,
  PM_CHAIN_VA_STOP_TEST,
  PM_CHAIN_VA_STOP_CALL,
  PM_CHAIN_VA_UPDATE_PROBE,
  PM_CHAIN_VA_UPDATE_TEST,
  PM_CHAIN_VA_SET_VOLUME,
  PM_CHAIN_VA_SET_PITCH,
  PM_CHAIN_VA_PLAY_RELOAD,
  PM_CHAIN_VA_PRE_PLAY,
  PM_CHAIN_VA_PLAY,
  PM_CHAIN_PLAN_BYTES,
  pmWalkCountReloaded,
  pmWalkTopFatal,
  pmWalkElemCursor,
  pmWalkBackContinues,
  pmWalkIterPlan,
  pmChainPlaying,
  pmChainReceiverReloaded,
  pmChainReceiver,
  pmPrePlayChainPlan,
  pmTdRemoveMutationsVector,
} = PM;

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = join(root, "native", "decomp", "player_manager_update_pure_helpers.h");
const source = join(root, "native", "decomp", "player_manager_update_pure_helpers.cpp");
const outDir = join(root, ".scratch", "pm-wasm");
const wasmPath = join(outDir, "player-manager-update-pure-helpers.wasm");

/* Wasm test scratch (standing decision): 0x100000+. */
const SCRATCH = 0x100000;

/* Game-object scratch for exports that read game-relative fields
   (v22 GHT reads [game+0x26614]). */
const SCRATCH_GAME = SCRATCH + 0x9000;

/* ------------------------------------------------------------------ */
/* Struct layouts mirrored from the header (natural C alignment).      */
/* ------------------------------------------------------------------ */

/* IsaacPlayerManagerIntensityPlayer: int32 + uint32 + uint8 + pad -> 12 B */
const PLAYER_SIZE = 12;
const PLAYER_OFF = { raw: 0, flags: 4, dead: 8 };

/* IsaacPlayerManagerDeathPlayer: i32 + i32 + 4 x u8 -> 12 B */
const DEATH_PLAYER_SIZE = 12;
const DEATH_PLAYER_OFF = {
  anim7c: 0,
  twinAnim7c: 4,
  dead: 8,
  anim8c: 9,
  twinNull: 10,
  twinAnim8c: 11,
};

/* IsaacPlayerManagerIntensityPlan: float + i32 + i32 -> 12 B */
const PLAN_SIZE = 12;
const PLAN_OFF = { maxVol: 0, start: 4, stop: 8 };

/* IsaacPlayerManagerHeartbeatPlan: 40 B */
const HB_SIZE = 40;
const HB_OFF = {
  maxVol: 0, kind: 4, pure: 8, host: 12, pm2: 16, sfxId: 20,
  frameDelay: 24, loop: 28, pitch: 32, pan: 36,
};

/* IsaacPlayerManagerDeathPlan: 36 B */
const DEATH_PLAN_SIZE = 36;
const DEATH_PLAN_OFF = {
  kind: 0, pure: 4, host: 8, walkGate: 12, pm1: 16,
  eligibleCount: 20, mask: 24, triggerVa: 28, triggerArg: 32,
};

/* IsaacPlayerManagerSfxGate: 8 x i32 -> 32 B */
const SFX_GATE_SIZE = 32;
const SFX_GATE_OFF = {
  kind: 0, entryCount: 4, entryOffset: 8, indexInRange: 12,
  probeResult: 16, probeKnown: 20, warnLogNeeded: 24, voiceLoopNeeded: 28,
};

/* IsaacPlayerManagerPrePlayPlan: 6 x i32 -> 24 B */
const PRE_PLAY_SIZE = 24;
const PRE_PLAY_OFF = {
  soundId: 0, seedOut: 4, advanced: 8, hostLookup: 12,
  seedZeroFatal: 16, pureComplete: 20,
};

/* IsaacPlayerTriggerDeathOrderPlan: 4 x i32 -> 16 B */
const ORDER_PLAN_SIZE = 16;
const ORDER_PLAN_OFF = {
  count: 0, firstIsTwin: 4, secondIsTwin: 8, twinPresent: 12,
};

/* IsaacPlayerTriggerDeathPocketPlan: 6 x i32 -> 24 B */
const POCKET_PLAN_SIZE = 24;
const POCKET_PLAN_OFF = {
  foundIndex: 0, found: 4, shiftDwords: 8, lastSlotId: 12,
  lastSlotType: 16, storesApplied: 20,
};

/* IsaacPlayerPocketSlot: id @0, type @4 -> 8 B */
const POCKET_SLOT_SIZE = 8;

/* RVH cross-helper target sets (mirror of the model tables). */
const RVH_VA_CASE = PM_TD_RVH_CASE_VA;
const RVH_ALL_TARGETS = [
  PM_TD_RVH_VA_EQ137,
  PM_TD_RVH_VA_HIGH,
  PM_TD_RVH_VA_DEFAULT,
  ...RVH_VA_CASE,
  ...PM_TD_RVH_HIGH_SPECIAL.values(),
];

const EXPORTS = [
  "isaac_player_manager_update_pure_helpers_abi_version",
  "isaac_pm_death_anim_idle",
  "isaac_pm_death_dual_zero_gate",
  "isaac_pm_death_eligible_count",
  "isaac_pm_death_eligible_mask",
  "isaac_pm_death_plan_from_players",
  "isaac_pm_death_player_eligible",
  "isaac_pm_death_player_eligible_pack",
  "isaac_pm_death_trigger_arg",
  "isaac_pm_death_trigger_va",
  "isaac_pm_death_walk_pure_complete",
  "isaac_pm_death_wire_decide",
  "isaac_pm_intensity_clamp_raw",
  "isaac_pm_intensity_heartbeat_plan",
  "isaac_pm_intensity_heartbeat_pure_complete",
  "isaac_pm_intensity_max_over_arrays",
  "isaac_pm_intensity_max_over_players",
  "isaac_pm_intensity_plan_from_arrays",
  "isaac_pm_intensity_plan_from_players",
  "isaac_pm_intensity_play_frame_delay",
  "isaac_pm_intensity_play_id",
  "isaac_pm_intensity_play_loop",
  "isaac_pm_intensity_play_pan",
  "isaac_pm_intensity_play_pitch",
  "isaac_pm_intensity_player_contrib",
  "isaac_pm_intensity_player_eligible",
  "isaac_pm_intensity_sfx_id",
  "isaac_pm_intensity_sfx_residual_kind",
  "isaac_pm_intensity_sfx_start_needed",
  "isaac_pm_intensity_sfx_stop_candidate",
  "isaac_pm_intensity_wire_decide",
  "isaac_pm_player_count_from_span",
  "isaac_pm_player_index_select",
  "isaac_pm_pre_play_plan",
  "isaac_pm_pre_play_rare_hit",
  "isaac_pm_pre_play_rng_next",
  "isaac_pm_pre_play_sound_id",
  "isaac_pm_sfx_entry_byte_offset",
  "isaac_pm_sfx_entry_count_from_span",
  "isaac_pm_sfx_entry_gate",
  "isaac_pm_sfx_entry_gate_plan",
  "isaac_pm_sfx_entry_index_in_range",
  "isaac_pm_sfx_is_playing_known",
  "isaac_pm_sfx_is_playing_pure_result",
  "isaac_pm_sfx_manager_receiver",
  "isaac_pm_sfx_mutator_pure_complete",
  "isaac_pm_td_cascade_check_only_returns_true",
  "isaac_pm_td_cascade_first_match",
  "isaac_pm_td_cascade_guard_kind",
  "isaac_pm_td_cascade_probe_kind",
  "isaac_pm_td_cascade_stage_count",
  "isaac_pm_td_cascade_stage_id",
  "isaac_pm_td_cascade_stage_va",
  "isaac_pm_td_char_death_path",
  "isaac_pm_td_check_only_termination",
  "isaac_pm_td_death_seq_kind",
  "isaac_pm_td_early_kind",
  "isaac_pm_td_early_pure_complete",
  "isaac_pm_td_early_returns_false",
  "isaac_pm_td_ghost_morph_gate",
  "isaac_pm_td_heart_gate",
  "isaac_pm_td_list_elem_match",
  "isaac_pm_td_list_scan_skipped",
  "isaac_pm_td_list_walk_steps",
  "isaac_pm_td_list_walk_terminates",
  "isaac_pm_td_order_plan",
  "isaac_pm_td_pocket_compact",
  "isaac_pm_td_pocket_compact_dwords",
  "isaac_pm_td_pocket_find",
  "isaac_pm_td_pocket_match",
  "isaac_pm_td_pocket_slot_clamp",
  "isaac_pm_td_pocket_slot_offset",
  "isaac_pm_td_probe_a_player_match",
  "isaac_pm_td_probe_a_scan",
  "isaac_pm_td_probe_b_needs_count_probe",
  "isaac_pm_td_probe_b_path",
  "isaac_pm_td_probe_b_player_match",
  "isaac_pm_td_probe_b_scan",
  "isaac_pm_td_push_needs_grow",
  "isaac_pm_td_reset_bone_hearts",
  "isaac_pm_td_reset_health_branch",
  "isaac_pm_td_reset_probe_count",
  "isaac_pm_td_reset_revive_needed",
  "isaac_pm_td_rng_record_next",
  "isaac_pm_td_rng_seed_still_zero",
  "isaac_pm_td_rng_seed_zero",
  "isaac_pm_td_rvb_body_from_id",
  "isaac_pm_td_rvb_case0_bone_arg",
  "isaac_pm_td_rvb_case0_branch",
  "isaac_pm_td_rvb_case0_cfg_field_off",
  "isaac_pm_td_rvb_case0_cfg_field_va",
  "isaac_pm_td_rvb_case0_cfg_probes",
  "isaac_pm_td_rvb_case1_branch",
  "isaac_pm_td_rvb_cfg_count",
  "isaac_pm_td_rvb_cfg_entry",
  "isaac_pm_td_rvb_cfg_exit_va",
  "isaac_pm_td_rvb_cfg_in_range",
  "isaac_pm_td_rvb_cfg_receiver",
  "isaac_pm_td_rvb_cfg_site_null_checked",
  "isaac_pm_td_rvb_case1_recurse",
  "isaac_pm_td_rvb_case1_soul2",
  "isaac_pm_td_rvb_case2_new_char",
  "isaac_pm_td_rvb_case3_branch",
  "isaac_pm_td_rvb_const_134c",
  "isaac_pm_td_rvb_eq137_new_char",
  "isaac_pm_td_rvb_exit_route_va",
  "isaac_pm_td_rvb_flag_arm",
  "isaac_pm_td_rvb_has_flag_gate",
  "isaac_pm_td_rvb_heal_applies",
  "isaac_pm_td_rvb_heal_capacity",
  "isaac_pm_td_rvb_heal_excess",
  "isaac_pm_td_rvb_heal_gate",
  "isaac_pm_td_rvb_high0_cfg_in_bounds",
  "isaac_pm_td_rvb_high0_costume_kind",
  "isaac_pm_td_rvb_high0_extra_lives_gate",
  "isaac_pm_td_rvb_high0_fatal_update",
  "isaac_pm_td_rvb_high0_item_gate",
  "isaac_pm_td_rvb_high0_new_char",
  "isaac_pm_td_rvb_high0_soul_update",
  "isaac_pm_td_rvb_high2_branch",
  "isaac_pm_td_rvb_high2_char_path",
  "isaac_pm_td_rvb_high2_first_sfx",
  "isaac_pm_td_rvb_high2_first_sfx_vol_bits",
  "isaac_pm_td_rvb_high2_sfx_count",
  "isaac_pm_td_rvb_notify_clamp",
  "isaac_pm_td_rvb_notify_mod4",
  "isaac_pm_td_rvb_notify_stage",
  "isaac_pm_td_rvb_timer_floor",
  "isaac_pm_td_rvb_twin_pos_adopt",
  "isaac_pm_td_rvb_zero_mask",
  "isaac_pm_td_rvh_chain_flag",
  "isaac_pm_td_rvh_dispatch_va",
  "isaac_pm_td_rvh_is_default",
  "isaac_pm_td_rvh_region",
  "isaac_pm_td_rvh_region_va",
  "isaac_pm_td_rvh_revive_called",
  "isaac_pm_td_rvh_table_case",
  "isaac_pm_td_rvh_table_index",
  "isaac_pm_td_stage17_path",
  "isaac_pm_td_stage17_result",
  "isaac_pm_td_stage_1c_second_probe_needed",
  "isaac_pm_td_stage_1c_value",
  "isaac_pm_td_stage_d4_guard",
  "isaac_pm_td_static_guard_game_effect",
  "isaac_pm_td_static_guard_runs_init",
  "isaac_pm_td_static_guard_slow",
  "isaac_pm_td_tail_check_only_result",
  "isaac_pm_td_tail_hold",
  "isaac_pm_td_tail_host_revive_needed",
  "isaac_pm_td_twin_first",
  "isaac_pm_td_vec_slot_index",
  "isaac_pm_td_vec_slot_offset",
  "isaac_pm_td_vec_span_aligned",
  "isaac_pm_td_vec_warn_needed",
  "isaac_pm_walk_continue",
  "isaac_pm_walk_enter",
  "isaac_pm_walk_needs_empty_fatal",
  "isaac_pm_ep_get_health_type",
  "isaac_pm_ep_health_type_table_byte",
  "isaac_pm_c0t_getter_7cb060",
  "isaac_pm_c0t_walk_engaged",
  "isaac_pm_c0t_walk_continue",
  "isaac_pm_c0t_twin_walk",
  "isaac_pm_c0t_new_1344",
  "isaac_pm_c0t_recompute_uses_bone",
  "isaac_pm_c0t_scan_gate",
  "isaac_pm_c0t_scan_slot_va",
  "isaac_pm_c0t_scan_find",
  "isaac_pm_c0t_scan_apply",
  "isaac_pm_c0t_heal_gate",
  "isaac_pm_c0t_heal_capacity",
  "isaac_pm_c0t_heal_applies",
  "isaac_pm_c0t_heal_excess",
  "isaac_pm_c0t_run_pre",
  "isaac_pm_c0t_heal_plan",
  "isaac_pm_ubh_gate",
  "isaac_pm_ubh_new_bone",
  "isaac_pm_ubh_early_zero",
  "isaac_pm_ubh_total_slots",
  "isaac_pm_ubh_mask_1d8c",
  "isaac_pm_ubh_loop1_runs",
  "isaac_pm_ubh_loop2_enters",
  "isaac_pm_ubh_loop1_bits",
  "isaac_pm_ubh_loop1_budget",
  "isaac_pm_ubh_loop2_bits",
  "isaac_pm_ubh_run",
  "isaac_pm_ubh_apply",
  "isaac_pm_ubh_full_apply",
  "isaac_pm_ghl_gate_lt2",
  "isaac_pm_ghl_base",
  "isaac_pm_ghl_keeper_family",
  "isaac_pm_ghl_keeper_skips",
  "isaac_pm_ghl_keeper_sel",
  "isaac_pm_ghl_keeper_base",
  "isaac_pm_ghl_coin_bonus_q",
  "isaac_pm_ghl_clamp",
  "isaac_pm_ghl_plan",
  "isaac_pm_urh_fold_gate",
  "isaac_pm_urh_fold_half",
  "isaac_pm_urh_fold_1da4",
  "isaac_pm_urh_fold_red",
  "isaac_pm_urh_fg_gate",
  "isaac_pm_urh_fg_sum",
  "isaac_pm_urh_fg_sum_is_one",
  "isaac_pm_urh_room_gate_fg",
  "isaac_pm_urh_room_gate_c5",
  "isaac_pm_urh_scan_entity_match",
  "isaac_pm_urh_scan_count",
  "isaac_pm_urh_itemvec_span",
  "isaac_pm_urh_itemvec_gate",
  "isaac_pm_urh_w_thr0",
  "isaac_pm_urh_w_thr2",
  "isaac_pm_urh_ratio_bits",
  "isaac_pm_urh_c_high",
  "isaac_pm_urh_d_add_band",
  "isaac_pm_urh_probe_6dacd0",
  "isaac_pm_urh_plan",
  "isaac_pm_urh_apply",
  "isaac_pm_heal_applies",
  "isaac_pm_heal_pre_id",
  "isaac_pm_heal_inner_count",
  "isaac_pm_heal_f0_bits",
  "isaac_pm_heal_v2_bits",
  "isaac_pm_heal_tail_eligible",
  "isaac_pm_heal_anm_set",
  "isaac_pm_heal_plan",
  "isaac_pm_heal_emit_plan",
  "isaac_pm_walk_count_reloaded",
  "isaac_pm_walk_top_fatal",
  "isaac_pm_walk_elem_cursor",
  "isaac_pm_walk_back_continues",
  "isaac_pm_walk_iter_plan",
  "isaac_pm_walk_tick_plan",
  "isaac_pm_chain_playing",
  "isaac_pm_chain_receiver_reloaded",
  "isaac_pm_chain_receiver",
  "isaac_pm_pre_play_chain_plan",
  "isaac_pm_td_remove_mutations_vector",
  "isaac_pm_abh_walk_engaged",
  "isaac_pm_abh_walk_continue",
  "isaac_pm_abh_esau_engaged",
  "isaac_pm_abh_esau_continue",
  "isaac_pm_abh_ht2_early",
  "isaac_pm_abh_ht3_soul",
  "isaac_pm_abh_ht3_applies",
  "isaac_pm_abh_game_hard",
  "isaac_pm_abh_amount_neg",
  "isaac_pm_abh_walk_28",
  "isaac_pm_abh_prefix_plan",
  "isaac_pm_abh_run_pre",
  "isaac_pm_ght_hard_gate",
  "isaac_pm_ght_hard_result",
  "isaac_pm_ght_walk_engaged_28",
  "isaac_pm_ght_walk_continue_28",
  "isaac_pm_ght_walk_engaged_11",
  "isaac_pm_ght_walk_continue_11",
  "isaac_pm_ght_walk",
  "isaac_pm_ght_ht2_block",
  "isaac_pm_ght_char11_block",
  "isaac_pm_ght_trunc_half",
  "isaac_pm_ght_half_left",
  "isaac_pm_ght_room_lt",
  "isaac_pm_ght_plan",
  "isaac_pm_btt_count_gate",
  "isaac_pm_btt_mask",
  "isaac_pm_btt_bit_hit",
  "isaac_pm_btt_result",
  "isaac_pm_tpd_gate",
  "isaac_pm_tpd_case",
  "isaac_pm_tpd_case0_is_char12",
  "isaac_pm_tpd_fatal_lt2",
  "isaac_pm_tpd_case0_fatal_le0",
  "isaac_pm_tpd_case0_else_fatal",
  "isaac_pm_global_fatal_scale",
  "isaac_pm_7db0a0_map_count",
  "isaac_pm_7db0a0_delta",
  "isaac_pm_7db0a0_proceed",
  "isaac_pm_7db0a0_size_gate",
  "isaac_pm_7db0a0_host_needed",
  "isaac_pm_7db0a0_flag_next",
  "isaac_pm_7db160_map_count",
  "isaac_pm_7db160_delta",
  "isaac_pm_7db160_run_loop",
  "isaac_pm_7db160_loop_count",
  "isaac_pm_7db160_size_gate",
  "isaac_pm_7db160_effect_host_needed",
  "isaac_pm_7db160_flag_store",
  "isaac_pm_7db2d0_map_count",
  "isaac_pm_7db2d0_delta",
  "isaac_pm_7db2d0_proceed",
  "isaac_pm_7db2d0_flag_advance",
  "isaac_pm_7db2d0_flag_store",
  "isaac_pm_7db330_mode_ge2",
  "isaac_pm_7db330_scale",
  "isaac_pm_7db330_value",
  "isaac_pm_7db360_eq2",
  "isaac_pm_7db360_mode_ge2",
  "isaac_pm_7db360_ratio_bits",
  "isaac_pm_7db360_value",
  "isaac_pm_7db360_window",
  "isaac_pm_7db3b0_char_next",
  "isaac_pm_7db3b0_engage",
  "isaac_pm_7db3b0_entry_match",
  "isaac_pm_7db3b0_loop_needed",
  "isaac_pm_7db3b0_node_addr",
  "isaac_pm_7da770_char_gate",
  "isaac_pm_7da770_value",
  "isaac_pm_7db6b0_scan_skipped",
  "isaac_pm_7db6b0_elem_match",
  "isaac_pm_7db6b0_walk_terminates",
  "isaac_pm_7db6b0_walk_steps",
  "isaac_pm_7db6b0_scan_found",
  "isaac_pm_7db6b0_char_gate",
  "isaac_pm_7db6b0_value",
  "isaac_pm_7da7a0_arg_gate",
  "isaac_pm_7da7a0_value",
  "isaac_pm_7dac30_value",
  "isaac_pm_7daff0_flag_value",
  "isaac_pm_7daff0_loop_iters",
  "isaac_pm_7daff0_size_gate",
  "isaac_pm_7daff0_host_needed",
  "isaac_pm_9bf930_walk_terminates",
  "isaac_pm_9bf930_walk_steps",
  "isaac_pm_9bf930_slot_eligible",
  "isaac_pm_9bf930_probe_match",
  "isaac_pm_9bf930_scan_found",
  "isaac_pm_9bf930_owner_found",
  "isaac_pm_7db8d0_fast_gate",
  "isaac_pm_7db8d0_fast_value",
  "isaac_pm_7db8d0_slow_fatal",
  "isaac_pm_7db8d0_slow_hash",
  "isaac_pm_7db8d0_value",
  "isaac_pm_7db8d0_host_needed",
  "isaac_pm_7dbba0_rng_needs_init",
  "isaac_pm_7dbba0_rng_next",
  "isaac_pm_7dbba0_sample_index",
  "isaac_pm_7dbba0_sample_value",
  "isaac_pm_7dbba0_store_gate",
  "isaac_pm_7dbba0_update",
  "isaac_pm_7dba30_has_item",
  "isaac_pm_7dba30_effect_probe_runs",
  "isaac_pm_7dba30_special_case",
  "isaac_pm_7dba30_table_index",
  "isaac_pm_7dba30_bl",
  "isaac_pm_7dba30_flag_store",
  "isaac_pm_7dba30_result",
  "isaac_pm_7dbc80_rng_seed_zero",
  "isaac_pm_7dbc80_rng_seed_still_zero",
  "isaac_pm_7dbc80_rng_next",
  "isaac_pm_7dbc80_pick_index",
  "isaac_pm_7dbc80_pick_value",
  "isaac_pm_7dbc80_store_gate",
  "isaac_pm_7dbc80_pick",
  "isaac_pm_7dbd70_rng_seed_zero",
  "isaac_pm_7dbd70_rng_seed_still_zero",
  "isaac_pm_7dbd70_rng_next",
  "isaac_pm_7dbd70_push_grow",
  "isaac_pm_7dbd70_cfg_gate",
  "isaac_pm_7dbd70_costume_gate",
  "isaac_pm_7dbd70_flag_1574",
  "isaac_pm_7dbe70_type_special",
  "isaac_pm_7dbe70_flags_bit",
  "isaac_pm_7dbe70_result",
  "isaac_pm_7dc610_end_after_reset",
  "isaac_pm_7dc610_store_off",
  "isaac_pm_7dc650_end_after_pop",
  "isaac_pm_7dc650_pop_delta",
  "isaac_pm_7dd3a0_min_byte",
  "isaac_pm_7dd3a0_selects_b",
  "isaac_pm_7dd490_copy_plan",
  "isaac_pm_7de2f0_store_count",
  "isaac_pm_7de2f0_skips_zero_count",
  "isaac_pm_7de2f0_stride",
  "isaac_pm_7de2f0_dwords_per_elem",
  "isaac_pm_7df200_store_count",
  "isaac_pm_7df200_string_cap",
  "isaac_pm_7df200_cap_site_count",
  "isaac_pm_7df200_scale_f32_bits",
  "isaac_pm_7df200_word_4c_init",
  "isaac_pm_7df200_unity_f32_bits",
];

let wasm;
let v7Cases = 0;
let v8Cases = 0;
let v9Cases = 0;
let v10Cases = 0;
let v11Cases = 0;

function firstExisting(candidates, label) {
  const hit = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!hit) {
    throw new Error(
      `${label} was not found. Checked:\n${candidates.filter(Boolean).join("\n")}`,
    );
  }
  return hit;
}

import { withWasmBuildCache } from "./wasm-build-cache.mjs";
/* Content-hash build cache: skips the clang+em++ spawns when the
   EXACT source bytes (mutants included) were built before. Disable
   with ISAAC_WASM_BUILD_CACHE=0. See tests/wasm-build-cache.mjs. */
function buildWasm() {
  withWasmBuildCache({
    tag: "player-manager-update-pure-helpers",
    files: [source, header],
    extra: typeof EXPORTS !== "undefined" ? JSON.stringify(EXPORTS) : "",
    wasmPath,
    build: buildWasmUncached,
  });
}
function buildWasmUncached() {
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting([
    process.env.CLANGXX,
    join(emsdk, "upstream", "bin", "clang++.exe"),
    join(emsdk, "upstream", "bin", "clang++"),
  ], "Host clang++");
  const emxx = firstExisting([
    process.env.EMXX,
    join(emsdk, "upstream", "emscripten", "em++.exe"),
    join(emsdk, "upstream", "emscripten", "em++"),
  ], "Emscripten em++");
  const syntax = spawnSync(clang, [
    source,
    "-std=c++20",
    "-I", join(root, "native", "decomp"),
    "-fsyntax-only",
    "-Wall",
    "-Wextra",
    "-Werror",
  ], { cwd: root, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  const exportArgs = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
  const built = spawnSync(emxx, [
    source,
    "-std=c++20",
    "-O2",
    "-I", join(root, "native", "decomp"),
    "--no-entry",
    "-sSTANDALONE_WASM=1",
    "-sERROR_ON_UNDEFINED_SYMBOLS=1",
    ...exportArgs,
    "-o", wasmPath,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(
    WebAssembly.Module.imports(module).length,
    0,
    "PM update pure helpers must be zero-import",
  );
  const instance = new WebAssembly.Instance(module, {});
  const exports = instance.exports;
  const exp = (name) => {
    const fn = exports[name] ?? exports[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  const out = { memory: exports.memory };
  for (const name of EXPORTS) {
    out[name] = exp(name);
  }
  return out;
}

function f32Bits(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

function writeI32(view, offset, value) {
  view.setInt32(offset, value | 0, true);
}
function writeU32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}
function writeU8(view, offset, value) {
  view.setUint8(offset, value & 0xff);
}
function readF32(view, offset) {
  return view.getFloat32(offset, true);
}
function readI32(view, offset) {
  return view.getInt32(offset, true);
}
function readU32(view, offset) {
  return view.getUint32(offset, true);
}

function asU32(x) {
  return x >>> 0;
}
function asI32(x) {
  return x | 0;
}
function asU8(x) {
  return x & 0xff;
}


/* ====================================================================== */
/* ABI v1-v4 era: PM0 dual-zero / PM1 death eligibility / PM2 intensity   */
/* / PM3 SFX platform + freestanding wire decisions.                      */
/* ====================================================================== */

test("build PM update pure helpers wasm", () => {
  wasm = loadExports();
  assert.equal(
    wasm.isaac_player_manager_update_pure_helpers_abi_version(),
    PM_UPDATE_PURE_ABI_VERSION,
  );
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
});

test("header documents freestanding PM0/PM1 + PM2 peel + Update ABI v44 wire", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x009bb5d0/);
  assert.match(h, /Update ABI v44|wired into resume_room_update_head/i);
  assert.match(h, /PM3/);
  assert.match(h, /0x1fc/);
  assert.match(h, /wire_decide/i);
  assert.match(h, /ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE/);
  assert.match(h, /ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC/);
  assert.match(h, /heartbeat_pure_complete/);
  assert.match(h, /heartbeat_plan/);
  assert.match(h, /wire_decide/);
  assert.match(h, /ISAAC_PM_INTENSITY_PLAYER_MAX/);
  assert.match(h, /PLAY_FRAME_DELAY/);
  assert.match(h, /0x0092dc30/);
  assert.match(h, /PM0|dual.zero/i);
  assert.match(h, /PM1|TriggerDeath|death_wire_decide|pm_death/i);
  assert.match(h, /0x007a1090/);
  assert.match(h, /ISAAC_PM_DEATH_RESIDUAL_NONE/);
  assert.match(h, /ISAAC_PM_DEATH_RESIDUAL_WALK/);
  assert.match(h, /ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC/);
  assert.match(h, /0x1e68/);
  assert.equal(PM_INTENSITY_PLAYER_MAX, 8);
  assert.equal(PM_DEATH_PLAYER_MAX, 8);
  assert.equal(PM_INTENSITY_HOST_VA_PLAY, 0x0092dc30);
  assert.equal(PM_INTENSITY_HOST_VA_STOP, 0x0092e230);
  assert.equal(PM_DEATH_HOST_VA_TRIGGER_DEATH, 0x007a1090);
  assert.equal(PM_DEATH_HOST_VA_EMPTY_FATAL, 0x00a112c0);
  assert.equal(PM_DEATH_OFF_TWIN_1E68, 0x1e68);
  const s = readFileSync(source, "utf8");
  assert.match(s, /cvtdq2ps|maxss|minss|clamp_raw/i);
  assert.match(s, /sfx_residual_kind|RESIDUAL_/);
  assert.match(s, /wire_decide/);
  assert.match(s, /MONOLITHIC/);
  assert.match(s, /pm_death_dual_zero|dual_zero/);
  assert.match(s, /pm_death_player_eligible|TriggerDeath/);
});

test("header documents v5 PMW walk / PMS SFX gate / PMP pre-play evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x00956830/);            /* PMP xorshift step */
  assert.match(h, /0x00956780/);            /* pre-play heartbeat */
  assert.match(h, /0x1b8/);                 /* SFX entry stride */
  assert.match(h, /0x1fc/);                 /* default sound id */
  assert.match(h, /0x25/);                  /* found sound id */
  assert.match(h, /0x12d/);                 /* rare sound id */
  assert.match(h, /0x94f2095|DIV_MAGIC/);   /* span / 0x1b8 magic */
  assert.match(h, /0x1baa8/);               /* player vector begin */
  assert.match(h, /0x1baac/);               /* player vector end */
  assert.match(h, /0x00c5d2b0/);            /* RNG seed global */
  const s = readFileSync(source, "utf8");
  assert.match(s, /sar eax, 2|PLAYER_PTR_SHIFT/);
  assert.match(s, /jae skip_lea|index_select/);
  assert.match(s, /0x94f2095|DIV_MAGIC/);
  assert.match(s, /xor al,al|is_playing_pure_result/);
  assert.match(s, /pre_play_rng_next/);
  assert.match(s, /mask cl to 5 bits|& 31u/);
  /* JS mirrors of the PE constants */
  assert.equal(PM_PLAYER_VECTOR_BEGIN_OFF, 0x1baa8);
  assert.equal(PM_PLAYER_VECTOR_END_OFF, 0x1baac);
  assert.equal(PM_PLAYER_PTR_SHIFT, 2);
  assert.equal(PM_SFX_ENTRY_STRIDE, 0x1b8);
  assert.equal(PM_PRE_PLAY_ID_DEFAULT, 0x1fc);
  assert.equal(PM_PRE_PLAY_ID_FOUND, 0x25);
  assert.equal(PM_PRE_PLAY_ID_RARE, 0x12d);
  assert.equal(PM_PRE_PLAY_RARE_MODULUS, 20);
});

test("header documents v6 TriggerDeath pure islands", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x007a10ad/);   /* TD0 early-out */
  assert.match(h, /0x007a10f0/);   /* TD1 magic-static guard */
  assert.match(h, /0x007a1109/);   /* TD2 ordering */
  assert.match(h, /0x007a1292/);   /* TD3 pocket clamp */
  assert.match(h, /0x007a1626/);   /* TD4 pocket scan */
  assert.match(h, /0x007a1232/);   /* list walk */
  assert.match(h, /ISAAC_PM_TD_OFF_STATE_2C/); /* state offset: dword enum */
  assert.match(h, /0x17a0/);       /* pocket base */
  assert.match(h, /0x59/);         /* pocket match id */
  assert.match(h, /0x71/);         /* list match id */
  assert.equal(PM_TD_OFF_STATE_2C, 0x2c);
  assert.equal(PM_TD_OFF_POCKET_BASE_17A0, 0x17a0);
  assert.equal(PM_TD_POCKET_SLOTS, 4);
  assert.equal(PM_TD_POCKET_MATCH_ID, 0x59);
  assert.equal(PM_TD_LIST_ELEM_STRIDE, 0x10);
  assert.equal(PM_TD_LIST_MATCH_ID, 0x71);
});

test("JS oracle: TD0 checkOnly early-out + TD1 magic-static guard", () => {
  /* TD0: state == 1 gates the whole early region. */
  assert.equal(pmTdEarlyKind(1, 0), PM_TD_EARLY_REMOVE);
  assert.equal(pmTdEarlyKind(1, 1), PM_TD_EARLY_CHECK_ONLY);
  assert.equal(pmTdEarlyKind(1, 0x100), PM_TD_EARLY_REMOVE); /* 0x100 & 0xff == 0 */
  assert.equal(pmTdEarlyKind(0, 1), PM_TD_EARLY_NONE);
  assert.equal(pmTdEarlyKind(2, 1), PM_TD_EARLY_NONE);
  assert.equal(pmTdEarlyKind(-1, 1), PM_TD_EARLY_NONE);
  /* EARLY_CHECK_ONLY is the only pure-complete early class. */
  assert.equal(pmTdEarlyPureComplete(PM_TD_EARLY_CHECK_ONLY), true);
  assert.equal(pmTdEarlyPureComplete(PM_TD_EARLY_REMOVE), false);
  assert.equal(pmTdEarlyPureComplete(PM_TD_EARLY_NONE), false);
  /* Both early classes return false from TriggerDeath. */
  assert.equal(pmTdEarlyReturnsFalse(PM_TD_EARLY_CHECK_ONLY), true);
  assert.equal(pmTdEarlyReturnsFalse(PM_TD_EARLY_REMOVE), true);
  assert.equal(pmTdEarlyReturnsFalse(PM_TD_EARLY_NONE), false);
  /* TD1: slow when guard > epoch (SIGNED jg). */
  assert.equal(pmTdStaticGuardSlow(2, 1), true);
  assert.equal(pmTdStaticGuardSlow(1, 1), false);
  assert.equal(pmTdStaticGuardSlow(1, 2), false);
  assert.equal(pmTdStaticGuardSlow(-1, 1), false);
  assert.equal(pmTdStaticGuardSlow(0x7fffffff, 0x80000000), true);
  /* Init runs only when the guard == -1 after the CRT header. */
  assert.equal(pmTdStaticGuardRunsInit(-1), true);
  assert.equal(pmTdStaticGuardRunsInit(0), false);
  assert.equal(pmTdStaticGuardRunsInit(1), false);
  /* The slow path registers a destructor thunk: no game-visible effect. */
  assert.equal(pmTdStaticGuardGameEffect(), 0); /* model returns 0 (export is a bool) */
});

test("JS oracle: TD2 self/twin ordering + push growth", () => {
  /* Twin goes first only when all three PE conditions hold. */
  assert.equal(pmTdTwinFirst(0x100, 0x200, 3, 5), true);
  assert.equal(pmTdTwinFirst(0x100, 0x200, -1, 5), false);  /* order -1 */
  assert.equal(pmTdTwinFirst(0x100, 0x200, 5, 3), false);   /* not < */
  assert.equal(pmTdTwinFirst(0x100, 0x200, 3, 3), false);   /* equal */
  assert.equal(pmTdTwinFirst(0x100, 0x100, 3, 5), false);   /* same ptr */
  assert.equal(pmTdTwinFirst(0x100, 0x200, 0x80000000, 5), true); /* signed */
  /* Full plan. */
  const plan1 = pmTdOrderPlan(0, 0x200, 3, 5);
  assert.deepEqual(plan1, { count: 1, firstIsTwin: false, secondIsTwin: false, twinPresent: false });
  const plan2 = pmTdOrderPlan(0x100, 0x200, 3, 5);
  assert.deepEqual(plan2, { count: 2, firstIsTwin: true, secondIsTwin: false, twinPresent: true });
  const plan3 = pmTdOrderPlan(0x100, 0x200, 5, 3);
  assert.deepEqual(plan3, { count: 2, firstIsTwin: false, secondIsTwin: true, twinPresent: true });
  /* push_back grow: end == cap triggers the grow helper. */
  assert.equal(pmTdPushNeedsGrow(0x1000, 0x1000), true);
  assert.equal(pmTdPushNeedsGrow(0x0ff0, 0x1000), false);
  assert.equal(pmTdPushNeedsGrow(0xffffffff, 0xffffffff), true);
});

test("JS oracle: TD3 pocket slot clamp + TD4 scan/compaction", () => {
  /* Clamp: (i <= 0 ? 0 : i) then min(., 3) — SIGNED. */
  assert.equal(pmTdPocketSlotClamp(-5), 0);
  assert.equal(pmTdPocketSlotClamp(0), 0);
  assert.equal(pmTdPocketSlotClamp(1), 1);
  assert.equal(pmTdPocketSlotClamp(3), 3);
  assert.equal(pmTdPocketSlotClamp(4), 3);
  assert.equal(pmTdPocketSlotClamp(100), 3);
  assert.equal(pmTdPocketSlotOffset(0), 0x17a0);
  assert.equal(pmTdPocketSlotOffset(3), 0x17b8);
  /* Slot match: type == 1 && id == 0x59. */
  assert.equal(pmTdPocketMatch(0x59, 1), true);
  assert.equal(pmTdPocketMatch(0x59, 2), false);
  assert.equal(pmTdPocketMatch(0x58, 1), false);
  /* Scan: first matching slot, else 4. */
  assert.equal(pmTdPocketFind([
    { id: 0x59, type: 1 }, { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0, type: 0 },
  ]), 0);
  assert.equal(pmTdPocketFind([
    { id: 0, type: 0 }, { id: 0x59, type: 1 }, { id: 0, type: 0 }, { id: 0, type: 0 },
  ]), 1);
  assert.equal(pmTdPocketFind([
    { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0x59, type: 1 }, { id: 0, type: 0 },
  ]), 2);
  assert.equal(pmTdPocketFind([
    { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0x59, type: 1 },
  ]), 3);
  assert.equal(pmTdPocketFind([
    { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0, type: 0 }, { id: 0, type: 0 },
  ]), 4);
  assert.equal(pmTdPocketFind(null), 4);
  /* rep movsd count: (3 - k) slots x 2 dwords. */
  assert.equal(pmTdPocketCompactDwords(0), 6);
  assert.equal(pmTdPocketCompactDwords(1), 4);
  assert.equal(pmTdPocketCompactDwords(2), 2);
  assert.equal(pmTdPocketCompactDwords(3), 0);
  assert.equal(pmTdPocketCompactDwords(4), 0);
  assert.equal(pmTdPocketCompactDwords(-1), 0);
  /* Full compaction: match removed, {0,1} pushed at the tail. */
  const c = pmTdPocketCompact([
    { id: 0x59, type: 1 }, { id: 7, type: 2 }, { id: 8, type: 0 }, { id: 9, type: 3 },
  ]);
  assert.deepEqual(c.plan, {
    foundIndex: 0, found: true, shiftDwords: 6,
    lastSlotId: 0, lastSlotType: 1, storesApplied: true,
  });
  assert.deepEqual(c.slots, [
    { id: 7, type: 2 }, { id: 8, type: 0 }, { id: 9, type: 3 }, { id: 0, type: 1 },
  ]);
  const c2 = pmTdPocketCompact([
    { id: 1, type: 0 }, { id: 2, type: 0 }, { id: 3, type: 0 }, { id: 4, type: 0 },
  ]);
  assert.deepEqual(c2.plan, {
    foundIndex: 4, found: false, shiftDwords: 0,
    lastSlotId: 0, lastSlotType: 0, storesApplied: false,
  });
});

test("JS oracle: TD list scan predicates + walk termination", () => {
  assert.equal(pmTdListScanSkipped(0), false);
  assert.equal(pmTdListScanSkipped(1), true);
  assert.equal(pmTdListScanSkipped(0x100), false);  /* 0x100 & 0xff == 0 */
  assert.equal(pmTdListElemMatch(0, 0x71), true);
  assert.equal(pmTdListElemMatch(1, 0x71), false);
  assert.equal(pmTdListElemMatch(0, 0x70), false);
  /* Walk terminates when end - begin >= 0 and a multiple of 0x10. */
  assert.equal(pmTdListWalkTerminates(0x1000, 0x1040), true);
  assert.equal(pmTdListWalkTerminates(0x1000, 0x103c), false);
  assert.equal(pmTdListWalkTerminates(0x1000, 0x1000), true);
  assert.equal(pmTdListWalkTerminates(0x1040, 0x1000), false); /* negative */
  assert.equal(pmTdListWalkSteps(0x1000, 0x1040), 4);
  assert.equal(pmTdListWalkSteps(0x1000, 0x1000), 0);
  assert.equal(pmTdListWalkSteps(0x1000, 0x103c), -1);
});

test("JS oracle: PMW player-vector walk CF", () => {
  /* span >> 2 (players are 4-byte pointers). */
  assert.equal(pmPlayerCountFromSpan(8), 2);
  assert.equal(pmPlayerCountFromSpan(0), 0);
  assert.equal(pmPlayerCountFromSpan(4), 1);
  assert.equal(pmPlayerCountFromSpan(-4), -1);  /* sar */
  /* index select: cmovb unsigned -> out-of-range becomes 0. */
  assert.equal(pmPlayerIndexSelect(0, 2), 0);
  assert.equal(pmPlayerIndexSelect(1, 2), 1);
  assert.equal(pmPlayerIndexSelect(2, 2), 0);
  assert.equal(pmPlayerIndexSelect(0xffffffff, 2), 0);
  assert.equal(pmPlayerIndexSelect(0, 0), 0);
  /* walk gates. */
  assert.equal(pmWalkEnter(0), false);
  assert.equal(pmWalkEnter(1), true);
  assert.equal(pmWalkEnter(-1), true);
  assert.equal(pmWalkNeedsEmptyFatal(0), true);
  assert.equal(pmWalkNeedsEmptyFatal(1), false);
  assert.equal(pmWalkContinue(1, 2), true);
  assert.equal(pmWalkContinue(2, 2), false);
  assert.equal(pmWalkContinue(0xffffffff, 2), false);
});

test("JS oracle: PMS SFX entry gate", () => {
  assert.equal(pmSfxEntryCountFromSpan(0x1b8), 1);
  assert.equal(pmSfxEntryCountFromSpan(0x1b8 * 3), 3);
  assert.equal(pmSfxEntryCountFromSpan(0), 0);
  assert.equal(pmSfxEntryByteOffset(3), 0x1b8 * 3);
  assert.equal(pmSfxEntryByteOffset(-1), -0x1b8);
  assert.equal(pmSfxEntryIndexInRange(0, 0x1b8), true);
  assert.equal(pmSfxEntryIndexInRange(1, 0x1b8), false);
  assert.equal(pmSfxEntryIndexInRange(-1, 0x1b8), false);
  /* Gate order: range -> voices -> enabled. */
  assert.equal(pmSfxEntryGate(0, 0x1b8, 1, 1), PM_SFX_GATE_LIVE);
  assert.equal(pmSfxEntryGate(1, 0x1b8, 1, 1), PM_SFX_GATE_MISS);
  assert.equal(pmSfxEntryGate(0, 0x1b8, 0, 1), PM_SFX_GATE_NO_SAMPLES);
  assert.equal(pmSfxEntryGate(0, 0x1b8, 1, 0), PM_SFX_GATE_DISABLED);
  assert.equal(pmSfxEntryGate(0, 0x1b8, 1, 0x100), PM_SFX_GATE_DISABLED);
  assert.equal(pmSfxEntryGate(0, 0x1b8, 0x100, 1), PM_SFX_GATE_LIVE); /* voices is full-dword */
  /* probe knowledge. */
  assert.equal(pmSfxIsPlayingKnown(PM_SFX_GATE_LIVE), false);
  assert.equal(pmSfxIsPlayingKnown(PM_SFX_GATE_MISS), true);
  assert.equal(pmSfxIsPlayingPureResult(PM_SFX_GATE_MISS), 0);
  assert.equal(pmSfxMutatorPureComplete(PM_SFX_GATE_MISS), true);
  assert.equal(pmSfxMutatorPureComplete(PM_SFX_GATE_DISABLED), true);
  assert.equal(pmSfxMutatorPureComplete(PM_SFX_GATE_NO_SAMPLES), false);
  assert.equal(pmSfxMutatorPureComplete(PM_SFX_GATE_LIVE), false);
  assert.equal(pmSfxManagerReceiver(0x00c7169c), 0x00c7169c + PM_SFX_MANAGER_OFF);
});

test("JS oracle: PMP pre-play heartbeat id + xorshift", () => {
  /* xorshift: x ^= x >> s1; x ^= x << s2; x ^= x >> s3 (cl masked 5 bits). */
  assert.equal(pmPrePlayRngNext(0, 2, 7, 7), 0);
  assert.equal(pmPrePlayRngNext(1, 2, 7, 7), 0x80);
  assert.equal(pmPrePlayRngNext(0xdeadbeef, 1, 31, 0), 0);
  assert.equal(pmPrePlayRngNext(0xffffffff, 32, 32, 32), 0);
  assert.equal(pmPrePlayRngNext(0x12345678, 33, 0, 33), 0);
  /* rare: next % 20 == 0. */
  assert.equal(pmPrePlayRareHit(0), true);
  assert.equal(pmPrePlayRareHit(20), true);
  assert.equal(pmPrePlayRareHit(21), false);
  assert.equal(pmPrePlayRareHit(0xffffffff), false);
});

test("JS oracle: PMP plan branches", () => {
  /* game == 0: no host call at all. */
  assert.deepEqual(pmPrePlayPlan({ gameNull: 1, entryFound: 0, seed: 1 }), {
    soundId: PM_PRE_PLAY_ID_DEFAULT,
    rngSeedOut: 1,
    rngAdvanced: false,
    hostLookupNeeded: false,
    seedZeroFatal: false,
    pureComplete: true,
  });
  /* entry not found: default id, host lookup remains. */
  const p1 = pmPrePlayPlan({ gameNull: 0, entryFound: 0, seed: 0x1234 });
  assert.equal(p1.soundId, PM_PRE_PLAY_ID_DEFAULT);
  assert.equal(p1.rngAdvanced, false);
  assert.equal(p1.hostLookupNeeded, true);
  assert.equal(p1.pureComplete, false);
  /* seed == 0 fatal (PE 0x00b6bf54 "RNG Seed is zero!" -> int3). */
  const p2 = pmPrePlayPlan({ gameNull: 0, entryFound: 1, seed: 0 });
  assert.equal(p2.soundId, PM_PRE_PLAY_ID_FOUND);
  assert.equal(p2.seedZeroFatal, true);
  assert.equal(p2.rngAdvanced, false);
  assert.equal(p2.pureComplete, false);
  /* normal advance. */
  const p3 = pmPrePlayPlan({ gameNull: 0, entryFound: 1, seed: 1 });
  assert.equal(p3.rngAdvanced, true);
  assert.equal(p3.rngSeedOut, pmPrePlayRngNext(1, PM_PRE_PLAY_RNG_SHIFT1_DEFAULT,
    PM_PRE_PLAY_RNG_SHIFT2_DEFAULT, PM_PRE_PLAY_RNG_SHIFT3_DEFAULT));
  assert.equal(p3.seedZeroFatal, false);
  /* rare vs found ids. */
  assert.equal(pmPrePlaySoundId({ gameNull: 0, entryFound: 1, seed: 0xdeadbeef }),
    PM_PRE_PLAY_ID_FOUND);
  assert.equal(pmPrePlaySoundId({ gameNull: 0, entryFound: 1, seed: 4 }),
    PM_PRE_PLAY_ID_RARE);
  assert.equal(pmIntensityPlayId({ gameNull: 0, entryFound: 1, seed: 1 }),
    PM_PRE_PLAY_ID_FOUND);
});

test("Wasm matches JS: PMW walk CF", () => {
  const cases = [
    [0, 0], [4, 1], [8, 2], [0x100, 0x40], [-4, -1], [0x7ffffffc, 0x1fffffff],
  ];
  for (const [span, want] of cases) {
    assert.equal(wasm.isaac_pm_player_count_from_span(span | 0), want);
    assert.equal(wasm.isaac_pm_player_count_from_span(span | 0),
      pmPlayerCountFromSpan(span));
  }
  for (let i = 0; i < 8; i += 1) {
    for (let c = 0; c < 5; c += 1) {
      assert.equal(
        wasm.isaac_pm_player_index_select(i >>> 0, c | 0) !== 0,
        pmPlayerIndexSelect(i, c) !== 0,
      );
    }
  }
  for (const n of [0, 1, -1, 0x7fffffff, 0x80000000]) {
    assert.equal(wasm.isaac_pm_walk_enter(n | 0) !== 0, pmWalkEnter(n));
    assert.equal(wasm.isaac_pm_walk_needs_empty_fatal(n | 0) !== 0,
      pmWalkNeedsEmptyFatal(n));
  }
  for (let i = 0; i < 8; i += 1) {
    for (let c = 0; c < 5; c += 1) {
      assert.equal(
        wasm.isaac_pm_walk_continue(i >>> 0, c | 0) !== 0,
        pmWalkContinue(i, c),
      );
    }
  }
});

test("Wasm matches JS: PMS SFX entry gate + plan layout", () => {
  const view = new DataView(wasm.memory.buffer);
  const span = 0x1b8 * 4;
  const cases = [
    [0, span, 1, 1, PM_SFX_GATE_LIVE],
    [3, span, 1, 1, PM_SFX_GATE_LIVE],
    [4, span, 1, 1, PM_SFX_GATE_MISS],
    [-1, span, 1, 1, PM_SFX_GATE_MISS],
    [0, span, 0, 1, PM_SFX_GATE_NO_SAMPLES],
    [0, span, 1, 0, PM_SFX_GATE_DISABLED],
    [0, span, 1, 0x100, PM_SFX_GATE_DISABLED],
    [0, span, 0x100, 1, PM_SFX_GATE_LIVE], /* voices full-dword */
    [0, 0, 1, 1, PM_SFX_GATE_MISS],
  ];
  for (const [id, sp, voices, enabled, want] of cases) {
    assert.equal(wasm.isaac_pm_sfx_entry_gate(id | 0, sp | 0, voices >>> 0, enabled >>> 0), want);
    assert.equal(wasm.isaac_pm_sfx_entry_gate(id | 0, sp | 0, voices >>> 0, enabled >>> 0),
      pmSfxEntryGate(id, sp, voices, enabled));
  }
  /* plan layout */
  const plan = SCRATCH;
  wasm.isaac_pm_sfx_entry_gate_plan(2, span, 1, 1, plan);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.kind), PM_SFX_GATE_LIVE);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.entryCount), 4);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.entryOffset), 2 * 0x1b8);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.indexInRange), 1);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.probeResult), 0);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.probeKnown), 0);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.warnLogNeeded), 0);
  assert.equal(readI32(view, plan + SFX_GATE_OFF.voiceLoopNeeded), 1);
  const jsPlan = pmSfxEntryGatePlan(2, span, 1, 1);
  for (const k of Object.keys(SFX_GATE_OFF)) {
    const want = typeof jsPlan[k] === "boolean" ? (jsPlan[k] ? 1 : 0) : jsPlan[k];
    assert.equal(readI32(view, plan + SFX_GATE_OFF[k]), want, `plan field ${k}`);
  }
});

test("Wasm matches JS: PMP pre-play plan layout + RNG", () => {
  const view = new DataView(wasm.memory.buffer);
  const plan = SCRATCH;
  /* host lookup path (entryFound=0) */
  wasm.isaac_pm_pre_play_plan(0, 0, 0x1234, 2, 7, 7, plan);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.soundId), PM_PRE_PLAY_ID_DEFAULT);
  assert.equal(readU32(view, plan + PRE_PLAY_OFF.seedOut), 0x1234);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.advanced), 0);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.hostLookup), 1);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.seedZeroFatal), 0);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.pureComplete), 0);
  /* seed-zero fatal */
  wasm.isaac_pm_pre_play_plan(0, 1, 0, 2, 7, 7, plan);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.soundId), PM_PRE_PLAY_ID_FOUND);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.seedZeroFatal), 1);
  /* game == 0: fully pure */
  wasm.isaac_pm_pre_play_plan(1, 1, 0x1234, 2, 7, 7, plan);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.soundId), PM_PRE_PLAY_ID_DEFAULT);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.hostLookup), 0);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.pureComplete), 1);
  /* rng advance */
  wasm.isaac_pm_pre_play_plan(0, 1, 1, 2, 7, 7, plan);
  assert.equal(readI32(view, plan + PRE_PLAY_OFF.advanced), 1);
  assert.equal(readU32(view, plan + PRE_PLAY_OFF.seedOut), 0x80);
  /* RNG export vs model on a fixed sweep */
  for (const s of [0, 1, 0xdeadbeef, 0xffffffff, 0x12345678]) {
    for (const sh of [[2, 7, 7], [1, 31, 0], [0, 0, 0], [33, 0, 33]]) {
      assert.equal(
        wasm.isaac_pm_pre_play_rng_next(s >>> 0, sh[0] >>> 0, sh[1] >>> 0, sh[2] >>> 0) >>> 0,
        pmPrePlayRngNext(s, sh[0], sh[1], sh[2]),
      );
    }
  }
  for (const s of [0, 1, 20, 21, 0xffffffff, 0x280]) {
    assert.equal(
      wasm.isaac_pm_pre_play_rare_hit(s >>> 0) !== 0,
      pmPrePlayRareHit(s),
    );
  }
});

test("Wasm matches JS: TD TriggerDeath pure islands", () => {
  const view = new DataView(wasm.memory.buffer);
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xffffffff];
  let cases = 0;
  for (const w of wide) {
    assert.equal(wasm.isaac_pm_td_early_kind(1, w >>> 0),
      pmTdEarlyKind(1, w), `early kind ${w}`);
    assert.equal(wasm.isaac_pm_td_static_guard_slow(w | 0, 0) !== 0,
      pmTdStaticGuardSlow(w, 0), `guard slow ${w}`);
    assert.equal(wasm.isaac_pm_td_static_guard_runs_init(w | 0) !== 0,
      pmTdStaticGuardRunsInit(w), `guard init ${w}`);
    assert.equal(wasm.isaac_pm_td_push_needs_grow(w >>> 0, w >>> 0) !== 0,
      pmTdPushNeedsGrow(w, w), `grow ${w}`);
    assert.equal(wasm.isaac_pm_td_pocket_match(0x59, w | 0) !== 0,
      pmTdPocketMatch(0x59, w), `pocket match ${w}`);
    assert.equal(wasm.isaac_pm_td_list_scan_skipped(w >>> 0) !== 0,
      pmTdListScanSkipped(w), `scan skipped ${w}`);
    assert.equal(wasm.isaac_pm_td_list_elem_match(0, w | 0) !== 0,
      pmTdListElemMatch(0, w), `elem match ${w}`);
    cases += 7;
  }
  /* pocket slot clamp / offset fixed sweep */
  for (const i of [-5, 0, 1, 3, 4, 100, 0x80000000, 0x7fffffff]) {
    assert.equal(wasm.isaac_pm_td_pocket_slot_clamp(i | 0), pmTdPocketSlotClamp(i));
    assert.equal(wasm.isaac_pm_td_pocket_slot_offset(i | 0), pmTdPocketSlotOffset(i));
    cases += 2;
  }
  /* order plan through memory */
  const plan = SCRATCH;
  wasm.isaac_pm_td_order_plan(0x100, 0x200, 3, 5, plan);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.count), 2);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.firstIsTwin), 1);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.secondIsTwin), 0);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.twinPresent), 1);
  wasm.isaac_pm_td_order_plan(0, 0x200, 3, 5, plan);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.count), 1);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.firstIsTwin), 0);
  assert.equal(readI32(view, plan + ORDER_PLAN_OFF.twinPresent), 0);
  /* pocket find through memory */
  const slots = SCRATCH + 0x100;
  writeI32(view, slots + 0, 0x59); writeI32(view, slots + 4, 1);
  writeI32(view, slots + 8, 7); writeI32(view, slots + 12, 2);
  writeI32(view, slots + 16, 8); writeI32(view, slots + 20, 0);
  writeI32(view, slots + 24, 9); writeI32(view, slots + 28, 3);
  assert.equal(wasm.isaac_pm_td_pocket_find(slots), 0);
  /* pocket compact through memory */
  const pplan = SCRATCH + 0x200;
  wasm.isaac_pm_td_pocket_compact(slots, pplan);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.foundIndex), 0);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.found), 1);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.shiftDwords), 6);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.lastSlotId), 0);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.lastSlotType), 1);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.storesApplied), 1);
  /* slot memory compacted: slot0 now {7,2}, last slot {0,1} */
  assert.equal(readI32(view, slots + 0), 7);
  assert.equal(readI32(view, slots + 4), 2);
  assert.equal(readI32(view, slots + 24), 0);
  assert.equal(readI32(view, slots + 28), 1);
  /* no-match compact: foundIndex 4, no stores */
  writeI32(view, slots + 0, 1); writeI32(view, slots + 4, 0);
  writeI32(view, slots + 8, 2); writeI32(view, slots + 12, 0);
  writeI32(view, slots + 16, 3); writeI32(view, slots + 20, 0);
  writeI32(view, slots + 24, 4); writeI32(view, slots + 28, 0);
  wasm.isaac_pm_td_pocket_compact(slots, pplan);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.foundIndex), 4);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.found), 0);
  assert.equal(readI32(view, pplan + POCKET_PLAN_OFF.storesApplied), 0);
  /* list walk through memory */
  assert.equal(wasm.isaac_pm_td_list_walk_terminates(0x1000, 0x1040), 1);
  assert.equal(wasm.isaac_pm_td_list_walk_steps(0x1000, 0x1040), 4);
  assert.equal(wasm.isaac_pm_td_list_walk_steps(0x1000, 0x103c), -1);
  cases += 18;
  assert.ok(cases >= 60, `expected >= 60 cases, got ${cases}`);
});

test("deterministic randomized differential corpus: TD islands", (t) => {
  let seed = 0x7a1090 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  for (let trial = 0; trial < 400; trial += 1) {
    const s = (rnd() | 0);
    const co = pick(4) === 0 ? 0x100 : pick(2);
    assert.equal(wasm.isaac_pm_td_early_kind(s, co >>> 0), pmTdEarlyKind(s, co));
    const epoch = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_static_guard_slow(s, epoch) !== 0,
      pmTdStaticGuardSlow(s, epoch));
    assert.equal(wasm.isaac_pm_td_static_guard_runs_init(s) !== 0,
      pmTdStaticGuardRunsInit(s));
    const e = rnd() >>> 0;
    const c = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_td_push_needs_grow(e, c) !== 0, pmTdPushNeedsGrow(e, c));
    const tp = (rnd() >>> 0) || 1;
    const sp = (rnd() >>> 0) || 2;
    const to = rnd() | 0;
    const so = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_twin_first(tp, sp, to, so) !== 0,
      pmTdTwinFirst(tp, sp, to, so));
    const idx = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_pocket_slot_clamp(idx), pmTdPocketSlotClamp(idx));
    assert.equal(wasm.isaac_pm_td_pocket_slot_offset(idx), pmTdPocketSlotOffset(idx));
    const pid = rnd() | 0;
    const pty = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_pocket_match(pid, pty) !== 0, pmTdPocketMatch(pid, pty));
    const lb = rnd() >>> 0;
    const le = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_td_list_walk_terminates(lb, le) !== 0,
      pmTdListWalkTerminates(lb, le));
    assert.equal(wasm.isaac_pm_td_list_walk_steps(lb, le),
      pmTdListWalkSteps(lb, le));
    cases += 11;
  }
  t.diagnostic(`TD islands randomized differential cases: ${cases}`);
  assert.ok(cases >= 4000, `expected >= 4000 cases, got ${cases}`);
});

/* ====================================================================== */
/* v4-era PM0/PM1/PM2/PM3 fixed + differential coverage.                  */
/* ====================================================================== */

test("JS oracle: PM0 dual-zero + PM1 eligibility edges", () => {
  /* PM0: open when both gates are zero (full dword). */
  assert.equal(pmDeathDualZeroGate(0, 0), true);
  assert.equal(pmDeathDualZeroGate(1, 0), false);
  assert.equal(pmDeathDualZeroGate(0, 1), false);
  assert.equal(pmDeathDualZeroGate(-1, 0), false);
  /* PM1 anim idle: anim_7c == 0 (dword) or anim_8c == 0 (byte). */
  assert.equal(pmDeathAnimIdle(0, 5), true);
  assert.equal(pmDeathAnimIdle(1, 0), true);
  assert.equal(pmDeathAnimIdle(1, 5), false);
  assert.equal(pmDeathAnimIdle(1, 0x100), true);  /* byte: 0x100 & 0xff == 0 -> idle */
  /* eligibility: dead != 0, own anim idle, then twin check. */
  assert.equal(pmDeathPlayerEligible(1, 0, 0, 0, 0, 0), true);
  assert.equal(pmDeathPlayerEligible(0, 0, 0, 0, 0, 0), false);
  assert.equal(pmDeathPlayerEligible(1, 1, 5, 0, 0, 0), false);
  assert.equal(pmDeathPlayerEligible(1, 0, 0, 1, 0, 0), true);   /* twin null */
  assert.equal(pmDeathPlayerEligible(1, 0, 0, 0, 0, 0), true);   /* twin idle */
  assert.equal(pmDeathPlayerEligible(1, 0, 0, 0, 1, 5), false);  /* twin busy */
  assert.equal(pmDeathPlayerEligible(0x100, 0, 0, 0, 0, 0), false); /* dead low byte 0 */
  /* counts / masks. */
  const players = [
    { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
    { anim7c: 0, twinAnim7c: 0, dead173: 0, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
    { anim7c: 1, twinAnim7c: 0, dead173: 1, anim8c: 5, twinNull: 0, twinAnim8c: 0 },
  ];
  assert.equal(pmDeathEligibleCount(players), 1);
  assert.equal(pmDeathEligibleMask(players), 0b001);
  assert.equal(pmDeathEligibleCount([]), 0);
  assert.equal(pmDeathEligibleMask([]), 0);
  assert.equal(pmDeathWalkPureComplete(PM_DEATH_RESIDUAL_NONE), true);
  assert.equal(pmDeathWalkPureComplete(PM_DEATH_RESIDUAL_WALK), false);
  assert.equal(pmDeathTriggerVa(), PM_DEATH_HOST_VA_TRIGGER_DEATH);
  assert.equal(pmDeathTriggerArg(), 0);
});

test("JS oracle: death plan + wire_decide matrix", () => {
  const players = [
    { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
    { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
  ];
  /* gates closed -> NONE; no PM1 body runs, so the walk is pure-complete. */
  const closed = pmDeathPlanFromPlayers(1, 0, players);
  assert.equal(closed.residualKind, PM_DEATH_RESIDUAL_NONE);
  assert.equal(closed.pureComplete, true);
  assert.equal(closed.hostNeeded, false); /* NONE never needs the host */
  /* gates open, zero eligible -> NONE pure. */
  const zero = pmDeathPlanFromPlayers(0, 0, []);
  assert.equal(zero.residualKind, PM_DEATH_RESIDUAL_NONE);
  assert.equal(zero.pureComplete, true);
  /* gates open, eligible -> WALK with count/mask. */
  const walk = pmDeathPlanFromPlayers(0, 0, players);
  assert.equal(walk.residualKind, PM_DEATH_RESIDUAL_WALK);
  assert.equal(walk.eligibleCount, 2);
  assert.equal(walk.eligibleMask, 0b11);
  /* JS plan object carries the host constants under their model names. */
  assert.equal(walk.triggerDeathVa, PM_DEATH_HOST_VA_TRIGGER_DEATH);
  assert.equal(walk.triggerArg, PM_DEATH_TRIGGER_ARG_CHECK_ONLY);
  /* wire_decide: blob missing or count > MAX -> MONOLITHIC. */
  const mono = pmDeathWireDecide({ gate1b83c: 0, gate1ba78: 0, playerCount: 2, blobReady: false, players });
  assert.equal(mono.residualKind, PM_DEATH_RESIDUAL_MONOLITHIC);
  assert.equal(mono.pureComplete, false);
  assert.equal(mono.hostNeeded, true);
  const over = pmDeathWireDecide({ gate1b83c: 0, gate1ba78: 0, playerCount: 9, blobReady: true, players });
  assert.equal(over.residualKind, PM_DEATH_RESIDUAL_MONOLITHIC);
  /* count 0 -> NONE pure. */
  const none = pmDeathWireDecide({ gate1b83c: 0, gate1ba78: 0, playerCount: 0, blobReady: true, players });
  assert.equal(none.residualKind, PM_DEATH_RESIDUAL_NONE);
  assert.equal(none.pureComplete, true);
  /* full pack walk. */
  const full = pmDeathWireDecide({ gate1b83c: 0, gate1ba78: 0, playerCount: 2, blobReady: true, players });
  assert.equal(full.residualKind, PM_DEATH_RESIDUAL_WALK);
  assert.equal(full.eligibleCount, 2);
  assert.equal(full.eligibleMask, 0b11);
  /* pack shorter than count -> MONOLITHIC. */
  const short = pmDeathWireDecide({ gate1b83c: 0, gate1ba78: 0, playerCount: 3, blobReady: true, players });
  assert.equal(short.residualKind, PM_DEATH_RESIDUAL_MONOLITHIC);
});

test("JS oracle: eligibility edges", () => {
  const p = (dead, anim7c, anim8c, twinNull, twinAnim7c, twinAnim8c) =>
    ({ anim7c, twinAnim7c, dead173: dead, anim8c, twinNull, twinAnim8c });
  assert.equal(pmDeathPlayerEligiblePack(p(1, 0, 0, 1, 0, 0)), true);
  assert.equal(pmDeathPlayerEligiblePack(p(0, 0, 0, 1, 0, 0)), false);
  assert.equal(pmDeathPlayerEligiblePack(p(1, 1, 9, 1, 0, 0)), false);
  assert.equal(pmDeathPlayerEligiblePack(p(1, 0, 0, 0, 0, 0)), true);
  assert.equal(pmDeathPlayerEligiblePack(p(1, 0, 0, 0, 1, 0)), true);
  assert.equal(pmDeathPlayerEligiblePack(p(1, 0, 0, 0, 1, 9)), false);
  assert.equal(pmDeathPlayerEligiblePack(p(1, 1, 0, 0, 1, 0)), true);
});

test("JS oracle: clamp raw int/20 into [0,1]", () => {
  assert.equal(pmIntensityClampRaw(0), 0);
  assert.equal(pmIntensityClampRaw(20), 1);
  assert.equal(pmIntensityClampRaw(40), 1);
  assert.equal(pmIntensityClampRaw(10), 0.5);
  assert.equal(pmIntensityClampRaw(-20), 0);
  assert.equal(pmIntensityClampRaw(-1), 0);
  assert.equal(pmIntensityClampRaw(7), Math.fround(0.35));
  /* float32 rounding: the PE rounds raw/20 to the nearest f32, not the double 0.35. */
  assert.equal(pmIntensityClampRaw(0x7fffffff), 1);
  assert.equal(pmIntensityClampRaw(0x80000000), 0);
});

test("JS oracle: max reduction over players", () => {
  const players = [
    { raw1ea8: 10, flags168: 0, dead173: 0 },
    { raw1ea8: 30, flags168: 0, dead173: 0 },
    { raw1ea8: 5, flags168: 0, dead173: 0 },
  ];
  assert.equal(pmIntensityMaxOverPlayers(players), 1); /* 30/20 clamps to 1 */
  const mid = [
    { raw1ea8: 10, flags168: 0, dead173: 0 },
    { raw1ea8: 5, flags168: 0, dead173: 0 },
  ];
  assert.equal(pmIntensityMaxOverPlayers(mid), 0.5);
  assert.equal(pmIntensityMaxOverPlayers([]), 0);
  assert.equal(pmIntensityMaxOverPlayers([{ raw1ea8: 10, flags168: 0, dead173: 1 }]), 0); /* dead */
  assert.equal(pmIntensityMaxOverPlayers([{ raw1ea8: 10, flags168: 0x40, dead173: 0 }]), 0); /* flag */
  assert.equal(pmIntensityMaxOverPlayers([{ raw1ea8: -5, flags168: 0, dead173: 0 }]), 0);
  assert.equal(pmIntensityMaxOverArrays([10, 20], [0, 0], [0, 0]), 1);
  assert.equal(pmIntensityMaxOverArrays([10], [0], [0, 0]), 0.5);
  assert.equal(pmIntensityMaxOverArrays(null, [0], [0]), 0);
});

test("JS oracle: plan + residual kinds + pure-complete", () => {
  assert.equal(pmIntensitySfxStartNeeded(0), false);
  assert.equal(pmIntensitySfxStartNeeded(0.01), false);   /* threshold */
  assert.equal(pmIntensitySfxStartNeeded(0.011), true);
  assert.equal(pmIntensitySfxStartNeeded(1), true);
  assert.equal(pmIntensitySfxStopCandidate(1), false);
  assert.equal(pmIntensitySfxStopCandidate(0), true);
  assert.equal(pmIntensitySfxResidualKind(0, 0), PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(pmIntensitySfxResidualKind(0, 1), PM_INTENSITY_SFX_RESIDUAL_STOP);
  assert.equal(pmIntensitySfxResidualKind(1, 0), PM_INTENSITY_SFX_RESIDUAL_PLAY);
  assert.equal(pmIntensitySfxResidualKind(1, 1), PM_INTENSITY_SFX_RESIDUAL_UPDATE);
  assert.equal(pmIntensityHeartbeatPureComplete(0, 0), true);
  assert.equal(pmIntensityHeartbeatPureComplete(0, 1), false);
  assert.equal(pmIntensityHeartbeatPureComplete(1, 1), false);
  const plan = pmIntensityPlanFromPlayers([{ raw1ea8: 10, flags168: 0, dead173: 0 }]);
  assert.equal(plan.maxVol, 0.5);
  assert.equal(plan.sfxStartNeeded, true);
  assert.equal(plan.sfxStopCandidate, false);
  const planA = pmIntensityPlanFromArrays([0], [0], [0]);
  assert.equal(planA.maxVol, 0);
  assert.equal(planA.sfxStartNeeded, false);
  assert.equal(planA.sfxStopCandidate, true);
});

test("JS oracle: PM3 pure SFX gates + Play imm + id", () => {
  assert.equal(pmIntensitySfxId(), PM_INTENSITY_SFX_ID);
  assert.equal(pmIntensityPlayFrameDelay(), 2);
  assert.equal(pmIntensityPlayLoop(), 1);
  assert.equal(pmIntensityPlayPitch(), 1);
  assert.equal(pmIntensityPlayPan(), 0);
  assert.equal(PM_INTENSITY_SFX_ID, 0x1fc);
  assert.equal(PM_INTENSITY_PLAY_PITCH_BITS, 0x3f800000);
  assert.equal(PM_INTENSITY_PLAY_PAN_BITS, 0);
  assert.equal(PM_INTENSITY_PLAY_FRAME_DELAY, 2);
  assert.equal(PM_INTENSITY_PLAY_LOOP, 1);
});

test("JS oracle: heartbeat_plan + wire_decide pure-complete matrix", () => {
  const plan = pmIntensityHeartbeatPlan(0, 0);
  assert.equal(plan.residualKind, PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(plan.pureComplete, true);
  assert.equal(plan.hostNeeded, false);
  assert.equal(plan.pm2Pure, true);
  assert.equal(plan.sfxId, PM_INTENSITY_SFX_ID);
  assert.equal(plan.playFrameDelay, 2);
  assert.equal(plan.playLoop, 1);
  assert.equal(plan.playPitch, 1);
  assert.equal(plan.playPan, 0);
  const play = pmIntensityHeartbeatPlan(1, 0);
  assert.equal(play.residualKind, PM_INTENSITY_SFX_RESIDUAL_PLAY);
  assert.equal(play.pureComplete, false);
  const stop = pmIntensityHeartbeatPlan(0, 1);
  assert.equal(stop.residualKind, PM_INTENSITY_SFX_RESIDUAL_STOP);
  /* wire_decide mono paths */
  const mono1 = pmIntensityWireDecide({ playerCount: 1, blobReady: false, sfxPlaying: 0 });
  assert.equal(mono1.residualKind, PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  assert.equal(mono1.pureComplete, false);
  assert.equal(mono1.pm2Pure, false);
  assert.equal(mono1.maxVol, 0);
  const mono2 = pmIntensityWireDecide({ playerCount: 9, blobReady: true, sfxPlaying: 0 });
  assert.equal(mono2.residualKind, PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  const short = pmIntensityWireDecide({ playerCount: 2, blobReady: true, sfxPlaying: 0,
    players: [{ raw1ea8: 10, flags168: 0, dead173: 0 }] });
  assert.equal(short.residualKind, PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  /* empty count: pure NONE */
  const none = pmIntensityWireDecide({ playerCount: 0, blobReady: true, sfxPlaying: 0 });
  assert.equal(none.residualKind, PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(none.pureComplete, true);
  /* full pack: max drives residual */
  const loud = pmIntensityWireDecide({ playerCount: 1, blobReady: true, sfxPlaying: 0,
    players: [{ raw1ea8: 20, flags168: 0, dead173: 0 }] });
  assert.equal(loud.residualKind, PM_INTENSITY_SFX_RESIDUAL_PLAY);
  assert.equal(loud.maxVol, 1);
});

test("Wasm matches JS: death dual-zero / anim / eligible", () => {
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xffffffff];
  let cases = 0;
  for (const w of wide) {
    assert.equal(wasm.isaac_pm_death_dual_zero_gate(w | 0, 0) !== 0,
      pmDeathDualZeroGate(w, 0), `dual zero ${w}`);
    assert.equal(wasm.isaac_pm_death_anim_idle(1, w >>> 0) !== 0,
      pmDeathAnimIdle(1, w), `anim idle ${w}`);
    assert.equal(wasm.isaac_pm_death_player_eligible(w >>> 0, 0, 0, 1, 0, 0) !== 0,
      pmDeathPlayerEligible(w, 0, 0, 1, 0, 0), `elig dead ${w}`);
    assert.equal(wasm.isaac_pm_death_player_eligible(1, 0, 0, w >>> 0, 0, 0) !== 0,
      pmDeathPlayerEligible(1, 0, 0, w, 0, 0), `elig twinNull ${w}`);
    cases += 4;
  }
  assert.equal(wasm.isaac_pm_death_anim_idle(1, 0x100), 1);  /* byte: 0x100 & 0xff == 0 -> idle */
  assert.equal(wasm.isaac_pm_death_player_eligible(0x100, 0, 0, 1, 0, 0), 0); /* dead low byte 0 */
  cases += 2;
  assert.ok(cases >= 20, `expected >= 20 cases, got ${cases}`);
});

test("Wasm matches JS: death pack eligible + wire_decide", () => {
  const view = new DataView(wasm.memory.buffer);
  const base = SCRATCH;
  const players = [
    { anim7c: 0, twinAnim7c: 0, dead: 1, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
    { anim7c: 0, twinAnim7c: 0, dead: 0, anim8c: 0, twinNull: 1, twinAnim8c: 0 },
    { anim7c: 1, twinAnim7c: 0, dead: 1, anim8c: 5, twinNull: 0, twinAnim8c: 0 },
  ];
  for (let i = 0; i < players.length; i += 1) {
    const off = base + i * DEATH_PLAYER_SIZE;
    const p = players[i];
    writeI32(view, off + DEATH_PLAYER_OFF.anim7c, p.anim7c);
    writeI32(view, off + DEATH_PLAYER_OFF.twinAnim7c, p.twinAnim7c);
    writeU8(view, off + DEATH_PLAYER_OFF.dead, p.dead);
    writeU8(view, off + DEATH_PLAYER_OFF.anim8c, p.anim8c);
    writeU8(view, off + DEATH_PLAYER_OFF.twinNull, p.twinNull);
    writeU8(view, off + DEATH_PLAYER_OFF.twinAnim8c, p.twinAnim8c);
  }
  assert.equal(wasm.isaac_pm_death_player_eligible_pack(base), 1);
  assert.equal(wasm.isaac_pm_death_player_eligible_pack(base + DEATH_PLAYER_SIZE), 0);
  assert.equal(wasm.isaac_pm_death_player_eligible_pack(base + 2 * DEATH_PLAYER_SIZE), 0);
  assert.equal(wasm.isaac_pm_death_eligible_count(base, 3), 1);
  assert.equal(wasm.isaac_pm_death_eligible_mask(base, 3), 0b001);
  /* plan_from_players */
  const plan = SCRATCH + 0x400;
  wasm.isaac_pm_death_plan_from_players(0, 0, base, 3, plan);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.kind), PM_DEATH_RESIDUAL_WALK);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.pure), 0); /* WALK needs the host */
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.host), 1);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.walkGate), 1);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.pm1), 1);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.eligibleCount), 1);
  assert.equal(readU32(view, plan + DEATH_PLAN_OFF.mask), 0b001);
  assert.equal(readU32(view, plan + DEATH_PLAN_OFF.triggerVa), PM_DEATH_HOST_VA_TRIGGER_DEATH);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.triggerArg), 0);
  /* closed gates -> NONE: no PM1 body runs, so the plan is pure-complete. */
  wasm.isaac_pm_death_plan_from_players(1, 0, base, 3, plan);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.kind), PM_DEATH_RESIDUAL_NONE);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.pure), 1);
  /* wire_decide mono */
  wasm.isaac_pm_death_wire_decide(0, 0, 2, 0, base, 3, plan);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.kind), PM_DEATH_RESIDUAL_MONOLITHIC);
  /* wire_decide walk */
  wasm.isaac_pm_death_wire_decide(0, 0, 3, 1, base, 3, plan);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.kind), PM_DEATH_RESIDUAL_WALK);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.eligibleCount), 1);
  /* wire_decide empty -> NONE pure */
  wasm.isaac_pm_death_wire_decide(0, 0, 0, 1, base, 3, plan);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.kind), PM_DEATH_RESIDUAL_NONE);
  assert.equal(readI32(view, plan + DEATH_PLAN_OFF.pure), 1);
});

test("Wasm matches JS: eligible / clamp / contrib", () => {
  const wide = [0, 1, 0xff, 0x100, 0xffffffff];
  for (const w of wide) {
    assert.equal(
      wasm.isaac_pm_intensity_player_eligible(5, 0, w >>> 0) !== 0,
      pmIntensityPlayerEligible(5, 0, w),
      `elig ${w}`,
    );
    assert.equal(
      Math.fround(wasm.isaac_pm_intensity_player_contrib(5, 0, w >>> 0)),
      pmIntensityPlayerContrib(5, 0, w),
      `contrib ${w}`,
    );
  }
  assert.equal(wasm.isaac_pm_intensity_player_eligible(5, 0, 0x100), 1);
  for (const raw of [0, 5, 7, 10, 20, 40, -5, 0x7fffffff, 0x80000000]) {
    assert.equal(
      Math.fround(wasm.isaac_pm_intensity_clamp_raw(raw | 0)),
      pmIntensityClampRaw(raw),
      `clamp ${raw}`,
    );
  }
});

test("Wasm matches JS: max_over_players struct pack", () => {
  const view = new DataView(wasm.memory.buffer);
  const base = SCRATCH;
  const players = [
    { raw: 10, flags: 0, dead: 0 },
    { raw: 30, flags: 0, dead: 0 },
    { raw: 5, flags: 0x40, dead: 0 },
  ];
  for (let i = 0; i < players.length; i += 1) {
    const off = base + i * PLAYER_SIZE;
    writeI32(view, off + PLAYER_OFF.raw, players[i].raw);
    writeU32(view, off + PLAYER_OFF.flags, players[i].flags);
    writeU8(view, off + PLAYER_OFF.dead, players[i].dead);
  }
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_players(base, 3)), 1);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_players(base, 0)), 0);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_players(base, 1)), 0.5);
});

test("Wasm matches JS: max_over_arrays", () => {
  const view = new DataView(wasm.memory.buffer);
  const base = SCRATCH;
  const raw = base;
  const flags = base + 0x40;
  const dead = base + 0x80;
  writeI32(view, raw + 0, 10);
  writeI32(view, raw + 4, 20);
  writeI32(view, raw + 8, 5);
  writeU32(view, flags + 0, 0);
  writeU32(view, flags + 4, 0);
  writeU32(view, flags + 8, 0x40);
  writeU8(view, dead + 0, 0);
  writeU8(view, dead + 1, 0);
  writeU8(view, dead + 2, 0);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_arrays(raw, flags, dead, 3)), 1);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_arrays(raw, flags, dead, 1)), 0.5);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_max_over_arrays(raw, flags, dead, 0)), 0);
});

test("Wasm matches JS: plan_from_players + residual kinds", () => {
  const view = new DataView(wasm.memory.buffer);
  const base = SCRATCH;
  const plan = SCRATCH + 0x200;
  writeI32(view, base + PLAYER_OFF.raw, 10);
  writeU32(view, base + PLAYER_OFF.flags, 0);
  writeU8(view, base + PLAYER_OFF.dead, 0);
  wasm.isaac_pm_intensity_plan_from_players(base, 1, plan);
  assert.equal(readF32(view, plan + PLAN_OFF.maxVol), 0.5);
  assert.equal(readI32(view, plan + PLAN_OFF.start), 1);
  assert.equal(readI32(view, plan + PLAN_OFF.stop), 0);
  writeI32(view, base + PLAYER_OFF.raw, 0);
  wasm.isaac_pm_intensity_plan_from_players(base, 1, plan);
  assert.equal(readF32(view, plan + PLAN_OFF.maxVol), 0);
  assert.equal(readI32(view, plan + PLAN_OFF.start), 0);
  assert.equal(readI32(view, plan + PLAN_OFF.stop), 1);
  /* residual kinds */
  assert.equal(wasm.isaac_pm_intensity_sfx_start_needed(0), 0);
  assert.equal(wasm.isaac_pm_intensity_sfx_start_needed(1), 1);
  assert.equal(wasm.isaac_pm_intensity_sfx_stop_candidate(0), 1);
  assert.equal(wasm.isaac_pm_intensity_sfx_residual_kind(1, 0), PM_INTENSITY_SFX_RESIDUAL_PLAY);
  assert.equal(wasm.isaac_pm_intensity_sfx_residual_kind(1, 1), PM_INTENSITY_SFX_RESIDUAL_UPDATE);
  assert.equal(wasm.isaac_pm_intensity_sfx_residual_kind(0, 1), PM_INTENSITY_SFX_RESIDUAL_STOP);
  assert.equal(wasm.isaac_pm_intensity_sfx_residual_kind(0, 0), PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(wasm.isaac_pm_intensity_heartbeat_pure_complete(0, 0), 1);
  assert.equal(wasm.isaac_pm_intensity_heartbeat_pure_complete(1, 0), 0);
});

test("Wasm matches JS: heartbeat_plan layout + host imms", () => {
  const view = new DataView(wasm.memory.buffer);
  const plan = SCRATCH;
  wasm.isaac_pm_intensity_heartbeat_plan(1, 1, plan);
  assert.equal(readF32(view, plan + HB_OFF.maxVol), 1);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_UPDATE);
  assert.equal(readI32(view, plan + HB_OFF.pure), 0);
  assert.equal(readI32(view, plan + HB_OFF.host), 1);
  assert.equal(readI32(view, plan + HB_OFF.pm2), 1);
  assert.equal(readU32(view, plan + HB_OFF.sfxId), PM_INTENSITY_SFX_ID);
  assert.equal(readI32(view, plan + HB_OFF.frameDelay), 2);
  assert.equal(readI32(view, plan + HB_OFF.loop), 1);
  assert.equal(readF32(view, plan + HB_OFF.pitch), 1);
  assert.equal(readF32(view, plan + HB_OFF.pan), 0);
  wasm.isaac_pm_intensity_heartbeat_plan(0, 0, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(readI32(view, plan + HB_OFF.pure), 1);
  assert.equal(readI32(view, plan + HB_OFF.host), 0);
  wasm.isaac_pm_intensity_heartbeat_plan(0, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_STOP);
  /* host imm accessors */
  assert.equal(wasm.isaac_pm_intensity_sfx_id(), PM_INTENSITY_SFX_ID);
  assert.equal(wasm.isaac_pm_intensity_play_frame_delay(), 2);
  assert.equal(wasm.isaac_pm_intensity_play_loop(), 1);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_play_pitch()), 1);
  assert.equal(Math.fround(wasm.isaac_pm_intensity_play_pan()), 0);
});

test("Wasm matches JS: wire_decide empty/blob/monolithic", () => {
  const view = new DataView(wasm.memory.buffer);
  const plan = SCRATCH;
  const base = SCRATCH + 0x100;
  writeI32(view, base + PLAYER_OFF.raw, 20);
  writeU32(view, base + PLAYER_OFF.flags, 0);
  writeU8(view, base + PLAYER_OFF.dead, 0);
  /* count 0 -> NONE pure */
  wasm.isaac_pm_intensity_wire_decide(0, 1, 0, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_NONE);
  assert.equal(readI32(view, plan + HB_OFF.pure), 1);
  /* no blob -> MONOLITHIC */
  wasm.isaac_pm_intensity_wire_decide(1, 0, 0, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  assert.equal(readI32(view, plan + HB_OFF.pm2), 0);
  /* count > MAX -> MONOLITHIC */
  wasm.isaac_pm_intensity_wire_decide(9, 1, 0, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  /* pack shorter than count -> MONOLITHIC */
  wasm.isaac_pm_intensity_wire_decide(2, 1, 0, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC);
  /* full pack -> PLAY with maxVol 1 */
  wasm.isaac_pm_intensity_wire_decide(1, 1, 0, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_PLAY);
  assert.equal(readF32(view, plan + HB_OFF.maxVol), 1);
  /* sfx playing -> UPDATE */
  wasm.isaac_pm_intensity_wire_decide(1, 1, 1, base, 1, plan);
  assert.equal(readI32(view, plan + HB_OFF.kind), PM_INTENSITY_SFX_RESIDUAL_UPDATE);
});

test("Wasm matches JS: SFX pure gates + id", () => {
  assert.equal(wasm.isaac_pm_sfx_entry_count_from_span(0x1b8 * 3), 3);
  assert.equal(wasm.isaac_pm_sfx_entry_byte_offset(3), 0x1b8 * 3);
  assert.equal(wasm.isaac_pm_sfx_entry_index_in_range(0, 0x1b8), 1);
  assert.equal(wasm.isaac_pm_sfx_entry_index_in_range(1, 0x1b8), 0);
  assert.equal(wasm.isaac_pm_sfx_entry_gate(0, 0x1b8, 1, 1), PM_SFX_GATE_LIVE);
  assert.equal(wasm.isaac_pm_sfx_entry_gate(1, 0x1b8, 1, 1), PM_SFX_GATE_MISS);
  assert.equal(wasm.isaac_pm_sfx_entry_gate(0, 0x1b8, 0, 1), PM_SFX_GATE_NO_SAMPLES);
  assert.equal(wasm.isaac_pm_sfx_entry_gate(0, 0x1b8, 1, 0), PM_SFX_GATE_DISABLED);
  assert.equal(wasm.isaac_pm_sfx_is_playing_known(PM_SFX_GATE_MISS), 1);
  assert.equal(wasm.isaac_pm_sfx_is_playing_known(PM_SFX_GATE_LIVE), 0);
  assert.equal(wasm.isaac_pm_sfx_is_playing_pure_result(PM_SFX_GATE_MISS), 0);
  assert.equal(wasm.isaac_pm_sfx_mutator_pure_complete(PM_SFX_GATE_MISS), 1);
  assert.equal(wasm.isaac_pm_sfx_mutator_pure_complete(PM_SFX_GATE_LIVE), 0);
  assert.equal(wasm.isaac_pm_sfx_manager_receiver(0x00c7169c), 0x00c7169c + PM_SFX_MANAGER_OFF);
  assert.equal(wasm.isaac_pm_pre_play_sound_id(0, 1, 4, 2, 7, 7), PM_PRE_PLAY_ID_RARE);
  assert.equal(wasm.isaac_pm_pre_play_sound_id(0, 1, 1, 2, 7, 7), PM_PRE_PLAY_ID_FOUND);
  assert.equal(wasm.isaac_pm_pre_play_sound_id(1, 1, 1, 2, 7, 7), PM_PRE_PLAY_ID_DEFAULT);
  assert.equal(wasm.isaac_pm_intensity_play_id(0, 1, 1, 2, 7, 7), PM_PRE_PLAY_ID_FOUND);
});

test("deterministic randomized differential corpus", (t) => {
  let seed = 0x9bb5d0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  for (let trial = 0; trial < 400; trial += 1) {
    const raw = rnd() | 0;
    const flags = rnd() >>> 0;
    const dead = pick(4) === 0 ? 0x100 : pick(2);
    assert.equal(wasm.isaac_pm_intensity_player_eligible(raw, flags, dead >>> 0) !== 0,
      pmIntensityPlayerEligible(raw, flags, dead));
    assert.equal(
      Math.fround(wasm.isaac_pm_intensity_player_contrib(raw, flags, dead >>> 0)),
      pmIntensityPlayerContrib(raw, flags, dead),
    );
    const g1 = rnd() | 0;
    const g2 = rnd() | 0;
    assert.equal(wasm.isaac_pm_death_dual_zero_gate(g1, g2) !== 0,
      pmDeathDualZeroGate(g1, g2));
    const a7c = rnd() | 0;
    const a8c = pick(4) === 0 ? 0x100 : (rnd() & 0xff);
    const tn = pick(3);
    const ta7c = rnd() | 0;
    const ta8c = pick(4) === 0 ? 0x100 : (rnd() & 0xff);
    assert.equal(
      wasm.isaac_pm_death_player_eligible(dead >>> 0, a7c, a8c >>> 0, tn >>> 0, ta7c, ta8c >>> 0) !== 0,
      pmDeathPlayerEligible(dead, a7c, a8c, tn, ta7c, ta8c),
    );
    assert.equal(
      Math.fround(wasm.isaac_pm_intensity_clamp_raw(raw)),
      pmIntensityClampRaw(raw),
    );
    const maxV = (raw > 0 ? 1 : 0);
    const playing = pick(2);
    assert.equal(
      wasm.isaac_pm_intensity_sfx_residual_kind(maxV, playing),
      pmIntensitySfxResidualKind(maxV, playing),
    );
    assert.equal(
      wasm.isaac_pm_intensity_heartbeat_pure_complete(maxV, playing) !== 0,
      pmIntensityHeartbeatPureComplete(maxV, playing),
    );
    const sp = rnd() | 0;
    const eo = rnd() | 0;
    const vc = rnd() >>> 0;
    const en = rnd() >>> 0;
    assert.equal(
      wasm.isaac_pm_sfx_entry_gate(sp, eo, vc, en),
      pmSfxEntryGate(sp, eo, vc, en),
    );
    assert.equal(
      wasm.isaac_pm_sfx_entry_count_from_span(sp),
      pmSfxEntryCountFromSpan(sp),
    );
    const se = rnd() >>> 0;
    const s1 = rnd() >>> 0;
    const s2 = rnd() >>> 0;
    const s3 = rnd() >>> 0;
    assert.equal(
      wasm.isaac_pm_pre_play_rng_next(se, s1, s2, s3) >>> 0,
      pmPrePlayRngNext(se, s1, s2, s3),
    );
    cases += 10;
  }
  t.diagnostic(`main randomized differential cases: ${cases}`);
  assert.ok(cases >= 4000, `expected >= 4000 cases, got ${cases}`);
});

test("deterministic randomized differential corpus: PMW / PMS / PMP", (t) => {
  let seed = 0x956780 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  for (let trial = 0; trial < 300; trial += 1) {
    const span = rnd() | 0;
    assert.equal(wasm.isaac_pm_player_count_from_span(span),
      pmPlayerCountFromSpan(span));
    assert.equal(wasm.isaac_pm_walk_enter(span) !== 0, pmWalkEnter(span));
    assert.equal(wasm.isaac_pm_walk_needs_empty_fatal(span) !== 0,
      pmWalkNeedsEmptyFatal(span));
    const idx = rnd() >>> 0;
    const cnt = rnd() | 0;
    assert.equal(wasm.isaac_pm_player_index_select(idx, cnt),
      pmPlayerIndexSelect(idx, cnt));
    assert.equal(wasm.isaac_pm_walk_continue(idx, cnt) !== 0,
      pmWalkContinue(idx, cnt));
    const id = rnd() | 0;
    assert.equal(wasm.isaac_pm_sfx_entry_byte_offset(id),
      pmSfxEntryByteOffset(id));
    assert.equal(wasm.isaac_pm_sfx_entry_index_in_range(id, span) !== 0,
      pmSfxEntryIndexInRange(id, span));
    const vc = rnd() >>> 0;
    const en = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_sfx_entry_gate(id, span, vc, en),
      pmSfxEntryGate(id, span, vc, en));
    const se = rnd() >>> 0;
    const g = pick(2);
    const ef = pick(2);
    assert.equal(
      wasm.isaac_pm_pre_play_sound_id(g, ef, se, 2, 7, 7),
      pmPrePlaySoundId({ gameNull: g, entryFound: ef, seed: se }),
    );
    const next = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_pre_play_rare_hit(next) !== 0,
      pmPrePlayRareHit(next));
    cases += 11;
  }
  t.diagnostic(`PMW/PMS/PMP randomized differential cases: ${cases}`);
  assert.ok(cases >= 3000, `expected >= 3000 cases, got ${cases}`);
});

/* ====================================================================== */
/* v7: revive-item cascade (probes + 10-stage table).                     */
/* ====================================================================== */

test("header documents v7 revive-item cascade", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x007a12d4/);   /* stage 0 body */
  assert.match(h, /0x007a1bbd/);   /* stage 9 path split */
  assert.match(h, /0x007a1c47/);   /* post-cascade tail */
  assert.match(h, /0x0b/);
  assert.match(h, /0x2b0/);
  assert.match(h, /0x14c/);
  assert.match(h, /0x26b/);
  assert.match(h, /0x29b/);
  assert.match(h, /0x009305f0/);   /* TemporaryEffects HasCollectibleEffect */
  assert.match(h, /0x00930/);
  assert.match(h, /0x1c/);
  assert.match(h, /0x137/);
  assert.match(h, /stage 9/);
  assert.match(h, /path.split|path split|STAGE17/i);
  assert.equal(PM_TD_CASCADE_STAGES, 10);
  assert.equal(PM_TD_CASCADE_CHAR_TYPE_MATCH, 8);
  assert.equal(PM_TD_STAGE17_ACCEPT_VALUE, 0xd);
  assert.equal(PM_TD_STAGE17_MGR_8_MATCH, 2);
  assert.equal(PM_TD_STAGE17_RESULT_HOST, 0);
  assert.equal(PM_TD_STAGE17_RESULT_TRUE, 1);
  assert.equal(PM_TD_STAGE17_RESULT_FALSE, 2);
});

test("JS oracle: probe A / probe B per-player rules", () => {
  /* probe A: has_collectible low byte decides. */
  assert.equal(pmTdProbeAPlayerMatch(1), true);
  assert.equal(pmTdProbeAPlayerMatch(0), false);
  assert.equal(pmTdProbeAPlayerMatch(0x100), false);
  assert.equal(pmTdProbeAPlayerMatch(0xff), true);
  assert.equal(pmTdProbeAScan([1, 0, 0]), 0);
  assert.equal(pmTdProbeAScan([0, 0, 1]), 2);
  assert.equal(pmTdProbeAScan([0, 0, 0]), -1);
  assert.equal(pmTdProbeAScan(null), -1);
  /* probe B paths. */
  assert.equal(pmTdProbeBPath(0, 0, 0), PM_TD_PROBE_B_PATH_COUNT_GT0);
  assert.equal(pmTdProbeBPath(5, 5, 0), PM_TD_PROBE_B_PATH_COUNT_GT1);
  assert.equal(pmTdProbeBPath(5, 5, 1), PM_TD_PROBE_B_PATH_IMMEDIATE);
  assert.equal(pmTdProbeBPath(5, 6, 0), PM_TD_PROBE_B_PATH_COUNT_GT0);
  assert.equal(pmTdProbeBNeedsCountProbe(PM_TD_PROBE_B_PATH_IMMEDIATE), false);
  assert.equal(pmTdProbeBNeedsCountProbe(PM_TD_PROBE_B_PATH_COUNT_GT1), true);
  assert.equal(pmTdProbeBNeedsCountProbe(PM_TD_PROBE_B_PATH_COUNT_GT0), true);
  assert.equal(pmTdProbeBPlayerMatch(PM_TD_PROBE_B_PATH_IMMEDIATE, 0), true);
  assert.equal(pmTdProbeBPlayerMatch(PM_TD_PROBE_B_PATH_COUNT_GT1, 1), false);
  assert.equal(pmTdProbeBPlayerMatch(PM_TD_PROBE_B_PATH_COUNT_GT1, 2), true);
  assert.equal(pmTdProbeBPlayerMatch(PM_TD_PROBE_B_PATH_COUNT_GT0, 0), false);
  assert.equal(pmTdProbeBPlayerMatch(PM_TD_PROBE_B_PATH_COUNT_GT0, 1), true);
  /* probe B scan: first player whose path+count matches. */
  assert.equal(pmTdProbeBScan([
    { pending: 0, flag: 0, count: 0 },
    { pending: 5, flag: 0, count: 2 },
    { pending: 5, flag: 1, count: 0 },
  ], 5), 1);
  assert.equal(pmTdProbeBScan([
    { pending: 5, flag: 1, count: 0 },
    { pending: 0, flag: 0, count: 0 },
  ], 5), 0);
  assert.equal(pmTdProbeBScan([], 5), -1);
});

test("JS oracle: cascade table + stage guards + stage 9 split", () => {
  assert.equal(pmTdCascadeStageCount(), 10);
  /* PE order of the 10 ids. */
  assert.deepEqual(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => pmTdCascadeStageId(i)),
    [0x0b, 0x00, 0x51, 0x2b0, 0xd4, 0x14c, 0xa1, 0x1c, 0x137, 0x17],
  );
  assert.equal(pmTdCascadeStageId(-1), -1);
  assert.equal(pmTdCascadeStageId(10), -1);
  /* stage 9 is the only stage17-guarded entry. */
  assert.equal(pmTdCascadeGuardKind(9), PM_TD_GUARD_STAGE17);
  assert.equal(pmTdCascadeGuardKind(0), PM_TD_GUARD_NONE);
  assert.equal(pmTdCascadeGuardKind(1), PM_TD_GUARD_CHAR_TYPE);
  assert.equal(pmTdCascadeGuardKind(4), PM_TD_GUARD_RNG_BIT);
  /* probe kinds. */
  assert.equal(pmTdCascadeProbeKind(0), PM_TD_PROBE_KIND_A);
  assert.equal(pmTdCascadeProbeKind(1), PM_TD_PROBE_KIND_NONE);
  assert.equal(pmTdCascadeProbeKind(7), PM_TD_PROBE_KIND_B);
  assert.equal(pmTdCascadeProbeKind(9), PM_TD_PROBE_KIND_B);
  /* stage bodies. */
  assert.equal(pmTdCascadeStageVa(0), 0x007a12d4);
  assert.equal(pmTdCascadeStageVa(9), 0x007a1ba9);
  /* first match in PE order. */
  assert.equal(pmTdCascadeFirstMatch([0, 1, 0, 1]), 1);
  assert.equal(pmTdCascadeFirstMatch([1, 0, 0]), 0);
  assert.equal(pmTdCascadeFirstMatch([0, 0, 0]), -1);
  assert.equal(pmTdCascadeFirstMatch([]), -1);
  assert.equal(pmTdCascadeFirstMatch(null), -1);
  /* stage 4 guard: RNG first byte bit 0. */
  assert.equal(pmTdStageD4Guard(1), true);
  assert.equal(pmTdStageD4Guard(2), false);
  assert.equal(pmTdStageD4Guard(0x100), false);  /* low byte 0 */
  assert.equal(pmTdStageD4Guard(0xff), true);
  /* stage 7 value select: count1==1 -> 0x16; count2==2 -> 0x21; else 0x32. */
  assert.equal(pmTdStage1cValue(1, 0), 0x16);
  assert.equal(pmTdStage1cValue(2, 2), 0x21);
  assert.equal(pmTdStage1cValue(2, 3), 0x32);
  assert.equal(pmTdStage1cValue(2, 1), 0x32);
  assert.equal(pmTdStage1cSecondProbeNeeded(1), false);
  assert.equal(pmTdStage1cSecondProbeNeeded(2), true);
  /* stage 9 path split. */
  assert.equal(pmTdStage17Path(1, 0, 0, 0, 0), PM_TD_STAGE17_PATH_X);
  assert.equal(pmTdStage17Path(0, 1, 0, 0, 0), PM_TD_STAGE17_PATH_Y);
  assert.equal(pmTdStage17Path(0, 2, 0, 0, 0), PM_TD_STAGE17_PATH_Y);
  assert.equal(pmTdStage17Path(0, 2, 0x100, 0, 0), PM_TD_STAGE17_PATH_Y);
  assert.equal(pmTdStage17Path(0, 2, 0x100, 1, 0), PM_TD_STAGE17_PATH_X);
  assert.equal(pmTdStage17Path(0, 2, 0x100, 0, 1), PM_TD_STAGE17_PATH_X);
  assert.equal(pmTdStage17Path(0, 2, 0x100, 0, 0), PM_TD_STAGE17_PATH_Y);
  /* stage 9 outcomes. */
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_X, 0, 0), PM_TD_STAGE17_RESULT_HOST);
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_X, 1, 0), PM_TD_STAGE17_RESULT_TRUE);
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_Y, 0, 0), PM_TD_STAGE17_RESULT_HOST);
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_Y, 1, 0xd), PM_TD_STAGE17_RESULT_TRUE);
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_Y, 1, 0xc), PM_TD_STAGE17_RESULT_FALSE);
  assert.equal(pmTdStage17Result(PM_TD_STAGE17_PATH_Y, 0x100, 0xd), PM_TD_STAGE17_RESULT_HOST);
  /* 0x100 & 0xff == 0: not checkOnly on the wide slot, so the stage stays host. */
  /* every matched stage except stage 9 returns true under checkOnly. */
  for (let i = 0; i < 10; i += 1) {
    assert.equal(pmTdCascadeCheckOnlyReturnsTrue(i), i !== 9);
  }
});

test("Wasm matches JS: v7 cascade + probes", (t) => {
  const view = new DataView(wasm.memory.buffer);
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xffffffff];
  let cases = 0;
  for (const w of wide) {
    assert.equal(wasm.isaac_pm_td_probe_a_player_match(w >>> 0) !== 0,
      pmTdProbeAPlayerMatch(w), `probeA ${w}`);
    assert.equal(wasm.isaac_pm_td_probe_b_path(0, 0, w >>> 0),
      pmTdProbeBPath(0, 0, w), `probeB path ${w}`);
    assert.equal(wasm.isaac_pm_td_probe_b_path(5, 5, w >>> 0),
      pmTdProbeBPath(5, 5, w), `probeB flag ${w}`);
    assert.equal(wasm.isaac_pm_td_stage_d4_guard(w >>> 0) !== 0,
      pmTdStageD4Guard(w), `d4 ${w}`);
    assert.equal(wasm.isaac_pm_td_stage17_path(w >>> 0, 2, 0x100, 0, 0),
      pmTdStage17Path(w, 2, 0x100, 0, 0), `stage17 path ${w}`);
    assert.equal(wasm.isaac_pm_td_stage17_result(1, w >>> 0, 0),
      pmTdStage17Result(1, w, 0), `stage17 co ${w}`);
    cases += 6;
  }
  /* stage descriptors cross-checked against the model table. */
  for (let i = -1; i <= 10; i += 1) {
    assert.equal(wasm.isaac_pm_td_cascade_stage_count(), 10);
    assert.equal(wasm.isaac_pm_td_cascade_stage_id(i | 0),
      pmTdCascadeStageId(i));
    assert.equal(wasm.isaac_pm_td_cascade_probe_kind(i | 0),
      pmTdCascadeProbeKind(i));
    assert.equal(wasm.isaac_pm_td_cascade_guard_kind(i | 0),
      pmTdCascadeGuardKind(i));
    assert.equal(wasm.isaac_pm_td_cascade_stage_va(i | 0) >>> 0,
      pmTdCascadeStageVa(i) >>> 0);
    assert.equal(wasm.isaac_pm_td_cascade_check_only_returns_true(i | 0) !== 0,
      pmTdCascadeCheckOnlyReturnsTrue(i));
    cases += 5;
  }
  /* first_match through memory. */
  const matched = SCRATCH;
  writeU8(view, matched + 0, 0);
  writeU8(view, matched + 1, 1);
  writeU8(view, matched + 2, 0);
  assert.equal(wasm.isaac_pm_td_cascade_first_match(matched, 3), 1);
  writeU8(view, matched + 1, 0);
  assert.equal(wasm.isaac_pm_td_cascade_first_match(matched, 3), -1);
  /* probe A scan through memory. */
  const flags = SCRATCH + 0x10;
  writeU8(view, flags + 0, 0);
  writeU8(view, flags + 1, 0);
  writeU8(view, flags + 2, 1);
  assert.equal(wasm.isaac_pm_td_probe_a_scan(flags, 3), 2);
  writeU8(view, flags + 2, 0);
  assert.equal(wasm.isaac_pm_td_probe_a_scan(flags, 3), -1);
  /* probe B scan through memory. */
  const pending = SCRATCH + 0x20;
  const pflag = SCRATCH + 0x30;
  const counts = SCRATCH + 0x40;
  writeI32(view, pending + 0, 0);
  writeI32(view, pending + 4, 5);
  writeU8(view, pflag + 0, 0);
  writeU8(view, pflag + 1, 0);
  writeI32(view, counts + 0, 0);
  writeI32(view, counts + 4, 2);
  assert.equal(wasm.isaac_pm_td_probe_b_scan(pending, pflag, counts, 5, 2), 1);
  writeI32(view, counts + 4, 1);
  assert.equal(wasm.isaac_pm_td_probe_b_scan(pending, pflag, counts, 5, 2), -1);
  /* stage 7 value select. */
  assert.equal(wasm.isaac_pm_td_stage_1c_value(1, 0), 0x16);
  assert.equal(wasm.isaac_pm_td_stage_1c_value(2, 2), 0x21);
  assert.equal(wasm.isaac_pm_td_stage_1c_value(2, 3), 0x32);
  assert.equal(wasm.isaac_pm_td_stage_1c_second_probe_needed(1), 0);
  assert.equal(wasm.isaac_pm_td_stage_1c_second_probe_needed(2), 1);
  cases += 6;

  t.diagnostic(`v7 fixed differential cases executed: ${cases}`);
  v7Cases += cases;
  assert.ok(cases >= 60, `expected >= 60 executed cases, got ${cases}`);
});

test("deterministic randomized differential corpus: v7 cascade", (t) => {
  let seed = 0x7a12d4 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const hc = pick(4) === 0 ? 0x100 : pick(2);
    assert.equal(wasm.isaac_pm_td_probe_a_player_match(hc >>> 0) !== 0,
      pmTdProbeAPlayerMatch(hc));
    const pend = rnd() | 0;
    const id = rnd() | 0;
    const pflag = pick(4) === 0 ? 0x100 : pick(2);
    const path = wasm.isaac_pm_td_probe_b_path(pend, id, pflag >>> 0);
    assert.equal(path, pmTdProbeBPath(pend, id, pflag));
    const cnt = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_probe_b_player_match(path, cnt) !== 0,
      pmTdProbeBPlayerMatch(path, cnt));
    const rb = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_td_stage_d4_guard(rb) !== 0,
      pmTdStageD4Guard(rb));
    const c1 = rnd() | 0;
    const c2 = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_stage_1c_value(c1, c2),
      pmTdStage1cValue(c1, c2));
    assert.equal(wasm.isaac_pm_td_stage_1c_second_probe_needed(c1) !== 0,
      pmTdStage1cSecondProbeNeeded(c1));
    const m9e = rnd() >>> 0;
    const m8 = rnd() | 0;
    const gp = rnd() >>> 0;
    const g26 = rnd() >>> 0;
    const g58 = rnd() >>> 0;
    const p17 = wasm.isaac_pm_td_stage17_path(m9e, m8, gp, g26, g58);
    assert.equal(p17, pmTdStage17Path(m9e, m8, gp, g26, g58));
    const co = pick(4) === 0 ? 0x100 : pick(2);
    const f8 = rnd() | 0;
    assert.equal(wasm.isaac_pm_td_stage17_result(p17, co >>> 0, f8),
      pmTdStage17Result(p17, co, f8));
    const stage = pick(10);
    assert.equal(wasm.isaac_pm_td_cascade_stage_id(stage),
      pmTdCascadeStageId(stage));
    cases += 10;
  }
  t.diagnostic(`v7 randomized differential cases executed: ${cases}`);
  v7Cases += cases;
  t.diagnostic(`v7 total differential cases executed: ${v7Cases}`);
  assert.ok(cases >= 5000, `expected >= 5000 executed cases, got ${cases}`);
});

/* ====================================================================== */
/* v8: RVH head classifier at 0x007a23a0.                                 */
/* ====================================================================== */

test("header documents v8 RVH head classifier at 0x007a23a0", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x007a23a0/);
  assert.match(h, /0x007a2a32/);   /* default body */
  assert.match(h, /0x007a2a11/);   /* high region */
  assert.match(h, /0x007a28e9/);   /* id == 0x137 */
  assert.match(h, /0x007a2456/);   /* case 0 */
  assert.match(h, /0x007a25e3/);   /* case 1 */
  assert.match(h, /0x007a2811/);   /* case 2 */
  assert.match(h, /0x007a26e4/);   /* case 3 */
  assert.match(h, /0x0b/);
  assert.match(h, /0x51/);
  assert.match(h, /0xa1/);
  assert.match(h, /0xd4/);
  assert.match(h, /0x14c/);
  assert.match(h, /0x26b/);
  assert.match(h, /0x2b0/);
  assert.match(h, /0x137/);
  assert.equal(PM_TD_RVH_TABLE_BIAS, 0xb);
  assert.equal(PM_TD_RVH_TABLE_LIMIT, 0xc9);
  assert.equal(PM_TD_RVH_ID_HIGH_BOUND, 0x137);
  assert.equal(PM_TD_RVH_VA_EQ137, 0x007a28e9);
  assert.equal(PM_TD_RVH_VA_HIGH, 0x007a2a11);
  assert.equal(PM_TD_RVH_VA_DEFAULT, 0x007a2a32);
  assert.equal(PM_TD_RVH_CHAIN_FIELD8_MATCH, 0x10);
  assert.equal(PM_TD_RVH_CHAIN_FIELD0_MATCH, 0x23);
});

test("JS oracle: RVH region / table / dispatch (v8)", () => {
  assert.equal(pmTdRvhRegion(0xb), PM_TD_RVH_REGION_TABLE);
  assert.equal(pmTdRvhRegion(0xd4), PM_TD_RVH_REGION_TABLE);
  assert.equal(pmTdRvhRegion(0xa), PM_TD_RVH_REGION_DEFAULT);
  assert.equal(pmTdRvhRegion(0x137), PM_TD_RVH_REGION_EQ137);
  assert.equal(pmTdRvhRegion(0x138), PM_TD_RVH_REGION_HIGH);
  assert.equal(pmTdRvhRegion(0x7fffffff), PM_TD_RVH_REGION_HIGH);
  assert.equal(pmTdRvhRegion(-1), PM_TD_RVH_REGION_DEFAULT);
  assert.equal(pmTdRvhTableIndex(0xb), 0);
  assert.equal(pmTdRvhTableIndex(0xd4), 0xc9);
  assert.equal(pmTdRvhTableIndex(0xa), -1);
  assert.equal(pmTdRvhTableIndex(0x138), -1);
  assert.equal(pmTdRvhTableCase(0xb), 0);
  assert.equal(pmTdRvhTableCase(0x51), 1);
  assert.equal(pmTdRvhTableCase(0xa1), 2);
  assert.equal(pmTdRvhTableCase(0xd4), 3);
  assert.equal(pmTdRvhTableCase(0x10), PM_TD_RVH_TABLE_CASE_DEFAULT);
  assert.equal(pmTdRvhTableCase(0x138), -1);
  /* dispatch. */
  assert.equal(pmTdRvhDispatchVa(0xb), 0x007a2456);
  assert.equal(pmTdRvhDispatchVa(0x51), 0x007a25e3);
  assert.equal(pmTdRvhDispatchVa(0xa1), 0x007a2811);
  assert.equal(pmTdRvhDispatchVa(0xd4), 0x007a26e4);
  assert.equal(pmTdRvhDispatchVa(0x10), 0x007a2a32);
  assert.equal(pmTdRvhDispatchVa(0x137), 0x007a28e9);
  assert.equal(pmTdRvhDispatchVa(0x14c), 0x007a30a6);
  assert.equal(pmTdRvhDispatchVa(0x26b), 0x007a2eeb);
  assert.equal(pmTdRvhDispatchVa(0x2b0), 0x007a2ab7);
  assert.equal(pmTdRvhDispatchVa(0x138), 0x007a2a32);
  assert.equal(pmTdRvhDispatchVa(0x200), 0x007a2a32);
  assert.equal(pmTdRvhDispatchVa(0), 0x007a2a32);
  assert.equal(pmTdRvhIsDefault(0x10), true);
  assert.equal(pmTdRvhIsDefault(0xb), false);
  assert.equal(pmTdRvhIsDefault(0x2b0), false);
  /* region -> continuation VA (fixed for the three non-table regions). */
  assert.equal(pmTdRvhRegionVa(PM_TD_RVH_REGION_EQ137), 0x007a28e9);
  assert.equal(pmTdRvhRegionVa(PM_TD_RVH_REGION_HIGH), 0x007a2a11);
  assert.equal(pmTdRvhRegionVa(PM_TD_RVH_REGION_DEFAULT), 0x007a2a32);
  assert.equal(pmTdRvhRegionVa(PM_TD_RVH_REGION_TABLE), 0);
  /* revive gate + chain flag. */
  assert.equal(pmTdRvhReviveCalled(0), true);
  assert.equal(pmTdRvhReviveCalled(-1), false);
  assert.equal(pmTdRvhReviveCalled(5), true);
  assert.equal(pmTdRvhChainFlag(0x100, 0x10, 0x23), true);
  assert.equal(pmTdRvhChainFlag(0, 0x10, 0x23), false);
  assert.equal(pmTdRvhChainFlag(0x100, 0x11, 0x23), false);
  assert.equal(pmTdRvhChainFlag(0x100, 0x10, 0x24), false);
});

test("Wasm matches JS: v8 RVH head classifier", (t) => {
  const ids = [
    0, 0xa, 0xb, 0x10, 0x51, 0xa1, 0xd4, 0x137, 0x138, 0x14c, 0x200,
    0x26b, 0x2b0, -1, 0x7fffffff, 0x80000000, 0xffffffff,
  ];
  let cases = 0;
  for (const id of ids) {
    assert.equal(wasm.isaac_pm_td_rvh_region(id | 0),
      pmTdRvhRegion(id), `region ${id}`);
    assert.equal(wasm.isaac_pm_td_rvh_table_index(id | 0),
      pmTdRvhTableIndex(id), `index ${id}`);
    assert.equal(wasm.isaac_pm_td_rvh_table_case(id | 0),
      pmTdRvhTableCase(id), `case ${id}`);
    assert.equal(wasm.isaac_pm_td_rvh_dispatch_va(id | 0) >>> 0,
      pmTdRvhDispatchVa(id) >>> 0, `dispatch ${id}`);
    assert.equal(wasm.isaac_pm_td_rvh_is_default(id | 0) !== 0,
      pmTdRvhIsDefault(id), `default ${id}`);
    cases += 5;
  }
  const regionVa = [
    [PM_TD_RVH_REGION_EQ137, 0x007a28e9],
    [PM_TD_RVH_REGION_HIGH, 0x007a2a11],
    [PM_TD_RVH_REGION_DEFAULT, 0x007a2a32],
    [PM_TD_RVH_REGION_TABLE, 0],
  ];
  for (const [region, want] of regionVa) {
    assert.equal(wasm.isaac_pm_td_rvh_region_va(region | 0) >>> 0, want >>> 0, `region va ${region}`);
    cases += 1;
  }
  const ords = [-2, -1, 0, 1, 0x7fffffff, 0x80000000];
  for (const o of ords) {
    assert.equal(wasm.isaac_pm_td_rvh_revive_called(o | 0) !== 0,
      pmTdRvhReviveCalled(o));
    cases += 1;
  }
  const chains = [
    [0x100, 0x10, 0x23, 1],
    [0, 0x10, 0x23, 0],
    [0x100, 0x11, 0x23, 0],
    [0x100, 0x10, 0x24, 0],
    [0xffffffff, 0x10, 0x23, 1],
  ];
  for (const [cp, c8, c0, want] of chains) {
    assert.equal(wasm.isaac_pm_td_rvh_chain_flag(cp >>> 0, c8 | 0, c0 | 0), want);
    assert.equal(wasm.isaac_pm_td_rvh_chain_flag(cp >>> 0, c8 | 0, c0 | 0) !== 0,
      pmTdRvhChainFlag(cp, c8, c0));
    cases += 2;
  }
  t.diagnostic(`v8 fixed differential cases executed: ${cases}`);
  v8Cases += cases;
  assert.ok(cases >= 80, `expected >= 80 executed cases, got ${cases}`);
});

test("deterministic randomized differential corpus: v8 RVH", (t) => {
  let seed = 0x7a23a0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* Draw from the HIGH bits: this LCG's low bits have period 2^k. */
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const boundary = [
    -0x80000000, -1, 0, 0xa, 0xb, 0x51, 0xa1, 0xd4, 0xd5, 0x136, 0x137,
    0x138, 0x14c, 0x26b, 0x2b0, 0x2b1, 0x7fffffff,
  ];
  const seenVas = new Set();
  const seenRegions = new Set();
  let cases = 0;

  for (let trial = 0; trial < 600; trial += 1) {
    const mode = pick(3);
    let id;
    if (mode === 0) {
      id = boundary[pick(boundary.length)];
    } else if (mode === 1) {
      /* Dense region around the table and HIGH chain. */
      id = pick(0x380) - 0x20;
    } else {
      id = rnd() | 0;
    }

    const region = wasm.isaac_pm_td_rvh_region(id | 0);
    assert.equal(region, pmTdRvhRegion(id), `rnd region ${trial}/${id}`);
    seenRegions.add(region);

    const idx = wasm.isaac_pm_td_rvh_table_index(id | 0);
    assert.equal(idx, pmTdRvhTableIndex(id), `rnd index ${trial}/${id}`);
    const tcase = wasm.isaac_pm_td_rvh_table_case(id | 0);
    assert.equal(tcase, pmTdRvhTableCase(id), `rnd case ${trial}/${id}`);
    const va = wasm.isaac_pm_td_rvh_dispatch_va(id | 0) >>> 0;
    assert.equal(va, pmTdRvhDispatchVa(id) >>> 0, `rnd dispatch ${trial}/${id}`);
    assert.equal(
      wasm.isaac_pm_td_rvh_is_default(id | 0) !== 0,
      pmTdRvhIsDefault(id),
      `rnd default ${trial}/${id}`,
    );
    seenVas.add(va);
    cases += 5;

    /* Cross-helper coherence on every draw. */
    assert.ok(RVH_ALL_TARGETS.includes(va), `rnd target ${trial}`);
    if (region === PM_TD_RVH_REGION_TABLE) {
      assert.ok(idx >= 0 && idx <= PM_TD_RVH_TABLE_LIMIT, `rnd idx range ${trial}`);
      assert.ok(tcase >= 0 && tcase <= 4, `rnd case range ${trial}`);
      assert.equal(va, RVH_VA_CASE[tcase] >>> 0, `rnd table va ${trial}`);
    } else {
      assert.equal(idx, -1, `rnd idx miss ${trial}`);
      assert.equal(tcase, -1, `rnd case miss ${trial}`);
    }
    if (region === PM_TD_RVH_REGION_EQ137) {
      assert.equal(va, PM_TD_RVH_VA_EQ137 >>> 0, `rnd eq va ${trial}`);
    }
    if (region === PM_TD_RVH_REGION_DEFAULT) {
      assert.equal(va, PM_TD_RVH_VA_DEFAULT >>> 0, `rnd def va ${trial}`);
    }
    if (region === PM_TD_RVH_REGION_HIGH) {
      const hit = PM_TD_RVH_HIGH_SPECIAL.get(id | 0);
      if (hit !== undefined) {
        assert.equal(va, hit >>> 0, `rnd high special ${trial}`);
      } else {
        assert.equal(va, PM_TD_RVH_VA_DEFAULT >>> 0, `rnd high default ${trial}`);
      }
    }
  }

  /* The whole table region must be covered across trials. */
  assert.ok(seenVas.size >= 5, `expected >= 5 distinct VAs, got ${seenVas.size}`);
  assert.equal(seenRegions.has(PM_TD_RVH_REGION_TABLE), true);
  assert.equal(seenRegions.has(PM_TD_RVH_REGION_EQ137), true);
  assert.equal(seenRegions.has(PM_TD_RVH_REGION_HIGH), true);
  assert.equal(seenRegions.has(PM_TD_RVH_REGION_DEFAULT), true);
  t.diagnostic(`v8 randomized differential cases executed: ${cases}`);
  v8Cases += cases;
  t.diagnostic(`v8 total differential cases executed: ${v8Cases}`);
  assert.ok(cases >= 3000, `expected >= 3000 executed cases, got ${cases}`);
});

/* ====================================================================== */
/* v9: class-wide byte-parameter sweep.                                   */
/* ====================================================================== */

test("v9 byte-parameter sweep: no uint8_t scalar parameter remains", () => {
  /* A uint8_t SCALAR parameter lets the compiler assume the high bits are
     already clear, and the Wasm ABI never narrows an i32 argument, so the
     shipped export tests the full word where the PE tests a byte. All nine
     such exports in this header probed DIVERGENT at 0x100 before v9.
     Pointer parameters (uint8_t*) and struct fields are layout and stay. */
  const stripped = readFileSync(header, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const protos = [...stripped.matchAll(/isaac_[a-z0-9_]+\s*\(([^;{]*?)\)\s*;/g)];
  assert.ok(protos.length >= 100, `expected many prototypes, got ${protos.length}`);
  for (const m of protos) {
    assert.doesNotMatch(
      `${m[1]})`,
      /\buint8_t\s+[a-z_0-9]+\s*[,)]/,
      `uint8_t scalar parameter in: ${m[0].replace(/\s+/g, " ")}`,
    );
  }
  assert.match(readFileSync(header, "utf8"), /class-wide byte-parameter sweep/);
});

test("Wasm matches JS: v9 wide byte-parameter drives", (t) => {
  const view = new DataView(wasm.memory.buffer);
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xff00, 0xffffffff];
  let cases = 0;

  for (const w of wide) {
    /* anim_idle: anim_7c=1 so anim_8c decides (PE cmp byte [+0x8c],0). */
    assert.equal(
      wasm.isaac_pm_death_anim_idle(1, w >>> 0) !== 0,
      pmDeathAnimIdle(1, w),
      `wide anim_idle ${w}`,
    );
    /* player_eligible: each byte position isolated. */
    assert.equal(
      wasm.isaac_pm_death_player_eligible(w >>> 0, 0, 0, 1, 0, 0) !== 0,
      pmDeathPlayerEligible(w, 0, 0, 1, 0, 0),
      `wide dead ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_death_player_eligible(1, 1, w >>> 0, 1, 0, 0) !== 0,
      pmDeathPlayerEligible(1, 1, w, 1, 0, 0),
      `wide anim8c ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_death_player_eligible(1, 0, 0, w >>> 0, 1, 1) !== 0,
      pmDeathPlayerEligible(1, 0, 0, w, 1, 1),
      `wide twin_null ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_death_player_eligible(1, 0, 0, 0, 1, w >>> 0) !== 0,
      pmDeathPlayerEligible(1, 0, 0, 0, 1, w),
      `wide twin_anim8c ${w}`,
    );
    /* intensity eligible/contrib: raw>0, flags clear, dead byte decides. */
    assert.equal(
      wasm.isaac_pm_intensity_player_eligible(5, 0, w >>> 0) !== 0,
      pmIntensityPlayerEligible(5, 0, w),
      `wide intensity elig ${w}`,
    );
    assert.equal(
      Math.fround(wasm.isaac_pm_intensity_player_contrib(5, 0, w >>> 0)),
      pmIntensityPlayerContrib(5, 0, w),
      `wide intensity contrib ${w}`,
    );
    /* sfx gate: enabled byte decides (PE cmp byte [+0x198],0). */
    assert.equal(
      wasm.isaac_pm_sfx_entry_gate(0, 0x1b8, 1, w >>> 0),
      pmSfxEntryGate(0, 0x1b8, 1, w),
      `wide sfx enabled ${w}`,
    );
    cases += 8;
  }

  /* PMP: game_null / entry_found / shifts are full-dword; seed is dword. */
  for (const w of wide) {
    assert.equal(
      wasm.isaac_pm_pre_play_sound_id(w | 0, 1, 4, 2, 7, 7),
      pmPrePlaySoundId({ gameNull: w, entryFound: 1, seed: 4 }),
      `wide game_null ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_pre_play_sound_id(0, w | 0, 4, 2, 7, 7),
      pmPrePlaySoundId({ gameNull: 0, entryFound: w, seed: 4 }),
      `wide entry_found ${w}`,
    );
    cases += 2;
  }

  /* PE truth pinned directly: a low-byte-zero wide value behaves as zero. */
  assert.equal(wasm.isaac_pm_death_anim_idle(1, 0x100), 1);
  assert.equal(wasm.isaac_pm_death_player_eligible(0x100, 0, 0, 1, 0, 0), 0);
  assert.equal(wasm.isaac_pm_intensity_player_eligible(5, 0, 0x100), 1);
  assert.equal(wasm.isaac_pm_sfx_entry_gate(0, 0x1b8, 1, 0x100), PM_SFX_GATE_DISABLED);
  cases += 4;

  t.diagnostic(`v9 wide-drive differential cases executed: ${cases}`);
  v9Cases += cases;
  assert.ok(cases >= 60, `expected >= 60 executed cases, got ${cases}`);
});

/* ================= v10: TD-MID TriggerDeath middle/tail pure gates ===== */

test("header documents v10 TD-MID mid/tail pure gates", () => {
  const h = readFileSync(header, "utf8");
  // HEART
  assert.match(h, /0x007a11dc/);
  assert.match(h, /0x00771550/);
  assert.match(h, /TryUnlock|0x00929a20/);
  assert.match(h, /0x52/);
  // TAIL
  assert.match(h, /0x007a1c47/);
  assert.match(h, /0x26b/);
  assert.match(h, /0x1f/);
  assert.match(h, /check_only_termination/);
  // VEC
  assert.match(h, /0x007a2090/);
  assert.match(h, /0x007a1b04/);
  assert.match(h, /0xd4/);
  assert.match(h, /0x1c/);
  assert.match(h, /0xfffffff0/);
  assert.match(h, /0x007a2100/);
  assert.match(h, /0x00b62a7c/);
  assert.match(h, /0x00b64a88/);
  assert.match(h, /0x00b6bf54/);
  // CHAR / SEQ / GHOST / RESET
  assert.match(h, /0x007a14f0/);
  assert.match(h, /0x007a13d6/);
  assert.match(h, /0x007a136e/);
  assert.match(h, /0x007a169f/);
  assert.match(h, /AddBoneHearts|0x007ca840/);
  assert.match(h, /GetHealthType|0x007cafe0/);
  assert.match(h, /MorphToCoopGhost|0x007d96f0/);
  assert.match(h, /IsCoopPlay|0x009bf990/);
  assert.match(h, /HasCollectibleEffect|0x009305f0/);
  /* The ABI literal moved to the v11 header test when v11 landed. */
  assert.match(h, /TD-MID: TriggerDeath middle\/tail pure gates \(ABI v10\)/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /isaac_pm_td_heart_gate/);
  assert.match(s, /isaac_pm_td_rng_record_next/);
  assert.match(s, /isaac_pm_td_reset_health_branch/);
});

test("JS oracle: v10 HEART + TAIL + checkOnly termination", () => {
  /* HEART 0x007a11dc..0x007a120d: !checkOnly && probe && field8 == 0xd. */
  assert.equal(pmTdHeartGate(0, 1, 0xd), 1);
  assert.equal(pmTdHeartGate(1, 1, 0xd), 0);   /* checkOnly skips */
  assert.equal(pmTdHeartGate(0, 0, 0xd), 0);   /* probe false */
  assert.equal(pmTdHeartGate(0, 1, 0xc), 0);   /* field8 != 0xd */
  assert.equal(pmTdHeartGate(0x100, 1, 0xd), 1); /* low byte 0: NOT checkOnly -> gate runs */
  assert.equal(pmTdHeartGate(0, 0x100, 0xd), 0); /* wide probe: low byte 0 */
  assert.equal(pmTdHeartGate(0, 1, 0xffffffff), 0);

  /* TAIL 0x007a1c47..0x007a1ca1. */
  assert.equal(pmTdTailHold(0x1f, 1), 1);
  assert.equal(pmTdTailHold(0x1f, 0), 0);
  assert.equal(pmTdTailHold(0x1e, 1), 0);
  assert.equal(pmTdTailHold(0x1f, 0x100), 0);  /* wide probe: low byte 0 */
  assert.equal(pmTdTailHold(0x1f, 0xff), 1);
  assert.equal(pmTdTailCheckOnlyResult(0x1f, 1), 1);
  assert.equal(pmTdTailCheckOnlyResult(0x1e, 1), 0);
  assert.equal(pmTdTailCheckOnlyResult(0x1f, 0), 0);
  assert.equal(pmTdTailHostReviveNeeded(0, 0x1f, 1), 1);
  assert.equal(pmTdTailHostReviveNeeded(1, 0x1f, 1), 0);
  assert.equal(pmTdTailHostReviveNeeded(0, 0x1f, 0), 0);
  assert.equal(pmTdTailHostReviveNeeded(0, 0x1e, 1), 0);

  /* Whole checkOnly termination. */
  assert.equal(pmTdCheckOnlyTermination(3, 1, 0), 1);  /* matched stage 3 */
  assert.equal(pmTdCheckOnlyTermination(8, 1, 0), 1);  /* matched stage 8 */
  assert.equal(pmTdCheckOnlyTermination(8, 2, 0), 0);  /* stage 9 FALSE only */
  assert.equal(pmTdCheckOnlyTermination(-1, 1, 1), 1); /* tail TRUE */
  assert.equal(pmTdCheckOnlyTermination(-1, 2, 1), 1); /* tail wins over stage17 */
  assert.equal(pmTdCheckOnlyTermination(-1, 1, 0), 0); /* tail FALSE */
  assert.equal(pmTdCheckOnlyTermination(-1, 0, 0), 0); /* HOST treated as TRUE */
});

test("JS oracle: v10 VEC clamped slot + record RNG", () => {
  /* span_aligned */
  assert.equal(pmTdVecSpanAligned(0x1d0), 0x1d0);
  assert.equal(pmTdVecSpanAligned(0x1d4), 0x1d0);   /* low nibble cleared */
  assert.equal(pmTdVecSpanAligned(0xffffffff) >>> 0, 0xfffffff0); /* int32 wrap */
  assert.equal(pmTdVecSpanAligned(-16) >>> 0, 0xfffffff0);
  assert.equal(pmTdVecSpanAligned(0), 0);

  /* warn: fires when span_aligned <= limit (signed jg skips the log). */
  assert.equal(pmTdVecWarnNeeded(0x1c0, 0x1c0), 1);   /* == limit: warn */
  assert.equal(pmTdVecWarnNeeded(0x1c1, 0x1c0), 0);   /* > limit: no warn */
  assert.equal(pmTdVecWarnNeeded(0x1c1 & 0xfffffff0, 0x1c0), 1); /* == limit: warn */
  assert.equal(pmTdVecWarnNeeded(0, 0x1c0), 1);       /* empty: warn */
  assert.equal(pmTdVecWarnNeeded(0xfffffff0, 0x1c0), 1); /* signed -16 <= 0x1c0 -> jg not taken -> warn */
  assert.equal(pmTdVecWarnNeeded(0xd40, 0xd40), 1);
  assert.equal(pmTdVecWarnNeeded(0xd41, 0xd40), 0);

  /* slot index: min_u((span>>4)-1, limit). */
  assert.equal(pmTdVecSlotIndex(0x10, 0x1c), 0);      /* count 1 -> 0 */
  assert.equal(pmTdVecSlotIndex(0x1c0, 0x1c), 0x1b);  /* count 0x1c -> 0x1b */
  assert.equal(pmTdVecSlotIndex(0x1d0, 0x1c), 0x1c);  /* count 0x1d -> clamp */
  assert.equal(pmTdVecSlotIndex(0, 0x1c), 0x1c);      /* empty -> limit */
  assert.equal(pmTdVecSlotIndex(-16, 0x1c), 0x1c);    /* negative -> limit */
  assert.equal(pmTdVecSlotIndex(0x10, 0xd4), 0);
  assert.equal(pmTdVecSlotIndex(0xd40, 0xd4), 0xd3);
  assert.equal(pmTdVecSlotIndex(0xd50, 0xd4), 0xd4);  /* 0xd5 rows -> clamp */
  assert.equal(pmTdVecSlotOffset(0xd50, 0xd4), 0xd40); /* 0xd4 << 4 */
  assert.equal(pmTdVecSlotOffset(0x10, 0x1c), 0);
  assert.equal(pmTdVecSlotOffset(0x1d0, 0x1c), 0x1c0);

  /* record RNG xorshift: known vectors + pre-play cross-helper agreement. */
  assert.equal(pmTdRngRecordNext(0, 2, 7, 7), pmPrePlayRngNext(0, 2, 7, 7));
  assert.equal(pmTdRngRecordNext(1, 2, 7, 7), pmPrePlayRngNext(1, 2, 7, 7));
  assert.equal(pmTdRngRecordNext(0x69696969, 2, 7, 7),
               pmPrePlayRngNext(0x69696969, 2, 7, 7));
  assert.equal(pmTdRngRecordNext(0xffffffff, 1, 31, 0),
               pmPrePlayRngNext(0xffffffff, 1, 31, 0));
  assert.equal(pmTdRngRecordNext(0xdeadbeef, 0, 0, 0), 0);
  assert.equal(pmTdRngSeedZero(0), 1);
  assert.equal(pmTdRngSeedZero(1), 0);
  assert.equal(pmTdRngSeedStillZero(0), 1);
  assert.equal(pmTdRngSeedStillZero(0xffffffff), 0);
});

test("JS oracle: v10 CHAR + SEQ + GHOST + RESET", () => {
  /* CHAR dispatch. */
  assert.equal(pmTdCharDeathPath(0x10), PM_TD_CHAR_PATH_0);
  assert.equal(pmTdCharDeathPath(0x23), PM_TD_CHAR_PATH_0);
  assert.equal(pmTdCharDeathPath(0xa), PM_TD_CHAR_PATH_1);
  assert.equal(pmTdCharDeathPath(0x1f), PM_TD_CHAR_PATH_1);
  assert.equal(pmTdCharDeathPath(0x27), PM_TD_CHAR_PATH_1);
  assert.equal(pmTdCharDeathPath(0), PM_TD_CHAR_PATH_2);
  assert.equal(pmTdCharDeathPath(3), PM_TD_CHAR_PATH_2);
  assert.equal(pmTdCharDeathPath(0x2b), PM_TD_CHAR_PATH_2);

  /* SEQ kinds. */
  assert.equal(pmTdDeathSeqKind(0, 0, 0, 1, 1), PM_TD_SEQ_NOT_DEAD);
  assert.equal(pmTdDeathSeqKind(1, 0, 0, 1, 1), PM_TD_SEQ_FULL);
  assert.equal(pmTdDeathSeqKind(1, 0, 0, 1, 0), PM_TD_SEQ_ALT);
  assert.equal(pmTdDeathSeqKind(1, 1, 0, 1, 1), PM_TD_SEQ_REMOVE);
  assert.equal(pmTdDeathSeqKind(1, 0, 1, 1, 1), PM_TD_SEQ_REMOVE);
  assert.equal(pmTdDeathSeqKind(1, 0, 0, 0, 1), PM_TD_SEQ_REMOVE);
  assert.equal(pmTdDeathSeqKind(0x100, 0, 0, 1, 1), PM_TD_SEQ_NOT_DEAD);
  assert.equal(pmTdDeathSeqKind(1, 0, 0, 1, 0x100), PM_TD_SEQ_ALT);

  /* GHOST gate. */
  assert.equal(pmTdGhostMorphGate(1, 0, 1, 2, 0), 1);
  assert.equal(pmTdGhostMorphGate(0, 0, 1, 2, 0), 0);
  assert.equal(pmTdGhostMorphGate(1, 1, 1, 2, 0), 0);
  assert.equal(pmTdGhostMorphGate(1, 0, 0, 2, 0), 0);
  assert.equal(pmTdGhostMorphGate(1, 0, 1, 1, 0), 0);   /* count <= 1 */
  assert.equal(pmTdGhostMorphGate(1, 0, 1, 0xffffffff, 0), 1);
  assert.equal(pmTdGhostMorphGate(1, 0, 1, 2, 1), 0);
  assert.equal(pmTdGhostMorphGate(0x100, 0, 1, 2, 0), 0);
  assert.equal(pmTdGhostMorphGate(1, 0, 0x100, 2, 0), 0);

  /* RESET. */
  assert.equal(pmTdResetReviveNeeded(0), 1);
  assert.equal(pmTdResetReviveNeeded(1), 1);
  assert.equal(pmTdResetReviveNeeded(-1), 0);
  assert.equal(pmTdResetReviveNeeded(0x7fffffff), 1);
  assert.equal(pmTdResetHealthBranch(1, 3, 0, 0), PM_TD_RESET_BRANCH_GT0_HT1_EQ3);
  assert.equal(pmTdResetHealthBranch(1, 2, 0, 0), PM_TD_RESET_BRANCH_GT0_HT1_NE3);
  assert.equal(pmTdResetHealthBranch(0, 4, 0, 0), PM_TD_RESET_BRANCH_LE0_HT1_EQ4);
  assert.equal(pmTdResetHealthBranch(-1, 4, 0, 0), PM_TD_RESET_BRANCH_LE0_HT1_EQ4);
  assert.equal(pmTdResetHealthBranch(0, 2, 3, 0), PM_TD_RESET_BRANCH_LE0_HT2_EQ3);
  assert.equal(pmTdResetHealthBranch(0, 2, 2, 0x12), PM_TD_RESET_BRANCH_CHAR_12);
  assert.equal(pmTdResetHealthBranch(0, 2, 2, 0), PM_TD_RESET_BRANCH_ELSE);
  /* ht2 ignored when [0x1340] > 0 or ht1 == 4 (PE stops probing). */
  assert.equal(pmTdResetHealthBranch(1, 3, 3, 0), PM_TD_RESET_BRANCH_GT0_HT1_EQ3);
  assert.equal(pmTdResetHealthBranch(0, 4, 3, 0), PM_TD_RESET_BRANCH_LE0_HT1_EQ4);
  assert.equal(pmTdResetBoneHearts(PM_TD_RESET_BRANCH_LE0_HT1_EQ4), 1);
  assert.equal(pmTdResetBoneHearts(0), 0);
  assert.equal(pmTdResetProbeCount(PM_TD_RESET_BRANCH_GT0_HT1_NE3), 1);
  assert.equal(pmTdResetProbeCount(PM_TD_RESET_BRANCH_LE0_HT1_EQ4), 1);
  assert.equal(pmTdResetProbeCount(PM_TD_RESET_BRANCH_LE0_HT2_EQ3), 2);
  assert.equal(pmTdResetProbeCount(PM_TD_RESET_BRANCH_ELSE), 2);
});

test("Wasm matches JS: v10 TD-MID mid/tail gates", (t) => {
  let cases = 0;
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xffffffff];

  for (const w of wide) {
  /* HEART: probe byte and check_only byte decide. */
    assert.equal(
      wasm.isaac_pm_td_heart_gate(w >>> 0, 1, 0xd),
      pmTdHeartGate(w, 1, 0xd),
      `heart check_only ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_heart_gate(0, w >>> 0, 0xd),
      pmTdHeartGate(0, w, 0xd),
      `heart probe ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_heart_gate(0, 1, w | 0),
      pmTdHeartGate(0, 1, w),
      `heart field8 ${w}`,
    );
    /* TAIL: has_26b byte decides; char full dword compare. */
    assert.equal(
      wasm.isaac_pm_td_tail_hold(0x1f, w >>> 0),
      pmTdTailHold(0x1f, w),
      `tail has26b ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_tail_hold(w | 0, 1),
      pmTdTailHold(w, 1),
      `tail char ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_tail_check_only_result(0x1f, w >>> 0),
      pmTdTailCheckOnlyResult(0x1f, w),
      `tail result ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_tail_host_revive_needed(w >>> 0, 0x1f, 1),
      pmTdTailHostReviveNeeded(w, 0x1f, 1),
      `tail host revive ${w}`,
    );
    /* SEQ byte inputs. */
    assert.equal(
      wasm.isaac_pm_td_death_seq_kind(w >>> 0, 0, 0, 1, 1),
      pmTdDeathSeqKind(w, 0, 0, 1, 1),
      `seq dead ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_death_seq_kind(1, 0, 0, 1, w >>> 0),
      pmTdDeathSeqKind(1, 0, 0, 1, w),
      `seq effect ${w}`,
    );
    /* GHOST byte inputs + unsigned count. */
    assert.equal(
      wasm.isaac_pm_td_ghost_morph_gate(w >>> 0, 0, 1, 2, 0),
      pmTdGhostMorphGate(w, 0, 1, 2, 0),
      `ghost dead ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_ghost_morph_gate(1, 0, w >>> 0, 2, 0),
      pmTdGhostMorphGate(1, 0, w, 2, 0),
      `ghost is_coop ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_ghost_morph_gate(1, 0, 1, w >>> 0, 0),
      pmTdGhostMorphGate(1, 0, 1, w, 0),
      `ghost count ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_ghost_morph_gate(1, 0, 1, 2, w >>> 0),
      pmTdGhostMorphGate(1, 0, 1, 2, w),
      `ghost flag ${w}`,
    );
    cases += 12;
  }

  /* PE truth pinned directly. */
  assert.equal(wasm.isaac_pm_td_heart_gate(0x100, 1, 0xd), 1); /* wide checkOnly: low byte 0 */
  assert.equal(wasm.isaac_pm_td_tail_hold(0x1f, 0x100), 0);
  assert.equal(wasm.isaac_pm_td_death_seq_kind(0x100, 0, 0, 1, 1), PM_TD_SEQ_NOT_DEAD);
  assert.equal(wasm.isaac_pm_td_ghost_morph_gate(1, 0, 1, 2, 0x100), 1);
  cases += 4;

  t.diagnostic(`v10 fixed differential cases executed: ${cases}`);
  v10Cases += cases;
  assert.ok(cases >= 70, `expected >= 70 executed cases, got ${cases}`);
});

test("deterministic randomized differential corpus: v10 TD-MID", (t) => {
  let seed = 0x7a1c47 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* Draw from the HIGH bits. */
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const spanBoundary = [0, 0xf, 0x10, 0x1b0, 0x1c0, 0x1c1, 0x1d0, 0xd30,
    0xd40, 0xd41, 0xd50, 0x100000, -16, -1, 0x7fffffff, 0x80000000, 0xfffffff0];
  const seenBranches = new Set();
  const seenKinds = new Set();
  const seenPaths = new Set();
  let cases = 0;

  for (let trial = 0; trial < 700; trial += 1) {
    const mode = pick(5);
    /* HEART */
    const co = pick(4) === 0 ? 0x100 * pick(4) : pick(2);
    const probe = pick(3) === 0 ? 0x100 : pick(2);
    const field8 = pick(4) === 0 ? pick(0x40) : 0xd;
    assert.equal(
      wasm.isaac_pm_td_heart_gate(co >>> 0, probe >>> 0, field8 | 0),
      pmTdHeartGate(co, probe, field8),
      `rnd heart ${trial}`,
    );
    cases += 1;

    /* TAIL + termination */
    const charType = mode === 0 ? 0x1f : (rnd() | 0);
    const has26b = pick(4) === 0 ? 0x100 : pick(2);
    assert.equal(
      wasm.isaac_pm_td_tail_hold(charType | 0, has26b >>> 0),
      pmTdTailHold(charType, has26b),
      `rnd tail hold ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_tail_check_only_result(charType | 0, has26b >>> 0),
      pmTdTailCheckOnlyResult(charType, has26b),
      `rnd tail result ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_tail_host_revive_needed(co >>> 0, charType | 0, has26b >>> 0),
      pmTdTailHostReviveNeeded(co, charType, has26b),
      `rnd tail host ${trial}`,
    );
    const fm = pick(3) === 0 ? -1 : pick(10);
    const s17 = pick(3);
    const th = pick(2);
    assert.equal(
      wasm.isaac_pm_td_check_only_termination(fm | 0, s17 | 0, th | 0),
      pmTdCheckOnlyTermination(fm, s17, th),
      `rnd term ${trial}`,
    );
    cases += 4;

    /* VEC arithmetic. */
    const span = mode === 1 ? spanBoundary[pick(spanBoundary.length)] : (rnd() | 0);
    const limit = pick(3) === 0 ? 0xd4 : 0x1c;
    const aligned = wasm.isaac_pm_td_vec_span_aligned(span | 0) | 0;
    assert.equal(aligned, pmTdVecSpanAligned(span), `rnd aligned ${trial}`);
    const limitBytes = limit << 4;
    assert.equal(
      wasm.isaac_pm_td_vec_warn_needed(aligned, limitBytes),
      pmTdVecWarnNeeded(aligned, limitBytes),
      `rnd warn ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_vec_slot_index(span | 0, limit) | 0,
      pmTdVecSlotIndex(span, limit),
      `rnd slot ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_vec_slot_offset(span | 0, limit) | 0,
      pmTdVecSlotOffset(span, limit),
      `rnd offset ${trial}`,
    );
    cases += 4;

    /* RNG record step + cross-helper agreement with the PMP global. */
    const rseed = rnd();
    const s1 = rnd() & 31;
    const s2 = rnd() & 31;
    const s3 = rnd() & 31;
    const rnext = wasm.isaac_pm_td_rng_record_next(rseed, s1, s2, s3) >>> 0;
    assert.equal(rnext, pmTdRngRecordNext(rseed, s1, s2, s3), `rnd rng ${trial}`);
    assert.equal(
      rnext,
      wasm.isaac_pm_pre_play_rng_next(rseed, s1, s2, s3) >>> 0,
      `rnd rng cross ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rng_seed_zero(rseed | 0),
      pmTdRngSeedZero(rseed),
      `rnd seed zero ${trial}`,
    );
    const curSeed = rnd() & 0xff;
    assert.equal(
      wasm.isaac_pm_td_rng_seed_still_zero(curSeed | 0),
      pmTdRngSeedStillZero(curSeed),
      `rnd seed still ${trial}`,
    );
    cases += 4;

    /* CHAR / SEQ / GHOST / RESET. */
    const ct = mode === 2 ? [0xa, 0x10, 0x1f, 0x23, 0x27][pick(5)] : (rnd() | 0);
    const path = wasm.isaac_pm_td_char_death_path(ct | 0) | 0;
    assert.equal(path, pmTdCharDeathPath(ct), `rnd char ${trial}`);
    seenPaths.add(path);

    const dead = pick(4) === 0 ? 0x100 : pick(2);
    const fatalNull = pick(2);
    const state2c = pick(2);
    const fatalState28 = pick(2);
    const hasEff = pick(4) === 0 ? 0x100 : pick(2);
    const kind = wasm.isaac_pm_td_death_seq_kind(dead >>> 0, fatalNull >>> 0,
                                                 state2c | 0, fatalState28 | 0,
                                                 hasEff >>> 0) | 0;
    assert.equal(kind, pmTdDeathSeqKind(dead, fatalNull, state2c, fatalState28, hasEff),
                 `rnd seq ${trial}`);
    seenKinds.add(kind);

    const isCoop = pick(4) === 0 ? 0x100 : pick(2);
    const coopCount = pick(4) === 0 ? (rnd() >>> 0) : (1 + pick(4));
    const flag20a9 = pick(2);
    assert.equal(
      wasm.isaac_pm_td_ghost_morph_gate(dead >>> 0, fatalNull >>> 0, isCoop >>> 0,
                                        coopCount >>> 0, flag20a9 >>> 0),
      pmTdGhostMorphGate(dead, fatalNull, isCoop, coopCount, flag20a9),
      `rnd ghost ${trial}`,
    );

    const fatal1340 = pick(3) - 1;
    const ht1 = pick(6);
    const ht2 = pick(6);
    const rct = mode === 3 ? 0x12 : (rnd() | 0);
    const branch = wasm.isaac_pm_td_reset_health_branch(fatal1340 | 0, ht1 | 0,
                                                        ht2 | 0, rct | 0) | 0;
    assert.equal(
      branch,
      pmTdResetHealthBranch(fatal1340, ht1, ht2, rct),
      `rnd reset branch ${trial}`,
    );
    seenBranches.add(branch);
    assert.equal(
      wasm.isaac_pm_td_reset_bone_hearts(branch),
      pmTdResetBoneHearts(branch),
      `rnd bone ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_reset_probe_count(branch) | 0,
      pmTdResetProbeCount(branch),
      `rnd probes ${trial}`,
    );
    const rv = rnd() | 0;
    assert.equal(
      wasm.isaac_pm_td_reset_revive_needed(rv),
      pmTdResetReviveNeeded(rv),
      `rnd revive ${trial}`,
    );
    /* Cross-helper: the reset Revive gate is the RVH head predicate. */
    const order = rnd() | 0;
    assert.equal(
      wasm.isaac_pm_td_reset_revive_needed(order) !== 0,
      wasm.isaac_pm_td_rvh_revive_called(order) !== 0,
      `rnd revive cross ${trial}`,
    );
    cases += 9;
  }

  /* Coverage asserts: every branch / kind / path must actually be seen. */
  for (let b = 0; b <= 5; b += 1) {
    assert.ok(seenBranches.has(b), `corpus missed reset branch ${b}`);
  }
  for (const k of [PM_TD_SEQ_NOT_DEAD, PM_TD_SEQ_REMOVE, PM_TD_SEQ_ALT, PM_TD_SEQ_FULL]) {
    assert.ok(seenKinds.has(k), `corpus missed seq kind ${k}`);
  }
  for (const p of [PM_TD_CHAR_PATH_0, PM_TD_CHAR_PATH_1, PM_TD_CHAR_PATH_2]) {
    assert.ok(seenPaths.has(p), `corpus missed char path ${p}`);
  }

  v10Cases += cases;
  t.diagnostic(`v10 randomized differential cases executed: ${cases}`);
  t.diagnostic(`v10 total differential cases executed: ${v10Cases}`);
  assert.ok(cases >= 6000, `expected >= 6000 executed cases, got ${cases}`);
});

/* ================= v11: RVB — RVH per-id body pure layer =============== */

/* dispatch VA -> body id (mirror of the header body map). */
const RVB_VA_TO_BODY = new Map([
  [0x007a2456, PM_TD_RVB_BODY_CASE0],
  [0x007a25e3, PM_TD_RVB_BODY_CASE1],
  [0x007a2811, PM_TD_RVB_BODY_CASE2],
  [0x007a26e4, PM_TD_RVB_BODY_CASE3],
  [0x007a28e9, PM_TD_RVB_BODY_EQ137],
  [0x007a30a6, PM_TD_RVB_BODY_HIGH0],
  [0x007a2eeb, PM_TD_RVB_BODY_HIGH1],
  [0x007a2ab7, PM_TD_RVB_BODY_HIGH2],
  [0x007a2a32, PM_TD_RVB_BODY_DEFAULT],
]);

test("header documents v11 RVB body layer (every constant literal)", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /RVB: RVH per-id body pure layer \(ABI v11\)/);
  /* body ranges + shared tails present. */
  for (const va of [
    /0x007a2456\.\.0x007a25de/, /0x007a25e3\.\.0x007a26df/,
    /0x007a2811\.\.0x007a28e4/, /0x007a26e4\.\.0x007a280c/,
    /0x007a28e9\.\.0x007a29be/, /0x007a30a6\.\.0x007a328a/,
    /0x007a2eeb\.\.0x007a30a1/, /0x007a2ab7\.\.0x007a2ee6/,
    /0x007a29c3\.\.0x007a2a0c/, /0x007a2a32\.\.0x007a2ab2/,
  ]) {
    assert.match(h, va);
  }
  /* the two callsite-disproven ZHL matches must stay documented. */
  assert.match(h, /DISPROVEN at callsite \(3 args\)/);
  assert.match(h, /"AddBoss" 12-byte exact match DISPROVEN/);
  /* census re-verification is recorded. */
  assert.match(h, /histogram \{0:1,1:1,2:1,3:1,4:198\}/);

  /* Every v11 exported constant, literal-for-literal, in BOTH the header
     text and the model (header-only constants are invisible to the Wasm
     differential — this is the assertion that catches them). */
  const pins = [
    ["ISAAC_PM_TD_RVB_ARM_SKIP", "0", PM_TD_RVB_ARM_SKIP, 0],
    ["ISAAC_PM_TD_RVB_ARM_FATAL", "1", PM_TD_RVB_ARM_FATAL, 1],
    ["ISAAC_PM_TD_RVB_ARM_CHAIN_SKIP", "2", PM_TD_RVB_ARM_CHAIN_SKIP, 2],
    ["ISAAC_PM_TD_RVB_ARM_NOTIFY", "3", PM_TD_RVB_ARM_NOTIFY, 3],
    ["ISAAC_PM_TD_RVB_BODY_CASE0", "0", PM_TD_RVB_BODY_CASE0, 0],
    ["ISAAC_PM_TD_RVB_BODY_CASE1", "1", PM_TD_RVB_BODY_CASE1, 1],
    ["ISAAC_PM_TD_RVB_BODY_CASE2", "2", PM_TD_RVB_BODY_CASE2, 2],
    ["ISAAC_PM_TD_RVB_BODY_CASE3", "3", PM_TD_RVB_BODY_CASE3, 3],
    ["ISAAC_PM_TD_RVB_BODY_EQ137", "4", PM_TD_RVB_BODY_EQ137, 4],
    ["ISAAC_PM_TD_RVB_BODY_HIGH0", "5", PM_TD_RVB_BODY_HIGH0, 5],
    ["ISAAC_PM_TD_RVB_BODY_HIGH1", "6", PM_TD_RVB_BODY_HIGH1, 6],
    ["ISAAC_PM_TD_RVB_BODY_HIGH2", "7", PM_TD_RVB_BODY_HIGH2, 7],
    ["ISAAC_PM_TD_RVB_BODY_DEFAULT", "8", PM_TD_RVB_BODY_DEFAULT, 8],
    ["ISAAC_PM_TD_RVB_STAGE_CASE0", "7", PM_TD_RVB_STAGE_CASE0, 7],
    ["ISAAC_PM_TD_RVB_STAGE_CASE1", "6", PM_TD_RVB_STAGE_CASE1, 6],
    ["ISAAC_PM_TD_RVB_STAGE_CASE2", "5", PM_TD_RVB_STAGE_CASE2, 5],
    ["ISAAC_PM_TD_RVB_STAGE_CASE3", "8", PM_TD_RVB_STAGE_CASE3, 8],
    ["ISAAC_PM_TD_RVB_STAGE_EQ137", "9", PM_TD_RVB_STAGE_EQ137, 9],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_HT1", "0", PM_TD_RVB_CASE0_BRANCH_HT1, 0],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_HT4", "1", PM_TD_RVB_CASE0_BRANCH_HT4, 1],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_KEEP", "2", PM_TD_RVB_CASE0_BRANCH_KEEP, 2],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_HT3", "3", PM_TD_RVB_CASE0_BRANCH_HT3, 3],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_CHAR12", "4",
     PM_TD_RVB_CASE0_BRANCH_CHAR12, 4],
    ["ISAAC_PM_TD_RVB_CASE0_BRANCH_ELSE", "5", PM_TD_RVB_CASE0_BRANCH_ELSE, 5],
    ["ISAAC_PM_TD_RVB_CASE1_BRANCH_HT1", "0", PM_TD_RVB_CASE1_BRANCH_HT1, 0],
    ["ISAAC_PM_TD_RVB_CASE1_BRANCH_HT4", "1", PM_TD_RVB_CASE1_BRANCH_HT4, 1],
    ["ISAAC_PM_TD_RVB_CASE1_BRANCH_HT2", "2", PM_TD_RVB_CASE1_BRANCH_HT2, 2],
    ["ISAAC_PM_TD_RVB_CASE1_BRANCH_ELSE", "3", PM_TD_RVB_CASE1_BRANCH_ELSE, 3],
    ["ISAAC_PM_TD_RVB_HIGH0_COSTUME_SKIP", "0",
     PM_TD_RVB_HIGH0_COSTUME_SKIP, 0],
    ["ISAAC_PM_TD_RVB_HIGH0_COSTUME_NO_PRE", "1",
     PM_TD_RVB_HIGH0_COSTUME_NO_PRE, 1],
    ["ISAAC_PM_TD_RVB_HIGH0_COSTUME_FULL", "2",
     PM_TD_RVB_HIGH0_COSTUME_FULL, 2],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_CASE0", "0xfc", PM_TD_RVB_ZERO_MASK_CASE0, 0xfc],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_CASE1", "0xf4", PM_TD_RVB_ZERO_MASK_CASE1, 0xf4],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_CASE2", "0xf7", PM_TD_RVB_ZERO_MASK_CASE2, 0xf7],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_CASE3", "0xfc", PM_TD_RVB_ZERO_MASK_CASE3, 0xfc],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_EQ137", "0xe7", PM_TD_RVB_ZERO_MASK_EQ137, 0xe7],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_HIGH0", "0xfc", PM_TD_RVB_ZERO_MASK_HIGH0, 0xfc],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_HIGH1", "0xf5", PM_TD_RVB_ZERO_MASK_HIGH1, 0xf5],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_HIGH2", "0xfc", PM_TD_RVB_ZERO_MASK_HIGH2, 0xfc],
    ["ISAAC_PM_TD_RVB_ZERO_MASK_DEFAULT", "0", PM_TD_RVB_ZERO_MASK_DEFAULT, 0],
    ["ISAAC_PM_TD_RVB_CASE2_CONST_134C", "6", PM_TD_RVB_CASE2_CONST_134C, 6],
    ["ISAAC_PM_TD_RVB_EQ137_CONST_134C", "4", PM_TD_RVB_EQ137_CONST_134C, 4],
    ["ISAAC_PM_TD_RVB_HIGH1_CONST_134C", "1", PM_TD_RVB_HIGH1_CONST_134C, 1],
    ["ISAAC_PM_TD_RVB_EQ137_CONST_1350", "-1", PM_TD_RVB_EQ137_CONST_1350, -1],
    ["ISAAC_PM_TD_RVB_FATAL_TIMER_78", "0x78", PM_TD_RVB_FATAL_TIMER_78, 0x78],
    ["ISAAC_PM_TD_RVB_TIMER_5A", "0x5a", PM_TD_RVB_TIMER_5A, 0x5a],
    ["ISAAC_PM_TD_RVB_OFF_TIMER_13BC", "0x13bc", PM_TD_RVB_OFF_TIMER_13BC, 0x13bc],
    ["ISAAC_PM_TD_RVB_OFF_TWIN_1D98", "0x1d98", PM_TD_RVB_OFF_TWIN_1D98, 0x1d98],
    ["ISAAC_PM_TD_RVB_OFF_TWIN_1D9C", "0x1d9c", PM_TD_RVB_OFF_TWIN_1D9C, 0x1d9c],
    ["ISAAC_PM_TD_RVB_OFF_1574", "0x1574", PM_TD_RVB_OFF_1574, 0x1574],
    ["ISAAC_PM_TD_RVB_OR_1574_MASK", "0xffff", PM_TD_RVB_OR_1574_MASK, 0xffff],
    ["ISAAC_PM_TD_RVB_NOTIFY_OFF_1831C", "0x1831c",
     PM_TD_RVB_NOTIFY_OFF_1831C, 0x1831c],
    ["ISAAC_PM_TD_RVB_NOTIFY_OFF_18318", "0x18318",
     PM_TD_RVB_NOTIFY_OFF_18318, 0x18318],
    ["ISAAC_PM_TD_RVB_NOTIFY_OFF_18308", "0x18308",
     PM_TD_RVB_NOTIFY_OFF_18308, 0x18308],
    ["ISAAC_PM_TD_RVB_NOTIFY_CLAMP_MAX", "7", PM_TD_RVB_NOTIFY_CLAMP_MAX, 7],
    ["ISAAC_PM_TD_RVB_CFG_OFF_B0", "0xb0", PM_TD_RVB_CFG_OFF_B0, 0xb0],
    ["ISAAC_PM_TD_RVB_CFG_OFF_B4", "0xb4", PM_TD_RVB_CFG_OFF_B4, 0xb4],
    ["ISAAC_PM_TD_RVB_CFG_OFF_B8", "0xb8", PM_TD_RVB_CFG_OFF_B8, 0xb8],
    ["ISAAC_PM_TD_RVB_CASE2_CHAR_KEEP", "0x19", PM_TD_RVB_CASE2_CHAR_KEEP, 0x19],
    ["ISAAC_PM_TD_RVB_CASE2_CHAR_NEW", "4", PM_TD_RVB_CASE2_CHAR_NEW, 4],
    ["ISAAC_PM_TD_RVB_EQ137_CHAR_KEEP", "0x18", PM_TD_RVB_EQ137_CHAR_KEEP, 0x18],
    ["ISAAC_PM_TD_RVB_EQ137_CHAR_NEW", "0xc", PM_TD_RVB_EQ137_CHAR_NEW, 0xc],
    ["ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_A", "0x1d",
     PM_TD_RVB_HIGH0_CHAR_KEEP_A, 0x1d],
    ["ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_B", "0x26",
     PM_TD_RVB_HIGH0_CHAR_KEEP_B, 0x26],
    ["ISAAC_PM_TD_RVB_HIGH0_CHAR_NEW", "0xb", PM_TD_RVB_HIGH0_CHAR_NEW, 0xb],
    ["ISAAC_PM_TD_RVB_HIGH0_CHAR_SKIP_ALL", "8",
     PM_TD_RVB_HIGH0_CHAR_SKIP_ALL, 8],
    ["ISAAC_PM_TD_RVB_HIGH0_CHAR_NO_PRE", "0x23",
     PM_TD_RVB_HIGH0_CHAR_NO_PRE, 0x23],
    ["ISAAC_PM_TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF", "0x2a404",
     PM_TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF, 0x2a404],
    ["ISAAC_PM_TD_RVB_HIGH0_CFG_VEC_END_OFF", "0x2a408",
     PM_TD_RVB_HIGH0_CFG_VEC_END_OFF, 0x2a408],
    ["ISAAC_PM_TD_RVB_HIGH0_CFG_ELEM_OFF", "0x530",
     PM_TD_RVB_HIGH0_CFG_ELEM_OFF, 0x530],
    ["ISAAC_PM_TD_RVB_HIGH0_ITEM_VEC_BEGIN_OFF", "0x2a41c",
     PM_TD_RVB_HIGH0_ITEM_VEC_BEGIN_OFF, 0x2a41c],
    ["ISAAC_PM_TD_RVB_HIGH0_ITEM_VEC_END_OFF", "0x2a420",
     PM_TD_RVB_HIGH0_ITEM_VEC_END_OFF, 0x2a420],
    ["ISAAC_PM_TD_RVB_HIGH0_ITEM_ELEM_OFF", "0xc4",
     PM_TD_RVB_HIGH0_ITEM_ELEM_OFF, 0xc4],
    ["ISAAC_PM_TD_RVB_HIGH0_EXTRA_LIVES_OFF_1E74", "0x1e74",
     PM_TD_RVB_HIGH0_EXTRA_LIVES_OFF_1E74, 0x1e74],
    ["ISAAC_PM_TD_RVB_HIGH0_EXTRA_LIVES_VALUE", "0x708",
     PM_TD_RVB_HIGH0_EXTRA_LIVES_VALUE, 0x708],
    ["ISAAC_PM_TD_RVB_HIGH2_EFFECT_ID_2B0", "0x2b0",
     PM_TD_RVB_HIGH2_EFFECT_ID_2B0, 0x2b0],
    ["ISAAC_PM_TD_RVB_SFX_1B", "0x1b", PM_TD_RVB_SFX_1B, 0x1b],
    ["ISAAC_PM_TD_RVB_SFX_1C", "0x1c", PM_TD_RVB_SFX_1C, 0x1c],
    ["ISAAC_PM_TD_RVB_SFX_50", "0x50", PM_TD_RVB_SFX_50, 0x50],
    ["ISAAC_PM_TD_RVB_SFX_10A", "0x10a", PM_TD_RVB_SFX_10A, 0x10a],
    ["ISAAC_PM_TD_RVB_SFX_VOL_1_25_BITS", "0x3fa00000",
     PM_TD_RVB_SFX_VOL_1_25_BITS, 0x3fa00000],
    ["ISAAC_PM_TD_RVB_SFX_VOL_1_0_BITS", "0x3f800000",
     PM_TD_RVB_SFX_VOL_1_0_BITS, 0x3f800000],
    ["ISAAC_PM_TD_RVB_HIGH2_NOTIFY_ARG", "6", PM_TD_RVB_HIGH2_NOTIFY_ARG, 6],
    ["ISAAC_PM_TD_RVB_HIGH1_NOTIFY_ARG", "0xe", PM_TD_RVB_HIGH1_NOTIFY_ARG, 0xe],
    ["ISAAC_PM_TD_RVB_HIGH2_1EFC_BITS", "0x40c00000",
     PM_TD_RVB_HIGH2_1EFC_BITS, 0x40c00000],
    ["ISAAC_PM_TD_RVB_HEAL_OFF_26614", "0x26614",
     PM_TD_RVB_HEAL_OFF_26614, 0x26614],
    ["ISAAC_PM_TD_RVB_HEAL_LIMIT", "2", PM_TD_RVB_HEAL_LIMIT, 2],
    ["ISAAC_PM_TD_RVB_OFF_RED_194C", "0x194c", PM_TD_RVB_OFF_RED_194C, 0x194c],
    ["ISAAC_PM_TD_RVB_OFF_BONE_1D88", "0x1d88", PM_TD_RVB_OFF_BONE_1D88, 0x1d88],
    ["ISAAC_PM_TD_RVB_DEFAULT_LOG_LEVEL", "4", PM_TD_RVB_DEFAULT_LOG_LEVEL, 4],
    ["ISAAC_PM_TD_RVB_VA_EXIT_FLOOR", "0x007a3292",
     PM_TD_RVB_VA_EXIT_FLOOR, 0x007a3292],
    ["ISAAC_PM_TD_RVB_VA_EXIT_NOTIFY", "0x007a32b9",
     PM_TD_RVB_VA_EXIT_NOTIFY, 0x007a32b9],
    ["ISAAC_PM_TD_RVB_VA_NOTIFY_SINK", "0x006fd7c0",
     PM_TD_RVB_VA_NOTIFY_SINK, 0x006fd7c0],
    ["ISAAC_PM_TD_RVB_VA_ANIMATE", "0x007ab380", PM_TD_RVB_VA_ANIMATE, 0x007ab380],
    ["ISAAC_PM_TD_RVB_VA_CONFIG_BY_CHAR", "0x0069bd10",
     PM_TD_RVB_VA_CONFIG_BY_CHAR, 0x0069bd10],
    ["ISAAC_PM_TD_RVB_VA_ADD_BLACK_HEARTS", "0x00758f90",
     PM_TD_RVB_VA_ADD_BLACK_HEARTS, 0x00758f90],
    ["ISAAC_PM_TD_RVB_VA_CASE0_TAIL_HOST", "0x007791f0",
     PM_TD_RVB_VA_CASE0_TAIL_HOST, 0x007791f0],
    ["ISAAC_PM_TD_RVB_VA_PRE_HOST_7C3620", "0x007c3620",
     PM_TD_RVB_VA_PRE_HOST_7C3620, 0x007c3620],
    ["ISAAC_PM_TD_RVB_VA_HOST_763570", "0x00763570",
     PM_TD_RVB_VA_HOST_763570, 0x00763570],
    ["ISAAC_PM_TD_RVB_VA_HOST_7BEBB0", "0x007bebb0",
     PM_TD_RVB_VA_HOST_7BEBB0, 0x007bebb0],
    ["ISAAC_PM_TD_RVB_VA_HOST_7592A0", "0x007592a0",
     PM_TD_RVB_VA_HOST_7592A0, 0x007592a0],
    ["ISAAC_PM_TD_RVB_VA_ADD_COSTUME", "0x0075d1d0",
     PM_TD_RVB_VA_ADD_COSTUME, 0x0075d1d0],
    ["ISAAC_PM_TD_RVB_VA_EFFECT_ADD_930220", "0x00930220",
     PM_TD_RVB_VA_EFFECT_ADD_930220, 0x00930220],
    ["ISAAC_PM_TD_RVB_VA_EFFECT_ADD_9302E0", "0x009302e0",
     PM_TD_RVB_VA_EFFECT_ADD_9302E0, 0x009302e0],
    ["ISAAC_PM_TD_RVB_VA_GAME_NOTIFY_703670", "0x00703670",
     PM_TD_RVB_VA_GAME_NOTIFY_703670, 0x00703670],
    ["ISAAC_PM_TD_RVB_VA_HEAL_HOST", "0x007ca2d0",
     PM_TD_RVB_VA_HEAL_HOST, 0x007ca2d0],
    ["ISAAC_PM_TD_RVB_VA_UPDATE_RED_HEARTS", "0x007c9ea0",
     PM_TD_RVB_VA_UPDATE_RED_HEARTS, 0x007c9ea0],
    ["ISAAC_PM_TD_RVB_VA_GET_COLLECTIBLE", "0x0072fd10",
     PM_TD_RVB_VA_GET_COLLECTIBLE, 0x0072fd10],
    ["ISAAC_PM_TD_RVB_STR_PICKUP_VA", "0x00b61760",
     PM_TD_RVB_STR_PICKUP_VA, 0x00b61760],
    ["ISAAC_PM_TD_RVB_STR_SPARKLE_VA", "0x00b62268",
     PM_TD_RVB_STR_SPARKLE_VA, 0x00b62268],
    ["ISAAC_PM_TD_RVB_DEFAULT_FMT_VA", "0x00b6b138",
     PM_TD_RVB_DEFAULT_FMT_VA, 0x00b6b138],
  ];
  for (const [name, lit, modelValue, expect] of pins) {
    assert.ok(
      h.includes(`${name} = ${lit}`),
      `header must pin ${name} = ${lit}`,
    );
    assert.equal(modelValue, expect, `model literal ${name}`);
  }
  assert.equal(pins.length, 111, "v11 constant census");
});

test("JS oracle: v11 RVB flag gate, notify funnel, floor, heal", () => {
  /* flag gate (byte / dword / byte, PE order). */
  assert.equal(pmTdRvbFlagArm(0, 5, 1), PM_TD_RVB_ARM_SKIP);
  assert.equal(pmTdRvbFlagArm(0x100, 5, 1), PM_TD_RVB_ARM_SKIP); /* low byte 0 */
  assert.equal(pmTdRvbFlagArm(1, 5, 0), PM_TD_RVB_ARM_FATAL);
  assert.equal(pmTdRvbFlagArm(0x1ff, 0xffffffff, 0), PM_TD_RVB_ARM_FATAL);
  assert.equal(pmTdRvbFlagArm(1, 0, 1), PM_TD_RVB_ARM_CHAIN_SKIP);
  assert.equal(pmTdRvbFlagArm(1, 0, 0x100), PM_TD_RVB_ARM_NOTIFY); /* chain low byte 0 */
  assert.equal(pmTdRvbFlagArm(1, 0, 0), PM_TD_RVB_ARM_NOTIFY);
  assert.equal(pmTdRvbFlagArm(0xffffffff, 0, 0xff00), PM_TD_RVB_ARM_NOTIFY);

  /* exit routes: only NOTIFY skips the floor block. */
  assert.equal(pmTdRvbExitRouteVa(PM_TD_RVB_ARM_SKIP), 0x007a3292);
  assert.equal(pmTdRvbExitRouteVa(PM_TD_RVB_ARM_FATAL), 0x007a3292);
  assert.equal(pmTdRvbExitRouteVa(PM_TD_RVB_ARM_CHAIN_SKIP), 0x007a3292);
  assert.equal(pmTdRvbExitRouteVa(PM_TD_RVB_ARM_NOTIFY), 0x007a32b9);

  /* notify stages keyed by id. */
  assert.equal(pmTdRvbNotifyStage(0xb), 7);
  assert.equal(pmTdRvbNotifyStage(0x51), 6);
  assert.equal(pmTdRvbNotifyStage(0xa1), 5);
  assert.equal(pmTdRvbNotifyStage(0xd4), 8);
  assert.equal(pmTdRvbNotifyStage(0x137), 9);
  assert.equal(pmTdRvbNotifyStage(0x10), -1);
  assert.equal(pmTdRvbNotifyStage(0x14c), -1);
  assert.equal(pmTdRvbNotifyStage(0x26b), -1);
  assert.equal(pmTdRvbNotifyStage(0x2b0), -1);

  /* clamp: jle -1 first, then jl 7. */
  assert.equal(pmTdRvbNotifyClamp(-1), -1);
  assert.equal(pmTdRvbNotifyClamp(-0x80000000), -1);
  assert.equal(pmTdRvbNotifyClamp(0), 0);
  assert.equal(pmTdRvbNotifyClamp(6), 6);
  assert.equal(pmTdRvbNotifyClamp(7), 7);
  assert.equal(pmTdRvbNotifyClamp(8), 7);
  assert.equal(pmTdRvbNotifyClamp(0x7fffffff), 7);

  /* mod4 idiom, worked out by hand from the instruction stream. */
  assert.equal(pmTdRvbNotifyMod4(5), 1);
  assert.equal(pmTdRvbNotifyMod4(-5), -1);
  assert.equal(pmTdRvbNotifyMod4(-4), 0);
  assert.equal(pmTdRvbNotifyMod4(-1), -1);
  assert.equal(pmTdRvbNotifyMod4(-2), -2);
  assert.equal(pmTdRvbNotifyMod4(-0x80000000), 0);
  assert.equal(pmTdRvbNotifyMod4(0x7fffffff), 3);
  /* PE truth: the idiom IS C-truncated %4 (|0 normalizes JS -0). */
  for (const v of [-9, -8, -7, -3, 0, 1, 2, 3, 4, 9, 1000003]) {
    assert.equal(pmTdRvbNotifyMod4(v), ((v | 0) % 4) | 0, `mod4 ${v}`);
  }

  /* timer floor: cmovge keeps only >= 0x5a. */
  assert.equal(pmTdRvbTimerFloor(0x59), 0x5a);
  assert.equal(pmTdRvbTimerFloor(0x5a), 0x5a);
  assert.equal(pmTdRvbTimerFloor(0x5b), 0x5b);
  assert.equal(pmTdRvbTimerFloor(-1), 0x5a);
  assert.equal(pmTdRvbTimerFloor(-0x80000000), 0x5a);
  assert.equal(pmTdRvbTimerFloor(0x7fffffff), 0x7fffffff);

  /* heal gate: signed / byte / signed. */
  assert.equal(pmTdRvbHealGate(1, 0, 1), 1);
  assert.equal(pmTdRvbHealGate(2, 0, 1), 0);        /* jge */
  assert.equal(pmTdRvbHealGate(-5, 0, 1), 1);
  assert.equal(pmTdRvbHealGate(1, 1, 1), 0);        /* dead byte */
  assert.equal(pmTdRvbHealGate(1, 0x100, 1), 1);    /* low byte 0 */
  assert.equal(pmTdRvbHealGate(1, 0, 0), 0);        /* jle */
  assert.equal(pmTdRvbHealGate(1, 0, -3), 0);

  /* capacity: (min+1)/2 + (134c+1)/2 + 1d88, trunc halves, wrap. */
  assert.equal(pmTdRvbHealCapacity(6, 4, 2, 1), 4);
  assert.equal(pmTdRvbHealCapacity(0, 0, 0, 0), 0);
  assert.equal(pmTdRvbHealCapacity(1, 1, 0, 0), 1);
  assert.equal(pmTdRvbHealCapacity(-3, 5, -1, 0), -1);
  assert.equal(pmTdRvbHealCapacity(3, 3, 3, 2), 6);
  /* wrap: min=INT_MAX, +1 wraps; cdq/sub/sar of 0x80000000 is 0xc0000000. */
  assert.equal(pmTdRvbHealCapacity(0x7fffffff, 0x7fffffff, 0, 0), -1073741824);

  assert.equal(pmTdRvbHealApplies(5, 4), 1);
  assert.equal(pmTdRvbHealApplies(4, 4), 0);
  assert.equal(pmTdRvbHealExcess(5, 4), 1);
  assert.equal(pmTdRvbHealExcess(4, 4), 0);
  /* signed-overflow wrap on the pushed amount is preserved. */
  assert.equal(pmTdRvbHealApplies(0x7fffffff, -0x80000000), 1);
  assert.equal(pmTdRvbHealExcess(0x7fffffff, -0x80000000), -1);
});

test("JS oracle: v11 RVB machines, chars, HIGH0, plans", () => {
  /* CASE0: order 1, 4, [0x1340]!=0 (jne), 3, char 0x12, else. */
  assert.equal(pmTdRvbCase0Branch(1, 0, 0), PM_TD_RVB_CASE0_BRANCH_HT1);
  assert.equal(pmTdRvbCase0Branch(1, -1, 0x12), PM_TD_RVB_CASE0_BRANCH_HT1);
  assert.equal(pmTdRvbCase0Branch(4, 7, 0), PM_TD_RVB_CASE0_BRANCH_HT4);
  assert.equal(pmTdRvbCase0Branch(2, -1, 0), PM_TD_RVB_CASE0_BRANCH_KEEP);
  assert.equal(pmTdRvbCase0Branch(3, 5, 0), PM_TD_RVB_CASE0_BRANCH_KEEP);
  assert.equal(pmTdRvbCase0Branch(3, 0, 0), PM_TD_RVB_CASE0_BRANCH_HT3);
  assert.equal(pmTdRvbCase0Branch(2, 0, 0x12), PM_TD_RVB_CASE0_BRANCH_CHAR12);
  assert.equal(pmTdRvbCase0Branch(2, 0, 0), PM_TD_RVB_CASE0_BRANCH_ELSE);
  /* anti-merge divergence: negative 0x1340 KEEPs in CASE0 but probes
     through in CASE3 (jne vs jle). */
  assert.equal(pmTdRvbCase0Branch(2, -1, 0), PM_TD_RVB_CASE0_BRANCH_KEEP);
  assert.equal(pmTdRvbCase3Branch(-1, 2, 2, 0), PM_TD_RESET_BRANCH_ELSE);

  /* bone arg: cdq/sub/sar (NO +1 — unlike the heal halves). */
  assert.equal(pmTdRvbCase0BoneArg(7), 3);
  assert.equal(pmTdRvbCase0BoneArg(-7), -3);
  assert.equal(pmTdRvbCase0BoneArg(-1), 0);
  assert.equal(pmTdRvbCase0BoneArg(0x7fffffff), 0x3fffffff);
  assert.equal(pmTdRvbCase0BoneArg(-0x80000000), -0x40000000);

  /* config probe issuance: HT1 re-issues. */
  assert.equal(pmTdRvbCase0CfgProbes(PM_TD_RVB_CASE0_BRANCH_HT1), 2);
  assert.equal(pmTdRvbCase0CfgProbes(PM_TD_RVB_CASE0_BRANCH_HT4), 1);
  assert.equal(pmTdRvbCase0CfgProbes(PM_TD_RVB_CASE0_BRANCH_KEEP), 0);
  assert.equal(pmTdRvbCase0CfgProbes(PM_TD_RVB_CASE0_BRANCH_ELSE), 0);

  /* CASE1: order 1, 4, 2, else; 1344=2 on HT4 + ELSE only. */
  assert.equal(pmTdRvbCase1Branch(1), PM_TD_RVB_CASE1_BRANCH_HT1);
  assert.equal(pmTdRvbCase1Branch(4), PM_TD_RVB_CASE1_BRANCH_HT4);
  assert.equal(pmTdRvbCase1Branch(2), PM_TD_RVB_CASE1_BRANCH_HT2);
  assert.equal(pmTdRvbCase1Branch(3), PM_TD_RVB_CASE1_BRANCH_ELSE);
  assert.equal(pmTdRvbCase1Branch(0), PM_TD_RVB_CASE1_BRANCH_ELSE);
  assert.equal(pmTdRvbCase1Soul2(PM_TD_RVB_CASE1_BRANCH_HT4), 1);
  assert.equal(pmTdRvbCase1Soul2(PM_TD_RVB_CASE1_BRANCH_ELSE), 1);
  assert.equal(pmTdRvbCase1Soul2(PM_TD_RVB_CASE1_BRANCH_HT1), 0);
  assert.equal(pmTdRvbCase1Soul2(PM_TD_RVB_CASE1_BRANCH_HT2), 0);
  assert.equal(pmTdRvbCase1Recurse(0), 0);
  assert.equal(pmTdRvbCase1Recurse(0x1000), 1);
  assert.equal(pmTdRvbCase1Recurse(0xffffffff), 1);

  /* CASE3 / HIGH2 == v10 RESET shape (three-way agreement). */
  for (const f of [-2, -1, 0, 1, 2]) {
    for (const h1 of [0, 1, 3, 4]) {
      for (const h2 of [0, 3]) {
        for (const c of [0, 0x12]) {
          const want = pmTdResetHealthBranch(f, h1, h2, c);
          assert.equal(pmTdRvbCase3Branch(f, h1, h2, c), want);
          assert.equal(pmTdRvbHigh2Branch(f, h1, h2, c), want);
        }
      }
    }
  }

  /* char remaps. */
  assert.equal(pmTdRvbCase2NewChar(0x19), 0x19);
  assert.equal(pmTdRvbCase2NewChar(0x18), 4);
  assert.equal(pmTdRvbCase2NewChar(-1), 4);
  assert.equal(pmTdRvbEq137NewChar(0x18), 0x18);
  assert.equal(pmTdRvbEq137NewChar(0x19), 0xc);
  assert.equal(pmTdRvbHigh0NewChar(0x1d), 0x1d);
  assert.equal(pmTdRvbHigh0NewChar(0x26), 0x26);
  assert.equal(pmTdRvbHigh0NewChar(0x1f), 0xb);
  assert.equal(pmTdRvbHigh0NewChar(8), 0xb);

  /* HIGH2 char path mirrors the v10 CHAR sets; SFX trio. */
  for (const c of [0xa, 0x10, 0x12, 0x1f, 0x23, 0x27, 0x30, -1]) {
    assert.equal(pmTdRvbHigh2CharPath(c), pmTdCharDeathPath(c), `path ${c}`);
  }
  assert.equal(pmTdRvbHigh2FirstSfx(PM_TD_CHAR_PATH_0), 0x1b);
  assert.equal(pmTdRvbHigh2FirstSfx(PM_TD_CHAR_PATH_1), 0x50);
  assert.equal(pmTdRvbHigh2FirstSfx(PM_TD_CHAR_PATH_2), 0x1c); /* NOT 0x1e */
  assert.equal(pmTdRvbHigh2FirstSfxVolBits(PM_TD_CHAR_PATH_0), 0x3fa00000);
  assert.equal(pmTdRvbHigh2FirstSfxVolBits(PM_TD_CHAR_PATH_1), 0x3f800000);
  assert.equal(pmTdRvbHigh2FirstSfxVolBits(PM_TD_CHAR_PATH_2), 0x3fa00000);
  assert.equal(pmTdRvbHigh2SfxCount(PM_TD_CHAR_PATH_0), 2);
  assert.equal(pmTdRvbHigh2SfxCount(PM_TD_CHAR_PATH_1), 1);
  assert.equal(pmTdRvbHigh2SfxCount(PM_TD_CHAR_PATH_2), 2);

  /* HIGH0 costume kinds + bounds + updates + extra-lives gate. */
  assert.equal(pmTdRvbHigh0CostumeKind(8), PM_TD_RVB_HIGH0_COSTUME_SKIP);
  assert.equal(pmTdRvbHigh0CostumeKind(0x23), PM_TD_RVB_HIGH0_COSTUME_NO_PRE);
  assert.equal(pmTdRvbHigh0CostumeKind(0), PM_TD_RVB_HIGH0_COSTUME_FULL);
  assert.equal(pmTdRvbHigh0CfgInBounds(0x1000, 0x1000 + 0x534), 1);
  assert.equal(pmTdRvbHigh0CfgInBounds(0x1000, 0x1000 + 0x530), 0); /* jg strict */
  assert.equal(pmTdRvbHigh0CfgInBounds(0x1000, 0x1000 + 0x533), 0); /* &~3 */
  assert.equal(pmTdRvbHigh0CfgInBounds(0x1000, 0x1000), 0);
  assert.equal(pmTdRvbHigh0ItemGate(0x1000, 0x1000 + 0xc8, 5), 1);
  assert.equal(pmTdRvbHigh0ItemGate(0x1000, 0x1000 + 0xc4, 5), 0); /* jle */
  assert.equal(pmTdRvbHigh0ItemGate(0x1000, 0x1000 + 0xc8, 0), 0); /* null elem */
  assert.equal(pmTdRvbHigh0FatalUpdate(5), 3);
  assert.equal(pmTdRvbHigh0FatalUpdate(4), 2);
  assert.equal(pmTdRvbHigh0FatalUpdate(2), 2);
  assert.equal(pmTdRvbHigh0FatalUpdate(-7), 2);
  /* wrap: INT_MIN - 2 = 0x7ffffffe > 2 — the add eax,-2 wraps. */
  assert.equal(pmTdRvbHigh0FatalUpdate(-0x80000000), 0x7ffffffe);
  for (const v of [-5, 0, 2, 4, 5, 100, -0x80000000, 0x7fffffff]) {
    assert.equal(pmTdRvbHigh0SoulUpdate(v), 2, `soul ${v}`);
  }
  assert.equal(pmTdRvbHigh0ExtraLivesGate(1, 8), 1);
  assert.equal(pmTdRvbHigh0ExtraLivesGate(0x100, 8), 0); /* low byte 0 */
  assert.equal(pmTdRvbHigh0ExtraLivesGate(1, 9), 0);
  assert.equal(pmTdRvbHigh0ExtraLivesGate(0x1ff, 8), 1);
  assert.equal(pmTdRvbTwinPosAdopt(0), 0);
  assert.equal(pmTdRvbTwinPosAdopt(0x100), 1);

  /* zero-store plans + constant 134c stores. */
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_CASE0), 0xfc);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_CASE1), 0xf4);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_CASE2), 0xf7);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_CASE3), 0xfc);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_EQ137), 0xe7);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_HIGH0), 0xfc);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_HIGH1), 0xf5);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_HIGH2), 0xfc);
  assert.equal(pmTdRvbZeroMask(PM_TD_RVB_BODY_DEFAULT), 0);
  assert.equal(pmTdRvbZeroMask(9), -1);
  assert.equal(pmTdRvbZeroMask(-1), -1);
  assert.equal(pmTdRvbConst134c(PM_TD_RVB_BODY_CASE2), 6);
  assert.equal(pmTdRvbConst134c(PM_TD_RVB_BODY_EQ137), 4);
  assert.equal(pmTdRvbConst134c(PM_TD_RVB_BODY_HIGH1), 1);
  assert.equal(pmTdRvbConst134c(PM_TD_RVB_BODY_CASE0), -1);
  assert.equal(pmTdRvbConst134c(PM_TD_RVB_BODY_HIGH2), -1);

  /* flag-gate coverage per body: five special bodies only. */
  for (const b of [0, 1, 2, 3, 4]) {
    assert.equal(pmTdRvbHasFlagGate(b), 1, `gate body ${b}`);
  }
  for (const b of [5, 6, 7, 8, -1, 9]) {
    assert.equal(pmTdRvbHasFlagGate(b), 0, `no gate body ${b}`);
  }
});

test("v11 census: body law over ALL 202 table entries + gap + HIGH", (t) => {
  /* The byte table at 0x007a335c was re-read from the image for this unit:
     202 entries, histogram {0:1, 1:1, 2:1, 3:1, 4:198}, specials at ids
     0x0b/0x51/0xa1/0xd4, past-end bytes 0xcc int3 padding. This test walks
     the WHOLE dispatch domain and asserts model + Wasm agree with that law
     — a bias/limit off-by-one anywhere breaks it. */
  let covered = 0;
  let mismatches = 0;
  const hist = new Map();
  const checkOne = (id, wantBody) => {
    const jsBody = pmTdRvbBodyFromId(id);
    const wasmBody = wasm.isaac_pm_td_rvb_body_from_id(id | 0) | 0;
    const va = wasm.isaac_pm_td_rvh_dispatch_va(id | 0) >>> 0;
    if (jsBody !== wantBody || wasmBody !== wantBody ||
        RVB_VA_TO_BODY.get(va) !== wantBody) {
      mismatches += 1;
      return;
    }
    /* notify stage coherence: stage >= 0 exactly for the five special
       stage bodies, and the stage matches the fixed per-body value. */
    const stage = wasm.isaac_pm_td_rvb_notify_stage(id | 0) | 0;
    assert.equal(stage, pmTdRvbNotifyStage(id), `stage ${id}`);
    const wantStage =
      [7, 6, 5, 8, 9][wantBody] !== undefined && wantBody <= 4
        ? [7, 6, 5, 8, 9][wantBody]
        : -1;
    if (stage !== wantStage) {
      mismatches += 1;
    }
  };

  /* All 202 byte-table entries (idx 0..0xc9, id 0xb..0xd4). */
  const special = new Map([
    [0xb, PM_TD_RVB_BODY_CASE0],
    [0x51, PM_TD_RVB_BODY_CASE1],
    [0xa1, PM_TD_RVB_BODY_CASE2],
    [0xd4, PM_TD_RVB_BODY_CASE3],
  ]);
  for (let idx = 0; idx <= 0xc9; idx += 1) {
    const id = 0xb + idx;
    const body = special.get(id) ?? PM_TD_RVB_BODY_DEFAULT;
    checkOne(id, body);
    covered += 1;
    const tcase = wasm.isaac_pm_td_rvh_table_case(id | 0) | 0;
    hist.set(tcase, (hist.get(tcase) ?? 0) + 1);
  }
  assert.equal(covered, 202, "census covered");
  assert.equal(mismatches, 0, "census mismatches");
  assert.equal(hist.get(0), 1);
  assert.equal(hist.get(1), 1);
  assert.equal(hist.get(2), 1);
  assert.equal(hist.get(3), 1);
  assert.equal(hist.get(4), 198);

  /* Below-bias, gap and HIGH ranges + int32 boundaries. */
  for (let id = -2; id <= 0xa; id += 1) {
    checkOne(id, PM_TD_RVB_BODY_DEFAULT);
  }
  for (let id = 0xd5; id <= 0x136; id += 1) {
    checkOne(id, PM_TD_RVB_BODY_DEFAULT);
  }
  checkOne(0x137, PM_TD_RVB_BODY_EQ137);
  for (let id = 0x138; id <= 0x2b8; id += 1) {
    const body =
      id === 0x14c ? PM_TD_RVB_BODY_HIGH0 :
      id === 0x26b ? PM_TD_RVB_BODY_HIGH1 :
      id === 0x2b0 ? PM_TD_RVB_BODY_HIGH2 : PM_TD_RVB_BODY_DEFAULT;
    checkOne(id, body);
  }
  for (const id of [-0x80000000, -0x7fffffff, -1, 0x2b9, 0x10000, 0x7fffffff]) {
    checkOne(id, PM_TD_RVB_BODY_DEFAULT);
  }
  assert.equal(mismatches, 0, "extended census mismatches");
  t.diagnostic(
    `v11 census: ${covered}/202 table entries covered, ${mismatches} mismatches`,
  );
  v11Cases += covered;
});

test("Wasm matches JS: v11 RVB fixed + wide byte drives", (t) => {
  let cases = 0;
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xff00, 0xffffffff];

  /* flag gate: flag and chain are BYTE tested, fatal is a dword. */
  for (const w of wide) {
    assert.equal(
      wasm.isaac_pm_td_rvb_flag_arm(w >>> 0, 0, 0) | 0,
      pmTdRvbFlagArm(w, 0, 0),
      `wide flag ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_flag_arm(1, w >>> 0, 0) | 0,
      pmTdRvbFlagArm(1, w, 0),
      `wide fatal ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_flag_arm(1, 0, w >>> 0) | 0,
      pmTdRvbFlagArm(1, 0, w),
      `wide chain ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_heal_gate(1, w >>> 0, 1) | 0,
      pmTdRvbHealGate(1, w, 1),
      `wide dead ${w}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_extra_lives_gate(w >>> 0, 8) | 0,
      pmTdRvbHigh0ExtraLivesGate(w, 8),
      `wide has ${w}`,
    );
    cases += 5;
  }
  /* PE truth pinned directly: low-byte-zero wide values behave as zero. */
  assert.equal(wasm.isaac_pm_td_rvb_flag_arm(0x100, 5, 0), PM_TD_RVB_ARM_SKIP);
  assert.equal(wasm.isaac_pm_td_rvb_flag_arm(1, 0, 0x100), PM_TD_RVB_ARM_NOTIFY);
  assert.equal(wasm.isaac_pm_td_rvb_heal_gate(1, 0x100, 1), 1);
  assert.equal(wasm.isaac_pm_td_rvb_high0_extra_lives_gate(0x100, 8), 0);
  cases += 4;

  /* notify funnel. */
  for (const v of [-0x80000000, -5, -4, -2, -1, 0, 3, 6, 7, 8, 0x7fffffff]) {
    assert.equal(
      wasm.isaac_pm_td_rvb_notify_clamp(v | 0) | 0,
      pmTdRvbNotifyClamp(v),
      `clamp ${v}`,
    );
    const m = wasm.isaac_pm_td_rvb_notify_mod4(v | 0) | 0;
    assert.equal(m, pmTdRvbNotifyMod4(v), `mod ${v}`);
    assert.equal(m, ((v | 0) % 4) | 0, `mod truth ${v}`);
    cases += 3;
  }

  /* exit routes, floor, heal. */
  for (const arm of [0, 1, 2, 3]) {
    assert.equal(
      wasm.isaac_pm_td_rvb_exit_route_va(arm) >>> 0,
      pmTdRvbExitRouteVa(arm) >>> 0,
      `route ${arm}`,
    );
    cases += 1;
  }
  for (const v of [0x59, 0x5a, 0x5b, 0, -1, -0x80000000, 0x7fffffff]) {
    assert.equal(
      wasm.isaac_pm_td_rvb_timer_floor(v | 0) | 0,
      pmTdRvbTimerFloor(v),
      `floor ${v}`,
    );
    cases += 1;
  }
  const healPins = [
    [6, 4, 2, 1, 4],
    [0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1],
    [3, 3, 3, 2, 6],   /* odd 0x134c: the +1 in (134c+1)/2 is load-bearing */
    [-3, 5, -1, 0, -1],
    [0x7fffffff, 0x7fffffff, 0, 0, -1073741824],
  ];
  for (const [a, b, c, d, want] of healPins) {
    const cap = wasm.isaac_pm_td_rvb_heal_capacity(a | 0, b | 0, c | 0, d | 0) | 0;
    assert.equal(cap, want, `cap pin ${a},${b},${c},${d}`);
    assert.equal(cap, pmTdRvbHealCapacity(a, b, c, d));
    cases += 2;
  }
  assert.equal(wasm.isaac_pm_td_rvb_heal_applies(5, 4), 1);
  assert.equal(wasm.isaac_pm_td_rvb_heal_excess(5, 4), 1);
  assert.equal(wasm.isaac_pm_td_rvb_heal_excess(0x7fffffff, -0x80000000 | 0), -1);
  cases += 3;

  /* machines: fixed pins incl. the CASE0-vs-CASE3 divergence. */
  assert.equal(wasm.isaac_pm_td_rvb_case0_branch(2, -1, 0), PM_TD_RVB_CASE0_BRANCH_KEEP);
  assert.equal(wasm.isaac_pm_td_rvb_case0_branch(3, 5, 0), PM_TD_RVB_CASE0_BRANCH_KEEP);
  assert.equal(wasm.isaac_pm_td_rvb_case0_branch(3, 0, 0), PM_TD_RVB_CASE0_BRANCH_HT3);
  assert.equal(wasm.isaac_pm_td_rvb_case3_branch(-1, 2, 2, 0), PM_TD_RESET_BRANCH_ELSE);
  assert.equal(wasm.isaac_pm_td_rvb_case0_bone_arg(-7), -3);
  assert.equal(wasm.isaac_pm_td_rvb_case0_bone_arg(7), 3);
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_probes(PM_TD_RVB_CASE0_BRANCH_HT1), 2);
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_probes(PM_TD_RVB_CASE0_BRANCH_HT4), 1);
  assert.equal(wasm.isaac_pm_td_rvb_case1_branch(2), PM_TD_RVB_CASE1_BRANCH_HT2);
  assert.equal(wasm.isaac_pm_td_rvb_case1_soul2(PM_TD_RVB_CASE1_BRANCH_ELSE), 1);
  assert.equal(wasm.isaac_pm_td_rvb_case1_recurse(0xffffffff | 0), 1);
  cases += 11;

  /* chars + HIGH0 + HIGH2 pins. */
  assert.equal(wasm.isaac_pm_td_rvb_case2_new_char(0x19), 0x19);
  assert.equal(wasm.isaac_pm_td_rvb_case2_new_char(0x1a), 4);
  assert.equal(wasm.isaac_pm_td_rvb_eq137_new_char(0x18), 0x18);
  assert.equal(wasm.isaac_pm_td_rvb_eq137_new_char(0), 0xc);
  assert.equal(wasm.isaac_pm_td_rvb_high0_new_char(0x1d), 0x1d);
  assert.equal(wasm.isaac_pm_td_rvb_high0_new_char(0x26), 0x26);
  assert.equal(wasm.isaac_pm_td_rvb_high0_new_char(0x27), 0xb);
  assert.equal(wasm.isaac_pm_td_rvb_high2_first_sfx(PM_TD_CHAR_PATH_2), 0x1c);
  assert.equal(
    wasm.isaac_pm_td_rvb_high2_first_sfx_vol_bits(PM_TD_CHAR_PATH_1) >>> 0,
    0x3f800000,
  );
  assert.equal(wasm.isaac_pm_td_rvb_high2_sfx_count(PM_TD_CHAR_PATH_1), 1);
  assert.equal(wasm.isaac_pm_td_rvb_high0_costume_kind(8), PM_TD_RVB_HIGH0_COSTUME_SKIP);
  assert.equal(wasm.isaac_pm_td_rvb_high0_costume_kind(0x23), PM_TD_RVB_HIGH0_COSTUME_NO_PRE);
  assert.equal(wasm.isaac_pm_td_rvb_high0_cfg_in_bounds(0x1000, 0x1000 + 0x533), 0);
  assert.equal(wasm.isaac_pm_td_rvb_high0_cfg_in_bounds(0x1000, 0x1000 + 0x534), 1);
  assert.equal(wasm.isaac_pm_td_rvb_high0_item_gate(0x1000, 0x1000 + 0xc4, 5), 0);
  assert.equal(wasm.isaac_pm_td_rvb_high0_item_gate(0x1000, 0x1000 + 0xc8, 5), 1);
  assert.equal(wasm.isaac_pm_td_rvb_high0_fatal_update(-0x80000000 | 0), 0x7ffffffe);
  assert.equal(wasm.isaac_pm_td_rvb_high0_soul_update(-0x80000000 | 0), 2);
  assert.equal(wasm.isaac_pm_td_rvb_twin_pos_adopt(0x100), 1);
  cases += 19;

  /* plan tables over every body id. */
  for (let b = -1; b <= 9; b += 1) {
    assert.equal(
      wasm.isaac_pm_td_rvb_zero_mask(b | 0) | 0,
      pmTdRvbZeroMask(b),
      `mask ${b}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_const_134c(b | 0) | 0,
      pmTdRvbConst134c(b),
      `const134c ${b}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_has_flag_gate(b | 0) | 0,
      pmTdRvbHasFlagGate(b),
      `hasgate ${b}`,
    );
    cases += 3;
  }

  t.diagnostic(`v11 fixed differential cases executed: ${cases}`);
  v11Cases += cases;
  assert.ok(cases >= 150, `expected >= 150 executed cases, got ${cases}`);
});

test("deterministic randomized differential corpus: v11 RVB", (t) => {
  let seed = 0x7a2456 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* HIGH bits: this LCG's low bits have period 2^k. */
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);

  const idBoundary = [
    -0x80000000, -1, 0, 0xa, 0xb, 0x51, 0xa1, 0xd4, 0xd5, 0x136, 0x137,
    0x138, 0x14c, 0x26b, 0x2b0, 0x2b1, 0x7fffffff,
  ];
  const seenArms = new Set();
  const seenBodies = new Set();
  const seenStages = new Set();
  const seenCase0 = new Set();
  const seenCase1 = new Set();
  const seenCase3 = new Set();
  const seenCostume = new Set();
  let divergences = 0;
  let cases = 0;

  for (let trial = 0; trial < 800; trial += 1) {
    const mode = pick(3);
    const id = mode === 0
      ? idBoundary[pick(idBoundary.length)]
      : mode === 1
        ? pick(0x380) - 0x20
        : (rnd() | 0);

    /* body law + dispatch coherence on every draw. */
    const body = wasm.isaac_pm_td_rvb_body_from_id(id | 0) | 0;
    assert.equal(body, pmTdRvbBodyFromId(id), `rnd body ${trial}/${id}`);
    const va = wasm.isaac_pm_td_rvh_dispatch_va(id | 0) >>> 0;
    assert.equal(RVB_VA_TO_BODY.get(va), body, `rnd body/va ${trial}/${id}`);
    seenBodies.add(body);
    const stage = wasm.isaac_pm_td_rvb_notify_stage(id | 0) | 0;
    assert.equal(stage, pmTdRvbNotifyStage(id), `rnd stage ${trial}`);
    if (stage !== -1) {
      seenStages.add(stage);
    }
    assert.equal(
      wasm.isaac_pm_td_rvb_has_flag_gate(body) | 0,
      stage !== -1 ? 1 : 0,
      `rnd gate/stage coherence ${trial}`,
    );
    cases += 4;

    /* flag gate with wide-byte bias. */
    const wf = pick(4) === 0 ? [0x100, 0x1ff, 0xff00, 0xffffffff][pick(4)] : pick(2);
    const fat = pick(3) === 0 ? rnd() >>> 0 : pick(2);
    const chn = pick(4) === 0 ? [0x100, 0xff00][pick(2)] : pick(2);
    const arm = wasm.isaac_pm_td_rvb_flag_arm(wf >>> 0, fat >>> 0, chn >>> 0) | 0;
    assert.equal(arm, pmTdRvbFlagArm(wf, fat, chn), `rnd arm ${trial}`);
    seenArms.add(arm);
    assert.equal(
      wasm.isaac_pm_td_rvb_exit_route_va(arm) >>> 0,
      pmTdRvbExitRouteVa(arm) >>> 0,
      `rnd route ${trial}`,
    );
    cases += 2;

    /* notify funnel with boundary bias + independent %4 truth. */
    const nv = pick(3) === 0
      ? [-1, 0, 6, 7, 8, -0x80000000, 0x7fffffff][pick(7)]
      : (rnd() | 0);
    assert.equal(
      wasm.isaac_pm_td_rvb_notify_clamp(nv | 0) | 0,
      pmTdRvbNotifyClamp(nv),
      `rnd clamp ${trial}`,
    );
    const md = wasm.isaac_pm_td_rvb_notify_mod4(nv | 0) | 0;
    assert.equal(md, pmTdRvbNotifyMod4(nv), `rnd mod ${trial}`);
    assert.equal(md, ((nv | 0) % 4) | 0, `rnd mod truth ${trial}`);
    cases += 3;

    /* floor + heal. */
    const tf = pick(3) === 0 ? 0x58 + pick(5) : (rnd() | 0);
    assert.equal(
      wasm.isaac_pm_td_rvb_timer_floor(tf | 0) | 0,
      pmTdRvbTimerFloor(tf),
      `rnd floor ${trial}`,
    );
    const g26614 = pick(3) === 0 ? pick(4) - 1 : (rnd() | 0);
    const dead = pick(4) === 0 ? 0x100 : pick(2);
    const red = pick(3) === 0 ? pick(5) - 1 : (rnd() | 0);
    assert.equal(
      wasm.isaac_pm_td_rvb_heal_gate(g26614 | 0, dead >>> 0, red | 0) | 0,
      pmTdRvbHealGate(g26614, dead, red),
      `rnd heal gate ${trial}`,
    );
    const hv = () => (pick(3) === 0 ? pick(9) - 2 : (rnd() | 0));
    const c1340 = hv(); const c1344 = hv(); const c134c = hv(); const c1d88 = hv();
    const cap = wasm.isaac_pm_td_rvb_heal_capacity(
      c1340 | 0, c1344 | 0, c134c | 0, c1d88 | 0) | 0;
    assert.equal(cap, pmTdRvbHealCapacity(c1340, c1344, c134c, c1d88),
      `rnd cap ${trial}`);
    /* PE truth on the wrap-free subset: trunc halves of small values. */
    if (Math.abs(c1340) < 0x100000 && Math.abs(c1344) < 0x100000 &&
        Math.abs(c134c) < 0x100000 && Math.abs(c1d88) < 0x100000) {
      const m = Math.min(c1340 | 0, c1344 | 0);
      const truth = Math.trunc((m + 1) / 2) + Math.trunc(((c134c | 0) + 1) / 2)
        + (c1d88 | 0);
      assert.equal(cap, truth | 0, `rnd cap truth ${trial}`);
    }
    assert.equal(
      wasm.isaac_pm_td_rvb_heal_applies(red | 0, cap | 0) | 0,
      pmTdRvbHealApplies(red, cap),
      `rnd applies ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_heal_excess(red | 0, cap | 0) | 0,
      pmTdRvbHealExcess(red, cap),
      `rnd excess ${trial}`,
    );
    cases += 5;

    /* machines. */
    const ht = pick(2) === 0 ? pick(6) : (rnd() | 0);
    const f1340 = pick(2) === 0 ? pick(5) - 2 : (rnd() | 0);
    const mc = pick(3) === 0 ? 0x12 : (rnd() | 0);
    const b0 = wasm.isaac_pm_td_rvb_case0_branch(ht | 0, f1340 | 0, mc | 0) | 0;
    assert.equal(b0, pmTdRvbCase0Branch(ht, f1340, mc), `rnd case0 ${trial}`);
    seenCase0.add(b0);
    assert.equal(
      wasm.isaac_pm_td_rvb_case0_cfg_probes(b0) | 0,
      pmTdRvbCase0CfgProbes(b0),
      `rnd probes0 ${trial}`,
    );
    const cfg = rnd() | 0;
    assert.equal(
      wasm.isaac_pm_td_rvb_case0_bone_arg(cfg) | 0,
      pmTdRvbCase0BoneArg(cfg),
      `rnd bone ${trial}`,
    );
    const b1 = wasm.isaac_pm_td_rvb_case1_branch(ht | 0) | 0;
    assert.equal(b1, pmTdRvbCase1Branch(ht), `rnd case1 ${trial}`);
    seenCase1.add(b1);
    assert.equal(
      wasm.isaac_pm_td_rvb_case1_soul2(b1) | 0,
      pmTdRvbCase1Soul2(b1),
      `rnd soul2 ${trial}`,
    );
    const ht2 = pick(2) === 0 ? pick(6) : (rnd() | 0);
    const b3 = wasm.isaac_pm_td_rvb_case3_branch(f1340 | 0, ht | 0, ht2 | 0, mc | 0) | 0;
    assert.equal(b3, pmTdRvbCase3Branch(f1340, ht, ht2, mc), `rnd case3 ${trial}`);
    seenCase3.add(b3);
    /* three-way sibling agreement on every draw (JS + Wasm). */
    const bh = wasm.isaac_pm_td_rvb_high2_branch(f1340 | 0, ht | 0, ht2 | 0, mc | 0) | 0;
    assert.equal(bh, b3, `rnd high2==case3 ${trial}`);
    assert.equal(
      b3,
      wasm.isaac_pm_td_reset_health_branch(f1340 | 0, ht | 0, ht2 | 0, mc | 0) | 0,
      `rnd case3==reset ${trial}`,
    );
    assert.equal(bh, pmTdRvbHigh2Branch(f1340, ht, ht2, mc));
    /* count the CASE0-vs-CASE3 anti-merge divergence when it fires. */
    if (f1340 !== 0 && f1340 <= 0 && ht !== 1 && ht !== 4) {
      /* CASE0 KEEPs on any nonzero 1340; CASE3 probes through. */
      assert.equal(b0, PM_TD_RVB_CASE0_BRANCH_KEEP, `rnd keep ${trial}`);
      divergences += 1;
    }
    cases += 8;

    /* chars / HIGH0 / HIGH2 / plans. */
    const cc = pick(2) === 0
      ? [8, 0xa, 0x10, 0x12, 0x18, 0x19, 0x1d, 0x1f, 0x23, 0x26, 0x27][pick(11)]
      : (rnd() | 0);
    assert.equal(
      wasm.isaac_pm_td_rvb_case2_new_char(cc | 0) | 0,
      pmTdRvbCase2NewChar(cc),
      `rnd c2char ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_eq137_new_char(cc | 0) | 0,
      pmTdRvbEq137NewChar(cc),
      `rnd eqchar ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_new_char(cc | 0) | 0,
      pmTdRvbHigh0NewChar(cc),
      `rnd h0char ${trial}`,
    );
    const kind = wasm.isaac_pm_td_rvb_high0_costume_kind(cc | 0) | 0;
    assert.equal(kind, pmTdRvbHigh0CostumeKind(cc), `rnd costume ${trial}`);
    seenCostume.add(kind);
    const path = wasm.isaac_pm_td_rvb_high2_char_path(cc | 0) | 0;
    assert.equal(path, pmTdRvbHigh2CharPath(cc), `rnd h2path ${trial}`);
    assert.equal(
      path,
      wasm.isaac_pm_td_char_death_path(cc | 0) | 0,
      `rnd h2path==v10 ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_high2_first_sfx(path) | 0,
      pmTdRvbHigh2FirstSfx(path),
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_high2_first_sfx_vol_bits(path) >>> 0,
      pmTdRvbHigh2FirstSfxVolBits(path) >>> 0,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_high2_sfx_count(path) | 0,
      pmTdRvbHigh2SfxCount(path),
    );
    /* bounds with exact-boundary span bias (u32 wrap allowed). */
    const begin = rnd() >>> 0;
    const span = pick(2) === 0
      ? [0, 0xc0, 0xc4, 0xc8, 0x52c, 0x530, 0x533, 0x534, 0x538][pick(9)]
      : rnd() >>> 0;
    const end = (begin + span) >>> 0;
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_cfg_in_bounds(begin >>> 0, end >>> 0) | 0,
      pmTdRvbHigh0CfgInBounds(begin, end),
      `rnd cfgb ${trial}`,
    );
    const elem = pick(3) === 0 ? 0 : rnd() >>> 0;
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_item_gate(begin >>> 0, end >>> 0, elem >>> 0) | 0,
      pmTdRvbHigh0ItemGate(begin, end, elem),
      `rnd itemg ${trial}`,
    );
    const fu = pick(3) === 0 ? [-0x80000000, 0, 2, 4, 5][pick(5)] : (rnd() | 0);
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_fatal_update(fu | 0) | 0,
      pmTdRvbHigh0FatalUpdate(fu),
      `rnd fatalu ${trial}`,
    );
    assert.equal(wasm.isaac_pm_td_rvb_high0_soul_update(fu | 0) | 0, 2);
    const has = pick(4) === 0 ? 0x100 : pick(2);
    assert.equal(
      wasm.isaac_pm_td_rvb_high0_extra_lives_gate(has >>> 0, cc | 0) | 0,
      pmTdRvbHigh0ExtraLivesGate(has, cc),
      `rnd lives ${trial}`,
    );
    const twin = pick(2) === 0 ? 0 : rnd() >>> 0;
    assert.equal(
      wasm.isaac_pm_td_rvb_case1_recurse(twin >>> 0) | 0,
      pmTdRvbCase1Recurse(twin),
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_twin_pos_adopt(twin >>> 0) | 0,
      pmTdRvbTwinPosAdopt(twin),
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_zero_mask(body) | 0,
      pmTdRvbZeroMask(body),
      `rnd mask ${trial}`,
    );
    assert.equal(
      wasm.isaac_pm_td_rvb_const_134c(body) | 0,
      pmTdRvbConst134c(body),
      `rnd c134c ${trial}`,
    );
    cases += 15;
  }

  /* Coverage: the corpus must actually reach every seeded value. */
  for (const a of [0, 1, 2, 3]) {
    assert.ok(seenArms.has(a), `corpus missed arm ${a}`);
  }
  for (let b = 0; b <= 8; b += 1) {
    assert.ok(seenBodies.has(b), `corpus missed body ${b}`);
  }
  for (const s of [5, 6, 7, 8, 9]) {
    assert.ok(seenStages.has(s), `corpus missed stage ${s}`);
  }
  for (let b = 0; b <= 5; b += 1) {
    assert.ok(seenCase0.has(b), `corpus missed case0 branch ${b}`);
    assert.ok(seenCase3.has(b), `corpus missed case3 branch ${b}`);
  }
  for (let b = 0; b <= 3; b += 1) {
    assert.ok(seenCase1.has(b), `corpus missed case1 branch ${b}`);
  }
  for (const k of [0, 1, 2]) {
    assert.ok(seenCostume.has(k), `corpus missed costume kind ${k}`);
  }
  assert.ok(divergences > 0, "corpus never hit the CASE0/CASE3 divergence");

  v11Cases += cases;
  t.diagnostic(`v11 randomized differential cases executed: ${cases}`);
  t.diagnostic(`v11 total differential cases executed: ${v11Cases}`);
  assert.ok(cases >= 20000, `expected >= 20000 executed cases, got ${cases}`);
});

/* ====================================================================== */
/* ABI v12 — CFG: the CASE0 config probe at VA 0x0069bd10, whole body.    */
/* Function span 0x0069bd10..0x0069bd4c (int3 padding at 0x0069bd4f),     */
/* __thiscall, one stack arg, two `ret 4` exits, LEAF (zero outbound      */
/* rel32 calls in a whole-.text census).                                  */
/* ====================================================================== */

/* Every v12 literal, pinned in the header TEXT and cross-checked against
   the model export. A header-only constant is invisible to the Wasm
   differential, so both sides are required (M10 in v11 proved this
   assertion discriminates). */
const V12_CFG_LITERALS = [
  ["ISAAC_PM_TD_RVB_CFG_VEC_OFF", "0x2a670", PM_TD_RVB_CFG_VEC_OFF, 0x2a670],
  ["ISAAC_PM_TD_RVB_CFG_BEGIN_OFF", "8", PM_TD_RVB_CFG_BEGIN_OFF, 8],
  ["ISAAC_PM_TD_RVB_CFG_END_OFF", "0xc", PM_TD_RVB_CFG_END_OFF, 0xc],
  ["ISAAC_PM_TD_RVB_CFG_STRIDE", "0x148", PM_TD_RVB_CFG_STRIDE, 0x148],
  ["ISAAC_PM_TD_RVB_CFG_DIV_MAGIC", "0x63e7063f",
   PM_TD_RVB_CFG_DIV_MAGIC, 0x63e7063f],
  ["ISAAC_PM_TD_RVB_CFG_DIV_SHIFT", "7", PM_TD_RVB_CFG_DIV_SHIFT, 7],
  ["ISAAC_PM_TD_RVB_CFG_PROBE_0", "0", PM_TD_RVB_CFG_PROBE_0, 0],
  ["ISAAC_PM_TD_RVB_CFG_PROBE_1", "1", PM_TD_RVB_CFG_PROBE_1, 1],
  ["ISAAC_PM_TD_RVB_CFG_SITE_UNCHECKED", "0",
   PM_TD_RVB_CFG_SITE_UNCHECKED, 0],
  ["ISAAC_PM_TD_RVB_CFG_SITE_CHECKED", "1", PM_TD_RVB_CFG_SITE_CHECKED, 1],
  ["ISAAC_PM_TD_RVB_CFG_SITE_UNKNOWN", "-1", PM_TD_RVB_CFG_SITE_UNKNOWN, -1],
  ["ISAAC_PM_TD_RVB_CFG_VA_RET_IN_RANGE", "0x0069bd44",
   PM_TD_RVB_CFG_VA_RET_IN_RANGE, 0x0069bd44],
  ["ISAAC_PM_TD_RVB_CFG_VA_RET_FALLBACK", "0x0069bd47",
   PM_TD_RVB_CFG_VA_RET_FALLBACK, 0x0069bd47],
  ["ISAAC_PM_TD_RVB_CFG_VA_END", "0x0069bd4c", PM_TD_RVB_CFG_VA_END,
   0x0069bd4c],
  ["ISAAC_PM_TD_RVB_CFG_MANAGER_GLOBAL_VA", "0x00c7169c",
   PM_TD_RVB_CFG_MANAGER_GLOBAL_VA, 0x00c7169c],
  ["ISAAC_PM_TD_RVB_CFG_VA_RECEIVER_GETTER", "0x00417910",
   PM_TD_RVB_CFG_VA_RECEIVER_GETTER, 0x00417910],
  ["ISAAC_PM_TD_RVB_CFG_SITE_5BE49E", "0x005be49e",
   PM_TD_RVB_CFG_SITE_5BE49E, 0x005be49e],
  ["ISAAC_PM_TD_RVB_CFG_SITE_65D7CE", "0x0065d7ce",
   PM_TD_RVB_CFG_SITE_65D7CE, 0x0065d7ce],
  ["ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_A", "0x007a24bb",
   PM_TD_RVB_CFG_SITE_CASE0_HT1_A, 0x007a24bb],
  ["ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_B", "0x007a24d9",
   PM_TD_RVB_CFG_SITE_CASE0_HT1_B, 0x007a24d9],
  ["ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT4", "0x007a2518",
   PM_TD_RVB_CFG_SITE_CASE0_HT4, 0x007a2518],
  ["ISAAC_PM_TD_RVB_CFG_SITE_8ECB88", "0x008ecb88",
   PM_TD_RVB_CFG_SITE_8ECB88, 0x008ecb88],
  ["ISAAC_PM_TD_RVB_CFG_SITE_9A2E30", "0x009a2e30",
   PM_TD_RVB_CFG_SITE_9A2E30, 0x009a2e30],
];

test("v12 CFG: every new literal pinned in the header AND the model", () => {
  const h = readFileSync(header, "utf8");
  for (const [name, literal, modelValue, expected] of V12_CFG_LITERALS) {
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${literal.replace("-", "\\-")}\\b`),
      `header literal ${name} = ${literal}`,
    );
    assert.equal(modelValue, expected, `model constant ${name}`);
  }
  assert.equal(V12_CFG_LITERALS.length, 23);
});

test("v12 CFG: header transcribes the body and the recovered fallback tail",
     () => {
  const h = readFileSync(header, "utf8");
  /* Both exits and the recovered fallback tail. */
  assert.match(h, /0x0069bd47\s+pop edi\s+; FALLBACK TAIL/);
  assert.match(h, /0x0069bd48\s+xor eax,eax\s+; return NULL/);
  assert.match(h, /0x0069bd44\s+ret 4\s+; IN-RANGE exit/);
  /* The three arithmetic steps that a shortcut model would drop. */
  assert.match(h, /imul ecx\s+; SIGNED EDX:EAX = magic \* span/);
  assert.match(h, /sar edx,7\s+; arithmetic shift of the HIGH dword/);
  assert.match(h, /shr eax,0x1f\s+; sign fix/);
  /* Both signed gates named as signed. */
  assert.match(h, /js\s+0x0069bd47\s+; SIGNED: id < 0 -> fallback tail/);
  assert.match(h, /jge 0x0069bd47\s+; SIGNED: id >= count -> fallback/);
  /* The magic identity and the unsigned-shortcut witnesses. */
  assert.match(h, /ceil\(2\^39 \/ 0x148\)/);
  assert.match(h, /13094412/);
  assert.match(h, /-6547206/);
  /* The runtime-state finding for 0x00c7169c. */
  assert.match(h, /0x00c7169c IS RUNTIME STATE, NOT A CONSTANT/);
  assert.match(h, /0x009aaab0/);
  assert.match(h, /0x009ab8cc/);
  /* The original defect, named as reproduced not corrected. */
  assert.match(h, /ORIGINAL-BINARY DEFECT, reproduced and pinned, never corrected/);
  /* The leaf / address-stable evidence. */
  assert.match(h, /NO exact match, so the VA stays\s+address-stable/);
});

test("Wasm matches JS: v12 CFG magic division replays the machine sequence",
     (t) => {
  let cases = 0;
  /* base is arbitrary; only end-begin matters, and it wraps at 32 bits. */
  const atSpan = (span) => {
    const begin = 0x40000000 >>> 0;
    const end = (begin + span) >>> 0;
    const w = wasm.isaac_pm_td_rvb_cfg_count(begin, end) | 0;
    const j = pmTdRvbCfgCount(begin, end);
    assert.equal(w, j, `cfg_count span ${span}`);
    cases += 1;
    return w;
  };

  /* Exact quotients around the stride. */
  assert.equal(atSpan(0), 0, "span 0");
  assert.equal(atSpan(0x147), 0, "span 0x147 (one byte short)");
  assert.equal(atSpan(0x148), 1, "span 0x148");
  assert.equal(atSpan(0x148 * 5), 5, "span 5 strides");
  assert.equal(atSpan(0x148 * 5 + 0x147), 5, "span 5 strides + remainder");

  /* `sar edx,7` — a wrong shift count rescales every quotient. */
  assert.equal(atSpan(1640), 5, "shift 7 pin: 1640/0x148 == 5 (8 -> 2, 6 -> 10)");

  /* Sign fix `shr eax,0x1f / add eax,edx`: without it the sar FLOORS. */
  assert.equal(atSpan(-1), 0, "sign fix: -1/0x148 truncates to 0, not -1");
  assert.equal(atSpan(-329), -1, "sign fix: -329/0x148 truncates to -1, not -2");
  assert.equal(atSpan(-0x148), -1, "span -0x148");
  assert.equal(atSpan(-0x147), 0, "span -0x147");

  /* Magic-constant pins: the smallest spans at which magic +/- 1 diverges.
     Derived by search over the residue classes where the reciprocal error
     can cross an integer boundary. */
  assert.equal(atSpan(1249444167), 3809280,
               "magic pin: 0x63e70640 would give 3809281");
  assert.equal(atSpan(1249444824), 3809283,
               "magic pin: 0x63e7063e would give 3809282");
  assert.equal(atSpan(-1249444824), -3809283,
               "magic pin (negative): 0x63e7063e would give -3809282");

  /* INT_MIN / INT_MAX spans. */
  assert.equal(atSpan(-0x80000000), -6547206, "span INT_MIN");
  assert.equal(atSpan(0x7fffffff), 6547206, "span INT_MAX");

  /* The unsigned delta/stride shortcut that bit a sibling family. Each of
     these is a signed answer that the shortcut gets catastrophically
     wrong; if any assertion here flips, the model went unsigned. */
  for (const [span, signedCount, unsignedCount] of [
    [-1, 0, 13094412],
    [-0x148, -1, 13094411],
    [-0x100000, -3196, 13091215],
    [-0x80000000, -6547206, 6547206],
  ]) {
    const got = atSpan(span);
    assert.equal(got, signedCount, `signed count for span ${span}`);
    assert.notEqual(got, unsignedCount,
                    `span ${span} took the unsigned delta/stride shortcut`);
  }

  /* Third, independent cross-check: the sequence must agree with
     truncate-toward-zero division on a broad structured sweep, including
     the residue classes where a wrong magic can hide. */
  const spans = [];
  for (let n = -20000; n <= 20000; n += 1) spans.push(n);
  for (let k = -6547205; k <= 6547205; k += 104729) spans.push(k * 0x148 | 0);
  for (let d = -600; d <= 600; d += 1) {
    spans.push((-0x80000000 + d) | 0);
    spans.push((0x7fffffff - d) | 0);
    spans.push((1249444167 + d) | 0);
    spans.push((-1249444824 + d) | 0);
  }
  let swept = 0;
  for (const span of spans) {
    const begin = 0x20000000 >>> 0;
    const end = (begin + span) >>> 0;
    const w = wasm.isaac_pm_td_rvb_cfg_count(begin, end) | 0;
    assert.equal(w, pmTdRvbCfgCount(begin, end), `sweep span ${span}`);
    assert.equal(w, Math.trunc(span / 0x148) | 0,
                 `sweep span ${span} is not trunc-toward-zero`);
    swept += 1;
  }
  cases += swept;
  t.diagnostic(`v12 magic-division cases executed: ${cases} (swept ${swept})`);
  assert.ok(swept >= 40000, `expected a broad sweep, got ${swept}`);
});

test("Wasm matches JS: v12 CFG signed gates, fallback tail, exit VAs", () => {
  const begin = 0x00300000 >>> 0;
  const end = (begin + 0x148 * 6) >>> 0;

  /* `js` at 0x0069bd1a is SIGNED. An unsigned model can never take it and
     would instead run the count compare, which for id -1 (signed) passes
     and hands back begin - 0x148. */
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(-1, begin, end) | 0, 0,
               "`js` at 0x0069bd1a is signed: id -1 must fall back");
  assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(-1, begin, end) >>> 0, 0,
               "negative id must return NULL, not begin - 0x148");
  assert.notEqual(wasm.isaac_pm_td_rvb_cfg_entry(-1, begin, end) >>> 0,
                  (begin - 0x148) >>> 0,
                  "negative-id fallback was modelled unsigned");
  assert.equal(wasm.isaac_pm_td_rvb_cfg_exit_va(-1, begin, end) >>> 0,
               0x0069bd47);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(-0x80000000, begin, end) | 0,
               0);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(-0x80000000, begin, end) >>> 0,
               0);

  /* In-range ids. */
  for (let id = 0; id < 6; id += 1) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(id, begin, end) | 0, 1);
    assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(id, begin, end) >>> 0,
                 (begin + id * 0x148) >>> 0);
    assert.equal(wasm.isaac_pm_td_rvb_cfg_exit_va(id, begin, end) >>> 0,
                 0x0069bd44);
  }
  /* First out-of-range id — `jge` is signed and strict at count. */
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(6, begin, end) | 0, 0,
               "`jge` is >=, not >: id == count is already out of range");
  assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(6, begin, end) >>> 0, 0,
               "id == count must return NULL");
  assert.equal(wasm.isaac_pm_td_rvb_cfg_exit_va(6, begin, end) >>> 0,
               0x0069bd47);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(0x7fffffff, begin, end) | 0,
               0);

  /* Negative span: count is negative, so EVERY non-negative id falls back.
     The unsigned shortcut would report ~13 million valid entries. */
  const revEnd = (begin - 0x148 * 4) >>> 0;
  assert.equal(wasm.isaac_pm_td_rvb_cfg_count(begin, revEnd) | 0, -4);
  for (const id of [0, 1, 7, 1000, 13094410, 0x7fffffff]) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(id, begin, revEnd) | 0, 0,
                 `negative span must reject id ${id}`);
    assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(id, begin, revEnd) >>> 0, 0);
  }

  /* Empty vector: begin == end -> count 0 -> id 0 already out of range. */
  assert.equal(wasm.isaac_pm_td_rvb_cfg_count(begin, begin) | 0, 0);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(0, begin, begin) | 0, 0);

  /* The aliasing case the header calls out: begin == 0 and id == 0 in
     range returns 0 too, so the VALUE cannot distinguish hit from miss. */
  const zeroBegin = 0 >>> 0;
  const zeroEnd = (0x148 * 3) >>> 0;
  assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(0, zeroBegin, zeroEnd) >>> 0, 0);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_in_range(0, zeroBegin, zeroEnd) | 0, 1);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_exit_va(0, zeroBegin, zeroEnd) >>> 0,
               0x0069bd44);

  /* 32-bit wrap on `imul eax,esi,0x148` + `add eax,edi`. */
  const highBegin = 0xfffff000 >>> 0;
  const highEnd = (highBegin + 0x148 * 4) >>> 0;
  assert.equal(wasm.isaac_pm_td_rvb_cfg_entry(3, highBegin, highEnd) >>> 0,
               (0xfffff000 + 0x148 * 3) >>> 0);
  assert.equal(pmTdRvbCfgEntry(3, highBegin, highEnd) >>> 0,
               (0xfffff000 + 0x148 * 3) >>> 0);

  /* Receiver arithmetic, including the wrap. */
  assert.equal(wasm.isaac_pm_td_rvb_cfg_receiver(0x01000000) >>> 0,
               0x0102a670);
  assert.equal(wasm.isaac_pm_td_rvb_cfg_receiver(0xffffffff) >>> 0,
               0x0002a66f);
  assert.equal(pmTdRvbCfgReceiver(0xffffffff) >>> 0, 0x0002a66f);
});

test("Wasm matches JS: v12 CFG unmasked wide drives across the boundary",
     (t) => {
  /* No v12 export tests a byte, but the family rule is that every new
     export is driven with UNMASKED wide values so a silently-narrowed
     parameter cannot hide (the uint8_t toolchain defect). */
  const wide = [0, 1, 0xff, 0x100, 0x1ff, 0xff00, 0x80000000, 0xffffffff];
  let cases = 0;
  for (const a of wide) {
    for (const b of wide) {
      assert.equal(wasm.isaac_pm_td_rvb_cfg_count(a >>> 0, b >>> 0) | 0,
                   pmTdRvbCfgCount(a, b), `wide count ${a}/${b}`);
      assert.equal(wasm.isaac_pm_td_rvb_cfg_receiver(a >>> 0) >>> 0,
                   pmTdRvbCfgReceiver(a) >>> 0, `wide receiver ${a}`);
      for (const id of [0, 1, 0x100, 0x1ff, -1, -0x80000000, 0x7fffffff]) {
        assert.equal(
          wasm.isaac_pm_td_rvb_cfg_in_range(id | 0, a >>> 0, b >>> 0) | 0,
          pmTdRvbCfgInRange(id, a, b), `wide in_range ${id}/${a}/${b}`);
        assert.equal(
          wasm.isaac_pm_td_rvb_cfg_entry(id | 0, a >>> 0, b >>> 0) >>> 0,
          pmTdRvbCfgEntry(id, a, b) >>> 0, `wide entry ${id}/${a}/${b}`);
        assert.equal(
          wasm.isaac_pm_td_rvb_cfg_exit_va(id | 0, a >>> 0, b >>> 0) >>> 0,
          pmTdRvbCfgExitVa(id, a, b) >>> 0, `wide exit ${id}/${a}/${b}`);
        cases += 3;
      }
      cases += 2;
    }
  }
  /* Callsite census driven wide too. */
  for (const va of [0, 0x100, 0x1ff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0,
                 pmTdRvbCfgSiteNullChecked(va), `wide site ${va}`);
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0, -1);
    cases += 1;
  }
  t.diagnostic(`v12 wide-drive cases executed: ${cases}`);
  assert.ok(cases >= 200, `expected >= 200 wide cases, got ${cases}`);
});

test("Wasm matches JS: v12 CFG addressing indexes a real 0x148-stride vector",
     () => {
  /* The point of the unit: CASE0's config probe becomes pure address
     arithmetic. Lay a real 0x148-stride vector into Wasm scratch and read
     back through the addresses the helpers compute. */
  const view = new DataView(wasm.memory.buffer);
  const begin = SCRATCH;
  const count = 6;
  const end = begin + count * 0x148;
  for (let i = 0; i < count; i += 1) {
    const rec = begin + i * 0x148;
    writeU32(view, rec + 0xb0, (0xb0000000 + i) >>> 0);
    writeU32(view, rec + 0xb4, (0xb4000000 + i) >>> 0);
    writeU32(view, rec + 0xb8, (0xb8000000 + i) >>> 0);
  }
  assert.equal(wasm.isaac_pm_td_rvb_cfg_count(begin >>> 0, end >>> 0) | 0,
               count);

  for (let id = 0; id < count; id += 1) {
    /* HT1 slot 0 reads +0xb4 (0x007a24c7). */
    const a = wasm.isaac_pm_td_rvb_case0_cfg_field_va(
      PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CFG_PROBE_0, id,
      begin >>> 0, end >>> 0) >>> 0;
    /* HT1 slot 1 re-issues the SAME probe and reads +0xb8 (0x007a24e6). */
    const b = wasm.isaac_pm_td_rvb_case0_cfg_field_va(
      PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CFG_PROBE_1, id,
      begin >>> 0, end >>> 0) >>> 0;
    /* HT4 slot 0 reads +0xb0 (0x007a251f). */
    const c = wasm.isaac_pm_td_rvb_case0_cfg_field_va(
      PM_TD_RVB_CASE0_BRANCH_HT4, PM_TD_RVB_CFG_PROBE_0, id,
      begin >>> 0, end >>> 0) >>> 0;
    assert.equal(view.getUint32(a, true) >>> 0, (0xb4000000 + id) >>> 0,
                 `HT1 slot 0 must read entry[${id}]+0xb4`);
    assert.equal(view.getUint32(b, true) >>> 0, (0xb8000000 + id) >>> 0,
                 `HT1 slot 1 must read entry[${id}]+0xb8`);
    assert.equal(view.getUint32(c, true) >>> 0, (0xb0000000 + id) >>> 0,
                 `HT4 slot 0 must read entry[${id}]+0xb0`);
    /* The two re-issued HT1 probes compute the SAME entry pointer; only
       the field offset differs. The issuance COUNT stays 2 (v11). */
    assert.equal((a - 0xb4) >>> 0, (b - 0xb8) >>> 0,
                 "the two re-issued HT1 probes must share one entry pointer");
    assert.equal((a - 0xb4) >>> 0,
                 wasm.isaac_pm_td_rvb_cfg_entry(id, begin >>> 0, end >>> 0)
                   >>> 0);
    assert.equal(a >>> 0,
                 pmTdRvbCase0CfgFieldVa(PM_TD_RVB_CASE0_BRANCH_HT1,
                                        PM_TD_RVB_CFG_PROBE_0, id,
                                        begin, end) >>> 0);
  }
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_probes(
    PM_TD_RVB_CASE0_BRANCH_HT1) | 0, 2,
    "v11 issuance count must stay 2 — the re-issue is not folded");

  /* Out-of-range and negative character types produce no address at all. */
  for (const id of [count, count + 1, -1, -0x80000000, 0x7fffffff]) {
    assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_va(
      PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CFG_PROBE_0, id,
      begin >>> 0, end >>> 0) >>> 0, 0, `miss id ${id}`);
  }
  /* Branches that issue no probe. */
  for (const branch of [PM_TD_RVB_CASE0_BRANCH_KEEP, PM_TD_RVB_CASE0_BRANCH_HT3,
                        PM_TD_RVB_CASE0_BRANCH_CHAR12,
                        PM_TD_RVB_CASE0_BRANCH_ELSE]) {
    for (const slot of [0, 1, 2, -1]) {
      assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(branch, slot) | 0,
                   -1);
      assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_va(
        branch, slot, 0, begin >>> 0, end >>> 0) >>> 0, 0);
      assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_probes(branch) | 0, 0);
    }
  }
  /* HT4 has no slot 1 — it calls 0x0069bd10 exactly once. */
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(
    PM_TD_RVB_CASE0_BRANCH_HT4, PM_TD_RVB_CFG_PROBE_1) | 0, -1);
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_probes(
    PM_TD_RVB_CASE0_BRANCH_HT4) | 0, 1);
  /* Field offsets, literal. */
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(
    PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CFG_PROBE_0) | 0, 0xb4);
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(
    PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CFG_PROBE_1) | 0, 0xb8);
  assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(
    PM_TD_RVB_CASE0_BRANCH_HT4, PM_TD_RVB_CFG_PROBE_0) | 0, 0xb0);
});

test("v12 CFG: callsite null-check census (original defect, not corrected)",
     () => {
  /* Whole-.text rel32 census: exactly seven callsites, no absolute dword
     references anywhere in the image. Three of the seven dereference the
     result unguarded. The defect is reproduced and pinned, never fixed. */
  const checked = [
    PM_TD_RVB_CFG_SITE_5BE49E,
    PM_TD_RVB_CFG_SITE_65D7CE,
    PM_TD_RVB_CFG_SITE_8ECB88,
  ];
  const unchecked = [
    PM_TD_RVB_CFG_SITE_CASE0_HT1_A,
    PM_TD_RVB_CFG_SITE_CASE0_HT1_B,
    PM_TD_RVB_CFG_SITE_CASE0_HT4,
    PM_TD_RVB_CFG_SITE_9A2E30,
  ];
  assert.equal(checked.length + unchecked.length, 7);
  for (const va of checked) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0, 1,
                 `site 0x${va.toString(16)} guards its result`);
    assert.equal(pmTdRvbCfgSiteNullChecked(va), 1);
  }
  for (const va of unchecked) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0, 0,
                 `site 0x${va.toString(16)} dereferences unguarded`);
    assert.equal(pmTdRvbCfgSiteNullChecked(va), 0);
  }
  /* All three CASE0 probes are on the unguarded side — a negative or
     out-of-range character type faults in the original binary. */
  for (const va of [PM_TD_RVB_CFG_SITE_CASE0_HT1_A,
                    PM_TD_RVB_CFG_SITE_CASE0_HT1_B,
                    PM_TD_RVB_CFG_SITE_CASE0_HT4]) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0,
                 PM_TD_RVB_CFG_SITE_UNCHECKED);
  }
  /* Anything that is not one of the seven is UNKNOWN, including the
     function head and the two exits. */
  for (const va of [PM_TD_RVB_VA_CONFIG_BY_CHAR, PM_TD_RVB_CFG_VA_RET_IN_RANGE,
                    PM_TD_RVB_CFG_VA_RET_FALLBACK, PM_TD_RVB_CFG_VA_END,
                    PM_TD_RVB_CFG_VA_RECEIVER_GETTER, 0]) {
    assert.equal(wasm.isaac_pm_td_rvb_cfg_site_null_checked(va >>> 0) | 0, -1);
  }
});

test("deterministic randomized differential corpus: v12 CFG", (t) => {
  let seed = 0x69bd10 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* HIGH bits: this LCG's low bits have period 2^k. */
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);

  const spanShapes = [
    0, 1, -1, 0x147, 0x148, -0x148, -0x147, 0x148 * 202, -0x148 * 202,
    0x7fffffff, -0x80000000, 0x10000, -0x10000,
  ];
  const idShapes = [
    -0x80000000, -2, -1, 0, 1, 2, 0xb, 0x51, 0x202, 0x7fffffff,
  ];

  let cases = 0;
  let hitNegativeId = 0;
  let hitOutOfRange = 0;
  let hitInRange = 0;
  let hitNegativeSpan = 0;
  let hitZeroCount = 0;
  let hitEntryWrap = 0;

  for (let trial = 0; trial < 4000; trial += 1) {
    const beginMode = pick(3);
    const begin = (beginMode === 0
      ? SCRATCH
      : beginMode === 1
        ? rnd()
        : [0, 0xfffff000, 0x80000000, 0x7ffffff0][pick(4)]) >>> 0;
    const spanMode = pick(3);
    const span = spanMode === 0
      ? spanShapes[pick(spanShapes.length)]
      : spanMode === 1
        ? (pick(0x148 * 40) - 0x148 * 20) | 0
        : (rnd() | 0);
    const end = (begin + span) >>> 0;
    const idMode = pick(3);
    const id = idMode === 0
      ? idShapes[pick(idShapes.length)]
      : idMode === 1
        ? (pick(0x400) - 0x40) | 0
        : (rnd() | 0);

    const count = wasm.isaac_pm_td_rvb_cfg_count(begin, end) | 0;
    assert.equal(count, pmTdRvbCfgCount(begin, end),
                 `rnd count ${trial} begin=${begin} end=${end}`);
    /* Independent third check on every single draw. */
    assert.equal(count, Math.trunc((span | 0) / 0x148) | 0,
                 `rnd count ${trial} is not trunc-toward-zero`);

    const inRange = wasm.isaac_pm_td_rvb_cfg_in_range(id | 0, begin, end) | 0;
    assert.equal(inRange, pmTdRvbCfgInRange(id, begin, end),
                 `rnd in_range ${trial}`);
    const entry = wasm.isaac_pm_td_rvb_cfg_entry(id | 0, begin, end) >>> 0;
    assert.equal(entry, pmTdRvbCfgEntry(id, begin, end) >>> 0,
                 `rnd entry ${trial}`);
    const exitVa = wasm.isaac_pm_td_rvb_cfg_exit_va(id | 0, begin, end) >>> 0;
    assert.equal(exitVa, pmTdRvbCfgExitVa(id, begin, end) >>> 0,
                 `rnd exit ${trial}`);
    /* in_range and exit_va must never disagree. */
    assert.equal(exitVa, inRange !== 0 ? 0x0069bd44 : 0x0069bd47,
                 `rnd exit/in_range disagree ${trial}`);
    /* An out-of-range call returns exactly NULL — the fallback tail does
       no clamping. */
    if (inRange === 0) {
      assert.equal(entry, 0, `rnd fallback not NULL ${trial}`);
    } else {
      assert.equal(entry,
                   ((Math.imul(id | 0, 0x148) >>> 0) + begin) >>> 0,
                   `rnd entry arithmetic ${trial}`);
    }

    const branch = [PM_TD_RVB_CASE0_BRANCH_HT1, PM_TD_RVB_CASE0_BRANCH_HT4,
                    PM_TD_RVB_CASE0_BRANCH_KEEP, PM_TD_RVB_CASE0_BRANCH_HT3,
                    PM_TD_RVB_CASE0_BRANCH_CHAR12,
                    PM_TD_RVB_CASE0_BRANCH_ELSE][pick(6)];
    const slot = pick(3);
    assert.equal(wasm.isaac_pm_td_rvb_case0_cfg_field_off(branch, slot) | 0,
                 pmTdRvbCase0CfgFieldOff(branch, slot),
                 `rnd field_off ${trial}`);
    assert.equal(
      wasm.isaac_pm_td_rvb_case0_cfg_field_va(branch, slot, id | 0, begin,
                                              end) >>> 0,
      pmTdRvbCase0CfgFieldVa(branch, slot, id, begin, end) >>> 0,
      `rnd field_va ${trial}`);
    assert.equal(wasm.isaac_pm_td_rvb_cfg_receiver(begin) >>> 0,
                 pmTdRvbCfgReceiver(begin) >>> 0, `rnd receiver ${trial}`);

    if ((id | 0) < 0) hitNegativeId += 1;
    else if (inRange === 0) hitOutOfRange += 1;
    else hitInRange += 1;
    if (count < 0) hitNegativeSpan += 1;
    if (count === 0) hitZeroCount += 1;
    if (inRange !== 0 && entry < begin) hitEntryWrap += 1;

    cases += 8;
  }

  /* Coverage: the corpus must actually reach every arm of the machine. */
  assert.ok(hitNegativeId > 0, "corpus never took the `js` negative-id fallback");
  assert.ok(hitOutOfRange > 0, "corpus never took the `jge` out-of-range fallback");
  assert.ok(hitInRange > 0, "corpus never took the in-range exit");
  assert.ok(hitNegativeSpan > 0, "corpus never produced a negative count");
  assert.ok(hitZeroCount > 0, "corpus never produced a zero count");
  assert.ok(hitEntryWrap > 0, "corpus never wrapped the entry address at 32 bits");

  t.diagnostic(
    `v12 CFG corpus: ${cases} cases; negId=${hitNegativeId} ` +
    `oor=${hitOutOfRange} in=${hitInRange} negSpan=${hitNegativeSpan} ` +
    `zero=${hitZeroCount} wrap=${hitEntryWrap}`);
  assert.ok(cases >= 30000, `expected >= 30000 executed cases, got ${cases}`);
});

/* ====================================================================== */
/* v13 C0T — VA 0x007791f0 (the CASE0 tail host), translated whole.      */
/* ====================================================================== */

const V13_C0T_LITERALS = [
  ["ISAAC_PM_C0T_VA_BODY", "0x007791f0", PM_C0T_VA_BODY, 0x007791f0],
  ["ISAAC_PM_C0T_VA_RET", "0x007792eb", PM_C0T_VA_RET, 0x007792eb],
  ["ISAAC_PM_C0T_VA_NEXT_FUNC", "0x007792f0", PM_C0T_VA_NEXT_FUNC,
   0x007792f0],
  ["ISAAC_PM_C0T_BODY_BYTES", "252", PM_C0T_BODY_BYTES, 252],
  ["ISAAC_PM_C0T_VA_CALLSITE_42C14B", "0x0042c14b", PM_C0T_CALLSITES[0],
   0x0042c14b],
  ["ISAAC_PM_C0T_VA_CALLSITE_717DAF", "0x00717daf", PM_C0T_CALLSITES[1],
   0x00717daf],
  ["ISAAC_PM_C0T_VA_CALLSITE_7A258B", "0x007a258b", PM_C0T_CALLSITES[2],
   0x007a258b],
  ["ISAAC_PM_C0T_VA_CALLSITE_7B35EE", "0x007b35ee", PM_C0T_CALLSITES[3],
   0x007b35ee],
  ["ISAAC_PM_C0T_VA_CALLSITE_7C4F0A", "0x007c4f0a", PM_C0T_CALLSITES[4],
   0x007c4f0a],
  ["ISAAC_PM_C0T_VA_CALLSITE_7CB110", "0x007cb110", PM_C0T_CALLSITES[5],
   0x007cb110],
  ["ISAAC_PM_C0T_VA_CALLSITE_7FF46A", "0x007ff46a", PM_C0T_CALLSITES[6],
   0x007ff46a],
  ["ISAAC_PM_C0T_VA_CALLSITE_9ACDB4", "0x009acdb4", PM_C0T_CALLSITES[7],
   0x009acdb4],
  ["ISAAC_PM_C0T_CALLSITE_COUNT", "8", PM_C0T_CALLSITES.length, 8],
  ["ISAAC_PM_C0T_VA_REGISTRATION_PUSH", "0x00869750",
   PM_C0T_VA_REGISTRATION_PUSH, 0x00869750],
  ["ISAAC_PM_C0T_STR_SETFULLHEARTS_VA", "0x00b719ec",
   PM_C0T_STR_SETFULLHEARTS_VA, 0x00b719ec],
  ["ISAAC_PM_C0T_WALK_CHAR", "0x11", PM_C0T_WALK_CHAR, 0x11],
  ["ISAAC_PM_C0T_OFF_CHAR_13C0", "0x13c0", PM_C0T_OFF_CHAR_13C0, 0x13c0],
  ["ISAAC_PM_C0T_OFF_FATAL_1340", "0x1340", PM_C0T_OFF_FATAL_1340, 0x1340],
  ["ISAAC_PM_C0T_OFF_SOUL_1344", "0x1344", PM_C0T_OFF_SOUL_1344, 0x1344],
  ["ISAAC_PM_C0T_OFF_134C", "0x134c", PM_C0T_OFF_134C, 0x134c],
  ["ISAAC_PM_C0T_GAME_GLOBAL_VA", "0x00c71678", PM_C0T_GAME_GLOBAL_VA,
   0x00c71678],
  ["ISAAC_PM_C0T_SCAN_BASE_OFF", "0x1da04", PM_C0T_SCAN_BASE_OFF, 0x1da04],
  ["ISAAC_PM_C0T_SCAN_STRIDE", "0x6dc", PM_C0T_SCAN_STRIDE, 0x6dc],
  ["ISAAC_PM_C0T_SCAN_SLOTS", "8", PM_C0T_SCAN_SLOTS, 8],
  ["ISAAC_PM_C0T_SCAN_BYTE_OFF", "0xc", PM_C0T_SCAN_BYTE_OFF, 0xc],
  ["ISAAC_PM_C0T_SCAN_BYTE_VALUE", "4", PM_C0T_SCAN_BYTE_VALUE, 4],
  ["ISAAC_PM_C0T_SCAN_NO_MATCH", "8", PM_C0T_SCAN_NO_MATCH, 8],
  ["ISAAC_PM_C0T_SCAN_SKIPPED", "-1", PM_C0T_SCAN_SKIPPED, -1],
  ["ISAAC_PM_C0T_VA_GET_HEALTH_TYPE", "0x007cafe0",
   PM_C0T_VA_GET_HEALTH_TYPE, 0x007cafe0],
  ["ISAAC_PM_C0T_VA_UPDATE_BONE_HEARTS", "0x007cabc0",
   PM_C0T_VA_UPDATE_BONE_HEARTS, 0x007cabc0],
  ["ISAAC_PM_C0T_VA_GETTER_7CB060", "0x007cb060", PM_C0T_VA_GETTER_7CB060,
   0x007cb060],
  ["ISAAC_PM_C0T_VA_GET_HEALTH_LIMIT", "0x007cae60",
   PM_C0T_VA_GET_HEALTH_LIMIT, 0x007cae60],
  ["ISAAC_PM_EP_HT_JUMP_TABLE_VA", "0x007cb018", PM_EP_HT_JUMP_TABLE_VA,
   0x007cb018],
  ["ISAAC_PM_EP_HT_BYTE_TABLE_VA", "0x007cb02c", PM_EP_HT_BYTE_TABLE_VA,
   0x007cb02c],
  ["ISAAC_PM_EP_HT_TABLE_LEN", "0x25", PM_EP_HT_TABLE_LEN, 0x25],
  ["ISAAC_PM_EP_HT_CHAR_MIN", "4", PM_EP_HT_CHAR_MIN, 4],
  ["ISAAC_PM_EP_HT_INDEX_MAX", "0x24", PM_EP_HT_INDEX_MAX, 0x24],
];

test("v13 C0T: every new literal pinned in the header AND the model", () => {
  const h = readFileSync(header, "utf8");
  for (const [name, literal, modelValue, expected] of V13_C0T_LITERALS) {
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${literal.replace("-", "\\-")}\\b`),
      `header literal ${name} = ${literal}`,
    );
    assert.equal(modelValue, expected, `model constant ${name}`);
  }
  assert.equal(V13_C0T_LITERALS.length, 37);
});

test("v13 C0T: header transcribes the body, the censuses and the defect",
     () => {
  const h = readFileSync(header, "utf8");
  /* Bounds, single ret, padding. */
  assert.match(h, /Body 0x007791f0\.\.0x007792eb inclusive \(252 bytes\), ONE ret/);
  assert.match(h, /0x007792eb {2}ret\s+; the ONLY ret/);
  assert.match(h, /int3 padding 0x007792ec\.\.0x007792ef/);
  /* The walk semantics that differ from a naive reading. */
  assert.match(h, /ADOPT the twin UNCONDITIONALLY/);
  assert.match(h, /LANDS ON the twin even when the twin is a non-walker/);
  assert.match(h, /FULL-DWORD compare/);
  /* Pre-call snapshot justification. */
  assert.match(h, /PRE-value, read BEFORE the call/);
  assert.match(h, /PURE LEAF: it reads only \[ecx\+0x13c0\] and writes/);
  assert.match(h, /EDX survives the call/);
  assert.match(h, /sibling 0x007cb060/);
  assert.match(h, /caller 0x009acd94/);
  /* Gate direction and signedness spelled out. */
  assert.match(h, /ht in \{1,2\} takes \[0x1340\] ALONE/);
  assert.match(h, /jl {2}0x00779275\s+; SIGNED: new < pre skips the scan/);
  assert.match(h, /jb {2}0x00779260\s+; UNSIGNED loop compare/);
  assert.match(h, /FIRST match only/);
  /* The two g_Game reads and the writer census. */
  assert.match(h, /g_Game READ A \(pre-scan only\)/);
  assert.match(h, /g_Game READ B \(fresh re-read\)/);
  assert.match(h, /0x00C71678 IS RUNTIME STATE, NOT A CONSTANT/);
  assert.match(h, /11298 reads and THREE writers/);
  assert.match(h, /0x00952847/);
  assert.match(h, /0x009597d0/);
  assert.match(h, /0x009ab8a9/);
  /* Callsite census and the phantom-table finding. */
  assert.match(h, /exactly 8 rel32 CALL\s+sites and ZERO tail jmps/);
  assert.match(h, /PHANTOM decodes of a preceding jump-address table/);
  assert.match(h, /DOMINATES every CASE0 exit path/);
  /* Registration string is evidence only. */
  assert.match(h, /"SetFullHearts"/);
  assert.match(h, /registration EVIDENCE ONLY and does not rename/);
  /* Callee verification results. */
  assert.match(h, /SURVIVES\s+callsite verification \(ecx receiver, zero args, int in eax/);
  assert.match(h, /ZERO writes into\s+\[0x007cb018,0x007cb051\)/);
  assert.match(h, /callee-cleanup ret 4/);
  assert.match(h, /This callee was NOT\s+in the v12 handoff notes/);
  /* The pinned non-termination defect, named as reproduced. */
  assert.match(h, /ORIGINAL-BINARY DEFECT, reproduced and pinned, never corrected/);
  assert.match(h, /NO cycle guard and NO hop bound/);
  assert.match(h, /an affordance, not a correction/);
  /* Post-call discipline. */
  assert.match(h, /read\s+AFTER the update_red_hearts host call/);
  assert.match(h, /\[0x194c\] = cap store retires AFTER the\s+0x007ca2d0 host call/);
});

test("Wasm matches JS: v13 exact GetHealthType 0x007cafe0, whole domain",
     (t) => {
  let cases = 0;
  /* Every byte-table index, across the boundary, against the model AND
     the pinned raw table. */
  assert.equal(PM_EP_HT_TABLE_BYTES.length, 0x25);
  for (let index = -4; index <= 0x28; index += 1) {
    const w = wasm.isaac_pm_ep_health_type_table_byte(index) | 0;
    assert.equal(w, pmEpHealthTypeTableByte(index), `table byte ${index}`);
    if (index >= 0 && index <= 0x24) {
      assert.equal(w, PM_EP_HT_TABLE_BYTES[index], `table byte pin ${index}`);
    } else {
      assert.equal(w, -1, `table byte outside ${index}`);
    }
    cases += 1;
  }
  /* Composed health type over a dense char range plus wide garbage. */
  const chars = [];
  for (let c = -0x10; c <= 0x40; c += 1) chars.push(c);
  chars.push(0x100, 0x111, 0x123, 0x424, 0x7fffffff, -0x80000000,
             0xffffffff | 0, 0x80000004 | 0);
  for (const c of chars) {
    assert.equal(wasm.isaac_pm_ep_get_health_type(c | 0) | 0,
                 pmEpGetHealthType(c), `health type ${c}`);
    cases += 1;
  }
  /* Fixed pins straight from the PE tables: ht 1 chars, ht 2 chars,
     ht 3 chars, THE bone char, gaps and both boundaries. */
  for (const [c, want] of [
    [4, 1], [0xc, 1], [0x11, 1], [0x18, 1], [0x19, 1], [0x23, 1], [0x24, 1],
    [0xa, 2], [0x1f, 2], [0x28, 2],
    [0xe, 3], [0x21, 3],
    [0x10, 4],
    [5, 0], [0x12, 0], [0x1d, 0], [0x25, 0],
    [3, 0],            /* one below the table (unsigned ja wraps) */
    [0x29, 0],         /* one past the table */
    [0, 0], [-1, 0], [-0x80000000, 0],
  ]) {
    assert.equal(wasm.isaac_pm_ep_get_health_type(c | 0) | 0, want,
                 `health type pin char ${c}`);
    cases += 1;
  }
  /* The jump table maps byte k to return {1,2,3,4,0}[k] — cross-pin the
     composition for every in-table char. */
  for (let c = 4; c <= 0x28; c += 1) {
    const byte = wasm.isaac_pm_ep_health_type_table_byte(c - 4) | 0;
    assert.equal(wasm.isaac_pm_ep_get_health_type(c) | 0,
                 PM_EP_HT_JUMP_RETURNS[byte],
                 `jump composition char ${c}`);
    cases += 1;
  }
  t.diagnostic(`v13 GetHealthType cases: ${cases}`);
  assert.ok(cases >= 160, `expected >= 160 cases, got ${cases}`);
});

test("Wasm matches JS: v13 recompute law, sibling 0x007cb060 cross-pin",
     (t) => {
  let cases = 0;
  const wide = [0, 1, 2, 3, 4, 5, -1, 0x100, 0x102, 0x7fffffff,
                -0x80000000];
  const vals = [0, 1, 2, 5, -1, -6, 0x3fffffff, 0x40000000, 0x7fffffff,
                -0x80000000, 0x12345678];
  for (const ht of wide) {
    /* Gate DIRECTION: {1,2} keeps [0x1340] alone; everything else adds
       the doubled bone term. */
    assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(ht | 0) | 0,
                 pmC0tRecomputeUsesBone(ht), `uses_bone ${ht}`);
    for (const a of vals) {
      for (const b of vals) {
        assert.equal(wasm.isaac_pm_c0t_new_1344(ht | 0, a | 0, b | 0) | 0,
                     pmC0tNew1344(ht, a, b), `new_1344 ${ht} ${a} ${b}`);
        cases += 1;
      }
    }
  }
  /* Direction pins. */
  assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(1) | 0, 0);
  assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(2) | 0, 0);
  assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(0) | 0, 1);
  assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(3) | 0, 1);
  assert.equal(wasm.isaac_pm_c0t_recompute_uses_bone(4) | 0, 1);
  /* Value pins including the lea wrap. */
  assert.equal(wasm.isaac_pm_c0t_new_1344(1, 6, 99) | 0, 6, "ht1 drops bone");
  assert.equal(wasm.isaac_pm_c0t_new_1344(2, 6, 99) | 0, 6, "ht2 drops bone");
  assert.equal(wasm.isaac_pm_c0t_new_1344(0, 6, 3) | 0, 12, "ht0 6+2*3");
  assert.equal(wasm.isaac_pm_c0t_new_1344(4, 6, 3) | 0, 12, "ht4 6+2*3");
  assert.equal(wasm.isaac_pm_c0t_new_1344(3, 1, 0x40000000) | 0,
               1 | 0x80000000, "lea wraps at 32 bits");
  assert.equal(wasm.isaac_pm_c0t_new_1344(0, -2, 1) | 0, 0, "-2+2*1");
  cases += 11;
  /* The sibling getter must agree with the composed law for every char:
     the same expression recovered from a SECOND instruction range
     (0x007cb060) and a THIRD (caller 0x009acd94) — cross-helper
     differential. */
  for (let c = -0x10; c <= 0x40; c += 1) {
    for (const [a, b] of [[0, 0], [6, 3], [-2, 1], [1, 0x40000000],
                          [0x7fffffff, 0x7fffffff]]) {
      const viaSibling = wasm.isaac_pm_c0t_getter_7cb060(c | 0, a | 0, b | 0) | 0;
      const viaComposed = wasm.isaac_pm_c0t_new_1344(
        wasm.isaac_pm_ep_get_health_type(c | 0) | 0, a | 0, b | 0) | 0;
      assert.equal(viaSibling, viaComposed, `sibling agree char ${c}`);
      assert.equal(viaSibling, pmC0tGetter7cb060(c, a, b),
                   `sibling oracle char ${c}`);
      cases += 2;
    }
  }
  t.diagnostic(`v13 recompute/sibling cases: ${cases}`);
  assert.ok(cases >= 1300, `expected >= 1300 cases, got ${cases}`);
});

test("Wasm matches JS: v13 signed jl scan gate", () => {
  const pairs = [
    /* [new, pre, want] — jl SKIPS, so scan runs on new >= pre signed. */
    [0, 0, 1],                       /* equal: jl strict, scan runs */
    [1, 0, 1],
    [0, 1, 0],
    [-1, 0, 0],
    [0, -1, 1],
    [-0x80000000, 1, 0],             /* unsigned model would say 1 */
    [1, -0x80000000, 1],             /* unsigned model would say 0 */
    [-0x80000000, 0x7fffffff, 0],
    [0x7fffffff, -0x80000000, 1],
    [-5, -5, 1],
    [-6, -5, 0],
    [-5, -6, 1],
  ];
  for (const [nv, pre, want] of pairs) {
    assert.equal(wasm.isaac_pm_c0t_scan_gate(nv | 0, pre | 0) | 0, want,
                 `scan gate ${nv} vs ${pre}`);
    assert.equal(wasm.isaac_pm_c0t_scan_gate(nv | 0, pre | 0) | 0,
                 pmC0tScanGate(nv, pre), `scan gate oracle ${nv} ${pre}`);
  }
  /* The two unsigned-inversion witnesses, asserted AGAINST the unsigned
     answer so a flipped model cannot pass. */
  assert.notEqual(wasm.isaac_pm_c0t_scan_gate(-0x80000000, 1) | 0, 1,
                  "INT_MIN >= 1 must be false (signed)");
  assert.notEqual(wasm.isaac_pm_c0t_scan_gate(1, -0x80000000) | 0, 0,
                  "1 >= INT_MIN must be true (signed)");
});

test("Wasm matches JS: v13 walk predicates and memory twin walk", (t) => {
  const view = new DataView(wasm.memory.buffer);
  let cases = 0;
  /* Full-dword char compare: 0x111 and 0x10011 must NOT walk. */
  for (const [c, want] of [
    [0x11, 1], [0x111, 0], [0x10011, 0], [0x12, 0], [0, 0],
    [0x11000011 | 0, 0], [0xffffff11 | 0, 0],
  ]) {
    assert.equal(wasm.isaac_pm_c0t_walk_engaged(c >>> 0) | 0, want,
                 `walk engaged ${c}`);
    assert.equal(wasm.isaac_pm_c0t_walk_engaged(c >>> 0) | 0,
                 pmC0tWalkEngaged(c), `walk engaged oracle ${c}`);
    cases += 1;
  }
  for (const [c, tw, want] of [
    [0x11, 0, 0], [0x11, 0x123400, 1], [0x12, 0x123400, 0], [0x111, 1, 0],
  ]) {
    assert.equal(wasm.isaac_pm_c0t_walk_continue(c >>> 0, tw >>> 0) | 0,
                 want, `walk continue ${c} ${tw}`);
    assert.equal(wasm.isaac_pm_c0t_walk_continue(c >>> 0, tw >>> 0) | 0,
                 pmC0tWalkContinue(c, tw), `walk continue oracle ${c}`);
    cases += 1;
  }

  /* Guest-shaped pseudo-players in scratch: stride 0x2000 clears the
     max used offset 0x1d98. */
  const P_BASE = SCRATCH + 0x22000;
  const P_STRIDE = 0x2000;
  const pAddr = (i) => P_BASE + i * P_STRIDE;
  const setPlayer = (i, charType, twinIndex) => {
    const a = pAddr(i);
    view.setInt32(a + PM_C0T_OFF_CHAR_13C0, charType | 0, true);
    view.setUint32(a + 0x1d98, twinIndex < 0 ? 0 : pAddr(twinIndex), true);
  };
  const jsPlayers = (spec) => {
    const m = new Map();
    for (let i = 0; i < spec.length; i += 1) {
      const [charType, twinIndex] = spec[i];
      m.set(pAddr(i), {
        char: charType,
        twin: twinIndex < 0 ? 0 : pAddr(twinIndex),
      });
    }
    return m;
  };
  const walkBoth = (spec, startIndex, cap) => {
    for (let i = 0; i < spec.length; i += 1) setPlayer(i, ...spec[i]);
    const w = wasm.isaac_pm_c0t_twin_walk(pAddr(startIndex), cap | 0) >>> 0;
    const j = pmC0tTwinWalk(jsPlayers(spec), pAddr(startIndex), cap);
    assert.equal(w, j.terminated ? j.addr >>> 0 : 0,
                 `twin walk wasm/js spec=${JSON.stringify(spec)}`);
    cases += 1;
    return w;
  };

  /* Non-walker start: no walk at all. */
  assert.equal(walkBoth([[0x12, 1], [0x11, -1]], 0, 100), pAddr(0));
  /* Walker with NULL twin stops on itself. */
  assert.equal(walkBoth([[0x11, -1]], 0, 100), pAddr(0));
  /* Walker adopts a NON-walker twin — lands ON the twin. */
  assert.equal(walkBoth([[0x11, 1], [0x25, -1]], 0, 100), pAddr(1));
  /* Two walkers then a non-walker: A -> B -> C. */
  assert.equal(walkBoth([[0x11, 1], [0x11, 2], [7, -1]], 0, 100), pAddr(2));
  /* Chain of walkers ending on a NULL twin stops on the LAST walker. */
  assert.equal(walkBoth([[0x11, 1], [0x11, 2], [0x11, -1]], 0, 100),
               pAddr(2));
  /* Full-dword pin inside the walk: char 0x111 twin is adopted and
     STOPS the walk (it is not a walker). */
  assert.equal(walkBoth([[0x11, 1], [0x111, 2], [0x11, -1]], 0, 100),
               pAddr(1));
  /* Deep chain: every hop is real (cap far above). */
  assert.equal(walkBoth(
    [[0x11, 1], [0x11, 2], [0x11, 3], [0x11, 4], [0x11, 5], [0x11, 6],
     [0x11, 7], [0x9, -1]], 0, 100), pAddr(7));

  /* THE PINNED DEFECT: a walker 2-cycle never terminates in the PE. The
     cap sentinel reports 0 for EVERY cap — growing the cap never finds
     an exit. */
  for (const cap of [0, 1, 2, 3, 17, 400]) {
    assert.equal(walkBoth([[0x11, 1], [0x11, 0]], 0, cap), 0,
                 `walker 2-cycle cap ${cap}`);
  }
  /* Self-twin walker: same non-termination. */
  for (const cap of [0, 5, 1000]) {
    assert.equal(walkBoth([[0x11, 0]], 0, cap), 0,
                 `self-twin walker cap ${cap}`);
  }
  /* A cap exactly at the needed hop count terminates; one below cannot.
     (2 hops needed: A->B->C.) */
  assert.equal(walkBoth([[0x11, 1], [0x11, 2], [4, -1]], 0, 2), pAddr(2));
  assert.equal(walkBoth([[0x11, 1], [0x11, 2], [4, -1]], 0, 1), 0);

  t.diagnostic(`v13 walk cases: ${cases}`);
  assert.ok(cases >= 24, `expected >= 24 walk cases, got ${cases}`);
});

test("Wasm matches JS: v13 slot VA law and the 8-slot memory scan", (t) => {
  const view = new DataView(wasm.memory.buffer);
  let cases = 0;
  /* Address law incl. 32-bit wrap. */
  for (const g of [0, 1, 0x140000, 0xc71678, 0xfffff000 | 0,
                   0xffffffff | 0]) {
    for (let i = 0; i < 8; i += 1) {
      assert.equal(wasm.isaac_pm_c0t_scan_slot_va(g >>> 0, i) >>> 0,
                   pmC0tScanSlotVa(g, i), `slot va ${g} ${i}`);
      cases += 1;
    }
  }
  assert.equal(wasm.isaac_pm_c0t_scan_slot_va(0, 0) >>> 0, 0x1da04);
  assert.equal(wasm.isaac_pm_c0t_scan_slot_va(0, 7) >>> 0,
               0x1da04 + 7 * 0x6dc);
  assert.equal(
    wasm.isaac_pm_c0t_scan_slot_va(0xffffffff >>> 0, 1) >>> 0,
    (0xffffffff + 0x1da04 + 0x6dc) >>> 0,
    "slot va wraps at 32 bits");
  cases += 3;

  /* A REAL stride-0x6dc 8-slot array in scratch, read back through the
     computed addresses. */
  const GAME = SCRATCH;                 /* farthest write ~ +0x20a18 */
  const PLAYER = SCRATCH + 0x60000;
  const slotVa = (i) => GAME + PM_C0T_SCAN_BASE_OFF + i * PM_C0T_SCAN_STRIDE;
  const fillSlots = (values) => {
    for (let i = 0; i < 8; i += 1) {
      view.setUint32(slotVa(i), values[i] >>> 0, true);
      view.setUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF, 0xaa);
    }
  };
  const bytes = () => Array.from({ length: 8 },
                                 (_, i) => view.getUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF));

  /* Match at EVERY slot index. */
  for (let hit = 0; hit < 8; hit += 1) {
    const values = Array.from({ length: 8 }, (_, i) => 0x9000 + i);
    values[hit] = PLAYER;
    fillSlots(values);
    assert.equal(wasm.isaac_pm_c0t_scan_find(GAME, PLAYER) | 0, hit,
                 `scan find hit ${hit}`);
    assert.equal(pmC0tScanFind(values, PLAYER), hit,
                 `scan find oracle hit ${hit}`);
    assert.equal(wasm.isaac_pm_c0t_scan_apply(GAME, PLAYER) | 0, hit,
                 `scan apply hit ${hit}`);
    const after = bytes();
    for (let i = 0; i < 8; i += 1) {
      assert.equal(after[i], i === hit ? 4 : 0xaa,
                   `slot byte ${i} after hit ${hit}`);
    }
    cases += 3;
  }
  /* No match: index 8, NO byte store. */
  fillSlots(Array.from({ length: 8 }, (_, i) => 0x9000 + i));
  assert.equal(wasm.isaac_pm_c0t_scan_find(GAME, PLAYER) | 0, 8);
  assert.equal(wasm.isaac_pm_c0t_scan_apply(GAME, PLAYER) | 0, 8);
  assert.deepEqual(bytes(), Array(8).fill(0xaa), "no-match must not store");
  cases += 3;
  /* FIRST match wins: slots 2 and 5 both match; only slot 2 stored. */
  {
    const values = Array.from({ length: 8 }, (_, i) => 0x9000 + i);
    values[2] = PLAYER;
    values[5] = PLAYER;
    fillSlots(values);
    assert.equal(wasm.isaac_pm_c0t_scan_apply(GAME, PLAYER) | 0, 2,
                 "first match only");
    const after = bytes();
    assert.equal(after[2], 4);
    assert.equal(after[5], 0xaa, "second match must NOT be stored");
    cases += 3;
  }
  /* Slot 0 zero-pointer vs player 0: matching NULL is a real match in
     the PE (cmp [eax],esi with esi==0 — no guard). */
  fillSlots([0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(wasm.isaac_pm_c0t_scan_find(GAME, 0) | 0, 0,
               "NULL player matches a NULL slot (no guard in the PE)");
  cases += 1;

  t.diagnostic(`v13 scan cases: ${cases}`);
  assert.ok(cases >= 60, `expected >= 60 scan cases, got ${cases}`);
});

test("Wasm matches JS: v13 heal tail agrees with the v11 exit-tail helpers",
     (t) => {
  let cases = 0;
  /* Wide byte drives on the dead gate (v9 rule — NEVER pre-mask). */
  for (const w of [0, 1, 0xff, 0x100, 0x1ff, 0xff00, 0x80000000,
                   0xffffffff]) {
    const got = wasm.isaac_pm_c0t_heal_gate(1, w >>> 0, 5) | 0;
    assert.equal(got, pmC0tHealGate(1, w, 5), `heal gate wide ${w}`);
    /* AL == 0 passes the gate: 0x100 and 0xff00 must behave as ZERO. */
    assert.equal(got, (w & 0xff) === 0 ? 1 : 0, `heal gate AL ${w}`);
    cases += 2;
  }
  /* Signed pins on both other legs. */
  for (const [g, d, r, want] of [
    [1, 0, 1, 1], [2, 0, 1, 0], [0x7fffffff, 0, 1, 0], [-1, 0, 1, 1],
    [-0x80000000, 0, 1, 1], [1, 0, 0, 0], [1, 0, -1, 0],
    [1, 0, -0x80000000, 0], [1, 0, 0x7fffffff, 1],
  ]) {
    assert.equal(wasm.isaac_pm_c0t_heal_gate(g | 0, d >>> 0, r | 0) | 0,
                 want, `heal gate ${g} ${d} ${r}`);
    cases += 1;
  }
  /* Capacity idiom pins: trunc-toward-zero halves and the wraps. */
  for (const [a, b, c, d, want] of [
    [0, 0, 0, 0, 0],
    [1, 5, 0, 0, 1],          /* min 1 -> (1+1)/2 = 1 */
    [5, 1, 0, 0, 1],          /* min symmetric */
    [-3, 9, 0, 0, -1],        /* (-3+1)/2 = -1 trunc toward zero */
    [0, 0, -3, 0, -1],
    [0, 0, 5, 0, 3],          /* (5+1)/2 */
    [6, 4, 3, 2, 6],          /* 2 + 2 + 2 */
  ]) {
    const w = wasm.isaac_pm_c0t_heal_capacity(a | 0, b | 0, c | 0, d | 0) | 0;
    assert.equal(w, want, `capacity pin ${a} ${b} ${c} ${d}`);
    assert.equal(w, pmC0tHealCapacity(a, b, c, d), `capacity ${a} ${b} ${c} ${d}`);
    cases += 2;
  }
  /* INT_MAX increment wrap pin, spelled explicitly: (0x7fffffff+1)
     wraps to INT_MIN; cdq/sub/sar gives -0x40000000. */
  assert.equal(wasm.isaac_pm_c0t_heal_capacity(0x7fffffff, 0x7fffffff, 0, 0) | 0,
               -0x40000000, "capacity INT_MAX wrap");
  assert.equal(wasm.isaac_pm_c0t_heal_excess(0x7fffffff, -0x80000000) | 0,
               -1, "excess wraps (red INT_MAX, cap INT_MIN)");
  assert.equal(wasm.isaac_pm_c0t_heal_excess(5, 7) | 0, 0,
               "no excess when not applies");
  cases += 3;
  /* Cross-range agreement: the v13 helpers (from 0x0077927c..0x007792d8)
     and the v11 helpers (from the 0x007a32b9 exit tail) model the same
     source construct from DIFFERENT instruction ranges and must agree
     everywhere. */
  let seed = 0x7791f0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const draw = () => {
    const k = rnd() >>> 29; /* HIGH bits pick the magnitude class */
    if (k === 0) return rnd() | 0;
    if (k === 1) return (rnd() >>> 12) - 0x40000 | 0;
    if (k === 2) return [0, 1, -1, 2, -2, 0x7fffffff, -0x80000000][
      Math.floor((rnd() / 4294967296) * 7)];
    return (rnd() >>> 24) - 0x40 | 0;
  };
  for (let trial = 0; trial < 4000; trial += 1) {
    const g = draw(); const dByte = rnd(); const r = draw();
    const a = draw(); const b = draw(); const c = draw(); const d = draw();
    assert.equal(wasm.isaac_pm_c0t_heal_gate(g | 0, dByte >>> 0, r | 0) | 0,
                 wasm.isaac_pm_td_rvb_heal_gate(g | 0, dByte >>> 0, r | 0) | 0,
                 `v13/v11 heal gate trial ${trial}`);
    const capNew = wasm.isaac_pm_c0t_heal_capacity(a | 0, b | 0, c | 0, d | 0) | 0;
    const capOld = wasm.isaac_pm_td_rvb_heal_capacity(a | 0, b | 0, c | 0, d | 0) | 0;
    assert.equal(capNew, capOld, `v13/v11 capacity trial ${trial}`);
    assert.equal(wasm.isaac_pm_c0t_heal_applies(r | 0, capNew) | 0,
                 wasm.isaac_pm_td_rvb_heal_applies(r | 0, capNew) | 0,
                 `v13/v11 applies trial ${trial}`);
    assert.equal(wasm.isaac_pm_c0t_heal_excess(r | 0, capNew) | 0,
                 wasm.isaac_pm_td_rvb_heal_excess(r | 0, capNew) | 0,
                 `v13/v11 excess trial ${trial}`);
    /* And both against the two independent JS oracles. */
    assert.equal(capNew, pmC0tHealCapacity(a, b, c, d),
                 `v13 capacity oracle trial ${trial}`);
    assert.equal(capOld, pmTdRvbHealCapacity(a, b, c, d),
                 `v11 capacity oracle trial ${trial}`);
    cases += 6;
  }
  t.diagnostic(`v13 heal cases: ${cases}`);
  assert.ok(cases >= 24000, `expected >= 24000 heal cases, got ${cases}`);
});

test("Wasm matches JS: v13 run_pre composes the whole pre-host segment",
     (t) => {
  const view = new DataView(wasm.memory.buffer);
  let cases = 0;

  const GAME = SCRATCH;
  const P_BASE = SCRATCH + 0x22000;
  const P_STRIDE = 0x2000;
  const PLAN = SCRATCH + 0x70000;
  const pAddr = (i) => P_BASE + i * P_STRIDE;
  const slotVa = (i) => GAME + PM_C0T_SCAN_BASE_OFF + i * PM_C0T_SCAN_STRIDE;
  const PRE_OFF = {
    walkedAddr: 0, walkTerminated: 4, pre1344: 8, healthType: 12,
    new1344: 16, scanRuns: 20, scanIndex: 24, scanStoreApplied: 28,
    nextHostVa: 32,
  };

  const setPlayer = (i, p) => {
    const a = pAddr(i);
    view.setInt32(a + PM_C0T_OFF_CHAR_13C0, p.char | 0, true);
    view.setUint32(a + 0x1d98, p.twin < 0 ? 0 : pAddr(p.twin), true);
    view.setInt32(a + PM_C0T_OFF_FATAL_1340, p.v1340 | 0, true);
    view.setInt32(a + PM_C0T_OFF_SOUL_1344, p.v1344 | 0, true);
    view.setInt32(a + 0x1d88, p.v1d88 | 0, true);
  };
  const jsPlayers = (spec) => {
    const m = new Map();
    for (let i = 0; i < spec.length; i += 1) {
      m.set(pAddr(i), {
        char: spec[i].char,
        twin: spec[i].twin < 0 ? 0 : pAddr(spec[i].twin),
        v1340: spec[i].v1340, v1344: spec[i].v1344, v1d88: spec[i].v1d88,
      });
    }
    return m;
  };
  const runBoth = (spec, startIndex, slotValues, cap) => {
    for (let i = 0; i < spec.length; i += 1) setPlayer(i, spec[i]);
    for (let i = 0; i < 8; i += 1) {
      view.setUint32(slotVa(i), slotValues[i] >>> 0, true);
      view.setUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF, 0x77);
    }
    wasm.isaac_pm_c0t_run_pre(pAddr(startIndex), GAME, cap | 0, PLAN);
    const got = {
      walkedAddr: readU32(view, PLAN + PRE_OFF.walkedAddr),
      walkTerminated: readI32(view, PLAN + PRE_OFF.walkTerminated),
      pre1344: readI32(view, PLAN + PRE_OFF.pre1344),
      healthType: readI32(view, PLAN + PRE_OFF.healthType),
      new1344: readI32(view, PLAN + PRE_OFF.new1344),
      scanRuns: readI32(view, PLAN + PRE_OFF.scanRuns),
      scanIndex: readI32(view, PLAN + PRE_OFF.scanIndex),
      scanStoreApplied: readI32(view, PLAN + PRE_OFF.scanStoreApplied),
      nextHostVa: readU32(view, PLAN + PRE_OFF.nextHostVa),
    };
    const jsSlots = slotValues.slice();
    const want = pmC0tRunPre(jsPlayers(spec), pAddr(startIndex), jsSlots,
                             cap);
    assert.equal(got.walkedAddr,
                 want.walkTerminated ? want.walkedAddr >>> 0 : 0,
                 "plan walkedAddr");
    assert.equal(got.walkTerminated, want.walkTerminated, "plan terminated");
    assert.equal(got.pre1344, want.pre1344, "plan pre1344");
    assert.equal(got.healthType, want.healthType, "plan healthType");
    assert.equal(got.new1344, want.new1344, "plan new1344");
    assert.equal(got.scanRuns, want.scanRuns, "plan scanRuns");
    assert.equal(got.scanIndex, want.scanIndex, "plan scanIndex");
    assert.equal(got.scanStoreApplied, want.scanStoreApplied,
                 "plan scanStoreApplied");
    assert.equal(got.nextHostVa >>> 0, 0x007c9ea0, "next host is exact ZHL "
                 + "update_red_hearts");
    cases += 9;
    return { got, want };
  };
  const soulOf = (i) => readI32(view, pAddr(i) + PM_C0T_OFF_SOUL_1344);
  const slotByte = (i) => view.getUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF);

  /* (a) Non-walker, ht0 char, gate falls through, match at slot 3. The
     store retires into [0x1344] of the START player. */
  {
    const spec = [{ char: 0x1d, twin: -1, v1340: 6, v1344: 2, v1d88: 3 }];
    const slots = [1, 2, 3, pAddr(0), 5, 6, 7, 8];
    const { got } = runBoth(spec, 0, slots, 50);
    assert.equal(got.healthType, 0, "char 0x1d has health type 0");
    assert.equal(got.new1344, 12, "6 + 2*3");
    assert.equal(soulOf(0), 12, "recomputed value STORED to [0x1344]");
    assert.equal(got.scanIndex, 3);
    assert.equal(slotByte(3), 4, "slot 3 byte stored");
    assert.equal(slotByte(2), 0x77, "other slot bytes untouched");
    cases += 6;
  }
  /* (b) ht1 char (0xc): bone term dropped; new < pre -> jl SKIPS the
     scan; no slot byte is touched even though a slot matches. */
  {
    const spec = [{ char: 0xc, twin: -1, v1340: 1, v1344: 9, v1d88: 50 }];
    const slots = [pAddr(0), 1, 2, 3, 4, 5, 6, 7];
    const { got } = runBoth(spec, 0, slots, 50);
    assert.equal(got.healthType, 1);
    assert.equal(got.new1344, 1, "ht1 drops the bone term");
    assert.equal(got.scanRuns, 0, "1 < 9 signed: jl skips");
    assert.equal(got.scanIndex, -1);
    assert.equal(soulOf(0), 1, "the store still retires before the gate");
    assert.deepEqual([slotByte(0), slotByte(1)], [0x77, 0x77],
                     "skipped scan must not store");
    cases += 6;
  }
  /* (c) Walk onto the twin; the store goes to the WALKED player, the
     start player keeps its old [0x1344]; the scan matches the WALKED
     pointer, not the start. */
  {
    const spec = [
      { char: 0x11, twin: 1, v1340: 100, v1344: 100, v1d88: 100 },
      { char: 0x21, twin: -1, v1340: 4, v1344: 4, v1d88: 5 },
    ];
    const slots = [pAddr(0), pAddr(1), 2, 3, 4, 5, 6, 7];
    const { got } = runBoth(spec, 0, slots, 50);
    assert.equal(got.walkedAddr, pAddr(1) >>> 0, "walk lands on the twin");
    assert.equal(got.healthType, 3, "char 0x21 -> ht 3");
    assert.equal(got.new1344, 14, "4 + 2*5");
    assert.equal(soulOf(1), 14, "store goes to the WALKED player");
    assert.equal(soulOf(0), 100, "start player 0x1344 untouched");
    assert.equal(got.scanIndex, 1, "scan matches the WALKED pointer");
    assert.equal(slotByte(0), 0x77, "slot holding the START must not store");
    assert.equal(slotByte(1), 4);
    cases += 8;
  }
  /* (d) INT_MIN vs positive pre: signed gate skips where unsigned
     would scan. */
  {
    const spec = [{ char: 5, twin: -1, v1340: 1, v1344: 1,
                    v1d88: 0x40000000 }];
    const slots = [pAddr(0), 1, 2, 3, 4, 5, 6, 7];
    const { got } = runBoth(spec, 0, slots, 50);
    assert.equal(got.new1344, -0x80000000 + 1, "lea wrap to INT_MIN+1");
    assert.equal(got.scanRuns, 0, "INT_MIN+1 < 1 signed: skip");
    assert.equal(slotByte(0), 0x77);
    cases += 3;
  }
  /* (e) Walker cycle: terminated 0, and NOTHING is stored anywhere. */
  {
    const spec = [
      { char: 0x11, twin: 1, v1340: 6, v1344: 1, v1d88: 1 },
      { char: 0x11, twin: 0, v1340: 7, v1344: 2, v1d88: 2 },
    ];
    const slots = [pAddr(0), pAddr(1), 2, 3, 4, 5, 6, 7];
    const { got } = runBoth(spec, 0, slots, 64);
    assert.equal(got.walkTerminated, 0, "cycle reports non-termination");
    assert.equal(soulOf(0), 1, "no store on non-termination (start)");
    assert.equal(soulOf(1), 2, "no store on non-termination (twin)");
    assert.deepEqual([slotByte(0), slotByte(1)], [0x77, 0x77]);
    cases += 4;
  }
  /* (f) No-match scan: index 8, no byte store, but the 0x1344 store
     still retired. */
  {
    const spec = [{ char: 8, twin: -1, v1340: 2, v1344: 2, v1d88: 0 }];
    const slots = [1, 2, 3, 4, 5, 6, 7, 8];
    const { got } = runBoth(spec, 0, slots, 50);
    assert.equal(got.scanIndex, 8, "no match");
    assert.equal(got.scanStoreApplied, 0);
    assert.equal(soulOf(0), 2, "store retired (2 == 2 + 2*0)");
    cases += 3;
  }

  t.diagnostic(`v13 run_pre cases: ${cases}`);
  assert.ok(cases >= 70, `expected >= 70 run_pre cases, got ${cases}`);
});

test("Wasm matches JS: v13 heal_plan decision layer", () => {
  const view = new DataView(wasm.memory.buffer);
  const PLAN = SCRATCH + 0x71000;
  const OFF = {
    gate: 0, capacity: 4, applies: 8, excess: 12,
    store194cAfterHost: 16, healHostVa: 20, tailHostVa: 24,
  };
  const runBoth = (g, dByte, r, a, b, c, d) => {
    wasm.isaac_pm_c0t_heal_plan(g | 0, dByte >>> 0, r | 0, a | 0, b | 0,
                                c | 0, d | 0, PLAN);
    const got = {
      gate: readI32(view, PLAN + OFF.gate),
      capacity: readI32(view, PLAN + OFF.capacity),
      applies: readI32(view, PLAN + OFF.applies),
      excess: readI32(view, PLAN + OFF.excess),
      store194cAfterHost: readI32(view, PLAN + OFF.store194cAfterHost),
      healHostVa: readU32(view, PLAN + OFF.healHostVa),
      tailHostVa: readU32(view, PLAN + OFF.tailHostVa),
    };
    const want = pmC0tHealPlan(g, dByte, r, a, b, c, d);
    assert.deepEqual(got, {
      gate: want.gate, capacity: want.capacity, applies: want.applies,
      excess: want.excess, store194cAfterHost: want.store194cAfterHost,
      healHostVa: want.healHostVa >>> 0, tailHostVa: want.tailHostVa >>> 0,
    }, `heal plan ${g} ${dByte} ${r} ${a} ${b} ${c} ${d}`);
    return got;
  };
  /* Applies: the burst with the wrapped excess, store after. v16 the
     0x007ca2d0 edge is translated (isaac_pm_heal_plan), so the record
     no longer carries a host address. */
  let got = runBoth(1, 0, 100, 6, 4, 3, 2);
  assert.equal(got.gate, 1);
  assert.equal(got.capacity, 6);
  assert.equal(got.applies, 1);
  assert.equal(got.excess, 94);
  assert.equal(got.store194cAfterHost, 1);
  assert.equal(got.healHostVa >>> 0, 0);
  assert.equal(got.tailHostVa >>> 0, 0x007cabc0,
               "exact update_bone_hearts runs on EVERY path");
  /* Gate passes but no excess: no host, no store. */
  got = runBoth(1, 0, 6, 6, 4, 3, 2);
  assert.equal(got.applies, 0);
  assert.equal(got.healHostVa, 0);
  assert.equal(got.store194cAfterHost, 0);
  assert.equal(got.tailHostVa >>> 0, 0x007cabc0);
  /* Gate closed: Game[0x26614] >= 2 signed. */
  got = runBoth(2, 0, 100, 6, 4, 3, 2);
  assert.equal(got.gate, 0);
  assert.equal(got.tailHostVa >>> 0, 0x007cabc0);
  /* Dead byte wide: 0x100 has AL == 0 and passes. */
  got = runBoth(1, 0x100, 100, 6, 4, 3, 2);
  assert.equal(got.gate, 1, "0x100 dead byte must read as AL == 0");
  got = runBoth(1, 0x1ff, 100, 6, 4, 3, 2);
  assert.equal(got.gate, 0, "0x1ff dead byte must read as AL != 0");
});

test("deterministic randomized differential corpus: v13 C0T", (t) => {
  const view = new DataView(wasm.memory.buffer);
  let seed = 0xc07 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* Indices from the HIGH bits (standing decision). */
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  let hitHt12 = 0;
  let hitHtOther = 0;
  let hitGateSkip = 0;
  let hitGateRun = 0;
  let hitSlot = Array(9).fill(0);
  let hitWalk = 0;
  let hitNoWalk = 0;

  const GAME = SCRATCH;
  const P_BASE = SCRATCH + 0x22000;
  const P_STRIDE = 0x2000;
  const PLAN = SCRATCH + 0x72000;
  const pAddr = (i) => P_BASE + i * P_STRIDE;
  const slotVa = (i) => GAME + PM_C0T_SCAN_BASE_OFF + i * PM_C0T_SCAN_STRIDE;
  const PRE_OFF = {
    walkedAddr: 0, walkTerminated: 4, pre1344: 8, healthType: 12,
    new1344: 16, scanRuns: 20, scanIndex: 24, scanStoreApplied: 28,
    nextHostVa: 32,
  };

  const CHAR_POOL = [4, 5, 0xa, 0xc, 0xe, 0x10, 0x11, 0x12, 0x18, 0x1f,
                     0x21, 0x23, 0x24, 0x28, 0x29, 3, 0, -1, 0x111,
                     0x7fffffff];
  const VAL_POOL = () => {
    const k = rnd() >>> 30;
    if (k === 0) return rnd() | 0;
    if (k === 1) return (rnd() >>> 28) - 4 | 0;
    if (k === 2) return [0x7fffffff, -0x80000000, 0x40000000, -1][pick(4)];
    return (rnd() >>> 24) | 0;
  };

  for (let trial = 0; trial < 900; trial += 1) {
    /* Chain length 1..3, acyclic by construction; a walker start engages
       the walk, everything else pins the no-walk arm. */
    const chainLen = 1 + pick(3);
    const spec = [];
    for (let i = 0; i < chainLen; i += 1) {
      const walker = i < chainLen - 1 && pick(3) !== 0;
      spec.push({
        char: walker ? 0x11 : CHAR_POOL[pick(CHAR_POOL.length)],
        twin: i < chainLen - 1 ? i + 1 : (pick(2) === 0 ? -1 : -1),
        v1340: VAL_POOL(), v1344: VAL_POOL(), v1d88: VAL_POOL(),
      });
    }
    const slotValues = [];
    for (let i = 0; i < 8; i += 1) {
      /* Bias real player addresses into the slots so every index hits
         over the corpus. */
      slotValues.push(pick(3) === 0 ? pAddr(pick(chainLen)) : (0x8000 + i));
    }
    for (let i = 0; i < spec.length; i += 1) {
      const a = pAddr(i);
      view.setInt32(a + PM_C0T_OFF_CHAR_13C0, spec[i].char | 0, true);
      view.setUint32(a + 0x1d98,
                     spec[i].twin < 0 ? 0 : pAddr(spec[i].twin), true);
      view.setInt32(a + PM_C0T_OFF_FATAL_1340, spec[i].v1340 | 0, true);
      view.setInt32(a + PM_C0T_OFF_SOUL_1344, spec[i].v1344 | 0, true);
      view.setInt32(a + 0x1d88, spec[i].v1d88 | 0, true);
    }
    for (let i = 0; i < 8; i += 1) {
      view.setUint32(slotVa(i), slotValues[i] >>> 0, true);
      view.setUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF, 0x55);
    }
    wasm.isaac_pm_c0t_run_pre(pAddr(0), GAME, 64, PLAN);
    const players = new Map();
    for (let i = 0; i < spec.length; i += 1) {
      players.set(pAddr(i), {
        char: spec[i].char,
        twin: spec[i].twin < 0 ? 0 : pAddr(spec[i].twin),
        v1340: spec[i].v1340, v1344: spec[i].v1344, v1d88: spec[i].v1d88,
      });
    }
    const want = pmC0tRunPre(players, pAddr(0), slotValues, 64);
    assert.equal(readU32(view, PLAN + PRE_OFF.walkedAddr),
                 want.walkedAddr >>> 0, `rnd walked ${trial}`);
    assert.equal(readI32(view, PLAN + PRE_OFF.pre1344), want.pre1344,
                 `rnd pre ${trial}`);
    assert.equal(readI32(view, PLAN + PRE_OFF.healthType), want.healthType,
                 `rnd ht ${trial}`);
    assert.equal(readI32(view, PLAN + PRE_OFF.new1344), want.new1344,
                 `rnd new ${trial}`);
    assert.equal(readI32(view, PLAN + PRE_OFF.scanRuns), want.scanRuns,
                 `rnd gate ${trial}`);
    assert.equal(readI32(view, PLAN + PRE_OFF.scanIndex), want.scanIndex,
                 `rnd slot ${trial}`);
    /* Memory effects mirror the oracle's plan. */
    const walked = want.walkedAddr;
    assert.equal(readI32(view, walked + PM_C0T_OFF_SOUL_1344),
                 want.new1344, `rnd store ${trial}`);
    if (want.slotByteIndex >= 0) {
      assert.equal(view.getUint8(slotVa(want.slotByteIndex) +
                                 PM_C0T_SCAN_BYTE_OFF), 4,
                   `rnd slot byte ${trial}`);
    }
    /* Value-level pipeline agreement on the same draw. */
    assert.equal(
      wasm.isaac_pm_c0t_scan_gate(want.new1344 | 0, want.pre1344 | 0) | 0,
      want.scanRuns, `rnd gate export ${trial}`);
    const walkedSpecIndex = (walked - P_BASE) / P_STRIDE;
    assert.equal(
      wasm.isaac_pm_ep_get_health_type(spec[walkedSpecIndex].char | 0) | 0,
      want.healthType, `rnd ht export ${trial}`);
    cases += 10;

    if (want.healthType === 1 || want.healthType === 2) hitHt12 += 1;
    else hitHtOther += 1;
    if (want.scanRuns === 0) hitGateSkip += 1;
    else {
      hitGateRun += 1;
      hitSlot[want.scanIndex] += 1;
    }
    if (walkedSpecIndex !== 0) hitWalk += 1;
    else hitNoWalk += 1;
  }

  /* Force the slot indices the bias missed: one direct pass per index. */
  for (let hit = 0; hit < 8; hit += 1) {
    view.setInt32(pAddr(0) + PM_C0T_OFF_CHAR_13C0, 0x1d, true);
    view.setUint32(pAddr(0) + 0x1d98, 0, true);
    view.setInt32(pAddr(0) + PM_C0T_OFF_FATAL_1340, 4, true);
    view.setInt32(pAddr(0) + PM_C0T_OFF_SOUL_1344, 0, true);
    view.setInt32(pAddr(0) + 0x1d88, 1, true);
    for (let i = 0; i < 8; i += 1) {
      view.setUint32(slotVa(i), i === hit ? pAddr(0) : 0x1234, true);
      view.setUint8(slotVa(i) + PM_C0T_SCAN_BYTE_OFF, 0x55);
    }
    wasm.isaac_pm_c0t_run_pre(pAddr(0), GAME, 8, PLAN);
    assert.equal(readI32(view, PLAN + PRE_OFF.scanIndex), hit,
                 `forced slot ${hit}`);
    hitSlot[hit] += 1;
    cases += 1;
  }

  /* Corpus reach: both recompute arms, both gate directions, every slot
     of the 8-slot scan, walked and unwalked starts. */
  assert.ok(hitHt12 > 0, "corpus never took the ht {1,2} arm");
  assert.ok(hitHtOther > 0, "corpus never took the bone arm");
  assert.ok(hitGateSkip > 0, "corpus never skipped via the signed jl");
  assert.ok(hitGateRun > 0, "corpus never ran the scan");
  for (let i = 0; i < 8; i += 1) {
    assert.ok(hitSlot[i] > 0, `corpus never matched scan slot ${i}`);
  }
  assert.ok(hitWalk > 0, "corpus never walked a twin chain");
  assert.ok(hitNoWalk > 0, "corpus never kept the start player");

  t.diagnostic(
    `v13 corpus: ${cases} cases; ht12=${hitHt12} other=${hitHtOther} ` +
    `skip=${hitGateSkip} run=${hitGateRun} slots=[${hitSlot.join(",")}] ` +
    `walk=${hitWalk} stay=${hitNoWalk}`);
  assert.ok(cases >= 9000, `expected >= 9000 cases, got ${cases}`);
});

/* ====================================================================== */
/* v14 UBH — exact update_bone_hearts 0x007cabc0 + GHL — exact           */
/* GetHealthLimit(bool) 0x007cae60, translated whole.                    */
/* ====================================================================== */

const V14_LITERALS = [
  ["ISAAC_PM_UBH_VA_BODY", "0x007cabc0", PM_UBH_VA_BODY, 0x007cabc0],
  ["ISAAC_PM_UBH_VA_RET_EARLY", "0x007cac22", PM_UBH_VA_RET_EARLY,
   0x007cac22],
  ["ISAAC_PM_UBH_VA_RET_TAIL", "0x007caca2", PM_UBH_VA_RET_TAIL,
   0x007caca2],
  ["ISAAC_PM_UBH_BODY_BYTES", "227", PM_UBH_BODY_BYTES, 227],
  ["ISAAC_PM_UBH_CALLSITE_COUNT", "19", PM_UBH_CALLSITES.length, 19],
  ["ISAAC_PM_UBH_OFF_BITS_1D8C", "0x1d8c", PM_UBH_OFF_BITS_1D8C, 0x1d8c],
  ["ISAAC_PM_UBH_WORD_BITS", "0x20", PM_UBH_WORD_BITS, 0x20],
  ["ISAAC_PM_UBH_GATE_LIMIT", "2", PM_UBH_GATE_LIMIT, 2],
  ["ISAAC_PM_GHL_VA_BODY", "0x007cae60", PM_GHL_VA_BODY, 0x007cae60],
  ["ISAAC_PM_GHL_VA_RET_A0", "0x007cae85", PM_GHL_VA_RET_A0, 0x007cae85],
  ["ISAAC_PM_GHL_VA_RET_NULL78", "0x007caeb6", PM_GHL_VA_RET_NULL78,
   0x007caeb6],
  ["ISAAC_PM_GHL_VA_RET_NULL79", "0x007caed4", PM_GHL_VA_RET_NULL79,
   0x007caed4],
  ["ISAAC_PM_GHL_VA_RET_COMMON", "0x007cafd2", PM_GHL_VA_RET_COMMON,
   0x007cafd2],
  ["ISAAC_PM_GHL_BODY_BYTES", "373", PM_GHL_BODY_BYTES, 373],
  ["ISAAC_PM_GHL_CALLSITE_COUNT", "28", PM_GHL_CALLSITES.length, 28],
  ["ISAAC_PM_GHL_VA_REGISTRATION_PUSH", "0x0086a04f",
   PM_GHL_VA_REGISTRATION_PUSH, 0x0086a04f],
  ["ISAAC_PM_GHL_VA_REGISTRATION_SINK", "0x008836b0",
   PM_GHL_VA_REGISTRATION_SINK, 0x008836b0],
  ["ISAAC_PM_GHL_STR_GETHEARTLIMIT_VA", "0x00b722b4",
   PM_GHL_STR_GETHEARTLIMIT_VA, 0x00b722b4],
  ["ISAAC_PM_GHL_VA_HAS_NULL_EFFECT", "0x00930680",
   PM_GHL_VA_HAS_NULL_EFFECT, 0x00930680],
  ["ISAAC_PM_GHL_VA_HAS_COLLECTIBLE", "0x007706e0",
   PM_GHL_VA_HAS_COLLECTIBLE, 0x007706e0],
  ["ISAAC_PM_GHL_VA_GULLET", "0x007ce390", PM_GHL_VA_GULLET, 0x007ce390],
  ["ISAAC_PM_GHL_RESULT_GATE_CLOSED", "0xa0", PM_GHL_RESULT_GATE_CLOSED,
   0xa0],
  ["ISAAC_PM_GHL_OFF_STATE_2C", "0x2c", PM_GHL_OFF_STATE_2C, 0x2c],
  ["ISAAC_PM_GHL_OFF_TEMP_EFFECTS_1508", "0x1508",
   PM_GHL_OFF_TEMP_EFFECTS_1508, 0x1508],
  ["ISAAC_PM_GHL_OFF_COINS_1368", "0x1368", PM_GHL_OFF_COINS_1368, 0x1368],
  ["ISAAC_PM_GHL_OFF_CLAMP_1DA0", "0x1da0", PM_GHL_OFF_CLAMP_1DA0, 0x1da0],
  ["ISAAC_PM_GHL_NULL_EFFECT_78", "0x78", PM_GHL_NULL_EFFECT_78, 0x78],
  ["ISAAC_PM_GHL_NULL_EFFECT_79", "0x79", PM_GHL_NULL_EFFECT_79, 0x79],
  ["ISAAC_PM_GHL_CHAR_10_RESULT", "6", PM_GHL_CHAR_10_RESULT, 6],
  ["ISAAC_PM_GHL_CHAR_14_RESULT", "4", PM_GHL_CHAR_14_RESULT, 4],
  ["ISAAC_PM_GHL_BASE_DEFAULT", "0x18", PM_GHL_BASE_DEFAULT, 0x18],
  ["ISAAC_PM_GHL_BASE_SMALL", "0xc", PM_GHL_BASE_SMALL, 0xc],
  ["ISAAC_PM_GHL_CHAR1_BONUS", "0xc", PM_GHL_CHAR1_BONUS, 0xc],
  ["ISAAC_PM_GHL_KEEPER_CHAR_E", "0xe", PM_GHL_KEEPER_CHAR_E, 0xe],
  ["ISAAC_PM_GHL_KEEPER_CHAR_21", "0x21", PM_GHL_KEEPER_CHAR_21, 0x21],
  ["ISAAC_PM_GHL_KEEPER_SEL_BASE", "4", PM_GHL_KEEPER_SEL_BASE, 4],
  ["ISAAC_PM_GHL_KEEPER_CAP", "0x18", PM_GHL_KEEPER_CAP, 0x18],
  ["ISAAC_PM_GHL_KEEPER_26B_BONUS", "2", PM_GHL_KEEPER_26B_BONUS, 2],
  ["ISAAC_PM_GHL_COLLECTIBLE_26B", "0x26b", PM_GHL_COLLECTIBLE_26B, 0x26b],
  ["ISAAC_PM_GHL_COLLECTIBLE_1F5", "0x1f5", PM_GHL_COLLECTIBLE_1F5, 0x1f5],
  ["ISAAC_PM_GHL_COIN_DIV_MAGIC", "0x51eb851f", PM_GHL_COIN_DIV_MAGIC,
   0x51eb851f],
  ["ISAAC_PM_GHL_COIN_DIV_SHIFT", "3", PM_GHL_COIN_DIV_SHIFT, 3],
  ["ISAAC_PM_GHL_COIN_DIV_MODULUS", "25", PM_GHL_COIN_DIV_MODULUS, 25],
  ["ISAAC_PM_GHL_COIN_SPECIAL_63", "0x63", PM_GHL_COIN_SPECIAL_63, 0x63],
];

/* The two whole-.text censuses (19 UBH callers / 28 GHL callers),
   pinned as data so a model edit cannot silently drop a site. */
const V14_UBH_CALLSITES = [
  0x00758a54, 0x00758ba4, 0x00758efd, 0x007591ce, 0x0075920f, 0x00778bd8,
  0x007792e0, 0x007b4fcb, 0x007b5002, 0x007ca91a, 0x007cea75, 0x007ceba7,
  0x007cf001, 0x007cf018, 0x007d311b, 0x007d3163, 0x007daa7f, 0x009ba214,
  0x009bd845,
];
const V14_GHL_CALLSITES = [
  0x005c3082, 0x006e914a, 0x0075897a, 0x00758ea5, 0x0075908d, 0x00761e06,
  0x00761e1e, 0x00761e30, 0x00762695, 0x007626c5, 0x00777f80, 0x007a224d,
  0x007a5344, 0x007a5392, 0x007b3226, 0x007b5e96, 0x007c350e, 0x007ca937,
  0x007ca968, 0x007caa5f, 0x007cabd9, 0x007cacd8, 0x007d0eae, 0x007d0ebd,
  0x007d1573, 0x007d2a75, 0x007d9126, 0x00844ccf,
];

/* Struct layouts mirrored from the v14 header. */
const UBH_PLAN_SIZE = 48;
const UBH_OFF = {
  gateOpen: 0, newBone: 4, earlyZero: 8, totalSlots: 12, mask: 16,
  maskApplied: 20, loop1Ran: 24, loop2Entered: 28, budgetAfterLoop1: 32,
  final1d88: 36, final1d8c: 40, retVa: 44,
};
const GHL_IN_SIZE = 60;
const GHL_IN = {
  game26614: 0, v2c: 4, char1: 8, char2: 12, char3: 16, char4: 20,
  keeper: 24, null78: 28, null79: 32, has26bChar1: 36, gullet: 40,
  has26bCharE: 44, has1f5: 48, coins1368: 52, v1da0: 56,
};
const GHL_PLAN_SIZE = 48;
const GHL_OFF = {
  result: 0, retVa: 4, base: 8, keeperSkip: 12, clampApplied: 16,
  probe78Issued: 20, probe79Issued: 24, has26bChar1Issued: 28,
  gulletIssued: 32, has26bCharEIssued: 36, has1f5Issued: 40, coinBonus: 44,
};

function v14ReadUbhPlan(view, at) {
  return {
    gateOpen: readI32(view, at + UBH_OFF.gateOpen),
    newBone: readI32(view, at + UBH_OFF.newBone),
    earlyZero: readI32(view, at + UBH_OFF.earlyZero),
    totalSlots: readI32(view, at + UBH_OFF.totalSlots),
    mask: readU32(view, at + UBH_OFF.mask),
    maskApplied: readI32(view, at + UBH_OFF.maskApplied),
    loop1Ran: readI32(view, at + UBH_OFF.loop1Ran),
    loop2Entered: readI32(view, at + UBH_OFF.loop2Entered),
    budgetAfterLoop1: readI32(view, at + UBH_OFF.budgetAfterLoop1),
    final1d88: readI32(view, at + UBH_OFF.final1d88),
    final1d8c: readU32(view, at + UBH_OFF.final1d8c),
    retVa: readU32(view, at + UBH_OFF.retVa),
  };
}

function v14UbhPlanFromModel(want) {
  return {
    gateOpen: want.gateOpen, newBone: want.newBone,
    earlyZero: want.earlyZero, totalSlots: want.totalSlots,
    mask: want.mask >>> 0, maskApplied: want.maskApplied,
    loop1Ran: want.loop1Ran, loop2Entered: want.loop2Entered,
    budgetAfterLoop1: want.budgetAfterLoop1, final1d88: want.final1d88,
    final1d8c: want.final1d8c >>> 0, retVa: want.retVa >>> 0,
  };
}

function v14ReadGhlPlan(view, at) {
  return {
    result: readI32(view, at + GHL_OFF.result),
    retVa: readU32(view, at + GHL_OFF.retVa),
    base: readI32(view, at + GHL_OFF.base),
    keeperSkip: readI32(view, at + GHL_OFF.keeperSkip),
    clampApplied: readI32(view, at + GHL_OFF.clampApplied),
    probe78Issued: readI32(view, at + GHL_OFF.probe78Issued),
    probe79Issued: readI32(view, at + GHL_OFF.probe79Issued),
    has26bChar1Issued: readI32(view, at + GHL_OFF.has26bChar1Issued),
    gulletIssued: readI32(view, at + GHL_OFF.gulletIssued),
    has26bCharEIssued: readI32(view, at + GHL_OFF.has26bCharEIssued),
    has1f5Issued: readI32(view, at + GHL_OFF.has1f5Issued),
    coinBonus: readI32(view, at + GHL_OFF.coinBonus),
  };
}

function v14GhlPlanFromModel(want) {
  return {
    result: want.result, retVa: want.retVa >>> 0, base: want.base,
    keeperSkip: want.keeperSkip, clampApplied: want.clampApplied,
    probe78Issued: want.probe78Issued, probe79Issued: want.probe79Issued,
    has26bChar1Issued: want.has26bChar1Issued,
    gulletIssued: want.gulletIssued,
    has26bCharEIssued: want.has26bCharEIssued,
    has1f5Issued: want.has1f5Issued, coinBonus: want.coinBonus,
  };
}

function v14WriteGhlInputs(view, at, inp) {
  writeI32(view, at + GHL_IN.game26614, inp.game26614);
  writeI32(view, at + GHL_IN.v2c, inp.v2c);
  writeI32(view, at + GHL_IN.char1, inp.char1);
  writeI32(view, at + GHL_IN.char2, inp.char2);
  writeI32(view, at + GHL_IN.char3, inp.char3);
  writeI32(view, at + GHL_IN.char4, inp.char4);
  writeU32(view, at + GHL_IN.keeper, inp.keeper);
  writeU32(view, at + GHL_IN.null78, inp.null78);
  writeU32(view, at + GHL_IN.null79, inp.null79);
  writeU32(view, at + GHL_IN.has26bChar1, inp.has26bChar1);
  writeI32(view, at + GHL_IN.gullet, inp.gullet7ce390);
  writeU32(view, at + GHL_IN.has26bCharE, inp.has26bCharE);
  writeU32(view, at + GHL_IN.has1f5, inp.has1f5);
  writeI32(view, at + GHL_IN.coins1368, inp.coins1368);
  writeI32(view, at + GHL_IN.v1da0, inp.v1da0);
}

test("v14 UBH/GHL: every new literal pinned in the header AND the model", () => {
  const h = readFileSync(header, "utf8");
  for (const [name, literal, modelValue, expected] of V14_LITERALS) {
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${literal.replace("-", "\\-")}\\b`),
      `header literal ${name} = ${literal}`,
    );
    assert.equal(modelValue, expected, `model constant ${name}`);
  }
  assert.equal(V14_LITERALS.length, 44);
  /* The censused caller lists, byte for byte. */
  assert.deepEqual(PM_UBH_CALLSITES, V14_UBH_CALLSITES);
  assert.deepEqual(PM_GHL_CALLSITES, V14_GHL_CALLSITES);
  /* Every censused VA appears in the header evidence block. */
  for (const va of V14_UBH_CALLSITES.concat(V14_GHL_CALLSITES)) {
    const hex = `0x${va.toString(16).padStart(8, "0")}`;
    assert.match(h, new RegExp(hex), `census VA ${hex} in header`);
  }
  /* ABI moved past 14; v15 owns the current enum value. */
  assert.match(h, /ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 45/);
});

test("v14 UBH/GHL: header transcribes both bodies, censuses and corners", () => {
  const h = readFileSync(header, "utf8");
  /* Bounds, ret structure, anchors, phantom notes. */
  assert.match(h, /UBH body 0x007cabc0\.\.0x007caca2 inclusive \(227 bytes\), TWO rets/);
  assert.match(h, /int3 padding 0x007cabbc\.\.0x007cabbf/);
  assert.match(h, /GHL body 0x007cae60\.\.0x007cafd4 inclusive \(373 bytes\), FOUR `ret 4`/);
  assert.match(h, /"jmp @ 0x007cae5e"/);
  assert.match(h, /PHANTOM\s+decode of the table bytes/);
  assert.match(h, /2,094,788 \.text positions/);
  /* The floor-vs-trunc asymmetry — the whole risk of this unit. */
  assert.match(h, /trunc\(limit\/2\) — HAS the fix/);
  assert.match(h, /FLOOR\(\(v1340\+1\+v134c\)\/2\) — NO/);
  assert.match(h, /round DIFFERENTLY/);
  assert.match(h, /min_signed\(v1d88, avail\)/);
  /* Bit-level masking rules, operand by operand. */
  assert.match(h, /masks the count to CL & 31/);
  assert.match(h, /clear bit edx MOD 32/);
  assert.match(h, /set bit edx MOD 32/);
  assert.match(h, /probe tracks bit edx & 31/);
  assert.match(h, /rotate counts mask to 5 bits/);
  /* Loop discipline. */
  assert.match(h, /iterations, NO early exit/);
  assert.match(h, /RELOAD the word EVERY iteration/);
  assert.match(h, /budget <= 0 exits at the TOP/);
  /* The two pinned wrap corners. */
  assert.match(h, /budget\s+; of INT_MIN KEEPS the bit|budget of INT_MIN KEEPS the bit/);
  assert.match(h, /loop 2 ENTERS while loop 1 was\s+;?\s*skipped/);
  /* Censuses. */
  assert.match(h, /exactly 19 rel32 CALL sites,\s*\n?\s*ZERO tail jmps, ZERO raw LE-dword escapes/);
  assert.match(h, /exactly 28 rel32 CALL sites/);
  assert.match(h, /void __thiscall, plain ret/);
  assert.match(h, /__thiscall void Entity_Player::update_bone_hearts\(\)/);
  assert.match(h, /__thiscall int Entity_Player::GetHealthLimit\(bool keeper\)/);
  /* Registration evidence only; ZHL is the naming authority. */
  assert.match(h, /"GetHeartLimit"/);
  assert.match(h, /registration EVIDENCE ONLY/);
  /* Callee verification results. */
  assert.match(h, /exact ZHL TemporaryEffects::HasNullEffect\(int\)/);
  assert.match(h, /NO exact ZHL match \(family precedent: address-stable/);
  assert.match(h, /exact ZHL Entity_Player::GetGreedsGulletHearts\(\)/);
  /* Post-call discipline: four char reads, snapshot/reload mix. */
  assert.match(h, /char READ 1/);
  assert.match(h, /char READ 4/);
  assert.match(h, /PE mixes\s+a snapshot and a reload/);
  /* Keeper byte test + v9 widening. */
  assert.match(h, /the bool arg, LOW BYTE only/);
  assert.match(h, /NO \[0x1da0\] clamp/);
  assert.match(h, /widened to uint32_t with an explicit low-byte\s+mask in the body \(v9 rule\)/);
  /* Keeper-family machine quirks. */
  assert.match(h, /base RESET to 0x18/);
  assert.match(h, /bonus above is DISCARDED/);
  assert.match(h, /q\+1 kept when coins ==\s+0x63 exactly/);
  /* The tail-status claim of this unit. */
  assert.match(h, /only STATEFUL hosts\s+left on the whole 0x007791f0 CASE0 tail|only STATEFUL hosts left on the whole 0x007791f0 CASE0 tail/);
  assert.match(h, /update_red_hearts 0x007c9ea0 and address-stable 0x007ca2d0/);
  /* Source-side instruction comments exist too. */
  const s = readFileSync(source, "utf8");
  assert.match(s, /jns consumes SF/);
  assert.match(s, /register form indexes MOD 32/);
  assert.match(s, /x86 5-bit count mask/);
  assert.match(s, /the gate-closed path stores NOTHING/);
});

test("Wasm matches JS: v14 UBH scalar laws (gate, halves, slots, mask)", (t) => {
  let cases = 0;
  /* Gate: SIGNED < 2, and the SAME law at all three instruction sites
     (UBH 0x007cabd1 jge, GHL 0x007cae78 jl, v13 heal 0x00779288 jge) —
     cross-helper differential over a wide sweep. */
  const gateVals = [-0x80000000, -2, -1, 0, 1, 2, 3, 4, 0x7fffffff,
                    0x100, -0x100];
  for (const g of gateVals) {
    const w = wasm.isaac_pm_ubh_gate(g | 0) | 0;
    assert.equal(w, pmUbhGate(g), `ubh gate ${g}`);
    assert.equal(w, wasm.isaac_pm_ghl_gate_lt2(g | 0) | 0,
                 `gate agrees with GHL at ${g}`);
    assert.equal(w, wasm.isaac_pm_c0t_heal_gate(g | 0, 0, 1) | 0,
                 `gate agrees with v13 heal gate at ${g}`);
    assert.equal(w, pmGhlGateLt2(g), `ghl gate oracle ${g}`);
    cases += 4;
  }
  /* The exact boundary: 1 opens, 2 closes (a > 2 mutant flips 2). */
  assert.equal(wasm.isaac_pm_ubh_gate(1) | 0, 1, "gate(1) open");
  assert.equal(wasm.isaac_pm_ubh_gate(2) | 0, 0, "gate(2) CLOSED — jge is >=");
  assert.equal(wasm.isaac_pm_ubh_gate(3) | 0, 0);
  assert.equal(wasm.isaac_pm_ubh_gate(-0x80000000) | 0, 1, "INT_MIN opens");
  assert.equal(wasm.isaac_pm_ghl_gate_lt2(2) | 0, 0, "GHL 2 -> 0xa0 arm");
  cases += 5;

  /* new_bone: the floor-vs-trunc witness pair. trunc(7/2)=3 and
     floor((-3)/2)=-2 give 3-(-2)=5; a uniform-trunc mutant computes 4. */
  assert.equal(wasm.isaac_pm_ubh_new_bone(7, 0, -4, 100) | 0, 5,
               "floor half on the sum side");
  /* trunc(-7/2)=-3 (a floor there would give -4). */
  assert.equal(wasm.isaac_pm_ubh_new_bone(-7, 1, 0, 100) | 0, -4,
               "trunc half on the limit side");
  /* min direction: avail wins only when strictly smaller. */
  assert.equal(wasm.isaac_pm_ubh_new_bone(20, 1, 0, 3) | 0, 3);
  assert.equal(wasm.isaac_pm_ubh_new_bone(20, 1, 0, 100) | 0, 9);
  assert.equal(wasm.isaac_pm_ubh_new_bone(0x7fffffff, 0, 0, 5) | 0, 5);
  /* Wrap on the sum: v1340 INT_MAX + 1 + v134c. */
  assert.equal(
    wasm.isaac_pm_ubh_new_bone(0, 0x7fffffff, 0, 0) | 0,
    pmUbhNewBone(0, 0x7fffffff, 0, 0), "sum wrap witness");
  cases += 6;
  const pool = [0, 1, 2, 3, 7, -1, -7, 20, 99, -0x80000000, 0x7fffffff,
                0x40000000, -0x40000000, 0x63];
  for (const a of pool) {
    for (const b of pool) {
      assert.equal(wasm.isaac_pm_ubh_new_bone(a | 0, b | 0, 3, 50) | 0,
                   pmUbhNewBone(a, b, 3, 50), `new_bone ${a} ${b}`);
      cases += 1;
    }
  }

  /* early_zero boundary. */
  for (const [v, want] of [[0, 1], [1, 0], [-1, 1], [-0x80000000, 1],
                           [0x7fffffff, 0]]) {
    assert.equal(wasm.isaac_pm_ubh_early_zero(v | 0) | 0, want,
                 `early_zero ${v}`);
    assert.equal(wasm.isaac_pm_ubh_early_zero(v | 0) | 0,
                 pmUbhEarlyZero(v), `early_zero oracle ${v}`);
    cases += 2;
  }

  /* total_slots — cross-pinned against the v13 heal capacity with
     min(-1,-1) zeroing its first half: capacity(-1,-1,v,nb) ==
     half_of_inc(v) + nb == total_slots(v, nb). Two independently
     transcribed instances of the idiom must agree. */
  for (const v of pool) {
    for (const nb of [0, 1, 5, -3, 0x7fffffff, -0x80000000]) {
      const w = wasm.isaac_pm_ubh_total_slots(v | 0, nb | 0) | 0;
      assert.equal(w, pmUbhTotalSlots(v, nb), `slots ${v} ${nb}`);
      assert.equal(w, wasm.isaac_pm_c0t_heal_capacity(-1, -1, v | 0, nb | 0) | 0,
                   `slots cross-pin v13 idiom ${v} ${nb}`);
      cases += 2;
    }
  }
  assert.equal(wasm.isaac_pm_ubh_total_slots(3, 4) | 0, 6, "trunc(4/2)+4");
  assert.equal(wasm.isaac_pm_ubh_total_slots(-4, 4) | 0, 3,
               "trunc(-3/2) = -1 (a floor mutant gives 2)");
  cases += 2;

  /* mask: the CL & 31 law across the whole surprising range. */
  for (const [slots, want] of [
    [1, 0x1], [2, 0x3], [8, 0xff], [16, 0xffff], [31, 0x7fffffff],
    [32, 0xffffffff], [0, 0xffffffff],          /* shr by 0x20&31 == 0 */
    [33, 0x1],                                  /* 0x20-33 = -1, cl 31 */
    [40, 0xff], [-1, 0x7fffffff], [64, 0xffffffff],
    [-0x80000000, 0xffffffff],                  /* cl 0x20 -> 0 */
  ]) {
    assert.equal(wasm.isaac_pm_ubh_mask_1d8c(slots | 0) >>> 0, want >>> 0,
                 `mask ${slots}`);
    assert.equal(wasm.isaac_pm_ubh_mask_1d8c(slots | 0) >>> 0,
                 pmUbhMask1d8c(slots) >>> 0, `mask oracle ${slots}`);
    cases += 2;
  }

  /* Loop entry classification, including the INT_MIN wrap corner where
     loop 2 enters although loop 1 was skipped. */
  for (const [slots, r1, r2] of [
    [0, 0, 0], [1, 1, 1], [2, 1, 1], [40, 1, 1], [0x7fffffff, 1, 1],
    [-1, 0, 0], [-5, 0, 0],
    [-0x80000000, 0, 1],   /* lea edx,[ebx-1] wraps to 0x7fffffff */
  ]) {
    assert.equal(wasm.isaac_pm_ubh_loop1_runs(slots | 0) | 0, r1,
                 `loop1_runs ${slots}`);
    assert.equal(wasm.isaac_pm_ubh_loop2_enters(slots | 0) | 0, r2,
                 `loop2_enters ${slots}`);
    assert.equal(wasm.isaac_pm_ubh_loop1_runs(slots | 0) | 0,
                 pmUbhLoop1Runs(slots), `loop1_runs oracle ${slots}`);
    assert.equal(wasm.isaac_pm_ubh_loop2_enters(slots | 0) | 0,
                 pmUbhLoop2Enters(slots), `loop2_enters oracle ${slots}`);
    cases += 4;
  }
  t.diagnostic(`v14 UBH scalar cases: ${cases}`);
  assert.ok(cases >= 300, `expected >= 300 cases, got ${cases}`);
});

test("Wasm matches JS: v14 UBH bit loops, instruction-verbatim", (t) => {
  let cases = 0;
  const l1 = (bits, slots, budget) => ({
    bits: wasm.isaac_pm_ubh_loop1_bits(bits >>> 0, slots | 0, budget | 0) >>> 0,
    budget: wasm.isaac_pm_ubh_loop1_budget(bits >>> 0, slots | 0, budget | 0) | 0,
  });
  const l2 = (bits, slots, budget) =>
    wasm.isaac_pm_ubh_loop2_bits(bits >>> 0, slots | 0, budget | 0) >>> 0;

  /* Loop 1 fixed pins. Budget 2 over 0b1111: bits 0,1 kept (budget
     1,0), bits 2,3 cleared (budget -1,-2). */
  assert.deepEqual(l1(0xf, 4, 2), { bits: 0x3, budget: -2 });
  assert.deepEqual(l1(0xf, 4, 2), pmUbhLoop1(0xf, 4, 2));
  /* Budget exactly covers the set bits: nothing cleared. */
  assert.deepEqual(l1(0xf, 4, 4), { bits: 0xf, budget: 0 });
  /* Zero budget clears every set bit visited. */
  assert.deepEqual(l1(0xf, 4, 0), { bits: 0x0, budget: -4 });
  /* Bits beyond the slot bound are NOT visited. */
  assert.deepEqual(l1(0xff, 4, 0), { bits: 0xf0, budget: -4 });
  /* jns consumes SF of the wrap: budget INT_MIN KEEPS the bit and
     wraps to INT_MAX (original corner, reproduced). */
  assert.deepEqual(l1(0x1, 1, -0x80000000),
                   { bits: 0x1, budget: 0x7fffffff });
  assert.deepEqual(l1(0x1, 1, -0x80000000),
                   pmUbhLoop1(0x1, 1, -0x80000000));
  /* Negative budget entering: every set bit cleared immediately. */
  assert.deepEqual(l1(0x5, 3, -1), { bits: 0x0, budget: -3 });
  /* slots > 32: the probe and btr both wrap mod 32 — a second visit of
     bit 0..7 sees the already-cleared word. */
  assert.deepEqual(l1(0xffffffff, 40, 0), { bits: 0x0, budget: -32 });
  assert.deepEqual(l1(0xffffffff, 40, 0), pmUbhLoop1(0xffffffff, 40, 0));
  /* The &15-mutant discriminator: bits 16..23 set, slots 24, budget 0 —
     correct btr clears them (indices 16..23); an index mask of & 15
     would clear 0..7 instead and leave the word unchanged. */
  assert.deepEqual(l1(0x00ff0000, 24, 0), { bits: 0x0, budget: -8 });
  assert.deepEqual(l1(0x00ff0000, 24, 0), pmUbhLoop1(0x00ff0000, 24, 0));
  /* slots > 32 with budget: revisit of bit 3 (edx 35) decrements the
     budget a SECOND time — the probe really wraps. */
  assert.deepEqual(l1(0x8, 36, 2), pmUbhLoop1(0x8, 36, 2));
  assert.equal(pmUbhLoop1(0x8, 36, 2).budget, 0,
               "bit 3 visited twice across the wrap");
  cases += 13;

  /* Loop 2 fixed pins. Descending from slots-1, budget at the top. */
  assert.equal(l2(0x0, 3, 2), 0x6, "sets bits 2 then 1");
  assert.equal(l2(0x0, 3, 2), pmUbhLoop2(0x0, 3, 2).bits >>> 0);
  assert.equal(l2(0x5, 3, 5), 0x7, "only the clear bit 1 is set");
  assert.equal(l2(0x0, 3, 0), 0x0, "budget 0 exits before any set");
  assert.equal(l2(0x0, 3, -1), 0x0, "negative budget exits at the top");
  /* slots 52: first index is 51, bts hits bit 51 & 31 = 19. An & 15
     index mutant would hit bit 3. */
  assert.equal(l2(0x0, 52, 1), 0x80000, "bts index 51 mod 32 = 19");
  assert.equal(l2(0x0, 52, 1), pmUbhLoop2(0x0, 52, 1).bits >>> 0);
  /* The rol-count-mask discriminator: slots 24 starts the probe at
     1 rol 23; with bit 23 already set the first iteration SKIPS (no
     budget spend) and bit 22 is set next. A probe built with rol
     count & 15 (bit 7) would see "clear" and re-set bit 23, leaving
     bit 22 untouched. */
  assert.equal(l2(0x00800000, 24, 1), 0x00c00000,
               "probe must start at bit 23, not bit 7");
  assert.equal(l2(0x00800000, 24, 1), pmUbhLoop2(0x00800000, 24, 1).bits >>> 0);
  /* Full descent with plenty of budget fills every position mod 32. */
  assert.equal(l2(0x0, 40, 64), 0xffffffff >>> 0);
  assert.equal(l2(0x0, 40, 64), pmUbhLoop2(0x0, 40, 64).bits >>> 0);
  cases += 11;

  /* Deterministic randomized differential over both loops (HIGH bits). */
  let seed = 0xb14e >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let hitSlots0 = 0;
  let hitSlotsBig = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const bits = rnd();
    const slots = pick(4) === 0 ? 0 : pick(97) - 16; /* -16..80, some 0 */
    const budget = pick(5) === 0 ? -(pick(8) | 0) : pick(48);
    const wj1 = pmUbhLoop1(bits, slots, budget);
    assert.deepEqual(l1(bits, slots, budget), wj1,
                     `rnd loop1 ${trial} ${bits} ${slots} ${budget}`);
    const wj2 = pmUbhLoop2(wj1.bits, slots, wj1.budget);
    assert.equal(l2(wj1.bits, slots, wj1.budget), wj2.bits >>> 0,
                 `rnd loop2 ${trial}`);
    if (slots <= 0) hitSlots0 += 1;
    if (slots > 32) hitSlotsBig += 1;
    cases += 2;
  }
  assert.ok(hitSlots0 > 0, "corpus never hit slot count 0");
  assert.ok(hitSlotsBig > 0, "corpus never exceeded the 32-bit word");
  t.diagnostic(
    `v14 loop cases: ${cases}; slots0=${hitSlots0} slots>32=${hitSlotsBig}`);
  assert.ok(cases >= 1200, `expected >= 1200 cases, got ${cases}`);
});

test("Wasm matches JS: v14 UBH run and guest-memory apply", (t) => {
  const view = new DataView(wasm.memory.buffer);
  const PLAN = SCRATCH + 0xc8200;
  const GAME = SCRATCH + 0x80000;
  const P = SCRATCH + 0xb0000;
  let cases = 0;

  const runBoth = (g, limit, v1340, v134c, v1d88, bits) => {
    wasm.isaac_pm_ubh_run(g | 0, limit | 0, v1340 | 0, v134c | 0,
                          v1d88 | 0, bits >>> 0, PLAN);
    const got = v14ReadUbhPlan(view, PLAN);
    const want = v14UbhPlanFromModel(
      pmUbhRun(g, limit, v1340, v134c, v1d88, bits));
    assert.deepEqual(got, want,
                     `run ${g} ${limit} ${v1340} ${v134c} ${v1d88} ${bits}`);
    cases += 1;
    return got;
  };

  /* Gate closed: no work, fields echo inputs, TAIL ret. */
  let got = runBoth(2, 100, 1, 2, 7, 0xdeadbeef);
  assert.equal(got.gateOpen, 0);
  assert.equal(got.final1d88, 7);
  assert.equal(got.final1d8c >>> 0, 0xdeadbeef >>> 0);
  assert.equal(got.retVa >>> 0, PM_UBH_VA_RET_TAIL);
  /* Early zero: RET EARLY, both fields zero. */
  got = runBoth(1, 0, 0, 0, 0, 0xffffffff);
  assert.equal(got.earlyZero, 1);
  assert.equal(got.newBone, 0, "min(0, trunc(0/2)-floor(1/2)=0) = 0");
  assert.deepEqual([got.final1d88, got.final1d8c], [0, 0]);
  assert.equal(got.retVa >>> 0, PM_UBH_VA_RET_EARLY);
  /* Normal: limit 12 -> avail 6-floor(4/2)=... v1340=1,v134c=2:
     sum=4, floor 2, avail 6-2=4; min(4, v1d88=3)=3; slots =
     trunc(3/2)+3 = 4; mask 0xf. */
  got = runBoth(1, 12, 1, 2, 3, 0b1011);
  assert.equal(got.newBone, 3);
  assert.equal(got.totalSlots, 4);
  assert.equal(got.mask >>> 0, 0xf);
  assert.equal(got.loop1Ran, 1);
  assert.equal(got.loop2Entered, 1);
  assert.equal(got.retVa >>> 0, PM_UBH_VA_RET_TAIL);
  /* 0b1011 has 3 set bits == budget: loop1 keeps all (budget 0),
     loop2 exits on budget at the top. */
  assert.equal(got.budgetAfterLoop1, 0);
  assert.equal(got.final1d8c >>> 0, 0b1011);
  cases += 15;

  /* Memory apply: sentinel fields, gate closed -> memory UNTOUCHED. */
  const setP = (v1340, v134c, v1d88, bits) => {
    writeI32(view, P + PM_C0T_OFF_FATAL_1340, v1340);
    writeI32(view, P + PM_C0T_OFF_134C, v134c);
    writeI32(view, P + 0x1d88, v1d88);
    writeU32(view, P + PM_UBH_OFF_BITS_1D8C, bits);
  };
  const readP = () => ({
    v1d88: readI32(view, P + 0x1d88),
    bits: readU32(view, P + PM_UBH_OFF_BITS_1D8C),
  });
  writeI32(view, GAME + 0x26614, 5); /* closed */
  setP(1, 2, 0x55aa, 0x12345678);
  wasm.isaac_pm_ubh_apply(P, GAME, 40, PLAN);
  got = v14ReadUbhPlan(view, PLAN);
  assert.equal(got.gateOpen, 0);
  assert.deepEqual(readP(), { v1d88: 0x55aa, bits: 0x12345678 >>> 0 },
                   "gate-closed apply must not store");
  /* Open gate, early zero: both fields zeroed in memory. */
  writeI32(view, GAME + 0x26614, 1);
  setP(0, 0, -5, 0xffffffff);
  wasm.isaac_pm_ubh_apply(P, GAME, 0, PLAN);
  got = v14ReadUbhPlan(view, PLAN);
  assert.equal(got.earlyZero, 1);
  assert.deepEqual(readP(), { v1d88: 0, bits: 0 });
  /* Open gate, normal path: memory equals the plan finals and the
     scalar run on the same inputs. */
  setP(1, 2, 3, 0b1011);
  wasm.isaac_pm_ubh_apply(P, GAME, 12, PLAN);
  got = v14ReadUbhPlan(view, PLAN);
  const wantRun = v14UbhPlanFromModel(pmUbhRun(1, 12, 1, 2, 3, 0b1011));
  assert.deepEqual(got, wantRun, "apply plan == scalar run plan");
  assert.deepEqual(readP(), { v1d88: wantRun.final1d88,
                              bits: wantRun.final1d8c >>> 0 });
  cases += 6;

  /* Randomized differential of run over bounded loop ranges. */
  let seed = 0xa9 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let hitEarly = 0;
  let hitTail = 0;
  let hitClosed = 0;
  for (let trial = 0; trial < 500; trial += 1) {
    const g = pick(6) === 0 ? 2 + pick(4) : pick(2);
    const limit = pick(400) - 20;
    const v1340 = pick(70) - 10;
    const v134c = pick(70) - 10;
    const v1d88 = pick(50) - 10;
    const bits = rnd();
    const got2 = runBoth(g, limit, v1340, v134c, v1d88, bits);
    if (got2.gateOpen === 0) hitClosed += 1;
    else if ((got2.retVa >>> 0) === PM_UBH_VA_RET_EARLY) hitEarly += 1;
    else hitTail += 1;
  }
  assert.ok(hitEarly > 0, "corpus never took RET EARLY");
  assert.ok(hitTail > 0, "corpus never took RET TAIL open");
  assert.ok(hitClosed > 0, "corpus never closed the gate");
  t.diagnostic(`v14 run cases: ${cases}; early=${hitEarly} ` +
               `tail=${hitTail} closed=${hitClosed}`);
  assert.ok(cases >= 500, `expected >= 500 cases, got ${cases}`);
});

test("Wasm matches JS: v14 GHL scalar laws and the /25 coin magic", (t) => {
  let cases = 0;
  /* base select. */
  for (const [v2c, c2, want] of [
    [0, 0x10, 0xc], [0, 0x11, 0xc], [1, 0x40, 0xc], [1, 0, 0xc],
    [0, 0x12, 0x18], [2, 0x10, 0xc], [2, 0x12, 0x18], [-1, 5, 0x18],
    [0, 0x110, 0x18], [0, -0x10, 0x18],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_base(v2c | 0, c2 | 0) | 0, want,
                 `base ${v2c} ${c2}`);
    assert.equal(wasm.isaac_pm_ghl_base(v2c | 0, c2 | 0) | 0,
                 pmGhlBase(v2c, c2), `base oracle ${v2c} ${c2}`);
    cases += 2;
  }
  /* keeper family / sel / base. */
  for (const [c3, fam, sel] of [
    [0xe, 1, 6], [0x21, 1, 4], [0x10, 0, 6], [0, 0, 6], [0x2100, 0, 6],
    [-0x21, 0, 6],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_keeper_family(c3 | 0) | 0, fam,
                 `family ${c3}`);
    assert.equal(wasm.isaac_pm_ghl_keeper_sel(c3 | 0) | 0, sel,
                 `sel ${c3}`);
    assert.equal(wasm.isaac_pm_ghl_keeper_family(c3 | 0) | 0,
                 pmGhlKeeperFamily(c3), `family oracle ${c3}`);
    assert.equal(wasm.isaac_pm_ghl_keeper_sel(c3 | 0) | 0,
                 pmGhlKeeperSel(c3), `sel oracle ${c3}`);
    cases += 4;
  }
  for (const [c3, gullet, want] of [
    [0xe, 0, 6], [0x21, 0, 4], [0xe, 3, 12], [0xe, 9, 0x18],
    [0xe, 100, 0x18], [0x21, -10, -16], [0xe, 0x40000000, 6 - 0x80000000],
    /* lea wrap: 4 + 2*0x3ffffffe = 0x80000000 -> cand INT_MIN, and the
       SIGNED cmovl then prefers it over 0x18 — a huge positive gullet
       yields a NEGATIVE base. Original wrap corner, reproduced. */
    [0x21, 0x3ffffffe, -0x80000000],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_keeper_base(c3 | 0, gullet | 0) | 0,
                 asI32(want), `keeper base ${c3} ${gullet}`);
    assert.equal(wasm.isaac_pm_ghl_keeper_base(c3 | 0, gullet | 0) | 0,
                 pmGhlKeeperBase(c3, gullet),
                 `keeper base oracle ${c3} ${gullet}`);
    cases += 2;
  }
  /* keeper byte test — WIDE, unmasked drives (the uint8_t trap). */
  for (const [k, want] of [
    [0, 0], [1, 1], [0xff, 1],
    [0x100, 0, "AL == 0"], [0x1ff, 1], [0x80000000, 0], [0xffffffff, 1],
    [0xab00, 0],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_keeper_skips(k >>> 0) | 0, want,
                 `keeper_skips ${k}`);
    assert.equal(wasm.isaac_pm_ghl_keeper_skips(k >>> 0) | 0,
                 pmGhlKeeperSkips(k), `keeper_skips oracle ${k}`);
    cases += 2;
  }
  /* clamp with both wraps. */
  for (const [base, v, want] of [
    [10, 0, 10], [10, 5, 0], [10, 4, 2], [0x18, 0xc, 0],
    [10, 0x40000000, 0],            /* doubled wraps to INT_MIN */
    [10, 0x80000000 | 0, 10],       /* doubled wraps to 0 */
    [-5, 0, 0], [0, 0, 0], [0x7fffffff, -1, 0],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_clamp(base | 0, v | 0) | 0, want,
                 `clamp ${base} ${v}`);
    assert.equal(wasm.isaac_pm_ghl_clamp(base | 0, v | 0) | 0,
                 pmGhlClamp(base, v), `clamp oracle ${base} ${v}`);
    cases += 2;
  }
  /* Coin magic: exact trunc /25 with the == 0x63 bump. */
  for (const [coins, want] of [
    [0, 0], [24, 0], [25, 1], [49, 1], [50, 2], [74, 2], [75, 3],
    [98, 3], [99, 4],            /* trunc 3, bumped at exactly 0x63 */
    [100, 4], [124, 4], [-1, 0], [-24, 0], [-25, -1], [-99, -3],
    [0x7fffffff, 85899345], [-0x80000000, -85899345],
  ]) {
    assert.equal(wasm.isaac_pm_ghl_coin_bonus_q(coins | 0) | 0, want,
                 `coin q ${coins}`);
    assert.equal(wasm.isaac_pm_ghl_coin_bonus_q(coins | 0) | 0,
                 pmGhlCoinBonusQ(coins), `coin q oracle ${coins}`);
    cases += 2;
  }
  /* The bump is EXACTLY at 0x63 — 98 and 100 both give plain trunc. */
  assert.equal(wasm.isaac_pm_ghl_coin_bonus_q(98) | 0, 3);
  assert.equal(wasm.isaac_pm_ghl_coin_bonus_q(99) | 0, 4);
  assert.equal(wasm.isaac_pm_ghl_coin_bonus_q(100) | 0, 4);
  /* Whole-domain sweep against the oracle (magic vs BigInt division). */
  let seed = 0x25 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  for (let trial = 0; trial < 400; trial += 1) {
    const coins = rnd() | 0;
    const w = wasm.isaac_pm_ghl_coin_bonus_q(coins) | 0;
    assert.equal(w, pmGhlCoinBonusQ(coins), `coin sweep ${coins}`);
    /* Independent arithmetic check: plain trunc toward zero. */
    if (coins !== 0x63) {
      assert.equal(w, Math.trunc(coins / 25) | 0, `trunc check ${coins}`);
    }
    cases += 2;
  }
  cases += 3;
  t.diagnostic(`v14 GHL scalar cases: ${cases}`);
  assert.ok(cases >= 800, `expected >= 800 cases, got ${cases}`);
});

test("Wasm matches JS: v14 GHL plan decision layer", (t) => {
  const view = new DataView(wasm.memory.buffer);
  const IN = SCRATCH + 0xc8000;
  const PLAN = SCRATCH + 0xc8100;
  let cases = 0;

  const defaults = {
    game26614: 0, v2c: 0, char1: 0, char2: 0, char3: 0, char4: 0,
    keeper: 0, null78: 0, null79: 0, has26bChar1: 0, gullet7ce390: 0,
    has26bCharE: 0, has1f5: 0, coins1368: 0, v1da0: 0,
  };
  const runBoth = (over) => {
    const inp = { ...defaults, ...over };
    v14WriteGhlInputs(view, IN, inp);
    wasm.isaac_pm_ghl_plan(IN, PLAN);
    const got = v14ReadGhlPlan(view, PLAN);
    assert.deepEqual(got, v14GhlPlanFromModel(pmGhlPlan(inp)),
                     `ghl plan ${JSON.stringify(over)}`);
    cases += 1;
    return got;
  };

  /* RET A: gate closed returns 0xa0 straight — no probes at all. */
  let got = runBoth({ game26614: 2, char1: 0x10, null78: 1 });
  assert.equal(got.result, 0xa0);
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_A0);
  assert.equal(got.probe78Issued, 0, "gate-closed path probes nothing");
  /* RET B: char 0x10 with the 0x78 null effect. */
  got = runBoth({ v2c: 0, char1: 0x10, null78: 1 });
  assert.equal(got.result, 6);
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_NULL78);
  assert.equal(got.probe78Issued, 1);
  assert.equal(got.probe79Issued, 0, "0x10 never falls into the 0x79 arm");
  /* Probe miss falls through to the base machine. */
  got = runBoth({ v2c: 0, char1: 0x10, char2: 0x10, null78: 0 });
  assert.equal(got.probe78Issued, 1);
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_COMMON);
  assert.equal(got.result, 0xc, "base 0xc for char 0x10, clamp 0");
  assert.equal(got.clampApplied, 1);
  /* RET C: char 0x14 with the 0x79 null effect. */
  got = runBoth({ v2c: 0, char1: 0x14, null79: 1 });
  assert.equal(got.result, 4);
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_NULL79);
  assert.deepEqual([got.probe78Issued, got.probe79Issued], [0, 1]);
  /* WIDE probe results read as AL == 0 (the masked-differential trap:
     0x100 must behave as FALSE). */
  got = runBoth({ v2c: 0, char1: 0x10, char2: 0x10, null78: 0x100 });
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_COMMON,
               "null78 0x100 has AL == 0");
  got = runBoth({ v2c: 0, char1: 0x14, char2: 0, null79: 0x100 });
  assert.equal(got.retVa >>> 0, PM_GHL_VA_RET_COMMON,
               "null79 0x100 has AL == 0");
  /* [0x2c] == 1 takes the 0xc arm with NO null-effect probes even for
     char 0x10. */
  got = runBoth({ v2c: 1, char1: 0x10, char2: 0x12, null78: 1 });
  assert.deepEqual([got.probe78Issued, got.probe79Issued], [0, 0]);
  assert.equal(got.result, 0xc);
  /* [0x2c] == 2 joins at the char_2 select. */
  got = runBoth({ v2c: 2, char2: 0x12 });
  assert.equal(got.result, 0x18);
  /* char_2 == 1 with the 0x26b collectible: base += 0xc. */
  got = runBoth({ v2c: 2, char2: 1, has26bChar1: 1 });
  assert.equal(got.has26bChar1Issued, 1);
  assert.equal(got.result, 0x24, "0x18 + 0xc");
  got = runBoth({ v2c: 2, char2: 1, has26bChar1: 0x100 });
  assert.equal(got.result, 0x18, "wide 0x26b answer reads AL == 0");
  /* keeper skip on a NON-family char: base returned unclamped. */
  got = runBoth({ v2c: 2, char2: 0x12, keeper: 1, v1da0: 100 });
  assert.equal(got.keeperSkip, 1);
  assert.equal(got.clampApplied, 0, "keeper != 0 skips the clamp");
  assert.equal(got.result, 0x18);
  /* keeper wide values, UNMASKED across the boundary. */
  got = runBoth({ v2c: 2, char2: 0x12, keeper: 0x100, v1da0: 100 });
  assert.equal(got.keeperSkip, 0, "keeper 0x100 has AL == 0");
  assert.equal(got.result, 0, "clamp applies: 0x18 - 200 < 0");
  got = runBoth({ v2c: 2, char2: 0x12, keeper: 0x1ff, v1da0: 100 });
  assert.equal(got.keeperSkip, 1);
  got = runBoth({ v2c: 2, char2: 0x12, keeper: 0x80000000, v1da0: 100 });
  assert.equal(got.keeperSkip, 0);
  got = runBoth({ v2c: 2, char2: 0x12, keeper: 0xffffffff, v1da0: 100 });
  assert.equal(got.keeperSkip, 1);
  /* keeper family with keeper set: EVERYTHING after the byte test is
     skipped (no gullet, no 0x1f5 probe, no clamp). */
  got = runBoth({ char3: 0xe, keeper: 1, gullet7ce390: 50, has1f5: 1,
                  v1da0: 9 });
  assert.equal(got.keeperSkip, 1);
  assert.deepEqual(
    [got.gulletIssued, got.has26bCharEIssued, got.has1f5Issued], [0, 0, 0]);
  assert.equal(got.result, 0x18);
  /* keeper family, keeper == 0: reset to 0x18, min with sel+2*gullet. */
  got = runBoth({ char2: 1, has26bChar1: 1, char3: 0xe, char4: 0xe,
                  gullet7ce390: 2, has26bCharE: 1, has1f5: 0 });
  assert.equal(got.gulletIssued, 1);
  assert.equal(got.has26bCharEIssued, 1);
  assert.equal(got.has1f5Issued, 1, "0x1f5 probe is unconditional here");
  /* base: reset discards the char==1 bonus; 4+2*(0xe!=0x21)=6 + 2*2 =
     10; min(0x18,10)=10; +2 for 0x26b; clamp v1da0 0 -> 12. */
  assert.equal(got.result, 12);
  assert.equal(got.coinBonus, 0);
  /* Coin path: has1f5 with 99 coins adds 2*4. */
  got = runBoth({ char3: 0x21, char4: 0x21, gullet7ce390: 100, has1f5: 1,
                  coins1368: 99 });
  /* sel(0x21)=4, cand 204 -> min 0x18; char4 != 0xe so no +2; +8. */
  assert.equal(got.coinBonus, 8);
  assert.equal(got.result, 0x18 + 8);
  /* char READ divergence: char_3 keeper-family but char_4 != 0xe means
     the second 0x26b site is NOT issued (the PE re-reads memory). */
  got = runBoth({ char3: 0xe, char4: 0x21, gullet7ce390: 0, has26bCharE: 1 });
  assert.equal(got.has26bCharEIssued, 0,
               "char_4 read decides the second 0x26b site");
  assert.equal(got.result, 6, "sel 6 + 0 gullet, no bonus, clamp 0");
  /* setne uses the PRE-call char_3 register copy: char_3 0xe vs 0x21
     changes sel even when char_4 agrees. */
  got = runBoth({ char3: 0x21, char4: 0xe, gullet7ce390: 0,
                  has26bCharE: 1 });
  assert.equal(got.result, 4 + 2, "sel(0x21)=4 plus the char_4 0xe +2");
  cases += 40;

  /* Null in/plan pointers are no-ops (guarded like the v13 fillers). */
  wasm.isaac_pm_ghl_plan(0, PLAN);
  const zeroed = v14ReadGhlPlan(view, PLAN);
  assert.equal(zeroed.retVa, 0, "null inputs zero the plan");
  assert.equal(zeroed.result, 0);
  wasm.isaac_pm_ghl_plan(IN, 0); /* must not trap */
  cases += 2;

  t.diagnostic(`v14 GHL plan cases: ${cases}`);
  assert.ok(cases >= 40, `expected >= 40 cases, got ${cases}`);
});

test("Wasm matches JS: v14 composed full_apply + deterministic corpus", (t) => {
  const view = new DataView(wasm.memory.buffer);
  const GAME = SCRATCH + 0x80000;
  const P = SCRATCH + 0xb0000;
  const GHL_PLAN_AT = SCRATCH + 0xc8300;
  const UBH_PLAN_AT = SCRATCH + 0xc8400;
  let cases = 0;

  const setFields = (f) => {
    writeI32(view, GAME + 0x26614, f.game26614);
    writeI32(view, P + PM_GHL_OFF_STATE_2C, f.v2c);
    writeI32(view, P + PM_C0T_OFF_CHAR_13C0, f.char);
    writeI32(view, P + PM_GHL_OFF_COINS_1368, f.coins1368);
    writeI32(view, P + PM_GHL_OFF_CLAMP_1DA0, f.v1da0);
    writeI32(view, P + PM_C0T_OFF_FATAL_1340, f.v1340);
    writeI32(view, P + PM_C0T_OFF_134C, f.v134c);
    writeI32(view, P + 0x1d88, f.v1d88);
    writeU32(view, P + PM_UBH_OFF_BITS_1D8C, f.bits1d8c);
  };
  const runBoth = (f, probes) => {
    setFields(f);
    wasm.isaac_pm_ubh_full_apply(P, GAME, probes.null78 >>> 0,
                                 probes.null79 >>> 0,
                                 probes.has26bChar1 >>> 0,
                                 probes.gullet | 0,
                                 probes.has26bCharE >>> 0,
                                 probes.has1f5 >>> 0,
                                 GHL_PLAN_AT, UBH_PLAN_AT);
    const want = pmUbhFullPlan(f, probes);
    const gotGhl = v14ReadGhlPlan(view, GHL_PLAN_AT);
    const gotUbh = v14ReadUbhPlan(view, UBH_PLAN_AT);
    assert.deepEqual(gotGhl, v14GhlPlanFromModel(want.ghl),
                     `full ghl ${JSON.stringify(f)}`);
    assert.deepEqual(gotUbh, v14UbhPlanFromModel(want.ubh),
                     `full ubh ${JSON.stringify(f)}`);
    /* Memory: unchanged when closed, plan finals when open. */
    if (want.ubh.gateOpen === 0) {
      assert.equal(readI32(view, P + 0x1d88), f.v1d88, "closed: no store");
      assert.equal(readU32(view, P + PM_UBH_OFF_BITS_1D8C),
                   f.bits1d8c >>> 0, "closed: no store");
    } else {
      assert.equal(readI32(view, P + 0x1d88), want.ubh.final1d88);
      assert.equal(readU32(view, P + PM_UBH_OFF_BITS_1D8C),
                   want.ubh.final1d8c >>> 0);
    }
    cases += 4;
    return { gotGhl, gotUbh, want };
  };

  const F0 = {
    game26614: 1, v2c: 0, char: 0x15, coins1368: 0, v1da0: 0,
    v1340: 6, v134c: 2, v1d88: 4, bits1d8c: 0b111,
  };
  const P0 = { null78: 0, null79: 0, has26bChar1: 0, gullet: 0,
               has26bCharE: 0, has1f5: 0 };

  /* Composed keeper is ALWAYS 0 (push 0 at 0x007cabd7): a keeper-family
     char still runs the gullet path. */
  let r = runBoth({ ...F0, char: 0xe }, { ...P0, gullet: 5 });
  assert.equal(r.gotGhl.gulletIssued, 1, "composed keeper is 0");
  assert.equal(r.gotGhl.keeperSkip, 0);
  /* The 0xa0 arm is unreachable from THIS callsite: one game_26614
     feeds both gates, so an open UBH gate implies an open GHL gate. */
  assert.notEqual(r.gotGhl.retVa >>> 0, PM_GHL_VA_RET_A0);
  /* Gate closed: GetHealthLimit never called (plan zeroed). */
  r = runBoth({ ...F0, game26614: 2 }, P0);
  assert.equal(r.gotGhl.retVa, 0, "closed gate: GHL not called");
  assert.equal(r.gotUbh.gateOpen, 0);
  /* Char 0x10 + null78: limit 6 feeds UBH. */
  r = runBoth({ ...F0, char: 0x10 }, { ...P0, null78: 1 });
  assert.equal(r.gotGhl.result, 6);
  assert.equal(r.gotUbh.newBone,
               pmUbhNewBone(6, F0.v1340, F0.v134c, F0.v1d88));
  cases += 6;

  /* Deterministic corpus (LCG HIGH bits) over the composed edge. */
  let seed = 0x14bee5 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const CHARS = [0, 1, 4, 0xa, 0xe, 0x10, 0x11, 0x14, 0x21, 0x23, 5,
                 0x12, -1];
  const reach = {
    gateOpen: 0, gateClosed: 0, retEarly: 0, retTail: 0,
    ghlRets: new Map(), coin: 0, keeperFam: 0, slots0: 0, slotsBig: 0,
    loop1Clear: 0, loop2Set: 0,
  };
  for (let trial = 0; trial < 700; trial += 1) {
    const f = {
      game26614: pick(7) === 0 ? 2 + pick(3) : pick(2),
      v2c: [0, 0, 0, 1, 2, -1][pick(6)],
      char: CHARS[pick(CHARS.length)],
      coins1368: [0, 7, 24, 25, 49, 99, 100, -3, 1000][pick(9)],
      v1da0: [0, 0, 1, 2, 5, -1][pick(6)],
      v1340: pick(70) - 10,
      v134c: pick(70) - 10,
      v1d88: pick(50) - 10,
      bits1d8c: rnd(),
    };
    const probes = {
      null78: [0, 1, 0x100][pick(3)],
      null79: [0, 1, 0x100][pick(3)],
      has26bChar1: [0, 1][pick(2)],
      gullet: pick(12) - 2,
      has26bCharE: [0, 1, 0x200][pick(3)],
      has1f5: [0, 1][pick(2)],
    };
    const { gotGhl, gotUbh, want } = runBoth(f, probes);
    if (gotUbh.gateOpen === 0) reach.gateClosed += 1;
    else {
      reach.gateOpen += 1;
      if ((gotUbh.retVa >>> 0) === PM_UBH_VA_RET_EARLY) reach.retEarly += 1;
      else reach.retTail += 1;
      reach.ghlRets.set(gotGhl.retVa >>> 0,
                        (reach.ghlRets.get(gotGhl.retVa >>> 0) ?? 0) + 1);
      if (gotGhl.coinBonus !== 0) reach.coin += 1;
      if (gotGhl.gulletIssued !== 0) reach.keeperFam += 1;
      if (gotUbh.totalSlots > 32) reach.slotsBig += 1;
      if (gotUbh.loop1Ran === 0 && gotUbh.earlyZero === 0) reach.slots0 += 1;
      if (gotUbh.loop1Ran !== 0 &&
          gotUbh.budgetAfterLoop1 < 0) reach.loop1Clear += 1;
      if (gotUbh.loop2Entered !== 0 &&
          gotUbh.budgetAfterLoop1 > 0) reach.loop2Set += 1;
    }
  }
  assert.ok(reach.gateOpen > 0 && reach.gateClosed > 0,
            "corpus must drive the >= 2 gate both ways");
  assert.ok(reach.retEarly > 0 && reach.retTail > 0,
            "corpus must retire both UBH rets");
  assert.ok((reach.ghlRets.get(PM_GHL_VA_RET_COMMON) ?? 0) > 0,
            "corpus must reach the GHL common ret");
  assert.ok((reach.ghlRets.get(PM_GHL_VA_RET_NULL78) ?? 0) > 0,
            "corpus must reach the null-78 ret");
  assert.ok((reach.ghlRets.get(PM_GHL_VA_RET_NULL79) ?? 0) > 0,
            "corpus must reach the null-79 ret");
  assert.ok(reach.coin > 0, "corpus must take the coin-bonus path");
  assert.ok(reach.keeperFam > 0, "corpus must take the keeper family");
  assert.ok(reach.slotsBig > 0, "corpus must exceed 32 slots");
  assert.ok(reach.loop1Clear > 0, "corpus must clear bits in loop 1");
  assert.ok(reach.loop2Set > 0, "corpus must set bits in loop 2");

  /* Scalar GHL corpus drives keeper BOTH ways with wide bytes — the
     composed callsite pins keeper 0, so the scalar layer carries the
     keeper reach. */
  let keeperSkips = 0;
  let keeperRuns = 0;
  for (let trial = 0; trial < 300; trial += 1) {
    const inp = {
      game26614: pick(8) === 0 ? 2 : 1,
      v2c: [0, 1, 2][pick(3)],
      char1: CHARS[pick(CHARS.length)],
      char2: CHARS[pick(CHARS.length)],
      char3: CHARS[pick(CHARS.length)],
      char4: CHARS[pick(CHARS.length)],
      keeper: [0, 1, 0x100, 0x1ff, 0x80000000, 0xffffffff][pick(6)],
      null78: [0, 1][pick(2)],
      null79: [0, 1][pick(2)],
      has26bChar1: [0, 1][pick(2)],
      gullet7ce390: pick(20) - 4,
      has26bCharE: [0, 1][pick(2)],
      has1f5: [0, 1][pick(2)],
      coins1368: [0, 25, 99, 100][pick(4)],
      v1da0: [0, 1, 3][pick(3)],
    };
    v14WriteGhlInputs(view, SCRATCH + 0xc8000, inp);
    wasm.isaac_pm_ghl_plan(SCRATCH + 0xc8000, SCRATCH + 0xc8100);
    const got = v14ReadGhlPlan(view, SCRATCH + 0xc8100);
    assert.deepEqual(got, v14GhlPlanFromModel(pmGhlPlan(inp)),
                     `scalar ghl corpus ${trial}`);
    if (got.keeperSkip !== 0) keeperSkips += 1;
    else keeperRuns += 1;
    cases += 1;
  }
  assert.ok(keeperSkips > 0, "corpus never skipped via keeper");
  assert.ok(keeperRuns > 0, "corpus never ran with keeper false");

  t.diagnostic(
    `v14 composed cases: ${cases}; open=${reach.gateOpen} ` +
    `closed=${reach.gateClosed} early=${reach.retEarly} ` +
    `tail=${reach.retTail} ghlRets=${[...reach.ghlRets.entries()]
      .map(([k, v]) => `${k.toString(16)}:${v}`).join(",")} ` +
    `coin=${reach.coin} keeperFam=${reach.keeperFam} ` +
    `slots>32=${reach.slotsBig} loop1clear=${reach.loop1Clear} ` +
    `loop2set=${reach.loop2Set} kSkip=${keeperSkips} kRun=${keeperRuns}`);
  assert.ok(cases >= 3000, `expected >= 3000 cases, got ${cases}`);
});


/* ====================================================================== */
/* ABI v15: URH — exact Entity_Player::update_red_hearts() @ 0x007c9ea0  */
/* translated whole as a decision layer, + the 0x006dacd0 pure leaf.     */
/* ====================================================================== */

const V15_URH_CALLSITES = [
  0x005b659a, 0x00612178, 0x00758a44, 0x00758b93, 0x007604b7, 0x00761f5e,
  0x0077727a, 0x00777e3d, 0x00779277, 0x00793fd5, 0x007a17c5, 0x007a32bb,
  0x007a355a, 0x007b7670, 0x007c5f0c, 0x007ca8be, 0x007ca921, 0x007ca9c5,
  0x007cebae, 0x007cf008, 0x007cf01f, 0x007d310b, 0x007d3153, 0x007da8b2,
  0x007da930, 0x007da956,
];

const V15_LITERALS = [
  ["ISAAC_PM_URH_VA_BODY", "0x007c9ea0", PM_URH_VA_BODY, 0x007c9ea0],
  ["ISAAC_PM_URH_VA_RET", "0x007ca29a", PM_URH_VA_RET, 0x007ca29a],
  ["ISAAC_PM_URH_VA_END", "0x007ca2ce", PM_URH_VA_END, 0x007ca2ce],
  ["ISAAC_PM_URH_VA_NEXT_FUNC", "0x007ca2d0", PM_URH_VA_NEXT_FUNC,
   0x007ca2d0],
  ["ISAAC_PM_URH_BODY_BYTES", "1071", PM_URH_BODY_BYTES, 1071],
  ["ISAAC_PM_URH_CALLSITE_COUNT", "26", PM_URH_CALLSITES.length, 26],
  ["ISAAC_PM_URH_OFF_1DA4", "0x1da4", PM_URH_OFF_1DA4, 0x1da4],
  ["ISAAC_PM_URH_OFF_ETERNAL_1348", "0x1348", PM_URH_OFF_ETERNAL_1348,
   0x1348],
  ["ISAAC_PM_URH_OFF_BYTE_1824", "0x1824", PM_URH_OFF_BYTE_1824, 0x1824],
  ["ISAAC_PM_URH_OFF_BYTE_13B5", "0x13b5", PM_URH_OFF_BYTE_13B5, 0x13b5],
  ["ISAAC_PM_URH_OFF_FLAG_1574", "0x1574", PM_URH_OFF_FLAG_1574, 0x1574],
  ["ISAAC_PM_URH_OR_1574_BIT", "1", PM_URH_OR_1574_BIT, 1],
  ["ISAAC_PM_URH_SPRITE_530_OFF", "0x530", PM_URH_SPRITE_530_OFF, 0x530],
  ["ISAAC_PM_URH_SPRITE_644_OFF", "0x644", PM_URH_SPRITE_644_OFF, 0x644],
  ["ISAAC_PM_URH_OFF_ROOM_18300", "0x18300", PM_URH_OFF_ROOM_18300,
   0x18300],
  ["ISAAC_PM_URH_OFF_FRAME_264F8", "0x264f8", PM_URH_OFF_FRAME_264F8,
   0x264f8],
  ["ISAAC_PM_URH_OFF_ROOM_11F0", "0x11f0", PM_URH_OFF_ROOM_11F0, 0x11f0],
  ["ISAAC_PM_URH_OFF_ROOM_COUNT_1254", "0x1254",
   PM_URH_OFF_ROOM_COUNT_1254, 0x1254],
  ["ISAAC_PM_URH_OFF_ROOM_LIST_124C", "0x124c", PM_URH_OFF_ROOM_LIST_124C,
   0x124c],
  ["ISAAC_PM_URH_ROOM_RECENT_MIN", "1", PM_URH_ROOM_RECENT_MIN, 1],
  ["ISAAC_PM_URH_ENT_OFF_TYPE_28", "0x28", PM_URH_ENT_OFF_TYPE_28, 0x28],
  ["ISAAC_PM_URH_ENT_OFF_VARIANT_2C", "0x2c", PM_URH_ENT_OFF_VARIANT_2C,
   0x2c],
  ["ISAAC_PM_URH_ENT_OFF_SUBTYPE_30", "0x30", PM_URH_ENT_OFF_SUBTYPE_30,
   0x30],
  ["ISAAC_PM_URH_ENT_OFF_PARENT_410", "0x410", PM_URH_ENT_OFF_PARENT_410,
   0x410],
  ["ISAAC_PM_URH_ENT_OFF_DEAD_173", "0x173", PM_URH_ENT_OFF_DEAD_173,
   0x173],
  ["ISAAC_PM_URH_ENT_TYPE_3", "3", PM_URH_ENT_TYPE_3, 3],
  ["ISAAC_PM_URH_ENT_VARIANT_EE", "0xee", PM_URH_ENT_VARIANT_EE, 0xee],
  ["ISAAC_PM_URH_ENT_SUBTYPE_SKIP_7", "7", PM_URH_ENT_SUBTYPE_SKIP_7, 7],
  ["ISAAC_PM_URH_OFF_OVERLAY_1C034", "0x1c034", PM_URH_OFF_OVERLAY_1C034,
   0x1c034],
  ["ISAAC_PM_URH_SHOW_OVERLAY_ID", "3", PM_URH_SHOW_OVERLAY_ID, 3],
  ["ISAAC_PM_URH_SHOW_DELAY", "3", PM_URH_SHOW_DELAY, 3],
  ["ISAAC_PM_URH_SHOW_PLAYER_NULL", "0", PM_URH_SHOW_PLAYER_NULL, 0],
  ["ISAAC_PM_URH_ITEMVEC_BEGIN_OFF", "0x2a41c", PM_URH_ITEMVEC_BEGIN_OFF,
   0x2a41c],
  ["ISAAC_PM_URH_ITEMVEC_END_OFF", "0x2a420", PM_URH_ITEMVEC_END_OFF,
   0x2a420],
  ["ISAAC_PM_URH_ITEMVEC_SPAN_MIN", "0x1b8", PM_URH_ITEMVEC_SPAN_MIN,
   0x1b8],
  ["ISAAC_PM_URH_ITEMVEC_ELEM_OFF", "0x1b8", PM_URH_ITEMVEC_ELEM_OFF,
   0x1b8],
  ["ISAAC_PM_URH_ELEM_FIELD_78", "0x78", PM_URH_ELEM_FIELD_78, 0x78],
  ["ISAAC_PM_URH_ID_NULL_6E", "0x6e", PM_URH_ID_NULL_6E, 0x6e],
  ["ISAAC_PM_URH_ID_26B", "0x26b", PM_URH_ID_26B, 0x26b],
  ["ISAAC_PM_URH_ID_7A", "0x7a", PM_URH_ID_7A, 0x7a],
  ["ISAAC_PM_URH_ID_19F", "0x19f", PM_URH_ID_19F, 0x19f],
  ["ISAAC_PM_URH_ID_1BA", "0x1ba", PM_URH_ID_1BA, 0x1ba],
  ["ISAAC_PM_URH_ID_1ED", "0x1ed", PM_URH_ID_1ED, 0x1ed],
  ["ISAAC_PM_URH_CHAR_1A", "0x1a", PM_URH_CHAR_1A, 0x1a],
  ["ISAAC_PM_URH_CHAR_5", "5", PM_URH_CHAR_5, 5],
  ["ISAAC_PM_URH_THR_LOW", "1", PM_URH_THR_LOW, 1],
  ["ISAAC_PM_URH_THR_HIGH", "0x10", PM_URH_THR_HIGH, 0x10],
  ["ISAAC_PM_URH_THR2_LOW", "2", PM_URH_THR2_LOW, 2],
  ["ISAAC_PM_URH_F32_08_BITS", "0x3f4ccccd", PM_URH_F32_08_BITS,
   0x3f4ccccd],
  ["ISAAC_PM_URH_F32_01_BITS", "0x3dcccccd", PM_URH_F32_01_BITS,
   0x3dcccccd],
  ["ISAAC_PM_URH_F32_03_BITS", "0x3e99999a", PM_URH_F32_03_BITS,
   0x3e99999a],
  ["ISAAC_PM_URH_VA_GULLET_7CE420", "0x007ce420u", PM_URH_VA_GULLET_7CE420,
   0x007ce420],
  ["ISAAC_PM_URH_VA_OVERLAY_SHOW", "0x009ad210u", PM_URH_VA_OVERLAY_SHOW,
   0x009ad210],
  ["ISAAC_PM_URH_VA_HAS_NULL_EFFECT", "0x00930680u",
   PM_URH_VA_HAS_NULL_EFFECT, 0x00930680],
  ["ISAAC_PM_URH_VA_HAS_EFFECT", "0x009305f0u", PM_URH_VA_HAS_EFFECT,
   0x009305f0],
  ["ISAAC_PM_URH_VA_REMOVE_EFFECT", "0x009304a0u", PM_URH_VA_REMOVE_EFFECT,
   0x009304a0],
  ["ISAAC_PM_URH_VA_ANM2_PLAY", "0x0040a380u", PM_URH_VA_ANM2_PLAY,
   0x0040a380],
  ["ISAAC_PM_URH_VA_EFFECT_ADD_930220", "0x00930220u",
   PM_URH_VA_EFFECT_ADD_930220, 0x00930220],
  ["ISAAC_PM_URH_VA_EFFECT_ADD_9302E0", "0x009302e0u",
   PM_URH_VA_EFFECT_ADD_9302E0, 0x009302e0],
  ["ISAAC_PM_URH_VA_HAS_COLLECTIBLE", "0x007706e0u",
   PM_URH_VA_HAS_COLLECTIBLE, 0x007706e0],
  ["ISAAC_PM_URH_VA_PROBE_6DACD0", "0x006dacd0u", PM_URH_VA_PROBE_6DACD0,
   0x006dacd0],
  ["ISAAC_PM_URH_VA_HOST_763570", "0x00763570u", PM_URH_VA_HOST_763570,
   0x00763570],
  ["ISAAC_PM_URH_STR_FLOATGLOW_VA", "0x00b6ae50u", PM_URH_STR_FLOATGLOW_VA,
   0x00b6ae50],
  ["ISAAC_PM_URH_STR_FLOATNOGLOW_VA", "0x00b6ae44u",
   PM_URH_STR_FLOATNOGLOW_VA, 0x00b6ae44],
  ["ISAAC_PM_URH_F32_08_VA", "0x00baa3a4u", PM_URH_F32_08_VA, 0x00baa3a4],
  ["ISAAC_PM_URH_F32_01_VA", "0x00baa120u", PM_URH_F32_01_VA, 0x00baa120],
  ["ISAAC_PM_URH_F32_03_VA", "0x00baa1f8u", PM_URH_F32_03_VA, 0x00baa1f8],
];

/* IsaacPmUrhInputs writer — 50 fields, natural i32/u32 layout. */
function v15WriteUrhInputs(view, at, inp) {
  const order = [
    "game266141", "redA", "v1da4", "dead1", "char1",
    "bone1d88", "red194c", "soul134c", "eternal1348", "redB",
    "roomByte1", "frame1", "room11f01", "null6e", "entCount",
    "scanMatches", "ivecBegin", "ivecEnd", "elem1b8", "elem78",
    "game266142", "dead2", "redC", "char2", "has26b",
    "roomByte2", "frame2", "room11f02", "has7a", "eff7a",
    "byte1824", "has19f", "game266143", "redD", "maxD",
    "byte13b5", "char3", "p1340", "p1d88", "p1344",
    "eff19fHigh", "eff19fLow", "has1ba", "redE", "game266144",
    "maxE", "eff1baRm", "eff1baAdd", "has1ed", "eff1ed",
  ];
  for (let i = 0; i < order.length; i += 1) {
    view.setUint32(at + 4 * i, (inp[order[i]] ?? 0) >>> 0, true);
  }
  return order.length * 4;
}

/* IsaacPmUrhProbes writer — 12 u32 fields. */
function v15WriteUrhProbes(view, at, p) {
  const order = ["null6e", "has26b", "has7a", "eff7a", "has19f",
                 "eff19fHigh", "eff19fLow", "has1ba", "eff1baRm",
                 "eff1baAdd", "has1ed", "eff1ed"];
  for (let i = 0; i < order.length; i += 1) {
    view.setUint32(at + 4 * i, (p[order[i]] ?? 0) >>> 0, true);
  }
}

/* IsaacPmUrhPlan reader — 56 fields in struct order. */
const V15_PLAN_FIELDS = [
  ["foldRan", "i"], ["store1da4", "i"], ["store1344", "i"],
  ["hostGullet", "i"], ["fgGate", "i"], ["fgSum", "i"],
  ["fgSumIsOne", "i"], ["fgRoomGate", "i"], ["probeNull6eIssued", "i"],
  ["scanRan", "i"], ["scanMatches", "i"], ["spawnReached", "i"],
  ["hostShow1", "i"], ["itemvecGate", "i"], ["hostEffect930220", "i"],
  ["pairElem", "u"], ["pairElem78", "u"], ["gRereadJ1", "i"],
  ["wThr0", "i"], ["wLow", "i"], ["wChar5", "i"], ["wThr2", "i"],
  ["probeHas26bIssued", "i"], ["wGReload", "i"], ["wRoomGate", "i"],
  ["probeHas7aIssued", "i"], ["probeEff7aIssued", "i"], ["hostShow2", "i"],
  ["hostAdd7a", "i"], ["probeHas19fIssued", "i"], ["cRan", "i"],
  ["cAlt", "i"], ["probe6dacd0Issued", "i"], ["probe6dacd0Result", "i"],
  ["cHigh", "i"], ["probeEff19fHighIssued", "i"],
  ["probeEff19fLowIssued", "i"], ["hostAdd19f", "i"],
  ["hostRemove19f", "i"], ["play530StrVa", "u"], ["hostPlay530", "i"],
  ["probeHas1baIssued", "i"], ["dRan", "i"], ["dAlt", "i"],
  ["dAddSide", "i"], ["probeEff1baRmIssued", "i"],
  ["probeEff1baAddIssued", "i"], ["hostAdd1ba", "i"],
  ["hostRemove1ba", "i"], ["play644StrVa", "u"], ["hostPlay644", "i"],
  ["probeHas1edIssued", "i"], ["probeEff1edIssued", "i"],
  ["store1574Or1", "i"], ["host763570", "i"], ["retVa", "u"],
];

function v15ReadUrhPlan(view, at) {
  const out = {};
  for (let i = 0; i < V15_PLAN_FIELDS.length; i += 1) {
    const [name, kind] = V15_PLAN_FIELDS[i];
    out[name] = kind === "u" ? view.getUint32(at + 4 * i, true)
                             : view.getInt32(at + 4 * i, true);
  }
  return out;
}

function v15UrhPlanFromModel(m) {
  const out = {};
  for (const [name, kind] of V15_PLAN_FIELDS) {
    out[name] = kind === "u" ? (m[name] >>> 0) : (m[name] | 0);
  }
  return out;
}

/* Scalar plan runner: writes inputs + plan scratch, runs both sides. */
function v15RunPlanBoth(inp, label) {
  const view = new DataView(wasm.memory.buffer);
  const IN_AT = SCRATCH + 0xd300;
  const PLAN_AT = SCRATCH + 0xd100;
  v15WriteUrhInputs(view, IN_AT, inp);
  wasm.isaac_pm_urh_plan(IN_AT, PLAN_AT);
  const got = v15ReadUrhPlan(view, PLAN_AT);
  const want = v15UrhPlanFromModel(pmUrhPlan(inp));
  assert.deepEqual(got, want, `urh plan ${label}`);
  return got;
}

test("v15 URH: every new literal pinned in the header AND the model", () => {
  const h = readFileSync(header, "utf8");
  for (const [name, literal, modelValue, expected] of V15_LITERALS) {
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${literal.replace("-", "\\-")}\\b`),
      `header literal ${name} = ${literal}`,
    );
    assert.equal(modelValue, expected, `model constant ${name}`);
  }
  assert.equal(V15_LITERALS.length, 67);
  /* The censused caller list, byte for byte, and each VA in the header. */
  assert.deepEqual(PM_URH_CALLSITES, V15_URH_CALLSITES);
  for (const va of V15_URH_CALLSITES) {
    const hex = `0x${va.toString(16).padStart(8, "0")}`;
    assert.match(h, new RegExp(hex), `census VA ${hex} in header`);
  }
  /* ABI moved to 15 in the header enum. */
  assert.match(h, /ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 45/);
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
});

test("v15 URH: header transcribes the body, censuses and verdicts", () => {
  const h = readFileSync(header, "utf8");
  /* Bounds, single ret, anchors. */
  assert.match(h, /URH body 0x007c9ea0\.\.0x007ca2ce inclusive \(1071 bytes\), ONE plain ret/);
  assert.match(h, /int3 at 0x007c9e9f anchors\s+the start and int3 at 0x007ca2cf anchors/);
  assert.match(h, /2,094,788 \.text positions finds no external\s+call or jump/);
  /* Census + the raw-E8 second anchor (rule 10). */
  assert.match(h, /exactly 26 rel32\s+CALL sites, ZERO tail jmps, ZERO raw LE-dword file escapes/);
  assert.match(h, /raw-E8 second-anchor/);
  assert.match(h, /reproduces the SAME 26/);
  /* ZHL verdicts. */
  assert.match(h, /__thiscall void Entity_Player::update_red_hearts\(\)` SURVIVES\s+callsite verification/);
  assert.match(h, /exact ZHL Entity_Player::update_greeds_gullet\(\)/);
  assert.match(h, /exact ZHL ItemOverlay::Show\(int, int, Entity_Player\*\)/);
  assert.match(h, /the 13-byte pattern is weak alone/);
  assert.match(h, /"AddBoss\(int\)" 12-byte exact\s+match is DISPROVEN AGAIN/);
  assert.match(h, /RemoveCollectibleEffect\(\s*int, int\) — ret 8 \(two args\)/);
  assert.match(h, /exact ZHL ANM2::Play\(const char\*, bool\)/);
  assert.match(h, /"FloatGlow" 0x00b6ae50 and\s+"FloatNoGlow" 0x00b6ae44/);
  assert.match(h, /address-stable PURE LEAF \(6\s+censused callsites\), translated whole/);
  /* Post-call discipline — the split-input map. */
  assert.match(h, /g_Game is loaded SEVEN times/);
  assert.match(h, /\[g\+0x26614\] is read FOUR times/);
  assert.match(h, /\[0x1344\] FIVE times/);
  assert.match(h, /g_reread_j1,\s+w_g_reload\), never folded/);
  assert.match(h, /LOAD-2[\s;]+SNAPSHOT on the four J2 jumps/);
  assert.match(h, /recapture on one[\s;]+path/);
  /* Instruction-level quirks. */
  assert.match(h, /al == 0 HERE/);
  assert.match(h, /FULL 32-bit count/);
  assert.match(h, /reproduced verbatim, no cap/);
  assert.match(h, /counts ALL matches, no early exit/);
  assert.match(h, /subtype 7 SKIPS/);
  assert.match(h, /\+1 wraps at 32 bits/);
  assert.match(h, /ratio < 0\.8 OR UNORDERED -> LOW/);
  assert.match(h, /ordered 0\.1 <= r <= 0\.3 -> ADD/);
  assert.match(h, /0\/0\s+NaN ratio takes LOW/);
  assert.match(h, /cvtdq2ps\(1\)\/cvtdq2ps\(10\)\s+rounds to EXACTLY the 0x3dcccccd bit pattern/);
  /* Float constants through the section table. */
  assert.match(h, /read through the SECTION TABLE from file-backed\s+\.rdata/);
  /* Store set + boundary ordering. */
  assert.match(h, /STORE 2 — retires BEFORE the[\s;]+gullet host boundary/);
  assert.match(h, /or dword \[edi\+0x1574\],1/);
  /* The tail-status claim of this unit. */
  assert.match(h, /After v15 the only stateful host left on the whole\s+0x007791f0 CASE0 tail is the SEH-framed address-stable 0x007ca2d0/);
  /* v9 rule statement. */
  assert.match(h, /widened uint32_t with an\s+explicit in-body low-byte mask \(v9 rule\)\. Nothing in v15 is\s+Update-wired/);
  /* Source-side instruction comments. */
  const s = readFileSync(source, "utf8");
  assert.match(s, /Both stores retire BEFORE the gullet\s+\*?\s*boundary|Both stores retire BEFORE the gullet/);
  assert.match(s, /jb 1: NaN lands here, exactly like the PE/);
  assert.match(s, /Only AL is consumed at the 0x007ca15a callsite/);
  assert.match(s, /loads stay as lazy as the PE/);
});

test("Wasm matches JS: v15 fold laws + the lt2 gate family cross-pin", (t) => {
  let cases = 0;
  /* The FOURTH instruction site of the same [0x26614] < 2 signed gate:
     URH 0x007c9eba jge, UBH 0x007cabd1 jge, GHL 0x007cae78 jl, v13
     heal 0x00779288 jge — all four must agree everywhere. */
  const gateVals = [-0x80000000, -3, -1, 0, 1, 2, 3, 0x7fffffff,
                    0x100, -0x100];
  for (const g of gateVals) {
    const w = wasm.isaac_pm_urh_fold_gate(g | 0) | 0;
    assert.equal(w, pmUrhFoldGate(g), `fold gate ${g}`);
    assert.equal(w, wasm.isaac_pm_ubh_gate(g | 0) | 0,
                 `fold gate agrees with UBH at ${g}`);
    assert.equal(w, wasm.isaac_pm_ghl_gate_lt2(g | 0) | 0,
                 `fold gate agrees with GHL at ${g}`);
    assert.equal(w, wasm.isaac_pm_c0t_heal_gate(g | 0, 0, 1) | 0,
                 `fold gate agrees with v13 heal gate at ${g}`);
    cases += 4;
  }
  assert.equal(wasm.isaac_pm_urh_fold_gate(1) | 0, 1, "gate(1) folds");
  assert.equal(wasm.isaac_pm_urh_fold_gate(2) | 0, 0,
               "gate(2) SKIPS — jge is >=");
  cases += 2;

  /* fold_half: trunc((red+1)/2) with the +1 wrap FIRST. Cross-pin:
     ubh_total_slots(x, 0) is the same (x+1 wrapped, trunc half) idiom
     transcribed at v14 from its own range. */
  const pool = [0, 1, 2, 3, -1, -2, -3, -4, -5, 7, -7, 100, -100,
                0x7fffffff, -0x80000000, 0x7ffffffe, -0x7fffffff];
  for (const x of pool) {
    const w = wasm.isaac_pm_urh_fold_half(x | 0) | 0;
    assert.equal(w, pmUrhFoldHalf(x), `fold_half ${x}`);
    assert.equal(w, wasm.isaac_pm_ubh_total_slots(x | 0, 0) | 0,
                 `fold_half cross-pin v14 idiom ${x}`);
    cases += 2;
  }
  /* Exact corners: trunc vs floor witnesses. */
  assert.equal(wasm.isaac_pm_urh_fold_half(-4) | 0, -1,
               "trunc((-4+1)/2) = -1 (a floor mutant gives -2)");
  assert.equal(wasm.isaac_pm_urh_fold_half(-6) | 0, -2,
               "trunc(-5/2) = -2 (floor gives -3)");
  assert.equal(wasm.isaac_pm_urh_fold_half(5) | 0, 3);
  /* +1 wrap: INT_MAX + 1 = INT_MIN; trunc(INT_MIN/2) = -0x40000000. */
  assert.equal(wasm.isaac_pm_urh_fold_half(0x7fffffff) | 0, -0x40000000,
               "the +1 wraps BEFORE the halve");
  cases += 4;

  /* fold_1da4 min direction + fold_red max direction + doubling wrap. */
  assert.equal(wasm.isaac_pm_urh_fold_1da4(5, 9) | 0, 3, "min picks half");
  assert.equal(wasm.isaac_pm_urh_fold_1da4(9, 2) | 0, 2, "min picks v1da4");
  assert.equal(wasm.isaac_pm_urh_fold_1da4(9, 5) | 0, 5,
               "half == v1da4 keeps v1da4 (cmovl is STRICT)");
  assert.equal(wasm.isaac_pm_urh_fold_red(5, 9) | 0, 6,
               "red 5 raised to 2*min(9,3) = 6");
  assert.equal(wasm.isaac_pm_urh_fold_red(9, 2) | 0, 9,
               "red 9 kept over 2*2 = 4");
  assert.equal(wasm.isaac_pm_urh_fold_red(4, 2) | 0, 4,
               "red == doubled keeps red (cmovl is STRICT)");
  /* Doubling wrap: min = 0x40000000 doubles to INT_MIN (negative), so
     max_signed keeps red. */
  assert.equal(wasm.isaac_pm_urh_fold_red(0x7fffffff, 0x7fffffff) | 0,
               pmUrhFoldRed(0x7fffffff, 0x7fffffff),
               "doubling wrap witness");
  cases += 7;
  for (const red of pool) {
    for (const v of [0, 1, 3, -1, 0x40000000, -0x80000000]) {
      assert.equal(wasm.isaac_pm_urh_fold_1da4(red | 0, v | 0) | 0,
                   pmUrhFold1da4(red, v), `fold_1da4 ${red} ${v}`);
      assert.equal(wasm.isaac_pm_urh_fold_red(red | 0, v | 0) | 0,
                   pmUrhFoldRed(red, v), `fold_red ${red} ${v}`);
      cases += 2;
    }
  }
  t.diagnostic(`v15 fold cases: ${cases}`);
  assert.ok(cases >= 150, `expected >= 150 cases, got ${cases}`);
});

test("Wasm matches JS: v15 FG gate, sum, room gates + agreement", (t) => {
  let cases = 0;
  /* fg_gate: LOW-BYTE dead + FULL-DWORD char, driven WIDE. */
  for (const [dead, ch, want] of [
    [0, 0x1a, 1], [1, 0x1a, 0], [0xff, 0x1a, 0],
    [0x100, 0x1a, 1],       /* AL of 0x100 is 0 — mask-drop mutant dies */
    [0x1ff, 0x1a, 0], [0xffffffff, 0x1a, 0], [0x80000000, 0x1a, 1],
    [0, 0x1b, 0], [0, 0x11a, 0], [0, -0x1a, 0], [0, 0x19, 0],
  ]) {
    assert.equal(wasm.isaac_pm_urh_fg_gate(dead >>> 0, ch | 0) | 0, want,
                 `fg_gate ${dead} ${ch}`);
    assert.equal(wasm.isaac_pm_urh_fg_gate(dead >>> 0, ch | 0) | 0,
                 pmUrhFgGate(dead, ch), `fg_gate oracle ${dead} ${ch}`);
    cases += 2;
  }
  /* sum: all five terms live, 32-bit wrap; == 1 EXACT. */
  assert.equal(wasm.isaac_pm_urh_fg_sum(1, 0, 0, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_urh_fg_sum(0, 0, 0, 1, 0) | 0, 1,
               "eternal_1348 participates (drop-a-term mutant dies)");
  assert.equal(wasm.isaac_pm_urh_fg_sum(1, 1, 1, 1, 1) | 0, 5);
  assert.equal(wasm.isaac_pm_urh_fg_sum(0x7fffffff, 1, 0, 0, 1) | 0,
               pmUrhFgSum(0x7fffffff, 1, 0, 0, 1), "sum wraps");
  assert.equal(wasm.isaac_pm_urh_fg_sum(0x7fffffff, 2, 0, 0, 0) | 0,
               -0x7fffffff);
  assert.equal(wasm.isaac_pm_urh_fg_sum_is_one(1) | 0, 1);
  assert.equal(wasm.isaac_pm_urh_fg_sum_is_one(2) | 0, 0);
  assert.equal(wasm.isaac_pm_urh_fg_sum_is_one(0) | 0, 0);
  assert.equal(wasm.isaac_pm_urh_fg_sum_is_one(-1) | 0, 0);
  cases += 9;
  /* Room gates: LOW-BYTE room byte, SIGNED wrapped diff > 1; the FG
     and char-5 instances are two transcriptions of one law — pin
     agreement over a sweep including wrap diffs. */
  const rows = [
    [1, 10, 5, 1], [1, 7, 5, 1], [1, 6, 5, 0] /* diff 1 -> jle */,
    [1, 5, 5, 0], [1, 4, 5, 0],
    [0, 10, 5, 0], [0x100, 10, 5, 0] /* AL 0 */, [0x101, 10, 5, 1],
    [1, -0x80000000, 0x7fffffff, 0]  /* wrapped diff 1 -> skip */,
    [1, 0x7fffffff, -0x80000000, 0] /* wrapped diff -1 */,
    [1, 1, -1, 1] /* diff 2 */,
  ];
  for (const [b, f, r, want] of rows) {
    const fg = wasm.isaac_pm_urh_room_gate_fg(b >>> 0, f | 0, r | 0) | 0;
    const c5 = wasm.isaac_pm_urh_room_gate_c5(b >>> 0, f | 0, r | 0) | 0;
    assert.equal(fg, want, `room_gate_fg ${b} ${f} ${r}`);
    assert.equal(fg, c5, `room gate instances agree ${b} ${f} ${r}`);
    assert.equal(fg, pmUrhRoomGate(b, f, r), `room gate oracle ${b} ${f} ${r}`);
    cases += 3;
  }
  let seed = 0x7c9ea0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  for (let i = 0; i < 200; i += 1) {
    const b = rnd() >>> 24;          /* HIGH bits */
    const f = rnd() | 0;
    const r = rnd() | 0;
    const fg = wasm.isaac_pm_urh_room_gate_fg(b >>> 0, f | 0, r | 0) | 0;
    assert.equal(fg, wasm.isaac_pm_urh_room_gate_c5(b >>> 0, f | 0, r | 0) | 0,
                 `room agreement corpus ${i}`);
    assert.equal(fg, pmUrhRoomGate(b, f, r), `room oracle corpus ${i}`);
    cases += 2;
  }
  t.diagnostic(`v15 FG cases: ${cases}`);
  assert.ok(cases >= 200, `expected >= 200 cases, got ${cases}`);
});

test("Wasm matches JS: v15 scan entity law + guest-memory scan", (t) => {
  let cases = 0;
  const P_ADDR = (SCRATCH + 0x2000) >>> 0;
  /* Scalar law, PE compare order, byte-tested dead driven WIDE. */
  const M = (e, ty, pa, va, st, dd) =>
      wasm.isaac_pm_urh_scan_entity_match(
          e >>> 0, ty | 0, pa >>> 0, P_ADDR, va | 0, st | 0, dd >>> 0) | 0;
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 0, 0), 1, "full match");
  assert.equal(M(0, 3, P_ADDR, 0xee, 0, 0), 0, "null slot");
  assert.equal(M(0x1000, 2, P_ADDR, 0xee, 0, 0), 0, "type");
  assert.equal(M(0x1000, 3, P_ADDR + 4, 0xee, 0, 0), 0, "parent");
  assert.equal(M(0x1000, 3, P_ADDR, 0xed, 0, 0), 0, "variant");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 7, 0), 0, "subtype 7 SKIPS");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 6, 0), 1, "subtype 6 counts");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 8, 0), 1, "subtype 8 counts");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 0, 1), 0, "dead skips");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 0, 0x100), 1,
               "dead 0x100 has AL 0 — mask-drop mutant dies");
  assert.equal(M(0x1000, 3, P_ADDR, 0xee, 0, 0x1ff), 0);
  cases += 11;
  for (const [ty, va, st, dd] of
       [[3, 0xee, 0, 0], [3, 0xee, 7, 0], [-3, 0xee, 0, 0]]) {
    assert.equal(M(0x1000, ty, P_ADDR, va, st, dd),
                 pmUrhScanEntityMatch(0x1000, ty, P_ADDR, P_ADDR, va, st, dd),
                 `entity oracle ${ty} ${va} ${st} ${dd}`);
    cases += 1;
  }

  /* Memory scan over real scratch: 5 slots — a match, a null, a
     subtype-7 skip, a dead skip and a second match; verbatim count. */
  const view = new DataView(wasm.memory.buffer);
  const LIST = SCRATCH + 0xa000;
  const ENT = SCRATCH + 0xb000;
  const mkEnt = (k, ty, pa, va, st, dd) => {
    const at = ENT + k * 0x800;
    writeI32(view, at + PM_URH_ENT_OFF_TYPE_28, ty);
    writeU32(view, at + PM_URH_ENT_OFF_PARENT_410, pa);
    writeI32(view, at + PM_URH_ENT_OFF_VARIANT_2C, va);
    writeI32(view, at + PM_URH_ENT_OFF_SUBTYPE_30, st);
    writeU8(view, at + PM_URH_ENT_OFF_DEAD_173, dd);
    return at;
  };
  const e0 = mkEnt(0, 3, P_ADDR, 0xee, 0, 0);      /* match */
  const e2 = mkEnt(2, 3, P_ADDR, 0xee, 7, 0);      /* subtype-7 skip */
  const e3 = mkEnt(3, 3, P_ADDR, 0xee, 3, 1);      /* dead skip */
  const e4 = mkEnt(4, 3, P_ADDR, 0xee, 9, 0);      /* match */
  writeU32(view, LIST + 0, e0);
  writeU32(view, LIST + 4, 0);                     /* null slot */
  writeU32(view, LIST + 8, e2);
  writeU32(view, LIST + 12, e3);
  writeU32(view, LIST + 16, e4);
  assert.equal(wasm.isaac_pm_urh_scan_count(LIST, 5, P_ADDR) | 0, 2,
               "counts ALL matches (a first-match-break mutant gives 1)");
  assert.equal(wasm.isaac_pm_urh_scan_count(LIST, 1, P_ADDR) | 0, 1,
               "count bound respected");
  assert.equal(wasm.isaac_pm_urh_scan_count(LIST, 0, P_ADDR) | 0, 0,
               "zero count never enters");
  assert.equal(wasm.isaac_pm_urh_scan_count(LIST, 3, P_ADDR) | 0, 1);
  /* JS abstract-list oracle agreement. */
  const slots = [
    { addr: e0, type: 3, parent: P_ADDR, variant: 0xee, subtype: 0, dead: 0 },
    null,
    { addr: e2, type: 3, parent: P_ADDR, variant: 0xee, subtype: 7, dead: 0 },
    { addr: e3, type: 3, parent: P_ADDR, variant: 0xee, subtype: 3, dead: 1 },
    { addr: e4, type: 3, parent: P_ADDR, variant: 0xee, subtype: 9, dead: 0 },
  ];
  assert.equal(pmUrhScanCount(slots, 5, P_ADDR), 2, "JS scan oracle");
  assert.equal(pmUrhScanCount(slots, 3, P_ADDR), 1);
  cases += 6;
  t.diagnostic(`v15 scan cases: ${cases}`);
  assert.ok(cases >= 18, `expected >= 18 cases, got ${cases}`);
});

test("Wasm matches JS: v15 itemvec + thresholds + sign pins", (t) => {
  let cases = 0;
  /* Masked span, SIGNED compare. Boundary: 0x1b8 fails, 0x1bc passes. */
  assert.equal(wasm.isaac_pm_urh_itemvec_gate(0x1000, 0x1000 + 0x1b8, 5) | 0,
               0, "span == 0x1b8 -> jle skips");
  assert.equal(wasm.isaac_pm_urh_itemvec_gate(0x1000, 0x1000 + 0x1bc, 5) | 0,
               1, "span 0x1bc passes");
  assert.equal(wasm.isaac_pm_urh_itemvec_gate(0x1000, 0x1000 + 0x1bb, 5) | 0,
               0, "0x1bb masks down to 0x1b8");
  assert.equal(wasm.isaac_pm_urh_itemvec_gate(0x1000, 0x1000 + 0x1bc, 0) | 0,
               0, "NULL elem fails");
  /* SIGNED span semantics — pinned against the v11 HIGH0 gate, the
     same idiom at another range: both must refuse a negative span and
     accept a huge positive one. */
  assert.equal(wasm.isaac_pm_urh_itemvec_gate(0x1000, 0x800, 5) | 0, 0,
               "negative span refused (unsigned mutant dies)");
  assert.equal(wasm.isaac_pm_td_rvb_high0_item_gate(0x1000, 0x800, 5) | 0, 0,
               "v11 idiom agrees: negative span refused");
  assert.equal(
      wasm.isaac_pm_urh_itemvec_gate(0, 0x7ffffffc, 5) | 0, 1,
      "huge positive span accepted");
  assert.equal(
      wasm.isaac_pm_td_rvb_high0_item_gate(0, 0x7ffffffc, 5) | 0, 1,
      "v11 idiom agrees: huge positive span accepted");
  assert.equal(wasm.isaac_pm_urh_itemvec_span(0, 0x80000001) | 0,
               -0x80000000, "span masks then stays negative");
  cases += 9;
  for (const [b, e] of [[0, 0], [0x100, 0x400], [0xffffffff, 3],
                        [0x80000000, 0x80000000 + 0x1c0]]) {
    assert.equal(wasm.isaac_pm_urh_itemvec_span(b >>> 0, e >>> 0) | 0,
                 pmUrhItemvecSpan(b, e), `span oracle ${b} ${e}`);
    assert.equal(wasm.isaac_pm_urh_itemvec_gate(b >>> 0, e >>> 0, 7) | 0,
                 pmUrhItemvecGate(b, e, 7), `gate oracle ${b} ${e}`);
    cases += 2;
  }
  /* thr0: the faithful setge/inc/shl — 1 or 0x10, NEVER 2. */
  for (const [g, want] of [[1, 1], [0, 1], [-5, 1], [-0x80000000, 1],
                           [2, 0x10], [3, 0x10], [0x7fffffff, 0x10]]) {
    assert.equal(wasm.isaac_pm_urh_w_thr0(g | 0) | 0, want, `thr0 ${g}`);
    assert.equal(wasm.isaac_pm_urh_w_thr0(g | 0) | 0, pmUrhWThr0(g),
                 `thr0 oracle ${g}`);
    cases += 2;
  }
  /* thr2: cmovl — 2 or 0x10. */
  for (const [g, want] of [[1, 2], [-1, 2], [-0x80000000, 2],
                           [2, 0x10], [3, 0x10]]) {
    assert.equal(wasm.isaac_pm_urh_w_thr2(g | 0) | 0, want, `thr2 ${g}`);
    assert.equal(wasm.isaac_pm_urh_w_thr2(g | 0) | 0, pmUrhWThr2(g),
                 `thr2 oracle ${g}`);
    cases += 2;
  }
  t.diagnostic(`v15 itemvec/thr cases: ${cases}`);
  assert.ok(cases >= 30, `expected >= 30 cases, got ${cases}`);
});

test("Wasm matches JS: v15 float ratio gates (comiss CF semantics)", (t) => {
  let cases = 0;
  /* The 0.1f boundary sits EXACTLY on a representable ratio:
     f32(1)/f32(10) rounds to the constant bit pattern 0x3dcccccd —
     the arithmetic identity that cross-validates the .rdata read. */
  assert.equal(wasm.isaac_pm_urh_ratio_bits(1, 10) >>> 0,
               PM_URH_F32_01_BITS >>> 0, "1/10 rounds to the 0.1f bits");
  assert.equal(pmUrhRatioBits(1, 10) >>> 0, PM_URH_F32_01_BITS >>> 0);
  /* 4/5 = 0.8 exactly in binary? No — but divss rounds to the SAME
     0x3f4ccccd pattern the constant holds. */
  assert.equal(wasm.isaac_pm_urh_ratio_bits(4, 5) >>> 0,
               PM_URH_F32_08_BITS >>> 0, "4/5 rounds to the 0.8f bits");
  /* 3/10 rounds to the 0.3f bits. */
  assert.equal(wasm.isaac_pm_urh_ratio_bits(3, 10) >>> 0,
               PM_URH_F32_03_BITS >>> 0, "3/10 rounds to the 0.3f bits");
  cases += 4;
  /* C gate: jb on less OR UNORDERED — boundary and NaN/inf corners. */
  for (const [red, max, want, why] of [
    [4, 5, 1, "ratio == 0.8 -> HIGH (jb strict)"],
    [79, 100, 0, "0.79 -> LOW"],
    [81, 100, 1, "0.81 -> HIGH"],
    [1, 1, 1, "1.0 -> HIGH"],
    [0, 0, 0, "0/0 NaN -> UNORDERED -> LOW"],
    [5, 0, 1, "+inf -> HIGH"],
    [-5, 0, 0, "-inf -> LOW"],
    [-4, -5, 1, "(-4)/(-5) = 0.8 -> HIGH"],
    [0, 5, 0, "0.0 -> LOW"],
  ]) {
    assert.equal(wasm.isaac_pm_urh_c_high(red | 0, max | 0) | 0, want, why);
    assert.equal(wasm.isaac_pm_urh_c_high(red | 0, max | 0) | 0,
                 pmUrhCHigh(red, max), `c_high oracle ${red}/${max}`);
    cases += 2;
  }
  /* D band: ADD iff ordered 0.1 <= r <= 0.3; NaN -> REMOVE via jb1. */
  for (const [red, max, want, why] of [
    [1, 10, 1, "r == 0.1 -> ADD (jb strict at the low edge)"],
    [3, 10, 1, "r == 0.3 -> ADD (jb strict at the high edge)"],
    [2, 10, 1, "0.2 in band"],
    [9, 100, 0, "0.09 -> REMOVE"],
    [31, 100, 0, "0.31 -> REMOVE"],
    [0, 0, 0, "0/0 NaN -> REMOVE (jb1 unordered)"],
    [5, 0, 0, "+inf -> REMOVE (jb2)"],
    [-5, 0, 0, "-inf -> REMOVE (jb1)"],
    [0, 5, 0, "0.0 -> REMOVE"],
    [1, 5, 1, "0.2 -> ADD"],
  ]) {
    assert.equal(wasm.isaac_pm_urh_d_add_band(red | 0, max | 0) | 0, want,
                 why);
    assert.equal(wasm.isaac_pm_urh_d_add_band(red | 0, max | 0) | 0,
                 pmUrhDAddBand(red, max), `d_band oracle ${red}/${max}`);
    cases += 2;
  }
  /* Ordered ratio bits agree bit for bit (NaN payloads are canonical
     in Wasm and never observable in the PE — only the UNORDERED CF
     is, which the gate rows above pin). */
  let seed = 0x7ca100 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  for (let i = 0; i < 300; i += 1) {
    const red = (rnd() >> 8) | 0;   /* HIGH bits */
    const max = (rnd() >> 8) | 0;
    if (max === 0 && red === 0) continue;
    assert.equal(wasm.isaac_pm_urh_ratio_bits(red | 0, max | 0) >>> 0,
                 pmUrhRatioBits(red, max) >>> 0,
                 `ratio bits ${red}/${max}`);
    assert.equal(wasm.isaac_pm_urh_c_high(red | 0, max | 0) | 0,
                 pmUrhCHigh(red, max), `c corpus ${red}/${max}`);
    assert.equal(wasm.isaac_pm_urh_d_add_band(red | 0, max | 0) | 0,
                 pmUrhDAddBand(red, max), `d corpus ${red}/${max}`);
    cases += 3;
  }
  t.diagnostic(`v15 float gate cases: ${cases}`);
  assert.ok(cases >= 800, `expected >= 800 cases, got ${cases}`);
});

test("Wasm matches JS: v15 probe 0x6dacd0 + v13 getter cross-pin", (t) => {
  let cases = 0;
  /* The probe's threshold IS the v13 select law (GetHealthType then
     max vs max + 2*bone): probe == (v1344 >= getter_7cb060) SIGNED,
     for EVERY char including the unsigned-wrap defaults. */
  const chars = [];
  for (let c = -3; c <= 0x2a; c += 1) chars.push(c);
  chars.push(0x100, -0x80000000, 0x7fffffff);
  const grid = [[6, 0, 6], [6, 0, 5], [6, 2, 10], [6, 2, 9], [0, 0, 0],
                [-2, 1, 0], [0x7fffffff, 1, 5], [4, -3, -2]];
  for (const c of chars) {
    for (const [m, b, r] of grid) {
      const w = wasm.isaac_pm_urh_probe_6dacd0(c | 0, m | 0, b | 0, r | 0) | 0;
      assert.equal(w, pmUrhProbe6dacd0(c, m, b, r),
                   `probe oracle char ${c} ${m} ${b} ${r}`);
      const getter = wasm.isaac_pm_c0t_getter_7cb060(c | 0, m | 0, b | 0) | 0;
      assert.equal(w, (r | 0) >= getter ? 1 : 0,
                   `probe == (red >= v13 getter law) at char ${c}`);
      cases += 2;
    }
  }
  /* Arm witnesses: ht==1 (char 4) ignores bone; ht==0 (char 5) adds
     2*bone; setge is SIGNED and non-strict. */
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(4, 6, 100, 6) | 0, 1,
               "ht 1: bone ignored, 6 >= 6");
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(4, 6, 100, 5) | 0, 0);
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(5, 6, 1, 7) | 0, 0,
               "ht 0: threshold 8, red 7 misses");
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(5, 6, 1, 8) | 0, 1);
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(0xa, 6, 1, 6) | 0, 1,
               "ht 2 (char 0xa): bone ignored");
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(0x10, 4, 1, 5) | 0, 0,
               "ht 4 (char 0x10): threshold 6");
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(4, -1, 0, -1) | 0, 1,
               "SIGNED setge: -1 >= -1");
  assert.equal(wasm.isaac_pm_urh_probe_6dacd0(4, 1, 0, -1) | 0, 0,
               "SIGNED setge: -1 < 1 (unsigned mutant flips)");
  /* Wrap on the lea: max INT_MAX + 2*1 wraps negative -> red 0 >=. */
  assert.equal(
      wasm.isaac_pm_urh_probe_6dacd0(5, 0x7fffffff, 1, 0) | 0, 1,
      "threshold wraps to INT_MIN+0 side");
  cases += 9;
  t.diagnostic(`v15 probe cases: ${cases}`);
  assert.ok(cases >= 500, `expected >= 500 cases, got ${cases}`);
});

test("Wasm matches JS: v15 urh_plan decision layer, all arms", (t) => {
  let cases = 0;
  const base = {
    game266141: 2, redA: 0, v1da4: 0, dead1: 1, char1: 0,
    bone1d88: 0, red194c: 0, soul134c: 0, eternal1348: 0, redB: 0,
    roomByte1: 0, frame1: 0, room11f01: 0, null6e: 0, entCount: 0,
    scanMatches: 0, ivecBegin: 0, ivecEnd: 0, elem1b8: 0, elem78: 0,
    game266142: 2, dead2: 1, redC: 0, char2: 0, has26b: 0,
    roomByte2: 0, frame2: 0, room11f02: 0, has7a: 0, eff7a: 0,
    byte1824: 0, has19f: 0, game266143: 2, redD: 0, maxD: 0,
    byte13b5: 0, char3: 0, p1340: 0, p1d88: 0, p1344: 0,
    eff19fHigh: 0, eff19fLow: 0, has1ba: 0, redE: 0, game266144: 2,
    maxE: 0, eff1baRm: 0, eff1baAdd: 0, has1ed: 0, eff1ed: 0,
  };
  /* A: everything closed — still: gullet ALWAYS, the three always-on
     probes issued, single ret. */
  let got = v15RunPlanBoth(base, "A closed");
  assert.equal(got.hostGullet, 1, "gullet is unconditional");
  assert.equal(got.foldRan, 0);
  assert.equal(got.probeHas19fIssued, 1);
  assert.equal(got.probeHas1baIssued, 1);
  assert.equal(got.probeHas1edIssued, 1);
  assert.equal(got.probeEff1edIssued, 1, "eff1ed probed when not owned");
  assert.equal(got.gRereadJ1, 1, "dead_1 path re-reads at J1");
  assert.equal(got.retVa >>> 0, PM_URH_VA_RET >>> 0, "single ret");
  cases += 8;
  /* B: fold + FG spawn chain with the record add. */
  got = v15RunPlanBoth({
    ...base, game266141: 1, redA: 5, v1da4: 9,
    dead1: 0x100 /* AL == 0 */, char1: 0x1a,
    bone1d88: 0, red194c: 0, soul134c: 0, eternal1348: 0, redB: 1,
    roomByte1: 1, frame1: 10, room11f01: 5, null6e: 0,
    entCount: 0, ivecBegin: 0x1000, ivecEnd: 0x1000 + 0x1c0,
    elem1b8: 0x2000, elem78: 0x77,
  }, "B spawn");
  assert.equal(got.foldRan, 1);
  assert.equal(got.store1da4, 3, "min(9, trunc(6/2)) = 3");
  assert.equal(got.store1344, 6, "max(5, 2*3) = 6");
  assert.equal(got.fgGate, 1, "dead 0x100 reads AL == 0");
  assert.equal(got.fgSumIsOne, 1);
  assert.equal(got.probeNull6eIssued, 1);
  assert.equal(got.scanRan, 0, "count 0 goes straight to spawn");
  assert.equal(got.spawnReached, 1);
  assert.equal(got.hostShow1, 1);
  assert.equal(got.itemvecGate, 1);
  assert.equal(got.hostEffect930220, 1);
  assert.equal(got.pairElem >>> 0, 0x2000);
  assert.equal(got.pairElem78 >>> 0, 0x77);
  assert.equal(got.gRereadJ1, 1, "spawn rejoins at J1");
  cases += 14;
  /* C: scan match -> J2 snapshot; null6e wide drive. */
  got = v15RunPlanBoth({
    ...base, dead1: 0, char1: 0x1a, redB: 1,
    roomByte1: 1, frame1: 10, room11f01: 5, null6e: 0x100 /* AL 0 */,
    entCount: 3, scanMatches: 2,
  }, "C scan match");
  assert.equal(got.probeNull6eIssued, 1);
  assert.equal(got.scanRan, 1);
  assert.equal(got.scanMatches, 2);
  assert.equal(got.spawnReached, 0);
  assert.equal(got.gRereadJ1, 0, "match keeps the J2 snapshot");
  cases += 5;
  /* null6e truthy -> J2 across the host call. */
  got = v15RunPlanBoth({
    ...base, dead1: 0, char1: 0x1a, redB: 1,
    roomByte1: 1, frame1: 10, room11f01: 5, null6e: 1,
  }, "C null6e");
  assert.equal(got.probeNull6eIssued, 1);
  assert.equal(got.scanRan, 0);
  assert.equal(got.gRereadJ1, 0, "esi held ACROSS HasNullEffect");
  cases += 3;
  /* D: W section — low red straight to B', add 7a + show2. */
  got = v15RunPlanBoth({
    ...base, dead2: 0, game266142: 1, redC: 1,
    has7a: 1, eff7a: 0x100 /* AL 0 */, byte1824: 0x100 /* AL 0 */,
  }, "D w_low");
  assert.equal(got.wThr0, 1);
  assert.equal(got.wLow, 1);
  assert.equal(got.probeHas7aIssued, 1);
  assert.equal(got.probeEff7aIssued, 1);
  assert.equal(got.hostShow2, 0, "byte_1824 0x100 reads AL 0 -> no Show");
  assert.equal(got.hostAdd7a, 1);
  cases += 6;
  got = v15RunPlanBoth({
    ...base, dead2: 0, game266142: 1, redC: 1,
    has7a: 1, eff7a: 0, byte1824: 1,
  }, "D show2");
  assert.equal(got.hostShow2, 1, "byte_1824 set -> Show #2");
  assert.equal(got.hostAdd7a, 1);
  cases += 2;
  /* E: char-5 chain — probe path with reload, then B'. */
  got = v15RunPlanBoth({
    ...base, dead2: 0, game266142: 2, redC: 0x11, char2: 5,
    has26b: 1, roomByte2: 1, frame2: 100, room11f02: 1,
    has7a: 1, eff7a: 1,
  }, "E char5 probe");
  assert.equal(got.wThr0, 0x10);
  assert.equal(got.wChar5, 1);
  assert.equal(got.wThr2, 0x10);
  assert.equal(got.probeHas26bIssued, 1);
  assert.equal(got.wGReload, 1, "reload ONLY on the probe-true path");
  assert.equal(got.wRoomGate, 1);
  assert.equal(got.probeHas7aIssued, 1);
  assert.equal(got.probeEff7aIssued, 1);
  assert.equal(got.hostAdd7a, 0, "already has the effect");
  cases += 9;
  /* char-5 low arm: no probe, STALE esi (no reload). */
  got = v15RunPlanBoth({
    ...base, dead2: 0, game266142: 1, redC: 2, char2: 5,
    roomByte2: 1, frame2: 100, room11f02: 1,
  }, "E char5 low");
  assert.equal(got.wLow, 0, "redC 2 > thr0 1");
  assert.equal(got.wThr2, 2);
  assert.equal(got.probeHas26bIssued, 0, "redC <= thr2 skips the probe");
  assert.equal(got.wGReload, 0, "STALE esi kept — one-path reload");
  assert.equal(got.wRoomGate, 1);
  assert.equal(got.probeHas7aIssued, 1);
  cases += 6;
  /* F: C section non-alt HIGH add / LOW remove. */
  got = v15RunPlanBoth({
    ...base, has19f: 1, game266143: 2, redD: 4, maxD: 5, eff19fHigh: 0,
  }, "F c high add");
  assert.equal(got.cRan, 1);
  assert.equal(got.cAlt, 0);
  assert.equal(got.cHigh, 1, "0.8 exactly is HIGH");
  assert.equal(got.probeEff19fHighIssued, 1);
  assert.equal(got.probeEff19fLowIssued, 0);
  assert.equal(got.hostAdd19f, 1);
  assert.equal(got.play530StrVa >>> 0, PM_URH_STR_FLOATGLOW_VA >>> 0);
  assert.equal(got.hostPlay530, 1);
  cases += 8;
  got = v15RunPlanBoth({
    ...base, has19f: 0x100 /* AL 0 -> section skipped */,
  }, "F has19f wide");
  assert.equal(got.cRan, 0, "has19f 0x100 reads AL 0");
  cases += 1;
  got = v15RunPlanBoth({
    ...base, has19f: 1, game266143: 2, redD: 0, maxD: 0, eff19fLow: 1,
  }, "F c nan low remove");
  assert.equal(got.cHigh, 0, "0/0 NaN takes LOW");
  assert.equal(got.probeEff19fLowIssued, 1);
  assert.equal(got.hostRemove19f, 1);
  assert.equal(got.play530StrVa >>> 0, PM_URH_STR_FLOATNOGLOW_VA >>> 0);
  cases += 4;
  /* alt arm: byte_13b5 set -> LOW without the probe. */
  got = v15RunPlanBoth({
    ...base, has19f: 1, game266143: 1, byte13b5: 1, eff19fLow: 0,
  }, "F alt 13b5");
  assert.equal(got.cAlt, 1);
  assert.equal(got.probe6dacd0Issued, 0, "13b5 set skips the pure probe");
  assert.equal(got.cHigh, 0);
  assert.equal(got.hostRemove19f, 0, "LOW with effect OFF does nothing");
  cases += 4;
  /* alt arm: pure probe decides HIGH / LOW. */
  got = v15RunPlanBoth({
    ...base, has19f: 1, game266143: 1, byte13b5: 0x100 /* AL 0 */,
    char3: 4, p1340: 6, p1d88: 100, p1344: 6, eff19fHigh: 1,
  }, "F alt probe high");
  assert.equal(got.probe6dacd0Issued, 1);
  assert.equal(got.probe6dacd0Result, 1, "ht 1: 6 >= 6, bone ignored");
  assert.equal(got.cHigh, 1);
  assert.equal(got.probeEff19fHighIssued, 1);
  assert.equal(got.hostAdd19f, 0, "already on");
  cases += 5;
  got = v15RunPlanBoth({
    ...base, has19f: 1, game266143: 1, byte13b5: 0,
    char3: 5, p1340: 6, p1d88: 1, p1344: 7, eff19fLow: 1,
  }, "F alt probe low");
  assert.equal(got.probe6dacd0Result, 0, "ht 0: 7 < 8");
  assert.equal(got.cHigh, 0);
  assert.equal(got.hostRemove19f, 1);
  cases += 3;
  /* G: D section band / alt / add / remove. */
  got = v15RunPlanBoth({
    ...base, has1ba: 1, game266144: 2, redE: 2, maxE: 10, eff1baAdd: 0,
  }, "G d band add");
  assert.equal(got.dRan, 1);
  assert.equal(got.dAlt, 0);
  assert.equal(got.dAddSide, 1, "0.2 in band");
  assert.equal(got.probeEff1baAddIssued, 1);
  assert.equal(got.probeEff1baRmIssued, 0);
  assert.equal(got.hostAdd1ba, 1);
  assert.equal(got.play644StrVa >>> 0, PM_URH_STR_FLOATGLOW_VA >>> 0);
  assert.equal(got.hostPlay644, 1);
  cases += 8;
  got = v15RunPlanBoth({
    ...base, has1ba: 1, game266144: 2, redE: 5, maxE: 10, eff1baRm: 1,
  }, "G d band remove");
  assert.equal(got.dAddSide, 0, "0.5 above the band");
  assert.equal(got.probeEff1baRmIssued, 1);
  assert.equal(got.hostRemove1ba, 1);
  assert.equal(got.play644StrVa >>> 0, PM_URH_STR_FLOATNOGLOW_VA >>> 0);
  cases += 4;
  got = v15RunPlanBoth({
    ...base, has1ba: 1, game266144: 1, redE: 2, eff1baAdd: 1,
  }, "G d alt add");
  assert.equal(got.dAlt, 1);
  assert.equal(got.dAddSide, 1, "alt: red_e == 2 EXACT");
  assert.equal(got.hostAdd1ba, 0, "already on");
  cases += 3;
  got = v15RunPlanBoth({
    ...base, has1ba: 1, game266144: 1, redE: 3, eff1baRm: 0x100,
  }, "G d alt remove");
  assert.equal(got.dAddSide, 0, "alt: red_e != 2");
  assert.equal(got.hostRemove1ba, 0, "eff 0x100 reads AL 0 -> nothing");
  cases += 2;
  /* H: E section flag paths. */
  got = v15RunPlanBoth({ ...base, has1ed: 1 }, "H owned");
  assert.equal(got.probeEff1edIssued, 0, "owned skips the effect probe");
  assert.equal(got.store1574Or1, 1);
  assert.equal(got.host763570, 1);
  cases += 3;
  got = v15RunPlanBoth({ ...base, has1ed: 0, eff1ed: 1 }, "H effect");
  assert.equal(got.probeEff1edIssued, 1);
  assert.equal(got.store1574Or1, 1);
  cases += 2;
  got = v15RunPlanBoth({ ...base, has1ed: 0x100, eff1ed: 0x100 }, "H wide");
  assert.equal(got.store1574Or1, 0, "both ALs read 0 -> plain ret");
  assert.equal(got.host763570, 0);
  cases += 2;
  /* Post-call split honored: red_a (fold) vs red_b (sum) diverge. */
  got = v15RunPlanBoth({
    ...base, game266141: 1, redA: 100, v1da4: 0,
    dead1: 0, char1: 0x1a, redB: 1,
    roomByte1: 0,
  }, "I split reads");
  assert.equal(got.store1344, 100, "fold uses red_a");
  assert.equal(got.fgSumIsOne, 1, "sum uses red_b — a fold-to-red_a mutant dies");
  assert.equal(got.gRereadJ1, 0, "room byte 0 -> J2 snapshot");
  cases += 3;
  /* game_26614 split honored: 1 folds, 2 blocks W, 1 alt in C, 2 band
     in D — four different values in ONE call. */
  got = v15RunPlanBoth({
    ...base, game266141: 1, game266142: 2, game266143: 1, game266144: 2,
    dead2: 0, redC: 0x11, has19f: 1, byte13b5: 1,
    has1ba: 1, redE: 2, maxE: 10, eff1baAdd: 0,
  }, "I g26614 split");
  assert.equal(got.foldRan, 1, "slot 1 folds");
  assert.equal(got.wThr0, 0x10, "slot 2 sets the high threshold");
  assert.equal(got.cAlt, 1, "slot 3 takes the alt arm");
  assert.equal(got.dAlt, 0, "slot 4 takes the band arm");
  cases += 4;
  t.diagnostic(`v15 plan cases: ${cases}`);
  assert.ok(cases >= 90, `expected >= 90 cases, got ${cases}`);
});

test("Wasm matches JS: v15 urh_apply guest memory + corpus", (t) => {
  const P = SCRATCH + 0x2000;
  const GAME = SCRATCH + 0x80000;
  const MGR = SCRATCH + 0x50000;
  const ROOM = SCRATCH + 0x8000;
  const LIST = SCRATCH + 0xa000;
  const ENT = SCRATCH + 0xb000;
  const IVEC = SCRATCH + 0x60000;
  const ELEM = SCRATCH + 0x62000;
  const PROBES_AT = SCRATCH + 0xd000;
  const PLAN_AT = SCRATCH + 0xd100;
  const SHADOW_SIZE = 0x1b0000;
  let cases = 0;
  let seed = 0x6dacd0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  /* HIGH bits. */
  const draw = (n) => Math.floor(((rnd() >>> 8) / 0x1000000) * n);

  const runApply = (fields, probes, label) => {
    const view = new DataView(wasm.memory.buffer);
    const shadow = new DataView(new ArrayBuffer(SHADOW_SIZE));
    const w32 = (addr, v) => {
      view.setUint32(addr, v >>> 0, true);
      shadow.setUint32(addr, v >>> 0, true);
    };
    const w8 = (addr, v) => {
      view.setUint8(addr, v & 0xff);
      shadow.setUint8(addr, v & 0xff);
    };
    /* Player fields. */
    w32(P + 0x1344, fields.red);
    w32(P + PM_URH_OFF_1DA4, fields.v1da4);
    w8(P + 0x173, fields.dead);
    w32(P + 0x13c0, fields.char);
    w32(P + 0x1d88, fields.bone);
    w32(P + 0x194c, fields.red194c);
    w32(P + 0x134c, fields.soul);
    w32(P + PM_URH_OFF_ETERNAL_1348, fields.eternal);
    w32(P + 0x1340, fields.max);
    w8(P + PM_URH_OFF_BYTE_1824, fields.b1824);
    w8(P + PM_URH_OFF_BYTE_13B5, fields.b13b5);
    w32(P + PM_URH_OFF_FLAG_1574, fields.flag1574);
    /* Game / room / list / entities. */
    w32(GAME + 0x26614, fields.g26614);
    w32(GAME + PM_URH_OFF_ROOM_18300, ROOM);
    w32(GAME + PM_URH_OFF_FRAME_264F8, fields.frame);
    w8(ROOM, fields.roomByte);
    w32(ROOM + PM_URH_OFF_ROOM_11F0, fields.room11f0);
    w32(ROOM + PM_URH_OFF_ROOM_COUNT_1254, fields.entCount);
    w32(ROOM + PM_URH_OFF_ROOM_LIST_124C, LIST);
    for (let k = 0; k < fields.ents.length; k += 1) {
      const e = fields.ents[k];
      if (e === null) {
        w32(LIST + 4 * k, 0);
        continue;
      }
      const at = ENT + k * 0x800;
      w32(LIST + 4 * k, at);
      w32(at + PM_URH_ENT_OFF_TYPE_28, e.type);
      w32(at + PM_URH_ENT_OFF_PARENT_410, e.parent);
      w32(at + PM_URH_ENT_OFF_VARIANT_2C, e.variant);
      w32(at + PM_URH_ENT_OFF_SUBTYPE_30, e.subtype);
      w8(at + PM_URH_ENT_OFF_DEAD_173, e.dead);
    }
    /* Manager item vector. */
    w32(MGR + PM_URH_ITEMVEC_BEGIN_OFF, IVEC);
    w32(MGR + PM_URH_ITEMVEC_END_OFF, IVEC + fields.ivecSpan);
    w32(IVEC + PM_URH_ITEMVEC_ELEM_OFF, fields.elemNull ? 0 : ELEM);
    w32(ELEM + PM_URH_ELEM_FIELD_78, fields.elem78);
    /* Probes struct. */
    v15WriteUrhProbes(view, PROBES_AT, probes);
    wasm.isaac_pm_urh_apply(P, GAME, MGR, PROBES_AT, PLAN_AT);
    const got = v15ReadUrhPlan(view, PLAN_AT);
    /* Independent JS walk over the shadow copy. */
    const mem = {
      r32: (a) => shadow.getUint32(a >>> 0, true),
      r8: (a) => shadow.getUint8(a >>> 0),
      w32: (a, v) => shadow.setUint32(a >>> 0, v >>> 0, true),
    };
    const want = pmUrhApplyModel(mem, P, GAME, MGR, probes);
    assert.deepEqual(got, v15UrhPlanFromModel(want.plan),
                     `apply plan ${label}`);
    /* Stores landed in Wasm scratch exactly as the shadow says. */
    assert.equal(readI32(view, P + PM_URH_OFF_1DA4),
                 shadow.getInt32(P + PM_URH_OFF_1DA4, true),
                 `1da4 store ${label}`);
    assert.equal(readI32(view, P + 0x1344),
                 shadow.getInt32(P + 0x1344, true), `1344 store ${label}`);
    assert.equal(readU32(view, P + PM_URH_OFF_FLAG_1574),
                 shadow.getUint32(P + PM_URH_OFF_FLAG_1574, true),
                 `1574 flag ${label}`);
    /* A field the body never writes stays untouched. */
    assert.equal(readI32(view, P + 0x1340), fields.max,
                 `max untouched ${label}`);
    cases += 5;
    return got;
  };

  const baseFields = {
    red: 5, v1da4: 9, dead: 0, char: 0x1a, bone: 0, red194c: 0,
    soul: 0, eternal: 0, max: 10, b1824: 1, b13b5: 0, flag1574: 0x1000,
    g26614: 1, frame: 10, room11f0: 5, roomByte: 1, entCount: 0,
    ents: [], ivecSpan: 0x1c0, elemNull: 0, elem78: 0x77,
  };
  const noProbes = {};
  /* Fixed: the fold+spawn chain with stores visible in scratch. */
  let got = runApply(baseFields, noProbes, "fold+spawn");
  assert.equal(got.foldRan, 1);
  assert.equal(got.store1da4, 3);
  assert.equal(got.store1344, 6, "folded red visible to later re-reads");
  assert.equal(got.fgSumIsOne, 0,
               "sum sees the FOLDED red (6), not 1 — store ordering law");
  cases += 4;
  /* red 1 keeps sum == 1 after fold (half(2)=1, 2*min(9,1)=2 -> max(1,2)=2
     ... so use v1da4 0 to keep red at 1). */
  got = runApply({ ...baseFields, red: 1, v1da4: 0 }, noProbes,
                 "fold keeps sum 1");
  assert.equal(got.store1344, 1, "max(1, 2*min(0,1)) = 1");
  assert.equal(got.fgSumIsOne, 1);
  assert.equal(got.spawnReached, 1);
  assert.equal(got.hostShow1, 1);
  assert.equal(got.itemvecGate, 1);
  assert.equal(got.hostEffect930220, 1);
  assert.equal(got.pairElem >>> 0, ELEM >>> 0);
  assert.equal(got.pairElem78 >>> 0, 0x77);
  cases += 8;
  /* Entity scan in real memory: one live match -> J2, no spawn. */
  got = runApply({
    ...baseFields, red: 1, v1da4: 0, entCount: 3,
    ents: [
      { type: 3, parent: P, variant: 0xee, subtype: 0, dead: 0 },
      null,
      { type: 3, parent: P, variant: 0xee, subtype: 7, dead: 0 },
    ],
  }, noProbes, "scan match");
  assert.equal(got.scanRan, 1);
  assert.equal(got.scanMatches, 1, "subtype 7 slot skipped");
  assert.equal(got.spawnReached, 0);
  cases += 3;
  /* E-section flag or-store visible in scratch (0x1000 | 1). */
  got = runApply({ ...baseFields, dead: 1 }, { has1ed: 1 }, "flag store");
  assert.equal(got.store1574Or1, 1);
  const view2 = new DataView(wasm.memory.buffer);
  assert.equal(readU32(view2, P + PM_URH_OFF_FLAG_1574), 0x1001,
               "or dword [0x1574],1 lands");
  cases += 2;

  /* Deterministic corpus: coverage over every arm. */
  const reach = {
    fold: 0, fgGate: 0, sumOne: 0, spawn: 0, itemGate: 0, j1: 0, j2: 0,
    scan: 0, scanHit: 0, wLow: 0, char5: 0, reload: 0, bprime: 0,
    show2: 0, add7a: 0, cRan: 0, cAlt: 0, cHigh: 0, cLow: 0, probe: 0,
    probeHi: 0, probeLo: 0, add19f: 0, rm19f: 0, dRan: 0, dAlt: 0,
    dAdd: 0, dRm: 0, add1ba: 0, rm1ba: 0, flag: 0, noflag: 0,
  };
  const wideByte = () => [0, 1, 0xff, 0x100, 0x1ff, 0x80000000,
                          0xffffffff][draw(7)];
  for (let trial = 0; trial < 400; trial += 1) {
    const fgTemplate = trial % 3 === 0;
    const nEnts = draw(4);
    const ents = [];
    for (let k = 0; k < nEnts; k += 1) {
      if (!fgTemplate && draw(5) === 0) {
        ents.push(null);
        continue;
      }
      ents.push({
        type: draw(2) === 0 ? 3 : draw(6),
        parent: draw(2) === 0 ? P : P + 4,
        variant: draw(2) === 0 ? 0xee : draw(0x100),
        subtype: draw(3) === 0 ? 7 : draw(10),
        dead: draw(3) === 0 ? 1 : 0,
      });
    }
    /* Every third trial biases hard into the forgotten-child chain so
       the deep arms (sum == 1, spawn, item gate, scan hit) are truly
       reached; the rest stays fully random. */
    const fields = fgTemplate ? {
      red: 1, v1da4: 0, dead: 0, char: 0x1a,
      bone: 0, red194c: 0, soul: 0, eternal: 0,
      max: [0, 5, 10, 100][draw(4)],
      b1824: draw(2), b13b5: draw(2), flag1574: draw(16),
      g26614: [1, 2][draw(2)],
      frame: 10, room11f0: draw(2) === 0 ? 5 : 9,
      roomByte: draw(4) === 0 ? 0 : 1,
      entCount: nEnts, ents,
      ivecSpan: [0x1b8, 0x1bc, 0x1c0][draw(3)],
      elemNull: draw(4) === 0 ? 1 : 0, elem78: draw(0x1000),
    } : {
      red: [1, 2, 3, 5, 0x11, 0x20, 8][draw(7)],
      v1da4: draw(6), dead: draw(4) === 0 ? 1 : 0,
      char: [0x1a, 5, 4, 0][draw(4)],
      bone: draw(3), red194c: draw(2), soul: draw(2), eternal: draw(2),
      max: [0, 5, 10, 100][draw(4)],
      b1824: draw(2), b13b5: draw(2), flag1574: draw(16),
      g26614: [0, 1, 2, 3][draw(4)],
      frame: draw(20), room11f0: draw(20),
      roomByte: draw(3) === 0 ? 0 : 1,
      entCount: nEnts, ents,
      ivecSpan: [0x1b8, 0x1bc, 0x1c0, 0][draw(4)],
      elemNull: draw(4) === 0 ? 1 : 0, elem78: draw(0x1000),
    };
    const probes = {
      null6e: wideByte(), has26b: wideByte(), has7a: wideByte(),
      eff7a: wideByte(), has19f: wideByte(), eff19fHigh: wideByte(),
      eff19fLow: wideByte(), has1ba: wideByte(), eff1baRm: wideByte(),
      eff1baAdd: wideByte(), has1ed: wideByte(), eff1ed: wideByte(),
    };
    const plan = runApply(fields, probes, `corpus ${trial}`);
    if (plan.foldRan) reach.fold += 1;
    if (plan.fgGate) reach.fgGate += 1;
    if (plan.fgSumIsOne) reach.sumOne += 1;
    if (plan.spawnReached) reach.spawn += 1;
    if (plan.itemvecGate) reach.itemGate += 1;
    if (plan.gRereadJ1) reach.j1 += 1; else reach.j2 += 1;
    if (plan.scanRan) reach.scan += 1;
    if (plan.scanRan && plan.scanMatches > 0) reach.scanHit += 1;
    if (plan.wLow) reach.wLow += 1;
    if (plan.wChar5) reach.char5 += 1;
    if (plan.wGReload) reach.reload += 1;
    if (plan.probeHas7aIssued) reach.bprime += 1;
    if (plan.hostShow2) reach.show2 += 1;
    if (plan.hostAdd7a) reach.add7a += 1;
    if (plan.cRan) reach.cRan += 1;
    if (plan.cAlt) reach.cAlt += 1;
    if (plan.cRan && plan.cHigh) reach.cHigh += 1;
    if (plan.cRan && !plan.cHigh) reach.cLow += 1;
    if (plan.probe6dacd0Issued) {
      reach.probe += 1;
      if (plan.probe6dacd0Result) reach.probeHi += 1;
      else reach.probeLo += 1;
    }
    if (plan.hostAdd19f) reach.add19f += 1;
    if (plan.hostRemove19f) reach.rm19f += 1;
    if (plan.dRan) reach.dRan += 1;
    if (plan.dAlt) reach.dAlt += 1;
    if (plan.dRan && plan.dAddSide) reach.dAdd += 1;
    if (plan.dRan && !plan.dAddSide) reach.dRm += 1;
    if (plan.hostAdd1ba) reach.add1ba += 1;
    if (plan.hostRemove1ba) reach.rm1ba += 1;
    if (plan.store1574Or1) reach.flag += 1; else reach.noflag += 1;
    /* Return path is the single ret, every time. */
    assert.equal(plan.retVa >>> 0, PM_URH_VA_RET >>> 0);
    assert.equal(plan.hostGullet, 1);
    cases += 2;
  }
  /* The corpus must REACH every arm — a green run that never entered
     an arm asserted nothing about it. */
  for (const [k, v] of Object.entries(reach)) {
    assert.ok(v > 0, `corpus never reached arm ${k}`);
  }
  t.diagnostic(
    `v15 apply cases: ${cases}; ` +
    Object.entries(reach).map(([k, v]) => `${k}=${v}`).join(" "));
  assert.ok(cases >= 2000, `expected >= 2000 cases, got ${cases}`);
});

/* ====================================================================== */
/* ABI v16 — HEAL: Entity_Player red-heart burst @ 0x007ca2d0             */
/* ====================================================================== */

/* IsaacPmHealInputs layout (mirrors the header; natural C alignment). */
const HEAL_IN_SIZE = 468;
const HEAL_IN_OFF = {
  amount: 0, preInitialId: 4, preGameNull: 8, preEntryFound: 12,
  preSeed: 16, preShift1: 20, preShift2: 24, preShift3: 28,
  anmStateNull: 32, anmState34: 36, anmA44: 40, anmNameEq: 44,
  anmSetResult: 48, playerX340: 52, playerF350: 56,
  anmPosX: 72, anmPosY: 136, rngF0: 200, rngCnt: 216, rngV2: 232,
  rngSpawn: 296, tailGame26614: 360, tailCount: 364, tailFreeFlag: 368,
  tailKind: 372, tailIsPlayer: 404, tailFrozen: 436,
};

/* IsaacPmHealPlan layout. */
const HEAL_PLAN_SIZE = 320;
const HEAL_PLAN_OFF = {
  applies: 0, preId: 4, preSeedOut: 8, preAdvanced: 12, preHost: 16,
  preFatal: 20, sfxPlay: 24, spawn1: 28, anmLoad: 32, anmSetRan: 36,
  anmRewindRan: 40, vcallA: 44, spawn2: 48, vcallB: 52, outerRuns: 56,
  outerOverflow: 60, f0: 64, innerCount: 80, innerOverflow: 96, v2: 100,
  spawnPosX: 164, spawnPosY: 228, tailEligible: 292, tailFrozenCnt: 296,
  tailTotal: 300, tailOverflow: 304, listFreeRan: 308, hostDraws: 312,
  retVa: 316,
};

const HEAL_PLAN_FIELDS = [
  ["applies", "i"], ["preId", "i"], ["preSeedOut", "u"], ["preAdvanced", "i"],
  ["preHost", "i"], ["preFatal", "i"], ["sfxPlay", "i"], ["spawn1", "i"],
  ["anmLoad", "i"], ["anmSetRan", "i"], ["anmRewindRan", "i"], ["vcallA", "i"],
  ["spawn2", "i"], ["vcallB", "i"], ["outerRuns", "i"], ["outerOverflow", "i"],
  ["f0", "u4"], ["innerCount", "i4"], ["innerOverflow", "i"], ["v2", "u44"],
  ["spawnPosX", "u44"], ["spawnPosY", "u44"], ["tailEligible", "i"],
  ["tailFrozenCnt", "i"], ["tailTotal", "i"], ["tailOverflow", "i"],
  ["listFreeRan", "i"], ["hostDraws", "u"], ["retVa", "u"],
];

function v16ReadHealPlan(view, at) {
  const out = {};
  for (const [name, kind] of HEAL_PLAN_FIELDS) {
    const off = HEAL_PLAN_OFF[name];
    if (kind === "u4" || kind === "i4" || kind === "u44") {
      const arr = [];
      const n = kind === "u4" || kind === "i4" ? 4 : 16;
      for (let i = 0; i < n; i += 1) {
        arr.push(kind[0] === "u" ? view.getUint32(at + off + 4 * i, true)
                                 : view.getInt32(at + off + 4 * i, true));
      }
      out[name] = arr;
    } else {
      out[name] = kind === "u" ? view.getUint32(at + off, true)
                               : view.getInt32(at + off, true);
    }
  }
  return out;
}

function v16HealPlanFromModel(m) {
  const out = {};
  for (const [name, kind] of HEAL_PLAN_FIELDS) {
    if (kind === "u4" || kind === "i4" || kind === "u44") {
      const arr = [];
      const n = kind === "u4" || kind === "i4" ? 4 : 16;
      const src = kind === "u44" ? m[name].flat() : m[name];
      for (let i = 0; i < n; i += 1) {
        const v = src[i];
        arr.push(kind[0] === "u" ? (v >>> 0) : (v | 0));
      }
      out[name] = arr;
    } else {
      out[name] = kind === "u" ? (m[name] >>> 0) : (m[name] | 0);
    }
  }
  return out;
}

/* Write an inputs object into wasm memory per the header layout. */
function v16WriteHealInputs(view, at, inp) {
  writeI32(view, at + HEAL_IN_OFF.amount, inp.amount);
  writeI32(view, at + HEAL_IN_OFF.preInitialId, inp.preInitialId);
  writeI32(view, at + HEAL_IN_OFF.preGameNull, inp.preGameNull);
  writeI32(view, at + HEAL_IN_OFF.preEntryFound, inp.preEntryFound);
  writeU32(view, at + HEAL_IN_OFF.preSeed, inp.preSeed);
  writeU32(view, at + HEAL_IN_OFF.preShift1, inp.preShift1);
  writeU32(view, at + HEAL_IN_OFF.preShift2, inp.preShift2);
  writeU32(view, at + HEAL_IN_OFF.preShift3, inp.preShift3);
  writeU32(view, at + HEAL_IN_OFF.anmStateNull, inp.anmStateNull);
  writeU32(view, at + HEAL_IN_OFF.anmState34, inp.anmState34);
  writeU32(view, at + HEAL_IN_OFF.anmA44, inp.anmA44);
  writeU32(view, at + HEAL_IN_OFF.anmNameEq, inp.anmNameEq);
  writeU32(view, at + HEAL_IN_OFF.anmSetResult, inp.anmSetResult);
  writeU32(view, at + HEAL_IN_OFF.playerX340, inp.playerX340);
  for (let i = 0; i < 4; i += 1) {
    writeU32(view, at + HEAL_IN_OFF.playerF350 + 4 * i, inp.playerF350[i]);
    writeU32(view, at + HEAL_IN_OFF.rngF0 + 4 * i, inp.rngF0[i]);
    writeU32(view, at + HEAL_IN_OFF.rngCnt + 4 * i, inp.rngCnt[i]);
    for (let j = 0; j < 4; j += 1) {
      const ij = 4 * i + j;
      writeU32(view, at + HEAL_IN_OFF.anmPosX + 4 * ij, inp.anmPosX[i][j]);
      writeU32(view, at + HEAL_IN_OFF.anmPosY + 4 * ij, inp.anmPosY[i][j]);
      writeU32(view, at + HEAL_IN_OFF.rngV2 + 4 * ij, inp.rngV2[i][j]);
      writeU32(view, at + HEAL_IN_OFF.rngSpawn + 4 * ij, inp.rngSpawn[i][j]);
    }
  }
  writeI32(view, at + HEAL_IN_OFF.tailGame26614, inp.tailGame26614);
  writeU32(view, at + HEAL_IN_OFF.tailCount, inp.tailCount);
  writeU32(view, at + HEAL_IN_OFF.tailFreeFlag, inp.tailFreeFlag);
  for (let i = 0; i < 8; i += 1) {
    writeU32(view, at + HEAL_IN_OFF.tailKind + 4 * i, inp.tailKind[i]);
    writeU32(view, at + HEAL_IN_OFF.tailIsPlayer + 4 * i, inp.tailIsPlayer[i]);
    writeU32(view, at + HEAL_IN_OFF.tailFrozen + 4 * i, inp.tailFrozen[i]);
  }
}

function v16HealInputs(size) {
  const o = (v) => v;
  const inp = {
    amount: 0, preInitialId: 0x1ab, preGameNull: 0, preEntryFound: 0,
    preSeed: 0, preShift1: 2, preShift2: 7, preShift3: 7,
    anmStateNull: 0, anmState34: 0, anmA44: 0, anmNameEq: 0, anmSetResult: 0,
    playerX340: 0, playerF350: [0, 0, 0, 0],
    anmPosX: [], anmPosY: [], rngF0: [0, 0, 0, 0], rngCnt: [0, 0, 0, 0],
    rngV2: [], rngSpawn: [],
    tailGame26614: 0, tailCount: 0, tailFreeFlag: 0,
    tailKind: [], tailIsPlayer: [], tailFrozen: [],
  };
  for (let i = 0; i < 4; i += 1) {
    inp.anmPosX.push([0, 0, 0, 0]);
    inp.anmPosY.push([0, 0, 0, 0]);
    inp.rngV2.push([0, 0, 0, 0]);
    inp.rngSpawn.push([0, 0, 0, 0]);
  }
  for (let i = 0; i < 8; i += 1) {
    inp.tailKind.push(0);
    inp.tailIsPlayer.push(0);
    inp.tailFrozen.push(0);
  }
  return inp;
}

test("v16 HEAL: build + ABI pin", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(),
               PM_UPDATE_PURE_ABI_VERSION);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v16 — HEAL/);
  assert.match(h, /ISAAC_PM_HEAL_VA = 0x007ca2d0/);
  assert.match(h, /ISAAC_PM_HEAL_VA_RET = 0x007ca2d0/);
  assert.match(h, /ISAAC_PM_HEAL_VA_EXIT = 0x007ca7bd/);
  assert.match(h, /ISAAC_PM_HEAL_SFX_PLAY_VA = 0x0092dc30u/);
  assert.match(h, /ISAAC_PM_HEAL_PRE_ID_INITIAL = 0x1ab/);
  assert.match(h, /gfx\/293\.000_UltraGreedCoins\.anm2/);
  assert.match(h, /CrumbleNoDebris/);
  assert.match(h, /0x007792d3/);
  assert.match(h, /0x007a331c/);
  assert.match(h, /0x007ca825/);
  assert.match(h, /typedef struct IsaacPmHealInputs/);
  assert.match(h, /typedef struct IsaacPmHealPlan/);
  /* The v15-next slot is closed. */
  assert.match(h, /SEH heal host — closed in v16/);
});

test("v16 HEAL: entry gate + pre-play id + inner count", () => {
  let cases = 0;
  for (const [amount, want] of [
    [-1, 0], [0, 0], [1, 1], [0x7fffffff, 1], [-0x80000000, 0],
  ]) {
    assert.equal(wasm.isaac_pm_heal_applies(amount), want, `applies ${amount}`);
    assert.equal(wasm.isaac_pm_heal_applies(amount), PM.pmHealApplies(amount));
    cases += 2;
  }
  /* Pre-play id: the caller's slot survives every side-effect-free
     branch; 0x1ab here, never the heartbeat's 0x1fc default. */
  for (const [initial, g, ef, seed, want] of [
    [0x1ab, 1, 0, 0x1234, 0x1ab], /* game null keeps the slot */
    [0x1ab, 0, 0, 0x1234, 0x1ab], /* no entry keeps the slot */
    [0x1ab, 0, 1, 0, 0x25],       /* found id before the seed check */
    [0x1ab, 0, 1, 1, 0x25],       /* xorshift -> not rare */
    [0x1ab, 0, 1, 4, 0x12d],      /* rare (shared law: %20 == 0) */
    [0x1fc, 1, 0, 1, 0x1fc],      /* the heartbeat equivalence */
  ]) {
    const got = wasm.isaac_pm_heal_pre_id(initial, g, ef, seed, 2, 7, 7);
    assert.equal(got, want, `pre ${initial} ${g} ${ef} ${seed}`);
    assert.equal(got, PM.pmHealPreId(initial, g, ef, seed, 2, 7, 7));
    cases += 2;
  }
  /* Cross-pin: with the heartbeat's initial the heal law IS the shared
     pre-play id law on every branch. */
  for (const [g, ef, seed] of [[1, 0, 1], [0, 0, 1], [0, 1, 1], [0, 1, 4], [0, 1, 0]]) {
    assert.equal(
      wasm.isaac_pm_heal_pre_id(0x1fc, g, ef, seed, 2, 7, 7),
      wasm.isaac_pm_pre_play_sound_id(g, ef, seed, 2, 7, 7),
      `cross ${g} ${ef} ${seed}`,
    );
    cases += 1;
  }
  /* Inner count: UNSIGNED mod 6 + 3 (div edx:ecx). */
  for (const [rng, want] of [
    [0, 3], [1, 4], [5, 8], [6, 3], [7, 4], [0xffffffff, 6], [0x80000000, 5],
  ]) {
    assert.equal(wasm.isaac_pm_heal_inner_count(rng >>> 0), want, `inner ${rng}`);
    assert.equal(wasm.isaac_pm_heal_inner_count(rng >>> 0),
                 PM.pmHealInnerCount(rng >>> 0));
    cases += 2;
  }
  assert.ok(cases >= 26, `expected >= 26 cases, got ${cases}`);
});

test("v16 HEAL: f32 formulas bit-exact", () => {
  let cases = 0;
  /* Hand-derived f0 = (u32-as-f64 -> f32) * 2^-32 * 12 + 8. */
  for (const [rng, wantBits] of [
    [0, 0x41000000],          /* 8.0f */
    [0x80000000, 0x41600000], /* 14.0f (2^31 * 2^-32 = 0.5) */
    [0x7fffffff, 0x41600000], /* f32(2^31-1) rounds UP to 2^31 */
    [0xffffffff, 0x41a00000], /* f32(2^32-1) rounds to 2^32 -> 20.0f */
    [0x40000000, 0x41300000], /* 11.0f */
    [0xcccccccd, 0x418ccccd], /* 17.6f */
  ]) {
    assert.equal(wasm.isaac_pm_heal_f0_bits(rng >>> 0), wantBits,
                 `f0 bits 0x${rng.toString(16)}`);
    assert.equal(wasm.isaac_pm_heal_f0_bits(rng >>> 0),
                 PM.pmHealF0Bits(rng >>> 0));
    cases += 2;
  }
  /* v2 = ... * 0.66f + 0.33f. */
  for (const [rng, wantBits] of [
    [0, 0x3ea8f5c3],          /* 0.33f */
    [0x80000000, 0x3f28f5c3], /* 0.5*0.66 = 0.33 -> 0.66f */
    [0xffffffff, 0x3f7d70a4], /* 0.99f */
    [0x40000000, 0x3efd70a4], /* 0.495f */
    [0x0f0f0f0f, 0x3ebcd670], /* 0.36882353f */
  ]) {
    assert.equal(wasm.isaac_pm_heal_v2_bits(rng >>> 0), wantBits,
                 `v2 bits 0x${rng.toString(16)}`);
    assert.equal(wasm.isaac_pm_heal_v2_bits(rng >>> 0),
                 PM.pmHealV2Bits(rng >>> 0));
    cases += 2;
  }
  assert.ok(cases >= 22, `expected >= 22 cases, got ${cases}`);
});

test("v16 HEAL: tail gates + anm set decision", () => {
  let cases = 0;
  /* Tail eligibility — the window bypass is the quirk: with
     game >= 2 AND kind == 1 the window is skipped (je 0x7ca6cb). */
  for (const [g, kind, isp, want] of [
    [0, 1, 0, 0],        /* g<2 -> window runs: (u32)(1-10) huge */
    [1, 0xa, 0, 1],      /* window lo edge */
    [0, 0x3e7, 0, 1],    /* window hi edge (0x3dd) */
    [0, 0x3e8, 0, 0],    /* window hi + 1 */
    [0, 0x9, 0, 0],      /* window lo - 1 (unsigned wrap) */
    [2, 1, 0, 1],        /* window BYPASSED */
    [3, 1, 1, 0],        /* player check still applies */
    [2, 1, 1, 0],
    [0, 0x101, 0, 1],    /* kind is a dword: 0x101 != 1, diff 0xf7 */
    [-0x80000000, 1, 0, 0], /* signed g<2: window runs, kind 1 wraps */
  ]) {
    assert.equal(wasm.isaac_pm_heal_tail_eligible(g, kind >>> 0, isp), want,
                 `tail ${g} ${kind} ${isp}`);
    assert.equal(wasm.isaac_pm_heal_tail_eligible(g, kind >>> 0, isp),
                 PM.pmHealTailEligible(g, kind >>> 0, isp));
    cases += 2;
  }
  /* ANM set decision (0x7ca46a..0x7ca47e). */
  for (const [null_, eq, s34, a44, want] of [
    [1, 0, 0, 0, 1],  /* state null -> set */
    [0, 0, 0, 0, 1],  /* name mismatch -> set */
    [0, 1, 0, 0, 0],  /* match + state34 == 0 -> skip */
    [0, 1, 1, 0, 1],  /* match + state34 != 0 + a44 == 0 -> set */
    [0, 1, 1, 1, 0],  /* a44 already dirty -> skip */
    [0, 1, 0, 1, 0],
    [0, 0x100, 0, 0, 1], /* name_eq AL: 0x100 low byte 0 -> mismatch */
    [0, 1, 0x100, 0, 0], /* state34 AL: 0x100 low byte 0 -> skip */
    [0, 1, 1, 0x100, 1], /* a44 AL: 0x100 low byte 0 -> set */
  ]) {
    assert.equal(wasm.isaac_pm_heal_anm_set(null_ >>> 0, eq >>> 0,
                                            s34 >>> 0, a44 >>> 0), want,
                 `anm ${null_} ${eq} ${s34} ${a44}`);
    assert.equal(wasm.isaac_pm_heal_anm_set(null_ >>> 0, eq >>> 0,
                                            s34 >>> 0, a44 >>> 0),
                 PM.pmHealAnmSet(null_ >>> 0, eq >>> 0, s34 >>> 0, a44 >>> 0));
    cases += 2;
  }
  assert.ok(cases >= 38, `expected >= 38 cases, got ${cases}`);
});

test("v16 HEAL: plan composition (fixed rows)", () => {
  const view = new DataView(wasm.memory.buffer);
  const IN_AT = SCRATCH + 0xe100;   /* 468 B input .. 0xe2d4 */
  const PLAN_AT = SCRATCH + 0xe500; /* disjoint: plan writes must never
                                       clobber input tail fields */
  let cases = 0;

  /* amount 0: the PE jumps straight to the epilogue — zero plan. */
  {
    const inp = v16HealInputs();
    v16WriteHealInputs(view, IN_AT, inp);
    wasm.isaac_pm_heal_plan(IN_AT, PLAN_AT);
    const got = v16ReadHealPlan(view, PLAN_AT);
    const want = v16HealPlanFromModel(PM.pmHealPlan(inp));
    assert.deepEqual(got, want, "zero plan");
    assert.equal(got.applies, 0);
    assert.equal(got.sfxPlay, 0);
    assert.equal(got.spawn1, 0);
    assert.equal(got.retVa >>> 0, 0x007ca2d0);
    cases += 1;
  }

  /* amount -1: same. */
  {
    const inp = v16HealInputs();
    inp.amount = -1;
    v16WriteHealInputs(view, IN_AT, inp);
    wasm.isaac_pm_heal_plan(IN_AT, PLAN_AT);
    const got = v16ReadHealPlan(view, PLAN_AT);
    const want = v16HealPlanFromModel(PM.pmHealPlan(inp));
    assert.deepEqual(got, want, "amount -1");
    assert.equal(got.applies, 0);
    cases += 1;
  }

  /* Full row: pre rare, anm set + rewind, 5 outer (overflow), inner
     count 6 on the first iteration (inner overflow), tail gates. */
  {
    const inp = v16HealInputs();
    inp.amount = 5;
    inp.preGameNull = 0;
    inp.preEntryFound = 1;
    inp.preSeed = 4; /* rare id */
    inp.anmStateNull = 0;
    inp.anmNameEq = 1;
    inp.anmState34 = 1;
    inp.anmA44 = 0;
    inp.anmSetResult = 1;
    inp.playerX340 = 0x3f000000; /* 0.5f */
    inp.playerF350 = [0x41200000, 0, 0, 0];
    inp.anmPosX[0][0] = 0xbf800000; /* -1.0f: addss +0 clears -0 only */
    inp.anmPosY[0][0] = 0x80000000; /* -0.0f -> +0.0f after the add */
    inp.rngF0 = [0, 0x80000000, 0xffffffff, 0x12345678];
    inp.rngCnt = [0, 1, 6, 0xffffffff];
    inp.rngV2[0][0] = 0x40000000;
    inp.rngSpawn[0][0] = 0xdeadbeef;
    inp.tailGame26614 = 3;
    inp.tailCount = 10; /* overflow */
    inp.tailFreeFlag = 0; /* free runs */
    inp.tailKind[0] = 0xa;   /* window eligible */
    inp.tailKind[1] = 1;     /* player -> skipped */
    inp.tailKind[2] = 2;     /* g>=2 && kind!=1: window, diff wraps -> no */
    inp.tailKind[3] = 1;     /* g>=2 && kind==1: window BYPASSED, frozen */
    inp.tailIsPlayer[1] = 1;
    inp.tailFrozen[3] = 0x400;
    v16WriteHealInputs(view, IN_AT, inp);
    wasm.isaac_pm_heal_plan(IN_AT, PLAN_AT);
    const got = v16ReadHealPlan(view, PLAN_AT);
    const want = v16HealPlanFromModel(PM.pmHealPlan(inp));
    assert.deepEqual(got, want, "full row");
    assert.equal(got.preId, 0x12d);
    assert.equal(got.preAdvanced, 1);
    assert.equal(got.anmSetRan, 1);
    assert.equal(got.anmRewindRan, 1);
    assert.equal(got.outerRuns, 4);
    assert.equal(got.outerOverflow, 1);
    assert.equal(got.innerOverflow, 1);
    assert.equal(got.innerCount[0], 3);
    assert.equal(got.innerCount[1], 4);
    assert.equal(got.innerCount[2], 3); /* 6 % 6 == 0 -> 3 */
    assert.equal(got.innerCount[3], 6);
    assert.equal(got.f0[0] >>> 0, 0x41000000);
    assert.equal(got.f0[1] >>> 0, 0x41600000);
    assert.equal(got.f0[2] >>> 0, 0x41a00000);
    assert.equal(got.v2[0] >>> 0, 0x3efd70a4);
    /* -0.0f + 0.0f -> +0.0f: the addss flips the sign. */
    assert.equal(got.spawnPosX[0] >>> 0, 0xbf800000);
    assert.equal(got.spawnPosY[0] >>> 0, 0x00000000);
    assert.equal(got.tailTotal, 8);
    assert.equal(got.tailOverflow, 1);
    assert.equal(got.tailEligible, 2);
    assert.equal(got.tailFrozenCnt, 1);
    assert.equal(got.listFreeRan, 1);
    assert.equal(got.hostDraws >>> 0, 5 * 20);
    assert.equal(got.retVa >>> 0, 0x007ca2d0);
    cases += 1;
  }

  /* Must not trap with a NULL plan / NULL inputs. */
  wasm.isaac_pm_heal_plan(0, PLAN_AT);
  wasm.isaac_pm_heal_plan(IN_AT, 0);
  cases += 2;
  assert.ok(cases >= 5, `expected >= 5 cases, got ${cases}`);
});

test("deterministic randomized differential corpus: HEAL", () => {
  let seed = 0x3e8a2d0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const IN_AT = SCRATCH + 0xe600;   /* 468 B input .. 0xe7d4 */
  const PLAN_AT = SCRATCH + 0xea00; /* disjoint from inputs */
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const inp = v16HealInputs();
    inp.amount = pick(14) - 4; /* -4 .. 9, includes 0 / negative / overflow */
    inp.preInitialId = pick(4) === 0 ? 0x1ab : 0x1fc;
    inp.preGameNull = pick(4) === 0 ? 0x100 : pick(2); /* wide once in a while */
    inp.preEntryFound = pick(2);
    inp.preSeed = rnd();
    inp.preShift1 = rnd(); inp.preShift2 = rnd(); inp.preShift3 = rnd();
    inp.anmStateNull = pick(3) === 0 ? 0x100 : pick(2);
    inp.anmState34 = pick(3) === 0 ? 0x100 : pick(2);
    inp.anmA44 = pick(3) === 0 ? 0x100 : pick(2);
    inp.anmNameEq = pick(3) === 0 ? 0x100 : pick(2);
    inp.anmSetResult = pick(3) === 0 ? 0x100 : pick(2);
    inp.playerX340 = rnd();
    for (let i = 0; i < 4; i += 1) {
      inp.playerF350[i] = rnd();
      inp.rngF0[i] = rnd();
      inp.rngCnt[i] = rnd();
      for (let j = 0; j < 4; j += 1) {
        const ij = 4 * i + j;
        inp.anmPosX[i][j] = rnd();
        inp.anmPosY[i][j] = rnd();
        inp.rngV2[i][j] = rnd();
        inp.rngSpawn[i][j] = rnd();
      }
    }
    inp.tailGame26614 = rnd() | 0;
    inp.tailCount = pick(12);
    inp.tailFreeFlag = pick(4) === 0 ? 0x100 : pick(2);
    const edgeKinds = [1, 0xa, 0x3e7, 0x3e8, 0x9, 0x101];
    for (let i = 0; i < 8; i += 1) {
      inp.tailKind[i] = pick(6) === 0 ? edgeKinds[pick(edgeKinds.length)] : rnd();
      inp.tailIsPlayer[i] = pick(4) === 0 ? 0x100 : pick(2);
      inp.tailFrozen[i] = pick(4) === 0 ? rnd() : pick(2) * 0x400;
    }
    v16WriteHealInputs(view, IN_AT, inp);
    wasm.isaac_pm_heal_plan(IN_AT, PLAN_AT);
    const got = v16ReadHealPlan(view, PLAN_AT);
    const want = v16HealPlanFromModel(PM.pmHealPlan(inp));
    assert.deepEqual(got, want, `trial ${trial}`);
    cases += 1;
    /* scalar cross-checks on the same draws */
    assert.equal(wasm.isaac_pm_heal_applies(inp.amount), PM.pmHealApplies(inp.amount));
    assert.equal(wasm.isaac_pm_heal_inner_count(inp.rngCnt[0] >>> 0),
                 PM.pmHealInnerCount(inp.rngCnt[0] >>> 0));
    assert.equal(wasm.isaac_pm_heal_f0_bits(inp.rngF0[0] >>> 0),
                 PM.pmHealF0Bits(inp.rngF0[0] >>> 0));
    assert.equal(wasm.isaac_pm_heal_v2_bits(inp.rngV2[0][0] >>> 0),
                 PM.pmHealV2Bits(inp.rngV2[0][0] >>> 0));
    assert.equal(wasm.isaac_pm_heal_tail_eligible(inp.tailGame26614, inp.tailKind[0] >>> 0,
                                                  inp.tailIsPlayer[0]),
                 PM.pmHealTailEligible(inp.tailGame26614, inp.tailKind[0] >>> 0,
                                       inp.tailIsPlayer[0]));
    assert.equal(wasm.isaac_pm_heal_anm_set(inp.anmStateNull, inp.anmNameEq,
                                            inp.anmState34, inp.anmA44),
                 PM.pmHealAnmSet(inp.anmStateNull, inp.anmNameEq,
                                 inp.anmState34, inp.anmA44));
    cases += 6;
  }
  assert.ok(cases >= 600, `expected >= 600 cases, got ${cases}`);
});

/* =====================================================================
 * v17 — HEAL-EMIT (0x007ca7c0 burst-emission clamp wrapper; CLOSED).
 * ================================================================= */

const V17_EMIT_CALLSITES = [
  0x758a4d, 0x758b9d, 0x758ef6, 0x759208, 0x778bd1, 0x7975b9,
  0x7c9dda, 0x7cf011, 0x7d3114, 0x7d315c, 0x7daa78, 0x9ba20d,
];

function v17ReadEmitPlan(view, at) {
  return {
    applies: readU32(view, at + 0),
    cap: readI32(view, at + 4),
    store: readU32(view, at + 8),
    excess: readI32(view, at + 12),
    retVa: readU32(view, at + 16),
  };
}

function v17EmitPlanFromModel(p) {
  return {
    applies: p.applies >>> 0,
    cap: p.cap | 0,
    store: p.store >>> 0,
    excess: p.excess | 0,
    retVa: p.retVa >>> 0,
  };
}

test("v17 HEAL-EMIT: build + ABI pin", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(),
               PM_UPDATE_PURE_ABI_VERSION);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v17 — HEAL-EMIT/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_VA_BODY = 0x007ca7c0/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_VA_RET = 0x007ca834/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_BODY_BYTES = 119/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_CALLSITE_COUNT = 12/);
  assert.match(h, /0x758a4d/);
  assert.match(h, /0x9ba20d/);
  assert.match(h, /typedef struct IsaacPmHealEmitPlan/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_PLAN_BYTES = 20/);
  assert.match(h, /CLOSED in v17/);
  assert.match(h, /ISAAC_PM_HEAL_EMIT_VA_NEXT_FUNC = 0x007ca840/);
});

test("v17 HEAL-EMIT: fixed gate / capacity / emit rows", () => {
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xf200;   /* 0xd80 bytes, disjoint from v16 */
  const cases = [];
  const run = (inp) => {
    wasm.isaac_pm_heal_emit_plan(
      inp.game26614, inp.dead173, inp.red194c,
      inp.v1340, inp.v1344, inp.v134c, inp.v1d88,
      inp.emitFlag, inp.retVa, AT);
    const got = v17ReadEmitPlan(view, AT);
    const want = v17EmitPlanFromModel(PM.pmHealEmitPlan(inp));
    assert.deepEqual(got, want, JSON.stringify(inp));
    cases.push(got);
    return got;
  };
  const base = { game26614: 1, dead173: 0, red194c: 10,
                 v1340: 1, v1344: 10, v134c: 5, v1d88: 0,
                 emitFlag: 0, retVa: 0x758a4d };
  /* PE hand-computed rows (python reference, numpy-free): */
  assert.deepEqual(run(base), { applies: 1, cap: 4, store: 1, excess: 6, retVa: 0x758a4d });
  /* flag low byte: 0xff suppresses the heal call, the store still runs */
  assert.deepEqual(run({ ...base, emitFlag: 0xff }),
                   { applies: 1, cap: 4, store: 1, excess: 0, retVa: 0x758a4d });
  /* 0x100 has low byte 0 — the local emits (wide-value discriminator) */
  assert.deepEqual(run({ ...base, emitFlag: 0x100 }),
                   { applies: 1, cap: 4, store: 1, excess: 6, retVa: 0x758a4d });
  /* red == cap / red < cap: nothing stored at all */
  assert.deepEqual(run({ ...base, red194c: 5 }),
                   { applies: 1, cap: 4, store: 1, excess: 1, retVa: 0x758a4d });
  assert.deepEqual(run({ ...base, red194c: 4 }),
                   { applies: 1, cap: 4, store: 0, excess: 0, retVa: 0x758a4d });
  assert.deepEqual(run({ ...base, red194c: 3 }),
                   { applies: 1, cap: 4, store: 0, excess: 0, retVa: 0x758a4d });
  /* game mode: >= 2 signed kills the whole wrapper */
  for (const gm of [2, 3, 0x7fffffff]) {
    assert.deepEqual(run({ ...base, game26614: gm }),
                     { applies: 0, cap: 4, store: 0, excess: 0, retVa: 0x758a4d });
  }
  assert.deepEqual(run({ ...base, game26614: -1 }),
                   { applies: 1, cap: 4, store: 1, excess: 6, retVa: 0x758a4d });
  /* dead byte: 0x100 (hostile value) still passes — PE tests AL only */
  assert.deepEqual(run({ ...base, dead173: 0x100 }),
                   { applies: 1, cap: 4, store: 1, excess: 6, retVa: 0x758a4d });
  assert.deepEqual(run({ ...base, dead173: 0x101 }),
                   { applies: 0, cap: 4, store: 0, excess: 0, retVa: 0x758a4d });
  /* red <= 0 signed */
  for (const rv of [0, -1, -0x80000000]) {
    assert.deepEqual(run({ ...base, red194c: rv }),
                     { applies: 0, cap: 4, store: 0, excess: 0, retVa: 0x758a4d });
  }
  /* tie min: cap(7,7,9,3) = 4 + 5 + 3 = 12; red 20 -> excess 8 */
  assert.deepEqual(run({ ...base, red194c: 20, v1340: 7, v1344: 7, v134c: 9, v1d88: 3 }),
                   { applies: 1, cap: 12, store: 1, excess: 8, retVa: 0x758a4d });
  /* min+1 i32 wrap: cap(0x7fffffff,0x7fffffff,0,0) = 0xc0000000 */
  assert.deepEqual(run({ ...base, red194c: 4, v1340: 0x7fffffff, v1344: 0x7fffffff, v134c: 0, v1d88: 0 }),
                   { applies: 1, cap: -0x40000000, store: 1, excess: 0x40000004, retVa: 0x758a4d });
  /* negative fields: cap(-5,-5,-3,0) = -3; red 1 > -3 -> store, excess 4 */
  assert.deepEqual(run({ ...base, red194c: 1, v1340: -5, v1344: -5, v134c: -3, v1d88: 0 }),
                   { applies: 1, cap: -3, store: 1, excess: 4, retVa: 0x758a4d });
  /* real-world shape: 1d88 = 0x1d88; red 0x1dc0 -> excess 52 */
  assert.deepEqual(run({ ...base, red194c: 0x1dc0, v1d88: 0x1d88 }),
                   { applies: 1, cap: 7564, store: 1, excess: 52, retVa: 0x758a4d });
  /* every censused callsite echoes through ret_va */
  for (const site of V17_EMIT_CALLSITES) {
    assert.deepEqual(run({ ...base, retVa: site }).retVa, site >>> 0);
  }
  assert.ok(cases.length >= 19 + V17_EMIT_CALLSITES.length,
            `expected >= 31 cases, got ${cases.length}`);
});

test("deterministic randomized differential corpus: HEAL-EMIT", () => {
  let seed = 0x7ca7c0 >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xf400;
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const inp = {
      game26614: pick(4) === 0 ? (rnd() | 0) : pick(6) - 1,
      dead173: pick(4) === 0 ? (pick(3) === 0 ? 0x100 : 0x101) : pick(2),
      red194c: pick(5) === 0 ? (rnd() | 0) : pick(12) - 6,
      v1340: pick(4) === 0 ? (rnd() | 0) : pick(14) - 2,
      v1344: pick(4) === 0 ? (rnd() | 0) : pick(14) - 2,
      v134c: pick(4) === 0 ? (rnd() | 0) : pick(14) - 2,
      v1d88: pick(6) === 0 ? (rnd() | 0) : pick(9) - 4,
      emitFlag: pick(6) === 0 ? (pick(2) === 0 ? 0x100 : 0xff) : pick(2),
      retVa: V17_EMIT_CALLSITES[pick(V17_EMIT_CALLSITES.length)],
    };
    wasm.isaac_pm_heal_emit_plan(
      inp.game26614, inp.dead173, inp.red194c,
      inp.v1340, inp.v1344, inp.v134c, inp.v1d88,
      inp.emitFlag, inp.retVa, AT);
    const got = v17ReadEmitPlan(view, AT);
    const want = v17EmitPlanFromModel(PM.pmHealEmitPlan(inp));
    assert.deepEqual(got, want, `trial ${trial}`);
    /* cross-helper agreement: the wrapper capacity IS the td_rvb law */
    assert.equal(got.cap, wasm.isaac_pm_td_rvb_heal_capacity(
      inp.v1340, inp.v1344, inp.v134c, inp.v1d88));
    assert.equal(got.cap, PM.pmTdRvbHealCapacity(
      inp.v1340, inp.v1344, inp.v134c, inp.v1d88));
    assert.equal(got.applies, wasm.isaac_pm_td_rvb_heal_gate(
      inp.game26614, inp.dead173, inp.red194c));
    assert.equal(got.applies, PM.pmTdRvbHealGate(
      inp.game26614, inp.dead173, inp.red194c));
    cases += 5;
  }
  assert.ok(cases >= 3000, `expected >= 3000 cases, got ${cases}`);
});

/* =====================================================================
 * v18 — PM1 walk per-iteration re-derived bounds law (PE 0x009bb616..
 * 0x009bb69e) + TriggerDeath REMOVE-arm vector-mutation pin.
 * ================================================================= */

const V18_WALK_PLAN_OFF = {
  countTop: 0, fatalTop: 4, countSel: 8, elemIndex: 12, cursor: 16,
  countBack: 20, nextIndex: 24, continues: 28, baseReloaded: 32,
};

function v18ReadWalkPlan(view, at) {
  return {
    countTop: readI32(view, at + V18_WALK_PLAN_OFF.countTop),
    fatalTop: readI32(view, at + V18_WALK_PLAN_OFF.fatalTop),
    countSel: readI32(view, at + V18_WALK_PLAN_OFF.countSel),
    elemIndex: readI32(view, at + V18_WALK_PLAN_OFF.elemIndex),
    cursor: readU32(view, at + V18_WALK_PLAN_OFF.cursor),
    countBack: readI32(view, at + V18_WALK_PLAN_OFF.countBack),
    nextIndex: readI32(view, at + V18_WALK_PLAN_OFF.nextIndex),
    continues: readI32(view, at + V18_WALK_PLAN_OFF.continues),
    baseReloaded: readI32(view, at + V18_WALK_PLAN_OFF.baseReloaded),
  };
}

function v18WalkPlanFromModel(p) {
  return {
    countTop: p.countTop | 0,
    fatalTop: p.fatalTop | 0,
    countSel: p.countSel | 0,
    elemIndex: p.elemIndex | 0,
    cursor: p.cursor >>> 0,
    countBack: p.countBack | 0,
    nextIndex: p.nextIndex | 0,
    continues: p.continues | 0,
    baseReloaded: p.baseReloaded | 0,
  };
}

const V18_WALK_PLAN_KEYS = [
  "baseReloaded", "continues", "countBack", "countSel", "countTop",
  "cursor", "elemIndex", "fatalTop", "nextIndex",
];

test("v18 PM-WALK: build + ABI pin + plan census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(),
               PM_UPDATE_PURE_ABI_VERSION);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v18 — PM1 walk per-iteration re-derived bounds law/);
  assert.match(h, /ISAAC_PM_WALK_VA_LOOP_TOP = 0x009bb616/);
  assert.match(h, /ISAAC_PM_WALK_VA_FATAL_RELOAD = 0x009bb636/);
  assert.match(h, /ISAAC_PM_WALK_VA_SELECTOR = 0x009bb63c/);
  assert.match(h, /ISAAC_PM_WALK_VA_TRIGGER_RELOAD = 0x009bb684/);
  assert.match(h, /ISAAC_PM_WALK_VA_LOOP_BACK = 0x009bb68a/);
  assert.match(h, /ISAAC_PM_WALK_GAME_GLOBAL_VA = 0x00c71678/);
  assert.match(h, /ISAAC_PM_WALK_PLAN_BYTES = 36/);
  assert.match(h, /ISAAC_PM_TD_VA_MAIN = 0x007a10f0/);
  assert.match(h, /ISAAC_PM_TD_VA_REMOVE = 0x007a10bd/);
  assert.match(h, /ISAAC_PM_TD_VA_NOOP = 0x007a1ca1/);
  assert.match(h, /ISAAC_PM_TD_REMOVE_STORE_171 = 0x007a10d3/);
  assert.match(h, /typedef struct IsaacPmWalkIterPlan/);
  assert.match(h, /The plan carries NO per-player eligibility or trigger decision/);
  assert.match(h, /0x009bc120/);  /* the REMOVE arm vector call, pinned */
  const s = readFileSync(source, "utf8");
  assert.match(s, /isaac_pm_walk_count_reloaded/);
  assert.match(s, /isaac_pm_walk_iter_plan/);
  assert.match(s, /isaac_pm_td_remove_mutations_vector/);
  assert.equal(PM_WALK_PLAN_BYTES, 36);

  /* Strengthened no-expansion pin: the walk iteration plan census is
     EXACTLY the 9 bounds/cursor/reload fields — no per-player eligibility
     or trigger-decision field exists, so the eligible-mask expansion
     (pre-deciding later iterations from pre-walk packs) stays impossible
     to express here. A model mutant that adds a field changes the census
     and dies; a C++ mutant that grows the struct clobbers the canaries
     below (the test corpus writes the plan with +36/+40 canaries). */
  const sample = PM.pmWalkIterPlan({
    index: 0, begin1: 0, end1: 8, end2: 8, begin2: 0,
    begin3: 0, end3: 8, triggered: 0,
  });
  assert.deepEqual(Object.keys(sample).sort(), V18_WALK_PLAN_KEYS);
  assert.deepEqual(
    PM.pmDeathPlanFromPlayers(0, 0, [
      { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1,
        twinAnim8c: 0 },
    ]).residualKind,
    PM_DEATH_RESIDUAL_WALK /* eligible -> TriggerDeath stays a per-player
                              HOST residual; no pure expansion exists. */,
  );
});

const V18_CANARY_AT = 0xf000;

test("v18 PM-WALK: scalar laws (count reload, top fatal, cursor, loop-back)",
     () => {
  let cases = 0;

  /* count_reloaded: wrapped subtraction + ARITHMETIC shift (sar). A torn
     negative span floors: -8 >> 2 == -2, -1 >> 2 == -1. */
  const countRows = [
    [0x100, 0x100, 0], [8, 0, 2], [0, 8, -2], [0xc, 4, 2],
    [0, 0, 0], [4, 0, 1], [0, 4, -1],
    [0x80000000, 0, -0x20000000], [0xffffffff, 0, -1], [0x7fffffff, 0, 0x1fffffff],
    [-4, 0, -1], [0x100, 0x90, 0x1c],
  ];
  for (const [e, b, want] of countRows) {
    assert.equal(wasm.isaac_pm_walk_count_reloaded(e | 0, b | 0) | 0, want,
                 `count ${e} ${b}`);
    assert.equal(wasm.isaac_pm_walk_count_reloaded(e | 0, b | 0) | 0,
                 PM.pmWalkCountReloaded(e | 0, b | 0) | 0, `count oracle`);
    /* cross-helper differential: the pair law is the v5 span law */
    assert.equal(PM.pmWalkCountReloaded(e | 0, b | 0) | 0,
                 PM.pmPlayerCountFromSpan((e | 0) - (b | 0)) | 0,
                 `span cross-pin ${e} ${b}`);
    cases += 3;
  }
  /* top fatal: keyed to the RELOADED pair, zero count only. */
  for (const [e, b, want] of [
    [0x100, 0x100, 1], [8, 0, 0], [0, 8, 0], [0, 0, 1], [4, 0, 0],
  ]) {
    assert.equal(wasm.isaac_pm_walk_top_fatal(e | 0, b | 0) | 0, want,
                 `fatal ${e} ${b}`);
    assert.equal(wasm.isaac_pm_walk_top_fatal(e | 0, b | 0) | 0,
                 PM.pmWalkTopFatal(e | 0, b | 0) | 0);
    cases += 2;
  }
  /* cursor: begin + selected*4 wraps; OOB index leaves the cursor at the
     vector base (element 0 is dereferenced, never skipped). */
  const cursorRows = [
    [0x1000, 0, 5, 0x1000], [0x1000, 3, 5, 0x100c], [0x1000, 4, 5, 0x1010],
    [0x1000, 7, 5, 0x1000], [0x1000, -1, 5, 0x1000], [0x1000, 3, -1, 0x100c],
    [0xffffffff, 1, 3, 0x3], [0x80000000, 2, 3, 0x80000008],
    /* index*4 wraps: i = 0x20000000 with count > i yields 0x80000000 */
    [0, 0x20000000, 0x20000001, 0x80000000],
    [0x100, 0x20000000, 0x20000001, 0x80000100],
    /* i = 0x7fffffff still in range: cursor base + 0xfffffffc */
    [4, 0x7fffffff, 0x80000001, 0],
  ];
  for (const [b, i, c, want] of cursorRows) {
    assert.equal(wasm.isaac_pm_walk_elem_cursor(b >>> 0, i | 0, c | 0) >>> 0,
                 want >>> 0, `cursor ${b} ${i} ${c}`);
    assert.equal(wasm.isaac_pm_walk_elem_cursor(b >>> 0, i | 0, c | 0) >>> 0,
                 PM.pmWalkElemCursor(b, i, c) >>> 0, `cursor oracle`);
    assert.equal(PM.pmWalkElemCursor(b, i, c) >>> 0,
                 (b + PM.pmPlayerIndexSelect(i, c) * 4) >>> 0,
                 `index-select cross-pin ${b} ${i} ${c}`);
    cases += 3;
  }
  /* loop-back continue: next = i+1 (wrap), unsigned jb against the
     re-derived count. */
  const backRows = [
    [8, 0, 0, 1], [8, 0, 1, 0], [8, 0, 2, 0],
    [-1, 0, 0, 1],               /* count -1 -> u32 huge; 1 < huge */
    [0xffffffff, 0, 0xfffffffe, 0], /* next 0xffffffff !< 0xffffffff */
    [8, 0, 0x7fffffff, 0],       /* next 0x80000000 -> u32 huge */
    [8, 0, -1, 1],               /* i=-1 -> next 0 -> 0 < 2 */
    [0xffffffff, 0, 0, 1],
  ];
  for (const [e, b, i, want] of backRows) {
    assert.equal(wasm.isaac_pm_walk_back_continues(e | 0, b | 0, i | 0) | 0,
                 want, `back ${e} ${b} ${i}`);
    assert.equal(wasm.isaac_pm_walk_back_continues(e | 0, b | 0, i | 0) | 0,
                 PM.pmWalkBackContinues(e | 0, b | 0, i | 0) | 0);
    /* v5 continue law, count supplied by the re-derivation */
    assert.equal(PM.pmWalkBackContinues(e | 0, b | 0, i | 0) | 0,
                 PM.pmWalkContinue(i + 1, PM.pmWalkCountReloaded(e | 0, b | 0)) | 0,
                 `v5 continue cross-pin ${e} ${b} ${i}`);
    cases += 3;
  }
  assert.ok(cases >= 100, `expected >= 100 cases, got ${cases}`);
});

test("v18 PM-WALK: iter plan fixed rows (fatal / trigger / removal / wrap)",
     () => {
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xf200; /* 36 B plan + 8 B canaries, disjoint */
  const set = (off, v) => view.setUint32(off, v >>> 0, true);
  const canary = () => {
    set(AT + 36, 0x5a5a5a5a);
    set(AT + 40, 0xa5a5a5a5);
  };
  const run = (inp) => {
    canary();
    wasm.isaac_pm_walk_iter_plan(
      inp.index | 0, inp.begin1 | 0, inp.end1 | 0, inp.end2 | 0,
      inp.begin2 | 0, inp.begin3 | 0, inp.end3 | 0,
      inp.triggered | 0, AT);
    const got = v18ReadWalkPlan(view, AT);
    const want = v18WalkPlanFromModel(PM.pmWalkIterPlan(inp));
    assert.deepEqual(got, want, JSON.stringify(inp));
    /* struct is EXACTLY 36 B: a 10th field would clobber the canaries */
    assert.equal(view.getUint32(AT + 36, true), 0x5a5a5a5a,
                 "plan overflowed 36 bytes (canary +36)");
    assert.equal(view.getUint32(AT + 40, true), 0xa5a5a5a5,
                 "plan overflowed 36 bytes (canary +40)");
    return got;
  };
  let cases = 0;

  /* skip path: no fatal, no trigger -> the loop-back pair is read from
     the same base (baseReloaded 0). */
  assert.deepEqual(run({ index: 2, begin1: 0x1000, end1: 0x1010,
                         end2: 0x1010, begin2: 0x1000,
                         begin3: 0x1000, end3: 0x1010, triggered: 0 }),
                   { countTop: 4, fatalTop: 0, countSel: 4, elemIndex: 2,
                     cursor: 0x1008, countBack: 4, nextIndex: 3,
                     continues: 1, baseReloaded: 0 });
  cases += 1;

  /* fatal at top: later iterations still run; the end re-read (end2) is
     the 0x009bb630 value, the loop-back base is the reloaded Game. */
  assert.deepEqual(run({ index: 0, begin1: 0x1000, end1: 0x1000,
                         end2: 0x1008, begin2: 0x1000,
                         begin3: 0x2000, end3: 0x2010, triggered: 0 }),
                   { countTop: 0, fatalTop: 1, countSel: 2, elemIndex: 0,
                     cursor: 0x1000, countBack: 4, nextIndex: 1,
                     continues: 1, baseReloaded: 1 });
  cases += 1;

  /* trigger path: REMOVE-class TriggerDeath ran -> reloaded base; the
     vector shrank by one element (0x3000..0x3008). */
  assert.deepEqual(run({ index: 1, begin1: 0x1000, end1: 0x1010,
                         end2: 0x1010, begin2: 0x1000,
                         begin3: 0x3000, end3: 0x3008, triggered: 1 }),
                   { countTop: 4, fatalTop: 0, countSel: 4, elemIndex: 1,
                     cursor: 0x1004, countBack: 2, nextIndex: 2,
                     continues: 0, baseReloaded: 1 });
  cases += 1;

  /* mid-walk removal: i=3, vector lost one element during the body. */
  assert.deepEqual(run({ index: 3, begin1: 0x1000, end1: 0x1010,
                         end2: 0x1010, begin2: 0x1000,
                         begin3: 0x1000, end3: 0x100c, triggered: 1 }),
                   { countTop: 4, fatalTop: 0, countSel: 4, elemIndex: 3,
                     cursor: 0x100c, countBack: 3, nextIndex: 4,
                     continues: 0, baseReloaded: 1 });
  cases += 1;

  /* empty everywhere: the fatal fires on the first pair; the selector
     still reads element 0 of an empty span (cursor = begin2). */
  assert.deepEqual(run({ index: 0, begin1: 0, end1: 0,
                         end2: 0, begin2: 0,
                         begin3: 0, end3: 0, triggered: 0 }),
                   { countTop: 0, fatalTop: 1, countSel: 0, elemIndex: 0,
                     cursor: 0, countBack: 0, nextIndex: 1,
                     continues: 0, baseReloaded: 1 });
  cases += 1;

  /* OOB index: elem_index folds to 0 (cursor = base, element 0 loads). */
  assert.deepEqual(run({ index: 9, begin1: 0x1000, end1: 0x1010,
                         end2: 0x1010, begin2: 0x1000,
                         begin3: 0x1000, end3: 0x1010, triggered: 0 }),
                   { countTop: 4, fatalTop: 0, countSel: 4, elemIndex: 0,
                     cursor: 0x1000, countBack: 4, nextIndex: 10,
                     continues: 0, baseReloaded: 0 });
  cases += 1;

  /* sar bound + cursor wrap: the count is an arithmetic shift of a
     32-bit span, so it can never exceed 2^29-1; a huge-but-valid index
     (0x1ffffffe) keeps elem_index in range and the cursor wraps:
     begin2 4 + 0x1ffffffe*4 = 4 + 0x7ffffff8 = 0x7ffffffc. */
  assert.deepEqual(run({ index: 0x1ffffffe, begin1: 4, end1: 0x80000000,
                         end2: 0x80000000, begin2: 4,
                         begin3: 0, end3: 8, triggered: 0 }),
                   { countTop: 0x1fffffff, fatalTop: 0, countSel: 0x1fffffff,
                     elemIndex: 0x1ffffffe, cursor: 0x7ffffffc, countBack: 2,
                     nextIndex: 0x1fffffff, continues: 0, baseReloaded: 0 });
  cases += 1;

  /* negative span (torn read): counts floor negative; the unsigned
     compares treat them as huge. */
  assert.deepEqual(run({ index: 0, begin1: 0x1000, end1: 0xff8,
                         end2: 0xff8, begin2: 0x1000,
                         begin3: 0x1000, end3: 0xff8, triggered: 0 }),
                   { countTop: -2, fatalTop: 0, countSel: -2, elemIndex: 0,
                     cursor: 0x1000, countBack: -2, nextIndex: 1,
                     continues: 1, baseReloaded: 0 });
  cases += 1;

  /* null plan must not trap. */
  wasm.isaac_pm_walk_iter_plan(0, 0, 0, 0, 0, 0, 0, 0, 0);
  cases += 1;

  assert.ok(cases >= 9, `expected >= 9 cases, got ${cases}`);
});

test("deterministic randomized differential corpus: PM-WALK iter law", () => {
  let seed = 0x9bb68a >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xf600; /* disjoint from the fixed-row block */
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const inp = {
      index: pick(14) - 2,            /* -2 .. 11 */
      begin1: rnd(), end1: rnd(),
      begin2: rnd(), end3: rnd(), begin3: rnd(),
      triggered: pick(2),
    };
    /* the non-fatal path reuses the 0x009bb616 end value; the fatal path
       re-reads it at 0x009bb630. Drive both shapes. */
    inp.end2 = (pick(3) === 0 || inp.end1 === inp.begin2)
      ? rnd() : inp.end1;
    if (pick(4) === 0) {
      /* realistic: equal pairs (empty span) or one-element span */
      inp.begin1 = inp.end1 = rnd();
    }
    wasm.isaac_pm_walk_iter_plan(
      inp.index | 0, inp.begin1 | 0, inp.end1 | 0, inp.end2 | 0,
      inp.begin2 | 0, inp.begin3 | 0, inp.end3 | 0, inp.triggered, AT);
    const got = v18ReadWalkPlan(view, AT);
    const want = v18WalkPlanFromModel(PM.pmWalkIterPlan(inp));
    assert.deepEqual(got, want, `trial ${trial}`);
    /* scalar cross-pins on the same draws */
    assert.equal(got.countTop,
                 wasm.isaac_pm_walk_count_reloaded(inp.end1 | 0,
                                                   inp.begin1 | 0) | 0);
    assert.equal(got.countTop,
                 PM.pmWalkCountReloaded(inp.end1 | 0, inp.begin1 | 0) | 0);
    assert.equal(got.fatalTop,
                 PM.pmWalkTopFatal(inp.end1 | 0, inp.begin1 | 0) | 0);
    assert.equal(got.elemIndex,
                 PM.pmPlayerIndexSelect(inp.index, got.countSel) | 0);
    assert.equal(got.cursor,
                 wasm.isaac_pm_walk_elem_cursor(inp.begin2 >>> 0,
                                                inp.index | 0,
                                                got.countSel | 0) >>> 0);
    assert.equal(got.continues,
                 wasm.isaac_pm_walk_back_continues(inp.end3 | 0,
                                                   inp.begin3 | 0,
                                                   inp.index | 0) | 0);
    assert.equal(got.baseReloaded,
                 (got.fatalTop !== 0 || inp.triggered !== 0) ? 1 : 0);
    cases += 8;
  }
  assert.ok(cases >= 4800, `expected >= 4800 cases, got ${cases}`);
});

test("v18 TD entry: REMOVE mutates the walked vector; CHECK_ONLY is pure",
     () => {
  let cases = 0;
  const kinds = [PM_TD_EARLY_NONE, PM_TD_EARLY_CHECK_ONLY, PM_TD_EARLY_REMOVE];
  for (const k of kinds) {
    assert.equal(wasm.isaac_pm_td_remove_mutations_vector(k) | 0,
                 PM.pmTdRemoveMutationsVector(k) | 0, `kind ${k}`);
    assert.equal(PM.pmTdRemoveMutationsVector(k) | 0,
                 k === PM_TD_EARLY_REMOVE ? 1 : 0);
    cases += 2;
  }
  /* the mutation pin keys to the v6 classifier: only state==1 &&
     !checkOnly (the walk's own call shape) mutates the vector. */
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(1, 0)), 1);
  /* AL of 0x100 is 0 -> the checkOnly arm is NOT taken -> REMOVE. */
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(1, 0x100)), 1);
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(1, 0xff)), 0);
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(0, 0)), 0);
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(2, 0)), 0);
  /* AL of 0x1ff is 0xff != 0 -> checkOnly NOOP arm. */
  assert.equal(PM.pmTdRemoveMutationsVector(PM.pmTdEarlyKind(1, 0x1ff)), 0);
  cases += 6;
  /* the PM1 walk site always pushes checkOnly=false, so its trigger arm
     is REMOVE-class for state==1 players — the vector the walk iterates
     is mutated, hence the mandated re-derived bounds law. */
  assert.equal(PM_DEATH_TRIGGER_ARG_CHECK_ONLY, 0);
  assert.equal(PM.pmTdEarlyKind(1, PM_DEATH_TRIGGER_ARG_CHECK_ONLY),
               PM_TD_EARLY_REMOVE);
  assert.equal(PM.pmTdEarlyPureComplete(
                 PM.pmTdEarlyKind(1, PM_DEATH_TRIGGER_ARG_CHECK_ONLY)),
               false); /* REMOVE is NOT pure-complete */
  cases += 3;
  assert.ok(cases >= 15, `expected >= 15 cases, got ${cases}`);
});

test("v18 cross-helper differential: walk law vs v69 eligible plan", () => {
  /* The eligible-mask plan stays a WALK residual for any eligible player,
     and the iteration law never shrinks or pre-decides it: a row with
     eligible -> plan WALK + the iter plan carries no trigger decision.
     A mutant that turns WALK into NONE (pure expansion) dies here. */
  const players = [
    { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1,
      twinAnim8c: 0 },
  ];
  const plan = PM.pmDeathPlanFromPlayers(0, 0, players);
  assert.equal(plan.residualKind, PM_DEATH_RESIDUAL_WALK);
  assert.equal(plan.pureComplete, false);
  assert.equal(plan.eligibleCount, 1);
  const it = PM.pmWalkIterPlan({
    index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004, begin2: 0x1000,
    begin3: 0x1000, end3: 0x1004, triggered: 1,
  });
  assert.deepEqual(
    Object.keys(it).sort(), V18_WALK_PLAN_KEYS,
    "walk law census unchanged (no trigger-decision field appeared)");
  assert.equal(it.continues, 0); /* one element, next 1 !< 1 */
  assert.equal(it.baseReloaded, 1);
});

/* ================================================================== */
/* v19 PM-TICK: the v18 iter law WIRED into the death-walk residual   */
/* (per-iteration composite: bounds law + LIVE cursor eligibility +   */
/* trigger decision; VA 0x009bb616..0x009bb67d).                      */
/* ================================================================== */

const V19_TICK_PLAN_OFF = {
  countTop: 0, fatalTop: 4, countSel: 8, elemIndex: 12, cursor: 16,
  countBack: 20, nextIndex: 24, continues: 28, baseReloaded: 32,
  cursorEligible: 36, shouldTrigger: 40,
};

function v19ReadTickPlan(view, at) {
  return {
    countTop: readI32(view, at + V19_TICK_PLAN_OFF.countTop),
    fatalTop: readI32(view, at + V19_TICK_PLAN_OFF.fatalTop),
    countSel: readI32(view, at + V19_TICK_PLAN_OFF.countSel),
    elemIndex: readI32(view, at + V19_TICK_PLAN_OFF.elemIndex),
    cursor: readU32(view, at + V19_TICK_PLAN_OFF.cursor),
    countBack: readI32(view, at + V19_TICK_PLAN_OFF.countBack),
    nextIndex: readI32(view, at + V19_TICK_PLAN_OFF.nextIndex),
    continues: readI32(view, at + V19_TICK_PLAN_OFF.continues),
    baseReloaded: readI32(view, at + V19_TICK_PLAN_OFF.baseReloaded),
    cursorEligible: readI32(view, at + V19_TICK_PLAN_OFF.cursorEligible),
    shouldTrigger: readI32(view, at + V19_TICK_PLAN_OFF.shouldTrigger),
  };
}

function v19TickPlanFromModel(p) {
  return {
    countTop: p.countTop | 0,
    fatalTop: p.fatalTop | 0,
    countSel: p.countSel | 0,
    elemIndex: p.elemIndex | 0,
    cursor: p.cursor >>> 0,
    countBack: p.countBack | 0,
    nextIndex: p.nextIndex | 0,
    continues: p.continues | 0,
    baseReloaded: p.baseReloaded | 0,
    cursorEligible: p.cursorEligible | 0,
    shouldTrigger: p.shouldTrigger | 0,
  };
}

const V19_TICK_PLAN_KEYS = [
  "baseReloaded", "continues", "countBack", "countSel", "countTop",
  "cursor", "cursorEligible", "elemIndex", "fatalTop", "nextIndex",
  "shouldTrigger",
];

test("v19 PM-TICK: build + ABI pin + plan census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(),
               PM_UPDATE_PURE_ABI_VERSION);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /typedef struct IsaacPmWalkTickPlan/);
  assert.match(h, /IsaacPmWalkTickPlan/);
  assert.match(h, /isaac_pm_walk_tick_plan/);
  assert.match(h, /0x009bb64a/);   /* cursor element load */
  assert.match(h, /0x009bb67d/);   /* TriggerDeath call site */
  const s = readFileSync(source, "utf8");
  assert.match(s, /isaac_pm_walk_tick_plan/);
  assert.match(s, /isaac_pm_death_player_eligible/);
  assert.equal(PM_WALK_TICK_PLAN_BYTES, 44);

  /* Census: the wired plan is EXACTLY the 9 bounds/cursor/reload fields
     + cursorEligible + shouldTrigger. The v18 iter plan stays 9 fields
     (pinned separately): the wire lives in the new record, not in a
     per-player expansion of the old one. */
  const sample = PM.pmWalkTickPlan({
    index: 0, begin1: 0, end1: 8, end2: 8, begin2: 0, begin3: 0,
    end3: 8, triggered: 0,
    dead: 1, anim7c: 0, anim8c: 0, twinNull: 1, twinAnim7c: 0,
    twinAnim8c: 0,
  });
  assert.deepEqual(Object.keys(sample).sort(), V19_TICK_PLAN_KEYS);
  assert.deepEqual(
    Object.keys(PM.pmWalkIterPlan({
      index: 0, begin1: 0, end1: 8, end2: 8, begin2: 0, begin3: 0,
      end3: 8, triggered: 0,
    })).sort(), V18_WALK_PLAN_KEYS, "v18 iter plan census unchanged");
  /* a 12th field would change the census and die; a C++ struct > 44 B
     clobbers the canaries in the fixed-row test below. */
  assert.equal(PM.pmDeathPlanFromPlayers(0, 0, [
    { anim7c: 0, twinAnim7c: 0, dead173: 1, anim8c: 0, twinNull: 1,
      twinAnim8c: 0 },
  ]).residualKind, PM_DEATH_RESIDUAL_WALK /* TriggerDeath stays host */);
});

test("v19 PM-TICK: fixed rows (trigger / ineligible / wide / OOB / fatal)",
     () => {
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xf800; /* 44 B plan + 8 B canaries, disjoint */
  const set = (off, v) => view.setUint32(off, v >>> 0, true);
  const canary = () => {
    set(AT + 44, 0x5a5a5a5a);
    set(AT + 48, 0xa5a5a5a5);
  };
  const run = (inp) => {
    canary();
    wasm.isaac_pm_walk_tick_plan(
      inp.index | 0, inp.begin1 | 0, inp.end1 | 0, inp.end2 | 0,
      inp.begin2 | 0, inp.begin3 | 0, inp.end3 | 0, inp.triggered | 0,
      inp.dead >>> 0, inp.anim7c | 0, inp.anim8c >>> 0,
      inp.twinNull >>> 0, inp.twinAnim7c | 0, inp.twinAnim8c >>> 0, AT);
    const got = v19ReadTickPlan(view, AT);
    const want = v19TickPlanFromModel(PM.pmWalkTickPlan(inp));
    assert.deepEqual(got, want, JSON.stringify(inp));
    /* struct is EXACTLY 44 B: an extra field clobbers the canaries */
    assert.equal(view.getUint32(AT + 44, true), 0x5a5a5a5a,
                 "tick plan overflowed 44 bytes (canary +44)");
    assert.equal(view.getUint32(AT + 48, true), 0xa5a5a5a5,
                 "tick plan overflowed 44 bytes (canary +48)");
    return got;
  };
  let cases = 0;

  /* plain trigger: dead, idle, twin null -> eligible -> trigger, and the
     iteration continues (i=0, count 2). */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1008, end2: 0x1008,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1008, triggered: 0,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 2, fatalTop: 0, countSel: 2, elemIndex: 0, cursor: 0x1000,
      countBack: 2, nextIndex: 1, continues: 1, baseReloaded: 0,
      cursorEligible: 1, shouldTrigger: 1 });
  cases += 1;

  /* not dead -> no trigger; twin idle still consulted. */
  assert.deepEqual(
    run({ index: 1, begin1: 0x1000, end1: 0x1008, end2: 0x1008,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1008, triggered: 0,
          dead: 0, anim7c: 0x80000000, anim8c: 0, twinNull: 0,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 2, fatalTop: 0, countSel: 2, elemIndex: 1, cursor: 0x1004,
      countBack: 2, nextIndex: 2, continues: 0, baseReloaded: 0,
      cursorEligible: 0, shouldTrigger: 0 });
  cases += 1;

  /* wide dead 0x100: low byte 0 -> NOT dead -> ineligible (never
     pre-mask the Wasm-side argument). */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1004, triggered: 0,
          dead: 0x100, anim7c: 0, anim8c: 0, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }).shouldTrigger, 0);
  cases += 1;

  /* wide anim8c 0x1ff: low byte 0xff -> NOT idle -> ineligible even
     though anim7c == 0 would be idle. */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1004, triggered: 0,
          dead: 1, anim7c: 0x100, anim8c: 0x1ff, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }).shouldTrigger, 0);
  cases += 1;

  /* wide twin_anim8c 0x100: low byte 0 -> twin idle -> eligible. */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1004, triggered: 0,
          dead: 0xffffffff, anim7c: 0x7c, anim8c: 0, twinNull: 0,
          twinAnim7c: 0x7c, twinAnim8c: 0x100 }).shouldTrigger, 1);
  cases += 1;

  /* wide twin_null 0x100: low byte 0 -> twin NOT null -> the twin idle
     test decides (twin busy here -> ineligible). */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1004, triggered: 0,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 0x100,
          twinAnim7c: 0x7c, twinAnim8c: 0x1ff }).shouldTrigger, 0);
  cases += 1;

  /* twin busy (7c != 0 and 8c != 0) -> skip, even though the player
     itself is idle. */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1004, end2: 0x1004,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1004, triggered: 1,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 0,
          twinAnim7c: 0x7c, twinAnim8c: 0x1ff }),
    { countTop: 1, fatalTop: 0, countSel: 1, elemIndex: 0, cursor: 0x1000,
      countBack: 1, nextIndex: 1, continues: 0, baseReloaded: 1,
      cursorEligible: 0, shouldTrigger: 0 });
  cases += 1;

  /* fatal at top: count1 == 0 -> the log fires and the base reloads;
     the selector still runs on the RE-READ pair (end2) and an eligible
     element 0 STILL triggers. */
  assert.deepEqual(
    run({ index: 0, begin1: 0x1000, end1: 0x1000, end2: 0x1008,
          begin2: 0x1000, begin3: 0x2000, end3: 0x2008, triggered: 0,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 0, fatalTop: 1, countSel: 2, elemIndex: 0, cursor: 0x1000,
      countBack: 2, nextIndex: 1, continues: 1, baseReloaded: 1,
      cursorEligible: 1, shouldTrigger: 1 });
  cases += 1;

  /* OOB index (i=9, count 2): the clamp folds elem_index to 0 and the
     LOADED element is element 0 - its live fields decide, and if element
     0 is eligible the PE still triggers (the clamp never skips
     eligibility). */
  assert.deepEqual(
    run({ index: 9, begin1: 0x1000, end1: 0x1008, end2: 0x1008,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1008, triggered: 0,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 2, fatalTop: 0, countSel: 2, elemIndex: 0, cursor: 0x1000,
      countBack: 2, nextIndex: 10, continues: 0, baseReloaded: 0,
      cursorEligible: 1, shouldTrigger: 1 });
  cases += 1;

  /* empty vector everywhere: count_sel == 0, cursor = begin2, element 0
     fields decide (PE dereferences the base). */
  assert.deepEqual(
    run({ index: 0, begin1: 0, end1: 0, end2: 0, begin2: 0,
          begin3: 0, end3: 0, triggered: 0,
          dead: 1, anim7c: 0, anim8c: 0, twinNull: 0,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 0, fatalTop: 1, countSel: 0, elemIndex: 0, cursor: 0,
      countBack: 0, nextIndex: 1, continues: 0, baseReloaded: 1,
      cursorEligible: 1, shouldTrigger: 1 });
  cases += 1;

  /* wrap: i = 0xffffffff -> next 0; count 2 -> continues. */
  assert.deepEqual(
    run({ index: 0xffffffff, begin1: 0x1000, end1: 0x1008, end2: 0x1008,
          begin2: 0x1000, begin3: 0x1000, end3: 0x1008, triggered: 0,
          dead: 0, anim7c: 0, anim8c: 0, twinNull: 1,
          twinAnim7c: 0, twinAnim8c: 0 }),
    { countTop: 2, fatalTop: 0, countSel: 2, elemIndex: 0, cursor: 0x1000,
      countBack: 2, nextIndex: 0, continues: 1, baseReloaded: 0,
      cursorEligible: 0, shouldTrigger: 0 });
  cases += 1;

  /* null plan must not trap. */
  wasm.isaac_pm_walk_tick_plan(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  cases += 1;

  assert.ok(cases >= 12, `expected >= 12 cases, got ${cases}`);
});

test("v19 PM-TICK: deterministic randomized differential corpus", () => {
  let seed = 0x9bb67d >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xfc00; /* disjoint from the v18/v19 fixed blocks */
  const AT2 = SCRATCH + 0xfd00; /* v18 iter plan comparison block */
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const inp = {
      index: pick(14) - 2,            /* -2 .. 11 */
      begin1: rnd(), end1: rnd(),
      begin2: rnd(), end3: rnd(), begin3: rnd(),
      triggered: pick(2),
      dead: pick(2) ? rnd() : pick(2),   /* mostly byte-ish, sometimes wide */
      anim7c: pick(2) ? rnd() : pick(4) - 1,
      anim8c: pick(2) ? rnd() : pick(4) - 1,
      twinNull: pick(2) ? rnd() : pick(2),
      twinAnim7c: pick(2) ? rnd() : pick(4) - 1,
      twinAnim8c: pick(2) ? rnd() : pick(4) - 1,
    };
    /* realistic spans sometimes; end2 = end1 except on the fatal path */
    if (pick(4) === 0) {
      inp.begin1 = inp.end1 = rnd();
    }
    inp.end2 = (pick(3) === 0 || inp.end1 === inp.begin2) ? rnd() : inp.end1;

    wasm.isaac_pm_walk_tick_plan(
      inp.index | 0, inp.begin1 | 0, inp.end1 | 0, inp.end2 | 0,
      inp.begin2 | 0, inp.begin3 | 0, inp.end3 | 0, inp.triggered | 0,
      inp.dead >>> 0, inp.anim7c | 0, inp.anim8c >>> 0,
      inp.twinNull >>> 0, inp.twinAnim7c | 0, inp.twinAnim8c >>> 0, AT);
    const got = v19ReadTickPlan(view, AT);
    const want = v19TickPlanFromModel(PM.pmWalkTickPlan(inp));
    assert.deepEqual(got, want, `trial ${trial}`);

    /* cross-helper differential 1: first 9 fields agree with the v18
       iter plan export on identical inputs (two implementations of the
       same instruction ranges must agree). */
    wasm.isaac_pm_walk_iter_plan(
      inp.index | 0, inp.begin1 | 0, inp.end1 | 0, inp.end2 | 0,
      inp.begin2 | 0, inp.begin3 | 0, inp.end3 | 0, inp.triggered, AT2);
    for (const k of V18_WALK_PLAN_KEYS) {
      assert.equal(got[k], v18ReadWalkPlan(view, AT2)[k],
                   `iter-law cross-pin ${k} trial ${trial}`);
    }

    /* cross-helper differential 2: cursorEligible agrees with the
       standalone eligibility export on the same live fields. */
    assert.equal(got.cursorEligible,
                 wasm.isaac_pm_death_player_eligible(
                   inp.dead >>> 0, inp.anim7c | 0, inp.anim8c >>> 0,
                   inp.twinNull >>> 0, inp.twinAnim7c | 0,
                   inp.twinAnim8c >>> 0) | 0,
                 `eligibility cross-pin trial ${trial}`);
    assert.equal(got.shouldTrigger, got.cursorEligible,
                 `trigger == eligible trial ${trial}`);
    cases += 11 + 9 + 3;
  }
  assert.ok(cases >= 13800, `expected >= 13800 cases, got ${cases}`);
});

/* ================================================================== */
/* v20 PM-CHAIN: PM3 pre-play chain after comiss/jb                   */
/* (VA 0x009bb78e..0x009bb82b). test al,al + PLAY receiver reload.    */
/* ================================================================== */

const V20_CHAIN_PLAN_OFF = {
  residualKind: 0, playing: 4, loud: 8, hostNeeded: 12,
  probeId: 16, probeVa: 20, receiver: 24, receiverReloaded: 28,
  call0Va: 32, call1Va: 36, playId: 40, playIdFromPre: 44,
};

function v20ReadChainPlan(view, at) {
  return {
    residualKind: readI32(view, at + V20_CHAIN_PLAN_OFF.residualKind),
    playing: readI32(view, at + V20_CHAIN_PLAN_OFF.playing),
    loud: readI32(view, at + V20_CHAIN_PLAN_OFF.loud),
    hostNeeded: readI32(view, at + V20_CHAIN_PLAN_OFF.hostNeeded),
    probeId: readU32(view, at + V20_CHAIN_PLAN_OFF.probeId),
    probeVa: readU32(view, at + V20_CHAIN_PLAN_OFF.probeVa),
    receiver: readU32(view, at + V20_CHAIN_PLAN_OFF.receiver),
    receiverReloaded: readI32(view, at + V20_CHAIN_PLAN_OFF.receiverReloaded),
    call0Va: readU32(view, at + V20_CHAIN_PLAN_OFF.call0Va),
    call1Va: readU32(view, at + V20_CHAIN_PLAN_OFF.call1Va),
    playId: readI32(view, at + V20_CHAIN_PLAN_OFF.playId),
    playIdFromPre: readI32(view, at + V20_CHAIN_PLAN_OFF.playIdFromPre),
  };
}

function v20ChainPlanFromModel(p) {
  return {
    residualKind: p.residualKind | 0,
    playing: p.playing | 0,
    loud: p.loud | 0,
    hostNeeded: p.hostNeeded | 0,
    probeId: p.probeId >>> 0,
    probeVa: p.probeVa >>> 0,
    receiver: p.receiver >>> 0,
    receiverReloaded: p.receiverReloaded | 0,
    call0Va: p.call0Va >>> 0,
    call1Va: p.call1Va >>> 0,
    playId: p.playId | 0,
    playIdFromPre: p.playIdFromPre | 0,
  };
}

const V20_CHAIN_PLAN_KEYS = [
  "call0Va", "call1Va", "hostNeeded", "loud", "playId", "playIdFromPre",
  "playing", "probeId", "probeVa", "receiver", "receiverReloaded",
  "residualKind",
];

test("v20 PM-CHAIN: build + ABI pin + plan census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(),
               PM_UPDATE_PURE_ABI_VERSION);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v20 — PM3 pre-play chain/);
  assert.match(h, /typedef struct IsaacPmPrePlayChainPlan/);
  assert.match(h, /isaac_pm_pre_play_chain_plan/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_STOP_PROBE = 0x009bb78e/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_STOP_TEST = 0x009bb793/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_STOP_CALL = 0x009bb7a2/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_UPDATE_PROBE = 0x009bb7ad/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_UPDATE_TEST = 0x009bb7b2/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_SET_VOLUME = 0x009bb7c9/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_SET_PITCH = 0x009bb7dd/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_PLAY_RELOAD = 0x009bb7e8/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_PRE_PLAY = 0x009bb7fa/);
  assert.match(h, /ISAAC_PM_CHAIN_VA_PLAY = 0x009bb82b/);
  assert.match(h, /ISAAC_PM_CHAIN_PLAN_BYTES = 48/);
  assert.match(h, /test al,al/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /isaac_pm_pre_play_chain_plan/);
  assert.match(s, /isaac_pm_chain_playing/);
  assert.match(s, /is_playing & 0xffu/);
  assert.equal(PM_CHAIN_PLAN_BYTES, 48);
  assert.equal(PM_CHAIN_VA_STOP_PROBE, 0x009bb78e);
  assert.equal(PM_CHAIN_VA_STOP_TEST, 0x009bb793);
  assert.equal(PM_CHAIN_VA_STOP_CALL, 0x009bb7a2);
  assert.equal(PM_CHAIN_VA_UPDATE_PROBE, 0x009bb7ad);
  assert.equal(PM_CHAIN_VA_UPDATE_TEST, 0x009bb7b2);
  assert.equal(PM_CHAIN_VA_SET_VOLUME, 0x009bb7c9);
  assert.equal(PM_CHAIN_VA_SET_PITCH, 0x009bb7dd);
  assert.equal(PM_CHAIN_VA_PLAY_RELOAD, 0x009bb7e8);
  assert.equal(PM_CHAIN_VA_PRE_PLAY, 0x009bb7fa);
  assert.equal(PM_CHAIN_VA_PLAY, 0x009bb82b);

  const sample = PM.pmPrePlayChainPlan({
    maxVol: 0, isPlaying: 0, globalPre: 0, globalNow: 0,
  });
  assert.deepEqual(Object.keys(sample).sort(), V20_CHAIN_PLAN_KEYS);
  /* v19 tick census stays 11 keys — this unit does not reopen it. */
  assert.deepEqual(Object.keys(PM.pmWalkTickPlan({
    index: 0, begin1: 0, end1: 8, end2: 8, begin2: 0, begin3: 0,
    end3: 8, triggered: 0,
    dead: 1, anim7c: 0, anim8c: 0, twinNull: 1, twinAnim7c: 0,
    twinAnim8c: 0,
  })).sort(), V19_TICK_PLAN_KEYS);
});

test("v20 PM-CHAIN: fixed rows (NONE/STOP/UPDATE/PLAY + wide + wrap)", () => {
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xfe00;
  const set = (off, v) => view.setUint32(off, v >>> 0, true);
  const canary = () => {
    set(AT + 48, 0x5a5a5a5a);
    set(AT + 52, 0xa5a5a5a5);
  };
  const run = (inp) => {
    canary();
    wasm.isaac_pm_pre_play_chain_plan(
      f32Bits(inp.maxVolBits ?? 0), inp.isPlaying >>> 0,
      inp.globalPre >>> 0, inp.globalNow >>> 0,
      inp.gameNull | 0, inp.entryFound | 0,
      (inp.seed ?? PM_PRE_PLAY_RNG_SEED_DEFAULT) >>> 0,
      (inp.shift1 ?? 2) >>> 0, (inp.shift2 ?? 7) >>> 0,
      (inp.shift3 ?? 7) >>> 0, AT);
    const got = v20ReadChainPlan(view, AT);
    const want = v20ChainPlanFromModel(PM.pmPrePlayChainPlan({
      maxVol: f32Bits(inp.maxVolBits ?? 0),
      isPlaying: inp.isPlaying,
      globalPre: inp.globalPre, globalNow: inp.globalNow,
      gameNull: inp.gameNull, entryFound: inp.entryFound,
      seed: inp.seed ?? PM_PRE_PLAY_RNG_SEED_DEFAULT,
      shift1: inp.shift1 ?? 2, shift2: inp.shift2 ?? 7,
      shift3: inp.shift3 ?? 7,
    }));
    assert.deepEqual(got, want, JSON.stringify(inp));
    assert.equal(view.getUint32(AT + 48, true), 0x5a5a5a5a,
                 "chain plan overflowed 48 bytes (canary +48)");
    assert.equal(view.getUint32(AT + 52, true), 0xa5a5a5a5,
                 "chain plan overflowed 48 bytes (canary +52)");
    return got;
  };
  let cases = 0;
  const PRE = 0x10000000;
  const NOW = 0x20000000;
  const PRE_R = (PRE + 0x2a324) >>> 0;
  const NOW_R = (NOW + 0x2a324) >>> 0;

  /* quiet + not playing -> NONE. Probe still 0x92e560 / 0x1fc.
     Receiver is the PRE-comiss global (no PLAY reload). */
  assert.deepEqual(
    run({ maxVolBits: 0, isPlaying: 0, globalPre: PRE, globalNow: NOW,
          gameNull: 0, entryFound: 0 }),
    { residualKind: PM_INTENSITY_SFX_RESIDUAL_NONE, playing: 0, loud: 0,
      hostNeeded: 0, probeId: 0x1fc, probeVa: 0x0092e560,
      receiver: PRE_R, receiverReloaded: 0, call0Va: 0, call1Va: 0,
      playId: 0x1fc, playIdFromPre: 0 });
  cases += 1;

  /* quiet + playing -> STOP. call0 = Stop, receiver PRE. */
  assert.deepEqual(
    run({ maxVolBits: 0, isPlaying: 1, globalPre: PRE, globalNow: NOW,
          gameNull: 0, entryFound: 0 }),
    { residualKind: PM_INTENSITY_SFX_RESIDUAL_STOP, playing: 1, loud: 0,
      hostNeeded: 1, probeId: 0x1fc, probeVa: 0x0092e560,
      receiver: PRE_R, receiverReloaded: 0, call0Va: 0x0092e230, call1Va: 0,
      playId: 0x1fc, playIdFromPre: 0 });
  cases += 1;

  /* loud + playing -> UPDATE. Volume then Pitch; receiver PRE. */
  assert.deepEqual(
    run({ maxVolBits: PM_INTENSITY_F32_ONE_BITS, isPlaying: 1,
          globalPre: PRE, globalNow: NOW, gameNull: 0, entryFound: 0 }),
    { residualKind: PM_INTENSITY_SFX_RESIDUAL_UPDATE, playing: 1, loud: 1,
      hostNeeded: 1, probeId: 0x1fc, probeVa: 0x0092e560,
      receiver: PRE_R, receiverReloaded: 0,
      call0Va: 0x0092df40, call1Va: 0x0092e050,
      playId: 0x1fc, playIdFromPre: 0 });
  cases += 1;

  /* loud + not playing + game_null -> PLAY, id stays 0x1fc (PMP skip),
     receiver is the RELOADED global. */
  assert.deepEqual(
    run({ maxVolBits: PM_INTENSITY_F32_ONE_BITS, isPlaying: 0,
          globalPre: PRE, globalNow: NOW, gameNull: 1, entryFound: 0 }),
    { residualKind: PM_INTENSITY_SFX_RESIDUAL_PLAY, playing: 0, loud: 1,
      hostNeeded: 1, probeId: 0x1fc, probeVa: 0x0092e560,
      receiver: NOW_R, receiverReloaded: 1,
      call0Va: 0x00956780, call1Va: 0x0092dc30,
      playId: 0x1fc, playIdFromPre: 1 });
  cases += 1;

  /* loud + not playing + entry found + default seed -> PLAY, id 0x25. */
  assert.deepEqual(
    run({ maxVolBits: PM_INTENSITY_F32_ONE_BITS, isPlaying: 0,
          globalPre: PRE, globalNow: NOW, gameNull: 0, entryFound: 1,
          seed: 1 }),
    { residualKind: PM_INTENSITY_SFX_RESIDUAL_PLAY, playing: 0, loud: 1,
      hostNeeded: 1, probeId: 0x1fc, probeVa: 0x0092e560,
      receiver: NOW_R, receiverReloaded: 1,
      call0Va: 0x00956780, call1Va: 0x0092dc30,
      playId: PM.pmPrePlaySoundId({ gameNull: 0, entryFound: 1, seed: 1,
                                    shift1: 2, shift2: 7, shift3: 7 }),
      playIdFromPre: 1 });
  cases += 1;

  /* wide isPlaying 0x100: low byte 0 -> NOT playing. Quiet -> NONE
     (the v3 residual kind on the unmasked dword would be STOP). */
  assert.deepEqual(
    run({ maxVolBits: 0, isPlaying: 0x100, globalPre: PRE, globalNow: NOW,
          gameNull: 0, entryFound: 0 }).residualKind,
    PM_INTENSITY_SFX_RESIDUAL_NONE);
  cases += 1;

  /* wide isPlaying 0x1ff: low byte 0xff -> playing. Quiet -> STOP. */
  assert.deepEqual(
    run({ maxVolBits: 0, isPlaying: 0x1ff, globalPre: PRE, globalNow: NOW,
          gameNull: 0, entryFound: 0 }).residualKind,
    PM_INTENSITY_SFX_RESIDUAL_STOP);
  cases += 1;

  /* wide isPlaying 0x100 + loud -> PLAY (not UPDATE). Receiver reloads. */
  {
    const got = run({ maxVolBits: PM_INTENSITY_F32_ONE_BITS,
                      isPlaying: 0x100, globalPre: PRE, globalNow: NOW,
                      gameNull: 1, entryFound: 0 });
    assert.equal(got.residualKind, PM_INTENSITY_SFX_RESIDUAL_PLAY);
    assert.equal(got.playing, 0);
    assert.equal(got.receiverReloaded, 1);
    assert.equal(got.receiver, NOW_R);
  }
  cases += 1;

  /* 32-bit wrap of the reloaded receiver. */
  {
    const got = run({ maxVolBits: PM_INTENSITY_F32_ONE_BITS, isPlaying: 0,
                      globalPre: 0xfffffff0, globalNow: 0xfffffff0,
                      gameNull: 1, entryFound: 0 });
    assert.equal(got.receiver, (0xfffffff0 + 0x2a324) >>> 0);
    assert.equal(got.receiverReloaded, 1);
  }
  cases += 1;

  /* NaN maxVol is unordered comiss -> loud -> PLAY when not playing. */
  {
    const got = run({ maxVolBits: 0x7fc00000, isPlaying: 0,
                      globalPre: PRE, globalNow: NOW,
                      gameNull: 1, entryFound: 0 });
    assert.equal(got.loud, 1);
    assert.equal(got.residualKind, PM_INTENSITY_SFX_RESIDUAL_PLAY);
  }
  cases += 1;

  /* threshold bits 0x3c23d70a exactly: ordered equal -> NOT loud. */
  assert.equal(
    run({ maxVolBits: PM_INTENSITY_F32_THRESHOLD_BITS, isPlaying: 0,
          globalPre: PRE, globalNow: NOW, gameNull: 0, entryFound: 0
        }).loud, 0);
  cases += 1;

  /* scalar: chain_playing wide drives. */
  assert.equal(wasm.isaac_pm_chain_playing(0), 0);
  assert.equal(wasm.isaac_pm_chain_playing(1), 1);
  assert.equal(wasm.isaac_pm_chain_playing(0x100), 0);
  assert.equal(wasm.isaac_pm_chain_playing(0x1ff), 1);
  assert.equal(pmChainPlaying(0x100), 0);
  assert.equal(pmChainPlaying(0x1ff), 1);
  cases += 1;

  /* receiver_reloaded only on PLAY. */
  assert.equal(wasm.isaac_pm_chain_receiver_reloaded(
    PM_INTENSITY_SFX_RESIDUAL_PLAY), 1);
  assert.equal(wasm.isaac_pm_chain_receiver_reloaded(
    PM_INTENSITY_SFX_RESIDUAL_STOP), 0);
  assert.equal(wasm.isaac_pm_chain_receiver_reloaded(
    PM_INTENSITY_SFX_RESIDUAL_UPDATE), 0);
  assert.equal(wasm.isaac_pm_chain_receiver_reloaded(
    PM_INTENSITY_SFX_RESIDUAL_NONE), 0);
  cases += 1;

  /* null plan must not trap. */
  wasm.isaac_pm_pre_play_chain_plan(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  cases += 1;

  assert.ok(cases >= 14, `expected >= 14 cases, got ${cases}`);
});

test("v20 PM-CHAIN: deterministic randomized differential corpus", () => {
  let seed = 0x9bb78e >>> 0;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xff00;
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const inp = {
      maxVol: f32Bits(pick(3) === 0 ? rnd() : (pick(2) ? 0 : PM_INTENSITY_F32_ONE_BITS)),
      isPlaying: pick(2) ? rnd() : pick(2),
      globalPre: rnd(),
      globalNow: rnd(),
      gameNull: pick(2),
      entryFound: pick(2),
      seed: rnd(),
      shift1: pick(2) ? rnd() : 2,
      shift2: pick(2) ? rnd() : 7,
      shift3: pick(2) ? rnd() : 7,
    };
    wasm.isaac_pm_pre_play_chain_plan(
      inp.maxVol, inp.isPlaying >>> 0, inp.globalPre >>> 0,
      inp.globalNow >>> 0, inp.gameNull | 0, inp.entryFound | 0,
      inp.seed >>> 0, inp.shift1 >>> 0, inp.shift2 >>> 0,
      inp.shift3 >>> 0, AT);
    const got = v20ReadChainPlan(view, AT);
    const want = v20ChainPlanFromModel(PM.pmPrePlayChainPlan(inp));
    assert.deepEqual(got, want, `trial ${trial}`);

    /* cross-pin: playing == low-byte of isPlaying. */
    assert.equal(got.playing, wasm.isaac_pm_chain_playing(inp.isPlaying >>> 0));
    /* cross-pin: residual kind agrees with the v3 kind on the MASKED flag. */
    assert.equal(got.residualKind,
                 wasm.isaac_pm_intensity_sfx_residual_kind(
                   inp.maxVol, got.playing));
    /* cross-pin: PLAY playId agrees with standalone PMP. */
    if (got.residualKind === PM_INTENSITY_SFX_RESIDUAL_PLAY) {
      assert.equal(got.playId, wasm.isaac_pm_pre_play_sound_id(
        inp.gameNull | 0, inp.entryFound | 0, inp.seed >>> 0,
        inp.shift1 >>> 0, inp.shift2 >>> 0, inp.shift3 >>> 0));
      assert.equal(got.receiverReloaded, 1);
    } else {
      assert.equal(got.playIdFromPre, 0);
      assert.equal(got.receiverReloaded, 0);
      assert.equal(got.playId, 0x1fc);
    }
    /* probe ALWAYS 0x92e560 / 0x1fc. */
    assert.equal(got.probeVa, 0x0092e560);
    assert.equal(got.probeId, 0x1fc);
    cases += 12 + 6;
  }
  assert.ok(cases >= 10800, `expected >= 10800 cases, got ${cases}`);
});


test("v21 ABH: build + ABI pin + prefix census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v21 — ABH/);
  assert.match(h, /ISAAC_PM_ABH_VA_BODY = 0x007ca840/);
  assert.match(h, /ISAAC_PM_ABH_VA_RET_TWIN = 0x007ca89c/);
  assert.match(h, /ISAAC_PM_ABH_VA_RET_HT2 = 0x007ca9f8/);
  assert.match(h, /ISAAC_PM_ABH_VA_NEXT_FUNC = 0x007caa00/);
  assert.match(h, /ISAAC_PM_ABH_BODY_BYTES = 443/);
  assert.match(h, /ISAAC_PM_ABH_CALLSITE_COUNT = 34/);
  assert.match(h, /ISAAC_PM_ABH_PLAN_BYTES = 44/);
  assert.match(h, /ISAAC_PM_ABH_WALK_CHAR = 0x28/);
  assert.match(h, /ISAAC_PM_ABH_ESAU_CHAR = 0x11/);
  assert.match(h, /typedef struct IsaacPmAbhPlan/);
  const sample = PM.pmAbhPrefixPlan({ charType13c0: 0 });
  assert.deepEqual(Object.keys(sample).sort(), [
    "healthType", "hops11", "hops28", "hostNeeded", "htProbes",
    "nextHostVa", "pureComplete", "residualKind", "retVa",
    "walkTerminated", "walkedAddr",
  ]);
});

function v21ReadAbhPlan(view, at) {
  return {
    walkedAddr: view.getUint32(at + 0, true),
    walkTerminated: view.getInt32(at + 4, true),
    hops28: view.getInt32(at + 8, true),
    hops11: view.getInt32(at + 12, true),
    healthType: view.getInt32(at + 16, true),
    htProbes: view.getInt32(at + 20, true),
    residualKind: view.getInt32(at + 24, true),
    pureComplete: view.getInt32(at + 28, true),
    hostNeeded: view.getInt32(at + 32, true),
    retVa: view.getUint32(at + 36, true),
    nextHostVa: view.getUint32(at + 40, true),
  };
}

function v21AbhFromModel(p) {
  return {
    walkedAddr: p.walkedAddr >>> 0,
    walkTerminated: p.walkTerminated | 0,
    hops28: p.hops28 | 0,
    hops11: p.hops11 | 0,
    healthType: p.healthType | 0,
    htProbes: p.htProbes | 0,
    residualKind: p.residualKind | 0,
    pureComplete: p.pureComplete | 0,
    hostNeeded: p.hostNeeded | 0,
    retVa: p.retVa >>> 0,
    nextHostVa: p.nextHostVa >>> 0,
  };
}

test("v21 ABH: fixed rows (ht2/ht3/twin/hard/neg/pos + wide chars)", () => {
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xee00;
  const run = (charType, twin, game, amount) => {
    view.setUint32(AT + 44, 0x5a5a5a5a, true);
    view.setUint32(AT + 48, 0xa5a5a5a5, true);
    wasm.isaac_pm_abh_prefix_plan(charType >>> 0, twin >>> 0, game | 0, amount | 0, AT);
    const got = v21ReadAbhPlan(view, AT);
    const want = v21AbhFromModel(PM.pmAbhPrefixPlan({
      charType13c0: charType, twin1d98: twin, game26614: game, amount,
    }));
    assert.deepEqual(got, want, JSON.stringify({ charType, twin, game, amount }));
    assert.equal(view.getUint32(AT + 44, true), 0x5a5a5a5a, "abh plan overflow +44");
    assert.equal(view.getUint32(AT + 48, true), 0xa5a5a5a5, "abh plan overflow +48");
    return got;
  };
  let cases = 0;
  /* char 0x28 with scalar prefix (no walk): table ht=2 -> EARLY_HT2. */
  assert.equal(run(0x28, 0, 0, 1).residualKind, 1);
  assert.equal(run(0x28, 0, 0, 1).htProbes, 1);
  assert.equal(run(0x28, 0, 0, 1).retVa, 0x007ca9f8);
  cases += 3;
  /* wide 0x128 is NOT a 0x28 walker; not ht2. */
  assert.notEqual(run(0x128, 0, 0, 1).residualKind, 1);
  cases += 1;
  /* char 0x11 null twin -> EARLY_TWIN (ht of 0x11 is 1, not 2/3). */
  {
    const g = run(0x11, 0, 0, 1);
    assert.equal(g.residualKind, 3);
    assert.equal(g.retVa, 0x007ca89c);
    assert.equal(g.htProbes, 2);
  }
  cases += 1;
  /* char 0x111 is NOT Esau. */
  assert.notEqual(run(0x111, 0, 0, 1).residualKind, 3);
  cases += 1;
  /* char 0x11 with twin -> ESAU_HOP. */
  assert.equal(run(0x11, 0x1234, 0, 1).residualKind, 8);
  cases += 1;
  /* ht3 soul: char 0xe / 0x21. amount<=0 EARLY_HT3; amount>0 HOST_HT3. */
  assert.equal(run(0xe, 0, 0, 0).residualKind, 2);
  assert.equal(run(0xe, 0, 0, -1).residualKind, 2);
  assert.equal(run(0xe, 0, 0, 1).residualKind, 4);
  assert.equal(run(0xe, 0, 0, 1).nextHostVa, 0x007599d0);
  cases += 4;
  /* non-ht2/3, non-esau, game>=2 -> HOST_HARD even if amount==0. */
  assert.equal(run(0, 0, 2, 0).residualKind, 5);
  assert.equal(run(0, 0, 2, 0).nextHostVa, 0x007cacb0);
  cases += 2;
  /* game < 2, amount < 0 -> HOST_NEG. */
  assert.equal(run(0, 0, 1, -3).residualKind, 6);
  cases += 1;
  /* game < 2, amount >= 0 -> HOST_POS (including 0). */
  assert.equal(run(0, 0, 1, 0).residualKind, 7);
  assert.equal(run(0, 0, 1, 4).residualKind, 7);
  assert.equal(run(0, 0, 1, 4).nextHostVa, 0x007cae60);
  cases += 3;
  /* INT_MIN game is < 2 signed -> not hard. */
  assert.equal(run(0, 0, -0x80000000, 1).residualKind, 7);
  cases += 1;
  /* INT_MIN amount is neg. */
  assert.equal(run(0, 0, 0, -0x80000000).residualKind, 6);
  cases += 1;
  /* wide 0x100 / 0x1ff / 0xffffffff chars. */
  run(0x100, 0, 0, 1); run(0x1ff, 0, 0, 1); run(0xffffffff, 0, 0, 1);
  cases += 3;
  /* scalars */
  assert.equal(wasm.isaac_pm_abh_walk_engaged(0x28), 1);
  assert.equal(wasm.isaac_pm_abh_walk_engaged(0x128), 0);
  assert.equal(wasm.isaac_pm_abh_esau_engaged(0x11), 1);
  assert.equal(wasm.isaac_pm_abh_esau_engaged(0x111), 0);
  assert.equal(wasm.isaac_pm_abh_esau_engaged(0x11),
               wasm.isaac_pm_c0t_walk_engaged(0x11));
  assert.equal(wasm.isaac_pm_abh_game_hard(2), 1);
  assert.equal(wasm.isaac_pm_abh_game_hard(1), 0);
  assert.equal(wasm.isaac_pm_abh_game_hard(1),
               wasm.isaac_pm_ghl_gate_lt2(1) === 0 ? 1 : 0);
  assert.equal(wasm.isaac_pm_abh_amount_neg(-1), 1);
  assert.equal(wasm.isaac_pm_abh_amount_neg(0), 0);
  wasm.isaac_pm_abh_prefix_plan(0, 0, 0, 0, 0); /* null plan */
  cases += 8;
  assert.ok(cases >= 14, `expected >= 14 cases, got ${cases}`);
});

test("v21 ABH: memory walk 0x28/0x1e68 + 0x11 restart + cycle cap", () => {
  const view = new DataView(wasm.memory.buffer);
  const P_BASE = SCRATCH + 0x30000;
  const P_STRIDE = 0x2000;
  const pAddr = (i) => P_BASE + i * P_STRIDE;
  const setPlayer = (i, charType, twin28, twin11) => {
    const a = pAddr(i);
    view.setInt32(a + 0x13c0, charType | 0, true);
    view.setUint32(a + 0x1e68, twin28 < 0 ? 0 : pAddr(twin28), true);
    view.setUint32(a + 0x1d98, twin11 < 0 ? 0 : pAddr(twin11), true);
  };
  const AT = SCRATCH + 0xed00;
  const runPre = (start, game, amount, cap) => {
    wasm.isaac_pm_abh_run_pre(pAddr(start), game | 0, amount | 0, cap | 0, AT);
    return v21ReadAbhPlan(view, AT);
  };
  /* Non-0x28 start, char 0 -> HOST_POS when game lt2 amount>=0. */
  setPlayer(0, 0, -1, -1);
  assert.equal(runPre(0, 0, 1, 8).residualKind, 7);
  /* 0x28 with null 0x1e68 twin: ht=2 EARLY_HT2. */
  setPlayer(0, 0x28, -1, -1);
  {
    const g = runPre(0, 0, 1, 8);
    assert.equal(g.residualKind, 1);
    assert.equal(g.walkedAddr, pAddr(0));
    assert.equal(g.htProbes, 1);
  }
  /* 0x28 hops onto non-walker char 0. */
  setPlayer(0, 0x28, 1, -1);
  setPlayer(1, 0, -1, -1);
  {
    const g = runPre(0, 0, 1, 8);
    assert.equal(g.hops28, 1);
    assert.equal(g.walkedAddr, pAddr(1));
    assert.equal(g.residualKind, 7);
  }
  /* 0x11 restart: 0x28 -> char 0x11 with twin -> lands on twin. */
  setPlayer(0, 0x28, 1, -1);
  setPlayer(1, 0x11, -1, 2);
  setPlayer(2, 0, -1, -1);
  {
    const g = runPre(0, 0, 1, 8);
    assert.equal(g.hops28, 1);
    assert.equal(g.hops11, 1);
    assert.equal(g.walkedAddr, pAddr(2));
  }
  /* Cycle of 0x28 self-twin: cap reports WALK_CAP. */
  setPlayer(0, 0x28, 0, -1);
  {
    const w = wasm.isaac_pm_abh_walk_28(pAddr(0), 4) >>> 0;
    assert.equal(w, 0);
    const g = runPre(0, 0, 1, 4);
    assert.equal(g.residualKind, 0);
    assert.equal(g.walkTerminated, 0);
  }
  /* Cross-pin esau vs C0T. */
  assert.equal(wasm.isaac_pm_abh_esau_engaged(0x11),
               wasm.isaac_pm_c0t_walk_engaged(0x11));
  /* Cross-pin game_hard vs ghl/ubh. */
  for (const g of [0, 1, 2, -1, 0x7fffffff, -0x80000000]) {
    const hard = wasm.isaac_pm_abh_game_hard(g | 0);
    assert.equal(hard, wasm.isaac_pm_ghl_gate_lt2(g | 0) === 0 ? 1 : 0);
    assert.equal(hard, wasm.isaac_pm_ubh_gate(g | 0) === 0 ? 1 : 0);
  }
});

test("v21 ABH: deterministic randomized differential corpus", () => {
  let seed = 0x007ca840 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const AT = SCRATCH + 0xec00;
  let cases = 0;
  const chars = [0, 0x11, 0x28, 0xe, 0x21, 0x10, 0xa, 0x128, 0x111, 0x1ff, 0xffffffff];
  for (let trial = 0; trial < 400; trial += 1) {
    const charType = pick(3) === 0 ? rnd() : chars[pick(chars.length)];
    const twin = pick(2) ? 0 : rnd();
    const game = pick(3) === 0 ? (pick(2) ? -0x80000000 : 0x7fffffff) : (pick(4) - 1);
    const amount = pick(3) === 0 ? (pick(2) ? -0x80000000 : 0) : (pick(7) - 3);
    wasm.isaac_pm_abh_prefix_plan(charType >>> 0, twin >>> 0, game | 0, amount | 0, AT);
    const got = v21ReadAbhPlan(view, AT);
    const want = v21AbhFromModel(PM.pmAbhPrefixPlan({
      charType13c0: charType, twin1d98: twin, game26614: game, amount,
    }));
    assert.deepEqual(got, want, `trial ${trial}`);
    assert.equal(got.hostNeeded, got.pureComplete ? 0 : (got.residualKind === 8 || got.residualKind === 0 ? 0 : 1));
    /* game_hard cross-pin */
    if (got.residualKind === 5 || got.residualKind === 6 || got.residualKind === 7) {
      assert.equal(wasm.isaac_pm_abh_game_hard(game | 0),
                   wasm.isaac_pm_ghl_gate_lt2(game | 0) === 0 ? 1 : 0);
    }
    cases += 4;
  }
  assert.ok(cases >= 1600, `expected >= 1600 cases, got ${cases}`);
});

/* ====================================================================== */
/* v22 — GHT: VA 0x007caa00 GetHeartLimit sibling (address-stable;       */
/* "GetHeartLimit" registration evidence only). PURE predicate.          */
/* ====================================================================== */

function v22ReadGhtPlan(view, at) {
  return {
    walkedAddr: view.getUint32(at + 0, true),
    walkTerminated: view.getInt32(at + 4, true),
    hops28: view.getInt32(at + 8, true),
    hops11: view.getInt32(at + 12, true),
    healthType: view.getInt32(at + 16, true),
    char11Gate: view.getInt32(at + 20, true),
    limit: view.getInt32(at + 24, true),
    halfLeft: view.getInt32(at + 28, true),
    halfRight: view.getInt32(at + 32, true),
    result: view.getInt32(at + 36, true),
    retVa: view.getUint32(at + 40, true),
  };
}

function v22GhtFromModel(p) {
  return {
    walkedAddr: p.walkedAddr >>> 0,
    walkTerminated: p.walkTerminated | 0,
    hops28: p.hops28 | 0,
    hops11: p.hops11 | 0,
    healthType: p.healthType | 0,
    char11Gate: p.char11Gate | 0,
    limit: p.limit | 0,
    halfLeft: p.halfLeft | 0,
    halfRight: p.halfRight | 0,
    result: p.result | 0,
    retVa: p.retVa >>> 0,
  };
}

function v22GhtModelFromMemory(view, base, startAddr, game26614, probes, walkCap = 32) {
  /* Build the players Map straight from wasm memory so the JS oracle
     reads the same bytes the wasm plan reads. */
  const players = new Map();
  const seen = new Set();
  const read = (addr, off) => view.getInt32(addr + off, true);
  const getOrMake = (addr) => {
    const a = addr >>> 0;
    let o = players.get(a);
    if (!o) {
      o = { char: 0, twin1e68: 0, twin1d98: 0, v1340: 0, v1d88: 0,
            v2c: 0, coins1368: 0, v1da0: 0 };
      players.set(a, o);
    }
    return o;
  };
  /* follow the same walk the PE does, materializing every visited slot */
  let cur = startAddr >>> 0;
  let guard = 0;
  while (guard++ < 64) {
    if (seen.has(cur)) break;
    seen.add(cur);
    const o = getOrMake(cur);
    o.char = read(cur, 0x13c0);
    o.twin1e68 = read(cur, 0x1e68);
    o.twin1d98 = read(cur, 0x1d98);
    o.v1340 = read(cur, 0x1340);
    o.v1d88 = read(cur, 0x1d88);
    o.v2c = read(cur, 0x2c);
    o.coins1368 = read(cur, 0x1368);
    o.v1da0 = read(cur, 0x1da0);
    const ch = o.char >>> 0;
    if (ch === 0x28 && o.twin1e68 !== 0) { cur = o.twin1e68 >>> 0; continue; }
    if (ch === 0x11 && o.twin1d98 !== 0) { cur = o.twin1d98 >>> 0; continue; }
    break;
  }
  return PM.pmGhtPlan({
    players, startAddr, game26614, walkCap,
    null78: probes.null78, null79: probes.null79,
    has26bChar1: probes.has26bChar1, gullet: probes.gullet,
    has26bCharE: probes.has26bCharE, has1f5: probes.has1f5,
  });
}


test("v22 GHT: build + ABI pin + plan census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v22 — GHT/);
  assert.match(h, /ISAAC_PM_GHT_VA_BODY = 0x007caa00/);
  assert.match(h, /ISAAC_PM_GHT_VA_RET_ONE = 0x007caa84/);
  assert.match(h, /ISAAC_PM_GHT_VA_RET_ZERO = 0x007caa8b/);
  assert.match(h, /ISAAC_PM_GHT_VA_RET_HARD = 0x007caa9d/);
  assert.match(h, /ISAAC_PM_GHT_BODY_BYTES = 158/);
  assert.match(h, /ISAAC_PM_GHT_CALLSITE_COUNT = 3/);
  assert.match(h, /ISAAC_PM_GHT_PLAN_BYTES = 44/);
  assert.match(h, /typedef struct IsaacPmGhtPlan/);
  assert.match(h, /3 direct E8 callers 0x64eb74 \/ 0x6e975c \//);
  const sample = PM.pmGhtPlan({ startAddr: 0, game26614: 0 });
  assert.deepEqual(Object.keys(sample).sort(), [
    "char11Gate", "halfLeft", "halfRight", "healthType", "hops11",
    "hops28", "limit", "result", "retVa", "walkTerminated", "walkedAddr",
  ]);
});

test("v22 GHT: scalar laws (hard gate/result, walk engaged, blocks, halves)", () => {
  /* hard gate: SIGNED game_26614 >= 2. */
  assert.equal(wasm.isaac_pm_ght_hard_gate(2), 1);
  assert.equal(wasm.isaac_pm_ght_hard_gate(3), 1);
  assert.equal(wasm.isaac_pm_ght_hard_gate(1), 0);
  assert.equal(wasm.isaac_pm_ght_hard_gate(0), 0);
  assert.equal(wasm.isaac_pm_ght_hard_gate(-1), 0);
  assert.equal(wasm.isaac_pm_ght_hard_gate(-0x80000000), 0);
  assert.equal(wasm.isaac_pm_ght_hard_gate(0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_ght_hard_gate(2),
               wasm.isaac_pm_abh_game_hard(2));
  /* hard result: SIGNED v1340 < 0xa0 (setl). */
  assert.equal(wasm.isaac_pm_ght_hard_result(0x9f), 1);
  assert.equal(wasm.isaac_pm_ght_hard_result(0xa0), 0);
  assert.equal(wasm.isaac_pm_ght_hard_result(0xa1), 0);
  assert.equal(wasm.isaac_pm_ght_hard_result(-1), 1);   /* signed */
  assert.equal(wasm.isaac_pm_ght_hard_result(0x100), 0);
  assert.equal(wasm.isaac_pm_ght_hard_result(0xffffffff), 1); /* -1 signed */
  assert.equal(wasm.isaac_pm_ght_hard_result(0x7fffffff), 0);
  /* walk engaged/continue: FULL DWORD chars. */
  assert.equal(wasm.isaac_pm_ght_walk_engaged_28(0x28), 1);
  assert.equal(wasm.isaac_pm_ght_walk_engaged_28(0x128), 0);
  assert.equal(wasm.isaac_pm_ght_walk_engaged_28(0x100), 0);
  assert.equal(wasm.isaac_pm_ght_walk_continue_28(0x28, 0), 0);
  assert.equal(wasm.isaac_pm_ght_walk_continue_28(0x28, 1), 1);
  assert.equal(wasm.isaac_pm_ght_walk_continue_28(0x128, 1), 0);
  assert.equal(wasm.isaac_pm_ght_walk_engaged_11(0x11), 1);
  assert.equal(wasm.isaac_pm_ght_walk_engaged_11(0x111), 0);
  assert.equal(wasm.isaac_pm_ght_walk_continue_11(0x11, 0), 0);
  assert.equal(wasm.isaac_pm_ght_walk_continue_11(0x11, 1), 1);
  /* cross-pin with the v18 C0T walk (same char law). */
  assert.equal(wasm.isaac_pm_ght_walk_engaged_11(0x11),
               wasm.isaac_pm_c0t_walk_engaged(0x11));
  assert.equal(wasm.isaac_pm_ght_walk_engaged_28(0x28),
               wasm.isaac_pm_abh_walk_engaged(0x28));
  /* ht2 / char11 blocks. */
  assert.equal(wasm.isaac_pm_ght_ht2_block(2), 1);
  assert.equal(wasm.isaac_pm_ght_ht2_block(1), 0);
  assert.equal(wasm.isaac_pm_ght_ht2_block(3), 0);
  assert.equal(wasm.isaac_pm_ght_ht2_block(0), 0);
  assert.equal(wasm.isaac_pm_ght_char11_block(0x11), 1);
  assert.equal(wasm.isaac_pm_ght_char11_block(0x111), 0);
  assert.equal(wasm.isaac_pm_ght_char11_block(0x100), 0);
  assert.equal(wasm.isaac_pm_ght_char11_block(0x11),
               wasm.isaac_pm_ght_walk_engaged_11(0x11));
  /* trunc_half vs the model idiom. */
  for (const v of [0, 1, 2, 3, -1, -2, -3, 0x7fffffff, -0x80000000, 0xa0]) {
    assert.equal(wasm.isaac_pm_ght_trunc_half(v | 0),
                 PM.pmGhtTruncHalf(v | 0));
  }
  /* half_left: wrap add + ARITHMETIC shift (floor). */
  assert.equal(wasm.isaac_pm_ght_half_left(4, 1), 3);      /* (4+2)>>1 */
  assert.equal(wasm.isaac_pm_ght_half_left(5, 0), 2);      /* 5>>1 */
  assert.equal(wasm.isaac_pm_ght_half_left(-1, 0), -1);    /* floor */
  assert.equal(wasm.isaac_pm_ght_half_left(-2, 0), -1);
  assert.equal(wasm.isaac_pm_ght_half_left(-3, 0), -2);    /* -3>>1 = -2 */
  assert.equal(wasm.isaac_pm_ght_half_left(0, -1), -1);    /* -2>>1 = -1 */
  assert.equal(wasm.isaac_pm_ght_half_left(0x7fffffff, 0x7fffffff),
               1073741822); /* wrap: 0x7ffffffd >> 1 = 0x3ffffffe */
  assert.equal(wasm.isaac_pm_ght_half_left(0xffffffff, 0), -1);
  /* room_lt: SIGNED. */
  assert.equal(wasm.isaac_pm_ght_room_lt(1, 2), 1);
  assert.equal(wasm.isaac_pm_ght_room_lt(2, 2), 0);
  assert.equal(wasm.isaac_pm_ght_room_lt(2, 1), 0);
  assert.equal(wasm.isaac_pm_ght_room_lt(-1, 1), 1);
  assert.equal(wasm.isaac_pm_ght_room_lt(1, -1), 0);
  assert.equal(wasm.isaac_pm_ght_room_lt(-2, -1), 1);
  assert.equal(wasm.isaac_pm_ght_room_lt(-1, -2), 0);
  /* model parity on the scalars. */
  assert.equal(wasm.isaac_pm_ght_hard_gate(2),
               PM.pmGhtHardGate(2));
  assert.equal(wasm.isaac_pm_ght_hard_result(0xffffffff),
               PM.pmGhtHardResult(0xffffffff));
  assert.equal(wasm.isaac_pm_ght_trunc_half(-3),
               PM.pmGhtTruncHalf(-3));
  assert.equal(wasm.isaac_pm_ght_half_left(0x7fffffff, 0x7fffffff),
               PM.pmGhtHalfLeft(0x7fffffff, 0x7fffffff));
  assert.equal(wasm.isaac_pm_ght_room_lt(-2, -1),
               PM.pmGhtRoomLt(-2, -1));
});

test("v22 GHT: fixed rows (hard / ht2 / char11 / soft halves + wide)", () => {
  const view = new DataView(wasm.memory.buffer);
  const P_BASE = SCRATCH + 0x34000;
  const pAddr = (i) => P_BASE + i * 0x2000;
  const setPlayer = (i, fields) => {
    const a = pAddr(i);
    view.setInt32(a + 0x13c0, (fields.char ?? 0) | 0, true);
    view.setUint32(a + 0x1e68,
                   (fields.twin28 === undefined || fields.twin28 < 0
                      ? 0
                      : pAddr(fields.twin28)) >>> 0,
                   true);
    view.setUint32(a + 0x1d98,
                   (fields.twin11 === undefined || fields.twin11 < 0
                      ? 0
                      : pAddr(fields.twin11)) >>> 0,
                   true);
    view.setInt32(a + 0x1340, (fields.v1340 ?? 0) | 0, true);
    view.setInt32(a + 0x1d88, (fields.v1d88 ?? 0) | 0, true);
    view.setInt32(a + 0x2c, (fields.v2c ?? 0) | 0, true);
    view.setInt32(a + 0x1368, (fields.coins1368 ?? 0) | 0, true);
    view.setInt32(a + 0x1da0, (fields.v1da0 ?? 0) | 0, true);
  };
  const AT = SCRATCH + 0xed00;
  const run = (start, game, probes = {}, cap = 32) => {
    view.setUint32(AT + 44, 0x5a5a5a5a, true);
    view.setUint32(AT + 48, 0xa5a5a5a5, true);
    wasm.isaac_pm_ght_plan(
      pAddr(start) >>> 0, SCRATCH_GAME >>> 0, cap | 0,
      (probes.null78 ?? 0) >>> 0, (probes.null79 ?? 0) >>> 0,
      (probes.has26bChar1 ?? 0) >>> 0, (probes.gullet ?? 0) | 0,
      (probes.has26bCharE ?? 0) >>> 0, (probes.has1f5 ?? 0) >>> 0, AT);
    const got = v22ReadGhtPlan(view, AT);
    const want = v22GhtFromModel(v22GhtModelFromMemory(
      view, P_BASE, pAddr(start), game, probes, cap));
    assert.deepEqual(got, want, JSON.stringify({ start, game, probes }));
    assert.equal(view.getUint32(AT + 44, true), 0x5a5a5a5a,
                 "ght plan overflow +44");
    assert.equal(view.getUint32(AT + 48, true), 0xa5a5a5a5,
                 "ght plan overflow +48");
    return got;
  };
  let cases = 0;
  /* game 0x26614 sits at the game global + 0x26614; place it in memory. */
  view.setInt32(SCRATCH_GAME + 0x26614, 0, true);
  /* hard path: game_26614 >= 2, no walk, v1340 < 0xa0 signed. */
  view.setInt32(SCRATCH_GAME + 0x26614, 2, true);
  setPlayer(0, { char: 0, v1340: 0x9f });
  assert.equal(run(0, 2).result, 1);
  assert.equal(run(0, 2).retVa, 0x007caa9d);
  assert.equal(run(0, 2).walkTerminated, 1);
  setPlayer(0, { char: 0, v1340: 0xa0 });
  assert.equal(run(0, 2).result, 0);
  setPlayer(0, { char: 0, v1340: -1 });
  assert.equal(run(0, 2).result, 1); /* signed < 0xa0 */
  cases += 4;
  /* hard gate boundary: game 1 is soft. */
  view.setInt32(SCRATCH_GAME + 0x26614, 1, true);
  setPlayer(0, { char: 0, v1340: 4, v1d88: 0, v2c: 0,
                 coins1368: 0, v1da0: 0 });
  /* char 0: ht 0 (not 2), not 0x11; GHL(false) on v2c=0 char=0 -> base 0x18;
     clamp 0x18 - 2*v1da0(0) = 0x18; half_right=0xc; half_left=(4+0)>>1=2;
     2 < 12 -> result 1. */
  assert.equal(run(0, 1).result, 1);
  assert.equal(run(0, 1).retVa, 0x007caa84);
  assert.equal(run(0, 1).limit, 0x18);
  assert.equal(run(0, 1).halfLeft, 2);
  assert.equal(run(0, 1).halfRight, 0xc);
  cases += 5;
  /* ht2: char 0x28 settles with null twin; ht=2 -> return 0 before GHL. */
  setPlayer(0, { char: 0x28, twin28: -1, v1340: 4, v1d88: 0 });
  {
    const g = run(0, 1);
    assert.equal(g.healthType, 2);
    assert.equal(g.result, 0);
    assert.equal(g.retVa, 0x007caa8b);
    assert.equal(g.walkedAddr, pAddr(0));
  }
  cases += 4;
  /* char 0x28 with non-null twin hops; settle on non-walker. */
  setPlayer(0, { char: 0x28, twin28: 1, v1340: 10, v1d88: 0 });
  setPlayer(1, { char: 0, v1340: 4, v1d88: 0, v2c: 0,
                 coins1368: 0, v1da0: 0 });
  {
    const g = run(0, 1);
    assert.equal(g.hops28, 1);
    assert.equal(g.walkedAddr, pAddr(1));
    assert.equal(g.result, 1); /* (4)>>1=2 < 0xc */
  }
  cases += 3;
  /* char11 gate: char 0x11 with null twin settles, edx==0x11 -> 0. */
  setPlayer(0, { char: 0x11, twin11: -1, v1340: 4, v1d88: 0 });
  {
    const g = run(0, 1);
    assert.equal(g.char11Gate, 1);
    assert.equal(g.result, 0);
    assert.equal(g.retVa, 0x007caa8b);
  }
  cases += 3;
  /* char 0x11 with twin hops onto a walker chain. */
  setPlayer(0, { char: 0x11, twin11: 2 });
  setPlayer(2, { char: 0, v1340: 0x10, v1d88: 1, v2c: 0,
                 coins1368: 0, v1da0: 0 });
  {
    const g = run(0, 1);
    assert.equal(g.hops11, 1);
    assert.equal(g.walkedAddr, pAddr(2));
    /* half_left = (0x10 + 2*1)>>1 = 9; GHL base 0x18 -> half_right 0xc;
       9 < 12 -> 1. */
    assert.equal(g.halfLeft, 9);
    assert.equal(g.result, 1);
  }
  cases += 3;
  /* wide chars: 0x128 / 0x111 are not walkers. */
  setPlayer(0, { char: 0x128, v1340: 4, v1d88: 0, v2c: 0,
                 coins1368: 0, v1da0: 0 });
  assert.equal(run(0, 1).result, 1);
  setPlayer(0, { char: 0x111, v1340: 4, v1d88: 0, v2c: 0,
                 coins1368: 0, v1da0: 0 });
  assert.equal(run(0, 1).result, 1);
  cases += 2;
  /* GHL keeper=false clamp path: v1da0 halves the base. base 0x18,
     2*v1da0=0x18 -> diff 0 -> result 0; half_right 0. */
  setPlayer(0, { char: 0, v1340: 1, v1d88: 0, v2c: 0,
                 coins1368: 0, v1da0: 0xc });
  {
    const g = run(0, 1);
    assert.equal(g.limit, 0);
    assert.equal(g.result, 0); /* half_left 0 < 0 false */
  }
  cases += 2;
  /* wide probe args are low-byte gated inside GHL (has1f5 & 0xff).
     char 0xe is the KEEPER family: keeper_base(0xe, 0) = sel 6, so
     no-bonus limit is 6; has1f5 set adds 2*q where q(coins 0x63)
     keeps q+1=4 -> base 6+8=14. */
  setPlayer(0, { char: 0xe, v1340: 4, v1d88: 0, v2c: 0,
                 coins1368: 0x63, v1da0: 0 });
  assert.equal(run(0, 1, { has1f5: 0x100 }).limit, 6);    /* not set */
  assert.equal(run(0, 1, { has1f5: 0x1ff }).limit, 14);   /* +2*q(q+1=4) */
  cases += 2;
  /* walk cap: 0x28 self-twin cycle reports walkTerminated 0. */
  setPlayer(0, { char: 0x28, twin28: -1, v1340: 4, v1d88: 0 });
  view.setUint32(pAddr(0) + 0x1e68, pAddr(0), true); /* self loop */
  {
    const g = run(0, 1, {}, 4);
    assert.equal(g.walkTerminated, 0);
    assert.equal(g.walkedAddr, 0);
    assert.equal(g.result, 0);
  }
  cases += 3;
  /* null plan must not trap. */
  wasm.isaac_pm_ght_plan(0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  cases += 1;
  assert.ok(cases >= 30, `expected >= 30 cases, got ${cases}`);
});

test("v22 GHT: deterministic randomized differential corpus", () => {
  let seed = 0x007caa00 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  const view = new DataView(wasm.memory.buffer);
  const P_BASE = SCRATCH + 0x36000;
  const pAddr = (i) => P_BASE + i * 0x2000;
  const AT = SCRATCH + 0xec00;
  const chars = [0, 0x11, 0x28, 0xe, 0x21, 0x10, 0x14, 0xa, 0x1f,
                 0x128, 0x111, 0x100, 0x1ff, 0xffffffff];
  let cases = 0;
  for (let trial = 0; trial < 500; trial += 1) {
    /* reset the 5-slot world */
    for (let i = 0; i < 5; i += 1) {
      view.setInt32(pAddr(i) + 0x13c0, 0, true);
      view.setUint32(pAddr(i) + 0x1e68, 0, true);
      view.setUint32(pAddr(i) + 0x1d98, 0, true);
      view.setInt32(pAddr(i) + 0x1340, 0, true);
      view.setInt32(pAddr(i) + 0x1d88, 0, true);
      view.setInt32(pAddr(i) + 0x2c, 0, true);
      view.setInt32(pAddr(i) + 0x1368, 0, true);
      view.setInt32(pAddr(i) + 0x1da0, 0, true);
    }
    const char0 = pick(3) === 0 ? rnd() : chars[pick(chars.length)];
    view.setInt32(pAddr(0) + 0x13c0, char0 | 0, true);
    const twin28 = pick(2) ? 0 : pAddr(pick(4) + 1);
    const twin11 = pick(2) ? 0 : pAddr(pick(4) + 1);
    view.setUint32(pAddr(0) + 0x1e68, twin28 >>> 0, true);
    view.setUint32(pAddr(0) + 0x1d98, twin11 >>> 0, true);
    const char1 = pick(3) === 0 ? rnd() : chars[pick(chars.length)];
    view.setInt32(pAddr(1) + 0x13c0, char1 | 0, true);
    const v1340 = pick(2) ? 0 : (pick(2) ? rnd() : pick(0x200) - 0x100);
    const v1d88 = pick(2) ? 0 : (pick(2) ? rnd() : pick(0x100) - 0x80);
    view.setInt32(pAddr(1) + 0x1340, v1340 | 0, true);
    view.setInt32(pAddr(1) + 0x1d88, v1d88 | 0, true);
    view.setInt32(pAddr(1) + 0x2c, pick(3), true);
    view.setInt32(pAddr(1) + 0x1368, pick(0x100), true);
    view.setInt32(pAddr(1) + 0x1da0, pick(0x30), true);
    const game = pick(3) === 0 ? (pick(2) ? -0x80000000 : 0x7fffffff)
                               : (pick(4) - 1);
    view.setInt32(SCRATCH_GAME + 0x26614, game | 0, true);
    const probes = {
      null78: pick(2) ? rnd() : pick(2),
      null79: pick(2) ? rnd() : pick(2),
      has26bChar1: pick(2) ? rnd() : pick(2),
      gullet: pick(2) ? rnd() : pick(8),
      has26bCharE: pick(2) ? rnd() : pick(2),
      has1f5: pick(2) ? rnd() : pick(2),
    };
    wasm.isaac_pm_ght_plan(
      pAddr(0) >>> 0, SCRATCH_GAME >>> 0, 32 | 0,
      probes.null78 >>> 0, probes.null79 >>> 0,
      probes.has26bChar1 >>> 0, probes.gullet | 0,
      probes.has26bCharE >>> 0, probes.has1f5 >>> 0, AT);
    const got = v22ReadGhtPlan(view, AT);
    const want = v22GhtFromModel(v22GhtModelFromMemory(
      view, P_BASE, pAddr(0), game, probes));
    assert.deepEqual(got, want, `trial ${trial}`);
    /* cross-pin: hard gate agrees with ABH game_hard / GHL gate. */
    assert.equal(got.walkTerminated !== 0 ? 1 : 0,
                 got.walkedAddr !== 0 ? 1 : 0);
    if (got.healthType === 2 || got.char11Gate === 1) {
      assert.equal(got.result, 0);
    }
    if (game >= 2) {
      assert.equal(got.retVa, 0x007caa9d);
      assert.equal(got.hops28 + got.hops11, 0);
    }
    cases += 6;
  }
  assert.ok(cases >= 3000, `expected >= 3000 cases, got ${cases}`);
});

/* ====================================================================== */
/* v23 — BTT: VA 0x007caaa0 bit-test sibling (address-stable; NO exact    */
/* ZHL). PURE island: 0 stores, 0 indirect, 0 E8. ret 4 (__thiscall, one */
/* 4-byte stack arg = bit index). Both direct E8 callers (0x777013 /     */
/* 0x7da98d) consume the return with `test al,al` — bool in al.          */
/* ====================================================================== */

function v23BttPeTruth(v1d88, bits, bitIndex) {
  /* Independent reference, transcribed branch-by-branch from the
     instruction stream 0x007caaa0..0x007caac9 (22 insns, 2 rets):
       mov edx, ecx                          ; this (player)
       cmp dword [edx+0x1d88], 0
       jle RET_ZERO                          ; SIGNED count <= 0
       mov ecx, dword [ebp+8]                ; bit index (stack arg)
       mov eax, 1
       shl eax, cl                           ; x86 masks count to CL&31
       test dword [edx+0x1d8c], eax
       je RET_ZERO                           ; bit clear
       mov al, 1
       ret 4                                 ; 0x007caac3 (RET ONE)
     RET_ZERO:
       xor al, al
       ret 4                                 ; 0x007caac9 (RET ZERO)
     The 4-byte ret pops the single stack argument (callee cleanup). */
  let al = 0;
  if ((v1d88 | 0) > 0) {                     /* jle — SIGNED */
    const mask = 1 << (bitIndex & 31);       /* shl eax,cl mod 32 */
    if ((bits & mask) !== 0) {               /* test [0x1d8c],eax ; je */
      al = 1;                                /* mov al,1 */
    }
  }
  return al;
}

test("v23 BTT: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /v23 — BTT/);
  assert.match(h, /ISAAC_PM_BTT_VA_BODY = 0x007caaa0/);
  assert.match(h, /ISAAC_PM_BTT_VA_RET_ONE = 0x007caac3/);
  assert.match(h, /ISAAC_PM_BTT_VA_RET_ZERO = 0x007caac9/);
  assert.match(h, /ISAAC_PM_BTT_BODY_BYTES = 42/);
  assert.match(h, /ISAAC_PM_BTT_CALLSITE_COUNT = 2/);
  assert.match(h, /shl eax,cl ; mask mod 32/);
  assert.match(h, /2 direct E8 callers 0x777013 \/ 0x7da98d/);
  /* The dump itself is the PE ground truth: shl by cl, test against
     [edx+0x1d8c], two `ret 4`. */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "007caaa0.txt"),
    "utf8");
  assert.match(dis, /shl      eax, cl/);
  assert.match(dis, /test     dword ptr \[edx \+ 0x1d8c\], eax/);
  assert.match(dis, /ret      4/);
  assert.equal((dis.match(/ret      4/g) || []).length, 2);
  /* First samples agree. */
  assert.equal(wasm.isaac_pm_btt_result(1, 1, 0), 1);
  assert.equal(wasm.isaac_pm_btt_result(1, 1, 0),
               PM.pmBttResult(1, 1, 0));
});

test("v23 BTT: scalar laws (signed gate, mod-32 mask, bit test, polarity)", () => {
  /* count gate: SIGNED > 0 — jle at 0x007caaac skips for 0 AND every
     negative (INT_MIN included); 0xffffffff is -1. */
  assert.equal(wasm.isaac_pm_btt_count_gate(1), 1);
  assert.equal(wasm.isaac_pm_btt_count_gate(0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_btt_count_gate(0), 0);
  assert.equal(wasm.isaac_pm_btt_count_gate(-1), 0);
  assert.equal(wasm.isaac_pm_btt_count_gate(0xffffffff), 0);
  assert.equal(wasm.isaac_pm_btt_count_gate(-0x80000000), 0);
  assert.equal(wasm.isaac_pm_btt_count_gate(0x100), 1);   /* wide */
  assert.equal(wasm.isaac_pm_btt_count_gate(0x1ff), 1);   /* wide */
  /* mask: shl eax,cl — x86 mask mod 32. 1<<(n&31). */
  assert.equal(wasm.isaac_pm_btt_mask(0) >>> 0, 1);
  assert.equal(wasm.isaac_pm_btt_mask(1) >>> 0, 2);
  assert.equal(wasm.isaac_pm_btt_mask(8) >>> 0, 0x100);
  assert.equal(wasm.isaac_pm_btt_mask(31) >>> 0, 0x80000000);
  assert.equal(wasm.isaac_pm_btt_mask(32) >>> 0, 1);      /* wraps */
  assert.equal(wasm.isaac_pm_btt_mask(33) >>> 0, 2);      /* wraps */
  assert.equal(wasm.isaac_pm_btt_mask(0x100) >>> 0, 1);   /* 0x100&31=0 */
  assert.equal(wasm.isaac_pm_btt_mask(0x1ff) >>> 0, 0x80000000);
  assert.equal(wasm.isaac_pm_btt_mask(0xffffffff) >>> 0, 0x80000000);
  assert.equal(wasm.isaac_pm_btt_mask(0xffffff00) >>> 0, 1);
  /* bit hit: test [0x1d8c],mask ; je RET_ZERO ; mov al,1. */
  assert.equal(wasm.isaac_pm_btt_bit_hit(0x80000001, 0), 1);
  assert.equal(wasm.isaac_pm_btt_bit_hit(0x80000001, 31), 1);
  assert.equal(wasm.isaac_pm_btt_bit_hit(0x80000001, 1), 0);
  assert.equal(wasm.isaac_pm_btt_bit_hit(0x100, 8), 1);
  assert.equal(wasm.isaac_pm_btt_bit_hit(1, 32), 1);      /* mod-32 pin */
  assert.equal(wasm.isaac_pm_btt_bit_hit(2, 33), 1);      /* mod-32 pin */
  assert.equal(wasm.isaac_pm_btt_bit_hit(2, 0x100), 0);   /* 0x100&31=0 */
  assert.equal(wasm.isaac_pm_btt_bit_hit(0x7fffffff, 31), 0);
  /* full predicate: gate FIRST (jle skips the shl/test), polarity
     mov al,1 / xor al,al. */
  assert.equal(wasm.isaac_pm_btt_result(1, 1, 0), 1);     /* set -> 1 */
  assert.equal(wasm.isaac_pm_btt_result(1, 0, 0), 0);     /* clear -> 0 */
  assert.equal(wasm.isaac_pm_btt_result(0, 1, 0), 0);     /* gate blocks */
  assert.equal(wasm.isaac_pm_btt_result(-1, 1, 0), 0);
  assert.equal(wasm.isaac_pm_btt_result(0xffffffff, 1, 0), 0);
  assert.equal(wasm.isaac_pm_btt_result(1, 1, 32), 1);    /* mod-32 pin */
  assert.equal(wasm.isaac_pm_btt_result(1, 2, 33), 1);    /* mod-32 pin */
  assert.equal(wasm.isaac_pm_btt_result(1, 0x80000000, 31), 1);
  assert.equal(wasm.isaac_pm_btt_result(1, 0x100, 0x100), 0);
  /* model parity (PM.pmBtt* uses the same laws) + PE-truth parity. */
  const rows = [
    [1, 1, 0], [1, 0, 0], [0, 1, 0], [-1, 1, 0], [0xffffffff, 1, 0],
    [1, 0x80000001, 31], [1, 2, 33], [1, 1, 32], [5, 3, 0x1ff],
    [0x7fffffff, 0xffffffff, 0xffffffff], [-0x80000000, 0xffffffff, 32],
    [1, 0x100, 0x100], [1, 0x7fffffff, 31], [3, 0xdeadbeef, 0x100],
  ];
  for (const [v, b, i] of rows) {
    assert.equal(wasm.isaac_pm_btt_result(v | 0, b >>> 0, i >>> 0) | 0,
                 PM.pmBttResult(v, b, i), `result ${v}/${b}/${i}`);
    assert.equal(wasm.isaac_pm_btt_mask(i >>> 0) >>> 0,
                 PM.pmBttMask(i) >>> 0, `mask ${i}`);
    assert.equal(wasm.isaac_pm_btt_count_gate(v | 0) | 0,
                 PM.pmBttCountGate(v), `gate ${v}`);
    assert.equal(wasm.isaac_pm_btt_bit_hit(b >>> 0, i >>> 0) | 0,
                 PM.pmBttBitHit(b, i), `hit ${b}/${i}`);
    assert.equal(wasm.isaac_pm_btt_result(v | 0, b >>> 0, i >>> 0) | 0,
                 v23BttPeTruth(v, b, i), `pe-truth ${v}/${b}/${i}`);
  }
  /* cross-pin: the mask law is the same 1<<(n&31) the UBH bts/btr
     family uses (ubh_loop2 wraps a 51-bit index to bit 19). */
  assert.equal((1 << 19) >>> 0, PM.pmBttMask(51) >>> 0);
  assert.equal(wasm.isaac_pm_btt_mask(51) >>> 0, PM.pmBttMask(51) >>> 0);
});

test("v23 BTT: deterministic randomized differential corpus", () => {
  let seed = 0x007caaa0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const v1d88 = rnd();      /* full u32: 0xffffffff is -1 signed */
    const bits = rnd();
    const bitIndex = rnd();
    const gate = wasm.isaac_pm_btt_count_gate(v1d88 | 0) | 0;
    const mask = wasm.isaac_pm_btt_mask(bitIndex >>> 0) >>> 0;
    const hit = wasm.isaac_pm_btt_bit_hit(bits >>> 0, bitIndex >>> 0) | 0;
    const result = wasm.isaac_pm_btt_result(v1d88 | 0, bits >>> 0, bitIndex >>> 0) | 0;
    assert.equal(gate, PM.pmBttCountGate(v1d88), `trial ${trial} gate`);
    assert.equal(mask, PM.pmBttMask(bitIndex) >>> 0, `trial ${trial} mask`);
    assert.equal(hit, PM.pmBttBitHit(bits, bitIndex), `trial ${trial} hit`);
    assert.equal(result, PM.pmBttResult(v1d88, bits, bitIndex),
                 `trial ${trial} result`);
    assert.equal(result, v23BttPeTruth(v1d88, bits, bitIndex),
                 `trial ${trial} pe-truth`);
    /* structural pins: result is 1 iff gate AND hit. */
    assert.equal(result, gate !== 0 && hit !== 0 ? 1 : 0,
                 `trial ${trial} structure`);
    /* the SIGNED gate forces 0 when the count <= 0. */
    if ((v1d88 | 0) <= 0) {
      assert.equal(result, 0, `trial ${trial} signed gate`);
    }
    cases += 6;
  }
  /* Wide-byte drives per the v9 rule (NEVER pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_btt_mask(w >>> 0) >>> 0,
                 PM.pmBttMask(w) >>> 0, `wide mask ${w}`);
    assert.equal(wasm.isaac_pm_btt_bit_hit(w >>> 0, w >>> 0) | 0,
                 PM.pmBttBitHit(w, w), `wide hit ${w}`);
    assert.equal(wasm.isaac_pm_btt_result(1, w >>> 0, w >>> 0) | 0,
                 PM.pmBttResult(1, w, w), `wide result ${w}`);
    cases += 3;
  }
  assert.ok(cases >= 3600, `expected >= 3600 cases, got ${cases}`);
});

/* ====================================================================== */
/* v24 — TPD: VA 0x007caad0 TryPreventDeath pure dispatch (gate + switch  */
/* selection + per-case pure scalar guards). Case bodies stay host (0x7588*/
/* a0 VERIFIED impure, 0x758a70 apply host, DEFAULT [0x134c]=1 store).    */
/* ====================================================================== */

function v24TpdPeTruth(v1d88, v1344, v134c, healthType, v13c0,
                       fatal1340, game26614) {
  /* Independent reference, transcribed branch-by-branch from
     disasm-007caad0.txt (0x007caad0..0x007caba4) + jump table 0x7caba8 +
     the 0x7dd380 fold leaf disasm:
       0x7caada mov eax,[esi+0x1d88] ; add [esi+0x1344] ; add [esi+0x134c]
       0x7caaec jne 0x7cab9e            ; ZF from LAST add
       0x7caaf7 cmp eax,4 ; ja 0x7cab8d  ; UNSIGNED over-range -> DEFAULT
       0x7cab00 jmp [eax*4+0x7caba8]    ; 0->CASE0 1/2->DEFAULT 3->CASE3 4->CASE4 */
  const sum = (((v1d88 >>> 0) + (v1344 >>> 0) + (v134c >>> 0)) >>> 0);
  const gate = sum === 0 ? 1 : 0;
  const t = healthType >>> 0;
  let cs;
  if (t > 4) cs = 1;
  else if (t === 0) cs = 0;
  else if (t === 3) cs = 3;
  else if (t === 4) cs = 4;
  else cs = 1;
  /* 0x7cab3b cmp dword [esi+0x13c0],0x12 ; jne 0x7cab6c (full dword). */
  const char12 = (v13c0 >>> 0) === 0x12 ? 1 : 0;
  /* 0x7cab1c / 0x7cab4d cmp [esi+0x1340],2 ; jge skip — SIGNED < 2. */
  const fatalLt2 = (fatal1340 | 0) < 2 ? 1 : 0;
  /* 0x7cab6e test eax,eax ; jle 0x7cab8d — SIGNED <= 0 -> DEFAULT. */
  const fatalLe0 = (fatal1340 | 0) <= 0 ? 1 : 0;
  /* 0x7cab79 mov ecx,1 ; call 0x7dd380: lea eax,[ecx*8] ; jge ret ; mov
     eax,ecx ; game26614 >= 2 (SIGNED) keeps the *8 (ecx=1 -> 8). */
  const elseFatal = (game26614 | 0) >= 2 ? 8 : 1;
  return { gate, cs, char12, fatalLt2, fatalLe0, elseFatal };
}

test("v24 TPD: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v24 — TPD/);
  assert.match(h, /ISAAC_PM_TPD_VA_BODY = 0x007caad0/);
  assert.match(h, /ISAAC_PM_TPD_VA_JUMP_TABLE = 0x007caba8/);
  assert.match(h, /ISAAC_PM_TPD_BODY_BYTES = 213/);
  assert.match(h, /ISAAC_PM_TPD_CALLSITE_COUNT = 7/);
  assert.match(h, /7 direct rel32 callers 0x7604cb 0x762c6d 0x777f94 0x7a2062/);
  assert.match(h, /0x7588a0 VERIFIED IMPURE/);
  assert.match(h, /cmp eax,4 ; ja 0x7cab8d ; UNSIGNED over-range -> DEFAULT/);
  /* Model constants agree. */
  assert.equal(PM.PM_TPD_VA_BODY, 0x007caad0);
  assert.equal(PM.PM_TPD_VA_JUMP_TABLE, 0x007caba8);
  assert.equal(PM.PM_TPD_CALLSITE_COUNT, 7);
  assert.equal(PM.PM_TPD_CASE_DEFAULT, 1);
  /* The saved raw disasm is the PE ground truth: the pre-switch gate,
     the UNSIGNED ja over-range, the jump-table indirect dispatch, and
     the RET_FALSE xor-al tail. */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v24", "disasm-007caad0.txt"),
    "utf8");
  assert.match(dis, /jne        0x7cab9e/);
  assert.match(dis, /ja         0x7cab8d/);
  assert.match(dis, /jmp        dword ptr \[eax\*4 \+ 0x7caba8\]/);
  assert.match(dis, /xor        al, al/);
  /* The fold-leaf 0x7dd380 (pure, 17 insns) drives CASE0-else. */
  const leaf = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v24", "disasm-007dd380.txt"),
    "utf8");
  assert.match(leaf, /lea        eax, \[ecx\*8\]/);
  assert.match(leaf, /jge        0x7dd397/);
  assert.match(leaf, /mov        eax, ecx/);
  /* First samples agree (model + PE-truth). */
  assert.equal(wasm.isaac_pm_tpd_gate(0 | 0, 0 | 0, 0 | 0), 1);
  assert.equal(wasm.isaac_pm_tpd_gate(0, 0, 0), PM.pmTpdGate(0, 0, 0));
  const p0 = v24TpdPeTruth(0, 0, 0, 0, 0x12, 1, 3);
  assert.deepEqual({ gate: wasm.isaac_pm_tpd_gate(0, 0, 0),
                     cs: wasm.isaac_pm_tpd_case(0),
                     char12: wasm.isaac_pm_tpd_case0_is_char12(0x12),
                     fatalLt2: wasm.isaac_pm_tpd_fatal_lt2(1),
                     fatalLe0: wasm.isaac_pm_tpd_case0_fatal_le0(1),
                     elseFatal: wasm.isaac_pm_tpd_case0_else_fatal(3) },
                   p0, "first samples hint");
});

test("v24 TPD: scalar laws (gate wrap, case table, char12, signed guards)", () => {
  /* GATE: wrapped 32-bit sum of bone+soul+eternal == 0 (ZF of last add).
     0 and 0xffffffff on separate fields must not pre-mask the wasm arg. */
  assert.equal(wasm.isaac_pm_tpd_gate(0, 0, 0), 1);
  assert.equal(wasm.isaac_pm_tpd_gate(1, 0, 0), 0);
  assert.equal(wasm.isaac_pm_tpd_gate(-1, 0, 0), 0);        /* 0xffffffff */
  assert.equal(wasm.isaac_pm_tpd_gate(0, 0xffffffff, 0), 0);/* 0xffffffff */
  assert.equal(wasm.isaac_pm_tpd_gate(0xffffffff, 0xffffffff, 0), 0); /* 0x1fffffffe mod = 0xfffffffe */
  assert.equal(wasm.isaac_pm_tpd_gate(1, 0xffffffff, 0), 1);/* wraps to 0 */
  assert.equal(wasm.isaac_pm_tpd_gate(0x7fffffff, 0x80000000, 0xffffffff), 0); /* mod 0xfffffffe */
  assert.equal(wasm.isaac_pm_tpd_gate(0x7fffffff, 0x80000000, 1), 1); /* wraps to 0 */
  assert.equal(wasm.isaac_pm_tpd_gate(0x100, 0, 0), 0);     /* wide */
  assert.equal(wasm.isaac_pm_tpd_gate(0x1ff, 0, 0), 0);     /* wide */
  assert.equal(wasm.isaac_pm_tpd_gate(0xffffffff, 0xfffffffe, 2), 0); /* mod 0xffffffff */
  assert.equal(wasm.isaac_pm_tpd_gate(0xffffffff, 0xfffffffe, 3), 1); /* -1-2+3 == 0 */
  /* CASE selection: table 0->0,1/2->1,3->3,4->4; UNSIGNED >4 -> 1. */
  assert.equal(wasm.isaac_pm_tpd_case(0), 0);
  assert.equal(wasm.isaac_pm_tpd_case(1), 1);
  assert.equal(wasm.isaac_pm_tpd_case(2), 1);
  assert.equal(wasm.isaac_pm_tpd_case(3), 3);
  assert.equal(wasm.isaac_pm_tpd_case(4), 4);
  assert.equal(wasm.isaac_pm_tpd_case(5), 1);
  assert.equal(wasm.isaac_pm_tpd_case(0x100), 1);           /* wide */
  assert.equal(wasm.isaac_pm_tpd_case(0x1ff), 1);           /* wide */
  assert.equal(wasm.isaac_pm_tpd_case(0xffffffff), 1);      /* -1 wraps */
  assert.equal(wasm.isaac_pm_tpd_case(-1), 1);
  /* char12: FULL-DWORD equal to 0x12. */
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0x12), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0x13), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0x112), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0x100), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0xffffffff), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_is_char12(0x1ff), 0);
  /* fatal_lt2: SIGNED < 2 (jge skips the half-heart host call). */
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(1), 1);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(0), 1);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(-1), 1);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(-0x80000000), 1);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(2), 0);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(3), 0);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(0x7fffffff), 0);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(0x100), 0);      /* 256 >= 2 */
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(0x1ff), 0);
  assert.equal(wasm.isaac_pm_tpd_fatal_lt2(0xffffffff), 1); /* -1 */
  /* fatal_le0: SIGNED <= 0 -> DEFAULT body. */
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(0), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(-1), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(-0x80000000), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(1), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(0x100), 0);
  assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(0xffffffff), 1);
  /* else_fatal: 0x7dd380(ecx=1) fold — SIGNED game[0x26614] >= 2 ? 8 : 1. */
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(2), 8);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(3), 8);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(0x7fffffff), 8);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(0x100), 8);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(1), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(0), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(-1), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(-0x80000000), 1);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(0x1ff), 8);
  assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(0xffffffff), 1); /* -1 */
  /* model + PE-truth parity on fixed rows (incl. wide/negative). */
  const rows = [
    [0, 0, 0, 0, 0x12, 1, 3],
    [1, 0, 0, 0, 0x13, 0, 1],
    [1, 0xffffffff, 0, 4, 0x12, -1, 2],
    [0x7fffffff, 0x80000000, 0xffffffff, 0xffffffff, 0x12, 0x100, 0x1ff],
    [-1, 2, 0xfffffffe, 3, 0x112, -0x80000000, 0],
    [0x100, 0x1ff, 0xffffffff, 5, 0x12, 2, 0xffffffff],
  ];
  for (const r of rows) {
    const [a, b, c, ht, ch, fa, g] = r;
    const pe = v24TpdPeTruth(a, b, c, ht, ch, fa, g);
    assert.equal(wasm.isaac_pm_tpd_gate(a | 0, b | 0, c | 0) | 0,
                 PM.pmTpdGate(a, b, c), `gate ${a}/${b}/${c}`);
    assert.equal(wasm.isaac_pm_tpd_gate(a | 0, b | 0, c | 0) | 0,
                 pe.gate, `pe gate ${a}/${b}/${c}`);
    assert.equal(wasm.isaac_pm_tpd_case(ht >>> 0) | 0,
                 PM.pmTpdCase(ht), `case ${ht}`);
    assert.equal(wasm.isaac_pm_tpd_case(ht >>> 0) | 0, pe.cs, `pe case ${ht}`);
    assert.equal(wasm.isaac_pm_tpd_case0_is_char12(ch >>> 0) | 0,
                 PM.pmTpdCase0IsChar12(ch), `char12 ${ch}`);
    assert.equal(wasm.isaac_pm_tpd_case0_is_char12(ch >>> 0) | 0,
                 pe.char12, `pe char12 ${ch}`);
    assert.equal(wasm.isaac_pm_tpd_fatal_lt2(fa | 0) | 0,
                 PM.pmTpdFatalLt2(fa), `lt2 ${fa}`);
    assert.equal(wasm.isaac_pm_tpd_fatal_lt2(fa | 0) | 0,
                 pe.fatalLt2, `pe lt2 ${fa}`);
    assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(fa | 0) | 0,
                 PM.pmTpdCase0FatalLe0(fa), `le0 ${fa}`);
    assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(fa | 0) | 0,
                 pe.fatalLe0, `pe le0 ${fa}`);
    assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(g | 0) | 0,
                 PM.pmTpdCase0ElseFatal(g), `ef ${g}`);
    assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(g | 0) | 0,
                 pe.elseFatal, `pe ef ${g}`);
  }
});

test("v24 TPD: deterministic randomized differential corpus", () => {
  let seed = 0x007caad0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const v1d88 = rnd();
    const v1344 = rnd();
    const v134c = rnd();
    const healthType = rnd();
    const v13c0 = rnd();
    const fatal1340 = rnd();
    const game26614 = rnd();
    const gate = wasm.isaac_pm_tpd_gate(v1d88 | 0, v1344 | 0, v134c | 0) | 0;
    const cs = wasm.isaac_pm_tpd_case(healthType >>> 0) | 0;
    const char12 = wasm.isaac_pm_tpd_case0_is_char12(v13c0 >>> 0) | 0;
    const ll = wasm.isaac_pm_tpd_fatal_lt2(fatal1340 | 0) | 0;
    const le = wasm.isaac_pm_tpd_case0_fatal_le0(fatal1340 | 0) | 0;
    const ef = wasm.isaac_pm_tpd_case0_else_fatal(game26614 | 0) | 0;
    assert.equal(gate, PM.pmTpdGate(v1d88, v1344, v134c), `trial ${trial} gate`);
    assert.equal(cs, PM.pmTpdCase(healthType), `trial ${trial} case`);
    assert.equal(char12, PM.pmTpdCase0IsChar12(v13c0), `trial ${trial} char12`);
    assert.equal(ll, PM.pmTpdFatalLt2(fatal1340), `trial ${trial} lt2`);
    assert.equal(le, PM.pmTpdCase0FatalLe0(fatal1340), `trial ${trial} le0`);
    assert.equal(ef, PM.pmTpdCase0ElseFatal(game26614), `trial ${trial} ef`);
    const pe = v24TpdPeTruth(v1d88, v1344, v134c, healthType, v13c0,
                             fatal1340, game26614);
    assert.equal(gate, pe.gate, `trial ${trial} pe gate`);
    assert.equal(cs, pe.cs, `trial ${trial} pe case`);
    assert.equal(char12, pe.char12, `trial ${trial} pe char12`);
    assert.equal(ll, pe.fatalLt2, `trial ${trial} pe lt2`);
    assert.equal(le, pe.fatalLe0, `trial ${trial} pe le0`);
    assert.equal(ef, pe.elseFatal, `trial ${trial} pe ef`);
    /* structural coherence: game fold is 8 or 1; fatal<=0 implies <2. */
    assert.ok(ef === 1 || ef === 8, `trial ${trial} ef range`);
    if (le === 1) assert.equal(ll, 1, `trial ${trial} le0 implies lt2`);
    cases += 6;
  }
  /* Wide-byte drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_tpd_gate(w | 0, 0 | 0, 0 | 0) | 0,
                 PM.pmTpdGate(w, 0, 0), `wide gate ${w}`);
    assert.equal(wasm.isaac_pm_tpd_case(w >>> 0) | 0,
                 PM.pmTpdCase(w), `wide case ${w}`);
    assert.equal(wasm.isaac_pm_tpd_case0_is_char12(w >>> 0) | 0,
                 PM.pmTpdCase0IsChar12(w), `wide char12 ${w}`);
    assert.equal(wasm.isaac_pm_tpd_fatal_lt2(w | 0) | 0,
                 PM.pmTpdFatalLt2(w), `wide lt2 ${w}`);
    assert.equal(wasm.isaac_pm_tpd_case0_fatal_le0(w | 0) | 0,
                 PM.pmTpdCase0FatalLe0(w), `wide le0 ${w}`);
    assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(w | 0) | 0,
                 PM.pmTpdCase0ElseFatal(w), `wide ef ${w}`);
    cases += 6;
  }
  assert.ok(cases >= 3600 + 18, `expected >= 3618 cases, got ${cases}`);
});

/* ====================================================================== */
/* v25 — GF: VA 0x007dd380 global-fatal scale leaf WHOLE (general-ecx).  */
/* The v24 TPD unit landed only the ecx=1 CASE0-else fold; this group    */
/* lands the leaf itself: game[0x26614] >= 2 (SIGNED jge) ? ecx*8 : ecx. */
/* ====================================================================== */

function v25GfPeTruth(game26614, ecx) {
  /* Independent reference, transcribed branch-by-branch from
     disasm-007dd380.txt:
       0x007dd380 mov eax,[0xc71678]           ; eax = game pointer
       0x007dd385 cmp dword ptr [eax+0x26614],2 ; full-dword compare
       0x007dd38c lea eax,[ecx*8]             ; UNCONDITIONAL, wraps 32-bit
       0x007dd393 jge 0x7dd397                ; SIGNED >= 2 keeps eax
       0x007dd395 mov eax,ecx                 ; game < 2 -> ecx
       0x007dd397 ret */
  const g = game26614 | 0;
  const c = ecx | 0;
  const scaled = Math.imul(c, 8); /* the lea, 32-bit wrap */
  return g >= 2 ? scaled : c;
}

test("v25 GF: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v25 — GF/);
  assert.match(h, /ISAAC_PM_GF_VA_BODY = 0x007dd380/);
  assert.match(h, /ISAAC_PM_GF_VA_RET = 0x007dd397/);
  assert.match(h, /ISAAC_PM_GF_BODY_BYTES = 24/);
  assert.match(h, /ISAAC_PM_GF_CALLSITE_COUNT = 21/);
  assert.match(h, /ISAAC_PM_GF_GAME_GLOBAL_VA = 0x00c71678/);
  assert.match(h, /ISAAC_PM_GF_GAME_FIELD = 0x26614/);
  assert.match(h, /ISAAC_PM_GF_SCALE = 8/);
  assert.match(h, /lea ecx\*8/);
  assert.match(h, /21 direct rel32 E8 callers/);
  /* Model constants agree. */
  assert.equal(PM.PM_GF_VA_BODY, 0x007dd380);
  assert.equal(PM.PM_GF_VA_RET, 0x007dd397);
  assert.equal(PM.PM_GF_BODY_BYTES, 24);
  assert.equal(PM.PM_GF_CALLSITE_COUNT, 21);
  assert.equal(PM.PM_GF_GAME_GLOBAL_VA, 0x00c71678);
  assert.equal(PM.PM_GF_GAME_FIELD, 0x26614);
  assert.equal(PM.PM_GF_CMP, 2);
  assert.equal(PM.PM_GF_SCALE, 8);
  assert.equal(PM.PM_GF_SCALE_SHIFT, 3);
  /* The saved raw disasm is the PE ground truth for the general-ecx law:
     the game-pointer load, the full-dword cmp, the UNCONDITIONAL lea,
     the SIGNED jge, the ecx fallback, the plain ret. */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v25", "disasm-007dd380.txt"),
    "utf8");
  assert.match(dis, /mov        eax, dword ptr \[0xc71678\]/);
  assert.match(dis, /cmp        dword ptr \[eax \+ 0x26614\], 2/);
  assert.match(dis, /lea        eax, \[ecx\*8\]/);
  assert.match(dis, /jge        0x7dd397/);
  assert.match(dis, /mov        eax, ecx/);
  assert.match(dis, /17 insns, 0 stores, 0 E8/);
  /* First samples agree (wasm + model + PE-truth + the v24 fold). */
  assert.equal(wasm.isaac_pm_global_fatal_scale(3 | 0, 1 | 0), 8);
  assert.equal(wasm.isaac_pm_global_fatal_scale(3 | 0, 1 | 0) | 0,
               v25GfPeTruth(3, 1), "first sample hint");
  /* The v24 CASE0-else fold is exactly this leaf at ecx = 1. */
  for (const g of [0, 1, 2, 3, -1, 0x7fffffff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_tpd_case0_else_fatal(g | 0) | 0,
                 wasm.isaac_pm_global_fatal_scale(g | 0, 1 | 0) | 0,
                 `fold(g=${g}) === leaf(g, ecx=1) === ${PM.pmGlobalFatalScale(g, 1)}`);
  }
});

test("v25 GF: scalar laws (SIGNED branch, ecx*8 wrap, wide drives)", () => {
  /* SIGNED jge: game26614 >= 2 scales, everything below returns ecx raw.
     0xffffffff is -1 signed (full-dword cmp — not a byte gate). */
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 5 | 0), 40);
  assert.equal(wasm.isaac_pm_global_fatal_scale(3 | 0, 5 | 0), 40);
  assert.equal(wasm.isaac_pm_global_fatal_scale(0x7fffffff, 5 | 0), 40);
  assert.equal(wasm.isaac_pm_global_fatal_scale(1 | 0, 5 | 0), 5);
  assert.equal(wasm.isaac_pm_global_fatal_scale(0 | 0, 5 | 0), 5);
  assert.equal(wasm.isaac_pm_global_fatal_scale(-1 | 0, 5 | 0), 5);
  assert.equal(wasm.isaac_pm_global_fatal_scale(-0x80000000, 5 | 0), 5);
  assert.equal(wasm.isaac_pm_global_fatal_scale(0xffffffff, 5 | 0), 5);
  /* the multiplier 8 (lea ecx*8): 1->8, 3->24, -1->-8. */
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 1 | 0), 8);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 3 | 0), 24);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, -1 | 0), -8);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0 | 0), 0);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0xffffffff) | 0, -8);
  /* 32-bit lea wrap — a signed `ecx * 8` (UB) or a plain js `ecx*8`
     without imul would smear: 0x20000000*8 = 0 mod 2^32, 0x10000000*8 =
     0x80000000 (-2147483648), 0x3fffffff*8 = -8. */
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0x20000000) | 0, 0);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0x10000000) | 0,
               -0x80000000);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0x3fffffff) | 0, -8);
  assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, 0x7fffffff) | 0, -8);
  /* game<2 returns ecx untouched (wrap irrelevant on that path). */
  assert.equal(wasm.isaac_pm_global_fatal_scale(1 | 0, 0x20000000) | 0,
               0x20000000);
  /* Wide drives (v9 rule: never pre-mask the wasm arg). 0x100/0x1ff are
     >= 2 so they scale; 0xffffffff is -1 signed so it does not. */
  assert.equal(wasm.isaac_pm_global_fatal_scale(0x100 | 0, 2 | 0) | 0, 16);
  assert.equal(wasm.isaac_pm_global_fatal_scale(0x1ff | 0, 2 | 0) | 0, 16);
  assert.equal(wasm.isaac_pm_global_fatal_scale(0xffffffff, 2 | 0) | 0, 2);
  /* model parity on fixed rows (incl. negative/wide/wrap). */
  const rows = [
    [2, 1], [3, 5], [1, 5], [0, 5], [-1, 5], [0x7fffffff, 5],
    [-0x80000000, 5], [0xffffffff, 5], [2, -1], [2, 0], [2, 3],
    [2, 0x20000000], [2, 0x10000000], [2, 0x3fffffff], [2, 0x7fffffff],
    [1, 0x20000000], [0x100, 2], [0x1ff, 2], [0xffffffff, 2], [2, 0xffffffff],
  ];
  for (const [g, c] of rows) {
    assert.equal(wasm.isaac_pm_global_fatal_scale(g | 0, c | 0) | 0,
                 PM.pmGlobalFatalScale(g, c), `model ${g}/${c}`);
    assert.equal(wasm.isaac_pm_global_fatal_scale(g | 0, c | 0) | 0,
                 v25GfPeTruth(g, c), `pe-truth ${g}/${c}`);
  }
});

test("v25 GF: deterministic randomized differential corpus", () => {
  let seed = 0x007dd380 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const game26614 = rnd();
    const ecx = rnd();
    const got = wasm.isaac_pm_global_fatal_scale(game26614 | 0, ecx | 0) | 0;
    assert.equal(got, PM.pmGlobalFatalScale(game26614, ecx),
                 `trial ${trial} model`);
    assert.equal(got, v25GfPeTruth(game26614, ecx), `trial ${trial} pe-truth`);
    /* structural coherence: game >= 2 (SIGNED) iff the ecx*8 result is
       returned; otherwise raw ecx. */
    const scaled = Math.imul(ecx | 0, 8);
    assert.equal(got, (game26614 | 0) >= 2 ? scaled : (ecx | 0),
                 `trial ${trial} structure`);
    if ((game26614 | 0) < 2) {
      assert.equal(got, ecx | 0, `trial ${trial} raw-ecx path`);
    }
    cases += 1;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_global_fatal_scale(w | 0, 3 | 0) | 0,
                 PM.pmGlobalFatalScale(w, 3), `wide game ${w}`);
    assert.equal(wasm.isaac_pm_global_fatal_scale(2 | 0, w | 0) | 0,
                 PM.pmGlobalFatalScale(2, w), `wide ecx ${w}`);
    cases += 2;
  }
  assert.ok(cases >= 606, `expected >= 606 cases, got ${cases}`);
});


/* ====================================================================== */
/* v26 — BF: VA 0x007db0a0 flag/effect decision island (NARROWED).       */
/* thiscall, ret plain; 73 insns, 2 E8 (0x7cb6e0 count resolver +         */
/* 0x930220 effect add — both typed PM host events, bodies stay host),   */
/* 1 observable store (byte [this+0x1eec]). Laws transcribed             */
/* branch-by-branch from disasm-007db0a0.txt.                            */
/* ====================================================================== */

function v26BfMapPe(count) {
  /* 0x007db0b1 sub eax,0 ; je 0x7db0c9  (count==0 -> 0) ;
     0x007db0b6 sub eax,1 ; je 0x7db0c2  (count==1 -> 1) ; else 2. */
  const c = count | 0;
  if (c === 0) return 0;
  if (c === 1) return 1;
  return 2;
}

function v26BfDeltaPe(count, flag) {
  /* 0x007db0cb mov cl,byte [esi+0x1eec] ; movzx eax,cl ; and eax,0xf ;
     0x007db0d7 sub edx,eax ; 0x007db0d9 mov eax,0 ;
     0x007db0de cmovs edx,eax — SIGNED clamp: negative -> 0. */
  const mapped = v26BfMapPe(count);
  const delta = mapped - ((flag >>> 0) & 0xf);
  return delta < 0 ? 0 : delta;
}

function v26BfProceedPe(count, flag) {
  /* 0x007db0e1 test edx,edx ; 0x007db0e3 je 0x7db14d — delta==0 skips
     the store and the host call entirely. */
  return v26BfDeltaPe(count, flag) !== 0 ? 1 : 0;
}

function v26BfSizeGatePe(begin, end) {
  /* 0x007db0f6 sub eax,edx (32-bit wrap) ; 0x007db0f8 and eax,~3 ;
     0x007db0fb cmp eax,0x4e4 ; 0x007db100 jle 0x7db13c — SIGNED <=
     skips the effect call. */
  const size = ((end >>> 0) - (begin >>> 0)) & 0xfffffffc;
  return (size | 0) > 0x4e4 ? 1 : 0;
}

function v26BfHostNeededPe(begin, end, slot) {
  /* 0x007db102 mov eax,[edx+0x4e4] ; 0x007db108 test eax,eax ;
     0x007db10a je 0x7db13c — effect call iff size gate AND slot != 0. */
  return v26BfSizeGatePe(begin, end) !== 0 && (slot >>> 0) !== 0 ? 1 : 0;
}

function v26BfFlagNextPe(flag) {
  /* 0x007db13c mov al,cl ; and cl,0xf ; and al,0xf0 ; add al,0x10
     (8-BIT add: 0xf0+0x10 wraps to 0x00) ; or al,cl — byte-rounded. */
  const f = flag >>> 0;
  const high = (f & 0xf0) + 0x10;
  return ((high & 0xff) | (f & 0xf)) >>> 0;
}

test("v26 BF: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v26 — BF/);
  assert.match(h, /ISAAC_PM_BF_VA_BODY = 0x007db0a0/);
  assert.match(h, /ISAAC_PM_BF_VA_RET = 0x007db152/);
  assert.match(h, /ISAAC_PM_BF_BODY_BYTES = 179/);
  assert.match(h, /ISAAC_PM_BF_CALLSITE_COUNT = 3/);
  assert.match(h, /ISAAC_PM_BF_COUNT_ID = 0x79/);
  assert.match(h, /ISAAC_PM_BF_FLAG_OFF = 0x1eec/);
  assert.match(h, /ISAAC_PM_BF_GAME_GLOBAL_VA = 0x00c7169c/);
  assert.match(h, /ISAAC_PM_BF_SIZE_CMP = 0x4e4/);
  assert.match(h, /0x7cb6e0 count resolver HUD v19/);
  assert.match(h, /0x930220 effect-add host event/);
  assert.match(h, /SIGNED max\(0, mapped - \(flag & 0xf\)\)/);
  assert.match(h, /delta == 0 -> early epilogue: NO store, NO host call/);
  /* Model constants agree. */
  assert.equal(PM.PM_BF_VA_BODY, 0x007db0a0);
  assert.equal(PM.PM_BF_VA_RET, 0x007db152);
  assert.equal(PM.PM_BF_BODY_BYTES, 179);
  assert.equal(PM.PM_BF_CALLSITE_COUNT, 3);
  assert.equal(PM.PM_BF_COUNT_ID, 0x79);
  assert.equal(PM.PM_BF_FLAG_OFF, 0x1eec);
  assert.equal(PM.PM_BF_GAME_GLOBAL_VA, 0x00c7169c);
  assert.equal(PM.PM_BF_VEC_BEGIN_OFF, 0x2a404);
  assert.equal(PM.PM_BF_VEC_END_OFF, 0x2a408);
  assert.equal(PM.PM_BF_SIZE_CMP, 0x4e4);
  assert.equal(PM.PM_BF_SLOT_OFF, 0x4e4);
  assert.equal(PM.PM_BF_RECEIVER_OFF, 0x1508);
  assert.equal(PM.PM_BF_HOST_VA_COUNT, 0x007cb6e0);
  assert.equal(PM.PM_BF_HOST_VA_EFFECT, 0x00930220);
  assert.equal(PM.PM_BF_FLAG_INC, 0x10);
  /* Raw disasm needles (cpu-dump of the 0x7db0a0..0x7db152 body). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v26-7db0a0", "disasm-007db0a0.txt"),
    "utf8");
  assert.match(dis, /push\s+0x79/);
  assert.match(dis, /call\s+0x7cb6e0/);
  assert.match(dis, /movzx\s+eax, cl/);
  assert.match(dis, /cmovs\s+edx, eax/);
  assert.match(dis, /jle\s+0x7db13c/);
  assert.match(dis, /add\s+al, 0x10/);
  assert.match(dis, /mov\s+byte ptr \[esi \+ 0x1eec\], al/);
  assert.match(dis, /insns 73/);
  assert.match(dis, /mem-stores 5/);
});

test("v26 BF: scalar laws (map/delta/proceed, SIGNED size gate, byte wrap)", () => {
  /* map_count: 0->0, 1->1, else->2 (full-dword sub/je chain). */
  assert.equal(wasm.isaac_pm_7db0a0_map_count(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(1 | 0), 1);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(2 | 0), 2);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(3 | 0), 2);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(-1 | 0), 2);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(0x7fffffff), 2);
  /* Wide drives on the wasm arg are never pre-masked (v9 rule). */
  assert.equal(wasm.isaac_pm_7db0a0_map_count(0x100 | 0), 2);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(0x1ff | 0), 2);
  assert.equal(wasm.isaac_pm_7db0a0_map_count(0xffffffff), 2);
  /* delta: SIGNED clamp — mapped - (flag & 0xf), negative -> 0. */
  assert.equal(wasm.isaac_pm_7db0a0_delta(0 | 0, 0x00), 0);
  assert.equal(wasm.isaac_pm_7db0a0_delta(0 | 0, 0x01), 0);   /* 0-1 clamps */
  assert.equal(wasm.isaac_pm_7db0a0_delta(0 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db0a0_delta(1 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db0a0_delta(1 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x00), 2);
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x01), 1);
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x02), 0);
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x0f), 0);
  /* flag bits above the byte are dropped by the & 0xf (byte load):
     low byte of 0x1f0 is 0xf0, nibble 0 -> delta = 2 - 0 = 2. */
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x1f0) | 0, 2);
  assert.equal(wasm.isaac_pm_7db0a0_delta(2 | 0, 0x1ff) | 0, 0);
  /* proceed: delta != 0 (0x7db0e3 je 0x7db14d skips store+host). */
  assert.equal(wasm.isaac_pm_7db0a0_proceed(0 | 0, 0x00), 0);
  assert.equal(wasm.isaac_pm_7db0a0_proceed(0 | 0, 0x05), 0);
  assert.equal(wasm.isaac_pm_7db0a0_proceed(1 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db0a0_proceed(1 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db0a0_proceed(2 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db0a0_proceed(2 | 0, 0x02), 0);
  /* size gate: SIGNED ((end-begin) & ~3) > 0x4e4. */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x0000, 0x4e8 | 0), 1); /* 0x4e8 &~3 = 0x4e8 > 0x4e4 */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x0000, 0x4e4 | 0), 0); /* 0x4e4 SIG <= 0x4e4 skips */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x0000, 0x4e0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x1000, 0x14e8 | 0), 1);
  /* & ~3 rounds down: 0x4e6 -> 0x4e4 -> NOT > 0x4e4 -> 0. */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x0000, 0x4e6 | 0), 0);
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x0000, 0x4ea | 0), 1); /* 0x4e8 */
  /* SIGNED: a negative masked size (e.g. end-begin wraps negative) FAILS
     the SIGNED jle gate even though its unsigned bits are huge. */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0xffffffff, 0x0000), 0);
  /* Wide drives. */
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x100 | 0, 0x5e8 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0x1ff | 0, 0x4e7 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db0a0_size_gate(0xffffffff, 0xfffffe00), 0);
  /* host_needed = size gate AND slot != 0 (slot full dword). */
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x0000, 0x4e8 | 0, 0x1234), 1);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x0000, 0x4e8 | 0, 0), 0);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x0000, 0x4e4 | 0, 0x1234), 0);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x0000, 0x4e8 | 0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0xffffffff, 0x0000, 0x1234), 0);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x100 | 0, 0x5e8 | 0, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db0a0_host_needed(0x1ff | 0, 0x4e7 | 0, 0xffffffff) | 0, 0);
  /* flag_next: ((flag & 0xf0) + 0x10) | (flag & 0xf), byte-rounded with
     the 8-BIT add wrap: 0xf0 + 0x10 -> 0x00. */
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x00), 0x10);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x01), 0x11);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x0f), 0x1f);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x10), 0x20);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x20), 0x30);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0xf0), 0x00);  /* wrap! */
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0xfb), 0x0b);  /* 0xf0+0x10=0x00 | 0xb */
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0xff), 0x0f);
  /* Wide drives: only the byte matters (mov cl, byte load). */
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x100), 0x10);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x1f0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0x1fb) | 0, 0x0b);
  assert.equal(wasm.isaac_pm_7db0a0_flag_next(0xffffffff) | 0, 0x0f);
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0, 0x00], [0, 0x01], [0, 0x0f], [1, 0x00], [1, 0x01], [2, 0x00],
    [2, 0x01], [2, 0x02], [2, 0x0f], [-1, 0x00], [3, 0x05], [0x100, 0x07],
    [0x1ff, 0x00], [0xffffffff, 0x0f], [2, 0x1f0], [2, 0x1ff],
  ];
  for (const [count, flag] of rows) {
    assert.equal(wasm.isaac_pm_7db0a0_map_count(count | 0) | 0,
                 PM.pm7db0a0MapCount(count), `map ${count}`);
    assert.equal(wasm.isaac_pm_7db0a0_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db0a0Delta(count, flag), `delta ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db0a0_delta(count | 0, flag >>> 0) | 0,
                 v26BfDeltaPe(count, flag), `delta-pe ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db0a0_proceed(count | 0, flag >>> 0) | 0,
                 v26BfProceedPe(count, flag), `proceed ${count}/${flag}`);
  }
  for (const [b, e] of [[0, 0x4e8], [0, 0x4e4], [0, 0x4e0], [0, 0x4e6],
                        [0x1000, 0x14e8], [0xffffffff, 0x0000],
                        [0xffffffff, 0xfffffe00], [0x100, 0x5e8],
                        [0x1ff, 0x4e7]]) {
    assert.equal(wasm.isaac_pm_7db0a0_size_gate(b >>> 0, e >>> 0) | 0,
                 v26BfSizeGatePe(b, e), `size ${b}/${e}`);
  }
  for (const [flag, want] of [[0x00, 0x10], [0x01, 0x11], [0x0f, 0x1f],
                              [0xf0, 0x00], [0xfb, 0x0b], [0xff, 0x0f],
                              [0x100, 0x10], [0x1f0, 0x00], [0xffffffff, 0x0f]]) {
    assert.equal(wasm.isaac_pm_7db0a0_flag_next(flag >>> 0) | 0, want,
                 `flag-next ${flag}`);
  }
});

test("v26 BF: deterministic randomized differential corpus", () => {
  let seed = 0x007db0a0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const count = rnd();
    const flag = rnd();
    const begin = rnd();
    const end = rnd();
    const slot = rnd();
    assert.equal(wasm.isaac_pm_7db0a0_map_count(count | 0) | 0,
                 v26BfMapPe(count), `trial ${trial} map`);
    assert.equal(wasm.isaac_pm_7db0a0_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db0a0Delta(count, flag), `trial ${trial} delta-model`);
    assert.equal(wasm.isaac_pm_7db0a0_delta(count | 0, flag >>> 0) | 0,
                 v26BfDeltaPe(count, flag), `trial ${trial} delta-pe`);
    assert.equal(wasm.isaac_pm_7db0a0_proceed(count | 0, flag >>> 0) | 0,
                 v26BfProceedPe(count, flag), `trial ${trial} proceed`);
    /* proceed coherence: proceed == (delta != 0). */
    assert.equal(wasm.isaac_pm_7db0a0_proceed(count | 0, flag >>> 0) | 0,
                 wasm.isaac_pm_7db0a0_delta(count | 0, flag >>> 0) !== 0 ? 1 : 0,
                 `trial ${trial} proceed==delta`);
    assert.equal(wasm.isaac_pm_7db0a0_size_gate(begin >>> 0, end >>> 0) | 0,
                 v26BfSizeGatePe(begin, end), `trial ${trial} size`);
    assert.equal(wasm.isaac_pm_7db0a0_host_needed(begin >>> 0, end >>> 0,
                                                  slot >>> 0) | 0,
                 v26BfHostNeededPe(begin, end, slot), `trial ${trial} host`);
    /* host coherence: host_needed == size_gate && slot != 0. */
    assert.equal(wasm.isaac_pm_7db0a0_host_needed(begin >>> 0, end >>> 0,
                                                  slot >>> 0) | 0,
                 (wasm.isaac_pm_7db0a0_size_gate(begin >>> 0, end >>> 0) !== 0 &&
                  slot !== 0) ? 1 : 0,
                 `trial ${trial} host==gate&&slot`);
    assert.equal(wasm.isaac_pm_7db0a0_flag_next(flag >>> 0) | 0,
                 PM.pm7db0a0FlagNext(flag), `trial ${trial} flag-model`);
    assert.equal(wasm.isaac_pm_7db0a0_flag_next(flag >>> 0) | 0,
                 v26BfFlagNextPe(flag), `trial ${trial} flag-pe`);
    cases += 8;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db0a0_map_count(w | 0) | 0,
                 PM.pm7db0a0MapCount(w), `wide map ${w}`);
    assert.equal(wasm.isaac_pm_7db0a0_delta(w | 0, w >>> 0) | 0,
                 v26BfDeltaPe(w, w), `wide delta ${w}`);
    assert.equal(wasm.isaac_pm_7db0a0_proceed(w | 0, w >>> 0) | 0,
                 v26BfProceedPe(w, w), `wide proceed ${w}`);
    assert.equal(wasm.isaac_pm_7db0a0_size_gate(w >>> 0, (w + 0x4e8) >>> 0) | 0,
                 v26BfSizeGatePe(w, (w + 0x4e8) >>> 0), `wide size ${w}`);
    assert.equal(wasm.isaac_pm_7db0a0_flag_next(w >>> 0) | 0,
                 v26BfFlagNextPe(w), `wide flag ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 4815, `expected >= 4815 cases, got ${cases}`);
});

/* ====================================================================== */
/* v27 — BQ: VA 0x007db160 small-host decision island (NARROWED), the     */
/* body directly AFTER the v26 0x7db0a0 island in the 0x7db0xx queue     */
/* band. thiscall, ret plain; 124 insns, 4 E8 (0x7cb6e0 count resolver,  */
/* 0x9303f0 effect add, 0x75d850 RemoveCostume x2 — all stay host),      */
/* 1 observable store (byte [this+0x1eec]). Laws transcribed             */
/* branch-by-branch from disasm-007db160.txt.                            */
/* ====================================================================== */

function v27BqMapPe(count) {
  /* 0x007db172 sub eax,0 ; je 0x7db18a  (count==0 -> 0) ;
     0x007db177 sub eax,1 ; je 0x7db183  (count==1 -> 1) ; else 2. */
  const c = count | 0;
  return c === 0 ? 0 : c === 1 ? 1 : 2;
}

function v27BqDeltaPe(count, flag) {
  /* 0x007db18c mov cl,byte [edi+0x1eec] ; movzx ebx,cl ; and eax,0xf ;
     0x007db19a sub edx,eax ; 0x007db19c mov eax,0 ;
     0x007db1a1 cmovs edx,eax — SIGNED clamp: negative -> 0. */
  const mapped = v27BqMapPe(count);
  const delta = mapped - ((flag >>> 0) & 0xf);
  return delta < 0 ? 0 : delta;
}

function v27BqRunLoopPe(flag, delta) {
  /* 0x007db1a4 shr ebx,4 (high after the byte movzx) ; 0x007db1a7 cmp
     ebx,edx ; 0x007db1a9 jbe 0x7db2ac — UNSIGNED high <= delta skips. */
  const high = ((flag >>> 0) & 0xff) >> 4;
  return high > (delta >>> 0) ? 1 : 0;
}

function v27BqLoopCountPe(flag, delta) {
  /* 0x007db1af mov esi,ebx ; 0x007db1b1 sub esi,edx ; 0x007db1b3 mov
     [ebp-4],esi — 32-bit wrap; only reached when high > delta. */
  return ((((flag >>> 0) & 0xff) >> 4) - (delta >>> 0)) >>> 0;
}

function v27BqSizeGatePe(begin, end) {
  /* 0x007db1d2/0x007db26f sub eax,ecx (wrap) ; and eax,~3 ;
     0x007db1d7/0x007db274 cmp eax,0x4e4 ; SIGNED jle skips the effect
     call and SIGNED jg selects the slot arg — same predicate. */
  const size = ((end >>> 0) - (begin >>> 0)) & 0xfffffffc;
  return (size | 0) > 0x4e4 ? 1 : 0;
}

function v27BqEffectHostNeededPe(begin, end, slot) {
  /* 0x007db1de mov eax,[ecx+0x4e4] ; test eax,eax ; je 0x7db210 —
     effect call iff size gate AND slot != 0. */
  return v27BqSizeGatePe(begin, end) !== 0 && (slot >>> 0) !== 0 ? 1 : 0;
}

function v27BqFlagStorePe(count, flag, reloaded) {
  /* 0x007db2ac shl bl,4 ; and cl,0xf ; or cl,bl ; mov [edi+0x1eec],cl.
     bl = delta after a full loop (high decremented once per
     loopCount = high - delta iteration); on the SKIP path (high <=
     delta) bl stays high and cl is the PRE-LOOP flag -> stored byte
     == flag.  On the run path cl is the flag RELOADED at 0x7db2a6
     AFTER all host calls (post-call recapture). */
  const high = ((flag >>> 0) & 0xff) >> 4;
  const delta = v27BqDeltaPe(count, flag);
  if (high <= delta) {
    return (flag >>> 0) & 0xff;
  }
  return (((delta & 0xf) << 4) | ((reloaded >>> 0) & 0xf)) >>> 0;
}

test("v27 BQ: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v27 — BQ/);
  assert.match(h, /ISAAC_PM_BQ_VA_BODY = 0x007db160/);
  assert.match(h, /ISAAC_PM_BQ_VA_RET = 0x007db2c0/);
  assert.match(h, /ISAAC_PM_BQ_BODY_BYTES = 352/);
  assert.match(h, /ISAAC_PM_BQ_CALLSITE_COUNT = 3/);
  assert.match(h, /ISAAC_PM_BQ_COUNT_ID = 0x79/);
  assert.match(h, /ISAAC_PM_BQ_FLAG_OFF = 0x1eec/);
  assert.match(h, /ISAAC_PM_BQ_GAME_GLOBAL_VA = 0x00c7169c/);
  assert.match(h, /ISAAC_PM_BQ_VEC_BEGIN_OFF = 0x2a404/);
  assert.match(h, /ISAAC_PM_BQ_VEC_END_OFF = 0x2a408/);
  assert.match(h, /ISAAC_PM_BQ_SIZE_CMP = 0x4e4/);
  assert.match(h, /ISAAC_PM_BQ_SLOT_OFF = 0x4e4/);
  assert.match(h, /ISAAC_PM_BQ_RECEIVER_OFF = 0x1508/);
  assert.match(h, /ISAAC_PM_BQ_WALK_GATE_OFF = 0x1519/);
  assert.match(h, /ISAAC_PM_BQ_WALK_BEGIN_OFF = 0x150c/);
  assert.match(h, /ISAAC_PM_BQ_WALK_END_OFF = 0x1510/);
  assert.match(h, /ISAAC_PM_BQ_WALK_STRIDE = 0x10/);
  assert.match(h, /ISAAC_PM_BQ_WALK_ID_CMP = 0x139/);
  assert.match(h, /ISAAC_PM_BQ_HOST_VA_COUNT = 0x007cb6e0/);
  assert.match(h, /ISAAC_PM_BQ_HOST_VA_EFFECT = 0x009303f0/);
  assert.match(h, /ISAAC_PM_BQ_HOST_VA_REMOVE_COSTUME = 0x0075d850/);
  /* Model constants agree. */
  assert.equal(PM.PM_BQ_VA_BODY, 0x007db160);
  assert.equal(PM.PM_BQ_VA_RET, 0x007db2c0);
  assert.equal(PM.PM_BQ_BODY_BYTES, 352);
  assert.equal(PM.PM_BQ_CALLSITE_COUNT, 3);
  assert.equal(PM.PM_BQ_COUNT_ID, 0x79);
  assert.equal(PM.PM_BQ_FLAG_OFF, 0x1eec);
  assert.equal(PM.PM_BQ_GAME_GLOBAL_VA, 0x00c7169c);
  assert.equal(PM.PM_BQ_VEC_BEGIN_OFF, 0x2a404);
  assert.equal(PM.PM_BQ_VEC_END_OFF, 0x2a408);
  assert.equal(PM.PM_BQ_SIZE_CMP, 0x4e4);
  assert.equal(PM.PM_BQ_SLOT_OFF, 0x4e4);
  assert.equal(PM.PM_BQ_RECEIVER_OFF, 0x1508);
  assert.equal(PM.PM_BQ_WALK_GATE_OFF, 0x1519);
  assert.equal(PM.PM_BQ_WALK_BEGIN_OFF, 0x150c);
  assert.equal(PM.PM_BQ_WALK_END_OFF, 0x1510);
  assert.equal(PM.PM_BQ_WALK_STRIDE, 0x10);
  assert.equal(PM.PM_BQ_WALK_ID_CMP, 0x139);
  assert.equal(PM.PM_BQ_HOST_VA_COUNT, 0x007cb6e0);
  assert.equal(PM.PM_BQ_HOST_VA_EFFECT, 0x009303f0);
  assert.equal(PM.PM_BQ_HOST_VA_REMOVE_COSTUME, 0x0075d850);
  /* Raw disasm needles (cpu-dump of the 0x7db160..0x7db2c0 body). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v27-7db160", "disasm-007db160.txt"),
    "utf8");
  assert.match(dis, /push\s+0x79/);
  assert.match(dis, /call\s+0x7cb6e0/);
  assert.match(dis, /call\s+0x9303f0/);
  assert.match(dis, /call\s+0x75d850/);
  assert.match(dis, /jbe\s+0x7db2ac/);
  assert.match(dis, /shl\s+bl,\s*4/);
  assert.match(dis, /mov\s+byte ptr \[edi \+ 0x1eec\], cl/);
  assert.match(dis, /0x007db2c0:\s+c3\s+ret/);
  assert.match(dis, /first_ret 0x007db2c0/);
  assert.match(dis, /E8 4/);
});

test("v27 BQ: scalar laws (map/delta, UNSIGNED loop gate, SIGNED size, recapture store)", () => {
  /* map_count: 0->0, 1->1, else->2 (full-dword sub/je chain). */
  assert.equal(wasm.isaac_pm_7db160_map_count(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db160_map_count(1 | 0), 1);
  assert.equal(wasm.isaac_pm_7db160_map_count(2 | 0), 2);
  assert.equal(wasm.isaac_pm_7db160_map_count(3 | 0), 2);
  assert.equal(wasm.isaac_pm_7db160_map_count(-1 | 0), 2);
  assert.equal(wasm.isaac_pm_7db160_map_count(0x7fffffff), 2);
  /* Wide drives on the wasm arg are never pre-masked (v9 rule). */
  assert.equal(wasm.isaac_pm_7db160_map_count(0x100 | 0), 2);
  assert.equal(wasm.isaac_pm_7db160_map_count(0x1ff | 0), 2);
  assert.equal(wasm.isaac_pm_7db160_map_count(0xffffffff), 2);
  /* delta: SIGNED clamp — mapped - (flag & 0xf), negative -> 0. */
  assert.equal(wasm.isaac_pm_7db160_delta(0 | 0, 0x00), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(0 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(0 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(1 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db160_delta(1 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x00), 2);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x01), 1);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x02), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x1f0) | 0, 2);
  assert.equal(wasm.isaac_pm_7db160_delta(2 | 0, 0x1ff) | 0, 0);
  /* run_loop: UNSIGNED (flag&0xff)>>4 > delta — jbe skips at 0x7db1a9. */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x00, 0), 0);   /* high 0 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x10, 1), 0);   /* high 1 > 1? no -> 0 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x10, 0), 1);   /* high 1 > 0 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x20, 2), 0);   /* high 2 <= 2 skips */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x20, 1), 1);   /* high 2 > 1 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x80, 8), 0);   /* UNSIGNED 8 <= 8 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x80, 7), 1);
  assert.equal(wasm.isaac_pm_7db160_run_loop(0xff, 15), 0);  /* high 15 <= 15 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0xff, 14), 1);
  /* WIDE delta: unsigned compare — 0xffffffff delta never runs. */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x80, 0xffffffff), 0);
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x100 | 0, 0), 0);  /* byte 0x00 -> high 0, 0 > 0 false */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x1ff | 0, 0), 1);  /* 0xff -> high 15 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0xffffffff, 0), 1); /* 0xff -> high 15 */
  assert.equal(wasm.isaac_pm_7db160_run_loop(0x100 | 0, 1), 0);  /* high 0 <= 1 */
  /* loop_count: raw ((flag&0xff)>>4) - delta, 32-bit wrap (callers
     gate on run_loop; machine only reaches this when high > delta). */
  assert.equal(wasm.isaac_pm_7db160_loop_count(0x10, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db160_loop_count(0x20, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db160_loop_count(0xff, 0) | 0, 15);
  assert.equal(wasm.isaac_pm_7db160_loop_count(0xff, 14) | 0, 1);
  assert.equal(wasm.isaac_pm_7db160_loop_count(0x10, 2) | 0, -1); /* wrap 1-2 */
  assert.equal(wasm.isaac_pm_7db160_loop_count(0x1ff | 0, 0) | 0, 15);
  assert.equal(wasm.isaac_pm_7db160_loop_count(0xffffffff, 0) | 0, 15);
  /* size gate: SIGNED ((end-begin) & ~3) > 0x4e4 — drives BOTH the
     0x9303f0 gate (0x7db1dc) and the 0x75d850 arg (0x7db279). */
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x0000, 0x4e8 | 0), 1);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x0000, 0x4e4 | 0), 0);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x0000, 0x4e0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x1000, 0x14e8 | 0), 1);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x0000, 0x4e6 | 0), 0);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x0000, 0x4ea | 0), 1);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0xffffffff, 0x0000), 0);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x100 | 0, 0x5e8 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0x1ff | 0, 0x4e7 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db160_size_gate(0xffffffff, 0xfffffe00), 0);
  /* effect_host_needed = size gate AND slot != 0 (slot full dword). */
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x0000, 0x4e8 | 0, 0x1234), 1);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x0000, 0x4e8 | 0, 0), 0);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x0000, 0x4e4 | 0, 0x1234), 0);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x0000, 0x4e8 | 0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0xffffffff, 0x0000, 0x1234), 0);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x100 | 0, 0x5e8 | 0, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db160_effect_host_needed(0x1ff | 0, 0x4e7 | 0, 0xffffffff) | 0, 0);
  /* flag_store: recapture-aware byte law.
     Skip path (UNSIGNED high <= delta): stored byte == original flag
     (pre-loop load); the reloaded flag is IGNORED. */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x10, 0xab), 0x10);
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x20, 0xff), 0x20);
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x05, 0x1e), 0x05);
  assert.equal(wasm.isaac_pm_7db160_flag_store(0 | 0, 0x00, 0x9f), 0x00);
  assert.equal(wasm.isaac_pm_7db160_flag_store(1 | 0, 0x10, 0x7f), 0x10);
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x1ff | 0, 0xab) | 0,
               0x0b); /* wide: byte 0xff, low 0xf, delta 0, high 15 > 0 -> run, (0<<4)|0xb */
  /* Run path: (delta << 4) | (reloaded_flag & 0xf) — the low nibble is
     taken from the flag RELOADED at 0x7db2a6 AFTER the host calls, NOT
     the pre-loop flag (post-call recapture). */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x93, 0x2e), 0x0e); /* delta 0, reload low e */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x93, 0x03), 0x03); /* reload low 3 */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0xb5, 0xff), 0x0f);
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x15, 0x1e), 0x0e); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x21, 0x2b), 0x1b); /* delta 1 -> (1<<4)|0xb */
  assert.equal(wasm.isaac_pm_7db160_flag_store(1 | 0, 0x20, 0x5c), 0x1c); /* delta 1 */
  assert.equal(wasm.isaac_pm_7db160_flag_store(0 | 0, 0x1f, 0x0a), 0x0a); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x30, 0xf0) | 0, 0x20); /* delta 2 -> (2<<4)|0 */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x30, 0x0f) | 0, 0x2f); /* delta 2 -> (2<<4)|0xf */
  /* The recapture discriminator: run path must NOT use the pre-loop low
     nibble. count=2/flag=0x93 has pre-loop low 3; reload low 7 -> 0x07,
     NOT (0<<4)|3 = 0x03. */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x93, 0x07), 0x07);
  /* Wide drives on flag: only the byte matters (movzx from the byte load). */
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0x193, 0x07) | 0, 0x07);
  assert.equal(wasm.isaac_pm_7db160_flag_store(2 | 0, 0xffffffff, 0x07) | 0, 0x07);
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0, 0x00], [0, 0x01], [0, 0x0f], [1, 0x00], [1, 0x01], [2, 0x00],
    [2, 0x01], [2, 0x02], [2, 0x0f], [2, 0x10], [2, 0x11], [2, 0x15],
    [2, 0x20], [2, 0x93], [1, 0x10], [0, 0x1f], [-1, 0x00], [3, 0xff],
  ];
  for (const [count, flag] of rows) {
    assert.equal(wasm.isaac_pm_7db160_map_count(count | 0) | 0,
                 PM.pm7db160MapCount(count), `map ${count}`);
    assert.equal(wasm.isaac_pm_7db160_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db160Delta(count, flag), `delta ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db160_delta(count | 0, flag >>> 0) | 0,
                 v27BqDeltaPe(count, flag), `delta-pe ${count}/${flag}`);
  }
  for (const [flag, delta] of [[0x00, 0], [0x10, 0], [0x10, 1], [0x20, 1],
                               [0x20, 2], [0x80, 7], [0x80, 8], [0x80, 9],
                               [0xff, 14], [0xff, 15], [0x1ff, 0],
                               [0xffffffff, 0], [0x100, 1]]) {
    assert.equal(wasm.isaac_pm_7db160_run_loop(flag >>> 0, delta >>> 0) | 0,
                 v27BqRunLoopPe(flag, delta), `run ${flag}/${delta}`);
    assert.equal(wasm.isaac_pm_7db160_loop_count(flag >>> 0, delta >>> 0) | 0,
                 v27BqLoopCountPe(flag, delta) | 0, `loop ${flag}/${delta}`);
  }
  for (const [b, e] of [[0, 0x4e8], [0, 0x4e4], [0, 0x4e0], [0, 0x4e6],
                        [0x1000, 0x14e8], [0xffffffff, 0x0000],
                        [0x100, 0x5e8], [0x1ff, 0x4e7], [0xffffffff, 0xfffffe00]]) {
    assert.equal(wasm.isaac_pm_7db160_size_gate(b >>> 0, e >>> 0) | 0,
                 v27BqSizeGatePe(b, e), `size ${b}/${e}`);
  }
  const storeRows = [
    [2, 0x10, 0xab, 0x10], [2, 0x20, 0xff, 0x20], [2, 0x05, 0x1e, 0x05],
    [0, 0x00, 0x9f, 0x00], [1, 0x10, 0x7f, 0x10], [2, 0x93, 0x2e, 0x0e],
    [2, 0x93, 0x07, 0x07], [2, 0xb5, 0xff, 0x0f], [2, 0x15, 0x1e, 0x0e],
    [2, 0x21, 0x2b, 0x1b], [1, 0x20, 0x5c, 0x1c], [0, 0x1f, 0x0a, 0x0a],
    [2, 0x30, 0xf0, 0x20], [2, 0x30, 0x0f, 0x2f], [2, 0x1ff, 0xab, 0x0b],
    [2, 0x193, 0x07, 0x07], [2, 0xffffffff, 0x07, 0x07],
  ];
  for (const [count, flag, reloaded, want] of storeRows) {
    assert.equal(wasm.isaac_pm_7db160_flag_store(count | 0, flag >>> 0,
                                                 reloaded >>> 0) | 0,
                 want, `store ${count}/${flag}/${reloaded}`);
    assert.equal(wasm.isaac_pm_7db160_flag_store(count | 0, flag >>> 0,
                                                 reloaded >>> 0) | 0,
                 v27BqFlagStorePe(count, flag, reloaded),
                 `store-pe ${count}/${flag}/${reloaded}`);
    assert.equal(wasm.isaac_pm_7db160_flag_store(count | 0, flag >>> 0,
                                                 reloaded >>> 0) | 0,
                 PM.pm7db160FlagStore(count, flag, reloaded),
                 `store-model ${count}/${flag}/${reloaded}`);
  }
});

test("v27 BQ: deterministic randomized differential corpus", () => {
  let seed = 0x007db160 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const count = rnd() | 0;
    const flag = rnd() >>> 0;
    const delta = rnd() >>> 0;
    const begin = rnd() >>> 0;
    const end = rnd() >>> 0;
    const slot = rnd() >>> 0;
    const reloaded = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7db160_map_count(count | 0) | 0,
                 v27BqMapPe(count), `trial ${trial} map`);
    assert.equal(wasm.isaac_pm_7db160_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db160Delta(count, flag), `trial ${trial} delta-model`);
    assert.equal(wasm.isaac_pm_7db160_delta(count | 0, flag >>> 0) | 0,
                 v27BqDeltaPe(count, flag), `trial ${trial} delta-pe`);
    assert.equal(wasm.isaac_pm_7db160_run_loop(flag >>> 0, delta >>> 0) | 0,
                 v27BqRunLoopPe(flag, delta), `trial ${trial} run`);
    assert.equal(wasm.isaac_pm_7db160_loop_count(flag >>> 0, delta >>> 0) | 0,
                 v27BqLoopCountPe(flag, delta) | 0, `trial ${trial} loop`);
    /* run/loop coherence: run_loop == (high > delta), and when running
       the machine-visible loop count is >= 1 (raw export may wrap). */
    const high = (flag & 0xff) >>> 4;
    assert.equal(
      wasm.isaac_pm_7db160_run_loop(flag >>> 0, delta >>> 0) | 0,
      (high >>> 0) > (delta >>> 0) ? 1 : 0,
      `trial ${trial} run==high>delta`);
    assert.equal(
      wasm.isaac_pm_7db160_loop_count(flag >>> 0, delta >>> 0) | 0,
      ((high - (delta >>> 0)) >>> 0) | 0,
      `trial ${trial} loop==high-delta`);
    assert.equal(wasm.isaac_pm_7db160_size_gate(begin >>> 0, end >>> 0) | 0,
                 v27BqSizeGatePe(begin, end), `trial ${trial} size`);
    assert.equal(wasm.isaac_pm_7db160_effect_host_needed(begin >>> 0, end >>> 0,
                                                         slot >>> 0) | 0,
                 v27BqEffectHostNeededPe(begin, end, slot),
                 `trial ${trial} host`);
    /* host coherence: effect_host_needed == size_gate && slot != 0. */
    assert.equal(wasm.isaac_pm_7db160_effect_host_needed(begin >>> 0, end >>> 0,
                                                         slot >>> 0) | 0,
                 (wasm.isaac_pm_7db160_size_gate(begin >>> 0, end >>> 0) !== 0 &&
                  slot !== 0) ? 1 : 0,
                 `trial ${trial} host==gate&&slot`);
    assert.equal(wasm.isaac_pm_7db160_flag_store(count | 0, flag >>> 0,
                                                 reloaded >>> 0) | 0,
                 PM.pm7db160FlagStore(count, flag, reloaded),
                 `trial ${trial} store-model`);
    assert.equal(wasm.isaac_pm_7db160_flag_store(count | 0, flag >>> 0,
                                                 reloaded >>> 0) | 0,
                 v27BqFlagStorePe(count, flag, reloaded),
                 `trial ${trial} store-pe`);
    /* store/run coherence: skip path (high <= delta) stores the original
       flag byte regardless of the reloaded flag. */
    const wantFlag = v27BqFlagStorePe(count, flag, reloaded);
    assert.equal(wantFlag, PM.pm7db160FlagStore(count, flag, reloaded),
                 `trial ${trial} pe==model`);
    cases += 11;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db160_map_count(w | 0) | 0,
                 PM.pm7db160MapCount(w), `wide map ${w}`);
    assert.equal(wasm.isaac_pm_7db160_delta(w | 0, w >>> 0) | 0,
                 v27BqDeltaPe(w, w), `wide delta ${w}`);
    assert.equal(wasm.isaac_pm_7db160_run_loop(w >>> 0, w >>> 0) | 0,
                 v27BqRunLoopPe(w, w), `wide run ${w}`);
    assert.equal(wasm.isaac_pm_7db160_loop_count(w >>> 0, w >>> 0) | 0,
                 v27BqLoopCountPe(w, w) | 0, `wide loop ${w}`);
    assert.equal(wasm.isaac_pm_7db160_size_gate(w >>> 0, (w + 0x4e8) >>> 0) | 0,
                 v27BqSizeGatePe(w, (w + 0x4e8) >>> 0), `wide size ${w}`);
    assert.equal(wasm.isaac_pm_7db160_effect_host_needed(w >>> 0,
                                                         (w + 0x4e8) >>> 0,
                                                         w >>> 0) | 0,
                 v27BqEffectHostNeededPe(w, (w + 0x4e8) >>> 0, w),
                 `wide host ${w}`);
    assert.equal(wasm.isaac_pm_7db160_flag_store(w | 0, w >>> 0, w >>> 0) | 0,
                 v27BqFlagStorePe(w, w, w), `wide store ${w}`);
    cases += 7;
  }
  assert.ok(cases >= 6600 + 21, `expected >= 6621 cases, got ${cases}`);
});

/* ====================================================================== */
/* v28 — BR: VA 0x007db2d0 small-host advance island (NARROWED), the      */
/* function the v27 header records as "next function 0x007db2d0"          */
/* (0x7db200 lies INSIDE the landed v27 0x7db160 body — stale note).      */
/* thiscall, ret plain; 41 insns, 1 E8 (0x7cb6e0 count resolver host),    */
/* 1 observable store (byte [this+0x1eec] at 0x7db31f), 2 rets            */
/* (0x7db328 -> 1, 0x7db32c -> 0). Laws transcribed branch-by-branch      */
/* from disasm-007db2d0.txt; no recapture (single flag load at 0x7db2f4   */
/* after the only host call; no host call between load and store).        */
/* ====================================================================== */

function v28BrMapPe(count) {
  /* 0x007db2da sub eax,0 ; je 0x7db2f2 (count==0 -> 0) ;
     0x007db2df sub eax,1 ; je 0x7db2eb (count==1 -> 1) ; else 2. */
  const c = count | 0;
  return c === 0 ? 0 : c === 1 ? 1 : 2;
}

function v28BrDeltaPe(count, flag) {
  /* 0x007db2f4 mov dl,byte [esi+0x1eec] ; movzx eax,dl ; and eax,0xf ;
     0x007db300 sub ecx,eax ; 0x007db302 mov eax,0 ;
     0x007db307 cmovs ecx,eax — SIGNED clamp: negative -> 0. */
  const mapped = v28BrMapPe(count);
  const delta = mapped - ((flag >>> 0) & 0xf);
  return delta < 0 ? 0 : delta;
}

function v28BrProceedPe(count, flag) {
  /* 0x007db30a test ecx,ecx ; 0x007db30c je 0x7db329 — delta != 0
     stores the advanced flag and returns 1; delta == 0 returns 0
     WITHOUT the store. */
  return v28BrDeltaPe(count, flag) !== 0 ? 1 : 0;
}

function v28BrAdvancePe(flag) {
  /* 0x007db30e mov al,dl ; inc dl ; shr al,4 ; and dl,0xf ; dec al ;
     shl al,4 ; or al,dl — 8-bit wrap on BOTH nibbles: high 0 -> dec
     -> 0xff -> shl 4 -> 0xf0; low 0xf -> inc -> 0x00 -> & 0xf -> 0. */
  const high = ((flag >>> 0) & 0xff) >> 4;
  const low = (flag >>> 0) & 0xff;
  return (((((high - 1) & 0xf) << 4) | ((low + 1) & 0xf)) & 0xff) >>> 0;
}

function v28BrFlagStorePe(count, flag) {
  /* Composition: store at 0x7db31f happens iff proceed and writes
     advance(flag); the delta==0 epilogue (0x7db329) does NOT touch
     [this+0x1eec] — effective byte stays the original flag. */
  return v28BrProceedPe(count, flag) === 0
    ? (flag >>> 0) & 0xff
    : v28BrAdvancePe(flag);
}

test("v28 BR: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v28 — BR/);
  assert.match(h, /ISAAC_PM_BR_VA_BODY = 0x007db2d0/);
  assert.match(h, /ISAAC_PM_BR_VA_RET_ONE = 0x007db328/);
  assert.match(h, /ISAAC_PM_BR_VA_RET_ZERO = 0x007db32c/);
  assert.match(h, /ISAAC_PM_BR_BODY_BYTES = 92/);
  assert.match(h, /ISAAC_PM_BR_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_BR_COUNT_ID = 0x79/);
  assert.match(h, /ISAAC_PM_BR_FLAG_OFF = 0x1eec/);
  assert.match(h, /ISAAC_PM_BR_HOST_VA_COUNT = 0x007cb6e0/);
  assert.match(h, /ISAAC_PM_BR_CALLER_VA = 0x00774114/);
  /* Model constants agree. */
  assert.equal(PM.PM_BR_VA_BODY, 0x007db2d0);
  assert.equal(PM.PM_BR_VA_RET_ONE, 0x007db328);
  assert.equal(PM.PM_BR_VA_RET_ZERO, 0x007db32c);
  assert.equal(PM.PM_BR_BODY_BYTES, 92);
  assert.equal(PM.PM_BR_CALLSITE_COUNT, 1);
  assert.equal(PM.PM_BR_COUNT_ID, 0x79);
  assert.equal(PM.PM_BR_FLAG_OFF, 0x1eec);
  assert.equal(PM.PM_BR_HOST_VA_COUNT, 0x007cb6e0);
  assert.equal(PM.PM_BR_CALLER_VA, 0x00774114);
  /* Raw disasm needles (cpu-dump of the 0x7db2d0..0x7db32c body). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v28-7db2d0", "disasm-007db2d0.txt"),
    "utf8");
  assert.match(dis, /push\s+0x79/);
  assert.match(dis, /call\s+0x7cb6e0/);
  assert.match(dis, /cmovs\s+ecx,\s*eax/);
  assert.match(dis, /inc\s+dl/);
  assert.match(dis, /dec\s+al/);
  assert.match(dis, /mov\s+byte ptr \[esi \+ 0x1eec\], al/);
  assert.match(dis, /0x007db328:\s+c3\s+ret/);
  assert.match(dis, /0x007db32c:\s+c3\s+ret/);
  assert.match(dis, /E8 1/);
});

test("v28 BR: scalar laws (map/delta, proceed gate, 8-bit-wrap advance, store composition)", () => {
  /* map_count: 0->0, 1->1, else->2 (full-dword sub/je chain). */
  assert.equal(wasm.isaac_pm_7db2d0_map_count(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(1 | 0), 1);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(2 | 0), 2);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(3 | 0), 2);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(-1 | 0), 2);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(0x7fffffff), 2);
  /* Wide drives on the wasm arg are never pre-masked (v9 rule). */
  assert.equal(wasm.isaac_pm_7db2d0_map_count(0x100 | 0), 2);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(0x1ff | 0), 2);
  assert.equal(wasm.isaac_pm_7db2d0_map_count(0xffffffff), 2);
  /* delta: SIGNED clamp — mapped - (flag & 0xf), negative -> 0. */
  assert.equal(wasm.isaac_pm_7db2d0_delta(0 | 0, 0x00), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(0 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(0 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(1 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db2d0_delta(1 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x00), 2);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x01), 1);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x02), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x1f0) | 0, 2);
  assert.equal(wasm.isaac_pm_7db2d0_delta(2 | 0, 0x1ff) | 0, 0);
  /* proceed: delta != 0 -> 1 (the return value in al; also gates the
     store). */
  assert.equal(wasm.isaac_pm_7db2d0_proceed(0 | 0, 0x00), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(0 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(1 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(1 | 0, 0x01), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0x00), 1);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0x01), 1);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0x02), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0x0f), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0x1ff | 0), 0);
  assert.equal(wasm.isaac_pm_7db2d0_proceed(2 | 0, 0xffffffff), 0);
  /* advance: ((high-1)&0xf)<<4 | ((low+1)&0xf), 8-bit wrap both sides.
     high 0 -> 0xf (dec al 0 -> 0xff -> shl 4 -> 0xf0); low 0xf -> 0
     (inc dl 0xff -> 0x00 -> & 0xf -> 0). */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x00), 0xf1); /* h0->f, l0->1 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x01), 0xf2);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x0e), 0xff);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x0f), 0xf0); /* l0xf->0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x10), 0x01); /* h1->0, l0->1 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x11), 0x02);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x1f), 0x00); /* h1->0, lf->0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x20), 0x11);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x30), 0x21);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x3f), 0x20);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0xa0), 0x91);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0xf0), 0xe1);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0xff), 0xe0); /* hf->e, lf->0 */
  /* Wide drives: only the byte matters (movzx from the byte load). */
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x130) | 0, 0x21);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0x1ff | 0), 0xe0);
  assert.equal(wasm.isaac_pm_7db2d0_flag_advance(0xffffffff), 0xe0);
  /* flag_store: proceed ? advance : flag (effective byte after call). */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(0 | 0, 0x00), 0x00); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(0 | 0, 0x10), 0x10); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(0 | 0, 0x3f), 0x3f); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(1 | 0, 0x01), 0x01); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x02), 0x02); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x0f), 0x0f); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(1 | 0, 0x00), 0xf1); /* delta 1 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x00), 0xf1); /* delta 2 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x01), 0xf2); /* delta 1 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x10), 0x01); /* delta 2 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x11), 0x02); /* delta 1 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x20), 0x11); /* delta 2 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x30), 0x21); /* delta 2 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(3 | 0, 0x0f), 0x0f); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(-1 | 0, 0x3f), 0x3f); /* delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0x1ff | 0), 0xff); /* flag 0xff, delta 0 */
  assert.equal(wasm.isaac_pm_7db2d0_flag_store(2 | 0, 0xffffffff), 0xff); /* delta 0 */
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0, 0x00], [0, 0x01], [0, 0x0f], [1, 0x00], [1, 0x01], [2, 0x00],
    [2, 0x01], [2, 0x02], [2, 0x0f], [2, 0x10], [2, 0x11], [2, 0x1f],
    [2, 0x20], [2, 0x3f], [2, 0x93], [1, 0x10], [0, 0x1f], [3, 0xff],
  ];
  for (const [count, flag] of rows) {
    assert.equal(wasm.isaac_pm_7db2d0_map_count(count | 0) | 0,
                 PM.pm7db2d0MapCount(count), `map ${count}`);
    assert.equal(wasm.isaac_pm_7db2d0_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0Delta(count, flag), `delta ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_delta(count | 0, flag >>> 0) | 0,
                 v28BrDeltaPe(count, flag), `delta-pe ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_proceed(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0Proceed(count, flag), `proceed ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_advance(flag >>> 0) | 0,
                 PM.pm7db2d0FlagAdvance(flag), `advance ${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_advance(flag >>> 0) | 0,
                 v28BrAdvancePe(flag), `advance-pe ${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_store(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0FlagStore(count, flag), `store ${count}/${flag}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_store(count | 0, flag >>> 0) | 0,
                 v28BrFlagStorePe(count, flag), `store-pe ${count}/${flag}`);
  }
});

test("v28 BR: deterministic randomized differential corpus", () => {
  let seed = 0x007db2d0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const count = rnd() | 0;
    const flag = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7db2d0_map_count(count | 0) | 0,
                 v28BrMapPe(count), `trial ${trial} map`);
    assert.equal(wasm.isaac_pm_7db2d0_delta(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0Delta(count, flag), `trial ${trial} delta-model`);
    assert.equal(wasm.isaac_pm_7db2d0_delta(count | 0, flag >>> 0) | 0,
                 v28BrDeltaPe(count, flag), `trial ${trial} delta-pe`);
    assert.equal(wasm.isaac_pm_7db2d0_proceed(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0Proceed(count, flag), `trial ${trial} proceed`);
    /* proceed coherence: proceed == (delta != 0). */
    assert.equal(
      wasm.isaac_pm_7db2d0_proceed(count | 0, flag >>> 0) | 0,
      PM.pm7db2d0Delta(count, flag) !== 0 ? 1 : 0,
      `trial ${trial} proceed==delta!=0`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_advance(flag >>> 0) | 0,
                 PM.pm7db2d0FlagAdvance(flag), `trial ${trial} advance-model`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_advance(flag >>> 0) | 0,
                 v28BrAdvancePe(flag), `trial ${trial} advance-pe`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_store(count | 0, flag >>> 0) | 0,
                 PM.pm7db2d0FlagStore(count, flag), `trial ${trial} store-model`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_store(count | 0, flag >>> 0) | 0,
                 v28BrFlagStorePe(count, flag), `trial ${trial} store-pe`);
    /* store coherence: delta == 0 -> store == flag byte; else advance. */
    const want = v28BrFlagStorePe(count, flag);
    assert.equal(
      want,
      PM.pm7db2d0Delta(count, flag) === 0
        ? (flag >>> 0) & 0xff
        : v28BrAdvancePe(flag),
      `trial ${trial} store==proceed?advance:flag`);
    cases += 9;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db2d0_map_count(w | 0) | 0,
                 PM.pm7db2d0MapCount(w), `wide map ${w}`);
    assert.equal(wasm.isaac_pm_7db2d0_delta(w | 0, w >>> 0) | 0,
                 v28BrDeltaPe(w, w), `wide delta ${w}`);
    assert.equal(wasm.isaac_pm_7db2d0_proceed(w | 0, w >>> 0) | 0,
                 v28BrProceedPe(w, w), `wide proceed ${w}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_advance(w >>> 0) | 0,
                 v28BrAdvancePe(w), `wide advance ${w}`);
    assert.equal(wasm.isaac_pm_7db2d0_flag_store(w | 0, w >>> 0) | 0,
                 v28BrFlagStorePe(w, w), `wide store ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 5400 + 15, `expected >= 5415 cases, got ${cases}`);
});

/* ====================================================================== */
/* v29 — BS: VA 0x007db330 scale island (NARROWED). __stdcall ret 4,      */
/* 19 insns, 0 E8, 0 indirect, 0 mem-stores, 2 rets (0x7db355 SCALED,     */
/* 0x7db35b RAW). prologue mov eax,[0xc71678] ; cmp [eax+0x26614],2 ; jl  */
/* RAW — SIGNED mode < 2 returns the arg unchanged. Scale path: mov       */
/* eax,1 ; shr ecx,3 (LOGICAL) ; cmp edx,0x10 ; cmovge eax,ecx (SIGNED)   */
/* -> (int32)arg >= 0x10 ? (arg >>> 3) : 1. Laws from                    */
/* disasm-007db330.txt; 6 direct E8 callers (0x7741ac/0x7741d4/0x774277   */
/* in the 0x7740d0 band + 0x778656/0x7787bd/0x7787ed in the 0x778xxx      */
/* band), all feeding the PM [edi+0x13bc] slot count. Full-dword only —   */
/* no byte narrow, zero uint8_t params.                                   */
/* ====================================================================== */

function v29BsModeGe2Pe(mode) {
  /* 0x007db33b cmp [eax+0x26614],2 ; 0x007db342 jl 0x7db358 — SIGNED:
     (int32)mode < 2 chains to the raw epilogue (arg unchanged). */
  return (mode | 0) >= 2 ? 1 : 0;
}

function v29BsScalePe(arg) {
  /* 0x007db344 mov ecx,edx ; 0x007db346 mov eax,1 ; 0x007db34b shr
     ecx,3 ; 0x007db34e cmp edx,0x10 ; 0x007db351 cmovge eax,ecx —
     shr LOGICAL, cmovge SIGNED. */
  return (arg | 0) >= 0x10 ? (arg >>> 3) >>> 0 : 1;
}

function v29BsValuePe(arg, mode) {
  /* Whole body: gate selects the raw (mov eax,edx at 0x7db358) or the
     scaled (0x7db355) epilogue. */
  return v29BsModeGe2Pe(mode) === 0 ? arg >>> 0 : v29BsScalePe(arg);
}

test("v29 BS: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v29 — BS/);
  assert.match(h, /ISAAC_PM_BS_VA_BODY = 0x007db330/);
  assert.match(h, /ISAAC_PM_BS_VA_RET_SCALED = 0x007db355/);
  assert.match(h, /ISAAC_PM_BS_VA_RET_RAW = 0x007db35b/);
  assert.match(h, /ISAAC_PM_BS_BODY_BYTES = 43/);
  assert.match(h, /ISAAC_PM_BS_CALLSITE_COUNT = 6/);
  assert.match(h, /ISAAC_PM_BS_CALLER0_VA = 0x007741ac/);
  assert.match(h, /ISAAC_PM_BS_CALLER1_VA = 0x007741d4/);
  assert.match(h, /ISAAC_PM_BS_CALLER2_VA = 0x00774277/);
  assert.match(h, /ISAAC_PM_BS_CALLER3_VA = 0x00778656/);
  assert.match(h, /ISAAC_PM_BS_CALLER4_VA = 0x007787bd/);
  assert.match(h, /ISAAC_PM_BS_CALLER5_VA = 0x007787ed/);
  assert.match(h, /ISAAC_PM_BS_GAME_GLOBAL_VA = 0x00c71678/);
  assert.match(h, /ISAAC_PM_BS_MODE_OFF = 0x26614/);
  assert.match(h, /ISAAC_PM_BS_MODE_CMP = 2/);
  assert.match(h, /ISAAC_PM_BS_SCALE_SHIFT = 3/);
  assert.match(h, /ISAAC_PM_BS_MIN_ARG = 0x10/);
  /* Model constants agree (BS island mirrors). */
  assert.equal(PM.PM_BS_VA_BODY, 0x007db330);
  assert.equal(PM.PM_BS_VA_RET_SCALED, 0x007db355);
  assert.equal(PM.PM_BS_VA_RET_RAW, 0x007db35b);
  assert.equal(PM.PM_BS_BODY_BYTES, 43);
  assert.equal(PM.PM_BS_CALLSITE_COUNT, 6);
  assert.equal(PM.PM_BS_CALLER0_VA, 0x007741ac);
  assert.equal(PM.PM_BS_CALLER1_VA, 0x007741d4);
  assert.equal(PM.PM_BS_CALLER2_VA, 0x00774277);
  assert.equal(PM.PM_BS_CALLER3_VA, 0x00778656);
  assert.equal(PM.PM_BS_CALLER4_VA, 0x007787bd);
  assert.equal(PM.PM_BS_CALLER5_VA, 0x007787ed);
  assert.equal(PM.PM_BS_GAME_GLOBAL_VA, 0x00c71678);
  assert.equal(PM.PM_BS_MODE_OFF, 0x26614);
  assert.equal(PM.PM_BS_MODE_CMP, 2);
  assert.equal(PM.PM_BS_SCALE_SHIFT, 3);
  assert.equal(PM.PM_BS_MIN_ARG, 0x10);
  /* Raw disasm needles (cpu-dump of the 0x7db330..0x7db35b body). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v29-7db330", "disasm-007db330.txt"),
    "utf8");
  assert.match(dis, /mov\s+eax, dword ptr \[0xc71678\]/);
  assert.match(dis, /mov\s+edx, dword ptr \[ebp \+ 8\]/);
  assert.match(dis, /cmp\s+dword ptr \[eax \+ 0x26614\], 2/);
  assert.match(dis, /jl\s+0x7db358/);
  assert.match(dis, /shr\s+ecx, 3/);
  assert.match(dis, /cmp\s+edx, 0x10/);
  assert.match(dis, /cmovge\s+eax, ecx/);
  assert.match(dis, /mov\s+eax, edx/);
  /* rets: 2, both ret 4 (stdcall pops the single dword arg); stores: 0. */
  assert.match(dis, /rets 2/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /E8 0/);
  assert.match(dis, /ret\s+4/);
  /* Caller-band evidence: all six direct rel32 call sites in the
     captured band dumps (0x7740d0 + 0x778xxx). */
  const bandA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "007740d0.txt"),
    "utf8");
  assert.match(bandA, /0x007741ac:.*call\s+0x7db330/);
  assert.match(bandA, /0x007741d4:.*call\s+0x7db330/);
  assert.match(bandA, /0x00774277:.*call\s+0x7db330/);
  const bandB = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "007785f0.txt"),
    "utf8");
  assert.match(bandB, /0x00778656:.*call\s+0x7db330/);
  const bandC = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "00778780.txt"),
    "utf8");
  assert.match(bandC, /0x007787bd:.*call\s+0x7db330/);
  assert.match(bandC, /0x007787ed:.*call\s+0x7db330/);
});

test("v29 BS: scalar laws (signed mode gate, logical-shift scale, whole-body composition)", () => {
  /* mode_ge2: SIGNED (int32)mode >= 2. The raw epilogue runs on
     0/1/INT_MIN/-1 (0x7db342 jl — SIGNED). */
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(1 | 0), 0);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(2 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(3 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(0xffffffff), 0);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(0x100 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_mode_ge2(-1 | 0), 0);
  /* scale: SIGNED arg >= 0x10 ? arg >>> 3 : 1 (shr LOGICAL). */
  assert.equal(wasm.isaac_pm_7db330_scale(0 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_scale(8 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_scale(15 | 0), 1);
  assert.equal(wasm.isaac_pm_7db330_scale(0x10), 2);
  assert.equal(wasm.isaac_pm_7db330_scale(0x11), 2);
  assert.equal(wasm.isaac_pm_7db330_scale(0x1f), 3);
  assert.equal(wasm.isaac_pm_7db330_scale(0x20), 4);
  assert.equal(wasm.isaac_pm_7db330_scale(0x3c), 7);
  assert.equal(wasm.isaac_pm_7db330_scale(0x100 | 0), 0x20);
  assert.equal(wasm.isaac_pm_7db330_scale(0x7fffffff), 0x0fffffff);
  assert.equal(wasm.isaac_pm_7db330_scale(0x10000000), 0x02000000);
  /* SIGNED negative args (< 0x10 as int32) return 1, NOT arg>>3. */
  assert.equal(wasm.isaac_pm_7db330_scale(0x80000000), 1);
  assert.equal(wasm.isaac_pm_7db330_scale(0xffffffff), 1);
  assert.equal(wasm.isaac_pm_7db330_scale(-1 | 0), 1);
  /* value: mode < 2 (SIGNED) -> arg untouched; else scale(arg). */
  assert.equal(wasm.isaac_pm_7db330_value(0x3c, 1 | 0) | 0, 0x3c);
  assert.equal(wasm.isaac_pm_7db330_value(0x3c, 2 | 0) | 0, 7);
  assert.equal(wasm.isaac_pm_7db330_value(8 | 0, 0 | 0) | 0, 8);
  assert.equal(wasm.isaac_pm_7db330_value(8 | 0, 2 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db330_value(0x10, 3 | 0) | 0, 2);
  assert.equal(wasm.isaac_pm_7db330_value(0x20000000, 2 | 0) | 0, 0x04000000);
  /* mode = -1 (0xffffffff): SIGNED gate stays RAW. */
  assert.equal(wasm.isaac_pm_7db330_value(0x3c, 0xffffffff) | 0, 0x3c);
  assert.equal(wasm.isaac_pm_7db330_value(0x1000, 0xfffffffe) | 0, 0x1000);
  /* Wide drives on both args: full dword, never pre-masked (v9 rule —
     there are NO byte gates in this body, so nothing may be narrowed). */
  assert.equal(wasm.isaac_pm_7db330_value(0x100, 0x100 | 0) | 0, 0x20);
  assert.equal(wasm.isaac_pm_7db330_value(0xffffffff, 0xffffffff) >>> 0, 0xffffffff);
  assert.equal(wasm.isaac_pm_7db330_value(0x80000000, 0x80000000) >>> 0, 0x80000000);
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0x00, 0x00], [0x3c, 0x01], [0x3c, 0x02], [0x08, 0x00], [0x08, 0x02],
    [0x10, 0x03], [0x20, 0x02], [0x01, 0x01], [0x1f, 0x7f], [0xff, 0xff],
    [0x1000, 0x1000], [0x20000000, 0x02], [0x80000000, 0x01],
    [0xffffffff, 0xffffffff], [0x7fffffff, 0x00],
  ];
  for (const [arg, mode] of rows) {
    assert.equal(wasm.isaac_pm_7db330_mode_ge2(mode >>> 0) | 0,
                 PM.pm7db330ModeGe2(mode), `mode ${mode}`);
    assert.equal(wasm.isaac_pm_7db330_mode_ge2(mode >>> 0) | 0,
                 v29BsModeGe2Pe(mode), `mode-pe ${mode}`);
    assert.equal(wasm.isaac_pm_7db330_scale(arg >>> 0) | 0,
                 PM.pm7db330Scale(arg), `scale ${arg}`);
    assert.equal(wasm.isaac_pm_7db330_scale(arg >>> 0) | 0,
                 v29BsScalePe(arg), `scale-pe ${arg}`);
    assert.equal(wasm.isaac_pm_7db330_value(arg >>> 0, mode >>> 0) >>> 0,
                 PM.pm7db330Value(arg, mode) >>> 0, `value ${arg}/${mode}`);
    assert.equal(wasm.isaac_pm_7db330_value(arg >>> 0, mode >>> 0) >>> 0,
                 v29BsValuePe(arg, mode) >>> 0, `value-pe ${arg}/${mode}`);
  }
});

test("v29 BS: deterministic randomized differential corpus", () => {
  let seed = 0x007db330 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const arg = rnd() >>> 0;
    const mode = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7db330_mode_ge2(mode >>> 0) | 0,
                 v29BsModeGe2Pe(mode), `trial ${trial} mode-pe`);
    assert.equal(wasm.isaac_pm_7db330_mode_ge2(mode >>> 0) | 0,
                 PM.pm7db330ModeGe2(mode), `trial ${trial} mode-model`);
    assert.equal(wasm.isaac_pm_7db330_scale(arg >>> 0) | 0,
                 v29BsScalePe(arg), `trial ${trial} scale-pe`);
    assert.equal(wasm.isaac_pm_7db330_scale(arg >>> 0) | 0,
                 PM.pm7db330Scale(arg), `trial ${trial} scale-model`);
    assert.equal(wasm.isaac_pm_7db330_value(arg >>> 0, mode >>> 0) >>> 0,
                 v29BsValuePe(arg, mode) >>> 0, `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7db330_value(arg >>> 0, mode >>> 0) >>> 0,
                 PM.pm7db330Value(arg, mode) >>> 0, `trial ${trial} value-model`);
    /* value coherence: gate ? scale : arg. */
    assert.equal(
      wasm.isaac_pm_7db330_value(arg >>> 0, mode >>> 0) >>> 0,
      v29BsModeGe2Pe(mode) === 0 ? arg >>> 0 : v29BsScalePe(arg) >>> 0,
      `trial ${trial} value==gate?scale:arg`);
    /* scale coherence: (int32)arg < 0x10 -> 1; else logical >> 3. */
    assert.equal(
      v29BsScalePe(arg),
      (arg | 0) >= 0x10 ? (arg >>> 3) >>> 0 : 1,
      `trial ${trial} scale==sign?shr:1`);
    cases += 9;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db330_mode_ge2(w >>> 0) | 0,
                 v29BsModeGe2Pe(w), `wide mode ${w}`);
    assert.equal(wasm.isaac_pm_7db330_scale(w >>> 0) | 0,
                 v29BsScalePe(w), `wide scale ${w}`);
    assert.equal(wasm.isaac_pm_7db330_value(w >>> 0, w >>> 0) >>> 0,
                 v29BsValuePe(w, w) >>> 0, `wide value ${w}`);
    cases += 3;
  }
  assert.ok(cases >= 5400 + 15, `expected >= 5415 cases, got ${cases}`);
});

/* ====================================================================== */
/* v30 — BT: VA 0x007db360 soul/fatal ratio-window island (NARROWED).     */
/* thiscall, plain ret, ZERO stack args, bool in al. 26 insns, 0 E8,      */
/* 0 indirect, 0 mem-stores, 3 rets (0x7db3a2 ONE, 0x7db3a5 ZERO,         */
/* 0x7db3ac EQ2). prologue mov eax,[0xc71678] ; mov edx,[ecx+0x1344]      */
/* (soul) ; cmp [eax+0x26614],2 ; jl EQ2 — SIGNED mode < 2 returns        */
/* soul == 2. Window path: cvtdq2ps SIGNED converts of soul/fatal         */
/* ([0x1344]/[0x1340]), divss, comiss r,[0xbaa120=0.1f] jb . 0 (LESS OR   */
/* UNORDERED — NaN 0/0 lands here), comiss [0xbaa1f8=0.3f],r jb . 0       */
/* (0.3f < r — +inf exits here); ordered INCLUSIVE 0.1f <= r <= 0.3f      */
/* keeps 1. Same comiss pair + same constants as pmUrhDAddBand. 2 direct  */
/* E8 callers (0x797be5, 0x7a8afd — PM effect bands, both mov ecx,edi ;   */
/* call, al tested). Full-dword only — no byte narrow, zero uint8_t       */
/* params.                                                                */
/* ====================================================================== */

function v30BtF32Bits(x) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, x, true);
  return new DataView(buf).getUint32(0, true);
}

function v30BtModeGe2Pe(mode) {
  /* 0x007db36b cmp [eax+0x26614],2 ; 0x007db372 jl 0x7db3a6 — SIGNED:
     (int32)mode < 2 chains to the EQ2 epilogue. */
  return (mode | 0) >= 2 ? 1 : 0;
}

function v30BtRatioPe(soul, fatal) {
  /* cvtdq2ps SIGNED int32->f32 converts + divss round-to-nearest. */
  return Math.fround(Math.fround(soul | 0) / Math.fround(fatal | 0));
}

function v30BtWindowPe(soul, fatal) {
  /* comiss jb = LESS OR UNORDERED: NaN 0/0 lands on 0; +inf passes
     the first compare then 0.3f < +inf -> 0. Inclusive both ends. */
  const r = v30BtRatioPe(soul, fatal);
  if (!(r >= Math.fround(0.1))) {
    return 0;
  }
  if (Math.fround(0.3) < r) {
    return 0;
  }
  return 1;
}

function v30BtEq2Pe(soul) {
  /* cmp edx,2 ; sete al — full-dword equality. */
  return soul === 2 ? 1 : 0;
}

function v30BtValuePe(soul, fatal, mode) {
  /* Whole body: mode < 2 -> EQ2 epilogue 0x7db3a6; else window
     epilogues 0x7db3a2/0x7db3a5. soul read once, feeds both paths. */
  return v30BtModeGe2Pe(mode) === 0 ? v30BtEq2Pe(soul) : v30BtWindowPe(soul, fatal);
}

test("v30 BT: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v30 — BT/);
  assert.match(h, /ISAAC_PM_BT_VA_BODY = 0x007db360/);
  assert.match(h, /ISAAC_PM_BT_VA_RET_ONE = 0x007db3a2/);
  assert.match(h, /ISAAC_PM_BT_VA_RET_ZERO = 0x007db3a5/);
  assert.match(h, /ISAAC_PM_BT_VA_RET_EQ2 = 0x007db3ac/);
  assert.match(h, /ISAAC_PM_BT_BODY_BYTES = 76/);
  assert.match(h, /ISAAC_PM_BT_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_BT_CALLER0_VA = 0x00797be5/);
  assert.match(h, /ISAAC_PM_BT_CALLER1_VA = 0x007a8afd/);
  assert.match(h, /ISAAC_PM_BT_GAME_GLOBAL_VA = 0x00c71678/);
  assert.match(h, /ISAAC_PM_BT_MODE_OFF = 0x26614/);
  assert.match(h, /ISAAC_PM_BT_MODE_CMP = 2/);
  assert.match(h, /ISAAC_PM_BT_SOUL_OFF = 0x1344/);
  assert.match(h, /ISAAC_PM_BT_FATAL_OFF = 0x1340/);
  assert.match(h, /ISAAC_PM_BT_EQ2 = 2/);
  assert.match(h, /ISAAC_PM_BT_F32_LO_BITS = 0x3dcccccd/);
  assert.match(h, /ISAAC_PM_BT_F32_LO_VA = 0x00baa120/);
  assert.match(h, /ISAAC_PM_BT_F32_HI_BITS = 0x3e99999a/);
  assert.match(h, /ISAAC_PM_BT_F32_HI_VA = 0x00baa1f8/);
  /* Model constants agree (BT island mirrors). */
  assert.equal(PM.PM_BT_VA_BODY, 0x007db360);
  assert.equal(PM.PM_BT_VA_RET_ONE, 0x007db3a2);
  assert.equal(PM.PM_BT_VA_RET_ZERO, 0x007db3a5);
  assert.equal(PM.PM_BT_VA_RET_EQ2, 0x007db3ac);
  assert.equal(PM.PM_BT_BODY_BYTES, 76);
  assert.equal(PM.PM_BT_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_BT_CALLER0_VA, 0x00797be5);
  assert.equal(PM.PM_BT_CALLER1_VA, 0x007a8afd);
  assert.equal(PM.PM_BT_GAME_GLOBAL_VA, 0x00c71678);
  assert.equal(PM.PM_BT_MODE_OFF, 0x26614);
  assert.equal(PM.PM_BT_MODE_CMP, 2);
  assert.equal(PM.PM_BT_SOUL_OFF, 0x1344);
  assert.equal(PM.PM_BT_FATAL_OFF, 0x1340);
  assert.equal(PM.PM_BT_EQ2, 2);
  assert.equal(PM.PM_BT_F32_LO_BITS, 0x3dcccccd);
  assert.equal(PM.PM_BT_F32_LO_VA, 0x00baa120);
  assert.equal(PM.PM_BT_F32_HI_BITS, 0x3e99999a);
  assert.equal(PM.PM_BT_F32_HI_VA, 0x00baa1f8);
  /* Raw disasm needles (disasm-007db360.txt = dump-pe-span span dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v30-7db360", "disasm-007db360.txt"),
    "utf8");
  assert.match(dis, /mov\s+eax, dword ptr \[0xc71678\]/);
  assert.match(dis, /mov\s+edx, dword ptr \[ecx \+ 0x1344\]/);
  assert.match(dis, /cmp\s+dword ptr \[eax \+ 0x26614\], 2/);
  assert.match(dis, /jl\s+0x7db3a6/);
  assert.match(dis, /movd\s+xmm0, dword ptr \[ecx \+ 0x1340\]/);
  assert.match(dis, /cvtdq2ps\s+xmm1, xmm1/);
  assert.match(dis, /divss\s+xmm1, xmm0/);
  assert.match(dis, /comiss\s+xmm1, dword ptr \[0xbaa120\]/);
  assert.match(dis, /jb\s+0x7db3a3/);
  assert.match(dis, /movss\s+xmm0, dword ptr \[0xbaa1f8\]/);
  assert.match(dis, /comiss\s+xmm0, xmm1/);
  assert.match(dis, /mov\s+al, 1/);
  assert.match(dis, /xor\s+al, al/);
  assert.match(dis, /cmp\s+edx, 2/);
  assert.match(dis, /sete\s+al/);
  /* rets: 3, all plain ret (thiscall, zero stack args); stores: 0. */
  assert.match(dis, /rets 3/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /E8 0/);
  assert.match(dis, /c3\s+ret/);
  /* Caller-band evidence: both direct rel32 call sites in the
     captured band dumps (0x797xxx + 0x7a8xxx). */
  const bandA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v30-7db360", "caller-00797bc0.txt"),
    "utf8");
  assert.match(bandA, /0x00797be5:.*call\s+0x7db360/);
  const bandB = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v30-7db360", "caller-007a8ad0.txt"),
    "utf8");
  assert.match(bandB, /0x007a8afd:.*call\s+0x7db360/);
});

test("v30 BT: scalar laws (signed mode gate, signed f32 ratio, ordered window, eq2 fallback)", () => {
  /* mode_ge2: SIGNED (int32)mode >= 2. The EQ2 epilogue runs on
     0/1/INT_MIN/-1 (0x7db372 jl — SIGNED). */
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(1 | 0), 0);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(2 | 0), 1);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(3 | 0), 1);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(0xffffffff), 0);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(0x100 | 0), 1);
  assert.equal(wasm.isaac_pm_7db360_mode_ge2(-1 | 0), 0);
  /* ratio_bits: SIGNED int32->f32 converts + divss. 1/10 and 3/10
     round to exactly the family-pinned 0.1f / 0.3f bit patterns. */
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(1, 10) >>> 0, 0x3dcccccd);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(3, 10) >>> 0, 0x3e99999a);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(2, 10) >>> 0, 0x3e4ccccd);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(4, 10) >>> 0, 0x3ecccccd);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(1, 3) >>> 0, 0x3eaaaaab);
  /* SIGNED converts: INT_MIN -> -2147483648.0f, -1 -> -1.0f. */
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0x80000000, 1) >>> 0, 0xcf000000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0xffffffff, 1) >>> 0, 0xbf800000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(1, 0x80000000) >>> 0, 0xb0000000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0x80000000, 0x80000000) >>> 0, 0x3f800000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0x7fffffff, 1) >>> 0, 0x4f000000);
  /* IEEE corners: 0/0 NaN, 1/0 +inf, INT_MIN/0 -inf. */
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0, 0) >>> 0, 0xffc00000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(1, 0) >>> 0, 0x7f800000);
  assert.equal(wasm.isaac_pm_7db360_ratio_bits(0x80000000, 0) >>> 0, 0xff800000);
  /* window: ordered INCLUSIVE 0.1f..0.3f; NaN/inf -> 0. */
  assert.equal(wasm.isaac_pm_7db360_window(1, 10) | 0, 1); /* 0.1f == LO */
  assert.equal(wasm.isaac_pm_7db360_window(3, 10) | 0, 1); /* 0.3f == HI */
  assert.equal(wasm.isaac_pm_7db360_window(2, 10) | 0, 1); /* 0.2f */
  assert.equal(wasm.isaac_pm_7db360_window(0x19999999, 0x7fffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_window(4, 10) | 0, 0); /* 0.4f > HI */
  assert.equal(wasm.isaac_pm_7db360_window(1, 3) | 0, 0);  /* 0.333.. > HI */
  assert.equal(wasm.isaac_pm_7db360_window(1, 100) | 0, 0); /* 0.01 < LO */
  assert.equal(wasm.isaac_pm_7db360_window(0, 1) | 0, 0);  /* 0.0 < LO */
  assert.equal(wasm.isaac_pm_7db360_window(0, 0) | 0, 0);  /* NaN -> 0 */
  assert.equal(wasm.isaac_pm_7db360_window(1, 0) | 0, 0);  /* +inf -> 0 */
  assert.equal(wasm.isaac_pm_7db360_window(0x80000000, 0) | 0, 0); /* -inf */
  assert.equal(wasm.isaac_pm_7db360_window(0xffffffff, 1) | 0, 0); /* -1 */
  assert.equal(wasm.isaac_pm_7db360_window(0x80000000, 1) | 0, 0); /* INT_MIN */
  assert.equal(wasm.isaac_pm_7db360_window(0x80000000, 0x80000000) | 0, 0); /* 1.0 */
  assert.equal(wasm.isaac_pm_7db360_window(5, 2) | 0, 0);  /* 2.5 */
  /* eq2: full-dword equality — no byte narrow. */
  assert.equal(wasm.isaac_pm_7db360_eq2(2 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_eq2(0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_eq2(1 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_eq2(3 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_eq2(0x102) | 0, 0); /* low byte 2 must NOT match */
  assert.equal(wasm.isaac_pm_7db360_eq2(0x202) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_eq2(0xffffffff) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_eq2(0x80000000) | 0, 0);
  /* value: mode < 2 (SIGNED) -> eq2(soul); else window(soul, fatal). */
  assert.equal(wasm.isaac_pm_7db360_value(2, 10, 0 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(2, 10, 1 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(2, 10, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(2, 10, 0x80000000) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(3, 10, 0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(0x102, 10, 1 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(1, 10, 2 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(3, 10, 3 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db360_value(4, 10, 2 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(0, 0, 2 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(1, 0, 2 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(2, 10, 0x100 | 0) | 0, 1); /* 0.2 window */
  /* Wide drives on all three args: full dword, never pre-masked (v9
     rule — there are NO byte gates in this body, so nothing may be
     narrowed). */
  assert.equal(wasm.isaac_pm_7db360_value(0xffffffff, 0xffffffff, 0xffffffff) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(0x80000000, 0x80000000, 0x80000000) | 0, 0);
  assert.equal(wasm.isaac_pm_7db360_value(0x100, 0x100, 0x100 | 0) | 0, 0);
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0x00, 0x00, 0x00], [0x02, 0x0a, 0x00], [0x02, 0x0a, 0x01],
    [0x01, 0x0a, 0x02], [0x03, 0x0a, 0x03], [0x04, 0x0a, 0x02],
    [0x01, 0x64, 0x02], [0x00, 0x00, 0x02], [0x01, 0x00, 0x02],
    [0x102, 0x0a, 0x01], [0xffffffff, 0xffffffff, 0xffffffff],
    [0x80000000, 0x01, 0x02], [0x7fffffff, 0x01, 0x00],
    [0x19999999, 0x7fffffff, 0x02], [0x80000000, 0x80000000, 0x80000000],
  ];
  for (const [soul, fatal, mode] of rows) {
    assert.equal(wasm.isaac_pm_7db360_mode_ge2(mode >>> 0) | 0,
                 PM.pm7db360ModeGe2(mode), `mode ${mode}`);
    assert.equal(wasm.isaac_pm_7db360_mode_ge2(mode >>> 0) | 0,
                 v30BtModeGe2Pe(mode), `mode-pe ${mode}`);
    assert.equal(wasm.isaac_pm_7db360_ratio_bits(soul >>> 0, fatal >>> 0) >>> 0,
                 PM.pm7db360RatioBits(soul, fatal) >>> 0, `ratio ${soul}/${fatal}`);
    assert.equal(wasm.isaac_pm_7db360_ratio_bits(soul >>> 0, fatal >>> 0) >>> 0,
                 v30BtF32Bits(v30BtRatioPe(soul, fatal)) >>> 0,
                 `ratio-pe ${soul}/${fatal}`);
    assert.equal(wasm.isaac_pm_7db360_window(soul >>> 0, fatal >>> 0) | 0,
                 PM.pm7db360Window(soul, fatal), `window ${soul}/${fatal}`);
    assert.equal(wasm.isaac_pm_7db360_window(soul >>> 0, fatal >>> 0) | 0,
                 v30BtWindowPe(soul, fatal), `window-pe ${soul}/${fatal}`);
    assert.equal(wasm.isaac_pm_7db360_eq2(soul >>> 0) | 0,
                 PM.pm7db360Eq2(soul), `eq2 ${soul}`);
    assert.equal(wasm.isaac_pm_7db360_eq2(soul >>> 0) | 0,
                 v30BtEq2Pe(soul), `eq2-pe ${soul}`);
    assert.equal(wasm.isaac_pm_7db360_value(soul >>> 0, fatal >>> 0, mode >>> 0) | 0,
                 PM.pm7db360Value(soul, fatal, mode), `value ${soul}/${fatal}/${mode}`);
    assert.equal(wasm.isaac_pm_7db360_value(soul >>> 0, fatal >>> 0, mode >>> 0) | 0,
                 v30BtValuePe(soul, fatal, mode), `value-pe ${soul}/${fatal}/${mode}`);
  }
});

test("v30 BT: deterministic randomized differential corpus", () => {
  let seed = 0x007db360 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const soul = rnd() >>> 0;
    const fatal = rnd() >>> 0;
    const mode = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7db360_mode_ge2(mode >>> 0) | 0,
                 v30BtModeGe2Pe(mode), `trial ${trial} mode-pe`);
    assert.equal(wasm.isaac_pm_7db360_mode_ge2(mode >>> 0) | 0,
                 PM.pm7db360ModeGe2(mode), `trial ${trial} mode-model`);
    assert.equal(wasm.isaac_pm_7db360_ratio_bits(soul >>> 0, fatal >>> 0) >>> 0,
                 PM.pm7db360RatioBits(soul, fatal) >>> 0, `trial ${trial} ratio-model`);
    assert.equal(wasm.isaac_pm_7db360_ratio_bits(soul >>> 0, fatal >>> 0) >>> 0,
                 v30BtF32Bits(v30BtRatioPe(soul, fatal)) >>> 0, `trial ${trial} ratio-pe`);
    assert.equal(wasm.isaac_pm_7db360_window(soul >>> 0, fatal >>> 0) | 0,
                 v30BtWindowPe(soul, fatal), `trial ${trial} window-pe`);
    assert.equal(wasm.isaac_pm_7db360_window(soul >>> 0, fatal >>> 0) | 0,
                 PM.pm7db360Window(soul, fatal), `trial ${trial} window-model`);
    assert.equal(wasm.isaac_pm_7db360_eq2(soul >>> 0) | 0,
                 v30BtEq2Pe(soul), `trial ${trial} eq2-pe`);
    assert.equal(wasm.isaac_pm_7db360_eq2(soul >>> 0) | 0,
                 PM.pm7db360Eq2(soul), `trial ${trial} eq2-model`);
    assert.equal(wasm.isaac_pm_7db360_value(soul >>> 0, fatal >>> 0, mode >>> 0) | 0,
                 v30BtValuePe(soul, fatal, mode), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7db360_value(soul >>> 0, fatal >>> 0, mode >>> 0) | 0,
                 PM.pm7db360Value(soul, fatal, mode), `trial ${trial} value-model`);
    /* value coherence: gate ? window : eq2. */
    assert.equal(
      wasm.isaac_pm_7db360_value(soul >>> 0, fatal >>> 0, mode >>> 0) | 0,
      v30BtModeGe2Pe(mode) === 0 ? v30BtEq2Pe(soul) : v30BtWindowPe(soul, fatal),
      `trial ${trial} value==gate?window:eq2`);
    /* window coherence: ordered 0.1f <= r <= 0.3f with NaN/inf false. */
    assert.equal(
      v30BtWindowPe(soul, fatal),
      (v30BtRatioPe(soul, fatal) >= Math.fround(0.1) &&
       Math.fround(0.3) >= v30BtRatioPe(soul, fatal)) ? 1 : 0,
      `trial ${trial} window==ordered-band`);
    cases += 11;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db360_mode_ge2(w >>> 0) | 0,
                 v30BtModeGe2Pe(w), `wide mode ${w}`);
    assert.equal(wasm.isaac_pm_7db360_ratio_bits(w >>> 0, 10) >>> 0,
                 v30BtF32Bits(v30BtRatioPe(w, 10)) >>> 0, `wide ratio ${w}`);
    assert.equal(wasm.isaac_pm_7db360_window(w >>> 0, 10) | 0,
                 v30BtWindowPe(w, 10), `wide window ${w}`);
    assert.equal(wasm.isaac_pm_7db360_eq2(w >>> 0) | 0,
                 v30BtEq2Pe(w), `wide eq2 ${w}`);
    assert.equal(wasm.isaac_pm_7db360_value(w >>> 0, w >>> 0, w >>> 0) | 0,
                 v30BtValuePe(w, w, w), `wide value ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 6600 + 25, `expected >= 6625 cases, got ${cases}`);
});

/* ====================================================================== */
/* v31 — BU: VA 0x007db3b0 revive-queue body (NARROWED). thiscall,        */
/* plain ret, ZERO stack args, VOID return. 245 insns, 1 ret @ 0x7db699; */
/* MSVC SEH frame + cookie, unwind tail [0xb18894] @0x7db69a; int3 pad   */
/* 0x7db6a0..0x7db6ad; next function 0x7db6b0. 1 direct E8 caller        */
/* (0x73f3c6 — per-player loop in a room-wide teardown/revive pass,      */
/* PM-band host). BYTE entry gates byte[this+0x172] AND byte[this+0x170] */
/* both non-zero -> proceed (engage, & 0xff masks); walk filter entry!=0 */
/* && [entry+0x28]==3 && [entry+0x410]==this (entry_match, FULL dword);  */
/* char machine [0x13c0] sub-dispatch 0x26->0x1d, 0x27->0x25 (char_next, */
/* FULL dword — stores exported as the stored value); twinA-first node   */
/* pick +0x20dc 32-bit wrap, 0 when both null (node_addr); transfer gate */
/* local0 != local1 (loop_needed, FULL dword). g_Game + Game+0x18300 +   */
/* 0x1218 fill (0x41af60), 0x757ac0, vtable slot 1, SetControllerIndex   */
/* 0x7a6450 x3, reviver 0x7daed0 x2, sized delete 0xaef15c, alloc        */
/* wrapper 0xa648b0, the [0x171]/[0x16b4]/node-triple stores stay host.  */
/* ====================================================================== */

function v31BuEngagePe(flag172, flag170) {
  /* 0x007db3da cmp byte ptr [edi+0x172],0 / je 0x7db688 ;
     0x007db3e7 cmp byte ptr [edi+0x170],0 / je 0x7db688 — BYTE
     gates, both non-zero to proceed. */
  return (flag172 & 0xff) !== 0 && (flag170 & 0xff) !== 0 ? 1 : 0;
}

function v31BuEntryMatchPe(entry, type28, owner410, self) {
  /* 0x007db437 test ecx,ecx / je ; 0x007db43b cmp dword
     [ecx+0x28],3 / jne ; 0x007db441 cmp dword [ecx+0x410],edi /
     jne — FULL DWORD filter. */
  return (entry >>> 0) !== 0 && (type28 >>> 0) === 3 &&
         (owner410 >>> 0) === (self >>> 0) ? 1 : 0;
}

function v31BuCharNextPe(cur) {
  /* 0x007db4b9 mov eax,[edi+0x13c0] ; sub 0x26 / je -> 0x1d ;
     sub 1 / jne -> unchanged ; else -> 0x25. FULL DWORD. */
  const c = cur >>> 0;
  if (c === 0x26) return 0x1d;
  if (c === 0x27) return 0x25;
  return c;
}

function v31BuNodeAddrPe(twinA, twinB) {
  /* 0x007db470/0x007db47f picks, 0x007db48c add eax,0x20dc —
     twinA-first, 32-bit wrap, 0 when both null. */
  let picked = twinA >>> 0;
  if (picked === 0) picked = twinB >>> 0;
  if (picked === 0) return 0;
  return (picked + 0x20dc) >>> 0;
}

function v31BuLoopNeededPe(local0, local1) {
  /* 0x007db57f/0x007db584/0x007db587 je 0x7db61a — FULL DWORD. */
  return (local0 >>> 0) !== (local1 >>> 0) ? 1 : 0;
}

test("v31 BU: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v31 — BU/);
  assert.match(h, /ISAAC_PM_BU_VA_BODY = 0x007db3b0/);
  assert.match(h, /ISAAC_PM_BU_VA_RET = 0x007db699/);
  assert.match(h, /ISAAC_PM_BU_BODY_BYTES = 745/);
  assert.match(h, /ISAAC_PM_BU_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_BU_CALLER0_VA = 0x0073f3c6/);
  assert.match(h, /ISAAC_PM_BU_E8_COUNT = 9/);
  assert.match(h, /ISAAC_PM_BU_INDIRECT_COUNT = 3/);
  assert.match(h, /ISAAC_PM_BU_STORE_COUNT = 50/);
  assert.match(h, /ISAAC_PM_BU_GATE_172_OFF = 0x172/);
  assert.match(h, /ISAAC_PM_BU_GATE_170_OFF = 0x170/);
  assert.match(h, /ISAAC_PM_BU_TYPE_OFF = 0x28/);
  assert.match(h, /ISAAC_PM_BU_TYPE_CMP = 3/);
  assert.match(h, /ISAAC_PM_BU_OWNER_OFF = 0x410/);
  assert.match(h, /ISAAC_PM_BU_CHAR_OFF = 0x13c0/);
  assert.match(h, /ISAAC_PM_BU_CHAR_26 = 0x26/);
  assert.match(h, /ISAAC_PM_BU_CHAR_27 = 0x27/);
  assert.match(h, /ISAAC_PM_BU_CHAR_26_NEW = 0x1d/);
  assert.match(h, /ISAAC_PM_BU_CHAR_27_NEW = 0x25/);
  assert.match(h, /ISAAC_PM_BU_TWIN_A_OFF = 0x1e68/);
  assert.match(h, /ISAAC_PM_BU_TWIN_B_OFF = 0x1e6c/);
  assert.match(h, /ISAAC_PM_BU_NODE_OFF = 0x20dc/);
  /* Model constants agree (BU mirror). */
  assert.equal(PM.PM_BU_VA_BODY, 0x007db3b0);
  assert.equal(PM.PM_BU_VA_RET, 0x007db699);
  assert.equal(PM.PM_BU_BODY_BYTES, 745);
  assert.equal(PM.PM_BU_CALLSITE_COUNT, 1);
  assert.equal(PM.PM_BU_CALLER0_VA, 0x0073f3c6);
  assert.equal(PM.PM_BU_E8_COUNT, 9);
  assert.equal(PM.PM_BU_INDIRECT_COUNT, 3);
  assert.equal(PM.PM_BU_STORE_COUNT, 50);
  assert.equal(PM.PM_BU_GATE_172_OFF, 0x172);
  assert.equal(PM.PM_BU_GATE_170_OFF, 0x170);
  assert.equal(PM.PM_BU_TYPE_OFF, 0x28);
  assert.equal(PM.PM_BU_TYPE_CMP, 3);
  assert.equal(PM.PM_BU_OWNER_OFF, 0x410);
  assert.equal(PM.PM_BU_CHAR_OFF, 0x13c0);
  assert.equal(PM.PM_BU_CHAR_26, 0x26);
  assert.equal(PM.PM_BU_CHAR_27, 0x27);
  assert.equal(PM.PM_BU_CHAR_26_NEW, 0x1d);
  assert.equal(PM.PM_BU_CHAR_27_NEW, 0x25);
  assert.equal(PM.PM_BU_TWIN_A_OFF, 0x1e68);
  assert.equal(PM.PM_BU_TWIN_B_OFF, 0x1e6c);
  assert.equal(PM.PM_BU_NODE_OFF, 0x20dc);
  /* Raw disasm needles (disasm-007db3b0.txt = dump-pe-span span dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v31-7db3b0", "disasm-007db3b0.txt"),
    "utf8");
  assert.match(dis, /cmp\s+byte ptr \[edi \+ 0x172\], 0/);
  assert.match(dis, /cmp\s+byte ptr \[edi \+ 0x170\], 0/);
  assert.match(dis, /je\s+0x7db688/);
  assert.match(dis, /mov\s+eax, dword ptr \[0xc71678\]/);
  assert.match(dis, /call\s+0x41af60/);
  assert.match(dis, /cmp\s+dword ptr \[ecx \+ 0x28\], 3/);
  assert.match(dis, /cmp\s+dword ptr \[ecx \+ 0x410\], edi/);
  assert.match(dis, /call\s+dword ptr \[eax \+ 0x28\]/);
  assert.match(dis, /mov\s+eax, dword ptr \[edi \+ 0x13c0\]/);
  assert.match(dis, /sub\s+eax, 0x26/);
  assert.match(dis, /mov\s+dword ptr \[edi \+ 0x13c0\], 0x25/);
  assert.match(dis, /mov\s+dword ptr \[edi \+ 0x13c0\], 0x1d/);
  assert.match(dis, /add\s+eax, 0x20dc/);
  assert.match(dis, /cmp\s+eax, dword ptr \[ebp - 0x10\]/);
  assert.match(dis, /je\s+0x7db61a/);
  assert.match(dis, /mov\s+byte ptr \[edi \+ 0x171\], 0/);
  assert.match(dis, /call\s+dword ptr \[0xb18894\]/);
  /* body stats: 1 ret, E8 9, indirect 3, mem-stores 50. */
  assert.match(dis, /rets 1/);
  assert.match(dis, /E8 9/);
  assert.match(dis, /indirect 3/);
  assert.match(dis, /mem-stores 50/);
  assert.match(dis, /0x007db699: c3\s+ret/);
  /* Caller-band evidence: the per-player loop at 0x73f3c6. */
  const band = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v31-7db3b0", "caller-0073f340.txt"),
    "utf8");
  assert.match(band, /0x0073f3c6:.*call\s+0x7db3b0/);
});

test("v31 BU: scalar laws (byte engage gates, walk entry filter, char machine, node pick, transfer gate)", () => {
  /* engage: BYTE gates — both bytes non-zero. High bits must NOT
     count: flag 0x100 (low byte 0) does not engage. */
  assert.equal(wasm.isaac_pm_7db3b0_engage(0 | 0, 0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_engage(1, 0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_engage(0 | 0, 1) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_engage(1, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_engage(0xff, 0xff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_engage(0x100, 1) | 0, 0); /* low byte 0 */
  assert.equal(wasm.isaac_pm_7db3b0_engage(1, 0x100) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_engage(0x7fffffff, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_engage(0x80000000, 0x80000000) | 0, 0);
  /* entry_match: FULL-DWORD — entry != 0 && type == 3 && owner == self. */
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(0, 3, 0x1234, 0x1234) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 3, 0x1234, 0x1234) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 2, 0x1234, 0x1234) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 4, 0x1234, 0x1234) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 3, 0x9999, 0x1234) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(0xffffffff, 3, 0xffffffff, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 0x103, 0x1234, 0x1234) | 0, 0); /* full dword: 0x103 != 3 */
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(0x10000, 3, 0x1234, 0x1234) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_entry_match(1, 3, 0x1234, 0x12340000) | 0, 0);
  /* char_next: FULL-DWORD exact 0x26/0x27 — high bits never match. */
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x26) >>> 0, 0x1d);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x27) >>> 0, 0x25);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x1d) >>> 0, 0x1d);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x25) >>> 0, 0x25);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x126) >>> 0, 0x126); /* no low-byte match */
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x127) >>> 0, 0x127);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0xffffffff) >>> 0, 0xffffffff);
  assert.equal(wasm.isaac_pm_7db3b0_char_next(0x80000000) >>> 0, 0x80000000);
  /* node_addr: twinA-first pick + 0x20dc wrap; 0 when both null. */
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0, 0) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0x1000, 0) >>> 0, 0x1000 + 0x20dc);
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0, 0x2000) >>> 0, 0x2000 + 0x20dc);
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0x1000, 0x2000) >>> 0, 0x1000 + 0x20dc); /* A wins */
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0xfffff000, 0) >>> 0, (0xfffff000 + 0x20dc) >>> 0);
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0xffffffff, 0) >>> 0, 0x20dc - 1);
  assert.equal(wasm.isaac_pm_7db3b0_node_addr(0, 0xffffffff) >>> 0, 0x20dc - 1);
  /* loop_needed: FULL-DWORD local0 != local1. */
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(1, 1) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0x100, 0x200) | 0, 1); /* full dword differs */
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0x100, 0x100) | 0, 0);
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0xffffffff, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7db3b0_loop_needed(0x80000000, 0x80000000) | 0, 0);
  /* model parity + PE-truth on fixed rows. */
  const rows = [
    [0x00, 0x00], [0x01, 0x00], [0x00, 0x01], [0x01, 0x01], [0xff, 0x01],
    [0x100, 0x01], [0x01, 0x100], [0x7fffffff, 0xffffffff],
    [0x80000000, 0x80000000], [0x26, 0x26], [0x27, 0x27], [0x126, 0x126],
  ];
  for (const [a, b] of rows) {
    assert.equal(wasm.isaac_pm_7db3b0_engage(a >>> 0, b >>> 0) | 0,
                 PM.pm7db3b0Engage(a, b), `engage ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_engage(a >>> 0, b >>> 0) | 0,
                 v31BuEngagePe(a, b), `engage-pe ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_entry_match(a >>> 0, b >>> 0, 0x1234, 0x1234) | 0,
                 PM.pm7db3b0EntryMatch(a, b, 0x1234, 0x1234), `entry ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_entry_match(a >>> 0, b >>> 0, 0x1234, 0x1234) | 0,
                 v31BuEntryMatchPe(a, b, 0x1234, 0x1234), `entry-pe ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(a >>> 0) >>> 0,
                 PM.pm7db3b0CharNext(a), `char ${a}`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(a >>> 0) >>> 0,
                 v31BuCharNextPe(a), `char-pe ${a}`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(a >>> 0, b >>> 0) >>> 0,
                 PM.pm7db3b0NodeAddr(a, b), `node ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(a >>> 0, b >>> 0) >>> 0,
                 v31BuNodeAddrPe(a, b), `node-pe ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(a >>> 0, b >>> 0) | 0,
                 PM.pm7db3b0LoopNeeded(a, b), `loop ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(a >>> 0, b >>> 0) | 0,
                 v31BuLoopNeededPe(a, b), `loop-pe ${a}/${b}`);
  }
});

test("v31 BU: deterministic randomized differential corpus", () => {
  let seed = 0x007db3b0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial += 1) {
    const a = rnd() >>> 0;
    const b = rnd() >>> 0;
    const c = rnd() >>> 0;
    const d = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7db3b0_engage(a >>> 0, b >>> 0) | 0,
                 v31BuEngagePe(a, b), `trial ${trial} engage-pe`);
    assert.equal(wasm.isaac_pm_7db3b0_engage(a >>> 0, b >>> 0) | 0,
                 PM.pm7db3b0Engage(a, b), `trial ${trial} engage-model`);
    assert.equal(wasm.isaac_pm_7db3b0_entry_match(a >>> 0, b >>> 0, c >>> 0, d >>> 0) | 0,
                 v31BuEntryMatchPe(a, b, c, d), `trial ${trial} entry-pe`);
    assert.equal(wasm.isaac_pm_7db3b0_entry_match(a >>> 0, b >>> 0, c >>> 0, d >>> 0) | 0,
                 PM.pm7db3b0EntryMatch(a, b, c, d), `trial ${trial} entry-model`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(a >>> 0) >>> 0,
                 v31BuCharNextPe(a), `trial ${trial} char-pe`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(a >>> 0) >>> 0,
                 PM.pm7db3b0CharNext(a), `trial ${trial} char-model`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(a >>> 0, b >>> 0) >>> 0,
                 v31BuNodeAddrPe(a, b), `trial ${trial} node-pe`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(a >>> 0, b >>> 0) >>> 0,
                 PM.pm7db3b0NodeAddr(a, b), `trial ${trial} node-model`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(a >>> 0, b >>> 0) | 0,
                 v31BuLoopNeededPe(a, b), `trial ${trial} loop-pe`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(a >>> 0, b >>> 0) | 0,
                 PM.pm7db3b0LoopNeeded(a, b), `trial ${trial} loop-model`);
    /* coherence: engage masks low bytes; char_next is exact-only;
       node_addr picks A first; loop_needed is full-dword !=. */
    assert.equal(wasm.isaac_pm_7db3b0_engage(a >>> 0, b >>> 0) | 0,
                 ((a & 0xff) !== 0 && (b & 0xff) !== 0) ? 1 : 0,
                 `trial ${trial} engage==bytes-nonzero`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(a >>> 0) >>> 0,
                 a === 0x26 ? 0x1d : (a === 0x27 ? 0x25 : a >>> 0),
                 `trial ${trial} char==exact-dispatch`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(a >>> 0, b >>> 0) >>> 0,
                 a !== 0 ? (a + 0x20dc) >>> 0 : (b !== 0 ? (b + 0x20dc) >>> 0 : 0),
                 `trial ${trial} node==a-first`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(a >>> 0, b >>> 0) | 0,
                 a !== b ? 1 : 0, `trial ${trial} loop==full-dword-ne`);
    cases += 14;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db3b0_engage(w >>> 0, w >>> 0) | 0,
                 v31BuEngagePe(w, w), `wide engage ${w}`);
    assert.equal(wasm.isaac_pm_7db3b0_entry_match(w >>> 0, w >>> 0, w >>> 0, w >>> 0) | 0,
                 v31BuEntryMatchPe(w, w, w, w), `wide entry ${w}`);
    assert.equal(wasm.isaac_pm_7db3b0_char_next(w >>> 0) >>> 0,
                 v31BuCharNextPe(w), `wide char ${w}`);
    assert.equal(wasm.isaac_pm_7db3b0_node_addr(w >>> 0, w >>> 0) >>> 0,
                 v31BuNodeAddrPe(w, w), `wide node ${w}`);
    assert.equal(wasm.isaac_pm_7db3b0_loop_needed(w >>> 0, w >>> 0) | 0,
                 v31BuLoopNeededPe(w, w), `wide loop ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 8400 + 25, `expected >= 8425 cases, got ${cases}`);
});

/* ====================================================================== */
/* v32 — BV: VA 0x007da770 char+collectible bool gate (NARROWED).        */
/* thiscall, plain ret, ZERO stack args, bool in al. 13 insns, 2 rets    */
/* (0x7da792 ONE / 0x7da795 ZERO); 1 E8 (0x7706e0                       */
/* Entity_Player::HasCollectible(this, 0x26b, false) — typed host        */
/* sample, stays host); 0 indirect, 0 obj stores. int3 pad               */
/* 0x7da796..0x7da79f; next function 0x7da7a0. 2 direct E8 callers       */
/* (0x77099b / 0x785681 — both consume with `test al, al`). char         */
/* dispatch on dword [this+0x13c0]: cmp 3 / je host ; cmp 0xc / jne      */
/* ZERO — FULL-DWORD exact (char_gate); the host bool is tested          */
/* BYTE-wise (test al,al / je ZERO ; mov al,1) — the body's ONLY byte    */
/* gate, & 0xff on `has` (value).                                        */
/* ====================================================================== */

function v32BvCharGatePe(char13c0) {
  /* 0x007da776 cmp eax,3 / je 0x7da780 ; 0x007da77b cmp eax,0xc /
     jne 0x7da793 — FULL DWORD equality dispatch. */
  const c = char13c0 >>> 0;
  return c === 3 || c === 0xc ? 1 : 0;
}

function v32BvValuePe(char13c0, has) {
  /* 0x007da78c test al,al / je 0x7da793 ; 0x007da790 mov al,1 —
     the host bool is tested BYTE-wise (only byte gate). */
  if (v32BvCharGatePe(char13c0) === 0) return 0;
  return (has & 0xff) !== 0 ? 1 : 0;
}

test("v32 BV: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v32 — BV/);
  assert.match(h, /ISAAC_PM_BV_VA_BODY = 0x007da770/);
  assert.match(h, /ISAAC_PM_BV_VA_RET_ONE = 0x007da792/);
  assert.match(h, /ISAAC_PM_BV_VA_RET_ZERO = 0x007da795/);
  assert.match(h, /ISAAC_PM_BV_BODY_BYTES = 37/);
  assert.match(h, /ISAAC_PM_BV_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_BV_CALLER0_VA = 0x0077099b/);
  assert.match(h, /ISAAC_PM_BV_CALLER1_VA = 0x00785681/);
  assert.match(h, /ISAAC_PM_BV_E8_COUNT = 1/);
  assert.match(h, /ISAAC_PM_BV_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_BV_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_BV_HAS_COLLECTIBLE_VA = 0x007706e0/);
  assert.match(h, /ISAAC_PM_BV_COLLECTIBLE_ID = 0x26b/);
  assert.match(h, /ISAAC_PM_BV_CHAR_OFF = 0x13c0/);
  assert.match(h, /ISAAC_PM_BV_CHAR_A = 3/);
  assert.match(h, /ISAAC_PM_BV_CHAR_B = 0xc/);
  /* Model constants agree (BV mirror). */
  assert.equal(PM.PM_BV_VA_BODY, 0x007da770);
  assert.equal(PM.PM_BV_VA_RET_ONE, 0x007da792);
  assert.equal(PM.PM_BV_VA_RET_ZERO, 0x007da795);
  assert.equal(PM.PM_BV_BODY_BYTES, 37);
  assert.equal(PM.PM_BV_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_BV_CALLER0_VA, 0x0077099b);
  assert.equal(PM.PM_BV_CALLER1_VA, 0x00785681);
  assert.equal(PM.PM_BV_E8_COUNT, 1);
  assert.equal(PM.PM_BV_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_BV_STORE_COUNT, 0);
  assert.equal(PM.PM_BV_HAS_COLLECTIBLE_VA, 0x007706e0);
  assert.equal(PM.PM_BV_COLLECTIBLE_ID, 0x26b);
  assert.equal(PM.PM_BV_CHAR_OFF, 0x13c0);
  assert.equal(PM.PM_BV_CHAR_A, 3);
  assert.equal(PM.PM_BV_CHAR_B, 0xc);
  /* Raw disasm needles (disasm-007da770.txt = dump-pe-span span dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v32-net", "disasm-007da770.txt"),
    "utf8");
  assert.match(dis, /mov\s+eax, dword ptr \[ecx \+ 0x13c0\]/);
  assert.match(dis, /cmp\s+eax, 3/);
  assert.match(dis, /je\s+0x7da780/);
  assert.match(dis, /cmp\s+eax, 0xc/);
  assert.match(dis, /jne\s+0x7da793/);
  assert.match(dis, /push\s+0x26b/);
  assert.match(dis, /call\s+0x7706e0/);
  assert.match(dis, /test\s+al, al/);
  assert.match(dis, /je\s+0x7da793/);
  assert.match(dis, /mov\s+al, 1/);
  assert.match(dis, /xor\s+al, al/);
  /* body stats: 2 rets, E8 1, indirect 0, mem-stores 0. */
  assert.match(dis, /rets 2/);
  assert.match(dis, /E8 1/);
  assert.match(dis, /indirect 0/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /0x007da795: c3\s+ret/);
  /* Caller-band evidence: both callers consume the bool (test al). */
  const callerA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v32-net", "caller-00770900.txt"),
    "utf8");
  assert.match(callerA, /0x0077099b:.*call\s+0x7da770/);
  assert.match(callerA, /0x007709a0:.*test\s+al, al/);
  const callerB = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v32-net", "caller-00785640.txt"),
    "utf8");
  assert.match(callerB, /0x00785681:.*call\s+0x7da770/);
  assert.match(callerB, /0x00785686:.*test\s+al, al/);
});

test("v32 BV: scalar laws (char dispatch + host-bool byte gate)", () => {
  /* char_gate: FULL-DWORD — exact 3 / 0xc; high bits never match. */
  assert.equal(wasm.isaac_pm_7da770_char_gate(0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(1) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(2) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(3) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_char_gate(4) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(0xb) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(0xc) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_char_gate(0xd) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(0x103) | 0, 0); /* high bits */
  assert.equal(wasm.isaac_pm_7da770_char_gate(0x10c) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_char_gate(0xffffffff) | 0, 0);
  /* value: char_gate first; the host bool is BYTE-masked (0x100's low
     byte is 0 — the PE tests al only). */
  assert.equal(wasm.isaac_pm_7da770_value(3, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_value(3, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_value(0xc, 0xff) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_value(3, 0x100) | 0, 0); /* low byte 0 */
  assert.equal(wasm.isaac_pm_7da770_value(0xc, 0x1ff) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_value(0xc, 0xffffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7da770_value(4, 1) | 0, 0);     /* gate first */
  assert.equal(wasm.isaac_pm_7da770_value(4, 0xff) | 0, 0);
  assert.equal(wasm.isaac_pm_7da770_value(2, 0) | 0, 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0], [3, 0], [3, 1], [0xc, 1], [4, 1], [0xc, 0],
    [0x103, 1], [0x10c, 0xff], [0xffffffff, 0xffffffff], [0x26b, 0x26b],
  ];
  for (const [a, b] of rows) {
    assert.equal(wasm.isaac_pm_7da770_char_gate(a >>> 0) | 0,
                 PM.pm7da770CharGate(a), `char ${a}`);
    assert.equal(wasm.isaac_pm_7da770_char_gate(a >>> 0) | 0,
                 v32BvCharGatePe(a), `char-pe ${a}`);
    assert.equal(wasm.isaac_pm_7da770_value(a >>> 0, b >>> 0) | 0,
                 PM.pm7da770Value(a, b), `value ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7da770_value(a >>> 0, b >>> 0) | 0,
                 v32BvValuePe(a, b), `value-pe ${a}/${b}`);
  }
});

test("v32 BV: deterministic randomized differential corpus", () => {
  let seed = 0x007da770 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const a = rnd() >>> 0;
    const b = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7da770_char_gate(a >>> 0) | 0,
                 v32BvCharGatePe(a), `trial ${trial} char-pe`);
    assert.equal(wasm.isaac_pm_7da770_char_gate(a >>> 0) | 0,
                 PM.pm7da770CharGate(a), `trial ${trial} char-model`);
    assert.equal(wasm.isaac_pm_7da770_value(a >>> 0, b >>> 0) | 0,
                 v32BvValuePe(a, b), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7da770_value(a >>> 0, b >>> 0) | 0,
                 PM.pm7da770Value(a, b), `trial ${trial} value-model`);
    /* coherence: char_gate is exact-only; value masks the bool byte. */
    assert.equal(wasm.isaac_pm_7da770_value(a >>> 0, b >>> 0) | 0,
                 (v32BvCharGatePe(a) === 1 && (b & 0xff) !== 0) ? 1 : 0,
                 `trial ${trial} value==gate-and-byte`);
    cases += 4;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7da770_char_gate(w >>> 0) | 0,
                 v32BvCharGatePe(w), `wide char ${w}`);
    assert.equal(wasm.isaac_pm_7da770_value(w >>> 0, w >>> 0) | 0,
                 v32BvValuePe(w, w), `wide value ${w}`);
    cases += 2;
  }
  assert.ok(cases >= 2000 + 10, `expected >= 2010 cases, got ${cases}`);
});

/* ====================================================================== */
/* v33 — BW: VA 0x007db6b0 Entity_Player::HasInstantDeathCurse (exact    */
/* ZHL, wave-20 C5: 14 pattern bytes, EntityPlayer.zhl `__thiscall bool  */
/* Entity_Player::HasInstantDeathCurse();`), the v31-declared frontier.  */
/* FULLY PURE: thiscall, plain ret, ZERO stack args, bool in al. 36      */
/* insns, 0 resyncs, 2 rets (0x7db6f0 ZERO / 0x7db6f1 ONE); E8 0,        */
/* indirect 0, mem-stores 0 — the whole body lands in-module, zero host  */
/* leaves, zero g_Game/global access. int3 pad 0x7db6f5..0x7db6ff; next  */
/* function 0x7db700 (B17 IsHologram, HOST). 14 direct rel32 E8 callers  */
/* (all byte-verified this unit). Machine law: byte [this+0x1519] != 0   */
/* -> skip the list scan (BYTE gate, the body's only one; same field as  */
/* v27 BQ / TD); scan entries [this+0x150c]..[this+0x1510] stride 0x10:  */
/* obj[0] == 0 && obj[4] == 0x70 (FULL-DWORD, the 0x70 sentinel) -> ONE; */
/* char [this+0x13c0] == 0x27 (FULL-DWORD, post-merge 0x7db6e4 — runs in */
/* EVERY case) -> ONE; else ZERO.                                        */
/* ====================================================================== */

function v33BwScanSkippedPe(flag1519) {
  /* 0x007db6b3 cmp byte ptr [esi + 0x1519], 0 / jne 0x7db6e4 — BYTE
     test (the body's only byte gate). */
  return (flag1519 & 0xff) !== 0 ? 1 : 0;
}

function v33BwElemMatchPe(elemTag, elemId) {
  /* 0x007db6d2 cmp dword [ecx], 0 / jne next ; 0x007db6d7 cmp dword
     [ecx + 4], 0x70 / je ONE — FULL-DWORD exact (0x100/0x170 never
     match). */
  return (elemTag >>> 0) === 0 && (elemId >>> 0) === 0x70 ? 1 : 0;
}

function v33BwWalkTerminatesPe(begin, end) {
  /* 0x007db6c8 cmp eax, edx (walk while eax != edx, eax += 0x10) — a
     wrapped span can never converge; a non-multiple-of-0x10 span can
     never land exactly on end. */
  const span = (end - begin) | 0;
  if (span < 0) return 0;
  return span % 0x10 === 0 ? 1 : 0;
}

function v33BwWalkStepsPe(begin, end) {
  if (v33BwWalkTerminatesPe(begin, end) === 0) return -1;
  return ((end - begin) | 0) / 0x10;
}

function v33BwScanFoundPe(tags, ids) {
  if (!tags || !ids || tags.length <= 0 || ids.length <= 0) return -1;
  const n = Math.min(tags.length, ids.length);
  for (let i = 0; i < n; i += 1) {
    if (v33BwElemMatchPe(tags[i], ids[i]) === 1) return 1;
  }
  return 0;
}

function v33BwCharGatePe(char13c0) {
  /* 0x007db6e4 cmp dword [esi + 0x13c0], 0x27 / je ONE — FULL-DWORD. */
  return (char13c0 >>> 0) === 0x27 ? 1 : 0;
}

function v33BwValuePe(flag1519, char13c0, tags, ids) {
  /* Whole body: skip gate guards the scan (jne skip at 0x7db6ba); the
     char check is post-merge — runs in EVERY case. */
  if ((flag1519 & 0xff) === 0 && v33BwScanFoundPe(tags, ids) === 1) {
    return 1;
  }
  return v33BwCharGatePe(char13c0);
}

test("v33 BW: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v33 island needles. */
  assert.match(h, /v33 — BW/);
  assert.match(h, /Entity_Player::HasInstantDeathCurse/);
  assert.match(h, /ISAAC_PM_BW_VA_BODY = 0x007db6b0/);
  assert.match(h, /ISAAC_PM_BW_VA_RET_ZERO = 0x007db6f0/);
  assert.match(h, /ISAAC_PM_BW_VA_RET_ONE = 0x007db6f1/);
  assert.match(h, /ISAAC_PM_BW_BODY_BYTES = 68/);
  assert.match(h, /ISAAC_PM_BW_CALLSITE_COUNT = 14/);
  assert.match(h, /ISAAC_PM_BW_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_BW_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_BW_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_BW_LIST_GATE_OFF = 0x1519/);
  assert.match(h, /ISAAC_PM_BW_LIST_BEGIN_OFF = 0x150c/);
  assert.match(h, /ISAAC_PM_BW_LIST_END_OFF = 0x1510/);
  assert.match(h, /ISAAC_PM_BW_LIST_ELEM_STRIDE = 0x10/);
  assert.match(h, /ISAAC_PM_BW_LIST_MATCH_TAG = 0/);
  assert.match(h, /ISAAC_PM_BW_LIST_MATCH_ID = 0x70/);
  assert.match(h, /ISAAC_PM_BW_CHAR_OFF = 0x13c0/);
  assert.match(h, /ISAAC_PM_BW_CHAR_CMP = 0x27/);
  /* ABI needles now point at 33; the five historical 22s stay 22. */
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION = 45/);
  assert.equal((h.match(/ABI_VERSION = 22 \}/g) || []).length, 5);
  /* Model constants agree (BW mirror). */
  assert.equal(PM.PM_BW_VA_BODY, 0x007db6b0);
  assert.equal(PM.PM_BW_VA_RET_ZERO, 0x007db6f0);
  assert.equal(PM.PM_BW_VA_RET_ONE, 0x007db6f1);
  assert.equal(PM.PM_BW_BODY_BYTES, 68);
  assert.equal(PM.PM_BW_CALLSITE_COUNT, 14);
  assert.equal(PM.PM_BW_E8_COUNT, 0);
  assert.equal(PM.PM_BW_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_BW_STORE_COUNT, 0);
  assert.equal(PM.PM_BW_LIST_GATE_OFF, 0x1519);
  assert.equal(PM.PM_BW_LIST_BEGIN_OFF, 0x150c);
  assert.equal(PM.PM_BW_LIST_END_OFF, 0x1510);
  assert.equal(PM.PM_BW_LIST_ELEM_STRIDE, 0x10);
  assert.equal(PM.PM_BW_LIST_MATCH_TAG, 0);
  assert.equal(PM.PM_BW_LIST_MATCH_ID, 0x70);
  assert.equal(PM.PM_BW_CHAR_OFF, 0x13c0);
  assert.equal(PM.PM_BW_CHAR_CMP, 0x27);
  /* All 14 census callers are pinned in both header and model. */
  const censusCallers = [
    0x006b6250, 0x006cd4c7, 0x006e8409, 0x006e863d, 0x007106dd,
    0x00777ea1, 0x0078ab38, 0x007c40ee, 0x007c4136, 0x0081654d,
    0x00816621, 0x00844277, 0x00983b8d, 0x009beb69,
  ];
  for (let i = 0; i < censusCallers.length; i += 1) {
    const hex8 = censusCallers[i].toString(16).padStart(8, "0");
    assert.match(h, new RegExp(`ISAAC_PM_BW_CALLER${i}_VA = 0x${hex8}`, "i"));
    assert.equal(PM[`PM_BW_CALLER${i}_VA`], censusCallers[i]);
  }
  /* Raw disasm needles (disasm-007db6b0.txt, this unit's re-decode). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-7db6b0", "disasm-007db6b0.txt"),
    "utf8");
  assert.match(dis, /cmp\s+byte ptr \[esi \+ 0x1519\], 0/);
  assert.match(dis, /cmp\s+dword ptr \[ecx\], 0/);
  assert.match(dis, /cmp\s+dword ptr \[ecx \+ 4\], 0x70/);
  assert.match(dis, /cmp\s+dword ptr \[esi \+ 0x13c0\], 0x27/);
  assert.match(dis, /add\s+eax, 0x10/);
  assert.match(dis, /E8 0/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /0x007db6f0: c3/); /* ZERO ret */
  assert.match(dis, /0x007db6f4: c3/); /* ONE ret (last) */
  /* Caller consumption (sampled windows, evidence in this dir). */
  const callerA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-7db6b0", "caller-009beb69.txt"),
    "utf8");
  assert.match(callerA, /0x009beb69:.*call\s+0x7db6b0/);
  assert.match(callerA, /0x009beb6e:.*test\s+al, al/);
  const callerB = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-7db6b0", "caller-007c40ee.txt"),
    "utf8");
  assert.match(callerB, /0x007c40ee:.*call\s+0x7db6b0/);
  assert.match(callerB, /0x007c40f3:.*test\s+al, al/);
  assert.match(callerB, /0x007c4136:.*call\s+0x7db6b0/);
});

test("v33 BW: scalar laws (scan gate / elem match / walk / char gate)", () => {
  /* scan_skipped: BYTE gate — only low byte matters. */
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(0 >>> 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(0xff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(0x100) | 0, 0); /* low byte 0 */
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(0x1ff) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(0xffffffff) | 0, 1);
  /* elem_match: FULL-DWORD exact tag 0 + id 0x70. */
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0, 0x70) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0, 0x71) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0, 0x6f) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(1, 0x70) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0, 0x170) | 0, 0); /* high bits */
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0x100, 0x70) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_elem_match(0xffffffff, 0xffffffff) | 0, 0);
  /* walk bounds: stride 0x10, wrapped spans never terminate. */
  assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(0x1000, 0x1060) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(0x1000, 0x1000) | 0, 1); /* empty */
  assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(0x1060, 0x1000) | 0, 0); /* wrapped */
  assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(0x1000, 0x1054) | 0, 0); /* misaligned */
  assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(0x80000000, 0x80000010) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x1000, 0x1060) | 0, 6);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x1000, 0x1000) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x1060, 0x1000) | 0, -1);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x1000, 0x1050) | 0, 5);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x1000, 0x1054) | 0, -1);
  assert.equal(wasm.isaac_pm_7db6b0_walk_steps(0x80000000, 0x80000010) | 0, 1);
  /* char_gate: FULL-DWORD exact 0x27. */
  assert.equal(wasm.isaac_pm_7db6b0_char_gate(0x27) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_char_gate(0x26) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_char_gate(0x28) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_char_gate(0x127) | 0, 0); /* high bits */
  assert.equal(wasm.isaac_pm_7db6b0_char_gate(0xffffffff) | 0, 0);
  /* scan_found + value through wasm memory arrays. */
  const view = new DataView(wasm.memory.buffer);
  const tagsPtr = SCRATCH + 0x4000;
  const idsPtr = SCRATCH + 0x5000;
  const put = (ptr, vals) => {
    for (let i = 0; i < vals.length; i += 1) writeU32(view, ptr + i * 4, vals[i]);
  };
  put(tagsPtr, [0, 1, 0]);
  put(idsPtr, [0x70, 0x70, 0x10]);
  /* found at index 0 (early-exit OR) */
  assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, 3) | 0, 1);
  put(tagsPtr, [1, 0, 0]);
  put(idsPtr, [0x70, 0x60, 0x70]);
  assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, 3) | 0, 1); /* idx 2 */
  put(tagsPtr, [1, 2, 0]);
  put(idsPtr, [0x70, 0x60, 0x170]);
  assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, 3) | 0, 0);
  assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, 0) | 0, -1); /* empty */
  assert.equal(wasm.isaac_pm_7db6b0_scan_found(0, 0, 0) | 0, -1);            /* null */
  /* value: (scan runs && found) || char gate (post-merge, runs always). */
  put(tagsPtr, [0]);
  put(idsPtr, [0x70]);
  assert.equal(wasm.isaac_pm_7db6b0_value(0, 0, tagsPtr, idsPtr, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_value(1, 0, tagsPtr, idsPtr, 1) | 0, 0); /* skipped */
  assert.equal(wasm.isaac_pm_7db6b0_value(0x100, 0, tagsPtr, idsPtr, 1) | 0, 1); /* 0x100 low byte IS 0 -> skip NOT set -> scan runs -> found -> 1 */
  assert.equal(wasm.isaac_pm_7db6b0_value(0x101, 0, tagsPtr, idsPtr, 1) | 0, 0); /* skip set */
  assert.equal(wasm.isaac_pm_7db6b0_value(0, 0x27, 0, 0, 0) | 0, 1);        /* char only */
  assert.equal(wasm.isaac_pm_7db6b0_value(1, 0x27, tagsPtr, idsPtr, 1) | 0, 1);
  put(tagsPtr, [1]);
  put(idsPtr, [0x70]);
  assert.equal(wasm.isaac_pm_7db6b0_value(0, 0, tagsPtr, idsPtr, 1) | 0, 0); /* no match */
  assert.equal(wasm.isaac_pm_7db6b0_value(0, 0x27, tagsPtr, idsPtr, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7db6b0_value(0, 0x127, tagsPtr, idsPtr, 1) | 0, 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0, [], []], [1, 0, [], []], [0x100, 0, [], []],
    [0, 0x27, [], []], [1, 0x27, [], []], [0x101, 0x27, [], []],
    [0, 0, [0], [0x70]], [1, 0, [0], [0x70]], [0x100, 0, [0], [0x70]],
    [0, 0, [1], [0x70]], [0, 0, [0], [0x170]], [0x101, 0x27, [0], [0x70]],
    [0, 0x27, [1], [0x70]], [0x1ff, 0xffffffff, [0, 1, 0], [0x70, 0x70, 0x10]],
    [0, 0x26, [0, 1, 0], [0x70, 0x60, 0x70]],
  ];
  for (const [flag, ch, tags, ids] of rows) {
    put(tagsPtr, tags);
    put(idsPtr, ids);
    const n = Math.min(tags.length, ids.length);
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(flag >>> 0) | 0,
                 v33BwScanSkippedPe(flag), `skip ${flag}`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(flag >>> 0) | 0,
                 PM.pm7db6b0ScanSkipped(flag), `skip-model ${flag}`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(ch >>> 0) | 0,
                 v33BwCharGatePe(ch), `char ${ch}`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(ch >>> 0) | 0,
                 PM.pm7db6b0CharGate(ch), `char-model ${ch}`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, n) | 0,
                 v33BwScanFoundPe(tags, ids), `scan ${JSON.stringify(tags)}/${JSON.stringify(ids)}`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, n) | 0,
                 PM.pm7db6b0ScanFound(tags, ids), `scan-model ${JSON.stringify(tags)}`);
    assert.equal(wasm.isaac_pm_7db6b0_value(flag >>> 0, ch >>> 0, tagsPtr, idsPtr, n) | 0,
                 v33BwValuePe(flag, ch, tags, ids), `value ${flag}/${ch}/${JSON.stringify(ids)}`);
    assert.equal(wasm.isaac_pm_7db6b0_value(flag >>> 0, ch >>> 0, tagsPtr, idsPtr, n) | 0,
                 PM.pm7db6b0Value(flag, ch, tags, ids), `value-model ${flag}/${ch}`);
    /* elem parity on the row's first pair (empty rows: no pairs). */
    if (n > 0) {
      assert.equal(wasm.isaac_pm_7db6b0_elem_match(tags[0] >>> 0, ids[0] >>> 0) | 0,
                   v33BwElemMatchPe(tags[0], ids[0]), `elem ${tags[0]}/${ids[0]}`);
    }
  }
});

test("v33 BW: deterministic randomized differential corpus", () => {
  let seed = 0x007db6b0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const view = new DataView(wasm.memory.buffer);
  const tagsPtr = SCRATCH + 0x4000;
  const idsPtr = SCRATCH + 0x5000;
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const flag = rnd() >>> 0;
    const ch = rnd() >>> 0;
    const n = rnd() % 6;
    const tags = [];
    const ids = [];
    for (let i = 0; i < n; i += 1) {
      const t = rnd() >>> 0;
      const id = rnd() >>> 0;
      /* inject sentinel shapes so matches actually occur. */
      tags.push(t % 4 === 0 ? 0 : t);
      ids.push(id % 5 === 0 ? 0x70 : (id % 7 === 0 ? 0x170 : id));
      writeU32(view, tagsPtr + i * 4, tags[i] >>> 0);
      writeU32(view, idsPtr + i * 4, ids[i] >>> 0);
    }
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(flag >>> 0) | 0,
                 v33BwScanSkippedPe(flag), `trial ${trial} skip-pe`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(flag >>> 0) | 0,
                 PM.pm7db6b0ScanSkipped(flag), `trial ${trial} skip-model`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(ch >>> 0) | 0,
                 v33BwCharGatePe(ch), `trial ${trial} char-pe`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(ch >>> 0) | 0,
                 PM.pm7db6b0CharGate(ch), `trial ${trial} char-model`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, n) | 0,
                 v33BwScanFoundPe(tags, ids), `trial ${trial} scan-pe`);
    assert.equal(wasm.isaac_pm_7db6b0_scan_found(tagsPtr, idsPtr, n) | 0,
                 PM.pm7db6b0ScanFound(tags, ids), `trial ${trial} scan-model`);
    assert.equal(wasm.isaac_pm_7db6b0_value(flag >>> 0, ch >>> 0, tagsPtr, idsPtr, n) | 0,
                 v33BwValuePe(flag, ch, tags, ids), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7db6b0_value(flag >>> 0, ch >>> 0, tagsPtr, idsPtr, n) | 0,
                 PM.pm7db6b0Value(flag, ch, tags, ids), `trial ${trial} value-model`);
    /* coherence: skip is a byte gate; char is exact-only; scan is an
       early-exit OR of FULL-DWORD elem matches; value composes. */
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(flag >>> 0) | 0,
                 (flag & 0xff) !== 0 ? 1 : 0, `trial ${trial} skip==low-byte`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(ch >>> 0) | 0,
                 ch >>> 0 === 0x27 ? 1 : 0, `trial ${trial} char==exact`);
    assert.equal(wasm.isaac_pm_7db6b0_value(flag >>> 0, ch >>> 0, tagsPtr, idsPtr, n) | 0,
                 (((flag & 0xff) === 0 && v33BwScanFoundPe(tags, ids) === 1) ||
                  (ch >>> 0) === 0x27) ? 1 : 0,
                 `trial ${trial} value==gate-scan-or-char`);
    cases += 9;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db6b0_scan_skipped(w >>> 0) | 0,
                 v33BwScanSkippedPe(w), `wide skip ${w}`);
    assert.equal(wasm.isaac_pm_7db6b0_char_gate(w >>> 0) | 0,
                 v33BwCharGatePe(w), `wide char ${w}`);
    assert.equal(wasm.isaac_pm_7db6b0_elem_match(w >>> 0, w >>> 0) | 0,
                 v33BwElemMatchPe(w, w), `wide elem ${w}`);
    if (w === 0x127 || w === 0x170) {
      /* high-bit near-misses: 0x127 char and 0x170 id never match. */
      assert.equal(wasm.isaac_pm_7db6b0_char_gate(0x127) | 0, 0);
      assert.equal(wasm.isaac_pm_7db6b0_elem_match(0, 0x170) | 0, 0);
      cases += 2;
    }
    assert.equal(wasm.isaac_pm_7db6b0_walk_terminates(w >>> 0, (w + 0x10) >>> 0) | 0,
                 v33BwWalkTerminatesPe(w, (w + 0x10) >>> 0), `wide walk ${w}`);
    assert.equal(wasm.isaac_pm_7db6b0_walk_steps(w >>> 0, (w + 0x10) >>> 0) | 0,
                 v33BwWalkStepsPe(w, (w + 0x10) >>> 0), `wide steps ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 4500 + 25, `expected >= 4525 cases, got ${cases}`);
});

/* ====================================================================== */
/* v34 — B3: VA 0x007da7a0 collectible-drop bool gate (NARROWED — the    */
/* HUD host leaf 0x72fd10 GetCollectible call stays host, its result is  */
/* a typed sample). thiscall, ret 4 (ONE stack arg `arg`), bool in al    */
/* (both callers consume `test al, al` / jne only). 40 insns, 2 rets     */
/* (0x7da800 ZERO / 0x7da807 ONE); 1 E8 (0x72fd10 = exact ZHL            */
/* ItemConfig::GetCollectible — v29 loop-law HUD host leaf, do-not-      */
/* reopen); 0 indirect; 0 obj stores. int3 pad 0x7da80a..0x7da80f; next  */
/* function 0x7da810 (B4 SpawnClot host). 2 direct rel32 E8 callers      */
/* (0x6ebb9c arg 0 / 0x6ebbd5 arg 1 — room/player host band). Machine    */
/* law: arg UNSIGNED > 3 -> ONE (first gate, BEFORE the slot array       */
/* read); slot (dword [this + 0x1580 + arg*0x20]) == 0 -> ONE (FULL-     */
/* DWORD); SIGNED slot >= size ((end-begin)>>2 span) -> ONE; slot in     */
/* {0xeb,0x2b,0x3d} -> ONE (FULL-DWORD); cfg (host sample) == 0 -> ONE   */
/* (FULL-DWORD); slot in {0x248,0x3b} -> ONE; else ZERO. ZERO byte       */
/* gates end-to-end (nothing is masked).                                 */
/* ====================================================================== */

function v34B3ArgGatePe(arg) {
  /* 0x007da7a7 cmp eax, 3 / 0x007da7aa ja 0x7da803 — UNSIGNED bound,
     the body's first gate (before the slot array read). */
  return (arg >>> 0) > 3 ? 1 : 0;
}

function v34B3ValuePe(arg, slot, size, cfg) {
  /* 0x007da7b7 test esi,esi / je ONE ; 0x007da7cf cmp esi,eax / jge
     ONE (SIGNED size sample) ; 0x007da7d3/0x7da7db/0x7da7e0 cmp
     slot,0xeb/0x2b/0x3d / je ONE ; 0x007da7eb test eax,eax / je ONE
     (host cfg FULL-DWORD) ; 0x007da7ef/0x7da7f7 cmp slot,0x248/0x3b /
     je ONE ; else ZERO. */
  if (v34B3ArgGatePe(arg) === 1) return 1;
  if ((slot >>> 0) === 0) return 1;
  if ((slot | 0) >= (size | 0)) return 1;
  if ((slot >>> 0) === 0xeb || (slot >>> 0) === 0x2b ||
      (slot >>> 0) === 0x3d) return 1;
  if ((cfg >>> 0) === 0) return 1;
  if ((slot >>> 0) === 0x248 || (slot >>> 0) === 0x3b) return 1;
  return 0;
}

test("v34 B3: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v34 B3 island needles. */
  assert.match(h, /v34 — B3/);
  assert.match(h, /ISAAC_PM_B3_VA_BODY = 0x007da7a0/);
  assert.match(h, /ISAAC_PM_B3_VA_RET_ZERO = 0x007da800/);
  assert.match(h, /ISAAC_PM_B3_VA_RET_ONE = 0x007da807/);
  assert.match(h, /ISAAC_PM_B3_BODY_BYTES = 103/);
  assert.match(h, /ISAAC_PM_B3_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B3_CALLER0_VA = 0x006ebb9c/);
  assert.match(h, /ISAAC_PM_B3_CALLER1_VA = 0x006ebbd5/);
  assert.match(h, /ISAAC_PM_B3_E8_COUNT = 1/);
  assert.match(h, /ISAAC_PM_B3_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B3_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B3_GET_COLLECTIBLE_VA = 0x0072fd10/);
  assert.match(h, /ISAAC_PM_B3_ARG_MAX = 3/);
  assert.match(h, /ISAAC_PM_B3_SLOT_BASE_OFF = 0x1580/);
  assert.match(h, /ISAAC_PM_B3_ID_SKIP_A = 0xeb/);
  assert.match(h, /ISAAC_PM_B3_ID_SKIP_B = 0x2b/);
  assert.match(h, /ISAAC_PM_B3_ID_SKIP_C = 0x3d/);
  assert.match(h, /ISAAC_PM_B3_ID_SKIP_D = 0x248/);
  assert.match(h, /ISAAC_PM_B3_ID_SKIP_E = 0x3b/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.equal((h.match(/ABI_VERSION = 22 \}/g) || []).length, 5);
  /* Model constants agree (B3 mirror). */
  assert.equal(PM.PM_B3_VA_BODY, 0x007da7a0);
  assert.equal(PM.PM_B3_VA_RET_ZERO, 0x007da800);
  assert.equal(PM.PM_B3_VA_RET_ONE, 0x007da807);
  assert.equal(PM.PM_B3_BODY_BYTES, 103);
  assert.equal(PM.PM_B3_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_B3_CALLER0_VA, 0x006ebb9c);
  assert.equal(PM.PM_B3_CALLER1_VA, 0x006ebbd5);
  assert.equal(PM.PM_B3_E8_COUNT, 1);
  assert.equal(PM.PM_B3_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_B3_STORE_COUNT, 0);
  assert.equal(PM.PM_B3_GET_COLLECTIBLE_VA, 0x0072fd10);
  assert.equal(PM.PM_B3_ARG_MAX, 3);
  assert.equal(PM.PM_B3_SLOT_BASE_OFF, 0x1580);
  assert.equal(PM.PM_B3_ID_SKIP_A, 0xeb);
  assert.equal(PM.PM_B3_ID_SKIP_B, 0x2b);
  assert.equal(PM.PM_B3_ID_SKIP_C, 0x3d);
  assert.equal(PM.PM_B3_ID_SKIP_D, 0x248);
  assert.equal(PM.PM_B3_ID_SKIP_E, 0x3b);
  /* Raw disasm needles (disasm-007da7a0.txt = this unit's span dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-band2", "disasm-007da7a0.txt"),
    "utf8");
  assert.match(dis, /cmp\s+eax, 3/);
  assert.match(dis, /ja\s+0x7da803/);
  assert.match(dis, /add\s+eax, 0xac/);
  assert.match(dis, /shl\s+eax, 5/);
  assert.match(dis, /mov\s+esi, dword ptr \[eax \+ ecx\]/);
  assert.match(dis, /test\s+esi, esi/);
  assert.match(dis, /sar\s+eax, 2/);
  assert.match(dis, /cmp\s+esi, eax/);
  assert.match(dis, /jge\s+0x7da803/);
  assert.match(dis, /cmp\s+esi, 0xeb/);
  assert.match(dis, /cmp\s+esi, 0x2b/);
  assert.match(dis, /cmp\s+esi, 0x3d/);
  assert.match(dis, /call\s+0x72fd10/);
  assert.match(dis, /test\s+eax, eax/);
  assert.match(dis, /cmp\s+esi, 0x248/);
  assert.match(dis, /cmp\s+esi, 0x3b/);
  assert.match(dis, /rets 2/);
  assert.match(dis, /E8 1/);
  assert.match(dis, /indirect 0/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /0x007da800: c20400\s+ret\s+4/);
  assert.match(dis, /0x007da807: c20400\s+ret\s+4/);
  /* Caller-band evidence: both callers consume the bool (test al). */
  const caller = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-band2", "caller-006ebb80.txt"),
    "utf8");
  assert.match(caller, /0x006ebb9c:.*call\s+0x7da7a0/);
  assert.match(caller, /0x006ebba1:.*test\s+al, al/);
  assert.match(caller, /0x006ebbd5:.*call\s+0x7da7a0/);
  assert.match(caller, /0x006ebbda:.*test\s+al, al/);
});

test("v34 B3: scalar laws (unsigned arg bound + full-dword gates)", () => {
  /* arg_gate: UNSIGNED — arg > 3 returns ONE (0x7da7aa ja ONE); the
     gate runs BEFORE the slot array read in the PE. */
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(0 | 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(1) | 0, 0);
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(3) | 0, 0);
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(4) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(0x7fffffff) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_arg_gate(0xffffffff) | 0, 1); /* signed -1 */
  /* value: whole-body composition. */
  assert.equal(wasm.isaac_pm_7da7a0_value(4, 0, 0, 0) | 0, 1); /* arg gate */
  assert.equal(wasm.isaac_pm_7da7a0_value(0xffffffff, 0, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0, 0, 0) | 0, 1); /* slot 0 */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0xeb, 0x100, 1) | 0, 1); /* id skip */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0x2b, 0x100, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0x3d, 0x100, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0x248, 0x100, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0x3b, 0x100, 1) | 0, 1);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 1, 0x100, 0) | 0, 1); /* cfg 0 */
  assert.equal(wasm.isaac_pm_7da7a0_value(3, 1, 0x100, 1) | 0, 0); /* else */
  /* SIGNED size compare: slot >= size when both are signed-interpreted. */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 1, -1 >>> 0, 1) | 0, 1); /* 1 >= -1 */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0xffffffff, 0, 1) | 0, 0); /* -1 < 0 */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0xffffffff, 0x7fffffff, 1) | 0, 0);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 1, 0, 1) | 0, 1); /* 1 >= 0 */
  /* high-bit near-misses: 0x1eb/0xffffffeb do NOT match the id skips
     (FULL-DWORD), and remain below a large-enough size bound. */
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0x1eb, 0x200, 1) | 0, 0);
  assert.equal(wasm.isaac_pm_7da7a0_value(0, 0xffffffeb, 0x100, 1) | 0, 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0, 0, 0], [3, 1, 0x100, 1], [4, 1, 0x100, 1], [0, 0xeb, 0x100, 1],
    [0, 1, 0x100, 0], [0, 1, 0x100, 1], [0, 1, -1 >>> 0, 1],
    [0, 0xffffffff, 0, 1], [0, 0x3b, 0x100, 1], [0, 0x248, 0x100, 1],
    [0, 0x1eb, 0x100, 1], [0xffffffff, 0, 0, 0],
  ];
  for (const [a, s, z, c] of rows) {
    assert.equal(wasm.isaac_pm_7da7a0_arg_gate(a >>> 0) | 0,
                 v34B3ArgGatePe(a), `arg ${a}`);
    assert.equal(wasm.isaac_pm_7da7a0_arg_gate(a >>> 0) | 0,
                 PM.pm7da7a0ArgGate(a), `arg-model ${a}`);
    assert.equal(wasm.isaac_pm_7da7a0_value(a >>> 0, s >>> 0, z >>> 0, c >>> 0) | 0,
                 v34B3ValuePe(a, s, z, c), `value ${a}/${s}/${z}/${c}`);
    assert.equal(wasm.isaac_pm_7da7a0_value(a >>> 0, s >>> 0, z >>> 0, c >>> 0) | 0,
                 PM.pm7da7a0Value(a, s, z, c), `value-model ${a}/${s}/${z}/${c}`);
  }
});

test("v34 B3: deterministic randomized differential corpus", () => {
  let seed = 0x007da7a0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial++) {
    const a = rnd() >>> 0;
    const s = rnd() >>> 0;
    const z = rnd() >>> 0;
    const c = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7da7a0_arg_gate(a >>> 0) | 0,
                 v34B3ArgGatePe(a), `trial ${trial} arg-pe`);
    assert.equal(wasm.isaac_pm_7da7a0_arg_gate(a >>> 0) | 0,
                 PM.pm7da7a0ArgGate(a), `trial ${trial} arg-model`);
    assert.equal(wasm.isaac_pm_7da7a0_value(a >>> 0, s >>> 0, z >>> 0, c >>> 0) | 0,
                 v34B3ValuePe(a, s, z, c), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7da7a0_value(a >>> 0, s >>> 0, z >>> 0, c >>> 0) | 0,
                 PM.pm7da7a0Value(a, s, z, c), `trial ${trial} value-model`);
    /* coherence: arg gate dominates; id skips only hit exact dwords. */
    assert.equal(wasm.isaac_pm_7da7a0_value(a >>> 0, s >>> 0, z >>> 0, c >>> 0) | 0,
                 v34B3ArgGatePe(a) === 1 ? 1 :
                   ((s >>> 0) === 0 || (s | 0) >= (z | 0) ||
                    [0xeb, 0x2b, 0x3d].includes(s >>> 0) ||
                    (c >>> 0) === 0 || [0x248, 0x3b].includes(s >>> 0)) ? 1 : 0,
                 `trial ${trial} value==gate-chain`);
    cases += 5;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7da7a0_arg_gate(w >>> 0) | 0,
                 v34B3ArgGatePe(w), `wide arg ${w}`);
    assert.equal(wasm.isaac_pm_7da7a0_value(w >>> 0, w >>> 0, w >>> 0, w >>> 0) | 0,
                 v34B3ValuePe(w, w, w, w), `wide value ${w}`);
    assert.equal(wasm.isaac_pm_7da7a0_value(w >>> 0, w >>> 0, w >>> 0, w >>> 0) | 0,
                 PM.pm7da7a0Value(w, w, w, w), `wide value-model ${w}`);
    cases += 3;
  }
  assert.ok(cases >= 3000 + 15, `expected >= 3015 cases, got ${cases}`);
});

/* ====================================================================== */
/* v34 — B5: VA 0x007dac30 clot-crowd bool gate (FULLY PURE — E8 0 /     */
/* indirect 0 / stores 0, the whole body lands in-module, zero host      */
/* leaves). thiscall, plain ret, ZERO stack args, bool in al (the only   */
/* caller 0x77cc34 consumes `test al, al; je` — TRUE gates the clot      */
/* counter [this+0x1f7c] that releases the B4 0x7da810 SpawnClot host    */
/* at 60). 21 insns, 2 rets (0x7dac7a ZERO / 0x7dac7d ONE). int3 pad     */
/* 0x7dac7e..0x7dac7f; next function 0x7dac80 (B6 TryForgottenThrow      */
/* host). 1 direct rel32 E8 caller (0x77cc34). Machine law: SIGNED       */
/* v194c > 0 -> ONE; SIGNED v1348 > 0 -> ONE; v1344 > 0 AND SIGNED       */
/* (v1d88+v134c wrapped) > 0 -> ONE; SIGNED (v1344-v1da4 wrapped) > 1    */
/* -> ONE; SIGNED (v1d88+v134c wrapped) > 1 -> ONE; else ZERO. ZERO      */
/* byte gates — every gate FULL-DWORD SIGNED.                            */
/* ====================================================================== */

function v34B5ValuePe(v194c, v1348, v1344, v1d88, v134c, v1da4) {
  /* 0x007dac30/0x7dac39 cmp [0x194c]/[0x1348],0 / jg ONE ; 0x007dac48
     test edx,edx / jle 0x7dac5c (v1344<=0 skips the mid gate) ;
     0x007dac58 test eax,eax / jg ONE (wrapped sum) ; 0x007dac62 cmp
     edx,1 / jg ONE (wrapped sub) ; 0x007dac73 cmp eax,1 / jg ONE ;
     else ZERO. All signed full-dword. */
  if ((v194c | 0) > 0) return 1;
  if ((v1348 | 0) > 0) return 1;
  if ((v1344 | 0) > 0 && ((v1d88 >>> 0) + (v134c >>> 0) | 0) > 0) return 1;
  if (((v1344 >>> 0) - (v1da4 >>> 0) | 0) > 1) return 1;
  if (((v1d88 >>> 0) + (v134c >>> 0) | 0) > 1) return 1;
  return 0;
}

test("v34 B5: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v34 B5 island needles. */
  assert.match(h, /v34 — B5/);
  assert.match(h, /ISAAC_PM_B5_VA_BODY = 0x007dac30/);
  assert.match(h, /ISAAC_PM_B5_VA_RET_ZERO = 0x007dac7a/);
  assert.match(h, /ISAAC_PM_B5_VA_RET_ONE = 0x007dac7d/);
  assert.match(h, /ISAAC_PM_B5_BODY_BYTES = 77/);
  assert.match(h, /ISAAC_PM_B5_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_B5_CALLER0_VA = 0x0077cc34/);
  assert.match(h, /ISAAC_PM_B5_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B5_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B5_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B5_OFF_194C = 0x194c/);
  assert.match(h, /ISAAC_PM_B5_OFF_1348 = 0x1348/);
  assert.match(h, /ISAAC_PM_B5_OFF_1344 = 0x1344/);
  assert.match(h, /ISAAC_PM_B5_OFF_1D88 = 0x1d88/);
  assert.match(h, /ISAAC_PM_B5_OFF_134C = 0x134c/);
  assert.match(h, /ISAAC_PM_B5_OFF_1DA4 = 0x1da4/);
  /* Model constants agree (B5 mirror). */
  assert.equal(PM.PM_B5_VA_BODY, 0x007dac30);
  assert.equal(PM.PM_B5_VA_RET_ZERO, 0x007dac7a);
  assert.equal(PM.PM_B5_VA_RET_ONE, 0x007dac7d);
  assert.equal(PM.PM_B5_BODY_BYTES, 77);
  assert.equal(PM.PM_B5_CALLSITE_COUNT, 1);
  assert.equal(PM.PM_B5_CALLER0_VA, 0x0077cc34);
  assert.equal(PM.PM_B5_E8_COUNT, 0);
  assert.equal(PM.PM_B5_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_B5_STORE_COUNT, 0);
  assert.equal(PM.PM_B5_OFF_194C, 0x194c);
  assert.equal(PM.PM_B5_OFF_1348, 0x1348);
  assert.equal(PM.PM_B5_OFF_1344, 0x1344);
  assert.equal(PM.PM_B5_OFF_1D88, 0x1d88);
  assert.equal(PM.PM_B5_OFF_134C, 0x134c);
  assert.equal(PM.PM_B5_OFF_1DA4, 0x1da4);
  /* Raw disasm needles (disasm-007dac30.txt = this unit's span dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-band2", "disasm-007dac30.txt"),
    "utf8");
  assert.match(dis, /cmp\s+dword ptr \[ecx \+ 0x194c\], 0/);
  assert.match(dis, /cmp\s+dword ptr \[ecx \+ 0x1348\], 0/);
  assert.match(dis, /mov\s+edx, dword ptr \[ecx \+ 0x1344\]/);
  assert.match(dis, /test\s+edx, edx/);
  assert.match(dis, /mov\s+eax, dword ptr \[ecx \+ 0x1d88\]/);
  assert.match(dis, /add\s+eax, dword ptr \[ecx \+ 0x134c\]/);
  assert.match(dis, /sub\s+edx, dword ptr \[ecx \+ 0x1da4\]/);
  assert.match(dis, /cmp\s+edx, 1/);
  assert.match(dis, /cmp\s+eax, 1/);
  assert.match(dis, /rets 2/);
  assert.match(dis, /E8 0/);
  assert.match(dis, /indirect 0/);
  assert.match(dis, /mem-stores 0/);
  assert.match(dis, /0x007dac7a: c3\s+ret/);
  assert.match(dis, /0x007dac7d: c3\s+ret/);
  /* Caller-band evidence: the only caller consumes the bool. */
  const caller = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v33-band2", "caller-0077cc10.txt"),
    "utf8");
  assert.match(caller, /0x0077cc34:.*call\s+0x7dac30/);
  assert.match(caller, /0x0077cc39:.*test\s+al, al/);
});

test("v34 B5: scalar laws (signed full-dword gates, 32-bit wrap sums)", () => {
  /* v194c / v1348: SIGNED > 0. */
  assert.equal(wasm.isaac_pm_7dac30_value(1, 0, 0, 0, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 1, 0, 0, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(-1 >>> 0, 0, 0, 0, 0, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0x7fffffff, 0, 0, 0, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(0x80000000, 0, 0, 0, 0, 0) | 0, 0);
  /* mid gate: v1344 > 0 AND wrapped (v1d88+v134c) > 0. */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 1, 0, 0, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 1, 1, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, -1 >>> 0, 1, 0, 0) | 0, 0);
  /* 32-bit wrap on the sums: 0xffffffff + 2 wraps to 1 — the MID gate
     (SIGNED > 0) FIRES on 1; the LAST gate (SIGNED > 1) does NOT. */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 1, 0xffffffff, 2, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 1, 0xffffffff, 2, 0xffffffff) | 0,
               1);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 1, 0xffffffff, 1, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 0xffffffff, 2, 0) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 0xffffffff, 2, 0xffffffff) | 0,
               0);
  /* v1344 - v1da4 wrap: 0xffffffff - 0x7fffffff == 0x80000000 (signed
     negative) — NOT > 1. */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0xffffffff, 0, 0,
                                          0x7fffffff) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0xffffffff, 0, 0,
                                          0xfffffffe) | 0, 0);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 5, 0, 0, 3) | 0, 1); /* >1 */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 5, 0, 0, 4) | 0, 0); /* ==1 */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 5, 0, 0, 0xffffffff) | 0, 1);
  /* v1d88+v134c > 1 (post gates). */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 2, 0, 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 1, 0, 0) | 0, 0); /* ==1 */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 0x80000000, 0, 0) | 0, 0);
  /* all-zero: else ZERO. */
  assert.equal(wasm.isaac_pm_7dac30_value(0, 0, 0, 0, 0, 0) | 0, 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0, 0, 0, 0, 0], [1, 0, 0, 0, 0, 0], [0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0], [0, 0, 1, 0xffffffff, 2, 0],
    [0, 0, 0xffffffff, 0, 0, 0x7fffffff], [0, 0, 5, 0, 0, 3],
    [0, 0, 0, 2, 0, 0], [0, 0, 0, 1, 1, 0],
    [0xffffffff, 0xffffffff, 0x7fffffff, 2, 0x80000000, 0x7fffffff],
    [0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff, 0x7fffffff],
    [0x80000000, 0x80000000, 0x80000000, 0x80000000, 0x80000000, 0x80000000],
  ];
  for (const r of rows) {
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 v34B5ValuePe(...r), `value ${r.map((x) => x.toString(16))}`);
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 PM.pm7dac30Value(...r), `value-model ${r.map((x) => x.toString(16))}`);
  }
});

test("v34 B5: deterministic randomized differential corpus", () => {
  let seed = 0x007dac30 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 600; trial++) {
    const r = [rnd(), rnd(), rnd(), rnd(), rnd(), rnd()];
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 v34B5ValuePe(...r), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 PM.pm7dac30Value(...r), `trial ${trial} value-model`);
    /* coherence: gate chain is signature-exact (re-derivation). */
    const v = r.map((x) => x >>> 0);
    assert.equal(wasm.isaac_pm_7dac30_value(...v) | 0,
                 ((v[0] | 0) > 0 || (v[1] | 0) > 0 ||
                  ((v[2] | 0) > 0 && (((v[3] >>> 0) + (v[4] >>> 0)) | 0) > 0) ||
                  ((((v[2] >>> 0) - (v[5] >>> 0)) | 0) > 1) ||
                  ((((v[3] >>> 0) + (v[4] >>> 0)) | 0) > 1)) ? 1 : 0,
                 `trial ${trial} value==chain`);
    cases += 3;
  }
  /* Wide drives. */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    const r = [w, w, w, w, w, w];
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 v34B5ValuePe(...r), `wide value ${w}`);
    assert.equal(wasm.isaac_pm_7dac30_value(...r.map((x) => x >>> 0)) | 0,
                 PM.pm7dac30Value(...r), `wide value-model ${w}`);
    cases += 2;
  }
  assert.ok(cases >= 1800 + 10, `expected >= 1810 cases, got ${cases}`);
});

/* ====================================================================== */
/* v35 — B9: VA 0x007daff0 flag/effect decision island (NARROWED — the   */
/* count resolver 0x7cb6e0 + effect-add 0x930220 stay host; the flag     */
/* byte store [this+0x1eec] stays host). thiscall, ret plain, VOID (the  */
/* only caller 0x7a50d7 does NOT consume the return — it zeroes byte     */
/* [this+0x1fc4], calls, then pushes args for its own 0x930550 effect    */
/* calls). 67 insns, 2 rets (0x7db086 count>=1 / 0x7db094 count==0);     */
/* 2 E8; 0 indirect; 2 observable stores (byte [this+0x1eec] — the flag  */
/* is OVERWRITTEN unconditionally, unlike B10/B11/B12). Laws: flag_value */
/* (0x00/0x10/0x20 dispatch), loop_iters (0/1/2 esi count), size_gate    */
/* (SIGNED size > 0x4e4 — wasm32 compare-flip class), host_needed        */
/* (gate AND slot != 0 FULL-DWORD). ZERO byte gates, zero uint8_t.       */
/* ====================================================================== */

function v35B9FlagValuePe(count) {
  /* 0x007db005 sub eax,0 ; je 0x7db087 (count==0 -> store 0x00) ;
     0x007db00a sub eax,1 ; je 0x7db018 (count==1 -> al=0x10) ; else
     al=0x20 (0x7db014) ; 0x7db01f stores al. FULL-DWORD dispatch. */
  const c = count | 0;
  if (c === 0) return 0x00;
  if (c === 1) return 0x10;
  return 0x20;
}

function v35B9LoopItersPe(count) {
  /* 0x007db00f mov esi,2 (>=2) / 0x007db018 mov esi,1 (count==1) ;
     0x007db07b sub esi,1 ; 0x007db07e jne 0x7db025 — the effect loop
     runs esi times; count==0 goes to the 0x7db087 epilogue (no loop). */
  const c = count | 0;
  if (c === 0) return 0;
  if (c === 1) return 1;
  return 2;
}

function v35B9SizeGatePe(begin, end) {
  /* 0x007db036 sub eax,ecx (32-bit wrap) ; 0x007db038 and eax,~3 ;
     0x007db03b cmp eax,0x4e4 ; 0x007db040 jle 0x7db07b — SIGNED <=
     skips the effect call. */
  const size = ((end >>> 0) - (begin >>> 0)) & 0xfffffffc;
  return (size | 0) > 0x4e4 ? 1 : 0;
}

function v35B9HostNeededPe(begin, end, slot) {
  /* 0x007db042 mov eax,[ecx+0x4e4] ; 0x007db048 test eax,eax ;
     0x007db04a je 0x7db07b — slot FULL-DWORD. */
  return v35B9SizeGatePe(begin, end) !== 0 && (slot >>> 0) !== 0 ? 1 : 0;
}

test("v35 B9: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v35 B9 island needles. */
  assert.match(h, /v35 — B9/);
  assert.match(h, /ISAAC_PM_B9_VA_BODY = 0x007daff0/);
  assert.match(h, /ISAAC_PM_B9_VA_RET_ONE = 0x007db086/);
  assert.match(h, /ISAAC_PM_B9_VA_RET_ZERO = 0x007db094/);
  assert.match(h, /ISAAC_PM_B9_BODY_BYTES = 164/);
  assert.match(h, /ISAAC_PM_B9_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_B9_CALLER0_VA = 0x007a50d7/);
  assert.match(h, /ISAAC_PM_B9_E8_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B9_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B9_STORE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B9_COUNT_ID = 0x79/);
  assert.match(h, /ISAAC_PM_B9_FLAG_OFF = 0x1eec/);
  assert.match(h, /ISAAC_PM_B9_GAME_GLOBAL_VA = 0x00c7169c/);
  assert.match(h, /ISAAC_PM_B9_VEC_BEGIN_OFF = 0x2a404/);
  assert.match(h, /ISAAC_PM_B9_VEC_END_OFF = 0x2a408/);
  assert.match(h, /ISAAC_PM_B9_SIZE_CMP = 0x4e4/);
  assert.match(h, /ISAAC_PM_B9_SLOT_OFF = 0x4e4/);
  assert.match(h, /ISAAC_PM_B9_RECEIVER_OFF = 0x1508/);
  assert.match(h, /ISAAC_PM_B9_HOST_VA_COUNT = 0x007cb6e0/);
  assert.match(h, /ISAAC_PM_B9_HOST_VA_EFFECT = 0x00930220/);
  assert.match(h, /ISAAC_PM_B9_FLAG_NONE = 0x00/);
  assert.match(h, /ISAAC_PM_B9_FLAG_SINGLE = 0x10/);
  assert.match(h, /ISAAC_PM_B9_FLAG_MULTI = 0x20/);
  assert.match(h, /ISAAC_PM_B9_LOOP_SINGLE = 1/);
  assert.match(h, /ISAAC_PM_B9_LOOP_MULTI = 2/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /0x7cb6e0 count resolver HUD v19/);
  assert.match(h, /0x930220 effect-add host event/);
  assert.match(h, /wasm32 compare-flip class/);
  assert.equal((h.match(/ABI_VERSION = 22 \}/g) || []).length, 5);
  /* Model constants agree (B9 mirror). */
  assert.equal(PM.PM_B9_VA_BODY, 0x007daff0);
  assert.equal(PM.PM_B9_VA_RET_ONE, 0x007db086);
  assert.equal(PM.PM_B9_VA_RET_ZERO, 0x007db094);
  assert.equal(PM.PM_B9_BODY_BYTES, 164);
  assert.equal(PM.PM_B9_CALLSITE_COUNT, 1);
  assert.equal(PM.PM_B9_CALLER0_VA, 0x007a50d7);
  assert.equal(PM.PM_B9_E8_COUNT, 2);
  assert.equal(PM.PM_B9_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_B9_STORE_COUNT, 2);
  assert.equal(PM.PM_B9_COUNT_ID, 0x79);
  assert.equal(PM.PM_B9_FLAG_OFF, 0x1eec);
  assert.equal(PM.PM_B9_GAME_GLOBAL_VA, 0x00c7169c);
  assert.equal(PM.PM_B9_VEC_BEGIN_OFF, 0x2a404);
  assert.equal(PM.PM_B9_VEC_END_OFF, 0x2a408);
  assert.equal(PM.PM_B9_SIZE_CMP, 0x4e4);
  assert.equal(PM.PM_B9_SLOT_OFF, 0x4e4);
  assert.equal(PM.PM_B9_RECEIVER_OFF, 0x1508);
  assert.equal(PM.PM_B9_HOST_VA_COUNT, 0x007cb6e0);
  assert.equal(PM.PM_B9_HOST_VA_EFFECT, 0x00930220);
  assert.equal(PM.PM_B9_FLAG_NONE, 0x00);
  assert.equal(PM.PM_B9_FLAG_SINGLE, 0x10);
  assert.equal(PM.PM_B9_FLAG_MULTI, 0x20);
  assert.equal(PM.PM_B9_LOOP_SINGLE, 1);
  assert.equal(PM.PM_B9_LOOP_MULTI, 2);
  /* Raw disasm needles (disasm-007daff0.txt = this unit's body-span
     dump of 0x7daff0..0x7db0a0). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v35-7daff0", "disasm-007daff0.txt"),
    "utf8");
  assert.match(dis, /push\s+0x79/);
  assert.match(dis, /call\s+0x7cb6e0/);
  assert.match(dis, /sub\s+eax, 1/);
  assert.match(dis, /je\s+0x7db018/);
  assert.match(dis, /mov\s+byte ptr \[ebx \+ 0x1eec\], al/);
  assert.match(dis, /mov\s+eax, dword ptr \[0xc7169c\]/);
  assert.match(dis, /mov\s+ecx, dword ptr \[eax \+ 0x2a404\]/);
  assert.match(dis, /mov\s+eax, dword ptr \[eax \+ 0x2a408\]/);
  assert.match(dis, /and\s+eax, 0xfffffffc/);
  assert.match(dis, /cmp\s+eax, 0x4e4/);
  assert.match(dis, /jle\s+0x7db07b/);
  assert.match(dis, /mov\s+eax, dword ptr \[ecx \+ 0x4e4\]/);
  assert.match(dis, /test\s+eax, eax/);
  assert.match(dis, /mov\s+eax, dword ptr \[eax \+ 0x78\]/);
  assert.match(dis, /call\s+0x930220/);
  assert.match(dis, /sub\s+esi, 1/);
  assert.match(dis, /jne\s+0x7db025/);
  assert.match(dis, /mov\s+byte ptr \[ebx \+ 0x1eec\], 0/);
  assert.match(dis, /rets 2/);
  assert.match(dis, /insns 67/);
  assert.match(dis, /E8 2/);
  assert.match(dis, /indirect 0/);
  assert.match(dis, /mem-stores 6/);
  assert.match(dis, /0x007db086: c3\s+ret/);
  assert.match(dis, /0x007db094: c3\s+ret/);
  /* Caller-band evidence: the only caller, thiscall setup, void
     consume (the next instruction pushes args for a 0x930550 host). */
  const caller = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v35-7daff0", "caller-007a50d7.txt"),
    "utf8");
  assert.match(caller, /0x007a50ce:.*mov\s+ecx, ebx/);
  assert.match(caller, /0x007a50d0:.*mov\s+byte ptr \[ebx \+ 0x1fc4\], 0/);
  assert.match(caller, /0x007a50d7:.*call\s+0x7daff0/);
  assert.match(caller, /0x007a50dc: 6aff\s+push\s+-1/);
});

test("v35 B9: scalar laws (flag dispatch / loop iters / SIGNED size gate)", () => {
  /* flag_value: count==0 -> 0x00, count==1 -> 0x10, else -> 0x20. */
  assert.equal(wasm.isaac_pm_7daff0_flag_value(0 | 0), 0x00);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(1 | 0), 0x10);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(2 | 0), 0x20);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(3 | 0), 0x20);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(-1 | 0), 0x20);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(0x7fffffff), 0x20);
  /* Wide drives: never pre-masked (v9 rule): 0x100/0x1ff/0xffffffff
     land in the >= 2 arm. */
  assert.equal(wasm.isaac_pm_7daff0_flag_value(0x100 | 0), 0x20);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(0x1ff | 0), 0x20);
  assert.equal(wasm.isaac_pm_7daff0_flag_value(0xffffffff), 0x20);
  /* loop_iters: count==0 -> 0 (0x7db087 epilogue, no loop rows),
     count==1 -> 1, else -> 2. */
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(0 | 0), 0);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(1 | 0), 1);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(2 | 0), 2);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(3 | 0), 2);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(-1 | 0), 2);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(0x7fffffff), 2);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(0x100 | 0), 2);
  assert.equal(wasm.isaac_pm_7daff0_loop_iters(0xffffffff), 2);
  /* size gate: SIGNED ((end-begin) & ~3) > 0x4e4. */
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x4e8 | 0), 1);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x4e4 | 0), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x4e0 | 0), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x1000, 0x14e8 | 0), 1);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x4e6 | 0), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x4ea | 0), 1);
  /* wasm32 compare-flip discriminators: high-bit sizes are SIGNED
     negative and FAIL the gate (a u32 compare would FLIP them). */
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x80000000), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x80000000, 0x0000), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0xffffffff, 0x0000), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0xffffffff, 0xfffffe00), 0);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x0000, 0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x100 | 0, 0x5e8 | 0) | 0, 1);
  assert.equal(wasm.isaac_pm_7daff0_size_gate(0x1ff | 0, 0x4e7 | 0) | 0, 0);
  /* host_needed = size gate AND slot != 0 (slot full dword). */
  assert.equal(wasm.isaac_pm_7daff0_host_needed(0x1000, 0x2000 | 0, 0x1234), 1);
  assert.equal(wasm.isaac_pm_7daff0_host_needed(0x1000, 0x2000 | 0, 0), 0);
  assert.equal(wasm.isaac_pm_7daff0_host_needed(0x1000, 0x14e4 | 0, 0x1234), 0);
  assert.equal(wasm.isaac_pm_7daff0_host_needed(0x1000, 0x2000 | 0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pm_7daff0_host_needed(0x0000, 0x80000000, 0x1234), 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0x1000, 0x2000, 0x1234], [1, 0x1000, 0x2000, 0x1234],
    [2, 0x1000, 0x2000, 0x1234], [3, 0x1000, 0x14e4, 0x1234],
    [-1, 0x1000, 0x2000, 0], [0xffffffff, 0x1000, 0x2000, 0x1234],
    [0, 0x1000, 0x4e0, 0x1234], [1, 0x1000, 0x4e8, 0],
    [2, 0xffffffff, 0, 0x1234], [1, 0x80000000, 0, 0x1234],
    [0x7fffffff, 0, 0x7fffffff, 0xffffffff], [0x100, 0x100, 0x5e8, 0],
  ];
  for (const [c, b, e, s] of rows) {
    assert.equal(wasm.isaac_pm_7daff0_flag_value(c | 0) | 0,
                 v35B9FlagValuePe(c), `flag ${c}`);
    assert.equal(wasm.isaac_pm_7daff0_flag_value(c | 0) | 0,
                 PM.pm7daff0FlagValue(c), `flag-model ${c}`);
    assert.equal(wasm.isaac_pm_7daff0_loop_iters(c | 0) | 0,
                 v35B9LoopItersPe(c), `iters ${c}`);
    assert.equal(wasm.isaac_pm_7daff0_loop_iters(c | 0) | 0,
                 PM.pm7daff0LoopIters(c), `iters-model ${c}`);
    assert.equal(wasm.isaac_pm_7daff0_size_gate(b >>> 0, e >>> 0) | 0,
                 v35B9SizeGatePe(b, e), `size ${b}/${e}`);
    assert.equal(wasm.isaac_pm_7daff0_size_gate(b >>> 0, e >>> 0) | 0,
                 PM.pm7daff0SizeGate(b, e), `size-model ${b}/${e}`);
    assert.equal(wasm.isaac_pm_7daff0_host_needed(b >>> 0, e >>> 0, s >>> 0) | 0,
                 v35B9HostNeededPe(b, e, s), `host ${b}/${e}/${s}`);
    assert.equal(wasm.isaac_pm_7daff0_host_needed(b >>> 0, e >>> 0, s >>> 0) | 0,
                 PM.pm7daff0HostNeeded(b, e, s), `host-model ${b}/${e}/${s}`);
  }
});

test("v35 B9: deterministic randomized differential corpus", () => {
  let seed = 0x007daff0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const c = rnd();
    const b = rnd();
    const e = rnd();
    const s = rnd();
    assert.equal(wasm.isaac_pm_7daff0_flag_value(c | 0) | 0,
                 v35B9FlagValuePe(c), `trial ${trial} flag-pe`);
    assert.equal(wasm.isaac_pm_7daff0_flag_value(c | 0) | 0,
                 PM.pm7daff0FlagValue(c), `trial ${trial} flag-model`);
    assert.equal(wasm.isaac_pm_7daff0_loop_iters(c | 0) | 0,
                 v35B9LoopItersPe(c), `trial ${trial} iters-pe`);
    assert.equal(wasm.isaac_pm_7daff0_loop_iters(c | 0) | 0,
                 PM.pm7daff0LoopIters(c), `trial ${trial} iters-model`);
    assert.equal(wasm.isaac_pm_7daff0_size_gate(b >>> 0, e >>> 0) | 0,
                 v35B9SizeGatePe(b, e), `trial ${trial} size-pe`);
    assert.equal(wasm.isaac_pm_7daff0_size_gate(b >>> 0, e >>> 0) | 0,
                 PM.pm7daff0SizeGate(b, e), `trial ${trial} size-model`);
    assert.equal(wasm.isaac_pm_7daff0_host_needed(b >>> 0, e >>> 0, s >>> 0) | 0,
                 v35B9HostNeededPe(b, e, s), `trial ${trial} host-pe`);
    assert.equal(wasm.isaac_pm_7daff0_host_needed(b >>> 0, e >>> 0, s >>> 0) | 0,
                 PM.pm7daff0HostNeeded(b, e, s), `trial ${trial} host-model`);
    /* coherence: host == size gate && slot != 0. */
    assert.equal(wasm.isaac_pm_7daff0_host_needed(b >>> 0, e >>> 0, s >>> 0) | 0,
                 (wasm.isaac_pm_7daff0_size_gate(b >>> 0, e >>> 0) !== 0 &&
                  s !== 0) ? 1 : 0, `trial ${trial} host==gate&&slot`);
    /* coherence: flag byte and loop iters share the count dispatch. */
    const iters = v35B9LoopItersPe(c);
    assert.equal(wasm.isaac_pm_7daff0_flag_value(c | 0) | 0,
                 iters === 0 ? 0x00 : iters === 1 ? 0x10 : 0x20,
                 `trial ${trial} flag==dispatch`);
    cases += 9;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7daff0_flag_value(w | 0) | 0,
                 v35B9FlagValuePe(w), `wide flag ${w}`);
    assert.equal(wasm.isaac_pm_7daff0_loop_iters(w | 0) | 0,
                 v35B9LoopItersPe(w), `wide iters ${w}`);
    assert.equal(wasm.isaac_pm_7daff0_size_gate(w >>> 0, (w + 0x4e8) >>> 0) | 0,
                 v35B9SizeGatePe(w, (w + 0x4e8) >>> 0), `wide size ${w}`);
    assert.equal(wasm.isaac_pm_7daff0_host_needed(w >>> 0, (w + 0x4e8) >>> 0,
                                                  w >>> 0) | 0,
                 v35B9HostNeededPe(w, (w + 0x4e8) >>> 0, w), `wide host ${w}`);
    cases += 4;
  }
  assert.ok(cases >= 4500 + 20, `expected >= 4520 cases, got ${cases}`);
});
/* ====================================================================== */
/* v37 — FB: VA 0x009bf930 PlayerManager::FirstBirthrightOwner            */
/* owner-walk (NARROWED — the 0x7706e0 HasCollectible probe stays host;   */
/* the returned player pointer stays host data). EXACT ZHL 14 B           */
/* (PlayerManager.zhl). thiscall, ret 4 (ONE stack arg = type),           */
/* Entity_Player* in eax (NULL or first winner). 40 insns, 2 rets         */
/* (0x9bf978 ZERO / 0x9bf983 FOUND), 1 E8 (0x7706e0 — HUD-family          */
/* HasCollectible-shaped host sample), 0 indirect, 0 stores. int3 pad     */
/* 0x9bf986..0x9bf98f; next function 0x009bf990 (IsCoopPlay, family-      */
/* pinned, do-not-reopen). 8 direct rel32 callers. Laws: walk bounds      */
/* (signed span + 4 stride, TD/BW discipline), per-slot eligibility       */
/* (state==0 && char==type FULL-DWORD), the probe gate (test al,al —      */
/* the ONLY byte gate, & 0xff), first-match scan OR, whole-body           */
/* owner_found. ========================================================== */

function v37FbWalkTerminatesPe(begin, end) {
  /* 0x009bf93e cmp esi,[ebx+4] — walk while esi != end (esi += 4 at
     0x9bf968). Wrapped span (end < begin) or non-multiple-of-4
     span: no finite walk (TD/BW discipline). */
  const span = (end - begin) | 0;
  if (span < 0) return 0;
  return span % 4 === 0 ? 1 : 0;
}

function v37FbWalkStepsPe(begin, end) {
  if (v37FbWalkTerminatesPe(begin, end) === 0) return -1;
  return ((end - begin) | 0) / 4;
}

function v37FbSlotEligiblePe(state2c, char13c0, type) {
  /* 0x009bf945 cmp dword [edi+0x2c],0 ; jne next ; 0x009bf94e cmp
     dword [edi+0x13c0],eax ; jne next — FULL-DWORD equality. */
  return ((state2c >>> 0) === 0 && (char13c0 | 0) === (type | 0)) ? 1 : 0;
}

function v37FbProbeMatchPe(has26b) {
  /* 0x009bf964 test al,al ; jne FOUND — low byte only. */
  return (has26b & 0xff) !== 0 ? 1 : 0;
}

function v37FbScanFoundPe(states, chars, has, type, count) {
  /* PE loop 0x009bf943..0x009bf966: first-match OR of
     (eligible && probe); the probe sample of an ineligible slot is
     never consulted. count <= 0 -> -1 (host contract). */
  if (count <= 0) return -1;
  const n = Math.min(states.length, chars.length, has.length, count);
  for (let i = 0; i < n; i += 1) {
    if (v37FbSlotEligiblePe(states[i], chars[i], type) === 0) continue;
    if (v37FbProbeMatchPe(has[i]) === 1) return 1;
  }
  return 0;
}

function v37FbOwnerFoundPe(begin, end, states, chars, has, type, count) {
  /* Whole-body: begin==end (steps 0, je ZERO — no probe runs) or
     non-terminating span (steps -1) -> 0; else the scan OR decides
     over min(count, steps) sampled slots. */
  const steps = v37FbWalkStepsPe(begin, end);
  if (steps < 0 || steps === 0) return 0;
  const n = count < steps ? count : steps;
  return v37FbScanFoundPe(states, chars, has, type, n) === 1 ? 1 : 0;
}

test("v37 FB: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v37 FB island needles. */
  assert.match(h, /v37 — FB/);
  assert.match(h, /ISAAC_PM_FB_VA_BODY = 0x009bf930/);
  assert.match(h, /ISAAC_PM_FB_VA_RET_NULL = 0x009bf978/);
  assert.match(h, /ISAAC_PM_FB_VA_RET_FOUND = 0x009bf983/);
  assert.match(h, /ISAAC_PM_FB_BODY_BYTES = 83/);
  assert.match(h, /ISAAC_PM_FB_CALLSITE_COUNT = 8/);
  for (const va of [
    "0x0065cfe6", "0x006e0cec", "0x007304cf", "0x0073bd82",
    "0x007d65ce", "0x007d6604", "0x007d8eb2", "0x009a48e1",
  ]) {
    assert.match(h, new RegExp(`ISAAC_PM_FB_CALLER\\d_VA = ${va}`));
  }
  assert.equal((h.match(/ISAAC_PM_FB_CALLER\d_VA = /g) || []).length, 8);
  assert.match(h, /ISAAC_PM_FB_E8_COUNT = 1/);
  assert.match(h, /ISAAC_PM_FB_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_FB_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_FB_LIST_ELEM_STRIDE = 4/);
  assert.match(h, /ISAAC_PM_FB_LIST_HOLDER_OFF = 0x1baa8/);
  assert.match(h, /ISAAC_PM_FB_STATE_OFF = 0x2c/);
  assert.match(h, /ISAAC_PM_FB_CHAR_OFF = 0x13c0/);
  assert.match(h, /ISAAC_PM_FB_PROBE_VA = 0x007706e0/);
  assert.match(h, /ISAAC_PM_FB_PROBE_ID = 0x26b/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /wasm32 compare-flip class/);
  assert.match(h, /FirstBirthrightOwner\(unsigned int type\)/);
  assert.match(h, /0x7706e0/);
  /* Model constants agree (FB mirror). */
  assert.equal(PM.PM_FB_VA_BODY, 0x009bf930);
  assert.equal(PM.PM_FB_VA_RET_NULL, 0x009bf978);
  assert.equal(PM.PM_FB_VA_RET_FOUND, 0x009bf983);
  assert.equal(PM.PM_FB_BODY_BYTES, 83);
  assert.equal(PM.PM_FB_CALLSITE_COUNT, 8);
  assert.equal(PM.PM_FB_CALLER0_VA, 0x0065cfe6);
  assert.equal(PM.PM_FB_CALLER1_VA, 0x006e0cec);
  assert.equal(PM.PM_FB_CALLER2_VA, 0x007304cf);
  assert.equal(PM.PM_FB_CALLER3_VA, 0x0073bd82);
  assert.equal(PM.PM_FB_CALLER4_VA, 0x007d65ce);
  assert.equal(PM.PM_FB_CALLER5_VA, 0x007d6604);
  assert.equal(PM.PM_FB_CALLER6_VA, 0x007d8eb2);
  assert.equal(PM.PM_FB_CALLER7_VA, 0x009a48e1);
  assert.equal(PM.PM_FB_E8_COUNT, 1);
  assert.equal(PM.PM_FB_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_FB_STORE_COUNT, 0);
  assert.equal(PM.PM_FB_LIST_BEGIN_OFF, 0x00);
  assert.equal(PM.PM_FB_LIST_END_OFF, 0x04);
  assert.equal(PM.PM_FB_LIST_ELEM_STRIDE, 4);
  assert.equal(PM.PM_FB_LIST_HOLDER_OFF, 0x1baa8);
  assert.equal(PM.PM_FB_STATE_OFF, 0x2c);
  assert.equal(PM.PM_FB_CHAR_OFF, 0x13c0);
  assert.equal(PM.PM_FB_PROBE_VA, 0x007706e0);
  assert.equal(PM.PM_FB_PROBE_ID, 0x26b);
  /* Raw disasm needles (disasm-009bf930.txt = this unit's body dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v37-9bf930", "disasm-009bf930.txt"),
    "utf8");
  assert.match(dis, /0x009bf93c: 8b33\s+mov\s+esi, dword ptr \[ebx\]/);
  assert.match(dis, /0x009bf93e: 3b7304\s+cmp\s+esi, dword ptr \[ebx \+ 4\]/);
  assert.match(dis, /0x009bf95f:.*call\s+0x7706e0/);
  assert.match(dis, /0x009bf964: 84c0\s+test\s+al, al/);
  assert.match(dis, /0x009bf978: c20400\s+ret\s+4/);
  assert.match(dis, /0x009bf983: c20400\s+ret\s+4/);
  /* Census caller evidence (caller-009a48e1.txt — g_Game+0x1baa8
     receiver + push 0x19 + test eax,eax consume). */
  const caller = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v37-9bf930", "caller-009a48e1.txt"),
    "utf8");
  assert.match(caller, /0x009a48e1:.*call\s+0x9bf930/);
  assert.match(caller, /0x009a48e6: 85c0\s+test\s+eax, eax/);
});

test("v37 FB: scalar laws (walk bounds / slot gates / probe byte gate)", () => {
  /* walk_terminates: signed span sanity + 4-stride (TD/BW
     discipline). */
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0000), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0004), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0008), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x1000, 0x2000), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0001), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0002), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x0006), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0004, 0x0000), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x0000, 0x80000000), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0x80000000, 0x0000), 0);
  /* u32-wrap convergence: (4 - 0xfffffff8) wraps to 12 — a finite
     3-step walk in the PE (esi 0xfffffff8 -> 0xfffffffc -> 0 -> 4). */
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0xfffffff8, 0x00000004), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0xfffffff8, 0x00000004), 3);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0xfffffffc, 0x00000000), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0xfffffff9, 0x00000004), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_terminates(0xfffffffa, 0x00000000), 0);
  /* walk_steps. */
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0000, 0x0000), 0);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0000, 0x0004), 1);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0000, 0x0010), 4);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x1000, 0x1014), 5);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0000, 0x0001), -1);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0004, 0x0000), -1);
  assert.equal(wasm.isaac_pm_9bf930_walk_steps(0x0000, 0x80000000), -1);
  /* slot_eligible: FULL-DWORD equality, zero masking. */
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0x27 | 0, 0x27 | 0), 1);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0x27 | 0, 0x26 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(1, 0x27 | 0, 0x27 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(-1, 0x27 | 0, 0x27 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0x100 | 0, 0x27 | 0, 0x27 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0x127 | 0, 0x27 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0x27 | 0, 0x127 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0x27 | 0, 0xffffffff), 0);
  assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, 0xffffffff, 0xffffffff), 1);
  /* probe_match: test al,al — low byte only (the body's ONLY byte
     gate; v9: never pre-mask the wasm arg). */
  assert.equal(wasm.isaac_pm_9bf930_probe_match(0), 0);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(1), 1);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(0xff), 1);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(0x100 | 0), 0);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(0x1ff | 0), 1);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(0x80000000), 0);
  assert.equal(wasm.isaac_pm_9bf930_probe_match(-1), 1);
  /* scan_found + owner_found through wasm memory arrays. */
  const view = new DataView(wasm.memory.buffer);
  const statesPtr = SCRATCH + 0x6000;
  const charsPtr = SCRATCH + 0x7000;
  const hasPtr = SCRATCH + 0x8000;
  const put = (ptr, vals) => {
    vals.forEach((v, i) => writeU32(view, ptr + i * 4, v));
  };
  /* winners: slot 0 eligible+probe -> found at index 0 (early exit). */
  put(statesPtr, [0, 0, 0]);
  put(charsPtr, [0x27, 0x26, 0x27]);
  put(hasPtr, [1, 1, 0]);
  assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 1);
  assert.equal(wasm.isaac_pm_9bf930_owner_found(0x0000, 0x000c, statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 1);
  /* winner only at the last slot. */
  put(statesPtr, [1, 0, 0]);
  put(charsPtr, [0x27, 0x27, 0x27]);
  put(hasPtr, [0, 0, 1]);
  assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 1);
  /* eligible but probe never true -> 0. */
  put(statesPtr, [0, 0, 0]);
  put(charsPtr, [0x27, 0x27, 0x27]);
  put(hasPtr, [0, 0x100 | 0, 0]);
  assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 0);
  assert.equal(wasm.isaac_pm_9bf930_owner_found(0x0000, 0x000c, statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 0);
  /* gate miss: char mismatch (high bits never match). */
  put(statesPtr, [0, 0, 0]);
  put(charsPtr, [0x127 | 0, 0x27, 0x27]);
  put(hasPtr, [1, 1, 1]);
  assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 1);
  /* empty list: count 0 -> -1 contract; owner_found with begin==end -> 0. */
  assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 0) | 0, -1);
  assert.equal(wasm.isaac_pm_9bf930_scan_found(0, 0, 0, 0x27 | 0, 3) | 0, -1);
  assert.equal(wasm.isaac_pm_9bf930_owner_found(0x0000, 0x0000, statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 0);
  /* non-terminating span -> 0 even with a winner in the arrays. */
  assert.equal(wasm.isaac_pm_9bf930_owner_found(0x0004, 0x0000, statesPtr, charsPtr, hasPtr, 0x27 | 0, 3) | 0, 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0x1000, 0x1000, 0x27, 0x27, 0],
    [0x1000, 0x1004, 0x27, 0x27, 1],
    [0x1000, 0x1008, 0x26, 0x27, 0],
    [0x1000, 0x1008, 0x27, 0x27, 0],
    [0x1000, 0x1008, 0x27, 0x27, 1],
    [0x1000, 0x1008, 0x27, 0x26, 1],
    [0x1000, 0x100c, 0x27, 0x27, 0xff],
    [0x1000, 0x100c, 0x27, 0x27, 0x100 | 0],
    [0x1004, 0x1000, 0x27, 0x27, 1],
    [0x1000, 0x1001, 0x27, 0x27, 1],
    [0x0000, 0x80000000, 0x27, 0x27, 1],
  ];
  for (const [b, e, st, ch, hh] of rows) {
    const states = [st >>> 0];
    const chars = [ch | 0];
    const has = [hh >>> 0];
    put(statesPtr, states);
    put(charsPtr, chars);
    put(hasPtr, has);
    assert.equal(wasm.isaac_pm_9bf930_walk_terminates(b >>> 0, e >>> 0) | 0,
                 v37FbWalkTerminatesPe(b, e), `term ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_walk_terminates(b >>> 0, e >>> 0) | 0,
                 PM.pm9bf930WalkTerminates(b, e), `term-model ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_walk_steps(b >>> 0, e >>> 0) | 0,
                 v37FbWalkStepsPe(b, e), `steps ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_walk_steps(b >>> 0, e >>> 0) | 0,
                 PM.pm9bf930WalkSteps(b, e), `steps-model ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_slot_eligible(st >>> 0, ch | 0, 0x27 | 0) | 0,
                 v37FbSlotEligiblePe(st, ch, 0x27), `elig ${st}/${ch}`);
    assert.equal(wasm.isaac_pm_9bf930_slot_eligible(st >>> 0, ch | 0, 0x27 | 0) | 0,
                 PM.pm9bf930SlotEligible(st, ch, 0x27), `elig-model ${st}/${ch}`);
    assert.equal(wasm.isaac_pm_9bf930_probe_match(hh >>> 0) | 0,
                 v37FbProbeMatchPe(hh), `probe ${hh}`);
    assert.equal(wasm.isaac_pm_9bf930_probe_match(hh >>> 0) | 0,
                 PM.pm9bf930ProbeMatch(hh), `probe-model ${hh}`);
    assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 1) | 0,
                 v37FbScanFoundPe(states, chars, has, 0x27, 1), `scan ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, 0x27 | 0, 1) | 0,
                 PM.pm9bf930ScanFound(states, chars, has, 0x27, 1), `scan-model ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_owner_found(b >>> 0, e >>> 0, statesPtr, charsPtr, hasPtr, 0x27 | 0, 1) | 0,
                 v37FbOwnerFoundPe(b, e, states, chars, has, 0x27, 1), `owner ${b}/${e}`);
    assert.equal(wasm.isaac_pm_9bf930_owner_found(b >>> 0, e >>> 0, statesPtr, charsPtr, hasPtr, 0x27 | 0, 1) | 0,
                 PM.pm9bf930OwnerFound(b, e, states, chars, has, 0x27, 1), `owner-model ${b}/${e}`);
  }
});

test("v37 FB: deterministic randomized differential corpus", () => {
  let seed = 0x009bf930 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const view = new DataView(wasm.memory.buffer);
  const statesPtr = SCRATCH + 0x6000;
  const charsPtr = SCRATCH + 0x7000;
  const hasPtr = SCRATCH + 0x8000;
  const put = (ptr, vals) => {
    vals.forEach((v, i) => writeU32(view, ptr + i * 4, v));
  };
  const pick = (n) => Math.floor((rnd() / 4294967296) * n);
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const n = pick(5);                       /* 0..4 slots */
    const type = pick(4) - 1;                /* wide incl. -1 */
    const b = rnd();
    const e = rnd();
    const states = [];
    const chars = [];
    const has = [];
    for (let i = 0; i < n; i++) {
      states.push(rnd() & ~0);               /* any 32-bit state */
      /* char: mostly near the type, sometimes wide. */
      chars.push((rnd() % 4 === 0) ? (rnd() | 0) : (type | 0));
      has.push(rnd() ^ (rnd() & 0xff));      /* arbitrary probe byte */
    }
    put(statesPtr, states);
    put(charsPtr, chars);
    put(hasPtr, has);
    assert.equal(wasm.isaac_pm_9bf930_walk_terminates(b >>> 0, e >>> 0) | 0,
                 v37FbWalkTerminatesPe(b, e), `trial ${trial} term-pe`);
    assert.equal(wasm.isaac_pm_9bf930_walk_terminates(b >>> 0, e >>> 0) | 0,
                 PM.pm9bf930WalkTerminates(b, e), `trial ${trial} term-model`);
    assert.equal(wasm.isaac_pm_9bf930_walk_steps(b >>> 0, e >>> 0) | 0,
                 v37FbWalkStepsPe(b, e), `trial ${trial} steps-pe`);
    assert.equal(wasm.isaac_pm_9bf930_walk_steps(b >>> 0, e >>> 0) | 0,
                 PM.pm9bf930WalkSteps(b, e), `trial ${trial} steps-model`);
    assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 v37FbScanFoundPe(states, chars, has, type, n), `trial ${trial} scan-pe`);
    assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 PM.pm9bf930ScanFound(states, chars, has, type, n), `trial ${trial} scan-model`);
    assert.equal(wasm.isaac_pm_9bf930_owner_found(b >>> 0, e >>> 0, statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 v37FbOwnerFoundPe(b, e, states, chars, has, type, n), `trial ${trial} owner-pe`);
    assert.equal(wasm.isaac_pm_9bf930_owner_found(b >>> 0, e >>> 0, statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 PM.pm9bf930OwnerFound(b, e, states, chars, has, type, n), `trial ${trial} owner-model`);
    /* coherence: owner == term && scan. */
    assert.equal(wasm.isaac_pm_9bf930_owner_found(b >>> 0, e >>> 0, statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 (v37FbWalkTerminatesPe(b, e) !== 0 &&
                  v37FbScanFoundPe(states, chars, has, type, n) === 1) ? 1 : 0,
                 `trial ${trial} owner==term&&scan`);
    /* coherence: probe drives the scan decision for eligible slots. */
    const anyEligProbe = states.some((s, i) =>
      v37FbSlotEligiblePe(s, chars[i], type) !== 0 &&
      v37FbProbeMatchPe(has[i]) !== 0);
    assert.equal(wasm.isaac_pm_9bf930_scan_found(statesPtr, charsPtr, hasPtr, type | 0, n) | 0,
                 n <= 0 ? -1 : (anyEligProbe ? 1 : 0),
                 `trial ${trial} scan==anyEligProbe`);
    cases += 9;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, w | 0, w | 0) | 0, 1, `wide elig ${w}`);
    assert.equal(wasm.isaac_pm_9bf930_slot_eligible(0, w | 0, 0x27 | 0) | 0, 0, `wide elig-miss ${w}`);
    assert.equal(wasm.isaac_pm_9bf930_probe_match(w >>> 0) | 0,
                 v37FbProbeMatchPe(w), `wide probe ${w}`);
    assert.equal(wasm.isaac_pm_9bf930_walk_terminates(w >>> 0, (w + 8) >>> 0) | 0,
                 v37FbWalkTerminatesPe(w, (w + 8) >>> 0), `wide term ${w}`);
    assert.equal(wasm.isaac_pm_9bf930_walk_steps(w >>> 0, (w + 8) >>> 0) | 0,
                 v37FbWalkStepsPe(w, (w + 8) >>> 0), `wide steps ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 4500 + 25, `expected >= 4525 cases, got ${cases}`);
});
/* ====================================================================== */
/* v38 — B18: VA 0x007db8d0 mode-dispatch resolver (NARROWED — the mode-  */
/* scan chain 0x7db860 -> 0x4288a0 and the Game-Start-Seed fatal 0xa112c0 */
/* stay host; g_Game [0xc71678] / count [Game+0x1bb88] host samples).     */
/* thiscall, ret plain, int32 value consumed FULL-DWORD (14 direct rel32  */
/* callers). 152 insns, 13 E8 (1 real edge + 7 cookie checks + 2 fatals   */
/* + 3 in the next function), 1 indirect (jump table 0x7dba10), 2 stack-  */
/* local stores (0 observable). Laws: UNSIGNED fast gate (mode <= 7u),    */
/* the 8-entry jump table {-1,-1,0,1,2,3,4,5}, the slow-path fatal        */
/* decision (count == 0), the full xor-shift hash (TRUE constants         */
/* 2/15/17 at [0xb1f57c..0xb1f584]; v = max(1, count+mode) unsigned       */
/* cmova; (w&3)+2), the whole-body value composition (fast path NEVER     */
/* reads the count), and the composed host_needed. ZERO byte gates, zero  */
/* uint8_t. ============================================================== */

function v38B18FastGatePe(mode) {
  /* 0x007db8e9 cmp esi,7 ; 0x007db8ec ja slow — UNSIGNED mode <= 7u. */
  return (mode >>> 0) <= 7 ? 1 : 0;
}

function v38B18FastValuePe(mode) {
  /* 0x007db8f2 jmp [esi*4 + 0x7dba10] — {-1,-1,0,1,2,3,4,5} (0 and 1
     both -> -1). Totalized 0 outside the fast domain. */
  const m = mode >>> 0;
  if (m > 7) return 0;
  return m === 0 || m === 1 ? -1 : m - 2;
}

function v38B18SlowFatalPe(count) {
  /* 0x007db993 test eax,eax ; jne skip — FULL-DWORD zero test. */
  return (count >>> 0) === 0 ? 1 : 0;
}

function v38B18SlowHashPe(count, mode) {
  /* 0x007db9b4 add eax,esi (32-bit wrap) ; cmp eax,1 ; cmova esi,eax ;
     shr/shl/xor chain with c1=2 c2=15 c3=17 (x86 masks to 5 bits);
     (w&3)+2. */
  const sum = ((count >>> 0) + (mode >>> 0)) >>> 0;
  const v = sum > 1 ? sum : 1;
  const t = (v >>> 2) ^ v;
  const u = (((t << 15) >>> 0) ^ t) >>> 0;
  const w = (u >>> 17) ^ u;
  return (w & 3) + 2;
}

function v38B18ValuePe(mode, count) {
  return v38B18FastGatePe(mode) === 1
    ? v38B18FastValuePe(mode)
    : v38B18SlowHashPe(count, mode);
}

function v38B18HostNeededPe(mode, count) {
  return (mode >>> 0) > 7 && (count >>> 0) === 0 ? 1 : 0;
}

test("v38 B18: build + ABI pin + census", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  /* v38 B18 island needles. */
  assert.match(h, /v38 — B18/);
  assert.match(h, /ISAAC_PM_B18_VA_BODY = 0x007db8d0/);
  assert.match(h, /ISAAC_PM_B18_VA_RET_FIRST = 0x007db90b/);
  assert.match(h, /ISAAC_PM_B18_VA_RET_LAST = 0x007dba0e/);
  assert.match(h, /ISAAC_PM_B18_BODY_BYTES = 318/);
  assert.match(h, /ISAAC_PM_B18_CALLSITE_COUNT = 14/);
  assert.match(h, /ISAAC_PM_B18_CALLER13_VA = 0x00a0cfd6/);
  assert.match(h, /ISAAC_PM_B18_E8_COUNT = 13/);
  assert.match(h, /ISAAC_PM_B18_INDIRECT_COUNT = 1/);
  assert.match(h, /ISAAC_PM_B18_STORE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B18_FAST_MAX = 7/);
  assert.match(h, /ISAAC_PM_B18_JUMP_TABLE_VA = 0x007dba10/);
  assert.match(h, /ISAAC_PM_B18_MODE_SCAN_VA = 0x007db860/);
  assert.match(h, /ISAAC_PM_B18_FATAL_VA = 0x00a112c0/);
  assert.match(h, /ISAAC_PM_B18_GAME_GLOBAL_VA = 0x00c71678/);
  assert.match(h, /ISAAC_PM_B18_COUNT_OFF = 0x1bb88/);
  assert.match(h, /ISAAC_PM_B18_HASH_C1 = 2/);
  assert.match(h, /ISAAC_PM_B18_HASH_C2 = 15/);
  assert.match(h, /ISAAC_PM_B18_HASH_C3 = 17/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /Game-Start-Seed fatal/);
  assert.match(h, /0x7db860 -> 0x4288a0/);
  assert.match(h, /UNSIGNED/);
  assert.equal((h.match(/ABI_VERSION = 22 \}/g) || []).length, 5);
  /* Model constants agree (B18 mirror). */
  assert.equal(PM.PM_B18_VA_BODY, 0x007db8d0);
  assert.equal(PM.PM_B18_VA_RET_FIRST, 0x007db90b);
  assert.equal(PM.PM_B18_VA_RET_LAST, 0x007dba0e);
  assert.equal(PM.PM_B18_BODY_BYTES, 318);
  assert.equal(PM.PM_B18_CALLSITE_COUNT, 14);
  assert.equal(PM.PM_B18_CALLER13_VA, 0x00a0cfd6);
  assert.equal(PM.PM_B18_E8_COUNT, 13);
  assert.equal(PM.PM_B18_INDIRECT_COUNT, 1);
  assert.equal(PM.PM_B18_STORE_COUNT, 2);
  assert.equal(PM.PM_B18_FAST_MAX, 7);
  assert.deepEqual(PM.PM_B18_TABLE, [-1, -1, 0, 1, 2, 3, 4, 5]);
  assert.equal(PM.PM_B18_JUMP_TABLE_VA, 0x007dba10);
  assert.equal(PM.PM_B18_MODE_SCAN_VA, 0x007db860);
  assert.equal(PM.PM_B18_FATAL_VA, 0x00a112c0);
  assert.equal(PM.PM_B18_GAME_GLOBAL_VA, 0x00c71678);
  assert.equal(PM.PM_B18_COUNT_OFF, 0x1bb88);
  assert.equal(PM.PM_B18_HASH_C1, 2);
  assert.equal(PM.PM_B18_HASH_C2, 15);
  assert.equal(PM.PM_B18_HASH_C3, 17);
  /* Raw disasm needles (disasm-007db8d0.txt = this unit's body-span
     dump of 0x7db8d0..0x7dba10). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v36-7db8d0", "disasm-007db8d0.txt"),
    "utf8");
  assert.match(dis, /call\s+0x7db860/);
  assert.match(dis, /cmp\s+esi, 7/);
  assert.match(dis, /ja\s+0x7db987/);
  assert.match(dis, /jmp\s+dword ptr \[esi\*4 \+ 0x7dba10\]/);
  assert.match(dis, /or\s+eax, 0xffffffff/);
  assert.match(dis, /movq\s+xmm0, qword ptr \[0xb1f57c\]/);
  assert.match(dis, /cmova\s+esi, eax/);
  assert.match(dis, /shr\s+eax, cl/);
  assert.match(dis, /call\s+0xa112c0/);
  assert.match(dis, /push\s+0xb1c640/);
  assert.match(dis, /push\s+0xb6bf54/);
  /* Caller census: the 14 direct rel32 callers (evidence files). */
  for (const [va, needle] of [
    ["00764dce", /0x00764dce:.*call\s+0x7db8d0/],
    ["007c2a34", /0x007c2a34:.*call\s+0x7db8d0/],
    ["00a0a8de", /0x00a0a8de:.*call\s+0x7db8d0/],
  ]) {
    const caller = readFileSync(
      join(root, "output", "decomp", "5129df723e64", "section-notes",
           "pm-v36-7db8d0", `caller-${va}.txt`),
      "utf8");
    assert.match(caller, needle, `caller ${va}`);
  }
  /* The mode-scan callee evidence (host chain, do-not-reopen). */
  const scan = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v36-7db8d0", "disasm-007db860.txt"),
    "utf8");
  assert.match(scan, /call\s+0x4288a0/);
  assert.match(scan, /movzx\s+eax, byte ptr \[ecx \+ 0x8f\]/);
});

test("v38 B18: scalar laws (UNSIGNED fast gate / jump table / fatal / hash)", () => {
  /* fast_gate: UNSIGNED mode <= 7 (ja — 0x80000000 is SLOW, not fast). */
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0), 1);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(7), 1);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(8), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0x7f), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0x100), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0x7fffffff), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_gate(0xffffffff), 0);
  /* fast_value: the 8-entry jump table; 0 AND 1 both -> -1. */
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(0), -1);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(1), -1);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(2), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(3), 1);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(4), 2);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(5), 3);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(6), 4);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(7), 5);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(8), 0);
  assert.equal(wasm.isaac_pm_7db8d0_fast_value(0x80000000), 0);
  /* slow_fatal: FULL-DWORD count == 0 (0x80000000 NOT fatal). */
  assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(0), 1);
  assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(1), 0);
  assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(0x100), 0);
  assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(0xffffffff), 0);
  /* slow_hash: v = max(1, count+mode) unsigned; xor-shift 2/15/17;
     (w & 3) + 2. Pinned values computed by the PE oracle. */
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(0, 8), v38B18SlowHashPe(0, 8));
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(2, 8), 4);   /* v=10 */
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(0xfffffff8, 8), 3); /* v=1 */
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(0xfffffff9, 8), 3); /* v=1 */
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(0xffffffff, 0xffffffff), 3);
  assert.equal(wasm.isaac_pm_7db8d0_slow_hash(0x80000000, 0x80000000), 3);
  for (const [c, m] of [[0, 8], [1, 8], [2, 8], [7, 9], [0x7f, 8],
                        [0x100, 0x200], [0x7fffffff, 8], [0xffffffff, 8],
                        [0x12345678, 0x9abcdef0]]) {
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(c >>> 0, m >>> 0) | 0,
                 v38B18SlowHashPe(c, m), `hash ${c}/${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(c >>> 0, m >>> 0) | 0,
                 PM.pm7db8d0SlowHash(c, m), `hash-model ${c}/${m}`);
  }
  /* value: fast path NEVER reads the count (count 0 vs 0xffffffff
     identical on fast modes); slow folds the count sample. */
  assert.equal(wasm.isaac_pm_7db8d0_value(0, 0xffffffff), -1);
  assert.equal(wasm.isaac_pm_7db8d0_value(1, 0), -1);
  assert.equal(wasm.isaac_pm_7db8d0_value(2, 0xffffffff), 0);
  assert.equal(wasm.isaac_pm_7db8d0_value(7, 0), 5);
  assert.equal(wasm.isaac_pm_7db8d0_value(8, 2), 4);
  assert.equal(wasm.isaac_pm_7db8d0_value(0x80000000, 5), v38B18SlowHashPe(5, 0x80000000));
  /* host_needed: slow && count == 0. */
  assert.equal(wasm.isaac_pm_7db8d0_host_needed(8, 0), 1);
  assert.equal(wasm.isaac_pm_7db8d0_host_needed(8, 1), 0);
  assert.equal(wasm.isaac_pm_7db8d0_host_needed(0, 0), 0);
  assert.equal(wasm.isaac_pm_7db8d0_host_needed(0x80000000, 0), 1);
  assert.equal(wasm.isaac_pm_7db8d0_host_needed(0xffffffff, 0xffffffff), 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0], [0, 1], [1, 0], [1, 0xffffffff], [2, 0], [3, 0x100],
    [4, 5], [5, 0x80000000], [6, 0xffffffff], [7, 0x7fffffff],
    [8, 0], [8, 1], [8, 2], [9, 0], [0x7f, 0], [0x100, 0x100],
    [0x7fffffff, 0xffffffff], [0x80000000, 0], [0xffffffff, 0],
    [0xfffffff8, 8], [0xfffffff9, 8],
  ];
  for (const [m, c] of rows) {
    assert.equal(wasm.isaac_pm_7db8d0_fast_gate(m >>> 0) | 0,
                 v38B18FastGatePe(m), `gate ${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_gate(m >>> 0) | 0,
                 PM.pm7db8d0FastGate(m), `gate-model ${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_value(m >>> 0) | 0,
                 v38B18FastValuePe(m), `value ${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_value(m >>> 0) | 0,
                 PM.pm7db8d0FastValue(m), `value-model ${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(c >>> 0) | 0,
                 v38B18SlowFatalPe(c), `fatal ${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(c >>> 0) | 0,
                 PM.pm7db8d0SlowFatal(c), `fatal-model ${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(c >>> 0, m >>> 0) | 0,
                 v38B18SlowHashPe(c, m), `hash ${c}/${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(c >>> 0, m >>> 0) | 0,
                 PM.pm7db8d0SlowHash(c, m), `hash-model ${c}/${m}`);
    assert.equal(wasm.isaac_pm_7db8d0_value(m >>> 0, c >>> 0) | 0,
                 v38B18ValuePe(m, c), `value ${m}/${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_value(m >>> 0, c >>> 0) | 0,
                 PM.pm7db8d0Value(m, c), `value-model ${m}/${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_host_needed(m >>> 0, c >>> 0) | 0,
                 v38B18HostNeededPe(m, c), `host ${m}/${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_host_needed(m >>> 0, c >>> 0) | 0,
                 PM.pm7db8d0HostNeeded(m, c), `host-model ${m}/${c}`);
    assert.equal(wasm.isaac_pm_7db8d0_value(m >>> 0, c >>> 0) | 0,
                 wasm.isaac_pm_7db8d0_fast_gate(m >>> 0) !== 0
                   ? wasm.isaac_pm_7db8d0_fast_value(m >>> 0)
                   : wasm.isaac_pm_7db8d0_slow_hash(c >>> 0, m >>> 0),
                 `coherence gate->value ${m}/${c}`);
  }
});

test("v38 B18: deterministic randomized differential corpus", () => {
  let seed = 0x007db8d0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const mode = rnd();
    const count = rnd();
    assert.equal(wasm.isaac_pm_7db8d0_fast_gate(mode >>> 0) | 0,
                 v38B18FastGatePe(mode), `trial ${trial} gate-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_gate(mode >>> 0) | 0,
                 PM.pm7db8d0FastGate(mode), `trial ${trial} gate-model`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_value(mode >>> 0) | 0,
                 v38B18FastValuePe(mode), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_value(mode >>> 0) | 0,
                 PM.pm7db8d0FastValue(mode), `trial ${trial} value-model`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(count >>> 0) | 0,
                 v38B18SlowFatalPe(count), `trial ${trial} fatal-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_fatal(count >>> 0) | 0,
                 PM.pm7db8d0SlowFatal(count), `trial ${trial} fatal-model`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(count >>> 0, mode >>> 0) | 0,
                 v38B18SlowHashPe(count, mode), `trial ${trial} hash-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(count >>> 0, mode >>> 0) | 0,
                 PM.pm7db8d0SlowHash(count, mode), `trial ${trial} hash-model`);
    assert.equal(wasm.isaac_pm_7db8d0_value(mode >>> 0, count >>> 0) | 0,
                 v38B18ValuePe(mode, count), `trial ${trial} value-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_value(mode >>> 0, count >>> 0) | 0,
                 PM.pm7db8d0Value(mode, count), `trial ${trial} value-model`);
    assert.equal(wasm.isaac_pm_7db8d0_host_needed(mode >>> 0, count >>> 0) | 0,
                 v38B18HostNeededPe(mode, count), `trial ${trial} host-pe`);
    assert.equal(wasm.isaac_pm_7db8d0_host_needed(mode >>> 0, count >>> 0) | 0,
                 PM.pm7db8d0HostNeeded(mode, count), `trial ${trial} host-model`);
    /* coherence: value == gate ? table : hash. */
    assert.equal(wasm.isaac_pm_7db8d0_value(mode >>> 0, count >>> 0) | 0,
                 (mode >>> 0) <= 7
                   ? v38B18FastValuePe(mode)
                   : v38B18SlowHashPe(count, mode),
                 `trial ${trial} value==gate?table:hash`);
    /* coherence: host == slow && count == 0. */
    assert.equal(wasm.isaac_pm_7db8d0_host_needed(mode >>> 0, count >>> 0) | 0,
                 ((mode >>> 0) > 7 && (count >>> 0) === 0) ? 1 : 0,
                 `trial ${trial} host==slow&&count0`);
    cases += 14;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7db8d0_fast_gate(w >>> 0) | 0,
                 v38B18FastGatePe(w), `wide gate ${w}`);
    assert.equal(wasm.isaac_pm_7db8d0_fast_value(w >>> 0) | 0,
                 v38B18FastValuePe(w), `wide value ${w}`);
    assert.equal(wasm.isaac_pm_7db8d0_slow_hash(w >>> 0, (w + 8) >>> 0) | 0,
                 v38B18SlowHashPe(w, (w + 8) >>> 0), `wide hash ${w}`);
    assert.equal(wasm.isaac_pm_7db8d0_value(w >>> 0, (w + 8) >>> 0) | 0,
                 v38B18ValuePe(w, (w + 8) >>> 0), `wide value ${w}`);
    assert.equal(wasm.isaac_pm_7db8d0_host_needed((w + 8) >>> 0, w >>> 0) | 0,
                 v38B18HostNeededPe(w + 8, w), `wide host ${w}`);
    cases += 5;
  }
  assert.ok(cases >= 7000 + 25, `expected >= 7025 cases, got ${cases}`);
});

/* ====================================================================== */
/* v40 — B20: VA 0x007dbba0 RNG-item-pick + EffectAdd (NARROWED). The    */
/* lazy-init "RNG Seed is zero!" log 0xa112c0, GetCollectible 0x72fd10,  */
/* EffectAdd 0x930220 and the cookie check 0xaef12b stay host; g_Game    */
/* [0xc71678]/[0xc7169c], mode [Game+0x26614], and the RNG struct dwords */
/* at [*(this+0x177c) + 0x840 + {0,4,8,0xc}] stay host samples. thiscall,*/
/* ret plain, SIDE-EFFECT call (2 direct rel32 callers 0x7a848b +        */
/* 0x7ad962, return unused). 68 insns, 4 E8, 0 indirect, 9 mem-stores    */
/* (7 stack locals + 2 observable). PE-truth helpers mirror the          */
/* finalized C++/model laws (oracle: emulate-b20.py executes the actual  */
/* PE instruction stream — 21,106 rows, 0 mismatches).                   */
/* ====================================================================== */

const V40_B20_TABLE = [0xd, 0xe, 0xf0, 0x46, 0x8f, 0x159, 0x1ed, 0x1f0];

function v40B20RngNeedsInitPe(state) {
  return (state >>> 0) === 0 ? 1 : 0;
}

function v40B20RngNextPe(state, c1, c2, c3) {
  /* 0x007dbbf2..0x007dbc11 — the family three-step xorshift; x86
     shr/shl mask cl to 5 bits. */
  let x = state >>> 0;
  x ^= x >>> (c1 & 31);
  x = (x ^ (x << (c2 & 31))) >>> 0;
  x ^= x >>> (c3 & 31);
  return x >>> 0;
}

function v40B20SampleIndexPe(state) {
  return (state >>> 0) & 7;
}

function v40B20SampleValuePe(table8, index) {
  if (!table8) return 0;
  const i = index | 0;
  if (i < 0 || i > 7) return 0;
  return table8[i] >>> 0;
}

function v40B20StoreGatePe(mode) {
  return (mode | 0) >= 2 ? 1 : 0;
}

function v40B20UpdatePe(state, c1, c2, c3, table8) {
  if (v40B20RngNeedsInitPe(state) === 1) return 0;
  return v40B20SampleValuePe(
    table8, v40B20SampleIndexPe(v40B20RngNextPe(state, c1, c2, c3)));
}

test("v40 B20: build + ABI + census (RNG-item-pick 0x7dbba0)", () => {
  /* Header block needles (native/decomp/player_manager_update_pure_helpers.h). */
  const h = readFileSync(
    join(root, "native", "decomp", "player_manager_update_pure_helpers.h"),
    "utf8");
  assert.match(h, /v40 — B20/);
  assert.match(h, /ISAAC_PM_B20_VA_BODY = 0x007dbba0/);
  assert.match(h, /ISAAC_PM_B20_VA_RET = 0x007dbc75/);
  assert.match(h, /ISAAC_PM_B20_BODY_BYTES = 213/);
  assert.match(h, /ISAAC_PM_B20_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B20_CALLER0_VA = 0x007a848b/);
  assert.match(h, /ISAAC_PM_B20_CALLER1_VA = 0x007ad962/);
  assert.match(h, /ISAAC_PM_B20_RNG_PTR_OFF = 0x177c/);
  assert.match(h, /ISAAC_PM_B20_RNG_OFF = 0x840/);
  assert.match(h, /ISAAC_PM_B20_STORE_OFF = 0x2edc/);
  assert.match(h, /ISAAC_PM_B20_SHIFT_MASK = 31/);
  assert.match(h, /ISAAC_PM_B20_IDX_MASK = 7/);
  assert.match(h, /ISAAC_PM_B20_TABLE8_0 = 0xd/);
  assert.match(h, /ISAAC_PM_B20_TABLE8_7 = 0x1f0/);
  assert.match(h, /ISAAC_PM_B20_LOG_STR_VA = 0x00b6bf54/);
  assert.match(h, /ISAAC_PM_B20_GET_COLLECTIBLE_VA = 0x0072fd10/);
  assert.match(h, /ISAAC_PM_B20_EFFECT_ADD_VA = 0x00930220/);
  assert.match(h, /isaac_pm_7dbba0_rng_needs_init\(uint32_t state\)/);
  assert.match(h, /isaac_pm_7dbba0_rng_next\(uint32_t state, uint32_t c1, uint32_t c2, uint32_t c3\)/);
  assert.match(h, /isaac_pm_7dbba0_sample_index\(uint32_t state\)/);
  assert.match(h, /isaac_pm_7dbba0_sample_value\(const uint32_t\* table8, int32_t index\)/);
  assert.match(h, /isaac_pm_7dbba0_store_gate\(uint32_t mode\)/);
  assert.match(h, /isaac_pm_7dbba0_update\(uint32_t state, uint32_t c1, uint32_t c2, uint32_t c3, const uint32_t\* table8\)/);
  /* Model constants agree (B20 mirror). */
  assert.equal(PM.PM_B20_VA_BODY, 0x007dbba0);
  assert.equal(PM.PM_B20_VA_RET, 0x007dbc75);
  assert.equal(PM.PM_B20_BODY_BYTES, 213);
  assert.equal(PM.PM_B20_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_B20_CALLER0_VA, 0x007a848b);
  assert.equal(PM.PM_B20_CALLER1_VA, 0x007ad962);
  assert.equal(PM.PM_B20_E8_COUNT, 4);
  assert.equal(PM.PM_B20_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_B20_STORE_COUNT, 9);
  assert.equal(PM.PM_B20_RNG_PTR_OFF, 0x177c);
  assert.equal(PM.PM_B20_RNG_OFF, 0x840);
  assert.equal(PM.PM_B20_STORE_OFF, 0x2edc);
  assert.equal(PM.PM_B20_SHIFT_MASK, 31);
  assert.equal(PM.PM_B20_IDX_MASK, 7);
  assert.equal(PM.PM_B20_MODE_CMP, 2);
  assert.equal(PM.PM_B20_MODE_OFF, 0x26614);
  assert.equal(PM.PM_B20_PAIR_OFF, 0x1508);
  assert.equal(PM.PM_B20_GET_COLLECTIBLE_VA, 0x0072fd10);
  assert.equal(PM.PM_B20_EFFECT_ADD_VA, 0x00930220);
  assert.equal(PM.PM_B20_COOKIE_VA, 0x00aef12b);
  assert.deepEqual(PM.PM_B20_TABLE8, V40_B20_TABLE);
  /* All 6 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7dbba0_rng_needs_init",
    "isaac_pm_7dbba0_rng_next",
    "isaac_pm_7dbba0_sample_index",
    "isaac_pm_7dbba0_sample_value",
    "isaac_pm_7dbba0_store_gate",
    "isaac_pm_7dbba0_update",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007dbba0.txt = this unit's body-span
     dump of 0x7dbba0..0x7dbc75). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v40-7dbba0", "disasm-007dbba0.txt"),
    "utf8");
  assert.match(dis, /call\s+0xa112c0/);
  assert.match(dis, /call\s+0x72fd10/);
  assert.match(dis, /call\s+0x930220/);
  assert.match(dis, /and\s+eax, 7/);
  assert.match(dis, /shr\s+eax, cl/);
  assert.match(dis, /shl\s+edx, cl/);
  assert.match(dis, /mov\s+dword ptr \[edi \+ 0x2edc\], esi/);
  assert.match(dis, /mov\s+dword ptr \[esi\], eax/);
  /* Caller windows (2 direct rel32 callers — the v32 band census). */
  for (const [va, needle] of [
    ["007a848b", /0x007a848b:.*call\s+0x7dbba0/],
    ["007ad962", /0x007ad962:.*call\s+0x7dbba0/],
  ]) {
    const caller = readFileSync(
      join(root, "output", "decomp", "5129df723e64", "section-notes",
           "pm-v40-7dbba0", `caller-${va}.txt`),
      "utf8");
    assert.match(caller, needle, `caller ${va}`);
  }
  /* The 0x7ad962 caller gates B20 on [Game+0x26614] >= 2 (jl skip). */
  const callerAd96 = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v40-7dbba0", "caller-007ad962.txt"),
    "utf8");
  assert.match(callerAd96, /cmp\s+dword ptr \[eax \+ 0x26614\], 2/);
  assert.match(callerAd96, /jl\s+0x7ad9e0/);
});

test("v40 B20: scalar laws (byte gates + xorshift + store gate)", () => {
  const view = new DataView(wasm.memory.buffer);
  const tblPtr = SCRATCH + 0x9000;
  V40_B20_TABLE.forEach((v, i) =>
    view.setUint32(tblPtr + 4 * i, v >>> 0, true));
  /* rng_needs_init: FULL-DWORD zero test (0x80000000 NOT init). */
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(0), 1);
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(1), 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(0x100), 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(0xffffffff), 0);
  /* rng_next: pinned values computed by the PE oracle (emulate-b20.py)
     — the family three-step xorshift with the x86 5-bit cl mask. */
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(1, 0x1d, 0xf, 0x11) >>> 0, 0x8001);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(2, 0x1d, 0xf, 0x11) >>> 0, 0x10002);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x11, 0x5) >>> 0, 0x996cc1e4);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x7fffffff, 0x1d, 0xf, 0x11) >>> 0, 0x8001bffc);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0xffffffff, 0x1d, 0xf, 0x11) >>> 0, 0x3fff9);
  /* shift-mask edges: 0x20 ≡ 0 (x ^ x>>0 == 0), 0x21 ≡ 1, 0xff ≡ 0x1f. */
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0x20, 0x11, 0x5) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x20, 0x5) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x11, 0x20) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0x21, 0x11, 0x5) >>> 0,
               wasm.isaac_pm_7dbba0_rng_next(0x12345678, 1, 0x11, 0x5) >>> 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0xff, 0x5) >>> 0,
               wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x1f, 0x5) >>> 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x11, 0xff) >>> 0,
               wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x11, 0x1f) >>> 0);
  assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, 0xd, 0x11, 0x5) >>> 0,
               wasm.isaac_pm_pre_play_rng_next(0x12345678, 0xd, 0x11, 0x5) >>> 0,
               "family chain delegation");
  /* sample_index: the & 7 gate on the NEW state. */
  assert.equal(wasm.isaac_pm_7dbba0_sample_index(0x8001) | 0, 1);
  assert.equal(wasm.isaac_pm_7dbba0_sample_index(0x10002) | 0, 2);
  assert.equal(wasm.isaac_pm_7dbba0_sample_index(0x996cc1e4) | 0, 4);
  assert.equal(wasm.isaac_pm_7dbba0_sample_index(0xffffffff) | 0, 7);
  assert.equal(wasm.isaac_pm_7dbba0_sample_index(0x12345678) | 0, 0);
  /* sample_value: the 8-dword table (TRUE .rdata constants); null and
     out-of-range totalized to 0 (B18 fast_value discipline). */
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 0) >>> 0, 0xd);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 1) >>> 0, 0xe);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 2) >>> 0, 0xf0);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 3) >>> 0, 0x46);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 4) >>> 0, 0x8f);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 5) >>> 0, 0x159);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 6) >>> 0, 0x1ed);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 7) >>> 0, 0x1f0);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(0, 0), 0);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, 8), 0);
  assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, -1), 0);
  /* store_gate: SIGNED (int32)mode >= 2 (jl — 0x80000000 skips). */
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(0), 0);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(1), 0);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(2), 1);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(3), 1);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7dbba0_store_gate(0xffffffff), 0);
  /* update: whole-body composition; state==0 totalizes to 0 (the PE
     runs the host lazy-init path there). */
  assert.equal(wasm.isaac_pm_7dbba0_update(1, 0x1d, 0xf, 0x11, tblPtr) >>> 0, 0xe);
  assert.equal(wasm.isaac_pm_7dbba0_update(0x12345678, 0xd, 0x11, 0x5, tblPtr) >>> 0, 0x8f);
  assert.equal(wasm.isaac_pm_7dbba0_update(0x7fffffff, 0x1d, 0xf, 0x11, tblPtr) >>> 0, 0x8f);
  assert.equal(wasm.isaac_pm_7dbba0_update(0x12345678, 0x20, 0x11, 0x5, tblPtr) >>> 0, 0xd);
  assert.equal(wasm.isaac_pm_7dbba0_update(0, 0xd, 0x11, 0x5, tblPtr), 0);
  assert.equal(wasm.isaac_pm_7dbba0_update(0, 0xd, 0x11, 0x5, 0, 2), 0);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0x1d, 0xf, 0x11, 2],
    [1, 0x1d, 0xf, 0x11, 2],
    [2, 0x1d, 0xf, 0x11, 0],
    [0x12345678, 0xd, 0x11, 0x5, 0x80000000],
    [0xffffffff, 0x1d, 0xf, 0x11, 2],
    [0x80000000, 0xd, 0x11, 0x5, 0xffffffff],
    [0x12345678, 0xff, 0x21, 0x1f, 1],
    [0xfffffff8, 0x1d, 0xf, 0x11, 3],
    [0x7fffffff, 0x80000000, 0xffffffff, 0x20, 2],
    [0xdeadbeef, 0xdeadbeef, 0xdeadbeef, 0xdeadbeef, 0xdeadbeef],
  ];
  for (const [s, c1, c2, c3, m] of rows) {
    assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(s >>> 0) | 0,
                 v40B20RngNeedsInitPe(s), `init ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(s >>> 0) | 0,
                 PM.pm7dbba0RngNeedsInit(s), `init-model ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0) >>> 0,
                 v40B20RngNextPe(s, c1, c2, c3), `next ${s}/${c1}/${c2}/${c3}`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0) >>> 0,
                 PM.pm7dbba0RngNext(s, c1, c2, c3), `next-model ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_index(s >>> 0) | 0,
                 v40B20SampleIndexPe(s), `idx ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_index(s >>> 0) | 0,
                 PM.pm7dbba0SampleIndex(s), `idx-model ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, v40B20SampleIndexPe(s)) >>> 0,
                 v40B20SampleValuePe(V40_B20_TABLE, v40B20SampleIndexPe(s)), `val ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, v40B20SampleIndexPe(s)) >>> 0,
                 PM.pm7dbba0SampleValue(PM.PM_B20_TABLE8, PM.pm7dbba0SampleIndex(s)), `val-model ${s}`);
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(m >>> 0) | 0,
                 v40B20StoreGatePe(m), `gate ${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(m >>> 0) | 0,
                 PM.pm7dbba0StoreGate(m), `gate-model ${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_update(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 v40B20UpdatePe(s, c1, c2, c3, V40_B20_TABLE), `upd ${s}/${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_update(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 PM.pm7dbba0Update(s, c1, c2, c3, PM.PM_B20_TABLE8), `upd-model ${s}/${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_update(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 (s >>> 0) === 0 ? 0
                   : V40_B20_TABLE[wasm.isaac_pm_7dbba0_sample_index(
                       wasm.isaac_pm_7dbba0_rng_next(s >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0))],
                 `upd coherence ${s}`);
  }
});

test("v40 B20: deterministic randomized differential corpus", () => {
  let seed = 0x007dbba0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  const view = new DataView(wasm.memory.buffer);
  const tblPtr = SCRATCH + 0x9000;
  V40_B20_TABLE.forEach((v, i) =>
    view.setUint32(tblPtr + 4 * i, v >>> 0, true));
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const state = rnd();
    const c1 = rnd();
    const c2 = rnd();
    const c3 = rnd();
    const mode = rnd();
    const ni = v40B20RngNeedsInitPe(state);
    const nxt = v40B20RngNextPe(state, c1, c2, c3);
    const idx = v40B20SampleIndexPe(nxt);
    const v = v40B20SampleValuePe(V40_B20_TABLE, idx);
    const sg = v40B20StoreGatePe(mode);
    const upd = v40B20UpdatePe(state, c1, c2, c3, V40_B20_TABLE);
    assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(state >>> 0) | 0,
                 ni, `trial ${trial} init-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(state >>> 0) | 0,
                 PM.pm7dbba0RngNeedsInit(state), `trial ${trial} init-model`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(state >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0) >>> 0,
                 nxt, `trial ${trial} next-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(state >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0) >>> 0,
                 PM.pm7dbba0RngNext(state, c1, c2, c3), `trial ${trial} next-model`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_index(nxt) | 0,
                 idx, `trial ${trial} idx-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_index(nxt) | 0,
                 PM.pm7dbba0SampleIndex(nxt), `trial ${trial} idx-model`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, idx) >>> 0,
                 v, `trial ${trial} val-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_sample_value(tblPtr, idx) >>> 0,
                 PM.pm7dbba0SampleValue(PM.PM_B20_TABLE8, idx), `trial ${trial} val-model`);
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(mode >>> 0) | 0,
                 sg, `trial ${trial} gate-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(mode >>> 0) | 0,
                 PM.pm7dbba0StoreGate(mode), `trial ${trial} gate-model`);
    assert.equal(wasm.isaac_pm_7dbba0_update(state >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 upd, `trial ${trial} upd-pe`);
    assert.equal(wasm.isaac_pm_7dbba0_update(state >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 PM.pm7dbba0Update(state, c1, c2, c3, PM.PM_B20_TABLE8), `trial ${trial} upd-model`);
    /* coherence: update == init ? 0 : table[index(next)]. */
    assert.equal(wasm.isaac_pm_7dbba0_update(state >>> 0, c1 >>> 0, c2 >>> 0, c3 >>> 0, tblPtr) >>> 0,
                 ni === 1 ? 0 : V40_B20_TABLE[idx], `trial ${trial} upd==ni?0:table`);
    /* coherence: needs_init == (state == 0). */
    assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(state >>> 0) | 0,
                 (state >>> 0) === 0 ? 1 : 0, `trial ${trial} init==state0`);
    /* coherence: store_gate signed — 0x80000000 never stores. */
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(mode >>> 0) | 0,
                 (mode | 0) >= 2 ? 1 : 0, `trial ${trial} gate==signed`);
    /* state == 0 fixed point of the chain (documented: the PE never
       runs it there — needs_init is authoritative). */
    if ((state >>> 0) === 0) {
      assert.equal(wasm.isaac_pm_7dbba0_rng_next(0, c1 >>> 0, c2 >>> 0, c3 >>> 0) >>> 0, 0,
                   `trial ${trial} zero fixed point`);
    }
    cases += 15;
  }
  /* wide-mode sweep (store gate signed edges). */
  for (const m of [0, 1, 2, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(m >>> 0) | 0,
                 v40B20StoreGatePe(m), `wide gate ${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_store_gate(m >>> 0) | 0,
                 PM.pm7dbba0StoreGate(m), `wide gate-model ${m}`);
    assert.equal(wasm.isaac_pm_7dbba0_update(0x12345678, 0xd, 0x11, 0x5, tblPtr) >>> 0,
                 v40B20UpdatePe(0x12345678, 0xd, 0x11, 0x5, V40_B20_TABLE), `wide upd ${m}`);
    cases += 3;
  }
  /* shift-mask wide edges. */
  for (const c of [0x20, 0x21, 0xff, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, c >>> 0, 0x11, 0x5) >>> 0,
                 v40B20RngNextPe(0x12345678, c, 0x11, 0x5), `wide c1 ${c}`);
    assert.equal(wasm.isaac_pm_7dbba0_rng_next(0x12345678, c >>> 0, 0x11, 0x5) >>> 0,
                 PM.pm7dbba0RngNext(0x12345678, c, 0x11, 0x5), `wide c1-model ${c}`);
    cases += 2;
  }
  /* crash-row authority: state==0 -> needs_init 1 + update 0. */
  assert.equal(wasm.isaac_pm_7dbba0_rng_needs_init(0) | 0, 1);
  assert.equal(wasm.isaac_pm_7dbba0_update(0, 0xd, 0x11, 0x5, tblPtr), 0);
  cases += 2;
  assert.ok(cases >= 7500 + 22, `expected >= 7522 cases, got ${cases}`);
});

/* =====================================================================
 * v39 — B19 0x7dba30 + B21 0x7dbc80 + B22 0x7dbd70 (W27-F7; the v40
 * B20 blocks stay untouched; the shared ABI pins were 38 -> 39 by this
 * unit — F16 flips 39 -> 40 on top).
 */

function v39B19ResultPe(h1, h2, a0, a1, d4, d0) {
  if (!((h1 & 0xff) !== 0 || (h2 & 0xff) !== 0)) return 0;
  if ((a0 >>> 0) === 0x21) return 1;
  const a = a0 >>> 0, b = a1 >>> 0;
  let bl = 0;
  if ((a | 0) > 0x21) {
    if (a === 0x3e8) {
      const t = asU32(b - 0x16);
      if (t <= 0xb6) bl = PM.PM_B19_BYTE_TABLE[t] === 0 ? 1 : 0;
    }
  } else if (a === 0) {
    bl = b === 0x2710 ? 1 : 0;
  } else if (a === 9) {
    bl = b === 2 ? 1 : 0;
  }
  if ((d4 & 0xff) === 0 && bl === 0) return 0;
  if (bl === 0) return 0;
  if ((d0 | 0) >= 0x1e) return 0;
  return 1;
}

function v39B19FlagStorePe(h1, h2, a0, a1, d4) {
  if (!((h1 & 0xff) !== 0 || (h2 & 0xff) !== 0)) return -1;
  if ((a0 >>> 0) === 0x21) return -1;
  const a = a0 >>> 0, b = a1 >>> 0;
  let bl = 0;
  if ((a | 0) > 0x21) {
    if (a === 0x3e8) {
      const t = asU32(b - 0x16);
      if (t <= 0xb6) bl = PM.PM_B19_BYTE_TABLE[t] === 0 ? 1 : 0;
    }
  } else if (a === 0) {
    bl = b === 0x2710 ? 1 : 0;
  } else if (a === 9) {
    bl = b === 2 ? 1 : 0;
  }
  if ((d4 & 0xff) !== 0 || bl !== 0) return 1;
  return 0;
}

test("v39 B19: build + ABI pin + census (item-278 flag gate 0x7dba30)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v39 — B19 0x7dba30/);
  assert.match(h, /ISAAC_PM_B19_VA_BODY = 0x007dba30/);
  assert.match(h, /ISAAC_PM_B19_VA_RET_ZERO = 0x007dba92/);
  assert.match(h, /ISAAC_PM_B19_VA_RET_ONE = 0x007dbadc/);
  assert.match(h, /ISAAC_PM_B19_BODY_BYTES = 0xac/);
  assert.match(h, /ISAAC_PM_B19_CALLSITE_COUNT = 5/);
  assert.match(h, /ISAAC_PM_B19_VA_BYTE_TABLE = 0x007dbae8/);
  assert.match(h, /ISAAC_PM_B19_VA_HAS_COLLECTIBLE = 0x007706e0/);
  assert.match(h, /ISAAC_PM_B19_VA_HAS_EFFECT = 0x009305f0/);
  assert.match(h, /isaac_pm_7dba30_has_item\(uint32_t has_278, uint32_t has_278_effect\)/);
  assert.match(h, /isaac_pm_7dba30_result\(uint32_t has_278, uint32_t has_278_effect,/);
  assert.equal(PM.PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(PM.PM_B19_TABLE_BYTES, 183);
  assert.equal(PM.PM_B19_BYTE_TABLE.length, 183);
  assert.equal(PM.PM_B19_BYTE_TABLE[0x16 - 0x16], 0);
  assert.equal(PM.PM_B19_BYTE_TABLE[0xcc - 0x16], 0);
  assert.equal(PM.PM_B19_BYTE_TABLE[0xcc - 0x16 - 1], 1);
  /* raw disasm needles (this unit's dump). */
  const dis = readFileSync(join(root, "output", "decomp", "5129df723e64",
    "section-notes", "pm-v39-7dba30", "disasm-7dba30.txt"), "utf8");
  assert.match(dis, /push\s+0x278/);
  assert.match(dis, /call\s+0x7706e0/);
  assert.match(dis, /call\s+0x9305f0/);
  assert.match(dis, /cmp\s+eax, 0x21/);
  assert.match(dis, /movzx\s+eax, byte ptr \[eax \+ 0x7dbae8\]/);
  assert.match(dis, /jmp\s+dword ptr \[eax\*4 \+ 0x7dbae0\]/);
  assert.match(dis, /ret\s+0x28/);
  /* caller census evidence (5 direct rel32 callers). */
  for (const [va, needle] of [
    ["006ffd19", /0x006ffd19:.*call\s+0x7dba30/],
    ["0071c8fa", /0x0071c8fa:.*call\s+0x7dba30/],
    ["00772db4", /0x00772db4:.*call\s+0x7dba30/],
  ]) {
    const caller = readFileSync(join(root, "output", "decomp",
      "5129df723e64", "section-notes", "pm-v39-7dba30",
      `caller-${va}.txt`), "utf8");
    assert.match(caller, needle, `caller ${va}`);
  }
});

test("v39 B19: scalar laws (byte gates / dispatch bl / table index / store / result)", () => {
  /* has_item: two byte gates (& 0xff) — high-byte samples stay off. */
  assert.equal(wasm.isaac_pm_7dba30_has_item(0x12345600, 0), 0);
  assert.equal(wasm.isaac_pm_7dba30_has_item(0, 0x9abcde00), 0);
  assert.equal(wasm.isaac_pm_7dba30_has_item(1, 0), 1);
  assert.equal(wasm.isaac_pm_7dba30_has_item(0x12345601, 0x9abcde00), 1);
  /* effect probe runs iff the direct sample is false. */
  assert.equal(wasm.isaac_pm_7dba30_effect_probe_runs(0x12345600), 1);
  assert.equal(wasm.isaac_pm_7dba30_effect_probe_runs(0x11), 0);
  /* special case: arg0 == 0x21 -> immediate ONE. */
  assert.equal(wasm.isaac_pm_7dba30_special_case(0x21), 1);
  assert.equal(wasm.isaac_pm_7dba30_special_case(0x20), 0);
  assert.equal(wasm.isaac_pm_7dba30_special_case(0x22), 0);
  /* table_index: 0x16..0xcc in-range, -1 outside (UNSIGNED). */
  assert.equal(wasm.isaac_pm_7dba30_table_index(0x16), 0);
  assert.equal(wasm.isaac_pm_7dba30_table_index(0xcc), 0);
  assert.equal(wasm.isaac_pm_7dba30_table_index(0x16 + 5), 1);
  assert.equal(wasm.isaac_pm_7dba30_table_index(0xcd), -1);
  assert.equal(wasm.isaac_pm_7dba30_table_index(0xffffffff), -1);
  /* bl dispatch: 0 -> 0x2710, 9 -> 2, 0x3e8 -> table==0 entries, default 0. */
  assert.equal(wasm.isaac_pm_7dba30_bl(0, 0x2710), 1);
  assert.equal(wasm.isaac_pm_7dba30_bl(0, 0x2711), 0);
  assert.equal(wasm.isaac_pm_7dba30_bl(9, 2), 1);
  assert.equal(wasm.isaac_pm_7dba30_bl(9, 3), 0);
  assert.equal(wasm.isaac_pm_7dba30_bl(0x3e8, 0x16), 1);   /* table[0] == 0 */
  assert.equal(wasm.isaac_pm_7dba30_bl(0x3e8, 0x16 + 5), 0); /* table 1 */
  assert.equal(wasm.isaac_pm_7dba30_bl(0x3e8, 0x1000), 0);   /* out of range */
  assert.equal(wasm.isaac_pm_7dba30_bl(0x80000000, 0x16), 0); /* negative -> default */
  assert.equal(wasm.isaac_pm_7dba30_bl(0x21, 0), 0);          /* special case, bl unused */
  /* flag_store: -1 no store / 0 / 1. */
  assert.equal(wasm.isaac_pm_7dba30_flag_store(0, 0, 0, 1, 0), -1);
  assert.equal(wasm.isaac_pm_7dba30_flag_store(1, 0, 0x21, 1, 0), -1);
  assert.equal(wasm.isaac_pm_7dba30_flag_store(1, 0, 0, 0x2710, 0), 1);
  assert.equal(wasm.isaac_pm_7dba30_flag_store(1, 0, 0, 1, 0xff), 1);
  assert.equal(wasm.isaac_pm_7dba30_flag_store(1, 0, 0, 1, 0), 0);
  /* result: whole-body bool with the SIGNED 0x26d0 < 0x1e gate. */
  assert.equal(wasm.isaac_pm_7dba30_result(0, 0, 0, 1, 0, 0), 0);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0x21, 0, 0xff, 0x1f), 1);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0, 0x2710, 0, 0x1d), 1);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0, 0x2710, 0, 0x1e), 0);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0, 0x2710, 0, 0x80000000), 1);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0, 0x2710, 0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pm_7dba30_result(1, 0, 0, 1, 0, 0), 0);
  assert.equal(wasm.isaac_pm_7dba30_result(0x100, 0, 0, 0x2710, 0, 0x1d), 0);
  /* model parity on every scalar. */
  for (const args of [[0x100,0,0x21,0,0,0],[1,0,0x3e8,0x17,0xff,0x1d],
                      [0,1,9,2,0,0x80000000],[0xff1234,0,0,0x2710,0x100,0x1e]]) {
    assert.equal(wasm.isaac_pm_7dba30_result(...args) | 0,
                 PM.pm7dba30Result(...args), `result ${args}`);
  }
});

test("v39 B19: deterministic differential corpus (500 draws)", () => {
  let cases = 0;
  let seed = 0x007dba30 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 500; i++) {
    const h1 = rnd() >>> 0, h2 = rnd() >>> 0;
    const a0 = rnd() >>> 0, a1 = rnd() >>> 0;
    const d4 = rnd() >>> 0, d0 = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7dba30_result(h1, h2, a0, a1, d4, d0) | 0,
                 v39B19ResultPe(h1, h2, a0, a1, d4, d0), `corpus ${i}`);
    assert.equal(wasm.isaac_pm_7dba30_flag_store(h1, h2, a0, a1, d4) | 0,
                 v39B19FlagStorePe(h1, h2, a0, a1, d4), `store ${i}`);
    assert.equal(wasm.isaac_pm_7dba30_bl(a0, a1) | 0,
                 PM.pm7dba30Bl(a0, a1), `bl-model ${i}`);
    cases += 3;
  }
  assert.ok(cases >= 1500, `expected >= 1500 cases, got ${cases}`);
});

function v39B21PickPe(seed, s1, s2, s3) {
  let a = seed >>> 0;
  a ^= a >>> (s1 & 31);
  a ^= (a << (s2 & 31)) >>> 0;
  a ^= a >>> (s3 & 31);
  a >>>= 0;
  return PM.PM_B21_PICK_TABLE[a % 13];
}

test("v39 B21: build + ABI + scalar laws (RNG pick 0x7dbc80)", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /v39 — B21 0x7dbc80/);
  assert.match(h, /ISAAC_PM_B21_VA_BODY = 0x007dbc80/);
  assert.match(h, /ISAAC_PM_B21_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B21_PICK_DIVISOR = 0xd/);
  assert.match(h, /ISAAC_PM_B21_OFF_STORE_2EE0 = 0x2ee0/);
  assert.match(h, /isaac_pm_7dbc80_rng_next\(uint32_t seed, uint32_t shift1,/);
  assert.match(h, /isaac_pm_7dbc80_pick\(uint32_t seed, uint32_t shift1,/);
  assert.equal(PM.PM_B21_PICK_TABLE.length, 13);
  assert.deepEqual(PM.PM_B21_PICK_TABLE.slice(0, 3), [0x1d, 0x1e, 0x1f]);
  assert.equal(PM.PM_B21_PICK_TABLE[12], 0x2dc);
  const dis = readFileSync(join(root, "output", "decomp", "5129df723e64",
    "section-notes", "pm-v39-7dba30", "disasm-7dbc80.txt"), "utf8");
  assert.match(dis, /mov\s+esi, dword ptr \[edi \+ 0x177c\]/);
  assert.match(dis, /add\s+esi, 0x990/);
  assert.match(dis, /div\s+ecx/);
  assert.match(dis, /call\s+0x930220/);
  assert.match(dis, /call\s+0x72fd10/);
  /* scalar laws. */
  assert.equal(wasm.isaac_pm_7dbc80_rng_seed_zero(0), 1);
  assert.equal(wasm.isaac_pm_7dbc80_rng_seed_zero(1), 0);
  assert.equal(wasm.isaac_pm_7dbc80_rng_seed_still_zero(0), 1);
  assert.equal(wasm.isaac_pm_7dbc80_rng_seed_still_zero(0xdead), 0);
  assert.equal(wasm.isaac_pm_7dbc80_rng_next(1, 0, 0, 0) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_rng_next(1, 32, 0, 0) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_rng_next(1, 0, 32, 0) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_rng_next(0x12345678, 2, 7, 13) >>> 0,
               PM.pm7dbc80RngNext(0x12345678, 2, 7, 13), "rng_next parity");
  assert.equal(wasm.isaac_pm_7dbc80_pick_index(13) | 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_pick_index(14) | 0, 1);
  assert.equal(wasm.isaac_pm_7dbc80_pick_index(0xffffffff) | 0, 8);
  assert.equal(wasm.isaac_pm_7dbc80_pick_value(0) | 0, 0x1d);
  assert.equal(wasm.isaac_pm_7dbc80_pick_value(12) | 0, 0x2dc);
  assert.equal(wasm.isaac_pm_7dbc80_pick_value(13) | 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_store_gate(2) | 0, 1);
  assert.equal(wasm.isaac_pm_7dbc80_store_gate(1) | 0, 0);
  assert.equal(wasm.isaac_pm_7dbc80_store_gate(0x80000000) | 0, 0);
  /* model parity. */
  assert.equal(wasm.isaac_pm_7dbc80_pick(0x12345678, 2, 7, 13) | 0,
               PM.pm7dbc80Pick(0x12345678, 2, 7, 13));
  assert.equal(wasm.isaac_pm_7dbc80_pick(0x12345678, 2, 7, 13) | 0,
               v39B21PickPe(0x12345678, 2, 7, 13));
});

test("v39 B21 + v39 B22: deterministic differential corpora (<=500 draws)", () => {
  let cases = 0;
  let seed = 0x007dbc80 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 250; i++) {
    const seed = rnd() >>> 0, s1 = rnd() >>> 0, s2 = rnd() >>> 0, s3 = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7dbc80_pick(seed, s1, s2, s3) | 0,
                 v39B21PickPe(seed, s1, s2, s3), `b21 corpus ${i}`);
    const m = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7dbc80_store_gate(m) | 0,
                 PM.pm7dbc80StoreGate(m), `b21 gate ${i}`);
    cases += 2;
  }
  let seed2 = 0x007dbd70 >>> 0;
  const rnd2 = () => { seed2 = (Math.imul(seed2, 1664525) + 1013904223) >>> 0; return seed2; };
  for (let i = 0; i < 250; i++) {
    const seed = rnd2() >>> 0;
    const s1 = rnd2() >>> 0, s2 = rnd2() >>> 0, s3 = rnd2() >>> 0;
    const end = rnd2() >>> 0, cap = rnd2() >>> 0;
    const cfg = rnd2() >>> 0, cfg54 = rnd2() >>> 0, b2 = rnd2() >>> 0;
    const flag = rnd2() >>> 0;
    let a = seed;
    a ^= a >>> (s1 & 31);
    a ^= (a << (s2 & 31)) >>> 0;
    a ^= a >>> (s3 & 31);
    a >>>= 0;
    assert.equal(wasm.isaac_pm_7dbd70_rng_next(seed, s1, s2, s3) >>> 0, a,
                 `b22 next ${i}`);
    assert.equal(wasm.isaac_pm_7dbd70_push_grow(end >>> 0, cap >>> 0) | 0,
                 (end >>> 0) === (cap >>> 0) ? 1 : 0, `b22 grow ${i}`);
    assert.equal(wasm.isaac_pm_7dbd70_cfg_gate(cfg) | 0, cfg !== 0 ? 1 : 0,
                 `b22 cfg ${i}`);
    assert.equal(wasm.isaac_pm_7dbd70_costume_gate(b2) | 0,
                 (b2 & 0xff) !== 0 ? 1 : 0, `b22 costume ${i}`);
    assert.equal(wasm.isaac_pm_7dbd70_flag_1574(flag >>> 0, cfg54 >>> 0) >>> 0,
                 ((flag >>> 0) | (cfg54 >>> 0)) >>> 0, `b22 flag ${i}`);
    cases += 5;
  }
  assert.ok(cases >= 1700, `expected >= 1700 cases, got ${cases}`);
});

test("v39 B22: build + scalar laws (RNG revive tail 0x7dbd70)", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /v39 — B22 0x7dbd70/);
  assert.match(h, /ISAAC_PM_B22_VA_BODY = 0x007dbd70/);
  assert.match(h, /ISAAC_PM_B22_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_B22_VEC_SLOT_VALUE = 0x7dbe70/);
  assert.match(h, /ISAAC_PM_B22_CFG_OFF_B2 = 0xb2/);
  assert.match(h, /isaac_pm_7dbd70_rng_next\(uint32_t seed, uint32_t shift1,/);
  assert.match(h, /isaac_pm_7dbd70_flag_1574\(uint32_t flag_1574, uint32_t cfg_54\)/);
  const dis = readFileSync(join(root, "output", "decomp", "5129df723e64",
    "section-notes", "pm-v39-7dba30", "disasm-7dbd70.txt"), "utf8");
  assert.match(dis, /cmp\s+eax, dword ptr \[ecx \+ 8\]/);
  assert.match(dis, /call\s+0x428590/);
  assert.match(dis, /call\s+0x7ec0a0/);
  assert.match(dis, /or\s+dword ptr \[esi \+ 0x1574\], ecx/);
  assert.match(dis, /call\s+0x75d1d0/);
  assert.match(dis, /ret\s+4/);
  assert.equal(wasm.isaac_pm_7dbd70_rng_seed_zero(0), 1);
  assert.equal(wasm.isaac_pm_7dbd70_rng_seed_still_zero(0), 1);
  assert.equal(wasm.isaac_pm_7dbd70_push_grow(4, 4), 1);
  assert.equal(wasm.isaac_pm_7dbd70_push_grow(4, 8), 0);
  assert.equal(wasm.isaac_pm_7dbd70_cfg_gate(0), 0);
  assert.equal(wasm.isaac_pm_7dbd70_cfg_gate(0x1234), 1);
  assert.equal(wasm.isaac_pm_7dbd70_costume_gate(0x12345600), 0);
  assert.equal(wasm.isaac_pm_7dbd70_costume_gate(0x12345601), 1);
  assert.equal(wasm.isaac_pm_7dbd70_flag_1574(0x7f, 0x1234) >>> 0, 0x127f);
});

/* =====================================================================
 * v41 — B23: VA 0x007dbe70 revive-queue predicate (FULLY PURE — the
 * band closer: landing it closes 0x7dba30..0x7dbe70 end-to-end; the
 * only other 0x7dbe70 mentions are B22's vec-slot VALUE pins).
 * cdecl callback, ONE stack arg at [ebp+8] = object pointer, plain
 * ret, bool in al. 0 direct rel32 callers (census-callers.py) —
 * invoked INDIRECTLY via the room-container vec {begin,end} at
 * [0xc7169c+0x2a508..0x2a50c]: B22 pushes the CONSTANT 0x7dbe70
 * (ISAAC_PM_B22_VEC_SLOT_VALUE), and the 0x7301xx consumer pops slots
 * with slot(obj) at 0x730177 (`mov eax,[esi-4]; add esi,-4; push ebx;
 * call eax; add esp,4`), testing al and aborting the walk on FALSE.
 * 23 insns, 2 rets (0x7dbe9f ZERO / 0x7dbea5 ONE), 0 E8, 0 indirect,
 * 0 mem-stores — the whole body in-module, zero host leaves, zero
 * globals. Machine law: type = dword [obj] (FULL-DWORD); type in
 * {1,3,4} -> (dword [obj+0xb8] & 0x1000000) != 0 (the body's ONLY
 * gate — a bit-mask test, NOT a byte gate); else 1. Compare-class
 * audit: ONLY je/jne equality + the and/or/jne bit test — the B19 jg
 * signed/unsigned equivalence does not apply (no range compare).
 * ===================================================================== */

function v41B23TypeSpecialPe(type) {
  const t = type >>> 0;
  return t === 1 || t === 3 || t === 4 ? 1 : 0;
}

function v41B23FlagsBitPe(flags) {
  return ((flags >>> 0) & 0x1000000) !== 0 ? 1 : 0;
}

function v41B23ResultPe(type, flags) {
  return v41B23TypeSpecialPe(type) === 1 ? v41B23FlagsBitPe(flags) : 1;
}

test("v41 B23: build + ABI pin + census (revive-queue predicate 0x7dbe70)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v41 — B23/);
  assert.match(h, /ISAAC_PM_B23_VA_BODY = 0x007dbe70/);
  assert.match(h, /ISAAC_PM_B23_VA_RET_ZERO = 0x007dbe9f/);
  assert.match(h, /ISAAC_PM_B23_VA_RET_ONE = 0x007dbea5/);
  assert.match(h, /ISAAC_PM_B23_BODY_BYTES = 0x36/);
  assert.match(h, /ISAAC_PM_B23_CALLSITE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B23_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B23_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B23_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_B23_NEXT_FUNC = 0x007dbeb0/);
  assert.match(h, /ISAAC_PM_B23_OBJ_TYPE_OFF = 0x0/);
  assert.match(h, /ISAAC_PM_B23_OBJ_FLAGS_OFF = 0xb8/);
  assert.match(h, /ISAAC_PM_B23_TYPE_CMP_1 = 1/);
  assert.match(h, /ISAAC_PM_B23_TYPE_CMP_4 = 4/);
  assert.match(h, /ISAAC_PM_B23_FLAGS_BIT = 0x1000000/);
  assert.match(h, /ISAAC_PM_B23_VEC_CONSUMER = 0x00730177/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /isaac_pm_7dbe70_type_special\(uint32_t type\)/);
  assert.match(h, /isaac_pm_7dbe70_flags_bit\(uint32_t flags\)/);
  assert.match(h, /isaac_pm_7dbe70_result\(uint32_t type, uint32_t flags\)/);
  /* B22 cross-pin: the vec-slot VALUE that registers this callback. */
  assert.match(h, /ISAAC_PM_B22_VEC_SLOT_VALUE = 0x7dbe70/);
  /* Model constants agree (B23 mirror). */
  assert.equal(PM.PM_B23_VA_BODY, 0x007dbe70);
  assert.equal(PM.PM_B23_VA_RET_ZERO, 0x007dbe9f);
  assert.equal(PM.PM_B23_VA_RET_ONE, 0x007dbea5);
  assert.equal(PM.PM_B23_BODY_BYTES, 0x36);
  assert.equal(PM.PM_B23_CALLSITE_COUNT, 0);
  assert.equal(PM.PM_B23_E8_COUNT, 0);
  assert.equal(PM.PM_B23_INDIRECT_COUNT, 0);
  assert.equal(PM.PM_B23_STORE_COUNT, 0);
  assert.equal(PM.PM_B23_NEXT_FUNC, 0x007dbeb0);
  assert.equal(PM.PM_B23_OBJ_TYPE_OFF, 0x0);
  assert.equal(PM.PM_B23_OBJ_FLAGS_OFF, 0xb8);
  assert.equal(PM.PM_B23_TYPE_CMP_1, 1);
  assert.equal(PM.PM_B23_TYPE_CMP_3, 3);
  assert.equal(PM.PM_B23_TYPE_CMP_4, 4);
  assert.equal(PM.PM_B23_FLAGS_BIT, 0x1000000);
  assert.equal(PM.PM_B23_VEC_HOLDER_OFF, 0x2a508);
  assert.equal(PM.PM_B23_VEC_END_OFF, 0x2a50c);
  assert.equal(PM.PM_B23_VEC_CONSUMER, 0x00730177);
  /* All 3 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7dbe70_type_special",
    "isaac_pm_7dbe70_flags_bit",
    "isaac_pm_7dbe70_result",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007dbe70.txt = this unit's body-span
     dump of 0x7dbe70..0x7dbeb0). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v41-7dbe70", "disasm-007dbe70.txt"),
    "utf8");
  assert.match(dis, /mov\s+ecx, dword ptr \[ebp \+ 8\]/);
  assert.match(dis, /mov\s+eax, dword ptr \[ecx\]/);
  assert.match(dis, /cmp\s+eax, 1/);
  assert.match(dis, /je\s+0x7dbe8a/);
  assert.match(dis, /jne\s+0x7dbea0/);
  assert.match(dis, /mov\s+eax, dword ptr \[ecx \+ 0xb8\]/);
  assert.match(dis, /and\s+eax, 0x1000000/);
  assert.match(dis, /or\s+eax, 0/);
  assert.match(dis, /xor\s+al, al/);
  assert.match(dis, /mov\s+al, 1/);
  /* Caller census: 0 direct rel32 callers — the indirect vec-slot
     invocation evidence (B22 push + the 0x7301xx consumer pop/call).
     The consumer window contains the indirect call. */
  const consumer = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v41-7dbe70", "caller-00730177.txt"),
    "utf8");
  assert.match(consumer, /mov\s+eax, dword ptr \[esi - 4\]/);
  assert.match(consumer, /push\s+ebx/);
  assert.match(consumer, /call\s+eax/);
  assert.match(consumer, /add\s+esp, 4/);
  assert.match(consumer, /test\s+al, al/);
  assert.match(consumer, /je\s+0x7301da/);
});

test("v41 B23: scalar laws (equality dispatch / bit-24 gate / composition)", () => {
  /* type_special: FULL-DWORD exact equality — 1, 3, 4 only. */
  assert.equal(wasm.isaac_pm_7dbe70_type_special(1), 1);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(3), 1);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(4), 1);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(0), 0);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(2), 0);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(0x100), 0);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(0x80000000), 0);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(0xfffffffd), 0);
  assert.equal(wasm.isaac_pm_7dbe70_type_special(0xffffffff), 0);
  /* flags_bit: bit 24 is the ONLY bit that matters — FULL mask. */
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0x1000000), 1);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0x1000001), 1);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0x1800000), 1);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0), 0);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0xffffff), 0);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0x8000000), 0);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0x100), 0);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0xff), 0);
  assert.equal(wasm.isaac_pm_7dbe70_flags_bit(0xffffffff), 1);
  /* result: non-special always 1; special passes iff the bit is set. */
  assert.equal(wasm.isaac_pm_7dbe70_result(0, 0x7fffffff), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(2, 0), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(0xdead, 0), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(0x80000000, 0x1000000), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(1, 0), 0);
  assert.equal(wasm.isaac_pm_7dbe70_result(1, 0x1000000), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(3, 0xffffff), 0);
  assert.equal(wasm.isaac_pm_7dbe70_result(3, 0x1010000), 1);
  assert.equal(wasm.isaac_pm_7dbe70_result(4, 0), 0);
  assert.equal(wasm.isaac_pm_7dbe70_result(4, 0x1000000), 1);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0], [1, 0], [1, 0x1000000], [2, 0x1000000], [3, 0xffffff],
    [3, 0x1010000], [4, 0], [4, 0xffffffff], [5, 0], [0x100, 0x1000000],
    [0x7fffffff, 0], [0x80000000, 0x1000000], [0xfffffffd, 0],
    [0xfffffffe, 0x1000000], [0xffffffff, 0x1000000],
  ];
  for (const [t, f] of rows) {
    assert.equal(wasm.isaac_pm_7dbe70_type_special(t >>> 0) | 0,
                 v41B23TypeSpecialPe(t), `special ${t}`);
    assert.equal(wasm.isaac_pm_7dbe70_type_special(t >>> 0) | 0,
                 PM.pm7dbe70TypeSpecial(t), `special-model ${t}`);
    assert.equal(wasm.isaac_pm_7dbe70_flags_bit(f >>> 0) | 0,
                 v41B23FlagsBitPe(f), `bit ${f}`);
    assert.equal(wasm.isaac_pm_7dbe70_flags_bit(f >>> 0) | 0,
                 PM.pm7dbe70FlagsBit(f), `bit-model ${f}`);
    assert.equal(wasm.isaac_pm_7dbe70_result(t >>> 0, f >>> 0) | 0,
                 v41B23ResultPe(t, f), `result ${t}/${f}`);
    assert.equal(wasm.isaac_pm_7dbe70_result(t >>> 0, f >>> 0) | 0,
                 PM.pm7dbe70Result(t, f), `result-model ${t}/${f}`);
  }
});

test("v41 B23: deterministic randomized differential corpus (500 draws)", () => {
  let cases = 0;
  let seed = 0x007dbe70 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 500; i++) {
    const t = rnd() >>> 0;
    const f = rnd() >>> 0;
    const ts = v41B23TypeSpecialPe(t);
    const fb = v41B23FlagsBitPe(f);
    assert.equal(wasm.isaac_pm_7dbe70_type_special(t) | 0,
                 ts, `trial ${i} special-pe`);
    assert.equal(wasm.isaac_pm_7dbe70_type_special(t) | 0,
                 PM.pm7dbe70TypeSpecial(t), `trial ${i} special-model`);
    assert.equal(wasm.isaac_pm_7dbe70_flags_bit(f) | 0,
                 fb, `trial ${i} bit-pe`);
    assert.equal(wasm.isaac_pm_7dbe70_flags_bit(f) | 0,
                 PM.pm7dbe70FlagsBit(f), `trial ${i} bit-model`);
    assert.equal(wasm.isaac_pm_7dbe70_result(t, f) | 0,
                 v41B23ResultPe(t, f), `trial ${i} result-pe`);
    assert.equal(wasm.isaac_pm_7dbe70_result(t, f) | 0,
                 PM.pm7dbe70Result(t, f), `trial ${i} result-model`);
    /* coherence: result == (special ? bit : 1). */
    assert.equal(wasm.isaac_pm_7dbe70_result(t, f) | 0,
                 ts === 1 ? fb : 1, `trial ${i} coherence`);
    cases += 7;
  }
  /* wide drives (never pre-mask the wasm arg). */
  for (const w of [0x100, 0x1ff, 0xffffff, 0x1000000, 0x7fffffff,
                   0x80000000, 0xfffffffd, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7dbe70_type_special(w >>> 0) | 0,
                 v41B23TypeSpecialPe(w), `wide special ${w}`);
    assert.equal(wasm.isaac_pm_7dbe70_flags_bit(w >>> 0) | 0,
                 v41B23FlagsBitPe(w), `wide bit ${w}`);
    assert.equal(wasm.isaac_pm_7dbe70_result(4, w >>> 0) | 0,
                 v41B23FlagsBitPe(w), `wide result-special ${w}`);
    assert.equal(wasm.isaac_pm_7dbe70_result(w >>> 0, 0) | 0,
                 v41B23TypeSpecialPe(w) === 1 ? 0 : 1, `wide result-type ${w}`);
    cases += 4;
  }
  assert.ok(cases >= 3500 + 32, `expected >= 3532 cases, got ${cases}`);
});

/* =====================================================================
 * v42 — VEC: outlined container-cursor leaves 0x7dc610 + 0x7dc650
 * (both FULLY PURE; the FIRST frontier cluster after the closed
 * 0x7dba30..0x7dbe70 band). thiscall, plain ret, zero branches.
 * ===================================================================== */

function v42EndAfterResetPe(beginNow) {
  return beginNow >>> 0;
}

function v42EndAfterPopPe(endNow) {
  return ((endNow >>> 0) + 0xfffffffc) >>> 0;
}

test("v42 VEC: build + ABI pin + census (container-cursor leaves 0x7dc610 + 0x7dc650)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v42 — VEC/);
  assert.match(h, /ISAAC_PM_V42A_VA_BODY = 0x007dc610/);
  assert.match(h, /ISAAC_PM_V42A_VA_RET = 0x007dc615/);
  assert.match(h, /ISAAC_PM_V42A_BODY_BYTES = 6/);
  assert.match(h, /ISAAC_PM_V42A_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_V42A_CALLER0 = 0x007b47ea/);
  assert.match(h, /ISAAC_PM_V42A_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V42A_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V42A_STORE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_V42A_READ_OFF = 0x0/);
  assert.match(h, /ISAAC_PM_V42A_STORE_OFF = 0x4/);
  assert.match(h, /ISAAC_PM_V42A_NEXT_FUNC = 0x007dc620/);
  assert.match(h, /ISAAC_PM_V42B_VA_BODY = 0x007dc650/);
  assert.match(h, /ISAAC_PM_V42B_VA_RET = 0x007dc654/);
  assert.match(h, /ISAAC_PM_V42B_BODY_BYTES = 5/);
  assert.match(h, /ISAAC_PM_V42B_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_V42B_CALLER0 = 0x0076efb9/);
  assert.match(h, /ISAAC_PM_V42B_CALLER1 = 0x0076f10b/);
  assert.match(h, /ISAAC_PM_V42B_END_OFF = 0x4/);
  assert.match(h, /ISAAC_PM_V42B_POP_DELTA_U32 = 0xfffffffcu/);
  assert.match(h, /ISAAC_PM_V42B_NEXT_FUNC = 0x007dc660/);
  assert.match(h, /ABI_VERSION = 45 }/);
  assert.match(h, /isaac_pm_7dc610_end_after_reset\(uint32_t begin_now\)/);
  assert.match(h, /isaac_pm_7dc610_store_off\(void\)/);
  assert.match(h, /isaac_pm_7dc650_end_after_pop\(uint32_t end_now\)/);
  assert.match(h, /isaac_pm_7dc650_pop_delta\(void\)/);
  /* Model constants agree (V42 mirror). */
  assert.equal(PM.PM_V42A_VA_BODY, 0x007dc610);
  assert.equal(PM.PM_V42A_VA_RET, 0x007dc615);
  assert.equal(PM.PM_V42A_BODY_BYTES, 6);
  assert.equal(PM.PM_V42A_CALLSITE_COUNT, 1);
  assert.equal(PM.PM_V42A_CALLER0, 0x007b47ea);
  assert.equal(PM.PM_V42A_STORE_OFF, 0x4);
  assert.equal(PM.PM_V42A_NEXT_FUNC, 0x007dc620);
  assert.equal(PM.PM_V42B_VA_BODY, 0x007dc650);
  assert.equal(PM.PM_V42B_VA_RET, 0x007dc654);
  assert.equal(PM.PM_V42B_BODY_BYTES, 5);
  assert.equal(PM.PM_V42B_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_V42B_CALLER0, 0x0076efb9);
  assert.equal(PM.PM_V42B_CALLER1, 0x0076f10b);
  assert.equal(PM.PM_V42B_END_OFF, 0x4);
  assert.equal(PM.PM_V42B_POP_DELTA_U32, 0xfffffffc);
  assert.equal(PM.PM_V42B_NEXT_FUNC, 0x007dc660);
  /* All 4 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7dc610_end_after_reset",
    "isaac_pm_7dc610_store_off",
    "isaac_pm_7dc650_end_after_pop",
    "isaac_pm_7dc650_pop_delta",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007dc610-007dc650.txt = this unit's
     body-span dump incl. int3 pads). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "disasm-007dc610-007dc650.txt"),
    "utf8");
  assert.match(dis, /mov\s+eax, dword ptr \[ecx\]/);
  assert.match(dis, /mov\s+dword ptr \[ecx \+ 4\], eax/);
  assert.match(dis, /add\s+dword ptr \[ecx \+ 4\], -4/);
  /* Caller census: V42-A exactly 1 direct rel32 caller; V42-B exactly
     2 — the stack-local container windows. */
  const callerA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "caller-007b47ea.txt"),
    "utf8");
  assert.match(callerA, /lea\s+ecx, \[ebp - 0x324\]/);
  assert.match(callerA, /call\s+0x7dc610/);
  const callerB = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "caller-0076efb9-0076f10b.txt"),
    "utf8");
  assert.match(callerB, /call\s+0x7dc650/);
  assert.match(callerB, /lea\s+ecx, \[ebp - 0x4b0\]/);
  assert.match(callerB, /lea\s+ecx, \[ebp - 0x4a4\]/);
});

test("v42 VEC: scalar laws (retired store values / site + delta constants)", () => {
  /* end_after_reset: FULL-DWORD u32 copy — identity on the u32 value,
     including wide and signed-edge bit patterns (never pre-masked). */
  for (const v of [0, 1, 2, 3, 0x7f, 0x80, 0xff, 0x100, 0xffff,
                   0x7fffffff, 0x80000000, 0xfffffffc, 0xfffffffd,
                   0xfffffffe, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7dc610_end_after_reset(v >>> 0) >>> 0,
                 v42EndAfterResetPe(v), `reset ${v}`);
    assert.equal(wasm.isaac_pm_7dc610_end_after_reset(v >>> 0) >>> 0,
                 PM.pm7dc610EndAfterReset(v), `reset-model ${v}`);
  }
  /* store site: [this+0x4] (the cursor dword), read site [this+0x0]. */
  assert.equal(wasm.isaac_pm_7dc610_store_off() | 0, 4);
  assert.equal(PM.pm7dc610StoreOff() | 0, 4);
  /* end_after_pop: u32 wrap — end 0 pops to 0xfffffffc, end 3 to
     0xffffffff; every element count is a plain subtraction. */
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(0) >>> 0, 0xfffffffc);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(3) >>> 0, 0xffffffff);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(4) >>> 0, 0);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(0xffffffff) >>> 0,
               0xfffffffb);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(0x80000000) >>> 0,
               0x7ffffffc);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(12) >>> 0, 8);
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(0) >>> 0,
               PM.pm7dc650EndAfterPop(0));
  assert.equal(wasm.isaac_pm_7dc650_end_after_pop(0x80000000) >>> 0,
               PM.pm7dc650EndAfterPop(0x80000000));
  /* pop delta: signed -4 (bit pattern 0xfffffffc). */
  assert.equal(wasm.isaac_pm_7dc650_pop_delta() | 0, -4);
  assert.equal(PM.pm7dc650PopDelta() | 0, -4);
});

test("v42 VEC: deterministic randomized differential corpus (500 draws)", () => {
  let cases = 0;
  let seed = 0x007dc610 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 500; i++) {
    const b = rnd() >>> 0;
    const e = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7dc610_end_after_reset(b) >>> 0,
                 v42EndAfterResetPe(b), `trial ${i} reset-pe`);
    assert.equal(wasm.isaac_pm_7dc610_end_after_reset(b) >>> 0,
                 PM.pm7dc610EndAfterReset(b), `trial ${i} reset-model`);
    assert.equal(wasm.isaac_pm_7dc650_end_after_pop(e) >>> 0,
                 v42EndAfterPopPe(e), `trial ${i} pop-pe`);
    assert.equal(wasm.isaac_pm_7dc650_end_after_pop(e) >>> 0,
                 PM.pm7dc650EndAfterPop(e), `trial ${i} pop-model`);
    /* coherence: popping after a reset of begin==e lands back on e-4's
       neighbour law — both bodies move the SAME cursor dword. */
    assert.equal(((wasm.isaac_pm_7dc650_end_after_pop(
      wasm.isaac_pm_7dc610_end_after_reset(b)) >>> 0) + 4) >>> 0,
      b >>> 0, `trial ${i} coherence`);
    cases += 5;
  }
  assert.ok(cases >= 2500, `expected >= 2500 cases, got ${cases}`);
});

/* =====================================================================
 * v43 — SEL: byte-min select leaf 0x7dd3a0 + record-assembler copy
 * 0x7dd490 (both FULLY PURE; next-window census 0x7dd010..0x7de010).
 * ===================================================================== */

function v43MinBytePe(aByte, bByte) {
  const a = (aByte >>> 0) & 0xff;
  const b = (bByte >>> 0) & 0xff;
  return b < a ? b : a;
}

function v43SelectsBPe(aByte, bByte) {
  const a = (aByte >>> 0) & 0xff;
  const b = (bByte >>> 0) & 0xff;
  return b < a ? 1 : 0;
}

test("v43 SEL: build + ABI pin + census (byte-min select 0x7dd3a0 + record copy 0x7dd490)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v43 — SEL/);
  assert.match(h, /ISAAC_PM_V43A_VA_BODY = 0x007dd3a0/);
  assert.match(h, /ISAAC_PM_V43A_VA_RET = 0x007dd3a9/);
  assert.match(h, /ISAAC_PM_V43A_BODY_BYTES = 10/);
  assert.match(h, /ISAAC_PM_V43A_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_V43A_CALLER0 = 0x0076e44a/);
  assert.match(h, /ISAAC_PM_V43A_CALLER1 = 0x0076e461/);
  assert.match(h, /ISAAC_PM_V43A_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V43A_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V43A_STORE_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V43A_BYTE_MASK = 0xff/);
  assert.match(h, /ISAAC_PM_V43A_NEXT_FUNC = 0x007dd3b0/);
  assert.match(h, /ISAAC_PM_V43B_VA_BODY = 0x007dd490/);
  assert.match(h, /ISAAC_PM_V43B_VA_RET = 0x007dd4a8/);
  assert.match(h, /ISAAC_PM_V43B_BODY_BYTES = 25/);
  assert.match(h, /ISAAC_PM_V43B_CALLSITE_COUNT = 1/);
  assert.match(h, /ISAAC_PM_V43B_CALLER0 = 0x0079b9f3/);
  assert.match(h, /ISAAC_PM_V43B_STORE_COUNT = 3/);
  assert.match(h, /ISAAC_PM_V43B_OFF_FIELD1 = 0x4/);
  assert.match(h, /ISAAC_PM_V43B_NEXT_FUNC = 0x007dd4b0/);
  /* Model constants agree (V43 mirror). */
  assert.equal(PM.PM_V43A_VA_BODY, 0x007dd3a0);
  assert.equal(PM.PM_V43A_VA_RET, 0x007dd3a9);
  assert.equal(PM.PM_V43A_BODY_BYTES, 10);
  assert.equal(PM.PM_V43A_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_V43A_BYTE_MASK, 0xff);
  assert.equal(PM.PM_V43A_NEXT_FUNC, 0x007dd3b0);
  assert.equal(PM.PM_V43B_VA_BODY, 0x007dd490);
  assert.equal(PM.PM_V43B_VA_RET, 0x007dd4a8);
  assert.equal(PM.PM_V43B_BODY_BYTES, 25);
  assert.equal(PM.PM_V43B_CALLER0, 0x0079b9f3);
  assert.equal(PM.PM_V43B_STORE_COUNT, 3);
  assert.equal(PM.PM_V43B_OFF_FIELD2, 0x8);
  assert.equal(PM.PM_V43B_NEXT_FUNC, 0x007dd4b0);
  /* All 3 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7dd3a0_min_byte",
    "isaac_pm_7dd3a0_selects_b",
    "isaac_pm_7dd490_copy_plan",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007dd3a0-007dd490.txt). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "disasm-007dd3a0-007dd490.txt"),
    "utf8");
  assert.match(dis, /mov\s+al, byte ptr \[edx\]/);
  assert.match(dis, /cmp\s+al, byte ptr \[ecx\]/);
  assert.match(dis, /cmovb\s+ecx, edx/);
  assert.match(dis, /mov\s+dword ptr \[ecx \+ 8\], eax/);
  assert.match(dis, /mov\s+dword ptr \[ecx \+ 4\], edx/);
  /* Caller census windows: V43-A palette-decode pair, V43-B the
     record assembly feeding the 0x7dc740 ring push. */
  const callerA = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "disasm-007dd3a0-007dd490.txt"),
    "utf8");
  assert.match(callerA, /call\s+0x7dd3a0/);
  assert.match(callerA, /call\s+0x7dd490/);
});

test("v43 SEL: scalar laws (unsigned byte-min select / 3-field copy plan)", () => {
  /* min_byte: UNSIGNED low-byte compare — high bytes NEVER participate
     (wide drives prove the & 0xff mask; equal bytes keep the a-side).
     Rows include wide drives whose HIGH bytes would corrupt a
     full-dword compare if the v9 mask were dropped. */
  for (const [a, b] of [
    [0, 0], [0, 1], [1, 0], [3, 5], [5, 3], [0x7f, 0x80], [0x80, 0x7f],
    [0xfe, 0xff], [0xff, 0xfe], [0xff, 0xff], [0x100, 1], [1, 0x100],
    [0xff00, 2], [2, 0xff00], [0x1234, 0x56], [0xffffffff, 6],
  ]) {
    assert.equal(wasm.isaac_pm_7dd3a0_min_byte(a >>> 0, b >>> 0) >>> 0,
                 v43MinBytePe(a, b), `min ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7dd3a0_min_byte(a >>> 0, b >>> 0) >>> 0,
                 PM.pm7dd3a0MinByte(a, b), `min-model ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7dd3a0_selects_b(a >>> 0, b >>> 0) | 0,
                 v43SelectsBPe(a, b), `sel ${a}/${b}`);
    assert.equal(wasm.isaac_pm_7dd3a0_selects_b(a >>> 0, b >>> 0) | 0,
                 PM.pm7dd3a0SelectsB(a, b), `sel-model ${a}/${b}`);
    /* coherence: min equals the winning side's masked byte. */
    const sel = wasm.isaac_pm_7dd3a0_selects_b(a >>> 0, b >>> 0);
    assert.equal(wasm.isaac_pm_7dd3a0_min_byte(a >>> 0, b >>> 0) >>> 0,
                 sel === 1 ? ((b >>> 0) & 0xff) : ((a >>> 0) & 0xff),
                 `coherence ${a}/${b}`);
  }
  /* copy plan: {src1[0], src2[0], src2[1]} — full-dword, no masking.
     Out-pointer contract: wasm writes the 12-byte plan at SCRATCH +
     0x40; a DataView over wasm.memory reads it back little-endian. */
  const view = new DataView(wasm.memory.buffer);
  wasm.isaac_pm_7dd490_copy_plan(0x11111111, 0x22222222, 0x33333333,
                                 SCRATCH + 0x40);
  assert.equal(view.getUint32(SCRATCH + 0x40, true) >>> 0, 0x11111111);
  assert.equal(view.getUint32(SCRATCH + 0x44, true) >>> 0, 0x22222222);
  assert.equal(view.getUint32(SCRATCH + 0x48, true) >>> 0, 0x33333333);
  /* wrap edges survive verbatim (FULL-DWORD, no masks in body B). */
  wasm.isaac_pm_7dd490_copy_plan(0xffffffff, 0, 0x80000000, SCRATCH + 0x40);
  assert.equal(view.getUint32(SCRATCH + 0x40, true) >>> 0, 0xffffffff);
  assert.equal(view.getUint32(SCRATCH + 0x44, true) >>> 0, 0);
  assert.equal(view.getUint32(SCRATCH + 0x48, true) >>> 0, 0x80000000);
  /* model parity. */
  const plan = PM.pm7dd490CopyPlan(0xabcdef01, 0x12345678, 0x9abcdef0);
  assert.deepEqual([plan.field0, plan.field1, plan.field2],
                   [0xabcdef01, 0x12345678, 0x9abcdef0]);
});

test("v43 SEL: deterministic randomized differential corpus (500 draws)", () => {
  let cases = 0;
  let seed = 0x007dd3a0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 500; i++) {
    const a = rnd() >>> 0;
    const b = rnd() >>> 0;
    assert.equal(wasm.isaac_pm_7dd3a0_min_byte(a, b) >>> 0,
                 v43MinBytePe(a, b), `trial ${i} min-pe`);
    assert.equal(wasm.isaac_pm_7dd3a0_min_byte(a, b) >>> 0,
                 PM.pm7dd3a0MinByte(a, b), `trial ${i} min-model`);
    assert.equal(wasm.isaac_pm_7dd3a0_selects_b(a, b) | 0,
                 v43SelectsBPe(a, b), `trial ${i} sel-pe`);
    assert.equal(wasm.isaac_pm_7dd3a0_selects_b(a, b) | 0,
                 PM.pm7dd3a0SelectsB(a, b), `trial ${i} sel-model`);
    const s1 = rnd() >>> 0;
    const s20 = rnd() >>> 0;
    const s21 = rnd() >>> 0;
    const plan = PM.pm7dd490CopyPlan(s1, s20, s21);
    assert.equal(plan.field0, s1 >>> 0, `trial ${i} f0`);
    assert.equal(plan.field1, s20 >>> 0, `trial ${i} f1`);
    assert.equal(plan.field2, s21 >>> 0, `trial ${i} f2`);
    cases += 6;
  }
  assert.ok(cases >= 3000, `expected >= 3000 cases, got ${cases}`);
});

/* =====================================================================
 * v44 — FILL: zero-fill leaf 0x7de2f0 (FULLY PURE; next-window census
 * 0x7de010..0x7df010). 7 FULL-DWORD zero-stores per element, stride
 * 0x1c; count==0 skips the loop entirely.
 * ===================================================================== */

function v44StoreCountPe(count) {
  const n = count >>> 0;
  return n === 0 ? 0 : (n * 7) >>> 0;
}

test("v44 FILL: build + ABI pin + census (zero-fill leaf 0x7de2f0)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v44 — FILL/);
  assert.match(h, /ISAAC_PM_V44_VA_BODY = 0x007de2f0/);
  assert.match(h, /ISAAC_PM_V44_VA_RET = 0x007de31f/);
  assert.match(h, /ISAAC_PM_V44_BODY_BYTES = 50/);
  assert.match(h, /ISAAC_PM_V44_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_V44_CALLER0 = 0x007dc8b9/);
  assert.match(h, /ISAAC_PM_V44_CALLER1 = 0x007deb8a/);
  assert.match(h, /ISAAC_PM_V44_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V44_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V44_STORE_COUNT = 7/);
  assert.match(h, /ISAAC_PM_V44_STRIDE = 0x1c/);
  assert.match(h, /ISAAC_PM_V44_DWORDS_PER_ELEM = 7/);
  assert.match(h, /ISAAC_PM_V44_NEXT_FUNC = 0x007de330/);
  /* Declines recorded in this window. */
  assert.match(h, /DECLINED as generic-shared|DECLINE generic-shared/);
  /* Model constants agree (V44 mirror). */
  assert.equal(PM.PM_V44_VA_BODY, 0x007de2f0);
  assert.equal(PM.PM_V44_VA_RET, 0x007de31f);
  assert.equal(PM.PM_V44_BODY_BYTES, 50);
  assert.equal(PM.PM_V44_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_V44_CALLER0, 0x007dc8b9);
  assert.equal(PM.PM_V44_CALLER1, 0x007deb8a);
  assert.equal(PM.PM_V44_STORE_COUNT, 7);
  assert.equal(PM.PM_V44_STRIDE, 0x1c);
  assert.equal(PM.PM_V44_DWORDS_PER_ELEM, 7);
  assert.equal(PM.PM_V44_NEXT_FUNC, 0x007de330);
  /* All 4 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7de2f0_store_count",
    "isaac_pm_7de2f0_skips_zero_count",
    "isaac_pm_7de2f0_stride",
    "isaac_pm_7de2f0_dwords_per_elem",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007de2f0.txt = body span + caller
     windows incl. the census-missed 0x7deb8a site). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "disasm-007de2f0.txt"),
    "utf8");
  assert.match(dis, /mov\s+dword ptr \[eax \+ 0x18\], edx/);
  assert.match(dis, /add\s+eax, 0x1c/);
  assert.match(dis, /jne\s+0x7de300/);
  assert.match(dis, /ret\s+0xc/);
  assert.match(dis, /call\s+0x7de2f0/);
});

test("v44 FILL: scalar laws (store geometry / zero-count skip)", () => {
  /* site laws. */
  assert.equal(wasm.isaac_pm_7de2f0_stride() | 0, 28);
  assert.equal(wasm.isaac_pm_7de2f0_dwords_per_elem() | 0, 7);
  assert.equal(PM.pm7de2f0Stride() | 0, 28);
  assert.equal(PM.pm7de2f0DwordsPerElem() | 0, 7);
  /* skip decision: equality-to-zero ONLY (no range compare exists). */
  for (const c of [0, 1, 2, 7, 0xffff, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7de2f0_skips_zero_count(c >>> 0) | 0,
                 (c >>> 0) === 0 ? 1 : 0, `skip ${c}`);
    assert.equal(wasm.isaac_pm_7de2f0_skips_zero_count(c >>> 0) | 0,
                 PM.pm7de2f0SkipsZeroCount(c), `skip-model ${c}`);
  }
  /* store count: count * 7 with u32 wrap; count == 0 -> 0 stores. */
  for (const c of [0, 1, 2, 3, 7, 100, 0x20000000, 0x24924925,
                   0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pm_7de2f0_store_count(c >>> 0) >>> 0,
                 v44StoreCountPe(c), `stores ${c}`);
    assert.equal(wasm.isaac_pm_7de2f0_store_count(c >>> 0) >>> 0,
                 PM.pm7de2f0StoreCount(c), `stores-model ${c}`);
  }
  assert.equal(wasm.isaac_pm_7de2f0_store_count(0) >>> 0, 0);
  /* u32 wrap edges: 0x24924925 * 7 == 0x100000003 mod 2^32. */
  assert.equal(wasm.isaac_pm_7de2f0_store_count(0x24924925) >>> 0,
               0x00000003);
});

test("v44 FILL: deterministic randomized differential corpus (500 draws)", () => {
  let cases = 0;
  let seed = 0x007de2f0 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  for (let i = 0; i < 500; i++) {
    const c = rnd() >>> 0;
    const sc = wasm.isaac_pm_7de2f0_store_count(c) >>> 0;
    assert.equal(sc, v44StoreCountPe(c), `trial ${i} stores-pe`);
    assert.equal(sc, PM.pm7de2f0StoreCount(c), `trial ${i} stores-model`);
    assert.equal(wasm.isaac_pm_7de2f0_skips_zero_count(c) | 0,
                 PM.pm7de2f0SkipsZeroCount(c), `trial ${i} skip-model`);
    /* coherence: skip <=> zero stores; when the product fits u32 the
       store count is an exact multiple of 7 (wrap breaks divisibility,
       covered by the wrap-edge asserts in the scalar group). */
    if ((wasm.isaac_pm_7de2f0_skips_zero_count(c) | 0) === 1) {
      assert.equal(sc, 0, `trial ${i} skip-zero`);
    } else if (c <= 0x24924924) {
      assert.equal(sc % 7, 0, `trial ${i} mult-7`);
      assert.ok(sc / 7 >= 1, `trial ${i} positive`);
    }
    cases += 4;
  }
  assert.ok(cases >= 2000, `expected >= 2000 cases, got ${cases}`);
});

/* =====================================================================
 * v45 — INIT: constant initializer 0x7df200 (FULLY PURE; next-window
 * census 0x7df010..0x7e0010). 15 observable stores through this
 * (14 FULL-DWORDs + 1 exact WORD @0x4c = 0x100); three std::string
 * capacity headers =0xf; unity/scale float bits verbatim.
 * ===================================================================== */

test("v45 INIT: build + ABI pin + census (constant initializer 0x7df200)", () => {
  assert.equal(PM_UPDATE_PURE_ABI_VERSION, 45);
  assert.equal(wasm.isaac_player_manager_update_pure_helpers_abi_version(), 45);
  const h = readFileSync(header, "utf8");
  assert.match(h, /v45 — INIT/);
  assert.match(h, /ISAAC_PM_V45_VA_BODY = 0x007df200/);
  assert.match(h, /ISAAC_PM_V45_VA_RET = 0x007df269/);
  assert.match(h, /ISAAC_PM_V45_BODY_BYTES = 106/);
  assert.match(h, /ISAAC_PM_V45_CALLSITE_COUNT = 2/);
  assert.match(h, /ISAAC_PM_V45_CALLER0 = 0x007e2f72/);
  assert.match(h, /ISAAC_PM_V45_CALLER1 = 0x007e3008/);
  assert.match(h, /ISAAC_PM_V45_E8_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V45_INDIRECT_COUNT = 0/);
  assert.match(h, /ISAAC_PM_V45_STORE_COUNT = 15/);
  assert.match(h, /ISAAC_PM_V45_DWORD_STORES = 14/);
  assert.match(h, /ISAAC_PM_V45_WORD_STORES = 1/);
  assert.match(h, /ISAAC_PM_V45_STRING_CAP = 0xf/);
  assert.match(h, /ISAAC_PM_V45_CAP_SITE_COUNT = 3/);
  assert.match(h, /ISAAC_PM_V45_UNITY_F32_BITS = 0x3f800000/);
  assert.match(h, /ISAAC_PM_V45_SCALE_F32_BITS = 0x3ca3d70a/);
  assert.match(h, /ISAAC_PM_V45_WORD_4C_INIT = 0x100/);
  assert.match(h, /ISAAC_PM_V45_NEXT_FUNC = 0x007df270/);
  /* Declines recorded in this window. */
  assert.match(h, /DECLINED/);
  assert.match(h, /unattributable/);
  assert.match(h, /DECLINE[D]? generic-shared/);
  /* Model constants agree (V45 mirror). */
  assert.equal(PM.PM_V45_VA_BODY, 0x007df200);
  assert.equal(PM.PM_V45_VA_RET, 0x007df269);
  assert.equal(PM.PM_V45_BODY_BYTES, 106);
  assert.equal(PM.PM_V45_CALLSITE_COUNT, 2);
  assert.equal(PM.PM_V45_CALLER0, 0x007e2f72);
  assert.equal(PM.PM_V45_CALLER1, 0x007e3008);
  assert.equal(PM.PM_V45_STORE_COUNT, 15);
  assert.equal(PM.PM_V45_DWORD_STORES, 14);
  assert.equal(PM.PM_V45_WORD_STORES, 1);
  assert.equal(PM.PM_V45_NEXT_FUNC, 0x007df270);
  /* All 5 exports load in the wasm module. */
  for (const name of [
    "isaac_pm_7df200_store_count",
    "isaac_pm_7df200_string_cap",
    "isaac_pm_7df200_cap_site_count",
    "isaac_pm_7df200_scale_f32_bits",
    "isaac_pm_7df200_word_4c_init",
    "isaac_pm_7df200_unity_f32_bits",
  ]) {
    assert.equal(typeof wasm[name], "function", `export ${name}`);
  }
  /* Raw disasm needles (disasm-007df200.txt = body span + both caller
     windows). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "pm-v42-frontier", "disasm-007df200.txt"),
    "utf8");
  assert.match(dis, /mov\s+dword ptr \[ecx \+ 0x18\], 0xf/);
  assert.match(dis, /mov\s+word ptr \[ecx \+ 0x4c\], 0x100/);
  assert.match(dis, /mov\s+dword ptr \[ecx \+ 0x54\], 0x3ca3d70a/);
  assert.match(dis, /call\s+0x7df200/);
  assert.match(dis, /add\s+esi, 0x60/);
  assert.match(dis, /add\s+ecx, 0x60/);
});

test("v45 INIT: scalar laws (store geometry / retired value pins)", () => {
  /* geometry: 15 observable stores = 14 dwords + 1 exact WORD. */
  assert.equal(wasm.isaac_pm_7df200_store_count() | 0, 15);
  assert.equal(PM.pm7df200StoreCount() | 0, 15);
  assert.equal(wasm.isaac_pm_7df200_store_count() | 0,
               wasm.isaac_pm_7df200_store_count() | 0);
  /* the three std::string capacity headers all retire 0xf across 3 sites. */
  assert.equal(wasm.isaac_pm_7df200_string_cap() >>> 0, 0xf);
  assert.equal(wasm.isaac_pm_7df200_cap_site_count() | 0, 3);
  assert.equal(PM.pm7df200StringCap() >>> 0, 0xf);
  assert.equal(PM.pm7df200CapSiteCount() | 0, 3);
  /* float bits retired verbatim (no float arithmetic in the body). */
  assert.equal(wasm.isaac_pm_7df200_scale_f32_bits() >>> 0, 0x3ca3d70a);
  assert.equal(PM.pm7df200ScaleF32Bits() >>> 0, 0x3ca3d70a);
  /* the only sub-dword store: exact WORD 0x100. */
  assert.equal(wasm.isaac_pm_7df200_word_4c_init() >>> 0, 0x100);
  assert.equal(PM.pm7df200Word4cInit() >>> 0, 0x100);
  /* unity float bits retired verbatim. */
  assert.equal(wasm.isaac_pm_7df200_unity_f32_bits() >>> 0, 0x3f800000);
  assert.equal(PM.pm7df200UnityF32Bits() >>> 0, 0x3f800000);
});

test("v45 INIT: retired-value corpus (PE-truth sweep over the store map)", () => {
  /* PE truth table transcribed from disasm-007df200.txt: the full
     store map {offset -> retired value}, verified against the laws'
     composition (cap sites + float bits + word init + zero fill). */
  const PE_STORES = [
    [0x00, 0], [0x04, 0], [0x14, 0], [0x18, 0xf], [0x1c, 0],
    [0x2c, 0], [0x30, 0xf], [0x34, 0], [0x44, 0], [0x48, 0xf],
    [0x4c, 0x100], [0x50, 0x3f800000], [0x54, 0x3ca3d70a],
    [0x58, 0], [0x5c, 0],
  ];
  let cases = 0;
  const cap = wasm.isaac_pm_7df200_string_cap() >>> 0;
  const scale = wasm.isaac_pm_7df200_scale_f32_bits() >>> 0;
  const unity = wasm.isaac_pm_7df200_unity_f32_bits() >>> 0;
  const word = wasm.isaac_pm_7df200_word_4c_init() >>> 0;
  const nStores = wasm.isaac_pm_7df200_store_count() | 0;
  const nCaps = wasm.isaac_pm_7df200_cap_site_count() | 0;
  for (const [off, val] of PE_STORES) {
    let retired;
    if (off === 0x18 || off === 0x30 || off === 0x48) retired = cap;
    else if (off === 0x50) retired = unity;
    else if (off === 0x54) retired = scale;
    else if (off === 0x4c) retired = word;
    else retired = 0;
    assert.equal(retired >>> 0, val >>> 0, `store @0x${off.toString(16)}`);
    cases += 1;
  }
  /* coherence: store count = dword + word stores; cap sites match the
     number of 0xf entries in the map. */
  assert.equal(nStores, PE_STORES.length, `store count ${nStores}`);
  assert.equal(nCaps, PE_STORES.filter(([, v]) => v === 0xf).length);
  cases += 2;
  assert.ok(cases >= 17, `expected >= 17 cases, got ${cases}`);
});
