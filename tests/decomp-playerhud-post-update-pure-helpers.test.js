import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PLAYERHUD_ACTIVE_IMAGE_SP_BASE,
  PLAYERHUD_ACTIVE_PATH_KIND_0x122,
  PLAYERHUD_ACTIVE_PATH_KIND_0x23,
  PLAYERHUD_ACTIVE_PATH_KIND_0x280,
  PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL,
  PLAYERHUD_ACTIVE_PATH_KIND_0x2c6,
  PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  PLAYERHUD_ACTIVE_SLOT_COUNT,
  PLAYERHUD_BOOK_DIRTY_AFTER_GFX,
  PLAYERHUD_BOOK_IMAGE_SP_BASE,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH,
  PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES,
  PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL,
  PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH,
  PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES,
  PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL,
  PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH,
  PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES,
  PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL,
  PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH,
  PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES,
  PLAYERHUD_BOOK_PATH_KIND_BELIAL,
  PLAYERHUD_BOOK_PATH_KIND_BOTH,
  PLAYERHUD_BOOK_PATH_KIND_CLEAR,
  PLAYERHUD_BOOK_PATH_KIND_VIRTUES,
  PLAYERHUD_BOOK_SP_CLEAR_ARG,
  PLAYERHUD_CACHED_ACTIVE_ID_BASE,
  PLAYERHUD_CACHED_BOOK_OVERLAY_BASE,
  PLAYERHUD_CACHED_TRINKET_ID_BASE,
  PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE,
  PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
  PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
  PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
  PLAYERHUD_ANM2_LOAD_GRAPHICS,
  PLAYERHUD_CACHED_POCKET_ID_BASE,
  PLAYERHUD_CACHED_POCKET_TYPE_BASE,
  PLAYERHUD_ENTITY_ANM_PATH_OFF,
  PLAYERHUD_GET_ENTITY_TYPE,
  PLAYERHUD_GET_ENTITY_VARIANT_CARD,
  PLAYERHUD_GET_ENTITY_VARIANT_PILL,
  PLAYERHUD_HEART_PATHS,
  PLAYERHUD_HEART_SLOT_COUNT,
  PLAYERHUD_HEART_STRIDE,
  PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX,
  PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF,
  PLAYERHUD_DIRTY_FLAG_EBP_OFF,
  PLAYERHUD_HOST_VA_ANM2_LOAD,
  PLAYERHUD_HOST_VA_ANM2_RESET,
  PLAYERHUD_HOST_VA_DIRTY_NOTIFY,
  PLAYERHUD_HOST_VA_GET_ENTITY,
  PLAYERHUD_HOST_VA_GET_ROOM_BY_IDX,
  PLAYERHUD_HOST_VA_HAS_COLLECTIBLE,
  PLAYERHUD_HOST_VA_ITEM_CONFIG_GET_COLLECTIBLE,
  PLAYERHUD_HOST_VA_LOAD_IMAGE,
  PLAYERHUD_HOST_VA_SMART_PTR_CLEAR,
  PLAYERHUD_HOST_VA_SP_MATERIALIZE,
  PLAYERHUD_HOST_VA_SP_SWAP,
  PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF,
  PLAYERHUD_MANAGER_PILL_VEC_BEGIN,
  PLAYERHUD_POCKET_ANM2_BASE,
  PLAYERHUD_POCKET_PATH_KIND_CARD,
  PLAYERHUD_POCKET_PATH_KIND_PILL,
  PLAYERHUD_POCKET_PATH_KIND_RESET,
  PLAYERHUD_POCKET_SLOT_COUNT,
  PLAYERHUD_POCKET_SLOT_STRIDE,
  PLAYERHUD_POCKET_TYPE_CARD,
  PLAYERHUD_POCKET_TYPE_PILL,
  PLAYERHUD_PLAYER_POCKET_ID_BASE,
  PLAYERHUD_PLAYER_POCKET_TYPE_BASE,
  PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF,
  PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD,
  PLAYERHUD_ITEMCFG_GFX_STRING_OFF,
  PLAYERHUD_ITEMCFG_KIND_GAME_NEG,
  PLAYERHUD_ITEMCFG_KIND_MANAGER,
  PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET,
  PLAYERHUD_ITEMCFG_KIND_NULL,
  PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF,
  PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF,
  PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF,
  PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF,
  PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL,
  PLAYERHUD_MATERIALIZE_THIS_EBP_OFF,
  PLAYERHUD_PATH_ACTIVE_0x122,
  PLAYERHUD_PATH_ACTIVE_0x23,
  PLAYERHUD_PATH_ACTIVE_0x280,
  PLAYERHUD_PATH_ACTIVE_0x280_BELIAL,
  PLAYERHUD_PATH_ACTIVE_0x2c6,
  PLAYERHUD_PATH_BOOK_OF_BELIAL,
  PLAYERHUD_PATH_BOOK_OF_VIRTUES,
  PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL,
  PLAYERHUD_PLAYER_TRINKET_ID_BASE,
  PLAYERHUD_PLAYER_TRINKET_SECONDARY,
  PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION,
  PLAYERHUD_SP_CLEAR_ALLOC_SIZE,
  PLAYERHUD_SP_CLEAR_VTABLE,
  PLAYERHUD_TRINKET_DIRTY_AFTER_GFX,
  PLAYERHUD_TRINKET_IMAGE_SP_BASE,
  PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF,
  PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF,
  PLAYERHUD_TRINKET_SEH_TRY_LEVEL,
  PLAYERHUD_TRINKET_SLOT_COUNT,
  PLAYERHUD_TRINKET_SLOT_STRIDE,
  PLAYERHUD_TRINKET_SPECIAL_0x4b,
  PLAYERHUD_TRINKET_TICK_CACHED_ID,
  PLAYERHUD_TYPE_DARK_JUDAS,
  PLAYERHUD_TYPE_JUDAS,
  playerHudActiveBookOverlayId,
  playerHudActiveDirtyAfterGfx,
  playerHudActiveDirtySet,
  playerHudActiveGfxCacheApplyAt,
  playerHudActiveGfxCachePlan,
  playerHudActiveIdCacheChanged,
  playerHudActiveImageSpByteOffset,
  playerHudActiveItemPathKind,
  playerHudActiveItemPathPlan,
  playerHudActiveItemPathVa,
  playerHudActiveLoadImageCall,
  playerHudActiveLoadImagePrep,
  playerHudActiveSlotCountdownTick,
  playerHudActiveSlotDwordIndex,
  playerHudActiveSpClearArg,
  playerHudActiveSpSavedEbpOff,
  playerHudBookDirtyAfterGfx,
  playerHudBookImageSpByteOffset,
  playerHudBookLoadImageCall,
  playerHudBookLoadImageResultEbpOff,
  playerHudBookLoadImageResultObjEbpOff,
  playerHudBookMaterializeObjEbpOff,
  playerHudBookMaterializeSehTryLevel,
  playerHudBookMaterializeThisEbpOff,
  playerHudBookOverlayCacheChanged,
  playerHudBookOverlayPathKind,
  playerHudBookOverlayPathVa,
  playerHudBookSpClearArg,
  playerHudCachedActiveIdByteOffset,
  playerHudCachedBookOverlayByteOffset,
  playerHudCachedPocketIdByteOffset,
  playerHudCachedPocketTypeByteOffset,
  playerHudCachedTrinketIdByteOffset,
  playerHudCachedTrinketSecondaryByteOffset,
  playerHudConfigGfxStringIsSso,
  playerHudCriticalHeartBlink,
  playerHudDirtyFlagEbpOff,
  playerHudEntryClearHeartByte1,
  playerHudGetHealthType,
  playerHudHeartPathAt,
  playerHudHostVaSpMaterialize,
  playerHudItemConfigGfxCapacityByteOffset,
  playerHudItemConfigGfxStringByteOffset,
  playerHudItemConfigResolve,
  playerHudLoadImagePathBufferEbpOff,
  playerHudLoadImageResultEbpOff,
  playerHudLoadImageResultObjEbpOff,
  playerHudMaterializeObjEbpOff,
  playerHudMaterializeSehTryLevel,
  playerHudMaterializeThisEbpOff,
  playerHudPlayerPocketIdByteOffset,
  playerHudPlayerPocketTypeByteOffset,
  playerHudPlayerTrinketIdByteOffset,
  playerHudPlayerTrinketSecondaryByteOffset,
  playerHudPocketAnm2ByteOffset,
  playerHudPocketCacheApplyAt,
  playerHudPocketCacheChanged,
  playerHudPocketClampSlot,
  playerHudPocketGfxPlan,
  playerHudPocketPathKind,
  playerHudPocketResolvedId,
  playerHudPocketSlotCount,
  playerHudPocketSlotStride,
  playerHudSignedCeilHalf,
  playerHudSkipsActiveLoadImage,
  playerHudSpClearAllocOk,
  playerHudSpClearAllocSize,
  playerHudSpClearCallbackNeeded,
  playerHudSpClearObjectFinishApply,
  playerHudSpClearOldObjectPresent,
  playerHudSpClearPairApplyBase,
  playerHudSpClearVtable,
  playerHudSpPairSwap,
  playerHudTailCharCountdown,
  playerHudTailFloatStep,
  playerHudTrampSuppressesCriticalBlink,
  playerHudTrinketApply0x4bRemask,
  playerHudTrinketCacheApplyAt,
  playerHudTrinketCacheChanged,
  playerHudTrinketDirtyAfterGfx,
  playerHudTrinketGfxPlan,
  playerHudTrinketImageSpByteOffset,
  playerHudTrinketLoadImageResultEbpOff,
  playerHudTrinketLoadImageResultObjEbpOff,
  playerHudTrinketMaskId,
  playerHudTrinketNeedsRoomSeedProbe,
  playerHudTrinketSecondaryId,
  playerHudTrinketSehTryLevel,
  playerHudTrinketSlotCount,
  playerHudUpdateHeartsCallPlan,
  playerHudUpdateHeartsPure,
  playerHudUpdateHeartsUsesTwin,
  PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
  PLAYERHUD_UPDATE_HEARTS_ARG_TWIN,
  PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS,
  PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF,
  PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
  PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF,
  PLAYERHUD_P5_CHAR_TYPE_MATCH,
  PLAYERHUD_P5_WALK_STRIDE,
  PLAYERHUD_P5_ELEM_STRIDE,
  PLAYERHUD_P5_NODE_ALLOC_SIZE,
  PLAYERHUD_P5_NODE_FLAG_WORD,
  PLAYERHUD_P5_OFF_SLOT_BASE_1E00,
  PLAYERHUD_P5_HOST_VA_ALLOC,
  PLAYERHUD_P5_HOST_VA_PUSH_GROW,
  PLAYERHUD_P5_SKIP_VA_DISABLED,
  PLAYERHUD_P5_SKIP_VA_WRONG_CHAR,
  playerhudP5BlockNeeded,
  playerhudP5SkipVa,
  playerhudP5NodeFlagWord,
  playerhudP5NodeSelfPtr,
  playerhudP5WalkTerminates,
  playerhudP5WalkSteps,
  playerhudP5SlotNeedsInsert,
  playerhudP5SlotByteOffset,
  playerhudP5PushNeedsGrow,
  playerhudP5PushAdvance,
  PLAYERHUD_P6_SLOT_COUNT,
  PLAYERHUD_P6_SLOT_BASE,
  PLAYERHUD_P6_SLOT_STRIDE,
  PLAYERHUD_P6_ARRAY_PTR_OFF,
  PLAYERHUD_P6_ARRAY_STRIDE_DWORDS,
  PLAYERHUD_P6_ARRAY_ID_ELEM,
  PLAYERHUD_P6_ENTRY_TYPE_BLOCK,
  PLAYERHUD_P6_RESULT_BYTE_D_OFF,
  PLAYERHUD_P6_RESULT_WORD_4_OFF,
  PLAYERHUD_P6_RESULT_COPY_OFF,
  PLAYERHUD_P6_CONFIG_STRING_OFF,
  PLAYERHUD_P6_CONFIG_CAPACITY_OFF,
  PLAYERHUD_P6_CONFIG_SSO_THRESHOLD,
  PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP,
  PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT,
  PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG,
  PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG,
  PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG,
  PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER,
  PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF,
  PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF,
  PLAYERHUD_P6_LIST_HEAD_EBP_OFF,
  PLAYERHUD_P6_RESULT_VALUE_EBP_OFF,
  PLAYERHUD_P6_RESULT_ELEM_EBP_OFF,
  PLAYERHUD_P6_RESULT_VIRTUAL_EBP_OFF,
  PLAYERHUD_P6_NEG_VALUE_EBP_OFF,
  PLAYERHUD_P6_NEG_ELEM_EBP_OFF,
  PLAYERHUD_P6_NEG_VIRTUAL_EBP_OFF,
  PLAYERHUD_P6_CONFIG_VALUE_EBP_OFF,
  PLAYERHUD_P6_CONFIG_ELEM_EBP_OFF,
  PLAYERHUD_P6_CONFIG_VIRTUAL_EBP_OFF,
  PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF,
  PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF,
  PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF,
  PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF,
  PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF,
  PLAYERHUD_P6_HOST_VA_BUILD_NODE,
  PLAYERHUD_P6_HOST_VA_NODE_REMOVE,
  PLAYERHUD_P6_HOST_VA_FREE,
  PLAYERHUD_P6_GLOBAL_CALLBACK,
  PLAYERHUD_P7_GAME_GATE_OFF,
  PLAYERHUD_P7_GAME_GATE_VALUE,
  PLAYERHUD_P7_VEC_BEGIN_OFF,
  PLAYERHUD_P7_VEC_END_OFF,
  PLAYERHUD_P7_VEC_STRIDE,
  playerhudPocketUpgradeSlotCount,
  playerhudPocketUpgradeSlotByteOffset,
  playerhudPocketUpgradeSlotIsUpgrade,
  playerhudPocketUpgradeArrayPtrByteOffset,
  playerhudPocketUpgradeArrayElementDwordIndex,
  playerhudPocketUpgradeArrayIdByteOffset,
  playerhudPocketUpgradeResolveKind,
  playerhudPocketUpgradeResolveIndex,
  playerhudPocketUpgradeEntryUsable,
  playerhudPocketUpgradeTakeResultValue,
  playerhudPocketUpgradeBranchKind,
  playerhudPocketUpgradeInsertValue,
  playerhudPocketUpgradeConfigPathPtr,
  playerhudPocketUpgradeGlobalCallbackNeeded,
  playerhudPocketUpgradeResultFollowupNeeded,
  playerhudPocketUpgradeResultCopyByteOffset,
  playerhudPocketUpgradeBuildNodeResultEbpOff,
  playerhudPocketUpgradeBuildNodeObjEbpOff,
  playerhudPocketUpgradeListHeadEbpOff,
  playerhudPocketUpgradeValueEbpOff,
  playerhudPocketUpgradeElemEbpOff,
  playerhudPocketUpgradeVirtualEbpOff,
  playerhudPocketUpgradeGlobalArgEbpOff,
  playerhudPocketUpgradeSehFirst,
  playerhudPocketUpgradeSehCount,
  playerhudPocketUpgradeCallbackCount,
  playerhudPocketUpgradeConfigLoadImageResultEbpOff,
  playerhudPocketUpgradeConfigElem2EbpOff,
  playerhudPocketUpgradeConfigValue2EbpOff,
  playerhudPocketUpgradeConfigVirtual2EbpOff,
  playerhudPocketUpgradeConfigVirtual3EbpOff,
  playerhudPocketUpgradeConfigCapacityByteOffset,
  playerhudHostVaPocketUpgradeBuildNode,
  playerhudHostVaPocketUpgradeNodeRemove,
  playerhudHostVaFree,
  playerhudPocketUpgradePlan,
  playerhudPocketSecondListGate,
  playerhudPocketSecondListCount,
  playerhudPocketSecondListIterationNeeded,
  playerhudPocketSecondListEntryUsable,
  playerhudPocketSecondListVecBeginByteOffset,
  playerhudPocketSecondListVecEndByteOffset,

  /* ABI v14/v15 tail exports. */
  playerhudPocketListClearNeeded,
  playerhudPocketListClearPlan,
  playerhudP5WalkClearNeeded,
  playerhudP5WalkClearPlan,
  playerhudTailEnableStoreClearValue,
  playerhudTailRebuildGate,
  playerhudTailRebuildPathKind,
  playerhudTailConfigStringData,
  playerhudTailRebuildPlan,
  playerhudTailPredicateCallArgs,
  playerhudTailDirtyNotifyNeeded,
  playerhudTailDirtyNotifyCallArgs,


  /* ABI v14/v15 tail constants. */
  PLAYERHUD_POCKET_LIST_CLEAR_KIND_P6,
  PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7,
  PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF,
  PLAYERHUD_LIST_CLEAR_NODE_SP_OFF,
  PLAYERHUD_LIST_CLEAR_SP_ARG,
  PLAYERHUD_LIST_CLEAR_SEH_LEVEL,
  PLAYERHUD_LIST_CLEAR_FREE_SIZE,
  PLAYERHUD_WALK_CLEAR_NODE_SP_OFF,
  PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF,
  PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF,
  PLAYERHUD_TAIL_ENABLE_BYTE_OFF,
  PLAYERHUD_TAIL_REBUILD_BYTE_OFF,
  PLAYERHUD_TAIL_ANM2_SP_OFF,
  PLAYERHUD_TAIL_COLLECTIBLE_ID_OFF,
  PLAYERHUD_TAIL_GET_COLLECTIBLE_THIS_OFF,
  PLAYERHUD_TAIL_PROBE_MASK,
  PLAYERHUD_TAIL_PATH_FIXED,
  PLAYERHUD_TAIL_PATH_CONFIG,
  PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF,
  PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF,
  PLAYERHUD_TAIL_SEH_FIXED,
  PLAYERHUD_TAIL_SEH_CONFIG,
  PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH,
  PLAYERHUD_TAIL_PREDICATE_TYPE,
  PLAYERHUD_TAIL_PREDICATE_ARG1_OFF,
  PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF,
  PLAYERHUD_TAIL_DIRTY_ARG,
  PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY,
  PLAYERHUD_TAIL_HOST_VA_ADVANCE,
  PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN,
  PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR,
  PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR,
  PLAYERHUD_TAIL_HOST_VA_PROBE,
  PLAYERHUD_TAIL_HOST_VA_TEMP_TEARDOWN,
  PLAYERHUD_TAIL_HOST_VA_PREDICATE,
  PLAYERHUD_TAIL_FIXED_PATH_VA,
  PLAYERHUD_P7_LIST_HEAD_EBP_OFF,
  PLAYERHUD_P5_OFF_LIST_HEAD_6A0,
  PLAYERHUD_P5_OFF_LIST_END_6A4,
  PLAYERHUD_F32_STEP_0_25_BITS,
  PLAYERHUD_F32_ZERO_BITS,
  PLAYERHUD_F32_ONE_BITS,

  /* ABI v18: StatHUD progress-slot tween. */
  PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW,
  PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW,
  PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR,
  PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK,
  playerHudStatBarTween,

  /* ABI v19: 6-slot StatHUD progress updater. */
  PLAYERHUD_84E9D0_SLOT_COUNT,
  PLAYERHUD_84E9D0_SLOT_STRIDE,
  PLAYERHUD_84E9D0_SLOTS_BASE,
  PLAYERHUD_84E9D0_PLAYER_PTR_OFF,
  PLAYERHUD_84E9D0_PLAYER_1568,
  PLAYERHUD_84E9D0_PLAYER_1460,
  PLAYERHUD_84E9D0_PLAYER_1470,
  PLAYERHUD_84E9D0_PLAYER_1480,
  PLAYERHUD_84E9D0_PLAYER_1464,
  PLAYERHUD_84E9D0_PLAYER_156C,
  PLAYERHUD_84E9D0_RDATA_30F,
  PLAYERHUD_84E9D0_RDATA_1F,
  PLAYERHUD_84E9D0_RDATA_40F,
  playerHud84e9d0Update,

  /* ABI v32: RecomputeStats 0x84ca00 mask-dispatch laws. */
  PLAYERHUD_84CA00_VA,
  PLAYERHUD_84CA00_RET_VA,
  PLAYERHUD_84CA00_SLOT_COUNT,
  PLAYERHUD_84CA00_SLOT_STRIDE,
  PLAYERHUD_84CA00_SLOT_BASE_118,
  PLAYERHUD_84CA00_PLAYER_STRIDE,
  PLAYERHUD_84CA00_ENTRY_PTR_OFF,
  PLAYERHUD_84CA00_ENTRY_FRAME_OFF,
  PLAYERHUD_84CA00_GAME_FRAME_OFF,
  PLAYERHUD_84CA00_MODE_BYTE_OFF,
  PLAYERHUD_84CA00_GAME_1ADB4_OFF,
  PLAYERHUD_84CA00_ENTRY_1568,
  PLAYERHUD_84CA00_ENTRY_1460,
  PLAYERHUD_84CA00_ENTRY_1470,
  PLAYERHUD_84CA00_ENTRY_1480,
  PLAYERHUD_84CA00_ENTRY_1464,
  PLAYERHUD_84CA00_ENTRY_156C,
  PLAYERHUD_84CA00_RDATA_30F,
  PLAYERHUD_84CA00_RDATA_1F,
  PLAYERHUD_84CA00_RDATA_40F,
  PLAYERHUD_84CA00_RDATA_100F,
  PLAYERHUD_84CA00_RDATA_ZERO,
  PLAYERHUD_84CA00_HOST_VA_PROBE1,
  PLAYERHUD_84CA00_HOST_VA_PROBE2,
  PLAYERHUD_84CA00_HOST_VA_PROBE3,
  PLAYERHUD_84CA00_PURE_VA_TWEEN,
  playerHud84ca00Flag,
  playerHud84ca00Clamp,
  playerHud84ca00SlotActive,
  playerHud84ca00SlotTarget,

  /* ABI v33: per-player StatHUD stats-pack updater 0x84cc40 gate/plan. */
  PLAYERHUD_84CC40_VA,
  PLAYERHUD_84CC40_RET_VA,
  PLAYERHUD_84CC40_NEXT_VA,
  PLAYERHUD_84CC40_BLOCK_COUNT,
  PLAYERHUD_84CC40_BLOCK_STRIDE,
  PLAYERHUD_84CC40_BLOCK_PLAYER_OFF,
  PLAYERHUD_84CC40_SLOT_BASE_OFF,
  PLAYERHUD_84CC40_SLOT_COUNT,
  PLAYERHUD_84CC40_SLOT_STRIDE,
  PLAYERHUD_84CC40_MODE_BYTE_OFF,
  PLAYERHUD_84CC40_RECOMPUTE_HOST_VA,
  PLAYERHUD_84CC40_RECOMPUTE_MASK,
  playerHud84cc40BlockKind,
  playerHud84cc40UpdateNeeded,
  playerHud84cc40PathFlag,
  playerHud84cc40RecomputePlan,

  /* ABI v20: action-id string select. */
  PLAYERHUD_84D740_ACTION_COUNT,
  PLAYERHUD_84D740_ACTION_MAX,
  PLAYERHUD_84D740_JUMP_TABLE_VA,
  PLAYERHUD_84D740_DEFAULT_STRING_VA,
  PLAYERHUD_84D740_LOG_FMT_VA,
  PLAYERHUD_84D740_LOG_LEVEL,
  PLAYERHUD_HOST_VA_LOG,
  PLAYERHUD_84D740_STRING_VAS,
  playerHud84d740StringVa,
  playerHud84d740NeedsLog,
  playerHud84d740Plan,

  /* ABI v21: 2-segment SSE intersect. */
  PLAYERHUD_84D8B0_RDATA_EPS,
  PLAYERHUD_84D8B0_RDATA_ABS,
  PLAYERHUD_84D8B0_RDATA_NEG,
  PLAYERHUD_84D8B0_RDATA_ONE,
  PLAYERHUD_84D8B0_EPS_F64_LO,
  PLAYERHUD_84D8B0_EPS_F64_HI,
  PLAYERHUD_84D8B0_ONE_BITS,
  playerHud84d8b0Intersect,

  /* ABI v22: SSO-string + zero-tail init. */
  PLAYERHUD_84DA20_OBJECT_SIZE,
  PLAYERHUD_84DA20_SSO_SIZE_OFF,
  PLAYERHUD_84DA20_SSO_CAP_OFF,
  PLAYERHUD_84DA20_SSO_CAPACITY,
  PLAYERHUD_84DA20_TAIL_BEGIN,
  PLAYERHUD_84DA20_TAIL_LAST,
  PLAYERHUD_84DA20_RET_VA,
  PLAYERHUD_84DA20_NEXT_VA,
  playerHud84da20Init,
  playerHud84da20WritesDword,
  playerHud84da20NextVa,

  /* ABI v23: SEH ctor prefix stores. */
  PLAYERHUD_84DAD0_OBJECT_SIZE,
  PLAYERHUD_84DAD0_SSO_OFF,
  PLAYERHUD_84DAD0_SSO_SIZE_OFF,
  PLAYERHUD_84DAD0_SSO_CAP_OFF,
  PLAYERHUD_84DAD0_SSO_CAPACITY,
  PLAYERHUD_84DAD0_TAIL_BEGIN,
  PLAYERHUD_84DAD0_TAIL_LAST,
  PLAYERHUD_84DAD0_FLAG_BYTE_OFF,
  PLAYERHUD_84DAD0_HOST_THIS_OFF,
  PLAYERHUD_84DAD0_HOST_VA,
  PLAYERHUD_84DAD0_RET_VA,
  PLAYERHUD_84DAD0_NEXT_VA,
  playerHud84dad0Init,
  playerHud84dad0WritesDword,
  playerHud84dad0WritesByte,
  playerHud84dad0HostVa,
  playerHud84dad0HostThisOff,
  playerHud84dad0NextVa,

  /* ABI v24: 4-subobject dtor host plan. */
  PLAYERHUD_84DB90_VA,
  PLAYERHUD_84DB90_TAIL_VA,
  PLAYERHUD_84DB90_CALL_COUNT,
  PLAYERHUD_84DB90_SUB_COUNT,
  PLAYERHUD_84DB90_SUB_STRIDE,
  PLAYERHUD_84DB90_THIS_OFFS,
  PLAYERHUD_84DB90_HOST_VA_SUB,
  PLAYERHUD_84DB90_HOST_VA_STRING,
  PLAYERHUD_84DB90_NEXT_VA,
  playerHud84db90Plan,
  playerHud84db90CallCount,
  playerHud84db90ThisOffAt,
  playerHud84db90HostVaAt,
  playerHud84db90IsTailJmp,
  playerHud84db90NextVa,

  /* ABI v25: 7-subobject dtor host plan. */
  PLAYERHUD_84DBC0_VA,
  PLAYERHUD_84DBC0_TAIL_VA,
  PLAYERHUD_84DBC0_CALL_COUNT,
  PLAYERHUD_84DBC0_SUB_COUNT,
  PLAYERHUD_84DBC0_SUB_STRIDE,
  PLAYERHUD_84DBC0_THIS_OFFS,
  PLAYERHUD_84DBC0_HOST_VA_SUB,
  PLAYERHUD_84DBC0_HOST_VA_STRING,
  PLAYERHUD_84DBC0_NEXT_VA,
  playerHud84dbc0Plan,
  playerHud84dbc0CallCount,
  playerHud84dbc0ThisOffAt,
  playerHud84dbc0HostVaAt,
  playerHud84dbc0IsTailJmp,
  playerHud84dbc0NextVa,

  /* ABI v26: range wipe host plan. */
  PLAYERHUD_856840_VA,
  PLAYERHUD_856840_RET_VA,
  PLAYERHUD_856840_CALL_COUNT,
  PLAYERHUD_856840_STRIDE,
  PLAYERHUD_856840_THIS_OFFS,
  PLAYERHUD_856840_HOST_VA_SUB,
  PLAYERHUD_856840_HOST_VA_STRING,
  PLAYERHUD_856840_NEXT_VA,
  playerHud856840Needed,
  playerHud856840Count,
  playerHud856840Plan,
  playerHud856840CallCount,
  playerHud856840ThisOffAt,
  playerHud856840HostVaAt,
  playerHud856840Stride,
  playerHud856840NextVa,

  /* ABI v27: FUN_0084dea0 / FUN_0084e200 GATE/PLAN. */
  PLAYERHUD_84DEA0_VA,
  PLAYERHUD_84DEA0_RET_VA,
  PLAYERHUD_84DEA0_CALL_COUNT,
  PLAYERHUD_84DEA0_GATE_OFF,
  PLAYERHUD_84DEA0_HOST_VA,
  PLAYERHUD_84DEA0_PLAYER_PTR_OFF,
  PLAYERHUD_84DEA0_SLOT_COUNT,
  PLAYERHUD_84DEA0_SLOT_STRIDE,
  PLAYERHUD_84DEA0_NEXT_VA,
  PLAYERHUD_84DEA0_XMM1_OFFS,
  PLAYERHUD_84DEA0_LABEL_VAS,
  PLAYERHUD_84DEA0_LABEL_SIZES,
  PLAYERHUD_84E200_VA,
  PLAYERHUD_84E200_RET_VA,
  PLAYERHUD_84E200_NEXT_VA,
  PLAYERHUD_84E200_RDATA_NEG,
  PLAYERHUD_84E200_XORPS,
  playerHud84dea0Needed,
  playerHud84dea0Plan,
  playerHud84dea0CallCount,
  playerHud84dea0Xmm1OffAt,
  playerHud84dea0LabelVaAt,
  playerHud84dea0LabelSizeAt,
  playerHud84dea0HostVa,
  playerHud84dea0NextVa,
  playerHud84e200XorpsNeeded,
  playerHud84e200NextVa,

  /* ABI v28: FUN_0084e5b0 predicate GATE/PLAN + pure islands. */
  PLAYERHUD_84E5B0_VA,
  PLAYERHUD_84E5B0_RET_VA,
  PLAYERHUD_84E5B0_STRIDE,
  PLAYERHUD_84E5B0_VEC_BEGIN_OFF,
  PLAYERHUD_84E5B0_VEC_END_OFF,
  PLAYERHUD_84E5B0_GATE_OFF,
  PLAYERHUD_84E5B0_PLAYER_TYPE_OFF,
  PLAYERHUD_84E5B0_VEC_OFFS,
  PLAYERHUD_84E5B0_VEC_COUNT,
  PLAYERHUD_84E5B0_COMPLETION_OFF,
  PLAYERHUD_84E5B0_MODE_OFF,
  PLAYERHUD_84E5B0_HOST_VA_COL,
  PLAYERHUD_84E5B0_HOST_VA_TRK,
  PLAYERHUD_84E5B0_FLAG_SHR_MODE1,
  PLAYERHUD_84E5B0_FLAG_SHR_MODE2,
  PLAYERHUD_84E5B0_COMPLETION_MAX,
  PLAYERHUD_84E5B0_COMPLETION_NEG2,
  PLAYERHUD_84E5B0_PREFIX_FAIL,
  PLAYERHUD_84E5B0_PREFIX_EARLY,
  PLAYERHUD_84E5B0_PREFIX_CONT,
  PLAYERHUD_84E5B0_NEXT_VA,
  playerHud84e5b0Count,
  playerHud84e5b0InRange,
  playerHud84e5b0EarlyTrue,
  playerHud84e5b0Prefix,
  playerHud84e5b0ObjectOff,
  playerHud84e5b0DwordCount,
  playerHud84e5b0WhitelistOk,
  playerHud84e5b0BlacklistOk,
  playerHud84e5b0CompletionPrefix,
  playerHud84e5b0ModeOk,
  playerHud84e5b0Decide,
  playerHud84e5b0Plan,
  playerHud84e5b0VecOffAt,
  playerHud84e5b0HostVaAt,
  playerHud84e5b0FailIfAlAt,
  playerHud84e5b0Stride,
  playerHud84e5b0NextVa,

  /* ABI v29: FUN_0084e820 counter GATE/PLAN + pure islands. */
  PLAYERHUD_84E820_VA,
  PLAYERHUD_84E820_RET_VA,
  PLAYERHUD_84E820_STRIDE,
  PLAYERHUD_84E820_GATE_OFF,
  PLAYERHUD_84E820_VEC_BEGIN_OFF,
  PLAYERHUD_84E820_VEC_END_OFF,
  PLAYERHUD_84E820_EXTRA_BEGIN_OFF,
  PLAYERHUD_84E820_EXTRA_END_OFF,
  PLAYERHUD_84E820_GAME_BEGIN_OFF,
  PLAYERHUD_84E820_GAME_END_OFF,
  PLAYERHUD_84E820_RANGE_LO_OFF,
  PLAYERHUD_84E820_RANGE_HI_OFF,
  PLAYERHUD_84E820_SPECIAL_KIND,
  PLAYERHUD_84E820_CHAR_MODE0_A,
  PLAYERHUD_84E820_CHAR_MODE0_B,
  PLAYERHUD_84E820_CHAR_MODE1,
  PLAYERHUD_84E820_HOST_VA_MODE0,
  PLAYERHUD_84E820_HOST_VA_MODE1,
  PLAYERHUD_84E820_HOST_VA_PRED,
  PLAYERHUD_84E820_NEXT_VA,
  playerHud84e820GateZero,
  playerHud84e820Count,
  playerHud84e820PtrCount,
  playerHud84e820InRange,
  playerHud84e820LoopCont,
  playerHud84e820RangeEmpty,
  playerHud84e820SpecialOk,
  playerHud84e820AlHit,
  playerHud84e820EntryInc,
  playerHud84e820ExtraSum,
  playerHud84e820Decide,
  playerHud84e820Plan,
  playerHud84e820HostVaAt,
  playerHud84e820Stride,
  playerHud84e820NextVa,

  /* ABI v30: FUN_008568a0 0x68-object copy-ctor typed host plan. */
  PLAYERHUD_8568A0_VA,
  PLAYERHUD_8568A0_RET_VA,
  PLAYERHUD_8568A0_CALL_COUNT,
  PLAYERHUD_8568A0_HOST_VA_STRING,
  PLAYERHUD_8568A0_HOST_VA_SUB,
  PLAYERHUD_8568A0_THIS_OFFS,
  PLAYERHUD_8568A0_TAIL_BEGIN_OFF,
  PLAYERHUD_8568A0_TAIL_DWORD_COUNT,
  PLAYERHUD_8568A0_OBJECT_SIZE,
  PLAYERHUD_8568A0_NEXT_VA,
  playerHud8568a0Plan,
  playerHud8568a0CallCount,
  playerHud8568a0ThisOffAt,
  playerHud8568a0ArgOffAt,
  playerHud8568a0HostVaAt,
  playerHud8568a0TailBeginOff,
  playerHud8568a0TailDwordCount,
  playerHud8568a0ObjectSize,
  playerHud8568a0NextVa,
  playerHud8568a0TailCopy,

  /* ABI v31: FUN_00856960 range move-ctor + FUN_00856e10 move-ctor. */
  PLAYERHUD_856960_VA,
  PLAYERHUD_856960_RET_VA,
  PLAYERHUD_856960_STRIDE,
  PLAYERHUD_856960_MOVE_CTOR_VA,
  PLAYERHUD_856960_WIPE_VA,
  PLAYERHUD_856960_NEXT_VA,
  PLAYERHUD_856E10_VA,
  PLAYERHUD_856E10_RET_VA,
  PLAYERHUD_856E10_NEXT_VA,
  PLAYERHUD_856E10_OBJECT_SIZE,
  PLAYERHUD_856E10_SSO_CAPACITY,
  PLAYERHUD_856E10_SSO_SIZE_OFF,
  PLAYERHUD_856E10_SSO_CAP_OFF,
  PLAYERHUD_856E10_VEC_TRIPLE_COUNT,
  PLAYERHUD_856E10_VEC_TRIPLE_STRIDE,
  PLAYERHUD_856E10_VEC_BEGIN_OFF,
  PLAYERHUD_856E10_VEC_END_OFF,
  PLAYERHUD_856E10_TAIL_BEGIN_OFF,
  PLAYERHUD_856E10_TAIL_DWORD_COUNT,
  playerHud856960Needed,
  playerHud856960Count,
  playerHud856960Stride,
  playerHud856960MoveCtorVa,
  playerHud856960WipeVa,
  playerHud856960NextVa,
  playerHud856960MoveRange,
  playerHud856e10MoveCtor,
  playerHud856e10ObjectSize,
  playerHud856e10NextVa,
  PLAYERHUD_856F50_VA,
  PLAYERHUD_856F50_RET_VA,
  PLAYERHUD_856F50_NEXT_VA,
  PLAYERHUD_856F50_FIELD_OFF,
  playerHud856f50Gate,
  playerHud856f50FieldOff,
  playerHud856f50Va,
  playerHud856f50RetVa,
  playerHud856f50NextVa,
  PLAYERHUD_85AF30_VA,
  PLAYERHUD_85AF30_RET_VA,
  PLAYERHUD_85AF30_NEXT_VA,
  PLAYERHUD_85AF30_OBJECT_SIZE,
  PLAYERHUD_85AF30_PACK_DWORD_COUNT,
  PLAYERHUD_85AF30_FLAG_BYTE,
  PLAYERHUD_85AF30_REM100_OFF,
  PLAYERHUD_85AF30_Q100_MINUS1_OFF,
  PLAYERHUD_85AF30_Q10000_MINUS1900_OFF,
  PLAYERHUD_85AF30_DIV10000_MAGIC,
  PLAYERHUD_85AF30_DIV10000_SHIFT,
  PLAYERHUD_85AF30_DIV100_MAGIC,
  PLAYERHUD_85AF30_DIV100_SHIFT,
  PLAYERHUD_85AF30_YEAR_BASE,
  playerHud85af30Pack,
  playerHud85af30Div10000,
  playerHud85af30Rem100,
  playerHud85af30Q100Minus1,
  playerHud85af30Q10000Minus1900,
  playerHud85af30Va,
  playerHud85af30RetVa,
  playerHud85af30NextVa,
  playerHud85af30ObjectSize,
  PLAYERHUD_858870_VA,
  PLAYERHUD_858870_RET_VA,
  PLAYERHUD_858870_NEXT_VA,
  PLAYERHUD_858870_ST_VA,
  PLAYERHUD_858870_ND_VA,
  PLAYERHUD_858870_RD_VA,
  PLAYERHUD_858870_TH_VA,
  PLAYERHUD_858870_DIV100_MAGIC,
  PLAYERHUD_858870_DIV100_SHIFT,
  PLAYERHUD_858870_DIV10_MAGIC,
  PLAYERHUD_858870_DIV10_SHIFT,
  PLAYERHUD_858870_CALLER1_VA,
  PLAYERHUD_858870_CALLER2_VA,
  playerHud858870OrdinalSuffixVa,
  playerHud858870Rem100,
  playerHud858870Rem10,
  playerHud858870Va,
  playerHud858870RetVa,
  playerHud858870NextVa,
  PLAYERHUD_857400_VA,
  PLAYERHUD_857400_RET_VA,
  PLAYERHUD_857400_NEXT_VA,
  PLAYERHUD_857400_KIND_MAX,
  PLAYERHUD_857400_ENTRY_COUNT,
  PLAYERHUD_857400_SLOT_BASE,
  PLAYERHUD_857400_SLOT_STRIDE,
  PLAYERHUD_857400_JUMP_TABLE_VA,
  PLAYERHUD_857400_JUMP_TABLE_TARGETS,
  PLAYERHUD_857400_LOG_FMT_VA,
  PLAYERHUD_857400_LOG_LEVEL,
  PLAYERHUD_857400_CALLER1_VA,
  PLAYERHUD_857400_CALLER2_VA,
  PLAYERHUD_857400_CALLER3_VA,
  PLAYERHUD_857400_CALLER4_VA,
  PLAYERHUD_857400_CALLER5_VA,
  PLAYERHUD_857400_CALLER6_VA,
  PLAYERHUD_857400_CALLER7_VA,
  PLAYERHUD_857400_CALLER8_VA,
  PLAYERHUD_857400_CALLER9_VA,
  playerHud857400SlotByteOffset,
  playerHud857400Entry,
  playerHud857400NeedsLog,
  playerHud857400Plan,
  playerHud857400Va,
  playerHud857400RetVa,
  playerHud857400NextVa,
  PLAYERHUD_85E360_VA,
  PLAYERHUD_85E360_RET_VA,
  PLAYERHUD_85E360_NEXT_VA,
  PLAYERHUD_85E360_FIELD_OFF,
  PLAYERHUD_85E360_CALLER1_VA,
  PLAYERHUD_85E360_CALLER2_VA,
  PLAYERHUD_85E360_CALLER3_VA,
  PLAYERHUD_85E360_CALLER4_VA,
  PLAYERHUD_85E360_CALLER5_VA,
  PLAYERHUD_85E360_CALLER6_VA,
  playerHud85e360Float,
  playerHud85e360FieldOff,
  playerHud85e360Va,
  playerHud85e360RetVa,
  playerHud85e360NextVa,
  PLAYERHUD_9BFC00_VA,
  PLAYERHUD_9BFC00_RET_VA,
  PLAYERHUD_9BFC00_NEXT_VA,
  PLAYERHUD_9BFC00_CALLER1_VA,
  PLAYERHUD_9BFC20_VA,
  PLAYERHUD_9BFC20_RET_VA,
  PLAYERHUD_9BFC20_NEXT_VA,
  PLAYERHUD_9BFC20_CALLER1_VA,
  PLAYERHUD_9BFC40_VA,
  PLAYERHUD_9BFC40_RET_VA,
  PLAYERHUD_9BFC40_NEXT_VA,
  PLAYERHUD_9BFC40_CALLER1_VA,
  PLAYERHUD_9BFC40_HOST_VA_POWF,
  PLAYERHUD_9BFC80_VA,
  PLAYERHUD_9BFC80_RET_VA,
  PLAYERHUD_9BFC80_NEXT_VA,
  PLAYERHUD_9BFC80_CALLER1_VA,
  PLAYERHUD_9BFCD0_VA,
  PLAYERHUD_9BFCD0_RET_VA,
  PLAYERHUD_9BFCD0_NEXT_VA,
  PLAYERHUD_9BFCD0_CALLER1_VA,
  PLAYERHUD_9BFD00_VA,
  PLAYERHUD_9BFD00_RET_VA,
  PLAYERHUD_9BFD00_NEXT_VA,
  PLAYERHUD_9BFD00_CALLER1_VA,
  PLAYERHUD_9BFD20_VA,
  PLAYERHUD_9BFD20_RET_VA,
  PLAYERHUD_9BFD20_NEXT_VA,
  PLAYERHUD_9BFD20_CALLER1_VA,
  /* v40: 0x9c0120 / 0x9c0170 lerp visitors */
  PLAYERHUD_9C0120_VA,
  PLAYERHUD_9C0120_RET_VA,
  PLAYERHUD_9C0120_NEXT_VA,
  PLAYERHUD_9C0120_VTABLE_REF_RDATA,
  PLAYERHUD_9C0120_PROBE_SLOT,
  PLAYERHUD_9C0120_PROBE_VTBL_OFF,
  PLAYERHUD_9C0120_A_OFF,
  PLAYERHUD_9C0120_B_OFF,
  PLAYERHUD_CLAMP_LO_RDATA,
  PLAYERHUD_CLAMP_HI_RDATA,
  PLAYERHUD_CLAMP_ZERO_BITS,
  PLAYERHUD_CLAMP_ONE_BITS,
  PLAYERHUD_9C0170_VA,
  PLAYERHUD_9C0170_RET_VA,
  PLAYERHUD_9C0170_NEXT_VA,
  PLAYERHUD_9C0170_VTABLE_REF_RDATA,
  PLAYERHUD_9C0170_RET_IMM,
  PLAYERHUD_9C0170_A_OFF,
  PLAYERHUD_9C0170_B_OFF,
  PLAYERHUD_9C0170_C_OFF,
  PLAYERHUD_9C0170_D_OFF,
  playerHudBitsToF32,
  playerHudF32ToBits,
  playerHud9c0120Clamp01,
  playerHud9c0120Value,
  playerHud9c0170Pair,
  playerHud9c0120Va,
  playerHud9c0120RetVa,
  playerHud9c0120NextVa,
  playerHud9c0120VtableRefRdata,
  playerHud9c0120ProbeSlot,
  playerHud9c0120ProbeVtblOff,
  playerHud9c0120AOff,
  playerHud9c0120BOff,
  playerHudClampLoRdata,
  playerHudClampHiRdata,
  playerHudClampZeroBits,
  playerHudClampOneBits,
  playerHud9c0170Va,
  playerHud9c0170RetVa,
  playerHud9c0170NextVa,
  playerHud9c0170VtableRefRdata,
  playerHud9c0170RetImm,
  playerHud9c0170AOff,
  playerHud9c0170BOff,
  playerHud9c0170COff,
  playerHud9c0170DOff,
  /* v41: 0x9c06a0 probe-sum vec2 law */
  PLAYERHUD_9C06A0_VA,
  PLAYERHUD_9C06A0_RET_VA,
  PLAYERHUD_9C06A0_NEXT_VA,
  PLAYERHUD_9C06A0_RET_IMM,
  PLAYERHUD_9C06A0_CALLER1_VA,
  PLAYERHUD_9C06A0_CALLER2_VA,
  PLAYERHUD_9C06A0_OBJ1_OFF,
  PLAYERHUD_9C06A0_PROBE_SLOT,
  PLAYERHUD_9C06A0_PROBE_VTBL_OFF,
  PLAYERHUD_9C06A0_OBJ1_X_OFF,
  PLAYERHUD_9C06A0_OBJ1_Y_OFF,
  PLAYERHUD_9C06A0_THIS_B_OFF,
  PLAYERHUD_9C06A0_THIS_D_OFF,
  PLAYERHUD_9C06A0_OBJ2_OFF,
  PLAYERHUD_GLOBAL1_BSS,
  PLAYERHUD_GLOBAL2_BSS,
  PLAYERHUD_K1_RDATA,
  PLAYERHUD_K1_BITS,
  PLAYERHUD_K2_RDATA,
  PLAYERHUD_K2_BITS,
  playerHud9c06a0Law,
  playerHud9c06a0Va,
  playerHud9c06a0RetVa,
  playerHud9c06a0NextVa,
  playerHud9c06a0RetImm,
  playerHud9c06a0Caller1Va,
  playerHud9c06a0Caller2Va,
  playerHud9c06a0Obj1Off,
  playerHud9c06a0ProbeSlot,
  playerHud9c06a0ProbeVtblOff,
  playerHud9c06a0Obj1XOff,
  playerHud9c06a0Obj1YOff,
  playerHud9c06a0ThisBOff,
  playerHud9c06a0ThisDOff,
  playerHud9c06a0Obj2Off,
  playerHudGlobal1Bss,
  playerHudGlobal2Bss,
  playerHudK1Rdata,
  playerHudK1Bits,
  playerHudK2Rdata,
  playerHudK2Bits,
  /* v42: 0x9c2210 slot-index advance machine */
  PLAYERHUD_9C2210_VA,
  PLAYERHUD_9C2210_RET_VA,
  PLAYERHUD_9C2210_NEXT_VA,
  PLAYERHUD_9C2210_RET_IMM,
  PLAYERHUD_9C2210_INDEX_OFF,
  PLAYERHUD_9C2210_VEC_BEGIN_OFF,
  PLAYERHUD_9C2210_VEC_END_OFF,
  PLAYERHUD_9C2210_STRIDE,
  PLAYERHUD_9C2210_DIV_MAGIC,
  PLAYERHUD_9C2210_DIV_SHIFT,
  PLAYERHUD_9C2210_EMPTY_FLAG_OFF,
  PLAYERHUD_9C2210_EMPTY_FLAG_BITS,
  PLAYERHUD_9C2210_FAIL_INDEX,
  PLAYERHUD_9C2210_CALLER1_VA,
  PLAYERHUD_9C2210_CALLER2_VA,
  PLAYERHUD_9C2210_CALLER3_VA,
  PLAYERHUD_9C2210_CALLER4_VA,
  playerHud9c2210Advance,
  playerHud9c2210Count,
  playerHud9c2210Va,
  playerHud9c2210RetVa,
  playerHud9c2210NextVa,
  playerHud9c2210RetImm,
  playerHud9c2210IndexOff,
  playerHud9c2210VecBeginOff,
  playerHud9c2210VecEndOff,
  playerHud9c2210Stride,
  playerHud9c2210DivMagic,
  playerHud9c2210DivShift,
  playerHud9c2210EmptyFlagOff,
  playerHud9c2210EmptyFlagBits,
  playerHud9c2210Caller1Va,
  playerHud9c2210Caller2Va,
  playerHud9c2210Caller3Va,
  playerHud9c2210Caller4Va,
  /* v43: 0x9c0870 merged slot-search/clear */
  PLAYERHUD_9C0870_VA,
  PLAYERHUD_9C0870_RET_VA,
  PLAYERHUD_9C0870_RET_EXHAUST_VA,
  PLAYERHUD_9C0870_RET_CLEARED_VA,
  PLAYERHUD_9C0870_NEXT_VA,
  PLAYERHUD_9C0870_RET_IMM,
  PLAYERHUD_9C0870_INDEX_OFF,
  PLAYERHUD_9C0870_VEC_BEGIN_OFF,
  PLAYERHUD_9C0870_VEC_END_OFF,
  PLAYERHUD_9C0870_STRIDE,
  PLAYERHUD_9C0870_DIV_MAGIC,
  PLAYERHUD_9C0870_DIV_SHIFT,
  PLAYERHUD_9C0870_FLAG_A_OFF,
  PLAYERHUD_9C0870_FLAG_B_OFF,
  PLAYERHUD_9C0870_EMPTY_BITS,
  PLAYERHUD_9C0870_CALLER1_VA,
  PLAYERHUD_9C0870_CALLER2_VA,
  PLAYERHUD_9C0870_CALLER3_VA,
  PLAYERHUD_9C0870_CALLER4_VA,
  playerHud9c0870SearchClear,
  playerHud9c0870Va,
  playerHud9c0870RetVa,
  playerHud9c0870RetExhaustVa,
  playerHud9c0870RetClearedVa,
  playerHud9c0870NextVa,
  playerHud9c0870RetImm,
  playerHud9c0870IndexOff,
  playerHud9c0870VecBeginOff,
  playerHud9c0870VecEndOff,
  playerHud9c0870Stride,
  playerHud9c0870DivMagic,
  playerHud9c0870DivShift,
  playerHud9c0870FlagAOff,
  playerHud9c0870FlagBOff,
  playerHud9c0870EmptyBits,
  playerHud9c0870Caller1Va,
  playerHud9c0870Caller2Va,
  playerHud9c0870Caller3Va,
  playerHud9c0870Caller4Va,
  /* v44: 0x9c2370 probe-threshold gate */
  PLAYERHUD_9C2370_VA,
  PLAYERHUD_9C2370_RET_VA,
  PLAYERHUD_9C2370_NEXT_VA,
  PLAYERHUD_9C2370_PROBE_SLOT,
  PLAYERHUD_9C2370_PROBE_VTBL_OFF,
  PLAYERHUD_9C2370_VTABLE_REF_RDATA_A,
  PLAYERHUD_9C2370_VTABLE_REF_RDATA_B,
  PLAYERHUD_9C2370_GATE_RDATA,
  PLAYERHUD_9C2370_GATE_BITS,
  playerHud9c2370Gate,
  playerHud9c2370Va,
  playerHud9c2370RetVa,
  playerHud9c2370NextVa,
  playerHud9c2370ProbeSlot,
  playerHud9c2370ProbeVtblOff,
  playerHud9c2370VtableRefRdataA,
  playerHud9c2370VtableRefRdataB,
  playerHud9c2370GateRdata,
  playerHud9c2370GateBits,
  PLAYERHUD_9BFC_45F_BITS,
  PLAYERHUD_9BFC_2F_BITS,
  PLAYERHUD_9BFC_1F_BITS,
  PLAYERHUD_9BFC_30F_BITS,
  PLAYERHUD_9BFC_075F_BITS,
  PLAYERHUD_9BFC_2120F_BITS,
  PLAYERHUD_9BFC_13333F_BITS,
  PLAYERHUD_9BFC_04716F_BITS,
  PLAYERHUD_9BFC_17857F_BITS,
  PLAYERHUD_9BFC_04482F_BITS,
  PLAYERHUD_9BFC_NEG2F_BITS,
  PLAYERHUD_9BFC_10000F_BITS,
  PLAYERHUD_9BFC_230F_BITS,
  PLAYERHUD_9BFC_60F_BITS,
  playerHud9bfc00Law,
  playerHud9bfc20Law,
  playerHud9bfc40PowBase,
  playerHud9bfc40PowExpBits,
  playerHud9bfc40Law,
  playerHud9bfc80Gate,
  playerHud9bfc80PowBase,
  playerHud9bfc80PowExpBits,
  playerHud9bfc80Law,
  playerHud9bfcd0Gate,
  playerHud9bfcd0PowBase,
  playerHud9bfcd0PowExpBits,
  playerHud9bfcd0Law,
  playerHud9bfd00Law,
  playerHud9bfd20Law,
  playerHud9bfcHostVaPowf,
  playerHud9bfc00Va,
  playerHud9bfc00RetVa,
  playerHud9bfc00NextVa,
  playerHud9bfc00Caller1Va,
  playerHud9bfc20Va,
  playerHud9bfc20RetVa,
  playerHud9bfc20NextVa,
  playerHud9bfc20Caller1Va,
  playerHud9bfc40Va,
  playerHud9bfc40RetVa,
  playerHud9bfc40NextVa,
  playerHud9bfc40Caller1Va,
  playerHud9bfc80Va,
  playerHud9bfc80RetVa,
  playerHud9bfc80NextVa,
  playerHud9bfc80Caller1Va,
  playerHud9bfcd0Va,
  playerHud9bfcd0RetVa,
  playerHud9bfcd0NextVa,
  playerHud9bfcd0Caller1Va,
  playerHud9bfd00Va,
  playerHud9bfd00RetVa,
  playerHud9bfd00NextVa,
  playerHud9bfd00Caller1Va,
  playerHud9bfd20Va,
  playerHud9bfd20RetVa,
  playerHud9bfd20NextVa,
  playerHud9bfd20Caller1Va,
} from "../scripts/decomp/playerhud-post-update-pure-model.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = join(root, "native", "decomp", "playerhud_post_update_pure_helpers.h");
const source = join(root, "native", "decomp", "playerhud_post_update_pure_helpers.cpp");
/* Wave-26 hardening (update-v102-hardening GAP C): 120-attempt retried
   source write so a crashed/failed mutant restore can never strand a
   mutant in the tracked playerhud_post_update_pure_helpers.cpp (Windows open-lock EUNKNOWN class; room/anm2
   convention). */
const writeSourceRetry = (content) => {
  for (let attempt = 0; ; ++attempt) {
    try {
      writeFileSync(source, content, "utf8");
      return;
    } catch (e) {
      if (attempt >= 120) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
        Math.min(25 * (attempt + 1), 500));
    }
  }
};

const outDir = join(root, "output", "decomp", "playerhud-post-update-pure");
const wasmPath = join(outDir, "playerhud-post-update-pure-helpers.wasm");
const sliceCpp = join(root, "native", "decomp", "game_update_slice.cpp");
const sliceJson = join(root, "decomp", "game-update-slice.json");

function firstExisting(paths, label) {
  const found = paths.find((path) => path && existsSync(path));
  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

import { withWasmBuildCache } from "./wasm-build-cache.mjs";
/* Content-hash build cache: skips the clang+em++ spawns when the EXACT
   source bytes (mutants included) were built before. Disable with
   ISAAC_WASM_BUILD_CACHE=0. See tests/wasm-build-cache.mjs. */
function buildWasm(outFile = wasmPath, srcFile = source) {
  withWasmBuildCache({
    tag: "playerhud-post-update-pure-helpers",
    files: [srcFile, header],
    extra: `out:${outFile === wasmPath ? "" : outFile}`,
    wasmPath: outFile,
    build: () => buildWasmUncached(outFile, srcFile),
  });
}
function buildWasmUncached(outFile = wasmPath, srcFile = source) {
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
    srcFile,
    "-std=c++20",
    "-I", join(root, "native", "decomp"),
    "-fsyntax-only",
    "-Wall",
    "-Wextra",
    "-Werror",
  ], { cwd: root, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  const built = spawnSync(emxx, [
    srcFile,
    "-std=c++20",
    "-O2",
    "-I", join(root, "native", "decomp"),
    "--no-entry",
    "-sSTANDALONE_WASM=1",
    "-sERROR_ON_UNDEFINED_SYMBOLS=1",
    "-Wl,--export=isaac_playerhud_entry_clear_heart_byte1",
    "-Wl,--export=isaac_playerhud_entry_clear_heart_byte1_at",
    "-Wl,--export=isaac_playerhud_update_hearts_uses_twin",
    "-Wl,--export=isaac_playerhud_update_hearts_call_plan",
    "-Wl,--export=isaac_playerhud_get_health_type",
    "-Wl,--export=isaac_playerhud_signed_ceil_half",
    "-Wl,--export=isaac_playerhud_update_hearts_pure",
    "-Wl,--export=isaac_playerhud_tramp_suppresses_critical_blink",
    "-Wl,--export=isaac_playerhud_critical_heart_blink",
    "-Wl,--export=isaac_playerhud_active_slot_countdown_tick",
    "-Wl,--export=isaac_playerhud_active_slot_countdown_tick_at",
    "-Wl,--export=isaac_playerhud_active_book_overlay_id",
    "-Wl,--export=isaac_playerhud_host_va_has_collectible",
    "-Wl,--export=isaac_playerhud_active_slot_dword_index",
    "-Wl,--export=isaac_playerhud_cached_active_id_byte_offset",
    "-Wl,--export=isaac_playerhud_cached_book_overlay_byte_offset",
    "-Wl,--export=isaac_playerhud_active_id_cache_changed",
    "-Wl,--export=isaac_playerhud_book_overlay_cache_changed",
    "-Wl,--export=isaac_playerhud_book_overlay_path_kind",
    "-Wl,--export=isaac_playerhud_book_overlay_path_va",
    "-Wl,--export=isaac_playerhud_active_gfx_cache_plan",
    "-Wl,--export=isaac_playerhud_active_gfx_cache_apply_at",
    "-Wl,--export=isaac_playerhud_host_va_load_image",
    "-Wl,--export=isaac_playerhud_host_va_smart_ptr_clear",
    "-Wl,--export=isaac_playerhud_host_va_item_config_get_collectible",
    "-Wl,--export=isaac_playerhud_active_image_sp_byte_offset",
    "-Wl,--export=isaac_playerhud_item_config_resolve",
    "-Wl,--export=isaac_playerhud_active_item_path_kind",
    "-Wl,--export=isaac_playerhud_active_item_path_va",
    "-Wl,--export=isaac_playerhud_active_item_path_plan",
    "-Wl,--export=isaac_playerhud_active_sp_clear_arg",
    "-Wl,--export=isaac_playerhud_sp_clear_alloc_size",
    "-Wl,--export=isaac_playerhud_sp_clear_alloc_ok",
    "-Wl,--export=isaac_playerhud_sp_clear_old_object_present",
    "-Wl,--export=isaac_playerhud_sp_clear_callback_needed",
    "-Wl,--export=isaac_playerhud_sp_clear_object_finish_apply",
    "-Wl,--export=isaac_playerhud_sp_clear_pair_apply_base",
    "-Wl,--export=isaac_playerhud_sp_clear_vtable",
    "-Wl,--export=isaac_playerhud_skips_active_load_image",
    "-Wl,--export=isaac_playerhud_item_config_gfx_string_byte_offset",
    "-Wl,--export=isaac_playerhud_item_config_gfx_capacity_byte_offset",
    "-Wl,--export=isaac_playerhud_config_gfx_string_is_sso",
    "-Wl,--export=isaac_playerhud_host_va_sp_materialize",
    "-Wl,--export=isaac_playerhud_sp_pair_swap",
    "-Wl,--export=isaac_playerhud_sp_pair_swap_at",
    "-Wl,--export=isaac_playerhud_active_load_image_prep",
    "-Wl,--export=isaac_playerhud_load_image_path_buffer_ebp_off",
    "-Wl,--export=isaac_playerhud_load_image_result_ebp_off",
    "-Wl,--export=isaac_playerhud_materialize_this_ebp_off",
    "-Wl,--export=isaac_playerhud_active_sp_saved_ebp_off",
    "-Wl,--export=isaac_playerhud_dirty_flag_ebp_off",
    "-Wl,--export=isaac_playerhud_load_image_result_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_materialize_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_materialize_seh_try_level",
    "-Wl,--export=isaac_playerhud_active_dirty_after_gfx",
    "-Wl,--export=isaac_playerhud_active_dirty_set",
    "-Wl,--export=isaac_playerhud_active_load_image_call",
    "-Wl,--export=isaac_playerhud_book_image_sp_byte_offset",
    "-Wl,--export=isaac_playerhud_book_load_image_result_ebp_off",
    "-Wl,--export=isaac_playerhud_book_materialize_this_ebp_off",
    "-Wl,--export=isaac_playerhud_book_load_image_result_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_book_materialize_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_book_materialize_seh_try_level",
    "-Wl,--export=isaac_playerhud_book_sp_clear_arg",
    "-Wl,--export=isaac_playerhud_book_dirty_after_gfx",
    "-Wl,--export=isaac_playerhud_book_load_image_call",
    "-Wl,--export=isaac_playerhud_trinket_slot_count",
    "-Wl,--export=isaac_playerhud_cached_trinket_id_byte_offset",
    "-Wl,--export=isaac_playerhud_cached_trinket_secondary_byte_offset",
    "-Wl,--export=isaac_playerhud_trinket_image_sp_byte_offset",
    "-Wl,--export=isaac_playerhud_player_trinket_id_byte_offset",
    "-Wl,--export=isaac_playerhud_player_trinket_secondary_byte_offset",
    "-Wl,--export=isaac_playerhud_trinket_mask_id",
    "-Wl,--export=isaac_playerhud_trinket_secondary_id",
    "-Wl,--export=isaac_playerhud_trinket_needs_room_seed_probe",
    "-Wl,--export=isaac_playerhud_trinket_apply_0x4b_remask",
    "-Wl,--export=isaac_playerhud_trinket_cache_changed",
    "-Wl,--export=isaac_playerhud_trinket_cache_apply_at",
    "-Wl,--export=isaac_playerhud_host_va_get_room_by_idx",
    "-Wl,--export=isaac_playerhud_host_va_sp_swap",
    "-Wl,--export=isaac_playerhud_host_va_dirty_notify",
    "-Wl,--export=isaac_playerhud_trinket_load_image_result_ebp_off",
    "-Wl,--export=isaac_playerhud_trinket_load_image_result_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_trinket_seh_try_level",
    "-Wl,--export=isaac_playerhud_trinket_dirty_after_gfx",
    "-Wl,--export=isaac_playerhud_trinket_gfx_plan",
    "-Wl,--export=isaac_playerhud_pocket_slot_count",
    "-Wl,--export=isaac_playerhud_pocket_slot_stride",
    "-Wl,--export=isaac_playerhud_pocket_clamp_slot",
    "-Wl,--export=isaac_playerhud_cached_pocket_type_byte_offset",
    "-Wl,--export=isaac_playerhud_cached_pocket_id_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_anm2_byte_offset",
    "-Wl,--export=isaac_playerhud_player_pocket_id_byte_offset",
    "-Wl,--export=isaac_playerhud_player_pocket_type_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_resolved_id",
    "-Wl,--export=isaac_playerhud_pocket_cache_changed",
    "-Wl,--export=isaac_playerhud_pocket_cache_apply_at",
    "-Wl,--export=isaac_playerhud_pocket_path_kind",
    "-Wl,--export=isaac_playerhud_p5_block_needed",
    "-Wl,--export=isaac_playerhud_p5_skip_va",
    "-Wl,--export=isaac_playerhud_p5_node_flag_word",
    "-Wl,--export=isaac_playerhud_p5_node_self_ptr",
    "-Wl,--export=isaac_playerhud_p5_walk_terminates",
    "-Wl,--export=isaac_playerhud_p5_walk_steps",
    "-Wl,--export=isaac_playerhud_p5_slot_needs_insert",
    "-Wl,--export=isaac_playerhud_p5_slot_byte_offset",
    "-Wl,--export=isaac_playerhud_p5_push_needs_grow",
    "-Wl,--export=isaac_playerhud_p5_push_advance",
    "-Wl,--export=isaac_playerhud_host_va_get_entity",
    "-Wl,--export=isaac_playerhud_host_va_anm2_load",
    "-Wl,--export=isaac_playerhud_host_va_anm2_reset",
    "-Wl,--export=isaac_playerhud_get_entity_type",
    "-Wl,--export=isaac_playerhud_get_entity_variant_card",
    "-Wl,--export=isaac_playerhud_get_entity_variant_pill",
    "-Wl,--export=isaac_playerhud_manager_entity_config_byte_offset",
    "-Wl,--export=isaac_playerhud_entity_anm_path_byte_offset",
    "-Wl,--export=isaac_playerhud_anm2_load_graphics",
    "-Wl,--export=isaac_playerhud_pocket_gfx_plan",
    "-Wl,--export=isaac_playerhud_tail_float_step",
    "-Wl,--export=isaac_playerhud_tail_char_countdown",
    "-Wl,--export=isaac_playerhud_tail_char_countdown_at",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_slot_count",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_slot_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_slot_is_upgrade",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_array_ptr_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_array_element_dword_index",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_array_id_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_resolve_kind",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_resolve_index",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_entry_usable",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_take_result_value",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_branch_kind",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_insert_value",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_path_ptr",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_global_callback_needed",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_result_followup_needed",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_result_copy_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_build_node_result_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_build_node_obj_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_list_head_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_value_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_elem_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_virtual_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_global_arg_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_seh_first",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_seh_count",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_callback_count",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_load_image_result_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_elem2_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_value2_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_virtual2_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_virtual3_ebp_off",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_config_capacity_byte_offset",
    "-Wl,--export=isaac_playerhud_host_va_pocket_upgrade_build_node",
    "-Wl,--export=isaac_playerhud_host_va_pocket_upgrade_node_remove",
    "-Wl,--export=isaac_playerhud_host_va_free",
    "-Wl,--export=isaac_playerhud_pocket_upgrade_plan",
    "-Wl,--export=isaac_playerhud_pocket_second_list_gate",
    "-Wl,--export=isaac_playerhud_pocket_second_list_count",
    "-Wl,--export=isaac_playerhud_pocket_second_list_iteration_needed",
    "-Wl,--export=isaac_playerhud_pocket_second_list_entry_usable",
    "-Wl,--export=isaac_playerhud_pocket_second_list_vec_begin_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_second_list_vec_end_byte_offset",
    "-Wl,--export=isaac_playerhud_pocket_list_clear_needed",
    "-Wl,--export=isaac_playerhud_pocket_list_clear_plan",
    "-Wl,--export=isaac_playerhud_p5_walk_clear_needed",
    "-Wl,--export=isaac_playerhud_p5_walk_clear_plan",
    "-Wl,--export=isaac_playerhud_tail_enable_store_clear",
    "-Wl,--export=isaac_playerhud_tail_rebuild_gate",
    "-Wl,--export=isaac_playerhud_tail_rebuild_path_kind",
    "-Wl,--export=isaac_playerhud_tail_config_string_data",
    "-Wl,--export=isaac_playerhud_tail_rebuild_plan",
    "-Wl,--export=isaac_playerhud_tail_predicate_call_args",
    "-Wl,--export=isaac_playerhud_tail_dirty_notify_needed",
    "-Wl,--export=isaac_playerhud_tail_dirty_notify_call_args",
    "-Wl,--export=isaac_playerhud_stat_bar_tween",
    "-Wl,--export=isaac_playerhud_84e9d0_update",
    "-Wl,--export=isaac_playerhud_84ca00_flag",
    "-Wl,--export=isaac_playerhud_84ca00_clamp",
    "-Wl,--export=isaac_playerhud_84ca00_slot_active",
    "-Wl,--export=isaac_playerhud_84ca00_slot_target",
    "-Wl,--export=isaac_playerhud_84cc40_block_count",
    "-Wl,--export=isaac_playerhud_84cc40_block_stride",
    "-Wl,--export=isaac_playerhud_84cc40_block_player_off",
    "-Wl,--export=isaac_playerhud_84cc40_slot_base_off",
    "-Wl,--export=isaac_playerhud_84cc40_slot_count",
    "-Wl,--export=isaac_playerhud_84cc40_slot_stride",
    "-Wl,--export=isaac_playerhud_84cc40_mode_byte_off",
    "-Wl,--export=isaac_playerhud_84cc40_block_kind",
    "-Wl,--export=isaac_playerhud_84cc40_update_needed",
    "-Wl,--export=isaac_playerhud_84cc40_path_flag",
    "-Wl,--export=isaac_playerhud_84cc40_recompute_host_va",
    "-Wl,--export=isaac_playerhud_84cc40_recompute_plan",
    "-Wl,--export=isaac_playerhud_84cc40_va",
    "-Wl,--export=isaac_playerhud_84cc40_ret_va",
    "-Wl,--export=isaac_playerhud_84cc40_next_va",
    "-Wl,--export=isaac_playerhud_856f50_gate",
    "-Wl,--export=isaac_playerhud_856f50_field_off",
    "-Wl,--export=isaac_playerhud_856f50_va",
    "-Wl,--export=isaac_playerhud_856f50_ret_va",
    "-Wl,--export=isaac_playerhud_856f50_next_va",
    "-Wl,--export=isaac_playerhud_85af30_pack",
    "-Wl,--export=isaac_playerhud_85af30_value_div10000",
    "-Wl,--export=isaac_playerhud_85af30_value_rem100",
    "-Wl,--export=isaac_playerhud_85af30_value_q100_minus1",
    "-Wl,--export=isaac_playerhud_85af30_value_q10000_minus1900",
    "-Wl,--export=isaac_playerhud_85af30_va",
    "-Wl,--export=isaac_playerhud_85af30_ret_va",
    "-Wl,--export=isaac_playerhud_85af30_next_va",
    "-Wl,--export=isaac_playerhud_85af30_object_size",
    "-Wl,--export=isaac_playerhud_858870_ordinal_suffix_va",
    "-Wl,--export=isaac_playerhud_858870_value_rem100",
    "-Wl,--export=isaac_playerhud_858870_value_rem10",
    "-Wl,--export=isaac_playerhud_858870_va",
    "-Wl,--export=isaac_playerhud_858870_ret_va",
    "-Wl,--export=isaac_playerhud_858870_next_va",
    "-Wl,--export=isaac_playerhud_857400_entry",
    "-Wl,--export=isaac_playerhud_857400_needs_log",
    "-Wl,--export=isaac_playerhud_857400_plan",
    "-Wl,--export=isaac_playerhud_857400_va",
    "-Wl,--export=isaac_playerhud_857400_ret_va",
    "-Wl,--export=isaac_playerhud_857400_next_va",
    "-Wl,--export=isaac_playerhud_85e360_float_41c",
    "-Wl,--export=isaac_playerhud_85e360_field_off",
    "-Wl,--export=isaac_playerhud_85e360_va",
    "-Wl,--export=isaac_playerhud_85e360_ret_va",
    "-Wl,--export=isaac_playerhud_85e360_next_va",
    "-Wl,--export=isaac_playerhud_84d740_string_va",
    "-Wl,--export=isaac_playerhud_84d740_needs_log",
    "-Wl,--export=isaac_playerhud_84d740_plan",
    "-Wl,--export=isaac_playerhud_host_va_log",
    "-Wl,--export=isaac_playerhud_84d8b0_intersect",
    "-Wl,--export=isaac_playerhud_84da20_init",
    "-Wl,--export=isaac_playerhud_84da20_writes_dword",
    "-Wl,--export=isaac_playerhud_84da20_object_size",
    "-Wl,--export=isaac_playerhud_84da20_sso_capacity",
    "-Wl,--export=isaac_playerhud_84da20_next_va",
    "-Wl,--export=isaac_playerhud_84dad0_init",
    "-Wl,--export=isaac_playerhud_84dad0_writes_dword",
    "-Wl,--export=isaac_playerhud_84dad0_writes_byte",
    "-Wl,--export=isaac_playerhud_84dad0_object_size",
    "-Wl,--export=isaac_playerhud_84dad0_sso_capacity",
    "-Wl,--export=isaac_playerhud_84dad0_host_va",
    "-Wl,--export=isaac_playerhud_84dad0_host_this_off",
    "-Wl,--export=isaac_playerhud_84dad0_next_va",
    "-Wl,--export=isaac_playerhud_84db90_plan",
    "-Wl,--export=isaac_playerhud_84db90_call_count",
    "-Wl,--export=isaac_playerhud_84db90_this_off_at",
    "-Wl,--export=isaac_playerhud_84db90_host_va_at",
    "-Wl,--export=isaac_playerhud_84db90_is_tail_jmp",
    "-Wl,--export=isaac_playerhud_84db90_next_va",
    "-Wl,--export=isaac_playerhud_84dbc0_plan",
    "-Wl,--export=isaac_playerhud_84dbc0_call_count",
    "-Wl,--export=isaac_playerhud_84dbc0_this_off_at",
    "-Wl,--export=isaac_playerhud_84dbc0_host_va_at",
    "-Wl,--export=isaac_playerhud_84dbc0_is_tail_jmp",
    "-Wl,--export=isaac_playerhud_84dbc0_next_va",
    "-Wl,--export=isaac_playerhud_856840_needed",
    "-Wl,--export=isaac_playerhud_856840_count",
    "-Wl,--export=isaac_playerhud_856840_plan",
    "-Wl,--export=isaac_playerhud_856840_call_count",
    "-Wl,--export=isaac_playerhud_856840_this_off_at",
    "-Wl,--export=isaac_playerhud_856840_host_va_at",
    "-Wl,--export=isaac_playerhud_856840_stride",
    "-Wl,--export=isaac_playerhud_856840_next_va",
    "-Wl,--export=isaac_playerhud_84dea0_needed",
    "-Wl,--export=isaac_playerhud_84dea0_plan",
    "-Wl,--export=isaac_playerhud_84dea0_call_count",
    "-Wl,--export=isaac_playerhud_84dea0_xmm1_off_at",
    "-Wl,--export=isaac_playerhud_84dea0_label_va_at",
    "-Wl,--export=isaac_playerhud_84dea0_label_size_at",
    "-Wl,--export=isaac_playerhud_84dea0_host_va",
    "-Wl,--export=isaac_playerhud_84dea0_next_va",
    "-Wl,--export=isaac_playerhud_84e200_xorps_needed",
    "-Wl,--export=isaac_playerhud_84e200_next_va",
    "-Wl,--export=isaac_playerhud_84e5b0_count",
    "-Wl,--export=isaac_playerhud_84e5b0_in_range",
    "-Wl,--export=isaac_playerhud_84e5b0_early_true",
    "-Wl,--export=isaac_playerhud_84e5b0_prefix",
    "-Wl,--export=isaac_playerhud_84e5b0_object_off",
    "-Wl,--export=isaac_playerhud_84e5b0_dword_count",
    "-Wl,--export=isaac_playerhud_84e5b0_whitelist_ok",
    "-Wl,--export=isaac_playerhud_84e5b0_blacklist_ok",
    "-Wl,--export=isaac_playerhud_84e5b0_completion_prefix",
    "-Wl,--export=isaac_playerhud_84e5b0_mode_ok",
    "-Wl,--export=isaac_playerhud_84e5b0_decide",
    "-Wl,--export=isaac_playerhud_84e5b0_plan",
    "-Wl,--export=isaac_playerhud_84e5b0_vec_off_at",
    "-Wl,--export=isaac_playerhud_84e5b0_host_va_at",
    "-Wl,--export=isaac_playerhud_84e5b0_fail_if_al_at",
    "-Wl,--export=isaac_playerhud_84e5b0_stride",
    "-Wl,--export=isaac_playerhud_84e5b0_next_va",
    "-Wl,--export=isaac_playerhud_84e820_gate_zero",
    "-Wl,--export=isaac_playerhud_84e820_count",
    "-Wl,--export=isaac_playerhud_84e820_ptr_count",
    "-Wl,--export=isaac_playerhud_84e820_in_range",
    "-Wl,--export=isaac_playerhud_84e820_loop_cont",
    "-Wl,--export=isaac_playerhud_84e820_range_empty",
    "-Wl,--export=isaac_playerhud_84e820_special_ok",
    "-Wl,--export=isaac_playerhud_84e820_al_hit",
    "-Wl,--export=isaac_playerhud_84e820_entry_inc",
    "-Wl,--export=isaac_playerhud_84e820_extra_sum",
    "-Wl,--export=isaac_playerhud_84e820_decide",
    "-Wl,--export=isaac_playerhud_84e820_plan",
    "-Wl,--export=isaac_playerhud_84e820_host_va_at",
    "-Wl,--export=isaac_playerhud_84e820_stride",
    "-Wl,--export=isaac_playerhud_84e820_next_va",
    "-Wl,--export=isaac_playerhud_8568a0_plan",
    "-Wl,--export=isaac_playerhud_8568a0_call_count",
    "-Wl,--export=isaac_playerhud_8568a0_this_off_at",
    "-Wl,--export=isaac_playerhud_8568a0_arg_off_at",
    "-Wl,--export=isaac_playerhud_8568a0_host_va_at",
    "-Wl,--export=isaac_playerhud_8568a0_tail_begin_off",
    "-Wl,--export=isaac_playerhud_8568a0_tail_dword_count",
    "-Wl,--export=isaac_playerhud_8568a0_object_size",
    "-Wl,--export=isaac_playerhud_8568a0_next_va",
    "-Wl,--export=isaac_playerhud_8568a0_tail_copy",
    "-Wl,--export=isaac_playerhud_856e10_move_ctor",
    "-Wl,--export=isaac_playerhud_856e10_object_size",
    "-Wl,--export=isaac_playerhud_856e10_next_va",
    "-Wl,--export=isaac_playerhud_856960_needed",
    "-Wl,--export=isaac_playerhud_856960_count",
    "-Wl,--export=isaac_playerhud_856960_move_range",
    "-Wl,--export=isaac_playerhud_856960_stride",
    "-Wl,--export=isaac_playerhud_856960_move_ctor_va",
    "-Wl,--export=isaac_playerhud_856960_wipe_va",
    "-Wl,--export=isaac_playerhud_856960_next_va",
    "-Wl,--export=isaac_playerhud_9bfc00_law",
    "-Wl,--export=isaac_playerhud_9bfc00_va",
    "-Wl,--export=isaac_playerhud_9bfc00_ret_va",
    "-Wl,--export=isaac_playerhud_9bfc00_next_va",
    "-Wl,--export=isaac_playerhud_9bfc00_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfc20_law",
    "-Wl,--export=isaac_playerhud_9bfc20_va",
    "-Wl,--export=isaac_playerhud_9bfc20_ret_va",
    "-Wl,--export=isaac_playerhud_9bfc20_next_va",
    "-Wl,--export=isaac_playerhud_9bfc20_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfc40_pow_base",
    "-Wl,--export=isaac_playerhud_9bfc40_pow_exp_bits",
    "-Wl,--export=isaac_playerhud_9bfc40_law",
    "-Wl,--export=isaac_playerhud_9bfc40_va",
    "-Wl,--export=isaac_playerhud_9bfc40_ret_va",
    "-Wl,--export=isaac_playerhud_9bfc40_next_va",
    "-Wl,--export=isaac_playerhud_9bfc40_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfc80_gate",
    "-Wl,--export=isaac_playerhud_9bfc80_pow_base",
    "-Wl,--export=isaac_playerhud_9bfc80_pow_exp_bits",
    "-Wl,--export=isaac_playerhud_9bfc80_law",
    "-Wl,--export=isaac_playerhud_9bfc80_va",
    "-Wl,--export=isaac_playerhud_9bfc80_ret_va",
    "-Wl,--export=isaac_playerhud_9bfc80_next_va",
    "-Wl,--export=isaac_playerhud_9bfc80_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfcd0_gate",
    "-Wl,--export=isaac_playerhud_9bfcd0_pow_base",
    "-Wl,--export=isaac_playerhud_9bfcd0_pow_exp_bits",
    "-Wl,--export=isaac_playerhud_9bfcd0_law",
    "-Wl,--export=isaac_playerhud_9bfcd0_va",
    "-Wl,--export=isaac_playerhud_9bfcd0_ret_va",
    "-Wl,--export=isaac_playerhud_9bfcd0_next_va",
    "-Wl,--export=isaac_playerhud_9bfcd0_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfd00_law",
    "-Wl,--export=isaac_playerhud_9bfd00_va",
    "-Wl,--export=isaac_playerhud_9bfd00_ret_va",
    "-Wl,--export=isaac_playerhud_9bfd00_next_va",
    "-Wl,--export=isaac_playerhud_9bfd00_caller1_va",
    "-Wl,--export=isaac_playerhud_9bfd20_law",
    "-Wl,--export=isaac_playerhud_9bfd20_va",
    "-Wl,--export=isaac_playerhud_9bfd20_ret_va",
    "-Wl,--export=isaac_playerhud_9bfd20_next_va",
    "-Wl,--export=isaac_playerhud_9bfd20_caller1_va",
    "-Wl,--export=isaac_playerhud_9c0120_clamp01",
    "-Wl,--export=isaac_playerhud_9c0120_value",
    "-Wl,--export=isaac_playerhud_9c0170_pair",
    "-Wl,--export=isaac_playerhud_9c0120_va",
    "-Wl,--export=isaac_playerhud_9c0120_ret_va",
    "-Wl,--export=isaac_playerhud_9c0120_next_va",
    "-Wl,--export=isaac_playerhud_9c0120_vtable_ref_rdata",
    "-Wl,--export=isaac_playerhud_9c0120_probe_slot",
    "-Wl,--export=isaac_playerhud_9c0120_probe_vtbl_off",
    "-Wl,--export=isaac_playerhud_9c0120_a_off",
    "-Wl,--export=isaac_playerhud_9c0120_b_off",
    "-Wl,--export=isaac_playerhud_clamp_lo_rdata",
    "-Wl,--export=isaac_playerhud_clamp_hi_rdata",
    "-Wl,--export=isaac_playerhud_clamp_zero_bits",
    "-Wl,--export=isaac_playerhud_clamp_one_bits",
    "-Wl,--export=isaac_playerhud_9c0170_va",
    "-Wl,--export=isaac_playerhud_9c0170_ret_va",
    "-Wl,--export=isaac_playerhud_9c0170_next_va",
    "-Wl,--export=isaac_playerhud_9c0170_vtable_ref_rdata",
    "-Wl,--export=isaac_playerhud_9c0170_ret_imm",
    "-Wl,--export=isaac_playerhud_9c0170_a_off",
    "-Wl,--export=isaac_playerhud_9c0170_b_off",
    "-Wl,--export=isaac_playerhud_9c0170_c_off",
    "-Wl,--export=isaac_playerhud_9c0170_d_off",
    "-Wl,--export=isaac_playerhud_9c06a0_law",
    "-Wl,--export=isaac_playerhud_9c06a0_va",
    "-Wl,--export=isaac_playerhud_9c06a0_ret_va",
    "-Wl,--export=isaac_playerhud_9c06a0_next_va",
    "-Wl,--export=isaac_playerhud_9c06a0_ret_imm",
    "-Wl,--export=isaac_playerhud_9c06a0_caller1_va",
    "-Wl,--export=isaac_playerhud_9c06a0_caller2_va",
    "-Wl,--export=isaac_playerhud_9c06a0_obj1_off",
    "-Wl,--export=isaac_playerhud_9c06a0_probe_slot",
    "-Wl,--export=isaac_playerhud_9c06a0_probe_vtbl_off",
    "-Wl,--export=isaac_playerhud_9c06a0_obj1_x_off",
    "-Wl,--export=isaac_playerhud_9c06a0_obj1_y_off",
    "-Wl,--export=isaac_playerhud_9c06a0_this_b_off",
    "-Wl,--export=isaac_playerhud_9c06a0_this_d_off",
    "-Wl,--export=isaac_playerhud_9c06a0_obj2_off",
    "-Wl,--export=isaac_playerhud_global1_bss",
    "-Wl,--export=isaac_playerhud_global2_bss",
    "-Wl,--export=isaac_playerhud_k1_rdata",
    "-Wl,--export=isaac_playerhud_k1_bits",
    "-Wl,--export=isaac_playerhud_k2_rdata",
    "-Wl,--export=isaac_playerhud_k2_bits",
    "-Wl,--export=isaac_playerhud_9c2210_advance",
    "-Wl,--export=isaac_playerhud_9c2210_va",
    "-Wl,--export=isaac_playerhud_9c2210_ret_va",
    "-Wl,--export=isaac_playerhud_9c2210_next_va",
    "-Wl,--export=isaac_playerhud_9c2210_ret_imm",
    "-Wl,--export=isaac_playerhud_9c2210_index_off",
    "-Wl,--export=isaac_playerhud_9c2210_vec_begin_off",
    "-Wl,--export=isaac_playerhud_9c2210_vec_end_off",
    "-Wl,--export=isaac_playerhud_9c2210_stride",
    "-Wl,--export=isaac_playerhud_9c2210_div_magic",
    "-Wl,--export=isaac_playerhud_9c2210_div_shift",
    "-Wl,--export=isaac_playerhud_9c2210_empty_flag_off",
    "-Wl,--export=isaac_playerhud_9c2210_empty_flag_bits",
    "-Wl,--export=isaac_playerhud_9c2210_caller1_va",
    "-Wl,--export=isaac_playerhud_9c2210_caller2_va",
    "-Wl,--export=isaac_playerhud_9c2210_caller3_va",
    "-Wl,--export=isaac_playerhud_9c2210_caller4_va",
    "-Wl,--export=isaac_playerhud_9c0870_search_clear",
    "-Wl,--export=isaac_playerhud_9c0870_va",
    "-Wl,--export=isaac_playerhud_9c0870_ret_va",
    "-Wl,--export=isaac_playerhud_9c0870_ret_exhaust_va",
    "-Wl,--export=isaac_playerhud_9c0870_ret_cleared_va",
    "-Wl,--export=isaac_playerhud_9c0870_next_va",
    "-Wl,--export=isaac_playerhud_9c0870_ret_imm",
    "-Wl,--export=isaac_playerhud_9c0870_index_off",
    "-Wl,--export=isaac_playerhud_9c0870_vec_begin_off",
    "-Wl,--export=isaac_playerhud_9c0870_vec_end_off",
    "-Wl,--export=isaac_playerhud_9c0870_stride",
    "-Wl,--export=isaac_playerhud_9c0870_div_magic",
    "-Wl,--export=isaac_playerhud_9c0870_div_shift",
    "-Wl,--export=isaac_playerhud_9c0870_flag_a_off",
    "-Wl,--export=isaac_playerhud_9c0870_flag_b_off",
    "-Wl,--export=isaac_playerhud_9c0870_empty_bits",
    "-Wl,--export=isaac_playerhud_9c0870_caller1_va",
    "-Wl,--export=isaac_playerhud_9c0870_caller2_va",
    "-Wl,--export=isaac_playerhud_9c0870_caller3_va",
    "-Wl,--export=isaac_playerhud_9c0870_caller4_va",
    "-Wl,--export=isaac_playerhud_9c2370_gate",
    "-Wl,--export=isaac_playerhud_9c2370_va",
    "-Wl,--export=isaac_playerhud_9c2370_ret_va",
    "-Wl,--export=isaac_playerhud_9c2370_next_va",
    "-Wl,--export=isaac_playerhud_9c2370_probe_slot",
    "-Wl,--export=isaac_playerhud_9c2370_probe_vtbl_off",
    "-Wl,--export=isaac_playerhud_9c2370_vtable_ref_rdata_a",
    "-Wl,--export=isaac_playerhud_9c2370_vtable_ref_rdata_b",
    "-Wl,--export=isaac_playerhud_9c2370_gate_rdata",
    "-Wl,--export=isaac_playerhud_9c2370_gate_bits",
    "-Wl,--export=isaac_playerhud_9bfc_host_va_powf",
    "-Wl,--export=isaac_playerhud_post_update_pure_helpers_abi_version",
    "-o", outFile,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(
    WebAssembly.Module.imports(module).length,
    0,
    "playerhud post-update pure helpers must be zero-import",
  );
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const exp = (name) => {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  return {
    abi: exp("isaac_playerhud_post_update_pure_helpers_abi_version"),
    clearSparse: exp("isaac_playerhud_entry_clear_heart_byte1"),
    clearAt: exp("isaac_playerhud_entry_clear_heart_byte1_at"),
    usesTwin: exp("isaac_playerhud_update_hearts_uses_twin"),
    heartsCallPlan: exp("isaac_playerhud_update_hearts_call_plan"),
    healthType: exp("isaac_playerhud_get_health_type"),
    ceilHalf: exp("isaac_playerhud_signed_ceil_half"),
    updateHearts: exp("isaac_playerhud_update_hearts_pure"),
    tramp: exp("isaac_playerhud_tramp_suppresses_critical_blink"),
    blink: exp("isaac_playerhud_critical_heart_blink"),
    activeTick: exp("isaac_playerhud_active_slot_countdown_tick"),
    activeTickAt: exp("isaac_playerhud_active_slot_countdown_tick_at"),
    bookOverlay: exp("isaac_playerhud_active_book_overlay_id"),
    hostVaHasCollectible: exp("isaac_playerhud_host_va_has_collectible"),
    slotDwordIndex: exp("isaac_playerhud_active_slot_dword_index"),
    cachedActiveOff: exp("isaac_playerhud_cached_active_id_byte_offset"),
    cachedBookOff: exp("isaac_playerhud_cached_book_overlay_byte_offset"),
    activeCacheChanged: exp("isaac_playerhud_active_id_cache_changed"),
    bookCacheChanged: exp("isaac_playerhud_book_overlay_cache_changed"),
    bookPathKind: exp("isaac_playerhud_book_overlay_path_kind"),
    bookPathVa: exp("isaac_playerhud_book_overlay_path_va"),
    cachePlan: exp("isaac_playerhud_active_gfx_cache_plan"),
    cacheApplyAt: exp("isaac_playerhud_active_gfx_cache_apply_at"),
    hostVaLoadImage: exp("isaac_playerhud_host_va_load_image"),
    hostVaSmartPtrClear: exp("isaac_playerhud_host_va_smart_ptr_clear"),
    hostVaItemConfigGetCollectible: exp(
      "isaac_playerhud_host_va_item_config_get_collectible",
    ),
    activeImageSpOff: exp("isaac_playerhud_active_image_sp_byte_offset"),
    itemConfigResolve: exp("isaac_playerhud_item_config_resolve"),
    activePathKind: exp("isaac_playerhud_active_item_path_kind"),
    activePathVa: exp("isaac_playerhud_active_item_path_va"),
    activePathPlan: exp("isaac_playerhud_active_item_path_plan"),
    activeSpClearArg: exp("isaac_playerhud_active_sp_clear_arg"),
    spClearAllocSize: exp("isaac_playerhud_sp_clear_alloc_size"),
    spClearAllocOk: exp("isaac_playerhud_sp_clear_alloc_ok"),
    spClearOldPresent: exp("isaac_playerhud_sp_clear_old_object_present"),
    spClearCallbackNeeded: exp("isaac_playerhud_sp_clear_callback_needed"),
    spClearObjectFinish: exp("isaac_playerhud_sp_clear_object_finish_apply"),
    spClearPairApply: exp("isaac_playerhud_sp_clear_pair_apply_base"),
    spClearVtable: exp("isaac_playerhud_sp_clear_vtable"),
    skipsLoadImage: exp("isaac_playerhud_skips_active_load_image"),
    itemCfgGfxStringOff: exp(
      "isaac_playerhud_item_config_gfx_string_byte_offset",
    ),
    itemCfgGfxCapacityOff: exp(
      "isaac_playerhud_item_config_gfx_capacity_byte_offset",
    ),
    configGfxIsSso: exp("isaac_playerhud_config_gfx_string_is_sso"),
    hostVaSpMaterialize: exp("isaac_playerhud_host_va_sp_materialize"),
    spPairSwap: exp("isaac_playerhud_sp_pair_swap"),
    spPairSwapAt: exp("isaac_playerhud_sp_pair_swap_at"),
    loadImagePrep: exp("isaac_playerhud_active_load_image_prep"),
    loadImagePathBufEbpOff: exp(
      "isaac_playerhud_load_image_path_buffer_ebp_off",
    ),
    loadImageResultEbpOff: exp("isaac_playerhud_load_image_result_ebp_off"),
    materializeThisEbpOff: exp("isaac_playerhud_materialize_this_ebp_off"),
    activeSpSavedEbpOff: exp("isaac_playerhud_active_sp_saved_ebp_off"),
    dirtyFlagEbpOff: exp("isaac_playerhud_dirty_flag_ebp_off"),
    loadImageResultObjEbpOff: exp(
      "isaac_playerhud_load_image_result_obj_ebp_off",
    ),
    materializeObjEbpOff: exp("isaac_playerhud_materialize_obj_ebp_off"),
    materializeSehTryLevel: exp("isaac_playerhud_materialize_seh_try_level"),
    activeDirtyAfterGfx: exp("isaac_playerhud_active_dirty_after_gfx"),
    activeDirtySet: exp("isaac_playerhud_active_dirty_set"),
    loadImageCall: exp("isaac_playerhud_active_load_image_call"),
    bookImageSpOff: exp("isaac_playerhud_book_image_sp_byte_offset"),
    bookLoadImageResultEbpOff: exp(
      "isaac_playerhud_book_load_image_result_ebp_off",
    ),
    bookMaterializeThisEbpOff: exp(
      "isaac_playerhud_book_materialize_this_ebp_off",
    ),
    bookLoadImageResultObjEbpOff: exp(
      "isaac_playerhud_book_load_image_result_obj_ebp_off",
    ),
    bookMaterializeObjEbpOff: exp(
      "isaac_playerhud_book_materialize_obj_ebp_off",
    ),
    bookMaterializeSehTryLevel: exp(
      "isaac_playerhud_book_materialize_seh_try_level",
    ),
    bookSpClearArg: exp("isaac_playerhud_book_sp_clear_arg"),
    bookDirtyAfterGfx: exp("isaac_playerhud_book_dirty_after_gfx"),
    bookLoadImageCall: exp("isaac_playerhud_book_load_image_call"),
    trinketSlotCount: exp("isaac_playerhud_trinket_slot_count"),
    cachedTrinketIdOff: exp("isaac_playerhud_cached_trinket_id_byte_offset"),
    cachedTrinketSecondaryOff: exp(
      "isaac_playerhud_cached_trinket_secondary_byte_offset",
    ),
    trinketImageSpOff: exp("isaac_playerhud_trinket_image_sp_byte_offset"),
    playerTrinketIdOff: exp("isaac_playerhud_player_trinket_id_byte_offset"),
    playerTrinketSecondaryOff: exp(
      "isaac_playerhud_player_trinket_secondary_byte_offset",
    ),
    trinketMaskId: exp("isaac_playerhud_trinket_mask_id"),
    trinketSecondaryId: exp("isaac_playerhud_trinket_secondary_id"),
    trinketNeedsRoomSeedProbe: exp(
      "isaac_playerhud_trinket_needs_room_seed_probe",
    ),
    trinketApply0x4bRemask: exp("isaac_playerhud_trinket_apply_0x4b_remask"),
    trinketCacheChanged: exp("isaac_playerhud_trinket_cache_changed"),
    trinketCacheApplyAt: exp("isaac_playerhud_trinket_cache_apply_at"),
    hostVaGetRoomByIdx: exp("isaac_playerhud_host_va_get_room_by_idx"),
    hostVaSpSwap: exp("isaac_playerhud_host_va_sp_swap"),
    hostVaDirtyNotify: exp("isaac_playerhud_host_va_dirty_notify"),
    trinketLoadImageResultEbpOff: exp(
      "isaac_playerhud_trinket_load_image_result_ebp_off",
    ),
    trinketLoadImageResultObjEbpOff: exp(
      "isaac_playerhud_trinket_load_image_result_obj_ebp_off",
    ),
    trinketSehTryLevel: exp("isaac_playerhud_trinket_seh_try_level"),
    trinketDirtyAfterGfx: exp("isaac_playerhud_trinket_dirty_after_gfx"),
    trinketGfxPlan: exp("isaac_playerhud_trinket_gfx_plan"),
    pocketSlotCount: exp("isaac_playerhud_pocket_slot_count"),
    pocketSlotStride: exp("isaac_playerhud_pocket_slot_stride"),
    pocketClampSlot: exp("isaac_playerhud_pocket_clamp_slot"),
    cachedPocketTypeOff: exp("isaac_playerhud_cached_pocket_type_byte_offset"),
    cachedPocketIdOff: exp("isaac_playerhud_cached_pocket_id_byte_offset"),
    pocketAnm2Off: exp("isaac_playerhud_pocket_anm2_byte_offset"),
    playerPocketIdOff: exp("isaac_playerhud_player_pocket_id_byte_offset"),
    playerPocketTypeOff: exp("isaac_playerhud_player_pocket_type_byte_offset"),
    pocketResolvedId: exp("isaac_playerhud_pocket_resolved_id"),
    pocketCacheChanged: exp("isaac_playerhud_pocket_cache_changed"),
    pocketCacheApplyAt: exp("isaac_playerhud_pocket_cache_apply_at"),
    pocketPathKind: exp("isaac_playerhud_pocket_path_kind"),
    p5BlockNeeded: exp("isaac_playerhud_p5_block_needed"),
    p5SkipVa: exp("isaac_playerhud_p5_skip_va"),
    p5NodeFlagWord: exp("isaac_playerhud_p5_node_flag_word"),
    p5NodeSelfPtr: exp("isaac_playerhud_p5_node_self_ptr"),
    p5WalkTerminates: exp("isaac_playerhud_p5_walk_terminates"),
    p5WalkSteps: exp("isaac_playerhud_p5_walk_steps"),
    p5SlotNeedsInsert: exp("isaac_playerhud_p5_slot_needs_insert"),
    p5SlotByteOffset: exp("isaac_playerhud_p5_slot_byte_offset"),
    p5PushNeedsGrow: exp("isaac_playerhud_p5_push_needs_grow"),
    p5PushAdvance: exp("isaac_playerhud_p5_push_advance"),
    hostVaGetEntity: exp("isaac_playerhud_host_va_get_entity"),
    hostVaAnm2Load: exp("isaac_playerhud_host_va_anm2_load"),
    hostVaAnm2Reset: exp("isaac_playerhud_host_va_anm2_reset"),
    getEntityType: exp("isaac_playerhud_get_entity_type"),
    getEntityVariantCard: exp("isaac_playerhud_get_entity_variant_card"),
    getEntityVariantPill: exp("isaac_playerhud_get_entity_variant_pill"),
    managerEntityConfigOff: exp(
      "isaac_playerhud_manager_entity_config_byte_offset",
    ),
    entityAnmPathOff: exp("isaac_playerhud_entity_anm_path_byte_offset"),
    anm2LoadGraphics: exp("isaac_playerhud_anm2_load_graphics"),
    pocketGfxPlan: exp("isaac_playerhud_pocket_gfx_plan"),
    tailFloat: exp("isaac_playerhud_tail_float_step"),
    tailChar: exp("isaac_playerhud_tail_char_countdown"),
    tailCharAt: exp("isaac_playerhud_tail_char_countdown_at"),
    pocketListClearNeeded: exp("isaac_playerhud_pocket_list_clear_needed"),
    pocketListClearPlan: exp("isaac_playerhud_pocket_list_clear_plan"),
    p5WalkClearNeeded: exp("isaac_playerhud_p5_walk_clear_needed"),
    p5WalkClearPlan: exp("isaac_playerhud_p5_walk_clear_plan"),
    tailEnableClear: exp("isaac_playerhud_tail_enable_store_clear"),
    tailRebuildGate: exp("isaac_playerhud_tail_rebuild_gate"),
    tailRebuildPathKind: exp("isaac_playerhud_tail_rebuild_path_kind"),
    tailConfigStringData: exp("isaac_playerhud_tail_config_string_data"),
    tailRebuildPlan: exp("isaac_playerhud_tail_rebuild_plan"),
    tailPredicateArgs: exp("isaac_playerhud_tail_predicate_call_args"),
    tailDirtyNeeded: exp("isaac_playerhud_tail_dirty_notify_needed"),
    tailDirtyArgs: exp("isaac_playerhud_tail_dirty_notify_call_args"),
    statBarTween: exp("isaac_playerhud_stat_bar_tween"),
    hud84e9d0Update: exp("isaac_playerhud_84e9d0_update"),
    flag84ca00: exp("isaac_playerhud_84ca00_flag"),
    clamp84ca00: exp("isaac_playerhud_84ca00_clamp"),
    slotActive84ca00: exp("isaac_playerhud_84ca00_slot_active"),
    slotTarget84ca00: exp("isaac_playerhud_84ca00_slot_target"),
    blockCount84cc40: exp("isaac_playerhud_84cc40_block_count"),
    blockStride84cc40: exp("isaac_playerhud_84cc40_block_stride"),
    blockPlayerOff84cc40: exp("isaac_playerhud_84cc40_block_player_off"),
    slotBaseOff84cc40: exp("isaac_playerhud_84cc40_slot_base_off"),
    slotCount84cc40: exp("isaac_playerhud_84cc40_slot_count"),
    slotStride84cc40: exp("isaac_playerhud_84cc40_slot_stride"),
    modeByteOff84cc40: exp("isaac_playerhud_84cc40_mode_byte_off"),
    blockKind84cc40: exp("isaac_playerhud_84cc40_block_kind"),
    updateNeeded84cc40: exp("isaac_playerhud_84cc40_update_needed"),
    pathFlag84cc40: exp("isaac_playerhud_84cc40_path_flag"),
    recomputeHostVa84cc40: exp("isaac_playerhud_84cc40_recompute_host_va"),
    recomputePlan84cc40: exp("isaac_playerhud_84cc40_recompute_plan"),
    va84cc40: exp("isaac_playerhud_84cc40_va"),
    retVa84cc40: exp("isaac_playerhud_84cc40_ret_va"),
    nextVa84cc40: exp("isaac_playerhud_84cc40_next_va"),
    gate856f50: exp("isaac_playerhud_856f50_gate"),
    fieldOff856f50: exp("isaac_playerhud_856f50_field_off"),
    va856f50: exp("isaac_playerhud_856f50_va"),
    retVa856f50: exp("isaac_playerhud_856f50_ret_va"),
    nextVa856f50: exp("isaac_playerhud_856f50_next_va"),
    pack85af30: exp("isaac_playerhud_85af30_pack"),
    div1000085af30: exp("isaac_playerhud_85af30_value_div10000"),
    rem10085af30: exp("isaac_playerhud_85af30_value_rem100"),
    q100Minus185af30: exp("isaac_playerhud_85af30_value_q100_minus1"),
    q10000Minus190085af30: exp(
      "isaac_playerhud_85af30_value_q10000_minus1900",
    ),
    va85af30: exp("isaac_playerhud_85af30_va"),
    retVa85af30: exp("isaac_playerhud_85af30_ret_va"),
    nextVa85af30: exp("isaac_playerhud_85af30_next_va"),
    objectSize85af30: exp("isaac_playerhud_85af30_object_size"),
    suffixVa858870: exp("isaac_playerhud_858870_ordinal_suffix_va"),
    rem100858870: exp("isaac_playerhud_858870_value_rem100"),
    rem1085870: exp("isaac_playerhud_858870_value_rem10"),
    va858870: exp("isaac_playerhud_858870_va"),
    retVa858870: exp("isaac_playerhud_858870_ret_va"),
    nextVa858870: exp("isaac_playerhud_858870_next_va"),
    entry857400: exp("isaac_playerhud_857400_entry"),
    needsLog857400: exp("isaac_playerhud_857400_needs_log"),
    plan857400: exp("isaac_playerhud_857400_plan"),
    va857400: exp("isaac_playerhud_857400_va"),
    retVa857400: exp("isaac_playerhud_857400_ret_va"),
    nextVa857400: exp("isaac_playerhud_857400_next_va"),
    float85e360: exp("isaac_playerhud_85e360_float_41c"),
    fieldOff85e360: exp("isaac_playerhud_85e360_field_off"),
    va85e360: exp("isaac_playerhud_85e360_va"),
    retVa85e360: exp("isaac_playerhud_85e360_ret_va"),
    nextVa85e360: exp("isaac_playerhud_85e360_next_va"),
    law9bfc00: exp("isaac_playerhud_9bfc00_law"),
    va9bfc00: exp("isaac_playerhud_9bfc00_va"),
    retVa9bfc00: exp("isaac_playerhud_9bfc00_ret_va"),
    nextVa9bfc00: exp("isaac_playerhud_9bfc00_next_va"),
    caller9bfc00: exp("isaac_playerhud_9bfc00_caller1_va"),
    law9bfc20: exp("isaac_playerhud_9bfc20_law"),
    va9bfc20: exp("isaac_playerhud_9bfc20_va"),
    retVa9bfc20: exp("isaac_playerhud_9bfc20_ret_va"),
    nextVa9bfc20: exp("isaac_playerhud_9bfc20_next_va"),
    caller9bfc20: exp("isaac_playerhud_9bfc20_caller1_va"),
    powBase9bfc40: exp("isaac_playerhud_9bfc40_pow_base"),
    powExp9bfc40: exp("isaac_playerhud_9bfc40_pow_exp_bits"),
    law9bfc40: exp("isaac_playerhud_9bfc40_law"),
    va9bfc40: exp("isaac_playerhud_9bfc40_va"),
    retVa9bfc40: exp("isaac_playerhud_9bfc40_ret_va"),
    nextVa9bfc40: exp("isaac_playerhud_9bfc40_next_va"),
    caller9bfc40: exp("isaac_playerhud_9bfc40_caller1_va"),
    clamp01: exp("isaac_playerhud_9c0120_clamp01"),
    lerpValue: exp("isaac_playerhud_9c0120_value"),
    va9c0120: exp("isaac_playerhud_9c0120_va"),
    retVa9c0120: exp("isaac_playerhud_9c0120_ret_va"),
    nextVa9c0120: exp("isaac_playerhud_9c0120_next_va"),
    vtblRef9c0120: exp("isaac_playerhud_9c0120_vtable_ref_rdata"),
    probeSlot9c0120: exp("isaac_playerhud_9c0120_probe_slot"),
    probeOff9c0120: exp("isaac_playerhud_9c0120_probe_vtbl_off"),
    aOff9c0120: exp("isaac_playerhud_9c0120_a_off"),
    bOff9c0120: exp("isaac_playerhud_9c0120_b_off"),
    clampLo: exp("isaac_playerhud_clamp_lo_rdata"),
    clampHi: exp("isaac_playerhud_clamp_hi_rdata"),
    clampZero: exp("isaac_playerhud_clamp_zero_bits"),
    clampOne: exp("isaac_playerhud_clamp_one_bits"),
    va9c0170: exp("isaac_playerhud_9c0170_va"),
    retVa9c0170: exp("isaac_playerhud_9c0170_ret_va"),
    nextVa9c0170: exp("isaac_playerhud_9c0170_next_va"),
    vtblRef9c0170: exp("isaac_playerhud_9c0170_vtable_ref_rdata"),
    retImm9c0170: exp("isaac_playerhud_9c0170_ret_imm"),
    aOff9c0170: exp("isaac_playerhud_9c0170_a_off"),
    bOff9c0170: exp("isaac_playerhud_9c0170_b_off"),
    cOff9c0170: exp("isaac_playerhud_9c0170_c_off"),
    dOff9c0170: exp("isaac_playerhud_9c0170_d_off"),
    pair9c0170: exp("isaac_playerhud_9c0170_pair"),
    law9c06a0: exp("isaac_playerhud_9c06a0_law"),
    va9c06a0: exp("isaac_playerhud_9c06a0_va"),
    retVa9c06a0: exp("isaac_playerhud_9c06a0_ret_va"),
    nextVa9c06a0: exp("isaac_playerhud_9c06a0_next_va"),
    retImm9c06a0: exp("isaac_playerhud_9c06a0_ret_imm"),
    caller1Va9c06a0: exp("isaac_playerhud_9c06a0_caller1_va"),
    caller2Va9c06a0: exp("isaac_playerhud_9c06a0_caller2_va"),
    obj1Off9c06a0: exp("isaac_playerhud_9c06a0_obj1_off"),
    probeSlot9c06a0: exp("isaac_playerhud_9c06a0_probe_slot"),
    probeOff9c06a0: exp("isaac_playerhud_9c06a0_probe_vtbl_off"),
    xOff9c06a0: exp("isaac_playerhud_9c06a0_obj1_x_off"),
    yOff9c06a0: exp("isaac_playerhud_9c06a0_obj1_y_off"),
    bOff9c06a0: exp("isaac_playerhud_9c06a0_this_b_off"),
    dOff9c06a0: exp("isaac_playerhud_9c06a0_this_d_off"),
    obj2Off9c06a0: exp("isaac_playerhud_9c06a0_obj2_off"),
    global19c06a0: exp("isaac_playerhud_global1_bss"),
    global29c06a0: exp("isaac_playerhud_global2_bss"),
    k1Rdata: exp("isaac_playerhud_k1_rdata"),
    k1Bits: exp("isaac_playerhud_k1_bits"),
    k2Rdata: exp("isaac_playerhud_k2_rdata"),
    k2Bits: exp("isaac_playerhud_k2_bits"),
    advance9c2210: exp("isaac_playerhud_9c2210_advance"),
    va9c2210: exp("isaac_playerhud_9c2210_va"),
    retVa9c2210: exp("isaac_playerhud_9c2210_ret_va"),
    nextVa9c2210: exp("isaac_playerhud_9c2210_next_va"),
    retImm9c2210: exp("isaac_playerhud_9c2210_ret_imm"),
    indexOff9c2210: exp("isaac_playerhud_9c2210_index_off"),
    vecBeginOff9c2210: exp("isaac_playerhud_9c2210_vec_begin_off"),
    vecEndOff9c2210: exp("isaac_playerhud_9c2210_vec_end_off"),
    stride9c2210: exp("isaac_playerhud_9c2210_stride"),
    divMagic9c2210: exp("isaac_playerhud_9c2210_div_magic"),
    divShift9c2210: exp("isaac_playerhud_9c2210_div_shift"),
    emptyFlagOff9c2210: exp("isaac_playerhud_9c2210_empty_flag_off"),
    emptyFlagBits9c2210: exp("isaac_playerhud_9c2210_empty_flag_bits"),
    caller1Va9c2210: exp("isaac_playerhud_9c2210_caller1_va"),
    caller2Va9c2210: exp("isaac_playerhud_9c2210_caller2_va"),
    caller3Va9c2210: exp("isaac_playerhud_9c2210_caller3_va"),
    caller4Va9c2210: exp("isaac_playerhud_9c2210_caller4_va"),
    searchClear9c0870: exp("isaac_playerhud_9c0870_search_clear"),
    va9c0870: exp("isaac_playerhud_9c0870_va"),
    retVa9c0870: exp("isaac_playerhud_9c0870_ret_va"),
    retExhaustVa9c0870: exp("isaac_playerhud_9c0870_ret_exhaust_va"),
    retClearedVa9c0870: exp("isaac_playerhud_9c0870_ret_cleared_va"),
    nextVa9c0870: exp("isaac_playerhud_9c0870_next_va"),
    retImm9c0870: exp("isaac_playerhud_9c0870_ret_imm"),
    indexOff9c0870: exp("isaac_playerhud_9c0870_index_off"),
    vecBeginOff9c0870: exp("isaac_playerhud_9c0870_vec_begin_off"),
    vecEndOff9c0870: exp("isaac_playerhud_9c0870_vec_end_off"),
    stride9c0870: exp("isaac_playerhud_9c0870_stride"),
    divMagic9c0870: exp("isaac_playerhud_9c0870_div_magic"),
    divShift9c0870: exp("isaac_playerhud_9c0870_div_shift"),
    flagAOff9c0870: exp("isaac_playerhud_9c0870_flag_a_off"),
    flagBOff9c0870: exp("isaac_playerhud_9c0870_flag_b_off"),
    emptyBits9c0870: exp("isaac_playerhud_9c0870_empty_bits"),
    caller1Va9c0870: exp("isaac_playerhud_9c0870_caller1_va"),
    caller2Va9c0870: exp("isaac_playerhud_9c0870_caller2_va"),
    caller3Va9c0870: exp("isaac_playerhud_9c0870_caller3_va"),
    caller4Va9c0870: exp("isaac_playerhud_9c0870_caller4_va"),
    gate9c2370: exp("isaac_playerhud_9c2370_gate"),
    va9c2370: exp("isaac_playerhud_9c2370_va"),
    retVa9c2370: exp("isaac_playerhud_9c2370_ret_va"),
    nextVa9c2370: exp("isaac_playerhud_9c2370_next_va"),
    probeSlot9c2370: exp("isaac_playerhud_9c2370_probe_slot"),
    probeOff9c2370: exp("isaac_playerhud_9c2370_probe_vtbl_off"),
    vtblRefA9c2370: exp("isaac_playerhud_9c2370_vtable_ref_rdata_a"),
    vtblRefB9c2370: exp("isaac_playerhud_9c2370_vtable_ref_rdata_b"),
    gateRdata9c2370: exp("isaac_playerhud_9c2370_gate_rdata"),
    gateBits9c2370: exp("isaac_playerhud_9c2370_gate_bits"),
    gate9bfc80: exp("isaac_playerhud_9bfc80_gate"),
    powBase9bfc80: exp("isaac_playerhud_9bfc80_pow_base"),
    powExp9bfc80: exp("isaac_playerhud_9bfc80_pow_exp_bits"),
    law9bfc80: exp("isaac_playerhud_9bfc80_law"),
    va9bfc80: exp("isaac_playerhud_9bfc80_va"),
    retVa9bfc80: exp("isaac_playerhud_9bfc80_ret_va"),
    nextVa9bfc80: exp("isaac_playerhud_9bfc80_next_va"),
    caller9bfc80: exp("isaac_playerhud_9bfc80_caller1_va"),
    gate9bfcd0: exp("isaac_playerhud_9bfcd0_gate"),
    powBase9bfcd0: exp("isaac_playerhud_9bfcd0_pow_base"),
    powExp9bfcd0: exp("isaac_playerhud_9bfcd0_pow_exp_bits"),
    law9bfcd0: exp("isaac_playerhud_9bfcd0_law"),
    va9bfcd0: exp("isaac_playerhud_9bfcd0_va"),
    retVa9bfcd0: exp("isaac_playerhud_9bfcd0_ret_va"),
    nextVa9bfcd0: exp("isaac_playerhud_9bfcd0_next_va"),
    caller9bfcd0: exp("isaac_playerhud_9bfcd0_caller1_va"),
    law9bfd00: exp("isaac_playerhud_9bfd00_law"),
    va9bfd00: exp("isaac_playerhud_9bfd00_va"),
    retVa9bfd00: exp("isaac_playerhud_9bfd00_ret_va"),
    nextVa9bfd00: exp("isaac_playerhud_9bfd00_next_va"),
    caller9bfd00: exp("isaac_playerhud_9bfd00_caller1_va"),
    law9bfd20: exp("isaac_playerhud_9bfd20_law"),
    va9bfd20: exp("isaac_playerhud_9bfd20_va"),
    retVa9bfd20: exp("isaac_playerhud_9bfd20_ret_va"),
    nextVa9bfd20: exp("isaac_playerhud_9bfd20_next_va"),
    caller9bfd20: exp("isaac_playerhud_9bfd20_caller1_va"),
    hostVaPowf: exp("isaac_playerhud_9bfc_host_va_powf"),
    hud84d740StringVa: exp("isaac_playerhud_84d740_string_va"),
    hud84d740NeedsLog: exp("isaac_playerhud_84d740_needs_log"),
    hud84d740Plan: exp("isaac_playerhud_84d740_plan"),
    hostVaLog: exp("isaac_playerhud_host_va_log"),
    hud84d8b0Intersect: exp("isaac_playerhud_84d8b0_intersect"),
    hud84da20Init: exp("isaac_playerhud_84da20_init"),
    hud84da20WritesDword: exp("isaac_playerhud_84da20_writes_dword"),
    hud84da20ObjectSize: exp("isaac_playerhud_84da20_object_size"),
    hud84da20SsoCapacity: exp("isaac_playerhud_84da20_sso_capacity"),
    hud84da20NextVa: exp("isaac_playerhud_84da20_next_va"),
    hud84dad0Init: exp("isaac_playerhud_84dad0_init"),
    hud84dad0WritesDword: exp("isaac_playerhud_84dad0_writes_dword"),
    hud84dad0WritesByte: exp("isaac_playerhud_84dad0_writes_byte"),
    hud84dad0ObjectSize: exp("isaac_playerhud_84dad0_object_size"),
    hud84dad0SsoCapacity: exp("isaac_playerhud_84dad0_sso_capacity"),
    hud84dad0HostVa: exp("isaac_playerhud_84dad0_host_va"),
    hud84dad0HostThisOff: exp("isaac_playerhud_84dad0_host_this_off"),
    hud84dad0NextVa: exp("isaac_playerhud_84dad0_next_va"),
    hud84db90Plan: exp("isaac_playerhud_84db90_plan"),
    hud84db90CallCount: exp("isaac_playerhud_84db90_call_count"),
    hud84db90ThisOffAt: exp("isaac_playerhud_84db90_this_off_at"),
    hud84db90HostVaAt: exp("isaac_playerhud_84db90_host_va_at"),
    hud84db90IsTailJmp: exp("isaac_playerhud_84db90_is_tail_jmp"),
    hud84db90NextVa: exp("isaac_playerhud_84db90_next_va"),
    hud84dbc0Plan: exp("isaac_playerhud_84dbc0_plan"),
    hud84dbc0CallCount: exp("isaac_playerhud_84dbc0_call_count"),
    hud84dbc0ThisOffAt: exp("isaac_playerhud_84dbc0_this_off_at"),
    hud84dbc0HostVaAt: exp("isaac_playerhud_84dbc0_host_va_at"),
    hud84dbc0IsTailJmp: exp("isaac_playerhud_84dbc0_is_tail_jmp"),
    hud84dbc0NextVa: exp("isaac_playerhud_84dbc0_next_va"),
    hud856840Needed: exp("isaac_playerhud_856840_needed"),
    hud856840Count: exp("isaac_playerhud_856840_count"),
    hud856840Plan: exp("isaac_playerhud_856840_plan"),
    hud856840CallCount: exp("isaac_playerhud_856840_call_count"),
    hud856840ThisOffAt: exp("isaac_playerhud_856840_this_off_at"),
    hud856840HostVaAt: exp("isaac_playerhud_856840_host_va_at"),
    hud856840Stride: exp("isaac_playerhud_856840_stride"),
    hud856840NextVa: exp("isaac_playerhud_856840_next_va"),
    hud84dea0Needed: exp("isaac_playerhud_84dea0_needed"),
    hud84dea0Plan: exp("isaac_playerhud_84dea0_plan"),
    hud84dea0CallCount: exp("isaac_playerhud_84dea0_call_count"),
    hud84dea0Xmm1OffAt: exp("isaac_playerhud_84dea0_xmm1_off_at"),
    hud84dea0LabelVaAt: exp("isaac_playerhud_84dea0_label_va_at"),
    hud84dea0LabelSizeAt: exp("isaac_playerhud_84dea0_label_size_at"),
    hud84dea0HostVa: exp("isaac_playerhud_84dea0_host_va"),
    hud84dea0NextVa: exp("isaac_playerhud_84dea0_next_va"),
    hud84e200XorpsNeeded: exp("isaac_playerhud_84e200_xorps_needed"),
    hud84e200NextVa: exp("isaac_playerhud_84e200_next_va"),
    hud84e5b0Count: exp("isaac_playerhud_84e5b0_count"),
    hud84e5b0InRange: exp("isaac_playerhud_84e5b0_in_range"),
    hud84e5b0EarlyTrue: exp("isaac_playerhud_84e5b0_early_true"),
    hud84e5b0Prefix: exp("isaac_playerhud_84e5b0_prefix"),
    hud84e5b0ObjectOff: exp("isaac_playerhud_84e5b0_object_off"),
    hud84e5b0DwordCount: exp("isaac_playerhud_84e5b0_dword_count"),
    hud84e5b0WhitelistOk: exp("isaac_playerhud_84e5b0_whitelist_ok"),
    hud84e5b0BlacklistOk: exp("isaac_playerhud_84e5b0_blacklist_ok"),
    hud84e5b0CompletionPrefix: exp("isaac_playerhud_84e5b0_completion_prefix"),
    hud84e5b0ModeOk: exp("isaac_playerhud_84e5b0_mode_ok"),
    hud84e5b0Decide: exp("isaac_playerhud_84e5b0_decide"),
    hud84e5b0Plan: exp("isaac_playerhud_84e5b0_plan"),
    hud84e5b0VecOffAt: exp("isaac_playerhud_84e5b0_vec_off_at"),
    hud84e5b0HostVaAt: exp("isaac_playerhud_84e5b0_host_va_at"),
    hud84e5b0FailIfAlAt: exp("isaac_playerhud_84e5b0_fail_if_al_at"),
    hud84e5b0Stride: exp("isaac_playerhud_84e5b0_stride"),
    hud84e5b0NextVa: exp("isaac_playerhud_84e5b0_next_va"),
    hud84e820GateZero: exp("isaac_playerhud_84e820_gate_zero"),
    hud84e820Count: exp("isaac_playerhud_84e820_count"),
    hud84e820PtrCount: exp("isaac_playerhud_84e820_ptr_count"),
    hud84e820InRange: exp("isaac_playerhud_84e820_in_range"),
    hud84e820LoopCont: exp("isaac_playerhud_84e820_loop_cont"),
    hud84e820RangeEmpty: exp("isaac_playerhud_84e820_range_empty"),
    hud84e820SpecialOk: exp("isaac_playerhud_84e820_special_ok"),
    hud84e820AlHit: exp("isaac_playerhud_84e820_al_hit"),
    hud84e820EntryInc: exp("isaac_playerhud_84e820_entry_inc"),
    hud84e820ExtraSum: exp("isaac_playerhud_84e820_extra_sum"),
    hud84e820Decide: exp("isaac_playerhud_84e820_decide"),
    hud84e820Plan: exp("isaac_playerhud_84e820_plan"),
    hud84e820HostVaAt: exp("isaac_playerhud_84e820_host_va_at"),
    hud84e820Stride: exp("isaac_playerhud_84e820_stride"),
    hud84e820NextVa: exp("isaac_playerhud_84e820_next_va"),
    hud8568a0Plan: exp("isaac_playerhud_8568a0_plan"),
    hud8568a0CallCount: exp("isaac_playerhud_8568a0_call_count"),
    hud8568a0ThisOffAt: exp("isaac_playerhud_8568a0_this_off_at"),
    hud8568a0ArgOffAt: exp("isaac_playerhud_8568a0_arg_off_at"),
    hud8568a0HostVaAt: exp("isaac_playerhud_8568a0_host_va_at"),
    hud8568a0TailBeginOff: exp("isaac_playerhud_8568a0_tail_begin_off"),
    hud8568a0TailDwordCount: exp("isaac_playerhud_8568a0_tail_dword_count"),
    hud8568a0ObjectSize: exp("isaac_playerhud_8568a0_object_size"),
    hud8568a0NextVa: exp("isaac_playerhud_8568a0_next_va"),
    hud8568a0TailCopy: exp("isaac_playerhud_8568a0_tail_copy"),
    hud856e10MoveCtor: exp("isaac_playerhud_856e10_move_ctor"),
    hud856e10ObjectSize: exp("isaac_playerhud_856e10_object_size"),
    hud856e10NextVa: exp("isaac_playerhud_856e10_next_va"),
    hud856960Needed: exp("isaac_playerhud_856960_needed"),
    hud856960Count: exp("isaac_playerhud_856960_count"),
    hud856960MoveRange: exp("isaac_playerhud_856960_move_range"),
    hud856960Stride: exp("isaac_playerhud_856960_stride"),
    hud856960MoveCtorVa: exp("isaac_playerhud_856960_move_ctor_va"),
    hud856960WipeVa: exp("isaac_playerhud_856960_wipe_va"),
    hud856960NextVa: exp("isaac_playerhud_856960_next_va"),
    pocketUpgradeSlotCount: exp("isaac_playerhud_pocket_upgrade_slot_count"),
    pocketUpgradeSlotByteOffset: exp(
      "isaac_playerhud_pocket_upgrade_slot_byte_offset",
    ),
    pocketUpgradeSlotIsUpgrade: exp(
      "isaac_playerhud_pocket_upgrade_slot_is_upgrade",
    ),
    pocketUpgradeArrayPtrByteOffset: exp(
      "isaac_playerhud_pocket_upgrade_array_ptr_byte_offset",
    ),
    pocketUpgradeArrayElementDwordIndex: exp(
      "isaac_playerhud_pocket_upgrade_array_element_dword_index",
    ),
    pocketUpgradeArrayIdByteOffset: exp(
      "isaac_playerhud_pocket_upgrade_array_id_byte_offset",
    ),
    pocketUpgradeResolveKind: exp("isaac_playerhud_pocket_upgrade_resolve_kind"),
    pocketUpgradeResolveIndex: exp(
      "isaac_playerhud_pocket_upgrade_resolve_index",
    ),
    pocketUpgradeEntryUsable: exp("isaac_playerhud_pocket_upgrade_entry_usable"),
    pocketUpgradeTakeResultValue: exp(
      "isaac_playerhud_pocket_upgrade_take_result_value",
    ),
    pocketUpgradeBranchKind: exp("isaac_playerhud_pocket_upgrade_branch_kind"),
    pocketUpgradeInsertValue: exp(
      "isaac_playerhud_pocket_upgrade_insert_value",
    ),
    pocketUpgradeConfigPathPtr: exp(
      "isaac_playerhud_pocket_upgrade_config_path_ptr",
    ),
    pocketUpgradeGlobalCallbackNeeded: exp(
      "isaac_playerhud_pocket_upgrade_global_callback_needed",
    ),
    pocketUpgradeResultFollowupNeeded: exp(
      "isaac_playerhud_pocket_upgrade_result_followup_needed",
    ),
    pocketUpgradeResultCopyByteOffset: exp(
      "isaac_playerhud_pocket_upgrade_result_copy_byte_offset",
    ),
    pocketUpgradeBuildNodeResultEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_build_node_result_ebp_off",
    ),
    pocketUpgradeBuildNodeObjEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_build_node_obj_ebp_off",
    ),
    pocketUpgradeListHeadEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_list_head_ebp_off",
    ),
    pocketUpgradeValueEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_value_ebp_off",
    ),
    pocketUpgradeElemEbpOff: exp("isaac_playerhud_pocket_upgrade_elem_ebp_off"),
    pocketUpgradeVirtualEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_virtual_ebp_off",
    ),
    pocketUpgradeGlobalArgEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_global_arg_ebp_off",
    ),
    pocketUpgradeSehFirst: exp("isaac_playerhud_pocket_upgrade_seh_first"),
    pocketUpgradeSehCount: exp("isaac_playerhud_pocket_upgrade_seh_count"),
    pocketUpgradeCallbackCount: exp(
      "isaac_playerhud_pocket_upgrade_callback_count",
    ),
    pocketUpgradeConfigLoadImageResultEbpOff: exp(
      "isaac_playerhud_pocket_upgrade_config_load_image_result_ebp_off",
    ),
    pocketUpgradeConfigElem2EbpOff: exp(
      "isaac_playerhud_pocket_upgrade_config_elem2_ebp_off",
    ),
    pocketUpgradeConfigValue2EbpOff: exp(
      "isaac_playerhud_pocket_upgrade_config_value2_ebp_off",
    ),
    pocketUpgradeConfigVirtual2EbpOff: exp(
      "isaac_playerhud_pocket_upgrade_config_virtual2_ebp_off",
    ),
    pocketUpgradeConfigVirtual3EbpOff: exp(
      "isaac_playerhud_pocket_upgrade_config_virtual3_ebp_off",
    ),
    pocketUpgradeConfigCapacityByteOffset: exp(
      "isaac_playerhud_pocket_upgrade_config_capacity_byte_offset",
    ),
    hostVaPocketUpgradeBuildNode: exp(
      "isaac_playerhud_host_va_pocket_upgrade_build_node",
    ),
    hostVaPocketUpgradeNodeRemove: exp(
      "isaac_playerhud_host_va_pocket_upgrade_node_remove",
    ),
    hostVaFree: exp("isaac_playerhud_host_va_free"),
    pocketUpgradePlan: exp("isaac_playerhud_pocket_upgrade_plan"),
    pocketSecondListGate: exp("isaac_playerhud_pocket_second_list_gate"),
    pocketSecondListCount: exp("isaac_playerhud_pocket_second_list_count"),
    pocketSecondListIterationNeeded: exp(
      "isaac_playerhud_pocket_second_list_iteration_needed",
    ),
    pocketSecondListEntryUsable: exp(
      "isaac_playerhud_pocket_second_list_entry_usable",
    ),
    pocketSecondListVecBeginByteOffset: exp(
      "isaac_playerhud_pocket_second_list_vec_begin_byte_offset",
    ),
    pocketSecondListVecEndByteOffset: exp(
      "isaac_playerhud_pocket_second_list_vec_end_byte_offset",
    ),
    memory: wasm.memory,
  };
}

/** Pack IsaacPlayerHudActivePathInputs (24 bytes) into wasm memory. */
function writeActivePathInputs(view, base, input) {
  writeI32(view, base + 0, input.slotIndex ?? 0);
  writeI32(view, base + 4, input.activeItemId ?? 0);
  writeI32(view, base + 8, input.playerType ?? 0);
  writeI32(view, base + 12, input.playerDword1818 ?? 0);
  writeI32(view, base + 16, input.playerActiveCharge ?? 0);
  writeI8(view, base + 20, input.playerByte202c ?? 0);
  writeI8(view, base + 21, input.playerByte20a9 ?? 0);
  writeI8(view, base + 22, input.hasCollectible0x26b ? 1 : 0);
  writeI8(view, base + 23, 0);
}

function writeI32(view, offset, value) {
  view.setInt32(offset, value | 0, true);
}
function readI32(view, offset) {
  return view.getInt32(offset, true);
}
function writeF32(view, offset, value) {
  view.setFloat32(offset, value, true);
}
function readF32(view, offset) {
  return view.getFloat32(offset, true);
}
function writeI8(view, offset, value) {
  view.setInt8(offset, value);
}
function readI8(view, offset) {
  return view.getInt8(offset);
}
function writeU8(view, offset, value) {
  view.setUint8(offset, value & 0xff);
}
function readU8(view, offset) {
  return view.getUint8(offset);
}
function readU32(view, offset) {
  return view.getUint32(offset, true);
}

/** Pack IsaacPlayerHudUpdateHeartsInput (52 bytes) into wasm memory. */
function writeUpdateHeartsInput(view, base, input) {
  writeI32(view, base + 0, input.playerType ?? 0);
  writeI32(view, base + 4, input.maxHearts ?? 0);
  writeI32(view, base + 8, input.redHearts ?? 0);
  writeI32(view, base + 12, input.eternalHearts ?? 0);
  writeI32(view, base + 16, input.soulHearts ?? 0);
  writeI32(view, base + 20, input.blackHeartsMask ?? 0);
  writeI32(view, base + 24, input.boneCount ?? 0);
  writeI32(view, base + 28, input.boneMask ?? 0);
  writeI32(view, base + 32, input.brokenHearts ?? 0);
  writeI32(view, base + 36, input.rottenHearts ?? 0);
  writeI32(view, base + 40, input.heartIconCount ?? 0);
  writeI32(view, base + 44, input.field1ef4 ?? 0);
  writeI8(view, base + 48, input.hudCharC ?? 0);
  writeI8(view, base + 49, input.hudCharD ?? 0);
  writeI8(view, base + 50, input.hasCollectible0x26b ? 1 : 0);
  writeI8(view, base + 51, 0);
}

test("header declares PlayerHUD pure helpers ABI v30; Update-wired at ABI v40", () => {
  assert.ok(existsSync(header));
  assert.ok(existsSync(source));
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_PLAYERHUD_POST_UPDATE_PURE_HELPERS_ABI_VERSION = 44/);
  assert.match(h, /Helpers ABI v39: 7-leaf StatHUD conversion cluster/);
  assert.match(h, /isaac_playerhud_9bfc00_law/);
  assert.match(h, /isaac_playerhud_9bfc80_gate/);
  assert.match(h, /0x009bfc00/);
  assert.match(h, /0x009bfd40/);
  assert.match(h, /ABI v41: 0x009c06a0 probe-sum vec2 law/);
  assert.match(h, /isaac_playerhud_9c06a0_law/);
  assert.match(h, /IsaacPlayerHud9c06a0Pair/);
  assert.match(h, /isaac_playerhud_9c06a0_ret_imm/);
  assert.match(h, /0x009c06a0/);
  assert.match(h, /0x009c0757/);
  assert.match(h, /0x009c075a/);
  assert.match(h, /0x00420800/);
  assert.match(h, /0x008403c0/);
  assert.match(h, /0x00c7997c/);
  assert.match(h, /ABI v43: 0x009c0870 merged slot-search\/clear/);
  assert.match(h, /isaac_playerhud_9c0870_search_clear/);
  assert.match(h, /isaac_playerhud_9c0870_next_va/);
  assert.match(h, /0x009c0870/);
  assert.match(h, /0x009c0958/);
  assert.match(h, /0x009c0960/);
  assert.match(h, /0x00420670/);
  assert.match(h, /ABI v44: 0x009c2370 probe-threshold gate/);
  assert.match(h, /isaac_playerhud_9c2370_gate/);
  assert.match(h, /0x009c2370/);
  assert.match(h, /0x009c23a0/);
  assert.match(h, /0x00b7ed2c/);
  assert.match(h, /0x00baa804/);
  assert.match(h, /ABI v42: 0x9c2210 slot-index advance machine/);
  assert.match(h, /isaac_playerhud_9c2210_advance/);
  assert.match(h, /isaac_playerhud_9c2210_next_va/);
  assert.match(h, /0x009c2210/);
  assert.match(h, /0x009c22a4/);
  assert.match(h, /0x009c22b0/);
  assert.match(h, /0x009c092c/);
  assert.match(h, /0x2aaaaaab/);
  assert.match(h, /Helpers ABI v34: pure leaf gate FUN_00856f50/);
  assert.match(h, /isaac_playerhud_856f50_gate/);
  assert.match(h, /Helpers ABI v35: pure time-pack leaf FUN_0085af30/);
  assert.match(h, /isaac_playerhud_85af30_pack/);
  assert.match(h, /0x0085afb0/);
  assert.match(h, /Helpers ABI v36: pure ordinal-suffix leaf FUN_00858870/);
  assert.match(h, /isaac_playerhud_858870_ordinal_suffix_va/);
  assert.match(h, /0x008588f0/);
  assert.match(h, /Helpers ABI v37: pure leaderboard type->entry getter FUN_00857400/);
  assert.match(h, /isaac_playerhud_857400_entry/);
  assert.match(h, /isaac_playerhud_857400_plan/);
  assert.match(h, /0x00857450/);
  assert.match(h, /IsaacPlayerHud857400Plan/);
  assert.match(h, /Helpers ABI v38: pure float getter FUN_0085e360/);
  assert.match(h, /isaac_playerhud_85e360_float_41c/);
  assert.match(h, /0x0085e360/);
  assert.match(h, /0x0085e370/);
  assert.match(h, /0x0085e366/);
  assert.match(h, /Helpers ABI v17: pure UpdateHearts call-site plan/);
  assert.match(h, /Helpers ABI v18: pure StatHUD progress-slot tween/);
  assert.match(h, /isaac_playerhud_stat_bar_tween/);
  assert.match(h, /Helpers ABI v19: pure 6-slot StatHUD progress updater/);
  assert.match(h, /isaac_playerhud_84e9d0_update/);
  assert.match(h, /IsaacPlayerHud84e9d0SlotState/);
  assert.match(h, /Helpers ABI v20: pure action-id to rdata-string select/);
  assert.match(h, /isaac_playerhud_84d740_string_va/);
  assert.match(h, /isaac_playerhud_84d740_plan/);
  assert.match(h, /Helpers ABI v21: pure 2-segment SSE intersect/);
  assert.match(h, /isaac_playerhud_84d8b0_intersect/);
  assert.match(h, /IsaacPlayerHud84d8b0Result/);
  assert.match(h, /Helpers ABI v22: pure thiscall MSVC SSO-string/);
  assert.match(h, /isaac_playerhud_84da20_init/);
  assert.match(h, /isaac_playerhud_84da20_next_va/);
  assert.match(h, /Helpers ABI v23: pure thiscall SEH ctor prefix/);
  assert.match(h, /isaac_playerhud_84dad0_init/);
  assert.match(h, /isaac_playerhud_84dad0_next_va/);
  assert.match(h, /0x006efa40/);
  assert.match(h, /Helpers ABI v24: typed host plan for thiscall 4-subobject/);
  assert.match(h, /isaac_playerhud_84db90_plan/);
  assert.match(h, /isaac_playerhud_84db90_next_va/);
  assert.match(h, /0x008562b0/);
  assert.match(h, /0x0040d040/);
  assert.match(h, /0x0084dbc0/);
  assert.match(h, /Helpers ABI v25: typed host plan for thiscall 7-subobject/);
  assert.match(h, /isaac_playerhud_84dbc0_plan/);
  assert.match(h, /isaac_playerhud_84dbc0_next_va/);
  assert.match(h, /0x004149d0/);
  assert.match(h, /0x0084dc00/);
  assert.match(h, /Helpers ABI v26: typed host plan for range wipe/);
  assert.match(h, /Helpers ABI v27: typed host GATE\/PLAN for FUN_0084dea0/);
  assert.match(h, /Helpers ABI v28: FUN_0084e5b0 predicate GATE\/PLAN/);
  assert.match(h, /Helpers ABI v29: FUN_0084e820 counter GATE\/PLAN/);
  assert.match(h, /Helpers ABI v30: typed host COPY plan for FUN_008568a0/);
  assert.match(h, /Helpers ABI v32: RecomputeStats 0x84ca00 mask-dispatch/);
  assert.match(h, /isaac_playerhud_84ca00_flag/);
  assert.match(h, /isaac_playerhud_84ca00_clamp/);
  assert.match(h, /isaac_playerhud_84ca00_slot_active/);
  assert.match(h, /isaac_playerhud_84ca00_slot_target/);
  assert.match(h, /Helpers ABI v33: per-player StatHUD stats-pack updater/);
  assert.match(h, /isaac_playerhud_84cc40_block_kind/);
  assert.match(h, /isaac_playerhud_84cc40_recompute_plan/);
  assert.match(h, /IsaacPlayerHud84cc40RecomputePlan/);
  assert.match(h, /0x0084cc40/);
  assert.match(h, /0x0084d6ad/);
  assert.match(h, /0x0084ca00/);
  assert.match(h, /0x0084cc38/);
  assert.match(h, /0x007f92b0/);
  assert.match(h, /0x00749830/);
  assert.match(h, /0x007f96f0/);
  assert.match(h, /0x0084d6b0/);
  assert.match(h, /Helpers ABI v34: pure leaf gate FUN_00856f50/);
  assert.match(h, /isaac_playerhud_856f50_gate/);
  assert.match(h, /0x00856f50/);
  assert.match(h, /0x00856f61/);
  assert.match(h, /0x00856f70/);
  assert.match(h, /isaac_playerhud_84e820_gate_zero/);
  assert.match(h, /isaac_playerhud_84e820_decide/);
  assert.match(h, /isaac_playerhud_84e820_plan/);
  assert.match(h, /isaac_playerhud_84e820_next_va/);
  assert.match(h, /0x0084e9d0/);
  assert.match(h, /isaac_playerhud_84e5b0_count/);
  assert.match(h, /isaac_playerhud_84e5b0_decide/);
  assert.match(h, /isaac_playerhud_84e5b0_plan/);
  assert.match(h, /isaac_playerhud_84e5b0_next_va/);
  assert.match(h, /0x0084e820/);
  assert.match(h, /isaac_playerhud_84dea0_needed/);
  assert.match(h, /isaac_playerhud_84dea0_plan/);
  assert.match(h, /isaac_playerhud_84dea0_xmm1_off_at/);
  assert.match(h, /isaac_playerhud_84dea0_label_va_at/);
  assert.match(h, /isaac_playerhud_84dea0_label_size_at/);
  assert.match(h, /isaac_playerhud_84dea0_host_va/);
  assert.match(h, /isaac_playerhud_84dea0_next_va/);
  assert.match(h, /isaac_playerhud_84e200_xorps_needed/);
  assert.match(h, /isaac_playerhud_84e200_next_va/);
  assert.match(h, /0x0084dea0/);
  assert.match(h, /0x0084e200/);
  assert.match(h, /0x0084e5b0/);
  assert.match(h, /0x0084dc00/);
  assert.match(h, /isaac_playerhud_856840_needed/);
  assert.match(h, /isaac_playerhud_856840_count/);
  assert.match(h, /isaac_playerhud_856840_plan/);
  assert.match(h, /isaac_playerhud_856840_this_off_at/);
  assert.match(h, /isaac_playerhud_856840_host_va_at/);
  assert.match(h, /isaac_playerhud_856840_next_va/);
  assert.match(h, /0x00856840/);
  assert.match(h, /0x008568a0/);
  assert.match(h, /IsaacPlayerHud8568a0CopyPlan/);
  assert.match(h, /isaac_playerhud_8568a0_plan/);
  assert.match(h, /isaac_playerhud_8568a0_call_count/);
  assert.match(h, /isaac_playerhud_8568a0_this_off_at/);
  assert.match(h, /isaac_playerhud_8568a0_arg_off_at/);
  assert.match(h, /isaac_playerhud_8568a0_host_va_at/);
  assert.match(h, /isaac_playerhud_8568a0_tail_begin_off/);
  assert.match(h, /isaac_playerhud_8568a0_tail_dword_count/);
  assert.match(h, /isaac_playerhud_8568a0_object_size/);
  assert.match(h, /isaac_playerhud_8568a0_next_va/);
  assert.match(h, /0x00856960/);
  assert.match(h, /0x0040cf50/);
  assert.match(h, /0x0043eca0/);
  assert.match(h, /Helpers ABI v31: FUN_00856960 stdcall range move-ctor/);
  assert.match(h, /isaac_playerhud_856e10_move_ctor/);
  assert.match(h, /isaac_playerhud_856960_move_range/);
  assert.match(h, /isaac_playerhud_856960_needed/);
  assert.match(h, /isaac_playerhud_856960_count/);
  assert.match(h, /isaac_playerhud_856960_stride/);
  assert.match(h, /isaac_playerhud_856960_move_ctor_va/);
  assert.match(h, /isaac_playerhud_856960_wipe_va/);
  assert.match(h, /isaac_playerhud_856960_next_va/);
  assert.match(h, /0x008569a0/);
  assert.match(h, /0x00856e10/);
  assert.match(h, /0x00856f4a/);
  assert.match(h, /Helpers ABI v16: tail completion to the function epilogue/);
  assert.match(h, /Helpers ABI v13: P6 pocket-upgrade residual \(VA 0x0084327d\.\.0x008435ed\)/);
  assert.match(h, /Helpers ABI v14: tail residuals after the P6\/P7 loops/);
  assert.match(h, /isaac_playerhud_tail_rebuild_plan/);
  assert.match(h, /0x00843a62/);
  assert.match(h, /0x00843af1/);
  assert.match(h, /0x00843ba6/);
  assert.match(h, /0x00414a80/);
  assert.match(h, /0x0083b830/);
  assert.match(h, /0x0084bba0/);
  assert.match(h, /0x00748490/);
  assert.match(h, /0x00b63a18/);
  assert.match(h, /isaac_playerhud_pocket_upgrade_plan/);
  assert.match(h, /isaac_playerhud_pocket_second_list_gate/);
  assert.match(h, /0x0084325d/);
  assert.match(h, /0x0084327d/);
  assert.match(h, /0x008435ed/);
  assert.match(h, /0x00843667/);
  assert.match(h, /0x00843a5c/);
  assert.match(h, /0x004288a0/);
  assert.match(h, /0x00415d20/);
  assert.match(h, /0x00aef15c/);
  assert.match(h, /0x00842230/);
  assert.match(h, /0x00841e20/);
  assert.match(h, /0x0084240d/);
  assert.match(h, /0x00842486/);
  assert.match(h, /0x00842499/);
  assert.match(h, /0x0084250f/);
  assert.match(h, /0x0084298b/);
  assert.match(h, /0x00842a5b/);
  assert.match(h, /0x00842c92/);
  assert.match(h, /0x00842f8a/);
  assert.match(h, /isaac_playerhud_critical_heart_blink/);
  assert.match(h, /isaac_playerhud_update_hearts_pure/);
  assert.match(h, /isaac_playerhud_get_health_type/);
  assert.match(h, /isaac_playerhud_active_book_overlay_id/);
  assert.match(h, /isaac_playerhud_active_id_cache_changed/);
  assert.match(h, /isaac_playerhud_book_overlay_cache_changed/);
  assert.match(h, /isaac_playerhud_active_gfx_cache_plan/);
  assert.match(h, /isaac_playerhud_item_config_resolve/);
  assert.match(h, /isaac_playerhud_active_item_path_kind/);
  assert.match(h, /isaac_playerhud_active_load_image_prep/);
  assert.match(h, /isaac_playerhud_skips_active_load_image/);
  assert.match(h, /isaac_playerhud_sp_clear_pair_apply_base/);
  assert.match(h, /isaac_playerhud_active_load_image_call/);
  assert.match(h, /isaac_playerhud_active_dirty_set/);
  assert.match(h, /isaac_playerhud_load_image_path_buffer_ebp_off/);
  assert.match(h, /isaac_playerhud_book_load_image_call/);
  assert.match(h, /isaac_playerhud_book_image_sp_byte_offset/);
  assert.match(h, /isaac_playerhud_book_load_image_result_ebp_off/);
  assert.match(h, /isaac_playerhud_book_materialize_seh_try_level/);
  assert.match(h, /isaac_playerhud_trinket_gfx_plan/);
  assert.match(h, /isaac_playerhud_trinket_mask_id/);
  assert.match(h, /isaac_playerhud_trinket_apply_0x4b_remask/);
  assert.equal(PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION, 44);
  assert.match(h, /isaac_playerhud_pocket_gfx_plan/);
  assert.match(h, /isaac_playerhud_pocket_resolved_id/);
  assert.match(h, /isaac_playerhud_pocket_cache_apply_at/);
  assert.match(h, /isaac_playerhud_pocket_path_kind/);
  assert.match(h, /isaac_playerhud_host_va_get_room_by_idx/);
  assert.match(h, /isaac_playerhud_host_va_sp_swap/);
  assert.match(h, /isaac_playerhud_host_va_dirty_notify/);
  assert.match(h, /isaac_playerhud_host_va_get_entity/);
  assert.match(h, /isaac_playerhud_host_va_anm2_load/);
  assert.match(h, /isaac_playerhud_host_va_anm2_reset/);
  assert.match(h, /isaac_playerhud_host_va_has_collectible/);
  assert.match(h, /isaac_playerhud_host_va_load_image/);
  assert.match(h, /isaac_playerhud_host_va_item_config_get_collectible/);
  assert.match(h, /isaac_playerhud_host_va_sp_materialize/);
  assert.match(h, /0x007706e0/);
  assert.match(h, /0x009588a0/);
  assert.match(h, /0x0072fd10/);
  assert.match(h, /0x0040c550/);
  assert.match(h, /0x00740bc0/);
  assert.match(h, /0x0040c3b0/);
  assert.match(h, /0x009a8970/);
  assert.match(h, /0x00694fb0/);
  assert.match(h, /0x0040bd50/);
  assert.match(h, /0x00407f10/);
  assert.equal(PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION, 44);
  assert.equal(PLAYERHUD_HOST_VA_HAS_COLLECTIBLE, 0x007706e0);
  assert.equal(PLAYERHUD_HOST_VA_LOAD_IMAGE, 0x009588a0);
  assert.equal(PLAYERHUD_HOST_VA_SMART_PTR_CLEAR, 0x0040c7f0);
  assert.equal(PLAYERHUD_HOST_VA_ITEM_CONFIG_GET_COLLECTIBLE, 0x0072fd10);
  assert.equal(PLAYERHUD_HOST_VA_SP_MATERIALIZE, 0x0040c550);
  assert.equal(PLAYERHUD_HOST_VA_GET_ROOM_BY_IDX, 0x00740bc0);
  assert.equal(PLAYERHUD_HOST_VA_SP_SWAP, 0x0040c3b0);
  assert.equal(PLAYERHUD_HOST_VA_DIRTY_NOTIFY, 0x009a8970);
  assert.equal(PLAYERHUD_HOST_VA_GET_ENTITY, 0x00694fb0);
  assert.equal(PLAYERHUD_HOST_VA_ANM2_LOAD, 0x0040bd50);
  assert.equal(PLAYERHUD_HOST_VA_ANM2_RESET, 0x00407f10);
  assert.equal(PLAYERHUD_TRINKET_SLOT_COUNT, 2);
  assert.match(h, /class-wide byte-parameter sweep/);
  assert.equal(PLAYERHUD_TRINKET_SLOT_STRIDE, 0x18);
  assert.equal(PLAYERHUD_CACHED_TRINKET_ID_BASE, 0x200);
  assert.equal(PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE, 0x204);
  assert.equal(PLAYERHUD_TRINKET_IMAGE_SP_BASE, 0x208);
  assert.equal(PLAYERHUD_PLAYER_TRINKET_ID_BASE, 0x16c0);
  assert.equal(PLAYERHUD_PLAYER_TRINKET_SECONDARY, 0x1fb8);
  assert.equal(PLAYERHUD_TRINKET_TICK_CACHED_ID, 0xa6);
  assert.equal(PLAYERHUD_TRINKET_SPECIAL_0x4b, 0x4b);
  assert.equal(PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF, -0x1448);
  assert.equal(PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF, -0x1444);
  assert.equal(PLAYERHUD_TRINKET_SEH_TRY_LEVEL, 0xc);
  assert.equal(PLAYERHUD_TRINKET_DIRTY_AFTER_GFX, 1);
  assert.equal(PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET, 3);
  assert.equal(PLAYERHUD_POCKET_SLOT_COUNT, 4);
  assert.equal(PLAYERHUD_POCKET_SLOT_STRIDE, 0x11c);
  assert.equal(PLAYERHUD_CACHED_POCKET_TYPE_BASE, 0x230);
  assert.equal(PLAYERHUD_CACHED_POCKET_ID_BASE, 0x234);
  assert.equal(PLAYERHUD_POCKET_ANM2_BASE, 0x238);
  assert.equal(PLAYERHUD_PLAYER_POCKET_ID_BASE, 0x17a0);
  assert.equal(PLAYERHUD_PLAYER_POCKET_TYPE_BASE, 0x17a4);
  assert.equal(PLAYERHUD_POCKET_TYPE_CARD, 0);
  assert.equal(PLAYERHUD_POCKET_TYPE_PILL, 1);
  assert.equal(PLAYERHUD_MANAGER_PILL_VEC_BEGIN, 0x2a428);
  assert.equal(PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF, 0x2a670);
  assert.equal(PLAYERHUD_GET_ENTITY_TYPE, 5);
  assert.equal(PLAYERHUD_GET_ENTITY_VARIANT_CARD, 0x46);
  assert.equal(PLAYERHUD_GET_ENTITY_VARIANT_PILL, 0x12c);
  assert.equal(PLAYERHUD_ENTITY_ANM_PATH_OFF, 0x74);
  assert.equal(PLAYERHUD_ANM2_LOAD_GRAPHICS, 1);
  assert.equal(PLAYERHUD_POCKET_PATH_KIND_RESET, 0);
  assert.equal(PLAYERHUD_POCKET_PATH_KIND_CARD, 1);
  assert.equal(PLAYERHUD_POCKET_PATH_KIND_PILL, 2);
  assert.equal(PLAYERHUD_SP_CLEAR_ALLOC_SIZE, 0x18);
  assert.equal(PLAYERHUD_SP_CLEAR_VTABLE, 0x00b1a6e0);
  assert.equal(PLAYERHUD_ITEMCFG_GFX_STRING_OFF, 0x38);
  assert.equal(PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF, 0x4c);
  assert.equal(PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD, 0x10);
  assert.equal(PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF, -0x418);
  assert.equal(PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF, -0x14a8);
  assert.equal(PLAYERHUD_MATERIALIZE_THIS_EBP_OFF, -0x14a0);
  assert.equal(PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF, -0x1428);
  assert.equal(PLAYERHUD_DIRTY_FLAG_EBP_OFF, -0x1419);
  assert.equal(PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF, -0x14a4);
  assert.equal(PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF, -0x149c);
  assert.equal(PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL, 0);
  assert.equal(PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX, 1);
  assert.equal(PLAYERHUD_BOOK_IMAGE_SP_BASE, 0x1a0);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES, -0x14b8);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES, -0x14b0);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES, -0x14b4);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES, -0x14ac);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES, 3);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL, -0x14c8);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL, -0x14c0);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL, -0x14c4);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL, -0x14bc);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL, 6);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH, -0x14d8);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH, -0x14d0);
  assert.equal(PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH, -0x14d4);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH, -0x14cc);
  assert.equal(PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH, 9);
  assert.equal(PLAYERHUD_BOOK_SP_CLEAR_ARG, 0);
  assert.equal(PLAYERHUD_BOOK_DIRTY_AFTER_GFX, 1);
  /* ABI v40 wires pure islands + UpdateHearts host into maybe_emit_hud_post_update. */
  const cpp = readFileSync(sliceCpp, "utf8");
  assert.match(cpp, /playerhud_post_update_pure_helpers/);
  assert.match(cpp, /isaac_playerhud_critical_heart_blink/);
  assert.match(cpp, /isaac_playerhud_update_hearts_uses_twin/);
  assert.match(cpp, /player_hud_update_hearts/);
  /* Pure UpdateHearts body + book overlay + cache plan + v5..v10 freestanding. */
  assert.doesNotMatch(cpp, /isaac_playerhud_update_hearts_pure/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_book_overlay_id/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_gfx_cache_plan/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_id_cache_changed/);
  assert.doesNotMatch(cpp, /isaac_playerhud_item_config_resolve/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_item_path_kind/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_load_image_prep/);
  assert.doesNotMatch(cpp, /isaac_playerhud_skips_active_load_image/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_load_image_call/);
  assert.doesNotMatch(cpp, /isaac_playerhud_active_dirty_set/);
  assert.doesNotMatch(cpp, /isaac_playerhud_book_load_image_call/);
  assert.doesNotMatch(cpp, /isaac_playerhud_book_image_sp_byte_offset/);
  assert.doesNotMatch(cpp, /isaac_playerhud_trinket_gfx_plan/);
  assert.doesNotMatch(cpp, /isaac_playerhud_trinket_mask_id/);
  assert.doesNotMatch(cpp, /isaac_playerhud_trinket_cache_apply_at/);
  assert.doesNotMatch(cpp, /isaac_playerhud_pocket_gfx_plan/);
  assert.doesNotMatch(cpp, /isaac_playerhud_pocket_resolved_id/);
  assert.doesNotMatch(cpp, /isaac_playerhud_pocket_cache_apply_at/);
  const json = readFileSync(sliceJson, "utf8");
  assert.match(json, /ABI v\d+/);
  assert.match(json, /UpdateHearts|playerHud|0x00841e20/);
});

test("v12 byte-parameter sweep: no uint8_t scalar parameter remains", () => {
  /* A uint8_t SCALAR parameter lets the compiler assume the high bits are
     already clear, and the Wasm ABI never narrows an i32 argument, so the
     shipped export tests the full word where the PE tests a byte. Both such
     exports in this header probed DIVERGENT at 0x100 before v12. Pointer
     parameters (uint8_t*) and struct fields are layout and stay. */
  const stripped = readFileSync(header, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const protos = [...stripped.matchAll(/isaac_[a-z0-9_]+\s*\(([^;{]*?)\)\s*;/g)];
  assert.ok(protos.length >= 40, `expected many prototypes, got ${protos.length}`);
  for (const m of protos) {
    assert.doesNotMatch(
      `${m[1]})`,
      /\buint8_t\s+[a-z_0-9]+\s*[,)]/,
      `uint8_t scalar parameter in: ${m[0].replace(/\s+/g, " ")}`,
    );
  }
});

test("PlayerHUD pure JS oracle matches recovered control flow", () => {
  assert.deepEqual(
    playerHudEntryClearHeartByte1(Array(PLAYERHUD_HEART_SLOT_COUNT).fill(7)),
    Array(PLAYERHUD_HEART_SLOT_COUNT).fill(0),
  );

  assert.equal(playerHudUpdateHeartsUsesTwin(0, 0x10, 0), false);
  assert.equal(playerHudUpdateHeartsUsesTwin(0x1000, 0x10, 0), true);
  assert.equal(playerHudUpdateHeartsUsesTwin(0x1000, 0x11, 0), true);
  assert.equal(playerHudUpdateHeartsUsesTwin(0x1000, 0x10, 1), false);
  assert.equal(playerHudUpdateHeartsUsesTwin(0x1000, 3, 0), false);

  assert.equal(
    playerHudTrampSuppressesCriticalBlink([
      { type: 1, variant: 0x139, count: 2 },
    ]),
    true,
  );
  assert.equal(
    playerHudTrampSuppressesCriticalBlink([
      { type: 1, variant: 0x139, count: 0 },
    ]),
    false,
  );
  assert.equal(
    playerHudTrampSuppressesCriticalBlink([
      { type: 2, variant: 0x139, count: 9 },
      { type: 4, variant: 0x139, count: 1 },
    ]),
    true,
  );
  assert.equal(playerHudTrampSuppressesCriticalBlink([]), false);

  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 2,
      playerFlag1519: 0,
      trampSuppress: 0,
      frameCounter264f8: 0,
    }),
    0,
  );
  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 1,
      playerFlag1519: 0,
      trampSuppress: 1,
      frameCounter264f8: 0,
    }),
    0,
  );
  /* rem=0 → (9*255)/9 = 255 */
  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 1,
      playerFlag1519: 0,
      trampSuppress: 0,
      frameCounter264f8: 0,
    }),
    255,
  );
  /* rem=9 → 0 */
  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 1,
      playerFlag1519: 1,
      trampSuppress: 1,
      frameCounter264f8: 9,
    }),
    0,
  );
  /* rem=10 → skip */
  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 1,
      playerFlag1519: 0,
      trampSuppress: 0,
      frameCounter264f8: 10,
    }),
    0,
  );
  /* rem=1 → (8*255)/9 = 226 */
  assert.equal(
    playerHudCriticalHeartBlink({
      heartsSum: 1,
      playerFlag1519: 0,
      trampSuppress: 0,
      frameCounter264f8: 1,
    }),
    226,
  );

  const tick = playerHudActiveSlotCountdownTick([0, 1, -1, 5]);
  assert.deepEqual(tick.slots, [-1, 0, -1, 4]);
  assert.equal(tick.dirty, true);
  const idle = playerHudActiveSlotCountdownTick([-1, -2, -3, -4]);
  assert.equal(idle.dirty, false);

  assert.equal(playerHudTailFloatStep(0.5, 1), Math.fround(0.75));
  assert.equal(playerHudTailFloatStep(0.9, 1), 1);
  assert.equal(playerHudTailFloatStep(0.1, 0), 0);
  assert.equal(playerHudTailFloatStep(0.5, 0), Math.fround(0.25));

  assert.deepEqual(playerHudTailCharCountdown({ c0: 3, c1: 0, c2: -1 }), {
    c0: 2,
    c1: 0,
    c2: -1,
  });
  assert.deepEqual(playerHudTailCharCountdown({ c0: 1, c1: 1, c2: 1 }), {
    c0: 0,
    c1: 0,
    c2: 0,
  });
});

test("active book-overlay pure CF (VA 0x0084240d) — host probes as inputs", () => {
  /* Nonzero slots always 0 (PE skips FUN_007706e0 block). */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 1,
      activeItemId: 1,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x248: true,
      hasCollectible0x26b: true,
    }),
    0,
  );

  /* No probes → 0. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: 42,
      playerType: 0,
      hasCollectible0x248: false,
      hasCollectible0x26b: false,
    }),
    0,
  );

  /* Book of Virtues owned, active is not Virtues → overlay 0x248. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: 1,
      playerType: 0,
      hasCollectible0x248: true,
      hasCollectible0x26b: false,
    }),
    PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
  );

  /* Already holding Virtues → no Virtues overlay. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
      playerType: 0,
      hasCollectible0x248: true,
      hasCollectible0x26b: false,
    }),
    0,
  );

  /* Judas + 0x26b, no Virtues → Belial 0x22. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: 1,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x248: false,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
  );

  /* Dark Judas + Virtues + 0x26b → combined 0x3b. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: 1,
      playerType: PLAYERHUD_TYPE_DARK_JUDAS,
      hasCollectible0x248: true,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
  );

  /* Judas + both probes but active already 0x3b → leave Virtues path only
     (active==0x3b skips Belial rewrite; Virtues still applies when active!=0x248). */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x248: true,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
  );

  /* Non-Judas with 0x26b host true must not apply Belial rewrite. */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: 1,
      playerType: 0,
      hasCollectible0x248: true,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
  );

  /* Judas holding Virtues active + 0x26b → Belial only (Virtues path cleared). */
  assert.equal(
    playerHudActiveBookOverlayId({
      slotIndex: 0,
      activeItemId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x248: true,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
  );
});

test("cached active-id / book-overlay pure compare+offset CF (VA 0x00842486)", () => {
  /* Slot dword index and byte offsets. */
  for (let slot = 0; slot < PLAYERHUD_ACTIVE_SLOT_COUNT; slot += 1) {
    assert.equal(playerHudActiveSlotDwordIndex(slot), slot * 7);
    assert.equal(
      playerHudCachedActiveIdByteOffset(slot),
      PLAYERHUD_CACHED_ACTIVE_ID_BASE + slot * 0x1c,
    );
    assert.equal(
      playerHudCachedBookOverlayByteOffset(slot),
      PLAYERHUD_CACHED_BOOK_OVERLAY_BASE + slot * 0x1c,
    );
  }

  assert.equal(playerHudActiveIdCacheChanged(42, 42), false);
  assert.equal(playerHudActiveIdCacheChanged(42, 0), true);
  assert.equal(playerHudActiveIdCacheChanged(0, 1), true);

  assert.equal(playerHudBookOverlayCacheChanged(0, 0), false);
  assert.equal(
    playerHudBookOverlayCacheChanged(PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES, 0),
    true,
  );

  assert.equal(playerHudBookOverlayPathKind(0), PLAYERHUD_BOOK_PATH_KIND_CLEAR);
  assert.equal(
    playerHudBookOverlayPathKind(PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES),
    PLAYERHUD_BOOK_PATH_KIND_VIRTUES,
  );
  assert.equal(
    playerHudBookOverlayPathKind(PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL),
    PLAYERHUD_BOOK_PATH_KIND_BELIAL,
  );
  assert.equal(
    playerHudBookOverlayPathKind(PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL),
    PLAYERHUD_BOOK_PATH_KIND_BOTH,
  );
  assert.equal(playerHudBookOverlayPathKind(99), PLAYERHUD_BOOK_PATH_KIND_CLEAR);

  assert.equal(playerHudBookOverlayPathVa(0), 0);
  assert.equal(
    playerHudBookOverlayPathVa(PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES),
    PLAYERHUD_PATH_BOOK_OF_VIRTUES,
  );
  assert.equal(
    playerHudBookOverlayPathVa(PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL),
    PLAYERHUD_PATH_BOOK_OF_BELIAL,
  );
  assert.equal(
    playerHudBookOverlayPathVa(PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL),
    PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL,
  );

  /* Both caches hit → no host gfx. */
  {
    const p = playerHudActiveGfxCachePlan({
      slotIndex: 1,
      activeItemId: 7,
      cachedActiveId: 7,
      bookOverlayId: 0,
      cachedBookOverlayId: 0,
    });
    assert.equal(p.needsActiveGfx, false);
    assert.equal(p.needsBookGfx, false);
    assert.equal(p.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_CLEAR);
    assert.equal(p.slotDwordIndex, 7);
    assert.equal(p.cachedActiveByteOff, 0x190 + 0x1c);
    assert.equal(p.cachedBookByteOff, 0x194 + 0x1c);
  }

  /* Active miss only → host active gfx; book still host-skip. */
  {
    const p = playerHudActiveGfxCachePlan({
      slotIndex: 0,
      activeItemId: 0x23,
      cachedActiveId: 0,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
      cachedBookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
    });
    assert.equal(p.needsActiveGfx, true);
    assert.equal(p.needsBookGfx, false);
    assert.equal(p.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_VIRTUES);
    assert.equal(p.bookPathVa, PLAYERHUD_PATH_BOOK_OF_VIRTUES);
  }

  /* Book miss with Belial overlay → host LoadImage belial path. */
  {
    const p = playerHudActiveGfxCachePlan({
      slotIndex: 2,
      activeItemId: 1,
      cachedActiveId: 1,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
      cachedBookOverlayId: 0,
    });
    assert.equal(p.needsActiveGfx, false);
    assert.equal(p.needsBookGfx, true);
    assert.equal(p.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_BELIAL);
    assert.equal(p.bookPathVa, PLAYERHUD_PATH_BOOK_OF_BELIAL);
    assert.equal(p.slotDwordIndex, 14);
  }

  /* Pure apply stores only; no LoadImage. */
  {
    const hud = new Array(0x80).fill(0);
    const r1 = playerHudActiveGfxCacheApplyAt(hud, 0, 5, 0x248);
    assert.equal(r1.dirty, 3); /* both bits */
    assert.equal(r1.hud[PLAYERHUD_CACHED_ACTIVE_ID_BASE / 4], 5);
    assert.equal(r1.hud[PLAYERHUD_CACHED_BOOK_OVERLAY_BASE / 4], 0x248);
    const r2 = playerHudActiveGfxCacheApplyAt(r1.hud, 0, 5, 0x248);
    assert.equal(r2.dirty, 0);
    const r3 = playerHudActiveGfxCacheApplyAt(r1.hud, 1, 9, 0);
    assert.equal(r3.dirty, 1); /* active only for slot 1 */
    assert.equal(r3.hud[(PLAYERHUD_CACHED_ACTIVE_ID_BASE / 4) + 7], 9);
  }
});

test("ItemConfig resolve + active path kind pure CF (VA 0x00842499)", () => {
  for (let slot = 0; slot < PLAYERHUD_ACTIVE_SLOT_COUNT; slot += 1) {
    assert.equal(
      playerHudActiveImageSpByteOffset(slot),
      PLAYERHUD_ACTIVE_IMAGE_SP_BASE + slot * 0x1c,
    );
  }

  /* Game absent + positive id in manager bounds → MANAGER. */
  {
    const r = playerHudItemConfigResolve({
      slotIndex: 1,
      activeItemId: 5,
      gamePresent: 0,
      gameNegTableSize: 0,
      managerTableSize: 100,
    });
    assert.equal(r.tableKind, PLAYERHUD_ITEMCFG_KIND_MANAGER);
    assert.equal(r.lookupIndex, 5);
    assert.equal(r.activeImageSpByteOff, 0x198 + 0x1c);
  }

  /* Game absent + negative id → NULL. */
  {
    const r = playerHudItemConfigResolve({
      slotIndex: 0,
      activeItemId: -1,
      gamePresent: 0,
      gameNegTableSize: 10,
      managerTableSize: 100,
    });
    assert.equal(r.tableKind, PLAYERHUD_ITEMCFG_KIND_NULL);
  }

  /* Game present + negative id via ~id in bounds → GAME_NEG. */
  {
    const r = playerHudItemConfigResolve({
      slotIndex: 0,
      activeItemId: -1, /* ~(-1) = 0 */
      gamePresent: 1,
      gameNegTableSize: 4,
      managerTableSize: 100,
    });
    assert.equal(r.tableKind, PLAYERHUD_ITEMCFG_KIND_GAME_NEG);
    assert.equal(r.lookupIndex, 0);
  }

  /* Game present + negative id out of bounds → NULL. */
  {
    const r = playerHudItemConfigResolve({
      slotIndex: 0,
      activeItemId: -5, /* ~(-5) = 4 */
      gamePresent: 1,
      gameNegTableSize: 4,
      managerTableSize: 100,
    });
    assert.equal(r.tableKind, PLAYERHUD_ITEMCFG_KIND_NULL);
  }

  /* Manager OOB → NULL. */
  {
    const r = playerHudItemConfigResolve({
      slotIndex: 2,
      activeItemId: 50,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerTableSize: 50,
    });
    assert.equal(r.tableKind, PLAYERHUD_ITEMCFG_KIND_NULL);
  }

  /* Default active id → CONFIG (host item+0x38). */
  assert.equal(
    playerHudActiveItemPathKind({ slotIndex: 0, activeItemId: 1 }),
    PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  );
  assert.equal(playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_CONFIG), 0);

  /* id 0x122 special path. */
  assert.equal(
    playerHudActiveItemPathKind({ slotIndex: 0, activeItemId: 0x122 }),
    PLAYERHUD_ACTIVE_PATH_KIND_0x122,
  );
  assert.equal(
    playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_0x122),
    PLAYERHUD_PATH_ACTIVE_0x122,
  );

  /* id 0x23 needs all player gates. */
  assert.equal(
    playerHudActiveItemPathKind({
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 0,
      playerByte20a9: 0,
      playerDword1818: 3,
      playerActiveCharge: 1,
    }),
    PLAYERHUD_ACTIVE_PATH_KIND_0x23,
  );
  assert.equal(
    playerHudActiveItemPathKind({
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 1,
      playerByte20a9: 0,
      playerDword1818: 3,
      playerActiveCharge: 1,
    }),
    PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  );
  assert.equal(
    playerHudActiveItemPathKind({
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 0,
      playerByte20a9: 0,
      playerDword1818: 2,
      playerActiveCharge: 1,
    }),
    PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  );
  assert.equal(
    playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_0x23),
    PLAYERHUD_PATH_ACTIVE_0x23,
  );

  /* id 0x280 Judas + 0x26b → belial urn; else default urn. */
  assert.equal(
    playerHudActiveItemPathKind({
      slotIndex: 0,
      activeItemId: 0x280,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL,
  );
  assert.equal(
    playerHudActiveItemPathKind({
      slotIndex: 0,
      activeItemId: 0x280,
      playerType: 0,
      hasCollectible0x26b: true,
    }),
    PLAYERHUD_ACTIVE_PATH_KIND_0x280,
  );
  assert.equal(
    playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_0x280),
    PLAYERHUD_PATH_ACTIVE_0x280,
  );
  assert.equal(
    playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL),
    PLAYERHUD_PATH_ACTIVE_0x280_BELIAL,
  );

  /* id 0x2c6: slot 2 → CONFIG; else bag path. */
  assert.equal(
    playerHudActiveItemPathKind({ slotIndex: 2, activeItemId: 0x2c6 }),
    PLAYERHUD_ACTIVE_PATH_KIND_CONFIG,
  );
  assert.equal(
    playerHudActiveItemPathKind({ slotIndex: 0, activeItemId: 0x2c6 }),
    PLAYERHUD_ACTIVE_PATH_KIND_0x2c6,
  );
  assert.equal(
    playerHudActiveItemPathVa(PLAYERHUD_ACTIVE_PATH_KIND_0x2c6),
    PLAYERHUD_PATH_ACTIVE_0x2c6,
  );

  {
    const p = playerHudActiveItemPathPlan({
      slotIndex: 0,
      activeItemId: 0x122,
    });
    assert.equal(p.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_0x122);
    assert.equal(p.pathVa, PLAYERHUD_PATH_ACTIVE_0x122);
    assert.equal(p.usesConfigGfx, false);
  }
  {
    const p = playerHudActiveItemPathPlan({
      slotIndex: 0,
      activeItemId: 42,
    });
    assert.equal(p.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_CONFIG);
    assert.equal(p.pathVa, 0);
    assert.equal(p.usesConfigGfx, true);
  }
});

test("GetHealthType + signed ceil-half pure oracle", () => {
  assert.equal(playerHudGetHealthType(0), 0);
  assert.equal(playerHudGetHealthType(4), 1);
  assert.equal(playerHudGetHealthType(0x0a), 2); /* early-out type */
  assert.equal(playerHudGetHealthType(0x0e), 3); /* coin */
  assert.equal(playerHudGetHealthType(0x10), 4);
  assert.equal(playerHudGetHealthType(0x1f), 2);
  assert.equal(playerHudGetHealthType(0x28), 2);
  assert.equal(playerHudGetHealthType(99), 0);

  assert.equal(playerHudSignedCeilHalf(0), 0);
  assert.equal(playerHudSignedCeilHalf(1), 1);
  assert.equal(playerHudSignedCeilHalf(2), 1);
  assert.equal(playerHudSignedCeilHalf(5), 3);
  assert.equal(playerHudSignedCeilHalf(6), 3);
});

test("UpdateHearts pure JS body — red / coin / early-out / soul / eternal", () => {
  /* heartIconCount (player+0x194c) == filled keeps heart+2; else excess cleared. */

  /* 6 half-units max + 6 red → 3 full red hearts. */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 6,
      redHearts: 6,
      heartIconCount: 3,
    });
    assert.equal(r.applied, true);
    for (let i = 0; i < 3; i += 1) {
      assert.equal(r.hearts[i * 16], 1);
      assert.equal(r.hearts[i * 16 + 2], 1);
      assert.equal(
        playerHudHeartPathAt(r.hearts, i),
        PLAYERHUD_HEART_PATHS.redHeartFull,
      );
    }
    for (let i = 3; i < 12; i += 1) {
      assert.equal(r.hearts[i * 16], 0);
    }
  }

  /* Half red heart. */
  {
    const r = playerHudUpdateHeartsPure(6, {
      playerType: 0,
      maxHearts: 2,
      redHearts: 1,
      heartIconCount: 1,
    });
    assert.equal(playerHudHeartPathAt(r.hearts, 0), PLAYERHUD_HEART_PATHS.redHeartHalf);
    assert.equal(r.hearts[0], 1);
    assert.equal(r.hearts[2], 1);
  }

  /* Keeper coin hearts (type 0x0e → health 3). */
  {
    const r = playerHudUpdateHeartsPure(6, {
      playerType: 0x0e,
      maxHearts: 4,
      redHearts: 2,
      heartIconCount: 1,
    });
    assert.equal(playerHudHeartPathAt(r.hearts, 0), PLAYERHUD_HEART_PATHS.coinHeartFull);
    assert.equal(playerHudHeartPathAt(r.hearts, 1), PLAYERHUD_HEART_PATHS.coinEmpty);
  }

  /* Health type 2 early-out: no stores. */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0x0a,
      maxHearts: 6,
      redHearts: 6,
    });
    assert.equal(r.applied, false);
    assert.ok(r.hearts.every((b) => b === 0));
  }

  /* Soul hearts (blue). */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 0,
      redHearts: 0,
      soulHearts: 4,
      heartIconCount: 2,
    });
    assert.equal(r.applied, true);
    assert.equal(r.hearts[0], 1);
    assert.equal(playerHudHeartPathAt(r.hearts, 0), PLAYERHUD_HEART_PATHS.blueHeartFull);
    assert.equal(playerHudHeartPathAt(r.hearts, 1), PLAYERHUD_HEART_PATHS.blueHeartFull);
  }

  /* Black soul bit 0 on odd soul_idx 1. */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 0,
      redHearts: 0,
      soulHearts: 2,
      blackHeartsMask: 1,
      heartIconCount: 1,
    });
    assert.equal(
      playerHudHeartPathAt(r.hearts, 0),
      PLAYERHUD_HEART_PATHS.blackHeartFull,
    );
  }

  /* Eternal overlay on last red container. */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 4,
      redHearts: 4,
      eternalHearts: 1,
      heartIconCount: 2,
    });
    const last = 1; /* 2 containers, last index 1 */
    assert.equal(r.hearts[last * 16 + 1], 1);
    const o = last * 16 + 0xc;
    const ov =
      (r.hearts[o] |
        (r.hearts[o + 1] << 8) |
        (r.hearts[o + 2] << 16) |
        (r.hearts[o + 3] << 24)) >>>
      0;
    assert.equal(ov, PLAYERHUD_HEART_PATHS.whiteHeartOverlay);
    assert.equal(r.hearts[last * 16 + 4], 0);
  }

  /* Broken hearts after red (broken does not increment filled). */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 2,
      redHearts: 2,
      brokenHearts: 1,
      heartIconCount: 1,
    });
    assert.equal(playerHudHeartPathAt(r.hearts, 0), PLAYERHUD_HEART_PATHS.redHeartFull);
    assert.equal(playerHudHeartPathAt(r.hearts, 1), PLAYERHUD_HEART_PATHS.brokenHeart);
    assert.equal(r.hearts[16], 1);
    assert.equal(r.hearts[18], 0);
  }

  /* Excess icons vs heartIconCount clear +2 from the left. */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0,
      maxHearts: 4,
      redHearts: 4,
      heartIconCount: 1, /* filled=2 → excess 1 */
    });
    assert.equal(r.hearts[0], 1);
    assert.equal(r.hearts[2], 0); /* cleared */
    assert.equal(r.hearts[16], 1);
    assert.equal(r.hearts[18], 1); /* second still full */
  }

  /* hud_c > 0 → red anim byte 1; coin anim 4. */
  {
    const red = playerHudUpdateHeartsPure(4, {
      playerType: 0,
      maxHearts: 2,
      redHearts: 2,
      hudCharC: 1,
      heartIconCount: 1,
    });
    assert.equal(red.hearts[4], 1);
    const coin = playerHudUpdateHeartsPure(4, {
      playerType: 0x0e,
      maxHearts: 2,
      redHearts: 2,
      hudCharC: 1,
      heartIconCount: 1,
    });
    assert.equal(coin.hearts[4], 4);
  }

  /* Collectible 0x26b raises special threshold (anim_base 6). */
  {
    const r = playerHudUpdateHeartsPure(12, {
      playerType: 0x16,
      maxHearts: 8,
      redHearts: 8,
      field1ef4: 1,
      hasCollectible0x26b: true,
      heartIconCount: 4,
    });
    /* thr = 3; slots 0..2 special=0, 3+ special=1 */
    assert.equal(r.hearts[0 * 16 + 3], 0);
    assert.equal(r.hearts[3 * 16 + 3], 1);
  }
});

test("PlayerHUD pure JS oracle matches SP clear + LoadImage prep CF (v6)", () => {
  assert.equal(playerHudActiveSpClearArg(), 0);
  assert.equal(playerHudSpClearAllocSize(), 0x18);
  assert.equal(playerHudSpClearAllocOk(0), false);
  assert.equal(playerHudSpClearAllocOk(0x1000), true);
  assert.equal(playerHudSpClearOldObjectPresent(0), false);
  assert.equal(playerHudSpClearOldObjectPresent(1), true);
  assert.equal(playerHudSpClearCallbackNeeded(0, 0x1234), false);
  assert.equal(playerHudSpClearCallbackNeeded(1, 0), false);
  assert.equal(playerHudSpClearCallbackNeeded(1, 0xabcd), true);
  assert.equal(playerHudSpClearVtable(), 0x00b1a6e0);

  const finished = playerHudSpClearObjectFinishApply(
    new Uint8Array(0x18).fill(0xee),
    0,
  );
  assert.equal(
    finished[0] |
      (finished[1] << 8) |
      (finished[2] << 16) |
      (finished[3] << 24),
    0x00b1a6e0,
  );
  assert.equal(
    finished[0x14] |
      (finished[0x15] << 8) |
      (finished[0x16] << 16) |
      (finished[0x17] << 24),
    0,
  );

  const pair = playerHudSpClearPairApplyBase(new Uint8Array(8).fill(0xff), 0, 0x2000);
  assert.equal(pair[0] | (pair[1] << 8) | (pair[2] << 16) | (pair[3] << 24), 0);
  assert.equal(
    pair[4] | (pair[5] << 8) | (pair[6] << 16) | (pair[7] << 24),
    0x2000,
  );

  assert.equal(playerHudSkipsActiveLoadImage(0), true);
  assert.equal(playerHudSkipsActiveLoadImage(0x12345678), false);
  assert.equal(playerHudItemConfigGfxStringByteOffset(), 0x38);
  assert.equal(playerHudItemConfigGfxCapacityByteOffset(), 0x4c);
  assert.equal(playerHudConfigGfxStringIsSso(0xf), true);
  assert.equal(playerHudConfigGfxStringIsSso(0x10), false);
  assert.equal(playerHudConfigGfxStringIsSso(0x20), false);
  assert.equal(playerHudHostVaSpMaterialize(), 0x0040c550);

  const swapped = playerHudSpPairSwap([1, 2], [3, 4]);
  assert.deepEqual(swapped.a, [3, 4]);
  assert.deepEqual(swapped.b, [1, 2]);

  /* Entry null → skip; path fields cleared. */
  const skip = playerHudActiveLoadImagePrep({
    slotIndex: 1,
    itemEntryPtr: 0,
    pathInput: { slotIndex: 1, activeItemId: 0x122 },
    configCapacity: 0,
  });
  assert.equal(skip.activeImageSpByteOff, PLAYERHUD_ACTIVE_IMAGE_SP_BASE + 0x1c);
  assert.equal(skip.spClearArg, 0);
  assert.equal(skip.skipsLoadImage, true);
  assert.equal(skip.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_CONFIG);
  assert.equal(skip.pathVa, 0);
  assert.equal(skip.usesConfigGfx, false);
  assert.equal(skip.hostVaSpClear, 0x0040c7f0);
  assert.equal(skip.hostVaLoadImage, 0x009588a0);
  assert.equal(skip.hostVaSpMaterialize, 0x0040c550);

  /* Special path id. */
  const special = playerHudActiveLoadImagePrep({
    slotIndex: 0,
    itemEntryPtr: 0xdead,
    pathInput: { slotIndex: 0, activeItemId: 0x122 },
    configCapacity: 0xff,
  });
  assert.equal(special.skipsLoadImage, false);
  assert.equal(special.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_0x122);
  assert.equal(special.pathVa, PLAYERHUD_PATH_ACTIVE_0x122);
  assert.equal(special.usesConfigGfx, false);
  assert.equal(special.configStringSso, false);

  /* CONFIG SSO vs heap. */
  const cfgSso = playerHudActiveLoadImagePrep({
    slotIndex: 2,
    itemEntryPtr: 1,
    pathInput: { slotIndex: 2, activeItemId: 1 },
    configCapacity: 0xf,
  });
  assert.equal(cfgSso.usesConfigGfx, true);
  assert.equal(cfgSso.configStringSso, true);
  assert.equal(cfgSso.pathVa, 0);
  const cfgHeap = playerHudActiveLoadImagePrep({
    slotIndex: 2,
    itemEntryPtr: 1,
    pathInput: { slotIndex: 2, activeItemId: 1 },
    configCapacity: 0x10,
  });
  assert.equal(cfgHeap.configStringSso, false);
});

test("PlayerHUD pure JS oracle matches LoadImage call-site CF (v7 @ 0x0084298b)", () => {
  assert.equal(playerHudLoadImagePathBufferEbpOff(), -0x418);
  assert.equal(playerHudLoadImageResultEbpOff(), -0x14a8);
  assert.equal(playerHudMaterializeThisEbpOff(), -0x14a0);
  assert.equal(playerHudActiveSpSavedEbpOff(), -0x1428);
  assert.equal(playerHudDirtyFlagEbpOff(), -0x1419);
  assert.equal(playerHudLoadImageResultObjEbpOff(), -0x14a4);
  assert.equal(playerHudMaterializeObjEbpOff(), -0x149c);
  assert.equal(playerHudMaterializeSehTryLevel(), 0);
  assert.equal(playerHudActiveDirtyAfterGfx(), 1);

  /* result obj = result SP + 4; materialize obj = materialize this + 4. */
  assert.equal(
    playerHudLoadImageResultObjEbpOff(),
    playerHudLoadImageResultEbpOff() + 4,
  );
  assert.equal(
    playerHudMaterializeObjEbpOff(),
    playerHudMaterializeThisEbpOff() + 4,
  );

  const dirty = playerHudActiveDirtySet(new Uint8Array([0]));
  assert.equal(dirty[0], 1);
  assert.equal(playerHudActiveDirtySet(null), null);

  /* Entry null → skip body; dirty still planned; path fields cleared. */
  const skip = playerHudActiveLoadImageCall({
    slotIndex: 1,
    itemEntryPtr: 0,
    pathInput: { slotIndex: 1, activeItemId: 0x122 },
    configCapacity: 0,
  });
  assert.equal(skip.runsLoadImage, false);
  assert.equal(skip.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_CONFIG);
  assert.equal(skip.pathVa, 0);
  assert.equal(skip.usesConfigGfx, false);
  assert.equal(skip.pathBufferEbpOff, -0x418);
  assert.equal(skip.resultSpEbpOff, -0x14a8);
  assert.equal(skip.materializeThisEbpOff, -0x14a0);
  assert.equal(skip.activeSpSavedEbpOff, -0x1428);
  assert.equal(skip.dirtyFlagEbpOff, -0x1419);
  assert.equal(skip.materializeSehTryLevel, 0);
  assert.equal(skip.dirtyAfter, 1);
  assert.equal(skip.activeImageSpByteOff, PLAYERHUD_ACTIVE_IMAGE_SP_BASE + 0x1c);
  assert.equal(skip.hostVaLoadImage, 0x009588a0);
  assert.equal(skip.hostVaSpMaterialize, 0x0040c550);

  /* Special path id runs LoadImage with rdata path VA. */
  const special = playerHudActiveLoadImageCall({
    slotIndex: 0,
    itemEntryPtr: 0xdead,
    pathInput: { slotIndex: 0, activeItemId: 0x122 },
    configCapacity: 0xff,
  });
  assert.equal(special.runsLoadImage, true);
  assert.equal(special.pathKind, PLAYERHUD_ACTIVE_PATH_KIND_0x122);
  assert.equal(special.pathVa, PLAYERHUD_PATH_ACTIVE_0x122);
  assert.equal(special.usesConfigGfx, false);
  assert.equal(special.configStringSso, false);

  /* CONFIG SSO vs heap still reported on call plan. */
  const cfgSso = playerHudActiveLoadImageCall({
    slotIndex: 2,
    itemEntryPtr: 1,
    pathInput: { slotIndex: 2, activeItemId: 1 },
    configCapacity: 0xf,
  });
  assert.equal(cfgSso.runsLoadImage, true);
  assert.equal(cfgSso.usesConfigGfx, true);
  assert.equal(cfgSso.configStringSso, true);
  assert.equal(cfgSso.pathVa, 0);
  const cfgHeap = playerHudActiveLoadImageCall({
    slotIndex: 2,
    itemEntryPtr: 1,
    pathInput: { slotIndex: 2, activeItemId: 1 },
    configCapacity: 0x10,
  });
  assert.equal(cfgHeap.configStringSso, false);
});

test("PlayerHUD pure JS oracle matches book-overlay LoadImage call CF (v8 @ 0x00842a5b)", () => {
  assert.equal(playerHudBookImageSpByteOffset(0), PLAYERHUD_BOOK_IMAGE_SP_BASE);
  assert.equal(
    playerHudBookImageSpByteOffset(1),
    PLAYERHUD_BOOK_IMAGE_SP_BASE + 0x1c,
  );
  assert.equal(
    playerHudBookImageSpByteOffset(3),
    PLAYERHUD_BOOK_IMAGE_SP_BASE + 3 * 0x1c,
  );
  assert.equal(playerHudBookSpClearArg(), 0);
  assert.equal(playerHudBookDirtyAfterGfx(), 1);

  /* CLEAR → FUN_0040c7f0(book_sp, 0); no LoadImage stack slots. */
  const clear = playerHudBookLoadImageCall({
    slotIndex: 2,
    bookOverlayId: 0,
  });
  assert.equal(clear.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_CLEAR);
  assert.equal(clear.pathVa, 0);
  assert.equal(clear.runsLoadImage, false);
  assert.equal(clear.runsSpClear, true);
  assert.equal(clear.bookImageSpByteOff, PLAYERHUD_BOOK_IMAGE_SP_BASE + 2 * 0x1c);
  assert.equal(clear.resultSpEbpOff, 0);
  assert.equal(clear.materializeThisEbpOff, 0);
  assert.equal(clear.resultObjEbpOff, 0);
  assert.equal(clear.materializeObjEbpOff, 0);
  assert.equal(clear.materializeSehTryLevel, 0);
  assert.equal(clear.dirtyFlagEbpOff, -0x1419);
  assert.equal(clear.dirtyAfter, 1);
  assert.equal(clear.hostVaLoadImage, 0x009588a0);
  assert.equal(clear.hostVaSpMaterialize, 0x0040c550);
  assert.equal(clear.hostVaSpClear, 0x0040c7f0);
  assert.equal(clear.spClearArg, 0);

  /* VIRTUES → LoadImage rdata path + distinct EBP slots + SEH 3. */
  const virtues = playerHudBookLoadImageCall({
    slotIndex: 0,
    bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
  });
  assert.equal(virtues.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_VIRTUES);
  assert.equal(virtues.pathVa, PLAYERHUD_PATH_BOOK_OF_VIRTUES);
  assert.equal(virtues.runsLoadImage, true);
  assert.equal(virtues.runsSpClear, false);
  assert.equal(virtues.resultSpEbpOff, -0x14b8);
  assert.equal(virtues.materializeThisEbpOff, -0x14b0);
  assert.equal(virtues.resultObjEbpOff, -0x14b4);
  assert.equal(virtues.materializeObjEbpOff, -0x14ac);
  assert.equal(virtues.materializeSehTryLevel, 3);
  assert.equal(virtues.resultObjEbpOff, virtues.resultSpEbpOff + 4);
  assert.equal(virtues.materializeObjEbpOff, virtues.materializeThisEbpOff + 4);

  /* BELIAL. */
  const belial = playerHudBookLoadImageCall({
    slotIndex: 1,
    bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
  });
  assert.equal(belial.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_BELIAL);
  assert.equal(belial.pathVa, PLAYERHUD_PATH_BOOK_OF_BELIAL);
  assert.equal(belial.runsLoadImage, true);
  assert.equal(belial.resultSpEbpOff, -0x14c8);
  assert.equal(belial.materializeThisEbpOff, -0x14c0);
  assert.equal(belial.resultObjEbpOff, -0x14c4);
  assert.equal(belial.materializeObjEbpOff, -0x14bc);
  assert.equal(belial.materializeSehTryLevel, 6);
  assert.equal(
    belial.bookImageSpByteOff,
    PLAYERHUD_BOOK_IMAGE_SP_BASE + 0x1c,
  );

  /* BOTH (virtues+belial combined gfx). */
  const both = playerHudBookLoadImageCall({
    slotIndex: 0,
    bookOverlayId: PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
  });
  assert.equal(both.bookPathKind, PLAYERHUD_BOOK_PATH_KIND_BOTH);
  assert.equal(both.pathVa, PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL);
  assert.equal(both.runsLoadImage, true);
  assert.equal(both.resultSpEbpOff, -0x14d8);
  assert.equal(both.materializeThisEbpOff, -0x14d0);
  assert.equal(both.resultObjEbpOff, -0x14d4);
  assert.equal(both.materializeObjEbpOff, -0x14cc);
  assert.equal(both.materializeSehTryLevel, 9);

  /* Kind helpers match path-kind dispatch. */
  assert.equal(
    playerHudBookLoadImageResultEbpOff(PLAYERHUD_BOOK_PATH_KIND_CLEAR),
    0,
  );
  assert.equal(
    playerHudBookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    3,
  );
  assert.equal(
    playerHudBookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_BELIAL),
    6,
  );
  assert.equal(
    playerHudBookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_BOTH),
    9,
  );
});

test("PlayerHUD pure Wasm matches JS oracle on edge cases", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  assert.equal(exp.hostVaHasCollectible(), 0x007706e0);
  assert.equal(exp.hostVaLoadImage(), 0x009588a0);
  assert.equal(exp.hostVaSmartPtrClear(), 0x0040c7f0);
  assert.equal(exp.hostVaItemConfigGetCollectible(), 0x0072fd10);
  assert.equal(exp.hostVaSpMaterialize(), 0x0040c550);
  assert.equal(exp.activeSpClearArg(), 0);
  assert.equal(exp.spClearAllocSize(), 0x18);
  assert.equal(exp.spClearVtable() >>> 0, 0x00b1a6e0);
  assert.equal(exp.itemCfgGfxStringOff(), 0x38);
  assert.equal(exp.itemCfgGfxCapacityOff(), 0x4c);

  /* Keep scratch well above wasm data/rodata (tables live in linear memory). */
  const scratch = 0x10000;
  if (exp.memory.buffer.byteLength < scratch + 0x8000) {
    exp.memory.grow(1);
  }
  /* Recreate view after possible grow (detached buffer). */
  const view = new DataView(exp.memory.buffer);
  const base = scratch;

  /* Sparse entry clear. */
  for (let i = 0; i < PLAYERHUD_HEART_SLOT_COUNT; i += 1) {
    writeU8(view, base + i, 0xaa);
  }
  exp.clearSparse(base);
  for (let i = 0; i < PLAYERHUD_HEART_SLOT_COUNT; i += 1) {
    assert.equal(readU8(view, base + i), 0);
  }

  /* Buffer form entry clear at machine offsets. */
  const hud = scratch + 0x400;
  for (let i = 0; i < PLAYERHUD_HEART_SLOT_COUNT; i += 1) {
    writeU8(view, hud + 0x11 + i * 0x10, 0x5a);
    writeU8(view, hud + 0x10 + i * 0x10, 0x11); /* neighbor untouched */
  }
  exp.clearAt(hud);
  for (let i = 0; i < PLAYERHUD_HEART_SLOT_COUNT; i += 1) {
    assert.equal(readU8(view, hud + 0x11 + i * 0x10), 0);
    assert.equal(readU8(view, hud + 0x10 + i * 0x10), 0x11);
  }

  assert.equal(exp.usesTwin(0, 0x10, 0), 0);
  assert.equal(exp.usesTwin(0xabc, 0x10, 0), 1);
  assert.equal(exp.usesTwin(0xabc, 0x11, 0), 1);
  assert.equal(exp.usesTwin(0xabc, 0x10, 1), 0);
  assert.equal(exp.usesTwin(0xabc, 5, 0), 0);

  for (const t of [0, 4, 0x0a, 0x0e, 0x10, 0x1f, 0x28, 99]) {
    assert.equal(exp.healthType(t), playerHudGetHealthType(t), `healthType ${t}`);
  }
  for (const n of [0, 1, 2, 5, 6, -1, -3]) {
    assert.equal(exp.ceilHalf(n), playerHudSignedCeilHalf(n), `ceilHalf ${n}`);
  }

  /* Tramp: allocate three parallel arrays. */
  const types = scratch + 0x800;
  const variants = types + 64;
  const counts = variants + 64;
  writeI32(view, types, 1);
  writeI32(view, variants, 0x139);
  writeI32(view, counts, 2);
  assert.equal(exp.tramp(types, variants, counts, 1), 1);
  writeI32(view, counts, 0);
  assert.equal(exp.tramp(types, variants, counts, 1), 0);

  const cases = [
    { heartsSum: 1, flag: 0, tramp: 0, frame: 0, expect: 255 },
    { heartsSum: 1, flag: 0, tramp: 0, frame: 1, expect: 226 },
    { heartsSum: 1, flag: 0, tramp: 0, frame: 9, expect: 0 },
    { heartsSum: 1, flag: 0, tramp: 0, frame: 10, expect: 0 },
    { heartsSum: 1, flag: 0, tramp: 1, frame: 0, expect: 0 },
    { heartsSum: 1, flag: 1, tramp: 1, frame: 0, expect: 255 },
    { heartsSum: 2, flag: 0, tramp: 0, frame: 0, expect: 0 },
    { heartsSum: 1, flag: 0, tramp: 0, frame: 45, expect: 255 },
    /* v12 byte-parameter sweep: flag models a byte read (cmp byte
       [1519],0); only the LOW byte decides. Wide values are passed to the
       Wasm export UNMASKED — before v12 the module tested the full word
       and blink(1, 0x100, 1, 0) returned 255 where the PE sees flag 0. */
    { heartsSum: 1, flag: 0x100, tramp: 1, frame: 0, expect: 0 },
    { heartsSum: 1, flag: 0x1ff, tramp: 1, frame: 0, expect: 255 },
    { heartsSum: 1, flag: 0xff00, tramp: 1, frame: 0, expect: 0 },
    { heartsSum: 1, flag: 0xffffffff, tramp: 1, frame: 0, expect: 255 },
  ];
  for (const c of cases) {
    const js = playerHudCriticalHeartBlink({
      heartsSum: c.heartsSum,
      playerFlag1519: c.flag,
      trampSuppress: c.tramp,
      frameCounter264f8: c.frame,
    });
    const wasm = exp.blink(c.heartsSum, c.flag, c.tramp, c.frame);
    assert.equal(js, c.expect, `js blink frame=${c.frame}`);
    assert.equal(wasm, c.expect, `wasm blink frame=${c.frame}`);
  }

  /* Active sparse tick. */
  const st = scratch + 0x1000;
  writeI32(view, st + 0, 0);
  writeI32(view, st + 4, 1);
  writeI32(view, st + 8, -1);
  writeI32(view, st + 12, 5);
  assert.equal(exp.activeTick(st), 1);
  assert.equal(readI32(view, st + 0), -1);
  assert.equal(readI32(view, st + 4), 0);
  assert.equal(readI32(view, st + 8), -1);
  assert.equal(readI32(view, st + 12), 4);

  /* Active at machine offsets (i32 view of PlayerHUD). */
  const hudI = scratch + 0x1400;
  for (let i = 0; i < PLAYERHUD_ACTIVE_SLOT_COUNT; i += 1) {
    writeI32(view, hudI + 0x1a8 + i * 0x1c, i === 2 ? -3 : i + 2);
  }
  assert.equal(exp.activeTickAt(hudI), 1);
  assert.equal(readI32(view, hudI + 0x1a8), 1);
  assert.equal(readI32(view, hudI + 0x1a8 + 0x1c), 2);
  assert.equal(readI32(view, hudI + 0x1a8 + 0x38), -3);
  assert.equal(readI32(view, hudI + 0x1a8 + 0x54), 4);

  /* Tail float. */
  const fp = scratch + 0x1800;
  writeF32(view, fp, 0.5);
  exp.tailFloat(fp, 1);
  assert.equal(readF32(view, fp), Math.fround(0.75));
  writeF32(view, fp, 0.9);
  exp.tailFloat(fp, 1);
  assert.equal(readF32(view, fp), 1);
  writeF32(view, fp, 0.1);
  exp.tailFloat(fp, 0);
  assert.equal(readF32(view, fp), 0);

  /* Tail char sparse. */
  const ch = scratch + 0x1900;
  writeI8(view, ch + 0, 3);
  writeI8(view, ch + 1, 0);
  writeI8(view, ch + 2, -1);
  exp.tailChar(ch);
  assert.equal(readI8(view, ch + 0), 2);
  assert.equal(readI8(view, ch + 1), 0);
  assert.equal(readI8(view, ch + 2), -1);

  const hud2 = scratch + 0x1a00;
  writeI8(view, hud2 + 0xc, 1);
  writeI8(view, hud2 + 0xd, 2);
  writeI8(view, hud2 + 0xe, 0);
  exp.tailCharAt(hud2);
  assert.equal(readI8(view, hud2 + 0xc), 0);
  assert.equal(readI8(view, hud2 + 0xd), 1);
  assert.equal(readI8(view, hud2 + 0xe), 0);

  /* UpdateHearts pure Wasm ≡ JS on a matrix of cases. */
  const heartsBase = scratch + 0x2000;
  const inputBase = scratch + 0x4000;
  const matrix = [
    { playerType: 0, maxHearts: 6, redHearts: 6, heartIconCount: 3 },
    { playerType: 0, maxHearts: 2, redHearts: 1, heartIconCount: 1 },
    { playerType: 0x0e, maxHearts: 4, redHearts: 2, heartIconCount: 1 },
    { playerType: 0x0a, maxHearts: 6, redHearts: 6 },
    { playerType: 0, maxHearts: 0, redHearts: 0, soulHearts: 4, heartIconCount: 2 },
    {
      playerType: 0,
      maxHearts: 0,
      redHearts: 0,
      soulHearts: 2,
      blackHeartsMask: 1,
      heartIconCount: 1,
    },
    {
      playerType: 0,
      maxHearts: 4,
      redHearts: 4,
      eternalHearts: 1,
      heartIconCount: 2,
    },
    {
      playerType: 0,
      maxHearts: 2,
      redHearts: 2,
      brokenHearts: 1,
      heartIconCount: 1,
    },
    { playerType: 0, maxHearts: 4, redHearts: 4, heartIconCount: 1 },
    { playerType: 0, maxHearts: 2, redHearts: 2, hudCharC: 1, heartIconCount: 1 },
    { playerType: 0x0e, maxHearts: 2, redHearts: 2, hudCharC: 1, heartIconCount: 1 },
    {
      playerType: 0x16,
      maxHearts: 8,
      redHearts: 8,
      field1ef4: 1,
      hasCollectible0x26b: true,
      heartIconCount: 4,
    },
    {
      playerType: 0,
      maxHearts: 6,
      redHearts: 2,
      rottenHearts: 1,
      heartIconCount: 1, /* red_rem=0 after 2*rotten; one rotten icon */
    },
    {
      playerType: 0,
      maxHearts: 2,
      redHearts: 0,
      soulHearts: 0,
      boneCount: 1,
      boneMask: 1,
      heartIconCount: 1,
    },
  ];

  for (const input of matrix) {
    const maxSlots = 12;
    const js = playerHudUpdateHeartsPure(maxSlots, input);
    /* Clear heart buffer. */
    for (let b = 0; b < maxSlots * PLAYERHUD_HEART_STRIDE; b += 1) {
      writeU8(view, heartsBase + b, 0);
    }
    writeUpdateHeartsInput(view, inputBase, input);
    const applied = exp.updateHearts(heartsBase, maxSlots, inputBase);
    assert.equal(applied, js.applied ? 1 : 0, `applied ${JSON.stringify(input)}`);
    for (let b = 0; b < maxSlots * PLAYERHUD_HEART_STRIDE; b += 1) {
      assert.equal(
        readU8(view, heartsBase + b),
        js.hearts[b],
        `byte ${b} input=${JSON.stringify(input)}`,
      );
    }
  }

  /* Book-overlay pure CF Wasm ≡ JS (host probes as int8 args). */
  const bookCases = [
    { slotIndex: 0, activeItemId: 1, playerType: 0, hasCollectible0x248: false, hasCollectible0x26b: false },
    { slotIndex: 0, activeItemId: 1, playerType: 0, hasCollectible0x248: true, hasCollectible0x26b: false },
    { slotIndex: 0, activeItemId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES, playerType: 0, hasCollectible0x248: true, hasCollectible0x26b: false },
    { slotIndex: 0, activeItemId: 1, playerType: PLAYERHUD_TYPE_JUDAS, hasCollectible0x248: false, hasCollectible0x26b: true },
    { slotIndex: 0, activeItemId: 1, playerType: PLAYERHUD_TYPE_DARK_JUDAS, hasCollectible0x248: true, hasCollectible0x26b: true },
    { slotIndex: 0, activeItemId: PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL, playerType: PLAYERHUD_TYPE_JUDAS, hasCollectible0x248: true, hasCollectible0x26b: true },
    { slotIndex: 0, activeItemId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES, playerType: PLAYERHUD_TYPE_JUDAS, hasCollectible0x248: true, hasCollectible0x26b: true },
    { slotIndex: 1, activeItemId: 1, playerType: PLAYERHUD_TYPE_JUDAS, hasCollectible0x248: true, hasCollectible0x26b: true },
    { slotIndex: 2, activeItemId: 99, playerType: PLAYERHUD_TYPE_DARK_JUDAS, hasCollectible0x248: true, hasCollectible0x26b: true },
    { slotIndex: 0, activeItemId: 1, playerType: 0, hasCollectible0x248: true, hasCollectible0x26b: true },
  ];
  for (const c of bookCases) {
    const js = playerHudActiveBookOverlayId(c);
    const wasm = exp.bookOverlay(
      c.slotIndex,
      c.activeItemId,
      c.playerType,
      c.hasCollectible0x248 ? 1 : 0,
      c.hasCollectible0x26b ? 1 : 0,
    );
    assert.equal(wasm, js, `bookOverlay ${JSON.stringify(c)}`);
  }

  /* ABI v4: offsets + cache compares + plan + apply Wasm ≡ JS. */
  for (let slot = 0; slot < PLAYERHUD_ACTIVE_SLOT_COUNT; slot += 1) {
    assert.equal(
      exp.slotDwordIndex(slot),
      playerHudActiveSlotDwordIndex(slot),
      `slotDword ${slot}`,
    );
    assert.equal(
      exp.cachedActiveOff(slot),
      playerHudCachedActiveIdByteOffset(slot),
      `activeOff ${slot}`,
    );
    assert.equal(
      exp.cachedBookOff(slot),
      playerHudCachedBookOverlayByteOffset(slot),
      `bookOff ${slot}`,
    );
  }

  assert.equal(exp.activeCacheChanged(42, 42), 0);
  assert.equal(exp.activeCacheChanged(42, 0), 1);
  assert.equal(exp.bookCacheChanged(0x248, 0x248), 0);
  assert.equal(exp.bookCacheChanged(0x22, 0), 1);

  for (const id of [
    0,
    PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
    PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
    PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
    99,
  ]) {
    assert.equal(
      exp.bookPathKind(id),
      playerHudBookOverlayPathKind(id),
      `pathKind ${id}`,
    );
    assert.equal(
      exp.bookPathVa(id) >>> 0,
      playerHudBookOverlayPathVa(id) >>> 0,
      `pathVa ${id}`,
    );
  }

  const planCases = [
    {
      slotIndex: 0,
      activeItemId: 1,
      cachedActiveId: 1,
      bookOverlayId: 0,
      cachedBookOverlayId: 0,
    },
    {
      slotIndex: 1,
      activeItemId: 0x23,
      cachedActiveId: 0,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
      cachedBookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
    },
    {
      slotIndex: 2,
      activeItemId: 5,
      cachedActiveId: 5,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
      cachedBookOverlayId: 0,
    },
    {
      slotIndex: 3,
      activeItemId: 9,
      cachedActiveId: 8,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
      cachedBookOverlayId: 0x22,
    },
  ];
  const planBase = scratch + 0x5000;
  for (const c of planCases) {
    const js = playerHudActiveGfxCachePlan(c);
    exp.cachePlan(
      planBase,
      c.slotIndex,
      c.activeItemId,
      c.cachedActiveId,
      c.bookOverlayId,
      c.cachedBookOverlayId,
    );
    assert.equal(readI32(view, planBase + 0), js.needsActiveGfx ? 1 : 0);
    assert.equal(readI32(view, planBase + 4), js.needsBookGfx ? 1 : 0);
    assert.equal(readI32(view, planBase + 8), js.bookPathKind);
    assert.equal(readU32(view, planBase + 12), js.bookPathVa >>> 0);
    assert.equal(readI32(view, planBase + 16), js.slotDwordIndex);
    assert.equal(readI32(view, planBase + 20), js.cachedActiveByteOff);
    assert.equal(readI32(view, planBase + 24), js.cachedBookByteOff);
  }

  /* apply_at: slot 0 and 1 on a zeroed PlayerHUD dword buffer. */
  const applyHud = scratch + 0x5800;
  for (let i = 0; i < 0x80; i += 1) {
    writeI32(view, applyHud + i * 4, 0);
  }
  const d1 = exp.cacheApplyAt(applyHud, 0, 5, 0x248);
  assert.equal(d1, 3);
  assert.equal(readI32(view, applyHud + 0x190), 5);
  assert.equal(readI32(view, applyHud + 0x194), 0x248);
  assert.equal(exp.cacheApplyAt(applyHud, 0, 5, 0x248), 0);
  const d2 = exp.cacheApplyAt(applyHud, 1, 9, 0x22);
  assert.equal(d2, 3);
  assert.equal(readI32(view, applyHud + 0x190 + 0x1c), 9);
  assert.equal(readI32(view, applyHud + 0x194 + 0x1c), 0x22);
  /* Slot 0 unchanged. */
  assert.equal(readI32(view, applyHud + 0x190), 5);

  /* ABI v5: ItemConfig resolve + active path kind Wasm ≡ JS. */
  for (let slot = 0; slot < PLAYERHUD_ACTIVE_SLOT_COUNT; slot += 1) {
    assert.equal(
      exp.activeImageSpOff(slot),
      playerHudActiveImageSpByteOffset(slot),
      `activeImageSp ${slot}`,
    );
  }

  const resolveCases = [
    {
      slotIndex: 0,
      activeItemId: 5,
      gamePresent: 0,
      gameNegTableSize: 0,
      managerTableSize: 100,
    },
    {
      slotIndex: 1,
      activeItemId: -1,
      gamePresent: 0,
      gameNegTableSize: 10,
      managerTableSize: 100,
    },
    {
      slotIndex: 0,
      activeItemId: -1,
      gamePresent: 1,
      gameNegTableSize: 4,
      managerTableSize: 100,
    },
    {
      slotIndex: 0,
      activeItemId: -5,
      gamePresent: 1,
      gameNegTableSize: 4,
      managerTableSize: 100,
    },
    {
      slotIndex: 2,
      activeItemId: 50,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerTableSize: 50,
    },
    {
      slotIndex: 3,
      activeItemId: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerTableSize: 1,
    },
    {
      slotIndex: 0,
      activeItemId: -3,
      gamePresent: 1,
      gameNegTableSize: 8,
      managerTableSize: 0,
    },
  ];
  const resolveBase = scratch + 0x6000;
  for (const c of resolveCases) {
    const js = playerHudItemConfigResolve(c);
    exp.itemConfigResolve(
      resolveBase,
      c.slotIndex,
      c.activeItemId,
      c.gamePresent,
      c.gameNegTableSize,
      c.managerTableSize,
    );
    assert.equal(
      readI32(view, resolveBase + 0),
      js.tableKind,
      `resolve.kind ${JSON.stringify(c)}`,
    );
    assert.equal(
      readI32(view, resolveBase + 4),
      js.lookupIndex,
      `resolve.idx ${JSON.stringify(c)}`,
    );
    assert.equal(
      readI32(view, resolveBase + 8),
      js.activeImageSpByteOff,
      `resolve.sp ${JSON.stringify(c)}`,
    );
  }

  const pathCases = [
    { slotIndex: 0, activeItemId: 1 },
    { slotIndex: 0, activeItemId: 0x122 },
    {
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 0,
      playerByte20a9: 0,
      playerDword1818: 3,
      playerActiveCharge: 1,
    },
    {
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 1,
      playerByte20a9: 0,
      playerDword1818: 3,
      playerActiveCharge: 1,
    },
    {
      slotIndex: 0,
      activeItemId: 0x23,
      playerByte202c: 0,
      playerByte20a9: 0,
      playerDword1818: 2,
      playerActiveCharge: 1,
    },
    {
      slotIndex: 0,
      activeItemId: 0x280,
      playerType: PLAYERHUD_TYPE_JUDAS,
      hasCollectible0x26b: true,
    },
    {
      slotIndex: 0,
      activeItemId: 0x280,
      playerType: 0,
      hasCollectible0x26b: true,
    },
    { slotIndex: 2, activeItemId: 0x2c6 },
    { slotIndex: 0, activeItemId: 0x2c6 },
    { slotIndex: 1, activeItemId: 0x146 },
    { slotIndex: 0, activeItemId: 0x1da },
    { slotIndex: 0, activeItemId: 0x2d0 },
    {
      slotIndex: 0,
      activeItemId: 0x280,
      playerType: PLAYERHUD_TYPE_DARK_JUDAS,
      hasCollectible0x26b: false,
    },
  ];
  const pathInBase = scratch + 0x6200;
  const pathPlanBase = scratch + 0x6300;
  for (const c of pathCases) {
    const js = playerHudActiveItemPathPlan(c);
    writeActivePathInputs(view, pathInBase, c);
    assert.equal(
      exp.activePathKind(pathInBase),
      js.pathKind,
      `pathKind ${JSON.stringify(c)}`,
    );
    assert.equal(
      exp.activePathVa(js.pathKind) >>> 0,
      js.pathVa >>> 0,
      `pathVa ${JSON.stringify(c)}`,
    );
    exp.activePathPlan(pathPlanBase, pathInBase);
    assert.equal(readI32(view, pathPlanBase + 0), js.pathKind);
    assert.equal(readU32(view, pathPlanBase + 4), js.pathVa >>> 0);
    assert.equal(readI32(view, pathPlanBase + 8), js.usesConfigGfx ? 1 : 0);
  }

  /* ABI v6: SP clear pure islands + LoadImage prep Wasm ≡ JS. */
  assert.equal(exp.spClearAllocOk(0), 0);
  assert.equal(exp.spClearAllocOk(0x100), 1);
  assert.equal(exp.spClearOldPresent(0), 0);
  assert.equal(exp.spClearOldPresent(1), 1);
  assert.equal(exp.spClearCallbackNeeded(0, 1), 0);
  assert.equal(exp.spClearCallbackNeeded(1, 0), 0);
  assert.equal(exp.spClearCallbackNeeded(1, 1), 1);
  /* v12 byte-parameter sweep: virtual_al models `test al,al` — only the
     LOW byte decides, driven UNMASKED across the boundary (before v12 the
     module answered 1 for 0x100 where the PE's AL is 0). */
  for (const w of [0x100, 0x1ff, 0xff00, 0xffffffff]) {
    assert.equal(
      exp.spClearCallbackNeeded(w >>> 0, 1) !== 0,
      playerHudSpClearCallbackNeeded(w, 1),
      `wide spClear ${w}`,
    );
  }
  assert.equal(exp.spClearCallbackNeeded(0x100, 1), 0);
  assert.equal(exp.spClearCallbackNeeded(0x1ff, 1), 1);
  assert.equal(exp.skipsLoadImage(0), 1);
  assert.equal(exp.skipsLoadImage(0xabc), 0);
  assert.equal(exp.configGfxIsSso(0xf), 1);
  assert.equal(exp.configGfxIsSso(0x10), 0);

  const objBase = scratch + 0x6400;
  for (let i = 0; i < 0x18; i += 1) {
    writeU8(view, objBase + i, 0xcd);
  }
  exp.spClearObjectFinish(objBase, 0);
  assert.equal(readU32(view, objBase), 0x00b1a6e0);
  assert.equal(readU32(view, objBase + 0x14), 0);

  const pairBase = scratch + 0x6500;
  writeI32(view, pairBase + 0, -1);
  writeI32(view, pairBase + 4, -1);
  exp.spClearPairApply(pairBase, 0, 0x3000);
  assert.equal(readU32(view, pairBase + 0), 0);
  assert.equal(readU32(view, pairBase + 4), 0x3000);

  const aPair = scratch + 0x6600;
  const bPair = scratch + 0x6610;
  writeI32(view, aPair + 0, 0x11);
  writeI32(view, aPair + 4, 0x22);
  writeI32(view, bPair + 0, 0x33);
  writeI32(view, bPair + 4, 0x44);
  exp.spPairSwap(aPair, bPair);
  assert.equal(readU32(view, aPair + 0), 0x33);
  assert.equal(readU32(view, aPair + 4), 0x44);
  assert.equal(readU32(view, bPair + 0), 0x11);
  assert.equal(readU32(view, bPair + 4), 0x22);
  exp.spPairSwapAt(aPair, bPair);
  assert.equal(readU32(view, aPair + 0), 0x11);
  assert.equal(readU32(view, bPair + 0), 0x33);

  const prepCases = [
    {
      slotIndex: 0,
      itemEntryPtr: 0,
      pathInput: { slotIndex: 0, activeItemId: 0x122 },
      configCapacity: 0,
    },
    {
      slotIndex: 1,
      itemEntryPtr: 0x1000,
      pathInput: { slotIndex: 1, activeItemId: 0x122 },
      configCapacity: 0xff,
    },
    {
      slotIndex: 0,
      itemEntryPtr: 1,
      pathInput: { slotIndex: 0, activeItemId: 1 },
      configCapacity: 0xf,
    },
    {
      slotIndex: 2,
      itemEntryPtr: 1,
      pathInput: { slotIndex: 2, activeItemId: 1 },
      configCapacity: 0x10,
    },
    {
      slotIndex: 0,
      itemEntryPtr: 2,
      pathInput: {
        slotIndex: 0,
        activeItemId: 0x23,
        playerByte202c: 0,
        playerByte20a9: 0,
        playerDword1818: 3,
        playerActiveCharge: 1,
      },
      configCapacity: 0,
    },
    {
      slotIndex: 3,
      itemEntryPtr: 3,
      pathInput: {
        slotIndex: 3,
        activeItemId: 0x280,
        playerType: PLAYERHUD_TYPE_JUDAS,
        hasCollectible0x26b: true,
      },
      configCapacity: 0,
    },
  ];
  const prepBase = scratch + 0x6700;
  const prepInBase = scratch + 0x6800;
  for (const c of prepCases) {
    const js = playerHudActiveLoadImagePrep(c);
    writeActivePathInputs(view, prepInBase, c.pathInput ?? {});
    exp.loadImagePrep(
      prepBase,
      c.slotIndex,
      c.itemEntryPtr >>> 0,
      prepInBase,
      c.configCapacity >>> 0,
    );
    assert.equal(
      readI32(view, prepBase + 0),
      js.activeImageSpByteOff,
      `prep.sp ${JSON.stringify(c)}`,
    );
    assert.equal(readU32(view, prepBase + 4), js.spClearArg >>> 0);
    assert.equal(
      readI32(view, prepBase + 8),
      js.skipsLoadImage ? 1 : 0,
      `prep.skip ${JSON.stringify(c)}`,
    );
    assert.equal(
      readI32(view, prepBase + 12),
      js.pathKind,
      `prep.kind ${JSON.stringify(c)}`,
    );
    assert.equal(readU32(view, prepBase + 16), js.pathVa >>> 0);
    assert.equal(readI32(view, prepBase + 20), js.usesConfigGfx ? 1 : 0);
    assert.equal(readI32(view, prepBase + 24), js.configStringSso ? 1 : 0);
    assert.equal(readU32(view, prepBase + 28), js.hostVaSpClear >>> 0);
    assert.equal(readU32(view, prepBase + 32), js.hostVaLoadImage >>> 0);
    assert.equal(readU32(view, prepBase + 36), js.hostVaSpMaterialize >>> 0);
  }

  /* ABI v7: LoadImage call-site pure args + call plan Wasm ≡ JS. */
  assert.equal(exp.loadImagePathBufEbpOff(), -0x418);
  assert.equal(exp.loadImageResultEbpOff(), -0x14a8);
  assert.equal(exp.materializeThisEbpOff(), -0x14a0);
  assert.equal(exp.activeSpSavedEbpOff(), -0x1428);
  assert.equal(exp.dirtyFlagEbpOff(), -0x1419);
  assert.equal(exp.loadImageResultObjEbpOff(), -0x14a4);
  assert.equal(exp.materializeObjEbpOff(), -0x149c);
  assert.equal(exp.materializeSehTryLevel(), 0);
  assert.equal(exp.activeDirtyAfterGfx(), 1);

  const dirtyBase = scratch + 0x6900;
  writeU8(view, dirtyBase, 0);
  exp.activeDirtySet(dirtyBase);
  assert.equal(readU8(view, dirtyBase), 1);

  const callCases = [
    {
      slotIndex: 0,
      itemEntryPtr: 0,
      pathInput: { slotIndex: 0, activeItemId: 0x122 },
      configCapacity: 0,
    },
    {
      slotIndex: 1,
      itemEntryPtr: 0x1000,
      pathInput: { slotIndex: 1, activeItemId: 0x122 },
      configCapacity: 0xff,
    },
    {
      slotIndex: 0,
      itemEntryPtr: 1,
      pathInput: { slotIndex: 0, activeItemId: 1 },
      configCapacity: 0xf,
    },
    {
      slotIndex: 2,
      itemEntryPtr: 1,
      pathInput: { slotIndex: 2, activeItemId: 1 },
      configCapacity: 0x10,
    },
    {
      slotIndex: 0,
      itemEntryPtr: 2,
      pathInput: {
        slotIndex: 0,
        activeItemId: 0x23,
        playerByte202c: 0,
        playerByte20a9: 0,
        playerDword1818: 3,
        playerActiveCharge: 1,
      },
      configCapacity: 0,
    },
    {
      slotIndex: 3,
      itemEntryPtr: 3,
      pathInput: {
        slotIndex: 3,
        activeItemId: 0x280,
        playerType: PLAYERHUD_TYPE_JUDAS,
        hasCollectible0x26b: true,
      },
      configCapacity: 0,
    },
  ];
  const callBase = scratch + 0x6a00;
  const callInBase = scratch + 0x6b00;
  for (const c of callCases) {
    const js = playerHudActiveLoadImageCall(c);
    writeActivePathInputs(view, callInBase, c.pathInput ?? {});
    exp.loadImageCall(
      callBase,
      c.slotIndex,
      c.itemEntryPtr >>> 0,
      callInBase,
      c.configCapacity >>> 0,
    );
    assert.equal(
      readI32(view, callBase + 0),
      js.runsLoadImage ? 1 : 0,
      `call.runs ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, callBase + 4), js.pathKind);
    assert.equal(readU32(view, callBase + 8), js.pathVa >>> 0);
    assert.equal(readI32(view, callBase + 12), js.usesConfigGfx ? 1 : 0);
    assert.equal(readI32(view, callBase + 16), js.configStringSso ? 1 : 0);
    assert.equal(readI32(view, callBase + 20), js.pathBufferEbpOff);
    assert.equal(readI32(view, callBase + 24), js.resultSpEbpOff);
    assert.equal(readI32(view, callBase + 28), js.materializeThisEbpOff);
    assert.equal(readI32(view, callBase + 32), js.activeSpSavedEbpOff);
    assert.equal(readI32(view, callBase + 36), js.dirtyFlagEbpOff);
    assert.equal(readI32(view, callBase + 40), js.materializeSehTryLevel);
    assert.equal(readI32(view, callBase + 44), js.dirtyAfter);
    assert.equal(readI32(view, callBase + 48), js.activeImageSpByteOff);
    assert.equal(readU32(view, callBase + 52), js.hostVaLoadImage >>> 0);
    assert.equal(readU32(view, callBase + 56), js.hostVaSpMaterialize >>> 0);
  }

  /* ABI v8: book-overlay LoadImage / SP-clear call plan Wasm ≡ JS. */
  assert.equal(exp.bookImageSpOff(0), PLAYERHUD_BOOK_IMAGE_SP_BASE);
  assert.equal(exp.bookImageSpOff(2), PLAYERHUD_BOOK_IMAGE_SP_BASE + 2 * 0x1c);
  assert.equal(exp.bookSpClearArg(), 0);
  assert.equal(exp.bookDirtyAfterGfx(), 1);
  assert.equal(
    exp.bookLoadImageResultEbpOff(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    -0x14b8,
  );
  assert.equal(
    exp.bookMaterializeThisEbpOff(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    -0x14b0,
  );
  assert.equal(
    exp.bookLoadImageResultObjEbpOff(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    -0x14b4,
  );
  assert.equal(
    exp.bookMaterializeObjEbpOff(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    -0x14ac,
  );
  assert.equal(
    exp.bookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_VIRTUES),
    3,
  );
  assert.equal(
    exp.bookLoadImageResultEbpOff(PLAYERHUD_BOOK_PATH_KIND_BELIAL),
    -0x14c8,
  );
  assert.equal(
    exp.bookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_BELIAL),
    6,
  );
  assert.equal(
    exp.bookLoadImageResultEbpOff(PLAYERHUD_BOOK_PATH_KIND_BOTH),
    -0x14d8,
  );
  assert.equal(
    exp.bookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_BOTH),
    9,
  );
  assert.equal(exp.bookLoadImageResultEbpOff(PLAYERHUD_BOOK_PATH_KIND_CLEAR), 0);
  assert.equal(
    exp.bookMaterializeSehTryLevel(PLAYERHUD_BOOK_PATH_KIND_CLEAR),
    0,
  );

  const bookLoadCases = [
    { slotIndex: 0, bookOverlayId: 0 },
    { slotIndex: 2, bookOverlayId: 99 },
    {
      slotIndex: 0,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES,
    },
    {
      slotIndex: 1,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL,
    },
    {
      slotIndex: 3,
      bookOverlayId: PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL,
    },
  ];
  const bookCallBase = scratch + 0x6c00;
  for (const c of bookLoadCases) {
    const js = playerHudBookLoadImageCall(c);
    exp.bookLoadImageCall(bookCallBase, c.slotIndex, c.bookOverlayId);
    assert.equal(
      readI32(view, bookCallBase + 0),
      js.bookPathKind,
      `book.kind ${JSON.stringify(c)}`,
    );
    assert.equal(readU32(view, bookCallBase + 4), js.pathVa >>> 0);
    assert.equal(
      readI32(view, bookCallBase + 8),
      js.runsLoadImage ? 1 : 0,
      `book.runsLoad ${JSON.stringify(c)}`,
    );
    assert.equal(
      readI32(view, bookCallBase + 12),
      js.runsSpClear ? 1 : 0,
      `book.runsClear ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, bookCallBase + 16), js.bookImageSpByteOff);
    assert.equal(readI32(view, bookCallBase + 20), js.resultSpEbpOff);
    assert.equal(readI32(view, bookCallBase + 24), js.materializeThisEbpOff);
    assert.equal(readI32(view, bookCallBase + 28), js.resultObjEbpOff);
    assert.equal(readI32(view, bookCallBase + 32), js.materializeObjEbpOff);
    assert.equal(readI32(view, bookCallBase + 36), js.materializeSehTryLevel);
    assert.equal(readI32(view, bookCallBase + 40), js.dirtyFlagEbpOff);
    assert.equal(readI32(view, bookCallBase + 44), js.dirtyAfter);
    assert.equal(readU32(view, bookCallBase + 48), js.hostVaLoadImage >>> 0);
    assert.equal(
      readU32(view, bookCallBase + 52),
      js.hostVaSpMaterialize >>> 0,
    );
    assert.equal(readU32(view, bookCallBase + 56), js.hostVaSpClear >>> 0);
    assert.equal(readU32(view, bookCallBase + 60), js.spClearArg >>> 0);
  }

  /* ABI v9: trinket-pair residual after 0x00842c92 — Wasm ≡ JS. */
  assert.equal(exp.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  assert.equal(exp.trinketSlotCount(), PLAYERHUD_TRINKET_SLOT_COUNT);
  assert.equal(exp.cachedTrinketIdOff(0), PLAYERHUD_CACHED_TRINKET_ID_BASE);
  assert.equal(
    exp.cachedTrinketIdOff(1),
    PLAYERHUD_CACHED_TRINKET_ID_BASE + PLAYERHUD_TRINKET_SLOT_STRIDE,
  );
  assert.equal(
    exp.cachedTrinketSecondaryOff(0),
    PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE,
  );
  assert.equal(exp.trinketImageSpOff(0), PLAYERHUD_TRINKET_IMAGE_SP_BASE);
  assert.equal(
    exp.trinketImageSpOff(1),
    PLAYERHUD_TRINKET_IMAGE_SP_BASE + PLAYERHUD_TRINKET_SLOT_STRIDE,
  );
  assert.equal(exp.playerTrinketIdOff(0), PLAYERHUD_PLAYER_TRINKET_ID_BASE);
  assert.equal(exp.playerTrinketIdOff(1), PLAYERHUD_PLAYER_TRINKET_ID_BASE + 4);
  assert.equal(
    exp.playerTrinketSecondaryOff(),
    PLAYERHUD_PLAYER_TRINKET_SECONDARY,
  );
  assert.equal(exp.hostVaGetRoomByIdx(), PLAYERHUD_HOST_VA_GET_ROOM_BY_IDX);
  assert.equal(exp.hostVaSpSwap(), PLAYERHUD_HOST_VA_SP_SWAP);
  assert.equal(exp.hostVaDirtyNotify(), PLAYERHUD_HOST_VA_DIRTY_NOTIFY);
  assert.equal(
    exp.trinketLoadImageResultEbpOff(),
    PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF,
  );
  assert.equal(
    exp.trinketLoadImageResultObjEbpOff(),
    PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF,
  );
  assert.equal(exp.trinketSehTryLevel(), PLAYERHUD_TRINKET_SEH_TRY_LEVEL);
  assert.equal(exp.trinketDirtyAfterGfx(), PLAYERHUD_TRINKET_DIRTY_AFTER_GFX);

  assert.equal(playerHudTrinketSlotCount(), 2);
  assert.equal(playerHudTrinketMaskId(0x8001), 1);
  assert.equal(playerHudTrinketMaskId(0xffff), 0x7fff);
  assert.equal(playerHudTrinketSecondaryId(0xa6, 0x123), 0x123);
  assert.equal(playerHudTrinketSecondaryId(1, 0x123), 0);
  assert.equal(playerHudTrinketNeedsRoomSeedProbe(0x4b), 1);
  assert.equal(playerHudTrinketNeedsRoomSeedProbe(0x8000 | 0x4b), 1);
  assert.equal(playerHudTrinketNeedsRoomSeedProbe(1), 0);
  assert.equal(playerHudTrinketApply0x4bRemask(1, 0x12345678), 1);
  assert.equal(
    playerHudTrinketApply0x4bRemask(PLAYERHUD_TRINKET_SPECIAL_0x4b, 0),
    PLAYERHUD_TRINKET_SPECIAL_0x4b,
  );
  assert.equal(playerHudTrinketApply0x4bRemask(0x4b, 1), 130);
  assert.equal(playerHudTrinketApply0x4bRemask(0x4b, 2), 70);
  assert.equal(playerHudTrinketCacheChanged(1, 0, 1, 0), false);
  assert.equal(playerHudTrinketCacheChanged(1, 0, 2, 0), true);
  assert.equal(playerHudTrinketCacheChanged(1, 5, 1, 0), true);

  assert.equal(exp.trinketMaskId(0x8001), playerHudTrinketMaskId(0x8001));
  assert.equal(
    exp.trinketSecondaryId(0xa6, 0x55),
    playerHudTrinketSecondaryId(0xa6, 0x55),
  );
  assert.equal(
    exp.trinketSecondaryId(0, 0x55),
    playerHudTrinketSecondaryId(0, 0x55),
  );
  assert.equal(
    exp.trinketNeedsRoomSeedProbe(0x4b),
    playerHudTrinketNeedsRoomSeedProbe(0x4b),
  );
  for (const seed of [0, 1, 2, 0x5c, 0x12345678, 0xffffffff]) {
    assert.equal(
      exp.trinketApply0x4bRemask(0x4b, seed >>> 0),
      playerHudTrinketApply0x4bRemask(0x4b, seed >>> 0),
      `remask seed=${seed >>> 0}`,
    );
  }
  assert.equal(
    exp.trinketCacheChanged(1, 0, 1, 0),
    playerHudTrinketCacheChanged(1, 0, 1, 0) ? 1 : 0,
  );
  assert.equal(
    exp.trinketCacheChanged(1, 0, 2, 0),
    playerHudTrinketCacheChanged(1, 0, 2, 0) ? 1 : 0,
  );

  const hudBuf = scratch + 0x7000;
  const hudBytes = new Uint8Array(exp.memory.buffer, hudBuf, 0x300);
  hudBytes.fill(0);
  exp.trinketCacheApplyAt(hudBuf, 1, 0x11, 0x22);
  assert.equal(
    readI32(view, hudBuf + playerHudCachedTrinketIdByteOffset(1)),
    0x11,
  );
  assert.equal(
    readI32(view, hudBuf + playerHudCachedTrinketSecondaryByteOffset(1)),
    0x22,
  );
  const jsApply = playerHudTrinketCacheApplyAt(
    new Uint32Array(0xc0),
    1,
    0x11,
    0x22,
  );
  assert.equal(
    jsApply.hud[playerHudCachedTrinketIdByteOffset(1) >>> 2],
    0x11,
  );
  assert.equal(
    jsApply.hud[playerHudCachedTrinketSecondaryByteOffset(1) >>> 2],
    0x22,
  );

  const trinketCases = [
    {
      slotIndex: 0,
      rawTrinketId: 5,
      cachedId: 5,
      cachedSecondary: 0,
      playerSecondary1fb8: 0,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 0,
      rawTrinketId: 5,
      cachedId: 0,
      cachedSecondary: 0,
      playerSecondary1fb8: 0,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 1,
      rawTrinketId: 0x8000 | 0x10,
      cachedId: 0,
      cachedSecondary: 0,
      playerSecondary1fb8: 0,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 8, /* OOB → NULL kind */
    },
    {
      slotIndex: 0,
      rawTrinketId: 0x4b,
      cachedId: 0,
      cachedSecondary: 0,
      playerSecondary1fb8: 0,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 0,
      rawTrinketId: 0x4b,
      cachedId: 0,
      cachedSecondary: 0,
      playerSecondary1fb8: 0,
      roomSeed: 1,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 1,
      rawTrinketId: 7,
      cachedId: PLAYERHUD_TRINKET_TICK_CACHED_ID,
      cachedSecondary: 0,
      playerSecondary1fb8: 0x55,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 0x100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 0,
      rawTrinketId: 1,
      cachedId: PLAYERHUD_TRINKET_TICK_CACHED_ID,
      cachedSecondary: 0,
      playerSecondary1fb8: -3,
      roomSeed: 0,
      gamePresent: 1,
      gameNegTableSize: 8,
      managerCollectibleTableSize: 100,
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 0,
      rawTrinketId: 1,
      cachedId: PLAYERHUD_TRINKET_TICK_CACHED_ID,
      cachedSecondary: 0,
      playerSecondary1fb8: 9,
      roomSeed: 0,
      gamePresent: 0,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 4, /* OOB */
      managerTrinketTableSize: 200,
    },
    {
      slotIndex: 0,
      rawTrinketId: 1,
      cachedId: PLAYERHUD_TRINKET_TICK_CACHED_ID,
      cachedSecondary: 0,
      playerSecondary1fb8: 3,
      roomSeed: 0,
      gamePresent: 0,
      gameNegTableSize: 0,
      managerCollectibleTableSize: 10,
      managerTrinketTableSize: 200,
    },
  ];
  const trinketPlanBase = scratch + 0x7400;
  for (const c of trinketCases) {
    const js = playerHudTrinketGfxPlan(c);
    exp.trinketGfxPlan(
      trinketPlanBase,
      c.slotIndex,
      c.rawTrinketId >>> 0,
      c.cachedId,
      c.cachedSecondary,
      c.playerSecondary1fb8,
      c.roomSeed >>> 0,
      c.gamePresent,
      c.gameNegTableSize,
      c.managerCollectibleTableSize,
      c.managerTrinketTableSize,
    );
    assert.equal(
      readI32(view, trinketPlanBase + 0),
      js.needsTrinketGfx,
      `trinket.needs ${JSON.stringify(c)}`,
    );
    assert.equal(
      readI32(view, trinketPlanBase + 4),
      js.needsRoomSeedProbe,
      `trinket.probe ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, trinketPlanBase + 8), js.maskedId);
    assert.equal(readI32(view, trinketPlanBase + 12), js.secondaryId);
    assert.equal(
      readI32(view, trinketPlanBase + 16),
      js.tableKind,
      `trinket.kind ${JSON.stringify(c)} → js=${js.tableKind}`,
    );
    assert.equal(readI32(view, trinketPlanBase + 20), js.lookupIndex);
    assert.equal(readI32(view, trinketPlanBase + 24), js.cachedIdByteOff);
    assert.equal(
      readI32(view, trinketPlanBase + 28),
      js.cachedSecondaryByteOff,
    );
    assert.equal(readI32(view, trinketPlanBase + 32), js.trinketImageSpByteOff);
    assert.equal(readI32(view, trinketPlanBase + 36), js.resultSpEbpOff);
    assert.equal(readI32(view, trinketPlanBase + 40), js.resultObjEbpOff);
    assert.equal(readI32(view, trinketPlanBase + 44), js.sehTryLevel);
    assert.equal(readI32(view, trinketPlanBase + 48), js.dirtyFlagEbpOff);
    assert.equal(readI32(view, trinketPlanBase + 52), js.dirtyAfter);
    assert.equal(
      readU32(view, trinketPlanBase + 56),
      js.hostVaGetRoomByIdx >>> 0,
    );
    assert.equal(readU32(view, trinketPlanBase + 60), js.hostVaLoadImage >>> 0);
    assert.equal(readU32(view, trinketPlanBase + 64), js.hostVaSpSwap >>> 0);
    assert.equal(
      readU32(view, trinketPlanBase + 68),
      js.hostVaDirtyNotify >>> 0,
    );
  }

  /* ABI v10: pocket/charge residual after 0x00842f8a — Wasm ≡ JS. */
  assert.equal(exp.pocketSlotCount(), PLAYERHUD_POCKET_SLOT_COUNT);
  assert.equal(exp.pocketSlotStride(), PLAYERHUD_POCKET_SLOT_STRIDE);
  assert.equal(exp.cachedPocketTypeOff(0), PLAYERHUD_CACHED_POCKET_TYPE_BASE);
  assert.equal(
    exp.cachedPocketTypeOff(1),
    PLAYERHUD_CACHED_POCKET_TYPE_BASE + PLAYERHUD_POCKET_SLOT_STRIDE,
  );
  assert.equal(exp.cachedPocketIdOff(0), PLAYERHUD_CACHED_POCKET_ID_BASE);
  assert.equal(
    exp.cachedPocketIdOff(3),
    PLAYERHUD_CACHED_POCKET_ID_BASE + 3 * PLAYERHUD_POCKET_SLOT_STRIDE,
  );
  assert.equal(exp.pocketAnm2Off(0), PLAYERHUD_POCKET_ANM2_BASE);
  assert.equal(
    exp.pocketAnm2Off(2),
    PLAYERHUD_POCKET_ANM2_BASE + 2 * PLAYERHUD_POCKET_SLOT_STRIDE,
  );
  assert.equal(exp.playerPocketIdOff(0), PLAYERHUD_PLAYER_POCKET_ID_BASE);
  assert.equal(exp.playerPocketIdOff(1), PLAYERHUD_PLAYER_POCKET_ID_BASE + 8);
  assert.equal(exp.playerPocketTypeOff(0), PLAYERHUD_PLAYER_POCKET_TYPE_BASE);
  assert.equal(
    exp.playerPocketTypeOff(3),
    PLAYERHUD_PLAYER_POCKET_TYPE_BASE + 24,
  );
  assert.equal(exp.hostVaGetEntity(), PLAYERHUD_HOST_VA_GET_ENTITY);
  assert.equal(exp.hostVaAnm2Load(), PLAYERHUD_HOST_VA_ANM2_LOAD);
  assert.equal(exp.hostVaAnm2Reset(), PLAYERHUD_HOST_VA_ANM2_RESET);
  assert.equal(exp.getEntityType(), PLAYERHUD_GET_ENTITY_TYPE);
  assert.equal(exp.getEntityVariantCard(), PLAYERHUD_GET_ENTITY_VARIANT_CARD);
  assert.equal(exp.getEntityVariantPill(), PLAYERHUD_GET_ENTITY_VARIANT_PILL);
  assert.equal(
    exp.managerEntityConfigOff(),
    PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF,
  );
  assert.equal(exp.entityAnmPathOff(), PLAYERHUD_ENTITY_ANM_PATH_OFF);
  assert.equal(exp.anm2LoadGraphics(), PLAYERHUD_ANM2_LOAD_GRAPHICS);

  assert.equal(playerHudPocketSlotCount(), 4);
  assert.equal(playerHudPocketSlotStride(), 0x11c);
  assert.equal(playerHudPocketClampSlot(0), 0);
  assert.equal(playerHudPocketClampSlot(1), 1);
  assert.equal(playerHudPocketClampSlot(2), 2);
  assert.equal(playerHudPocketClampSlot(3), 3);
  assert.equal(playerHudPocketClampSlot(4), 3);
  assert.equal(playerHudPocketClampSlot(-1), 0);
  assert.equal(exp.pocketClampSlot(0), playerHudPocketClampSlot(0));
  assert.equal(exp.pocketClampSlot(3), playerHudPocketClampSlot(3));
  assert.equal(exp.pocketClampSlot(4), playerHudPocketClampSlot(4));
  assert.equal(exp.pocketClampSlot(-5), playerHudPocketClampSlot(-5));

  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_CARD, 7, 0, 0, 0),
    7,
  );
  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_CARD, 0, 0, 0, 0),
    0,
  );
  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0x1000, 42),
    42,
  );
  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0, 42),
    0,
  );
  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, -1, 10, 0x1000, 42),
    0,
  );
  assert.equal(
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 10, 10, 0x1000, 42),
    0,
  );
  assert.equal(playerHudPocketResolvedId(2, 9, 10, 0x1000, 42), 0);
  assert.equal(playerHudPocketCacheChanged(0, 1, 0, 1), false);
  assert.equal(playerHudPocketCacheChanged(0, 1, 1, 1), true);
  assert.equal(playerHudPocketCacheChanged(0, 1, 0, 2), true);
  assert.equal(
    playerHudPocketPathKind(PLAYERHUD_POCKET_TYPE_CARD, 5),
    PLAYERHUD_POCKET_PATH_KIND_CARD,
  );
  assert.equal(
    playerHudPocketPathKind(PLAYERHUD_POCKET_TYPE_PILL, 9),
    PLAYERHUD_POCKET_PATH_KIND_PILL,
  );
  assert.equal(
    playerHudPocketPathKind(PLAYERHUD_POCKET_TYPE_CARD, 0),
    PLAYERHUD_POCKET_PATH_KIND_RESET,
  );
  assert.equal(
    playerHudPocketPathKind(2, 1),
    PLAYERHUD_POCKET_PATH_KIND_RESET,
  );

  assert.equal(
    exp.pocketResolvedId(PLAYERHUD_POCKET_TYPE_CARD, 7, 0, 0, 0),
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_CARD, 7, 0, 0, 0),
  );
  assert.equal(
    exp.pocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0x1000, 42),
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0x1000, 42),
  );
  assert.equal(
    exp.pocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0, 42),
    playerHudPocketResolvedId(PLAYERHUD_POCKET_TYPE_PILL, 3, 10, 0, 42),
  );
  assert.equal(
    exp.pocketCacheChanged(0, 1, 0, 1),
    playerHudPocketCacheChanged(0, 1, 0, 1) ? 1 : 0,
  );
  assert.equal(
    exp.pocketCacheChanged(0, 1, 0, 2),
    playerHudPocketCacheChanged(0, 1, 0, 2) ? 1 : 0,
  );
  assert.equal(
    exp.pocketPathKind(PLAYERHUD_POCKET_TYPE_CARD, 5),
    playerHudPocketPathKind(PLAYERHUD_POCKET_TYPE_CARD, 5),
  );
  assert.equal(
    exp.pocketPathKind(PLAYERHUD_POCKET_TYPE_PILL, 0),
    playerHudPocketPathKind(PLAYERHUD_POCKET_TYPE_PILL, 0),
  );

  const pocketHudBuf = scratch + 0x8000;
  const pocketHudBytes = new Uint8Array(exp.memory.buffer, pocketHudBuf, 0x600);
  pocketHudBytes.fill(0);
  exp.pocketCacheApplyAt(pocketHudBuf, 2, 1, 0x55);
  assert.equal(
    readI32(view, pocketHudBuf + playerHudCachedPocketTypeByteOffset(2)),
    1,
  );
  assert.equal(
    readI32(view, pocketHudBuf + playerHudCachedPocketIdByteOffset(2)),
    0x55,
  );
  const jsPocketApply = playerHudPocketCacheApplyAt(
    new Uint32Array(0x200),
    2,
    1,
    0x55,
  );
  assert.equal(
    jsPocketApply.hud[playerHudCachedPocketTypeByteOffset(2) >>> 2],
    1,
  );
  assert.equal(
    jsPocketApply.hud[playerHudCachedPocketIdByteOffset(2) >>> 2],
    0x55,
  );

  const pocketCases = [
    {
      slotIndex: 0,
      pocketType: PLAYERHUD_POCKET_TYPE_CARD,
      pocketId: 5,
      cachedType: 5,
      cachedId: 5,
      pillTableSize: 0,
      pillEntryPtr: 0,
      pillEffectId: 0,
    },
    {
      slotIndex: 0,
      pocketType: PLAYERHUD_POCKET_TYPE_CARD,
      pocketId: 5,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 0,
      pillEntryPtr: 0,
      pillEffectId: 0,
    },
    {
      slotIndex: 1,
      pocketType: PLAYERHUD_POCKET_TYPE_CARD,
      pocketId: 0,
      cachedType: 1,
      cachedId: 1,
      pillTableSize: 0,
      pillEntryPtr: 0,
      pillEffectId: 0,
    },
    {
      slotIndex: 2,
      pocketType: PLAYERHUD_POCKET_TYPE_PILL,
      pocketId: 3,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 10,
      pillEntryPtr: 0x2000,
      pillEffectId: 99,
    },
    {
      slotIndex: 2,
      pocketType: PLAYERHUD_POCKET_TYPE_PILL,
      pocketId: 3,
      cachedType: 1,
      cachedId: 99,
      pillTableSize: 10,
      pillEntryPtr: 0x2000,
      pillEffectId: 99,
    },
    {
      slotIndex: 3,
      pocketType: PLAYERHUD_POCKET_TYPE_PILL,
      pocketId: 3,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 10,
      pillEntryPtr: 0,
      pillEffectId: 99,
    },
    {
      slotIndex: 0,
      pocketType: PLAYERHUD_POCKET_TYPE_PILL,
      pocketId: -1,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 10,
      pillEntryPtr: 0x2000,
      pillEffectId: 99,
    },
    {
      slotIndex: 1,
      pocketType: 2,
      pocketId: 7,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 0,
      pillEntryPtr: 0,
      pillEffectId: 0,
    },
    {
      slotIndex: 4 /* clamp player fields; HUD stride uses raw slot */,
      pocketType: PLAYERHUD_POCKET_TYPE_CARD,
      pocketId: 8,
      cachedType: 0,
      cachedId: 0,
      pillTableSize: 0,
      pillEntryPtr: 0,
      pillEffectId: 0,
    },
  ];
  const pocketPlanBase = scratch + 0x8600;
  for (const c of pocketCases) {
    const js = playerHudPocketGfxPlan(c);
    exp.pocketGfxPlan(
      pocketPlanBase,
      c.slotIndex,
      c.pocketType,
      c.pocketId,
      c.cachedType,
      c.cachedId,
      c.pillTableSize,
      c.pillEntryPtr >>> 0,
      c.pillEffectId,
    );
    assert.equal(
      readI32(view, pocketPlanBase + 0),
      js.needsPocketGfx,
      `pocket.needs ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, pocketPlanBase + 4), js.pocketType);
    assert.equal(
      readI32(view, pocketPlanBase + 8),
      js.resolvedId,
      `pocket.resolved ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, pocketPlanBase + 12), js.playerSlotIndex);
    assert.equal(readI32(view, pocketPlanBase + 16), js.cachedTypeByteOff);
    assert.equal(readI32(view, pocketPlanBase + 20), js.cachedIdByteOff);
    assert.equal(readI32(view, pocketPlanBase + 24), js.anm2ByteOff);
    assert.equal(
      readI32(view, pocketPlanBase + 28),
      js.hostPathKind,
      `pocket.path ${JSON.stringify(c)}`,
    );
    assert.equal(readI32(view, pocketPlanBase + 32), js.getEntityType);
    assert.equal(readI32(view, pocketPlanBase + 36), js.getEntityVariant);
    assert.equal(readI32(view, pocketPlanBase + 40), js.getEntitySubtype);
    assert.equal(
      readI32(view, pocketPlanBase + 44),
      js.managerEntityConfigOff,
    );
    assert.equal(readI32(view, pocketPlanBase + 48), js.entityAnmPathOff);
    assert.equal(readI32(view, pocketPlanBase + 52), js.anm2LoadGraphics);
    assert.equal(readI32(view, pocketPlanBase + 56), js.needsPillTableProbe);
    assert.equal(readI32(view, pocketPlanBase + 60), js.pillTableLookupIndex);
    assert.equal(
      readU32(view, pocketPlanBase + 64),
      js.hostVaGetEntity >>> 0,
    );
    assert.equal(readU32(view, pocketPlanBase + 68), js.hostVaAnm2Load >>> 0);
    assert.equal(
      readU32(view, pocketPlanBase + 72),
      js.hostVaAnm2Reset >>> 0,
    );
  }
});

function expectHeartsPlan(view, planBase, exp0, twinPtr, playerType, field3bc) {
  exp0.heartsCallPlan(planBase, twinPtr, playerType, field3bc);
  const isTwin = exp0.usesTwin(twinPtr, playerType, field3bc);
  assert.equal(readI32(view, planBase + 0), isTwin, "is_twin");
  if (isTwin) {
    assert.equal(readI32(view, planBase + 4), 2, "call_count twin");
    assert.equal(readI32(view, planBase + 8), PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF);
    assert.equal(
      readI32(view, planBase + 12),
      PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
    );
    assert.equal(
      readI32(view, planBase + 16),
      PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
    );
    assert.equal(
      readI32(view, planBase + 20),
      PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF,
    );
    assert.equal(
      readI32(view, planBase + 24),
      PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS,
    );
    assert.equal(
      readI32(view, planBase + 28),
      PLAYERHUD_UPDATE_HEARTS_ARG_TWIN,
    );
  } else {
    assert.equal(readI32(view, planBase + 4), 1, "call_count single");
    assert.equal(readI32(view, planBase + 8), PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF);
    assert.equal(
      readI32(view, planBase + 12),
      PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS,
    );
    assert.equal(
      readI32(view, planBase + 16),
      PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER,
    );
  }
}

test("v17 UpdateHearts call-site plan matches PE 0x008422b3..0x008422ee", () => {
  const exp = loadExports();
  if (exp.memory.buffer.byteLength < 0x10000 + 0x200) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  const planBase = 0x10100;

  /* Single path: twin absent, wrong type, or field_3bc set. */
  expectHeartsPlan(view, planBase, exp, 0, 0x10, 0);
  expectHeartsPlan(view, planBase, exp, 0, 0x11, 0);
  expectHeartsPlan(view, planBase, exp, 0, 5, 0);
  expectHeartsPlan(view, planBase, exp, 0x1234, 0x10, 1);
  expectHeartsPlan(view, planBase, exp, 0x1234, 5, 0);

  /* Twin path: only type 0x10/0x11 with field_3bc==0. */
  expectHeartsPlan(view, planBase, exp, 0x1234, 0x10, 0);
  expectHeartsPlan(view, planBase, exp, 0x1234, 0x11, 0);
  expectHeartsPlan(view, planBase, exp, 0xffffffff, 0x10, 0);
  expectHeartsPlan(view, planBase, exp, 0x100, 0x11, 0);

  /* Wide-pointer path is twin: 0x100 must not be seen as 0. */
  assert.equal(exp.usesTwin(0x100, 0x10, 0), 1);

  /* Differential sweep against the JS oracle. */
  for (const tp of [0, 1, 0x100, 0xffffffff]) {
    for (const ty of [0, 4, 0x10, 0x11, 0x1f, -1]) {
      for (const f3 of [-1, 0, 1, 0x1000]) {
        exp.heartsCallPlan(planBase, tp, ty, f3);
        const want = playerHudUpdateHeartsCallPlan(tp, ty, f3);
        assert.equal(readI32(view, planBase + 0), want.isTwin);
        assert.equal(readI32(view, planBase + 4), want.calls.length);
        for (let c = 0; c < want.calls.length; c += 1) {
          const o = 8 + c * 12;
          assert.equal(readI32(view, planBase + o + 0), want.calls[c].heartSlotsOff);
          assert.equal(readI32(view, planBase + o + 4), want.calls[c].maxSlots);
          assert.equal(readI32(view, planBase + o + 8), want.calls[c].argSource);
        }
      }
    }
  }
});


test("header documents v11 P5 residual at 0x00843116", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x00843116/);
  assert.match(h, /0x0084312f/);
  assert.match(h, /0x0084315a/);
  assert.match(h, /0x008431e0/);
  assert.match(h, /0x00843213/);
  assert.match(h, /0x0101/);
  assert.match(h, /isaac_playerhud_p5_block_needed/);
  assert.match(h, /isaac_playerhud_p5_push_needs_grow/);
  assert.match(h, /0x00a0f4c0/);
  assert.match(h, /0x0084bc30/);
  const src = readFileSync(source, "utf8");
  assert.match(src, /jns|slot_needs_insert/);
  assert.match(src, /p5_block_needed/);

  assert.equal(PLAYERHUD_P5_CHAR_TYPE_MATCH, 0x15);
  assert.equal(PLAYERHUD_P5_WALK_STRIDE, 0xc);
  assert.equal(PLAYERHUD_P5_ELEM_STRIDE, 0xc);
  assert.equal(PLAYERHUD_P5_NODE_ALLOC_SIZE, 0x1c);
  assert.equal(PLAYERHUD_P5_NODE_FLAG_WORD, 0x0101);
  assert.equal(PLAYERHUD_P5_OFF_SLOT_BASE_1E00, 0x1e00);
  assert.equal(PLAYERHUD_P5_HOST_VA_ALLOC, 0x00a0f4c0);
  assert.equal(PLAYERHUD_P5_HOST_VA_PUSH_GROW, 0x0084bc30);
  assert.equal(PLAYERHUD_P5_SKIP_VA_DISABLED, 0x00843af1);
  assert.equal(PLAYERHUD_P5_SKIP_VA_WRONG_CHAR, 0x00843667);
});

test("JS oracle: P5 gate / walk / slot / push CF (v11)", () => {
  assert.equal(playerhudP5BlockNeeded(1, 0x15), true);
  assert.equal(playerhudP5BlockNeeded(0, 0x15), false);
  assert.equal(playerhudP5BlockNeeded(1, 0x14), false);
  assert.equal(playerhudP5BlockNeeded(0xff, 0x15), true);
  // Only the low byte of the enable slot participates.
  assert.equal(playerhudP5BlockNeeded(0x100, 0x15), false);

  // The enable byte is tested first, so it decides the skip target.
  assert.equal(playerhudP5SkipVa(0, 0x14), PLAYERHUD_P5_SKIP_VA_DISABLED);
  assert.equal(playerhudP5SkipVa(1, 0x14), PLAYERHUD_P5_SKIP_VA_WRONG_CHAR);
  assert.equal(playerhudP5SkipVa(1, 0x15), 0);

  assert.equal(playerhudP5NodeFlagWord(), 0x0101);
  assert.equal(playerhudP5NodeSelfPtr(0x5000, 0), 0x5000);
  assert.equal(playerhudP5NodeSelfPtr(0x5000, 4), 0x5000);
  assert.equal(playerhudP5NodeSelfPtr(0x5000, 8), 0x5000);
  assert.equal(playerhudP5NodeSelfPtr(0x5000, 0xc), 0);

  assert.equal(playerhudP5WalkTerminates(0x1000, 0x1000), true);
  assert.equal(playerhudP5WalkTerminates(0x1000, 0x100c), true);
  assert.equal(playerhudP5WalkTerminates(0x1000, 0x1024), true);
  // Reproduce, do not correct: a partial-stride span never hits equality.
  assert.equal(playerhudP5WalkTerminates(0x1000, 0x1008), false);
  assert.equal(playerhudP5WalkTerminates(0x100c, 0x1000), false);
  assert.equal(playerhudP5WalkSteps(0x1000, 0x1024), 3);
  assert.equal(playerhudP5WalkSteps(0x1000, 0x1008), -1);

  assert.equal(playerhudP5SlotNeedsInsert(-1), true);
  assert.equal(playerhudP5SlotNeedsInsert(0), false);
  assert.equal(playerhudP5SlotNeedsInsert(1), false);
  assert.equal(playerhudP5SlotNeedsInsert(-0x80000000), true);
  assert.equal(playerhudP5SlotByteOffset(0), 0x1e00);
  assert.equal(playerhudP5SlotByteOffset(3), 0x1e0c);

  assert.equal(playerhudP5PushNeedsGrow(0x40, 0x40), true);
  assert.equal(playerhudP5PushNeedsGrow(0x40, 0x4c), false);
  assert.equal(playerhudP5PushAdvance(0x40), 0x4c);
  assert.equal(playerhudP5PushAdvance(0xfffffffc), 8);
});

test("Wasm matches JS: P5 residual CF (v11)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);

  for (const en of [0, 1, 0xff, 0x100, 0x1ff]) {
    for (const ct of [0x14, 0x15, 0x16, 0, -1]) {
      assert.equal(
        exp.p5BlockNeeded(en | 0, ct) !== 0,
        playerhudP5BlockNeeded(en, ct),
        `p5 gate ${en}/${ct}`,
      );
      assert.equal(
        exp.p5SkipVa(en | 0, ct) >>> 0,
        playerhudP5SkipVa(en, ct) >>> 0,
        `p5 skip ${en}/${ct}`,
      );
    }
  }
  assert.equal(exp.p5NodeFlagWord(), playerhudP5NodeFlagWord());
  for (const off of [0, 4, 8, 0xc, -4]) {
    assert.equal(
      exp.p5NodeSelfPtr(0x5000, off) >>> 0,
      playerhudP5NodeSelfPtr(0x5000, off) >>> 0,
      `p5 self ptr ${off}`,
    );
  }
  const spans = [
    [0x1000, 0x1000],
    [0x1000, 0x100c],
    [0x1000, 0x1024],
    [0x1000, 0x1008],
    [0x100c, 0x1000],
    [0, 0x7ffffff4],
  ];
  for (const [c, e] of spans) {
    assert.equal(
      exp.p5WalkTerminates(c | 0, e | 0) !== 0,
      playerhudP5WalkTerminates(c, e),
      `p5 walk ${c}/${e}`,
    );
    assert.equal(
      exp.p5WalkSteps(c | 0, e | 0),
      playerhudP5WalkSteps(c, e),
      `p5 steps ${c}/${e}`,
    );
  }
  for (const v of [-1, 0, 1, -0x80000000, 0x7fffffff]) {
    assert.equal(
      exp.p5SlotNeedsInsert(v) !== 0,
      playerhudP5SlotNeedsInsert(v),
      `p5 slot ${v}`,
    );
  }
  for (const i of [0, 1, 3, 100, -1]) {
    assert.equal(
      exp.p5SlotByteOffset(i),
      playerhudP5SlotByteOffset(i),
      `p5 slot off ${i}`,
    );
  }
  for (const [e, cap] of [
    [0x40, 0x40],
    [0x40, 0x4c],
    [0, 0],
    [0xffffffff, 0xffffffff],
  ]) {
    assert.equal(
      exp.p5PushNeedsGrow(e | 0, cap | 0) !== 0,
      playerhudP5PushNeedsGrow(e, cap),
      `p5 grow ${e}/${cap}`,
    );
  }
  for (const e of [0, 0x40, 0xfffffffc, 0xffffffff]) {
    assert.equal(
      exp.p5PushAdvance(e | 0) >>> 0,
      playerhudP5PushAdvance(e),
      `p5 advance ${e}`,
    );
  }

  // Deterministic randomized sweep over the walk / push arithmetic.
  let rng = (0x843116 ^ 0x1e00) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  /* Draw from the HIGH bits: this LCG's low bits have period 2^k,
     so `next() % n` is strongly correlated between draws. */
  const pick = (n) => Math.floor((next() / 4294967296) * n);
  for (let t = 0; t < 300; t += 1) {
    const c = next() >>> 8;
    const e = next() >>> 8;
    assert.equal(
      exp.p5WalkTerminates(c | 0, e | 0) !== 0,
      playerhudP5WalkTerminates(c, e),
      `rnd walk ${t}`,
    );
    assert.equal(
      exp.p5WalkSteps(c | 0, e | 0),
      playerhudP5WalkSteps(c, e),
      `rnd steps ${t}`,
    );
    const v = (next() | 0) >> (pick(30));
    assert.equal(
      exp.p5SlotNeedsInsert(v) !== 0,
      playerhudP5SlotNeedsInsert(v),
      `rnd slot ${t}`,
    );
    const end = next();
    assert.equal(
      exp.p5PushAdvance(end | 0) >>> 0,
      playerhudP5PushAdvance(end),
      `rnd advance ${t}`,
    );
    const en = pick(512);
    const ct = (pick(4)) + 0x13;
    assert.equal(
      exp.p5BlockNeeded(en | 0, ct) !== 0,
      playerhudP5BlockNeeded(en, ct),
      `rnd gate ${t}`,
    );
  }
});

test("v13 P6 pocket-upgrade pure CF fixed edges (VA 0x0084327d..0x008435ed)", () => {
  /* Geometry: 16 slots, slot offset, array element index. */
  assert.equal(playerhudPocketUpgradeSlotCount(), 16);
  assert.equal(playerhudPocketUpgradeSlotByteOffset(0), 0x1e00);
  assert.equal(playerhudPocketUpgradeSlotByteOffset(1), 0x1e04);
  assert.equal(playerhudPocketUpgradeSlotByteOffset(15), 0x1e00 + 60);
  assert.equal(playerhudPocketUpgradeSlotByteOffset(-1), (0x1e00 - 4) | 0);
  assert.equal(playerhudPocketUpgradeSlotByteOffset(0x40000000), (0x1e00 + 0) | 0);
  assert.equal(playerhudPocketUpgradeSlotIsUpgrade(0), true);
  assert.equal(playerhudPocketUpgradeSlotIsUpgrade(1), true);
  assert.equal(playerhudPocketUpgradeSlotIsUpgrade(-1), false);
  assert.equal(playerhudPocketUpgradeSlotIsUpgrade(-0x80000000), false);
  assert.equal(playerhudPocketUpgradeArrayPtrByteOffset(), 0x1dec);
  for (let i = 0; i < 16; i += 1) {
    assert.equal(
      playerhudPocketUpgradeArrayElementDwordIndex(i),
      i * 7 + 2,
      `element index ${i}`,
    );
    assert.equal(
      playerhudPocketUpgradeArrayIdByteOffset(i),
      (i * 7 + 2) * 4,
      `id byte offset ${i}`,
    );
  }
  assert.equal(
    playerhudPocketUpgradeArrayElementDwordIndex(0x40000000),
    (0x40000000 * 7 + 2) | 0,
  );

  /* Resolve CF: signed bounds, ~id, Game absent/present. */
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 5, 0, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER,
  );
  assert.equal(playerhudPocketUpgradeResolveIndex(0, 5, 0, 100), 5);
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 100, 0, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  /* Signed jl: in-bounds requires id < size, so id == size is SKIP. */
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 0x7fffffff, 0, 0x7fffffff),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 0x7ffffffe, 0, 0x7fffffff),
    PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 0x7fffffff, 0, 0x7ffffffe),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, -1, 10, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -1, 4, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG,
  );
  assert.equal(playerhudPocketUpgradeResolveIndex(1, -1, 4, 100), 0);
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -5, 4, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -2, 2, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG,
  );
  assert.equal(playerhudPocketUpgradeResolveIndex(1, -2, 2, 100), 1);
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -0x80000000, 0x7fffffff, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -1, 0, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  /* Negative table size (wrapped diff >> 2) → everything out of bounds. */
  assert.equal(
    playerhudPocketUpgradeResolveKind(1, -1, -1, 100),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );
  assert.equal(
    playerhudPocketUpgradeResolveKind(0, 5, 0, -1),
    PLAYERHUD_POCKET_UPGRADE_KIND_SKIP,
  );

  /* Entry gate: null or *entry == 3 skips. */
  assert.equal(playerhudPocketUpgradeEntryUsable(0, 0), false);
  assert.equal(playerhudPocketUpgradeEntryUsable(0, 3), false);
  assert.equal(playerhudPocketUpgradeEntryUsable(0x1000, 3), false);
  assert.equal(playerhudPocketUpgradeEntryUsable(0x1000, 2), true);
  assert.equal(playerhudPocketUpgradeEntryUsable(0x1000, 0), true);

  /* Post-0x4288a0 take gate: byte +0xd (LOW byte), word +0x10 signed,
     result != list head. */
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, 0, 5, 0x1000, 0x2000),
    true,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0xff, 0, 5, 0x1000, 0x2000),
    false,
  );
  /* Wide bytes: PE tests a byte, so 0x100/0xff00 behave as 0. */
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0x100, 0, 5, 0x1000, 0x2000),
    true,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0x1ff, 0, 5, 0x1000, 0x2000),
    false,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0xff00, 0, 5, 0x1000, 0x2000),
    true,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0xffffffff, 0, 5, 0x1000, 0x2000),
    false,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, 5, 4, 0x1000, 0x2000),
    false,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, 5, 5, 0x1000, 0x2000),
    true,
  );
  /* Signed compare: -1 < 0 → not take. */
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, 0, -1, 0x1000, 0x2000),
    false,
  );
  /* Signed compare: 5 < -1 is false → take. */
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, -1, 5, 0x1000, 0x2000),
    true,
  );
  assert.equal(
    playerhudPocketUpgradeTakeResultValue(0, 0, 5, 0x1000, 0x1000),
    false,
  );

  /* Branch select. */
  assert.equal(
    playerhudPocketUpgradeBranchKind(true, 5),
    PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT,
  );
  assert.equal(
    playerhudPocketUpgradeBranchKind(false, -1),
    PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG,
  );
  assert.equal(
    playerhudPocketUpgradeBranchKind(false, 0),
    PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG,
  );
  assert.equal(
    playerhudPocketUpgradeBranchKind(false, -0x80000000),
    PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG,
  );

  /* Insert value per branch. */
  assert.equal(
    playerhudPocketUpgradeInsertValue(
      PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT,
      -1,
      0x1234,
      99,
    ),
    0x1234,
  );
  assert.equal(
    playerhudPocketUpgradeInsertValue(
      PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG,
      -7,
      0x1234,
      99,
    ),
    -7,
  );
  assert.equal(
    playerhudPocketUpgradeInsertValue(
      PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG,
      5,
      0x1234,
      99,
    ),
    99,
  );
  assert.equal(
    playerhudPocketUpgradeInsertValue(PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP, 1, 2, 3),
    0,
  );

  /* CONFIG path ptr: SSO → entry+0x38 else heap ptr. */
  assert.equal(
    playerhudPocketUpgradeConfigPathPtr(0x2000, 1, 0x3000) >>> 0,
    0x2038,
  );
  assert.equal(
    playerhudPocketUpgradeConfigPathPtr(0x2000, 0, 0x3000) >>> 0,
    0x3000,
  );
  /* Full-word capacity test: 0xffffffff is NOT SSO (>= 0x10). */
  assert.equal(playerhudPocketUpgradeConfigCapacityByteOffset(), 0x4c);

  /* Global callback gate: low byte + DAT_00c7163c. */
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(0, 0x1234), false);
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(1, 0), false);
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(1, 0x1234), true);
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(0x100, 0x1234), false);
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(0x1ff, 0x1234), true);
  assert.equal(playerhudPocketUpgradeGlobalCallbackNeeded(0xffffffff, 0x1234), true);
  /* PE test al,al at 0x0084325d: al=0xff is non-zero -> callback needed. */
  assert.equal(
    playerhudPocketUpgradeGlobalCallbackNeeded(0xff, 0x1234),
    true,
  );
  assert.equal(
    playerhudPocketUpgradeResultFollowupNeeded(0),
    false,
  );
  assert.equal(
    playerhudPocketUpgradeResultFollowupNeeded(0x1000),
    true,
  );
  assert.equal(playerhudPocketUpgradeResultCopyByteOffset(), 0x14);

  /* EBP frame slots per branch. */
  assert.equal(playerhudPocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), -0x145c);
  assert.equal(playerhudPocketUpgradeElemEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), -0x1458);
  assert.equal(playerhudPocketUpgradeVirtualEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), -0x1454);
  assert.equal(playerhudPocketUpgradeGlobalArgEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), -0x1458);
  assert.equal(playerhudPocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), -0x1468);
  assert.equal(playerhudPocketUpgradeElemEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), -0x1464);
  assert.equal(playerhudPocketUpgradeVirtualEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), -0x1460);
  assert.equal(playerhudPocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), -0x1474);
  assert.equal(playerhudPocketUpgradeElemEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), -0x1470);
  assert.equal(playerhudPocketUpgradeVirtualEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), -0x146c);
  assert.equal(playerhudPocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP), 0);
  assert.equal(playerhudPocketUpgradeSehFirst(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), 0x11);
  assert.equal(playerhudPocketUpgradeSehCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), 3);
  assert.equal(playerhudPocketUpgradeSehFirst(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), 0x14);
  assert.equal(playerhudPocketUpgradeSehCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), 2);
  assert.equal(playerhudPocketUpgradeSehFirst(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), 0x16);
  assert.equal(playerhudPocketUpgradeSehCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), 6);
  assert.equal(playerhudPocketUpgradeCallbackCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), 2);
  assert.equal(playerhudPocketUpgradeCallbackCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), 1);
  assert.equal(playerhudPocketUpgradeCallbackCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), 3);
  assert.equal(playerhudPocketUpgradeCallbackCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP), 0);
  assert.equal(playerhudPocketUpgradeBuildNodeResultEbpOff(), -0x1498);
  assert.equal(playerhudPocketUpgradeBuildNodeObjEbpOff(), -0x1490);
  assert.equal(playerhudPocketUpgradeListHeadEbpOff(), -0x1450);
  assert.equal(playerhudPocketUpgradeConfigLoadImageResultEbpOff(), -0x1448);
  assert.equal(playerhudPocketUpgradeConfigElem2EbpOff(), -0x1488);
  assert.equal(playerhudPocketUpgradeConfigValue2EbpOff(), -0x148c);
  assert.equal(playerhudPocketUpgradeConfigVirtual2EbpOff(), -0x1484);
  assert.equal(playerhudPocketUpgradeConfigVirtual3EbpOff(), -0x1444);
  assert.equal(playerhudHostVaPocketUpgradeBuildNode(), 0x004288a0);
  assert.equal(playerhudHostVaPocketUpgradeNodeRemove(), 0x00415d20);
  assert.equal(playerhudHostVaFree(), 0x00aef15c);

  /* P7 gates (VA 0x00843667..0x00843a5c). */
  assert.equal(playerhudPocketSecondListGate(0x2b), true);
  assert.equal(playerhudPocketSecondListGate(0x2a), false);
  assert.equal(playerhudPocketSecondListGate(-1), false);
  assert.equal(playerhudPocketSecondListVecBeginByteOffset(), 0x1fa4);
  assert.equal(playerhudPocketSecondListVecEndByteOffset(), 0x1fa8);
  assert.equal(playerhudPocketSecondListCount(0x30, 0x40), 4);
  assert.equal(playerhudPocketSecondListCount(0x40, 0x30), -4);
  assert.equal(playerhudPocketSecondListCount(0, 0xffffffff), -1);
  assert.equal(playerhudPocketSecondListCount(0, 0x80000000), -0x20000000);
  assert.equal(playerhudPocketSecondListCount(0, 0), 0);
  /* Unsigned jae on the sar result. */
  assert.equal(playerhudPocketSecondListIterationNeeded(0, 0x30, 0x40), true);
  assert.equal(playerhudPocketSecondListIterationNeeded(4, 0x30, 0x40), false);
  assert.equal(playerhudPocketSecondListIterationNeeded(3, 0x30, 0x40), true);
  /* Negative count behaves as huge unsigned: index 0x40000000 < 0xfffffffc. */
  assert.equal(playerhudPocketSecondListIterationNeeded(0x40000000, 0x40, 0x30), true);
  /* index == count (unsigned) → jae skips. */
  assert.equal(playerhudPocketSecondListIterationNeeded(0xfffffffc, 0x40, 0x30), false);
  assert.equal(playerhudPocketSecondListEntryUsable(0), false);
  assert.equal(playerhudPocketSecondListEntryUsable(1), true);
});

test("v13 P6/P7 pure Wasm ≡ JS — fixed plans + high-bit randomized differential", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  assert.equal(exp.pocketUpgradeSlotCount(), 16);
  assert.equal(exp.hostVaPocketUpgradeBuildNode() >>> 0, 0x004288a0);
  assert.equal(exp.hostVaPocketUpgradeNodeRemove() >>> 0, 0x00415d20);
  assert.equal(exp.hostVaFree() >>> 0, 0x00aef15c);

  const scratch = 0x10000;
  if (exp.memory.buffer.byteLength < scratch + 0x10000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  const planBase = scratch + 0x9000;

  /* Deterministic LCG; corpus indices drawn from the HIGH bits. */
  let rng = (0x843116 ^ 0x1e00) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;
  const i32v = () => next() | 0;
  const u32v = () => next() >>> 0;

  const planFieldOffsets = [
    ["branchKind", 0],
    ["resolveTableKind", 4],
    ["resolveLookupIndex", 8],
    ["insertValue", 12],
    ["slotByteOff", 16],
    ["arrayElementDwordIndex", 20],
    ["buildNodeResultEbpOff", 24],
    ["buildNodeObjEbpOff", 28],
    ["listHeadEbpOff", 32],
    ["valueEbpOff", 36],
    ["elemEbpOff", 40],
    ["virtualEbpOff", 44],
    ["globalArgEbpOff", 48],
    ["sehFirst", 52],
    ["sehCount", 56],
    ["callbackCount", 60],
    ["resultCopyOff", 64],
    ["configIsSso", 68],
    ["configPathPtr", 72],
    ["configLoadImageResultEbpOff", 76],
    ["configElem2EbpOff", 80],
    ["configValue2EbpOff", 84],
    ["configVirtual2EbpOff", 88],
    ["configVirtual3EbpOff", 92],
    ["hostVaBuildNode", 96],
    ["hostVaNodeRemove", 100],
    ["hostVaMaterialize", 104],
    ["hostVaElemInit", 108],
    ["hostVaPushGrow", 112],
    ["hostVaLoadImage", 116],
    ["hostVaFree", 120],
  ];
  const uintFields = new Set([
    "configPathPtr",
    "hostVaBuildNode",
    "hostVaNodeRemove",
    "hostVaMaterialize",
    "hostVaElemInit",
    "hostVaPushGrow",
    "hostVaLoadImage",
    "hostVaFree",
  ]);

  const N = 4000;
  for (let iter = 0; iter < N; iter += 1) {
    const slotIndex = hi(0x10);
    const gamePresent = hi(2);
    const id = i32v();
    const gameNegSize = hi(0x80) - 4; /* -4..0x7b */
    const managerSize = hi(0x80) - 4;
    const entryPtr = hi(2) === 0 ? 0 : 0x1000;
    const entryType = hi(5); /* 0..4, includes block type 3 */
    const resultPtr = 0x1000;
    const listHead = hi(2) === 0 ? resultPtr : 0x2000;
    /* Byte-gate wide drives: the PE tests a byte; the Wasm side must NOT
       pre-mask (v12 rule), so the module either narrows correctly or the
       corpus exposes it. */
    const byteDraw = [0, 0, 0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff][hi(8)];
    const resultByteD = byteDraw;
    const resultWord4 = i32v();
    const configCapacity = [0, 0xf, 0x10, 0x11, 0xffffffff][hi(5)];
    const configHeapPtr = 0x3000;
    const configReinsertId = i32v();

    const input = {
      slotIndex,
      gamePresent,
      id,
      gameNegTableSize: gameNegSize,
      managerTableSize: managerSize,
      entryPtr,
      entryType,
      resultPtr,
      resultByteD,
      resultWord4,
      listHead,
      configCapacity,
      configHeapPtr,
      configReinsertId,
    };
    const js = playerhudPocketUpgradePlan(input);

    /* Scalar helper differential. */
    assert.equal(
      exp.pocketUpgradeResolveKind(gamePresent, id, gameNegSize, managerSize),
      playerhudPocketUpgradeResolveKind(gamePresent, id, gameNegSize, managerSize),
      `resolveKind ${JSON.stringify(input)}`,
    );
    assert.equal(
      exp.pocketUpgradeResolveIndex(gamePresent, id, gameNegSize, managerSize),
      playerhudPocketUpgradeResolveIndex(gamePresent, id, gameNegSize, managerSize),
      `resolveIndex ${JSON.stringify(input)}`,
    );
    assert.equal(
      exp.pocketUpgradeEntryUsable(entryPtr >>> 0, entryType),
      playerhudPocketUpgradeEntryUsable(entryPtr, entryType) ? 1 : 0,
      `entryUsable ${JSON.stringify(input)}`,
    );
    assert.equal(
      exp.pocketUpgradeTakeResultValue(
        resultByteD >>> 0,
        resultWord4,
        id,
        resultPtr >>> 0,
        listHead >>> 0,
      ),
      playerhudPocketUpgradeTakeResultValue(
        resultByteD,
        resultWord4,
        id,
        resultPtr,
        listHead,
      )
        ? 1
        : 0,
      `takeResult ${JSON.stringify(input)}`,
    );
    const jsBranch = playerhudPocketUpgradeBranchKind(
      playerhudPocketUpgradeTakeResultValue(
        resultByteD,
        resultWord4,
        id,
        resultPtr,
        listHead,
      ),
      id,
    );
    assert.equal(
      exp.pocketUpgradeBranchKind(
        playerhudPocketUpgradeTakeResultValue(
          resultByteD,
          resultWord4,
          id,
          resultPtr,
          listHead,
        )
          ? 1
          : 0,
        id,
      ),
      jsBranch,
      `branchKind ${JSON.stringify(input)}`,
    );
    assert.equal(
      exp.pocketUpgradeInsertValue(
        js.branchKind,
        id,
        resultWord4,
        configReinsertId,
      ),
      js.insertValue,
      `insertValue ${JSON.stringify(input)}`,
    );
    /* configPathPtr helper is pure (SSO flag is the host's job); the plan
       only reports it for CONFIG. */
    assert.equal(
      exp.pocketUpgradeConfigPathPtr(entryPtr >>> 0, 1, configHeapPtr >>> 0) >>> 0,
      (entryPtr + PLAYERHUD_P6_CONFIG_STRING_OFF) >>> 0,
    );
    assert.equal(
      exp.pocketUpgradeConfigPathPtr(entryPtr >>> 0, 0, configHeapPtr >>> 0) >>> 0,
      configHeapPtr >>> 0,
    );

    /* Packed plan differential — every field, every iteration. */
    exp.pocketUpgradePlan(
      planBase,
      slotIndex,
      gamePresent,
      id,
      gameNegSize,
      managerSize,
      entryPtr >>> 0,
      entryType,
      resultPtr >>> 0,
      resultByteD >>> 0,
      resultWord4,
      listHead >>> 0,
      configCapacity,
      configHeapPtr >>> 0,
      configReinsertId,
    );
    for (const [field, off] of planFieldOffsets) {
      const actual = uintFields.has(field)
        ? readU32(view, planBase + off)
        : readI32(view, planBase + off);
      const expected = uintFields.has(field) ? js[field] >>> 0 : js[field];
      assert.equal(
        actual,
        expected,
        `plan.${field} iter=${iter} input=${JSON.stringify(input)}`,
      );
    }
  }

  /* Deterministic fixed plan sanity: RESULT branch fills its frame. */
  {
    const fixed = {
      slotIndex: 3,
      gamePresent: 0,
      id: 5,
      gameNegTableSize: 0,
      managerTableSize: 100,
      entryPtr: 0x1000,
      entryType: 2,
      resultPtr: 0x1000,
      resultByteD: 0,
      resultWord4: 4,
      listHead: 0x2000,
      configCapacity: 0xf,
      configHeapPtr: 0x3000,
      configReinsertId: 9,
    };
    const js = playerhudPocketUpgradePlan(fixed);
    assert.equal(js.branchKind, PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT);
    assert.equal(js.resolveTableKind, PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER);
    assert.equal(js.resolveLookupIndex, 5);
    assert.equal(js.insertValue, 4);
    assert.equal(js.slotByteOff, 0x1e00 + 12);
    assert.equal(js.arrayElementDwordIndex, 23);
    assert.equal(js.valueEbpOff, -0x145c);
    assert.equal(js.elemEbpOff, -0x1458);
    assert.equal(js.virtualEbpOff, -0x1454);
    assert.equal(js.sehFirst, 0x11);
    assert.equal(js.sehCount, 3);
    assert.equal(js.callbackCount, 2);
    assert.equal(js.resultCopyOff, 0x14);
    assert.equal(js.configIsSso, 0);
    assert.equal(js.configPathPtr, 0);
  }
  /* NEG branch. */
  {
    const js = playerhudPocketUpgradePlan({
      slotIndex: 0,
      gamePresent: 1,
      id: -1,
      gameNegTableSize: 4,
      managerTableSize: 100,
      entryPtr: 0x1000,
      entryType: 0,
      resultPtr: 0x1000,
      resultByteD: 0x100,
      resultWord4: 0,
      listHead: 0x2000,
      configCapacity: 0x10,
      configHeapPtr: 0x3000,
      configReinsertId: 9,
    });
    assert.equal(js.branchKind, PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG);
    assert.equal(js.resolveTableKind, PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG);
    assert.equal(js.resolveLookupIndex, 0);
    assert.equal(js.insertValue, -1);
    assert.equal(js.valueEbpOff, -0x1468);
    assert.equal(js.elemEbpOff, -0x1464);
    assert.equal(js.virtualEbpOff, -0x1460);
    assert.equal(js.sehFirst, 0x14);
    assert.equal(js.sehCount, 2);
    assert.equal(js.callbackCount, 1);
    assert.equal(js.resultCopyOff, 0);
  }
  /* CONFIG branch. */
  {
    const js = playerhudPocketUpgradePlan({
      slotIndex: 2,
      gamePresent: 0,
      id: 5,
      gameNegTableSize: 0,
      managerTableSize: 100,
      entryPtr: 0x1000,
      entryType: 0,
      resultPtr: 0x1000,
      resultByteD: 1,
      resultWord4: 4,
      listHead: 0x2000,
      configCapacity: 0xf,
      configHeapPtr: 0x3000,
      configReinsertId: 9,
    });
    assert.equal(js.branchKind, PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG);
    assert.equal(js.insertValue, 9);
    assert.equal(js.valueEbpOff, -0x1474);
    assert.equal(js.elemEbpOff, -0x1470);
    assert.equal(js.virtualEbpOff, -0x146c);
    assert.equal(js.sehFirst, 0x16);
    assert.equal(js.sehCount, 6);
    assert.equal(js.callbackCount, 3);
    assert.equal(js.configIsSso, 1);
    assert.equal(js.configPathPtr >>> 0, 0x1038);
    assert.equal(js.configLoadImageResultEbpOff, -0x1448);
    assert.equal(js.configElem2EbpOff, -0x1488);
    assert.equal(js.configValue2EbpOff, -0x148c);
    assert.equal(js.configVirtual2EbpOff, -0x1484);
    assert.equal(js.configVirtual3EbpOff, -0x1444);
  }
  /* CONFIG heap: capacity >= 0x10 → heap ptr. */
  {
    const js = playerhudPocketUpgradePlan({
      slotIndex: 2,
      gamePresent: 0,
      id: 5,
      gameNegTableSize: 0,
      managerTableSize: 100,
      entryPtr: 0x1000,
      entryType: 0,
      resultPtr: 0x1000,
      resultByteD: 1,
      resultWord4: 4,
      listHead: 0x2000,
      configCapacity: 0x10,
      configHeapPtr: 0x3000,
      configReinsertId: 9,
    });
    assert.equal(js.configIsSso, 0);
    assert.equal(js.configPathPtr >>> 0, 0x3000);
  }
  /* Resolve-skip and entry-gate-skip → SKIP branch, frame zeroed. */
  for (const skipInput of [
    { ...{}, gamePresent: 0, id: 99, managerTableSize: 50, entryPtr: 0x1000, entryType: 0 },
    { ...{}, gamePresent: 0, id: 5, managerTableSize: 100, entryPtr: 0, entryType: 0 },
    { ...{}, gamePresent: 0, id: 5, managerTableSize: 100, entryPtr: 0x1000, entryType: 3 },
  ]) {
    const input = {
      slotIndex: 0,
      gamePresent: skipInput.gamePresent,
      id: skipInput.id,
      gameNegTableSize: 0,
      managerTableSize: skipInput.managerTableSize,
      entryPtr: skipInput.entryPtr,
      entryType: skipInput.entryType,
      resultPtr: 0x1000,
      resultByteD: 0,
      resultWord4: 0,
      listHead: 0x2000,
      configCapacity: 0xf,
      configHeapPtr: 0x3000,
      configReinsertId: 9,
    };
    const js = playerhudPocketUpgradePlan(input);
    assert.equal(js.branchKind, PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP);
    assert.equal(js.insertValue, 0);
    assert.equal(js.valueEbpOff, 0);
    assert.equal(js.sehFirst, 0);
    assert.equal(js.callbackCount, 0);
    assert.equal(js.resultCopyOff, 0);
    assert.equal(js.configIsSso, 0);
    assert.equal(js.configPathPtr, 0);
  }

  /* P7 Wasm ≡ JS: gate / count / per-iteration bound. */
  assert.equal(exp.pocketSecondListGate(0x2b), 1);
  assert.equal(exp.pocketSecondListGate(0x2a), 0);
  for (let iter = 0; iter < 2000; iter += 1) {
    const begin = u32v();
    const end = u32v();
    const index = u32v();
    assert.equal(
      exp.pocketSecondListCount(begin, end),
      playerhudPocketSecondListCount(begin, end),
      `count begin=${begin} end=${end}`,
    );
    assert.equal(
      exp.pocketSecondListIterationNeeded(index, begin, end),
      playerhudPocketSecondListIterationNeeded(index, begin, end) ? 1 : 0,
      `iteration index=${index} begin=${begin} end=${end}`,
    );
  }
  assert.equal(exp.pocketSecondListEntryUsable(0), 0);
  assert.equal(exp.pocketSecondListEntryUsable(1), 1);
  assert.equal(exp.pocketSecondListVecBeginByteOffset(), 0x1fa4);
  assert.equal(exp.pocketSecondListVecEndByteOffset(), 0x1fa8);

  /* Geometry Wasm ≡ JS. */
  for (let i = -2; i < 18; i += 1) {
    assert.equal(
      exp.pocketUpgradeSlotByteOffset(i),
      playerhudPocketUpgradeSlotByteOffset(i),
      `slotByteOffset ${i}`,
    );
    assert.equal(
      exp.pocketUpgradeArrayElementDwordIndex(i),
      playerhudPocketUpgradeArrayElementDwordIndex(i),
      `elementDwordIndex ${i}`,
    );
    assert.equal(
      exp.pocketUpgradeArrayIdByteOffset(i),
      playerhudPocketUpgradeArrayIdByteOffset(i),
      `arrayIdByteOffset ${i}`,
    );
    assert.equal(
      exp.pocketUpgradeSlotIsUpgrade(i),
      playerhudPocketUpgradeSlotIsUpgrade(i) ? 1 : 0,
      `slotIsUpgrade ${i}`,
    );
  }
  assert.equal(exp.pocketUpgradeArrayPtrByteOffset(), 0x1dec);

  /* v13 exports must exist and the module must stay zero-import (checked
     in loadExports). EBP/SEH constant exports. */
  assert.equal(exp.pocketUpgradeResultCopyByteOffset(), 0x14);
  assert.equal(exp.pocketUpgradeBuildNodeResultEbpOff(), -0x1498);
  assert.equal(exp.pocketUpgradeBuildNodeObjEbpOff(), -0x1490);
  assert.equal(exp.pocketUpgradeListHeadEbpOff(), -0x1450);
  assert.equal(exp.pocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), -0x145c);
  assert.equal(exp.pocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG), -0x1468);
  assert.equal(exp.pocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), -0x1474);
  assert.equal(exp.pocketUpgradeValueEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP), 0);
  assert.equal(exp.pocketUpgradeGlobalArgEbpOff(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), -0x1470);
  assert.equal(exp.pocketUpgradeSehFirst(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), 0x16);
  assert.equal(exp.pocketUpgradeSehCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG), 6);
  assert.equal(exp.pocketUpgradeCallbackCount(PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT), 2);
  assert.equal(exp.pocketUpgradeConfigLoadImageResultEbpOff(), -0x1448);
  assert.equal(exp.pocketUpgradeConfigElem2EbpOff(), -0x1488);
  assert.equal(exp.pocketUpgradeConfigValue2EbpOff(), -0x148c);
  assert.equal(exp.pocketUpgradeConfigVirtual2EbpOff(), -0x1484);
  assert.equal(exp.pocketUpgradeConfigVirtual3EbpOff(), -0x1444);
  assert.equal(exp.pocketUpgradeConfigCapacityByteOffset(), 0x4c);
});

test("v13 mutation checks: byte masks, signed bounds, sar count, insert value", () => {
  /* Each mutant must make the shipped module DIVERGE from the JS oracle on
     a discriminating input; that is exactly what the differential above
     would catch. The source is restored and rebuilt before the next. */
  const withMutant = (mutOld, mutNew, check) => {
    /* Tracked source may use CRLF; node keeps it, so match against a
       CRLF-normalized copy and restore the raw bytes in the finally. */
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M1: take_result_value drops the low-byte mask → 0x100 must flip. */
  withMutant(
    "  if ((result_byte_d & 0xffu) != 0u) {\n    return 0;\n  }",
    "  if (result_byte_d != 0u) {\n    return 0;\n  }",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_upgrade_take_result_value(0x100, 0, 5, 0x1000, 0x2000),
        0,
        "M1 must diverge: byte 0x100 sees AL==0 (take), full-word sees !=0 (skip)",
      );
    },
  );

  /* M2: global_callback_needed drops the low-byte mask. */
  withMutant(
    "  /* PE 0x0084325d: test al,al — low byte only (v12 rule); then\n     mov eax,[0xc7163c] ; test eax,eax ; je skip. */\n  if ((virtual_al & 0xffu) == 0u) {\n    return 0;\n  }",
    "  /* PE 0x0084325d: test al,al — low byte only (v12 rule); then\n     mov eax,[0xc7163c] ; test eax,eax ; je skip. */\n  if (virtual_al == 0u) {\n    return 0;\n  }",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_upgrade_global_callback_needed(0x100, 0x1234),
        1,
        "M2 must diverge: PE tests AL only",
      );
    },
  );

  /* M3: manager bound gone unsigned. Machine 0x008432f0: cmp esi,eax ;
     jge skip — SIGNED, so a wrapped NEGATIVE size skips every id; the
     unsigned mutant would take id=5 < 0xffffffff as in-bounds. */
  withMutant(
    "    if (id < manager_table_size) {\n      return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER;\n    }",
    "    if (static_cast<uint32_t>(id) < static_cast<uint32_t>(manager_table_size)) {\n      return ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER;\n    }",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_upgrade_resolve_kind(0, 5, 0, -1),
        PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER,
        "M3 must diverge: PE signed jge sees 5 >= -1 -> SKIP; the unsigned mutant takes",
      );
    },
  );

  /* M4: second-list count logical shift instead of arithmetic. */
  withMutant(
    "  return static_cast<int32_t>(end_1fa8 - begin_1fa4) >> 2;",
    "  return static_cast<int32_t>(static_cast<uint32_t>(end_1fa8 - begin_1fa4) >> 2);",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_second_list_iteration_needed(
          0x40000000,
          0x10,
          0,
        ),
        0,
        "M4 must diverge: PE sar of -16 is -4 (unsigned 0xfffffffc) so iteration keeps going; logical shift gives 0x3ffffffc and stops",
      );
    },
  );

  /* M5: insert_value returns id on RESULT. */
  withMutant(
    "    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:\n      /* PE 0x0084353b..0x00843539: mov [ecx], eax with eax = [ebp-0x145c]\n         = result[4] (saved at 0x0084335b). */\n      return result_word_4;",
    "    case ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT:\n      return static_cast<uint32_t>(id) | (static_cast<uint32_t>(result_word_4) & 0u);",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_upgrade_insert_value(1, 7, 0x1234, 9),
        7,
        "M5 must diverge: PE RESULT stores result[4]=0x1234; the id-mutant returns 7",
      );
    },
  );

  /* M6: take gate word compare unsigned → id=5 vs word4=-1 flips. */
  withMutant(
    "  /* PE 0x00843344: cmp esi, ecx ; jl alt — SIGNED: id >= result[4]. */\n  if (id < result_word_4) {\n    return 0;\n  }",
    "  if (static_cast<uint32_t>(id) < static_cast<uint32_t>(result_word_4)) {\n    return 0;\n  }",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_upgrade_take_result_value(0, -1, 5, 0x1000, 0x2000),
        0,
        "M6 must diverge: PE signed jl: 5 < -1 is false → take; the unsigned mutant skips",
      );
    },
  );
});


/* ============================ ABI v14 ============================ */

test("v14 tail list clears + P5-walk + rebuild plan fixed edges (VA 0x00843603..0x00843bb7)", () => {
  /* P6/P7 list-clear gate: head[0] != head runs the SP-clear walk. */
  assert.equal(playerhudPocketListClearNeeded(0x1000, 0x1000), false);
  assert.equal(playerhudPocketListClearNeeded(0x1000, 0x2000), true);
  assert.equal(playerhudPocketListClearNeeded(0, 0x1000), true);
  assert.equal(playerhudPocketListClearNeeded(0xffffffff, 0), true);
  assert.equal(playerhudPocketListClearNeeded(0, 0), false);

  /* P6 plan (head at [ebp-0x1450], inline 0x415800 + free). */
  const p6 = playerhudPocketListClearPlan(
    PLAYERHUD_POCKET_LIST_CLEAR_KIND_P6,
    0x1000,
    0x2000,
  );
  assert.equal(p6.needsClear, true);
  assert.equal(p6.headEbpOff, PLAYERHUD_P6_LIST_HEAD_EBP_OFF);
  assert.equal(p6.headEbpOff, -0x1450);
  assert.equal(p6.cursorEbpOff, PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF);
  assert.equal(p6.nodeSpClearOff, PLAYERHUD_LIST_CLEAR_NODE_SP_OFF);
  assert.equal(p6.nodeSpClearOff, 0x14);
  assert.equal(p6.spClearArg, PLAYERHUD_LIST_CLEAR_SP_ARG);
  assert.equal(p6.spClearArg, 0);
  assert.equal(p6.sehLevel, PLAYERHUD_LIST_CLEAR_SEH_LEVEL);
  assert.equal(p6.sehLevel | 0, -1);
  assert.equal(p6.hostVaAdvance >>> 0, PLAYERHUD_TAIL_HOST_VA_ADVANCE);
  assert.equal(p6.hostVaAdvance >>> 0, 0x00414a80);
  assert.equal(p6.hostVaTeardown >>> 0, PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN);
  assert.equal(p6.hostVaTeardown >>> 0, 0x00415800);
  assert.equal(p6.teardownRunsFree, 1);
  assert.equal(p6.hostVaFree >>> 0, PLAYERHUD_P6_HOST_VA_FREE);
  assert.equal(p6.hostVaFree >>> 0, 0x00aef15c);
  assert.equal(p6.freeSize, PLAYERHUD_LIST_CLEAR_FREE_SIZE);
  assert.equal(p6.freeSize, 0x1c);

  /* P7 plan (head at [ebp-0x143c], teardown 0x83b830 frees internally). */
  const p7 = playerhudPocketListClearPlan(
    PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7,
    0x1000,
    0x1000,
  );
  assert.equal(p7.needsClear, false);
  assert.equal(p7.headEbpOff, PLAYERHUD_P7_LIST_HEAD_EBP_OFF);
  assert.equal(p7.headEbpOff, -0x143c);
  assert.equal(p7.hostVaTeardown >>> 0, PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR);
  assert.equal(p7.hostVaTeardown >>> 0, 0x0083b830);
  assert.equal(p7.teardownRunsFree, 0);

  /* P5-walk clear gate + plan (VA 0x00843aab..0x00843adf). */
  assert.equal(playerhudP5WalkClearNeeded(0x1000, 0x1000), false);
  assert.equal(playerhudP5WalkClearNeeded(0x1000, 0x2000), true);
  const w = playerhudP5WalkClearPlan(0x1000, 0x1078); /* 0x78/0xc = 10 */
  assert.equal(w.needed, true);
  assert.equal(w.walkSteps, 10);
  assert.equal(w.cursorByteOff, PLAYERHUD_P5_OFF_LIST_HEAD_6A0);
  assert.equal(w.endByteOff, PLAYERHUD_P5_OFF_LIST_END_6A4);
  assert.equal(w.stride, PLAYERHUD_P5_WALK_STRIDE);
  assert.equal(w.nodeSpClearOff, PLAYERHUD_WALK_CLEAR_NODE_SP_OFF);
  assert.equal(w.nodeSpClearOff, 4);
  assert.equal(w.spClearArg, PLAYERHUD_LIST_CLEAR_SP_ARG);
  assert.equal(w.cursorSaveEbpOff, PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF);
  assert.equal(w.hudEbpOff, PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF);
  assert.equal(w.hostVaSpClear >>> 0, PLAYERHUD_HOST_VA_SMART_PTR_CLEAR);
  assert.equal(w.hostVaTeardown >>> 0, PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR);
  assert.equal(w.hostVaTeardown >>> 0, 0x0084bba0);
  /* Non-terminating span (not a whole number of 0xc strides) -> -1. */
  const wn = playerhudP5WalkClearPlan(0x1000, 0x1064);
  assert.equal(wn.walkSteps, -1);
  /* Wrapped / negative span -> -1 (non-terminating). */
  const wneg = playerhudP5WalkClearPlan(0x2000, 0x1000);
  assert.equal(wneg.walkSteps, -1);

  /* Enable-byte store (VA 0x00843aea) writes 0 at +0x6ac. */
  assert.equal(playerhudTailEnableStoreClearValue(), 0);
  assert.equal(PLAYERHUD_TAIL_ENABLE_BYTE_OFF, 0x6ac);

  /* Tail rebuild gate + probe path kind (VA 0x00843af1 / 0x00843b37). */
  assert.equal(PLAYERHUD_TAIL_REBUILD_BYTE_OFF, 0x6ad);
  assert.equal(playerhudTailRebuildGate(0), false);
  assert.equal(playerhudTailRebuildGate(1), true);
  assert.equal(playerhudTailRebuildGate(0x100), false);
  assert.equal(playerhudTailRebuildGate(0x1ff), true);
  assert.equal(playerhudTailRebuildGate(0xff00), false);
  assert.equal(playerhudTailRebuildGate(0xffffffff), true);
  assert.equal(playerhudTailRebuildPathKind(0), PLAYERHUD_TAIL_PATH_CONFIG);
  assert.equal(playerhudTailRebuildPathKind(0x40), PLAYERHUD_TAIL_PATH_FIXED);
  assert.equal(playerhudTailRebuildPathKind(0xc0), PLAYERHUD_TAIL_PATH_FIXED);
  assert.equal(playerhudTailRebuildPathKind(0x3f), PLAYERHUD_TAIL_PATH_CONFIG);
  assert.equal(
    playerhudTailRebuildPathKind(0xffffffff),
    PLAYERHUD_TAIL_PATH_FIXED,
  );
  assert.equal(
    playerhudTailRebuildPathKind(0x100),
    PLAYERHUD_TAIL_PATH_CONFIG,
  );
  assert.equal(PLAYERHUD_TAIL_PATH_FIXED, 0);
  assert.equal(PLAYERHUD_TAIL_PATH_CONFIG, 1);
  assert.equal(PLAYERHUD_TAIL_PROBE_MASK, 0x40);

  /* 0x40d0c0 std::string data ptr: SSO below 0x10, heap otherwise. */
  assert.equal(playerhudTailConfigStringData(0x2000, 0xf, 0x3000) >>> 0, 0x2038);
  assert.equal(playerhudTailConfigStringData(0x2000, 0x10, 0x3000) >>> 0, 0x3000);
  assert.equal(
    playerhudTailConfigStringData(0x2000, 0xffffffff, 0x3000) >>> 0,
    0x3000,
  );
  assert.equal(PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD, 0x10);
  assert.equal(PLAYERHUD_ITEMCFG_GFX_STRING_OFF, 0x38);

  /* Tail rebuild plan (VA 0x00843af1..0x00843ba6) - gate closed. */
  const closed = playerhudTailRebuildPlan(0, 0x1000, 0x40, 0xf, 0x3000);
  assert.equal(closed.runs, 0);
  assert.equal(closed.entryPresent, 1);
  assert.equal(closed.pathKind, 0);
  assert.equal(closed.fixedPathVa, 0);
  assert.equal(closed.resultEbpOff, 0);
  assert.equal(closed.swapSehTryLevel, 0);
  assert.equal(closed.tempTeardownSeh, 0);
  assert.equal(closed.clearsAfter, 0);
  assert.equal(closed.configPathSso, 0);
  assert.equal(closed.configPathPtr, 0);
  /* gate open but entry null -> SP clear ran, LoadImage skipped. */
  const noentry = playerhudTailRebuildPlan(1, 0, 0x40, 0xf, 0x3000);
  assert.equal(noentry.runs, 1);
  assert.equal(noentry.entryPresent, 0);
  assert.equal(noentry.pathKind, 0);
  assert.equal(noentry.resultEbpOff, 0);
  assert.equal(noentry.clearsAfter, 1);
  /* FIXED path. */
  const fixed = playerhudTailRebuildPlan(1, 0x1000, 0x40, 0xf, 0x3000);
  assert.equal(fixed.runs, 1);
  assert.equal(fixed.entryPresent, 1);
  assert.equal(fixed.pathKind, PLAYERHUD_TAIL_PATH_FIXED);
  assert.equal(fixed.fixedPathVa >>> 0, 0x00b63a18);
  assert.equal(fixed.resultEbpOff, PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF);
  assert.equal(fixed.resultEbpOff, -0x1448);
  assert.equal(fixed.swapSehTryLevel, PLAYERHUD_TAIL_SEH_FIXED);
  assert.equal(fixed.swapSehTryLevel, 0x26);
  assert.equal(fixed.teardownEcxEbpOff, -0x1448);
  assert.equal(fixed.tempTeardownSeh, PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH);
  assert.equal(fixed.tempTeardownSeh, 0xffffffff);
  assert.equal(fixed.anm2SpByteOff, 0x6b0);
  assert.equal(fixed.spClearArg, 0);
  assert.equal(fixed.clearsAfter, 1);
  assert.equal(fixed.configPathSso, 0);
  assert.equal(fixed.configPathPtr, 0);
  /* CONFIG SSO path. */
  const cfg = playerhudTailRebuildPlan(1, 0x1000, 0, 0xf, 0x3000);
  assert.equal(cfg.pathKind, PLAYERHUD_TAIL_PATH_CONFIG);
  assert.equal(cfg.fixedPathVa, 0);
  assert.equal(cfg.resultEbpOff, PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF);
  assert.equal(cfg.resultEbpOff, -0x142c);
  assert.equal(cfg.swapSehTryLevel, PLAYERHUD_TAIL_SEH_CONFIG);
  assert.equal(cfg.swapSehTryLevel, 0x27);
  assert.equal(cfg.configPathSso, 1);
  assert.equal(cfg.configPathPtr >>> 0, 0x1038);
  assert.equal(cfg.getCollectibleThisOff, 0x2a404);
  assert.equal(cfg.getCollectibleArgOff, 0x1f4c);
  assert.equal(cfg.probeMask, 0x40);
  assert.equal(cfg.hostVaGetCollectible >>> 0, 0x0072fd10);
  assert.equal(cfg.hostVaSpClear >>> 0, 0x0040c7f0);
  assert.equal(cfg.hostVaLoadImage >>> 0, 0x009588a0);
  assert.equal(cfg.hostVaSwap >>> 0, 0x0040c3b0);
  assert.equal(cfg.hostVaTempTeardown >>> 0, 0x0040c440);
  assert.equal(cfg.hostVaProbe >>> 0, 0x00748490);
  /* CONFIG heap path. */
  const cfgheap = playerhudTailRebuildPlan(1, 0x1000, 0, 0x10, 0x3000);
  assert.equal(cfgheap.configPathSso, 0);
  assert.equal(cfgheap.configPathPtr >>> 0, 0x3000);

  /* 0x956110 call-site args (VA 0x00843ba6..0x00843bb7). */
  const args = playerhudTailPredicateCallArgs();
  assert.equal(args.typeArg, 0xb);
  assert.equal(args.arg1PlayerOff, 0x1618);
  assert.equal(args.arg2IsPlayer, 1);
  assert.equal(args.arg3IsLeftoverEcx, 1);
  assert.equal(args.hostVaPredicate >>> 0, 0x00956110);
});

test("v14 pure Wasm ≡ JS - list clears / walk / rebuild plans + high-bit randomized differential (VA 0x00843603..0x00843bb7)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  assert.equal(exp.tailRebuildGate(0x100), 0);
  assert.equal(exp.tailRebuildGate(0x1ff), 1);
  assert.equal(exp.tailRebuildPathKind(0x40), PLAYERHUD_TAIL_PATH_FIXED);
  assert.equal(exp.tailRebuildPathKind(0), PLAYERHUD_TAIL_PATH_CONFIG);
  assert.equal(
    exp.pocketListClearNeeded(0x1000, 0x2000),
    playerhudPocketListClearNeeded(0x2000, 0x1000) ? 1 : 0,
  );
  assert.equal(exp.p5WalkClearNeeded(0x1000, 0x2000), 1);

  const scratch = 0x10000;
  const planBase = scratch + 0x4000;
  if (exp.memory.buffer.byteLength < planBase + 0x1000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);

  let rng = (0x843603 ^ 0x6ac) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;
  const u32v = () => next() >>> 0;

  const pocketBase = planBase;
  const walkBase = planBase + 0x60;
  const tailBase = planBase + 0xc0;
  const predBase = planBase + 0x180;
  const hudBase = planBase + 0x1a0;

  const pocketFields = [
    ["needsClear", 0, false],
    ["headEbpOff", 4, true],
    ["cursorEbpOff", 8, true],
    ["nodeSpClearOff", 12, true],
    ["spClearArg", 16, true],
    ["sehLevel", 20, true],
    ["hostVaAdvance", 24, true],
    ["hostVaTeardown", 28, true],
    ["teardownRunsFree", 32, false],
    ["hostVaFree", 36, true],
    ["freeSize", 40, false],
  ];
  const walkFields = [
    ["needed", 0, false],
    ["walkSteps", 4, false],
    ["cursorByteOff", 8, false],
    ["endByteOff", 12, false],
    ["stride", 16, false],
    ["nodeSpClearOff", 20, false],
    ["spClearArg", 24, false],
    ["cursorSaveEbpOff", 28, false],
    ["hudEbpOff", 32, false],
    ["hostVaSpClear", 36, true],
    ["hostVaTeardown", 40, true],
  ];
  const tailFields = [
    ["runs", 0, false],
    ["entryPresent", 4, false],
    ["pathKind", 8, false],
    ["fixedPathVa", 12, true],
    ["resultEbpOff", 16, false],
    ["swapSehTryLevel", 20, false],
    ["teardownEcxEbpOff", 24, false],
    ["tempTeardownSeh", 28, false],
    ["anm2SpByteOff", 32, false],
    ["spClearArg", 36, false],
    ["clearsAfter", 40, false],
    ["configPathSso", 44, false],
    ["configPathPtr", 48, true],
    ["getCollectibleThisOff", 52, false],
    ["getCollectibleArgOff", 56, false],
    ["probeMask", 60, false],
    ["hostVaGetCollectible", 64, true],
    ["hostVaSpClear", 68, true],
    ["hostVaLoadImage", 72, true],
    ["hostVaSwap", 76, true],
    ["hostVaTempTeardown", 80, true],
    ["hostVaProbe", 84, true],
  ];

  const wideBytes = [0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff];
  const N = 3000;
  for (let iter = 0; iter < N; iter += 1) {
    const kind = hi(2);
    const headPtr = (0x1000 + hi(0x40) * 0x100) >>> 0;
    const headWord0 = u32v();
    const jsP = playerhudPocketListClearPlan(kind, headWord0, headPtr);
    assert.equal(
      exp.pocketListClearNeeded(headPtr >>> 0, headWord0 >>> 0),
      playerhudPocketListClearNeeded(headWord0, headPtr) ? 1 : 0,
      `listClearNeeded iter=${iter}`,
    );
    exp.pocketListClearPlan(pocketBase, kind, headPtr >>> 0, headWord0 >>> 0);
    for (const [field, off, isU32] of pocketFields) {
      const actual = isU32
        ? readU32(view, pocketBase + off)
        : readI32(view, pocketBase + off);
      let expected = jsP[field];
      if (typeof expected === "boolean") expected = expected ? 1 : 0;
      expected = isU32 ? expected >>> 0 : (expected | 0);
      assert.equal(actual, expected, `pocketPlan.${field} iter=${iter}`);
    }

    const cursor = u32v();
    let end;
    /* half the corpus: terminating whole-stride span; half: arbitrary. */
    if (hi(2) === 0) {
      end = (cursor + hi(0x40) * PLAYERHUD_P5_WALK_STRIDE) >>> 0;
    } else {
      end = u32v();
    }
    const jsW = playerhudP5WalkClearPlan(cursor, end);
    exp.p5WalkClearPlan(walkBase, cursor >>> 0, end >>> 0);
    assert.equal(
      exp.p5WalkClearNeeded(cursor >>> 0, end >>> 0),
      playerhudP5WalkClearNeeded(cursor, end) ? 1 : 0,
      `walkClearNeeded iter=${iter}`,
    );
    for (const [field, off, isU32] of walkFields) {
      const actual = isU32
        ? readU32(view, walkBase + off)
        : readI32(view, walkBase + off);
      let expected = jsW[field];
      if (typeof expected === "boolean") expected = expected ? 1 : 0;
      expected = isU32 ? expected >>> 0 : (expected | 0);
      assert.equal(actual, expected, `walkPlan.${field} iter=${iter}`);
    }

    const byte6ad = wideBytes[hi(wideBytes.length)];
    const entryPtr = hi(4) === 0 ? 0 : (0x1000 + hi(4) * 0x100) >>> 0;
    const probeAl = wideBytes[hi(wideBytes.length)];
    const configCapacity = [0, 0xf, 0x10, 0x11, 0xffffffff][hi(5)];
    const configHeapPtr = (0x3000 + hi(3) * 0x1000) >>> 0;
    const jsT = playerhudTailRebuildPlan(
      byte6ad,
      entryPtr,
      probeAl,
      configCapacity,
      configHeapPtr,
    );
    assert.equal(
      exp.tailRebuildGate(byte6ad >>> 0),
      playerhudTailRebuildGate(byte6ad) ? 1 : 0,
      `tailRebuildGate iter=${iter}`,
    );
    assert.equal(
      exp.tailRebuildPathKind(probeAl >>> 0),
      playerhudTailRebuildPathKind(probeAl),
      `tailRebuildPathKind iter=${iter}`,
    );
    assert.equal(
      exp.tailConfigStringData(
        entryPtr >>> 0,
        configCapacity >>> 0,
        configHeapPtr >>> 0,
      ) >>> 0,
      playerhudTailConfigStringData(
        entryPtr,
        configCapacity,
        configHeapPtr,
      ) >>> 0,
      `tailConfigStringData iter=${iter}`,
    );
    exp.tailRebuildPlan(
      tailBase,
      byte6ad >>> 0,
      entryPtr >>> 0,
      probeAl >>> 0,
      configCapacity >>> 0,
      configHeapPtr >>> 0,
    );
    for (const [field, off, isU32] of tailFields) {
      const actual = isU32 ? readU32(view, tailBase + off) : readI32(view, tailBase + off);
      let expected = jsT[field];
      if (typeof expected === "boolean") expected = expected ? 1 : 0;
      expected = isU32 ? expected >>> 0 : (expected | 0);
      assert.equal(actual, expected, `tailPlan.${field} iter=${iter}`);
    }
  }

  /* Predicate call args - constant plan. */
  const args = playerhudTailPredicateCallArgs();
  exp.tailPredicateArgs(predBase);
  assert.equal(readI32(view, predBase + 0), args.typeArg);
  assert.equal(readI32(view, predBase + 4), args.arg1PlayerOff);
  assert.equal(readI32(view, predBase + 8), args.arg2IsPlayer);
  assert.equal(readI32(view, predBase + 12), args.arg3IsLeftoverEcx);
  assert.equal(readU32(view, predBase + 16), args.hostVaPredicate >>> 0);
  /* Enable store writes 0 to hud+0x6ac. */
  exp.tailEnableClear(hudBase);
  assert.equal(readU8(view, hudBase + PLAYERHUD_TAIL_ENABLE_BYTE_OFF), 0);
  /* Terminating fixed walk plan sanity. */
  const fw = playerhudP5WalkClearPlan(0x1000, 0x1078);
  assert.equal(fw.walkSteps, 10);
  assert.equal(fw.needed, true);
});

test("v14 mutation checks: list-clear and walk gates, rebuild byte/path kind, SSO threshold, plan guard", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M1: list-clear gate inverted (!= -> ==). */
  withMutant(
    "  return head_word0 != head_ptr ? 1 : 0;",
    "  return head_word0 == head_ptr ? 1 : 0;",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_pocket_list_clear_needed(0x1000, 0x2000),
        0,
        "M1 must diverge: PE cmp/je skips only when head[0]==head",
      );
    },
  );

  /* M2: P5-walk clear gate inverted. */
  withMutant(
    "  return cursor_6a0 != end_6a4 ? 1 : 0;",
    "  return cursor_6a0 == end_6a4 ? 1 : 0;",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_p5_walk_clear_needed(0x1000, 0x2000),
        0,
        "M2 must diverge: cursor==end skips past the teardown",
      );
    },
  );

  /* M3: tail_rebuild_gate drops the low-byte mask. */
  withMutant(
    "  return (byte_6ad & 0xffu) != 0u ? 1 : 0;",
    "  return byte_6ad != 0u ? 1 : 0;",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_tail_rebuild_gate(0x100),
        1,
        "M3 must diverge: PE cmp byte [esi+0x6ad] sees AL==0 for 0x100",
      );
    },
  );

  /* M4: tail_rebuild_path_kind inverted (je semantics). */
  withMutant(
    "  return (probe_al & ISAAC_PLAYERHUD_TAIL_PROBE_MASK) != 0u\n             ? ISAAC_PLAYERHUD_TAIL_PATH_FIXED\n             : ISAAC_PLAYERHUD_TAIL_PATH_CONFIG;",
    "  return (probe_al & ISAAC_PLAYERHUD_TAIL_PROBE_MASK) == 0u\n             ? ISAAC_PLAYERHUD_TAIL_PATH_FIXED\n             : ISAAC_PLAYERHUD_TAIL_PATH_CONFIG;",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_tail_rebuild_path_kind(0x40),
        PLAYERHUD_TAIL_PATH_CONFIG,
        "M4 must diverge: test al,0x40 ; je config -> bit set is FIXED",
      );
    },
  );

  /* M5: 0x40d0c0 threshold strictness (capacity == 0x10 is heap). */
  withMutant(
    "  if (capacity < ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD) {",
    "  if (capacity <= ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD) {",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_tail_config_string_data(0x2000, 0x10, 0x3000),
        0x2038,
        "M5 must diverge: cmp [0x14],0x10 ; jb -> capacity==0x10 is heap",
      );
    },
  );

  /* M6: tail_rebuild_plan computes configPathPtr outside CONFIG. */
  withMutant(
    "  out->config_path_ptr =\n      is_config != 0\n          ? isaac_playerhud_tail_config_string_data(entry_ptr,\n                                                    config_capacity,\n                                                    config_heap_ptr)\n          : 0u;",
    "  out->config_path_ptr =\n      isaac_playerhud_tail_config_string_data(entry_ptr,\n                                              config_capacity,\n                                              config_heap_ptr);",
    (wasm) => {
      /* FIXED path (probe 0x40): JS reports configPathPtr==0; the mutant
         leaks entry+0x38 into the plan. Read the plan from wasm memory. */
      if (wasm.memory.buffer.byteLength < 0x20000) {
        wasm.memory.grow(1);
      }
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_tail_rebuild_plan(base, 1, 0x1000, 0x40, 0xf, 0x3000);
      assert.equal(
        v.getUint32(base + 48, true),
        0x1038,
        "M6 must diverge: FIXED path must report configPathPtr 0",
      );
    },
  );
});


/* ============================ ABI v15 ============================ */

function f32bitsOf(x) {
  const u = new Uint32Array(1);
  new Float32Array(u.buffer)[0] = Math.fround(x);
  return u[0];
}

test("v15 tail float exact SSE + char countdown + dirty notify fixed edges (VA 0x00843bb7..0x00843c1f)", () => {
  /* P3 tail float (VA 0x00843bb7..0x00843be5). Finite values clamp. */
  assert.equal(playerHudTailFloatStep(0.5, true), 0.75);
  assert.equal(playerHudTailFloatStep(0.9, true), 1);
  assert.equal(playerHudTailFloatStep(1, true), 1);
  assert.equal(playerHudTailFloatStep(1.5, true), 1);
  assert.equal(playerHudTailFloatStep(0.5, false), 0.25);
  assert.equal(playerHudTailFloatStep(0.1, false), 0);
  assert.equal(playerHudTailFloatStep(-0.5, false), 0);
  assert.equal(playerHudTailFloatStep(0.25, false), 0);
  /* RE-transcribed minss/maxss: NaN clamps to the SECOND operand.
     The v1 compare-based body kept NaN - now pinned by mutation. */
  assert.equal(f32bitsOf(playerHudTailFloatStep(NaN, true)), 0x3f800000);
  assert.equal(f32bitsOf(playerHudTailFloatStep(NaN, false)), 0x00000000);
  /* +Inf / -Inf: min with 1.0 clamps +Inf; -Inf passes the max at least. */
  assert.equal(f32bitsOf(playerHudTailFloatStep(Infinity, true)), 0x3f800000);
  assert.equal(f32bitsOf(playerHudTailFloatStep(Infinity, false)), 0x7f800000);
  assert.equal(f32bitsOf(playerHudTailFloatStep(-Infinity, true)), 0xff800000);
  assert.equal(f32bitsOf(playerHudTailFloatStep(-Infinity, false)), 0x00000000);
  /* -0.0 input: -0.25 step result clamps to +0.0 on the max path; the
     add path lands on exactly +0.25. */
  assert.equal(f32bitsOf(playerHudTailFloatStep(-0, true)), 0x3e800000);
  assert.equal(f32bitsOf(playerHudTailFloatStep(-0, false)), 0x00000000);
  /* Subnormal input rounds through the f32 add. */
  assert.equal(f32bitsOf(playerHudTailFloatStep(1e-45, true)), 0x3e800000);
  /* f32 rounding: 0.99999994 + 0.25 = 1.2499999 -> clamp 1.0. */
  assert.equal(f32bitsOf(playerHudTailFloatStep(0.9999999403953552, true)), 0x3f800000);
  /* 0x3f7fffff (largest f32 below 1.0) + 0.25 = 1.25 -> clamp. */
  {
    const u = new Uint32Array([0x3f7fffff]);
    const below = new Float32Array(u.buffer)[0];
    assert.equal(f32bitsOf(playerHudTailFloatStep(below, true)), 0x3f800000);
  }

  /* P4 tail char countdown (VA 0x00843be5..0x00843c11): signed >0 dec. */
  assert.deepEqual(playerHudTailCharCountdown({ c0: 3, c1: 0, c2: -1 }), { c0: 2, c1: 0, c2: -1 });
  assert.deepEqual(playerHudTailCharCountdown({ c0: 127, c1: -128, c2: 1 }), { c0: 126, c1: -128, c2: 0 });
  assert.deepEqual(playerHudTailCharCountdown({ c0: 0, c1: 0, c2: 0 }), { c0: 0, c1: 0, c2: 0 });
  assert.deepEqual(playerHudTailCharCountdown({ c0: 0x100, c1: 0x1ff, c2: 0xff }), { c0: 0, c1: -1, c2: -1 });

  /* Dirty-notify tail (VA 0x00843c11..0x00843c1f). */
  assert.equal(playerhudTailDirtyNotifyNeeded(0), false);
  assert.equal(playerhudTailDirtyNotifyNeeded(1), true);
  assert.equal(playerhudTailDirtyNotifyNeeded(0x100), false);
  assert.equal(playerhudTailDirtyNotifyNeeded(0x1ff), true);
  assert.equal(playerhudTailDirtyNotifyNeeded(0xff00), false);
  assert.equal(playerhudTailDirtyNotifyNeeded(0xffffffff), true);
  assert.equal(PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF, 0x4);
  assert.equal(PLAYERHUD_TAIL_DIRTY_ARG, 1);
  assert.equal(PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY, 0x009a6110);
  const d = playerhudTailDirtyNotifyCallArgs();
  assert.equal(d.dirtyFlagEbpOff, PLAYERHUD_DIRTY_FLAG_EBP_OFF);
  assert.equal(d.dirtyFlagEbpOff, -0x1419);
  assert.equal(d.hudThisDwordOff, PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF);
  assert.equal(d.hudThisDwordOff, 0x4);
  assert.equal(d.notifyArg, PLAYERHUD_TAIL_DIRTY_ARG);
  assert.equal(d.hostVaNotify >>> 0, PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY);
  assert.equal(d.hostVaNotify >>> 0, 0x009a6110);
});

test("v15 Wasm ≡ JS — tail float bits, char bytes, dirty gate/plan (high-bit randomized)", () => {
  const exp = loadExports();
  const scratch = 0x10000;
  if (exp.memory.buffer.byteLength < scratch + 0x2000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  const floatBase = scratch;
  const charBase = scratch + 0x10;
  const hudBase = scratch + 0x20;
  const dirtyPlanBase = scratch + 0x100;

  let rng = (0x843bb7 ^ 0x6b8) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;
  const u32v = () => next() >>> 0;

  const floatBitsPool = [
    0x00000000, 0x3f800000, 0x3e800000, 0xbf000000, /* 0, 1, 0.25, -0.5 */
    0x80000000, /* -0.0 */
    0x7fc00000, /* qNaN */
    0x7f800000, 0xff800000, /* +-Inf */
    0x00000001, /* subnormal */
    0x3f7fffff, 0x3f000000, /* 0.99999994, 0.5 */
    0x3e7fffff, 0x4b000000, /* 0.25-ulp, 8388608 */
  ];
  const wideBytes = [0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff];
  for (let iter = 0; iter < 4000; iter += 1) {
    /* Tail float: input bits, pred, then bit-exact compare. */
    const bits = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const input = (() => {
      const u = new Uint32Array([bits]);
      return new Float32Array(u.buffer)[0];
    })();
    const pred = hi(2);
    view.setFloat32(floatBase, input, true);
    exp.tailFloat(floatBase, pred);
    const wasmBits = readU32(view, floatBase);
    const jsBits = f32bitsOf(playerHudTailFloatStep(input, pred === 1));
    assert.equal(
      wasmBits,
      jsBits,
      `tailFloat iter=${iter} bits=0x${bits.toString(16)} pred=${pred}`,
    );

    /* Chars: three signed bytes. */
    const c0 = (u32v() & 0xff) << 24 >> 24;
    const c1 = (u32v() & 0xff) << 24 >> 24;
    const c2 = (u32v() & 0xff) << 24 >> 24;
    writeI8(view, charBase + 0, c0);
    writeI8(view, charBase + 1, c1);
    writeI8(view, charBase + 2, c2);
    exp.tailChar(charBase);
    const jsC = playerHudTailCharCountdown({ c0, c1, c2 });
    assert.equal(readI8(view, charBase + 0), jsC.c0, `c0 iter=${iter}`);
    assert.equal(readI8(view, charBase + 1), jsC.c1, `c1 iter=${iter}`);
    assert.equal(readI8(view, charBase + 2), jsC.c2, `c2 iter=${iter}`);
    /* _at variant uses the PlayerHUD byte offsets +0xc/+0xd/+0xe. */
    writeI8(view, hudBase + 0xc, c0);
    writeI8(view, hudBase + 0xd, c1);
    writeI8(view, hudBase + 0xe, c2);
    exp.tailCharAt(hudBase);
    assert.equal(readI8(view, hudBase + 0xc), jsC.c0, `c0at iter=${iter}`);
    assert.equal(readI8(view, hudBase + 0xd), jsC.c1, `c1at iter=${iter}`);
    assert.equal(readI8(view, hudBase + 0xe), jsC.c2, `c2at iter=${iter}`);

    /* Dirty gate with wide draws. */
    const dirtyByte = wideBytes[hi(wideBytes.length)];
    assert.equal(
      exp.tailDirtyNeeded(dirtyByte >>> 0),
      playerhudTailDirtyNotifyNeeded(dirtyByte) ? 1 : 0,
      `dirtyNeeded iter=${iter}`,
    );
  }

  /* Dirty-notify call args plan. */
  const d = playerhudTailDirtyNotifyCallArgs();
  exp.tailDirtyArgs(dirtyPlanBase);
  assert.equal(readI32(view, dirtyPlanBase + 0), d.dirtyFlagEbpOff);
  assert.equal(readI32(view, dirtyPlanBase + 4), d.hudThisDwordOff);
  assert.equal(readI32(view, dirtyPlanBase + 8), d.notifyArg);
  assert.equal(readU32(view, dirtyPlanBase + 12), d.hostVaNotify >>> 0);

  /* Fixed float spot checks against the PE path. */
  view.setFloat32(floatBase, 0.5, true);
  exp.tailFloat(floatBase, 1);
  assert.equal(readU32(view, floatBase), 0x3f400000); /* 0.5 + 0.25 = 0.75 */
  view.setFloat32(floatBase, NaN, true);
  exp.tailFloat(floatBase, 1);
  assert.equal(readU32(view, floatBase), 0x3f800000);
  view.setFloat32(floatBase, NaN, true);
  exp.tailFloat(floatBase, 0);
  assert.equal(readU32(view, floatBase), 0x00000000);
});

test("v15 mutation checks: tail float NaN clamps, dirty byte gate, dirty args, char sign", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  /* M7: min path drops the NaN clamp -> NaN input stays NaN. */
  withMutant(
    "    *value_6b8 = (f != f || f > one) ? one : f;",
    "    *value_6b8 = (f > one) ? one : f;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x12000) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      v.setFloat32(0x10000, NaN, true);
      wasm.isaac_playerhud_tail_float_step(0x10000, 1);
      assert.equal(
        v.getUint32(0x10000, true),
        0x7fc00000,
        "M7 must diverge: minss dest NaN returns the second operand 1.0",
      );
    },
  );

  /* M8: max path drops the NaN clamp. */
  withMutant(
    "    *value_6b8 = (f != f || f < zero) ? zero : f;",
    "    *value_6b8 = (f < zero) ? zero : f;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10000 + 4) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      v.setFloat32(0x10000, NaN, true);
      wasm.isaac_playerhud_tail_float_step(0x10000, 0);
      assert.equal(
        v.getUint32(0x10000, true),
        0x7fc00000,
        "M8 must diverge: maxss dest NaN -> 0.0",
      );
    },
  );

  /* M9: dirty gate drops the low-byte mask. */
  withMutant(
    "  return (dirty_byte & 0xffu) != 0u ? 1 : 0;",
    "  return dirty_byte != 0u ? 1 : 0;",
    (wasm) => {
      assert.equal(
        wasm.isaac_playerhud_tail_dirty_notify_needed(0x100),
        1,
        "M9 must diverge: cmp byte [ebp-0x1419],0 sees 0x100 as 0",
      );
    },
  );

  /* M10: dirty notify arg wrong. */
  withMutant(
    "  out->notify_arg = ISAAC_PLAYERHUD_TAIL_DIRTY_ARG;",
    "  out->notify_arg = 0x2e;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10400) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_tail_dirty_notify_call_args(base);
      assert.equal(
        v.getInt32(base + 8, true),
        0x2e,
        "M10 must diverge: PE pushes 1 before 0x009a6110",
      );
    },
  );

  /* M11: dirty notify VA wrong (trinket-path 0x009a8970 instead of tail). */
  withMutant(
    "  out->host_va_notify = ISAAC_PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY;",
    "  out->host_va_notify = 0x009a8970u;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10400) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_tail_dirty_notify_call_args(base);
      assert.equal(
        v.getUint32(base + 12, true),
        0x009a8970,
        "M11 must diverge: tail dirty notify is 0x009a6110, not the trinket one",
      );
    },
  );

  /* M12: char countdown decrements zero (>= instead of >). */
  withMutant(
    "  if (state->c0 > 0) {\n    state->c0 = static_cast<int8_t>(state->c0 - 1);\n  }",
    "  if (state->c0 >= 0) {\n    state->c0 = static_cast<int8_t>(state->c0 - 1);\n  }",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10008) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      v.setInt8(base + 0, 0);
      v.setInt8(base + 1, 1);
      v.setInt8(base + 2, -1);
      wasm.isaac_playerhud_tail_char_countdown(base);
      assert.equal(
        v.getInt8(base + 0),
        -1,
        "M12 must diverge: PE test al,al ; jle skip keeps 0",
      );
    },
  );
});

test("v17 mutation checks: call-site plan twins slots, slot counts, arg source", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* HM13 (twin first call slots): 0x10 -> wrong 0x70 on the PLAYER call. */
  withMutant(
    "    out->calls[0].heart_slots_off = ISAAC_PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF;\n    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS;",
    "    out->calls[0].heart_slots_off =\n        ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF;\n    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10200) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_update_hearts_call_plan(base, 0x1234, 0x10, 0);
      assert.equal(
        v.getInt32(base + 8, true),
        0x70,
        "HM13 must diverge: twin first call pushes hud+0x10, not +0x70",
      );
    },
  );

  /* HM14 (second call slots): 0x70 -> 0x10. */
  withMutant(
    "    out->calls[1].heart_slots_off =\n        ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF;",
    "    out->calls[1].heart_slots_off = ISAAC_PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10200) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_update_hearts_call_plan(base, 0x1234, 0x11, 0);
      assert.equal(
        v.getInt32(base + 20, true),
        0x10,
        "HM14 must diverge: twin second call pushes hud+0x70 (lea 6+0x6a)",
      );
    },
  );

  /* HM15 (single max slots): 0x18 -> 6. */
  withMutant(
    "    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS;",
    "    out->calls[0].max_slots = ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10200) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_update_hearts_call_plan(base, 0, 0x10, 0);
      assert.equal(
        v.getInt32(base + 12, true),
        6,
        "HM15 must diverge: single path pushes max_slots 0x18 (eax=0x18)",
      );
    },
  );

  /* HM16 (second-call arg source): ARG_TWIN -> ARG_PLAYER. */
  withMutant(
    "    out->calls[1].arg_source = ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_TWIN;",
    "    out->calls[1].arg_source = ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER;",
    (wasm) => {
      if (wasm.memory.buffer.byteLength < 0x10200) wasm.memory.grow(1);
      const v = new DataView(wasm.memory.buffer);
      const base = 0x10000;
      wasm.isaac_playerhud_update_hearts_call_plan(base, 0x1234, 0x10, 0);
      assert.equal(
        v.getInt32(base + 28, true),
        0,
        "HM16 must diverge: twin second call re-reads [player+0x1d98]",
      );
    },
  );
});

/* ============================ ABI v18 ============================ */

test("v18 StatHUD bar tween fixed edges (VA 0x0084d6b0..0x0084d73c)", () => {
  const bits = (x) => f32bitsOf(x);
  const qnan = 0x7fc00000;
  /* mode==0 reset: prev=current, delta=0, timer=0, current=target. */
  assert.deepEqual(
    playerHudStatBarTween(
      { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
        thresholdBits: bits(0.5), timer: 77 },
      bits(9), 0),
    { currentBits: bits(9), deltaBits: 0, prevBits: bits(5), timer: 0 },
  );
  /* Low byte only: 0x100 still resets; 0x1ff steps. */
  assert.equal(
    playerHudStatBarTween(
      { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
        thresholdBits: bits(0.5), timer: 77 },
      bits(9), 0x100).timer,
    0,
  );
  const stepped = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(5), timer: 10 },
    bits(9), 0x1ff);
  assert.equal(stepped.currentBits, bits(9));
  assert.equal(stepped.prevBits, bits(5));
  assert.equal(stepped.deltaBits, bits(4)); /* 9-5, |4| < 5 -> keep timer */
  assert.equal(stepped.timer, 10);

  /* Equal (jnp taken): current=target only; delta/prev/timer untouched. */
  const eq = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(7), prevBits: bits(3),
      thresholdBits: bits(0), timer: 10 },
    bits(5), 1);
  assert.deepEqual(eq, { currentBits: bits(5), deltaBits: bits(7),
    prevBits: bits(3), timer: 10 });
  /* -0.0 == +0.0 is equal; current takes the target bits. */
  const neg0 = playerHudStatBarTween(
    { currentBits: 0x80000000, deltaBits: bits(1), prevBits: bits(2),
      thresholdBits: bits(1), timer: 0 },
    0x00000000, 1);
  assert.equal(neg0.currentBits, 0x00000000);

  /* NaN target, timer<=30: delta NaN, prev=current, timer unchanged,
     current=NaN (comiss unordered -> jb skips the 0x96 write). */
  const nanSmall = playerHudStatBarTween(
    { currentBits: bits(1), deltaBits: bits(7), prevBits: bits(3),
      thresholdBits: bits(0.5), timer: 10 },
    qnan, 1);
  assert.equal(nanSmall.currentBits, qnan);
  assert.equal(nanSmall.prevBits, bits(1));
  assert.equal(nanSmall.deltaBits, qnan);
  assert.equal(nanSmall.timer, 10);

  /* NaN target, timer>30: timer=max(timer,135), delta NaN, current=NaN. */
  const nanBig = playerHudStatBarTween(
    { currentBits: bits(1), deltaBits: bits(7), prevBits: bits(3),
      thresholdBits: bits(0.5), timer: 40 },
    qnan, 1);
  assert.equal(nanBig.timer, 135);
  assert.equal(nanBig.deltaBits, qnan);
  assert.equal(nanBig.currentBits, qnan);

  /* timer<=30, |delta| >= threshold -> timer=150. */
  const bigStep = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(0.5), timer: 30 },
    bits(9), 1);
  assert.equal(bigStep.timer, 150);
  /* |delta| == threshold exactly (comiss equal -> CF=0 -> jb not taken). */
  const exactThr = playerHudStatBarTween(
    { currentBits: bits(0), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(9), timer: 5 },
    bits(9), 1);
  assert.equal(exactThr.timer, 150);
  /* Signed timer: -1 is <= 30. */
  const negTimer = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(0.5), timer: -1 },
    bits(9), 1);
  assert.equal(negTimer.timer, 150);
  /* Negative delta (target < current) is also |delta|. */
  const down = playerHudStatBarTween(
    { currentBits: bits(9), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(0.5), timer: 4 },
    bits(5), 1);
  assert.equal(down.deltaBits, bits(-4));
  assert.equal(down.timer, 150);

  /* timer>30: delta=target-prev; floor 135; stays when >= 135. */
  const floor = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(0.5), timer: 31 },
    bits(9), 1);
  assert.equal(floor.timer, 135);
  assert.equal(floor.deltaBits, bits(8)); /* 9 - prev(1) */
  assert.equal(floor.prevBits, bits(1));  /* prev untouched */
  const stay = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: bits(0.5), timer: 200 },
    bits(9), 1);
  assert.equal(stay.timer, 200);

  /* NaN threshold: comiss unordered -> jb -> timer unchanged even with a
     big finite delta. */
  const nanThr = playerHudStatBarTween(
    { currentBits: bits(5), deltaBits: bits(2), prevBits: bits(1),
      thresholdBits: qnan, timer: 12 },
    bits(9), 1);
  assert.equal(nanThr.timer, 12);

  /* Constants pinned to the PE immediates. */
  assert.equal(PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW, 0x1e);
  assert.equal(PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW, 0x96);
  assert.equal(PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR, 0x87);
  assert.equal(PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK, 0x7fffffff);
});

test("v18 Wasm ≡ JS — StatHUD bar tween (high-bit randomized, wide mode)", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x1000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  let rng = (0x84d6b0 ^ 0x718) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;
  const u32v = () => next() >>> 0;

  const floatBitsPool = [
    0x00000000, 0x3f800000, 0x3e800000, 0xbf000000, /* 0, 1, 0.25, -0.5 */
    0x80000000, /* -0.0 */
    0x7fc00000, 0xffc00000, /* qNaN +/- */
    0x7f800001, /* SNaN */
    0x7f800000, 0xff800000, /* +-Inf */
    0x00000001, /* subnormal */
    0x3f7fffff, 0x3f000000, /* 0.99999994, 0.5 */
    0x3e7fffff, 0x4b000000, /* 0.25-ulp, 8388608 */
    0x41200000, 0xc1200000, /* 10, -10 */
    0x42c80000, /* 100 */
  ];
  const timerChoices = [0, 1, 30, 31, 134, 135, 136, 150, 0x96, -1,
    0x7fffffff, 0x80000000];
  const wideModes = [0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff];

  /* The export writes only the fields the PE stores; seed the out buffer
     with the pre-call slot values so no-write fields read back preserved
     (exactly the residual-host apply semantics). */
  const seedOut = (p, cur, delta, prev, timer) => {
    view.setUint32(p + 0, cur, true);
    view.setUint32(p + 4, delta, true);
    view.setUint32(p + 8, prev, true);
    view.setInt32(p + 0xc, timer, true);
  };

  for (let iter = 0; iter < 6000; iter += 1) {
    const cur = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const deltaIn = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const prev = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const thr = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const timer = hi(2) === 0
      ? timerChoices[hi(timerChoices.length)]
      : (u32v() << 8 >> 8);
    const target = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const mode = wideModes[hi(wideModes.length)] >>> 0;
    const slot = { currentBits: cur, deltaBits: deltaIn, prevBits: prev,
      thresholdBits: thr, timer };
    seedOut(base, cur, deltaIn, prev, timer);
    exp.statBarTween(base, cur, prev, thr, timer, target, mode);
    const js = playerHudStatBarTween(slot, target, mode);
    assert.equal(readU32(view, base + 0), js.currentBits,
      `current iter=${iter}`);
    assert.equal(readU32(view, base + 4), js.deltaBits,
      `delta iter=${iter} cur=0x${cur.toString(16)} target=0x${target.toString(16)}`);
    assert.equal(readU32(view, base + 8), js.prevBits,
      `prev iter=${iter}`);
    assert.equal(readI32(view, base + 0xc), js.timer,
      `timer iter=${iter}`);
  }
});

test("v18 mutation checks: reset gate, equal skip, timer write, floor, NaN jb", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x10000;
  const call = (wasm, cur, prev, thr, timer, target, mode) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x100) wasm.memory.grow(1);
    wasm.isaac_playerhud_stat_bar_tween(
      base, cur, prev, thr, timer, target, mode);
    return v;
  };

  /* M18: mode gate on the full dword — 0x100 must reset (low byte 0). */
  withMutant(
    "  if ((mode & 0xffu) == 0u) {",
    "  if (mode == 0u) {",
    (wasm) => {
      const v = call(wasm, 0x40a00000 /*5*/, 0x3f800000 /*1*/,
        0x3f000000 /*0.5*/, 77, 0x41100000 /*9*/, 0x100);
      assert.equal(
        v.getUint32(base + 4, true),
        0x41000000, /* 9 - prev(1) = 8.0 on the step path */
        "M18 must diverge: PE tests the low byte, so 0x100 resets delta to 0",
      );
      assert.equal(v.getInt32(base + 0xc, true), 135,
        "M18 must diverge: reset zeroes the timer, mutant clamps to 135");
    },
  );

  /* M19: dropping the equal fast path re-tweens (timer 150 vs kept 10). */
  withMutant(
    "  if (target == current) {",
    "  if (false) {",
    (wasm) => {
      const v = call(wasm, 0x40a00000 /*5*/, 0x40400000 /*3*/,
        0x00000000 /*0*/, 10, 0x40a00000 /*5 == current*/, 1);
      assert.equal(
        v.getInt32(base + 0xc, true),
        150,
        "M19 must diverge: jnp is taken on equal, timer stays 10 (mutant tweens to 150)",
      );
    },
  );

  /* M20: NaN jb — comiss unordered skips the 0x96 write. The `!(<)` mutant
     treats NaN as >= and would write 150. */
  withMutant(
    "    if (abs_delta >= threshold) {",
    "    if (!(abs_delta < threshold)) {",
    (wasm) => {
      const v = call(wasm, 0x3f800000 /*1*/, 0x40400000 /*3*/,
        0x3f000000 /*0.5*/, 10, 0x7fc00000 /*NaN*/, 1);
      assert.equal(
        v.getInt32(base + 0xc, true),
        150,
        "M20 must diverge: NaN comiss is unordered -> jb -> timer unchanged (mutant writes 150)",
      );
    },
  );

  /* M21: timer floor — 200 must stay 200 (cmovge keeps >= 0x87). */
  withMutant(
    "  out->timer = timer >= ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR\n"
    + "                   ? timer\n"
    + "                   : ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR;",
    "  out->timer = ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR;",
    (wasm) => {
      const v = call(wasm, 0x40a00000 /*5*/, 0x3f800000 /*1*/,
        0x3f000000 /*0.5*/, 200, 0x41100000 /*9*/, 1);
      assert.equal(
        v.getInt32(base + 0xc, true),
        135,
        "M21 must diverge: cmovge keeps timer=200; mutant clamps to 135",
      );
    },
  );

  /* M22: big-step timer write — |delta|>=threshold must set 150. */
  withMutant(
    "      out->timer = ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW;",
    "      out->timer = timer;",
    (wasm) => {
      const v = call(wasm, 0x40a00000 /*5*/, 0x3f800000 /*1*/,
        0x3f000000 /*0.5*/, 30, 0x41100000 /*9*/, 1);
      assert.equal(
        v.getInt32(base + 0xc, true),
        30,
        "M22 must diverge: PE writes 0x96 when fabs(delta) >= threshold",
      );
    },
  );
});

/* ============================ ABI v19 ============================ */

const SLOT19 = (cur, delta, prev, thr, timer) => ({
  currentBits: cur, deltaBits: delta, prevBits: prev,
  thresholdBits: thr, timer,
});
const sixSlots19 = (s) => Array.from({ length: 6 }, () => ({ ...s }));

test("v19 6-slot StatHUD updater fixed edges (VA 0x0084e9d0..0x0084ea85)", () => {
  const bits = (x) => f32bitsOf(x);
  const qnan = 0x7fc00000;
  const seed = () => SLOT19(bits(5), bits(2), bits(1), bits(0.5), 10);
  const step = () => playerHud84e9d0Update(
    sixSlots19(seed()), 0x10000000, bits(9), bits(4), bits(7), bits(100),
    bits(0.5), bits(3), 0x1ff);

  /* Null player gate (0x0084e9d6 mov eax,[edi+0x48]; test eax,eax;
     je 0x84ea80): full-dword null test, all 6 slots untouched. */
  const gated = playerHud84e9d0Update(
    sixSlots19(seed()), 0, bits(9), bits(4), bits(7), bits(100),
    bits(0.5), bits(3), 1);
  assert.deepEqual(gated, sixSlots19(seed()));

  /* Each of the 6 recipes pinned via mode-0 reset (current == target). */
  const reset = playerHud84e9d0Update(
    sixSlots19(seed()), 0x10000000, bits(7.5), bits(4), bits(-2.25), bits(100),
    bits(0.5), bits(3), 0);
  assert.equal(reset[0].currentBits, bits(7.5));   /* k0: player+0x1568 */
  assert.equal(reset[1].currentBits, bits(6));     /* k1: 30.0/(4.0+1.0) */
  assert.equal(reset[2].currentBits, bits(-2.25)); /* k2: player+0x1470 */
  assert.equal(reset[3].currentBits, bits(2.5));   /* k3: 100.0/40.0 */
  assert.equal(reset[4].currentBits, bits(0.5));   /* k4: player+0x1464 */
  assert.equal(reset[5].currentBits, bits(3));     /* k5: player+0x156c */
  /* Reset also zeroes delta/timer and copies prev = pre-call current. */
  for (let i = 0; i < PLAYERHUD_84E9D0_SLOT_COUNT; i += 1) {
    assert.equal(reset[i].deltaBits, 0);
    assert.equal(reset[i].timer, 0);
    assert.equal(reset[i].prevBits, bits(5));
  }

  /* Ordering pin: k1 is 30/(p1460+1.0), NOT (30/p1460)+1 (those differ: 6.0
     vs 8.5 for p1460=4.0).  k3 is p1480/40.0 plain. */
  const order = playerHud84e9d0Update(
    sixSlots19(seed()), 1, bits(7.5), bits(4), bits(-2.25), bits(100),
    bits(0.5), bits(3), 0);
  assert.equal(order[1].currentBits, bits(6));
  assert.equal(order[3].currentBits, bits(2.5));

  /* mode 0 resets vs mode 1 steps; wide core-mode bits never pre-masked. */
  const m100 = playerHud84e9d0Update(
    sixSlots19(seed()), 1, bits(9), bits(4), bits(7), bits(100),
    bits(0.5), bits(3), 0x100);
  assert.equal(m100[0].timer, 0, "0x100: low byte 0 -> reset");
  const mall = playerHud84e9d0Update(
    sixSlots19(seed()), 1, bits(9), bits(4), bits(7), bits(100),
    bits(0.5), bits(3), 0xffffffff);
  assert.equal(mall[0].timer, 150, "0xffffffff: low byte 1 -> step");

  /* Full step pass (mode 0x1ff): each slot tweens toward its recipe with
     timer<=30 (|delta|>=0.5 -> 150) and prev=current. */
  const st = step();
  const targets = [bits(9), bits(6), bits(7), bits(2.5), bits(0.5), bits(3)];
  const deltas = [bits(4), bits(1), bits(2), bits(-2.5), bits(-4.5), bits(-2)];
  for (let i = 0; i < PLAYERHUD_84E9D0_SLOT_COUNT; i += 1) {
    assert.equal(st[i].currentBits, targets[i], `slot${i} current`);
    assert.equal(st[i].prevBits, bits(5), `slot${i} prev`);
    assert.equal(st[i].deltaBits, deltas[i], `slot${i} delta`);
    assert.equal(st[i].timer, 150, `slot${i} timer`);
  }

  /* Timer boundary 30/31: 30 -> 150 (|delta| >= thr); 31 -> floor 135 and
     delta=target-prev. */
  const t30 = playerHud84e9d0Update(
    sixSlots19(SLOT19(bits(5), bits(2), bits(1), bits(0.5), 30)), 1,
    bits(9), bits(4), bits(7), bits(100), bits(0.5), bits(3), 1);
  assert.equal(t30[0].timer, 150);
  const t31 = playerHud84e9d0Update(
    sixSlots19(SLOT19(bits(5), bits(2), bits(1), bits(0.5), 31)), 1,
    bits(9), bits(4), bits(7), bits(100), bits(0.5), bits(3), 1);
  assert.equal(t31[0].timer, 135);
  assert.equal(t31[0].deltaBits, bits(8)); /* 9 - prev(1) */
  assert.equal(t31[0].prevBits, bits(1));  /* prev untouched (timer>30) */

  /* Equal-skip via the tween (k0 target == slot0 current, thr=0): slot0
     keeps delta/prev/timer untouched. */
  const eq = playerHud84e9d0Update(
    sixSlots19(SLOT19(bits(5), bits(7), bits(3), bits(0), 10)), 1,
    bits(5), bits(4), bits(7), bits(100), bits(0.5), bits(3), 1);
  assert.equal(eq[0].currentBits, bits(5));
  assert.equal(eq[0].deltaBits, bits(7));
  assert.equal(eq[0].prevBits, bits(3));
  assert.equal(eq[0].timer, 10);

  /* NaN target (k0): timer<=30 keeps the timer, delta NaN; timer>30 floors
     to 135.  NaN through the k1 recipe: 30/(NaN+1) -> NaN target. */
  const nans = playerHud84e9d0Update(
    sixSlots19(seed()), 1, qnan, bits(4), bits(7), bits(100),
    bits(0.5), bits(3), 1);
  assert.equal(nans[0].currentBits, qnan);
  assert.equal(nans[0].deltaBits, qnan);
  assert.equal(nans[0].prevBits, bits(5));
  assert.equal(nans[0].timer, 10);
  const nanb = playerHud84e9d0Update(
    sixSlots19(SLOT19(bits(1), bits(7), bits(3), bits(0.5), 40)), 1,
    qnan, bits(4), bits(7), bits(100), bits(0.5), bits(3), 1);
  assert.equal(nanb[0].timer, 135);
  const nank1 = playerHud84e9d0Update(
    sixSlots19(seed()), 1, bits(9), qnan, bits(7), bits(100),
    bits(0.5), bits(3), 0);
  assert.equal(nank1[1].currentBits, qnan, "divss(30.0, NaN) -> NaN");

  /* Constants pinned to the PE immediates / receiver geometry. */
  assert.equal(PLAYERHUD_84E9D0_SLOT_COUNT, 6);
  assert.equal(PLAYERHUD_84E9D0_SLOT_STRIDE, 0x14);
  assert.equal(PLAYERHUD_84E9D0_SLOTS_BASE, 0x4c);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_PTR_OFF, 0x48);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_1568, 0x1568);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_1460, 0x1460);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_1470, 0x1470);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_1480, 0x1480);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_1464, 0x1464);
  assert.equal(PLAYERHUD_84E9D0_PLAYER_156C, 0x156c);
  assert.equal(PLAYERHUD_84E9D0_RDATA_30F, 0x00baa8d0);
  assert.equal(PLAYERHUD_84E9D0_RDATA_1F, 0x00baa454);
  assert.equal(PLAYERHUD_84E9D0_RDATA_40F, 0x00baa904);
});

test("v19 Wasm ≡ JS — 6-slot StatHUD updater (high-bit randomized, wide mode)", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x2000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  let rng = (0x84e9d0 ^ 0x2f1) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;
  const u32v = () => next() >>> 0;

  const floatBitsPool = [
    0x00000000, 0x3f800000, 0x3e800000, 0xbf000000, /* 0, 1, 0.25, -0.5 */
    0x80000000, /* -0.0 */
    0x7fc00000, 0xffc00000, /* qNaN +/- */
    0x7f800001, /* SNaN */
    0x7f800000, 0xff800000, /* +-Inf */
    0x00000001, /* subnormal */
    0x3f7fffff, 0x3f000000, /* 0.99999994, 0.5 */
    0x3e7fffff, 0x4b000000, /* 0.25-ulp, 8388608 */
    0x41200000, 0xc1200000, /* 10, -10 */
    0x42c80000, /* 100 */
  ];
  const timerChoices = [0, 1, 30, 31, 134, 135, 136, 150, 0x96, -1,
    0x7fffffff, 0x80000000];
  const wideModes = [0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff];

  /* Slot i lives at base + i*0x14 with the full 5-dword PE geometry
     (cur/delta/prev/thr/timer); threshold +0xc is never written. */
  const seedSlot = (p, s) => {
    view.setUint32(p + 0, s.currentBits, true);
    view.setUint32(p + 4, s.deltaBits, true);
    view.setUint32(p + 8, s.prevBits, true);
    view.setUint32(p + 0xc, s.thresholdBits, true);
    view.setInt32(p + 0x10, s.timer, true);
  };

  for (let iter = 0; iter < 6000; iter += 1) {
    const slots = [];
    for (let i = 0; i < PLAYERHUD_84E9D0_SLOT_COUNT; i += 1) {
      slots.push({
        currentBits: floatBitsPool[hi(floatBitsPool.length)] >>> 0,
        deltaBits: floatBitsPool[hi(floatBitsPool.length)] >>> 0,
        prevBits: floatBitsPool[hi(floatBitsPool.length)] >>> 0,
        thresholdBits: floatBitsPool[hi(floatBitsPool.length)] >>> 0,
        timer: hi(2) === 0
          ? timerChoices[hi(timerChoices.length)]
          : (u32v() << 8 >> 8),
      });
    }
    const p1568 = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const p1460 = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const p1470 = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const p1480 = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const p1464 = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const p156c = floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const mode = wideModes[hi(wideModes.length)] >>> 0;
    const playerPtr = hi(2) === 0 ? 0 : u32v();
    for (let i = 0; i < PLAYERHUD_84E9D0_SLOT_COUNT; i += 1) {
      seedSlot(base + i * PLAYERHUD_84E9D0_SLOT_STRIDE, slots[i]);
    }
    exp.hud84e9d0Update(
      base, playerPtr, p1568, p1460, p1470, p1480, p1464, p156c, mode);
    const js = playerHud84e9d0Update(
      slots, playerPtr, p1568, p1460, p1470, p1480, p1464, p156c, mode);
    for (let i = 0; i < PLAYERHUD_84E9D0_SLOT_COUNT; i += 1) {
      const s = base + i * PLAYERHUD_84E9D0_SLOT_STRIDE;
      assert.equal(readU32(view, s + 0), js[i].currentBits,
        `slot${i} current iter=${iter}`);
      assert.equal(readU32(view, s + 4), js[i].deltaBits,
        `slot${i} delta iter=${iter}`);
      assert.equal(readU32(view, s + 8), js[i].prevBits,
        `slot${i} prev iter=${iter}`);
      assert.equal(readI32(view, s + 0x10), js[i].timer,
        `slot${i} timer iter=${iter}`);
    }
  }
});

test("v19 mutation checks: tween drop, receiver offset, recipe swap, gate", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x10000;
  const call = (wasm, playerPtr, p1568, p1460, p1470, p1480, p1464, p156c,
    mode) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x200) wasm.memory.grow(1);
    for (let i = 0; i < 6; i += 1) {
      const s = base + i * 0x14;
      v.setUint32(s + 0, 0x40a00000, true);   /* current 5 */
      v.setUint32(s + 4, 0x40000000, true);   /* delta 2 */
      v.setUint32(s + 8, 0x3f800000, true);   /* prev 1 */
      v.setUint32(s + 0xc, 0x3f000000, true); /* threshold 0.5 */
      v.setInt32(s + 0x10, 10, true);         /* timer 10 */
    }
    wasm.isaac_playerhud_84e9d0_update(
      base, playerPtr, p1568, p1460, p1470, p1480, p1464, p156c, mode);
    return v;
  };

  /* M23: dropped tween call (loop bound 5) — slot 5 must stay untouched. */
  withMutant(
    "  for (int i = 0; i < ISAAC_PLAYERHUD_84E9D0_SLOT_COUNT; ++i) {",
    "  for (int i = 0; i < 5; ++i) {",
    (wasm) => {
      const v = call(wasm, 0x10000000, 0x41100000 /*9*/, 0x40800000 /*4*/,
        0x40e00000 /*7*/, 0x42c80000 /*100*/, 0x3f000000 /*0.5*/,
        0x40400000 /*3*/, 0);
      assert.equal(
        v.getUint32(base + 5 * 0x14 + 0, true),
        0x40a00000, /* mutant: slot5 never tweened, current stays 5 */
        "M23 must diverge: PE tweens all 6 slots; slot5 current = p156c(3), mutant keeps 5",
      );
    },
  );

  /* M24: wrong receiver offset (neighbor slot) — slot0 must carry recipe0. */
  withMutant(
    "    IsaacPlayerHud84e9d0SlotState* s = &out[i];",
    "    IsaacPlayerHud84e9d0SlotState* s = &out[(i + 1) % ISAAC_PLAYERHUD_84E9D0_SLOT_COUNT];",
    (wasm) => {
      const v = call(wasm, 1, 0x41100000 /*9*/, 0x40800000 /*4*/,
        0x40e00000 /*7*/, 0x42c80000 /*100*/, 0x3f000000 /*0.5*/,
        0x40400000 /*3*/, 0);
      assert.equal(
        v.getUint32(base + 0, true),
        0x40400000, /* mutant: i=5 -> &out[0] gets recipe5 (p156c=3) */
        "M24 must diverge: receiver this+0x4c gets recipe0 (p1568=9), mutant writes p156c(3) there",
      );
    },
  );

  /* M25: recipe constant swapped — slot1 must be 30.0/(p1460+1.0). */
  withMutant(
    "      __builtin_bit_cast(uint32_t, 30.0f / (t1460 + 1.0f)),",
    "      __builtin_bit_cast(uint32_t, 1.0f / (t1460 + 30.0f)),",
    (wasm) => {
      const v = call(wasm, 1, 0x41100000 /*9*/, 0x40800000 /*4*/,
        0x40e00000 /*7*/, 0x42c80000 /*100*/, 0x3f000000 /*0.5*/,
        0x40400000 /*3*/, 0);
      assert.equal(
        v.getUint32(base + 0x14 + 0, true),
        f32bitsOf(1 / 34), /* mutant: 1.0/(4.0+30.0) */
        "M25 must diverge: slot1 target is 30.0/(p1460+1.0)=6.0, mutant computes 1/34",
      );
    },
  );

  /* M26: gate removed — a null player must still leave every slot alone. */
  withMutant(
    "  if (player_ptr == 0u) {\n    return;\n  }",
    "  (void)player_ptr;",
    (wasm) => {
      const v = call(wasm, 0 /* null player */, 0x41100000, 0x40800000,
        0x40e00000, 0x42c80000, 0x3f000000, 0x40400000, 0);
      assert.equal(
        v.getUint32(base + 0, true),
        0x41100000, /* mutant: null player still tweens slot0 to p1568(9) */
        "M26 must diverge: [this+0x48]==0 returns without touching slots",
      );
    },
  );
});

/* ============================ ABI v20 ============================ */

test("v20 action-id string select fixed edges (VA 0x0084d740..0x0084d824)", () => {
  /* Taken arms 0..0x1f: each rdata imm from the jump table. */
  assert.equal(PLAYERHUD_84D740_STRING_VAS.length, 0x20);
  for (let i = 0; i <= PLAYERHUD_84D740_ACTION_MAX; i += 1) {
    assert.equal(playerHud84d740StringVa(i), PLAYERHUD_84D740_STRING_VAS[i],
      `ecx=${i}`);
    assert.equal(playerHud84d740NeedsLog(i), 0, `ecx=${i} no log`);
    const p = playerHud84d740Plan(i);
    assert.equal(p.stringVa, PLAYERHUD_84D740_STRING_VAS[i]);
    assert.equal(p.needsLog, 0);
    assert.equal(p.logLevel, 0);
    assert.equal(p.logFmtVa, 0);
    assert.equal(p.hostVaLog, PLAYERHUD_HOST_VA_LOG);
  }

  /* Endpoints of the taken range. */
  assert.equal(playerHud84d740StringVa(0), 0x00b1cdf0); /* Left */
  assert.equal(playerHud84d740StringVa(0x1f), 0x00b6e21c); /* ToggleDescriptions */

  /* Default arm: UNSIGNED ja, empty string, host log 0x10 / 0xb6e230. */
  const def = playerHud84d740Plan(0x20);
  assert.equal(def.stringVa, PLAYERHUD_84D740_DEFAULT_STRING_VA);
  assert.equal(def.needsLog, 1);
  assert.equal(def.logLevel, 0x10);
  assert.equal(def.logFmtVa, 0x00b6e230);
  assert.equal(def.hostVaLog, 0x00a112c0);
  assert.equal(playerHud84d740NeedsLog(0x20), 1);
  assert.equal(playerHud84d740StringVa(0x20), 0x00b1a4ec);

  /* Wide / high-bit: 0x100 and 0xffffffff both take default (UNSIGNED).
     Signed -1 is 0xffffffff, also default. 0x1f stays taken. */
  assert.equal(playerHud84d740NeedsLog(0x100), 1);
  assert.equal(playerHud84d740NeedsLog(0xffffffff), 1);
  assert.equal(playerHud84d740NeedsLog(-1), 1);
  assert.equal(playerHud84d740StringVa(0x100), 0x00b1a4ec);
  assert.equal(playerHud84d740StringVa(0xffffffff), 0x00b1a4ec);
  assert.equal(playerHud84d740NeedsLog(0x1f), 0);

  /* Constants pinned to the PE immediates. */
  assert.equal(PLAYERHUD_84D740_ACTION_COUNT, 0x20);
  assert.equal(PLAYERHUD_84D740_ACTION_MAX, 0x1f);
  assert.equal(PLAYERHUD_84D740_JUMP_TABLE_VA, 0x0084d828);
  assert.equal(PLAYERHUD_84D740_DEFAULT_STRING_VA, 0x00b1a4ec);
  assert.equal(PLAYERHUD_84D740_LOG_FMT_VA, 0x00b6e230);
  assert.equal(PLAYERHUD_84D740_LOG_LEVEL, 0x10);
  assert.equal(PLAYERHUD_HOST_VA_LOG, 0x00a112c0);
});

test("v20 Wasm ≡ JS — action-id string select (high-bit randomized)", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x40) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.hostVaLog(), PLAYERHUD_HOST_VA_LOG);
  assert.equal(exp.abi(), 44);

  let rng = (0x84d740 ^ 0x20) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };

  const fixed = [0, 1, 0x1e, 0x1f, 0x20, 0x21, 0x100, 0x1ff,
    0x7fffffff, 0x80000000, 0xffffffff];
  for (const id of fixed) {
    const js = playerHud84d740Plan(id);
    assert.equal(exp.hud84d740StringVa(id) >>> 0, js.stringVa, `str ${id}`);
    assert.equal(exp.hud84d740NeedsLog(id) | 0, js.needsLog, `log ${id}`);
    exp.hud84d740Plan(base, id);
    assert.equal(view.getUint32(base + 0, true), js.stringVa);
    assert.equal(view.getInt32(base + 4, true), js.needsLog);
    assert.equal(view.getUint32(base + 8, true), js.logLevel);
    assert.equal(view.getUint32(base + 12, true), js.logFmtVa);
    assert.equal(view.getUint32(base + 16, true), js.hostVaLog);
  }

  for (let iter = 0; iter < 4000; iter += 1) {
    const id = next() >>> 0;
    const js = playerHud84d740Plan(id);
    assert.equal(exp.hud84d740StringVa(id) >>> 0, js.stringVa,
      `str iter=${iter} id=${id}`);
    assert.equal(exp.hud84d740NeedsLog(id) | 0, js.needsLog,
      `log iter=${iter} id=${id}`);
    exp.hud84d740Plan(base, id);
    assert.equal(view.getUint32(base + 0, true), js.stringVa);
    assert.equal(view.getInt32(base + 4, true), js.needsLog);
    assert.equal(view.getUint32(base + 8, true), js.logLevel);
    assert.equal(view.getUint32(base + 12, true), js.logFmtVa);
    assert.equal(view.getUint32(base + 16, true), js.hostVaLog);
  }
});

test("v20 mutation checks: signed bound, table swap, default log drop", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M27: signed compare on needs_log — 0x80000000 must take default. */
  withMutant(
    "  return action_id > ISAAC_PLAYERHUD_84D740_ACTION_MAX ? 1 : 0;",
    "  return (int32_t)action_id > (int32_t)ISAAC_PLAYERHUD_84D740_ACTION_MAX ? 1 : 0;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84d740_needs_log
        ?? wasm._isaac_playerhud_84d740_needs_log;
      assert.equal(
        fn(0x80000000) | 0,
        0, /* mutant: signed -2^31 is not > 0x1f */
        "M27 must diverge: PE UNSIGNED ja sends 0x80000000 to the log arm",
      );
    },
  );

  /* M28: table[0] swapped with table[1] — ecx=0 must be Left 0xb1cdf0. */
  withMutant(
    "    0x00b1cdf0u, /*  0 Left */\n    0x00b1cde8u, /*  1 Right */",
    "    0x00b1cde8u, /*  0 swapped */\n    0x00b1cdf0u, /*  1 swapped */",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84d740_string_va
        ?? wasm._isaac_playerhud_84d740_string_va;
      assert.equal(
        fn(0) >>> 0,
        0x00b1cde8,
        "M28 must diverge: ecx=0 is Left 0xb1cdf0, mutant returns Right",
      );
    },
  );

  /* M29: default arm drops the log flag — 0x20 must need the host log. */
  withMutant(
    "    out->needs_log = 1;",
    "    out->needs_log = 0;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84d740_plan
        ?? wasm._isaac_playerhud_84d740_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x20) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base, 0x20);
      assert.equal(
        v.getInt32(base + 4, true),
        0,
        "M29 must diverge: default arm needs_log=1 (host 0xa112c0)",
      );
    },
  );
});

/* ============================ ABI v21 ============================ */

test("v21 2-segment SSE intersect fixed edges (VA 0x0084d8b0..0x0084da1f)", () => {
  const bits = (x) => f32bitsOf(x);
  const qnan = 0x7fc00000;
  const seed = { xBits: 0xdeadbeef, yBits: 0xcafebabe };

  /* Crossing + : A(0,0)-B(1,0) x C(0.5,-1)-D(0.5,1) → (0.5,0), t=u=0.5. */
  const plus = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0.5), bits(-1), bits(0.5), bits(1),
    1, 1, seed);
  assert.equal(plus.hit, 1);
  assert.equal(plus.writeX, 1);
  assert.equal(plus.writeY, 1);
  assert.equal(plus.xBits, bits(0.5));
  assert.equal(plus.yBits, bits(0));

  /* u>t pick AB: A(0,0)-B(1,0) x C(1,-1)-D(1,1) → (1,0). */
  const uGt = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(1), bits(-1), bits(1), bits(1),
    1, 1, seed);
  assert.equal(uGt.hit, 1);
  assert.equal(uGt.xBits, bits(1));
  assert.equal(uGt.yBits, bits(0));

  /* Parallel: denom=0, comisd jae fail. Seed preserved. */
  const par = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0), bits(1), bits(1), bits(1),
    1, 1, seed);
  assert.equal(par.hit, 0);
  assert.equal(par.writeX, 0);
  assert.equal(par.writeY, 0);
  assert.equal(par.xBits, 0xdeadbeef);
  assert.equal(par.yBits, 0xcafebabe);

  /* Exact-eps denom: f32 0x3727c5ac == rdata eps. jae fail (equal). */
  const epsF32 = 0x3727c5ac;
  const epsHit = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0.5), f32bitsOf(-f32FromBitsLocal(epsF32) / 2),
    bits(0.5), f32bitsOf(f32FromBitsLocal(epsF32) / 2),
    1, 1, seed);
  assert.equal(epsHit.hit, 0);

  /* t<0 miss: C/D left of AB. */
  const tNeg = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(-1), bits(1), bits(-1), bits(-1),
    1, 1, seed);
  assert.equal(tNeg.hit, 0);

  /* u>1 miss: C/D right of AB. */
  const uPast = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(2), bits(1), bits(2), bits(-1),
    1, 1, seed);
  assert.equal(uPast.hit, 0);

  /* Null ecx: hit, x not written. */
  const noX = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0.5), bits(-1), bits(0.5), bits(1),
    0, 1, seed);
  assert.equal(noX.hit, 1);
  assert.equal(noX.writeX, 0);
  assert.equal(noX.writeY, 1);
  assert.equal(noX.xBits, 0xdeadbeef);
  assert.equal(noX.yBits, bits(0));

  /* Null edx: hit, y not written. */
  const noY = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0.5), bits(-1), bits(0.5), bits(1),
    1, 0, seed);
  assert.equal(noY.hit, 1);
  assert.equal(noY.writeX, 1);
  assert.equal(noY.writeY, 0);
  assert.equal(noY.xBits, bits(0.5));
  assert.equal(noY.yBits, 0xcafebabe);

  /* NaN denom: comisd unordered -> CF=1 -> jae NOT taken, then
     comiss jb on t/u NaN fails. Seed preserved. */
  const nanD = playerHud84d8b0Intersect(
    qnan, bits(0), bits(1), bits(0),
    bits(0), bits(1), bits(1), bits(1),
    1, 1, seed);
  assert.equal(nanD.hit, 0);
  assert.equal(nanD.xBits, 0xdeadbeef);

  /* Endpoint u=0: A(0,0)-B(1,0) x C(0,-1)-D(0,1) → (0,0), u<=t. */
  const end0 = playerHud84d8b0Intersect(
    bits(0), bits(0), bits(1), bits(0),
    bits(0), bits(-1), bits(0), bits(1),
    1, 1, seed);
  assert.equal(end0.hit, 1);
  assert.equal(end0.xBits, bits(0));
  assert.equal(end0.yBits, bits(0));

  /* Constants pinned to PE rdata. */
  assert.equal(PLAYERHUD_84D8B0_RDATA_EPS, 0x00baa2a8);
  assert.equal(PLAYERHUD_84D8B0_RDATA_ABS, 0x00bacb50);
  assert.equal(PLAYERHUD_84D8B0_RDATA_NEG, 0x00bacb70);
  assert.equal(PLAYERHUD_84D8B0_RDATA_ONE, 0x00baa454);
  assert.equal(PLAYERHUD_84D8B0_EPS_F64_LO, 0x80000000);
  assert.equal(PLAYERHUD_84D8B0_EPS_F64_HI, 0x3ee4f8b5);
  assert.equal(PLAYERHUD_84D8B0_ONE_BITS, 0x3f800000);
});

function f32FromBitsLocal(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

test("v21 Wasm ≡ JS — 2-segment SSE intersect (high-bit randomized)", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x40) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);

  const seedOut = (hit, x, y, wx, wy) => {
    view.setInt32(base + 0, hit, true);
    view.setUint32(base + 4, x, true);
    view.setUint32(base + 8, y, true);
    view.setInt32(base + 12, wx, true);
    view.setInt32(base + 16, wy, true);
  };
  const call = (ax, ay, bx, by, cx, cy, dx, dy, xp, yp, seed) => {
    seedOut(0x11, seed.xBits, seed.yBits, 0x22, 0x33);
    exp.hud84d8b0Intersect(base, ax, ay, bx, by, cx, cy, dx, dy, xp, yp);
    return {
      hit: view.getInt32(base + 0, true),
      xBits: view.getUint32(base + 4, true),
      yBits: view.getUint32(base + 8, true),
      writeX: view.getInt32(base + 12, true),
      writeY: view.getInt32(base + 16, true),
    };
  };

  const bits = (x) => f32bitsOf(x);
  const seed = { xBits: 0x11111111, yBits: 0x22222222 };
  const fixed = [
    [bits(0), bits(0), bits(1), bits(0), bits(0.5), bits(-1), bits(0.5), bits(1), 1, 1],
    [bits(0), bits(0), bits(1), bits(0), bits(0), bits(1), bits(1), bits(1), 1, 1],
    [bits(0), bits(0), bits(1), bits(0), bits(1), bits(-1), bits(1), bits(1), 0, 1],
    [bits(0), bits(0), bits(1), bits(0), bits(0.5), bits(-1), bits(0.5), bits(1), 1, 0],
    [0x7fc00000, bits(0), bits(1), bits(0), bits(0), bits(1), bits(1), bits(1), 1, 1],
    [bits(0), bits(0), bits(1), bits(0), bits(2), bits(1), bits(2), bits(-1), 1, 1],
  ];
  for (const args of fixed) {
    const js = playerHud84d8b0Intersect(...args, seed);
    const w = call(...args, seed);
    assert.equal(w.hit, js.hit);
    assert.equal(w.xBits, js.xBits);
    assert.equal(w.yBits, js.yBits);
    assert.equal(w.writeX, js.writeX);
    assert.equal(w.writeY, js.writeY);
  }

  let rng = (0x84d8b0 ^ 0x21) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const floatBitsPool = [
    0x00000000, 0x3f800000, 0x3e800000, 0xbf000000,
    0x80000000, 0x3f000000, 0x3fc00000, 0x40000000,
    0x7fc00000, 0xffc00000, 0x7f800001, 0x7f800000,
    0xff800000, 0x00000001, 0x3f7fffff, 0x41200000,
    0xc1200000, 0x3727c5ac, 0xb727c5ac, 0x3a83126f,
  ];
  for (let iter = 0; iter < 4000; iter += 1) {
    const pick = () => floatBitsPool[(next() >>> 8) % floatBitsPool.length];
    const args = [
      pick(), pick(), pick(), pick(), pick(), pick(), pick(), pick(),
      next() & 1, next() & 1,
    ];
    const s = { xBits: next() >>> 0, yBits: next() >>> 0 };
    const js = playerHud84d8b0Intersect(...args, s);
    const w = call(...args, s);
    assert.equal(w.hit, js.hit, `hit iter=${iter}`);
    assert.equal(w.xBits, js.xBits, `x iter=${iter}`);
    assert.equal(w.yBits, js.yBits, `y iter=${iter}`);
    assert.equal(w.writeX, js.writeX, `wx iter=${iter}`);
    assert.equal(w.writeY, js.writeY, `wy iter=${iter}`);
  }
});

test("v21 mutation checks: eps jae equal, jb NaN, u>t pick", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x10000;
  const bits = (x) => f32bitsOf(x);
  const call = (wasm, ax, ay, bx, by, cx, cy, dx, dy, xp, yp) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x40) wasm.memory.grow(1);
    v.setInt32(base + 0, 0x11, true);
    v.setUint32(base + 4, 0xdeadbeef, true);
    v.setUint32(base + 8, 0xcafebabe, true);
    v.setInt32(base + 12, 0x22, true);
    v.setInt32(base + 16, 0x33, true);
    const fn = wasm.isaac_playerhud_84d8b0_intersect
      ?? wasm._isaac_playerhud_84d8b0_intersect;
    fn(base, ax, ay, bx, by, cx, cy, dx, dy, xp, yp);
    return v;
  };

  /* M30: eps > (strict) — exact-eps denom must fail (jae includes equal). */
  const epsF32 = 0x3727c5ac;
  const half = f32bitsOf(-f32FromBitsLocal(epsF32) / 2);
  const halfP = f32bitsOf(f32FromBitsLocal(epsF32) / 2);
  withMutant(
    "  if (eps >= abs_denom) {",
    "  if (eps > abs_denom) {",
    (wasm) => {
      const v = call(wasm, bits(0), bits(0), bits(1), bits(0),
        bits(0.5), half, bits(0.5), halfP, 1, 1);
      assert.equal(
        v.getInt32(base + 0, true),
        1,
        "M30 must diverge: PE jae fails equal-eps; mutant treats equal as hit",
      );
    },
  );

  /* M31: t>=0 becomes t>0 — endpoint t=0 must hit. */
  withMutant(
    "  if (!(t >= 0.0f) || !(1.0f >= t) || !(u >= 0.0f) || !(1.0f >= u)) {",
    "  if (!(t > 0.0f) || !(1.0f >= t) || !(u >= 0.0f) || !(1.0f >= u)) {",
    (wasm) => {
      /* A(0,0)-B(0,1) x C(-1,0)-D(1,0): t=0.5, u=0.5 wait.
         Want t==0: A(0,0)-B(1,0) x C(0,0)-D(0,1) — C is A.
         denom=(0-1)*(0-1)-(0-0)*(0-0)=1; tNum=xor(-(0-0)*(0-1)-(0-0)*(0-0))=0. */
      const v = call(wasm, bits(0), bits(0), bits(1), bits(0),
        bits(0), bits(0), bits(0), bits(1), 1, 1);
      assert.equal(
        v.getInt32(base + 0, true),
        0,
        "M31 must diverge: PE accepts t==0; mutant rejects",
      );
    },
  );

  /* M32: drop xorps sign flip on t — t flips, plus-cross t=-0.5 fails. */
  withMutant(
    "  const float t_num = __builtin_bit_cast(\n"
    + "      float, __builtin_bit_cast(uint32_t, t_unneg) ^ 0x80000000u);",
    "  const float t_num = t_unneg;",
    (wasm) => {
      const v = call(wasm, bits(0), bits(0), bits(1), bits(0),
        bits(0.5), bits(-1), bits(0.5), bits(1), 1, 1);
      assert.equal(
        v.getInt32(base + 0, true),
        0,
        "M32 must diverge: PE xorps-neg makes t=0.5; mutant t=-0.5 misses",
      );
    },
  );

});

/* ============================ ABI v22 ============================ */

test("v22 SSO-string + zero-tail init fixed edges (VA 0x0084da20..0x0084dac2)", () => {
  const poison = 0xaaaaaaaa;
  const seed = new Array(PLAYERHUD_84DA20_OBJECT_SIZE / 4).fill(poison);
  const out = playerHud84da20Init(seed);

  assert.equal(out.length, 26);
  assert.equal(out[0], 0);
  assert.equal(out[1], poison); /* +4 not stored */
  assert.equal(out[2], poison); /* +8 not stored */
  assert.equal(out[3], poison); /* +c not stored */
  assert.equal(out[4], 0); /* +0x10 size */
  assert.equal(out[5], 0xf); /* +0x14 SSO cap */
  for (let i = 6; i < 26; i++) {
    assert.equal(out[i], 0, `tail dword ${i}`);
  }

  /* Empty seed: +4/+8/+c stay 0. */
  const z = playerHud84da20Init();
  assert.equal(z[1], 0);
  assert.equal(z[5], 0xf);

  assert.equal(playerHud84da20WritesDword(0), 1);
  assert.equal(playerHud84da20WritesDword(4), 0);
  assert.equal(playerHud84da20WritesDword(8), 0);
  assert.equal(playerHud84da20WritesDword(0xc), 0);
  assert.equal(playerHud84da20WritesDword(0x10), 1);
  assert.equal(playerHud84da20WritesDword(0x14), 1);
  assert.equal(playerHud84da20WritesDword(0x18), 1);
  assert.equal(playerHud84da20WritesDword(0x64), 1);
  assert.equal(playerHud84da20WritesDword(0x68), 0);
  assert.equal(playerHud84da20WritesDword(1), 0); /* unaligned */
  assert.equal(playerHud84da20WritesDword(0xffffffff), 0);

  assert.equal(PLAYERHUD_84DA20_OBJECT_SIZE, 0x68);
  assert.equal(PLAYERHUD_84DA20_SSO_SIZE_OFF, 0x10);
  assert.equal(PLAYERHUD_84DA20_SSO_CAP_OFF, 0x14);
  assert.equal(PLAYERHUD_84DA20_SSO_CAPACITY, 0xf);
  assert.equal(PLAYERHUD_84DA20_TAIL_BEGIN, 0x18);
  assert.equal(PLAYERHUD_84DA20_TAIL_LAST, 0x64);
  assert.equal(PLAYERHUD_84DA20_RET_VA, 0x0084dac2);
  assert.equal(PLAYERHUD_84DA20_NEXT_VA, 0x0084dad0);
  assert.equal(playerHud84da20NextVa(), 0x0084dad0);
});

test("v22 Wasm ≡ JS — SSO-string + zero-tail init (high-bit randomized)", () => {
  const exp = loadExports();
  const base = 0x10000;
  const bytes = PLAYERHUD_84DA20_OBJECT_SIZE;
  if (exp.memory.buffer.byteLength < base + bytes) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84da20ObjectSize(), PLAYERHUD_84DA20_OBJECT_SIZE);
  assert.equal(exp.hud84da20SsoCapacity(), PLAYERHUD_84DA20_SSO_CAPACITY);
  assert.equal(exp.hud84da20NextVa() >>> 0, PLAYERHUD_84DA20_NEXT_VA);

  const call = (seed) => {
    for (let i = 0; i < 26; i++) {
      view.setUint32(base + i * 4, seed[i] >>> 0, true);
    }
    exp.hud84da20Init(base);
    const out = [];
    for (let i = 0; i < 26; i++) {
      out.push(view.getUint32(base + i * 4, true));
    }
    return out;
  };

  const poison = new Array(26).fill(0xaaaaaaaa);
  const js = playerHud84da20Init(poison);
  const w = call(poison);
  assert.deepEqual(w, js);

  let rng = (0x84da20 ^ 0x22) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  for (let iter = 0; iter < 4000; iter += 1) {
    const seed = Array.from({ length: 26 }, () => next());
    const j = playerHud84da20Init(seed);
    const c = call(seed);
    assert.deepEqual(c, j, `init iter=${iter}`);
    const off = next();
    assert.equal(
      exp.hud84da20WritesDword(off),
      playerHud84da20WritesDword(off),
      `writes iter=${iter} off=${off >>> 0}`,
    );
  }

  /* Unaligned + out-of-range offsets. */
  for (const off of [0, 1, 4, 8, 0xc, 0x10, 0x14, 0x18, 0x64, 0x68,
    0x6c, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84da20WritesDword(off),
      playerHud84da20WritesDword(off),
      `writes off=${off >>> 0}`,
    );
  }
});

test("v22 mutation checks: SSO hole, capacity, tail last", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x10000;
  const poison = 0xaaaaaaaa;
  const seedAndRead = (wasm) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x68) wasm.memory.grow(1);
    for (let i = 0; i < 26; i++) {
      v.setUint32(base + i * 4, poison, true);
    }
    const fn = wasm.isaac_playerhud_84da20_init
      ?? wasm._isaac_playerhud_84da20_init;
    fn(base);
    return v;
  };

  /* M33: also zero +4 — PE leaves SSO tail. */
  withMutant(
    "  obj[0] = 0;",
    "  obj[0] = 0;\n  obj[1] = 0;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 4, true),
        0,
        "M33 must diverge: PE leaves +4; mutant zeros it",
      );
    },
  );

  /* M34: capacity 0x10 not 0xf — PE SSO cap is 15. */
  withMutant(
    "      ISAAC_PLAYERHUD_84DA20_SSO_CAPACITY;",
    "      0x10u;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0x14, true),
        0x10,
        "M34 must diverge: PE writes 0xf at +0x14; mutant writes 0x10",
      );
    },
  );

  /* M35: drop last tail store +0x64. */
  withMutant(
    "       off <= ISAAC_PLAYERHUD_84DA20_TAIL_LAST; off += 4u) {",
    "       off < ISAAC_PLAYERHUD_84DA20_TAIL_LAST; off += 4u) {",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0x64, true),
        poison,
        "M35 must diverge: PE zeros +0x64; mutant leaves seed",
      );
    },
  );
});

/* ============================ ABI v23 ============================ */

test("v23 SEH ctor prefix stores fixed edges (VA 0x0084dad0..0x0084db86)", () => {
  const poison = 0xaaaaaaaa;
  const seed = new Array(PLAYERHUD_84DAD0_OBJECT_SIZE / 4).fill(poison);
  const out = playerHud84dad0Init(seed);

  assert.equal(out.length, 18);
  assert.equal(out[0], 0);
  assert.equal(out[1], 0); /* +4 dword zero */
  assert.equal(out[2], 0); /* +8 dword + byte */
  assert.equal(out[3], poison); /* +0xc SSO tail not stored */
  assert.equal(out[4], poison); /* +0x10 not stored */
  assert.equal(out[5], poison); /* +0x14 not stored */
  assert.equal(out[6], 0); /* +0x18 size */
  assert.equal(out[7], 0xf); /* +0x1c SSO cap */
  for (let i = 8; i <= 16; i++) {
    assert.equal(out[i], 0, `tail dword ${i}`);
  }
  assert.equal(out[17], 0xaaaaaa00); /* +0x44 low byte only */

  const z = playerHud84dad0Init();
  assert.equal(z[3], 0);
  assert.equal(z[7], 0xf);
  assert.equal(z[17], 0);

  assert.equal(playerHud84dad0WritesDword(0), 1);
  assert.equal(playerHud84dad0WritesDword(4), 1);
  assert.equal(playerHud84dad0WritesDword(8), 1);
  assert.equal(playerHud84dad0WritesDword(0xc), 0);
  assert.equal(playerHud84dad0WritesDword(0x10), 0);
  assert.equal(playerHud84dad0WritesDword(0x14), 0);
  assert.equal(playerHud84dad0WritesDword(0x18), 1);
  assert.equal(playerHud84dad0WritesDword(0x1c), 1);
  assert.equal(playerHud84dad0WritesDword(0x20), 1);
  assert.equal(playerHud84dad0WritesDword(0x40), 1);
  assert.equal(playerHud84dad0WritesDword(0x44), 0);
  assert.equal(playerHud84dad0WritesDword(0x48), 0);
  assert.equal(playerHud84dad0WritesDword(1), 0);
  assert.equal(playerHud84dad0WritesDword(0xffffffff), 0);

  assert.equal(playerHud84dad0WritesByte(8), 1);
  assert.equal(playerHud84dad0WritesByte(0x44), 1);
  assert.equal(playerHud84dad0WritesByte(0), 0);
  assert.equal(playerHud84dad0WritesByte(0x40), 0);

  assert.equal(PLAYERHUD_84DAD0_OBJECT_SIZE, 0x48);
  assert.equal(PLAYERHUD_84DAD0_SSO_OFF, 0x8);
  assert.equal(PLAYERHUD_84DAD0_SSO_SIZE_OFF, 0x18);
  assert.equal(PLAYERHUD_84DAD0_SSO_CAP_OFF, 0x1c);
  assert.equal(PLAYERHUD_84DAD0_SSO_CAPACITY, PLAYERHUD_84DA20_SSO_CAPACITY);
  assert.equal(PLAYERHUD_84DAD0_TAIL_BEGIN, 0x20);
  assert.equal(PLAYERHUD_84DAD0_TAIL_LAST, 0x40);
  assert.equal(PLAYERHUD_84DAD0_FLAG_BYTE_OFF, 0x44);
  assert.equal(PLAYERHUD_84DAD0_HOST_THIS_OFF, 0x48);
  assert.equal(PLAYERHUD_84DAD0_HOST_VA, 0x006efa40);
  assert.equal(PLAYERHUD_84DAD0_RET_VA, 0x0084db86);
  assert.equal(PLAYERHUD_84DAD0_NEXT_VA, 0x0084db90);
  assert.equal(playerHud84dad0HostVa(), 0x006efa40);
  assert.equal(playerHud84dad0HostThisOff(), 0x48);
  assert.equal(playerHud84dad0NextVa(), 0x0084db90);
});

test("v23 Wasm ≡ JS — SEH ctor prefix stores (high-bit randomized)", () => {
  const exp = loadExports();
  const base = 0x10000;
  const bytes = PLAYERHUD_84DAD0_OBJECT_SIZE;
  if (exp.memory.buffer.byteLength < base + bytes) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84dad0ObjectSize(), PLAYERHUD_84DAD0_OBJECT_SIZE);
  assert.equal(exp.hud84dad0SsoCapacity(), PLAYERHUD_84DAD0_SSO_CAPACITY);
  assert.equal(exp.hud84dad0HostVa() >>> 0, PLAYERHUD_84DAD0_HOST_VA);
  assert.equal(exp.hud84dad0HostThisOff(), PLAYERHUD_84DAD0_HOST_THIS_OFF);
  assert.equal(exp.hud84dad0NextVa() >>> 0, PLAYERHUD_84DAD0_NEXT_VA);

  const call = (seed) => {
    for (let i = 0; i < 18; i++) {
      view.setUint32(base + i * 4, seed[i] >>> 0, true);
    }
    exp.hud84dad0Init(base);
    const out = [];
    for (let i = 0; i < 18; i++) {
      out.push(view.getUint32(base + i * 4, true));
    }
    return out;
  };

  const poison = new Array(18).fill(0xaaaaaaaa);
  assert.deepEqual(call(poison), playerHud84dad0Init(poison));

  let rng = (0x84dad0 ^ 0x23) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  for (let iter = 0; iter < 4000; iter += 1) {
    const seed = Array.from({ length: 18 }, () => next());
    assert.deepEqual(call(seed), playerHud84dad0Init(seed), `init iter=${iter}`);
    const off = next();
    assert.equal(
      exp.hud84dad0WritesDword(off),
      playerHud84dad0WritesDword(off),
      `writes dword iter=${iter} off=${off >>> 0}`,
    );
    assert.equal(
      exp.hud84dad0WritesByte(off),
      playerHud84dad0WritesByte(off),
      `writes byte iter=${iter} off=${off >>> 0}`,
    );
  }

  for (const off of [0, 1, 4, 8, 0xc, 0x10, 0x14, 0x18, 0x1c, 0x20, 0x40,
    0x44, 0x48, 0x4c, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84dad0WritesDword(off),
      playerHud84dad0WritesDword(off),
      `writes dword off=${off >>> 0}`,
    );
    assert.equal(
      exp.hud84dad0WritesByte(off),
      playerHud84dad0WritesByte(off),
      `writes byte off=${off >>> 0}`,
    );
  }
});

test("v23 mutation checks: SSO hole, capacity, tail last", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x10000;
  const poison = 0xaaaaaaaa;
  const seedAndRead = (wasm) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x48) wasm.memory.grow(1);
    for (let i = 0; i < 18; i++) {
      v.setUint32(base + i * 4, poison, true);
    }
    const fn = wasm.isaac_playerhud_84dad0_init
      ?? wasm._isaac_playerhud_84dad0_init;
    fn(base);
    return v;
  };

  /* M36: also zero +0xc — PE leaves SSO tail. */
  withMutant(
    "  obj[ISAAC_PLAYERHUD_84DAD0_SSO_SIZE_OFF / 4u] = 0;",
    "  obj[3] = 0;\n  obj[ISAAC_PLAYERHUD_84DAD0_SSO_SIZE_OFF / 4u] = 0;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0xc, true),
        0,
        "M36 must diverge: PE leaves +0xc; mutant zeros it",
      );
    },
  );

  /* M37: capacity 0x10 not 0xf — PE SSO cap is 15. */
  withMutant(
    "      ISAAC_PLAYERHUD_84DAD0_SSO_CAPACITY;",
    "      0x10u;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0x1c, true),
        0x10,
        "M37 must diverge: PE writes 0xf at +0x1c; mutant writes 0x10",
      );
    },
  );

  /* M38: drop last tail store +0x40. */
  withMutant(
    "       off <= ISAAC_PLAYERHUD_84DAD0_TAIL_LAST; off += 4u) {",
    "       off < ISAAC_PLAYERHUD_84DAD0_TAIL_LAST; off += 4u) {",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0x40, true),
        poison,
        "M38 must diverge: PE zeros +0x40; mutant leaves seed",
      );
    },
  );
});

/* ============================ ABI v24 ============================ */

test("v24 4-subobject dtor host plan fixed edges (VA 0x0084db90..0x0084dbaf)", () => {
  const p = playerHud84db90Plan();
  assert.equal(p.callCount, 4);
  assert.equal(p.hostVa0, 0x008562b0);
  assert.equal(p.thisOff0, 0x38);
  assert.equal(p.hostVa1, 0x008562b0);
  assert.equal(p.thisOff1, 0x2c);
  assert.equal(p.hostVa2, 0x008562b0);
  assert.equal(p.thisOff2, 0x20);
  assert.equal(p.hostVa3, 0x0040d040);
  assert.equal(p.thisOff3, PLAYERHUD_84DAD0_SSO_OFF);
  assert.equal(p.tailJmp, 1);
  assert.equal(p.nextVa, 0x0084dbc0);

  assert.equal(playerHud84db90CallCount(), 4);
  assert.deepEqual(PLAYERHUD_84DB90_THIS_OFFS, [0x38, 0x2c, 0x20, 8]);
  assert.equal(playerHud84db90ThisOffAt(0), 0x38);
  assert.equal(playerHud84db90ThisOffAt(1), 0x2c);
  assert.equal(playerHud84db90ThisOffAt(2), 0x20);
  assert.equal(playerHud84db90ThisOffAt(3), 8);
  assert.equal(playerHud84db90ThisOffAt(4), 0);
  assert.equal(playerHud84db90ThisOffAt(0xffffffff), 0);

  assert.equal(playerHud84db90HostVaAt(0), 0x008562b0);
  assert.equal(playerHud84db90HostVaAt(1), 0x008562b0);
  assert.equal(playerHud84db90HostVaAt(2), 0x008562b0);
  assert.equal(playerHud84db90HostVaAt(3), 0x0040d040);
  assert.equal(playerHud84db90HostVaAt(4), 0);
  assert.equal(playerHud84db90HostVaAt(0x80000000), 0);

  assert.equal(playerHud84db90IsTailJmp(0), 0);
  assert.equal(playerHud84db90IsTailJmp(2), 0);
  assert.equal(playerHud84db90IsTailJmp(3), 1);
  assert.equal(playerHud84db90IsTailJmp(4), 0);

  assert.equal(PLAYERHUD_84DB90_VA, 0x0084db90);
  assert.equal(PLAYERHUD_84DB90_TAIL_VA, 0x0084dbaf);
  assert.equal(PLAYERHUD_84DB90_CALL_COUNT, 4);
  assert.equal(PLAYERHUD_84DB90_SUB_COUNT, 3);
  assert.equal(PLAYERHUD_84DB90_SUB_STRIDE, 0xc);
  assert.equal(PLAYERHUD_84DB90_HOST_VA_SUB, 0x008562b0);
  assert.equal(PLAYERHUD_84DB90_HOST_VA_STRING, 0x0040d040);
  assert.equal(PLAYERHUD_84DB90_NEXT_VA, 0x0084dbc0);
  assert.equal(playerHud84db90NextVa(), 0x0084dbc0);

  /* 84dad0 layout by reference: SSO +8 is string tidy this;
     tail 0x20..0x40 is three 0xc subs, destroyed high-to-low. */
  assert.equal(PLAYERHUD_84DAD0_SSO_OFF, 8);
  assert.equal(PLAYERHUD_84DAD0_TAIL_BEGIN, 0x20);
  assert.equal(PLAYERHUD_84DAD0_TAIL_LAST, 0x40);
  assert.equal(0x40 - 0x20 + 4, 0xc * 3);
});

test("v24 Wasm ≡ JS — 4-subobject dtor host plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x40) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84db90CallCount(), PLAYERHUD_84DB90_CALL_COUNT);
  assert.equal(exp.hud84db90NextVa() >>> 0, PLAYERHUD_84DB90_NEXT_VA);

  const js = playerHud84db90Plan();
  exp.hud84db90Plan(base);
  assert.equal(view.getInt32(base + 0, true), js.callCount);
  assert.equal(view.getUint32(base + 4, true), js.hostVa0);
  assert.equal(view.getInt32(base + 8, true), js.thisOff0);
  assert.equal(view.getUint32(base + 12, true), js.hostVa1);
  assert.equal(view.getInt32(base + 16, true), js.thisOff1);
  assert.equal(view.getUint32(base + 20, true), js.hostVa2);
  assert.equal(view.getInt32(base + 24, true), js.thisOff2);
  assert.equal(view.getUint32(base + 28, true), js.hostVa3);
  assert.equal(view.getInt32(base + 32, true), js.thisOff3);
  assert.equal(view.getInt32(base + 36, true), js.tailJmp);
  assert.equal(view.getUint32(base + 40, true), js.nextVa);

  for (const i of [0, 1, 2, 3, 4, 5, 0x1f, 0x100, 0x7fffffff,
    0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84db90ThisOffAt(i) >>> 0,
      playerHud84db90ThisOffAt(i),
      `this_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84db90HostVaAt(i) >>> 0,
      playerHud84db90HostVaAt(i),
      `host_va i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84db90IsTailJmp(i) | 0,
      playerHud84db90IsTailJmp(i),
      `tail_jmp i=${i >>> 0}`,
    );
  }
});

test("v24 mutation checks: call order, tail VA, next VA", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M39: first this-off 0x2c not 0x38 — PE first lea is +0x38. */
  withMutant(
    "  out->this_off_0 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_0;",
    "  out->this_off_0 = ISAAC_PLAYERHUD_84DB90_THIS_OFF_1;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84db90_plan
        ?? wasm._isaac_playerhud_84db90_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x30) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getInt32(base + 8, true),
        0x2c,
        "M39 must diverge: PE first this-off is +0x38; mutant writes +0x2c",
      );
    },
  );

  /* M40: last host VA is 0x8562b0 not 0x40d040 — PE e9 is string tidy. */
  withMutant(
    "  out->host_va_3 = ISAAC_PLAYERHUD_84DB90_HOST_VA_STRING;",
    "  out->host_va_3 = ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84db90_plan
        ?? wasm._isaac_playerhud_84db90_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x30) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 28, true),
        0x008562b0,
        "M40 must diverge: PE last host is 0x40d040; mutant writes 0x8562b0",
      );
    },
  );

  /* M41: next VA 0x84dc00 not 0x84dbc0 — PE next body is sibling dtor. */
  withMutant(
    "  out->next_va = ISAAC_PLAYERHUD_84DB90_NEXT_VA;",
    "  out->next_va = 0x0084dc00u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84db90_plan
        ?? wasm._isaac_playerhud_84db90_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x30) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 40, true),
        0x0084dc00,
        "M41 must diverge: PE next is 0x84dbc0; mutant writes 0x84dc00",
      );
    },
  );
});

/* ============================ ABI v25 ============================ */

test("v25 7-subobject dtor host plan fixed edges (VA 0x0084dbc0..0x0084dbf6)", () => {
  const p = playerHud84dbc0Plan();
  assert.equal(p.callCount, 7);
  assert.equal(p.hostVa0, 0x004149d0);
  assert.equal(p.thisOff0, 0x54);
  assert.equal(p.hostVa1, 0x004149d0);
  assert.equal(p.thisOff1, 0x48);
  assert.equal(p.hostVa2, 0x004149d0);
  assert.equal(p.thisOff2, 0x3c);
  assert.equal(p.hostVa3, 0x004149d0);
  assert.equal(p.thisOff3, 0x30);
  assert.equal(p.hostVa4, 0x004149d0);
  assert.equal(p.thisOff4, 0x24);
  assert.equal(p.hostVa5, 0x004149d0);
  assert.equal(p.thisOff5, 0x18);
  assert.equal(p.hostVa6, 0x0040d040);
  assert.equal(p.thisOff6, 0);
  assert.equal(p.tailJmp, 1);
  assert.equal(p.nextVa, 0x0084dc00);

  assert.equal(playerHud84dbc0CallCount(), 7);
  assert.deepEqual(PLAYERHUD_84DBC0_THIS_OFFS, [0x54, 0x48, 0x3c, 0x30, 0x24, 0x18, 0]);
  assert.equal(playerHud84dbc0ThisOffAt(0), 0x54);
  assert.equal(playerHud84dbc0ThisOffAt(1), 0x48);
  assert.equal(playerHud84dbc0ThisOffAt(2), 0x3c);
  assert.equal(playerHud84dbc0ThisOffAt(3), 0x30);
  assert.equal(playerHud84dbc0ThisOffAt(4), 0x24);
  assert.equal(playerHud84dbc0ThisOffAt(5), 0x18);
  assert.equal(playerHud84dbc0ThisOffAt(6), 0);
  assert.equal(playerHud84dbc0ThisOffAt(7), 0);
  assert.equal(playerHud84dbc0ThisOffAt(0xffffffff), 0);

  assert.equal(playerHud84dbc0HostVaAt(0), 0x004149d0);
  assert.equal(playerHud84dbc0HostVaAt(1), 0x004149d0);
  assert.equal(playerHud84dbc0HostVaAt(5), 0x004149d0);
  assert.equal(playerHud84dbc0HostVaAt(6), 0x0040d040);
  assert.equal(playerHud84dbc0HostVaAt(7), 0);
  assert.equal(playerHud84dbc0HostVaAt(0x80000000), 0);

  assert.equal(playerHud84dbc0IsTailJmp(0), 0);
  assert.equal(playerHud84dbc0IsTailJmp(5), 0);
  assert.equal(playerHud84dbc0IsTailJmp(6), 1);
  assert.equal(playerHud84dbc0IsTailJmp(7), 0);

  assert.equal(PLAYERHUD_84DBC0_VA, 0x0084dbc0);
  assert.equal(PLAYERHUD_84DBC0_TAIL_VA, 0x0084dbf6);
  assert.equal(PLAYERHUD_84DBC0_CALL_COUNT, 7);
  assert.equal(PLAYERHUD_84DBC0_SUB_COUNT, 6);
  assert.equal(PLAYERHUD_84DBC0_SUB_STRIDE, 0xc);
  assert.equal(PLAYERHUD_84DBC0_HOST_VA_SUB, 0x004149d0);
  assert.equal(PLAYERHUD_84DBC0_HOST_VA_STRING, 0x0040d040);
  assert.equal(PLAYERHUD_84DBC0_NEXT_VA, 0x0084dc00);
  assert.equal(playerHud84dbc0NextVa(), 0x0084dc00);
});

test("v25 Wasm ≡ JS — 7-subobject dtor host plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x50) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84dbc0CallCount(), PLAYERHUD_84DBC0_CALL_COUNT);
  assert.equal(exp.hud84dbc0NextVa() >>> 0, PLAYERHUD_84DBC0_NEXT_VA);

  const js = playerHud84dbc0Plan();
  exp.hud84dbc0Plan(base);
  assert.equal(view.getInt32(base + 0, true), js.callCount);
  assert.equal(view.getUint32(base + 4, true), js.hostVa0);
  assert.equal(view.getInt32(base + 8, true), js.thisOff0);
  assert.equal(view.getUint32(base + 12, true), js.hostVa1);
  assert.equal(view.getInt32(base + 16, true), js.thisOff1);
  assert.equal(view.getUint32(base + 20, true), js.hostVa2);
  assert.equal(view.getInt32(base + 24, true), js.thisOff2);
  assert.equal(view.getUint32(base + 28, true), js.hostVa3);
  assert.equal(view.getInt32(base + 32, true), js.thisOff3);
  assert.equal(view.getUint32(base + 36, true), js.hostVa4);
  assert.equal(view.getInt32(base + 40, true), js.thisOff4);
  assert.equal(view.getUint32(base + 44, true), js.hostVa5);
  assert.equal(view.getInt32(base + 48, true), js.thisOff5);
  assert.equal(view.getUint32(base + 52, true), js.hostVa6);
  assert.equal(view.getInt32(base + 56, true), js.thisOff6);
  assert.equal(view.getInt32(base + 60, true), js.tailJmp);
  assert.equal(view.getUint32(base + 64, true), js.nextVa);

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 0x1f, 0x100, 0x7fffffff,
    0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84dbc0ThisOffAt(i) >>> 0,
      playerHud84dbc0ThisOffAt(i),
      `this_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84dbc0HostVaAt(i) >>> 0,
      playerHud84dbc0HostVaAt(i),
      `host_va i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84dbc0IsTailJmp(i) | 0,
      playerHud84dbc0IsTailJmp(i),
      `tail_jmp i=${i >>> 0}`,
    );
  }
});

test("v25 mutation checks: call order, tail VA, next VA", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M42: first this-off 0x48 not 0x54 — PE first lea is +0x54. */
  withMutant(
    "  out->this_off_0 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_0;",
    "  out->this_off_0 = ISAAC_PLAYERHUD_84DBC0_THIS_OFF_1;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84dbc0_plan
        ?? wasm._isaac_playerhud_84dbc0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x50) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getInt32(base + 8, true),
        0x48,
        "M42 must diverge: PE first this-off is +0x54; mutant writes +0x48",
      );
    },
  );

  /* M43: last host VA is 0x4149d0 not 0x40d040 — PE e9 is string tidy. */
  withMutant(
    "  out->host_va_6 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_STRING;",
    "  out->host_va_6 = ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84dbc0_plan
        ?? wasm._isaac_playerhud_84dbc0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x50) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 52, true),
        0x004149d0,
        "M43 must diverge: PE last host is 0x40d040; mutant writes 0x4149d0",
      );
    },
  );

  /* M44: next VA 0x84dc40 not 0x84dc00 — PE next body is sibling. */
  withMutant(
    "  out->next_va = ISAAC_PLAYERHUD_84DBC0_NEXT_VA;",
    "  out->next_va = 0x0084dc40u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84dbc0_plan
        ?? wasm._isaac_playerhud_84dbc0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x50) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 64, true),
        0x0084dc40,
        "M44 must diverge: PE next is 0x84dc00; mutant writes 0x84dc40",
      );
    },
  );
});

/* ============================ ABI v26 ============================ */

test("v26 range wipe host plan fixed edges (VA 0x00856840..0x00856893)", () => {
  assert.equal(playerHud856840Needed(0, 0), 0);
  assert.equal(playerHud856840Needed(0x100, 0x100), 0);
  assert.equal(playerHud856840Needed(0xffffffff, 0xffffffff), 0);
  assert.equal(playerHud856840Needed(0, 0x68), 1);
  assert.equal(playerHud856840Needed(0x100, 0), 1);
  assert.equal(playerHud856840Needed(0xffffffff, 0), 1);
  assert.equal(playerHud856840Needed(0, 0xffffffff), 1);

  assert.equal(playerHud856840Count(0, 0), 0);
  assert.equal(playerHud856840Count(0x100, 0x100), 0);
  assert.equal(playerHud856840Count(0, 0x68), 1);
  assert.equal(playerHud856840Count(0, 0xd0), 2);
  assert.equal(playerHud856840Count(0x100, 0x1d0), 2);
  assert.equal(playerHud856840Count(0x68, 0), 0);
  assert.equal(playerHud856840Count(0, 0x67), 0);
  assert.equal(playerHud856840Count(0, 0x69), 0);
  assert.equal(playerHud856840Count(0xffffffff, 0), 0);

  const p = playerHud856840Plan();
  assert.equal(p.callCount, 7);
  assert.equal(p.hostVa0, 0x004149d0);
  assert.equal(p.thisOff0, 0x54);
  assert.equal(p.hostVa1, 0x004149d0);
  assert.equal(p.thisOff1, 0x48);
  assert.equal(p.hostVa2, 0x004149d0);
  assert.equal(p.thisOff2, 0x3c);
  assert.equal(p.hostVa3, 0x004149d0);
  assert.equal(p.thisOff3, 0x30);
  assert.equal(p.hostVa4, 0x004149d0);
  assert.equal(p.thisOff4, 0x24);
  assert.equal(p.hostVa5, 0x004149d0);
  assert.equal(p.thisOff5, 0x18);
  assert.equal(p.hostVa6, 0x0040d040);
  assert.equal(p.thisOff6, 0);
  assert.equal(p.stride, 0x68);
  assert.equal(p.nextVa, 0x008568a0);

  assert.equal(playerHud856840CallCount(), 7);
  assert.deepEqual(PLAYERHUD_856840_THIS_OFFS, PLAYERHUD_84DBC0_THIS_OFFS);
  assert.deepEqual(PLAYERHUD_856840_THIS_OFFS, [0x54, 0x48, 0x3c, 0x30, 0x24, 0x18, 0]);
  assert.equal(playerHud856840ThisOffAt(0), 0x54);
  assert.equal(playerHud856840ThisOffAt(1), 0x48);
  assert.equal(playerHud856840ThisOffAt(2), 0x3c);
  assert.equal(playerHud856840ThisOffAt(3), 0x30);
  assert.equal(playerHud856840ThisOffAt(4), 0x24);
  assert.equal(playerHud856840ThisOffAt(5), 0x18);
  assert.equal(playerHud856840ThisOffAt(6), 0);
  assert.equal(playerHud856840ThisOffAt(7), 0);
  assert.equal(playerHud856840ThisOffAt(0xffffffff), 0);

  assert.equal(playerHud856840HostVaAt(0), 0x004149d0);
  assert.equal(playerHud856840HostVaAt(5), 0x004149d0);
  assert.equal(playerHud856840HostVaAt(6), 0x0040d040);
  assert.equal(playerHud856840HostVaAt(7), 0);
  assert.equal(playerHud856840HostVaAt(0x80000000), 0);

  assert.equal(PLAYERHUD_856840_VA, 0x00856840);
  assert.equal(PLAYERHUD_856840_RET_VA, 0x00856893);
  assert.equal(PLAYERHUD_856840_CALL_COUNT, PLAYERHUD_84DBC0_CALL_COUNT);
  assert.equal(PLAYERHUD_856840_STRIDE, PLAYERHUD_84DA20_OBJECT_SIZE);
  assert.equal(PLAYERHUD_856840_HOST_VA_SUB, PLAYERHUD_84DBC0_HOST_VA_SUB);
  assert.equal(PLAYERHUD_856840_HOST_VA_STRING, PLAYERHUD_84DBC0_HOST_VA_STRING);
  assert.equal(PLAYERHUD_856840_NEXT_VA, 0x008568a0);
  assert.equal(playerHud856840Stride(), 0x68);
  assert.equal(playerHud856840NextVa(), 0x008568a0);
});

test("v26 Wasm ≡ JS — range wipe needed/count/plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x50) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud856840CallCount(), PLAYERHUD_856840_CALL_COUNT);
  assert.equal(exp.hud856840Stride() >>> 0, PLAYERHUD_856840_STRIDE);
  assert.equal(exp.hud856840NextVa() >>> 0, PLAYERHUD_856840_NEXT_VA);

  const pairs = [
    [0, 0],
    [0x100, 0x100],
    [0, 0x68],
    [0, 0xd0],
    [0x100, 0x1d0],
    [0x68, 0],
    [0, 0x67],
    [0, 0x69],
    [0xffffffff, 0],
    [0, 0xffffffff],
    [0xffffffff, 0xffffffff],
    [0x100, 0],
  ];
  for (const [begin, end] of pairs) {
    assert.equal(
      exp.hud856840Needed(begin, end) | 0,
      playerHud856840Needed(begin, end),
      `needed begin=${begin >>> 0} end=${end >>> 0}`,
    );
    assert.equal(
      exp.hud856840Count(begin, end) >>> 0,
      playerHud856840Count(begin, end),
      `count begin=${begin >>> 0} end=${end >>> 0}`,
    );
  }

  const js = playerHud856840Plan();
  exp.hud856840Plan(base);
  assert.equal(view.getInt32(base + 0, true), js.callCount);
  assert.equal(view.getUint32(base + 4, true), js.hostVa0);
  assert.equal(view.getInt32(base + 8, true), js.thisOff0);
  assert.equal(view.getUint32(base + 12, true), js.hostVa1);
  assert.equal(view.getInt32(base + 16, true), js.thisOff1);
  assert.equal(view.getUint32(base + 20, true), js.hostVa2);
  assert.equal(view.getInt32(base + 24, true), js.thisOff2);
  assert.equal(view.getUint32(base + 28, true), js.hostVa3);
  assert.equal(view.getInt32(base + 32, true), js.thisOff3);
  assert.equal(view.getUint32(base + 36, true), js.hostVa4);
  assert.equal(view.getInt32(base + 40, true), js.thisOff4);
  assert.equal(view.getUint32(base + 44, true), js.hostVa5);
  assert.equal(view.getInt32(base + 48, true), js.thisOff5);
  assert.equal(view.getUint32(base + 52, true), js.hostVa6);
  assert.equal(view.getInt32(base + 56, true), js.thisOff6);
  assert.equal(view.getUint32(base + 60, true), js.stride);
  assert.equal(view.getUint32(base + 64, true), js.nextVa);

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 0x1f, 0x100, 0x7fffffff,
    0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud856840ThisOffAt(i) >>> 0,
      playerHud856840ThisOffAt(i),
      `this_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud856840HostVaAt(i) >>> 0,
      playerHud856840HostVaAt(i),
      `host_va i=${i >>> 0}`,
    );
  }
});

test("v26 mutation checks: needed signed < vs !=", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M45: needed uses signed < not != — equal-high and wrap pairs must FAIL. */
  withMutant(
    "  return begin != end ? 1 : 0;",
    "  return (int32_t)begin < (int32_t)end ? 1 : 0;",
    (wasm) => {
      const needed = wasm.isaac_playerhud_856840_needed
        ?? wasm._isaac_playerhud_856840_needed;
      assert.equal(
        needed(0xffffffff, 0xffffffff) | 0,
        0,
        "M45 equal-high still 0 under signed <",
      );
      assert.equal(
        needed(0, 0xffffffff) | 0,
        0,
        "M45 must diverge: wrap pair needed under !=, no-op under signed <",
      );
      assert.equal(
        needed(0x80000000, 0x80000000) | 0,
        0,
        "M45 equal-high 0x80000000 stays 0",
      );
    },
  );
});



/* ============================ ABI v27 ============================ */

test("v27 FUN_0084dea0/FUN_0084e200 GATE/PLAN fixed edges", () => {
  assert.equal(playerHud84dea0Needed(0), 0);
  assert.equal(playerHud84dea0Needed(1), 1);
  assert.equal(playerHud84dea0Needed(0x100), 1);
  assert.equal(playerHud84dea0Needed(0xffffffff), 1);
  assert.equal(playerHud84dea0Needed(0x80000000), 1);

  const p = playerHud84dea0Plan();
  assert.equal(p.callCount, 6);
  assert.equal(p.hostVa, 0x0084dc00);
  assert.equal(p.gateOff, 4);
  assert.equal(p.playerPtrOff, PLAYERHUD_84E9D0_PLAYER_PTR_OFF);
  assert.equal(p.slotCount, PLAYERHUD_84E9D0_SLOT_COUNT);
  assert.equal(p.slotStride, PLAYERHUD_84E9D0_SLOT_STRIDE);
  assert.deepEqual(PLAYERHUD_84DEA0_XMM1_OFFS, [0x50, 0x64, 0x78, 0x8c, 0xa0, 0xb4]);
  assert.equal(p.xmm1Off0, 0x50);
  assert.equal(p.xmm1Off1, 0x64);
  assert.equal(p.xmm1Off2, 0x78);
  assert.equal(p.xmm1Off3, 0x8c);
  assert.equal(p.xmm1Off4, 0xa0);
  assert.equal(p.xmm1Off5, 0xb4);
  assert.equal(p.labelVa0, 0x00b6e274);
  assert.equal(p.labelVa1, 0x00b6e2e4);
  assert.equal(p.labelVa2, 0x00b6e2ec);
  assert.equal(p.labelVa3, 0x00b6e2d0);
  assert.equal(p.labelVa4, 0x00b6e2d8);
  assert.equal(p.labelVa5, 0x00b6e2b8);
  assert.equal(p.labelSize0, 6);
  assert.equal(p.labelSize1, 6);
  assert.equal(p.labelSize2, 7);
  assert.equal(p.labelSize3, 6);
  assert.equal(p.labelSize4, 0xb);
  assert.equal(p.labelSize5, 5);
  assert.equal(p.xorpsRdata, PLAYERHUD_84D8B0_RDATA_NEG);
  assert.equal(p.xorpsSibling, 1);
  assert.equal(p.nextVa, 0x0084e200);
  assert.equal(p.siblingNextVa, 0x0084e5b0);

  assert.equal(playerHud84dea0CallCount(), 6);
  assert.equal(playerHud84dea0HostVa() >>> 0, 0x0084dc00);
  assert.equal(playerHud84dea0NextVa() >>> 0, 0x0084e200);
  assert.equal(playerHud84e200XorpsNeeded(), 1);
  assert.equal(playerHud84e200NextVa() >>> 0, 0x0084e5b0);
  assert.equal(PLAYERHUD_84DEA0_VA, 0x0084dea0);
  assert.equal(PLAYERHUD_84DEA0_RET_VA, 0x0084e1fd);
  assert.equal(PLAYERHUD_84E200_VA, 0x0084e200);
  assert.equal(PLAYERHUD_84E200_RET_VA, 0x0084e59e);
  assert.equal(PLAYERHUD_84E200_RDATA_NEG, PLAYERHUD_84D8B0_RDATA_NEG);
  assert.equal(PLAYERHUD_84DEA0_PLAYER_PTR_OFF, PLAYERHUD_84E9D0_PLAYER_PTR_OFF);
  assert.equal(PLAYERHUD_84DEA0_SLOT_STRIDE, PLAYERHUD_84E9D0_SLOT_STRIDE);
  assert.equal(
    PLAYERHUD_84DEA0_XMM1_OFFS[0],
    PLAYERHUD_84E9D0_SLOTS_BASE + 4,
  );

  assert.equal(playerHud84dea0Xmm1OffAt(0), 0x50);
  assert.equal(playerHud84dea0Xmm1OffAt(5), 0xb4);
  assert.equal(playerHud84dea0Xmm1OffAt(6), 0);
  assert.equal(playerHud84dea0Xmm1OffAt(0xffffffff), 0);
  assert.equal(playerHud84dea0LabelVaAt(0), 0x00b6e274);
  assert.equal(playerHud84dea0LabelVaAt(5), 0x00b6e2b8);
  assert.equal(playerHud84dea0LabelVaAt(6), 0);
  assert.equal(playerHud84dea0LabelVaAt(0x80000000), 0);
  assert.equal(playerHud84dea0LabelSizeAt(2), 7);
  assert.equal(playerHud84dea0LabelSizeAt(4), 0xb);
  assert.equal(playerHud84dea0LabelSizeAt(7), 0);
});

test("v27 Wasm ≡ JS — GATE needed + six-call plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x80) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84dea0CallCount(), PLAYERHUD_84DEA0_CALL_COUNT);
  assert.equal(exp.hud84dea0HostVa() >>> 0, PLAYERHUD_84DEA0_HOST_VA);
  assert.equal(exp.hud84dea0NextVa() >>> 0, PLAYERHUD_84DEA0_NEXT_VA);
  assert.equal(exp.hud84e200XorpsNeeded() | 0, PLAYERHUD_84E200_XORPS);
  assert.equal(exp.hud84e200NextVa() >>> 0, PLAYERHUD_84E200_NEXT_VA);

  const gates = [0, 1, 0x100, 0xffffffff, 0x80000000, 4, 0x7fffffff];
  for (const g of gates) {
    assert.equal(
      exp.hud84dea0Needed(g) | 0,
      playerHud84dea0Needed(g),
      `needed this+4=${g >>> 0}`,
    );
  }

  const js = playerHud84dea0Plan();
  exp.hud84dea0Plan(base);
  assert.equal(view.getInt32(base + 0, true), js.callCount);
  assert.equal(view.getUint32(base + 4, true), js.hostVa);
  assert.equal(view.getInt32(base + 8, true), js.gateOff);
  assert.equal(view.getUint32(base + 12, true), js.playerPtrOff);
  assert.equal(view.getInt32(base + 16, true), js.slotCount);
  assert.equal(view.getUint32(base + 20, true), js.slotStride);
  assert.equal(view.getInt32(base + 24, true), js.xmm1Off0);
  assert.equal(view.getUint32(base + 28, true), js.labelVa0);
  assert.equal(view.getInt32(base + 32, true), js.labelSize0);
  assert.equal(view.getInt32(base + 36, true), js.xmm1Off1);
  assert.equal(view.getUint32(base + 40, true), js.labelVa1);
  assert.equal(view.getInt32(base + 44, true), js.labelSize1);
  assert.equal(view.getInt32(base + 48, true), js.xmm1Off2);
  assert.equal(view.getUint32(base + 52, true), js.labelVa2);
  assert.equal(view.getInt32(base + 56, true), js.labelSize2);
  assert.equal(view.getInt32(base + 60, true), js.xmm1Off3);
  assert.equal(view.getUint32(base + 64, true), js.labelVa3);
  assert.equal(view.getInt32(base + 68, true), js.labelSize3);
  assert.equal(view.getInt32(base + 72, true), js.xmm1Off4);
  assert.equal(view.getUint32(base + 76, true), js.labelVa4);
  assert.equal(view.getInt32(base + 80, true), js.labelSize4);
  assert.equal(view.getInt32(base + 84, true), js.xmm1Off5);
  assert.equal(view.getUint32(base + 88, true), js.labelVa5);
  assert.equal(view.getInt32(base + 92, true), js.labelSize5);
  assert.equal(view.getUint32(base + 96, true), js.xorpsRdata);
  assert.equal(view.getInt32(base + 100, true), js.xorpsSibling);
  assert.equal(view.getUint32(base + 104, true), js.nextVa);
  assert.equal(view.getUint32(base + 108, true), js.siblingNextVa);

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 0x1f, 0x100, 0x7fffffff,
    0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84dea0Xmm1OffAt(i) >>> 0,
      playerHud84dea0Xmm1OffAt(i),
      `xmm1_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84dea0LabelVaAt(i) >>> 0,
      playerHud84dea0LabelVaAt(i),
      `label_va i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84dea0LabelSizeAt(i) >>> 0,
      playerHud84dea0LabelSizeAt(i),
      `label_size i=${i >>> 0}`,
    );
  }
});

test("v27 mutation checks: gate !=0, xmm1+0x50, host 0x84dc00, xorps", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M46: needed uses signed > 0 not != 0 — high-bit this+4 must FAIL. */
  withMutant(
    "  return this_plus_4 != 0u ? 1 : 0;",
    "  return (int32_t)this_plus_4 > 0 ? 1 : 0;",
    (wasm) => {
      const needed = wasm.isaac_playerhud_84dea0_needed
        ?? wasm._isaac_playerhud_84dea0_needed;
      assert.equal(
        needed(0x80000000) | 0,
        0,
        "M46 must diverge: 0x80000000 needed under != 0, no-op under signed > 0",
      );
      assert.equal(
        needed(0xffffffff) | 0,
        0,
        "M46 must diverge: 0xffffffff needed under != 0, no-op under signed > 0",
      );
      assert.equal(needed(0) | 0, 0, "M46 zero stays skip");
      assert.equal(needed(1) | 0, 1, "M46 one still runs");
    },
  );

  /* M47: first xmm1-off 0x4c not 0x50 — PE first movss is [esi+0x50]. */
  withMutant(
    "  out->xmm1_off_0 = ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_0;",
    "  out->xmm1_off_0 = ISAAC_PLAYERHUD_84E9D0_SLOT_COUNT;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84dea0_plan
        ?? wasm._isaac_playerhud_84dea0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getInt32(base + 24, true),
        6,
        "M47 must diverge: PE first xmm1-off is +0x50; mutant writes slot-count 6",
      );
    },
  );

  /* M48: host VA is 0x84dea0 not 0x84dc00 — the six calls stay host. */
  withMutant(
    "  out->host_va = ISAAC_PLAYERHUD_84DEA0_HOST_VA;",
    "  out->host_va = ISAAC_PLAYERHUD_84DEA0_VA;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84dea0_plan
        ?? wasm._isaac_playerhud_84dea0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 4, true),
        0x0084dea0,
        "M48 must diverge: PE host is 0x84dc00; mutant writes parent 0x84dea0",
      );
    },
  );

  /* M49: sibling xorps-needed 0 not 1 — PE 0x84e200 xorps xmm1, [0xbacb70]. */
  withMutant(
    "  return ISAAC_PLAYERHUD_84E200_XORPS;",
    "  return 0;",
    (wasm) => {
      const xorps = wasm.isaac_playerhud_84e200_xorps_needed
        ?? wasm._isaac_playerhud_84e200_xorps_needed;
      assert.equal(
        xorps() | 0,
        0,
        "M49 must diverge: PE sibling xorps-neg is taken; mutant returns 0",
      );
    },
  );
});

/* ============================ ABI v28 ============================ */

test("v28 FUN_0084e5b0 predicate GATE/PLAN fixed edges", () => {
  /* Signed toward-zero /0x68. Magic 0x4ec4ec4f. */
  assert.equal(playerHud84e5b0Count(0, 0), 0);
  assert.equal(playerHud84e5b0Count(0, 0x68), 1);
  assert.equal(playerHud84e5b0Count(0, 0xd0), 2);
  assert.equal(playerHud84e5b0Count(0x100, 0x1d0), 2);
  assert.equal(playerHud84e5b0Count(0x68, 0), 0xffffffff);
  assert.equal(playerHud84e5b0Count(0, 0x67), 0);
  assert.equal(playerHud84e5b0Count(0xffffffff, 0x67), 1);

  /* Unsigned jae: high-bit index is out of range. */
  assert.equal(playerHud84e5b0InRange(0, 0, 0x68), 1);
  assert.equal(playerHud84e5b0InRange(1, 0, 0x68), 0);
  assert.equal(playerHud84e5b0InRange(0, 0, 0), 0);
  assert.equal(playerHud84e5b0InRange(0x80000000, 0, 0x68), 0);
  assert.equal(playerHud84e5b0InRange(0xffffffff, 0, 0xd0), 0);
  assert.equal(playerHud84e5b0InRange(0x100, 0, 0x68), 0);

  /* [this+4]==0 early-true. Full dword. Inverted v27 polarity. */
  assert.equal(playerHud84e5b0EarlyTrue(0), 1);
  assert.equal(playerHud84e5b0EarlyTrue(1), 0);
  assert.equal(playerHud84e5b0EarlyTrue(0x100), 0);
  assert.equal(playerHud84e5b0EarlyTrue(0x80000000), 0);
  assert.equal(playerHud84e5b0EarlyTrue(0xffffffff), 0);

  /* Bounds before gate. */
  assert.equal(playerHud84e5b0Prefix(0, 0, 0x68, 0), PLAYERHUD_84E5B0_PREFIX_EARLY);
  assert.equal(playerHud84e5b0Prefix(0, 0, 0x68, 1), PLAYERHUD_84E5B0_PREFIX_CONT);
  assert.equal(playerHud84e5b0Prefix(1, 0, 0x68, 0), PLAYERHUD_84E5B0_PREFIX_FAIL);
  assert.equal(playerHud84e5b0Prefix(0x80000000, 0, 0x68, 0), PLAYERHUD_84E5B0_PREFIX_FAIL);

  assert.equal(playerHud84e5b0ObjectOff(0), 0);
  assert.equal(playerHud84e5b0ObjectOff(1), 0x68);
  assert.equal(playerHud84e5b0ObjectOff(2), 0xd0);
  assert.equal(playerHud84e5b0DwordCount(0, 0x10), 4);
  assert.equal(playerHud84e5b0DwordCount(0x10, 0), 0xfffffffc);

  assert.equal(playerHud84e5b0WhitelistOk(0, 0), 1);
  assert.equal(playerHud84e5b0WhitelistOk(0, 1), 1);
  assert.equal(playerHud84e5b0WhitelistOk(1, 0), 0);
  assert.equal(playerHud84e5b0WhitelistOk(1, 1), 1);
  assert.equal(playerHud84e5b0WhitelistOk(2, 0x100), 1);
  assert.equal(playerHud84e5b0WhitelistOk(1, 0x80000000), 1);
  assert.equal(playerHud84e5b0BlacklistOk(0), 1);
  assert.equal(playerHud84e5b0BlacklistOk(1), 0);
  assert.equal(playerHud84e5b0BlacklistOk(0x100), 0);
  assert.equal(playerHud84e5b0BlacklistOk(0x80000000), 0);

  assert.equal(playerHud84e5b0CompletionPrefix(0), 1);
  assert.equal(playerHud84e5b0CompletionPrefix(0xfffffffe), 0);
  assert.equal(playerHud84e5b0CompletionPrefix(0xffffffff), 1);
  assert.equal(playerHud84e5b0CompletionPrefix(0x80000000), 1);
  assert.equal(playerHud84e5b0CompletionPrefix(0x281), 2);
  assert.equal(playerHud84e5b0CompletionPrefix(0x282), 0);
  assert.equal(playerHud84e5b0CompletionPrefix(1), 2);

  assert.equal(playerHud84e5b0ModeOk(0, 0, 0, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(1, 0, 0, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(1, 1, 0, 0), 0);
  assert.equal(playerHud84e5b0ModeOk(1, 1, 0x8000, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(1, 2, 0, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(1, 2, 0x8000, 0), 0);
  assert.equal(playerHud84e5b0ModeOk(2, 1, 0x800, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(2, 1, 0, 0), 0);
  assert.equal(playerHud84e5b0ModeOk(2, 2, 0, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(2, 2, 0x800, 0), 0);
  assert.equal(playerHud84e5b0ModeOk(3, 1, 0, 2), 1);
  assert.equal(playerHud84e5b0ModeOk(3, 1, 0, 3), 1);
  assert.equal(playerHud84e5b0ModeOk(3, 1, 0, 0), 0);
  assert.equal(playerHud84e5b0ModeOk(3, 1, 0, 1), 0);
  assert.equal(playerHud84e5b0ModeOk(3, 2, 0, 0), 1);
  assert.equal(playerHud84e5b0ModeOk(4, 1, 0, 0), 1);

  const p = playerHud84e5b0Plan();
  assert.equal(p.stride, 0x68);
  assert.equal(p.vecBeginOff, 0x2c);
  assert.equal(p.vecEndOff, 0x30);
  assert.equal(p.gateOff, PLAYERHUD_84DEA0_GATE_OFF);
  assert.equal(p.gateOff, 4);
  assert.equal(p.playerTypeOff, 0x13c0);
  assert.deepEqual(PLAYERHUD_84E5B0_VEC_OFFS, [0x18, 0x24, 0x30, 0x3c, 0x48, 0x54]);
  assert.equal(p.vecOff0, 0x18);
  assert.equal(p.vecOff5, 0x54);
  assert.equal(p.completionOff, 0x60);
  assert.equal(p.modeOff, 0x64);
  assert.equal(p.hostVaCol, 0x007706e0);
  assert.equal(p.hostVaTrk, 0x00771550);
  assert.equal(p.flagShrMode1, 0xf);
  assert.equal(p.flagShrMode2, 0xb);
  assert.equal(p.completionMax, 0x282);
  assert.equal(p.nextVa, 0x0084e820);
  assert.equal(playerHud84e5b0Stride(), PLAYERHUD_84DA20_OBJECT_SIZE);
  assert.equal(playerHud84e5b0Stride(), PLAYERHUD_856840_STRIDE);
  assert.equal(playerHud84e5b0NextVa() >>> 0, 0x0084e820);
  assert.equal(PLAYERHUD_84E5B0_VA, 0x0084e5b0);
  assert.equal(PLAYERHUD_84E5B0_RET_VA, 0x0084e81a);
  assert.equal(PLAYERHUD_84E5B0_HOST_VA_COL, PLAYERHUD_HOST_VA_HAS_COLLECTIBLE);
  assert.equal(PLAYERHUD_84E5B0_VEC_OFFS[0], PLAYERHUD_84DBC0_THIS_OFFS[5]);
  assert.equal(PLAYERHUD_84E5B0_VEC_OFFS[5], PLAYERHUD_84DBC0_THIS_OFFS[0]);
  assert.equal(playerHud84e5b0VecOffAt(0), 0x18);
  assert.equal(playerHud84e5b0VecOffAt(5), 0x54);
  assert.equal(playerHud84e5b0VecOffAt(6), 0);
  assert.equal(playerHud84e5b0VecOffAt(0xffffffff), 0);
  assert.equal(playerHud84e5b0HostVaAt(0), 0);
  assert.equal(playerHud84e5b0HostVaAt(2), 0x007706e0);
  assert.equal(playerHud84e5b0HostVaAt(3), 0x007706e0);
  assert.equal(playerHud84e5b0HostVaAt(4), 0x00771550);
  assert.equal(playerHud84e5b0HostVaAt(5), 0x00771550);
  assert.equal(playerHud84e5b0FailIfAlAt(2), 0);
  assert.equal(playerHud84e5b0FailIfAlAt(3), 1);
  assert.equal(playerHud84e5b0FailIfAlAt(4), 0);
  assert.equal(playerHud84e5b0FailIfAlAt(5), 1);

  /* Early-true short-circuits later host recaptures. */
  assert.equal(
    playerHud84e5b0Decide(0, 0, 0x68, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0),
    1,
  );
  assert.equal(
    playerHud84e5b0Decide(1, 0, 0x68, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0),
    0,
  );
  assert.equal(
    playerHud84e5b0Decide(0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0),
    1,
  );
  assert.equal(
    playerHud84e5b0Decide(0, 0, 0x68, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0),
    0,
  );
});

test("v28 Wasm ≡ JS — predicate islands + plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x80) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84e5b0Stride() >>> 0, PLAYERHUD_84E5B0_STRIDE);
  assert.equal(exp.hud84e5b0NextVa() >>> 0, PLAYERHUD_84E5B0_NEXT_VA);

  const ranges = [
    [0, 0], [0, 0x68], [0, 0xd0], [0x68, 0], [0, 0x67],
    [0xffffffff, 0x67], [0x100, 0x1d0], [0, 0xffffffff],
  ];
  for (const [begin, end] of ranges) {
    assert.equal(
      exp.hud84e5b0Count(begin, end) >>> 0,
      playerHud84e5b0Count(begin, end),
      `count begin=${begin >>> 0} end=${end >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0DwordCount(begin, end) >>> 0,
      playerHud84e5b0DwordCount(begin, end),
      `dwords begin=${begin >>> 0} end=${end >>> 0}`,
    );
  }

  const idxs = [0, 1, 2, 0x1f, 0x100, 0x7fffffff, 0x80000000, 0xffffffff];
  for (const i of idxs) {
    assert.equal(
      exp.hud84e5b0InRange(i, 0, 0x68) | 0,
      playerHud84e5b0InRange(i, 0, 0x68),
      `in_range i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0ObjectOff(i) >>> 0,
      playerHud84e5b0ObjectOff(i),
      `object_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0VecOffAt(i) >>> 0,
      playerHud84e5b0VecOffAt(i),
      `vec_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0HostVaAt(i) >>> 0,
      playerHud84e5b0HostVaAt(i),
      `host_va i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0FailIfAlAt(i) | 0,
      playerHud84e5b0FailIfAlAt(i),
      `fail_if_al i=${i >>> 0}`,
    );
  }

  const gates = [0, 1, 0x100, 0xffffffff, 0x80000000, 4, 0x7fffffff];
  for (const g of gates) {
    assert.equal(
      exp.hud84e5b0EarlyTrue(g) | 0,
      playerHud84e5b0EarlyTrue(g),
      `early this+4=${g >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0Prefix(0, 0, 0x68, g) | 0,
      playerHud84e5b0Prefix(0, 0, 0x68, g),
      `prefix this+4=${g >>> 0}`,
    );
  }

  for (const [c, h] of [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0x100], [1, 0x80000000]]) {
    assert.equal(
      exp.hud84e5b0WhitelistOk(c, h) | 0,
      playerHud84e5b0WhitelistOk(c, h),
      `wl count=${c >>> 0} has=${h >>> 0}`,
    );
    assert.equal(
      exp.hud84e5b0BlacklistOk(h) | 0,
      playerHud84e5b0BlacklistOk(h),
      `bl has=${h >>> 0}`,
    );
  }

  for (const id of [0, 1, 0x281, 0x282, 0x283, 0xfffffffe, 0xffffffff, 0x80000000, 0x7fffffff]) {
    assert.equal(
      exp.hud84e5b0CompletionPrefix(id) | 0,
      playerHud84e5b0CompletionPrefix(id),
      `completion id=${id >>> 0}`,
    );
  }

  const modes = [
    [0, 0, 0, 0], [1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 0x8000, 0],
    [1, 2, 0, 0], [1, 2, 0x8000, 0], [2, 1, 0x800, 0], [2, 1, 0, 0],
    [2, 2, 0, 0], [2, 2, 0x800, 0], [3, 1, 0, 2], [3, 1, 0, 3],
    [3, 1, 0, 0], [3, 1, 0, 1], [3, 2, 0, 0], [4, 1, 0, 0],
    [1, 1, 0x80000000, 0], [2, 1, 0x80000000, 0],
  ];
  for (const [mode, slot, flags, g] of modes) {
    assert.equal(
      exp.hud84e5b0ModeOk(mode, slot, flags, g) | 0,
      playerHud84e5b0ModeOk(mode, slot, flags, g),
      `mode ${mode},${slot},${flags >>> 0},${g}`,
    );
  }

  const js = playerHud84e5b0Plan();
  exp.hud84e5b0Plan(base);
  assert.equal(view.getUint32(base + 0, true), js.stride);
  assert.equal(view.getUint32(base + 4, true), js.vecBeginOff);
  assert.equal(view.getUint32(base + 8, true), js.vecEndOff);
  assert.equal(view.getUint32(base + 12, true), js.gateOff);
  assert.equal(view.getUint32(base + 16, true), js.playerTypeOff);
  assert.equal(view.getUint32(base + 20, true), js.vecOff0);
  assert.equal(view.getUint32(base + 24, true), js.vecOff1);
  assert.equal(view.getUint32(base + 28, true), js.vecOff2);
  assert.equal(view.getUint32(base + 32, true), js.vecOff3);
  assert.equal(view.getUint32(base + 36, true), js.vecOff4);
  assert.equal(view.getUint32(base + 40, true), js.vecOff5);
  assert.equal(view.getUint32(base + 44, true), js.completionOff);
  assert.equal(view.getUint32(base + 48, true), js.modeOff);
  assert.equal(view.getUint32(base + 52, true), js.hostVaCol);
  assert.equal(view.getUint32(base + 56, true), js.hostVaTrk);
  assert.equal(view.getUint32(base + 60, true), js.flagShrMode1);
  assert.equal(view.getUint32(base + 64, true), js.flagShrMode2);
  assert.equal(view.getUint32(base + 68, true), js.completionMax);
  assert.equal(view.getUint32(base + 72, true), js.nextVa);

  const decideCases = [
    [0, 0, 0x68, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0],
    [1, 0, 0x68, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 0, 1, 3, 1, 0, 0],
    [0, 0, 0x68, 1, 0, 0, 0, 1, 0, 1, 0, 1, 3, 1, 0, 2],
  ];
  for (const c of decideCases) {
    assert.equal(
      exp.hud84e5b0Decide(...c) | 0,
      playerHud84e5b0Decide(...c),
      `decide ${c.map((x) => (x >>> 0).toString(16)).join(",")}`,
    );
  }
});

test("v28 mutation checks: unsigned jae, inverted gate, vec-off order, next VA", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M50: in-range uses signed < not unsigned jae — high-bit index must FAIL. */
  withMutant(
    "  return index < isaac_playerhud_84e5b0_count(begin, end) ? 1 : 0;",
    "  return (int32_t)index < (int32_t)isaac_playerhud_84e5b0_count(begin, end) ? 1 : 0;",
    (wasm) => {
      const inRange = wasm.isaac_playerhud_84e5b0_in_range
        ?? wasm._isaac_playerhud_84e5b0_in_range;
      assert.equal(
        inRange(0x80000000, 0, 0x68) | 0,
        1,
        "M50 must diverge: 0x80000000 unsigned-out, signed-in vs count=1",
      );
      assert.equal(inRange(0, 0, 0x68) | 0, 1, "M50 zero still in-range");
    },
  );

  /* M51: early-true uses != 0 (v27 polarity) not == 0. */
  withMutant(
    "  return this_plus_4 == 0u ? 1 : 0;\n}\n\nextern \"C\" int32_t isaac_playerhud_84e5b0_prefix",
    "  return this_plus_4 != 0u ? 1 : 0;\n}\n\nextern \"C\" int32_t isaac_playerhud_84e5b0_prefix",
    (wasm) => {
      const early = wasm.isaac_playerhud_84e5b0_early_true
        ?? wasm._isaac_playerhud_84e5b0_early_true;
      assert.equal(
        early(0) | 0,
        0,
        "M51 must diverge: PE [this+4]==0 is early-true; mutant treats 0 as continue",
      );
      assert.equal(
        early(1) | 0,
        1,
        "M51 must diverge: PE nonzero continues; mutant early-trues",
      );
    },
  );

  /* M52: first vec-off 0x54 not 0x18 — PE walks +0x18 first (low-to-high). */
  withMutant(
    "  out->vec_off_0 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_0;",
    "  out->vec_off_0 = ISAAC_PLAYERHUD_84E5B0_VEC_OFF_5;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84e5b0_plan
        ?? wasm._isaac_playerhud_84e5b0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 20, true),
        0x54,
        "M52 must diverge: PE first sub-vector is +0x18; mutant writes v25 high 0x54",
      );
    },
  );

  /* M53: next VA 0x84ea90 not 0x84e820 — PE next body is after int3 pad. */
  withMutant(
    "  out->next_va = ISAAC_PLAYERHUD_84E5B0_NEXT_VA;",
    "  out->next_va = 0x0084ea90u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84e5b0_plan
        ?? wasm._isaac_playerhud_84e5b0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 72, true),
        0x0084ea90,
        "M53 must diverge: PE next is 0x84e820; mutant writes frozen 0x84ea90",
      );
    },
  );
});

/* ============================ ABI v29 ============================ */

test("v29 FUN_0084e820 counter GATE/PLAN fixed edges", () => {
  /* [this+4]==0 early-return. Full dword. Same ==0 as v28 early-true. */
  assert.equal(playerHud84e820GateZero(0), 1);
  assert.equal(playerHud84e820GateZero(1), 0);
  assert.equal(playerHud84e820GateZero(0x100), 0);
  assert.equal(playerHud84e820GateZero(0x80000000), 0);
  assert.equal(playerHud84e820GateZero(0xffffffff), 0);

  /* Signed /0x68 aliases v28 count. */
  assert.equal(playerHud84e820Count(0, 0), 0);
  assert.equal(playerHud84e820Count(0, 0x68), 1);
  assert.equal(playerHud84e820Count(0, 0xd0), 2);
  assert.equal(playerHud84e820Count(0x68, 0), 0xffffffff);
  assert.equal(playerHud84e820Count(0, 0x67), 0);
  assert.equal(
    playerHud84e820Count(0, 0x68),
    playerHud84e5b0Count(0, 0x68),
  );

  /* Signed sar 2 aliases v28 dword_count. */
  assert.equal(playerHud84e820PtrCount(0, 0x10), 4);
  assert.equal(playerHud84e820PtrCount(0x10, 0), 0xfffffffc);
  assert.equal(
    playerHud84e820PtrCount(0, 8),
    playerHud84e5b0DwordCount(0, 8),
  );

  /* Signed body in-range (js / jge). */
  assert.equal(playerHud84e820InRange(0, 1), 1);
  assert.equal(playerHud84e820InRange(1, 1), 0);
  assert.equal(playerHud84e820InRange(0, 0), 0);
  assert.equal(playerHud84e820InRange(0x80000000, 1), 0);
  assert.equal(playerHud84e820InRange(0, 0x80000000), 0);
  assert.equal(playerHud84e820InRange(0xffffffff, 1), 0);

  /* Unsigned loop continue. */
  assert.equal(playerHud84e820LoopCont(0, 1), 1);
  assert.equal(playerHud84e820LoopCont(1, 1), 0);
  assert.equal(playerHud84e820LoopCont(0, 0x80000000), 1);
  assert.equal(playerHud84e820LoopCont(0x80000000, 0xffffffff), 1);

  assert.equal(playerHud84e820RangeEmpty(0, 0), 1);
  assert.equal(playerHud84e820RangeEmpty(1, 0), 0);
  assert.equal(playerHud84e820RangeEmpty(0, 1), 0);
  assert.equal(playerHud84e820RangeEmpty(0x80000000, 0), 0);

  assert.equal(playerHud84e820SpecialOk(0xf, 0, 0x23), 1);
  assert.equal(playerHud84e820SpecialOk(0xf, 0, 0x106), 1);
  assert.equal(playerHud84e820SpecialOk(0xf, 0, 0x30), 0);
  assert.equal(playerHud84e820SpecialOk(0xf, 1, 0x30), 1);
  assert.equal(playerHud84e820SpecialOk(0xf, 1, 0x23), 0);
  assert.equal(playerHud84e820SpecialOk(0xe, 0, 0x23), 0);
  assert.equal(playerHud84e820SpecialOk(0xf, 2, 0x23), 0);
  assert.equal(playerHud84e820SpecialOk(0xf, 0, 0), 0);
  assert.equal(playerHud84e820SpecialOk(0x10f, 0, 0x23), 0);

  assert.equal(playerHud84e820AlHit(0), 0);
  assert.equal(playerHud84e820AlHit(1), 1);
  assert.equal(playerHud84e820AlHit(0x100), 0);
  assert.equal(playerHud84e820AlHit(0x101), 1);
  assert.equal(playerHud84e820AlHit(0x80000000), 0);

  assert.equal(playerHud84e820EntryInc(0, 0, 0, 0xf, 0, 0x23, 1), 0);
  assert.equal(playerHud84e820EntryInc(1, 0, 0, 0xf, 0, 0x23, 0), 1);
  assert.equal(playerHud84e820EntryInc(1, 0, 0, 0xf, 0, 0x106, 0), 1);
  assert.equal(playerHud84e820EntryInc(1, 1, 0, 0xf, 0, 0x23, 1), 1);
  assert.equal(playerHud84e820EntryInc(1, 1, 0, 0xf, 0, 0x23, 0), 0);
  assert.equal(playerHud84e820EntryInc(1, 1, 0, 0xf, 0, 0x23, 0x100), 0);
  assert.equal(playerHud84e820EntryInc(1, 1, 0, 0xf, 2, 0x23, 1), 0);

  assert.equal(playerHud84e820ExtraSum(0, 5), 5);
  assert.equal(playerHud84e820ExtraSum(2, 5), 7);
  assert.equal(playerHud84e820ExtraSum(0xffffffff, 1), 0);

  assert.equal(playerHud84e820Decide(0, 1, 1, 0, 0, 0xf, 0, 0x23, 0), 1);
  assert.equal(playerHud84e820Decide(1, 1, 1, 0, 0, 0xf, 0, 0x23, 0), 0);
  assert.equal(playerHud84e820Decide(0x80000000, 1, 1, 0, 0, 0xf, 0, 0x23, 1), 0);
  assert.equal(playerHud84e820Decide(0, 0x80000000, 1, 0, 0, 0xf, 0, 0x23, 1), 0);

  const p = playerHud84e820Plan();
  assert.equal(p.stride, 0x68);
  assert.equal(p.gateOff, PLAYERHUD_84DEA0_GATE_OFF);
  assert.equal(p.gateOff, 4);
  assert.equal(p.vecBeginOff, 0x2c);
  assert.equal(p.vecEndOff, 0x30);
  assert.equal(p.extraBeginOff, 0x20);
  assert.equal(p.extraEndOff, 0x24);
  assert.equal(p.gameBeginOff, 0x2a448);
  assert.equal(p.gameEndOff, 0x2a44c);
  assert.equal(p.rangeLoOff, 8);
  assert.equal(p.rangeHiOff, 0xc);
  assert.equal(p.specialKind, 0xf);
  assert.equal(p.charMode0A, 0x23);
  assert.equal(p.charMode0B, 0x106);
  assert.equal(p.charMode1, 0x30);
  assert.equal(p.hostVaMode0, 0x0072fe80);
  assert.equal(p.hostVaMode1, 0x0072fec0);
  assert.equal(p.hostVaPred, 0x0084e5b0);
  assert.equal(p.nextVa, 0x0084e9d0);
  assert.equal(playerHud84e820Stride(), PLAYERHUD_84DA20_OBJECT_SIZE);
  assert.equal(playerHud84e820Stride(), PLAYERHUD_84E5B0_STRIDE);
  assert.equal(playerHud84e820NextVa() >>> 0, 0x0084e9d0);
  assert.equal(PLAYERHUD_84E820_VA, 0x0084e820);
  assert.equal(PLAYERHUD_84E820_RET_VA, 0x0084e97d);
  assert.equal(PLAYERHUD_84E820_HOST_VA_PRED, PLAYERHUD_84E5B0_VA);
  assert.equal(PLAYERHUD_84E820_VEC_BEGIN_OFF, PLAYERHUD_84E5B0_VEC_BEGIN_OFF);
  assert.equal(playerHud84e820HostVaAt(0), 0x0072fe80);
  assert.equal(playerHud84e820HostVaAt(1), 0x0072fec0);
  assert.equal(playerHud84e820HostVaAt(2), 0);
  assert.equal(playerHud84e820HostVaAt(0xffffffff), 0);
});

test("v29 Wasm ≡ JS — counter islands + plan", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x80) {
    exp.memory.grow(1);
  }
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud84e820Stride() >>> 0, PLAYERHUD_84E820_STRIDE);
  assert.equal(exp.hud84e820NextVa() >>> 0, PLAYERHUD_84E820_NEXT_VA);

  for (const [begin, end] of [
    [0, 0],
    [0, 0x68],
    [0, 0xd0],
    [0x68, 0],
    [0, 0x10],
    [0x10, 0],
  ]) {
    assert.equal(
      exp.hud84e820Count(begin, end) >>> 0,
      playerHud84e820Count(begin, end),
      `count ${begin},${end}`,
    );
    assert.equal(
      exp.hud84e820PtrCount(begin, end) >>> 0,
      playerHud84e820PtrCount(begin, end),
      `ptrCount ${begin},${end}`,
    );
  }

  for (const g of [0, 1, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud84e820GateZero(g) | 0,
      playerHud84e820GateZero(g),
      `gate ${g >>> 0}`,
    );
  }

  for (const [i, c] of [
    [0, 1],
    [1, 1],
    [0, 0],
    [0x80000000, 1],
    [0, 0x80000000],
    [0xffffffff, 1],
    [0, 0xffffffff],
  ]) {
    assert.equal(
      exp.hud84e820InRange(i, c) | 0,
      playerHud84e820InRange(i, c),
      `inRange ${i >>> 0},${c >>> 0}`,
    );
    assert.equal(
      exp.hud84e820LoopCont(i, c) | 0,
      playerHud84e820LoopCont(i, c),
      `loopCont ${i >>> 0},${c >>> 0}`,
    );
  }

  for (const [lo, hi] of [[0, 0], [1, 0], [0, 1], [0x80000000, 0]]) {
    assert.equal(
      exp.hud84e820RangeEmpty(lo, hi) | 0,
      playerHud84e820RangeEmpty(lo, hi),
    );
  }

  for (const [kind, mode, id] of [
    [0xf, 0, 0x23],
    [0xf, 0, 0x106],
    [0xf, 0, 0x30],
    [0xf, 1, 0x30],
    [0xf, 1, 0x23],
    [0xe, 0, 0x23],
    [0xf, 2, 0x23],
  ]) {
    assert.equal(
      exp.hud84e820SpecialOk(kind, mode, id) | 0,
      playerHud84e820SpecialOk(kind, mode, id),
    );
  }

  for (const al of [0, 1, 0x100, 0x101, 0x80000000]) {
    assert.equal(exp.hud84e820AlHit(al) | 0, playerHud84e820AlHit(al));
  }

  for (const [extra, acc] of [[0, 5], [2, 5], [0xffffffff, 1]]) {
    assert.equal(
      exp.hud84e820ExtraSum(extra, acc) >>> 0,
      playerHud84e820ExtraSum(extra, acc),
    );
  }

  assert.equal(exp.hud84e820HostVaAt(0) >>> 0, 0x0072fe80);
  assert.equal(exp.hud84e820HostVaAt(1) >>> 0, 0x0072fec0);
  assert.equal(exp.hud84e820HostVaAt(2) >>> 0, 0);

  const decideCases = [
    [0, 1, 1, 0, 0, 0xf, 0, 0x23, 0],
    [1, 1, 1, 0, 0, 0xf, 0, 0x23, 0],
    [0, 1, 0, 0, 0, 0xf, 0, 0x23, 1],
    [0, 1, 1, 1, 0, 0xf, 0, 0x23, 1],
    [0, 1, 1, 1, 0, 0xf, 0, 0x23, 0],
    [0, 1, 1, 1, 0, 0xf, 0, 0x23, 0x100],
    [0, 1, 1, 0, 0, 0xf, 1, 0x30, 0],
    [0, 0x80000000, 1, 0, 0, 0xf, 0, 0x23, 1],
    [0x80000000, 1, 1, 0, 0, 0xf, 0, 0x23, 1],
  ];
  for (const c of decideCases) {
    assert.equal(
      exp.hud84e820Decide(...c) | 0,
      playerHud84e820Decide(...c),
      `decide ${c.map((x) => (x >>> 0).toString(16)).join(",")}`,
    );
  }

  const view = new DataView(exp.memory.buffer);
  exp.hud84e820Plan(base);
  const js = playerHud84e820Plan();
  assert.equal(view.getUint32(base + 0, true), js.stride);
  assert.equal(view.getUint32(base + 4, true), js.gateOff);
  assert.equal(view.getUint32(base + 8, true), js.vecBeginOff);
  assert.equal(view.getUint32(base + 12, true), js.vecEndOff);
  assert.equal(view.getUint32(base + 16, true), js.extraBeginOff);
  assert.equal(view.getUint32(base + 20, true), js.extraEndOff);
  assert.equal(view.getUint32(base + 24, true), js.gameBeginOff);
  assert.equal(view.getUint32(base + 28, true), js.gameEndOff);
  assert.equal(view.getUint32(base + 32, true), js.rangeLoOff);
  assert.equal(view.getUint32(base + 36, true), js.rangeHiOff);
  assert.equal(view.getUint32(base + 40, true), js.specialKind);
  assert.equal(view.getUint32(base + 44, true), js.charMode0A);
  assert.equal(view.getUint32(base + 48, true), js.charMode0B);
  assert.equal(view.getUint32(base + 52, true), js.charMode1);
  assert.equal(view.getUint32(base + 56, true), js.hostVaMode0);
  assert.equal(view.getUint32(base + 60, true), js.hostVaMode1);
  assert.equal(view.getUint32(base + 64, true), js.hostVaPred);
  assert.equal(view.getUint32(base + 68, true), js.nextVa);
});

test("v29 mutation checks: gate polarity, signed in-range, 0x106, next VA", () => {
  const writeSyncRetry = (path, contents) => {
    let last = null;
    for (let i = 0; i < 40; i++) {
      try {
        writeFileSync(path, contents);
        return;
      } catch (err) {
        last = err;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
      }
    }
    throw last;
  };
  const mutantWasm = join(outDir, "playerhud-post-update-pure-helpers.v29mut.wasm");
  const mutantCpp = join(outDir, "playerhud-post-update-pure-helpers.v29mut.cpp");
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSyncRetry(mutantCpp, orig.replace(mutOld, mutNew));
    buildWasm(mutantWasm, mutantCpp);
    const module = new WebAssembly.Module(readFileSync(mutantWasm));
    const instance = new WebAssembly.Instance(module, {});
    check(instance.exports);
  };

  /* M54: gate uses != 0 (v27 polarity) not == 0. */
  withMutant(
    "  return this_plus_4 == 0u ? 1 : 0;\n}\n\nextern \"C\" uint32_t isaac_playerhud_84e820_count",
    "  return this_plus_4 != 0u ? 1 : 0;\n}\n\nextern \"C\" uint32_t isaac_playerhud_84e820_count",
    (wasm) => {
      const gate = wasm.isaac_playerhud_84e820_gate_zero
        ?? wasm._isaac_playerhud_84e820_gate_zero;
      assert.equal(
        gate(0) | 0,
        0,
        "M54 must diverge: PE [this+4]==0 early-returns; mutant continues",
      );
      assert.equal(
        gate(1) | 0,
        1,
        "M54 must diverge: PE nonzero continues; mutant early-returns",
      );
    },
  );

  /* M55: in-range drops the signed js (index>=0) so 0x80000000 is in-range. */
  withMutant(
    "  return (static_cast<int32_t>(index) >= 0 &&\n          static_cast<int32_t>(index) < static_cast<int32_t>(count))\n             ? 1\n             : 0;",
    "  return (static_cast<int32_t>(index) < static_cast<int32_t>(count))\n             ? 1\n             : 0;",
    (wasm) => {
      const inRange = wasm.isaac_playerhud_84e820_in_range
        ?? wasm._isaac_playerhud_84e820_in_range;
      assert.equal(
        inRange(0x80000000, 1) | 0,
        1,
        "M55 must diverge: PE js skips negative index; mutant only signed <",
      );
      assert.equal(inRange(0, 1) | 0, 1, "M55 zero still in-range vs 1");
    },
  );

  /* M56: mode-0 char 0x23 only — PE also matches 0x106. */
  withMutant(
    "        this_plus_4 == static_cast<uint32_t>(\n            ISAAC_PLAYERHUD_84E820_CHAR_MODE0_B)) {",
    "        this_plus_4 == static_cast<uint32_t>(\n            ISAAC_PLAYERHUD_84E820_CHAR_MODE0_A)) {",
    (wasm) => {
      const special = wasm.isaac_playerhud_84e820_special_ok
        ?? wasm._isaac_playerhud_84e820_special_ok;
      assert.equal(
        special(0xf, 0, 0x106) | 0,
        0,
        "M56 must diverge: PE mode-0 matches 0x106; mutant drops it",
      );
      assert.equal(
        special(0xf, 0, 0x23) | 0,
        1,
        "M56 0x23 still matches",
      );
    },
  );

  /* M57: next VA 0x84ea90 not 0x84e9d0 — PE next body is after int3 pad. */
  withMutant(
    "  out->next_va = ISAAC_PLAYERHUD_84E820_NEXT_VA;",
    "  out->next_va = 0x0084ea90u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84e820_plan
        ?? wasm._isaac_playerhud_84e820_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 68, true),
        0x0084ea90,
        "M57 must diverge: PE next is 0x84e9d0; mutant writes frozen 0x84ea90",
      );
    },
  );
});


/* ============================ ABI v30 ============================ */

test("v30 FUN_008568a0 0x68-object copy-ctor host plan fixed edges", () => {
  assert.equal(PLAYERHUD_8568A0_VA, 0x008568a0);
  assert.equal(PLAYERHUD_8568A0_RET_VA, 0x00856954);
  assert.equal(PLAYERHUD_8568A0_CALL_COUNT, 7);
  assert.equal(PLAYERHUD_8568A0_HOST_VA_STRING, 0x0040cf50);
  assert.equal(PLAYERHUD_8568A0_HOST_VA_SUB, 0x0043eca0);
  assert.deepEqual(
    PLAYERHUD_8568A0_THIS_OFFS,
    [0, 0x18, 0x24, 0x30, 0x3c, 0x48, 0x54],
  );
  assert.equal(PLAYERHUD_8568A0_TAIL_BEGIN_OFF, 0x60);
  assert.equal(PLAYERHUD_8568A0_TAIL_DWORD_COUNT, 2);
  assert.equal(PLAYERHUD_8568A0_OBJECT_SIZE, PLAYERHUD_84DA20_OBJECT_SIZE);
  assert.equal(PLAYERHUD_8568A0_NEXT_VA, 0x00856960);

  assert.equal(playerHud8568a0CallCount(), 7);
  assert.equal(playerHud8568a0ThisOffAt(0), 0);
  assert.equal(playerHud8568a0ThisOffAt(1), 0x18);
  assert.equal(playerHud8568a0ThisOffAt(2), 0x24);
  assert.equal(playerHud8568a0ThisOffAt(3), 0x30);
  assert.equal(playerHud8568a0ThisOffAt(4), 0x3c);
  assert.equal(playerHud8568a0ThisOffAt(5), 0x48);
  assert.equal(playerHud8568a0ThisOffAt(6), 0x54);
  assert.equal(playerHud8568a0ThisOffAt(7), 0);
  assert.equal(playerHud8568a0ThisOffAt(0xffffffff), 0);
  assert.equal(playerHud8568a0ArgOffAt(0), 0);
  assert.equal(playerHud8568a0ArgOffAt(1), 0x18);
  assert.equal(playerHud8568a0ArgOffAt(6), 0x54);
  assert.equal(playerHud8568a0ArgOffAt(7), 0);

  assert.equal(playerHud8568a0HostVaAt(0), 0x0040cf50);
  assert.equal(playerHud8568a0HostVaAt(1), 0x0043eca0);
  assert.equal(playerHud8568a0HostVaAt(6), 0x0043eca0);
  assert.equal(playerHud8568a0HostVaAt(7), 0);
  assert.equal(playerHud8568a0HostVaAt(0x80000000), 0);

  assert.equal(playerHud8568a0TailBeginOff(), 0x60);
  assert.equal(playerHud8568a0TailDwordCount(), 2);
  assert.equal(playerHud8568a0ObjectSize(), 0x68);
  assert.equal(playerHud8568a0NextVa(), 0x00856960);

  assert.equal(playerHud8568a0TailCopy(0, 0x10000), 0);
  assert.equal(playerHud8568a0TailCopy(0x10000, 0), 0);
  assert.equal(playerHud8568a0TailCopy(0x10000, 0x20000), 1);

  const p = playerHud8568a0Plan();
  assert.equal(p.callCount, 7);
  assert.equal(p.hostVa0, 0x0040cf50);
  assert.equal(p.thisOff0, 0);
  assert.equal(p.argOff0, 0);
  assert.equal(p.hostVa1, 0x0043eca0);
  assert.equal(p.thisOff1, 0x18);
  assert.equal(p.argOff1, 0x18);
  assert.equal(p.hostVa2, 0x0043eca0);
  assert.equal(p.thisOff2, 0x24);
  assert.equal(p.hostVa3, 0x0043eca0);
  assert.equal(p.thisOff3, 0x30);
  assert.equal(p.hostVa4, 0x0043eca0);
  assert.equal(p.thisOff4, 0x3c);
  assert.equal(p.hostVa5, 0x0043eca0);
  assert.equal(p.thisOff5, 0x48);
  assert.equal(p.hostVa6, 0x0043eca0);
  assert.equal(p.thisOff6, 0x54);
  assert.equal(p.argOff6, 0x54);
  assert.equal(p.tailBeginOff, 0x60);
  assert.equal(p.tailDwordCount, 2);
  assert.equal(p.objectSize, 0x68);
  assert.equal(p.nextVa, 0x00856960);
});

test("v30 Wasm ≡ JS — copy-ctor plan + tail copy", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x500) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.hud8568a0CallCount(), PLAYERHUD_8568A0_CALL_COUNT);
  assert.equal(exp.hud8568a0TailBeginOff() >>> 0, PLAYERHUD_8568A0_TAIL_BEGIN_OFF);
  assert.equal(exp.hud8568a0TailDwordCount() >>> 0, PLAYERHUD_8568A0_TAIL_DWORD_COUNT);
  assert.equal(exp.hud8568a0ObjectSize() >>> 0, PLAYERHUD_8568A0_OBJECT_SIZE);
  assert.equal(exp.hud8568a0NextVa() >>> 0, PLAYERHUD_8568A0_NEXT_VA);

  for (const i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 0x1f, 0x100, 0x7fffffff,
    0x80000000, 0xffffffff]) {
    assert.equal(
      exp.hud8568a0ThisOffAt(i) >>> 0,
      playerHud8568a0ThisOffAt(i),
      `this_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud8568a0ArgOffAt(i) >>> 0,
      playerHud8568a0ArgOffAt(i),
      `arg_off i=${i >>> 0}`,
    );
    assert.equal(
      exp.hud8568a0HostVaAt(i) >>> 0,
      playerHud8568a0HostVaAt(i),
      `host_va i=${i >>> 0}`,
    );
  }

  const js = playerHud8568a0Plan();
  exp.hud8568a0Plan(base);
  assert.equal(view.getInt32(base + 0, true), js.callCount);
  assert.equal(view.getUint32(base + 4, true), js.hostVa0);
  assert.equal(view.getInt32(base + 8, true), js.thisOff0);
  assert.equal(view.getInt32(base + 12, true), js.argOff0);
  assert.equal(view.getUint32(base + 16, true), js.hostVa1);
  assert.equal(view.getInt32(base + 20, true), js.thisOff1);
  assert.equal(view.getInt32(base + 24, true), js.argOff1);
  assert.equal(view.getUint32(base + 28, true), js.hostVa2);
  assert.equal(view.getInt32(base + 32, true), js.thisOff2);
  assert.equal(view.getInt32(base + 36, true), js.argOff2);
  assert.equal(view.getUint32(base + 40, true), js.hostVa3);
  assert.equal(view.getInt32(base + 44, true), js.thisOff3);
  assert.equal(view.getInt32(base + 48, true), js.argOff3);
  assert.equal(view.getUint32(base + 52, true), js.hostVa4);
  assert.equal(view.getInt32(base + 56, true), js.thisOff4);
  assert.equal(view.getInt32(base + 60, true), js.argOff4);
  assert.equal(view.getUint32(base + 64, true), js.hostVa5);
  assert.equal(view.getInt32(base + 68, true), js.thisOff5);
  assert.equal(view.getInt32(base + 72, true), js.argOff5);
  assert.equal(view.getUint32(base + 76, true), js.hostVa6);
  assert.equal(view.getInt32(base + 80, true), js.thisOff6);
  assert.equal(view.getInt32(base + 84, true), js.argOff6);
  assert.equal(view.getUint32(base + 88, true), js.tailBeginOff);
  assert.equal(view.getUint32(base + 92, true), js.tailDwordCount);
  assert.equal(view.getUint32(base + 96, true), js.objectSize);
  assert.equal(view.getUint32(base + 100, true), js.nextVa);

  /* tail_copy memory effect: two dwords at +0x60/+0x64. */
  const dest = base + 0x200;
  const src = base + 0x300;
  for (let i = 0; i < 0x1c; i++) {
    view.setUint32(dest + i * 4, 0x11111111 + i, true);
  }
  view.setUint32(src + 0x60, 0x0badc0de, true);
  view.setUint32(src + 0x64, 0x0badc0df, true);
  view.setUint32(dest + 0x60, 0xdeadbeef, true);
  view.setUint32(dest + 0x64, 0xdeadbeef, true);
  exp.hud8568a0TailCopy(dest, src);
  assert.equal(view.getUint32(dest + 0x60, true), 0x0badc0de);
  assert.equal(view.getUint32(dest + 0x64, true), 0x0badc0df);
  assert.equal(view.getUint32(dest + 0x5c, true), 0x11111111 + 0x17);
});

test("v30 mutation checks: string host, tail dword count, next VA", () => {
  const writeSyncRetry = (path, contents) => {
    let last = null;
    for (let i = 0; i < 40; i++) {
      try {
        writeFileSync(path, contents);
        return;
      } catch (err) {
        last = err;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
      }
    }
    throw last;
  };
  const mutantWasm = join(outDir, "playerhud-post-update-pure-helpers.v30mut.wasm");
  const mutantCpp = join(outDir, "playerhud-post-update-pure-helpers.v30mut.cpp");
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSyncRetry(mutantCpp, orig.replace(mutOld, mutNew));
    buildWasm(mutantWasm, mutantCpp);
    const module = new WebAssembly.Module(readFileSync(mutantWasm));
    const instance = new WebAssembly.Instance(module, {});
    check(instance.exports);
  };

  /* M58: string copy host swapped for the sub-vector host. */
  withMutant(
    "  out->host_va_0 = ISAAC_PLAYERHUD_8568A0_HOST_VA_STRING;",
    "  out->host_va_0 = ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_8568a0_plan
        ?? wasm._isaac_playerhud_8568a0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 4, true),
        0x0043eca0,
        "M58 must diverge: PE call 0 is the SSO-string copy-ctor 0x40cf50",
      );
    },
  );

  /* M59: tail copies one dword only (PE copies two, +0x60/+0x64). */
  withMutant(
    "  for (int i = 0; i < ISAAC_PLAYERHUD_8568A0_TAIL_DWORD_COUNT; ++i) {\n    dest[begin / 4u + i] = src[begin / 4u + i];\n  }",
    "  for (int i = 0; i < 1; ++i) {\n    dest[begin / 4u + i] = src[begin / 4u + i];\n  }",
    (wasm) => {
      const tailCopy = wasm.isaac_playerhud_8568a0_tail_copy
        ?? wasm._isaac_playerhud_8568a0_tail_copy;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x500) mem.grow(1);
      const v = new DataView(mem.buffer);
      const dest = base + 0x200;
      const src = base + 0x300;
      v.setUint32(src + 0x60, 0x0badc0de, true);
      v.setUint32(src + 0x64, 0x0badc0df, true);
      v.setUint32(dest + 0x60, 0xdeadbeef, true);
      v.setUint32(dest + 0x64, 0xdeadbeef, true);
      tailCopy(dest, src);
      assert.equal(
        v.getUint32(dest + 0x64, true),
        0xdeadbeef,
        "M59 must diverge: PE copies +0x64 too; mutant leaves it untouched",
      );
    },
  );

  /* M60: next VA 0x856e10 not 0x856960 — PE next body is after int3 pad. */
  withMutant(
    "  out->next_va = ISAAC_PLAYERHUD_8568A0_NEXT_VA;",
    "  out->next_va = 0x00856e10u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_8568a0_plan
        ?? wasm._isaac_playerhud_8568a0_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x80) mem.grow(1);
      const v = new DataView(mem.buffer);
      plan(base);
      assert.equal(
        v.getUint32(base + 100, true),
        0x00856e10,
        "M60 must diverge: PE next is 0x856960; mutant writes frozen 0x856e10",
      );
    },
  );
});

/* ============================ ABI v32 ============================ */

/* PE-truth reference, transcribed branch-by-branch from
   section-notes/playerhud-v18/disasm-84ca00-recomputestats-callsites.txt
   (0x0084ca00..0x0084cc38, ret 0xc).  Do NOT derive from the C++/wasm. */
const ref84ca00 = {
  /* flag = setg((Game+0x264f8 - entry+0x328) signed > 1) — 0x84ca36..0x84ca42 */
  flag: [
    [100, 98, 1],   /* diff 2 > 1 */
    [100, 99, 0],   /* diff 1 not > 1 */
    [5, 3, 1],      /* diff 2 */
    [3, 5, 0],      /* diff -2 (signed) */
    [0, 0xffffffff, 0], /* diff 1 (32-bit wrap) */
    [1, 0xffffffff, 1], /* diff 2 (wrap) */
    [0x80000000, 0x7fffffff, 0], /* diff 1 */
    [0x80000001, 0x7fffffff, 1], /* diff 2 */
    [0xffffffff, 0, 0], /* diff -1 */
    [0, 0, 0],
  ],
  /* clamp = maxss(probe1,0); minss(,1); probe2==0 -> xorps 0.
     0x84cb5b..0x84cb81; probe1 captured post-fstp by the host blob. */
  clamp: [
    [0x3f000000 /*0.5*/, 1, 0x3f000000],
    [0xbf000000 /*-0.5*/, 1, 0x00000000],
    [0x40000000 /*2*/, 1, 0x3f800000 /*1.0*/],
    [0x7fc00000 /*NaN*/, 1, 0x00000000], /* maxss unordered -> src 0.0 */
    [0x3f000000 /*0.5*/, 0, 0x00000000], /* bool 0 zeroes */
    [0x80000000 /*-0.0*/, 1, 0x00000000], /* equal-sign -> src +0.0 */
    [0x7f800000 /*+Inf*/, 1, 0x3f800000], /* minss -> 1.0 */
    [0x3f800000 /*1.0*/, 1, 0x3f800000],
    [0xff800000 /*-Inf*/, 1, 0x00000000],
  ],
};

test("v32 RecomputeStats 0x84ca00 fixed edges (VA 0x0084ca00..0x0084cc38)", () => {
  /* ---- flag law: setg after signed 32-bit wrap subtract ---- */
  for (const [gf, ef, want] of ref84ca00.flag) {
    assert.equal(playerHud84ca00Flag(gf, ef), want,
      `flag(${gf},${ef}) setg((gf-ef)>1)`);
  }
  /* Wide args never pre-masked: 0x10000 + 100 must behave as 0x10064. */
  assert.equal(playerHud84ca00Flag(0x10000 + 100, 0x10000 + 98), 1);
  assert.equal(playerHud84ca00Flag(0xffffffff, 0xfffffffd), 1); /* diff 2 */

  /* ---- clamp law ---- */
  for (const [p1, p2, want] of ref84ca00.clamp) {
    assert.equal(playerHud84ca00Clamp(p1, p2), want,
      `clamp(${p1.toString(16)},${p2})`);
  }
  /* probe2 wide: only the LOW byte is tested (test al,al) — 0x100 acts 0. */
  assert.equal(playerHud84ca00Clamp(0x3f000000, 0x100), 0x00000000);
  assert.equal(playerHud84ca00Clamp(0x3f000000, 0xffffffff), 0x3f000000);
  /* NaN probe1 with probe2=0: maxss yields 0.0, then the bool zero also. */
  assert.equal(playerHud84ca00Clamp(0x7fc00000, 0), 0x00000000);

  /* ---- per-mask tween selection ---- */
  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  /* Caller 1 mask 0xfffffeff (0x84c206 / 0x9a8b5e): everything but 0x100. */
  assert.deepEqual(
    all.map((i) => playerHud84ca00SlotActive(0xfffffeff, i)),
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  );
  /* Caller 2 mask 0xffffffff (0x84d66d): all 10 slots. */
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0xffffffff, i)),
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  /* test bl,0xc0 coupling: bit 0x80 alone still runs BOTH 0x190 (6) and
     0x1a4 (7); bit 0x40 likewise. */
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x80, i)),
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x40, i)),
    [0, 0, 0, 0, 0, 0, 1, 1, 0, 0]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x1ff, i)),
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x100, i)),
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x200, i)),
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0, i)),
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepEqual(all.map((i) => playerHud84ca00SlotActive(0x300, i)),
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 1]);

  /* ---- per-slot targets (mode byte 0) ---- */
  const bits = (x) => f32bitsOf(x);
  const qnan = 0x7fc00000;
  const blob = {
    e1568: bits(9), e1460: bits(4), e1470: bits(7), e1480: bits(100),
    e1464: bits(0.5), e156c: bits(3),
    probe1: bits(0.5), probe2: 1, probe3: bits(0.25), mode: 0,
    game1adb4: bits(2),
  };
  const t = (s, over) => playerHud84ca00SlotTarget(
    s,
    over?.e1568 ?? blob.e1568, over?.e1460 ?? blob.e1460,
    over?.e1470 ?? blob.e1470, over?.e1480 ?? blob.e1480,
    over?.e1464 ?? blob.e1464, over?.e156c ?? blob.e156c,
    over?.probe1 ?? blob.probe1, over?.probe2 ?? blob.probe2,
    over?.probe3 ?? blob.probe3, over?.mode ?? blob.mode,
    over?.game1adb4 ?? blob.game1adb4,
  );
  /* k0 movss [entry+0x1568]; k1 30.0/(4.0+1.0); k2 [entry+0x1470];
     k3 100.0/40.0; k4 [entry+0x1464]; k5 [entry+0x156c]. */
  assert.equal(t(0), bits(9));
  assert.equal(t(1), bits(6));
  assert.equal(t(2), bits(7));
  assert.equal(t(3), bits(2.5));
  assert.equal(t(4), bits(0.5));
  assert.equal(t(5), bits(3));
  /* k6 mode==0: (1.0-probe3)*clamped*100 = 0.75*0.5*100 = 37.5;
     k7: probe3*clamped*100 = 0.25*0.5*100 = 12.5; k8 xorps 0;
     k9 Game+0x1adb4*100 = 200. */
  assert.equal(t(6), bits(37.5));
  assert.equal(t(7), bits(12.5));
  assert.equal(t(8), bits(0));
  assert.equal(t(9), bits(200));

  /* mode byte != 0: k6 = clamped*100 = 50; k7 unchanged. */
  assert.equal(t(6, { mode: 1 }), bits(50));
  assert.equal(t(7, { mode: 1 }), bits(12.5));
  /* mode wide: low byte tested (cmp byte [esi+0x2ac],0) — 0x100 acts 0. */
  assert.equal(t(6, { mode: 0x100 }), bits(37.5));
  assert.equal(t(6, { mode: 0xffffffff }), bits(50));
  /* probe2=0 zeroes clamped -> k6 0, k7 0 (mode!=0 arm). */
  assert.equal(t(6, { probe2: 0, mode: 1 }), bits(0));
  assert.equal(t(7, { probe2: 0, mode: 1 }), bits(0));
  /* NaN probe1 -> clamped 0.0 -> k6/k7 0. */
  assert.equal(t(6, { probe1: qnan, mode: 1 }), bits(0));
  assert.equal(t(7, { probe1: qnan, mode: 1 }), bits(0));
  /* NaN probe3: k6 mode0 (1-NaN) -> NaN; k7 probe3*clamped -> NaN. */
  assert.equal(t(6, { probe3: qnan }), qnan);
  assert.equal(t(7, { probe3: qnan }), qnan);
  /* k1 order pin: 30/(4+1)=6, NOT (30/4)+1=8.5. */
  assert.notEqual(bits(8.5), bits(6));
  /* Out-of-range slot -> never selected (0). */
  assert.equal(playerHud84ca00SlotTarget(10, ...all.map(() => 0)), 0);

  /* ---- constants pinned to the PE imms / receiver geometry ---- */
  assert.equal(PLAYERHUD_84CA00_VA, 0x0084ca00);
  assert.equal(PLAYERHUD_84CA00_RET_VA, 0x0084cc38);
  assert.equal(PLAYERHUD_84CA00_SLOT_COUNT, 10);
  assert.equal(PLAYERHUD_84CA00_SLOT_STRIDE, 0x14);
  assert.equal(PLAYERHUD_84CA00_SLOT_BASE_118, 0x118);
  assert.equal(PLAYERHUD_84CA00_PLAYER_STRIDE, 0xcc);
  assert.equal(PLAYERHUD_84CA00_ENTRY_PTR_OFF, 0x114);
  assert.equal(PLAYERHUD_84CA00_ENTRY_FRAME_OFF, 0x328);
  assert.equal(PLAYERHUD_84CA00_GAME_FRAME_OFF, 0x264f8);
  assert.equal(PLAYERHUD_84CA00_MODE_BYTE_OFF, 0x2ac);
  assert.equal(PLAYERHUD_84CA00_GAME_1ADB4_OFF, 0x1adb4);
  assert.equal(PLAYERHUD_84CA00_ENTRY_1568, 0x1568);
  assert.equal(PLAYERHUD_84CA00_ENTRY_1460, 0x1460);
  assert.equal(PLAYERHUD_84CA00_ENTRY_1470, 0x1470);
  assert.equal(PLAYERHUD_84CA00_ENTRY_1480, 0x1480);
  assert.equal(PLAYERHUD_84CA00_ENTRY_1464, 0x1464);
  assert.equal(PLAYERHUD_84CA00_ENTRY_156C, 0x156c);
  assert.equal(PLAYERHUD_84CA00_RDATA_30F, 0x00baa8d0);
  assert.equal(PLAYERHUD_84CA00_RDATA_1F, 0x00baa454);
  assert.equal(PLAYERHUD_84CA00_RDATA_40F, 0x00baa904);
  assert.equal(PLAYERHUD_84CA00_RDATA_100F, 0x00baa9d0);
  assert.equal(PLAYERHUD_84CA00_RDATA_ZERO, 0x00ba9fe4);
  assert.equal(PLAYERHUD_84CA00_HOST_VA_PROBE1, 0x007f92b0);
  assert.equal(PLAYERHUD_84CA00_HOST_VA_PROBE2, 0x00749830);
  assert.equal(PLAYERHUD_84CA00_HOST_VA_PROBE3, 0x007f96f0);
  assert.equal(PLAYERHUD_84CA00_PURE_VA_TWEEN, 0x0084d6b0);
});

test("v32 Wasm ≡ JS — mask-dispatch laws (randomized, wide mask/mode)", () => {
  const exp = loadExports();
  let rng = (0x84ca00 ^ 0x5a5) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const hi = (n) => (next() >>> 8) % n;

  const floatBitsPool = [
    0x00000000, 0x3f800000, 0x3e800000, 0xbf000000, /* 0, 1, 0.25, -0.5 */
    0x80000000, /* -0.0 */
    0x7fc00000, 0xffc00000, /* qNaN +/- */
    0x7f800001, /* SNaN */
    0x7f800000, 0xff800000, /* +-Inf */
    0x00000001, /* subnormal */
    0x3f7fffff, 0x3f000000, /* 0.99999994, 0.5 */
    0x3e7fffff, 0x4b000000, /* 0.25-ulp, 8388608 */
    0x41200000, 0xc1200000, /* 10, -10 */
    0x42c80000, /* 100 */
  ];
  const masks = [0, 1, 0x2, 0x20, 0x40, 0x80, 0xc0, 0x100, 0x200, 0x300,
    0x1ff, 0xfffffeff, 0xffffffff, 0x10000001, 0x80000000];
  const modes = [0, 1, 0x100, 0x1ff, 0xff00, 0xffffffff];
  const probe2s = [0, 1, 0x100, 0xffffffff];

  for (let iter = 0; iter < 8000; iter += 1) {
    const pick = () => floatBitsPool[hi(floatBitsPool.length)] >>> 0;
    const e1568 = pick(), e1460 = pick(), e1470 = pick(), e1480 = pick();
    const e1464 = pick(), e156c = pick();
    const probe1 = pick(), probe3 = pick();
    const probe2 = probe2s[hi(probe2s.length)] >>> 0;
    const mode = modes[hi(modes.length)] >>> 0;
    const game1adb4 = pick();
    const mask = masks[hi(masks.length)] >>> 0;
    const gameFrame = next() >>> 0;
    const entryFrame = next() >>> 0;

    assert.equal(exp.flag84ca00(gameFrame, entryFrame) >>> 0,
      playerHud84ca00Flag(gameFrame, entryFrame), `flag iter=${iter}`);
    assert.equal(exp.clamp84ca00(probe1, probe2) >>> 0,
      playerHud84ca00Clamp(probe1, probe2), `clamp iter=${iter}`);
    for (let s = 0; s < PLAYERHUD_84CA00_SLOT_COUNT; s += 1) {
      assert.equal(exp.slotActive84ca00(mask, s) >>> 0,
        playerHud84ca00SlotActive(mask, s), `active${s} iter=${iter}`);
      assert.equal(
        exp.slotTarget84ca00(s, e1568, e1460, e1470, e1480, e1464, e156c,
          probe1, probe2, probe3, mode, game1adb4) >>> 0,
        playerHud84ca00SlotTarget(s, e1568, e1460, e1470, e1480, e1464,
          e156c, probe1, probe2, probe3, mode, game1adb4),
        `target${s} iter=${iter}`);
    }
  }
});

test("v32 mutation checks: flag signed, clamp NaN, c0 coupling, mode byte, recipes", () => {
  const writeSyncRetry = (path, contents) => {
    let last = null;
    for (let i = 0; i < 40; i++) {
      try {
        writeFileSync(path, contents);
        return;
      } catch (err) {
        last = err;
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
      }
    }
    throw last;
  };
  const mutantWasm = join(outDir, "playerhud-post-update-pure-helpers.v32mut.wasm");
  const mutantCpp = join(outDir, "playerhud-post-update-pure-helpers.v32mut.cpp");
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSyncRetry(mutantCpp, orig.replace(mutOld, mutNew));
    buildWasm(mutantWasm, mutantCpp);
    const module = new WebAssembly.Module(readFileSync(mutantWasm));
    const instance = new WebAssembly.Instance(module, {});
    check(instance.exports);
  };

  /* M61: setg signed compare read as unsigned — diff -2 (0xfffffffe) must
     NOT exceed 1. */
  withMutant(
    "  const int32_t diff = (int32_t)(game_frame - entry_frame);\n  return diff > 1 ? 1u : 0u;",
    "  const int32_t diff = (int32_t)(game_frame - entry_frame);\n  return (uint32_t)diff > 1u ? 1u : 0u;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_flag
        ?? wasm._isaac_playerhud_84ca00_flag;
      assert.equal(
        fn(3, 5) >>> 0,
        1,
        "M61 must diverge: setg is signed; diff=-2 must give 0, mutant (unsigned) gives 1",
      );
    },
  );

  /* M62: maxss NaN direction — unordered dest must yield the src (0.0). */
  withMutant(
    "static inline float sse_maxss(float a, float b) {\n  if (a != a) {\n    return b;\n  }",
    "static inline float sse_maxss(float a, float b) {\n  if (a != a) {\n    return a;\n  }",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_clamp
        ?? wasm._isaac_playerhud_84ca00_clamp;
      assert.equal(
        fn(0x7fc00000, 1) >>> 0,
        0x3f800000,
        "M62 must diverge: maxss(NaN,0.0) returns src 0.0; mutant propagates NaN into minss -> 1.0",
      );
    },
  );

  /* M63: c0 coupling dropped — bit 0x80 must still run slot 6 (0x190). */
  withMutant(
    "    case 6u: return (m & 0xc0u) ? 1u : 0u; /* 0x190 */",
    "    case 6u: return (m & 0x40u) ? 1u : 0u; /* 0x190 */",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_slot_active
        ?? wasm._isaac_playerhud_84ca00_slot_active;
      assert.equal(
        fn(0x80, 6) >>> 0,
        0,
        "M63 must diverge: test bl,0xc0 runs 0x190 for bit 0x80 alone",
      );
    },
  );

  /* M64: mode byte low-byte test widened to full dword — 0x100 must pick
     the (1.0-probe3) arm. */
  withMutant(
    "      if ((mode_byte & 0xffu) != 0u) {",
    "      if (mode_byte != 0u) {",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_slot_target
        ?? wasm._isaac_playerhud_84ca00_slot_target;
      const r = fn(6, 0x41100000, 0x40800000, 0x40e00000, 0x42c80000,
        0x3f000000, 0x40400000, 0x3f000000 /*probe1 .5*/, 1,
        0x3e800000 /*probe3 .25*/, 0x100 /*mode low byte 0*/, 0x40000000);
      assert.equal(
        r >>> 0,
        f32bitsOf(50),
        "M64 must diverge: cmp byte [this+0x2ac],0; 0x100 low byte 0 -> (1-0.25)*0.5*100=37.5, mutant clamps*100=50",
      );
    },
  );

  /* M65: k1 recipe order — 30.0/(e1460+1.0), NOT (30.0/e1460)+1.0. */
  withMutant(
    "      return __builtin_bit_cast(uint32_t, 30.0f / (f1460 + 1.0f));",
    "      return __builtin_bit_cast(uint32_t, (30.0f / f1460) + 1.0f);",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_slot_target
        ?? wasm._isaac_playerhud_84ca00_slot_target;
      assert.equal(
        fn(1, 0, 0x40800000 /*e1460=4*/, 0, 0, 0, 0, 0, 0, 0, 0, 0) >>> 0,
        f32bitsOf(8.5),
        "M65 must diverge: divss order is 30.0/(4.0+1.0)=6.0; mutant computes 8.5",
      );
    },
  );

  /* M66: k7 drops the *100 — probe3*clamped*100 vs probe3*clamped. */
  withMutant(
    "      const float m1 = fprobe3 * clamped;\n      return __builtin_bit_cast(uint32_t, m1 * 100.0f);",
    "      const float m1 = fprobe3 * clamped;\n      return __builtin_bit_cast(uint32_t, m1);",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84ca00_slot_target
        ?? wasm._isaac_playerhud_84ca00_slot_target;
      assert.equal(
        fn(7, 0, 0, 0, 0, 0, 0, 0x3f000000 /*probe1 .5*/, 1,
          0x3e800000 /*probe3 .25*/, 0, 0) >>> 0,
        f32bitsOf(0.125),
        "M66 must diverge: mulss xmm5,xmm4 is 0.25*0.5*100=12.5; mutant drops the 100",
      );
    },
  );
});

test("v33 per-player stats-pack updater 0x84cc40 fixed edges (VA 0x0084cc40..0x0084d6ad)", () => {
  /* PE-truth reference transcribed branch-by-branch from
     cpu-dump/0084cc40.txt + 0084ce00/0084d0f0/0084d200/0084d500.
     Gate: 0x84cc9d cmp eax,[ebx+8]; jne 0x84d659 (A tested FIRST);
     0x84d659 cmp eax,edx; jne 0x84d698 (B second). B-hit stores A
     back and calls RecomputeStats 0x84ca00 with (i, -1, i). */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_84CC40_VA, 0x0084cc40);
  assert.equal(PLAYERHUD_84CC40_RET_VA, 0x0084d6ad);
  assert.equal(PLAYERHUD_84CC40_NEXT_VA, 0x0084d6b0); /* v18 tween, landed */
  assert.equal(PLAYERHUD_84CC40_BLOCK_COUNT, 2);
  assert.equal(PLAYERHUD_84CC40_BLOCK_STRIDE, 0xcc);
  assert.equal(PLAYERHUD_84CC40_BLOCK_PLAYER_OFF, 0x114);
  assert.equal(PLAYERHUD_84CC40_SLOT_BASE_OFF, 0x118);
  assert.equal(PLAYERHUD_84CC40_SLOT_COUNT, 10);
  assert.equal(PLAYERHUD_84CC40_SLOT_STRIDE, 0x14);
  assert.equal(PLAYERHUD_84CC40_MODE_BYTE_OFF, 0x2ac);
  assert.equal(PLAYERHUD_84CC40_RECOMPUTE_HOST_VA, 0x0084ca00);
  assert.equal(PLAYERHUD_84CC40_RECOMPUTE_MASK, 0xffffffff);
  /* Geometry self-check: block i player ptr @ this+i*0xcc+0x114;
     slot j @ this+i*0xcc+0x118+j*0x14 (v32 layout by reference). */
  const blockPlayer = (i) =>
    PLAYERHUD_84CC40_BLOCK_PLAYER_OFF + i * PLAYERHUD_84CC40_BLOCK_STRIDE;
  const slotOff = (i, j) =>
    PLAYERHUD_84CC40_SLOT_BASE_OFF + i * PLAYERHUD_84CC40_BLOCK_STRIDE +
    j * PLAYERHUD_84CC40_SLOT_STRIDE;
  assert.equal(blockPlayer(0), 0x114);
  assert.equal(blockPlayer(1), 0x1e0);
  assert.equal(slotOff(0, 0), 0x118);
  assert.equal(slotOff(0, 9), PLAYERHUD_84CC40_SLOT_BASE_OFF + 9 * 0x14);
  assert.equal(slotOff(1, 0), 0x118 + 0xcc);
  assert.equal(slotOff(1, 9), 0x118 + 0xcc + 9 * 0x14);

  /* ---- block_kind gate law ---- */
  assert.equal(playerHud84cc40BlockKind(0x11111111, 0x22222222, 0x33333333), 0);
  assert.equal(playerHud84cc40BlockKind(0x22222222, 0x22222222, 0x33333333), 1);
  assert.equal(playerHud84cc40BlockKind(0x33333333, 0x22222222, 0x33333333), 2);
  /* A tested before B: block == A == B -> SWAP_UPDATE (kind 1). */
  assert.equal(playerHud84cc40BlockKind(0x22222222, 0x22222222, 0x22222222), 1);
  /* Wide / boundary values. */
  assert.equal(playerHud84cc40BlockKind(0, 0, 1), 1);
  assert.equal(playerHud84cc40BlockKind(0, 1, 0), 2);
  assert.equal(playerHud84cc40BlockKind(0xffffffff, 0, 0xffffffff), 2);
  assert.equal(playerHud84cc40BlockKind(0xffffffff, 0xffffffff, 0), 1);

  /* ---- update_needed (B null gate, full dword) ---- */
  assert.equal(playerHud84cc40UpdateNeeded(0), 0);
  assert.equal(playerHud84cc40UpdateNeeded(1), 1);
  assert.equal(playerHud84cc40UpdateNeeded(0x100), 1); /* wide, not low byte */
  assert.equal(playerHud84cc40UpdateNeeded(0xffffffff), 1);

  /* ---- path_flag (reset vs tween) — setg signed wrap (v32 ref) ---- */
  assert.equal(playerHud84cc40PathFlag(10, 1), 1);   /* diff 9 */
  assert.equal(playerHud84cc40PathFlag(3, 1), 1);    /* diff 2 */
  assert.equal(playerHud84cc40PathFlag(2, 1), 0);    /* diff 1, NOT >1 */
  assert.equal(playerHud84cc40PathFlag(0, 0), 0);
  assert.equal(playerHud84cc40PathFlag(0xffffffff, 0), 0); /* diff -1 */
  assert.equal(playerHud84cc40PathFlag(0, 0xfffffffe), 1);  /* diff 2 wrap */
  assert.equal(playerHud84cc40PathFlag(0x100000000, 0), 0); /* truncated 0 */

  /* ---- recompute plan (Push ecx; push -1; push ecx; this; 0x84ca00) ---- */
  for (const i of [0, 1, 0x100, 0xffffffff]) {
    const plan = playerHud84cc40RecomputePlan(i);
    assert.equal(plan.hostVa, PLAYERHUD_84CC40_RECOMPUTE_HOST_VA);
    assert.equal(plan.playerIndex, i >>> 0);
    assert.equal(plan.mask, 0xffffffff);
    assert.equal(plan.dead, i >>> 0); /* push ecx twice: dead == index */
  }
});

test("v33 Wasm ≡ JS — 0x84cc40 gate/plan laws (randomized wide values)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va84cc40() >>> 0, PLAYERHUD_84CC40_VA);
  assert.equal(exp.retVa84cc40() >>> 0, PLAYERHUD_84CC40_RET_VA);
  assert.equal(exp.nextVa84cc40() >>> 0, PLAYERHUD_84CC40_NEXT_VA);
  assert.equal(exp.blockCount84cc40() >>> 0, PLAYERHUD_84CC40_BLOCK_COUNT);
  assert.equal(exp.blockStride84cc40() >>> 0, PLAYERHUD_84CC40_BLOCK_STRIDE);
  assert.equal(exp.blockPlayerOff84cc40() >>> 0, PLAYERHUD_84CC40_BLOCK_PLAYER_OFF);
  assert.equal(exp.slotBaseOff84cc40() >>> 0, PLAYERHUD_84CC40_SLOT_BASE_OFF);
  assert.equal(exp.slotCount84cc40() >>> 0, PLAYERHUD_84CC40_SLOT_COUNT);
  assert.equal(exp.slotStride84cc40() >>> 0, PLAYERHUD_84CC40_SLOT_STRIDE);
  assert.equal(exp.modeByteOff84cc40() >>> 0, PLAYERHUD_84CC40_MODE_BYTE_OFF);
  assert.equal(exp.recomputeHostVa84cc40() >>> 0,
    PLAYERHUD_84CC40_RECOMPUTE_HOST_VA);
  if (exp.memory.buffer.byteLength < 0x20000) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  const base = 0x10000;

  let rng = (0x84cc40 ^ 0x3c3) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };

  for (let iter = 0; iter < 4000; iter += 1) {
    const block = next() >>> 0;
    const a = next() >>> 0;
    const b = next() >>> 0;
    /* recompute_plan writes a 5-dword packed struct. */
    exp.recomputePlan84cc40(base + 0x40, iter);
    assert.equal(view.getUint32(base + 0x40, true), PLAYERHUD_84CC40_RECOMPUTE_HOST_VA,
      `hostVa iter=${iter}`);
    assert.equal(view.getUint32(base + 0x44, true), iter >>> 0,
      `playerIndex iter=${iter}`);
    assert.equal(view.getUint32(base + 0x48, true), 0xffffffff,
      `mask iter=${iter}`);
    assert.equal(view.getUint32(base + 0x4c, true), iter >>> 0,
      `dead iter=${iter}`);
    assert.equal(view.getUint32(base + 0x50, true), 0xc,
      `retBytes iter=${iter}`);
    const js = playerHud84cc40RecomputePlan(iter);
    assert.equal(js.hostVa, 0x0084ca00);
    assert.equal(js.dead, iter >>> 0);

    assert.equal(exp.blockKind84cc40(block, a, b) >>> 0,
      playerHud84cc40BlockKind(block, a, b), `kind iter=${iter}`);
    assert.equal(exp.updateNeeded84cc40(b) >>> 0,
      playerHud84cc40UpdateNeeded(b), `update iter=${iter}`);
  }

  /* fixed path_flag sweep incl. wrap corners */
  const fixedFrames = [0, 1, 2, 3, 0x7fffffff, 0x80000000, 0xffffffff,
    0xfffffffe, 0x100000000, 0x1ffffffff];
  for (const gf of fixedFrames) {
    for (const ef of fixedFrames) {
      assert.equal(exp.pathFlag84cc40(gf >>> 0, ef >>> 0) >>> 0,
        playerHud84cc40PathFlag(gf >>> 0, ef >>> 0),
        `path gf=${gf} ef=${ef}`);
    }
  }
});

test("v33 mutation checks: kind order, recompute mask, stride, update gate byte", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
    }
  };

  /* M67: A/B first-test order swapped — block==A==B must be SWAP_UPDATE. */
  withMutant(
    "  if (block_player == player_a) {\n    return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_UPDATE);\n  }\n  if (block_player == player_b) {",
    "  if (block_player == player_b) {\n    return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_RECOMPUTE);\n  }\n  if (block_player == player_a) {",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84cc40_block_kind
        ?? wasm._isaac_playerhud_84cc40_block_kind;
      assert.equal(
        fn(0x22222222, 0x22222222, 0x22222222) >>> 0,
        2,
        "M67 must diverge: cmp A is first in the PE; block==A==B must be SWAP_UPDATE(1), mutant order gives RECOMPUTE(2)",
      );
    },
  );

  /* M68: recompute mask -1 -> 0 — plan mask must be 0xffffffff. */
  withMutant(
    "  out->mask = ISAAC_PLAYERHUD_84CC40_RECOMPUTE_MASK;",
    "  out->mask = 0u;",
    (wasm) => {
      const plan = wasm.isaac_playerhud_84cc40_recompute_plan
        ?? wasm._isaac_playerhud_84cc40_recompute_plan;
      const mem = wasm.memory;
      const base = 0x10000;
      if (mem.buffer.byteLength < base + 0x20) mem.grow(1);
      const view = new DataView(mem.buffer);
      plan(base, 3);
      assert.equal(
        view.getUint32(base + 8, true),
        0,
        "M68 must diverge: push -1 is the mask; PE commits 0xffffffff, mutant writes 0",
      );
    },
  );

  /* M69: block stride 0xcc -> 0xd0 — geometry law. */
  withMutant(
    "  return static_cast<uint32_t>(ISAAC_PLAYERHUD_84CC40_BLOCK_STRIDE);",
    "  return static_cast<uint32_t>(0xd0);",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84cc40_block_stride
        ?? wasm._isaac_playerhud_84cc40_block_stride;
      assert.equal(
        fn() >>> 0,
        0xd0,
        "M69 must diverge: two player blocks are stride 0xcc (imul edi,ecx,0xcc @ 0x84cc90); mutant writes 0xd0",
      );
    },
  );

  /* M70: update_needed low-byte test — 0x100 must be non-null (test edx,edx). */
  withMutant(
    "  return player_b != 0u ? 1u : 0u;",
    "  return (player_b & 0xffu) != 0u ? 1u : 0u;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_84cc40_update_needed
        ?? wasm._isaac_playerhud_84cc40_update_needed;
      assert.equal(
        fn(0x100) >>> 0,
        0,
        "M70 must diverge: test edx,edx is a full-dword null gate; 0x100 must update (pure 1), mutant low-byte test gives 0",
      );
    },
  );
});

test("v34 leaf gate 0x856f50 fixed edges (VA 0x00856f50..0x00856f61)", () => {
  /* PE-truth reference transcribed branch-by-branch from
     cpu-dump/00856f50.txt:
       0x00856f50 mov eax,[ecx+8]     ; field = this->f8
       0x00856f53 cmp eax,2           ; FULL-dword equality
       0x00856f56 je  0x856f5f        ; field == 2 -> return 1
       0x00856f58 test eax,eax        ; FULL-dword null test
       0x00856f5a je  0x856f5f        ; field == 0 -> return 1
       0x00856f5c xor al,al           ; return 0
       0x00856f5e ret
       0x00856f5f mov al,1            ; return 1
       0x00856f61 ret
     Result: 1 iff field == 2 || field == 0.  No byte gate anywhere:
     the 0x100/0x1ff wide cases MUST return 0 (a low-byte-masked
     reading of "0 is falsy" would wrongly return 1). */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_856F50_VA, 0x00856f50);
  assert.equal(PLAYERHUD_856F50_RET_VA, 0x00856f61);
  assert.equal(PLAYERHUD_856F50_NEXT_VA, 0x00856f70); /* SEH ctor host */
  assert.equal(PLAYERHUD_856F50_FIELD_OFF, 8);
  /* Field geometry self-check: mov eax,[ecx+8] @ 0x856f50. */
  assert.equal(playerHud856f50FieldOff(), 8);
  assert.equal(playerHud856f50Va(), 0x00856f50);
  assert.equal(playerHud856f50RetVa(), 0x00856f61);
  assert.equal(playerHud856f50NextVa(), 0x00856f70);

  /* ---- gate law ---- */
  assert.equal(playerHud856f50Gate(0), 1);           /* ==0 arm */
  assert.equal(playerHud856f50Gate(2), 1);           /* ==2 arm */
  assert.equal(playerHud856f50Gate(1), 0);
  assert.equal(playerHud856f50Gate(3), 0);
  /* Wide values: full-dword tests — high bits must NOT collapse. */
  assert.equal(playerHud856f50Gate(0x100), 0);       /* wide, not 0/2 */
  assert.equal(playerHud856f50Gate(0x1ff), 0);
  assert.equal(playerHud856f50Gate(0xffffffff), 0);
  assert.equal(playerHud856f50Gate(0x100000000), 1); /* truncated 0 */
  assert.equal(playerHud856f50Gate(0x300000001), 0); /* truncated 1 */
});

test("v34 Wasm ≡ JS — 0x856f50 leaf gate (randomized wide values)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va856f50() >>> 0, PLAYERHUD_856F50_VA);
  assert.equal(exp.retVa856f50() >>> 0, PLAYERHUD_856F50_RET_VA);
  assert.equal(exp.nextVa856f50() >>> 0, PLAYERHUD_856F50_NEXT_VA);
  assert.equal(exp.fieldOff856f50() >>> 0, PLAYERHUD_856F50_FIELD_OFF);

  let rng = (0x856f50 ^ 0x2d2d) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };

  /* Fixed edge sweep incl. the truncation corners. */
  const fixed = [0, 1, 2, 3, 0xff, 0x100, 0x1ff, 0x7fffffff, 0x80000000,
    0xffffffff, 0x100000000, 0x300000000, 0x100000002, 0xfffffffe];
  for (const v of fixed) {
    assert.equal(exp.gate856f50(v >>> 0) >>> 0, playerHud856f50Gate(v >>> 0),
      `gate v=${v}`);
  }

  for (let iter = 0; iter < 4000; iter += 1) {
    const v = next() >>> 0;
    assert.equal(exp.gate856f50(v) >>> 0, playerHud856f50Gate(v),
      `gate iter=${iter} v=${v}`);
  }
});

test("v34 mutation checks: dropped arms, byte-mask, next VA", () => {
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
    }
  };

  /* M71: drop the ==0 arm — gate(0) must stay 1 (je @ 0x856f58). */
  withMutant(
    "  if (field_8 == 2u || field_8 == 0u) {",
    "  if (field_8 == 2u) {",
    (wasm) => {
      const fn = wasm.isaac_playerhud_856f50_gate
        ?? wasm._isaac_playerhud_856f50_gate;
      assert.equal(
        fn(0) >>> 0,
        0,
        "M71 must diverge: test eax,eax; je 0x856f5f — field 0 returns 1 in the PE; mutant with only the ==2 arm returns 0",
      );
    },
  );

  /* M72: drop the ==2 arm — gate(2) must stay 1 (je @ 0x856f56). */
  withMutant(
    "  if (field_8 == 2u || field_8 == 0u) {",
    "  if (field_8 == 0u) {",
    (wasm) => {
      const fn = wasm.isaac_playerhud_856f50_gate
        ?? wasm._isaac_playerhud_856f50_gate;
      assert.equal(
        fn(2) >>> 0,
        0,
        "M72 must diverge: cmp eax,2; je 0x856f5f — field 2 returns 1 in the PE; mutant with only the ==0 arm returns 0",
      );
    },
  );

  /* M73: low-byte mask — 0x100 must return 0 (cmp/test are dword). */
  withMutant(
    "  if (field_8 == 2u || field_8 == 0u) {",
    "  if ((field_8 & 0xffu) == 2u || (field_8 & 0xffu) == 0u) {",
    (wasm) => {
      const fn = wasm.isaac_playerhud_856f50_gate
        ?? wasm._isaac_playerhud_856f50_gate;
      assert.equal(
        fn(0x100) >>> 0,
        1,
        "M73 must diverge: PE compares the FULL dword (cmp eax,2 / test eax,eax); 0x100 is neither 2 nor 0 so the PE returns 0, mutant low-byte mask sees 0x00 and returns 1",
      );
    },
  );

  /* M74: next VA drift — the next body is 0x856f70 (SEH ctor host). */
  withMutant(
    "  return ISAAC_PLAYERHUD_856F50_NEXT_VA;",
    "  return 0x00857280u;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_856f50_next_va
        ?? wasm._isaac_playerhud_856f50_next_va;
      assert.equal(
        fn() >>> 0,
        0x00857280,
        "M74 must diverge: after ret 0x856f61 the int3 pad runs to 0x856f70; the ctor host at 0x857280 is two bodies later",
      );
    },
  );
});

/* ============================ ABI v35 ============================ */

test("v35 FUN_0085af30 time-pack leaf fixed edges (VA 0x0085af30..0x0085afaf)", () => {
  /* PE-truth reference transcribed instruction-by-instruction from
     cpu-dump/0085af30.txt:
       0x0085af30 push ebx; push esi; push edi
       0x0085af33 mov edi,edx            ; value
       0x0085af35 mov eax,0xd1b71759; mul edi
       0x0085af3e mov esi,edx; shr esi,0xd  ; q10000 = value/10000
       0x0085af43 imul eax,esi,0xffffd8f0; add edi,eax ; r10000
       0x0085af6a mov eax,0x51eb851f; mul edi; shr edx,5 ; q100
       0x0085af82 imul eax,edx,0x64; sub edi,eax        ; rem100
       0x0085af93 or byte [ebx],2
       0x0085af9b mov [ebx+0x20],edx-1
       0x0085afa4 mov [ebx+0x1c],edi
       0x0085afa8 mov [ebx+0x24],esi-0x76c
     ecx = out struct, edx = value, eax = out.  Next VA 0x85afb0 is
     frame-effect-owned (isaac_frame_effect_85afb0_*, already landed). */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_85AF30_VA, 0x0085af30);
  assert.equal(PLAYERHUD_85AF30_RET_VA, 0x0085afaf);
  assert.equal(PLAYERHUD_85AF30_NEXT_VA, 0x0085afb0); /* frame-effect */
  assert.equal(PLAYERHUD_85AF30_OBJECT_SIZE, 0x38); /* call-site footprint */
  assert.equal(PLAYERHUD_85AF30_PACK_DWORD_COUNT, 13);
  assert.equal(PLAYERHUD_85AF30_FLAG_BYTE, 2);
  assert.equal(PLAYERHUD_85AF30_DIV10000_MAGIC, 0xd1b71759);
  assert.equal(PLAYERHUD_85AF30_DIV10000_SHIFT, 45);
  assert.equal(PLAYERHUD_85AF30_DIV100_MAGIC, 0x51eb851f);
  assert.equal(PLAYERHUD_85AF30_DIV100_SHIFT, 37);
  assert.equal(PLAYERHUD_85AF30_YEAR_BASE, 0x76c);
  assert.equal(playerHud85af30Va(), 0x0085af30);
  assert.equal(playerHud85af30RetVa(), 0x0085afaf);
  assert.equal(playerHud85af30NextVa(), 0x0085afb0);
  assert.equal(playerHud85af30ObjectSize(), 0x38);

  /* ---- pure laws ---- */
  assert.equal(playerHud85af30Div10000(0), 0);
  assert.equal(playerHud85af30Div10000(9999), 0);
  assert.equal(playerHud85af30Div10000(10000), 1);
  assert.equal(playerHud85af30Div10000(123456789), 12345);
  assert.equal(playerHud85af30Div10000(0xffffffff), 429496);
  assert.equal(playerHud85af30Div10000(0x80000000), 214748); /* high bit */

  assert.equal(playerHud85af30Rem100(0), 0);
  assert.equal(playerHud85af30Rem100(99), 99);
  assert.equal(playerHud85af30Rem100(100), 0);
  assert.equal(playerHud85af30Rem100(123456789), 89);
  assert.equal(playerHud85af30Rem100(999999999), 99);
  assert.equal(playerHud85af30Rem100(0xffffffff), 95); /* 4294967295 % 100 */

  assert.equal(playerHud85af30Q100Minus1(0), -1);      /* q100 0 -> -1 */
  assert.equal(playerHud85af30Q100Minus1(99), -1);
  assert.equal(playerHud85af30Q100Minus1(123456789), 66); /* 6789/100-1 */
  assert.equal(playerHud85af30Q100Minus1(0xffffffff), 71); /* 7295/100-1 */

  assert.equal(playerHud85af30Q10000Minus1900(0), -1900);
  assert.equal(playerHud85af30Q10000Minus1900(19000000), 0);
  assert.equal(playerHud85af30Q10000Minus1900(123456789), 10445);
  assert.equal(playerHud85af30Q10000Minus1900(0xffffffff), 427596);

  /* ---- pack store set ---- */
  const pack = (value, seed) => {
    const s = seed ?? new Array(PLAYERHUD_85AF30_PACK_DWORD_COUNT)
      .fill(0xaaaaaaaa);
    return playerHud85af30Pack(s, value);
  };
  const p0 = pack(0);
  assert.equal(p0.length, 13);
  assert.equal(p0[0], 0xaaaaaa02);     /* byte +0 = 2; +1..+3 keep seed */
  assert.equal(p0[1], 0xaaaaaaaa);     /* +4 preserved */
  assert.equal(p0[2], 0);              /* +8 */
  assert.equal(p0[3], 0);              /* +c */
  assert.equal(p0[4], 0);              /* +0x10 */
  assert.equal(p0[5], 0);              /* +0x14 */
  assert.equal(p0[6], 0);              /* +0x18 */
  assert.equal(p0[7], 0);              /* +0x1c rem100(0) = 0 */
  assert.equal(p0[8], 0xffffffff >>> 0); /* +0x20 q100-1 = -1 */
  assert.equal(p0[9], 0xfffff894 >>> 0); /* +0x24 0-1900 = -1900 */
  assert.equal(p0[10], 0);             /* +0x28 */
  assert.equal(p0[11], 0);             /* +0x2c */
  assert.equal(p0[12], 0);             /* +0x30 */

  /* Zero seed: byte +0 = 2 exactly. */
  assert.equal(pack(0, new Array(13).fill(0))[0], 2);

  /* byte store: high bytes of +0 keep the seed, low byte = 2. */
  const pseed = new Array(13).fill(0xaaaaaaaa);
  pseed[0] = 0xdeadbeef;
  const ph = pack(0, pseed);
  assert.equal(ph[0], ((0xdeadbeef & 0xffffff00) | 2) >>> 0);
  /* +4 preserved from seed even for a nontrivial value. */
  const pv = pack(123456789, pseed);
  assert.equal(pv[1], 0xaaaaaaaa);
  assert.equal(pv[7], 89);            /* rem100 */
  assert.equal(pv[8] | 0, 66);        /* q100 - 1 */
  assert.equal(pv[9] | 0, 10445);     /* q10000 - 1900 */

  /* 0x10000 = 65536: q10000 = 6, r10000 = 5536, q100 = 55 ->
   +0x1c rem100 = 36, +0x20 q100-1 = 54, +0x24 6-1900 = -1894. */
  const pw = pack(0x10000);
  assert.equal(pw[7], 36);
  assert.equal(pw[8] | 0, 54);
  assert.equal(pw[9] | 0, -1894);
});

test("v35 Wasm ≡ JS — 0x85af30 time-pack leaf (randomized wide values)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va85af30() >>> 0, PLAYERHUD_85AF30_VA);
  assert.equal(exp.retVa85af30() >>> 0, PLAYERHUD_85AF30_RET_VA);
  assert.equal(exp.nextVa85af30() >>> 0, PLAYERHUD_85AF30_NEXT_VA);
  assert.equal(exp.objectSize85af30() >>> 0, PLAYERHUD_85AF30_OBJECT_SIZE);

  const base = 0x20000;
  const bytes = PLAYERHUD_85AF30_OBJECT_SIZE;
  if (exp.memory.buffer.byteLength < base + bytes) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  const call = (value, seed) => {
    for (let i = 0; i < PLAYERHUD_85AF30_PACK_DWORD_COUNT; i += 1) {
      view.setUint32(base + i * 4, seed[i] >>> 0, true);
    }
    exp.pack85af30(base, value >>> 0);
    const out = [];
    for (let i = 0; i < PLAYERHUD_85AF30_PACK_DWORD_COUNT; i += 1) {
      out.push(view.getUint32(base + i * 4, true));
    }
    return out;
  };

  let rng = (0x85af30 ^ 0x2e2e) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };

  /* Fixed edge sweep incl. the wide/truncation corners. */
  const fixed = [0, 1, 99, 100, 9999, 10000, 0x10000, 0x7fffffff,
    0x80000000, 0xffffffff, 0x100000000, 0x123456789, 0xffffffffff];
  const poison = new Array(PLAYERHUD_85AF30_PACK_DWORD_COUNT)
    .fill(0xaaaaaaaa);
  for (const v of fixed) {
    const j = playerHud85af30Pack(poison, v >>> 0);
    const c = call(v >>> 0, poison);
    assert.deepEqual(c, j, `pack v=${v}`);
    assert.equal(exp.div1000085af30(v >>> 0) >>> 0,
      playerHud85af30Div10000(v >>> 0), `div10000 v=${v}`);
    assert.equal(exp.rem10085af30(v >>> 0) >>> 0,
      playerHud85af30Rem100(v >>> 0), `rem100 v=${v}`);
    assert.equal(exp.q100Minus185af30(v >>> 0) | 0,
      playerHud85af30Q100Minus1(v >>> 0), `q100-1 v=${v}`);
    assert.equal(exp.q10000Minus190085af30(v >>> 0) | 0,
      playerHud85af30Q10000Minus1900(v >>> 0), `q10000-1900 v=${v}`);
  }

  for (let iter = 0; iter < 4000; iter += 1) {
    const v = next();
    const seed = Array.from(
      { length: PLAYERHUD_85AF30_PACK_DWORD_COUNT }, () => next());
    const j = playerHud85af30Pack(seed, v);
    const c = call(v, seed);
    assert.deepEqual(c, j, `pack iter=${iter} v=${v >>> 0}`);
    assert.equal(exp.div1000085af30(v) >>> 0,
      playerHud85af30Div10000(v), `div10000 iter=${iter}`);
    assert.equal(exp.rem10085af30(v) >>> 0,
      playerHud85af30Rem100(v), `rem100 iter=${iter}`);
    assert.equal(exp.q100Minus185af30(v) | 0,
      playerHud85af30Q100Minus1(v), `q100-1 iter=${iter}`);
    assert.equal(exp.q10000Minus190085af30(v) | 0,
      playerHud85af30Q10000Minus1900(v), `q10000-1900 iter=${iter}`);
  }
});

test("v35 mutation checks: rem100 store, flag byte, div10000 shift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const base = 0x20000;
  const poison = new Array(PLAYERHUD_85AF30_PACK_DWORD_COUNT)
    .fill(0xaaaaaaaa);
  const seedAndRead = (wasm) => {
    const v = new DataView(wasm.memory.buffer);
    if (wasm.memory.buffer.byteLength < base + 0x38) wasm.memory.grow(1);
    for (let i = 0; i < PLAYERHUD_85AF30_PACK_DWORD_COUNT; i += 1) {
      v.setUint32(base + i * 4, poison[i], true);
    }
    const fn = wasm.isaac_playerhud_85af30_pack
      ?? wasm._isaac_playerhud_85af30_pack;
    fn(base, 123); /* rem100 = 23, q100 = 1 */
    return v;
  };

  /* M75: pack computes rem100 as q100 instead of the %100 remainder —
     PE keeps the 0x85af96 sub edi,eax remainder (23 for 123), mutant
     would store q100 (1). */
  withMutant(
    "  const uint32_t rem100 = r10000 - q100 * 100u;",
    "  const uint32_t rem100 = q100;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint32(base + 0x1c, true),
        1,
        "M75 must diverge: PE writes rem100 (123 % 100 = 23); mutant writes q100 (1)",
      );
    },
  );

  /* M76: drop the or-2 flag — byte +0 must be 2 in the PE. */
  withMutant(
    "  bytes[0] = static_cast<uint8_t>(ISAAC_PLAYERHUD_85AF30_FLAG_BYTE);",
    "  bytes[0] = 0;",
    (wasm) => {
      const v = seedAndRead(wasm);
      assert.equal(
        v.getUint8(base),
        0,
        "M76 must diverge: PE 0x85af93 or byte [ebx],2 — byte +0 = 2; mutant leaves 0",
      );
    },
  );

  /* M77: div10000 shift 45 -> 44 — value 10000 must divide to 1. */
  withMutant(
    "      (static_cast<uint64_t>(value) * ISAAC_PLAYERHUD_85AF30_DIV10000_MAGIC) >>\n      ISAAC_PLAYERHUD_85AF30_DIV10000_SHIFT);",
    "      (static_cast<uint64_t>(value) * ISAAC_PLAYERHUD_85AF30_DIV10000_MAGIC) >>\n      (ISAAC_PLAYERHUD_85AF30_DIV10000_SHIFT - 1));",
    (wasm) => {
      const fn = wasm.isaac_playerhud_85af30_value_div10000
        ?? wasm._isaac_playerhud_85af30_value_div10000;
      assert.equal(
        fn(10000) >>> 0,
        2,
        "M77 must diverge: PE shr esi,0xd (45) — 10000/10000 = 1; mutant shift-44 gives 2",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  const view = new DataView(exp.memory.buffer);
  if (exp.memory.buffer.byteLength < base + 0x38) exp.memory.grow(1);
  for (let i = 0; i < PLAYERHUD_85AF30_PACK_DWORD_COUNT; i += 1) {
    view.setUint32(base + i * 4, poison[i], true);
  }
  exp.pack85af30(base, 123);
  const out = [];
  for (let i = 0; i < PLAYERHUD_85AF30_PACK_DWORD_COUNT; i += 1) {
    out.push(view.getUint32(base + i * 4, true));
  }
  assert.deepEqual(out, playerHud85af30Pack(poison, 123));
});

/* ============================ ABI v36 ============================ */

test("v36 FUN_00858870 ordinal-suffix leaf fixed edges (VA 0x00858870..0x008588e5)", () => {
  /* PE-truth reference transcribed instruction-by-instruction from
     cpu-dump/00858870.txt:
       0x00858870 push ebp; mov ebp,esp; mov ecx,[ebp+8]  ; value (int32)
       0x00858876 mov eax,0x51eb851f; imul ecx
       0x0085887d sar edx,5; mov eax,edx; shr eax,31; add eax,edx
                                                     ; q100 = value/100
       0x00858887 mov edx,ecx; imul eax,eax,0x64; sub edx,eax
                                                     ; r100 = value%100
       0x0085888e sub edx,0xb; je TH; sub edx,1; je TH; sub edx,1; je TH
                                                     ; r100 == 11/12/13
       0x0085889d mov eax,0x66666667; imul ecx
       0x008588a4 sar edx,2; mov eax,edx; shr eax,31; add eax,edx
                                                     ; q10 = value/10
       0x008588ae lea eax,[eax+eax*4]; add eax,eax; sub ecx,eax
                                                     ; r10 = value%10
       0x008588b5 sub ecx,1; je ST; sub ecx,1; je ND; sub ecx,1; jne TH
                                                     ; 1 ST / 2 ND / 3 RD
       0x008588c4 mov eax,0xb6e4c4   (RD); pop ebp; ret 4
       0x008588cd mov eax,0xb6e4c0   (ND); pop ebp; ret 4
       0x008588d6 mov eax,0xb6e4cc   (ST); pop ebp; ret 4
       0x008588df mov eax,0xb6e4c8   (TH); pop ebp; ret 4
     The magic + sar + sign-fix is the MSVC SIGNED div-by-constant
     (truncation toward zero — C `%` semantics), verified for the full
     int32 range incl. INT32_MIN/MAX.  Suffix strings (4-byte each):
     0xb6e4c0 "nd", 0xb6e4c4 "rd", 0xb6e4c8 "th", 0xb6e4cc "st". */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_858870_VA, 0x00858870);
  assert.equal(PLAYERHUD_858870_RET_VA, 0x008588e5);
  assert.equal(PLAYERHUD_858870_NEXT_VA, 0x008588f0); /* SEH giant host */
  assert.equal(PLAYERHUD_858870_ST_VA, 0x00b6e4cc);
  assert.equal(PLAYERHUD_858870_ND_VA, 0x00b6e4c0);
  assert.equal(PLAYERHUD_858870_RD_VA, 0x00b6e4c4);
  assert.equal(PLAYERHUD_858870_TH_VA, 0x00b6e4c8);
  assert.equal(PLAYERHUD_858870_DIV100_MAGIC, 0x51eb851f); /* signed */
  assert.equal(PLAYERHUD_858870_DIV100_SHIFT, 5);
  assert.equal(PLAYERHUD_858870_DIV10_MAGIC, 0x66666667); /* signed */
  assert.equal(PLAYERHUD_858870_DIV10_SHIFT, 2);
  assert.equal(PLAYERHUD_858870_CALLER1_VA, 0x00858f20);
  assert.equal(PLAYERHUD_858870_CALLER2_VA, 0x0085902e);
  assert.equal(playerHud858870Va(), 0x00858870);
  assert.equal(playerHud858870RetVa(), 0x008588e5);
  assert.equal(playerHud858870NextVa(), 0x008588f0);

  /* ---- signed remainders (truncation toward zero) ---- */
  assert.equal(playerHud858870Rem100(0), 0);
  assert.equal(playerHud858870Rem100(99), 99);
  assert.equal(playerHud858870Rem100(100), 0);
  assert.equal(playerHud858870Rem100(101), 1);
  assert.equal(playerHud858870Rem100(123456789), 89);
  assert.equal(playerHud858870Rem100(-1), -1);
  assert.equal(playerHud858870Rem100(-99), -99);
  assert.equal(playerHud858870Rem100(-100), 0);
  assert.equal(playerHud858870Rem100(-101), -1);
  assert.equal(playerHud858870Rem100(0x7fffffff), 47);
  assert.equal(playerHud858870Rem100(-0x80000000), -48);
  assert.equal(playerHud858870Rem10(0), 0);
  assert.equal(playerHud858870Rem10(9), 9);
  assert.equal(playerHud858870Rem10(10), 0);
  assert.equal(playerHud858870Rem10(11), 1);
  assert.equal(playerHud858870Rem10(123456789), 9);
  assert.equal(playerHud858870Rem10(-1), -1);
  assert.equal(playerHud858870Rem10(-11), -1);
  assert.equal(playerHud858870Rem10(0x7fffffff), 7);
  assert.equal(playerHud858870Rem10(-0x80000000), -8);

  /* ---- ordinal suffix law ---- */
  assert.equal(playerHud858870OrdinalSuffixVa(0), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(1), PLAYERHUD_858870_ST_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(2), PLAYERHUD_858870_ND_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(3), PLAYERHUD_858870_RD_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(4), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(9), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(10), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(11), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(12), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(13), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(14), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(21), PLAYERHUD_858870_ST_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(22), PLAYERHUD_858870_ND_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(23), PLAYERHUD_858870_RD_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(99), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(100), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(101), PLAYERHUD_858870_ST_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(111), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(112), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(113), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(114), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(121), PLAYERHUD_858870_ST_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(0x100), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(0x1ff), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(0x10000000),
    PLAYERHUD_858870_TH_VA);
  /* SIGNED: negatives never match the positive arms (-11 != 11). */
  assert.equal(playerHud858870OrdinalSuffixVa(-1), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-11), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-12), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-13), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-21), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-99), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-100), PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(0x7fffffff),
    PLAYERHUD_858870_TH_VA);
  assert.equal(playerHud858870OrdinalSuffixVa(-0x80000000),
    PLAYERHUD_858870_TH_VA);
});

test("v36 Wasm ≡ JS — 0x858870 ordinal-suffix leaf (randomized wide values)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va858870() >>> 0, PLAYERHUD_858870_VA);
  assert.equal(exp.retVa858870() >>> 0, PLAYERHUD_858870_RET_VA);
  assert.equal(exp.nextVa858870() >>> 0, PLAYERHUD_858870_NEXT_VA);

  const fixed = [
    0, 1, 2, 3, 4, 9, 10, 11, 12, 13, 14, 19, 20, 21, 22, 23, 99, 100,
    101, 110, 111, 112, 113, 114, 120, 121, 122, 123, 999, 1000, 1001,
    0x100, 0x1ff, 0x7fffffff, 0x80000000, 0x80000001, 0xffffffff,
    0xffffffed, 0xfffffffb, 0xfffffff0,
    -1, -2, -3, -11, -12, -13, -21, -99, -100, -101, -123, -2147483648,
  ];
  for (const v of fixed) {
    const suffix = playerHud858870OrdinalSuffixVa(v);
    assert.equal(exp.suffixVa858870(v | 0) >>> 0, suffix >>> 0,
      `suffix v=${v}`);
    assert.equal(exp.rem100858870(v | 0) | 0, playerHud858870Rem100(v),
      `rem100 v=${v}`);
    assert.equal(exp.rem1085870(v | 0) | 0, playerHud858870Rem10(v),
      `rem10 v=${v}`);
  }

  let rng = (0x858870 ^ 0x3a11) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  for (let iter = 0; iter < 4000; iter += 1) {
    const v = next() | 0; /* full int32 span, signed */
    assert.equal(exp.suffixVa858870(v) >>> 0,
      playerHud858870OrdinalSuffixVa(v) >>> 0, `suffix iter=${iter} v=${v}`);
    assert.equal(exp.rem100858870(v) | 0, playerHud858870Rem100(v),
      `rem100 iter=${iter} v=${v}`);
    assert.equal(exp.rem1085870(v) | 0, playerHud858870Rem10(v),
      `rem10 iter=${iter} v=${v}`);
  }
});

test("v36 mutation checks: 11/12/13 guard, st/nd swap, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const suffix = (wasm, v) => {
    const fn = wasm.isaac_playerhud_858870_ordinal_suffix_va
      ?? wasm._isaac_playerhud_858870_ordinal_suffix_va;
    return fn(v | 0) >>> 0;
  };

  /* M78: drop the 11/12/13 th-guard — PE value 11 -> TH (0xb6e4c8);
     mutant r100==11 falls to the r10==1 arm -> ST (0xb6e4cc). */
  withMutant(
    "  if (r100 == 11 || r100 == 12 || r100 == 13) {",
    "  if (r100 == 110 || r100 == 12 || r100 == 13) {",
    (wasm) => {
      assert.equal(
        suffix(wasm, 11),
        PLAYERHUD_858870_ST_VA,
        "M78 must diverge: PE 11th -> TH; mutant -> ST",
      );
    },
  );

  /* M79: swap the st/nd arms — PE value 1 -> ST (0xb6e4cc);
     mutant r10==1 returns ND (0xb6e4c0). */
  withMutant(
    "  if (r10 == 1) {\n    return ISAAC_PLAYERHUD_858870_ST_VA;\n  }",
    "  if (r10 == 1) {\n    return ISAAC_PLAYERHUD_858870_ND_VA;\n  }",
    (wasm) => {
      assert.equal(
        suffix(wasm, 1),
        PLAYERHUD_858870_ND_VA,
        "M79 must diverge: PE 1st -> ST; mutant -> ND",
      );
    },
  );

  /* M80: next-VA drift (0x8588f0 -> 0x8588e5) — PE next body is the SEH
     giant at 0x8588f0 (int3 pad 0x8588e8..0x8588ef). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_858870_next_va(void) {\n  return ISAAC_PLAYERHUD_858870_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_858870_next_va(void) {\n  return ISAAC_PLAYERHUD_858870_RET_VA;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_858870_next_va
        ?? wasm._isaac_playerhud_858870_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_858870_RET_VA,
        "M80 must diverge: PE next 0x8588f0; mutant returns ret VA",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.suffixVa858870(1) >>> 0, PLAYERHUD_858870_ST_VA);
  assert.equal(exp.suffixVa858870(11) >>> 0, PLAYERHUD_858870_TH_VA);
  assert.equal(exp.nextVa858870() >>> 0, PLAYERHUD_858870_NEXT_VA);
});

/* ============================ ABI v37 ============================ */

test("v37 FUN_00857400 leaderboard type->entry getter fixed edges (VA 0x00857400..0x0085743c)", () => {
  /* PE-truth reference transcribed instruction-by-instruction from
     cpu-dump/00857400.txt:
       0x00857400 mov eax,[ecx+8]      ; kind, FULL-DWORD load
       0x00857403 cmp eax,3
       0x00857406 ja 0x85742b          ; UNSIGNED gate (no byte mask)
       0x00857408 jmp [eax*4+0x857440] ; jump table 0x857440
       0x0085740f mov eax,[ecx+0x238]  ; kind 0
       0x00857416 mov eax,[ecx+0x23c]  ; kind 1
       0x0085741d mov eax,[ecx+0x240]  ; kind 2
       0x00857424 mov eax,[ecx+0x244]  ; kind 3
       0x0085742b push 0xb6e4f0; push 8; call 0xa112c0; add esp,8;
                    xor eax,eax        ; kind>3: host log + 0
     Leaderboard ctor (inside 0x858610) writes kind at +8 as a DWORD
     from [ebp+8] (0x85867a); slots +0x238..0x244; [this+0xc] mode;
     [this+0x24c] = 0xffffffff.  All 9 callers test eax,eax; je. */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_857400_VA, 0x00857400);
  assert.equal(PLAYERHUD_857400_RET_VA, 0x0085743c);
  assert.equal(PLAYERHUD_857400_NEXT_VA, 0x00857450); /* game-update v56 */
  assert.equal(PLAYERHUD_857400_KIND_MAX, 3);
  assert.equal(PLAYERHUD_857400_ENTRY_COUNT, 4);
  assert.equal(PLAYERHUD_857400_SLOT_BASE, 0x238);
  assert.equal(PLAYERHUD_857400_SLOT_STRIDE, 4);
  assert.equal(PLAYERHUD_857400_JUMP_TABLE_VA, 0x00857440);
  assert.deepEqual(PLAYERHUD_857400_JUMP_TABLE_TARGETS,
    [0x0085740f, 0x00857416, 0x0085741d, 0x00857424]);
  assert.equal(PLAYERHUD_857400_LOG_FMT_VA, 0x00b6e4f0);
  assert.equal(PLAYERHUD_857400_LOG_LEVEL, 8);
  assert.equal(PLAYERHUD_HOST_VA_LOG, 0x00a112c0);
  assert.equal(PLAYERHUD_857400_CALLER1_VA, 0x00857a54);
  assert.equal(PLAYERHUD_857400_CALLER2_VA, 0x00857a70);
  assert.equal(PLAYERHUD_857400_CALLER3_VA, 0x00857a98);
  assert.equal(PLAYERHUD_857400_CALLER4_VA, 0x00857ab4);
  assert.equal(PLAYERHUD_857400_CALLER5_VA, 0x00857ff3);
  assert.equal(PLAYERHUD_857400_CALLER6_VA, 0x00858018);
  assert.equal(PLAYERHUD_857400_CALLER7_VA, 0x008586ce);
  assert.equal(PLAYERHUD_857400_CALLER8_VA, 0x00858778);
  assert.equal(PLAYERHUD_857400_CALLER9_VA, 0x00858816);
  assert.equal(playerHud857400Va(), 0x00857400);
  assert.equal(playerHud857400RetVa(), 0x0085743c);
  assert.equal(playerHud857400NextVa(), 0x00857450);
  for (let k = 0; k < PLAYERHUD_857400_ENTRY_COUNT; k += 1) {
    assert.equal(playerHud857400SlotByteOffset(k),
      PLAYERHUD_857400_SLOT_BASE + k * PLAYERHUD_857400_SLOT_STRIDE);
  }
  assert.equal(playerHud857400SlotByteOffset(0x100),
    (PLAYERHUD_857400_SLOT_BASE + 0x400) >>> 0); /* 32-bit wrap */

  /* ---- entry selection law ---- */
  const s = [0x12340000, 0x23450000, 0x34560000, 0x45670000];
  for (let k = 0; k < 4; k += 1) {
    assert.equal(playerHud857400Entry(k, ...s), s[k], `entry kind=${k}`);
    assert.equal(playerHud857400NeedsLog(k), 0, `needsLog kind=${k}`);
  }
  /* FULL-DWORD UNSIGNED gate: any kind > 3 (u32) takes the default
     host-log arm and returns 0 — including byte-boundary values that
     a `& 0xff` gate would misroute (kind=0x101 -> 0, NOT slot 1). */
  for (const k of [4, 0x80, 0xff, 0x100, 0x101, 0x1ff, 0x1000,
    0x7fffffff, 0x80000000, 0x80000001, 0xfffffffe, 0xffffffff]) {
    assert.equal(playerHud857400Entry(k, ...s), 0, `entry default kind=${k}`);
    assert.equal(playerHud857400NeedsLog(k), 1, `needsLog default kind=${k}`);
  }

  /* ---- packed plan ---- */
  const taken = playerHud857400Plan(2, ...s);
  assert.equal(taken.entryVa, s[2]);
  assert.equal(taken.needsLog, 0);
  assert.equal(taken.logLevel, 0);
  assert.equal(taken.logFmtVa, 0);
  assert.equal(taken.hostVaLog, PLAYERHUD_HOST_VA_LOG);
  const def = playerHud857400Plan(4, ...s);
  assert.equal(def.entryVa, 0);
  assert.equal(def.needsLog, 1);
  assert.equal(def.logLevel, PLAYERHUD_857400_LOG_LEVEL);
  assert.equal(def.logFmtVa, PLAYERHUD_857400_LOG_FMT_VA);
  assert.equal(def.hostVaLog, PLAYERHUD_HOST_VA_LOG);
  assert.equal(playerHud857400Plan(0x101, ...s).entryVa, 0);
  assert.equal(playerHud857400Plan(0x80000000, ...s).entryVa, 0);
});

test("v37 Wasm ≡ JS — 0x857400 type->entry getter (randomized wide values)", () => {
  const exp = loadExports();
  const base = 0x10000;
  if (exp.memory.buffer.byteLength < base + 0x40) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va857400() >>> 0, PLAYERHUD_857400_VA);
  assert.equal(exp.retVa857400() >>> 0, PLAYERHUD_857400_RET_VA);
  assert.equal(exp.nextVa857400() >>> 0, PLAYERHUD_857400_NEXT_VA);

  const fixedKinds = [0, 1, 2, 3, 4, 0x80, 0xff, 0x100, 0x101, 0x1ff,
    0x1000, 0x7fffffff, 0x80000000, 0x80000001, 0xffffffff];
  const fixedSlots = [
    [0x12340000, 0x23450000, 0x34560000, 0x45670000],
    [0, 0, 0, 0],
    [0xdeadbeef, 0xcafebabe, 0x89abcdef, 0x01234567],
    [0xffffffff, 0xfffffffe, 0xfffffffd, 0xfffffffc],
    [1, 2, 3, 4],
  ];
  for (const kind of fixedKinds) {
    for (const slots of fixedSlots) {
      const js = playerHud857400Plan(kind, ...slots);
      assert.equal(exp.entry857400(kind, ...slots) >>> 0, js.entryVa,
        `entry kind=${kind} slots=${slots}`);
      assert.equal(exp.needsLog857400(kind) | 0, js.needsLog,
        `needsLog kind=${kind}`);
      exp.plan857400(base, kind, ...slots);
      assert.equal(view.getUint32(base + 0, true), js.entryVa);
      assert.equal(view.getInt32(base + 4, true), js.needsLog);
      assert.equal(view.getUint32(base + 8, true), js.logLevel);
      assert.equal(view.getUint32(base + 12, true), js.logFmtVa);
      assert.equal(view.getUint32(base + 16, true), js.hostVaLog);
    }
  }

  let rng = (0x857400 ^ 0xb7) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  for (let iter = 0; iter < 4000; iter += 1) {
    const kind = next() >>> 0; /* full u32 span, signed high bits */
    const slots = [next(), next(), next(), next()];
    const js = playerHud857400Plan(kind, ...slots);
    assert.equal(exp.entry857400(kind, ...slots) >>> 0, js.entryVa,
      `entry iter=${iter} kind=${kind}`);
    assert.equal(exp.needsLog857400(kind) | 0, js.needsLog,
      `needsLog iter=${iter} kind=${kind}`);
    exp.plan857400(base, kind, ...slots);
    assert.equal(view.getUint32(base + 0, true), js.entryVa);
    assert.equal(view.getInt32(base + 4, true), js.needsLog);
    assert.equal(view.getUint32(base + 8, true), js.logLevel);
    assert.equal(view.getUint32(base + 12, true), js.logFmtVa);
    assert.equal(view.getUint32(base + 16, true), js.hostVaLog);
  }
});

test("v37 mutation checks: byte-gate, signed gate, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const entry = (wasm, kind, s) => {
    const fn = wasm.isaac_playerhud_857400_entry
      ?? wasm._isaac_playerhud_857400_entry;
    return fn(kind >>> 0, ...s) >>> 0;
  };
  const s = [0x12340000, 0x23450000, 0x34560000, 0x45670000];

  /* M81: byte-gate the kind (`kind & 0xff` before the >3 test) — PE
     kind=0x101 (u32) takes the default arm (0 + log); the byte-gate
     mutant sees 1, passes the gate, and the switch (full-kind) falls
     to its default -> slot 3.  Either way the mutant DIVERGES from
     the PE's 0 — kills the wave-hint byte-gate hypothesis on PE
     truth (a table-indexed masking law would also return slot 1). */
  withMutant(
    "  if (kind > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)) {\n    return 0;\n  }",
    "  if ((kind & 0xff) > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)) {\n    return 0;\n  }",
    (wasm) => {
      assert.equal(
        entry(wasm, 0x101, s),
        s[3],
        "M81 must diverge: PE kind=0x101 -> 0; byte-gate mutant -> slot 3",
      );
      assert.equal(entry(wasm, 0x100, s), s[3],
        "M81 kind=0x100 falls to the switch default in the mutant");
    },
  );

  /* M82: signed gate (`(int32_t)kind > 3`) — PE `ja` is UNSIGNED;
     kind=0x80000000 is > 3 unsigned, so PE returns 0 + log; the
     signed mutant passes the gate and returns the switch default. */
  withMutant(
    "  if (kind > static_cast<uint32_t>(ISAAC_PLAYERHUD_857400_KIND_MAX)) {\n    return 0;\n  }",
    "  if (static_cast<int32_t>(kind) > ISAAC_PLAYERHUD_857400_KIND_MAX) {\n    return 0;\n  }",
    (wasm) => {
      assert.equal(
        entry(wasm, 0x80000000, s),
        s[3],
        "M82 must diverge: PE kind=0x80000000 -> 0; signed mutant -> slot 3",
      );
    },
  );

  /* M83: next-VA drift (0x857450 -> 0x85743c) — PE next body is the
     game-update v56 rank display 0x857450 (already landed elsewhere). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_857400_next_va(void) {\n  return ISAAC_PLAYERHUD_857400_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_857400_next_va(void) {\n  return ISAAC_PLAYERHUD_857400_RET_VA;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_857400_next_va
        ?? wasm._isaac_playerhud_857400_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_857400_RET_VA,
        "M83 must diverge: PE next 0x857450; mutant returns ret VA",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.entry857400(2, ...s) >>> 0, s[2]);
  assert.equal(exp.entry857400(0x101, ...s) >>> 0, 0);
  assert.equal(exp.entry857400(0x80000000, ...s) >>> 0, 0);
  assert.equal(exp.needsLog857400(0x101) | 0, 1);
  assert.equal(exp.nextVa857400() >>> 0, PLAYERHUD_857400_NEXT_VA);
});

/* Bit-exact f32 identity for the 85e360 differential: both the wasm
 * float return and the JS oracle go through the same engine f32 ->
 * f64 -> f32 round trip (Float32Array/WebAssembly promote), so the
 * compared u32s are deterministic and equal even for NaN payloads
 * (=== would be false for NaN).  engineF64(bits) is the f64 number
 * the engine produces from the f32 bits: quiet NaNs keep their
 * payload; signaling NaNs come back quieted (V8 f64->f32 write sets
 * the quiet bit) — identically on both sides. */
function f32Bits(number) {
  const u = new Uint32Array(1);
  new Float32Array(u.buffer)[0] = number;
  return u[0];
}

function engineF64(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

test("v38 FUN_0085e360 float getter fixed edges (VA 0x0085e360..0x0085e366)", () => {
  /* PE-truth reference transcribed instruction-by-instruction from
     cpu-dump/0085e360.txt:
       0x0085e360 fld dword ptr [ecx + 0x41c]  ; st0 = *(float*)(this+0x41c)
       0x0085e366 ret                          ; x87 bit-preserving load
     The body is a pure thiscall float getter: 0 E8, 0 stores,
     0 indirect; the law is the f32 reinterpret of the dword at
     [this+0x41c] — no arithmetic, no NaN canonicalization.  Twin
     setters (0 direct callers, not landed): 0x85e340 movss
     [ecx+0x41c],xmm0 (ret 4); 0x85e330 movss [ecx+0x420],xmm0
     (ret 4).  6 callers 0x668193/0x66f608/0x78639e/0x79d9eb/
     0x79dbf2/0x79df21 all `mov ecx,<this>; call; fstp` (0x78639e
     fstp [esp] feeds host 0xa10350). */

  /* ---- geometry (constants) ---- */
  assert.equal(PLAYERHUD_85E360_VA, 0x0085e360);
  assert.equal(PLAYERHUD_85E360_RET_VA, 0x0085e366);
  assert.equal(PLAYERHUD_85E360_NEXT_VA, 0x0085e370); /* ptr-delta getter */
  assert.equal(PLAYERHUD_85E360_FIELD_OFF, 0x41c);
  assert.equal(PLAYERHUD_85E360_CALLER1_VA, 0x00668193);
  assert.equal(PLAYERHUD_85E360_CALLER2_VA, 0x0066f608);
  assert.equal(PLAYERHUD_85E360_CALLER3_VA, 0x0078639e);
  assert.equal(PLAYERHUD_85E360_CALLER4_VA, 0x0079d9eb);
  assert.equal(PLAYERHUD_85E360_CALLER5_VA, 0x0079dbf2);
  assert.equal(PLAYERHUD_85E360_CALLER6_VA, 0x0079df21);
  assert.equal(playerHud85e360Va(), 0x0085e360);
  assert.equal(playerHud85e360RetVa(), 0x0085e366);
  assert.equal(playerHud85e360NextVa(), 0x0085e370);
  assert.equal(playerHud85e360FieldOff(), 0x41c);

  /* ---- the law: bit-preserving f32 view ---- */
  const fixed = [
    [0x00000000, 0.0],           /* +0.0 */
    [0x80000000, -0.0],          /* -0.0 */
    [0x3f800000, 1.0],
    [0xbf800000, -1.0],
    [0x3fc00000, 1.5],
    [0x42c80000, 100.0],
    [0x7f800000, Infinity],      /* +inf */
    [0xff800000, -Infinity],     /* -inf */
    [0x7fc00000, NaN],           /* canonical quiet NaN */
    [0x00000001, 1.401298464324817e-45],   /* smallest denormal */
    [0x007fffff, 1.1754942106924411e-38],  /* largest denormal */
    [0x7f7fffff, 3.4028234663852886e38],   /* largest finite */
  ];
  for (const [bits, expect] of fixed) {
    const got = playerHud85e360Float(bits);
    if (Number.isNaN(expect)) {
      assert.ok(Number.isNaN(got), `NaN bits=0x${bits.toString(16)}`);
    } else {
      assert.equal(f32Bits(got), f32Bits(expect),
        `bits=0x${bits.toString(16)}`);
    }
    /* Oracle must equal the engine round trip of the same f32 bits
       (the PE law is bit-identity; the JS boundary is the only
       transform, identical on the wasm side). */
    assert.equal(f32Bits(playerHud85e360Float(bits)),
      f32Bits(engineF64(bits)), `engine parity bits=0x${bits.toString(16)}`);
  }
  /* NaN payload handling: quiet NaN payloads survive the round trip
     untouched; signaling NaNs come back quieted by the engine's
     f64->f32 write (V8 sets bit 22) — on BOTH sides alike. */
  assert.equal(f32Bits(playerHud85e360Float(0x7fc12345)), 0x7fc12345);
  assert.equal(f32Bits(playerHud85e360Float(0xffc12345)), 0xffc12345);
  assert.equal(f32Bits(playerHud85e360Float(0x7f812345)),
    0x7fc12345, "sNaN quieted at the JS boundary (engine semantics)");
  assert.equal(f32Bits(playerHud85e360Float(0xff812345)), 0xffc12345);
  assert.equal(f32Bits(playerHud85e360Float(0x80400000)), 0x80400000);
});

test("v38 Wasm ≡ JS — 0x85e360 float getter (randomized wide values)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va85e360() >>> 0, PLAYERHUD_85E360_VA);
  assert.equal(exp.retVa85e360() >>> 0, PLAYERHUD_85E360_RET_VA);
  assert.equal(exp.nextVa85e360() >>> 0, PLAYERHUD_85E360_NEXT_VA);
  assert.equal(exp.fieldOff85e360() >>> 0, PLAYERHUD_85E360_FIELD_OFF);

  /* Fixed bit corners through the wasm export (bit-exact compare). */
  const fixedBits = [
    0x00000000, 0x80000000, 0x3f800000, 0xbf800000, 0x3fc00000,
    0x42c80000, 0x7f800000, 0xff800000, 0x7fc00000, 0xffc00000,
    0x00000001, 0x007fffff, 0x7f7fffff, 0x7fc12345, 0x7f812345,
    0xffc12345, 0x80400000, 0x80000001, 0xffffffff, 0xdeadbeef,
  ];
  for (const bits of fixedBits) {
    const wasmNum = exp.float85e360(bits >>> 0);
    const oracleNum = playerHud85e360Float(bits);
    assert.equal(f32Bits(wasmNum), f32Bits(oracleNum),
      `fixed bits=0x${bits.toString(16)}`);
    /* Engine round trip of the same f32 bits — the PE law is
       bit-identity; the JS boundary (f64 promote + quieting rules)
       is the only transform and hits both sides alike. */
    assert.equal(f32Bits(wasmNum), f32Bits(engineF64(bits)),
      `wasm engine parity bits=0x${bits.toString(16)}`);
  }

  let rng = (0x85e360 ^ 0x1f3) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const specials = [0x00000000, 0x80000000, 0x7f800000, 0xff800000,
    0x7fc00000, 0xffc00000, 0x00000001, 0x7f7fffff];
  for (let iter = 0; iter < 4000; iter += 1) {
    let bits = next();
    if ((iter & 0xf) === 0) {
      bits = specials[(iter >>> 4) % specials.length];
    }
    const wasmNum = exp.float85e360(bits >>> 0);
    const oracleNum = playerHud85e360Float(bits);
    assert.equal(f32Bits(wasmNum), f32Bits(oracleNum),
      `iter=${iter} bits=0x${bits.toString(16)}`);
    assert.equal(f32Bits(wasmNum), f32Bits(engineF64(bits)),
      `iter=${iter} engine parity bits=0x${bits.toString(16)}`);
  }
});

test("v38 mutation checks: field offset, numeric conversion, endian swap, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };
  const floatBits = (wasm, bits) => {
    const fn = wasm.isaac_playerhud_85e360_float_41c
      ?? wasm._isaac_playerhud_85e360_float_41c;
    return f32Bits(fn(bits >>> 0));
  };

  /* M84: field-offset drift 0x41c -> 0x420 — PE reads [ecx+0x41c];
     the 0x420 field is the OTHER setter twin (0x85e330 movss
     [ecx+0x420],xmm0), so the drifted constant lands on the wrong
     member. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_85e360_field_off(void) {\n  return ISAAC_PLAYERHUD_85E360_FIELD_OFF;\n}",
    "extern \"C\" uint32_t isaac_playerhud_85e360_field_off(void) {\n  return ISAAC_PLAYERHUD_85E360_FIELD_OFF + 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_85e360_field_off
        ?? wasm._isaac_playerhud_85e360_field_off;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_85E360_FIELD_OFF + 0x4,
        "M84 must diverge: PE field +0x41c; mutant -> +0x420",
      );
    },
  );

  /* M85: numeric conversion instead of bit reinterpret — the PE
     fld never converts; 0x3f800000 must give 1.0f, not
     1065353216.0f.  The mutant's wasm output equals the JS numeric
     conversion of the unsigned input (f32(Math.fround(u32))) and
     must DIVERGE from the PE bits. */
  const numeric = (n) => f32Bits(Math.fround(n >>> 0));
  withMutant(
    "static float playerHud85e360Float(uint32_t field_bits) {\n  float out;\n  __builtin_memcpy(&out, &field_bits, sizeof(out));\n  return out;\n}",
    "static float playerHud85e360Float(uint32_t field_bits) {\n  return static_cast<float>(field_bits);\n}",
    (wasm) => {
      assert.equal(
        floatBits(wasm, 0x3f800000),
        numeric(0x3f800000),
        "M85 must match the numeric-conversion law",
      );
      assert.notEqual(
        floatBits(wasm, 0x3f800000),
        0x3f800000,
        "M85 must diverge: PE 0x3f800000 -> 1.0f; numeric mutant -> 1.065e9",
      );
      assert.equal(floatBits(wasm, 0xbf800000), numeric(0xbf800000));
      assert.notEqual(floatBits(wasm, 0xbf800000), 0xbf800000);
      assert.equal(floatBits(wasm, 0x00000001), numeric(0x00000001));
      assert.notEqual(floatBits(wasm, 0x00000001), 0x00000001);
    },
  );

  /* M86: big-endian misread (byte-swapped) — the PE loads the dword
     little-endian; 0x3f800000 (1.0f) must not become 0x00803f00. */
  withMutant(
    "static float playerHud85e360Float(uint32_t field_bits) {\n  float out;\n  __builtin_memcpy(&out, &field_bits, sizeof(out));\n  return out;\n}",
    "static float playerHud85e360Float(uint32_t field_bits) {\n  uint32_t be = (field_bits << 24) | ((field_bits & 0xff00) << 8) | ((field_bits >> 8) & 0xff00) | (field_bits >> 24);\n  float out;\n  __builtin_memcpy(&out, &be, sizeof(out));\n  return out;\n}",
    (wasm) => {
      assert.equal(
        floatBits(wasm, 0x3f800000),
        0x0000803f,
        "M86 must diverge: PE little-endian 1.0f; byte-swapped mutant -> 0x0000803f",
      );
      assert.equal(floatBits(wasm, 0x42c80000), 0x0000c842);
    },
  );

  /* M87: next-VA drift (0x85e370 -> 0x85e380) — PE next body is the
     pointer-delta getter 0x85e370 (mov eax,[ecx+0x269d8];
     sub eax,[ecx+0x269d4]; sar eax,3; ret); 0x85e380 is the
     lea eax,[ecx+0x26508] getter after it. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_85e360_next_va(void) {\n  return ISAAC_PLAYERHUD_85E360_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_85e360_next_va(void) {\n  return ISAAC_PLAYERHUD_85E360_NEXT_VA + 0x10;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_85e360_next_va
        ?? wasm._isaac_playerhud_85e360_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_85E360_NEXT_VA + 0x10,
        "M87 must diverge: PE next 0x85e370; mutant -> 0x85e380",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.fieldOff85e360() >>> 0, PLAYERHUD_85E360_FIELD_OFF);
  assert.equal(exp.nextVa85e360() >>> 0, PLAYERHUD_85E360_NEXT_VA);
  assert.equal(f32Bits(exp.float85e360(0x3f800000)), 0x3f800000);
  assert.equal(f32Bits(exp.float85e360(0x7fc12345)), 0x7fc12345);
});

/* ====================================================================== */
/* v39 — 7-leaf StatHUD conversion cluster (VA 0x009bfc00..0x009bfd38)   */
/* 4 pure + 3 pow-composed (blob-gated probe from host powf 0x4e4690 —   */
/* 0xaf08ff = jmp [IAT 0xb18830] = _libm_sse2_pow_precise; PI "atan2f"   */
/* mis-ID corrected).  Each SSE op = one f32 rounding.                    */
/* ====================================================================== */

test("v39 9bfc00 cluster fixed edges (VA 0x009bfc00..0x009bfd38)", () => {
  /* ---- geometry ---- */
  assert.equal(PLAYERHUD_9BFC00_VA, 0x009bfc00);
  assert.equal(PLAYERHUD_9BFC00_RET_VA, 0x009bfc10);
  assert.equal(PLAYERHUD_9BFC00_NEXT_VA, 0x009bfc20);
  assert.equal(PLAYERHUD_9BFC00_CALLER1_VA, 0x0077007b);
  assert.equal(PLAYERHUD_9BFC20_VA, 0x009bfc20);
  assert.equal(PLAYERHUD_9BFC20_RET_VA, 0x009bfc30);
  assert.equal(PLAYERHUD_9BFC20_NEXT_VA, 0x009bfc40);
  assert.equal(PLAYERHUD_9BFC20_CALLER1_VA, 0x007700c3);
  assert.equal(PLAYERHUD_9BFC40_VA, 0x009bfc40);
  assert.equal(PLAYERHUD_9BFC40_RET_VA, 0x009bfc76);
  assert.equal(PLAYERHUD_9BFC40_NEXT_VA, 0x009bfc80);
  assert.equal(PLAYERHUD_9BFC40_CALLER1_VA, 0x007619d3);
  assert.equal(PLAYERHUD_9BFC80_VA, 0x009bfc80);
  assert.equal(PLAYERHUD_9BFC80_RET_VA, 0x009bfcc6);
  assert.equal(PLAYERHUD_9BFC80_NEXT_VA, 0x009bfcd0);
  assert.equal(PLAYERHUD_9BFC80_CALLER1_VA, 0x007700d8);
  assert.equal(PLAYERHUD_9BFCD0_VA, 0x009bfcd0);
  assert.equal(PLAYERHUD_9BFCD0_RET_VA, 0x009bfcf9);
  assert.equal(PLAYERHUD_9BFCD0_NEXT_VA, 0x009bfd00);
  assert.equal(PLAYERHUD_9BFCD0_CALLER1_VA, 0x007700ed);
  assert.equal(PLAYERHUD_9BFD00_VA, 0x009bfd00);
  assert.equal(PLAYERHUD_9BFD00_RET_VA, 0x009bfd18);
  assert.equal(PLAYERHUD_9BFD00_NEXT_VA, 0x009bfd20);
  assert.equal(PLAYERHUD_9BFD00_CALLER1_VA, 0x00770090);
  assert.equal(PLAYERHUD_9BFD20_VA, 0x009bfd20);
  assert.equal(PLAYERHUD_9BFD20_RET_VA, 0x009bfd38);
  assert.equal(PLAYERHUD_9BFD20_NEXT_VA, 0x009bfd40); /* SEH host */
  assert.equal(PLAYERHUD_9BFD20_CALLER1_VA, 0x00770102);
  assert.equal(PLAYERHUD_9BFC40_HOST_VA_POWF, 0x004e4690);
  assert.equal(playerHud9bfc00Va(), 0x009bfc00);
  assert.equal(playerHud9bfc00RetVa(), 0x009bfc10);
  assert.equal(playerHud9bfc00NextVa(), 0x009bfc20);
  assert.equal(playerHud9bfc00Caller1Va(), 0x0077007b);
  assert.equal(playerHud9bfc20Va(), 0x009bfc20);
  assert.equal(playerHud9bfc40Va(), 0x009bfc40);
  assert.equal(playerHud9bfc80Va(), 0x009bfc80);
  assert.equal(playerHud9bfcd0Va(), 0x009bfcd0);
  assert.equal(playerHud9bfd00Va(), 0x009bfd00);
  assert.equal(playerHud9bfd20Va(), 0x009bfd20);
  assert.equal(playerHud9bfcHostVaPowf(), 0x004e4690);
  /* rdata constants (float bits at the PE VAs, verified this unit). */
  assert.equal(PLAYERHUD_9BFC_45F_BITS, 0x40900000);
  assert.equal(PLAYERHUD_9BFC_2F_BITS, 0x40000000);
  assert.equal(PLAYERHUD_9BFC_1F_BITS, 0x3f800000);
  assert.equal(PLAYERHUD_9BFC_30F_BITS, 0x41f00000);
  assert.equal(PLAYERHUD_9BFC_075F_BITS, 0x3f400000);
  assert.equal(PLAYERHUD_9BFC_2120F_BITS, 0x4007b47c);
  assert.equal(PLAYERHUD_9BFC_13333F_BITS, 0x3faaaaab);
  assert.equal(PLAYERHUD_9BFC_04716F_BITS, 0x3ef17704);
  assert.equal(PLAYERHUD_9BFC_17857F_BITS, 0x3fe49249);
  assert.equal(PLAYERHUD_9BFC_04482F_BITS, 0x3ee5799f);
  assert.equal(PLAYERHUD_9BFC_NEG2F_BITS, 0xc0000000);
  assert.equal(PLAYERHUD_9BFC_10000F_BITS, 0x461c4000);
  assert.equal(PLAYERHUD_9BFC_230F_BITS, 0x43660000);
  assert.equal(PLAYERHUD_9BFC_60F_BITS, 0x42700000);
  assert.equal(playerHud9bfc40PowExpBits(), 0x3f400000);
  assert.equal(playerHud9bfc80PowExpBits(), 0x3faaaaab);
  assert.equal(playerHud9bfcd0PowExpBits(), 0x3fe49249);

  /* ---- the 4 pure laws: PE-truth Math.fround chains ---- */
  const f = (b) => engineF64(b); /* f32 bits -> JS number */
  const fixed = [
    0x00000000, 0x80000000, 0x3f800000, 0xbf800000, 0x40000000,
    0xc0400000, 0x3fc00000, 0x42c80000, 0xc2c80000, 0x7f800000,
    0xff800000, 0x7fc00000, 0x00000001, 0x007fffff, 0x7f7fffff,
    0xffc00000, 0x40400000, 0xc0400001, 0x3f000000,
  ];
  for (const x of fixed) {
    const xv = f(x);
    /* 0x9bfc00: mulss 4.5f; subss 2.0f */
    assert.equal(playerHud9bfc00Law(x),
      f32Bits(Math.fround(Math.fround(xv * 4.5) - 2.0)),
      `9bfc00 x=0x${x.toString(16)}`);
    /* 0x9bfc20: addss 2.0f; divss 4.5f */
    assert.equal(playerHud9bfc20Law(x),
      f32Bits(Math.fround(Math.fround(xv + 2.0) / 4.5)),
      `9bfc20 x=0x${x.toString(16)}`);
    /* 0x9bfd00: subss 230.0f; divss 60.0f; addss 2.0f */
    assert.equal(playerHud9bfd00Law(x),
      f32Bits(Math.fround(Math.fround(Math.fround(xv - 230.0) / 60.0) + 2.0)),
      `9bfd00 x=0x${x.toString(16)}`);
    /* 0x9bfd20: subss 2.0f; mulss 60.0f; addss 230.0f */
    assert.equal(playerHud9bfd20Law(x),
      f32Bits(Math.fround(Math.fround(Math.fround(xv - 2.0) * 60.0) + 230.0)),
      `9bfd20 x=0x${x.toString(16)}`);
  }

  /* ---- the 3 pow laws: base/exp recipes + blob probe ---- */
  for (const x of fixed) {
    const xv = f(x);
    /* 0x9bfc40: base 30/(x+1) (addss then divss); exp 0.75f; probe =
       fround(pow(base, exp)) — cvtss2sd x2, CRT pow, cvtsd2ss. */
    const base40 = Math.fround(30.0 / Math.fround(xv + 1.0));
    assert.equal(playerHud9bfc40PowBase(x), f32Bits(base40),
      `9bfc40 base x=0x${x.toString(16)}`);
    const probe40 = f32Bits(Math.pow(base40, 0.75));
    /* PE post: mulss 2.12039089f (on the f32 probe) then subss 2.0f. */
    const p40 = engineF64(probe40);
    const k2120 = engineF64(PLAYERHUD_9BFC_2120F_BITS);
    assert.equal(playerHud9bfc40Law(x, probe40),
      f32Bits(Math.fround(Math.fround(p40 * k2120) - 2.0)),
      `9bfc40 law x=0x${x.toString(16)}`);
    /* gate: jbe on comiss vs -2.0f — constant branch for x<=-2 AND NaN. */
    const gate = !(xv > -2.0) ? 1 : 0;
    assert.equal(playerHud9bfc80Gate(x), gate, `9bfc80 gate x=0x${x.toString(16)}`);
    assert.equal(playerHud9bfcd0Gate(x), gate, `9bfcd0 gate x=0x${x.toString(16)}`);
    /* 0x9bfc80 base (x+2)*0.471611142f; law gate?10000 : 30/pow - 1. */
    const k04716 = engineF64(PLAYERHUD_9BFC_04716F_BITS);
    const k13333 = engineF64(PLAYERHUD_9BFC_13333F_BITS);
    const base80 = Math.fround(Math.fround(xv + 2.0) * k04716);
    assert.equal(playerHud9bfc80PowBase(x), f32Bits(base80),
      `9bfc80 base x=0x${x.toString(16)}`);
    const probe80 = f32Bits(Math.pow(base80, k13333));
    /* PE post: divss 30.0f/probe (f32 probe) then subss 1.0f. */
    const p80 = engineF64(probe80);
    const exp80 = gate !== 0
      ? PLAYERHUD_9BFC_10000F_BITS
      : f32Bits(Math.fround(Math.fround(30.0 / p80) - 1.0));
    assert.equal(playerHud9bfc80Law(x, probe80), exp80,
      `9bfc80 law x=0x${x.toString(16)}`);
    /* 0x9bfcd0 base (x+2)*0.44819352f; law gate?0 : pow (identity). */
    const k04482 = engineF64(PLAYERHUD_9BFC_04482F_BITS);
    const k17857 = engineF64(PLAYERHUD_9BFC_17857F_BITS);
    const baseD0 = Math.fround(Math.fround(xv + 2.0) * k04482);
    assert.equal(playerHud9bfcd0PowBase(x), f32Bits(baseD0),
      `9bfcd0 base x=0x${x.toString(16)}`);
    const probeD0 = f32Bits(Math.pow(baseD0, k17857));
    assert.equal(playerHud9bfcd0Law(x, probeD0), gate !== 0 ? 0 : probeD0,
      `9bfcd0 law x=0x${x.toString(16)}`);
  }

  /* NaN gate: comiss unordered sets CF|ZF -> jbe taken -> constant. */
  assert.equal(playerHud9bfc80Gate(0x7fc00000), 1, "NaN 9bfc80 gate");
  assert.equal(playerHud9bfcd0Gate(0x7fc00000), 1, "NaN 9bfcd0 gate");
  assert.equal(playerHud9bfc80Gate(0x7f812345), 1, "sNaN 9bfc80 gate");
  assert.equal(playerHud9bfc80Law(0x7fc00000, 0x3f800000),
    PLAYERHUD_9BFC_10000F_BITS, "NaN 9bfc80 law -> 10000.0f");
  assert.equal(playerHud9bfcd0Law(0x7fc00000, 0x3f800000), 0,
    "NaN 9bfcd0 law -> 0.0f");
  /* gate boundary: x == -2.0f exactly takes the constant. */
  assert.equal(playerHud9bfc80Gate(0xc0000000), 1, "-2.0f gate");
  assert.equal(playerHud9bfc80Gate(0xc0000001), 1, "-2.0000002f gate");
  assert.equal(playerHud9bfc80Gate(0xbf7fffff), 0, "-0.99999994f no gate");
});

test("v39 Wasm ≡ JS — 9bfc00 cluster (randomized wide values, <=500 draws)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.va9bfc00() >>> 0, PLAYERHUD_9BFC00_VA);
  assert.equal(exp.retVa9bfcd0() >>> 0, PLAYERHUD_9BFCD0_RET_VA);
  assert.equal(exp.nextVa9bfd20() >>> 0, PLAYERHUD_9BFD20_NEXT_VA);
  assert.equal(exp.caller9bfc40() >>> 0, PLAYERHUD_9BFC40_CALLER1_VA);
  assert.equal(exp.hostVaPowf() >>> 0, PLAYERHUD_9BFC40_HOST_VA_POWF);
  assert.equal(exp.powExp9bfc40() >>> 0, PLAYERHUD_9BFC_075F_BITS);
  assert.equal(exp.powExp9bfc80() >>> 0, PLAYERHUD_9BFC_13333F_BITS);
  assert.equal(exp.powExp9bfcd0() >>> 0, PLAYERHUD_9BFC_17857F_BITS);

  let rng = (0x9bfc00 ^ 0x39a5) >>> 0;
  const next = () => {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    return rng;
  };
  const specials = [0x00000000, 0x80000000, 0x3f800000, 0xbf800000,
    0x40000000, 0xc0000000, 0xc0000001, 0x7f800000, 0xff800000,
    0x7fc00000, 0xffc00000, 0x00000001, 0x7f7fffff, 0xc2c80000,
    0x42c80000, 0x3f000000, 0x7f812345];
  for (let iter = 0; iter < 500; iter += 1) {
    let x = next();
    if ((iter & 0xf) === 0) {
      x = specials[(iter >>> 4) % specials.length];
    }
    const xv = engineF64(x);
    /* pure laws */
    assert.equal(exp.law9bfc00(x >>> 0) >>> 0, playerHud9bfc00Law(x),
      `iter=${iter} 9bfc00 x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfc20(x >>> 0) >>> 0, playerHud9bfc20Law(x),
      `iter=${iter} 9bfc20 x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfd00(x >>> 0) >>> 0, playerHud9bfd00Law(x),
      `iter=${iter} 9bfd00 x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfd20(x >>> 0) >>> 0, playerHud9bfd20Law(x),
      `iter=${iter} 9bfd20 x=0x${x.toString(16)}`);
    /* pow recipes (host computes the probe with the same base/exp) */
    const base40 = engineF64(playerHud9bfc40PowBase(x));
    const probe40 = f32Bits(Math.pow(base40, 0.75));
    assert.equal(exp.powBase9bfc40(x >>> 0) >>> 0, playerHud9bfc40PowBase(x),
      `iter=${iter} 9bfc40 base x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfc40(x >>> 0, probe40) >>> 0,
      playerHud9bfc40Law(x, probe40),
      `iter=${iter} 9bfc40 law x=0x${x.toString(16)}`);
    const base80 = engineF64(playerHud9bfc80PowBase(x));
    const probe80 = f32Bits(Math.pow(base80,
      engineF64(PLAYERHUD_9BFC_13333F_BITS)));
    assert.equal(exp.gate9bfc80(x >>> 0) >>> 0, playerHud9bfc80Gate(x),
      `iter=${iter} 9bfc80 gate x=0x${x.toString(16)}`);
    assert.equal(exp.powBase9bfc80(x >>> 0) >>> 0, playerHud9bfc80PowBase(x),
      `iter=${iter} 9bfc80 base x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfc80(x >>> 0, probe80) >>> 0,
      playerHud9bfc80Law(x, probe80),
      `iter=${iter} 9bfc80 law x=0x${x.toString(16)}`);
    const baseD0 = engineF64(playerHud9bfcd0PowBase(x));
    const probeD0 = f32Bits(Math.pow(baseD0,
      engineF64(PLAYERHUD_9BFC_17857F_BITS)));
    assert.equal(exp.gate9bfcd0(x >>> 0) >>> 0, playerHud9bfcd0Gate(x),
      `iter=${iter} 9bfcd0 gate x=0x${x.toString(16)}`);
    assert.equal(exp.powBase9bfcd0(x >>> 0) >>> 0, playerHud9bfcd0PowBase(x),
      `iter=${iter} 9bfcd0 base x=0x${x.toString(16)}`);
    assert.equal(exp.law9bfcd0(x >>> 0, probeD0) >>> 0,
      playerHud9bfcd0Law(x, probeD0),
      `iter=${iter} 9bfcd0 law x=0x${x.toString(16)}`);
  }

  /* geometry drift pins: caller/next VAs probe the PE truth. */
  assert.equal(exp.caller9bfc00() >>> 0, 0x0077007b);
  assert.equal(exp.caller9bfc20() >>> 0, 0x007700c3);
  assert.equal(exp.caller9bfc40() >>> 0, 0x007619d3);
  assert.equal(exp.caller9bfc80() >>> 0, 0x007700d8);
  assert.equal(exp.caller9bfcd0() >>> 0, 0x007700ed);
  assert.equal(exp.caller9bfd00() >>> 0, 0x00770090);
  assert.equal(exp.caller9bfd20() >>> 0, 0x00770102);
  assert.equal(exp.nextVa9bfc00() >>> 0, 0x009bfc20);
  assert.equal(exp.nextVa9bfc20() >>> 0, 0x009bfc40);
  assert.equal(exp.nextVa9bfc40() >>> 0, 0x009bfc80);
  assert.equal(exp.nextVa9bfc80() >>> 0, 0x009bfcd0);
  assert.equal(exp.nextVa9bfcd0() >>> 0, 0x009bfd00);
  assert.equal(exp.nextVa9bfd00() >>> 0, 0x009bfd20);
});

test("v39 mutation checks: op order, gate polarity, constant drift, gate omission, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry( orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry( raw);
      buildWasm();
    }
  };

  /* M88: 0x9bfc00 op order swap (mul then sub -> sub then mul) — PE
     does mulss THEN subss (two roundings): fround(fround(x*4.5)-2.0);
     the swap computes fround(fround(x-2.0)*4.5), which diverges. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9bfc00_law(uint32_t x_bits) {\n  const float x = __builtin_bit_cast(float, x_bits);\n  const float m = x * 4.5f;\n  const float r = m - 2.0f;\n  return __builtin_bit_cast(uint32_t, r);\n}",
    "extern \"C\" uint32_t isaac_playerhud_9bfc00_law(uint32_t x_bits) {\n  const float x = __builtin_bit_cast(float, x_bits);\n  const float m = x - 2.0f;\n  const float r = m * 4.5f;\n  return __builtin_bit_cast(uint32_t, r);\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9bfc00_law
        ?? wasm._isaac_playerhud_9bfc00_law;
      const xx = 0x3f800000; /* 1.0f: PE fround(fround(1*4.5)-2) = 2.5 */
      assert.equal(
        fn(xx) >>> 0,
        f32Bits(Math.fround(Math.fround(1.0 - 2.0) * 4.5)),
        "M88 must match the swapped-op law",
      );
      assert.notEqual(
        fn(xx) >>> 0,
        f32Bits(Math.fround(Math.fround(1.0 * 4.5) - 2.0)),
        "M88 must diverge: PE mulss/subss order",
      );
    },
  );

  /* M89: 0x9bfc80 gate polarity flip (!(x > -2.0f) -> (x > -2.0f)) —
     PE jbe takes the 10000.0f constant for x <= -2.0 AND NaN;
     flipped routes x <= -2.0 into the pow arm. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9bfc80_gate(uint32_t x_bits) {\n  const float x = __builtin_bit_cast(float, x_bits);\n  return !(x > -2.0f) ? 1u : 0u;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9bfc80_gate(uint32_t x_bits) {\n  const float x = __builtin_bit_cast(float, x_bits);\n  return (x > -2.0f) ? 1u : 0u;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9bfc80_gate
        ?? wasm._isaac_playerhud_9bfc80_gate;
      assert.equal(fn(0xc0400000) >>> 0, 0, "M89 must flip -3.0f gate");
      assert.equal(fn(0x3f800000) >>> 0, 1, "M89 must flip 1.0f gate");
      assert.equal(fn(0x7fc00000) >>> 0, 0,
        "M89+NaN: flipped gate is false for NaN (PE jbe is 1)");
      assert.notEqual(fn(0xc0400000) >>> 0, 1, "M89 must diverge from jbe");
      assert.notEqual(fn(0x7fc00000) >>> 0, 1,
        "M89 must diverge from PE's NaN gate (jbe unordered)");
    },
  );

  /* M90: 0x9bfd00 constant drift 60.0f -> 6.0f — PE divss [0xbaa950]
     = 60.0f (verified .rdata). */
  withMutant(
    "  const float d = s / 60.0f;",
    "  const float d = s / 6.0f;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9bfd00_law
        ?? wasm._isaac_playerhud_9bfd00_law;
      const xx = 0x42c80000; /* 100.0f: PE (100-230)/60+2 = -0.1666... */
      assert.equal(
        fn(xx) >>> 0,
        f32Bits(Math.fround(Math.fround(Math.fround(100.0 - 230.0) / 6.0) + 2.0)),
        "M90 must match the drifted-constant law",
      );
      assert.notEqual(
        fn(xx) >>> 0,
        f32Bits(Math.fround(Math.fround(Math.fround(100.0 - 230.0) / 60.0) + 2.0)),
        "M90 must diverge: PE /60.0f",
      );
    },
  );

  /* M91: 0x9bfcd0 gate omission (tail jmp passthrough without the
     comiss gate) — PE x <= -2.0 strikes 0.0f; omitted gates return
     the probe. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9bfcd0_law(uint32_t x_bits,\n                                              uint32_t pow_bits) {\n  if (isaac_playerhud_9bfcd0_gate(x_bits) != 0u) {\n    return 0u; /* xorps xmm0,xmm0 -> 0.0f */\n  }\n  return pow_bits;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9bfcd0_law(uint32_t x_bits,\n                                              uint32_t pow_bits) {\n  (void)x_bits;\n  return pow_bits;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9bfcd0_law
        ?? wasm._isaac_playerhud_9bfcd0_law;
      assert.equal(
        fn(0xc0400000, 0x3f800000) >>> 0,
        0x3f800000,
        "M91 must leak the probe past the gate",
      );
      assert.notEqual(
        fn(0xc0400000, 0x3f800000) >>> 0,
        0,
        "M91 must diverge: PE gate strikes 0.0f for x <= -2.0f",
      );
    },
  );

  /* M92: next-VA drift 0x9bfd20 -> 0x9bfd38 (PE next body is the
     SEH ret-4 vector-build host at 0x009bfd40). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9bfd20_next_va(void) {\n  return ISAAC_PLAYERHUD_9BFD20_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9bfd20_next_va(void) {\n  return ISAAC_PLAYERHUD_9BFD20_NEXT_VA - 0x8;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9bfd20_next_va
        ?? wasm._isaac_playerhud_9bfd20_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9BFD20_NEXT_VA - 0x8,
        "M92 must diverge: PE next 0x9bfd40; mutant -> 0x9bfd38",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  assert.equal(exp.law9bfc00(0x3f800000) >>> 0, playerHud9bfc00Law(0x3f800000));
  assert.equal(exp.law9bfc80(0xc0400000, 0x3f800000) >>> 0,
    PLAYERHUD_9BFC_10000F_BITS);
  assert.equal(exp.law9bfcd0(0xc0400000, 0x3f800000) >>> 0, 0);
  assert.equal(exp.law9bfcd0(0x3f800000, 0x3f800000) >>> 0, 0x3f800000);
  assert.equal(exp.nextVa9bfd20() >>> 0, PLAYERHUD_9BFD20_NEXT_VA);
});

/* ---------- v40: 0x9c0120 / 0x9c0170 lerp visitors (notes
   playerhud-v40-frontier) ----------
   Verify-open: the v39 handoff's residual re-census pick.  Both
   bodies are virtual methods (address-taken ONLY via .rdata
   vtables 0xb7ed28 / 0xb7ed40; ZERO E8 callers, ZERO static dword
   refs).  The always-path vtbl[4] probe stays HOST — its st0 f32
   value is the recapture f_bits (the v39 pow-probe precedent).
   Oracular rows from cpu-dump/009c0120.txt — NOT derived from the
   cpp. */

test("v40 PE truth (native): lerp visitor census pins and constants", () => {
  for (const [jsName, expected] of [
    [PLAYERHUD_9C0120_VA, 0x009c0120],
    [PLAYERHUD_9C0120_RET_VA, 0x009c0165],
    [PLAYERHUD_9C0120_NEXT_VA, 0x009c0170],
    [PLAYERHUD_9C0120_VTABLE_REF_RDATA, 0x00b7ed28],
    [PLAYERHUD_9C0120_PROBE_SLOT, 4],
    [PLAYERHUD_9C0120_PROBE_VTBL_OFF, 0x10],
    [PLAYERHUD_9C0120_A_OFF, 8],
    [PLAYERHUD_9C0120_B_OFF, 0xc],
    [PLAYERHUD_CLAMP_LO_RDATA, 0x00ba9fe4],
    [PLAYERHUD_CLAMP_HI_RDATA, 0x00baa454],
    [PLAYERHUD_CLAMP_ZERO_BITS, 0x00000000],
    [PLAYERHUD_CLAMP_ONE_BITS, 0x3f800000],
    [PLAYERHUD_9C0170_VA, 0x009c0170],
    [PLAYERHUD_9C0170_RET_VA, 0x009c01cc],
    [PLAYERHUD_9C0170_NEXT_VA, 0x009c01d0],
    [PLAYERHUD_9C0170_VTABLE_REF_RDATA, 0x00b7ed40],
    [PLAYERHUD_9C0170_RET_IMM, 4],
    [PLAYERHUD_9C0170_A_OFF, 8],
    [PLAYERHUD_9C0170_B_OFF, 0xc],
    [PLAYERHUD_9C0170_C_OFF, 0x10],
    [PLAYERHUD_9C0170_D_OFF, 0x14],
  ]) {
    assert.equal(jsName, expected, `js pin ${jsName}`);
  }
  /* Cross-law pins: the clamp rdata pair IS 0.0f/1.0f; the two
     vtable refs are distinct slots of the same .rdata neighborhood
     (0x18 apart); the next-VA chain threads 9c0120 -> 9c0170 ->
     9c01d0; the clamp hi equals the sfx-family 1.0f constant VA. */
  assert.equal(playerHudBitsToF32(PLAYERHUD_CLAMP_ZERO_BITS), 0);
  assert.equal(playerHudBitsToF32(PLAYERHUD_CLAMP_ONE_BITS), 1);
  assert.equal(PLAYERHUD_9C0170_VTABLE_REF_RDATA -
    PLAYERHUD_9C0120_VTABLE_REF_RDATA, 0x18);
  assert.equal(PLAYERHUD_9C0120_NEXT_VA, PLAYERHUD_9C0170_VA);
  assert.equal(PLAYERHUD_9C0170_RET_VA + 4, PLAYERHUD_9C0170_NEXT_VA);
});

test("Wasm matches JS: v40 lerp visitor decision seams", () => {
  const exp2 = loadExports();
  assert.equal(exp2.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);

  /* --- clamp01: NaN/-0/denormal/out-of-range edges + wide sweep ---
    The maxss src2 rule sends NaN AND -0.0f to +0.0f; minss caps
    at exactly 1.0f bits. */
  const clampRows = [
    0x7fc00000 /* qNaN */, 0xffc00000 /* -qNaN */, 0x7f800000 /* +inf */,
    0xff800000 /* -inf */, 0x80000000 /* -0.0 */, 0x00000000 /* +0.0 */,
    0x3f800000 /* 1.0 */, 0xbf800000 /* -1.0 */, 0x40000000 /* 2.0 */,
    0x3f000000 /* 0.5 */, 0x007fffff /* max denormal */, 0x00800000,
    0x3f7fffff /* just under 1 */, 0x3f800001 /* just over 1 */,
    0xbe4ccccd /* -0.2 */, 0x3e99999a /* 0.3 */,
  ];
  for (const fBits of clampRows) {
    const want = playerHud9c0120Clamp01(fBits);
    assert.equal(exp2.clamp01(fBits) >>> 0, want >>> 0,
      `clamp01 ${fBits.toString(16)}`);
    const f = playerHudBitsToF32(fBits);
    const hand = Number.isNaN(f) || f <= 0 ? 0 : (f > 1 ? 0x3f800000 :
      playerHudF32ToBits(f));
    assert.equal(want >>> 0, hand >>> 0, `clamp01 semantic ${fBits}`);
  }
  /* randomized wide differential */
  let seed = 0x9c0120;
  for (let i = 0; i < 300; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const fBits = seed >>> 0;
    assert.equal(exp2.clamp01(fBits) >>> 0,
      playerHud9c0120Clamp01(fBits) >>> 0, `clamp01 rand ${i}`);
  }

  /* --- scalar lerp: asymmetric endpoints (order-sensitive), the
     clamped t values from the row set, wrap-free f32 ops --- */
  const valueRows = [
    [0x3f800000, 0x40490fdb, 0x3e99999a],  /* 1 -> pi by 0.3 */
    [0xc0400000, 0x3fa00000, 0x3f000000],  /* -3 -> 1.25 by 0.5 */
    [0x00000000, 0x42c80000, 0x3f800000],  /* 0 -> 100 by 1 */
    [0x42c80000, 0x00000000, 0x00000000],  /* 100 -> 0 by 0 */
    [0x3f800000, 0xbf800000, 0x7fc00000],  /* NaN t -> a */
    [0x3f800000, 0xbf800000, 0xbf800000],  /* t<0 -> a */
    [0x461c4000, 0xc21ed000, 0x40000000],  /* t>1 clamps to b */
    [0x00800000, 0x3f800000, 0x3f000000],  /* denormal endpoint */
  ];
  for (const [a, b, f] of valueRows) {
    const want = playerHud9c0120Value(a, b, f);
    assert.equal(exp2.lerpValue(a, b, f) >>> 0, want >>> 0,
      `value ${a.toString(16)},${b.toString(16)},${f.toString(16)}`);
  }
  /* hand rows: a=1,b=pi,t=0.3 -> 1+(pi-1)*0.3; NaN t collapses to a;
     t>1 collapses to b; direction matters (a>b rows are NOT
  assert.equal(playerHud9c0120Value(0x3f800000, 0x40490fdb, 0x3e99999a),
    playerHudF32ToBits(Math.fround(1 + Math.fround(
      Math.fround(playerHudBitsToF32(0x40490fdb) - 1) *
      playerHudBitsToF32(
        playerHud9c0120Clamp01(0x3e99999a))))));
  assert.equal(playerHud9c0120Value(0x3f800000, 0xbf800000, 0x7fc00000),
    0x3f800000);
  assert.equal(exp2.lerpValue(0x461c4000, 0xc21ed000, 0x40000000) >>> 0,
    0xc21ed000);
  assert.notEqual(exp2.lerpValue(0x3f800000, 0x40490fdb, 0x3f000000) >>> 0,
    exp2.lerpValue(0x40490fdb, 0x3f800000, 0x3f000000) >>> 0);
  /* randomized wide differential */
  for (let i = 0; i < 200; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const a = seed >>> 0;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const b = seed >>> 0;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const f = seed >>> 0;
    assert.equal(exp2.lerpValue(a, b, f) >>> 0,
      playerHud9c0120Value(a, b, f) >>> 0, `value rand ${i}`);
  }

  /* --- pair law: DISTINCT components so out0/out1 swaps cannot pass;
     the shared t is computed ONCE and reported --- */
  const pairRows = [
    [0x3f800000, 0x40000000, 0x40490fdb, 0xc0400000, 0x3f000000],
    [0x00000000, 0x42c80000, 0x3fa00000, 0xbf800000, 0x7fc00000],
    [0x42c80000, 0x00000000, 0xbfc00000, 0x3f800000, 0x40000000],
    [0x00800000, 0x7f7fffff, 0xff7fffff, 0x80000000, 0xbe4ccccd],
  ];
  const view = new DataView(exp2.memory.buffer);
  const pairBase = 0x10000;
  for (const [a, b, c, d, f] of pairRows) {
    const want = playerHud9c0170Pair(a, b, c, d, f);
    exp2.pair9c0170(a, b, c, d, f, pairBase);
    assert.equal(view.getUint32(pairBase + 0, true) >>> 0,
      want.out0Bits >>> 0,
      `pair out0 ${a.toString(16)},${b.toString(16)},${c.toString(16)},` +
        `${d.toString(16)},${f.toString(16)}`);
    assert.equal(view.getUint32(pairBase + 4, true) >>> 0,
      want.out1Bits >>> 0, `pair out1`);
    assert.equal(view.getUint32(pairBase + 8, true) >>> 0, want.tBits >>> 0,
      `pair t`);
  }
  exp2.pair9c0170(1, 2, 3, 4, 5, 0);

  /* --- every pin getter: wasm == model === PE truth --- */
  const pinRows = [
    ["va9c0120", playerHud9c0120Va, 0x009c0120],
    ["retVa9c0120", playerHud9c0120RetVa, 0x009c0165],
    ["nextVa9c0120", playerHud9c0120NextVa, 0x009c0170],
    ["vtblRef9c0120", playerHud9c0120VtableRefRdata, 0x00b7ed28],
    ["probeSlot9c0120", playerHud9c0120ProbeSlot, 4],
    ["probeOff9c0120", playerHud9c0120ProbeVtblOff, 0x10],
    ["aOff9c0120", playerHud9c0120AOff, 8],
    ["bOff9c0120", playerHud9c0120BOff, 0xc],
    ["clampLo", playerHudClampLoRdata, 0xba9fe4],
    ["clampHi", playerHudClampHiRdata, 0xbaa454],
    ["clampZero", playerHudClampZeroBits, 0],
    ["clampOne", playerHudClampOneBits, 0x3f800000],
    ["va9c0170", playerHud9c0170Va, 0x009c0170],
    ["retVa9c0170", playerHud9c0170RetVa, 0x009c01cc],
    ["nextVa9c0170", playerHud9c0170NextVa, 0x009c01d0],
    ["vtblRef9c0170", playerHud9c0170VtableRefRdata, 0x00b7ed40],
    ["retImm9c0170", playerHud9c0170RetImm, 4],
    ["aOff9c0170", playerHud9c0170AOff, 8],
    ["bOff9c0170", playerHud9c0170BOff, 0xc],
    ["cOff9c0170", playerHud9c0170COff, 0x10],
    ["dOff9c0170", playerHud9c0170DOff, 0x14],
  ];
  for (const [key, jsFn, hand] of pinRows) {
    assert.equal(exp2[key]() >>> 0, jsFn() >>> 0, `v40 pin wasm==js ${key}`);
    assert.equal(jsFn() >>> 0, hand >>> 0, `v40 pin hand ${key}`);
  }
});

/* ---------- v41: 0x9c06a0 probe-sum vec2 law (notes
   playerhud-v41-depth) ----------
   Verify-open: the v41 depth unit's census pick past the closed
   0x9bfd40..0x9c0693 window (census rows #2/#3/#4+#5+#6 pinned HOST;
   identify-zhl exactMatches [] on every start).  thiscall + out ptr
   [ebp+8], ret 4 @0x9c0757, returns eax = out.  TWO ALWAYS-PATH
   indirect probes ([vtbl+8] on embedded objects this+0xc8 / this+0xf0)
   stay HOST — their consumed VALUES are the post-probe f32 fields
   [obj1+0]/[obj1+4] (the v40 recapture precedent).  BSS globals
   0xc7997c/0xc79980 host-resolved inputs; K1/K2 file-backed rdata.
   Oracular rows from cpu-dump decode — NOT derived from the cpp. */

test("v41 PE truth (native): probe-sum census pins and constants", () => {
  for (const [jsName, expected] of [
    [PLAYERHUD_9C06A0_VA, 0x009c06a0],
    [PLAYERHUD_9C06A0_RET_VA, 0x009c0757],
    [PLAYERHUD_9C06A0_NEXT_VA, 0x009c075a],
    [PLAYERHUD_9C06A0_RET_IMM, 4],
    [PLAYERHUD_9C06A0_CALLER1_VA, 0x00420800],
    [PLAYERHUD_9C06A0_CALLER2_VA, 0x008403c0],
    [PLAYERHUD_9C06A0_OBJ1_OFF, 0xc8],
    [PLAYERHUD_9C06A0_PROBE_SLOT, 2],
    [PLAYERHUD_9C06A0_PROBE_VTBL_OFF, 8],
    [PLAYERHUD_9C06A0_OBJ1_X_OFF, 0],
    [PLAYERHUD_9C06A0_OBJ1_Y_OFF, 4],
    [PLAYERHUD_9C06A0_THIS_B_OFF, 0x48],
    [PLAYERHUD_9C06A0_THIS_D_OFF, 0x4c],
    [PLAYERHUD_9C06A0_OBJ2_OFF, 0xf0],
    [PLAYERHUD_GLOBAL1_BSS, 0x00c7997c],
    [PLAYERHUD_GLOBAL2_BSS, 0x00c79980],
    [PLAYERHUD_K1_RDATA, 0x00baa2d0],
    [PLAYERHUD_K1_BITS, 0x3f000000],
    [PLAYERHUD_K2_RDATA, 0x00baa804],
    [PLAYERHUD_K2_BITS, 0x41100000],
  ]) {
    assert.equal(jsName, expected, `js pin ${jsName}`);
  }
  /* Cross-pins: K1 is exactly 0.5f and K2 exactly 9.0f; the ret-imm
     spans the C2 04 00 epilogue; obj2 sits 0x28 above obj1; the two
     globals are adjacent BSS dwords; the two callers are distinct. */
  assert.equal(playerHudBitsToF32(PLAYERHUD_K1_BITS), 0.5);
  assert.equal(playerHudBitsToF32(PLAYERHUD_K2_BITS), 9);
  assert.equal(PLAYERHUD_9C06A0_RET_VA + 3, PLAYERHUD_9C06A0_NEXT_VA);
  assert.equal(PLAYERHUD_9C06A0_OBJ2_OFF - PLAYERHUD_9C06A0_OBJ1_OFF, 0x28);
  assert.equal(PLAYERHUD_GLOBAL2_BSS - PLAYERHUD_GLOBAL1_BSS, 4);
  assert.notEqual(PLAYERHUD_9C06A0_CALLER1_VA, PLAYERHUD_9C06A0_CALLER2_VA);
});

test("Wasm matches JS: v41 probe-sum decision seams", () => {
  const exp2 = loadExports();
  assert.equal(exp2.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  if (exp2.memory.buffer.byteLength < 0x3000) exp2.memory.grow(1);
  const view = new DataView(exp2.memory.buffer);
  const base = 0x2400;

  /* Hand row (PE order; DISTINCT components so output swaps cannot
     pass): out0 = (1+2) + 10*0.5 = 8 ; out1 = ((3+5) + 20*0.5) - 9 = 9. */
  exp2.law9c06a0(0x3f800000, 0x40000000, 0x40400000, 0x40a00000,
    0x41200000, 0x41a00000, base);
  assert.equal(view.getUint32(base + 0, true) >>> 0, 0x41000000, "law out0");
  assert.equal(view.getUint32(base + 4, true) >>> 0, 0x41100000, "law out1");
  const hand = playerHud9c06a0Law(0x3f800000, 0x40000000, 0x40400000,
    0x40a00000, 0x41200000, 0x41a00000);
  assert.equal(hand.out0Bits >>> 0, 0x41000000);
  assert.equal(hand.out1Bits >>> 0, 0x41100000);

  /* Asymmetric seams: negative addend, inf lanes (no inf-inf), and an
     all-fractional row — each must round per-op identically. */
  const seamRows = [
    [0x461c4000, 0xc21ed000, 0x3f800000, 0xbf800000, 0x3f800000, 0x40000000],
    [0x3f800000, 0x40490fdb, 0xbe4ccccd, 0x41200000, 0xbf000000, 0x3fc00000],
    [0x00800000, 0x7f800000, 0xff800000, 0x3fa00000, 0x41200000, 0x41a00000],
  ];
  for (const [a, b, c, d, g1, g2] of seamRows) {
    const w = playerHud9c06a0Law(a, b, c, d, g1, g2);
    exp2.law9c06a0(a, b, c, d, g1, g2, base);
    assert.equal(view.getUint32(base + 0, true) >>> 0, w.out0Bits >>> 0,
      `seam out0 ${a.toString(16)},${b.toString(16)},${g1.toString(16)}`);
    assert.equal(view.getUint32(base + 4, true) >>> 0, w.out1Bits >>> 0,
      `seam out1 ${c.toString(16)},${d.toString(16)},${g2.toString(16)}`);
  }

  /* Null out = no-op (parity with the v40 pair-law seam). */
  exp2.law9c06a0(1, 2, 3, 4, 5, 6, 0);

  /* 300-draw wide differential over ALL six bit inputs (NaN payloads
     quiet identically on both sides — x86 addss/mulss/subss vs V8 f64
     + fround share the quiet-bit rule). */
  let seed = 0x9c06a0;
  for (let i = 0; i < 300; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const a = seed;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const b = seed;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const c = seed;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const d = seed;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const g1 = seed;
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const g2 = seed;
    const w = playerHud9c06a0Law(a, b, c, d, g1, g2);
    exp2.law9c06a0(a, b, c, d, g1, g2, base);
    assert.equal(view.getUint32(base + 0, true) >>> 0, w.out0Bits >>> 0,
      `law rand out0 ${i}`);
    assert.equal(view.getUint32(base + 4, true) >>> 0, w.out1Bits >>> 0,
      `law rand out1 ${i}`);
  }

  /* Every pin getter: wasm == model === PE truth. */
  const pinRows = [
    ["va9c06a0", playerHud9c06a0Va, 0x009c06a0],
    ["retVa9c06a0", playerHud9c06a0RetVa, 0x009c0757],
    ["nextVa9c06a0", playerHud9c06a0NextVa, 0x009c075a],
    ["retImm9c06a0", playerHud9c06a0RetImm, 4],
    ["caller1Va9c06a0", playerHud9c06a0Caller1Va, 0x00420800],
    ["caller2Va9c06a0", playerHud9c06a0Caller2Va, 0x008403c0],
    ["obj1Off9c06a0", playerHud9c06a0Obj1Off, 0xc8],
    ["probeSlot9c06a0", playerHud9c06a0ProbeSlot, 2],
    ["probeOff9c06a0", playerHud9c06a0ProbeVtblOff, 8],
    ["xOff9c06a0", playerHud9c06a0Obj1XOff, 0],
    ["yOff9c06a0", playerHud9c06a0Obj1YOff, 4],
    ["bOff9c06a0", playerHud9c06a0ThisBOff, 0x48],
    ["dOff9c06a0", playerHud9c06a0ThisDOff, 0x4c],
    ["obj2Off9c06a0", playerHud9c06a0Obj2Off, 0xf0],
    ["global19c06a0", playerHudGlobal1Bss, 0x00c7997c],
    ["global29c06a0", playerHudGlobal2Bss, 0x00c79980],
    ["k1Rdata", playerHudK1Rdata, 0xbaa2d0],
    ["k1Bits", playerHudK1Bits, 0x3f000000],
    ["k2Rdata", playerHudK2Rdata, 0xbaa804],
    ["k2Bits", playerHudK2Bits, 0x41100000],
  ];
  for (const [key, jsFn, handPin] of pinRows) {
    assert.equal(exp2[key]() >>> 0, jsFn() >>> 0, `v41 pin wasm==js ${key}`);
    assert.equal(jsFn() >>> 0, handPin >>> 0, `v41 pin hand ${key}`);
  }
});

test("v41 mutation checks: K2 drop, component swap, direction flip, mul-add swap, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry(orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry(raw);
      buildWasm();
    }
  };
  const lawOf = (wasm) => wasm.isaac_playerhud_9c06a0_law
    ?? wasm._isaac_playerhud_9c06a0_law;
  const A = 0x3f800000, B = 0x40000000, C = 0x40400000;
  const D = 0x40a00000, G1 = 0x41200000, G2 = 0x41a00000;
  const run = (wasm) => {
    if (wasm.memory.buffer.byteLength < 0x3000) wasm.memory.grow(1);
    const view = new DataView(wasm.memory.buffer);
    const base = 0x2400;
    lawOf(wasm)(A, B, C, D, G1, G2, base);
    return [
      view.getUint32(base + 0, true) >>> 0,
      view.getUint32(base + 4, true) >>> 0,
    ];
  };

  /* M93: K2 drop — PE subss [0xbaa804]=9.0f; dropped keeps 18.0.
     (void)k2 keeps -Werror quiet with the constant unused. */
  withMutant(
    "  const float r1a = t1 + u1;\n  const float r1 = r1a - k2;",
    "  const float r1a = t1 + u1;\n  const float r1 = r1a;\n  (void)k2;",
    (wasm) => {
      const [o0, o1] = run(wasm);
      assert.equal(o1 >>> 0, f32Bits(18), "M93 must drop K2 (18 stays)");
      assert.notEqual(o1 >>> 0, 0x41100000,
        "M93 must diverge: PE subtracts K2=9.0f");
      assert.equal(o0 >>> 0, 0x41000000, "M93 leaves out0 untouched");
    },
  );
  /* M94: component swap — distinct hand row (8 vs 9) must flip.
     Anchor carries the v41-unique `r1a` line: the bare two-store pair
     also appears verbatim in the v40 0x9c0170 pair law (first
     occurrence would mutate the wrong body). */
  withMutant(
    "  const float r1 = r1a - k2;\n" +
    "  out->out0_bits = __builtin_bit_cast(uint32_t, r0);\n" +
    "  out->out1_bits = __builtin_bit_cast(uint32_t, r1);",
    "  const float r1 = r1a - k2;\n" +
    "  out->out0_bits = __builtin_bit_cast(uint32_t, r1);\n" +
    "  out->out1_bits = __builtin_bit_cast(uint32_t, r0);",
    (wasm) => {
      const [o0, o1] = run(wasm);
      assert.equal(o0 >>> 0, 0x41100000, "M94 out0 carries the out1 lane");
      assert.equal(o1 >>> 0, 0x41000000, "M94 out1 carries the out0 lane");
    },
  );

  /* M95: t0 direction flip (a+b -> a-b) — (1-2)+5 = 4, PE gives 8. */
  withMutant(
    "  const float t0 = a + b;",
    "  const float t0 = a - b;",
    (wasm) => {
      const [o0] = run(wasm);
      assert.equal(o0 >>> 0, f32Bits(4),
        "M95 must flip the addss direction");
      assert.notEqual(o0 >>> 0, 0x41000000,
        "M95 must diverge: PE adds b (8.0f)");
    },
  );

  /* M96: u0 mul->add (g1*k1 -> g1+k1) — 10+0.5=10.5, PE gives 5. */
  withMutant(
    "  const float u0 = g1 * k1;",
    "  const float u0 = g1 + k1;",
    (wasm) => {
      const [o0] = run(wasm);
      assert.equal(o0 >>> 0,
        f32Bits(Math.fround(Math.fround(1 + 2) + Math.fround(10 + 0.5))),
        "M96 must add the scale instead of multiplying");
      assert.notEqual(o0 >>> 0, 0x41000000,
        "M96 must diverge: PE multiplies K1=0.5f (8.0f)");
    },
  );

  /* M97: next-VA drift 0x9c075a -> -0x4 (PE next body is the 0x9c075a
     E8-pair host after the C2 04 00). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9c06a0_next_va(void) {\n  return ISAAC_PLAYERHUD_9C06A0_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9c06a0_next_va(void) {\n  return ISAAC_PLAYERHUD_9C06A0_NEXT_VA - 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c06a0_next_va
        ?? wasm._isaac_playerhud_9c06a0_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9C06A0_NEXT_VA - 0x4,
        "M97 must diverge: PE next 0x9c075a; mutant -> 0x9c0756",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
  if (exp.memory.buffer.byteLength < 0x3000) exp.memory.grow(1);
  const view = new DataView(exp.memory.buffer);
  exp.law9c06a0(A, B, C, D, G1, G2, 0x2400);
  assert.equal(view.getUint32(0x2400 + 0, true) >>> 0, 0x41000000);
  assert.equal(view.getUint32(0x2400 + 4, true) >>> 0, 0x41100000);
  assert.equal(exp.nextVa9c06a0() >>> 0, PLAYERHUD_9C06A0_NEXT_VA);
});

/* ---------- v42: 0x9c2210 slot-index advance machine (notes
   playerhud-v41-depth append) ----------
   Verify-open: the v41 handoff's re-open lead.  PURE-COMPLETE body
   (0 E8 / 0 IND / no SEH / no globals; identify-zhl exactMatches []).
   thiscall + i32 arg, ret 4 @0x9c22a4; four direct rel32 callers
   0x009c066b / 0x009c092c / 0x009c0b67 / 0x009c0b9b.  Oracular rows
   hand-traced from cpu-dump decode — NOT derived from the cpp.
   Law operates on caller memory through pointers (856960_move_range
   precedent); adversarial-arg nontermination excluded by row
   vetting (the JS sim rejects runaway/out-of-bounds-probe rows). */

test("v42 PE truth (native): advance-machine census pins and constants", () => {
  for (const [jsName, expected] of [
    [PLAYERHUD_9C2210_VA, 0x009c2210],
    [PLAYERHUD_9C2210_RET_VA, 0x009c22a4],
    [PLAYERHUD_9C2210_NEXT_VA, 0x009c22b0],
    [PLAYERHUD_9C2210_RET_IMM, 4],
    [PLAYERHUD_9C2210_INDEX_OFF, 0xc],
    [PLAYERHUD_9C2210_VEC_BEGIN_OFF, 0x84],
    [PLAYERHUD_9C2210_VEC_END_OFF, 0x88],
    [PLAYERHUD_9C2210_STRIDE, 0x30],
    [PLAYERHUD_9C2210_DIV_MAGIC, 0x2aaaaaab],
    [PLAYERHUD_9C2210_DIV_SHIFT, 3],
    [PLAYERHUD_9C2210_EMPTY_FLAG_OFF, 8],
    [PLAYERHUD_9C2210_EMPTY_FLAG_BITS, 0xffffffff],
    [PLAYERHUD_9C2210_CALLER1_VA, 0x009c066b],
    [PLAYERHUD_9C2210_CALLER2_VA, 0x009c092c],
    [PLAYERHUD_9C2210_CALLER3_VA, 0x009c0b67],
    [PLAYERHUD_9C2210_CALLER4_VA, 0x009c0b9b],
  ]) {
    assert.equal(jsName, expected, `js pin ${jsName}`);
  }
  /* Cross-pins: empty flag and fail index are the same -1 dword; the
     next body sits behind ret-imm + int3 pad (0xa7..0xaf); the index
     cell offset matches v41's merged scan store target; callers are
     distinct; count law is truncated-toward-zero. */
  assert.equal(PLAYERHUD_9C2210_EMPTY_FLAG_BITS,
    PLAYERHUD_9C2210_FAIL_INDEX);
  assert.equal(PLAYERHUD_9C2210_NEXT_VA - PLAYERHUD_9C2210_RET_VA, 0xc);
  assert.equal(PLAYERHUD_9C2210_INDEX_OFF, 0xc);
  const callers = [PLAYERHUD_9C2210_CALLER1_VA, PLAYERHUD_9C2210_CALLER2_VA,
    PLAYERHUD_9C2210_CALLER3_VA, PLAYERHUD_9C2210_CALLER4_VA];
  assert.equal(new Set(callers).size, 4);
  assert.equal(playerHud9c2210Count(0), 0);
  assert.equal(playerHud9c2210Count(-0x30), -1);
  assert.equal(playerHud9c2210Count(12 * 0x30), 12);
});

test("Wasm matches JS: v42 advance machine decision seams", () => {
  const exp2 = loadExports();
  assert.equal(exp2.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  if (exp2.memory.buffer.byteLength < 0x8000) exp2.memory.grow(1);
  const view = new DataView(exp2.memory.buffer);
  const CELL = 0x6000;
  const VEC = 0x6100;
  const runWasm = (cur, arg, flags) => {
    for (let i = 0; i < flags.length * PLAYERHUD_9C2210_STRIDE; i += 4) {
      view.setUint32(VEC + i, 0, true);
    }
    view.setInt32(CELL, cur | 0, true);
    for (let i = 0; i < flags.length; i++) {
      view.setInt32(VEC + i * PLAYERHUD_9C2210_STRIDE +
        PLAYERHUD_9C2210_EMPTY_FLAG_OFF, flags[i] | 0, true);
    }
    const ret = exp2.advance9c2210(CELL, arg | 0, VEC,
      VEC + flags.length * PLAYERHUD_9C2210_STRIDE) | 0;
    return { ret, cell: view.getInt32(CELL, true) };
  };
  const jsOf = (cur, arg, flags) => playerHud9c2210Advance(cur, arg,
    flags.length * PLAYERHUD_9C2210_STRIDE,
    (i) => (i >= 0 && i < flags.length ? flags[i] : NaN));
  const check = (name, cur, arg, flags, want) => {
    const w = runWasm(cur, arg, flags);
    const j = jsOf(cur, arg, flags);
    assert.equal(j.runaway, false, `${name} must terminate`);
    assert.ok(j.minProbe >= 0 && j.maxProbe < flags.length,
      `${name} probes stay in-bounds`);
    assert.equal(w.ret, want, `${name} wasm return`);
    assert.equal(w.cell, want, `${name} stored cell`);
    assert.equal(j.final >>> 0, want >>> 0, `${name} js final`);
    assert.equal(w.ret, j.final | 0, `${name} wasm==js`);
  };

  /* Hand rows covering every control edge. */
  check("R1 simple occupied stop", 2, 3,
    [-1, -1, -1, -1, -1, 7, -1, -1], 5);
  check("R2 multi-hop empty skip", 0, 1,
    [-1, -1, -1, -1, 7, -1, -1, -1], 4);
  check("R3 clamp wrap-down", 3, 1, [9, -1, -1, -1], 0);
  check("R4 negative wrap-up", 0, -1, [-1, -1, -1, 5], 3);
  check("R5 fail orig<0 next<0", -2, -1, [-1, -1, -1, -1], -1);
  check("R6 full cycle to orig", 0, 1, [-1, -1, -1, -1], 0);
  check("R9a wrap then occupied stop", 1, 1, [5, -1, -1], 0);
  check("R9b land-on-orig skips probe", 2, 4,
    [9, -1, -1, -1], 2);
  check("R8 fail grows past count", -1, 5, [-1, -1, -1, -1], -1);

  /* Vetted randomized differential: reject runaway or OOB-probe rows
     BEFORE running wasm (deterministic LCG; the kept rows are a
     fixed list every run). */
  let seed = 0x9c2210;
  const next = () => ((seed = (Math.imul(seed, 1664525) +
    1013904223) >>> 0) >>> 0);
  let kept = 0;
  for (let draw = 0; draw < 2000 && kept < 200; draw++) {
    const count = 1 + (next() % 12);
    const flags = [];
    for (let i = 0; i < count; i++) {
      flags.push((next() & 1) ? -1 : (0x100 + i));
    }
    const cur = next() % count;
    const span = count + 2;
    const arg = ((next() % (2 * span + 1)) - span) | 0;
    const j = jsOf(cur, arg, flags);
    if (j.runaway) continue;
    if (j.minProbe < 0 || j.maxProbe >= count) continue;
    const w = runWasm(cur, arg, flags);
    assert.equal(w.ret, j.final | 0, `rand ${draw} final`);
    assert.equal(w.cell, j.final | 0, `rand ${draw} cell`);
    kept++;
  }
  assert.ok(kept >= 150, `enough vetted rows kept (${kept})`);

  /* Every pin getter: wasm == model === PE truth. */
  const pinRows = [
    ["va9c2210", playerHud9c2210Va, 0x009c2210],
    ["retVa9c2210", playerHud9c2210RetVa, 0x009c22a4],
    ["nextVa9c2210", playerHud9c2210NextVa, 0x009c22b0],
    ["retImm9c2210", playerHud9c2210RetImm, 4],
    ["indexOff9c2210", playerHud9c2210IndexOff, 0xc],
    ["vecBeginOff9c2210", playerHud9c2210VecBeginOff, 0x84],
    ["vecEndOff9c2210", playerHud9c2210VecEndOff, 0x88],
    ["stride9c2210", playerHud9c2210Stride, 0x30],
    ["divMagic9c2210", playerHud9c2210DivMagic, 0x2aaaaaab],
    ["divShift9c2210", playerHud9c2210DivShift, 3],
    ["emptyFlagOff9c2210", playerHud9c2210EmptyFlagOff, 8],
    ["emptyFlagBits9c2210", playerHud9c2210EmptyFlagBits, 0xffffffff],
    ["caller1Va9c2210", playerHud9c2210Caller1Va, 0x009c066b],
    ["caller2Va9c2210", playerHud9c2210Caller2Va, 0x009c092c],
    ["caller3Va9c2210", playerHud9c2210Caller3Va, 0x009c0b67],
    ["caller4Va9c2210", playerHud9c2210Caller4Va, 0x009c0b9b],
  ];
  for (const [key, jsFn, handPin] of pinRows) {
    assert.equal(exp2[key]() >>> 0, jsFn() >>> 0, `v42 pin wasm==js ${key}`);
    assert.equal(jsFn() >>> 0, handPin >>> 0, `v42 pin hand ${key}`);
  }
});

test("v42 mutation checks: fail drift, probe kill, stride drift, pin drift x2", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry(orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry(raw);
      buildWasm();
    }
  };
  const advOf = (wasm) => wasm.isaac_playerhud_9c2210_advance
    ?? wasm._isaac_playerhud_9c2210_advance;
  const runM = (wasm, cur, arg, flags) => {
    if (wasm.memory.buffer.byteLength < 0x8000) wasm.memory.grow(1);
    const v = new DataView(wasm.memory.buffer);
    const CELL = 0x6000, VEC = 0x6100;
    for (let i = 0; i < flags.length * PLAYERHUD_9C2210_STRIDE; i += 4) {
      v.setUint32(VEC + i, 0, true);
    }
    v.setInt32(CELL, cur | 0, true);
    for (let i = 0; i < flags.length; i++) {
      v.setInt32(VEC + i * PLAYERHUD_9C2210_STRIDE +
        PLAYERHUD_9C2210_EMPTY_FLAG_OFF, flags[i] | 0, true);
    }
    return advOf(wasm)(CELL, arg | 0, VEC,
      VEC + flags.length * PLAYERHUD_9C2210_STRIDE) | 0;
  };

  /* M98: fail index drifts -1 -> 0 (PE mov dword [ebx+0xc],-1). */
  withMutant(
    "  *index_cell =\n" +
    "      failed ? (int32_t)ISAAC_PLAYERHUD_9C2210_FAIL_INDEX : cell;",
    "  *index_cell = failed ? 0 : cell;",
    (wasm) => {
      assert.equal(runM(wasm, -2, -1, [-1, -1, -1, -1]), 0,
        "M98 must store the drifted fail value");
      assert.notEqual(runM(wasm, -2, -1, [-1, -1, -1, -1]), -1,
        "M98 must diverge: PE stores -1");
    },
  );

  /* M99: empty-skip killed -- the occupied gate can never fire
     (constant-condition on the pinned -1 bits), so the loop only
     exits via land-on-orig/fail; R2's hop chain must collapse.
     (void)flag keeps -Werror quiet with the load unused. */
  withMutant(
    "    if (flag != -1) { /* occupied -> keep */",
    "    (void)flag;\n" +
    "    if ((int32_t)ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_BITS != -1) {\n" +
    "      /* occupied -> keep */",
    (wasm) => {
      assert.equal(runM(wasm, 0, 1,
        [-1, -1, -1, -1, 7, -1, -1, -1]), 0,
        "M99 must orbit back to orig without skipping");
      assert.notEqual(runM(wasm, 0, 1,
        [-1, -1, -1, -1, 7, -1, -1, -1]), 4,
        "M99 must diverge: PE skips empties to 4");
    },
  );

  /* M100: probe stride drifts 0x30 -> 0x28 -- reads zero-filled
     filler (not -1), collapsing the same hop chain. */
  withMutant(
    "        (uint32_t)esi * ISAAC_PLAYERHUD_9C2210_STRIDE +",
    "        (uint32_t)esi * (ISAAC_PLAYERHUD_9C2210_STRIDE - 8u) +",
    (wasm) => {
      assert.equal(runM(wasm, 0, 1,
        [-1, -1, -1, -1, 7, -1, -1, -1]), 1,
        "M100 must probe filler bytes instead of the flag dword");
      assert.notEqual(runM(wasm, 0, 1,
        [-1, -1, -1, -1, 7, -1, -1, -1]), 4,
        "M100 must diverge: PE strides 0x30");
    },
  );

  /* M101: next-VA drift 0x9c22b0 -> 0x9c22ac (PE next body starts
     after the int3 pad at 0x9c22a7..af). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9c2210_next_va(void) {\n  return ISAAC_PLAYERHUD_9C2210_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9c2210_next_va(void) {\n  return ISAAC_PLAYERHUD_9C2210_NEXT_VA - 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c2210_next_va
        ?? wasm._isaac_playerhud_9c2210_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9C2210_NEXT_VA - 0x4,
        "M101 must diverge: PE next 0x9c22b0; mutant -> 0x9c22ac",
      );
    },
  );

  /* M102: caller2 VA drift 0x9c092c -> 0x9c0928 (the merged
     slot-search fn's real call site). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9c2210_caller2_va(void) {\n  return ISAAC_PLAYERHUD_9C2210_CALLER2_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9c2210_caller2_va(void) {\n  return ISAAC_PLAYERHUD_9C2210_CALLER2_VA - 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c2210_caller2_va
        ?? wasm._isaac_playerhud_9c2210_caller2_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9C2210_CALLER2_VA - 0x4,
        "M102 must diverge: PE caller2 0x9c092c; mutant -> 0x9c0928",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
});

/* ---------- v43: 0x009c0870 merged slot-search/clear (NOTES
   ADDENDUM section 7) ----------
   Verify-open: the v42 handoff's re-open lead.  PURE-COMPLETE under
   family host-leaf conventions: the SOLE E8 composes the landed pure
   v42 advance (composition precedent v31/v42); identify-zhl
   exactMatches [].  ret 8 with three exits (exhaust @0x9c08d3 /
   cleared @0x9c0943 / shared @0x9c0958); FOUR direct rel32 callers
   0x00420670 / 0x00420692 / 0x00420783 / 0x0042078e.  Oracular rows
   hand-traced from cpu-dump decode — NOT derived from the cpp.
   Composition domain note: the composed advance(-1) from orig >= 0
   always terminates within <= count steps and probes stay in
   [0, count) (downward orbit with single-add wrap; land-on-orig
   checked before probing) — every generated row is therefore safe
   for the real wasm loop. */

test("v43 PE truth: search/clear census pins and constants", () => {
  for (const [jsName, expected] of [
    [PLAYERHUD_9C0870_VA, 0x009c0870],
    [PLAYERHUD_9C0870_RET_VA, 0x009c0958],
    [PLAYERHUD_9C0870_RET_EXHAUST_VA, 0x009c08d3],
    [PLAYERHUD_9C0870_RET_CLEARED_VA, 0x009c0943],
    [PLAYERHUD_9C0870_NEXT_VA, 0x009c0960],
    [PLAYERHUD_9C0870_RET_IMM, 8],
    [PLAYERHUD_9C0870_INDEX_OFF, 0xc],
    [PLAYERHUD_9C0870_VEC_BEGIN_OFF, 0x84],
    [PLAYERHUD_9C0870_VEC_END_OFF, 0x88],
    [PLAYERHUD_9C0870_STRIDE, 0x30],
    [PLAYERHUD_9C0870_DIV_MAGIC, 0x2aaaaaab],
    [PLAYERHUD_9C0870_DIV_SHIFT, 3],
    [PLAYERHUD_9C0870_FLAG_A_OFF, 8],
    [PLAYERHUD_9C0870_FLAG_B_OFF, 0xc],
    [PLAYERHUD_9C0870_EMPTY_BITS, 0xffffffff],
    [PLAYERHUD_9C0870_CALLER1_VA, 0x00420670],
    [PLAYERHUD_9C0870_CALLER2_VA, 0x00420692],
    [PLAYERHUD_9C0870_CALLER3_VA, 0x00420783],
    [PLAYERHUD_9C0870_CALLER4_VA, 0x0042078e],
  ]) {
    assert.equal(jsName, expected, `js pin ${jsName}`);
  }
  /* Cross-pins: three exits ordered head->tail; shared epilogue sits
     behind ret-imm + int3 pad; the index cell offset matches the
     v41/v42 store target; callers distinct. */
  assert.ok(PLAYERHUD_9C0870_RET_EXHAUST_VA <
    PLAYERHUD_9C0870_RET_CLEARED_VA);
  assert.ok(PLAYERHUD_9C0870_RET_CLEARED_VA < PLAYERHUD_9C0870_RET_VA);
  assert.equal(PLAYERHUD_9C0870_NEXT_VA - PLAYERHUD_9C0870_RET_VA, 8);
  assert.equal(PLAYERHUD_9C0870_INDEX_OFF, PLAYERHUD_9C2210_INDEX_OFF);
  const callers = [PLAYERHUD_9C0870_CALLER1_VA, PLAYERHUD_9C0870_CALLER2_VA,
    PLAYERHUD_9C0870_CALLER3_VA, PLAYERHUD_9C0870_CALLER4_VA];
  assert.equal(new Set(callers).size, 4);
});

test("Wasm matches JS: v43 search/clear decision seams", () => {
  const exp2 = loadExports();
  assert.equal(exp2.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);
  if (exp2.memory.buffer.byteLength < 0x8000) exp2.memory.grow(1);
  const view = new DataView(exp2.memory.buffer);
  const CELL = 0x6000;
  const VEC = 0x6100;
  const runWasm = (cur, which, lane, elems) => {
    for (let i = 0; i < elems.length * PLAYERHUD_9C0870_STRIDE; i += 4) {
      view.setUint32(VEC + i, 0, true);
    }
    view.setInt32(CELL, cur | 0, true);
    for (let i = 0; i < elems.length; i++) {
      view.setInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
        PLAYERHUD_9C0870_FLAG_A_OFF, elems[i].a | 0, true);
      view.setInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
        PLAYERHUD_9C0870_FLAG_B_OFF, elems[i].b | 0, true);
    }
    const ret = exp2.searchClear9c0870(CELL, which | 0, lane | 0, VEC,
      VEC + elems.length * PLAYERHUD_9C0870_STRIDE) | 0;
    const dump = [];
    for (let i = 0; i < elems.length; i++) {
      dump.push({
        a: view.getInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
          PLAYERHUD_9C0870_FLAG_A_OFF, true),
        b: view.getInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
          PLAYERHUD_9C0870_FLAG_B_OFF, true),
      });
    }
    return { ret, cell: view.getInt32(CELL, true), elems: dump };
  };
  const check = (name, cur, which, lane, elems, wantCell, wantElems) => {
    const w = runWasm(cur, which, lane, elems);
    const j = playerHud9c0870SearchClear(cur, which, lane,
      elems.map((e) => ({ ...e })));
    assert.equal(w.ret, wantCell, `${name} wasm ret`);
    assert.equal(w.cell, wantCell, `${name} stored cell`);
    assert.equal(j.cell, wantCell, `${name} js cell`);
    for (let i = 0; i < elems.length; i++) {
      assert.equal(w.elems[i].a, wantElems[i].a, `${name} e${i}.a`);
      assert.equal(w.elems[i].b, wantElems[i].b, `${name} e${i}.b`);
      assert.equal(j.elems[i].a, wantElems[i].a, `${name} js e${i}.a`);
      assert.equal(j.elems[i].b, wantElems[i].b, `${name} js e${i}.b`);
    }
  };

  const EE = { a: -1, b: -1 };
  /* Hand rows covering every control edge (want = full state). */
  check("H1 first-found lane1 clear + land-back -> -1", 0, 0, 1,
    [{ a: -1, b: 5 }, { ...EE }], -1,
    [{ a: 5, b: -1 }, { ...EE }]);
  check("H2 second-ordinal + advance moves away keeps moved", 1, 1, 1,
    [{ a: 3, b: 4 }, { a: -1, b: 6 }], 0,
    [{ a: 3, b: 4 }, { a: 6, b: -1 }]);
  check("H3 ordinal exhausted no-op", 2, 5,
    1, [{ a: 3, b: 4 }, { a: 9, b: 9 }], 2,
    [{ a: 3, b: 4 }, { a: 9, b: 9 }]);
  check("H4 count==0 no-op", 3, 0, 1, [], 3, []);
  check("H5 tail guard occupied lane no-op", 0, 0, 1,
    [{ a: 7, b: 9 }], 0, [{ a: 7, b: 9 }]);
  check("H6 lane0 mirror then advance orbits back", 0, 0, 0,
    [{ a: 8, b: -1 }, { ...EE }], -1,
    [{ a: -1, b: 8 }, { ...EE }]);
  check("H7 pickup cur==-1 && lane!=0", -1, 0, 1,
    [{ a: -1, b: 3 }, { ...EE }], 0,
    [{ a: 3, b: -1 }, { ...EE }]);
  check("H8 cur elsewhere untouched", 1, 0, 1,
    [{ a: -1, b: 3 }, { a: 9, b: 9 }], 1,
    [{ a: 3, b: -1 }, { a: 9, b: 9 }]);
  check("H9 leading empty skipped, advance orbit", 1, 0, 1,
    [{ ...EE }, { a: -1, b: 6 }, { ...EE }], -1,
    [{ ...EE }, { a: 6, b: -1 }, { ...EE }]);
  check("H9b ordinal beyond non-empty exhausts", 0, 1, 1,
    [{ ...EE }, { a: -1, b: 6 }, { ...EE }], 0,
    [{ ...EE }, { a: -1, b: 6 }, { ...EE }]);

  /* Randomized differential: arg=-1 composition domain is provably
     terminating (downward orbit, land-on-orig checked pre-probe), so
     every generated row is safe for the real wasm loop. */
  let seed = 0x9c0870;
  const next = () => ((seed = (Math.imul(seed, 1664525) +
    1013904223) >>> 0) >>> 0);
  for (let draw = 0; draw < 150; draw++) {
    const n = 1 + (next() % 10);
    const elems = [];
    for (let i = 0; i < n; i++) {
      elems.push({
        a: (next() & 1) ? -1 : (0x40 + i),
        b: (next() & 1) ? -1 : (0x80 + i),
      });
    }
    const cur = (next() % (n + 1)) - 1;
    const which = next() % (n + 1);
    const lane = next() & 1;
    const w = runWasm(cur, which, lane, elems.map((e) => ({ ...e })));
    const j = playerHud9c0870SearchClear(cur, which, lane,
      elems.map((e) => ({ ...e })));
    assert.equal(w.ret, j.cell | 0, `rand ${draw} ret`);
    assert.deepEqual(w.elems, j.elems, `rand ${draw} elems`);
  }

  /* Every pin getter: wasm == model === PE truth. */
  const pinRows = [
    ["va9c0870", playerHud9c0870Va, 0x009c0870],
    ["retVa9c0870", playerHud9c0870RetVa, 0x009c0958],
    ["retExhaustVa9c0870", playerHud9c0870RetExhaustVa, 0x009c08d3],
    ["retClearedVa9c0870", playerHud9c0870RetClearedVa, 0x009c0943],
    ["nextVa9c0870", playerHud9c0870NextVa, 0x009c0960],
    ["retImm9c0870", playerHud9c0870RetImm, 8],
    ["indexOff9c0870", playerHud9c0870IndexOff, 0xc],
    ["vecBeginOff9c0870", playerHud9c0870VecBeginOff, 0x84],
    ["vecEndOff9c0870", playerHud9c0870VecEndOff, 0x88],
    ["stride9c0870", playerHud9c0870Stride, 0x30],
    ["divMagic9c0870", playerHud9c0870DivMagic, 0x2aaaaaab],
    ["divShift9c0870", playerHud9c0870DivShift, 3],
    ["flagAOff9c0870", playerHud9c0870FlagAOff, 8],
    ["flagBOff9c0870", playerHud9c0870FlagBOff, 0xc],
    ["emptyBits9c0870", playerHud9c0870EmptyBits, 0xffffffff],
    ["caller1Va9c0870", playerHud9c0870Caller1Va, 0x00420670],
    ["caller2Va9c0870", playerHud9c0870Caller2Va, 0x00420692],
    ["caller3Va9c0870", playerHud9c0870Caller3Va, 0x00420783],
    ["caller4Va9c0870", playerHud9c0870Caller4Va, 0x0042078e],
  ];
  for (const [key, jsFn, handPin] of pinRows) {
    assert.equal(exp2[key]() >>> 0, jsFn() >>> 0, `v43 pin wasm==js ${key}`);
    assert.equal(jsFn() >>> 0, handPin >>> 0, `v43 pin hand ${key}`);
  }
});

test("v43 mutation checks: lane copy, advance compose, ordinal drift, empty skip, pin drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry(orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry(raw);
      buildWasm();
    }
  };
  const scOf = (wasm) => wasm.isaac_playerhud_9c0870_search_clear
    ?? wasm._isaac_playerhud_9c0870_search_clear;
  const runM = (wasm, cur, which, lane, elems) => {
    if (wasm.memory.buffer.byteLength < 0x8000) wasm.memory.grow(1);
    const v = new DataView(wasm.memory.buffer);
    const CELL = 0x6000, VEC = 0x6100;
    for (let i = 0; i < elems.length * PLAYERHUD_9C0870_STRIDE; i += 4) {
      v.setUint32(VEC + i, 0, true);
    }
    v.setInt32(CELL, cur | 0, true);
    for (let i = 0; i < elems.length; i++) {
      v.setInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
        PLAYERHUD_9C0870_FLAG_A_OFF, elems[i].a | 0, true);
      v.setInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
        PLAYERHUD_9C0870_FLAG_B_OFF, elems[i].b | 0, true);
    }
    scOf(wasm)(CELL, which | 0, lane | 0, VEC,
      VEC + elems.length * PLAYERHUD_9C0870_STRIDE) | 0;
    const dump = [];
    for (let i = 0; i < elems.length; i++) {
      dump.push([
        v.getInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
          PLAYERHUD_9C0870_FLAG_A_OFF, true),
        v.getInt32(VEC + i * PLAYERHUD_9C0870_STRIDE +
          PLAYERHUD_9C0870_FLAG_B_OFF, true),
      ]);
    }
    return { cell: v.getInt32(CELL, true), elems: dump };
  };

  /* M103: lane1 copy writes -1 instead of [e+0xc] -- H1 must show
     a cleared a-lane (PE copies the b value through). */
  withMutant(
    "    __builtin_memcpy(p8, &fc, sizeof(f8));   /* PE 0x9c08f0 */",
    "    __builtin_memcpy(p8, &neg1, sizeof(f8)); /* M103 */",
    (wasm) => {
      const r = runM(wasm, 0, 0, 1, [{ a: -1, b: 5 }, { a: -1, b: -1 }]);
      assert.equal(r.elems[0][0], -1, "M103 must store -1 into a");
      assert.notEqual(r.elems[0][0], 5,
        "M103 must diverge: PE copies [e+0xc]=5");
    },
  );

  /* M104: advance composition dropped -- the moved-away reseat
     (H2: advance lands 0, kept) collapses to land-back -> -1. */
  withMutant(
    "    isaac_playerhud_9c2210_advance(index_cell, -1, vec_begin, vec_end);",
    "    /* M104: composition removed */",
    (wasm) => {
      const r = runM(wasm, 1, 1, 1,
        [{ a: 3, b: 4 }, { a: -1, b: 6 }]);
      assert.equal(r.cell, -1, "M104 must fall to land-back -1");
      assert.notEqual(r.cell, 0,
        "M104 must diverge: PE keeps the advanced-away seat 0");
    },
  );

  /* M105: ordinal target drifts which -> which+1 -- H1 (which=0)
     must miss the only non-empty element entirely. */
  withMutant(
    "    if (old == which) {          /* PE cmp eax,[ebp+8]; je tail */",
    "    if (old == which + 1) {      /* M105 */",
    (wasm) => {
      const r = runM(wasm, 0, 0, 1, [{ a: -1, b: 5 }, { a: -1, b: -1 }]);
      assert.deepEqual(r.elems, [[-1, 5], [-1, -1]],
        "M105 must leave the only target untouched");
      assert.equal(r.elems[0][0], -1, "M105 must not copy the b lane");
      assert.equal(r.cell, 0, "M105 must keep the incoming seat");
    },
  );

  /* M106: empty-skip dropped -- a leading EMPTY element consumes
     ordinal 0 and the wrong slot gets cleared. */
  withMutant(
    "      continue; /* EMPTY: not counted (PE 0x9c08b9 je) */",
    "      ; /* M106: empty counted */",
    (wasm) => {
      const r = runM(wasm, 0, 0, 1,
        [{ a: -1, b: -1 }, { a: -1, b: 5 }]);
      assert.equal(r.elems[1][1], 5,
        "M106 must leave the real target's b intact");
      assert.notEqual(r.elems[1][0], 5,
        "M106 must diverge: PE skips empties and clears elem1.b");
    },
  );

  /* M107: caller1 VA drift 0x00420670 -> 0x0042066c. */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9c0870_caller1_va(void) {\n  return ISAAC_PLAYERHUD_9C0870_CALLER1_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9c0870_caller1_va(void) {\n  return ISAAC_PLAYERHUD_9C0870_CALLER1_VA - 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c0870_caller1_va
        ?? wasm._isaac_playerhud_9c0870_caller1_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9C0870_CALLER1_VA - 0x4,
        "M107 must diverge: PE caller1 0x00420670; mutant -> 0x0042066c",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
});

/* ---------- v44: 0x009c2370 probe-threshold gate (NOTES ADDENDUM
   section 8) ----------
   Verify-open: band census past the QPC-stamp host cluster (max 2
   bodies; #2 0x9c23a0 pinned HOST).  EXACTLY the v40 NARROWED class:
   virtual method address-taken ONLY via .rdata vtable dwords 0xb7ed2c /
   0xb7ed44 (adjacent slots of the SAME neighborhood as the v40 lerp
   visitors' 0xb7ed28/0xb7ed40), ZERO E8 callers; ALWAYS-PATH indirect
   probe [[ecx]+0x10] = vtbl slot 4, st0 recaptured as f_bits (probe
   edge stays HOST); then comiss vs [0xbaa454]=1.0f + setae.  Oracular
   rows hand-derived from cpu-dump decode — NOT from the cpp. */

test("v44 PE truth: gate census pins and constants", () => {
  for (const [jsName, expected] of [
    [PLAYERHUD_9C2370_VA, 0x009c2370],
    [PLAYERHUD_9C2370_RET_VA, 0x009c2390],
    [PLAYERHUD_9C2370_NEXT_VA, 0x009c23a0],
    [PLAYERHUD_9C2370_PROBE_SLOT, 4],
    [PLAYERHUD_9C2370_PROBE_VTBL_OFF, 0x10],
    [PLAYERHUD_9C2370_VTABLE_REF_RDATA_A, 0x00b7ed2c],
    [PLAYERHUD_9C2370_VTABLE_REF_RDATA_B, 0x00b7ed44],
    [PLAYERHUD_9C2370_GATE_RDATA, 0x00baa454],
    [PLAYERHUD_9C2370_GATE_BITS, 0x3f800000],
  ]) {
    assert.equal(jsName, expected, `js pin ${jsName}`);
  }
  /* Cross-pins: the two vtable refs are adjacent slots of the same
     class neighborhood as the v40 visitors (+4 each of b7ed28/b7ed40);
     the gate constant is exactly 1.0f; next body sits behind ret+pad. */
  assert.equal(PLAYERHUD_9C2370_VTABLE_REF_RDATA_B -
    PLAYERHUD_9C2370_VTABLE_REF_RDATA_A, 0x18);
  assert.equal(PLAYERHUD_9C2370_VTABLE_REF_RDATA_A -
    PLAYERHUD_9C0120_VTABLE_REF_RDATA, 4);
  assert.equal(playerHudBitsToF32(PLAYERHUD_9C2370_GATE_BITS), 1);
  assert.equal(PLAYERHUD_9C2370_NEXT_VA - PLAYERHUD_9C2370_RET_VA, 0x10);
});

test("Wasm matches JS: v44 gate decision seams", () => {
  const exp2 = loadExports();
  assert.equal(exp2.abi(), PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION);

  /* Ordered-compare edges: exactly-at-threshold hits, one-ulp-below
     misses, NaN unordered -> 0, both infinities, negatives, denormals,
     -0 vs +0. */
  const rows = [
    [0x3f800000, 1], /* 1.0f: comiss equal -> setae */
    [0x3f7fffff, 0], /* 0.99999994f: just below */
    [0x40000000, 1], /* 2.0f */
    [0x7fc00000, 0], /* qNaN: unordered */
    [0xffc00000, 0], /* -qNaN */
    [0x7f800000, 1], /* +inf */
    [0xff800000, 0], /* -inf */
    [0xbf800000, 0], /* -1.0f */
    [0x80000000, 0], /* -0.0f */
    [0x00000000, 0], /* +0.0f */
    [0x00800000, 0], /* min denormal */
    [0x3f000000, 0], /* 0.5f */
  ];
  for (const [fBits, want] of rows) {
    assert.equal(exp2.gate9c2370(fBits) >>> 0, want,
      `gate ${fBits.toString(16)}`);
    assert.equal(playerHud9c2370Gate(fBits), want, `js ${fBits.toString(16)}`);
  }

  let seed = 0x9c2370;
  for (let i = 0; i < 300; i++) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const fBits = seed;
    assert.equal(exp2.gate9c2370(fBits) >>> 0,
      playerHud9c2370Gate(fBits), `gate rand ${i}`);
  }

  const pinRows = [
    ["va9c2370", playerHud9c2370Va, 0x009c2370],
    ["retVa9c2370", playerHud9c2370RetVa, 0x009c2390],
    ["nextVa9c2370", playerHud9c2370NextVa, 0x009c23a0],
    ["probeSlot9c2370", playerHud9c2370ProbeSlot, 4],
    ["probeOff9c2370", playerHud9c2370ProbeVtblOff, 0x10],
    ["vtblRefA9c2370", playerHud9c2370VtableRefRdataA, 0x00b7ed2c],
    ["vtblRefB9c2370", playerHud9c2370VtableRefRdataB, 0x00b7ed44],
    ["gateRdata9c2370", playerHud9c2370GateRdata, 0xbaa454],
    ["gateBits9c2370", playerHud9c2370GateBits, 0x3f800000],
  ];
  for (const [key, jsFn, handPin] of pinRows) {
    assert.equal(exp2[key]() >>> 0, jsFn() >>> 0, `v44 pin wasm==js ${key}`);
    assert.equal(jsFn() >>> 0, handPin >>> 0, `v44 pin hand ${key}`);
  }
});

test("v44 mutation checks: threshold drift, polarity flip, next-VA drift", () => {
  const raw0 = readFileSync(source, "utf8");
  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const before = sha(raw0.replace(/\r\n/g, "\n"));
  const withMutant = (mutOld, mutNew, check) => {
    const raw = readFileSync(source, "utf8");
    const orig = raw.replace(/\r\n/g, "\n");
    assert.ok(orig.includes(mutOld), `mutant anchor missing: ${mutOld}`);
    writeSourceRetry(orig.replace(mutOld, mutNew));
    try {
      buildWasm();
      const module = new WebAssembly.Module(readFileSync(wasmPath));
      const instance = new WebAssembly.Instance(module, {});
      check(instance.exports);
    } finally {
      writeSourceRetry(raw);
      buildWasm();
    }
  };

  /* M108: threshold drifts 1.0f -> 2.0f (rdata pin violation:
     PE comiss [0xbaa454]=1.0f). */
  withMutant(
    "  return (f >= 1.0f) ? 1u : 0u;",
    "  return (f >= 2.0f) ? 1u : 0u;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c2370_gate
        ?? wasm._isaac_playerhud_9c2370_gate;
      assert.equal(fn(0x40000000) >>> 0, 1,
        "M108 must pass at 2.0f");
      assert.equal(fn(0x3f800000) >>> 0, 0,
        "M108 must diverge: PE passes AT 1.0f");
    },
  );

  /* M109: polarity inverted (setae -> setb semantics). */
  withMutant(
    "  return (f >= 1.0f) ? 1u : 0u;",
    "  return (f < 1.0f) ? 1u : 0u;",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c2370_gate
        ?? wasm._isaac_playerhud_9c2370_gate;
      assert.equal(fn(0x3f7fffff) >>> 0, 1,
        "M109 must fire below threshold");
      assert.notEqual(fn(0x3f800000) >>> 0, 1,
        "M109 must diverge: PE fires AT/above 1.0f");
    },
  );

  /* M110: next-VA drift 0x9c23a0 -> 0x9c239c (PE next body starts
     after the int3 pad 0x9c2391..9f). */
  withMutant(
    "extern \"C\" uint32_t isaac_playerhud_9c2370_next_va(void) {\n  return ISAAC_PLAYERHUD_9C2370_NEXT_VA;\n}",
    "extern \"C\" uint32_t isaac_playerhud_9c2370_next_va(void) {\n  return ISAAC_PLAYERHUD_9C2370_NEXT_VA - 0x4;\n}",
    (wasm) => {
      const fn = wasm.isaac_playerhud_9c2370_next_va
        ?? wasm._isaac_playerhud_9c2370_next_va;
      assert.equal(
        fn() >>> 0,
        PLAYERHUD_9C2370_NEXT_VA - 0x4,
        "M110 must diverge: PE next 0x9c23a0; mutant -> 0x9c239c",
      );
    },
  );

  /* Restore sanity: byte-identical cpp, rebuilt wasm matches JS. */
  const after = sha(readFileSync(source, "utf8").replace(/\r\n/g, "\n"));
  assert.equal(after, before, "mutation restore must be byte-identical");
  const exp = loadExports();
  assert.equal(exp.abi(), 44);
});
