import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EXIT_PURE_ABI_VERSION,
  EXIT_SFX_STOP_COUNT,
  EXIT_VECTOR_25EBC_STRIDE,
  EXIT_POSTLOG_F32_1BA90_BITS,
  EXIT_POSTLOG_F32_1BA94_BITS,
  EXIT_6F4520_EFFECT_SLOT_COUNT,
  EXIT_RESIDUAL_BASE_OFF,
  EXIT_RESIDUAL_OUTER_COUNT,
  EXIT_RESIDUAL_OUTER_STRIDE,
  EXIT_RESIDUAL_MID_COUNT,
  EXIT_RESIDUAL_MID_STRIDE,
  EXIT_RESIDUAL_ENTITY_STRIDE,
  EXIT_RESIDUAL_ENTITY_SRC_OFF,
  EXIT_RESIDUAL_ENTITY_DST_OFF,
  EXIT_MANAGER_2A338_BITS,
  EXIT_9B5CB0_FIELD_8_VALUE,
  EXIT_9B5CB0_THIS_OFF,
  EXIT_8D3250_THIS_FROM_9B5CB0,
  EXIT_8D3250_THIS_FROM_GAME,
  EXIT_8D3250_FIELD_178_VALUE,
  EXIT_8D3250_CURSOR_VA,
  EXIT_8D3250_LAYER_CLEAR_OFF,
  EXIT_8D3250_LIST_ARG1_OFF,
  EXIT_9B9150_THIS_FROM_GAME,
  EXIT_9B9150_ESAU_SLOT_COUNT,
  EXIT_9B9150_TAIL_COUNT,
  EXIT_9B9150_TAIL_VALUE,
  EXIT_9B9150_FIELD_5C_VALUE,
  EXIT_9A27D0_THIS_FROM_GAME,
  EXIT_9A27D0_SLOT_FLAG_COUNT,
  EXIT_9A27D0_SLOT_FLAG_STRIDE,
  EXIT_9A27D0_SLOT_FLAG_BASE_OFF,
  EXIT_9A27D0_FIELD_54CD_OFF,
  EXIT_9A27D0_SLOT_HOST_840F70_OFF,
  EXIT_9A27D0_SLOT_FLAG_FROM_840F70,
  EXIT_9A27D0_SLOT_709150_BASE_OFF,
  EXIT_9A27D0_SLOT_RESET_BASE_OFF,
  EXIT_9A27D0_SLOT_LOOP1_COUNT,
  EXIT_9A27D0_SLOT_LOOP2_COUNT,
  EXIT_9A27D0_SLOT_LOOP1_START_ESI,
  EXIT_9A27D0_SLOT_LOOP2_START_ESI,
  EXIT_9A19A0_THIS_FROM_GAME,
  EXIT_9A19A0_F32_5490_BITS,
  EXIT_9A19A0_I32_M1,
  EXIT_9A19A0_FIELD_54D0_VALUE,
  EXIT_9A19A0_FIELD_54D8_VALUE,
  EXIT_9A19A0_FIELD_54CC_VALUE,
  EXIT_9A19A0_PLAYERHUD_LOOP_COUNT,
  EXIT_9A19A0_PLAYERHUD_STRIDE,
  EXIT_9A19A0_FIELD_54CC_OFF,
  EXIT_9A19A0_SLOT_BACKPTR_OFF,
  EXIT_9A19A0_SLOT_INDEX_OFF,
  EXIT_40E910_NODE_SIZE,
  EXIT_40E910_NODE_OBJ_OFF,
  EXIT_40E910_COM_FREE_WORD_MAX,
  EXIT_40E910_COM_RELEASE_ARG,
  EXIT_TREE_LEFT_OFF,
  EXIT_TREE_PARENT_OFF,
  EXIT_TREE_RIGHT_OFF,
  EXIT_TREE_ISNIL_OFF,
  EXIT_MAP_1A738_OFF,
  EXIT_MAP_NODE_KEY_OFF,
  EXIT_MAP_NODE_FLAG_OFF,
  EXIT_MAP_NODE_BEGIN_OFF,
  EXIT_MAP_NODE_END_OFF,
  EXIT_MAP_ELEM_STRIDE,
  EXIT_MAP_ELEM_HOST_OFF,
  EXIT_MSVC_STRING_SIZE_OFF,
  EXIT_MSVC_STRING_CAP_OFF,
  EXIT_MSVC_STRING_SSO_CAP,
  EXIT_LOWER_BOUND_TRIPLE_SIZE,
  EXIT_LOWER_BOUND_WALK_OFF,
  EXIT_LOWER_BOUND_BOUND_OFF,
  EXIT_LOWER_BOUND_BEST_OFF,
  EXIT_MAP_ROOT_FROM_SENTINEL_OFF,
  EXIT_40C7F0_ALLOC_SIZE,
  EXIT_40C7F0_VTABLE,
  EXIT_40C7F0_ARG_OFF,
  EXIT_40C7F0_PAIR_VALUE_OFF,
  EXIT_40C7F0_PAIR_OBJ_OFF,
  EXIT_40CC10_VTABLE,
  EXIT_40CC10_FIELD4,
  EXIT_40CC10_SUB_VTABLE,
  EXIT_40CC10_DEFAULT_INIT,
  EXIT_408830_FIELD_4_OFF,
  EXIT_408830_FIELD_8_OFF,
  EXIT_408830_FIELD_C_OFF,
  EXIT_408830_FIELD_10_OFF,
  EXIT_408830_FIELD_14_OFF,
  EXIT_408830_FIELD_18_OFF,
  EXIT_408830_FIELD_1C_OFF,
  EXIT_408830_ARG_COUNT_A_OFF,
  EXIT_408830_ARG_COUNT_B_OFF,
  EXIT_408830_ELEM_SIZE,
  EXIT_408830_F32_10_BITS,
  EXIT_408830_FILL_BYTE,
  EXIT_408970_FIELD_4_OFF,
  EXIT_408970_FIELD_8_OFF,
  EXIT_408970_FIELD_C_OFF,
  EXIT_408970_ARG_COUNT_A_OFF,
  EXIT_408970_ARG_COUNT_B_OFF,
  EXIT_408970_ELEM_SIZE,
  EXIT_408970_FILL_BYTE,
  EXIT_408970_HEAP_STATS_GLOBAL,
  EXIT_408970_HEAP_STATS_DELTA,
  EXIT_408970_HEAP_STATS_FALLBACK,
  EXIT_40DB90_PATH_SIZE_OFF,
  EXIT_40DB90_TIMING_MUL_LO,
  EXIT_40DB90_TIMING_MUL_HI,
  EXIT_40DB90_TIMING_SHIFT,
  EXIT_40DB90_CACHE_MIN_SPACE,
  EXIT_40DB90_CACHE_PTR_STRIDE,
  EXIT_40DB90_NODE_ISNIL_OFF,
  EXIT_40DB90_NODE_KEY_OFF,
  EXIT_40DB90_NODE_FLAG14_OFF,
  EXIT_40DB90_NODE_LAYERS_OFF,
  EXIT_40DB90_NODE_COUNT_OFF,
  EXIT_40DB90_NODE_NAME_OFF,
  EXIT_40DB90_ANM2_NAME_OFF,
  EXIT_40DB90_ANM2_LAYER_BASE_OFF,
  EXIT_40DB90_ANM2_LAYER_COUNT_OFF,
  EXIT_40DB90_ANM2_FIELD74_OFF,
  EXIT_40DB90_ANM2_FIELD78_OFF,
  EXIT_40DB90_ANM2_FIELD84_OFF,
  EXIT_40DB90_ANM2_FIELD88_OFF,
  EXIT_40DB90_ANM2_FIELD8C_OFF,
  EXIT_40DB90_ANM2_FIELD90_OFF,
  EXIT_40DB90_LAYER_STRIDE,
  EXIT_40DB90_SRC_LAYER_STRIDE,
  EXIT_40DB90_LAYER_BACKPTR_OFF,
  EXIT_40DB90_HEADER_SIZE,
  EXIT_40DB90_HEAP_STATS_GLOBAL,
  EXIT_40DB90_HEAP_STATS_DELTA,
  EXIT_40DB90_HEAP_STATS_FALLBACK,
  EXIT_40DB90_CACHE_BEGIN_ADDR,
  EXIT_40DB90_TREE_SENTINEL_ADDR,
  EXIT_9B4810_THIS_FROM_9B5CB0,
  EXIT_9B4810_THIS_FROM_GAME,
  EXIT_9B4810_FIELD_4_OFF,
  EXIT_9B4810_FIELD_8_OFF,
  EXIT_9B4810_FIELD_C_OFF,
  EXIT_9B4810_FIELD_10_OFF,
  EXIT_9B4810_FIELD_14_OFF,
  EXIT_9B4810_FIELD_18_OFF,
  EXIT_9B4810_FIELD_1C_OFF,
  EXIT_9B4810_FIELD_20_OFF,
  EXIT_9B4810_FIELD_24C_OFF,
  EXIT_9B4810_FIELD_250_OFF,
  EXIT_9B4810_FIELD_254_OFF,
  EXIT_9B4810_VEC_BEGIN_OFF,
  EXIT_9B4810_VEC_END_OFF,
  EXIT_9B4810_VEC_CAP_OFF,
  EXIT_9B4810_ELEM_SIZE,
  EXIT_F32_GLOBAL_C7B640_ADDR,
  EXIT_F32_GLOBAL_C7B644_ADDR,
  EXIT_9B4810_PLAY_FLAG_VALUE,
  EXIT_9B4810_BLOCK_A,
  EXIT_9B4810_BLOCK_B,
  EXIT_9B4810_BLOCK_C,
  EXIT_9B4810_BLOCK_D,
  EXIT_9B4810_BLOCK_E,
  EXIT_9B4810_BLOCK_F,
  EXIT_428590_ELEM_SIZE,
  EXIT_428590_MAX_ELEMS,
  EXIT_428590_FREE_HEADER_THRESHOLD,
  EXIT_428590_FREE_HEADER_ADD,
  EXIT_428590_FREE_HEADER_OFFSET_MAX,
  EXIT_ANM2_LAYER_BASE_OFF,
  EXIT_ANM2_LAYER_COUNT_OFF,
  EXIT_ANM2_LAYER_STRIDE,
  EXIT_ANM2_PATH_SIZE_OFF,
  EXIT_ANM2_LOAD_FLAG_109_OFF,
  EXIT_ANM2_LOAD_FLAG_109_VALUE,
  EXIT_ANM2_SHADOW_INDEX_OFF,
  EXIT_ANM2_SHADOW_INDEX_INIT,
  EXIT_ANM2_FLAGS_110_OFF,
  EXIT_ANM2_LAYER_NAME_STR_DELTA,
  EXIT_ANM2_LAYER_STAR_OR,
  EXIT_ANM2_STAR_GLOBAL_OR_400,
  EXIT_ANM2_STAR_GLOBAL_OR_800,
  EXIT_ANM2_SHEET_STRIDE,
  EXIT_ANM2_STAR_BYTE,
  EXIT_40CF00_HEADER_THRESHOLD,
  EXIT_40CF00_HEADER_ADD,
  EXIT_40CF00_ALIGN_MASK,
  EXIT_ANM2_LAYER_PNG_STR_OFF,
  EXIT_ANM2_LAYER_FLAG30_OFF,
  EXIT_ANM2_ANIM_BASE_OFF,
  EXIT_ANM2_ANIM_COUNT_OFF,
  EXIT_ANM2_ANIM_STRIDE,
  EXIT_ANM2_PLAY_STATE_OFF,
  EXIT_ANIMSTATE_ANIM_OFF,
  EXIT_ANIMSTATE_LAYER_ARR_OFF,
  EXIT_ANIMSTATE_NULL_ARR_OFF,
  EXIT_ANIMSTATE_FRAME_OFF,
  EXIT_ANIMSTATE_MASK18_OFF,
  EXIT_ANIMSTATE_MASK1C_OFF,
  EXIT_ANIMDATA_LAYER_COUNT_OFF,
  EXIT_ANIMDATA_NULL_COUNT_OFF,
  EXIT_ANIMDATA_EVENT_BASE_OFF,
  EXIT_ANIMDATA_EVENT_COUNT_OFF,
  EXIT_ANIM_EVENT_STRIDE,
  EXIT_ANIM_EVENT_BIT_OFF,
  EXIT_ANIM_EVENT_FRAME_OFF,
  EXIT_9B4810_VALUE_1C,
  EXIT_9B4810_ANM2_138_OFF,
  EXIT_9B4810_PLAY_FLAG_OFF,
  exitGamestateIoNeeded,
  exitGamestateShouldWrite,
  exitItemOverlayForceNeeded,
  exitManagerFloatsReset,
  exitPgdFlushPrepare,
  exitPgdFlushNeeded,
  exitPgdSaveUsesCloud,
  exitPureFieldTeardown,
  exitSessionActive,
  exitVector25ebcClearEnd,
  exitVector25ebcDtorNeeded,
  exitVector25ebcElementCount,
  exitSfxStopIdAt,
  exitTeardownT0,
  exitTeardownT1,
  exitTeardownT2,
  exitTeardownT4,
  exitPgdReadonlyClear,
  exitPostlogPureFields,
  exitItemOverlayStateClear,
  exitCounter265c0Clear,
  exitSessionPairClear,
  exit6f43b0Prefix,
  exit6f4520Apply,
  exit6f43b0Mid,
  exit6f43b0Tail,
  exitFrameModePairClear,
  exitVolumeModifierClearNeeded,
  exitManager2a334SetOne,
  exitManager2a338Set,
  exitResidualSlotCopyNeeded,
  exitResidualEntityCopy30To34,
  exitResidualEntityBatchCopy30To34,
  exitResidual18990Apply,
  exitMapValueFlag28Clear,
  exit9b5cb0Prefix,
  exit9b5cb0PrefixPtrs,
  exit8d3250P0,
  exit8d3250P1,
  exit8d3250P2,
  exit8d3250P3,
  exit8d3250CursorLayerHostNeeded,
  exit8d3250P4,
  exit8d3250ListHostNeeded,
  exit8d3250ListEmpty,
  exit8d3250CursorVa,
  exit8d3250GetLayerReceiverOff,
  exit8d3250LayerClearOff,
  exit8d3250ResetReceiverOff,
  exit8d3250ListSentinelOff,
  exit8d3250ListHeaderOff,
  exit8d3250ListDestroyArg1Ptr,
  exit8d3250ListDestroyArg2,
  exit8d3250HostPlan,
  exit9b9150P0,
  exit9b9150PlayerListHostNeeded,
  exit9b9150PlayerListClearEnd,
  exit9b9150ExtraListCount,
  exit9b9150ExtraListHostNeeded,
  exit9b9150ExtraListClearEnd,
  exit9b9150PtrHostNeeded,
  exit9b9150SlotClear,
  exit9b9150EsauSlotsClear,
  exit9b9150Mid,
  exit9b9150Tail,
  exit9a27d0SlotFlagClear,
  exit9a27d0SlotFlagsClearPacked,
  exit9a27d0SlotFlagsApply,
  exit9a27d0SlotFlagOff,
  exit9a27d0Field54cdClear,
  exit9a27d0SlotTripleBaseOff,
  exit9a27d0SlotResetOff,
  exit9a27d0Slot709150Off,
  exit9a27d0Slot709150Arg,
  exit9a27d0SlotLoopSegment,
  exit9a27d0SlotLoop1Count,
  exit9a27d0SlotLoop2Count,
  exit9a27d0SlotLoop1StartOff,
  exit9a27d0SlotLoop2StartOff,
  exit9a27d0SlotPlan,
  exit9a19a0Prefix,
  exit9a19a0SlotSetup,
  exit9a19a0SlotsApply,
  exit9a19a0SlotBaseOff,
  exit9a19a0Field54ccSet,
  exit40e910ListHostNeeded,
  exit40e910NodeObjectPresent,
  exit40e910FreeAfterComNeeded,
  exit40e910PostEraseDtorNeeded,
  exit40e910PostEraseCallbackNeeded,
  exit40e910FreeSize,
  exit40e910WalkContinue,
  exit40e910ComIfaceAddr,
  exit40e910ComReleaseArg,
  exit40e910ComStateWord,
  exitTreeIteratorNext,
  exitMap1a738WalkNeeded,
  exitMap1a738LookupHit,
  exitMap1a738FlagActive,
  exitMap1a738ElemRangeNonempty,
  exitMap1a738ElemWalkNeeded,
  exitMap1a738ElemStride,
  exitMap1a738ElemHostOff,
  exitMsvcStringSsoInline,
  exitMsvcStringDataAddr,
  exitStringCompare,
  exit69d690CandidateIsnil,
  exit69d690CmpIsHit,
  exit69d690SelectResult,
  exit685bc0InitTriple,
  exit685bc0RootIsEmpty,
  exit685bc0CmpGoRight,
  exit685bc0Step,
  exit685bc0LoopContinue,
  exitMapLowerBound,
  exitMapFind69d690,
  exit40c7f0AllocSize,
  exit40c7f0AllocOk,
  exit40c7f0OldObjectPresent,
  exit40c7f0CallbackNeeded,
  exit40c7f0ObjectFinish,
  exit40c7f0ObjectFinishApply,
  exit40c7f0PairApply,
  exit40c7f0PairApplyBase,
  exit40cc10PureFields,
  exit40cc10Apply,
  exit40cc10DefaultInitIsDirect,
  exit40cc10DefaultInitVa,
  exit40c7f0Vtable,
  exit408830StoreArg,
  exit408830StoreArgApply,
  exit408830PtrFreeNeeded,
  exit408830PtrClear,
  exit408830ArgPresent,
  exit408830CountNonzero,
  exit408830AllocSize,
  exit408830FillSize,
  exit408830FillByte,
  exit408830Field10Bits,
  exit408830Tail,
  exit408830TailApply,
  exit9b4810VecResetEnd,
  exit9b4810VecResetEndApply,
  exit9b4810FirstPushValue,
  exit9b4810ModeIs3,
  exit9b4810ModeIs1,
  exit9b4810ModeLayerPath,
  exit9b4810ModeBlockANeeded,
  exit9b4810ModeBlockCNeeded,
  exit9b4810ModeBlockENeeded,
  exit9b4810ModeBlockFNeeded,
  exit9b4810VecSpace,
  exit9b4810VecEndAfterPush,
  exit9b4810VecStore,
  exit9b4810VecPushPure,
  exit9b4810VecPushApply,
  exit9b4810BlockACount,
  exit9b4810BlockAAt,
  exit9b4810BlockBCount,
  exit9b4810BlockBAt,
  exit9b4810BlockCCount,
  exit9b4810BlockCAt,
  exit9b4810BlockDCount,
  exit9b4810BlockDAt,
  exit9b4810BlockECount,
  exit9b4810BlockEAt,
  exit9b4810BlockFCount,
  exit9b4810BlockFAt,
  exit9b4810Value1c,
  exit9b4810Push1cNeeded,
  exit9b4810LayerLoopNeeded,
  exit9b4810CounterPlayNeeded,
  exit9b4810PlayFlagSet,
  exit9b4810PlayFlagApply,
  exit9b4810Tail,
  exit9b4810TailApply,
  exitF32GlobalC7b640Addr,
  exitF32GlobalC7b644Addr,
  exit428590ElemCount,
  exit428590CapacityElems,
  exit428590InsertIndex,
  exit428590MaxElems,
  exit428590LengthErrorNeeded,
  exit428590NeededSize,
  exit428590GeoWouldOverflow,
  exit428590GeometricCapacity,
  exit428590NewCapacity,
  exit428590CapacityErrorNeeded,
  exit428590AllocBytes,
  exit428590InsertSlot,
  exit428590NewEnd,
  exit428590NewCapPtr,
  exit428590InsertAtEnd,
  exit428590CopyPrefixBytes,
  exit428590CopySuffixBytes,
  exit428590CopyAllBytes,
  exit428590OldFreeNeeded,
  exit428590OldCapacityBytes,
  exit428590FreeUsesHeapHeader,
  exit428590FreeHeaderSize,
  exit428590FreeHeaderOffsetOk,
  exit428590Plan,
  exit428590PostAllocPtrs,
  exitAnm2LayerStride,
  exitAnm2GetlayerInRange,
  exitAnm2LayerPtr,
  exitAnm2GetlayerTry,
  exitAnm2GetlayerApply,
  exitAnm2LoadPathPresent,
  exitAnm2LoadPathIsSelf,
  exitAnm2LoadGraphicsNeeded,
  exitAnm2LoadPrefix,
  exitAnm2LoadPrefixApply,
  exitAnm2LayerLoopNeeded,
  exitAnm2LayerByteOff,
  exitAnm2LayerNameHolderNull,
  exitAnm2LayerNameStrAddr,
  exitAnm2CstrEqual,
  exitAnm2NameIsShadow,
  exitAnm2NameIsStar,
  exitAnm2LayerStarFlagsValue,
  exitAnm2Flags110Or400Value,
  exitAnm2Flags110Or800Value,
  exitAnm2LoadLayerStep,
  exitAnm2SheetLoopNeeded,
  exitAnm2SheetStride,
  exitAnm2SheetPtr,
  exitAnm2LoadSheetStep,
  exit40cf00UsesHeapHeader,
  exit40cf00SizeIsZero,
  exit40cf00HeaderRequestSize,
  exit40cf00HeaderOverflow,
  exit40cf00AllocRequestSize,
  exit40cf00AlignUserPtr,
  exit40cf00HeaderSlot,
  exit40cf00Plan,
  exit40cf00FinishHeader,
  exitAnm2LayerPngStrOff,
  exitAnm2LayerFlag30Off,
  exitAnm2LayerPngStrPtr,
  exitAnm2SizedEqual,
  exitAnm2ReplaceAssignNeeded,
  exitAnm2ReplacePlan,
  exitAnm2ReplaceFinish,
  exitAnm2AnimStride,
  exitAnm2AnimBaseOff,
  exitAnm2AnimCountOff,
  exitAnm2PlayStateOff,
  exitAnm2AnimLoopNeeded,
  exitAnm2AnimEntryPtr,
  exitAnm2PlayStatePtr,
  exitAnm2PlayResetNeeded,
  exitAnm2PlayNameMatch,
  exitAnm2PlayPlan,
  exitAnm2PlayFind,
  exitAnimstateAnimOff,
  exitAnimstateLayerArrOff,
  exitAnimstateNullArrOff,
  exitAnimstateFrameOff,
  exitAnimstateMask18Off,
  exitAnimstateMask1cOff,
  exitAnimdataLayerCountOff,
  exitAnimdataNullCountOff,
  exitAnimdataEventBaseOff,
  exitAnimdataEventCountOff,
  exitAnimEventStride,
  exitAnimstateRewindPrefix,
  exitAnimstateRewindPrefixApply,
  exitAnimstate408c90AnimPresent,
  exitAnimstate408c90LogNeeded,
  exitAnimstate408c90EventLoopNeeded,
  exitAnimstate408c90EventFrameEq,
  exitAnimstate408c90MaskBts,
  exitAnimstate408c90EventStep,
  exitAnimstate408c90Apply,
  exitAnimstateRewindLayerLoopNeeded,
  exitAnimstateRewindNullLoopNeeded,
  exitAnimstateRewindZeroArrays,
  exitAnimstateRewindPlan,
  exitAnimstateRewindApply,
  exitAnimstateRewindApplyAddr,
  EXIT_40CCD0_MAX_SIZE,
  EXIT_40CCD0_ALIGN_OR,
  EXIT_40CCD0_FREE_HEADER_THRESHOLD,
  EXIT_40CCD0_FREE_HEADER_ADD,
  EXIT_40CCD0_FREE_HEADER_OFFSET_MAX,
  exit40ccd0MaxSize,
  exit40ccd0FitsCapacity,
  exit40ccd0LengthErrorNeeded,
  exit40ccd0DestDataAddr,
  exit40ccd0RoundedCapacity,
  exit40ccd0RoundedOverflow,
  exit40ccd0GeoWouldOverflow,
  exit40ccd0GeometricCapacity,
  exit40ccd0NewCapacity,
  exit40ccd0AllocSize,
  exit40ccd0OldFreeNeeded,
  exit40ccd0FreeSize,
  exit40ccd0FreeUsesHeapHeader,
  exit40ccd0FreeHeaderSize,
  exit40ccd0FreeHeaderOffsetOk,
  exit40ccd0StoreSize,
  exit40ccd0StoreCapacity,
  exit40ccd0StorePtr,
  exit40ccd0NullTerm,
  exit40ccd0CopyAndTerm,
  exit40ccd0NongrowFinish,
  exit40ccd0GrowPreCopy,
  exit40ccd0GrowPostFree,
  exit40ccd0Plan,
  exit408970CountSelect,
  exit408970CountsEqual,
  exit408970CountsDiffer,
  exit408970NewCountPositive,
  exit408970CopyNeeded,
  exit408970PtrNonzero,
  exit408970AllocSize,
  exit408970FillSize,
  exit408970CopySize,
  exit408970FillByte,
  exit408970HeapStatsBase,
  exit408970FreeBlockPtr,
  exit408970StoreArg,
  exit408970StoreArgApply,
  exit408970StoreBufAApply,
  exit408970StoreBufBApply,
  exit408970ClearBufAApply,
  exit408970ClearBufBApply,
  exit408970PtrClear,
  exit408970BufferPlan,
  exit408970Plan,
  exit40db90PathSizePresent,
  exit40db90EarlyReturn,
  exit40db90TimingScale,
  exit40db90TimingDelta,
  exit40db90CacheSpaceOk,
  exit40db90CacheWalkDone,
  exit40db90CacheWalkNext,
  exit40db90TreeHitSelect,
  exit40db90NodeIsSentinel,
  exit40db90CacheMiss,
  exit40db90InsertNeeded,
  exit40db90HeapStatsBase,
  exit40db90TempFreeNeeded,
  exit40db90FreeBlockPtr,
  exit40db90LayerArrayPresent,
  exit40db90OldLayerFreeSize,
  exit40db90LayerCountNonzero,
  exit40db90LayerAllocSize,
  exit40db90AllocOk,
  exit40db90UserPtrAfterHeader,
  exit40db90LayerLoopNeeded,
  exit40db90SrcLayerStride,
  exit40db90DstLayerStride,
  exit40db90SrcLayerPtr,
  exit40db90DstLayerPtr,
  exit40db90StoreLayerBackptrAt,
  exit40db90NameAssignNeeded,
  exit40db90FieldPack,
  exit40db90FieldPackApply,
  exit40db90Plan,
  exit40e110CacheSpaceOk,
  exit40e110CacheWalkDone,
  exit40e110CacheWalkNext,
  exit40e110PathDataAddr,
  exit40e110PathBufSize,
  exit40e110TreeHitSelect,
  exit40e110NodeIsSentinel,
  exit40e110CacheHit,
  exit40e110CacheMiss,
  exit40e110LogNeeded,
  exit40e110RefcountInc,
  exit40e110RefcountIncApply,
  exit40e110GrowInstallNeeded,
  exit40e110GrowResultClearAt,
  exit40e110Plan,
  exit40c000LayerCountNonzero,
  exit40c000LoopNeeded,
  exit40c000LayerStride,
  exit40c000LayerByteOff,
  exit40c000LayerPtr,
  exit40c000LayerSkip,
  exit40c000LayerBodyNeeded,
  exit40c000PngStrPtr,
  exit40c000PathDataAddr,
  exit40c000SharedPresent,
  exit40c000VirtualOk,
  exit40c000GraphicsFlag,
  exit40c000SpritePresent,
  exit40c000ObjectPresent,
  exit40c000CallbackNeeded,
  exit40c000PairZeroAt,
  exit40c000PairAssignAt,
  exit40c000StoreLayerFlagsAt,
  exit40c000LoopNextIndex,
  exit40c000LoopNextOff,
  exit40c1e0Init,
  exit40c1e0Apply,
  exit40c000Plan,
  exit408640SourcePresent,
  exit408640CtrlPresent,
  exit408640VirtualOk,
  exit408640CallbackNeeded,
  exit408640DstFieldPtr,
  exit408640SrcFieldPtr,
  exit408640PairSlotPtr,
  exit408640DstFieldOff,
  exit408640SrcFieldOff,
  exit408640PairSlotOff,
  exit408640FieldDwords,
  exit408640FieldCopyAt,
  exit408640FieldCopyIfPresentAt,
  exit408640Plan,
  EXIT_40E110_CACHE_BEGIN_ADDR,
  EXIT_40E110_CACHE_END_ADDR,
  EXIT_40E110_CACHE_CAP_ADDR,
  EXIT_40E110_TREE_SENTINEL_ADDR,
  EXIT_40E110_CACHE_SPACE_MASK,
  EXIT_40E110_CACHE_PTR_STRIDE,
  EXIT_40E110_PATH_BUF_SIZE,
  EXIT_40E110_PATH_CAP_OFF,
  EXIT_40E110_PATH_SSO_CAP,
  EXIT_40E110_NODE_ISNIL_OFF,
  EXIT_40E110_NODE_KEY_OFF,
  EXIT_40E110_NODE_REFCOUNT_OFF,
  EXIT_40E110_GROW_TRIPLE_DWORDS,
  EXIT_40C000_ANM2_LAYER_BASE_OFF,
  EXIT_40C000_ANM2_LAYER_COUNT_OFF,
  EXIT_40C000_LAYER_STRIDE,
  EXIT_40C000_LAYER_PNG_STR_OFF,
  EXIT_40C000_LAYER_FLAG30_OFF,
  EXIT_40C000_LAYER_FLAG31_OFF,
  EXIT_40C000_PATH_CAP_OFF,
  EXIT_40C000_PATH_SSO_CAP,
  EXIT_40C000_CALLBACK_GLOBAL,
  EXIT_40C000_SPRITE_FIELD_44_OFF,
  EXIT_40C1E0_FIELD0_VALUE,
  EXIT_40C1E0_FIELD_C_VALUE,
  EXIT_408640_DST_FIELD_OFF,
  EXIT_408640_SRC_FIELD_OFF,
  EXIT_408640_FIELD_DWORDS,
  EXIT_408640_PAIR_SLOT_OFF,
  EXIT_408640_CALLBACK_GLOBAL,
  EXIT_408640_VTBL_RELEASE_OFF,
  EXIT_841CF0_HEAD_DWORD_OFF,
  EXIT_841CF0_HEAD_BYTE_OFF,
  EXIT_841CF0_HEAD_ZERO_BYTES,
  EXIT_841CF0_P0_BASE_OFF,
  EXIT_841CF0_P0_COUNT,
  EXIT_841CF0_P0_STRIDE,
  EXIT_841CF0_P0_VALUE_OFF,
  EXIT_841CF0_P0_FLAG_OFF,
  EXIT_841CF0_P0_PTR_A_OFF,
  EXIT_841CF0_P0_PTR_B_OFF,
  EXIT_841CF0_P0_PTR_VALUE,
  EXIT_841CF0_P1_BASE_OFF,
  EXIT_841CF0_P1_COUNT,
  EXIT_841CF0_P1_STRIDE,
  EXIT_841CF0_P1_HOST_OFF,
  EXIT_841CF0_P2_BASE_OFF,
  EXIT_841CF0_P2_COUNT,
  EXIT_841CF0_P2_STRIDE,
  EXIT_841CF0_P2_HOST_A_OFF,
  EXIT_841CF0_P2_HOST_B_OFF,
  EXIT_841CF0_P2_TAIL_OFF,
  EXIT_841CF0_VEC_BEGIN_OFF,
  EXIT_841CF0_VEC_END_OFF,
  EXIT_841CF0_VEC_ELEM_STRIDE,
  EXIT_841CF0_VEC_ELEM_HOST_OFF,
  EXIT_841CF0_WORD_6AC_OFF,
  EXIT_841CF0_HOST_6B0_OFF,
  EXIT_841CF0_HOST_6CC_OFF,
  EXIT_841CF0_TERMINAL_OFF,
  EXIT_83ABB0_BLOCK_COUNT,
  EXIT_83ABB0_BLOCK_STRIDE,
  EXIT_83ABB0_FIELD0_OFF,
  EXIT_83ABB0_FLAG4_OFF,
  EXIT_83ABB0_VEC_BEGIN_OFF,
  EXIT_83ABB0_VEC_END_OFF,
  EXIT_83ABB0_ELEM_STRIDE,
  EXIT_83ABB0_ELEM_HOST_OFF,
  EXIT_83ABB0_TERMINAL_OFF,
  EXIT_RANGE_DESTROY_CTRL_OFF,
  EXIT_RANGE_DESTROY_CB_ARG_OFF,
  EXIT_RANGE_DESTROY_VTBL_RELEASE_OFF,
  EXIT_RANGE_DESTROY_CALLBACK_GLOBAL,
  EXIT_709380_ELEM_STRIDE,
  EXIT_709300_ELEM_STRIDE,
  EXIT_84BFD0_THIS_FROM_9A19A0,
  EXIT_84BFD0_THIS_FROM_GAME,
  EXIT_84BFD0_BLOCK_COUNT,
  EXIT_84BFD0_BLOCK_STRIDE,
  EXIT_84BFD0_BASE_OFF,
  EXIT_84BFD0_BLOCK_DWORDS,
  EXIT_84BFD0_ELEM_DWORDS,
  EXIT_84BFD0_ELEM_COUNT,
  EXIT_84BFD0_FLOAT_ELEM_FIRST,
  EXIT_84BFD0_F32_BITS,
  EXIT_84BFD0_TERMINAL_OFF,
  EXIT_84BFD0_SLOT_ZERO,
  EXIT_84BFD0_SLOT_SKIP,
  EXIT_84BFD0_SLOT_FLOAT,
  exit841cf0P0ElemOff,
  exit841cf0P0Elem,
  exit841cf0P0Apply,
  exit841cf0HeadClear,
  exit841cf0P1ElemOff,
  exit841cf0P1HostPtr,
  exit841cf0P1Pre,
  exit841cf0P1Apply,
  exit841cf0P2ElemOff,
  exit841cf0P2HostAPtr,
  exit841cf0P2HostBPtr,
  exit841cf0P2Pre,
  exit841cf0P2Apply,
  exit841cf0P2HostNeeded,
  exit841cf0VecElemHostPtr,
  exit841cf0VecNext,
  exit841cf0VecWalkNeeded,
  exit841cf0VecWalkContinue,
  exit841cf0VecElemCount,
  exit841cf0VecClearEnd,
  exit841cf0Word6acClear,
  exit841cf0TerminalClear,
  exit841cf0PureApply,
  exit83abb0BlockBaseOff,
  exit83abb0WalkNeeded,
  exit83abb0WalkContinue,
  exit83abb0ElemHostPtr,
  exit83abb0ElemNext,
  exit83abb0ElemCount,
  exit83abb0BlockPost,
  exit83abb0TerminalClear,
  exit83abb0Apply,
  exitRangeDestroyStride709380,
  exitRangeDestroyStride709300,
  exitRangeDestroyLoopNeeded,
  exitRangeDestroyContinue,
  exitRangeDestroyCtrlPtr,
  exitRangeDestroyCbArgPtr,
  exitRangeDestroyNext,
  exitRangeDestroyCtrlPresent,
  exitRangeDestroyVirtualOk,
  exitRangeDestroyCallbackNeeded,
  exit84bfd0SlotKind,
  exit84bfd0BlockBaseOff,
  exit84bfd0SlotOff,
  exit84bfd0F32Bits,
  exit84bfd0ApplyBlock,
  exit84bfd0Apply,
  EXIT_9A27D0_SLOT_TRIPLE_STRIDE,
  EXIT_840F70_SLOT_COUNT,
  EXIT_840F70_SLOT_STRIDE,
  EXIT_840F70_HEADER_DELTA,
  EXIT_840F70_HEAP_STATS_GLOBAL,
  EXIT_840F70_HEAP_STATS_DELTA,
  EXIT_840F70_HEAP_STATS_FALLBACK,
  EXIT_840F70_STATS_LO_OFF,
  EXIT_840F70_STATS_HI_OFF,
  EXIT_840F70_FREE_IAT_SLOT,
  EXIT_709150_ALLOC_SIZE,
  EXIT_709150_VTABLE,
  EXIT_709150_FIELD_14_OFF,
  EXIT_709150_PAIR_VALUE_OFF,
  EXIT_709150_PAIR_OBJ_OFF,
  EXIT_709150_CALLBACK_GLOBAL,
  EXIT_709150_VTBL_RELEASE_OFF,
  EXIT_709150_STACK_ARG_BYTES,
  exit840f70SlotOff,
  exit840f70SlotPtr,
  exit840f70FreeNeeded,
  exit840f70HeapStatsBase,
  exit840f70FreeBasePtr,
  exit840f70HeaderSizePtr,
  exit840f70StatsSubLo,
  exit840f70StatsSubBorrow,
  exit840f70StatsSubHi,
  exit840f70StatsSubAt,
  exit840f70SlotClear,
  exit840f70Apply,
  exit840f70SlotPlan,
  exit709150AllocSize,
  exit709150AllocOk,
  exit709150NewObjectValue,
  exit709150ObjectFinishApply,
  exit709150OldObjectPresent,
  exit709150VirtualOk,
  exit709150CallbackNeeded,
  exit709150PairApplyBase,
  exit709150Plan,
  EXIT_A1AD90_BLOCK_A_OFF,
  EXIT_A1AD90_BLOCK_B_OFF,
  EXIT_A1AD90_HEADER_DELTA,
  EXIT_A1AD90_ELEM_SIZE,
  EXIT_A1AD90_ELEM_DTOR,
  EXIT_A1AD90_FREE_SIZE_ADD,
  EXIT_A1AD90_TREE_OFF,
  EXIT_A1AD90_TREE_SIZE_OFF,
  EXIT_A1AD90_TERMINAL_BYTE_OFF,
  EXIT_A1AD90_TERMINAL_24_OFF,
  EXIT_A1AD90_TERMINAL_38_OFF,
  EXIT_A1AD90_HOST_A_NEEDED_BIT,
  EXIT_A1AD90_HOST_B_NEEDED_BIT,
  EXIT_A648B0_MODE_MASK,
  EXIT_A648B0_MODE_FREE,
  EXIT_A648B0_HEADER_DELTA,
  EXIT_A648B0_HEAP_STATS_GLOBAL,
  EXIT_A648B0_HEAP_STATS_DELTA,
  EXIT_A648B0_HEAP_STATS_FALLBACK,
  EXIT_A648B0_FREE_IAT_SLOT,
  exitA1ad90BlockANeeded,
  exitA1ad90BlockBNeeded,
  exitA1ad90HeaderPtr,
  exitA1ad90ElemSize,
  exitA1ad90ElemDtor,
  exitA1ad90DtorCountArg,
  exitA1ad90FreeSize,
  exitA1ad90TreeObjPtr,
  exitA1ad90TreeHeadPtr,
  exitA1ad90TreeSizePtr,
  exitA1ad90TreeRootPtr,
  exitA1ad90TreeResetAt,
  exitA1ad90Terminal,
  exitA1ad90ApplyThis,
  exitA1ad90Plan,
  exitA648b0ModeFromCl,
  exitA648b0ModeFree,
  exitA648b0Mode1FreeNeeded,
  exitA648b0Mode1HeaderSizePtr,
  exitA648b0Mode1FreeBasePtr,
  exitA648b0HeapStatsBase,
  exitA648b0ModePath,
  exitA648b0ModeStats,
  exitA648b0Mode2StatsBasePtr,
  exitA648b0Mode2AddendLoVa,
  exitA648b0Mode2AddendHiVa,
  exitA648b0StatsAddLo,
  exitA648b0StatsAddCarry,
  exitA648b0StatsAddHi,
  exitA648b0StatsAddPair,
  exitA648b0ModePlan,
  exit6f0040Va,
  exit6f0040BodyBytes,
  exit6f0040PtrOff,
  exit6f0040CountOff,
  exit6f0040Predicate,
  exit71df80Va,
  exit71df80BodyBytes,
  exit71df80GameDat,
  exit71df80RoomOff,
  exit71df80StateOff,
  exit71df80StateOpen,
  EXIT_A648B0_MODE_STATS,
  EXIT_A648B0_MODE2_BASE_OFF,
  EXIT_A648B0_MODE2_ADDEND_LO_VA,
  EXIT_A648B0_MODE2_ADDEND_HI_VA,
  EXIT_6F0040_VA,
  EXIT_6F0040_BODY_BYTES,
  EXIT_6F0040_PTR_OFF,
  EXIT_6F0040_COUNT_OFF,
  EXIT_6F0040_INVALID_COUNT,
  EXIT_6F0040_CALLERS,
  EXIT_71DF80_VA,
  EXIT_71DF80_BODY_BYTES,
  EXIT_71DF80_GAME_DAT,
  EXIT_71DF80_ROOM_OFF,
  EXIT_71DF80_STATE_OFF,
  EXIT_71DF80_STATE_0A,
  EXIT_71DF80_STATE_0B,
  EXIT_71DF80_STATE_0C,
  EXIT_71DF80_STATE_0D,
  EXIT_71DF80_STATE_22,
  EXIT_71DF80_STATE_2B,
  EXIT_71DF80_STATE_2C,
  EXIT_71DF80_STATE_30,
  EXIT_71DF80_CALLERS,
  EXIT_40C4A0_ALLOC_SIZE,
  EXIT_40C4A0_VTABLE,
  EXIT_40C4A0_ARG_OFF,
  EXIT_40C4A0_PAIR_VALUE_OFF,
  EXIT_40C4A0_PAIR_OBJ_OFF,
  EXIT_40C4A0_CALLBACK_GLOBAL,
  EXIT_40C4A0_VTBL_RELEASE_OFF,
  EXIT_40C4A0_STACK_ARG_BYTES,
  EXIT_415800_NODE_SIZE,
  EXIT_415800_COM_SLOT_OFF,
  EXIT_415800_CTRL_OFF,
  EXIT_415800_CALLBACK_GLOBAL,
  EXIT_415800_VTBL_RELEASE_OFF,
  EXIT_415800_STACK_ARG_BYTES,
  EXIT_415800_MAX_DEPTH,
  EXIT_415800_ORDER_OVERFLOW,
  exit40c4a0EntryZeroAt,
  exit40c4a0AllocSize,
  exit40c4a0AllocOk,
  exit40c4a0NewObjectValue,
  exit40c4a0ObjectFinishApply,
  exit40c4a0OldObjectPresent,
  exit40c4a0VirtualOk,
  exit40c4a0CallbackNeeded,
  exit40c4a0PairApplyBase,
  exit40c4a0ReturnValue,
  exit40c4a0Plan,
  exit415800WalkContinue,
  exit415800RecurseNodePtr,
  exit415800NextNodePtr,
  exit415800ComSlotPtr,
  exit415800CtrlPtr,
  exit415800CtrlPresent,
  exit415800VirtualOk,
  exit415800CallbackNeeded,
  exit415800FreeSize,
  exit415800FreeOrder,
  EXIT_A159D0_HOST_VA,
  EXIT_A159D0_HASH_INIT,
  EXIT_A159D0_NULL_HASH,
  EXIT_40E520_PAIR_VALUE_OFF,
  EXIT_40E520_PAIR_CTRL_OFF,
  EXIT_40E520_NAME_PRIMARY_OFF,
  EXIT_40E520_NAME_FALLBACK_OFF,
  EXIT_40E520_RELEASE_VTABLE_OFF,
  EXIT_40E520_DEFAULT_NAME_ADDR,
  EXIT_40E520_MAP_GLOBAL,
  EXIT_40E520_CALLBACK_GLOBAL,
  exit40e520MapStoreNeeded,
  exit40e520NamePtr,
  exit40e520PairValuePtr,
  exit40e520PairCtrlPtr,
  exit40e520ReleaseCtrlPresent,
  exit40e520VirtualOk,
  exit40e520CallbackNeeded,
  exit40e520CallbackArgPtr,
  exit40e520Plan,
  EXIT_7384D0_OBJ_OFF,
  EXIT_7384D0_ALLOC_SIZE,
  EXIT_7384D0_182D0_OFF,
  EXIT_7384D0_182CC_OFF,
  EXIT_7384D0_18334_OFF,
  EXIT_7384D0_MEMSET_BASE_OFF,
  EXIT_7384D0_MEMSET_SIZE,
  EXIT_7384D0_18368_OFF,
  EXIT_7384D0_1836C_OFF,
  EXIT_7384D0_188F8_OFF,
  EXIT_7384D0_182D0_VALUE,
  exit7384d0OldObjectPresent,
  exit7384d0AllocSize,
  exit7384d0AllocOk,
  exit7384d0NewObjectValue,
  exit7384d0Apply,
  EXIT_408310_ARG0_OFF,
  EXIT_408310_STR_OFF,
  EXIT_408310_STR_SIZE_OFF,
  EXIT_408310_STR_CAP_OFF,
  EXIT_408310_EMPTY_CAP,
  EXIT_408310_TEMP_CTOR_FLAG,
  EXIT_408310_TEMP_EMPTY_FLAG,
  EXIT_408310_HOST_98_OFF,
  EXIT_408310_INVALID_PARAM_IAT,
  EXIT_408310_GATE_C798E4_ADDR,
  EXIT_408310_FIELD_7C_CLEAR_VALUE,
  EXIT_408310_FIELD_7C_BITSET_VALUE,
  EXIT_408310_F32_ONE_BITS,
  EXIT_408310_F30_OFF,
  EXIT_408310_F34_OFF,
  EXIT_408310_F38_OFF,
  EXIT_408310_F3C_OFF,
  EXIT_408310_F40_OFF,
  EXIT_408310_F44_OFF,
  EXIT_408310_F48_OFF,
  EXIT_408310_F4C_OFF,
  EXIT_408310_F50_OFF,
  EXIT_408310_F54_OFF,
  EXIT_408310_F58_OFF,
  EXIT_408310_F5C_OFF,
  EXIT_408310_F60_OFF,
  EXIT_408310_F64_OFF,
  EXIT_408310_F68_OFF,
  EXIT_408310_F6C_OFF,
  EXIT_408310_F70_OFF,
  EXIT_408310_F74_OFF,
  EXIT_408310_F78_OFF,
  EXIT_408310_F7C_OFF,
  EXIT_408310_F80_OFF,
  EXIT_408310_F84_OFF,
  EXIT_408310_F88_OFF,
  EXIT_408310_F8C_OFF,
  EXIT_408310_F90_OFF,
  EXIT_408310_F94_OFF,
  exit408310Flag,
  exit408310SetArg0,
  exit408310EmptyTemp,
  exit408310TempReset,
  exit408310AssignNeeded,
  exit408310SrcDataAddr,
  exit408310ArmFreeNeeded,
  exit408310FreePtr,
  exit408310FreeCount,
  exit408310AbortNeeded,
  exit408310Field7c,
  exit408310GateC798e4Addr,
  exit408310TailApply,
  exit408310Plan,
  EXIT_ROOT_EVENT_CAP,
  EXIT_ROOT_EVENT_HOST,
  EXIT_ROOT_EVENT_PURE,
  EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP,
  EXIT_ROOT_EVENT_MAP_WALK,
  EXIT_ROOT_SEG_TERMINAL,
  EXIT_ROOT_ANM2_RESET_THIS_OFFS,
  EXIT_ROOT_SFX_RECEIVER_OFF,
  EXIT_ROOT_7DF690_BASE_OFF,
  EXIT_ROOT_7DF690_STRIDE,
  exitRoot7df690Receiver,
  exitRootAnm2ResetCount,
  exitRootAnm2ResetThisOffAt,
  exitRootPlan,
  EXIT_8D26C0_VEC_BEGIN_OFF,
  EXIT_8D26C0_VEC_END_OFF,
  EXIT_8D26C0_SET_INDEX_OFF,
  EXIT_8D26C0_FRAME_OFF,
  EXIT_8D26C0_STEP_OFF,
  EXIT_8D26C0_ELEM_STRIDE,
  EXIT_8D26C0_SUB_SHIFT,
  EXIT_8D26C0_DIV_MAGIC,
  EXIT_8D26C0_F32_360_BITS,
  EXIT_8D26C0_F32_HALF_BITS,
  EXIT_8D26C0_LOG_LEVEL,
  EXIT_8D26C0_LOG_FMT_ADDR,
  EXIT_8D26C0_CVTTSS2SI_INDEFINITE,
  EXIT_8D26C0_ARM_NOOP,
  EXIT_8D26C0_ARM_INVALID,
  EXIT_8D26C0_ARM_APPLY,
  EXIT_8D26C0_APPLY_STORE_COUNT,
  exit8d26c0IsNoop,
  exit8d26c0ElementCount,
  exit8d26c0IndexValid,
  exit8d26c0ElementAddr,
  exit8d26c0SubCount,
  exit8d26c0StepBits,
  exit8d26c0FrameFrom,
  exit8d26c0Plan,
  exit8d26c0Apply,
  exitRoot8d26c0HostNeeded,
  EXIT_ROOT_MAP_WALK_EVENT_CAP,
  EXIT_ROOT_MAP_WALK_NODE_CAP,
  EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
  EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST,
  EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR,
  EXIT_ROOT_MAP_WALK_ELEM_HOST_VA,
  EXIT_ROOT_MAP_WALK_GLOBAL_VA,
  EXIT_ROOT_MAP_WALK_FIND_VA,
  exitRootMapWalkFlagActive,
  exitRootMapWalkElemHostThis,
  exitRootMapWalkFlagAddr,
  exitRootMapWalkNext,
  exitRootMapWalkPlan,
  EXIT_7DF690_SLOT_COUNT,
  EXIT_7DF690_SLOT_STRIDE,
  EXIT_7DF690_FLOAT_OFF,
  EXIT_7DF690_GATE_VTBL_OFF,
  EXIT_7DF690_SET_VTBL_OFF,
  exit7df690SlotCount,
  exit7df690SlotAddr,
  exit7df690FloatOff,
  exit7df690GateVtblOff,
  exit7df690SetVtblOff,
  exit7df690SlotObjPresent,
  exit7df690Apply,
  exit7df690Plan,
  EXIT_8650A0_VA,
  EXIT_8650A0_BODY_BYTES,
  EXIT_8650A0_RET_BYTES,
  EXIT_8650A0_ENGINE_GLOBAL_DAT,
  EXIT_8650A0_HOLDER_OFF,
  EXIT_8650A0_FLAG_MASK,
  EXIT_8650A0_PACK_ARG1,
  EXIT_8650A0_PACK_ARG2,
  EXIT_8650A0_REGISTRY_INDEX,
  EXIT_8650A0_UNREF_IAT,
  EXIT_8650A0_HOST_874A10_VA,
  exit8650a0FlagOpen,
  exit8650a0HostNeeded,
  exit8650a0FlagMask,
  exit8650a0HolderOff,
  exit8650a0HolderAddr,
  exit8650a0PackArg1,
  exit8650a0PackArg2,
  exit8650a0RegistryIndex,
  exit8650a0UnrefIat,
  exit8650a0Host874a10Va,
  exit8650a0PackApply,
  exit8650a0Plan,
  EXIT_686950_VA,
  EXIT_686950_BODY_BYTES,
  EXIT_686950_WINDOW_BYTES,
  EXIT_686950_THIS_FROM_GAME,
  EXIT_686950_STATE_VALUE,
  EXIT_686950_MGR_FLAG_OFF,
  EXIT_686950_SPRINTF_VA,
  EXIT_686950_REMOVE_IAT,
  exit686950EntryOpen,
  exit686950IoOpen,
  exit686950HostNeeded,
  exit686950RemoveNeeded,
  exit686950Va,
  exit686950BodyBytes,
  exit686950ThisFromGame,
  exit686950StateValue,
  exit686950MgrFlagOff,
  exit686950SprintfVa,
  exit686950RemoveIat,
  exit686950MgrFlagAddr,
  exit686950PackApply,
  exit686950Plan,
  EXIT_958ED0_VA,
  EXIT_958ED0_BODY_BYTES,
  EXIT_958ED0_STATE8_VALUE,
  EXIT_958ED0_FILENAME_SIZE_OFF,
  EXIT_958ED0_IO_PTR_OFF,
  EXIT_958ED0_FLAG_20DCC_OFF,
  EXIT_958ED0_STEAM_IAT,
  EXIT_958ED0_FILENO_IAT,
  EXIT_958ED0_COPY_SRC_OFF,
  EXIT_958ED0_COPY_DST_OFF,
  EXIT_958ED0_AL_OFF,
  EXIT_958ED0_POST_SRC_OFF,
  EXIT_958ED0_POST_DST_OFF,
  EXIT_958ED0_CHANGES_OFF,
  exit958ed0EntryOpen,
  exit958ed0CountOk,
  exit958ed0VecEmpty,
  exit958ed0PrefixOpen,
  exit958ed0ChallengeNeeded,
  exit958ed0ChallengeOk,
  exit958ed0HostNeeded,
  exit958ed0PgdNeeded,
  exit958ed0LocalFilenamePresent,
  exit958ed0IoDtorNeeded,
  exit958ed0Va,
  exit958ed0BodyBytes,
  exit958ed0Flag20dccOff,
  exit958ed0SteamIat,
  exit958ed0FilenoIat,
  exit958ed0Flag20dccAddr,
  exit958ed0PgdThisAddr,
  exit958ed0PrefixApply,
  exit958ed0Copy1ad14Apply,
  exit958ed0Store1ad18Apply,
  exit958ed0PostApply,
  exit958ed0PgdClearApply,
  exit958ed0TailApply,
  exit958ed0Plan,
  EXIT_959130_VA,
  EXIT_959130_BODY_BYTES,
  EXIT_959130_GAMESTATE_OFF,
  EXIT_959130_F98_OFF,
  EXIT_959130_CHANGES_OFF,
  EXIT_959130_FLAG_4B284_OFF,
  EXIT_959130_DELETE_VA,
  exit959130EntryOpen,
  exit959130VecEmpty,
  exit959130PrefixOpen,
  exit959130HostNeeded,
  exit959130Va,
  exit959130BodyBytes,
  exit959130DeleteVa,
  exit959130GamestateAddr,
  exit959130DeleteApply,
  exit959130Plan,
  exitTidyReleaseNeeded,
  exitTidySizeArg,
  EXIT_TIDY_VA,
  EXIT_TIDY_REACH_E8,
  EXIT_TIDY_REACH_JMP_TAILS,
  EXIT_TIDY_REACH_REGISTER_HELD,
  EXIT_TIDY_REACH_TOTAL,
  EXIT_TIDY_ROOT_SITE_VA,
} from "../scripts/decomp/exit-pure-model.mjs";
import {
  renderShellA159d0NormChar,
  renderShellA159d0HashStep,
  renderShellA159d0Hash,
} from "../scripts/decomp/render-shell-pure-model.mjs";
import {
  ALLOC_CALLERS_STRING_TIDY,
  allocStrTidyReleaseNeeded,
  allocStrTidySizeArg,
} from "../scripts/decomp/alloc-pure-model.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
/* Symbolic ABI pin (AGENTS.md: never hardcode the current ABI number in a
   test). The header enum is the deliberate pin; the model constant must
   agree with it — that is the assertion each former literal now makes. */
const HEADER_ABI_VERSION = Number(
  readFileSync(join(root, "native", "decomp", "exit_pure_helpers.h"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .match(/ISAAC_[A-Z0-9_]*ABI_VERSION\s*=\s*(\d+)/)[1]);
const header = join(root, "native", "decomp", "exit_pure_helpers.h");
const source = join(root, "native", "decomp", "exit_pure_helpers.cpp");
const outDir = join(root, "output", "decomp", "exit-pure");
const wasmPath = join(outDir, "exit-pure-helpers.wasm");

function firstExisting(paths, label) {
  const found = paths.find((path) => path && existsSync(path));
  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

const EXPORTS = [
  "isaac_exit_session_active",
  "isaac_exit_item_overlay_force_needed",
  "isaac_exit_manager_floats_reset",
  "isaac_exit_pgd_flush_prepare",
  "isaac_exit_pgd_flush_needed",
  "isaac_exit_pgd_save_uses_cloud",
  "isaac_exit_gamestate_io_needed",
  "isaac_exit_gamestate_should_write",
  "isaac_exit_pure_field_teardown",
  "isaac_exit_teardown_t0",
  "isaac_exit_teardown_t1",
  "isaac_exit_teardown_t2",
  "isaac_exit_teardown_t4",
  "isaac_exit_vector_25ebc_clear_end",
  "isaac_exit_vector_25ebc_dtor_needed",
  "isaac_exit_vector_25ebc_element_count",
  "isaac_exit_sfx_stop_id_at",
  "isaac_exit_pgd_readonly_clear",
  "isaac_exit_postlog_pure_fields",
  "isaac_exit_item_overlay_state_clear",
  "isaac_exit_counter_265c0_clear",
  "isaac_exit_session_pair_clear",
  "isaac_exit_6f43b0_prefix",
  "isaac_exit_6f4520_apply",
  "isaac_exit_6f43b0_mid",
  "isaac_exit_6f43b0_tail",
  "isaac_exit_frame_mode_pair_clear",
  "isaac_exit_volume_modifier_clear_needed",
  "isaac_exit_manager_2a334_set_one",
  "isaac_exit_manager_2a338_set",
  "isaac_exit_residual_slot_copy_needed",
  "isaac_exit_residual_entity_copy_30_to_34",
  "isaac_exit_residual_entity_batch_copy_30_to_34",
  "isaac_exit_residual_18990_apply",
  "isaac_exit_map_value_flag_28_clear",
  "isaac_exit_9b5cb0_prefix",
  "isaac_exit_9b5cb0_prefix_ptrs",
  "isaac_exit_8d3250_p0",
  "isaac_exit_8d3250_p0_ptrs",
  "isaac_exit_8d3250_p1",
  "isaac_exit_8d3250_p2",
  "isaac_exit_8d3250_p3",
  "isaac_exit_8d3250_p3_ptrs",
  "isaac_exit_8d3250_cursor_layer_host_needed",
  "isaac_exit_8d3250_p4",
  "isaac_exit_8d3250_p4_ptrs",
  "isaac_exit_8d3250_list_host_needed",
  "isaac_exit_8d3250_list_empty",
  "isaac_exit_8d3250_cursor_va",
  "isaac_exit_8d3250_getlayer_receiver_off",
  "isaac_exit_8d3250_layer_clear_off",
  "isaac_exit_8d3250_reset_receiver_off",
  "isaac_exit_8d3250_list_sentinel_off",
  "isaac_exit_8d3250_list_header_off",
  "isaac_exit_8d3250_list_destroy_arg1_ptr",
  "isaac_exit_8d3250_list_destroy_arg2",
  "isaac_exit_8d3250_host_plan",
  "isaac_exit_9b9150_p0",
  "isaac_exit_9b9150_p0_ptrs",
  "isaac_exit_9b9150_player_list_host_needed",
  "isaac_exit_9b9150_player_list_clear_end",
  "isaac_exit_9b9150_extra_list_count",
  "isaac_exit_9b9150_extra_list_host_needed",
  "isaac_exit_9b9150_extra_list_clear_end",
  "isaac_exit_9b9150_ptr_host_needed",
  "isaac_exit_9b9150_slot_clear",
  "isaac_exit_9b9150_esau_slots_clear",
  "isaac_exit_9b9150_mid",
  "isaac_exit_9b9150_mid_ptrs",
  "isaac_exit_9b9150_tail",
  "isaac_exit_9b9150_tail_ptrs",
  "isaac_exit_9a27d0_slot_flag_clear",
  "isaac_exit_9a27d0_slot_flags_clear_packed",
  "isaac_exit_9a27d0_slot_flags_apply",
  "isaac_exit_9a27d0_slot_flag_off",
  "isaac_exit_9a27d0_field_54cd_clear",
  "isaac_exit_9a27d0_slot_triple_base_off",
  "isaac_exit_9a27d0_slot_reset_off",
  "isaac_exit_9a27d0_slot_709150_off",
  "isaac_exit_9a27d0_slot_709150_arg",
  "isaac_exit_9a27d0_slot_loop_segment",
  "isaac_exit_9a27d0_slot_loop1_count",
  "isaac_exit_9a27d0_slot_loop2_count",
  "isaac_exit_9a27d0_slot_loop1_start_off",
  "isaac_exit_9a27d0_slot_loop2_start_off",
  "isaac_exit_9a27d0_slot_plan",
  "isaac_exit_9a19a0_prefix",
  "isaac_exit_9a19a0_prefix_ptrs",
  "isaac_exit_9a19a0_slot_setup",
  "isaac_exit_9a19a0_slots_apply",
  "isaac_exit_9a19a0_slot_base_off",
  "isaac_exit_9a19a0_field_54cc_set",
  "isaac_exit_40e910_list_host_needed",
  "isaac_exit_40e910_node_object_present",
  "isaac_exit_40e910_free_after_com_needed",
  "isaac_exit_40e910_post_erase_dtor_needed",
  "isaac_exit_40e910_post_erase_callback_needed",
  "isaac_exit_40e910_free_size",
  "isaac_exit_40e910_walk_continue",
  "isaac_exit_40e910_com_iface_addr",
  "isaac_exit_40e910_com_release_arg",
  "isaac_exit_40e910_com_state_word",
  "isaac_exit_tree_iterator_next",
  "isaac_exit_map_1a738_walk_needed",
  "isaac_exit_map_1a738_lookup_hit",
  "isaac_exit_map_1a738_flag_active",
  "isaac_exit_map_1a738_elem_range_nonempty",
  "isaac_exit_map_1a738_elem_walk_needed",
  "isaac_exit_map_1a738_elem_stride",
  "isaac_exit_map_1a738_elem_host_off",
  "isaac_exit_msvc_string_sso_inline",
  "isaac_exit_msvc_string_data_addr",
  "isaac_exit_string_compare",
  "isaac_exit_69d690_candidate_isnil",
  "isaac_exit_69d690_cmp_is_hit",
  "isaac_exit_69d690_select_result",
  "isaac_exit_685bc0_init_triple",
  "isaac_exit_685bc0_root_is_empty",
  "isaac_exit_685bc0_cmp_go_right",
  "isaac_exit_685bc0_step",
  "isaac_exit_685bc0_loop_continue",
  "isaac_exit_map_lower_bound",
  "isaac_exit_map_find_69d690",
  "isaac_exit_40c7f0_alloc_size",
  "isaac_exit_40c7f0_alloc_ok",
  "isaac_exit_40c7f0_old_object_present",
  "isaac_exit_40c7f0_callback_needed",
  "isaac_exit_40c7f0_object_finish",
  "isaac_exit_40c7f0_object_finish_apply",
  "isaac_exit_40c7f0_pair_apply",
  "isaac_exit_40c7f0_pair_apply_base",
  "isaac_exit_40cc10_pure_fields",
  "isaac_exit_40cc10_pure_fields_ptrs",
  "isaac_exit_40cc10_apply",
  "isaac_exit_40cc10_default_init_is_direct",
  "isaac_exit_40cc10_default_init_va",
  "isaac_exit_40c7f0_vtable",
  "isaac_exit_408830_store_arg",
  "isaac_exit_408830_store_arg_apply",
  "isaac_exit_408830_ptr_free_needed",
  "isaac_exit_408830_ptr_clear",
  "isaac_exit_408830_arg_present",
  "isaac_exit_408830_count_nonzero",
  "isaac_exit_408830_alloc_size",
  "isaac_exit_408830_fill_size",
  "isaac_exit_408830_fill_byte",
  "isaac_exit_408830_f32_10_bits",
  "isaac_exit_408830_tail",
  "isaac_exit_408830_tail_ptrs",
  "isaac_exit_408830_tail_apply",
  "isaac_exit_9b4810_vec_reset_end",
  "isaac_exit_9b4810_vec_reset_end_apply",
  "isaac_exit_9b4810_first_push_value",
  "isaac_exit_9b4810_mode_is_3",
  "isaac_exit_9b4810_mode_is_1",
  "isaac_exit_9b4810_mode_layer_path",
  "isaac_exit_9b4810_mode_block_a_needed",
  "isaac_exit_9b4810_mode_block_c_needed",
  "isaac_exit_9b4810_mode_block_e_needed",
  "isaac_exit_9b4810_mode_block_f_needed",
  "isaac_exit_9b4810_vec_space",
  "isaac_exit_9b4810_vec_end_after_push",
  "isaac_exit_9b4810_vec_store",
  "isaac_exit_9b4810_vec_push_pure",
  "isaac_exit_9b4810_vec_push_apply",
  "isaac_exit_9b4810_block_a_count",
  "isaac_exit_9b4810_block_a_at",
  "isaac_exit_9b4810_block_b_count",
  "isaac_exit_9b4810_block_b_at",
  "isaac_exit_9b4810_block_c_count",
  "isaac_exit_9b4810_block_c_at",
  "isaac_exit_9b4810_block_d_count",
  "isaac_exit_9b4810_block_d_at",
  "isaac_exit_9b4810_block_e_count",
  "isaac_exit_9b4810_block_e_at",
  "isaac_exit_9b4810_block_f_count",
  "isaac_exit_9b4810_block_f_at",
  "isaac_exit_9b4810_value_1c",
  "isaac_exit_9b4810_push_1c_needed",
  "isaac_exit_9b4810_layer_loop_needed",
  "isaac_exit_9b4810_counter_play_needed",
  "isaac_exit_9b4810_play_flag_set",
  "isaac_exit_9b4810_play_flag_apply",
  "isaac_exit_9b4810_tail",
  "isaac_exit_9b4810_tail_ptrs",
  "isaac_exit_9b4810_tail_apply",
  "isaac_exit_f32_global_c7b640_addr",
  "isaac_exit_f32_global_c7b644_addr",
  "isaac_exit_428590_elem_count",
  "isaac_exit_428590_capacity_elems",
  "isaac_exit_428590_insert_index",
  "isaac_exit_428590_max_elems",
  "isaac_exit_428590_length_error_needed",
  "isaac_exit_428590_needed_size",
  "isaac_exit_428590_geo_would_overflow",
  "isaac_exit_428590_geometric_capacity",
  "isaac_exit_428590_new_capacity",
  "isaac_exit_428590_capacity_error_needed",
  "isaac_exit_428590_alloc_bytes",
  "isaac_exit_428590_insert_slot",
  "isaac_exit_428590_new_end",
  "isaac_exit_428590_new_cap_ptr",
  "isaac_exit_428590_insert_at_end",
  "isaac_exit_428590_copy_prefix_bytes",
  "isaac_exit_428590_copy_suffix_bytes",
  "isaac_exit_428590_copy_all_bytes",
  "isaac_exit_428590_old_free_needed",
  "isaac_exit_428590_old_capacity_bytes",
  "isaac_exit_428590_free_uses_heap_header",
  "isaac_exit_428590_free_header_size",
  "isaac_exit_428590_free_header_offset_ok",
  "isaac_exit_428590_plan",
  "isaac_exit_428590_post_alloc_ptrs",
  "isaac_exit_anm2_layer_stride",
  "isaac_exit_anm2_getlayer_in_range",
  "isaac_exit_anm2_layer_ptr",
  "isaac_exit_anm2_getlayer_try",
  "isaac_exit_anm2_getlayer_apply",
  "isaac_exit_anm2_load_path_present",
  "isaac_exit_anm2_load_path_is_self",
  "isaac_exit_anm2_load_graphics_needed",
  "isaac_exit_anm2_load_prefix",
  "isaac_exit_anm2_load_prefix_ptrs",
  "isaac_exit_anm2_load_prefix_apply",
  "isaac_exit_anm2_layer_loop_needed",
  "isaac_exit_anm2_layer_byte_off",
  "isaac_exit_anm2_layer_name_holder_null",
  "isaac_exit_anm2_layer_name_str_addr",
  "isaac_exit_anm2_cstr_equal",
  "isaac_exit_anm2_name_is_shadow",
  "isaac_exit_anm2_name_is_star",
  "isaac_exit_anm2_shadow_index_set",
  "isaac_exit_anm2_layer_star_flags_or",
  "isaac_exit_anm2_layer_star_flags_value",
  "isaac_exit_anm2_flags110_or_400",
  "isaac_exit_anm2_flags110_or_800",
  "isaac_exit_anm2_flags110_or_400_value",
  "isaac_exit_anm2_flags110_or_800_value",
  "isaac_exit_anm2_load_layer_step",
  "isaac_exit_anm2_sheet_loop_needed",
  "isaac_exit_anm2_sheet_stride",
  "isaac_exit_anm2_sheet_ptr",
  "isaac_exit_anm2_load_sheet_step",
  "isaac_exit_40cf00_uses_heap_header",
  "isaac_exit_40cf00_size_is_zero",
  "isaac_exit_40cf00_header_request_size",
  "isaac_exit_40cf00_header_overflow",
  "isaac_exit_40cf00_alloc_request_size",
  "isaac_exit_40cf00_align_user_ptr",
  "isaac_exit_40cf00_header_slot",
  "isaac_exit_40cf00_plan",
  "isaac_exit_40cf00_finish_header",
  "isaac_exit_anm2_layer_png_str_off",
  "isaac_exit_anm2_layer_flag30_off",
  "isaac_exit_anm2_layer_png_str_ptr",
  "isaac_exit_anm2_sized_equal",
  "isaac_exit_anm2_replace_assign_needed",
  "isaac_exit_anm2_replace_flag30_clear",
  "isaac_exit_anm2_replace_plan",
  "isaac_exit_anm2_replace_finish",
  "isaac_exit_anm2_anim_stride",
  "isaac_exit_anm2_anim_base_off",
  "isaac_exit_anm2_anim_count_off",
  "isaac_exit_anm2_play_state_off",
  "isaac_exit_anm2_anim_loop_needed",
  "isaac_exit_anm2_anim_entry_ptr",
  "isaac_exit_anm2_play_state_ptr",
  "isaac_exit_anm2_play_reset_needed",
  "isaac_exit_anm2_play_name_match",
  "isaac_exit_anm2_play_plan",
  "isaac_exit_anm2_play_find",
  "isaac_exit_animstate_anim_off",
  "isaac_exit_animstate_layer_arr_off",
  "isaac_exit_animstate_null_arr_off",
  "isaac_exit_animstate_frame_off",
  "isaac_exit_animstate_mask18_off",
  "isaac_exit_animstate_mask1c_off",
  "isaac_exit_animdata_layer_count_off",
  "isaac_exit_animdata_null_count_off",
  "isaac_exit_animdata_event_base_off",
  "isaac_exit_animdata_event_count_off",
  "isaac_exit_anim_event_stride",
  "isaac_exit_animstate_rewind_prefix",
  "isaac_exit_animstate_rewind_prefix_apply",
  "isaac_exit_animstate_408c90_anim_present",
  "isaac_exit_animstate_408c90_log_needed",
  "isaac_exit_animstate_408c90_event_loop_needed",
  "isaac_exit_animstate_408c90_event_frame_eq",
  "isaac_exit_animstate_408c90_mask_bts",
  "isaac_exit_animstate_408c90_event_step",
  "isaac_exit_animstate_408c90_apply",
  "isaac_exit_animstate_rewind_layer_loop_needed",
  "isaac_exit_animstate_rewind_null_loop_needed",
  "isaac_exit_animstate_rewind_zero_u32_n",
  "isaac_exit_animstate_rewind_zero_arrays",
  "isaac_exit_animstate_rewind_plan",
  "isaac_exit_animstate_rewind_apply",
  "isaac_exit_animstate_rewind_apply_addr",
  "isaac_exit_40ccd0_max_size",
  "isaac_exit_40ccd0_fits_capacity",
  "isaac_exit_40ccd0_length_error_needed",
  "isaac_exit_40ccd0_dest_data_addr",
  "isaac_exit_40ccd0_rounded_capacity",
  "isaac_exit_40ccd0_rounded_overflow",
  "isaac_exit_40ccd0_geo_would_overflow",
  "isaac_exit_40ccd0_geometric_capacity",
  "isaac_exit_40ccd0_new_capacity",
  "isaac_exit_40ccd0_alloc_size",
  "isaac_exit_40ccd0_old_free_needed",
  "isaac_exit_40ccd0_free_size",
  "isaac_exit_40ccd0_free_uses_heap_header",
  "isaac_exit_40ccd0_free_header_size",
  "isaac_exit_40ccd0_free_header_offset_ok",
  "isaac_exit_40ccd0_store_size",
  "isaac_exit_40ccd0_store_capacity",
  "isaac_exit_40ccd0_store_ptr",
  "isaac_exit_40ccd0_null_term",
  "isaac_exit_40ccd0_copy_and_term",
  "isaac_exit_40ccd0_nongrow_finish",
  "isaac_exit_40ccd0_grow_pre_copy",
  "isaac_exit_40ccd0_grow_post_free",
  "isaac_exit_40ccd0_plan",
  "isaac_exit_408970_count_select",
  "isaac_exit_408970_counts_equal",
  "isaac_exit_408970_counts_differ",
  "isaac_exit_408970_new_count_positive",
  "isaac_exit_408970_copy_needed",
  "isaac_exit_408970_ptr_nonzero",
  "isaac_exit_408970_alloc_size",
  "isaac_exit_408970_fill_size",
  "isaac_exit_408970_copy_size",
  "isaac_exit_408970_fill_byte",
  "isaac_exit_408970_heap_stats_base",
  "isaac_exit_408970_free_block_ptr",
  "isaac_exit_408970_store_arg",
  "isaac_exit_408970_store_arg_apply",
  "isaac_exit_408970_store_buf_a",
  "isaac_exit_408970_store_buf_b",
  "isaac_exit_408970_ptr_clear",
  "isaac_exit_408970_store_buf_a_apply",
  "isaac_exit_408970_store_buf_b_apply",
  "isaac_exit_408970_clear_buf_a_apply",
  "isaac_exit_408970_clear_buf_b_apply",
  "isaac_exit_408970_buffer_plan",
  "isaac_exit_408970_plan",
  "isaac_exit_40db90_path_size_present",
  "isaac_exit_40db90_early_return",
  "isaac_exit_40db90_timing_scale",
  "isaac_exit_40db90_timing_delta",
  "isaac_exit_40db90_cache_space_ok",
  "isaac_exit_40db90_cache_walk_done",
  "isaac_exit_40db90_cache_walk_next",
  "isaac_exit_40db90_tree_hit_select",
  "isaac_exit_40db90_node_is_sentinel",
  "isaac_exit_40db90_cache_miss",
  "isaac_exit_40db90_insert_needed",
  "isaac_exit_40db90_heap_stats_base",
  "isaac_exit_40db90_temp_free_needed",
  "isaac_exit_40db90_free_block_ptr",
  "isaac_exit_40db90_layer_array_present",
  "isaac_exit_40db90_old_layer_free_size",
  "isaac_exit_40db90_layer_count_nonzero",
  "isaac_exit_40db90_layer_alloc_size",
  "isaac_exit_40db90_alloc_ok",
  "isaac_exit_40db90_user_ptr_after_header",
  "isaac_exit_40db90_layer_loop_needed",
  "isaac_exit_40db90_src_layer_stride",
  "isaac_exit_40db90_dst_layer_stride",
  "isaac_exit_40db90_src_layer_ptr",
  "isaac_exit_40db90_dst_layer_ptr",
  "isaac_exit_40db90_store_layer_backptr",
  "isaac_exit_40db90_store_layer_backptr_at",
  "isaac_exit_40db90_name_assign_needed",
  "isaac_exit_40db90_field_pack",
  "isaac_exit_40db90_field_pack_apply",
  "isaac_exit_40db90_plan",
  "isaac_exit_40e110_cache_space_ok",
  "isaac_exit_40e110_cache_walk_done",
  "isaac_exit_40e110_cache_walk_next",
  "isaac_exit_40e110_path_data_addr",
  "isaac_exit_40e110_path_buf_size",
  "isaac_exit_40e110_tree_hit_select",
  "isaac_exit_40e110_node_is_sentinel",
  "isaac_exit_40e110_cache_hit",
  "isaac_exit_40e110_cache_miss",
  "isaac_exit_40e110_log_needed",
  "isaac_exit_40e110_refcount_inc",
  "isaac_exit_40e110_refcount_store",
  "isaac_exit_40e110_refcount_inc_apply",
  "isaac_exit_40e110_grow_install_needed",
  "isaac_exit_40e110_grow_result_clear",
  "isaac_exit_40e110_grow_result_clear_at",
  "isaac_exit_40e110_plan",
  "isaac_exit_40c000_layer_count_nonzero",
  "isaac_exit_40c000_loop_needed",
  "isaac_exit_40c000_layer_stride",
  "isaac_exit_40c000_layer_byte_off",
  "isaac_exit_40c000_layer_ptr",
  "isaac_exit_40c000_layer_skip",
  "isaac_exit_40c000_layer_body_needed",
  "isaac_exit_40c000_png_str_ptr",
  "isaac_exit_40c000_path_data_addr",
  "isaac_exit_40c000_shared_present",
  "isaac_exit_40c000_virtual_ok",
  "isaac_exit_40c000_graphics_flag",
  "isaac_exit_40c000_sprite_present",
  "isaac_exit_40c000_object_present",
  "isaac_exit_40c000_callback_needed",
  "isaac_exit_40c000_pair_zero",
  "isaac_exit_40c000_pair_assign",
  "isaac_exit_40c000_pair_zero_at",
  "isaac_exit_40c000_pair_assign_at",
  "isaac_exit_40c000_store_layer_flags",
  "isaac_exit_40c000_store_layer_flags_at",
  "isaac_exit_40c000_loop_next_index",
  "isaac_exit_40c000_loop_next_off",
  "isaac_exit_40c1e0_init",
  "isaac_exit_40c1e0_apply",
  "isaac_exit_40c000_plan",
  "isaac_exit_408640_source_present",
  "isaac_exit_408640_ctrl_present",
  "isaac_exit_408640_virtual_ok",
  "isaac_exit_408640_callback_needed",
  "isaac_exit_408640_dst_field_ptr",
  "isaac_exit_408640_src_field_ptr",
  "isaac_exit_408640_pair_slot_ptr",
  "isaac_exit_408640_dst_field_off",
  "isaac_exit_408640_src_field_off",
  "isaac_exit_408640_pair_slot_off",
  "isaac_exit_408640_field_dwords",
  "isaac_exit_408640_field_copy",
  "isaac_exit_408640_field_copy_at",
  "isaac_exit_408640_field_copy_if_present_at",
  "isaac_exit_408640_plan",
  "isaac_exit_841cf0_p0_elem_off",
  "isaac_exit_841cf0_p0_elem",
  "isaac_exit_841cf0_p0_apply",
  "isaac_exit_841cf0_head_clear",
  "isaac_exit_841cf0_p1_elem_off",
  "isaac_exit_841cf0_p1_host_ptr",
  "isaac_exit_841cf0_p1_pre",
  "isaac_exit_841cf0_p1_apply",
  "isaac_exit_841cf0_p2_elem_off",
  "isaac_exit_841cf0_p2_host_a_ptr",
  "isaac_exit_841cf0_p2_host_b_ptr",
  "isaac_exit_841cf0_p2_pre",
  "isaac_exit_841cf0_p2_apply",
  "isaac_exit_841cf0_p2_host_needed",
  "isaac_exit_841cf0_vec_elem_host_ptr",
  "isaac_exit_841cf0_vec_next",
  "isaac_exit_841cf0_vec_walk_needed",
  "isaac_exit_841cf0_vec_walk_continue",
  "isaac_exit_841cf0_vec_elem_count",
  "isaac_exit_841cf0_vec_clear_end",
  "isaac_exit_841cf0_word_6ac_clear",
  "isaac_exit_841cf0_terminal_clear",
  "isaac_exit_841cf0_pure_apply",
  "isaac_exit_83abb0_block_base_off",
  "isaac_exit_83abb0_walk_needed",
  "isaac_exit_83abb0_walk_continue",
  "isaac_exit_83abb0_elem_host_ptr",
  "isaac_exit_83abb0_elem_next",
  "isaac_exit_83abb0_elem_count",
  "isaac_exit_83abb0_block_post",
  "isaac_exit_83abb0_terminal_clear",
  "isaac_exit_83abb0_apply",
  "isaac_exit_range_destroy_stride_709380",
  "isaac_exit_range_destroy_stride_709300",
  "isaac_exit_range_destroy_loop_needed",
  "isaac_exit_range_destroy_continue",
  "isaac_exit_range_destroy_ctrl_ptr",
  "isaac_exit_range_destroy_cb_arg_ptr",
  "isaac_exit_range_destroy_next",
  "isaac_exit_range_destroy_ctrl_present",
  "isaac_exit_range_destroy_virtual_ok",
  "isaac_exit_range_destroy_callback_needed",
  "isaac_exit_84bfd0_slot_kind",
  "isaac_exit_84bfd0_block_base_off",
  "isaac_exit_84bfd0_slot_off",
  "isaac_exit_84bfd0_f32_bits",
  "isaac_exit_84bfd0_apply_block",
  "isaac_exit_84bfd0_apply",
  "isaac_exit_840f70_slot_off",
  "isaac_exit_840f70_slot_ptr",
  "isaac_exit_840f70_free_needed",
  "isaac_exit_840f70_heap_stats_base",
  "isaac_exit_840f70_free_base_ptr",
  "isaac_exit_840f70_header_size_ptr",
  "isaac_exit_840f70_stats_sub_lo",
  "isaac_exit_840f70_stats_sub_borrow",
  "isaac_exit_840f70_stats_sub_hi",
  "isaac_exit_840f70_stats_sub",
  "isaac_exit_840f70_stats_sub_at",
  "isaac_exit_840f70_slot_clear",
  "isaac_exit_840f70_apply",
  "isaac_exit_840f70_slot_plan",
  "isaac_exit_709150_alloc_size",
  "isaac_exit_709150_alloc_ok",
  "isaac_exit_709150_new_object_value",
  "isaac_exit_709150_object_finish",
  "isaac_exit_709150_object_finish_apply",
  "isaac_exit_709150_old_object_present",
  "isaac_exit_709150_virtual_ok",
  "isaac_exit_709150_callback_needed",
  "isaac_exit_709150_pair_apply",
  "isaac_exit_709150_pair_apply_base",
  "isaac_exit_709150_plan",
  "isaac_exit_a1ad90_block_a_needed",
  "isaac_exit_a1ad90_block_a_clear",
  "isaac_exit_a1ad90_block_b_needed",
  "isaac_exit_a1ad90_header_ptr",
  "isaac_exit_a1ad90_elem_size",
  "isaac_exit_a1ad90_elem_dtor",
  "isaac_exit_a1ad90_dtor_count_arg",
  "isaac_exit_a1ad90_free_size",
  "isaac_exit_a1ad90_block_b_clear",
  "isaac_exit_a1ad90_tree_obj_ptr",
  "isaac_exit_a1ad90_tree_head_ptr",
  "isaac_exit_a1ad90_tree_size_ptr",
  "isaac_exit_a1ad90_tree_root_ptr",
  "isaac_exit_a1ad90_tree_reset_at",
  "isaac_exit_a1ad90_tree_size_clear",
  "isaac_exit_a1ad90_terminal",
  "isaac_exit_a1ad90_apply_this",
  "isaac_exit_a1ad90_plan",
  "isaac_exit_a648b0_mode_from_cl",
  "isaac_exit_a648b0_mode_free",
  "isaac_exit_a648b0_mode1_free_needed",
  "isaac_exit_a648b0_mode1_header_size_ptr",
  "isaac_exit_a648b0_mode1_free_base_ptr",
  "isaac_exit_a648b0_heap_stats_base",
  "isaac_exit_a648b0_mode_path",
  "isaac_exit_a648b0_mode_stats",
  "isaac_exit_a648b0_mode2_stats_base_ptr",
  "isaac_exit_a648b0_mode2_addend_lo_va",
  "isaac_exit_a648b0_mode2_addend_hi_va",
  "isaac_exit_a648b0_stats_add_lo",
  "isaac_exit_a648b0_stats_add_carry",
  "isaac_exit_a648b0_stats_add_hi",
  "isaac_exit_a648b0_stats_add",
  "isaac_exit_a648b0_mode_plan",
  "isaac_exit_6f0040_va",
  "isaac_exit_6f0040_body_bytes",
  "isaac_exit_6f0040_ptr_off",
  "isaac_exit_6f0040_count_off",
  "isaac_exit_6f0040_predicate",
  "isaac_exit_71df80_va",
  "isaac_exit_71df80_body_bytes",
  "isaac_exit_71df80_game_dat",
  "isaac_exit_71df80_room_off",
  "isaac_exit_71df80_state_off",
  "isaac_exit_71df80_state_open",
  "isaac_exit_40c4a0_entry_zero",
  "isaac_exit_40c4a0_entry_zero_at",
  "isaac_exit_40c4a0_alloc_size",
  "isaac_exit_40c4a0_alloc_ok",
  "isaac_exit_40c4a0_new_object_value",
  "isaac_exit_40c4a0_object_finish",
  "isaac_exit_40c4a0_object_finish_apply",
  "isaac_exit_40c4a0_old_object_present",
  "isaac_exit_40c4a0_virtual_ok",
  "isaac_exit_40c4a0_callback_needed",
  "isaac_exit_40c4a0_pair_apply",
  "isaac_exit_40c4a0_pair_apply_base",
  "isaac_exit_40c4a0_return_value",
  "isaac_exit_40c4a0_plan",
  "isaac_exit_415800_walk_continue",
  "isaac_exit_415800_recurse_node_ptr",
  "isaac_exit_415800_next_node_ptr",
  "isaac_exit_415800_com_slot_ptr",
  "isaac_exit_415800_ctrl_ptr",
  "isaac_exit_415800_ctrl_present",
  "isaac_exit_415800_virtual_ok",
  "isaac_exit_415800_callback_needed",
  "isaac_exit_415800_free_size",
  "isaac_exit_415800_free_order",
  "isaac_exit_40e520_map_store_needed",
  "isaac_exit_40e520_name_ptr",
  "isaac_exit_40e520_default_name_addr",
  "isaac_exit_40e520_map_global",
  "isaac_exit_40e520_pair_value_ptr",
  "isaac_exit_40e520_pair_ctrl_ptr",
  "isaac_exit_40e520_release_ctrl_present",
  "isaac_exit_40e520_virtual_ok",
  "isaac_exit_40e520_callback_needed",
  "isaac_exit_40e520_callback_arg_ptr",
  "isaac_exit_40e520_plan",
  "isaac_exit_7384d0_old_object_present",
  "isaac_exit_7384d0_alloc_size",
  "isaac_exit_7384d0_alloc_ok",
  "isaac_exit_7384d0_new_object_value",
  "isaac_exit_7384d0_apply",
  "isaac_exit_408310_flag",
  "isaac_exit_408310_set_arg0",
  "isaac_exit_408310_empty_temp",
  "isaac_exit_408310_temp_reset",
  "isaac_exit_408310_assign_needed",
  "isaac_exit_408310_src_data_addr",
  "isaac_exit_408310_arm_free_needed",
  "isaac_exit_408310_free_ptr",
  "isaac_exit_408310_free_count",
  "isaac_exit_408310_abort_needed",
  "isaac_exit_408310_field_7c",
  "isaac_exit_408310_gate_c798e4_addr",
  "isaac_exit_408310_tail_apply",
  "isaac_exit_408310_plan",
  "isaac_exit_root_7df690_receiver",
  "isaac_exit_root_anm2_reset_count",
  "isaac_exit_root_anm2_reset_this_off_at",
  "isaac_exit_root_plan",
  "isaac_exit_8d26c0_is_noop",
  "isaac_exit_8d26c0_element_count",
  "isaac_exit_8d26c0_index_valid",
  "isaac_exit_8d26c0_element_addr",
  "isaac_exit_8d26c0_sub_count",
  "isaac_exit_8d26c0_step_bits",
  "isaac_exit_8d26c0_frame_from",
  "isaac_exit_8d26c0_plan",
  "isaac_exit_8d26c0_apply",
  "isaac_exit_root_8d26c0_host_needed",
  "isaac_exit_root_map_walk_flag_active",
  "isaac_exit_root_map_walk_elem_host_this",
  "isaac_exit_root_map_walk_flag_addr",
  "isaac_exit_root_map_walk_next",
  "isaac_exit_root_map_walk_elem_host_va",
  "isaac_exit_root_map_walk_global_va",
  "isaac_exit_root_map_walk_find_va",
  "isaac_exit_root_map_walk_plan",
  "isaac_exit_7df690_slot_count",
  "isaac_exit_7df690_slot_addr",
  "isaac_exit_7df690_float_off",
  "isaac_exit_7df690_gate_vtbl_off",
  "isaac_exit_7df690_set_vtbl_off",
  "isaac_exit_7df690_slot_obj_present",
  "isaac_exit_7df690_apply",
  "isaac_exit_7df690_plan",
  "isaac_exit_8650a0_flag_open",
  "isaac_exit_8650a0_host_needed",
  "isaac_exit_8650a0_flag_mask",
  "isaac_exit_8650a0_holder_off",
  "isaac_exit_8650a0_holder_addr",
  "isaac_exit_8650a0_pack_arg1",
  "isaac_exit_8650a0_pack_arg2",
  "isaac_exit_8650a0_registry_index",
  "isaac_exit_8650a0_unref_iat",
  "isaac_exit_8650a0_host_874a10_va",
  "isaac_exit_8650a0_pack_apply",
  "isaac_exit_8650a0_plan",
  "isaac_exit_686950_entry_open",
  "isaac_exit_686950_io_open",
  "isaac_exit_686950_host_needed",
  "isaac_exit_686950_remove_needed",
  "isaac_exit_686950_va",
  "isaac_exit_686950_body_bytes",
  "isaac_exit_686950_this_from_game",
  "isaac_exit_686950_state_value",
  "isaac_exit_686950_mgr_flag_off",
  "isaac_exit_686950_sprintf_va",
  "isaac_exit_686950_remove_iat",
  "isaac_exit_686950_mgr_flag_addr",
  "isaac_exit_686950_pack_apply",
  "isaac_exit_686950_plan",
  "isaac_exit_958ed0_entry_open",
  "isaac_exit_958ed0_count_ok",
  "isaac_exit_958ed0_vec_empty",
  "isaac_exit_958ed0_prefix_open",
  "isaac_exit_958ed0_challenge_needed",
  "isaac_exit_958ed0_challenge_ok",
  "isaac_exit_958ed0_host_needed",
  "isaac_exit_958ed0_pgd_needed",
  "isaac_exit_958ed0_local_filename_present",
  "isaac_exit_958ed0_io_dtor_needed",
  "isaac_exit_958ed0_va",
  "isaac_exit_958ed0_body_bytes",
  "isaac_exit_958ed0_flag_20dcc_off",
  "isaac_exit_958ed0_steam_iat",
  "isaac_exit_958ed0_fileno_iat",
  "isaac_exit_958ed0_flag_20dcc_addr",
  "isaac_exit_958ed0_pgd_this_addr",
  "isaac_exit_958ed0_prefix_apply",
  "isaac_exit_958ed0_copy_1ad14_apply",
  "isaac_exit_958ed0_store_1ad18_apply",
  "isaac_exit_958ed0_post_apply",
  "isaac_exit_958ed0_pgd_clear_apply",
  "isaac_exit_958ed0_tail_apply",
  "isaac_exit_958ed0_plan",
  "isaac_exit_959130_entry_open",
  "isaac_exit_959130_vec_empty",
  "isaac_exit_959130_prefix_open",
  "isaac_exit_959130_host_needed",
  "isaac_exit_959130_va",
  "isaac_exit_959130_body_bytes",
  "isaac_exit_959130_delete_va",
  "isaac_exit_959130_gamestate_addr",
  "isaac_exit_959130_delete_apply",
  "isaac_exit_959130_plan",
  "isaac_exit_tidy_release_needed",
  "isaac_exit_tidy_size_arg",
  "isaac_exit_tidy_va",
  "isaac_exit_tidy_root_site_va",
  "isaac_exit_tidy_root_elem_cap_off",
  "isaac_exit_pure_helpers_abi_version",
];

import { withWasmBuildCache } from "./wasm-build-cache.mjs";
/* Content-hash build cache: skips the clang+em++ spawns when the
   EXACT source bytes (mutants included) were built before. Disable
   with ISAAC_WASM_BUILD_CACHE=0. See tests/wasm-build-cache.mjs. */
function buildWasm() {
  withWasmBuildCache({
    tag: "exit-pure-helpers",
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
  const exportFlags = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
  const built = spawnSync(emxx, [
    source,
    "-std=c++20",
    "-O2",
    "-I", join(root, "native", "decomp"),
    "--no-entry",
    "-sSTANDALONE_WASM=1",
    "-sERROR_ON_UNDEFINED_SYMBOLS=1",
    ...exportFlags,
    "-o", wasmPath,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(WebAssembly.Module.imports(module).length, 0, "exit pure helpers must be zero-import");
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const exp = (name) => {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  const out = { memory: wasm.memory };
  for (const name of EXPORTS) {
    const key = name.replace(/^isaac_exit_/, "").replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
    out[key] = exp(name);
  }
  // Stable aliases used below
  out.abi = exp("isaac_exit_pure_helpers_abi_version");
  out.session = exp("isaac_exit_session_active");
  out.overlay = exp("isaac_exit_item_overlay_force_needed");
  out.floats = exp("isaac_exit_manager_floats_reset");
  out.pgdPrep = exp("isaac_exit_pgd_flush_prepare");
  out.pgdNeeded = exp("isaac_exit_pgd_flush_needed");
  out.pgdCloud = exp("isaac_exit_pgd_save_uses_cloud");
  out.gsIo = exp("isaac_exit_gamestate_io_needed");
  out.gsWrite = exp("isaac_exit_gamestate_should_write");
  out.teardown = exp("isaac_exit_pure_field_teardown");
  out.t0 = exp("isaac_exit_teardown_t0");
  out.t1 = exp("isaac_exit_teardown_t1");
  out.t2 = exp("isaac_exit_teardown_t2");
  out.t4 = exp("isaac_exit_teardown_t4");
  out.vectorClear = exp("isaac_exit_vector_25ebc_clear_end");
  out.vectorNeeded = exp("isaac_exit_vector_25ebc_dtor_needed");
  out.vectorCount = exp("isaac_exit_vector_25ebc_element_count");
  out.sfxId = exp("isaac_exit_sfx_stop_id_at");
  out.pgdReadonly = exp("isaac_exit_pgd_readonly_clear");
  out.postlog = exp("isaac_exit_postlog_pure_fields");
  out.overlayClear = exp("isaac_exit_item_overlay_state_clear");
  out.ctr265c0 = exp("isaac_exit_counter_265c0_clear");
  out.sessionPair = exp("isaac_exit_session_pair_clear");
  out.prefix6f43b0 = exp("isaac_exit_6f43b0_prefix");
  out.apply6f4520 = exp("isaac_exit_6f4520_apply");
  out.mid6f43b0 = exp("isaac_exit_6f43b0_mid");
  out.tail6f43b0 = exp("isaac_exit_6f43b0_tail");
  out.modePair = exp("isaac_exit_frame_mode_pair_clear");
  out.volNeeded = exp("isaac_exit_volume_modifier_clear_needed");
  out.set2a334 = exp("isaac_exit_manager_2a334_set_one");
  out.set2a338 = exp("isaac_exit_manager_2a338_set");
  out.slotNeeded = exp("isaac_exit_residual_slot_copy_needed");
  out.entityCopy = exp("isaac_exit_residual_entity_copy_30_to_34");
  out.entityBatch = exp("isaac_exit_residual_entity_batch_copy_30_to_34");
  out.residual18990 = exp("isaac_exit_residual_18990_apply");
  out.flag28 = exp("isaac_exit_map_value_flag_28_clear");
  out.prefix9b5cb0 = exp("isaac_exit_9b5cb0_prefix");
  out.prefix9b5cb0Ptrs = exp("isaac_exit_9b5cb0_prefix_ptrs");
  out.p08d3250 = exp("isaac_exit_8d3250_p0");
  out.p08d3250Ptrs = exp("isaac_exit_8d3250_p0_ptrs");
  out.p18d3250 = exp("isaac_exit_8d3250_p1");
  out.p28d3250 = exp("isaac_exit_8d3250_p2");
  out.p38d3250 = exp("isaac_exit_8d3250_p3");
  out.p38d3250Ptrs = exp("isaac_exit_8d3250_p3_ptrs");
  out.cursorLayerNeeded = exp("isaac_exit_8d3250_cursor_layer_host_needed");
  out.p48d3250 = exp("isaac_exit_8d3250_p4");
  out.p48d3250Ptrs = exp("isaac_exit_8d3250_p4_ptrs");
  out.listHostNeeded = exp("isaac_exit_8d3250_list_host_needed");
  out.listEmpty = exp("isaac_exit_8d3250_list_empty");
  out.cursorVa8d3250 = exp("isaac_exit_8d3250_cursor_va");
  out.getLayerReceiverOff8d3250 = exp("isaac_exit_8d3250_getlayer_receiver_off");
  out.layerClearOff8d3250 = exp("isaac_exit_8d3250_layer_clear_off");
  out.resetReceiverOff8d3250 = exp("isaac_exit_8d3250_reset_receiver_off");
  out.listSentinelOff8d3250 = exp("isaac_exit_8d3250_list_sentinel_off");
  out.listHeaderOff8d3250 = exp("isaac_exit_8d3250_list_header_off");
  out.listDestroyArg1Ptr8d3250 = exp("isaac_exit_8d3250_list_destroy_arg1_ptr");
  out.listDestroyArg28d3250 = exp("isaac_exit_8d3250_list_destroy_arg2");
  out.hostPlan8d3250 = exp("isaac_exit_8d3250_host_plan");
  out.p09b9150 = exp("isaac_exit_9b9150_p0");
  out.p09b9150Ptrs = exp("isaac_exit_9b9150_p0_ptrs");
  out.playerListNeeded = exp("isaac_exit_9b9150_player_list_host_needed");
  out.playerListClearEnd = exp("isaac_exit_9b9150_player_list_clear_end");
  out.extraListCount = exp("isaac_exit_9b9150_extra_list_count");
  out.extraListNeeded = exp("isaac_exit_9b9150_extra_list_host_needed");
  out.extraListClearEnd = exp("isaac_exit_9b9150_extra_list_clear_end");
  out.ptrHostNeeded = exp("isaac_exit_9b9150_ptr_host_needed");
  out.slotClear = exp("isaac_exit_9b9150_slot_clear");
  out.esauSlotsClear = exp("isaac_exit_9b9150_esau_slots_clear");
  out.mid9b9150 = exp("isaac_exit_9b9150_mid");
  out.mid9b9150Ptrs = exp("isaac_exit_9b9150_mid_ptrs");
  out.tail9b9150 = exp("isaac_exit_9b9150_tail");
  out.tail9b9150Ptrs = exp("isaac_exit_9b9150_tail_ptrs");
  out.slotFlagClear9a27d0 = exp("isaac_exit_9a27d0_slot_flag_clear");
  out.slotFlagsPacked9a27d0 = exp("isaac_exit_9a27d0_slot_flags_clear_packed");
  out.slotFlagsApply9a27d0 = exp("isaac_exit_9a27d0_slot_flags_apply");
  out.slotFlagOff9a27d0 = exp("isaac_exit_9a27d0_slot_flag_off");
  out.field54cdClear9a27d0 = exp("isaac_exit_9a27d0_field_54cd_clear");
  out.slotTripleBaseOff9a27d0 = exp("isaac_exit_9a27d0_slot_triple_base_off");
  out.slotResetOff9a27d0 = exp("isaac_exit_9a27d0_slot_reset_off");
  out.slot709150Off9a27d0 = exp("isaac_exit_9a27d0_slot_709150_off");
  out.slot709150Arg9a27d0 = exp("isaac_exit_9a27d0_slot_709150_arg");
  out.slotLoopSegment9a27d0 = exp("isaac_exit_9a27d0_slot_loop_segment");
  out.slotLoop1Count9a27d0 = exp("isaac_exit_9a27d0_slot_loop1_count");
  out.slotLoop2Count9a27d0 = exp("isaac_exit_9a27d0_slot_loop2_count");
  out.slotLoop1StartOff9a27d0 = exp("isaac_exit_9a27d0_slot_loop1_start_off");
  out.slotLoop2StartOff9a27d0 = exp("isaac_exit_9a27d0_slot_loop2_start_off");
  out.slotPlan9a27d0 = exp("isaac_exit_9a27d0_slot_plan");
  out.prefix9a19a0 = exp("isaac_exit_9a19a0_prefix");
  out.prefix9a19a0Ptrs = exp("isaac_exit_9a19a0_prefix_ptrs");
  out.slotSetup9a19a0 = exp("isaac_exit_9a19a0_slot_setup");
  out.slotsApply9a19a0 = exp("isaac_exit_9a19a0_slots_apply");
  out.slotBaseOff9a19a0 = exp("isaac_exit_9a19a0_slot_base_off");
  out.field54ccSet9a19a0 = exp("isaac_exit_9a19a0_field_54cc_set");
  out.listHostNeeded40e910 = exp("isaac_exit_40e910_list_host_needed");
  out.nodeObjectPresent40e910 = exp("isaac_exit_40e910_node_object_present");
  out.freeAfterComNeeded40e910 = exp("isaac_exit_40e910_free_after_com_needed");
  out.postEraseDtorNeeded40e910 = exp("isaac_exit_40e910_post_erase_dtor_needed");
  out.postEraseCallbackNeeded40e910 = exp(
    "isaac_exit_40e910_post_erase_callback_needed",
  );
  out.freeSize40e910 = exp("isaac_exit_40e910_free_size");
  out.walkContinue40e910 = exp("isaac_exit_40e910_walk_continue");
  out.comIfaceAddr40e910 = exp("isaac_exit_40e910_com_iface_addr");
  out.comReleaseArg40e910 = exp("isaac_exit_40e910_com_release_arg");
  out.comStateWord40e910 = exp("isaac_exit_40e910_com_state_word");
  out.treeIteratorNext = exp("isaac_exit_tree_iterator_next");
  out.mapWalkNeeded = exp("isaac_exit_map_1a738_walk_needed");
  out.mapLookupHit = exp("isaac_exit_map_1a738_lookup_hit");
  out.mapFlagActive = exp("isaac_exit_map_1a738_flag_active");
  out.mapElemRangeNonempty = exp("isaac_exit_map_1a738_elem_range_nonempty");
  out.mapElemWalkNeeded = exp("isaac_exit_map_1a738_elem_walk_needed");
  out.mapElemStride = exp("isaac_exit_map_1a738_elem_stride");
  out.mapElemHostOff = exp("isaac_exit_map_1a738_elem_host_off");
  out.msvcSsoInline = exp("isaac_exit_msvc_string_sso_inline");
  out.msvcStringDataAddr = exp("isaac_exit_msvc_string_data_addr");
  out.stringCompare = exp("isaac_exit_string_compare");
  out.candidateIsnil69d690 = exp("isaac_exit_69d690_candidate_isnil");
  out.cmpIsHit69d690 = exp("isaac_exit_69d690_cmp_is_hit");
  out.selectResult69d690 = exp("isaac_exit_69d690_select_result");
  out.initTriple685bc0 = exp("isaac_exit_685bc0_init_triple");
  out.rootIsEmpty685bc0 = exp("isaac_exit_685bc0_root_is_empty");
  out.cmpGoRight685bc0 = exp("isaac_exit_685bc0_cmp_go_right");
  out.step685bc0 = exp("isaac_exit_685bc0_step");
  out.loopContinue685bc0 = exp("isaac_exit_685bc0_loop_continue");
  out.mapLowerBound = exp("isaac_exit_map_lower_bound");
  out.mapFind69d690 = exp("isaac_exit_map_find_69d690");
  out.allocSize40c7f0 = exp("isaac_exit_40c7f0_alloc_size");
  out.allocOk40c7f0 = exp("isaac_exit_40c7f0_alloc_ok");
  out.oldObjectPresent40c7f0 = exp("isaac_exit_40c7f0_old_object_present");
  out.callbackNeeded40c7f0 = exp("isaac_exit_40c7f0_callback_needed");
  out.objectFinish40c7f0 = exp("isaac_exit_40c7f0_object_finish");
  out.objectFinishApply40c7f0 = exp("isaac_exit_40c7f0_object_finish_apply");
  out.pairApply40c7f0 = exp("isaac_exit_40c7f0_pair_apply");
  out.pairApplyBase40c7f0 = exp("isaac_exit_40c7f0_pair_apply_base");
  out.pureFields40cc10 = exp("isaac_exit_40cc10_pure_fields");
  out.pureFieldsPtrs40cc10 = exp("isaac_exit_40cc10_pure_fields_ptrs");
  out.apply40cc10 = exp("isaac_exit_40cc10_apply");
  out.defaultInitIsDirect40cc10 = exp(
    "isaac_exit_40cc10_default_init_is_direct",
  );
  out.defaultInitVa40cc10 = exp("isaac_exit_40cc10_default_init_va");
  out.vtable40c7f0 = exp("isaac_exit_40c7f0_vtable");
  out.storeArg408830 = exp("isaac_exit_408830_store_arg");
  out.storeArgApply408830 = exp("isaac_exit_408830_store_arg_apply");
  out.ptrFreeNeeded408830 = exp("isaac_exit_408830_ptr_free_needed");
  out.ptrClear408830 = exp("isaac_exit_408830_ptr_clear");
  out.argPresent408830 = exp("isaac_exit_408830_arg_present");
  out.countNonzero408830 = exp("isaac_exit_408830_count_nonzero");
  out.allocSize408830 = exp("isaac_exit_408830_alloc_size");
  out.fillSize408830 = exp("isaac_exit_408830_fill_size");
  out.fillByte408830 = exp("isaac_exit_408830_fill_byte");
  out.f3210Bits408830 = exp("isaac_exit_408830_f32_10_bits");
  out.tail408830 = exp("isaac_exit_408830_tail");
  out.tailPtrs408830 = exp("isaac_exit_408830_tail_ptrs");
  out.tailApply408830 = exp("isaac_exit_408830_tail_apply");
  out.vecResetEnd9b4810 = exp("isaac_exit_9b4810_vec_reset_end");
  out.vecResetEndApply9b4810 = exp("isaac_exit_9b4810_vec_reset_end_apply");
  out.firstPushValue9b4810 = exp("isaac_exit_9b4810_first_push_value");
  out.modeIs39b4810 = exp("isaac_exit_9b4810_mode_is_3");
  out.modeIs19b4810 = exp("isaac_exit_9b4810_mode_is_1");
  out.modeLayerPath9b4810 = exp("isaac_exit_9b4810_mode_layer_path");
  out.modeBlockANeeded9b4810 = exp("isaac_exit_9b4810_mode_block_a_needed");
  out.modeBlockCNeeded9b4810 = exp("isaac_exit_9b4810_mode_block_c_needed");
  out.modeBlockENeeded9b4810 = exp("isaac_exit_9b4810_mode_block_e_needed");
  out.modeBlockFNeeded9b4810 = exp("isaac_exit_9b4810_mode_block_f_needed");
  out.vecSpace9b4810 = exp("isaac_exit_9b4810_vec_space");
  out.vecEndAfterPush9b4810 = exp("isaac_exit_9b4810_vec_end_after_push");
  out.vecStore9b4810 = exp("isaac_exit_9b4810_vec_store");
  out.vecPushPure9b4810 = exp("isaac_exit_9b4810_vec_push_pure");
  out.vecPushApply9b4810 = exp("isaac_exit_9b4810_vec_push_apply");
  out.blockACount9b4810 = exp("isaac_exit_9b4810_block_a_count");
  out.blockAAt9b4810 = exp("isaac_exit_9b4810_block_a_at");
  out.blockBCount9b4810 = exp("isaac_exit_9b4810_block_b_count");
  out.blockBAt9b4810 = exp("isaac_exit_9b4810_block_b_at");
  out.blockCCount9b4810 = exp("isaac_exit_9b4810_block_c_count");
  out.blockCAt9b4810 = exp("isaac_exit_9b4810_block_c_at");
  out.blockDCount9b4810 = exp("isaac_exit_9b4810_block_d_count");
  out.blockDAt9b4810 = exp("isaac_exit_9b4810_block_d_at");
  out.blockECount9b4810 = exp("isaac_exit_9b4810_block_e_count");
  out.blockEAt9b4810 = exp("isaac_exit_9b4810_block_e_at");
  out.blockFCount9b4810 = exp("isaac_exit_9b4810_block_f_count");
  out.blockFAt9b4810 = exp("isaac_exit_9b4810_block_f_at");
  out.value1c9b4810 = exp("isaac_exit_9b4810_value_1c");
  out.push1cNeeded9b4810 = exp("isaac_exit_9b4810_push_1c_needed");
  out.layerLoopNeeded9b4810 = exp("isaac_exit_9b4810_layer_loop_needed");
  out.counterPlayNeeded9b4810 = exp("isaac_exit_9b4810_counter_play_needed");
  out.playFlagSet9b4810 = exp("isaac_exit_9b4810_play_flag_set");
  out.playFlagApply9b4810 = exp("isaac_exit_9b4810_play_flag_apply");
  out.tail9b4810 = exp("isaac_exit_9b4810_tail");
  out.tailPtrs9b4810 = exp("isaac_exit_9b4810_tail_ptrs");
  out.tailApply9b4810 = exp("isaac_exit_9b4810_tail_apply");
  out.f32GlobalC7b640Addr = exp("isaac_exit_f32_global_c7b640_addr");
  out.f32GlobalC7b644Addr = exp("isaac_exit_f32_global_c7b644_addr");
  out.elemCount428590 = exp("isaac_exit_428590_elem_count");
  out.capacityElems428590 = exp("isaac_exit_428590_capacity_elems");
  out.insertIndex428590 = exp("isaac_exit_428590_insert_index");
  out.maxElems428590 = exp("isaac_exit_428590_max_elems");
  out.lengthErrorNeeded428590 = exp("isaac_exit_428590_length_error_needed");
  out.neededSize428590 = exp("isaac_exit_428590_needed_size");
  out.geoWouldOverflow428590 = exp("isaac_exit_428590_geo_would_overflow");
  out.geometricCapacity428590 = exp("isaac_exit_428590_geometric_capacity");
  out.newCapacity428590 = exp("isaac_exit_428590_new_capacity");
  out.capacityErrorNeeded428590 = exp(
    "isaac_exit_428590_capacity_error_needed",
  );
  out.allocBytes428590 = exp("isaac_exit_428590_alloc_bytes");
  out.insertSlot428590 = exp("isaac_exit_428590_insert_slot");
  out.newEnd428590 = exp("isaac_exit_428590_new_end");
  out.newCapPtr428590 = exp("isaac_exit_428590_new_cap_ptr");
  out.insertAtEnd428590 = exp("isaac_exit_428590_insert_at_end");
  out.copyPrefixBytes428590 = exp("isaac_exit_428590_copy_prefix_bytes");
  out.copySuffixBytes428590 = exp("isaac_exit_428590_copy_suffix_bytes");
  out.copyAllBytes428590 = exp("isaac_exit_428590_copy_all_bytes");
  out.oldFreeNeeded428590 = exp("isaac_exit_428590_old_free_needed");
  out.oldCapacityBytes428590 = exp("isaac_exit_428590_old_capacity_bytes");
  out.freeUsesHeapHeader428590 = exp(
    "isaac_exit_428590_free_uses_heap_header",
  );
  out.freeHeaderSize428590 = exp("isaac_exit_428590_free_header_size");
  out.freeHeaderOffsetOk428590 = exp(
    "isaac_exit_428590_free_header_offset_ok",
  );
  out.plan428590 = exp("isaac_exit_428590_plan");
  out.postAllocPtrs428590 = exp("isaac_exit_428590_post_alloc_ptrs");
  out.anm2LayerStride = exp("isaac_exit_anm2_layer_stride");
  out.anm2GetlayerInRange = exp("isaac_exit_anm2_getlayer_in_range");
  out.anm2LayerPtr = exp("isaac_exit_anm2_layer_ptr");
  out.anm2GetlayerTry = exp("isaac_exit_anm2_getlayer_try");
  out.anm2GetlayerApply = exp("isaac_exit_anm2_getlayer_apply");
  out.anm2LoadPathPresent = exp("isaac_exit_anm2_load_path_present");
  out.anm2LoadPathIsSelf = exp("isaac_exit_anm2_load_path_is_self");
  out.anm2LoadGraphicsNeeded = exp("isaac_exit_anm2_load_graphics_needed");
  out.anm2LoadPrefix = exp("isaac_exit_anm2_load_prefix");
  out.anm2LoadPrefixPtrs = exp("isaac_exit_anm2_load_prefix_ptrs");
  out.anm2LoadPrefixApply = exp("isaac_exit_anm2_load_prefix_apply");
  out.anm2LayerLoopNeeded = exp("isaac_exit_anm2_layer_loop_needed");
  out.anm2LayerByteOff = exp("isaac_exit_anm2_layer_byte_off");
  out.anm2LayerNameHolderNull = exp("isaac_exit_anm2_layer_name_holder_null");
  out.anm2LayerNameStrAddr = exp("isaac_exit_anm2_layer_name_str_addr");
  out.anm2CstrEqual = exp("isaac_exit_anm2_cstr_equal");
  out.anm2NameIsShadow = exp("isaac_exit_anm2_name_is_shadow");
  out.anm2NameIsStar = exp("isaac_exit_anm2_name_is_star");
  out.anm2ShadowIndexSet = exp("isaac_exit_anm2_shadow_index_set");
  out.anm2LayerStarFlagsOr = exp("isaac_exit_anm2_layer_star_flags_or");
  out.anm2LayerStarFlagsValue = exp("isaac_exit_anm2_layer_star_flags_value");
  out.anm2Flags110Or400 = exp("isaac_exit_anm2_flags110_or_400");
  out.anm2Flags110Or800 = exp("isaac_exit_anm2_flags110_or_800");
  out.anm2Flags110Or400Value = exp("isaac_exit_anm2_flags110_or_400_value");
  out.anm2Flags110Or800Value = exp("isaac_exit_anm2_flags110_or_800_value");
  out.anm2LoadLayerStep = exp("isaac_exit_anm2_load_layer_step");
  out.anm2SheetLoopNeeded = exp("isaac_exit_anm2_sheet_loop_needed");
  out.anm2SheetStride = exp("isaac_exit_anm2_sheet_stride");
  out.anm2SheetPtr = exp("isaac_exit_anm2_sheet_ptr");
  out.anm2LoadSheetStep = exp("isaac_exit_anm2_load_sheet_step");
  out.usesHeapHeader40cf00 = exp("isaac_exit_40cf00_uses_heap_header");
  out.sizeIsZero40cf00 = exp("isaac_exit_40cf00_size_is_zero");
  out.headerRequestSize40cf00 = exp("isaac_exit_40cf00_header_request_size");
  out.headerOverflow40cf00 = exp("isaac_exit_40cf00_header_overflow");
  out.allocRequestSize40cf00 = exp("isaac_exit_40cf00_alloc_request_size");
  out.alignUserPtr40cf00 = exp("isaac_exit_40cf00_align_user_ptr");
  out.headerSlot40cf00 = exp("isaac_exit_40cf00_header_slot");
  out.plan40cf00 = exp("isaac_exit_40cf00_plan");
  out.finishHeader40cf00 = exp("isaac_exit_40cf00_finish_header");
  out.anm2LayerPngStrOff = exp("isaac_exit_anm2_layer_png_str_off");
  out.anm2LayerFlag30Off = exp("isaac_exit_anm2_layer_flag30_off");
  out.anm2LayerPngStrPtr = exp("isaac_exit_anm2_layer_png_str_ptr");
  out.anm2SizedEqual = exp("isaac_exit_anm2_sized_equal");
  out.anm2ReplaceAssignNeeded = exp("isaac_exit_anm2_replace_assign_needed");
  out.anm2ReplaceFlag30Clear = exp("isaac_exit_anm2_replace_flag30_clear");
  out.anm2ReplacePlan = exp("isaac_exit_anm2_replace_plan");
  out.anm2ReplaceFinish = exp("isaac_exit_anm2_replace_finish");
  out.anm2AnimStride = exp("isaac_exit_anm2_anim_stride");
  out.anm2AnimBaseOff = exp("isaac_exit_anm2_anim_base_off");
  out.anm2AnimCountOff = exp("isaac_exit_anm2_anim_count_off");
  out.anm2PlayStateOff = exp("isaac_exit_anm2_play_state_off");
  out.anm2AnimLoopNeeded = exp("isaac_exit_anm2_anim_loop_needed");
  out.anm2AnimEntryPtr = exp("isaac_exit_anm2_anim_entry_ptr");
  out.anm2PlayStatePtr = exp("isaac_exit_anm2_play_state_ptr");
  out.anm2PlayResetNeeded = exp("isaac_exit_anm2_play_reset_needed");
  out.anm2PlayNameMatch = exp("isaac_exit_anm2_play_name_match");
  out.anm2PlayPlan = exp("isaac_exit_anm2_play_plan");
  out.anm2PlayFind = exp("isaac_exit_anm2_play_find");
  out.animstateAnimOff = exp("isaac_exit_animstate_anim_off");
  out.animstateLayerArrOff = exp("isaac_exit_animstate_layer_arr_off");
  out.animstateNullArrOff = exp("isaac_exit_animstate_null_arr_off");
  out.animstateFrameOff = exp("isaac_exit_animstate_frame_off");
  out.animstateMask18Off = exp("isaac_exit_animstate_mask18_off");
  out.animstateMask1cOff = exp("isaac_exit_animstate_mask1c_off");
  out.animdataLayerCountOff = exp("isaac_exit_animdata_layer_count_off");
  out.animdataNullCountOff = exp("isaac_exit_animdata_null_count_off");
  out.animdataEventBaseOff = exp("isaac_exit_animdata_event_base_off");
  out.animdataEventCountOff = exp("isaac_exit_animdata_event_count_off");
  out.animEventStride = exp("isaac_exit_anim_event_stride");
  out.animstateRewindPrefix = exp("isaac_exit_animstate_rewind_prefix");
  out.animstateRewindPrefixApply = exp(
    "isaac_exit_animstate_rewind_prefix_apply",
  );
  out.animstate408c90AnimPresent = exp(
    "isaac_exit_animstate_408c90_anim_present",
  );
  out.animstate408c90LogNeeded = exp("isaac_exit_animstate_408c90_log_needed");
  out.animstate408c90EventLoopNeeded = exp(
    "isaac_exit_animstate_408c90_event_loop_needed",
  );
  out.animstate408c90EventFrameEq = exp(
    "isaac_exit_animstate_408c90_event_frame_eq",
  );
  out.animstate408c90MaskBts = exp("isaac_exit_animstate_408c90_mask_bts");
  out.animstate408c90EventStep = exp("isaac_exit_animstate_408c90_event_step");
  out.animstate408c90Apply = exp("isaac_exit_animstate_408c90_apply");
  out.animstateRewindLayerLoopNeeded = exp(
    "isaac_exit_animstate_rewind_layer_loop_needed",
  );
  out.animstateRewindNullLoopNeeded = exp(
    "isaac_exit_animstate_rewind_null_loop_needed",
  );
  out.animstateRewindZeroU32N = exp("isaac_exit_animstate_rewind_zero_u32_n");
  out.animstateRewindZeroArrays = exp(
    "isaac_exit_animstate_rewind_zero_arrays",
  );
  out.animstateRewindPlan = exp("isaac_exit_animstate_rewind_plan");
  out.animstateRewindApply = exp("isaac_exit_animstate_rewind_apply");
  out.animstateRewindApplyAddr = exp("isaac_exit_animstate_rewind_apply_addr");
  out.maxSize40ccd0 = exp("isaac_exit_40ccd0_max_size");
  out.fitsCapacity40ccd0 = exp("isaac_exit_40ccd0_fits_capacity");
  out.lengthErrorNeeded40ccd0 = exp("isaac_exit_40ccd0_length_error_needed");
  out.destDataAddr40ccd0 = exp("isaac_exit_40ccd0_dest_data_addr");
  out.roundedCapacity40ccd0 = exp("isaac_exit_40ccd0_rounded_capacity");
  out.roundedOverflow40ccd0 = exp("isaac_exit_40ccd0_rounded_overflow");
  out.geoWouldOverflow40ccd0 = exp("isaac_exit_40ccd0_geo_would_overflow");
  out.geometricCapacity40ccd0 = exp("isaac_exit_40ccd0_geometric_capacity");
  out.newCapacity40ccd0 = exp("isaac_exit_40ccd0_new_capacity");
  out.allocSize40ccd0 = exp("isaac_exit_40ccd0_alloc_size");
  out.oldFreeNeeded40ccd0 = exp("isaac_exit_40ccd0_old_free_needed");
  out.freeSize40ccd0 = exp("isaac_exit_40ccd0_free_size");
  out.freeUsesHeapHeader40ccd0 = exp("isaac_exit_40ccd0_free_uses_heap_header");
  out.freeHeaderSize40ccd0 = exp("isaac_exit_40ccd0_free_header_size");
  out.freeHeaderOffsetOk40ccd0 = exp(
    "isaac_exit_40ccd0_free_header_offset_ok",
  );
  out.storeSize40ccd0 = exp("isaac_exit_40ccd0_store_size");
  out.storeCapacity40ccd0 = exp("isaac_exit_40ccd0_store_capacity");
  out.storePtr40ccd0 = exp("isaac_exit_40ccd0_store_ptr");
  out.nullTerm40ccd0 = exp("isaac_exit_40ccd0_null_term");
  out.copyAndTerm40ccd0 = exp("isaac_exit_40ccd0_copy_and_term");
  out.nongrowFinish40ccd0 = exp("isaac_exit_40ccd0_nongrow_finish");
  out.growPreCopy40ccd0 = exp("isaac_exit_40ccd0_grow_pre_copy");
  out.growPostFree40ccd0 = exp("isaac_exit_40ccd0_grow_post_free");
  out.plan40ccd0 = exp("isaac_exit_40ccd0_plan");
  out.countSelect408970 = exp("isaac_exit_408970_count_select");
  out.countsEqual408970 = exp("isaac_exit_408970_counts_equal");
  out.countsDiffer408970 = exp("isaac_exit_408970_counts_differ");
  out.newCountPositive408970 = exp("isaac_exit_408970_new_count_positive");
  out.copyNeeded408970 = exp("isaac_exit_408970_copy_needed");
  out.ptrNonzero408970 = exp("isaac_exit_408970_ptr_nonzero");
  out.allocSize408970 = exp("isaac_exit_408970_alloc_size");
  out.fillSize408970 = exp("isaac_exit_408970_fill_size");
  out.copySize408970 = exp("isaac_exit_408970_copy_size");
  out.fillByte408970 = exp("isaac_exit_408970_fill_byte");
  out.heapStatsBase408970 = exp("isaac_exit_408970_heap_stats_base");
  out.freeBlockPtr408970 = exp("isaac_exit_408970_free_block_ptr");
  out.storeArg408970 = exp("isaac_exit_408970_store_arg");
  out.storeArgApply408970 = exp("isaac_exit_408970_store_arg_apply");
  out.storeBufA408970 = exp("isaac_exit_408970_store_buf_a");
  out.storeBufB408970 = exp("isaac_exit_408970_store_buf_b");
  out.ptrClear408970 = exp("isaac_exit_408970_ptr_clear");
  out.storeBufAApply408970 = exp("isaac_exit_408970_store_buf_a_apply");
  out.storeBufBApply408970 = exp("isaac_exit_408970_store_buf_b_apply");
  out.clearBufAApply408970 = exp("isaac_exit_408970_clear_buf_a_apply");
  out.clearBufBApply408970 = exp("isaac_exit_408970_clear_buf_b_apply");
  out.bufferPlan408970 = exp("isaac_exit_408970_buffer_plan");
  out.plan408970 = exp("isaac_exit_408970_plan");
  out.pathSizePresent40db90 = exp("isaac_exit_40db90_path_size_present");
  out.earlyReturn40db90 = exp("isaac_exit_40db90_early_return");
  out.timingScale40db90 = exp("isaac_exit_40db90_timing_scale");
  out.timingDelta40db90 = exp("isaac_exit_40db90_timing_delta");
  out.cacheSpaceOk40db90 = exp("isaac_exit_40db90_cache_space_ok");
  out.cacheWalkDone40db90 = exp("isaac_exit_40db90_cache_walk_done");
  out.cacheWalkNext40db90 = exp("isaac_exit_40db90_cache_walk_next");
  out.treeHitSelect40db90 = exp("isaac_exit_40db90_tree_hit_select");
  out.nodeIsSentinel40db90 = exp("isaac_exit_40db90_node_is_sentinel");
  out.cacheMiss40db90 = exp("isaac_exit_40db90_cache_miss");
  out.insertNeeded40db90 = exp("isaac_exit_40db90_insert_needed");
  out.heapStatsBase40db90 = exp("isaac_exit_40db90_heap_stats_base");
  out.tempFreeNeeded40db90 = exp("isaac_exit_40db90_temp_free_needed");
  out.freeBlockPtr40db90 = exp("isaac_exit_40db90_free_block_ptr");
  out.layerArrayPresent40db90 = exp("isaac_exit_40db90_layer_array_present");
  out.oldLayerFreeSize40db90 = exp("isaac_exit_40db90_old_layer_free_size");
  out.layerCountNonzero40db90 = exp("isaac_exit_40db90_layer_count_nonzero");
  out.layerAllocSize40db90 = exp("isaac_exit_40db90_layer_alloc_size");
  out.allocOk40db90 = exp("isaac_exit_40db90_alloc_ok");
  out.userPtrAfterHeader40db90 = exp("isaac_exit_40db90_user_ptr_after_header");
  out.layerLoopNeeded40db90 = exp("isaac_exit_40db90_layer_loop_needed");
  out.srcLayerStride40db90 = exp("isaac_exit_40db90_src_layer_stride");
  out.dstLayerStride40db90 = exp("isaac_exit_40db90_dst_layer_stride");
  out.srcLayerPtr40db90 = exp("isaac_exit_40db90_src_layer_ptr");
  out.dstLayerPtr40db90 = exp("isaac_exit_40db90_dst_layer_ptr");
  out.storeLayerBackptr40db90 = exp("isaac_exit_40db90_store_layer_backptr");
  out.storeLayerBackptrAt40db90 = exp("isaac_exit_40db90_store_layer_backptr_at");
  out.nameAssignNeeded40db90 = exp("isaac_exit_40db90_name_assign_needed");
  out.fieldPack40db90 = exp("isaac_exit_40db90_field_pack");
  out.fieldPackApply40db90 = exp("isaac_exit_40db90_field_pack_apply");
  out.plan40db90 = exp("isaac_exit_40db90_plan");
  out.cacheSpaceOk40e110 = exp("isaac_exit_40e110_cache_space_ok");
  out.cacheWalkDone40e110 = exp("isaac_exit_40e110_cache_walk_done");
  out.cacheWalkNext40e110 = exp("isaac_exit_40e110_cache_walk_next");
  out.pathDataAddr40e110 = exp("isaac_exit_40e110_path_data_addr");
  out.pathBufSize40e110 = exp("isaac_exit_40e110_path_buf_size");
  out.treeHitSelect40e110 = exp("isaac_exit_40e110_tree_hit_select");
  out.nodeIsSentinel40e110 = exp("isaac_exit_40e110_node_is_sentinel");
  out.cacheHit40e110 = exp("isaac_exit_40e110_cache_hit");
  out.cacheMiss40e110 = exp("isaac_exit_40e110_cache_miss");
  out.logNeeded40e110 = exp("isaac_exit_40e110_log_needed");
  out.refcountInc40e110 = exp("isaac_exit_40e110_refcount_inc");
  out.refcountStore40e110 = exp("isaac_exit_40e110_refcount_store");
  out.refcountIncApply40e110 = exp("isaac_exit_40e110_refcount_inc_apply");
  out.growInstallNeeded40e110 = exp("isaac_exit_40e110_grow_install_needed");
  out.growResultClear40e110 = exp("isaac_exit_40e110_grow_result_clear");
  out.growResultClearAt40e110 = exp("isaac_exit_40e110_grow_result_clear_at");
  out.plan40e110 = exp("isaac_exit_40e110_plan");
  out.layerCountNonzero40c000 = exp("isaac_exit_40c000_layer_count_nonzero");
  out.loopNeeded40c000 = exp("isaac_exit_40c000_loop_needed");
  out.layerStride40c000 = exp("isaac_exit_40c000_layer_stride");
  out.layerByteOff40c000 = exp("isaac_exit_40c000_layer_byte_off");
  out.layerPtr40c000 = exp("isaac_exit_40c000_layer_ptr");
  out.layerSkip40c000 = exp("isaac_exit_40c000_layer_skip");
  out.layerBodyNeeded40c000 = exp("isaac_exit_40c000_layer_body_needed");
  out.pngStrPtr40c000 = exp("isaac_exit_40c000_png_str_ptr");
  out.pathDataAddr40c000 = exp("isaac_exit_40c000_path_data_addr");
  out.sharedPresent40c000 = exp("isaac_exit_40c000_shared_present");
  out.virtualOk40c000 = exp("isaac_exit_40c000_virtual_ok");
  out.graphicsFlag40c000 = exp("isaac_exit_40c000_graphics_flag");
  out.spritePresent40c000 = exp("isaac_exit_40c000_sprite_present");
  out.objectPresent40c000 = exp("isaac_exit_40c000_object_present");
  out.callbackNeeded40c000 = exp("isaac_exit_40c000_callback_needed");
  out.pairZero40c000 = exp("isaac_exit_40c000_pair_zero");
  out.pairAssign40c000 = exp("isaac_exit_40c000_pair_assign");
  out.pairZeroAt40c000 = exp("isaac_exit_40c000_pair_zero_at");
  out.pairAssignAt40c000 = exp("isaac_exit_40c000_pair_assign_at");
  out.storeLayerFlags40c000 = exp("isaac_exit_40c000_store_layer_flags");
  out.storeLayerFlagsAt40c000 = exp("isaac_exit_40c000_store_layer_flags_at");
  out.loopNextIndex40c000 = exp("isaac_exit_40c000_loop_next_index");
  out.loopNextOff40c000 = exp("isaac_exit_40c000_loop_next_off");
  out.init40c1e0 = exp("isaac_exit_40c1e0_init");
  out.apply40c1e0 = exp("isaac_exit_40c1e0_apply");
  out.plan40c000 = exp("isaac_exit_40c000_plan");
  out.sourcePresent408640 = exp("isaac_exit_408640_source_present");
  out.ctrlPresent408640 = exp("isaac_exit_408640_ctrl_present");
  out.virtualOk408640 = exp("isaac_exit_408640_virtual_ok");
  out.callbackNeeded408640 = exp("isaac_exit_408640_callback_needed");
  out.dstFieldPtr408640 = exp("isaac_exit_408640_dst_field_ptr");
  out.srcFieldPtr408640 = exp("isaac_exit_408640_src_field_ptr");
  out.pairSlotPtr408640 = exp("isaac_exit_408640_pair_slot_ptr");
  out.dstFieldOff408640 = exp("isaac_exit_408640_dst_field_off");
  out.srcFieldOff408640 = exp("isaac_exit_408640_src_field_off");
  out.pairSlotOff408640 = exp("isaac_exit_408640_pair_slot_off");
  out.fieldDwords408640 = exp("isaac_exit_408640_field_dwords");
  out.fieldCopy408640 = exp("isaac_exit_408640_field_copy");
  out.fieldCopyAt408640 = exp("isaac_exit_408640_field_copy_at");
  out.fieldCopyIfPresentAt408640 = exp("isaac_exit_408640_field_copy_if_present_at");
  out.plan408640 = exp("isaac_exit_408640_plan");
  // ABI v25 aliases (raw keys start with a digit)
  out.p0ElemOff841cf0 = exp("isaac_exit_841cf0_p0_elem_off");
  out.p0Elem841cf0 = exp("isaac_exit_841cf0_p0_elem");
  out.p0Apply841cf0 = exp("isaac_exit_841cf0_p0_apply");
  out.headClear841cf0 = exp("isaac_exit_841cf0_head_clear");
  out.p1ElemOff841cf0 = exp("isaac_exit_841cf0_p1_elem_off");
  out.p1HostPtr841cf0 = exp("isaac_exit_841cf0_p1_host_ptr");
  out.p1Pre841cf0 = exp("isaac_exit_841cf0_p1_pre");
  out.p1Apply841cf0 = exp("isaac_exit_841cf0_p1_apply");
  out.p2ElemOff841cf0 = exp("isaac_exit_841cf0_p2_elem_off");
  out.p2HostAPtr841cf0 = exp("isaac_exit_841cf0_p2_host_a_ptr");
  out.p2HostBPtr841cf0 = exp("isaac_exit_841cf0_p2_host_b_ptr");
  out.p2Pre841cf0 = exp("isaac_exit_841cf0_p2_pre");
  out.p2Apply841cf0 = exp("isaac_exit_841cf0_p2_apply");
  out.p2HostNeeded841cf0 = exp("isaac_exit_841cf0_p2_host_needed");
  out.vecElemHostPtr841cf0 = exp("isaac_exit_841cf0_vec_elem_host_ptr");
  out.vecNext841cf0 = exp("isaac_exit_841cf0_vec_next");
  out.vecWalkNeeded841cf0 = exp("isaac_exit_841cf0_vec_walk_needed");
  out.vecWalkContinue841cf0 = exp("isaac_exit_841cf0_vec_walk_continue");
  out.vecElemCount841cf0 = exp("isaac_exit_841cf0_vec_elem_count");
  out.vecClearEnd841cf0 = exp("isaac_exit_841cf0_vec_clear_end");
  out.word6acClear841cf0 = exp("isaac_exit_841cf0_word_6ac_clear");
  out.terminalClear841cf0 = exp("isaac_exit_841cf0_terminal_clear");
  out.pureApply841cf0 = exp("isaac_exit_841cf0_pure_apply");
  out.blockBaseOff83abb0 = exp("isaac_exit_83abb0_block_base_off");
  out.walkNeeded83abb0 = exp("isaac_exit_83abb0_walk_needed");
  out.walkContinue83abb0 = exp("isaac_exit_83abb0_walk_continue");
  out.elemHostPtr83abb0 = exp("isaac_exit_83abb0_elem_host_ptr");
  out.elemNext83abb0 = exp("isaac_exit_83abb0_elem_next");
  out.elemCount83abb0 = exp("isaac_exit_83abb0_elem_count");
  out.blockPost83abb0 = exp("isaac_exit_83abb0_block_post");
  out.terminalClear83abb0 = exp("isaac_exit_83abb0_terminal_clear");
  out.apply83abb0 = exp("isaac_exit_83abb0_apply");
  out.rdStride709380 = exp("isaac_exit_range_destroy_stride_709380");
  out.rdStride709300 = exp("isaac_exit_range_destroy_stride_709300");
  out.rdLoopNeeded = exp("isaac_exit_range_destroy_loop_needed");
  out.rdContinue = exp("isaac_exit_range_destroy_continue");
  out.rdCtrlPtr = exp("isaac_exit_range_destroy_ctrl_ptr");
  out.rdCbArgPtr = exp("isaac_exit_range_destroy_cb_arg_ptr");
  out.rdNext = exp("isaac_exit_range_destroy_next");
  out.rdCtrlPresent = exp("isaac_exit_range_destroy_ctrl_present");
  out.rdVirtualOk = exp("isaac_exit_range_destroy_virtual_ok");
  out.rdCallbackNeeded = exp("isaac_exit_range_destroy_callback_needed");
  out.slotKind84bfd0 = exp("isaac_exit_84bfd0_slot_kind");
  out.blockBaseOff84bfd0 = exp("isaac_exit_84bfd0_block_base_off");
  out.slotOff84bfd0 = exp("isaac_exit_84bfd0_slot_off");
  out.f32Bits84bfd0 = exp("isaac_exit_84bfd0_f32_bits");
  out.applyBlock84bfd0 = exp("isaac_exit_84bfd0_apply_block");
  out.apply84bfd0 = exp("isaac_exit_84bfd0_apply");
  // ABI v26 aliases
  out.slotOff840f70 = exp("isaac_exit_840f70_slot_off");
  out.slotPtr840f70 = exp("isaac_exit_840f70_slot_ptr");
  out.freeNeeded840f70 = exp("isaac_exit_840f70_free_needed");
  out.heapStatsBase840f70 = exp("isaac_exit_840f70_heap_stats_base");
  out.freeBasePtr840f70 = exp("isaac_exit_840f70_free_base_ptr");
  out.headerSizePtr840f70 = exp("isaac_exit_840f70_header_size_ptr");
  out.statsSubLo840f70 = exp("isaac_exit_840f70_stats_sub_lo");
  out.statsSubBorrow840f70 = exp("isaac_exit_840f70_stats_sub_borrow");
  out.statsSubHi840f70 = exp("isaac_exit_840f70_stats_sub_hi");
  out.statsSub840f70 = exp("isaac_exit_840f70_stats_sub");
  out.statsSubAt840f70 = exp("isaac_exit_840f70_stats_sub_at");
  out.slotClear840f70 = exp("isaac_exit_840f70_slot_clear");
  out.apply840f70 = exp("isaac_exit_840f70_apply");
  out.slotPlan840f70 = exp("isaac_exit_840f70_slot_plan");
  out.allocSize709150 = exp("isaac_exit_709150_alloc_size");
  out.allocOk709150 = exp("isaac_exit_709150_alloc_ok");
  out.newObjectValue709150 = exp("isaac_exit_709150_new_object_value");
  out.objectFinish709150 = exp("isaac_exit_709150_object_finish");
  out.objectFinishApply709150 = exp("isaac_exit_709150_object_finish_apply");
  out.oldObjectPresent709150 = exp("isaac_exit_709150_old_object_present");
  out.virtualOk709150 = exp("isaac_exit_709150_virtual_ok");
  out.callbackNeeded709150 = exp("isaac_exit_709150_callback_needed");
  out.pairApply709150 = exp("isaac_exit_709150_pair_apply");
  out.pairApplyBase709150 = exp("isaac_exit_709150_pair_apply_base");
  out.plan709150 = exp("isaac_exit_709150_plan");
  // ABI v27 aliases
  out.blockANeededA1ad90 = exp("isaac_exit_a1ad90_block_a_needed");
  out.blockAClearA1ad90 = exp("isaac_exit_a1ad90_block_a_clear");
  out.blockBNeededA1ad90 = exp("isaac_exit_a1ad90_block_b_needed");
  out.headerPtrA1ad90 = exp("isaac_exit_a1ad90_header_ptr");
  out.elemSizeA1ad90 = exp("isaac_exit_a1ad90_elem_size");
  out.elemDtorA1ad90 = exp("isaac_exit_a1ad90_elem_dtor");
  out.dtorCountArgA1ad90 = exp("isaac_exit_a1ad90_dtor_count_arg");
  out.freeSizeA1ad90 = exp("isaac_exit_a1ad90_free_size");
  out.blockBClearA1ad90 = exp("isaac_exit_a1ad90_block_b_clear");
  out.treeObjPtrA1ad90 = exp("isaac_exit_a1ad90_tree_obj_ptr");
  out.treeHeadPtrA1ad90 = exp("isaac_exit_a1ad90_tree_head_ptr");
  out.treeSizePtrA1ad90 = exp("isaac_exit_a1ad90_tree_size_ptr");
  out.treeRootPtrA1ad90 = exp("isaac_exit_a1ad90_tree_root_ptr");
  out.treeResetAtA1ad90 = exp("isaac_exit_a1ad90_tree_reset_at");
  out.treeSizeClearA1ad90 = exp("isaac_exit_a1ad90_tree_size_clear");
  out.terminalA1ad90 = exp("isaac_exit_a1ad90_terminal");
  out.applyThisA1ad90 = exp("isaac_exit_a1ad90_apply_this");
  out.planA1ad90 = exp("isaac_exit_a1ad90_plan");
  out.modeFromClA648b0 = exp("isaac_exit_a648b0_mode_from_cl");
  out.modeFreeA648b0 = exp("isaac_exit_a648b0_mode_free");
  out.mode1FreeNeededA648b0 = exp("isaac_exit_a648b0_mode1_free_needed");
  out.mode1HeaderSizePtrA648b0 = exp("isaac_exit_a648b0_mode1_header_size_ptr");
  out.mode1FreeBasePtrA648b0 = exp("isaac_exit_a648b0_mode1_free_base_ptr");
  out.heapStatsBaseA648b0 = exp("isaac_exit_a648b0_heap_stats_base");
  out.modePathA648b0 = exp("isaac_exit_a648b0_mode_path");
  out.modeStatsA648b0 = exp("isaac_exit_a648b0_mode_stats");
  out.mode2StatsBasePtrA648b0 = exp("isaac_exit_a648b0_mode2_stats_base_ptr");
  out.mode2AddendLoVaA648b0 = exp("isaac_exit_a648b0_mode2_addend_lo_va");
  out.mode2AddendHiVaA648b0 = exp("isaac_exit_a648b0_mode2_addend_hi_va");
  out.statsAddLoA648b0 = exp("isaac_exit_a648b0_stats_add_lo");
  out.statsAddCarryA648b0 = exp("isaac_exit_a648b0_stats_add_carry");
  out.statsAddHiA648b0 = exp("isaac_exit_a648b0_stats_add_hi");
  out.statsAddA648b0 = exp("isaac_exit_a648b0_stats_add");
  out.modePlanA648b0 = exp("isaac_exit_a648b0_mode_plan");
  // ABI v44 aliases
  out.va6f0040 = exp("isaac_exit_6f0040_va");
  out.bodyBytes6f0040 = exp("isaac_exit_6f0040_body_bytes");
  out.ptrOff6f0040 = exp("isaac_exit_6f0040_ptr_off");
  out.countOff6f0040 = exp("isaac_exit_6f0040_count_off");
  out.predicate6f0040 = exp("isaac_exit_6f0040_predicate");
  // ABI v45 aliases
  out.va71df80 = exp("isaac_exit_71df80_va");
  out.bodyBytes71df80 = exp("isaac_exit_71df80_body_bytes");
  out.gameDat71df80 = exp("isaac_exit_71df80_game_dat");
  out.roomOff71df80 = exp("isaac_exit_71df80_room_off");
  out.stateOff71df80 = exp("isaac_exit_71df80_state_off");
  out.stateOpen71df80 = exp("isaac_exit_71df80_state_open");
  // ABI v28 aliases
  out.entryZero40c4a0 = exp("isaac_exit_40c4a0_entry_zero");
  out.entryZeroAt40c4a0 = exp("isaac_exit_40c4a0_entry_zero_at");
  out.allocSize40c4a0 = exp("isaac_exit_40c4a0_alloc_size");
  out.allocOk40c4a0 = exp("isaac_exit_40c4a0_alloc_ok");
  out.newObjectValue40c4a0 = exp("isaac_exit_40c4a0_new_object_value");
  out.objectFinish40c4a0 = exp("isaac_exit_40c4a0_object_finish");
  out.objectFinishApply40c4a0 = exp("isaac_exit_40c4a0_object_finish_apply");
  out.oldObjectPresent40c4a0 = exp("isaac_exit_40c4a0_old_object_present");
  out.virtualOk40c4a0 = exp("isaac_exit_40c4a0_virtual_ok");
  out.callbackNeeded40c4a0 = exp("isaac_exit_40c4a0_callback_needed");
  out.pairApply40c4a0 = exp("isaac_exit_40c4a0_pair_apply");
  out.pairApplyBase40c4a0 = exp("isaac_exit_40c4a0_pair_apply_base");
  out.returnValue40c4a0 = exp("isaac_exit_40c4a0_return_value");
  out.plan40c4a0 = exp("isaac_exit_40c4a0_plan");
  out.walkContinue415800 = exp("isaac_exit_415800_walk_continue");
  out.recurseNodePtr415800 = exp("isaac_exit_415800_recurse_node_ptr");
  out.nextNodePtr415800 = exp("isaac_exit_415800_next_node_ptr");
  out.comSlotPtr415800 = exp("isaac_exit_415800_com_slot_ptr");
  out.ctrlPtr415800 = exp("isaac_exit_415800_ctrl_ptr");
  out.ctrlPresent415800 = exp("isaac_exit_415800_ctrl_present");
  out.virtualOk415800 = exp("isaac_exit_415800_virtual_ok");
  out.callbackNeeded415800 = exp("isaac_exit_415800_callback_needed");
  out.freeSize415800 = exp("isaac_exit_415800_free_size");
  out.freeOrder415800 = exp("isaac_exit_415800_free_order");
  // ABI v30 aliases
  out.mapStoreNeeded40e520 = exp("isaac_exit_40e520_map_store_needed");
  out.namePtr40e520 = exp("isaac_exit_40e520_name_ptr");
  out.defaultNameAddr40e520 = exp("isaac_exit_40e520_default_name_addr");
  out.mapGlobal40e520 = exp("isaac_exit_40e520_map_global");
  out.pairValuePtr40e520 = exp("isaac_exit_40e520_pair_value_ptr");
  out.pairCtrlPtr40e520 = exp("isaac_exit_40e520_pair_ctrl_ptr");
  out.releaseCtrlPresent40e520 = exp("isaac_exit_40e520_release_ctrl_present");
  out.virtualOk40e520 = exp("isaac_exit_40e520_virtual_ok");
  out.callbackNeeded40e520 = exp("isaac_exit_40e520_callback_needed");
  out.callbackArgPtr40e520 = exp("isaac_exit_40e520_callback_arg_ptr");
  out.plan40e520 = exp("isaac_exit_40e520_plan");
  out.oldObjectPresent7384d0 = exp("isaac_exit_7384d0_old_object_present");
  out.allocSize7384d0 = exp("isaac_exit_7384d0_alloc_size");
  out.allocOk7384d0 = exp("isaac_exit_7384d0_alloc_ok");
  out.newObjectValue7384d0 = exp("isaac_exit_7384d0_new_object_value");
  out.apply7384d0 = exp("isaac_exit_7384d0_apply");
  out.flag408310 = exp("isaac_exit_408310_flag");
  out.setArg0408310 = exp("isaac_exit_408310_set_arg0");
  out.emptyTemp408310 = exp("isaac_exit_408310_empty_temp");
  out.tempReset408310 = exp("isaac_exit_408310_temp_reset");
  out.assignNeeded408310 = exp("isaac_exit_408310_assign_needed");
  out.srcDataAddr408310 = exp("isaac_exit_408310_src_data_addr");
  out.armFreeNeeded408310 = exp("isaac_exit_408310_arm_free_needed");
  out.freePtr408310 = exp("isaac_exit_408310_free_ptr");
  out.freeCount408310 = exp("isaac_exit_408310_free_count");
  out.abortNeeded408310 = exp("isaac_exit_408310_abort_needed");
  out.field7c408310 = exp("isaac_exit_408310_field_7c");
  out.gateC798e4Addr408310 = exp("isaac_exit_408310_gate_c798e4_addr");
  out.tailApply408310 = exp("isaac_exit_408310_tail_apply");
  out.plan408310 = exp("isaac_exit_408310_plan");
  // ABI v34: the auto-camelCase key for these begins with a digit
  // ("8d26c0IsNoop"), so give them readable stable aliases.
  out.is8d26c0Noop = exp("isaac_exit_8d26c0_is_noop");
  out.elementCount8d26c0 = exp("isaac_exit_8d26c0_element_count");
  out.indexValid8d26c0 = exp("isaac_exit_8d26c0_index_valid");
  out.elementAddr8d26c0 = exp("isaac_exit_8d26c0_element_addr");
  out.subCount8d26c0 = exp("isaac_exit_8d26c0_sub_count");
  out.stepBits8d26c0 = exp("isaac_exit_8d26c0_step_bits");
  out.frameFrom8d26c0 = exp("isaac_exit_8d26c0_frame_from");
  out.plan8d26c0 = exp("isaac_exit_8d26c0_plan");
  out.apply8d26c0 = exp("isaac_exit_8d26c0_apply");
  out.root8d26c0HostNeeded = exp("isaac_exit_root_8d26c0_host_needed");
  return out;
}

function writeI32(view, offset, value) {
  view.setInt32(offset, value | 0, true);
}
function writeU32(view, offset, value) {
  view.setUint32(offset, value >>> 0, true);
}
function writeF32(view, offset, value) {
  view.setFloat32(offset, Math.fround(value), true);
}
function writeU8(view, offset, value) {
  view.setUint8(offset, value & 0xff);
}
function writeU16(view, offset, value) {
  view.setUint16(offset, value & 0xffff, true);
}
function readI32(view, offset) {
  return view.getInt32(offset, true);
}
function readU32(view, offset) {
  return view.getUint32(offset, true);
}
function readF32(view, offset) {
  return view.getFloat32(offset, true);
}
function readU8(view, offset) {
  return view.getUint8(offset);
}
function readU16(view, offset) {
  return view.getUint16(offset, true);
}
function f32Bits(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

// IsaacExitPureTeardownState layout (C++20 default alignment)
const TEARDOWN = {
  field2510c: 0,
  field2593c: 4,
  field25948: 8,
  field2590c: 12,
  gate1d520: 16,
  gate1d654: 20,
  skipTimed: 24,
  size: 28,
};

// IsaacExitPostLogPureState
const POSTLOG = {
  field1bb70: 0,
  gate1ba78: 4,
  field1ba7c: 8,
  field1ba84: 12,
  field1ba88: 16,
  field1ba90: 20,
  field1ba94: 24,
  field1ba80: 28,
  field1b840: 32,
  field1b848: 36,
  gate1b83c: 40,
  field1b84c: 44,
  field1b858: 48,
  field1b85c: 52,
  field1b860: 56,
  field1bb74: 60,
  field26548: 64,
  field2654c: 68,
  size: 72,
};

// IsaacExit6f4520EffectSlot = 12 bytes (int,int,u8 + pad to 4)
const SLOT = 12;
// IsaacExit6f4520State â€” walk layout carefully
function layout6f4520() {
  let o = 0;
  const L = {};
  const i32 = (n) => { L[n] = o; o += 4; };
  const u8 = (n) => { L[n] = o; o += 1; };
  const u16 = (n) => { L[n] = o; o += 2; };
  const f32 = (n) => { L[n] = o; o += 4; };
  const align = (a) => { o = Math.ceil(o / a) * a; };
  i32("field26554"); i32("field26558"); i32("field2655c"); i32("field26560");
  i32("field26564"); i32("field26568"); i32("field2656c"); i32("field26570");
  i32("field269c0");
  u8("field26540"); align(4);
  i32("field2657c"); i32("field26528"); i32("field2652c"); f32("field26530");
  i32("field2653c"); i32("field26538"); i32("counter265c0");
  i32("field26548"); i32("field2654c"); i32("counter67788");
  L.effectSlots = o;
  o += SLOT * EXIT_6F4520_EFFECT_SLOT_COUNT;
  i32("field68d6c"); i32("fade26514"); i32("fade26518"); i32("field2651c");
  i32("field269c4"); i32("field26774"); i32("field269cc");
  i32("field269d4"); i32("field269d8");
  u16("field269ea"); align(4);
  i32("field676ac"); i32("field676b0");
  u8("field269ec"); u8("field4704c"); u8("field68d70"); align(4);
  i32("field26578"); i32("field26574");
  L.size = o;
  return L;
}
const L4520 = layout6f4520();

const PREFIX = {
  field26588: 0,
  field264f8: 4,
  field264fc: 8,
  field26508: 12,
  size: 16,
};

// Mid: i32 + 4*i32 + i32 + 4*i32 + ...
const MID = (() => {
  let o = 0;
  const L = {};
  const i32 = (n) => { L[n] = o; o += 4; };
  const u8 = (n) => { L[n] = o; o += 1; };
  const align = (a) => { o = Math.ceil(o / a) * a; };
  i32("field264f4");
  L.zero16_2658c = o; o += 16;
  i32("field26544");
  L.zero16_265a4 = o; o += 16;
  i32("field26550"); i32("field2659c"); i32("field265b4"); i32("field265bc");
  u8("field265c4"); align(4);
  i32("counter265c0"); i32("field26630"); i32("field26634"); i32("field2663c");
  u8("field26638"); align(4);
  L.size = o;
  return L;
})();

const TAIL = (() => {
  let o = 0;
  const L = {};
  const i32 = (n) => { L[n] = o; o += 4; };
  const u8 = (n) => { L[n] = o; o += 1; };
  const f32 = (n) => { L[n] = o; o += 4; };
  const align = (a) => { o = Math.ceil(o / a) * a; };
  L.pack676b8 = o; o += 16;
  i32("field269e4"); i32("field269e0");
  u8("field269e9"); u8("field676b4"); align(4);
  f32("field676c8"); f32("field676cc");
  i32("field6774c"); i32("field67734"); i32("field67738"); i32("field6773c");
  f32("field67740");
  u8("field67744"); align(4);
  i32("field67748"); i32("field67750");
  u8("field68d70"); align(4);
  L.size = o;
  return L;
})();

// IsaacExit9b5cb0PrefixState: i32,i32,i32,i32,u8 (+ pad)
const PREFIX9B = {
  menuState0: 0,
  field8: 4,
  field24: 8,
  field28: 12,
  field1454: 16,
  size: 20,
};

// IsaacExit8d3250P0State: u8 + pad3 + 4Ã—i32
const P0_8D = {
  field10: 0,
  field14: 4,
  field30: 8,
  field34: 12,
  field38: 16,
  size: 20,
};

// IsaacExit8d3250P3State: 5Ã—i32
const P3_8D = {
  field178: 0,
  field17c: 4,
  field180: 8,
  field648: 12,
  field64c: 16,
  size: 20,
};

// IsaacExit8d3250P4State: 5Ã—i32
const P4_8D = {
  field18: 0,
  field1c: 4,
  field24: 8,
  field28: 12,
  field2c: 16,
  size: 20,
};

// IsaacExit9b9150P0State: 2Ã—i32
const P0_9B9150 = {
  fieldC8: 0,
  fieldCc: 4,
  size: 8,
};

// IsaacExit9a19a0PrefixState (C++20 default alignment)
const PREFIX_9A19A0 = {
  field5490: 0,  // float
  field5494: 4,  // int32
  field5498: 8,  // int32
  field549c: 12, // uint8 + pad
  field54d0: 16, // int32
  field54d4: 20, // uint8 + pad
  field54d8: 24, // int32
  size: 28,
};

// IsaacExit9b9150MidState: i32 + u8 (+ pad)
const MID_9B9150 = {
  field7c: 0,
  field5c: 4,
  size: 8,
};

// IsaacExit9b9150TailState: 4Ã—i32
const TAIL_9B9150 = {
  fields: 0,
  size: 16,
};

// IsaacExitLowerBoundTriple: 3Ã—u32
const LB_TRIPLE = {
  walk: 0,
  bound: 4,
  best: 8,
  size: 12,
};

test("header declares exit pure helpers ABI v48 and tracked paths exist", () => {
  assert.equal(EXIT_PURE_ABI_VERSION, HEADER_ABI_VERSION);
  assert.ok(existsSync(header));
  assert.ok(existsSync(source));
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_EXIT_PURE_HELPERS_ABI_VERSION = 48/);
  // ABI v36: complete body of 0x007df690 (7-slot volume setter).
  assert.match(h, /ISAAC_EXIT_7DF690_SLOT_COUNT = 7,/);
  assert.match(h, /ISAAC_EXIT_7DF690_SLOT_STRIDE = 0x34,/);
  assert.match(h, /ISAAC_EXIT_7DF690_FLOAT_OFF = 0x14,/);
  assert.match(h, /ISAAC_EXIT_7DF690_GATE_VTBL_OFF = 0x28,/);
  assert.match(h, /ISAAC_EXIT_7DF690_SET_VTBL_OFF = 0x58/);
  assert.match(h, /IsaacExit7df690Plan \{/);
  assert.match(h, /isaac_exit_7df690_slot_count\(/);
  assert.match(h, /isaac_exit_7df690_slot_addr\(/);
  assert.match(h, /isaac_exit_7df690_float_off\(/);
  assert.match(h, /isaac_exit_7df690_gate_vtbl_off\(/);
  assert.match(h, /isaac_exit_7df690_set_vtbl_off\(/);
  assert.match(h, /isaac_exit_7df690_slot_obj_present\(/);
  assert.match(h, /isaac_exit_7df690_apply\(/);
  assert.match(h, /isaac_exit_7df690_plan\(/);
  assert.match(h, /obj1 = \[s\] RE-READ/);
  assert.match(h, /FULL-dword presence test/);
  // ABI v37: Exit-root prologue 0x008650a0.
  assert.match(h, /ISAAC_EXIT_8650A0_VA = 0x008650a0u,/);
  assert.match(h, /ISAAC_EXIT_8650A0_BODY_BYTES = 217,/);
  assert.match(h, /ISAAC_EXIT_8650A0_FLAG_MASK = 0x20000u,/);
  assert.match(h, /ISAAC_EXIT_8650A0_PACK_ARG1 = 0x11,/);
  assert.match(h, /ISAAC_EXIT_8650A0_PACK_ARG2 = 0xffffffffu,/);
  assert.match(h, /ISAAC_EXIT_8650A0_UNREF_IAT = 0x00b1831cu,/);
  assert.match(h, /ISAAC_EXIT_8650A0_HOST_874A10_VA = 0x00874a10u,/);
  assert.match(h, /IsaacExit8650a0Plan \{/);
  assert.match(h, /isaac_exit_8650a0_flag_open\(/);
  assert.match(h, /isaac_exit_8650a0_host_needed\(/);
  assert.match(h, /isaac_exit_8650a0_holder_addr\(/);
  assert.match(h, /isaac_exit_8650a0_pack_apply\(/);
  assert.match(h, /isaac_exit_8650a0_plan\(/);
  assert.match(h, /test dword ptr \[eax\], 0x20000/);
  // ABI v38: Exit nest 0x00686950 pure field pack around host I/O.
  assert.match(h, /ISAAC_EXIT_686950_VA = 0x00686950u,/);
  assert.match(h, /ISAAC_EXIT_686950_BODY_BYTES = 384,/);
  assert.match(h, /ISAAC_EXIT_686950_WINDOW_BYTES = 1075,/);
  assert.match(h, /ISAAC_EXIT_686950_THIS_FROM_GAME = 0x68d78,/);
  assert.match(h, /ISAAC_EXIT_686950_STATE_VALUE = 4,/);
  assert.match(h, /ISAAC_EXIT_686950_MGR_FLAG_OFF = 0x4abc7,/);
  assert.match(h, /ISAAC_EXIT_686950_SPRINTF_VA = 0x0041e420u,/);
  assert.match(h, /ISAAC_EXIT_686950_REMOVE_IAT = 0x00b187ccu,/);
  assert.match(h, /IsaacExit686950Plan \{/);
  assert.match(h, /isaac_exit_686950_entry_open\(/);
  assert.match(h, /isaac_exit_686950_io_open\(/);
  assert.match(h, /isaac_exit_686950_host_needed\(/);
  assert.match(h, /isaac_exit_686950_pack_apply\(/);
  assert.match(h, /isaac_exit_686950_plan\(/);
  assert.match(h, /UNSIGNED/);
  // ABI v39: GameState write 0x00958ed0 pure islands around host I/O.
  assert.match(h, /ISAAC_EXIT_958ED0_VA = 0x00958ed0u,/);
  assert.match(h, /ISAAC_EXIT_958ED0_BODY_BYTES = 600,/);
  assert.match(h, /ISAAC_EXIT_958ED0_STATE8_VALUE = 2,/);
  assert.match(h, /ISAAC_EXIT_958ED0_FLAG_20DCC_OFF = 0x20dcc,/);
  assert.match(h, /ISAAC_EXIT_958ED0_STEAM_IAT = 0x00b18a1cu,/);
  assert.match(h, /ISAAC_EXIT_958ED0_FILENO_IAT = 0x00b18920u,/);
  assert.match(h, /ISAAC_EXIT_958ED0_PGD_VA = 0x009292c0u,/);
  assert.match(h, /IsaacExit958ed0Plan \{/);
  assert.match(h, /isaac_exit_958ed0_entry_open\(/);
  assert.match(h, /isaac_exit_958ed0_count_ok\(/);
  assert.match(h, /isaac_exit_958ed0_challenge_ok\(/);
  assert.match(h, /isaac_exit_958ed0_prefix_apply\(/);
  assert.match(h, /isaac_exit_958ed0_plan\(/);
  assert.match(h, /FULL-dword equality/);
  assert.match(h, /SIGNED/);
  // ABI v43: host 0x00a648b0 body decision laws.
  assert.match(h, /ISAAC_EXIT_A648B0_MODE_STATS = 2,/);
  assert.match(h, /ISAAC_EXIT_A648B0_MODE2_BASE_OFF = 0x30,/);
  assert.match(h, /ISAAC_EXIT_A648B0_MODE2_ADDEND_LO_VA = 0x00c7f618u,/);
  assert.match(h, /ISAAC_EXIT_A648B0_MODE2_ADDEND_HI_VA = 0x00c7f61cu,/);
  assert.match(h, /isaac_exit_a648b0_mode_path\(/);
  assert.match(h, /isaac_exit_a648b0_mode_plan\(/);
  // ABI v44: pure band-scan predicate 0x006f0040.
  assert.match(h, /ISAAC_EXIT_6F0040_VA = 0x006f0040u,/);
  assert.match(h, /ISAAC_EXIT_6F0040_BODY_BYTES = 0x27,/);
  assert.match(h, /ISAAC_EXIT_6F0040_PTR_OFF = 0x1e68,/);
  assert.match(h, /ISAAC_EXIT_6F0040_COUNT_OFF = 0x161c,/);
  assert.match(h, /ISAAC_EXIT_6F0040_INVALID_COUNT = 0xffffffffu,/);
  assert.match(h, /isaac_exit_6f0040_va\(/);
  assert.match(h, /isaac_exit_6f0040_body_bytes\(/);
  assert.match(h, /isaac_exit_6f0040_ptr_off\(/);
  assert.match(h, /isaac_exit_6f0040_count_off\(/);
  assert.match(h, /isaac_exit_6f0040_predicate\(/);
  assert.match(h, /SIGNED jge/);
  assert.match(h, /All gates FULL-dword/);
  // ABI v45: pure band re-scan predicate 0x0071df80.
  assert.match(h, /ISAAC_EXIT_71DF80_VA = 0x0071df80u,/);
  assert.match(h, /ISAAC_EXIT_71DF80_BODY_BYTES = 0x40,/);
  assert.match(h, /ISAAC_EXIT_71DF80_GAME_DAT = 0x00c71678u,/);
  assert.match(h, /ISAAC_EXIT_71DF80_ROOM_OFF = 0x18300,/);
  assert.match(h, /ISAAC_EXIT_71DF80_STATE_OFF = 0x1d18,/);
  assert.match(h, /ISAAC_EXIT_71DF80_CALLERS = 2,/);
  assert.match(h, /isaac_exit_71df80_va\(/);
  assert.match(h, /isaac_exit_71df80_body_bytes\(/);
  assert.match(h, /isaac_exit_71df80_game_dat\(/);
  assert.match(h, /isaac_exit_71df80_room_off\(/);
  assert.match(h, /isaac_exit_71df80_state_off\(/);
  assert.match(h, /isaac_exit_71df80_state_open\(/);
  assert.match(h, /All eight gates FULL-dword cmp eax, imm/);
  assert.match(h, /No byte-narrowed input anywhere/);
  // ABI v46: write-tail ledger closes with the two capture-driven gates.
  assert.match(h, /ISAAC_EXIT_958ED0_FILENAME_SIZE_OFF = 0x1fdbc,/);
  assert.match(h, /ISAAC_EXIT_958ED0_IO_PTR_OFF = 0x1fe24,/);
  assert.match(h, /isaac_exit_958ed0_local_filename_present\(/);
  assert.match(h, /isaac_exit_958ed0_io_dtor_needed\(/);
  assert.match(h, /cmp dword \[gs\+0x1fdbc\], 0 ; jne fopen/);
  // ABI v48: frozen alloc tidy contract consumed at the Exit root site.
  assert.match(h, /ISAAC_EXIT_PURE_HELPERS_ABI_VERSION = 48/);
  assert.match(h, /ISAAC_EXIT_TIDY_VA = 0x0040d040u,/);
  assert.match(h, /ISAAC_EXIT_TIDY_SSO_CAP = 0x10,/);
  assert.match(h, /ISAAC_EXIT_TIDY_REACH_E8 = 1288,/);
  assert.match(h, /ISAAC_EXIT_TIDY_REACH_JMP_TAILS = 33,/);
  assert.match(h, /ISAAC_EXIT_TIDY_REACH_TOTAL = 1321,/);
  assert.match(h, /ISAAC_EXIT_TIDY_ROOT_SITE_VA = 0x006fa293u,/);
  assert.match(h, /ISAAC_EXIT_TIDY_ROOT_ELEM_CAP_OFF = 0x1c,/);
  assert.match(h, /isaac_exit_tidy_release_needed\(/);
  assert.match(h, /isaac_exit_tidy_size_arg\(/);
  assert.match(h, /isaac_exit_tidy_va\(/);
  assert.match(h, /isaac_exit_tidy_root_site_va\(/);
  assert.match(h, /isaac_exit_tidy_root_elem_cap_off\(/);
  assert.match(h, /UNSIGNED full-dword compare/);
  assert.match(h, /uint32_t throughout/);
  // ABI v40: GameState delete 0x00959130 (sibling of the v39 write).
  assert.match(h, /ISAAC_EXIT_959130_VA = 0x00959130u,/);
  assert.match(h, /ISAAC_EXIT_959130_BODY_BYTES = 75,/);
  assert.match(h, /ISAAC_EXIT_959130_GAMESTATE_OFF = 0xfa4,/);
  assert.match(h, /ISAAC_EXIT_959130_FLAG_4B284_OFF = 0x4b284,/);
  assert.match(h, /ISAAC_EXIT_959130_DELETE_VA = 0x009c8350u/);
  assert.match(h, /IsaacExit959130Plan \{/);
  assert.match(h, /isaac_exit_959130_entry_open\(/);
  assert.match(h, /isaac_exit_959130_vec_empty\(/);
  assert.match(h, /isaac_exit_959130_prefix_open\(/);
  assert.match(h, /isaac_exit_959130_delete_apply\(/);
  assert.match(h, /isaac_exit_959130_plan\(/);
  assert.match(h, /UNSIGNED/);
  // ABI v35: Game::Exit map walk continuation (PE 0x006fa457-0x006fa50a).
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_EVENT_CAP = 64,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_NODE_CAP = 64,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST = 5,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST = 6,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR = 8,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_ELEM_HOST_VA = 0x0040c7f0u,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_GLOBAL_VA = 0x0040e910u,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_FIND_VA = 0x0069d690u,/);
  assert.match(h, /isaac_exit_root_map_walk_plan\(/);
  assert.match(h, /isaac_exit_root_map_walk_flag_active\(/);
  assert.match(h, /IsaacExitRootMapWalkPlan \{/);
  assert.match(h, /the found value used for the flag clear is the/);
  assert.match(h, /post-host RE-READ/);
  // ABI v33: Game::Exit root typed continuation plan.
  assert.match(h, /isaac_exit_root_plan\(/);
  assert.match(h, /isaac_exit_root_7df690_receiver\(/);
  assert.match(h, /isaac_exit_root_anm2_reset_count\(/);
  assert.match(h, /isaac_exit_root_anm2_reset_this_off_at\(/);
  assert.match(h, /ISAAC_EXIT_ROOT_ANM2_RESET_COUNT = 3/);
  assert.match(h, /ISAAC_EXIT_ROOT_STEAM_CTX_IAT = 0x00b18a1cu/);
  assert.match(h, /FULL-dword steam ctx/);
  assert.match(h, /ISAAC_EXIT_ROOT_EVENT_CAP/);
  assert.match(h, /LOW-BYTE test on Game\+0x2658a/);
  // ABI v32 constants — pinned as literals, because a header-only constant
  // is invisible to the Wasm differential.
  assert.match(h, /ISAAC_EXIT_7384D0_OBJ_OFF = 0x18300,/);
  assert.match(h, /ISAAC_EXIT_7384D0_ALLOC_SIZE = 0x7898,/);
  assert.match(h, /ISAAC_EXIT_7384D0_MEMSET_BASE_OFF = 0x18338,/);
  assert.match(h, /ISAAC_EXIT_7384D0_MEMSET_SIZE = 0x30,/);
  assert.match(h, /ISAAC_EXIT_7384D0_182D0_VALUE = 0xffffffffu/);
  assert.match(h, /isaac_exit_7384d0_new_object_value/);
  assert.match(h, /isaac_exit_7384d0_apply/);
  assert.match(h, /ISAAC_EXIT_408310_STR_OFF = 8,/);
  assert.match(h, /ISAAC_EXIT_408310_STR_CAP_OFF = 0x14,/);
  assert.match(h, /ISAAC_EXIT_408310_TEMP_CTOR_FLAG = 1,/);
  assert.match(h, /ISAAC_EXIT_408310_TEMP_EMPTY_FLAG = 2,/);
  assert.match(h, /ISAAC_EXIT_408310_INVALID_PARAM_IAT = 0x00b18894u,/);
  assert.match(h, /ISAAC_EXIT_408310_GATE_C798E4_ADDR = 0x00c798e4u,/);
  assert.match(h, /ISAAC_EXIT_408310_FIELD_7C_CLEAR_VALUE = 6,/);
  assert.match(h, /ISAAC_EXIT_408310_F32_ONE_BITS = 0x3f800000u,/);
  assert.match(h, /isaac_exit_408310_tail_apply/);
  assert.match(h, /isaac_exit_408310_plan/);
  // The [this+8]-not-cleared quirk must stay documented.
  assert.match(h, /\[this\+8\] is deliberately NOT touched/);
  // ABI v30 constants â€” pinned as literals, because a header-only constant
  // is invisible to the Wasm differential.
  assert.match(h, /ISAAC_EXIT_40E520_PAIR_VALUE_OFF = 0,/);
  assert.match(h, /ISAAC_EXIT_40E520_PAIR_CTRL_OFF = 4,/);
  assert.match(h, /ISAAC_EXIT_40E520_NAME_PRIMARY_OFF = 0x44,/);
  assert.match(h, /ISAAC_EXIT_40E520_NAME_FALLBACK_OFF = 0x40,/);
  assert.match(h, /ISAAC_EXIT_40E520_RELEASE_VTABLE_OFF = 0xc,/);
  assert.match(h, /ISAAC_EXIT_40E520_DEFAULT_NAME_ADDR = 0x00b65788u,/);
  assert.match(h, /ISAAC_EXIT_40E520_MAP_GLOBAL = 0x00c78ee8u,/);
  assert.match(h, /ISAAC_EXIT_40E520_CALLBACK_GLOBAL = 0x00c7163cu,/);
  assert.match(h, /ISAAC_EXIT_A159D0_HASH_INIT = 0x1505u,/);
  assert.match(h, /ISAAC_EXIT_A159D0_HASH_SHIFT = 5,/);
  assert.match(h, /ISAAC_EXIT_A159D0_NULL_HASH = 0u,/);
  assert.match(h, /ISAAC_EXIT_A159D0_UPPER_LO = 0x41u,/);
  assert.match(h, /ISAAC_EXIT_A159D0_UPPER_SPAN = 0x19u,/);
  assert.match(h, /ISAAC_EXIT_A159D0_LOWER_DELTA = 0x20u,/);
  assert.match(h, /ISAAC_EXIT_A159D0_BACKSLASH = 0x5cu,/);
  assert.match(h, /ISAAC_EXIT_A159D0_SLASH = 0x2fu,/);
  assert.match(h, /ISAAC_EXIT_A159D0_HOST_VA = 0x00a159d0u,/);
  assert.match(h, /isaac_exit_40e520_plan/);
  // The recapture requirement must stay documented on the 0x0040e520 gate.
  assert.match(h, /RECAPTURED control word/);
  // 0x0040e520's callback global is the same one the sibling walks use.
  assert.equal(EXIT_40E520_CALLBACK_GLOBAL, EXIT_408640_CALLBACK_GLOBAL);
  assert.equal(EXIT_40E520_CALLBACK_GLOBAL, EXIT_RANGE_DESTROY_CALLBACK_GLOBAL);
  // ABI v29: no byte-wide scalar parameter may survive in this family.
  // A `uint8_t` parameter lets -O2 delete the in-body mask (the Wasm ABI
  // never narrows an i32 argument), so a helper modelling `test al,al`
  // silently reads the full word above 0xff. Every such parameter must be
  // uint32_t and re-narrowed explicitly in the body.
  {
    const decls = h.match(/\buint8_t\s+[A-Za-z_][A-Za-z_0-9]*\s*[,)]/g) || [];
    assert.deepEqual(
      decls,
      [],
      `byte-wide scalar parameters must be widened to uint32_t: ${decls.join(", ")}`,
    );
    const src = readFileSync(source, "utf8");
    const defs = src.match(/\buint8_t\s+[A-Za-z_][A-Za-z_0-9]*\s*[,)]/g) || [];
    assert.deepEqual(defs, [], `byte-wide parameters in .cpp: ${defs.join(", ")}`);
    // ...and the narrowing must actually be present.
    assert.ok(
      (src.match(/static_cast<uint8_t>\([a-z_0-9]+_in & 0xffu\)/g) || []).length >= 58,
      "expected >=58 explicit re-narrowings in the .cpp",
    );
  }
  assert.match(h, /isaac_exit_pure_field_teardown/);
  assert.match(h, /isaac_exit_postlog_pure_fields/);
  assert.match(h, /isaac_exit_6f4520_apply/);
  assert.match(h, /isaac_exit_residual_18990_apply/);
  assert.match(h, /isaac_exit_frame_mode_pair_clear/);
  assert.match(h, /isaac_exit_9b5cb0_prefix/);
  assert.match(h, /isaac_exit_9b5cb0_prefix_ptrs/);
  assert.match(h, /ISAAC_EXIT_9B5CB0_FIELD_8_VALUE = 2/);
  assert.match(h, /isaac_exit_8d3250_p0/);
  assert.match(h, /isaac_exit_8d3250_p3/);
  assert.match(h, /isaac_exit_8d3250_p4/);
  assert.match(h, /isaac_exit_8d3250_cursor_layer_host_needed/);
  assert.match(h, /isaac_exit_8d3250_list_empty/);
  assert.match(h, /ISAAC_EXIT_8D3250_THIS_FROM_GAME = 0x242ac/);
  assert.match(h, /isaac_exit_8d3250_cursor_va/);
  assert.match(h, /isaac_exit_8d3250_getlayer_receiver_off/);
  assert.match(h, /isaac_exit_8d3250_layer_clear_off/);
  assert.match(h, /isaac_exit_8d3250_reset_receiver_off/);
  assert.match(h, /isaac_exit_8d3250_list_sentinel_off/);
  assert.match(h, /isaac_exit_8d3250_list_header_off/);
  assert.match(h, /isaac_exit_8d3250_list_destroy_arg1_ptr/);
  assert.match(h, /isaac_exit_8d3250_list_destroy_arg2/);
  assert.match(h, /isaac_exit_8d3250_host_plan/);
  assert.match(h, /IsaacExit8d3250HostPlan/);
  assert.match(h, /ISAAC_EXIT_8D3250_CURSOR_VA = 0xb75734u/);
  assert.match(h, /ISAAC_EXIT_8D3250_LAYER_CLEAR_OFF = 0x74/);
  assert.match(h, /ISAAC_EXIT_8D3250_LIST_ARG1_OFF = 4/);
  assert.match(h, /isaac_exit_9b9150_p0/);
  assert.match(h, /isaac_exit_9b9150_player_list_host_needed/);
  assert.match(h, /isaac_exit_9b9150_extra_list_count/);
  assert.match(h, /isaac_exit_9b9150_esau_slots_clear/);
  assert.match(h, /isaac_exit_9b9150_mid/);
  assert.match(h, /isaac_exit_9b9150_tail/);
  assert.match(h, /ISAAC_EXIT_9B9150_THIS_FROM_GAME = 0x1baa8/);
  assert.match(h, /isaac_exit_9a27d0_slot_flag_clear/);
  assert.match(h, /isaac_exit_9a27d0_slot_flags_clear_packed/);
  assert.match(h, /isaac_exit_9a27d0_slot_flags_apply/);
  assert.match(h, /isaac_exit_9a27d0_slot_flag_off/);
  assert.match(h, /isaac_exit_9a27d0_field_54cd_clear/);
  assert.match(h, /isaac_exit_9a27d0_slot_triple_base_off/);
  assert.match(h, /isaac_exit_9a27d0_slot_reset_off/);
  assert.match(h, /isaac_exit_9a27d0_slot_709150_off/);
  assert.match(h, /isaac_exit_9a27d0_slot_709150_arg/);
  assert.match(h, /isaac_exit_9a27d0_slot_loop_segment/);
  assert.match(h, /isaac_exit_9a27d0_slot_loop1_count/);
  assert.match(h, /isaac_exit_9a27d0_slot_loop2_count/);
  assert.match(h, /isaac_exit_9a27d0_slot_loop1_start_off/);
  assert.match(h, /isaac_exit_9a27d0_slot_loop2_start_off/);
  assert.match(h, /isaac_exit_9a27d0_slot_plan/);
  assert.match(h, /IsaacExit9a27d0SlotPlan/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_709150_BASE_OFF = 0x3cf4/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_RESET_BASE_OFF = 0x3cfc/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_LOOP1_COUNT = 6/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_LOOP2_COUNT = 4/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_LOOP1_START_ESI = 0x3ee8/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_LOOP2_START_ESI = 0x4aa0/);
  assert.match(h, /ISAAC_EXIT_9A27D0_THIS_FROM_GAME = 0x1da04/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT = 11/);
  assert.match(h, /isaac_exit_9a19a0_prefix/);
  assert.match(h, /isaac_exit_9a19a0_prefix_ptrs/);
  assert.match(h, /isaac_exit_9a19a0_slot_setup/);
  assert.match(h, /isaac_exit_9a19a0_slots_apply/);
  assert.match(h, /isaac_exit_9a19a0_slot_base_off/);
  assert.match(h, /isaac_exit_9a19a0_field_54cc_set/);
  assert.match(h, /ISAAC_EXIT_9A19A0_THIS_FROM_GAME = 0x1da04/);
  assert.match(h, /ISAAC_EXIT_9A19A0_F32_5490_BITS = 0xbf800000/);
  assert.match(h, /ISAAC_EXIT_9A19A0_PLAYERHUD_LOOP_COUNT = 8/);
  assert.match(h, /isaac_exit_40e910_list_host_needed/);
  assert.match(h, /isaac_exit_40e910_node_object_present/);
  assert.match(h, /isaac_exit_40e910_free_after_com_needed/);
  assert.match(h, /isaac_exit_40e910_post_erase_dtor_needed/);
  assert.match(h, /isaac_exit_40e910_post_erase_callback_needed/);
  assert.match(h, /isaac_exit_40e910_free_size/);
  assert.match(h, /isaac_exit_40e910_walk_continue/);
  assert.match(h, /isaac_exit_40e910_com_iface_addr/);
  assert.match(h, /isaac_exit_40e910_com_release_arg/);
  assert.match(h, /isaac_exit_40e910_com_state_word/);
  assert.match(h, /isaac_exit_tree_iterator_next/);
  assert.match(h, /ISAAC_EXIT_40E910_NODE_SIZE = 0x1c/);
  assert.match(h, /ISAAC_EXIT_40E910_COM_FREE_WORD_MAX = 2/);
  assert.match(h, /ISAAC_EXIT_TREE_ISNIL_OFF = 0xd/);
  assert.match(h, /isaac_exit_map_1a738_walk_needed/);
  assert.match(h, /isaac_exit_map_1a738_lookup_hit/);
  assert.match(h, /isaac_exit_map_1a738_flag_active/);
  assert.match(h, /isaac_exit_map_1a738_elem_range_nonempty/);
  assert.match(h, /isaac_exit_map_1a738_elem_walk_needed/);
  assert.match(h, /isaac_exit_map_1a738_elem_stride/);
  assert.match(h, /isaac_exit_map_1a738_elem_host_off/);
  assert.match(h, /isaac_exit_msvc_string_sso_inline/);
  assert.match(h, /isaac_exit_msvc_string_data_addr/);
  assert.match(h, /isaac_exit_string_compare/);
  assert.match(h, /isaac_exit_69d690_candidate_isnil/);
  assert.match(h, /isaac_exit_69d690_cmp_is_hit/);
  assert.match(h, /isaac_exit_69d690_select_result/);
  assert.match(h, /ISAAC_EXIT_MAP_1A738_OFF = 0x1a738/);
  assert.match(h, /ISAAC_EXIT_MAP_ELEM_STRIDE = 0x20/);
  assert.match(h, /ISAAC_EXIT_MSVC_STRING_SSO_CAP = 0x10/);
  assert.match(h, /isaac_exit_685bc0_init_triple/);
  assert.match(h, /isaac_exit_685bc0_root_is_empty/);
  assert.match(h, /isaac_exit_685bc0_cmp_go_right/);
  assert.match(h, /isaac_exit_685bc0_step/);
  assert.match(h, /isaac_exit_685bc0_loop_continue/);
  assert.match(h, /isaac_exit_map_lower_bound/);
  assert.match(h, /isaac_exit_map_find_69d690/);
  assert.match(h, /ISAAC_EXIT_LOWER_BOUND_TRIPLE_SIZE = 12/);
  assert.match(h, /ISAAC_EXIT_MAP_ROOT_FROM_SENTINEL_OFF = 4/);
  assert.match(h, /isaac_exit_40c7f0_alloc_size/);
  assert.match(h, /isaac_exit_40c7f0_alloc_ok/);
  assert.match(h, /isaac_exit_40c7f0_old_object_present/);
  assert.match(h, /isaac_exit_40c7f0_callback_needed/);
  assert.match(h, /isaac_exit_40c7f0_object_finish/);
  assert.match(h, /isaac_exit_40c7f0_object_finish_apply/);
  assert.match(h, /isaac_exit_40c7f0_pair_apply/);
  assert.match(h, /isaac_exit_40c7f0_pair_apply_base/);
  assert.match(h, /isaac_exit_40cc10_pure_fields/);
  assert.match(h, /isaac_exit_40cc10_pure_fields_ptrs/);
  assert.match(h, /isaac_exit_40cc10_apply/);
  assert.match(h, /isaac_exit_40cc10_default_init_is_direct/);
  assert.match(h, /isaac_exit_40cc10_default_init_va/);
  assert.match(h, /isaac_exit_40c7f0_vtable/);
  assert.match(h, /ISAAC_EXIT_40C7F0_ALLOC_SIZE = 0x18/);
  assert.match(h, /ISAAC_EXIT_40C7F0_VTABLE = 0x00b1a6e0/);
  assert.match(h, /ISAAC_EXIT_40CC10_VTABLE = 0x00b1a6fc/);
  assert.match(h, /ISAAC_EXIT_40CC10_DEFAULT_INIT = 0x00a15770/);
  assert.match(h, /isaac_exit_408830_store_arg/);
  assert.match(h, /isaac_exit_408830_ptr_free_needed/);
  assert.match(h, /isaac_exit_408830_alloc_size/);
  assert.match(h, /isaac_exit_408830_fill_size/);
  assert.match(h, /isaac_exit_408830_tail/);
  assert.match(h, /isaac_exit_408830_tail_apply/);
  assert.match(h, /ISAAC_EXIT_408830_F32_10_BITS = 0xbf800000/);
  assert.match(h, /ISAAC_EXIT_408830_FILL_BYTE = 0xff/);
  assert.match(h, /ISAAC_EXIT_408830_ELEM_SIZE = 4/);
  assert.match(h, /isaac_exit_9b4810_vec_reset_end/);
  assert.match(h, /isaac_exit_9b4810_first_push_value/);
  assert.match(h, /isaac_exit_9b4810_mode_layer_path/);
  assert.match(h, /isaac_exit_9b4810_vec_space/);
  assert.match(h, /isaac_exit_9b4810_vec_push_apply/);
  assert.match(h, /isaac_exit_9b4810_push_1c_needed/);
  assert.match(h, /isaac_exit_9b4810_counter_play_needed/);
  assert.match(h, /isaac_exit_9b4810_tail/);
  assert.match(h, /isaac_exit_9b4810_tail_apply/);
  assert.match(h, /ISAAC_EXIT_9B4810_THIS_FROM_GAME = 0x24024/);
  assert.match(h, /ISAAC_EXIT_F32_GLOBAL_C7B640_ADDR = 0x00c7b640u/);
  assert.match(h, /ISAAC_EXIT_F32_GLOBAL_C7B644_ADDR = 0x00c7b644u/);
  assert.match(h, /ISAAC_EXIT_9B4810_VALUE_1C = 0x1c/);
  assert.match(h, /isaac_exit_428590_elem_count/);
  assert.match(h, /isaac_exit_428590_new_capacity/);
  assert.match(h, /isaac_exit_428590_alloc_bytes/);
  assert.match(h, /isaac_exit_428590_old_capacity_bytes/);
  assert.match(h, /isaac_exit_428590_plan/);
  assert.match(h, /isaac_exit_428590_post_alloc_ptrs/);
  assert.match(h, /ISAAC_EXIT_428590_MAX_ELEMS = 0x3fffffff/);
  assert.match(h, /ISAAC_EXIT_428590_FREE_HEADER_THRESHOLD = 0x1000/);
  assert.match(h, /isaac_exit_anm2_getlayer_in_range/);
  assert.match(h, /isaac_exit_anm2_getlayer_try/);
  assert.match(h, /isaac_exit_anm2_getlayer_apply/);
  assert.match(h, /isaac_exit_anm2_load_path_present/);
  assert.match(h, /isaac_exit_anm2_load_prefix_apply/);
  assert.match(h, /isaac_exit_anm2_name_is_shadow/);
  assert.match(h, /isaac_exit_anm2_load_layer_step/);
  assert.match(h, /isaac_exit_anm2_load_sheet_step/);
  assert.match(h, /isaac_exit_anm2_sized_equal/);
  assert.match(h, /isaac_exit_anm2_replace_plan/);
  assert.match(h, /isaac_exit_anm2_replace_finish/);
  assert.match(h, /isaac_exit_anm2_play_plan/);
  assert.match(h, /isaac_exit_anm2_play_find/);
  assert.match(h, /ISAAC_EXIT_ANM2_LAYER_PNG_STR_OFF = 8/);
  assert.match(h, /ISAAC_EXIT_ANM2_ANIM_STRIDE = 0x13c/);
  assert.match(h, /isaac_exit_animstate_rewind_prefix/);
  assert.match(h, /isaac_exit_animstate_408c90_event_frame_eq/);
  assert.match(h, /isaac_exit_animstate_408c90_apply/);
  assert.match(h, /isaac_exit_animstate_rewind_zero_arrays/);
  assert.match(h, /isaac_exit_animstate_rewind_plan/);
  assert.match(h, /isaac_exit_animstate_rewind_apply/);
  assert.match(h, /isaac_exit_animstate_rewind_apply_addr/);
  assert.match(h, /ISAAC_EXIT_ANIMSTATE_FRAME_OFF = 0x10/);
  assert.match(h, /ISAAC_EXIT_ANIMDATA_EVENT_STRIDE|ISAAC_EXIT_ANIM_EVENT_STRIDE = 8/);
  assert.match(h, /isaac_exit_40ccd0_fits_capacity/);
  assert.match(h, /isaac_exit_40ccd0_new_capacity/);
  assert.match(h, /isaac_exit_40ccd0_alloc_size/);
  assert.match(h, /isaac_exit_40ccd0_old_free_needed/);
  assert.match(h, /isaac_exit_40ccd0_plan/);
  assert.match(h, /isaac_exit_40ccd0_nongrow_finish/);
  assert.match(h, /isaac_exit_408970_count_select/);
  assert.match(h, /isaac_exit_408970_counts_differ/);
  assert.match(h, /isaac_exit_408970_new_count_positive/);
  assert.match(h, /isaac_exit_408970_alloc_size/);
  assert.match(h, /isaac_exit_408970_heap_stats_base/);
  assert.match(h, /isaac_exit_408970_buffer_plan/);
  assert.match(h, /isaac_exit_408970_plan/);
  assert.match(h, /isaac_exit_40db90_path_size_present/);
  assert.match(h, /isaac_exit_40db90_timing_scale/);
  assert.match(h, /isaac_exit_40db90_cache_space_ok/);
  assert.match(h, /isaac_exit_40db90_tree_hit_select/);
  assert.match(h, /isaac_exit_40db90_insert_needed/);
  assert.match(h, /isaac_exit_40db90_layer_alloc_size/);
  assert.match(h, /isaac_exit_40db90_field_pack_apply/);
  assert.match(h, /isaac_exit_40db90_plan/);
  assert.match(h, /ISAAC_EXIT_40DB90_LAYER_STRIDE = 0xa0/);
  assert.match(h, /ISAAC_EXIT_40DB90_SRC_LAYER_STRIDE = 0x38/);
  assert.match(h, /ISAAC_EXIT_40DB90_TIMING_SHIFT = 0x12/);
  assert.match(h, /isaac_exit_40e110_cache_space_ok/);
  assert.match(h, /isaac_exit_40e110_tree_hit_select/);
  assert.match(h, /isaac_exit_40e110_cache_hit/);
  assert.match(h, /isaac_exit_40e110_refcount_inc_apply/);
  assert.match(h, /isaac_exit_40e110_grow_install_needed/);
  assert.match(h, /isaac_exit_40e110_grow_result_clear_at/);
  assert.match(h, /isaac_exit_40e110_plan/);
  assert.match(h, /ISAAC_EXIT_40E110_NODE_REFCOUNT_OFF = 0x50/);
  assert.match(h, /ISAAC_EXIT_40E110_PATH_BUF_SIZE = 0x100/);
  assert.match(h, /ISAAC_EXIT_40E110_CACHE_BEGIN_ADDR = 0x00c798b8/);
  assert.match(h, /isaac_exit_40c000_layer_count_nonzero/);
  assert.match(h, /isaac_exit_40c000_loop_needed/);
  assert.match(h, /isaac_exit_40c000_layer_skip/);
  assert.match(h, /isaac_exit_40c000_graphics_flag/);
  assert.match(h, /isaac_exit_40c000_callback_needed/);
  assert.match(h, /isaac_exit_40c000_store_layer_flags_at/);
  assert.match(h, /isaac_exit_40c000_plan/);
  assert.match(h, /isaac_exit_40c1e0_apply/);
  assert.match(h, /ISAAC_EXIT_40C000_LAYER_STRIDE = 0xa0/);
  assert.match(h, /ISAAC_EXIT_40C000_LAYER_FLAG30_OFF = 0x30/);
  assert.match(h, /ISAAC_EXIT_40C000_CALLBACK_GLOBAL = 0x00c7163c/);
  assert.match(h, /ISAAC_EXIT_40C1E0_FIELD0_VALUE = 0xffffffff/);
  assert.match(h, /isaac_exit_408640_source_present/);
  assert.match(h, /isaac_exit_408640_ctrl_present/);
  assert.match(h, /isaac_exit_408640_callback_needed/);
  assert.match(h, /isaac_exit_408640_field_copy_if_present_at/);
  assert.match(h, /isaac_exit_408640_plan/);
  assert.match(h, /ISAAC_EXIT_408640_DST_FIELD_OFF = 0x20/);
  assert.match(h, /ISAAC_EXIT_408640_SRC_FIELD_OFF = 0x30/);
  assert.match(h, /ISAAC_EXIT_408640_PAIR_SLOT_OFF = 0x98/);
  assert.match(h, /ISAAC_EXIT_408640_CALLBACK_GLOBAL = 0x00c7163c/);
  assert.match(h, /b_store_new_at_a_slot/);
  assert.match(h, /ISAAC_EXIT_40CCD0_MAX_SIZE = 0x7fffffff/);
  assert.match(h, /ISAAC_EXIT_40CCD0_ALIGN_OR = 0xf/);
  assert.match(h, /ISAAC_EXIT_40CCD0_FREE_HEADER_THRESHOLD = 0x1000/);
  assert.match(h, /isaac_exit_40cf00_uses_heap_header/);
  assert.match(h, /isaac_exit_40cf00_alloc_request_size/);
  assert.match(h, /isaac_exit_40cf00_align_user_ptr/);
  assert.match(h, /isaac_exit_40cf00_plan/);
  assert.match(h, /isaac_exit_40cf00_finish_header/);
  assert.match(h, /ISAAC_EXIT_ANM2_LAYER_STRIDE = 0xa0/);
  assert.match(h, /ISAAC_EXIT_ANM2_SHADOW_INDEX_INIT = 0xffffffff/);
  assert.match(h, /ISAAC_EXIT_40CF00_HEADER_THRESHOLD = 0x1000/);
  assert.match(h, /ISAAC_EXIT_40CF00_HEADER_ADD = 0x23/);
  assert.match(h, /isaac_exit_841cf0_p0_elem/);
  assert.match(h, /isaac_exit_841cf0_head_clear/);
  assert.match(h, /isaac_exit_841cf0_p2_host_needed/);
  assert.match(h, /isaac_exit_841cf0_vec_clear_end/);
  assert.match(h, /isaac_exit_841cf0_pure_apply/);
  assert.match(h, /ISAAC_EXIT_841CF0_P0_COUNT = 0x18/);
  assert.match(h, /ISAAC_EXIT_841CF0_P0_PTR_VALUE = 0x00b1a4ecu/);
  assert.match(h, /ISAAC_EXIT_841CF0_VEC_ELEM_STRIDE = 0xc/);
  assert.match(h, /isaac_exit_83abb0_block_post/);
  assert.match(h, /isaac_exit_83abb0_walk_continue/);
  assert.match(h, /isaac_exit_83abb0_apply/);
  assert.match(h, /ISAAC_EXIT_83ABB0_ELEM_STRIDE = 0x28/);
  assert.match(h, /ISAAC_EXIT_83ABB0_TERMINAL_OFF = 0x28/);
  assert.match(h, /isaac_exit_range_destroy_callback_needed/);
  assert.match(h, /ISAAC_EXIT_RANGE_DESTROY_CALLBACK_GLOBAL = 0x00c7163cu/);
  assert.match(h, /ISAAC_EXIT_709380_ELEM_STRIDE = 0xc/);
  assert.match(h, /ISAAC_EXIT_709300_ELEM_STRIDE = 0x28/);
  assert.match(h, /isaac_exit_84bfd0_slot_kind/);
  assert.match(h, /isaac_exit_84bfd0_apply/);
  assert.match(h, /ISAAC_EXIT_84BFD0_BLOCK_STRIDE = 0xcc/);
  assert.match(h, /ISAAC_EXIT_84BFD0_BASE_OFF = 0x114/);
  assert.match(h, /ISAAC_EXIT_84BFD0_F32_BITS = 0x3dcccccdu/);
  assert.match(h, /ISAAC_EXIT_84BFD0_TERMINAL_OFF = 0x2ac/);
  assert.match(h, /ISAAC_EXIT_84BFD0_THIS_FROM_GAME = 0x233a8/);
  assert.match(h, /isaac_exit_840f70_free_needed/);
  assert.match(h, /isaac_exit_840f70_heap_stats_base/);
  assert.match(h, /isaac_exit_840f70_stats_sub_hi/);
  assert.match(h, /isaac_exit_840f70_slot_plan/);
  assert.match(h, /ISAAC_EXIT_840F70_SLOT_COUNT = 2/);
  assert.match(h, /ISAAC_EXIT_840F70_HEADER_DELTA = 4/);
  assert.match(h, /ISAAC_EXIT_840F70_HEAP_STATS_FALLBACK = 0x00c7f618u/);
  assert.match(h, /ISAAC_EXIT_840F70_FREE_IAT_SLOT = 0x00b187dcu/);
  assert.match(h, /isaac_exit_709150_alloc_ok/);
  assert.match(h, /isaac_exit_709150_object_finish_apply/);
  assert.match(h, /isaac_exit_709150_callback_needed/);
  assert.match(h, /isaac_exit_709150_pair_apply_base/);
  assert.match(h, /isaac_exit_709150_plan/);
  assert.match(h, /ISAAC_EXIT_709150_ALLOC_SIZE = 0x18/);
  assert.match(h, /ISAAC_EXIT_709150_VTABLE = 0x00b67f98u/);
  assert.match(h, /ISAAC_EXIT_709150_CALLBACK_GLOBAL = 0x00c71644u/);
  assert.match(h, /ISAAC_EXIT_9A27D0_SLOT_TRIPLE_STRIDE = 0x1f4/);
  assert.match(h, /isaac_exit_a1ad90_block_a_needed/);
  assert.match(h, /isaac_exit_a1ad90_free_size/);
  assert.match(h, /isaac_exit_a1ad90_dtor_count_arg/);
  assert.match(h, /isaac_exit_a1ad90_tree_reset_at/);
  assert.match(h, /isaac_exit_a1ad90_terminal/);
  assert.match(h, /isaac_exit_a1ad90_apply_this/);
  assert.match(h, /isaac_exit_a1ad90_plan/);
  assert.match(h, /ISAAC_EXIT_A1AD90_BLOCK_A_OFF = 0x28/);
  assert.match(h, /ISAAC_EXIT_A1AD90_BLOCK_B_OFF = 0x3c/);
  assert.match(h, /ISAAC_EXIT_A1AD90_ELEM_SIZE = 8/);
  assert.match(h, /ISAAC_EXIT_A1AD90_ELEM_DTOR = 0x0040c440u/);
  assert.match(h, /ISAAC_EXIT_A1AD90_TREE_OFF = 0x40/);
  assert.match(h, /ISAAC_EXIT_A1AD90_TERMINAL_BYTE_OFF = 0/);
  assert.match(h, /isaac_exit_a648b0_mode_from_cl/);
  assert.match(h, /isaac_exit_a648b0_mode1_free_needed/);
  assert.match(h, /ISAAC_EXIT_A648B0_MODE_MASK = 0xff/);
  assert.match(h, /ISAAC_EXIT_A648B0_MODE_FREE = 1/);
  assert.match(h, /ISAAC_EXIT_A648B0_FREE_IAT_SLOT = 0x00b187dcu/);
  // The recapture requirement must stay documented on the free-size helper.
  assert.match(h, /RE-READS the count/);
  assert.match(h, /isaac_exit_40c4a0_entry_zero/);
  assert.match(h, /isaac_exit_40c4a0_old_object_present/);
  assert.match(h, /isaac_exit_40c4a0_pair_apply/);
  assert.match(h, /isaac_exit_40c4a0_return_value/);
  assert.match(h, /isaac_exit_40c4a0_plan/);
  assert.match(h, /ISAAC_EXIT_40C4A0_ALLOC_SIZE = 0x18/);
  assert.match(h, /ISAAC_EXIT_40C4A0_VTABLE = 0x00b1a6e0u/);
  assert.match(h, /ISAAC_EXIT_40C4A0_CALLBACK_GLOBAL = 0x00c7163cu/);
  assert.match(h, /isaac_exit_415800_walk_continue/);
  assert.match(h, /isaac_exit_415800_free_order/);
  assert.match(h, /ISAAC_EXIT_415800_NODE_SIZE = 0x1c/);
  assert.match(h, /ISAAC_EXIT_415800_CTRL_OFF = 0x18/);
  assert.match(h, /ISAAC_EXIT_415800_COM_SLOT_OFF = 0x14/);
  // The recapture must stay documented on the 0x0040c4a0 gate too.
  assert.match(h, /never the entry-zeroed snapshot/);
  // The allocator behind 0x0040c7f0 / 0x00709150 must stay unmodelled.
  assert.doesNotMatch(h, /isaac_exit_a0f4c0/);
  assert.doesNotMatch(h, /game_update_slice/);
});

test("JS oracle: session gate, overlay, PGD, GameState predicates", () => {
  assert.equal(exitSessionActive(0), false);
  assert.equal(exitSessionActive(1), true);
  assert.equal(exitSessionActive(0xff), true);

  assert.equal(exitItemOverlayForceNeeded(0), false);
  assert.equal(exitItemOverlayForceNeeded(1), false);
  assert.equal(exitItemOverlayForceNeeded(2), true);
  assert.equal(exitItemOverlayForceNeeded(3), false);

  assert.deepEqual(exitPgdFlushPrepare(0, 1), { flush: false, changesmade: 0 });
  assert.deepEqual(exitPgdFlushPrepare(1, 0), { flush: false, changesmade: 1 });
  assert.deepEqual(exitPgdFlushPrepare(1, 1), { flush: true, changesmade: 0 });
  assert.deepEqual(exitPgdFlushPrepare(5, 1), { flush: true, changesmade: 0 });
  assert.equal(exitPgdFlushNeeded(1, 1), true);
  assert.equal(exitPgdFlushNeeded(0, 1), false);

  // PE @ 0x006fa1f0: cmp dword ptr [eax],0 — the FIRST DWORD of the Steam
  // context is tested FULL-WORD (raw recaptured word, not a pre-computed
  // boolean). 1 is a live context word → cloud when the 2a3a4 byte is on.
  assert.equal(exitPgdSaveUsesCloud(1, 1), true);
  assert.equal(exitPgdSaveUsesCloud(1, 0), false);
  assert.equal(exitPgdSaveUsesCloud(0, 0), false);
  assert.equal(exitPgdSaveUsesCloud(0, 1), false);       // word 0 → local
  assert.equal(exitPgdSaveUsesCloud(0x100, 1), true);   // full-dword gate
  assert.equal(exitPgdSaveUsesCloud(0x1ff, 1), true);
  assert.equal(exitPgdSaveUsesCloud(0xffffffff, 1), true);
  assert.equal(exitPgdSaveUsesCloud(0x10000, 0), false); // cloud byte off

  assert.equal(exitGamestateIoNeeded(0), true);
  assert.equal(exitGamestateIoNeeded(1), false);
  assert.equal(exitGamestateShouldWrite(0), false);
  assert.equal(exitGamestateShouldWrite(1), true);
  assert.equal(exitGamestateShouldWrite(0x100), false); // low byte only
});

test("JS oracle: PE-ordered islands, vector CF, SFX ids, post-log, nested pure", () => {
  const floats = exitManagerFloatsReset(0.25, 0.5);
  assert.equal(floats.f2a2d0, Math.fround(1));
  assert.equal(floats.f2a2d4, Math.fround(1));

  const out = exitPureFieldTeardown({
    field2510c: 9,
    field2593c: 8,
    field25948: 7,
    field2590c: 6,
    gate1d520: 5,
    gate1d654: 4,
    skipTimedTransition25954: 3,
  });
  assert.equal(out.field2510c, 0);
  assert.equal(out.gate1d520, 0);
  assert.equal(out.skipTimedTransition25954, 0);
  assert.equal(out.prior.field2510c, 9);

  assert.deepEqual(exitTeardownT0(1, 2), { field2510c: 0, field2593c: 0, prior: { field2510c: 1, field2593c: 2 } });
  assert.equal(exitTeardownT2(99).gate1d654, 0);
  assert.equal(exitTeardownT4(7).skipTimedTransition25954, 0);

  assert.equal(exitVector25ebcClearEnd(0x1000, 0x0abc), 0x0abc);
  assert.equal(exitVector25ebcDtorNeeded(0, 0), false);
  assert.equal(exitVector25ebcDtorNeeded(0, 0x38), true);
  assert.equal(exitVector25ebcElementCount(0, 0x38 * 3), 3);
  assert.equal(exitVector25ebcElementCount(0x10, 0x20), 0); // not multiple
  assert.equal(EXIT_VECTOR_25EBC_STRIDE, 0x38);

  assert.equal(exitSfxStopIdAt(0), 0x256);
  assert.equal(exitSfxStopIdAt(4), 0x3f0);
  assert.equal(exitSfxStopIdAt(5), 0);
  assert.equal(EXIT_SFX_STOP_COUNT, 5);

  assert.equal(exitPgdReadonlyClear(1).readonly15, 0);

  const pl = exitPostlogPureFields({ field1bb70: 9, gate1b83c: 3 },
    EXIT_POSTLOG_F32_1BA90_BITS, EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(pl.field1bb70, 0);
  assert.equal(pl.gate1b83c, 0);
  assert.equal(pl.field1ba80, 50);
  assert.equal(pl.field1ba90, f32Bits(EXIT_POSTLOG_F32_1BA90_BITS));
  assert.equal(pl.field1ba94, f32Bits(EXIT_POSTLOG_F32_1BA94_BITS));

  assert.deepEqual(exitItemOverlayStateClear(2, 5).state1c034, 0);
  assert.equal(exitCounter265c0Clear(12).counter265c0, 0);
  assert.equal(exitSessionPairClear(0x0101).sessionPair2658a, 0);

  const p = exit6f43b0Prefix({ field26588: 9 });
  assert.equal(p.field26588, 0);

  const a = exit6f4520Apply({ field269d4: 0x12345678, field26554: 1 });
  assert.equal(a.field26554, 0);
  assert.equal(a.field2652c, 30);
  assert.equal(a.field26530, Math.fround(1));
  assert.equal(a.field269c4, 1);
  assert.equal(a.field269d8, 0x12345678);
  assert.equal(a.field676ac, -1);
  assert.equal(a.field26574, 10);
  assert.equal(a.effectSlots.length, EXIT_6F4520_EFFECT_SLOT_COUNT);

  const m = exit6f43b0Mid({});
  assert.deepEqual(m.zero16_2658c, [0, 0, 0, 0]);
  assert.equal(m.counter265c0, 0);

  const t = exit6f43b0Tail({ field6774c: 0x55 });
  assert.deepEqual(t.pack676b8, [1, 1, 1, 0].map((x) => Math.fround(x)));
  assert.equal(t.field67750, 0x55);
  assert.equal(t.field67740, f32Bits(0x3a83126f));

  // ABI v3 residual pure peels
  assert.deepEqual(exitFrameModePairClear(3, 4).mode1d2ec, 0);
  assert.equal(exitVolumeModifierClearNeeded(1), false);
  assert.equal(exitVolumeModifierClearNeeded(0.5), true);
  assert.equal(exitVolumeModifierClearNeeded(Number.NaN), true);
  assert.equal(exitManager2a334SetOne(0.2).manager2a334, Math.fround(1));
  assert.equal(exitManager2a338Set(0).manager2a338, f32Bits(EXIT_MANAGER_2A338_BITS));
  assert.equal(exitResidualSlotCopyNeeded(0, 5), false);
  assert.equal(exitResidualSlotCopyNeeded(1, 0), false);
  assert.equal(exitResidualSlotCopyNeeded(1, 3), true);
  assert.equal(exitMapValueFlag28Clear(9).flag28, 0);
  assert.equal(EXIT_RESIDUAL_OUTER_COUNT, 0x25);
  assert.equal(EXIT_RESIDUAL_OUTER_STRIDE, 0xc4);
  assert.equal(EXIT_RESIDUAL_MID_COUNT, 2);
  assert.equal(EXIT_RESIDUAL_ENTITY_STRIDE, 0x5c);

  // ABI v4: 0x009b5cb0 pure prefix
  assert.equal(EXIT_9B5CB0_THIS_OFF, 0x23a74);
  assert.equal(EXIT_9B5CB0_FIELD_8_VALUE, 2);
  const p9 = exit9b5cb0Prefix({
    menuState0: 5,
    field8: 9,
    field24: 1,
    field28: 2,
    field1454: 0xff,
  });
  assert.equal(p9.menuState0, 0);
  assert.equal(p9.field8, 2);
  assert.equal(p9.field24, 0);
  assert.equal(p9.field28, 0);
  assert.equal(p9.field1454, 0);
  assert.equal(p9.prior.menuState0, 5);
  assert.equal(p9.prior.field8, 9);
  const ptrs = exit9b5cb0PrefixPtrs(3, 4, 5, 6, 7);
  assert.equal(ptrs.menuState0, 0);
  assert.equal(ptrs.field8, 2);
  assert.equal(ptrs.field1454, 0);

  // ABI v5: 0x008d3250 pure islands
  assert.equal(EXIT_8D3250_THIS_FROM_9B5CB0, 0x838);
  assert.equal(EXIT_8D3250_THIS_FROM_GAME, 0x23a74 + 0x838);
  assert.equal(EXIT_8D3250_FIELD_178_VALUE, 0xffffffff);
  const p0 = exit8d3250P0({
    field10: 9,
    field14: 1,
    field30: 2,
    field34: 3,
    field38: 4,
  });
  assert.equal(p0.field10, 0);
  assert.equal(p0.field14, 0);
  assert.equal(p0.field30, 0);
  assert.equal(p0.field34, 0);
  assert.equal(p0.field38, 0);
  assert.equal(p0.prior.field10, 9);
  assert.deepEqual(exit8d3250P1(1, 2, 3).field44, 0);
  assert.deepEqual(exit8d3250P2(4, 5, 6).field60, 0);
  const p3 = exit8d3250P3({ field178: 0, field17c: 9 });
  assert.equal(p3.field178, -1);
  assert.equal(p3.field17c, 0);
  assert.equal(p3.field648, 0);
  assert.equal(exit8d3250CursorLayerHostNeeded(0), false);
  assert.equal(exit8d3250CursorLayerHostNeeded(1), true);
  assert.equal(exit8d3250CursorLayerHostNeeded(0xff), true);
  const p4 = exit8d3250P4({ field18: 0x12345678, field1c: 1, field24: 2 });
  assert.equal(p4.field18, 0x12345678);
  assert.equal(p4.field1c, 0x12345678);
  assert.equal(p4.field24, 0);
  assert.equal(p4.field28, 0);
  assert.equal(p4.field2c, 0);
  assert.equal(exit8d3250ListHostNeeded(0), false);
  assert.equal(exit8d3250ListHostNeeded(0x1000), true);
  const listView = new DataView(new ArrayBuffer(0x40));
  const sent = 0x10;
  listView.setUint32(sent, 0xdead, true);
  listView.setUint32(sent + 4, 0xbeef, true);
  listView.setUint32(sent + 8, 0xcafe, true);
  listView.setUint32(0x30, 7, true);
  exit8d3250ListEmpty(listView, sent, sent, 0x30);
  assert.equal(listView.getUint32(sent, true), sent);
  assert.equal(listView.getUint32(sent + 4, true), sent);
  assert.equal(listView.getUint32(sent + 8, true), sent);
  assert.equal(listView.getUint32(0x30, true), 0);

  // ABI v42: 0x008d3250 ordered host-event decision laws
  assert.equal(EXIT_8D3250_CURSOR_VA, 0xb75734);
  assert.equal(EXIT_8D3250_LAYER_CLEAR_OFF, 0x74);
  assert.equal(EXIT_8D3250_LIST_ARG1_OFF, 4);
  assert.equal(exit8d3250CursorVa(), 0xb75734);
  assert.equal(exit8d3250GetLayerReceiverOff(), 0x304);
  assert.equal(exit8d3250LayerClearOff(), 0x74);
  assert.equal(exit8d3250ResetReceiverOff(), 0x64);
  assert.equal(exit8d3250ListSentinelOff(), 0x120);
  assert.equal(exit8d3250ListHeaderOff(), 0x120);
  assert.equal(exit8d3250ListDestroyArg1Ptr(0x1234), 0x1238);
  assert.equal(exit8d3250ListDestroyArg1Ptr(0xfffffffc), 0); // wrap
  assert.equal(exit8d3250ListDestroyArg2(0x1000), 0x1120);
  assert.equal(exit8d3250ListDestroyArg2(0xfffffee0), 0); // wrap
  const hp = exit8d3250HostPlan(1, 0x100);
  assert.equal(hp.cursorVa, 0xb75734);
  assert.equal(hp.getLayerReceiverOff, 0x304);
  assert.equal(hp.layerClearOff, 0x74);
  assert.equal(hp.resetReceiverOff, 0x64);
  assert.equal(hp.listObjOff, 0x1e8);
  assert.equal(hp.listSentinelOff, 0x120);
  assert.equal(hp.listHeaderOff, 0x120);
  assert.equal(hp.cursorGate, 1); // byte +0x40d != 0
  assert.equal(hp.listGate, 1); // full-dword ptr +0x1e8 != 0
  assert.equal(exit8d3250HostPlan(0, 0).cursorGate, 0);
  assert.equal(exit8d3250HostPlan(0, 0).listGate, 0);
  assert.equal(exit8d3250HostPlan(0x100, 0).cursorGate, 0); // low byte 0
  assert.equal(exit8d3250HostPlan(0xffffffff, 0).cursorGate, 1); // low byte 0xff
  assert.equal(exit8d3250HostPlan(0, 0xffffffff).listGate, 1); // FULL dword

  // ABI v43: host 0x00a648b0 body decision laws — mode dispatch
  assert.equal(EXIT_A648B0_MODE_STATS, 2);
  assert.equal(EXIT_A648B0_MODE2_BASE_OFF, 0x30);
  assert.equal(EXIT_A648B0_MODE2_ADDEND_LO_VA, 0xc7f618);
  assert.equal(EXIT_A648B0_MODE2_ADDEND_HI_VA, 0xc7f61c);
  assert.equal(exitA648b0ModeStats(), 2);
  // movzx eax,cl: only the low byte selects the path.
  assert.equal(exitA648b0ModePath(0), 0);
  assert.equal(exitA648b0ModePath(1), 1);
  assert.equal(exitA648b0ModePath(2), 2);
  assert.equal(exitA648b0ModePath(3), 0);
  assert.equal(exitA648b0ModePath(0xff), 0);
  assert.equal(exitA648b0ModePath(0x101), 1);
  assert.equal(exitA648b0ModePath(0x102), 2);
  assert.equal(exitA648b0ModePath(0x100), 0);
  assert.equal(exitA648b0ModePath(0xffffff02), 2);
  // The mode-2 base trap: DIRECT edi add, NO fallback (mode 1 would
  // return the 0xc7f618 fallback at g == 0 — mode 2 must not).
  assert.equal(exitA648b0Mode2StatsBasePtr(0), 0x30);
  assert.equal(exitA648b0Mode2StatsBasePtr(0x5000), 0x5030);
  assert.equal(exitA648b0Mode2StatsBasePtr(0xfffffff0), 0x20); // wrap
  assert.notEqual(
    exitA648b0Mode2StatsBasePtr(0),
    exitA648b0HeapStatsBase(0),
    "mode-2 base must NOT take the mode-1 fallback",
  );
  assert.equal(exitA648b0Mode2AddendLoVa(), 0xc7f618);
  assert.equal(exitA648b0Mode2AddendHiVa(), 0xc7f61c);
  // 64-bit add with carry (add/adc).
  assert.equal(exitA648b0StatsAddLo(0x10, 0x20), 0x30);
  assert.equal(exitA648b0StatsAddLo(0xfffffff0, 0x20), 0x10); // wrap
  assert.equal(exitA648b0StatsAddCarry(0x10, 0x20), 0);
  assert.equal(exitA648b0StatsAddCarry(0xfffffff0, 0x20), 1); // carry out
  assert.equal(exitA648b0StatsAddCarry(0x80000000, 0x80000000), 1);
  assert.equal(exitA648b0StatsAddCarry(0x7fffffff, 0x80000000), 0);
  assert.equal(exitA648b0StatsAddHi(0x10, 0x100, 0x20, 0x200), 0x300);
  // Carry from the LOW add must reach the high word.
  assert.equal(exitA648b0StatsAddHi(0xfffffff0, 0x100, 0x20, 0x200), 0x301);
  assert.equal(exitA648b0StatsAddHi(0xfffffffc, 0xffffffff, 0x7, 0x1), 1); // 0x100000000 wrap
  assert.deepEqual(exitA648b0StatsAddPair(0xfffffff0, 0x100, 0x20, 0x200), {
    lo: 0x10,
    hi: 0x301,
  });
  // Mode plan: path 0 -> pass-through, path 1 -> v26 sub arithmetic,
  // path 2 -> add with the direct base.
  const mp0 = exitA648b0ModePlan(0, 0x40, 0x5000, 7, 8, 4, 9, 10);
  assert.equal(mp0.path, 0);
  assert.equal(mp0.freeNeeded, false);
  assert.equal(mp0.statsBase, 0);
  assert.equal(mp0.loAfter, 7);
  assert.equal(mp0.hiAfter, 8);
  assert.equal(mp0.freePtr, 0);
  const mp1 = exitA648b0ModePlan(1, 0x40, 0x5000, 7, 8, 4, 9, 10);
  assert.equal(mp1.path, 1);
  assert.equal(mp1.freeNeeded, true);
  assert.equal(mp1.statsBase, 0x5030);
  assert.equal(mp1.loAfter, 3); // 7 - 4, no borrow
  assert.equal(mp1.hiAfter, 8);
  assert.equal(mp1.freePtr, 0x3c);
  const mp1b = exitA648b0ModePlan(1, 0x40, 0x5000, 3, 8, 4, 9, 10);
  assert.equal(mp1b.loAfter, 0xffffffff); // 3 - 4 wraps
  assert.equal(mp1b.hiAfter, 7); // borrow 1
  const mp1c = exitA648b0ModePlan(1, 0, 0x5000, 3, 8, 4, 9, 10);
  assert.equal(mp1c.freeNeeded, false);
  assert.equal(mp1c.statsBase, 0);
  assert.equal(mp1c.freePtr, 0);
  assert.equal(mp1c.loAfter, 3); // no store when the edx gate is closed
  assert.equal(mp1c.hiAfter, 8);
  const mp2 = exitA648b0ModePlan(2, 0, 0x5000, 0xfffffff0, 0x100, 4, 0x20, 0x200);
  assert.equal(mp2.path, 2);
  assert.equal(mp2.freeNeeded, false);
  assert.equal(mp2.statsBase, 0x5030); // direct base even at any gates
  assert.equal(mp2.loAfter, 0x10); // wrap + carry
  assert.equal(mp2.hiAfter, 0x301);
  const mp2z = exitA648b0ModePlan(2, 0, 0, 0xfffffff0, 0x100, 4, 0x20, 0x200);
  assert.equal(mp2z.statsBase, 0x30); // trap: no fallback at g == 0
  const mp3 = exitA648b0ModePlan(3, 0x40, 0x5000, 7, 8, 4, 9, 10);
  assert.equal(mp3.path, 0);
  assert.equal(mp3.statsBase, 0);
  assert.equal(mp3.loAfter, 7);
  assert.equal(mp3.hiAfter, 8);

  // ABI v6: 0x009b9150 pure islands
  assert.equal(EXIT_9B9150_THIS_FROM_GAME, 0x1baa8);
  assert.equal(EXIT_9B9150_ESAU_SLOT_COUNT, 4);
  assert.equal(EXIT_9B9150_TAIL_COUNT, 4);
  assert.equal(EXIT_9B9150_TAIL_VALUE, 0xffffffff);
  assert.equal(EXIT_9B9150_FIELD_5C_VALUE, 1);
  const p0pm = exit9b9150P0({ fieldC8: 3, fieldCc: 4 });
  assert.equal(p0pm.fieldC8, 0);
  assert.equal(p0pm.fieldCc, 0);
  assert.equal(p0pm.prior.fieldC8, 3);
  assert.equal(exit9b9150PlayerListHostNeeded(0x1000, 0x1000), false);
  assert.equal(exit9b9150PlayerListHostNeeded(0x1000, 0x1003), false); // span 3
  assert.equal(exit9b9150PlayerListHostNeeded(0x1000, 0x1004), true); // one ptr
  assert.equal(exit9b9150PlayerListHostNeeded(0x1000, 0x1010), true);
  assert.deepEqual(exit9b9150PlayerListClearEnd(0x2000, 0x1000).end, 0x1000);
  assert.equal(exit9b9150ExtraListCount(0x1000, 0x1000), 0);
  assert.equal(exit9b9150ExtraListCount(0x1000, 0x1010), 4);
  assert.equal(exit9b9150ExtraListHostNeeded(0x1000, 0x1000), false);
  assert.equal(exit9b9150ExtraListHostNeeded(0x1000, 0x1004), true);
  assert.equal(exit9b9150PtrHostNeeded(0), false);
  assert.equal(exit9b9150PtrHostNeeded(0xabc), true);
  assert.equal(exit9b9150SlotClear(0xdead).slot, 0);
  assert.deepEqual(exit9b9150EsauSlotsClear([1, 2, 3, 4]).slots, [0, 0, 0, 0]);
  const mid = exit9b9150Mid({ field7c: 9, field5c: 0 });
  assert.equal(mid.field7c, 0);
  assert.equal(mid.field5c, 1);
  const tail = exit9b9150Tail({ fields: [1, 2, 3, 4] });
  assert.deepEqual(tail.fields, [-1, -1, -1, -1]);

  // ABI v7: 0x009a27d0 pure islands
  assert.equal(EXIT_9A27D0_THIS_FROM_GAME, 0x1da04);
  assert.equal(EXIT_9A27D0_SLOT_FLAG_COUNT, 11);
  assert.equal(EXIT_9A27D0_SLOT_FLAG_STRIDE, 0x1f4);
  assert.equal(EXIT_9A27D0_SLOT_FLAG_BASE_OFF, 0x3ce4);
  assert.equal(EXIT_9A27D0_FIELD_54CD_OFF, 0x54cd);
  assert.equal(
    EXIT_9A27D0_SLOT_HOST_840F70_OFF + EXIT_9A27D0_SLOT_FLAG_FROM_840F70,
    EXIT_9A27D0_SLOT_FLAG_BASE_OFF,
  );
  assert.equal(exit9a27d0SlotFlagClear(0xab).flag, 0);
  assert.equal(exit9a27d0SlotFlagClear(0xab).prior, 0xab);
  const packed = exit9a27d0SlotFlagsClearPacked(
    Array.from({ length: 11 }, (_, i) => i + 1),
  );
  assert.deepEqual(packed.flags, new Array(11).fill(0));
  assert.deepEqual(packed.prior, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(exit9a27d0SlotFlagOff(0), 0x3ce4);
  assert.equal(exit9a27d0SlotFlagOff(1), 0x3ce4 + 0x1f4);
  assert.equal(exit9a27d0SlotFlagOff(10), 0x3ce4 + 10 * 0x1f4);
  assert.equal(exit9a27d0SlotFlagOff(11), 0xffffffff);
  assert.equal(exit9a27d0Field54cdClear(1).field54cd, 0);
  const img = new DataView(new ArrayBuffer(0x54d0 + 0x10));
  for (let i = 0; i < 11; i++) {
    img.setUint8(0x3ce4 + i * 0x1f4, 0x5a);
  }
  exit9a27d0SlotFlagsApply(img, 0);
  for (let i = 0; i < 11; i++) {
    assert.equal(img.getUint8(0x3ce4 + i * 0x1f4), 0);
  }

  // ABI v8: 0x009a19a0 pure islands
  assert.equal(EXIT_9A19A0_THIS_FROM_GAME, 0x1da04);
  assert.equal(EXIT_9A19A0_THIS_FROM_GAME, EXIT_9A27D0_THIS_FROM_GAME);
  assert.equal(EXIT_9A19A0_F32_5490_BITS, 0xbf800000);
  assert.equal(EXIT_9A19A0_I32_M1, 0xffffffff);
  assert.equal(EXIT_9A19A0_FIELD_54D0_VALUE, 2);
  assert.equal(EXIT_9A19A0_FIELD_54D8_VALUE, 2);
  assert.equal(EXIT_9A19A0_FIELD_54CC_VALUE, 1);
  assert.equal(EXIT_9A19A0_PLAYERHUD_LOOP_COUNT, 8);
  assert.equal(EXIT_9A19A0_PLAYERHUD_STRIDE, 0x6dc);
  assert.equal(EXIT_9A19A0_FIELD_54CC_OFF, 0x54cc);
  const pfx = exit9a19a0Prefix({
    field5490: 1,
    field5494: 2,
    field5498: 3,
    field549c: 4,
    field54d0: 5,
    field54d4: 6,
    field54d8: 7,
  });
  assert.equal(pfx.field5490, f32Bits(EXIT_9A19A0_F32_5490_BITS));
  assert.equal(pfx.field5494, -1);
  assert.equal(pfx.field5498, -1);
  assert.equal(pfx.field549c, 0);
  assert.equal(pfx.field54d0, 2);
  assert.equal(pfx.field54d4, 0);
  assert.equal(pfx.field54d8, 2);
  const slot = exit9a19a0SlotSetup(0xdeadbeef, 3);
  assert.equal(slot.field4, 0xdeadbeef);
  assert.equal(slot.field8, 3);
  assert.equal(exit9a19a0SlotBaseOff(0), 0);
  assert.equal(exit9a19a0SlotBaseOff(1), 0x6dc);
  assert.equal(exit9a19a0SlotBaseOff(7), 7 * 0x6dc);
  assert.equal(exit9a19a0SlotBaseOff(8), 0xffffffff);
  assert.equal(exit9a19a0Field54ccSet(0).field54cc, 1);
  assert.equal(exit9a19a0Field54ccSet(0xff).prior, 0xff);
  const slotImg = new DataView(
    new ArrayBuffer(EXIT_9A19A0_PLAYERHUD_LOOP_COUNT * EXIT_9A19A0_PLAYERHUD_STRIDE + 16),
  );
  for (let i = 0; i < EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; i++) {
    slotImg.setUint32(i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_BACKPTR_OFF, 0x11111111, true);
    slotImg.setUint16(i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_INDEX_OFF, 0xabcd, true);
  }
  exit9a19a0SlotsApply(slotImg, 0, 0x0a19a000);
  for (let i = 0; i < EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; i++) {
    assert.equal(
      slotImg.getUint32(i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_BACKPTR_OFF, true),
      0x0a19a000,
    );
    assert.equal(
      slotImg.getUint16(i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_INDEX_OFF, true),
      i,
    );
  }

  // ABI v9: 0x0040e910 pure CF + freestanding tree iterator++
  assert.equal(EXIT_40E910_NODE_SIZE, 0x1c);
  assert.equal(EXIT_40E910_NODE_OBJ_OFF, 0x18);
  assert.equal(EXIT_40E910_COM_FREE_WORD_MAX, 2);
  assert.equal(EXIT_TREE_ISNIL_OFF, 0xd);
  assert.equal(exit40e910ListHostNeeded(0x1000, 0x1000), false);
  assert.equal(exit40e910ListHostNeeded(0x1000, 0x1004), true);
  assert.equal(exit40e910NodeObjectPresent(0), false);
  assert.equal(exit40e910NodeObjectPresent(0xabc), true);
  assert.equal(exit40e910FreeAfterComNeeded(0), true);
  assert.equal(exit40e910FreeAfterComNeeded(2), true);
  assert.equal(exit40e910FreeAfterComNeeded(3), false);
  assert.equal(exit40e910FreeAfterComNeeded(0x10003), false); // low word 3
  assert.equal(exit40e910FreeAfterComNeeded(0x10002), true); // low word 2
  assert.equal(exit40e910PostEraseDtorNeeded(0), false);
  assert.equal(exit40e910PostEraseDtorNeeded(1), true);
  assert.equal(exit40e910PostEraseCallbackNeeded(0, 0x1234), false);
  assert.equal(exit40e910PostEraseCallbackNeeded(1, 0), false);
  assert.equal(exit40e910PostEraseCallbackNeeded(1, 0x1234), true);
  assert.equal(exit40e910FreeSize(), 0x1c);

  // ABI v41: 0x0040e910 decision laws (list walk + COM release arg/state)
  assert.equal(exit40e910WalkContinue(0x1000, 0x1000), false);
  assert.equal(exit40e910WalkContinue(0x1000, 0x1004), true);
  assert.equal(exit40e910WalkContinue(0, 0xffffffff), true);
  assert.equal(exit40e910ComIfaceAddr(0x1234), 0x123c);
  assert.equal(exit40e910ComIfaceAddr(0xfffffff8), 0); // 32-bit wrap
  assert.equal(exit40e910ComReleaseArg(), EXIT_40E910_COM_RELEASE_ARG);
  assert.equal(exit40e910ComStateWord(0), 0);
  assert.equal(exit40e910ComStateWord(2), 2);
  assert.equal(exit40e910ComStateWord(0x10002), 2); // low 16 bits only
  assert.equal(exit40e910ComStateWord(0xffffffff), 0xffff);

  // ABI v41: 0x009a27d0 per-slot triple decision laws (FULL u32 index)
  assert.equal(EXIT_9A27D0_SLOT_709150_BASE_OFF, 0x3cf4);
  assert.equal(EXIT_9A27D0_SLOT_RESET_BASE_OFF, 0x3cfc);
  assert.equal(EXIT_9A27D0_SLOT_LOOP1_COUNT, 6);
  assert.equal(EXIT_9A27D0_SLOT_LOOP2_COUNT, 4);
  assert.equal(EXIT_9A27D0_SLOT_LOOP1_START_ESI, 0x3ee8);
  assert.equal(EXIT_9A27D0_SLOT_LOOP2_START_ESI, 0x4aa0);
  // slot 0: direct block; base 0x3cdc; flag 0x3ce4; reset 0x3cfc;
  // 709150 0x3cf4; arg == reset (push ecx survives from lea ecx,[esi+8]).
  assert.equal(exit9a27d0SlotTripleBaseOff(0), 0x3cdc);
  assert.equal(exit9a27d0SlotFlagOff(0), 0x3ce4);
  assert.equal(exit9a27d0SlotResetOff(0), 0x3cfc);
  assert.equal(exit9a27d0Slot709150Off(0), 0x3cf4);
  assert.equal(exit9a27d0Slot709150Arg(0), 0x3cfc);
  assert.equal(exit9a27d0SlotLoopSegment(0), 0);
  // slot 6 (last of 6-loop): base 0x4894; segment 1.
  assert.equal(exit9a27d0SlotTripleBaseOff(6), 0x3cdc + 6 * 0x1f4);
  assert.equal(exit9a27d0SlotLoopSegment(6), 1);
  // slot 7 (first of 4-loop): base 0x4a88; segment 2.
  assert.equal(exit9a27d0SlotTripleBaseOff(7), 0x3cdc + 7 * 0x1f4);
  assert.equal(exit9a27d0SlotLoopSegment(7), 2);
  // slot 10 (last): base 0x5064.
  assert.equal(exit9a27d0SlotTripleBaseOff(10), 0x3cdc + 10 * 0x1f4);
  assert.equal(exit9a27d0SlotResetOff(10), 0x3cfc + 10 * 0x1f4);
  assert.equal(exit9a27d0Slot709150Off(10), 0x3cf4 + 10 * 0x1f4);
  assert.equal(exit9a27d0Slot709150Arg(10), 0x3cfc + 10 * 0x1f4);
  assert.equal(exit9a27d0SlotLoopSegment(10), 2);
  // WIDE / OOB: 11 and above -> 0xffffffff (not masked, not wrapped).
  assert.equal(exit9a27d0SlotTripleBaseOff(11), 0xffffffff);
  assert.equal(exit9a27d0SlotTripleBaseOff(0x100), 0xffffffff);
  assert.equal(exit9a27d0SlotTripleBaseOff(0xffffffff), 0xffffffff);
  assert.equal(exit9a27d0SlotResetOff(0x100), 0xffffffff);
  assert.equal(exit9a27d0Slot709150Off(0x100), 0xffffffff);
  assert.equal(exit9a27d0Slot709150Arg(0x100), 0xffffffff);
  assert.equal(exit9a27d0SlotLoopSegment(0x100), -1);
  assert.equal(exit9a27d0SlotLoopSegment(0xffffffff), -1);
  // Loop structure laws.
  assert.equal(exit9a27d0SlotLoop1Count(), 6);
  assert.equal(exit9a27d0SlotLoop2Count(), 4);
  assert.equal(exit9a27d0SlotLoop1StartOff(), 0x3ee8);
  assert.equal(exit9a27d0SlotLoop2StartOff(), 0x4aa0);
  // Plan pack (oracle object).
  const sp0 = exit9a27d0SlotPlan(0);
  assert.equal(sp0.valid, 1);
  assert.equal(sp0.baseOff, 0x3cdc);
  assert.equal(sp0.flagOff, 0x3ce4);
  assert.equal(sp0.resetOff, 0x3cfc);
  assert.equal(sp0.receiver709150Off, 0x3cf4);
  assert.equal(sp0.arg709150, 0x3cfc);
  assert.equal(sp0.loopSegment, 0);
  const sp7 = exit9a27d0SlotPlan(7);
  assert.equal(sp7.valid, 1);
  assert.equal(sp7.baseOff, 0x3cdc + 7 * 0x1f4);
  assert.equal(sp7.loopSegment, 2);
  const spOob = exit9a27d0SlotPlan(0x100);
  assert.equal(spOob.valid, 0);
  assert.equal(spOob.baseOff, 0);
  assert.equal(spOob.loopSegment, -1);

  // ABI v10: map walk Game+0x1a738 + 0x0069d690 pure islands
  assert.equal(EXIT_MAP_1A738_OFF, 0x1a738);
  assert.equal(EXIT_MAP_NODE_KEY_OFF, 0x10);
  assert.equal(EXIT_MAP_NODE_FLAG_OFF, 0x28);
  assert.equal(EXIT_MAP_NODE_BEGIN_OFF, 0x44);
  assert.equal(EXIT_MAP_NODE_END_OFF, 0x48);
  assert.equal(EXIT_MAP_ELEM_STRIDE, 0x20);
  assert.equal(EXIT_MAP_ELEM_HOST_OFF, 0x18);
  assert.equal(EXIT_MSVC_STRING_SSO_CAP, 0x10);
  assert.equal(EXIT_MSVC_STRING_SIZE_OFF, 0x10);
  assert.equal(EXIT_MSVC_STRING_CAP_OFF, 0x14);
  assert.equal(exitMap1a738WalkNeeded(0x1000, 0x1000), false);
  assert.equal(exitMap1a738WalkNeeded(0x1000, 0x1004), true);
  assert.equal(exitMap1a738LookupHit(0x1000, 0x1000), false);
  assert.equal(exitMap1a738LookupHit(0x1000, 0x2000), true);
  assert.equal(exitMap1a738FlagActive(0), false);
  assert.equal(exitMap1a738FlagActive(1), true);
  assert.equal(exitMap1a738FlagActive(0xff), true);
  assert.equal(exitMap1a738ElemRangeNonempty(0x10, 0x10), false);
  assert.equal(exitMap1a738ElemRangeNonempty(0x10, 0x30), true);
  assert.equal(exitMap1a738ElemWalkNeeded(0x1, 0x1, 1, 0x10, 0x30), false); // miss
  assert.equal(exitMap1a738ElemWalkNeeded(0x1, 0x2, 0, 0x10, 0x30), false); // flag off
  assert.equal(exitMap1a738ElemWalkNeeded(0x1, 0x2, 1, 0x10, 0x10), false); // empty
  assert.equal(exitMap1a738ElemWalkNeeded(0x1, 0x2, 1, 0x10, 0x30), true);
  assert.equal(exitMap1a738ElemStride(), 0x20);
  assert.equal(exitMap1a738ElemHostOff(), 0x18);
  assert.equal(exitMsvcStringSsoInline(0), true);
  assert.equal(exitMsvcStringSsoInline(0xf), true);
  assert.equal(exitMsvcStringSsoInline(0x10), false);
  assert.equal(exitMsvcStringSsoInline(0x20), false);
  assert.equal(exitMsvcStringDataAddr(0x5000, 0xf, 0xdead), 0x5000);
  assert.equal(exitMsvcStringDataAddr(0x5000, 0x10, 0xdead), 0xdead);
  assert.equal(exitStringCompare([0x61], 1, [0x61], 1), 0);
  assert.equal(exitStringCompare([0x61], 1, [0x62], 1), -1);
  assert.equal(exitStringCompare([0x62], 1, [0x61], 1), 1);
  assert.equal(exitStringCompare([0x61, 0x62], 2, [0x61], 1), 1); // longer
  assert.equal(exitStringCompare([0x61], 1, [0x61, 0x62], 2), -1); // shorter
  assert.equal(exitStringCompare([1, 2, 3, 4, 5], 5, [1, 2, 3, 4, 5], 5), 0);
  assert.equal(exitStringCompare([1, 2, 3, 4, 9], 5, [1, 2, 3, 4, 5], 5), 1);
  assert.equal(exit69d690CandidateIsnil(0), false);
  assert.equal(exit69d690CandidateIsnil(1), true);
  assert.equal(exit69d690CmpIsHit(-1), false);
  assert.equal(exit69d690CmpIsHit(0), true);
  assert.equal(exit69d690CmpIsHit(1), true);
  assert.equal(exit69d690SelectResult(0xaa, 0xbb, 1, 0), 0xaa); // isnil miss
  assert.equal(exit69d690SelectResult(0xaa, 0xbb, 0, -1), 0xaa); // cmp miss
  assert.equal(exit69d690SelectResult(0xaa, 0xbb, 0, 0), 0xbb); // hit equal
  assert.equal(exit69d690SelectResult(0xaa, 0xbb, 0, 1), 0xbb); // hit >

  // ABI v11: lower_bound 0x00685bc0 pure islands
  assert.equal(EXIT_LOWER_BOUND_TRIPLE_SIZE, 12);
  assert.equal(EXIT_LOWER_BOUND_WALK_OFF, 0);
  assert.equal(EXIT_LOWER_BOUND_BOUND_OFF, 4);
  assert.equal(EXIT_LOWER_BOUND_BEST_OFF, 8);
  assert.equal(EXIT_MAP_ROOT_FROM_SENTINEL_OFF, 4);
  assert.deepEqual(exit685bc0InitTriple(0x1000, 0x2000), {
    walk: 0x2000,
    bound: 0,
    best: 0x1000,
  });
  assert.equal(exit685bc0RootIsEmpty(0), false);
  assert.equal(exit685bc0RootIsEmpty(1), true);
  assert.equal(exit685bc0CmpGoRight(-1), true);
  assert.equal(exit685bc0CmpGoRight(0), false);
  assert.equal(exit685bc0CmpGoRight(1), false);
  assert.deepEqual(exit685bc0Step({ best: 0x1000 }, 0x3000, 0x1111, 0x2222, -1), {
    walk: 0x2222,
    bound: 0,
    best: 0x1000,
  });
  assert.deepEqual(exit685bc0Step({ best: 0x1000 }, 0x3000, 0x1111, 0x2222, 0), {
    walk: 0x1111,
    bound: 1,
    best: 0x3000,
  });
  assert.deepEqual(exit685bc0Step({ best: 0x1000 }, 0x3000, 0x1111, 0x2222, 1), {
    walk: 0x1111,
    bound: 1,
    best: 0x3000,
  });
  assert.equal(exit685bc0LoopContinue(0), true);
  assert.equal(exit685bc0LoopContinue(1), false);

  // ABI v12: residual 0x0040c7f0 pure CF + stores + nested 0x0040cc10
  assert.equal(EXIT_40C7F0_ALLOC_SIZE, 0x18);
  assert.equal(EXIT_40C7F0_VTABLE, 0xb1a6e0);
  assert.equal(EXIT_40C7F0_ARG_OFF, 0x14);
  assert.equal(EXIT_40C7F0_PAIR_VALUE_OFF, 0);
  assert.equal(EXIT_40C7F0_PAIR_OBJ_OFF, 4);
  assert.equal(EXIT_40CC10_VTABLE, 0xb1a6fc);
  assert.equal(EXIT_40CC10_FIELD4, 0x10001);
  assert.equal(EXIT_40CC10_SUB_VTABLE, 0xb81c0c);
  assert.equal(EXIT_40CC10_DEFAULT_INIT, 0xa15770);
  assert.equal(exit40c7f0AllocSize(), 0x18);
  assert.equal(exit40c7f0AllocOk(0), false);
  assert.equal(exit40c7f0AllocOk(0x1000), true);
  assert.equal(exit40c7f0OldObjectPresent(0), false);
  assert.equal(exit40c7f0OldObjectPresent(0xabc), true);
  assert.equal(exit40c7f0CallbackNeeded(0, 0x1234), false);
  assert.equal(exit40c7f0CallbackNeeded(1, 0), false);
  assert.equal(exit40c7f0CallbackNeeded(1, 0x1234), true);
  assert.equal(exit40c7f0CallbackNeeded(0xff, 1), true);
  assert.deepEqual(exit40c7f0ObjectFinish(0), {
    vtable: 0xb1a6e0,
    arg: 0,
  });
  assert.deepEqual(exit40c7f0ObjectFinish(0x42), {
    vtable: 0xb1a6e0,
    arg: 0x42,
  });
  assert.deepEqual(exit40c7f0PairApply(0, 0x5000), { value: 0, obj: 0x5000 });
  assert.deepEqual(exit40c7f0PairApply(7, 0), { value: 7, obj: 0 });
  assert.deepEqual(exit40cc10PureFields(), {
    vtable: 0xb1a6fc,
    field4: 0x10001,
    subVtable: 0xb81c0c,
    fieldC: 0,
    field10: 0,
  });
  assert.equal(exit40cc10DefaultInitIsDirect(0xa15770), true);
  assert.equal(exit40cc10DefaultInitIsDirect(0), false);
  assert.equal(exit40cc10DefaultInitIsDirect(0xa15771), false);
  assert.equal(exit40cc10DefaultInitVa(), 0xa15770);
  assert.equal(exit40c7f0Vtable(), 0xb1a6e0);
  {
    // Offsets must be non-zero (0 is the freestanding null sentinel).
    const mem = new DataView(new ArrayBuffer(0x40));
    const OBJ = 0x10;
    const PAIR = 0x04;
    // poison
    for (let i = 0; i < 0x40; i++) mem.setUint8(i, 0xcd);
    exit40cc10Apply(mem, OBJ);
    assert.equal(mem.getUint32(OBJ, true), 0xb1a6fc);
    assert.equal(mem.getUint32(OBJ + 4, true), 0x10001);
    assert.equal(mem.getUint32(OBJ + 8, true), 0xb81c0c);
    assert.equal(mem.getUint8(OBJ + 0xc), 0);
    assert.equal(mem.getUint32(OBJ + 0x10, true), 0);
    exit40c7f0ObjectFinishApply(mem, OBJ, 0x99);
    assert.equal(mem.getUint32(OBJ, true), 0xb1a6e0); // derived vtable
    assert.equal(mem.getUint32(OBJ + EXIT_40C7F0_ARG_OFF, true), 0x99);
    exit40c7f0PairApplyBase(mem, PAIR, 0, OBJ);
    assert.equal(mem.getUint32(PAIR + EXIT_40C7F0_PAIR_VALUE_OFF, true), 0);
    assert.equal(mem.getUint32(PAIR + EXIT_40C7F0_PAIR_OBJ_OFF, true), OBJ);
  }

  // ABI v13: residual 0x00408830 pure CF + terminal pack
  assert.equal(EXIT_408830_FIELD_4_OFF, 4);
  assert.equal(EXIT_408830_FIELD_8_OFF, 8);
  assert.equal(EXIT_408830_FIELD_C_OFF, 0xc);
  assert.equal(EXIT_408830_FIELD_10_OFF, 0x10);
  assert.equal(EXIT_408830_ARG_COUNT_A_OFF, 0x1c);
  assert.equal(EXIT_408830_ARG_COUNT_B_OFF, 0x24);
  assert.equal(EXIT_408830_ELEM_SIZE, 4);
  assert.equal(EXIT_408830_F32_10_BITS, 0xbf800000);
  assert.equal(EXIT_408830_FILL_BYTE, 0xff);
  assert.equal(exit408830StoreArg(0), 0);
  assert.equal(exit408830StoreArg(0xabcd), 0xabcd);
  assert.equal(exit408830PtrFreeNeeded(0), false);
  assert.equal(exit408830PtrFreeNeeded(1), true);
  assert.equal(exit408830PtrClear(), 0);
  assert.equal(exit408830ArgPresent(0), false);
  assert.equal(exit408830ArgPresent(0x100), true);
  assert.equal(exit408830CountNonzero(0), false);
  assert.equal(exit408830CountNonzero(3), true);
  assert.equal(exit408830AllocSize(0), 0);
  assert.equal(exit408830AllocSize(1), 4);
  assert.equal(exit408830AllocSize(0x10), 0x40);
  // overflow: 0x40000000 * 4 = 0x100000000 â†’ 0xffffffff
  assert.equal(exit408830AllocSize(0x40000000), 0xffffffff);
  assert.equal(exit408830AllocSize(0xffffffff), 0xffffffff);
  assert.equal(exit408830FillSize(0), 0);
  assert.equal(exit408830FillSize(1), 4);
  assert.equal(exit408830FillSize(0x40000000), 0); // shl wraps u32
  assert.equal(exit408830FillByte(), 0xff);
  assert.equal(exit408830Field10Bits(), 0xbf800000);
  assert.deepEqual(exit408830Tail(), {
    field10: 0xbf800000,
    field14: 0,
    field18: 0,
    field1c: 0,
  });
  {
    const mem = new DataView(new ArrayBuffer(0x40));
    const THIS = 0x08;
    for (let i = 0; i < 0x40; i++) mem.setUint8(i, 0xcd);
    exit408830StoreArgApply(mem, THIS, 0); // Exit site always arg=0
    assert.equal(mem.getUint32(THIS + EXIT_408830_FIELD_4_OFF, true), 0);
    exit408830StoreArgApply(mem, THIS, 0x12345678);
    assert.equal(mem.getUint32(THIS + EXIT_408830_FIELD_4_OFF, true), 0x12345678);
    exit408830TailApply(mem, THIS);
    assert.equal(mem.getUint32(THIS + EXIT_408830_FIELD_10_OFF, true), 0xbf800000);
    assert.equal(mem.getUint8(THIS + EXIT_408830_FIELD_14_OFF), 0);
    assert.equal(mem.getUint32(THIS + EXIT_408830_FIELD_18_OFF, true), 0);
    assert.equal(mem.getUint32(THIS + EXIT_408830_FIELD_1C_OFF, true), 0);
  }

  // ABI v14: residual 0x009b4810 pure CF + terminal pack
  assert.equal(EXIT_9B4810_THIS_FROM_9B5CB0, 0x5b0);
  assert.equal(EXIT_9B4810_THIS_FROM_GAME, 0x24024);
  assert.equal(EXIT_9B4810_THIS_FROM_GAME, EXIT_9B5CB0_THIS_OFF + EXIT_9B4810_THIS_FROM_9B5CB0);
  assert.equal(EXIT_9B4810_ELEM_SIZE, 4);
  assert.equal(EXIT_F32_GLOBAL_C7B640_ADDR, 0x00c7b640);
  assert.equal(EXIT_F32_GLOBAL_C7B644_ADDR, 0x00c7b644);
  assert.equal(exitF32GlobalC7b640Addr(), EXIT_F32_GLOBAL_C7B640_ADDR);
  assert.equal(exitF32GlobalC7b644Addr(), EXIT_F32_GLOBAL_C7B644_ADDR);
  assert.equal(exit9b4810FirstPushValue(0), 0);
  assert.equal(exit9b4810FirstPushValue(3), 0);
  assert.equal(exit9b4810FirstPushValue(1), 1);
  assert.equal(exit9b4810FirstPushValue(2), 1);
  assert.equal(exit9b4810FirstPushValue(4), 1);
  assert.equal(exit9b4810ModeIs3(3), true);
  assert.equal(exit9b4810ModeIs3(0), false);
  assert.equal(exit9b4810ModeIs1(1), true);
  assert.equal(exit9b4810ModeLayerPath(1), true);
  assert.equal(exit9b4810ModeLayerPath(2), true);
  assert.equal(exit9b4810ModeLayerPath(0), false);
  assert.equal(exit9b4810ModeLayerPath(3), false);
  assert.equal(exit9b4810ModeBlockANeeded(3), false);
  assert.equal(exit9b4810ModeBlockANeeded(0), true);
  assert.equal(exit9b4810ModeBlockCNeeded(3), false);
  assert.equal(exit9b4810ModeBlockENeeded(1), true);
  assert.equal(exit9b4810ModeBlockFNeeded(1), false);
  assert.equal(exit9b4810ModeBlockFNeeded(0), true);
  assert.equal(exit9b4810VecSpace(0x100, 0x100), false);
  assert.equal(exit9b4810VecSpace(0x100, 0x104), true);
  assert.equal(exit9b4810VecEndAfterPush(0x100), 0x104);
  assert.equal(exit9b4810VecStore(7), 7);
  assert.deepEqual(exit9b4810VecPushPure(0x200, 9), { value: 9, newEnd: 0x204 });
  assert.equal(exit9b4810BlockACount(), EXIT_9B4810_BLOCK_A.length);
  assert.equal(exit9b4810BlockAAt(0), 2);
  assert.equal(exit9b4810BlockAAt(6), 0xf);
  assert.equal(exit9b4810BlockAAt(99), 0);
  assert.equal(exit9b4810BlockBCount(), 3);
  assert.equal(exit9b4810BlockBAt(1), 0xb);
  assert.equal(exit9b4810BlockCAt(0), 0xd);
  assert.equal(exit9b4810BlockDAt(0), 0xe);
  assert.equal(exit9b4810BlockEAt(2), 0x14);
  assert.equal(exit9b4810BlockFCount(), 7);
  assert.equal(exit9b4810BlockFAt(0), 0x15);
  assert.equal(exit9b4810BlockFAt(6), 0x1b);
  assert.equal(exit9b4810Value1c(), 0x1c);
  assert.equal(exit9b4810Push1cNeeded(1, 0, 1, 0, 0), true);
  assert.equal(exit9b4810Push1cNeeded(0, 1, 0, 0, 0), false); // manager != 2
  assert.equal(exit9b4810Push1cNeeded(0, 2, 1, 0, 0), false); // game null
  assert.equal(exit9b4810Push1cNeeded(0, 2, 0, 1, 0), true); // game_26630 > 0
  assert.equal(exit9b4810Push1cNeeded(0, 2, 0, 0, 1), true); // game_26589
  assert.equal(exit9b4810Push1cNeeded(0, 2, 0, 0, 0), false);
  assert.equal(exit9b4810LayerLoopNeeded(0), false);
  assert.equal(exit9b4810LayerLoopNeeded(1), true);
  assert.equal(exit9b4810LayerLoopNeeded(-1), false);
  assert.equal(exit9b4810CounterPlayNeeded(1, 0, 0, 0), true); // null str
  assert.equal(exit9b4810CounterPlayNeeded(0, 0, 0, 0), true); // strcmp ne
  assert.equal(exit9b4810CounterPlayNeeded(0, 1, 0, 0), false); // Counter match, flag34=0
  assert.equal(exit9b4810CounterPlayNeeded(0, 1, 1, 1), false); // this_17c != 0
  assert.equal(exit9b4810CounterPlayNeeded(0, 1, 1, 0), true); // play
  assert.equal(exit9b4810PlayFlagSet(), 1);
  assert.equal(exitF32GlobalC7b640Addr(), 0x00c7b640);
  assert.equal(exitF32GlobalC7b644Addr(), 0x00c7b644);
  assert.deepEqual(exit9b4810Tail(0x1111, 0x2222, 0x3760371c, 0x37873770), {
    field4: 0,
    field8: 0,
    field14: 0x1111,
    field18: 0x2222,
    field1c: 0x3760371c,
    field20: 0x37873770,
    field24c: 0,
    field250: 0,
    field254: 0,
  });
  assert.deepEqual(exit9b4810Tail(0x1111, 0x2222), {
    field4: 0,
    field8: 0,
    field14: 0x1111,
    field18: 0x2222,
    field1c: 0,
    field20: 0,
    field24c: 0,
    field250: 0,
    field254: 0,
  });
  {
    const mem = new DataView(new ArrayBuffer(0x300));
    const THIS = 0x10;
    const ARENA = 0x200;
    for (let i = 0; i < 0x300; i++) mem.setUint8(i, 0xcd);
    mem.setUint32(THIS + EXIT_9B4810_VEC_BEGIN_OFF, 0x00, true);
    mem.setUint32(THIS + EXIT_9B4810_VEC_END_OFF, 0x08, true);
    mem.setUint32(THIS + EXIT_9B4810_VEC_CAP_OFF, 0x10, true);
    exit9b4810VecResetEndApply(mem, THIS);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_VEC_END_OFF, true), 0x00);
    assert.equal(exit9b4810VecPushApply(mem, THIS, ARENA, 2), true);
    assert.equal(mem.getUint32(ARENA + 0x00, true), 2);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_VEC_END_OFF, true), 0x04);
    assert.equal(exit9b4810VecPushApply(mem, THIS, ARENA, 3), true);
    assert.equal(mem.getUint32(ARENA + 0x04, true), 3);
    // fill to cap
    mem.setUint32(THIS + EXIT_9B4810_VEC_END_OFF, 0x10, true);
    assert.equal(exit9b4810VecPushApply(mem, THIS, ARENA, 9), false);
    mem.setUint32(THIS + EXIT_9B4810_FIELD_C_OFF, 0xaaaa, true);
    mem.setUint32(THIS + EXIT_9B4810_FIELD_10_OFF, 0xbbbb, true);
    exit9b4810TailApply(mem, THIS, 0x3760371c, 0x37873770);
    assert.equal(mem.getUint8(THIS + EXIT_9B4810_FIELD_4_OFF), 0);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_8_OFF, true), 0);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_14_OFF, true), 0xaaaa);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_18_OFF, true), 0xbbbb);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_1C_OFF, true), 0x3760371c);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_20_OFF, true), 0x37873770);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_24C_OFF, true), 0);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_250_OFF, true), 0);
    assert.equal(mem.getUint32(THIS + EXIT_9B4810_FIELD_254_OFF, true), 0);
    exit9b4810PlayFlagApply(mem, THIS);
    assert.equal(
      mem.getUint8(THIS + EXIT_9B4810_ANM2_138_OFF + EXIT_9B4810_PLAY_FLAG_OFF),
      EXIT_9B4810_PLAY_FLAG_VALUE,
    );
  }

  // Pure-complete lower_bound / find over a tiny string-keyed tree:
  // head H (nil), root B ("b"), left A ("a"), right C ("c").
  {
    const mem = new DataView(new ArrayBuffer(0x200));
    const MAP = 0x04;
    const H = 0x20;
    const A = 0x60;
    const B = 0xa0;
    const C = 0xe0;
    const KEY = 0x140;
    const OUT = 0x160;
    const OUT_NODE = 0x170;

    const writeSso = (base, s) => {
      for (let i = 0; i < 16; i++) mem.setUint8(base + i, 0);
      for (let i = 0; i < s.length; i++) mem.setUint8(base + i, s.charCodeAt(i));
      mem.setUint32(base + EXIT_MSVC_STRING_SIZE_OFF, s.length, true);
      mem.setUint32(base + EXIT_MSVC_STRING_CAP_OFF, 0xf, true); // SSO
    };
    const link = (node, left, parent, right, isnil) => {
      mem.setUint32(node + EXIT_TREE_LEFT_OFF, left, true);
      mem.setUint32(node + EXIT_TREE_PARENT_OFF, parent, true);
      mem.setUint32(node + EXIT_TREE_RIGHT_OFF, right, true);
      mem.setUint8(node + EXIT_TREE_ISNIL_OFF, isnil);
    };
    mem.setUint32(MAP, H, true);
    link(H, A, B, C, 1); // parent = root B
    link(A, H, B, H, 0);
    writeSso(A + EXIT_MAP_NODE_KEY_OFF, "a");
    link(B, A, H, C, 0);
    writeSso(B + EXIT_MAP_NODE_KEY_OFF, "b");
    link(C, H, B, H, 0);
    writeSso(C + EXIT_MAP_NODE_KEY_OFF, "c");

    writeSso(KEY, "b");
    exitMapLowerBound(mem, MAP, OUT, KEY);
    assert.equal(mem.getUint32(OUT + EXIT_LOWER_BOUND_BEST_OFF, true), B);
    exitMapFind69d690(mem, MAP, OUT_NODE, KEY);
    assert.equal(mem.getUint32(OUT_NODE, true), B);

    writeSso(KEY, "a");
    exitMapFind69d690(mem, MAP, OUT_NODE, KEY);
    assert.equal(mem.getUint32(OUT_NODE, true), A);

    writeSso(KEY, "c");
    exitMapFind69d690(mem, MAP, OUT_NODE, KEY);
    assert.equal(mem.getUint32(OUT_NODE, true), C);

    writeSso(KEY, "d"); // miss (past c)
    exitMapLowerBound(mem, MAP, OUT, KEY);
    assert.equal(mem.getUint32(OUT + EXIT_LOWER_BOUND_BEST_OFF, true), H); // end
    exitMapFind69d690(mem, MAP, OUT_NODE, KEY);
    assert.equal(mem.getUint32(OUT_NODE, true), H);

    writeSso(KEY, "aa"); // between a and b â†’ lower_bound B, find miss
    exitMapLowerBound(mem, MAP, OUT, KEY);
    assert.equal(mem.getUint32(OUT + EXIT_LOWER_BOUND_BEST_OFF, true), B);
    exitMapFind69d690(mem, MAP, OUT_NODE, KEY);
    assert.equal(mem.getUint32(OUT_NODE, true), H);
  }

  // Tiny tree: head(nil) at H, leaf L as left child of H.
  // inorder next from L climbs to H.
  const tree = new DataView(new ArrayBuffer(0x80));
  const H = 0x10;
  const L = 0x30;
  // head: left=L, parent=H, right=H, isnil=1
  tree.setUint32(H + EXIT_TREE_LEFT_OFF, L, true);
  tree.setUint32(H + EXIT_TREE_PARENT_OFF, H, true);
  tree.setUint32(H + EXIT_TREE_RIGHT_OFF, H, true);
  tree.setUint8(H + EXIT_TREE_ISNIL_OFF, 1);
  // leaf: left=H, parent=H, right=H, isnil=0
  tree.setUint32(L + EXIT_TREE_LEFT_OFF, H, true);
  tree.setUint32(L + EXIT_TREE_PARENT_OFF, H, true);
  tree.setUint32(L + EXIT_TREE_RIGHT_OFF, H, true);
  tree.setUint8(L + EXIT_TREE_ISNIL_OFF, 0);
  const itOff = 0x00;
  tree.setUint32(itOff, L, true);
  assert.equal(exitTreeIteratorNext(tree, itOff), H);
  assert.equal(tree.getUint32(itOff, true), H);

  // Right-subtree leftmost: root R with right child A whose left is B.
  const R = 0x40;
  const A = 0x50;
  const B = 0x60;
  tree.setUint32(R + EXIT_TREE_LEFT_OFF, H, true);
  tree.setUint32(R + EXIT_TREE_PARENT_OFF, H, true);
  tree.setUint32(R + EXIT_TREE_RIGHT_OFF, A, true);
  tree.setUint8(R + EXIT_TREE_ISNIL_OFF, 0);
  tree.setUint32(A + EXIT_TREE_LEFT_OFF, B, true);
  tree.setUint32(A + EXIT_TREE_PARENT_OFF, R, true);
  tree.setUint32(A + EXIT_TREE_RIGHT_OFF, H, true);
  tree.setUint8(A + EXIT_TREE_ISNIL_OFF, 0);
  tree.setUint32(B + EXIT_TREE_LEFT_OFF, H, true);
  tree.setUint32(B + EXIT_TREE_PARENT_OFF, A, true);
  tree.setUint32(B + EXIT_TREE_RIGHT_OFF, H, true);
  tree.setUint8(B + EXIT_TREE_ISNIL_OFF, 0);
  tree.setUint32(itOff, R, true);
  assert.equal(exitTreeIteratorNext(tree, itOff), B);
  assert.equal(tree.getUint32(itOff, true), B);

  // --- ABI v25: 0x00841cf0 / 0x0083abb0 / range destroy / 0x0084bfd0 ---

  // Geometry constants read straight off the PE listing.
  assert.equal(EXIT_841CF0_P0_BASE_OFF, 0x10);
  assert.equal(EXIT_841CF0_P0_COUNT, 0x18);
  assert.equal(EXIT_841CF0_P0_STRIDE, 0x10);
  assert.equal(EXIT_841CF0_P0_PTR_VALUE, 0x00b1a4ec);
  assert.equal(EXIT_841CF0_HEAD_DWORD_OFF, 0xa);
  assert.equal(EXIT_841CF0_HEAD_BYTE_OFF, 0xe);
  assert.equal(EXIT_841CF0_HEAD_ZERO_BYTES, 5);
  assert.equal(EXIT_841CF0_P1_BASE_OFF, 0x200);
  assert.equal(EXIT_841CF0_P2_BASE_OFF, 0x190);
  assert.equal(EXIT_841CF0_VEC_BEGIN_OFF, 0x6a0);
  assert.equal(EXIT_841CF0_VEC_END_OFF, 0x6a4);
  assert.equal(EXIT_841CF0_HOST_6B0_OFF, 0x6b0);
  assert.equal(EXIT_841CF0_HOST_6CC_OFF, 0x6cc);
  assert.equal(EXIT_841CF0_TERMINAL_OFF, 0);

  // P0 runs [+0x10, +0x190); P2 starts exactly where P0 ends; P1 starts
  // exactly where P2 ends. Contiguity is a PE fact worth pinning.
  assert.equal(exit841cf0P0ElemOff(0), 0x10);
  assert.equal(exit841cf0P0ElemOff(0x17), 0x10 + 0x17 * 0x10);
  assert.equal(exit841cf0P0ElemOff(0x18), 0xffffffff);
  assert.equal(
    exit841cf0P0ElemOff(EXIT_841CF0_P0_COUNT - 1) + EXIT_841CF0_P0_STRIDE,
    EXIT_841CF0_P2_BASE_OFF,
  );
  assert.equal(
    exit841cf0P2ElemOff(EXIT_841CF0_P2_COUNT - 1) + EXIT_841CF0_P2_STRIDE,
    EXIT_841CF0_P1_BASE_OFF,
  );
  assert.equal(exit841cf0P1ElemOff(1), 0x218);
  assert.equal(exit841cf0P1ElemOff(2), 0xffffffff);
  assert.equal(exit841cf0P2ElemOff(3), 0x190 + 3 * 0x1c);
  assert.equal(exit841cf0P2ElemOff(4), 0xffffffff);
  assert.equal(exit841cf0P1HostPtr(0x1000, 0), 0x1208);
  assert.equal(exit841cf0P1HostPtr(0x1000, 1), 0x1220);
  assert.equal(exit841cf0P1HostPtr(0x1000, 2), 0);
  assert.equal(exit841cf0P2HostAPtr(0x1000, 0), 0x1198);
  assert.equal(exit841cf0P2HostBPtr(0x1000, 0), 0x11a0);
  assert.equal(exit841cf0P2HostAPtr(0x1000, 4), 0);
  assert.equal(exit841cf0P2HostNeeded(0), false);
  assert.equal(exit841cf0P2HostNeeded(1), true);
  assert.equal(exit841cf0VecElemHostPtr(0x2000), 0x2004);
  assert.equal(EXIT_841CF0_VEC_ELEM_HOST_OFF, 4);
  assert.equal(exit841cf0VecNext(0x2000), 0x200c);
  assert.equal(exit841cf0VecWalkNeeded(0x10, 0x10), false);
  assert.equal(exit841cf0VecWalkNeeded(0x10, 0x1c), true);
  assert.equal(exit841cf0VecWalkContinue(0x1c, 0x1c), false);
  assert.equal(exit841cf0VecElemCount(0x10, 0x10), 0);
  assert.equal(exit841cf0VecElemCount(0x10, 0x34), 3);
  assert.equal(exit841cf0VecElemCount(0x10, 0x35), 0); // not a multiple
  assert.equal(exit841cf0VecElemCount(0x40, 0x10), 0); // inverted range

  {
    const img = new DataView(new ArrayBuffer(0x700));
    for (let i = 0; i < 0x700; i++) img.setUint8(i, 0xa5);
    const plan = exit841cf0PureApply(img, 0, 0xfeedface);
    assert.equal(plan.p0, 0x18);
    assert.equal(plan.p1, 2);
    assert.equal(plan.p2, 4);
    for (let i = 0; i < EXIT_841CF0_P0_COUNT; i++) {
      const e = exit841cf0P0ElemOff(i);
      assert.equal(img.getUint32(e + EXIT_841CF0_P0_VALUE_OFF, true), 0);
      assert.equal(img.getUint8(e + EXIT_841CF0_P0_FLAG_OFF), 0);
      assert.equal(
        img.getUint32(e + EXIT_841CF0_P0_PTR_A_OFF, true),
        EXIT_841CF0_P0_PTR_VALUE,
      );
      assert.equal(
        img.getUint32(e + EXIT_841CF0_P0_PTR_B_OFF, true),
        EXIT_841CF0_P0_PTR_VALUE,
      );
    }
    // P0 element bytes +5..+7 are untouched by the PE loop.
    assert.equal(img.getUint8(EXIT_841CF0_P0_BASE_OFF + 5), 0xa5);
    for (let i = 0; i < EXIT_841CF0_HEAD_ZERO_BYTES; i++) {
      assert.equal(img.getUint8(EXIT_841CF0_HEAD_DWORD_OFF + i), 0);
    }
    assert.equal(img.getUint8(EXIT_841CF0_HEAD_DWORD_OFF - 1), 0xa5);
    assert.equal(img.getUint8(EXIT_841CF0_HEAD_BYTE_OFF + 1), 0xa5);
    for (let i = 0; i < EXIT_841CF0_P1_COUNT; i++) {
      const e = exit841cf0P1ElemOff(i);
      assert.equal(img.getUint32(e + 0, true), 0);
      assert.equal(img.getUint32(e + 4, true), 0);
      // Host pair object at elem+8 is untouched by the pure island.
      assert.equal(img.getUint32(e + EXIT_841CF0_P1_HOST_OFF, true), 0xa5a5a5a5);
    }
    for (let i = 0; i < EXIT_841CF0_P2_COUNT; i++) {
      const e = exit841cf0P2ElemOff(i);
      assert.equal(img.getUint32(e + 0, true), 0);
      assert.equal(img.getUint32(e + 4, true), 0);
      assert.equal(img.getUint32(e + EXIT_841CF0_P2_TAIL_OFF, true), 0);
      assert.equal(
        img.getUint32(e + EXIT_841CF0_P2_HOST_A_OFF, true),
        0xa5a5a5a5,
      );
      assert.equal(
        img.getUint32(e + EXIT_841CF0_P2_HOST_B_OFF, true),
        0xa5a5a5a5,
      );
    }
    assert.equal(img.getUint32(EXIT_841CF0_VEC_END_OFF, true), 0xfeedface);
    assert.equal(img.getUint32(EXIT_841CF0_VEC_BEGIN_OFF, true), 0xa5a5a5a5);
    assert.equal(img.getUint16(EXIT_841CF0_WORD_6AC_OFF, true), 0);
    assert.equal(img.getUint8(EXIT_841CF0_WORD_6AC_OFF + 2), 0xa5);
    assert.equal(img.getUint32(EXIT_841CF0_TERMINAL_OFF, true), 0);
  }

  // 0x0083abb0: two stride-0x14 blocks then terminal byte at +0x28.
  assert.equal(exit83abb0BlockBaseOff(0), 0);
  assert.equal(exit83abb0BlockBaseOff(1), EXIT_83ABB0_BLOCK_STRIDE);
  assert.equal(exit83abb0BlockBaseOff(2), 0xffffffff);
  assert.equal(exit83abb0ElemHostPtr(0x300), 0x304);
  assert.equal(exit83abb0ElemNext(0x300), 0x328);
  assert.equal(exit83abb0WalkNeeded(0x50, 0x50), false);
  assert.equal(exit83abb0WalkNeeded(0x50, 0x78), true);
  assert.equal(exit83abb0WalkContinue(0x78, 0x78), false);
  assert.equal(exit83abb0ElemCount(0x50, 0x50), 0);
  assert.equal(exit83abb0ElemCount(0x50, 0xa0), 2); // 2 * 0x28
  assert.equal(exit83abb0ElemCount(0x50, 0xa1), 0); // not a multiple
  assert.equal(exit83abb0ElemCount(0xa0, 0x50), 0); // inverted range
  {
    const img = new DataView(new ArrayBuffer(0x40));
    for (let i = 0; i < 0x40; i++) img.setUint8(i, 0x5a);
    exit83abb0Apply(img, 0, [0x11112222, 0x33334444]);
    assert.equal(img.getUint32(EXIT_83ABB0_FIELD0_OFF, true), 0);
    assert.equal(img.getUint8(EXIT_83ABB0_FLAG4_OFF), 0);
    assert.equal(img.getUint32(EXIT_83ABB0_VEC_END_OFF, true), 0x11112222);
    // begin and capacity slots stay host-owned.
    assert.equal(img.getUint32(EXIT_83ABB0_VEC_BEGIN_OFF, true), 0x5a5a5a5a);
    assert.equal(img.getUint32(0x10, true), 0x5a5a5a5a);
    const b1 = EXIT_83ABB0_BLOCK_STRIDE;
    assert.equal(img.getUint32(b1 + EXIT_83ABB0_FIELD0_OFF, true), 0);
    assert.equal(img.getUint8(b1 + EXIT_83ABB0_FLAG4_OFF), 0);
    assert.equal(img.getUint32(b1 + EXIT_83ABB0_VEC_END_OFF, true), 0x33334444);
    assert.equal(img.getUint8(EXIT_83ABB0_TERMINAL_OFF), 0);
    assert.equal(img.getUint8(EXIT_83ABB0_TERMINAL_OFF + 1), 0x5a);
  }

  // Shared range COM destroy CF (0x00709380 stride 0xc / 0x00709300 0x28).
  assert.equal(exitRangeDestroyStride709380(), EXIT_709380_ELEM_STRIDE);
  assert.equal(exitRangeDestroyStride709300(), EXIT_709300_ELEM_STRIDE);
  assert.equal(EXIT_709380_ELEM_STRIDE, EXIT_841CF0_VEC_ELEM_STRIDE);
  assert.equal(EXIT_709300_ELEM_STRIDE, EXIT_83ABB0_ELEM_STRIDE);
  assert.equal(exitRangeDestroyLoopNeeded(0x40, 0x40), false);
  assert.equal(exitRangeDestroyLoopNeeded(0x40, 0x4c), true);
  assert.equal(exitRangeDestroyContinue(0x4c, 0x4c), false);
  assert.equal(exitRangeDestroyCtrlPtr(0x40), 0x40 + EXIT_RANGE_DESTROY_CTRL_OFF);
  assert.equal(
    exitRangeDestroyCbArgPtr(0x40),
    0x40 + EXIT_RANGE_DESTROY_CB_ARG_OFF,
  );
  assert.equal(exitRangeDestroyNext(0x40, EXIT_709300_ELEM_STRIDE), 0x68);
  assert.equal(exitRangeDestroyCtrlPresent(0), false);
  assert.equal(exitRangeDestroyVirtualOk(0), false);
  assert.equal(exitRangeDestroyVirtualOk(0x100), false); // low byte only
  assert.equal(exitRangeDestroyVirtualOk(1), true);
  assert.equal(exitRangeDestroyCallbackNeeded(0, 1, 0x1234), false);
  assert.equal(exitRangeDestroyCallbackNeeded(0x900, 0, 0x1234), false);
  assert.equal(exitRangeDestroyCallbackNeeded(0x900, 1, 0), false);
  assert.equal(exitRangeDestroyCallbackNeeded(0x900, 1, 0x1234), true);
  assert.equal(EXIT_RANGE_DESTROY_CALLBACK_GLOBAL, EXIT_408640_CALLBACK_GLOBAL);
  assert.equal(EXIT_RANGE_DESTROY_VTBL_RELEASE_OFF, 0xc);

  // Pure-complete 0x0084bfd0.
  assert.equal(exit84bfd0BlockBaseOff(0), EXIT_84BFD0_BASE_OFF);
  assert.equal(
    exit84bfd0BlockBaseOff(1),
    EXIT_84BFD0_BASE_OFF + EXIT_84BFD0_BLOCK_STRIDE,
  );
  assert.equal(exit84bfd0BlockBaseOff(2), 0xffffffff);
  assert.equal(exit84bfd0SlotOff(0, 0), EXIT_84BFD0_BASE_OFF);
  assert.equal(exit84bfd0SlotOff(1, 50), 0x1e0 + 50 * 4);
  assert.equal(exit84bfd0SlotOff(0, 51), 0xffffffff);
  assert.equal(exit84bfd0F32Bits(), EXIT_84BFD0_F32_BITS);
  assert.equal(EXIT_84BFD0_THIS_FROM_9A19A0, 0x59a4);
  assert.equal(EXIT_84BFD0_THIS_FROM_GAME, 0x233a8);
  assert.equal(EXIT_84BFD0_ELEM_DWORDS * EXIT_84BFD0_ELEM_COUNT + 1,
    EXIT_84BFD0_BLOCK_DWORDS);
  {
    // Slot kinds: every 5th dword is special, first 6 untouched, last 4 float.
    const skipped = [];
    const floats = [];
    let zeros = 0;
    for (let i = 0; i < EXIT_84BFD0_BLOCK_DWORDS; i++) {
      const k = exit84bfd0SlotKind(i);
      if (k === EXIT_84BFD0_SLOT_SKIP) skipped.push(i);
      else if (k === EXIT_84BFD0_SLOT_FLOAT) floats.push(i);
      else zeros++;
    }
    assert.deepEqual(skipped, [4, 9, 14, 19, 24, 29]);
    assert.deepEqual(floats, [34, 39, 44, 49]);
    assert.equal(zeros, 41);
    assert.equal(exit84bfd0SlotKind(EXIT_84BFD0_BLOCK_DWORDS), 0xffffffff);
    for (let i = 0; i < EXIT_84BFD0_BLOCK_DWORDS; i++) {
      const elem = Math.floor(i / EXIT_84BFD0_ELEM_DWORDS);
      const pos = i % EXIT_84BFD0_ELEM_DWORDS;
      const expected =
        pos !== EXIT_84BFD0_ELEM_DWORDS - 1
          ? EXIT_84BFD0_SLOT_ZERO
          : elem < EXIT_84BFD0_FLOAT_ELEM_FIRST
            ? EXIT_84BFD0_SLOT_SKIP
            : EXIT_84BFD0_SLOT_FLOAT;
      assert.equal(exit84bfd0SlotKind(i), expected, `slot kind ${i}`);
    }
  }
  {
    const img = new DataView(new ArrayBuffer(0x300));
    for (let i = 0; i < 0x300; i++) img.setUint8(i, 0xcd);
    exit84bfd0Apply(img, 0);
    for (let b = 0; b < EXIT_84BFD0_BLOCK_COUNT; b++) {
      for (let i = 0; i < EXIT_84BFD0_BLOCK_DWORDS; i++) {
        const off = exit84bfd0SlotOff(b, i);
        const k = exit84bfd0SlotKind(i);
        const got = img.getUint32(off, true) >>> 0;
        if (k === EXIT_84BFD0_SLOT_SKIP) assert.equal(got, 0xcdcdcdcd);
        else if (k === EXIT_84BFD0_SLOT_FLOAT)
          assert.equal(got, EXIT_84BFD0_F32_BITS >>> 0);
        else assert.equal(got, 0);
      }
    }
    // Nothing before +0x114 or between the terminal byte and the end.
    assert.equal(img.getUint32(EXIT_84BFD0_BASE_OFF - 4, true), 0xcdcdcdcd);
    assert.equal(img.getUint8(EXIT_84BFD0_TERMINAL_OFF), 0);
    assert.equal(img.getUint8(EXIT_84BFD0_TERMINAL_OFF + 1), 0xcd);
    // Last written dword is block 1 index 50 at +0x2a8; +0x2ac is the byte.
    assert.equal(exit84bfd0SlotOff(1, 50) + 4, EXIT_84BFD0_TERMINAL_OFF);
  }

  // --- ABI v26: 0x00840f70 buffer free + 0x00709150 pair replace ---

  assert.equal(EXIT_9A27D0_SLOT_TRIPLE_STRIDE, EXIT_9A27D0_SLOT_FLAG_STRIDE);
  assert.equal(EXIT_840F70_SLOT_COUNT, 2);
  assert.equal(EXIT_840F70_SLOT_STRIDE, 4);
  assert.equal(EXIT_840F70_HEADER_DELTA, 4);
  assert.equal(EXIT_840F70_HEAP_STATS_GLOBAL, 0x00c7de78);
  assert.equal(EXIT_840F70_HEAP_STATS_DELTA, 0x30);
  assert.equal(EXIT_840F70_HEAP_STATS_FALLBACK, 0x00c7f618);
  assert.equal(EXIT_840F70_FREE_IAT_SLOT, 0x00b187dc);
  assert.equal(EXIT_840F70_STATS_LO_OFF, 0);
  assert.equal(EXIT_840F70_STATS_HI_OFF, 4);

  assert.equal(exit840f70SlotOff(0), 0);
  assert.equal(exit840f70SlotOff(1), 4);
  assert.equal(exit840f70SlotOff(2), 0xffffffff);
  assert.equal(exit840f70SlotPtr(0x9000, 1), 0x9004);
  assert.equal(exit840f70SlotPtr(0x9000, 2), 0);
  assert.equal(exit840f70FreeNeeded(0), false);
  assert.equal(exit840f70FreeNeeded(1), true);
  // Base select is the same idiom already recorded for v20 / v21.
  assert.equal(exit840f70HeapStatsBase(0), EXIT_840F70_HEAP_STATS_FALLBACK);
  assert.equal(exit840f70HeapStatsBase(0x2000), 0x2030);
  assert.equal(exit840f70FreeBasePtr(0x1000), 0xffc);
  assert.equal(exit840f70HeaderSizePtr(0x1000), 0xffc);
  // The free base wraps like the PE `add ecx, -4`.
  assert.equal(exit840f70FreeBasePtr(0), 0xfffffffc);
  assert.equal(exit840f70FreeBasePtr(2), 0xfffffffe);

  // 64-bit borrow subtract edges.
  assert.equal(exit840f70StatsSubLo(10, 4), 6);
  assert.equal(exit840f70StatsSubBorrow(10, 4), 0);
  assert.equal(exit840f70StatsSubHi(10, 7, 4), 7);
  assert.equal(exit840f70StatsSubLo(4, 10), 0xfffffffa);
  assert.equal(exit840f70StatsSubBorrow(4, 10), 1);
  assert.equal(exit840f70StatsSubHi(4, 7, 10), 6);
  assert.equal(exit840f70StatsSubBorrow(0, 0), 0); // equal â†’ no borrow
  assert.equal(exit840f70StatsSubBorrow(0, 1), 1);
  assert.equal(exit840f70StatsSubHi(0, 0, 1), 0xffffffff); // hi underflows
  assert.equal(exit840f70StatsSubLo(0xffffffff, 0xffffffff), 0);
  assert.equal(exit840f70StatsSubBorrow(0xffffffff, 0xffffffff), 0);
  {
    const stats = new DataView(new ArrayBuffer(16));
    stats.setUint32(EXIT_840F70_STATS_LO_OFF, 4, true);
    stats.setUint32(EXIT_840F70_STATS_HI_OFF, 1, true);
    exit840f70StatsSubAt(stats, 0, 10);
    assert.equal(stats.getUint32(EXIT_840F70_STATS_LO_OFF, true), 0xfffffffa);
    assert.equal(stats.getUint32(EXIT_840F70_STATS_HI_OFF, true), 0);
  }
  {
    // Both slots end at 0 regardless; only the free count differs.
    const img = new DataView(new ArrayBuffer(16));
    img.setUint32(0, 0, true);
    img.setUint32(4, 0, true);
    assert.equal(exit840f70Apply(img, 0), 0);
    img.setUint32(0, 0x1234, true);
    img.setUint32(4, 0, true);
    assert.equal(exit840f70Apply(img, 0), 1);
    assert.equal(img.getUint32(0, true), 0);
    img.setUint32(0, 0x1234, true);
    img.setUint32(4, 0x5678, true);
    assert.equal(exit840f70Apply(img, 0), 2);
    assert.equal(img.getUint32(0, true), 0);
    assert.equal(img.getUint32(4, true), 0);
  }
  {
    const p = exit840f70SlotPlan(0x8000, 1, 0x3004, 0, 0x20, 0x10, 5);
    assert.equal(p.slotPtr, 0x8004);
    assert.equal(p.freeNeeded, true);
    assert.equal(p.freeBasePtr, 0x3000);
    assert.equal(p.statsBase, EXIT_840F70_HEAP_STATS_FALLBACK);
    assert.equal(p.statsLoPtr, EXIT_840F70_HEAP_STATS_FALLBACK);
    assert.equal(p.statsHiPtr, EXIT_840F70_HEAP_STATS_FALLBACK + 4);
    assert.equal(p.statsLoAfter, 0xfffffff0);
    assert.equal(p.statsHiAfter, 4); // borrowed
    const skip = exit840f70SlotPlan(0x8000, 0, 0, 0x2000, 0x20, 0x10, 5);
    assert.equal(skip.freeNeeded, false);
    assert.equal(skip.freeBasePtr, 0);
    assert.equal(skip.statsBase, 0);
    assert.equal(skip.statsLoAfter, 0);
    assert.equal(skip.statsHiAfter, 0);
  }

  // 0x00709150 pair replace.
  assert.equal(exit709150AllocSize(), 0x18);
  assert.equal(EXIT_709150_STACK_ARG_BYTES, 4);
  assert.equal(EXIT_709150_VTBL_RELEASE_OFF, 0xc);
  // Its callback global differs from every other COM gate in this section.
  assert.equal(EXIT_709150_CALLBACK_GLOBAL, 0x00c71644);
  assert.notEqual(EXIT_709150_CALLBACK_GLOBAL, EXIT_RANGE_DESTROY_CALLBACK_GLOBAL);
  assert.notEqual(EXIT_709150_CALLBACK_GLOBAL, EXIT_408640_CALLBACK_GLOBAL);
  assert.notEqual(EXIT_709150_VTABLE, EXIT_40C7F0_VTABLE);
  assert.equal(exit709150AllocOk(0), false);
  assert.equal(exit709150AllocOk(0x40), true);
  assert.equal(exit709150NewObjectValue(0), 0);
  assert.equal(exit709150NewObjectValue(0x40), 0x40);
  assert.equal(exit709150OldObjectPresent(0), false);
  assert.equal(exit709150OldObjectPresent(0x70), true);
  assert.equal(exit709150VirtualOk(0), false);
  assert.equal(exit709150VirtualOk(0x100), false); // low byte only
  assert.equal(exit709150VirtualOk(1), true);
  assert.equal(exit709150CallbackNeeded(0, 1, 0x99), false);
  assert.equal(exit709150CallbackNeeded(0x70, 0, 0x99), false);
  assert.equal(exit709150CallbackNeeded(0x70, 1, 0), false);
  assert.equal(exit709150CallbackNeeded(0x70, 1, 0x99), true);
  {
    const obj = new DataView(new ArrayBuffer(0x20));
    for (let i = 0; i < 0x20; i++) obj.setUint8(i, 0x77);
    exit709150ObjectFinishApply(obj, 0);
    assert.equal(obj.getUint32(0, true) >>> 0, EXIT_709150_VTABLE >>> 0);
    assert.equal(obj.getUint32(EXIT_709150_FIELD_14_OFF, true), 0);
    assert.equal(obj.getUint32(8, true) >>> 0, 0x77777777); // untouched
  }
  {
    const pair = new DataView(new ArrayBuffer(8));
    pair.setUint32(0, 0xdeadbeef, true);
    pair.setUint32(4, 0xfeedface, true);
    exit709150PairApplyBase(pair, 0, 0x2020);
    // Value slot takes an immediate 0 â€” this is the 0x0040c7f0 difference.
    assert.equal(pair.getUint32(EXIT_709150_PAIR_VALUE_OFF, true), 0);
    assert.equal(pair.getUint32(EXIT_709150_PAIR_OBJ_OFF, true), 0x2020);
  }
  {
    const ok = exit709150Plan(0x5000, 0x900, 0x70, 1, 0x00c71644);
    assert.equal(ok.allocSize, 0x18);
    assert.equal(ok.allocOk, true);
    assert.equal(ok.newObject, 0x900);
    assert.equal(ok.ctorHostNeeded, true);
    assert.equal(ok.finishNeeded, true);
    assert.equal(ok.callbackNeeded, true);
    assert.equal(ok.valueSlotPtr, 0x5000);
    assert.equal(ok.objSlotPtr, 0x5004);
    assert.equal(ok.valueSlotAfter, 0);
    assert.equal(ok.objSlotAfter, 0x900);
    // Alloc failure: no ctor, no finish, pair object becomes null.
    const fail = exit709150Plan(0x5000, 0, 0, 0, 0);
    assert.equal(fail.allocOk, false);
    assert.equal(fail.newObject, 0);
    assert.equal(fail.ctorHostNeeded, false);
    assert.equal(fail.finishNeeded, false);
    assert.equal(fail.oldObjectPresent, false);
    assert.equal(fail.callbackNeeded, false);
    assert.equal(fail.objSlotAfter, 0);
    assert.equal(fail.valueSlotAfter, 0);
  }

  // --- ABI v27: teardown residual 0x00a1ad90 + host 0x00a648b0 shape ---

  assert.equal(EXIT_A1AD90_BLOCK_A_OFF, 0x28);
  assert.equal(EXIT_A1AD90_BLOCK_B_OFF, 0x3c);
  assert.equal(EXIT_A1AD90_HEADER_DELTA, 4);
  assert.equal(EXIT_A1AD90_ELEM_SIZE, 8);
  assert.equal(EXIT_A1AD90_ELEM_DTOR, 0x0040c440);
  assert.equal(EXIT_A1AD90_FREE_SIZE_ADD, 4);
  assert.equal(EXIT_A1AD90_TREE_OFF, 0x40);
  assert.equal(EXIT_A1AD90_TREE_SIZE_OFF, 0x44);
  assert.equal(EXIT_A1AD90_TERMINAL_BYTE_OFF, 0);
  assert.equal(EXIT_A1AD90_TERMINAL_24_OFF, 0x24);
  assert.equal(EXIT_A1AD90_TERMINAL_38_OFF, 0x38);

  assert.equal(exitA1ad90BlockANeeded(0), false);
  assert.equal(exitA1ad90BlockANeeded(1), true);
  assert.equal(exitA1ad90BlockBNeeded(0), false);
  assert.equal(exitA1ad90BlockBNeeded(0x80), true);
  assert.equal(exitA1ad90HeaderPtr(0x1000), 0xffc);
  assert.equal(exitA1ad90HeaderPtr(0), 0xfffffffc); // wraps like lea [eax-4]
  assert.equal(exitA1ad90ElemSize(), 8);
  assert.equal(exitA1ad90ElemDtor(), 0x0040c440);
  assert.equal(exitA1ad90TreeObjPtr(0x2000), 0x2040);
  assert.equal(exitA1ad90TreeHeadPtr(0x2000), 0x2040);
  assert.equal(exitA1ad90TreeSizePtr(0x2000), 0x2044);
  // _Root() lives at head+_Parent, matching the v9/v10/v11 tree model.
  assert.equal(exitA1ad90TreeRootPtr(0x3000), 0x3000 + EXIT_TREE_PARENT_OFF);
  assert.equal(EXIT_TREE_PARENT_OFF, 4);

  // Free size uses the POST-call count. These two must differ, otherwise
  // the recapture is untestable.
  assert.equal(exitA1ad90FreeSize(0), 4);
  assert.equal(exitA1ad90FreeSize(1), 12);
  assert.equal(exitA1ad90FreeSize(3), 28);
  assert.notEqual(exitA1ad90FreeSize(3), exitA1ad90FreeSize(4));
  // 32-bit wrap on the scaled count.
  assert.equal(exitA1ad90FreeSize(0xffffffff), 0xfffffffc);
  assert.equal(exitA1ad90FreeSize(0x20000000), 4); // 8 * 2^29 wraps to 0
  // The dtor count argument is the PRE-call value, unscaled.
  assert.equal(exitA1ad90DtorCountArg(7), 7);
  assert.equal(exitA1ad90DtorCountArg(0xffffffff), 0xffffffff);

  {
    // Terminal store at +0 is a BYTE: bytes +1..+3 must survive.
    const img = new DataView(new ArrayBuffer(0x50));
    for (let i = 0; i < 0x50; i++) img.setUint8(i, 0xbb);
    exitA1ad90Terminal(img, 0);
    assert.equal(img.getUint8(0), 0);
    assert.equal(img.getUint8(1), 0xbb);
    assert.equal(img.getUint8(2), 0xbb);
    assert.equal(img.getUint8(3), 0xbb);
    assert.equal(img.getUint32(EXIT_A1AD90_TERMINAL_24_OFF, true), 0);
    assert.equal(img.getUint32(EXIT_A1AD90_TERMINAL_38_OFF, true), 0);
  }
  {
    const img = new DataView(new ArrayBuffer(0x50));
    for (let i = 0; i < 0x50; i++) img.setUint8(i, 0xbb);
    img.setUint32(EXIT_A1AD90_BLOCK_A_OFF, 0, true);
    img.setUint32(EXIT_A1AD90_BLOCK_B_OFF, 0, true);
    assert.equal(exitA1ad90ApplyThis(img, 0), 0);
    img.setUint32(EXIT_A1AD90_BLOCK_A_OFF, 0x11, true);
    img.setUint32(EXIT_A1AD90_BLOCK_B_OFF, 0, true);
    assert.equal(exitA1ad90ApplyThis(img, 0), EXIT_A1AD90_HOST_A_NEEDED_BIT);
    img.setUint32(EXIT_A1AD90_BLOCK_A_OFF, 0, true);
    img.setUint32(EXIT_A1AD90_BLOCK_B_OFF, 0x22, true);
    assert.equal(exitA1ad90ApplyThis(img, 0), EXIT_A1AD90_HOST_B_NEEDED_BIT);
    img.setUint32(EXIT_A1AD90_BLOCK_A_OFF, 0x11, true);
    img.setUint32(EXIT_A1AD90_BLOCK_B_OFF, 0x22, true);
    assert.equal(
      exitA1ad90ApplyThis(img, 0),
      EXIT_A1AD90_HOST_A_NEEDED_BIT | EXIT_A1AD90_HOST_B_NEEDED_BIT,
    );
    assert.equal(img.getUint32(EXIT_A1AD90_BLOCK_A_OFF, true), 0);
    assert.equal(img.getUint32(EXIT_A1AD90_BLOCK_B_OFF, true), 0);
    assert.equal(img.getUint32(EXIT_A1AD90_TREE_SIZE_OFF, true), 0);
    // The head pointer field itself is NOT cleared by the PE.
    assert.equal(img.getUint32(EXIT_A1AD90_TREE_OFF, true) >>> 0, 0xbbbbbbbb);
  }
  {
    // Sentinel reset stores the pre-call head into all three link slots.
    const node = new DataView(new ArrayBuffer(0x20));
    for (let i = 0; i < 0x20; i++) node.setUint8(i, 0x33);
    exitA1ad90TreeResetAt(node, 0, 0xcafe0040);
    assert.equal(node.getUint32(EXIT_TREE_LEFT_OFF, true) >>> 0, 0xcafe0040);
    assert.equal(node.getUint32(EXIT_TREE_PARENT_OFF, true) >>> 0, 0xcafe0040);
    assert.equal(node.getUint32(EXIT_TREE_RIGHT_OFF, true) >>> 0, 0xcafe0040);
    // _Isnil byte at +0xd is untouched by the reset.
    assert.equal(node.getUint8(EXIT_TREE_ISNIL_OFF), 0x33);
  }
  {
    const p = exitA1ad90Plan(0x9000, 0x500, 0x604, 3, 5, 0x7000);
    assert.equal(p.blockANeeded, true);
    assert.equal(p.blockBNeeded, true);
    assert.equal(p.headerPtr, 0x600);
    assert.equal(p.freeBasePtr, 0x600);
    assert.equal(p.dtorBase, 0x604);
    assert.equal(p.dtorElemSize, 8);
    assert.equal(p.dtorCount, 3); // pre-call
    assert.equal(p.dtorFn, 0x0040c440);
    assert.equal(p.freeSize, 44); // 5 * 8 + 4, post-call
    assert.notEqual(p.freeSize, exitA1ad90FreeSize(p.dtorCount));
    assert.equal(p.treeObjPtr, 0x9040);
    assert.equal(p.treeSizePtr, 0x9044);
    assert.equal(p.treeRootPtr, 0x7004);
    const skip = exitA1ad90Plan(0x9000, 0, 0, 3, 5, 0x7000);
    assert.equal(skip.blockANeeded, false);
    assert.equal(skip.blockBNeeded, false);
    assert.equal(skip.headerPtr, 0);
    assert.equal(skip.dtorCount, 0);
    assert.equal(skip.freeSize, 0);
    // Block C is unconditional â€” the tree pointers are still produced.
    assert.equal(skip.treeObjPtr, 0x9040);
    assert.equal(skip.treeRootPtr, 0x7004);
  }

  // Host 0x00a648b0 call shape: LOW BYTE mode, pointer in EDX.
  assert.equal(EXIT_A648B0_MODE_MASK, 0xff);
  assert.equal(EXIT_A648B0_MODE_FREE, 1);
  assert.equal(EXIT_A648B0_HEADER_DELTA, 4);
  assert.equal(EXIT_A648B0_FREE_IAT_SLOT, EXIT_840F70_FREE_IAT_SLOT);
  assert.equal(EXIT_A648B0_HEAP_STATS_GLOBAL, EXIT_840F70_HEAP_STATS_GLOBAL);
  assert.equal(EXIT_A648B0_HEAP_STATS_DELTA, EXIT_840F70_HEAP_STATS_DELTA);
  assert.equal(EXIT_A648B0_HEAP_STATS_FALLBACK, EXIT_840F70_HEAP_STATS_FALLBACK);
  assert.equal(exitA648b0ModeFree(), 1);
  assert.equal(exitA648b0ModeFromCl(1), 1);
  // Callers leave `this` in the upper 24 bits; only CL matters.
  assert.equal(exitA648b0ModeFromCl(0xdeadbe01), 1);
  assert.equal(exitA648b0ModeFromCl(0x00000101), 1);
  assert.equal(exitA648b0ModeFromCl(0x00000100), 0);
  assert.equal(exitA648b0ModeFromCl(0xffffff00), 0);
  assert.equal(exitA648b0Mode1FreeNeeded(0), false);
  assert.equal(exitA648b0Mode1FreeNeeded(0x40), true);
  assert.equal(exitA648b0Mode1HeaderSizePtr(0x40), 0x3c);
  assert.equal(exitA648b0Mode1FreeBasePtr(0x40), 0x3c);
  assert.equal(exitA648b0Mode1FreeBasePtr(0), 0xfffffffc);
  // Same accounting arithmetic as 0x00840f70 (v26).
  assert.equal(exitA648b0HeapStatsBase(0), exit840f70HeapStatsBase(0));
  assert.equal(exitA648b0HeapStatsBase(0x5000), exit840f70HeapStatsBase(0x5000));

  // --- ABI v28: pair ctor 0x0040c4a0 + recursive _Erase 0x00415800 ---

  // 0x0040c4a0 shares four constants with its v12 assignment sibling...
  assert.equal(EXIT_40C4A0_ALLOC_SIZE, EXIT_40C7F0_ALLOC_SIZE);
  assert.equal(EXIT_40C4A0_VTABLE, EXIT_40C7F0_VTABLE);
  assert.equal(EXIT_40C4A0_ARG_OFF, EXIT_40C7F0_ARG_OFF);
  assert.equal(EXIT_40C4A0_PAIR_VALUE_OFF, EXIT_40C7F0_PAIR_VALUE_OFF);
  assert.equal(EXIT_40C4A0_PAIR_OBJ_OFF, EXIT_40C7F0_PAIR_OBJ_OFF);
  // ...and uses the widely-shared COM callback global, NOT 0x00709150's.
  assert.equal(EXIT_40C4A0_CALLBACK_GLOBAL, EXIT_408640_CALLBACK_GLOBAL);
  assert.notEqual(EXIT_40C4A0_CALLBACK_GLOBAL, EXIT_709150_CALLBACK_GLOBAL);
  assert.notEqual(EXIT_40C4A0_VTABLE, EXIT_709150_VTABLE);
  assert.equal(EXIT_40C4A0_STACK_ARG_BYTES, 4);
  assert.equal(EXIT_40C4A0_VTBL_RELEASE_OFF, 0xc);

  assert.equal(exit40c4a0AllocSize(), 0x18);
  assert.equal(exit40c4a0AllocOk(0), false);
  assert.equal(exit40c4a0AllocOk(0x900), true);
  assert.equal(exit40c4a0NewObjectValue(0), 0);
  assert.equal(exit40c4a0NewObjectValue(0x900), 0x900);
  assert.equal(exit40c4a0OldObjectPresent(0), false);
  assert.equal(exit40c4a0OldObjectPresent(0x70), true);
  assert.equal(exit40c4a0VirtualOk(0), false);
  assert.equal(exit40c4a0VirtualOk(0x100), false); // low byte only
  assert.equal(exit40c4a0VirtualOk(1), true);
  assert.equal(exit40c4a0CallbackNeeded(0, 1, 0x99), false);
  assert.equal(exit40c4a0CallbackNeeded(0x70, 0, 0x99), false);
  assert.equal(exit40c4a0CallbackNeeded(0x70, 1, 0), false);
  assert.equal(exit40c4a0CallbackNeeded(0x70, 1, 0x99), true);
  assert.equal(exit40c4a0ReturnValue(0x1234), 0x1234);

  {
    // The entry zero is the distinguishing store: it runs before the
    // allocator and clears BOTH slots.
    const pair = new DataView(new ArrayBuffer(0x10));
    pair.setUint32(EXIT_40C4A0_PAIR_VALUE_OFF, 0xdeadbeef, true);
    pair.setUint32(EXIT_40C4A0_PAIR_OBJ_OFF, 0xfeedface, true);
    pair.setUint32(8, 0x5a5a5a5a, true);
    exit40c4a0EntryZeroAt(pair, 0);
    assert.equal(pair.getUint32(EXIT_40C4A0_PAIR_VALUE_OFF, true), 0);
    assert.equal(pair.getUint32(EXIT_40C4A0_PAIR_OBJ_OFF, true), 0);
    assert.equal(pair.getUint32(8, true) >>> 0, 0x5a5a5a5a);
  }
  {
    const obj = new DataView(new ArrayBuffer(0x20));
    for (let i = 0; i < 0x20; i++) obj.setUint8(i, 0x77);
    exit40c4a0ObjectFinishApply(obj, 0, 0xabcd1234);
    assert.equal(obj.getUint32(0, true) >>> 0, EXIT_40C4A0_VTABLE >>> 0);
    assert.equal(obj.getUint32(EXIT_40C4A0_ARG_OFF, true) >>> 0, 0xabcd1234);
    assert.equal(obj.getUint32(8, true) >>> 0, 0x77777777);
  }
  {
    // Terminal pair store carries the stack arg into the value slot â€”
    // unlike 0x00709150, which stores an immediate 0 there.
    const pair = new DataView(new ArrayBuffer(0x10));
    exit40c4a0PairApplyBase(pair, 0, 0x2020, 0x3030);
    assert.equal(pair.getUint32(EXIT_40C4A0_PAIR_OBJ_OFF, true), 0x2020);
    assert.equal(pair.getUint32(EXIT_40C4A0_PAIR_VALUE_OFF, true), 0x3030);
    assert.notEqual(pair.getUint32(EXIT_40C4A0_PAIR_VALUE_OFF, true), 0);
  }
  {
    const ok = exit40c4a0Plan(0x5000, 0x777, 0x900, 0x70, 1, 0x00c7163c);
    assert.equal(ok.allocOk, true);
    assert.equal(ok.newObject, 0x900);
    assert.equal(ok.argSlotPtr, 0x900 + EXIT_40C4A0_ARG_OFF);
    assert.equal(ok.oldObjectPresent, true);
    assert.equal(ok.callbackNeeded, true);
    assert.equal(ok.valueSlotAfter, 0x777);
    assert.equal(ok.objSlotAfter, 0x900);
    assert.equal(ok.returnValue, 0x5000);
    // The normal path: the entry zero means the recaptured old object is 0,
    // so the COM release does not run â€” but the value is still an input.
    const dead = exit40c4a0Plan(0x5000, 0x777, 0x900, 0, 1, 0x00c7163c);
    assert.equal(dead.oldObjectPresent, false);
    assert.equal(dead.callbackNeeded, false);
    assert.equal(dead.objSlotAfter, 0x900);
    const fail = exit40c4a0Plan(0x5000, 0x777, 0, 0, 0, 0);
    assert.equal(fail.allocOk, false);
    assert.equal(fail.newObject, 0);
    assert.equal(fail.ctorHostNeeded, false);
    assert.equal(fail.argSlotPtr, 0);
    assert.equal(fail.objSlotAfter, 0);
    assert.equal(fail.valueSlotAfter, 0x777); // value slot still takes the arg
  }

  // 0x00415800 shares its node geometry with the v9 global tree walk.
  assert.equal(EXIT_415800_NODE_SIZE, EXIT_40E910_NODE_SIZE);
  assert.equal(EXIT_415800_CTRL_OFF, EXIT_40E910_NODE_OBJ_OFF);
  assert.equal(EXIT_415800_COM_SLOT_OFF, 0x14);
  assert.equal(EXIT_415800_STACK_ARG_BYTES, 8);
  assert.equal(EXIT_415800_CALLBACK_GLOBAL, EXIT_408640_CALLBACK_GLOBAL);
  assert.equal(exit415800FreeSize(), 0x1c);
  // _Isnil is a byte test: only the low byte may decide the loop.
  assert.equal(exit415800WalkContinue(0), true);
  assert.equal(exit415800WalkContinue(1), false);
  assert.equal(exit415800WalkContinue(0xff), false);
  assert.equal(exit415800WalkContinue(0x100), true); // low byte is 0
  assert.equal(exit415800RecurseNodePtr(0x400), 0x400 + EXIT_TREE_RIGHT_OFF);
  assert.equal(exit415800NextNodePtr(0x400), 0x400 + EXIT_TREE_LEFT_OFF);
  assert.equal(exit415800ComSlotPtr(0x400), 0x414);
  assert.equal(exit415800CtrlPtr(0x400), 0x418);
  assert.equal(exit415800CtrlPresent(0), false);
  assert.equal(exit415800CtrlPresent(9), true);
  assert.equal(exit415800VirtualOk(0x100), false); // low byte only
  assert.equal(exit415800CallbackNeeded(0, 1, 0x99), false);
  assert.equal(exit415800CallbackNeeded(9, 0, 0x99), false);
  assert.equal(exit415800CallbackNeeded(9, 1, 0), false);
  assert.equal(exit415800CallbackNeeded(9, 1, 0x99), true);
  {
    // Free order is reverse in-order (right, self, left) â€” NOT in-order.
    const v = new DataView(new ArrayBuffer(0x400));
    const H = 0x20, A = 0x60, B = 0xa0, C = 0xe0;
    const node = (n, l, p, r, nil) => {
      v.setUint32(n + EXIT_TREE_LEFT_OFF, l, true);
      v.setUint32(n + EXIT_TREE_PARENT_OFF, p, true);
      v.setUint32(n + EXIT_TREE_RIGHT_OFF, r, true);
      v.setUint8(n + EXIT_TREE_ISNIL_OFF, nil);
    };
    node(H, A, B, C, 1);
    node(A, H, B, H, 0);
    node(B, A, H, C, 0);
    node(C, H, B, H, 0);
    const r = exit415800FreeOrder(v, B, 16);
    assert.equal(r.overflow, false);
    assert.deepEqual(r.nodes, [C, B, A]);
    // In-order would be [A, B, C]; assert we are not that.
    assert.notDeepEqual(r.nodes, [A, B, C]);
    // Erasing a nil node frees nothing.
    assert.deepEqual(exit415800FreeOrder(v, H, 16).nodes, []);
    // A right-only chain frees deepest-first.
    const R0 = 0x140, R1 = 0x180, R2 = 0x1c0;
    node(R0, H, H, R1, 0);
    node(R1, H, R0, R2, 0);
    node(R2, H, R1, H, 0);
    assert.deepEqual(exit415800FreeOrder(v, R0, 16).nodes, [R2, R1, R0]);
    // A left-only chain frees shallowest-first.
    const L0 = 0x200, L1 = 0x240, L2 = 0x280;
    node(L0, L1, H, H, 0);
    node(L1, L2, L0, H, 0);
    node(L2, H, L1, H, 0);
    assert.deepEqual(exit415800FreeOrder(v, L0, 16).nodes, [L0, L1, L2]);
    // Output-bound overflow is signalled, not silently truncated.
    assert.equal(exit415800FreeOrder(v, B, 2).overflow, true);
    assert.equal(exit415800FreeOrder(v, B, 3).overflow, false);
  }
});

// Scratch linear-memory base â€” 1 MiB, per DECOMP_PROTOCOL.md.
//
// Two distinct hazards live in low linear memory, and the second only bites
// helpers that have a real stack frame:
//
//   1. static data / constant tables â€” this module's initial image ends at
//      0x46d (the SFX id table and friends). Scratch writes below that
//      silently rewrite module constants: a table-driven helper starts
//      returning garbage while arithmetic-only helpers keep passing.
//   2. the C shadow stack â€” Emscripten places 64 KiB immediately after
//      static data. Measured base here: 0x10470, growing DOWN, so it owns
//      the whole window [~0x470, 0x10470].
//
// A base of 0x1000 â€” and the old "32768 and up" rule of thumb â€” is INSIDE
// that window. Leaf helpers with no locals never reach far enough down to
// touch it, which is why it went unnoticed for 27 ABI versions; the first
// helper here with a 256-byte local array (isaac_exit_415800_free_order)
// put its frame at 0x10370..0x10468 and silently corrupted the tree image
// mid-traversal, producing a bogus overflow. Both failure modes are silent:
// no trap, no error, just wrong values.
//
// Everything below is MEM-relative, so sitting above both regions fixes it.
const MEM = 0x100000;

test("Wasm zero-import exports match JS oracle on fixed cases", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);

  assert.equal(exp.session(0), 0);
  assert.equal(exp.session(1), 1);
  assert.equal(exp.session(0x80), 1);

  assert.equal(exp.overlay(0), 0);
  assert.equal(exp.overlay(2), 1);
  assert.equal(exp.overlay(1), 0);

  assert.equal(exp.gsIo(0), 1);
  assert.equal(exp.gsIo(1), 0);
  assert.equal(exp.gsWrite(0), 0);
  assert.equal(exp.gsWrite(1), 1);
  assert.equal(exp.gsWrite(0x100), 0);

  // Full-dword steam gate (PE @ 0x006fa1f0): raw word nonzero + cloud byte.
  assert.equal(exp.pgdCloud(1, 1), 1);
  assert.equal(exp.pgdCloud(1, 0), 0);
  assert.equal(exp.pgdCloud(0, 0), 0);
  assert.equal(exp.pgdCloud(0, 1), 0);
  // Wide-value draws across the boundary unmasked — a byte-masked mutant
  // (v29-era) returns 0 for these and must fail here (mutation check).
  assert.equal(exp.pgdCloud(0x100, 1), 1);
  assert.equal(exp.pgdCloud(0x1ff, 1), 1);
  assert.equal(exp.pgdCloud(0xffffffff, 1), 1);
  assert.equal(exp.pgdCloud(0x10000, 0), 0);
  assert.equal(exp.pgdNeeded(1, 1), 1);
  assert.equal(exp.pgdNeeded(0, 1), 0);

  assert.equal(exp.sfxId(0), 0x256);
  assert.equal(exp.sfxId(1), 599);
  assert.equal(exp.sfxId(2), 600);
  assert.equal(exp.sfxId(3), 0x259);
  assert.equal(exp.sfxId(4), 0x3f0);
  assert.equal(exp.sfxId(5), 0);

  assert.equal(exp.vectorNeeded(0, 0), 0);
  assert.equal(exp.vectorNeeded(0, 0x38), 1);
  assert.equal(exp.vectorCount(0, 0x70), 2);
  assert.equal(exp.vectorCount(1, 0x10), 0);

  const view = new DataView(exp.memory.buffer);
  const fPtr = MEM;
  writeF32(view, fPtr, 0.1);
  writeF32(view, fPtr + 4, 0.2);
  exp.floats(fPtr, fPtr + 4);
  assert.equal(readF32(view, fPtr), Math.fround(1));
  assert.equal(readF32(view, fPtr + 4), Math.fround(1));

  const cmPtr = MEM + 16;
  writeU8(view, cmPtr, 1);
  assert.equal(exp.pgdPrep(cmPtr, 1), 1);
  assert.equal(readU8(view, cmPtr), 0);
  writeU8(view, cmPtr, 1);
  assert.equal(exp.pgdPrep(cmPtr, 0), 0);
  assert.equal(readU8(view, cmPtr), 1);
  writeU8(view, cmPtr, 0);
  assert.equal(exp.pgdPrep(cmPtr, 1), 0);

  const st = MEM + 64;
  writeI32(view, st + TEARDOWN.field2510c, 11);
  writeI32(view, st + TEARDOWN.field2593c, 22);
  writeI32(view, st + TEARDOWN.field25948, 33);
  writeI32(view, st + TEARDOWN.field2590c, 44);
  writeI32(view, st + TEARDOWN.gate1d520, 55);
  writeI32(view, st + TEARDOWN.gate1d654, 66);
  writeU8(view, st + TEARDOWN.skipTimed, 7);
  exp.teardown(st);
  assert.equal(readI32(view, st + TEARDOWN.field2510c), 0);
  assert.equal(readI32(view, st + TEARDOWN.field2593c), 0);
  assert.equal(readI32(view, st + TEARDOWN.field25948), 0);
  assert.equal(readI32(view, st + TEARDOWN.field2590c), 0);
  assert.equal(readI32(view, st + TEARDOWN.gate1d520), 0);
  assert.equal(readI32(view, st + TEARDOWN.gate1d654), 0);
  assert.equal(readU8(view, st + TEARDOWN.skipTimed), 0);

  // PE-ordered islands
  const a = MEM + 200;
  const b = MEM + 204;
  writeI32(view, a, 9);
  writeI32(view, b, 8);
  exp.t0(a, b);
  assert.equal(readI32(view, a), 0);
  assert.equal(readI32(view, b), 0);
  writeI32(view, a, 1);
  writeI32(view, b, 2);
  writeI32(view, MEM + 208, 3);
  exp.t1(a, b, MEM + 208);
  assert.equal(readI32(view, a), 0);
  assert.equal(readI32(view, MEM + 208), 0);
  writeI32(view, a, 4);
  exp.t2(a);
  assert.equal(readI32(view, a), 0);
  writeU8(view, a, 9);
  exp.t4(a);
  assert.equal(readU8(view, a), 0);

  const endPtr = MEM + 220;
  writeU32(view, endPtr, 0xdeadbeef);
  exp.vectorClear(endPtr, 0x00001234);
  assert.equal(readU32(view, endPtr), 0x00001234);

  writeU8(view, MEM + 240, 1);
  exp.pgdReadonly(MEM + 240);
  assert.equal(readU8(view, MEM + 240), 0);

  // post-log pack
  const pl = MEM + 256;
  for (let i = 0; i < POSTLOG.size; i++) writeU8(view, pl + i, 0xab);
  exp.postlog(pl, EXIT_POSTLOG_F32_1BA90_BITS, EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(readI32(view, pl + POSTLOG.field1bb70), 0);
  assert.equal(readI32(view, pl + POSTLOG.gate1b83c), 0);
  assert.equal(readI32(view, pl + POSTLOG.field1ba80), 50);
  assert.equal(readF32(view, pl + POSTLOG.field1ba90), f32Bits(EXIT_POSTLOG_F32_1BA90_BITS));
  assert.equal(readF32(view, pl + POSTLOG.field1ba94), f32Bits(EXIT_POSTLOG_F32_1BA94_BITS));
  assert.equal(readU8(view, pl + POSTLOG.field1ba84), 0);

  writeI32(view, MEM + 400, 2);
  writeI32(view, MEM + 404, 3);
  exp.overlayClear(MEM + 400, MEM + 404);
  assert.equal(readI32(view, MEM + 400), 0);
  assert.equal(readI32(view, MEM + 404), 0);

  writeI32(view, MEM + 408, 99);
  exp.ctr265c0(MEM + 408);
  assert.equal(readI32(view, MEM + 408), 0);
  writeU16(view, MEM + 412, 0x0101);
  exp.sessionPair(MEM + 412);
  assert.equal(readU16(view, MEM + 412), 0);

  // 6f43b0 prefix
  const pr = MEM + 420;
  writeU16(view, pr + PREFIX.field26588, 0xffff);
  writeI32(view, pr + PREFIX.field264f8, 1);
  writeI32(view, pr + PREFIX.field264fc, 2);
  writeI32(view, pr + PREFIX.field26508, 3);
  exp.prefix6f43b0(pr);
  assert.equal(readU16(view, pr + PREFIX.field26588), 0);
  assert.equal(readI32(view, pr + PREFIX.field264f8), 0);

  // 6f4520
  const s = MEM + 512;
  for (let i = 0; i < L4520.size; i++) writeU8(view, s + i, 0x5a);
  writeI32(view, s + L4520.field269d4, 0x0abcdef0);
  exp.apply6f4520(s);
  assert.equal(readI32(view, s + L4520.field26554), 0);
  assert.equal(readI32(view, s + L4520.field2652c), 30);
  assert.equal(readF32(view, s + L4520.field26530), Math.fround(1));
  assert.equal(readI32(view, s + L4520.field269c4), 1);
  assert.equal(readI32(view, s + L4520.field269d8), 0x0abcdef0);
  assert.equal(readI32(view, s + L4520.field676ac), -1);
  assert.equal(readI32(view, s + L4520.field26574), 10);
  assert.equal(readU8(view, s + L4520.field26540), 0);
  for (let i = 0; i < EXIT_6F4520_EFFECT_SLOT_COUNT; i++) {
    const base = s + L4520.effectSlots + i * SLOT;
    assert.equal(readI32(view, base), 0);
    assert.equal(readI32(view, base + 4), 0);
    assert.equal(readU8(view, base + 8), 0);
  }

  // mid
  const md = MEM + 900;
  for (let i = 0; i < MID.size; i++) writeU8(view, md + i, 0xcc);
  exp.mid6f43b0(md);
  assert.equal(readI32(view, md + MID.field264f4), 0);
  assert.equal(readI32(view, md + MID.counter265c0), 0);
  assert.equal(readU8(view, md + MID.field26638), 0);

  // tail
  const tl = MEM + 1000;
  for (let i = 0; i < TAIL.size; i++) writeU8(view, tl + i, 0x11);
  writeI32(view, tl + TAIL.field6774c, 0x777);
  exp.tail6f43b0(tl);
  assert.equal(readF32(view, tl + TAIL.pack676b8), Math.fround(1));
  assert.equal(readF32(view, tl + TAIL.pack676b8 + 12), Math.fround(0));
  assert.equal(readI32(view, tl + TAIL.field67750), 0x777);
  assert.equal(readF32(view, tl + TAIL.field67740), f32Bits(0x3a83126f));
  assert.equal(readF32(view, tl + TAIL.field676c8), Math.fround(0));
  assert.equal(readF32(view, tl + TAIL.field676cc), Math.fround(1));

  // ABI v3 residual peels
  writeI32(view, MEM + 1100, 7);
  writeI32(view, MEM + 1104, 8);
  exp.modePair(MEM + 1100, MEM + 1104);
  assert.equal(readI32(view, MEM + 1100), 0);
  assert.equal(readI32(view, MEM + 1104), 0);

  assert.equal(exp.volNeeded(Math.fround(1)), 0);
  assert.equal(exp.volNeeded(Math.fround(0.5)), 1);
  // NaN: bit pattern via setUint32
  const nanBits = 0x7fc00000;
  const nanBuf = new ArrayBuffer(4);
  new DataView(nanBuf).setUint32(0, nanBits, true);
  const nanF = new DataView(nanBuf).getFloat32(0, true);
  assert.equal(exp.volNeeded(nanF), 1);

  writeF32(view, MEM + 1112, 0.25);
  exp.set2a334(MEM + 1112);
  assert.equal(readF32(view, MEM + 1112), Math.fround(1));
  writeF32(view, MEM + 1116, 0);
  exp.set2a338(MEM + 1116);
  assert.equal(readF32(view, MEM + 1116), f32Bits(EXIT_MANAGER_2A338_BITS));

  assert.equal(exp.slotNeeded(0, 4), 0);
  assert.equal(exp.slotNeeded(1, 0), 0);
  assert.equal(exp.slotNeeded(2, 3), 1);

  // single entity copy +0x30 â†’ +0x34
  const ent = MEM + 0x2000;
  writeU32(view, ent + EXIT_RESIDUAL_ENTITY_SRC_OFF, 0xaabbccdd);
  writeU32(view, ent + EXIT_RESIDUAL_ENTITY_DST_OFF, 0);
  exp.entityCopy(ent);
  assert.equal(readU32(view, ent + EXIT_RESIDUAL_ENTITY_DST_OFF), 0xaabbccdd);

  // batch of 3
  const batch = MEM + 0x2100;
  for (let i = 0; i < 3; i++) {
    const e = batch + i * EXIT_RESIDUAL_ENTITY_STRIDE;
    writeU32(view, e + EXIT_RESIDUAL_ENTITY_SRC_OFF, 0x1000 + i);
    writeU32(view, e + EXIT_RESIDUAL_ENTITY_DST_OFF, 0);
  }
  exp.entityBatch(batch, 3);
  for (let i = 0; i < 3; i++) {
    const e = batch + i * EXIT_RESIDUAL_ENTITY_STRIDE;
    assert.equal(readU32(view, e + EXIT_RESIDUAL_ENTITY_DST_OFF), 0x1000 + i);
  }

  // full 18990 nest: one active mid slot at outer 0 mid 0
  const game = MEM + 0x4000;
  // zero the residual region
  const nestBytes = EXIT_RESIDUAL_OUTER_COUNT * EXIT_RESIDUAL_OUTER_STRIDE;
  for (let i = 0; i < nestBytes; i++) writeU8(view, game + EXIT_RESIDUAL_BASE_OFF + i, 0);
  const entities = MEM + 0x8000;
  const count = 2;
  for (let i = 0; i < count; i++) {
    const e = entities + i * EXIT_RESIDUAL_ENTITY_STRIDE;
    writeU32(view, e + EXIT_RESIDUAL_ENTITY_SRC_OFF, 0x55550000 + i);
    writeU32(view, e + EXIT_RESIDUAL_ENTITY_DST_OFF, 0);
  }
  const slot0 = game + EXIT_RESIDUAL_BASE_OFF;
  writeU32(view, slot0 - 4, entities); // entity base as linear offset
  writeU32(view, slot0, count);
  writeU8(view, slot0 + 0xc, 1);
  exp.residual18990(game);
  for (let i = 0; i < count; i++) {
    const e = entities + i * EXIT_RESIDUAL_ENTITY_STRIDE;
    assert.equal(readU32(view, e + EXIT_RESIDUAL_ENTITY_DST_OFF), 0x55550000 + i);
  }
  // inactive path: flag 0 leaves dst unchanged
  writeU32(view, entities + EXIT_RESIDUAL_ENTITY_DST_OFF, 0x111);
  writeU8(view, slot0 + 0xc, 0);
  writeU32(view, entities + EXIT_RESIDUAL_ENTITY_SRC_OFF, 0x999);
  exp.residual18990(game);
  assert.equal(readU32(view, entities + EXIT_RESIDUAL_ENTITY_DST_OFF), 0x111);

  writeU8(view, MEM + 1120, 5);
  exp.flag28(MEM + 1120);
  assert.equal(readU8(view, MEM + 1120), 0);

  // ABI v4: 0x009b5cb0 pure prefix struct + pointer form
  const p9 = MEM + 0x1200;
  writeI32(view, p9 + PREFIX9B.menuState0, 7);
  writeI32(view, p9 + PREFIX9B.field8, 9);
  writeI32(view, p9 + PREFIX9B.field24, 1);
  writeI32(view, p9 + PREFIX9B.field28, 2);
  writeU8(view, p9 + PREFIX9B.field1454, 0xaa);
  exp.prefix9b5cb0(p9);
  assert.equal(readI32(view, p9 + PREFIX9B.menuState0), 0);
  assert.equal(readI32(view, p9 + PREFIX9B.field8), EXIT_9B5CB0_FIELD_8_VALUE);
  assert.equal(readI32(view, p9 + PREFIX9B.field24), 0);
  assert.equal(readI32(view, p9 + PREFIX9B.field28), 0);
  assert.equal(readU8(view, p9 + PREFIX9B.field1454), 0);

  const m0 = MEM + 0x1240;
  const f8 = MEM + 0x1244;
  const f24 = MEM + 0x1248;
  const f28 = MEM + 0x124c;
  const f1454 = MEM + 0x1250;
  writeI32(view, m0, 11);
  writeI32(view, f8, 12);
  writeI32(view, f24, 13);
  writeI32(view, f28, 14);
  writeU8(view, f1454, 15);
  exp.prefix9b5cb0Ptrs(m0, f8, f24, f28, f1454);
  assert.equal(readI32(view, m0), 0);
  assert.equal(readI32(view, f8), 2);
  assert.equal(readI32(view, f24), 0);
  assert.equal(readI32(view, f28), 0);
  assert.equal(readU8(view, f1454), 0);
  // null-safe: zero pointers skip (Wasm null = 0)
  writeI32(view, m0, 99);
  writeI32(view, f8, 99);
  exp.prefix9b5cb0Ptrs(m0, 0, 0, 0, 0);
  assert.equal(readI32(view, m0), 0);
  assert.equal(readI32(view, f8), 99); // skipped

  // ABI v5: 0x008d3250 pure islands
  const p0 = MEM + 0x1300;
  for (let i = 0; i < P0_8D.size; i++) writeU8(view, p0 + i, 0xee);
  exp.p08d3250(p0);
  assert.equal(readU8(view, p0 + P0_8D.field10), 0);
  assert.equal(readI32(view, p0 + P0_8D.field14), 0);
  assert.equal(readI32(view, p0 + P0_8D.field30), 0);
  assert.equal(readI32(view, p0 + P0_8D.field34), 0);
  assert.equal(readI32(view, p0 + P0_8D.field38), 0);

  const p0a = MEM + 0x1340;
  const p0b = MEM + 0x1344;
  const p0c = MEM + 0x1348;
  const p0d = MEM + 0x134c;
  const p0e = MEM + 0x1350;
  writeU8(view, p0a, 1);
  writeI32(view, p0b, 2);
  writeI32(view, p0c, 3);
  writeI32(view, p0d, 4);
  writeI32(view, p0e, 5);
  exp.p08d3250Ptrs(p0a, p0b, p0c, p0d, p0e);
  assert.equal(readU8(view, p0a), 0);
  assert.equal(readI32(view, p0b), 0);
  assert.equal(readI32(view, p0e), 0);

  writeI32(view, MEM + 0x1360, 1);
  writeI32(view, MEM + 0x1364, 2);
  writeI32(view, MEM + 0x1368, 3);
  exp.p18d3250(MEM + 0x1360, MEM + 0x1364, MEM + 0x1368);
  assert.equal(readI32(view, MEM + 0x1360), 0);
  assert.equal(readI32(view, MEM + 0x1364), 0);
  assert.equal(readI32(view, MEM + 0x1368), 0);

  writeI32(view, MEM + 0x1370, 9);
  writeI32(view, MEM + 0x1374, 8);
  writeI32(view, MEM + 0x1378, 7);
  exp.p28d3250(MEM + 0x1370, MEM + 0x1374, MEM + 0x1378);
  assert.equal(readI32(view, MEM + 0x1370), 0);
  assert.equal(readI32(view, MEM + 0x1378), 0);

  const p3 = MEM + 0x1380;
  for (let i = 0; i < P3_8D.size; i++) writeU8(view, p3 + i, 0x55);
  exp.p38d3250(p3);
  assert.equal(readI32(view, p3 + P3_8D.field178), -1);
  assert.equal(readI32(view, p3 + P3_8D.field17c), 0);
  assert.equal(readI32(view, p3 + P3_8D.field180), 0);
  assert.equal(readI32(view, p3 + P3_8D.field648), 0);
  assert.equal(readI32(view, p3 + P3_8D.field64c), 0);

  writeI32(view, MEM + 0x13a0, 0);
  writeI32(view, MEM + 0x13a4, 1);
  writeI32(view, MEM + 0x13a8, 2);
  writeI32(view, MEM + 0x13ac, 3);
  writeI32(view, MEM + 0x13b0, 4);
  exp.p38d3250Ptrs(
    MEM + 0x13a0,
    MEM + 0x13a4,
    MEM + 0x13a8,
    MEM + 0x13ac,
    MEM + 0x13b0,
  );
  assert.equal(readI32(view, MEM + 0x13a0), -1);
  assert.equal(readI32(view, MEM + 0x13a4), 0);

  assert.equal(exp.cursorLayerNeeded(0), 0);
  assert.equal(exp.cursorLayerNeeded(1), 1);
  assert.equal(exp.cursorLayerNeeded(0x80), 1);

  const p4 = MEM + 0x13c0;
  writeI32(view, p4 + P4_8D.field18, 0x0a0b0c0d);
  writeI32(view, p4 + P4_8D.field1c, 1);
  writeI32(view, p4 + P4_8D.field24, 2);
  writeI32(view, p4 + P4_8D.field28, 3);
  writeI32(view, p4 + P4_8D.field2c, 4);
  exp.p48d3250(p4);
  assert.equal(readI32(view, p4 + P4_8D.field18), 0x0a0b0c0d);
  assert.equal(readI32(view, p4 + P4_8D.field1c), 0x0a0b0c0d);
  assert.equal(readI32(view, p4 + P4_8D.field24), 0);
  assert.equal(readI32(view, p4 + P4_8D.field28), 0);
  assert.equal(readI32(view, p4 + P4_8D.field2c), 0);

  writeI32(view, MEM + 0x1400, 0x11223344);
  writeI32(view, MEM + 0x1404, 9);
  writeI32(view, MEM + 0x1408, 8);
  writeI32(view, MEM + 0x140c, 7);
  writeI32(view, MEM + 0x1410, 6);
  exp.p48d3250Ptrs(
    MEM + 0x1400,
    MEM + 0x1404,
    MEM + 0x1408,
    MEM + 0x140c,
    MEM + 0x1410,
  );
  assert.equal(readI32(view, MEM + 0x1400), 0x11223344);
  assert.equal(readI32(view, MEM + 0x1404), 0x11223344);
  assert.equal(readI32(view, MEM + 0x1408), 0);

  assert.equal(exp.listHostNeeded(0), 0);
  assert.equal(exp.listHostNeeded(0xabcd), 1);

  const sent = MEM + 0x1500;
  const countOff = MEM + 0x1520;
  writeU32(view, sent, 0x11111111);
  writeU32(view, sent + 4, 0x22222222);
  writeU32(view, sent + 8, 0x33333333);
  writeU32(view, countOff, 5);
  exp.listEmpty(sent, sent, countOff);
  assert.equal(readU32(view, sent), sent);
  assert.equal(readU32(view, sent + 4), sent);
  assert.equal(readU32(view, sent + 8), sent);
  assert.equal(readU32(view, countOff), 0);

  // ABI v6: 0x009b9150 pure islands
  const p0pm = MEM + 0x1600;
  writeI32(view, p0pm + P0_9B9150.fieldC8, 11);
  writeI32(view, p0pm + P0_9B9150.fieldCc, 22);
  exp.p09b9150(p0pm);
  assert.equal(readI32(view, p0pm + P0_9B9150.fieldC8), 0);
  assert.equal(readI32(view, p0pm + P0_9B9150.fieldCc), 0);

  writeI32(view, MEM + 0x1610, 7);
  writeI32(view, MEM + 0x1614, 8);
  exp.p09b9150Ptrs(MEM + 0x1610, MEM + 0x1614);
  assert.equal(readI32(view, MEM + 0x1610), 0);
  assert.equal(readI32(view, MEM + 0x1614), 0);
  writeI32(view, MEM + 0x1610, 99);
  exp.p09b9150Ptrs(MEM + 0x1610, 0);
  assert.equal(readI32(view, MEM + 0x1610), 0);

  assert.equal(exp.playerListNeeded(0x1000, 0x1000), 0);
  assert.equal(exp.playerListNeeded(0x1000, 0x1003), 0);
  assert.equal(exp.playerListNeeded(0x1000, 0x1004), 1);
  writeU32(view, MEM + 0x1620, 0xdeadbeef);
  exp.playerListClearEnd(MEM + 0x1620, 0x1000);
  assert.equal(readU32(view, MEM + 0x1620), 0x1000);

  assert.equal(exp.extraListCount(0x2000, 0x2000), 0);
  assert.equal(exp.extraListCount(0x2000, 0x2010), 4);
  assert.equal(exp.extraListNeeded(0x2000, 0x2000), 0);
  assert.equal(exp.extraListNeeded(0x2000, 0x2004), 1);
  writeU32(view, MEM + 0x1630, 0xcafe);
  exp.extraListClearEnd(MEM + 0x1630, 0x2000);
  assert.equal(readU32(view, MEM + 0x1630), 0x2000);

  assert.equal(exp.ptrHostNeeded(0), 0);
  assert.equal(exp.ptrHostNeeded(1), 1);
  writeU32(view, MEM + 0x1640, 0x111);
  exp.slotClear(MEM + 0x1640);
  assert.equal(readU32(view, MEM + 0x1640), 0);

  const esau = MEM + 0x1650;
  for (let i = 0; i < 4; i++) writeU32(view, esau + i * 4, 0x100 + i);
  exp.esauSlotsClear(esau);
  for (let i = 0; i < 4; i++) assert.equal(readU32(view, esau + i * 4), 0);

  const mid = MEM + 0x1680;
  writeI32(view, mid + MID_9B9150.field7c, 5);
  writeU8(view, mid + MID_9B9150.field5c, 0);
  exp.mid9b9150(mid);
  assert.equal(readI32(view, mid + MID_9B9150.field7c), 0);
  assert.equal(readU8(view, mid + MID_9B9150.field5c), 1);

  writeI32(view, MEM + 0x1690, 3);
  writeU8(view, MEM + 0x1694, 0);
  exp.mid9b9150Ptrs(MEM + 0x1690, MEM + 0x1694);
  assert.equal(readI32(view, MEM + 0x1690), 0);
  assert.equal(readU8(view, MEM + 0x1694), 1);

  const tail = MEM + 0x16a0;
  for (let i = 0; i < 4; i++) writeI32(view, tail + i * 4, i + 1);
  exp.tail9b9150(tail);
  for (let i = 0; i < 4; i++) assert.equal(readI32(view, tail + i * 4), -1);

  for (let i = 0; i < 4; i++) writeI32(view, MEM + 0x16c0 + i * 4, 9);
  exp.tail9b9150Ptrs(MEM + 0x16c0);
  for (let i = 0; i < 4; i++) assert.equal(readI32(view, MEM + 0x16c0 + i * 4), -1);

  // ABI v7: 0x009a27d0 pure islands
  writeU8(view, MEM + 0x1700, 0xab);
  exp.slotFlagClear9a27d0(MEM + 0x1700);
  assert.equal(readU8(view, MEM + 0x1700), 0);

  const packed = MEM + 0x1710;
  for (let i = 0; i < EXIT_9A27D0_SLOT_FLAG_COUNT; i++) writeU8(view, packed + i, i + 1);
  exp.slotFlagsPacked9a27d0(packed);
  for (let i = 0; i < EXIT_9A27D0_SLOT_FLAG_COUNT; i++) {
    assert.equal(readU8(view, packed + i), 0);
  }

  assert.equal(exp.slotFlagOff9a27d0(0) >>> 0, EXIT_9A27D0_SLOT_FLAG_BASE_OFF);
  assert.equal(
    exp.slotFlagOff9a27d0(1) >>> 0,
    EXIT_9A27D0_SLOT_FLAG_BASE_OFF + EXIT_9A27D0_SLOT_FLAG_STRIDE,
  );
  assert.equal(exp.slotFlagOff9a27d0(11) >>> 0, 0xffffffff);

  // Strided apply: this image large enough for +0x3ce4 + 10*0x1f4
  // MEM-relative: a raw 0x2000 base spanned 0x2000..0x706c, i.e. straight
  // through the shadow-stack window documented at the MEM definition.
  const thisBase = MEM + 0x10000;
  const lastFlag =
    thisBase + EXIT_9A27D0_SLOT_FLAG_BASE_OFF + 10 * EXIT_9A27D0_SLOT_FLAG_STRIDE;
  while (lastFlag + 1 > exp.memory.buffer.byteLength) {
    exp.memory.grow(1);
  }
  const viewApply = new DataView(exp.memory.buffer);
  for (let i = 0; i < EXIT_9A27D0_SLOT_FLAG_COUNT; i++) {
    writeU8(
      viewApply,
      thisBase + EXIT_9A27D0_SLOT_FLAG_BASE_OFF + i * EXIT_9A27D0_SLOT_FLAG_STRIDE,
      0x5a,
    );
  }
  exp.slotFlagsApply9a27d0(thisBase);
  for (let i = 0; i < EXIT_9A27D0_SLOT_FLAG_COUNT; i++) {
    assert.equal(
      readU8(
        viewApply,
        thisBase + EXIT_9A27D0_SLOT_FLAG_BASE_OFF + i * EXIT_9A27D0_SLOT_FLAG_STRIDE,
      ),
      0,
    );
  }

  writeU8(viewApply, MEM + 0x1720, 9);
  exp.field54cdClear9a27d0(MEM + 0x1720);
  assert.equal(readU8(viewApply, MEM + 0x1720), 0);

  // ABI v8: 0x009a19a0 pure islands
  const pfx = MEM + 0x1800;
  writeF32(viewApply, pfx + PREFIX_9A19A0.field5490, 3.5);
  writeI32(viewApply, pfx + PREFIX_9A19A0.field5494, 9);
  writeI32(viewApply, pfx + PREFIX_9A19A0.field5498, 8);
  writeU8(viewApply, pfx + PREFIX_9A19A0.field549c, 7);
  writeI32(viewApply, pfx + PREFIX_9A19A0.field54d0, 6);
  writeU8(viewApply, pfx + PREFIX_9A19A0.field54d4, 5);
  writeI32(viewApply, pfx + PREFIX_9A19A0.field54d8, 4);
  exp.prefix9a19a0(pfx);
  assert.equal(readF32(viewApply, pfx + PREFIX_9A19A0.field5490), f32Bits(EXIT_9A19A0_F32_5490_BITS));
  assert.equal(readI32(viewApply, pfx + PREFIX_9A19A0.field5494), -1);
  assert.equal(readI32(viewApply, pfx + PREFIX_9A19A0.field5498), -1);
  assert.equal(readU8(viewApply, pfx + PREFIX_9A19A0.field549c), 0);
  assert.equal(readI32(viewApply, pfx + PREFIX_9A19A0.field54d0), 2);
  assert.equal(readU8(viewApply, pfx + PREFIX_9A19A0.field54d4), 0);
  assert.equal(readI32(viewApply, pfx + PREFIX_9A19A0.field54d8), 2);

  writeF32(viewApply, MEM + 0x1840, 1);
  writeI32(viewApply, MEM + 0x1844, 1);
  writeI32(viewApply, MEM + 0x1848, 1);
  writeU8(viewApply, MEM + 0x184c, 1);
  writeI32(viewApply, MEM + 0x1850, 1);
  writeU8(viewApply, MEM + 0x1854, 1);
  writeI32(viewApply, MEM + 0x1858, 1);
  exp.prefix9a19a0Ptrs(
    MEM + 0x1840,
    MEM + 0x1844,
    MEM + 0x1848,
    MEM + 0x184c,
    MEM + 0x1850,
    MEM + 0x1854,
    MEM + 0x1858,
  );
  assert.equal(readF32(viewApply, MEM + 0x1840), f32Bits(EXIT_9A19A0_F32_5490_BITS));
  assert.equal(readI32(viewApply, MEM + 0x1844), -1);
  assert.equal(readI32(viewApply, MEM + 0x1848), -1);
  assert.equal(readU8(viewApply, MEM + 0x184c), 0);
  assert.equal(readI32(viewApply, MEM + 0x1850), 2);
  assert.equal(readU8(viewApply, MEM + 0x1854), 0);
  assert.equal(readI32(viewApply, MEM + 0x1858), 2);

  writeU32(viewApply, MEM + 0x1860, 0);
  writeU16(viewApply, MEM + 0x1864, 0);
  exp.slotSetup9a19a0(MEM + 0x1860, MEM + 0x1864, 0xcafebabe, 5);
  assert.equal(readU32(viewApply, MEM + 0x1860), 0xcafebabe);
  assert.equal(readU16(viewApply, MEM + 0x1864), 5);

  assert.equal(exp.slotBaseOff9a19a0(0) >>> 0, 0);
  assert.equal(exp.slotBaseOff9a19a0(1) >>> 0, EXIT_9A19A0_PLAYERHUD_STRIDE);
  assert.equal(exp.slotBaseOff9a19a0(8) >>> 0, 0xffffffff);

  // MEM-relative (was a raw 0x3000, inside the shadow-stack window).
  const slotThis = MEM + 0x20000;
  const slotEnd =
    slotThis +
    (EXIT_9A19A0_PLAYERHUD_LOOP_COUNT - 1) * EXIT_9A19A0_PLAYERHUD_STRIDE +
    EXIT_9A19A0_SLOT_INDEX_OFF +
    2;
  // Grow once for everything `viewSlots` will touch below (highest is the
  // 0x009b4810 arena at MEM+0x40000). Growing after the DataView exists
  // detaches it, so all growth for this view has to happen here.
  const slotsTop = Math.max(slotEnd, MEM + 0x40040);
  while (slotsTop > exp.memory.buffer.byteLength) {
    exp.memory.grow(1);
  }
  const viewSlots = new DataView(exp.memory.buffer);
  for (let i = 0; i < EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; i++) {
    writeU32(
      viewSlots,
      slotThis + i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_BACKPTR_OFF,
      0x22222222,
    );
    writeU16(
      viewSlots,
      slotThis + i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_INDEX_OFF,
      0xeeee,
    );
  }
  exp.slotsApply9a19a0(slotThis, 0x0a19a000);
  for (let i = 0; i < EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; i++) {
    assert.equal(
      readU32(
        viewSlots,
        slotThis + i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_BACKPTR_OFF,
      ),
      0x0a19a000,
    );
    assert.equal(
      readU16(
        viewSlots,
        slotThis + i * EXIT_9A19A0_PLAYERHUD_STRIDE + EXIT_9A19A0_SLOT_INDEX_OFF,
      ),
      i,
    );
  }

  writeU8(viewSlots, MEM + 0x1870, 0);
  exp.field54ccSet9a19a0(MEM + 0x1870);
  assert.equal(readU8(viewSlots, MEM + 0x1870), EXIT_9A19A0_FIELD_54CC_VALUE);

  // ABI v9: 0x0040e910 pure CF + freestanding tree iterator++
  assert.equal(exp.listHostNeeded40e910(0x1000, 0x1000), 0);
  assert.equal(exp.listHostNeeded40e910(0x1000, 0x1004), 1);
  assert.equal(exp.nodeObjectPresent40e910(0), 0);
  assert.equal(exp.nodeObjectPresent40e910(0xabc), 1);
  assert.equal(exp.freeAfterComNeeded40e910(0), 1);
  assert.equal(exp.freeAfterComNeeded40e910(2), 1);
  assert.equal(exp.freeAfterComNeeded40e910(3), 0);
  assert.equal(exp.freeAfterComNeeded40e910(0x10002), 1);
  assert.equal(exp.freeAfterComNeeded40e910(0x10003), 0);
  assert.equal(exp.postEraseDtorNeeded40e910(0), 0);
  assert.equal(exp.postEraseDtorNeeded40e910(1), 1);
  assert.equal(exp.postEraseCallbackNeeded40e910(0, 0x1234), 0);
  assert.equal(exp.postEraseCallbackNeeded40e910(1, 0), 0);
  assert.equal(exp.postEraseCallbackNeeded40e910(1, 0x1234), 1);
  assert.equal(exp.freeSize40e910() >>> 0, EXIT_40E910_NODE_SIZE);

  // ABI v41: 0x0040e910 decision laws — wide args NOT pre-masked
  assert.equal(exp.walkContinue40e910(0x1000, 0x1000), 0);
  assert.equal(exp.walkContinue40e910(0x1000, 0x1004), 1);
  assert.equal(exp.walkContinue40e910(0xffffffff, 0), 1);
  assert.equal(exp.comIfaceAddr40e910(0x1234) >>> 0, 0x123c);
  assert.equal(exp.comIfaceAddr40e910(0xfffffff8) >>> 0, 0); // u32 wrap
  assert.equal(exp.comReleaseArg40e910() >>> 0, EXIT_40E910_COM_RELEASE_ARG);
  assert.equal(exp.comStateWord40e910(0) >>> 0, 0);
  assert.equal(exp.comStateWord40e910(2) >>> 0, 2);
  assert.equal(exp.comStateWord40e910(0x10002) >>> 0, 2);
  assert.equal(exp.comStateWord40e910(0xffffffff) >>> 0, 0xffff);

  // ABI v41: 0x009a27d0 per-slot triple decision laws — WIDE args NOT
  // pre-masked (FULL u32 index; OOB -> 0xffffffff).
  assert.equal(exp.slotTripleBaseOff9a27d0(0) >>> 0, 0x3cdc);
  assert.equal(exp.slotTripleBaseOff9a27d0(6) >>> 0, 0x3cdc + 6 * 0x1f4);
  assert.equal(exp.slotTripleBaseOff9a27d0(7) >>> 0, 0x3cdc + 7 * 0x1f4);
  assert.equal(exp.slotTripleBaseOff9a27d0(10) >>> 0, 0x3cdc + 10 * 0x1f4);
  assert.equal(exp.slotTripleBaseOff9a27d0(0x100) >>> 0, 0xffffffff);
  assert.equal(exp.slotTripleBaseOff9a27d0(0xffffffff) >>> 0, 0xffffffff);
  assert.equal(exp.slotResetOff9a27d0(0) >>> 0, 0x3cfc);
  assert.equal(exp.slotResetOff9a27d0(10) >>> 0, 0x3cfc + 10 * 0x1f4);
  assert.equal(exp.slotResetOff9a27d0(0x100) >>> 0, 0xffffffff);
  assert.equal(exp.slot709150Off9a27d0(0) >>> 0, 0x3cf4);
  assert.equal(exp.slot709150Off9a27d0(10) >>> 0, 0x3cf4 + 10 * 0x1f4);
  assert.equal(exp.slot709150Off9a27d0(0x100) >>> 0, 0xffffffff);
  assert.equal(exp.slot709150Arg9a27d0(0) >>> 0, 0x3cfc);
  assert.equal(exp.slot709150Arg9a27d0(10) >>> 0, 0x3cfc + 10 * 0x1f4);
  assert.equal(exp.slot709150Arg9a27d0(0x100) >>> 0, 0xffffffff);
  assert.equal(exp.slotLoopSegment9a27d0(0), 0);
  assert.equal(exp.slotLoopSegment9a27d0(1), 1);
  assert.equal(exp.slotLoopSegment9a27d0(6), 1);
  assert.equal(exp.slotLoopSegment9a27d0(7), 2);
  assert.equal(exp.slotLoopSegment9a27d0(10), 2);
  assert.equal(exp.slotLoopSegment9a27d0(0x100), -1);
  assert.equal(exp.slotLoopSegment9a27d0(0xffffffff), -1);
  assert.equal(exp.slotLoop1Count9a27d0() >>> 0, 6);
  assert.equal(exp.slotLoop2Count9a27d0() >>> 0, 4);
  assert.equal(exp.slotLoop1StartOff9a27d0() >>> 0, 0x3ee8);
  assert.equal(exp.slotLoop2StartOff9a27d0() >>> 0, 0x4aa0);

  // Plan struct readback (7 int32/u32 fields, packed in order).
  const slotPlanBase = MEM + 0x5f000;
  exp.slotPlan9a27d0(slotPlanBase, 0);
  assert.equal(view.getInt32(slotPlanBase + 0, true), 1); // valid
  assert.equal(readU32(view, slotPlanBase + 4), 0x3cdc); // base
  assert.equal(readU32(view, slotPlanBase + 8), 0x3ce4); // flag
  assert.equal(readU32(view, slotPlanBase + 12), 0x3cfc); // reset
  assert.equal(readU32(view, slotPlanBase + 16), 0x3cf4); // 709150 recv
  assert.equal(readU32(view, slotPlanBase + 20), 0x3cfc); // arg
  assert.equal(view.getInt32(slotPlanBase + 24, true), 0); // segment
  exp.slotPlan9a27d0(slotPlanBase, 7);
  assert.equal(view.getInt32(slotPlanBase + 0, true), 1);
  assert.equal(readU32(view, slotPlanBase + 4), 0x3cdc + 7 * 0x1f4);
  assert.equal(readU32(view, slotPlanBase + 24), 2);
  exp.slotPlan9a27d0(slotPlanBase, 0x100);
  assert.equal(view.getInt32(slotPlanBase + 0, true), 0); // invalid
  assert.equal(readU32(view, slotPlanBase + 4), 0);
  assert.equal(view.getInt32(slotPlanBase + 24, true), -1);

  // ABI v42: 0x008d3250 ordered host-event decision laws — WIDE args NOT
  // pre-masked (cursor gate re-narrows the byte; list gate FULL dword).
  assert.equal(exp.cursorVa8d3250() >>> 0, 0xb75734);
  assert.equal(exp.getLayerReceiverOff8d3250() >>> 0, 0x304);
  assert.equal(exp.layerClearOff8d3250() >>> 0, 0x74);
  assert.equal(exp.resetReceiverOff8d3250() >>> 0, 0x64);
  assert.equal(exp.listSentinelOff8d3250() >>> 0, 0x120);
  assert.equal(exp.listHeaderOff8d3250() >>> 0, 0x120);
  assert.equal(exp.listDestroyArg1Ptr8d3250(0x1234) >>> 0, 0x1238);
  assert.equal(exp.listDestroyArg1Ptr8d3250(0xfffffffc) >>> 0, 0); // wrap
  assert.equal(exp.listDestroyArg28d3250(0x1000) >>> 0, 0x1120);
  assert.equal(exp.listDestroyArg28d3250(0xfffffee0) >>> 0, 0); // wrap
  const hpBase = MEM + 0x5f200;
  exp.hostPlan8d3250(hpBase, 1, 0x100);
  assert.equal(readU32(view, hpBase + 0), 0xb75734); // cursor_va
  assert.equal(readU32(view, hpBase + 4), 0x304); // getlayer_receiver_off
  assert.equal(readU32(view, hpBase + 8), 0x74); // layer_clear_off
  assert.equal(readU32(view, hpBase + 12), 0x64); // reset_receiver_off
  assert.equal(readU32(view, hpBase + 16), 0x1e8); // list_obj_off
  assert.equal(readU32(view, hpBase + 20), 0x120); // list_sentinel_off
  assert.equal(readU32(view, hpBase + 24), 0x120); // list_header_off
  assert.equal(view.getInt32(hpBase + 28, true), 1); // cursor_gate
  assert.equal(view.getInt32(hpBase + 32, true), 1); // list_gate
  exp.hostPlan8d3250(hpBase, 0x100, 0); // wide cursor byte 0x100 -> 0
  assert.equal(view.getInt32(hpBase + 28, true), 0);
  assert.equal(view.getInt32(hpBase + 32, true), 0);
  exp.hostPlan8d3250(hpBase, 0xffffffff, 0xffffffff); // both open
  assert.equal(view.getInt32(hpBase + 28, true), 1);
  assert.equal(view.getInt32(hpBase + 32, true), 1);

  // ABI v43: host 0x00a648b0 body decision laws — mode dispatch + mode 2.
  assert.equal(exp.modeStatsA648b0() >>> 0, 2);
  assert.equal(exp.modePathA648b0(0) >>> 0, 0);
  assert.equal(exp.modePathA648b0(1) >>> 0, 1);
  assert.equal(exp.modePathA648b0(2) >>> 0, 2);
  assert.equal(exp.modePathA648b0(3) >>> 0, 0);
  assert.equal(exp.modePathA648b0(0x101) >>> 0, 1); // low byte 1
  assert.equal(exp.modePathA648b0(0x102) >>> 0, 2); // low byte 2
  assert.equal(exp.modePathA648b0(0x100) >>> 0, 0); // low byte 0
  assert.equal(exp.modePathA648b0(0xffffff02) >>> 0, 2); // WIDE low byte 2
  // Mode-2 direct base: no fallback (0 -> 0x30, NOT 0xc7f618).
  assert.equal(exp.mode2StatsBasePtrA648b0(0) >>> 0, 0x30);
  assert.equal(exp.mode2StatsBasePtrA648b0(0x5000) >>> 0, 0x5030);
  assert.equal(exp.mode2StatsBasePtrA648b0(0xfffffff0) >>> 0, 0x20); // wrap
  assert.equal(exp.mode2AddendLoVaA648b0() >>> 0, 0xc7f618);
  assert.equal(exp.mode2AddendHiVaA648b0() >>> 0, 0xc7f61c);
  assert.equal(exp.statsAddLoA648b0(0x10, 0x20) >>> 0, 0x30);
  assert.equal(exp.statsAddLoA648b0(0xfffffff0, 0x20) >>> 0, 0x10); // wrap
  assert.equal(exp.statsAddCarryA648b0(0xfffffff0, 0x20) >>> 0, 1);
  assert.equal(exp.statsAddCarryA648b0(0x10, 0x20) >>> 0, 0);
  assert.equal(exp.statsAddHiA648b0(0x10, 0x100, 0x20, 0x200) >>> 0, 0x300);
  assert.equal(
    exp.statsAddHiA648b0(0xfffffff0, 0x100, 0x20, 0x200) >>> 0,
    0x301,
  ); // low carry reaches high
  assert.equal(
    exp.statsAddHiA648b0(0xfffffffc, 0xffffffff, 0x7, 0x1) >>> 0,
    1,
  ); // full 64-bit wrap
  const addPairBase = MEM + 0x5f400; // IsaacExitA648b0StatsAdd (8 bytes)
  exp.statsAddA648b0(addPairBase, 0xfffffff0, 0x100, 0x20, 0x200);
  assert.equal(readU32(view, addPairBase + 0), 0x10);
  assert.equal(readU32(view, addPairBase + 4), 0x301);
  const modePlanBase = MEM + 0x5f500; // IsaacExitA648b0ModePlan (24 bytes)
  exp.modePlanA648b0(modePlanBase, 2, 0, 0, 0xfffffff0, 0x100, 4, 0x20, 0x200);
  assert.equal(view.getInt32(modePlanBase + 0, true), 2); // path
  assert.equal(view.getInt32(modePlanBase + 4, true), 0); // free_needed
  assert.equal(readU32(view, modePlanBase + 8), 0x30); // trap base at g==0
  assert.equal(readU32(view, modePlanBase + 12), 0x10); // lo_after
  assert.equal(readU32(view, modePlanBase + 16), 0x301); // hi_after
  assert.equal(readU32(view, modePlanBase + 20), 0); // free_ptr
  exp.modePlanA648b0(modePlanBase, 1, 0x40, 0x5000, 3, 8, 4, 9, 10);
  assert.equal(view.getInt32(modePlanBase + 0, true), 1); // path
  assert.equal(view.getInt32(modePlanBase + 4, true), 1); // free_needed
  assert.equal(readU32(view, modePlanBase + 8), 0x5030); // mode-1 select
  assert.equal(readU32(view, modePlanBase + 12), 0xffffffff); // 3-4 wrap
  assert.equal(readU32(view, modePlanBase + 16), 7); // borrow 1
  assert.equal(readU32(view, modePlanBase + 20), 0x3c); // edx-4
  exp.modePlanA648b0(modePlanBase, 1, 0, 0x5000, 3, 8, 4, 9, 10);
  assert.equal(view.getInt32(modePlanBase + 4, true), 0); // gate closed
  assert.equal(readU32(view, modePlanBase + 8), 0); // no store base
  assert.equal(readU32(view, modePlanBase + 12), 3); // pass-through
  assert.equal(readU32(view, modePlanBase + 16), 8);
  assert.equal(readU32(view, modePlanBase + 20), 0);
  exp.modePlanA648b0(modePlanBase, 0, 0x40, 0x5000, 7, 8, 4, 9, 10);
  assert.equal(view.getInt32(modePlanBase + 0, true), 0); // empty path
  assert.equal(readU32(view, modePlanBase + 8), 0);
  assert.equal(readU32(view, modePlanBase + 12), 7);
  assert.equal(readU32(view, modePlanBase + 16), 8);

  // ABI v44: 0x006f0040 fully pure predicate (band-scan find).
  assert.equal(exp.va6f0040() >>> 0, EXIT_6F0040_VA);
  assert.equal(exp.bodyBytes6f0040() >>> 0, 0x27);
  assert.equal(exp.ptrOff6f0040() >>> 0, 0x1e68);
  assert.equal(exp.countOff6f0040() >>> 0, 0x161c);
  assert.equal(exp.predicate6f0040(0x1000, 0, 0x10, 0x20) >>> 0, 0); // null ptr
  assert.equal(exp.predicate6f0040(0x1000, 0, 0x100, 0x20) >>> 0, 0); // null ptr, tail would open
  assert.equal(
    exp.predicate6f0040(0x1000, 0x2000, 0x10, 0xffffffff) >>> 0,
    0,
  ); // -1 sentinel
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, -5 >>> 0, 3) >>> 0, 0); // signed 3 >= -5
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, 3, 3) >>> 0, 0); // equal closes (jge)
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, -5 >>> 0, -6 >>> 0) >>> 0, 1); // -6 < -5
  assert.equal(exp.predicate6f0040(0x2000, 0x2000, 0x10, 0x20) >>> 0, 0); // self-alias
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, 0x20, 0x10) >>> 0, 1); // open: 16 < 32
  // WIDE full-dword pins (no byte narrowing anywhere in the body):
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, 0x100, 0x20) >>> 0, 1); // 32 < 256 (byte-narrow would flip)
  assert.equal(
    exp.predicate6f0040(0x1000, 0x2000, 0x80000000, 0x7fffffff) >>> 0,
    0,
  ); // signed: 0x7fffffff >= 0x80000000 (unsigned mutant would open)
  assert.equal(exp.predicate6f0040(0x1000, 0x2000, 0x10000002, 0x10000001) >>> 0, 1); // 0x10000001 < 0x10000002
  assert.equal(EXIT_6F0040_CALLERS, 4);

  // ABI v45: 0x0071df80 fully pure static membership predicate
  // (band re-scan find). Game global -> Game::_room -> room state id.
  assert.equal(exp.va71df80() >>> 0, EXIT_71DF80_VA);
  assert.equal(exp.bodyBytes71df80() >>> 0, 0x40);
  assert.equal(exp.gameDat71df80() >>> 0, 0x00c71678);
  assert.equal(exp.roomOff71df80() >>> 0, 0x18300);
  assert.equal(exp.stateOff71df80() >>> 0, 0x1d18);
  // Members (PE order): 0xa, 0xb, 0xc, 0xd, 0x22, 0x2b, 0x2c, 0x30.
  for (const member of [0xa, 0xb, 0xc, 0xd, 0x22, 0x2b, 0x2c, 0x30]) {
    assert.equal(
      exp.stateOpen71df80(member) >>> 0,
      1,
      `wasm member ${member.toString(16)}`,
    );
    assert.equal(exit71df80StateOpen(member), 1, `oracle member ${member.toString(16)}`);
  }
  // Non-members and boundaries around the set.
  for (const closed of [0, 1, 9, 0xe, 0x21, 0x23, 0x2a, 0x2d, 0x2f, 0x31, 0xffffffff]) {
    assert.equal(
      exp.stateOpen71df80(closed) >>> 0,
      0,
      `wasm closed ${closed.toString(16)}`,
    );
    assert.equal(exit71df80StateOpen(closed), 0, `oracle closed ${closed.toString(16)}`);
  }
  // WIDE full-dword pins: the gates are cmp eax, imm — equality over the
  // WHOLE dword (a byte-narrow mutant would open 0x1000000a).
  for (const wide of [0x1000000a, 0x8000000b, 0x40000030, 0xffffffff]) {
    assert.equal(exp.stateOpen71df80(wide) >>> 0, 0, `wasm wide ${wide.toString(16)}`);
    assert.equal(exit71df80StateOpen(wide), 0, `oracle wide ${wide.toString(16)}`);
  }
  assert.equal(EXIT_71DF80_CALLERS, 2);

  // ABI v46: write-tail capture-driven gates (0x00958ed0 local arm).
  assert.equal(exp["958ed0LocalFilenamePresent"](0) >>> 0, 0, "wasm size 0 -> log path");
  assert.equal(exit958ed0LocalFilenamePresent(0), 0, "oracle size 0 -> log path");
  assert.equal(exp["958ed0LocalFilenamePresent"](1) >>> 0, 1);
  assert.equal(exit958ed0LocalFilenamePresent(1), 1);
  assert.equal(exp["958ed0LocalFilenamePresent"](0x100) >>> 0, 1,
    "wasm size 0x100 present (byte-narrow would flip)");
  assert.equal(exit958ed0LocalFilenamePresent(0x100), 1,
    "oracle size 0x100 present");
  assert.equal(exp["958ed0LocalFilenamePresent"](0xffffffff) >>> 0, 1);
  assert.equal(exit958ed0LocalFilenamePresent(0xffffffff), 1);
  assert.equal(exp["958ed0IoDtorNeeded"](0) >>> 0, 0, "wasm no existing io");
  assert.equal(exit958ed0IoDtorNeeded(0), 0, "oracle no existing io");
  assert.equal(exp["958ed0IoDtorNeeded"](0x1234) >>> 0, 1);
  assert.equal(exit958ed0IoDtorNeeded(0x1234), 1);
  assert.equal(exp["958ed0IoDtorNeeded"](0x100) >>> 0, 1,
    "wasm 0x100 is a valid pointer");
  assert.equal(exit958ed0IoDtorNeeded(0x100), 1);
  assert.equal(EXIT_958ED0_FILENAME_SIZE_OFF, 0x1fdbc);
  assert.equal(EXIT_958ED0_IO_PTR_OFF, 0x1fe24);
  assert.equal(exp["958ed0LocalFilenamePresent"](0x101) >>> 0, 1);
  assert.equal(exit958ed0IoDtorNeeded(0xffffffff), 1);

  // Tree image in Wasm linear memory (absolute node addresses = offsets).
  const H = MEM + 0x1900;
  const L = MEM + 0x1920;
  const it = MEM + 0x18f0;
  writeU32(viewSlots, H + EXIT_TREE_LEFT_OFF, L);
  writeU32(viewSlots, H + EXIT_TREE_PARENT_OFF, H);
  writeU32(viewSlots, H + EXIT_TREE_RIGHT_OFF, H);
  writeU8(viewSlots, H + EXIT_TREE_ISNIL_OFF, 1);
  writeU32(viewSlots, L + EXIT_TREE_LEFT_OFF, H);
  writeU32(viewSlots, L + EXIT_TREE_PARENT_OFF, H);
  writeU32(viewSlots, L + EXIT_TREE_RIGHT_OFF, H);
  writeU8(viewSlots, L + EXIT_TREE_ISNIL_OFF, 0);
  writeU32(viewSlots, it, L);
  exp.treeIteratorNext(it);
  assert.equal(readU32(viewSlots, it), H);

  const R = MEM + 0x1940;
  const A = MEM + 0x1960;
  const B = MEM + 0x1980;
  writeU32(viewSlots, R + EXIT_TREE_LEFT_OFF, H);
  writeU32(viewSlots, R + EXIT_TREE_PARENT_OFF, H);
  writeU32(viewSlots, R + EXIT_TREE_RIGHT_OFF, A);
  writeU8(viewSlots, R + EXIT_TREE_ISNIL_OFF, 0);
  writeU32(viewSlots, A + EXIT_TREE_LEFT_OFF, B);
  writeU32(viewSlots, A + EXIT_TREE_PARENT_OFF, R);
  writeU32(viewSlots, A + EXIT_TREE_RIGHT_OFF, H);
  writeU8(viewSlots, A + EXIT_TREE_ISNIL_OFF, 0);
  writeU32(viewSlots, B + EXIT_TREE_LEFT_OFF, H);
  writeU32(viewSlots, B + EXIT_TREE_PARENT_OFF, A);
  writeU32(viewSlots, B + EXIT_TREE_RIGHT_OFF, H);
  writeU8(viewSlots, B + EXIT_TREE_ISNIL_OFF, 0);
  writeU32(viewSlots, it, R);
  exp.treeIteratorNext(it);
  assert.equal(readU32(viewSlots, it), B);

  // ABI v10: map walk + 0x0069d690 pure CF + string compare
  assert.equal(exp.mapWalkNeeded(0x1000, 0x1000), 0);
  assert.equal(exp.mapWalkNeeded(0x1000, 0x1004), 1);
  assert.equal(exp.mapLookupHit(0x1000, 0x1000), 0);
  assert.equal(exp.mapLookupHit(0x1000, 0x2000), 1);
  assert.equal(exp.mapFlagActive(0), 0);
  assert.equal(exp.mapFlagActive(1), 1);
  assert.equal(exp.mapElemRangeNonempty(0x10, 0x10), 0);
  assert.equal(exp.mapElemRangeNonempty(0x10, 0x30), 1);
  assert.equal(exp.mapElemWalkNeeded(0x1, 0x1, 1, 0x10, 0x30), 0);
  assert.equal(exp.mapElemWalkNeeded(0x1, 0x2, 0, 0x10, 0x30), 0);
  assert.equal(exp.mapElemWalkNeeded(0x1, 0x2, 1, 0x10, 0x10), 0);
  assert.equal(exp.mapElemWalkNeeded(0x1, 0x2, 1, 0x10, 0x30), 1);
  assert.equal(exp.mapElemStride() >>> 0, EXIT_MAP_ELEM_STRIDE);
  assert.equal(exp.mapElemHostOff() >>> 0, EXIT_MAP_ELEM_HOST_OFF);
  assert.equal(exp.msvcSsoInline(0xf), 1);
  assert.equal(exp.msvcSsoInline(0x10), 0);
  assert.equal(exp.msvcStringDataAddr(0x5000, 0xf, 0xdead) >>> 0, 0x5000);
  assert.equal(exp.msvcStringDataAddr(0x5000, 0x10, 0xdead) >>> 0, 0xdead);
  assert.equal(exp.candidateIsnil69d690(0), 0);
  assert.equal(exp.candidateIsnil69d690(1), 1);
  assert.equal(exp.cmpIsHit69d690(-1), 0);
  assert.equal(exp.cmpIsHit69d690(0), 1);
  assert.equal(exp.cmpIsHit69d690(1), 1);
  assert.equal(exp.selectResult69d690(0xaa, 0xbb, 1, 0) >>> 0, 0xaa);
  assert.equal(exp.selectResult69d690(0xaa, 0xbb, 0, -1) >>> 0, 0xaa);
  assert.equal(exp.selectResult69d690(0xaa, 0xbb, 0, 0) >>> 0, 0xbb);
  assert.equal(exp.selectResult69d690(0xaa, 0xbb, 0, 1) >>> 0, 0xbb);

  // String compare via Wasm linear memory
  const sBase = MEM + 0x1a00;
  const sA = [0x61, 0x62, 0x63, 0x00, 0x11];
  const sB = [0x61, 0x62, 0x63, 0x00, 0x22];
  for (let i = 0; i < sA.length; i++) writeU8(viewSlots, sBase + i, sA[i]);
  for (let i = 0; i < sB.length; i++) writeU8(viewSlots, sBase + 0x20 + i, sB[i]);
  assert.equal(exp.stringCompare(sBase, 3, sBase + 0x20, 3), 0);
  assert.equal(exp.stringCompare(sBase, 4, sBase + 0x20, 4), 0);
  writeU8(viewSlots, sBase + 2, 0x64); // "abd" vs "abc"
  assert.equal(exp.stringCompare(sBase, 3, sBase + 0x20, 3) > 0, true);
  writeU8(viewSlots, sBase + 2, 0x62); // "abb" vs "abc"
  assert.equal(exp.stringCompare(sBase, 3, sBase + 0x20, 3) < 0, true);
  // length order when equal prefix
  writeU8(viewSlots, sBase + 2, 0x63);
  assert.equal(exp.stringCompare(sBase, 2, sBase + 0x20, 3) < 0, true);
  assert.equal(exp.stringCompare(sBase, 3, sBase + 0x20, 2) > 0, true);

  // ABI v11: lower_bound pure islands + pure-complete find
  const triple = MEM + 0x1b00;
  exp.initTriple685bc0(triple, 0x1000, 0x2000);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.walk), 0x2000);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.bound), 0);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.best), 0x1000);
  assert.equal(exp.rootIsEmpty685bc0(0), 0);
  assert.equal(exp.rootIsEmpty685bc0(1), 1);
  assert.equal(exp.cmpGoRight685bc0(-1), 1);
  assert.equal(exp.cmpGoRight685bc0(0), 0);
  assert.equal(exp.cmpGoRight685bc0(1), 0);
  exp.initTriple685bc0(triple, 0x1000, 0x2000);
  exp.step685bc0(triple, 0x3000, 0x1111, 0x2222, -1);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.walk), 0x2222);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.bound), 0);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.best), 0x1000);
  exp.initTriple685bc0(triple, 0x1000, 0x2000);
  exp.step685bc0(triple, 0x3000, 0x1111, 0x2222, 0);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.walk), 0x1111);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.bound), 1);
  assert.equal(readU32(viewSlots, triple + LB_TRIPLE.best), 0x3000);
  assert.equal(exp.loopContinue685bc0(0), 1);
  assert.equal(exp.loopContinue685bc0(1), 0);

  // Linear-memory string map: head H, root B("b"), left A("a"), right C("c")
  const MAP = MEM + 0x1c00;
  const Hn = MEM + 0x1c20;
  const An = MEM + 0x1c60;
  const Bn = MEM + 0x1ca0;
  const Cn = MEM + 0x1ce0;
  const KEY = MEM + 0x1d40;
  const OUT = MEM + 0x1d60;
  const OUT_NODE = MEM + 0x1d70;
  const writeSsoW = (base, s) => {
    for (let i = 0; i < 16; i++) writeU8(viewSlots, base + i, 0);
    for (let i = 0; i < s.length; i++) writeU8(viewSlots, base + i, s.charCodeAt(i));
    writeU32(viewSlots, base + EXIT_MSVC_STRING_SIZE_OFF, s.length);
    writeU32(viewSlots, base + EXIT_MSVC_STRING_CAP_OFF, 0xf);
  };
  const linkW = (node, left, parent, right, isnil) => {
    writeU32(viewSlots, node + EXIT_TREE_LEFT_OFF, left);
    writeU32(viewSlots, node + EXIT_TREE_PARENT_OFF, parent);
    writeU32(viewSlots, node + EXIT_TREE_RIGHT_OFF, right);
    writeU8(viewSlots, node + EXIT_TREE_ISNIL_OFF, isnil);
  };
  writeU32(viewSlots, MAP, Hn);
  linkW(Hn, An, Bn, Cn, 1);
  linkW(An, Hn, Bn, Hn, 0);
  writeSsoW(An + EXIT_MAP_NODE_KEY_OFF, "a");
  linkW(Bn, An, Hn, Cn, 0);
  writeSsoW(Bn + EXIT_MAP_NODE_KEY_OFF, "b");
  linkW(Cn, Hn, Bn, Hn, 0);
  writeSsoW(Cn + EXIT_MAP_NODE_KEY_OFF, "c");

  writeSsoW(KEY, "b");
  assert.equal(exp.mapLowerBound(MAP, OUT, KEY) >>> 0, OUT);
  assert.equal(readU32(viewSlots, OUT + EXIT_LOWER_BOUND_BEST_OFF), Bn);
  assert.equal(exp.mapFind69d690(MAP, OUT_NODE, KEY) >>> 0, OUT_NODE);
  assert.equal(readU32(viewSlots, OUT_NODE), Bn);

  writeSsoW(KEY, "a");
  exp.mapFind69d690(MAP, OUT_NODE, KEY);
  assert.equal(readU32(viewSlots, OUT_NODE), An);
  writeSsoW(KEY, "c");
  exp.mapFind69d690(MAP, OUT_NODE, KEY);
  assert.equal(readU32(viewSlots, OUT_NODE), Cn);
  writeSsoW(KEY, "d");
  exp.mapLowerBound(MAP, OUT, KEY);
  assert.equal(readU32(viewSlots, OUT + EXIT_LOWER_BOUND_BEST_OFF), Hn);
  exp.mapFind69d690(MAP, OUT_NODE, KEY);
  assert.equal(readU32(viewSlots, OUT_NODE), Hn);
  writeSsoW(KEY, "aa");
  exp.mapLowerBound(MAP, OUT, KEY);
  assert.equal(readU32(viewSlots, OUT + EXIT_LOWER_BOUND_BEST_OFF), Bn);
  exp.mapFind69d690(MAP, OUT_NODE, KEY);
  assert.equal(readU32(viewSlots, OUT_NODE), Hn);

  // ABI v12: 0x0040c7f0 pure CF + stores + nested 0x0040cc10
  assert.equal(exp.allocSize40c7f0() >>> 0, EXIT_40C7F0_ALLOC_SIZE);
  assert.equal(exp.vtable40c7f0() >>> 0, EXIT_40C7F0_VTABLE);
  assert.equal(exp.defaultInitVa40cc10() >>> 0, EXIT_40CC10_DEFAULT_INIT);
  assert.equal(exp.allocOk40c7f0(0), 0);
  assert.equal(exp.allocOk40c7f0(0x1000), 1);
  assert.equal(exp.oldObjectPresent40c7f0(0), 0);
  assert.equal(exp.oldObjectPresent40c7f0(0xabc), 1);
  assert.equal(exp.callbackNeeded40c7f0(0, 0x1234), 0);
  assert.equal(exp.callbackNeeded40c7f0(1, 0), 0);
  assert.equal(exp.callbackNeeded40c7f0(1, 0x1234), 1);
  assert.equal(exp.defaultInitIsDirect40cc10(0xa15770), 1);
  assert.equal(exp.defaultInitIsDirect40cc10(0), 0);

  const OBJ12 = MEM + 0x1e00;
  const PAIR12 = MEM + 0x1e40;
  const VT = MEM + 0x1e50;
  const ARGSL = MEM + 0x1e54;
  const VAL = MEM + 0x1e58;
  const OBJSL = MEM + 0x1e5c;
  // poison
  for (let i = 0; i < 0x60; i++) writeU8(viewSlots, OBJ12 + i, 0xcd);
  writeU32(viewSlots, VT, 0xdead);
  writeU32(viewSlots, ARGSL, 0xbeef);
  exp.objectFinish40c7f0(VT, ARGSL, 0x11);
  assert.equal(readU32(viewSlots, VT), EXIT_40C7F0_VTABLE);
  assert.equal(readU32(viewSlots, ARGSL), 0x11);
  exp.pairApply40c7f0(VAL, OBJSL, 0, 0x5000);
  assert.equal(readU32(viewSlots, VAL), 0);
  assert.equal(readU32(viewSlots, OBJSL), 0x5000);

  exp.apply40cc10(OBJ12);
  assert.equal(readU32(viewSlots, OBJ12), EXIT_40CC10_VTABLE);
  assert.equal(readU32(viewSlots, OBJ12 + 4), EXIT_40CC10_FIELD4);
  assert.equal(readU32(viewSlots, OBJ12 + 8), EXIT_40CC10_SUB_VTABLE);
  assert.equal(readU8(viewSlots, OBJ12 + 0xc), 0);
  assert.equal(readU32(viewSlots, OBJ12 + 0x10), 0);
  exp.objectFinishApply40c7f0(OBJ12, 0x77);
  assert.equal(readU32(viewSlots, OBJ12), EXIT_40C7F0_VTABLE);
  assert.equal(readU32(viewSlots, OBJ12 + EXIT_40C7F0_ARG_OFF), 0x77);
  exp.pairApplyBase40c7f0(PAIR12, 0, OBJ12);
  assert.equal(readU32(viewSlots, PAIR12 + EXIT_40C7F0_PAIR_VALUE_OFF), 0);
  assert.equal(readU32(viewSlots, PAIR12 + EXIT_40C7F0_PAIR_OBJ_OFF), OBJ12);

  // struct pack form
  const PF = MEM + 0x1f00;
  // IsaacExit40cc10PureState: u32,u32,u32,u8(+pad),u32 â€” C++ default align
  // layout: +0 vtable, +4 field4, +8 sub, +0xc field_c, pad to +0x10 field10
  for (let i = 0; i < 0x20; i++) writeU8(viewSlots, PF + i, 0xaa);
  exp.pureFields40cc10(PF);
  assert.equal(readU32(viewSlots, PF), EXIT_40CC10_VTABLE);
  assert.equal(readU32(viewSlots, PF + 4), EXIT_40CC10_FIELD4);
  assert.equal(readU32(viewSlots, PF + 8), EXIT_40CC10_SUB_VTABLE);
  assert.equal(readU8(viewSlots, PF + 0xc), 0);
  // field_10 after alignment padding for uint8
  // C++20 default: after u8, pad to 4 â†’ field_10 at +0x10
  assert.equal(readU32(viewSlots, PF + 0x10), 0);

  const ptrVt = MEM + 0x1f20;
  const ptrF4 = MEM + 0x1f24;
  const ptrSub = MEM + 0x1f28;
  const ptrFc = MEM + 0x1f2c;
  const ptrF10 = MEM + 0x1f30;
  writeU32(viewSlots, ptrVt, 1);
  writeU32(viewSlots, ptrF4, 1);
  writeU32(viewSlots, ptrSub, 1);
  writeU8(viewSlots, ptrFc, 1);
  writeU32(viewSlots, ptrF10, 1);
  exp.pureFieldsPtrs40cc10(ptrVt, ptrF4, ptrSub, ptrFc, ptrF10);
  assert.equal(readU32(viewSlots, ptrVt), EXIT_40CC10_VTABLE);
  assert.equal(readU32(viewSlots, ptrF4), EXIT_40CC10_FIELD4);
  assert.equal(readU32(viewSlots, ptrSub), EXIT_40CC10_SUB_VTABLE);
  assert.equal(readU8(viewSlots, ptrFc), 0);
  assert.equal(readU32(viewSlots, ptrF10), 0);

  // ABI v13: 0x00408830 pure CF + stores + terminal pack
  assert.equal(exp.fillByte408830() & 0xff, EXIT_408830_FILL_BYTE);
  assert.equal(exp.f3210Bits408830() >>> 0, EXIT_408830_F32_10_BITS);
  assert.equal(exp.ptrFreeNeeded408830(0), 0);
  assert.equal(exp.ptrFreeNeeded408830(0x100), 1);
  assert.equal(exp.argPresent408830(0), 0);
  assert.equal(exp.argPresent408830(1), 1);
  assert.equal(exp.countNonzero408830(0), 0);
  assert.equal(exp.countNonzero408830(5), 1);
  assert.equal(exp.allocSize408830(0) >>> 0, 0);
  assert.equal(exp.allocSize408830(1) >>> 0, 4);
  assert.equal(exp.allocSize408830(0x10) >>> 0, 0x40);
  assert.equal(exp.allocSize408830(0x40000000) >>> 0, 0xffffffff);
  assert.equal(exp.fillSize408830(3) >>> 0, 12);
  assert.equal(exp.fillSize408830(0x40000000) >>> 0, 0);

  const SLOT13 = MEM + 0x2000;
  writeU32(viewSlots, SLOT13, 0xdeadbeef);
  exp.storeArg408830(SLOT13, 0x55aa);
  assert.equal(readU32(viewSlots, SLOT13), 0x55aa);
  writeU32(viewSlots, SLOT13, 0x1111);
  exp.ptrClear408830(SLOT13);
  assert.equal(readU32(viewSlots, SLOT13), 0);

  const THIS13 = MEM + 0x2040;
  for (let i = 0; i < 0x30; i++) writeU8(viewSlots, THIS13 + i, 0xcd);
  exp.storeArgApply408830(THIS13, 0); // Exit call site arg=0
  assert.equal(readU32(viewSlots, THIS13 + EXIT_408830_FIELD_4_OFF), 0);
  exp.tailApply408830(THIS13);
  assert.equal(
    readU32(viewSlots, THIS13 + EXIT_408830_FIELD_10_OFF),
    EXIT_408830_F32_10_BITS,
  );
  assert.equal(readU8(viewSlots, THIS13 + EXIT_408830_FIELD_14_OFF), 0);
  assert.equal(readU32(viewSlots, THIS13 + EXIT_408830_FIELD_18_OFF), 0);
  assert.equal(readU32(viewSlots, THIS13 + EXIT_408830_FIELD_1C_OFF), 0);

  // struct pack: field_10@0, field_14@4, pad, field_18@8, field_1c@0xc
  const TAIL13 = MEM + 0x2080;
  for (let i = 0; i < 0x20; i++) writeU8(viewSlots, TAIL13 + i, 0xaa);
  exp.tail408830(TAIL13);
  assert.equal(readU32(viewSlots, TAIL13), EXIT_408830_F32_10_BITS);
  assert.equal(readU8(viewSlots, TAIL13 + 4), 0);
  assert.equal(readU32(viewSlots, TAIL13 + 8), 0);
  assert.equal(readU32(viewSlots, TAIL13 + 0xc), 0);

  const t10 = MEM + 0x20a0;
  const t14 = MEM + 0x20a4;
  const t18 = MEM + 0x20a8;
  const t1c = MEM + 0x20ac;
  writeU32(viewSlots, t10, 1);
  writeU8(viewSlots, t14, 1);
  writeU32(viewSlots, t18, 1);
  writeU32(viewSlots, t1c, 1);
  exp.tailPtrs408830(t10, t14, t18, t1c);
  assert.equal(readU32(viewSlots, t10), EXIT_408830_F32_10_BITS);
  assert.equal(readU8(viewSlots, t14), 0);
  assert.equal(readU32(viewSlots, t18), 0);
  assert.equal(readU32(viewSlots, t1c), 0);

  // ABI v14: 0x009b4810 pure CF + stores + terminal pack
  assert.equal(exp.f32GlobalC7b640Addr() >>> 0, EXIT_F32_GLOBAL_C7B640_ADDR);
  assert.equal(exp.f32GlobalC7b644Addr() >>> 0, EXIT_F32_GLOBAL_C7B644_ADDR);
  assert.equal(exp.firstPushValue9b4810(0) >>> 0, 0);
  assert.equal(exp.firstPushValue9b4810(3) >>> 0, 0);
  assert.equal(exp.firstPushValue9b4810(1) >>> 0, 1);
  assert.equal(exp.modeIs39b4810(3), 1);
  assert.equal(exp.modeIs39b4810(0), 0);
  assert.equal(exp.modeIs19b4810(1), 1);
  assert.equal(exp.modeLayerPath9b4810(1), 1);
  assert.equal(exp.modeLayerPath9b4810(2), 1);
  assert.equal(exp.modeLayerPath9b4810(3), 0);
  assert.equal(exp.modeBlockANeeded9b4810(3), 0);
  assert.equal(exp.modeBlockANeeded9b4810(0), 1);
  assert.equal(exp.modeBlockFNeeded9b4810(1), 0);
  assert.equal(exp.modeBlockFNeeded9b4810(2), 1);
  assert.equal(exp.vecSpace9b4810(0x10, 0x10), 0);
  assert.equal(exp.vecSpace9b4810(0x10, 0x14), 1);
  assert.equal(exp.vecEndAfterPush9b4810(0x10) >>> 0, 0x14);
  assert.equal(exp.blockACount9b4810() >>> 0, EXIT_9B4810_BLOCK_A.length);
  for (let i = 0; i < EXIT_9B4810_BLOCK_A.length; i++) {
    assert.equal(exp.blockAAt9b4810(i) >>> 0, EXIT_9B4810_BLOCK_A[i]);
  }
  assert.equal(exp.blockBCount9b4810() >>> 0, EXIT_9B4810_BLOCK_B.length);
  assert.equal(exp.blockCAt9b4810(0) >>> 0, 0xd);
  assert.equal(exp.blockDAt9b4810(0) >>> 0, 0xe);
  assert.equal(exp.blockEAt9b4810(0) >>> 0, 0x10);
  assert.equal(exp.blockFAt9b4810(6) >>> 0, 0x1b);
  assert.equal(exp.value1c9b4810() >>> 0, EXIT_9B4810_VALUE_1C);
  assert.equal(exp.push1cNeeded9b4810(1, 0, 1, 0, 0), 1);
  assert.equal(exp.push1cNeeded9b4810(0, 2, 0, 0, 0), 0);
  assert.equal(exp.push1cNeeded9b4810(0, 2, 0, 5, 0), 1);
  assert.equal(exp.layerLoopNeeded9b4810(0), 0);
  assert.equal(exp.layerLoopNeeded9b4810(3), 1);
  assert.equal(exp.layerLoopNeeded9b4810(-2), 0);
  assert.equal(exp.counterPlayNeeded9b4810(1, 0, 0, 0), 1);
  assert.equal(exp.counterPlayNeeded9b4810(0, 1, 0, 0), 0);
  assert.equal(exp.counterPlayNeeded9b4810(0, 1, 1, 0), 1);

  const SLOT14 = MEM + 0x2100;
  writeU32(viewSlots, SLOT14, 0xdead);
  exp.vecResetEnd9b4810(SLOT14, 0xabcd);
  assert.equal(readU32(viewSlots, SLOT14), 0xabcd);
  writeU32(viewSlots, SLOT14, 0);
  exp.vecStore9b4810(SLOT14, 0x42);
  assert.equal(readU32(viewSlots, SLOT14), 0x42);
  const END_SLOT = MEM + 0x2104;
  const ELEM_SLOT = MEM + 0x2108;
  writeU32(viewSlots, END_SLOT, 0);
  writeU32(viewSlots, ELEM_SLOT, 0);
  const neu = exp.vecPushPure9b4810(END_SLOT, ELEM_SLOT, 0x100, 7) >>> 0;
  assert.equal(neu, 0x104);
  assert.equal(readU32(viewSlots, END_SLOT), 0x104);
  assert.equal(readU32(viewSlots, ELEM_SLOT), 7);

  const THIS14 = MEM + 0x2200;
  // Arena base. A raw 0x100 sat INSIDE this module's static-data image
  // (which ends at 0x46d): vecPushApply9b4810 wrote a dword straight over
  // module constants. MEM-relative like everything else.
  const ARENA14 = MEM + 0x40000; // covered by the slotsTop grow above
  for (let i = 0; i < 0x300; i++) writeU8(viewSlots, THIS14 + i, 0xcd);
  // arena lives at absolute Wasm offset ARENA14
  writeU32(viewSlots, THIS14 + EXIT_9B4810_VEC_BEGIN_OFF, 0);
  writeU32(viewSlots, THIS14 + EXIT_9B4810_VEC_END_OFF, 0);
  writeU32(viewSlots, THIS14 + EXIT_9B4810_VEC_CAP_OFF, 0x10);
  exp.vecResetEndApply9b4810(THIS14);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_VEC_END_OFF), 0);
  assert.equal(exp.vecPushApply9b4810(THIS14, ARENA14, 2), 1);
  assert.equal(readU32(viewSlots, ARENA14 + 0), 2);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_VEC_END_OFF), 4);
  writeU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_C_OFF, 0x111);
  writeU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_10_OFF, 0x222);
  exp.tailApply9b4810(THIS14, EXIT_POSTLOG_F32_1BA90_BITS, EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(readU8(viewSlots, THIS14 + EXIT_9B4810_FIELD_4_OFF), 0);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_8_OFF), 0);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_14_OFF), 0x111);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_18_OFF), 0x222);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_1C_OFF), EXIT_POSTLOG_F32_1BA90_BITS);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_20_OFF), EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_24C_OFF), 0);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_250_OFF), 0);
  assert.equal(readU32(viewSlots, THIS14 + EXIT_9B4810_FIELD_254_OFF), 0);
  exp.playFlagApply9b4810(THIS14);
  assert.equal(
    readU8(viewSlots, THIS14 + EXIT_9B4810_ANM2_138_OFF + EXIT_9B4810_PLAY_FLAG_OFF),
    EXIT_9B4810_PLAY_FLAG_VALUE,
  );

  // struct tail pack via isaac_exit_9b4810_tail
  // layout: u8@0, pad3, u32@4, u32@8, u32@0xc, u32@0x10, u32@0x14, u32@0x18, u32@0x1c, u32@0x20
  const TAIL14 = MEM + 0x2600;
  for (let i = 0; i < 0x30; i++) writeU8(viewSlots, TAIL14 + i, 0xaa);
  exp.tail9b4810(TAIL14, 0x55, 0x66, EXIT_POSTLOG_F32_1BA90_BITS,
    EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(readU8(viewSlots, TAIL14), 0);
  assert.equal(readU32(viewSlots, TAIL14 + 4), 0);
  assert.equal(readU32(viewSlots, TAIL14 + 8), 0x55);
  assert.equal(readU32(viewSlots, TAIL14 + 0xc), 0x66);
  assert.equal(readU32(viewSlots, TAIL14 + 0x10), EXIT_POSTLOG_F32_1BA90_BITS);
  assert.equal(readU32(viewSlots, TAIL14 + 0x14), EXIT_POSTLOG_F32_1BA94_BITS);
  assert.equal(readU32(viewSlots, TAIL14 + 0x18), 0);
  assert.equal(readU32(viewSlots, TAIL14 + 0x1c), 0);
  assert.equal(readU32(viewSlots, TAIL14 + 0x20), 0);

  const FLAG14 = MEM + 0x2640;
  writeU8(viewSlots, FLAG14, 0);
  exp.playFlagSet9b4810(FLAG14);
  assert.equal(readU8(viewSlots, FLAG14), 1);

  // ABI v15: 0x00428590 pure size/cap CF (alloc remains host)
  assert.equal(exp.maxElems428590() >>> 0, EXIT_428590_MAX_ELEMS);
  assert.equal(exp.elemCount428590(0x100, 0x110) >>> 0, 4);
  assert.equal(exp.capacityElems428590(0x100, 0x120) >>> 0, 8);
  assert.equal(exp.insertIndex428590(0x100, 0x10c) >>> 0, 3);
  assert.equal(exp.lengthErrorNeeded428590(EXIT_428590_MAX_ELEMS), 1);
  assert.equal(exp.lengthErrorNeeded428590(0), 0);
  assert.equal(exp.neededSize428590(4) >>> 0, 5);
  assert.equal(exp.geoWouldOverflow428590(0), 0);
  assert.equal(exp.geoWouldOverflow428590(0x2aaaaaab), 1);
  assert.equal(exp.geometricCapacity428590(4) >>> 0, 6);
  assert.equal(exp.newCapacity428590(0, 1) >>> 0, 1);
  assert.equal(exp.newCapacity428590(4, 5) >>> 0, 6);
  assert.equal(exp.newCapacity428590(0x2aaaaaab, 1) >>> 0, EXIT_428590_MAX_ELEMS);
  assert.equal(exp.capacityErrorNeeded428590(EXIT_428590_MAX_ELEMS), 0);
  assert.equal(exp.capacityErrorNeeded428590(EXIT_428590_MAX_ELEMS + 1), 1);
  assert.equal(exp.allocBytes428590(5) >>> 0, 20);
  assert.equal(exp.insertSlot428590(0x2000, 3) >>> 0, 0x200c);
  assert.equal(exp.newEnd428590(0x2000, 5) >>> 0, 0x2014);
  assert.equal(exp.newCapPtr428590(0x2000, 0x40) >>> 0, 0x2040);
  assert.equal(exp.insertAtEnd428590(0x110, 0x110), 1);
  assert.equal(exp.insertAtEnd428590(0x10c, 0x110), 0);
  assert.equal(exp.copyPrefixBytes428590(0x100, 0x10c) >>> 0, 0xc);
  assert.equal(exp.copySuffixBytes428590(0x110, 0x10c) >>> 0, 4);
  assert.equal(exp.copyAllBytes428590(0x100, 0x110) >>> 0, 0x10);
  assert.equal(exp.oldFreeNeeded428590(0), 0);
  assert.equal(exp.oldFreeNeeded428590(0x100), 1);
  assert.equal(exp.oldCapacityBytes428590(0x100, 0x113) >>> 0, 0x10); // &~3
  assert.equal(exp.freeUsesHeapHeader428590(0xfff), 0);
  assert.equal(exp.freeUsesHeapHeader428590(0x1000), 1);
  assert.equal(
    exp.freeHeaderSize428590(0x1000) >>> 0,
    0x1000 + EXIT_428590_FREE_HEADER_ADD,
  );
  // (begin - header - 4): 0x1023-0x1000-4 = 0x1f ok; 0x1024 â†’ 0x20 ja abort
  assert.equal(exp.freeHeaderOffsetOk428590(0x1023, 0x1000), 1);
  assert.equal(exp.freeHeaderOffsetOk428590(0x1024, 0x1000), 0);

  // plan: empty vector grow (append) â†’ new_cap=1, alloc=4
  const PLAN = MEM + 0x2700;
  // struct layout: u32 size,cap,insert_index,needed,new_cap,alloc; i32 length,cap_err,geo,at_end
  exp.plan428590(PLAN, 0, 0, 0, 0);
  assert.equal(readU32(viewSlots, PLAN + 0), 0); // size
  assert.equal(readU32(viewSlots, PLAN + 4), 0); // capacity
  assert.equal(readU32(viewSlots, PLAN + 8), 0); // insert_index
  assert.equal(readU32(viewSlots, PLAN + 0xc), 1); // needed
  assert.equal(readU32(viewSlots, PLAN + 0x10), 1); // new_capacity
  assert.equal(readU32(viewSlots, PLAN + 0x14), 4); // alloc_bytes
  assert.equal(readI32(viewSlots, PLAN + 0x18), 0); // length_error
  assert.equal(readI32(viewSlots, PLAN + 0x1c), 0); // capacity_error
  assert.equal(readI32(viewSlots, PLAN + 0x20), 0); // geo_overflow
  assert.equal(readI32(viewSlots, PLAN + 0x24), 1); // insert_at_end

  // length_error gate is pure on the size dword (PE cmp); realistic pointer
  // SAR32 never yields MAX, so plan via pointers keeps length_error=0.
  assert.equal(exp.lengthErrorNeeded428590(EXIT_428590_MAX_ELEMS), 1);

  // plan: size=cap=4 append grow â†’ geo 6
  exp.plan428590(PLAN, 0x1000, 0x1010, 0x1010, 0x1010);
  assert.equal(readU32(viewSlots, PLAN + 0), 4);
  assert.equal(readU32(viewSlots, PLAN + 4), 4);
  assert.equal(readU32(viewSlots, PLAN + 0xc), 5);
  assert.equal(readU32(viewSlots, PLAN + 0x10), 6);
  assert.equal(readU32(viewSlots, PLAN + 0x14), 24);
  assert.equal(readI32(viewSlots, PLAN + 0x24), 1);

  // post_alloc_ptrs
  const OUT_END = MEM + 0x2780;
  const OUT_CAP = MEM + 0x2784;
  const OUT_SLOT = MEM + 0x2788;
  exp.postAllocPtrs428590(0x3000, 5, 24, 4, OUT_END, OUT_CAP, OUT_SLOT);
  assert.equal(readU32(viewSlots, OUT_END), 0x3014);
  assert.equal(readU32(viewSlots, OUT_CAP), 0x3018);
  assert.equal(readU32(viewSlots, OUT_SLOT), 0x3010);

  // oracle agreement on fixed edges
  assert.equal(exit428590NewCapacity(4, 5), 6);
  assert.equal(exit428590AllocBytes(6), 24);
  assert.equal(exit428590OldCapacityBytes(0x100, 0x113), 0x10);
  assert.equal(EXIT_428590_ELEM_SIZE, 4);
  assert.equal(EXIT_428590_FREE_HEADER_THRESHOLD, 0x1000);
  assert.equal(EXIT_428590_FREE_HEADER_OFFSET_MAX, 0x1f);

  // ABI v16: ANM2::GetLayer(int) / ANM2::Load / 0x40cf00 pure CF
  assert.equal(exp.anm2LayerStride() >>> 0, EXIT_ANM2_LAYER_STRIDE);
  assert.equal(exp.anm2GetlayerInRange(0, 3), 1);
  assert.equal(exp.anm2GetlayerInRange(-1, 3), 0);
  assert.equal(exp.anm2GetlayerInRange(3, 3), 0);
  assert.equal(exp.anm2GetlayerInRange(2, 3), 1);
  assert.equal(exp.anm2LayerPtr(0x1000, 2) >>> 0, 0x1000 + 2 * 0xa0);
  const GL_OUT = MEM + 0x2800;
  writeU32(viewSlots, GL_OUT, 0);
  assert.equal(exp.anm2GetlayerTry(0x2000, 1, 4, GL_OUT), 1);
  assert.equal(readU32(viewSlots, GL_OUT), 0x2000 + 0xa0);
  assert.equal(exp.anm2GetlayerTry(0x2000, -1, 4, GL_OUT), 0);
  const ANM2 = MEM + 0x2900;
  for (let i = 0; i < 0x120; i++) writeU8(viewSlots, ANM2 + i, 0);
  writeU32(viewSlots, ANM2 + EXIT_ANM2_LAYER_BASE_OFF, 0x5000);
  writeI32(viewSlots, ANM2 + EXIT_ANM2_LAYER_COUNT_OFF, 3);
  assert.equal(exp.anm2GetlayerApply(ANM2, 2) >>> 0, 0x5000 + 2 * 0xa0);
  assert.equal(exp.anm2GetlayerApply(ANM2, 3) >>> 0, 0);
  assert.equal(exp.anm2GetlayerApply(0, 0) >>> 0, 0);

  assert.equal(exp.anm2LoadPathPresent(0), 0);
  assert.equal(exp.anm2LoadPathPresent(5), 1);
  assert.equal(exp.anm2LoadPathIsSelf(0x100, 0x100), 1);
  assert.equal(exp.anm2LoadPathIsSelf(0x100, 0x104), 0);
  assert.equal(exp.anm2LoadGraphicsNeeded(0), 0);
  assert.equal(exp.anm2LoadGraphicsNeeded(1), 1);
  exp.anm2LoadPrefixApply(ANM2);
  assert.equal(readU8(viewSlots, ANM2 + EXIT_ANM2_LOAD_FLAG_109_OFF), 1);
  assert.equal(
    readU32(viewSlots, ANM2 + EXIT_ANM2_SHADOW_INDEX_OFF) >>> 0,
    EXIT_ANM2_SHADOW_INDEX_INIT >>> 0,
  );
  const LOAD_PFX = MEM + 0x2a80;
  // IsaacExitAnm2LoadPrefixState: u8 + pad3 + u32
  exp.anm2LoadPrefix(LOAD_PFX);
  assert.equal(readU8(viewSlots, LOAD_PFX), EXIT_ANM2_LOAD_FLAG_109_VALUE);
  assert.equal(readU32(viewSlots, LOAD_PFX + 4) >>> 0, EXIT_ANM2_SHADOW_INDEX_INIT >>> 0);
  assert.equal(exp.anm2LayerLoopNeeded(0), 0);
  assert.equal(exp.anm2LayerLoopNeeded(2), 1);
  assert.equal(exp.anm2LayerByteOff(3) >>> 0, 3 * 0xa0);
  assert.equal(exp.anm2LayerNameHolderNull(0), 1);
  assert.equal(exp.anm2LayerNameHolderNull(1), 0);
  assert.equal(
    exp.anm2LayerNameStrAddr(0x1000) >>> 0,
    0x1000 + EXIT_ANM2_LAYER_NAME_STR_DELTA,
  );

  const writeCstr = (off, s) => {
    for (let i = 0; i < s.length; i++) writeU8(viewSlots, off + i, s.charCodeAt(i));
    writeU8(viewSlots, off + s.length, 0);
  };
  const S1 = MEM + 0x2b00;
  const S2 = MEM + 0x2b20;
  writeCstr(S1, "shadow");
  writeCstr(S2, "shadow");
  assert.equal(exp.anm2CstrEqual(S1, S2), 1);
  assert.equal(exp.anm2NameIsShadow(S1), 1);
  writeCstr(S2, "Shadow");
  assert.equal(exp.anm2CstrEqual(S1, S2), 0);
  assert.equal(exp.anm2NameIsShadow(S2), 0);
  assert.equal(exp.anm2NameIsStar(EXIT_ANM2_STAR_BYTE), 1);
  assert.equal(exp.anm2NameIsStar(0x41), 0);
  assert.equal(exp.anm2LayerStarFlagsValue(0) >>> 0, EXIT_ANM2_LAYER_STAR_OR);
  assert.equal(exp.anm2Flags110Or400Value(1) >>> 0, 1 | EXIT_ANM2_STAR_GLOBAL_OR_400);
  assert.equal(exp.anm2Flags110Or800Value(0) >>> 0, EXIT_ANM2_STAR_GLOBAL_OR_800);

  const SHADOW_SLOT = MEM + 0x2b40;
  const STAR_FLAGS = MEM + 0x2b44;
  const FLAGS110 = MEM + 0x2b48;
  writeU32(viewSlots, SHADOW_SLOT, 0xffffffff);
  writeU32(viewSlots, STAR_FLAGS, 0);
  writeU32(viewSlots, FLAGS110, 0);
  writeCstr(S1, "shadow");
  assert.equal(exp.anm2LoadLayerStep(S1, 7, SHADOW_SLOT, STAR_FLAGS, FLAGS110), 1);
  assert.equal(readU32(viewSlots, SHADOW_SLOT), 7);
  assert.equal(readU32(viewSlots, STAR_FLAGS), 0);
  writeU32(viewSlots, SHADOW_SLOT, 0xffffffff);
  writeCstr(S1, "*glow");
  assert.equal(exp.anm2LoadLayerStep(S1, 2, SHADOW_SLOT, STAR_FLAGS, FLAGS110), 0);
  assert.equal(readU32(viewSlots, SHADOW_SLOT) >>> 0, 0xffffffff);
  assert.equal(readU32(viewSlots, STAR_FLAGS) >>> 0, EXIT_ANM2_LAYER_STAR_OR);
  assert.equal(readU32(viewSlots, FLAGS110) >>> 0, EXIT_ANM2_STAR_GLOBAL_OR_400);
  writeU32(viewSlots, FLAGS110, 1);
  writeCstr(S1, "*sheet");
  exp.anm2LoadSheetStep(S1, FLAGS110);
  assert.equal(
    readU32(viewSlots, FLAGS110) >>> 0,
    (1 | EXIT_ANM2_STAR_GLOBAL_OR_800) >>> 0,
  );
  assert.equal(exp.anm2SheetLoopNeeded(0), 0);
  assert.equal(exp.anm2SheetLoopNeeded(4), 1);
  assert.equal(exp.anm2SheetStride() >>> 0, EXIT_ANM2_SHEET_STRIDE);
  assert.equal(exp.anm2SheetPtr(0x3000, 2) >>> 0, 0x3000 + 2 * 0x18);

  assert.equal(exp.usesHeapHeader40cf00(0xfff), 0);
  assert.equal(exp.usesHeapHeader40cf00(0x1000), 1);
  assert.equal(exp.sizeIsZero40cf00(0), 1);
  assert.equal(exp.sizeIsZero40cf00(1), 0);
  assert.equal(exp.headerRequestSize40cf00(0x1000) >>> 0, 0x1000 + 0x23);
  assert.equal(exp.headerOverflow40cf00(0xffffffe0), 1);
  assert.equal(exp.headerOverflow40cf00(0x1000), 0);
  assert.equal(exp.allocRequestSize40cf00(0x20) >>> 0, 0x20);
  assert.equal(exp.allocRequestSize40cf00(0x1000) >>> 0, 0x1000 + 0x23);
  assert.equal(exp.allocRequestSize40cf00(0) >>> 0, 0);
  assert.equal(exp.alignUserPtr40cf00(0x1000) >>> 0, (0x1000 + 0x23) & 0xffffffe0);
  assert.equal(
    exp.headerSlot40cf00(exp.alignUserPtr40cf00(0x1000)) >>> 0,
    (((0x1000 + 0x23) & 0xffffffe0) - 4) >>> 0,
  );
  const PLAN16 = MEM + 0x2c00;
  // IsaacExit40cf00Plan: size, request, uses_header, size_zero, overflow, skip_alloc
  // layout: u32, u32, i32, i32, i32, i32
  exp.plan40cf00(PLAN16, 0);
  assert.equal(readU32(viewSlots, PLAN16), 0);
  assert.equal(readU32(viewSlots, PLAN16 + 4), 0);
  assert.equal(readI32(viewSlots, PLAN16 + 8), 0); // uses_header
  assert.equal(readI32(viewSlots, PLAN16 + 0xc), 1); // size_zero
  assert.equal(readI32(viewSlots, PLAN16 + 0x14), 1); // skip_alloc
  exp.plan40cf00(PLAN16, 0x1000);
  assert.equal(readU32(viewSlots, PLAN16), 0x1000);
  assert.equal(readU32(viewSlots, PLAN16 + 4), 0x1000 + 0x23);
  assert.equal(readI32(viewSlots, PLAN16 + 8), 1);
  assert.equal(readI32(viewSlots, PLAN16 + 0xc), 0);
  assert.equal(readI32(viewSlots, PLAN16 + 0x10), 0);
  assert.equal(readI32(viewSlots, PLAN16 + 0x14), 0);
  // finish_header: store raw at header_slot pointer; return aligned
  const RAW16 = 0x2d00;
  const HDR_SLOT16 = MEM + 0x2e00;
  writeU32(viewSlots, HDR_SLOT16, 0);
  const aligned16 = exp.finishHeader40cf00(HDR_SLOT16, RAW16) >>> 0;
  assert.equal(aligned16, exit40cf00AlignUserPtr(RAW16));
  assert.equal(readU32(viewSlots, HDR_SLOT16) >>> 0, RAW16);
  assert.equal(exp.finishHeader40cf00(0, 0) >>> 0, 0);
  assert.equal(
    exp.finishHeader40cf00(0, RAW16) >>> 0,
    exit40cf00AlignUserPtr(RAW16),
  );

  assert.equal(exitAnm2GetlayerInRange(1, 2), true);
  assert.equal(exitAnm2LayerPtr(0x10, 1), 0x10 + 0xa0);
  assert.equal(exitAnm2NameIsShadow("shadow"), true);
  assert.equal(exitAnm2NameIsStar(0x2a), true);
  assert.equal(exit40cf00Plan(0x1000).requestSize, 0x1000 + 0x23);
  assert.equal(EXIT_ANM2_LAYER_STRIDE, 0xa0);
  assert.equal(EXIT_40CF00_HEADER_THRESHOLD, 0x1000);
  assert.equal(EXIT_40CF00_HEADER_ADD, 0x23);
  assert.equal(EXIT_40CF00_ALIGN_MASK, 0xffffffe0);

  // ABI v17: ReplaceSpritesheet / Play path 0x40a5d0 pure CF
  assert.equal(exp.anm2LayerPngStrOff() >>> 0, EXIT_ANM2_LAYER_PNG_STR_OFF);
  assert.equal(exp.anm2LayerFlag30Off() >>> 0, EXIT_ANM2_LAYER_FLAG30_OFF);
  assert.equal(
    exp.anm2LayerPngStrPtr(0x1000) >>> 0,
    0x1000 + EXIT_ANM2_LAYER_PNG_STR_OFF,
  );
  const EQ_A = MEM + 0x3500;
  const EQ_B = MEM + 0x3520;
  const writeBytes = (off, s) => {
    for (let i = 0; i < s.length; i++) writeU8(viewSlots, off + i, s.charCodeAt(i));
  };
  writeBytes(EQ_A, "png");
  writeBytes(EQ_B, "png");
  assert.equal(exp.anm2SizedEqual(EQ_A, 3, EQ_B, 3), 1);
  assert.equal(exp.anm2SizedEqual(EQ_A, 3, EQ_B, 2), 0);
  writeBytes(EQ_B, "pnx");
  assert.equal(exp.anm2SizedEqual(EQ_A, 3, EQ_B, 3), 0);
  assert.equal(exp.anm2SizedEqual(EQ_A, 0, EQ_B, 0), 1);
  assert.equal(exp.anm2ReplaceAssignNeeded(0x100, 0x100), 0);
  assert.equal(exp.anm2ReplaceAssignNeeded(0x100, 0x104), 1);

  const RPLAN = MEM + 0x3580;
  // IsaacExitAnm2ReplacePlan: i32Ã—5 + u32Ã—2 = 28 bytes
  // in_range, already_equal, assign_needed, will_succeed, return_bool, layer_ptr, png_str_ptr
  writeBytes(EQ_A, "sheet");
  writeBytes(EQ_B, "sheet");
  exp.anm2ReplacePlan(RPLAN, 1, 3, 0x2000, 0x3000, EQ_A, 5, EQ_B, 5);
  assert.equal(readI32(viewSlots, RPLAN), 1); // in_range
  assert.equal(readI32(viewSlots, RPLAN + 4), 1); // already_equal
  assert.equal(readI32(viewSlots, RPLAN + 8), 0); // assign_needed
  assert.equal(readI32(viewSlots, RPLAN + 0xc), 0); // will_succeed
  assert.equal(readI32(viewSlots, RPLAN + 0x10), 0); // return_bool
  assert.equal(readU32(viewSlots, RPLAN + 0x14) >>> 0, 0x2000 + 0xa0);
  assert.equal(
    readU32(viewSlots, RPLAN + 0x18) >>> 0,
    0x2000 + 0xa0 + EXIT_ANM2_LAYER_PNG_STR_OFF,
  );
  writeBytes(EQ_B, "other");
  exp.anm2ReplacePlan(RPLAN, 1, 3, 0x2000, 0x3000, EQ_A, 5, EQ_B, 5);
  assert.equal(readI32(viewSlots, RPLAN + 4), 0); // already_equal
  assert.equal(readI32(viewSlots, RPLAN + 8), 1); // assign_needed
  assert.equal(readI32(viewSlots, RPLAN + 0xc), 1); // will_succeed
  assert.equal(readI32(viewSlots, RPLAN + 0x10), 1); // return_bool
  // self path object: assign_needed=0, still succeeds
  const pngSelf =
    (0x2000 + 0xa0 + EXIT_ANM2_LAYER_PNG_STR_OFF) >>> 0;
  exp.anm2ReplacePlan(RPLAN, 1, 3, 0x2000, pngSelf, EQ_A, 5, EQ_B, 5);
  assert.equal(readI32(viewSlots, RPLAN + 8), 0); // assign_needed
  assert.equal(readI32(viewSlots, RPLAN + 0xc), 1); // will_succeed
  // OOB
  exp.anm2ReplacePlan(RPLAN, -1, 3, 0x2000, 0x3000, EQ_A, 5, EQ_B, 5);
  assert.equal(readI32(viewSlots, RPLAN), 0);
  assert.equal(readI32(viewSlots, RPLAN + 0x10), 0);

  const LAYER = MEM + 0x3600;
  for (let i = 0; i < 0x40; i++) writeU8(viewSlots, LAYER + i, 0xab);
  assert.equal(exp.anm2ReplaceFinish(LAYER, 0), 0);
  assert.equal(readU8(viewSlots, LAYER + EXIT_ANM2_LAYER_FLAG30_OFF), 0xab);
  assert.equal(exp.anm2ReplaceFinish(LAYER, 1), 1);
  assert.equal(readU8(viewSlots, LAYER + EXIT_ANM2_LAYER_FLAG30_OFF), 0);
  const FLAG30 = MEM + 0x3650;
  writeU8(viewSlots, FLAG30, 7);
  exp.anm2ReplaceFlag30Clear(FLAG30);
  assert.equal(readU8(viewSlots, FLAG30), 0);

  assert.equal(exp.anm2AnimStride() >>> 0, EXIT_ANM2_ANIM_STRIDE);
  assert.equal(exp.anm2AnimBaseOff() >>> 0, EXIT_ANM2_ANIM_BASE_OFF);
  assert.equal(exp.anm2AnimCountOff() >>> 0, EXIT_ANM2_ANIM_COUNT_OFF);
  assert.equal(exp.anm2PlayStateOff() >>> 0, EXIT_ANM2_PLAY_STATE_OFF);
  assert.equal(exp.anm2AnimLoopNeeded(0), 0);
  assert.equal(exp.anm2AnimLoopNeeded(2), 1);
  assert.equal(
    exp.anm2AnimEntryPtr(0x1000, 2) >>> 0,
    0x1000 + 2 * EXIT_ANM2_ANIM_STRIDE,
  );
  assert.equal(
    exp.anm2PlayStatePtr(0x4000) >>> 0,
    0x4000 + EXIT_ANM2_PLAY_STATE_OFF,
  );
  assert.equal(exp.anm2PlayResetNeeded(0), 0);
  assert.equal(exp.anm2PlayResetNeeded(1), 1);
  const NM1 = MEM + 0x3700;
  const NM2 = MEM + 0x3720;
  writeCstr(NM1, "Idle");
  writeCstr(NM2, "Idle");
  assert.equal(exp.anm2PlayNameMatch(NM1, NM2), 1);
  writeCstr(NM2, "Walk");
  assert.equal(exp.anm2PlayNameMatch(NM1, NM2), 0);

  const PPLAN = MEM + 0x3780;
  // IsaacExitAnm2PlayPlan: i32Ã—5 + u32Ã—2
  exp.anm2PlayPlan(PPLAN, 0x5000, 0x6000, 3, 1, 1);
  assert.equal(readI32(viewSlots, PPLAN), 1); // loop_needed
  assert.equal(readI32(viewSlots, PPLAN + 4), 1); // found
  assert.equal(readI32(viewSlots, PPLAN + 8), 0); // miss_log
  assert.equal(readI32(viewSlots, PPLAN + 0xc), 1); // reset_needed
  assert.equal(readI32(viewSlots, PPLAN + 0x10), 1); // return_bool
  assert.equal(
    readU32(viewSlots, PPLAN + 0x14) >>> 0,
    0x6000 + EXIT_ANM2_ANIM_STRIDE,
  );
  assert.equal(
    readU32(viewSlots, PPLAN + 0x18) >>> 0,
    0x5000 + EXIT_ANM2_PLAY_STATE_OFF,
  );
  exp.anm2PlayPlan(PPLAN, 0x5000, 0x6000, 3, -1, 0);
  assert.equal(readI32(viewSlots, PPLAN + 4), 0); // found
  assert.equal(readI32(viewSlots, PPLAN + 8), 1); // miss_log
  assert.equal(readI32(viewSlots, PPLAN + 0x10), 0); // return_bool
  exp.anm2PlayPlan(PPLAN, 0x5000, 0x6000, 0, 0, 1);
  assert.equal(readI32(viewSlots, PPLAN), 0); // loop_needed
  assert.equal(readI32(viewSlots, PPLAN + 4), 0);

  // play_find: SSO inline names in anim table
  const ANIM_TAB = MEM + 0x3800;
  const writeSsoName = (entryOff, name) => {
    for (let i = 0; i < 0x18; i++) writeU8(viewSlots, entryOff + i, 0);
    for (let i = 0; i < name.length; i++) {
      writeU8(viewSlots, entryOff + i, name.charCodeAt(i));
    }
    writeU8(viewSlots, entryOff + name.length, 0);
    writeU32(viewSlots, entryOff + 0x10, name.length); // size
    writeU32(viewSlots, entryOff + EXIT_MSVC_STRING_CAP_OFF, 0xf); // SSO cap
  };
  writeSsoName(ANIM_TAB, "Idle");
  writeSsoName(ANIM_TAB + EXIT_ANM2_ANIM_STRIDE, "Walk");
  writeSsoName(ANIM_TAB + 2 * EXIT_ANM2_ANIM_STRIDE, "Death");
  const FIND_OUT = MEM + 0x3f00;
  writeI32(viewSlots, FIND_OUT, 99);
  const NAME_IDLE = MEM + 0x3f10;
  writeCstr(NAME_IDLE, "Walk");
  assert.equal(exp.anm2PlayFind(ANIM_TAB, 3, NAME_IDLE, FIND_OUT), 1);
  assert.equal(readI32(viewSlots, FIND_OUT), 1);
  writeCstr(NAME_IDLE, "Missing");
  assert.equal(exp.anm2PlayFind(ANIM_TAB, 3, NAME_IDLE, FIND_OUT), 0);
  assert.equal(readI32(viewSlots, FIND_OUT), -1);
  assert.equal(exp.anm2PlayFind(ANIM_TAB, 0, NAME_IDLE, FIND_OUT), 0);

  assert.equal(exitAnm2SizedEqual("ab", 2, "ab", 2), true);
  assert.equal(exitAnm2ReplaceAssignNeeded(1, 2), true);
  assert.equal(exitAnm2AnimStride(), EXIT_ANM2_ANIM_STRIDE);
  assert.equal(exitAnm2PlayResetNeeded(1), true);
  const jPlan = exitAnm2ReplacePlan(0, 1, 0x100, 0x200, "x", 1, "y", 1);
  assert.equal(jPlan.willSucceed, true);
  assert.equal(jPlan.assignNeeded, true);
  const jPlay = exitAnm2PlayPlan(0x10, 0x20, 2, 0, 0);
  assert.equal(jPlay.found, true);
  assert.equal(jPlay.resetNeeded, false);
  assert.equal(EXIT_ANM2_LAYER_PNG_STR_OFF, 8);
  assert.equal(EXIT_ANM2_ANIM_STRIDE, 0x13c);
  assert.equal(EXIT_ANM2_PLAY_STATE_OFF, 0x30);

  // ABI v18: AnimationState::Rewind 0x40a1b0 pure CF
  assert.equal(exp.animstateAnimOff() >>> 0, EXIT_ANIMSTATE_ANIM_OFF);
  assert.equal(exp.animstateFrameOff() >>> 0, EXIT_ANIMSTATE_FRAME_OFF);
  assert.equal(exp.animstateMask18Off() >>> 0, EXIT_ANIMSTATE_MASK18_OFF);
  assert.equal(exp.animstateMask1cOff() >>> 0, EXIT_ANIMSTATE_MASK1C_OFF);
  assert.equal(exp.animEventStride() >>> 0, EXIT_ANIM_EVENT_STRIDE);
  assert.equal(exp.animdataLayerCountOff() >>> 0, EXIT_ANIMDATA_LAYER_COUNT_OFF);
  assert.equal(exp.animdataNullCountOff() >>> 0, EXIT_ANIMDATA_NULL_COUNT_OFF);
  assert.equal(exp.animdataEventBaseOff() >>> 0, EXIT_ANIMDATA_EVENT_BASE_OFF);
  assert.equal(exp.animdataEventCountOff() >>> 0, EXIT_ANIMDATA_EVENT_COUNT_OFF);

  assert.equal(exp.animstate408c90AnimPresent(0), 0);
  assert.equal(exp.animstate408c90AnimPresent(0x1000), 1);
  assert.equal(exp.animstate408c90LogNeeded(0), 1);
  assert.equal(exp.animstate408c90LogNeeded(1), 0);
  assert.equal(exp.animstate408c90EventLoopNeeded(0), 0);
  assert.equal(exp.animstate408c90EventLoopNeeded(3), 1);
  assert.equal(exp.animstate408c90EventFrameEq(0, 0), 1);
  assert.equal(exp.animstate408c90EventFrameEq(0, 1), 0);
  assert.equal(exp.animstate408c90EventFrameEq(Math.fround(2), 2), 1);
  assert.equal(exp.animstate408c90MaskBts(0, 0) >>> 0, 1);
  assert.equal(exp.animstate408c90MaskBts(0, 3) >>> 0, 8);
  assert.equal(exp.animstate408c90MaskBts(0, 32) >>> 0, 1); // mod 32
  assert.equal(exp.animstate408c90MaskBts(1, 0) >>> 0, 1);

  const M18 = MEM + 0x5100;
  const M1C = MEM + 0x5104;
  writeU32(viewSlots, M18, 0);
  writeU32(viewSlots, M1C, 0);
  exp.animstate408c90EventStep(M18, M1C, 0, 5, 0);
  assert.equal(readU32(viewSlots, M18) >>> 0, 1 << 5);
  assert.equal(readU32(viewSlots, M1C) >>> 0, 1 << 5);
  exp.animstate408c90EventStep(M18, M1C, 0, 1, 9); // frame mismatch
  assert.equal(readU32(viewSlots, M18) >>> 0, 1 << 5);

  const F0 = MEM + 0x5120;
  const M180 = MEM + 0x5124;
  const M1C0 = MEM + 0x5128;
  writeF32(viewSlots, F0, 99);
  writeU32(viewSlots, M180, 0xdead);
  writeU32(viewSlots, M1C0, 0xbeef);
  exp.animstateRewindPrefix(F0, M180, M1C0);
  assert.equal(readF32(viewSlots, F0), 0);
  assert.equal(readU32(viewSlots, M180) >>> 0, 0);
  assert.equal(readU32(viewSlots, M1C0) >>> 0, 0);

  // Full pure-complete Rewind layout in wasm linear memory
  const ST = MEM + 0x5200;
  const AN = MEM + 0x5300;
  const EV = MEM + 0x5400;
  const LA = MEM + 0x5500;
  const NA = MEM + 0x5580;
  for (let i = 0; i < 0x40; i++) writeU8(viewSlots, ST + i, 0xaa);
  for (let i = 0; i < 0x40; i++) writeU8(viewSlots, AN + i, 0);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_ANIM_OFF, AN);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_LAYER_ARR_OFF, LA);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_NULL_ARR_OFF, NA);
  writeF32(viewSlots, ST + EXIT_ANIMSTATE_FRAME_OFF, 7);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_MASK18_OFF, 0xffffffff);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_MASK1C_OFF, 0xffffffff);
  // events: bit0 frame0, bit3 frame0, bit1 frame5
  writeI32(viewSlots, EV + 0, 0);
  writeI32(viewSlots, EV + 4, 0);
  writeI32(viewSlots, EV + 8, 3);
  writeI32(viewSlots, EV + 12, 0);
  writeI32(viewSlots, EV + 16, 1);
  writeI32(viewSlots, EV + 20, 5);
  writeU32(viewSlots, AN + EXIT_ANIMDATA_EVENT_BASE_OFF, EV);
  writeU32(viewSlots, AN + EXIT_ANIMDATA_EVENT_COUNT_OFF, 3);
  writeU32(viewSlots, AN + EXIT_ANIMDATA_LAYER_COUNT_OFF, 2);
  writeU32(viewSlots, AN + EXIT_ANIMDATA_NULL_COUNT_OFF, 1);
  writeU32(viewSlots, LA, 0x11111111);
  writeU32(viewSlots, LA + 4, 0x22222222);
  writeU32(viewSlots, NA, 0x33333333);

  exp.animstateRewindApply(ST, AN);
  assert.equal(readF32(viewSlots, ST + EXIT_ANIMSTATE_FRAME_OFF), 0);
  // masks: bits 0 and 3 set (frame-0 events); bit1 not (frame 5)
  assert.equal(readU32(viewSlots, ST + EXIT_ANIMSTATE_MASK18_OFF) >>> 0, (1 << 0) | (1 << 3));
  assert.equal(readU32(viewSlots, ST + EXIT_ANIMSTATE_MASK1C_OFF) >>> 0, (1 << 0) | (1 << 3));
  assert.equal(readU32(viewSlots, LA) >>> 0, 0);
  assert.equal(readU32(viewSlots, LA + 4) >>> 0, 0);
  assert.equal(readU32(viewSlots, NA) >>> 0, 0);

  // plan struct
  const RPLAN18 = MEM + 0x5600;
  exp.animstateRewindPlan(RPLAN18, AN, 3, 2, 1);
  assert.equal(readI32(viewSlots, RPLAN18), 1); // anim_present
  assert.equal(readI32(viewSlots, RPLAN18 + 4), 0); // log_needed
  assert.equal(readI32(viewSlots, RPLAN18 + 8), 1); // event_loop
  assert.equal(readI32(viewSlots, RPLAN18 + 0xc), 1); // layer_loop
  assert.equal(readI32(viewSlots, RPLAN18 + 0x10), 1); // null_loop
  assert.equal(readI32(viewSlots, RPLAN18 + 0x14), 1); // pure_complete_ok
  exp.animstateRewindPlan(RPLAN18, 0, 3, 2, 1);
  assert.equal(readI32(viewSlots, RPLAN18), 0);
  assert.equal(readI32(viewSlots, RPLAN18 + 4), 1); // log_needed
  assert.equal(readI32(viewSlots, RPLAN18 + 0x14), 0);

  // apply_addr null anim: prefix only, returns 0
  const STN = MEM + 0x5700;
  for (let i = 0; i < 0x20; i++) writeU8(viewSlots, STN + i, 0x55);
  writeU32(viewSlots, STN + EXIT_ANIMSTATE_ANIM_OFF, 0);
  writeF32(viewSlots, STN + EXIT_ANIMSTATE_FRAME_OFF, 3);
  writeU32(viewSlots, STN + EXIT_ANIMSTATE_MASK18_OFF, 9);
  writeU32(viewSlots, STN + EXIT_ANIMSTATE_MASK1C_OFF, 8);
  assert.equal(exp.animstateRewindApplyAddr(STN), 0);
  assert.equal(readF32(viewSlots, STN + EXIT_ANIMSTATE_FRAME_OFF), 0);
  assert.equal(readU32(viewSlots, STN + EXIT_ANIMSTATE_MASK18_OFF) >>> 0, 0);

  // apply_addr full path
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_ANIM_OFF, AN);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_LAYER_ARR_OFF, LA);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_NULL_ARR_OFF, NA);
  writeF32(viewSlots, ST + EXIT_ANIMSTATE_FRAME_OFF, 1);
  writeU32(viewSlots, ST + EXIT_ANIMSTATE_MASK18_OFF, 0xff);
  writeU32(viewSlots, LA, 9);
  writeU32(viewSlots, LA + 4, 8);
  writeU32(viewSlots, NA, 7);
  assert.equal(exp.animstateRewindApplyAddr(ST), 1);
  assert.equal(readU32(viewSlots, LA) >>> 0, 0);
  assert.equal(readU32(viewSlots, NA) >>> 0, 0);

  assert.equal(exitAnimstate408c90EventFrameEq(0, 0), true);
  assert.equal(exitAnimstate408c90MaskBts(0, 32), 1);
  const jp = exitAnimstateRewindPlan(0x100, 0, 0, 0);
  assert.equal(jp.animPresent, true);
  assert.equal(jp.eventLoopNeeded, false);
  assert.equal(EXIT_ANIMSTATE_FRAME_OFF, 0x10);
  assert.equal(EXIT_ANIM_EVENT_STRIDE, 8);
  assert.equal(exitAnimstateRewindPrefix().mask18, 0);

  // ABI v19: residual string assign 0x40ccd0 pure CF
  assert.equal(exp.maxSize40ccd0() >>> 0, EXIT_40CCD0_MAX_SIZE);
  assert.equal(exp.fitsCapacity40ccd0(5, 15), 1);
  assert.equal(exp.fitsCapacity40ccd0(16, 15), 0);
  assert.equal(exp.fitsCapacity40ccd0(0, 0), 1);
  assert.equal(exp.lengthErrorNeeded40ccd0(0x7fffffff), 0);
  assert.equal(exp.lengthErrorNeeded40ccd0(0x80000000), 1);
  assert.equal(exp.roundedCapacity40ccd0(0) >>> 0, 0xf);
  assert.equal(exp.roundedCapacity40ccd0(1) >>> 0, 0xf);
  assert.equal(exp.roundedCapacity40ccd0(0x10) >>> 0, 0x1f);
  assert.equal(exp.roundedOverflow40ccd0(0), 0);
  // After length check count<=MAX, (count|0xf) never exceeds MAX; branch is still PE-real.
  assert.equal(exp.roundedOverflow40ccd0(0x7fffffff), 0);
  assert.equal(exp.roundedOverflow40ccd0(0x80000000) !== 0, true);
  assert.equal(exp.geoWouldOverflow40ccd0(0), 0);
  assert.equal(exp.geoWouldOverflow40ccd0(0x7fffffff), 1);
  assert.equal(exp.geometricCapacity40ccd0(10) >>> 0, 15);
  assert.equal(exp.geometricCapacity40ccd0(16) >>> 0, 24);
  // fits: SSO dest = str_addr
  assert.equal(exp.destDataAddr40ccd0(0x1000, 0xf, 0xdead) >>> 0, 0x1000);
  // heap dest
  assert.equal(exp.destDataAddr40ccd0(0x1000, 0x10, 0xabcd) >>> 0, 0xabcd);
  // grow from empty: new_cap = 0xf, alloc = 0x10
  assert.equal(exp.newCapacity40ccd0(0, 1) >>> 0, 0xf);
  assert.equal(exp.allocSize40ccd0(0xf) >>> 0, 0x10);
  // grow prefers geometric when larger than rounded
  assert.equal(exp.newCapacity40ccd0(32, 17) >>> 0, 48); // geo=48 > rounded=0x1f
  // grow prefers rounded when larger
  assert.equal(exp.newCapacity40ccd0(0, 20) >>> 0, 0x1f); // 20|0xf=0x1f > geo=0
  assert.equal(exp.oldFreeNeeded40ccd0(0xf), 0);
  assert.equal(exp.oldFreeNeeded40ccd0(0x10), 1);
  assert.equal(exp.freeSize40ccd0(0x10) >>> 0, 0x11);
  assert.equal(exp.freeUsesHeapHeader40ccd0(0xfff), 0);
  assert.equal(exp.freeUsesHeapHeader40ccd0(0x1000), 1);
  assert.equal(exp.freeHeaderSize40ccd0(0x1000) >>> 0, 0x1000 + 0x23);
  assert.equal(exp.freeHeaderOffsetOk40ccd0(0x1004, 0x1000), 1); // off=0
  assert.equal(exp.freeHeaderOffsetOk40ccd0(0x1024, 0x1000), 0); // off=0x20 > 0x1f

  // plan: no-grow SSO
  const PLAN19 = MEM + 0x5800;
  exp.plan40ccd0(PLAN19, 0x2000, 0xf, 0, 5);
  assert.equal(readI32(viewSlots, PLAN19 + 0x18), 1); // fits
  assert.equal(readI32(viewSlots, PLAN19 + 0x1c), 0); // length_error
  assert.equal(readI32(viewSlots, PLAN19 + 0x20), 0); // grow_needed
  assert.equal(readU32(viewSlots, PLAN19 + 8) >>> 0, 0x2000); // dest_data
  assert.equal(readU32(viewSlots, PLAN19 + 0xc) >>> 0, 0xf); // new_capacity=old
  assert.equal(readI32(viewSlots, PLAN19 + 0x34), 1); // sso_inline

  // plan: grow from SSO
  exp.plan40ccd0(PLAN19, 0x2000, 0, 0, 20);
  assert.equal(readI32(viewSlots, PLAN19 + 0x18), 0); // fits
  assert.equal(readI32(viewSlots, PLAN19 + 0x20), 1); // grow
  assert.equal(readU32(viewSlots, PLAN19 + 0xc) >>> 0, 0x1f);
  assert.equal(readU32(viewSlots, PLAN19 + 0x10) >>> 0, 0x20); // alloc
  assert.equal(readI32(viewSlots, PLAN19 + 0x2c), 0); // old_free (cap 0)

  // plan: grow from heap â†’ free
  exp.plan40ccd0(PLAN19, 0x2000, 0x20, 0x3000, 0x30);
  assert.equal(readI32(viewSlots, PLAN19 + 0x20), 1);
  assert.equal(readI32(viewSlots, PLAN19 + 0x2c), 1); // old_free
  assert.equal(readU32(viewSlots, PLAN19 + 0x14) >>> 0, 0x21); // free_size
  assert.equal(readI32(viewSlots, PLAN19 + 0x30), 0); // free_uses_header

  // plan: length error
  exp.plan40ccd0(PLAN19, 0x2000, 0, 0, 0x80000000);
  assert.equal(readI32(viewSlots, PLAN19 + 0x1c), 1);
  assert.equal(readI32(viewSlots, PLAN19 + 0x20), 0);

  // nongrow_finish pure-complete
  const STR = MEM + 0x5900;
  const SRC = MEM + 0x5920;
  for (let i = 0; i < 0x18; i++) writeU8(viewSlots, STR + i, 0xcc);
  writeU8(viewSlots, SRC + 0, 0x41);
  writeU8(viewSlots, SRC + 1, 0x42);
  writeU8(viewSlots, SRC + 2, 0x43);
  exp.nongrowFinish40ccd0(STR, STR + EXIT_MSVC_STRING_SIZE_OFF, SRC, 3);
  assert.equal(readU8(viewSlots, STR + 0), 0x41);
  assert.equal(readU8(viewSlots, STR + 1), 0x42);
  assert.equal(readU8(viewSlots, STR + 2), 0x43);
  assert.equal(readU8(viewSlots, STR + 3), 0);
  assert.equal(readU32(viewSlots, STR + EXIT_MSVC_STRING_SIZE_OFF) >>> 0, 3);

  // grow field helpers
  const GSTR = MEM + 0x5a00;
  writeU32(viewSlots, GSTR, 0x1111);
  writeU32(viewSlots, GSTR + 0x10, 0);
  writeU32(viewSlots, GSTR + 0x14, 0);
  exp.growPreCopy40ccd0(GSTR + 0x10, GSTR + 0x14, 7, 0xf);
  assert.equal(readU32(viewSlots, GSTR + 0x10) >>> 0, 7);
  assert.equal(readU32(viewSlots, GSTR + 0x14) >>> 0, 0xf);
  exp.growPostFree40ccd0(GSTR, 0x9999);
  assert.equal(readU32(viewSlots, GSTR) >>> 0, 0x9999);

  // JS oracle parity
  assert.equal(exit40ccd0FitsCapacity(5, 15), true);
  assert.equal(exit40ccd0NewCapacity(0, 1), 0xf);
  assert.equal(exit40ccd0NewCapacity(32, 17), 48);
  assert.equal(exit40ccd0AllocSize(0xf), 0x10);
  const jPlan19 = exit40ccd0Plan(0x2000, 0xf, 0, 5);
  assert.equal(jPlan19.fits, true);
  assert.equal(jPlan19.destData, 0x2000);
  assert.equal(jPlan19.ssoInline, true);
  assert.equal(EXIT_40CCD0_MAX_SIZE, 0x7fffffff);
  assert.equal(EXIT_40CCD0_ALIGN_OR, 0xf);
  assert.equal(EXIT_40CCD0_FREE_HEADER_THRESHOLD, 0x1000);
  assert.equal(exit40ccd0MaxSize(), EXIT_40CCD0_MAX_SIZE);

  // ABI v20: residual keep-set 0x408970 pure CF
  assert.equal(EXIT_408970_FIELD_4_OFF, 4);
  assert.equal(EXIT_408970_FIELD_8_OFF, 8);
  assert.equal(EXIT_408970_FIELD_C_OFF, 0xc);
  assert.equal(EXIT_408970_ARG_COUNT_A_OFF, 0x1c);
  assert.equal(EXIT_408970_ARG_COUNT_B_OFF, 0x24);
  assert.equal(EXIT_408970_ELEM_SIZE, 4);
  assert.equal(EXIT_408970_FILL_BYTE, 0xff);
  assert.equal(EXIT_408970_HEAP_STATS_FALLBACK, 0x00c7f618);
  assert.equal(EXIT_408970_HEAP_STATS_DELTA, 0x30);

  assert.equal(exp.countSelect408970(0, 5) >>> 0, 0);
  assert.equal(exp.countSelect408970(0x1000, 5) >>> 0, 5);
  assert.equal(exp.countsEqual408970(3, 3), 1);
  assert.equal(exp.countsEqual408970(3, 4), 0);
  assert.equal(exp.countsDiffer408970(3, 4), 1);
  assert.equal(exp.newCountPositive408970(1), 1);
  assert.equal(exp.newCountPositive408970(0), 0);
  assert.equal(exp.newCountPositive408970(0xffffffff), 0); // signed -1
  assert.equal(exp.copyNeeded408970(1), 1);
  assert.equal(exp.copyNeeded408970(0), 0);
  assert.equal(exp.copyNeeded408970(0x80000000), 0); // signed neg
  assert.equal(exp.ptrNonzero408970(0), 0);
  assert.equal(exp.ptrNonzero408970(0xabc), 1);
  assert.equal(exp.allocSize408970(0) >>> 0, 0);
  assert.equal(exp.allocSize408970(1) >>> 0, 4);
  assert.equal(exp.allocSize408970(0x10) >>> 0, 0x40);
  assert.equal(exp.allocSize408970(0x40000000) >>> 0, 0xffffffff);
  assert.equal(exp.fillSize408970(3) >>> 0, 12);
  assert.equal(exp.fillSize408970(0x40000000) >>> 0, 0); // wrap
  assert.equal(exp.copySize408970(5) >>> 0, 20);
  assert.equal(exp.fillByte408970() & 0xff, 0xff);
  assert.equal(exp.heapStatsBase408970(0) >>> 0, EXIT_408970_HEAP_STATS_FALLBACK);
  assert.equal(
    exp.heapStatsBase408970(0x1000) >>> 0,
    (0x1000 + EXIT_408970_HEAP_STATS_DELTA) >>> 0,
  );
  assert.equal(exp.freeBlockPtr408970(0x2000) >>> 0, 0x1ffc);

  const SLOT20 = MEM + 0x6a00;
  writeU32(viewSlots, SLOT20, 0xdead);
  exp.storeArg408970(SLOT20, 0x55aa);
  assert.equal(readU32(viewSlots, SLOT20) >>> 0, 0x55aa);
  writeU32(viewSlots, SLOT20, 0x1111);
  exp.ptrClear408970(SLOT20);
  assert.equal(readU32(viewSlots, SLOT20) >>> 0, 0);

  const THIS20 = MEM + 0x6a40;
  for (let i = 0; i < 0x20; i++) writeU8(viewSlots, THIS20 + i, 0xcd);
  exp.storeArgApply408970(THIS20, 0x12345678);
  assert.equal(readU32(viewSlots, THIS20 + EXIT_408970_FIELD_4_OFF) >>> 0, 0x12345678);
  exp.storeBufAApply408970(THIS20, 0xaaaa);
  exp.storeBufBApply408970(THIS20, 0xbbbb);
  assert.equal(readU32(viewSlots, THIS20 + EXIT_408970_FIELD_8_OFF) >>> 0, 0xaaaa);
  assert.equal(readU32(viewSlots, THIS20 + EXIT_408970_FIELD_C_OFF) >>> 0, 0xbbbb);
  exp.clearBufAApply408970(THIS20);
  exp.clearBufBApply408970(THIS20);
  assert.equal(readU32(viewSlots, THIS20 + EXIT_408970_FIELD_8_OFF) >>> 0, 0);
  assert.equal(readU32(viewSlots, THIS20 + EXIT_408970_FIELD_C_OFF) >>> 0, 0);

  // buffer plan: equal counts â†’ no work
  const BP20 = MEM + 0x6b00;
  exp.bufferPlan408970(BP20, 5, 5, 0x1000);
  assert.equal(readI32(viewSlots, BP20 + 24), 0); // counts_differ
  assert.equal(readI32(viewSlots, BP20 + 40), 0); // realloc_needed
  assert.equal(readI32(viewSlots, BP20 + 32), 0); // free_nonpositive

  // buffer plan: free-nonpositive (new=0, old=5, buf non-null)
  exp.bufferPlan408970(BP20, 5, 0, 0x1000);
  assert.equal(readI32(viewSlots, BP20 + 24), 1); // differ
  assert.equal(readI32(viewSlots, BP20 + 28), 0); // new_positive
  assert.equal(readI32(viewSlots, BP20 + 32), 1); // free_nonpositive
  assert.equal(readI32(viewSlots, BP20 + 36), 1); // a648b0_free_needed
  assert.equal(readI32(viewSlots, BP20 + 40), 0); // realloc

  // buffer plan: realloc + copy + heap free
  exp.bufferPlan408970(BP20, 3, 8, 0x2000);
  assert.equal(readI32(viewSlots, BP20 + 40), 1); // realloc
  assert.equal(readI32(viewSlots, BP20 + 44), 1); // copy_needed
  assert.equal(readI32(viewSlots, BP20 + 48), 1); // heap_free
  assert.equal(readU32(viewSlots, BP20 + 8) >>> 0, 32); // alloc_size 8*4
  assert.equal(readU32(viewSlots, BP20 + 12) >>> 0, 32); // fill_size
  assert.equal(readU32(viewSlots, BP20 + 16) >>> 0, 12); // copy_size 3*4
  assert.equal(readU32(viewSlots, BP20 + 20) >>> 0, 0x1ffc); // free_block

  // combined plan: B realloc â†’ b_store_new_at_a_slot
  const PLAN20 = MEM + 0x6c00;
  exp.plan408970(PLAN20, 1, 1, 2, 4, 0x100, 0x200, 0xdeadbeef);
  assert.equal(readU32(viewSlots, PLAN20) >>> 0, 1); // old_count_a
  assert.equal(readU32(viewSlots, PLAN20 + 4) >>> 0, 1); // new_count_a
  assert.equal(readU32(viewSlots, PLAN20 + 8) >>> 0, 2); // old_count_b
  assert.equal(readU32(viewSlots, PLAN20 + 12) >>> 0, 4); // new_count_b
  assert.equal(readU32(viewSlots, PLAN20 + 16) >>> 0, 0xdeadbeef); // terminal
  assert.equal(readI32(viewSlots, PLAN20 + 36), 0); // a_counts_differ
  assert.equal(readI32(viewSlots, PLAN20 + 80), 1); // b_counts_differ
  assert.equal(readI32(viewSlots, PLAN20 + 96), 1); // b_realloc_needed
  assert.equal(readI32(viewSlots, PLAN20 + 108), 1); // b_store_new_at_a_slot

  // JS oracle parity
  assert.equal(exit408970CountSelect(0, 9), 0);
  assert.equal(exit408970CountSelect(1, 9), 9);
  assert.equal(exit408970AllocSize(0x40000000), 0xffffffff);
  assert.equal(exit408970HeapStatsBase(0), EXIT_408970_HEAP_STATS_FALLBACK);
  const jBuf = exit408970BufferPlan(3, 8, 0x2000);
  assert.equal(jBuf.reallocNeeded, true);
  assert.equal(jBuf.copySize, 12);
  assert.equal(jBuf.freeBlockPtr, 0x1ffc);
  const jPlan20 = exit408970Plan(1, 1, 2, 4, 0x100, 0x200, 0xdeadbeef);
  assert.equal(jPlan20.aCountsDiffer, false);
  assert.equal(jPlan20.bReallocNeeded, true);
  assert.equal(jPlan20.bStoreNewAtASlot, true);
  assert.equal(jPlan20.terminalArg, 0xdeadbeef);
  assert.equal(exit408970StoreArg(0x42), 0x42);
  assert.equal(exit408970PtrClear(), 0);
  assert.equal(exit408970FillByte(), 0xff);

  // ABI v21: residual Load nested 0x40db90 pure CF
  assert.equal(EXIT_40DB90_PATH_SIZE_OFF, 0x10);
  assert.equal(EXIT_40DB90_TIMING_MUL_LO, 0xd7b634db);
  assert.equal(EXIT_40DB90_TIMING_MUL_HI, 0x431bde82);
  assert.equal(EXIT_40DB90_TIMING_SHIFT, 0x12);
  assert.equal(EXIT_40DB90_CACHE_MIN_SPACE, 4);
  assert.equal(EXIT_40DB90_LAYER_STRIDE, 0xa0);
  assert.equal(EXIT_40DB90_SRC_LAYER_STRIDE, 0x38);
  assert.equal(EXIT_40DB90_HEADER_SIZE, 4);
  assert.equal(EXIT_40DB90_HEAP_STATS_FALLBACK, 0x00c7f618);
  assert.equal(EXIT_40DB90_ANM2_LAYER_BASE_OFF, 0x7c);
  assert.equal(EXIT_40DB90_NODE_NAME_OFF, 0x38);
  assert.equal(EXIT_40DB90_ANM2_NAME_OFF, 0x18);

  assert.equal(exp.pathSizePresent40db90(0), 0);
  assert.equal(exp.pathSizePresent40db90(3), 1);
  assert.equal(exp.earlyReturn40db90(0), 1);
  assert.equal(exp.earlyReturn40db90(1), 0);

  const TS = MEM + 0x7000;
  exp.timingScale40db90(0, 0, TS, TS + 4);
  assert.equal(readU32(viewSlots, TS) >>> 0, 0);
  assert.equal(readU32(viewSlots, TS + 4) >>> 0, 0);
  exp.timingScale40db90(1, 0, TS, TS + 4);
  const jTs1 = exit40db90TimingScale(1, 0);
  assert.equal(readU32(viewSlots, TS) >>> 0, jTs1.lo);
  assert.equal(readU32(viewSlots, TS + 4) >>> 0, jTs1.hi);
  exp.timingDelta40db90(100, 0, 40, 0, TS + 8, TS + 12);
  assert.equal(readU32(viewSlots, TS + 8) >>> 0, 60);
  assert.equal(readU32(viewSlots, TS + 12) >>> 0, 0);

  assert.equal(exp.cacheSpaceOk40db90(0, 3), 0);
  assert.equal(exp.cacheSpaceOk40db90(0, 4), 1);
  assert.equal(exp.cacheWalkDone40db90(0x100, 0x100), 1);
  assert.equal(exp.cacheWalkDone40db90(0x100, 0x104), 0);
  assert.equal(exp.cacheWalkNext40db90(0x200) >>> 0, 0x204);

  const sent21 = 0xc78ee0;
  assert.equal(
    exp.treeHitSelect40db90(0x1000, 1, 5, 9, sent21) >>> 0,
    sent21,
  );
  assert.equal(
    exp.treeHitSelect40db90(0x1000, 0, 10, 5, sent21) >>> 0,
    sent21,
  );
  assert.equal(
    exp.treeHitSelect40db90(0x1000, 0, 5, 5, sent21) >>> 0,
    0x1000,
  );
  assert.equal(exp.nodeIsSentinel40db90(sent21, sent21), 1);
  assert.equal(exp.cacheMiss40db90(sent21, sent21), 1);
  assert.equal(exp.insertNeeded40db90(sent21, sent21, 0, 0), 1);
  assert.equal(exp.insertNeeded40db90(0x1000, sent21, 0, 0xabc), 0);
  assert.equal(exp.insertNeeded40db90(0x1000, sent21, 1, 0), 0);
  assert.equal(exp.insertNeeded40db90(0x1000, sent21, 1, 0xabc), 1);

  assert.equal(
    exp.heapStatsBase40db90(0) >>> 0,
    EXIT_40DB90_HEAP_STATS_FALLBACK,
  );
  assert.equal(
    exp.heapStatsBase40db90(0x1000) >>> 0,
    (0x1000 + EXIT_40DB90_HEAP_STATS_DELTA) >>> 0,
  );
  assert.equal(exp.tempFreeNeeded40db90(0), 0);
  assert.equal(exp.tempFreeNeeded40db90(0x50), 1);
  assert.equal(exp.freeBlockPtr40db90(0x2000) >>> 0, 0x1ffc);

  assert.equal(exp.layerArrayPresent40db90(0), 0);
  assert.equal(exp.layerArrayPresent40db90(0x80), 1);
  assert.equal(exp.oldLayerFreeSize40db90(2) >>> 0, 2 * 0xa0 + 4);
  assert.equal(exp.layerCountNonzero40db90(0), 0);
  assert.equal(exp.layerCountNonzero40db90(3), 1);
  assert.equal(exp.layerAllocSize40db90(0) >>> 0, 4);
  assert.equal(exp.layerAllocSize40db90(1) >>> 0, 0xa0 + 4);
  assert.equal(exp.layerAllocSize40db90(0x4000000) >>> 0, 0xffffffff);
  assert.equal(exp.allocOk40db90(0), 0);
  assert.equal(exp.allocOk40db90(0x10), 1);
  assert.equal(exp.userPtrAfterHeader40db90(0x1000) >>> 0, 0x1004);

  assert.equal(exp.layerLoopNeeded40db90(0, 3), 1);
  assert.equal(exp.layerLoopNeeded40db90(3, 3), 0);
  assert.equal(exp.srcLayerStride40db90() >>> 0, 0x38);
  assert.equal(exp.dstLayerStride40db90() >>> 0, 0xa0);
  assert.equal(exp.srcLayerPtr40db90(0x100, 2) >>> 0, 0x100 + 2 * 0x38);
  assert.equal(exp.dstLayerPtr40db90(0x200, 2) >>> 0, 0x200 + 2 * 0xa0);

  const BP21 = MEM + 0x7100;
  exp.storeLayerBackptr40db90(BP21, 0xdead);
  assert.equal(readU32(viewSlots, BP21) >>> 0, 0xdead);
  const LY21 = MEM + 0x7120;
  writeU32(viewSlots, LY21 + 4, 0);
  exp.storeLayerBackptrAt40db90(LY21, 0xbeef);
  assert.equal(readU32(viewSlots, LY21 + EXIT_40DB90_LAYER_BACKPTR_OFF) >>> 0, 0xbeef);

  assert.equal(exp.nameAssignNeeded40db90(0x18, 0x18), 0);
  assert.equal(exp.nameAssignNeeded40db90(0x18, 0x38), 1);

  const FP21 = MEM + 0x7200;
  exp.fieldPack40db90(FP21, 3, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66);
  assert.equal(readU32(viewSlots, FP21) >>> 0, 3);
  assert.equal(readU32(viewSlots, FP21 + 4) >>> 0, 0x11);
  assert.equal(readU32(viewSlots, FP21 + 8) >>> 0, 0x22);
  assert.equal(readU32(viewSlots, FP21 + 12) >>> 0, 0x33);
  assert.equal(readU32(viewSlots, FP21 + 16) >>> 0, 0x44);
  assert.equal(readU32(viewSlots, FP21 + 20) >>> 0, 0x55);
  assert.equal(readU32(viewSlots, FP21 + 24) >>> 0, 0x66);

  const AN21 = MEM + 0x7300;
  for (let i = 0; i < 0xa0; i++) writeU8(viewSlots, AN21 + i, 0xcc);
  exp.fieldPackApply40db90(AN21, FP21);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_LAYER_COUNT_OFF) >>> 0, 3);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD74_OFF) >>> 0, 0x11);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD78_OFF) >>> 0, 0x22);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD84_OFF) >>> 0, 0x33);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD88_OFF) >>> 0, 0x44);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD8C_OFF) >>> 0, 0x55);
  assert.equal(readU32(viewSlots, AN21 + EXIT_40DB90_ANM2_FIELD90_OFF) >>> 0, 0x66);

  // JS oracle parity
  assert.equal(exit40db90PathSizePresent(0), false);
  assert.equal(exit40db90PathSizePresent(2), true);
  assert.equal(exit40db90LayerAllocSize(1), 0xa4);
  assert.equal(exit40db90LayerAllocSize(0x4000000), 0xffffffff);
  assert.equal(exit40db90OldLayerFreeSize(2), 0x144);
  assert.equal(exit40db90TreeHitSelect(0x1000, 0, 5, 5, sent21), 0x1000);
  assert.equal(exit40db90InsertNeeded(sent21, sent21, 0, 0), true);
  const jPlan21 = exit40db90Plan(
    5, 1, 0, 0x10, 0x20, 0x1000, 0, 5, 5, sent21, 1, 0xabc,
    0x80, 2, 2, 0x18, 0x38,
  );
  assert.equal(jPlan21.pathPresent, true);
  assert.equal(jPlan21.earlyReturn, false);
  assert.equal(jPlan21.cacheSpaceOk, true);
  assert.equal(jPlan21.cacheMiss, false);
  assert.equal(jPlan21.insertNeeded, true);
  assert.equal(jPlan21.layerCountNonzero, true);
  assert.equal(jPlan21.layerAllocSize, 0xa0 * 2 + 4);
  assert.equal(jPlan21.nameAssignNeeded, true);
  assert.equal(EXIT_40DB90_CACHE_BEGIN_ADDR, 0x00c798b8);
  assert.equal(EXIT_40DB90_TREE_SENTINEL_ADDR, 0x00c78ee0);

  // ABI v22: residual Load sibling 0x40e110 pure CF
  assert.equal(EXIT_40E110_CACHE_BEGIN_ADDR, 0x00c798b8);
  assert.equal(EXIT_40E110_CACHE_END_ADDR, 0x00c798bc);
  assert.equal(EXIT_40E110_CACHE_CAP_ADDR, 0x00c798c0);
  assert.equal(EXIT_40E110_TREE_SENTINEL_ADDR, 0x00c78ee0);
  assert.equal(EXIT_40E110_CACHE_SPACE_MASK, 0xfffffffc);
  assert.equal(EXIT_40E110_CACHE_PTR_STRIDE, 4);
  assert.equal(EXIT_40E110_PATH_BUF_SIZE, 0x100);
  assert.equal(EXIT_40E110_PATH_CAP_OFF, 0x14);
  assert.equal(EXIT_40E110_PATH_SSO_CAP, 0x10);
  assert.equal(EXIT_40E110_NODE_ISNIL_OFF, 0xd);
  assert.equal(EXIT_40E110_NODE_KEY_OFF, 0x10);
  assert.equal(EXIT_40E110_NODE_REFCOUNT_OFF, 0x50);
  assert.equal(EXIT_40E110_GROW_TRIPLE_DWORDS, 3);

  assert.equal(exp.cacheSpaceOk40e110(0, 0), 0);
  assert.equal(exp.cacheSpaceOk40e110(0, 3), 0);
  assert.equal(exp.cacheSpaceOk40e110(0, 4), 1);
  assert.equal(exp.cacheSpaceOk40e110(0x10, 0x20), 1);
  assert.equal(exp.cacheWalkDone40e110(0x100, 0x100), 1);
  assert.equal(exp.cacheWalkDone40e110(0x100, 0x104), 0);
  assert.equal(exp.cacheWalkNext40e110(0x200) >>> 0, 0x204);
  assert.equal(exp.pathBufSize40e110() >>> 0, 0x100);

  assert.equal(exp.pathDataAddr40e110(0x1000, 0xf, 0xdead) >>> 0, 0x1000);
  assert.equal(exp.pathDataAddr40e110(0x1000, 0x10, 0xdead) >>> 0, 0xdead);

  const sent22 = EXIT_40E110_TREE_SENTINEL_ADDR;
  assert.equal(
    exp.treeHitSelect40e110(0x1000, 1, 5, 9, sent22) >>> 0,
    sent22,
  );
  assert.equal(
    exp.treeHitSelect40e110(0x1000, 0, 10, 5, sent22) >>> 0,
    sent22,
  );
  assert.equal(
    exp.treeHitSelect40e110(0x1000, 0, 5, 5, sent22) >>> 0,
    0x1000,
  );
  assert.equal(exp.nodeIsSentinel40e110(sent22, sent22), 1);
  assert.equal(exp.cacheHit40e110(0x1000, sent22), 1);
  assert.equal(exp.cacheHit40e110(sent22, sent22), 0);
  assert.equal(exp.cacheMiss40e110(sent22, sent22), 1);
  assert.equal(exp.logNeeded40e110(sent22, sent22), 1);
  assert.equal(exp.logNeeded40e110(0x1000, sent22), 0);

  assert.equal(exp.refcountInc40e110(0) >>> 0, 1);
  assert.equal(exp.refcountInc40e110(0xffffffff) >>> 0, 0);
  const RC22 = MEM + 0x7400;
  writeU32(viewSlots, RC22, 7);
  exp.refcountStore40e110(RC22, 42);
  assert.equal(readU32(viewSlots, RC22) >>> 0, 42);
  const ND22 = MEM + 0x7500;
  for (let i = 0; i < 0x60; i++) writeU8(viewSlots, ND22 + i, 0);
  writeU32(viewSlots, ND22 + EXIT_40E110_NODE_REFCOUNT_OFF, 9);
  exp.refcountIncApply40e110(ND22);
  assert.equal(
    readU32(viewSlots, ND22 + EXIT_40E110_NODE_REFCOUNT_OFF) >>> 0,
    10,
  );

  assert.equal(
    exp.growInstallNeeded40e110(EXIT_40E110_CACHE_BEGIN_ADDR),
    0,
  );
  assert.equal(exp.growInstallNeeded40e110(0x2000), 1);
  const GR22 = MEM + 0x7600;
  writeU32(viewSlots, GR22, 1);
  writeU32(viewSlots, GR22 + 4, 2);
  writeU32(viewSlots, GR22 + 8, 3);
  exp.growResultClearAt40e110(GR22);
  assert.equal(readU32(viewSlots, GR22) >>> 0, 0);
  assert.equal(readU32(viewSlots, GR22 + 4) >>> 0, 0);
  assert.equal(readU32(viewSlots, GR22 + 8) >>> 0, 0);

  // JS oracle parity
  assert.equal(exit40e110CacheSpaceOk(0, 3), false);
  assert.equal(exit40e110CacheSpaceOk(0, 4), true);
  assert.equal(exit40e110PathDataAddr(0x1000, 0xf, 0xab), 0x1000);
  assert.equal(exit40e110PathDataAddr(0x1000, 0x10, 0xab), 0xab);
  assert.equal(exit40e110RefcountInc(0xffffffff), 0);
  assert.equal(exit40e110GrowInstallNeeded(EXIT_40E110_CACHE_BEGIN_ADDR), false);
  assert.equal(exit40e110GrowInstallNeeded(0x1), true);
  const jPlan22 = exit40e110Plan(
    0x10,
    0x20,
    0x1000,
    0,
    5,
    5,
    sent22,
    0x2000,
    0xf,
    0xdead,
    0x3000,
    41,
  );
  assert.equal(jPlan22.cacheSpaceOk, true);
  assert.equal(jPlan22.cacheWalkDone, false);
  assert.equal(jPlan22.nodeAddr, 0x1000);
  assert.equal(jPlan22.cacheHit, true);
  assert.equal(jPlan22.cacheMiss, false);
  assert.equal(jPlan22.logNeeded, false);
  assert.equal(jPlan22.refcountIncNeeded, true);
  assert.equal(jPlan22.refcountNext, 42);
  assert.equal(jPlan22.pathDataAddr, 0x2000);
  assert.equal(jPlan22.pathBufSize, 0x100);
  assert.equal(jPlan22.growInstallNeeded, true);

  const jPlan22Miss = exit40e110Plan(
    0,
    0,
    0x1000,
    1,
    5,
    9,
    sent22,
    0x2000,
    0x20,
    0xbeef,
    EXIT_40E110_CACHE_BEGIN_ADDR,
    7,
  );
  assert.equal(jPlan22Miss.cacheSpaceOk, false);
  assert.equal(jPlan22Miss.cacheWalkDone, true);
  assert.equal(jPlan22Miss.nodeAddr, sent22);
  assert.equal(jPlan22Miss.cacheHit, false);
  assert.equal(jPlan22Miss.logNeeded, true);
  assert.equal(jPlan22Miss.refcountNext, 0);
  assert.equal(jPlan22Miss.pathDataAddr, 0xbeef);
  assert.equal(jPlan22Miss.growInstallNeeded, false);
});

// ABI v29 â€” byte-wide gate boundary, driven ACROSS the Wasm boundary.
//
// Every helper below models an x86 BYTE test: `test al,al` for the COM
// release gates, `cmp byte ptr [n+0xd],0` for the _Isnil tree flags, and
// `cmp byte ptr [ebp+N],0` for the flag predicates. Only the LOW BYTE may
// decide. Until v29 these took a `uint8_t` parameter, which let -O2 delete
// the in-body mask (the Wasm ABI never narrows an i32 argument), so the
// compiled helper read the full word â€” and no test noticed, because every
// Wasm-side draw in this file was masked with `& 0xff` before the call and
// the 0x100 case existed only as a JS-oracle-side assertion.
//
// These assertions are PE TRUTH, not oracle agreement: 0x100 has AL == 0,
// so a `test al,al` gate must be FALSE and an `_Isnil` byte-zero test must
// CONTINUE, regardless of what either implementation says.
test("Wasm byte gates ignore bits above the low byte (ABI v29)", () => {
  const exp = loadExports();

  // value -> what the PE's AL sees.
  const WIDE = [
    0, 1, 2, 0x7f, 0x80, 0xff,
    0x100, 0x101, 0x1ff, 0x200,
    0xff00, 0xffff, 0x12345600, 0x12345601,
    0xffffff00, 0xfffffffe, 0xffffffff,
  ];

  // [wasm export key, JS oracle, "nonzero" | "zero"]
  //   nonzero: helper is true when the low byte is non-zero (test al,al)
  //   zero:    helper is true when the low byte is zero (cmp byte,0 / je)
  const GATES = [
    ["sessionActive", exitSessionActive, "nonzero"],
    ["gamestateIoNeeded", exitGamestateIoNeeded, "zero"],
    ["8d3250CursorLayerHostNeeded", exit8d3250CursorLayerHostNeeded, null],
    ["modePathA648b0", exitA648b0ModePath, null],
    ["map1a738FlagActive", exitMap1a738FlagActive, null],
    ["69d690CandidateIsnil", exit69d690CandidateIsnil, "nonzero"],
    ["685bc0RootIsEmpty", exit685bc0RootIsEmpty, "nonzero"],
    ["685bc0LoopContinue", exit685bc0LoopContinue, "zero"],
    ["anm2LoadGraphicsNeeded", exitAnm2LoadGraphicsNeeded, null],
    ["anm2NameIsStar", exitAnm2NameIsStar, null],
    ["anm2PlayResetNeeded", exitAnm2PlayResetNeeded, null],
    ["40c000LayerSkip", exit40c000LayerSkip, null],
    ["40c000LayerBodyNeeded", exit40c000LayerBodyNeeded, null],
    ["40c000VirtualOk", exit40c000VirtualOk, "nonzero"],
    ["408640VirtualOk", exit408640VirtualOk, "nonzero"],
    ["rangeDestroyVirtualOk", exitRangeDestroyVirtualOk, "nonzero"],
    ["709150VirtualOk", exit709150VirtualOk, "nonzero"],
    ["40c4a0VirtualOk", exit40c4a0VirtualOk, "nonzero"],
    ["415800WalkContinue", exit415800WalkContinue, "zero"],
    ["415800VirtualOk", exit415800VirtualOk, "nonzero"],
  ];

  for (const [key, oracle, truth] of GATES) {
    const fn = exp[key];
    assert.equal(typeof fn, "function", `missing wasm export for ${key}`);
    for (const v of WIDE) {
      const low = v & 0xff;
      const w = fn(v) !== 0;
      // 1. PE truth: only the low byte may change the answer.
      assert.equal(
        w,
        fn(low) !== 0,
        `${key}: high bits changed the result for ${v.toString(16)}`,
      );
      // 2. Direction, where the PE fixes it outright.
      if (truth === "nonzero") {
        assert.equal(w, low !== 0, `${key}(0x${v.toString(16)}) vs test al,al`);
      } else if (truth === "zero") {
        assert.equal(w, low === 0, `${key}(0x${v.toString(16)}) vs cmp byte,0`);
      }
      // 3. And the oracle must agree at the same wide input. (The oracles
      // return booleans, so coerce rather than comparing against 0.)
      assert.equal(w, Boolean(oracle(v)), `${key}: wasm/oracle split at ${v.toString(16)}`);
    }
  }

  // The multi-parameter callback gates take the same AL in a later slot;
  // 0x100 there must not enable a release either.
  const cbGlobal = EXIT_RANGE_DESTROY_CALLBACK_GLOBAL;
  assert.equal(exp.rdCallbackNeeded(1, 0x100, cbGlobal) !== 0, false);
  assert.equal(exp.rdCallbackNeeded(1, 0x101, cbGlobal) !== 0, true);
  assert.equal(exp.callbackNeeded709150(1, 0x100, cbGlobal) !== 0, false);
  assert.equal(exp.callbackNeeded709150(1, 0x101, cbGlobal) !== 0, true);
  assert.equal(exp.callbackNeeded40c4a0(1, 0x100, cbGlobal) !== 0, false);
  assert.equal(exp.callbackNeeded40c4a0(1, 0x101, cbGlobal) !== 0, true);
  assert.equal(exp.callbackNeeded415800(1, 0x100, cbGlobal) !== 0, false);
  assert.equal(exp.callbackNeeded415800(1, 0x101, cbGlobal) !== 0, true);
});

// ABI v30 â€” key hash 0x00a159d0 and keyed registry store/release 0x0040e520.
test("Wasm/JS: 0x00a159d0 key hash + 0x0040e520 store+release (ABI v30; v109 dedupe)", () => {
  const exp = loadExports();
  const P30 = MEM + 0x10000; // IsaacExit40e520Plan (10 dwords)
  const v30 = new DataView(exp.memory.buffer);

  // ---- 0x00a159d0 key hash — v109 dedupe: laws OWNED by the render-shell
  // family (isaac_render_shell_a159d0_norm_char / hash_step / hash landed
  // at RShell ABI v7; render-slice a14050 chain consumes them by name).
  // Exit keeps the host-VA constant + PE constants and pins the RShell
  // export semantics BY REFERENCE. No duplicate law exports. -------------
  assert.equal(EXIT_A159D0_HOST_VA, 0x00a159d0);
  // PE TRUTH, re-asserted through the OWNER's (render-shell) laws:
  // window = (uint8)(ch-0x41) <= 0x19 (cmova, UNSIGNED) — ONLY A-Z fold,
  // NOT `ch | 0x20` (that would merge '@'/'`' '['/'{' ']'/'}').
  for (const [ch, want] of [
    [0x41, 0x61], [0x5a, 0x7a], [0x40, 0x40], [0x5b, 0x5b], [0x60, 0x60],
    [0x7b, 0x7b], [0x61, 0x61], [0x5c, 0x2f], [0x2f, 0x2f], [0x00, 0x00],
    [0xff, 0xff], [0x1ff, 0xff], // byte-gated
  ]) {
    assert.equal(renderShellA159d0NormChar(ch), want, `norm_char 0x${ch.toString(16)}`);
  }
  // step: shl 5 + add self == *33 wrapping; addend zero-extended BYTE.
  assert.equal(renderShellA159d0HashStep(0, 0), 0);
  assert.equal(renderShellA159d0HashStep(1, 0), 33);
  assert.equal(renderShellA159d0HashStep(0, 7), 7);
  assert.equal(renderShellA159d0HashStep(EXIT_A159D0_HASH_INIT, 0), 0x1505 * 33);
  assert.equal(renderShellA159d0HashStep(0xffffffff, 0), 0xffffffdf);
  assert.equal(renderShellA159d0HashStep(0, 0x100), 0);
  assert.equal(renderShellA159d0HashStep(0, 0x1ff), 0xff);
  // whole-string: null -> 0 (never deref); "" -> seed (0x1505). The two
  // cases MUST stay distinct.
  assert.equal(renderShellA159d0Hash(null), EXIT_A159D0_NULL_HASH);
  assert.equal(renderShellA159d0Hash(""), EXIT_A159D0_HASH_INIT);
  assert.notEqual(renderShellA159d0Hash(null), renderShellA159d0Hash(""));
  // case-insensitive over A-Z + '\' normalised to '/'; NOT `|0x20` for the
  // outside-A-Z pairs.
  assert.equal(renderShellA159d0Hash("ABC"), renderShellA159d0Hash("abc"));
  assert.equal(renderShellA159d0Hash("Resources\\Anim"), renderShellA159d0Hash("resources/anim"));
  assert.equal(renderShellA159d0Hash("A\\B"), renderShellA159d0Hash("a/b"));
  assert.notEqual(renderShellA159d0Hash("@"), renderShellA159d0Hash("`"));
  assert.notEqual(renderShellA159d0Hash("["), renderShellA159d0Hash("{"));
  assert.notEqual(renderShellA159d0Hash("]"), renderShellA159d0Hash("}"));
  assert.notEqual(renderShellA159d0Hash("unknown"), renderShellA159d0Hash("known"));
  assert.equal(renderShellA159d0Hash("a"), (0x1505 * 33 + 0x61) >>> 0);
  assert.equal(renderShellA159d0Hash("KAGE_ColorTextureShader"), 0xb3d14323);

  // ---- 0x0040e520 gates ---------------------------------------------------
  // PE TRUTH, and the discriminating pair in this function: the entry gate
  // at 0x0040e54f is `test eax,eax` (FULL dword) while the release gate at
  // 0x0040e59d is `test al,al` (LOW BYTE). They must not be modelled alike.
  assert.equal(exp.mapStoreNeeded40e520(0) !== 0, false);
  assert.equal(exp.mapStoreNeeded40e520(1) !== 0, true);
  assert.equal(exp.mapStoreNeeded40e520(0x100) !== 0, true); // full word
  assert.equal(exp.mapStoreNeeded40e520(0xffffff00) !== 0, true); // full word
  assert.equal(exp.virtualOk40e520(0) !== 0, false);
  assert.equal(exp.virtualOk40e520(1) !== 0, true);
  assert.equal(exp.virtualOk40e520(0x100) !== 0, false); // low byte only
  assert.equal(exp.virtualOk40e520(0xffffff00) !== 0, false); // low byte only
  assert.equal(exp.virtualOk40e520(0x1ff) !== 0, true);

  // Name ladder. PE TRUTH: the primary short-circuits, so the fallback is
  // not merely lower priority â€” it is never read at all.
  assert.equal(exp.namePtr40e520(0x1234, 0x5678) >>> 0, 0x1234);
  assert.equal(exp.namePtr40e520(0x1234, 0) >>> 0, 0x1234);
  assert.equal(
    exp.namePtr40e520(0x1234, 0) >>> 0,
    exp.namePtr40e520(0x1234, 0xffffffff) >>> 0,
  );
  assert.equal(exp.namePtr40e520(0, 0x5678) >>> 0, 0x5678);
  assert.equal(exp.namePtr40e520(0, 0) >>> 0, EXIT_40E520_DEFAULT_NAME_ADDR);
  assert.equal(exp.defaultNameAddr40e520() >>> 0, 0x00b65788);
  assert.equal(exp.mapGlobal40e520() >>> 0, 0x00c78ee8);
  assert.equal(exp.pairValuePtr40e520(0x900) >>> 0, 0x900);
  assert.equal(exp.pairCtrlPtr40e520(0x900) >>> 0, 0x904);
  // PE TRUTH: the callback takes the pair's ADDRESS (lea ecx,[ebp+8]).
  assert.equal(exp.callbackArgPtr40e520(0x900) >>> 0, 0x900);
  assert.equal(exp.releaseCtrlPresent40e520(0) !== 0, false);
  assert.equal(exp.releaseCtrlPresent40e520(0x100) !== 0, true); // full word
  assert.equal(exp.callbackNeeded40e520(0, 1, 0x1000) !== 0, false);
  assert.equal(exp.callbackNeeded40e520(9, 0, 0x1000) !== 0, false);
  assert.equal(exp.callbackNeeded40e520(9, 1, 0) !== 0, false);
  assert.equal(exp.callbackNeeded40e520(9, 1, 0x1000) !== 0, true);
  assert.equal(exp.callbackNeeded40e520(9, 0x100, 0x1000) !== 0, false);

  // ---- 0x0040e520 plan, fixed + randomized differential -------------------
  const readPlan = (base) => ({
    pairBase: readU32(v30, base + 0) >>> 0,
    pairValue: readU32(v30, base + 4) >>> 0,
    mapStoreNeeded: readI32(v30, base + 8) !== 0,
    namePtr: readU32(v30, base + 12) >>> 0,
    mapGlobal: readU32(v30, base + 16) >>> 0,
    ctrlAfterHosts: readU32(v30, base + 20) >>> 0,
    releaseCtrlPresent: readI32(v30, base + 24) !== 0,
    virtualOk: readI32(v30, base + 28) !== 0,
    callbackNeeded: readI32(v30, base + 32) !== 0,
    callbackArgPtr: readU32(v30, base + 36) >>> 0,
  });

  // Store skipped: PE TRUTH that the ladder is never evaluated, so no name
  // is produced even though both fields are populated.
  exp.plan40e520(P30, 0x900, 0, 0x1111, 0x2222, 0, 0, EXIT_40E520_CALLBACK_GLOBAL);
  {
    const w = readPlan(P30);
    assert.equal(w.mapStoreNeeded, false);
    assert.equal(w.namePtr, 0);
    assert.equal(w.callbackNeeded, false);
    assert.deepEqual(
      w,
      exit40e520Plan(0x900, 0, 0x1111, 0x2222, 0, 0, EXIT_40E520_CALLBACK_GLOBAL),
    );
  }
  // Store taken and release fires.
  exp.plan40e520(P30, 0x900, 0x77, 0, 0, 0x55, 1, EXIT_40E520_CALLBACK_GLOBAL);
  {
    const w = readPlan(P30);
    assert.equal(w.mapStoreNeeded, true);
    assert.equal(w.namePtr, EXIT_40E520_DEFAULT_NAME_ADDR);
    assert.equal(w.callbackNeeded, true);
    assert.equal(w.callbackArgPtr, 0x900);
    assert.deepEqual(
      w,
      exit40e520Plan(0x900, 0x77, 0, 0, 0x55, 1, EXIT_40E520_CALLBACK_GLOBAL),
    );
  }
  // PE TRUTH on the recapture: with the entry value non-zero but the
  // RECAPTURED control word zero, no release may fire. A translation that
  // folded the entry snapshot would emit one here.
  exp.plan40e520(P30, 0x900, 0x77, 0, 0, 0, 1, EXIT_40E520_CALLBACK_GLOBAL);
  assert.equal(readPlan(P30).callbackNeeded, false);

  let seed = 0x40e52001;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  // Bias to the real boundaries of this arithmetic rather than uniform noise.
  const EDGE = [0, 1, 4, 0xff, 0x100, 0x101, 0xffffff00, 0xffffffff];
  const pick = () => {
    const r = rnd();
    return (r & 1) === 0 ? EDGE[(r >>> 8) % EDGE.length] : r;
  };
  for (let iter = 0; iter < 320; iter++) {
    const pairBase = (MEM + 0x10200 + ((rnd() >>> 20) & 0xff) * 8) >>> 0;
    const pairValue = pick();
    const f44 = pick();
    const f40 = pick();
    const ctrl = pick();
    const vAl = pick();
    const cb = (rnd() & 1) === 0 ? 0 : EXIT_40E520_CALLBACK_GLOBAL;
    exp.plan40e520(P30, pairBase, pairValue, f44, f40, ctrl, vAl, cb);
    const w = readPlan(P30);
    const j = exit40e520Plan(pairBase, pairValue, f44, f40, ctrl, vAl, cb);
    assert.deepEqual(w, j, `40e520 plan iter ${iter}`);
    // Cross-helper: the plan must agree with the individual gates.
    assert.equal(w.mapStoreNeeded, exp.mapStoreNeeded40e520(pairValue) !== 0);
    assert.equal(w.virtualOk, exp.virtualOk40e520(vAl) !== 0);
    assert.equal(
      w.callbackNeeded,
      exp.callbackNeeded40e520(ctrl, vAl, cb) !== 0,
    );
    // PE truth restated per-iteration: the release gate ignores high bits,
    // the store gate does not.
    assert.equal(w.virtualOk, (vAl & 0xff) !== 0);
    assert.equal(w.mapStoreNeeded, (pairValue >>> 0) !== 0);
  }

  // Randomized STRING-HASH differential — pinned BY REFERENCE to the OWNER
  // family (render-shell renderShellA159d0Hash, ABI v7). The bytes, folding
  // boundaries and NOT-letters are the same pool the v30 block always used.
  // Whole-string law vs its own atomics (norm_char + hash_step) must agree.
  for (let iter = 0; iter < 240; iter++) {
    const len = (rnd() >>> 24) % 24;
    let s = "";
    for (let i = 0; i < len; i++) {
      const r = rnd();
      const pool = [
        0x41 + ((r >>> 8) % 26), // A-Z
        0x61 + ((r >>> 8) % 26), // a-z
        0x5c, // backslash
        0x2f, // slash
        0x40, 0x5b, 0x60, 0x7b, // the |0x20 traps
        1 + ((r >>> 16) % 0xfe), // any non-NUL byte
      ];
      s += String.fromCharCode(pool[(r >>> 3) % pool.length]);
    }
    let h = EXIT_A159D0_HASH_INIT >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = renderShellA159d0HashStep(h, s.charCodeAt(i) & 0xff);
    }
    assert.equal(
      renderShellA159d0Hash(s),
      h >>> 0,
      `hash owner-pin iter ${iter}`,
    );
  }
});

test("Wasm/JS: 0x007384d0 realloc pack and 0x00408310 string setter (ABI v32)", () => {
  const exp = loadExports();
  const v = new DataView(exp.memory.buffer);

  // ---- 0x007384d0 gates ------------------------------------------------
  // Entry gate is a FULL-dword test.
  assert.equal(exp.oldObjectPresent7384d0(0) !== 0, false);
  assert.equal(exp.oldObjectPresent7384d0(1) !== 0, true);
  assert.equal(exp.oldObjectPresent7384d0(0x100) !== 0, true);
  assert.equal(exp.oldObjectPresent7384d0(0xffffffff) !== 0, true);
  assert.equal(exp.allocSize7384d0() >>> 0, 0x7898);
  // Post-alloc gate is also a FULL-dword test.
  assert.equal(exp.allocOk7384d0(0) !== 0, false);
  assert.equal(exp.allocOk7384d0(1) !== 0, true);
  assert.equal(exp.allocOk7384d0(0x100) !== 0, true);
  // The ctor RETURN value is what lands in [this+0x18300]; a failed alloc
  // folds to 0 even though a (bogus) ctor return was supplied.
  assert.equal(exp.newObjectValue7384d0(0, 0x7777) >>> 0, 0);
  assert.equal(exp.newObjectValue7384d0(0x1000, 0x7777) >>> 0, 0x7777);
  assert.equal(exp.newObjectValue7384d0(0x1000, 0) >>> 0, 0);
  assert.equal(exp.newObjectValue7384d0(0xffffffff, 0xffffffff) >>> 0, 0xffffffff);

  // ---- 0x007384d0 apply: fixed edges -----------------------------------
  const THIS73 = MEM + 0x18000;
  const seed73 = (base) => {
    for (let i = 0; i < 0x19000; i++) writeU8(v, base + i, 0x5a);
  };
  const readDword73 = (off) => readU32(v, THIS73 + off);

  // PE TRUTH: [this+8] survives untouched; everything else in the packs and
  // the memset span is zeroed; the memset is really 0x30 bytes.
  seed73(THIS73);
  writeU32(v, THIS73 + 8, 0xfeedbeef);
  writeU32(v, THIS73 + EXIT_7384D0_MEMSET_BASE_OFF, 0x12345678);
  writeU32(v, THIS73 + 0x18370, 0x9abcdef0); // past memset AND pack2 dwords
  exp.apply7384d0(THIS73, 0x7777);
  assert.equal(readDword73(EXIT_7384D0_OBJ_OFF), 0x7777);
  assert.equal(readDword73(EXIT_7384D0_182D0_OFF), 0xffffffff);
  assert.equal(readDword73(EXIT_7384D0_182CC_OFF), 0);
  assert.equal(readDword73(0), 0);
  assert.equal(readDword73(4), 0);
  assert.equal(readDword73(8), 0xfeedbeef); // the quirk: +8 is NOT cleared
  assert.equal(readDword73(0xc), 0);
  assert.equal(readDword73(EXIT_7384D0_18334_OFF), 0);
  for (let i = 0; i < EXIT_7384D0_MEMSET_SIZE; i++) {
    assert.equal(readU8(v, THIS73 + EXIT_7384D0_MEMSET_BASE_OFF + i), 0);
  }
  assert.equal(
    readU32(v, THIS73 + 0x18370),
    0x9abcdef0, // untouched: the fill is exactly 0x30 bytes, pack2 ends at +0x1836c
  );
  assert.equal(readDword73(EXIT_7384D0_18368_OFF), 0);
  assert.equal(readDword73(EXIT_7384D0_1836C_OFF), 0);
  assert.equal(readU8(v, THIS73 + EXIT_7384D0_188F8_OFF), 0);

  // Randomized differential: apply with an oracle copy of the same region.
  {
    const oracle = new DataView(new ArrayBuffer(0x19000));
    const oracleCopy = () => {
      for (let i = 0; i < 0x19000; i++) {
        writeU8(oracle, i, readU8(v, THIS73 + i));
      }
    };
    let seed = 0x7384d001;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      let x = seed;
      x ^= x >>> 16;
      x = Math.imul(x, 0x7feb352d) >>> 0;
      x ^= x >>> 15;
      x = Math.imul(x, 0x846ca68b) >>> 0;
      x ^= x >>> 16;
      return x >>> 0;
    };
    const EDGE = [0, 1, 0xf, 0x10, 0xff, 0x100, 0x7898, 0xffffffff];
    const pick = () => {
      const r = rnd();
      return (r & 1) === 0 ? EDGE[(r >>> 8) % EDGE.length] : r;
    };
    for (let iter = 0; iter < 240; iter++) {
      seed73(THIS73);
      writeU32(v, THIS73 + 8, pick()); // +8 must survive every iteration
      const newObj = pick();
      exp.apply7384d0(THIS73, newObj);
      oracleCopy();
      exit7384d0Apply(oracle, 0, newObj);
      for (let i = 0; i < 0x19000; i++) {
        assert.equal(
          readU8(v, THIS73 + i),
          readU8(oracle, i),
          `7384d0 apply iter ${iter} byte ${i}`,
        );
      }
    }
  }

  // ---- 0x00408310 string setter gates -----------------------------------
  // flag: arg0 != 0 -> 1 (ctor temp), else 2 (empty SSO)
  assert.equal(exp.flag408310(0) !== 0, true);
  assert.equal(exp.flag408310(0) | 0, 2);
  assert.equal(exp.flag408310(1) | 0, 1);
  assert.equal(exp.flag408310(0x100) | 0, 1); // full word
  // self-assign guard: full dword
  assert.equal(exp.assignNeeded408310(0x1000, 0x1000) !== 0, false);
  assert.equal(exp.assignNeeded408310(0x1000, 0x1001) !== 0, true);
  assert.equal(exp.assignNeeded408310(0x1000, 0x11000) !== 0, true);
  // src decode: UNSIGNED cap < 0x10 -> SSO base, else recaptured dword0
  assert.equal(exp.srcDataAddr408310(0x2000, 0xf, 0xdead) >>> 0, 0x2000);
  assert.equal(exp.srcDataAddr408310(0x2000, 0x10, 0xdead) >>> 0, 0xdead);
  assert.equal(exp.srcDataAddr408310(0x2000, 0xffffffff, 0xdead) >>> 0, 0xdead);
  // free arms: LOW-BYTE flag gates (wide values must not leak through),
  // cap compare is UNSIGNED >= 0x10
  assert.equal(exp.armFreeNeeded408310(2, 2, 0x10) !== 0, true);
  assert.equal(exp.armFreeNeeded408310(2, 2, 0xf) !== 0, false);
  assert.equal(exp.armFreeNeeded408310(2, 1, 0x10) !== 0, false); // wrong arm
  assert.equal(exp.armFreeNeeded408310(1, 1, 0x10) !== 0, true);
  assert.equal(exp.armFreeNeeded408310(1, 2, 0x10) !== 0, false);
  assert.equal(exp.armFreeNeeded408310(0x102, 2, 0x10) !== 0, true); // bl=2
  assert.equal(exp.armFreeNeeded408310(0x101, 1, 0x10) !== 0, true); // bl=1
  assert.equal(exp.armFreeNeeded408310(0x101, 2, 0x10) !== 0, false);
  assert.equal(exp.armFreeNeeded408310(0xffffffff, 2, 0x10) !== 0, true);
  // free ptr/count/abort geometry
  assert.equal(exp.freePtr408310(0x3000, 0, 0x2ffc) >>> 0, 0x3000);
  assert.equal(exp.freePtr408310(0x3000, 1, 0x2ffc) >>> 0, 0x2ffc);
  assert.equal(exp.freeCount408310(0xf, 0) >>> 0, 0x10);
  assert.equal(exp.freeCount408310(0xfff, 0) >>> 0, 0x1000);
  assert.equal(exp.freeCount408310(0xfff, 1) >>> 0, 0x1023); // +0x23 wrap
  assert.equal(exp.freeCount408310(0xffffffff, 1) >>> 0, 0x23); // 0x100000000->0, +0x23
  assert.equal(exp.abortNeeded408310(0, 0) !== 0, false);
  assert.equal(exp.abortNeeded408310(1, 1) !== 0, false);
  assert.equal(exp.abortNeeded408310(1, 0) !== 0, true);
  // field_7c cmove: (g & 4) == 0 ? 6 : 1
  assert.equal(exp.field7c408310(0) | 0, 6);
  assert.equal(exp.field7c408310(1) | 0, 6);
  assert.equal(exp.field7c408310(4) | 0, 1);
  assert.equal(exp.field7c408310(0x80000004) | 0, 1);
  assert.equal(exp.field7c408310(0xffffffff) | 0, 1);
  assert.equal(exp.gateC798e4Addr408310() >>> 0, 0x00c798e4);

  // ---- 0x00408310 empty temp + reset -------------------------------------
  const TMP = MEM + 0x19000;
  writeU32(v, TMP + 0, 0xaaaaaaaa);
  writeU32(v, TMP + EXIT_408310_STR_SIZE_OFF, 0xbbbbbbbb);
  writeU32(v, TMP + EXIT_408310_STR_CAP_OFF, 0xcccccccc);
  exp.emptyTemp408310(TMP);
  assert.equal(readU32(v, TMP + 0), 0);
  assert.equal(readU32(v, TMP + EXIT_408310_STR_SIZE_OFF), 0);
  assert.equal(readU32(v, TMP + EXIT_408310_STR_CAP_OFF), 0xf);
  writeU32(v, TMP + EXIT_408310_STR_SIZE_OFF, 0x99);
  writeU32(v, TMP + EXIT_408310_STR_CAP_OFF, 0x1234);
  writeU8(v, TMP, 0x55);
  exp.tempReset408310(TMP);
  assert.equal(readU32(v, TMP + EXIT_408310_STR_SIZE_OFF), 0);
  assert.equal(readU32(v, TMP + EXIT_408310_STR_CAP_OFF), 0xf);
  assert.equal(readU8(v, TMP), 0);
  exp.setArg0408310(TMP, 0x1234);
  assert.equal(readU32(v, TMP), 0x1234);

  // ---- 0x00408310 tail apply --------------------------------------------
  const THIS83 = MEM + 0x1a000;
  for (let i = 0; i < 0x200; i++) writeU8(v, THIS83 + i, 0x6b);
  const g640 = 0x3f000000;
  const g644 = 0xbf000000;
  exp.tailApply408310(THIS83, g640, g644, 0); // g_c798e4 = 0 -> field_7c = 6
  const F = {
    F30: EXIT_408310_F30_OFF,
    F34: EXIT_408310_F34_OFF,
    F38: EXIT_408310_F38_OFF,
    F3C: EXIT_408310_F3C_OFF,
    F40: EXIT_408310_F40_OFF,
    F44: EXIT_408310_F44_OFF,
    F48: EXIT_408310_F48_OFF,
    F4C: EXIT_408310_F4C_OFF,
    F50: EXIT_408310_F50_OFF,
    F54: EXIT_408310_F54_OFF,
    F58: EXIT_408310_F58_OFF,
    F5C: EXIT_408310_F5C_OFF,
    F60: EXIT_408310_F60_OFF,
    F64: EXIT_408310_F64_OFF,
    F68: EXIT_408310_F68_OFF,
    F6C: EXIT_408310_F6C_OFF,
    F70: EXIT_408310_F70_OFF,
    F74: EXIT_408310_F74_OFF,
    F78: EXIT_408310_F78_OFF,
    F7C: EXIT_408310_F7C_OFF,
    F80: EXIT_408310_F80_OFF,
    F84: EXIT_408310_F84_OFF,
    F88: EXIT_408310_F88_OFF,
    F8C: EXIT_408310_F8C_OFF,
    F90: EXIT_408310_F90_OFF,
    F94: EXIT_408310_F94_OFF,
  };
  const expectedTail = [
    [F.F30, 0],
    [F.F34, EXIT_408310_F32_ONE_BITS],
    [F.F38, EXIT_408310_F32_ONE_BITS],
    [F.F3C, 0],
    [F.F40, g640],
    [F.F44, g644],
    [F.F48, EXIT_408310_F32_ONE_BITS],
    [F.F4C, EXIT_408310_F32_ONE_BITS],
    [F.F50, EXIT_408310_F32_ONE_BITS],
    [F.F54, EXIT_408310_F32_ONE_BITS],
    [F.F58, 0],
    [F.F5C, 0],
    [F.F60, 0],
    [F.F64, 0],
    [F.F68, 0],
    [F.F6C, 0],
    [F.F70, 0],
    [F.F78, 0],
    [F.F80, 7],
    [F.F84, 1],
    [F.F7C, 6], // g & 4 == 0
    [F.F88, 7],
    [0x20, 0],
    [0x24, 0],
    [0x28, 0],
    [0x2c, 0],
    [F.F8C, 0],
    [F.F90, g640],
    [F.F94, g644],
  ];
  for (const [off, val] of expectedTail) {
    assert.equal(readU32(v, THIS83 + off), val >>> 0, `tail off ${off}`);
  }
  assert.equal(readU8(v, THIS83 + F.F74), 1);
  assert.equal(readU32(v, THIS83 + 0x30), 0); // spot: dword at +0x30
  // The tail never touches [this+0x98] (host 0x40c7f0's object) — untouched
  // sentinel stays.
  assert.equal(readU8(v, THIS83 + EXIT_408310_HOST_98_OFF), 0x6b);
  // g_c798e4 bit set -> field_7c = 1, byte store still 1
  exp.tailApply408310(THIS83, g640, g644, 4);
  assert.equal(readU32(v, THIS83 + F.F7C), 1);
  assert.equal(readU8(v, THIS83 + F.F74), 1);

  // ---- 0x00408310 plan: fixed + randomized differential ------------------
  const P83 = MEM + 0x1b000;
  const readPlan = (base) => ({
    arg0: readU32(v, base + 0) >>> 0,
    dstAddr: readU32(v, base + 4) >>> 0,
    tempBase: readU32(v, base + 8) >>> 0,
    flag: readI32(v, base + 12),
    tempPtr: readU32(v, base + 16) >>> 0,
    tempSize: readU32(v, base + 20) >>> 0,
    tempCap: readU32(v, base + 24) >>> 0,
    assignNeeded: readI32(v, base + 28) !== 0,
    assignSrcData: readU32(v, base + 32) >>> 0,
    assignCount: readU32(v, base + 36) >>> 0,
    arm1FreeNeeded: readI32(v, base + 40) !== 0,
    arm1FreePtr: readU32(v, base + 44) >>> 0,
    arm1FreeCount: readU32(v, base + 48) >>> 0,
    arm1AbortNeeded: readI32(v, base + 52) !== 0,
    arm2FreeNeeded: readI32(v, base + 56) !== 0,
    arm2FreePtr: readU32(v, base + 60) >>> 0,
    arm2FreeCount: readU32(v, base + 64) >>> 0,
    arm2AbortNeeded: readI32(v, base + 68) !== 0,
    host98Addr: readU32(v, base + 72) >>> 0,
    invalidParamIat: readU32(v, base + 76) >>> 0,
  });

  // Empty path (arg0 == 0): the temp is the pure empty SSO at TMP; the
  // assign is skipped when dst == src base.
  exp.plan408310(P83, 0, TMP + EXIT_408310_STR_OFF, TMP, TMP, 0, 0xf, 0);
  {
    const w = readPlan(P83);
    assert.equal(w.flag, 2);
    assert.equal(w.assignNeeded, true); // dst (this+8) != temp base -> assign
    assert.equal(w.arm1FreeNeeded, false); // cap 0xf < 0x10
    assert.equal(w.arm2FreeNeeded, false); // wrong arm anyway
    assert.equal(w.host98Addr, TMP + EXIT_408310_STR_OFF + (0x98 - 8));
    assert.equal(w.invalidParamIat, EXIT_408310_INVALID_PARAM_IAT);
    assert.deepEqual(
      w,
      exit408310Plan(0, TMP + EXIT_408310_STR_OFF, TMP, TMP, 0, 0xf, 0),
    );
  }
  // Self-assign: dst == temp base -> assign skipped entirely.
  exp.plan408310(P83, 0, TMP, TMP, TMP, 0x11, 0xf, 0);
  {
    const w = readPlan(P83);
    assert.equal(w.assignNeeded, false); // cmp edx,eax; je @ 0x00408398
    assert.deepEqual(w, exit408310Plan(0, TMP, TMP, TMP, 0x11, 0xf, 0));
  }
  // Empty path with an absurd grown temp (recaptured): arm1 open, big free.
  exp.plan408310(P83, 0, TMP + EXIT_408310_STR_OFF, TMP, 0x8000, 0x55, 0x1000, 0x7ffc);
  {
    const w = readPlan(P83);
    assert.equal(w.assignNeeded, true); // dst (this+8) != temp base
    assert.equal(w.assignSrcData, 0x8000); // cap 0x1000 >= 0x10 -> heap ptr
    assert.equal(w.assignCount, 0x55);
    assert.equal(w.arm1FreeNeeded, true);
    assert.equal(w.arm1FreePtr, 0x7ffc); // header path
    assert.equal(w.arm1FreeCount, 0x1024); // 0x1000+1+0x23 = 0x1024
    assert.equal(w.arm1AbortNeeded, false); // 0x8000-0x7ffc-4 = 0 <= 0x1f
    assert.equal(w.arm2FreeNeeded, false);
    assert.deepEqual(
      w,
      exit408310Plan(0, TMP + EXIT_408310_STR_OFF, TMP, 0x8000, 0x55, 0x1000, 0x7ffc),
    );
  }
  // Ctor path (arg0 != 0): arm2 is the one that opens; abort fires on a bad
  // header offset (e.g. header not 4 bytes below ptr).
  exp.plan408310(P83, 0x1, 0x9008, 0x9000, 0x7000, 0x20, 0x2000, 0x6000);
  {
    const w = readPlan(P83);
    assert.equal(w.flag, 1);
    assert.equal(w.assignNeeded, true); // 0x9008 != 0x9000
    assert.equal(w.assignSrcData, 0x7000);
    assert.equal(w.arm2FreeNeeded, true);
    assert.equal(w.arm2AbortNeeded, true); // 0x7000-0x6000-4 = 0xffc > 0x1f
    assert.deepEqual(
      w,
      exit408310Plan(0x1, 0x9008, 0x9000, 0x7000, 0x20, 0x2000, 0x6000),
    );
  }

  // Randomized plan differential. Bias to the real boundaries: the SSO cap
  // 0x10/0xf, the 0x1000 header threshold, the 0x1f offset max, and arm
  // masks 1/2.
  {
    let seed = 0x40831001;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      let x = seed;
      x ^= x >>> 16;
      x = Math.imul(x, 0x7feb352d) >>> 0;
      x ^= x >>> 15;
      x = Math.imul(x, 0x846ca68b) >>> 0;
      x ^= x >>> 16;
      return x >>> 0;
    };
    const EDGE = [0, 0xf, 0x10, 0xff, 0x1000, 0x1001, 0xffffffff];
    const pick = () => {
      const r = rnd();
      return (r & 1) === 0 ? EDGE[(r >>> 8) % EDGE.length] : r;
    };
    for (let iter = 0; iter < 400; iter++) {
      const arg0 = pick();
      const dst = (MEM + 0x1c000 + ((rnd() >>> 20) & 0x1f) * 0x10) >>> 0;
      const tmp = pick();
      const tPtr = pick();
      const tSize = pick();
      const tCap = pick();
      const hdr = pick();
      exp.plan408310(P83, arg0, dst, tmp, tPtr, tSize, tCap, hdr);
      const w = readPlan(P83);
      const j = exit408310Plan(arg0, dst, tmp, tPtr, tSize, tCap, hdr);
      assert.deepEqual(w, j, `408310 plan iter ${iter}`);
      // Cross-helper agreement with the individual gates.
      assert.equal(w.flag, exit408310Flag(arg0));
      assert.equal(w.assignNeeded, exp.assignNeeded408310(dst, tmp) !== 0);
      assert.equal(
        w.assignSrcData,
        exp.srcDataAddr408310(tmp, tCap, tPtr) >>> 0,
      );
      assert.equal(
        w.arm1FreeNeeded,
        exp.armFreeNeeded408310(w.flag, 2, tCap) !== 0,
      );
      assert.equal(
        w.arm2FreeNeeded,
        exp.armFreeNeeded408310(w.flag, 1, tCap) !== 0,
      );
      // PE truth restated per-iteration: the arm gates are low-byte tests,
      // the cap compare is unsigned.
      assert.equal(w.arm1FreeNeeded, ((w.flag & 2) !== 0 && (tCap >>> 0) >= 0x10));
      assert.equal(w.arm2FreeNeeded, ((w.flag & 1) !== 0 && (tCap >>> 0) >= 0x10));
      // The plan's free geometry must agree with the v19 0x40ccd0 idiom
      // (cross-helper differential for the shared instruction range).
      if (w.arm1FreeNeeded) {
        const freeSize = exp.freeSize40ccd0(tCap) >>> 0;
        const usesHeader = exp.freeUsesHeapHeader40ccd0(freeSize) !== 0;
        const count = (usesHeader
          ? exp.freeHeaderSize40ccd0(freeSize)
          : freeSize) >>> 0;
        assert.equal(w.arm1FreeCount, exp.freeCount408310(tCap, usesHeader ? 1 : 0) >>> 0);
        assert.equal(w.arm1FreeCount, count);
      }
    }
  }
});

/* v109 dedupe (pair 1): 0x408c90 is OWNED by Exit (isaac_exit_animstate_
   408c90_*, ABI v18; the 0x40c7f0 twin precedent keeps Exit as the law
   holder and frame-opaque as host-VA pin). A mutant of the OWNER law must
   be caught by the owner suite; the frame-opaque suite pins the same
   semantics BY REFERENCE. 3-mutant cycle with sha256 restore. */
test("animstate 408c90 mutation round-trips (v109 dedupe gate)", () => {
  const src = readFileSync(source, "utf8");
  const digest = (text) =>
    createHash("sha256").update(text, "utf8").digest("hex");
  const before = digest(src);
  const writeSource = (text) => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        writeFileSync(source, text);
        return;
      } catch (e) {
        if (attempt >= 119) throw e;
        const pause = Math.min(25 * (attempt + 1), 500);
        const end = Date.now() + pause;
        while (Date.now() < end) { /* busy-wait backoff */ }
      }
    }
  };
  const assertMutant = (name, fn) => {
    try {
      fn();
    } finally {
      writeSource(src);
    }
  };
  {
    /* Mutant 1 (anim present): test edi,edi inverted. */
    const mut = src.replace(
      "return (anim_ptr != 0u) ? 1 : 0;\n}\n\nextern \"C\" int32_t isaac_exit_animstate_408c90_log_needed",
      "return (anim_ptr == 0u) ? 1 : 0;\n}\n\nextern \"C\" int32_t isaac_exit_animstate_408c90_log_needed",
    );
    if (mut !== src) {
      writeSource(mut);
      assertMutant("anim_present", () => {
        const mutExp = loadExports();
        assert.equal(
          mutExp.animstate408c90AnimPresent(0x1000) | 0,
          0, /* divergent: PE gives 1 */
          "mutant1 (anim_present) not caught",
        );
      });
    }
  }
  {
    /* Mutant 2 (event loop): jbe skip inverted to jne skip. */
    const mut = src.replace(
      "return (event_count != 0u) ? 1 : 0;",
      "return (event_count == 0u) ? 1 : 0;",
    );
    if (mut !== src) {
      writeSource(mut);
      assertMutant("event_loop_needed", () => {
        const mutExp = loadExports();
        assert.equal(
          mutExp.animstate408c90EventLoopNeeded(3) | 0,
          0, /* divergent: PE gives 1 */
          "mutant2 (event_loop_needed) not caught",
        );
      });
    }
  }
  {
    /* Mutant 3 (mask_bts): bts r32, r32 wraps mod 32; drop the wrap. */
    const mut = src.replace(
      "1u << (bit_index & 31u)",
      "1u << bit_index",
    );
    if (mut !== src) {
      writeSource(mut);
      assertMutant("mask_bts wrap", () => {
        const mutExp = loadExports();
        assert.equal(
          mutExp.animstate408c90MaskBts(0, 32) >>> 0,
          1, /* divergent: PE wraps to bit 0 */
          "mutant3 (mask_bts mod 32) not caught",
        );
      });
    }
  }
  const after = readFileSync(source, "utf8");
  assert.equal(
    digest(after),
    before,
    "source not restored byte-identical after animstate 408c90 mutants",
  );
  assert.equal(after, src, "source content differs after animstate 408c90 mutants");
  const exp2 = loadExports();
  assert.equal(exp2.animstate408c90AnimPresent(0x1000) | 0, 1);
  assert.equal(exp2.animstate408c90EventLoopNeeded(3) | 0, 1);
  assert.equal(exp2.animstate408c90MaskBts(0, 32) >>> 0, 1);
});

test("Wasm vs JS differential: randomized pure teardown and predicates", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  let seed = 0xc0ffee02;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    // A bare LCG state has period 2^(k+1) in bit k, so `rnd() & 7` cycles
    // with period 8 and `rnd() % n` draws from those same correlated low
    // bits â€” every `& mask` / `% n` selection below would sample a fixed
    // rotation instead of the intended spread. Run the state through a
    // lowbias32 finalizer so the low bits are as good as the high ones.
    // Deterministic: same seed, same sequence, just properly mixed.
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };

  for (let i = 0; i < 500; i++) {
    const session = rnd() & 0xff;
    assert.equal(exp.session(session) !== 0, exitSessionActive(session));

    const overlay = (rnd() % 5) | 0;
    assert.equal(exp.overlay(overlay) !== 0, exitItemOverlayForceNeeded(overlay));

    const cm = rnd() & 0xff;
    const loaded = rnd() & 1;
    const cmPtr = MEM + 16;
    writeU8(view, cmPtr, cm);
    const flush = exp.pgdPrep(cmPtr, loaded);
    const oracle = exitPgdFlushPrepare(cm, loaded);
    assert.equal(flush !== 0, oracle.flush);
    assert.equal(readU8(view, cmPtr), oracle.changesmade);
    assert.equal(exp.pgdNeeded(cm, loaded) !== 0, exitPgdFlushNeeded(cm, loaded));

    // Full-word steam context draws — never pre-masked, so the differential
    // sees 0x100/0xffffffff with cloud on and pins the PE full-dword gate.
    const steamWord = rnd();
    const cloud = rnd() & 1;
    assert.equal(
      exp.pgdCloud(steamWord, cloud) !== 0,
      exitPgdSaveUsesCloud(steamWord, cloud),
      `pgdCloud steam=0x${steamWord.toString(16)} cloud=${cloud}`,
    );

    const skip = rnd() & 0xff;
    const shouldSave = rnd() & 0x1ff;
    assert.equal(exp.gsIo(skip) !== 0, exitGamestateIoNeeded(skip));
    assert.equal(exp.gsWrite(shouldSave) !== 0, exitGamestateShouldWrite(shouldSave));

    const a = Math.fround((rnd() % 1000) / 100);
    const b = Math.fround((rnd() % 1000) / 100);
    const fPtr = MEM + 32;
    writeF32(view, fPtr, a);
    writeF32(view, fPtr + 4, b);
    exp.floats(fPtr, fPtr + 4);
    const fo = exitManagerFloatsReset(a, b);
    assert.equal(readF32(view, fPtr), fo.f2a2d0);
    assert.equal(readF32(view, fPtr + 4), fo.f2a2d4);

    const st = MEM + 64;
    const prior = {
      field2510c: (rnd() | 0),
      field2593c: (rnd() | 0),
      field25948: (rnd() | 0),
      field2590c: (rnd() | 0),
      gate1d520: (rnd() | 0),
      gate1d654: (rnd() | 0),
      skipTimedTransition25954: rnd() & 0xff,
    };
    writeI32(view, st + TEARDOWN.field2510c, prior.field2510c);
    writeI32(view, st + TEARDOWN.field2593c, prior.field2593c);
    writeI32(view, st + TEARDOWN.field25948, prior.field25948);
    writeI32(view, st + TEARDOWN.field2590c, prior.field2590c);
    writeI32(view, st + TEARDOWN.gate1d520, prior.gate1d520);
    writeI32(view, st + TEARDOWN.gate1d654, prior.gate1d654);
    writeU8(view, st + TEARDOWN.skipTimed, prior.skipTimedTransition25954);
    exp.teardown(st);
    const to = exitPureFieldTeardown(prior);
    assert.equal(readI32(view, st + TEARDOWN.field2510c), to.field2510c);
    assert.equal(readI32(view, st + TEARDOWN.gate1d520), to.gate1d520);
    assert.equal(readU8(view, st + TEARDOWN.skipTimed), to.skipTimedTransition25954);

    const begin = rnd() >>> 0;
    const nElem = rnd() % 8;
    const end = (begin + nElem * EXIT_VECTOR_25EBC_STRIDE) >>> 0;
    assert.equal(exp.vectorNeeded(begin, end) !== 0, exitVector25ebcDtorNeeded(begin, end));
    assert.equal(exp.vectorCount(begin, end), exitVector25ebcElementCount(begin, end));
    const endPtr = MEM + 128;
    writeU32(view, endPtr, rnd() >>> 0);
    exp.vectorClear(endPtr, begin);
    assert.equal(readU32(view, endPtr), exitVector25ebcClearEnd(0, begin));

    const sfxIdx = rnd() % 8;
    assert.equal(exp.sfxId(sfxIdx), exitSfxStopIdAt(sfxIdx));

    // post-log
    const pl = MEM + 256;
    writeI32(view, pl + POSTLOG.field1bb70, rnd() | 0);
    writeI32(view, pl + POSTLOG.gate1b83c, rnd() | 0);
    writeI32(view, pl + POSTLOG.field1ba80, rnd() | 0);
    exp.postlog(pl, EXIT_POSTLOG_F32_1BA90_BITS, EXIT_POSTLOG_F32_1BA94_BITS);
    const plo = exitPostlogPureFields({}, EXIT_POSTLOG_F32_1BA90_BITS,
      EXIT_POSTLOG_F32_1BA94_BITS);
    assert.equal(readI32(view, pl + POSTLOG.field1bb70), plo.field1bb70);
    assert.equal(readI32(view, pl + POSTLOG.field1ba80), plo.field1ba80);
    assert.equal(readF32(view, pl + POSTLOG.field1ba90), plo.field1ba90);

    // 6f4520 copy path
    const s = MEM + 512;
    for (let j = 0; j < L4520.size; j++) writeU8(view, s + j, rnd() & 0xff);
    const src = rnd() | 0;
    writeI32(view, s + L4520.field269d4, src);
    exp.apply6f4520(s);
    const ao = exit6f4520Apply({ field269d4: src });
    assert.equal(readI32(view, s + L4520.field269d8), ao.field269d8);
    assert.equal(readI32(view, s + L4520.field269c4), ao.field269c4);
    assert.equal(readI32(view, s + L4520.field676ac), ao.field676ac);
    assert.equal(readF32(view, s + L4520.field26530), ao.field26530);

    // tail copy
    const tl = MEM + 1000;
    for (let j = 0; j < TAIL.size; j++) writeU8(view, tl + j, rnd() & 0xff);
    const c = rnd() | 0;
    writeI32(view, tl + TAIL.field6774c, c);
    exp.tail6f43b0(tl);
    const to2 = exit6f43b0Tail({ field6774c: c });
    assert.equal(readI32(view, tl + TAIL.field67750), to2.field67750);
    assert.equal(readF32(view, tl + TAIL.field67740), to2.field67740);

    // residual v3 peels
    const modeA = rnd() | 0;
    const modeB = rnd() | 0;
    writeI32(view, MEM + 1100, modeA);
    writeI32(view, MEM + 1104, modeB);
    exp.modePair(MEM + 1100, MEM + 1104);
    const mo = exitFrameModePairClear(modeA, modeB);
    assert.equal(readI32(view, MEM + 1100), mo.mode1d2ec);
    assert.equal(readI32(view, MEM + 1104), mo.secondary1d2f0);

    const fv = Math.fround((rnd() % 200) / 50);
    assert.equal(exp.volNeeded(fv) !== 0, exitVolumeModifierClearNeeded(fv));

    const flag = rnd() & 0xff;
    const cnt = rnd() % 5;
    assert.equal(exp.slotNeeded(flag, cnt) !== 0, exitResidualSlotCopyNeeded(flag, cnt));

    const ent = MEM + 0x2000;
    const srcVal = rnd() >>> 0;
    writeU32(view, ent + EXIT_RESIDUAL_ENTITY_SRC_OFF, srcVal);
    writeU32(view, ent + EXIT_RESIDUAL_ENTITY_DST_OFF, rnd() >>> 0);
    exp.entityCopy(ent);
    const mirror = new DataView(new ArrayBuffer(EXIT_RESIDUAL_ENTITY_DST_OFF + 4));
    // JS oracle on a temp view
    const tmp = MEM + 0x3000;
    writeU32(view, tmp + EXIT_RESIDUAL_ENTITY_SRC_OFF, srcVal);
    writeU32(view, tmp + EXIT_RESIDUAL_ENTITY_DST_OFF, 0);
    exitResidualEntityCopy30To34(view, tmp);
    assert.equal(
      readU32(view, ent + EXIT_RESIDUAL_ENTITY_DST_OFF),
      readU32(view, tmp + EXIT_RESIDUAL_ENTITY_DST_OFF),
    );

    writeU8(view, MEM + 1120, rnd() & 0xff);
    exp.flag28(MEM + 1120);
    assert.equal(readU8(view, MEM + 1120), exitMapValueFlag28Clear(1).flag28);

    // ABI v4 9b5cb0 prefix
    const p9 = MEM + 0x1200;
    const prior9 = {
      menuState0: rnd() | 0,
      field8: rnd() | 0,
      field24: rnd() | 0,
      field28: rnd() | 0,
      field1454: rnd() & 0xff,
    };
    writeI32(view, p9 + PREFIX9B.menuState0, prior9.menuState0);
    writeI32(view, p9 + PREFIX9B.field8, prior9.field8);
    writeI32(view, p9 + PREFIX9B.field24, prior9.field24);
    writeI32(view, p9 + PREFIX9B.field28, prior9.field28);
    writeU8(view, p9 + PREFIX9B.field1454, prior9.field1454);
    exp.prefix9b5cb0(p9);
    const o9 = exit9b5cb0Prefix(prior9);
    assert.equal(readI32(view, p9 + PREFIX9B.menuState0), o9.menuState0);
    assert.equal(readI32(view, p9 + PREFIX9B.field8), o9.field8);
    assert.equal(readI32(view, p9 + PREFIX9B.field24), o9.field24);
    assert.equal(readI32(view, p9 + PREFIX9B.field28), o9.field28);
    assert.equal(readU8(view, p9 + PREFIX9B.field1454), o9.field1454);

    // ABI v5 8d3250 peels
    const p0 = MEM + 0x1300;
    const priorP0 = {
      field10: rnd() & 0xff,
      field14: rnd() | 0,
      field30: rnd() | 0,
      field34: rnd() | 0,
      field38: rnd() | 0,
    };
    writeU8(view, p0 + P0_8D.field10, priorP0.field10);
    writeI32(view, p0 + P0_8D.field14, priorP0.field14);
    writeI32(view, p0 + P0_8D.field30, priorP0.field30);
    writeI32(view, p0 + P0_8D.field34, priorP0.field34);
    writeI32(view, p0 + P0_8D.field38, priorP0.field38);
    exp.p08d3250(p0);
    const oP0 = exit8d3250P0(priorP0);
    assert.equal(readU8(view, p0 + P0_8D.field10), oP0.field10);
    assert.equal(readI32(view, p0 + P0_8D.field14), oP0.field14);
    assert.equal(readI32(view, p0 + P0_8D.field30), oP0.field30);

    const f40d = rnd() & 0xff;
    assert.equal(
      exp.cursorLayerNeeded(f40d) !== 0,
      exit8d3250CursorLayerHostNeeded(f40d),
    );
    const ptr1e8 = rnd() >>> 0;
    assert.equal(
      exp.listHostNeeded(ptr1e8) !== 0,
      exit8d3250ListHostNeeded(ptr1e8),
    );

    const p3 = MEM + 0x1380;
    writeI32(view, p3 + P3_8D.field178, rnd() | 0);
    writeI32(view, p3 + P3_8D.field17c, rnd() | 0);
    writeI32(view, p3 + P3_8D.field180, rnd() | 0);
    writeI32(view, p3 + P3_8D.field648, rnd() | 0);
    writeI32(view, p3 + P3_8D.field64c, rnd() | 0);
    exp.p38d3250(p3);
    const oP3 = exit8d3250P3({});
    assert.equal(readI32(view, p3 + P3_8D.field178), oP3.field178);
    assert.equal(readI32(view, p3 + P3_8D.field17c), oP3.field17c);
    assert.equal(readI32(view, p3 + P3_8D.field648), oP3.field648);

    const p4 = MEM + 0x13c0;
    const src18 = rnd() | 0;
    writeI32(view, p4 + P4_8D.field18, src18);
    writeI32(view, p4 + P4_8D.field1c, rnd() | 0);
    writeI32(view, p4 + P4_8D.field24, rnd() | 0);
    writeI32(view, p4 + P4_8D.field28, rnd() | 0);
    writeI32(view, p4 + P4_8D.field2c, rnd() | 0);
    exp.p48d3250(p4);
    const oP4 = exit8d3250P4({ field18: src18 });
    assert.equal(readI32(view, p4 + P4_8D.field18), oP4.field18);
    assert.equal(readI32(view, p4 + P4_8D.field1c), oP4.field1c);
    assert.equal(readI32(view, p4 + P4_8D.field24), oP4.field24);
    assert.equal(readI32(view, p4 + P4_8D.field2c), oP4.field2c);

    const sent = MEM + 0x1500;
    const countOff = MEM + 0x1520;
    writeU32(view, sent, rnd() >>> 0);
    writeU32(view, sent + 4, rnd() >>> 0);
    writeU32(view, sent + 8, rnd() >>> 0);
    writeU32(view, countOff, rnd() >>> 0);
    exp.listEmpty(sent, sent, countOff);
    const listMirror = new ArrayBuffer(0x40);
    const listMv = new DataView(listMirror);
    // oracle on a parallel layout: sentinel at 0x10, count at 0x30
    const oSent = 0x10;
    const oCount = 0x30;
    exit8d3250ListEmpty(listMv, oSent, oSent, oCount);
    assert.equal(readU32(view, sent), sent);
    assert.equal(readU32(view, sent + 4), sent);
    assert.equal(readU32(view, sent + 8), sent);
    assert.equal(readU32(view, countOff), 0);
    assert.equal(listMv.getUint32(oSent, true), oSent);
    assert.equal(listMv.getUint32(oCount, true), 0);

    // ABI v6 9b9150 peels
    const p0pm = MEM + 0x1600;
    const priorPm = { fieldC8: rnd() | 0, fieldCc: rnd() | 0 };
    writeI32(view, p0pm + P0_9B9150.fieldC8, priorPm.fieldC8);
    writeI32(view, p0pm + P0_9B9150.fieldCc, priorPm.fieldCc);
    exp.p09b9150(p0pm);
    const oPm = exit9b9150P0(priorPm);
    assert.equal(readI32(view, p0pm + P0_9B9150.fieldC8), oPm.fieldC8);
    assert.equal(readI32(view, p0pm + P0_9B9150.fieldCc), oPm.fieldCc);

    const plBegin = rnd() >>> 0;
    const plEndSpan = rnd() & 0x1f;
    const plEnd = (plBegin + plEndSpan) >>> 0;
    assert.equal(
      exp.playerListNeeded(plBegin, plEnd) !== 0,
      exit9b9150PlayerListHostNeeded(plBegin, plEnd),
    );
    writeU32(view, MEM + 0x1620, rnd() >>> 0);
    exp.playerListClearEnd(MEM + 0x1620, plBegin);
    assert.equal(
      readU32(view, MEM + 0x1620),
      exit9b9150PlayerListClearEnd(0, plBegin).end,
    );

    const eBegin = rnd() >>> 0;
    const eEnd = (eBegin + ((rnd() & 7) * 4)) >>> 0;
    assert.equal(exp.extraListCount(eBegin, eEnd) | 0, exit9b9150ExtraListCount(eBegin, eEnd) | 0);
    assert.equal(
      exp.extraListNeeded(eBegin, eEnd) !== 0,
      exit9b9150ExtraListHostNeeded(eBegin, eEnd),
    );
    writeU32(view, MEM + 0x1630, rnd() >>> 0);
    exp.extraListClearEnd(MEM + 0x1630, eBegin);
    assert.equal(readU32(view, MEM + 0x1630), eBegin >>> 0);

    const ptr = rnd() >>> 0;
    assert.equal(exp.ptrHostNeeded(ptr) !== 0, exit9b9150PtrHostNeeded(ptr));
    writeU32(view, MEM + 0x1640, rnd() >>> 0);
    exp.slotClear(MEM + 0x1640);
    assert.equal(readU32(view, MEM + 0x1640), exit9b9150SlotClear(1).slot);

    const esau = MEM + 0x1650;
    const priorEsau = [rnd() >>> 0, rnd() >>> 0, rnd() >>> 0, rnd() >>> 0];
    for (let k = 0; k < 4; k++) writeU32(view, esau + k * 4, priorEsau[k]);
    exp.esauSlotsClear(esau);
    const oEsau = exit9b9150EsauSlotsClear(priorEsau);
    for (let k = 0; k < 4; k++) {
      assert.equal(readU32(view, esau + k * 4), oEsau.slots[k]);
    }

    const mid = MEM + 0x1680;
    const priorMid = { field7c: rnd() | 0, field5c: rnd() & 0xff };
    writeI32(view, mid + MID_9B9150.field7c, priorMid.field7c);
    writeU8(view, mid + MID_9B9150.field5c, priorMid.field5c);
    exp.mid9b9150(mid);
    const oMid = exit9b9150Mid(priorMid);
    assert.equal(readI32(view, mid + MID_9B9150.field7c), oMid.field7c);
    assert.equal(readU8(view, mid + MID_9B9150.field5c), oMid.field5c);

    const tail = MEM + 0x16a0;
    const priorTail = {
      fields: [rnd() | 0, rnd() | 0, rnd() | 0, rnd() | 0],
    };
    for (let k = 0; k < 4; k++) writeI32(view, tail + k * 4, priorTail.fields[k]);
    exp.tail9b9150(tail);
    const oTail = exit9b9150Tail(priorTail);
    for (let k = 0; k < 4; k++) {
      assert.equal(readI32(view, tail + k * 4), oTail.fields[k]);
    }

    // ABI v7 9a27d0 peels
    const flagPrior = rnd() & 0xff;
    writeU8(view, MEM + 0x1700, flagPrior);
    exp.slotFlagClear9a27d0(MEM + 0x1700);
    assert.equal(readU8(view, MEM + 0x1700), exit9a27d0SlotFlagClear(flagPrior).flag);

    const packedPriors = [];
    const packed = MEM + 0x1710;
    for (let k = 0; k < EXIT_9A27D0_SLOT_FLAG_COUNT; k++) {
      packedPriors.push(rnd() & 0xff);
      writeU8(view, packed + k, packedPriors[k]);
    }
    exp.slotFlagsPacked9a27d0(packed);
    const oPacked = exit9a27d0SlotFlagsClearPacked(packedPriors);
    for (let k = 0; k < EXIT_9A27D0_SLOT_FLAG_COUNT; k++) {
      assert.equal(readU8(view, packed + k), oPacked.flags[k]);
    }

    const idx = rnd() % (EXIT_9A27D0_SLOT_FLAG_COUNT + 2);
    assert.equal(exp.slotFlagOff9a27d0(idx) >>> 0, exit9a27d0SlotFlagOff(idx) >>> 0);

    const f54 = rnd() & 0xff;
    writeU8(view, MEM + 0x1720, f54);
    exp.field54cdClear9a27d0(MEM + 0x1720);
    assert.equal(readU8(view, MEM + 0x1720), exit9a27d0Field54cdClear(f54).field54cd);

    // ABI v8 9a19a0 peels
    const priorPfx = {
      field5490: f32Bits(rnd()),
      field5494: rnd() | 0,
      field5498: rnd() | 0,
      field549c: rnd() & 0xff,
      field54d0: rnd() | 0,
      field54d4: rnd() & 0xff,
      field54d8: rnd() | 0,
    };
    const pfx = MEM + 0x1800;
    writeF32(view, pfx + PREFIX_9A19A0.field5490, priorPfx.field5490);
    writeI32(view, pfx + PREFIX_9A19A0.field5494, priorPfx.field5494);
    writeI32(view, pfx + PREFIX_9A19A0.field5498, priorPfx.field5498);
    writeU8(view, pfx + PREFIX_9A19A0.field549c, priorPfx.field549c);
    writeI32(view, pfx + PREFIX_9A19A0.field54d0, priorPfx.field54d0);
    writeU8(view, pfx + PREFIX_9A19A0.field54d4, priorPfx.field54d4);
    writeI32(view, pfx + PREFIX_9A19A0.field54d8, priorPfx.field54d8);
    exp.prefix9a19a0(pfx);
    const oPfx = exit9a19a0Prefix(priorPfx);
    assert.equal(readF32(view, pfx + PREFIX_9A19A0.field5490), oPfx.field5490);
    assert.equal(readI32(view, pfx + PREFIX_9A19A0.field5494), oPfx.field5494);
    assert.equal(readI32(view, pfx + PREFIX_9A19A0.field5498), oPfx.field5498);
    assert.equal(readU8(view, pfx + PREFIX_9A19A0.field549c), oPfx.field549c);
    assert.equal(readI32(view, pfx + PREFIX_9A19A0.field54d0), oPfx.field54d0);
    assert.equal(readU8(view, pfx + PREFIX_9A19A0.field54d4), oPfx.field54d4);
    assert.equal(readI32(view, pfx + PREFIX_9A19A0.field54d8), oPfx.field54d8);

    const thisAddr = rnd() >>> 0;
    const slotIdx = rnd() % (EXIT_9A19A0_PLAYERHUD_LOOP_COUNT + 2);
    assert.equal(
      exp.slotBaseOff9a19a0(slotIdx) >>> 0,
      exit9a19a0SlotBaseOff(slotIdx) >>> 0,
    );
    const sIdx = (rnd() % EXIT_9A19A0_PLAYERHUD_LOOP_COUNT) & 0xffff;
    writeU32(view, MEM + 0x1860, rnd() >>> 0);
    writeU16(view, MEM + 0x1864, rnd() & 0xffff);
    exp.slotSetup9a19a0(MEM + 0x1860, MEM + 0x1864, thisAddr, sIdx);
    const oSlot = exit9a19a0SlotSetup(thisAddr, sIdx);
    assert.equal(readU32(view, MEM + 0x1860), oSlot.field4);
    assert.equal(readU16(view, MEM + 0x1864), oSlot.field8);

    const f54cc = rnd() & 0xff;
    writeU8(view, MEM + 0x1870, f54cc);
    exp.field54ccSet9a19a0(MEM + 0x1870);
    assert.equal(readU8(view, MEM + 0x1870), exit9a19a0Field54ccSet(f54cc).field54cc);

    // ABI v9 40e910 peels
    const sent40 = rnd() >>> 0;
    const first40 = (rnd() & 1) === 0 ? sent40 : (rnd() >>> 0);
    assert.equal(
      exp.listHostNeeded40e910(sent40, first40) !== 0,
      exit40e910ListHostNeeded(sent40, first40),
    );
    const objPtr = rnd() >>> 0;
    assert.equal(
      exp.nodeObjectPresent40e910(objPtr) !== 0,
      exit40e910NodeObjectPresent(objPtr),
    );
    assert.equal(
      exp.postEraseDtorNeeded40e910(objPtr) !== 0,
      exit40e910PostEraseDtorNeeded(objPtr),
    );
    const word4 = rnd() >>> 0;
    assert.equal(
      exp.freeAfterComNeeded40e910(word4) !== 0,
      exit40e910FreeAfterComNeeded(word4),
    );
    const val = rnd() & 0xff;
    const gfn = rnd() >>> 0;
    assert.equal(
      exp.postEraseCallbackNeeded40e910(val, gfn) !== 0,
      exit40e910PostEraseCallbackNeeded(val, gfn),
    );
    assert.equal(exp.freeSize40e910() >>> 0, exit40e910FreeSize());

    // ABI v41: decision laws differential (wasm vs JS oracle)
    const cur40 = rnd() >>> 0;
    const sent40b = rnd() >>> 0;
    assert.equal(
      exp.walkContinue40e910(cur40, sent40b) !== 0,
      exit40e910WalkContinue(cur40, sent40b),
    );
    const objPtr2 = rnd() >>> 0;
    assert.equal(
      exp.comIfaceAddr40e910(objPtr2) >>> 0,
      exit40e910ComIfaceAddr(objPtr2),
    );
    assert.equal(
      exp.comReleaseArg40e910() >>> 0,
      exit40e910ComReleaseArg(),
    );
    const word4b = rnd() >>> 0;
    assert.equal(
      exp.comStateWord40e910(word4b) >>> 0,
      exit40e910ComStateWord(word4b),
    );

    // ABI v41: 0x009a27d0 per-slot triple decision laws differential
    const slotIdx9a = rnd() >>> 0; // FULL u32: exercises OOB ~50% of the time
    const sBase = exp.slotTripleBaseOff9a27d0(slotIdx9a) >>> 0;
    assert.equal(sBase, exit9a27d0SlotTripleBaseOff(slotIdx9a) >>> 0);
    const sReset = exp.slotResetOff9a27d0(slotIdx9a) >>> 0;
    assert.equal(sReset, exit9a27d0SlotResetOff(slotIdx9a) >>> 0);
    const s709 = exp.slot709150Off9a27d0(slotIdx9a) >>> 0;
    assert.equal(s709, exit9a27d0Slot709150Off(slotIdx9a) >>> 0);
    const sArg = exp.slot709150Arg9a27d0(slotIdx9a) >>> 0;
    assert.equal(sArg, exit9a27d0Slot709150Arg(slotIdx9a) >>> 0);
    assert.equal(
      exp.slotLoopSegment9a27d0(slotIdx9a),
      exit9a27d0SlotLoopSegment(slotIdx9a),
    );
    assert.equal(
      exp.slotLoop1Count9a27d0() >>> 0,
      exit9a27d0SlotLoop1Count() >>> 0,
    );
    assert.equal(
      exp.slotLoop2Count9a27d0() >>> 0,
      exit9a27d0SlotLoop2Count() >>> 0,
    );
    assert.equal(
      exp.slotLoop1StartOff9a27d0() >>> 0,
      exit9a27d0SlotLoop1StartOff() >>> 0,
    );
    assert.equal(
      exp.slotLoop2StartOff9a27d0() >>> 0,
      exit9a27d0SlotLoop2StartOff() >>> 0,
    );
    // Plan pack differential: write plan to memory, read back, compare.
    const planBase9a = MEM + 0x5f100;
    exp.slotPlan9a27d0(planBase9a, slotIdx9a);
    const oPlan9a = exit9a27d0SlotPlan(slotIdx9a);
    assert.equal(view.getInt32(planBase9a + 0, true), oPlan9a.valid);
    assert.equal(readU32(view, planBase9a + 4), oPlan9a.baseOff >>> 0);
    assert.equal(readU32(view, planBase9a + 8), oPlan9a.flagOff >>> 0);
    assert.equal(readU32(view, planBase9a + 12), oPlan9a.resetOff >>> 0);
    assert.equal(readU32(view, planBase9a + 16), oPlan9a.receiver709150Off >>> 0);
    assert.equal(readU32(view, planBase9a + 20), oPlan9a.arg709150 >>> 0);
    assert.equal(view.getInt32(planBase9a + 24, true), oPlan9a.loopSegment);

    // ABI v42: 0x008d3250 ordered host-event decision laws differential
    assert.equal(
      exp.cursorVa8d3250() >>> 0,
      exit8d3250CursorVa(),
      "cursor va",
    );
    assert.equal(
      exp.getLayerReceiverOff8d3250() >>> 0,
      exit8d3250GetLayerReceiverOff(),
      "getlayer receiver off",
    );
    assert.equal(
      exp.layerClearOff8d3250() >>> 0,
      exit8d3250LayerClearOff(),
      "layer clear off",
    );
    assert.equal(
      exp.resetReceiverOff8d3250() >>> 0,
      exit8d3250ResetReceiverOff(),
      "reset receiver off",
    );
    assert.equal(
      exp.listSentinelOff8d3250() >>> 0,
      exit8d3250ListSentinelOff(),
      "sentinel off",
    );
    assert.equal(
      exp.listHeaderOff8d3250() >>> 0,
      exit8d3250ListHeaderOff(),
      "header off",
    );
    const sentinel8d = rnd() >>> 0;
    assert.equal(
      exp.listDestroyArg1Ptr8d3250(sentinel8d) >>> 0,
      exit8d3250ListDestroyArg1Ptr(sentinel8d),
      "arg1 ptr",
    );
    const obj8d = rnd() >>> 0;
    assert.equal(
      exp.listDestroyArg28d3250(obj8d) >>> 0,
      exit8d3250ListDestroyArg2(obj8d),
      "arg2",
    );
    const f40d8d = rnd() >>> 0; // WIDE: byte gate re-narrows in both sides
    const p1e88d = rnd() >>> 0; // FULL dword pointer gate
    const planBase8d = MEM + 0x5f300;
    exp.hostPlan8d3250(planBase8d, f40d8d, p1e88d);
    const oPlan8d = exit8d3250HostPlan(f40d8d, p1e88d);
    assert.equal(readU32(view, planBase8d + 0), oPlan8d.cursorVa >>> 0);
    assert.equal(readU32(view, planBase8d + 4), oPlan8d.getLayerReceiverOff >>> 0);
    assert.equal(readU32(view, planBase8d + 8), oPlan8d.layerClearOff >>> 0);
    assert.equal(readU32(view, planBase8d + 12), oPlan8d.resetReceiverOff >>> 0);
    assert.equal(readU32(view, planBase8d + 16), oPlan8d.listObjOff >>> 0);
    assert.equal(readU32(view, planBase8d + 20), oPlan8d.listSentinelOff >>> 0);
    assert.equal(readU32(view, planBase8d + 24), oPlan8d.listHeaderOff >>> 0);
    assert.equal(view.getInt32(planBase8d + 28, true), oPlan8d.cursorGate);
    assert.equal(view.getInt32(planBase8d + 32, true), oPlan8d.listGate);

    // ABI v43: host 0x00a648b0 body decision laws (WIDE draws throughout —
    // the mode word is re-narrowed to the low byte on both sides).
    const mode43 = rnd() >>> 0;
    assert.equal(
      exp.modePathA648b0(mode43) >>> 0,
      exitA648b0ModePath(mode43),
      "a648b0 mode path",
    );
    // Byte-gate invariant: high bits must not change the path.
    assert.equal(
      exp.modePathA648b0(mode43) >>> 0,
      exp.modePathA648b0((mode43 & 0xff) >>> 0) >>> 0,
    );
    const g43 = rnd() >>> 0;
    assert.equal(
      exp.mode2StatsBasePtrA648b0(g43) >>> 0,
      exitA648b0Mode2StatsBasePtr(g43),
    );
    assert.equal(
      exp.mode2AddendLoVaA648b0() >>> 0,
      exitA648b0Mode2AddendLoVa(),
    );
    assert.equal(
      exp.mode2AddendHiVaA648b0() >>> 0,
      exitA648b0Mode2AddendHiVa(),
    );
    const lo43 = rnd() >>> 0;
    const hi43 = rnd() >>> 0;
    const addLo43 = rnd() >>> 0;
    const addHi43 = rnd() >>> 0;
    assert.equal(
      exp.statsAddLoA648b0(lo43, addLo43) >>> 0,
      exitA648b0StatsAddLo(lo43, addLo43),
    );
    assert.equal(
      exp.statsAddCarryA648b0(lo43, addLo43) >>> 0,
      exitA648b0StatsAddCarry(lo43, addLo43),
    );
    assert.equal(
      exp.statsAddHiA648b0(lo43, hi43, addLo43, addHi43) >>> 0,
      exitA648b0StatsAddHi(lo43, hi43, addLo43, addHi43),
    );
    const oAdd43 = exitA648b0StatsAddPair(lo43, hi43, addLo43, addHi43);
    const addBase43 = MEM + 0x5f600;
    exp.statsAddA648b0(addBase43, lo43, hi43, addLo43, addHi43);
    assert.equal(readU32(view, addBase43 + 0), oAdd43.lo >>> 0);
    assert.equal(readU32(view, addBase43 + 4), oAdd43.hi >>> 0);
    const edx43 = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
    const size43 = rnd() >>> 0;
    const oPlan43 = exitA648b0ModePlan(
      mode43,
      edx43,
      g43,
      lo43,
      hi43,
      size43,
      addLo43,
      addHi43,
    );
    const planBase43 = MEM + 0x5f700;
    exp.modePlanA648b0(
      planBase43,
      mode43,
      edx43,
      g43,
      lo43,
      hi43,
      size43,
      addLo43,
      addHi43,
    );
    assert.equal(view.getInt32(planBase43 + 0, true), oPlan43.path);
    assert.equal(view.getInt32(planBase43 + 4, true), oPlan43.freeNeeded ? 1 : 0);
    assert.equal(readU32(view, planBase43 + 8), oPlan43.statsBase >>> 0);
    assert.equal(readU32(view, planBase43 + 12), oPlan43.loAfter >>> 0);
    assert.equal(readU32(view, planBase43 + 16), oPlan43.hiAfter >>> 0);
    assert.equal(readU32(view, planBase43 + 20), oPlan43.freePtr >>> 0);

    // ABI v44: 0x006f0040 predicate — FULL-u32 draws in all four params.
    const recv44 = rnd() >>> 0;
    const ptr44 = rnd() >>> 0;
    const own44 = rnd() >>> 0;
    const obj44 = rnd() >>> 0;
    assert.equal(
      exp.predicate6f0040(recv44, ptr44, own44, obj44) >>> 0,
      exit6f0040Predicate(recv44, ptr44, own44, obj44),
      "6f0040 predicate",
    );
    assert.equal(exp.va6f0040() >>> 0, exit6f0040Va());
    assert.equal(exp.bodyBytes6f0040() >>> 0, exit6f0040BodyBytes());
    assert.equal(exp.ptrOff6f0040() >>> 0, exit6f0040PtrOff());
    assert.equal(exp.countOff6f0040() >>> 0, exit6f0040CountOff());

    // ABI v45: 0x0071df80 membership predicate — FULL-u32 state draws so
    // wide values (0x1000000a etc.) hit the full-dword gates.
    const state45 = rnd() >>> 0;
    assert.equal(
      exp.stateOpen71df80(state45) >>> 0,
      exit71df80StateOpen(state45),
      "71df80 state_open",
    );
    assert.equal(exp.va71df80() >>> 0, exit71df80Va());
    assert.equal(exp.bodyBytes71df80() >>> 0, exit71df80BodyBytes());
    assert.equal(exp.gameDat71df80() >>> 0, exit71df80GameDat());
    assert.equal(exp.roomOff71df80() >>> 0, exit71df80RoomOff());
    assert.equal(exp.stateOff71df80() >>> 0, exit71df80StateOff());

    // ABI v46: write-tail capture-driven gates — FULL-u32 draws so wide
    // sizes/pointers (0x100 low byte 0) hit the full-dword compares.
    const size46 = rnd() >>> 0;
    const ioPtr46 = rnd() >>> 0;
    assert.equal(
      exp["958ed0LocalFilenamePresent"](size46) >>> 0,
      exit958ed0LocalFilenamePresent(size46),
      "958ed0 local_filename_present",
    );
    assert.equal(
      exp["958ed0IoDtorNeeded"](ioPtr46) >>> 0,
      exit958ed0IoDtorNeeded(ioPtr46),
      "958ed0 io_dtor_needed",
    );

    // Tree iterator: leaf under head â†’ next is head (wasm vs JS oracle)
    const H = MEM + 0x1900;
    const Lnode = MEM + 0x1920;
    const it = MEM + 0x18f0;
    writeU32(view, H + EXIT_TREE_LEFT_OFF, Lnode);
    writeU32(view, H + EXIT_TREE_PARENT_OFF, H);
    writeU32(view, H + EXIT_TREE_RIGHT_OFF, H);
    writeU8(view, H + EXIT_TREE_ISNIL_OFF, 1);
    writeU32(view, Lnode + EXIT_TREE_LEFT_OFF, H);
    writeU32(view, Lnode + EXIT_TREE_PARENT_OFF, H);
    writeU32(view, Lnode + EXIT_TREE_RIGHT_OFF, H);
    writeU8(view, Lnode + EXIT_TREE_ISNIL_OFF, 0);
    writeU32(view, it, Lnode);
    // Parallel oracle graph at low offsets with the same shape.
    const oH = 0x10;
    const oL = 0x30;
    const oIt = 0x00;
    const ov = new DataView(new ArrayBuffer(0x80));
    ov.setUint32(oH + EXIT_TREE_LEFT_OFF, oL, true);
    ov.setUint32(oH + EXIT_TREE_PARENT_OFF, oH, true);
    ov.setUint32(oH + EXIT_TREE_RIGHT_OFF, oH, true);
    ov.setUint8(oH + EXIT_TREE_ISNIL_OFF, 1);
    ov.setUint32(oL + EXIT_TREE_LEFT_OFF, oH, true);
    ov.setUint32(oL + EXIT_TREE_PARENT_OFF, oH, true);
    ov.setUint32(oL + EXIT_TREE_RIGHT_OFF, oH, true);
    ov.setUint8(oL + EXIT_TREE_ISNIL_OFF, 0);
    ov.setUint32(oIt, oL, true);
    exitTreeIteratorNext(ov, oIt);
    exp.treeIteratorNext(it);
    assert.equal(readU32(view, it), H);
    assert.equal(ov.getUint32(oIt, true), oH);

    // ABI v10 map walk / 69d690 peels
    const sentMap = rnd() >>> 0;
    const firstMap = (rnd() & 1) === 0 ? sentMap : (rnd() >>> 0);
    assert.equal(
      exp.mapWalkNeeded(sentMap, firstMap) !== 0,
      exitMap1a738WalkNeeded(sentMap, firstMap),
    );
    const foundMap = (rnd() & 1) === 0 ? sentMap : (rnd() >>> 0);
    assert.equal(
      exp.mapLookupHit(sentMap, foundMap) !== 0,
      exitMap1a738LookupHit(sentMap, foundMap),
    );
    const flagMap = rnd() & 0xff;
    assert.equal(
      exp.mapFlagActive(flagMap) !== 0,
      exitMap1a738FlagActive(flagMap),
    );
    const beginMap = rnd() >>> 0;
    const endMap = (rnd() & 1) === 0 ? beginMap : (rnd() >>> 0);
    assert.equal(
      exp.mapElemRangeNonempty(beginMap, endMap) !== 0,
      exitMap1a738ElemRangeNonempty(beginMap, endMap),
    );
    assert.equal(
      exp.mapElemWalkNeeded(sentMap, foundMap, flagMap, beginMap, endMap) !== 0,
      exitMap1a738ElemWalkNeeded(sentMap, foundMap, flagMap, beginMap, endMap),
    );
    assert.equal(exp.mapElemStride() >>> 0, exitMap1a738ElemStride());
    assert.equal(exp.mapElemHostOff() >>> 0, exitMap1a738ElemHostOff());
    const cap = rnd() & 0x3f;
    assert.equal(
      exp.msvcSsoInline(cap) !== 0,
      exitMsvcStringSsoInline(cap),
    );
    const strAddr = rnd() >>> 0;
    const dword0 = rnd() >>> 0;
    assert.equal(
      exp.msvcStringDataAddr(strAddr, cap, dword0) >>> 0,
      exitMsvcStringDataAddr(strAddr, cap, dword0),
    );
    const isnil = rnd() & 0xff;
    assert.equal(
      exp.candidateIsnil69d690(isnil) !== 0,
      exit69d690CandidateIsnil(isnil),
    );
    const cmp = (rnd() % 5) - 2; // -2..2
    assert.equal(
      exp.cmpIsHit69d690(cmp) !== 0,
      exit69d690CmpIsHit(cmp),
    );
    const cand = rnd() >>> 0;
    assert.equal(
      exp.selectResult69d690(sentMap, cand, isnil, cmp) >>> 0,
      exit69d690SelectResult(sentMap, cand, isnil, cmp),
    );

    // String compare: random short buffers in linear memory vs JS oracle
    const len1 = rnd() % 12;
    const len2 = rnd() % 12;
    const s1off = MEM + 0x1a00;
    const s2off = MEM + 0x1a40;
    const s1 = [];
    const s2 = [];
    for (let k = 0; k < len1; k++) {
      const b = rnd() & 0xff;
      s1.push(b);
      writeU8(view, s1off + k, b);
    }
    for (let k = 0; k < len2; k++) {
      const b = rnd() & 0xff;
      s2.push(b);
      writeU8(view, s2off + k, b);
    }
    const wcmp = exp.stringCompare(s1off, len1, s2off, len2) | 0;
    const jcmp = exitStringCompare(s1, len1, s2, len2) | 0;
    // Normalize to sign only (PE returns -1/0/1; both should agree on sign)
    const wsign = wcmp < 0 ? -1 : wcmp > 0 ? 1 : 0;
    const jsign = jcmp < 0 ? -1 : jcmp > 0 ? 1 : 0;
    assert.equal(wsign, jsign);

    // ABI v11 lower_bound islands
    const rootIsnil = rnd() & 0xff;
    assert.equal(
      exp.rootIsEmpty685bc0(rootIsnil) !== 0,
      exit685bc0RootIsEmpty(rootIsnil),
    );
    const cmpLb = (rnd() % 5) - 2;
    assert.equal(
      exp.cmpGoRight685bc0(cmpLb) !== 0,
      exit685bc0CmpGoRight(cmpLb),
    );
    assert.equal(
      exp.loopContinue685bc0(rootIsnil) !== 0,
      exit685bc0LoopContinue(rootIsnil),
    );
    const node = rnd() >>> 0;
    const left = rnd() >>> 0;
    const right = rnd() >>> 0;
    const sent0 = rnd() >>> 0;
    const root0 = rnd() >>> 0;
    const tripleOff = MEM + 0x1b00;
    exp.initTriple685bc0(tripleOff, sent0, root0);
    const jInit = exit685bc0InitTriple(sent0, root0);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.walk), jInit.walk);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.bound), jInit.bound);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.best), jInit.best);
    exp.step685bc0(tripleOff, node, left, right, cmpLb);
    const jStep = exit685bc0Step(jInit, node, left, right, cmpLb);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.walk), jStep.walk);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.bound), jStep.bound);
    assert.equal(readU32(view, tripleOff + LB_TRIPLE.best), jStep.best);

    // ABI v12 40c7f0 / 40cc10 peels
    const allocPtr = (rnd() & 1) === 0 ? 0 : (rnd() >>> 0);
    assert.equal(
      exp.allocOk40c7f0(allocPtr) !== 0,
      exit40c7f0AllocOk(allocPtr),
    );
    assert.equal(
      exp.oldObjectPresent40c7f0(allocPtr) !== 0,
      exit40c7f0OldObjectPresent(allocPtr),
    );
    const valAl = rnd() & 0xff;
    const gfn12 = rnd() >>> 0;
    assert.equal(
      exp.callbackNeeded40c7f0(valAl, gfn12) !== 0,
      exit40c7f0CallbackNeeded(valAl, gfn12),
    );
    assert.equal(
      exp.defaultInitIsDirect40cc10(gfn12) !== 0,
      exit40cc10DefaultInitIsDirect(gfn12),
    );
    // also exact default
    assert.equal(
      exp.defaultInitIsDirect40cc10(EXIT_40CC10_DEFAULT_INIT) !== 0,
      exit40cc10DefaultInitIsDirect(EXIT_40CC10_DEFAULT_INIT),
    );
    assert.equal(exp.allocSize40c7f0() >>> 0, exit40c7f0AllocSize());
    assert.equal(exp.vtable40c7f0() >>> 0, exit40c7f0Vtable());
    assert.equal(exp.defaultInitVa40cc10() >>> 0, exit40cc10DefaultInitVa());

    const arg12 = rnd() >>> 0;
    const newObj12 = rnd() >>> 0;
    const obj12 = MEM + 0x1e00;
    const pair12 = MEM + 0x1e40;
    for (let k = 0; k < 0x20; k++) writeU8(view, obj12 + k, rnd() & 0xff);
    exp.apply40cc10(obj12);
    // Parallel oracle graph at non-zero base (0 is null sentinel).
    const oBase = 0x10;
    const ov12 = new DataView(new ArrayBuffer(0x40));
    for (let k = 0; k < 0x40; k++) ov12.setUint8(k, 0xcd);
    exit40cc10Apply(ov12, oBase);
    assert.equal(readU32(view, obj12), ov12.getUint32(oBase, true));
    assert.equal(readU32(view, obj12 + 4), ov12.getUint32(oBase + 4, true));
    assert.equal(readU32(view, obj12 + 8), ov12.getUint32(oBase + 8, true));
    assert.equal(readU8(view, obj12 + 0xc), ov12.getUint8(oBase + 0xc));
    assert.equal(readU32(view, obj12 + 0x10), ov12.getUint32(oBase + 0x10, true));
    exp.objectFinishApply40c7f0(obj12, arg12);
    exit40c7f0ObjectFinishApply(ov12, oBase, arg12);
    assert.equal(readU32(view, obj12), ov12.getUint32(oBase, true));
    assert.equal(
      readU32(view, obj12 + EXIT_40C7F0_ARG_OFF),
      ov12.getUint32(oBase + EXIT_40C7F0_ARG_OFF, true),
    );
    const jFin = exit40c7f0ObjectFinish(arg12);
    assert.equal(readU32(view, obj12), jFin.vtable);
    assert.equal(readU32(view, obj12 + EXIT_40C7F0_ARG_OFF), jFin.arg);
    exp.pairApplyBase40c7f0(pair12, arg12, newObj12);
    const jPair = exit40c7f0PairApply(arg12, newObj12);
    assert.equal(readU32(view, pair12 + EXIT_40C7F0_PAIR_VALUE_OFF), jPair.value);
    assert.equal(readU32(view, pair12 + EXIT_40C7F0_PAIR_OBJ_OFF), jPair.obj);

    // ABI v13 408830 peels
    const ptr13 = (rnd() & 1) === 0 ? 0 : (rnd() >>> 0);
    assert.equal(
      exp.ptrFreeNeeded408830(ptr13) !== 0,
      exit408830PtrFreeNeeded(ptr13),
    );
    assert.equal(
      exp.argPresent408830(ptr13) !== 0,
      exit408830ArgPresent(ptr13),
    );
    const count13 = rnd() >>> 0;
    assert.equal(
      exp.countNonzero408830(count13) !== 0,
      exit408830CountNonzero(count13),
    );
    // Prefer small counts + a few overflow edges
    const countSmall = (rnd() & 1) === 0 ? (rnd() % 0x1000) : (0x3fffffff + (rnd() % 4));
    assert.equal(
      exp.allocSize408830(countSmall) >>> 0,
      exit408830AllocSize(countSmall),
    );
    assert.equal(
      exp.fillSize408830(countSmall) >>> 0,
      exit408830FillSize(countSmall),
    );
    assert.equal(exp.fillByte408830() & 0xff, exit408830FillByte());
    assert.equal(exp.f3210Bits408830() >>> 0, exit408830Field10Bits());

    const arg13 = rnd() >>> 0;
    const this13 = MEM + 0x2100;
    for (let k = 0; k < 0x30; k++) writeU8(view, this13 + k, rnd() & 0xff);
    exp.storeArgApply408830(this13, arg13);
    exp.tailApply408830(this13);
    const ov13 = new DataView(new ArrayBuffer(0x40));
    const oBase13 = 0x08;
    for (let k = 0; k < 0x40; k++) ov13.setUint8(k, 0xcd);
    exit408830StoreArgApply(ov13, oBase13, arg13);
    exit408830TailApply(ov13, oBase13);
    assert.equal(
      readU32(view, this13 + EXIT_408830_FIELD_4_OFF),
      ov13.getUint32(oBase13 + EXIT_408830_FIELD_4_OFF, true),
    );
    assert.equal(
      readU32(view, this13 + EXIT_408830_FIELD_10_OFF),
      ov13.getUint32(oBase13 + EXIT_408830_FIELD_10_OFF, true),
    );
    assert.equal(
      readU8(view, this13 + EXIT_408830_FIELD_14_OFF),
      ov13.getUint8(oBase13 + EXIT_408830_FIELD_14_OFF),
    );
    assert.equal(
      readU32(view, this13 + EXIT_408830_FIELD_18_OFF),
      ov13.getUint32(oBase13 + EXIT_408830_FIELD_18_OFF, true),
    );
    assert.equal(
      readU32(view, this13 + EXIT_408830_FIELD_1C_OFF),
      ov13.getUint32(oBase13 + EXIT_408830_FIELD_1C_OFF, true),
    );
    const jTail = exit408830Tail();
    assert.equal(readU32(view, this13 + EXIT_408830_FIELD_10_OFF), jTail.field10);
    assert.equal(readU8(view, this13 + EXIT_408830_FIELD_14_OFF), jTail.field14);

    // ABI v14 9b4810 peels
    const mode14 = rnd() % 5;
    assert.equal(
      exp.firstPushValue9b4810(mode14) >>> 0,
      exit9b4810FirstPushValue(mode14),
    );
    assert.equal(exp.modeIs39b4810(mode14) !== 0, exit9b4810ModeIs3(mode14));
    assert.equal(exp.modeIs19b4810(mode14) !== 0, exit9b4810ModeIs1(mode14));
    assert.equal(
      exp.modeLayerPath9b4810(mode14) !== 0,
      exit9b4810ModeLayerPath(mode14),
    );
    assert.equal(
      exp.modeBlockANeeded9b4810(mode14) !== 0,
      exit9b4810ModeBlockANeeded(mode14),
    );
    assert.equal(
      exp.modeBlockFNeeded9b4810(mode14) !== 0,
      exit9b4810ModeBlockFNeeded(mode14),
    );
    const end14 = rnd() >>> 0;
    const cap14 = (rnd() & 1) === 0 ? end14 : ((end14 + 4) >>> 0);
    assert.equal(
      exp.vecSpace9b4810(end14, cap14) !== 0,
      exit9b4810VecSpace(end14, cap14),
    );
    assert.equal(
      exp.vecEndAfterPush9b4810(end14) >>> 0,
      exit9b4810VecEndAfterPush(end14),
    );
    const bi = rnd() % 10;
    assert.equal(exp.blockAAt9b4810(bi) >>> 0, exit9b4810BlockAAt(bi));
    assert.equal(exp.blockFAt9b4810(bi) >>> 0, exit9b4810BlockFAt(bi));
    assert.equal(exp.value1c9b4810() >>> 0, exit9b4810Value1c());

    const fl2b9 = rnd() & 1;
    const mgr8 = (rnd() & 1) === 0 ? 2 : (rnd() % 4);
    const gnull = rnd() & 1;
    const g26630 = rnd() % 3;
    const g26589 = rnd() & 1;
    assert.equal(
      exp.push1cNeeded9b4810(fl2b9, mgr8, gnull, g26630, g26589) !== 0,
      exit9b4810Push1cNeeded(fl2b9, mgr8, gnull, g26630, g26589),
    );
    const lc = (rnd() % 5) - 2;
    assert.equal(
      exp.layerLoopNeeded9b4810(lc) !== 0,
      exit9b4810LayerLoopNeeded(lc),
    );
    const sn = rnd() & 1;
    const se = rnd() & 1;
    const af = rnd() & 1;
    const t17 = rnd() & 1;
    assert.equal(
      exp.counterPlayNeeded9b4810(sn, se, af, t17) !== 0,
      exit9b4810CounterPlayNeeded(sn, se, af, t17),
    );

    const this14 = MEM + 0x2800;
    const arenaOff = 0x40; // relative offset stored in begin/end/cap
    const arenaBase = MEM + 0x2b00;
    for (let k = 0; k < 0x300; k++) writeU8(view, this14 + k, rnd() & 0xff);
    for (let k = 0; k < 0x40; k++) writeU8(view, arenaBase + k, rnd() & 0xff);
    writeU32(view, this14 + EXIT_9B4810_VEC_BEGIN_OFF, arenaOff);
    writeU32(view, this14 + EXIT_9B4810_VEC_END_OFF, arenaOff);
    writeU32(view, this14 + EXIT_9B4810_VEC_CAP_OFF, arenaOff + 0x20);
    const fc = rnd() >>> 0;
    const f10 = rnd() >>> 0;
    writeU32(view, this14 + EXIT_9B4810_FIELD_C_OFF, fc);
    writeU32(view, this14 + EXIT_9B4810_FIELD_10_OFF, f10);

    exp.vecResetEndApply9b4810(this14);
    const val14 = rnd() >>> 0;
    const pushed = exp.vecPushApply9b4810(this14, arenaBase, val14);
    const g640 = rnd() >>> 0;
    const g644 = rnd() >>> 0;
    exp.tailApply9b4810(this14, g640, g644);
    exp.playFlagApply9b4810(this14);

    const ov14 = new DataView(new ArrayBuffer(0x400));
    const oBase14 = 0x10;
    const oArena = 0x300;
    for (let k = 0; k < 0x400; k++) ov14.setUint8(k, 0xcd);
    ov14.setUint32(oBase14 + EXIT_9B4810_VEC_BEGIN_OFF, arenaOff, true);
    ov14.setUint32(oBase14 + EXIT_9B4810_VEC_END_OFF, arenaOff, true);
    ov14.setUint32(oBase14 + EXIT_9B4810_VEC_CAP_OFF, arenaOff + 0x20, true);
    ov14.setUint32(oBase14 + EXIT_9B4810_FIELD_C_OFF, fc, true);
    ov14.setUint32(oBase14 + EXIT_9B4810_FIELD_10_OFF, f10, true);
    exit9b4810VecResetEndApply(ov14, oBase14);
    const jPushed = exit9b4810VecPushApply(ov14, oBase14, oArena, val14);
    exit9b4810TailApply(ov14, oBase14, g640, g644);
    exit9b4810PlayFlagApply(ov14, oBase14);

    assert.equal(pushed !== 0, jPushed);
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_VEC_END_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_VEC_END_OFF, true),
    );
    if (jPushed) {
      assert.equal(
        readU32(view, arenaBase + arenaOff),
        ov14.getUint32(oArena + arenaOff, true),
      );
      assert.equal(readU32(view, arenaBase + arenaOff), val14 >>> 0);
    }
    assert.equal(
      readU8(view, this14 + EXIT_9B4810_FIELD_4_OFF),
      ov14.getUint8(oBase14 + EXIT_9B4810_FIELD_4_OFF),
    );
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_FIELD_8_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_FIELD_8_OFF, true),
    );
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_FIELD_14_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_FIELD_14_OFF, true),
    );
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_FIELD_18_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_FIELD_18_OFF, true),
    );
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_FIELD_1C_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_FIELD_1C_OFF, true),
    );
    assert.equal(
      readU32(view, this14 + EXIT_9B4810_FIELD_20_OFF),
      ov14.getUint32(oBase14 + EXIT_9B4810_FIELD_20_OFF, true),
    );
    const jTail14 = exit9b4810Tail(fc, f10, g640, g644);
    assert.equal(readU32(view, this14 + EXIT_9B4810_FIELD_14_OFF), jTail14.field14);
    assert.equal(readU32(view, this14 + EXIT_9B4810_FIELD_1C_OFF), jTail14.field1c);
    assert.equal(
      readU8(view, this14 + EXIT_9B4810_ANM2_138_OFF + EXIT_9B4810_PLAY_FLAG_OFF),
      EXIT_9B4810_PLAY_FLAG_VALUE,
    );

    // ABI v15 428590 pure size/cap CF
    const begin15 = (rnd() & 0xfffff0) >>> 0;
    const size15 = rnd() % 64;
    const cap15 = size15 + (rnd() % 32);
    const end15 = (begin15 + size15 * 4) >>> 0;
    const capPtr15 = (begin15 + cap15 * 4) >>> 0;
    const insert15 =
      (rnd() & 1) === 0
        ? end15
        : ((begin15 + (rnd() % (size15 + 1)) * 4) >>> 0);
    assert.equal(
      exp.elemCount428590(begin15, end15) >>> 0,
      exit428590ElemCount(begin15, end15),
    );
    assert.equal(
      exp.capacityElems428590(begin15, capPtr15) >>> 0,
      exit428590CapacityElems(begin15, capPtr15),
    );
    assert.equal(
      exp.insertIndex428590(begin15, insert15) >>> 0,
      exit428590InsertIndex(begin15, insert15),
    );
    assert.equal(
      exp.lengthErrorNeeded428590(size15) !== 0,
      exit428590LengthErrorNeeded(size15),
    );
    assert.equal(
      exp.neededSize428590(size15) >>> 0,
      exit428590NeededSize(size15),
    );
    assert.equal(
      exp.geoWouldOverflow428590(cap15) !== 0,
      exit428590GeoWouldOverflow(cap15),
    );
    assert.equal(
      exp.geometricCapacity428590(cap15) >>> 0,
      exit428590GeometricCapacity(cap15),
    );
    const needed15 = exit428590NeededSize(size15);
    assert.equal(
      exp.newCapacity428590(cap15, needed15) >>> 0,
      exit428590NewCapacity(cap15, needed15),
    );
    const newCap15 = exit428590NewCapacity(cap15, needed15);
    assert.equal(
      exp.capacityErrorNeeded428590(newCap15) !== 0,
      exit428590CapacityErrorNeeded(newCap15),
    );
    assert.equal(
      exp.allocBytes428590(newCap15) >>> 0,
      exit428590AllocBytes(newCap15),
    );
    assert.equal(
      exp.insertAtEnd428590(insert15, end15) !== 0,
      exit428590InsertAtEnd(insert15, end15),
    );
    assert.equal(
      exp.copyPrefixBytes428590(begin15, insert15) >>> 0,
      exit428590CopyPrefixBytes(begin15, insert15),
    );
    assert.equal(
      exp.copySuffixBytes428590(end15, insert15) >>> 0,
      exit428590CopySuffixBytes(end15, insert15),
    );
    assert.equal(
      exp.copyAllBytes428590(begin15, end15) >>> 0,
      exit428590CopyAllBytes(begin15, end15),
    );
    assert.equal(
      exp.oldFreeNeeded428590(begin15) !== 0,
      exit428590OldFreeNeeded(begin15),
    );
    assert.equal(
      exp.oldCapacityBytes428590(begin15, capPtr15) >>> 0,
      exit428590OldCapacityBytes(begin15, capPtr15),
    );
    const capBytes15 = exit428590OldCapacityBytes(begin15, capPtr15);
    assert.equal(
      exp.freeUsesHeapHeader428590(capBytes15) !== 0,
      exit428590FreeUsesHeapHeader(capBytes15),
    );
    assert.equal(
      exp.freeHeaderSize428590(capBytes15) >>> 0,
      exit428590FreeHeaderSize(capBytes15),
    );
    const hdr15 = (begin15 - ((rnd() % 0x30) + 4)) >>> 0;
    assert.equal(
      exp.freeHeaderOffsetOk428590(begin15, hdr15) !== 0,
      exit428590FreeHeaderOffsetOk(begin15, hdr15),
    );

    // edge inject: MAX size / geo overflow capacity
    if ((i % 17) === 0) {
      assert.equal(
        exp.lengthErrorNeeded428590(EXIT_428590_MAX_ELEMS) !== 0,
        exit428590LengthErrorNeeded(EXIT_428590_MAX_ELEMS),
      );
      assert.equal(
        exp.newCapacity428590(0x2aaaaaab, 1) >>> 0,
        exit428590NewCapacity(0x2aaaaaab, 1),
      );
    }

    const jPlan = exit428590Plan(begin15, end15, capPtr15, insert15);
    const planOff = MEM + 0x2f00;
    exp.plan428590(planOff, begin15, end15, capPtr15, insert15);
    assert.equal(readU32(view, planOff + 0), jPlan.size);
    assert.equal(readU32(view, planOff + 4), jPlan.capacity);
    assert.equal(readU32(view, planOff + 8), jPlan.insertIndex);
    assert.equal(readU32(view, planOff + 0xc), jPlan.needed);
    assert.equal(readU32(view, planOff + 0x10), jPlan.newCapacity);
    assert.equal(readU32(view, planOff + 0x14), jPlan.allocBytes);
    assert.equal(readI32(view, planOff + 0x18) !== 0, jPlan.lengthError);
    assert.equal(readI32(view, planOff + 0x1c) !== 0, jPlan.capacityError);
    assert.equal(readI32(view, planOff + 0x20) !== 0, jPlan.geoOverflow);
    assert.equal(readI32(view, planOff + 0x24) !== 0, jPlan.insertAtEnd);

    const newBegin15 = (0x4000 + (rnd() & 0xff0)) >>> 0;
    const alloc15 =
      jPlan.allocBytes || exit428590AllocBytes(jPlan.newCapacity || 1);
    const jPost = exit428590PostAllocPtrs(
      newBegin15,
      jPlan.needed,
      alloc15,
      jPlan.insertIndex,
    );
    const postEnd = MEM + 0x2f40;
    const postCap = MEM + 0x2f44;
    const postSlot = MEM + 0x2f48;
    exp.postAllocPtrs428590(
      newBegin15,
      jPlan.needed,
      alloc15,
      jPlan.insertIndex,
      postEnd,
      postCap,
      postSlot,
    );
    assert.equal(readU32(view, postEnd), jPost.end);
    assert.equal(readU32(view, postCap), jPost.cap);
    assert.equal(readU32(view, postSlot), jPost.insertSlot);
  }

  // ABI v16: ANM2 GetLayer / Load islands / 40cf00 pure size CF
  {
    const writeCstr = (off, s) => {
      for (let i = 0; i < s.length; i++) writeU8(view, off + i, s.charCodeAt(i));
      writeU8(view, off + s.length, 0);
    };
    for (let k = 0; k < 80; k++) {
      const layerId = (rnd() % 17) - 2; // -2..14
      const count = rnd() % 12;
      const base = (rnd() & 0xfffff0) >>> 0;
      assert.equal(
        exp.anm2GetlayerInRange(layerId, count) !== 0,
        exitAnm2GetlayerInRange(layerId, count),
      );
      assert.equal(
        exp.anm2LayerPtr(base, layerId) >>> 0,
        exitAnm2LayerPtr(base, layerId),
      );
      const jTry = exitAnm2GetlayerTry(base, layerId, count);
      const outL = MEM + 0x3000;
      const wOk = exp.anm2GetlayerTry(base, layerId, count, outL) !== 0;
      assert.equal(wOk, jTry.ok);
      if (jTry.ok) {
        assert.equal(readU32(view, outL) >>> 0, jTry.layer);
      }

      const pathSize = rnd() & 0xff;
      assert.equal(
        exp.anm2LoadPathPresent(pathSize) !== 0,
        exitAnm2LoadPathPresent(pathSize),
      );
      const a = rnd() >>> 0;
      const b = rnd() & 1 ? a : rnd() >>> 0;
      assert.equal(
        exp.anm2LoadPathIsSelf(a, b) !== 0,
        exitAnm2LoadPathIsSelf(a, b),
      );
      const lg = rnd() & 0xff;
      assert.equal(
        exp.anm2LoadGraphicsNeeded(lg) !== 0,
        exitAnm2LoadGraphicsNeeded(lg),
      );
      const lc = rnd() % 5;
      assert.equal(
        exp.anm2LayerLoopNeeded(lc) !== 0,
        exitAnm2LayerLoopNeeded(lc),
      );
      const sc = rnd() % 5;
      assert.equal(
        exp.anm2SheetLoopNeeded(sc) !== 0,
        exitAnm2SheetLoopNeeded(sc),
      );
      const idx = rnd() % 8;
      assert.equal(
        exp.anm2LayerByteOff(idx) >>> 0,
        exitAnm2LayerByteOff(idx),
      );
      assert.equal(
        exp.anm2SheetPtr(base, idx) >>> 0,
        exitAnm2SheetPtr(base, idx),
      );

      const size16 = rnd() % 0x2000;
      assert.equal(
        exp.usesHeapHeader40cf00(size16) !== 0,
        exit40cf00UsesHeapHeader(size16),
      );
      assert.equal(
        exp.sizeIsZero40cf00(size16) !== 0,
        exit40cf00SizeIsZero(size16),
      );
      assert.equal(
        exp.headerRequestSize40cf00(size16) >>> 0,
        exit40cf00HeaderRequestSize(size16),
      );
      assert.equal(
        exp.headerOverflow40cf00(size16) !== 0,
        exit40cf00HeaderOverflow(size16),
      );
      assert.equal(
        exp.allocRequestSize40cf00(size16) >>> 0,
        exit40cf00AllocRequestSize(size16),
      );
      const raw16 = 0x1000 + (rnd() & 0x7ff);
      assert.equal(
        exp.alignUserPtr40cf00(raw16) >>> 0,
        exit40cf00AlignUserPtr(raw16),
      );
      const jPlan16 = exit40cf00Plan(size16);
      const planOff16 = MEM + 0x3100;
      exp.plan40cf00(planOff16, size16);
      assert.equal(readU32(view, planOff16) >>> 0, jPlan16.size);
      assert.equal(readU32(view, planOff16 + 4) >>> 0, jPlan16.requestSize);
      assert.equal(readI32(view, planOff16 + 8) !== 0, jPlan16.usesHeader);
      assert.equal(readI32(view, planOff16 + 0xc) !== 0, jPlan16.sizeZero);
      assert.equal(readI32(view, planOff16 + 0x10) !== 0, jPlan16.overflow);
      assert.equal(readI32(view, planOff16 + 0x14) !== 0, jPlan16.skipAlloc);
    }

    // string CF: shadow / star layer steps
    const names = ["shadow", "Shadow", "*x", "body", "", "shadoww"];
    for (const name of names) {
      const N = MEM + 0x3200;
      writeCstr(N, name);
      assert.equal(
        exp.anm2NameIsShadow(N) !== 0,
        exitAnm2NameIsShadow(name),
      );
      const first = name.length ? name.charCodeAt(0) : 0;
      assert.equal(exp.anm2NameIsStar(first) !== 0, exitAnm2NameIsStar(first));
      const sh = MEM + 0x3280;
      const st = MEM + 0x3284;
      const f110 = MEM + 0x3288;
      writeU32(view, sh, 0xaaaaaaaa);
      writeU32(view, st, 0);
      writeU32(view, f110, 0);
      const wShadow = exp.anm2LoadLayerStep(N, 3, sh, st, f110) !== 0;
      const jStep = exitAnm2LoadLayerStep(name, 3, 0xaaaaaaaa, 0, 0);
      assert.equal(wShadow, jStep.isShadow);
      if (jStep.isShadow) {
        assert.equal(readU32(view, sh) >>> 0, 3);
      } else if (jStep.layerStarFlags != null) {
        assert.equal(readU32(view, st) >>> 0, jStep.layerStarFlags);
        assert.equal(readU32(view, f110) >>> 0, jStep.flags110);
      }
      writeU32(view, f110, 2);
      exp.anm2LoadSheetStep(N, f110);
      const jSheet = exitAnm2LoadSheetStep(name, 2);
      assert.equal(readU32(view, f110) >>> 0, jSheet);
    }

    // getlayer_apply + load_prefix_apply
    const ANM = MEM + 0x3300;
    for (let i = 0; i < 0x120; i++) writeU8(view, ANM + i, 0);
    writeU32(view, ANM + EXIT_ANM2_LAYER_BASE_OFF, 0x9000);
    writeI32(view, ANM + EXIT_ANM2_LAYER_COUNT_OFF, 5);
    assert.equal(
      exp.anm2GetlayerApply(ANM, 4) >>> 0,
      exitAnm2GetlayerApply(view, ANM, 4),
    );
    assert.equal(
      exp.anm2GetlayerApply(ANM, 5) >>> 0,
      exitAnm2GetlayerApply(view, ANM, 5),
    );
    exp.anm2LoadPrefixApply(ANM);
    const ov16 = new DataView(new ArrayBuffer(0x200));
    exitAnm2LoadPrefixApply(ov16, 0);
    assert.equal(
      readU8(view, ANM + EXIT_ANM2_LOAD_FLAG_109_OFF),
      ov16.getUint8(EXIT_ANM2_LOAD_FLAG_109_OFF),
    );
    assert.equal(
      readU32(view, ANM + EXIT_ANM2_SHADOW_INDEX_OFF) >>> 0,
      ov16.getUint32(EXIT_ANM2_SHADOW_INDEX_OFF, true) >>> 0,
    );

    // finish_header differential
    const raw = 0x3400;
    const slot = MEM + 0x3480;
    writeU32(view, slot, 0);
    const wAligned = exp.finishHeader40cf00(slot, raw) >>> 0;
    const jBox = { value: 0 };
    const jAligned = exit40cf00FinishHeader(jBox, raw);
    assert.equal(wAligned, jAligned);
    assert.equal(readU32(view, slot) >>> 0, raw);
    assert.equal(jBox.value >>> 0, raw);
    assert.equal(
      exp.finishHeader40cf00(0, raw) >>> 0,
      exit40cf00AlignUserPtr(raw),
    );
  }

  // ABI v17: ReplaceSpritesheet / Play path pure CF differential
  {
    const writeBytes = (off, s) => {
      for (let i = 0; i < s.length; i++) writeU8(view, off + i, s.charCodeAt(i));
    };
    const writeCstrD = (off, s) => {
      writeBytes(off, s);
      writeU8(view, off + s.length, 0);
    };
    for (let k = 0; k < 80; k++) {
      const layerId = (rnd() % 17) - 2;
      const count = rnd() % 12;
      const layerBase = (rnd() & 0xfffff0) >>> 0;
      const pathAddr = rnd() >>> 0;
      const sa = "p" + (rnd() % 5);
      const sb = rnd() & 1 ? sa : "q" + (rnd() % 5);
      const A = MEM + 0x4000;
      const B = MEM + 0x4040;
      writeBytes(A, sa);
      writeBytes(B, sb);
      assert.equal(
        exp.anm2SizedEqual(A, sa.length, B, sb.length) !== 0,
        exitAnm2SizedEqual(sa, sa.length, sb, sb.length),
      );
      const jRep = exitAnm2ReplacePlan(
        layerId,
        count,
        layerBase,
        pathAddr,
        sa,
        sa.length,
        sb,
        sb.length,
      );
      const rOff = MEM + 0x4080;
      exp.anm2ReplacePlan(
        rOff,
        layerId,
        count,
        layerBase,
        pathAddr,
        A,
        sa.length,
        B,
        sb.length,
      );
      assert.equal(readI32(view, rOff) !== 0, jRep.inRange);
      assert.equal(readI32(view, rOff + 4) !== 0, jRep.alreadyEqual);
      assert.equal(readI32(view, rOff + 8) !== 0, jRep.assignNeeded);
      assert.equal(readI32(view, rOff + 0xc) !== 0, jRep.willSucceed);
      assert.equal(readI32(view, rOff + 0x10) !== 0, jRep.returnBool);
      assert.equal(readU32(view, rOff + 0x14) >>> 0, jRep.layerPtr);
      assert.equal(readU32(view, rOff + 0x18) >>> 0, jRep.pngStrPtr);

      const animCount = rnd() % 6;
      const animBase = (rnd() & 0xfffff0) >>> 0;
      const anm2 = (rnd() & 0xfffff0) >>> 0;
      const fi = (rnd() % 8) - 1;
      const reset = rnd() & 1;
      const jPlay = exitAnm2PlayPlan(anm2, animBase, animCount, fi, reset);
      const pOff = MEM + 0x4100;
      exp.anm2PlayPlan(pOff, anm2, animBase, animCount, fi, reset);
      assert.equal(readI32(view, pOff) !== 0, jPlay.loopNeeded);
      assert.equal(readI32(view, pOff + 4) !== 0, jPlay.found);
      assert.equal(readI32(view, pOff + 8) !== 0, jPlay.missLogNeeded);
      assert.equal(readI32(view, pOff + 0xc) !== 0, jPlay.resetNeeded);
      assert.equal(readI32(view, pOff + 0x10) !== 0, jPlay.returnBool);
      assert.equal(readU32(view, pOff + 0x14) >>> 0, jPlay.entryPtr);
      assert.equal(readU32(view, pOff + 0x18) >>> 0, jPlay.statePtr);

      assert.equal(
        exp.anm2AnimEntryPtr(animBase, animCount % 4) >>> 0,
        exitAnm2AnimEntryPtr(animBase, animCount % 4),
      );
      assert.equal(
        exp.anm2PlayResetNeeded(reset) !== 0,
        exitAnm2PlayResetNeeded(reset),
      );
      const other = (pathAddr ^ ((rnd() & 1) ? 1 : 0)) >>> 0;
      assert.equal(
        exp.anm2ReplaceAssignNeeded(pathAddr, other) !== 0,
        exitAnm2ReplaceAssignNeeded(pathAddr, other),
      );
    }

    // play_find differential with SSO table
    const names = ["A", "BB", "Idle", "x"];
    const tab = MEM + 0x4200;
    for (let i = 0; i < names.length; i++) {
      const e = tab + i * EXIT_ANM2_ANIM_STRIDE;
      for (let j = 0; j < 0x18; j++) writeU8(view, e + j, 0);
      writeCstrD(e, names[i]);
      writeU32(view, e + 0x10, names[i].length);
      writeU32(view, e + EXIT_MSVC_STRING_CAP_OFF, 0xf);
    }
    for (const q of ["Idle", "nope", "A", "BB"]) {
      const qOff = MEM + 0x4f00;
      writeCstrD(qOff, q);
      const outIdx = MEM + 0x4f80;
      writeI32(view, outIdx, 42);
      const wFound = exp.anm2PlayFind(tab, names.length, qOff, outIdx) !== 0;
      const jFound = exitAnm2PlayFind(view, tab, names.length, q);
      assert.equal(wFound, jFound.found);
      if (jFound.found) {
        assert.equal(readI32(view, outIdx), jFound.index);
      } else {
        assert.equal(readI32(view, outIdx), -1);
      }
    }

    // replace_finish differential
    const layerBuf = MEM + 0x5000;
    for (let i = 0; i < 0x40; i++) writeU8(view, layerBuf + i, 0x55);
    assert.equal(exp.anm2ReplaceFinish(layerBuf, 1) !== 0, true);
    assert.equal(readU8(view, layerBuf + EXIT_ANM2_LAYER_FLAG30_OFF), 0);
    assert.equal(exitAnm2LayerPngStrOff(), EXIT_ANM2_LAYER_PNG_STR_OFF);
    assert.equal(exitAnm2AnimBaseOff(), EXIT_ANM2_ANIM_BASE_OFF);
  }

  // ABI v18: AnimationState::Rewind pure CF differential
  {
    for (let k = 0; k < 100; k++) {
      const bit = rnd() & 63;
      const frameI = (rnd() % 5) | 0;
      const stateF = Math.fround((rnd() % 5) | 0);
      assert.equal(
        exp.animstate408c90EventFrameEq(stateF, frameI) !== 0,
        exitAnimstate408c90EventFrameEq(stateF, frameI),
      );
      assert.equal(
        exp.animstate408c90MaskBts(0, bit) >>> 0,
        exitAnimstate408c90MaskBts(0, bit),
      );
      const animPtr = rnd() & 1 ? (0x1000 + (rnd() & 0xff0)) >>> 0 : 0;
      const ec = rnd() % 5;
      const lc = rnd() % 5;
      const nc = rnd() % 5;
      const jPlan = exitAnimstateRewindPlan(animPtr, ec, lc, nc);
      const pOff = MEM + 0x6000;
      exp.animstateRewindPlan(pOff, animPtr, ec, lc, nc);
      assert.equal(readI32(view, pOff) !== 0, jPlan.animPresent);
      assert.equal(readI32(view, pOff + 4) !== 0, jPlan.logNeeded);
      assert.equal(readI32(view, pOff + 8) !== 0, jPlan.eventLoopNeeded);
      assert.equal(readI32(view, pOff + 0xc) !== 0, jPlan.layerLoopNeeded);
      assert.equal(readI32(view, pOff + 0x10) !== 0, jPlan.nullLoopNeeded);
      assert.equal(readI32(view, pOff + 0x14) !== 0, jPlan.pureCompleteOk);
      assert.equal(readU32(view, pOff + 0x18) >>> 0, jPlan.animPtr);
      assert.equal(readU32(view, pOff + 0x1c) >>> 0, jPlan.eventCount);
    }

    // pure-complete apply vs JS oracle
    const ST = MEM + 0x6100;
    const AN = MEM + 0x6200;
    const EV = MEM + 0x6300;
    const LA = MEM + 0x6400;
    const NA = MEM + 0x6480;
    for (let k = 0; k < 40; k++) {
      const nEv = rnd() % 4;
      const nLa = rnd() % 4;
      const nNu = rnd() % 3;
      for (let i = 0; i < 0x30; i++) writeU8(view, ST + i, 0);
      for (let i = 0; i < 0x40; i++) writeU8(view, AN + i, 0);
      writeU32(view, ST + EXIT_ANIMSTATE_ANIM_OFF, AN);
      writeU32(view, ST + EXIT_ANIMSTATE_LAYER_ARR_OFF, LA);
      writeU32(view, ST + EXIT_ANIMSTATE_NULL_ARR_OFF, NA);
      writeF32(view, ST + EXIT_ANIMSTATE_FRAME_OFF, Math.fround(rnd() % 10));
      writeU32(view, ST + EXIT_ANIMSTATE_MASK18_OFF, rnd() >>> 0);
      writeU32(view, ST + EXIT_ANIMSTATE_MASK1C_OFF, rnd() >>> 0);
      for (let i = 0; i < nEv; i++) {
        writeI32(view, EV + i * 8, (rnd() % 16) | 0);
        writeI32(view, EV + i * 8 + 4, (rnd() % 3) | 0); // frame 0..2
      }
      writeU32(view, AN + EXIT_ANIMDATA_EVENT_BASE_OFF, EV);
      writeU32(view, AN + EXIT_ANIMDATA_EVENT_COUNT_OFF, nEv);
      writeU32(view, AN + EXIT_ANIMDATA_LAYER_COUNT_OFF, nLa);
      writeU32(view, AN + EXIT_ANIMDATA_NULL_COUNT_OFF, nNu);
      for (let i = 0; i < 4; i++) {
        writeU32(view, LA + i * 4, 0xaaaaaaaa);
        writeU32(view, NA + i * 4, 0xbbbbbbbb);
      }

      // oracle on a clone buffer
      const oracle = new DataView(view.buffer.slice(0));
      exitAnimstateRewindApply(oracle, ST, AN);
      exp.animstateRewindApply(ST, AN);
      assert.equal(
        readF32(view, ST + EXIT_ANIMSTATE_FRAME_OFF),
        oracle.getFloat32(ST + EXIT_ANIMSTATE_FRAME_OFF, true),
      );
      assert.equal(
        readU32(view, ST + EXIT_ANIMSTATE_MASK18_OFF) >>> 0,
        oracle.getUint32(ST + EXIT_ANIMSTATE_MASK18_OFF, true) >>> 0,
      );
      assert.equal(
        readU32(view, ST + EXIT_ANIMSTATE_MASK1C_OFF) >>> 0,
        oracle.getUint32(ST + EXIT_ANIMSTATE_MASK1C_OFF, true) >>> 0,
      );
      for (let i = 0; i < nLa; i++) {
        assert.equal(readU32(view, LA + i * 4) >>> 0, 0);
        assert.equal(oracle.getUint32(LA + i * 4, true) >>> 0, 0);
      }
      for (let i = 0; i < nNu; i++) {
        assert.equal(readU32(view, NA + i * 4) >>> 0, 0);
        assert.equal(oracle.getUint32(NA + i * 4, true) >>> 0, 0);
      }
    }

    assert.equal(exitAnimstateAnimOff(), EXIT_ANIMSTATE_ANIM_OFF);
    assert.equal(exitAnimEventStride(), EXIT_ANIM_EVENT_STRIDE);
  }

  // ABI v19: residual string assign 0x40ccd0 pure CF differential
  {
    for (let k = 0; k < 120; k++) {
      const count = rnd() % 64;
      const capacity = rnd() % 64;
      const strAddr = (0x1000 + (rnd() & 0xff0)) >>> 0;
      const dword0 = (0x8000 + (rnd() & 0xff0)) >>> 0;
      assert.equal(
        exp.fitsCapacity40ccd0(count, capacity) !== 0,
        exit40ccd0FitsCapacity(count, capacity),
      );
      assert.equal(
        exp.lengthErrorNeeded40ccd0(count) !== 0,
        exit40ccd0LengthErrorNeeded(count),
      );
      assert.equal(
        exp.roundedCapacity40ccd0(count) >>> 0,
        exit40ccd0RoundedCapacity(count),
      );
      assert.equal(
        exp.roundedOverflow40ccd0(count) !== 0,
        exit40ccd0RoundedOverflow(count),
      );
      assert.equal(
        exp.geoWouldOverflow40ccd0(capacity) !== 0,
        exit40ccd0GeoWouldOverflow(capacity),
      );
      assert.equal(
        exp.geometricCapacity40ccd0(capacity) >>> 0,
        exit40ccd0GeometricCapacity(capacity),
      );
      if (!exit40ccd0LengthErrorNeeded(count)) {
        assert.equal(
          exp.newCapacity40ccd0(capacity, count) >>> 0,
          exit40ccd0NewCapacity(capacity, count),
        );
      }
      assert.equal(
        exp.allocSize40ccd0(capacity) >>> 0,
        exit40ccd0AllocSize(capacity),
      );
      assert.equal(
        exp.oldFreeNeeded40ccd0(capacity) !== 0,
        exit40ccd0OldFreeNeeded(capacity),
      );
      assert.equal(
        exp.freeSize40ccd0(capacity) >>> 0,
        exit40ccd0FreeSize(capacity),
      );
      const fs = exit40ccd0FreeSize(capacity);
      assert.equal(
        exp.freeUsesHeapHeader40ccd0(fs) !== 0,
        exit40ccd0FreeUsesHeapHeader(fs),
      );
      assert.equal(
        exp.freeHeaderSize40ccd0(fs) >>> 0,
        exit40ccd0FreeHeaderSize(fs),
      );
      const oldPtr = (0x4000 + (rnd() & 0xff)) >>> 0;
      const header = (oldPtr - ((rnd() % 40) | 0)) >>> 0;
      assert.equal(
        exp.freeHeaderOffsetOk40ccd0(oldPtr, header) !== 0,
        exit40ccd0FreeHeaderOffsetOk(oldPtr, header),
      );
      assert.equal(
        exp.destDataAddr40ccd0(strAddr, capacity, dword0) >>> 0,
        exit40ccd0DestDataAddr(strAddr, capacity, dword0),
      );

      const jPlan = exit40ccd0Plan(strAddr, capacity, dword0, count);
      const pOff = MEM + 0x6500;
      exp.plan40ccd0(pOff, strAddr, capacity, dword0, count);
      assert.equal(readU32(view, pOff) >>> 0, jPlan.count);
      assert.equal(readU32(view, pOff + 4) >>> 0, jPlan.capacity);
      assert.equal(readU32(view, pOff + 8) >>> 0, jPlan.destData);
      assert.equal(readU32(view, pOff + 0xc) >>> 0, jPlan.newCapacity);
      assert.equal(readU32(view, pOff + 0x10) >>> 0, jPlan.allocSize);
      assert.equal(readU32(view, pOff + 0x14) >>> 0, jPlan.freeSize);
      assert.equal(readI32(view, pOff + 0x18) !== 0, jPlan.fits);
      assert.equal(readI32(view, pOff + 0x1c) !== 0, jPlan.lengthError);
      assert.equal(readI32(view, pOff + 0x20) !== 0, jPlan.growNeeded);
      assert.equal(readI32(view, pOff + 0x24) !== 0, jPlan.roundedOverflow);
      assert.equal(readI32(view, pOff + 0x28) !== 0, jPlan.geoOverflow);
      assert.equal(readI32(view, pOff + 0x2c) !== 0, jPlan.oldFreeNeeded);
      assert.equal(readI32(view, pOff + 0x30) !== 0, jPlan.freeUsesHeader);
      assert.equal(readI32(view, pOff + 0x34) !== 0, jPlan.ssoInline);
    }

    // length-error edge samples
    for (const c of [0x7ffffffe, 0x7fffffff, 0x80000000, 0xffffffff]) {
      assert.equal(
        exp.lengthErrorNeeded40ccd0(c) !== 0,
        exit40ccd0LengthErrorNeeded(c),
      );
      if (!exit40ccd0LengthErrorNeeded(c)) {
        assert.equal(
          exp.newCapacity40ccd0(0, c) >>> 0,
          exit40ccd0NewCapacity(0, c),
        );
      }
      const jp = exit40ccd0Plan(0x1000, 0, 0, c);
      const pOff = MEM + 0x6600;
      exp.plan40ccd0(pOff, 0x1000, 0, 0, c);
      assert.equal(readI32(view, pOff + 0x1c) !== 0, jp.lengthError);
      assert.equal(readI32(view, pOff + 0x20) !== 0, jp.growNeeded);
    }

    // nongrow_finish vs JS oracle
    for (let k = 0; k < 30; k++) {
      const n = rnd() % 12;
      const dest = MEM + 0x6700;
      const src = MEM + 0x6780;
      for (let i = 0; i < 0x20; i++) {
        writeU8(view, dest + i, 0xaa);
        writeU8(view, src + i, rnd() & 0xff);
      }
      const oracle = new DataView(view.buffer.slice(0));
      exit40ccd0NongrowFinish(
        oracle,
        dest,
        dest + EXIT_MSVC_STRING_SIZE_OFF,
        src,
        n,
      );
      exp.nongrowFinish40ccd0(dest, dest + EXIT_MSVC_STRING_SIZE_OFF, src, n);
      for (let i = 0; i <= n; i++) {
        assert.equal(readU8(view, dest + i), oracle.getUint8(dest + i));
      }
      assert.equal(
        readU32(view, dest + EXIT_MSVC_STRING_SIZE_OFF) >>> 0,
        oracle.getUint32(dest + EXIT_MSVC_STRING_SIZE_OFF, true) >>> 0,
      );
    }

    assert.equal(exit40ccd0MaxSize(), EXIT_40CCD0_MAX_SIZE);
    assert.equal(EXIT_40CCD0_FREE_HEADER_ADD, 0x23);
    assert.equal(EXIT_40CCD0_FREE_HEADER_OFFSET_MAX, 0x1f);
  }

  // ABI v20: residual keep-set 0x408970 pure CF differential
  {
    for (let k = 0; k < 120; k++) {
      const oldC = rnd() % 32;
      const newC = (rnd() % 34) - 1; // includes 0 and -1 as u32
      const newCu = newC >>> 0;
      const buf = (rnd() & 1) === 0 ? 0 : (0x1000 + (rnd() & 0xff0)) >>> 0;
      const obj = (rnd() & 1) === 0 ? 0 : (0x2000 + (rnd() & 0xff)) >>> 0;
      const loaded = rnd() % 64;

      assert.equal(
        exp.countSelect408970(obj, loaded) >>> 0,
        exit408970CountSelect(obj, loaded),
      );
      assert.equal(
        exp.countsEqual408970(oldC, newCu) !== 0,
        exit408970CountsEqual(oldC, newCu),
      );
      assert.equal(
        exp.countsDiffer408970(oldC, newCu) !== 0,
        exit408970CountsDiffer(oldC, newCu),
      );
      assert.equal(
        exp.newCountPositive408970(newCu) !== 0,
        exit408970NewCountPositive(newCu),
      );
      assert.equal(
        exp.copyNeeded408970(oldC) !== 0,
        exit408970CopyNeeded(oldC),
      );
      assert.equal(
        exp.ptrNonzero408970(buf) !== 0,
        exit408970PtrNonzero(buf),
      );
      const countEdge =
        (rnd() & 1) === 0 ? (rnd() % 0x1000) : (0x3fffffff + (rnd() % 4));
      assert.equal(
        exp.allocSize408970(countEdge) >>> 0,
        exit408970AllocSize(countEdge),
      );
      assert.equal(
        exp.fillSize408970(countEdge) >>> 0,
        exit408970FillSize(countEdge),
      );
      assert.equal(
        exp.copySize408970(countEdge) >>> 0,
        exit408970CopySize(countEdge),
      );
      const g = (rnd() & 1) === 0 ? 0 : (rnd() >>> 0);
      assert.equal(
        exp.heapStatsBase408970(g) >>> 0,
        exit408970HeapStatsBase(g),
      );
      if (buf !== 0) {
        assert.equal(
          exp.freeBlockPtr408970(buf) >>> 0,
          exit408970FreeBlockPtr(buf),
        );
      }

      const jBuf = exit408970BufferPlan(oldC, newCu, buf);
      const bp = MEM + 0x6e00;
      exp.bufferPlan408970(bp, oldC, newCu, buf);
      assert.equal(readU32(view, bp) >>> 0, jBuf.oldCount);
      assert.equal(readU32(view, bp + 4) >>> 0, jBuf.newCount);
      assert.equal(readU32(view, bp + 8) >>> 0, jBuf.allocSize);
      assert.equal(readU32(view, bp + 12) >>> 0, jBuf.fillSize);
      assert.equal(readU32(view, bp + 16) >>> 0, jBuf.copySize);
      assert.equal(readU32(view, bp + 20) >>> 0, jBuf.freeBlockPtr);
      assert.equal(readI32(view, bp + 24) !== 0, jBuf.countsDiffer);
      assert.equal(readI32(view, bp + 28) !== 0, jBuf.newPositive);
      assert.equal(readI32(view, bp + 32) !== 0, jBuf.freeNonpositive);
      assert.equal(readI32(view, bp + 36) !== 0, jBuf.a648b0FreeNeeded);
      assert.equal(readI32(view, bp + 40) !== 0, jBuf.reallocNeeded);
      assert.equal(readI32(view, bp + 44) !== 0, jBuf.copyNeeded);
      assert.equal(readI32(view, bp + 48) !== 0, jBuf.heapFreeNeeded);

      const oA = rnd() % 16;
      const nA = rnd() % 16;
      const oB = rnd() % 16;
      const nB = rnd() % 16;
      const bA = (rnd() & 1) === 0 ? 0 : 0x3000;
      const bB = (rnd() & 1) === 0 ? 0 : 0x4000;
      const arg = rnd() >>> 0;
      const jPlan = exit408970Plan(oA, nA, oB, nB, bA, bB, arg);
      const pp = MEM + 0x6f00;
      exp.plan408970(pp, oA, nA, oB, nB, bA, bB, arg);
      assert.equal(readU32(view, pp) >>> 0, jPlan.oldCountA);
      assert.equal(readU32(view, pp + 4) >>> 0, jPlan.newCountA);
      assert.equal(readU32(view, pp + 8) >>> 0, jPlan.oldCountB);
      assert.equal(readU32(view, pp + 12) >>> 0, jPlan.newCountB);
      assert.equal(readU32(view, pp + 16) >>> 0, jPlan.terminalArg);
      assert.equal(readI32(view, pp + 36) !== 0, jPlan.aCountsDiffer);
      assert.equal(readI32(view, pp + 52) !== 0, jPlan.aReallocNeeded);
      assert.equal(readI32(view, pp + 80) !== 0, jPlan.bCountsDiffer);
      assert.equal(readI32(view, pp + 96) !== 0, jPlan.bReallocNeeded);
      assert.equal(readI32(view, pp + 108) !== 0, jPlan.bStoreNewAtASlot);

      // field store apply vs JS
      const this20 = MEM + 0x7000;
      for (let i = 0; i < 0x20; i++) writeU8(view, this20 + i, rnd() & 0xff);
      const ov20 = new DataView(new ArrayBuffer(0x30));
      const oBase20 = 0x04;
      for (let i = 0; i < 0x30; i++) ov20.setUint8(i, 0xcd);
      exp.storeArgApply408970(this20, arg);
      exit408970StoreArgApply(ov20, oBase20, arg);
      exp.storeBufAApply408970(this20, bA);
      exit408970StoreBufAApply(ov20, oBase20, bA);
      exp.storeBufBApply408970(this20, bB);
      exit408970StoreBufBApply(ov20, oBase20, bB);
      assert.equal(
        readU32(view, this20 + EXIT_408970_FIELD_4_OFF) >>> 0,
        ov20.getUint32(oBase20 + EXIT_408970_FIELD_4_OFF, true) >>> 0,
      );
      assert.equal(
        readU32(view, this20 + EXIT_408970_FIELD_8_OFF) >>> 0,
        ov20.getUint32(oBase20 + EXIT_408970_FIELD_8_OFF, true) >>> 0,
      );
      assert.equal(
        readU32(view, this20 + EXIT_408970_FIELD_C_OFF) >>> 0,
        ov20.getUint32(oBase20 + EXIT_408970_FIELD_C_OFF, true) >>> 0,
      );
    }

    assert.equal(exp.fillByte408970() & 0xff, exit408970FillByte());
    assert.equal(
      exp.heapStatsBase408970(0) >>> 0,
      EXIT_408970_HEAP_STATS_FALLBACK,
    );
    assert.equal(EXIT_408970_HEAP_STATS_GLOBAL, 0x00c7de78);
  }

  // ABI v21: residual Load nested 0x40db90 pure CF differential
  {
    const sent21d = 0xc78ee0;
    for (let k = 0; k < 120; k++) {
      const pathSize = rnd() % 8;
      const qLo = rnd() >>> 0;
      const qHi = (rnd() & 0xffff) >>> 0;
      const begin = (rnd() & 0xfff0) >>> 0;
      const end = (begin + (rnd() % 16)) >>> 0;
      const node = (0x1000 + (rnd() & 0xff0)) >>> 0;
      const isnil = rnd() & 1;
      const nKey = rnd() >>> 0;
      const key = rnd() >>> 0;
      const flag14 = rnd() & 3;
      const filePtr = rnd() & 1 ? (0x4000 + (rnd() & 0xff)) >>> 0 : 0;
      const layerBase = rnd() & 1 ? (0x8000 + (rnd() & 0xff)) >>> 0 : 0;
      const layerCount = rnd() % 8;
      const headerCount = rnd() % 8;
      const nameA = (0x18 + (rnd() & 1) * 0x20) >>> 0;
      const nameB = (0x18 + (rnd() & 1) * 0x20) >>> 0;

      assert.equal(
        exp.pathSizePresent40db90(pathSize) !== 0,
        exit40db90PathSizePresent(pathSize),
      );
      assert.equal(
        exp.earlyReturn40db90(pathSize) !== 0,
        exit40db90EarlyReturn(pathSize),
      );

      const tOff = MEM + 0x8000;
      exp.timingScale40db90(qLo, qHi, tOff, tOff + 4);
      const jTs = exit40db90TimingScale(qLo, qHi);
      assert.equal(readU32(view, tOff) >>> 0, jTs.lo);
      assert.equal(readU32(view, tOff + 4) >>> 0, jTs.hi);

      const eLo = (qLo + (rnd() & 0xff)) >>> 0;
      const eHi = qHi;
      exp.timingDelta40db90(eLo, eHi, qLo, qHi, tOff + 8, tOff + 12);
      const jTd = exit40db90TimingDelta(eLo, eHi, qLo, qHi);
      assert.equal(readU32(view, tOff + 8) >>> 0, jTd.lo);
      assert.equal(readU32(view, tOff + 12) >>> 0, jTd.hi);

      assert.equal(
        exp.cacheSpaceOk40db90(begin, end) !== 0,
        exit40db90CacheSpaceOk(begin, end),
      );
      assert.equal(
        exp.cacheWalkDone40db90(begin, end) !== 0,
        exit40db90CacheWalkDone(begin, end),
      );
      assert.equal(
        exp.cacheWalkNext40db90(begin) >>> 0,
        exit40db90CacheWalkNext(begin),
      );
      assert.equal(
        exp.treeHitSelect40db90(node, isnil, nKey, key, sent21d) >>> 0,
        exit40db90TreeHitSelect(node, isnil, nKey, key, sent21d),
      );
      assert.equal(
        exp.insertNeeded40db90(node, sent21d, flag14, filePtr) !== 0,
        exit40db90InsertNeeded(node, sent21d, flag14, filePtr),
      );
      assert.equal(
        exp.heapStatsBase40db90(filePtr) >>> 0,
        exit40db90HeapStatsBase(filePtr),
      );
      assert.equal(
        exp.tempFreeNeeded40db90(filePtr) !== 0,
        exit40db90TempFreeNeeded(filePtr),
      );
      if (filePtr) {
        assert.equal(
          exp.freeBlockPtr40db90(filePtr) >>> 0,
          exit40db90FreeBlockPtr(filePtr),
        );
      }
      assert.equal(
        exp.layerArrayPresent40db90(layerBase) !== 0,
        exit40db90LayerArrayPresent(layerBase),
      );
      assert.equal(
        exp.oldLayerFreeSize40db90(headerCount) >>> 0,
        exit40db90OldLayerFreeSize(headerCount),
      );
      assert.equal(
        exp.layerCountNonzero40db90(layerCount) !== 0,
        exit40db90LayerCountNonzero(layerCount),
      );
      assert.equal(
        exp.layerAllocSize40db90(layerCount) >>> 0,
        exit40db90LayerAllocSize(layerCount),
      );
      assert.equal(
        exp.layerLoopNeeded40db90(layerCount % 4, layerCount) !== 0,
        exit40db90LayerLoopNeeded(layerCount % 4, layerCount),
      );
      assert.equal(
        exp.srcLayerPtr40db90(0x1000, layerCount % 4) >>> 0,
        exit40db90SrcLayerPtr(0x1000, layerCount % 4),
      );
      assert.equal(
        exp.dstLayerPtr40db90(0x2000, layerCount % 4) >>> 0,
        exit40db90DstLayerPtr(0x2000, layerCount % 4),
      );
      assert.equal(
        exp.nameAssignNeeded40db90(nameA, nameB) !== 0,
        exit40db90NameAssignNeeded(nameA, nameB),
      );

      const jPlan = exit40db90Plan(
        pathSize,
        qLo,
        qHi,
        begin,
        end,
        node,
        isnil,
        nKey,
        key,
        sent21d,
        flag14,
        filePtr,
        layerBase,
        layerCount,
        headerCount,
        nameA,
        nameB,
      );
      const pOff = MEM + 0x8100;
      exp.plan40db90(
        pOff,
        pathSize,
        qLo,
        qHi,
        begin,
        end,
        node,
        isnil,
        nKey,
        key,
        sent21d,
        flag14,
        filePtr,
        layerBase,
        layerCount,
        headerCount,
        nameA,
        nameB,
      );
      // IsaacExit40db90Plan layout (u32 then i32 flags)
      assert.equal(readU32(view, pOff) >>> 0, jPlan.pathSize);
      assert.equal(readU32(view, pOff + 4) >>> 0, jPlan.timingLo);
      assert.equal(readU32(view, pOff + 8) >>> 0, jPlan.timingHi);
      assert.equal(readU32(view, pOff + 12) >>> 0, jPlan.cacheBegin);
      assert.equal(readU32(view, pOff + 16) >>> 0, jPlan.cacheEnd);
      assert.equal(readU32(view, pOff + 20) >>> 0, jPlan.nodeAddr);
      assert.equal(readU32(view, pOff + 24) >>> 0, jPlan.sentinelAddr);
      assert.equal(readU32(view, pOff + 28) >>> 0, jPlan.layerBasePtr);
      assert.equal(readU32(view, pOff + 32) >>> 0, jPlan.layerCount);
      assert.equal(readU32(view, pOff + 36) >>> 0, jPlan.layerAllocSize);
      assert.equal(readU32(view, pOff + 40) >>> 0, jPlan.oldFreeSize);
      assert.equal(readU32(view, pOff + 44) >>> 0, jPlan.freeBlockPtr);
      assert.equal(readI32(view, pOff + 48) !== 0, jPlan.pathPresent);
      assert.equal(readI32(view, pOff + 52) !== 0, jPlan.earlyReturn);
      assert.equal(readI32(view, pOff + 56) !== 0, jPlan.cacheSpaceOk);
      assert.equal(readI32(view, pOff + 60) !== 0, jPlan.cacheWalkDone);
      assert.equal(readI32(view, pOff + 64) !== 0, jPlan.cacheMiss);
      assert.equal(readI32(view, pOff + 68) !== 0, jPlan.insertNeeded);
      assert.equal(readI32(view, pOff + 72) !== 0, jPlan.tempFreeNeeded);
      assert.equal(readI32(view, pOff + 76) !== 0, jPlan.layerArrayPresent);
      assert.equal(readI32(view, pOff + 80) !== 0, jPlan.layerCountNonzero);
      assert.equal(readI32(view, pOff + 84) !== 0, jPlan.layerLoopNeeded);
      assert.equal(readI32(view, pOff + 88) !== 0, jPlan.nameAssignNeeded);
    }

    // field pack apply differential
    const anOff = MEM + 0x8300;
    const oAn = 0x100;
    const oracle = new DataView(new ArrayBuffer(0x1000));
    for (let k = 0; k < 40; k++) {
      const pack = exit40db90FieldPack(
        rnd() % 16,
        rnd() >>> 0,
        rnd() >>> 0,
        rnd() >>> 0,
        rnd() >>> 0,
        rnd() >>> 0,
        rnd() >>> 0,
      );
      const fpOff = MEM + 0x8400;
      exp.fieldPack40db90(
        fpOff,
        pack.layerCount,
        pack.field74,
        pack.field78,
        pack.field84,
        pack.field88,
        pack.field8c,
        pack.field90,
      );
      for (let i = 0; i < 0xa0; i++) {
        writeU8(view, anOff + i, 0x5a);
        oracle.setUint8(oAn + i, 0x5a);
      }
      exit40db90FieldPackApply(oracle, oAn, pack);
      exp.fieldPackApply40db90(anOff, fpOff);
      assert.equal(
        readU32(view, anOff + EXIT_40DB90_ANM2_LAYER_COUNT_OFF) >>> 0,
        oracle.getUint32(oAn + EXIT_40DB90_ANM2_LAYER_COUNT_OFF, true) >>> 0,
      );
      assert.equal(
        readU32(view, anOff + EXIT_40DB90_ANM2_FIELD74_OFF) >>> 0,
        oracle.getUint32(oAn + EXIT_40DB90_ANM2_FIELD74_OFF, true) >>> 0,
      );
      assert.equal(
        readU32(view, anOff + EXIT_40DB90_ANM2_FIELD90_OFF) >>> 0,
        oracle.getUint32(oAn + EXIT_40DB90_ANM2_FIELD90_OFF, true) >>> 0,
      );

      const ly = MEM + 0x8500;
      const oly = 0x200;
      writeU32(view, ly + 4, 0x11111111);
      oracle.setUint32(oly + 4, 0x11111111, true);
      const anm2 = (0x9000 + (rnd() & 0xff)) >>> 0;
      exp.storeLayerBackptrAt40db90(ly, anm2);
      exit40db90StoreLayerBackptrAt(oracle, oly, anm2);
      assert.equal(
        readU32(view, ly + EXIT_40DB90_LAYER_BACKPTR_OFF) >>> 0,
        oracle.getUint32(oly + EXIT_40DB90_LAYER_BACKPTR_OFF, true) >>> 0,
      );
    }

    assert.equal(exp.srcLayerStride40db90() >>> 0, exit40db90SrcLayerStride());
    assert.equal(exp.dstLayerStride40db90() >>> 0, exit40db90DstLayerStride());
    assert.equal(EXIT_40DB90_HEAP_STATS_GLOBAL, 0x00c7de78);
    // overflow alloc edge
    assert.equal(
      exp.layerAllocSize40db90(0x4000000) >>> 0,
      exit40db90LayerAllocSize(0x4000000),
    );
    assert.equal(
      exp.layerAllocSize40db90(0xffffffff) >>> 0,
      exit40db90LayerAllocSize(0xffffffff),
    );
  }

  // ABI v22: residual Load sibling 0x40e110 pure CF differential
  {
    const sent22d = EXIT_40E110_TREE_SENTINEL_ADDR;
    for (let k = 0; k < 120; k++) {
      const begin = (rnd() & 0xfff0) >>> 0;
      const end = (begin + (rnd() % 16)) >>> 0;
      const node = (0x1000 + (rnd() & 0xff0)) >>> 0;
      const isnil = rnd() & 1;
      const nKey = rnd() >>> 0;
      const key = rnd() >>> 0;
      const pathAddr = (0x2000 + (rnd() & 0xff0)) >>> 0;
      const pathCap = rnd() % 0x20;
      const pathD0 = rnd() >>> 0;
      const grow =
        (rnd() & 1) === 0
          ? EXIT_40E110_CACHE_BEGIN_ADDR
          : (0x3000 + (rnd() & 0xff0)) >>> 0;
      const rcPrior = rnd() >>> 0;

      assert.equal(
        exp.cacheSpaceOk40e110(begin, end) !== 0,
        exit40e110CacheSpaceOk(begin, end),
      );
      assert.equal(
        exp.cacheWalkDone40e110(begin, end) !== 0,
        exit40e110CacheWalkDone(begin, end),
      );
      assert.equal(
        exp.cacheWalkNext40e110(begin) >>> 0,
        exit40e110CacheWalkNext(begin),
      );
      assert.equal(
        exp.pathDataAddr40e110(pathAddr, pathCap, pathD0) >>> 0,
        exit40e110PathDataAddr(pathAddr, pathCap, pathD0),
      );
      assert.equal(
        exp.treeHitSelect40e110(node, isnil, nKey, key, sent22d) >>> 0,
        exit40e110TreeHitSelect(node, isnil, nKey, key, sent22d),
      );
      const selected = exit40e110TreeHitSelect(
        node,
        isnil,
        nKey,
        key,
        sent22d,
      );
      assert.equal(
        exp.cacheHit40e110(selected, sent22d) !== 0,
        exit40e110CacheHit(selected, sent22d),
      );
      assert.equal(
        exp.cacheMiss40e110(selected, sent22d) !== 0,
        exit40e110CacheMiss(selected, sent22d),
      );
      assert.equal(
        exp.logNeeded40e110(selected, sent22d) !== 0,
        exit40e110LogNeeded(selected, sent22d),
      );
      assert.equal(
        exp.refcountInc40e110(rcPrior) >>> 0,
        exit40e110RefcountInc(rcPrior),
      );
      assert.equal(
        exp.growInstallNeeded40e110(grow) !== 0,
        exit40e110GrowInstallNeeded(grow),
      );

      const jPlan = exit40e110Plan(
        begin,
        end,
        node,
        isnil,
        nKey,
        key,
        sent22d,
        pathAddr,
        pathCap,
        pathD0,
        grow,
        rcPrior,
      );
      const pOff = MEM + 0x8600;
      exp.plan40e110(
        pOff,
        begin,
        end,
        node,
        isnil,
        nKey,
        key,
        sent22d,
        pathAddr,
        pathCap,
        pathD0,
        grow,
        rcPrior,
      );
      // IsaacExit40e110Plan layout
      assert.equal(readU32(view, pOff) >>> 0, jPlan.cacheBegin);
      assert.equal(readU32(view, pOff + 4) >>> 0, jPlan.cacheEnd);
      assert.equal(readU32(view, pOff + 8) >>> 0, jPlan.nodeAddr);
      assert.equal(readU32(view, pOff + 12) >>> 0, jPlan.sentinelAddr);
      assert.equal(readU32(view, pOff + 16) >>> 0, jPlan.pathDataAddr);
      assert.equal(readU32(view, pOff + 20) >>> 0, jPlan.pathBufSize);
      assert.equal(readU32(view, pOff + 24) >>> 0, jPlan.refcountNext);
      assert.equal(readI32(view, pOff + 28) !== 0, jPlan.cacheSpaceOk);
      assert.equal(readI32(view, pOff + 32) !== 0, jPlan.cacheWalkDone);
      assert.equal(readI32(view, pOff + 36) !== 0, jPlan.growInstallNeeded);
      assert.equal(readI32(view, pOff + 40) !== 0, jPlan.cacheHit);
      assert.equal(readI32(view, pOff + 44) !== 0, jPlan.cacheMiss);
      assert.equal(readI32(view, pOff + 48) !== 0, jPlan.logNeeded);
      assert.equal(readI32(view, pOff + 52) !== 0, jPlan.refcountIncNeeded);

      // refcount apply + grow clear differential
      const nd = MEM + 0x8700;
      const ond = 0x100;
      const oracle = new DataView(new ArrayBuffer(0x200));
      for (let i = 0; i < 0x60; i++) {
        writeU8(view, nd + i, rnd() & 0xff);
        oracle.setUint8(ond + i, readU8(view, nd + i));
      }
      exp.refcountIncApply40e110(nd);
      exit40e110RefcountIncApply(oracle, ond);
      assert.equal(
        readU32(view, nd + EXIT_40E110_NODE_REFCOUNT_OFF) >>> 0,
        oracle.getUint32(ond + EXIT_40E110_NODE_REFCOUNT_OFF, true) >>> 0,
      );

      const gr = MEM + 0x8800;
      const ogr = 0x180;
      writeU32(view, gr, rnd() >>> 0);
      writeU32(view, gr + 4, rnd() >>> 0);
      writeU32(view, gr + 8, rnd() >>> 0);
      oracle.setUint32(ogr, readU32(view, gr), true);
      oracle.setUint32(ogr + 4, readU32(view, gr + 4), true);
      oracle.setUint32(ogr + 8, readU32(view, gr + 8), true);
      exp.growResultClearAt40e110(gr);
      exit40e110GrowResultClearAt(oracle, ogr);
      assert.equal(readU32(view, gr) >>> 0, 0);
      assert.equal(readU32(view, gr + 4) >>> 0, 0);
      assert.equal(readU32(view, gr + 8) >>> 0, 0);
      assert.equal(oracle.getUint32(ogr, true) >>> 0, 0);
      assert.equal(oracle.getUint32(ogr + 4, true) >>> 0, 0);
      assert.equal(oracle.getUint32(ogr + 8, true) >>> 0, 0);
    }

    assert.equal(exp.pathBufSize40e110() >>> 0, exit40e110PathBufSize());
    assert.equal(EXIT_40E110_CACHE_BEGIN_ADDR, 0x00c798b8);
    assert.equal(EXIT_40E110_TREE_SENTINEL_ADDR, 0x00c78ee0);
  }

  // ABI v23: residual ANM2 graphics walk 0x40c000 pure CF differential
  {
    for (let k = 0; k < 120; k++) {
      const count = rnd() % 8;
      const index = rnd() % 8;
      const layerBase = (0x1000 + (rnd() & 0xff0)) >>> 0;
      const flag30 = rnd() & 3;
      const pathCap = rnd() % 0x20;
      const pathD0 = rnd() >>> 0;
      const shared = rnd() & 1 ? (0x4000 + (rnd() & 0xff)) >>> 0 : 0;
      const sharedAl = rnd() & 3;
      const sprite = rnd() & 1 ? (0x5000 + (rnd() & 0xff)) >>> 0 : 0;
      const cbAl = rnd() & 3;
      const cbFn = rnd() & 1 ? EXIT_40C000_CALLBACK_GLOBAL : 0;

      assert.equal(
        exp.layerCountNonzero40c000(count) !== 0,
        exit40c000LayerCountNonzero(count),
      );
      assert.equal(
        exp.loopNeeded40c000(index, count) !== 0,
        exit40c000LoopNeeded(index, count),
      );
      assert.equal(
        exp.layerByteOff40c000(index) >>> 0,
        exit40c000LayerByteOff(index),
      );
      assert.equal(
        exp.layerPtr40c000(layerBase, index) >>> 0,
        exit40c000LayerPtr(layerBase, index),
      );
      assert.equal(
        exp.layerSkip40c000(flag30) !== 0,
        exit40c000LayerSkip(flag30),
      );
      assert.equal(
        exp.layerBodyNeeded40c000(flag30) !== 0,
        exit40c000LayerBodyNeeded(flag30),
      );
      const layerPtr = exit40c000LayerPtr(layerBase, index);
      assert.equal(
        exp.pngStrPtr40c000(layerPtr) >>> 0,
        exit40c000PngStrPtr(layerPtr),
      );
      const png = exit40c000PngStrPtr(layerPtr);
      assert.equal(
        exp.pathDataAddr40c000(png, pathCap, pathD0) >>> 0,
        exit40c000PathDataAddr(png, pathCap, pathD0),
      );
      assert.equal(
        exp.sharedPresent40c000(shared) !== 0,
        exit40c000SharedPresent(shared),
      );
      assert.equal(
        exp.virtualOk40c000(sharedAl) !== 0,
        exit40c000VirtualOk(sharedAl),
      );
      assert.equal(
        exp.graphicsFlag40c000(shared, sharedAl) & 0xff,
        exit40c000GraphicsFlag(shared, sharedAl) & 0xff,
      );
      assert.equal(
        exp.spritePresent40c000(sprite) !== 0,
        exit40c000SpritePresent(sprite),
      );
      assert.equal(
        exp.objectPresent40c000(shared) !== 0,
        exit40c000ObjectPresent(shared),
      );
      assert.equal(
        exp.callbackNeeded40c000(cbAl, cbFn) !== 0,
        exit40c000CallbackNeeded(cbAl, cbFn),
      );
      assert.equal(
        exp.loopNextIndex40c000(index) >>> 0,
        exit40c000LoopNextIndex(index),
      );
      const off = exit40c000LayerByteOff(index);
      assert.equal(
        exp.loopNextOff40c000(off) >>> 0,
        exit40c000LoopNextOff(off),
      );

      const jPlan = exit40c000Plan(
        count,
        layerBase,
        index,
        flag30,
        pathCap,
        pathD0,
        shared,
        sharedAl,
        sprite,
        cbAl,
        cbFn,
      );
      const pOff = MEM + 0x8900;
      exp.plan40c000(
        pOff,
        count,
        layerBase,
        index,
        flag30,
        pathCap,
        pathD0,
        shared,
        sharedAl,
        sprite,
        cbAl,
        cbFn,
      );
      // IsaacExit40c000Plan layout: 8Ã—u32 then 9Ã—i32
      assert.equal(readU32(view, pOff) >>> 0, jPlan.layerCount);
      assert.equal(readU32(view, pOff + 4) >>> 0, jPlan.layerBasePtr);
      assert.equal(readU32(view, pOff + 8) >>> 0, jPlan.index);
      assert.equal(readU32(view, pOff + 12) >>> 0, jPlan.layerPtr);
      assert.equal(readU32(view, pOff + 16) >>> 0, jPlan.layerByteOff);
      assert.equal(readU32(view, pOff + 20) >>> 0, jPlan.pngStrPtr);
      assert.equal(readU32(view, pOff + 24) >>> 0, jPlan.pathDataAddr);
      assert.equal(readU32(view, pOff + 28) >>> 0, jPlan.graphicsFlag);
      assert.equal(readI32(view, pOff + 32) !== 0, jPlan.countNonzero);
      assert.equal(readI32(view, pOff + 36) !== 0, jPlan.loopNeeded);
      assert.equal(readI32(view, pOff + 40) !== 0, jPlan.layerSkip);
      assert.equal(readI32(view, pOff + 44) !== 0, jPlan.layerBodyNeeded);
      assert.equal(readI32(view, pOff + 48) !== 0, jPlan.sharedPresent);
      assert.equal(readI32(view, pOff + 52) !== 0, jPlan.virtualOk);
      assert.equal(readI32(view, pOff + 56) !== 0, jPlan.spritePresent);
      assert.equal(readI32(view, pOff + 60) !== 0, jPlan.storeFlagsNeeded);
      assert.equal(readI32(view, pOff + 64) !== 0, jPlan.callbackNeeded);

      // pair zero/assign + layer flag store differential
      const pair = MEM + 0x8a00;
      const oPair = 0x40;
      const oracle = new DataView(new ArrayBuffer(0x200));
      writeU32(view, pair, rnd() >>> 0);
      writeU32(view, pair + 4, rnd() >>> 0);
      oracle.setUint32(oPair, readU32(view, pair), true);
      oracle.setUint32(oPair + 4, readU32(view, pair + 4), true);
      exp.pairZeroAt40c000(pair);
      exit40c000PairZeroAt(oracle, oPair);
      assert.equal(readU32(view, pair) >>> 0, 0);
      assert.equal(readU32(view, pair + 4) >>> 0, 0);
      assert.equal(oracle.getUint32(oPair, true) >>> 0, 0);
      assert.equal(oracle.getUint32(oPair + 4, true) >>> 0, 0);
      const pv = rnd() >>> 0;
      const pc = rnd() >>> 0;
      exp.pairAssignAt40c000(pair, pv, pc);
      exit40c000PairAssignAt(oracle, oPair, pv, pc);
      assert.equal(readU32(view, pair) >>> 0, pv >>> 0);
      assert.equal(readU32(view, pair + 4) >>> 0, pc >>> 0);
      assert.equal(oracle.getUint32(oPair, true) >>> 0, pv >>> 0);
      assert.equal(oracle.getUint32(oPair + 4, true) >>> 0, pc >>> 0);

      const ly = MEM + 0x8b00;
      const oly = 0x100;
      for (let i = 0; i < 0x40; i++) {
        writeU8(view, ly + i, rnd() & 0xff);
        oracle.setUint8(oly + i, readU8(view, ly + i));
      }
      const gflag = exit40c000GraphicsFlag(shared, sharedAl);
      exp.storeLayerFlagsAt40c000(ly, gflag);
      exit40c000StoreLayerFlagsAt(oracle, oly, gflag);
      assert.equal(
        readU8(view, ly + EXIT_40C000_LAYER_FLAG30_OFF),
        oracle.getUint8(oly + EXIT_40C000_LAYER_FLAG30_OFF),
      );
      assert.equal(
        readU8(view, ly + EXIT_40C000_LAYER_FLAG31_OFF),
        oracle.getUint8(oly + EXIT_40C000_LAYER_FLAG31_OFF),
      );
      assert.equal(readU8(view, ly + EXIT_40C000_LAYER_FLAG30_OFF), gflag & 0xff);
      assert.equal(readU8(view, ly + EXIT_40C000_LAYER_FLAG31_OFF), 0);

      // pure-complete 40c1e0
      const obj = MEM + 0x8c00;
      const oObj = 0x140;
      for (let i = 0; i < 0x10; i++) {
        writeU8(view, obj + i, 0xcd);
        oracle.setUint8(oObj + i, 0xcd);
      }
      exp.apply40c1e0(obj);
      exit40c1e0Apply(oracle, oObj);
      const jInit = exit40c1e0Init();
      assert.equal(readU32(view, obj) >>> 0, jInit.field0);
      assert.equal(readU32(view, obj + 4) >>> 0, jInit.field4);
      assert.equal(readU32(view, obj + 8) >>> 0, jInit.field8);
      assert.equal(readU8(view, obj + 0xc), jInit.fieldC);
      assert.equal(oracle.getUint32(oObj, true) >>> 0, jInit.field0);
      assert.equal(oracle.getUint8(oObj + 0xc), jInit.fieldC);
    }

    assert.equal(exp.layerStride40c000() >>> 0, exit40c000LayerStride());
    assert.equal(EXIT_40C000_LAYER_STRIDE, 0xa0);
    assert.equal(EXIT_40C000_CALLBACK_GLOBAL, 0x00c7163c);
    assert.equal(EXIT_40C1E0_FIELD0_VALUE >>> 0, 0xffffffff);
    // fixed edge: count 0 early; skip flag set
    assert.equal(exp.layerCountNonzero40c000(0) !== 0, false);
    assert.equal(exp.loopNeeded40c000(0, 0) !== 0, false);
    assert.equal(exp.layerSkip40c000(1) !== 0, true);
    assert.equal(exp.layerBodyNeeded40c000(0) !== 0, true);
    assert.equal(exp.graphicsFlag40c000(0, 1) & 0xff, 0);
    assert.equal(exp.graphicsFlag40c000(1, 0) & 0xff, 0);
    assert.equal(exp.graphicsFlag40c000(1, 1) & 0xff, 1);
    assert.equal(exp.callbackNeeded40c000(1, 0) !== 0, false);
    assert.equal(exp.callbackNeeded40c000(0, EXIT_40C000_CALLBACK_GLOBAL) !== 0, false);
    assert.equal(
      exp.callbackNeeded40c000(1, EXIT_40C000_CALLBACK_GLOBAL) !== 0,
      true,
    );
  }

  // ABI v24: residual layer-attach 0x408640 pure CF differential
  {
    for (let k = 0; k < 120; k++) {
      const layerPtr = (0x2000 + (rnd() & 0xff0)) >>> 0;
      const srcPtr = rnd() & 1 ? (0x3000 + (rnd() & 0xff)) >>> 0 : 0;
      const ctrlPtr = rnd() & 1 ? (0x4000 + (rnd() & 0xff)) >>> 0 : 0;
      const virtualAl = rnd() & 3;
      const cbFn = rnd() & 1 ? EXIT_408640_CALLBACK_GLOBAL : 0;

      assert.equal(
        exp.sourcePresent408640(srcPtr) !== 0,
        exit408640SourcePresent(srcPtr),
      );
      assert.equal(
        exp.ctrlPresent408640(ctrlPtr) !== 0,
        exit408640CtrlPresent(ctrlPtr),
      );
      assert.equal(
        exp.virtualOk408640(virtualAl) !== 0,
        exit408640VirtualOk(virtualAl),
      );
      assert.equal(
        exp.callbackNeeded408640(virtualAl, cbFn) !== 0,
        exit408640CallbackNeeded(virtualAl, cbFn),
      );
      assert.equal(
        exp.dstFieldPtr408640(layerPtr) >>> 0,
        exit408640DstFieldPtr(layerPtr),
      );
      assert.equal(
        exp.srcFieldPtr408640(srcPtr || 0x100) >>> 0,
        exit408640SrcFieldPtr(srcPtr || 0x100),
      );
      assert.equal(
        exp.pairSlotPtr408640(layerPtr) >>> 0,
        exit408640PairSlotPtr(layerPtr),
      );

      const jPlan = exit408640Plan(layerPtr, srcPtr, ctrlPtr, virtualAl, cbFn);
      const pOff = MEM + 0x9000;
      exp.plan408640(pOff, layerPtr, srcPtr, ctrlPtr, virtualAl, cbFn);
      // IsaacExit408640Plan: 6Ã—u32 then 6Ã—i32
      assert.equal(readU32(view, pOff) >>> 0, jPlan.layerPtr);
      assert.equal(readU32(view, pOff + 4) >>> 0, jPlan.srcPtr);
      assert.equal(readU32(view, pOff + 8) >>> 0, jPlan.ctrlPtr);
      assert.equal(readU32(view, pOff + 12) >>> 0, jPlan.dstFieldPtr);
      assert.equal(readU32(view, pOff + 16) >>> 0, jPlan.srcFieldPtr);
      assert.equal(readU32(view, pOff + 20) >>> 0, jPlan.pairSlotPtr);
      assert.equal(readI32(view, pOff + 24) !== 0, jPlan.sourcePresent);
      assert.equal(readI32(view, pOff + 28) !== 0, jPlan.fieldCopyNeeded);
      assert.equal(readI32(view, pOff + 32) !== 0, jPlan.ctrlPresent);
      assert.equal(readI32(view, pOff + 36) !== 0, jPlan.virtualOk);
      assert.equal(readI32(view, pOff + 40) !== 0, jPlan.callbackNeeded);
      assert.equal(readI32(view, pOff + 44) !== 0, jPlan.pairSwapHostNeeded);

      // field copy differential (always-copy path)
      const layer = MEM + 0x9100;
      const src = MEM + 0x9200;
      const oLayer = 0x40;
      const oSrc = 0x140;
      const oracle = new DataView(new ArrayBuffer(0x280));
      for (let i = 0; i < 0x40; i++) {
        writeU8(view, layer + i, rnd() & 0xff);
        oracle.setUint8(oLayer + i, readU8(view, layer + i));
      }
      for (let i = 0; i < 0x40; i++) {
        writeU8(view, src + i, rnd() & 0xff);
        oracle.setUint8(oSrc + i, readU8(view, src + i));
      }
      exp.fieldCopyAt408640(layer, src);
      exit408640FieldCopyAt(oracle, oLayer, oSrc);
      for (let i = 0; i < EXIT_408640_FIELD_DWORDS; i++) {
        const d = EXIT_408640_DST_FIELD_OFF + i * 4;
        const s = EXIT_408640_SRC_FIELD_OFF + i * 4;
        assert.equal(readU32(view, layer + d) >>> 0, readU32(view, src + s) >>> 0);
        assert.equal(
          oracle.getUint32(oLayer + d, true) >>> 0,
          oracle.getUint32(oSrc + s, true) >>> 0,
        );
        assert.equal(
          readU32(view, layer + d) >>> 0,
          oracle.getUint32(oLayer + d, true) >>> 0,
        );
      }

      // if_present: null src must not mutate layer
      const prior = [];
      for (let i = 0; i < 0x40; i++) prior.push(readU8(view, layer + i));
      exp.fieldCopyIfPresentAt408640(layer, 0);
      exit408640FieldCopyIfPresentAt(oracle, oLayer, 0);
      for (let i = 0; i < 0x40; i++) {
        assert.equal(readU8(view, layer + i), prior[i]);
      }

      // if_present: non-null copies
      for (let i = 0; i < 0x40; i++) {
        writeU8(view, layer + i, rnd() & 0xff);
        oracle.setUint8(oLayer + i, readU8(view, layer + i));
        writeU8(view, src + i, rnd() & 0xff);
        oracle.setUint8(oSrc + i, readU8(view, src + i));
      }
      exp.fieldCopyIfPresentAt408640(layer, src);
      exit408640FieldCopyIfPresentAt(oracle, oLayer, oSrc);
      for (let i = 0; i < EXIT_408640_FIELD_DWORDS; i++) {
        const d = EXIT_408640_DST_FIELD_OFF + i * 4;
        assert.equal(
          readU32(view, layer + d) >>> 0,
          oracle.getUint32(oLayer + d, true) >>> 0,
        );
      }
    }

    assert.equal(exp.dstFieldOff408640() >>> 0, exit408640DstFieldOff());
    assert.equal(exp.srcFieldOff408640() >>> 0, exit408640SrcFieldOff());
    assert.equal(exp.pairSlotOff408640() >>> 0, exit408640PairSlotOff());
    assert.equal(exp.fieldDwords408640() >>> 0, exit408640FieldDwords());
    assert.equal(EXIT_408640_DST_FIELD_OFF, 0x20);
    assert.equal(EXIT_408640_SRC_FIELD_OFF, 0x30);
    assert.equal(EXIT_408640_PAIR_SLOT_OFF, 0x98);
    assert.equal(EXIT_408640_FIELD_DWORDS, 4);
    assert.equal(EXIT_408640_CALLBACK_GLOBAL, 0x00c7163c);
    assert.equal(EXIT_408640_VTBL_RELEASE_OFF, 0xc);
    // fixed edges
    assert.equal(exp.sourcePresent408640(0) !== 0, false);
    assert.equal(exp.sourcePresent408640(1) !== 0, true);
    assert.equal(exp.ctrlPresent408640(0) !== 0, false);
    assert.equal(exp.callbackNeeded408640(1, 0) !== 0, false);
    assert.equal(
      exp.callbackNeeded408640(0, EXIT_408640_CALLBACK_GLOBAL) !== 0,
      false,
    );
    assert.equal(
      exp.callbackNeeded408640(1, EXIT_408640_CALLBACK_GLOBAL) !== 0,
      true,
    );
    assert.equal(exp.pairSlotPtr408640(0x1000) >>> 0, 0x1000 + 0x98);
    assert.equal(exp.dstFieldPtr408640(0x1000) >>> 0, 0x1000 + 0x20);
  }

  // ABI v11 pure-complete lower_bound / find: fixed a/b/c tree, wasm vs JS
  {
    const MAP = MEM + 0x1c00;
    const Hn = MEM + 0x1c20;
    const An = MEM + 0x1c60;
    const Bn = MEM + 0x1ca0;
    const Cn = MEM + 0x1ce0;
    const KEY = MEM + 0x1d40;
    const OUT = MEM + 0x1d60;
    const OUT_NODE = MEM + 0x1d70;
    const oMAP = 0x04;
    const oH = 0x20;
    const oA = 0x60;
    const oB = 0xa0;
    const oC = 0xe0;
    const oKEY = 0x140;
    const oOUT = 0x160;
    const oOUT_NODE = 0x170;
    const ov = new DataView(new ArrayBuffer(0x200));
    const writeSsoBoth = (wBase, oBase, s) => {
      for (let i = 0; i < 16; i++) {
        writeU8(view, wBase + i, 0);
        ov.setUint8(oBase + i, 0);
      }
      for (let i = 0; i < s.length; i++) {
        writeU8(view, wBase + i, s.charCodeAt(i));
        ov.setUint8(oBase + i, s.charCodeAt(i));
      }
      writeU32(view, wBase + EXIT_MSVC_STRING_SIZE_OFF, s.length);
      writeU32(view, wBase + EXIT_MSVC_STRING_CAP_OFF, 0xf);
      ov.setUint32(oBase + EXIT_MSVC_STRING_SIZE_OFF, s.length, true);
      ov.setUint32(oBase + EXIT_MSVC_STRING_CAP_OFF, 0xf, true);
    };
    const linkBoth = (wN, oN, wL, oL, wP, oP, wR, oR, isnil) => {
      writeU32(view, wN + EXIT_TREE_LEFT_OFF, wL);
      writeU32(view, wN + EXIT_TREE_PARENT_OFF, wP);
      writeU32(view, wN + EXIT_TREE_RIGHT_OFF, wR);
      writeU8(view, wN + EXIT_TREE_ISNIL_OFF, isnil);
      ov.setUint32(oN + EXIT_TREE_LEFT_OFF, oL, true);
      ov.setUint32(oN + EXIT_TREE_PARENT_OFF, oP, true);
      ov.setUint32(oN + EXIT_TREE_RIGHT_OFF, oR, true);
      ov.setUint8(oN + EXIT_TREE_ISNIL_OFF, isnil);
    };
    writeU32(view, MAP, Hn);
    ov.setUint32(oMAP, oH, true);
    linkBoth(Hn, oH, An, oA, Bn, oB, Cn, oC, 1);
    linkBoth(An, oA, Hn, oH, Bn, oB, Hn, oH, 0);
    writeSsoBoth(An + EXIT_MAP_NODE_KEY_OFF, oA + EXIT_MAP_NODE_KEY_OFF, "a");
    linkBoth(Bn, oB, An, oA, Hn, oH, Cn, oC, 0);
    writeSsoBoth(Bn + EXIT_MAP_NODE_KEY_OFF, oB + EXIT_MAP_NODE_KEY_OFF, "b");
    linkBoth(Cn, oC, Hn, oH, Bn, oB, Hn, oH, 0);
    writeSsoBoth(Cn + EXIT_MAP_NODE_KEY_OFF, oC + EXIT_MAP_NODE_KEY_OFF, "c");

    for (const key of ["a", "b", "c", "d", "aa", ""]) {
      writeSsoBoth(KEY, oKEY, key);
      exp.mapLowerBound(MAP, OUT, KEY);
      exitMapLowerBound(ov, oMAP, oOUT, oKEY);
      assert.equal(
        readU32(view, OUT + EXIT_LOWER_BOUND_BEST_OFF) === Bn
          ? "B"
          : readU32(view, OUT + EXIT_LOWER_BOUND_BEST_OFF) === An
            ? "A"
            : readU32(view, OUT + EXIT_LOWER_BOUND_BEST_OFF) === Cn
              ? "C"
              : readU32(view, OUT + EXIT_LOWER_BOUND_BEST_OFF) === Hn
                ? "H"
                : "?",
        ov.getUint32(oOUT + EXIT_LOWER_BOUND_BEST_OFF, true) === oB
          ? "B"
          : ov.getUint32(oOUT + EXIT_LOWER_BOUND_BEST_OFF, true) === oA
            ? "A"
            : ov.getUint32(oOUT + EXIT_LOWER_BOUND_BEST_OFF, true) === oC
              ? "C"
              : ov.getUint32(oOUT + EXIT_LOWER_BOUND_BEST_OFF, true) === oH
                ? "H"
                : "?",
        `lower_bound best mismatch key=${JSON.stringify(key)}`,
      );

      // WALK_OFF truth check (stale-state audit F7). The PE writes [edi]
      // only at init and at the loop head, so on a NON-EMPTY tree the
      // returned walk is always the last NON-NIL node examined. Asserting
      // "not nil" is PE truth, not agreement â€” the previous bug had both
      // sides storing the terminating nil child and matching each other.
      const wWalk = readU32(view, OUT + EXIT_LOWER_BOUND_WALK_OFF) >>> 0;
      const jWalk = ov.getUint32(oOUT + EXIT_LOWER_BOUND_WALK_OFF, true) >>> 0;
      assert.equal(
        readU8(view, wWalk + EXIT_TREE_ISNIL_OFF),
        0,
        `lower_bound walk must be a non-nil node key=${JSON.stringify(key)}`,
      );
      assert.equal(ov.getUint8(jWalk + EXIT_TREE_ISNIL_OFF), 0);
      assert.notEqual(wWalk, Hn); // never the header/nil sentinel
      assert.notEqual(jWalk, oH);
      // And the two sides must still agree on which node it is.
      const nameW =
        wWalk === An ? "A" : wWalk === Bn ? "B" : wWalk === Cn ? "C" : "?";
      const nameJ =
        jWalk === oA ? "A" : jWalk === oB ? "B" : jWalk === oC ? "C" : "?";
      assert.equal(
        nameW,
        nameJ,
        `lower_bound walk mismatch key=${JSON.stringify(key)}`,
      );
      assert.notEqual(nameW, "?");

      exp.mapFind69d690(MAP, OUT_NODE, KEY);
      exitMapFind69d690(ov, oMAP, oOUT_NODE, oKEY);
      const wHit =
        readU32(view, OUT_NODE) === Bn
          ? "B"
          : readU32(view, OUT_NODE) === An
            ? "A"
            : readU32(view, OUT_NODE) === Cn
              ? "C"
              : "H";
      const jHit =
        ov.getUint32(oOUT_NODE, true) === oB
          ? "B"
          : ov.getUint32(oOUT_NODE, true) === oA
            ? "A"
            : ov.getUint32(oOUT_NODE, true) === oC
              ? "C"
              : "H";
      assert.equal(wHit, jHit, `find mismatch key=${JSON.stringify(key)}`);
    }
  }

  // ABI v25: 0x00841cf0 / 0x0083abb0 / range destroy / 0x0084bfd0
  {
    const W_841 = MEM + 0xc000; // 0x700-byte residual image
    const W_83A = MEM + 0xc800; // 0x40-byte 0x0083abb0 image
    const W_84B = MEM + 0xc900; // 0x300-byte tail-jmp image
    while (W_84B + 0x400 > exp.memory.buffer.byteLength) {
      exp.memory.grow(1);
    }
    const v25 = new DataView(exp.memory.buffer);

    // Offset tables must agree bit-for-bit with the oracle.
    for (let i = 0; i <= EXIT_841CF0_P0_COUNT; i++) {
      assert.equal(exp.p0ElemOff841cf0(i) >>> 0, exit841cf0P0ElemOff(i));
    }
    for (let i = 0; i <= EXIT_841CF0_P1_COUNT; i++) {
      assert.equal(exp.p1ElemOff841cf0(i) >>> 0, exit841cf0P1ElemOff(i));
      assert.equal(
        exp.p1HostPtr841cf0(0x900000, i) >>> 0,
        exit841cf0P1HostPtr(0x900000, i),
      );
    }
    for (let i = 0; i <= EXIT_841CF0_P2_COUNT; i++) {
      assert.equal(exp.p2ElemOff841cf0(i) >>> 0, exit841cf0P2ElemOff(i));
      assert.equal(
        exp.p2HostAPtr841cf0(0x900000, i) >>> 0,
        exit841cf0P2HostAPtr(0x900000, i),
      );
      assert.equal(
        exp.p2HostBPtr841cf0(0x900000, i) >>> 0,
        exit841cf0P2HostBPtr(0x900000, i),
      );
    }
    for (let b = 0; b <= EXIT_83ABB0_BLOCK_COUNT; b++) {
      assert.equal(exp.blockBaseOff83abb0(b) >>> 0, exit83abb0BlockBaseOff(b));
    }
    for (let b = 0; b <= EXIT_84BFD0_BLOCK_COUNT; b++) {
      assert.equal(exp.blockBaseOff84bfd0(b) >>> 0, exit84bfd0BlockBaseOff(b));
      for (let i = 0; i <= EXIT_84BFD0_BLOCK_DWORDS; i++) {
        assert.equal(exp.slotOff84bfd0(b, i) >>> 0, exit84bfd0SlotOff(b, i));
      }
    }
    for (let i = 0; i <= EXIT_84BFD0_BLOCK_DWORDS; i++) {
      assert.equal(exp.slotKind84bfd0(i) >>> 0, exit84bfd0SlotKind(i));
    }
    assert.equal(exp.f32Bits84bfd0() >>> 0, exit84bfd0F32Bits());
    assert.equal(exp.rdStride709380() >>> 0, exitRangeDestroyStride709380());
    assert.equal(exp.rdStride709300() >>> 0, exitRangeDestroyStride709300());

    // Pure-complete 0x0084bfd0 over a poisoned image, plus per-block form.
    {
      const oracle = new DataView(new ArrayBuffer(0x300));
      for (let i = 0; i < 0x300; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_84B + i, b);
        oracle.setUint8(i, b);
      }
      exp.apply84bfd0(W_84B);
      exit84bfd0Apply(oracle, 0);
      for (let i = 0; i < 0x300; i++) {
        assert.equal(
          readU8(v25, W_84B + i),
          oracle.getUint8(i),
          `84bfd0 byte ${i}`,
        );
      }
      // apply_block on a standalone block must match the oracle block form.
      for (let i = 0; i < EXIT_84BFD0_BLOCK_STRIDE; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_84B + i, b);
        oracle.setUint8(i, b);
      }
      exp.applyBlock84bfd0(W_84B);
      exit84bfd0ApplyBlock(oracle, 0);
      for (let i = 0; i < EXIT_84BFD0_BLOCK_STRIDE; i++) {
        assert.equal(readU8(v25, W_84B + i), oracle.getUint8(i));
      }
    }

    // Randomized differential over the 0x00841cf0 / 0x0083abb0 pure packs
    // and the host control-flow predicates around them.
    for (let iter = 0; iter < 64; iter++) {
      const oracle841 = new DataView(new ArrayBuffer(0x700));
      for (let i = 0; i < 0x700; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_841 + i, b);
        oracle841.setUint8(i, b);
      }
      const beginAfterHost = rnd() >>> 0;
      if ((iter & 1) === 0) {
        exp.pureApply841cf0(W_841, beginAfterHost);
        exit841cf0PureApply(oracle841, 0, beginAfterHost);
      } else {
        // Same stores, driven island by island in PE order.
        exp.p0Apply841cf0(W_841);
        exit841cf0P0Apply(oracle841, 0);
        exp.headClear841cf0(W_841);
        exit841cf0HeadClear(oracle841, 0);
        exp.p1Apply841cf0(W_841);
        exit841cf0P1Apply(oracle841, 0);
        exp.p2Apply841cf0(W_841);
        exit841cf0P2Apply(oracle841, 0);
        exp.vecClearEnd841cf0(W_841 + EXIT_841CF0_VEC_END_OFF, beginAfterHost);
        exit841cf0VecClearEnd(oracle841, 0, beginAfterHost);
        exp.word6acClear841cf0(W_841 + EXIT_841CF0_WORD_6AC_OFF);
        exit841cf0Word6acClear(oracle841, 0);
        exp.terminalClear841cf0(W_841 + EXIT_841CF0_TERMINAL_OFF);
        exit841cf0TerminalClear(oracle841, 0);
      }
      for (let i = 0; i < 0x700; i++) {
        assert.equal(
          readU8(v25, W_841 + i),
          oracle841.getUint8(i),
          `841cf0 byte ${i} iter ${iter}`,
        );
      }

      // Single-element entry points must reproduce one element exactly.
      const eIdx = rnd() % EXIT_841CF0_P0_COUNT;
      const eOff = exit841cf0P0ElemOff(eIdx);
      for (let i = 0; i < EXIT_841CF0_P0_STRIDE; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_841 + eOff + i, b);
        oracle841.setUint8(eOff + i, b);
      }
      exp.p0Elem841cf0(W_841 + eOff);
      exit841cf0P0Elem(oracle841, eOff);
      const p1Idx = rnd() % EXIT_841CF0_P1_COUNT;
      const p1Off = exit841cf0P1ElemOff(p1Idx);
      exp.p1Pre841cf0(W_841 + p1Off);
      exit841cf0P1Pre(oracle841, p1Off);
      const p2Idx = rnd() % EXIT_841CF0_P2_COUNT;
      const p2Off = exit841cf0P2ElemOff(p2Idx);
      exp.p2Pre841cf0(W_841 + p2Off);
      exit841cf0P2Pre(oracle841, p2Off);
      for (let i = 0; i < 0x700; i++) {
        assert.equal(readU8(v25, W_841 + i), oracle841.getUint8(i));
      }

      // 0x0083abb0 block pack.
      const oracle83a = new DataView(new ArrayBuffer(0x40));
      for (let i = 0; i < 0x40; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_83A + i, b);
        oracle83a.setUint8(i, b);
      }
      const begins = [rnd() >>> 0, rnd() >>> 0];
      const beginsPtr = MEM + 0xc780;
      writeU32(v25, beginsPtr, begins[0]);
      writeU32(v25, beginsPtr + 4, begins[1]);
      exp.apply83abb0(W_83A, beginsPtr);
      exit83abb0Apply(oracle83a, 0, begins);
      for (let i = 0; i < 0x40; i++) {
        assert.equal(
          readU8(v25, W_83A + i),
          oracle83a.getUint8(i),
          `83abb0 byte ${i} iter ${iter}`,
        );
      }
      const blk = rnd() % EXIT_83ABB0_BLOCK_COUNT;
      const blkOff = exit83abb0BlockBaseOff(blk);
      const blkBegin = rnd() >>> 0;
      for (let i = 0; i < EXIT_83ABB0_BLOCK_STRIDE; i++) {
        const b = rnd() & 0xff;
        writeU8(v25, W_83A + blkOff + i, b);
        oracle83a.setUint8(blkOff + i, b);
      }
      exp.blockPost83abb0(W_83A + blkOff, blkBegin);
      exit83abb0BlockPost(oracle83a, blkOff, blkBegin);
      writeU8(v25, W_83A + EXIT_83ABB0_TERMINAL_OFF, rnd() & 0xff);
      oracle83a.setUint8(
        EXIT_83ABB0_TERMINAL_OFF,
        readU8(v25, W_83A + EXIT_83ABB0_TERMINAL_OFF),
      );
      exp.terminalClear83abb0(W_83A + EXIT_83ABB0_TERMINAL_OFF);
      exit83abb0TerminalClear(oracle83a, 0);
      for (let i = 0; i < 0x40; i++) {
        assert.equal(readU8(v25, W_83A + i), oracle83a.getUint8(i));
      }

      // Control-flow predicates and pointer math.
      const pairValue = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
      assert.equal(
        exp.p2HostNeeded841cf0(pairValue) !== 0,
        exit841cf0P2HostNeeded(pairValue),
      );
      const base = rnd() >>> 0;
      const stride841 = EXIT_841CF0_VEC_ELEM_STRIDE;
      const n = rnd() % 6;
      const endOk = (base + n * stride841) >>> 0;
      const endBad = (base + n * stride841 + 1) >>> 0;
      assert.equal(
        exp.vecWalkNeeded841cf0(base, endOk) !== 0,
        exit841cf0VecWalkNeeded(base, endOk),
      );
      assert.equal(
        exp.vecWalkContinue841cf0(endOk, endOk) !== 0,
        exit841cf0VecWalkContinue(endOk, endOk),
      );
      assert.equal(
        exp.vecElemCount841cf0(base, endOk) >>> 0,
        exit841cf0VecElemCount(base, endOk),
      );
      assert.equal(
        exp.vecElemCount841cf0(base, endBad) >>> 0,
        exit841cf0VecElemCount(base, endBad),
      );
      assert.equal(
        exp.vecElemHostPtr841cf0(base) >>> 0,
        exit841cf0VecElemHostPtr(base),
      );
      assert.equal(exp.vecNext841cf0(base) >>> 0, exit841cf0VecNext(base));

      const end83 = (base + (rnd() % 4) * EXIT_83ABB0_ELEM_STRIDE) >>> 0;
      assert.equal(
        exp.walkNeeded83abb0(base, end83) !== 0,
        exit83abb0WalkNeeded(base, end83),
      );
      assert.equal(
        exp.walkContinue83abb0(end83, end83) !== 0,
        exit83abb0WalkContinue(end83, end83),
      );
      assert.equal(
        exp.elemCount83abb0(base, end83) >>> 0,
        exit83abb0ElemCount(base, end83),
      );
      assert.equal(
        exp.elemHostPtr83abb0(base) >>> 0,
        exit83abb0ElemHostPtr(base),
      );
      assert.equal(exp.elemNext83abb0(base) >>> 0, exit83abb0ElemNext(base));

      const ctrl = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
      const al = rnd() & 0xff;
      const cbGlobal = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
      const rdStride =
        (rnd() & 1) === 0 ? EXIT_709380_ELEM_STRIDE : EXIT_709300_ELEM_STRIDE;
      assert.equal(
        exp.rdLoopNeeded(base, end83) !== 0,
        exitRangeDestroyLoopNeeded(base, end83),
      );
      assert.equal(
        exp.rdContinue(base, end83) !== 0,
        exitRangeDestroyContinue(base, end83),
      );
      assert.equal(exp.rdCtrlPtr(base) >>> 0, exitRangeDestroyCtrlPtr(base));
      assert.equal(exp.rdCbArgPtr(base) >>> 0, exitRangeDestroyCbArgPtr(base));
      assert.equal(
        exp.rdNext(base, rdStride) >>> 0,
        exitRangeDestroyNext(base, rdStride),
      );
      assert.equal(
        exp.rdCtrlPresent(ctrl) !== 0,
        exitRangeDestroyCtrlPresent(ctrl),
      );
      assert.equal(exp.rdVirtualOk(al) !== 0, exitRangeDestroyVirtualOk(al));
      assert.equal(
        exp.rdCallbackNeeded(ctrl, al, cbGlobal) !== 0,
        exitRangeDestroyCallbackNeeded(ctrl, al, cbGlobal),
      );
    }
  }

  // ABI v26: 0x00840f70 buffer free + 0x00709150 pair replace
  {
    const W_840 = MEM + 0xd000; // 0x00840f70 this image (2 slots)
    const W_STATS = MEM + 0xd040; // heap accounting {lo,hi}
    const W_OBJ = MEM + 0xd080; // 0x00709150 new object
    const W_PAIR = MEM + 0xd100; // 0x00709150 this pair
    const P840 = MEM + 0xd200; // IsaacExit840f70SlotPlan
    const P709 = MEM + 0xd300; // IsaacExit709150Plan
    while (P709 + 0x100 > exp.memory.buffer.byteLength) {
      exp.memory.grow(1);
    }
    const v26 = new DataView(exp.memory.buffer);

    assert.equal(exp.allocSize709150() >>> 0, exit709150AllocSize());
    for (let i = 0; i <= EXIT_840F70_SLOT_COUNT; i++) {
      assert.equal(exp.slotOff840f70(i) >>> 0, exit840f70SlotOff(i));
      assert.equal(
        exp.slotPtr840f70(0x700000, i) >>> 0,
        exit840f70SlotPtr(0x700000, i),
      );
    }

    for (let iter = 0; iter < 96; iter++) {
      // --- 0x00840f70 ---
      // Bias towards zero / small / huge so the borrow path is exercised.
      const pick = () => {
        const r = rnd();
        switch (r & 7) {
          case 0:
            return 0;
          case 1:
            return 1;
          case 2:
            return 0xffffffff;
          case 3:
            return 4;
          default:
            return rnd() >>> 0;
        }
      };
      const slotValue = pick();
      const headerSize = pick();
      const statsLo = pick();
      const statsHi = pick();
      const statsGlobal = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;

      assert.equal(
        exp.freeNeeded840f70(slotValue) !== 0,
        exit840f70FreeNeeded(slotValue),
      );
      assert.equal(
        exp.heapStatsBase840f70(statsGlobal) >>> 0,
        exit840f70HeapStatsBase(statsGlobal),
      );
      assert.equal(
        exp.freeBasePtr840f70(slotValue) >>> 0,
        exit840f70FreeBasePtr(slotValue),
      );
      assert.equal(
        exp.headerSizePtr840f70(slotValue) >>> 0,
        exit840f70HeaderSizePtr(slotValue),
      );
      assert.equal(
        exp.statsSubLo840f70(statsLo, headerSize) >>> 0,
        exit840f70StatsSubLo(statsLo, headerSize),
      );
      assert.equal(
        exp.statsSubBorrow840f70(statsLo, headerSize) >>> 0,
        exit840f70StatsSubBorrow(statsLo, headerSize),
      );
      assert.equal(
        exp.statsSubHi840f70(statsLo, statsHi, headerSize) >>> 0,
        exit840f70StatsSubHi(statsLo, statsHi, headerSize),
      );

      // Borrow boundary. `sub x, x` clears CF, so lo == size must NOT
      // borrow: the compare is strict. The randomized draws above only hit
      // lo == size by luck, so force it â€” and assert the PE truth directly,
      // not just agreement with the oracle.
      for (const eq of [statsLo, headerSize, 0, 1, 4, 0xffffffff]) {
        assert.equal(exp.statsSubBorrow840f70(eq, eq) >>> 0, 0);
        assert.equal(
          exp.statsSubBorrow840f70(eq, eq) >>> 0,
          exit840f70StatsSubBorrow(eq, eq),
        );
        assert.equal(exp.statsSubLo840f70(eq, eq) >>> 0, 0);
        assert.equal(
          exp.statsSubHi840f70(eq, statsHi, eq) >>> 0,
          statsHi >>> 0,
        );
        assert.equal(
          exp.statsSubHi840f70(eq, statsHi, eq) >>> 0,
          exit840f70StatsSubHi(eq, statsHi, eq),
        );
        // One past the boundary must borrow.
        const over = (eq + 1) >>> 0;
        if (over !== 0) {
          assert.equal(exp.statsSubBorrow840f70(eq, over) >>> 0, 1);
          assert.equal(
            exp.statsSubBorrow840f70(eq, over) >>> 0,
            exit840f70StatsSubBorrow(eq, over),
          );
        }
        // One below the boundary must not borrow.
        if ((eq >>> 0) !== 0) {
          const under = (eq - 1) >>> 0;
          assert.equal(exp.statsSubBorrow840f70(eq, under) >>> 0, 0);
          assert.equal(
            exp.statsSubBorrow840f70(eq, under) >>> 0,
            exit840f70StatsSubBorrow(eq, under),
          );
        }
      }

      // In-memory 64-bit subtract must match the BigInt oracle exactly.
      {
        const oracle = new DataView(new ArrayBuffer(16));
        writeU32(v26, W_STATS + EXIT_840F70_STATS_LO_OFF, statsLo);
        writeU32(v26, W_STATS + EXIT_840F70_STATS_HI_OFF, statsHi);
        oracle.setUint32(EXIT_840F70_STATS_LO_OFF, statsLo >>> 0, true);
        oracle.setUint32(EXIT_840F70_STATS_HI_OFF, statsHi >>> 0, true);
        exp.statsSubAt840f70(W_STATS, headerSize);
        exit840f70StatsSubAt(oracle, 0, headerSize);
        assert.equal(
          readU32(v26, W_STATS + EXIT_840F70_STATS_LO_OFF) >>> 0,
          oracle.getUint32(EXIT_840F70_STATS_LO_OFF, true) >>> 0,
          `840f70 stats lo iter ${iter}`,
        );
        assert.equal(
          readU32(v26, W_STATS + EXIT_840F70_STATS_HI_OFF) >>> 0,
          oracle.getUint32(EXIT_840F70_STATS_HI_OFF, true) >>> 0,
          `840f70 stats hi iter ${iter}`,
        );
      }

      // Slot image: both slots end at 0, free count must agree.
      {
        const oracle = new DataView(new ArrayBuffer(16));
        const s0 = (rnd() & 1) === 0 ? 0 : rnd() >>> 0;
        const s1 = (rnd() & 1) === 0 ? 0 : rnd() >>> 0;
        writeU32(v26, W_840 + 0, s0);
        writeU32(v26, W_840 + 4, s1);
        writeU32(v26, W_840 + 8, 0xa5a5a5a5); // guard past the two slots
        oracle.setUint32(0, s0 >>> 0, true);
        oracle.setUint32(4, s1 >>> 0, true);
        oracle.setUint32(8, 0xa5a5a5a5, true);
        const wFrees = exp.apply840f70(W_840) >>> 0;
        const jFrees = exit840f70Apply(oracle, 0);
        assert.equal(wFrees, jFrees, `840f70 free count iter ${iter}`);
        for (let i = 0; i < 12; i++) {
          assert.equal(readU8(v26, W_840 + i), oracle.getUint8(i));
        }
        assert.equal(readU32(v26, W_840 + 8) >>> 0, 0xa5a5a5a5);
      }

      // Single-slot clear entry point.
      {
        writeU32(v26, W_840 + 4, rnd() >>> 0);
        exp.slotClear840f70(W_840 + 4);
        assert.equal(readU32(v26, W_840 + 4) >>> 0, 0);
      }

      // Per-slot plan struct: 11 dwords.
      {
        const idx = rnd() % (EXIT_840F70_SLOT_COUNT + 1);
        const jp = exit840f70SlotPlan(
          0x8000,
          idx,
          slotValue,
          statsGlobal,
          headerSize,
          statsLo,
          statsHi,
        );
        exp.slotPlan840f70(
          P840,
          0x8000,
          idx,
          slotValue,
          statsGlobal,
          headerSize,
          statsLo,
          statsHi,
        );
        assert.equal(readU32(v26, P840 + 0) >>> 0, jp.index);
        assert.equal(readU32(v26, P840 + 4) >>> 0, jp.slotPtr);
        assert.equal(readU32(v26, P840 + 8) >>> 0, jp.slotValue);
        assert.equal(readI32(v26, P840 + 12) !== 0, jp.freeNeeded);
        assert.equal(readU32(v26, P840 + 16) >>> 0, jp.freeBasePtr);
        assert.equal(readU32(v26, P840 + 20) >>> 0, jp.statsBase);
        assert.equal(readU32(v26, P840 + 24) >>> 0, jp.statsLoPtr);
        assert.equal(readU32(v26, P840 + 28) >>> 0, jp.statsHiPtr);
        assert.equal(readU32(v26, P840 + 32) >>> 0, jp.headerSize);
        assert.equal(readU32(v26, P840 + 36) >>> 0, jp.statsLoAfter);
        assert.equal(readU32(v26, P840 + 40) >>> 0, jp.statsHiAfter);
      }

      // --- 0x00709150 ---
      const allocPtr = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
      const oldObj = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
      const vAl = rnd() & 0xff;
      const cbFn709 =
        (rnd() & 3) === 0 ? 0 : (rnd() & 1) === 0 ? EXIT_709150_CALLBACK_GLOBAL : rnd() >>> 0;

      assert.equal(
        exp.allocOk709150(allocPtr) !== 0,
        exit709150AllocOk(allocPtr),
      );
      assert.equal(
        exp.newObjectValue709150(allocPtr) >>> 0,
        exit709150NewObjectValue(allocPtr),
      );
      assert.equal(
        exp.oldObjectPresent709150(oldObj) !== 0,
        exit709150OldObjectPresent(oldObj),
      );
      assert.equal(
        exp.virtualOk709150(vAl) !== 0,
        exit709150VirtualOk(vAl),
      );
      assert.equal(
        exp.callbackNeeded709150(oldObj, vAl, cbFn709) !== 0,
        exit709150CallbackNeeded(oldObj, vAl, cbFn709),
      );

      // Post-ctor overwrite over a poisoned object.
      {
        const oracle = new DataView(new ArrayBuffer(0x20));
        for (let i = 0; i < 0x20; i++) {
          const b = rnd() & 0xff;
          writeU8(v26, W_OBJ + i, b);
          oracle.setUint8(i, b);
        }
        exp.objectFinishApply709150(W_OBJ);
        exit709150ObjectFinishApply(oracle, 0);
        for (let i = 0; i < 0x20; i++) {
          assert.equal(
            readU8(v26, W_OBJ + i),
            oracle.getUint8(i),
            `709150 object byte ${i} iter ${iter}`,
          );
        }
        assert.equal(readU32(v26, W_OBJ) >>> 0, EXIT_709150_VTABLE >>> 0);
      }

      // Terminal pair store.
      {
        const oracle = new DataView(new ArrayBuffer(0x10));
        for (let i = 0; i < 0x10; i++) {
          const b = rnd() & 0xff;
          writeU8(v26, W_PAIR + i, b);
          oracle.setUint8(i, b);
        }
        const newObj = exit709150NewObjectValue(allocPtr);
        exp.pairApplyBase709150(W_PAIR, newObj);
        exit709150PairApplyBase(oracle, 0, newObj);
        for (let i = 0; i < 0x10; i++) {
          assert.equal(readU8(v26, W_PAIR + i), oracle.getUint8(i));
        }
        assert.equal(readU32(v26, W_PAIR + EXIT_709150_PAIR_VALUE_OFF) >>> 0, 0);
        assert.equal(
          readU32(v26, W_PAIR + EXIT_709150_PAIR_OBJ_OFF) >>> 0,
          newObj,
        );
      }

      // Plan struct: 16 dwords.
      {
        const jp = exit709150Plan(0x5000, allocPtr, oldObj, vAl, cbFn709);
        exp.plan709150(P709, 0x5000, allocPtr, oldObj, vAl, cbFn709);
        assert.equal(readU32(v26, P709 + 0) >>> 0, jp.thisAddr);
        assert.equal(readU32(v26, P709 + 4) >>> 0, jp.allocSize);
        assert.equal(readU32(v26, P709 + 8) >>> 0, jp.allocPtr);
        assert.equal(readI32(v26, P709 + 12) !== 0, jp.allocOk);
        assert.equal(readU32(v26, P709 + 16) >>> 0, jp.newObject);
        assert.equal(readI32(v26, P709 + 20) !== 0, jp.ctorHostNeeded);
        assert.equal(readI32(v26, P709 + 24) !== 0, jp.finishNeeded);
        assert.equal(readU32(v26, P709 + 28) >>> 0, jp.vtableValue);
        assert.equal(readU32(v26, P709 + 32) >>> 0, jp.oldObject);
        assert.equal(readI32(v26, P709 + 36) !== 0, jp.oldObjectPresent);
        assert.equal(readI32(v26, P709 + 40) !== 0, jp.virtualOk);
        assert.equal(readI32(v26, P709 + 44) !== 0, jp.callbackNeeded);
        assert.equal(readU32(v26, P709 + 48) >>> 0, jp.valueSlotPtr);
        assert.equal(readU32(v26, P709 + 52) >>> 0, jp.objSlotPtr);
        assert.equal(readU32(v26, P709 + 56) >>> 0, jp.valueSlotAfter);
        assert.equal(readU32(v26, P709 + 60) >>> 0, jp.objSlotAfter);
      }
    }
  }

  // ABI v27: teardown residual 0x00a1ad90 + host 0x00a648b0 call shape
  {
    const W_A1A = MEM + 0xe000; // 0x00a1ad90 this image
    const W_NODE = MEM + 0xe100; // tree sentinel node
    const PA1A = MEM + 0xe200; // IsaacExitA1ad90Plan
    while (PA1A + 0x100 > exp.memory.buffer.byteLength) {
      exp.memory.grow(1);
    }
    const v27 = new DataView(exp.memory.buffer);

    assert.equal(exp.elemSizeA1ad90() >>> 0, exitA1ad90ElemSize());
    assert.equal(exp.elemDtorA1ad90() >>> 0, exitA1ad90ElemDtor());
    assert.equal(exp.modeFreeA648b0() >>> 0, exitA648b0ModeFree());

    for (let iter = 0; iter < 96; iter++) {
      const pick = () => {
        const r = rnd();
        switch (r & 7) {
          case 0:
            return 0;
          case 1:
            return 1;
          case 2:
            return 0xffffffff;
          case 3:
            return 0x20000000; // *8 wraps to 0
          case 4:
            return 4;
          default:
            return rnd() >>> 0;
        }
      };
      const ptr28 = pick();
      const arr3c = pick();
      const countBefore = pick();
      const countAfter = pick();
      const treeHead = pick();
      const thisAddr = rnd() >>> 0;

      assert.equal(
        exp.blockANeededA1ad90(ptr28) !== 0,
        exitA1ad90BlockANeeded(ptr28),
      );
      assert.equal(
        exp.blockBNeededA1ad90(arr3c) !== 0,
        exitA1ad90BlockBNeeded(arr3c),
      );
      assert.equal(
        exp.headerPtrA1ad90(arr3c) >>> 0,
        exitA1ad90HeaderPtr(arr3c),
      );
      assert.equal(
        exp.dtorCountArgA1ad90(countBefore) >>> 0,
        exitA1ad90DtorCountArg(countBefore),
      );
      assert.equal(
        exp.freeSizeA1ad90(countAfter) >>> 0,
        exitA1ad90FreeSize(countAfter),
        `a1ad90 free size iter ${iter}`,
      );
      assert.equal(
        exp.treeObjPtrA1ad90(thisAddr) >>> 0,
        exitA1ad90TreeObjPtr(thisAddr),
      );
      assert.equal(
        exp.treeHeadPtrA1ad90(thisAddr) >>> 0,
        exitA1ad90TreeHeadPtr(thisAddr),
      );
      assert.equal(
        exp.treeSizePtrA1ad90(thisAddr) >>> 0,
        exitA1ad90TreeSizePtr(thisAddr),
      );
      assert.equal(
        exp.treeRootPtrA1ad90(treeHead) >>> 0,
        exitA1ad90TreeRootPtr(treeHead),
      );

      // this-object stores + host bitmask over a poisoned image.
      {
        const oracle = new DataView(new ArrayBuffer(0x50));
        for (let i = 0; i < 0x50; i++) {
          const b = rnd() & 0xff;
          writeU8(v27, W_A1A + i, b);
          oracle.setUint8(i, b);
        }
        writeU32(v27, W_A1A + EXIT_A1AD90_BLOCK_A_OFF, ptr28);
        writeU32(v27, W_A1A + EXIT_A1AD90_BLOCK_B_OFF, arr3c);
        oracle.setUint32(EXIT_A1AD90_BLOCK_A_OFF, ptr28 >>> 0, true);
        oracle.setUint32(EXIT_A1AD90_BLOCK_B_OFF, arr3c >>> 0, true);
        const wHosts = exp.applyThisA1ad90(W_A1A) >>> 0;
        const jHosts = exitA1ad90ApplyThis(oracle, 0);
        assert.equal(wHosts, jHosts, `a1ad90 host bitmask iter ${iter}`);
        for (let i = 0; i < 0x50; i++) {
          assert.equal(
            readU8(v27, W_A1A + i),
            oracle.getUint8(i),
            `a1ad90 this byte ${i} iter ${iter}`,
          );
        }
      }

      // Sentinel reset over a poisoned node.
      {
        const oracle = new DataView(new ArrayBuffer(0x20));
        for (let i = 0; i < 0x20; i++) {
          const b = rnd() & 0xff;
          writeU8(v27, W_NODE + i, b);
          oracle.setUint8(i, b);
        }
        exp.treeResetAtA1ad90(W_NODE, treeHead);
        exitA1ad90TreeResetAt(oracle, 0, treeHead);
        for (let i = 0; i < 0x20; i++) {
          assert.equal(
            readU8(v27, W_NODE + i),
            oracle.getUint8(i),
            `a1ad90 node byte ${i} iter ${iter}`,
          );
        }
      }

      // Individual pure stores.
      {
        writeU32(v27, W_A1A + EXIT_A1AD90_BLOCK_A_OFF, rnd() >>> 0);
        exp.blockAClearA1ad90(W_A1A + EXIT_A1AD90_BLOCK_A_OFF);
        assert.equal(readU32(v27, W_A1A + EXIT_A1AD90_BLOCK_A_OFF) >>> 0, 0);
        writeU32(v27, W_A1A + EXIT_A1AD90_BLOCK_B_OFF, rnd() >>> 0);
        exp.blockBClearA1ad90(W_A1A + EXIT_A1AD90_BLOCK_B_OFF);
        assert.equal(readU32(v27, W_A1A + EXIT_A1AD90_BLOCK_B_OFF) >>> 0, 0);
        writeU32(v27, W_A1A + EXIT_A1AD90_TREE_SIZE_OFF, rnd() >>> 0);
        exp.treeSizeClearA1ad90(W_A1A + EXIT_A1AD90_TREE_SIZE_OFF);
        assert.equal(readU32(v27, W_A1A + EXIT_A1AD90_TREE_SIZE_OFF) >>> 0, 0);
      }

      // Terminal pack keeps the three bytes after the BYTE store.
      {
        const oracle = new DataView(new ArrayBuffer(0x50));
        for (let i = 0; i < 0x50; i++) {
          const b = rnd() & 0xff;
          writeU8(v27, W_A1A + i, b);
          oracle.setUint8(i, b);
        }
        exp.terminalA1ad90(W_A1A);
        exitA1ad90Terminal(oracle, 0);
        for (let i = 0; i < 0x50; i++) {
          assert.equal(readU8(v27, W_A1A + i), oracle.getUint8(i));
        }
      }

      // Plan struct: 16 dwords.
      {
        const jp = exitA1ad90Plan(
          thisAddr,
          ptr28,
          arr3c,
          countBefore,
          countAfter,
          treeHead,
        );
        exp.planA1ad90(
          PA1A,
          thisAddr,
          ptr28,
          arr3c,
          countBefore,
          countAfter,
          treeHead,
        );
        assert.equal(readU32(v27, PA1A + 0) >>> 0, jp.thisAddr);
        assert.equal(readU32(v27, PA1A + 4) >>> 0, jp.ptr28);
        assert.equal(readI32(v27, PA1A + 8) !== 0, jp.blockANeeded);
        assert.equal(readU32(v27, PA1A + 12) >>> 0, jp.arr3c);
        assert.equal(readI32(v27, PA1A + 16) !== 0, jp.blockBNeeded);
        assert.equal(readU32(v27, PA1A + 20) >>> 0, jp.headerPtr);
        assert.equal(readU32(v27, PA1A + 24) >>> 0, jp.dtorBase);
        assert.equal(readU32(v27, PA1A + 28) >>> 0, jp.dtorElemSize);
        assert.equal(readU32(v27, PA1A + 32) >>> 0, jp.dtorCount);
        assert.equal(readU32(v27, PA1A + 36) >>> 0, jp.dtorFn);
        assert.equal(readU32(v27, PA1A + 40) >>> 0, jp.freeBasePtr);
        assert.equal(readU32(v27, PA1A + 44) >>> 0, jp.freeSize);
        assert.equal(readU32(v27, PA1A + 48) >>> 0, jp.treeObjPtr);
        assert.equal(readU32(v27, PA1A + 52) >>> 0, jp.treeHead);
        assert.equal(readU32(v27, PA1A + 56) >>> 0, jp.treeRootPtr);
        assert.equal(readU32(v27, PA1A + 60) >>> 0, jp.treeSizePtr);
        // Recapture guard: when the two counts differ and block B runs,
        // the plan's free size must follow the POST-call count.
        if (jp.blockBNeeded && (countBefore >>> 0) !== (countAfter >>> 0)) {
          assert.equal(
            readU32(v27, PA1A + 44) >>> 0,
            exitA1ad90FreeSize(countAfter),
          );
          if (
            exitA1ad90FreeSize(countAfter) !== exitA1ad90FreeSize(countBefore)
          ) {
            assert.notEqual(
              readU32(v27, PA1A + 44) >>> 0,
              exitA1ad90FreeSize(countBefore),
            );
          }
        }
      }

      // Host 0x00a648b0 call shape.
      {
        const ecx = rnd() >>> 0;
        const edx = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
        const g = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
        assert.equal(
          exp.modeFromClA648b0(ecx) >>> 0,
          exitA648b0ModeFromCl(ecx),
          `a648b0 mode iter ${iter}`,
        );
        // Only the low byte may influence the result.
        assert.equal(
          exp.modeFromClA648b0(ecx) >>> 0,
          exp.modeFromClA648b0((ecx & 0xff) >>> 0) >>> 0,
        );
        assert.equal(
          exp.mode1FreeNeededA648b0(edx) !== 0,
          exitA648b0Mode1FreeNeeded(edx),
        );
        assert.equal(
          exp.mode1HeaderSizePtrA648b0(edx) >>> 0,
          exitA648b0Mode1HeaderSizePtr(edx),
        );
        assert.equal(
          exp.mode1FreeBasePtrA648b0(edx) >>> 0,
          exitA648b0Mode1FreeBasePtr(edx),
        );
        assert.equal(
          exp.heapStatsBaseA648b0(g) >>> 0,
          exitA648b0HeapStatsBase(g),
        );
        // v26 cross-check: identical accounting arithmetic.
        assert.equal(
          exp.heapStatsBaseA648b0(g) >>> 0,
          exp.heapStatsBase840f70(g) >>> 0,
        );
      }
    }
  }

  // ABI v28: pair ctor 0x0040c4a0 + recursive tree _Erase 0x00415800
  {
    const W_PAIR28 = MEM + 0xf000; // 0x0040c4a0 pair
    const W_OBJ28 = MEM + 0xf040; // new object
    const P40C = MEM + 0xf100; // IsaacExit40c4a0Plan (19 dwords)
    const W_TREE = MEM + 0xf200; // tree image
    const W_ORDER = MEM + 0xf800; // free-order output buffer
    while (W_ORDER + 0x400 > exp.memory.buffer.byteLength) {
      exp.memory.grow(1);
    }
    const v28 = new DataView(exp.memory.buffer);

    assert.equal(exp.allocSize40c4a0() >>> 0, exit40c4a0AllocSize());
    assert.equal(exp.freeSize415800() >>> 0, exit415800FreeSize());

    for (let iter = 0; iter < 96; iter++) {
      const pick = () => {
        const r = rnd();
        switch (r & 7) {
          case 0:
            return 0;
          case 1:
            return 1;
          case 2:
            return 0xffffffff;
          default:
            return rnd() >>> 0;
        }
      };
      const arg = pick();
      const allocPtr = pick();
      const oldObj = pick();
      const vAl = rnd() & 0xff;
      const cbFn =
        (rnd() & 3) === 0
          ? 0
          : (rnd() & 1) === 0
            ? EXIT_40C4A0_CALLBACK_GLOBAL
            : rnd() >>> 0;
      const thisAddr = rnd() >>> 0;

      assert.equal(
        exp.allocOk40c4a0(allocPtr) !== 0,
        exit40c4a0AllocOk(allocPtr),
      );
      assert.equal(
        exp.newObjectValue40c4a0(allocPtr) >>> 0,
        exit40c4a0NewObjectValue(allocPtr),
      );
      assert.equal(
        exp.oldObjectPresent40c4a0(oldObj) !== 0,
        exit40c4a0OldObjectPresent(oldObj),
      );
      assert.equal(exp.virtualOk40c4a0(vAl) !== 0, exit40c4a0VirtualOk(vAl));
      assert.equal(
        exp.callbackNeeded40c4a0(oldObj, vAl, cbFn) !== 0,
        exit40c4a0CallbackNeeded(oldObj, vAl, cbFn),
      );
      assert.equal(
        exp.returnValue40c4a0(thisAddr) >>> 0,
        exit40c4a0ReturnValue(thisAddr),
      );

      // Entry zero over a poisoned pair.
      {
        const oracle = new DataView(new ArrayBuffer(0x10));
        for (let i = 0; i < 0x10; i++) {
          const b = rnd() & 0xff;
          writeU8(v28, W_PAIR28 + i, b);
          oracle.setUint8(i, b);
        }
        exp.entryZeroAt40c4a0(W_PAIR28);
        exit40c4a0EntryZeroAt(oracle, 0);
        for (let i = 0; i < 0x10; i++) {
          assert.equal(readU8(v28, W_PAIR28 + i), oracle.getUint8(i));
        }
        // PE truth: both slots are zero after the entry store.
        assert.equal(readU32(v28, W_PAIR28 + EXIT_40C4A0_PAIR_VALUE_OFF) >>> 0, 0);
        assert.equal(readU32(v28, W_PAIR28 + EXIT_40C4A0_PAIR_OBJ_OFF) >>> 0, 0);
      }

      // Post-ctor overwrite.
      {
        const oracle = new DataView(new ArrayBuffer(0x20));
        for (let i = 0; i < 0x20; i++) {
          const b = rnd() & 0xff;
          writeU8(v28, W_OBJ28 + i, b);
          oracle.setUint8(i, b);
        }
        exp.objectFinishApply40c4a0(W_OBJ28, arg);
        exit40c4a0ObjectFinishApply(oracle, 0, arg);
        for (let i = 0; i < 0x20; i++) {
          assert.equal(readU8(v28, W_OBJ28 + i), oracle.getUint8(i));
        }
      }

      // Terminal pair store.
      {
        const oracle = new DataView(new ArrayBuffer(0x10));
        for (let i = 0; i < 0x10; i++) {
          const b = rnd() & 0xff;
          writeU8(v28, W_PAIR28 + i, b);
          oracle.setUint8(i, b);
        }
        const newObj = exit40c4a0NewObjectValue(allocPtr);
        exp.pairApplyBase40c4a0(W_PAIR28, newObj, arg);
        exit40c4a0PairApplyBase(oracle, 0, newObj, arg);
        for (let i = 0; i < 0x10; i++) {
          assert.equal(readU8(v28, W_PAIR28 + i), oracle.getUint8(i));
        }
        // PE truth: the value slot carries the stack arg, not zero.
        assert.equal(
          readU32(v28, W_PAIR28 + EXIT_40C4A0_PAIR_VALUE_OFF) >>> 0,
          arg >>> 0,
        );
      }

      // Plan struct: 19 dwords.
      {
        const jp = exit40c4a0Plan(thisAddr, arg, allocPtr, oldObj, vAl, cbFn);
        exp.plan40c4a0(P40C, thisAddr, arg, allocPtr, oldObj, vAl, cbFn);
        assert.equal(readU32(v28, P40C + 0) >>> 0, jp.thisAddr);
        assert.equal(readU32(v28, P40C + 4) >>> 0, jp.arg);
        assert.equal(readU32(v28, P40C + 8) >>> 0, jp.allocSize);
        assert.equal(readU32(v28, P40C + 12) >>> 0, jp.allocPtr);
        assert.equal(readI32(v28, P40C + 16) !== 0, jp.allocOk);
        assert.equal(readU32(v28, P40C + 20) >>> 0, jp.newObject);
        assert.equal(readI32(v28, P40C + 24) !== 0, jp.ctorHostNeeded);
        assert.equal(readI32(v28, P40C + 28) !== 0, jp.finishNeeded);
        assert.equal(readU32(v28, P40C + 32) >>> 0, jp.vtableValue);
        assert.equal(readU32(v28, P40C + 36) >>> 0, jp.argSlotPtr);
        assert.equal(readU32(v28, P40C + 40) >>> 0, jp.oldObject);
        assert.equal(readI32(v28, P40C + 44) !== 0, jp.oldObjectPresent);
        assert.equal(readI32(v28, P40C + 48) !== 0, jp.virtualOk);
        assert.equal(readI32(v28, P40C + 52) !== 0, jp.callbackNeeded);
        assert.equal(readU32(v28, P40C + 56) >>> 0, jp.valueSlotPtr);
        assert.equal(readU32(v28, P40C + 60) >>> 0, jp.objSlotPtr);
        assert.equal(readU32(v28, P40C + 64) >>> 0, jp.valueSlotAfter);
        assert.equal(readU32(v28, P40C + 68) >>> 0, jp.objSlotAfter);
        assert.equal(readU32(v28, P40C + 72) >>> 0, jp.returnValue);
        // The gate must follow the recaptured value, not the entry zero.
        assert.equal(
          readI32(v28, P40C + 44) !== 0,
          (oldObj >>> 0) !== 0,
          `40c4a0 old-object gate iter ${iter}`,
        );
      }

      // 0x00415800 predicates and pointer math.
      {
        const node = rnd() >>> 0;
        const isnil = rnd() & 0xff;
        const ctrl = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
        const al = rnd() & 0xff;
        const g = (rnd() & 3) === 0 ? 0 : rnd() >>> 0;
        assert.equal(
          exp.walkContinue415800(isnil) !== 0,
          exit415800WalkContinue(isnil),
        );
        assert.equal(
          exp.recurseNodePtr415800(node) >>> 0,
          exit415800RecurseNodePtr(node),
        );
        assert.equal(
          exp.nextNodePtr415800(node) >>> 0,
          exit415800NextNodePtr(node),
        );
        assert.equal(
          exp.comSlotPtr415800(node) >>> 0,
          exit415800ComSlotPtr(node),
        );
        assert.equal(exp.ctrlPtr415800(node) >>> 0, exit415800CtrlPtr(node));
        assert.equal(
          exp.ctrlPresent415800(ctrl) !== 0,
          exit415800CtrlPresent(ctrl),
        );
        assert.equal(exp.virtualOk415800(al) !== 0, exit415800VirtualOk(al));
        assert.equal(
          exp.callbackNeeded415800(ctrl, al, g) !== 0,
          exit415800CallbackNeeded(ctrl, al, g),
        );
      }

      // Randomized tree: build a shape, compare the whole free order.
      {
        const NODES = 12;
        const SLOT = 0x40;
        const oracle = new DataView(new ArrayBuffer(NODES * SLOT + 0x80));
        const addr = (i) => 0x40 + i * SLOT;
        const HEAD = addr(0);
        // Head sentinel: _Isnil = 1, self-linked.
        const writeNode = (a, l, p, r, nil) => {
          writeU32(v28, W_TREE + a + EXIT_TREE_LEFT_OFF, l);
          writeU32(v28, W_TREE + a + EXIT_TREE_PARENT_OFF, p);
          writeU32(v28, W_TREE + a + EXIT_TREE_RIGHT_OFF, r);
          writeU8(v28, W_TREE + a + EXIT_TREE_ISNIL_OFF, nil);
          oracle.setUint32(a + EXIT_TREE_LEFT_OFF, l, true);
          oracle.setUint32(a + EXIT_TREE_PARENT_OFF, p, true);
          oracle.setUint32(a + EXIT_TREE_RIGHT_OFF, r, true);
          oracle.setUint8(a + EXIT_TREE_ISNIL_OFF, nil);
        };
        writeNode(HEAD, HEAD, HEAD, HEAD, 1);
        // Random binary shape over nodes 1..NODES-1, children default nil.
        const kids = [];
        for (let i = 1; i < NODES; i++) kids.push(addr(i));
        for (const a of kids) writeNode(a, HEAD, HEAD, HEAD, 0);
        // Attach each node under a random earlier node on a random side.
        const attached = [kids[0]];
        for (let i = 1; i < kids.length; i++) {
          const parent = attached[rnd() % attached.length];
          const side = rnd() & 1 ? EXIT_TREE_LEFT_OFF : EXIT_TREE_RIGHT_OFF;
          const existing =
            readU32(v28, W_TREE + parent + side) >>> 0;
          if (existing === HEAD) {
            writeU32(v28, W_TREE + parent + side, kids[i]);
            oracle.setUint32(parent + side, kids[i], true);
            attached.push(kids[i]);
          }
        }
        const root = kids[0];
        const jr = exit415800FreeOrder(oracle, root, 64);
        const n = exp.freeOrder415800(W_TREE, root, W_ORDER, 64) >>> 0;
        // Guard against the C-stack hazard documented at MEM: if the tree
        // image were being clobbered mid-call, wasm and oracle would
        // diverge here first.
        assert.equal(
          n === EXIT_415800_ORDER_OVERFLOW,
          jr.overflow,
          `415800 overflow flag iter ${iter}`,
        );
        if (!jr.overflow) {
          assert.equal(n, jr.nodes.length, `415800 count iter ${iter}`);
          for (let i = 0; i < n; i++) {
            assert.equal(
              readU32(v28, W_ORDER + i * 4) >>> 0,
              jr.nodes[i] >>> 0,
              `415800 order[${i}] iter ${iter}`,
            );
          }
          // PE truth: every attached node is freed exactly once, and a
          // node is always freed after its entire right subtree.
          assert.equal(n, attached.length);
          const pos = new Map();
          for (let i = 0; i < n; i++) pos.set(readU32(v28, W_ORDER + i * 4) >>> 0, i);
          assert.equal(pos.size, n);
          for (const a of attached) {
            const r = readU32(v28, W_TREE + a + EXIT_TREE_RIGHT_OFF) >>> 0;
            if (r !== HEAD) assert.ok(pos.get(r) < pos.get(a));
            const l = readU32(v28, W_TREE + a + EXIT_TREE_LEFT_OFF) >>> 0;
            if (l !== HEAD) assert.ok(pos.get(l) > pos.get(a));
          }
        }
        // Output-bound overflow must be reported by both sides.
        if (!jr.overflow && jr.nodes.length > 1) {
          const small = exp.freeOrder415800(
            W_TREE,
            root,
            W_ORDER,
            jr.nodes.length - 1,
          ) >>> 0;
          assert.equal(small, EXIT_415800_ORDER_OVERFLOW);
          assert.equal(
            exit415800FreeOrder(oracle, root, jr.nodes.length - 1).overflow,
            true,
          );
        }
      }
    }
  }
});

/* --- ABI v33: Game::Exit root typed continuation plan --- */

// IsaacExitRootPlan layout (C++20 default alignment; see header).
const ROOT = {
  entryActive: 0,
  shouldSave: 4,
  overlayForceNeeded: 8,
  sfxStopCount: 12,
  sfxReceiverOff: 16,
  mgrHost7df690Receiver: 20,
  pgdFlushNeeded: 24,
  pgdSaveCloud: 28,
  gamestateIoNeeded: 32,
  gamestateShouldWrite: 36,
  anm2ResetCount: 40,
  anm2ResetThisOff0: 44,
  anm2ResetThisOff1: 48,
  anm2ResetThisOff2: 52,
  vectorDtorCount: 56,
  host8d26c0Needed: 60,
  eventCount: 64,
  event: 68,
  size: 68 + 48 * 4,
};

// ABI v34: IsaacExit8d26c0Plan field offsets (12 x i32/u32, no padding).
const P8D26C0 = {
  arm: 0,
  elementCount: 4,
  indexValid: 8,
  elementAddr: 12,
  subCount: 16,
  newStepBits: 20,
  newFrame: 24,
  storeCount: 28,
  logNeeded: 32,
  logLevel: 36,
  logFmtAddr: 40,
  logArg: 44,
  size: 48,
};

function read8d26c0Plan(view, base) {
  return {
    arm: readI32(view, base + P8D26C0.arm),
    elementCount: readI32(view, base + P8D26C0.elementCount),
    indexValid: readI32(view, base + P8D26C0.indexValid),
    elementAddr: readU32(view, base + P8D26C0.elementAddr),
    subCount: readI32(view, base + P8D26C0.subCount),
    newStepBits: readU32(view, base + P8D26C0.newStepBits),
    newFrame: readI32(view, base + P8D26C0.newFrame),
    storeCount: readI32(view, base + P8D26C0.storeCount),
    logNeeded: readI32(view, base + P8D26C0.logNeeded),
    logLevel: readU32(view, base + P8D26C0.logLevel),
    logFmtAddr: readU32(view, base + P8D26C0.logFmtAddr),
    logArg: readU32(view, base + P8D26C0.logArg),
  };
}

function compare8d26c0Plan(w, o, ctx) {
  assert.equal(w.arm, o.arm, ctx + " arm");
  assert.equal(w.elementCount, o.elementCount | 0, ctx + " elementCount");
  assert.equal(w.indexValid, o.indexValid ? 1 : 0, ctx + " indexValid");
  assert.equal(w.elementAddr, o.elementAddr >>> 0, ctx + " elementAddr");
  assert.equal(w.subCount, o.subCount | 0, ctx + " subCount");
  assert.equal(w.newStepBits, o.newStepBits >>> 0, ctx + " newStepBits");
  assert.equal(w.newFrame, o.newFrame | 0, ctx + " newFrame");
  assert.equal(w.storeCount, o.storeCount | 0, ctx + " storeCount");
  assert.equal(w.logNeeded, o.logNeeded ? 1 : 0, ctx + " logNeeded");
  assert.equal(w.logLevel, o.logLevel >>> 0, ctx + " logLevel");
  assert.equal(w.logFmtAddr, o.logFmtAddr >>> 0, ctx + " logFmtAddr");
  assert.equal(w.logArg, o.logArg >>> 0, ctx + " logArg");
}

function readRootPlan(view, base) {
  const w = {};
  w.entryActive = readI32(view, base + ROOT.entryActive);
  w.shouldSave = readU32(view, base + ROOT.shouldSave);
  w.overlayForceNeeded = readI32(view, base + ROOT.overlayForceNeeded);
  w.sfxStopCount = readI32(view, base + ROOT.sfxStopCount);
  w.sfxReceiverOff = readU32(view, base + ROOT.sfxReceiverOff);
  w.mgrHost7df690Receiver = readU32(view, base + ROOT.mgrHost7df690Receiver);
  w.pgdFlushNeeded = readI32(view, base + ROOT.pgdFlushNeeded);
  w.pgdSaveCloud = readI32(view, base + ROOT.pgdSaveCloud);
  w.gamestateIoNeeded = readI32(view, base + ROOT.gamestateIoNeeded);
  w.gamestateShouldWrite = readI32(view, base + ROOT.gamestateShouldWrite);
  w.anm2ResetCount = readI32(view, base + ROOT.anm2ResetCount);
  w.anm2ResetThisOff = [
    readU32(view, base + ROOT.anm2ResetThisOff0),
    readU32(view, base + ROOT.anm2ResetThisOff1),
    readU32(view, base + ROOT.anm2ResetThisOff2),
  ];
  w.vectorDtorCount = readI32(view, base + ROOT.vectorDtorCount);
  w.host8d26c0Needed = readI32(view, base + ROOT.host8d26c0Needed);
  w.eventCount = readI32(view, base + ROOT.eventCount);
  w.events = new Array(EXIT_ROOT_EVENT_CAP).fill(0);
  for (let i = 0; i < EXIT_ROOT_EVENT_CAP; i++) {
    w.events[i] = readU32(view, base + ROOT.event + i * 4);
  }
  return w;
}

function compareRootPlan(w, o, ctx) {
  assert.equal(w.entryActive, o.entryActive ? 1 : 0, ctx + " entryActive");
  assert.equal(w.shouldSave, o.shouldSave >>> 0, ctx + " shouldSave");
  assert.equal(w.overlayForceNeeded, o.overlayForceNeeded ? 1 : 0, ctx + " overlayForceNeeded");
  assert.equal(w.sfxStopCount, o.sfxStopCount, ctx + " sfxStopCount");
  assert.equal(w.sfxReceiverOff, o.sfxReceiverOff >>> 0, ctx + " sfxReceiverOff");
  assert.equal(w.mgrHost7df690Receiver, o.mgrHost7df690Receiver >>> 0, ctx + " mgrHost7df690Receiver");
  assert.equal(w.pgdFlushNeeded, o.pgdFlushNeeded ? 1 : 0, ctx + " pgdFlushNeeded");
  assert.equal(w.pgdSaveCloud, o.pgdSaveCloud ? 1 : 0, ctx + " pgdSaveCloud");
  assert.equal(w.gamestateIoNeeded, o.gamestateIoNeeded ? 1 : 0, ctx + " gamestateIoNeeded");
  assert.equal(w.gamestateShouldWrite, o.gamestateShouldWrite ? 1 : 0, ctx + " gamestateShouldWrite");
  assert.equal(w.anm2ResetCount, o.anm2ResetCount, ctx + " anm2ResetCount");
  assert.deepEqual(
    w.anm2ResetThisOff,
    Array.isArray(o.anm2ResetThisOff)
      ? o.anm2ResetThisOff.map((x) => x >>> 0)
      : o.anm2ResetThisOff,
    ctx + " anm2ResetThisOff",
  );
  assert.equal(w.vectorDtorCount, o.vectorDtorCount | 0, ctx + " vectorDtorCount");
  assert.equal(w.host8d26c0Needed, o.host8d26c0Needed | 0, ctx + " host8d26c0Needed");
  assert.equal(w.eventCount, o.eventCount, ctx + " eventCount");
}

test("Wasm/JS: Game::Exit root plan fixed cases (ABI v33)", () => {
  const exp = loadExports();
  const planBase = MEM + 0x48000;
  while (planBase + ROOT.size > exp.memory.buffer.byteLength) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);

  // Fixed case 1: entry gate closed (LOW byte 0) -> empty plan, but the
  // C++ zero-fill still populates the ANM2 offsets + 7df690 receiver.
  exp.rootPlan(planBase, 1, 0, 2, 1, 1, 0x100, 1, 0, 1, 0, 0, 0);
  const w0 = readRootPlan(view, planBase);
  assert.equal(w0.entryActive, 0);
  assert.equal(w0.eventCount, 0);
  assert.deepEqual(
    Array.from({ length: EXIT_ROOT_EVENT_CAP }, (_, i) => readU32(view, planBase + ROOT.event + i * 4)),
    new Array(EXIT_ROOT_EVENT_CAP).fill(0),
  );
  assert.equal(w0.anm2ResetThisOff[0], 0x1d528);
  assert.equal(w0.anm2ResetThisOff[1], 0x1c03c);
  assert.equal(w0.anm2ResetThisOff[2], 0x1d1d8);
  assert.equal(w0.mgrHost7df690Receiver, exitRoot7df690Receiver(0, 1) >>> 0);
  assert.equal(exp.rootAnm2ResetCount() >>> 0, exitRootAnm2ResetCount());
  for (let i = 0; i < 3; i++) {
    assert.equal(
      exp.rootAnm2ResetThisOffAt(i) >>> 0,
      exitRootAnm2ResetThisOffAt(i) >>> 0,
    );
  }
  assert.equal(exp.rootAnm2ResetThisOffAt(3) >>> 0, 0);
  assert.equal(
    exp.root7df690Receiver(0x1000, 0) >>> 0,
    exitRoot7df690Receiver(0x1000, 0) >>> 0,
  );

  // Wide overlay draws: FULL-dword state == 2 (0x102 != 2) -> no overlay
  // event; a byte-masked mutant would wrongly emit the host.
  exp.rootPlan(planBase, 1, 1, 0x102, 0, 0, 0, 0, 1, 0, 0, 0, 1);
  const wOver = readRootPlan(view, planBase);
  assert.equal(wOver.overlayForceNeeded, 0);
  assert.notEqual(
    readU32(view, planBase + ROOT.event + 7 * 4) >>> 0,
    (EXIT_ROOT_EVENT_HOST << 24 | 0x009aca90) >>> 0,
  );
  exp.rootPlan(planBase, 1, 1, 0x102, 1, 1, 0, 0, 1, 0, 0, 0, 1);
  const wOver2 = readRootPlan(view, planBase);
  assert.equal(wOver2.overlayForceNeeded, 0);

  // Fixed case 2: all gates open -> ordered 41-event plan (PE order).
  const A = {
    shouldSave: 1, session: 1, overlay: 2, cm: 1, loaded: 1,
    steamWord: 0x100, cloud: 1, skip: 0, mgrCount: 2,
    vb: 0, ve: 2 * EXIT_VECTOR_25EBC_STRIDE, setIdx: 7,
  };
  const oracle = exitRootPlan(
    A.shouldSave, A.session, A.overlay, A.cm, A.loaded, A.steamWord,
    A.cloud, A.skip, A.mgrCount, A.vb, A.ve, A.setIdx,
  );
  exp.rootPlan(
    planBase, A.shouldSave, A.session, A.overlay, A.cm, A.loaded,
    A.steamWord, A.cloud, A.skip, A.mgrCount, A.vb, A.ve, A.setIdx,
  );
  const w2 = readRootPlan(view, planBase);
  compareRootPlan(w2, oracle, "root open");
  assert.equal(w2.eventCount, 41);
  for (let i = 0; i < 41; i++) {
    assert.equal(
      readU32(view, planBase + ROOT.event + i * 4) >>> 0,
      oracle.events[i] >>> 0,
      `event[${i}]`,
    );
  }
  // First event is the 0x008650a0 prologue host; last is TERMINAL pure.
  assert.equal(
    readU32(view, planBase + ROOT.event) >>> 0,
    (EXIT_ROOT_EVENT_HOST << 24 | 0x008650a0) >>> 0,
  );
  assert.equal(
    readU32(view, planBase + ROOT.event + 40 * 4) >>> 0,
    (EXIT_ROOT_EVENT_PURE << 24 | EXIT_ROOT_SEG_TERMINAL) >>> 0,
  );
});

test("Wasm vs JS differential: Game::Exit root plan (ABI v33)", () => {
  const exp = loadExports();
  const planBase = MEM + 0x48000;
  while (planBase + ROOT.size > exp.memory.buffer.byteLength) {
    exp.memory.grow(1);
  }
  const view = new DataView(exp.memory.buffer);
  let seed = 0x6fa0c033;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  for (let i = 0; i < 600; i++) {
    // Byte gates drawn WIDE (upper bits set): a masked byte mutant would
    // diverge on the low-vs-full-width decision.
    const shouldSave = rnd();
    const session = rnd();
    const overlay = rnd();
    const cm = rnd();
    const loaded = rnd();
    const steamWord = rnd();
    const cloud = rnd();
    const skip = rnd();
    const mgrCount = rnd() & 0x3ff;
    // Vector span in whole strides; occasionally empty / non-aligned.
    const vb = (rnd() % 16) * EXIT_VECTOR_25EBC_STRIDE;
    const k = rnd() % 16;
    const ve = (vb + k * EXIT_VECTOR_25EBC_STRIDE) >>> 0;
    const setIdx = rnd() & 3; // reaches BOTH the drop and the keep arm
    exp.rootPlan(planBase, shouldSave, session, overlay, cm, loaded, steamWord, cloud, skip, mgrCount, vb, ve, setIdx);
    const w = readRootPlan(view, planBase);
    const o = exitRootPlan(shouldSave, session, overlay, cm, loaded, steamWord, cloud, skip, mgrCount, vb, ve, setIdx);
    compareRootPlan(w, o, `iter ${i}`);
    assert.deepEqual(
      Array.from({ length: EXIT_ROOT_EVENT_CAP }, (_, j) => readU32(view, planBase + ROOT.event + j * 4)),
      o.events.map((x) => x >>> 0),
      `iter ${i} events`,
    );
  }
});

/* =====================================================================
   ABI v34 -- 0x008d26c0, the set-index step rescaler.
   The ONLY call in the whole body is the shared logger 0x00a112c0, so
   under the standing logger split this body is game-logic complete.
   ===================================================================== */

test("Wasm/JS: 0x008d26c0 complete body, arms and float chain (ABI v34)", () => {
  const exp = loadExports();
  const planBase = MEM + 0x49000;
  const thisBase = MEM + 0x4a000;
  while (thisBase + 0x900 > exp.memory.buffer.byteLength) exp.memory.grow(1);
  const view = new DataView(exp.memory.buffer);

  // --- header literals must match the model exports, both directions ---
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_EXIT_8D26C0_SET_INDEX_OFF = 0x7d8/);
  assert.match(h, /ISAAC_EXIT_8D26C0_DIV_MAGIC = 0x2aaaaaab/);
  assert.match(h, /ISAAC_EXIT_8D26C0_F32_360_BITS = 0x43b40000u/);
  assert.match(h, /ISAAC_EXIT_8D26C0_F32_HALF_BITS = 0x3f000000u/);
  assert.match(h, /ISAAC_EXIT_8D26C0_LOG_FMT_ADDR = 0x00b758b8u/);
  assert.match(h, /ISAAC_EXIT_8D26C0_CVTTSS2SI_INDEFINITE = 0x80000000u/);
  assert.equal(EXIT_8D26C0_SET_INDEX_OFF, 0x7d8);
  assert.equal(EXIT_8D26C0_VEC_BEGIN_OFF, 0x7cc);
  assert.equal(EXIT_8D26C0_VEC_END_OFF, 0x7d0);
  assert.equal(EXIT_8D26C0_FRAME_OFF, 0x834);
  assert.equal(EXIT_8D26C0_STEP_OFF, 0x838);
  assert.equal(EXIT_8D26C0_ELEM_STRIDE, 0xc);
  assert.equal(EXIT_8D26C0_SUB_SHIFT, 2);
  assert.equal(EXIT_8D26C0_DIV_MAGIC, 0x2aaaaaab);
  assert.equal(EXIT_8D26C0_F32_360_BITS, 0x43b40000);
  assert.equal(EXIT_8D26C0_F32_HALF_BITS, 0x3f000000);
  assert.equal(EXIT_8D26C0_LOG_LEVEL, 8);
  assert.equal(EXIT_8D26C0_LOG_FMT_ADDR, 0x00b758b8);
  assert.equal(EXIT_8D26C0_APPLY_STORE_COUNT, 3);
  // The two .rdata constants really are 360.0f and 0.5f.
  const fscratch = new DataView(new ArrayBuffer(4));
  fscratch.setUint32(0, EXIT_8D26C0_F32_360_BITS, true);
  assert.equal(fscratch.getFloat32(0, true), 360);
  fscratch.setUint32(0, EXIT_8D26C0_F32_HALF_BITS, true);
  assert.equal(fscratch.getFloat32(0, true), 0.5);

  // --- the entry gate: FULL-dword index, LOW-BYTE force ---
  assert.equal(exp.is8d26c0Noop(4, 4, 0) >>> 0, 1);
  assert.equal(exit8d26c0IsNoop(4, 4, 0), true);
  // A DIFFERENT index never takes the no-op, whatever force says.
  assert.equal(exp.is8d26c0Noop(4, 5, 0) >>> 0, 0);
  // force != 0 forces the body to run even at the same index.
  assert.equal(exp.is8d26c0Noop(4, 4, 1) >>> 0, 0);
  // The index compare is a FULL dword: 0x100 is NOT 0.
  assert.equal(exp.is8d26c0Noop(0x100, 0, 0) >>> 0, 0);
  assert.equal(exp.is8d26c0Noop(0x100, 0x100, 0) >>> 0, 1);
  // The force test is a LOW BYTE. Drive the boundary UNMASKED across the
  // Wasm ABI -- a uint8_t parameter or a dropped mask answers differently.
  for (const wide of [0x100, 0x200, 0xff00, 0x7fffff00, 0x80000000, 0xffffff00]) {
    assert.equal(
      exp.is8d26c0Noop(4, 4, wide) >>> 0, 1,
      `force 0x${wide.toString(16)} has a ZERO low byte -> still a no-op`,
    );
    assert.equal(exit8d26c0IsNoop(4, 4, wide), true);
  }
  for (const wide of [0x1ff, 0xffffffff, 0x80000001, 0x1234abcd]) {
    assert.equal(
      exp.is8d26c0Noop(4, 4, wide) >>> 0, 0,
      `force 0x${wide.toString(16)} has a NONZERO low byte -> body runs`,
    );
    assert.equal(exit8d26c0IsNoop(4, 4, wide), false);
  }

  // --- element count is a SIGNED magic division by 0xc, not delta/0xc ---
  for (const n of [0, 1, 2, 3, 11, 12, 100, 1000]) {
    const end = (0x1000 + n * 12) >>> 0;
    assert.equal(exp.elementCount8d26c0(0x1000, end) | 0, n);
    assert.equal(exit8d26c0ElementCount(0x1000, end), n);
  }
  // Non-multiples truncate toward zero, and a REVERSED pair goes NEGATIVE
  // (an unsigned delta/0xc would return a huge positive instead).
  assert.equal(exp.elementCount8d26c0(0x1000, 0x1000 + 11) | 0, 0);
  assert.equal(exp.elementCount8d26c0(0x1000, 0x1000 + 23) | 0, 1);
  assert.equal(exp.elementCount8d26c0(0x1000, 0x1000 - 12) | 0, -1);
  assert.equal(exit8d26c0ElementCount(0x1000, 0x1000 - 12), -1);
  assert.equal(exp.elementCount8d26c0(0x1000, 0x1000 - 120) | 0, -10);
  // Signed truncation toward zero on the negative side too.
  assert.equal(exp.elementCount8d26c0(0x1000, 0x1000 - 11) | 0, 0);
  assert.equal(exp.elementCount8d26c0(0, 0xfffffff4) | 0, -1); // wraps to -12

  // --- the bound test is UNSIGNED over that SIGNED count ---
  assert.equal(exp.indexValid8d26c0(0, 3) >>> 0, 1);
  assert.equal(exp.indexValid8d26c0(2, 3) >>> 0, 1);
  assert.equal(exp.indexValid8d26c0(3, 3) >>> 0, 0);
  assert.equal(exp.indexValid8d26c0(0, 0) >>> 0, 0);
  // count -1 is 0xffffffff unsigned, so almost every index passes: this is
  // the PE jae, not a signed compare.
  assert.equal(exp.indexValid8d26c0(0x7fffffff, -1) >>> 0, 1);
  assert.equal(exit8d26c0IndexValid(0x7fffffff, -1), true);
  assert.equal(exp.indexValid8d26c0(0xffffffff, -1) >>> 0, 0);
  // A signed reading would call index 0x80000000 negative, therefore < 3.
  assert.equal(exp.indexValid8d26c0(0x80000000, 3) >>> 0, 0);

  // --- addressing and the arithmetic sub-count shift ---
  assert.equal(exp.elementAddr8d26c0(0x1000, 3) >>> 0, 0x1000 + 36);
  assert.equal(exit8d26c0ElementAddr(0x1000, 3) >>> 0, 0x1000 + 36);
  // 32-bit wrap.
  assert.equal(exp.elementAddr8d26c0(0xfffffff0, 2) >>> 0, 8);
  assert.equal(exp.subCount8d26c0(0x40, 0x40 + 4 * 90) | 0, 90);
  // sar, not shr: a reversed pair stays NEGATIVE.
  assert.equal(exp.subCount8d26c0(0x40, 0x40 - 8) | 0, -2);
  assert.equal(exit8d26c0SubCount(0x40, 0x40 - 8), -2);

  // --- the float chain ---
  // 360/90 = 4.0f exactly.
  assert.equal(exp.stepBits8d26c0(90) >>> 0, 0x40800000);
  assert.equal(exit8d26c0StepBits(90) >>> 0, 0x40800000);
  // A sub-count of 0 divides by zero -> +inf, reproduced not guarded.
  assert.equal(exp.stepBits8d26c0(0) >>> 0, 0x7f800000);
  // NEGATIVE sub-count: cvtdq2pd + the sign-bit-indexed 2^32 fixup make it
  // a HUGE positive, so the step becomes tiny. A signed conversion would
  // give a negative step instead -- opposite sign, not merely a shift.
  const negStep = exp.stepBits8d26c0(-1) >>> 0;
  assert.equal(negStep, exit8d26c0StepBits(-1) >>> 0);
  fscratch.setUint32(0, negStep, true);
  const negStepF = fscratch.getFloat32(0, true);
  assert.ok(negStepF > 0, "unsigned fixup keeps the step POSITIVE");
  assert.ok(negStepF < 1e-7, "360 / 2^32 is tiny");

  // frame rescale: 7 frames at 360 deg/frame, restepped to 4 deg/frame.
  assert.equal(exp.frameFrom8d26c0(7, EXIT_8D26C0_F32_360_BITS, 0x40800000) | 0, 630);
  assert.equal(exit8d26c0FrameFrom(7, EXIT_8D26C0_F32_360_BITS, 0x40800000), 630);
  // The +0.5f bias rounds a half up, so it is observable.
  assert.equal(exp.frameFrom8d26c0(1, 0x3f000000, 0x3f800000) | 0, 1); // 0.5+0.5
  assert.equal(exp.frameFrom8d26c0(1, 0x3e800000, 0x3f800000) | 0, 0); // 0.25+0.5
  // x86 CVTTSS2SI indefinite: NaN, inf, and out-of-range all give 0x80000000.
  const INDEF = EXIT_8D26C0_CVTTSS2SI_INDEFINITE | 0;
  assert.equal(exp.frameFrom8d26c0(1, 0x7fc00000, 0x3f800000) | 0, INDEF); // NaN
  assert.equal(exp.frameFrom8d26c0(1, 0x7f800000, 0x3f800000) | 0, INDEF); // +inf
  assert.equal(exit8d26c0FrameFrom(1, 0x7f800000, 0x3f800000), INDEF);
  // 1e30 / 1.0 + 0.5 overflows int32.
  assert.equal(exp.frameFrom8d26c0(1, 0x7149f2ca, 0x3f800000) | 0, INDEF);
  // 0/0 -> NaN -> indefinite (both step bits zero).
  assert.equal(exp.frameFrom8d26c0(0, 0, 0) | 0, INDEF);

  // --- the whole-body plan, all three arms ---
  const planCase = (label, a) => {
    exp.plan8d26c0(planBase, a.index, a.force, a.curIndex, a.vecBegin,
      a.vecEnd, a.elemLo, a.elemHi, a.oldFrame, a.oldStepBits);
    const w = read8d26c0Plan(new DataView(exp.memory.buffer), planBase);
    const o = exit8d26c0Plan(a.index, a.force, a.curIndex, a.vecBegin,
      a.vecEnd, a.elemLo, a.elemHi, a.oldFrame, a.oldStepBits);
    compare8d26c0Plan(w, o, label);
    return w;
  };

  // NOOP: censused as zero stores AND zero calls.
  const noop = planCase("noop", {
    index: 2, force: 0, curIndex: 2, vecBegin: 0x1000,
    vecEnd: 0x1000 + 5 * 12, elemLo: 0, elemHi: 400, oldFrame: 9,
    oldStepBits: EXIT_8D26C0_F32_360_BITS,
  });
  assert.equal(noop.arm, EXIT_8D26C0_ARM_NOOP);
  assert.equal(noop.storeCount, 0);
  assert.equal(noop.logNeeded, 0);
  assert.equal(noop.elementCount, 0, "the count is never even computed");

  // INVALID: zero stores, one logger call, the RAW index as the argument.
  const bad = planCase("invalid", {
    index: 9, force: 0, curIndex: 2, vecBegin: 0x1000,
    vecEnd: 0x1000 + 5 * 12, elemLo: 0, elemHi: 400, oldFrame: 9,
    oldStepBits: EXIT_8D26C0_F32_360_BITS,
  });
  assert.equal(bad.arm, EXIT_8D26C0_ARM_INVALID);
  assert.equal(bad.storeCount, 0, "the log arm stores NOTHING");
  assert.equal(bad.logNeeded, 1);
  assert.equal(bad.logLevel, EXIT_8D26C0_LOG_LEVEL);
  assert.equal(bad.logFmtAddr, EXIT_8D26C0_LOG_FMT_ADDR);
  assert.equal(bad.logArg, 9);
  assert.equal(bad.elementCount, 5);

  // APPLY: exactly three stores.
  const ok = planCase("apply", {
    index: 1, force: 0, curIndex: 0, vecBegin: 0x1000,
    vecEnd: 0x1000 + 5 * 12, elemLo: 0x40, elemHi: 0x40 + 4 * 90,
    oldFrame: 7, oldStepBits: EXIT_8D26C0_F32_360_BITS,
  });
  assert.equal(ok.arm, EXIT_8D26C0_ARM_APPLY);
  assert.equal(ok.storeCount, EXIT_8D26C0_APPLY_STORE_COUNT);
  assert.equal(ok.logNeeded, 0);
  assert.equal(ok.elementAddr, 0x1000 + 12);
  assert.equal(ok.subCount, 90);
  assert.equal(ok.newStepBits, 0x40800000);
  assert.equal(ok.newFrame, 630);

  // force != 0 converts the no-op into a real APPLY at the SAME index.
  const forced = planCase("forced", {
    index: 2, force: 1, curIndex: 2, vecBegin: 0x1000,
    vecEnd: 0x1000 + 5 * 12, elemLo: 0x40, elemHi: 0x40 + 4 * 90,
    oldFrame: 7, oldStepBits: EXIT_8D26C0_F32_360_BITS,
  });
  assert.equal(forced.arm, EXIT_8D26C0_ARM_APPLY);
  assert.equal(forced.storeCount, 3);

  // The multiply takes the OLD step and the divide the NEW one. Folding
  // both to the new step would give 7*4/4 = 7; both to the old would give
  // 7*360/360 = 7. The real answer is 630, so this ONE case discriminates
  // defect class 1 in either direction.
  assert.notEqual(ok.newFrame, 7);

  // --- linear-memory apply writes the three PE stores, in PE order ---
  const writeThis = (curIdx, begin, end, frame, stepBits) => {
    for (let i = 0; i < 0x900; i++) writeU8(view, thisBase + i, 0xcd);
    writeU32(view, thisBase + EXIT_8D26C0_SET_INDEX_OFF, curIdx);
    writeU32(view, thisBase + EXIT_8D26C0_VEC_BEGIN_OFF, begin);
    writeU32(view, thisBase + EXIT_8D26C0_VEC_END_OFF, end);
    writeU32(view, thisBase + EXIT_8D26C0_FRAME_OFF, frame);
    writeU32(view, thisBase + EXIT_8D26C0_STEP_OFF, stepBits);
  };
  writeThis(0, 0x1000, 0x1000 + 5 * 12, 7, EXIT_8D26C0_F32_360_BITS);
  assert.equal(exp.apply8d26c0(thisBase, 1, 0, 0x40, 0x40 + 4 * 90) | 0,
    EXIT_8D26C0_ARM_APPLY);
  assert.equal(readU32(view, thisBase + EXIT_8D26C0_SET_INDEX_OFF), 1);
  assert.equal(readU32(view, thisBase + EXIT_8D26C0_STEP_OFF), 0x40800000);
  assert.equal(readI32(view, thisBase + EXIT_8D26C0_FRAME_OFF), 630);
  // The JS side, over its own buffer, agrees field for field.
  {
    const jsBuf = new DataView(new ArrayBuffer(0x900));
    for (let i = 0; i < 0x900; i++) jsBuf.setUint8(i, 0xcd);
    jsBuf.setUint32(EXIT_8D26C0_SET_INDEX_OFF, 0, true);
    jsBuf.setUint32(EXIT_8D26C0_VEC_BEGIN_OFF, 0x1000, true);
    jsBuf.setUint32(EXIT_8D26C0_VEC_END_OFF, 0x1000 + 5 * 12, true);
    jsBuf.setUint32(EXIT_8D26C0_FRAME_OFF, 7, true);
    jsBuf.setUint32(EXIT_8D26C0_STEP_OFF, EXIT_8D26C0_F32_360_BITS, true);
    assert.equal(exit8d26c0Apply(jsBuf, 0, 1, 0, 0x40, 0x40 + 4 * 90),
      EXIT_8D26C0_ARM_APPLY);
    assert.equal(jsBuf.getUint32(EXIT_8D26C0_SET_INDEX_OFF, true), 1);
    assert.equal(jsBuf.getUint32(EXIT_8D26C0_STEP_OFF, true), 0x40800000);
    assert.equal(jsBuf.getInt32(EXIT_8D26C0_FRAME_OFF, true), 630);
  }
  // Both non-apply arms must leave EVERY byte of the receiver untouched.
  for (const [label, idx, force] of [["noop", 3, 0], ["invalid", 99, 0]]) {
    writeThis(3, 0x1000, 0x1000 + 5 * 12, 7, EXIT_8D26C0_F32_360_BITS);
    const before = [];
    for (let i = 0; i < 0x900; i++) before.push(readU8(view, thisBase + i));
    exp.apply8d26c0(thisBase, idx, force, 0x40, 0x40 + 4 * 90);
    const after = [];
    for (let i = 0; i < 0x900; i++) after.push(readU8(view, thisBase + i));
    assert.deepEqual(after, before, `${label} arm must not write anything`);
  }

  // --- the root drop gate ---
  assert.equal(exp.root8d26c0HostNeeded(0) >>> 0, 0, "index 0 -> DROP");
  assert.equal(exp.root8d26c0HostNeeded(1) >>> 0, 1, "index 1 -> keep");
  assert.equal(exp.root8d26c0HostNeeded(0xffffffff) >>> 0, 1);
  // Full-dword: 0x100 must NOT be mistaken for 0 by a byte-masked read.
  assert.equal(exp.root8d26c0HostNeeded(0x100) >>> 0, 1);
  assert.equal(exitRoot8d26c0HostNeeded(0x100), 1);
  assert.equal(exitRoot8d26c0HostNeeded(0), 0);
});

test("Wasm vs JS differential: 0x008d26c0 body (ABI v34)", () => {
  const exp = loadExports();
  const planBase = MEM + 0x49000;
  while (planBase + 0x100 > exp.memory.buffer.byteLength) exp.memory.grow(1);
  let seed = 0x8d26c034;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  // Draw from the HIGH bits, never % n.
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];
  const armSeen = new Map([[EXIT_8D26C0_ARM_NOOP, 0],
    [EXIT_8D26C0_ARM_INVALID, 0], [EXIT_8D26C0_ARM_APPLY, 0]]);
  let indefSeen = 0;
  let negSubSeen = 0;
  let negCountSeen = 0;
  const CASES = 4000;
  for (let i = 0; i < CASES; i++) {
    const curIndex = (rnd() >>> 28);
    const index = pick([curIndex, (rnd() >>> 28), rnd(), 0, 0x100, 0xffffffff]);
    // force is drawn UNMASKED so the low-byte gate is really exercised.
    const force = pick([0, 1, 0x100, 0xff00, 0x1ff, rnd(), 0xffffffff]);
    const vecBegin = pick([0, 0x1000, 0xfffffff0, rnd() & 0xfffffff0]);
    const span = pick([0, 12, 5 * 12, 11, 0x7fffffff, (rnd() & 0xffff)]);
    const vecEnd = pick([(vecBegin + span) >>> 0, (vecBegin - span) >>> 0, rnd()]);
    const elemLo = pick([0, 0x40, rnd()]);
    const elemHi = pick([elemLo, (elemLo + 4 * ((rnd() >>> 20) + 1)) >>> 0,
      (elemLo - 8) >>> 0, rnd()]);
    const oldFrame = pick([0, 1, 7, -1, 0x7fffffff, rnd() | 0]);
    const oldStepBits = pick([EXIT_8D26C0_F32_360_BITS, 0x3f800000, 0,
      0x7f800000, 0x7fc00000, rnd()]);

    exp.plan8d26c0(planBase, index, force, curIndex, vecBegin, vecEnd,
      elemLo, elemHi, oldFrame, oldStepBits);
    const w = read8d26c0Plan(new DataView(exp.memory.buffer), planBase);
    const o = exit8d26c0Plan(index, force, curIndex, vecBegin, vecEnd,
      elemLo, elemHi, oldFrame, oldStepBits);
    compare8d26c0Plan(w, o, `iter ${i}`);
    armSeen.set(w.arm, armSeen.get(w.arm) + 1);
    if (w.arm === EXIT_8D26C0_ARM_APPLY) {
      if (w.newFrame === (EXIT_8D26C0_CVTTSS2SI_INDEFINITE | 0)) indefSeen++;
      if (w.subCount < 0) negSubSeen++;
    }
    if (w.elementCount < 0) negCountSeen++;
  }
  // The corpus must actually REACH every arm and every interesting edge --
  // a differential over cases that never diverge proves nothing.
  for (const [arm, n] of armSeen) {
    assert.ok(n > 0, `corpus never reached arm ${arm}`);
  }
  assert.ok(indefSeen > 0, "corpus never produced a CVTTSS2SI indefinite");
  assert.ok(negSubSeen > 0, "corpus never produced a negative sub-count");
  assert.ok(negCountSeen > 0, "corpus never produced a negative element count");
});

test("v34 guards are not vacuous (self-check)", () => {
  // House standard: a test whose job is to prove the OTHER tests would
  // actually fail. Each block below asserts that the checker it exercises
  // FIRES on a deliberately bad input.
  const h = readFileSync(header, "utf8");
  const src = readFileSync(source, "utf8");

  // 1. The byte-parameter guard is a NEGATIVE assertion (no uint8_t
  //    parameters), which passes vacuously if the scanner is broken. Prove
  //    the scanner sees parameters at all, and prove it CATCHES a planted
  //    one -- multi-line declarations included.
  const scan = (text) =>
    text.match(/\buint8_t\s+[A-Za-z_][A-Za-z_0-9]*\s*[,)]/g) || [];
  assert.deepEqual(scan(h), [], "header must have no uint8_t scalar params");
  assert.deepEqual(scan(src), [], "cpp must have no uint8_t scalar params");
  // ...the scanner is alive: the same shape with uint32_t is everywhere.
  const wide = h.match(/\buint32_t\s+[A-Za-z_][A-Za-z_0-9]*\s*[,)]/g) || [];
  assert.ok(wide.length > 200,
    `scanner saw only ${wide.length} uint32_t params -- it is not working`);
  // ...and it fires on a planted single-line AND multi-line declaration.
  assert.equal(scan("int32_t f(uint8_t flag);").length, 1);
  assert.equal(scan("int32_t f(uint32_t a,\n          uint8_t flag);").length, 1);
  assert.equal(scan("void f(uint8_t* p);").length, 0, "pointers are fine");

  // 2. The v34 exports are all really present in the header AND reachable
  //    as Wasm exports (an export listed but never asserted on is the
  //    failure mode this repo has shipped before).
  for (const name of [
    "isaac_exit_8d26c0_is_noop", "isaac_exit_8d26c0_element_count",
    "isaac_exit_8d26c0_index_valid", "isaac_exit_8d26c0_element_addr",
    "isaac_exit_8d26c0_sub_count", "isaac_exit_8d26c0_step_bits",
    "isaac_exit_8d26c0_frame_from", "isaac_exit_8d26c0_plan",
    "isaac_exit_8d26c0_apply", "isaac_exit_root_8d26c0_host_needed",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }

  // 3. The new root-plan runtime input must actually be DELIVERED by the
  //    harness. Same call, two values of setIndex7d8, different plans --
  //    if the harness dropped the argument both would be identical.
  const exp = loadExports();
  const planBase = MEM + 0x48000;
  while (planBase + ROOT.size > exp.memory.buffer.byteLength) exp.memory.grow(1);
  const view = new DataView(exp.memory.buffer);
  exp.rootPlan(planBase, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0);
  const dropped = readRootPlan(view, planBase);
  exp.rootPlan(planBase, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 5);
  const kept = readRootPlan(view, planBase);
  assert.equal(dropped.host8d26c0Needed, 0);
  assert.equal(kept.host8d26c0Needed, 1);
  assert.equal(kept.eventCount, dropped.eventCount + 1,
    "the kept plan must carry exactly one MORE event");
  const hostWord = ((EXIT_ROOT_EVENT_HOST << 24) | 0x008d26c0) >>> 0;
  exp.rootPlan(planBase, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 5);
  const keptEvents = Array.from({ length: EXIT_ROOT_EVENT_CAP },
    (_, i) => readU32(view, planBase + ROOT.event + i * 4) >>> 0);
  assert.ok(keptEvents.includes(hostWord), "kept plan must emit the host event");
  exp.rootPlan(planBase, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0);
  const dropEvents = Array.from({ length: EXIT_ROOT_EVENT_CAP },
    (_, i) => readU32(view, planBase + ROOT.event + i * 4) >>> 0);
  assert.ok(!dropEvents.includes(hostWord),
    "dropped plan must NOT emit the host event");
  // The JS oracle agrees on both sides of that same switch.
  assert.equal(exitRootPlan(1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0).host8d26c0Needed, 0);
  assert.equal(exitRootPlan(1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 5).host8d26c0Needed, 1);
});



/* =====================================================================
   ABI v35: Game::Exit map walk continuation (PE 0x006fa457-0x006fa50a).
   The inline walk expands the root plan's MAP_WALK event (kind 4) into
   its PE-ordered nested events; the JS oracle is a PC-walk trace over a
   transcribed instruction table and the C++ is a straight branch loop.
   =================================================================== */

// IsaacExitRootMapWalkPlan layout (7 x i32 + event[EVENT_CAP]).
const WALK = {
  walkActive: 0,
  nodeCount: 4,
  elemHostCount: 8,
  flagClearCount: 12,
  globalHostCount: 16,
  eventCount: 20,
  truncated: 24,
  event: 28,
  size: 28 + EXIT_ROOT_MAP_WALK_EVENT_CAP * 4,
};

function readWalkPlan(view, base) {
  const w = {};
  w.walkActive = readI32(view, base + WALK.walkActive);
  w.nodeCount = readI32(view, base + WALK.nodeCount);
  w.elemHostCount = readI32(view, base + WALK.elemHostCount);
  w.flagClearCount = readI32(view, base + WALK.flagClearCount);
  w.globalHostCount = readI32(view, base + WALK.globalHostCount);
  w.eventCount = readI32(view, base + WALK.eventCount);
  w.truncated = readI32(view, base + WALK.truncated);
  w.events = new Array(EXIT_ROOT_MAP_WALK_EVENT_CAP).fill(0);
  for (let i = 0; i < EXIT_ROOT_MAP_WALK_EVENT_CAP; i++) {
    w.events[i] = readU32(view, base + WALK.event + i * 4);
  }
  return w;
}

function compareWalkPlan(w, o, ctx) {
  assert.equal(w.walkActive, o.walkActive ? 1 : 0, ctx + " walkActive");
  assert.equal(w.nodeCount, o.nodeCount, ctx + " nodeCount");
  assert.equal(w.elemHostCount, o.elemHostCount, ctx + " elemHostCount");
  assert.equal(w.flagClearCount, o.flagClearCount, ctx + " flagClearCount");
  assert.equal(w.globalHostCount, o.globalHostCount, ctx + " globalHostCount");
  assert.equal(w.eventCount, o.eventCount, ctx + " eventCount");
  assert.equal(w.truncated, o.truncated ? 1 : 0, ctx + " truncated");
  // Wasm exposes the full 64-slot array; the oracle only the live words.
  // Compare the first eventCount words, and prove the tail stays zeroed.
  assert.deepEqual(
    w.events.slice(0, w.eventCount), o.events.map((x) => x >>> 0),
    ctx + " events",
  );
  assert.ok(w.events.slice(w.eventCount).every((e) => e === 0),
    ctx + " event tail must stay zero");
}

/**
 * Build a linear-memory MSVC string map image. MAP is a dword holding the
 * SENTINEL node address; the sentinel node lives at MAP+0x20 (MSVC header
 * convention: _Left = leftmost, _Parent = root, _Right = rightmost, its
 * own isnil byte set). Nodes come from spec.nodes with explicit addrs.
 */
function writeWalkTree(view, base, spec) {
  const MAP = base;
  const Hn = base + 0x20;
  const writeSso = (strBase, s) => {
    for (let i = 0; i < 16; i++) writeU8(view, strBase + i, 0);
    for (let i = 0; i < s.length; i++) writeU8(view, strBase + i, s.charCodeAt(i));
    writeU32(view, strBase + EXIT_MSVC_STRING_SIZE_OFF, s.length);
    writeU32(view, strBase + EXIT_MSVC_STRING_CAP_OFF, 0xf);
  };
  const link = (node, left, parent, right, isnil) => {
    writeU32(view, node + EXIT_TREE_LEFT_OFF, left);
    writeU32(view, node + EXIT_TREE_PARENT_OFF, parent);
    writeU32(view, node + EXIT_TREE_RIGHT_OFF, right);
    writeU8(view, node + EXIT_TREE_ISNIL_OFF, isnil);
  };
  writeU32(view, MAP, Hn);
  const nodes = spec.nodes;
  link(Hn, nodes[0].addr, spec.root, spec.rightmost, 1);
  for (const n of nodes) {
    link(n.addr, n.left, n.parent, n.right, 0);
    writeSso(n.addr + EXIT_MAP_NODE_KEY_OFF, n.key);
    writeU8(view, n.addr + EXIT_MAP_NODE_FLAG_OFF, n.flag);
    writeU32(view, n.addr + EXIT_MAP_NODE_BEGIN_OFF, n.elemBegin);
    writeU32(view, n.addr + EXIT_MAP_NODE_END_OFF, n.elemEnd);
  }
}

const walkWord = (kind, payload) =>
  ((kind << 24) | ((payload >>> 0) & 0xffffff)) >>> 0;

test("Wasm/JS: Game::Exit map walk continuation fixed cases (ABI v35)", () => {
  const exp = loadExports();
  const planBase = MEM + 0x4b000;
  // The Wasm module's memory is FIXED at 258 pages (16.9MB, em++ default
  // max), so no grow() is possible. The high-payload image sits just
  // above the 0x1000000 event-word mask boundary, inside that range.
  const hiBase = 0x1000000;
  assert.ok(hiBase + 0x1000 <= exp.memory.buffer.byteLength,
    "high-payload image must fit the fixed memory");
  const view = new DataView(exp.memory.buffer);
  const flagOf = (node) => node + EXIT_MAP_NODE_FLAG_OFF;

  // --- header literals vs model constants, both directions ---
  const h = readFileSync(header, "utf8");
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST = 5,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST = 6,/);
  assert.match(h, /ISAAC_EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR = 8,/);
  assert.equal(EXIT_ROOT_MAP_WALK_EVENT_CAP, 64);
  assert.equal(EXIT_ROOT_MAP_WALK_NODE_CAP, 64);
  assert.equal(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST, 5);
  assert.equal(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 6);
  assert.equal(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, 8);
  assert.equal(EXIT_ROOT_MAP_WALK_ELEM_HOST_VA, 0x0040c7f0);
  assert.equal(EXIT_ROOT_MAP_WALK_GLOBAL_VA, 0x0040e910);
  assert.equal(EXIT_ROOT_MAP_WALK_FIND_VA, 0x0069d690);

  // --- gate: byte [found+0x28] is a LOW-BYTE test (PE @ 0x006fa488).
  // Drive the boundary UNMASKED across the Wasm ABI -- a uint8_t
  // parameter or a dropped mask answers differently (AGENTS.md defect).
  assert.equal(exp.rootMapWalkFlagActive(0) >>> 0, 0);
  assert.equal(exp.rootMapWalkFlagActive(0x2a) >>> 0, 1);
  for (const wide of [0x100, 0xff00, 0x7fffff00, 0x80000000, 0xffffff00]) {
    assert.equal(exp.rootMapWalkFlagActive(wide) >>> 0, 0,
      `flag 0x${wide.toString(16)} has a ZERO low byte -> inactive`);
    assert.equal(exitRootMapWalkFlagActive(wide), false);
  }
  for (const wide of [0x1ff, 0xffffffff, 0x80000001, 0x1234abcd]) {
    assert.equal(exp.rootMapWalkFlagActive(wide) >>> 0, 1,
      `flag 0x${wide.toString(16)} has a NONZERO low byte -> active`);
    assert.equal(exitRootMapWalkFlagActive(wide), true);
  }

  // --- receiver/address helpers are 32-bit wrapping additions ---
  assert.equal(exp.rootMapWalkElemHostThis(0x1234) >>> 0,
    0x1234 + EXIT_MAP_ELEM_HOST_OFF);
  assert.equal(exp.rootMapWalkElemHostThis(0xfffffff0) >>> 0, 8);
  assert.equal(exitRootMapWalkElemHostThis(0xfffffff0) >>> 0, 8);
  assert.equal(exp.rootMapWalkFlagAddr(0x1234) >>> 0,
    0x1234 + EXIT_MAP_NODE_FLAG_OFF);
  assert.equal(exp.rootMapWalkFlagAddr(0xffffffe0) >>> 0, 8);
  assert.equal(exitRootMapWalkFlagAddr(0xffffffe0) >>> 0, 8);

  // --- the three callee VAs the walk emits for host events ---
  assert.equal(exp.rootMapWalkElemHostVa() >>> 0, 0x0040c7f0);
  assert.equal(exp.rootMapWalkGlobalVa() >>> 0, 0x0040e910);
  assert.equal(exp.rootMapWalkFindVa() >>> 0, 0x0069d690);
  assert.equal(EXIT_ROOT_MAP_WALK_ELEM_HOST_VA, 0x0040c7f0);
  assert.equal(EXIT_ROOT_MAP_WALK_GLOBAL_VA, 0x0040e910);
  assert.equal(EXIT_ROOT_MAP_WALK_FIND_VA, 0x0069d690);

  // --- inline iterator++ (0x006fa4c1-0x006fa504) vs the freestanding
  // 0x00414a80 form (isaac_exit_tree_iterator_next) on the same image ---
  const itSlot = MEM + 0x4b200;
  const itBase = MEM + 0x4b220;
  const N0 = itBase + 0x10;
  const N1 = itBase + 0x70;
  const N2 = itBase + 0xd0;
  {
    // chain: Hn <- N0 <- N1 <- N2 (rightmost); all lefts nil
    const Hn = itBase;
    writeU32(view, Hn + EXIT_TREE_LEFT_OFF, N0);
    writeU32(view, Hn + EXIT_TREE_PARENT_OFF, N0);
    writeU32(view, Hn + EXIT_TREE_RIGHT_OFF, N2);
    writeU8(view, Hn + EXIT_TREE_ISNIL_OFF, 1);
    writeU32(view, N0 + EXIT_TREE_LEFT_OFF, Hn);
    writeU32(view, N0 + EXIT_TREE_PARENT_OFF, Hn);
    writeU32(view, N0 + EXIT_TREE_RIGHT_OFF, N1);
    writeU8(view, N0 + EXIT_TREE_ISNIL_OFF, 0);
    writeU32(view, N1 + EXIT_TREE_LEFT_OFF, Hn);
    writeU32(view, N1 + EXIT_TREE_PARENT_OFF, N0);
    writeU32(view, N1 + EXIT_TREE_RIGHT_OFF, N2);
    writeU8(view, N1 + EXIT_TREE_ISNIL_OFF, 0);
    writeU32(view, N2 + EXIT_TREE_LEFT_OFF, Hn);
    writeU32(view, N2 + EXIT_TREE_PARENT_OFF, N1);
    writeU32(view, N2 + EXIT_TREE_RIGHT_OFF, Hn);
    writeU8(view, N2 + EXIT_TREE_ISNIL_OFF, 0);
    // in-order successors: N0 -> N1 -> N2 -> sentinel. Advancing FROM the
    // sentinel follows the raw algorithm (sentinel->_Right is the
    // rightmost, so it descends to it) -- the PE never does that because
    // the walk loop stops when node == sentinel.
    assert.equal(exp.rootMapWalkNext(N0) >>> 0, N1);
    assert.equal(exp.rootMapWalkNext(N1) >>> 0, N2);
    assert.equal(exp.rootMapWalkNext(N2) >>> 0, Hn);
    assert.equal(exp.rootMapWalkNext(Hn) >>> 0, N2);
    assert.equal(exp.rootMapWalkNext(0) >>> 0, 0); // null guard
    // cross-assert the SAME algorithm as the freestanding 0x00414a80.
    for (const node of [N0, N1, N2, Hn]) {
      writeU32(view, itSlot, node);
      exp.treeIteratorNext(itSlot);
      assert.equal(readU32(view, itSlot), exp.rootMapWalkNext(node) >>> 0,
        `inline iterator++ diverges from 0x00414a80 at 0x${node.toString(16)}`);
    }
    // and the JS oracle from its own view of the same image
    for (const node of [N0, N1, N2, Hn, 0]) {
      assert.equal(exitRootMapWalkNext(view, node) >>> 0,
        exp.rootMapWalkNext(node) >>> 0,
        `JS walk-next diverges from Wasm at 0x${node.toString(16)}`);
    }
  }

  // --- whole-walk plan: 3-node map, ordered A("a") B("b") C("c") ---
  const wBase = MEM + 0x4b300;
  const MAP = wBase;
  const An = wBase + 0x40;
  const Bn = wBase + 0xa0;
  const Cn = wBase + 0x100;
  const OUT = wBase + 0x160;
  const ELEMS = wBase + 0x180; // C's element range: stride 0x20
  for (let i = 0; i < 0x40; i++) writeU8(view, ELEMS + i, 0xcd);
  const nil = MAP + 0x20;
  const writeAbc = () => writeWalkTree(view, MAP, {
    nodes: [
      { addr: An, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
        left: nil, parent: Bn, right: nil },
      { addr: Bn, key: "b", flag: 0, elemBegin: 0, elemEnd: 0,
        left: An, parent: nil, right: Cn },
      { addr: Cn, key: "c", flag: 1,
        elemBegin: ELEMS, elemEnd: ELEMS + 2 * EXIT_MAP_ELEM_STRIDE,
        left: nil, parent: Bn, right: nil },
    ],
    root: Bn,
    rightmost: Cn,
  });

  // runPair: set the starting flag bytes, run the Wasm plan, snapshot the
  // applied flag bytes, restore, run the JS oracle, compare EVERYTHING.
  const runPlanPair = (ctx, initFlags, addrs, setup) => {
    if (setup) setup();
    addrs.forEach((a, i) => writeU8(view, a, initFlags[i]));
    const before = addrs.map((a) => readU8(view, a));
    exp.rootMapWalkPlan(planBase, MAP, OUT);
    const w = readWalkPlan(view, planBase);
    const wFlags = addrs.map((a) => readU8(view, a));
    addrs.forEach((a, i) => writeU8(view, a, before[i]));
    const o = exitRootMapWalkPlan(view, MAP, OUT);
    const oFlags = addrs.map((a) => readU8(view, a));
    compareWalkPlan(w, o, ctx);
    // the flag-clear store is APPLIED (later iterations observe it, like
    // the PE) -- both sides must end with the same bytes
    assert.deepEqual(wFlags, oFlags, ctx + " applied flag bytes");
    return w;
  };

  // A: flag set, EMPTY elem range -> flag clear only (PE @ 0x006fa494 je
  // 0x6fa4b8 skips the elem hosts). B: flag 0 -> nothing before the
  // global host (PE @ 0x006fa48c je 0x6fa4bc). C: flag set, 2 elems ->
  // two elem hosts, then the flag clear, then the global host.
  const abcFlags = [flagOf(An), flagOf(Bn), flagOf(Cn)];
  const abc = runPlanPair("abc", [1, 0, 1], abcFlags, writeAbc);
  assert.equal(abc.walkActive, 1);
  assert.equal(abc.nodeCount, 3);
  assert.equal(abc.elemHostCount, 2);
  assert.equal(abc.flagClearCount, 2);
  assert.equal(abc.globalHostCount, 3);
  assert.equal(abc.truncated, 0);
  assert.equal(abc.eventCount, 7);
  assert.deepEqual(abc.events.slice(0, abc.eventCount), [
    walkWord(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, flagOf(An)),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
      ELEMS + EXIT_MAP_ELEM_HOST_OFF),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
      ELEMS + EXIT_MAP_ELEM_STRIDE + EXIT_MAP_ELEM_HOST_OFF),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, flagOf(Cn)),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
  ], "PE order: FLAG_CLEAR(A), GLOBAL, GLOBAL, ELEM, ELEM, "
    + "FLAG_CLEAR(C), GLOBAL");

  // --- the elem loop RE-READS [found+0x48] per iteration (PE @
  // 0x006fa4ad); give C four elems and confirm four host events ---
  const abc4 = runPlanPair(
    "abc-4elems", [1, 0, 1], abcFlags,
    () => { writeAbc(); writeU32(view, Cn + EXIT_MAP_NODE_END_OFF,
      ELEMS + 4 * EXIT_MAP_ELEM_STRIDE); },
  );
  assert.equal(abc4.elemHostCount, 4);
  const cEvents = abc4.events.filter(
    (e) => (e >>> 24) === EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST);
  for (let i = 0; i < 4; i++) {
    assert.equal(cEvents[i] >>> 0,
      walkWord(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
        ELEMS + i * EXIT_MAP_ELEM_STRIDE + EXIT_MAP_ELEM_HOST_OFF) >>> 0,
      `elem host ${i} receiver`);
  }

  // --- duplicate keys: the walk visits Dn (key "a", in the right
  // subtree) whose find returns An -- the flag the plan CLEARS is An's.
  // An's flag was already cleared at An's visit, so Dn's iteration must
  // NOT emit another flag clear or elem hosts (the applied store is
  // visible to the later find; defect class 1 would use the stale byte).
  const Dn = wBase + 0x1c0;
  const dup = runPlanPair("duplicate-keys", [1, 1, 1],
    [flagOf(An), flagOf(Bn), flagOf(Dn)],
    () => writeWalkTree(view, MAP, {
      nodes: [
        { addr: An, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
          left: nil, parent: Bn, right: nil },
        { addr: Bn, key: "b", flag: 1, elemBegin: 0, elemEnd: 0,
          left: An, parent: nil, right: Dn },
        { addr: Dn, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
          left: nil, parent: Bn, right: nil },
      ],
      root: Bn,
      rightmost: Dn,
    }));
  assert.equal(dup.nodeCount, 3);
  assert.equal(dup.elemHostCount, 0);
  assert.equal(dup.flagClearCount, 2,
    "An's flag is already 0 when Dn's find returns An -- one clear per byte");
  assert.equal(dup.globalHostCount, 3);
  assert.equal(dup.eventCount, 5); // F,G, F,G, G
  assert.deepEqual(dup.events.slice(0, dup.eventCount).map((e) => e >>> 24),
    [8, 6, 8, 6, 6], "Dn's iteration contributes ONLY the global host");

  // --- miss: a node whose own key is never found (find returns the
  // sentinel, PE @ 0x006fa486 je 0x6fa4bc) still gets the global host.
  // Mn has key "a" but sits in the RIGHT subtree of root Bn("b") whose
  // left is An("a"); find("a") walks LEFT and never reaches Mn. ---
  const Mn = wBase + 0x220;
  const miss = runPlanPair("miss-node", [1, 1, 1],
    [flagOf(An), flagOf(Bn), flagOf(Mn)],
    () => writeWalkTree(view, MAP, {
      nodes: [
        { addr: An, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
          left: nil, parent: Bn, right: nil },
        { addr: Bn, key: "b", flag: 1, elemBegin: 0, elemEnd: 0,
          left: An, parent: nil, right: Mn },
        { addr: Mn, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
          left: nil, parent: Bn, right: nil },
      ],
      root: Bn,
      rightmost: Mn,
    }));
  assert.equal(miss.nodeCount, 3);
  assert.equal(miss.flagClearCount, 2, "Mn's miss clears NOTHING");
  assert.equal(miss.elemHostCount, 0);
  assert.equal(miss.globalHostCount, 3, "the global walk runs on misses too");
  assert.deepEqual(miss.events.slice(0, miss.eventCount), [
    walkWord(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, flagOf(An)),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR, flagOf(Bn)),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0),
  ]);

  // --- empty map: [sentinel] == sentinel -> walk skipped entirely
  // (PE @ 0x006fa468/0x006fa46a) ---
  const emptyMap = wBase + 0x2a0;
  const emptySent = emptyMap + 0x20;
  writeU32(view, emptyMap, emptySent);
  writeU32(view, emptySent + EXIT_TREE_LEFT_OFF, emptySent);
  writeU32(view, emptySent + EXIT_TREE_PARENT_OFF, emptySent);
  writeU32(view, emptySent + EXIT_TREE_RIGHT_OFF, emptySent);
  writeU8(view, emptySent + EXIT_TREE_ISNIL_OFF, 1);
  exp.rootMapWalkPlan(planBase, emptyMap, OUT);
  const empty = readWalkPlan(view, planBase);
  assert.equal(empty.walkActive, 0);
  assert.equal(empty.nodeCount, 0);
  assert.equal(empty.elemHostCount, 0);
  assert.equal(empty.flagClearCount, 0);
  assert.equal(empty.globalHostCount, 0);
  assert.equal(empty.eventCount, 0);
  assert.equal(empty.truncated, 0);
  const oEmpty = exitRootMapWalkPlan(view, emptyMap, OUT);
  compareWalkPlan(empty, oEmpty, "empty");

  // --- caps: a long right chain (70 nodes) hits BOTH caps. 64 iterations
  // run (NODE_CAP), the 65th marks truncated; the event stream is capped
  // at EVENT_CAP words. The C++ and the trace must agree exactly. ---
  const capBase = MEM + 0x4b600;
  const capSent = capBase + 0x20;
  const capNodes = [];
  for (let i = 0; i < 70; i++) capNodes.push(capBase + 0x80 + i * 0x60);
  // every node flag=1, empty elems -> per iteration: FLAG_CLEAR + GLOBAL
  writeU32(view, capBase, capSent);
  writeU32(view, capSent + EXIT_TREE_LEFT_OFF, capNodes[0]);
  writeU32(view, capSent + EXIT_TREE_PARENT_OFF, capNodes[0]);
  writeU32(view, capSent + EXIT_TREE_RIGHT_OFF, capNodes[69]);
  writeU8(view, capSent + EXIT_TREE_ISNIL_OFF, 1);
  for (let i = 0; i < 70; i++) {
    const n = capNodes[i];
    writeU32(view, n + EXIT_TREE_LEFT_OFF, capSent);
    const parent = i === 0 ? capSent : capNodes[i - 1];
    const right = i === 69 ? capSent : capNodes[i + 1];
    writeU32(view, n + EXIT_TREE_PARENT_OFF, parent);
    writeU32(view, n + EXIT_TREE_RIGHT_OFF, right);
    writeU8(view, n + EXIT_TREE_ISNIL_OFF, 0);
    const key = "k" + String(i).padStart(2, "0");
    for (let b = 0; b < 16; b++) writeU8(view, n + EXIT_MAP_NODE_KEY_OFF + b, 0);
    for (let b = 0; b < key.length; b++) {
      writeU8(view, n + EXIT_MAP_NODE_KEY_OFF + b, key.charCodeAt(b));
    }
    writeU32(view, n + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_SIZE_OFF,
      key.length);
    writeU32(view, n + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_CAP_OFF, 0xf);
    writeU8(view, n + EXIT_MAP_NODE_FLAG_OFF, 1);
    writeU32(view, n + EXIT_MAP_NODE_BEGIN_OFF, 0);
    writeU32(view, n + EXIT_MAP_NODE_END_OFF, 0);
  }
  const capFlags = capNodes.map((n) => readU8(view, n + EXIT_MAP_NODE_FLAG_OFF));
  exp.rootMapWalkPlan(planBase, capBase, OUT);
  const capped = readWalkPlan(view, planBase);
  capNodes.forEach((n, i) => writeU8(view, n + EXIT_MAP_NODE_FLAG_OFF, capFlags[i]));
  const oCapped = exitRootMapWalkPlan(view, capBase, OUT);
  compareWalkPlan(capped, oCapped, "capped");
  assert.equal(capped.truncated, 1);
  assert.equal(capped.nodeCount, EXIT_ROOT_MAP_WALK_NODE_CAP);
  assert.equal(capped.flagClearCount, EXIT_ROOT_MAP_WALK_NODE_CAP);
  assert.equal(capped.globalHostCount, EXIT_ROOT_MAP_WALK_NODE_CAP);
  assert.equal(capped.eventCount, EXIT_ROOT_MAP_WALK_EVENT_CAP);
  // 64 iterations x 2 events each (flag clear + global) overflow the 64
  // word cap, so the LAST stored event is the global host of iteration 32.
  assert.equal(capped.events[EXIT_ROOT_MAP_WALK_EVENT_CAP - 1] >>> 0,
    walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0) >>> 0,
    "last capped event survives");

  // --- event-word payloads with high bits must survive the kind<<24|mask
  // encoding: place a walk image above 0x1000000 so payload >= 0x1000000.
  // This is the mutant that drops the & 0xffffff mask. ---
  const hiMap = hiBase;
  const hA = hiBase + 0x40;
  const hB = hiBase + 0xa0;
  const hElems = hiBase + 0x100;
  writeWalkTree(view, hiMap, {
    nodes: [
      { addr: hA, key: "a", flag: 1, elemBegin: 0, elemEnd: 0,
        left: hiBase + 0x20, parent: hB, right: hiBase + 0x20 },
      { addr: hB, key: "b", flag: 1, elemBegin: hElems,
        elemEnd: hElems + EXIT_MAP_ELEM_STRIDE,
        left: hA, parent: hiBase + 0x20, right: hiBase + 0x20 },
    ],
    root: hB,
    rightmost: hB,
  });
  const hiFlags = [readU8(view, hA + EXIT_MAP_NODE_FLAG_OFF),
    readU8(view, hB + EXIT_MAP_NODE_FLAG_OFF)];
  exp.rootMapWalkPlan(planBase, hiMap, OUT);
  const hi = readWalkPlan(view, planBase);
  writeU8(view, hA + EXIT_MAP_NODE_FLAG_OFF, hiFlags[0]);
  writeU8(view, hB + EXIT_MAP_NODE_FLAG_OFF, hiFlags[1]);
  const oHi = exitRootMapWalkPlan(view, hiMap, OUT);
  compareWalkPlan(hi, oHi, "high-payload");
  assert.ok(hi.events.some((e) => e >>> 0 ===
    walkWord(EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST,
      hElems + EXIT_MAP_ELEM_HOST_OFF) >>> 0),
    "elem-host payload above 0x1000000 survives the mask");
  assert.ok(hi.events.some((e) => e >>> 0 ===
    walkWord(EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR,
      hB + EXIT_MAP_NODE_FLAG_OFF) >>> 0),
    "flag-clear payload above 0x1000000 survives the mask");
});

test("Wasm vs JS differential: Game::Exit map walk plan (ABI v35)", () => {
  const exp = loadExports();
  // The module memory is FIXED at 258 pages (16.9MB); the first ~1MB is
  // free of this module's data, so the image strip lives at MEM+0x10000.
  const base = MEM + 0x10000;
  const planBase = base - 0x1000; // MEM + 0xf000
  const OUT = base + 0x20;
  const CASES = 500;
  const imgStride = 0x600;
  assert.ok(base + 0x400 + CASES * imgStride + 0x1000 <= exp.memory.buffer.byteLength,
    "differential images must fit the fixed memory");
  const view = new DataView(exp.memory.buffer);
  let seed = 0x6fa45735;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];

  let flagZeroSeen = 0;
  let flagSetSeen = 0;
  let elemSeen = 0;
  let flagClearSeen = 0;
  for (let ci = 0; ci < CASES; ci++) {
    // random NODE_COUNT in 1..6; heap-shaped tree with in-order keys so it
    // is a valid BST (find always hits every node's own key)
    const count = 1 + (rnd() % 6);
    const img = base + 0x400 + ci * imgStride;
    const sent = img + 0x20; // sentinel node, NOT the map dword
    const nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        addr: img + 0x40 + i * 0x60,
        flag: pick([0, 0, 1, 1, 1]),
        elemCount: pick([0, 0, 1, 2, 3]),
      });
    }
    // keys by in-order position of heap shape (valid BST ordering)
    const inOrder = [];
    const walkIn = (i) => {
      if (i >= count) return;
      walkIn(2 * i + 1);
      inOrder.push(i);
      walkIn(2 * i + 2);
    };
    walkIn(0);
    const keyOf = [];
    inOrder.forEach((heapIdx, pos) => { keyOf[heapIdx] = String.fromCharCode(0x61 + pos); });
    const elemBase = img + 0x40 + count * 0x60;
    const flagAddrs = [];
    for (let i = 0; i < count; i++) {
      const n = nodes[i];
      const parent = i === 0 ? sent : nodes[(i - 1) >> 1].addr;
      const left = 2 * i + 1 < count ? nodes[2 * i + 1].addr : sent;
      const right = 2 * i + 2 < count ? nodes[2 * i + 2].addr : sent;
      writeU32(view, n.addr + EXIT_TREE_LEFT_OFF, left);
      writeU32(view, n.addr + EXIT_TREE_PARENT_OFF, parent);
      writeU32(view, n.addr + EXIT_TREE_RIGHT_OFF, right);
      writeU8(view, n.addr + EXIT_TREE_ISNIL_OFF, 0);
      const key = keyOf[i];
      for (let b = 0; b < 16; b++) {
        writeU8(view, n.addr + EXIT_MAP_NODE_KEY_OFF + b, 0);
      }
      for (let b = 0; b < key.length; b++) {
        writeU8(view, n.addr + EXIT_MAP_NODE_KEY_OFF + b, key.charCodeAt(b));
      }
      writeU32(view, n.addr + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_SIZE_OFF,
        key.length);
      writeU32(view, n.addr + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_CAP_OFF,
        0xf);
      writeU8(view, n.addr + EXIT_MAP_NODE_FLAG_OFF, n.flag);
      const begin = n.elemCount === 0
        ? 0 : elemBase + i * 4 * EXIT_MAP_ELEM_STRIDE;
      writeU32(view, n.addr + EXIT_MAP_NODE_BEGIN_OFF, begin);
      writeU32(view, n.addr + EXIT_MAP_NODE_END_OFF,
        begin + n.elemCount * EXIT_MAP_ELEM_STRIDE);
      flagAddrs.push(n.addr + EXIT_MAP_NODE_FLAG_OFF);
    }
    // map dword -> sentinel; sentinel: left = leftmost, parent slot =
    // root, right = rightmost (MSVC header convention)
    writeU32(view, img, sent);
    writeU32(view, sent + EXIT_TREE_LEFT_OFF, nodes[inOrder[0]].addr);
    writeU32(view, sent + EXIT_TREE_PARENT_OFF, nodes[0].addr);
    writeU32(view, sent + EXIT_TREE_RIGHT_OFF, nodes[inOrder[count - 1]].addr);
    writeU8(view, sent + EXIT_TREE_ISNIL_OFF, 1);

    const before = flagAddrs.map((a) => readU8(view, a));
    exp.rootMapWalkPlan(planBase, img, OUT);
    const w = readWalkPlan(view, planBase);
    const wFlags = flagAddrs.map((a) => readU8(view, a));
    flagAddrs.forEach((a, i) => writeU8(view, a, before[i]));
    const o = exitRootMapWalkPlan(view, img, OUT);
    const oFlags = flagAddrs.map((a) => readU8(view, a));
    compareWalkPlan(w, o, `iter ${ci}`);
    assert.deepEqual(wFlags, oFlags, `iter ${ci} applied flags`);
    assert.ok(w.walkActive === 1, `iter ${ci} must walk (non-empty map)`);
    assert.equal(w.nodeCount, count, `iter ${ci} nodeCount`);

    if (nodes.some((n) => n.flag === 0)) flagZeroSeen++;
    if (nodes.some((n) => n.flag !== 0)) flagSetSeen++;
    if (w.elemHostCount > 0) elemSeen++;
    if (w.flagClearCount > 0) flagClearSeen++;
  }
  // coverage: the corpus must actually reach the interesting edges -- a
  // differential over cases that never diverge proves nothing.
  assert.ok(flagZeroSeen > 0, "corpus never saw a zero flag byte");
  assert.ok(flagSetSeen > 0, "corpus never saw a set flag byte");
  assert.ok(elemSeen > 0, "corpus never saw an elem-host loop");
  assert.ok(flagClearSeen > 0, "corpus never saw a flag clear");

  // Second pass: empty maps (walk skipped) and single-node maps.
  let emptySeen = 0;
  let singleSeen = 0;
  for (let ci = 0; ci < 100; ci++) {
    const img = base + 0x400 + ci * imgStride;
    const sent = img + 0x20;
    if (ci % 3 === 0) {
      writeU32(view, img, sent);
      writeU32(view, sent + EXIT_TREE_LEFT_OFF, sent);
      writeU32(view, sent + EXIT_TREE_PARENT_OFF, sent);
      writeU32(view, sent + EXIT_TREE_RIGHT_OFF, sent);
      writeU8(view, sent + EXIT_TREE_ISNIL_OFF, 1);
      exp.rootMapWalkPlan(planBase, img, OUT);
      const w = readWalkPlan(view, planBase);
      const o = exitRootMapWalkPlan(view, img, OUT);
      compareWalkPlan(w, o, `iter ${ci} empty`);
      assert.equal(w.walkActive, 0);
      emptySeen++;
    } else {
      writeU32(view, img, sent);
      const n = sent + 0x20; // single real node right after the sentinel
      writeU32(view, sent + EXIT_TREE_LEFT_OFF, n);
      writeU32(view, sent + EXIT_TREE_PARENT_OFF, n);
      writeU32(view, sent + EXIT_TREE_RIGHT_OFF, n);
      writeU8(view, sent + EXIT_TREE_ISNIL_OFF, 1);
      writeU32(view, n + EXIT_TREE_LEFT_OFF, sent);
      writeU32(view, n + EXIT_TREE_PARENT_OFF, sent);
      writeU32(view, n + EXIT_TREE_RIGHT_OFF, sent);
      writeU8(view, n + EXIT_TREE_ISNIL_OFF, 0);
      for (let b = 0; b < 16; b++) writeU8(view, n + EXIT_MAP_NODE_KEY_OFF + b, 0);
      writeU8(view, n + EXIT_MAP_NODE_KEY_OFF, 0x61);
      writeU32(view, n + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_SIZE_OFF, 1);
      writeU32(view, n + EXIT_MAP_NODE_KEY_OFF + EXIT_MSVC_STRING_CAP_OFF, 0xf);
      writeU8(view, n + EXIT_MAP_NODE_FLAG_OFF, 0);
      writeU32(view, n + EXIT_MAP_NODE_BEGIN_OFF, 0);
      writeU32(view, n + EXIT_MAP_NODE_END_OFF, 0);
      exp.rootMapWalkPlan(planBase, img, OUT);
      const w = readWalkPlan(view, planBase);
      const o = exitRootMapWalkPlan(view, img, OUT);
      compareWalkPlan(w, o, `iter ${ci} single`);
      assert.equal(w.walkActive, 1);
      assert.equal(w.nodeCount, 1);
      assert.equal(w.elemHostCount, 0);
      assert.equal(w.flagClearCount, 0);
      assert.equal(w.globalHostCount, 1);
      assert.equal(w.eventCount, 1);
      assert.equal(w.events[0] >>> 0,
        walkWord(EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST, 0) >>> 0);
      singleSeen++;
    }
  }
  assert.ok(emptySeen > 0, "second pass never produced an empty map");
  assert.ok(singleSeen > 0, "second pass never produced a single-node map");
});

test("v35+v36+v37+v38+v39+v40+v41+v42+v43 guards are not vacuous (self-check)", () => {
  const h = readFileSync(header, "utf8");
  // 1. Every v35 export is declared in the header AND exported from the
  //    Wasm module (an export listed but never asserted on is the failure
  //    mode this repo has shipped before).
  for (const name of [
    "isaac_exit_root_map_walk_flag_active",
    "isaac_exit_root_map_walk_elem_host_this",
    "isaac_exit_root_map_walk_flag_addr",
    "isaac_exit_root_map_walk_next",
    "isaac_exit_root_map_walk_elem_host_va",
    "isaac_exit_root_map_walk_global_va",
    "isaac_exit_root_map_walk_find_va",
    "isaac_exit_root_map_walk_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExitRootMapWalkPlan"), "plan struct in header");
  // 2. The ABI version is a single loud number everywhere tested here.
  assert.equal(EXIT_PURE_ABI_VERSION, HEADER_ABI_VERSION);
  assert.match(h, /ISAAC_EXIT_PURE_HELPERS_ABI_VERSION = 48/);
  //    the model contract so a broken import cannot silently pass.
  assert.equal(exitRootMapWalkFlagActive(0x100), false);
  assert.equal(exitRootMapWalkFlagActive(0xffffffff), true);
  // 4. The v36 FULL-dword presence test discriminates wide pointers: a
  //    pointer with a zero low byte (0x100) IS present; a byte-narrowed
  //    test would say absent — the uint8_t-defect class.
  assert.equal(typeof exit7df690SlotObjPresent, "function");
  assert.equal(exit7df690SlotCount(), 7);
  assert.equal(exit7df690SlotAddr(0x12340000, 1), 0x12340034);
  assert.equal(exit7df690SlotAddr(0xfffffff0, 2), 0xfffffff0 + 0x68 >>> 0);
  // 5. v37 FULL-dword 0x20000 gate: 0x100/0x1ff/0x2000 closed, 0x20000
  //    and 0xffffffff open. A sibling-confused 0x2000 mask would invert
  //    the 0x2000 vs 0x20000 pair.
  for (const name of [
    "isaac_exit_8650a0_flag_open",
    "isaac_exit_8650a0_host_needed",
    "isaac_exit_8650a0_flag_mask",
    "isaac_exit_8650a0_holder_off",
    "isaac_exit_8650a0_holder_addr",
    "isaac_exit_8650a0_pack_arg1",
    "isaac_exit_8650a0_pack_arg2",
    "isaac_exit_8650a0_registry_index",
    "isaac_exit_8650a0_unref_iat",
    "isaac_exit_8650a0_host_874a10_va",
    "isaac_exit_8650a0_pack_apply",
    "isaac_exit_8650a0_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit8650a0Plan"), "v37 plan struct in header");
  assert.equal(exit8650a0FlagOpen(0), 0);
  assert.equal(exit8650a0FlagOpen(0x100), 0, "0x100 closed");
  assert.equal(exit8650a0FlagOpen(0x1ff), 0, "0x1ff closed");
  assert.equal(exit8650a0FlagOpen(0x2000), 0, "sibling 0x2000 closed");
  assert.equal(exit8650a0FlagOpen(0x20000), 1, "0x20000 open");
  assert.equal(exit8650a0FlagOpen(0xffffffff), 1, "0xffffffff open");
  assert.equal(exit8650a0HolderAddr(0xfffffff8), 0x8, "holder wrap");
  assert.equal(exit8650a0PackArg1(), 0x11);
  assert.equal(exit8650a0PackArg2(), 0xffffffff);
  // 6. v38 UNSIGNED >1 gate: 0/1 closed, 2/0x100/0xffffffff open.
  //    A signed jle would close 0xffffffff; a byte test would close 0x100.
  for (const name of [
    "isaac_exit_686950_entry_open",
    "isaac_exit_686950_io_open",
    "isaac_exit_686950_host_needed",
    "isaac_exit_686950_remove_needed",
    "isaac_exit_686950_va",
    "isaac_exit_686950_body_bytes",
    "isaac_exit_686950_this_from_game",
    "isaac_exit_686950_state_value",
    "isaac_exit_686950_mgr_flag_off",
    "isaac_exit_686950_sprintf_va",
    "isaac_exit_686950_remove_iat",
    "isaac_exit_686950_mgr_flag_addr",
    "isaac_exit_686950_pack_apply",
    "isaac_exit_686950_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit686950Plan"), "v38 plan struct in header");
  assert.equal(exit686950EntryOpen(0), 0);
  assert.equal(exit686950EntryOpen(1), 0, "1 closed");
  assert.equal(exit686950EntryOpen(2), 1, "2 open");
  assert.equal(exit686950EntryOpen(0x100), 1, "0x100 open (not a byte test)");
  assert.equal(exit686950EntryOpen(0xffffffff), 1, "0xffffffff open (unsigned)");
  assert.equal(exit686950RemoveNeeded(0x100), 0, "0x100 is WRITE");
  assert.equal(exit686950MgrFlagAddr(0xfffb5439), 0, "flag off wrap");
  // 7. v39 FULL-dword [Manager+8]==2; UNSIGNED 26630==0; SIGNED lives>=1;
  //    LOW-BYTE player+0x173 / fa0. 0x102 closed (not a byte test);
  //    0x80000000 count closed (not signed jle); 0xffffffff lives closed.
  for (const name of [
    "isaac_exit_958ed0_entry_open",
    "isaac_exit_958ed0_count_ok",
    "isaac_exit_958ed0_vec_empty",
    "isaac_exit_958ed0_prefix_open",
    "isaac_exit_958ed0_challenge_needed",
    "isaac_exit_958ed0_challenge_ok",
    "isaac_exit_958ed0_host_needed",
    "isaac_exit_958ed0_pgd_needed",
    "isaac_exit_958ed0_va",
    "isaac_exit_958ed0_body_bytes",
    "isaac_exit_958ed0_flag_20dcc_off",
    "isaac_exit_958ed0_steam_iat",
    "isaac_exit_958ed0_fileno_iat",
    "isaac_exit_958ed0_flag_20dcc_addr",
    "isaac_exit_958ed0_pgd_this_addr",
    "isaac_exit_958ed0_prefix_apply",
    "isaac_exit_958ed0_copy_1ad14_apply",
    "isaac_exit_958ed0_store_1ad18_apply",
    "isaac_exit_958ed0_post_apply",
    "isaac_exit_958ed0_pgd_clear_apply",
    "isaac_exit_958ed0_tail_apply",
    "isaac_exit_958ed0_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit958ed0Plan"), "v39 plan struct in header");
  assert.equal(exit958ed0EntryOpen(2), 1, "2 open");
  assert.equal(exit958ed0EntryOpen(0x102), 0, "0x102 closed (not a byte test)");
  assert.equal(exit958ed0EntryOpen(0x100), 0, "0x100 closed");
  assert.equal(exit958ed0CountOk(0), 1);
  assert.equal(exit958ed0CountOk(0x80000000), 0, "0x80000000 unsigned closed");
  assert.equal(exit958ed0ChallengeOk(0x100, 0), 1, "0x100 byte0 skips lives");
  assert.equal(exit958ed0ChallengeOk(1, 0xffffffff), 0, "signed -1 closed");
  assert.equal(exit958ed0ChallengeOk(1, 1), 1, "lives 1 open");
  assert.equal(exit958ed0PgdNeeded(0x100), 0, "fa0 0x100 low byte 0");
  assert.equal(exit958ed0Flag20dccAddr(0xfffdf234), 0, "20dcc wrap");
  // 8. v40 UNSIGNED 26630==0; FULL-dword vec equality; single host
  //    GameState::Delete @ 0x9c8350; immediate stores f98=0 / byte14=1 /
  //    byte4b284=0. 0x80000000 count closed (not signed jle); 0x100==0x100
  //    vec IS empty (not a byte test).
  for (const name of [
    "isaac_exit_959130_entry_open",
    "isaac_exit_959130_vec_empty",
    "isaac_exit_959130_prefix_open",
    "isaac_exit_959130_host_needed",
    "isaac_exit_959130_va",
    "isaac_exit_959130_body_bytes",
    "isaac_exit_959130_delete_va",
    "isaac_exit_959130_gamestate_addr",
    "isaac_exit_959130_delete_apply",
    "isaac_exit_959130_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit959130Plan"), "v40 plan struct in header");
  assert.equal(exit959130EntryOpen(0), 1, "count 0 open");
  assert.equal(exit959130EntryOpen(0x80000000), 0, "0x80000000 unsigned closed");
  assert.equal(exit959130VecEmpty(0x100, 0x100), 1, "0x100==0x100 FULL-dword");
  assert.equal(exit959130VecEmpty(0x100, 0x200), 0, "0x100 vs 0x200 differ");
  assert.equal(exit959130GamestateAddr(0xfffff05c), 0, "0xfa4 wrap");
  assert.equal(EXIT_959130_DELETE_VA, 0x009c8350);
  // 9. v41 0x009a27d0 per-slot triple laws: FULL u32 index, OOB -> 0xffffffff
  //    (an 8-bit narrow would wrap slot 11+ onto 3); loop segment boundaries
  //    at 6/7; arg law == reset receiver (push ecx surviving from lea
  //    ecx,[esi+8]).
  for (const name of [
    "isaac_exit_9a27d0_slot_triple_base_off",
    "isaac_exit_9a27d0_slot_reset_off",
    "isaac_exit_9a27d0_slot_709150_off",
    "isaac_exit_9a27d0_slot_709150_arg",
    "isaac_exit_9a27d0_slot_loop_segment",
    "isaac_exit_9a27d0_slot_loop1_count",
    "isaac_exit_9a27d0_slot_loop2_count",
    "isaac_exit_9a27d0_slot_loop1_start_off",
    "isaac_exit_9a27d0_slot_loop2_start_off",
    "isaac_exit_9a27d0_slot_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit9a27d0SlotPlan"), "v41 slot plan struct in header");
  assert.equal(exit9a27d0SlotTripleBaseOff(0), 0x3cdc, "slot 0 base");
  assert.equal(exit9a27d0SlotTripleBaseOff(11), 0xffffffff, "OOB 11 not wrapped");
  assert.equal(exit9a27d0SlotTripleBaseOff(0xffffffff), 0xffffffff, "OOB WIDE");
  assert.equal(exit9a27d0SlotResetOff(0), 0x3cfc, "reset slot 0");
  assert.equal(exit9a27d0Slot709150Off(0), 0x3cf4, "709150 slot 0");
  assert.equal(exit9a27d0Slot709150Arg(0), 0x3cfc, "push ecx == reset recv");
  assert.equal(exit9a27d0SlotLoopSegment(0), 0, "direct");
  assert.equal(exit9a27d0SlotLoopSegment(6), 1, "6-loop last");
  assert.equal(exit9a27d0SlotLoopSegment(7), 2, "4-loop first");
  assert.equal(exit9a27d0SlotLoopSegment(10), 2, "4-loop last");
  assert.equal(exit9a27d0SlotLoop1Count(), 6);
  assert.equal(exit9a27d0SlotLoop2Count(), 4);
  assert.equal(exit9a27d0SlotPlan(0).baseOff, 0x3cdc);
  // 10. v42 0x008d3250 ordered host-event decision laws: cursor VA literal,
  //     GetLayer/Reset receiver offsets, layer-clear offset, list
  //     sentinel/header offsets, H5 arg pointer laws (wrap), and the plan
  //     whose cursor gate re-narrows the byte (+0x40d) while the list gate
  //     is a FULL-dword pointer (+0x1e8).
  for (const name of [
    "isaac_exit_8d3250_cursor_va",
    "isaac_exit_8d3250_getlayer_receiver_off",
    "isaac_exit_8d3250_layer_clear_off",
    "isaac_exit_8d3250_reset_receiver_off",
    "isaac_exit_8d3250_list_sentinel_off",
    "isaac_exit_8d3250_list_header_off",
    "isaac_exit_8d3250_list_destroy_arg1_ptr",
    "isaac_exit_8d3250_list_destroy_arg2",
    "isaac_exit_8d3250_host_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit8d3250HostPlan"), "v42 plan struct in header");
  assert.equal(exit8d3250CursorVa(), 0xb75734, "Cursor literal");
  assert.equal(exit8d3250GetLayerReceiverOff(), 0x304, "GetLayer receiver");
  assert.equal(exit8d3250LayerClearOff(), 0x74, "layer byte clear off");
  assert.equal(exit8d3250ResetReceiverOff(), 0x64, "ANM2::Reset receiver");
  assert.equal(exit8d3250ListSentinelOff(), 0x120, "sentinel off");
  assert.equal(exit8d3250ListHeaderOff(), 0x120, "header off");
  assert.equal(exit8d3250ListDestroyArg1Ptr(0x1234), 0x1238, "arg1 ptr +4");
  assert.equal(exit8d3250ListDestroyArg1Ptr(0xfffffffc), 0, "arg1 ptr wrap");
  assert.equal(exit8d3250ListDestroyArg2(0x1000), 0x1120, "arg2 = obj+0x120");
  assert.equal(exit8d3250ListDestroyArg2(0xfffffee0), 0, "arg2 wrap");
  // Plan gates: cursor gate re-narrows the byte (0x100 -> low byte 0);
  // list gate is a full-dword pointer (0x100 IS non-null).
  const plan00 = exit8d3250HostPlan(0, 0);
  assert.equal(plan00.cursorGate, 0);
  assert.equal(plan00.listGate, 0);
  const plan11 = exit8d3250HostPlan(1, 0x100);
  assert.equal(plan11.cursorGate, 1, "byte 1 -> gate");
  assert.equal(plan11.listGate, 1, "0x100 ptr full-dword -> gate");
  const planWide = exit8d3250HostPlan(0x100, 0);
  assert.equal(planWide.cursorGate, 0, "0x100 low byte 0 -> closed");
  assert.equal(planWide.listGate, 0);
  assert.equal(plan11.cursorVa, 0xb75734);
  assert.equal(plan11.listObjOff, 0x1e8);
  assert.equal(plan11.listSentinelOff, 0x120);
  assert.equal(plan11.listHeaderOff, 0x120);
  // 8. v43 host 0x00a648b0 body decision laws: header + Wasm exports +
  //    model agree, and the two base laws differ exactly on the trap.
  for (const name of [
    "isaac_exit_a648b0_mode_path",
    "isaac_exit_a648b0_mode_stats",
    "isaac_exit_a648b0_mode2_stats_base_ptr",
    "isaac_exit_a648b0_mode2_addend_lo_va",
    "isaac_exit_a648b0_mode2_addend_hi_va",
    "isaac_exit_a648b0_stats_add_lo",
    "isaac_exit_a648b0_stats_add_carry",
    "isaac_exit_a648b0_stats_add_hi",
    "isaac_exit_a648b0_stats_add",
    "isaac_exit_a648b0_mode_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExitA648b0ModePlan"), "v43 plan struct in header");
  assert.ok(h.includes("IsaacExitA648b0StatsAdd"), "v43 add struct in header");
  assert.equal(exitA648b0ModePath(0), 0, "mode 0 empty");
  assert.equal(exitA648b0ModePath(1), 1, "mode 1 free");
  assert.equal(exitA648b0ModePath(2), 2, "mode 2 stats-add");
  assert.equal(exitA648b0ModePath(0x100), 0, "wide 0x100 -> low byte 0");
  assert.equal(exitA648b0ModeStats(), 2, "mode 2 constant");
  assert.equal(exitA648b0Mode2StatsBasePtr(0), 0x30, "mode-2 direct base");
  assert.notEqual(
    exitA648b0Mode2StatsBasePtr(0),
    exitA648b0HeapStatsBase(0),
    "mode-2 base must NOT take the mode-1 0xc7f618 fallback",
  );
  assert.equal(exitA648b0Mode2AddendLoVa(), 0xc7f618, "addend lo VA");
  assert.equal(exitA648b0Mode2AddendHiVa(), 0xc7f61c, "addend hi VA");
  assert.equal(exitA648b0StatsAddCarry(0xfffffff0, 0x20), 1, "carry out");
  assert.equal(exitA648b0StatsAddHi(0xfffffffc, 0xffffffff, 0x7, 0x1), 1, "64-bit wrap");
  const g43p = exitA648b0ModePlan(1, 0x40, 0x5000, 3, 8, 4, 9, 10);
  assert.equal(g43p.path, 1);
  assert.equal(g43p.statsBase, 0x5030, "mode-1 select base");
  assert.equal(g43p.loAfter, 0xffffffff, "3-4 wraps");
  assert.equal(g43p.hiAfter, 7, "borrow reaches hi");
  assert.equal(g43p.freePtr, 0x3c, "free ptr edx-4");
  const g43t = exitA648b0ModePlan(2, 0, 0, 0xfffffff0, 0x100, 4, 0x20, 0x200);
  assert.equal(g43t.statsBase, 0x30, "mode-2 direct base at g==0");
  assert.equal(g43t.loAfter, 0x10, "add wraps");
  assert.equal(g43t.hiAfter, 0x301, "carry into hi");
});

// ===========================================================================
// ABI v36: complete body of 0x007df690 (7-slot volume setter)
// PE 0x007df690..0x007df70a (123 bytes). Per slot s = this + i*0x34
// (i = 0..6): obj0 = [s]; skip when 0; HOST gate vtable[obj0]+0x28();
// when open: obj1 = [s] RE-READ, STORE [s+0x14] = float, and when obj1
// != 0 HOST set vtable[obj1]+0x58(float). Gate outcomes and the [s]
// recapture are host-side; the pure surface (slot math, presence census,
// float store) is what the exports below pin.
// ===========================================================================

// IsaacExit7df690Plan layout: i32 slot_count @0, i32 obj_present_count @4,
// u32 slot_addr[7] @8 -> total 36 bytes.
const PLAN_7DF690 = {
  slotCount: 0,
  objPresentCount: 4,
  slotAddr: 8,
  size: 8 + 7 * 4,
};

function read7df690Plan(view, base) {
  const slotAddr = [];
  for (let i = 0; i < 7; i++) {
    slotAddr.push(readU32(view, base + PLAN_7DF690.slotAddr + i * 4));
  }
  return {
    slotCount: view.getInt32(base + PLAN_7DF690.slotCount, true),
    objPresentCount: view.getInt32(base + PLAN_7DF690.objPresentCount, true),
    slotAddr,
  };
}

function compare7df690Plan(w, o, tag) {
  assert.equal(w.slotCount, o.slotCount, `${tag}: slotCount`);
  assert.equal(w.objPresentCount, o.objPresentCount, `${tag}: objPresentCount`);
  assert.deepEqual(w.slotAddr, o.slotAddr, `${tag}: slotAddr`);
}

test("Wasm/JS: 0x007df690 slot plan + apply (ABI v36)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  const view = new DataView(exp.memory.buffer);
  const img = MEM + 0x40000; // strip clear of the other tests' regions

  // --- constants ---
  assert.equal(exp["7df690SlotCount"](), 7);
  assert.equal(exit7df690SlotCount(), 7);
  assert.equal(exp["7df690FloatOff"](), 0x14);
  assert.equal(exit7df690FloatOff(), EXIT_7DF690_FLOAT_OFF);
  assert.equal(exp["7df690GateVtblOff"](), 0x28);
  assert.equal(exit7df690GateVtblOff(), EXIT_7DF690_GATE_VTBL_OFF);
  assert.equal(exp["7df690SetVtblOff"](), 0x58);
  assert.equal(exit7df690SetVtblOff(), EXIT_7DF690_SET_VTBL_OFF);

  // --- slot address math: linear, wrap, OOB ---
  for (let i = 0; i < 7; i++) {
    const expected = (0x1000 + i * 0x34) >>> 0;
    assert.equal(exp["7df690SlotAddr"](0x1000, i), expected, `slot ${i}`);
    assert.equal(exit7df690SlotAddr(0x1000, i), expected, `oracle slot ${i}`);
  }
  // 32-bit wrap: receiver 0xfffffff0 + slot 3*0x34 = 0xfffffff0+0x9c
  assert.equal(exp["7df690SlotAddr"](0xfffffff0, 3), 0x8c);
  assert.equal(exit7df690SlotAddr(0xfffffff0, 3), 0x8c);
  // OOB index -> 0 (the PE loop is fixed at 7 iterations)
  assert.equal(exp["7df690SlotAddr"](0x1000, 7), 0);
  assert.equal(exp["7df690SlotAddr"](0x1000, 0xffffffff), 0);
  assert.equal(exit7df690SlotAddr(0x1000, 7), 0);

  // --- FULL-dword presence test: wide pointers (the uint8_t-defect
  // class — 0x100 has a zero low byte and MUST be present) ---
  const pBase = img;
  writeU32(view, pBase, 0);
  writeU32(view, pBase + 4, 0x100);       // low byte 0 -> present
  writeU32(view, pBase + 8, 0x1ff);       // wide -> present
  writeU32(view, pBase + 0xc, 0xffffffff);
  writeU32(view, pBase + 0x10, 0x12345678);
  assert.equal(exp["7df690SlotObjPresent"](pBase), 0);
  assert.equal(exit7df690SlotObjPresent(view, pBase), 0);
  assert.equal(exp["7df690SlotObjPresent"](pBase + 4), 1, "0x100 present");
  assert.equal(exit7df690SlotObjPresent(view, pBase + 4), 1);
  assert.equal(exp["7df690SlotObjPresent"](pBase + 8), 1, "0x1ff present");
  assert.equal(exp["7df690SlotObjPresent"](pBase + 0xc), 1, "0xffffffff present");
  assert.equal(exp["7df690SlotObjPresent"](pBase + 0x10), 1);

  // --- apply: raw u32 float bits at slot+0x14; the byte-mask mutant
  // would truncate 0xffffffff to 0xff ---
  const slot = img + 0x200;
  writeU32(view, slot + 0x14, 0);
  const storedAt = exp["7df690Apply"](slot, 0x3f800000);
  assert.equal(storedAt, (slot + 0x14) >>> 0, "apply returns store address");
  assert.equal(readU32(view, slot + 0x14), 0x3f800000);
  assert.equal(exit7df690Apply(view, slot, 0x3f800000),
    (slot + 0x14) >>> 0);
  assert.equal(readU32(view, slot + 0x14), 0x3f800000);
  exp["7df690Apply"](slot, 0xffffffff);
  assert.equal(readU32(view, slot + 0x14), 0xffffffff,
    "high float bits survive (no byte truncation)");
  assert.equal(exit7df690Apply(view, slot, 0xdeadbeef), (slot + 0x14) >>> 0);
  assert.equal(readU32(view, slot + 0x14), 0xdeadbeef);
  // wrap: slot near 0xffffffff -> store address wraps
  const wrapSlot = 0xfffffff0;
  assert.equal(exp["7df690Apply"](wrapSlot, 0x12345678), 0x4, "apply wraps");

  // --- plan: mixed presence over 7 slots ---
  const recv = img + 0x400;
  for (let i = 0; i < 7; i++) {
    writeU32(view, recv + i * 0x34, 0);
  }
  // present: slots 1 (0x100 — zero low byte), 3 (0x10000000), 4, 6
  writeU32(view, recv + 1 * 0x34, 0x100);
  writeU32(view, recv + 3 * 0x34, 0x10000000);
  writeU32(view, recv + 4 * 0x34, 0x22222222);
  writeU32(view, recv + 6 * 0x34, 0xffffffff);
  const planBase = img + 0x800;
  exp["7df690Plan"](planBase, recv);
  const w = read7df690Plan(view, planBase);
  assert.equal(w.slotCount, 7);
  assert.equal(w.objPresentCount, 4, "wide pointers count as present");
  for (let i = 0; i < 7; i++) {
    assert.equal(w.slotAddr[i], (recv + i * 0x34) >>> 0, `plan slot ${i}`);
  }
  const o = exit7df690Plan(view, recv);
  compare7df690Plan(w, o, "fixed plan");
  assert.equal(o.objPresentCount, 4);

  // second plan image: only slot 2 holds a wide pointer (0x100, low byte
  // zero) — presence must count it. (The wrap in slot_addr is pinned by
  // the scalar pins above; a wrapped receiver whose slots leave the
  // 16.9MB linear memory is not a meaningful wasm-side image.)
  const recv2 = img + 0x1000;
  for (let i = 0; i < 7; i++) {
    writeU32(view, recv2 + i * 0x34, 0);
  }
  writeU32(view, recv2 + 2 * 0x34, 0x100);
  exp["7df690Plan"](planBase, recv2);
  const w2 = read7df690Plan(view, planBase);
  const o2 = exit7df690Plan(view, recv2);
  compare7df690Plan(w2, o2, "second plan");
  assert.equal(w2.objPresentCount, 1);
  assert.equal(w2.slotAddr[2], (recv2 + 0x68) >>> 0);
  // apply wrap: the store address wraps while the write target (addr 4)
  // stays inside the linear memory.
  writeU32(view, 4, 0);
  assert.equal(exp["7df690Apply"](0xfffffff0, 0x12345678), 4);
  assert.equal(readU32(view, 4), 0x12345678);
});

test("Wasm vs JS differential: 0x007df690 slot plan (ABI v36)", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  const planBase = MEM + 0x60000;
  const CASES = 300;
  let seed = 0x7df69036;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];

  let presentSeen = 0;
  let absentSeen = 0;
  for (let ci = 0; ci < CASES; ci++) {
    // Directly-writable strip (fixed receiver) so both presence classes
    // are exercised every case; pointer values include wide ones with a
    // zero low byte (0x100 / 0x10000000) — the byte-narrowing trap.
    const img = MEM + 0x64000 + ci * 0x80;
    const fixed = img + 0x40;
    for (let i = 0; i < 7; i++) {
      const v = pick([0, 0, 0x100, 0xffffffff, 0x10000000, 0x12345678]);
      writeU32(view, fixed + i * 0x34, v);
    }
    exp["7df690Plan"](planBase, fixed);
    const w = read7df690Plan(view, planBase);
    const o = exit7df690Plan(view, fixed);
    compare7df690Plan(w, o, `case ${ci}`);
    assert.equal(w.objPresentCount, o.objPresentCount);
    presentSeen += w.objPresentCount;
    absentSeen += 7 - w.objPresentCount;
  }
  assert.ok(presentSeen > 0, "differential never saw a present slot");
  assert.ok(absentSeen > 0, "differential never saw an absent slot");
});

test("v36 guards are not vacuous (self-check)", () => {
  const h = readFileSync(header, "utf8");
  for (const name of [
    "isaac_exit_7df690_slot_count",
    "isaac_exit_7df690_slot_addr",
    "isaac_exit_7df690_float_off",
    "isaac_exit_7df690_gate_vtbl_off",
    "isaac_exit_7df690_set_vtbl_off",
    "isaac_exit_7df690_slot_obj_present",
    "isaac_exit_7df690_apply",
    "isaac_exit_7df690_plan",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  assert.ok(h.includes("IsaacExit7df690Plan"), "plan struct in header");
  // The full-dword presence semantics: 0x100 (low byte 0) is present.
  assert.equal(exit7df690SlotAddr(0x1000, 7), 0, "OOB index -> 0");
  assert.equal(exit7df690SlotCount(), EXIT_7DF690_SLOT_COUNT);
  assert.equal(EXIT_7DF690_SLOT_STRIDE, 0x34);
  assert.equal(EXIT_7DF690_FLOAT_OFF, 0x14);
  assert.equal(EXIT_7DF690_GATE_VTBL_OFF, 0x28);
  assert.equal(EXIT_7DF690_SET_VTBL_OFF, 0x58);
});

// ===========================================================================
// ABI v37: Exit-root prologue 0x008650a0 (217 B)
// PE 0x008650a0..0x00865178. FULL-dword test [eax], 0x20000; pack stores
// {holder=[engine+0x10], 0x11, -1} in PE order arg1/arg2/holder; hosts
// 0x874a10 + IAT luaL_unref on the open arm. SEH unwinder stays host.
// ===========================================================================

const PLAN_8650A0 = {
  flagOpen: 0,
  host874a10Needed: 4,
  hostUnrefNeeded: 8,
  holderAddr: 12,
  packArg1: 16,
  packArg2: 20,
  shouldSave: 24,
  size: 28,
};

function read8650a0Plan(view, base) {
  return {
    flagOpen: view.getInt32(base + PLAN_8650A0.flagOpen, true),
    host874a10Needed: view.getInt32(base + PLAN_8650A0.host874a10Needed, true),
    hostUnrefNeeded: view.getInt32(base + PLAN_8650A0.hostUnrefNeeded, true),
    holderAddr: readU32(view, base + PLAN_8650A0.holderAddr),
    packArg1: readU32(view, base + PLAN_8650A0.packArg1),
    packArg2: readU32(view, base + PLAN_8650A0.packArg2),
    shouldSave: readU32(view, base + PLAN_8650A0.shouldSave),
  };
}

function compare8650a0Plan(w, o, tag) {
  assert.equal(w.flagOpen, o.flagOpen, `${tag}: flagOpen`);
  assert.equal(w.host874a10Needed, o.host874a10Needed, `${tag}: host874a10`);
  assert.equal(w.hostUnrefNeeded, o.hostUnrefNeeded, `${tag}: hostUnref`);
  assert.equal(w.holderAddr, o.holderAddr, `${tag}: holderAddr`);
  assert.equal(w.packArg1, o.packArg1, `${tag}: packArg1`);
  assert.equal(w.packArg2, o.packArg2, `${tag}: packArg2`);
  assert.equal(w.shouldSave, o.shouldSave, `${tag}: shouldSave`);
}

test("Wasm/JS: 0x008650a0 gate + pack apply (ABI v37)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  const view = new DataView(exp.memory.buffer);
  const img = MEM + 0x70000;

  // --- constants ---
  assert.equal(exp["8650a0FlagMask"](), 0x20000);
  assert.equal(exit8650a0FlagMask(), EXIT_8650A0_FLAG_MASK);
  assert.equal(exp["8650a0HolderOff"](), 0x10);
  assert.equal(exit8650a0HolderOff(), EXIT_8650A0_HOLDER_OFF);
  assert.equal(exp["8650a0PackArg1"](), 0x11);
  assert.equal(exit8650a0PackArg1(), EXIT_8650A0_PACK_ARG1);
  assert.equal(exp["8650a0PackArg2"]() >>> 0, 0xffffffff);
  assert.equal(exit8650a0PackArg2(), EXIT_8650A0_PACK_ARG2 >>> 0);
  assert.equal(exp["8650a0RegistryIndex"]() >>> 0, 0xfff0b9d8);
  assert.equal(exit8650a0RegistryIndex(), EXIT_8650A0_REGISTRY_INDEX >>> 0);
  assert.equal(exp["8650a0UnrefIat"](), 0x00b1831c);
  assert.equal(exit8650a0UnrefIat(), EXIT_8650A0_UNREF_IAT);
  assert.equal(exp["8650a0Host874a10Va"](), 0x00874a10);
  assert.equal(exit8650a0Host874a10Va(), EXIT_8650A0_HOST_874A10_VA);
  assert.equal(EXIT_8650A0_VA, 0x008650a0);
  assert.equal(EXIT_8650A0_BODY_BYTES, 217);
  assert.equal(EXIT_8650A0_RET_BYTES, 4);
  assert.equal(EXIT_8650A0_ENGINE_GLOBAL_DAT, 0x00c71690);

  // --- FULL-dword 0x20000 gate (wide values; sibling 0x2000 is CLOSED) ---
  const closed = [0, 0x100, 0x1ff, 0x2000, 0xffff, 0x1ffff];
  const open = [0x20000, 0x30000, 0xffffffff, 0x20000 | 0x100];
  for (const v of closed) {
    assert.equal(exp["8650a0FlagOpen"](v), 0, `wasm closed ${v.toString(16)}`);
    assert.equal(exit8650a0FlagOpen(v), 0, `oracle closed ${v.toString(16)}`);
    assert.equal(exp["8650a0HostNeeded"](v), 0);
    assert.equal(exit8650a0HostNeeded(v), 0);
  }
  for (const v of open) {
    assert.equal(exp["8650a0FlagOpen"](v), 1, `wasm open ${v.toString(16)}`);
    assert.equal(exit8650a0FlagOpen(v), 1, `oracle open ${v.toString(16)}`);
    assert.equal(exp["8650a0HostNeeded"](v), 1);
    assert.equal(exit8650a0HostNeeded(v), 1);
  }

  // --- holder pointer math: linear + wrap ---
  assert.equal(exp["8650a0HolderAddr"](0x1000), 0x1010);
  assert.equal(exit8650a0HolderAddr(0x1000), 0x1010);
  assert.equal(exp["8650a0HolderAddr"](0xfffffff8), 0x8);
  assert.equal(exit8650a0HolderAddr(0xfffffff8), 0x8);
  assert.equal(exp["8650a0HolderAddr"](0xffffffff), 0xf);

  // --- pack apply: PE order arg1/+4, arg2/+8, holder/+0 LAST ---
  const pack = img + 0x200;
  writeU32(view, pack, 0x11111111);
  writeU32(view, pack + 4, 0x22222222);
  writeU32(view, pack + 8, 0x33333333);
  const ret = exp["8650a0PackApply"](pack, 0xabcdef01);
  assert.equal(ret, pack >>> 0, "apply returns pack_base");
  assert.equal(readU32(view, pack), 0xabcdef01, "holder at +0");
  assert.equal(readU32(view, pack + 4), 0x11, "arg1 at +4");
  assert.equal(readU32(view, pack + 8), 0xffffffff, "arg2 at +8");
  assert.equal(exit8650a0PackApply(view, pack, 0xdeadbeef), pack >>> 0);
  assert.equal(readU32(view, pack), 0xdeadbeef);
  assert.equal(readU32(view, pack + 4), 0x11);
  assert.equal(readU32(view, pack + 8), 0xffffffff);
  // wrap of the pack addresses is pinned as 32-bit math; a wasm store
  // at 0xfffffffc is outside linear memory, same class as v36's
  // wrapped-receiver note.
  assert.equal((0xfffffffc + 4) >>> 0, 0);
  assert.equal((0xfffffffc + 8) >>> 0, 4);
  assert.equal(exit8650a0HolderAddr(0xfffffff0), 0x0);

  // --- plan: closed vs open, wide ShouldSave pass-through ---
  const planBase = img + 0x400;
  exp["8650a0Plan"](planBase, 0x100, 0x12340000, 0xffffffff);
  const wClosed = read8650a0Plan(view, planBase);
  const oClosed = exit8650a0Plan(0x100, 0x12340000, 0xffffffff);
  compare8650a0Plan(wClosed, oClosed, "closed 0x100");
  assert.equal(wClosed.flagOpen, 0);
  assert.equal(wClosed.host874a10Needed, 0);
  assert.equal(wClosed.hostUnrefNeeded, 0);
  assert.equal(wClosed.holderAddr, 0x12340010);
  assert.equal(wClosed.packArg1, 0x11);
  assert.equal(wClosed.packArg2, 0xffffffff);
  assert.equal(wClosed.shouldSave, 0xffffffff, "ShouldSave unmasked");

  exp["8650a0Plan"](planBase, 0x20000, 0xfffffff0, 0x100);
  const wOpen = read8650a0Plan(view, planBase);
  const oOpen = exit8650a0Plan(0x20000, 0xfffffff0, 0x100);
  compare8650a0Plan(wOpen, oOpen, "open 0x20000");
  assert.equal(wOpen.flagOpen, 1);
  assert.equal(wOpen.host874a10Needed, 1);
  assert.equal(wOpen.hostUnrefNeeded, 1);
  assert.equal(wOpen.holderAddr, 0x0, "engine 0xfffffff0 + 0x10 wraps");
  assert.equal(wOpen.shouldSave, 0x100, "0x100 ShouldSave not byte-narrowed");
});

test("Wasm vs JS differential: 0x008650a0 plan (ABI v37)", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  const planBase = MEM + 0x78000;
  const CASES = 300;
  let seed = 0x8650a037;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];

  let openSeen = 0;
  let closedSeen = 0;
  for (let ci = 0; ci < CASES; ci++) {
    const flag = pick([
      0, 0x100, 0x1ff, 0x2000, 0x20000, 0xffffffff, 0x20000 | 0x1, rnd(),
    ]);
    const engine = pick([0, 0x1000, 0xfffffff0, 0xfffffff8, rnd()]);
    const should = pick([0, 1, 0x100, 0x1ff, 0xffffffff, rnd()]);
    exp["8650a0Plan"](planBase, flag, engine, should);
    const w = read8650a0Plan(view, planBase);
    const o = exit8650a0Plan(flag, engine, should);
    compare8650a0Plan(w, o, `case ${ci}`);
    if (w.flagOpen) openSeen += 1;
    else closedSeen += 1;
  }
  assert.ok(openSeen > 0, "differential never saw an open gate");
  assert.ok(closedSeen > 0, "differential never saw a closed gate");
});

// ===========================================================================
// ABI v38: Exit nest 0x00686950 (384 B; 1075 B window is 3 funcs)
// PE 0x00686950..0x00686acf. UNSIGNED cmp dword [this],1 / jbe; pack
// stores {4, 0, byte Manager+0x4abc7=1} BEFORE I/O gates. sprintf /
// remove IAT / fopen / virtuals stay host.
// ===========================================================================

const PLAN_686950 = {
  entryOpen: 0,
  packNeeded: 4,
  hostIoNeeded: 8,
  hostRemoveNeeded: 12,
  hostWriteNeeded: 16,
  mgrFlagAddr: 20,
  thisAddr: 24,
  size: 28,
};

function read686950Plan(view, base) {
  return {
    entryOpen: view.getInt32(base + PLAN_686950.entryOpen, true),
    packNeeded: view.getInt32(base + PLAN_686950.packNeeded, true),
    hostIoNeeded: view.getInt32(base + PLAN_686950.hostIoNeeded, true),
    hostRemoveNeeded: view.getInt32(base + PLAN_686950.hostRemoveNeeded, true),
    hostWriteNeeded: view.getInt32(base + PLAN_686950.hostWriteNeeded, true),
    mgrFlagAddr: readU32(view, base + PLAN_686950.mgrFlagAddr),
    thisAddr: readU32(view, base + PLAN_686950.thisAddr),
  };
}

function compare686950Plan(w, o, tag) {
  assert.equal(w.entryOpen, o.entryOpen, `${tag}: entryOpen`);
  assert.equal(w.packNeeded, o.packNeeded, `${tag}: packNeeded`);
  assert.equal(w.hostIoNeeded, o.hostIoNeeded, `${tag}: hostIo`);
  assert.equal(w.hostRemoveNeeded, o.hostRemoveNeeded, `${tag}: hostRemove`);
  assert.equal(w.hostWriteNeeded, o.hostWriteNeeded, `${tag}: hostWrite`);
  assert.equal(w.mgrFlagAddr, o.mgrFlagAddr, `${tag}: mgrFlagAddr`);
  assert.equal(w.thisAddr, o.thisAddr, `${tag}: thisAddr`);
}

test("Wasm/JS: 0x00686950 gate + pack apply (ABI v38)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  const view = new DataView(exp.memory.buffer);
  const img = MEM + 0x80000;

  assert.equal(exp["686950Va"](), 0x00686950);
  assert.equal(exit686950Va(), EXIT_686950_VA);
  assert.equal(exp["686950BodyBytes"](), 384);
  assert.equal(exit686950BodyBytes(), EXIT_686950_BODY_BYTES);
  assert.equal(EXIT_686950_WINDOW_BYTES, 1075);
  assert.equal(exp["686950ThisFromGame"](), 0x68d78);
  assert.equal(exit686950ThisFromGame(), EXIT_686950_THIS_FROM_GAME);
  assert.equal(exp["686950StateValue"](), 4);
  assert.equal(exit686950StateValue(), EXIT_686950_STATE_VALUE);
  assert.equal(exp["686950MgrFlagOff"](), 0x4abc7);
  assert.equal(exit686950MgrFlagOff(), EXIT_686950_MGR_FLAG_OFF);
  assert.equal(exp["686950SprintfVa"](), 0x0041e420);
  assert.equal(exit686950SprintfVa(), EXIT_686950_SPRINTF_VA);
  assert.equal(exp["686950RemoveIat"](), 0x00b187cc);
  assert.equal(exit686950RemoveIat(), EXIT_686950_REMOVE_IAT);

  const closed = [0, 1];
  const open = [2, 3, 0x100, 0x1ff, 0x80000000, 0xffffffff];
  for (const v of closed) {
    assert.equal(exp["686950EntryOpen"](v), 0, `wasm closed ${v.toString(16)}`);
    assert.equal(exit686950EntryOpen(v), 0, `oracle closed ${v.toString(16)}`);
  }
  for (const v of open) {
    assert.equal(exp["686950EntryOpen"](v), 1, `wasm open ${v.toString(16)}`);
    assert.equal(exit686950EntryOpen(v), 1, `oracle open ${v.toString(16)}`);
  }

  // I/O: vec mismatch closes; 0x80000000 count does NOT skip 26638.
  assert.equal(exp["686950IoOpen"](1, 2, 0, 0, 0, 1, 1), 0, "vec mismatch");
  assert.equal(exit686950IoOpen(1, 2, 0, 0, 0, 1, 1), 0);
  assert.equal(exp["686950IoOpen"](5, 5, 0, 0, 0, 1, 1), 1, "null game skips 26638");
  assert.equal(exit686950IoOpen(5, 5, 0, 0, 0, 1, 1), 1);
  assert.equal(exp["686950IoOpen"](0, 0, 0x1000, 0, 0, 1, 1), 1, "count 0 skips 26638");
  assert.equal(
    exp["686950IoOpen"](0, 0, 0x1000, 1, 0, 1, 1), 0, "count>0 byte0 fails",
  );
  assert.equal(
    exp["686950IoOpen"](0, 0, 0x1000, 0x80000000, 0, 1, 1), 0,
    "0x80000000 still tests 26638",
  );
  assert.equal(exit686950IoOpen(0, 0, 0x1000, 0x80000000, 0, 1, 1), 0);
  assert.equal(
    exp["686950IoOpen"](0, 0, 0x1000, 0x80000000, 1, 1, 1), 1,
    "0x80000000 + byte1 opens",
  );
  assert.equal(exp["686950IoOpen"](0, 0, 0, 0, 0, 0x100, 1), 0, "2a398 0x100 low byte 0");
  assert.equal(exp["686950IoOpen"](0, 0, 0, 0, 0, 0x101, 1), 1, "2a398 0x101 low byte 1");
  assert.equal(exit686950IoOpen(0, 0, 0, 0, 0, 0x100, 1), 0);
  assert.equal(exit686950IoOpen(0, 0, 0, 0, 0, 0x101, 1), 1);
  assert.equal(exp["686950IoOpen"](0, 0, 0, 0, 0, 1, 0x100), 0, "2a3a1 0x100 low byte 0");
  assert.equal(exp["686950IoOpen"](0, 0, 0, 0, 0, 1, 0x101), 1, "2a3a1 0x101 low byte 1");

  assert.equal(exp["686950RemoveNeeded"](0), 1);
  assert.equal(exp["686950RemoveNeeded"](0x100), 0, "0x100 is WRITE");
  assert.equal(exit686950RemoveNeeded(0xffffffff), 0);

  // host_needed = entry && io
  assert.equal(exp["686950HostNeeded"](0, 0, 0, 0, 0, 0, 1, 1), 0, "entry closed");
  assert.equal(exp["686950HostNeeded"](2, 1, 2, 0, 0, 0, 1, 1), 0, "io closed");
  assert.equal(exp["686950HostNeeded"](2, 0, 0, 0, 0, 0, 1, 1), 1);

  // flag address wrap
  assert.equal(exp["686950MgrFlagAddr"](0x1000), 0x1000 + 0x4abc7);
  assert.equal(exit686950MgrFlagAddr(0x1000), 0x1000 + 0x4abc7);
  const wrapMgr = (0x100000000 - 0x4abc7) >>> 0;
  assert.equal(exp["686950MgrFlagAddr"](wrapMgr), 0);
  assert.equal(exit686950MgrFlagAddr(wrapMgr), 0);

  // pack apply PE order; I/O-closed still stores (driver uses pack_needed)
  const thisAddr = img + 0x200;
  const manager = img + 0x400;
  writeU32(view, thisAddr, 0x11111111);
  writeU32(view, thisAddr + 4, 0x22222222);
  view.setUint8(manager + 0x4abc7, 0x99);
  const ret = exp["686950PackApply"](thisAddr, manager);
  assert.equal(ret, thisAddr >>> 0, "apply returns this");
  assert.equal(readU32(view, thisAddr), 4, "[this]=4 first");
  assert.equal(readU32(view, thisAddr + 4), 0, "[this+4]=0 second");
  assert.equal(view.getUint8(manager + 0x4abc7), 1, "flag byte last");
  writeU32(view, thisAddr, 0xaaaaaaaa);
  writeU32(view, thisAddr + 4, 0xbbbbbbbb);
  view.setUint8(manager + 0x4abc7, 0);
  assert.equal(exit686950PackApply(view, thisAddr, manager), thisAddr >>> 0);
  assert.equal(readU32(view, thisAddr), 4);
  assert.equal(readU32(view, thisAddr + 4), 0);
  assert.equal(view.getUint8(manager + 0x4abc7), 1);

  const planBase = img + 0x800;
  // entry closed: no pack, no I/O, even if I/O gates would open
  exp["686950Plan"](planBase, 1, manager, 0, 0, 0, 0, 0, 1, 1, 0, thisAddr);
  const wClosed = read686950Plan(view, planBase);
  const oClosed = exit686950Plan(1, manager, 0, 0, 0, 0, 0, 1, 1, 0, thisAddr);
  compare686950Plan(wClosed, oClosed, "entry closed");
  assert.equal(wClosed.entryOpen, 0);
  assert.equal(wClosed.packNeeded, 0);
  assert.equal(wClosed.hostIoNeeded, 0);
  assert.equal(wClosed.hostRemoveNeeded, 0);
  assert.equal(wClosed.hostWriteNeeded, 0);

  // entry open, I/O closed (vec mismatch): pack still needed
  exp["686950Plan"](planBase, 2, manager, 1, 2, 0, 0, 0, 1, 1, 0, thisAddr);
  const wPack = read686950Plan(view, planBase);
  const oPack = exit686950Plan(2, manager, 1, 2, 0, 0, 0, 1, 1, 0, thisAddr);
  compare686950Plan(wPack, oPack, "pack without io");
  assert.equal(wPack.entryOpen, 1);
  assert.equal(wPack.packNeeded, 1);
  assert.equal(wPack.hostIoNeeded, 0);
  assert.equal(wPack.hostRemoveNeeded, 0);

  // full open + remove
  exp["686950Plan"](planBase, 0xffffffff, manager, 9, 9, 0, 0, 0, 1, 1, 0, thisAddr);
  const wRm = read686950Plan(view, planBase);
  const oRm = exit686950Plan(0xffffffff, manager, 9, 9, 0, 0, 0, 1, 1, 0, thisAddr);
  compare686950Plan(wRm, oRm, "remove");
  assert.equal(wRm.hostIoNeeded, 1);
  assert.equal(wRm.hostRemoveNeeded, 1);
  assert.equal(wRm.hostWriteNeeded, 0);

  // full open + write (count64 = 0x100, not a byte-zero)
  exp["686950Plan"](planBase, 0x100, manager, 0, 0, 0, 0, 0, 0x101, 0x1ff, 0x100, thisAddr);
  const wWr = read686950Plan(view, planBase);
  const oWr = exit686950Plan(0x100, manager, 0, 0, 0, 0, 0, 0x101, 0x1ff, 0x100, thisAddr);
  compare686950Plan(wWr, oWr, "write 0x100");
  assert.equal(wWr.entryOpen, 1);
  assert.equal(wWr.hostIoNeeded, 1);
  assert.equal(wWr.hostRemoveNeeded, 0);
  assert.equal(wWr.hostWriteNeeded, 1);
});

test("Wasm vs JS differential: 0x00686950 plan (ABI v38)", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  const planBase = MEM + 0x88000;
  const CASES = 300;
  let seed = 0x68695038;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];

  let entryOpenSeen = 0;
  let entryClosedSeen = 0;
  let ioOpenSeen = 0;
  let removeSeen = 0;
  let writeSeen = 0;
  for (let ci = 0; ci < CASES; ci++) {
    const state = pick([0, 1, 2, 0x100, 0xffffffff, rnd()]);
    const manager = pick([0, 0x1000, 0xfffb5439, rnd()]);
    const vecA = pick([0, 1, 0x100, rnd()]);
    const vecB = pick([vecA, vecA, rnd()]); // bias empty
    const game = pick([0, 0x1000, rnd()]);
    const count26630 = pick([0, 1, 0x80000000, rnd()]);
    const b26638 = pick([0, 1, 0x100, 0x1ff, rnd()]);
    const b398 = pick([0, 1, 0x100, rnd()]);
    const b3a1 = pick([0, 1, 0x100, rnd()]);
    const count64 = pick([0, 1, 0x100, rnd()]);
    const thisAddr = pick([0x100000, 0x12340000, rnd()]);
    exp["686950Plan"](
      planBase, state, manager, vecA, vecB, game, count26630, b26638, b398,
      b3a1, count64, thisAddr,
    );
    const w = read686950Plan(view, planBase);
    const o = exit686950Plan(
      state, manager, vecA, vecB, game, count26630, b26638, b398, b3a1,
      count64, thisAddr,
    );
    compare686950Plan(w, o, `case ${ci}`);
    if (w.entryOpen) entryOpenSeen += 1;
    else entryClosedSeen += 1;
    if (w.hostIoNeeded) ioOpenSeen += 1;
    if (w.hostRemoveNeeded) removeSeen += 1;
    if (w.hostWriteNeeded) writeSeen += 1;
  }
  assert.ok(entryOpenSeen > 0, "differential never saw entry open");
  assert.ok(entryClosedSeen > 0, "differential never saw entry closed");
  assert.ok(ioOpenSeen > 0, "differential never saw I/O open");
  assert.ok(removeSeen > 0, "differential never saw remove");
  assert.ok(writeSeen > 0, "differential never saw write");
});


// ===========================================================================
// ABI v39: GameState write 0x00958ed0 (600 B)
// PE 0x00958ed0..0x00959127. FULL-dword [Manager+8]==2; UNSIGNED
// [Game+0x26630]==0; vec empty; LOW-BYTE player+0x173 then SIGNED
// GetExtraLives>=1. Pack byte 0x20dcc=1. GetPlayer / SaveState / fopen /
// write / PGD 0x9292c0 / Steam stay host. Sibling 0x00959130 not folded.
// ===========================================================================

const PLAN_958ED0 = {
  entryOpen: 0,
  prefixOpen: 4,
  packNeeded: 8,
  hostCloudNeeded: 12,
  hostLocalNeeded: 16,
  hostPgdNeeded: 20,
  flag20dccAddr: 24,
  thisAddr: 28,
  size: 32,
};

function read958ed0Plan(view, base) {
  return {
    entryOpen: view.getInt32(base + PLAN_958ED0.entryOpen, true),
    prefixOpen: view.getInt32(base + PLAN_958ED0.prefixOpen, true),
    packNeeded: view.getInt32(base + PLAN_958ED0.packNeeded, true),
    hostCloudNeeded: view.getInt32(base + PLAN_958ED0.hostCloudNeeded, true),
    hostLocalNeeded: view.getInt32(base + PLAN_958ED0.hostLocalNeeded, true),
    hostPgdNeeded: view.getInt32(base + PLAN_958ED0.hostPgdNeeded, true),
    flag20dccAddr: readU32(view, base + PLAN_958ED0.flag20dccAddr),
    thisAddr: readU32(view, base + PLAN_958ED0.thisAddr),
  };
}

function compare958ed0Plan(w, o, tag) {
  assert.equal(w.entryOpen, o.entryOpen, `${tag}: entryOpen`);
  assert.equal(w.prefixOpen, o.prefixOpen, `${tag}: prefixOpen`);
  assert.equal(w.packNeeded, o.packNeeded, `${tag}: packNeeded`);
  assert.equal(w.hostCloudNeeded, o.hostCloudNeeded, `${tag}: hostCloud`);
  assert.equal(w.hostLocalNeeded, o.hostLocalNeeded, `${tag}: hostLocal`);
  assert.equal(w.hostPgdNeeded, o.hostPgdNeeded, `${tag}: hostPgd`);
  assert.equal(w.flag20dccAddr, o.flag20dccAddr, `${tag}: flag20dccAddr`);
  assert.equal(w.thisAddr, o.thisAddr, `${tag}: thisAddr`);
}

test("Wasm/JS: 0x00958ed0 gate + apply (ABI v39)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  const view = new DataView(exp.memory.buffer);
  const img = MEM + 0x90000;

  assert.equal(exp["958ed0Va"](), 0x00958ed0);
  assert.equal(exit958ed0Va(), EXIT_958ED0_VA);
  assert.equal(exp["958ed0BodyBytes"](), 600);
  assert.equal(exit958ed0BodyBytes(), EXIT_958ED0_BODY_BYTES);
  assert.equal(exp["958ed0Flag20dccOff"](), 0x20dcc);
  assert.equal(exit958ed0Flag20dccOff(), EXIT_958ED0_FLAG_20DCC_OFF);
  assert.equal(exp["958ed0SteamIat"](), 0x00b18a1c);
  assert.equal(exit958ed0SteamIat(), EXIT_958ED0_STEAM_IAT);
  assert.equal(exp["958ed0FilenoIat"](), 0x00b18920);
  assert.equal(exit958ed0FilenoIat(), EXIT_958ED0_FILENO_IAT);
  assert.equal(EXIT_958ED0_STATE8_VALUE, 2);

  const entryClosed = [0, 1, 3, 0x100, 0x102, 0x1ff, 0xffffffff];
  for (const v of entryClosed) {
    assert.equal(exp["958ed0EntryOpen"](v), 0, `wasm entry closed ${v.toString(16)}`);
    assert.equal(exit958ed0EntryOpen(v), 0, `oracle entry closed ${v.toString(16)}`);
  }
  assert.equal(exp["958ed0EntryOpen"](2), 1);
  assert.equal(exit958ed0EntryOpen(2), 1);

  assert.equal(exp["958ed0CountOk"](0), 1);
  assert.equal(exit958ed0CountOk(0), 1);
  assert.equal(exp["958ed0CountOk"](1), 0);
  assert.equal(exp["958ed0CountOk"](0x80000000), 0, "0x80000000 unsigned closed");
  assert.equal(exit958ed0CountOk(0x80000000), 0);
  assert.equal(exp["958ed0CountOk"](0xffffffff), 0);

  assert.equal(exp["958ed0VecEmpty"](0, 0), 1);
  assert.equal(exp["958ed0VecEmpty"](0x100, 0x100), 1, "0x100==0x100 empty");
  assert.equal(exp["958ed0VecEmpty"](1, 2), 0);
  assert.equal(exit958ed0VecEmpty(0x100, 0x100), 1);

  assert.equal(exp["958ed0PrefixOpen"](2, 0, 5, 5), 1);
  assert.equal(exp["958ed0PrefixOpen"](0x102, 0, 5, 5), 0, "0x102 not in-game");
  assert.equal(exp["958ed0PrefixOpen"](2, 0x80000000, 5, 5), 0);
  assert.equal(exp["958ed0PrefixOpen"](2, 0, 1, 2), 0);

  assert.equal(exp["958ed0ChallengeNeeded"](0), 0);
  assert.equal(exp["958ed0ChallengeNeeded"](0x100), 0, "0x100 low byte 0");
  assert.equal(exp["958ed0ChallengeNeeded"](0x101), 1, "0x101 low byte 1");
  assert.equal(exit958ed0ChallengeNeeded(0x100), 0);
  assert.equal(exit958ed0ChallengeNeeded(0x1ff), 1);

  assert.equal(exp["958ed0ChallengeOk"](0, 0), 1, "byte0 skips lives");
  assert.equal(exp["958ed0ChallengeOk"](0x100, 0), 1, "0x100 skips lives");
  assert.equal(exp["958ed0ChallengeOk"](1, 1), 1);
  assert.equal(exp["958ed0ChallengeOk"](1, 2), 1);
  assert.equal(exp["958ed0ChallengeOk"](1, 0), 0);
  assert.equal(exp["958ed0ChallengeOk"](1, 0xffffffff), 0, "signed -1 closed");
  assert.equal(exp["958ed0ChallengeOk"](1, 0x80000000), 0, "INT_MIN closed");
  assert.equal(exit958ed0ChallengeOk(1, 0xffffffff), 0);
  assert.equal(exit958ed0ChallengeOk(1, 1), 1);

  assert.equal(exp["958ed0HostNeeded"](2, 0, 0, 0, 0, 0), 1);
  assert.equal(exp["958ed0HostNeeded"](0, 0, 0, 0, 0, 0), 0, "entry closed");
  assert.equal(exp["958ed0HostNeeded"](2, 0, 0, 0, 1, 0xffffffff), 0, "lives fail");
  assert.equal(exp["958ed0HostNeeded"](2, 0, 0, 0, 1, 1), 1);

  assert.equal(exp["958ed0PgdNeeded"](0), 0);
  assert.equal(exp["958ed0PgdNeeded"](0x100), 0, "fa0 0x100 closed");
  assert.equal(exp["958ed0PgdNeeded"](0x101), 1);
  assert.equal(exit958ed0PgdNeeded(0x100), 0);

  // ABI v46: local filename SIZE + existing GameStateIO dtor gates.
  assert.equal(exp["958ed0LocalFilenamePresent"](0), 0);
  assert.equal(exp["958ed0LocalFilenamePresent"](0x100), 1, "0x100 size present");
  assert.equal(exp["958ed0LocalFilenamePresent"](0xffffffff), 1);
  assert.equal(exit958ed0LocalFilenamePresent(0), 0);
  assert.equal(exit958ed0LocalFilenamePresent(0x100), 1);
  assert.equal(exp["958ed0IoDtorNeeded"](0), 0);
  assert.equal(exp["958ed0IoDtorNeeded"](0x100), 1, "0x100 is a valid ptr");
  assert.equal(exit958ed0IoDtorNeeded(0), 0);
  assert.equal(exit958ed0IoDtorNeeded(0x100), 1);
  assert.equal(EXIT_958ED0_FILENAME_SIZE_OFF, 0x1fdbc);
  assert.equal(EXIT_958ED0_IO_PTR_OFF, 0x1fe24);

  assert.equal(exp["958ed0Flag20dccAddr"](0x1000), 0x1000 + 0x20dcc);
  assert.equal(exit958ed0Flag20dccAddr(0x1000), 0x1000 + 0x20dcc);
  const wrapMgr = (0x100000000 - 0x20dcc) >>> 0;
  assert.equal(exp["958ed0Flag20dccAddr"](wrapMgr), 0);
  assert.equal(exit958ed0Flag20dccAddr(wrapMgr), 0);
  assert.equal(exp["958ed0PgdThisAddr"](0x1000), 0x1014);
  assert.equal(exp["958ed0PgdThisAddr"](0xfffffffc), 0x10);

  const manager = img + 0x200;
  view.setUint8(manager + 0x20dcc, 0x99);
  assert.equal(exp["958ed0PrefixApply"](manager), manager >>> 0);
  assert.equal(view.getUint8(manager + 0x20dcc), 1, "prefix 20dcc=1");
  view.setUint8(manager + 0x20dcc, 0x99);
  assert.equal(exit958ed0PrefixApply(view, manager), manager >>> 0);
  assert.equal(view.getUint8(manager + 0x20dcc), 1);

  writeU32(view, manager + EXIT_958ED0_COPY_SRC_OFF, 0xaabbccdd);
  writeU32(view, manager + EXIT_958ED0_COPY_DST_OFF, 0x11111111);
  const copyRet = exp["958ed0Copy1ad14Apply"](manager);
  assert.equal(copyRet, (manager + EXIT_958ED0_COPY_DST_OFF) >>> 0);
  assert.equal(readU32(view, manager + EXIT_958ED0_COPY_DST_OFF), 0xaabbccdd);
  writeU32(view, manager + EXIT_958ED0_COPY_SRC_OFF, 0x12345678);
  writeU32(view, manager + EXIT_958ED0_COPY_DST_OFF, 0);
  assert.equal(
    exit958ed0Copy1ad14Apply(view, manager),
    (manager + EXIT_958ED0_COPY_DST_OFF) >>> 0,
  );
  assert.equal(readU32(view, manager + EXIT_958ED0_COPY_DST_OFF), 0x12345678);

  view.setUint8(manager + EXIT_958ED0_AL_OFF, 0xff);
  exp["958ed0Store1ad18Apply"](manager, 0x100);
  assert.equal(view.getUint8(manager + EXIT_958ED0_AL_OFF), 0, "0x100 stores 0");
  exit958ed0Store1ad18Apply(view, manager, 0x1ab);
  assert.equal(view.getUint8(manager + EXIT_958ED0_AL_OFF), 0xab);

  writeU32(view, manager + EXIT_958ED0_POST_SRC_OFF, 0xfeedface);
  writeU32(view, manager + EXIT_958ED0_POST_DST_OFF, 0);
  view.setUint8(manager + EXIT_958ED0_CHANGES_OFF, 0);
  assert.equal(exp["958ed0PostApply"](manager), manager >>> 0);
  assert.equal(readU32(view, manager + EXIT_958ED0_POST_DST_OFF), 0xfeedface, "f98 first");
  assert.equal(view.getUint8(manager + EXIT_958ED0_CHANGES_OFF), 1, "byte14=1 second");
  writeU32(view, manager + EXIT_958ED0_POST_SRC_OFF, 0x01020304);
  writeU32(view, manager + EXIT_958ED0_POST_DST_OFF, 0xffffffff);
  view.setUint8(manager + EXIT_958ED0_CHANGES_OFF, 0);
  exit958ed0PostApply(view, manager);
  assert.equal(readU32(view, manager + EXIT_958ED0_POST_DST_OFF), 0x01020304);
  assert.equal(view.getUint8(manager + EXIT_958ED0_CHANGES_OFF), 1);

  const pgdThis = exp["958ed0PgdClearApply"](manager);
  assert.equal(pgdThis, (manager + 0x14) >>> 0);
  assert.equal(view.getUint8(manager + 0x14), 0, "pgd clear byte14=0");
  view.setUint8(manager + 0x14, 1);
  assert.equal(exit958ed0PgdClearApply(view, manager), (manager + 0x14) >>> 0);
  assert.equal(view.getUint8(manager + 0x14), 0);

  view.setUint8(manager + 0x20dcc, 1);
  assert.equal(exp["958ed0TailApply"](manager), manager >>> 0);
  assert.equal(view.getUint8(manager + 0x20dcc), 0, "tail 20dcc=0");
  view.setUint8(manager + 0x20dcc, 1);
  exit958ed0TailApply(view, manager);
  assert.equal(view.getUint8(manager + 0x20dcc), 0);

  const planBase = img + 0x800;
  exp["958ed0Plan"](planBase, 0x102, 0, 0, 0, 0, 0, 1, 1, 1, manager);
  const wClosed = read958ed0Plan(view, planBase);
  const oClosed = exit958ed0Plan(0x102, 0, 0, 0, 0, 0, 1, 1, 1, manager);
  compare958ed0Plan(wClosed, oClosed, "entry 0x102");
  assert.equal(wClosed.entryOpen, 0);
  assert.equal(wClosed.prefixOpen, 0);
  assert.equal(wClosed.packNeeded, 0);
  assert.equal(wClosed.hostCloudNeeded, 0);
  assert.equal(wClosed.hostPgdNeeded, 0);

  exp["958ed0Plan"](planBase, 2, 0x80000000, 0, 0, 0, 0, 1, 1, 1, manager);
  const wCount = read958ed0Plan(view, planBase);
  const oCount = exit958ed0Plan(2, 0x80000000, 0, 0, 0, 0, 1, 1, 1, manager);
  compare958ed0Plan(wCount, oCount, "count 0x80000000");
  assert.equal(wCount.entryOpen, 1);
  assert.equal(wCount.prefixOpen, 0);
  assert.equal(wCount.packNeeded, 0);

  exp["958ed0Plan"](planBase, 2, 0, 0, 0, 1, 0xffffffff, 1, 1, 1, manager);
  const wLives = read958ed0Plan(view, planBase);
  const oLives = exit958ed0Plan(2, 0, 0, 0, 1, 0xffffffff, 1, 1, 1, manager);
  compare958ed0Plan(wLives, oLives, "signed lives fail");
  assert.equal(wLives.prefixOpen, 1);
  assert.equal(wLives.packNeeded, 0, "GetPlayer ran but pack skipped");

  exp["958ed0Plan"](planBase, 2, 0, 9, 9, 0x100, 0, 0, 0, 0, manager);
  const wLocal = read958ed0Plan(view, planBase);
  const oLocal = exit958ed0Plan(2, 0, 9, 9, 0x100, 0, 0, 0, 0, manager);
  compare958ed0Plan(wLocal, oLocal, "local no pgd");
  assert.equal(wLocal.packNeeded, 1);
  assert.equal(wLocal.hostCloudNeeded, 0);
  assert.equal(wLocal.hostLocalNeeded, 1);
  assert.equal(wLocal.hostPgdNeeded, 0);

  exp["958ed0Plan"](planBase, 2, 0, 0, 0, 0, 0, 0x100, 1, 0x101, manager);
  const wCloud = read958ed0Plan(view, planBase);
  const oCloud = exit958ed0Plan(2, 0, 0, 0, 0, 0, 0x100, 1, 0x101, manager);
  compare958ed0Plan(wCloud, oCloud, "cloud+pgd 0x100 steam");
  assert.equal(wCloud.packNeeded, 1);
  assert.equal(wCloud.hostCloudNeeded, 1, "0x100 steam FULL-dword open");
  assert.equal(wCloud.hostLocalNeeded, 0);
  assert.equal(wCloud.hostPgdNeeded, 1, "0x101 fa0 open");
});

test("Wasm vs JS differential: 0x00958ed0 plan (ABI v39)", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  const planBase = MEM + 0x98000;
  const CASES = 300;
  let seed = 0x958ed039;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 24) % arr.length];

  let entryOpenSeen = 0;
  let entryClosedSeen = 0;
  let packSeen = 0;
  let cloudSeen = 0;
  let localSeen = 0;
  let pgdSeen = 0;
  for (let ci = 0; ci < CASES; ci++) {
    const state8 = pick([0, 2, 0x102, 0x100, rnd()]);
    const count = pick([0, 1, 0x80000000, rnd()]);
    const vecA = pick([0, 1, 0x100, rnd()]);
    const vecB = pick([vecA, vecA, rnd()]);
    const byte173 = pick([0, 1, 0x100, 0x101, rnd()]);
    const lives = pick([0, 1, 0xffffffff, 0x80000000, rnd()]);
    const steam = pick([0, 1, 0x100, rnd()]);
    const cloud = pick([0, 1, 0x100, rnd()]);
    const fa0 = pick([0, 1, 0x100, 0x101, rnd()]);
    const manager = pick([0x100000, 0xfffdf234, rnd()]);
    exp["958ed0Plan"](
      planBase, state8, count, vecA, vecB, byte173, lives, steam, cloud, fa0,
      manager,
    );
    const w = read958ed0Plan(view, planBase);
    const o = exit958ed0Plan(
      state8, count, vecA, vecB, byte173, lives, steam, cloud, fa0, manager,
    );
    compare958ed0Plan(w, o, `case ${ci}`);
    if (w.entryOpen) entryOpenSeen += 1;
    else entryClosedSeen += 1;
    if (w.packNeeded) packSeen += 1;
    if (w.hostCloudNeeded) cloudSeen += 1;
    if (w.hostLocalNeeded) localSeen += 1;
    if (w.hostPgdNeeded) pgdSeen += 1;
  }
  assert.ok(entryOpenSeen > 0, "differential never saw entry open");
  assert.ok(entryClosedSeen > 0, "differential never saw entry closed");
  assert.ok(packSeen > 0, "differential never saw pack");
  assert.ok(cloudSeen > 0, "differential never saw cloud");
  assert.ok(localSeen > 0, "differential never saw local");
  assert.ok(pgdSeen > 0, "differential never saw pgd");
});

// ===========================================================================
// ABI v40: GameState delete 0x00959130 (75 B)
// PE 0x00959130..0x0095917b. UNSIGNED [Game+0x26630]==0; FULL-dword vec
// begin==end; host GameState::Delete @ 0x9c8350 (this = Manager+0xfa4 via
// lea ecx,[esi+0xfa4]); then dword [0xf98]=0, byte [0x14]=1, byte
// [0x4b284]=0 in PE order. No IAT, no PGD, no Steam. Sibling of the v39
// write; the shared prefix is NOT folded (distinct CF/stores).
// ===========================================================================

const PLAN_959130 = {
  entryOpen: 0,
  vecEmpty: 4,
  hostNeeded: 8,
  gamestateAddr: 12,
  thisAddr: 16,
  size: 20,
};

function read959130Plan(view, base) {
  return {
    entryOpen: view.getInt32(base + PLAN_959130.entryOpen, true),
    vecEmpty: view.getInt32(base + PLAN_959130.vecEmpty, true),
    hostNeeded: view.getInt32(base + PLAN_959130.hostNeeded, true),
    gamestateAddr: readU32(view, base + PLAN_959130.gamestateAddr),
    thisAddr: readU32(view, base + PLAN_959130.thisAddr),
  };
}

function compare959130Plan(w, o, tag) {
  assert.equal(w.entryOpen, o.entryOpen, `${tag}: entryOpen`);
  assert.equal(w.vecEmpty, o.vecEmpty, `${tag}: vecEmpty`);
  assert.equal(w.hostNeeded, o.hostNeeded, `${tag}: hostNeeded`);
  assert.equal(w.gamestateAddr, o.gamestateAddr, `${tag}: gamestateAddr`);
  assert.equal(w.thisAddr, o.thisAddr, `${tag}: thisAddr`);
}

test("Wasm/JS: 0x00959130 gate + apply (ABI v40)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  const view = new DataView(exp.memory.buffer);
  const img = MEM + 0xa0000;

  assert.equal(exp["959130Va"](), 0x00959130);
  assert.equal(exit959130Va(), EXIT_959130_VA);
  assert.equal(exp["959130BodyBytes"](), 75);
  assert.equal(exit959130BodyBytes(), EXIT_959130_BODY_BYTES);
  assert.equal(exp["959130DeleteVa"](), 0x009c8350);
  assert.equal(exit959130DeleteVa(), EXIT_959130_DELETE_VA);

  assert.equal(exp["959130EntryOpen"](0), 1);
  assert.equal(exit959130EntryOpen(0), 1);
  for (const v of [1, 2, 0x80000000, 0xffffffff]) {
    assert.equal(exp["959130EntryOpen"](v), 0, `wasm entry closed ${v.toString(16)}`);
    assert.equal(exit959130EntryOpen(v), 0, `oracle entry closed ${v.toString(16)}`);
  }

  assert.equal(exp["959130VecEmpty"](0, 0), 1);
  assert.equal(exp["959130VecEmpty"](0x100, 0x100), 1, "0x100==0x100 empty");
  assert.equal(exp["959130VecEmpty"](1, 2), 0);
  assert.equal(exp["959130VecEmpty"](0x100, 0x200), 0, "0x100 vs 0x200 NOT FULL-dword equal");
  assert.equal(exp["959130VecEmpty"](0xffffffff, 0xfffffffe), 0);
  assert.equal(exit959130VecEmpty(0x100, 0x100), 1);
  assert.equal(exit959130VecEmpty(0x100, 0x200), 0);

  assert.equal(exp["959130PrefixOpen"](0, 5, 5), 1);
  assert.equal(exp["959130PrefixOpen"](0x80000000, 5, 5), 0, "count closed");
  assert.equal(exp["959130PrefixOpen"](0, 1, 2), 0, "vec nonempty");
  assert.equal(exit959130PrefixOpen(0, 1, 2), 0);

  assert.equal(exp["959130HostNeeded"](0, 0, 0), 1);
  assert.equal(exp["959130HostNeeded"](0x80000000, 0, 0), 0);
  assert.equal(exp["959130HostNeeded"](0, 4, 5), 0);
  assert.equal(exp["959130HostNeeded"](0xffffffff, 7, 8), 0);
  assert.equal(exit959130HostNeeded(0, 4, 5), 0);

  assert.equal(exp["959130GamestateAddr"](0x1000), 0x1000 + 0xfa4);
  assert.equal(exit959130GamestateAddr(0x1000), 0x1000 + 0xfa4);
  const wrapMgr = (0x100000000 - 0xfa4) >>> 0;
  assert.equal(exp["959130GamestateAddr"](wrapMgr), 0, "gamestate wrap");
  assert.equal(exit959130GamestateAddr(wrapMgr), 0);

  const manager = img + 0x200;
  writeU32(view, manager + 0xf98, 0xdeadbeef);
  view.setUint8(manager + 0x14, 0);
  view.setUint8(manager + 0x4b284, 0x77);
  assert.equal(exp["959130DeleteApply"](manager), manager >>> 0);
  assert.equal(readU32(view, manager + 0xf98), 0, "dword f98=0");
  assert.equal(view.getUint8(manager + 0x14), 1, "byte14=1");
  assert.equal(view.getUint8(manager + 0x4b284), 0, "byte4b284=0");
  writeU32(view, manager + 0xf98, 0xdeadbeef);
  view.setUint8(manager + 0x14, 0);
  view.setUint8(manager + 0x4b284, 0x77);
  assert.equal(exit959130DeleteApply(view, manager), manager >>> 0);
  assert.equal(readU32(view, manager + 0xf98), 0);
  assert.equal(view.getUint8(manager + 0x14), 1);
  assert.equal(view.getUint8(manager + 0x4b284), 0);
  // Final state is the contract: all three stores fire. The stores do not
  // overlap, so their relative order is unobservable; only the values pin.
  writeU32(view, manager + 0xf98, 0xdeadbeef);
  view.setUint8(manager + 0x14, 0);
  view.setUint8(manager + 0x4b284, 0x55);
  exp["959130DeleteApply"](manager);
  assert.equal(readU32(view, manager + 0xf98), 0);
  assert.equal(view.getUint8(manager + 0x14), 1);
  assert.equal(view.getUint8(manager + 0x4b284), 0);

  const planBase = img + 0x800;
  exp["959130Plan"](planBase, 0x80000000, 0, 0, manager);
  const wClosed = read959130Plan(view, planBase);
  const oClosed = exit959130Plan(0x80000000, 0, 0, manager);
  compare959130Plan(wClosed, oClosed, "count 0x80000000");
  assert.equal(wClosed.entryOpen, 0);
  assert.equal(wClosed.hostNeeded, 0);

  exp["959130Plan"](planBase, 0, 5, 5, manager);
  const wOpen = read959130Plan(view, planBase);
  const oOpen = exit959130Plan(0, 5, 5, manager);
  compare959130Plan(wOpen, oOpen, "open");
  assert.equal(wOpen.entryOpen, 1);
  assert.equal(wOpen.vecEmpty, 1);
  assert.equal(wOpen.hostNeeded, 1);
  assert.equal(wOpen.gamestateAddr, (manager + 0xfa4) >>> 0);
  assert.equal(wOpen.thisAddr, manager >>> 0);

  exp["959130Plan"](planBase, 0, 1, 2, manager);
  const wVec = read959130Plan(view, planBase);
  const oVec = exit959130Plan(0, 1, 2, manager);
  compare959130Plan(wVec, oVec, "vec nonempty");
  assert.equal(wVec.entryOpen, 1);
  assert.equal(wVec.vecEmpty, 0);
  assert.equal(wVec.hostNeeded, 0);

  exp["959130Plan"](planBase, 0x80000000, 0x100, 0x100, 0xfffff05c);
  const wWrap = read959130Plan(view, planBase);
  const oWrap = exit959130Plan(0x80000000, 0x100, 0x100, 0xfffff05c);
  compare959130Plan(wWrap, oWrap, "count closed + wrap mgr");
  assert.equal(wWrap.gamestateAddr, 0);
  assert.equal(wWrap.hostNeeded, 0);
});

test("Wasm vs JS differential: 0x00959130 plan (ABI v40)", () => {
  const exp = loadExports();
  const view = new DataView(exp.memory.buffer);
  const planBase = MEM + 0xa8000;
  const CASES = 300;
  let seed = 0x95913040;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x85ebca6b) >>> 0;
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };
  const pick = (arr) => arr[(rnd() >>> 0) % arr.length];

  let entryOpenSeen = 0;
  let entryClosedSeen = 0;
  let vecEmptySeen = 0;
  let vecNonemptySeen = 0;
  let hostSeen = 0;
  const managers = [0x100000, (0x100000000 - 0xfa4) >>> 0, 0xfffff05c, rnd()];
  for (let ci = 0; ci < CASES; ci++) {
    const count = pick([0, 1, 0x80000000, 0xffffffff, rnd()]);
    const vecA = pick([0, 0x100, 1, rnd()]);
    const vecB = pick([vecA, vecA + 1, vecA - 1, rnd()]);
    const manager = pick(managers);
    exp["959130Plan"](planBase, count, vecA, vecB, manager);
    const w = read959130Plan(view, planBase);
    const o = exit959130Plan(count, vecA, vecB, manager);
    compare959130Plan(w, o, `case ${ci}`);
    if (w.entryOpen) entryOpenSeen += 1;
    else entryClosedSeen += 1;
    if (w.vecEmpty) vecEmptySeen += 1;
    else vecNonemptySeen += 1;
    if (w.hostNeeded) hostSeen += 1;
  }
  assert.ok(entryOpenSeen > 0, "differential never saw entry open");
  assert.ok(entryClosedSeen > 0, "differential never saw entry closed");
  assert.ok(vecEmptySeen > 0, "differential never saw vec empty");
  assert.ok(vecNonemptySeen > 0, "differential never saw vec nonempty");
  assert.ok(hostSeen > 0, "differential never saw host needed");
});

// ===========================================================================
// ABI v48: reconciliation + consumption of the FROZEN alloc string-tidy
// contract (alloc v3 AL, 0x0040d040) at the Exit root's single reach site.
// The tidy template is NOT re-derived here; these laws consume the frozen
// AL contract where Exit callers reach it (root vector dtor loop call at
// 0x006fa293) and the differentials prove agreement in BOTH directions.
// ===========================================================================

test("ABI v48 census: 0x0040d040 reach channels pinned exactly", () => {
  // Exact counts from this unit's whole-.text linear decode WITH resync
  // (rule 10): never "~N".
  assert.equal(EXIT_TIDY_REACH_E8, 1288);
  assert.equal(EXIT_TIDY_REACH_JMP_TAILS, 33);
  assert.equal(EXIT_TIDY_REACH_REGISTER_HELD, 0);
  assert.equal(
    EXIT_TIDY_REACH_E8 + EXIT_TIDY_REACH_JMP_TAILS +
      EXIT_TIDY_REACH_REGISTER_HELD,
    EXIT_TIDY_REACH_TOTAL,
    "census channels must sum to the pinned total",
  );
  assert.equal(EXIT_TIDY_REACH_TOTAL, 1321);
  // Cross-family agreement: the direct rel32 channel equals the alloc
  // family's frozen census pin (consumption by reference, both directions).
  assert.equal(EXIT_TIDY_REACH_E8, ALLOC_CALLERS_STRING_TIDY);
  assert.equal(EXIT_TIDY_VA, 0x0040d040);
  assert.equal(EXIT_TIDY_ROOT_SITE_VA, 0x006fa293);
});

test("Wasm/JS: frozen tidy gate consumed at the Exit root site (ABI v48)", () => {
  const exp = loadExports();
  assert.equal(exp.abi(), EXIT_PURE_ABI_VERSION);
  assert.equal(exp.tidyVa(), EXIT_TIDY_VA);
  assert.equal(exp.tidyRootSiteVa(), EXIT_TIDY_ROOT_SITE_VA);
  // elem + 8 (tidy this) + 0x14 (MSVC-string cap dword).
  assert.equal(exp.tidyRootElemCapOff(), 0x1c);

  // Fixed edges first: every cap across the exact UNSIGNED gate boundary.
  for (let cap = 0; cap <= 0x21; cap++) {
    const want = cap >= 0x10 ? 1 : 0;
    assert.equal(exp.tidyReleaseNeeded(cap), want, `wasm release(${cap})`);
    assert.equal(exitTidyReleaseNeeded(cap), want, `oracle release(${cap})`);
    assert.equal(exp.tidySizeArg(cap) >>> 0, (cap + 1) >>> 0, `wasm size(${cap})`);
    assert.equal(exitTidySizeArg(cap), (cap + 1) >>> 0, `oracle size(${cap})`);
  }

  // Wide-value drives across any would-be narrowing boundary (0x100 /
  // 0xffffffff class): the PE gate is a FULL-dword cmp ecx,0x10 ; jb.
  const WIDE = [
    0xf, 0x10, 0xff, 0x100, 0x10f, 0x1ff, 0xffff000f,
    0xffffffef, 0xfffffff0, 0xffffffff,
  ];
  for (const cap of WIDE) {
    const u = cap >>> 0;
    const want = u >= 0x10 ? 1 : 0;
    assert.equal(exp.tidyReleaseNeeded(u), want,
      `wide release(0x${u.toString(16)})`);
    assert.equal(exitTidyReleaseNeeded(u), want,
      `oracle release(0x${u.toString(16)})`);
    assert.equal(exp.tidySizeArg(u) >>> 0, (u + 1) >>> 0,
      `wide size(0x${u.toString(16)})`);
    assert.equal(exitTidySizeArg(u), (u + 1) >>> 0,
      `oracle size(0x${u.toString(16)})`);
    // And the frozen alloc contract must answer identically (by reference).
    assert.strictEqual((exp.tidyReleaseNeeded(u) !== 0),
      (allocStrTidyReleaseNeeded(u) !== 0),
      `alloc-contract split at release(0x${u.toString(16)})`);
    assert.strictEqual(exp.tidySizeArg(u) >>> 0,
      allocStrTidySizeArg(u) >>> 0,
      `alloc-contract split at size(0x${u.toString(16)})`);
  }
  // The wrap edge explicitly: inc ecx of 0xffffffff is 0.
  assert.equal(exp.tidySizeArg(0xffffffff) >>> 0, 0);
});

test("Wasm vs JS differential: tidy consumption agrees with BOTH oracles (LCG high bits, ABI v48)", () => {
  const exp = loadExports();
  let seed = 0x40d04001;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    // Same lowbias32 finalizer as the family convention: draw from the
    // well-mixed HIGH bits, not the correlated low ones.
    let x = seed;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
  };

  let released = 0;
  let sso = 0;
  for (let i = 0; i < 2000; i++) {
    // Every 8th draw comes from the low byte so the SSO arm (cap < 0x10)
    // is exercised at full-range probability zero; the rest are raw
    // high-entropy dwords for the free arm and wrap edges.
    const cap = (rnd() & 7) === 0 ? rnd() & 0xff : rnd();
    const wRel = exp.tidyReleaseNeeded(cap);
    const wSize = exp.tidySizeArg(cap) >>> 0;
    // Exit wasm vs exit JS oracle:
    assert.equal(wRel, exitTidyReleaseNeeded(cap),
      `wasm/oracle release split at cap=0x${cap.toString(16)}`);
    assert.equal(wSize, exitTidySizeArg(cap),
      `wasm/oracle size split at cap=0x${cap.toString(16)}`);
    // By-reference agreement with the FROZEN alloc contract:
    assert.equal(wRel !== 0, allocStrTidyReleaseNeeded(cap) !== 0,
      `frozen-AL split at release(cap=0x${cap.toString(16)})`);
    assert.equal(wSize, allocStrTidySizeArg(cap) >>> 0,
      `frozen-AL split at size(cap=0x${cap.toString(16)})`);
    // And the raw PE truth at every draw: unsigned threshold at 0x10.
    assert.equal(wRel, cap >= 0x10 ? 1 : 0);
    if (wRel !== 0) released += 1;
    else sso += 1;
  }
  assert.ok(released > 1500, "differential never exercised the free arm");
  assert.ok(sso > 0, "differential never exercised the SSO skip arm");
});

test("v48 guards are not vacuous (self-check)", () => {
  const h = readFileSync(header, "utf8");
  for (const name of [
    "isaac_exit_tidy_release_needed",
    "isaac_exit_tidy_size_arg",
    "isaac_exit_tidy_va",
    "isaac_exit_tidy_root_site_va",
    "isaac_exit_tidy_root_elem_cap_off",
  ]) {
    assert.ok(h.includes(name), `header must declare ${name}`);
    assert.ok(EXPORTS.includes(name), `${name} must be a Wasm export`);
  }
  // Mutant M1 — byte-truncated parameter (documented silent-wrongness
  // trap): 0x10f releases in the PE but truncates to 0x0f. The wide-value
  // sweep must fail under such a mutant.
  assert.notStrictEqual(
    (0x10f & 0xff) >= 0x10 ? 1 : 0,
    exitTidyReleaseNeeded(0x10f),
    "byte-truncation mutant must be discriminated by 0x10f",
  );
  // Mutant M2 — strict > instead of the PE's jb complement (>=): flips
  // exactly at the pinned boundary value 0x10.
  assert.notStrictEqual(
    0x10 > 0x10 ? 1 : 0,
    exitTidyReleaseNeeded(0x10),
    "strict-greater mutant must be discriminated at the boundary",
  );
  // Mutant M3 — dropped inc ecx (identity size arg): fails the +1 law.
  assert.notStrictEqual(7, exitTidySizeArg(7));
  assert.strictEqual(exitTidyReleaseNeeded(0xffffffff), 1);
});
