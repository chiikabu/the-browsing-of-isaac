import test from "node:test";
import rawAssert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PGD_PURE_ABI_VERSION,
  PGDIEC_VA,
  PGDIEC_RET_VA,
  PGDIEC_BODY_BYTES,
  PGDIEC_CALL_SITES,
  PGDIEC_HOST_VA_TRY_UNLOCK,
  PGDIEC_HOST_VA_COOKIE,
  PGDIEC_READONLY_OFF,
  PGDIEC_DIRTY_OFF,
  PGDIEC_COUNTER_BASE,
  PGDIEC_GATE_ROWS,
  PGDIEC_UNLOCK_CALLS,
  PGDIEC_KIND_GE,
  PGDIEC_KIND_NONZERO,
  PGDIEC_KIND_PAIR,
  PGDIEC_KIND_MODE,
  PGDIEC_MODE_GLOBAL_VA,
  PGDIEC_MODE_GLOBAL_OFF,
  PGDIEC_MODE_VALUE,
  PGDIEC_DIRTY_VA,
  PGDIEC_COUNTER_LOAD_VA,
  PGDIEC_READONLY_CMP_VA,
  PGDIEC_GROUP_WALK_VA,
  PGDIEC_GROUP_TABLE_VA,
  PGDIEC_GROUP_STRIDE,
  PGDIEC_GATES,
  pgdIecVa,
  pgdIecRetVa,
  pgdIecBodyBytes,
  pgdIecCallSiteCount,
  pgdIecHostTryUnlockVa,
  pgdIecHostCookieVa,
  pgdIecReadonlyOff,
  pgdIecDirtyOff,
  pgdIecCounterBase,
  pgdIecGateOpen,
  pgdIecCounterStoreOff,
  pgdIecDirtyFires,
  pgdIecGateRowCount,
  pgdIecGateRow,
  pgdIecGateFires,
  pgdIecUnlocksAt,
  PGDULD_VA,
  PGDULD_RET_VA,
  PGDULD_BODY_BYTES,
  PGDULD_CALL_SITES,
  PGDULD_HOST_VA_TRY_UNLOCK,
  PGDULD_TRY_UNLOCK_CALL_VA,
  PGDULD_DIV_MAGIC,
  PGDULD_DIV_SHIFT,
  PGDULD_DIV_MOD,
  PGDULD_GLOBAL_VA,
  PGDULD_RANGE_OFF,
  PGDULD_SEG_STRIDE,
  PGDULD_SEG_PTR_OFF,
  PGDULD_SEG_COUNT_OFF,
  PGDULD_ENTRY_FLAG_OFF,
  PGDULD_LADDER_TABLE_VA,
  PGDULD_LADDER_ROWS,
  PGDULD_TIER_MAX,
  PGDU_LADDER,
  pgdUldCount,
  pgdUldSegmentIndex,
  pgdUldLoopIterations,
  pgdUldFlagAccum,
  pgdUldUnlockId,
  pgdUldFire,
  PGD_HOST_VA_COOKIE,
  PGD_COOKIE_GLOBAL_VA,
  PGD_COOKIE_FAIL_VA,
  PGD_COOKIE_BODY_BYTES,
  PGD_CHECKSUM_REGION_SKIP_FRONT,
  PGD_CHECKSUM_REGION_SKIP_BACK,
  PGD_CHECKSUM_NONSTANDARD_TABLE1,
  pgdCookieCheckOk,
  pgdChecksumRegionSkipFront,
  pgdChecksumRegionSkipBack,
  PGDISP_VA,
  PGDISP_RET_VA,
  PGDISP_BODY_BYTES,
  PGDISP_CALL_SITES,
  PGDISP_HOST_VA_STAMP_HELPER,
  PGDISP_HOST_VA_SAVE_CLOUD,
  PGDISP_HOST_VA_SAVE_LOCAL,
  PGDISP_STORE_VA,
  PGDISP_STAMP_CALL_VA,
  PGDISP_CLOUD_CALL_VA,
  PGDISP_LOCAL_CALL_VA,
  PGDISP_PROBE_CALL_VA,
  PGDISP_PROBE_SLOT_VA,
  PGDISP_PROBE_ARG_VA,
  PGDISP_GLOBAL_VA,
  PGDISP_CLOUD_OFF,
  PGDISP_GATE0_CMP_VA,
  PGDISP_GATE0F8C_CMP_VA,
  PGDISP_ARG_CMP_VA,
  PGDISP_CLOUD_DWORD_CMP_VA,
  PGDISP_CLOUD_BYTE_CMP_VA,
  PGDISP_RETURN_STACK,
  pgdDispProceed,
  pgdDispStoreClearFires,
  pgdDispStampCallFires,
  pgdDispCloudSelected,
  /* v30 PGDCK + PGDWRI */
  PGD_CHECKSUM_UPDATE_VA,
  PGD_CHECKSUM_UPDATE_RET_VA,
  PGD_CHECKSUM_UPDATE_BODY_BYTES,
  PGD_CHECKSUM_UPDATE_INBOUND,
  PGD_CHECKSUM_TABLE_VA,
  PGD_CHECKSUM_TABLE_FLAG_VA,
  PGD_CHECKSUM_GEN_FIRST_SHIFT_VA,
  PGD_CHECKSUM_GEN_SAR_FIRST_VA,
  PGD_CHECKSUM_GEN_STORE_VA,
  PGD_CHECKSUM_GEN_LOOP_BACK_VA,
  PGD_CHECKSUM_MODE0_FOLD_VA,
  PGD_CHECKSUM_MODE1_INIT_VA,
  PGD_CHECKSUM_MODE1_LOOP_VA,
  PGD_CHECKSUM_MODE1_LOOP_BACK_VA,
  PGD_CHECKSUM_MODE1_FINAL_VA,
  PGD_CHECKSUM_STATE_OFF_LANE,
  PGD_CHECKSUM_STATE_OFF_PARTIAL,
  PGD_CHECKSUM_STATE_OFF_ACC,
  PGD_CHECKSUM_STATE_OFF_MODE,
  PGD_CHECKSUM_REGION_VA,
  PGD_CHECKSUM_REGION_RET_VA,
  PGD_CHECKSUM_REGION_BODY_BYTES,
  PGD_CHECKSUM_REGION_INBOUND,
  PGD_CHECKSUM_REGION_SEH_HANDLER_VA,
  PGD_CHECKSUM_REGION_COOKIE_VA,
  PGD_CHECKSUM_REGION_UPDATE_CALL_VA,
  PGD_CHECKSUM_REGION_IO_CALL_VA,
  PGD_CHECKSUM_REGION_TELL_CALL_VA,
  PGD_CHECKSUM_REGION_SEEK_CALL_VA,
  PGD_CHECKSUM_REGION_READ_CALL_VA,
  PGD_CHECKSUM_REGION_LEN_SUB_VA,
  PGD_CHECKSUM_REGION_SEED_STORE_VA,
  PGD_CHECKSUM_VTBL_TELL_OFF,
  PGD_CHECKSUM_VTBL_SEEK_OFF,
  PGD_CHECKSUM_VTBL_READ_OFF,
  pgdChecksumRegionLen,
  pgdChecksumUpdateVa,
  pgdChecksumUpdateRetVa,
  pgdChecksumUpdateBodyBytes,
  pgdChecksumUpdateInbound,
  pgdChecksumTableVa,
  pgdChecksumTableFlagVa,
  pgdChecksumGenFirstShiftVa,
  pgdChecksumGenSarFirstVa,
  pgdChecksumGenStoreVa,
  pgdChecksumGenLoopBackVa,
  pgdChecksumMode0FoldVa,
  pgdChecksumMode1InitVa,
  pgdChecksumMode1LoopVa,
  pgdChecksumMode1LoopBackVa,
  pgdChecksumMode1FinalVa,
  pgdChecksumStateOffLane,
  pgdChecksumStateOffPartial,
  pgdChecksumStateOffAcc,
  pgdChecksumStateOffMode,
  pgdChecksumRegionVa,
  pgdChecksumRegionRetVa,
  pgdChecksumRegionBodyBytes,
  pgdChecksumRegionInbound,
  pgdChecksumRegionSehHandlerVa,
  pgdChecksumRegionCookieVa,
  pgdChecksumRegionUpdateCallVa,
  pgdChecksumRegionIoCallVa,
  pgdChecksumRegionTellCallVa,
  pgdChecksumRegionSeekCallVa,
  pgdChecksumRegionReadCallVa,
  pgdChecksumRegionLenSubVa,
  pgdChecksumRegionSeedStoreVa,
  pgdChecksumVtblTellOff,
  pgdChecksumVtblSeekOff,
  pgdChecksumVtblReadOff,
  PGD_WRI_VA,
  PGD_WRI_RET_VA,
  PGD_WRI_BODY_BYTES,
  PGD_WRI_STATE_MODE_STORE_VA,
  PGD_WRI_STATE_LANE_STORE_VA,
  PGD_WRI_STATE_PARTIAL_STORE_VA,
  PGD_WRI_STATE_SEED_STORE_VA,
  PGD_WRI_PRE_OFF,
  PGD_WRI_PRE_HASH_VA,
  PGD_WRI_SAVE_COUNTER_OFF,
  PGD_WRI_SAVE_COUNTER_INC_VA,
  PGD_WRI_SAVE_COUNTER_HASH_VA,
  PGD_WRI_FINAL_WRITE_VA,
  PGD_WRI_CS_SITES,
  PGD_WRI_TREE_NEXT_SITES,
  PGD_WRI_VTBL_WRITE_SITES,
  PGD_WRI_MEMSET_SITES,
  PGD_WRI_STORES,
  PGD_WRI_ROLE_PRE,
  PGD_WRI_ROLE_ID,
  PGD_WRI_ROLE_CAP,
  PGD_WRI_ROLE_CNT,
  PGD_WRI_ROLE_ELT,
  PGD_WRI_ROLE_SUB,
  PGD_WRI_ROLE_KEY,
  PGD_WRI_ROLE_VAL,
  PGD_WRI_ROLE_TAIL,
  PGD_WRI_CS_TABLE,
  pgdWriVa,
  pgdWriRetVa,
  pgdWriBodyBytes,
  pgdWriStateModeStoreVa,
  pgdWriStateLaneStoreVa,
  pgdWriStatePartialStoreVa,
  pgdWriStateSeedStoreVa,
  pgdWriPreOff,
  pgdWriPreHashVa,
  pgdWriSaveCounterOff,
  pgdWriSaveCounterIncVa,
  pgdWriSaveCounterHashVa,
  pgdWriFinalWriteVa,
  pgdWriCsSiteCount,
  pgdWriTreeNextSites,
  pgdWriVtblWriteSites,
  pgdWriMemsetSites,
  pgdWriStores,
  pgdWriCsSiteVa,
  pgdWriCsSiteRole,
  pgdWriCsSiteLen,
  pgdWriLoopIterations,
  pgdWriElementHashLen,
  pgdWriSaveCounterNext,
  PGD_OFF_CHANGES_MADE,
  PGD_OFF_READONLY,
  PGD_OFF_FLAG_02,
  PGD_OFF_FILE,
  PGD_OFF_FILEPATH,
  PGD_OFF_STEAMCLOUDPATH,
  PGD_OFF_ACHIEVEMENTS,
  PGD_OFF_EVENT_COUNTERS,
  PGD_OFF_ITEM_COLLECTION,
  PGD_OFF_BOSSES,
  PGD_OFF_CHALLENGES,
  PGD_OFF_BESTIARY,
  PGD_OFF_PRE_SECTION_WORD,
  PGD_OFF_SAVE_COUNTER,
  PGD_OFF_FILE_LOADED_OK,
  PGD_COUNT_ACHIEVEMENTS,
  PGD_COUNT_EVENT_COUNTERS,
  PGD_COUNT_ITEM_COLLECTION,
  PGD_COUNT_BOSSES,
  PGD_COUNT_CHALLENGES,
  PGD_STRING_SIZE,
  PGD_STRING_SSO_CAP,
  PGD_MAGIC_BYTES,
  PGD_MAGIC_VARIANTS,
  PGD_MAGIC_STRINGS,
  PGD_SECTION_HEADER_BYTES,
  PGD_CHECKSUM_TAIL_BYTES,
  PGD_CHECKSUM_SKIP_FRONT,
  PGD_CHECKSUM_SKIP_BACK,
  PGD_VERSION_09,
  PGD_MAX_SECTION_ID_V09,
  PGD_MIN_LOADABLE_VERSION,
  PGD_SECTION_MAX_ID,
  PGD_BESTIARY_SECTION_ID,
  PGD_BESTIARY_SUBMAPS,
  PGD_BESTIARY_OFF_ROOT,
  PGD_BESTIARY_OFF_COUNT,
  PGD_BESTIARY_NODE_KEY_OFF,
  PGD_BESTIARY_NODE_VALUE_OFF,
  PGD_BESTIARY_NODE_BYTES,
  PGD_CHECKSUM_SEED,
  PGD_CHECKSUM_POLY,
  PGD_CHECKSUM_MODE_ROR_ADD,
  PGD_CHECKSUM_MODE_CRC,
  PGD_STATE_CRC_VA,
  PGD_STATE_CRC_TABLE_VA,
  PGD_CRC_TABLE_VA,
  PGD_HOST_VA_SAVE_TO_STEAM_CLOUD,
  PGD_HOST_VA_WRITE_STREAM,
  PGD_HOST_VA_READ_STREAM,
  PGD_SIGNATURE_COLLISION_SAVE_LOCALLY_VA,
  PGD_UNLOCKED_SENTINEL_NEVER,
  PGD_READER_SECTION_LABELS,
  PGD_BESTIARY_PAIR_BYTES,
  PGD_SEC5_SLOTS,
  PGD_SEC5_ID_MAX,
  PGD_SEC5_ALIAS_ID,
  PGD_SEC5_REMAP_BASE,
  PGD_SEC5_REMAP_SPAN,
  PGD_SEC5_UNLOCK_ID,
  PGD_SEC5_HOST_VA_MUTATOR,
  PGD_SEC10_SLOTS,
  PGD_SEC10_HOST_VA_MUTATOR,
  PGD_SEC10_LOG_ADD_VA,
  PGD_MASK41_HOST_VA,
  PGD_MASK41_BITS,
  PGD_MASK41_UNLOCK_THRESHOLD,
  PGD_MASK41_UNLOCK_ID,
  PGD_MASK41_LO_COUNTER_INDEX,
  PGD_MASK41_HI_COUNTER_INDEX,
  pgdReaderSectionDesc,
  pgdReaderDispatchIndex,
  pgdReaderHandlerVa,
  pgdReaderSec9Clamp,
  pgdReaderDispatchEdi,
  pgdReaderElemByteCursor,
  pgdReaderElementsConsumed,
  pgdReaderElementsStored,
  pgdBestiarySlotFromTag,
  pgdBestiaryTagHandlerVa,
  pgdBestiaryMapRootOff,
  pgdBestiaryMapCountOff,
  pgdBestiaryPairCountFromSize,
  pgdBestiaryPairPayloadBytes,
  pgdBestiarySizeWordFromPairs,
  pgdSec5IndexRemap,
  pgdSec5OutOfRange,
  pgdSec5StoreSlot,
  pgdSec5AllSet,
  pgdSec10StoreSlot,
  pgdSec10ResetsSlot0,
  pgdSec10StoreIsSelfCancelling,
  pgdMask41Popcount,
  pgdMask41UnlockNeeded,
  pgdMask41HiMask,
  pgdStringDataIsHeap,
  pgdMagicByte,
  pgdMagicVariant,
  pgdVersionForVariant,
  pgdMaxSectionIdForVariant,
  pgdVersionLoadable,
  pgdSectionDesc,
  pgdSectionStreamBytes,
  pgdSectionStreamOffset,
  pgdFixedPrefixBytes,
  pgdReaderLoopContinue,
  pgdReaderSectionSkipped,
  pgdReaderSectionDispatched,
  pgdReaderPayloadContinue,
  pgdReaderStoreInRange,
  pgdReaderCountMismatch,
  pgdReaderBoolNormalize,
  pgdWriterBoolNormalize,
  pgdCrcTableEntry,
  pgdCrcTableUsesArithmeticShift,
  pgdSaveUsesStateCrcRoutine,
  pgdCrcStep,
  pgdRorAddStep,
  pgdChecksumInit,
  pgdChecksumUpdate,
  pgdChecksumFinalize,
  pgdChecksumBuffer,
  pgdChecksumFileRegion,
  pgdChecksumFileValid,
  /* v31 PGDVRF: verify-open 0x926f10 */
  PGD_VRF_VA,
  PGD_VRF_RET_VA,
  PGD_VRF_BODY_BYTES,
  PGD_VRF_SEH_HANDLER_VA,
  PGD_VRF_COOKIE_VA,
  PGD_VRF_INBOUND,
  PGD_VRF_RETURN_STACK,
  PGD_VRF_MAGIC_VAS,
  PGD_VRF_COMPARE_LOOP_VA,
  PGD_VRF_COMPARE_JA_VA,
  PGD_VRF_CASCADE_HEAD_VAS,
  PGD_VRF_KIND_STORE_VAS,
  PGD_VRF_BOUND_STORE_VAS,
  PGD_VRF_MAGIC_BYTES,
  PGD_VRF_COMPARE_DWORDS,
  PGD_VRF_COMPARE_BYTES,
  PGD_VRF_KIND_DIGIT_OFF,
  PGD_VRF_KIND_MIN,
  PGD_VRF_KIND_MAX,
  PGD_VRF_CHECKSUM_CALL_VA,
  PGD_VRF_CHECKSUM_SKIP_FRONT,
  PGD_VRF_CHECKSUM_SKIP_BACK,
  PGD_VRF_TRAILING_SEEK_VA,
  PGD_VRF_TRAILING_READ_VA,
  PGD_VRF_TRAILING_CMP_VA,
  PGD_VRF_TRAILING_LOG_VA,
  PGD_VRF_HEADER_LOG_VA,
  PGD_VRF_OLD_VERSION_LOG_VA,
  PGD_VRF_KIND_GATE_CMP_VA,
  PGD_VRF_KIND_GATE_JA_VA,
  PGD_VRF_FAIL_RET_VA,
  PGD_VRF_SUCCESS_RET_VA,
  PGD_VRF_SAVE_COUNTER_OFF,
  PGD_VRF_JUMP_TABLE_VA,
  PGD_VRF_JUMP_TABLE_ENTRIES,
  PGD_VRF_BOUNDS,
  pgdVrfMagicByte,
  pgdVrfMagicDword,
  pgdVrfMagicVariantDwords,
  pgdVrfKindFromHeader,
  pgdVrfKindFromDigitByte,
  pgdVrfBoundForKind,
  pgdVrfTrailingMatch,
  pgdVrfKindAccepted,
  pgdVrfVerifyOpen,
  pgdVrfVa,
  pgdVrfRetVa,
  pgdVrfBodyBytes,
  pgdVrfSehHandlerVa,
  pgdVrfCookieVa,
  pgdVrfInbound,
  pgdVrfReturnStack,
  pgdVrfMagicVa,
  pgdVrfCompareLoopVa,
  pgdVrfCompareDwords,
  pgdVrfCompareBytes,
  pgdVrfKindDigitOff,
  pgdVrfCascadeHeadVa,
  pgdVrfKindStoreVa,
  pgdVrfBoundStoreVa,
  pgdVrfChecksumCallVa,
  pgdVrfChecksumSkipFront,
  pgdVrfChecksumSkipBack,
  pgdVrfTrailingSeekVa,
  pgdVrfTrailingReadVa,
  pgdVrfTrailingCmpVa,
  pgdVrfTrailingLogVa,
  pgdVrfHeaderLogVa,
  pgdVrfOldVersionLogVa,
  pgdVrfKindGateCmpVa,
  pgdVrfFailRetVa,
  pgdVrfSuccessRetVa,
  pgdVrfSaveCounterOff,
  pgdVrfJumpTableVa,
  pgdVrfJumpTableEntries,
  PGD_SAN_VA,
  PGD_SAN_RET_VA,
  PGD_SAN_BODY_BYTES,
  PGD_SAN_INBOUND,
  PGD_SAN_RETURN_STACK,
  PGD_SAN_VERSION_OFF,
  PGD_SAN_FLAG_OFF,
  PGD_SAN_COMMON_OFF,
  PGD_SAN_FLAG_FIELD,
  PGD_SAN_VERSION_GATE_MINS,
  PGD_SAN_VERSION_FIELDS,
  PGD_SAN_COUNTER_SOURCES,
  PGD_SAN_COUNTER_FIELDS,
  PGD_SAN_GATED_FIELDS,
  PGD_SAN_FIELD_COUNT,
  PGD_SAN_FLAG_GATE_CMP_VA,
  PGD_SAN_VERSION_GATE_VAS,
  PGD_SAN_COUNTER_GATE_VAS,
  PGD_SAN_CLAMP_ROW_VAS,
  pgdSanVa,
  pgdSanRetVa,
  pgdSanBodyBytes,
  pgdSanInbound,
  pgdSanReturnStack,
  pgdSanVersionOff,
  pgdSanFlagOff,
  pgdSanCommonOff,
  pgdSanFlagField,
  pgdSanVersionGateMins,
  pgdSanVersionGateMin,
  pgdSanVersionFields,
  pgdSanCounterSources,
  pgdSanCounterFields,
  pgdSanGatedFields,
  pgdSanFieldCount,
  pgdSanFlagGateCmpVa,
  pgdSanVersionGateVa,
  pgdSanCounterGateVa,
  pgdSanClampRowVa,
  pgdSanClampMin1,
  pgdSanVersionGate,
  pgdSanCounterGate,
  pgdSanFlagGate,
  pgdSanitizePostLoad,
  PGD_GATE_VA,
  PGD_GATE_RET_VA,
  PGD_GATE_BODY_BYTES,
  PGD_GATE_INBOUND,
  PGD_GATE_RETURN_STACK,
  PGD_GATE_GUARD_GLOBAL_VA,
  PGD_GATE_GUARD_OFF,
  PGD_GATE_EVENT_COUNTER_CALL_VA,
  PGD_GATE_EVENT_COUNTER_TARGET_VA,
  PGD_GATE_TRY_UNLOCK_VA,
  PGD_GATE_DIV_MAGIC,
  PGD_GATE_DIV_SHIFT,
  PGD_GATE_RUNS_DIVISOR,
  PGD_GATE_RUNS_THRESHOLD,
  PGD_GATE_COUNTER_FIELDS,
  PGD_GATE_RUNS_FIELD,
  PGD_GATE_ROW_COUNT,
  PGD_GATE_ROW_GATE_VAS,
  PGD_GATE_ROW_IDS,
  PGD_GATE_ROW_CALL_VAS,
  PGD_GATE_ROW_KINDS,
  PGD_GATE_FIELD_SLOTS,
  PGD_GATE_FIELD_COUNT,
  pgdGateVa,
  pgdGateRetVa,
  pgdGateBodyBytes,
  pgdGateInbound,
  pgdGateReturnStack,
  pgdGateGuardGlobalVa,
  pgdGateGuardOff,
  pgdGateEventCounterCallVa,
  pgdGateEventCounterTargetVa,
  pgdGateTryUnlockVa,
  pgdGateDivMagic,
  pgdGateDivShift,
  pgdGateRunsDivisor,
  pgdGateRunsThreshold,
  pgdGateCounterFields,
  pgdGateRunsField,
  pgdGateRowCount,
  pgdGateRowGateVa,
  pgdGateRowId,
  pgdGateRowCallVa,
  pgdGateRowKind,
  pgdGateFieldSlots,
  pgdGateFieldCount,
  pgdGateByteSet,
  pgdGateByteClear,
  pgdGateU32Gt,
  pgdGateAnyCounter,
  pgdGateRunsRemainder,
  pgdGateRuns1000,
  pgdGateRowA,
  pgdGateRowB,
  pgdGateRowC,
  pgdGateRowD,
  pgdGateRowE,
  pgdGateRowF,
  pgdPostLoadGates,
  PGD_CNT_VA,
  PGD_CNT_RET_VA,
  PGD_CNT_BODY_BYTES,
  PGD_CNT_INBOUND,
  PGD_CNT_RETURN_STACK,
  PGD_CNT_ITEM_FLAG_OFF,
  PGD_CNT_ACH_OFF,
  PGD_CNT_ITEM_LOOP_HI,
  PGD_CNT_ACH_CAP,
  PGD_CNT_SPECIAL_IDS,
  PGD_CNT_BADGE_IDS,
  PGD_CNT_BADGE_LO,
  PGD_CNT_BADGE_HI,
  PGD_CNT_ACH_COUNT_LO,
  PGD_CNT_ACH_COUNT_HI,
  PGD_CNT_T1,
  PGD_CNT_T1B,
  PGD_CNT_T1C,
  PGD_CNT_T2,
  PGD_CNT_T3,
  PGD_CNT_T4,
  PGD_CNT_T5,
  PGD_CNT_T6,
  PGD_CNT_UNLOCK_IDS,
  PGD_CNT_MAP_GLOBAL_VA,
  PGD_CNT_MAP_OFF,
  PGD_CNT_MAP_FIND_VA,
  PGD_CNT_B3_OFF,
  pgdCntVa,
  pgdCntRetVa,
  pgdCntBodyBytes,
  pgdCntInbound,
  pgdCntReturnStack,
  pgdCntItemFlagOff,
  pgdCntAchOff,
  pgdCntItemLoopHi,
  pgdCntAchCap,
  pgdCntSpecialIds,
  pgdCntSpecialId,
  pgdCntBadgeIds,
  pgdCntBadgeId,
  pgdCntBadgeLo,
  pgdCntBadgeHi,
  pgdCntAchCountLo,
  pgdCntAchCountHi,
  pgdCntT1,
  pgdCntT1B,
  pgdCntT1C,
  pgdCntT2,
  pgdCntT3,
  pgdCntT4,
  pgdCntT5,
  pgdCntT6,
  pgdCntUnlockIds,
  pgdCntUnlockId,
  pgdCntMapGlobalVa,
  pgdCntMapOff,
  pgdCntMapFindVa,
  pgdCntB3Off,
  pgdCntItemFlag,
  pgdCntSpecial,
  pgdCntBadge,
  pgdCntCountNonzero,
  pgdCntCountBadges,
  pgdCntFire,
  pgdPostLoadCounts,
  /* v33-islands */
  PGD_RO_VA,
  PGD_RO_RET_VA,
  PGD_RO_BODY_BYTES,
  PGD_RO_INBOUND,
  PGD_RO_RETURN_STACK,
  PGD_RO_READONLY_OFF,
  PGD_RO_LOG_VA,
  PGD_RO_STRING_TRUE_VA,
  PGD_RO_STRING_FALSE_VA,
  PGD_RO_LOG_CALL_VA,
  PGD_RO_CMP_CMOVE_VA,
  PGD_RO_STORE_VA,
  PGD_RO_CALL_SITE_VAS,
  pgdRoVa,
  pgdRoRetVa,
  pgdRoBodyBytes,
  pgdRoInbound,
  pgdRoReturnStack,
  pgdRoReadonlyOff,
  pgdRoLogVa,
  pgdRoStringTrueVa,
  pgdRoStringFalseVa,
  pgdRoLogCallVa,
  pgdRoCmpCmMoveVa,
  pgdRoStoreVa,
  pgdRoCallSiteCount,
  pgdRoCallSiteVa,
  pgdRoEffectiveValue,
  pgdRoLogsTrue,
  pgdRoStringChoiceVa,
  PGD_UNL_VA,
  PGD_UNL_RET_VA,
  PGD_UNL_BODY_BYTES,
  PGD_UNL_INBOUND,
  PGD_UNL_RETURN_STACK,
  PGD_UNL_ACH_OFF,
  PGD_UNL_INDEX_HI,
  PGD_UNL_GATE_VAS,
  PGD_UNL_TRUE_TAIL_VA,
  PGD_UNL_FALSE_TAIL_VA,
  PGD_UNL_CALL_SITE_VAS,
  pgdUnlVa,
  pgdUnlRetVa,
  pgdUnlBodyBytes,
  pgdUnlInbound,
  pgdUnlReturnStack,
  pgdUnlAchOff,
  pgdUnlIndexHi,
  pgdUnlGateCount,
  pgdUnlGateVa,
  pgdUnlTrueTailVa,
  pgdUnlFalseTailVa,
  pgdUnlCallSiteCount,
  pgdUnlCallSiteVa,
  PGD_ADDIT_VA,
  PGD_ADDIT_RET_VA,
  PGD_ADDIT_BODY_BYTES,
  PGD_ADDIT_INBOUND,
  PGD_ADDIT_RETURN_STACK,
  PGD_ADDIT_COUNT_CALL_VA,
  PGD_ADDIT_COUNT_CALL_SITE_VA,
  PGD_ADDIT_TRY_UNLOCK_VA,
  PGD_ADDIT_WINDOW_HI,
  PGD_ADDIT_ITEM_FLAG_OFF,
  PGD_ADDIT_DIRTY_OFF,
  PGD_ADDIT_ROW_A_ID,
  PGD_ADDIT_ROW_B_ID,
  PGD_ADDIT_ROW_A_CALL_VA,
  PGD_ADDIT_ROW_B_CALL_VA,
  PGD_ADDIT_ROW_A_GATE_VAS,
  PGD_ADDIT_ROW_B_GATE_VAS,
  PGD_ADDIT_GATE_FIELD_OFFS,
  PGD_ADDIT_ENTRY_GATE_VA,
  PGD_ADDIT_WINDOW_GATE_VA,
  PGD_ADDIT_ID0_SKIP_VA,
  PGD_ADDIT_OWNED_GATE_VA,
  PGD_ADDIT_FLAG_STORE_VA,
  PGD_ADDIT_DIRTY_STORE_VA,
  PGD_ADDIT_CALL_SITE_VAS,
  pgdAdditVa,
  pgdAdditRetVa,
  pgdAdditBodyBytes,
  pgdAdditInbound,
  pgdAdditReturnStack,
  pgdAdditCountCallVa,
  pgdAdditCountCallSiteVa,
  pgdAdditTryUnlockVa,
  pgdAdditWindowHi,
  pgdAdditItemFlagOff,
  pgdAdditDirtyOff,
  pgdAdditRowAId,
  pgdAdditRowBId,
  pgdAdditRowACallVa,
  pgdAdditRowBCallVa,
  pgdAdditRowAGateVa,
  pgdAdditRowBGateVa,
  pgdAdditGateFieldOff,
  pgdAdditEntryGateVa,
  pgdAdditWindowGateVa,
  pgdAdditId0SkipVa,
  pgdAdditOwnedGateVa,
  pgdAdditFlagStoreVa,
  pgdAdditDirtyStoreVa,
  pgdAdditCallSiteCount,
  pgdAdditCallSiteVa,
  pgdAddToCollectionWindowValid,
  pgdAddToCollectionStoreFires,
  pgdAddToCollectionCountMachineFires,
  pgdAddToCollectionRowA,
  pgdAddToCollectionRowB,
  pgdAddToCollectionDecisions,
  pgdAchievementIndexValid,
  pgdUnlocked,
  pgdTryUnlockStoreNeeded,
  pgdTryUnlockSteamLeg,
  pgdCollectionIndexValid,
  pgdCollectionStoreNeeded,
  pgdChallengeIndexValid,
  pgdChallengeStoreNeeded,
  pgdBossIndexValid,
  pgdBossStoreNeeded,
  pgdEventCounterNext,
  pgdEventCounterStoreNeeded,
  pgdFlagGet,
  pgdFlagSet,
  pgdFlagPopcount,
  pgdBestiaryTotal,
  pgdBestiaryCapWord,
  pgdBestiarySubmapTag,
  pgdBestiarySubmapPair,
  pgdSavePlan,
  /* v3 */
  pgdReaderCountEntersLoop,
  pgdReaderLoopBack,
  pgdReaderStoreNormalizes,
  pgdReaderStoreValue,
  pgdReaderStoreOffset,
  pgdReaderSectionUsesCap,
  pgdBestiaryClearSlot,
  pgdBestiaryOuterContinue,
  pgdBestiaryPairLoopContinue,
  pgdBestiaryInsertNeeded,
  pgdReaderTailReadsSaveCounter,
  pgdFieldStatus,
  pgdFieldRepr,
  pgdPreSectionWordAccessorCount,
  pgdAltTransportField,
  pgdAltTransportCovers,
  pgdBitpackBytes,
  pgdBitpackBit,
  pgdBitpackUnpack,
  pgdNotifyLogs,
  pgdNotifyDispatches,
  PGD_FIELD_NAMED,
  PGD_FIELD_LAYOUT_ONLY,
  PGD_FIELD_UNKNOWN_OFFSET,
  PGD_REPR_NONE,
  PGD_REPR_BOOL_BYTE,
  PGD_REPR_RAW_DWORD,
  PGD_OFF_SEC3_DWORDS,
  PGD_OFF_SEC5_BYTES,
  PGD_OFF_SEC8_DWORDS,
  PGD_OFF_SEC9_DWORDS,
  PGD_OFF_SEC10_BYTES,
  PGD_COUNT_SEC3,
  PGD_COUNT_SEC5,
  PGD_COUNT_SEC8,
  PGD_COUNT_SEC9,
  PGD_COUNT_SEC10,
  PGD_ALT_TRANSPORT_FIELDS,
  PGD_ALT_TRANSPORT_VA,
  PGD_ALT_BITPACK_VA,
  PGD_PRE_SECTION_WORD_SITES,
  PGD_PRE_SECTION_WORD_ACCESSORS,
  PGD_PRE_SECTION_WORD_SITE_VAS,
  PGD_NOTIFY_VA,
  PGD_NOTIFY_ENABLE_GLOBAL_VA,
  PGD_NOTIFY_ENABLE_MASK,
  PGD_CLEAR_VA,
  PGD_CLEAR_FLAG_02_VALUE,
  PGD_FLAG_02_STORES_IN_CLUSTER,
  PGD_FLAG_02_LOADS_IN_CLUSTER,
  PGD_BESTIARY_NODE_MARKER_OFF,
  PGD_READER_TAIL_VA,
  /* v4 */
  pgdSec3RestoreRemap,
  pgdEventRestoreRemap,
  pgdSec3RestoreLoopContinue,
  pgdEventRestoreLoopContinue,
  pgdSec3RestoreSlot,
  pgdEventRestoreSlot,
  pgdSec3RestoreSlotWritten,
  pgdEventRestoreSlotWritten,
  pgdSec3RestoreWriters,
  pgdEventRestoreWriters,
  pgdSec3RestoreWinningIteration,
  pgdEventRestoreWinningIteration,
  pgdSec3RestoreStoreOffset,
  pgdEventRestoreStoreOffset,
  PGD_SEC3_REMAP_VA,
  PGD_SEC3_REMAP_TABLE_VA,
  PGD_SEC3_REMAP_BOUND,
  PGD_SEC3_REMAP_ENTRIES,
  PGD_SEC3_REMAP_MAX_INPUT,
  PGD_SEC3_REMAP_MAX_SLOT,
  PGD_EVENT_REMAP_VA,
  PGD_EVENT_REMAP_TABLE_VA,
  PGD_EVENT_REMAP_BOUND,
  PGD_EVENT_REMAP_ENTRIES,
  PGD_EVENT_REMAP_MAX_INPUT,
  PGD_EVENT_REMAP_MAX_SLOT,
  PGD_BULK_RESTORE_VA,
  PGD_SEC3_RESTORE_ITERATIONS,
  PGD_EVENT_RESTORE_ITERATIONS,
  PGD_SEC3_REMAP_CALL_SITES,
  PGD_EVENT_REMAP_CALL_SITES,
  PGD_SEC3_RESTORE_SLOTS_UNWRITTEN,
  PGD_EVENT_RESTORE_SLOTS_UNWRITTEN_BELOW_MAX,
  PGD_SEC3_RESTORE_ALIASED_SLOTS,
  PGD_EVENT_RESTORE_ALIASED_SLOTS,
  PGD_SEC3_RESTORE_ALIASED_SLOT,
  PGD_SEC3_RESTORE_ALIAS_LOSER,
  PGD_SEC3_RESTORE_ALIAS_WINNER,
  PGD_REMAP_GUARD_VALUE,
  /* v6 */
  pgdImportCopyCount,
  pgdImportCopyRecord,
  pgdImportFieldWritten,
  pgdImportWrittenByteCount,
  pgdImportElementWritten,
  pgdImportStaleByteCount,
  pgdImportUsesRemap,
  pgdImportNormalizes,
  pgdImportTailHasArrayStores,
  pgdImportSnapshotBytes,
  PGD_IMPORT_VA,
  PGD_IMPORT_READER_VA,
  PGD_IMPORT_SNAPSHOT_BYTES,
  PGD_IMPORT_CLEAR_CALL_VA,
  PGD_IMPORT_CLEAR_TARGET_VA,
  PGD_IMPORT_CALLER_VA,
  PGD_IMPORT_LAST_ARRAY_STORE_VA,
  PGD_IMPORT_KIND_BLOCK,
  PGD_IMPORT_KIND_REMAP_EVENT,
  PGD_IMPORT_KIND_REMAP_SEC3,
  PGD_IMPORT_COPY_BLOCK_ROWS,
  PGD_IMPORT_COPY_ROWS,
  PGD_IMPORT_COPY_ROWS_TABLE,
  PGD_IMPORT_WRITTEN_ACHIEVEMENTS,
  PGD_IMPORT_WRITTEN_EVENT,
  PGD_IMPORT_WRITTEN_COLLECTION,
  PGD_IMPORT_WRITTEN_SEC3,
  PGD_IMPORT_WRITTEN_SEC5,
  PGD_IMPORT_WRITTEN_BOSSES,
  PGD_IMPORT_WRITTEN_CHALLENGES,
  PGD_IMPORT_WRITTEN_SEC8,
  PGD_IMPORT_WRITTEN_SEC9,
  PGD_IMPORT_WRITTEN_SEC10,
  PGD_IMPORT_WRITTEN_BESTIARY,
  PGD_IMPORT_WRITTEN_PRE_SECTION_WORD,
  PGD_IMPORT_WRITTEN_SAVE_COUNTER,
  PGD_IMPORT_WRITTEN_FILE_LOADED_OK,
  /* v7 sibling import */
  pgdSiblingEventRemap,
  pgdSiblingCopyCount,
  pgdSiblingCopyRecord,
  pgdSiblingFieldWritten,
  pgdSiblingWrittenByteCount,
  pgdSiblingElementWritten,
  pgdSiblingStaleByteCount,
  pgdSiblingUsesRemap,
  pgdSiblingNormalizes,
  pgdSiblingTailHasArrayStores,
  pgdSiblingSnapshotBytes,
  PGD_SIBLING_VA,
  PGD_SIBLING_READER_VA,
  PGD_SIBLING_SNAPSHOT_BYTES,
  PGD_SIBLING_CLEAR_CALL_VA,
  PGD_SIBLING_CLEAR_TARGET_VA,
  PGD_SIBLING_CALLER_VAS,
  PGD_SIBLING_EVENT_REMAP_VA,
  PGD_SIBLING_EVENT_REMAP_TABLE_VA,
  PGD_SIBLING_EVENT_REMAP_DEFAULT_ARM_VA,
  PGD_SIBLING_EVENT_REMAP_BOUND,
  PGD_SIBLING_EVENT_REMAP_ENTRIES,
  PGD_SIBLING_EVENT_REMAP_MAX_INPUT,
  PGD_SIBLING_EVENT_REMAP_MAX_SLOT,
  PGD_SIBLING_EVENT_RESTORE_ITERATIONS,
  PGD_SIBLING_EVENT_REMAP_HOLES,
  PGD_SIBLING_LAST_ARRAY_STORE_VA,
  PGD_SIBLING_KIND_BLOCK,
  PGD_SIBLING_KIND_REMAP_EVENT,
  PGD_SIBLING_COPY_BLOCK_ROWS,
  PGD_SIBLING_COPY_ROWS,
  PGD_SIBLING_COPY_ROWS_TABLE,
  PGD_SIBLING_WRITTEN_ACHIEVEMENTS,
  PGD_SIBLING_WRITTEN_EVENT,
  PGD_SIBLING_WRITTEN_COLLECTION,
  PGD_SIBLING_WRITTEN_SEC3,
  PGD_SIBLING_WRITTEN_SEC5,
  PGD_SIBLING_WRITTEN_BOSSES,
  PGD_SIBLING_WRITTEN_CHALLENGES,
  PGD_SIBLING_WRITTEN_SEC8,
  PGD_SIBLING_WRITTEN_SEC9,
  PGD_SIBLING_WRITTEN_SEC10,
  PGD_SIBLING_WRITTEN_BESTIARY,
  PGD_SIBLING_WRITTEN_PRE_SECTION_WORD,
  PGD_SIBLING_WRITTEN_SAVE_COUNTER,
  PGD_SIBLING_WRITTEN_FILE_LOADED_OK,
  /* v8 PGDCLR + PGDTAIL */
  pgdClearZeroRowCount,
  pgdClearZeroRecord,
  pgdClearZeroRowSpanDwords,
  pgdClearSaveCounterCleared,
  pgdClearMapCount,
  pgdClearMapRecord,
  pgdClearMapSlotAtStep,
  pgdClearTailStoreCount,
  pgdClearTailStoreRecord,
  pgdClearFieldStatus,
  pgdClearByteZeroed,
  pgdClearTotalZeroedBytes,
  pgdClearGapOffset,
  pgdClearGapLength,
  pgdClearMapOrderMatchesReader,
  pgdClearMapOrderMatchesWriter,
  pgdClearCallSiteCount,
  pgdClearCallSiteVa,
  pgdImportTailStepCount,
  pgdImportTailRecord,
  pgdImportTailEventArgs0,
  pgdImportTailEventArgs1,
  pgdImportTailGateOpen,
  pgdImportTailSaveToSteamNeeded,
  pgdImportTailPreservesGameGuard,
  pgdImportTailReturnsOneUnlessReadFailed,
  pgdImportReaderVa,
  pgdImportReaderCallSiteVa,
  pgdSiblingReaderVa,
  pgdSiblingReaderCallSiteVa,
  pgdSiblingSnapshotCtorVa,
  pgdSiblingCtorCallSiteCount,
  pgdSiblingCtorCallSiteVa,
  pgdImportReaderCallSiteCount,
  pgdSiblingReaderCallSiteCount,
  pgdImportReaderIsSharedWithSibling,
  /* v9 PGDCT */
  pgdSnapshotCtorZeroRowCount,
  pgdSnapshotCtorZeroRecord,
  pgdSnapshotCtorZeroSpanDwords,
  pgdSnapshotCtorByteZeroed,
  pgdSnapshotCtorTotalZeroedBytes,
  pgdSnapshotCtorSetOneOffset,
  pgdSnapshotCtorSetOneValue,
  pgdSnapshotCtorGapCount,
  pgdSnapshotCtorGapRecord,
  pgdSnapshotCtorArgUnused,
  pgdSnapshotCtorRestoreSourceCovered,
  pgdSnapshotCtorCoversAllRestoreSources,
  pgdImportCtorZeroRowCount,
  pgdImportCtorZeroRecord,
  pgdImportCtorZeroSpanDwords,
  pgdImportCtorByteZeroed,
  pgdImportCtorTotalZeroedBytes,
  pgdImportCtorSetOneOffset,
  pgdImportCtorSetOneValue,
  pgdImportCtorSetOneCount,
  pgdImportCtorGapCount,
  pgdImportCtorGapRecord,
  pgdImportCtorArgUnused,
  pgdImportCtorRestoreSourceCovered,
  pgdImportCtorCoversAllRestoreSources,
  pgdImportSnapshotCtorVa,
  pgdImportCtorCallSiteCount,
  pgdImportCtorCallSiteVa,
  pgdReaderClampFloor,
  pgdReaderClampFlagBlockTaken,
  pgdReaderClampStairTaken,
  pgdReaderClampStairOffset,
  pgdReaderClampStairCount,
  pgdReaderClampTailTaken,
  pgdReaderClampTailCount,
  pgdReaderClampTailGateOffset,
  pgdReaderClampTailSlotOffset,
  pgdReaderClampAccumWritten,
  pgdReaderClampApply,
  pgdReaderClampVa,
  pgdReaderClampRetVa,
  pgdReaderClampCallSiteCount,
  pgdReaderClampCallSiteVa,
  pgdReaderClampHostCalls,
  pgdReaderClampFloorConst,
  pgdTreeIsnilByte,
  pgdTreeRightNilArm,
  pgdTreeIteratorNext,
  pgdTreeNextVa,
  pgdTreeNextHostCalls,
  pgdTreeNextBodyBytes,
  pgdTreeNextCallSitesImage,
  pgdTreeNextCallSitesCluster,
  pgdTreeNextClusterSiteVa,
  PGD_TREE_LEFT_OFF,
  PGD_TREE_PARENT_OFF,
  PGD_TREE_RIGHT_OFF,
  PGD_TREE_ISNIL_OFF,
  PGD_TREE_NEXT_VA,
  PGD_TREE_NEXT_RET_A_VA,
  PGD_TREE_NEXT_RET_B_VA,
  PGD_TREE_NEXT_BODY_BYTES,
  PGD_TREE_NEXT_HOST_CALLS,
  PGD_TREE_NEXT_CALL_SITES_IMAGE,
  PGD_TREE_NEXT_CALL_SITES_CLUSTER,
  PGD_TREE_NEXT_CLUSTER_SITES,
  PGD_HOST_VA_TREE_NEXT,
  PGD_TREE_ROW_KEY_OFF,
  PGD_TREE_ROW_VALUE_OFF,
  PGD_TREE_ROW_STRIDE,
  PGD_TREE_ROW_ADVANCE_VA,
  PGD_TREE_ROW_WRITER_VA,
  PGD_TREE_ROW_ALT_VA,
  PGD_TREE_ROW_READER_VA,
  PGD_TREE_ROW_WALKS,
  PGD_TREE_ROW_SLOTS,
  PGD_TREE_ROW_TAGS,
  PGD_TREE_ROW_HEADER_OFFS,
  PGD_TREE_ROW_COUNT_OFFS,
  PGD_TREE_ROW_GATE_VAS,
  PGD_TREE_ROW_LOOP_HEAD_VAS,
  PGD_TREE_ROW_KEY_VAS,
  PGD_TREE_ROW_VALUE_VAS,
  PGD_TREE_ROW_CALL_VAS,
  PGD_TREE_ROW_LOOP_BACK_VAS,
  pgdTreeRowKeyOff,
  pgdTreeRowValueOff,
  pgdTreeRowStride,
  pgdTreeRowAdvanceVa,
  pgdTreeRowWriterVa,
  pgdTreeRowAltVa,
  pgdTreeRowReaderVa,
  pgdTreeRowEmpty,
  pgdTreeRowLoopBack,
  pgdTreeRowWalkCount,
  pgdTreeRowWalkSlot,
  pgdTreeRowWalkTag,
  pgdTreeRowWalkHeaderOff,
  pgdTreeRowWalkCountOff,
  pgdTreeRowWalkGateVa,
  pgdTreeRowWalkLoopHeadVa,
  pgdTreeRowWalkKeyVa,
  pgdTreeRowWalkValueVa,
  pgdTreeRowWalkCallVa,
  pgdTreeRowWalkLoopBackVa,
  pgdTreeRowOrderMatchesBestiaryPairs,
  /* v14 PGDSC11 */
  PGD_SEC11_HEADER_ID,
  PGD_SEC11_SUB_BLOCKS,
  PGD_SEC11_TOTAL_VA,
  PGD_SEC11_TOTAL_FINAL_ADD_VA,
  PGD_SEC11_ID_STORE_VA,
  PGD_SEC11_COUNT_DEAD_STORE_VA,
  PGD_SEC11_CAP_SHL_VA,
  PGD_SEC11_CAP_WRITE_VA,
  PGD_SEC11_SUBCOUNT_STORE_VA,
  PGD_SEC11_SUBCOUNT_WRITE_VA,
  PGD_SEC11_READER_SUBCOUNT_READ_VA,
  PGD_SEC11_READER_HANDLER_VA,
  PGD_SEC11_READER_TAG_READ_VA,
  PGD_SEC11_READER_TAG_GATE_VA,
  PGD_SEC11_READER_CAP_GATE_VA,
  PGD_SEC11_READER_CAP_SHR_VA,
  PGD_SEC11_READER_ROW_LOOP_BACK_VA,
  PGD_SEC11_READER_SUB_LOOP_BACK_VA,
  PGD_SEC11_TAG_WRITE_VAS,
  PGD_SEC11_CAP_SOURCE_VAS,
  PGD_SEC11_CAP_SHL_VAS,
  pgdSec11HeaderId,
  pgdSec11SubBlockCount,
  pgdSec11RowTotal,
  pgdSec11HeaderCap,
  pgdSec11SubCap,
  pgdSec11RowsFromCap,
  pgdSec11SubCountZero,
  pgdSec11TagValid,
  pgdSec11SubLoopBack,
  pgdSec11RowLoopBack,
  pgdSec11TotalVa,
  pgdSec11TotalFinalAddVa,
  pgdSec11IdStoreVa,
  pgdSec11CountDeadStoreVa,
  pgdSec11CapShlVa,
  pgdSec11CapWriteVa,
  pgdSec11SubcountStoreVa,
  pgdSec11SubcountWriteVa,
  pgdSec11ReaderSubcountReadVa,
  pgdSec11ReaderHandlerVa,
  pgdSec11ReaderTagReadVa,
  pgdSec11ReaderTagGateVa,
  pgdSec11ReaderCapGateVa,
  pgdSec11ReaderCapShrVa,
  pgdSec11ReaderRowLoopBackVa,
  pgdSec11ReaderSubLoopBackVa,
  pgdSec11TagWriteVa,
  pgdSec11CapSourceVa,
  pgdSec11CapShlStepVa,
  pgdSec11FramingMatchesRowWalk,
  /* v15 PGDCP */
  PGD_COUNT_PROBE_VA,
  PGD_COUNT_PROBE_RET_OK_VA,
  PGD_COUNT_PROBE_RET_FAIL_VA,
  PGD_COUNT_PROBE_NEXT_VA,
  PGD_COUNT_PROBE_CALL_SITES,
  PGD_COUNT_PROBE_CALL_SITE_VAS,
  PGD_COUNT_GLOBAL_VA,
  PGD_COUNT_GAME_VA,
  PGD_COUNT_TREE_OFF,
  PGD_COUNT_READONLY_GATE_VA,
  PGD_COUNT_READONLY_JNE_VA,
  PGD_COUNT_CACHED_LOAD_VA,
  PGD_COUNT_STORE_GATE_VA,
  PGD_COUNT_STORE_GATE_JNE_VA,
  PGD_COUNT_HEADER_LOAD_VA,
  PGD_COUNT_EMPTY_GATE_VA,
  PGD_COUNT_GATE1_CMP_VA,
  PGD_COUNT_GATE1_JL_VA,
  PGD_COUNT_GATE2_MOVSS_VA,
  PGD_COUNT_GATE2_UCOMISS_VA,
  PGD_COUNT_GATE2_LAHF_VA,
  PGD_COUNT_GATE2_TEST_VA,
  PGD_COUNT_GATE2_JNP_VA,
  PGD_COUNT_GATE3_CMP_VA,
  PGD_COUNT_GATE3_JE_VA,
  PGD_COUNT_INC_VA,
  PGD_COUNT_ADVANCE_VA,
  PGD_COUNT_LOOP_BACK_CMP_VA,
  PGD_COUNT_LOOP_BACK_JNE_VA,
  PGD_COUNT_STORE_VA,
  PGD_COUNT_PROCEED_CMP_VA,
  PGD_COUNT_PROCEED_JB_VA,
  PGD_COUNT_SLOT7C_OFF,
  PGD_COUNT_FLOAT_OFF,
  PGD_COUNT_FLAG_OFF,
  PGD_COUNT_SLOT0_COUNT_OFF,
  pgdCountProbeVa,
  pgdCountProbeRetOkVa,
  pgdCountProbeRetFailVa,
  pgdCountProbeNextVa,
  pgdCountProbeCallSiteCount,
  pgdCountProbeCallSiteVa,
  pgdCountGlobalVa,
  pgdCountGameVa,
  pgdCountTreeOff,
  pgdCountSlot7cOff,
  pgdCountFloatOff,
  pgdCountFlagOff,
  pgdCountSlot0CountOff,
  pgdCountReadonlyGateVa,
  pgdCountStoreGateVa,
  pgdCountStoreGateJneVa,
  pgdCountHeaderLoadVa,
  pgdCountEmptyGateVa,
  pgdCountGate1CmpVa,
  pgdCountGate1JlVa,
  pgdCountGate2MovssVa,
  pgdCountGate2UcomissVa,
  pgdCountGate2LahfVa,
  pgdCountGate2TestVa,
  pgdCountGate2JnpVa,
  pgdCountGate3CmpVa,
  pgdCountGate3JeVa,
  pgdCountIncVa,
  pgdCountAdvanceVa,
  pgdCountLoopBackCmpVa,
  pgdCountLoopBackJneVa,
  pgdCountStoreVa,
  pgdCountProceedCmpVa,
  pgdCountProceedJbVa,
  pgdCountProbeBlocked,
  pgdCountEligible,
  pgdCountStoreNeeded,
  pgdCountEffective,
  pgdCountProceed,
  /* v16 PGDDEATH */
  PGD_DEATH_VA,
  PGD_DEATH_RET_OK_VA,
  PGD_DEATH_RET_NODE_FAIL_VA,
  PGD_DEATH_RET_FAIL_VA,
  PGD_DEATH_CALL_SITES,
  PGD_DEATH_CALL_SITE_VAS,
  PGD_DEATH_SLOT3_HEADER_OFF,
  PGD_DEATH_MARKER_OFF,
  PGD_DEATH_KEY_OFF,
  PGD_DEATH_VALUE_OFF,
  PGD_DEATH_GAME_VA,
  PGD_DEATH_CONTAINER_OFF,
  PGD_DEATH_GATE_BYTE_OFF,
  PGD_DEATH_CONTAINER_FIND_VA,
  PGD_DEATH_MAP_FIND_VA,
  PGD_DEATH_KEY_SHIFT12_VA,
  PGD_DEATH_KEY_OR_VA,
  PGD_DEATH_KEY_SHIFT8_VA,
  PGD_DEATH_MARKER_CMP_VA,
  PGD_DEATH_MARKER_JNE_VA,
  PGD_DEATH_KEY_CMP_VA,
  PGD_DEATH_KEY_JL_VA,
  PGD_DEATH_HEADER_CMP_VA,
  PGD_DEATH_HEADER_JE_VA,
  PGD_DEATH_VALUE_LOAD_VA,
  pgdBestiaryDeathVa,
  pgdBestiaryDeathRetOkVa,
  pgdBestiaryDeathRetNodeFailVa,
  pgdBestiaryDeathRetFailVa,
  pgdBestiaryDeathCallSiteCount,
  pgdBestiaryDeathCallSiteVa,
  pgdBestiaryDeathSlot3HeaderOff,
  pgdBestiaryDeathMarkerOff,
  pgdBestiaryDeathKeyOff,
  pgdBestiaryDeathValueOff,
  pgdBestiaryDeathGameVa,
  pgdBestiaryDeathContainerOff,
  pgdBestiaryDeathGateByteOff,
  pgdBestiaryDeathContainerFindVa,
  pgdBestiaryDeathMapFindVa,
  pgdBestiaryDeathKeyShift12Va,
  pgdBestiaryDeathKeyOrVa,
  pgdBestiaryDeathKeyShift8Va,
  pgdBestiaryDeathMarkerCmpVa,
  pgdBestiaryDeathMarkerJneVa,
  pgdBestiaryDeathKeyCmpVa,
  pgdBestiaryDeathKeyJlVa,
  pgdBestiaryDeathHeaderCmpVa,
  pgdBestiaryDeathHeaderJeVa,
  pgdBestiaryDeathValueLoadVa,
  pgdBestiaryDeathKey,
  pgdBestiaryDeathNodeOk,
  pgdBestiaryDeathValue,
  /* v17 PGDKILL + PGDENC */
  PGD_KILL_VA,
  PGD_KILL_RET_OK_VA,
  PGD_KILL_RET_NODE_FAIL_VA,
  PGD_KILL_RET_FAIL_VA,
  PGD_KILL_CALL_SITES,
  PGD_KILL_CALL_SITE_VAS,
  PGD_KILL_SLOT1_HEADER_OFF,
  PGD_KILL_MARKER_OFF,
  PGD_KILL_KEY_OFF,
  PGD_KILL_VALUE_OFF,
  PGD_KILL_GAME_VA,
  PGD_KILL_CONTAINER_OFF,
  PGD_KILL_GATE_BYTE_OFF,
  PGD_KILL_CONTAINER_FIND_VA,
  PGD_KILL_MAP_FIND_VA,
  PGD_KILL_KEY_SHIFT12_VA,
  PGD_KILL_KEY_OR_VA,
  PGD_KILL_KEY_SHIFT8_VA,
  PGD_KILL_MARKER_CMP_VA,
  PGD_KILL_MARKER_JNE_VA,
  PGD_KILL_KEY_CMP_VA,
  PGD_KILL_KEY_JL_VA,
  PGD_KILL_HEADER_CMP_VA,
  PGD_KILL_HEADER_JE_VA,
  PGD_KILL_VALUE_LOAD_VA,
  pgdBestiaryKillVa,
  pgdBestiaryKillRetOkVa,
  pgdBestiaryKillRetNodeFailVa,
  pgdBestiaryKillRetFailVa,
  pgdBestiaryKillCallSiteCount,
  pgdBestiaryKillCallSiteVa,
  pgdBestiaryKillSlot1HeaderOff,
  pgdBestiaryKillMarkerOff,
  pgdBestiaryKillKeyOff,
  pgdBestiaryKillValueOff,
  pgdBestiaryKillGameVa,
  pgdBestiaryKillContainerOff,
  pgdBestiaryKillGateByteOff,
  pgdBestiaryKillContainerFindVa,
  pgdBestiaryKillMapFindVa,
  pgdBestiaryKillKeyShift12Va,
  pgdBestiaryKillKeyOrVa,
  pgdBestiaryKillKeyShift8Va,
  pgdBestiaryKillMarkerCmpVa,
  pgdBestiaryKillMarkerJneVa,
  pgdBestiaryKillKeyCmpVa,
  pgdBestiaryKillKeyJlVa,
  pgdBestiaryKillHeaderCmpVa,
  pgdBestiaryKillHeaderJeVa,
  pgdBestiaryKillValueLoadVa,
  pgdBestiaryKillKey,
  pgdBestiaryKillNodeOk,
  pgdBestiaryKillValue,
  PGD_ENC_VA,
  PGD_ENC_RET_OK_VA,
  PGD_ENC_RET_FAIL_VA,
  PGD_ENC_HELPER_VA,
  PGD_ENC_HELPER_RET_OK_VA,
  PGD_ENC_HELPER_RET_FAIL_VA,
  PGD_ENC_CALL_SITES,
  PGD_ENC_CALL_SITE_VAS,
  PGD_ENC_SLOT0_HEADER_OFF,
  PGD_ENC_MARKER_OFF,
  PGD_ENC_KEY_OFF,
  PGD_ENC_VALUE_OFF,
  PGD_ENC_GAME_VA,
  PGD_ENC_CONTAINER_OFF,
  PGD_ENC_GATE_BYTE_OFF,
  PGD_ENC_CONTAINER_FIND_VA,
  PGD_ENC_MAP_FIND_VA,
  PGD_ENC_KEY_SHIFT12_VA,
  PGD_ENC_KEY_OR_VA,
  PGD_ENC_KEY_SHIFT8_VA,
  PGD_ENC_MARKER_CMP_VA,
  PGD_ENC_MARKER_JNE_VA,
  PGD_ENC_KEY_CMP_VA,
  PGD_ENC_KEY_JL_VA,
  PGD_ENC_HEADER_CMP_VA,
  PGD_ENC_HEADER_JE_VA,
  PGD_ENC_VALUE_LOAD_VA,
  PGD_ENC_HELPER_CALL_SITES,
  PGD_ENC_HELPER_CALL_SITE_VAS,
  pgdBestiaryEncounterVa,
  pgdBestiaryEncounterRetOkVa,
  pgdBestiaryEncounterRetFailVa,
  pgdBestiaryEncounterHelperVa,
  pgdBestiaryEncounterHelperRetOkVa,
  pgdBestiaryEncounterHelperRetFailVa,
  pgdBestiaryEncounterCallSiteCount,
  pgdBestiaryEncounterCallSiteVa,
  pgdBestiaryEncounterSlot0HeaderOff,
  pgdBestiaryEncounterMarkerOff,
  pgdBestiaryEncounterKeyOff,
  pgdBestiaryEncounterValueOff,
  pgdBestiaryEncounterGameVa,
  pgdBestiaryEncounterContainerOff,
  pgdBestiaryEncounterGateByteOff,
  pgdBestiaryEncounterContainerFindVa,
  pgdBestiaryEncounterMapFindVa,
  pgdBestiaryEncounterKeyShift12Va,
  pgdBestiaryEncounterKeyOrVa,
  pgdBestiaryEncounterKeyShift8Va,
  pgdBestiaryEncounterMarkerCmpVa,
  pgdBestiaryEncounterMarkerJneVa,
  pgdBestiaryEncounterKeyCmpVa,
  pgdBestiaryEncounterKeyJlVa,
  pgdBestiaryEncounterHeaderCmpVa,
  pgdBestiaryEncounterHeaderJeVa,
  pgdBestiaryEncounterValueLoadVa,
  pgdBestiaryEncounterHelperCallSiteCount,
  pgdBestiaryEncounterHelperCallSiteVa,
  pgdBestiaryEncounterKey,
  pgdBestiaryEncounterNodeOk,
  pgdBestiaryEncounterValue,
  PGD_ADDKILL_VA,
  PGD_ADDKILL_RET_OK_VA,
  PGD_ADDKILL_RET_FAIL_VA,
  PGD_ADDKILL_CALL_SITES,
  PGD_ADDKILL_CALL_SITE_VAS,
  PGD_ADDKILL_SLOT1_HEADER_OFF,
  PGD_ADDKILL_MARKER_OFF,
  PGD_ADDKILL_KEY_OFF,
  PGD_ADDKILL_VALUE_OFF,
  PGD_ADDKILL_GAME_VA,
  PGD_ADDKILL_CONTAINER_OFF,
  PGD_ADDKILL_GATE_BYTE_OFF,
  PGD_ADDKILL_CONTAINER_FIND_VA,
  PGD_ADDKILL_MAP_FIND_VA,
  PGD_ADDKILL_VALUE_ACCESSOR_VA,
  PGD_ADDKILL_KILL_GETTER_VA,
  PGD_ADDKILL_UNLOCK_VA,
  PGD_ADDKILL_TYPE_BASE,
  PGD_ADDKILL_RANGE,
  PGD_ADDKILL_BT_VA,
  PGD_ADDKILL_BT_ENTRIES,
  PGD_ADDKILL_JT_VA,
  PGD_ADDKILL_BYTE_TABLE,
  PGD_ADDKILL_READONLY_CMP_VA,
  PGD_ADDKILL_READONLY_JNE_VA,
  PGD_ADDKILL_REC_TEST_VA,
  PGD_ADDKILL_REC_JE_VA,
  PGD_ADDKILL_GATE_CMP_VA,
  PGD_ADDKILL_GATE_JE_VA,
  PGD_ADDKILL_KEY_SHIFT12_VA,
  PGD_ADDKILL_KEY_OR_VA,
  PGD_ADDKILL_KEY_SHIFT8_VA,
  PGD_ADDKILL_MARKER_CMP_VA,
  PGD_ADDKILL_MARKER_JNE_VA,
  PGD_ADDKILL_KEY_CMP_VA,
  PGD_ADDKILL_KEY_JL_VA,
  PGD_ADDKILL_HEADER_CMP_VA,
  PGD_ADDKILL_HEADER_JE_VA,
  PGD_ADDKILL_STORE_INC_VA,
  PGD_ADDKILL_STORE_SET1_VA,
  PGD_ADDKILL_RANGE_CMP_VA,
  PGD_ADDKILL_RANGE_JA_VA,
  PGD_ADDKILL_TABLE_LOAD_VA,
  PGD_ADDKILL_DISPATCH_JMP_VA,
  PGD_ADDKILL_CASE1_CMP_VA,
  PGD_ADDKILL_CASE1_JB_VA,
  PGD_ADDKILL_CASE1_PUSH_VA,
  PGD_ADDKILL_CASE1_RET_VA,
  PGD_ADDKILL_CASE2_CMP_VA,
  PGD_ADDKILL_CASE2_JB_VA,
  PGD_ADDKILL_CASE2_PUSH_VA,
  PGD_ADDKILL_CASE2_RET_VA,
  PGD_ADDKILL_CASE0_CALL1_VA,
  PGD_ADDKILL_CASE0_CALL2_VA,
  PGD_ADDKILL_CASE0_ADD_VA,
  PGD_ADDKILL_CASE0_CMP_VA,
  PGD_ADDKILL_CASE0_JB_VA,
  PGD_ADDKILL_CASE0_PUSH_VA,
  pgdBestiaryAddKillVa,
  pgdBestiaryAddKillRetOkVa,
  pgdBestiaryAddKillRetFailVa,
  pgdBestiaryAddKillCallSiteCount,
  pgdBestiaryAddKillCallSiteVa,
  pgdBestiaryAddKillSlot1HeaderOff,
  pgdBestiaryAddKillMarkerOff,
  pgdBestiaryAddKillKeyOff,
  pgdBestiaryAddKillValueOff,
  pgdBestiaryAddKillGameVa,
  pgdBestiaryAddKillContainerOff,
  pgdBestiaryAddKillGateByteOff,
  pgdBestiaryAddKillContainerFindVa,
  pgdBestiaryAddKillMapFindVa,
  pgdBestiaryAddKillValueAccessorVa,
  pgdBestiaryAddKillKillGetterVa,
  pgdBestiaryAddKillUnlockVa,
  pgdBestiaryAddKillTypeBase,
  pgdBestiaryAddKillRange,
  pgdBestiaryAddKillBtVa,
  pgdBestiaryAddKillBtEntries,
  pgdBestiaryAddKillJtVa,
  pgdBestiaryAddKillReadonlyCmpVa,
  pgdBestiaryAddKillReadonlyJneVa,
  pgdBestiaryAddKillRecTestVa,
  pgdBestiaryAddKillRecJeVa,
  pgdBestiaryAddKillGateCmpVa,
  pgdBestiaryAddKillGateJeVa,
  pgdBestiaryAddKillKeyShift12Va,
  pgdBestiaryAddKillKeyOrVa,
  pgdBestiaryAddKillKeyShift8Va,
  pgdBestiaryAddKillMarkerCmpVa,
  pgdBestiaryAddKillMarkerJneVa,
  pgdBestiaryAddKillKeyCmpVa,
  pgdBestiaryAddKillKeyJlVa,
  pgdBestiaryAddKillHeaderCmpVa,
  pgdBestiaryAddKillHeaderJeVa,
  pgdBestiaryAddKillStoreIncVa,
  pgdBestiaryAddKillStoreSet1Va,
  pgdBestiaryAddKillRangeCmpVa,
  pgdBestiaryAddKillRangeJaVa,
  pgdBestiaryAddKillTableLoadVa,
  pgdBestiaryAddKillDispatchJmpVa,
  pgdBestiaryAddKillCase1CmpVa,
  pgdBestiaryAddKillCase1JbVa,
  pgdBestiaryAddKillCase1PushVa,
  pgdBestiaryAddKillCase1RetVa,
  pgdBestiaryAddKillCase2CmpVa,
  pgdBestiaryAddKillCase2JbVa,
  pgdBestiaryAddKillCase2PushVa,
  pgdBestiaryAddKillCase2RetVa,
  pgdBestiaryAddKillCase0Call1Va,
  pgdBestiaryAddKillCase0Call2Va,
  pgdBestiaryAddKillCase0AddVa,
  pgdBestiaryAddKillCase0CmpVa,
  pgdBestiaryAddKillCase0JbVa,
  pgdBestiaryAddKillCase0PushVa,
  pgdBestiaryAddKillOk,
  pgdBestiaryAddKillKey,
  pgdBestiaryAddKillNodeOk,
  pgdBestiaryAddKillStoreValue,
  pgdBestiaryAddKillDispatchCase,
  pgdBestiaryAddKillUnlockNeeded,
  pgdBestiaryAddKillUnlockId,
  pgdBestiaryAddKillCase0Sum,
  /* v19 PGDADDSIB2 + PGDADDSIB3 */
  PGD_ADDSIB2_VA,
  PGD_ADDSIB2_RET_OK_VA,
  PGD_ADDSIB2_RET_FAIL_VA,
  PGD_ADDSIB2_CALL_SITES,
  PGD_ADDSIB2_CALL_SITE_VAS,
  PGD_ADDSIB2_HELPER_VA,
  PGD_ADDSIB2_HELPER_RET_OK_VA,
  PGD_ADDSIB2_HELPER_RET_INSERT_VA,
  PGD_ADDSIB2_HELPER_RET_READONLY_FAIL_VA,
  PGD_ADDSIB2_SLOT2_HEADER_OFF,
  PGD_ADDSIB2_MARKER_OFF,
  PGD_ADDSIB2_KEY_OFF,
  PGD_ADDSIB2_VALUE_OFF,
  PGD_ADDSIB2_GAME_VA,
  PGD_ADDSIB2_CONTAINER_OFF,
  PGD_ADDSIB2_GATE_BYTE_OFF,
  PGD_ADDSIB2_CONTAINER_FIND_VA,
  PGD_ADDSIB2_MAP_FIND_VA,
  PGD_ADDSIB2_VALUE_ACCESSOR_VA,
  PGD_ADDSIB2_READONLY_CMP_VA,
  PGD_ADDSIB2_READONLY_JNE_VA,
  PGD_ADDSIB2_REC_TEST_VA,
  PGD_ADDSIB2_REC_JE_VA,
  PGD_ADDSIB2_GATE_CMP_VA,
  PGD_ADDSIB2_GATE_JE_VA,
  PGD_ADDSIB2_KEY_SHIFT12_VA,
  PGD_ADDSIB2_KEY_OR_VA,
  PGD_ADDSIB2_KEY_SHIFT8_VA,
  PGD_ADDSIB2_HELPER_CALL_SITE_VA,
  PGD_ADDSIB2_HELPER_READONLY_CMP_VA,
  PGD_ADDSIB2_HELPER_READONLY_JE_VA,
  PGD_ADDSIB2_MAP_FIND_CALL_VA,
  PGD_ADDSIB2_NODE_MARKER_CMP_VA,
  PGD_ADDSIB2_NODE_MARKER_JNE_VA,
  PGD_ADDSIB2_NODE_KEY_CMP_VA,
  PGD_ADDSIB2_NODE_KEY_JL_VA,
  PGD_ADDSIB2_NODE_HEADER_CMP_VA,
  PGD_ADDSIB2_NODE_HEADER_JE_VA,
  PGD_ADDSIB2_STORE_INC_VA,
  PGD_ADDSIB2_STORE_SET1_VA,
  PGD_ADDSIB3_VA,
  PGD_ADDSIB3_RET_OK_VA,
  PGD_ADDSIB3_RET_FAIL_VA,
  PGD_ADDSIB3_CALL_SITES,
  PGD_ADDSIB3_CALL_SITE_VAS,
  PGD_ADDSIB3_HELPER_VA,
  PGD_ADDSIB3_HELPER_RET_OK_VA,
  PGD_ADDSIB3_HELPER_RET_INSERT_VA,
  PGD_ADDSIB3_HELPER_RET_READONLY_FAIL_VA,
  PGD_ADDSIB3_SLOT3_HEADER_OFF,
  PGD_ADDSIB3_MARKER_OFF,
  PGD_ADDSIB3_KEY_OFF,
  PGD_ADDSIB3_VALUE_OFF,
  PGD_ADDSIB3_GAME_VA,
  PGD_ADDSIB3_CONTAINER_OFF,
  PGD_ADDSIB3_GATE_BYTE_OFF,
  PGD_ADDSIB3_CONTAINER_FIND_VA,
  PGD_ADDSIB3_MAP_FIND_VA,
  PGD_ADDSIB3_VALUE_ACCESSOR_VA,
  PGD_ADDSIB3_READONLY_CMP_VA,
  PGD_ADDSIB3_READONLY_JNE_VA,
  PGD_ADDSIB3_REC_TEST_VA,
  PGD_ADDSIB3_REC_JE_VA,
  PGD_ADDSIB3_GATE_CMP_VA,
  PGD_ADDSIB3_GATE_JE_VA,
  PGD_ADDSIB3_KEY_SHIFT12_VA,
  PGD_ADDSIB3_KEY_OR_VA,
  PGD_ADDSIB3_KEY_SHIFT8_VA,
  PGD_ADDSIB3_HELPER_CALL_SITE_VA,
  PGD_ADDSIB3_HELPER_READONLY_CMP_VA,
  PGD_ADDSIB3_HELPER_READONLY_JE_VA,
  PGD_ADDSIB3_MAP_FIND_CALL_VA,
  PGD_ADDSIB3_NODE_MARKER_CMP_VA,
  PGD_ADDSIB3_NODE_MARKER_JNE_VA,
  PGD_ADDSIB3_NODE_KEY_CMP_VA,
  PGD_ADDSIB3_NODE_KEY_JL_VA,
  PGD_ADDSIB3_NODE_HEADER_CMP_VA,
  PGD_ADDSIB3_NODE_HEADER_JE_VA,
  PGD_ADDSIB3_STORE_INC_VA,
  PGD_ADDSIB3_STORE_SET1_VA,
  pgdBestiaryAddSib2Va,
  pgdBestiaryAddSib2RetOkVa,
  pgdBestiaryAddSib2RetFailVa,
  pgdBestiaryAddSib2CallSiteCount,
  pgdBestiaryAddSib2CallSiteVa,
  pgdBestiaryAddSib2HelperVa,
  pgdBestiaryAddSib2HelperRetOkVa,
  pgdBestiaryAddSib2HelperRetInsertVa,
  pgdBestiaryAddSib2HelperRetReadonlyFailVa,
  pgdBestiaryAddSib2Slot2HeaderOff,
  pgdBestiaryAddSib2MarkerOff,
  pgdBestiaryAddSib2KeyOff,
  pgdBestiaryAddSib2ValueOff,
  pgdBestiaryAddSib2GameVa,
  pgdBestiaryAddSib2ContainerOff,
  pgdBestiaryAddSib2GateByteOff,
  pgdBestiaryAddSib2ContainerFindVa,
  pgdBestiaryAddSib2MapFindVa,
  pgdBestiaryAddSib2ValueAccessorVa,
  pgdBestiaryAddSib2ReadonlyCmpVa,
  pgdBestiaryAddSib2ReadonlyJneVa,
  pgdBestiaryAddSib2RecTestVa,
  pgdBestiaryAddSib2RecJeVa,
  pgdBestiaryAddSib2GateCmpVa,
  pgdBestiaryAddSib2GateJeVa,
  pgdBestiaryAddSib2KeyShift12Va,
  pgdBestiaryAddSib2KeyOrVa,
  pgdBestiaryAddSib2KeyShift8Va,
  pgdBestiaryAddSib2HelperCallSiteVa,
  pgdBestiaryAddSib2HelperReadonlyCmpVa,
  pgdBestiaryAddSib2HelperReadonlyJeVa,
  pgdBestiaryAddSib2MapFindCallVa,
  pgdBestiaryAddSib2NodeMarkerCmpVa,
  pgdBestiaryAddSib2NodeMarkerJneVa,
  pgdBestiaryAddSib2NodeKeyCmpVa,
  pgdBestiaryAddSib2NodeKeyJlVa,
  pgdBestiaryAddSib2NodeHeaderCmpVa,
  pgdBestiaryAddSib2NodeHeaderJeVa,
  pgdBestiaryAddSib2StoreIncVa,
  pgdBestiaryAddSib2StoreSet1Va,
  pgdBestiaryAddSib2Ok,
  pgdBestiaryAddSib2HelperOk,
  pgdBestiaryAddSib2Key,
  pgdBestiaryAddSib2NodeOk,
  pgdBestiaryAddSib2StoreValue,
  pgdBestiaryAddSib3Va,
  pgdBestiaryAddSib3RetOkVa,
  pgdBestiaryAddSib3RetFailVa,
  pgdBestiaryAddSib3CallSiteCount,
  pgdBestiaryAddSib3CallSiteVa,
  pgdBestiaryAddSib3HelperVa,
  pgdBestiaryAddSib3HelperRetOkVa,
  pgdBestiaryAddSib3HelperRetInsertVa,
  pgdBestiaryAddSib3HelperRetReadonlyFailVa,
  pgdBestiaryAddSib3Slot3HeaderOff,
  pgdBestiaryAddSib3MarkerOff,
  pgdBestiaryAddSib3KeyOff,
  pgdBestiaryAddSib3ValueOff,
  pgdBestiaryAddSib3GameVa,
  pgdBestiaryAddSib3ContainerOff,
  pgdBestiaryAddSib3GateByteOff,
  pgdBestiaryAddSib3ContainerFindVa,
  pgdBestiaryAddSib3MapFindVa,
  pgdBestiaryAddSib3ValueAccessorVa,
  pgdBestiaryAddSib3ReadonlyCmpVa,
  pgdBestiaryAddSib3ReadonlyJneVa,
  pgdBestiaryAddSib3RecTestVa,
  pgdBestiaryAddSib3RecJeVa,
  pgdBestiaryAddSib3GateCmpVa,
  pgdBestiaryAddSib3GateJeVa,
  pgdBestiaryAddSib3KeyShift12Va,
  pgdBestiaryAddSib3KeyOrVa,
  pgdBestiaryAddSib3KeyShift8Va,
  pgdBestiaryAddSib3HelperCallSiteVa,
  pgdBestiaryAddSib3HelperReadonlyCmpVa,
  pgdBestiaryAddSib3HelperReadonlyJeVa,
  pgdBestiaryAddSib3MapFindCallVa,
  pgdBestiaryAddSib3NodeMarkerCmpVa,
  pgdBestiaryAddSib3NodeMarkerJneVa,
  pgdBestiaryAddSib3NodeKeyCmpVa,
  pgdBestiaryAddSib3NodeKeyJlVa,
  pgdBestiaryAddSib3NodeHeaderCmpVa,
  pgdBestiaryAddSib3NodeHeaderJeVa,
  pgdBestiaryAddSib3StoreIncVa,
  pgdBestiaryAddSib3StoreSet1Va,
  pgdBestiaryAddSib3Ok,
  pgdBestiaryAddSib3HelperOk,
  pgdBestiaryAddSib3Key,
  pgdBestiaryAddSib3NodeOk,
  pgdBestiaryAddSib3StoreValue,
  PGDCLMP_VA,
  PGDCLMP_RET_VA,
  PGDCLMP_FLOOR,
  PGDCLMP_FLAG_OFF,
  PGDCLMP_COUNT_OFF,
  PGDCLMP_ACCUM_OFF,
  PGDCLMP_STAIR_BASE,
  PGDCLMP_STAIR_COUNT,
  PGDCLMP_STAIR_MAX_N,
  PGDCLMP_TAIL_COUNT,
  PGDCLMP_CALL_SITES,
  PGDCLMP_CALL_SITE_VA,
  PGDCLMP_HOST_CALLS,
  PGDCLMP_BODY_BYTES,
  PGDCLMP_MIN_SNAP,
  PGDCLMP_TAIL_GATES,
  PGDCLMP_TAIL_SLOTS,
  PGDICT_VA,
  PGDICT_RET_VA,
  PGDICT_MEMSET_VA,
  PGDICT_SNAPSHOT_BYTES,
  PGDICT_ZERO_ROWS,
  PGDICT_STOSD_ROW,
  PGDICT_STOSD_DWORDS,
  PGDICT_TOTAL_ZEROED_BYTES,
  PGDICT_SET_ONE_COUNT,
  PGDICT_SET_ONE_OFF,
  PGDICT_SET_ONE_VALUE,
  PGDICT_GAP_COUNT,
  PGDICT_CALL_SITES,
  PGDICT_ZERO_ROWS_TABLE,
  PGDICT_GAPS_TABLE,
  PGDCT_VA,
  PGDCT_RET_VA,
  PGDCT_MEMSET_VA,
  PGDCT_SNAPSHOT_BYTES,
  PGDCT_ZERO_ROWS,
  PGDCT_STOSD_ROW,
  PGDCT_STOSD_DWORDS,
  PGDCT_TOTAL_ZEROED_BYTES,
  PGDCT_SET_ONE_OFF,
  PGDCT_SET_ONE_VALUE,
  PGDCT_GAP_COUNT,
  PGDCT_CALL_SITES,
  PGDCT_ZERO_ROWS_TABLE,
  PGDCT_GAPS_TABLE,
  PGDCLR_VA,
  PGDCLR_RET_VA,
  PGDCLR_MEMSET_VA,
  PGDCLR_MAP_ERASE_VA,
  PGDCLR_ZERO_ROWS,
  PGDCLR_COND_OFF,
  PGDCLR_COND_LEN,
  PGDCLR_COND_VA,
  PGDCLR_GATE_VA,
  PGDCLR_MAP_ROWS,
  PGDCLR_TAIL_STORES,
  PGDCLR_GAP_OFF,
  PGDCLR_GAP_LEN,
  PGDCLR_CALL_SITES,
  PGDCLR_CALL_SITE_VAS,
  PGDCLR_STATUS_UNTOUCHED,
  PGDCLR_STATUS_ZEROED,
  PGDCLR_STATUS_ZEROED_IF_ARG,
  PGDCLR_STATUS_SET_ONE,
  PGDCLR_STATUS_STRUCT_RESET,
  PGDCLR_ZERO_ROWS_TABLE,
  PGDCLR_MAP_ROWS_TABLE,
  PGDCLR_TAIL_STORES_TABLE,
  PGD_TAIL_STEPS,
  PGD_TAIL_KIND_WRITE,
  PGD_TAIL_KIND_HOST_CALL,
  PGD_TAIL_KIND_EVENT,
  PGD_TAIL_KIND_GATE,
  PGD_TAIL_KIND_SAVE_SELECT,
  PGD_TAIL_KIND_SAVE,
  PGD_TAIL_IMPORT_BASE_VA,
  PGD_TAIL_SIBLING_BASE_VA,
  PGD_TAIL_HOST_VA_9296C0,
  PGD_TAIL_HOST_VA_9292C0,
  PGD_TAIL_EVENT_VA,
  PGD_TAIL_SAVE_STEAM_VA,
  PGD_TAIL_SAVE_LOCAL_VA,
  PGD_TAIL_PROBE_GLOBAL_VA,
  PGD_TAIL_PROBE_ARG,
  PGD_TAIL_GAME_GUARD_OFF,
  PGD_TAIL_GAME_2A3A4_OFF,
  PGD_TAIL_STEPS_TABLE,
  /* v20 PGDADDCH */
  PGD_ADDCH_VA,
  PGD_ADDCH_RET_FAIL_VA,
  PGD_ADDCH_RET_FAIL_TAIL_VA,
  PGD_ADDCH_CALL_SITES,
  PGD_ADDCH_CALL_SITE_VAS,
  PGD_ADDCH_READONLY_CMP_VA,
  PGD_ADDCH_READONLY_JNE_VA,
  PGD_ADDCH_ARG_GATE1_CMP_VA,
  PGD_ADDCH_ARG_GATE1_JA_VA,
  PGD_ADDCH_FLAG_STORE_VA,
  PGD_ADDCH_FLAG_OFF,
  PGD_ADDCH_DEC_VA,
  PGD_ADDCH_ARG_GATE2_CMP_VA,
  PGD_ADDCH_ARG_GATE2_JA_VA,
  PGD_ADDCH_JUMP_VA,
  PGD_ADDCH_TABLE_VA,
  PGD_ADDCH_TABLE_ENTRIES,
  PGD_ADDCH_FIRST_ARM_VA,
  PGD_ADDCH_LAST_ARM_VA,
  PGD_ADDCH_TAIL_TARGET_VA,
  PGD_ADDCH_MAX_ARG,
  PGD_ADDCH_MAX_INDEX,
  PGD_ADDCH_UNLOCK_IDS,
  PGD_ADDCH_TABLE_ARMS,
  pgdAddChallengeVa,
  pgdAddChallengeRetFailVa,
  pgdAddChallengeRetFailTailVa,
  pgdAddChallengeCallSiteCount,
  pgdAddChallengeCallSiteVa,
  pgdAddChallengeReadonlyCmpVa,
  pgdAddChallengeReadonlyJneVa,
  pgdAddChallengeArgGate1CmpVa,
  pgdAddChallengeArgGate1JaVa,
  pgdAddChallengeFlagStoreVa,
  pgdAddChallengeFlagOff,
  pgdAddChallengeDecVa,
  pgdAddChallengeArgGate2CmpVa,
  pgdAddChallengeArgGate2JaVa,
  pgdAddChallengeJumpVa,
  pgdAddChallengeTableVa,
  pgdAddChallengeTableEntries,
  pgdAddChallengeFirstArmVa,
  pgdAddChallengeLastArmVa,
  pgdAddChallengeTailTargetVa,
  pgdAddChallengeMaxArg,
  pgdAddChallengeMaxIndex,
  pgdAddChallengeTableEntryVa,
  pgdAddChallengeUnlockId,
  pgdAddChallengeFlagStoreGate,
  pgdAddChallengeDispatchGate,
  pgdAddChallengeFlagByteOff,
  pgdAddChallengeUnlockIdForArg,
  /* v21 PGDADDBOSS */
  PGD_ADDBOSS_VA,
  PGD_ADDBOSS_RET_FAIL_VA,
  PGD_ADDBOSS_RET_FAIL_TAIL_VA,
  PGD_ADDBOSS_CALL_SITES,
  PGD_ADDBOSS_CALL_SITE_VAS,
  PGD_ADDBOSS_READONLY_CMP_VA,
  PGD_ADDBOSS_READONLY_JNE_VA,
  PGD_ADDBOSS_ARG_GATE_CMP_VA,
  PGD_ADDBOSS_ARG_GATE_JGE_VA,
  PGD_ADDBOSS_FLAG_STORE_VA,
  PGD_ADDBOSS_FLAG_OFF,
  PGD_ADDBOSS_DIRTY_STORE_VA,
  PGD_ADDBOSS_DIRTY_OFF,
  PGD_ADDBOSS_LOG_STRING_VA,
  PGD_ADDBOSS_LOG_CALL_VA,
  PGD_ADDBOSS_LOG_CALLEE_VA,
  PGD_ADDBOSS_UNLOCK_CHAIN_VA,
  PGD_ADDBOSS_UNLOCK_BLOCKS,
  PGD_ADDBOSS_TAIL_TARGET_VA,
  PGD_ADDBOSS_MAX_ARG,
  PGD_ADDBOSS_MAX_INDEX,
  PGD_ADDBOSS_BLOCKS,
  pgdAddBossVa,
  pgdAddBossRetFailVa,
  pgdAddBossRetFailTailVa,
  pgdAddBossCallSiteCount,
  pgdAddBossCallSiteVa,
  pgdAddBossReadonlyCmpVa,
  pgdAddBossReadonlyJneVa,
  pgdAddBossArgGateCmpVa,
  pgdAddBossArgGateJgeVa,
  pgdAddBossFlagStoreVa,
  pgdAddBossFlagOff,
  pgdAddBossDirtyStoreVa,
  pgdAddBossDirtyOff,
  pgdAddBossLogStringVa,
  pgdAddBossLogCallVa,
  pgdAddBossLogCalleeVa,
  pgdAddBossUnlockChainVa,
  pgdAddBossUnlockBlocks,
  pgdAddBossTailTargetVa,
  pgdAddBossMaxArg,
  pgdAddBossMaxIndex,
  pgdAddBossBlockFirstCmpVa,
  pgdAddBossBlockCallVa,
  pgdAddBossBlockPushVa,
  pgdAddBossBlockByteCount,
  pgdAddBossBlockByteOff,
  pgdAddBossBlockUnlockId,
  pgdAddBossEntryGate,
  pgdAddBossFlagByteOff,
  pgdAddBossBlockGate,
  pgdAddBossUnlockFires,
  /* v22 PGDADDMINI */
  PGD_ADDMINI_VA,
  PGD_ADDMINI_RET_FAIL_VA,
  PGD_ADDMINI_RET_FAIL_TAIL_VA,
  PGD_ADDMINI_RET_OK_VA,
  PGD_ADDMINI_CALL_SITES,
  PGD_ADDMINI_CALL_SITE_VAS,
  PGD_ADDMINI_READONLY_CMP_VA,
  PGD_ADDMINI_READONLY_JNE_VA,
  PGD_ADDMINI_ARG_GATE_CMP_VA,
  PGD_ADDMINI_ARG_GATE_JA_VA,
  PGD_ADDMINI_MAP_LEA_VA,
  PGD_ADDMINI_MAP_CMP_VA,
  PGD_ADDMINI_MAP_JA_VA,
  PGD_ADDMINI_ALIAS_CMP_VA,
  PGD_ADDMINI_ALIAS_JNE_VA,
  PGD_ADDMINI_ALIAS_MOV_VA,
  PGD_ADDMINI_TAIL_CMP_VA,
  PGD_ADDMINI_TAIL_JG_VA,
  PGD_ADDMINI_FLAG_STORE_VA,
  PGD_ADDMINI_FLAG_OFF,
  PGD_ADDMINI_DIRTY_STORE_VA,
  PGD_ADDMINI_DIRTY_OFF,
  PGD_ADDMINI_LOG_STRING_VA,
  PGD_ADDMINI_LOG_CALL_VA,
  PGD_ADDMINI_LOG_CALLEE_VA,
  PGD_ADDMINI_WARN_STRING_VA,
  PGD_ADDMINI_WARN_CALL_VA,
  PGD_ADDMINI_UNLOCK_FIRST_CMP_VA,
  PGD_ADDMINI_UNLOCK_PUSH_VA,
  PGD_ADDMINI_UNLOCK_CALL_VA,
  PGD_ADDMINI_UNLOCK_TARGET_VA,
  PGD_ADDMINI_SLOTS,
  PGD_ADDMINI_UNLOCK_ID,
  PGD_ADDMINI_ID_MAX,
  PGD_ADDMINI_REMAP_BASE,
  PGD_ADDMINI_REMAP_SPAN,
  PGD_ADDMINI_ALIAS_ID,
  pgdAddMiniVa,
  pgdAddMiniRetFailVa,
  pgdAddMiniRetFailTailVa,
  pgdAddMiniRetOkVa,
  pgdAddMiniCallSiteCount,
  pgdAddMiniCallSiteVa,
  pgdAddMiniReadonlyCmpVa,
  pgdAddMiniReadonlyJneVa,
  pgdAddMiniArgGateCmpVa,
  pgdAddMiniArgGateJaVa,
  pgdAddMiniMapLeaVa,
  pgdAddMiniMapCmpVa,
  pgdAddMiniMapJaVa,
  pgdAddMiniAliasCmpVa,
  pgdAddMiniAliasJneVa,
  pgdAddMiniAliasMovVa,
  pgdAddMiniTailCmpVa,
  pgdAddMiniTailJgVa,
  pgdAddMiniFlagStoreVa,
  pgdAddMiniFlagOff,
  pgdAddMiniDirtyStoreVa,
  pgdAddMiniDirtyOff,
  pgdAddMiniLogStringVa,
  pgdAddMiniLogCallVa,
  pgdAddMiniLogCalleeVa,
  pgdAddMiniWarnStringVa,
  pgdAddMiniWarnCallVa,
  pgdAddMiniUnlockFirstCmpVa,
  pgdAddMiniUnlockPushVa,
  pgdAddMiniUnlockCallVa,
  pgdAddMiniUnlockTargetVa,
  pgdAddMiniSlots,
  pgdAddMiniUnlockId,
  pgdAddMiniIdMax,
  pgdAddMiniRemapBase,
  pgdAddMiniRemapSpan,
  pgdAddMiniAliasId,
  pgdAddMiniIndexRemap,
  pgdAddMiniOutOfRange,
  pgdAddMiniOutcome,
  pgdAddMiniFlagByteOff,
  pgdAddMiniUnlockGate,
  pgdAddMiniUnlockFires,
  /* v23 PGDADSED + PGDK41 */
  PGD_ADSED_VA,
  PGD_ADSED_RET_VA,
  PGD_ADSED_READONLY_CMP_VA,
  PGD_ADSED_READONLY_JNE_VA,
  PGD_ADSED_SLOT_STORE_VA,
  PGD_ADSED_SLOT0_CLEAR_VA,
  PGD_ADSED_SLOT_BASE,
  PGD_ADSED_SLOTS,
  PGD_ADSED_DIRTY_STORE_VA,
  PGD_ADSED_DIRTY_OFF,
  PGD_ADSED_READONLY_OFF,
  PGD_ADSED_LOG_STRING_VA,
  PGD_ADSED_LOG_CALL_VA,
  PGD_ADSED_LOG_CALLEE_VA,
  pgdAdsEdVa,
  pgdAdsEdRetVa,
  pgdAdsEdReadonlyCmpVa,
  pgdAdsEdReadonlyJneVa,
  pgdAdsEdSlotStoreVa,
  pgdAdsEdSlot0ClearVa,
  pgdAdsEdSlotBase,
  pgdAdsEdSlots,
  pgdAdsEdDirtyStoreVa,
  pgdAdsEdDirtyOff,
  pgdAdsEdReadonlyOff,
  pgdAdsEdLogStringVa,
  pgdAdsEdLogCallVa,
  pgdAdsEdLogCalleeVa,
  pgdAdsEdGate,
  pgdAdsEdOutcome,
  pgdAdsEdStoreIndex,
  pgdAdsEdSelfCancelling,
  pgdAdsEdSlot0After,
  pgdAdsEdDirtyFires,
  PGD_K41_VA,
  PGD_K41_RET_VA,
  PGD_K41_LO_COUNTER_STORE_VA,
  PGD_K41_HI_COUNTER_STORE_VA,
  PGD_K41_LO_COUNTER_INDEX,
  PGD_K41_HI_COUNTER_INDEX,
  PGD_K41_BITS,
  PGD_K41_LOOP_BTS_VA,
  PGD_K41_LOOP_BOUND_CMP_VA,
  PGD_K41_LOOP_BOUND_JL_VA,
  PGD_K41_LOOP_OR_JE_VA,
  PGD_K41_GATE_CMP_VA,
  PGD_K41_GATE_JL_VA,
  PGD_K41_UNLOCK_PUSH_VA,
  PGD_K41_UNLOCK_CALL_VA,
  PGD_K41_UNLOCK_TARGET_VA,
  PGD_K41_UNLOCK_ID,
  PGD_K41_UNLOCK_THRESHOLD,
  PGD_K41_DIRTY_STORE_VA,
  PGD_K41_DIRTY_OFF,
  PGD_K41_COUNTER_BASE,
  pgdK41Va,
  pgdK41RetVa,
  pgdK41LoCounterStoreVa,
  pgdK41HiCounterStoreVa,
  pgdK41LoCounterIndex,
  pgdK41HiCounterIndex,
  pgdK41Bits,
  pgdK41LoopBtsVa,
  pgdK41LoopBoundCmpVa,
  pgdK41LoopBoundJlVa,
  pgdK41LoopOrJeVa,
  pgdK41GateCmpVa,
  pgdK41GateJlVa,
  pgdK41UnlockPushVa,
  pgdK41UnlockCallVa,
  pgdK41UnlockTargetVa,
  pgdK41UnlockId,
  pgdK41UnlockThreshold,
  pgdK41DirtyStoreVa,
  pgdK41DirtyOff,
  pgdK41CounterBase,
  pgdK41Popcount,
  pgdK41Gate,
  pgdK41UnlockFires,
  pgdK41DirtyFires,
  pgdK41CounterStoreOff,
  /* v24 PGDITAG + PGDIDISP */
  PGDITAG_HEADERS,
  PGDITAG_TAG_BYTES,
  PGDITAG_TAG_DWORDS,
  PGDITAG_READ_BYTES,
  PGDITAG_READ_CALL_VA,
  PGDITAG_FIRST_CMP_VA,
  PGDITAG_HEADER_VAS,
  PGDITAG_SECTIONS,
  PGDITAG_COUNTS,
  PGDITAG_DWORDS,
  PGDITAG_FAIL_LOG_VA,
  PGDITAG_FAIL_TAIL_VA,
  PGDIDISP_TABLE_VA,
  PGDIDISP_ENTRIES,
  PGDIDISP_GATE_CMP_VA,
  PGDIDISP_GATE_JA_VA,
  PGDIDISP_ENTRY_JS_VA,
  PGDIDISP_ENTRY_JGE_VA,
  PGDIDISP_COUNT_CMP_VA,
  PGDIDISP_COUNT_JBE_VA,
  PGDIDISP_LOOP_JAE_VA,
  PGDIDISP_LOOP_JB_VA,
  PGDIDISP_SECTIONS,
  PGDIDISP_TARGET_VAS,
  PGDIDISP_STORE_OFFS,
  PGDIDISP_WIDTHS,
  PGDIDISP_CLAMP_MAXES,
  PGDIDISP_SETG,
  PGDIDISP_LOG_VAS,
  pgdImportTagHeaderCount,
  pgdImportTagHeaderVa,
  pgdImportTagHeaderSection,
  pgdImportTagHeaderCountMax,
  pgdImportTagHeaderDword,
  pgdImportTagCompareBytes,
  pgdImportTagCompareDwords,
  pgdImportTagReadBytes,
  pgdImportTagReadCallVa,
  pgdImportTagFirstCmpVa,
  pgdImportTagFailLogVa,
  pgdImportTagFailTailVa,
  pgdImportTagCompare,
  pgdImportTagFirstMatch,
  pgdImportTagMatchSection,
  pgdImportTagMatchCountMax,
  pgdImportDispatchTableVa,
  pgdImportDispatchEntries,
  pgdImportDispatchGateCmpVa,
  pgdImportDispatchGateJaVa,
  pgdImportEntryGateJsVa,
  pgdImportEntryGateJgeVa,
  pgdImportCountGateCmpVa,
  pgdImportCountGateJbeVa,
  pgdImportLoopJaeVa,
  pgdImportLoopJbVa,
  pgdImportDispatchIndex,
  pgdImportHandlerCount,
  pgdImportHandlerSection,
  pgdImportHandlerTargetVa,
  pgdImportHandlerStoreOff,
  pgdImportHandlerElemWidth,
  pgdImportHandlerClampMax,
  pgdImportHandlerFlagNormalize,
  pgdImportHandlerLogVa,
  pgdImportSectionEntryGate,
  pgdImportSectionCountGate,
  pgdImportClamp,
  pgdImportByteFlag,
  pgdImportByteLoopIterations,
  pgdImportDwordLoopIterations,
  /* v25p PGDROWSEC: per-section handler-row semantics */
  PGDROWSEC_ROWS,
  PGDROWSEC_FIRST_SECTION,
  PGDROWSEC_LAST_SECTION,
  PGDROWSEC_DISPATCH_BIAS,
  pgdImportSectionRowIndex,
  pgdImportSectionStoreOff,
  pgdImportSectionElemWidth,
  pgdImportSectionClampMax,
  pgdImportSectionFlagNormalize,
  pgdImportSectionLogVa,
  pgdImportSectionTargetVa,
  pgdImportSectionLoopIterations,
  /* v25o PGDIMP: TryImportRebirthLocalSave residual islands */
  PGDIMP_SUFFIX_PATTERN_VA,
  PGDIMP_SUFFIX_PATTERN_BYTES,
  PGDIMP_SUFFIX_COMPARE_BYTES,
  PGDIMP_SUFFIX_SCAN_STEP,
  PGDIMP_SUFFIX_FIRST_CMP_VA,
  PGDIMP_SUFFIX_REPLACE_VA,
  PGDIMP_SUFFIX_REPLACE_POS_LEN,
  PGDIMP_REBIRTH_STR_VA,
  PGDIMP_REBIRTH_STR_LEN,
  PGDIMP_OPEN_GATE_VA,
  PGDIMP_OPEN_FAIL_VA,
  PGDIMP_OPEN_STATE_CALL_VA,
  PGDIMP_OPEN_STATE_GATE_VA,
  PGDIMP_STREAM_POS_CALL_VA,
  PGDIMP_STREAM_POS_GATE_VA,
  PGDIMP_IO_CALL_PRE_VA,
  PGDIMP_IO_CALL_POST_VA,
  PGDIMP_PRE_READ_COUNT,
  PGDIMP_POST_READ_COUNT,
  PGDIMP_POST_READ_GATE_VA,
  PGDIMP_POST_READ_FAIL_VA,
  PGDIMP_CHANGESMADE_STORE_VA,
  PGDIMP_CHANGESMADE_STORE_VALUE,
  PGDIMP_SAVE_SELECT_CMP_VA,
  PGDIMP_SAVE_SELECT_0F8C_CMP_VA,
  PGDIMP_SAVE_SELECT_OBJ_VA,
  PGDIMP_SAVE_SELECT_OBJ_CMP_VA,
  PGDIMP_SAVE_SELECT_GLOBAL_VA,
  PGDIMP_EVENT_COUNTER_CALL_VA,
  PGDIMP_GLOBAL_SAVE_PTR_VA,
  PGDIMP_GLOBAL_SAVE_FIELD_OFF,
  PGDIMP_RETURN1_VA_A,
  PGDIMP_RETURN1_VA_B,
  pgdImportSuffixPatternByte,
  pgdImportSuffixCompareLen,
  pgdImportSuffixWindowMatch,
  pgdImportSuffixScanStart,
  pgdImportSuffixScanStep,
  pgdImportSuffixFirstCmpVa,
  pgdImportSuffixReplaceVa,
  pgdImportSuffixReplacePosLen,
  pgdImportRebirthReplacementLen,
  pgdImportRebirthReplaceLen,
  pgdImportOpenSucceeded,
  pgdImportOpenGateVa,
  pgdImportOpenFailVa,
  pgdImportOpenStateCallVa,
  pgdImportOpenStateGateVa,
  pgdImportStreamPosCallVa,
  pgdImportStreamPosGateVa,
  pgdImportFileIoGate,
  pgdImportPreReadCount,
  pgdImportPostReadCount,
  pgdImportPreReadIoCallVa,
  pgdImportPostReadIoCallVa,
  pgdImportPostReadGate,
  pgdImportPostReadGateVa,
  pgdImportPostReadFailVa,
  pgdImportChangesmadeStoreVa,
  pgdImportChangesmadeStoreValue,
  pgdImportChangesmadeClearGate,
  pgdImportSaveSelect,
  pgdImportSaveSelectCmpVa,
  pgdImportSaveSelect0f8cCmpVa,
  pgdImportSaveSelectObjVa,
  pgdImportSaveSelectObjCmpVa,
  pgdImportSaveSelectGlobalVa,
  pgdImportEventCounterVa,
  pgdImportGlobalSavePtrVa,
  pgdImportGlobalSaveFieldOff,
  pgdImportGlobalSaveCleared,
  pgdImportGlobalSaveRestore,
  pgdImportReturn1VaA,
  pgdImportReturn1VaB,
  pgdImportResult,
  /* v25n PGDTALLY: stage-4 tally decision laws of 0x009e4260 */
  PGDTALLY_RUN_VA,
  PGDTALLY_SUCCESS_VA,
  PGDTALLY_STORE_7D_VA,
  PGDTALLY_STORE_8C_VA,
  PGDTALLY_COLL_FLAGS_OFF,
  PGDTALLY_SETT_FLAGS_OFF,
  PGDTALLY_COLL_FIRST_IDX,
  PGDTALLY_COLL_BOUND,
  PGDTALLY_COLL_ITERS,
  PGDTALLY_COLL_SUM_GATE,
  PGDTALLY_SETT_FIRST_IDX,
  PGDTALLY_SETT_BOUND,
  PGDTALLY_SETT_ITERS,
  PGDTALLY_SETT_SUM_GATE,
  PGDTALLY_SETT_B_GATE,
  PGDTALLY_COLL_ALIAS_A,
  PGDTALLY_COLL_ALIAS_B,
  PGDTALLY_SETT_ALIAS,
  pgdImportTallyRunVa,
  pgdImportTallySuccessVa,
  pgdImportTallyStore7dVa,
  pgdImportTallyStore8cVa,
  pgdImportTallyCollFlagsOff,
  pgdImportTallySettFlagsOff,
  pgdImportTallyCollFirstIdx,
  pgdImportTallyCollBound,
  pgdImportTallyCollIters,
  pgdImportTallySettFirstIdx,
  pgdImportTallySettBound,
  pgdImportTallySettIters,
  pgdImportTallyCollAliasACount,
  pgdImportTallyCollAliasBCount,
  pgdImportTallySettAliasCount,
  pgdImportTallyCollAliasA,
  pgdImportTallyCollAliasB,
  pgdImportTallySettAlias,
  pgdImportTallyCollBucket,
  pgdImportTallySettBucket,
  pgdImportTallyCollContinue,
  pgdImportTallySettStore7d,
  pgdImportTallySettStore8c,
  pgdImportTallyCollectionCounts,
  pgdImportTallySettingsCounts,
  pgdImportTallyRun,
  /* v26 PGDIVER: import version gates + fail tail */
  PGDIVER_VERSION_OFF,
  PGDIVER_VERSION_BYTES,
  PGDIVER_VERSION_READ_COUNT,
  PGDIVER_VERSION_READ_WIDTH,
  PGDIVER_VERSION_GATE_FIRST_ROW,
  PGDIVER_VERSION_GATE_FIRST_SECTION,
  PGDIVER_VERSION_GATE_LAST_SECTION,
  PGDIVER_FINISH_OFF,
  PGDIVER_FINISH_DEFAULT,
  PGDIVER_FINISH_READ_GATE_SECTION,
  PGDIVER_FAIL_RET_VA,
  PGDIVER_FAIL_LOG_ARGC,
  pgdImportVersionOff,
  pgdImportVersionBytes,
  pgdImportVersionReadCount,
  pgdImportVersionReadWidth,
  pgdImportVersionGateRow,
  pgdImportVersionGateSection,
  pgdImportVersionFinishOff,
  pgdImportVersionFinishDefault,
  pgdImportFinishGate,
  pgdImportTagFailRetVa,
  pgdImportTagFailLogArgc,
  pgdImportTagFailReturnsZero,
  /* v26 PGDREADER2: the sibling reader 0x0041d670 */
  PGD2_READER_VA,
  PGD2_SUCCESS_VA,
  PGD2_RET_OK_VA,
  PGD2_FAIL_TAIL_VA,
  PGD2_FAIL_RET_VA,
  PGD2_RETURN_STACK_BYTES,
  PGD2_READ_CALL_VA,
  PGD2_FIRST_CMP_VA,
  PGD2_TAG_READ_BYTES,
  PGD2_TAG_BYTES,
  PGD2_TAG_COMPARE_DWORDS,
  PGD2_TAG_DWORD_VALUES,
  PGD2_HEADERS,
  PGD2_TAG_HEADERS,
  PGD2_SIZE_GATE_VA,
  PGD2_SIZE_CHECK_SECTION,
  PGD2_TAG_MISS_VA,
  PGD2_TAG_MISS_LOG_VA,
  PGD2_COUNT_MISMATCH_LOG_VA,
  PGD2_VERSION_OFF,
  PGD2_VERSION_FINISH_OFF,
  PGD2_VERSION_BYTES,
  PGD2_VERSION_READ_COUNT,
  PGD2_VERSION_READ_WIDTH,
  PGD2_DISPATCH_TABLE_VA,
  PGD2_DISPATCH_ENTRIES,
  PGD2_DISPATCH_BIAS,
  PGD2ROW_ROWS,
  PGD2ROW_FIRST_SECTION,
  PGD2ROW_LAST_SECTION,
  PGD2ROW_TARGETS,
  PGD2ROW_STORE_OFFS,
  PGD2ROW_WIDTHS,
  PGD2ROW_CLAMP_MAXES,
  PGD2ROW_SETG,
  PGD2ROW_LOG_VAS,
  pgdSiblingTagCompare,
  pgdSiblingTagFirstMatch,
  pgdSiblingTagMatchSection,
  pgdSiblingTagMatchCount,
  pgdSiblingTagHeaderVa,
  pgdSiblingTagHeaderSection,
  pgdSiblingTagHeaderCount,
  pgdSiblingTagCompareBytes,
  pgdSiblingTagCompareDwords,
  pgdSiblingTagReadBytes,
  pgdSiblingSizeGate,
  pgdSiblingCountCheckVa,
  pgdSiblingSizeCheckSection,
  pgdSiblingTagMissVa,
  pgdSiblingTagMissLogVa,
  pgdSiblingCountMismatchLogVa,
  pgdSiblingEntryGate,
  pgdSiblingRecordCountGate,
  pgdSiblingDispatchIndex,
  pgdSiblingDispatchTableVa,
  pgdSiblingDispatchEntries,
  pgdSiblingVersionOff,
  pgdSiblingVersionFinishOff,
  pgdSiblingVersionBytes,
  pgdSiblingVersionReadCount,
  pgdSiblingVersionReadWidth,
  pgdSiblingSuccessVa,
  pgdSiblingRetOkVa,
  pgdSiblingFailTailVa,
  pgdSiblingFailRetVa,
  pgdSiblingRetStackBytes,
  pgdSiblingSectionRowIndex,
  pgdSiblingSectionStoreOff,
  pgdSiblingSectionElemWidth,
  pgdSiblingSectionClampMax,
  pgdSiblingSectionFlagNormalize,
  pgdSiblingSectionLogVa,
  pgdSiblingSectionTargetVa,
  pgdSiblingSectionLoopIterations,
  PGD_CPY_VA,
  PGD_CPY_RET_VA,
  PGD_CPY_BODY_BYTES,
  PGD_CPY_INBOUND,
  PGD_CPY_RETURN_STACK,
  PGD_CPY_RETURNS_THIS,
  PGD_CPY_DIRTY_OFF,
  PGD_CPY_HANDLE_OFF,
  PGD_CPY_HANDLE_CLEAR_VA,
  PGD_CPY_STRING_A_OFF,
  PGD_CPY_STRING_B_OFF,
  PGD_CPY_STRING_SIZE_OFF,
  PGD_CPY_STRING_CAP_OFF,
  PGD_CPY_STRING_HEAP_THRESHOLD,
  PGD_CPY_SELF_GUARD_CMP_VAS,
  PGD_CPY_SELF_GUARD_JE_VAS,
  PGD_CPY_ASSIGN_CALL_VAS,
  PGD_CPY_ASSIGN_CALLEE_VA,
  PGD_CPY_DEFERRED_COUNT_SITE_VA,
  PGD_CPY_DEFERRED_COUNT,
  PGD_CPY_VECTOR_CALLEE_VA,
  PGD_CPY_VECTOR_SITES,
  PGD_CPY_VECTOR_STRIDE,
  PGD_CPY_TAIL_ROWS,
  PGD_CPY_STALE_GAPS,
  PGD_CPY_KIND_REP_MOVSD,
  PGD_CPY_KIND_MOVSW,
  PGD_CPY_KIND_MOVSB,
  PGD_CPY_KIND_MOVUPS,
  PGD_CPY_KIND_MOVQ,
  PGD_CPY_KIND_DWORD,
  PGD_CPY_KIND_WORD,
  PGD_CPY_KIND_BYTE,
  PGD_CPY_KIND_VECTOR,
  PGD_CPY_ROWS_TABLE,
  PGD_CPY_ROWS,
  PGD_CPY_CALL_SITE_VAS,
  PGD_CPY_BULK_COVERED_BYTES,
  pgdCpyRowCovers,
  pgdCpyStaleGapCount,
  pgdCpyStaleGapOff,
  pgdCpyStaleGapBytes,
  pgdCpyStringAssignFires,
  pgdCpyStringDataSelect,
  pgdCpyVectorDstOff,
  pgdCpyPlanTotals,
  /* v35 PGDCON */
  PGD_MGR_PGD_DISP,
  PGD_READONLY_MGR_DISP,
  PGD_DIRTY_MGR_DISP,
  PGD_SEC3CON_FN_VA,
  PGD_SEC3CON_MGR_LOAD_VA,
  PGD_SEC3CON_ADD_DISP_VA,
  PGD_SEC3CON_READONLY_CMP_VA,
  PGD_SEC3CON_READONLY_JNE_VA,
  PGD_SEC3CON_INC_VA,
  PGD_SEC3CON_INC_FOLDED_DISP,
  PGD_SEC3CON_DIRTY_STORE_VA,
  PGD_SEC3CON_THRESHOLD_ROWS,
  PGD_SEC3CON_IDX_UNLOCK_ROWS,
  PGD_SEC3CON_IDX_TAIL_LEA_VA,
  PGD_SEC3CON_IDX_TAIL_CALL_VA,
  pgdSec3ConIncFires,
  pgdSec3ConThresholdUnlocks,
  pgdSec3ConIdxGatedByReadonly,
  pgdSec3ConIdxUnlockId,
  PGD_SEC8INC_FN_VA,
  PGD_SEC8INC_BOUND_CMP_VA,
  PGD_SEC8INC_BOUND_MAX,
  PGD_SEC8INC_INC_VA,
  PGD_SEC8INC_FOLDED_DISP,
  PGD_SEC8INC_DIRTY_0_VA,
  PGD_SEC8INC_AGG_CMP_VA,
  PGD_SEC8INC_AGG_SLOT,
  PGD_SEC8INC_AGG_SKIP_ID,
  PGD_SEC8INC_AGG_FOLDED_DISP,
  PGD_SEC8INC_DIRTY_1_VA,
  PGD_SEC8INC_WARN_BLOCK_VA,
  PGD_SEC8INC_WARN_STRING_VA,
  PGD_SEC8INC_LOG_CALLEE_VA,
  PGD_SEC8INC_RETURN_STACK,
  PGD_SEC8INC_CALL_SITES,
  PGD_SEC8INC_CALL_SITE_VAS,
  PGD_SEC8INC_CALLER_GATE_VA,
  pgdSec8IncInBound,
  pgdSec8IncOutcome,
  PGD_SEC8GATE_SITES,
  pgdSec8GateFires,
  PGD_SEC10COL_INDEX_PROVIDER_VA,
  PGD_SEC10COL_SITES,
  PGD_SEC10CLEAR_SITE,
  pgdSec10ColStoreIndex,
  pgdSec10ColClearsSlot0,
  pgdSec10ColDirtyFires,
  pgdSec10ColSaveLocalAlwaysRuns,
  PGD_SEC5_OUT_OF_CLUSTER_CONSUMERS,
  PGD_SEC9_OUT_OF_CLUSTER_CONSUMERS,
  pgdConFieldStatusUnchanged,
} from "../scripts/decomp/pgd-pure-model.mjs";

/* Executed-assertion counter. Every assert below goes through this proxy so
   the report can state how many checks actually ran, not just how many test
   blocks passed. */
let ASSERTIONS = 0;
const assert = new Proxy(rawAssert, {
  apply(target, thisArg, args) {
    ASSERTIONS += 1;
    return Reflect.apply(target, thisArg, args);
  },
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return (...args) => {
        ASSERTIONS += 1;
        return value.apply(target, args);
      };
    }
    return value;
  },
});

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = join(root, "native", "decomp", "pgd_pure_helpers.h");
const source = join(root, "native", "decomp", "pgd_pure_helpers.cpp");
const outDir = join(root, "output", "decomp", "pgd-pure");
const wasmPath = join(outDir, "pgd-pure-helpers.wasm");

function firstExisting(paths, label) {
  const found = paths.find((path) => path && existsSync(path));
  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

const EXPORTS = [
  "isaac_pgd_string_data_is_heap",
  "isaac_pgd_magic_byte",
  "isaac_pgd_magic_variant",
  "isaac_pgd_version_for_variant",
  "isaac_pgd_max_section_id_for_variant",
  "isaac_pgd_version_loadable",
  "isaac_pgd_section_desc",
  "isaac_pgd_section_stream_bytes",
  "isaac_pgd_section_stream_offset",
  "isaac_pgd_fixed_prefix_bytes",
  "isaac_pgd_reader_loop_continue",
  "isaac_pgd_reader_section_skipped",
  "isaac_pgd_reader_section_dispatched",
  "isaac_pgd_reader_payload_continue",
  "isaac_pgd_reader_store_in_range",
  "isaac_pgd_reader_count_mismatch",
  "isaac_pgd_reader_bool_normalize",
  "isaac_pgd_writer_bool_normalize",
  "isaac_pgd_crc_table_entry",
  "isaac_pgd_crc_table_uses_arithmetic_shift",
  "isaac_pgd_save_uses_state_crc_routine",
  "isaac_pgd_crc_step",
  "isaac_pgd_ror_add_step",
  "isaac_pgd_checksum_init",
  "isaac_pgd_checksum_update",
  "isaac_pgd_checksum_finalize",
  "isaac_pgd_checksum_buffer",
  "isaac_pgd_checksum_file_region",
  "isaac_pgd_checksum_file_valid",
  "isaac_pgd_achievement_index_valid",
  "isaac_pgd_unlocked",
  "isaac_pgd_try_unlock_store_needed",
  "isaac_pgd_try_unlock_steam_leg",
  "isaac_pgd_collection_index_valid",
  "isaac_pgd_collection_store_needed",
  "isaac_pgd_challenge_index_valid",
  "isaac_pgd_challenge_store_needed",
  "isaac_pgd_boss_index_valid",
  "isaac_pgd_boss_store_needed",
  "isaac_pgd_event_counter_next",
  "isaac_pgd_event_counter_store_needed",
  "isaac_pgd_flag_get",
  "isaac_pgd_flag_set",
  "isaac_pgd_flag_popcount",
  "isaac_pgd_bestiary_total",
  "isaac_pgd_bestiary_cap_word",
  "isaac_pgd_bestiary_submap_tag",
  "isaac_pgd_bestiary_submap_pair",
  "isaac_pgd_save_plan",
  /* v2 */
  "isaac_pgd_reader_section_desc",
  "isaac_pgd_reader_dispatch_index",
  "isaac_pgd_reader_handler_va",
  "isaac_pgd_reader_sec9_clamp",
  "isaac_pgd_reader_dispatch_edi",
  "isaac_pgd_reader_elem_byte_cursor",
  "isaac_pgd_reader_elements_consumed",
  "isaac_pgd_reader_elements_stored",
  "isaac_pgd_bestiary_slot_from_tag",
  "isaac_pgd_bestiary_tag_handler_va",
  "isaac_pgd_bestiary_map_root_off",
  "isaac_pgd_bestiary_map_count_off",
  "isaac_pgd_bestiary_pair_count_from_size",
  "isaac_pgd_bestiary_pair_payload_bytes",
  "isaac_pgd_bestiary_size_word_from_pairs",
  "isaac_pgd_sec5_index_remap",
  "isaac_pgd_sec5_out_of_range",
  "isaac_pgd_sec5_store_slot",
  "isaac_pgd_sec5_all_set",
  "isaac_pgd_sec10_store_slot",
  "isaac_pgd_sec10_resets_slot0",
  "isaac_pgd_sec10_store_is_self_cancelling",
  "isaac_pgd_mask41_popcount",
  "isaac_pgd_mask41_unlock_needed",
  "isaac_pgd_mask41_hi_mask",
  /* v3 */
  "isaac_pgd_reader_count_enters_loop",
  "isaac_pgd_reader_loop_back",
  "isaac_pgd_reader_store_normalizes",
  "isaac_pgd_reader_store_value",
  "isaac_pgd_reader_store_offset",
  "isaac_pgd_reader_section_uses_cap",
  "isaac_pgd_bestiary_clear_slot",
  "isaac_pgd_bestiary_outer_continue",
  "isaac_pgd_bestiary_pair_loop_continue",
  "isaac_pgd_bestiary_insert_needed",
  "isaac_pgd_reader_tail_reads_save_counter",
  "isaac_pgd_field_status",
  "isaac_pgd_field_repr",
  "isaac_pgd_pre_section_word_accessor_count",
  "isaac_pgd_alt_transport_field",
  "isaac_pgd_alt_transport_covers",
  "isaac_pgd_bitpack_bytes",
  "isaac_pgd_bitpack_bit",
  "isaac_pgd_bitpack_unpack",
  "isaac_pgd_notify_logs",
  "isaac_pgd_notify_dispatches",
  /* v4 */
  "isaac_pgd_sec3_restore_remap",
  "isaac_pgd_event_restore_remap",
  "isaac_pgd_sec3_restore_loop_continue",
  "isaac_pgd_event_restore_loop_continue",
  "isaac_pgd_sec3_restore_slot",
  "isaac_pgd_event_restore_slot",
  "isaac_pgd_sec3_restore_slot_written",
  "isaac_pgd_event_restore_slot_written",
  "isaac_pgd_sec3_restore_writers",
  "isaac_pgd_event_restore_writers",
  "isaac_pgd_sec3_restore_winning_iteration",
  "isaac_pgd_event_restore_winning_iteration",
  "isaac_pgd_sec3_restore_store_offset",
  "isaac_pgd_event_restore_store_offset",
  /* v6 */
  "isaac_pgd_import_copy_count",
  "isaac_pgd_import_copy_record",
  "isaac_pgd_import_field_written",
  "isaac_pgd_import_written_byte_count",
  "isaac_pgd_import_element_written",
  "isaac_pgd_import_stale_byte_count",
  "isaac_pgd_import_uses_remap",
  "isaac_pgd_import_normalizes",
  "isaac_pgd_import_tail_has_array_stores",
  "isaac_pgd_import_snapshot_bytes",
  /* v7 */
  "isaac_pgd_sibling_event_remap",
  "isaac_pgd_sibling_copy_count",
  "isaac_pgd_sibling_copy_record",
  "isaac_pgd_sibling_field_written",
  "isaac_pgd_sibling_written_byte_count",
  "isaac_pgd_sibling_element_written",
  "isaac_pgd_sibling_stale_byte_count",
  "isaac_pgd_sibling_uses_remap",
  "isaac_pgd_sibling_normalizes",
  "isaac_pgd_sibling_tail_has_array_stores",
  "isaac_pgd_sibling_snapshot_bytes",
  /* v8 */
  "isaac_pgd_clear_zero_row_count",
  "isaac_pgd_clear_zero_record",
  "isaac_pgd_clear_zero_row_span_dwords",
  "isaac_pgd_clear_save_counter_cleared",
  "isaac_pgd_clear_map_count",
  "isaac_pgd_clear_map_record",
  "isaac_pgd_clear_map_slot_at_step",
  "isaac_pgd_clear_tail_store_count",
  "isaac_pgd_clear_tail_store_record",
  "isaac_pgd_clear_field_status",
  "isaac_pgd_clear_byte_zeroed",
  "isaac_pgd_clear_total_zeroed_bytes",
  "isaac_pgd_clear_gap_offset",
  "isaac_pgd_clear_gap_length",
  "isaac_pgd_clear_map_order_matches_reader",
  "isaac_pgd_clear_map_order_matches_writer",
  "isaac_pgd_clear_call_site_count",
  "isaac_pgd_clear_call_site_va",
  "isaac_pgd_import_tail_step_count",
  "isaac_pgd_import_tail_record",
  "isaac_pgd_import_tail_event_args_0",
  "isaac_pgd_import_tail_event_args_1",
  "isaac_pgd_import_tail_gate_open",
  "isaac_pgd_import_tail_save_to_steam_needed",
  "isaac_pgd_import_tail_preserves_game_guard",
  "isaac_pgd_import_tail_returns_one_unless_read_failed",
  "isaac_pgd_import_reader_va",
  "isaac_pgd_import_reader_call_site_va",
  "isaac_pgd_sibling_reader_va",
  "isaac_pgd_sibling_reader_call_site_va",
  "isaac_pgd_sibling_snapshot_ctor_va",
  "isaac_pgd_sibling_ctor_call_site_count",
  "isaac_pgd_sibling_ctor_call_site_va",
  "isaac_pgd_import_reader_call_site_count",
  "isaac_pgd_sibling_reader_call_site_count",
  "isaac_pgd_import_reader_is_shared_with_sibling",
  /* v9 PGDCT */
  "isaac_pgd_snapshot_ctor_zero_row_count",
  "isaac_pgd_snapshot_ctor_zero_record",
  "isaac_pgd_snapshot_ctor_zero_span_dwords",
  "isaac_pgd_snapshot_ctor_byte_zeroed",
  "isaac_pgd_snapshot_ctor_total_zeroed_bytes",
  "isaac_pgd_snapshot_ctor_set_one_offset",
  "isaac_pgd_snapshot_ctor_set_one_value",
  "isaac_pgd_snapshot_ctor_gap_count",
  "isaac_pgd_snapshot_ctor_gap_record",
  "isaac_pgd_snapshot_ctor_arg_unused",
  "isaac_pgd_snapshot_ctor_restore_source_covered",
  "isaac_pgd_snapshot_ctor_covers_all_restore_sources",
  /* v10 PGDICT */
  "isaac_pgd_import_ctor_zero_row_count",
  "isaac_pgd_import_ctor_zero_record",
  "isaac_pgd_import_ctor_zero_span_dwords",
  "isaac_pgd_import_ctor_byte_zeroed",
  "isaac_pgd_import_ctor_total_zeroed_bytes",
  "isaac_pgd_import_ctor_set_one_offset",
  "isaac_pgd_import_ctor_set_one_value",
  "isaac_pgd_import_ctor_set_one_count",
  "isaac_pgd_import_ctor_gap_count",
  "isaac_pgd_import_ctor_gap_record",
  "isaac_pgd_import_ctor_arg_unused",
  "isaac_pgd_import_ctor_restore_source_covered",
  "isaac_pgd_import_ctor_covers_all_restore_sources",
  "isaac_pgd_import_snapshot_ctor_va",
  "isaac_pgd_import_ctor_call_site_count",
  "isaac_pgd_import_ctor_call_site_va",
  /* v11 PGDCLMP */
  "isaac_pgd_reader_clamp_floor",
  "isaac_pgd_reader_clamp_flag_block_taken",
  "isaac_pgd_reader_clamp_stair_taken",
  "isaac_pgd_reader_clamp_stair_offset",
  "isaac_pgd_reader_clamp_stair_count",
  "isaac_pgd_reader_clamp_tail_taken",
  "isaac_pgd_reader_clamp_tail_count",
  "isaac_pgd_reader_clamp_tail_gate_offset",
  "isaac_pgd_reader_clamp_tail_slot_offset",
  "isaac_pgd_reader_clamp_accum_written",
  "isaac_pgd_reader_clamp_apply",
  "isaac_pgd_reader_clamp_va",
  "isaac_pgd_reader_clamp_ret_va",
  "isaac_pgd_reader_clamp_call_site_count",
  "isaac_pgd_reader_clamp_call_site_va",
  "isaac_pgd_reader_clamp_host_calls",
  "isaac_pgd_reader_clamp_floor_const",
  /* v12 PGDTREE */
  "isaac_pgd_tree_isnil_byte",
  "isaac_pgd_tree_right_nil_arm",
  "isaac_pgd_tree_iterator_next",
  "isaac_pgd_tree_next_va",
  "isaac_pgd_tree_next_ret_a_va",
  "isaac_pgd_tree_next_ret_b_va",
  "isaac_pgd_tree_next_body_bytes",
  "isaac_pgd_tree_next_host_calls",
  "isaac_pgd_tree_next_call_sites_image",
  "isaac_pgd_tree_next_call_sites_cluster",
  "isaac_pgd_tree_next_cluster_site_va",
  "isaac_pgd_tree_left_off",
  "isaac_pgd_tree_parent_off",
  "isaac_pgd_tree_right_off",
  "isaac_pgd_tree_isnil_off",
  /* v13 PGDTROW */
  "isaac_pgd_tree_row_key_off",
  "isaac_pgd_tree_row_value_off",
  "isaac_pgd_tree_row_stride",
  "isaac_pgd_tree_row_advance_va",
  "isaac_pgd_tree_row_writer_va",
  "isaac_pgd_tree_row_alt_va",
  "isaac_pgd_tree_row_reader_va",
  "isaac_pgd_tree_row_empty",
  "isaac_pgd_tree_row_loop_back",
  "isaac_pgd_tree_row_walk_count",
  "isaac_pgd_tree_row_walk_slot",
  "isaac_pgd_tree_row_walk_tag",
  "isaac_pgd_tree_row_walk_header_off",
  "isaac_pgd_tree_row_walk_count_off",
  "isaac_pgd_tree_row_walk_gate_va",
  "isaac_pgd_tree_row_walk_loop_head_va",
  "isaac_pgd_tree_row_walk_key_va",
  "isaac_pgd_tree_row_walk_value_va",
  "isaac_pgd_tree_row_walk_call_va",
  "isaac_pgd_tree_row_walk_loop_back_va",
  "isaac_pgd_tree_row_order_matches_bestiary_pairs",
  /* v14 PGDSC11 */
  "isaac_pgd_sec11_header_id",
  "isaac_pgd_sec11_sub_block_count",
  "isaac_pgd_sec11_row_total",
  "isaac_pgd_sec11_header_cap",
  "isaac_pgd_sec11_sub_cap",
  "isaac_pgd_sec11_rows_from_cap",
  "isaac_pgd_sec11_sub_count_zero",
  "isaac_pgd_sec11_tag_valid",
  "isaac_pgd_sec11_sub_loop_back",
  "isaac_pgd_sec11_row_loop_back",
  "isaac_pgd_sec11_total_va",
  "isaac_pgd_sec11_total_final_add_va",
  "isaac_pgd_sec11_id_store_va",
  "isaac_pgd_sec11_count_dead_store_va",
  "isaac_pgd_sec11_cap_shl_va",
  "isaac_pgd_sec11_cap_write_va",
  "isaac_pgd_sec11_subcount_store_va",
  "isaac_pgd_sec11_subcount_write_va",
  "isaac_pgd_sec11_reader_subcount_read_va",
  "isaac_pgd_sec11_reader_handler_va",
  "isaac_pgd_sec11_reader_tag_read_va",
  "isaac_pgd_sec11_reader_tag_gate_va",
  "isaac_pgd_sec11_reader_cap_gate_va",
  "isaac_pgd_sec11_reader_cap_shr_va",
  "isaac_pgd_sec11_reader_row_loop_back_va",
  "isaac_pgd_sec11_reader_sub_loop_back_va",
  "isaac_pgd_sec11_tag_write_va",
  "isaac_pgd_sec11_cap_source_va",
  "isaac_pgd_sec11_cap_shl_step_va",
  "isaac_pgd_sec11_framing_matches_row_walk",
  /* v15 PGDCP */
  "isaac_pgd_count_probe_va",
  "isaac_pgd_count_probe_ret_ok_va",
  "isaac_pgd_count_probe_ret_fail_va",
  "isaac_pgd_count_probe_next_va",
  "isaac_pgd_count_probe_call_site_count",
  "isaac_pgd_count_probe_call_site_va",
  "isaac_pgd_count_global_va",
  "isaac_pgd_count_game_va",
  "isaac_pgd_count_tree_off",
  "isaac_pgd_count_slot7c_off",
  "isaac_pgd_count_float_off",
  "isaac_pgd_count_flag_off",
  "isaac_pgd_count_slot0_count_off",
  "isaac_pgd_count_readonly_gate_va",
  "isaac_pgd_count_store_gate_va",
  "isaac_pgd_count_store_gate_jne_va",
  "isaac_pgd_count_header_load_va",
  "isaac_pgd_count_empty_gate_va",
  "isaac_pgd_count_gate1_cmp_va",
  "isaac_pgd_count_gate1_jl_va",
  "isaac_pgd_count_gate2_movss_va",
  "isaac_pgd_count_gate2_ucomiss_va",
  "isaac_pgd_count_gate2_lahf_va",
  "isaac_pgd_count_gate2_test_va",
  "isaac_pgd_count_gate2_jnp_va",
  "isaac_pgd_count_gate3_cmp_va",
  "isaac_pgd_count_gate3_je_va",
  "isaac_pgd_count_inc_va",
  "isaac_pgd_count_advance_va",
  "isaac_pgd_count_loop_back_cmp_va",
  "isaac_pgd_count_loop_back_jne_va",
  "isaac_pgd_count_store_va",
  "isaac_pgd_count_proceed_cmp_va",
  "isaac_pgd_count_proceed_jb_va",
  "isaac_pgd_count_probe_blocked",
  "isaac_pgd_count_eligible",
  "isaac_pgd_count_store_needed",
  "isaac_pgd_count_effective",
  "isaac_pgd_count_proceed",
  /* v16 PGDDEATH */
  "isaac_pgd_bestiary_death_va",
  "isaac_pgd_bestiary_death_ret_ok_va",
  "isaac_pgd_bestiary_death_ret_node_fail_va",
  "isaac_pgd_bestiary_death_ret_fail_va",
  "isaac_pgd_bestiary_death_call_site_count",
  "isaac_pgd_bestiary_death_call_site_va",
  "isaac_pgd_bestiary_death_slot3_header_off",
  "isaac_pgd_bestiary_death_marker_off",
  "isaac_pgd_bestiary_death_key_off",
  "isaac_pgd_bestiary_death_value_off",
  "isaac_pgd_bestiary_death_game_va",
  "isaac_pgd_bestiary_death_container_off",
  "isaac_pgd_bestiary_death_gate_byte_off",
  "isaac_pgd_bestiary_death_container_find_va",
  "isaac_pgd_bestiary_death_map_find_va",
  "isaac_pgd_bestiary_death_key_shift12_va",
  "isaac_pgd_bestiary_death_key_or_va",
  "isaac_pgd_bestiary_death_key_shift8_va",
  "isaac_pgd_bestiary_death_marker_cmp_va",
  "isaac_pgd_bestiary_death_marker_jne_va",
  "isaac_pgd_bestiary_death_key_cmp_va",
  "isaac_pgd_bestiary_death_key_jl_va",
  "isaac_pgd_bestiary_death_header_cmp_va",
  "isaac_pgd_bestiary_death_header_je_va",
  "isaac_pgd_bestiary_death_value_load_va",
  "isaac_pgd_bestiary_death_key",
  "isaac_pgd_bestiary_death_node_ok",
  "isaac_pgd_bestiary_death_value",
  /* v17 PGDKILL */
  "isaac_pgd_bestiary_kill_va",
  "isaac_pgd_bestiary_kill_ret_ok_va",
  "isaac_pgd_bestiary_kill_ret_node_fail_va",
  "isaac_pgd_bestiary_kill_ret_fail_va",
  "isaac_pgd_bestiary_kill_call_site_count",
  "isaac_pgd_bestiary_kill_call_site_va",
  "isaac_pgd_bestiary_kill_slot1_header_off",
  "isaac_pgd_bestiary_kill_marker_off",
  "isaac_pgd_bestiary_kill_key_off",
  "isaac_pgd_bestiary_kill_value_off",
  "isaac_pgd_bestiary_kill_game_va",
  "isaac_pgd_bestiary_kill_container_off",
  "isaac_pgd_bestiary_kill_gate_byte_off",
  "isaac_pgd_bestiary_kill_container_find_va",
  "isaac_pgd_bestiary_kill_map_find_va",
  "isaac_pgd_bestiary_kill_key_shift12_va",
  "isaac_pgd_bestiary_kill_key_or_va",
  "isaac_pgd_bestiary_kill_key_shift8_va",
  "isaac_pgd_bestiary_kill_marker_cmp_va",
  "isaac_pgd_bestiary_kill_marker_jne_va",
  "isaac_pgd_bestiary_kill_key_cmp_va",
  "isaac_pgd_bestiary_kill_key_jl_va",
  "isaac_pgd_bestiary_kill_header_cmp_va",
  "isaac_pgd_bestiary_kill_header_je_va",
  "isaac_pgd_bestiary_kill_value_load_va",
  "isaac_pgd_bestiary_kill_key",
  "isaac_pgd_bestiary_kill_node_ok",
  "isaac_pgd_bestiary_kill_value",
  /* v17 PGDENC */
  "isaac_pgd_bestiary_encounter_va",
  "isaac_pgd_bestiary_encounter_ret_ok_va",
  "isaac_pgd_bestiary_encounter_ret_fail_va",
  "isaac_pgd_bestiary_encounter_helper_va",
  "isaac_pgd_bestiary_encounter_helper_ret_ok_va",
  "isaac_pgd_bestiary_encounter_helper_ret_fail_va",
  "isaac_pgd_bestiary_encounter_call_site_count",
  "isaac_pgd_bestiary_encounter_call_site_va",
  "isaac_pgd_bestiary_encounter_slot0_header_off",
  "isaac_pgd_bestiary_encounter_marker_off",
  "isaac_pgd_bestiary_encounter_key_off",
  "isaac_pgd_bestiary_encounter_value_off",
  "isaac_pgd_bestiary_encounter_game_va",
  "isaac_pgd_bestiary_encounter_container_off",
  "isaac_pgd_bestiary_encounter_gate_byte_off",
  "isaac_pgd_bestiary_encounter_container_find_va",
  "isaac_pgd_bestiary_encounter_map_find_va",
  "isaac_pgd_bestiary_encounter_key_shift12_va",
  "isaac_pgd_bestiary_encounter_key_or_va",
  "isaac_pgd_bestiary_encounter_key_shift8_va",
  "isaac_pgd_bestiary_encounter_marker_cmp_va",
  "isaac_pgd_bestiary_encounter_marker_jne_va",
  "isaac_pgd_bestiary_encounter_key_cmp_va",
  "isaac_pgd_bestiary_encounter_key_jl_va",
  "isaac_pgd_bestiary_encounter_header_cmp_va",
  "isaac_pgd_bestiary_encounter_header_je_va",
  "isaac_pgd_bestiary_encounter_value_load_va",
  "isaac_pgd_bestiary_encounter_helper_call_site_count",
  "isaac_pgd_bestiary_encounter_helper_call_site_va",
  "isaac_pgd_bestiary_encounter_key",
  "isaac_pgd_bestiary_encounter_node_ok",
  "isaac_pgd_bestiary_encounter_value",
  /* v18 PGDADDKILL */
  "isaac_pgd_bestiary_addkill_va",
  "isaac_pgd_bestiary_addkill_ret_ok_va",
  "isaac_pgd_bestiary_addkill_ret_fail_va",
  "isaac_pgd_bestiary_addkill_call_site_count",
  "isaac_pgd_bestiary_addkill_call_site_va",
  "isaac_pgd_bestiary_addkill_slot1_header_off",
  "isaac_pgd_bestiary_addkill_marker_off",
  "isaac_pgd_bestiary_addkill_key_off",
  "isaac_pgd_bestiary_addkill_value_off",
  "isaac_pgd_bestiary_addkill_game_va",
  "isaac_pgd_bestiary_addkill_container_off",
  "isaac_pgd_bestiary_addkill_gate_byte_off",
  "isaac_pgd_bestiary_addkill_container_find_va",
  "isaac_pgd_bestiary_addkill_map_find_va",
  "isaac_pgd_bestiary_addkill_value_accessor_va",
  "isaac_pgd_bestiary_addkill_kill_getter_va",
  "isaac_pgd_bestiary_addkill_unlock_va",
  "isaac_pgd_bestiary_addkill_type_base",
  "isaac_pgd_bestiary_addkill_range",
  "isaac_pgd_bestiary_addkill_bt_va",
  "isaac_pgd_bestiary_addkill_bt_entries",
  "isaac_pgd_bestiary_addkill_jt_va",
  "isaac_pgd_bestiary_addkill_readonly_cmp_va",
  "isaac_pgd_bestiary_addkill_readonly_jne_va",
  "isaac_pgd_bestiary_addkill_rec_test_va",
  "isaac_pgd_bestiary_addkill_rec_je_va",
  "isaac_pgd_bestiary_addkill_gate_cmp_va",
  "isaac_pgd_bestiary_addkill_gate_je_va",
  "isaac_pgd_bestiary_addkill_key_shift12_va",
  "isaac_pgd_bestiary_addkill_key_or_va",
  "isaac_pgd_bestiary_addkill_key_shift8_va",
  "isaac_pgd_bestiary_addkill_marker_cmp_va",
  "isaac_pgd_bestiary_addkill_marker_jne_va",
  "isaac_pgd_bestiary_addkill_key_cmp_va",
  "isaac_pgd_bestiary_addkill_key_jl_va",
  "isaac_pgd_bestiary_addkill_header_cmp_va",
  "isaac_pgd_bestiary_addkill_header_je_va",
  "isaac_pgd_bestiary_addkill_store_inc_va",
  "isaac_pgd_bestiary_addkill_store_set1_va",
  "isaac_pgd_bestiary_addkill_range_cmp_va",
  "isaac_pgd_bestiary_addkill_range_ja_va",
  "isaac_pgd_bestiary_addkill_table_load_va",
  "isaac_pgd_bestiary_addkill_dispatch_jmp_va",
  "isaac_pgd_bestiary_addkill_case1_cmp_va",
  "isaac_pgd_bestiary_addkill_case1_jb_va",
  "isaac_pgd_bestiary_addkill_case1_push_va",
  "isaac_pgd_bestiary_addkill_case1_ret_va",
  "isaac_pgd_bestiary_addkill_case2_cmp_va",
  "isaac_pgd_bestiary_addkill_case2_jb_va",
  "isaac_pgd_bestiary_addkill_case2_push_va",
  "isaac_pgd_bestiary_addkill_case2_ret_va",
  "isaac_pgd_bestiary_addkill_case0_call1_va",
  "isaac_pgd_bestiary_addkill_case0_call2_va",
  "isaac_pgd_bestiary_addkill_case0_add_va",
  "isaac_pgd_bestiary_addkill_case0_cmp_va",
  "isaac_pgd_bestiary_addkill_case0_jb_va",
  "isaac_pgd_bestiary_addkill_case0_push_va",
  "isaac_pgd_bestiary_addkill_ok",
  "isaac_pgd_bestiary_addkill_key",
  "isaac_pgd_bestiary_addkill_node_ok",
  "isaac_pgd_bestiary_addkill_store_value",
  "isaac_pgd_bestiary_addkill_dispatch_case",
  "isaac_pgd_bestiary_addkill_unlock_needed",
  "isaac_pgd_bestiary_addkill_unlock_id",
  "isaac_pgd_bestiary_addkill_case0_sum",
  /* v19 PGDADDSIB2 */
  "isaac_pgd_bestiary_addsib2_va",
  "isaac_pgd_bestiary_addsib2_ret_ok_va",
  "isaac_pgd_bestiary_addsib2_ret_fail_va",
  "isaac_pgd_bestiary_addsib2_call_site_count",
  "isaac_pgd_bestiary_addsib2_call_site_va",
  "isaac_pgd_bestiary_addsib2_helper_va",
  "isaac_pgd_bestiary_addsib2_helper_ret_ok_va",
  "isaac_pgd_bestiary_addsib2_helper_ret_insert_va",
  "isaac_pgd_bestiary_addsib2_helper_ret_readonly_fail_va",
  "isaac_pgd_bestiary_addsib2_slot2_header_off",
  "isaac_pgd_bestiary_addsib2_marker_off",
  "isaac_pgd_bestiary_addsib2_key_off",
  "isaac_pgd_bestiary_addsib2_value_off",
  "isaac_pgd_bestiary_addsib2_game_va",
  "isaac_pgd_bestiary_addsib2_container_off",
  "isaac_pgd_bestiary_addsib2_gate_byte_off",
  "isaac_pgd_bestiary_addsib2_container_find_va",
  "isaac_pgd_bestiary_addsib2_map_find_va",
  "isaac_pgd_bestiary_addsib2_value_accessor_va",
  "isaac_pgd_bestiary_addsib2_readonly_cmp_va",
  "isaac_pgd_bestiary_addsib2_readonly_jne_va",
  "isaac_pgd_bestiary_addsib2_rec_test_va",
  "isaac_pgd_bestiary_addsib2_rec_je_va",
  "isaac_pgd_bestiary_addsib2_gate_cmp_va",
  "isaac_pgd_bestiary_addsib2_gate_je_va",
  "isaac_pgd_bestiary_addsib2_key_shift12_va",
  "isaac_pgd_bestiary_addsib2_key_or_va",
  "isaac_pgd_bestiary_addsib2_key_shift8_va",
  "isaac_pgd_bestiary_addsib2_helper_call_site_va",
  "isaac_pgd_bestiary_addsib2_helper_readonly_cmp_va",
  "isaac_pgd_bestiary_addsib2_helper_readonly_je_va",
  "isaac_pgd_bestiary_addsib2_map_find_call_va",
  "isaac_pgd_bestiary_addsib2_node_marker_cmp_va",
  "isaac_pgd_bestiary_addsib2_node_marker_jne_va",
  "isaac_pgd_bestiary_addsib2_node_key_cmp_va",
  "isaac_pgd_bestiary_addsib2_node_key_jl_va",
  "isaac_pgd_bestiary_addsib2_node_header_cmp_va",
  "isaac_pgd_bestiary_addsib2_node_header_je_va",
  "isaac_pgd_bestiary_addsib2_store_inc_va",
  "isaac_pgd_bestiary_addsib2_store_set1_va",
  "isaac_pgd_bestiary_addsib2_ok",
  "isaac_pgd_bestiary_addsib2_helper_ok",
  "isaac_pgd_bestiary_addsib2_key",
  "isaac_pgd_bestiary_addsib2_node_ok",
  "isaac_pgd_bestiary_addsib2_store_value",
  /* v19 PGDADDSIB3 */
  "isaac_pgd_bestiary_addsib3_va",
  "isaac_pgd_bestiary_addsib3_ret_ok_va",
  "isaac_pgd_bestiary_addsib3_ret_fail_va",
  "isaac_pgd_bestiary_addsib3_call_site_count",
  "isaac_pgd_bestiary_addsib3_call_site_va",
  "isaac_pgd_bestiary_addsib3_helper_va",
  "isaac_pgd_bestiary_addsib3_helper_ret_ok_va",
  "isaac_pgd_bestiary_addsib3_helper_ret_insert_va",
  "isaac_pgd_bestiary_addsib3_helper_ret_readonly_fail_va",
  "isaac_pgd_bestiary_addsib3_slot3_header_off",
  "isaac_pgd_bestiary_addsib3_marker_off",
  "isaac_pgd_bestiary_addsib3_key_off",
  "isaac_pgd_bestiary_addsib3_value_off",
  "isaac_pgd_bestiary_addsib3_game_va",
  "isaac_pgd_bestiary_addsib3_container_off",
  "isaac_pgd_bestiary_addsib3_gate_byte_off",
  "isaac_pgd_bestiary_addsib3_container_find_va",
  "isaac_pgd_bestiary_addsib3_map_find_va",
  "isaac_pgd_bestiary_addsib3_value_accessor_va",
  "isaac_pgd_bestiary_addsib3_readonly_cmp_va",
  "isaac_pgd_bestiary_addsib3_readonly_jne_va",
  "isaac_pgd_bestiary_addsib3_rec_test_va",
  "isaac_pgd_bestiary_addsib3_rec_je_va",
  "isaac_pgd_bestiary_addsib3_gate_cmp_va",
  "isaac_pgd_bestiary_addsib3_gate_je_va",
  "isaac_pgd_bestiary_addsib3_key_shift12_va",
  "isaac_pgd_bestiary_addsib3_key_or_va",
  "isaac_pgd_bestiary_addsib3_key_shift8_va",
  "isaac_pgd_bestiary_addsib3_helper_call_site_va",
  "isaac_pgd_bestiary_addsib3_helper_readonly_cmp_va",
  "isaac_pgd_bestiary_addsib3_helper_readonly_je_va",
  "isaac_pgd_bestiary_addsib3_map_find_call_va",
  "isaac_pgd_bestiary_addsib3_node_marker_cmp_va",
  "isaac_pgd_bestiary_addsib3_node_marker_jne_va",
  "isaac_pgd_bestiary_addsib3_node_key_cmp_va",
  "isaac_pgd_bestiary_addsib3_node_key_jl_va",
  "isaac_pgd_bestiary_addsib3_node_header_cmp_va",
  "isaac_pgd_bestiary_addsib3_node_header_je_va",
  "isaac_pgd_bestiary_addsib3_store_inc_va",
  "isaac_pgd_bestiary_addsib3_store_set1_va",
  "isaac_pgd_bestiary_addsib3_ok",
  "isaac_pgd_bestiary_addsib3_helper_ok",
  "isaac_pgd_bestiary_addsib3_key",
  "isaac_pgd_bestiary_addsib3_node_ok",
  "isaac_pgd_bestiary_addsib3_store_value",
  /* v20 PGDADDCH */
  "isaac_pgd_addchallenge_va",
  "isaac_pgd_addchallenge_ret_fail_va",
  "isaac_pgd_addchallenge_ret_fail_tail_va",
  "isaac_pgd_addchallenge_call_site_count",
  "isaac_pgd_addchallenge_call_site_va",
  "isaac_pgd_addchallenge_readonly_cmp_va",
  "isaac_pgd_addchallenge_readonly_jne_va",
  "isaac_pgd_addchallenge_arg_gate1_cmp_va",
  "isaac_pgd_addchallenge_arg_gate1_ja_va",
  "isaac_pgd_addchallenge_flag_store_va",
  "isaac_pgd_addchallenge_flag_off",
  "isaac_pgd_addchallenge_dec_va",
  "isaac_pgd_addchallenge_arg_gate2_cmp_va",
  "isaac_pgd_addchallenge_arg_gate2_ja_va",
  "isaac_pgd_addchallenge_jump_va",
  "isaac_pgd_addchallenge_table_va",
  "isaac_pgd_addchallenge_table_entries",
  "isaac_pgd_addchallenge_first_arm_va",
  "isaac_pgd_addchallenge_last_arm_va",
  "isaac_pgd_addchallenge_tail_target_va",
  "isaac_pgd_addchallenge_max_arg",
  "isaac_pgd_addchallenge_max_index",
  "isaac_pgd_addchallenge_table_entry_va",
  "isaac_pgd_addchallenge_unlock_id",
  "isaac_pgd_addchallenge_flag_store_gate",
  "isaac_pgd_addchallenge_dispatch_gate",
  "isaac_pgd_addchallenge_flag_byte_off",
  "isaac_pgd_addchallenge_unlock_id_for_arg",
  /* v21 PGDADDBOSS */
  "isaac_pgd_addboss_va",
  "isaac_pgd_addboss_ret_fail_va",
  "isaac_pgd_addboss_ret_fail_tail_va",
  "isaac_pgd_addboss_call_site_count",
  "isaac_pgd_addboss_call_site_va",
  "isaac_pgd_addboss_readonly_cmp_va",
  "isaac_pgd_addboss_readonly_jne_va",
  "isaac_pgd_addboss_arg_gate_cmp_va",
  "isaac_pgd_addboss_arg_gate_jge_va",
  "isaac_pgd_addboss_flag_store_va",
  "isaac_pgd_addboss_flag_off",
  "isaac_pgd_addboss_dirty_store_va",
  "isaac_pgd_addboss_dirty_off",
  "isaac_pgd_addboss_log_string_va",
  "isaac_pgd_addboss_log_call_va",
  "isaac_pgd_addboss_log_callee_va",
  "isaac_pgd_addboss_unlock_chain_va",
  "isaac_pgd_addboss_unlock_blocks",
  "isaac_pgd_addboss_tail_target_va",
  "isaac_pgd_addboss_max_arg",
  "isaac_pgd_addboss_max_index",
  "isaac_pgd_addboss_block_first_cmp_va",
  "isaac_pgd_addboss_block_call_va",
  "isaac_pgd_addboss_block_push_va",
  "isaac_pgd_addboss_block_byte_count",
  "isaac_pgd_addboss_block_byte_off",
  "isaac_pgd_addboss_block_unlock_id",
  "isaac_pgd_addboss_entry_gate",
  "isaac_pgd_addboss_flag_byte_off",
  "isaac_pgd_addboss_block_gate",
  "isaac_pgd_addboss_unlock_fires",
  /* v22 PGDADDMINI */
  "isaac_pgd_addmini_va",
  "isaac_pgd_addmini_ret_fail_va",
  "isaac_pgd_addmini_ret_fail_tail_va",
  "isaac_pgd_addmini_ret_ok_va",
  "isaac_pgd_addmini_call_site_count",
  "isaac_pgd_addmini_call_site_va",
  "isaac_pgd_addmini_readonly_cmp_va",
  "isaac_pgd_addmini_readonly_jne_va",
  "isaac_pgd_addmini_arg_gate_cmp_va",
  "isaac_pgd_addmini_arg_gate_ja_va",
  "isaac_pgd_addmini_map_lea_va",
  "isaac_pgd_addmini_map_cmp_va",
  "isaac_pgd_addmini_map_ja_va",
  "isaac_pgd_addmini_alias_cmp_va",
  "isaac_pgd_addmini_alias_jne_va",
  "isaac_pgd_addmini_alias_mov_va",
  "isaac_pgd_addmini_tail_cmp_va",
  "isaac_pgd_addmini_tail_jg_va",
  "isaac_pgd_addmini_flag_store_va",
  "isaac_pgd_addmini_flag_off",
  "isaac_pgd_addmini_dirty_store_va",
  "isaac_pgd_addmini_dirty_off",
  "isaac_pgd_addmini_log_string_va",
  "isaac_pgd_addmini_log_call_va",
  "isaac_pgd_addmini_log_callee_va",
  "isaac_pgd_addmini_warn_string_va",
  "isaac_pgd_addmini_warn_call_va",
  "isaac_pgd_addmini_unlock_first_cmp_va",
  "isaac_pgd_addmini_unlock_push_va",
  "isaac_pgd_addmini_unlock_call_va",
  "isaac_pgd_addmini_unlock_target_va",
  "isaac_pgd_addmini_slots",
  "isaac_pgd_addmini_unlock_id",
  "isaac_pgd_addmini_id_max",
  "isaac_pgd_addmini_remap_base",
  "isaac_pgd_addmini_remap_span",
  "isaac_pgd_addmini_alias_id",
  "isaac_pgd_addmini_index_remap",
  "isaac_pgd_addmini_out_of_range",
  "isaac_pgd_addmini_outcome",
  "isaac_pgd_addmini_flag_byte_off",
  "isaac_pgd_addmini_unlock_gate",
  "isaac_pgd_addmini_unlock_fires",
  /* v23 PGDADSED + PGDK41 */
  "isaac_pgd_adsed_va",
  "isaac_pgd_adsed_ret_va",
  "isaac_pgd_adsed_readonly_cmp_va",
  "isaac_pgd_adsed_readonly_jne_va",
  "isaac_pgd_adsed_slot_store_va",
  "isaac_pgd_adsed_slot0_clear_va",
  "isaac_pgd_adsed_slot_base",
  "isaac_pgd_adsed_slots",
  "isaac_pgd_adsed_dirty_store_va",
  "isaac_pgd_adsed_dirty_off",
  "isaac_pgd_adsed_readonly_off",
  "isaac_pgd_adsed_log_string_va",
  "isaac_pgd_adsed_log_call_va",
  "isaac_pgd_adsed_log_callee_va",
  "isaac_pgd_adsed_gate",
  "isaac_pgd_adsed_outcome",
  "isaac_pgd_adsed_store_index",
  "isaac_pgd_adsed_self_cancelling",
  "isaac_pgd_adsed_slot0_after",
  "isaac_pgd_adsed_dirty_fires",
  "isaac_pgd_k41_va",
  "isaac_pgd_k41_ret_va",
  "isaac_pgd_k41_lo_counter_store_va",
  "isaac_pgd_k41_hi_counter_store_va",
  "isaac_pgd_k41_lo_counter_index",
  "isaac_pgd_k41_hi_counter_index",
  "isaac_pgd_k41_bits",
  "isaac_pgd_k41_loop_bts_va",
  "isaac_pgd_k41_loop_bound_cmp_va",
  "isaac_pgd_k41_loop_bound_jl_va",
  "isaac_pgd_k41_loop_or_je_va",
  "isaac_pgd_k41_gate_cmp_va",
  "isaac_pgd_k41_gate_jl_va",
  "isaac_pgd_k41_unlock_push_va",
  "isaac_pgd_k41_unlock_call_va",
  "isaac_pgd_k41_unlock_target_va",
  "isaac_pgd_k41_unlock_id",
  "isaac_pgd_k41_unlock_threshold",
  "isaac_pgd_k41_dirty_store_va",
  "isaac_pgd_k41_dirty_off",
  "isaac_pgd_k41_counter_base",
  "isaac_pgd_k41_popcount",
  "isaac_pgd_k41_gate",
  "isaac_pgd_k41_unlock_fires",
  "isaac_pgd_k41_dirty_fires",
  "isaac_pgd_k41_counter_store_off",
  /* v24 PGDITAG + PGDIDISP */
  "isaac_pgd_import_tag_header_count",
  "isaac_pgd_import_tag_header_va",
  "isaac_pgd_import_tag_header_section",
  "isaac_pgd_import_tag_header_count_max",
  "isaac_pgd_import_tag_header_dword",
  "isaac_pgd_import_tag_compare_bytes",
  "isaac_pgd_import_tag_compare_dwords",
  "isaac_pgd_import_tag_read_bytes",
  "isaac_pgd_import_tag_read_call_va",
  "isaac_pgd_import_tag_first_cmp_va",
  "isaac_pgd_import_tag_fail_log_va",
  "isaac_pgd_import_tag_fail_tail_va",
  "isaac_pgd_import_tag_compare",
  "isaac_pgd_import_tag_first_match",
  "isaac_pgd_import_tag_match_section",
  "isaac_pgd_import_tag_match_count_max",
  "isaac_pgd_import_dispatch_table_va",
  "isaac_pgd_import_dispatch_entries",
  "isaac_pgd_import_dispatch_gate_cmp_va",
  "isaac_pgd_import_dispatch_gate_ja_va",
  "isaac_pgd_import_entry_gate_js_va",
  "isaac_pgd_import_entry_gate_jge_va",
  "isaac_pgd_import_count_gate_cmp_va",
  "isaac_pgd_import_count_gate_jbe_va",
  "isaac_pgd_import_loop_jae_va",
  "isaac_pgd_import_loop_jb_va",
  "isaac_pgd_import_dispatch_index",
  "isaac_pgd_import_handler_count",
  "isaac_pgd_import_handler_section",
  "isaac_pgd_import_handler_target_va",
  "isaac_pgd_import_handler_store_off",
  "isaac_pgd_import_handler_elem_width",
  "isaac_pgd_import_handler_clamp_max",
  "isaac_pgd_import_handler_flag_normalize",
  "isaac_pgd_import_handler_log_va",
  "isaac_pgd_import_section_entry_gate",
  "isaac_pgd_import_section_count_gate",
  "isaac_pgd_import_clamp",
  "isaac_pgd_import_byte_flag",
  "isaac_pgd_import_byte_loop_iterations",
  "isaac_pgd_import_dword_loop_iterations",
  /* v25p PGDROWSEC: per-section handler-row semantics */
  "isaac_pgd_import_section_row_index",
  "isaac_pgd_import_section_store_off",
  "isaac_pgd_import_section_elem_width",
  "isaac_pgd_import_section_clamp_max",
  "isaac_pgd_import_section_flag_normalize",
  "isaac_pgd_import_section_log_va",
  "isaac_pgd_import_section_target_va",
  "isaac_pgd_import_section_loop_iterations",
  /* v25o PGDIMP: TryImportRebirthLocalSave residual islands */
  "isaac_pgd_import_suffix_pattern_byte",
  "isaac_pgd_import_suffix_compare_len",
  "isaac_pgd_import_suffix_window_match",
  "isaac_pgd_import_suffix_scan_start",
  "isaac_pgd_import_suffix_scan_step",
  "isaac_pgd_import_suffix_first_cmp_va",
  "isaac_pgd_import_suffix_replace_va",
  "isaac_pgd_import_suffix_replace_pos_len",
  "isaac_pgd_import_rebirth_replacement_len",
  "isaac_pgd_import_rebirth_replace_len",
  "isaac_pgd_import_open_succeeded",
  "isaac_pgd_import_open_gate_va",
  "isaac_pgd_import_open_fail_va",
  "isaac_pgd_import_open_state_call_va",
  "isaac_pgd_import_open_state_gate_va",
  "isaac_pgd_import_stream_pos_call_va",
  "isaac_pgd_import_stream_pos_gate_va",
  "isaac_pgd_import_file_io_gate",
  "isaac_pgd_import_pre_read_count",
  "isaac_pgd_import_post_read_count",
  "isaac_pgd_import_pre_read_io_call_va",
  "isaac_pgd_import_post_read_io_call_va",
  "isaac_pgd_import_post_read_gate",
  "isaac_pgd_import_post_read_gate_va",
  "isaac_pgd_import_post_read_fail_va",
  "isaac_pgd_import_changesmade_store_va",
  "isaac_pgd_import_changesmade_store_value",
  "isaac_pgd_import_changesmade_clear_gate",
  "isaac_pgd_import_save_select",
  "isaac_pgd_import_save_select_cmp_va",
  "isaac_pgd_import_save_select_0f8c_cmp_va",
  "isaac_pgd_import_save_select_obj_va",
  "isaac_pgd_import_save_select_obj_cmp_va",
  "isaac_pgd_import_save_select_global_va",
  "isaac_pgd_import_event_counter_va",
  "isaac_pgd_import_global_save_ptr_va",
  "isaac_pgd_import_global_save_field_off",
  "isaac_pgd_import_global_save_cleared",
  "isaac_pgd_import_global_save_restore",
  "isaac_pgd_import_return1_va_a",
  "isaac_pgd_import_return1_va_b",
  "isaac_pgd_import_result",
  /* v33 PGDRO/PGDUNL/PGDADDIT: the TryUnlock-adjacent islands */
  "isaac_pgd_ro_va",
  "isaac_pgd_ro_ret_va",
  "isaac_pgd_ro_body_bytes",
  "isaac_pgd_ro_inbound",
  "isaac_pgd_ro_return_stack",
  "isaac_pgd_ro_readonly_off",
  "isaac_pgd_ro_log_va",
  "isaac_pgd_ro_string_true_va",
  "isaac_pgd_ro_string_false_va",
  "isaac_pgd_ro_log_call_va",
  "isaac_pgd_ro_cmp_cmove_va",
  "isaac_pgd_ro_store_va",
  "isaac_pgd_ro_call_site_count",
  "isaac_pgd_ro_call_site_va",
  "isaac_pgd_ro_effective_value",
  "isaac_pgd_ro_logs_true",
  "isaac_pgd_ro_string_choice_va",
  "isaac_pgd_unl_va",
  "isaac_pgd_unl_ret_va",
  "isaac_pgd_unl_body_bytes",
  "isaac_pgd_unl_inbound",
  "isaac_pgd_unl_return_stack",
  "isaac_pgd_unl_ach_off",
  "isaac_pgd_unl_index_hi",
  "isaac_pgd_unl_gate_count",
  "isaac_pgd_unl_gate_va",
  "isaac_pgd_unl_true_tail_va",
  "isaac_pgd_unl_false_tail_va",
  "isaac_pgd_unl_call_site_count",
  "isaac_pgd_unl_call_site_va",
  "isaac_pgd_addit_va",
  "isaac_pgd_addit_ret_va",
  "isaac_pgd_addit_body_bytes",
  "isaac_pgd_addit_inbound",
  "isaac_pgd_addit_return_stack",
  "isaac_pgd_addit_count_call_va",
  "isaac_pgd_addit_count_call_site_va",
  "isaac_pgd_addit_try_unlock_va",
  "isaac_pgd_addit_window_hi",
  "isaac_pgd_addit_item_flag_off",
  "isaac_pgd_addit_dirty_off",
  "isaac_pgd_addit_row_a_id",
  "isaac_pgd_addit_row_b_id",
  "isaac_pgd_addit_row_a_call_va",
  "isaac_pgd_addit_row_b_call_va",
  "isaac_pgd_addit_row_a_gate_va",
  "isaac_pgd_addit_row_b_gate_va",
  "isaac_pgd_addit_gate_field_off",
  "isaac_pgd_addit_entry_gate_va",
  "isaac_pgd_addit_window_gate_va",
  "isaac_pgd_addit_id0_skip_va",
  "isaac_pgd_addit_owned_gate_va",
  "isaac_pgd_addit_flag_store_va",
  "isaac_pgd_addit_dirty_store_va",
  "isaac_pgd_addit_call_site_count",
  "isaac_pgd_addit_call_site_va",
  "isaac_pgd_addit_window_valid",
  "isaac_pgd_addit_store_fires",
  "isaac_pgd_addit_count_machine_fires",
  "isaac_pgd_addit_row_a",
  "isaac_pgd_addit_row_b",
  "isaac_pgd_addit_decisions",
  "isaac_pgd_pure_helpers_abi_version",
  /* v35 PGDCON: out-of-cluster consumer census */
  "isaac_pgd_con_mgr_pgd_disp",
  "isaac_pgd_sec3con_threshold_row_count",
  "isaac_pgd_sec3con_threshold_row_slot",
  "isaac_pgd_sec3con_threshold_row_threshold",
  "isaac_pgd_sec3con_threshold_row_unlock_id",
  "isaac_pgd_sec3con_threshold_row_fires",
  "isaac_pgd_sec3con_idx_unlock_rows",
  "isaac_pgd_sec3con_idx_unlock_id",
  "isaac_pgd_sec3con_idx_gated_by_readonly",
  "isaac_pgd_sec8inc_bound_max",
  "isaac_pgd_sec8inc_in_bound",
  "isaac_pgd_sec8inc_inc_self",
  "isaac_pgd_sec8inc_inc_agg",
  "isaac_pgd_sec8inc_warn_fires",
  "isaac_pgd_sec8inc_call_site_count",
  "isaac_pgd_sec8inc_call_site_va",
  "isaac_pgd_sec8gate_fires",
  "isaac_pgd_sec10col_site_count",
  "isaac_pgd_sec10col_store_index",
  "isaac_pgd_sec10col_clears_slot0",
  "isaac_pgd_sec10col_dirty_fires",
  "isaac_pgd_sec10col_save_local_always_runs",
  /* v25n PGDTALLY: stage-4 tally laws of the reader 0x009e4260 */
  "isaac_pgd_import_tally_run_va",
  "isaac_pgd_import_tally_success_va",
  "isaac_pgd_import_tally_store_7d_va",
  "isaac_pgd_import_tally_store_8c_va",
  "isaac_pgd_import_tally_coll_flags_off",
  "isaac_pgd_import_tally_sett_flags_off",
  "isaac_pgd_import_tally_coll_first_idx",
  "isaac_pgd_import_tally_coll_bound",
  "isaac_pgd_import_tally_coll_iters",
  "isaac_pgd_import_tally_sett_first_idx",
  "isaac_pgd_import_tally_sett_bound",
  "isaac_pgd_import_tally_sett_iters",
  "isaac_pgd_import_tally_coll_alias_a_count",
  "isaac_pgd_import_tally_coll_alias_b_count",
  "isaac_pgd_import_tally_sett_alias_count",
  "isaac_pgd_import_tally_coll_alias_a",
  "isaac_pgd_import_tally_coll_alias_b",
  "isaac_pgd_import_tally_sett_alias",
  "isaac_pgd_import_tally_coll_bucket",
  "isaac_pgd_import_tally_sett_bucket",
  "isaac_pgd_import_tally_coll_continue",
  "isaac_pgd_import_tally_sett_store_7d",
  "isaac_pgd_import_tally_sett_store_8c",
  /* v26 PGDIVER: import reader 0x009e4260 version gates + fail tail */
  "isaac_pgd_import_version_off",
  "isaac_pgd_import_version_bytes",
  "isaac_pgd_import_version_read_count",
  "isaac_pgd_import_version_read_width",
  "isaac_pgd_import_version_gate_row",
  "isaac_pgd_import_version_gate_section",
  "isaac_pgd_import_version_finish_off",
  "isaac_pgd_import_version_finish_default",
  "isaac_pgd_import_finish_gate",
  "isaac_pgd_import_tag_fail_ret_va",
  "isaac_pgd_import_tag_fail_log_argc",
  "isaac_pgd_import_tag_fail_returns_zero",
  /* v26 PGDREADER2: the sibling reader 0x0041d670 */
  "isaac_pgd_sibling_tag_compare",
  "isaac_pgd_sibling_tag_first_match",
  "isaac_pgd_sibling_tag_match_section",
  "isaac_pgd_sibling_tag_match_count",
  "isaac_pgd_sibling_tag_header_va",
  "isaac_pgd_sibling_tag_header_section",
  "isaac_pgd_sibling_tag_header_count",
  "isaac_pgd_sibling_tag_compare_bytes",
  "isaac_pgd_sibling_tag_compare_dwords",
  "isaac_pgd_sibling_tag_read_bytes",
  "isaac_pgd_sibling_size_gate",
  "isaac_pgd_sibling_count_check_va",
  "isaac_pgd_sibling_size_check_section",
  "isaac_pgd_sibling_tag_miss_va",
  "isaac_pgd_sibling_tag_miss_log_va",
  "isaac_pgd_sibling_count_mismatch_log_va",
  "isaac_pgd_sibling_entry_gate",
  "isaac_pgd_sibling_record_count_gate",
  "isaac_pgd_sibling_dispatch_index",
  "isaac_pgd_sibling_dispatch_table_va",
  "isaac_pgd_sibling_dispatch_entries",
  "isaac_pgd_sibling_version_off",
  "isaac_pgd_sibling_version_finish_off",
  "isaac_pgd_sibling_version_bytes",
  "isaac_pgd_sibling_version_read_count",
  "isaac_pgd_sibling_version_read_width",
  "isaac_pgd_sibling_success_va",
  "isaac_pgd_sibling_ret_ok_va",
  "isaac_pgd_sibling_fail_tail_va",
  "isaac_pgd_sibling_fail_ret_va",
  "isaac_pgd_sibling_ret_stack_bytes",
  "isaac_pgd_sibling_section_row_index",
  "isaac_pgd_sibling_section_store_off",
  "isaac_pgd_sibling_section_elem_width",
  "isaac_pgd_sibling_section_clamp_max",
  "isaac_pgd_sibling_section_flag_normalize",
  "isaac_pgd_sibling_section_log_va",
  "isaac_pgd_sibling_section_target_va",
  "isaac_pgd_sibling_section_loop_iterations",
  "isaac_pgd_iec_va",
  "isaac_pgd_iec_ret_va",
  "isaac_pgd_iec_body_bytes",
  "isaac_pgd_iec_call_site_count",
  "isaac_pgd_iec_host_try_unlock_va",
  "isaac_pgd_iec_host_cookie_va",
  "isaac_pgd_iec_readonly_off",
  "isaac_pgd_iec_dirty_off",
  "isaac_pgd_iec_counter_base",
  "isaac_pgd_iec_gate_open",
  "isaac_pgd_iec_counter_store_off",
  "isaac_pgd_iec_dirty_fires",
  "isaac_pgd_iec_gate_row_count",
  "isaac_pgd_iec_gate_row",
  "isaac_pgd_iec_gate_fires",
  "isaac_pgd_uld_va",
  "isaac_pgd_uld_ret_va",
  "isaac_pgd_uld_body_bytes",
  "isaac_pgd_uld_call_site_count",
  "isaac_pgd_uld_host_try_unlock_va",
  "isaac_pgd_uld_try_unlock_call_va",
  "isaac_pgd_uld_count",
  "isaac_pgd_uld_segment_index",
  "isaac_pgd_uld_loop_iterations",
  "isaac_pgd_uld_flag_accum",
  "isaac_pgd_uld_unlock_id",
  "isaac_pgd_uld_fire",
  "isaac_pgd_host_cookie_va",
  "isaac_pgd_cookie_global_va",
  "isaac_pgd_cookie_fail_va",
  "isaac_pgd_cookie_check_ok",
  "isaac_pgd_checksum_region_skip_front",
  "isaac_pgd_checksum_region_skip_back",
  "isaac_pgd_disp_va",
  "isaac_pgd_disp_ret_va",
  "isaac_pgd_disp_body_bytes",
  "isaac_pgd_disp_call_site_count",
  "isaac_pgd_disp_host_stamp_helper_va",
  "isaac_pgd_disp_host_save_cloud_va",
  "isaac_pgd_disp_host_save_local_va",
  "isaac_pgd_disp_store_va",
  "isaac_pgd_disp_stamp_call_va",
  "isaac_pgd_disp_cloud_call_va",
  "isaac_pgd_disp_local_call_va",
  "isaac_pgd_disp_probe_call_va",
  "isaac_pgd_disp_probe_slot_va",
  "isaac_pgd_disp_probe_arg_va",
  "isaac_pgd_disp_global_va",
  "isaac_pgd_disp_cloud_off",
  "isaac_pgd_disp_gate0_cmp_va",
  "isaac_pgd_disp_gate0f8c_cmp_va",
  "isaac_pgd_disp_arg_cmp_va",
  "isaac_pgd_disp_cloud_dword_cmp_va",
  "isaac_pgd_disp_cloud_byte_cmp_va",
  "isaac_pgd_disp_return_stack",
  "isaac_pgd_disp_proceed",
  "isaac_pgd_disp_store_clear_fires",
  "isaac_pgd_disp_stamp_call_fires",
  "isaac_pgd_disp_cloud_selected",
  /* v30 PGDCK + PGDWRI */
  "isaac_pgd_checksum_update_va",
  "isaac_pgd_checksum_update_ret_va",
  "isaac_pgd_checksum_update_body_bytes",
  "isaac_pgd_checksum_update_inbound",
  "isaac_pgd_checksum_table_va",
  "isaac_pgd_checksum_table_flag_va",
  "isaac_pgd_checksum_gen_first_shift_va",
  "isaac_pgd_checksum_gen_sar_first_va",
  "isaac_pgd_checksum_gen_store_va",
  "isaac_pgd_checksum_gen_loop_back_va",
  "isaac_pgd_checksum_mode0_fold_va",
  "isaac_pgd_checksum_mode1_init_va",
  "isaac_pgd_checksum_mode1_loop_va",
  "isaac_pgd_checksum_mode1_loop_back_va",
  "isaac_pgd_checksum_mode1_final_va",
  "isaac_pgd_checksum_state_off_lane",
  "isaac_pgd_checksum_state_off_partial",
  "isaac_pgd_checksum_state_off_acc",
  "isaac_pgd_checksum_state_off_mode",
  "isaac_pgd_checksum_region_va",
  "isaac_pgd_checksum_region_ret_va",
  "isaac_pgd_checksum_region_body_bytes",
  "isaac_pgd_checksum_region_inbound",
  "isaac_pgd_checksum_region_seh_handler_va",
  "isaac_pgd_checksum_region_cookie_va",
  "isaac_pgd_checksum_region_update_call_va",
  "isaac_pgd_checksum_region_io_call_va",
  "isaac_pgd_checksum_region_tell_call_va",
  "isaac_pgd_checksum_region_seek_call_va",
  "isaac_pgd_checksum_region_read_call_va",
  "isaac_pgd_checksum_region_len_sub_va",
  "isaac_pgd_checksum_region_seed_store_va",
  "isaac_pgd_checksum_vtbl_tell_off",
  "isaac_pgd_checksum_vtbl_seek_off",
  "isaac_pgd_checksum_vtbl_read_off",
  "isaac_pgd_checksum_region_len",
  "isaac_pgd_wri_va",
  "isaac_pgd_wri_ret_va",
  "isaac_pgd_wri_body_bytes",
  "isaac_pgd_wri_state_mode_store_va",
  "isaac_pgd_wri_state_lane_store_va",
  "isaac_pgd_wri_state_partial_store_va",
  "isaac_pgd_wri_state_seed_store_va",
  "isaac_pgd_wri_pre_off",
  "isaac_pgd_wri_pre_hash_va",
  "isaac_pgd_wri_save_counter_off",
  "isaac_pgd_wri_save_counter_inc_va",
  "isaac_pgd_wri_save_counter_hash_va",
  "isaac_pgd_wri_final_write_va",
  "isaac_pgd_wri_cs_site_count",
  "isaac_pgd_wri_tree_next_sites",
  "isaac_pgd_wri_vtbl_write_sites",
  "isaac_pgd_wri_memset_sites",
  "isaac_pgd_wri_stores",
  "isaac_pgd_wri_cs_site_va",
  "isaac_pgd_wri_cs_site_role",
  "isaac_pgd_wri_cs_site_len",
  "isaac_pgd_wri_loop_iterations",
  "isaac_pgd_wri_element_hash_len",
  "isaac_pgd_wri_save_counter_next",
  /* v34 — PGDCPY */
  "isaac_pgd_cpy_va",
  "isaac_pgd_cpy_ret_va",
  "isaac_pgd_cpy_body_bytes",
  "isaac_pgd_cpy_inbound",
  "isaac_pgd_cpy_return_stack",
  "isaac_pgd_cpy_returns_this",
  "isaac_pgd_cpy_dirty_off",
  "isaac_pgd_cpy_handle_off",
  "isaac_pgd_cpy_handle_clear_va",
  "isaac_pgd_cpy_string_a_off",
  "isaac_pgd_cpy_string_b_off",
  "isaac_pgd_cpy_string_size_off",
  "isaac_pgd_cpy_string_cap_off",
  "isaac_pgd_cpy_self_guard_cmp_va",
  "isaac_pgd_cpy_self_guard_je_va",
  "isaac_pgd_cpy_assign_call_va",
  "isaac_pgd_cpy_assign_callee_va",
  "isaac_pgd_cpy_string_assign_fires",
  "isaac_pgd_cpy_string_data_select",
  "isaac_pgd_cpy_deferred_count_site_va",
  "isaac_pgd_cpy_deferred_count",
  "isaac_pgd_cpy_vector_callee_va",
  "isaac_pgd_cpy_vector_sites",
  "isaac_pgd_cpy_vector_dst_off",
  "isaac_pgd_cpy_vector_call_site_va",
  "isaac_pgd_cpy_tail_row_off",
  "isaac_pgd_cpy_tail_row_bytes",
  "isaac_pgd_cpy_stale_gap_count",
  "isaac_pgd_cpy_stale_gap_off",
  "isaac_pgd_cpy_stale_gap_bytes",
  "isaac_pgd_cpy_row_count",
  "isaac_pgd_cpy_row_site_va",
  "isaac_pgd_cpy_row_kind",
  "isaac_pgd_cpy_row_off",
  "isaac_pgd_cpy_row_bytes",
  "isaac_pgd_cpy_bulk_covered_bytes",
  "isaac_pgd_cpy_row_covers",
  "isaac_pgd_cpy_call_site_va",
  "isaac_pgd_cpy_plan_totals",
];

function buildWasm() {
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting(
    [
      process.env.CLANGXX,
      join(emsdk, "upstream", "bin", "clang++.exe"),
      join(emsdk, "upstream", "bin", "clang++"),
    ],
    "Host clang++",
  );
  const emxx = firstExisting(
    [
      process.env.EMXX,
      join(emsdk, "upstream", "emscripten", "em++.exe"),
      join(emsdk, "upstream", "emscripten", "em++"),
    ],
    "Emscripten em++",
  );
  const syntax = spawnSync(
    clang,
    [
      source,
      "-std=c++20",
      "-I",
      join(root, "native", "decomp"),
      "-fsyntax-only",
      "-Wall",
      "-Wextra",
      "-Werror",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  /* The export list has grown past the Windows 32K command-line
     limit (~743 exports at ABI v24); pass the export flags through a
     clang response file instead of argv (ENAMETOOLONG otherwise). */
  const rsp = join(outDir, "export-flags.rsp");
  writeFileSync(rsp, EXPORTS.map((name) => `-Wl,--export=${name}`).join("\n"));
  const built = spawnSync(
    emxx,
    [
      source,
      "-std=c++20",
      "-O2",
      "-I",
      join(root, "native", "decomp"),
      "--no-entry",
      "-sSTANDALONE_WASM=1",
      "-sERROR_ON_UNDEFINED_SYMBOLS=1",
      "@" + rsp,
      "-o",
      wasmPath,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(
    WebAssembly.Module.imports(module).length,
    0,
    "PGD pure helpers must be zero-import",
  );
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const exp = (name) => {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  const out = { memory: wasm.memory };
  for (const name of EXPORTS) {
    out[name] = exp(name);
  }
  return out;
}

/* IsaacPgdSectionDesc: 7 x int32 -> 28 bytes */
const SECTION_DESC_SIZE = 28;
const SECTION_DESC_OFF = {
  id: 0,
  capWord: 4,
  countWord: 8,
  elemWidth: 12,
  fieldOffset: 16,
  payloadBytes: 20,
  fixed: 24,
};

/* IsaacPgdChecksumState: u32 buffer, u32 partial_len, u32 acc, i32 mode */
const CHECKSUM_STATE_SIZE = 16;
const CHECKSUM_STATE_OFF = { buffer: 0, partialLen: 4, acc: 8, mode: 12 };

/* IsaacPgdSavePlan: 13 x 4-byte words -> 52 bytes */
const SAVE_PLAN_SIZE = 52;
const SAVE_PLAN_OFF = {
  magicVariant: 0,
  versionTag: 4,
  maxSectionId: 8,
  magicBytes: 12,
  fixedPrefixBytes: 16,
  checksumSkipFront: 20,
  checksumSkipBack: 24,
  checksumMode: 28,
  checksumSeed: 32,
  saveCounterNext: 36,
  bestiaryTotal: 40,
  bestiaryCapWord: 44,
  hostWriteNeeded: 48,
};

/* IsaacPgdReaderSectionDesc: 10 x 4-byte words -> 40 bytes */
const READER_DESC_SIZE = 40;
const READER_DESC_OFF = {
  id: 0,
  builtinCount: 4,
  elemWidth: 8,
  fieldOffset: 12,
  storeBound: 16,
  clampsFileCount: 20,
  handlerVa: 24,
  logBeginVa: 28,
  logEndVa: 32,
  logMismatchVa: 36,
};

/* Scratch regions inside the module's linear memory.
   CORRECTED AT v3. These sat at 0x8000/0xa000/0xc000, which is inside the
   64 KiB shadow stack emscripten places immediately after static data â€” a
   silent corruption of helper locals that only shows up in local-heavy
   helpers. Scratch must be at or above 0x100000 (1 MiB): below that, either
   the module's own constant/jump-table data or the shadow stack is in the
   way. Asserted below. */
const SCRATCH_MIN = 0x100000;
const SCRATCH_A = 0x100000;
const SCRATCH_B = 0x110000;
const SCRATCH_C = 0x120000;

function readI32(view, at) {
  return view.getInt32(at, true);
}
function readU32(view, at) {
  return view.getUint32(at, true);
}

function readSectionDesc(view, base) {
  return {
    id: readI32(view, base + SECTION_DESC_OFF.id),
    capWord: readI32(view, base + SECTION_DESC_OFF.capWord),
    countWord: readI32(view, base + SECTION_DESC_OFF.countWord),
    elemWidth: readI32(view, base + SECTION_DESC_OFF.elemWidth),
    fieldOffset: readI32(view, base + SECTION_DESC_OFF.fieldOffset),
    payloadBytes: readI32(view, base + SECTION_DESC_OFF.payloadBytes),
    fixed: readI32(view, base + SECTION_DESC_OFF.fixed) !== 0,
  };
}

function readChecksumState(view, base) {
  return {
    buffer: readU32(view, base + CHECKSUM_STATE_OFF.buffer),
    partialLen: readU32(view, base + CHECKSUM_STATE_OFF.partialLen),
    acc: readU32(view, base + CHECKSUM_STATE_OFF.acc),
    mode: readI32(view, base + CHECKSUM_STATE_OFF.mode),
  };
}

function readSavePlan(view, base) {
  return {
    magicVariant: readI32(view, base + SAVE_PLAN_OFF.magicVariant),
    versionTag: readI32(view, base + SAVE_PLAN_OFF.versionTag),
    maxSectionId: readI32(view, base + SAVE_PLAN_OFF.maxSectionId),
    magicBytes: readI32(view, base + SAVE_PLAN_OFF.magicBytes),
    fixedPrefixBytes: readI32(view, base + SAVE_PLAN_OFF.fixedPrefixBytes),
    checksumSkipFront: readI32(view, base + SAVE_PLAN_OFF.checksumSkipFront),
    checksumSkipBack: readI32(view, base + SAVE_PLAN_OFF.checksumSkipBack),
    checksumMode: readI32(view, base + SAVE_PLAN_OFF.checksumMode),
    checksumSeed: readU32(view, base + SAVE_PLAN_OFF.checksumSeed),
    saveCounterNext: readU32(view, base + SAVE_PLAN_OFF.saveCounterNext),
    bestiaryTotal: readU32(view, base + SAVE_PLAN_OFF.bestiaryTotal),
    bestiaryCapWord: readU32(view, base + SAVE_PLAN_OFF.bestiaryCapWord),
    hostWriteNeeded: readI32(view, base + SAVE_PLAN_OFF.hostWriteNeeded) !== 0,
  };
}

/* Bounded draw for the randomized corpora. CORRECTED AT v3: every call site
   below used `rng() % n`, which on a generator whose low bits have a short
   period silently collapses a corpus onto a handful of values. Draw from the
   HIGH bits instead, and assert coverage where the range is small. */
function pick(rng, n) {
  return Math.floor((rng() / 0x100000000) * n);
}

/** Deterministic 32-bit xorshift for the randomized differential corpus. */
function makeRng(seed) {
  let x = seed >>> 0 || 0x9e3779b9;
  return () => {
    x ^= x << 13;
    x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return x;
  };
}

let wasm;
let bytes;
let view;

test("build PGD pure helpers wasm (zero imports, ABI v35)", () => {
  wasm = loadExports();
  bytes = new Uint8Array(wasm.memory.buffer);
  view = new DataView(wasm.memory.buffer);
  if (wasm.memory.buffer.byteLength < SCRATCH_C + 0x10000) {
    wasm.memory.grow(
      Math.ceil((SCRATCH_C + 0x10000 - wasm.memory.buffer.byteLength) / 65536),
    );
    bytes = new Uint8Array(wasm.memory.buffer);
    view = new DataView(wasm.memory.buffer);
  }
  assert.ok(
    wasm.memory.buffer.byteLength >= SCRATCH_C + 0x10000,
    "linear memory too small for the scratch regions",
  );
  // scratch must clear BOTH the module's low constant/jump-table data and the
  // 64 KiB shadow stack that follows static data
  for (const scratch of [SCRATCH_A, SCRATCH_B, SCRATCH_C]) {
    assert.ok(scratch >= SCRATCH_MIN, `scratch ${scratch} is below 0x100000`);
  }
  assert.equal(wasm.isaac_pgd_pure_helpers_abi_version(), PGD_PURE_ABI_VERSION);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
});

test("wasm module declares no imports", () => {
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.deepEqual(WebAssembly.Module.imports(module), []);
});

test("header records the PE evidence for the save format", () => {
  const h = readFileSync(header, "utf8");
  // roots and identities
  assert.match(h, /0x00928ee0/);
  assert.match(h, /PersistentGameData::SaveToSteamCloud/);
  assert.match(h, /0x009282e0/);
  assert.match(h, /0x00926f10/);
  assert.match(h, /0x00683410/);
  assert.match(h, /0x00683580/);
  // the collision must be recorded, not promoted
  assert.match(h, /0x006d0ca0/);
  assert.match(h, /SIGNATURE COLLISION/);
  assert.match(h, /0x009294f0/);
  // exit linkage
  assert.match(h, /0x006fa200/);
  assert.match(h, /0x265c0/);
  assert.match(h, /0x2658a/);
  // format
  assert.match(h, /ISAACNGSAVE09R/);
  assert.match(h, /cap_word/);
  assert.match(h, /setne/);
  assert.match(h, /setg/);
  // checksum proof
  assert.match(h, /0xEDB88320/);
  assert.match(h, /0xFEDCBA76/i);
  assert.match(h, /NOT the standard CRC-32 table/i);
  assert.match(h, /0x09073096/);
  assert.match(h, /0x006ef2c3/);
  assert.match(h, /0x00c7ec70/);
  assert.match(h, /0x00c7e860/);
  // unidentified fields must stay unidentified
  assert.match(h, /Unidentified but kept address-stable/);
  assert.match(h, /0xf84/);
  assert.match(
    h,
    new RegExp(`ISAAC_PGD_PURE_HELPERS_ABI_VERSION = ${PGD_PURE_ABI_VERSION}\\b`),
  );

  const s = readFileSync(source, "utf8");
  assert.match(s, /sar1|ARITHMETIC/);
  assert.match(s, /ror_add/);
  assert.match(s, /crc_step/);
  assert.match(s, /kSections/);
  assert.match(s, /cmovle/);
});

test("JS oracle: object layout closes with no unexplained gap", () => {
  assert.equal(PGD_OFF_CHANGES_MADE, 0);
  assert.equal(PGD_OFF_READONLY, 1);
  assert.equal(PGD_OFF_FLAG_02, 2);
  assert.equal(PGD_OFF_FILE, 4);
  // the two strings tile exactly up to the achievement array
  assert.equal(PGD_OFF_FILEPATH + PGD_STRING_SIZE, PGD_OFF_STEAMCLOUDPATH);
  assert.equal(PGD_OFF_STEAMCLOUDPATH + PGD_STRING_SIZE, PGD_OFF_ACHIEVEMENTS);
  // Every array the writer touches tiles the object end to end. The only
  // slack anywhere is natural 4-byte alignment in front of an int32 array,
  // which is what makes this a layout proof rather than a plausible reading.
  const align4 = (v) => (v + 3) & ~3;
  const chain = [
    [PGD_OFF_ACHIEVEMENTS, PGD_COUNT_ACHIEVEMENTS, 1, PGD_OFF_EVENT_COUNTERS, 4],
    [PGD_OFF_EVENT_COUNTERS, PGD_COUNT_EVENT_COUNTERS, 4, PGD_OFF_ITEM_COLLECTION, 1],
    [PGD_OFF_ITEM_COLLECTION, PGD_COUNT_ITEM_COLLECTION, 1, 0xdc8, 4],
    [0xdc8, 14, 4, 0xe00, 1],
    [0xe00, 7, 1, PGD_OFF_BOSSES, 1],
    [PGD_OFF_BOSSES, PGD_COUNT_BOSSES, 1, PGD_OFF_CHALLENGES, 1],
    [PGD_OFF_CHALLENGES, PGD_COUNT_CHALLENGES, 1, 0xea0, 4],
    [0xea0, 27, 4, 0xf0c, 4],
    [0xf0c, 2, 4, 0xf14, 1],
    [0xf14, 80, 1, PGD_OFF_BESTIARY, 4],
  ];
  for (const [start, count, width, next, nextAlign] of chain) {
    const end = start + count * width;
    const want = nextAlign === 4 ? align4(end) : end;
    assert.equal(want, next, `array at ${start.toString(16)} runs into ${next.toString(16)}`);
  }
  // bestiary is four (root, count) pairs, then the two tail dwords and the flag
  assert.equal(PGD_OFF_BESTIARY + PGD_BESTIARY_SUBMAPS * 8, PGD_OFF_PRE_SECTION_WORD);
  assert.equal(PGD_OFF_PRE_SECTION_WORD + 4, PGD_OFF_SAVE_COUNTER);
  assert.equal(PGD_OFF_SAVE_COUNTER + 4, PGD_OFF_FILE_LOADED_OK);
  assert.equal(PGD_OFF_FILE_LOADED_OK, 0xf8c);
  assert.equal(PGD_BESTIARY_OFF_ROOT.length, PGD_BESTIARY_SUBMAPS);
  assert.equal(PGD_BESTIARY_OFF_COUNT.length, PGD_BESTIARY_SUBMAPS);
  for (let i = 0; i < PGD_BESTIARY_SUBMAPS; ++i) {
    assert.equal(PGD_BESTIARY_OFF_COUNT[i], PGD_BESTIARY_OFF_ROOT[i] + 4);
  }
  // the recorded collision address is not any of the save entry points
  assert.notEqual(
    PGD_SIGNATURE_COLLISION_SAVE_LOCALLY_VA,
    PGD_HOST_VA_SAVE_TO_STEAM_CLOUD,
  );
  assert.notEqual(PGD_SIGNATURE_COLLISION_SAVE_LOCALLY_VA, PGD_HOST_VA_WRITE_STREAM);
  assert.notEqual(PGD_SIGNATURE_COLLISION_SAVE_LOCALLY_VA, PGD_HOST_VA_READ_STREAM);
});

test("JS oracle: magic / version table", () => {
  assert.equal(PGD_MAGIC_STRINGS.length, PGD_MAGIC_VARIANTS);
  for (const s of PGD_MAGIC_STRINGS) assert.equal(s.length, PGD_MAGIC_BYTES);
  assert.equal(PGD_MAGIC_STRINGS[3], "ISAACNGSAVE09R  ");
  const v09 = [...PGD_MAGIC_STRINGS[3]].map((c) => c.charCodeAt(0));
  assert.equal(pgdMagicVariant(v09), 3);
  assert.equal(pgdVersionForVariant(3), PGD_VERSION_09);
  assert.equal(pgdMaxSectionIdForVariant(3), PGD_MAX_SECTION_ID_V09);
  assert.equal(pgdVersionForVariant(0), 6);
  assert.equal(pgdMaxSectionIdForVariant(0), 9);
  assert.equal(pgdMaxSectionIdForVariant(1), 0xa);
  assert.equal(pgdMaxSectionIdForVariant(2), 0xa);
  assert.equal(pgdVersionForVariant(-1), 0);
  assert.equal(pgdVersionForVariant(4), 0);
  // a single flipped byte drops out of the table
  const broken = v09.slice();
  broken[13] = "X".charCodeAt(0);
  assert.equal(pgdMagicVariant(broken), -1);
  assert.equal(pgdMagicVariant(null), -1);
  assert.equal(pgdMagicVariant(v09.slice(0, 15)), -1);
  // only tag 9 loads directly
  assert.equal(pgdVersionLoadable(6), false);
  assert.equal(pgdVersionLoadable(8), false);
  assert.equal(pgdVersionLoadable(9), true);
  assert.equal(pgdVersionLoadable(10), true);
  assert.equal(PGD_MIN_LOADABLE_VERSION, 9);
  assert.equal(pgdMagicByte(3, 0), "I".charCodeAt(0));
  assert.equal(pgdMagicByte(3, 15), 0x20);
  assert.equal(pgdMagicByte(3, 16), 0);
  assert.equal(pgdMagicByte(9, 0), 0);
});

test("JS oracle: section table and stream offsets", () => {
  const expected = [
    [1, 0x282, 0x282, 1, PGD_OFF_ACHIEVEMENTS],
    [2, 0x82c, 0x20b, 4, PGD_OFF_EVENT_COUNTERS],
    [3, 0x38, 0xe, 4, 0xdc8],
    [4, 0xb74, 0x2dd, 1, PGD_OFF_ITEM_COLLECTION],
    [5, 0x1c, 0x7, 1, 0xe00],
    [6, 0x1a0, 0x68, 1, PGD_OFF_BOSSES],
    [7, 0xb8, 0x2e, 1, PGD_OFF_CHALLENGES],
    [8, 0x6c, 0x1b, 4, 0xea0],
    [9, 0x8, 0x2, 4, 0xf0c],
    [10, 0x140, 0x50, 1, 0xf14],
  ];
  let at = PGD_MAGIC_BYTES + 4;
  for (const [id, cap, count, width, offset] of expected) {
    const d = pgdSectionDesc(id);
    assert.ok(d, `section ${id}`);
    assert.equal(d.capWord, cap, `section ${id} cap`);
    assert.equal(d.countWord, count, `section ${id} count`);
    assert.equal(d.elemWidth, width, `section ${id} width`);
    assert.equal(d.fieldOffset, offset, `section ${id} offset`);
    assert.equal(d.payloadBytes, count * width);
    assert.equal(d.fixed, true);
    assert.equal(pgdSectionStreamOffset(id), at, `section ${id} at`);
    assert.equal(pgdSectionStreamBytes(id), PGD_SECTION_HEADER_BYTES + count * width);
    at += PGD_SECTION_HEADER_BYTES + count * width;
  }
  assert.equal(pgdFixedPrefixBytes(), at);
  // the cap is a byte cap, and only section 1 has cap == payload
  assert.equal(pgdSectionDesc(1).capWord, pgdSectionDesc(1).payloadBytes);
  for (const id of [4, 5, 6, 7, 10]) {
    const d = pgdSectionDesc(id);
    assert.equal(d.capWord, d.countWord * 4, `section ${id} cap is count*4`);
    assert.notEqual(d.capWord, d.payloadBytes, `section ${id} cap != payload`);
  }
  for (const id of [2, 3, 8, 9]) {
    const d = pgdSectionDesc(id);
    assert.equal(d.capWord, d.payloadBytes, `section ${id} cap == payload`);
  }
  // the bestiary section is variable and reports so
  const b = pgdSectionDesc(PGD_BESTIARY_SECTION_ID);
  assert.equal(b.fixed, false);
  assert.equal(b.elemWidth, 0);
  assert.equal(b.countWord, PGD_BESTIARY_SUBMAPS);
  assert.equal(pgdSectionStreamBytes(PGD_BESTIARY_SECTION_ID), -1);
  assert.equal(pgdSectionStreamOffset(PGD_BESTIARY_SECTION_ID), -1);
  assert.equal(pgdSectionDesc(0), null);
  assert.equal(pgdSectionDesc(12), null);
  assert.equal(PGD_SECTION_MAX_ID, 11);
});

test("JS oracle: reader control flow", () => {
  assert.equal(pgdReaderLoopContinue(0, 0xb), true);
  assert.equal(pgdReaderLoopContinue(10, 0xb), true);
  assert.equal(pgdReaderLoopContinue(11, 0xb), false); // id 11 ends the loop
  assert.equal(pgdReaderLoopContinue(-1, 0xb), false);
  assert.equal(pgdReaderLoopContinue(10, 0xa), false); // older tag stops sooner

  assert.equal(pgdReaderSectionSkipped(0), true);
  assert.equal(pgdReaderSectionSkipped(1), false);
  // unsigned compare: a cap with the sign bit set is still live
  assert.equal(pgdReaderSectionSkipped(0x80000000), false);
  assert.equal(pgdReaderSectionSkipped(-1), false);

  assert.equal(pgdReaderSectionDispatched(0), false);
  assert.equal(pgdReaderSectionDispatched(1), true);
  assert.equal(pgdReaderSectionDispatched(11), true);
  assert.equal(pgdReaderSectionDispatched(12), false);
  assert.equal(pgdReaderSectionDispatched(-1), false);

  assert.equal(pgdReaderPayloadContinue(0, 4), true);
  assert.equal(pgdReaderPayloadContinue(4, 4), false);
  assert.equal(pgdReaderPayloadContinue(0x80000000, 4), false);
  assert.equal(pgdReaderPayloadContinue(0, 0x80000000), true);

  assert.equal(pgdReaderStoreInRange(0x281, PGD_COUNT_ACHIEVEMENTS), true);
  assert.equal(pgdReaderStoreInRange(0x282, PGD_COUNT_ACHIEVEMENTS), false);
  assert.equal(pgdReaderStoreInRange(-1, PGD_COUNT_ACHIEVEMENTS), false);

  assert.equal(pgdReaderCountMismatch(0x282, 0x282), false);
  assert.equal(pgdReaderCountMismatch(0x281, 0x282), true);

  // the asymmetry is the point: 0x80..0xff survive a write but not a read
  assert.equal(pgdWriterBoolNormalize(0x80), true);
  assert.equal(pgdReaderBoolNormalize(0x80), false);
  assert.equal(pgdWriterBoolNormalize(0xff), true);
  assert.equal(pgdReaderBoolNormalize(0xff), false);
  assert.equal(pgdWriterBoolNormalize(1), true);
  assert.equal(pgdReaderBoolNormalize(1), true);
  assert.equal(pgdWriterBoolNormalize(0), false);
  assert.equal(pgdReaderBoolNormalize(0), false);
  assert.equal(pgdReaderBoolNormalize(0x7f), true);
});

test("JS oracle: checksum table is the arithmetic-shift variant", () => {
  assert.equal(pgdCrcTableEntry(0), 0);
  // the textbook table would be 0x77073096 / 0xee0e612c / 0x990951ba
  assert.equal(pgdCrcTableEntry(1), 0x09073096);
  assert.equal(pgdCrcTableEntry(2), 0x120e612c);
  assert.equal(pgdCrcTableEntry(3), 0x1b0951ba);
  assert.notEqual(pgdCrcTableEntry(1), 0x77073096);
  assert.equal(pgdCrcTableUsesArithmeticShift(), true);
  assert.equal(pgdSaveUsesStateCrcRoutine(), false);
  // only the polynomial is shared with the state CRC-32
  assert.equal(PGD_CHECKSUM_POLY, 0xedb88320);
  assert.notEqual(PGD_CRC_TABLE_VA, PGD_STATE_CRC_TABLE_VA);
  assert.equal(PGD_STATE_CRC_VA, 0x006ef2c3);
  // the index is masked to one byte
  assert.equal(pgdCrcTableEntry(0x101), pgdCrcTableEntry(1));
});

test("JS oracle: checksum modes and finalize", () => {
  // mode 1 with an empty update leaves the seed untouched
  assert.equal(pgdChecksumBuffer([], 0, PGD_CHECKSUM_MODE_CRC), PGD_CHECKSUM_SEED >>> 0);
  // mode 0 with an empty update likewise
  assert.equal(
    pgdChecksumBuffer([], 0, PGD_CHECKSUM_MODE_ROR_ADD),
    PGD_CHECKSUM_SEED >>> 0,
  );
  // any other selector is inert
  assert.equal(pgdChecksumBuffer([1, 2, 3, 4], 4, 7), PGD_CHECKSUM_SEED >>> 0);
  assert.equal(pgdChecksumBuffer([1, 2, 3, 4], 4, -1), PGD_CHECKSUM_SEED >>> 0);

  // mode 0 folds exactly one word for four bytes and nothing is left over
  const four = [0x11, 0x22, 0x33, 0x44];
  assert.equal(
    pgdChecksumBuffer(four, 4, PGD_CHECKSUM_MODE_ROR_ADD),
    pgdRorAddStep(PGD_CHECKSUM_SEED, 0x44332211),
  );
  // a partial tail is zero-padded by finalize
  assert.equal(
    pgdChecksumBuffer([0x11, 0x22], 2, PGD_CHECKSUM_MODE_ROR_ADD),
    pgdRorAddStep(PGD_CHECKSUM_SEED, 0x00002211),
  );
  // rotate, not shift: the low bit becomes the top bit
  assert.equal(pgdRorAddStep(1, 0), 0x80000000);
  assert.equal(pgdRorAddStep(2, 0), 1);
  assert.equal(pgdRorAddStep(0xffffffff, 1), 0);

  // mode 1 over one byte follows the fold on the complemented register
  const one = pgdChecksumBuffer([0xab], 1, PGD_CHECKSUM_MODE_CRC);
  assert.equal(one, (~pgdCrcStep(~PGD_CHECKSUM_SEED >>> 0, 0xab)) >>> 0);

  // streaming in pieces must equal one shot, in both modes
  const data = Array.from({ length: 37 }, (_, i) => (i * 7 + 3) & 0xff);
  for (const mode of [PGD_CHECKSUM_MODE_ROR_ADD, PGD_CHECKSUM_MODE_CRC]) {
    const whole = pgdChecksumBuffer(data, data.length, mode);
    const st = pgdChecksumInit(mode);
    pgdChecksumUpdate(st, data.slice(0, 5), 5);
    pgdChecksumUpdate(st, data.slice(5, 6), 1);
    pgdChecksumUpdate(st, data.slice(6, 37), 31);
    assert.equal(pgdChecksumFinalize(st), whole, `stream split mode ${mode}`);
  }
});

test("JS oracle: file region checksum and validation", () => {
  // build a plausible container: 16 magic bytes, body, trailing checksum
  const body = Array.from({ length: 64 }, (_, i) => (i * 31 + 5) & 0xff);
  const file = new Uint8Array(PGD_MAGIC_BYTES + body.length + 4);
  for (let i = 0; i < PGD_MAGIC_BYTES; ++i) {
    file[i] = PGD_MAGIC_STRINGS[3].charCodeAt(i);
  }
  file.set(body, PGD_MAGIC_BYTES);
  const sum = pgdChecksumFileRegion(
    file,
    file.length,
    PGD_CHECKSUM_SKIP_FRONT,
    PGD_CHECKSUM_SKIP_BACK,
  );
  const base = file.length - PGD_CHECKSUM_TAIL_BYTES;
  file[base] = sum & 0xff;
  file[base + 1] = (sum >>> 8) & 0xff;
  file[base + 2] = (sum >>> 16) & 0xff;
  file[base + 3] = (sum >>> 24) & 0xff;
  assert.equal(pgdChecksumFileValid(file, file.length), true);
  // touching the magic does not change the checksum (it is outside the range)
  file[0] ^= 0xff;
  assert.equal(pgdChecksumFileValid(file, file.length), true);
  file[0] ^= 0xff;
  // touching the body does
  file[PGD_MAGIC_BYTES] ^= 0x01;
  assert.equal(pgdChecksumFileValid(file, file.length), false);
  file[PGD_MAGIC_BYTES] ^= 0x01;
  assert.equal(pgdChecksumFileValid(file, file.length), true);
  // degenerate inputs
  assert.equal(pgdChecksumFileRegion(file, 0, 0, 0), 0);
  assert.equal(pgdChecksumFileRegion(file, 20, 16, 4), 0);
  assert.equal(pgdChecksumFileValid(file, 4), false);
});

test("JS oracle: Unlocked full control flow", () => {
  const base = { modeWord: 0, gameNull: 0, game26630: 0, game26589: 0 };
  assert.equal(pgdUnlocked({ ...base, achievementId: PGD_UNLOCKED_SENTINEL_NEVER }), false);
  // any other negative id short-circuits to true, before the range test
  assert.equal(pgdUnlocked({ ...base, achievementId: -1 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: -3 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 0 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 0x282 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, achievementByte: 1 }), true);
  // stored zero + wrong mode word -> false
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, modeWord: 1 }), false);
  // right mode word but null game -> false
  assert.equal(
    pgdUnlocked({ ...base, achievementId: 5, modeWord: 2, gameNull: 1 }),
    false,
  );
  // unsigned "above zero" on the dword
  assert.equal(
    pgdUnlocked({ ...base, achievementId: 5, modeWord: 2, game26630: 1 }),
    true,
  );
  assert.equal(
    pgdUnlocked({ ...base, achievementId: 5, modeWord: 2, game26630: 0x80000000 }),
    true,
  );
  assert.equal(
    pgdUnlocked({ ...base, achievementId: 5, modeWord: 2, game26589: 1 }),
    true,
  );
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, modeWord: 2 }), false);
  assert.equal(pgdAchievementIndexValid(0x281), true);
  assert.equal(pgdAchievementIndexValid(0x282), false);
  assert.equal(pgdAchievementIndexValid(-1), false);
});

test("JS oracle: mutator bounds keep their signedness apart", () => {
  // TryUnlock has no upper bound at all
  assert.equal(pgdTryUnlockStoreNeeded(0, 1, 0), true);
  assert.equal(pgdTryUnlockStoreNeeded(1, 1, 0), false);
  assert.equal(pgdTryUnlockStoreNeeded(0, 0, 0), false);
  assert.equal(pgdTryUnlockStoreNeeded(0, 1, 1), false);
  assert.equal(pgdTryUnlockStoreNeeded(0, 0x9999, 0), true);
  assert.equal(pgdTryUnlockSteamLeg(1, 0), true);
  assert.equal(pgdTryUnlockSteamLeg(0, 0), false);
  assert.equal(pgdTryUnlockSteamLeg(1, 1), false);

  // collection: unsigned <= 0x2dc, id 0 skipped
  assert.equal(pgdCollectionIndexValid(0x2dc), true);
  assert.equal(pgdCollectionIndexValid(0x2dd), false);
  assert.equal(pgdCollectionIndexValid(-1), false);
  assert.equal(pgdCollectionStoreNeeded(0, 5, 0), true);
  assert.equal(pgdCollectionStoreNeeded(0, 0, 0), false);
  assert.equal(pgdCollectionStoreNeeded(0, 5, 1), false);
  assert.equal(pgdCollectionStoreNeeded(1, 5, 0), false);

  // challenge: unsigned <= 0x2d
  assert.equal(pgdChallengeIndexValid(0x2d), true);
  assert.equal(pgdChallengeIndexValid(0x2e), false);
  assert.equal(pgdChallengeIndexValid(-1), false);
  assert.equal(pgdChallengeStoreNeeded(0, 0), true); // id 0 is NOT skipped here
  assert.equal(pgdChallengeStoreNeeded(1, 0), false);

  // boss: signed < 0x68 and no floor, so negatives pass
  assert.equal(pgdBossIndexValid(0x67), true);
  assert.equal(pgdBossIndexValid(0x68), false);
  assert.equal(pgdBossIndexValid(-1), true);
  assert.equal(pgdBossStoreNeeded(0, -1), true);
  assert.equal(pgdBossStoreNeeded(1, 0), false);
  // and that is exactly where it differs from the unsigned pair
  assert.notEqual(pgdBossIndexValid(-1), pgdCollectionIndexValid(-1));
  assert.notEqual(pgdBossIndexValid(-1), pgdChallengeIndexValid(-1));
});

test("JS oracle: event counter saturating add", () => {
  assert.equal(pgdEventCounterNext(0, 1), 1);
  assert.equal(pgdEventCounterNext(5, 3), 8);
  assert.equal(pgdEventCounterNext(5, -3), 2);
  assert.equal(pgdEventCounterNext(5, -5), 0);
  assert.equal(pgdEventCounterNext(5, -6), 0); // clamps, does not go negative
  assert.equal(pgdEventCounterNext(0, 0), 0);
  assert.equal(pgdEventCounterNext(-1, 0), 0); // -0 <= -1 is false -> 0
  assert.equal(pgdEventCounterNext(-1, 1), 0);
  assert.equal(pgdEventCounterNext(-1, -1), 0);
  // 32-bit wrap is preserved on the sum
  assert.equal(pgdEventCounterNext(0x7fffffff, 1), -0x80000000);
  assert.equal(pgdEventCounterStoreNeeded(0), true);
  assert.equal(pgdEventCounterStoreNeeded(1), false);
});

test("JS oracle: flag array helpers", () => {
  const flags = new Uint8Array(PGD_COUNT_BOSSES);
  assert.equal(pgdFlagGet(flags, flags.length, 0), false);
  assert.equal(pgdFlagSet(flags, flags.length, 3, 1), true);
  assert.equal(pgdFlagGet(flags, flags.length, 3), true);
  assert.equal(pgdFlagSet(flags, flags.length, PGD_COUNT_BOSSES, 1), false);
  assert.equal(pgdFlagSet(flags, flags.length, -1, 1), false);
  assert.equal(pgdFlagGet(flags, flags.length, -1), false);
  assert.equal(pgdFlagPopcount(flags, flags.length), 1);
  assert.equal(pgdFlagPopcount(null, 4), 0);
  assert.equal(pgdFlagPopcount(flags, 0), 0);
  assert.equal(pgdStringDataIsHeap(PGD_STRING_SSO_CAP), true);
  assert.equal(pgdStringDataIsHeap(PGD_STRING_SSO_CAP - 1), false);
});

test("JS oracle: bestiary header arithmetic", () => {
  assert.equal(pgdBestiaryTotal(1, 2, 3, 4), 10);
  assert.equal(pgdBestiaryCapWord(10), 40);
  // 32-bit wrap on both the sum and the shift
  assert.equal(pgdBestiaryTotal(0xffffffff, 1, 0, 0), 0);
  assert.equal(pgdBestiaryCapWord(0x40000000), 0);
  assert.deepEqual(
    [0, 1, 2, 3].map(pgdBestiarySubmapTag),
    [4, 2, 3, 1],
  );
  assert.deepEqual(
    [0, 1, 2, 3].map(pgdBestiarySubmapPair),
    [3, 1, 2, 0],
  );
  assert.equal(pgdBestiarySubmapTag(4), 0);
  assert.equal(pgdBestiarySubmapPair(4), -1);
  assert.equal(pgdBestiarySubmapPair(-1), -1);
});

test("JS oracle: save plan", () => {
  const plan = pgdSavePlan({ saveCounterIn: 41, bestiaryCounts: [1, 2, 3, 4] });
  assert.equal(plan.versionTag, PGD_VERSION_09);
  assert.equal(plan.maxSectionId, PGD_MAX_SECTION_ID_V09);
  assert.equal(plan.saveCounterNext, 42);
  assert.equal(plan.bestiaryTotal, 10);
  assert.equal(plan.bestiaryCapWord, 40);
  assert.equal(plan.checksumMode, PGD_CHECKSUM_MODE_CRC);
  assert.equal(plan.checksumSeed, PGD_CHECKSUM_SEED >>> 0);
  assert.equal(plan.fixedPrefixBytes, pgdFixedPrefixBytes());
  assert.equal(plan.hostWriteNeeded, true);
  // the counter wraps like the `inc` it models
  assert.equal(pgdSavePlan({ saveCounterIn: 0xffffffff }).saveCounterNext, 0);
});

/* ---------------- native vs oracle differential ---------------- */

test("Wasm matches JS: magic / version / section table", () => {
  for (let v = -2; v <= 5; ++v) {
    assert.equal(
      wasm.isaac_pgd_version_for_variant(v),
      pgdVersionForVariant(v),
      `version variant ${v}`,
    );
    assert.equal(
      wasm.isaac_pgd_max_section_id_for_variant(v),
      pgdMaxSectionIdForVariant(v),
      `ceiling variant ${v}`,
    );
    for (const i of [-1, 0, 11, 13, 15, 16]) {
      assert.equal(
        wasm.isaac_pgd_magic_byte(v, i),
        pgdMagicByte(v, i),
        `magic byte ${v}/${i}`,
      );
    }
  }
  for (const tag of [-1, 0, 6, 7, 8, 9, 10, 0x7fffffff]) {
    assert.equal(
      wasm.isaac_pgd_version_loadable(tag),
      pgdVersionLoadable(tag) ? 1 : 0,
      `loadable ${tag}`,
    );
  }
  // magic matching through linear memory
  for (let v = 0; v < PGD_MAGIC_VARIANTS; ++v) {
    for (let i = 0; i < PGD_MAGIC_BYTES; ++i) {
      bytes[SCRATCH_A + i] = PGD_MAGIC_STRINGS[v].charCodeAt(i);
    }
    const jsMagic = Array.from(bytes.subarray(SCRATCH_A, SCRATCH_A + 16));
    assert.equal(wasm.isaac_pgd_magic_variant(SCRATCH_A), pgdMagicVariant(jsMagic));
    bytes[SCRATCH_A + 5] ^= 0x20;
    const broken = Array.from(bytes.subarray(SCRATCH_A, SCRATCH_A + 16));
    assert.equal(wasm.isaac_pgd_magic_variant(SCRATCH_A), pgdMagicVariant(broken));
    assert.equal(wasm.isaac_pgd_magic_variant(SCRATCH_A), -1);
  }
  assert.equal(wasm.isaac_pgd_magic_variant(0), -1);

  for (let id = -2; id <= 13; ++id) {
    const ok = wasm.isaac_pgd_section_desc(id, SCRATCH_A);
    const js = pgdSectionDesc(id);
    assert.equal(ok !== 0, js !== null, `section ${id} presence`);
    if (js !== null) {
      const native = readSectionDesc(view, SCRATCH_A);
      assert.deepEqual(
        native,
        {
          id: js.id,
          capWord: js.capWord,
          countWord: js.countWord,
          elemWidth: js.elemWidth,
          fieldOffset: js.fieldOffset,
          payloadBytes: js.payloadBytes,
          fixed: js.fixed,
        },
        `section ${id} desc`,
      );
    }
    assert.equal(
      wasm.isaac_pgd_section_stream_bytes(id),
      pgdSectionStreamBytes(id),
      `section ${id} bytes`,
    );
    assert.equal(
      wasm.isaac_pgd_section_stream_offset(id),
      pgdSectionStreamOffset(id),
      `section ${id} offset`,
    );
  }
  assert.equal(wasm.isaac_pgd_fixed_prefix_bytes(), pgdFixedPrefixBytes());
  assert.equal(SECTION_DESC_SIZE, 28);
});

test("Wasm matches JS: reader control flow (randomized)", () => {
  const rng = makeRng(0x5ec7104e);
  const fixed = [
    [0, 0],
    [1, 1],
    [-1, 0xb],
    [0xb, 0xb],
    [0xa, 0xb],
    [0x7fffffff, 0xb],
    [-0x80000000, 0xb],
  ];
  const pairs = fixed.slice();
  for (let i = 0; i < 400; ++i) {
    pairs.push([rng() | 0, pick(rng, 20) | 0]);
  }
  for (const [a, b] of pairs) {
    assert.equal(
      wasm.isaac_pgd_reader_loop_continue(a, b),
      pgdReaderLoopContinue(a, b) ? 1 : 0,
      `loop ${a}/${b}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_payload_continue(a, b),
      pgdReaderPayloadContinue(a, b) ? 1 : 0,
      `payload ${a}/${b}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_store_in_range(a, b),
      pgdReaderStoreInRange(a, b) ? 1 : 0,
      `store ${a}/${b}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_count_mismatch(a, b),
      pgdReaderCountMismatch(a, b) ? 1 : 0,
      `mismatch ${a}/${b}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_section_skipped(a),
      pgdReaderSectionSkipped(a) ? 1 : 0,
      `skip ${a}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_section_dispatched(a),
      pgdReaderSectionDispatched(a) ? 1 : 0,
      `dispatch ${a}`,
    );
  }
  for (let raw = 0; raw < 256; ++raw) {
    assert.equal(
      wasm.isaac_pgd_reader_bool_normalize(raw),
      pgdReaderBoolNormalize(raw) ? 1 : 0,
      `read bool ${raw}`,
    );
    assert.equal(
      wasm.isaac_pgd_writer_bool_normalize(raw),
      pgdWriterBoolNormalize(raw) ? 1 : 0,
      `write bool ${raw}`,
    );
  }
});

test("Wasm matches JS: checksum table, steps, and buffers", () => {
  for (let i = 0; i < 256; ++i) {
    assert.equal(
      wasm.isaac_pgd_crc_table_entry(i) >>> 0,
      pgdCrcTableEntry(i),
      `table ${i}`,
    );
  }
  assert.equal(wasm.isaac_pgd_crc_table_entry(1) >>> 0, 0x09073096);
  assert.equal(wasm.isaac_pgd_crc_table_uses_arithmetic_shift(), 1);
  assert.equal(wasm.isaac_pgd_save_uses_state_crc_routine(), 0);

  const rng = makeRng(0xc0ffee11);
  for (let i = 0; i < 500; ++i) {
    const reg = rng();
    const b = rng() & 0xff;
    assert.equal(
      wasm.isaac_pgd_crc_step(reg, b) >>> 0,
      pgdCrcStep(reg, b),
      `crc step ${reg}/${b}`,
    );
    const word = rng();
    assert.equal(
      wasm.isaac_pgd_ror_add_step(reg, word) >>> 0,
      pgdRorAddStep(reg, word),
      `ror add ${reg}/${word}`,
    );
  }

  // whole-buffer equivalence over randomized lengths and both modes
  for (let trial = 0; trial < 60; ++trial) {
    const len = trial === 0 ? 0 : pick(rng, 300);
    for (let i = 0; i < len; ++i) bytes[SCRATCH_B + i] = rng() & 0xff;
    const js = Array.from(bytes.subarray(SCRATCH_B, SCRATCH_B + len));
    for (const mode of [PGD_CHECKSUM_MODE_ROR_ADD, PGD_CHECKSUM_MODE_CRC, 2, -3]) {
      assert.equal(
        wasm.isaac_pgd_checksum_buffer(SCRATCH_B, len, mode) >>> 0,
        pgdChecksumBuffer(js, len, mode),
        `buffer trial ${trial} len ${len} mode ${mode}`,
      );
    }
    // null/empty guards agree
    assert.equal(
      wasm.isaac_pgd_checksum_buffer(0, 0, PGD_CHECKSUM_MODE_CRC) >>> 0,
      pgdChecksumBuffer(null, 0, PGD_CHECKSUM_MODE_CRC),
    );
  }
});

test("Wasm matches JS: streamed checksum state layout", () => {
  const rng = makeRng(0x1234abcd);
  for (const mode of [PGD_CHECKSUM_MODE_ROR_ADD, PGD_CHECKSUM_MODE_CRC, 5]) {
    for (let trial = 0; trial < 30; ++trial) {
      wasm.isaac_pgd_checksum_init(SCRATCH_A, mode);
      const st = pgdChecksumInit(mode);
      assert.deepEqual(readChecksumState(view, SCRATCH_A), {
        buffer: st.buffer >>> 0,
        partialLen: st.partialLen >>> 0,
        acc: st.acc >>> 0,
        mode: st.mode | 0,
      });
      const chunks = 1 + pick(rng, 5);
      for (let c = 0; c < chunks; ++c) {
        const len = pick(rng, 17);
        for (let i = 0; i < len; ++i) bytes[SCRATCH_B + i] = rng() & 0xff;
        const js = Array.from(bytes.subarray(SCRATCH_B, SCRATCH_B + len));
        wasm.isaac_pgd_checksum_update(SCRATCH_A, SCRATCH_B, len);
        pgdChecksumUpdate(st, js, len);
        assert.deepEqual(
          readChecksumState(view, SCRATCH_A),
          {
            buffer: st.buffer >>> 0,
            partialLen: st.partialLen >>> 0,
            acc: st.acc >>> 0,
            mode: st.mode | 0,
          },
          `state mode ${mode} trial ${trial} chunk ${c} len ${len}`,
        );
      }
      assert.equal(
        wasm.isaac_pgd_checksum_finalize(SCRATCH_A) >>> 0,
        pgdChecksumFinalize(st),
        `finalize mode ${mode} trial ${trial}`,
      );
    }
  }
  assert.equal(CHECKSUM_STATE_SIZE, 16);
  // null receivers are no-ops in both worlds
  wasm.isaac_pgd_checksum_init(0, PGD_CHECKSUM_MODE_CRC);
  wasm.isaac_pgd_checksum_update(0, SCRATCH_B, 4);
  assert.equal(wasm.isaac_pgd_checksum_finalize(0) >>> 0, 0);
});

test("Wasm matches JS: file-region checksum and validation", () => {
  const rng = makeRng(0x7f00d1e5);
  for (let trial = 0; trial < 25; ++trial) {
    const bodyLen = pick(rng, 200);
    const total = PGD_MAGIC_BYTES + bodyLen + PGD_CHECKSUM_TAIL_BYTES;
    for (let i = 0; i < PGD_MAGIC_BYTES; ++i) {
      bytes[SCRATCH_C + i] = PGD_MAGIC_STRINGS[3].charCodeAt(i);
    }
    for (let i = 0; i < bodyLen; ++i) {
      bytes[SCRATCH_C + PGD_MAGIC_BYTES + i] = rng() & 0xff;
    }
    const tail = SCRATCH_C + total - PGD_CHECKSUM_TAIL_BYTES;
    const sum = wasm.isaac_pgd_checksum_file_region(
      SCRATCH_C,
      total,
      PGD_CHECKSUM_SKIP_FRONT,
      PGD_CHECKSUM_SKIP_BACK,
    ) >>> 0;
    const jsFile = Array.from(bytes.subarray(SCRATCH_C, SCRATCH_C + total));
    assert.equal(
      sum,
      pgdChecksumFileRegion(
        jsFile,
        total,
        PGD_CHECKSUM_SKIP_FRONT,
        PGD_CHECKSUM_SKIP_BACK,
      ),
      `region trial ${trial} bodyLen ${bodyLen}`,
    );
    view.setUint32(tail, sum, true);
    const jsFile2 = Array.from(bytes.subarray(SCRATCH_C, SCRATCH_C + total));
    assert.equal(
      wasm.isaac_pgd_checksum_file_valid(SCRATCH_C, total),
      pgdChecksumFileValid(jsFile2, total) ? 1 : 0,
      `valid trial ${trial}`,
    );
    if (bodyLen > 0) {
      bytes[SCRATCH_C + PGD_MAGIC_BYTES] ^= 0x55;
      const jsFile3 = Array.from(bytes.subarray(SCRATCH_C, SCRATCH_C + total));
      assert.equal(
        wasm.isaac_pgd_checksum_file_valid(SCRATCH_C, total),
        pgdChecksumFileValid(jsFile3, total) ? 1 : 0,
        `tampered trial ${trial}`,
      );
      assert.equal(wasm.isaac_pgd_checksum_file_valid(SCRATCH_C, total), 0);
    }
  }
  assert.equal(wasm.isaac_pgd_checksum_file_valid(SCRATCH_C, 4), 0);
  assert.equal(wasm.isaac_pgd_checksum_file_region(0, 32, 16, 4) >>> 0, 0);
  assert.equal(wasm.isaac_pgd_checksum_file_region(SCRATCH_C, 32, -1, 4) >>> 0, 0);
});

test("Wasm matches JS: accessors and bounds (randomized)", () => {
  const rng = makeRng(0xdeadbe11);
  const ids = [
    -0x80000000, -3, -2, -1, 0, 1, 0x2c, 0x2d, 0x2e, 0x67, 0x68, 0x2dc, 0x2dd,
    0x281, 0x282, 0x7fffffff,
  ];
  for (let i = 0; i < 300; ++i) ids.push(rng() | 0);
  for (const id of ids) {
    assert.equal(
      wasm.isaac_pgd_achievement_index_valid(id),
      pgdAchievementIndexValid(id) ? 1 : 0,
      `ach ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_collection_index_valid(id),
      pgdCollectionIndexValid(id) ? 1 : 0,
      `coll ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_challenge_index_valid(id),
      pgdChallengeIndexValid(id) ? 1 : 0,
      `chal ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_boss_index_valid(id),
      pgdBossIndexValid(id) ? 1 : 0,
      `boss ${id}`,
    );
    for (const ro of [0, 1, 0xff, 0x100]) {
      assert.equal(
        wasm.isaac_pgd_challenge_store_needed(ro, id),
        pgdChallengeStoreNeeded(ro, id) ? 1 : 0,
        `chal store ${ro}/${id}`,
      );
      assert.equal(
        wasm.isaac_pgd_boss_store_needed(ro, id),
        pgdBossStoreNeeded(ro, id) ? 1 : 0,
        `boss store ${ro}/${id}`,
      );
      for (const cur of [0, 1, 0x80]) {
        assert.equal(
          wasm.isaac_pgd_collection_store_needed(ro, id, cur),
          pgdCollectionStoreNeeded(ro, id, cur) ? 1 : 0,
          `coll store ${ro}/${id}/${cur}`,
        );
        assert.equal(
          wasm.isaac_pgd_try_unlock_store_needed(ro, id, cur),
          pgdTryUnlockStoreNeeded(ro, id, cur) ? 1 : 0,
          `unlock store ${ro}/${id}/${cur}`,
        );
      }
    }
  }
  for (const flag of [0, 1, 0x80, 0x100]) {
    for (const cloud of [0, 1]) {
      assert.equal(
        wasm.isaac_pgd_try_unlock_steam_leg(flag, cloud),
        pgdTryUnlockSteamLeg(flag, cloud) ? 1 : 0,
        `steam leg ${flag}/${cloud}`,
      );
    }
  }
  // Unlocked over the full argument cross-product on interesting values
  for (const id of [-3, -2, -1, 0, 1, 0x281, 0x282, 0x7fffffff]) {
    for (const byte of [0, 1, 0x100]) {
      for (const mode of [0, 2]) {
        for (const gameNull of [0, 1]) {
          for (const g30 of [0, 1, 0x80000000]) {
            for (const g89 of [0, 1, 0x100]) {
              const native = wasm.isaac_pgd_unlocked(
                id,
                g30 === 0x80000000 ? -0x80000000 : byte,
                mode,
                gameNull,
                g30 | 0,
                g89,
              );
              const js = pgdUnlocked({
                achievementId: id,
                achievementByte: g30 === 0x80000000 ? -0x80000000 : byte,
                modeWord: mode,
                gameNull,
                game26630: g30,
                game26589: g89,
              });
              assert.equal(
                native,
                js ? 1 : 0,
                `unlocked ${id}/${byte}/${mode}/${gameNull}/${g30}/${g89}`,
              );
            }
          }
        }
      }
    }
  }
});

test("Wasm matches JS: event counter and flag arrays", () => {
  const rng = makeRng(0x0badf00d);
  const values = [
    0, 1, -1, 5, -5, 0x7fffffff, -0x80000000, 0x40000000, -0x40000000,
  ];
  for (let i = 0; i < 400; ++i) values.push(rng() | 0);
  for (const old of values.slice(0, 60)) {
    for (const num of values.slice(0, 60)) {
      assert.equal(
        wasm.isaac_pgd_event_counter_next(old, num),
        pgdEventCounterNext(old, num),
        `counter ${old}/${num}`,
      );
    }
  }
  for (const ro of [0, 1, 0xff, 0x100]) {
    assert.equal(
      wasm.isaac_pgd_event_counter_store_needed(ro),
      pgdEventCounterStoreNeeded(ro) ? 1 : 0,
    );
  }

  const count = PGD_COUNT_CHALLENGES;
  const js = new Uint8Array(count);
  bytes.fill(0, SCRATCH_A, SCRATCH_A + count);
  for (let i = 0; i < 300; ++i) {
    const index = pick(rng, count + 8) - 4;
    const value = rng() & 1;
    assert.equal(
      wasm.isaac_pgd_flag_set(SCRATCH_A, count, index, value),
      pgdFlagSet(js, count, index, value) ? 1 : 0,
      `flag set ${index}`,
    );
    assert.equal(
      wasm.isaac_pgd_flag_get(SCRATCH_A, count, index),
      pgdFlagGet(js, count, index) ? 1 : 0,
      `flag get ${index}`,
    );
    assert.equal(
      wasm.isaac_pgd_flag_popcount(SCRATCH_A, count),
      pgdFlagPopcount(js, count),
      `popcount step ${i}`,
    );
  }
  assert.deepEqual(
    Array.from(bytes.subarray(SCRATCH_A, SCRATCH_A + count)),
    Array.from(js),
  );
  assert.equal(wasm.isaac_pgd_flag_get(0, count, 0), 0);
  assert.equal(wasm.isaac_pgd_flag_set(0, count, 0, 1), 0);
  assert.equal(wasm.isaac_pgd_flag_popcount(0, count), 0);
  assert.equal(wasm.isaac_pgd_flag_popcount(SCRATCH_A, 0), 0);
  assert.equal(wasm.isaac_pgd_string_data_is_heap(PGD_STRING_SSO_CAP), 1);
  assert.equal(wasm.isaac_pgd_string_data_is_heap(PGD_STRING_SSO_CAP - 1), 0);
});

test("Wasm matches JS: bestiary header + save plan layout", () => {
  const rng = makeRng(0xfeedface);
  const counts = [
    [0, 0, 0, 0],
    [1, 2, 3, 4],
    [0xffffffff, 1, 0, 0],
    [0x40000000, 0x40000000, 0x40000000, 0x40000000],
  ];
  for (let i = 0; i < 200; ++i) counts.push([rng(), rng(), rng(), rng()]);
  for (const c of counts) {
    const total = wasm.isaac_pgd_bestiary_total(c[0] | 0, c[1] | 0, c[2] | 0, c[3] | 0) >>> 0;
    assert.equal(total, pgdBestiaryTotal(c[0], c[1], c[2], c[3]), `total ${c}`);
    assert.equal(
      wasm.isaac_pgd_bestiary_cap_word(total | 0) >>> 0,
      pgdBestiaryCapWord(total),
      `cap ${c}`,
    );
  }
  for (let slot = -2; slot <= 5; ++slot) {
    assert.equal(wasm.isaac_pgd_bestiary_submap_tag(slot), pgdBestiarySubmapTag(slot));
    assert.equal(wasm.isaac_pgd_bestiary_submap_pair(slot), pgdBestiarySubmapPair(slot));
  }

  for (const counter of [0, 41, 0xfffffffe, 0xffffffff]) {
    for (const c of counts.slice(0, 8)) {
      wasm.isaac_pgd_save_plan(
        counter | 0,
        c[0] | 0,
        c[1] | 0,
        c[2] | 0,
        c[3] | 0,
        SCRATCH_A,
      );
      const native = readSavePlan(view, SCRATCH_A);
      const js = pgdSavePlan({ saveCounterIn: counter, bestiaryCounts: c });
      assert.deepEqual(native, js, `plan ${counter}/${c}`);
    }
  }
  wasm.isaac_pgd_save_plan(1, 0, 0, 0, 0, 0); // null out is a no-op
  assert.equal(SAVE_PLAN_SIZE, 52);
});

/* =====================================================================
   PE-TRUTH ASSERTIONS

   These do not compare C++ against JS. They assert properties the
   instruction stream guarantees, directly against the native exports, so a
   mutation in the C++ is caught even if the oracle were mutated the same way.
   ===================================================================== */

/** Third, independent transcription of the table generator, written from the
 *  instruction listing (round 1 `shr`, rounds 2..8 `sar`) using a signed view
 *  rather than the oracle's expression. Not imported from the model. */
function tableEntryFromListing(index) {
  const reg = new Int32Array(1);
  reg[0] = index & 0xff;
  // round 1: D1 E8  shr eax,1
  {
    const carry = reg[0] & 1;
    reg[0] = (reg[0] >>> 1) ^ (carry ? 0xedb88320 | 0 : 0);
  }
  // rounds 2..8: D1 FA  sar edx,1
  for (let r = 0; r < 7; ++r) {
    const carry = reg[0] & 1;
    reg[0] = (reg[0] >> 1) ^ (carry ? 0xedb88320 | 0 : 0);
  }
  return reg[0] >>> 0;
}

test("PE truth: the checksum table is the arithmetic-shift variant", () => {
  // three-way: native vs a transcription written straight from the listing
  for (let i = 0; i < 256; ++i) {
    assert.equal(
      wasm.isaac_pgd_crc_table_entry(i) >>> 0,
      tableEntryFromListing(i),
      `listing table ${i}`,
    );
  }
  // the stock table is a distinct object, and the native must not be it
  assert.equal(wasm.isaac_pgd_crc_table_entry(1) >>> 0, 0x09073096);
  assert.notEqual(wasm.isaac_pgd_crc_table_entry(1) >>> 0, 0x77073096);
  assert.notEqual(wasm.isaac_pgd_crc_table_entry(2) >>> 0, 0xee0e612c);
  assert.notEqual(wasm.isaac_pgd_crc_table_entry(3) >>> 0, 0x990951ba);
  // a stock CRC-32 over "123456789" is 0xCBF43926; this checksum cannot be it
  const ascii = [...("123456789")].map((c) => c.charCodeAt(0));
  for (let i = 0; i < ascii.length; ++i) bytes[SCRATCH_B + i] = ascii[i];
  let reg = 0xffffffff >>> 0;
  for (let i = 0; i < ascii.length; ++i) {
    reg = wasm.isaac_pgd_crc_step(reg, ascii[i]) >>> 0;
  }
  assert.notEqual((~reg) >>> 0, 0xcbf43926);
  // arithmetic shift means the sign bit propagates: some entries must have
  // bit 31 set that the textbook table clears. Entry 4 is one of them.
  assert.equal(wasm.isaac_pgd_crc_table_entry(4) >>> 0, 0xff6dc419);
  assert.ok((wasm.isaac_pgd_crc_table_entry(4) >>> 0) >>> 31 === 1);
});

test("PE truth: seed, complement and the disjoint rotate halves", () => {
  // an empty update in either mode leaves the stored word at the seed
  assert.equal(
    wasm.isaac_pgd_checksum_buffer(SCRATCH_B, 0, PGD_CHECKSUM_MODE_CRC) >>> 0,
    0xfedcba76,
  );
  assert.equal(
    wasm.isaac_pgd_checksum_buffer(SCRATCH_B, 0, PGD_CHECKSUM_MODE_ROR_ADD) >>> 0,
    0xfedcba76,
  );
  // and it is emphatically not the 0xffffffff the state CRC-32 starts from
  assert.notEqual(
    wasm.isaac_pgd_checksum_buffer(SCRATCH_B, 0, PGD_CHECKSUM_MODE_CRC) >>> 0,
    0xffffffff,
  );
  // the working register is the complement of the stored seed
  assert.equal((~0xfedcba76) >>> 0, 0x01234589);

  // `shr acc,1` and `shl acc,31` cannot overlap, so the machine's ADD is
  // exactly a rotate. Assert that against the native helper over the full
  // boundary set plus a sweep.
  const rotSamples = [0, 1, 2, 3, 0x7fffffff, 0x80000000, 0xffffffff, 0xaaaaaaaa, 0x55555555];
  for (let i = 0; i < 512; ++i) rotSamples.push((Math.imul(i, 2654435761) >>> 0));
  for (const a of rotSamples) {
    const native = wasm.isaac_pgd_ror_add_step(a | 0, 0) >>> 0;
    const rotate = (((a >>> 1) | (a << 31)) >>> 0);
    assert.equal(native, rotate, `rotate identity a=${a}`);
    // adding a word is a plain 32-bit add on top of the rotate
    assert.equal(
      wasm.isaac_pgd_ror_add_step(a | 0, 0x12345678 | 0) >>> 0,
      ((rotate + 0x12345678) >>> 0),
      `rotate+add a=${a}`,
    );
  }
  // the rotate is a bijection, so 32 applications return the input
  let x = 0x9e3779b9;
  for (let i = 0; i < 32; ++i) x = wasm.isaac_pgd_ror_add_step(x | 0, 0) >>> 0;
  assert.equal(x, 0x9e3779b9);
});

test("PE truth: the bool round trip is asymmetric, natively", () => {
  // one native call on each side, no oracle involved
  assert.equal(wasm.isaac_pgd_writer_bool_normalize(0x80), 1);
  assert.equal(wasm.isaac_pgd_reader_bool_normalize(0x80), 0);
  let asymmetric = 0;
  for (let raw = 0; raw < 256; ++raw) {
    const w = wasm.isaac_pgd_writer_bool_normalize(raw);
    const r = wasm.isaac_pgd_reader_bool_normalize(raw);
    if (w !== r) asymmetric += 1;
  }
  // exactly the 128 bytes with the sign bit set survive a write and not a read
  assert.equal(asymmetric, 128);
});

test("PE truth: byte-width parameters keep their mask above 0xff", () => {
  // The Wasm ABI does not narrow i32 arguments, so a helper that models a
  // byte test must still mask in its own body. Feed values above 0xff whose
  // low byte is zero; a deleted mask would flip every one of these.
  assert.equal(wasm.isaac_pgd_writer_bool_normalize(0x100), 0);
  assert.equal(wasm.isaac_pgd_writer_bool_normalize(0xff00), 0);
  assert.equal(wasm.isaac_pgd_writer_bool_normalize(0x101), 1);
  assert.equal(wasm.isaac_pgd_reader_bool_normalize(0x100), 0);
  assert.equal(wasm.isaac_pgd_reader_bool_normalize(0x101), 1);
  assert.equal(wasm.isaac_pgd_reader_bool_normalize(0x1ff), 0); // low byte 0xff
  // readonly gates: a value whose low byte is zero must NOT close the gate
  assert.equal(wasm.isaac_pgd_event_counter_store_needed(0x100), 1);
  assert.equal(wasm.isaac_pgd_event_counter_store_needed(0x1), 0);
  assert.equal(wasm.isaac_pgd_challenge_store_needed(0x100, 0), 1);
  assert.equal(wasm.isaac_pgd_boss_store_needed(0x100, 0), 1);
  assert.equal(wasm.isaac_pgd_collection_store_needed(0x100, 5, 0x100), 1);
  assert.equal(wasm.isaac_pgd_try_unlock_store_needed(0x100, 5, 0x100), 1);
  assert.equal(wasm.isaac_pgd_sec5_store_slot(0x100, 3), 3);
  assert.equal(wasm.isaac_pgd_sec10_store_slot(0x100, 3), 3);
  // Unlocked reads two byte slots: 0x100 must read as clear
  assert.equal(wasm.isaac_pgd_unlocked(5, 0x100, 0, 0, 0, 0), 0);
  assert.equal(wasm.isaac_pgd_unlocked(5, 0x101, 0, 0, 0, 0), 1);
  assert.equal(wasm.isaac_pgd_unlocked(5, 0, 2, 0, 0, 0x100), 0);
  assert.equal(wasm.isaac_pgd_unlocked(5, 0, 2, 0, 0, 0x101), 1);
  // the CRC step masks its byte argument
  assert.equal(
    wasm.isaac_pgd_crc_step(0x12345678 | 0, 0x1ab) >>> 0,
    wasm.isaac_pgd_crc_step(0x12345678 | 0, 0xab) >>> 0,
  );
});

test("PE truth: signed vs unsigned bounds really differ, natively", () => {
  // AddBoss uses a signed ceiling with no floor; the other two are unsigned
  assert.equal(wasm.isaac_pgd_boss_index_valid(-1), 1);
  assert.equal(wasm.isaac_pgd_boss_index_valid(-0x80000000), 1);
  assert.equal(wasm.isaac_pgd_collection_index_valid(-1), 0);
  assert.equal(wasm.isaac_pgd_challenge_index_valid(-1), 0);
  assert.equal(wasm.isaac_pgd_achievement_index_valid(-1), 0);
  // an unsigned mutant on AddBoss would make these three agree
  assert.notEqual(
    wasm.isaac_pgd_boss_index_valid(-1),
    wasm.isaac_pgd_collection_index_valid(-1),
  );
  // Unlocked's own negative handling is a third, different rule
  assert.equal(wasm.isaac_pgd_unlocked(-1, 0, 0, 0, 0, 0), 1);
  assert.equal(wasm.isaac_pgd_unlocked(-2, 0, 0, 0, 0, 0), 0);
});

test("PE truth: cap_word is a byte cap, natively", () => {
  // A dword section with a cap of 4 consumes exactly ONE element, even though
  // its element count is far higher. Treating the cap as an element count
  // would consume four.
  assert.equal(wasm.isaac_pgd_reader_elements_consumed(100, 4, 4), 1);
  assert.equal(wasm.isaac_pgd_reader_elements_consumed(100, 4, 1), 4);
  assert.equal(wasm.isaac_pgd_reader_elements_consumed(100, 16, 4), 4);
  // and the native payload_continue agrees at the exact boundary
  assert.equal(wasm.isaac_pgd_reader_payload_continue(0, 4), 1);
  assert.equal(wasm.isaac_pgd_reader_payload_continue(4, 4), 0);
  // section 4's writer cap is four times its payload, so it can never bind
  const d4 = pgdSectionDesc(4);
  assert.ok(d4.capWord > d4.payloadBytes);
  assert.equal(
    wasm.isaac_pgd_reader_elements_consumed(d4.countWord, d4.capWord, 1),
    d4.countWord,
  );
  // section 1's cap is exactly its payload, so it binds precisely at the end
  const d1 = pgdSectionDesc(1);
  assert.equal(d1.capWord, d1.payloadBytes);
  assert.equal(
    wasm.isaac_pgd_reader_elements_consumed(d1.countWord + 10, d1.capWord, 1),
    d1.countWord,
  );
});

/* ---------------- v2: reader handlers ---------------- */

test("JS oracle: reader section descriptors cross-prove the writer table", () => {
  assert.equal(PGD_READER_SECTION_LABELS.length, 11);
  for (let id = 1; id <= 11; ++id) {
    const r = pgdReaderSectionDesc(id);
    assert.ok(r, `reader desc ${id}`);
    const w = pgdSectionDesc(id);
    assert.ok(w, `writer desc ${id}`);
    assert.equal(r.fieldOffset, w.fieldOffset, `sec ${id} offset agrees`);
    assert.equal(r.elemWidth, w.elemWidth, `sec ${id} width agrees`);
    assert.equal(r.builtinCount, w.countWord, `sec ${id} count agrees`);
    if (id !== 11) {
      // the store clamp and the count expectation are different instructions
      assert.equal(r.storeBound, r.builtinCount, `sec ${id} clamp == count`);
    }
    assert.equal(pgdReaderDispatchIndex(id), id - 1);
    assert.equal(pgdReaderHandlerVa(id), r.handlerVa);
    assert.ok(r.logBeginVa > 0 && r.logEndVa > 0, `sec ${id} labels recorded`);
  }
  // only section 9 re-clamps the file count
  for (let id = 1; id <= 11; ++id) {
    assert.equal(
      pgdReaderSectionDesc(id).clampsFileCount,
      id === 9,
      `sec ${id} clamp flag`,
    );
  }
  assert.equal(pgdReaderSectionDesc(0), null);
  assert.equal(pgdReaderSectionDesc(12), null);
  assert.equal(pgdReaderDispatchIndex(0), -1);
  assert.equal(pgdReaderDispatchIndex(12), -1);
  assert.equal(pgdReaderHandlerVa(12), 0);
  assert.equal(pgdReaderSectionDesc(1).handlerVa, 0x00927118);
  assert.equal(pgdReaderSectionDesc(11).handlerVa, 0x009276e1);
});

test("JS oracle: section 9 count clamp and the dispatch constant", () => {
  assert.equal(pgdReaderDispatchEdi(), 2);
  assert.equal(pgdReaderSec9Clamp(0), 0);
  assert.equal(pgdReaderSec9Clamp(1), 1);
  assert.equal(pgdReaderSec9Clamp(2), 2);
  assert.equal(pgdReaderSec9Clamp(3), 2);
  assert.equal(pgdReaderSec9Clamp(0xffffffff), 2); // unsigned above
  assert.equal(pgdReaderSec9Clamp(-1), 2);
  // no other section has this: consuming is bounded only by cap and count
  assert.equal(pgdReaderElementsConsumed(3, 0x1000, 4), 3);
});

/** Brute-force transcription of the handler loop, straight from the listing.
 *  A third implementation, used to prove the closed forms in the model and in
 *  the C++ are equivalent to the loop the PE actually runs.
 *
 *  CORRECTED AT v3, and this transcription is why the v2 defect survived: it
 *  had `if (n <= 0) return 0`, i.e. it repeated the same signed misreading the
 *  model and the C++ made, so all three agreed and the differential could not
 *  see it. Transcribed again from the listing, one branch at a time:
 *
 *    xor  idx, idx
 *    test eax, eax        ; the whole register, not its sign
 *    je   done
 *    xor  cursor, cursor
 *  top:
 *    cmp  cursor, cap
 *    jae  done            ; UNSIGNED
 *    <read one element>
 *    cmp  idx, bound
 *    jae  skip_store      ; UNSIGNED
 *    <store>
 *  skip_store:
 *    inc  idx
 *    add  cursor, width
 *    cmp  idx, count
 *    jb   top             ; UNSIGNED
 */
function consumedByBruteForce(fileCount, capWord, width) {
  if (width !== 1 && width !== 4) return 0;
  const n = fileCount >>> 0;
  if (n === 0) return 0; // test/je — zero only
  const cap = capWord >>> 0;
  let taken = 0;
  let cursor = 0;
  let idx = 0;
  // Bounded so an unsigned count of 0xffffffff cannot hang the harness; every
  // shape this reference is used on stops long before the guard.
  const GUARD = 1 << 20;
  for (;;) {
    if (cursor >= cap) break; // cmp cursor, cap ; jae done
    taken += 1;
    idx = (idx + 1) >>> 0;
    cursor = (cursor + width) >>> 0;
    if (!(idx < n)) break; // cmp idx, count ; jb top
    if (taken >= GUARD) break;
  }
  return taken;
}

function storedByBruteForce(fileCount, capWord, width, storeBound) {
  const consumed = consumedByBruteForce(fileCount, capWord, width);
  const bound = storeBound >>> 0;
  let stored = 0;
  for (let i = 0; i < consumed; ++i) {
    if ((i >>> 0) < bound) stored += 1; // cmp idx, bound ; jae skip_store
  }
  return stored;
}

test("PE truth: the closed forms equal the loop the handler runs", () => {
  // Exhaustive over every small shape, against a loop written from the listing
  // rather than from either implementation.
  for (let n = -2; n <= 40; ++n) {
    for (let cap = 0; cap <= 40; ++cap) {
      for (const w of [1, 4]) {
        const brute = consumedByBruteForce(n, cap, w);
        assert.equal(
          wasm.isaac_pgd_reader_elements_consumed(n | 0, cap | 0, w) >>> 0,
          brute,
          `native consumed ${n}/${cap}/${w}`,
        );
        assert.equal(
          pgdReaderElementsConsumed(n, cap, w),
          brute,
          `oracle consumed ${n}/${cap}/${w}`,
        );
        for (const b of [0, 1, 7, 40]) {
          const bruteStored = storedByBruteForce(n, cap, w, b);
          assert.equal(
            wasm.isaac_pgd_reader_elements_stored(n | 0, cap | 0, w, b) >>> 0,
            bruteStored,
            `native stored ${n}/${cap}/${w}/${b}`,
          );
          assert.equal(
            pgdReaderElementsStored(n, cap, w, b),
            bruteStored,
            `oracle stored ${n}/${cap}/${w}/${b}`,
          );
        }
      }
    }
  }
  // The wrap regime the closed form reasons about, checked directly: a cap
  // large enough that a four-byte cursor rolls over never stops the walk.
  for (const cap of [0xfffffffd, 0xfffffffe, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_reader_elements_consumed(1000, cap | 0, 4) >>> 0, 1000);
    assert.equal(pgdReaderElementsConsumed(1000, cap, 4), 1000);
  }
  // and one just below it does stop, at exactly a quarter of the cap
  assert.equal(
    wasm.isaac_pgd_reader_elements_consumed(0x7fffffff, 0xfffffffc | 0, 4) >>> 0,
    0x3fffffff,
  );
  assert.equal(pgdReaderElementsConsumed(0x7fffffff, 0xfffffffc, 4), 0x3fffffff);
});

test("JS oracle: element cursors, consumption and store clamps", () => {
  assert.equal(pgdReaderElemByteCursor(0, 1), 0);
  assert.equal(pgdReaderElemByteCursor(5, 1), 5);
  assert.equal(pgdReaderElemByteCursor(5, 4), 20);
  assert.equal(pgdReaderElemByteCursor(5, 2), -1);
  assert.equal(pgdReaderElementsConsumed(0, 100, 1), 0);
  /* CORRECTED AT v3. This line asserted 0 and was one of the two things
     holding the v2 defect in place: the entry test is `test eax,eax ; je`,
     which a sign-bit count does not satisfy, and the loop-back is `jb`. A
     count of -1 is an unsigned bound of 4294967295, so the cap is what stops
     the walk. */
  assert.equal(pgdReaderElementsConsumed(-1, 100, 1), 100);
  assert.equal(pgdReaderElementsConsumed(-1, 100, 4), 25);
  assert.equal(pgdReaderElementsConsumed(0x80000000, 100, 1), 100);
  assert.equal(pgdReaderElementsConsumed(10, 0, 1), 0);
  assert.equal(pgdReaderElementsConsumed(10, 3, 1), 3);
  assert.equal(pgdReaderElementsConsumed(10, 3, 4), 1);
  assert.equal(pgdReaderElementsConsumed(2, 1000, 4), 2);
  // stored is consumed minus whatever the array clamp rejects
  assert.equal(pgdReaderElementsStored(10, 1000, 1, 4), 4);
  assert.equal(pgdReaderElementsStored(10, 1000, 4, 4), 4);
  assert.equal(pgdReaderElementsStored(2, 1000, 1, 4), 2);
  assert.equal(pgdReaderElementsStored(10, 3, 1, 100), 3);
});

test("JS oracle: section 11 sub-block decode", () => {
  assert.deepEqual([1, 2, 3, 4].map(pgdBestiarySlotFromTag), [0, 1, 2, 3]);
  assert.equal(pgdBestiarySlotFromTag(0), -1);
  assert.equal(pgdBestiarySlotFromTag(5), -1);
  assert.equal(pgdBestiarySlotFromTag(-1), -1);
  assert.equal(pgdBestiaryTagHandlerVa(1), 0x00927b44);
  assert.equal(pgdBestiaryTagHandlerVa(4), 0x009277ce);
  assert.equal(pgdBestiaryTagHandlerVa(5), 0);
  // read side and write side agree on which map a tag drains
  for (let slot = 0; slot < 4; ++slot) {
    const tag = pgdBestiarySubmapTag(slot); // writer emission order
    const pair = pgdBestiarySubmapPair(slot);
    assert.equal(pgdBestiarySlotFromTag(tag), pair, `tag ${tag} -> pair`);
    assert.equal(pgdBestiaryMapRootOff(pair), PGD_BESTIARY_OFF_ROOT[pair]);
    assert.equal(pgdBestiaryMapCountOff(pair), PGD_BESTIARY_OFF_COUNT[pair]);
  }
  assert.equal(pgdBestiaryMapRootOff(4), 0);
  assert.equal(pgdBestiaryMapCountOff(-1), 0);
  // signed skip test, then an unsigned halving
  assert.equal(pgdBestiaryPairCountFromSize(0), -1);
  assert.equal(pgdBestiaryPairCountFromSize(-4), -1);
  assert.equal(pgdBestiaryPairCountFromSize(-0x80000000), -1);
  assert.equal(pgdBestiaryPairCountFromSize(4), 1);
  assert.equal(pgdBestiaryPairCountFromSize(7), 1); // truncates
  assert.equal(pgdBestiaryPairCountFromSize(40), 10);
  // the size dword accounts for half the bytes the pairs occupy
  assert.equal(pgdBestiarySizeWordFromPairs(10), 40);
  assert.equal(pgdBestiaryPairPayloadBytes(10), 80);
  assert.equal(
    pgdBestiaryPairPayloadBytes(10),
    pgdBestiarySizeWordFromPairs(10) * 2,
  );
  // and the round trip still closes, which is why it must not be "fixed"
  for (const n of [1, 2, 7, 100, 1000]) {
    assert.equal(pgdBestiaryPairCountFromSize(pgdBestiarySizeWordFromPairs(n)), n);
  }
  assert.equal(PGD_BESTIARY_PAIR_BYTES, 8);
});

test("JS oracle: the +0xe00 index remap folds two ranges", () => {
  // 0..6 pass through
  for (let id = 0; id <= 6; ++id) {
    assert.equal(pgdSec5IndexRemap(id), id, `direct ${id}`);
  }
  // 7..13 fold down onto the same seven slots
  for (let id = 7; id <= 13; ++id) {
    assert.equal(pgdSec5IndexRemap(id), id - 7, `folded ${id}`);
  }
  // 14 aliases onto the last slot, 15 is dropped without a warning
  assert.equal(pgdSec5IndexRemap(14), 6);
  assert.equal(pgdSec5IndexRemap(15), -1);
  assert.equal(pgdSec5OutOfRange(15), false);
  // above the window: rejected WITH a warning, and negatives land there too
  assert.equal(pgdSec5IndexRemap(16), -1);
  assert.equal(pgdSec5OutOfRange(16), true);
  assert.equal(pgdSec5IndexRemap(-1), -1);
  assert.equal(pgdSec5OutOfRange(-1), true);
  assert.equal(pgdSec5OutOfRange(0), false);
  assert.equal(pgdSec5OutOfRange(PGD_SEC5_ID_MAX), false);
  // aliasing is real: two distinct ids reach one slot
  assert.equal(pgdSec5IndexRemap(6), pgdSec5IndexRemap(13));
  assert.equal(pgdSec5IndexRemap(6), pgdSec5IndexRemap(PGD_SEC5_ALIAS_ID));
  // readonly closes the gate before the remap runs
  assert.equal(pgdSec5StoreSlot(0, 3), 3);
  assert.equal(pgdSec5StoreSlot(1, 3), -1);
  // the follow-up unlock needs all seven
  const slots = new Uint8Array(PGD_SEC5_SLOTS).fill(1);
  assert.equal(pgdSec5AllSet(slots, slots.length), true);
  slots[4] = 0;
  assert.equal(pgdSec5AllSet(slots, slots.length), false);
  assert.equal(pgdSec5AllSet(null, 7), false);
  assert.equal(pgdSec5AllSet(new Uint8Array(6).fill(1), 6), false);
  assert.equal(PGD_SEC5_UNLOCK_ID, 0x16);
});

test("JS oracle: the +0xf14 store is unchecked and self-cancelling at 0", () => {
  assert.equal(pgdSec10StoreSlot(0, 0), 0);
  assert.equal(pgdSec10StoreSlot(0, 5), 5);
  // no bound at all â€” these are outside the array and the PE writes anyway
  assert.equal(pgdSec10StoreSlot(0, PGD_SEC10_SLOTS), PGD_SEC10_SLOTS);
  assert.equal(pgdSec10StoreSlot(0, 100000), 100000);
  assert.equal(pgdSec10StoreSlot(0, -1), -1 | 0);
  assert.equal(pgdSec10StoreSlot(1, 5), -1);
  assert.equal(pgdSec10ResetsSlot0(), true);
  // index zero has its own store undone one instruction later
  assert.equal(pgdSec10StoreIsSelfCancelling(0, 0), true);
  assert.equal(pgdSec10StoreIsSelfCancelling(0, 1), false);
  assert.equal(pgdSec10StoreIsSelfCancelling(1, 0), false);
});

test("JS oracle: the 41-bit popcount gate", () => {
  assert.equal(pgdMask41Popcount(0, 0), 0);
  assert.equal(pgdMask41Popcount(0xffffffff, 0), 32);
  assert.equal(pgdMask41Popcount(0, 0xffffffff), 9); // only bits 32..40
  assert.equal(pgdMask41Popcount(0xffffffff, 0xffffffff), 41);
  assert.equal(pgdMask41Popcount(0, 0x1ff), 9);
  assert.equal(pgdMask41Popcount(0, 0x200), 0); // bit 41 is never examined
  assert.equal(pgdMask41HiMask(), 0x1ff);
  assert.equal(PGD_MASK41_BITS, 0x29);
  assert.equal(pgdMask41UnlockNeeded(4), false);
  assert.equal(pgdMask41UnlockNeeded(5), true);
  assert.equal(pgdMask41UnlockNeeded(41), true);
  assert.equal(pgdMask41UnlockNeeded(-1), false);
  assert.equal(PGD_MASK41_UNLOCK_THRESHOLD, 5);
  assert.equal(PGD_MASK41_UNLOCK_ID, 0x143);
  // the two words are stashed in eventCounter slots, not in fields of their own
  assert.equal(
    PGD_OFF_EVENT_COUNTERS + PGD_MASK41_LO_COUNTER_INDEX * 4,
    0x5ac,
  );
  assert.equal(
    PGD_OFF_EVENT_COUNTERS + PGD_MASK41_HI_COUNTER_INDEX * 4,
    0xa7c,
  );
  assert.ok(PGD_MASK41_HI_COUNTER_INDEX < PGD_COUNT_EVENT_COUNTERS);
});

/* ---------------- v2: native vs oracle differential ---------------- */

test("Wasm matches JS: reader section descriptors", () => {
  for (let id = -1; id <= 13; ++id) {
    const ok = wasm.isaac_pgd_reader_section_desc(id, SCRATCH_A);
    const js = pgdReaderSectionDesc(id);
    assert.equal(ok !== 0, js !== null, `reader desc ${id} presence`);
    if (js !== null) {
      const native = {
        id: readI32(view, SCRATCH_A + READER_DESC_OFF.id),
        builtinCount: readI32(view, SCRATCH_A + READER_DESC_OFF.builtinCount),
        elemWidth: readI32(view, SCRATCH_A + READER_DESC_OFF.elemWidth),
        fieldOffset: readI32(view, SCRATCH_A + READER_DESC_OFF.fieldOffset),
        storeBound: readI32(view, SCRATCH_A + READER_DESC_OFF.storeBound),
        clampsFileCount:
          readI32(view, SCRATCH_A + READER_DESC_OFF.clampsFileCount) !== 0,
        handlerVa: readU32(view, SCRATCH_A + READER_DESC_OFF.handlerVa),
        logBeginVa: readU32(view, SCRATCH_A + READER_DESC_OFF.logBeginVa),
        logEndVa: readU32(view, SCRATCH_A + READER_DESC_OFF.logEndVa),
        logMismatchVa: readU32(view, SCRATCH_A + READER_DESC_OFF.logMismatchVa),
      };
      assert.deepEqual(native, js, `reader desc ${id}`);
    }
    assert.equal(
      wasm.isaac_pgd_reader_dispatch_index(id),
      pgdReaderDispatchIndex(id),
      `dispatch index ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_handler_va(id) >>> 0,
      pgdReaderHandlerVa(id),
      `handler va ${id}`,
    );
  }
  assert.equal(READER_DESC_SIZE, 40);
  assert.equal(wasm.isaac_pgd_reader_dispatch_edi(), pgdReaderDispatchEdi());
});

test("Wasm matches JS: reader loop arithmetic (boundary-biased)", () => {
  const rng = makeRng(0x2b1c9f3a);
  // draw from the boundaries this arithmetic actually has, not uniformly
  const counts = [0, -1, 1, 2, 3, 4, 7, 0x282, 0x283, 0x7fffffff, -0x80000000];
  const caps = [0, 1, 3, 4, 5, 8, 0x282, 0xb74, 0x80000000, 0xffffffff];
  const widths = [1, 4, 2, 0];
  const bounds = [0, 1, 2, 4, 7, 0x282, 0x2dd];
  for (let i = 0; i < 40; ++i) counts.push(pick(rng, 300));
  for (let i = 0; i < 20; ++i) caps.push(pick(rng, 600));
  for (const c of counts) {
    for (const cap of caps) {
      for (const w of widths) {
        assert.equal(
          wasm.isaac_pgd_reader_elements_consumed(c | 0, cap | 0, w) >>> 0,
          pgdReaderElementsConsumed(c, cap, w),
          `consumed ${c}/${cap}/${w}`,
        );
      }
    }
    assert.equal(
      wasm.isaac_pgd_reader_sec9_clamp(c | 0),
      pgdReaderSec9Clamp(c),
      `sec9 clamp ${c}`,
    );
  }
  for (const c of counts.slice(0, 12)) {
    for (const cap of caps.slice(0, 8)) {
      for (const w of [1, 4]) {
        for (const b of bounds) {
          assert.equal(
            wasm.isaac_pgd_reader_elements_stored(c | 0, cap | 0, w, b) >>> 0,
            pgdReaderElementsStored(c, cap, w, b),
            `stored ${c}/${cap}/${w}/${b}`,
          );
        }
      }
    }
  }
  for (const i of [0, 1, 5, 0x1fffffff, 0x20000000, 0x7fffffff, -1]) {
    for (const w of [1, 4, 3]) {
      assert.equal(
        wasm.isaac_pgd_reader_elem_byte_cursor(i | 0, w),
        pgdReaderElemByteCursor(i, w),
        `cursor ${i}/${w}`,
      );
    }
  }
});

test("Wasm matches JS: section 11 sub-block decode", () => {
  for (let tag = -2; tag <= 6; ++tag) {
    assert.equal(
      wasm.isaac_pgd_bestiary_slot_from_tag(tag),
      pgdBestiarySlotFromTag(tag),
      `slot from tag ${tag}`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_tag_handler_va(tag) >>> 0,
      pgdBestiaryTagHandlerVa(tag),
      `tag handler ${tag}`,
    );
  }
  for (let slot = -2; slot <= 5; ++slot) {
    assert.equal(
      wasm.isaac_pgd_bestiary_map_root_off(slot) >>> 0,
      pgdBestiaryMapRootOff(slot),
      `root off ${slot}`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_map_count_off(slot) >>> 0,
      pgdBestiaryMapCountOff(slot),
      `count off ${slot}`,
    );
  }
  const sizes = [
    0, 1, 2, 3, 4, 5, 7, 8, 40, -1, -4, 0x7fffffff, -0x80000000, 0x40000000,
  ];
  const rng = makeRng(0x39ab77c1);
  for (let i = 0; i < 200; ++i) sizes.push(rng() | 0);
  for (const s of sizes) {
    assert.equal(
      wasm.isaac_pgd_bestiary_pair_count_from_size(s | 0),
      pgdBestiaryPairCountFromSize(s),
      `pair count ${s}`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_pair_payload_bytes(s | 0),
      pgdBestiaryPairPayloadBytes(s),
      `payload bytes ${s}`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_size_word_from_pairs(s | 0),
      pgdBestiarySizeWordFromPairs(s),
      `size word ${s}`,
    );
  }
});

test("Wasm matches JS: PGDX mutators and PGDK popcount", () => {
  const ids = [
    -0x80000000, -2, -1, 0, 1, 5, 6, 7, 12, 13, 14, 15, 16, 17, 0x50, 0x51,
    100000, 0x7fffffff,
  ];
  const rng = makeRng(0x77aa1234);
  for (let i = 0; i < 200; ++i) ids.push(rng() | 0);
  for (const id of ids) {
    assert.equal(
      wasm.isaac_pgd_sec5_index_remap(id),
      pgdSec5IndexRemap(id),
      `sec5 remap ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_sec5_out_of_range(id),
      pgdSec5OutOfRange(id) ? 1 : 0,
      `sec5 warn ${id}`,
    );
    for (const ro of [0, 1, 0x100]) {
      assert.equal(
        wasm.isaac_pgd_sec5_store_slot(ro, id),
        pgdSec5StoreSlot(ro, id),
        `sec5 store ${ro}/${id}`,
      );
      assert.equal(
        wasm.isaac_pgd_sec10_store_slot(ro, id),
        pgdSec10StoreSlot(ro, id),
        `sec10 store ${ro}/${id}`,
      );
      assert.equal(
        wasm.isaac_pgd_sec10_store_is_self_cancelling(ro, id),
        pgdSec10StoreIsSelfCancelling(ro, id) ? 1 : 0,
        `sec10 cancel ${ro}/${id}`,
      );
    }
  }
  assert.equal(wasm.isaac_pgd_sec10_resets_slot0(), 1);

  // all-set gate over linear memory
  const js = new Uint8Array(PGD_SEC5_SLOTS);
  bytes.fill(0, SCRATCH_A, SCRATCH_A + PGD_SEC5_SLOTS);
  for (let i = 0; i < 60; ++i) {
    const k = pick(rng, PGD_SEC5_SLOTS);
    const v = rng() & 1;
    js[k] = v;
    bytes[SCRATCH_A + k] = v;
    for (const n of [PGD_SEC5_SLOTS, 6, 0]) {
      assert.equal(
        wasm.isaac_pgd_sec5_all_set(SCRATCH_A, n),
        pgdSec5AllSet(js, n) ? 1 : 0,
        `all set n=${n} step ${i}`,
      );
    }
  }
  assert.equal(wasm.isaac_pgd_sec5_all_set(0, PGD_SEC5_SLOTS), 0);

  // popcount: force the exact word boundaries, then sweep
  const masks = [
    [0, 0],
    [0xffffffff, 0xffffffff],
    [0, 0x1ff],
    [0, 0x200],
    [0, 0xfffffe00],
    [0x80000000, 0],
    [1, 0],
    [0xffffffff, 0],
    [0, 0xffffffff],
    [0x0000000f, 0x1f],
  ];
  for (let i = 0; i < 300; ++i) masks.push([rng(), rng()]);
  for (const [lo, hi] of masks) {
    const n = wasm.isaac_pgd_mask41_popcount(lo | 0, hi | 0);
    assert.equal(n, pgdMask41Popcount(lo, hi), `popcount ${lo}/${hi}`);
    assert.ok(n >= 0 && n <= 41, `popcount range ${lo}/${hi}`);
    assert.equal(
      wasm.isaac_pgd_mask41_unlock_needed(n),
      pgdMask41UnlockNeeded(n) ? 1 : 0,
      `unlock ${n}`,
    );
  }
  assert.equal(wasm.isaac_pgd_mask41_hi_mask() >>> 0, pgdMask41HiMask());
  // PE truth: the high word contributes at most nine bits, ever
  assert.equal(wasm.isaac_pgd_mask41_popcount(0, -1), 9);
  assert.equal(wasm.isaac_pgd_mask41_popcount(-1, -1), 41);
});

/* ==========================================================================
   v3 — the section-3 handler family, section 11's own shape, the second
   transport, the bit-packed codec, and the pgd+0x02 gate.
   ========================================================================== */

test("PE truth: the entry gate is a zero test, not a sign test", () => {
  /* `test eax,eax ; je done` fires on an all-zero register and nothing else,
     and the loop-back below it is `jb`. So every count with the top bit set
     enters the loop and behaves as an enormous unsigned bound. v2 modelled
     this as `file_count <= 0` and returned nothing for all of them. */
  assert.equal(wasm.isaac_pgd_reader_count_enters_loop(0), 0);
  for (const n of [1, 2, 0x7fffffff, 0x80000000, 0x80000001, 0xffffffff]) {
    assert.equal(
      wasm.isaac_pgd_reader_count_enters_loop(n | 0),
      1,
      `count ${n >>> 0} must enter the loop`,
    );
    assert.equal(pgdReaderCountEntersLoop(n), 1);
  }
  // and the consequence the correction exists for: a sign-bit count is
  // stopped by the CAP, not by the count
  for (const [cap, width, expect] of [
    [0x38, 4, 0x0e],
    [0x1c, 1, 0x1c],
    [0, 4, 0],
    [4, 4, 1],
  ]) {
    assert.equal(
      wasm.isaac_pgd_reader_elements_consumed(-1, cap, width) >>> 0,
      expect,
      `sign-bit count with cap ${cap} width ${width}`,
    );
    assert.equal(pgdReaderElementsConsumed(0xffffffff, cap, width), expect);
  }
  // section 9 is immune because its clamp is an unsigned above-compare
  assert.equal(wasm.isaac_pgd_reader_sec9_clamp(-1), 2);
  assert.equal(pgdReaderSec9Clamp(0xffffffff), 2);
  assert.equal(wasm.isaac_pgd_reader_dispatch_edi(), 2);
});

test("PE truth: the store clamp and the store address use different registers", () => {
  /* `cmp ebx, 0xe ; jae skip` tests the ELEMENT index while
     `mov [ecx + edi + 0xdc8], eax` addresses with the BYTE cursor. For the
     four-byte sections those are two registers advancing at different rates;
     collapsing them would put element 3 of section 3 at +0xdcb. */
  assert.equal(
    wasm.isaac_pgd_reader_store_offset(PGD_OFF_SEC3_DWORDS, 3, 4, PGD_COUNT_SEC3),
    PGD_OFF_SEC3_DWORDS + 12,
  );
  assert.equal(
    wasm.isaac_pgd_reader_store_offset(PGD_OFF_SEC3_DWORDS, 13, 4, PGD_COUNT_SEC3),
    PGD_OFF_SEC3_DWORDS + 52,
  );
  // element 14 is clamped out even though byte cursor 56 is a real address
  assert.equal(
    wasm.isaac_pgd_reader_store_offset(PGD_OFF_SEC3_DWORDS, 14, 4, PGD_COUNT_SEC3),
    -1,
  );
  // width 1: the two registers coincide, which is why the bug hides there
  assert.equal(
    wasm.isaac_pgd_reader_store_offset(PGD_OFF_SEC5_BYTES, 6, 1, PGD_COUNT_SEC5),
    PGD_OFF_SEC5_BYTES + 6,
  );
  assert.equal(
    wasm.isaac_pgd_reader_store_offset(PGD_OFF_SEC5_BYTES, 7, 1, PGD_COUNT_SEC5),
    -1,
  );
  // the last dword of section 3 must end exactly where +0xe00 begins
  assert.equal(PGD_OFF_SEC3_DWORDS + PGD_COUNT_SEC3 * 4, PGD_OFF_SEC5_BYTES);
  // ...and section 5's seven bytes end exactly where the bosses start
  assert.equal(PGD_OFF_SEC5_BYTES + PGD_COUNT_SEC5, PGD_OFF_BOSSES);
  // section 8's 27 dwords end exactly where section 9 begins
  assert.equal(PGD_OFF_SEC8_DWORDS + PGD_COUNT_SEC8 * 4, PGD_OFF_SEC9_DWORDS);
  // and section 9's two dwords end exactly where section 10 begins
  assert.equal(PGD_OFF_SEC9_DWORDS + PGD_COUNT_SEC9 * 4, PGD_OFF_SEC10_BYTES);
});

test("PE truth: only byte sections normalise, and they do it signed", () => {
  assert.equal(wasm.isaac_pgd_reader_store_normalizes(1), 1);
  assert.equal(wasm.isaac_pgd_reader_store_normalizes(4), 0);
  assert.equal(wasm.isaac_pgd_reader_store_normalizes(2), -1);
  assert.equal(wasm.isaac_pgd_reader_store_normalizes(0), -1);
  // width 4 is verbatim: every dword survives, including the ones a `setg`
  // would have flattened
  for (const raw of [0, 1, 0x7f, 0x80, 0xff, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(
      wasm.isaac_pgd_reader_store_value(4, raw | 0) >>> 0,
      raw >>> 0,
      `dword ${raw >>> 0} must pass through`,
    );
    assert.equal(pgdReaderStoreValue(4, raw), raw >>> 0);
  }
  // width 1 is the asymmetric `setg`: 0x80..0xff read back as 0
  for (let b = 0; b <= 0xff; ++b) {
    const expect = b >= 1 && b <= 0x7f ? 1 : 0;
    assert.equal(
      wasm.isaac_pgd_reader_store_value(1, b) >>> 0,
      expect,
      `byte 0x${b.toString(16)}`,
    );
    assert.equal(pgdReaderStoreValue(1, b), expect);
    // and it must agree with the v1 predicate that first pinned the defect
    assert.equal(wasm.isaac_pgd_reader_bool_normalize(b), expect);
  }
  // the byte-parameter mask must survive -O2: 0x100 is a zero byte
  assert.equal(wasm.isaac_pgd_reader_store_value(1, 0x100) >>> 0, 0);
  assert.equal(wasm.isaac_pgd_reader_store_value(1, 0x101) >>> 0, 1);
  assert.equal(pgdReaderStoreValue(1, 0x100), 0);
});

test("PE truth: section 11 is not the fixed-section shape", () => {
  for (let id = 1; id <= 10; ++id) {
    assert.equal(wasm.isaac_pgd_reader_section_uses_cap(id), 1, `cap use ${id}`);
    assert.equal(pgdReaderSectionUsesCap(id), 1);
  }
  assert.equal(wasm.isaac_pgd_reader_section_uses_cap(11), 0);
  assert.equal(pgdReaderSectionUsesCap(11), 0);
  assert.equal(wasm.isaac_pgd_reader_section_uses_cap(0), 0);
  assert.equal(wasm.isaac_pgd_reader_section_uses_cap(12), 0);

  // the clear order is its own thing and must not equal the emit order
  const clear = [0, 1, 2, 3].map((s) => wasm.isaac_pgd_bestiary_clear_slot(s));
  const emit = [0, 1, 2, 3].map((s) => wasm.isaac_pgd_bestiary_submap_pair(s));
  assert.deepEqual(clear, [3, 0, 2, 1]);
  assert.deepEqual(emit, [3, 1, 2, 0]);
  assert.notDeepEqual(clear, emit);
  // both are permutations of the same four slots
  assert.deepEqual([...clear].sort(), [0, 1, 2, 3]);
  assert.deepEqual([...emit].sort(), [0, 1, 2, 3]);
  for (let s = 0; s < 4; ++s) assert.equal(pgdBestiaryClearSlot(s), clear[s]);
  assert.equal(wasm.isaac_pgd_bestiary_clear_slot(-1), -1);
  assert.equal(wasm.isaac_pgd_bestiary_clear_slot(4), -1);

  // outer loop unsigned, pair loop SIGNED — the difference is the point
  assert.equal(wasm.isaac_pgd_bestiary_outer_continue(1, -1), 1);
  assert.equal(wasm.isaac_pgd_bestiary_pair_loop_continue(1, -1), 0);
  assert.equal(wasm.isaac_pgd_bestiary_outer_continue(-1, 1), 0);
  assert.equal(wasm.isaac_pgd_bestiary_pair_loop_continue(-1, 1), 1);
  assert.equal(pgdBestiaryOuterContinue(1, 0xffffffff), 1);
  assert.equal(pgdBestiaryPairLoopContinue(1, -1), 0);

  assert.equal(wasm.isaac_pgd_reader_tail_reads_save_counter(), 1);
  assert.equal(pgdReaderTailReadsSaveCounter(), 1);
});

test("PE truth: the bestiary insert gate is marker-first, then a signed key", () => {
  // a set marker byte forces the insert no matter what the key says
  for (const marker of [1, 0x7f, 0x80, 0xff]) {
    assert.equal(wasm.isaac_pgd_bestiary_insert_needed(marker, 5, 5), 1);
    assert.equal(pgdBestiaryInsertNeeded(marker, 5, 5), 1);
  }
  // marker clear: only a key that sorts strictly below the landing node
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0, 4, 5), 1);
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0, 5, 5), 0);
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0, 6, 5), 0);
  // SIGNED: a negative key is below a positive one, unsigned would say above
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0, -1, 0), 1);
  assert.equal(pgdBestiaryInsertNeeded(0, -1, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0, 0, -1), 0);
  // the marker is a BYTE test: 0x100 is clear
  assert.equal(wasm.isaac_pgd_bestiary_insert_needed(0x100, 5, 5), 0);
  assert.equal(pgdBestiaryInsertNeeded(0x100, 5, 5), 0);
  assert.equal(PGD_BESTIARY_NODE_MARKER_OFF, 0xd);
});

test("v3: the second transport cross-proves every array width", () => {
  assert.equal(PGD_ALT_TRANSPORT_FIELDS, 8);
  const seen = [];
  for (let step = 0; step < PGD_ALT_TRANSPORT_FIELDS; ++step) {
    assert.equal(wasm.isaac_pgd_alt_transport_field(step, SCRATCH_A), 1);
    const native = {
      fieldOffset: readI32(view, SCRATCH_A + 0),
      elemCount: readI32(view, SCRATCH_A + 4),
      elemWidth: readI32(view, SCRATCH_A + 8),
      payloadBytes: readI32(view, SCRATCH_A + 12),
      bitpacked: readI32(view, SCRATCH_A + 16),
      callVa: readU32(view, SCRATCH_A + 20),
    };
    assert.deepEqual(native, pgdAltTransportField(step), `alt row ${step}`);
    // the immediate at the call site must equal count * width, computed here
    assert.equal(
      native.payloadBytes,
      native.elemCount * native.elemWidth,
      `alt row ${step} byte count`,
    );
    // bit-packed rows are exactly the byte-width rows
    assert.equal(native.bitpacked, native.elemWidth === 1 ? 1 : 0);
    seen.push(native.fieldOffset);
  }
  assert.equal(wasm.isaac_pgd_alt_transport_field(-1, SCRATCH_A), 0);
  assert.equal(wasm.isaac_pgd_alt_transport_field(8, SCRATCH_A), 0);
  assert.equal(pgdAltTransportField(8), null);

  // the cross-proof itself: this transport's independent numbers must agree
  // with the save reader's clamps for all five formerly-unidentified arrays
  const crossProved = [
    [PGD_OFF_SEC3_DWORDS, PGD_COUNT_SEC3, 4],
    [PGD_OFF_SEC5_BYTES, PGD_COUNT_SEC5, 1],
    [PGD_OFF_SEC8_DWORDS, PGD_COUNT_SEC8, 4],
  ];
  for (const [off, count, width] of crossProved) {
    const row = ALT_ROW(off);
    assert.ok(row, `alt transport must carry ${off.toString(16)}`);
    assert.equal(row.elemCount, count, `alt count for +0x${off.toString(16)}`);
    assert.equal(row.elemWidth, width, `alt width for +0x${off.toString(16)}`);
    const reader = pgdReaderSectionDesc(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].find(
        (id) => pgdReaderSectionDesc(id).fieldOffset === off,
      ),
    );
    assert.equal(row.elemCount, reader.storeBound, `store bound +0x${off.toString(16)}`);
    assert.equal(row.elemWidth, reader.elemWidth, `elem width +0x${off.toString(16)}`);
  }

  // negative result, asserted rather than assumed: sections 9 and 10 are NOT
  // carried by this transport at all
  assert.equal(wasm.isaac_pgd_alt_transport_covers(PGD_OFF_SEC9_DWORDS), 0);
  assert.equal(wasm.isaac_pgd_alt_transport_covers(PGD_OFF_SEC10_BYTES), 0);
  assert.equal(pgdAltTransportCovers(PGD_OFF_SEC9_DWORDS), 0);
  assert.equal(pgdAltTransportCovers(PGD_OFF_SEC10_BYTES), 0);
  assert.equal(wasm.isaac_pgd_alt_transport_covers(PGD_OFF_PRE_SECTION_WORD), 0);
  assert.equal(wasm.isaac_pgd_alt_transport_covers(PGD_OFF_SAVE_COUNTER), 0);
  assert.ok(!seen.includes(PGD_OFF_SEC9_DWORDS));
  assert.ok(!seen.includes(PGD_OFF_SEC10_BYTES));
  // ...while the bestiary map is carried without being a fixed-width row
  assert.equal(wasm.isaac_pgd_alt_transport_covers(PGD_OFF_BESTIARY), 1);
  assert.ok(!seen.includes(PGD_OFF_BESTIARY));
  for (const off of seen) {
    assert.equal(wasm.isaac_pgd_alt_transport_covers(off), 1);
    assert.equal(pgdAltTransportCovers(off), 1);
  }
  assert.equal(PGD_ALT_TRANSPORT_VA, 0x0091adf0);
  assert.equal(PGD_ALT_BITPACK_VA, 0x0091b650);
});

function ALT_ROW(off) {
  for (let s = 0; s < PGD_ALT_TRANSPORT_FIELDS; ++s) {
    const r = pgdAltTransportField(s);
    if (r.fieldOffset === off) return r;
  }
  return null;
}

test("Wasm matches JS: the bit-packed boolean codec", () => {
  // buffer sizing: one spare byte always, and one byte even for nothing
  assert.equal(wasm.isaac_pgd_bitpack_bytes(0), 1);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(1), 1);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(7), 1);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(8), 2);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(9), 2);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(15), 2);
  assert.equal(wasm.isaac_pgd_bitpack_bytes(16), 3);
  for (const n of [0, 1, 7, 8, 9, 63, 64, 0x282, 0x2dd]) {
    assert.equal(wasm.isaac_pgd_bitpack_bytes(n), pgdBitpackBytes(n));
    // PE truth: it is always strictly more than the tight size, never less
    assert.ok(
      wasm.isaac_pgd_bitpack_bytes(n) * 8 >= n,
      `packed buffer must hold ${n} bits`,
    );
    assert.ok(wasm.isaac_pgd_bitpack_bytes(n) >= 1);
  }

  const rng = makeRng(0x51a3c7d1);
  const counts = [0, 1, 7, 8, 9, 16, 17, PGD_COUNT_SEC5, 0x50, 0x68, 0x2e];
  for (let i = 0; i < 40; ++i) counts.push(pick(rng, 200));
  let covered = new Set();
  for (const n of counts) {
    const nbytes = pgdBitpackBytes(n);
    const packed = [];
    for (let b = 0; b < nbytes; ++b) {
      const v = rng() & 0xff;
      packed.push(v);
      bytes[SCRATCH_B + b] = v;
    }
    const js = pgdBitpackUnpack(packed, n);
    assert.equal(js.length, n);
    assert.equal(
      wasm.isaac_pgd_bitpack_unpack(SCRATCH_B, n, SCRATCH_C) >>> 0,
      n,
      `unpack returns ${n}`,
    );
    for (let i2 = 0; i2 < n; ++i2) {
      assert.equal(bytes[SCRATCH_C + i2], js[i2], `bit ${i2} of ${n}`);
      assert.equal(
        wasm.isaac_pgd_bitpack_bit(SCRATCH_B, n, i2),
        js[i2],
        `single bit ${i2} of ${n}`,
      );
      covered.add(js[i2]);
      // PE truth: the mask starts at the low bit and walks up, so entry i is
      // bit (i mod 8) of byte floor(i/8) — derived here, not from the model
      const expect = (packed[Math.floor(i2 / 8)] >> (i2 % 8)) & 1;
      assert.equal(js[i2], expect, `LSB-first layout at ${i2}`);
    }
    // out of range is always zero, both sides
    assert.equal(wasm.isaac_pgd_bitpack_bit(SCRATCH_B, n, n), 0);
    assert.equal(pgdBitpackBit(packed, n, n), 0);
  }
  // the corpus must actually have produced both bit values
  assert.deepEqual([...covered].sort(), [0, 1]);
  // null handling
  assert.equal(wasm.isaac_pgd_bitpack_bit(0, 8, 0), 0);
  assert.equal(wasm.isaac_pgd_bitpack_unpack(0, 8, SCRATCH_C) >>> 0, 0);
  assert.equal(wasm.isaac_pgd_bitpack_unpack(SCRATCH_B, 0, SCRATCH_C) >>> 0, 0);
});

test("v3: pgd+0x02 gates the whole notify routine, and Clear is its only store", () => {
  // gate 1 stops everything, including the routine's own logging
  assert.equal(wasm.isaac_pgd_notify_logs(0), 0);
  assert.equal(wasm.isaac_pgd_notify_dispatches(0, 1), 0);
  assert.equal(pgdNotifyDispatches(0, 1), 0);
  for (const f of [1, 2, 0x7f, 0x80, 0xff]) {
    assert.equal(wasm.isaac_pgd_notify_logs(f), 1, `flag ${f}`);
    assert.equal(pgdNotifyLogs(f), 1);
  }
  // it is a BYTE test on a 4-byte slot: 0x100 is a clear byte
  assert.equal(wasm.isaac_pgd_notify_logs(0x100), 0);
  assert.equal(pgdNotifyLogs(0x100), 0);
  assert.equal(wasm.isaac_pgd_notify_logs(0x101), 1);
  // gate 2 is a LOW-BIT test, not a non-zero test: 2 enables nothing
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 0), 0);
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 1), 1);
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 2), 0);
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 3), 1);
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 0xff), 1);
  assert.equal(wasm.isaac_pgd_notify_dispatches(1, 0x100), 0);
  assert.equal(pgdNotifyDispatches(1, 2), 0);
  assert.equal(pgdNotifyDispatches(1, 3), 1);
  // exhaustive over both bytes: dispatch implies log, never the other way
  for (let f = 0; f <= 0xff; ++f) {
    for (const g of [0, 1, 2, 3, 0x80, 0xff]) {
      const d = wasm.isaac_pgd_notify_dispatches(f, g);
      assert.equal(d, pgdNotifyDispatches(f, g), `notify ${f}/${g}`);
      if (d) assert.equal(wasm.isaac_pgd_notify_logs(f), 1);
    }
  }
  // Clear is the single store, and it stores 1
  assert.equal(PGD_FLAG_02_STORES_IN_CLUSTER, 1);
  assert.equal(PGD_FLAG_02_LOADS_IN_CLUSTER, 3);
  assert.equal(PGD_CLEAR_FLAG_02_VALUE, 1);
  assert.equal(PGD_CLEAR_VA, 0x009262b0);
  assert.equal(PGD_NOTIFY_VA, 0x00929790);
  assert.equal(PGD_NOTIFY_ENABLE_GLOBAL_VA, 0x00c5ab08);
  assert.equal(PGD_NOTIFY_ENABLE_MASK, 1);
  // The flag's default after Clear is "enabled", so TryUnlock's own pre-test
  // at 0x00929a61 passes on a fresh object — but only on the path where the
  // probe at 0x00929a58 did NOT return non-zero, because `jne` at 0x00929a5f
  // jumps over the +0x02 test entirely.
  assert.equal(pgdNotifyLogs(PGD_CLEAR_FLAG_02_VALUE), 1);
  assert.equal(
    wasm.isaac_pgd_try_unlock_steam_leg(PGD_CLEAR_FLAG_02_VALUE, 0),
    1,
  );
  assert.equal(
    wasm.isaac_pgd_try_unlock_steam_leg(PGD_CLEAR_FLAG_02_VALUE, 1),
    0,
  );
  // and TryUnlock's gate is the same predicate the callee applies to itself,
  // which is why the pre-test is redundant rather than an extra condition
  for (const f of [0, 1, 0x80, 0xff, 0x100]) {
    assert.equal(
      wasm.isaac_pgd_try_unlock_steam_leg(f, 0),
      wasm.isaac_pgd_notify_logs(f),
      `TryUnlock pre-test must equal the callee's own gate for ${f}`,
    );
  }
});

test("v3: identification status is explicit, and the pre-section word has no consumer", () => {
  // the three arrays an exact-signature accessor names
  for (const off of [
    PGD_OFF_ACHIEVEMENTS,
    PGD_OFF_EVENT_COUNTERS,
    PGD_OFF_ITEM_COLLECTION,
    PGD_OFF_BOSSES,
    PGD_OFF_CHALLENGES,
  ]) {
    assert.equal(wasm.isaac_pgd_field_status(off), PGD_FIELD_NAMED, `named ${off}`);
    assert.equal(pgdFieldStatus(off), PGD_FIELD_NAMED);
  }
  // the five v1 left unidentified stay unidentified — layout only
  const layoutOnly = [
    [PGD_OFF_SEC3_DWORDS, PGD_REPR_RAW_DWORD],
    [PGD_OFF_SEC5_BYTES, PGD_REPR_BOOL_BYTE],
    [PGD_OFF_SEC8_DWORDS, PGD_REPR_RAW_DWORD],
    [PGD_OFF_SEC9_DWORDS, PGD_REPR_RAW_DWORD],
    [PGD_OFF_SEC10_BYTES, PGD_REPR_BOOL_BYTE],
    [PGD_OFF_PRE_SECTION_WORD, PGD_REPR_RAW_DWORD],
  ];
  for (const [off, repr] of layoutOnly) {
    assert.equal(
      wasm.isaac_pgd_field_status(off),
      PGD_FIELD_LAYOUT_ONLY,
      `+0x${off.toString(16)} must stay LAYOUT_ONLY`,
    );
    assert.equal(pgdFieldStatus(off), PGD_FIELD_LAYOUT_ONLY);
    assert.equal(wasm.isaac_pgd_field_repr(off), repr, `repr +0x${off.toString(16)}`);
    assert.equal(pgdFieldRepr(off), repr);
  }
  assert.equal(wasm.isaac_pgd_field_status(0x1234), PGD_FIELD_UNKNOWN_OFFSET);
  assert.equal(wasm.isaac_pgd_field_repr(0x1234), PGD_REPR_NONE);
  assert.equal(pgdFieldRepr(0x1234), PGD_REPR_NONE);

  // the representation verdict must agree with the reader's own store shape
  for (let id = 1; id <= 10; ++id) {
    const d = pgdReaderSectionDesc(id);
    const repr = wasm.isaac_pgd_field_repr(d.fieldOffset);
    assert.equal(
      repr,
      d.elemWidth === 1 ? PGD_REPR_BOOL_BYTE : PGD_REPR_RAW_DWORD,
      `repr must follow the store width for section ${id}`,
    );
    assert.equal(
      wasm.isaac_pgd_reader_store_normalizes(d.elemWidth) === 1,
      repr === PGD_REPR_BOOL_BYTE,
      `normalisation must follow the representation for section ${id}`,
    );
  }

  // negative result, pinned: nothing consumes the pre-section word
  assert.equal(wasm.isaac_pgd_pre_section_word_accessor_count(), 0);
  assert.equal(pgdPreSectionWordAccessorCount(), 0);
  assert.equal(PGD_PRE_SECTION_WORD_ACCESSORS, 0);
  assert.equal(PGD_PRE_SECTION_WORD_SITES, 5);
  assert.equal(PGD_PRE_SECTION_WORD_SITE_VAS.length, PGD_PRE_SECTION_WORD_SITES);
  assert.deepEqual(PGD_PRE_SECTION_WORD_SITE_VAS, [
    0x009262bc, 0x00927091, 0x009282ff, 0x009291fc, 0x00929202,
  ]);
  // the read site is the one inside the deserializer prologue
  assert.ok(PGD_PRE_SECTION_WORD_SITE_VAS.includes(0x00927091));
});

test("Wasm matches JS: v3 loop shape over a boundary-biased corpus", () => {
  const rng = makeRng(0x0092b3c7);
  const counts = [
    0, 1, 2, 3, 4, 7, 8, 0xe, 0x1b, 0x50, 0x282,
    0x7fffffff, 0x80000000, 0x80000001, 0xfffffffe, 0xffffffff,
  ];
  const caps = [
    0, 1, 2, 3, 4, 5, 7, 8, 0x1c, 0x38, 0x6c, 0x140, 0x282,
    0x7fffffff, 0x80000000, 0xfffffffc, 0xfffffffd, 0xfffffffe, 0xffffffff,
  ];
  for (let i = 0; i < 60; ++i) {
    counts.push(pick(rng, 0x10000));
    caps.push(pick(rng, 0x10000));
    counts.push(rng() >>> 0);
    caps.push(rng() >>> 0);
  }
  const bounds = [0, 1, 2, 0xe, 0x1b, 0x50, 0x282, 0xffffffff];
  let enteredSeen = new Set();
  let clampedSeen = new Set();
  for (const n of counts) {
    assert.equal(
      wasm.isaac_pgd_reader_count_enters_loop(n | 0),
      pgdReaderCountEntersLoop(n),
      `enters ${n >>> 0}`,
    );
    enteredSeen.add(pgdReaderCountEntersLoop(n));
    for (const cap of caps) {
      for (const width of [1, 4]) {
        const jsConsumed = pgdReaderElementsConsumed(n, cap, width);
        assert.equal(
          wasm.isaac_pgd_reader_elements_consumed(n | 0, cap | 0, width) >>> 0,
          jsConsumed,
          `consumed n=${n >>> 0} cap=${cap >>> 0} w=${width}`,
        );
        // PE truth: consumption can never exceed the declared count, and can
        // never exceed what the cap allows for that width
        assert.ok(jsConsumed <= (n >>> 0), `consumed <= count`);
        if (jsConsumed > 0) {
          assert.equal(wasm.isaac_pgd_reader_count_enters_loop(n | 0), 1);
          // the last consumed element's cursor must still be below the cap
          const lastCursor = (jsConsumed - 1) * width;
          if (lastCursor < 0x100000000) {
            assert.ok(
              lastCursor >>> 0 < (cap >>> 0) || lastCursor >= 0x100000000,
              `last cursor ${lastCursor} below cap ${cap >>> 0}`,
            );
          }
        }
      }
    }
    for (const cap of [0, 4, 0x38, 0x140, 0xffffffff]) {
      for (const width of [1, 4]) {
        for (const bound of bounds) {
          const jsStored = pgdReaderElementsStored(n, cap, width, bound);
          assert.equal(
            wasm.isaac_pgd_reader_elements_stored(n | 0, cap | 0, width, bound | 0) >>> 0,
            jsStored,
            `stored n=${n >>> 0} cap=${cap >>> 0} w=${width} b=${bound >>> 0}`,
          );
          assert.ok(jsStored <= pgdReaderElementsConsumed(n, cap, width));
          assert.ok(jsStored <= (bound >>> 0));
          clampedSeen.add(jsStored === (bound >>> 0) ? "at-bound" : "under");
        }
      }
    }
  }
  // the corpus must actually have exercised both sides of both decisions
  assert.deepEqual([...enteredSeen].sort(), [0, 1]);
  assert.deepEqual([...clampedSeen].sort(), ["at-bound", "under"]);

  // loop-back: unsigned, exhaustive over the interesting pairs
  const edge = [0, 1, 2, 0x7fffffff, 0x80000000, 0xfffffffe, 0xffffffff];
  for (const a of edge) {
    for (const b of edge) {
      assert.equal(
        wasm.isaac_pgd_reader_loop_back(a | 0, b | 0),
        pgdReaderLoopBack(a, b),
        `loop back ${a >>> 0} < ${b >>> 0}`,
      );
    }
  }
  // PE truth: `sub x,x` clears CF, so an index equal to the count never loops
  for (const a of edge) assert.equal(wasm.isaac_pgd_reader_loop_back(a | 0, a | 0), 0);
});

test("Wasm matches JS: v3 store offsets over a boundary-biased corpus", () => {
  const rng = makeRng(0x00dc8e00);
  const fields = [
    PGD_OFF_SEC3_DWORDS, PGD_OFF_SEC5_BYTES, PGD_OFF_SEC8_DWORDS,
    PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES, 0, 4,
  ];
  const indices = [0, 1, 2, 0xd, 0xe, 0x1a, 0x1b, 0x4f, 0x50,
    0x3fffffff, 0x40000000, 0x7fffffff, 0x80000000, 0xffffffff];
  for (let i = 0; i < 40; ++i) indices.push(pick(rng, 0x200));
  const boundsList = [0, 1, 2, 0xe, 0x1b, 0x50, 0xffffffff];
  let storedSeen = new Set();
  for (const f of fields) {
    for (const idx of indices) {
      for (const width of [1, 4, 2]) {
        for (const bound of boundsList) {
          const js = pgdReaderStoreOffset(f, idx, width, bound);
          assert.equal(
            wasm.isaac_pgd_reader_store_offset(f, idx | 0, width, bound | 0),
            js,
            `offset f=${f} i=${idx >>> 0} w=${width} b=${bound >>> 0}`,
          );
          storedSeen.add(js === -1 ? "skipped" : "stored");
        }
      }
    }
  }
  assert.deepEqual([...storedSeen].sort(), ["skipped", "stored"]);
  // PE truth: within a real section every stored element lands inside it
  for (const [f, count, width] of [
    [PGD_OFF_SEC3_DWORDS, PGD_COUNT_SEC3, 4],
    [PGD_OFF_SEC5_BYTES, PGD_COUNT_SEC5, 1],
    [PGD_OFF_SEC8_DWORDS, PGD_COUNT_SEC8, 4],
    [PGD_OFF_SEC9_DWORDS, PGD_COUNT_SEC9, 4],
    [PGD_OFF_SEC10_BYTES, PGD_COUNT_SEC10, 1],
  ]) {
    for (let i = 0; i < count; ++i) {
      const at = wasm.isaac_pgd_reader_store_offset(f, i, width, count);
      assert.equal(at, f + i * width);
      assert.ok(at >= f && at + width <= f + count * width, `in range ${f}+${i}`);
    }
    assert.equal(wasm.isaac_pgd_reader_store_offset(f, count, width, count), -1);
  }
});

/* ==========================================================================
   v4 — the two restore index remaps and the loops that drive them.
   ========================================================================== */

test("PE truth: both remaps take the default arm for 0 and everything negative", () => {
  /* `dec ecx ; cmp ecx, BOUND ; ja default`. The decrement happens BEFORE the
     unsigned compare, so argument 0 becomes 0xffffffff and leaves through the
     same door as the negatives and the past-the-end values. A model that
     tested `index > BOUND` before decrementing would let 0 through. */
  for (const bad of [0, -1, -2, -0x80000000, 0x7fffffff]) {
    assert.equal(wasm.isaac_pgd_sec3_restore_remap(bad | 0), 0, `sec3 ${bad}`);
    assert.equal(wasm.isaac_pgd_event_restore_remap(bad | 0), 0, `event ${bad}`);
    assert.equal(pgdSec3RestoreRemap(bad), 0);
    assert.equal(pgdEventRestoreRemap(bad), 0);
  }
  /* One past the last real input. Both C++ tables carry a guard entry there
     holding a value neither law produces, so a widened window returns the
     guard instead of reading out of bounds — an off-by-one is an observable
     wrong answer rather than undefined behaviour. */
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(PGD_SEC3_REMAP_MAX_INPUT + 1), 0);
  assert.equal(wasm.isaac_pgd_event_restore_remap(PGD_EVENT_REMAP_MAX_INPUT + 1), 0);
  for (let i = -200; i <= 300; ++i) {
    assert.notEqual(
      wasm.isaac_pgd_sec3_restore_remap(i),
      PGD_REMAP_GUARD_VALUE,
      `sec3 argument ${i} must never reach the guard entry`,
    );
    assert.notEqual(
      wasm.isaac_pgd_event_restore_remap(i),
      PGD_REMAP_GUARD_VALUE,
      `event argument ${i} must never reach the guard entry`,
    );
  }
  // ...and the last real input is NOT rejected
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(PGD_SEC3_REMAP_MAX_INPUT), 11);
  assert.equal(wasm.isaac_pgd_event_restore_remap(PGD_EVENT_REMAP_MAX_INPUT), 113);
  // the bound in the header is the post-decrement one, i.e. entries - 1
  assert.equal(PGD_SEC3_REMAP_BOUND, PGD_SEC3_REMAP_ENTRIES - 1);
  assert.equal(PGD_EVENT_REMAP_BOUND, PGD_EVENT_REMAP_ENTRIES - 1);
  assert.equal(PGD_SEC3_REMAP_MAX_INPUT, PGD_SEC3_REMAP_ENTRIES);
  assert.equal(PGD_EVENT_REMAP_MAX_INPUT, PGD_EVENT_REMAP_ENTRIES);
});

test("Wasm matches JS: both remap laws over their whole domain and beyond", () => {
  /* The C++ is a literal transcription of the two jump tables; the JS oracle
     is written from the SHAPE of each mapping. A single mis-transcribed entry
     therefore shows up here rather than agreeing quietly. */
  let sec3Nonzero = 0;
  for (let i = -40; i <= 80; ++i) {
    const js = pgdSec3RestoreRemap(i);
    assert.equal(wasm.isaac_pgd_sec3_restore_remap(i), js, `sec3 remap ${i}`);
    if (js !== 0) sec3Nonzero += 1;
  }
  // 1..11 minus the one that routes to the default arm
  assert.equal(sec3Nonzero, 10);

  const seen = new Set();
  for (let i = -40; i <= 200; ++i) {
    const js = pgdEventRestoreRemap(i);
    assert.equal(wasm.isaac_pgd_event_restore_remap(i), js, `event remap ${i}`);
    if (i >= 1 && i <= PGD_EVENT_REMAP_MAX_INPUT) seen.add(js);
  }
  // PE truth: the event law is injective and strictly increasing on its window
  assert.equal(seen.size, PGD_EVENT_REMAP_MAX_INPUT);
  for (let i = 1; i < PGD_EVENT_REMAP_MAX_INPUT; ++i) {
    assert.ok(
      wasm.isaac_pgd_event_restore_remap(i) <
        wasm.isaac_pgd_event_restore_remap(i + 1),
      `event law must strictly increase at ${i}`,
    );
  }
  assert.equal(wasm.isaac_pgd_event_restore_remap(PGD_EVENT_REMAP_MAX_INPUT),
    PGD_EVENT_REMAP_MAX_SLOT);
  // ...and never lands on 0, so nothing collides with the default arm
  for (let i = 1; i <= PGD_EVENT_REMAP_MAX_INPUT; ++i) {
    assert.ok(wasm.isaac_pgd_event_restore_remap(i) > 0, `event ${i} > 0`);
  }

  /* Structure of the sec3 law, asserted rather than read off the table: it is
     the identity everywhere in its window except at exactly two inputs. */
  const irregular = [];
  for (let i = 1; i <= PGD_SEC3_REMAP_MAX_INPUT; ++i) {
    if (wasm.isaac_pgd_sec3_restore_remap(i) !== i) irregular.push(i);
  }
  assert.deepEqual(irregular, [9, 10]);
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(9), 10);
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(10), 0);
  // slot 9 is produced by nothing at all
  for (let i = -40; i <= 80; ++i) {
    assert.notEqual(wasm.isaac_pgd_sec3_restore_remap(i), 9, `slot 9 from ${i}`);
  }
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(PGD_SEC3_REMAP_MAX_INPUT),
    PGD_SEC3_REMAP_MAX_SLOT);
});

test("PE truth: the sec3 restore loop loses source[0] to source[10]", () => {
  /* ORIGINAL DEFECT, reproduced. The table entry for input 10 points at the
     same arm as the default, so iterations 0 and 10 both target slot 0. Both
     stores are unconditional and the counter only ascends, so the later one
     wins and the earlier value is gone. */
  assert.equal(wasm.isaac_pgd_sec3_restore_slot(0), 0);
  assert.equal(wasm.isaac_pgd_sec3_restore_slot(10), 0);
  assert.equal(wasm.isaac_pgd_sec3_restore_writers(0), 2);
  assert.equal(
    wasm.isaac_pgd_sec3_restore_winning_iteration(0),
    PGD_SEC3_RESTORE_ALIAS_WINNER,
  );
  assert.notEqual(
    wasm.isaac_pgd_sec3_restore_winning_iteration(0),
    PGD_SEC3_RESTORE_ALIAS_LOSER,
  );
  assert.equal(PGD_SEC3_RESTORE_ALIAS_WINNER, 10);
  assert.equal(PGD_SEC3_RESTORE_ALIAS_LOSER, 0);
  assert.equal(PGD_SEC3_RESTORE_ALIASED_SLOT, 0);

  // exactly one aliased slot in this loop, and none anywhere in the other
  let aliased = 0;
  for (let s = 0; s <= PGD_SEC3_REMAP_MAX_SLOT; ++s) {
    const n = wasm.isaac_pgd_sec3_restore_writers(s);
    assert.equal(n, pgdSec3RestoreWriters(s), `sec3 writers ${s}`);
    assert.ok(n <= 2, `sec3 slot ${s} writers`);
    if (n > 1) aliased += 1;
  }
  assert.equal(aliased, PGD_SEC3_RESTORE_ALIASED_SLOTS);
  assert.equal(aliased, 1);

  let evAliased = 0;
  for (let s = 0; s <= PGD_EVENT_REMAP_MAX_SLOT; ++s) {
    const n = wasm.isaac_pgd_event_restore_writers(s);
    assert.equal(n, pgdEventRestoreWriters(s), `event writers ${s}`);
    assert.ok(n <= 1, `event slot ${s} must have at most one writer`);
    if (n > 1) evAliased += 1;
    // every written slot's winner is its only writer
    if (n === 1) {
      const w = wasm.isaac_pgd_event_restore_winning_iteration(s);
      assert.equal(wasm.isaac_pgd_event_restore_slot(w), s);
    }
  }
  assert.equal(evAliased, PGD_EVENT_RESTORE_ALIASED_SLOTS);
  assert.equal(evAliased, 0);
});

test("PE truth: slots 9, 12 and 13 of the +0xdc8 array are never restored", () => {
  const unwritten = [];
  for (let s = 0; s < PGD_COUNT_SEC3; ++s) {
    const w = wasm.isaac_pgd_sec3_restore_slot_written(s);
    assert.equal(w, pgdSec3RestoreSlotWritten(s), `sec3 written ${s}`);
    if (!w) unwritten.push(s);
  }
  assert.deepEqual(unwritten, [9, 12, 13]);
  assert.equal(unwritten.length, PGD_SEC3_RESTORE_SLOTS_UNWRITTEN);
  for (const s of unwritten) {
    assert.equal(wasm.isaac_pgd_sec3_restore_winning_iteration(s), -1);
    assert.equal(wasm.isaac_pgd_sec3_restore_writers(s), 0);
  }
  // the loop runs 12 times and the array has 14 slots, so at least two must
  // go unwritten even before the aliasing is counted; the aliasing makes three
  assert.equal(PGD_SEC3_RESTORE_ITERATIONS, 0xc);
  assert.equal(
    PGD_COUNT_SEC3 - PGD_SEC3_RESTORE_ITERATIONS + PGD_SEC3_RESTORE_ALIASED_SLOTS,
    unwritten.length,
  );

  // the event loop's holes below its own maximum slot
  const evUnwritten = [];
  for (let s = 0; s <= PGD_EVENT_REMAP_MAX_SLOT; ++s) {
    if (!wasm.isaac_pgd_event_restore_slot_written(s)) evUnwritten.push(s);
  }
  assert.deepEqual(evUnwritten, [
    4, 38, 39, 40, 52, 53, 54, 66, 67, 68, 80, 81, 82,
    94, 95, 96, 108, 109, 110,
  ]);
  assert.equal(evUnwritten.length, PGD_EVENT_RESTORE_SLOTS_UNWRITTEN_BELOW_MAX);
  // and everything from 114 up to the array's real length is untouched too
  for (const s of [114, 188, 300, 496, PGD_COUNT_EVENT_COUNTERS - 1]) {
    assert.equal(wasm.isaac_pgd_event_restore_slot_written(s), 0, `event ${s}`);
  }
  // PE truth: the two event counters the v2 popcount gate uses are outside
  // the restore window entirely, so this path cannot disturb them
  assert.ok(PGD_MASK41_LO_COUNTER_INDEX > PGD_EVENT_REMAP_MAX_SLOT);
  assert.ok(PGD_MASK41_HI_COUNTER_INDEX > PGD_EVENT_REMAP_MAX_SLOT);
});

test("Wasm matches JS: restore loop bounds, slots and store offsets", () => {
  // signed bounds in both loops
  for (const n of [-1, 0, 1, 0xb, 0xc, 0xd, 0x5e, 0x5f, 0x60,
                   0x7fffffff, -0x80000000]) {
    assert.equal(
      wasm.isaac_pgd_sec3_restore_loop_continue(n | 0),
      pgdSec3RestoreLoopContinue(n),
      `sec3 loop ${n}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_loop_continue(n | 0),
      pgdEventRestoreLoopContinue(n),
      `event loop ${n}`,
    );
  }
  // PE truth: `jl` is signed, so a negative counter keeps the loop alive where
  // an unsigned compare would end it
  assert.equal(wasm.isaac_pgd_sec3_restore_loop_continue(-1), 1);
  assert.equal(wasm.isaac_pgd_event_restore_loop_continue(-1), 1);
  assert.equal(wasm.isaac_pgd_sec3_restore_loop_continue(0xc), 0);
  assert.equal(wasm.isaac_pgd_event_restore_loop_continue(0x5f), 0);

  const slotsSeen = new Set();
  for (let i = -5; i <= 0x70; ++i) {
    const s3 = pgdSec3RestoreSlot(i);
    const ev = pgdEventRestoreSlot(i);
    assert.equal(wasm.isaac_pgd_sec3_restore_slot(i), s3, `sec3 slot ${i}`);
    assert.equal(wasm.isaac_pgd_event_restore_slot(i), ev, `event slot ${i}`);
    assert.equal(
      wasm.isaac_pgd_sec3_restore_store_offset(i),
      pgdSec3RestoreStoreOffset(i),
      `sec3 offset ${i}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_store_offset(i),
      pgdEventRestoreStoreOffset(i),
      `event offset ${i}`,
    );
    slotsSeen.add(s3 === -1 ? "outside" : "inside");
    // in-range stores must land inside the array they claim to target
    if (s3 >= 0) {
      const at = wasm.isaac_pgd_sec3_restore_store_offset(i);
      assert.equal(at, PGD_OFF_SEC3_DWORDS + s3 * 4);
      assert.ok(at >= PGD_OFF_SEC3_DWORDS);
      assert.ok(at + 4 <= PGD_OFF_SEC3_DWORDS + PGD_COUNT_SEC3 * 4);
    }
    if (ev >= 0) {
      const at = wasm.isaac_pgd_event_restore_store_offset(i);
      assert.equal(at, PGD_OFF_EVENT_COUNTERS + ev * 4);
      assert.ok(at >= PGD_OFF_EVENT_COUNTERS);
      assert.ok(at + 4 <= PGD_OFF_EVENT_COUNTERS + PGD_COUNT_EVENT_COUNTERS * 4);
    }
  }
  assert.deepEqual([...slotsSeen].sort(), ["inside", "outside"]);
  // the very first sec3 store and the very last one
  assert.equal(wasm.isaac_pgd_sec3_restore_store_offset(0), PGD_OFF_SEC3_DWORDS);
  assert.equal(
    wasm.isaac_pgd_sec3_restore_store_offset(11),
    PGD_OFF_SEC3_DWORDS + 11 * 4,
  );
  assert.equal(wasm.isaac_pgd_sec3_restore_store_offset(12), -1);
  assert.equal(wasm.isaac_pgd_event_restore_store_offset(0x5f), -1);
});

test("v4: the remap call-site census, and no identification verdict moved", () => {
  // whole-.text rel32 census: one call site each, both inside 0x0092b346
  assert.equal(PGD_SEC3_REMAP_CALL_SITES, 1);
  assert.equal(PGD_EVENT_REMAP_CALL_SITES, 1);
  assert.equal(PGD_SEC3_REMAP_VA, 0x009e4f80);
  assert.equal(PGD_EVENT_REMAP_VA, 0x009e3ea0);
  assert.equal(PGD_SEC3_REMAP_TABLE_VA, 0x009e4fcc);
  assert.equal(PGD_EVENT_REMAP_TABLE_VA, 0x009e40e8);
  assert.equal(PGD_BULK_RESTORE_VA, 0x0092b346);

  /* A remap law is evidence about INDEXING, not about what a slot means.
     Regression guard: v4 must not have upgraded any verdict. */
  for (const off of [
    PGD_OFF_SEC3_DWORDS,
    PGD_OFF_SEC5_BYTES,
    PGD_OFF_SEC8_DWORDS,
    PGD_OFF_SEC9_DWORDS,
    PGD_OFF_SEC10_BYTES,
    PGD_OFF_PRE_SECTION_WORD,
  ]) {
    assert.equal(
      wasm.isaac_pgd_field_status(off),
      PGD_FIELD_LAYOUT_ONLY,
      `+0x${off.toString(16)} must still be LAYOUT_ONLY after v4`,
    );
  }
  // the event counter array keeps its NAMED status, which the remap did not
  // grant it — IncreaseEventCounter did, back at v1
  assert.equal(
    wasm.isaac_pgd_field_status(PGD_OFF_EVENT_COUNTERS),
    PGD_FIELD_NAMED,
  );
  // and pgd+0x02 stays behaviour-promoted with no name
  assert.equal(wasm.isaac_pgd_notify_logs(1), 1);
  assert.equal(PGD_FLAG_02_STORES_IN_CLUSTER, 1);
});

/* ==========================================================================
   v5 — re-proving the v4 remap land: randomized high-bit differential,
   an end-to-end caller-loop simulation in Wasm memory, and the toolchain
   guard. No law changed; see section-notes/pgd-v5/NOTES.md for the
   arm-by-arm re-read and the mutation verdicts.
   ========================================================================== */

test("Wasm matches JS: v5 randomized high-bit differential over both remaps and the loop predicates", () => {
  const rng = makeRng(0x5e3ea04f);
  /* Fixed edges: the alias pair 0/10, the last and one-past-the-last inputs
     of both laws (11/12, 94/95), both bounds 0x5d/0xa and their neighbours,
     values past both bounds (0xa5/0xa6), and the wide words the window
     predicate must route to the default arm. */
  const edges = [
    0, 1, 2, 3, 4, 8, 9, 10, 11, 12, 13,
    0x5c, 0x5d, 0x5e, 0x5f, 0x60,
    0xa, 0xb, 0xc, 0xd,
    0xa5, 0xa6,
    0x40000000, 0x7fffffff, 0x80000000, 0xffffffff,
    -0x80000000, -0x7fffffff, -2, -1,
  ];
  const indices = [...edges];
  for (let i = 0; i < 3000; ++i) indices.push(rng() | 0);          // full uint32 range
  for (let i = 0; i < 300; ++i) indices.push((0x5d + pick(rng, 8) - 4) | 0); // around the event bound
  for (let i = 0; i < 300; ++i) indices.push((0xa + pick(rng, 8) - 4) | 0);  // around the sec3 bound
  for (let i = 0; i < 300; ++i) indices.push((pick(rng, 0x100) - 0x80) | 0); // small negatives too

  let sec3In = 0, sec3Out = 0, evIn = 0, evOut = 0;
  for (const raw of indices) {
    const i = raw | 0;
    assert.equal(
      wasm.isaac_pgd_sec3_restore_remap(i),
      pgdSec3RestoreRemap(i),
      `sec3 remap ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_remap(i),
      pgdEventRestoreRemap(i),
      `event remap ${raw >>> 0}`,
    );
    if (i >= 1 && i <= PGD_SEC3_REMAP_MAX_INPUT) sec3In += 1;
    else sec3Out += 1;
    if (i >= 1 && i <= PGD_EVENT_REMAP_MAX_INPUT) evIn += 1;
    else evOut += 1;
    assert.equal(
      wasm.isaac_pgd_sec3_restore_loop_continue(i),
      pgdSec3RestoreLoopContinue(i),
      `sec3 loop ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_loop_continue(i),
      pgdEventRestoreLoopContinue(i),
      `event loop ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_sec3_restore_slot(i),
      pgdSec3RestoreSlot(i),
      `sec3 slot ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_slot(i),
      pgdEventRestoreSlot(i),
      `event slot ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_sec3_restore_store_offset(i),
      pgdSec3RestoreStoreOffset(i),
      `sec3 offset ${raw >>> 0}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_store_offset(i),
      pgdEventRestoreStoreOffset(i),
      `event offset ${raw >>> 0}`,
    );
    /* Neither law may ever produce the guard value the C++ tables carry one
       entry past the end (an off-by-one window would return it). */
    assert.notEqual(
      wasm.isaac_pgd_sec3_restore_remap(i),
      PGD_REMAP_GUARD_VALUE,
      `sec3 guard at ${raw >>> 0}`,
    );
    assert.notEqual(
      wasm.isaac_pgd_event_restore_remap(i),
      PGD_REMAP_GUARD_VALUE,
      `event guard at ${raw >>> 0}`,
    );
  }
  /* Random corpus must actually cover both sides of each window. */
  assert.ok(sec3In > 0 && sec3Out > 0, "sec3 corpus must cover both sides of the window");
  assert.ok(evIn > 0 && evOut > 0, "event corpus must cover both sides of the window");

  /* Slot-side predicates over every slot, including out-of-array ones. */
  for (let s = -3; s <= PGD_COUNT_SEC3 + 2; ++s) {
    assert.equal(wasm.isaac_pgd_sec3_restore_writers(s), pgdSec3RestoreWriters(s), `sec3 writers ${s}`);
    assert.equal(
      wasm.isaac_pgd_sec3_restore_winning_iteration(s),
      pgdSec3RestoreWinningIteration(s),
      `sec3 winner ${s}`,
    );
    assert.equal(
      wasm.isaac_pgd_sec3_restore_slot_written(s),
      pgdSec3RestoreSlotWritten(s),
      `sec3 written ${s}`,
    );
  }
  for (let s = -3; s <= PGD_EVENT_REMAP_MAX_SLOT + 5; ++s) {
    assert.equal(wasm.isaac_pgd_event_restore_writers(s), pgdEventRestoreWriters(s), `event writers ${s}`);
    assert.equal(
      wasm.isaac_pgd_event_restore_winning_iteration(s),
      pgdEventRestoreWinningIteration(s),
      `event winner ${s}`,
    );
    assert.equal(
      wasm.isaac_pgd_event_restore_slot_written(s),
      pgdEventRestoreSlotWritten(s),
      `event written ${s}`,
    );
  }
  /* The alias pair is part of the corpus by construction and is pinned here
     independently of the random draws. */
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(10), 0);
  assert.equal(wasm.isaac_pgd_sec3_restore_remap(0), 0);
  assert.equal(wasm.isaac_pgd_sec3_restore_writers(0), 2);
});

test("PE truth: v5 caller-loop simulation — the stores physically happen in Wasm memory", () => {
  /* Run both caller loops the way 0x0092b346 runs them: ascending i, one
     unconditional dword store per iteration at `object + slot*4 + base`,
     slot from the remap. The object is a scratch region, not a real PGD, so
     the only thing under test is the composition of the exports — but the
     memory result is exactly what the shipped loop leaves behind. */
  const BASE = SCRATCH_A;
  const SENTINEL = 0xfeedface;
  const sec3Dst = PGD_OFF_SEC3_DWORDS;
  const evDst = PGD_OFF_EVENT_COUNTERS;

  const expectedSec3 = (src) => {
    const dst = new Array(PGD_COUNT_SEC3).fill(SENTINEL);
    for (let i = 0; i < PGD_SEC3_RESTORE_ITERATIONS; ++i) {
      dst[pgdSec3RestoreRemap(i)] = src[i];
    }
    return dst;
  };
  const expectedEvent = (src) => {
    const dst = new Array(PGD_COUNT_EVENT_COUNTERS).fill(SENTINEL);
    for (let i = 0; i < PGD_EVENT_RESTORE_ITERATIONS; ++i) {
      dst[pgdEventRestoreRemap(i)] = src[i];
    }
    return dst;
  };

  const runSec3Loop = (src) => {
    for (let i = 0; i < PGD_SEC3_RESTORE_ITERATIONS; ++i) {
      const off = wasm.isaac_pgd_sec3_restore_store_offset(i);
      assert.equal(off, PGD_OFF_SEC3_DWORDS + wasm.isaac_pgd_sec3_restore_slot(i) * 4);
      view.setUint32(BASE + off, src[i], true);
    }
  };
  const runEventLoop = (src) => {
    for (let i = 0; i < PGD_EVENT_RESTORE_ITERATIONS; ++i) {
      const off = wasm.isaac_pgd_event_restore_store_offset(i);
      assert.equal(off, PGD_OFF_EVENT_COUNTERS + wasm.isaac_pgd_event_restore_slot(i) * 4);
      view.setUint32(BASE + off, src[i], true);
    }
  };
  const readDst = (base, count) => {
    const out = new Array(count);
    for (let s = 0; s < count; ++s) out[s] = view.getUint32(BASE + base + s * 4, true);
    return out;
  };
  const fillDst = (base, count) => {
    for (let s = 0; s < count; ++s) view.setUint32(BASE + base + s * 4, SENTINEL, true);
  };

  for (let trial = 0; trial < 25; ++trial) {
    const rng = makeRng(0x92b67000 + trial * 0x101);
    const src3 = [];
    for (let i = 0; i < PGD_SEC3_RESTORE_ITERATIONS; ++i) src3.push(rng());
    if (src3[0] === src3[10]) src3[10] = src3[10] ^ 1; // keep the alias observable

    fillDst(sec3Dst, PGD_COUNT_SEC3);
    runSec3Loop(src3);
    const got3 = readDst(sec3Dst, PGD_COUNT_SEC3);
    const want3 = expectedSec3(src3);
    assert.deepEqual(got3, want3, `sec3 trial ${trial}`);

    // PE truth spot checks on the memory itself
    assert.equal(got3[0], src3[10], "iteration 10's value survives in slot 0");
    assert.notEqual(got3[0], src3[0], "iteration 0's value is lost");
    assert.equal(got3[9], SENTINEL, "slot 9 is never written");
    assert.equal(got3[12], SENTINEL, "slot 12 is never written");
    assert.equal(got3[13], SENTINEL, "slot 13 is never written");
    assert.equal(got3[10], src3[9], "input 9 lands on slot 10");
    assert.equal(got3[11], src3[11], "input 11 lands on slot 11");
    // winners from the exports agree with the memory
    for (let s = 0; s < PGD_COUNT_SEC3; ++s) {
      const w = wasm.isaac_pgd_sec3_restore_winning_iteration(s);
      if (w >= 0) assert.equal(got3[s], src3[w], `sec3 slot ${s} winner`);
    }

    const srcE = [];
    for (let i = 0; i < PGD_EVENT_RESTORE_ITERATIONS; ++i) srcE.push(rng());
    fillDst(evDst, PGD_COUNT_EVENT_COUNTERS);
    runEventLoop(srcE);
    const gotE = readDst(evDst, PGD_COUNT_EVENT_COUNTERS);
    const wantE = expectedEvent(srcE);
    assert.deepEqual(gotE, wantE, `event trial ${trial}`);

    // PE truth spot checks on the memory itself
    assert.equal(gotE[0], srcE[0], "input 0 lands on slot 0");
    assert.equal(gotE[4], SENTINEL, "output 4 is a hole");
    assert.equal(gotE[38], SENTINEL, "38..40 are holes");
    assert.equal(gotE[39], SENTINEL);
    assert.equal(gotE[40], SENTINEL);
    assert.equal(gotE[113], srcE[94], "input 94 lands on the max slot");
    assert.equal(gotE[114], SENTINEL, "past the max slot nothing is written");
    assert.equal(gotE[PGD_MASK41_LO_COUNTER_INDEX], SENTINEL, "popcount gate counter untouched");
    assert.equal(gotE[PGD_MASK41_HI_COUNTER_INDEX], SENTINEL, "popcount gate counter untouched");
    for (let i = 0; i < PGD_EVENT_RESTORE_ITERATIONS; ++i) {
      const slot = pgdEventRestoreRemap(i);
      assert.equal(gotE[slot], srcE[i], `event iteration ${i}`);
    }
  }
});

/* ===== v6 PGDCOV: TryImportRebirthLocalSave restore coverage =====
 *
 * The 25 rows below are a raw transcription of
 * section-notes/pgd-v6/disasm-92b2e0-import-full.txt (llvm-objdump of the
 * shipped PE). Snapshot base: `sub esp,0x4f0` at 0x0092b5d5 -> ebp-0x4f0,
 * so a source displ (-X) reads snapshot offset 0x4f0-X. Dest offsets are
 * the store instruction's displacement. VAs are the first instruction of
 * each row's group. The two remap rows drive the v4 laws (0x009e3ea0 /
 * 0x009e4f80) for 0x5f / 0xc iterations. Values are raw hex so a wrong
 * PGD_OFF_* constant cannot be laundered through the model. */

const PGD_IMPORT_RECORD_SIZE = 28; /* IsaacPgdImportCopy: 7 x i32 */
const PGD_IMPORT_RECORD_OFF = {
  step: 0, kind: 4, src: 8, dst: 12, len: 16, va: 20, iterations: 24,
};

const PGDCOV_EXPECTED_ROWS = [
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x038, dst: 0x038, len: 0x0b3, va: 0x0092b5ed },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3fb, dst: 0xe07, len: 0x010, va: 0x0092b5fa },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x40b, dst: 0xe17, len: 0x010, va: 0x0092b614 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x41b, dst: 0xe27, len: 0x010, va: 0x0092b622 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x42b, dst: 0xe37, len: 0x008, va: 0x0092b631 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x433, dst: 0xe3f, len: 0x001, va: 0x0092b640 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x434, dst: 0xe6f, len: 0x010, va: 0x0092b64c },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x444, dst: 0xe7f, len: 0x004, va: 0x0092b653 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x448, dst: 0xe83, len: 0x001, va: 0x0092b65f },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x268, dst: 0xae8, len: 0x15b, va: 0x0092b665 },
  { kind: PGD_IMPORT_KIND_REMAP_EVENT, src: 0x0ec, dst: 0x2bc, len: 0x17c,
    va: 0x0092b670, iterations: PGD_EVENT_RESTORE_ITERATIONS },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x44c, dst: 0xea0, len: 0x010, va: 0x0092b69a },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x45c, dst: 0xeb0, len: 0x010, va: 0x0092b6a8 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x46c, dst: 0xec0, len: 0x010, va: 0x0092b6b6 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x47c, dst: 0xed0, len: 0x010, va: 0x0092b6c1 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x48c, dst: 0xee0, len: 0x010, va: 0x0092b6cc },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f4, dst: 0xe00, len: 0x001, va: 0x0092b6d3 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f5, dst: 0xe01, len: 0x001, va: 0x0092b6df },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f6, dst: 0xe02, len: 0x001, va: 0x0092b6eb },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f7, dst: 0xe03, len: 0x001, va: 0x0092b6f7 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f8, dst: 0xe04, len: 0x001, va: 0x0092b703 },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3f9, dst: 0xe05, len: 0x001, va: 0x0092b70f },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x3fa, dst: 0xe06, len: 0x001, va: 0x0092b71b },
  { kind: PGD_IMPORT_KIND_BLOCK, src: 0x49c, dst: 0xf0c, len: 0x004, va: 0x0092b724 },
  { kind: PGD_IMPORT_KIND_REMAP_SEC3, src: 0x3c4, dst: 0xdc8, len: 0x030,
    va: 0x0092b730, iterations: PGD_SEC3_RESTORE_ITERATIONS },
];

test("PE truth: every v6 PGDCOV row is a literal transcription of the disassembly", () => {
  assert.equal(PGD_IMPORT_COPY_ROWS, PGDCOV_EXPECTED_ROWS.length);
  assert.equal(PGD_IMPORT_COPY_BLOCK_ROWS, PGDCOV_EXPECTED_ROWS.filter(
    (r) => r.kind === PGD_IMPORT_KIND_BLOCK).length);
  // the model row table must BE the transcription (byte-exact)
  assert.deepEqual(PGD_IMPORT_COPY_ROWS_TABLE, PGDCOV_EXPECTED_ROWS);
  // source regions live inside the 0x4f0 snapshot; PE order is ascending VA
  let prev = 0;
  for (const row of PGDCOV_EXPECTED_ROWS) {
    assert.ok(row.src >= 0 && row.src + row.len <= PGD_IMPORT_SNAPSHOT_BYTES,
      `row ${row.va.toString(16)} source inside snapshot`);
    assert.ok(row.va > prev, "rows must be in PE execution order");
    prev = row.va;
  }
  // the two remap rows must not alias each other's dest region
  const remap = PGDCOV_EXPECTED_ROWS.filter((r) => r.kind !== PGD_IMPORT_KIND_BLOCK);
  assert.equal(remap.length, 2);
  const [ev, s3] = remap;
  assert.equal(ev.dst, PGD_OFF_EVENT_COUNTERS);
  assert.equal(s3.dst, PGD_OFF_SEC3_DWORDS);
  assert.equal(ev.len, PGD_EVENT_RESTORE_ITERATIONS * 4);
  assert.equal(s3.len, PGD_SEC3_RESTORE_ITERATIONS * 4);
});

test("header and model record the exact v6 PGDCOV constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGD_IMPORT_VA", "0x0092b2e0u");
  lit("ISAAC_PGD_IMPORT_READER_VA", "0x009e4260u");
  lit("ISAAC_PGD_IMPORT_SNAPSHOT_BYTES", "0x4f0");
  lit("ISAAC_PGD_IMPORT_CLEAR_CALL_VA", "0x0092b5cau");
  lit("ISAAC_PGD_IMPORT_CLEAR_TARGET_VA", "0x009262b0u");
  lit("ISAAC_PGD_IMPORT_CALLER_VA", "0x00926bd5u");
  lit("ISAAC_PGD_IMPORT_LAST_ARRAY_STORE_VA", "0x0092b73fu");
  lit("ISAAC_PGD_IMPORT_COPY_BLOCK_ROWS", "23");
  lit("ISAAC_PGD_IMPORT_COPY_ROWS", "25");
  lit("ISAAC_PGD_IMPORT_WRITTEN_ACHIEVEMENTS", "0xb3");
  lit("ISAAC_PGD_IMPORT_WRITTEN_EVENT", "0x17c");
  lit("ISAAC_PGD_IMPORT_WRITTEN_COLLECTION", "0x15b");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SEC3", "0x30");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SEC5", "7");
  lit("ISAAC_PGD_IMPORT_WRITTEN_BOSSES", "0x39");
  lit("ISAAC_PGD_IMPORT_WRITTEN_CHALLENGES", "0x15");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SEC8", "0x50");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SEC9", "4");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SEC10", "0");
  lit("ISAAC_PGD_IMPORT_WRITTEN_BESTIARY", "0");
  lit("ISAAC_PGD_IMPORT_WRITTEN_SAVE_COUNTER", "0");
  lit("ISAAC_PGD_IMPORT_KIND_REMAP_EVENT", "2");
  lit("ISAAC_PGD_IMPORT_KIND_REMAP_SEC3", "3");
  // the JS mirror carries the same literals
  assert.equal(PGD_IMPORT_WRITTEN_ACHIEVEMENTS, 0xb3);
  assert.equal(PGD_IMPORT_WRITTEN_EVENT, 0x17c);
  assert.equal(PGD_IMPORT_WRITTEN_COLLECTION, 0x15b);
  assert.equal(PGD_IMPORT_WRITTEN_SEC3, 0x30);
  assert.equal(PGD_IMPORT_WRITTEN_SEC5, 7);
  assert.equal(PGD_IMPORT_WRITTEN_BOSSES, 0x39);
  assert.equal(PGD_IMPORT_WRITTEN_CHALLENGES, 0x15);
  assert.equal(PGD_IMPORT_WRITTEN_SEC8, 0x50);
  assert.equal(PGD_IMPORT_WRITTEN_SEC9, 4);
  assert.equal(PGD_IMPORT_WRITTEN_SEC10, 0);
  assert.equal(PGD_IMPORT_WRITTEN_BESTIARY, 0);
  assert.match(h, /v6 \(this unit\) names and translates the import path/);
  assert.match(h, /TryImportRebirthLocalSave/);
  assert.match(h, /23 blocks \+ 2 remap loops/);
  // the v7 law-fix must be on record, not silently swapped
  assert.match(h, /v7 law-fix/);
  assert.equal(PGD_IMPORT_VA, 0x0092b2e0);
  assert.equal(PGD_IMPORT_SNAPSHOT_BYTES, 0x4f0);
  assert.equal(PGD_IMPORT_LAST_ARRAY_STORE_VA, 0x0092b73f);
});

test("Wasm matches JS: v6 PGDCOV metadata differential", () => {
  const rec = SCRATCH_C;
  assert.equal(wasm.isaac_pgd_import_copy_count(), PGD_IMPORT_COPY_ROWS);
  assert.equal(wasm.isaac_pgd_import_snapshot_bytes(), PGD_IMPORT_SNAPSHOT_BYTES);
  assert.equal(wasm.isaac_pgd_import_tail_has_array_stores(),
    pgdImportTailHasArrayStores());
  // row records
  for (let step = -1; step <= PGD_IMPORT_COPY_ROWS + 1; ++step) {
    const ok = wasm.isaac_pgd_import_copy_record(step, rec);
    if (step < 0 || step >= PGD_IMPORT_COPY_ROWS) {
      assert.equal(ok, 0, `out-of-range step ${step} must return 0`);
      continue;
    }
    assert.equal(ok, 1, `step ${step}`);
    const want = PGD_IMPORT_COPY_ROWS_TABLE[step];
    const got = {
      step: readI32(view, rec + PGD_IMPORT_RECORD_OFF.step),
      kind: readI32(view, rec + PGD_IMPORT_RECORD_OFF.kind),
      src: readI32(view, rec + PGD_IMPORT_RECORD_OFF.src),
      dst: readI32(view, rec + PGD_IMPORT_RECORD_OFF.dst),
      len: readI32(view, rec + PGD_IMPORT_RECORD_OFF.len),
      va: readU32(view, rec + PGD_IMPORT_RECORD_OFF.va),
      iterations: readI32(view, rec + PGD_IMPORT_RECORD_OFF.iterations),
    };
    assert.deepEqual(got, {
      step, ...want, iterations: want.iterations ?? 0,
    }, `row ${step}`);
  }
  assert.equal(wasm.isaac_pgd_import_copy_record(0, 0), 1, "null out allowed");
});

test("Wasm matches JS: v6 PGDCOV field-level differential", () => {
  const FIELD_CORPUS = [
    PGD_OFF_CHANGES_MADE, PGD_OFF_READONLY, PGD_OFF_ACHIEVEMENTS,
    PGD_OFF_EVENT_COUNTERS, PGD_OFF_ITEM_COLLECTION, PGD_OFF_SEC3_DWORDS,
    PGD_OFF_SEC5_BYTES, PGD_OFF_BOSSES, PGD_OFF_CHALLENGES,
    PGD_OFF_SEC8_DWORDS, PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES,
    PGD_OFF_BESTIARY, PGD_OFF_PRE_SECTION_WORD, PGD_OFF_SAVE_COUNTER,
    PGD_OFF_FILE_LOADED_OK, -1, 0x7fffffff, 0xffffffff, 0x12345678,
  ];
  for (const off of FIELD_CORPUS) {
    assert.equal(wasm.isaac_pgd_import_field_written(off),
      pgdImportFieldWritten(off), `field_written(${off})`);
    assert.equal(wasm.isaac_pgd_import_written_byte_count(off) >>> 0,
      pgdImportWrittenByteCount(off), `written_byte_count(${off})`);
    assert.equal(wasm.isaac_pgd_import_stale_byte_count(off),
      pgdImportStaleByteCount(off), `stale_byte_count(${off})`);
    assert.equal(wasm.isaac_pgd_import_uses_remap(off),
      pgdImportUsesRemap(off), `uses_remap(${off})`);
    assert.equal(wasm.isaac_pgd_import_normalizes(off),
      pgdImportNormalizes(off), `normalizes(${off})`);
  }
  // boundary + wide element indices (never pre-masked)
  const edges = [-0x10000, -2, -1, 0, 1, 2, 0xfffffffe, 0xffffffff];
  for (const off of FIELD_CORPUS) {
    for (const i of edges) {
      assert.equal(wasm.isaac_pgd_import_element_written(off, i),
        pgdImportElementWritten(off, i), `element_written(${off},${i})`);
    }
  }
  // exhaustive for the remap arrays, deterministic random for the rest
  for (let s = -1; s <= PGD_COUNT_EVENT_COUNTERS; ++s) {
    assert.equal(wasm.isaac_pgd_import_element_written(PGD_OFF_EVENT_COUNTERS, s),
      pgdImportElementWritten(PGD_OFF_EVENT_COUNTERS, s), `event ${s}`);
  }
  for (let s = -1; s <= PGD_COUNT_SEC3; ++s) {
    assert.equal(wasm.isaac_pgd_import_element_written(PGD_OFF_SEC3_DWORDS, s),
      pgdImportElementWritten(PGD_OFF_SEC3_DWORDS, s), `sec3 ${s}`);
  }
  const rng = makeRng(0x92b2e000);
  for (const off of [
    PGD_OFF_ACHIEVEMENTS, PGD_OFF_ITEM_COLLECTION, PGD_OFF_BOSSES,
    PGD_OFF_CHALLENGES, PGD_OFF_SEC5_BYTES, PGD_OFF_SEC8_DWORDS,
    PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES, PGD_OFF_BESTIARY,
  ]) {
    const draws = 40 + pick(rng, 120);
    for (let k = 0; k < draws; ++k) {
      const i = pick(rng, 0x10000) - 0x8000; /* wide, signed */
      assert.equal(wasm.isaac_pgd_import_element_written(off, i),
        pgdImportElementWritten(off, i), `element_written(${off},${i})`);
    }
  }
  // negative census is pinned, not just differential
  assert.equal(pgdImportFieldWritten(PGD_OFF_SEC10_BYTES), 0);
  assert.equal(pgdImportFieldWritten(PGD_OFF_BESTIARY), 0);
  assert.equal(pgdImportFieldWritten(PGD_OFF_PRE_SECTION_WORD), 0);
  assert.equal(pgdImportFieldWritten(PGD_OFF_SAVE_COUNTER), 0);
  assert.equal(pgdImportFieldWritten(PGD_OFF_FILE_LOADED_OK), 0);
  assert.equal(pgdImportUsesRemap(PGD_OFF_EVENT_COUNTERS), 1);
  assert.equal(pgdImportUsesRemap(PGD_OFF_SEC3_DWORDS), 1);
  assert.equal(pgdImportUsesRemap(PGD_OFF_ACHIEVEMENTS), 0);
  assert.equal(pgdImportNormalizes(PGD_OFF_ACHIEVEMENTS), 0);
});

/* Read a little-endian u32 from a JS byte array (used by the simulation). */
function u32At(jsBytes, at) {
  return (jsBytes[at] | (jsBytes[at + 1] << 8) |
    (jsBytes[at + 2] << 16) | (jsBytes[at + 3] << 24)) >>> 0;
}

test("PE truth: v6 PGDCOV end-to-end restore simulation — rows applied physically in Wasm memory", () => {
  /* Run the restore the way 0x0092b5d5..0x0092b749 runs it: snapshot bytes
     at SNAP, pseudo-object at OBJ, rows in PE order. Block rows are raw
     byte copies; the two remap rows store dword i at slot remap(i) (v4
     laws). The memory result must equal a JS composition built from the
     model, and the stale regions must keep their sentinel. */
  const OBJ = SCRATCH_A;
  const SNAP = SCRATCH_B;
  const REC = SCRATCH_C;
  const OBJ_BYTES = 0x1000;
  const SE = 0xfeedface;

  for (let trial = 0; trial < 30; ++trial) {
    const rng = makeRng(0x92b5d500 + trial * 0x1a9);
    const snap = new Uint8Array(PGD_IMPORT_SNAPSHOT_BYTES);
    for (let o = 0; o < PGD_IMPORT_SNAPSHOT_BYTES; ++o) {
      const v = rng() & 0xff;
      snap[o] = v;
      bytes[SNAP + o] = v;
    }
    /* keep every remap-row source dword distinct from the sentinel so the
       memory-vs-law checks can never false-positive on a collision */
    for (const src of [0xec, 0x3c4]) {
      for (let i = 0; i < 0xc0; ++i) {
        if (u32At(snap, src + i * 4) === SE) snap[src + i * 4] ^= 0xff;
      }
    }
    for (let o = 0; o < PGD_IMPORT_SNAPSHOT_BYTES; ++o) bytes[SNAP + o] = snap[o];

    // sentinel the object, then snapshot it as the JS expectation baseline
    for (let o = 0; o < OBJ_BYTES; o += 4) view.setUint32(OBJ + o, SE, true);
    const want = new Uint8Array(OBJ_BYTES);
    for (let o = 0; o < OBJ_BYTES; ++o) want[o] = bytes[OBJ + o];
    // JS composition of the expected object bytes
    for (let step = 0; step < PGD_IMPORT_COPY_ROWS; ++step) {
      const row = PGD_IMPORT_COPY_ROWS_TABLE[step];
      if (row.kind === PGD_IMPORT_KIND_BLOCK) {
        for (let b = 0; b < row.len; ++b) want[row.dst + b] = snap[row.src + b];
      } else if (row.kind === PGD_IMPORT_KIND_REMAP_EVENT) {
        for (let i = 0; i < row.iterations; ++i) {
          const v = u32At(snap, row.src + i * 4);
          const slot = pgdEventRestoreRemap(i);
          want[row.dst + slot * 4] = v & 0xff;
          want[row.dst + slot * 4 + 1] = (v >>> 8) & 0xff;
          want[row.dst + slot * 4 + 2] = (v >>> 16) & 0xff;
          want[row.dst + slot * 4 + 3] = (v >>> 24) & 0xff;
        }
      } else {
        for (let i = 0; i < row.iterations; ++i) {
          const v = u32At(snap, row.src + i * 4);
          const slot = pgdSec3RestoreRemap(i);
          want[row.dst + slot * 4] = v & 0xff;
          want[row.dst + slot * 4 + 1] = (v >>> 8) & 0xff;
          want[row.dst + slot * 4 + 2] = (v >>> 16) & 0xff;
          want[row.dst + slot * 4 + 3] = (v >>> 24) & 0xff;
        }
      }
    }
    // drive the object through the Wasm-exported row records + slot laws
    for (let step = 0; step < PGD_IMPORT_COPY_ROWS; ++step) {
      assert.equal(wasm.isaac_pgd_import_copy_record(step, REC), 1);
      const kind = readI32(view, REC + PGD_IMPORT_RECORD_OFF.kind);
      const src = readI32(view, REC + PGD_IMPORT_RECORD_OFF.src);
      const dst = readI32(view, REC + PGD_IMPORT_RECORD_OFF.dst);
      const len = readI32(view, REC + PGD_IMPORT_RECORD_OFF.len);
      const it = readI32(view, REC + PGD_IMPORT_RECORD_OFF.iterations);
      if (kind === PGD_IMPORT_KIND_BLOCK) {
        bytes.set(bytes.subarray(SNAP + src, SNAP + src + len), OBJ + dst);
      } else if (kind === PGD_IMPORT_KIND_REMAP_EVENT) {
        for (let i = 0; i < it; ++i) {
          const off = dst + wasm.isaac_pgd_event_restore_slot(i) * 4;
          assert.equal(off, PGD_OFF_EVENT_COUNTERS + pgdEventRestoreRemap(i) * 4);
          view.setUint32(OBJ + off, view.getUint32(SNAP + src + i * 4, true), true);
        }
      } else {
        for (let i = 0; i < it; ++i) {
          const off = dst + wasm.isaac_pgd_sec3_restore_slot(i) * 4;
          assert.equal(off, PGD_OFF_SEC3_DWORDS + pgdSec3RestoreRemap(i) * 4);
          view.setUint32(OBJ + off, view.getUint32(SNAP + src + i * 4, true), true);
        }
      }
    }
    // the whole object region must match the JS composition
    for (let o = 0; o < OBJ_BYTES; ++o) {
      assert.equal(bytes[OBJ + o], want[o], `byte ${o} trial ${trial}`);
    }
    // PE-truth spot checks straight on memory
    const u32 = (at) => view.getUint32(OBJ + at, true);
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS], snap[0x38], "achievements byte 0");
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0xb0], snap[0x38 + 0xb0],
      "achievements tail movsw byte 0");
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0xb1], snap[0x38 + 0xb1],
      "achievements tail movsw byte 1");
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0xb2], snap[0x38 + 0xb2],
      "achievements tail movsb");
    const seByteAt = (off) => (SE >>> (8 * (off & 3))) & 0xff;
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0xb3], seByteAt(0xb3),
      "achievements not written past 0xb3");
    assert.equal(u32(PGD_OFF_SEC9_DWORDS), u32At(snap, 0x49c), "sec9 dword 0 written");
    assert.equal(u32(PGD_OFF_SEC9_DWORDS + 4), SE, "sec9 dword 1 stays stale");
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS + 4 * 4), SE, "event slot 4 is a hole");
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS + 0x28 * 4), SE, "event slot 0x28 is a hole");
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS + 0x8f * 4), SE, "event slot 0x8f is a hole");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 9 * 4), SE, "sec3 slot 9 is a hole");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 12 * 4), SE, "sec3 slot 12 is a hole");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 13 * 4), SE, "sec3 slot 13 is a hole");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS), u32At(snap, 0x3c4 + 10 * 4),
      "sec3 alias: input 10 overwrites slot 0");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 10 * 4), u32At(snap, 0x3c4 + 9 * 4),
      "sec3 input 9 lands on slot 10");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 11 * 4), u32At(snap, 0x3c4 + 11 * 4),
      "sec3 input 11 lands on slot 11");
    // element_written agrees with memory
    for (let s = 0; s < PGD_COUNT_EVENT_COUNTERS; ++s) {
      const w = wasm.isaac_pgd_import_element_written(PGD_OFF_EVENT_COUNTERS, s);
      assert.equal(w, u32(PGD_OFF_EVENT_COUNTERS + s * 4) !== SE ? 1 : 0,
        `event slot ${s} memory vs element_written`);
    }
    for (let s = 0; s < PGD_COUNT_SEC3; ++s) {
      const w = wasm.isaac_pgd_import_element_written(PGD_OFF_SEC3_DWORDS, s);
      assert.equal(w, u32(PGD_OFF_SEC3_DWORDS + s * 4) !== SE ? 1 : 0,
        `sec3 slot ${s} memory vs element_written`);
    }
  }
});


/* ===== v7 PGDEX: the sibling import 0x0092b930 restore coverage ===== */

/* 31 rows transcribed from section-notes/pgd-v7/disasm-92b930-full.txt
   (llvm-objdump of the shipped PE). Snapshot base: `lea -0x700(%ebp)`
   into the reader, so a source displ (-X) reads snapshot offset 0x700-X.
   Dests are store displacements; VAs are the store (or the remap loop
   head). The event remap row runs the 0x0041ddb0 law for 0xa2 iterations
   (inputs 0..0xa1). Raw hex values only — no PGD_OFF_* laundering. */
const PGD_SIBLING_RECORD_SIZE = 28; /* IsaacPgdSiblingCopy: 7 x i32 */

const PGDEX_EXPECTED_ROWS = [
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x038, dst: 0x038, len: 0x115, va: 0x0092ba40 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5cb, dst: 0xe07, len: 0x010, va: 0x0092ba48 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5db, dst: 0xe17, len: 0x010, va: 0x0092ba62 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5eb, dst: 0xe27, len: 0x010, va: 0x0092ba70 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5fb, dst: 0xe37, len: 0x010, va: 0x0092ba7e },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60b, dst: 0xe47, len: 0x002, va: 0x0092ba85 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60d, dst: 0xe49, len: 0x001, va: 0x0092ba99 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x60e, dst: 0xe6f, len: 0x010, va: 0x0092baa5 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x61e, dst: 0xe7f, len: 0x008, va: 0x0092bab4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x626, dst: 0xe87, len: 0x004, va: 0x0092babc },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x62a, dst: 0xe8b, len: 0x002, va: 0x0092bac9 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x62c, dst: 0xe8d, len: 0x001, va: 0x0092bad6 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x3d8, dst: 0xae8, len: 0x1ba, va: 0x0092bade }, /* v9 law-fix: 0x1ba */
  { kind: PGD_SIBLING_KIND_REMAP_EVENT, src: 0x150, dst: 0x2bc, len: 0x288,
    va: 0x0092bae8, iterations: PGD_SIBLING_EVENT_RESTORE_ITERATIONS },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x630, dst: 0xea0, len: 0x010, va: 0x0092bb15 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x640, dst: 0xeb0, len: 0x010, va: 0x0092bb23 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x650, dst: 0xec0, len: 0x010, va: 0x0092bb31 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x660, dst: 0xed0, len: 0x010, va: 0x0092bb3f },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x670, dst: 0xee0, len: 0x010, va: 0x0092bb4d },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x680, dst: 0xef0, len: 0x008, va: 0x0092bb59 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c4, dst: 0xe00, len: 0x001, va: 0x0092bb68 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c5, dst: 0xe01, len: 0x001, va: 0x0092bb74 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c6, dst: 0xe02, len: 0x001, va: 0x0092bb80 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c7, dst: 0xe03, len: 0x001, va: 0x0092bb8c },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c8, dst: 0xe04, len: 0x001, va: 0x0092bb98 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5c9, dst: 0xe05, len: 0x001, va: 0x0092bba4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5ca, dst: 0xe06, len: 0x001, va: 0x0092bbb0 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x688, dst: 0xf0c, len: 0x004, va: 0x0092bbb9 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x594, dst: 0xdc8, len: 0x010, va: 0x0092bbc4 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5a4, dst: 0xdd8, len: 0x010, va: 0x0092bbd2 },
  { kind: PGD_SIBLING_KIND_BLOCK, src: 0x5b4, dst: 0xde8, len: 0x010, va: 0x0092bbe0 },
];

test("PE truth: every v7 PGDEX row is a literal transcription of the disassembly", () => {
  assert.equal(PGD_SIBLING_COPY_ROWS, PGDEX_EXPECTED_ROWS.length);
  assert.equal(PGD_SIBLING_COPY_BLOCK_ROWS, PGDEX_EXPECTED_ROWS.filter(
    (r) => r.kind === PGD_SIBLING_KIND_BLOCK).length);
  assert.deepEqual(PGD_SIBLING_COPY_ROWS_TABLE, PGDEX_EXPECTED_ROWS);
  let prev = 0;
  for (const row of PGDEX_EXPECTED_ROWS) {
    assert.ok(row.src >= 0 && row.src + row.len <= PGD_SIBLING_SNAPSHOT_BYTES,
      `row ${row.va.toString(16)} source inside the 0x700 snapshot`);
    assert.ok(row.va > prev, "rows must be in PE execution order");
    prev = row.va;
  }
  const remap = PGDEX_EXPECTED_ROWS.filter((r) => r.kind !== PGD_SIBLING_KIND_BLOCK);
  assert.equal(remap.length, 1, "exactly one remap row (event only)");
  assert.equal(remap[0].dst, PGD_OFF_EVENT_COUNTERS);
  assert.equal(remap[0].len, PGD_SIBLING_EVENT_RESTORE_ITERATIONS * 4);
});

test("header and model record the exact v7 PGDEX constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGD_SIBLING_VA", "0x0092b930u");
  lit("ISAAC_PGD_SIBLING_READER_VA", "0x0041d670u");
  lit("ISAAC_PGD_SIBLING_SNAPSHOT_CTOR_VA", "0x0041d560u");
  lit("ISAAC_PGD_SIBLING_SNAPSHOT_BYTES", "0x700");
  lit("ISAAC_PGD_SIBLING_CLEAR_CALL_VA", "0x0092ba19u");
  lit("ISAAC_PGD_SIBLING_CLEAR_TARGET_VA", "0x009262b0u");
  lit("ISAAC_PGD_SIBLING_CALL_SITES", "2");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_VA", "0x0041ddb0u");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_TABLE_VA", "0x0041e190u");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_DEFAULT_ARM_VA", "0x0041e18au");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_BOUND", "0xa0");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_ENTRIES", "0xa1");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_INPUT", "0xa1");
  lit("ISAAC_PGD_SIBLING_EVENT_REMAP_MAX_SLOT", "0xab");
  lit("ISAAC_PGD_SIBLING_EVENT_RESTORE_ITERATIONS", "0xa2");
  lit("ISAAC_PGD_SIBLING_LAST_ARRAY_STORE_VA", "0x0092bbe0u");
  lit("ISAAC_PGD_SIBLING_COPY_BLOCK_ROWS", "30");
  lit("ISAAC_PGD_SIBLING_COPY_ROWS", "31");
  lit("ISAAC_PGD_SIBLING_WRITTEN_ACHIEVEMENTS", "0x115");
  lit("ISAAC_PGD_SIBLING_WRITTEN_EVENT", "0x288");
  lit("ISAAC_PGD_SIBLING_WRITTEN_COLLECTION", "0x1ba"); /* v9 law-fix */
  lit("ISAAC_PGD_SIBLING_WRITTEN_SEC3", "0x30");
  lit("ISAAC_PGD_SIBLING_WRITTEN_SEC5", "7");
  lit("ISAAC_PGD_SIBLING_WRITTEN_BOSSES", "0x43");
  lit("ISAAC_PGD_SIBLING_WRITTEN_CHALLENGES", "0x1f");
  lit("ISAAC_PGD_SIBLING_WRITTEN_SEC8", "0x58");
  lit("ISAAC_PGD_SIBLING_WRITTEN_SEC9", "4");
  // the ten holes must be recorded in the header comment as evidence
  assert.match(h, /0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d/);
  assert.match(h, /the two\r?\n   callers 0x0092be43\/0x0092c497 write pgd\+0xf8c AFTER the call/);
  // JS mirror carries the same literals
  assert.equal(PGD_SIBLING_VA, 0x0092b930);
  assert.equal(PGD_SIBLING_SNAPSHOT_BYTES, 0x700);
  assert.equal(PGD_SIBLING_LAST_ARRAY_STORE_VA, 0x0092bbe0);
  assert.equal(PGD_SIBLING_EVENT_RESTORE_ITERATIONS, 0xa2);
  assert.equal(PGD_SIBLING_WRITTEN_ACHIEVEMENTS, 0x115);
  assert.equal(PGD_SIBLING_WRITTEN_EVENT, 0x288);
  assert.equal(PGD_SIBLING_WRITTEN_COLLECTION, 0x1ba); /* v9 law-fix */
  assert.equal(PGD_SIBLING_WRITTEN_SEC3, 0x30);
  assert.equal(PGD_SIBLING_WRITTEN_SEC5, 7);
  assert.equal(PGD_SIBLING_WRITTEN_BOSSES, 0x43);
  assert.equal(PGD_SIBLING_WRITTEN_CHALLENGES, 0x1f);
  assert.equal(PGD_SIBLING_WRITTEN_SEC8, 0x58);
  assert.equal(PGD_SIBLING_WRITTEN_SEC9, 4);
  assert.equal(PGD_SIBLING_WRITTEN_SEC10, 0);
  assert.equal(PGD_SIBLING_WRITTEN_BESTIARY, 0);
  assert.deepEqual(PGD_SIBLING_CALLER_VAS, [0x0092be43, 0x0092c497]);
});

test("PE truth: the sibling event remap law, verified arm-by-arm", () => {
  const holes = PGD_SIBLING_EVENT_REMAP_HOLES;
  assert.equal(holes.length, 10);
  assert.deepEqual(holes, [0x4, 0x28, 0x36, 0x44, 0x52, 0x60, 0x6e, 0x81, 0x8f, 0x9d]);
  // the law: input i (1..0xa1) -> the i-th non-hole integer of [1..0xab]
  const nonHoles = [];
  for (let v = 1; v <= PGD_SIBLING_EVENT_REMAP_MAX_SLOT; ++v) {
    if (!holes.includes(v)) nonHoles.push(v);
  }
  assert.equal(nonHoles.length, PGD_SIBLING_EVENT_REMAP_ENTRIES);
  for (let i = 1; i <= PGD_SIBLING_EVENT_REMAP_MAX_INPUT; ++i) {
    assert.equal(pgdSiblingEventRemap(i), nonHoles[i - 1], `remap(${i})`);
  }
  // edges and the default arm
  assert.equal(pgdSiblingEventRemap(0), 0, "input 0 takes the xor default");
  assert.equal(pgdSiblingEventRemap(-1), 0);
  assert.equal(pgdSiblingEventRemap(-0x10000), 0);
  assert.equal(pgdSiblingEventRemap(0xa2), 0, "input past 0xa1 -> default");
  assert.equal(pgdSiblingEventRemap(0xffffffff), 0, "unsigned 0xffffffff -> default");
  assert.equal(pgdSiblingEventRemap(1), 1, "first table arm");
  assert.equal(pgdSiblingEventRemap(3), 3);
  assert.equal(pgdSiblingEventRemap(4), 5, "hole 0x4 skipped");
  assert.equal(pgdSiblingEventRemap(39), 41, "hole 0x28 skipped");
  assert.equal(pgdSiblingEventRemap(40), 42);
  assert.equal(pgdSiblingEventRemap(0xa1), 0xab, "max arm `mov $0xab`");
  // strict monotonic: a bijection onto the non-hole slots
  for (let i = 2; i <= PGD_SIBLING_EVENT_REMAP_MAX_INPUT; ++i) {
    assert.ok(pgdSiblingEventRemap(i) > pgdSiblingEventRemap(i - 1),
      `remap must be strictly increasing at ${i}`);
  }
  const image = new Set();
  for (let i = 1; i <= PGD_SIBLING_EVENT_REMAP_MAX_INPUT; ++i) {
    image.add(pgdSiblingEventRemap(i));
  }
  assert.equal(image.size, PGD_SIBLING_EVENT_REMAP_ENTRIES);
  // iteration 0 stores at slot 0: every slot in [0..0xab] minus the holes
  // is written by the driver loop
  for (let s = 0; s <= PGD_SIBLING_EVENT_REMAP_MAX_SLOT; ++s) {
    const w = pgdSiblingElementWritten(PGD_OFF_EVENT_COUNTERS, s);
    assert.equal(w, holes.includes(s) ? 0 : 1, `event slot ${s} written`);
  }
});

test("Wasm matches JS: v7 PGDEX metadata differential", () => {
  const rec = SCRATCH_C;
  assert.equal(wasm.isaac_pgd_sibling_copy_count(), PGD_SIBLING_COPY_ROWS);
  assert.equal(wasm.isaac_pgd_sibling_snapshot_bytes(), PGD_SIBLING_SNAPSHOT_BYTES);
  assert.equal(wasm.isaac_pgd_sibling_tail_has_array_stores(), 0);
  for (let step = -1; step <= PGD_SIBLING_COPY_ROWS + 1; ++step) {
    const ok = wasm.isaac_pgd_sibling_copy_record(step, rec);
    if (step < 0 || step >= PGD_SIBLING_COPY_ROWS) {
      assert.equal(ok, 0, `out-of-range step ${step}`);
      continue;
    }
    assert.equal(ok, 1, `step ${step}`);
    const want = PGD_SIBLING_COPY_ROWS_TABLE[step];
    const got = {
      step: readI32(view, rec + PGD_IMPORT_RECORD_OFF.step),
      kind: readI32(view, rec + PGD_IMPORT_RECORD_OFF.kind),
      src: readI32(view, rec + PGD_IMPORT_RECORD_OFF.src),
      dst: readI32(view, rec + PGD_IMPORT_RECORD_OFF.dst),
      len: readI32(view, rec + PGD_IMPORT_RECORD_OFF.len),
      va: readU32(view, rec + PGD_IMPORT_RECORD_OFF.va),
      iterations: readI32(view, rec + PGD_IMPORT_RECORD_OFF.iterations),
    };
    assert.deepEqual(got, {
      step, ...want, iterations: want.iterations ?? 0,
    }, `sibling row ${step}`);
  }
  assert.equal(wasm.isaac_pgd_sibling_copy_record(0, 0), 1, "null out allowed");
});

test("Wasm matches JS: v7 PGDEX field-level differential", () => {
  const FIELD_CORPUS = [
    PGD_OFF_CHANGES_MADE, PGD_OFF_READONLY, PGD_OFF_ACHIEVEMENTS,
    PGD_OFF_EVENT_COUNTERS, PGD_OFF_ITEM_COLLECTION, PGD_OFF_SEC3_DWORDS,
    PGD_OFF_SEC5_BYTES, PGD_OFF_BOSSES, PGD_OFF_CHALLENGES,
    PGD_OFF_SEC8_DWORDS, PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES,
    PGD_OFF_BESTIARY, PGD_OFF_PRE_SECTION_WORD, PGD_OFF_SAVE_COUNTER,
    PGD_OFF_FILE_LOADED_OK, -1, 0x7fffffff, 0xffffffff, 0x12345678,
  ];
  for (const off of FIELD_CORPUS) {
    assert.equal(wasm.isaac_pgd_sibling_field_written(off),
      pgdSiblingFieldWritten(off), `field_written(${off})`);
    assert.equal(wasm.isaac_pgd_sibling_written_byte_count(off) >>> 0,
      pgdSiblingWrittenByteCount(off), `written_byte_count(${off})`);
    assert.equal(wasm.isaac_pgd_sibling_stale_byte_count(off),
      pgdSiblingStaleByteCount(off), `stale_byte_count(${off})`);
    assert.equal(wasm.isaac_pgd_sibling_uses_remap(off),
      pgdSiblingUsesRemap(off), `uses_remap(${off})`);
    assert.equal(wasm.isaac_pgd_sibling_normalizes(off),
      pgdSiblingNormalizes(off), `normalizes(${off})`);
  }
  const edges = [-0x10000, -2, -1, 0, 1, 2, 0xfffffffe, 0xffffffff];
  for (const off of FIELD_CORPUS) {
    for (const i of edges) {
      assert.equal(wasm.isaac_pgd_sibling_element_written(off, i),
        pgdSiblingElementWritten(off, i), `element_written(${off},${i})`);
    }
  }
  // exhaustive event slots around the law's domain
  for (let s = -1; s <= PGD_COUNT_EVENT_COUNTERS; ++s) {
    assert.equal(wasm.isaac_pgd_sibling_element_written(PGD_OFF_EVENT_COUNTERS, s),
      pgdSiblingElementWritten(PGD_OFF_EVENT_COUNTERS, s), `event ${s}`);
  }
  const rng = makeRng(0x92b93000);
  for (const off of [
    PGD_OFF_ACHIEVEMENTS, PGD_OFF_ITEM_COLLECTION, PGD_OFF_BOSSES,
    PGD_OFF_CHALLENGES, PGD_OFF_SEC5_BYTES, PGD_OFF_SEC8_DWORDS,
    PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES, PGD_OFF_BESTIARY,
  ]) {
    const draws = 40 + pick(rng, 120);
    for (let k = 0; k < draws; ++k) {
      const i = pick(rng, 0x10000) - 0x8000;
      assert.equal(wasm.isaac_pgd_sibling_element_written(off, i),
        pgdSiblingElementWritten(off, i), `element_written(${off},${i})`);
    }
  }
  // negative census pinned, not just differential
  assert.equal(pgdSiblingFieldWritten(PGD_OFF_SEC10_BYTES), 0);
  assert.equal(pgdSiblingFieldWritten(PGD_OFF_BESTIARY), 0);
  assert.equal(pgdSiblingFieldWritten(PGD_OFF_PRE_SECTION_WORD), 0);
  assert.equal(pgdSiblingFieldWritten(PGD_OFF_SAVE_COUNTER), 0);
  assert.equal(pgdSiblingFieldWritten(PGD_OFF_FILE_LOADED_OK), 0);
  assert.equal(pgdSiblingUsesRemap(PGD_OFF_EVENT_COUNTERS), 1);
  assert.equal(pgdSiblingUsesRemap(PGD_OFF_SEC3_DWORDS), 0, "sec3 is movups here");
  assert.equal(pgdSiblingNormalizes(PGD_OFF_ACHIEVEMENTS), 0);
});

test("PE truth: v7 end-to-end sibling restore simulation — rows applied physically in Wasm memory", () => {
  const OBJ = SCRATCH_A;
  const SNAP = SCRATCH_B;
  const REC = SCRATCH_C;
  const OBJ_BYTES = 0x1000;
  const SE = 0xfeedface;

  for (let trial = 0; trial < 30; ++trial) {
    const rng = makeRng(0x92b93000 + trial * 0x1b1);
    const snap = new Uint8Array(PGD_SIBLING_SNAPSHOT_BYTES);
    for (let o = 0; o < PGD_SIBLING_SNAPSHOT_BYTES; ++o) {
      const v = rng() & 0xff;
      snap[o] = v;
      bytes[SNAP + o] = v;
    }
    for (let i = 0; i < PGD_SIBLING_EVENT_RESTORE_ITERATIONS; ++i) {
      if (u32At(snap, 0x150 + i * 4) === SE) snap[0x150 + i * 4] ^= 0xff;
    }
    for (let o = 0; o < PGD_SIBLING_SNAPSHOT_BYTES; ++o) bytes[SNAP + o] = snap[o];

    for (let o = 0; o < OBJ_BYTES; o += 4) view.setUint32(OBJ + o, SE, true);
    const want = new Uint8Array(OBJ_BYTES);
    for (let o = 0; o < OBJ_BYTES; ++o) want[o] = bytes[OBJ + o];
    for (let step = 0; step < PGD_SIBLING_COPY_ROWS; ++step) {
      const row = PGD_SIBLING_COPY_ROWS_TABLE[step];
      if (row.kind === PGD_SIBLING_KIND_BLOCK) {
        for (let b = 0; b < row.len; ++b) want[row.dst + b] = snap[row.src + b];
      } else {
        for (let i = 0; i < row.iterations; ++i) {
          const v = u32At(snap, row.src + i * 4);
          const slot = pgdSiblingEventRemap(i);
          want[row.dst + slot * 4] = v & 0xff;
          want[row.dst + slot * 4 + 1] = (v >>> 8) & 0xff;
          want[row.dst + slot * 4 + 2] = (v >>> 16) & 0xff;
          want[row.dst + slot * 4 + 3] = (v >>> 24) & 0xff;
        }
      }
    }
    for (let step = 0; step < PGD_SIBLING_COPY_ROWS; ++step) {
      assert.equal(wasm.isaac_pgd_sibling_copy_record(step, REC), 1);
      const kind = readI32(view, REC + PGD_IMPORT_RECORD_OFF.kind);
      const src = readI32(view, REC + PGD_IMPORT_RECORD_OFF.src);
      const dst = readI32(view, REC + PGD_IMPORT_RECORD_OFF.dst);
      const len = readI32(view, REC + PGD_IMPORT_RECORD_OFF.len);
      const it = readI32(view, REC + PGD_IMPORT_RECORD_OFF.iterations);
      if (kind === PGD_SIBLING_KIND_BLOCK) {
        bytes.set(bytes.subarray(SNAP + src, SNAP + src + len), OBJ + dst);
      } else {
        for (let i = 0; i < it; ++i) {
          const slot = wasm.isaac_pgd_sibling_event_remap(i);
          const off = dst + slot * 4;
          assert.equal(off, PGD_OFF_EVENT_COUNTERS + pgdSiblingEventRemap(i) * 4);
          view.setUint32(OBJ + off, view.getUint32(SNAP + src + i * 4, true), true);
        }
      }
    }
    for (let o = 0; o < OBJ_BYTES; ++o) {
      assert.equal(bytes[OBJ + o], want[o], `byte ${o} trial ${trial}`);
    }
    const u32 = (at) => view.getUint32(OBJ + at, true);
    const seByteAt = (off) => (SE >>> (8 * (off & 3))) & 0xff;
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS], snap[0x38], "achievements byte 0");
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0x114], snap[0x38 + 0x114],
      "achievements tail movsb");
    assert.equal(bytes[OBJ + PGD_OFF_ACHIEVEMENTS + 0x115], seByteAt(0x115),
      "achievements not written past 0x115");
    assert.equal(u32(PGD_OFF_SEC9_DWORDS), u32At(snap, 0x688), "sec9 dword 0 written");
    assert.equal(u32(PGD_OFF_SEC9_DWORDS + 4), SE, "sec9 dword 1 stays stale");
    assert.equal(u32(PGD_OFF_SEC3_DWORDS + 0x20), u32At(snap, 0x5b4),
      "sec3 movups #3 (the LAST array store)");
    // event remap memory law
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS), u32At(snap, 0x150),
      "input 0 lands on slot 0 (default arm)");
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS + 0xab * 4), u32At(snap, 0x150 + 0xa1 * 4),
      "input 0xa1 lands on the max slot 0xab");
    assert.equal(u32(PGD_OFF_EVENT_COUNTERS + 0xac * 4), SE, "slot 0xac stays stale");
    for (const hole of PGD_SIBLING_EVENT_REMAP_HOLES) {
      assert.equal(u32(PGD_OFF_EVENT_COUNTERS + hole * 4), SE, `event hole 0x${hole.toString(16)}`);
    }
    for (let s = 0; s < PGD_COUNT_EVENT_COUNTERS; ++s) {
      const w = wasm.isaac_pgd_sibling_element_written(PGD_OFF_EVENT_COUNTERS, s);
      assert.equal(w, u32(PGD_OFF_EVENT_COUNTERS + s * 4) !== SE ? 1 : 0,
        `event slot ${s} memory vs element_written`);
    }
  }
});

test("header records the v5 evidence and the toolchain guard", () => {
  const h = readFileSync(header, "utf8");
  // the v6 header re-anchored around the import path; the v5 evidence must stay
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /v5 \(this unit\) does not move a single instruction/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  // the byte-exact prologues are recorded as evidence
  assert.match(h, /49 83 f9 5d 0f 87/);
  assert.match(h, /49 83 f9 0a 77 43/);
  assert.match(h, /105 table entries/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /toolchain defect guard \(ABI v8\)/);
  assert.match(s, /ISAAC_PGD_NO_NARROW_PARAMS\(isaac_pgd_sec3_restore_remap\)/);
  assert.match(s, /ISAAC_PGD_NO_NARROW_PARAMS\(isaac_pgd_event_restore_remap\)/);
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.match(m, /Helpers ABI v5/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  // v5 changed no law — the v4 shape is still the law
  assert.equal(pgdSec3RestoreRemap(9), 10);
  assert.equal(pgdSec3RestoreRemap(10), 0);
  assert.equal(pgdSec3RestoreRemap(11), 11);
  assert.equal(pgdEventRestoreRemap(94), PGD_EVENT_REMAP_MAX_SLOT);
  assert.equal(pgdEventRestoreRemap(37), 41);
});

test("header records the v2 evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /v2 walked the deserializer section handlers/);
  assert.match(h, /0x00927244/);
  assert.match(h, /0x00927cd8/);
  assert.match(h, /0x00927d04/);
  assert.match(h, /0x0092a520/);
  assert.match(h, /0x0092b230/);
  assert.match(h, /0x0092b270/);
  assert.match(h, /NAMING POLICY/);
  assert.match(h, /string\s+reference, which is explicitly not sufficient/);
  assert.match(h, /Reproduce, do not repair|must not be\s+"corrected"/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /kReaderSections/);
  assert.match(s, /cmova/);
  assert.match(s, /no bounds check whatsoever/);
});

test("header records the v3 evidence and every new constant's literal value", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /v3 walked the section-3 handler/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  // the v2 correction must be recorded, not silently swapped in
  assert.match(h, /v2 correction/);
  assert.match(h, /SIGNED positivity test/);
  assert.match(h, /`test eax,eax ; je done` — a ZERO test/);
  assert.match(h, /0x009270b5/);
  // the typo survives in exactly one place — the sentence that retires it
  assert.equal((h.match(/0x009070b5/g) || []).length, 1);
  assert.match(h, /is `0x009270b5`, not the\s+`0x009070b5` v2 recorded/);
  // the new evidence VAs
  for (const va of [
    /0x0091adf0/, /0x0091b650/, /0x00929790/, /0x009262b0/, /0x00c5ab08/,
    /0x0092b6d3/, /0x00927c8a/, /0x009272b5/, /0x009273dd/, /0x0091ae6a/,
  ]) {
    assert.match(h, va);
  }
  // the promotion verdicts must be spelled out, and must NOT promote a name
  assert.match(h, /v3 PROMOTION VERDICTS/);
  assert.match(h, /Meaning\s+NOT promoted/);
  assert.match(h, /Nothing above promotes a NAME/);
  assert.match(h, /NEGATIVE result/);

  /* Header-only constants are invisible to the differential — a mutation of
     any of these would never reach a Wasm export, so pin the literals. */
  const lit = (name, value) =>
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`,
    );
  lit("ISAAC_PGD_BESTIARY_NODE_MARKER_OFF", "0xd");
  lit("ISAAC_PGD_READER_TAIL_VA", "0x00927c8au");
  lit("ISAAC_PGD_READER_FAIL_VA", "0x00927ca0u");
  lit("ISAAC_PGD_READER_PRE_SECTION_READ_VA", "0x00927091u");
  lit("ISAAC_PGD_FIELD_UNKNOWN_OFFSET", "0");
  lit("ISAAC_PGD_FIELD_NAMED", "1");
  lit("ISAAC_PGD_FIELD_LAYOUT_ONLY", "2");
  lit("ISAAC_PGD_REPR_NONE", "0");
  lit("ISAAC_PGD_REPR_BOOL_BYTE", "1");
  lit("ISAAC_PGD_REPR_RAW_DWORD", "2");
  lit("ISAAC_PGD_PRE_SECTION_WORD_SITES", "5");
  lit("ISAAC_PGD_PRE_SECTION_WORD_ACCESSORS", "0");
  lit("ISAAC_PGD_ALT_TRANSPORT_FIELDS", "8");
  lit("ISAAC_PGD_ALT_TRANSPORT_VA", "0x0091adf0u");
  lit("ISAAC_PGD_ALT_BITPACK_VA", "0x0091b650u");
  lit("ISAAC_PGD_ALT_HOST_VA_ALLOC", "0x00a648b0u");
  lit("ISAAC_PGD_ALT_HOST_VA_MEMSET", "0x00af05e5u");
  lit("ISAAC_PGD_NOTIFY_VA", "0x00929790u");
  lit("ISAAC_PGD_NOTIFY_FORMAT_VA", "0x0041e420u");
  lit("ISAAC_PGD_NOTIFY_BUFFER_BYTES", "8");
  lit("ISAAC_PGD_NOTIFY_ENABLE_GLOBAL_VA", "0x00c5ab08u");
  lit("ISAAC_PGD_NOTIFY_ENABLE_MASK", "1");
  lit("ISAAC_PGD_NOTIFY_SINGLETON_VA", "0x00bf93c8u");
  lit("ISAAC_PGD_NOTIFY_VTBL_OFF_A", "0x18");
  lit("ISAAC_PGD_NOTIFY_VTBL_OFF_B", "0x24");
  lit("ISAAC_PGD_CLEAR_VA", "0x009262b0u");
  lit("ISAAC_PGD_CLEAR_FLAG_02_VALUE", "1");
  lit("ISAAC_PGD_FLAG_02_STORES_IN_CLUSTER", "1");
  lit("ISAAC_PGD_FLAG_02_LOADS_IN_CLUSTER", "3");

  // and the JS mirror must carry the same literals
  assert.equal(PGD_BESTIARY_NODE_MARKER_OFF, 0xd);
  assert.equal(PGD_READER_TAIL_VA, 0x00927c8a);
  assert.equal(PGD_ALT_TRANSPORT_FIELDS, 8);
  assert.equal(PGD_NOTIFY_ENABLE_MASK, 1);

  const s = readFileSync(source, "utf8");
  assert.match(s, /ZERO test on the whole register/);
  assert.match(s, /BYTE cursor/);
  assert.match(s, /rol al,1/);
  // the corrected scratch rule must be recorded in the test file itself
  const t = readFileSync(
    new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    "utf8",
  );
  assert.match(t, /SCRATCH_MIN = 0x100000/);
  // the only surviving `rng() %` is the comment that retires it
  assert.equal((t.match(/rng\(\) % /g) || []).length, 1);
  assert.match(t, /used `rng\(\) % n`, which on a generator/);
  assert.ok((t.match(/pick\(rng, /g) || []).length >= 9);
});

test("header records the v4 evidence and every new constant's literal value", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI v4/);
  assert.match(h, /v4 recovers the two restore index remaps/);
  // the defect must be recorded as reproduced, not repaired
  assert.match(h, /ORIGINAL DEFECT PINNED AT v4 — reproduce, do not correct/);
  assert.match(h, /`source\[10\]` overwrites `source\[0\]`/);
  assert.match(h, /slots 9, 12 and 13/);
  // and the carry the coordinator asked for, in writing
  assert.match(h, /NOTE ON MEANING/);
  assert.match(h, /evidence about INDEXING, not about what a\s+slot holds/);
  for (const va of [
    /0x009e4f80/, /0x009e3ea0/, /0x009e4fcc/, /0x009e40e8/, /0x009e4fc9/,
    /0x009e40e5/, /0x0092b346/, /0x0092b730/, /0x0092b670/, /0x0092b739/,
    /0x0092b679/,
  ]) {
    assert.match(h, va);
  }

  const lit = (name, value) =>
    assert.match(
      h,
      new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`,
    );
  lit("ISAAC_PGD_SEC3_REMAP_VA", "0x009e4f80u");
  lit("ISAAC_PGD_SEC3_REMAP_TABLE_VA", "0x009e4fccu");
  lit("ISAAC_PGD_SEC3_REMAP_DEFAULT_ARM_VA", "0x009e4fc9u");
  lit("ISAAC_PGD_SEC3_REMAP_BOUND", "0xa");
  lit("ISAAC_PGD_SEC3_REMAP_ENTRIES", "11");
  lit("ISAAC_PGD_SEC3_REMAP_MAX_INPUT", "11");
  lit("ISAAC_PGD_SEC3_REMAP_MAX_SLOT", "11");
  lit("ISAAC_PGD_EVENT_REMAP_VA", "0x009e3ea0u");
  lit("ISAAC_PGD_EVENT_REMAP_TABLE_VA", "0x009e40e8u");
  lit("ISAAC_PGD_EVENT_REMAP_DEFAULT_ARM_VA", "0x009e40e5u");
  lit("ISAAC_PGD_EVENT_REMAP_BOUND", "0x5d");
  lit("ISAAC_PGD_EVENT_REMAP_ENTRIES", "94");
  lit("ISAAC_PGD_EVENT_REMAP_MAX_INPUT", "94");
  lit("ISAAC_PGD_EVENT_REMAP_MAX_SLOT", "113");
  lit("ISAAC_PGD_BULK_RESTORE_VA", "0x0092b346u");
  lit("ISAAC_PGD_SEC3_RESTORE_ITERATIONS", "0xc");
  lit("ISAAC_PGD_EVENT_RESTORE_ITERATIONS", "0x5f");
  lit("ISAAC_PGD_SEC3_REMAP_CALL_SITES", "1");
  lit("ISAAC_PGD_EVENT_REMAP_CALL_SITES", "1");
  lit("ISAAC_PGD_SEC3_RESTORE_SLOTS_UNWRITTEN", "3");
  lit("ISAAC_PGD_EVENT_RESTORE_SLOTS_UNWRITTEN_BELOW_MAX", "19");
  lit("ISAAC_PGD_SEC3_RESTORE_ALIASED_SLOTS", "1");
  lit("ISAAC_PGD_EVENT_RESTORE_ALIASED_SLOTS", "0");
  lit("ISAAC_PGD_SEC3_RESTORE_ALIASED_SLOT", "0");
  lit("ISAAC_PGD_SEC3_RESTORE_ALIAS_LOSER", "0");
  lit("ISAAC_PGD_SEC3_RESTORE_ALIAS_WINNER", "10");

  // JS mirror carries the same literals
  assert.equal(PGD_SEC3_REMAP_BOUND, 0xa);
  assert.equal(PGD_EVENT_REMAP_BOUND, 0x5d);
  assert.equal(PGD_SEC3_RESTORE_ITERATIONS, 0xc);
  assert.equal(PGD_EVENT_RESTORE_ITERATIONS, 0x5f);
  assert.equal(PGD_EVENT_REMAP_MAX_SLOT, 113);

  const s = readFileSync(source, "utf8");
  // the cpp preamble re-headed at v7 must still record v4's land as provenance
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /v5 re-proved the\s+v4 remap land/);
  // the C++ must stay a literal transcription, defect and all
  assert.match(s, /kSec3RestoreRemap/);
  assert.match(s, /kEventRestoreRemap/);
  assert.match(s, /transcribed rather than smoothed/);
  assert.match(s, /0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 0, 11, ISAAC_PGD_REMAP_GUARD_VALUE/);
  assert.match(s, /observable wrong answer instead of an out-of-bounds read/);
  lit("ISAAC_PGD_REMAP_GUARD_VALUE", "-1");
  assert.equal(PGD_REMAP_GUARD_VALUE, -1);
  // the model must NOT be a copy of that table
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.doesNotMatch(m, /kSec3RestoreRemap|kEventRestoreRemap/);
  assert.doesNotMatch(m, /0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 0, 11/);
  assert.match(m, /PGD_SEC3_REMAP_IRREGULAR/);
});

/* =====================================================================
   ABI v8 — PGDCLR (Clear 0x009262b0) + PGDTAIL (shared import tail)

   Evidence: section-notes/pgd-v8/ (disasm-9262b0-clear.txt,
   disasm-92b740-92bc70-tails.txt, NOTES.md). Row VAs below are transcribed
   from the instruction stream; the model tables are reasoned from the same
   listing, so a mis-transcribed entry shows up as a differential failure.
   ===================================================================== */

/* Hand transcription of Clear's eleven unconditional zero rows from the
   disassembly (offsets absolute). No PGD_OFF_* laundering. */
const PGDCLR_EXPECTED_ZERO_ROWS = [
  { offset: 0xf84, length: 4, va: 0x009262bc },
  { offset: 0x038, length: 0x282, va: 0x009262dd },
  { offset: 0xae8, length: 0x2dd, va: 0x009262f0 },
  { offset: 0x2bc, length: 0x82c, va: 0x00926305 },
  { offset: 0xdc8, length: 0x38, va: 0x00926307 },
  { offset: 0xe00, length: 7, va: 0x00926328 },
  { offset: 0xe07, length: 0x68, va: 0x00926342 },
  { offset: 0xe6f, length: 0x2e, va: 0x00926352 },
  { offset: 0xea0, length: 0x6c, va: 0x00926360 },
  { offset: 0xf0c, length: 8, va: 0x009263a1 },
  { offset: 0xf14, length: 0x50, va: 0x009263b5 },
];

const PGDCLR_EXPECTED_MAP_ROWS = [
  { slot: 3, base: 0xf7c, erase_va: 0x009263cf, selflink_va: 0x009263d4, size_va: 0x009263dc },
  { slot: 0, base: 0xf64, erase_va: 0x009263f1, selflink_va: 0x009263f6, size_va: 0x009263fe },
  { slot: 2, base: 0xf74, erase_va: 0x00926413, selflink_va: 0x00926418, size_va: 0x00926420 },
  { slot: 1, base: 0xf6c, erase_va: 0x00926435, selflink_va: 0x0092643a, size_va: 0x00926442 },
];

const PGDCLR_EXPECTED_TAIL_STORES = [
  { offset: 0x00, length: 2, value: 0, va: 0x0092644b },
  { offset: 0x02, length: 1, value: 1, va: 0x00926450 },
  { offset: 0xf8c, length: 1, value: 1, va: 0x00926454 },
];

/* Struct layouts for the v8 record exports (see the header typedefs). */
const PGDCLR_ZERO_RECORD_OFF = { step: 0, offset: 4, length: 8, va: 12 };
const PGDCLR_ZERO_RECORD_SIZE = 16;
const PGDCLR_MAP_RECORD_OFF = { step: 0, slot: 4, base: 8, erase_va: 12, selflink_va: 16, size_va: 20 };
const PGDCLR_MAP_RECORD_SIZE = 24;
const PGDCLR_TAIL_STORE_OFF = { step: 0, offset: 4, length: 8, value: 12, va: 16 };
const PGDCLR_TAIL_STORE_SIZE = 20;
const PGDTAIL_RECORD_OFF = { step: 0, kind: 4, va_import: 8, va_sibling: 12, detail: 16 };
const PGDTAIL_RECORD_SIZE = 20;

test("PE truth: every v8 PGDCLR row is a literal transcription of the disassembly", () => {
  assert.equal(PGDCLR_ZERO_ROWS, PGDCLR_EXPECTED_ZERO_ROWS.length);
  assert.deepEqual(PGDCLR_ZERO_ROWS_TABLE, PGDCLR_EXPECTED_ZERO_ROWS);
  let prev = 0;
  let total = 0;
  for (const row of PGDCLR_EXPECTED_ZERO_ROWS) {
    assert.ok(row.offset >= 0 && row.offset + row.length <= 0xf90,
      `row ${row.va.toString(16)} inside the object`);
    assert.ok(row.va > prev, "rows must be in PE execution order");
    prev = row.va;
    total += row.length;
  }
  // unconditional rows only; the conditional +0xf88 row is separate
  assert.equal(total, 3880);
  assert.equal(PGDCLR_COND_OFF, 0xf88);
  assert.equal(PGDCLR_COND_LEN, 4);
  assert.equal(PGDCLR_COND_VA, 0x009262c8);
  assert.equal(PGDCLR_GATE_VA, 0x009262c6);
  // the word [pgd+0] store adds two more zeroed bytes (changesmade+readonly)
  assert.equal(pgdClearTotalZeroedBytes(0), 3882);
  assert.equal(pgdClearTotalZeroedBytes(1), 3886);
  assert.equal(pgdClearTotalZeroedBytes(0x100), 3882, "0x100 low byte is 0");
  assert.equal(pgdClearTotalZeroedBytes(0xffffffff), 3886);
  // the 3-byte gap is never zeroed
  assert.equal(PGDCLR_GAP_OFF, 0xe9d);
  assert.equal(PGDCLR_GAP_LEN, 3);
  // row 3 is one rep stosd of 0x20b dwords
  assert.equal(pgdClearZeroRowSpanDwords(3), 0x20b);
  assert.equal(pgdClearZeroRowSpanDwords(2), 0);
  // map rows: slot order 3,0,2,1 with strictly increasing erase VAs
  assert.equal(PGDCLR_MAP_ROWS, PGDCLR_EXPECTED_MAP_ROWS.length);
  assert.deepEqual(PGDCLR_MAP_ROWS_TABLE, PGDCLR_EXPECTED_MAP_ROWS);
  for (let s = 0; s < PGDCLR_MAP_ROWS; ++s) {
    assert.equal(pgdClearMapSlotAtStep(s), PGDCLR_EXPECTED_MAP_ROWS[s].slot);
    assert.ok(PGDCLR_EXPECTED_MAP_ROWS[s].erase_va > prev, "erase after zero rows");
  }
  assert.deepEqual([...Array(PGDCLR_MAP_ROWS)].map((_, s) => pgdClearMapSlotAtStep(s)),
    [3, 0, 2, 1]);
  // the reader's v3 clear order is the same; the writer's emit order differs
  assert.equal(pgdClearMapOrderMatchesReader(), 1);
  assert.equal(pgdClearMapOrderMatchesWriter(), 0);
  for (let s = 0; s < PGD_BESTIARY_SUBMAPS; ++s) {
    assert.equal(pgdClearMapSlotAtStep(s), pgdBestiaryClearSlot(s),
      `clear slot order matches the v3 reader law at ${s}`);
  }
  // tail stores
  assert.equal(PGDCLR_TAIL_STORES, PGDCLR_EXPECTED_TAIL_STORES.length);
  assert.deepEqual(PGDCLR_TAIL_STORES_TABLE, PGDCLR_EXPECTED_TAIL_STORES);
  // call-site census: 11 sites, strictly increasing
  assert.equal(PGDCLR_CALL_SITES, PGDCLR_CALL_SITE_VAS.length);
  assert.deepEqual(PGDCLR_CALL_SITE_VAS, [
    0x00925ffc, 0x0092646a, 0x0092682f, 0x00926ad1, 0x00926c0a,
    0x00926e0b, 0x00926e7f, 0x0092b5ca, 0x0092ba19, 0x00959e8d,
    0x009d9e01,
  ]);
});

test("header and model record the exact v8 PGDCLR constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGDCLR_VA", "0x009262b0u");
  lit("ISAAC_PGDCLR_RET_VA", "0x0092645du");
  lit("ISAAC_PGDCLR_MEMSET_VA", "0x00af05e5u");
  lit("ISAAC_PGDCLR_MAP_ERASE_VA", "0x0042c8e0u");
  lit("ISAAC_PGDCLR_ZERO_ROWS", "11");
  lit("ISAAC_PGDCLR_COND_ROW_OFF", "0xf88");
  lit("ISAAC_PGDCLR_COND_ROW_LEN", "4");
  lit("ISAAC_PGDCLR_COND_ROW_VA", "0x009262c8u");
  lit("ISAAC_PGDCLR_GATE_VA", "0x009262c6u");
  lit("ISAAC_PGDCLR_MAP_ROWS", "4");
  lit("ISAAC_PGDCLR_TAIL_STORES", "3");
  lit("ISAAC_PGDCLR_GAP_OFF", "0xe9d");
  lit("ISAAC_PGDCLR_GAP_LEN", "3");
  lit("ISAAC_PGDCLR_CALL_SITES", "11");
  lit("ISAAC_PGDCLR_STATUS_ZEROED", "1");
  lit("ISAAC_PGDCLR_STATUS_ZEROED_IF_ARG", "2");
  lit("ISAAC_PGDCLR_STATUS_SET_ONE", "3");
  lit("ISAAC_PGDCLR_STATUS_STRUCT_RESET", "4");
  // the conditional row and its low-byte gate must be spelled out
  assert.match(h, /LOW byte of the single/);
  assert.match(h, /0x20b dwords/);
  assert.match(h, /slot 3,\s+slot 0,\s+slot 2,\s+slot 1/);
  assert.match(h, /2,094,216 instructions, 469 resyncs/);
  // JS mirror carries the same literals
  assert.equal(PGDCLR_VA, 0x009262b0);
  assert.equal(PGDCLR_ZERO_ROWS, 11);
  assert.equal(PGDCLR_MAP_ROWS, 4);
  assert.equal(PGDCLR_TAIL_STORES, 3);
  assert.equal(PGDCLR_GAP_OFF, 0xe9d);
  assert.equal(PGDCLR_GAP_LEN, 3);
  assert.equal(PGDCLR_CALL_SITES, 11);
  assert.equal(PGDCLR_STATUS_STRUCT_RESET, 4);
});

test("Wasm matches JS: PGDCLR rows, record structs and status over the whole object", () => {
  const REC = SCRATCH_C;
  // zero rows: every step, out-of-range and null out
  for (let s = -2; s <= PGDCLR_ZERO_ROWS + 1; ++s) {
    const ok = wasm.isaac_pgd_clear_zero_record(s, REC);
    assert.equal(ok, s >= 0 && s < PGDCLR_ZERO_ROWS ? 1 : 0, `zero_record(${s}) ok`);
    if (ok) {
      const row = PGDCLR_ZERO_ROWS_TABLE[s];
      assert.equal(readI32(view, REC + PGDCLR_ZERO_RECORD_OFF.step), s);
      assert.equal(readI32(view, REC + PGDCLR_ZERO_RECORD_OFF.offset), row.offset);
      assert.equal(readI32(view, REC + PGDCLR_ZERO_RECORD_OFF.length), row.length);
      assert.equal(readI32(view, REC + PGDCLR_ZERO_RECORD_OFF.va), row.va);
    }
  }
  assert.equal(wasm.isaac_pgd_clear_zero_record(0, 0), 1, "null out is fine");
  assert.equal(wasm.isaac_pgd_clear_zero_record(99, 0), 0);
  assert.equal(PGDCLR_ZERO_RECORD_SIZE, 16);
  // map rows
  for (let s = -1; s <= PGDCLR_MAP_ROWS; ++s) {
    const ok = wasm.isaac_pgd_clear_map_record(s, REC);
    assert.equal(ok, s >= 0 && s < PGDCLR_MAP_ROWS ? 1 : 0);
    if (ok) {
      const row = PGDCLR_MAP_ROWS_TABLE[s];
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.step), s);
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.slot), row.slot);
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.base), row.base);
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.erase_va), row.erase_va);
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.selflink_va), row.selflink_va);
      assert.equal(readI32(view, REC + PGDCLR_MAP_RECORD_OFF.size_va), row.size_va);
      assert.equal(wasm.isaac_pgd_clear_map_slot_at_step(s), row.slot);
    }
  }
  assert.equal(PGDCLR_MAP_RECORD_SIZE, 24);
  // tail stores
  for (let s = -1; s <= PGDCLR_TAIL_STORES; ++s) {
    const ok = wasm.isaac_pgd_clear_tail_store_record(s, REC);
    assert.equal(ok, s >= 0 && s < PGDCLR_TAIL_STORES ? 1 : 0);
    if (ok) {
      const row = PGDCLR_TAIL_STORES_TABLE[s];
      assert.equal(readI32(view, REC + PGDCLR_TAIL_STORE_OFF.offset), row.offset);
      assert.equal(readI32(view, REC + PGDCLR_TAIL_STORE_OFF.length), row.length);
      assert.equal(readI32(view, REC + PGDCLR_TAIL_STORE_OFF.value), row.value);
      assert.equal(readI32(view, REC + PGDCLR_TAIL_STORE_OFF.va), row.va);
    }
  }
  assert.equal(PGDCLR_TAIL_STORE_SIZE, 20);
  assert.equal(wasm.isaac_pgd_clear_zero_row_span_dwords(3), 0x20b);
  assert.equal(wasm.isaac_pgd_clear_zero_row_span_dwords(4), 0);
  // field status: the 17 layout fields + edges
  const fieldOffsets = [
    PGD_OFF_CHANGES_MADE, PGD_OFF_READONLY, PGD_OFF_FLAG_02,
    PGD_OFF_ACHIEVEMENTS, PGD_OFF_EVENT_COUNTERS, PGD_OFF_ITEM_COLLECTION,
    PGD_OFF_SEC3_DWORDS, PGD_OFF_SEC5_BYTES, PGD_OFF_BOSSES,
    PGD_OFF_CHALLENGES, PGD_OFF_SEC8_DWORDS, PGD_OFF_SEC9_DWORDS,
    PGD_OFF_SEC10_BYTES, PGD_OFF_BESTIARY, PGD_OFF_PRE_SECTION_WORD,
    PGD_OFF_SAVE_COUNTER, PGD_OFF_FILE_LOADED_OK,
  ];
  for (const off of fieldOffsets) {
    assert.equal(wasm.isaac_pgd_clear_field_status(off),
      pgdClearFieldStatus(off), `status(${off}) wasm`);
  }
  // map page: every byte is struct-reset, never zeroed
  for (let off = PGD_OFF_BESTIARY; off < PGD_OFF_PRE_SECTION_WORD; ++off) {
    assert.equal(wasm.isaac_pgd_clear_field_status(off),
      PGDCLR_STATUS_STRUCT_RESET, `map byte ${off}`);
  }
  // unknown offsets untouched
  for (const off of [-1, 0x03, 0xe9d, 0xf90, 0xffff]) {
    assert.equal(wasm.isaac_pgd_clear_field_status(off),
      pgdClearFieldStatus(off), `status edge ${off}`);
  }
});

test("Wasm matches JS: PGDCLR byte-zeroed over the whole object with wide args", () => {
  // full sweep 0..0xf90 with both arg families, plus the conditional edge
  for (const arg of [0, 1, 0x100, 0x101, 0x1ff, 0xffffffff]) {
    for (let off = 0; off <= 0xf90; ++off) {
      const n = wasm.isaac_pgd_clear_byte_zeroed(off, arg);
      assert.equal(n, pgdClearByteZeroed(off, arg), `byte_zeroed(${off}, ${arg.toString(16)})`);
    }
  }
  // randomized spot checks across the whole object
  const rng = makeRng(0x9262b000);
  for (let k = 0; k < 4000; ++k) {
    const off = pick(rng, 0x1000);
    const arg = rng();
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(off, arg),
      pgdClearByteZeroed(off, arg), `byte_zeroed(rng ${off}, ${arg.toString(16)})`);
  }
  // totals
  for (const arg of [0, 1, 0x100, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_clear_total_zeroed_bytes(arg),
      pgdClearTotalZeroedBytes(arg), `total(${arg.toString(16)})`);
  }
  assert.equal(wasm.isaac_pgd_clear_gap_offset(), PGDCLR_GAP_OFF);
  assert.equal(wasm.isaac_pgd_clear_gap_length(), PGDCLR_GAP_LEN);
  for (let i = -1; i <= PGDCLR_CALL_SITES; ++i) {
    assert.equal(wasm.isaac_pgd_clear_call_site_va(i), pgdClearCallSiteVa(i),
      `call site ${i}`);
  }
});

test("PE truth: PGDCLR gates behave natively exactly as the instruction stream spells them", () => {
  // the +0xf88 gate is a LOW-BYTE test: values whose low byte is zero skip
  assert.equal(wasm.isaac_pgd_clear_save_counter_cleared(0), 0);
  assert.equal(wasm.isaac_pgd_clear_save_counter_cleared(1), 1);
  assert.equal(wasm.isaac_pgd_clear_save_counter_cleared(0x100), 0);
  assert.equal(wasm.isaac_pgd_clear_save_counter_cleared(0x1ff), 1);
  assert.equal(wasm.isaac_pgd_clear_save_counter_cleared(0xffffffff), 1);
  // byte_zeroed mirrors it
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(0xf88, 0x100), 0);
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(0xf88, 0x101), 1);
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(0xf88, 0), 0);
  // the word [pgd+0] store is UNCONDITIONAL and covers both flag bytes
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(0, 0), 1);
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(1, 0), 1);
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(2, 0), 0, "+2 is SET to one, not zeroed");
  // the map page is struct-reset, never zeroed
  for (const off of [0xf64, 0xf70, 0xf7c, 0xf83]) {
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(off, 1), 0, `map byte ${off.toString(16)}`);
  }
  // the gap survives
  for (const off of [0xe9d, 0xe9e, 0xe9f]) {
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(off, 1), 0, `gap ${off.toString(16)}`);
  }
  // every zero row's first byte is zeroed for BOTH arg values (unconditional)
  for (const row of PGDCLR_ZERO_ROWS_TABLE) {
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(row.offset, 0), 1, `row ${row.va.toString(16)} arg0`);
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(row.offset, 1), 1);
    assert.equal(wasm.isaac_pgd_clear_byte_zeroed(row.offset + row.length - 1, 1), 1,
      `row tail ${row.va.toString(16)}`);
  }
  // flag stores are SET, not zeroed
  assert.equal(wasm.isaac_pgd_clear_byte_zeroed(0xf8c, 1), 0);
  // map order laws pinned natively
  assert.equal(wasm.isaac_pgd_clear_map_order_matches_reader(), 1);
  assert.equal(wasm.isaac_pgd_clear_map_order_matches_writer(), 0);
});

/* ---------- PGDTAIL ---------- */

const PGDTAIL_EXPECTED_STEPS = [
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b752, vaSibling: 0x0092bbe7 },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b755, vaSibling: 0x0092bbea },
  { kind: PGD_TAIL_KIND_HOST_CALL, vaImport: 0x0092b765, vaSibling: 0x0092bbfa },
  { kind: PGD_TAIL_KIND_EVENT, vaImport: 0x0092b770, vaSibling: 0x0092bc05 },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b77a, vaSibling: 0x0092bc0f },
  { kind: PGD_TAIL_KIND_GATE, vaImport: 0x0092b780, vaSibling: 0x0092bc15 },
  { kind: PGD_TAIL_KIND_WRITE, vaImport: 0x0092b790, vaSibling: 0x0092bc25 },
  { kind: PGD_TAIL_KIND_HOST_CALL, vaImport: 0x0092b793, vaSibling: 0x0092bc28 },
  { kind: PGD_TAIL_KIND_SAVE_SELECT, vaImport: 0x0092b7a3, vaSibling: 0x0092bc38 },
  { kind: PGD_TAIL_KIND_SAVE, vaImport: 0x0092b7bc, vaSibling: 0x0092bc51 },
];

test("PE truth: the v8 tail law is the same ten steps in both importers", () => {
  assert.equal(PGD_TAIL_STEPS, PGDTAIL_EXPECTED_STEPS.length);
  for (let s = 0; s < PGD_TAIL_STEPS; ++s) {
    assert.equal(PGD_TAIL_STEPS_TABLE[s].kind, PGDTAIL_EXPECTED_STEPS[s].kind);
    assert.equal(PGD_TAIL_STEPS_TABLE[s].vaImport, PGDTAIL_EXPECTED_STEPS[s].vaImport);
    assert.equal(PGD_TAIL_STEPS_TABLE[s].vaSibling, PGDTAIL_EXPECTED_STEPS[s].vaSibling);
  }
  // both tails start after their last array store and end at the save
  assert.equal(PGD_TAIL_IMPORT_BASE_VA, 0x0092b74b);
  assert.equal(PGD_TAIL_SIBLING_BASE_VA, 0x0092bbe7);
  assert.equal(PGD_TAIL_HOST_VA_9296C0, 0x009296c0);
  assert.equal(PGD_TAIL_HOST_VA_9292C0, 0x009292c0);
  assert.equal(PGD_TAIL_EVENT_VA, 0x00929b40);
  assert.equal(PGD_TAIL_SAVE_STEAM_VA, 0x00928ee0);
  assert.equal(PGD_TAIL_SAVE_LOCAL_VA, 0x009294f0);
  assert.equal(PGD_TAIL_PROBE_GLOBAL_VA, 0x00b18a1c);
  assert.equal(PGD_TAIL_PROBE_ARG, 0x00c5c3a4);
  assert.equal(PGD_TAIL_GAME_GUARD_OFF, 0x2a378);
  assert.equal(PGD_TAIL_GAME_2A3A4_OFF, 0x2a3a4);
  // the step kinds occur exactly once each in the expected positions
  const kinds = PGDTAIL_EXPECTED_STEPS.map((s) => s.kind);
  assert.deepEqual(kinds, [
    PGD_TAIL_KIND_WRITE, PGD_TAIL_KIND_WRITE, PGD_TAIL_KIND_HOST_CALL,
    PGD_TAIL_KIND_EVENT, PGD_TAIL_KIND_WRITE, PGD_TAIL_KIND_GATE,
    PGD_TAIL_KIND_WRITE, PGD_TAIL_KIND_HOST_CALL, PGD_TAIL_KIND_SAVE_SELECT,
    PGD_TAIL_KIND_SAVE,
  ]);
  // the two tails' VAs are both strictly increasing
  for (let s = 1; s < PGD_TAIL_STEPS; ++s) {
    assert.ok(PGDTAIL_EXPECTED_STEPS[s].vaImport > PGDTAIL_EXPECTED_STEPS[s - 1].vaImport);
    assert.ok(PGDTAIL_EXPECTED_STEPS[s].vaSibling > PGDTAIL_EXPECTED_STEPS[s - 1].vaSibling);
  }
});

test("Wasm matches JS: PGDTAIL steps and predicates", () => {
  const REC = SCRATCH_C;
  assert.equal(wasm.isaac_pgd_import_tail_step_count(), PGD_TAIL_STEPS);
  for (let s = -2; s <= PGD_TAIL_STEPS + 1; ++s) {
    const ok = wasm.isaac_pgd_import_tail_record(s, REC);
    assert.equal(ok, s >= 0 && s < PGD_TAIL_STEPS ? 1 : 0, `tail_record(${s}) ok`);
    if (ok) {
      const row = PGD_TAIL_STEPS_TABLE[s];
      assert.equal(readI32(view, REC + PGDTAIL_RECORD_OFF.step), s);
      assert.equal(readI32(view, REC + PGDTAIL_RECORD_OFF.kind), row.kind);
      assert.equal(readI32(view, REC + PGDTAIL_RECORD_OFF.va_import), row.vaImport);
      assert.equal(readI32(view, REC + PGDTAIL_RECORD_OFF.va_sibling), row.vaSibling);
    }
  }
  assert.equal(PGDTAIL_RECORD_SIZE, 20);
  assert.equal(wasm.isaac_pgd_import_tail_record(0, 0), 1, "null out is fine");
  // event args: IncreaseEventCounter(0,0) on every path
  assert.equal(wasm.isaac_pgd_import_tail_event_args_0(), 0);
  assert.equal(wasm.isaac_pgd_import_tail_event_args_1(), 0);
  assert.equal(pgdImportTailEventArgs0(), 0);
  assert.equal(pgdImportTailEventArgs1(), 0);
  // gate: two INDEPENDENT low-byte tests
  const gate = (c, f) => wasm.isaac_pgd_import_tail_gate_open(c, f);
  assert.equal(gate(0, 1), 0);
  assert.equal(gate(1, 0), 0);
  assert.equal(gate(1, 1), 1);
  assert.equal(gate(0x100, 1), 0, "changesmade low byte 0");
  assert.equal(gate(1, 0x100), 0, "file_loaded_ok low byte 0");
  assert.equal(gate(0x101, 0x1ff), 1);
  assert.equal(gate(0xffffffff, 0xffffffff), 1);
  for (let k = 0; k < 500; ++k) {
    const c = makeRng(0x92b78000 + k)();
    const f = makeRng(0x92b78500 + k)();
    assert.equal(gate(c, f), pgdImportTailGateOpen(c, f), `gate(${c.toString(16)},${f.toString(16)})`);
  }
  // selector: dereferenced dword nonzero AND game byte low byte nonzero
  const sel = (d, g) => wasm.isaac_pgd_import_tail_save_to_steam_needed(d, g);
  assert.equal(sel(0, 1), 0);
  assert.equal(sel(1, 0), 0);
  assert.equal(sel(1, 1), 1);
  assert.equal(sel(0x100, 1), 1, "probe dword test is full-word");
  assert.equal(sel(1, 0x100), 0, "game byte test is low-byte");
  assert.equal(sel(0xffffffff, 0xffffffff), 1);
  for (let k = 0; k < 500; ++k) {
    const d = makeRng(0x92b7ac00 + k)();
    const g = makeRng(0x92b7b100 + k)();
    assert.equal(sel(d, g), pgdImportTailSaveToSteamNeeded(d, g),
      `sel(${d.toString(16)},${g.toString(16)})`);
  }
  // lifecycle laws pinned natively
  assert.equal(wasm.isaac_pgd_import_tail_preserves_game_guard(), 1);
  assert.equal(wasm.isaac_pgd_import_tail_returns_one_unless_read_failed(), 1);
});

test("PE truth: reader identity correction (v7 claim disproven by census)", () => {
  // the v6 import reads via 0x009e4260 into its 0x4f0 snapshot
  assert.equal(wasm.isaac_pgd_import_reader_va(), 0x009e4260);
  assert.equal(wasm.isaac_pgd_import_reader_call_site_va(), 0x0092b574);
  assert.equal(wasm.isaac_pgd_import_reader_call_site_count(), 1);
  // the sibling reads via its OWN 0x0041d670 into the 0x700 snapshot
  assert.equal(wasm.isaac_pgd_sibling_reader_va(), 0x0041d670);
  assert.equal(wasm.isaac_pgd_sibling_reader_call_site_va(), 0x0092ba01);
  assert.equal(wasm.isaac_pgd_sibling_reader_call_site_count(), 1);
  // snapshot init: two 0x0041d560 calls
  assert.equal(wasm.isaac_pgd_sibling_snapshot_ctor_va(), 0x0041d560);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(0), 0x0092b9d7);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(1), 0x0092b9ea);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(2), 0);
  assert.equal(wasm.isaac_pgd_import_reader_is_shared_with_sibling(), 0);
  // JS mirror agrees
  assert.equal(pgdImportReaderVa(), 0x009e4260);
  assert.equal(pgdSiblingReaderVa(), 0x0041d670);
  assert.equal(pgdSiblingSnapshotCtorVa(), 0x0041d560);
  assert.equal(pgdImportReaderIsSharedWithSibling(), 0);
});

test("header and model record the v8 PGDTAIL law and the reader correction", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGD_TAIL_STEPS", "10");
  lit("ISAAC_PGD_TAIL_KIND_WRITE", "1");
  lit("ISAAC_PGD_TAIL_KIND_HOST_CALL", "2");
  lit("ISAAC_PGD_TAIL_KIND_EVENT", "3");
  lit("ISAAC_PGD_TAIL_KIND_GATE", "4");
  lit("ISAAC_PGD_TAIL_KIND_SAVE_SELECT", "5");
  lit("ISAAC_PGD_TAIL_KIND_SAVE", "6");
  lit("ISAAC_PGD_TAIL_HOST_VA_9296C0", "0x009296c0u");
  lit("ISAAC_PGD_TAIL_HOST_VA_9292C0", "0x009292c0u");
  lit("ISAAC_PGD_TAIL_EVENT_VA", "0x00929b40u");
  lit("ISAAC_PGD_TAIL_EVENT_ARGS", "0");
  lit("ISAAC_PGD_TAIL_SAVE_STEAM_VA", "0x00928ee0u");
  lit("ISAAC_PGD_TAIL_SAVE_LOCAL_VA", "0x009294f0u");
  lit("ISAAC_PGD_TAIL_PROBE_GLOBAL_VA", "0x00b18a1cu");
  lit("ISAAC_PGD_TAIL_PROBE_ARG", "0x00c5c3a4u");
  lit("ISAAC_PGD_TAIL_GAME_GUARD_OFF", "0x2a378");
  lit("ISAAC_PGD_TAIL_GAME_2A3A4_OFF", "0x2a3a4");
  // the correction must be recorded as a correction, with its evidence
  assert.match(h, /CORRECTED/);
  assert.match(h, /at v8 by a whole-image rel32 call census/);
  assert.match(h, /0x0041d670/);
  assert.match(h, /0x0041d560/);
  assert.match(h, /exactly ONE/);
  assert.match(h, /not the/);
  // the probe deref is unconditional — a null probe faults in the original
  assert.match(h, /dereferenced\s+UNCONDITIONALLY/);
  // the return law is explicit
  assert.match(h, /0 only on the read-failure/);
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.match(m, /Helpers ABI v8/);
  assert.match(m, /reader-identity correction/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
});


/* =====================================================================
   ABI v9 — PGDCT (sibling snapshot ctor 0x0041d560)
   Evidence: section-notes/pgd-v9/ (disasm-41d560-ctor.txt,
   disasm-92b930-restore.txt, NOTES.md). Rows below are transcribed from
   the instruction stream; the model tables are reasoned from the same
   listing, so a mis-transcribed entry shows up as a differential
   failure.
   ===================================================================== */

/* 10 zero rows, PE execution order (first-store VA per row). */
const PGDCT_EXPECTED_ZERO_ROWS = [
  { step: 0, offset: 0x6dc, length: 8, va: 0x0041d56e },
  { step: 1, offset: 0x038, length: 0x115, va: 0x0041d583 },
  { step: 2, offset: 0x3d8, length: 0x1ba, va: 0x0041d596 },
  { step: 3, offset: 0x150, length: 0x288, va: 0x0041d5ab },
  { step: 4, offset: 0x594, length: 0x37, va: 0x0041d5ad },
  { step: 5, offset: 0x5cb, length: 0x43, va: 0x0041d5e0 },
  { step: 6, offset: 0x60e, length: 0x1f, va: 0x0041d5ee },
  { step: 7, offset: 0x630, length: 0x5c, va: 0x0041d619 },
  { step: 8, offset: 0x68c, length: 0x4d, va: 0x0041d651 },
  { step: 9, offset: 0x000, length: 2, va: 0x0041d659 },
];

const PGDCT_EXPECTED_GAPS = [
  { step: 0, offset: 0x002, length: 0x36 },
  { step: 1, offset: 0x14d, length: 3 },
  { step: 2, offset: 0x592, length: 2 },
  { step: 3, offset: 0x62d, length: 3 },
  { step: 4, offset: 0x6d9, length: 3 },
  { step: 5, offset: 0x6e5, length: 0x1b },
];

/* IsaacPgdSnapshotCtorZeroRow: step, offset, length, va = 16 bytes */
const PGDCT_ZERO_RECORD_SIZE = 16;
const PGDCT_ZERO_RECORD_OFF = { step: 0, offset: 4, length: 8, va: 12 };
/* IsaacPgdSnapshotCtorGap: step, offset, length = 12 bytes */
const PGDCT_GAP_RECORD_SIZE = 12;
const PGDCT_GAP_RECORD_OFF = { step: 0, offset: 4, length: 8 };

test("PE truth: every v9 PGDCT row is a literal transcription of the disassembly", () => {
  assert.equal(PGDCT_ZERO_ROWS, PGDCT_EXPECTED_ZERO_ROWS.length);
  assert.deepEqual(PGDCT_ZERO_ROWS_TABLE, PGDCT_EXPECTED_ZERO_ROWS);
  let total = 0;
  for (const row of PGDCT_EXPECTED_ZERO_ROWS) {
    assert.equal(row.step, PGDCT_ZERO_ROWS_TABLE[row.step].step);
    assert.equal(row.offset, PGDCT_ZERO_ROWS_TABLE[row.step].offset);
    assert.equal(row.length, PGDCT_ZERO_ROWS_TABLE[row.step].length);
    assert.equal(row.va, PGDCT_ZERO_ROWS_TABLE[row.step].va);
    total += row.length;
  }
  assert.equal(total, PGDCT_TOTAL_ZEROED_BYTES, "row lengths sum to 0x6a3");
  // disjointness: no byte belongs to two rows
  const seen = new Set();
  for (const row of PGDCT_EXPECTED_ZERO_ROWS) {
    for (let o = row.offset; o < row.offset + row.length; ++o) {
      assert.ok(!seen.has(o), `overlap at ${o}`);
      seen.add(o);
    }
  }
  assert.equal(seen.size, PGDCT_TOTAL_ZEROED_BYTES);
  // the rep stosd row is 0xa2 dwords
  assert.equal(pgdSnapshotCtorZeroSpanDwords(PGDCT_STOSD_ROW), 0xa2);
  assert.equal(pgdSnapshotCtorZeroSpanDwords(0), 0);
  assert.equal(pgdSnapshotCtorZeroSpanDwords(9), 0);
  assert.equal(pgdSnapshotCtorZeroSpanDwords(10), 0);
  assert.equal(pgdSnapshotCtorZeroSpanDwords(-1), 0);
  // gaps
  assert.equal(PGDCT_GAP_COUNT, PGDCT_EXPECTED_GAPS.length);
  assert.deepEqual(PGDCT_GAPS_TABLE, PGDCT_EXPECTED_GAPS);
  let gapTotal = 0;
  for (const g of PGDCT_EXPECTED_GAPS) gapTotal += g.length;
  // zeroed + set-one + gaps tile the 0x700 snapshot exactly
  assert.equal(total + 1 + gapTotal, PGDCT_SNAPSHOT_BYTES);
  assert.equal(pgdSnapshotCtorTotalZeroedBytes(), total);
  assert.equal(pgdSnapshotCtorSetOneOffset(), PGDCT_SET_ONE_OFF);
  assert.equal(pgdSnapshotCtorSetOneValue(), PGDCT_SET_ONE_VALUE);
  assert.equal(pgdSnapshotCtorArgUnused(), 1);
});

test("header and model record the exact v9 PGDCT constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGDCT_VA", "0x0041d560u");
  lit("ISAAC_PGDCT_RET_VA", "0x0041d667u");
  lit("ISAAC_PGDCT_MEMSET_VA", "0x00af05e5u");
  lit("ISAAC_PGDCT_SNAPSHOT_BYTES", "0x700");
  lit("ISAAC_PGDCT_ZERO_ROWS", "10");
  lit("ISAAC_PGDCT_STOSD_ROW", "3");
  lit("ISAAC_PGDCT_STOSD_DWORDS", "0xa2");
  lit("ISAAC_PGDCT_TOTAL_ZEROED_BYTES", "0x6a3");
  lit("ISAAC_PGDCT_SET_ONE_OFF", "0x6e4");
  lit("ISAAC_PGDCT_SET_ONE_VALUE", "1");
  lit("ISAAC_PGDCT_GAP_COUNT", "6");
  lit("ISAAC_PGDCT_CALL_SITES", "2");
  // the ctor never reads its stack argument
  assert.match(h, /single stack argument[\s\S]*NEVER read/);
  // call-site census is recorded and matches the v8 sibling-ctor helpers
  assert.match(h, /EXACTLY two call sites/);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(0), 0x0092b9d7);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(1), 0x0092b9ea);
  assert.equal(wasm.isaac_pgd_sibling_ctor_call_site_va(2), 0);
  // the law-fix is recorded as a correction with its three-way proof
  assert.match(h, /LAW-FIXED AT v9/);
  assert.match(h, /0x1ba/);
  assert.match(h, /0x0041d9dc/); /* reader clamp */
  assert.match(h, /0x0092bae0/); /* movsw, no movsb */
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.match(m, /Helpers ABI v9/);
  assert.match(m, /LAW-FIXED AT v9/);
});

test("Wasm matches JS: PGDCT rows, gaps, byte-zeroed and set-one over the whole snapshot", () => {
  assert.equal(wasm.isaac_pgd_snapshot_ctor_zero_row_count(),
    pgdSnapshotCtorZeroRowCount());
  assert.equal(wasm.isaac_pgd_snapshot_ctor_zero_row_count(), PGDCT_ZERO_ROWS);
  const rec = new DataView(wasm.memory.buffer, SCRATCH_C, PGDCT_ZERO_RECORD_SIZE);
  for (let s = -2; s < PGDCT_ZERO_ROWS + 2; ++s) {
    // pre-fill the out slot with a sentinel so "untouched on failure" is
    // observable (the scratch is not zeroed between calls)
    rec.setInt32(PGDCT_ZERO_RECORD_OFF.step, 0x5a5a5a5a, true);
    rec.setInt32(PGDCT_ZERO_RECORD_OFF.offset, 0x5a5a5a5a, true);
    rec.setInt32(PGDCT_ZERO_RECORD_OFF.length, 0x5a5a5a5a, true);
    rec.setUint32(PGDCT_ZERO_RECORD_OFF.va, 0x5a5a5a5a, true);
    assert.equal(wasm.isaac_pgd_snapshot_ctor_zero_record(s, SCRATCH_C),
      s >= 0 && s < PGDCT_ZERO_ROWS ? 1 : 0, `zero_record(${s}) ret`);
    if (s >= 0 && s < PGDCT_ZERO_ROWS) {
      const row = PGDCT_ZERO_ROWS_TABLE[s];
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.step, true), row.step);
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.offset, true), row.offset);
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.length, true), row.length);
      assert.equal(rec.getUint32(PGDCT_ZERO_RECORD_OFF.va, true), row.va);
    } else {
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.step, true), 0x5a5a5a5a,
        "out untouched on failure");
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.offset, true), 0x5a5a5a5a);
      assert.equal(rec.getInt32(PGDCT_ZERO_RECORD_OFF.length, true), 0x5a5a5a5a);
    }
  }
  assert.equal(wasm.isaac_pgd_snapshot_ctor_gap_count(), pgdSnapshotCtorGapCount());
  const grec = new DataView(wasm.memory.buffer, SCRATCH_C, PGDCT_GAP_RECORD_SIZE);
  for (let s = -1; s < PGDCT_GAP_COUNT + 1; ++s) {
    grec.setInt32(PGDCT_GAP_RECORD_OFF.step, 0x5a5a5a5a, true);
    assert.equal(wasm.isaac_pgd_snapshot_ctor_gap_record(s, SCRATCH_C),
      s >= 0 && s < PGDCT_GAP_COUNT ? 1 : 0, `gap_record(${s}) ret`);
    if (s >= 0 && s < PGDCT_GAP_COUNT) {
      const g = PGDCT_GAPS_TABLE[s];
      assert.equal(grec.getInt32(PGDCT_GAP_RECORD_OFF.step, true), g.step);
      assert.equal(grec.getInt32(PGDCT_GAP_RECORD_OFF.offset, true), g.offset);
      assert.equal(grec.getInt32(PGDCT_GAP_RECORD_OFF.length, true), g.length);
    } else {
      assert.equal(grec.getInt32(PGDCT_GAP_RECORD_OFF.step, true), 0x5a5a5a5a,
        "gap out untouched on failure");
    }
  }
  // byte-zeroed over every offset of the snapshot, plus wide/negative edges
  for (let o = 0; o < PGDCT_SNAPSHOT_BYTES; ++o) {
    const w = wasm.isaac_pgd_snapshot_ctor_byte_zeroed(o);
    assert.equal(w, pgdSnapshotCtorByteZeroed(o), `byte_zeroed(${o})`);
    // consistency with the row table (model side)
    const inRows = PGDCT_ZERO_ROWS_TABLE.some(
      (r) => o >= r.offset && o < r.offset + r.length,
    );
    assert.equal(w, inRows ? 1 : 0, `byte_zeroed(${o}) vs rows`);
    // the set-one byte is never a zero
    if (o === PGDCT_SET_ONE_OFF) assert.equal(w, 0);
  }
  for (const o of [-0x10000, -1, 0x700, 0x701, 0x7fffffff, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_snapshot_ctor_byte_zeroed(o), 0, `byte_zeroed(${o})`);
    assert.equal(pgdSnapshotCtorByteZeroed(o), 0);
  }
  assert.equal(wasm.isaac_pgd_snapshot_ctor_total_zeroed_bytes(),
    pgdSnapshotCtorTotalZeroedBytes());
  assert.equal(wasm.isaac_pgd_snapshot_ctor_total_zeroed_bytes(), PGDCT_TOTAL_ZEROED_BYTES);
  assert.equal(wasm.isaac_pgd_snapshot_ctor_set_one_offset(),
    pgdSnapshotCtorSetOneOffset());
  assert.equal(wasm.isaac_pgd_snapshot_ctor_set_one_value(),
    pgdSnapshotCtorSetOneValue());
  assert.equal(wasm.isaac_pgd_snapshot_ctor_arg_unused(),
    pgdSnapshotCtorArgUnused());
});

test("PE truth: the ctor pre-sizes every sibling restore source (31/31)", () => {
  const wasmCovered = (o, l) => wasm.isaac_pgd_snapshot_ctor_restore_source_covered(o, l);
  for (const row of PGD_SIBLING_COPY_ROWS_TABLE) {
    assert.equal(wasmCovered(row.src, row.len), 1,
      `restore source [0x${row.src.toString(16)}, +0x${row.len.toString(16)}) not pre-zeroed`);
    assert.equal(pgdSnapshotCtorRestoreSourceCovered(row.src, row.len), 1,
      `model restore source [0x${row.src.toString(16)}, +0x${row.len.toString(16)})`);
  }
  assert.equal(wasm.isaac_pgd_snapshot_ctor_covers_all_restore_sources(), 1);
  assert.equal(pgdSnapshotCtorCoversAllRestoreSources(), 1);
  // NOT the whole snapshot as one range: the 6 gaps and the set-one byte
  // (0x6a3 zeroed + 1 set-one + 0x5c gaps == 0x700) are excluded.
  assert.equal(wasmCovered(0, PGDCT_SNAPSHOT_BYTES), 0);
  // negatives: the byte past the collection row (0x592), each gap, the
  // set-one byte, out-of-snapshot, and invalid arguments
  assert.equal(wasmCovered(0x3d8, 0x1bb), 0, "0x1bb collection overcount byte is NOT covered");
  assert.equal(wasmCovered(0x592, 1), 0, "gap after collection");
  assert.equal(wasmCovered(0x14d, 3), 0, "gap between achievements and events");
  assert.equal(wasmCovered(0x62d, 3), 0, "gap inside challenges/sec8 boundary");
  assert.equal(wasmCovered(0x6d9, 3), 0, "gap before +0x6dc");
  assert.equal(wasmCovered(0x6e5, 1), 0, "tail gap");
  assert.equal(wasmCovered(0x6e4, 1), 0, "set-one byte is not a zero");
  assert.equal(wasmCovered(0, 0x701), 0, "past the snapshot");
  assert.equal(wasmCovered(-1, 1), 0, "negative offset");
  assert.equal(wasmCovered(0, -1), 0, "negative length");
  assert.equal(wasmCovered(0x100, 0x7fffffff), 0, "huge length");
  assert.equal(wasmCovered(0, 0), 1, "empty range is trivially covered");
  assert.equal(pgdSnapshotCtorRestoreSourceCovered(0x3d8, 0x1bb), 0);
  assert.equal(pgdSnapshotCtorRestoreSourceCovered(0, 0), 1);
});

test("Wasm matches JS: PGDCT restore-source coverage randomized differential", () => {
  const rng = makeRng(0x0041d560);
  for (let k = 0; k < 2000; ++k) {
    const o = pick(rng, 0x900) - 0x100;             /* -0x100..0x7ff */
    const l = pick(rng, 0x900) - 0x100;
    assert.equal(
      wasm.isaac_pgd_snapshot_ctor_restore_source_covered(o, l) >>> 0,
      pgdSnapshotCtorRestoreSourceCovered(o, l),
      `restore_source_covered(${o},${l})`,
    );
  }
  // wide values unmasked (the uint32_t contract)
  for (const [o, l] of [[0x100, 0xffffffff], [0xffffffff, 1], [0x80000000, 0x100],
                        [0x100, 0x1ff], [0x6dc, 0xffffffff], [0x38, 0x115]]) {
    assert.equal(
      wasm.isaac_pgd_snapshot_ctor_restore_source_covered(o, l) >>> 0,
      pgdSnapshotCtorRestoreSourceCovered(o, l),
      `restore_source_covered(${o},${l})`,
    );
  }
});

test("PE truth: v9 law-fix — the sibling collection restore copies 0x1ba bytes", () => {
  // three-way agreement: ctor memset 0x1ba (0x0041d588) == restore copy
  // (rep movsd ecx=0x6e @ 0x92bade + movsw @ 0x92bae0) == reader clamp
  // 0x1ba (0x0041d9dc)
  assert.equal(PGD_SIBLING_WRITTEN_COLLECTION, 0x1ba);
  assert.equal(PGD_SIBLING_COPY_ROWS_TABLE[12].src, 0x3d8);
  assert.equal(PGD_SIBLING_COPY_ROWS_TABLE[12].dst, 0xae8);
  assert.equal(PGD_SIBLING_COPY_ROWS_TABLE[12].len, 0x1ba);
  assert.equal(PGDCT_ZERO_ROWS_TABLE[2].offset, 0x3d8);
  assert.equal(PGDCT_ZERO_ROWS_TABLE[2].length, 0x1ba);
  // the landed per-array law follows the fix
  assert.equal(wasm.isaac_pgd_sibling_written_byte_count(PGD_OFF_ITEM_COLLECTION),
    0x1ba);
  assert.equal(pgdSiblingWrittenByteCount(PGD_OFF_ITEM_COLLECTION), 0x1ba);
  assert.equal(wasm.isaac_pgd_sibling_stale_byte_count(PGD_OFF_ITEM_COLLECTION),
    PGD_COUNT_ITEM_COLLECTION - 0x1ba);
  // element edges: 0x1b9 (last copied byte) written, 0x1ba and 0x1bb stale
  assert.equal(wasm.isaac_pgd_sibling_element_written(PGD_OFF_ITEM_COLLECTION, 0x1b9), 1);
  assert.equal(wasm.isaac_pgd_sibling_element_written(PGD_OFF_ITEM_COLLECTION, 0x1ba), 0);
  assert.equal(wasm.isaac_pgd_sibling_element_written(PGD_OFF_ITEM_COLLECTION, 0x1bb), 0);
  assert.equal(pgdSiblingElementWritten(PGD_OFF_ITEM_COLLECTION, 0x1b9), 1);
  assert.equal(pgdSiblingElementWritten(PGD_OFF_ITEM_COLLECTION, 0x1ba), 0);
  // the achievements row keeps its movsb (0x115) — only collection changed
  assert.equal(PGD_SIBLING_WRITTEN_ACHIEVEMENTS, 0x115);
  assert.equal(PGD_SIBLING_COPY_ROWS_TABLE[0].len, 0x115);
  assert.equal(wasm.isaac_pgd_sibling_written_byte_count(PGD_OFF_ACHIEVEMENTS), 0x115);
});


/* =====================================================================
   ABI v10 — PGDICT (import snapshot ctor 0x009e3dc0)
   Evidence: section-notes/pgd-v10/disasm-9e3dc0-import-ctor.txt plus
   independent PE decode (raw 0x5e31c0, 3 memset rel32 -> 0xaf05e5,
   ret 4, two E8 sites 0x92b4d0 / 0x92b4e0). Rows below are transcribed
   from the instruction stream; the model tables are reasoned from the
   same listing, so a mis-transcribed entry shows up as a differential
   failure.
   ===================================================================== */

/* 9 zero rows, PE execution order (first-store VA per row). */
const PGDICT_EXPECTED_ZERO_ROWS = [
  { step: 0, offset: 0x4a0, length: 8, va: 0x009e3dce },
  { step: 1, offset: 0x038, length: 0xb3, va: 0x009e3de3 },
  { step: 2, offset: 0x268, length: 0x15b, va: 0x009e3df6 },
  { step: 3, offset: 0x0ec, length: 0x17c, va: 0x009e3e0b },
  { step: 4, offset: 0x3c4, length: 0x37, va: 0x009e3e0d },
  { step: 5, offset: 0x3fb, length: 0x39, va: 0x009e3e40 },
  { step: 6, offset: 0x434, length: 0x15, va: 0x009e3e4b },
  { step: 7, offset: 0x44c, length: 0x54, va: 0x009e3e63 },
  { step: 8, offset: 0x000, length: 2, va: 0x009e3e91 },
];

const PGDICT_EXPECTED_GAPS = [
  { step: 0, offset: 0x002, length: 0x36 },
  { step: 1, offset: 0x0eb, length: 1 },
  { step: 2, offset: 0x3c3, length: 1 },
  { step: 3, offset: 0x449, length: 3 },
  { step: 4, offset: 0x4a8, length: 0x48 },
];

const PGDICT_ZERO_RECORD_SIZE = 16;
const PGDICT_ZERO_RECORD_OFF = { step: 0, offset: 4, length: 8, va: 12 };
const PGDICT_GAP_RECORD_SIZE = 12;
const PGDICT_GAP_RECORD_OFF = { step: 0, offset: 4, length: 8 };

test("PE truth: every v10 PGDICT row is a literal transcription of the disassembly", () => {
  assert.equal(PGDICT_ZERO_ROWS, PGDICT_EXPECTED_ZERO_ROWS.length);
  assert.deepEqual(PGDICT_ZERO_ROWS_TABLE, PGDICT_EXPECTED_ZERO_ROWS);
  let total = 0;
  for (const row of PGDICT_EXPECTED_ZERO_ROWS) {
    assert.equal(row.step, PGDICT_ZERO_ROWS_TABLE[row.step].step);
    assert.equal(row.offset, PGDICT_ZERO_ROWS_TABLE[row.step].offset);
    assert.equal(row.length, PGDICT_ZERO_ROWS_TABLE[row.step].length);
    assert.equal(row.va, PGDICT_ZERO_ROWS_TABLE[row.step].va);
    total += row.length;
  }
  assert.equal(total, PGDICT_TOTAL_ZEROED_BYTES, "row lengths sum to 0x46d");
  const seen = new Set();
  for (const row of PGDICT_EXPECTED_ZERO_ROWS) {
    for (let o = row.offset; o < row.offset + row.length; ++o) {
      assert.ok(!seen.has(o), `overlap at ${o}`);
      seen.add(o);
    }
  }
  assert.equal(seen.size, PGDICT_TOTAL_ZEROED_BYTES);
  assert.equal(pgdImportCtorZeroSpanDwords(PGDICT_STOSD_ROW), 0x5f);
  assert.equal(pgdImportCtorZeroSpanDwords(0), 0);
  assert.equal(pgdImportCtorZeroSpanDwords(8), 0);
  assert.equal(pgdImportCtorZeroSpanDwords(9), 0);
  assert.equal(pgdImportCtorZeroSpanDwords(-1), 0);
  assert.equal(PGDICT_GAP_COUNT, PGDICT_EXPECTED_GAPS.length);
  assert.deepEqual(PGDICT_GAPS_TABLE, PGDICT_EXPECTED_GAPS);
  let gapTotal = 0;
  for (const g of PGDICT_EXPECTED_GAPS) gapTotal += g.length;
  assert.equal(total + gapTotal, PGDICT_SNAPSHOT_BYTES);
  assert.equal(pgdImportCtorTotalZeroedBytes(), total);
  assert.equal(pgdImportCtorSetOneCount(), 0);
  assert.equal(pgdImportCtorSetOneOffset(), -1);
  assert.equal(pgdImportCtorSetOneValue(), 0);
  assert.equal(pgdImportCtorArgUnused(), 1);
});

test("header and model record the exact v10 PGDICT constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGDICT_VA", "0x009e3dc0u");
  lit("ISAAC_PGDICT_RET_VA", "0x009e3e97u");
  lit("ISAAC_PGDICT_MEMSET_VA", "0x00af05e5u");
  lit("ISAAC_PGDICT_SNAPSHOT_BYTES", "0x4f0");
  lit("ISAAC_PGDICT_ZERO_ROWS", "9");
  lit("ISAAC_PGDICT_STOSD_ROW", "3");
  lit("ISAAC_PGDICT_STOSD_DWORDS", "0x5f");
  lit("ISAAC_PGDICT_TOTAL_ZEROED_BYTES", "0x46d");
  lit("ISAAC_PGDICT_SET_ONE_COUNT", "0");
  lit("ISAAC_PGDICT_SET_ONE_OFF", "-1");
  lit("ISAAC_PGDICT_SET_ONE_VALUE", "0");
  lit("ISAAC_PGDICT_GAP_COUNT", "5");
  lit("ISAAC_PGDICT_CALL_SITES", "2");
  assert.match(h, /single stack argument[\s\S]*NEVER read/);
  assert.match(h, /EXACTLY two call sites/);
  assert.match(h, /0x0092b4d0/);
  assert.match(h, /0x0092b4e0/);
  assert.match(h, /There is NO set-one store/);
  assert.equal(wasm.isaac_pgd_import_ctor_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_import_ctor_call_site_va(0), 0x0092b4d0);
  assert.equal(wasm.isaac_pgd_import_ctor_call_site_va(1), 0x0092b4e0);
  assert.equal(wasm.isaac_pgd_import_ctor_call_site_va(2), 0);
  assert.equal(wasm.isaac_pgd_import_snapshot_ctor_va(), 0x009e3dc0);
  assert.equal(pgdImportSnapshotCtorVa(), 0x009e3dc0);
  assert.equal(pgdImportCtorCallSiteCount(), 2);
  assert.equal(pgdImportCtorCallSiteVa(0), 0x0092b4d0);
  assert.equal(pgdImportCtorCallSiteVa(1), 0x0092b4e0);
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.match(m, /Helpers ABI v10/);
  assert.match(m, /PGDICT/);
});

test("Wasm matches JS: PGDICT rows, gaps, byte-zeroed over the whole snapshot", () => {
  assert.equal(wasm.isaac_pgd_import_ctor_zero_row_count(),
    pgdImportCtorZeroRowCount());
  assert.equal(wasm.isaac_pgd_import_ctor_zero_row_count(), PGDICT_ZERO_ROWS);
  const rec = new DataView(wasm.memory.buffer, SCRATCH_C, PGDICT_ZERO_RECORD_SIZE);
  for (let s = -2; s < PGDICT_ZERO_ROWS + 2; ++s) {
    rec.setInt32(PGDICT_ZERO_RECORD_OFF.step, 0x5a5a5a5a, true);
    rec.setInt32(PGDICT_ZERO_RECORD_OFF.offset, 0x5a5a5a5a, true);
    rec.setInt32(PGDICT_ZERO_RECORD_OFF.length, 0x5a5a5a5a, true);
    rec.setUint32(PGDICT_ZERO_RECORD_OFF.va, 0x5a5a5a5a, true);
    assert.equal(wasm.isaac_pgd_import_ctor_zero_record(s, SCRATCH_C),
      s >= 0 && s < PGDICT_ZERO_ROWS ? 1 : 0, `zero_record(${s}) ret`);
    if (s >= 0 && s < PGDICT_ZERO_ROWS) {
      const row = PGDICT_ZERO_ROWS_TABLE[s];
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.step, true), row.step);
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.offset, true), row.offset);
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.length, true), row.length);
      assert.equal(rec.getUint32(PGDICT_ZERO_RECORD_OFF.va, true), row.va);
    } else {
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.step, true), 0x5a5a5a5a,
        "out untouched on failure");
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.offset, true), 0x5a5a5a5a);
      assert.equal(rec.getInt32(PGDICT_ZERO_RECORD_OFF.length, true), 0x5a5a5a5a);
    }
  }
  assert.equal(wasm.isaac_pgd_import_ctor_gap_count(), pgdImportCtorGapCount());
  const grec = new DataView(wasm.memory.buffer, SCRATCH_C, PGDICT_GAP_RECORD_SIZE);
  for (let s = -1; s < PGDICT_GAP_COUNT + 1; ++s) {
    grec.setInt32(PGDICT_GAP_RECORD_OFF.step, 0x5a5a5a5a, true);
    assert.equal(wasm.isaac_pgd_import_ctor_gap_record(s, SCRATCH_C),
      s >= 0 && s < PGDICT_GAP_COUNT ? 1 : 0, `gap_record(${s}) ret`);
    if (s >= 0 && s < PGDICT_GAP_COUNT) {
      const g = PGDICT_GAPS_TABLE[s];
      assert.equal(grec.getInt32(PGDICT_GAP_RECORD_OFF.step, true), g.step);
      assert.equal(grec.getInt32(PGDICT_GAP_RECORD_OFF.offset, true), g.offset);
      assert.equal(grec.getInt32(PGDICT_GAP_RECORD_OFF.length, true), g.length);
    } else {
      assert.equal(grec.getInt32(PGDICT_GAP_RECORD_OFF.step, true), 0x5a5a5a5a,
        "gap out untouched on failure");
    }
  }
  for (let o = 0; o < PGDICT_SNAPSHOT_BYTES; ++o) {
    const w = wasm.isaac_pgd_import_ctor_byte_zeroed(o);
    assert.equal(w, pgdImportCtorByteZeroed(o), `byte_zeroed(${o})`);
    const inRows = PGDICT_ZERO_ROWS_TABLE.some(
      (r) => o >= r.offset && o < r.offset + r.length,
    );
    assert.equal(w, inRows ? 1 : 0, `byte_zeroed(${o}) vs rows`);
  }
  for (const o of [-0x10000, -1, 0x4f0, 0x4f1, 0x7fffffff, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_import_ctor_byte_zeroed(o), 0, `byte_zeroed(${o})`);
    assert.equal(pgdImportCtorByteZeroed(o), 0);
  }
  assert.equal(wasm.isaac_pgd_import_ctor_total_zeroed_bytes(),
    pgdImportCtorTotalZeroedBytes());
  assert.equal(wasm.isaac_pgd_import_ctor_total_zeroed_bytes(), PGDICT_TOTAL_ZEROED_BYTES);
  assert.equal(wasm.isaac_pgd_import_ctor_set_one_offset(),
    pgdImportCtorSetOneOffset());
  assert.equal(wasm.isaac_pgd_import_ctor_set_one_value(),
    pgdImportCtorSetOneValue());
  assert.equal(wasm.isaac_pgd_import_ctor_set_one_count(),
    pgdImportCtorSetOneCount());
  assert.equal(wasm.isaac_pgd_import_ctor_arg_unused(),
    pgdImportCtorArgUnused());
});

test("PE truth: the import ctor pre-sizes every PGDCOV restore source (25/25)", () => {
  const wasmCovered = (o, l) => wasm.isaac_pgd_import_ctor_restore_source_covered(o, l);
  for (const row of PGD_IMPORT_COPY_ROWS_TABLE) {
    assert.equal(wasmCovered(row.src, row.len), 1,
      `restore source [0x${row.src.toString(16)}, +0x${row.len.toString(16)}) not pre-zeroed`);
    assert.equal(pgdImportCtorRestoreSourceCovered(row.src, row.len), 1,
      `model restore source [0x${row.src.toString(16)}, +0x${row.len.toString(16)})`);
  }
  assert.equal(wasm.isaac_pgd_import_ctor_covers_all_restore_sources(), 1);
  assert.equal(pgdImportCtorCoversAllRestoreSources(), 1);
  assert.equal(wasmCovered(0, PGDICT_SNAPSHOT_BYTES), 0);
  assert.equal(wasmCovered(0x268, 0x15c), 0, "0x15c collection overcount byte is NOT covered");
  assert.equal(wasmCovered(0x3c3, 1), 0, "gap after collection");
  assert.equal(wasmCovered(0x0eb, 1), 0, "gap between achievements and events");
  assert.equal(wasmCovered(0x449, 3), 0, "gap after challenges");
  assert.equal(wasmCovered(0x4a8, 1), 0, "tail gap");
  assert.equal(wasmCovered(0x002, 1), 0, "string-preinit gap");
  assert.equal(wasmCovered(0, 0x4f1), 0, "past the snapshot");
  assert.equal(wasmCovered(-1, 1), 0, "negative offset");
  assert.equal(wasmCovered(0, -1), 0, "negative length");
  assert.equal(wasmCovered(0x100, 0x7fffffff), 0, "huge length");
  assert.equal(wasmCovered(0, 0), 1, "empty range is trivially covered");
  assert.equal(pgdImportCtorRestoreSourceCovered(0x268, 0x15c), 0);
  assert.equal(pgdImportCtorRestoreSourceCovered(0, 0), 1);
});

test("Wasm matches JS: PGDICT restore-source coverage randomized differential", () => {
  const rng = makeRng(0x009e3dc0);
  for (let k = 0; k < 2000; ++k) {
    const o = pick(rng, 0x700) - 0x100;
    const l = pick(rng, 0x700) - 0x100;
    assert.equal(
      wasm.isaac_pgd_import_ctor_restore_source_covered(o, l) >>> 0,
      pgdImportCtorRestoreSourceCovered(o, l),
      `restore_source_covered(${o},${l})`,
    );
  }
  for (const [o, l] of [[0x100, 0xffffffff], [0xffffffff, 1], [0x80000000, 0x100],
                        [0x100, 0x1ff], [0x4a0, 0xffffffff], [0x38, 0xb3]]) {
    assert.equal(
      wasm.isaac_pgd_import_ctor_restore_source_covered(o, l) >>> 0,
      pgdImportCtorRestoreSourceCovered(o, l),
      `restore_source_covered(${o},${l})`,
    );
  }
});

test("PE truth: v10 mutant — sibling ctor widths are not the import ctor", () => {
  /* A mutant that copies PGDCT's 0xa2-dword stosd / 0x1ba collection /
     0x115 achievements into PGDICT must die: the import snapshot is
     Rebirth-era (0x5f / 0x15b / 0xb3). */
  assert.notEqual(PGDICT_STOSD_DWORDS, PGDCT_STOSD_DWORDS);
  assert.notEqual(PGDICT_ZERO_ROWS_TABLE[2].length, PGDCT_ZERO_ROWS_TABLE[2].length);
  assert.notEqual(PGDICT_ZERO_ROWS_TABLE[1].length, PGDCT_ZERO_ROWS_TABLE[1].length);
  assert.equal(PGDICT_STOSD_DWORDS, 0x5f);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[1].length, 0xb3);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[2].length, 0x15b);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[3].length, 0x17c);
  assert.equal(PGDICT_SET_ONE_COUNT, 0);
  assert.notEqual(PGDCT_SET_ONE_VALUE, 0);
  assert.equal(wasm.isaac_pgd_import_ctor_zero_span_dwords(3), 0x5f);
  assert.equal(wasm.isaac_pgd_snapshot_ctor_zero_span_dwords(3), 0xa2);
  assert.equal(PGD_IMPORT_WRITTEN_ACHIEVEMENTS, 0xb3);
  assert.equal(PGD_IMPORT_WRITTEN_COLLECTION, 0x15b);
  assert.equal(PGD_IMPORT_WRITTEN_EVENT, 0x17c);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[1].offset, 0x38);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[2].offset, 0x268);
  assert.equal(PGDICT_ZERO_ROWS_TABLE[3].offset, 0xec);
  /* widening the collection memset by one byte would swallow the 0x3c3 gap */
  assert.equal(pgdImportCtorByteZeroed(0x3c3), 0);
  assert.equal(wasm.isaac_pgd_import_ctor_byte_zeroed(0x3c3), 0);
  assert.equal(pgdImportCtorRestoreSourceCovered(0x268, 0x15c), 0);
});



/* =====================================================================
   ABI v11 — PGDCLMP (import-reader post-loop clamp 0x009e4af0)
   Evidence: output/decomp/5129df723e64/section-notes/cpu-dump/009e4af0.txt
   (0x400 window, 0 E8, 64 stores, one resync at 0x9e4eeb) plus the
   linear decode through `ret` @ 0x009e4f71. Whole-.text E8 census:
   one site 0x009e4613. identify-zhl: 0 exact matches. Tail pairs
   below are transcribed from the instruction stream, NOT from the
   C++ table.
   ===================================================================== */

const PGDCLMP_EXPECTED_TAIL = [
  { gate: 0x11c, slot: 0x488 },
  { gate: 0x114, slot: 0x48c },
  { gate: 0x14c, slot: 0x494 },
  { gate: 0x148, slot: 0x490 },
  { gate: 0x150, slot: 0x498 },
];

function snapI32(buf, off) {
  return (buf[off] | (buf[off + 1] << 8) | (buf[off + 2] << 16) |
          (buf[off + 3] << 24)) | 0;
}
function snapPutI32(buf, off, v) {
  const u = v >>> 0;
  buf[off] = u & 0xff;
  buf[off + 1] = (u >>> 8) & 0xff;
  buf[off + 2] = (u >>> 16) & 0xff;
  buf[off + 3] = (u >>> 24) & 0xff;
}

test("PE truth: every v11 PGDCLMP tail pair is a literal transcription", () => {
  assert.equal(PGDCLMP_TAIL_COUNT, PGDCLMP_EXPECTED_TAIL.length);
  assert.equal(PGDCLMP_TAIL_GATES.length, 5);
  assert.equal(PGDCLMP_TAIL_SLOTS.length, 5);
  for (let i = 0; i < PGDCLMP_EXPECTED_TAIL.length; i++) {
    assert.equal(PGDCLMP_TAIL_GATES[i], PGDCLMP_EXPECTED_TAIL[i].gate,
      `gate[${i}]`);
    assert.equal(PGDCLMP_TAIL_SLOTS[i], PGDCLMP_EXPECTED_TAIL[i].slot,
      `slot[${i}]`);
    assert.equal(pgdReaderClampTailGateOffset(i), PGDCLMP_EXPECTED_TAIL[i].gate);
    assert.equal(pgdReaderClampTailSlotOffset(i), PGDCLMP_EXPECTED_TAIL[i].slot);
  }
  /* +0x494 BEFORE +0x490 — PE order, not sorted */
  assert.ok(PGDCLMP_TAIL_SLOTS[2] > PGDCLMP_TAIL_SLOTS[3]);
  assert.equal(PGDCLMP_TAIL_SLOTS[2], 0x494);
  assert.equal(PGDCLMP_TAIL_SLOTS[3], 0x490);
  assert.equal(pgdReaderClampTailGateOffset(-1), -1);
  assert.equal(pgdReaderClampTailGateOffset(5), -1);
  assert.equal(pgdReaderClampTailSlotOffset(5), -1);
  assert.equal(pgdReaderClampStairCount(), 12);
  for (let s = 0; s < 12; s++) {
    assert.equal(pgdReaderClampStairOffset(s), 0x458 + s * 4);
  }
  assert.equal(pgdReaderClampStairOffset(-1), -1);
  assert.equal(pgdReaderClampStairOffset(12), -1);
});

test("header and model record the exact v11 PGDCLMP constants", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGDCLMP_VA", "0x009e4af0u");
  lit("ISAAC_PGDCLMP_RET_VA", "0x009e4f71u");
  lit("ISAAC_PGDCLMP_FLOOR", "1");
  lit("ISAAC_PGDCLMP_FLAG_OFF", "0x3c");
  lit("ISAAC_PGDCLMP_COUNT_OFF", "0xf0");
  lit("ISAAC_PGDCLMP_ACCUM_OFF", "0x454");
  lit("ISAAC_PGDCLMP_STAIR_BASE", "0x458");
  lit("ISAAC_PGDCLMP_STAIR_COUNT", "12");
  lit("ISAAC_PGDCLMP_STAIR_MAX_N", "11");
  lit("ISAAC_PGDCLMP_TAIL_COUNT", "5");
  lit("ISAAC_PGDCLMP_CALL_SITES", "1");
  lit("ISAAC_PGDCLMP_CALL_SITE_VA", "0x009e4613u");
  lit("ISAAC_PGDCLMP_HOST_CALLS", "0");
  lit("ISAAC_PGDCLMP_BODY_BYTES", "1154");
  lit("ISAAC_PGDCLMP_MIN_SNAP", "0x49c");
  assert.match(h, /SIGNED `cmovg`/);
  assert.match(h, /0x009e4613/);
  assert.match(h, /EXACTLY one call site/);
  assert.match(h, /\+0x494 is BEFORE \+0x490/);
  const m = readFileSync(
    join(root, "scripts", "decomp", "pgd-pure-model.mjs"),
    "utf8",
  );
  assert.match(m, /Helpers ABI v13/);
  assert.match(m, /PGDCLMP/);
  assert.equal(PGDCLMP_VA, 0x009e4af0);
  assert.equal(PGDCLMP_RET_VA, 0x009e4f71);
  assert.equal(PGDCLMP_CALL_SITE_VA, 0x009e4613);
  assert.equal(PGDCLMP_BODY_BYTES, 1154);
});

test("Wasm matches JS: PGDCLMP floor / flag / stair / tail predicates", () => {
  const floors = [0, 1, 2, -1, -0x80000000, 0x7fffffff, 0x80000000, 0xffffffff];
  for (const v of floors) {
    assert.equal(wasm.isaac_pgd_reader_clamp_floor(v), pgdReaderClampFloor(v),
      `floor(${v})`);
  }
  /* SIGNED: 0 and negatives become 1; 2 stays 2 */
  assert.equal(pgdReaderClampFloor(0), 1);
  assert.equal(pgdReaderClampFloor(-5), 1);
  assert.equal(pgdReaderClampFloor(1), 1);
  assert.equal(pgdReaderClampFloor(2), 2);
  assert.equal(pgdReaderClampFloor(0x80000000), 1); /* asI32 = -2147483648 */

  /* flag is LOW BYTE only — 0x100 must NOT take the block */
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(0), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(1), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(0x100), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(0xff00), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(0xffffffff), 1);
  assert.equal(pgdReaderClampFlagBlockTaken(0x100), 0);
  assert.equal(pgdReaderClampFlagBlockTaken(0x101), 1);

  /* stair 0 = flag block; 1..11 = SIGNED count >= k */
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 11, 0), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(1, 0, 0), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0x100, 11, 0), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 0, 1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 10, 11), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 11, 11), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, -1, 1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 0x80000000, 1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 5, -1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 5, 12), 0);

  /* tail: SIGNED >= 1 */
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_taken(0), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_taken(1), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_taken(-1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_taken(0x80000000), 0);
  assert.equal(pgdReaderClampTailTaken(0x7fffffff), 1);

  assert.equal(wasm.isaac_pgd_reader_clamp_va(), pgdReaderClampVa());
  assert.equal(wasm.isaac_pgd_reader_clamp_ret_va(), pgdReaderClampRetVa());
  assert.equal(wasm.isaac_pgd_reader_clamp_call_site_count(), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_call_site_va(0), 0x009e4613);
  assert.equal(wasm.isaac_pgd_reader_clamp_call_site_va(1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_call_site_va(-1), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_host_calls(), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_floor_const(), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_count(), 12);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_count(), 5);
});

test("Wasm matches JS: PGDCLMP apply end-to-end in linear memory", () => {
  const N = PGDCLMP_MIN_SNAP;
  const js = new Uint8Array(N);
  for (let i = 0; i < N; i++) js[i] = 0x5a;
  js[PGDCLMP_FLAG_OFF] = 1;
  snapPutI32(js, PGDCLMP_COUNT_OFF, 3);
  snapPutI32(js, PGDCLMP_ACCUM_OFF, 0);
  for (let s = 0; s < 12; s++) snapPutI32(js, 0x458 + s * 4, 0);
  snapPutI32(js, 0x11c, 2);
  snapPutI32(js, 0x114, 0);
  snapPutI32(js, 0x14c, 1);
  snapPutI32(js, 0x148, -3);
  snapPutI32(js, 0x150, 7);
  snapPutI32(js, 0x488, 0);
  snapPutI32(js, 0x48c, 4);
  snapPutI32(js, 0x494, 0);
  snapPutI32(js, 0x490, 9);
  snapPutI32(js, 0x498, 0);

  const before = Uint8Array.from(js);
  assert.equal(pgdReaderClampApply(js), 1);
  bytes.set(before, SCRATCH_A);
  assert.equal(wasm.isaac_pgd_reader_clamp_apply(SCRATCH_A, N), 1);
  for (let i = 0; i < N; i++) {
    assert.equal(bytes[SCRATCH_A + i], js[i], `byte ${i.toString(16)}`);
  }
  /* flag on → +0x458 floored; stairs 1..3 on; +0x454 floored */
  assert.equal(snapI32(js, 0x458), 1);
  assert.equal(snapI32(js, 0x45c), 1);
  assert.equal(snapI32(js, 0x460), 1);
  assert.equal(snapI32(js, 0x464), 1);
  assert.equal(snapI32(js, 0x468), 0, "stair 4 not taken at count=3");
  assert.equal(snapI32(js, 0x454), 1);
  /* tail: +0x11c>=1 → +0x488=1; +0x114=0 skip so +0x48c stays 4;
     +0x14c>=1 → +0x494=1; +0x148=-3 skip so +0x490 stays 9;
     +0x150>=1 → +0x498=1 */
  assert.equal(snapI32(js, 0x488), 1);
  assert.equal(snapI32(js, 0x48c), 4);
  assert.equal(snapI32(js, 0x494), 1);
  assert.equal(snapI32(js, 0x490), 9);
  assert.equal(snapI32(js, 0x498), 1);

  /* undersize / null */
  assert.equal(wasm.isaac_pgd_reader_clamp_apply(SCRATCH_A, N - 1), 0);
  assert.equal(pgdReaderClampApply(new Uint8Array(N - 1)), 0);
});

test("Wasm matches JS: PGDCLMP apply randomized high-bit differential", () => {
  const rng = makeRng(0x009e4af0);
  const N = PGDCLMP_MIN_SNAP;
  const edges = [0, 1, 2, -1, 11, 12, 0x7fffffff, 0x80000000, 0xffffffff];
  for (let k = 0; k < 400; k++) {
    const js = new Uint8Array(N);
    for (let i = 0; i < N; i++) js[i] = pick(rng, 256);
    js[PGDCLMP_FLAG_OFF] = (k & 3) === 0 ? 0
      : (k & 3) === 1 ? 1
      : (k & 3) === 2 ? 0x00 : pick(rng, 256);
    snapPutI32(js, PGDCLMP_COUNT_OFF, edges[k % edges.length]);
    for (const g of PGDCLMP_TAIL_GATES) {
      snapPutI32(js, g, edges[pick(rng, edges.length)]);
    }
    const before = Uint8Array.from(js);
    assert.equal(pgdReaderClampApply(js), 1);
    bytes.set(before, SCRATCH_A);
    assert.equal(wasm.isaac_pgd_reader_clamp_apply(SCRATCH_A, N), 1);
    for (let i = 0; i < N; i++) {
      assert.equal(bytes[SCRATCH_A + i], js[i], `k=${k} off=${i}`);
    }
    const g0 = snapI32(before, 0x11c);
    const g1 = snapI32(before, 0x114);
    const g2 = snapI32(before, 0x14c);
    const g3 = snapI32(before, 0x148);
    const g4 = snapI32(before, 0x150);
    const count = snapI32(before, PGDCLMP_COUNT_OFF);
    const flag = before[PGDCLMP_FLAG_OFF];
    assert.equal(
      wasm.isaac_pgd_reader_clamp_accum_written(flag, count, g0, g1, g2, g3, g4),
      pgdReaderClampAccumWritten(flag, count, g0, g1, g2, g3, g4),
      `accum_written k=${k}`,
    );
  }
});

test("PE truth: v11 mutant — unsigned floor / swapped tail / flag-wide", () => {
  /* UNSIGNED floor would treat 0x80000000 as huge and keep it. */
  assert.equal(pgdReaderClampFloor(0x80000000), 1);
  assert.equal(wasm.isaac_pgd_reader_clamp_floor(0x80000000), 1);
  assert.notEqual(pgdReaderClampFloor(0x80000000) >>> 0, 0x80000000);
  /* flag-wide (no low-byte mask) would take 0x100 */
  assert.equal(pgdReaderClampFlagBlockTaken(0x100), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_flag_block_taken(0x100), 0);
  /* sorting the tail would put +0x490 before +0x494 */
  assert.notEqual(PGDCLMP_TAIL_SLOTS[2], 0x490);
  assert.equal(PGDCLMP_TAIL_SLOTS[2], 0x494);
  assert.equal(PGDCLMP_TAIL_SLOTS[3], 0x490);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_slot_offset(2), 0x494);
  assert.equal(wasm.isaac_pgd_reader_clamp_tail_slot_offset(3), 0x490);
  /* stair 0 is the flag block, not count>=0 */
  assert.equal(pgdReaderClampStairTaken(0, 99, 0), 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_stair_taken(0, 99, 0), 0);
  /* host-call census must stay 0 */
  assert.equal(PGDCLMP_HOST_CALLS, 0);
  assert.equal(wasm.isaac_pgd_reader_clamp_host_calls(), 0);
  /* call-site count is 1, not the reader's many vtable sites */
  assert.equal(PGDCLMP_CALL_SITES, 1);
  assert.notEqual(PGDCLMP_CALL_SITE_VA, 0x009e4260);
});


/* =====================================================================
   ABI v12 — PGDTREE (MSVC tree iterator++ 0x00414a80)
   ===================================================================== */

test("header records the v12 PGDTREE evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /0x00414a80/);
  assert.match(h, /134 call sites/);
  assert.match(h, /isnil@0xd/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_TREE_NEXT_VA, PGD_HOST_VA_TREE_NEXT);
  assert.equal(PGD_TREE_NEXT_VA, 0x00414a80);
  assert.equal(PGD_TREE_LEFT_OFF, 0);
  assert.equal(PGD_TREE_PARENT_OFF, 4);
  assert.equal(PGD_TREE_RIGHT_OFF, 8);
  assert.equal(PGD_TREE_ISNIL_OFF, 0xd);
  assert.equal(PGD_TREE_NEXT_BODY_BYTES, 83);
  assert.equal(PGD_TREE_NEXT_HOST_CALLS, 0);
  assert.equal(PGD_TREE_NEXT_CALL_SITES_IMAGE, 134);
  assert.equal(PGD_TREE_NEXT_CALL_SITES_CLUSTER, 5);
  assert.equal(PGD_TREE_NEXT_RET_A_VA, 0x00414ab0);
  assert.equal(PGD_TREE_NEXT_RET_B_VA, 0x00414ad2);
});

test("Wasm matches JS: PGDTREE isnil low-byte + arm + census", () => {
  assert.equal(wasm.isaac_pgd_tree_isnil_byte(0), 0);
  assert.equal(pgdTreeIsnilByte(0), 0);
  assert.equal(wasm.isaac_pgd_tree_isnil_byte(1), 1);
  assert.equal(pgdTreeIsnilByte(1), 1);
  assert.equal(wasm.isaac_pgd_tree_isnil_byte(0x100), 0);
  assert.equal(pgdTreeIsnilByte(0x100), 0);
  assert.equal(wasm.isaac_pgd_tree_isnil_byte(0x1ff), 1);
  assert.equal(pgdTreeIsnilByte(0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_tree_right_nil_arm(0), 0);
  assert.equal(pgdTreeRightNilArm(0), 0);
  assert.equal(wasm.isaac_pgd_tree_right_nil_arm(1), 1);
  assert.equal(wasm.isaac_pgd_tree_right_nil_arm(0x100), 0);
  assert.equal(wasm.isaac_pgd_tree_next_va() >>> 0, PGD_TREE_NEXT_VA);
  assert.equal(pgdTreeNextVa() >>> 0, PGD_TREE_NEXT_VA);
  assert.equal(wasm.isaac_pgd_tree_next_ret_a_va() >>> 0, PGD_TREE_NEXT_RET_A_VA);
  assert.equal(wasm.isaac_pgd_tree_next_ret_b_va() >>> 0, PGD_TREE_NEXT_RET_B_VA);
  assert.equal(wasm.isaac_pgd_tree_next_body_bytes(), 83);
  assert.equal(pgdTreeNextBodyBytes(), 83);
  assert.equal(wasm.isaac_pgd_tree_next_host_calls(), 0);
  assert.equal(pgdTreeNextHostCalls(), 0);
  assert.equal(wasm.isaac_pgd_tree_next_call_sites_image(), 134);
  assert.equal(pgdTreeNextCallSitesImage(), 134);
  assert.equal(wasm.isaac_pgd_tree_next_call_sites_cluster(), 5);
  assert.equal(pgdTreeNextCallSitesCluster(), 5);
  for (let i = 0; i < 5; i++) {
    assert.equal(
      wasm.isaac_pgd_tree_next_cluster_site_va(i) >>> 0,
      pgdTreeNextClusterSiteVa(i) >>> 0,
    );
    assert.equal(
      pgdTreeNextClusterSiteVa(i) >>> 0,
      PGD_TREE_NEXT_CLUSTER_SITES[i] >>> 0,
    );
  }
  assert.equal(wasm.isaac_pgd_tree_next_cluster_site_va(-1), 0);
  assert.equal(wasm.isaac_pgd_tree_next_cluster_site_va(5), 0);
  assert.equal(wasm.isaac_pgd_tree_left_off(), 0);
  assert.equal(wasm.isaac_pgd_tree_parent_off(), 4);
  assert.equal(wasm.isaac_pgd_tree_right_off(), 8);
  assert.equal(wasm.isaac_pgd_tree_isnil_off(), 0xd);
});

function plantPgdTree(base) {
  const H = base, A = base + 0x20, B = base + 0x40, C = base + 0x60, D = base + 0x80;
  const put = (node, left, parent, right, isnil) => {
    view.setUint32(node + 0, left >>> 0, true);
    view.setUint32(node + 4, parent >>> 0, true);
    view.setUint32(node + 8, right >>> 0, true);
    view.setUint8(node + 0xc, 0);
    view.setUint8(node + 0xd, isnil);
  };
  put(H, A, B, D, 1);
  put(A, H, B, H, 0);
  put(B, A, H, D, 0);
  put(C, H, D, H, 0);
  put(D, C, B, H, 0);
  return { H, A, B, C, D };
}

test("Wasm matches JS: PGDTREE inorder walk of a 4-node MSVC tree", () => {
  const TREE = SCRATCH_C + 0x4000;
  const IT = SCRATCH_C + 0x4f00;
  bytes.fill(0, TREE, TREE + 0x100);
  const { H, A, B, C, D } = plantPgdTree(TREE);
  const order = [A, B, C, D, H];
  view.setUint32(IT, A, true);
  for (let i = 1; i < order.length; i++) {
    wasm.isaac_pgd_tree_iterator_next(IT);
    assert.equal(view.getUint32(IT, true), order[i], `wasm step ${i}`);
  }
  const rel = new ArrayBuffer(0xa0);
  const rv = new DataView(rel);
  const writeNode = (off, left, parent, right, isnil) => {
    rv.setUint32(off + 0, left, true);
    rv.setUint32(off + 4, parent, true);
    rv.setUint32(off + 8, right, true);
    rv.setUint8(off + 0xc, 0);
    rv.setUint8(off + 0xd, isnil);
  };
  writeNode(0x00, 0x20, 0x40, 0x80, 1);
  writeNode(0x20, 0x00, 0x40, 0x00, 0);
  writeNode(0x40, 0x20, 0x00, 0x80, 0);
  writeNode(0x60, 0x00, 0x80, 0x00, 0);
  writeNode(0x80, 0x60, 0x40, 0x00, 0);
  const itOff = 0x90;
  rv.setUint32(itOff, 0x20, true);
  const jsOrder = [0x20, 0x40, 0x60, 0x80, 0x00];
  for (let i = 1; i < jsOrder.length; i++) {
    pgdTreeIteratorNext(rv, itOff);
    assert.equal(rv.getUint32(itOff, true), jsOrder[i], `js step ${i}`);
  }
  wasm.isaac_pgd_tree_iterator_next(0);
  view.setUint32(IT, 0, true);
  wasm.isaac_pgd_tree_iterator_next(IT);
  assert.equal(view.getUint32(IT, true), 0);
});

test("PE truth: v12 mutant — wide isnil / swapped child / site count", () => {
  /* Wide (no low-byte mask) would treat 0x100 as nil. */
  assert.equal(pgdTreeIsnilByte(0x100), 0);
  assert.equal(wasm.isaac_pgd_tree_isnil_byte(0x100), 0);
  assert.notEqual(0x100, 0);
  /* Left/right swap would break inorder. */
  assert.equal(PGD_TREE_LEFT_OFF, 0);
  assert.equal(PGD_TREE_RIGHT_OFF, 8);
  assert.notEqual(PGD_TREE_LEFT_OFF, PGD_TREE_RIGHT_OFF);
  /* Image-wide count is 134, not the 5-site cluster. */
  assert.equal(PGD_TREE_NEXT_CALL_SITES_IMAGE, 134);
  assert.notEqual(PGD_TREE_NEXT_CALL_SITES_IMAGE, 5);
  assert.equal(wasm.isaac_pgd_tree_next_call_sites_image(), 134);
  assert.equal(wasm.isaac_pgd_tree_next_host_calls(), 0);
  /* identify-zhl: no source-level name. */
  assert.equal(PGD_TREE_NEXT_VA, PGD_HOST_VA_TREE_NEXT);
  /* Color at +0xc must not be read as isnil. PE cmp byte [right+0xd],0.
     dword[right+0xc] with color=1/isnil=0 is 0x00000001; a wide load
     would treat the right child as nil and climb instead of taking it. */
  const BASE = SCRATCH_C + 0x5000;
  const IT2 = SCRATCH_C + 0x5100;
  bytes.fill(0, BASE, BASE + 0x80);
  const NIL = BASE, CUR = BASE + 0x20, RGT = BASE + 0x40;
  const put = (node, left, parent, right, color, isnil) => {
    view.setUint32(node + 0, left, true);
    view.setUint32(node + 4, parent, true);
    view.setUint32(node + 8, right, true);
    view.setUint8(node + 0xc, color);
    view.setUint8(node + 0xd, isnil);
  };
  put(NIL, CUR, NIL, NIL, 0, 1);
  put(CUR, NIL, NIL, RGT, 0, 0);
  put(RGT, NIL, CUR, NIL, 1, 0);
  view.setUint32(IT2, CUR, true);
  wasm.isaac_pgd_tree_iterator_next(IT2);
  assert.equal(view.getUint32(IT2, true), RGT, 'color at +0xc must not block right-live');
  const rel = new ArrayBuffer(0x70);
  const rv = new DataView(rel);
  const write = (off, left, parent, right, color, isnil) => {
    rv.setUint32(off + 0, left, true);
    rv.setUint32(off + 4, parent, true);
    rv.setUint32(off + 8, right, true);
    rv.setUint8(off + 0xc, color);
    rv.setUint8(off + 0xd, isnil);
  };
  write(0x00, 0x20, 0x00, 0x00, 0, 1);
  write(0x20, 0x00, 0x00, 0x40, 0, 0);
  write(0x40, 0x00, 0x20, 0x00, 1, 0);
  rv.setUint32(0x60, 0x20, true);
  pgdTreeIteratorNext(rv, 0x60);
  assert.equal(rv.getUint32(0x60, true), 0x40);
});

test("ZZZ executed assertion count", () => {
  // Printed so the work-unit report can quote a real number. The floor keeps
  // a future edit from silently deleting coverage.
  console.log(`executed assertions: ${ASSERTIONS}`);
  // Floor raised at v3 (was 15000, actual 279523) and again at v5 (actual
  // 328057, after the randomized high-bit differential and the caller-loop
  // simulation). It exists to stop a later edit from silently deleting
  // coverage, so it has to track the real number.
  assert.ok(ASSERTIONS > 300000, `expected >300000 assertions, ran ${ASSERTIONS}`);
});

/* =====================================================================
   ABI v13 — PGDTROW (writer bestiary tree-row walk 0x009282e0)
   ===================================================================== */

test("header records the v13 PGDTROW evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /0x009282e0/);
  assert.match(h, /PGDTROW/);
  assert.match(h, /begin\s*==\s*cell/);
  assert.match(h, /stride 0x18/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_TREE_ROW_KEY_OFF, 0x10);
  assert.equal(PGD_TREE_ROW_VALUE_OFF, 0x14);
  assert.equal(PGD_TREE_ROW_STRIDE, 0x18);
  assert.equal(PGD_TREE_ROW_ADVANCE_VA, PGD_TREE_NEXT_VA);
  assert.equal(PGD_TREE_ROW_ADVANCE_VA, 0x00414a80);
  assert.equal(PGD_TREE_ROW_WRITER_VA, 0x009282e0);
  assert.equal(PGD_TREE_ROW_WALKS, 4);
});

test("Wasm matches JS: PGDTROW row walk constants + records", () => {
  assert.equal(wasm.isaac_pgd_tree_row_key_off(), pgdTreeRowKeyOff());
  assert.equal(wasm.isaac_pgd_tree_row_key_off(), PGD_TREE_ROW_KEY_OFF);
  assert.equal(wasm.isaac_pgd_tree_row_value_off(), PGD_TREE_ROW_VALUE_OFF);
  assert.equal(wasm.isaac_pgd_tree_row_stride(), PGD_TREE_ROW_STRIDE);
  assert.equal(
    wasm.isaac_pgd_tree_row_advance_va() >>> 0,
    pgdTreeRowAdvanceVa() >>> 0,
  );
  assert.equal(wasm.isaac_pgd_tree_row_advance_va() >>> 0, 0x00414a80);
  assert.equal(
    wasm.isaac_pgd_tree_row_writer_va() >>> 0,
    pgdTreeRowWriterVa() >>> 0,
  );
  assert.equal(wasm.isaac_pgd_tree_row_alt_va() >>> 0, pgdTreeRowAltVa() >>> 0);
  assert.equal(
    wasm.isaac_pgd_tree_row_reader_va() >>> 0,
    pgdTreeRowReaderVa() >>> 0,
  );
  assert.equal(wasm.isaac_pgd_tree_row_walk_count(), pgdTreeRowWalkCount());
  assert.equal(wasm.isaac_pgd_tree_row_walk_count(), PGD_TREE_ROW_WALKS);
  for (let s = -2; s <= PGD_TREE_ROW_WALKS + 1; ++s) {
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_slot(s),
      pgdTreeRowWalkSlot(s),
      `slot(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_tag(s),
      pgdTreeRowWalkTag(s),
      `tag(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_header_off(s),
      pgdTreeRowWalkHeaderOff(s),
      `header_off(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_count_off(s),
      pgdTreeRowWalkCountOff(s),
      `count_off(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_gate_va(s) >>> 0,
      pgdTreeRowWalkGateVa(s) >>> 0,
      `gate_va(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_loop_head_va(s) >>> 0,
      pgdTreeRowWalkLoopHeadVa(s) >>> 0,
      `loop_head_va(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_key_va(s) >>> 0,
      pgdTreeRowWalkKeyVa(s) >>> 0,
      `key_va(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_value_va(s) >>> 0,
      pgdTreeRowWalkValueVa(s) >>> 0,
      `value_va(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_call_va(s) >>> 0,
      pgdTreeRowWalkCallVa(s) >>> 0,
      `call_va(${s})`,
    );
    assert.equal(
      wasm.isaac_pgd_tree_row_walk_loop_back_va(s) >>> 0,
      pgdTreeRowWalkLoopBackVa(s) >>> 0,
      `loop_back_va(${s})`,
    );
  }
  /* out-of-range conventions: slots/offsets -> -1, tags -> 0, VAs -> 0 */
  assert.equal(pgdTreeRowWalkSlot(-1), -1);
  assert.equal(pgdTreeRowWalkSlot(PGD_TREE_ROW_WALKS), -1);
  assert.equal(pgdTreeRowWalkTag(-1), 0);
  assert.equal(pgdTreeRowWalkGateVa(-1), 0);
  assert.equal(pgdTreeRowWalkLoopBackVa(9), 0);
});

test("Wasm matches JS: PGDTROW empty gate + loop-back (unsigned, wide)", () => {
  /* PE: cmp begin, header ; je skip — full-dword EQUALITY, no sign test. */
  const cases = [
    [0, 0, 1],
    [1, 1, 1],
    [0, 1, 0],
    [1, 0, 0],
    [0x100, 0x100, 1],
    [0x100, 0, 0],
    [0xffffffff, 0xffffffff, 1],
    [0xffffffff, 0x100, 0],
    [0x7fffffff, 0x80000000, 0],
  ];
  for (const [begin, header, want] of cases) {
    assert.equal(
      wasm.isaac_pgd_tree_row_empty(begin, header),
      pgdTreeRowEmpty(begin, header),
      `empty(${begin},${header})`,
    );
    assert.equal(pgdTreeRowEmpty(begin, header), want, `js empty(${begin},${header})`);
  }
  /* PE: cmp node, header ; jne loop — full-dword INEQUALITY. */
  for (const [node, header, want] of [
    [0, 0, 0],
    [1, 0, 1],
    [0, 1, 1],
    [0x100, 0x100, 0],
    [0x100, 0, 1],
    [0xffffffff, 0xffffffff, 0],
    [0xffffffff, 0x100, 1],
    [0x80000000, 0x7fffffff, 1],
  ]) {
    assert.equal(
      wasm.isaac_pgd_tree_row_loop_back(node, header),
      pgdTreeRowLoopBack(node, header),
      `loop_back(${node},${header})`,
    );
    assert.equal(
      pgdTreeRowLoopBack(node, header),
      want,
      `js loop_back(${node},${header})`,
    );
  }
  /* A signed comparison would flip 0x80000000 vs 0x7fffffff. */
  assert.equal(wasm.isaac_pgd_tree_row_empty(0x80000000, 0x7fffffff), 0);
  assert.equal(wasm.isaac_pgd_tree_row_loop_back(0x80000000, 0x7fffffff), 1);
});

test("PE truth: PGDTROW records are a literal transcription of the writer", () => {
  /* Transcribed from cpu-dump/00928af0 + 00928b40 + 00928c30 + 00928c80:
     the four walks drain headers +0xf7c/+0xf6c/+0xf74/+0xf64 (counts
     +0xf80/+0xf70/+0xf78/+0xf68) with tags 4/2/3/1, emitting key@+0x10
     and value@+0x14, advancing via 0x00414a80, looping while node !=
     header. The gate is `cmp esi,eax ; je` right after `mov esi,[eax]`. */
  const wantSlots = [3, 1, 2, 0];
  const wantTags = [4, 2, 3, 1];
  const wantHeaders = [0xf7c, 0xf6c, 0xf74, 0xf64];
  const wantCounts = [0xf80, 0xf70, 0xf78, 0xf68];
  const wantGates = [0x928ba9, 0x928c6f, 0x928d32, 0x928df5];
  const wantLoopHeads = [0x928bb0, 0x928c73, 0x928d36, 0x928e00];
  const wantKeys = [0x928bb3, 0x928c76, 0x928d39, 0x928e03];
  const wantValues = [0x928bd6, 0x928c99, 0x928d5c, 0x928e26];
  const wantCalls = [0x928bf9, 0x928cbc, 0x928d7f, 0x928e49];
  const wantLoopBacks = [0x928c01, 0x928cc4, 0x928d87, 0x928e51];
  assert.deepEqual(PGD_TREE_ROW_SLOTS, wantSlots);
  assert.deepEqual(PGD_TREE_ROW_TAGS, wantTags);
  assert.deepEqual(PGD_TREE_ROW_HEADER_OFFS, wantHeaders);
  assert.deepEqual(PGD_TREE_ROW_COUNT_OFFS, wantCounts);
  assert.deepEqual(PGD_TREE_ROW_GATE_VAS, wantGates);
  assert.deepEqual(PGD_TREE_ROW_LOOP_HEAD_VAS, wantLoopHeads);
  assert.deepEqual(PGD_TREE_ROW_KEY_VAS, wantKeys);
  assert.deepEqual(PGD_TREE_ROW_VALUE_VAS, wantValues);
  assert.deepEqual(PGD_TREE_ROW_CALL_VAS, wantCalls);
  assert.deepEqual(PGD_TREE_ROW_LOOP_BACK_VAS, wantLoopBacks);
  /* VAs must be strictly increasing within each walk, PE execution order. */
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    const seq = [
      PGD_TREE_ROW_GATE_VAS[s],
      PGD_TREE_ROW_LOOP_HEAD_VAS[s],
      PGD_TREE_ROW_KEY_VAS[s],
      PGD_TREE_ROW_VALUE_VAS[s],
      PGD_TREE_ROW_CALL_VAS[s],
      PGD_TREE_ROW_LOOP_BACK_VAS[s],
    ];
    for (let i = 1; i < seq.length; ++i) {
      assert.ok(seq[i] > seq[i - 1], `walk ${s} VAs ascending`);
    }
  }
  /* advance call sites must be the landed PGDTREE cluster sites, and the
     advance law's own VA must be the callee. */
  for (const callVa of PGD_TREE_ROW_CALL_VAS) {
    assert.ok(
      PGD_TREE_NEXT_CLUSTER_SITES.includes(callVa >>> 0),
      `call site ${callVa.toString(16)} is a PGDTREE cluster site`,
    );
  }
  assert.equal(PGD_TREE_ROW_ADVANCE_VA, PGD_TREE_NEXT_VA);
  /* the count word sits 4 bytes after each header. */
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    assert.equal(
      PGD_TREE_ROW_COUNT_OFFS[s],
      PGD_TREE_ROW_HEADER_OFFS[s] + 4,
      `count_off(${s}) = header+4`,
    );
  }
});

test("PE truth: v13 cross-law — walk order equals the reader bestiary tables", () => {
  assert.equal(pgdTreeRowOrderMatchesBestiaryPairs(), 1);
  assert.equal(wasm.isaac_pgd_tree_row_order_matches_bestiary_pairs(), 1);
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    assert.equal(pgdTreeRowWalkSlot(s), pgdBestiarySubmapPair(s), `slot ${s}`);
    assert.equal(pgdTreeRowWalkTag(s), pgdBestiarySubmapTag(s), `tag ${s}`);
    assert.equal(
      pgdTreeRowWalkHeaderOff(s),
      PGD_BESTIARY_OFF_ROOT[pgdTreeRowWalkSlot(s)],
      `header root ${s}`,
    );
    assert.equal(
      pgdTreeRowWalkCountOff(s),
      PGD_BESTIARY_OFF_COUNT[pgdTreeRowWalkSlot(s)],
      `count off ${s}`,
    );
  }
  /* node layout cross-law: the row key/value offsets and the stride are the
     bestiary node constants already lawed at v3. */
  assert.equal(PGD_TREE_ROW_KEY_OFF, PGD_BESTIARY_NODE_KEY_OFF);
  assert.equal(PGD_TREE_ROW_VALUE_OFF, PGD_BESTIARY_NODE_VALUE_OFF);
  assert.equal(PGD_TREE_ROW_STRIDE, PGD_BESTIARY_NODE_BYTES);
  assert.equal(PGD_TREE_ROW_STRIDE, 0x18);
});

test("Wasm matches JS: PGDTROW end-to-end row walk of a planted tree", () => {
  /* Drive one walk the way 0x00928b9e..0x00928c09 runs it: header cell at
     HDR_CELL points at the map header node H; begin = [H] (header->_Left);
     empty gate begin==H skips; per row read key@node+0x10 / value@node+0x14,
     advance via isaac_pgd_tree_iterator_next on the cell, loop-back while
     node != H. The planted tree is the same 4-node MSVC tree as v12. */
  const TREE = SCRATCH_C + 0x6000;
  const CELL = SCRATCH_C + 0x6100;
  bytes.fill(0, TREE, TREE + 0x200);
  const { H, A, B, C, D } = plantPgdTree(TREE);
  /* give every node a distinct key/value pair at the row offsets */
  const pairs = [
    [A, 0x11, 0x1111],
    [B, 0x22, 0x2222],
    [C, 0x33, 0x3333],
    [D, 0x44, 0x4444],
  ];
  for (const [node, key, value] of pairs) {
    view.setUint32(node + PGD_TREE_ROW_KEY_OFF, key, true);
    view.setUint32(node + PGD_TREE_ROW_VALUE_OFF, value, true);
  }
  view.setUint32(CELL, H >>> 0, true); /* pgd+off cell: header node address */
  const begin = view.getUint32(H, true) >>> 0; /* [H] = leftmost = A */
  assert.equal(begin, A);
  /* non-empty: gate stays open, walk visits A B C D then header */
  assert.equal(wasm.isaac_pgd_tree_row_empty(begin, H), 0);
  assert.equal(wasm.isaac_pgd_tree_row_empty(0, 0), 1); /* degenerate empty */
  const seen = [];
  /* the iterator cell (ebp-0x24 in the PE) starts at BEGIN, not the header */
  view.setUint32(CELL, begin >>> 0, true);
  let node = begin;
  while (wasm.isaac_pgd_tree_row_loop_back(node, H) === 1) {
    seen.push(node);
    wasm.isaac_pgd_tree_iterator_next(CELL);
    node = view.getUint32(CELL, true) >>> 0;
  }
  assert.deepEqual(seen, [A, B, C, D], "inorder row order");
  assert.equal(node, H, "walk ends on the header");
  /* empty tree: header node whose _Left == itself -> gate skips the walk */
  const EMPTY = TREE + 0x100;
  view.setUint32(EMPTY + 0, EMPTY, true); /* _Left == header */
  view.setUint32(EMPTY + 4, EMPTY, true);
  view.setUint32(EMPTY + 8, EMPTY, true);
  view.setUint8(EMPTY + 0xd, 1);
  const ebegin = view.getUint32(EMPTY, true) >>> 0;
  assert.equal(wasm.isaac_pgd_tree_row_empty(ebegin, EMPTY), 1);
  assert.equal(pgdTreeRowEmpty(ebegin, EMPTY), 1);
});

test("PE truth: v13 mutant — gate/loop-back/offsets must stay exact", () => {
  /* Empty gate is EQUALITY: a signed variant would misjudge the tree. */
  assert.equal(pgdTreeRowEmpty(0x80000000, 0x7fffffff), 0);
  assert.equal(pgdTreeRowEmpty(0, 0), 1);
  assert.notEqual(pgdTreeRowEmpty(0, 0), 0);
  /* Loop-back is INEQUALITY: == would terminate immediately. */
  assert.equal(pgdTreeRowLoopBack(0, 1), 1);
  assert.equal(pgdTreeRowLoopBack(1, 1), 0);
  assert.notEqual(pgdTreeRowLoopBack(0, 1), 0);
  /* key/value offsets must not be swapped. */
  assert.equal(PGD_TREE_ROW_KEY_OFF, 0x10);
  assert.equal(PGD_TREE_ROW_VALUE_OFF, 0x14);
  assert.notEqual(PGD_TREE_ROW_KEY_OFF, PGD_TREE_ROW_VALUE_OFF);
  /* stride is the tree node size, not the pair size. */
  assert.equal(PGD_TREE_ROW_STRIDE, 0x18);
  assert.notEqual(PGD_TREE_ROW_STRIDE, 0x8);
  /* walk order is fixed: slot 0 is drained LAST, tag 1. */
  assert.equal(pgdTreeRowWalkSlot(3), 0);
  assert.equal(pgdTreeRowWalkTag(3), 1);
  assert.notEqual(pgdTreeRowWalkSlot(0), 0);
  /* the writer and the advance law must stay the landed VAs. */
  assert.equal(PGD_TREE_ROW_WRITER_VA, PGD_HOST_VA_WRITE_STREAM);
  assert.equal(PGD_TREE_ROW_ADVANCE_VA, PGD_TREE_NEXT_VA);
});

/* =====================================================================
   ABI v14 — PGDSC11 (writer section-11 sub-block framing)
   Evidence: section-notes/pgd-v14/ (writer region 0x928aa6..0x928ba9,
   reader section-11 handler 0x9276e1). Stream writes/checksums stay
   host; the framing arithmetic and gates are pure.
   ===================================================================== */

test("header records the v14 PGDSC11 evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDSC11/);
  assert.match(h, /0x928aa6/);
  assert.match(h, /sub-block count 4/);
  assert.match(h, /dead store/);
  assert.match(h, /0x009276e1/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_SEC11_HEADER_ID, 11);
  assert.equal(PGD_SEC11_SUB_BLOCKS, 4);
  assert.equal(PGD_SEC11_TOTAL_VA, 0x00928aa6);
  assert.equal(PGD_SEC11_COUNT_DEAD_STORE_VA, 0x00928acd);
  assert.equal(PGD_SEC11_SUBCOUNT_STORE_VA, 0x00928b20);
  assert.equal(PGD_SEC11_READER_HANDLER_VA, 0x009276e1);
  assert.equal(PGD_SEC11_READER_SUBCOUNT_READ_VA, 0x00927791);
});

test("PE truth: PGDSC11 row-total and header-cap are a literal transcription", () => {
  /* Writer 0x928aa6..0x928ac1:
       ecx = [edi+0xf78]; ecx += [edi+0xf80]; ecx += [edi+0xf70];
       eax = [edi+0xf68]; eax += ecx
     each add is 32-bit wrap. cap = total << 2 (0x928ad0 `shl eax,2`).
     Independent reference re-transcribed from the instruction stream,
     not from the C++/model. */
  const refTotal = (c2, c3, c1, c0) =>
    ((c0 + ((c1 + ((c2 + c3) & 0xffffffff) & 0xffffffff) & 0xffffffff)) &
      0xffffffff) >>>
    0;
  const refCap = (total) => ((total & 0xffffffff) << 2) >>> 0;
  const cases = [
    [0, 0, 0, 0],
    [1, 2, 3, 4],
    [0xffffffff, 1, 0, 0],
    [0xffffffff, 0xffffffff, 0xffffffff, 0xffffffff],
    [0x7fffffff, 0x80000000, 0x100, 0x1ff],
    [0x40000000, 0x3fffffff, 0, 1],
    [0x5d, 0xa, 0x282, 0x20b],
  ];
  for (const [c2, c3, c1, c0] of cases) {
    assert.equal(
      pgdSec11RowTotal(c2, c3, c1, c0),
      refTotal(c2, c3, c1, c0),
      `rowTotal(${c2},${c3},${c1},${c0})`,
    );
    assert.equal(
      wasm.isaac_pgd_sec11_row_total(c2, c3, c1, c0) >>> 0,
      refTotal(c2, c3, c1, c0),
      `wasm rowTotal(${c2},${c3},${c1},${c0})`,
    );
    assert.equal(
      pgdSec11HeaderCap(refTotal(c2, c3, c1, c0)),
      refCap(refTotal(c2, c3, c1, c0)),
      `headerCap`,
    );
    assert.equal(
      wasm.isaac_pgd_sec11_header_cap(refTotal(c2, c3, c1, c0)) >>> 0,
      refCap(refTotal(c2, c3, c1, c0)),
      `wasm headerCap`,
    );
  }
  /* wrap evidence: 0xffffffff+1 == 0, and 0x80000000<<2 == 0. */
  assert.equal(pgdSec11RowTotal(0xffffffff, 1, 0, 0), 0);
  assert.equal(pgdSec11RowTotal(0, 0, 0, 0xffffffff), 0xffffffff);
  assert.equal(pgdSec11HeaderCap(0x40000000), 0);
  assert.equal(pgdSec11HeaderCap(0xffffffff), 0xfffffffc);
  /* machine order is c2 first: swapping c0/c2 changes nothing mod 2^32,
     but the fire order is fixed for the mutation checks. */
  assert.equal(pgdSec11RowTotal(1, 2, 3, 4), 10);
  assert.equal(pgdSec11RowTotal(4, 3, 2, 1), 10);
});

test("PE truth: PGDSC11 sub-cap is count<<2 and header cap is the sum", () => {
  /* Per-walk sub-block cap word = count[slot(s)] << 2 (writer loads the
     walk's count word then `shl eax,2`). The section cap aggregates the
     four walks: cap(header) == sum of per-walk sub-caps mod 2^32. */
  const counts = [0x11, 0x22, 0x33, 0x44];
  let sumCaps = 0;
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    const slot = pgdTreeRowWalkSlot(s);
    const c = counts[slot];
    const want = (c << 2) >>> 0;
    assert.equal(pgdSec11SubCap(s, c), want, `subCap(${s})`);
    assert.equal(wasm.isaac_pgd_sec11_sub_cap(s, c) >>> 0, want, `wasm subCap`);
    sumCaps = (sumCaps + want) >>> 0;
  }
  const total = pgdSec11RowTotal(counts[2], counts[3], counts[1], counts[0]);
  assert.equal(pgdSec11HeaderCap(total), sumCaps, "header cap == sum of sub-caps");
  /* each sub-cap is 4-byte aligned: the cap is the dword-pair byte count
     (key+value per row), never a row count. */
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    assert.equal(pgdSec11SubCap(s, 1), 4);
    assert.equal(pgdSec11SubCap(s, 3), 12);
  }
  /* out-of-range walk: -1 like the v13 walk getters. */
  assert.equal(pgdSec11SubCap(-1, 4), -1);
  assert.equal(pgdSec11SubCap(4, 4), -1);
});

test("PE truth: PGDSC11 reader gates — wide byte-gate drives, no pre-mask", () => {
  /* Subcount zero gate @0x927794/0x92779f: `cmp [ebp-0x7c],0 ; jbe` —
     UNSIGNED, skips the whole section when subcount == 0. */
  for (const [subcount, want] of [
    [0, 1],
    [1, 0],
    [4, 0],
    [0x100, 0],
    [0x1ff, 0],
    [0x80000000, 0],
    [0xffffffff, 0],
  ]) {
    assert.equal(pgdSec11SubCountZero(subcount), want, `subCountZero(${subcount})`);
    assert.equal(
      wasm.isaac_pgd_sec11_sub_count_zero(subcount),
      want,
      `wasm subCountZero(${subcount})`,
    );
  }
  /* Tag gate @0x9277bd/0x9277c1: `dec eax; cmp eax,3 ; ja` — (tag-1)
     UNSIGNED > 3 invalid; valid tags 1..4, slot == tag-1. */
  for (const [tag, want] of [
    [0, 0],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 0],
    [0x100, 0],
    [0x1ff, 0],
    [0x80000000, 0],
    [0xffffffff, 0],
  ]) {
    assert.equal(pgdSec11TagValid(tag), want, `tagValid(${tag})`);
    assert.equal(wasm.isaac_pgd_sec11_tag_valid(tag), want, `wasm tagValid(${tag})`);
    assert.equal(pgdSec11TagValid(tag), pgdBestiarySlotFromTag(tag) >= 0 ? 1 : 0,
      `tagValid(${tag}) cross-law slotFromTag`);
  }
  /* Per-sub-block cap gate @0x9277e6/0x9277e8: `test eax,eax ; jle` —
     SIGNED cap > 0, then rows = cap >> 2 via `shr eax,2` (UNSIGNED). */
  for (const [cap, want] of [
    [0, 0],
    [1, 0],
    [3, 0],
    [4, 1],
    [0x100, 0x40],
    [0x1ff, 0x7f],
    [0x80000000, 0 /* signed negative */],
    [0xffffffff, 0 /* signed negative */],
    [0x7fffffff, 0x1fffffff],
  ]) {
    assert.equal(pgdSec11RowsFromCap(cap), want, `rowsFromCap(${cap})`);
    assert.equal(
      wasm.isaac_pgd_sec11_rows_from_cap(cap) >>> 0,
      want,
      `wasm rowsFromCap(${cap})`,
    );
  }
  /* The SIGNED gate must reject values an UNSIGNED gate would accept:
     0x80000000 and 0xffffffff must yield 0 rows, not cap>>2. */
  assert.equal(pgdSec11RowsFromCap(0x80000000), 0);
  assert.equal(pgdSec11RowsFromCap(0xffffffff), 0);
  assert.notEqual(pgdSec11RowsFromCap(0x80000000), 0x20000000);
  assert.notEqual(pgdSec11RowsFromCap(0xffffffff), 0x3fffffff);
});

test("PE truth: PGDSC11 reader loop-backs — sub loop unsigned, row loop signed", () => {
  /* Sub-block loop-back @0x927c63/0x927c6d: `inc [ebp-0x78]; cmp
     eax,subcount ; jb` — UNSIGNED index < subcount continues. */
  for (const [index, subcount, want] of [
    [0, 4, 1],
    [3, 4, 1],
    [4, 4, 0],
    [0x100, 4, 0],
    [0xffffffff, 0, 0],
    [0xffffffff, 0xffffffff, 0],
    [0x80000000, 0x80000001, 1],
    [0x7fffffff, 0x80000000, 1],
  ]) {
    assert.equal(
      pgdSec11SubLoopBack(index, subcount),
      want,
      `subLoopBack(${index},${subcount})`,
    );
    assert.equal(
      wasm.isaac_pgd_sec11_sub_loop_back(index, subcount),
      want,
      `wasm subLoopBack(${index},${subcount})`,
    );
  }
  /* Row loop-back @0x9278e6/0x9278e9: `cmp ebx,rows ; jl` — SIGNED
     index < rows continues. rows == cap>>2 with cap SIGNED > 0 so rows
     never exceeds 2^31-1; the machine still spells jl. */
  for (const [index, rows, want] of [
    [0, 4, 1],
    [3, 4, 1],
    [4, 4, 0],
    [-1, 4, 1 /* signed -1 < 4 */],
    [0xffffffff, 4, 1 /* signed -1 < 4; unsigned would be 0 */],
    [0x80000000, 4, 1 /* signed INT_MIN < 4 */],
    [0x7fffffff, 0x1fffffff, 0],
  ]) {
    assert.equal(pgdSec11RowLoopBack(index, rows), want, `rowLoopBack(${index},${rows})`);
    assert.equal(
      wasm.isaac_pgd_sec11_row_loop_back(index, rows),
      want,
      `wasm rowLoopBack(${index},${rows})`,
    );
  }
  /* flipped sub-loop to signed (<=) would continue at 0x80000000 ==
     0x80000000; flipped row-loop to unsigned would stop at 0xffffffff. */
  assert.equal(pgdSec11SubLoopBack(0x80000000, 0x80000000), 0);
  assert.equal(pgdSec11RowLoopBack(0xffffffff, 4), 1);
  assert.notEqual(pgdSec11SubLoopBack(0x80000000, 0x80000000), 1);
  assert.notEqual(pgdSec11RowLoopBack(0xffffffff, 4), 0);
});

test("PE truth: PGDSC11 writer VA records + cross-law with the v13 walk order", () => {
  /* The sub-block tag immediates are written in the v13 walk order and
     equal the reader-side bestiary tags; the cap sources sit at the
     walk's count-word offsets. Tag-write VAs transcribed from the
     writer: 0x928b4b (4), 0x928c11 (2), 0x928cd4 (3), 0x928d97 (1). */
  const TAG_WRITE_VAS_EXACT = [0x00928b4b, 0x00928c11, 0x00928cd4, 0x00928d97];
  assert.equal(PGD_SEC11_HEADER_ID, PGD_BESTIARY_SECTION_ID);
  assert.equal(PGD_SEC11_SUB_BLOCKS, PGD_BESTIARY_SUBMAPS);
  for (let s = 0; s < PGD_TREE_ROW_WALKS; ++s) {
    assert.equal(pgdSec11TagWriteVa(s), PGD_SEC11_TAG_WRITE_VAS[s], `tagWriteVa ${s}`);
    assert.equal(
      wasm.isaac_pgd_sec11_tag_write_va(s) >>> 0,
      PGD_SEC11_TAG_WRITE_VAS[s] >>> 0,
      `wasm tagWriteVa ${s}`,
    );
    assert.equal(pgdSec11CapSourceVa(s), PGD_SEC11_CAP_SOURCE_VAS[s], `capSourceVa ${s}`);
    assert.equal(pgdSec11CapShlStepVa(s), PGD_SEC11_CAP_SHL_VAS[s], `capShlVa ${s}`);
    assert.equal(
      pgdTreeRowWalkTag(s),
      pgdBestiarySubmapTag(s),
      `walk tag ${s}`,
    );
    /* tag immediates 4,2,3,1 are stored in the writer at 0x928b4b /
       0x928c11 / 0x928cd4 / 0x928d97, in the v13 walk order. */
    assert.equal(PGD_SEC11_TAG_WRITE_VAS[s], TAG_WRITE_VAS_EXACT[s], `tag write VA ${s}`);
    assert.equal(pgdSec11FramingMatchesRowWalk(), 1);
    assert.equal(wasm.isaac_pgd_sec11_framing_matches_row_walk(), 1);
  }
  /* reader records land. */
  assert.equal(pgdSec11ReaderHandlerVa(), 0x009276e1);
  assert.equal(pgdSec11ReaderSubcountReadVa(), 0x00927791);
  assert.equal(pgdSec11ReaderTagReadVa(), 0x009277b4);
  assert.equal(pgdSec11ReaderTagGateVa(), 0x009277bd);
  assert.equal(pgdSec11ReaderCapGateVa(), 0x009277e6);
  assert.equal(pgdSec11ReaderCapShrVa(), 0x009277ee);
  assert.equal(pgdSec11ReaderRowLoopBackVa(), 0x009278e6);
  assert.equal(pgdSec11ReaderSubLoopBackVa(), 0x00927c63);
  /* all VAs match the wasm exports. */
  assert.equal(wasm.isaac_pgd_sec11_reader_handler_va() >>> 0, 0x009276e1);
  assert.equal(wasm.isaac_pgd_sec11_total_va() >>> 0, 0x00928aa6);
  assert.equal(wasm.isaac_pgd_sec11_id_store_va() >>> 0, 0x00928ac3);
  assert.equal(wasm.isaac_pgd_sec11_count_dead_store_va() >>> 0, 0x00928acd);
  assert.equal(wasm.isaac_pgd_sec11_cap_shl_va() >>> 0, 0x00928ad0);
  assert.equal(wasm.isaac_pgd_sec11_cap_write_va() >>> 0, 0x00928b01);
  assert.equal(wasm.isaac_pgd_sec11_subcount_store_va() >>> 0, 0x00928b20);
  assert.equal(wasm.isaac_pgd_sec11_subcount_write_va() >>> 0, 0x00928b2c);
  assert.equal(wasm.isaac_pgd_sec11_total_final_add_va() >>> 0, 0x00928ac1);
  assert.equal(wasm.isaac_pgd_sec11_reader_subcount_read_va() >>> 0, 0x00927791);
  assert.equal(wasm.isaac_pgd_sec11_reader_tag_read_va() >>> 0, 0x009277b4);
  assert.equal(wasm.isaac_pgd_sec11_reader_tag_gate_va() >>> 0, 0x009277bd);
  assert.equal(wasm.isaac_pgd_sec11_reader_cap_gate_va() >>> 0, 0x009277e6);
  assert.equal(wasm.isaac_pgd_sec11_reader_cap_shr_va() >>> 0, 0x009277ee);
  assert.equal(wasm.isaac_pgd_sec11_reader_row_loop_back_va() >>> 0, 0x009278e6);
  assert.equal(wasm.isaac_pgd_sec11_reader_sub_loop_back_va() >>> 0, 0x00927c63);
});

test("PE truth: v14 mutant — framing gates must stay exact", () => {
  /* rowTotal wrap: 0xffffffff+1 folds to 0. */
  assert.equal(pgdSec11RowTotal(0xffffffff, 1, 0, 0), 0);
  assert.notEqual(pgdSec11RowTotal(0xffffffff, 1, 0, 0), 0x100000000);
  /* headerCap is a 32-bit shift: 0x80000000 << 2 folds to 0. */
  assert.equal(pgdSec11HeaderCap(0x80000000), 0);
  assert.equal(pgdSec11HeaderCap(0x20000000), 0x80000000);
  assert.notEqual(pgdSec11HeaderCap(0x80000000), 0x200000000);
  /* subCap -1 out of range. */
  assert.equal(pgdSec11SubCap(9, 4), -1);
  /* subCountZero is UNSIGNED equality to zero. */
  assert.equal(pgdSec11SubCountZero(0), 1);
  assert.equal(pgdSec11SubCountZero(0xffffffff), 0);
  assert.notEqual(pgdSec11SubCountZero(0xffffffff), 1);
  /* tagValid rejects 0 and 5+ (unsigned bias). */
  assert.equal(pgdSec11TagValid(0), 0);
  assert.equal(pgdSec11TagValid(4), 1);
  assert.equal(pgdSec11TagValid(5), 0);
  assert.equal(pgdSec11TagValid(0xffffffff), 0);
  assert.notEqual(pgdSec11TagValid(0xffffffff), 1);
  /* rowsFromCap SIGNED gate: negatives rejected. */
  assert.equal(pgdSec11RowsFromCap(0x80000000), 0);
  assert.equal(pgdSec11RowsFromCap(0xffffffff), 0);
  assert.notEqual(pgdSec11RowsFromCap(0xffffffff), 0x3fffffff);
  /* sub loop UNSIGNED; row loop SIGNED. */
  assert.equal(pgdSec11SubLoopBack(0xffffffff, 0xffffffff), 0);
  assert.equal(pgdSec11SubLoopBack(4, 4), 0);
  assert.equal(pgdSec11RowLoopBack(0xffffffff, 4), 1);
  assert.notEqual(pgdSec11RowLoopBack(0xffffffff, 4), 0);
});

/* =====================================================================
   ABI v15 — PGDCP (reader-side bestiary count-probe 0x0092aea0)
   Evidence: section-notes/pgd-v15/ (probe 0x92aea0..0x92b061; count
   loop 0x92af55..0x92afad; gates 0x92af78..0x92af95; proceed gate
   0x92afb3/0x92afb9). The game-state tree walk, the +0x15/+0x17c
   flags and the 0x9595e0 callback stay host; the count-derivation
   decisions are pure laws over sampled inputs.
   ===================================================================== */

/* PE-truth references, transcribed branch-by-branch from the probe's
   instruction stream (NOT derived from the model or the C++). */

function refF32FromBits(bits) {
  const b = new ArrayBuffer(4);
  const dv = new DataView(b);
  dv.setUint32(0, bits >>> 0, true);
  return dv.getFloat32(0, true);
}

/* 0x92aeae `cmp byte ptr [ebx+1],0 ; jne 0x92b057` — the probe
   aborts (returns 0) when the LOW BYTE of pgd+1 is non-zero. */
function refProbeBlocked(readonlyByte) {
  return (readonlyByte >>> 0 & 0xff) !== 0 ? 1 : 0;
}

/* 0x92af78..0x92af95, branch by branch:
   gate1 0x92af78/0x92af7c `cmp dword [ecx+0x7c],0 ; jl skip` —
     SIGNED less-than-zero skips.
   gate2 0x92af7e..0x92af8a `movss xmm0,[ecx+0x68] ; ucomiss
     xmm0,xmm1 ; lahf ; test ah,0x44 ; jnp skip`, xmm1 = +0.0f
     (`xorps xmm1,xmm1` @0x92af75). lahf puts ZF at AH bit 6 and PF
     at AH bit 2; `test ah,0x44` keeps exactly those two bits; jnp
     (parity EVEN) skips. ucomiss rows vs +0.0: x>0 or x<0 ->
     (ZF,PF)=(0,0), one... zero set bits -> EVEN -> skip; x==0
     (incl -0.0) -> (1,0), ONE set bit -> ODD -> count; NaN ->
     (1,1), TWO set bits -> EVEN -> skip. Only ordered-equal
     counts.
   gate3 0x92af8c/0x92af93 `cmp byte [ecx+0x100],0 ; je skip` —
     LOW BYTE must be non-zero. */
function refCountEligible(slot7c, floatBits, flagWord) {
  const i = slot7c | 0;
  if (i < 0) return 0;                          /* gate1 jl, SIGNED */
  const x = refF32FromBits(floatBits);
  /* gate2 ucomiss x vs +0.0: the machine's ZF is 1 for ordered-equal
     OR unordered; PF is 1 only for unordered. AH = ZF<<6 | PF<<2;
     `test ah,0x44` keeps exactly those two bits; jnp falls through
     only when (ZF,PF) == (1,0) — ordered-equal, NOT NaN, NOT
     greater/less (the (0,0) and (1,1) rows both skip). */
  const unordered = x !== x;                    /* NaN */
  const orderedEqual = !unordered && x === 0.0; /* incl -0.0 */
  const zf = (unordered || orderedEqual) ? 1 : 0;
  const pf = unordered ? 1 : 0;
  if (!(zf === 1 && pf === 0)) return 0;        /* jnp skip */
  if ((flagWord >>> 0 & 0xff) === 0) return 0;  /* gate3 je, LOW BYTE */
  return 1;
}

/* 0x92af55/0x92af61/0x92af63 `mov edi,[0xc7f508] ; test edi,edi ;
   jne 0x92afb3` — the derivation loop runs and the store @0x92afad
   executes ONLY while the cached global is ZERO (full-dword test). */
function refStoreNeeded(cached) {
  return (cached >>> 0) === 0 ? 1 : 0;
}

/* Both arms continue with edi as "the count": the jne path keeps the
   cached value (walk skipped, no store); the fall-through path uses
   the derived value and stores. */
function refEffective(cached, derived) {
  return (cached >>> 0) !== 0 ? cached >>> 0 : derived >>> 0;
}

/* 0x92afb3/0x92afb9 `cmp [ebx+0xf68], edi ; jb 0x92b019` — UNSIGNED
   map-count < derived skips the game-state block. */
function refCountProceed(mapCountSlot0, count) {
  return (mapCountSlot0 >>> 0) >= (count >>> 0) ? 1 : 0;
}

test("header records the v15 PGDCP evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDCP/);
  assert.match(h, /0x0092aea0/);
  assert.match(h, /ucomiss/);
  assert.match(h, /0xc7f508/);
  assert.match(h, /0x9595e0/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_COUNT_PROBE_VA, 0x0092aea0);
  assert.equal(PGD_COUNT_GLOBAL_VA, 0x00c7f508);
  assert.equal(PGD_COUNT_GAME_VA, 0x00c7169c);
  assert.equal(PGD_COUNT_ADVANCE_VA, 0x0092af9a);
  assert.equal(PGD_COUNT_SLOT7C_OFF, 0x7c);
  assert.equal(PGD_COUNT_FLOAT_OFF, 0x68);
  assert.equal(PGD_COUNT_FLAG_OFF, 0x100);
  assert.equal(PGD_COUNT_SLOT0_COUNT_OFF, 0xf68);
  assert.equal(PGD_COUNT_SLOT0_COUNT_OFF, PGD_BESTIARY_OFF_COUNT[0]);
  /* the entry is a ret-8 body with three inbound E8 sites, recorded. */
  assert.equal(PGD_COUNT_PROBE_CALL_SITES, 3);
  assert.equal(PGD_COUNT_PROBE_CALL_SITE_VAS[2], 0x0092b03c);
});

test("PE truth: PGDCP eligibility — gate1 SIGNED, gate2 float==0, gate3 LOW BYTE", () => {
  /* [slot7c, floatBits, flagWord, want] — wide drives; byte gates are
     driven with 0x100 / 0x1ff / 0xffffffff and NOT pre-masked. */
  const cases = [
    /* gate1: SIGNED less-than-zero never counts, even with a 0.0
       float and a set flag. */
    [0xffffffff, 0x00000000, 0x01, 0],
    [0xfffffffe, 0x80000000, 0xff, 0],
    [0x80000000, 0x00000000, 0x01, 0],
    [0xffffff00, 0x00000000, 0xffffffff, 0],
    /* gate2: only IEEE equality with +0.0f counts. +0.0 and -0.0
       count; 1.0 / -1.0 / denormal / NaN never. */
    [1, 0x00000000, 0x01, 1],
    [1, 0x80000000, 0x01, 1],
    [1, 0x3f800000, 0x01, 0],
    [1, 0xbf800000, 0x01, 0],
    [1, 0x00000001, 0x01, 0],
    [1, 0x7fc00000, 0x01, 0],
    [1, 0x7f800001, 0x01, 0],
    [1, 0xffffffff, 0x01, 0],
    [1, 0x00800000, 0x01, 0],
    /* gate3: LOW BYTE of the flag word gates; 0x100 and 0xffffff00
       have a zero low byte, 0x1ff / 0xffffffff do not. */
    [1, 0x00000000, 0x00, 0],
    [1, 0x00000000, 0x100, 0],
    [1, 0x00000000, 0xffffff00, 0],
    [1, 0x00000000, 0x1ff, 1],
    [1, 0x00000000, 0xffffffff, 1],
    [0x7fffffff, 0x00000000, 0xffffffff, 1],
    [0, 0x00000000, 0x01, 1],
  ];
  for (const [s7c, fbits, flag, want] of cases) {
    const ref = refCountEligible(s7c, fbits, flag);
    assert.equal(ref, want, `ref eligible(${s7c},0x${fbits.toString(16)},0x${flag.toString(16)})`);
    assert.equal(
      pgdCountEligible(s7c, fbits, flag),
      want,
      `model eligible(${s7c},0x${fbits.toString(16)},0x${flag.toString(16)})`,
    );
    assert.equal(
      wasm.isaac_pgd_count_eligible(s7c, fbits, flag),
      want,
      `wasm eligible(${s7c},0x${fbits.toString(16)},0x${flag.toString(16)})`,
    );
  }
});

test("PE truth: PGDCP block/store/proceed decisions — wide drives", () => {
  /* probe_blocked — LOW BYTE of pgd+1. */
  for (const [arg, want] of [
    [0, 0],
    [1, 1],
    [0x100, 0],
    [0x1ff, 1],
    [0xff00, 0],
    [0xffffffff, 1],
    [0xffffff00, 0],
  ]) {
    assert.equal(refProbeBlocked(arg), want, `ref blocked(${arg})`);
    assert.equal(pgdCountProbeBlocked(arg), want, `model blocked(${arg})`);
    assert.equal(wasm.isaac_pgd_count_probe_blocked(arg), want, `wasm blocked(${arg})`);
  }
  /* store_needed — full-dword zero test on the cached global. */
  for (const [arg, want] of [
    [0, 1],
    [1, 0],
    [0x100, 0],
    [0x80000000, 0],
    [0xffffffff, 0],
  ]) {
    assert.equal(refStoreNeeded(arg), want, `ref storeNeeded(${arg})`);
    assert.equal(pgdCountStoreNeeded(arg), want, `model storeNeeded(${arg})`);
    assert.equal(wasm.isaac_pgd_count_store_needed(arg), want, `wasm storeNeeded(${arg})`);
  }
  /* effective — cached wins when non-zero; derived otherwise. */
  for (const [cached, derived, want] of [
    [0, 5, 5],
    [0, 0xffffffff, 0xffffffff],
    [3, 5, 3],
    [0x100, 0xffffffff, 0x100],
    [0xffffffff, 7, 0xffffffff],
  ]) {
    assert.equal(refEffective(cached, derived), want >>> 0, `ref effective`);
    assert.equal(pgdCountEffective(cached, derived), want >>> 0, `model effective`);
    assert.equal(wasm.isaac_pgd_count_effective(cached, derived) >>> 0, want >>> 0, `wasm effective`);
  }
  /* proceed — UNSIGNED map_count >= derived. */
  for (const [mapCount, der, want] of [
    [0xffffffff, 1, 1],
    [1, 0xffffffff, 0],
    [0x80000000, 0x80000000, 1],
    [4, 4, 1],
    [2, 4, 0],
    [4, 2, 1],
    [0, 0, 1],
  ]) {
    assert.equal(refCountProceed(mapCount, der), want, `ref proceed`);
    assert.equal(pgdCountProceed(mapCount, der), want, `model proceed`);
    assert.equal(wasm.isaac_pgd_count_proceed(mapCount, der), want, `wasm proceed`);
  }
});

test("PE truth: PGDCP VA records + cross-law with PGDTREE/PGDTROW", () => {
  /* every VA accessor returns the header constant and the wasm export. */
  const pairs = [
    [pgdCountProbeVa, PGD_COUNT_PROBE_VA, "probe"],
    [pgdCountProbeRetOkVa, PGD_COUNT_PROBE_RET_OK_VA, "retOk"],
    [pgdCountProbeRetFailVa, PGD_COUNT_PROBE_RET_FAIL_VA, "retFail"],
    [pgdCountProbeNextVa, PGD_COUNT_PROBE_NEXT_VA, "next"],
    [pgdCountGlobalVa, PGD_COUNT_GLOBAL_VA, "global"],
    [pgdCountGameVa, PGD_COUNT_GAME_VA, "game"],
    [pgdCountReadonlyGateVa, PGD_COUNT_READONLY_GATE_VA, "readonlyGate"],
    [pgdCountStoreGateVa, PGD_COUNT_STORE_GATE_VA, "storeGate"],
    [pgdCountStoreGateJneVa, PGD_COUNT_STORE_GATE_JNE_VA, "storeGateJne"],
    [pgdCountHeaderLoadVa, PGD_COUNT_HEADER_LOAD_VA, "headerLoad"],
    [pgdCountEmptyGateVa, PGD_COUNT_EMPTY_GATE_VA, "emptyGate"],
    [pgdCountGate1CmpVa, PGD_COUNT_GATE1_CMP_VA, "gate1Cmp"],
    [pgdCountGate1JlVa, PGD_COUNT_GATE1_JL_VA, "gate1Jl"],
    [pgdCountGate2MovssVa, PGD_COUNT_GATE2_MOVSS_VA, "gate2Movss"],
    [pgdCountGate2UcomissVa, PGD_COUNT_GATE2_UCOMISS_VA, "gate2Ucomiss"],
    [pgdCountGate2LahfVa, PGD_COUNT_GATE2_LAHF_VA, "gate2Lahf"],
    [pgdCountGate2TestVa, PGD_COUNT_GATE2_TEST_VA, "gate2Test"],
    [pgdCountGate2JnpVa, PGD_COUNT_GATE2_JNP_VA, "gate2Jnp"],
    [pgdCountGate3CmpVa, PGD_COUNT_GATE3_CMP_VA, "gate3Cmp"],
    [pgdCountGate3JeVa, PGD_COUNT_GATE3_JE_VA, "gate3Je"],
    [pgdCountIncVa, PGD_COUNT_INC_VA, "inc"],
    [pgdCountAdvanceVa, PGD_COUNT_ADVANCE_VA, "advance"],
    [pgdCountLoopBackCmpVa, PGD_COUNT_LOOP_BACK_CMP_VA, "loopBackCmp"],
    [pgdCountLoopBackJneVa, PGD_COUNT_LOOP_BACK_JNE_VA, "loopBackJne"],
    [pgdCountStoreVa, PGD_COUNT_STORE_VA, "store"],
    [pgdCountProceedCmpVa, PGD_COUNT_PROCEED_CMP_VA, "proceedCmp"],
    [pgdCountProceedJbVa, PGD_COUNT_PROCEED_JB_VA, "proceedJb"],
  ];
  for (const [modelFn, want, label] of pairs) {
    assert.equal(modelFn() >>> 0, want >>> 0, `model ${label}`);
  }
  assert.equal(pgdCountTreeOff(), 0x2a670);
  assert.equal(pgdCountSlot7cOff(), 0x7c);
  assert.equal(pgdCountFloatOff(), 0x68);
  assert.equal(pgdCountFlagOff(), 0x100);
  assert.equal(pgdCountSlot0CountOff(), 0xf68);
  assert.equal(pgdCountProbeCallSiteCount(), 3);
  assert.equal(pgdCountProbeCallSiteVa(0), 0x006c10bf);
  assert.equal(pgdCountProbeCallSiteVa(1), 0x006ca239);
  assert.equal(pgdCountProbeCallSiteVa(2), 0x0092b03c);
  assert.equal(pgdCountProbeCallSiteVa(3), 0);
  assert.equal(pgdCountProbeCallSiteVa(-1), 0);
  /* wasm surface matches. */
  assert.equal(wasm.isaac_pgd_count_probe_va() >>> 0, 0x0092aea0);
  assert.equal(wasm.isaac_pgd_count_probe_ret_ok_va() >>> 0, 0x0092b054);
  assert.equal(wasm.isaac_pgd_count_probe_ret_fail_va() >>> 0, 0x0092b05f);
  assert.equal(wasm.isaac_pgd_count_probe_next_va() >>> 0, 0x0092b070);
  assert.equal(wasm.isaac_pgd_count_global_va() >>> 0, 0x00c7f508);
  assert.equal(wasm.isaac_pgd_count_game_va() >>> 0, 0x00c7169c);
  assert.equal(wasm.isaac_pgd_count_probe_call_site_count(), 3);
  assert.equal(wasm.isaac_pgd_count_probe_call_site_va(2) >>> 0, 0x0092b03c);
  assert.equal(wasm.isaac_pgd_count_advance_va() >>> 0, 0x0092af9a);
  assert.equal(wasm.isaac_pgd_count_store_va() >>> 0, 0x0092afad);
  assert.equal(wasm.isaac_pgd_count_proceed_cmp_va() >>> 0, 0x0092afb3);
  assert.equal(wasm.isaac_pgd_count_proceed_jb_va() >>> 0, 0x0092afb9);
  /* cross-law: the probe's advance call IS the v12 iterator++ site in
     the 5-site PGD cluster, and its walk shape matches the v13 row
     laws (empty gate == pgdTreeRowEmpty, loop-back ==
     pgdTreeRowLoopBack). */
  assert.ok(
    PGD_TREE_NEXT_CLUSTER_SITES.includes(PGD_COUNT_ADVANCE_VA),
    "advance VA 0x92af9a must be in the PGD tree cluster",
  );
  assert.equal(PGD_COUNT_ADVANCE_VA, PGD_TREE_ROW_READER_VA);
  assert.equal(pgdTreeRowEmpty(0xbeef, 0xbeef), 1);
  assert.equal(pgdTreeRowEmpty(0xbeef, 0xbeee), 0);
  assert.equal(pgdTreeRowLoopBack(0xbeef, 0xbeef), 0);
  assert.equal(pgdTreeRowLoopBack(0xbeef, 0xbeee), 1);
});

test("PE truth: v15 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92af9a);
  const interestingFloats = [
    0x00000000, 0x80000000, 0x00000001, 0x80000001, 0x3f800000,
    0xbf800000, 0x00800000, 0x7f7fffff, 0xff7fffff, 0x7f800000,
    0xff800000, 0x7fc00000, 0x7f800001, 0xffffffff, 0x00000001,
    0x3f000000, 0x3eaaaaab, 0x4b000000, 0x5f000000, 0x2f000000,
  ];
  for (let n = 0; n < 4000; ++n) {
    const s7c = pick(rng, 0x100000000);
    const fbits =
      n < interestingFloats.length
        ? interestingFloats[n]
        : pick(rng, 0x100000000);
    const flag = pick(rng, 0x100000000);
    const ref = refCountEligible(s7c, fbits, flag);
    const model = pgdCountEligible(s7c, fbits, flag);
    assert.equal(model, ref, `eligible(${s7c},0x${fbits.toString(16)},0x${flag.toString(16)})`);
  }
});

test("PE truth: v15 mutant — count gates must stay machine-exact", () => {
  /* gate1 as UNSIGNED would count 0xffffffff (-1); the machine uses
     jl (SIGNED). */
  assert.equal(pgdCountEligible(0xffffffff, 0, 1), 0);
  assert.notEqual(pgdCountEligible(0xffffffff, 0, 1), 1);
  assert.equal(pgdCountEligible(0x80000000, 0, 1), 0);
  /* gate2 as "greater than zero" would count 1.0f; the machine counts
     ONLY IEEE equality with +0.0f (1.0f gives ZF=0,PF=0 -> even
     parity -> jnp skip). */
  assert.equal(pgdCountEligible(1, 0x3f800000, 1), 0);
  assert.notEqual(pgdCountEligible(1, 0x3f800000, 1), 1);
  assert.equal(pgdCountEligible(1, 0xbf800000, 1), 0); /* -1.0f also skips */
  assert.equal(pgdCountEligible(1, 0x7fc00000, 1), 0); /* NaN skips */
  assert.equal(pgdCountEligible(1, 0xffffffff, 1), 0);
  /* gate2 as "less or equal" would count 1.0f; equality-only is the
     law. */
  assert.notEqual(pgdCountEligible(1, 0x3f800000, 1), 1);
  /* gate3 as a FULL-WORD zero test would count 0x100; the machine
     tests the LOW BYTE. */
  assert.equal(pgdCountEligible(1, 0, 0x100), 0);
  assert.notEqual(pgdCountEligible(1, 0, 0x100), 1);
  assert.equal(pgdCountEligible(1, 0, 0xffffff00), 0);
  assert.equal(pgdCountEligible(1, 0, 0x1ff), 1);
  assert.equal(pgdCountEligible(1, 0, 0xffffffff), 1);
  /* store on the cached path would drop the cached value; the
     machine keeps it. */
  assert.equal(pgdCountStoreNeeded(0xffffffff), 0);
  assert.notEqual(pgdCountStoreNeeded(0xffffffff), 1);
  assert.equal(pgdCountEffective(3, 9), 3);
  assert.notEqual(pgdCountEffective(3, 9), 9);
  assert.equal(pgdCountEffective(0, 9), 9);
  assert.notEqual(pgdCountEffective(0, 9), 0);
  /* proceed as SIGNED would skip map=0xffffffff count=1 (0xffffffff
     reads -1); the machine compares UNSIGNED. */
  assert.equal(pgdCountProceed(0xffffffff, 1), 1);
  assert.notEqual(pgdCountProceed(0xffffffff, 1), 0);
  assert.equal(pgdCountProceed(1, 0xffffffff), 0);
  /* probe blocked as a FULL-WORD test would block 0x100; the machine
     tests the LOW BYTE of pgd+1. */
  assert.equal(pgdCountProbeBlocked(0x100), 0);
  assert.notEqual(pgdCountProbeBlocked(0x100), 1);
  assert.equal(pgdCountProbeBlocked(0x1ff), 1);
  assert.equal(pgdCountProbeBlocked(0xffffffff), 1);
});

/* =====================================================================
   ABI v16 — PGDDEATH (GetBestiaryDeathCount 0x0092b070)
   Evidence: section-notes/pgd-v16/ (cpu-dump 0x92b070..0x92b0f0; the
   0x92b0c0 label from v15 was a MID-INSTRUCTION decode start — the
   true entry is 0x92b070, 2 inbound callers 0x005c2380 / 0x008c78e1).
   ===================================================================== */

/* Branch-by-branch reference transcribed from the instruction stream:
   0x92b09e `mov esi,[eax]` ; 0x92b0a6 `shl esi,0xc` ; 0x92b0a9
   `or esi,[eax+4]` ; 0x92b0b3 `shl esi,8` — key from the two record
   dwords, 32-bit wrap at every step. */
function refDeathKey(w0, w1) {
  let key = (w0 >>> 0) << 12;
  key = (key | (w1 >>> 0)) >>> 0;
  return (key << 8) >>> 0;
}

/* Node gates 0x92b0c2..0x92b0d3 — ALL THREE must pass:
   - `cmp byte [eax+0xd],0 ; jne 0x92b0e0` — marker_d LOW BYTE zero;
   - `cmp esi,[eax+0x10] ; jl 0x92b0e0` — SIGNED key >= node_key;
   - `cmp eax,[edi+0xf7c] ; je 0x92b0e0` — node is not the map header. */
function refDeathNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((markerD >>> 0 & 0xff) !== 0) return 0;
  if ((key | 0) < (nodeKey | 0)) return 0;
  if ((nodeIsHeader >>> 0) !== 0) return 0;
  return 1;
}

/* Ok path 0x92b0d5 `mov eax,[eax+0x14]`; both fail tails xor eax,eax. */
function refDeathValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  return refDeathNodeOk(markerD, key, nodeKey, nodeIsHeader)
    ? nodeValue >>> 0
    : 0;
}

test("header records the v16 PGDDEATH evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDDEATH/);
  assert.match(h, /GetBestiaryDeathCount/);
  assert.match(h, /0x0092b070/);
  /* the v15 NEXT_VA record is corrected: 0x92b0c0 decodes
     MID-INSTRUCTION of this getter and has 0 callers. */
  assert.match(h, /CORRECTED from/);
  assert.match(h, /0x92b0c0 \(mid-instruction decode; 0 callers\)/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_DEATH_VA, 0x0092b070);
  assert.equal(PGD_DEATH_RET_OK_VA, 0x0092b0dd);
  assert.equal(PGD_DEATH_RET_NODE_FAIL_VA, 0x0092b0e7);
  assert.equal(PGD_DEATH_RET_FAIL_VA, 0x0092b0f0);
  assert.equal(PGD_DEATH_SLOT3_HEADER_OFF, 0xf7c);
  assert.equal(PGD_DEATH_MARKER_OFF, 0xd);
  assert.equal(PGD_DEATH_KEY_OFF, 0x10);
  assert.equal(PGD_DEATH_VALUE_OFF, 0x14);
  assert.equal(PGD_DEATH_CALL_SITES, 2);
  assert.equal(PGD_DEATH_CALL_SITE_VAS[0], 0x005c2380);
  assert.equal(PGD_DEATH_CALL_SITE_VAS[1], 0x008c78e1);
  /* the corrected NEXT_VA (v16) named this getter, not the mid-instruction
     address the v15 note recorded; v17 advanced it past the landed
     getters to AddBestiaryKill 0x92acb0; v20 landed the AddChallenge
     dispatcher 0x92a7b0 (PGDADDCH); v21 landed AddBoss 0x92a5e0
     (PGDADDBOSS); v22 landed AddMiniBoss 0x92a520 (PGDADDMINI) and
     advanced to 0x92b230 (SEC10); v23 landed PGDADSED 0x92b230 +
     PGDK41 0x92b270 (completing the PGDX/PGDK cluster) and
     advanced to the shared snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
  assert.notEqual(PGD_COUNT_PROBE_NEXT_VA, PGD_DEATH_VA);
  const m = readFileSync(source, "utf8");
  assert.match(m, /PGDDEATH/);
  assert.match(m, /GetBestiaryDeathCount/);
});

test("PE truth: PGDDEATH key derivation — two-record dword law", () => {
  /* [w0, w1, want-key] — the machine does `shl esi,0xc ; or
     esi,[eax+4] ; shl esi,8` with dword wrap at each step. */
  const cases = [
    [0x00000000, 0x00000000, 0x00000000],
    [0x00000001, 0x00000000, 0x00100000],
    [0x00000001, 0x00000001, 0x00100100],
    [0x00000123, 0x00000456, 0x12345600],
    [0x000000ff, 0x000000ff, 0x0ff0ff00],
    /* wrap: bit 31 of w0 is shifted OUT of the dword. */
    [0x80000000, 0x00000000, 0x00000000],
    [0xffffffff, 0xffffffff, 0xffffff00],
    [0xfffff000, 0x0000000f, 0x00000f00],
    [0x00001000, 0x00001000, 0x00100000],
    [0x10010010, 0x20020020, 0x03002000],
  ];
  for (const [w0, w1, want] of cases) {
    const ref = refDeathKey(w0, w1);
    assert.equal(ref, want >>> 0, `ref key(${w0.toString(16)},${w1.toString(16)})`);
    assert.equal(
      pgdBestiaryDeathKey(w0, w1),
      want >>> 0,
      `model key(0x${w0.toString(16)},0x${w1.toString(16)})`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_death_key(w0, w1) >>> 0,
      want >>> 0,
      `wasm key(0x${w0.toString(16)},0x${w1.toString(16)})`,
    );
  }
});

test("PE truth: PGDDEATH node gates — LOW-BYTE marker, SIGNED key, header", () => {
  /* [markerD, key, nodeKey, nodeIsHeader, want] — wide drives:
     marker byte gate is driven with 0x100 / 0x1ff / 0xffffffff and
     NOT pre-masked; the key compare is SIGNED (jl). */
  const cases = [
    /* marker_d LOW BYTE zero passes even when high bits are set. */
    [0x00000000, 0x10, 0x10, 0, 1],
    [0x00000100, 0x10, 0x10, 0, 1],
    [0xffffff00, 0x10, 0x10, 0, 1],
    [0x00000001, 0x10, 0x10, 0, 0],
    [0x000001ff, 0x10, 0x10, 0, 0],
    [0xffffffff, 0x10, 0x10, 0, 0],
    /* key >= node_key SIGNED: 0xffffffff reads -1. */
    [0, 0x00000010, 0x00000010, 0, 1],
    [0, 0x00000010, 0x0000000f, 0, 1],
    [0, 0x0000000f, 0x00000010, 0, 0],
    [0, 0xffffffff, 0x00000000, 0, 0], /* -1 < 0 -> fail */
    [0, 0xffffffff, 0xffffffff, 0, 1], /* -1 >= -1 -> pass */
    [0, 0xffffffff, 0xfffffffe, 0, 1], /* -1 >= -2 -> pass */
    [0, 0x80000000, 0x7fffffff, 0, 0], /* MIN < MAX -> fail */
    [0, 0x7fffffff, 0x80000000, 0, 1], /* MAX >= MIN -> pass */
    /* node == map header (pgd+0xf7c) always fails. */
    [0, 0x10, 0x10, 1, 0],
    [0x100, 0x10, 0x10, 1, 0],
    [0, 0xffffffff, 0xffffffff, 1, 0],
  ];
  for (const [markerD, key, nodeKey, isHeader, want] of cases) {
    const ref = refDeathNodeOk(markerD, key, nodeKey, isHeader);
    assert.equal(ref, want, `ref nodeOk(${markerD.toString(16)},${key},${nodeKey},${isHeader})`);
    assert.equal(
      pgdBestiaryDeathNodeOk(markerD, key, nodeKey, isHeader),
      want,
      `model nodeOk(${markerD.toString(16)},${key},${nodeKey},${isHeader})`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_death_node_ok(markerD, key, nodeKey, isHeader),
      want,
      `wasm nodeOk(${markerD.toString(16)},${key},${nodeKey},${isHeader})`,
    );
  }
});

test("PE truth: PGDDEATH value — node_value only on the ok path", () => {
  /* [markerD, key, nodeKey, nodeIsHeader, nodeValue, want] */
  const cases = [
    [0, 0x10, 0x10, 0, 0x00000000, 0x00000000],
    [0, 0x10, 0x10, 0, 0x00000001, 0x00000001],
    [0, 0x10, 0x10, 0, 0xffffffff, 0xffffffff],
    [0, 0x10, 0x10, 0, 0x80000000, 0x80000000],
    [0x100, 0x10, 0x10, 0, 0x00000007, 0x00000007],
    [0x100, 0x10, 0x10, 0, 0xffffffff, 0xffffffff],
    /* every fail path returns 0 regardless of the stored value. */
    [0x1ff, 0x10, 0x10, 0, 0xffffffff, 0],
    [0xffffffff, 0x10, 0x10, 0, 0xffffffff, 0],
    [0, 0x0f, 0x10, 0, 0xffffffff, 0],
    [0, 0xffffffff, 0x00000000, 0, 0xffffffff, 0],
    [0, 0x10, 0x10, 1, 0xffffffff, 0],
  ];
  for (const [markerD, key, nodeKey, isHeader, nodeValue, want] of cases) {
    const ref = refDeathValue(markerD, key, nodeKey, isHeader, nodeValue);
    assert.equal(ref, want >>> 0, `ref value`);
    assert.equal(
      pgdBestiaryDeathValue(markerD, key, nodeKey, isHeader, nodeValue),
      want >>> 0,
      `model value`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_death_value(markerD, key, nodeKey, isHeader, nodeValue) >>> 0,
      want >>> 0,
      `wasm value`,
    );
  }
});

test("PE truth: PGDDEATH VA records + callers + wasm surface", () => {
  const pairs = [
    [pgdBestiaryDeathVa, PGD_DEATH_VA, "va"],
    [pgdBestiaryDeathRetOkVa, PGD_DEATH_RET_OK_VA, "retOk"],
    [pgdBestiaryDeathRetNodeFailVa, PGD_DEATH_RET_NODE_FAIL_VA, "retNodeFail"],
    [pgdBestiaryDeathRetFailVa, PGD_DEATH_RET_FAIL_VA, "retFail"],
    [pgdBestiaryDeathSlot3HeaderOff, PGD_DEATH_SLOT3_HEADER_OFF, "slot3Header"],
    [pgdBestiaryDeathMarkerOff, PGD_DEATH_MARKER_OFF, "marker"],
    [pgdBestiaryDeathKeyOff, PGD_DEATH_KEY_OFF, "keyOff"],
    [pgdBestiaryDeathValueOff, PGD_DEATH_VALUE_OFF, "valueOff"],
    [pgdBestiaryDeathGameVa, PGD_DEATH_GAME_VA, "game"],
    [pgdBestiaryDeathContainerOff, PGD_DEATH_CONTAINER_OFF, "container"],
    [pgdBestiaryDeathGateByteOff, PGD_DEATH_GATE_BYTE_OFF, "gateByte"],
    [pgdBestiaryDeathContainerFindVa, PGD_DEATH_CONTAINER_FIND_VA, "containerFind"],
    [pgdBestiaryDeathMapFindVa, PGD_DEATH_MAP_FIND_VA, "mapFind"],
    [pgdBestiaryDeathKeyShift12Va, PGD_DEATH_KEY_SHIFT12_VA, "shift12"],
    [pgdBestiaryDeathKeyOrVa, PGD_DEATH_KEY_OR_VA, "or"],
    [pgdBestiaryDeathKeyShift8Va, PGD_DEATH_KEY_SHIFT8_VA, "shift8"],
    [pgdBestiaryDeathMarkerCmpVa, PGD_DEATH_MARKER_CMP_VA, "markerCmp"],
    [pgdBestiaryDeathMarkerJneVa, PGD_DEATH_MARKER_JNE_VA, "markerJne"],
    [pgdBestiaryDeathKeyCmpVa, PGD_DEATH_KEY_CMP_VA, "keyCmp"],
    [pgdBestiaryDeathKeyJlVa, PGD_DEATH_KEY_JL_VA, "keyJl"],
    [pgdBestiaryDeathHeaderCmpVa, PGD_DEATH_HEADER_CMP_VA, "headerCmp"],
    [pgdBestiaryDeathHeaderJeVa, PGD_DEATH_HEADER_JE_VA, "headerJe"],
    [pgdBestiaryDeathValueLoadVa, PGD_DEATH_VALUE_LOAD_VA, "valueLoad"],
  ];
  for (const [modelFn, want, label] of pairs) {
    assert.equal(modelFn() >>> 0, want >>> 0, `model ${label}`);
  }
  assert.equal(pgdBestiaryDeathCallSiteCount(), 2);
  assert.equal(pgdBestiaryDeathCallSiteVa(0), 0x005c2380);
  assert.equal(pgdBestiaryDeathCallSiteVa(1), 0x008c78e1);
  assert.equal(pgdBestiaryDeathCallSiteVa(2), 0);
  assert.equal(pgdBestiaryDeathCallSiteVa(-1), 0);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_bestiary_death_va() >>> 0, 0x0092b070);
  assert.equal(wasm.isaac_pgd_bestiary_death_ret_ok_va() >>> 0, 0x0092b0dd);
  assert.equal(wasm.isaac_pgd_bestiary_death_ret_node_fail_va() >>> 0, 0x0092b0e7);
  assert.equal(wasm.isaac_pgd_bestiary_death_ret_fail_va() >>> 0, 0x0092b0f0);
  assert.equal(wasm.isaac_pgd_bestiary_death_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_bestiary_death_call_site_va(1) >>> 0, 0x008c78e1);
  assert.equal(wasm.isaac_pgd_bestiary_death_slot3_header_off(), 0xf7c);
  assert.equal(wasm.isaac_pgd_bestiary_death_marker_off(), 0xd);
  assert.equal(wasm.isaac_pgd_bestiary_death_key_off(), 0x10);
  assert.equal(wasm.isaac_pgd_bestiary_death_value_off(), 0x14);
  assert.equal(wasm.isaac_pgd_bestiary_death_key_shift8_va() >>> 0, 0x0092b0b3);
  assert.equal(wasm.isaac_pgd_bestiary_death_value_load_va() >>> 0, 0x0092b0d5);
  /* the getter reads the SLOT-3 header: same offset the v3 clear-order
     law erases FIRST, and the v8 Clear map-row table names slot 3
     base 0xf7c. */
  assert.equal(PGD_DEATH_SLOT3_HEADER_OFF, PGDCLR_EXPECTED_MAP_ROWS[0].base);
  assert.equal(PGD_DEATH_SLOT3_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[3]);
});

test("PE truth: v16 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92b070);
  for (let n = 0; n < 4000; ++n) {
    const markerD = pick(rng, 0x100000000);
    const key = pick(rng, 0x100000000);
    const nodeKey = pick(rng, 0x100000000);
    const isHeader = pick(rng, 2);
    const nodeValue = pick(rng, 0x100000000);
    const refK = refDeathKey(key, nodeKey);
    assert.equal(pgdBestiaryDeathKey(key, nodeKey), refK,
      `key(0x${key.toString(16)},0x${nodeKey.toString(16)})`);
    const w0 = pick(rng, 0x100000000);
    const w1 = pick(rng, 0x100000000);
    assert.equal(pgdBestiaryDeathKey(w0, w1), refDeathKey(w0, w1),
      `key2(0x${w0.toString(16)},0x${w1.toString(16)})`);
    const refN = refDeathNodeOk(markerD, key, nodeKey, isHeader);
    assert.equal(pgdBestiaryDeathNodeOk(markerD, key, nodeKey, isHeader), refN,
      `nodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`);
    const refV = refDeathValue(markerD, key, nodeKey, isHeader, nodeValue);
    assert.equal(pgdBestiaryDeathValue(markerD, key, nodeKey, isHeader, nodeValue), refV,
      `value(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`);
  }
});

test("PE truth: v16 mutant — death getter gates must stay machine-exact", () => {
  /* M1: key missing the final <<8 would give 0x123456 instead of
     0x12345600 for (0x123, 0x456). */
  assert.equal(pgdBestiaryDeathKey(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryDeathKey(0x123, 0x456), 0x123456);
  /* M2: shifts swapped (<<8 then <<12) would give 0x12756000 for
     (0x123, 0x456); the machine does <<12, or, <<8. */
  assert.equal(pgdBestiaryDeathKey(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryDeathKey(0x123, 0x456), 0x12756000);
  /* M3: marker as a FULL-WORD test would fail 0x100 / 0xffffff00;
     the machine tests the LOW BYTE. */
  assert.equal(pgdBestiaryDeathNodeOk(0x100, 0x10, 0x10, 0), 1);
  assert.notEqual(pgdBestiaryDeathNodeOk(0x100, 0x10, 0x10, 0), 0);
  assert.equal(pgdBestiaryDeathNodeOk(0xffffff00, 0x10, 0x10, 0), 1);
  assert.equal(pgdBestiaryDeathNodeOk(0x1ff, 0x10, 0x10, 0), 0);
  assert.equal(pgdBestiaryDeathNodeOk(0xffffffff, 0x10, 0x10, 0), 0);
  /* M4: key compare as UNSIGNED would pass 0xffffffff vs 0 (reads
     4294967295 >= 0); the machine uses jl -> SIGNED -1 < 0 fails. */
  assert.equal(pgdBestiaryDeathNodeOk(0, 0xffffffff, 0, 0), 0);
  assert.notEqual(pgdBestiaryDeathNodeOk(0, 0xffffffff, 0, 0), 1);
  assert.equal(pgdBestiaryDeathNodeOk(0, 0xffffffff, 0xffffffff, 0), 1);
  assert.equal(pgdBestiaryDeathNodeOk(0, 0x80000000, 0x7fffffff, 0), 0);
  /* M5: dropping the header check would return the value even when
     node == map header; the machine `je fail`s at 0x92b0d3. */
  assert.equal(pgdBestiaryDeathValue(0, 0x10, 0x10, 1, 0xffffffff), 0);
  assert.notEqual(pgdBestiaryDeathValue(0, 0x10, 0x10, 1, 0xffffffff), 0xffffffff);
  assert.equal(pgdBestiaryDeathValue(0, 0x10, 0x10, 0, 0xffffffff), 0xffffffff);
  /* M6: the value would be returned even when the node is the header;
     covered by the same assert pair. The header test must discriminate
     a node_ok without the header gate. */
  assert.equal(pgdBestiaryDeathNodeOk(0, 0x10, 0x10, 1), 0);
});

/* =====================================================================
   ABI v17 — PGDKILL (GetBestiaryKillCount 0x0092b100) + PGDENC
   (GetBestiaryEncounterCount 0x0092b190)
   Evidence: section-notes/pgd-v17/ (cpu-dump 0x92b100..0x92b1e0; the
   v16 handoff's "0x92b110" kill entry decodes MID-INSTRUCTION inside
   the body — true entry 0x92b100, EXACT ZHL `GetBestiaryKillCount`
   148 pattern bytes, 7 inbound callers; 0x92b190 EXACT ZHL
   `GetBestiaryEncounterCount` 31 pattern bytes, 3 inbound callers +
   local helper 0x92b1e0 on slot base 0xf64 — the v16 "0xf74" was
   wrong, machine + ZHL struct say 0xf64).
   ===================================================================== */

/* Branch-by-branch references, transcribed from the instruction streams
   (NOT derived from the model or the C++). Both getters share the
   PGDDEATH template: kill gates @0x92b136..0x92b165, encounter gates
   in the helper @0x92b1bc..0x92b215. */

function refKillKey(w0, w1) {
  let key = (w0 >>> 0) << 12;
  key |= w1 >>> 0;
  return (key << 8) >>> 0;
}

function refKillNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((markerD >>> 0 & 0xff) !== 0) return 0;
  if ((key | 0) < (nodeKey | 0)) return 0;
  if ((nodeIsHeader >>> 0) !== 0) return 0;
  return 1;
}

function refKillValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  if (refKillNodeOk(markerD, key, nodeKey, nodeIsHeader) === 0) return 0;
  return nodeValue >>> 0;
}

function refEncKey(w0, w1) {
  let key = (w0 >>> 0) << 12;
  key |= w1 >>> 0;
  return (key << 8) >>> 0;
}

function refEncNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((markerD >>> 0 & 0xff) !== 0) return 0;
  if ((key | 0) < (nodeKey | 0)) return 0;
  if ((nodeIsHeader >>> 0) !== 0) return 0;
  return 1;
}

function refEncValue(markerD, key, nodeKey, nodeIsHeader, nodeValue) {
  if (refEncNodeOk(markerD, key, nodeKey, nodeIsHeader) === 0) return 0;
  return nodeValue >>> 0;
}

test("header records the v17 PGDKILL + PGDENC evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDKILL/);
  assert.match(h, /PGDENC/);
  assert.match(h, /GetBestiaryKillCount/);
  assert.match(h, /GetBestiaryEncounterCount/);
  assert.match(h, /0x0092b100/);
  assert.match(h, /0x0092b190/);
  assert.match(h, /0x92b110 decodes MID-INSTRUCTION/);
  assert.match(h, /0xf74/);
  assert.match(h, /0xf64/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_KILL_VA, 0x0092b100);
  assert.equal(PGD_ENC_VA, 0x0092b190);
  const m = readFileSync(source, "utf8");
  assert.match(m, /PGDKILL/);
  assert.match(m, /PGDENC/);
  assert.match(m, /GetBestiaryKillCount/);
  assert.match(m, /GetBestiaryEncounterCount/);
  /* v17 advanced the probe's next-island record past the landed
     getters to the write-side AddBestiaryKill 0x92acb0; v18 landed
     0x92acb0 (PGDADDKILL), v19 landed the slot-2/slot-3 sibling
     pair set (0x92aaf0..0x92ac20, PGDADDSIB2/PGDADDSIB3), v20
     landed the AddChallenge dispatcher 0x92a7b0 (PGDADDCH); v21
     landed AddBoss 0x92a5e0 (PGDADDBOSS); v22 landed AddMiniBoss
     0x92a520 (PGDADDMINI) and moved the frontier on to 0x92b230
     (SEC10); v23 landed PGDADSED 0x92b230 + PGDK41 0x92b270
     (completing the PGDX/PGDK cluster) and advanced to the shared
     snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDKILL + PGDENC key derivation — two-record dword law", () => {
  const cases = [
    [0x00000000, 0x00000000, 0x00000000],
    [0x00000001, 0x00000000, 0x00100000],
    [0x00000001, 0x00000001, 0x00100100],
    [0x00000123, 0x00000456, 0x12345600],
    [0x000000ff, 0x000000ff, 0x0ff0ff00],
    /* wrap: bit 31 of w0 is shifted OUT of the dword. */
    [0x80000000, 0x00000000, 0x00000000],
    [0xffffffff, 0xffffffff, 0xffffff00],
    [0xfffff000, 0x0000000f, 0x00000f00],
    [0x00001000, 0x00001000, 0x00100000],
    [0x10010010, 0x20020020, 0x03002000],
  ];
  for (const [w0, w1, want] of cases) {
    assert.equal(pgdBestiaryKillKey(w0, w1), want >>> 0, `kill key`);
    assert.equal(
      wasm.isaac_pgd_bestiary_kill_key(w0, w1) >>> 0, want >>> 0,
      `wasm kill key`,
    );
    assert.equal(pgdBestiaryEncounterKey(w0, w1), want >>> 0, `enc key`);
    assert.equal(
      wasm.isaac_pgd_bestiary_encounter_key(w0, w1) >>> 0, want >>> 0,
      `wasm enc key`,
    );
  }
});

test("PE truth: PGDKILL + PGDENC node gates — LOW-BYTE marker, SIGNED key, header", () => {
  const cases = [
    /* marker_d LOW BYTE zero is required; 0x100/0xffffff00 pass,
       0x1ff/0xffffffff fail. */
    [0x00000000, 0x10, 0x10, 0, 1],
    [0x00000100, 0x10, 0x10, 0, 1],
    [0xffffff00, 0x10, 0x10, 0, 1],
    [0x000001ff, 0x10, 0x10, 0, 0],
    [0xffffffff, 0x10, 0x10, 0, 0],
    /* SIGNED key gate: key < node_key fails. */
    [0, 0x0f, 0x10, 0, 0],
    [0, 0x10, 0x10, 0, 1],
    [0, 0x11, 0x10, 0, 1],
    [0, 0xffffffff, 0x00000000, 0, 0],
    [0, 0xffffffff, 0xffffffff, 0, 1],
    [0, 0x80000000, 0x7fffffff, 0, 0],
    /* header gate: node == map header fails. */
    [0, 0x10, 0x10, 1, 0],
    [0, 0x10, 0x10, 0, 1],
  ];
  for (const [markerD, key, nodeKey, isHeader, want] of cases) {
    assert.equal(pgdBestiaryKillNodeOk(markerD, key, nodeKey, isHeader), want,
      `kill nodeOk`);
    assert.equal(
      wasm.isaac_pgd_bestiary_kill_node_ok(markerD, key, nodeKey, isHeader),
      want, `wasm kill nodeOk`,
    );
    assert.equal(pgdBestiaryEncounterNodeOk(markerD, key, nodeKey, isHeader), want,
      `enc nodeOk`);
    assert.equal(
      wasm.isaac_pgd_bestiary_encounter_node_ok(markerD, key, nodeKey, isHeader),
      want, `wasm enc nodeOk`,
    );
  }
});

test("PE truth: PGDKILL + PGDENC value — node_value only on the ok path", () => {
  const cases = [
    [0, 0x10, 0x10, 0, 0x00000001, 0x00000001],
    [0, 0x10, 0x10, 0, 0xffffffff, 0xffffffff],
    [0, 0x10, 0x10, 0, 0x80000000, 0x80000000],
    [0x100, 0x10, 0x10, 0, 0x00000007, 0x00000007],
    /* every fail path returns 0 regardless of the stored value. */
    [0x1ff, 0x10, 0x10, 0, 0xffffffff, 0],
    [0xffffffff, 0x10, 0x10, 0, 0xffffffff, 0],
    [0, 0x0f, 0x10, 0, 0xffffffff, 0],
    [0, 0xffffffff, 0x00000000, 0, 0xffffffff, 0],
    [0, 0x10, 0x10, 1, 0xffffffff, 0],
  ];
  for (const [markerD, key, nodeKey, isHeader, nodeValue, want] of cases) {
    assert.equal(
      pgdBestiaryKillValue(markerD, key, nodeKey, isHeader, nodeValue),
      want >>> 0, `kill value`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_kill_value(markerD, key, nodeKey, isHeader, nodeValue) >>> 0,
      want >>> 0, `wasm kill value`,
    );
    assert.equal(
      pgdBestiaryEncounterValue(markerD, key, nodeKey, isHeader, nodeValue),
      want >>> 0, `enc value`,
    );
    assert.equal(
      wasm.isaac_pgd_bestiary_encounter_value(markerD, key, nodeKey, isHeader, nodeValue) >>> 0,
      want >>> 0, `wasm enc value`,
    );
  }
});

test("PE truth: PGDKILL + PGDENC VA records + callers + wasm surface", () => {
  const killPairs = [
    [pgdBestiaryKillVa, PGD_KILL_VA, "killVa"],
    [pgdBestiaryKillRetOkVa, PGD_KILL_RET_OK_VA, "killRetOk"],
    [pgdBestiaryKillRetNodeFailVa, PGD_KILL_RET_NODE_FAIL_VA, "killRetNodeFail"],
    [pgdBestiaryKillRetFailVa, PGD_KILL_RET_FAIL_VA, "killRetFail"],
    [pgdBestiaryKillSlot1HeaderOff, PGD_KILL_SLOT1_HEADER_OFF, "killSlot1"],
    [pgdBestiaryKillMarkerOff, PGD_KILL_MARKER_OFF, "killMarker"],
    [pgdBestiaryKillKeyOff, PGD_KILL_KEY_OFF, "killKeyOff"],
    [pgdBestiaryKillValueOff, PGD_KILL_VALUE_OFF, "killValueOff"],
    [pgdBestiaryKillGameVa, PGD_KILL_GAME_VA, "killGame"],
    [pgdBestiaryKillContainerOff, PGD_KILL_CONTAINER_OFF, "killContainer"],
    [pgdBestiaryKillGateByteOff, PGD_KILL_GATE_BYTE_OFF, "killGateByte"],
    [pgdBestiaryKillContainerFindVa, PGD_KILL_CONTAINER_FIND_VA, "killContainerFind"],
    [pgdBestiaryKillMapFindVa, PGD_KILL_MAP_FIND_VA, "killMapFind"],
    [pgdBestiaryKillKeyShift12Va, PGD_KILL_KEY_SHIFT12_VA, "killShift12"],
    [pgdBestiaryKillKeyOrVa, PGD_KILL_KEY_OR_VA, "killOr"],
    [pgdBestiaryKillKeyShift8Va, PGD_KILL_KEY_SHIFT8_VA, "killShift8"],
    [pgdBestiaryKillMarkerCmpVa, PGD_KILL_MARKER_CMP_VA, "killMarkerCmp"],
    [pgdBestiaryKillMarkerJneVa, PGD_KILL_MARKER_JNE_VA, "killMarkerJne"],
    [pgdBestiaryKillKeyCmpVa, PGD_KILL_KEY_CMP_VA, "killKeyCmp"],
    [pgdBestiaryKillKeyJlVa, PGD_KILL_KEY_JL_VA, "killKeyJl"],
    [pgdBestiaryKillHeaderCmpVa, PGD_KILL_HEADER_CMP_VA, "killHeaderCmp"],
    [pgdBestiaryKillHeaderJeVa, PGD_KILL_HEADER_JE_VA, "killHeaderJe"],
    [pgdBestiaryKillValueLoadVa, PGD_KILL_VALUE_LOAD_VA, "killValueLoad"],
  ];
  for (const [modelFn, want, label] of killPairs) {
    assert.equal(modelFn() >>> 0, want >>> 0, `model ${label}`);
  }
  assert.equal(pgdBestiaryKillCallSiteCount(), 7);
  assert.equal(pgdBestiaryKillCallSiteVa(0), 0x005c1d86);
  assert.equal(pgdBestiaryKillCallSiteVa(3), 0x008c799e);
  assert.equal(pgdBestiaryKillCallSiteVa(6), 0x0092add2);
  assert.equal(pgdBestiaryKillCallSiteVa(7), 0);
  assert.equal(pgdBestiaryKillCallSiteVa(-1), 0);
  /* wasm surface (spot: every kill export exists and reads the record). */
  assert.equal(wasm.isaac_pgd_bestiary_kill_va() >>> 0, 0x0092b100);
  assert.equal(wasm.isaac_pgd_bestiary_kill_ret_ok_va() >>> 0, 0x0092b16d);
  assert.equal(wasm.isaac_pgd_bestiary_kill_ret_node_fail_va() >>> 0, 0x0092b177);
  assert.equal(wasm.isaac_pgd_bestiary_kill_ret_fail_va() >>> 0, 0x0092b180);
  assert.equal(wasm.isaac_pgd_bestiary_kill_call_site_count(), 7);
  assert.equal(wasm.isaac_pgd_bestiary_kill_call_site_va(6) >>> 0, 0x0092add2);
  assert.equal(wasm.isaac_pgd_bestiary_kill_slot1_header_off(), 0xf6c);
  assert.equal(wasm.isaac_pgd_bestiary_kill_marker_off(), 0xd);
  assert.equal(wasm.isaac_pgd_bestiary_kill_key_off(), 0x10);
  assert.equal(wasm.isaac_pgd_bestiary_kill_value_off(), 0x14);
  assert.equal(wasm.isaac_pgd_bestiary_kill_key_shift8_va() >>> 0, 0x0092b143);
  assert.equal(wasm.isaac_pgd_bestiary_kill_value_load_va() >>> 0, 0x0092b165);
  /* kill slot-1 base cross-checks the writer's pair table and the v3
     clear-order law's slot-1 erase (erase-step index 3 in the
     PGDCLR map rows: clear order is slot 3,0,2,1). */
  assert.equal(PGD_KILL_SLOT1_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[1]);
  assert.equal(PGD_KILL_SLOT1_HEADER_OFF, PGDCLR_EXPECTED_MAP_ROWS[3].base);
  assert.equal(PGDCLR_EXPECTED_MAP_ROWS[3].slot, 1);

  const encPairs = [
    [pgdBestiaryEncounterVa, PGD_ENC_VA, "encVa"],
    [pgdBestiaryEncounterRetOkVa, PGD_ENC_RET_OK_VA, "encRetOk"],
    [pgdBestiaryEncounterRetFailVa, PGD_ENC_RET_FAIL_VA, "encRetFail"],
    [pgdBestiaryEncounterHelperVa, PGD_ENC_HELPER_VA, "encHelper"],
    [pgdBestiaryEncounterHelperRetOkVa, PGD_ENC_HELPER_RET_OK_VA, "encHelperRetOk"],
    [pgdBestiaryEncounterHelperRetFailVa, PGD_ENC_HELPER_RET_FAIL_VA, "encHelperRetFail"],
    [pgdBestiaryEncounterSlot0HeaderOff, PGD_ENC_SLOT0_HEADER_OFF, "encSlot0"],
    [pgdBestiaryEncounterMarkerOff, PGD_ENC_MARKER_OFF, "encMarker"],
    [pgdBestiaryEncounterKeyOff, PGD_ENC_KEY_OFF, "encKeyOff"],
    [pgdBestiaryEncounterValueOff, PGD_ENC_VALUE_OFF, "encValueOff"],
    [pgdBestiaryEncounterGameVa, PGD_ENC_GAME_VA, "encGame"],
    [pgdBestiaryEncounterContainerOff, PGD_ENC_CONTAINER_OFF, "encContainer"],
    [pgdBestiaryEncounterGateByteOff, PGD_ENC_GATE_BYTE_OFF, "encGateByte"],
    [pgdBestiaryEncounterContainerFindVa, PGD_ENC_CONTAINER_FIND_VA, "encContainerFind"],
    [pgdBestiaryEncounterMapFindVa, PGD_ENC_MAP_FIND_VA, "encMapFind"],
    [pgdBestiaryEncounterKeyShift12Va, PGD_ENC_KEY_SHIFT12_VA, "encShift12"],
    [pgdBestiaryEncounterKeyOrVa, PGD_ENC_KEY_OR_VA, "encOr"],
    [pgdBestiaryEncounterKeyShift8Va, PGD_ENC_KEY_SHIFT8_VA, "encShift8"],
    [pgdBestiaryEncounterMarkerCmpVa, PGD_ENC_MARKER_CMP_VA, "encMarkerCmp"],
    [pgdBestiaryEncounterMarkerJneVa, PGD_ENC_MARKER_JNE_VA, "encMarkerJne"],
    [pgdBestiaryEncounterKeyCmpVa, PGD_ENC_KEY_CMP_VA, "encKeyCmp"],
    [pgdBestiaryEncounterKeyJlVa, PGD_ENC_KEY_JL_VA, "encKeyJl"],
    [pgdBestiaryEncounterHeaderCmpVa, PGD_ENC_HEADER_CMP_VA, "encHeaderCmp"],
    [pgdBestiaryEncounterHeaderJeVa, PGD_ENC_HEADER_JE_VA, "encHeaderJe"],
    [pgdBestiaryEncounterValueLoadVa, PGD_ENC_VALUE_LOAD_VA, "encValueLoad"],
  ];
  for (const [modelFn, want, label] of encPairs) {
    assert.equal(modelFn() >>> 0, want >>> 0, `model ${label}`);
  }
  assert.equal(pgdBestiaryEncounterCallSiteCount(), 3);
  assert.equal(pgdBestiaryEncounterCallSiteVa(0), 0x004adf67);
  assert.equal(pgdBestiaryEncounterCallSiteVa(2), 0x0092b02e);
  assert.equal(pgdBestiaryEncounterCallSiteVa(3), 0);
  assert.equal(pgdBestiaryEncounterHelperCallSiteCount(), 2);
  assert.equal(pgdBestiaryEncounterHelperCallSiteVa(0), 0x008c68fc);
  assert.equal(pgdBestiaryEncounterHelperCallSiteVa(1), 0x0092b1c8);
  assert.equal(pgdBestiaryEncounterHelperCallSiteVa(2), 0);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_bestiary_encounter_va() >>> 0, 0x0092b190);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_ret_ok_va() >>> 0, 0x0092b1cf);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_ret_fail_va() >>> 0, 0x0092b1d6);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_helper_va() >>> 0, 0x0092b1e0);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_helper_ret_ok_va() >>> 0, 0x0092b21d);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_helper_ret_fail_va() >>> 0, 0x0092b227);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_call_site_count(), 3);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_helper_call_site_va(1) >>> 0, 0x0092b1c8);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_slot0_header_off(), 0xf64);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_marker_off(), 0xd);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_key_off(), 0x10);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_value_off(), 0x14);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_key_shift8_va() >>> 0, 0x0092b1c2);
  assert.equal(wasm.isaac_pgd_bestiary_encounter_value_load_va() >>> 0, 0x0092b215);
  /* the encounter slot-0 base is the bestiary STRUCT base (ZHL:
     `PersistentGameData_Bestiary bestiary : 0xf64`), cross-checked
     against the reader's section-11 field offset and the writer's
     first-drained pair (tag 4 -> pair slot 0 -> count 0xf68 probe). */
  assert.equal(PGD_ENC_SLOT0_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[0]);
  assert.equal(PGD_ENC_SLOT0_HEADER_OFF, 0xf64);
  /* the count-probe's proceed gate reads the slot-0 COUNT (+0xf68):
     same map the encounter getter reads. */
  assert.equal(PGD_COUNT_SLOT0_COUNT_OFF, 0xf68);
});

test("PE truth: v17 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92b100);
  for (let n = 0; n < 4000; ++n) {
    const markerD = pick(rng, 0x100000000);
    const key = pick(rng, 0x100000000);
    const nodeKey = pick(rng, 0x100000000);
    const isHeader = pick(rng, 2);
    const nodeValue = pick(rng, 0x100000000);
    const w0 = pick(rng, 0x100000000);
    const w1 = pick(rng, 0x100000000);
    const refK = refKillKey(w0, w1);
    assert.equal(pgdBestiaryKillKey(w0, w1), refK,
      `killKey(0x${w0.toString(16)},0x${w1.toString(16)})`);
    assert.equal(pgdBestiaryEncounterKey(w0, w1), refEncKey(w0, w1),
      `encKey(0x${w0.toString(16)},0x${w1.toString(16)})`);
    const refN = refKillNodeOk(markerD, key, nodeKey, isHeader);
    assert.equal(pgdBestiaryKillNodeOk(markerD, key, nodeKey, isHeader), refN,
      `killNodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`);
    assert.equal(
      pgdBestiaryEncounterNodeOk(markerD, key, nodeKey, isHeader),
      refEncNodeOk(markerD, key, nodeKey, isHeader),
      `encNodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`,
    );
    const refV = refKillValue(markerD, key, nodeKey, isHeader, nodeValue);
    assert.equal(pgdBestiaryKillValue(markerD, key, nodeKey, isHeader, nodeValue), refV,
      `killValue`);
    assert.equal(
      pgdBestiaryEncounterValue(markerD, key, nodeKey, isHeader, nodeValue),
      refEncValue(markerD, key, nodeKey, isHeader, nodeValue),
      `encValue`,
    );
  }
});

test("PE truth: v17 mutant — sibling getter gates must stay machine-exact", () => {
  /* M1: kill key missing the final <<8 would give 0x123456 instead of
     0x12345600 for (0x123, 0x456). */
  assert.equal(pgdBestiaryKillKey(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryKillKey(0x123, 0x456), 0x123456);
  /* M2: encounter key shifts swapped (<<8 then <<12) would give
     0x12756000 for (0x123, 0x456); the machine does <<12, or, <<8. */
  assert.equal(pgdBestiaryEncounterKey(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryEncounterKey(0x123, 0x456), 0x12756000);
  /* M3: kill marker as a FULL-WORD test would fail 0x100 / 0xffffff00;
     the machine tests the LOW BYTE. */
  assert.equal(pgdBestiaryKillNodeOk(0x100, 0x10, 0x10, 0), 1);
  assert.notEqual(pgdBestiaryKillNodeOk(0x100, 0x10, 0x10, 0), 0);
  assert.equal(pgdBestiaryKillNodeOk(0xffffff00, 0x10, 0x10, 0), 1);
  assert.equal(pgdBestiaryKillNodeOk(0x1ff, 0x10, 0x10, 0), 0);
  assert.equal(pgdBestiaryKillNodeOk(0xffffffff, 0x10, 0x10, 0), 0);
  /* M4: encounter key compare as UNSIGNED would pass 0xffffffff vs 0
     (reads 4294967295 >= 0); the machine uses jl -> SIGNED fails. */
  assert.equal(pgdBestiaryEncounterNodeOk(0, 0xffffffff, 0, 0), 0);
  assert.notEqual(pgdBestiaryEncounterNodeOk(0, 0xffffffff, 0, 0), 1);
  assert.equal(pgdBestiaryEncounterNodeOk(0, 0xffffffff, 0xffffffff, 0), 1);
  assert.equal(pgdBestiaryEncounterNodeOk(0, 0x80000000, 0x7fffffff, 0), 0);
  /* M5: dropping the header check would return the value even when
     node == map header. */
  assert.equal(pgdBestiaryKillValue(0, 0x10, 0x10, 1, 0xffffffff), 0);
  assert.notEqual(pgdBestiaryKillValue(0, 0x10, 0x10, 1, 0xffffffff), 0xffffffff);
  assert.equal(pgdBestiaryKillValue(0, 0x10, 0x10, 0, 0xffffffff), 0xffffffff);
  assert.equal(pgdBestiaryEncounterValue(0, 0x10, 0x10, 1, 0xffffffff), 0);
  assert.notEqual(
    pgdBestiaryEncounterValue(0, 0x10, 0x10, 1, 0xffffffff), 0xffffffff,
  );
  assert.equal(
    pgdBestiaryEncounterValue(0, 0x10, 0x10, 0, 0xffffffff), 0xffffffff,
  );
  /* M6: the value would be returned even when the node is the header;
     the node_ok header gate must discriminate. */
  assert.equal(pgdBestiaryEncounterNodeOk(0, 0x10, 0x10, 1), 0);
  assert.equal(pgdBestiaryKillNodeOk(0, 0x10, 0x10, 1), 0);
});

/* =====================================================================
   ABI v18 — PGDADDKILL (AddBestiaryKill 0x0092acb0)
   Evidence: section-notes/pgd-v18/ (cpu-dump 0x92acb0..0x92adfd; EXACT
   ZHL `PersistentGameData::AddBestiaryKill(int EntityType, int
   EntityVariant)` 15 pattern bytes, 4 inbound callers 0x4c8618 /
   0x59f451 / 0x7a0946 / 0x92b047 — the last is the v15 PGDCP probe's
   own call, NOT dead; ret 8 @0x92adf2 ok / @0x92adfd fail; body
   0x92acb0..0x92adfd; jump table @0x92ae00 {0x92adb9, 0x92ad81,
   0x92ad9d, 0x92adea}, byte table @0x92ae10 0x86 entries).
   ===================================================================== */

/* Branch-by-branch references, transcribed from the instruction stream
   (NOT derived from the model or the C++). */

function refAddKillOk(readonlyByte, recFound, gateByte) {
  /* 0x92acbb/0x92acbf `cmp byte [edi+1],0 ; jne fail` — readonly
     LOW BYTE. */
  if ((readonlyByte >>> 0 & 0xff) !== 0) return 0;
  /* 0x92acde/0x92ace0 `test ebx,ebx ; je fail` — rec found. */
  if ((recFound >>> 0) === 0) return 0;
  /* 0x92ace6/0x92aced `cmp byte [ebx+0xe8],0 ; je fail` — gate byte
     LOW BYTE must be NON-zero. */
  if ((gateByte >>> 0 & 0xff) === 0) return 0;
  return 1;
}

function refAddKillKey(w0, w1) {
  let key = (w0 >>> 0) << 12;
  key |= w1 >>> 0;
  return (key << 8) >>> 0;
}

function refAddKillNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  if ((markerD >>> 0 & 0xff) !== 0) return 0;
  if ((key | 0) < (nodeKey | 0)) return 0;
  if ((nodeIsHeader >>> 0) !== 0) return 0;
  return 1;
}

function refAddKillStoreValue(nodeOk, oldValue) {
  /* found `inc dword [eax]` @0x92ad36; not-found `mov dword
     [eax],1` @0x92ad48 — INSERT. */
  if ((nodeOk >>> 0) !== 0) return ((oldValue >>> 0) + 1) >>> 0;
  return 1;
}

/* The byte table @0x92ae10 (0x86 entries) read byte-for-byte from the
   image: idx 0->0, 1->0, 0x23->1, 0x85->2, else->3. */
const REF_ADDKILL_BYTE_TABLE = (() => {
  const t = new Array(0x86).fill(3);
  t[0] = 0;
  t[1] = 0;
  t[0x23] = 1;
  t[0x85] = 2;
  return t;
})();

function refAddKillDispatchCase(type) {
  /* 0x92ad63..0x92ad71: idx = type - 0x10f (bounded to 32 bits);
     `cmp ecx,0x85 ; ja skip` — UNSIGNED range gate. */
  let idx = (type >>> 0) - 0x10f;
  idx = idx >>> 0;
  if (idx > 0x85) return 3;
  return REF_ADDKILL_BYTE_TABLE[idx];
}

function refAddKillUnlockNeeded(dispatchCase, count) {
  const c = dispatchCase | 0;
  const n = count >>> 0;
  if (c === 0) return n >= 0xa ? 1 : 0;
  if (c === 1) return n >= 0x14 ? 1 : 0;
  if (c === 2) return n >= 0x14 ? 1 : 0;
  return 0;
}

function refAddKillUnlockId(dispatchCase) {
  const c = dispatchCase | 0;
  if (c === 0) return 0x175;
  if (c === 1) return 0x15d;
  if (c === 2) return 0x164;
  return 0;
}

function refAddKillCase0Sum(n1, n2) {
  return ((n1 >>> 0) + (n2 >>> 0)) >>> 0;
}

test("header records the v18 PGDADDKILL evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADDKILL/);
  assert.match(h, /AddBestiaryKill/);
  assert.match(h, /0x0092acb0/);
  assert.match(h, /0x92ae00/);
  assert.match(h, /0x92ae10/);
  assert.match(h, /0x92ca70/);
  assert.match(h, /0x929a20/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_ADDKILL_VA, 0x0092acb0);
  assert.equal(PGD_ADDKILL_RET_OK_VA, 0x0092adf2);
  assert.equal(PGD_ADDKILL_RET_FAIL_VA, 0x0092adfd);
  const m = readFileSync(source, "utf8");
  assert.match(m, /PGDADDKILL/);
  assert.match(m, /AddBestiaryKill/);
  assert.match(m, /kPgdAddKillByteTable/);
  /* v18 advances the probe's next-island record past the write-side
     mutator to the slot-3 sibling 0x92ac20; v19 landed that sibling
     pair set (PGDADDSIB2/PGDADDSIB3), v20 landed the AddChallenge
     dispatcher 0x92a7b0 (PGDADDCH); v21 landed AddBoss 0x92a5e0
     (PGDADDBOSS); v22 landed AddMiniBoss 0x92a520 (PGDADDMINI) and
     advanced on to 0x92b230 (SEC10); v23 landed PGDADSED 0x92b230 +
     PGDK41 0x92b270 (completing the PGDX/PGDK cluster) and advanced
     to the shared snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADDKILL ok — entry fail gates in machine order", () => {
  const cases = [
    /* readonly LOW BYTE != 0 -> 0, even with valid rec + gate. */
    [0x00000001, 1, 1, 0],
    [0x000001ff, 1, 1, 0],
    [0xffffffff, 1, 1, 0],
    /* readonly low byte 0 -> passes gate A (wide 0x100/0xffffff00). */
    [0x00000000, 1, 1, 1],
    [0x00000100, 1, 1, 1],
    [0xffffff00, 1, 1, 1],
    /* rec_found == 0 -> 0. */
    [0, 0, 1, 0],
    /* gate_byte LOW BYTE == 0 -> 0 (0x100 low byte is 0). */
    [0, 1, 0x00000000, 0],
    [0, 1, 0x00000100, 0],
    /* gate_byte low byte non-zero -> passes gate C. */
    [0, 1, 0x00000001, 1],
    [0, 1, 0x000001ff, 1],
    [0, 1, 0xffffffff, 1],
    [0, 1, 0xffffff01, 1],
  ];
  for (const [ro, rec, gate, want] of cases) {
    assert.equal(pgdBestiaryAddKillOk(ro, rec, gate), want, `ok` );
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_ok(ro, rec, gate), want,
      `wasm ok`,
    );
    assert.equal(refAddKillOk(ro, rec, gate), want, `ref ok`);
  }
});

test("PE truth: PGDADDKILL key derivation — two-record dword law", () => {
  const cases = [
    [0x00000000, 0x00000000, 0x00000000],
    [0x00000001, 0x00000000, 0x00100000],
    [0x00000001, 0x00000001, 0x00100100],
    [0x00000123, 0x00000456, 0x12345600],
    [0x000000ff, 0x000000ff, 0x0ff0ff00],
    /* wrap: bit 31 of w0 is shifted OUT of the dword. */
    [0x80000000, 0x00000000, 0x00000000],
    [0xffffffff, 0xffffffff, 0xffffff00],
    [0xfffff000, 0x0000000f, 0x00000f00],
    [0x00001000, 0x00001000, 0x00100000],
    [0x10010010, 0x20020020, 0x03002000],
  ];
  for (const [w0, w1, want] of cases) {
    assert.equal(pgdBestiaryAddKillKey(w0, w1), want >>> 0, `kill key`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_key(w0, w1) >>> 0, want >>> 0,
      `wasm kill key`,
    );
    assert.equal(refAddKillKey(w0, w1), want >>> 0, `ref key`);
  }
});

test("PE truth: PGDADDKILL node gates — LOW-BYTE marker, SIGNED key, header", () => {
  const cases = [
    [0x00000000, 0x10, 0x10, 0, 1],
    [0x00000100, 0x10, 0x10, 0, 1],
    [0xffffff00, 0x10, 0x10, 0, 1],
    [0x000001ff, 0x10, 0x10, 0, 0],
    [0xffffffff, 0x10, 0x10, 0, 0],
    [0, 0x0f, 0x10, 0, 0],
    [0, 0x10, 0x10, 0, 1],
    [0, 0x11, 0x10, 0, 1],
    [0, 0xffffffff, 0x00000000, 0, 0],
    [0, 0xffffffff, 0xffffffff, 0, 1],
    [0, 0x80000000, 0x7fffffff, 0, 0],
    [0, 0x10, 0x10, 1, 0],
    [0, 0x10, 0x10, 0, 1],
  ];
  for (const [markerD, key, nodeKey, isHeader, want] of cases) {
    assert.equal(pgdBestiaryAddKillNodeOk(markerD, key, nodeKey, isHeader), want,
      `nodeOk`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_node_ok(markerD, key, nodeKey, isHeader),
      want, `wasm nodeOk`,
    );
    assert.equal(refAddKillNodeOk(markerD, key, nodeKey, isHeader), want,
      `ref nodeOk`);
  }
});

test("PE truth: PGDADDKILL store_value — INSERT on gate fail (write-side)", () => {
  const cases = [
    /* found: old + 1 mod 2^32 (inc dword [eax]). */
    [1, 0, 1],
    [1, 1, 2],
    [1, 0xffffffff, 0],
    [1, 0x7fffffff, 0x80000000],
    [1, 0x80000000, 0x80000001],
    /* NOT found: value = 1 (mov dword [eax],1) — INSERT, NOT 0. */
    [0, 0, 1],
    [0, 5, 1],
    [0, 0xffffffff, 1],
  ];
  for (const [nodeOk, oldValue, want] of cases) {
    assert.equal(pgdBestiaryAddKillStoreValue(nodeOk, oldValue), want >>> 0,
      `storeValue`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_store_value(nodeOk, oldValue) >>> 0,
      want >>> 0, `wasm storeValue`,
    );
    assert.equal(refAddKillStoreValue(nodeOk, oldValue), want >>> 0,
      `ref storeValue`);
  }
});

test("PE truth: PGDADDKILL dispatch_case — byte table + UNSIGNED range gate", () => {
  const cases = [
    /* idx <= 0x85 and inside the table. */
    [0x10f, 0],  /* idx 0x00 -> 0 */
    [0x110, 0],  /* idx 0x01 -> 0 */
    [0x132, 1],  /* idx 0x23 -> 1 */
    [0x194, 2],  /* idx 0x85 -> 2 */
    [0x111, 3],  /* idx 0x02 -> 3 */
    [0x131, 3],  /* idx 0x22 -> 3 */
    [0x133, 3],  /* idx 0x24 -> 3 */
    [0x193, 3],  /* idx 0x84 -> 3 */
    [0x10f + 0x86, 3], /* idx 0x86 -> UNSIGNED out of range -> 3 */
    [0x10f + 0x87, 3],
    /* high-bit variants prove the UNSIGNED gate: idx computed with
       32-bit wrap; anything above 0x85 (including huge unsigned)
       is case 3. */
    [0x80000000, 3],
    [0xffffffff, 3],
    [0x010f, 0], /* idx 0 -> 0 */
    [0x1fffffff, 3],
  ];
  for (const [type, want] of cases) {
    assert.equal(pgdBestiaryAddKillDispatchCase(type), want, `dispatch`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_dispatch_case(type), want,
      `wasm dispatch`,
    );
    assert.equal(refAddKillDispatchCase(type), want, `ref dispatch`);
  }
  /* The embedded byte table must be byte-identical to the image. */
  assert.equal(PGD_ADDKILL_BYTE_TABLE.length, 0x86);
  assert.equal(PGD_ADDKILL_BT_ENTRIES, 0x86);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[0], 0);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[1], 0);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[0x23], 1);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[0x85], 2);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[2], 3);
  assert.equal(PGD_ADDKILL_BYTE_TABLE[0x84], 3);
  /* model byte table equals the branch-by-branch reference table. */
  assert.deepEqual(PGD_ADDKILL_BYTE_TABLE.slice(), REF_ADDKILL_BYTE_TABLE);
});

test("PE truth: PGDADDKILL unlock gates + ids + case0 sum", () => {
  const gateCases = [
    /* case0: sum >= 0xa UNSIGNED unlocks. */
    [0, 0x00, 0],
    [0, 0x09, 0],
    [0, 0x0a, 1],
    [0, 0x0b, 1],
    [0, 0xffffffff, 1],
    /* case1/case2: count >= 0x14 UNSIGNED. */
    [1, 0x13, 0],
    [1, 0x14, 1],
    [1, 0x15, 1],
    [1, 0xffffffff, 1],
    [2, 0x13, 0],
    [2, 0x14, 1],
    [2, 0xffffffff, 1],
    /* case3: never. */
    [3, 0x00, 0],
    [3, 0xffffffff, 0],
    [4, 0xffffffff, 0],
    [-1, 0xffffffff, 0],
  ];
  for (const [c, count, want] of gateCases) {
    assert.equal(pgdBestiaryAddKillUnlockNeeded(c, count), want, `unlockNeeded`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_unlock_needed(c, count), want,
      `wasm unlockNeeded`,
    );
    assert.equal(refAddKillUnlockNeeded(c, count), want, `ref unlockNeeded`);
  }
  const idCases = [
    [0, 0x175],
    [1, 0x15d],
    [2, 0x164],
    [3, 0],
    [4, 0],
    [-1, 0],
  ];
  for (const [c, want] of idCases) {
    assert.equal(pgdBestiaryAddKillUnlockId(c), want, `unlockId`);
    assert.equal(wasm.isaac_pgd_bestiary_addkill_unlock_id(c), want,
      `wasm unlockId`);
    assert.equal(refAddKillUnlockId(c), want, `ref unlockId`);
  }
  /* case0 sum: (n1 + n2) mod 2^32. */
  for (const [n1, n2, want] of [
    [0, 0, 0],
    [1, 2, 3],
    [0xffffffff, 1, 0],
    [0xffffffff, 0xffffffff, 0xfffffffe],
    [0x80000000, 0x80000000, 0],
    [0xa, 0, 0xa],
  ]) {
    assert.equal(pgdBestiaryAddKillCase0Sum(n1, n2), want >>> 0, `case0Sum`);
    assert.equal(
      wasm.isaac_pgd_bestiary_addkill_case0_sum(n1, n2) >>> 0, want >>> 0,
      `wasm case0Sum`,
    );
    assert.equal(refAddKillCase0Sum(n1, n2), want >>> 0, `ref case0Sum`);
  }
});

test("PE truth: PGDADDKILL VA records + callers + wasm surface", () => {
  const pairs = [
    [pgdBestiaryAddKillVa, PGD_ADDKILL_VA, "addKillVa"],
    [pgdBestiaryAddKillRetOkVa, PGD_ADDKILL_RET_OK_VA, "addKillRetOk"],
    [pgdBestiaryAddKillRetFailVa, PGD_ADDKILL_RET_FAIL_VA, "addKillRetFail"],
    [pgdBestiaryAddKillSlot1HeaderOff, PGD_ADDKILL_SLOT1_HEADER_OFF, "addKillSlot1"],
    [pgdBestiaryAddKillMarkerOff, PGD_ADDKILL_MARKER_OFF, "addKillMarker"],
    [pgdBestiaryAddKillKeyOff, PGD_ADDKILL_KEY_OFF, "addKillKeyOff"],
    [pgdBestiaryAddKillValueOff, PGD_ADDKILL_VALUE_OFF, "addKillValueOff"],
    [pgdBestiaryAddKillGameVa, PGD_ADDKILL_GAME_VA, "addKillGame"],
    [pgdBestiaryAddKillContainerOff, PGD_ADDKILL_CONTAINER_OFF, "addKillContainer"],
    [pgdBestiaryAddKillGateByteOff, PGD_ADDKILL_GATE_BYTE_OFF, "addKillGateByte"],
    [pgdBestiaryAddKillContainerFindVa, PGD_ADDKILL_CONTAINER_FIND_VA, "addKillContainerFind"],
    [pgdBestiaryAddKillMapFindVa, PGD_ADDKILL_MAP_FIND_VA, "addKillMapFind"],
    [pgdBestiaryAddKillValueAccessorVa, PGD_ADDKILL_VALUE_ACCESSOR_VA, "addKillValueAccessor"],
    [pgdBestiaryAddKillKillGetterVa, PGD_ADDKILL_KILL_GETTER_VA, "addKillKillGetter"],
    [pgdBestiaryAddKillUnlockVa, PGD_ADDKILL_UNLOCK_VA, "addKillUnlock"],
    [pgdBestiaryAddKillTypeBase, PGD_ADDKILL_TYPE_BASE, "addKillTypeBase"],
    [pgdBestiaryAddKillRange, PGD_ADDKILL_RANGE, "addKillRange"],
    [pgdBestiaryAddKillBtVa, PGD_ADDKILL_BT_VA, "addKillBtVa"],
    [pgdBestiaryAddKillBtEntries, PGD_ADDKILL_BT_ENTRIES, "addKillBtEntries"],
    [pgdBestiaryAddKillJtVa, PGD_ADDKILL_JT_VA, "addKillJtVa"],
    [pgdBestiaryAddKillReadonlyCmpVa, PGD_ADDKILL_READONLY_CMP_VA, "addKillRoCmp"],
    [pgdBestiaryAddKillReadonlyJneVa, PGD_ADDKILL_READONLY_JNE_VA, "addKillRoJne"],
    [pgdBestiaryAddKillRecTestVa, PGD_ADDKILL_REC_TEST_VA, "addKillRecTest"],
    [pgdBestiaryAddKillRecJeVa, PGD_ADDKILL_REC_JE_VA, "addKillRecJe"],
    [pgdBestiaryAddKillGateCmpVa, PGD_ADDKILL_GATE_CMP_VA, "addKillGateCmp"],
    [pgdBestiaryAddKillGateJeVa, PGD_ADDKILL_GATE_JE_VA, "addKillGateJe"],
    [pgdBestiaryAddKillKeyShift12Va, PGD_ADDKILL_KEY_SHIFT12_VA, "addKillShift12"],
    [pgdBestiaryAddKillKeyOrVa, PGD_ADDKILL_KEY_OR_VA, "addKillOr"],
    [pgdBestiaryAddKillKeyShift8Va, PGD_ADDKILL_KEY_SHIFT8_VA, "addKillShift8"],
    [pgdBestiaryAddKillMarkerCmpVa, PGD_ADDKILL_MARKER_CMP_VA, "addKillMarkerCmp"],
    [pgdBestiaryAddKillMarkerJneVa, PGD_ADDKILL_MARKER_JNE_VA, "addKillMarkerJne"],
    [pgdBestiaryAddKillKeyCmpVa, PGD_ADDKILL_KEY_CMP_VA, "addKillKeyCmp"],
    [pgdBestiaryAddKillKeyJlVa, PGD_ADDKILL_KEY_JL_VA, "addKillKeyJl"],
    [pgdBestiaryAddKillHeaderCmpVa, PGD_ADDKILL_HEADER_CMP_VA, "addKillHeaderCmp"],
    [pgdBestiaryAddKillHeaderJeVa, PGD_ADDKILL_HEADER_JE_VA, "addKillHeaderJe"],
    [pgdBestiaryAddKillStoreIncVa, PGD_ADDKILL_STORE_INC_VA, "addKillStoreInc"],
    [pgdBestiaryAddKillStoreSet1Va, PGD_ADDKILL_STORE_SET1_VA, "addKillStoreSet1"],
    [pgdBestiaryAddKillRangeCmpVa, PGD_ADDKILL_RANGE_CMP_VA, "addKillRangeCmp"],
    [pgdBestiaryAddKillRangeJaVa, PGD_ADDKILL_RANGE_JA_VA, "addKillRangeJa"],
    [pgdBestiaryAddKillTableLoadVa, PGD_ADDKILL_TABLE_LOAD_VA, "addKillTableLoad"],
    [pgdBestiaryAddKillDispatchJmpVa, PGD_ADDKILL_DISPATCH_JMP_VA, "addKillDispatchJmp"],
    [pgdBestiaryAddKillCase1CmpVa, PGD_ADDKILL_CASE1_CMP_VA, "addKillCase1Cmp"],
    [pgdBestiaryAddKillCase1JbVa, PGD_ADDKILL_CASE1_JB_VA, "addKillCase1Jb"],
    [pgdBestiaryAddKillCase1PushVa, PGD_ADDKILL_CASE1_PUSH_VA, "addKillCase1Push"],
    [pgdBestiaryAddKillCase1RetVa, PGD_ADDKILL_CASE1_RET_VA, "addKillCase1Ret"],
    [pgdBestiaryAddKillCase2CmpVa, PGD_ADDKILL_CASE2_CMP_VA, "addKillCase2Cmp"],
    [pgdBestiaryAddKillCase2JbVa, PGD_ADDKILL_CASE2_JB_VA, "addKillCase2Jb"],
    [pgdBestiaryAddKillCase2PushVa, PGD_ADDKILL_CASE2_PUSH_VA, "addKillCase2Push"],
    [pgdBestiaryAddKillCase2RetVa, PGD_ADDKILL_CASE2_RET_VA, "addKillCase2Ret"],
    [pgdBestiaryAddKillCase0Call1Va, PGD_ADDKILL_CASE0_CALL1_VA, "addKillCase0Call1"],
    [pgdBestiaryAddKillCase0Call2Va, PGD_ADDKILL_CASE0_CALL2_VA, "addKillCase0Call2"],
    [pgdBestiaryAddKillCase0AddVa, PGD_ADDKILL_CASE0_ADD_VA, "addKillCase0Add"],
    [pgdBestiaryAddKillCase0CmpVa, PGD_ADDKILL_CASE0_CMP_VA, "addKillCase0Cmp"],
    [pgdBestiaryAddKillCase0JbVa, PGD_ADDKILL_CASE0_JB_VA, "addKillCase0Jb"],
    [pgdBestiaryAddKillCase0PushVa, PGD_ADDKILL_CASE0_PUSH_VA, "addKillCase0Push"],
  ];
  for (const [modelFn, want, label] of pairs) {
    assert.equal(modelFn() >>> 0, want >>> 0, `model ${label}`);
  }
  assert.equal(pgdBestiaryAddKillCallSiteCount(), 4);
  assert.equal(pgdBestiaryAddKillCallSiteVa(0), 0x004c8618);
  assert.equal(pgdBestiaryAddKillCallSiteVa(1), 0x0059f451);
  assert.equal(pgdBestiaryAddKillCallSiteVa(2), 0x007a0946);
  assert.equal(pgdBestiaryAddKillCallSiteVa(3), 0x0092b047);
  assert.equal(pgdBestiaryAddKillCallSiteVa(4), 0);
  assert.equal(pgdBestiaryAddKillCallSiteVa(-1), 0);
  /* the 4th caller is the v15 PGDCP probe's own call — cross-check. */
  assert.equal(PGD_ADDKILL_CALL_SITE_VAS[3], 0x0092b047);
  assert.equal(PGD_COUNT_PROBE_CALL_SITE_VAS.includes(0x0092b047), false);
  /* wasm surface (spot: every addkill export exists and reads the record). */
  assert.equal(wasm.isaac_pgd_bestiary_addkill_va() >>> 0, 0x0092acb0);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_ret_ok_va() >>> 0, 0x0092adf2);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_ret_fail_va() >>> 0, 0x0092adfd);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_call_site_count(), 4);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_call_site_va(3) >>> 0, 0x0092b047);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_slot1_header_off(), 0xf6c);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_marker_off(), 0xd);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_key_off(), 0x10);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_value_off(), 0x14);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_key_shift8_va() >>> 0, 0x0092ad0a);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_store_inc_va() >>> 0, 0x0092ad36);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_store_set1_va() >>> 0, 0x0092ad48);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_type_base(), 0x10f);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_range(), 0x85);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_bt_va() >>> 0, 0x0092ae10);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_bt_entries(), 0x86);
  assert.equal(wasm.isaac_pgd_bestiary_addkill_jt_va() >>> 0, 0x0092ae00);
  /* slot-1 write side cross-checks the v17 kill getter's slot base and
     the v3 clear-order law's slot-1 erase. */
  assert.equal(PGD_ADDKILL_SLOT1_HEADER_OFF, PGD_KILL_SLOT1_HEADER_OFF);
  assert.equal(PGD_ADDKILL_SLOT1_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[1]);
  assert.equal(PGD_ADDKILL_SLOT1_HEADER_OFF, PGDCLR_EXPECTED_MAP_ROWS[3].base);
  /* the kill-count getter the write side calls is the v17 PGDKILL. */
  assert.equal(PGD_ADDKILL_KILL_GETTER_VA, PGD_KILL_VA);
});

test("PE truth: v18 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92acb0);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const recFound = pick(rng, 0x100000000);
    const gateByte = pick(rng, 0x100000000);
    const refOk = refAddKillOk(readonlyByte, recFound, gateByte);
    assert.equal(
      pgdBestiaryAddKillOk(readonlyByte, recFound, gateByte), refOk,
      `ok(0x${readonlyByte.toString(16)},0x${recFound.toString(16)},0x${gateByte.toString(16)})`,
    );
    const w0 = pick(rng, 0x100000000);
    const w1 = pick(rng, 0x100000000);
    assert.equal(pgdBestiaryAddKillKey(w0, w1), refAddKillKey(w0, w1),
      `key(0x${w0.toString(16)},0x${w1.toString(16)})`);
    const markerD = pick(rng, 0x100000000);
    const key = pick(rng, 0x100000000);
    const nodeKey = pick(rng, 0x100000000);
    const isHeader = pick(rng, 2);
    assert.equal(
      pgdBestiaryAddKillNodeOk(markerD, key, nodeKey, isHeader),
      refAddKillNodeOk(markerD, key, nodeKey, isHeader),
      `nodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`,
    );
    const nodeOk = pick(rng, 0x100000000);
    const oldValue = pick(rng, 0x100000000);
    assert.equal(
      pgdBestiaryAddKillStoreValue(nodeOk, oldValue),
      refAddKillStoreValue(nodeOk, oldValue),
      `storeValue(0x${nodeOk.toString(16)},0x${oldValue.toString(16)})`,
    );
    const type = pick(rng, 0x100000000);
    assert.equal(
      pgdBestiaryAddKillDispatchCase(type), refAddKillDispatchCase(type),
      `dispatch(0x${type.toString(16)})`,
    );
    const c = pick(rng, 6) - 1;
    const count = pick(rng, 0x100000000);
    assert.equal(
      pgdBestiaryAddKillUnlockNeeded(c, count), refAddKillUnlockNeeded(c, count),
      `unlockNeeded(${c},0x${count.toString(16)})`,
    );
    assert.equal(pgdBestiaryAddKillUnlockId(c), refAddKillUnlockId(c),
      `unlockId(${c})`);
    const n1 = pick(rng, 0x100000000);
    const n2 = pick(rng, 0x100000000);
    assert.equal(pgdBestiaryAddKillCase0Sum(n1, n2), refAddKillCase0Sum(n1, n2),
      `case0Sum(0x${n1.toString(16)},0x${n2.toString(16)})`);
  }
});

test("PE truth: v18 mutant — the write-side laws must stay machine-exact", () => {
  /* MA1: gate C widened to a FULL-DWORD test would let gate_byte 0x100
     (low byte 0) pass; the machine `cmp byte [ebx+0xe8],0` sees the LOW
     BYTE only. */
  assert.equal(pgdBestiaryAddKillOk(0, 1, 0x100), 0);
  assert.notEqual(pgdBestiaryAddKillOk(0, 1, 0x100), 1);
  assert.equal(pgdBestiaryAddKillOk(0, 1, 0x1ff), 1);
  assert.equal(pgdBestiaryAddKillOk(0x100, 1, 0xff), 1);
  assert.equal(pgdBestiaryAddKillOk(0x1ff, 1, 0xff), 0);
  /* MA2: store_value on NOT-found storing old+1 (or 0) loses the INSERT
     decision; the machine `mov dword [eax],1` writes 1. */
  assert.equal(pgdBestiaryAddKillStoreValue(0, 0xffffffff), 1);
  assert.notEqual(pgdBestiaryAddKillStoreValue(0, 0xffffffff), 0);
  assert.notEqual(pgdBestiaryAddKillStoreValue(0, 5), 6);
  assert.equal(pgdBestiaryAddKillStoreValue(1, 5), 6);
  /* MA3: dispatch range gate as SIGNED (jg) would route type 0x80000000
     (idx wraps to 0x7ffefef1, UNSIGNED > 0x85) to the table; the
     machine uses ja (UNSIGNED) -> case 3. */
  assert.equal(pgdBestiaryAddKillDispatchCase(0x80000000), 3);
  assert.equal(pgdBestiaryAddKillDispatchCase(0xffffffff), 3);
  assert.equal(pgdBestiaryAddKillDispatchCase(0x10f + 0x86), 3);
  assert.equal(pgdBestiaryAddKillDispatchCase(0x10f + 0x85), 2);
  assert.equal(pgdBestiaryAddKillDispatchCase(0x10f), 0);
  assert.equal(pgdBestiaryAddKillDispatchCase(0x110), 0);
  assert.equal(pgdBestiaryAddKillDispatchCase(0x132), 1);
  /* MA4: unlock_needed case0 gate `> 0xa` instead of `>= 0xa` would
     skip exactly 0xa; `cmp esi,0xa ; jb skip` unlocks at 0xa. */
  assert.equal(pgdBestiaryAddKillUnlockNeeded(0, 0xa), 1);
  assert.notEqual(pgdBestiaryAddKillUnlockNeeded(0, 0xa), 0);
  assert.equal(pgdBestiaryAddKillUnlockNeeded(0, 0x9), 0);
  assert.equal(pgdBestiaryAddKillUnlockNeeded(0, 0xb), 1);
  assert.equal(pgdBestiaryAddKillUnlockNeeded(1, 0x14), 1);
  assert.equal(pgdBestiaryAddKillUnlockNeeded(2, 0x14), 1);
  assert.equal(pgdBestiaryAddKillUnlockNeeded(3, 0xffffffff), 0);
  /* MA5: key missing the final <<8 would give 0x123456 instead of
     0x12345600 for (0x123, 0x456). */
  assert.equal(pgdBestiaryAddKillKey(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryAddKillKey(0x123, 0x456), 0x123456);
  /* MA6: unlock ids swapped would unlock the wrong achievement;
     push sites @0x92ad86 (0x15d), @0x92ada2 (0x164), @0x92adde
     (0x175). */
  assert.equal(pgdBestiaryAddKillUnlockId(0), 0x175);
  assert.equal(pgdBestiaryAddKillUnlockId(1), 0x15d);
  assert.equal(pgdBestiaryAddKillUnlockId(2), 0x164);
  assert.equal(pgdBestiaryAddKillUnlockId(3), 0);
});

/* =====================================================================
   ABI v19 — PGDADDSIB2 + PGDADDSIB3 (slot-2/slot-3 sibling
   AddBestiary* mutators 0x92aaf0+0x92abd0, helpers 0x92ab40+0x92ac20)
   Evidence: section-notes/pgd-v19/ (cpu-dump 0x92aaf0..0x92ab3f,
   0x92ab40..0x92abc7, 0x92abd0..0x92ac1f, 0x92ac20..0x92aca7; zero
   ZHL matches on all four VAs; the v18 handoff's "four
   AddBestiaryKill-shaped bodies with own unlock dispatches" guess is
   WRONG — the machine is TWO wrapper/helper pairs with NO unlock
   dispatch: 0x92aaf0 -> 0x92ab40 (slot-2 header 0xf74) and 0x92abd0
   -> 0x92ac20 (slot-3 header 0xf7c); wrappers ret 8 with one image
   caller each (0x774461 / 0x7780c8), helpers ret 4 with their
   wrapper as only caller (0x92ab2e / 0x92ac0e)).
   ===================================================================== */

/* Branch-by-branch references, transcribed from the instruction stream
   (NOT derived from the model or the C++). */

function refSib2Ok(readonlyByte, recFound, gateByte, readonlyByteHelper) {
  /* wrapper 0x92aaf6/0x92aafa `cmp byte [esi+1],0 ; jne fail`. */
  if ((readonlyByte >>> 0 & 0xff) !== 0) return 0;
  /* 0x92ab13/0x92ab15 `test eax,eax ; je fail`. */
  if ((recFound >>> 0) === 0) return 0;
  /* 0x92ab17/0x92ab1e `cmp byte [eax+0xe8],0 ; je fail`. */
  if ((gateByte >>> 0 & 0xff) === 0) return 0;
  /* helper's own gate 0x92ab49/0x92ab4f `cmp byte [ecx+1],0 ; je
     continue` — the same pgd+1 byte re-checked; fail path ret 4
     @0x92ab58. The wrapper returns the helper's al. */
  if ((readonlyByteHelper >>> 0 & 0xff) !== 0) return 0;
  return 1;
}

function refSibHelperOk(readonlyByteHelper) {
  /* helper 0x92ab49/0x92ab4f; fail path `xor al,al ; ret 4`
     @0x92ab58; BOTH store paths `mov al,1` @0x92ab9e/@0x92abc0. */
  if ((readonlyByteHelper >>> 0 & 0xff) !== 0) return 0;
  return 1;
}

function refSibKey(w0, w1) {
  /* wrapper 0x92ab20..0x92ab28 `mov ecx,[eax] ; shl ecx,0xc ; or
     ecx,[eax+4] ; shl ecx,8`. */
  let key = (w0 >>> 0) << 12;
  key |= w1 >>> 0;
  return (key << 8) >>> 0;
}

function refSibNodeOk(markerD, key, nodeKey, nodeIsHeader) {
  /* helper node gates 0x92ab7d/0x92ab81 (marker LOW BYTE),
     0x92ab83/0x92ab86 (SIGNED key >= node_key), 0x92ab88/0x92ab8a
     (node != header). */
  if ((markerD >>> 0 & 0xff) !== 0) return 0;
  if ((key | 0) < (nodeKey | 0)) return 0;
  if ((nodeIsHeader >>> 0) !== 0) return 0;
  return 1;
}

function refSibStoreValue(nodeOk, oldValue) {
  /* found `inc dword [eax]` @0x92ab9c; not-found `mov dword
     [eax],1` @0x92abba — INSERT (write-side inversion, no unlock
     dispatch in this set). */
  if ((nodeOk >>> 0) !== 0) return ((oldValue >>> 0) + 1) >>> 0;
  return 1;
}

test("header records the v19 PGDADDSIB evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADDSIB2/);
  assert.match(h, /PGDADDSIB3/);
  assert.match(h, /0x0092aaf0/);
  assert.match(h, /0x0092ab40/);
  assert.match(h, /0x0092abd0/);
  assert.match(h, /0x0092ac20/);
  assert.match(h, /0xf74/);
  assert.match(h, /0xf7c/);
  assert.match(h, /0x00774461/);
  assert.match(h, /0x007780c8/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDADDSIB2/);
  assert.match(s, /PGDADDSIB3/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_ADDSIB2_VA, 0x0092aaf0);
  assert.equal(PGD_ADDSIB3_VA, 0x0092abd0);
  /* v19 advanced the probe's next-island record past the landed
     sibling pair set to the AddChallenge dispatcher 0x92a7b0; v20
     landed that dispatcher (PGDADDCH); v21 landed AddBoss 0x92a5e0
     (PGDADDBOSS); v22 landed AddMiniBoss 0x92a520 (PGDADDMINI) and
     advanced to 0x92b230 (SEC10); v23 landed PGDADSED 0x92b230 +
     PGDK41 0x92b270 (completing the PGDX/PGDK cluster) and
     advanced to the shared snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADDSIB VA records + callers + wasm surface", () => {
  /* slot-2 pair: wrapper + helper + one image caller. */
  assert.equal(PGD_ADDSIB2_VA, 0x0092aaf0);
  assert.equal(PGD_ADDSIB2_RET_OK_VA, 0x0092ab35);
  assert.equal(PGD_ADDSIB2_RET_FAIL_VA, 0x0092ab3c);
  assert.equal(PGD_ADDSIB2_CALL_SITES, 1);
  assert.deepEqual(PGD_ADDSIB2_CALL_SITE_VAS, [0x00774461]);
  assert.equal(PGD_ADDSIB2_HELPER_VA, 0x0092ab40);
  assert.equal(PGD_ADDSIB2_HELPER_RET_OK_VA, 0x0092aba5);
  assert.equal(PGD_ADDSIB2_HELPER_RET_INSERT_VA, 0x0092abc5);
  assert.equal(PGD_ADDSIB2_HELPER_RET_READONLY_FAIL_VA, 0x0092ab58);
  /* slot-3 pair. */
  assert.equal(PGD_ADDSIB3_VA, 0x0092abd0);
  assert.equal(PGD_ADDSIB3_RET_OK_VA, 0x0092ac15);
  assert.equal(PGD_ADDSIB3_RET_FAIL_VA, 0x0092ac1c);
  assert.equal(PGD_ADDSIB3_CALL_SITES, 1);
  assert.deepEqual(PGD_ADDSIB3_CALL_SITE_VAS, [0x007780c8]);
  assert.equal(PGD_ADDSIB3_HELPER_VA, 0x0092ac20);
  assert.equal(PGD_ADDSIB3_HELPER_RET_OK_VA, 0x0092ac85);
  assert.equal(PGD_ADDSIB3_HELPER_RET_INSERT_VA, 0x0092aca5);
  assert.equal(PGD_ADDSIB3_HELPER_RET_READONLY_FAIL_VA, 0x0092ac38);
  /* slot bases cross-check the family root table and the v3 clear
     order: slot 2 = 0xf74, slot 3 = 0xf7c. */
  assert.equal(PGD_ADDSIB2_SLOT2_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[2]);
  assert.equal(PGD_ADDSIB3_SLOT3_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[3]);
  assert.notEqual(PGD_ADDSIB2_SLOT2_HEADER_OFF, PGD_ADDSIB3_SLOT3_HEADER_OFF);
  assert.equal(PGD_ADDSIB2_SLOT2_HEADER_OFF, 0xf74);
  assert.equal(PGD_ADDSIB3_SLOT3_HEADER_OFF, 0xf7c);
  assert.equal(PGD_ADDSIB2_GAME_VA, PGD_ADDKILL_GAME_VA);
  assert.equal(PGD_ADDSIB2_CONTAINER_OFF, PGD_ADDKILL_CONTAINER_OFF);
  assert.equal(PGD_ADDSIB2_CONTAINER_FIND_VA, PGD_ADDKILL_CONTAINER_FIND_VA);
  assert.equal(PGD_ADDSIB2_MAP_FIND_VA, PGD_ADDKILL_MAP_FIND_VA);
  assert.equal(PGD_ADDSIB2_VALUE_ACCESSOR_VA, PGD_ADDKILL_VALUE_ACCESSOR_VA);
  /* model-oracle pairs read the same records. */
  const pairs = [
    [pgdBestiaryAddSib2Va, PGD_ADDSIB2_VA, "sib2Va"],
    [pgdBestiaryAddSib2HelperVa, PGD_ADDSIB2_HELPER_VA, "sib2Helper"],
    [pgdBestiaryAddSib2HelperRetInsertVa, PGD_ADDSIB2_HELPER_RET_INSERT_VA, "sib2HelperInsert"],
    [pgdBestiaryAddSib2Slot2HeaderOff, PGD_ADDSIB2_SLOT2_HEADER_OFF, "sib2Slot2"],
    [pgdBestiaryAddSib2StoreIncVa, PGD_ADDSIB2_STORE_INC_VA, "sib2StoreInc"],
    [pgdBestiaryAddSib2StoreSet1Va, PGD_ADDSIB2_STORE_SET1_VA, "sib2StoreSet1"],
    [pgdBestiaryAddSib3Va, PGD_ADDSIB3_VA, "sib3Va"],
    [pgdBestiaryAddSib3HelperVa, PGD_ADDSIB3_HELPER_VA, "sib3Helper"],
    [pgdBestiaryAddSib3HelperRetInsertVa, PGD_ADDSIB3_HELPER_RET_INSERT_VA, "sib3HelperInsert"],
    [pgdBestiaryAddSib3Slot3HeaderOff, PGD_ADDSIB3_SLOT3_HEADER_OFF, "sib3Slot3"],
    [pgdBestiaryAddSib3StoreIncVa, PGD_ADDSIB3_STORE_INC_VA, "sib3StoreInc"],
    [pgdBestiaryAddSib3StoreSet1Va, PGD_ADDSIB3_STORE_SET1_VA, "sib3StoreSet1"],
  ];
  for (const [fn, want, label] of pairs) {
    assert.equal(fn(), want, label);
  }
  /* wasm surface (spot: every sibling export exists and reads the
     record; byte-gate laws driven with WIDE values). */
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_va() >>> 0, 0x0092aaf0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_helper_va() >>> 0, 0x0092ab40);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_slot2_header_off(), 0xf74);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_call_site_count(), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_call_site_va(0) >>> 0, 0x00774461);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_va() >>> 0, 0x0092abd0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_helper_va() >>> 0, 0x0092ac20);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_slot3_header_off(), 0xf7c);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_call_site_count(), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_call_site_va(0) >>> 0, 0x007780c8);
  /* wide byte-gate drives: the low-byte laws must react only to the
     LOW byte of each gate input (0x2/0xff vs 0x100/0xffffffff). */
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0x100, 1, 0xff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0x1ff, 1, 0xff, 0), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0, 1, 0x100, 0), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0, 1, 0x1ff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0, 1, 0xff, 0x2), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_ok(0, 1, 0xff, 0x100), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_ok(0x100, 1, 0xff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_ok(0, 1, 0x100, 0), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_ok(0, 1, 0x1ff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_ok(0, 1, 0xff, 0x2), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_ok(0, 1, 0xff, 0x100), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_store_value(0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_store_value(1, 0xffffffff) >>> 0, 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_store_value(0, 5), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_store_value(1, 5), 6);
  /* node gates: SIGNED key compare (jl) and LOW-BYTE marker must hold
     in the wasm build too. */
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_node_ok(0, 0xffffffff, 0, 0), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_node_ok(0, 0xffffffff, 0xffffffff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_node_ok(0x100, 0x10, 0x10, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_node_ok(0, 0x10, 0x10, 1), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_node_ok(0, 0xffffffff, 0, 0), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_node_ok(0, 0xffffffff, 0xffffffff, 0), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_node_ok(0x1ff, 0x10, 0x10, 0), 0);
  /* helper bool + key in the wasm build. */
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_helper_ok(0xff), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_helper_ok(0x100), 1);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_helper_ok(0xff), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_helper_ok(0x1ff), 0);
  assert.equal(wasm.isaac_pgd_bestiary_addsib2_key(0x123, 0x456) >>> 0, 0x12345600);
  assert.equal(wasm.isaac_pgd_bestiary_addsib3_key(0x123, 0x456) >>> 0, 0x12345600);
});

test("PE truth: v19 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92aaf0);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const recFound = pick(rng, 0x100000000);
    const gateByte = pick(rng, 0x100000000);
    const readonlyByteHelper = pick(rng, 0x100000000);
    const refOk = refSib2Ok(readonlyByte, recFound, gateByte, readonlyByteHelper);
    assert.equal(
      pgdBestiaryAddSib2Ok(readonlyByte, recFound, gateByte, readonlyByteHelper),
      refOk,
      `sib2ok(0x${readonlyByte.toString(16)},0x${recFound.toString(16)},0x${gateByte.toString(16)},0x${readonlyByteHelper.toString(16)})`,
    );
    assert.equal(
      pgdBestiaryAddSib3Ok(readonlyByte, recFound, gateByte, readonlyByteHelper),
      refOk,
      `sib3ok(0x${readonlyByte.toString(16)},0x${recFound.toString(16)},0x${gateByte.toString(16)},0x${readonlyByteHelper.toString(16)})`,
    );
    assert.equal(
      pgdBestiaryAddSib2HelperOk(readonlyByteHelper), refSibHelperOk(readonlyByteHelper),
      `sib2helperOk(0x${readonlyByteHelper.toString(16)})`,
    );
    assert.equal(
      pgdBestiaryAddSib3HelperOk(readonlyByteHelper), refSibHelperOk(readonlyByteHelper),
      `sib3helperOk(0x${readonlyByteHelper.toString(16)})`,
    );
    const w0 = pick(rng, 0x100000000);
    const w1 = pick(rng, 0x100000000);
    const refKey = refSibKey(w0, w1);
    assert.equal(pgdBestiaryAddSib2Key(w0, w1), refKey,
      `sib2key(0x${w0.toString(16)},0x${w1.toString(16)})`);
    assert.equal(pgdBestiaryAddSib3Key(w0, w1), refKey,
      `sib3key(0x${w0.toString(16)},0x${w1.toString(16)})`);
    const markerD = pick(rng, 0x100000000);
    const key = pick(rng, 0x100000000);
    const nodeKey = pick(rng, 0x100000000);
    const isHeader = pick(rng, 2);
    const refNode = refSibNodeOk(markerD, key, nodeKey, isHeader);
    assert.equal(
      pgdBestiaryAddSib2NodeOk(markerD, key, nodeKey, isHeader), refNode,
      `sib2nodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`,
    );
    assert.equal(
      pgdBestiaryAddSib3NodeOk(markerD, key, nodeKey, isHeader), refNode,
      `sib3nodeOk(0x${markerD.toString(16)},0x${key.toString(16)},0x${nodeKey.toString(16)},${isHeader})`,
    );
    const nodeOk = pick(rng, 0x100000000);
    const oldValue = pick(rng, 0x100000000);
    const refStore = refSibStoreValue(nodeOk, oldValue);
    assert.equal(
      pgdBestiaryAddSib2StoreValue(nodeOk, oldValue), refStore,
      `sib2store(0x${nodeOk.toString(16)},0x${oldValue.toString(16)})`,
    );
    assert.equal(
      pgdBestiaryAddSib3StoreValue(nodeOk, oldValue), refStore,
      `sib3store(0x${nodeOk.toString(16)},0x${oldValue.toString(16)})`,
    );
  }
});

test("PE truth: v19 mutant — the sibling mutator laws must stay machine-exact", () => {
  /* MB1: a FULL-DWORD test for gate A would FAIL readonly_byte 0x100
     (full word nonzero); the machine `cmp byte [esi+1],0` sees the
     LOW BYTE only, so 0x100/0x10000 (low byte 0) must PASS and
     0x2/0x1ff (low byte nonzero) must FAIL. */
  assert.equal(pgdBestiaryAddSib2Ok(0x100, 1, 0xff, 0), 1);
  assert.notEqual(pgdBestiaryAddSib2Ok(0x100, 1, 0xff, 0), 0);
  assert.equal(pgdBestiaryAddSib2Ok(0x10000, 1, 0xff, 0), 1);
  assert.equal(pgdBestiaryAddSib2Ok(0x2, 1, 0xff, 0), 0);
  assert.equal(pgdBestiaryAddSib2Ok(0x1ff, 1, 0xff, 0), 0);
  assert.equal(pgdBestiaryAddSib3Ok(0x100, 1, 0xff, 0), 1);
  assert.equal(pgdBestiaryAddSib3Ok(0x1ff, 1, 0xff, 0), 0);
  /* MB2: ok gate C widened to a FULL-DWORD test would let gate_byte
     0x100 (low byte 0) pass; `cmp byte [eax+0xe8],0` sees LOW BYTE. */
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0x100, 0), 0);
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0x1ff, 0), 1);
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0xffffff00, 0), 0);
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0xffffffff, 0), 1);
  assert.equal(pgdBestiaryAddSib3Ok(0, 1, 0x100, 0), 0);
  assert.equal(pgdBestiaryAddSib3Ok(0, 1, 0xffffff00, 0), 0);
  /* MB3: store_value on NOT-found storing old+1 (or 0) loses the
     INSERT decision; `mov dword [eax],1` writes 1. */
  assert.equal(pgdBestiaryAddSib2StoreValue(0, 0xffffffff), 1);
  assert.notEqual(pgdBestiaryAddSib2StoreValue(0, 0xffffffff), 0);
  assert.notEqual(pgdBestiaryAddSib2StoreValue(0, 5), 6);
  assert.equal(pgdBestiaryAddSib3StoreValue(0, 5), 1);
  /* MB4: node_ok key compare as UNSIGNED would pass 0xffffffff vs 0
     (4294967295 >= 0); the machine uses jl -> SIGNED fails. */
  assert.equal(pgdBestiaryAddSib2NodeOk(0, 0xffffffff, 0, 0), 0);
  assert.notEqual(pgdBestiaryAddSib2NodeOk(0, 0xffffffff, 0, 0), 1);
  assert.equal(pgdBestiaryAddSib2NodeOk(0, 0xffffffff, 0xffffffff, 0), 1);
  assert.equal(pgdBestiaryAddSib2NodeOk(0, 0x80000000, 0x7fffffff, 0), 0);
  assert.equal(pgdBestiaryAddSib3NodeOk(0, 0xffffffff, 0, 0), 0);
  /* MB5: dropping the helper's readonly gate would make
     readonly_byte_helper 0xff return 1; the helper fail path
     `xor al,al ; ret 4` @0x92ab58 returns 0. */
  assert.equal(pgdBestiaryAddSib2HelperOk(0xff), 0);
  assert.equal(pgdBestiaryAddSib2HelperOk(0x100), 1);
  assert.equal(pgdBestiaryAddSib3HelperOk(0xff), 0);
  assert.equal(pgdBestiaryAddSib3HelperOk(0x1ff), 0);
  /* MB6: key missing the final <<8 would give 0x123456 instead of
     0x12345600 for (0x123, 0x456). */
  assert.equal(pgdBestiaryAddSib2Key(0x123, 0x456), 0x12345600);
  assert.notEqual(pgdBestiaryAddSib2Key(0x123, 0x456), 0x123456);
  assert.equal(pgdBestiaryAddSib3Key(0x123, 0x456), 0x12345600);
  /* MB7: slot-3 header base mistyped as the slot-2 0xf74 would break
     the slot-3 root cross-check and the lea evidence
     `lea esi,[ecx+0xf7c]` @0x92ac43. */
  assert.equal(pgdBestiaryAddSib3Slot3HeaderOff(), 0xf7c);
  assert.notEqual(pgdBestiaryAddSib3Slot3HeaderOff(), 0xf74);
  assert.equal(PGD_ADDSIB3_SLOT3_HEADER_OFF, PGD_BESTIARY_OFF_ROOT[3]);
  assert.equal(pgdBestiaryAddSib2Slot2HeaderOff(), 0xf74);
  /* MB8: ok with only the three wrapper gates (dropping the helper's
     re-checked readonly gate) would return 1 for
     readonly_byte_helper 0xff; the 4-gate law must fail it. */
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0xff, 0xff), 0);
  assert.equal(pgdBestiaryAddSib3Ok(0, 1, 0xff, 0xff), 0);
  assert.equal(pgdBestiaryAddSib2Ok(0, 1, 0xff, 0xffffffff), 0);
  /* marker gate stays LOW-BYTE (0x100 low byte 0 -> ok). */
  assert.equal(pgdBestiaryAddSib2NodeOk(0x100, 0x10, 0x10, 0), 1);
  assert.equal(pgdBestiaryAddSib2NodeOk(0x1ff, 0x10, 0x10, 0), 0);
});

/* =====================================================================
   ABI v20 — PGDADDCH (PersistentGameData::AddChallenge dispatcher
   0x0092a7b0, EXACT ZHL `__thiscall void AddChallenge(int
   challengeID)`, 9 pattern bytes; ret 4 @0x92aa2c; ALIVE caller
   0x704f84 byte-scan verified)
   Evidence: section-notes/pgd-v20/ (cpu-dump 0x92a7b0..0x92aa3f;
   readonly LOW BYTE gate cmp byte [ecx+1],0 ; jne fail; arg gate
   cmp eax,0x2d ; ja fail UNSIGNED; flag store mov byte
   [eax+ecx+0xe6f],1 — BEFORE the dispatch gate, so arg 0 STOREs the
   flag byte but never unlocks; dec eax ; cmp eax,0x2c ; ja fail;
   jmp dword [eax*4+0x92aa30] into a 45-entry table of
   mov [ebp+8],<id> ; pop ebp ; jmp 0x929a20 arms, unlock ids
   0x59..0x21a by arg 1..45; TryUnlock 0x929a20 stays HOST).
   ===================================================================== */

/* Branch-by-branch references, transcribed from the instruction stream
   (NOT derived from the model or the C++). */

function refAddchFlagStoreGate(readonlyByte, arg) {
  /* 0x92a7b3/0x92a7ba `cmp byte [ecx+1],0 ; jne fail` — LOW BYTE. */
  if ((readonlyByte >>> 0 & 0xff) !== 0) return 0;
  /* 0x92a7c0/0x92a7c3 `cmp eax,0x2d ; ja fail` — UNSIGNED. */
  if ((arg >>> 0) > 0x2d) return 0;
  /* 0x92a7c9 `mov byte [eax+ecx+0xe6f],1` runs here, BEFORE the
     dispatch gate. */
  return 1;
}

function refAddchDispatchGate(readonlyByte, arg) {
  if ((readonlyByte >>> 0 & 0xff) !== 0) return 0;
  if ((arg >>> 0) > 0x2d) return 0;
  /* 0x92a7d1 `dec eax` (mod 2^32); 0x92a7d2/0x92a7d5 `cmp eax,0x2c ;
     ja fail` UNSIGNED. arg 0 -> 0xffffffff > 0x2c -> fail. */
  const dec = (arg >>> 0) - 1;
  if ((dec >>> 0) > 0x2c) return 0;
  return 1;
}

function refAddchFlagByteOff(arg) {
  /* 0x92a7c9 store address = ecx + 0xe6f + arg (mod 2^32). */
  return ((0xe6f + (arg >>> 0)) >>> 0);
}

function refAddchUnlockIdForArg(arg) {
  if ((arg >>> 0) > 0x2d) return 0;
  const index = (arg >>> 0) - 1;
  if ((index >>> 0) > 0x2c) return 0;
  /* table[arg-1] @0x92aa30; ids transcribed from the arm immediates. */
  return PGD_ADDCH_UNLOCK_IDS[index >>> 0];
}

test("header records the v20 PGDADDCH evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADDCH/);
  assert.match(h, /AddChallenge/);
  assert.match(h, /0x0092a7b0/);
  assert.match(h, /0x92aa30/);
  assert.match(h, /0x704f84/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDADDCH/);
  assert.match(s, /ABI v35. Chronology:/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGD_ADDCH_VA, 0x0092a7b0);
  /* header flag-array cross-check: +0xe6f is the challenges byte map
     (0x2e = 46 values, args 0..0x2d = 0x2e values). */
  assert.equal(PGD_ADDCH_FLAG_OFF, PGD_OFF_CHALLENGES);
  assert.equal(PGD_ADDCH_MAX_ARG + 1, PGD_COUNT_CHALLENGES);
  /* v20 advanced the probe's next-island record past the landed
     AddChallenge dispatcher; v21 lands AddBoss 0x92a5e0
     (PGDADDBOSS); v22 lands AddMiniBoss 0x92a520 (PGDADDMINI) and
     advances it on to 0x92b230 (SEC10); v23 lands PGDADSED 0x92b230
     + PGDK41 0x92b270 (completing the PGDX/PGDK cluster) and
     advances to the shared snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADDCH VA records + callers + wasm surface", () => {
  assert.equal(PGD_ADDCH_VA, 0x0092a7b0);
  assert.equal(PGD_ADDCH_RET_FAIL_VA, 0x0092aa2c);
  assert.equal(PGD_ADDCH_RET_FAIL_TAIL_VA, 0x0092aa2b);
  assert.equal(PGD_ADDCH_CALL_SITES, 1);
  assert.deepEqual(PGD_ADDCH_CALL_SITE_VAS, [0x00704f84]);
  assert.equal(PGD_ADDCH_READONLY_CMP_VA, 0x0092a7b3);
  assert.equal(PGD_ADDCH_READONLY_JNE_VA, 0x0092a7ba);
  assert.equal(PGD_ADDCH_ARG_GATE1_CMP_VA, 0x0092a7c0);
  assert.equal(PGD_ADDCH_ARG_GATE1_JA_VA, 0x0092a7c3);
  assert.equal(PGD_ADDCH_FLAG_STORE_VA, 0x0092a7c9);
  assert.equal(PGD_ADDCH_FLAG_OFF, 0xe6f);
  assert.equal(PGD_ADDCH_DEC_VA, 0x0092a7d1);
  assert.equal(PGD_ADDCH_ARG_GATE2_CMP_VA, 0x0092a7d2);
  assert.equal(PGD_ADDCH_ARG_GATE2_JA_VA, 0x0092a7d5);
  assert.equal(PGD_ADDCH_JUMP_VA, 0x0092a7db);
  assert.equal(PGD_ADDCH_TABLE_VA, 0x0092aa30);
  assert.equal(PGD_ADDCH_TABLE_ENTRIES, 0x2d);
  assert.equal(PGD_ADDCH_MAX_ARG, 0x2d);
  assert.equal(PGD_ADDCH_MAX_INDEX, 0x2c);
  /* The tail-call target stays HOST (TryUnlock 0x929a20). */
  assert.equal(PGD_ADDCH_TAIL_TARGET_VA, 0x00929a20);
  assert.equal(PGD_ADDCH_FIRST_ARM_VA, 0x0092a7e2);
  assert.equal(PGD_ADDCH_LAST_ARM_VA, 0x0092aa1e);
  /* arms are 13 bytes apart (mov dword [ebp+8],imm32 ; pop ebp ;
     jmp rel32). */
  assert.equal(
    PGD_ADDCH_LAST_ARM_VA - PGD_ADDCH_FIRST_ARM_VA,
    13 * (PGD_ADDCH_TABLE_ENTRIES - 1),
  );
  /* table arms: stride 13, matching the dwords read from the image. */
  for (let i = 0; i < PGD_ADDCH_TABLE_ENTRIES; ++i) {
    assert.equal(
      PGD_ADDCH_TABLE_ARMS[i],
      PGD_ADDCH_FIRST_ARM_VA + 13 * i,
      `arm ${i}`,
    );
  }
  /* model-oracle pairs read the same records. */
  const pairs = [
    [pgdAddChallengeVa, PGD_ADDCH_VA, "va"],
    [pgdAddChallengeRetFailVa, PGD_ADDCH_RET_FAIL_VA, "retFail"],
    [pgdAddChallengeRetFailTailVa, PGD_ADDCH_RET_FAIL_TAIL_VA, "retFailTail"],
    [pgdAddChallengeCallSiteCount, PGD_ADDCH_CALL_SITES, "callSites"],
    [pgdAddChallengeCallSiteVa, PGD_ADDCH_CALL_SITE_VAS[0], "callSite0"],
    [pgdAddChallengeReadonlyCmpVa, PGD_ADDCH_READONLY_CMP_VA, "roCmp"],
    [pgdAddChallengeReadonlyJneVa, PGD_ADDCH_READONLY_JNE_VA, "roJne"],
    [pgdAddChallengeArgGate1CmpVa, PGD_ADDCH_ARG_GATE1_CMP_VA, "gate1Cmp"],
    [pgdAddChallengeArgGate1JaVa, PGD_ADDCH_ARG_GATE1_JA_VA, "gate1Ja"],
    [pgdAddChallengeFlagStoreVa, PGD_ADDCH_FLAG_STORE_VA, "flagStore"],
    [pgdAddChallengeFlagOff, PGD_ADDCH_FLAG_OFF, "flagOff"],
    [pgdAddChallengeDecVa, PGD_ADDCH_DEC_VA, "dec"],
    [pgdAddChallengeArgGate2CmpVa, PGD_ADDCH_ARG_GATE2_CMP_VA, "gate2Cmp"],
    [pgdAddChallengeArgGate2JaVa, PGD_ADDCH_ARG_GATE2_JA_VA, "gate2Ja"],
    [pgdAddChallengeJumpVa, PGD_ADDCH_JUMP_VA, "jump"],
    [pgdAddChallengeTableVa, PGD_ADDCH_TABLE_VA, "table"],
    [pgdAddChallengeTableEntries, PGD_ADDCH_TABLE_ENTRIES, "tableEntries"],
    [pgdAddChallengeFirstArmVa, PGD_ADDCH_FIRST_ARM_VA, "firstArm"],
    [pgdAddChallengeLastArmVa, PGD_ADDCH_LAST_ARM_VA, "lastArm"],
    [pgdAddChallengeTailTargetVa, PGD_ADDCH_TAIL_TARGET_VA, "tailTarget"],
    [pgdAddChallengeMaxArg, PGD_ADDCH_MAX_ARG, "maxArg"],
    [pgdAddChallengeMaxIndex, PGD_ADDCH_MAX_INDEX, "maxIndex"],
  ];
  for (const [fn, want, label] of pairs) {
    assert.equal(fn(), want, label);
  }
  assert.equal(
    pgdAddChallengeUnlockId(0), PGD_ADDCH_UNLOCK_IDS[0], "unlockId0",
  );
  assert.equal(
    pgdAddChallengeUnlockId(44), PGD_ADDCH_UNLOCK_IDS[44], "unlockId44",
  );
  assert.equal(pgdAddChallengeUnlockId(45), 0, "unlockIdOob");
  assert.equal(pgdAddChallengeUnlockId(-1), 0, "unlockIdNeg");
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_addchallenge_va() >>> 0, 0x0092a7b0);
  assert.equal(wasm.isaac_pgd_addchallenge_ret_fail_va() >>> 0, 0x0092aa2c);
  assert.equal(wasm.isaac_pgd_addchallenge_ret_fail_tail_va() >>> 0, 0x0092aa2b);
  assert.equal(wasm.isaac_pgd_addchallenge_call_site_count(), 1);
  assert.equal(wasm.isaac_pgd_addchallenge_call_site_va(0) >>> 0, 0x00704f84);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_off(), 0xe6f);
  assert.equal(wasm.isaac_pgd_addchallenge_max_arg(), 0x2d);
  assert.equal(wasm.isaac_pgd_addchallenge_max_index(), 0x2c);
  assert.equal(wasm.isaac_pgd_addchallenge_table_entries(), 0x2d);
  assert.equal(wasm.isaac_pgd_addchallenge_table_entry_va(0) >>> 0, 0x0092a7e2);
  assert.equal(wasm.isaac_pgd_addchallenge_table_entry_va(44) >>> 0, 0x0092aa1e);
  assert.equal(wasm.isaac_pgd_addchallenge_table_entry_va(45), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id(6), 0x78);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id(12), 0x3c);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id(44), 0x21a);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id(45), 0);
  /* wide byte-gate drives: readonly gate sees the LOW BYTE only. */
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0x100, 1), 1);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0x1ff, 1), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_dispatch_gate(0x100, 1), 1);
  assert.equal(wasm.isaac_pgd_addchallenge_dispatch_gate(0xffffffff, 1), 0);
  /* arg gates are full-dword UNSIGNED. */
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0, 0x2d), 1);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0, 0x2e), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0, 0x100), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0, 0xffffffff), 0);
  /* the flag byte STORE precedes the dispatch gate: arg 0 stores. */
  assert.equal(wasm.isaac_pgd_addchallenge_flag_store_gate(0, 0), 1);
  assert.equal(wasm.isaac_pgd_addchallenge_dispatch_gate(0, 0), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(0), 0);
  /* flag byte offset law. */
  assert.equal(wasm.isaac_pgd_addchallenge_flag_byte_off(0) >>> 0, 0xe6f);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_byte_off(1) >>> 0, 0xe70);
  assert.equal(wasm.isaac_pgd_addchallenge_flag_byte_off(0xffffffff) >>> 0,
    (0xe6f + 0xffffffff) >>> 0);
  /* unlock ids by arg in the wasm build. */
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(1), 0x59);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(7), 0x78);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(13), 0x3c);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(45), 0x21a);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(0x2e), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(0x100), 0);
  assert.equal(wasm.isaac_pgd_addchallenge_unlock_id_for_arg(0xffffffff), 0);
});

test("PE truth: v20 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92a7b0);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const arg = pick(rng, 0x100000000);
    const refFlag = refAddchFlagStoreGate(readonlyByte, arg);
    assert.equal(
      pgdAddChallengeFlagStoreGate(readonlyByte, arg), refFlag,
      `addchFlag(0x${readonlyByte.toString(16)},0x${arg.toString(16)})`,
    );
    const refDisp = refAddchDispatchGate(readonlyByte, arg);
    assert.equal(
      pgdAddChallengeDispatchGate(readonlyByte, arg), refDisp,
      `addchDisp(0x${readonlyByte.toString(16)},0x${arg.toString(16)})`,
    );
    assert.equal(
      pgdAddChallengeFlagByteOff(arg), refAddchFlagByteOff(arg),
      `addchOff(0x${arg.toString(16)})`,
    );
    assert.equal(
      pgdAddChallengeUnlockIdForArg(arg), refAddchUnlockIdForArg(arg),
      `addchUid(0x${arg.toString(16)})`,
    );
    /* table index -> id over the full 45-entry table plus out-of-range. */
    const idx = pick(rng, PGD_ADDCH_TABLE_ENTRIES + 5) - 3; /* -3..46 */
    const want = (idx >= 0 && idx < PGD_ADDCH_TABLE_ENTRIES)
      ? PGD_ADDCH_UNLOCK_IDS[idx] : 0;
    assert.equal(pgdAddChallengeUnlockId(idx), want, `addchId(${idx})`);
  }
});

test("PE truth: v20 mutant — the AddChallenge laws must stay machine-exact", () => {
  /* MC1: a FULL-DWORD readonly test would FAIL 0x100 (low byte 0);
     `cmp byte [ecx+1],0` sees LOW BYTE only, so 0x100/0x10000 must
     STORE and 0x2/0x1ff must not. */
  assert.equal(pgdAddChallengeFlagStoreGate(0x100, 1), 1);
  assert.notEqual(pgdAddChallengeFlagStoreGate(0x100, 1), 0);
  assert.equal(pgdAddChallengeFlagStoreGate(0x10000, 1), 1);
  assert.equal(pgdAddChallengeFlagStoreGate(0x2, 1), 0);
  assert.equal(pgdAddChallengeFlagStoreGate(0x1ff, 1), 0);
  assert.equal(pgdAddChallengeDispatchGate(0x100, 1), 1);
  assert.equal(pgdAddChallengeDispatchGate(0x1ff, 1), 0);
  /* MC2: arg gate 1 as SIGNED (jg) would PASS 0xffffffff (-1 <= 0x2d)
     and 0x2e; the machine `ja` is UNSIGNED. */
  assert.equal(pgdAddChallengeFlagStoreGate(0, 0xffffffff), 0);
  assert.notEqual(pgdAddChallengeFlagStoreGate(0, 0xffffffff), 1);
  assert.equal(pgdAddChallengeFlagStoreGate(0, 0x2e), 0);
  assert.equal(pgdAddChallengeFlagStoreGate(0, 0x80000000), 0);
  /* MC3: dropping the dispatch gate (dispatch == flag_store) would
     let arg 0 unlock; the machine `dec eax ; cmp eax,0x2c ; ja fail`
     fails 0xffffffff > 0x2c UNSIGNED. */
  assert.equal(pgdAddChallengeDispatchGate(0, 0), 0);
  assert.notEqual(pgdAddChallengeDispatchGate(0, 0), 1);
  assert.equal(pgdAddChallengeUnlockIdForArg(0), 0);
  assert.equal(pgdAddChallengeDispatchGate(0, 0x2d), 1);
  assert.equal(pgdAddChallengeDispatchGate(0, 0x2d - 1), 1);
  /* MC4: unlock table indexed by arg (not arg-1) would give 0x5a for
     arg 1 and mis-map the non-monotonic entries; table[arg-1] with
     the machine immediates. */
  assert.equal(pgdAddChallengeUnlockIdForArg(1), 0x59);
  assert.notEqual(pgdAddChallengeUnlockIdForArg(1), 0x5a);
  assert.equal(pgdAddChallengeUnlockIdForArg(7), 0x78);
  assert.equal(pgdAddChallengeUnlockIdForArg(13), 0x3c);
  assert.equal(pgdAddChallengeUnlockIdForArg(45), 0x21a);
  /* MC5: a mistyped table entry (idx 6 written 0x60 instead of 0x78
     would fail; the machine arm @0x92a830 is 0x78). */
  assert.equal(pgdAddChallengeUnlockId(6), 0x78);
  assert.notEqual(pgdAddChallengeUnlockId(6), 0x60);
  assert.equal(pgdAddChallengeUnlockId(12), 0x3c);
  assert.equal(pgdAddChallengeUnlockId(18), 0x3e);
  assert.equal(pgdAddChallengeUnlockId(19), 0x5f);
  assert.equal(pgdAddChallengeUnlockId(44), 0x21a);
  /* MC6: flag offset mistyped 0xe6f -> 0xe70 would break the header
     cross-check vs ISAAC_PGD_OFF_CHALLENGES and the offset law. */
  assert.equal(pgdAddChallengeFlagOff(), 0xe6f);
  assert.notEqual(pgdAddChallengeFlagOff(), 0xe70);
  assert.equal(PGD_ADDCH_FLAG_OFF, PGD_OFF_CHALLENGES);
  assert.equal(pgdAddChallengeFlagByteOff(1), 0xe70);
  assert.equal(pgdAddChallengeFlagByteOff(0xffffffff),
    (0xe6f + 0xffffffff) >>> 0);
  /* MC7: dispatch readonly gate full-dword would fail 0x100; the
     dec-gate ran on the raw arg so the LOW BYTE is what matters. */
  assert.equal(pgdAddChallengeDispatchGate(0x100, 1), 1);
  assert.equal(pgdAddChallengeDispatchGate(0x10000, 1), 1);
  /* MC8: unlocking arg 0x2e (bound 0x2d -> 0x2e) would index table
     out of range; the machine `cmp eax,0x2d ; ja fail` + `cmp
     eax,0x2c` stops at 0x2d / idx 0x2c. */
  assert.equal(pgdAddChallengeUnlockIdForArg(0x2e), 0);
  assert.equal(pgdAddChallengeFlagStoreGate(0, 0x2e), 0);
  assert.equal(pgdAddChallengeUnlockId(45), 0);
  assert.equal(pgdAddChallengeTableEntryVa(45), 0);
});

/* =====================================================================
   ABI v21 — PGDADDBOSS (PersistentGameData::AddBoss mutator
   0x0092a5e0, EXACT ZHL `__thiscall void AddBoss(int bossID)`, 12
   pattern bytes; ret 4 @0x92a79f; ALIVE callers 0x7fc01f / 0x7ff7a8
   byte-scan verified; int3 pad @0x92a7a2 — the span dump at 0x92a700
   lands mid-instruction of `cmp byte [esi+0xe2d],0`, so the true body
   is 0x92a5e0..0x92a7a1)
   Evidence: section-notes/pgd-v21/ (readonly LOW BYTE gate cmp byte
   [esi+1],0 ; jne fail @0x92a5e6/0x92a5ea; arg gate cmp eax,0x68 ;
   jge fail SIGNED no floor @0x92a5f3/0x92a5f6; flag store mov byte
   [eax+esi+0xe07],1 @0x92a602; dirty store mov byte [esi],1
   @0x92a60c; host log (1, "Boss %d added to SaveState\n", bossID)
   cdecl @0x92a60f -> 0xa112c0; eight sequential ALL-nonzero
   AND-gated TryUnlock calls (0x929a20 stays HOST); tail 0x92a79d pop
   esi ; pop ebp ; ret 4 @0x92a79f) */

/* Branch-by-branch reference, transcribed from the instruction stream
   (NOT from the C++ or the model): the entry gates and each block's
   AND-gate, exactly as the listing spells them. */
const REF_ADDBOSS_UNLOCK_IDS = [0x56, 0x57, 0x58, 0xf, 0x174, 0x19c, 0x19d, 0x19e];
const REF_ADDBOSS_BLOCK_BYTES = [
  [0xe08, 0xe09, 0xe14, 0xe18, 0xe33, 0xe3f],
  [0xe0a, 0xe0b, 0xe15, 0xe23, 0xe36, 0xe34],
  [0xe0c, 0xe0d, 0xe16, 0xe37, 0xe35],
  [0xe26],
  [0xe10, 0xe11, 0xe12, 0xe13, 0xe2d],
  [0xe54, 0xe52, 0xe53, 0xe62],
  [0xe5a, 0xe57, 0xe51, 0xe59],
  [0xe0d, 0xe56, 0xe58],
];
/* 0x92a5e6 cmp byte [esi+1],0 ; jne 0x92a79d  (LOW BYTE)
   0x92a5f3 cmp eax,0x68 ; jge 0x92a79d        (SIGNED, no floor) */
function refAddBossEntry(readonlyByte, arg) {
  if ((readonlyByte & 0xff) !== 0) return 0;
  if ((arg | 0) >= 0x68) return 0;
  return 1;
}
/* cmp byte [esi+off],0 ; je <next> — a ZERO skips; ALL nonzero fire. */
function refAddBossBlockGate(block, bytes6) {
  if (block < 0 || block >= 8) return 0;
  const offs = REF_ADDBOSS_BLOCK_BYTES[block];
  for (let i = 0; i < offs.length; ++i) {
    if ((bytes6[i] & 0xff) === 0) return 0;
  }
  return 1;
}
function refAddBossUnlock(block, bytes6) {
  if (block < 0 || block >= 8) return 0;
  return refAddBossBlockGate(block, bytes6) ? REF_ADDBOSS_UNLOCK_IDS[block] : 0;
}

test("header records the v21 PGDADDBOSS evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADDBOSS/);
  assert.match(h, /AddBoss/);
  assert.match(h, /0x0092a5e0/);
  assert.match(h, /0x92a79f/);
  assert.match(h, /0x92a7a2/);
  assert.match(h, /0x92a617/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDADDBOSS/);
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /kAddBossBlocks/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  /* header flag-array cross-checks: +0xe07 is the bosses byte map
     (0x68 = 104 values, args 0..0x67 = 0x68 values), the dirty byte
     is pgd+0, and the eight blocks match the 8 unlock ids. */
  assert.equal(PGD_ADDBOSS_FLAG_OFF, PGD_OFF_BOSSES);
  assert.equal(PGD_ADDBOSS_MAX_ARG + 1, PGD_COUNT_BOSSES);
  assert.equal(PGD_ADDBOSS_DIRTY_OFF, PGD_OFF_CHANGES_MADE);
  assert.equal(PGD_ADDBOSS_BLOCKS.length, 8);
  assert.deepEqual(
    PGD_ADDBOSS_BLOCKS.map((b) => b.byteOffs.length),
    [6, 6, 5, 1, 5, 4, 4, 3],
  );
  /* e0d is read by BOTH B3 (slot 1) and B8 (slot 0) — the machine
     re-reads it; the laws must too. */
  assert.equal(PGD_ADDBOSS_BLOCKS[2].byteOffs[1], 0xe0d);
  assert.equal(PGD_ADDBOSS_BLOCKS[7].byteOffs[0], 0xe0d);
  /* v22 advances the probe's next-island record past the landed
     AddMiniBoss mutator to 0x92b230 (SEC10, the unchecked +0xf14
     store); v23 lands PGDADSED 0x92b230 + PGDK41 0x92b270
     (completing the PGDX/PGDK cluster) and advances to the shared
     snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADDBOSS VA records + callers + wasm surface", () => {
  assert.equal(PGD_ADDBOSS_VA, 0x0092a5e0);
  assert.equal(PGD_ADDBOSS_RET_FAIL_VA, 0x0092a79f);
  assert.equal(PGD_ADDBOSS_RET_FAIL_TAIL_VA, 0x0092a79d);
  assert.equal(PGD_ADDBOSS_CALL_SITES, 2);
  assert.deepEqual(PGD_ADDBOSS_CALL_SITE_VAS, [0x007fc01f, 0x007ff7a8]);
  assert.equal(PGD_ADDBOSS_FLAG_OFF, 0xe07);
  assert.equal(PGD_ADDBOSS_DIRTY_OFF, 0);
  assert.equal(PGD_ADDBOSS_LOG_STRING_VA, 0x00b7ae90);
  assert.equal(PGD_ADDBOSS_LOG_CALL_VA, 0x0092a60f);
  assert.equal(PGD_ADDBOSS_LOG_CALLEE_VA, 0x00a112c0);
  assert.equal(PGD_ADDBOSS_UNLOCK_CHAIN_VA, 0x0092a617);
  assert.equal(PGD_ADDBOSS_UNLOCK_BLOCKS, 8);
  assert.equal(PGD_ADDBOSS_TAIL_TARGET_VA, 0x00929a20);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_addboss_va() >>> 0, 0x0092a5e0);
  assert.equal(wasm.isaac_pgd_addboss_ret_fail_va() >>> 0, 0x0092a79f);
  assert.equal(wasm.isaac_pgd_addboss_ret_fail_tail_va() >>> 0, 0x0092a79d);
  assert.equal(wasm.isaac_pgd_addboss_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_addboss_call_site_va(0) >>> 0, 0x007fc01f);
  assert.equal(wasm.isaac_pgd_addboss_call_site_va(1) >>> 0, 0x007ff7a8);
  assert.equal(wasm.isaac_pgd_addboss_call_site_va(2), 0);
  assert.equal(wasm.isaac_pgd_addboss_flag_off(), 0xe07);
  assert.equal(wasm.isaac_pgd_addboss_dirty_off(), 0);
  assert.equal(wasm.isaac_pgd_addboss_log_string_va() >>> 0, 0x00b7ae90);
  assert.equal(wasm.isaac_pgd_addboss_log_callee_va() >>> 0, 0x00a112c0);
  assert.equal(wasm.isaac_pgd_addboss_unlock_blocks(), 8);
  assert.equal(wasm.isaac_pgd_addboss_tail_target_va() >>> 0, 0x00929a20);
  assert.equal(wasm.isaac_pgd_addboss_max_arg(), 0x67);
  assert.equal(wasm.isaac_pgd_addboss_max_index(), 0x67);
  /* block evidence getters. */
  assert.equal(wasm.isaac_pgd_addboss_block_first_cmp_va(0) >>> 0, 0x0092a617);
  assert.equal(wasm.isaac_pgd_addboss_block_call_va(7) >>> 0, 0x0092a798);
  assert.equal(wasm.isaac_pgd_addboss_block_push_va(3) >>> 0, 0x0092a6d4);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_count(1), 6);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_count(3), 1);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_off(0, 0) >>> 0, 0xe08);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_off(7, 2) >>> 0, 0xe58);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_off(3, 1), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_off(0, -1), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_byte_off(8, 0), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_unlock_id(0), 0x56);
  assert.equal(wasm.isaac_pgd_addboss_block_unlock_id(4), 0x174);
  assert.equal(wasm.isaac_pgd_addboss_block_unlock_id(8), 0);
  /* wide byte-gate drives: readonly gate sees the LOW BYTE only. */
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0x100, 5), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0x10000, 5), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0x2, 5), 0);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0x1ff, 5), 0);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0xffffffff, 5), 0);
  /* arg gate is a SIGNED ceiling with NO floor: negatives pass. */
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x67), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x68), 0);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x100), 0);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x80000000), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0xffffffff), 1);
  /* flag byte offset law (negatives underflow mod 2^32). */
  assert.equal(wasm.isaac_pgd_addboss_flag_byte_off(0) >>> 0, 0xe07);
  assert.equal(wasm.isaac_pgd_addboss_flag_byte_off(1) >>> 0, 0xe08);
  assert.equal(wasm.isaac_pgd_addboss_flag_byte_off(0xffffffff) >>> 0,
    (0xe07 + 0xffffffff) >>> 0);
  /* block AND-gates: ALL bytes nonzero, wide drives. */
  assert.equal(wasm.isaac_pgd_addboss_block_gate(0, 1, 1, 1, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(0, 0, 1, 1, 1, 1, 1), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(0, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(3, 0x2), 1);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(3, 0), 0);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(7, 0x2, 0xff, 0x101), 1);
  assert.equal(wasm.isaac_pgd_addboss_block_gate(7, 0x2, 0, 0x100), 0);
  /* unlock decision = gate ? id : 0. */
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(0, 1, 1, 1, 1, 1, 1), 0x56);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(0, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(5, 0x2, 0xff, 0x101, 0x7f), 0x19c);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(7, 0x2, 0xff, 0x101), 0x19e);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(7, 0x2, 0, 0x100), 0);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(8, 1, 1, 1, 1, 1, 1), 0);
});

test("PE truth: v21 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92a5e0);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const arg = pick(rng, 0x100000000);
    const six = [
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
    ];
    const block = pick(rng, 10) - 1; /* -1..8: includes out-of-range */
    /* entry gate across C++ wasm, model, and the instruction-stream ref. */
    const expEntry = refAddBossEntry(readonlyByte, arg);
    assert.equal(wasm.isaac_pgd_addboss_entry_gate(readonlyByte, arg), expEntry,
      `entry ${readonlyByte >>> 0} ${arg >>> 0}`);
    assert.equal(pgdAddBossEntryGate(readonlyByte, arg), expEntry,
      `model entry ${readonlyByte >>> 0} ${arg >>> 0}`);
    /* block gate + fires across all three. */
    const expGate = refAddBossBlockGate(Math.max(0, block), six);
    assert.equal(
      wasm.isaac_pgd_addboss_block_gate(block, ...six),
      block >= 0 && block < 8 ? expGate : 0,
      `gate b${block}`,
    );
    assert.equal(
      pgdAddBossBlockGate(block, ...six),
      block >= 0 && block < 8 ? expGate : 0,
      `model gate b${block}`,
    );
    const expId = refAddBossUnlock(block, six);
    assert.equal(wasm.isaac_pgd_addboss_unlock_fires(block, ...six), expId,
      `fires b${block}`);
    assert.equal(pgdAddBossUnlockFires(block, ...six), expId,
      `model fires b${block}`);
    /* flag byte offset law (32-bit wrap) across wasm and model. */
    assert.equal(
      wasm.isaac_pgd_addboss_flag_byte_off(arg) >>> 0,
      (0xe07 + (arg >>> 0)) >>> 0,
      `off ${arg >>> 0}`,
    );
    assert.equal(pgdAddBossFlagByteOff(arg), (0xe07 + (arg >>> 0)) >>> 0);
    /* block evidence getters vs the transcribed table. */
    if (block >= 0 && block < 8) {
      assert.equal(wasm.isaac_pgd_addboss_block_byte_count(block),
        REF_ADDBOSS_BLOCK_BYTES[block].length);
      assert.equal(wasm.isaac_pgd_addboss_block_unlock_id(block),
        REF_ADDBOSS_UNLOCK_IDS[block]);
      for (let s = 0; s < 6; ++s) {
        assert.equal(
          wasm.isaac_pgd_addboss_block_byte_off(block, s) >>> 0,
          s < REF_ADDBOSS_BLOCK_BYTES[block].length
            ? REF_ADDBOSS_BLOCK_BYTES[block][s] : 0,
          `off b${block} s${s}`,
        );
      }
    }
  }
  /* fixed edges the random corpus cannot be trusted to hit. */
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x67), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x68), 0);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0x80000000), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0x100, 0x67), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0xff, 0), 0);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(0, 1, 1, 1, 1, 1, 1), 0x56);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(1, 1, 1, 1, 1, 1, 1), 0x57);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(2, 1, 1, 1, 1, 1), 0x58);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(3, 1), 0xf);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(4, 1, 1, 1, 1, 1), 0x174);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(5, 1, 1, 1, 1), 0x19c);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(6, 1, 1, 1, 1), 0x19d);
  assert.equal(wasm.isaac_pgd_addboss_unlock_fires(7, 1, 1, 1), 0x19e);
});

test("PE truth: v21 mutant — the AddBoss laws must stay machine-exact", () => {
  /* MB1: a FULL-DWORD readonly test would FAIL 0x100 (low byte 0);
     `cmp byte [esi+1],0` sees LOW BYTE only, so 0x100/0x10000 must
     run and 0x2/0x1ff must not. */
  assert.equal(pgdAddBossEntryGate(0x100, 5), 1);
  assert.notEqual(pgdAddBossEntryGate(0x100, 5), 0);
  assert.equal(pgdAddBossEntryGate(0x10000, 5), 1);
  assert.equal(pgdAddBossEntryGate(0x2, 5), 0);
  assert.equal(pgdAddBossEntryGate(0x1ff, 5), 0);
  /* MB2: arg gate as UNSIGNED (cmp eax,0x68 ; ja) would FAIL
     0xffffffff and 0x80000000; the machine `jge` is SIGNED, so
     negatives PASS (and wrap the store offset). */
  assert.equal(pgdAddBossEntryGate(0, 0xffffffff), 1);
  assert.notEqual(pgdAddBossEntryGate(0, 0xffffffff), 0);
  assert.equal(pgdAddBossEntryGate(0, 0x80000000), 1);
  assert.equal(wasm.isaac_pgd_addboss_entry_gate(0, 0xffffffff), 1);
  assert.equal(pgdAddBossEntryGate(0, 0x68), 0);
  assert.equal(pgdAddBossEntryGate(0, 0x100), 0);
  /* the v16 independent law agrees: boss ids have a signed ceiling
     with no floor. */
  assert.equal(wasm.isaac_pgd_boss_index_valid(-1), 1);
  assert.equal(wasm.isaac_pgd_boss_index_valid(-0x80000000), 1);
  /* MB3: a SIGNED-ceiling-with-floor mutant would reject -1; no
     floor exists in the machine. */
  assert.equal(pgdAddBossEntryGate(0, 0xffffffff), 1);
  assert.equal(pgdAddBossEntryGate(0, 0xfffffffe), 1);
  /* MB4: a mistyped block byte-set (e08 duplicated, e3f dropped)
     would fire B1 with e08=0; the machine reads all six including
     the LAST offsets. */
  assert.equal(pgdAddBossBlockGate(0, 0, 1, 1, 1, 1, 1), 0);
  assert.equal(pgdAddBossBlockGate(0, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(pgdAddBossBlockGate(0, 0x101, 0x2, 0xff, 0x1, 0x7f, 0x80), 1);
  assert.equal(pgdAddBossBlockGate(0, 0x100, 0x2, 0xff, 0x1, 0x7f, 0x80), 0);
  assert.equal(pgdAddBossBlockByteOff(0, 0), 0xe08);
  assert.notEqual(pgdAddBossBlockByteOff(0, 0), 0xe09);
  assert.equal(pgdAddBossBlockByteOff(0, 5), 0xe3f);
  /* MB5: a mistyped unlock id (B5 0x174 -> 0x175) would fail; the
     push immediates are 0x56/0x57/0x58/0xf/0x174/0x19c/0x19d/0x19e. */
  assert.equal(pgdAddBossBlockUnlockId(4), 0x174);
  assert.notEqual(pgdAddBossBlockUnlockId(4), 0x175);
  assert.equal(pgdAddBossUnlockFires(5, 0x2, 0xff, 0x101, 0x7f), 0x19c);
  assert.equal(pgdAddBossUnlockFires(6, 0x2, 0xff, 0x101, 0x7f), 0x19d);
  assert.equal(pgdAddBossUnlockFires(7, 0x2, 0xff, 0x101), 0x19e);
  assert.equal(pgdAddBossUnlockFires(0, 1, 1, 1, 1, 1, 1), 0x56);
  assert.notEqual(pgdAddBossUnlockFires(0, 1, 1, 1, 1, 1, 1), 0x57);
  /* MB6: flag offset mistyped 0xe07 -> 0xe06 would break the
     header cross-check vs ISAAC_PGD_OFF_BOSSES and the offset law. */
  assert.equal(pgdAddBossFlagOff(), 0xe07);
  assert.notEqual(pgdAddBossFlagOff(), 0xe06);
  assert.equal(PGD_ADDBOSS_FLAG_OFF, PGD_OFF_BOSSES);
  assert.equal(pgdAddBossFlagByteOff(1), 0xe08);
  assert.equal(pgdAddBossFlagByteOff(0xffffffff),
    (0xe07 + 0xffffffff) >>> 0);
  /* MB7: an OR gate (any byte nonzero) would fire blocks with only
     one byte set; the machine `cmp byte,0 ; je` skips on ANY zero,
     so ALL must be nonzero. */
  assert.equal(pgdAddBossBlockGate(5, 0x2, 0, 0, 0), 0);
  assert.equal(pgdAddBossBlockGate(6, 0, 0, 0, 0x2), 0);
  assert.equal(pgdAddBossBlockGate(1, 0x2, 0, 0, 0, 0, 0), 0);
  /* MB8: B8 dropping its e0d read (or B3 losing it) would fire on
     wrong bytes; e0d is read by BOTH blocks in the machine. */
  assert.equal(pgdAddBossBlockByteOff(7, 0), 0xe0d);
  assert.equal(pgdAddBossBlockByteOff(2, 1), 0xe0d);
  assert.equal(pgdAddBossBlockGate(7, 0, 0x1, 0x100), 0);
  assert.equal(pgdAddBossBlockGate(7, 0, 0x1, 0x101), 0);
  assert.equal(pgdAddBossBlockGate(7, 0x2, 0, 0x100), 0);
  assert.equal(pgdAddBossBlockGate(7, 0x2, 0x1, 0x101), 1);
  assert.equal(pgdAddBossBlockGate(2, 1, 0, 1, 1, 1), 0);
  assert.equal(pgdAddBossBlockGate(2, 1, 0x2, 1, 1, 1), 1);
});

/* =====================================================================
   ABI v22 — PGDADDMINI (PersistentGameData::AddMiniBoss mutator
   0x0092a520, no exact ZHL — self-named by its warning string
   "[warn] AddMiniBoss: invalid miniboss id %d" @0xb7aecc;
   address-stable; ret 4 @0x92a5d3; ALIVE callers 0x7ffff1 /
   0x800010 byte-scan verified; TWO rets: OK @0x92a5be, fail/warn
   tail @0x92a5d1..0x92a5d3; int3 pad @0x92a5d6)
   Evidence: section-notes/pgd-v22/ (readonly LOW BYTE gate cmp byte
   [esi+1],0 ; jne fail @0x92a529/0x92a52d; id window cmp eax,0xf ;
   ja warn UNSIGNED @0x92a533/0x92a536; id->index fold
   @0x92a53c..0x92a557: lea ecx,[eax-7] ; cmp ecx,6 ; ja (7..0xd ->
   0..6), cmp eax,0xe ; jne (0xe -> 6 via mov eax,6), cmp eax,6 ; jg
   (0xf DROPPED silently — no store, no log); flag store mov byte
   [eax+esi+0xe00],1 @0x92a55f; dirty store mov byte [esi],1
   @0x92a569; host log (1, 0xb7aeac, idx) cdecl @0x92a56c ->
   0xa112c0; ALL-SET gate cmp byte [esi+0xe00..0xe06],0 ; je tail
   @0x92a574..0x92a5b1; push 0x16 ; mov ecx,esi ; call 0x929a20
   @0x92a5b7 — TryUnlock stays HOST) */

/* Branch-by-branch reference, transcribed from the instruction stream
   (NOT from the C++ or the model). */
/* 0x92a529 cmp byte [esi+1],0 ; jne 0x92a5d1  (readonly LOW BYTE)
   0x92a533 cmp eax,0xf ; ja 0x92a5c1          (id window UNSIGNED)
   0x92a53c lea ecx,[eax-7]                    (fold)
   0x92a53f cmp ecx,6 ; ja 0x92a548
   0x92a548 cmp eax,0xe ; jne 0x92a554         (alias)
   0x92a554 cmp eax,6 ; jg 0x92a5d1            (SIGNED drop: 0xf) */
function refAddMiniIndex(arg) {
  const a = arg >>> 0;
  if (a > 0xf) return -1;
  const folded = (a - 7) >>> 0;
  if (folded <= 6) return folded;
  if (a === 0xe) return 6;
  if ((a | 0) > 6) return -1;
  return a;
}
function refAddMiniOutcome(readonlyByte, arg) {
  if ((readonlyByte & 0xff) !== 0) return -1;   /* jne @0x92a52d */
  const a = arg >>> 0;
  if (a > 0xf) return -2;                       /* ja @0x92a536 warn */
  const idx = refAddMiniIndex(a);
  if (idx < 0) return -3;                       /* silent drop @0x92a557 */
  return idx;
}
function refAddMiniUnlockGate(slots7) {
  if (slots7.length < 7) return 0;
  for (let s = 0; s < 7; ++s) {
    if ((slots7[s] & 0xff) === 0) return 0;
  }
  return 1;
}
function refAddMiniUnlockFires(slots7) {
  return refAddMiniUnlockGate(slots7) ? 0x16 : 0;
}

test("header records the v22 PGDADDMINI evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADDMINI/);
  assert.match(h, /AddMiniBoss/);
  assert.match(h, /0x0092a520/);
  assert.match(h, /0x92a5d3/);
  assert.match(h, /0x92a55f/);
  assert.match(h, /0x0092a5be/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDADDMINI/);
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_addmini_va/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  /* header flag-array cross-checks: +0xe00 is the sec5 byte map
     (7 slots), the dirty byte is pgd+0, the unlock id matches the
     PGDX sec5 record, and the id window / alias / remap shape match
     the v2-era PGDX oracle constants. */
  assert.equal(PGD_ADDMINI_FLAG_OFF, PGD_OFF_SEC5_BYTES);
  assert.equal(PGD_ADDMINI_SLOTS, PGD_COUNT_SEC5);
  assert.equal(PGD_ADDMINI_DIRTY_OFF, PGD_OFF_CHANGES_MADE);
  assert.equal(PGD_ADDMINI_UNLOCK_ID, PGD_SEC5_UNLOCK_ID);
  assert.equal(PGD_ADDMINI_ID_MAX, PGD_SEC5_ID_MAX);
  assert.equal(PGD_ADDMINI_ALIAS_ID, PGD_SEC5_ALIAS_ID);
  assert.equal(PGD_ADDMINI_REMAP_BASE, PGD_SEC5_REMAP_BASE);
  assert.equal(PGD_ADDMINI_REMAP_SPAN, PGD_SEC5_REMAP_SPAN);
  assert.equal(PGD_ADDMINI_VA, PGD_SEC5_HOST_VA_MUTATOR);
  /* v22 advances the probe's next-island record past the landed
     AddMiniBoss mutator to 0x92b230 (SEC10, the unchecked +0xf14
     store); v23 lands PGDADSED 0x92b230 + PGDK41 0x92b270
     (completing the PGDX/PGDK cluster) and advances to the shared
     snapshot reader 0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADDMINI VA records + callers + wasm surface", () => {
  assert.equal(PGD_ADDMINI_VA, 0x0092a520);
  assert.equal(PGD_ADDMINI_RET_FAIL_VA, 0x0092a5d3);
  assert.equal(PGD_ADDMINI_RET_FAIL_TAIL_VA, 0x0092a5d1);
  assert.equal(PGD_ADDMINI_RET_OK_VA, 0x0092a5be);
  assert.equal(PGD_ADDMINI_CALL_SITES, 2);
  assert.deepEqual(PGD_ADDMINI_CALL_SITE_VAS, [0x007ffff1, 0x00800010]);
  assert.equal(PGD_ADDMINI_READONLY_CMP_VA, 0x0092a529);
  assert.equal(PGD_ADDMINI_READONLY_JNE_VA, 0x0092a52d);
  assert.equal(PGD_ADDMINI_ARG_GATE_CMP_VA, 0x0092a533);
  assert.equal(PGD_ADDMINI_ARG_GATE_JA_VA, 0x0092a536);
  assert.equal(PGD_ADDMINI_MAP_LEA_VA, 0x0092a53c);
  assert.equal(PGD_ADDMINI_MAP_CMP_VA, 0x0092a53f);
  assert.equal(PGD_ADDMINI_MAP_JA_VA, 0x0092a542);
  assert.equal(PGD_ADDMINI_ALIAS_CMP_VA, 0x0092a548);
  assert.equal(PGD_ADDMINI_ALIAS_JNE_VA, 0x0092a54b);
  assert.equal(PGD_ADDMINI_ALIAS_MOV_VA, 0x0092a54d);
  assert.equal(PGD_ADDMINI_TAIL_CMP_VA, 0x0092a554);
  assert.equal(PGD_ADDMINI_TAIL_JG_VA, 0x0092a557);
  assert.equal(PGD_ADDMINI_FLAG_STORE_VA, 0x0092a55f);
  assert.equal(PGD_ADDMINI_FLAG_OFF, 0xe00);
  assert.equal(PGD_ADDMINI_DIRTY_STORE_VA, 0x0092a569);
  assert.equal(PGD_ADDMINI_DIRTY_OFF, 0);
  assert.equal(PGD_ADDMINI_LOG_STRING_VA, 0x00b7aeac);
  assert.equal(PGD_ADDMINI_LOG_CALL_VA, 0x0092a56c);
  assert.equal(PGD_ADDMINI_LOG_CALLEE_VA, 0x00a112c0);
  assert.equal(PGD_ADDMINI_WARN_STRING_VA, 0x00b7aecc);
  assert.equal(PGD_ADDMINI_WARN_CALL_VA, 0x0092a5c9);
  assert.equal(PGD_ADDMINI_UNLOCK_FIRST_CMP_VA, 0x0092a574);
  assert.equal(PGD_ADDMINI_UNLOCK_PUSH_VA, 0x0092a5b3);
  assert.equal(PGD_ADDMINI_UNLOCK_CALL_VA, 0x0092a5b7);
  assert.equal(PGD_ADDMINI_UNLOCK_TARGET_VA, 0x00929a20);
  assert.equal(PGD_ADDMINI_SLOTS, 7);
  assert.equal(PGD_ADDMINI_UNLOCK_ID, 0x16);
  assert.equal(PGD_ADDMINI_ID_MAX, 0xf);
  assert.equal(PGD_ADDMINI_REMAP_BASE, 7);
  assert.equal(PGD_ADDMINI_REMAP_SPAN, 6);
  assert.equal(PGD_ADDMINI_ALIAS_ID, 0xe);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_addmini_va() >>> 0, 0x0092a520);
  assert.equal(wasm.isaac_pgd_addmini_ret_fail_va() >>> 0, 0x0092a5d3);
  assert.equal(wasm.isaac_pgd_addmini_ret_fail_tail_va() >>> 0, 0x0092a5d1);
  assert.equal(wasm.isaac_pgd_addmini_ret_ok_va() >>> 0, 0x0092a5be);
  assert.equal(wasm.isaac_pgd_addmini_call_site_count(), 2);
  assert.equal(wasm.isaac_pgd_addmini_call_site_va(0) >>> 0, 0x007ffff1);
  assert.equal(wasm.isaac_pgd_addmini_call_site_va(1) >>> 0, 0x00800010);
  assert.equal(wasm.isaac_pgd_addmini_call_site_va(2), 0);
  assert.equal(wasm.isaac_pgd_addmini_call_site_va(-1), 0);
  assert.equal(wasm.isaac_pgd_addmini_readonly_cmp_va() >>> 0, 0x0092a529);
  assert.equal(wasm.isaac_pgd_addmini_readonly_jne_va() >>> 0, 0x0092a52d);
  assert.equal(wasm.isaac_pgd_addmini_arg_gate_cmp_va() >>> 0, 0x0092a533);
  assert.equal(wasm.isaac_pgd_addmini_arg_gate_ja_va() >>> 0, 0x0092a536);
  assert.equal(wasm.isaac_pgd_addmini_map_lea_va() >>> 0, 0x0092a53c);
  assert.equal(wasm.isaac_pgd_addmini_map_cmp_va() >>> 0, 0x0092a53f);
  assert.equal(wasm.isaac_pgd_addmini_map_ja_va() >>> 0, 0x0092a542);
  assert.equal(wasm.isaac_pgd_addmini_alias_cmp_va() >>> 0, 0x0092a548);
  assert.equal(wasm.isaac_pgd_addmini_alias_jne_va() >>> 0, 0x0092a54b);
  assert.equal(wasm.isaac_pgd_addmini_alias_mov_va() >>> 0, 0x0092a54d);
  assert.equal(wasm.isaac_pgd_addmini_tail_cmp_va() >>> 0, 0x0092a554);
  assert.equal(wasm.isaac_pgd_addmini_tail_jg_va() >>> 0, 0x0092a557);
  assert.equal(wasm.isaac_pgd_addmini_flag_store_va() >>> 0, 0x0092a55f);
  assert.equal(wasm.isaac_pgd_addmini_flag_off(), 0xe00);
  assert.equal(wasm.isaac_pgd_addmini_dirty_store_va() >>> 0, 0x0092a569);
  assert.equal(wasm.isaac_pgd_addmini_dirty_off(), 0);
  assert.equal(wasm.isaac_pgd_addmini_log_string_va() >>> 0, 0x00b7aeac);
  assert.equal(wasm.isaac_pgd_addmini_log_call_va() >>> 0, 0x0092a56c);
  assert.equal(wasm.isaac_pgd_addmini_log_callee_va() >>> 0, 0x00a112c0);
  assert.equal(wasm.isaac_pgd_addmini_warn_string_va() >>> 0, 0x00b7aecc);
  assert.equal(wasm.isaac_pgd_addmini_warn_call_va() >>> 0, 0x0092a5c9);
  assert.equal(wasm.isaac_pgd_addmini_unlock_first_cmp_va() >>> 0, 0x0092a574);
  assert.equal(wasm.isaac_pgd_addmini_unlock_push_va() >>> 0, 0x0092a5b3);
  assert.equal(wasm.isaac_pgd_addmini_unlock_call_va() >>> 0, 0x0092a5b7);
  assert.equal(wasm.isaac_pgd_addmini_unlock_target_va() >>> 0, 0x00929a20);
  assert.equal(wasm.isaac_pgd_addmini_slots(), 7);
  assert.equal(wasm.isaac_pgd_addmini_unlock_id(), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_id_max(), 0xf);
  assert.equal(wasm.isaac_pgd_addmini_remap_base(), 7);
  assert.equal(wasm.isaac_pgd_addmini_remap_span(), 6);
  assert.equal(wasm.isaac_pgd_addmini_alias_id(), 0xe);
  /* id->index remap across wasm and model: window, fold, alias, drop. */
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0), 0);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(6), 6);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(7), 0);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xd), 6);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xe), 6);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xf), -1);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0x10), -1);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xffffffff), -1);
  assert.equal(pgdAddMiniIndexRemap(0), 0);
  assert.equal(pgdAddMiniIndexRemap(0xd), 6);
  assert.equal(pgdAddMiniIndexRemap(0xe), 6);
  assert.equal(pgdAddMiniIndexRemap(0xf), -1);
  assert.equal(pgdAddMiniIndexRemap(0x80000000), -1);
  /* warn trigger: only above 0xf (unsigned); 0xf does NOT warn. */
  assert.equal(wasm.isaac_pgd_addmini_out_of_range(0xf), 0);
  assert.equal(wasm.isaac_pgd_addmini_out_of_range(0x10), 1);
  assert.equal(wasm.isaac_pgd_addmini_out_of_range(0x80000000), 1);
  assert.equal(pgdAddMiniOutOfRange(0xf), 0);
  assert.equal(pgdAddMiniOutOfRange(0xffffffff), 1);
  /* outcome: -1 readonly, -2 warn, -3 silent drop, else slot. */
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 7), 0);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0xe), 6);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0xf), -3);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0x10), -2);
  assert.equal(wasm.isaac_pgd_addmini_outcome(1, 7), -1);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0x100, 7), 0);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0x2, 7), -1);
  assert.equal(pgdAddMiniOutcome(0, 0xf), -3);
  assert.equal(pgdAddMiniOutcome(0, 0x10), -2);
  assert.equal(pgdAddMiniOutcome(1, 0xe), -1);
  /* flag byte offset law. */
  assert.equal(wasm.isaac_pgd_addmini_flag_byte_off(0) >>> 0, 0xe00);
  assert.equal(wasm.isaac_pgd_addmini_flag_byte_off(6) >>> 0, 0xe06);
  assert.equal(pgdAddMiniFlagByteOff(0), 0xe00);
  assert.equal(pgdAddMiniFlagByteOff(6), 0xe06);
  /* ALL-SET unlock gate and fires. */
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(1, 1, 1, 1, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(1, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(0x100, 0xff, 1, 1, 1, 1, 1), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(0x101, 0xff, 1, 1, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 1), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(pgdAddMiniUnlockFires(0xff, 0x2, 1, 1, 1, 1, 0x101), 0x16);
  assert.equal(pgdAddMiniUnlockFires(0xff, 0x2, 1, 1, 1, 1, 0), 0);
});

test("PE truth: v22 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92a520);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const arg = pick(rng, 0x100000000);
    const seven = [
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000),
    ];
    /* outcome across C++ wasm, model, and the instruction-stream ref. */
    const expOut = refAddMiniOutcome(readonlyByte, arg);
    assert.equal(wasm.isaac_pgd_addmini_outcome(readonlyByte, arg), expOut,
      `outcome ${readonlyByte >>> 0} ${arg >>> 0}`);
    assert.equal(pgdAddMiniOutcome(readonlyByte, arg), expOut,
      `model outcome ${readonlyByte >>> 0} ${arg >>> 0}`);
    /* remap + warn trigger. */
    const expIdx = refAddMiniIndex(arg);
    assert.equal(wasm.isaac_pgd_addmini_index_remap(arg), expIdx,
      `remap ${arg >>> 0}`);
    assert.equal(pgdAddMiniIndexRemap(arg), expIdx,
      `model remap ${arg >>> 0}`);
    assert.equal(wasm.isaac_pgd_addmini_out_of_range(arg),
      expIdx === -1 && (arg >>> 0) > 0xf ? 1 : 0,
      `oor ${arg >>> 0}`);
    assert.equal(pgdAddMiniOutOfRange(arg),
      (arg >>> 0) > 0xf ? 1 : 0);
    /* flag byte offset law (32-bit wrap) across wasm and model. */
    assert.equal(
      wasm.isaac_pgd_addmini_flag_byte_off(arg) >>> 0,
      (0xe00 + (arg >>> 0)) >>> 0,
      `off ${arg >>> 0}`,
    );
    assert.equal(pgdAddMiniFlagByteOff(arg), (0xe00 + (arg >>> 0)) >>> 0);
    /* ALL-SET unlock gate + fires across all three. */
    const expGate = refAddMiniUnlockGate(seven);
    assert.equal(wasm.isaac_pgd_addmini_unlock_gate(...seven), expGate,
      `gate ${seven.map((x) => x >>> 0).join(",")}`);
    assert.equal(pgdAddMiniUnlockGate(...seven), expGate,
      `model gate ${seven.map((x) => x >>> 0).join(",")}`);
    const expFire = refAddMiniUnlockFires(seven);
    assert.equal(wasm.isaac_pgd_addmini_unlock_fires(...seven), expFire,
      `fires ${seven.map((x) => x >>> 0).join(",")}`);
    assert.equal(pgdAddMiniUnlockFires(...seven), expFire,
      `model fires ${seven.map((x) => x >>> 0).join(",")}`);
  }
  /* fixed edges the random corpus cannot be trusted to hit. */
  for (let id = 0; id <= 0xf; ++id) {
    assert.equal(wasm.isaac_pgd_addmini_index_remap(id), refAddMiniIndex(id),
      `remap edge ${id}`);
    assert.equal(pgdAddMiniIndexRemap(id), refAddMiniIndex(id),
      `model remap edge ${id}`);
    assert.equal(wasm.isaac_pgd_addmini_outcome(0, id),
      refAddMiniOutcome(0, id), `outcome edge ${id}`);
  }
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0xffffffff), -2);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0x80000000), -2);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xffffffff), -1);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0x80000000), -1);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0x100000000 + 7), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 1), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 0x100), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 0x101), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(0xff, 0x2, 0x101, 1, 1, 1, 1), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(0xff, 0x2, 0x100, 1, 1, 1, 1), 0);
});

test("PE truth: v22 cross-check vs the PGDX sec5 oracle", () => {
  const rng = makeRng(0x92a520 ^ 0x5ec5);
  for (let n = 0; n < 3000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const arg = pick(rng, 0x100000000);
    /* the remap law is id-identical to the v2-era oracle. */
    assert.equal(pgdAddMiniIndexRemap(arg), pgdSec5IndexRemap(arg),
      `remap ${arg >>> 0}`);
    /* the warn trigger is the same unsigned window. */
    assert.equal(pgdAddMiniOutOfRange(arg),
      pgdSec5OutOfRange(arg) ? 1 : 0,
      `oor ${arg >>> 0}`);
    /* store_slot conflates the warn/silent negatives; the outcome law
       splits them but must AGREE on the store/no-store decision. */
    const out = pgdAddMiniOutcome(readonlyByte, arg);
    const slot = pgdSec5StoreSlot(readonlyByte, arg);
    assert.equal(out < 0, slot < 0,
      `sign ${readonlyByte >>> 0}/${arg >>> 0} (${out} vs ${slot})`);
    if (out >= 0) {
      assert.equal(out, slot, `slot ${readonlyByte >>> 0}/${arg >>> 0}`);
    }
    /* the seven-slot ALL-set gate is the sec5 all-set law. */
    const seven = [
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000), pick(rng, 0x100000000),
      pick(rng, 0x100000000),
    ];
    const allSet = pgdSec5AllSet(
      new Uint8Array(seven.map((x) => x & 0xff)), PGD_SEC5_SLOTS);
    assert.equal(pgdAddMiniUnlockFires(...seven) !== 0, allSet,
      `allset ${seven.map((x) => x >>> 0).join(",")}`);
    assert.equal(wasm.isaac_pgd_addmini_unlock_fires(...seven) !== 0, allSet,
      `wasm allset ${seven.map((x) => x >>> 0).join(",")}`);
  }
  /* constants agree with the oracle record. */
  assert.equal(PGD_ADDMINI_UNLOCK_ID, PGD_SEC5_UNLOCK_ID);
  assert.equal(PGD_ADDMINI_SLOTS, PGD_SEC5_SLOTS);
  assert.equal(PGD_ADDMINI_ID_MAX, PGD_SEC5_ID_MAX);
  assert.equal(PGD_ADDMINI_REMAP_BASE, PGD_SEC5_REMAP_BASE);
  assert.equal(PGD_ADDMINI_REMAP_SPAN, PGD_SEC5_REMAP_SPAN);
  assert.equal(PGD_ADDMINI_ALIAS_ID, PGD_SEC5_ALIAS_ID);
  assert.equal(PGD_ADDMINI_FLAG_OFF, PGD_OFF_SEC5_BYTES);
});

test("PE truth: v22 mutant — the AddMiniBoss laws must stay machine-exact", () => {
  /* MM1: a FULL-DWORD readonly test would FAIL 0x100 (low byte 0);
     `cmp byte [esi+1],0` sees LOW BYTE only, so 0x100/0x10000 must
     run and 0x2/0x1ff must not. */
  assert.equal(pgdAddMiniOutcome(0x100, 5), 5);
  assert.notEqual(pgdAddMiniOutcome(0x100, 5), -1);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0x100, 5), 5);
  assert.equal(pgdAddMiniOutcome(0x10000, 5), 5);
  assert.equal(pgdAddMiniOutcome(0x2, 5), -1);
  assert.equal(pgdAddMiniOutcome(0x1ff, 5), -1);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0xffffffff, 5), -1);
  /* MM2: remap fold base mistyped 7 -> 8 (7..0xd no longer folds to
     0..6): 7 MUST map to 0. */
  assert.equal(pgdAddMiniIndexRemap(7), 0);
  assert.notEqual(pgdAddMiniIndexRemap(7), -1);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(7), 0);
  assert.equal(pgdAddMiniIndexRemap(0xd), 6);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xd), 6);
  /* MM3: the 0xe alias mistyped onto 0xd: 0xe MUST map to slot 6,
     exactly like the folded 0xd. */
  assert.equal(pgdAddMiniIndexRemap(0xe), 6);
  assert.notEqual(pgdAddMiniIndexRemap(0xe), 0xd);
  assert.equal(wasm.isaac_pgd_addmini_index_remap(0xe), 6);
  assert.equal(pgdAddMiniIndexRemap(0xd), pgdAddMiniIndexRemap(0xe));
  assert.equal(pgdAddMiniIndexRemap(6), pgdAddMiniIndexRemap(0xd));
  /* MM4: the silent drop 0xf turned into an alias would store slot 6;
     the machine `cmp eax,6 ; jg` DROPS it — outcome -3, nothing runs. */
  assert.equal(pgdAddMiniOutcome(0, 0xf), -3);
  assert.notEqual(pgdAddMiniOutcome(0, 0xf), 6);
  assert.notEqual(pgdAddMiniOutcome(0, 0xf), -2);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0xf), -3);
  assert.equal(pgdAddMiniIndexRemap(0xf), -1);
  assert.notEqual(pgdAddMiniIndexRemap(0xf), 6);
  /* MM5: the warn decision is UNSIGNED (`ja`) — 0x80000000 MUST warn,
     not pass as a negative. */
  assert.equal(pgdAddMiniOutOfRange(0x80000000), 1);
  assert.equal(pgdAddMiniOutcome(0, 0x80000000), -2);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0x80000000), -2);
  assert.equal(pgdAddMiniOutOfRange(0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_addmini_out_of_range(0xffffffff), 1);
  /* MM6: warn/silent conflation — 0xf must NOT log, > 0xf MUST. */
  assert.equal(pgdAddMiniOutcome(0, 0x10), -2);
  assert.notEqual(pgdAddMiniOutcome(0, 0xf), -2);
  assert.notEqual(pgdAddMiniOutcome(0, 0xf), pgdAddMiniOutcome(0, 0x10));
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0xf), -3);
  assert.equal(wasm.isaac_pgd_addmini_outcome(0, 0x10), -2);
  /* MM7: unlock id mistyped 0x16 -> 0x15 would fail the sec5 record
     check; the push immediate is 0x16. */
  assert.equal(pgdAddMiniUnlockId(), 0x16);
  assert.notEqual(pgdAddMiniUnlockId(), 0x15);
  assert.equal(pgdAddMiniUnlockFires(1, 1, 1, 1, 1, 1, 1), 0x16);
  assert.equal(wasm.isaac_pgd_addmini_unlock_fires(1, 1, 1, 1, 1, 1, 1), 0x16);
  assert.equal(PGD_ADDMINI_UNLOCK_ID, PGD_SEC5_UNLOCK_ID);
  /* MM8: an OR gate or a 6-slot gate would fire with one slot zero;
     the machine `cmp byte,0 ; je` chain needs ALL SEVEN nonzero
     (wide drive: 0x100 stores low byte 0 -> fails; 0x101 -> passes). */
  assert.equal(pgdAddMiniUnlockGate(1, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(pgdAddMiniUnlockGate(0, 1, 1, 1, 1, 1, 1), 0);
  assert.equal(pgdAddMiniUnlockGate(1, 1, 1, 1, 1, 1, 0x101), 1);
  assert.equal(pgdAddMiniUnlockGate(1, 1, 1, 1, 1, 1, 0x100), 0);
  assert.equal(pgdAddMiniUnlockFires(0xff, 0x2, 1, 1, 1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(1, 1, 1, 1, 1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(0xff, 0x2, 0x101, 1, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addmini_unlock_gate(0xff, 0x2, 0x100, 1, 1, 1, 1), 0);
  /* MM9: flag base mistyped 0xe00 -> 0xe07 would break the header
     cross-check vs ISAAC_PGD_OFF_SEC5_BYTES and the offset law. */
  assert.equal(pgdAddMiniFlagOff(), 0xe00);
  assert.notEqual(pgdAddMiniFlagOff(), 0xe07);
  assert.equal(PGD_ADDMINI_FLAG_OFF, PGD_OFF_SEC5_BYTES);
  assert.equal(pgdAddMiniFlagByteOff(0), 0xe00);
  assert.equal(pgdAddMiniFlagByteOff(6), 0xe06);
  assert.equal(pgdAddMiniFlagByteOff(0xffffffff), (0xe00 + 0xffffffff) >>> 0);
  assert.equal(wasm.isaac_pgd_addmini_flag_byte_off(6) >>> 0, 0xe06);
});

/* =====================================================================
   ABI v23 — PGDADSED + PGDK41 (the two remaining v1-"unidentified"
   mutator islands between the count probe and the landed
   TryImportRebirthLocalSave 0x92b2e0; the whole 0x92b22a..0x92b2e0
   span is pure-covered after this unit)
   Evidence: section-notes/pgd-v23/ (PGDADSED 0x92b230: readonly
   LOW BYTE gate cmp byte [ecx+1],0 ; jne ret @0x92b233/0x92b237;
   the UNCHECKED slot store mov byte [eax+ecx+0xf14],1 @0x92b244
   with eax = the seed — byte [pgd+0xf14+SEED] = 1, raw index, no
   mask, no bounds (0xf14 = PGD_OFF_SEC10_BYTES, 0x50 slots); the
   UNCONDITIONAL slot-0 clear mov byte [ecx+0xf14],0 @0x92b24c
   (seed==0 self-cancels); dirty mov byte [ecx],1 @0x92b253; host
   log (1, 0xb7ae58, seed) cdecl @0x92b256 -> 0xa112c0 — the args
   are pushed BEFORE the stores. PGDK41 0x92b270: counter stores
   mov [ebx+0x5ac],eax @0x92b281 (lo -> index 188) + mov
   [ebx+0xa7c],eax @0x92b28a (hi -> index 496; 0x2bc =
   PGD_OFF_EVENT_COUNTERS); the 41-iteration loop
   @0x92b295..0x92b2ba — bts masks the bit index to 5 bits, the
   cmovae/xor dance zeroes the low word for i>=32, and/or tests lo
   bit i (i<32) / hi bit i-32 (i>=32), bound 0x29; cmp edi,5 ; jl
   @0x92b2bf/@0x92b2c2 SIGNED gate; push 0x143 ; mov ecx,ebx ; call
   0x929a20 (TryUnlock stays HOST) @0x92b2c4/@0x92b2cb at popcount
   >= 5; the dirty store mov byte [ebx],1 @0x92b2d2 is
   UNCONDITIONAL). */

/* Branch-by-branch references, transcribed from the instruction
   streams (NOT from the C++ or the model). */
/* PGDADSED 0x92b230:
   0x92b233 cmp byte [ecx+1],0 ; jne 0x92b25e  (readonly LOW BYTE)
   0x92b244 mov byte [eax+ecx+0xf14],1        (slot[seed]=1, UNCHECKED)
   0x92b24c mov byte [ecx+0xf14],0            (slot[0]=0, unconditional)
   0x92b253 mov byte [ecx],1                  (dirty; log call stays host)
   PGDK41 0x92b270:
   0x92b281 mov [ebx+0x5ac],eax               (lo -> counters[188])
   0x92b28a mov [ebx+0xa7c],eax               (hi -> counters[496])
   loop @0x92b295..0x92b2ba: bts esi,ecx (bit index masked to 5
     bits), cmp ecx,0x20 ; cmovae edx,esi ; xor esi,edx (esi zeroed
     i>=32), and esi,[ebp+8] ; and edx,[ebp+0xc] ; or ; je (lo bit i
     / hi bit i-32), inc eax ; cmp eax,0x29 ; jl
   0x92b2bf cmp edi,5 ; jl 0x92b2d0           (SIGNED gate)
   0x92b2c4 push 0x143 ; mov ecx,ebx ; call 0x929a20 (host)
   0x92b2d2 mov byte [ebx],1                  (dirty, unconditional) */
function refAdsEdGate(readonlyByte) {
  return (readonlyByte & 0xff) === 0 ? 1 : 0;
}
function refAdsEdOutcome(readonlyByte, seed) {
  if ((readonlyByte & 0xff) !== 0) return -1;   /* jne @0x92b237: no work */
  return 0;                                     /* stores + host log run */
}
function refAdsEdStoreIndex(seed) {
  return seed >>> 0;                            /* raw unchecked index */
}
function refAdsEdSelfCancelling(seed) {
  return (seed >>> 0) === 0 ? 1 : 0;
}
function refAdsEdSlot0After(readonlyByte, seed) {
  if ((readonlyByte & 0xff) !== 0) return -1;   /* gate closed: untouched */
  return 0;                                     /* unconditional clear */
}
function refAdsEdDirtyFires(readonlyByte, seed) {
  return (readonlyByte & 0xff) === 0 ? 1 : 0;
}
function refK41Popcount(lo, hi) {
  let n = 0;
  for (let i = 0; i < 0x29; ++i) {
    const bit = 1 << (i & 31);                 /* bts count mask */
    const hit = i < 0x20
      ? ((lo >>> 0) & bit) !== 0               /* and esi, [ebp+8] */
      : ((hi >>> 0) & bit) !== 0;              /* and edx, [ebp+0xc] */
    if (hit) n += 1;
  }
  return n;
}
function refK41Gate(lo, hi) {
  return refK41Popcount(lo, hi) >= 5 ? 1 : 0;
}
function refK41UnlockFires(lo, hi) {
  return refK41Popcount(lo, hi) >= 5 ? 0x143 : 0;
}

test("header records the v23 PGDADSED + PGDK41 evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDADSED/);
  assert.match(h, /PGDK41/);
  assert.match(h, /Seed %d added to\s+SaveState/);
  assert.match(h, /0x0092b230/);
  assert.match(h, /0x92b244/);
  assert.match(h, /0x92b24c/);
  assert.match(h, /0x0092b270/);
  assert.match(h, /0x92b2bf/);
  assert.match(h, /0x92b2d2/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDADSED/);
  assert.match(s, /PGDK41/);
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_adsed_va/);
  assert.match(s, /isaac_pgd_k41_popcount/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  /* header cross-checks vs the PGDX v2-era records. */
  assert.equal(PGD_ADSED_VA, PGD_SEC10_HOST_VA_MUTATOR);
  assert.equal(PGD_ADSED_SLOT_BASE, PGD_OFF_SEC10_BYTES);
  assert.equal(PGD_ADSED_SLOTS, PGD_SEC10_SLOTS);
  assert.equal(PGD_ADSED_DIRTY_OFF, PGD_OFF_CHANGES_MADE);
  assert.equal(PGD_ADSED_READONLY_OFF, PGD_OFF_READONLY);
  assert.equal(PGD_ADSED_LOG_STRING_VA, PGD_SEC10_LOG_ADD_VA);
  assert.equal(PGD_K41_VA, PGD_MASK41_HOST_VA);
  assert.equal(PGD_K41_BITS, PGD_MASK41_BITS);
  assert.equal(PGD_K41_LO_COUNTER_INDEX, PGD_MASK41_LO_COUNTER_INDEX);
  assert.equal(PGD_K41_HI_COUNTER_INDEX, PGD_MASK41_HI_COUNTER_INDEX);
  assert.equal(PGD_K41_UNLOCK_ID, PGD_MASK41_UNLOCK_ID);
  assert.equal(PGD_K41_UNLOCK_THRESHOLD, PGD_MASK41_UNLOCK_THRESHOLD);
  assert.equal(PGD_K41_COUNTER_BASE, PGD_OFF_EVENT_COUNTERS);
  /* v23 completes the PGDX/PGDK mutator cluster; the probe's
     next-island record advances to the shared snapshot reader
     0x009e4260. */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PE truth: PGDADSED VA records + laws across wasm and model", () => {
  assert.equal(PGD_ADSED_VA, 0x0092b230);
  assert.equal(PGD_ADSED_RET_VA, 0x0092b25f);
  assert.equal(PGD_ADSED_READONLY_CMP_VA, 0x0092b233);
  assert.equal(PGD_ADSED_READONLY_JNE_VA, 0x0092b237);
  assert.equal(PGD_ADSED_SLOT_STORE_VA, 0x0092b244);
  assert.equal(PGD_ADSED_SLOT0_CLEAR_VA, 0x0092b24c);
  assert.equal(PGD_ADSED_SLOT_BASE, 0xf14);
  assert.equal(PGD_ADSED_SLOTS, 0x50);
  assert.equal(PGD_ADSED_DIRTY_STORE_VA, 0x0092b253);
  assert.equal(PGD_ADSED_DIRTY_OFF, 0);
  assert.equal(PGD_ADSED_READONLY_OFF, 1);
  assert.equal(PGD_ADSED_LOG_STRING_VA, 0x00b7ae58);
  assert.equal(PGD_ADSED_LOG_CALL_VA, 0x0092b256);
  assert.equal(PGD_ADSED_LOG_CALLEE_VA, 0x00a112c0);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_adsed_va() >>> 0, 0x0092b230);
  assert.equal(wasm.isaac_pgd_adsed_ret_va() >>> 0, 0x0092b25f);
  assert.equal(wasm.isaac_pgd_adsed_readonly_cmp_va() >>> 0, 0x0092b233);
  assert.equal(wasm.isaac_pgd_adsed_readonly_jne_va() >>> 0, 0x0092b237);
  assert.equal(wasm.isaac_pgd_adsed_slot_store_va() >>> 0, 0x0092b244);
  assert.equal(wasm.isaac_pgd_adsed_slot0_clear_va() >>> 0, 0x0092b24c);
  assert.equal(wasm.isaac_pgd_adsed_slot_base(), 0xf14);
  assert.equal(wasm.isaac_pgd_adsed_slots(), 0x50);
  assert.equal(wasm.isaac_pgd_adsed_dirty_store_va() >>> 0, 0x0092b253);
  assert.equal(wasm.isaac_pgd_adsed_dirty_off(), 0);
  assert.equal(wasm.isaac_pgd_adsed_readonly_off(), 1);
  assert.equal(wasm.isaac_pgd_adsed_log_string_va() >>> 0, 0x00b7ae58);
  assert.equal(wasm.isaac_pgd_adsed_log_call_va() >>> 0, 0x0092b256);
  assert.equal(wasm.isaac_pgd_adsed_log_callee_va() >>> 0, 0x00a112c0);
  /* laws across wasm + model: gate, outcome, store index, self-cancel,
     slot0, dirty. */
  assert.equal(wasm.isaac_pgd_adsed_gate(0), 1);
  assert.equal(wasm.isaac_pgd_adsed_gate(1), 0);
  assert.equal(wasm.isaac_pgd_adsed_gate(0x100), 1);
  assert.equal(wasm.isaac_pgd_adsed_gate(0x1ff), 0);
  assert.equal(pgdAdsEdGate(0x10000), 1);
  assert.equal(pgdAdsEdGate(0x2), 0);
  assert.equal(wasm.isaac_pgd_adsed_outcome(0, 0), 0);
  assert.equal(wasm.isaac_pgd_adsed_outcome(1, 0), -1);
  assert.equal(wasm.isaac_pgd_adsed_outcome(0x100, 7), 0);
  assert.equal(wasm.isaac_pgd_adsed_outcome(0x2, 7), -1);
  assert.equal(pgdAdsEdOutcome(0, 0xffffffff), 0);
  assert.equal(pgdAdsEdOutcome(0xffffffff, 0), -1);
  assert.equal(wasm.isaac_pgd_adsed_store_index(0) >>> 0, 0);
  assert.equal(wasm.isaac_pgd_adsed_store_index(0x50) >>> 0, 0x50);
  assert.equal(wasm.isaac_pgd_adsed_store_index(0xffffffff) >>> 0, 0xffffffff);
  assert.equal(pgdAdsEdStoreIndex(0x1ff), 0x1ff);
  assert.equal(wasm.isaac_pgd_adsed_self_cancelling(0), 1);
  assert.equal(wasm.isaac_pgd_adsed_self_cancelling(1), 0);
  assert.equal(wasm.isaac_pgd_adsed_self_cancelling(0xffffffff), 0);
  assert.equal(pgdAdsEdSelfCancelling(0), 1);
  assert.equal(pgdAdsEdSelfCancelling(0x100), 0);
  assert.equal(wasm.isaac_pgd_adsed_slot0_after(0, 0), 0);
  assert.equal(wasm.isaac_pgd_adsed_slot0_after(1, 0), -1);
  assert.equal(wasm.isaac_pgd_adsed_slot0_after(0, 0x100), 0);
  assert.equal(pgdAdsEdSlot0After(0, 0), 0);
  assert.equal(pgdAdsEdSlot0After(0x100, 7), 0);
  assert.equal(wasm.isaac_pgd_adsed_dirty_fires(0, 0), 1);
  assert.equal(wasm.isaac_pgd_adsed_dirty_fires(0, 0x50), 1);
  assert.equal(wasm.isaac_pgd_adsed_dirty_fires(1, 0), 0);
  assert.equal(pgdAdsEdDirtyFires(0, 0xffffffff), 1);
  assert.equal(pgdAdsEdDirtyFires(0x2, 0), 0);
});

test("PE truth: PGDK41 VA records + laws across wasm and model", () => {
  assert.equal(PGD_K41_VA, 0x0092b270);
  assert.equal(PGD_K41_RET_VA, 0x0092b2d9);
  assert.equal(PGD_K41_LO_COUNTER_STORE_VA, 0x0092b281);
  assert.equal(PGD_K41_HI_COUNTER_STORE_VA, 0x0092b28a);
  assert.equal(PGD_K41_LO_COUNTER_INDEX, 188);
  assert.equal(PGD_K41_HI_COUNTER_INDEX, 496);
  assert.equal(PGD_K41_BITS, 0x29);
  assert.equal(PGD_K41_LOOP_BTS_VA, 0x0092b29b);
  assert.equal(PGD_K41_LOOP_BOUND_CMP_VA, 0x0092b2b7);
  assert.equal(PGD_K41_LOOP_BOUND_JL_VA, 0x0092b2ba);
  assert.equal(PGD_K41_LOOP_OR_JE_VA, 0x0092b2b1);
  assert.equal(PGD_K41_GATE_CMP_VA, 0x0092b2bf);
  assert.equal(PGD_K41_GATE_JL_VA, 0x0092b2c2);
  assert.equal(PGD_K41_UNLOCK_PUSH_VA, 0x0092b2c4);
  assert.equal(PGD_K41_UNLOCK_CALL_VA, 0x0092b2cb);
  assert.equal(PGD_K41_UNLOCK_TARGET_VA, 0x00929a20);
  assert.equal(PGD_K41_UNLOCK_ID, 0x143);
  assert.equal(PGD_K41_UNLOCK_THRESHOLD, 5);
  assert.equal(PGD_K41_DIRTY_STORE_VA, 0x0092b2d2);
  assert.equal(PGD_K41_DIRTY_OFF, 0);
  assert.equal(PGD_K41_COUNTER_BASE, 0x2bc);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_k41_va() >>> 0, 0x0092b270);
  assert.equal(wasm.isaac_pgd_k41_ret_va() >>> 0, 0x0092b2d9);
  assert.equal(wasm.isaac_pgd_k41_lo_counter_store_va() >>> 0, 0x0092b281);
  assert.equal(wasm.isaac_pgd_k41_hi_counter_store_va() >>> 0, 0x0092b28a);
  assert.equal(wasm.isaac_pgd_k41_lo_counter_index(), 188);
  assert.equal(wasm.isaac_pgd_k41_hi_counter_index(), 496);
  assert.equal(wasm.isaac_pgd_k41_bits(), 0x29);
  assert.equal(wasm.isaac_pgd_k41_loop_bts_va() >>> 0, 0x0092b29b);
  assert.equal(wasm.isaac_pgd_k41_loop_bound_cmp_va() >>> 0, 0x0092b2b7);
  assert.equal(wasm.isaac_pgd_k41_loop_bound_jl_va() >>> 0, 0x0092b2ba);
  assert.equal(wasm.isaac_pgd_k41_loop_or_je_va() >>> 0, 0x0092b2b1);
  assert.equal(wasm.isaac_pgd_k41_gate_cmp_va() >>> 0, 0x0092b2bf);
  assert.equal(wasm.isaac_pgd_k41_gate_jl_va() >>> 0, 0x0092b2c2);
  assert.equal(wasm.isaac_pgd_k41_unlock_push_va() >>> 0, 0x0092b2c4);
  assert.equal(wasm.isaac_pgd_k41_unlock_call_va() >>> 0, 0x0092b2cb);
  assert.equal(wasm.isaac_pgd_k41_unlock_target_va() >>> 0, 0x00929a20);
  assert.equal(wasm.isaac_pgd_k41_unlock_id(), 0x143);
  assert.equal(wasm.isaac_pgd_k41_unlock_threshold(), 5);
  assert.equal(wasm.isaac_pgd_k41_dirty_store_va() >>> 0, 0x0092b2d2);
  assert.equal(wasm.isaac_pgd_k41_dirty_off(), 0);
  assert.equal(wasm.isaac_pgd_k41_counter_base(), 0x2bc);
  /* 41-bit popcount: word split at bit 32, bts count masking. */
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0), 0);
  assert.equal(wasm.isaac_pgd_k41_popcount(0xffffffff, 0), 32);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0xffffffff), 9);
  assert.equal(wasm.isaac_pgd_k41_popcount(0xffffffff, 0xffffffff), 41);
  assert.equal(wasm.isaac_pgd_k41_popcount(0x80000000, 0x80000000), 1);
  assert.equal(wasm.isaac_pgd_k41_popcount(1, 1), 2);
  assert.equal(wasm.isaac_pgd_k41_popcount(0x100, 0x100), 2);
  assert.equal(wasm.isaac_pgd_k41_popcount(0x1ff, 0x1ff), 18);
  assert.equal(pgdK41Popcount(0xffffffff, 0), 32);
  assert.equal(pgdK41Popcount(0, 0x1ff), 9);
  assert.equal(pgdK41Popcount(0, 0xffffffff), 9);
  /* gate: popcount >= 5 (signed cmp edi,5 ; jl — 0..41 so sign
     does not bind). */
  assert.equal(wasm.isaac_pgd_k41_gate(0x1f, 0), 1);
  assert.equal(wasm.isaac_pgd_k41_gate(0xf, 0), 0);
  assert.equal(wasm.isaac_pgd_k41_gate(0, 0x1f), 1);
  assert.equal(wasm.isaac_pgd_k41_gate(0, 0xf), 0);
  assert.equal(pgdK41Gate(0x11, 0x3), 0);
  assert.equal(pgdK41Gate(0x1f, 0x1f), 1);
  /* unlock fires: 0x143 at popcount >= 5. */
  assert.equal(wasm.isaac_pgd_k41_unlock_fires(0x1f, 0), 0x143);
  assert.equal(wasm.isaac_pgd_k41_unlock_fires(0xf, 0), 0);
  assert.equal(pgdK41UnlockFires(0, 0x1f), 0x143);
  assert.equal(pgdK41UnlockFires(0x1f, 0x1f), 0x143);
  assert.equal(pgdK41UnlockFires(0x80000000, 0x80000000), 0);
  /* dirty: ALWAYS (the unconditional store @0x92b2d2 runs even when
     no unlock fires). */
  assert.equal(wasm.isaac_pgd_k41_dirty_fires(0, 0), 1);
  assert.equal(wasm.isaac_pgd_k41_dirty_fires(0xf, 0), 1);
  assert.equal(wasm.isaac_pgd_k41_dirty_fires(0xffffffff, 0xffffffff), 1);
  assert.equal(pgdK41DirtyFires(0, 0), 1);
  assert.equal(pgdK41DirtyFires(0xf, 0), 1);
  /* counter-store offsets: 188 -> 0x5ac, 496 -> 0xa7c (base 0x2bc). */
  assert.equal(wasm.isaac_pgd_k41_counter_store_off(188) >>> 0, 0x5ac);
  assert.equal(wasm.isaac_pgd_k41_counter_store_off(496) >>> 0, 0xa7c);
  assert.equal(wasm.isaac_pgd_k41_counter_store_off(0) >>> 0, 0x2bc);
  assert.equal(pgdK41CounterStoreOff(188), 0x5ac);
  assert.equal(pgdK41CounterStoreOff(496), 0xa7c);
});

test("PE truth: v23 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x92b230 ^ 0x92b270);
  for (let n = 0; n < 4000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const seed = pick(rng, 0x100000000);
    const lo = pick(rng, 0x100000000);
    const hi = pick(rng, 0x100000000);
    /* PGDADSED laws across wasm + model + the instruction-stream ref. */
    const expGate = refAdsEdGate(readonlyByte);
    assert.equal(wasm.isaac_pgd_adsed_gate(readonlyByte), expGate,
      `adsed gate ${readonlyByte >>> 0}`);
    assert.equal(pgdAdsEdGate(readonlyByte), expGate,
      `model adsed gate ${readonlyByte >>> 0}`);
    const expOut = refAdsEdOutcome(readonlyByte, seed);
    assert.equal(wasm.isaac_pgd_adsed_outcome(readonlyByte, seed), expOut,
      `adsed outcome ${readonlyByte >>> 0}/${seed >>> 0}`);
    assert.equal(pgdAdsEdOutcome(readonlyByte, seed), expOut,
      `model adsed outcome ${readonlyByte >>> 0}/${seed >>> 0}`);
    const expIdx = refAdsEdStoreIndex(seed);
    assert.equal(wasm.isaac_pgd_adsed_store_index(seed) >>> 0, expIdx,
      `adsed store_index ${seed >>> 0}`);
    assert.equal(pgdAdsEdStoreIndex(seed), expIdx,
      `model adsed store_index ${seed >>> 0}`);
    const expSc = refAdsEdSelfCancelling(seed);
    assert.equal(wasm.isaac_pgd_adsed_self_cancelling(seed), expSc,
      `adsed self_cancelling ${seed >>> 0}`);
    assert.equal(pgdAdsEdSelfCancelling(seed), expSc,
      `model adsed self_cancelling ${seed >>> 0}`);
    const expS0 = refAdsEdSlot0After(readonlyByte, seed);
    assert.equal(wasm.isaac_pgd_adsed_slot0_after(readonlyByte, seed), expS0,
      `adsed slot0_after ${readonlyByte >>> 0}/${seed >>> 0}`);
    assert.equal(pgdAdsEdSlot0After(readonlyByte, seed), expS0,
      `model adsed slot0_after ${readonlyByte >>> 0}/${seed >>> 0}`);
    const expD = refAdsEdDirtyFires(readonlyByte, seed);
    assert.equal(wasm.isaac_pgd_adsed_dirty_fires(readonlyByte, seed), expD,
      `adsed dirty ${readonlyByte >>> 0}/${seed >>> 0}`);
    assert.equal(pgdAdsEdDirtyFires(readonlyByte, seed), expD,
      `model adsed dirty ${readonlyByte >>> 0}/${seed >>> 0}`);
    /* PGDK41 laws across wasm + model + ref. */
    const expPop = refK41Popcount(lo, hi);
    assert.equal(wasm.isaac_pgd_k41_popcount(lo, hi), expPop,
      `k41 popcount ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(pgdK41Popcount(lo, hi), expPop,
      `model k41 popcount ${lo >>> 0}/${hi >>> 0}`);
    const expG = refK41Gate(lo, hi);
    assert.equal(wasm.isaac_pgd_k41_gate(lo, hi), expG,
      `k41 gate ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(pgdK41Gate(lo, hi), expG,
      `model k41 gate ${lo >>> 0}/${hi >>> 0}`);
    const expU = refK41UnlockFires(lo, hi);
    assert.equal(wasm.isaac_pgd_k41_unlock_fires(lo, hi), expU,
      `k41 unlock ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(pgdK41UnlockFires(lo, hi), expU,
      `model k41 unlock ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(wasm.isaac_pgd_k41_dirty_fires(lo, hi), 1);
    assert.equal(pgdK41DirtyFires(lo, hi), 1);
  }
  /* fixed edges the random corpus cannot be trusted to hit. */
  for (let b = 0; b < 41; ++b) {
    const lo = b < 32 ? (1 << b) : 0;
    const hi = b < 32 ? 0 : (1 << (b - 32));
    assert.equal(pgdK41Popcount(lo, hi), 1, `edge bit ${b}`);
    assert.equal(wasm.isaac_pgd_k41_popcount(lo, hi), 1, `edge bit ${b}`);
  }
  assert.equal(pgdK41Popcount(0, 0), 0);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0), 0);
  assert.equal(pgdK41Popcount(0xffffffff, 0x1ff), 41);
  /* hi bits >= 41 (bit 41+ of the 64-bit value) never count. */
  assert.equal(pgdK41Popcount(0, 0x80000000), 0);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0x80000000), 0);
  assert.equal(pgdK41Popcount(0, 0xfffff800), 0);
  assert.equal(wasm.isaac_pgd_k41_popcount(0x80000000, 0), 1);
  /* threshold edges. */
  assert.equal(pgdK41Gate(0xf, 0), 0);            /* popcount 4 */
  assert.equal(pgdK41Gate(0x1f, 0), 1);           /* popcount 5 */
  assert.equal(pgdK41UnlockFires(0xf, 0), 0);
  assert.equal(pgdK41UnlockFires(0x1f, 0), 0x143);
});

test("PE truth: v23 cross-check vs the PGDX v2-era oracles", () => {
  const rng = makeRng(0x92b230 ^ 0x5ec10);
  for (let n = 0; n < 3000; ++n) {
    const readonlyByte = pick(rng, 0x100000000);
    const seed = pick(rng, 0x100000000);
    const lo = pick(rng, 0x100000000);
    const hi = pick(rng, 0x100000000);
    /* PGDADSED laws agree with the v2-era SEC10 oracle: same
       unchecked seed index, same resets-slot0, same self-cancel. */
    const slot = pgdSec10StoreSlot(readonlyByte, seed);
    const out = pgdAdsEdOutcome(readonlyByte, seed);
    /* the v2 sec10 oracle returns asI32(seed): a store at a u32
       index >= 2^31 comes back negative there (conflated with "no
       store"); the v23 outcome keeps the raw u32 index. The two
       must agree on the readonly gate always, and on the store
       decision for low seeds. */
    assert.equal(out < 0, (readonlyByte & 0xff) !== 0,
      `adsed gate sign ${readonlyByte >>> 0}/${seed >>> 0}`);
    if ((seed >>> 0) < 0x80000000) {
      assert.equal(out < 0, slot < 0,
        `adsed sign ${readonlyByte >>> 0}/${seed >>> 0}`);
      if (out >= 0) {
        assert.equal(pgdAdsEdStoreIndex(seed), slot,
          `adsed index ${seed >>> 0}`);
      }
    }
    assert.equal(pgdAdsEdSelfCancelling(seed),
      pgdSec10StoreIsSelfCancelling(readonlyByte, seed) ? 1 : 0,
      `self-cancel ${readonlyByte >>> 0}/${seed >>> 0}`);
    /* the unconditional slot-0 clear is the resets-slot0 law. */
    assert.equal(pgdAdsEdSlot0After(readonlyByte, seed) === 0,
      out >= 0 && pgdSec10ResetsSlot0(),
      `slot0 ${readonlyByte >>> 0}/${seed >>> 0}`);
    /* PGDK41: the popcount/gate/unlock laws are the mask41 laws. */
    const pop = pgdMask41Popcount(lo, hi);
    assert.equal(pgdK41Popcount(lo, hi), pop, `pop ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(pgdK41Gate(lo, hi),
      pgdMask41UnlockNeeded(pop) ? 1 : 0, `gate ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(pgdK41UnlockFires(lo, hi),
      pgdMask41UnlockNeeded(pop) ? PGD_MASK41_UNLOCK_ID : 0,
      `unlock ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(wasm.isaac_pgd_k41_popcount(lo, hi), pop,
      `wasm pop ${lo >>> 0}/${hi >>> 0}`);
    assert.equal(wasm.isaac_pgd_k41_unlock_fires(lo, hi),
      pgdMask41UnlockNeeded(pop) ? PGD_MASK41_UNLOCK_ID : 0,
      `wasm unlock ${lo >>> 0}/${hi >>> 0}`);
  }
});

test("PE truth: v23 mutant — PGDADSED + PGDK41 laws must stay machine-exact", () => {
  /* MM1: a FULL-DWORD readonly test would FAIL 0x100/0x10000 (low
     byte 0); `cmp byte [ecx+1],0` sees LOW BYTE only. */
  assert.equal(pgdAdsEdOutcome(0x100, 5), 0);
  assert.notEqual(pgdAdsEdOutcome(0x100, 5), -1);
  assert.equal(wasm.isaac_pgd_adsed_outcome(0x100, 5), 0);
  assert.equal(pgdAdsEdOutcome(0x10000, 5), 0);
  assert.equal(pgdAdsEdOutcome(0x2, 5), -1);
  assert.equal(pgdAdsEdOutcome(0x1ff, 5), -1);
  assert.equal(wasm.isaac_pgd_adsed_outcome(0xffffffff, 5), -1);
  assert.equal(pgdAdsEdGate(0x100), 1);
  assert.equal(pgdAdsEdGate(0x1), 0);
  /* MM2: a BOUNDS-CLAMPED or REMAPPED index (seed >= 0x50 dropped or
     folded) would break the unchecked +0xf14 byte store — the seed
     IS the raw index (never masked, never bounded). */
  assert.equal(pgdAdsEdStoreIndex(0x50), 0x50);
  assert.equal(pgdAdsEdStoreIndex(0xffffffff), 0xffffffff);
  assert.equal(pgdAdsEdStoreIndex(0x1ff), 0x1ff);
  assert.equal(wasm.isaac_pgd_adsed_store_index(0xffffffff) >>> 0, 0xffffffff);
  assert.equal(wasm.isaac_pgd_adsed_store_index(0x100) >>> 0, 0x100);
  /* MM3: a CONDITIONAL slot-0 clear (skipped when seed==0, or only
     when seed!=0) breaks the UNCONDITIONAL `mov byte
     [ecx+0xf14],0` @0x92b24c: slot0_after must be 0 in EVERY
     stored case, including seed==0 (the self-cancelling store). */
  assert.equal(pgdAdsEdSlot0After(0, 0), 0);
  assert.equal(pgdAdsEdSlot0After(0, 0x50), 0);
  assert.equal(wasm.isaac_pgd_adsed_slot0_after(0, 0), 0);
  assert.equal(pgdAdsEdSlot0After(1, 0), -1);
  assert.equal(pgdAdsEdSlot0After(0x100, 0xffffffff), 0);
  /* MM4: a CONDITIONAL dirty (set only when seed != 0) would break
     the seed==0 stored case — the store + clear both ran, dirty
     still fires. */
  assert.equal(pgdAdsEdDirtyFires(0, 0), 1);
  assert.equal(pgdAdsEdDirtyFires(0, 0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_adsed_dirty_fires(0, 0), 1);
  assert.equal(pgdAdsEdDirtyFires(1, 0), 0);
  /* MM5: popcount over the FULL 64 bits (or a hi word not clipped at
     9 bits) would count hi bit 31 — the loop bound is 0x29 (41
     bits); only hi bits 0..8 participate. */
  assert.equal(pgdK41Popcount(0, 0x80000000), 0);
  assert.equal(pgdK41Popcount(0, 0xffffffff), 9);
  assert.equal(pgdK41Popcount(0, 0x1ff), 9);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0x80000000), 0);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0xffffffff), 9);
  assert.equal(pgdK41Popcount(0x80000000, 0), 1);
  /* MM6: the lo/hi word SPLIT swapped (i<32 reads hi instead of lo,
     or vice versa) would fail word-edge cases. */
  assert.equal(pgdK41Popcount(0x80000000, 0), 1);
  assert.notEqual(pgdK41Popcount(0, 0x80000000), 1);
  assert.equal(pgdK41Popcount(0, 0x100), 1);
  assert.equal(wasm.isaac_pgd_k41_popcount(0, 0x100), 1);
  assert.equal(pgdK41Popcount(0x100, 0), 1);
  /* MM7: the unlock threshold mistyped 5 -> 4 would fire at
     popcount 4; the machine `cmp edi,5 ; jl` needs >= 5. */
  assert.equal(pgdK41Gate(0xf, 0), 0);            /* 4 bits: below */
  assert.notEqual(pgdK41Gate(0xf, 0), 1);
  assert.equal(wasm.isaac_pgd_k41_unlock_fires(0xf, 0), 0);
  assert.equal(pgdK41Gate(0x1f, 0), 1);           /* 5 bits: fires */
  assert.equal(pgdK41UnlockFires(0x1f, 0), 0x143);
  assert.equal(wasm.isaac_pgd_k41_unlock_fires(0x1f, 0), 0x143);
  /* MM8: the unlock id mistyped 0x143 -> 0x144 would fail the
     mask41 record check; the push immediate is 0x143. */
  assert.equal(pgdK41UnlockId(), 0x143);
  assert.notEqual(pgdK41UnlockId(), 0x144);
  assert.equal(pgdK41UnlockFires(0x1f, 0), 0x143);
  assert.equal(PGD_K41_UNLOCK_ID, PGD_MASK41_UNLOCK_ID);
  /* MM9: dirty conditional on the unlock (only when popcount >= 5)
     would fail the gate-closed case — the dirty store @0x92b2d2 is
     UNCONDITIONAL. */
  assert.equal(pgdK41DirtyFires(0xf, 0), 1);      /* gate closed, dirty ON */
  assert.equal(wasm.isaac_pgd_k41_dirty_fires(0xf, 0), 1);
  assert.equal(pgdK41DirtyFires(0, 0), 1);
  assert.equal(wasm.isaac_pgd_k41_dirty_fires(0, 0), 1);
  /* MM10: counter base mistyped 0x2bc -> 0x2c0 would break the
     188 -> 0x5ac / 496 -> 0xa7c offset law and the event-counters
     cross-check. */
  assert.equal(pgdK41CounterBase(), 0x2bc);
  assert.notEqual(pgdK41CounterBase(), 0x2c0);
  assert.equal(PGD_K41_COUNTER_BASE, PGD_OFF_EVENT_COUNTERS);
  assert.equal(pgdK41CounterStoreOff(188), 0x5ac);
  assert.equal(pgdK41CounterStoreOff(496), 0xa7c);
  assert.equal(wasm.isaac_pgd_k41_counter_store_off(188) >>> 0, 0x5ac);
  assert.equal(wasm.isaac_pgd_k41_counter_store_off(496) >>> 0, 0xa7c);
});
/* =====================================================================
   ABI v24 — PGDITAG + PGDIDISP (the PURE decision islands of the
   shared Rebirth-save snapshot reader 0x009e4260; the v8 "next
   measured candidate"; no exact ZHL; inbound from
   TryImportRebirthLocalSave 0x92b2e0 @0x92b574 with ecx = the
   0x4f0-byte snapshot; ret 0x9e4aa1, fail-tail ret 0x9e4ac7)
   Evidence: section-notes/pgd-v24/ (version-tag table: a 16-byte
   stream read vtbl+0x14 @0x9e4282, HOST, into [ebp-0x14], then the
   ten .rdata save headers compared as THREE FULL DWORDs each —
   0xb805bc/0xb8060c (section 2, count 7), 0xb805a8/0xb805f8
   (section 3, count 8), 0xb805e4/0xb80514 (section 4, count 8),
   0xb805d0/0xb80500 (section 5, count 9), 0xb1b98c/0xb80560
   (section 6, count 9); all ten 12-byte bodies are "ISAACNGSAVE0"
   today; a full miss -> the fail tail 0x9e4aa2 (host log
   (1, 0xb80528, buffer) -> 0xa112c0, return 0 @0x9e4ac7).
   Section-record loop 0x9e4485..0x9e45e8: entry gates `test
   eax,eax ; js 0x9e45f2` @0x9e4488/@0x9e448a + `cmp eax,ebx ; jge
   0x9e45f2` @0x9e4490/@0x9e4492 (SIGNED 0 <= prev < elemCount);
   count gate `cmp [ebp-0x20],0 ; jbe next` @0x9e44bf/@0x9e44c3
   (UNSIGNED zero-only); dispatch gate `dec eax ; cmp eax,8 ; ja
   next` @0x9e44cc..@0x9e44d0 (UNSIGNED (section-1) <= 8 -> 0..8)
   through the 9-entry jump table 0x9e4ac8; per-handler UNSIGNED
   cmova clamp + `cmp edi,[ebp-0x20] ; jae` / `cmp <iter>,
   [ebp-0x18] ; jb` loop bounds; byte handlers normalise `cmp
   byte,0 ; setg al` (SIGNED int8 > 0)). The v1/v2 isaac_pgd_reader_*
   laws (0x00927c8a reader, 11 dispatch entries, boundary <= 0xa)
   are a DIFFERENT reader. */

/* Branch-by-branch references, transcribed from the instruction
   streams (NOT from the C++ or the model). The ten .rdata save
   headers were extracted independently from the PE (VA->file via
   the `.rdata` section table); all ten 12-byte bodies currently
   read "ISAACNGSAVE0" = dwords 0x41415349 / 0x53474e43 /
   0x30455641 (little-endian, verified byte-by-byte). */
const REF_IRTAG_DWORDS = [0x41415349, 0x53474e43, 0x30455641];
const REF_IRTAG_SECTIONS = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6];
const REF_IRTAG_COUNTS = [7, 7, 8, 8, 8, 8, 9, 9, 9, 9];
const REF_IRTAG_HEADER_VAS = [
  0x00b805bc, 0x00b8060c, 0x00b805a8, 0x00b805f8, 0x00b805e4,
  0x00b80514, 0x00b805d0, 0x00b80500, 0x00b1b98c, 0x00b80560,
];
/* 0x9e4292..0x9e42a1 (row 0): ecx=header, edx=buffer, edi=0xc;
   `mov eax,[ecx] ; cmp eax,[edx] ; jne next ; add ecx,4 ; add
   edx,4 ; sub edi,4 ; jae` — three FULL dword cmps. */
function refTagCompare(row, d0, d1, d2) {
  return REF_IRTAG_DWORDS[0] === (d0 >>> 0) &&
         REF_IRTAG_DWORDS[1] === (d1 >>> 0) &&
         REF_IRTAG_DWORDS[2] === (d2 >>> 0) ? 1 : 0;
}
function refTagFirstMatch(d0, d1, d2) {
  for (let i = 0; i < 10; ++i) {
    if (refTagCompare(i, d0, d1, d2) === 1) return i;
  }
  return -1;
}
function refTagMatchSection(d0, d1, d2) {
  const m = refTagFirstMatch(d0, d1, d2);
  return m < 0 ? -1 : REF_IRTAG_SECTIONS[m];
}
function refTagMatchCountMax(d0, d1, d2) {
  const m = refTagFirstMatch(d0, d1, d2);
  return m < 0 ? -1 : REF_IRTAG_COUNTS[m];
}
/* 0x9e44c9..0x9e44d6: `mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ;
   ja next ; jmp [eax*4+0x9e4ac8]` — UNSIGNED (section-1) <= 8. */
function refDispatchIndex(section) {
  const biased = (section - 1) >>> 0;
  return biased <= 8 ? biased : -1;
}
/* 0x9e4488/0x9e448a `test eax,eax ; js` + 0x9e4490/0x9e4492 `cmp
   eax,ebx ; jge` — SIGNED 0 <= prev < elemCount. */
function refEntryGate(prevSection, elemCount) {
  const p = prevSection | 0;
  return (p >= 0 && p < elemCount) ? 1 : 0;
}
/* 0x9e44bf/0x9e44c3 `cmp [ebp-0x20],0 ; jbe next` — UNSIGNED. */
function refCountGate(count) {
  return (count >>> 0) !== 0 ? 1 : 0;
}
/* 0x9e4576..0x9e4598 (row 1): `cmp eax,MAX ; mov ecx,MAX ; cmova
   eax,ecx` — UNSIGNED above, negatives pass through. */
function refClamp(count, max) {
  const c = count >>> 0;
  const m = max >>> 0;
  return c > m ? m : c;
}
/* 0x9e4549/0x9e454d (row 0) `cmp byte [ebp-0x21],0 ; setg al` —
   SIGNED int8 test. */
function refByteFlag(raw) {
  const b = (raw & 0xff) << 24 >> 24;
  return b > 0 ? 1 : 0;
}
/* 0x9e4530/0x9e4533 `cmp edi,[ebp-0x20] ; jae` + 0x9e4555/0x9e4558
   `cmp edi,[ebp-0x18] ; jb` — both UNSIGNED, edi advances 1/iter
   for the byte arrays. */
function refByteLoop(avail, clamped) {
  const a = avail >>> 0;
  const c = clamped >>> 0;
  return a < c ? a : c;
}
/* dword arrays: `add edi,4` @0x9e45d0 etc. — off = 4*iters mod 2^32
   with the same two UNSIGNED bounds. Transcribed as the machine's
   incremental loop (exact incl. the u32 wrap); the differential
   drives clamped from the machine-realizable range (0..0x200 — the
   handlers' cmova clamps cap it at <= 0x5f / 0x15b) so the
   reference loop always terminates quickly; the wide clamped edges
   are pinned with the closed form in the fixed asserts below. */
function refDwordLoop(availBytes, clamped) {
  const avail = availBytes >>> 0;
  const cap = clamped >>> 0;
  let iters = 0;
  let off = 0;
  while (off < avail && iters < cap) {
    off = (off + 4) >>> 0;
    iters += 1;
  }
  return iters;
}
const REF_IRDISP_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const REF_IRDISP_TARGETS = [
  0x009e44dd, 0x009e455c, 0x009e4635, 0x009e46b4, 0x009e4739,
  0x009e47b7, 0x009e4835, 0x009e48b3, 0x009e4932,
];
const REF_IRDISP_OFFS = [0x38, 0xec, 0x3c4, 0x268, 0x3f4, 0x3fb, 0x434, 0x44c, 0x49c];
const REF_IRDISP_WIDTHS = [1, 4, 4, 1, 1, 1, 1, 4, 4];
const REF_IRDISP_CLAMPS = [0xb3, 0x5f, 0xc, 0x15b, 7, 0x39, 0x15, 0x14, 1];
const REF_IRDISP_SETG = [1, 0, 0, 1, 1, 1, 1, 0, 0];
const REF_IRDISP_LOGS = [
  0x00b1ba38, 0x00b1ba60, 0x00b1ba60, 0x00b1ba84, 0x00b1babc,
  0x00b1babc, 0x00b1bae4, 0x00b1bb0c, 0x00b1bb34,
];

test("header records the v24 PGDITAG + PGDIDISP evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /PGDITAG/);
  assert.match(h, /PGDIDISP/);
  assert.match(h, /0x009e4260/);
  assert.match(h, /0x9e4ac8/);
  assert.match(h, /0xb805bc/);
  assert.match(h, /ISAACNGSAVE0/);
  assert.match(h, /ISAAC_PGDIDISP_GATE_CMP_VA = 0x009e44cd/);
  assert.match(h, /setg al/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /PGDITAG/);
  assert.match(s, /PGDIDISP/);
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_import_tag_first_match/);
  assert.match(s, /isaac_pgd_import_dispatch_index/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  /* the reader is reachable: exactly one caller, the v6 import. */
  assert.equal(pgdImportReaderVa(), 0x009e4260);
  assert.equal(PGD_IMPORT_READER_VA, 0x009e4260);
  assert.equal(pgdImportReaderCallSiteCount(), 1);
  assert.equal(pgdImportReaderCallSiteVa(), 0x0092b574);
  /* v24 lands the reader's decision islands; the frontier record
     still points at 0x009e4260 (the stage-4 tally loops are the
     same reader's remaining pure land). */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
  /* cross-check vs the v6 PGDCOV written byte counts: the clamp
     MAX * element width must equal the v6 written count 1:1. */
  const written = [
    PGD_IMPORT_WRITTEN_ACHIEVEMENTS, /* 0xb3 */
    PGD_IMPORT_WRITTEN_EVENT,        /* 0x17c = 0x5f dwords x4 */
    PGD_IMPORT_WRITTEN_SEC3,         /* 0x30 = 0xc dwords x4 */
    PGD_IMPORT_WRITTEN_COLLECTION,   /* 0x15b */
    PGD_IMPORT_WRITTEN_SEC5,         /* 7 */
    PGD_IMPORT_WRITTEN_BOSSES,       /* 0x39 */
    PGD_IMPORT_WRITTEN_CHALLENGES,   /* 0x15 */
    PGD_IMPORT_WRITTEN_SEC8,         /* 0x50 = 0x14 dwords x4 */
    PGD_IMPORT_WRITTEN_SEC9,         /* 4 = 1 dword x4 */
  ];
  for (let i = 0; i < PGDIDISP_ENTRIES; ++i) {
    assert.equal(
      PGDIDISP_CLAMP_MAXES[i] * PGDIDISP_WIDTHS[i],
      written[i],
      `v24 row ${i} clamp*width vs v6 written bytes`,
    );
  }
  /* the dispatch rows are snapshot sources: offsets inside the
     0x4f0-byte snapshot, non-overlapping with the +0x4a0 count. */
  for (let i = 0; i < PGDIDISP_ENTRIES; ++i) {
    assert.ok(
      PGDIDISP_STORE_OFFS[i] < PGD_IMPORT_SNAPSHOT_BYTES,
      `row ${i} store offset inside the snapshot`,
    );
  }
  assert.equal(PGDIDISP_STORE_OFFS[0], PGD_OFF_ACHIEVEMENTS);
  /* NOT the v1 reader: 0x00927c8a's dispatch accepts <= 0xa
     (11 sections); 0x009e4260 accepts (section-1) <= 8 (9). */
  assert.equal(pgdReaderSectionDispatched(10), true);
  assert.equal(pgdReaderSectionDispatched(11), true);
  assert.equal(pgdReaderSectionDispatched(12), false);
});

test("PE truth: PGDITAG VA records + tag table + laws across wasm and model", () => {
  /* table shape. */
  assert.equal(PGDITAG_HEADERS, 10);
  assert.equal(PGDITAG_TAG_BYTES, 0xc);
  assert.equal(PGDITAG_TAG_DWORDS, 3);
  assert.equal(PGDITAG_READ_BYTES, 0x10);
  assert.equal(PGDITAG_READ_CALL_VA, 0x009e4282);
  assert.equal(PGDITAG_FIRST_CMP_VA, 0x009e4294);
  assert.equal(PGDITAG_FAIL_LOG_VA, 0x00b80528);
  assert.equal(PGDITAG_FAIL_TAIL_VA, 0x009e4aa2);
  assert.deepEqual(PGDITAG_HEADER_VAS, REF_IRTAG_HEADER_VAS);
  assert.deepEqual(PGDITAG_SECTIONS, REF_IRTAG_SECTIONS);
  assert.deepEqual(PGDITAG_COUNTS, REF_IRTAG_COUNTS);
  assert.deepEqual(PGDITAG_DWORDS[0], REF_IRTAG_DWORDS);
  /* wasm surface. */
  assert.equal(wasm.isaac_pgd_import_tag_header_count(), 10);
  assert.equal(wasm.isaac_pgd_import_tag_compare_bytes(), 0xc);
  assert.equal(wasm.isaac_pgd_import_tag_compare_dwords(), 3);
  assert.equal(wasm.isaac_pgd_import_tag_read_bytes(), 0x10);
  assert.equal(wasm.isaac_pgd_import_tag_read_call_va() >>> 0, 0x009e4282);
  assert.equal(wasm.isaac_pgd_import_tag_first_cmp_va() >>> 0, 0x009e4294);
  assert.equal(wasm.isaac_pgd_import_tag_fail_log_va() >>> 0, 0x00b80528);
  assert.equal(wasm.isaac_pgd_import_tag_fail_tail_va() >>> 0, 0x009e4aa2);
  for (let i = 0; i < 10; ++i) {
    assert.equal(
      wasm.isaac_pgd_import_tag_header_va(i) >>> 0,
      PGDITAG_HEADER_VAS[i],
      `header ${i} VA`,
    );
    assert.equal(pgdImportTagHeaderVa(i), PGDITAG_HEADER_VAS[i], `model header ${i} VA`);
    assert.equal(wasm.isaac_pgd_import_tag_header_section(i), PGDITAG_SECTIONS[i]);
    assert.equal(pgdImportTagHeaderSection(i), PGDITAG_SECTIONS[i]);
    assert.equal(wasm.isaac_pgd_import_tag_header_count_max(i), PGDITAG_COUNTS[i]);
    assert.equal(pgdImportTagHeaderCountMax(i), PGDITAG_COUNTS[i]);
    for (let p = 0; p < 3; ++p) {
      assert.equal(
        wasm.isaac_pgd_import_tag_header_dword(i, p) >>> 0,
        PGDITAG_DWORDS[i][p] >>> 0,
        `header ${i} dword ${p}`,
      );
      assert.equal(
        pgdImportTagHeaderDword(i, p),
        PGDITAG_DWORDS[i][p] >>> 0,
        `model header ${i} dword ${p}`,
      );
    }
    /* out-of-range table accessors are inert. */
    assert.equal(wasm.isaac_pgd_import_tag_header_va(10), 0);
    assert.equal(wasm.isaac_pgd_import_tag_header_section(0xffffffff), 0);
    assert.equal(wasm.isaac_pgd_import_tag_header_count_max(0x100), 0);
    assert.equal(wasm.isaac_pgd_import_tag_header_dword(0, 3), 0);
  }
  /* the FULL-DWORD compare: the real tag matches EVERY row; a one
     dword difference fails every row. */
  for (let i = 0; i < 10; ++i) {
    assert.equal(
      wasm.isaac_pgd_import_tag_compare(i, 0x41415349, 0x53474e43, 0x30455641),
      1,
      `row ${i} real tag`,
    );
    assert.equal(
      wasm.isaac_pgd_import_tag_compare(i, 0x41415349, 0x53474e43, 0x30455642),
      0,
      `row ${i} d2 flip`,
    );
    assert.equal(
      pgdImportTagCompare(i, 0x41415349, 0x53474e44, 0x30455641),
      0,
      `model row ${i} d1 flip`,
    );
  }
  /* first-match in PE order: row 0 wins the real tag; any flipped
     dword is a full miss (the fail tail). */
  assert.equal(wasm.isaac_pgd_import_tag_first_match(0x41415349, 0x53474e43, 0x30455641), 0);
  assert.equal(pgdImportTagFirstMatch(0x41415349, 0x53474e43, 0x30455641), 0);
  assert.equal(wasm.isaac_pgd_import_tag_first_match(0x41415349, 0x53474e43, 0x30455642), -1);
  assert.equal(pgdImportTagFirstMatch(0x41415348, 0x53474e43, 0x30455641), -1);
  assert.equal(pgdImportTagFirstMatch(0x41415349, 0x53474e43, 0x30455641 + 0x100), -1);
  assert.equal(wasm.isaac_pgd_import_tag_match_section(0x41415349, 0x53474e43, 0x30455641), 2);
  assert.equal(pgdImportTagMatchSection(0x41415349, 0x53474e43, 0x30455641), 2);
  assert.equal(wasm.isaac_pgd_import_tag_match_count_max(0x41415349, 0x53474e43, 0x30455641), 7);
  assert.equal(pgdImportTagMatchCountMax(0x41415349, 0x53474e43, 0x30455641), 7);
  assert.equal(wasm.isaac_pgd_import_tag_match_section(0, 0, 0), -1);
  assert.equal(wasm.isaac_pgd_import_tag_match_count_max(0xffffffff, 0, 0), -1);
  assert.equal(pgdImportTagMatchSection(0xffffffff, 0xffffffff, 0xffffffff), -1);
});

test("PE truth: PGDIDISP dispatch rows + gate widths across wasm and model", () => {
  assert.equal(PGDIDISP_TABLE_VA, 0x009e4ac8);
  assert.equal(PGDIDISP_ENTRIES, 9);
  assert.equal(PGDIDISP_GATE_CMP_VA, 0x009e44cd);
  assert.equal(PGDIDISP_GATE_JA_VA, 0x009e44d0);
  assert.equal(PGDIDISP_ENTRY_JS_VA, 0x009e448a);
  assert.equal(PGDIDISP_ENTRY_JGE_VA, 0x009e4492);
  assert.equal(PGDIDISP_COUNT_CMP_VA, 0x009e44bf);
  assert.equal(PGDIDISP_COUNT_JBE_VA, 0x009e44c3);
  assert.equal(PGDIDISP_LOOP_JAE_VA, 0x009e4530);
  assert.equal(PGDIDISP_LOOP_JB_VA, 0x009e4555);
  assert.equal(wasm.isaac_pgd_import_dispatch_table_va() >>> 0, 0x009e4ac8);
  assert.equal(wasm.isaac_pgd_import_dispatch_entries(), 9);
  assert.deepEqual(PGDIDISP_SECTIONS, REF_IRDISP_SECTIONS);
  assert.deepEqual(PGDIDISP_TARGET_VAS, REF_IRDISP_TARGETS);
  assert.deepEqual(PGDIDISP_STORE_OFFS, REF_IRDISP_OFFS);
  assert.deepEqual(PGDIDISP_WIDTHS, REF_IRDISP_WIDTHS);
  assert.deepEqual(PGDIDISP_CLAMP_MAXES, REF_IRDISP_CLAMPS);
  assert.deepEqual(PGDIDISP_SETG, REF_IRDISP_SETG);
  assert.deepEqual(PGDIDISP_LOG_VAS, REF_IRDISP_LOGS);
  /* dispatch index law — UNSIGNED (section-1) <= 8. WIDE drives:
     section 0 / 10 / 0x100 / 0x80000000 / 0xffffffff all skip. */
  for (let s = 1; s <= 9; ++s) {
    assert.equal(wasm.isaac_pgd_import_dispatch_index(s), s - 1, `section ${s}`);
    assert.equal(pgdImportDispatchIndex(s), s - 1, `model section ${s}`);
  }
  assert.equal(wasm.isaac_pgd_import_dispatch_index(0), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(10), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(11), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(0x100), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(0x80000000), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(0xffffffff), -1);
  assert.equal(pgdImportDispatchIndex(0), -1);
  assert.equal(pgdImportDispatchIndex(10), -1);
  assert.equal(pgdImportDispatchIndex(0xffffffff), -1);
  /* handler rows across wasm + model. */
  assert.equal(wasm.isaac_pgd_import_handler_count(), 9);
  for (let i = 0; i < 9; ++i) {
    assert.equal(wasm.isaac_pgd_import_handler_section(i), PGDIDISP_SECTIONS[i]);
    assert.equal(wasm.isaac_pgd_import_handler_target_va(i) >>> 0, PGDIDISP_TARGET_VAS[i]);
    assert.equal(wasm.isaac_pgd_import_handler_store_off(i), PGDIDISP_STORE_OFFS[i]);
    assert.equal(wasm.isaac_pgd_import_handler_elem_width(i), PGDIDISP_WIDTHS[i]);
    assert.equal(wasm.isaac_pgd_import_handler_clamp_max(i), PGDIDISP_CLAMP_MAXES[i]);
    assert.equal(wasm.isaac_pgd_import_handler_flag_normalize(i), PGDIDISP_SETG[i]);
    assert.equal(wasm.isaac_pgd_import_handler_log_va(i) >>> 0, PGDIDISP_LOG_VAS[i]);
    assert.equal(pgdImportHandlerSection(i), PGDIDISP_SECTIONS[i]);
    assert.equal(pgdImportHandlerTargetVa(i), PGDIDISP_TARGET_VAS[i]);
    assert.equal(pgdImportHandlerStoreOff(i), PGDIDISP_STORE_OFFS[i]);
    assert.equal(pgdImportHandlerElemWidth(i), PGDIDISP_WIDTHS[i]);
    assert.equal(pgdImportHandlerClampMax(i), PGDIDISP_CLAMP_MAXES[i]);
    assert.equal(pgdImportHandlerFlagNormalize(i), PGDIDISP_SETG[i]);
    assert.equal(pgdImportHandlerLogVa(i), PGDIDISP_LOG_VAS[i]);
  }
  /* inert out-of-range rows. */
  assert.equal(wasm.isaac_pgd_import_handler_target_va(9), 0);
  assert.equal(wasm.isaac_pgd_import_handler_store_off(0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_import_handler_flag_normalize(0x100), 0);
  /* entry gate — SIGNED 0 <= prev < elemCount; a negative prev
     (0x80000000 / 0xffffffff as int32) finishes the reader. */
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(0, 7), 1);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(6, 7), 1);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(7, 7), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(8, 7), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(9, 9), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(-1, 9), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(0x7fffffff, 9), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(0x80000000, 9), 0);
  assert.equal(wasm.isaac_pgd_import_section_entry_gate(0xffffffff, 9), 0);
  assert.equal(pgdImportSectionEntryGate(-1, 7), 0);
  assert.equal(pgdImportSectionEntryGate(0xffffffff, 7), 0);
  assert.equal(pgdImportSectionEntryGate(3, 9), 1);
  assert.equal(pgdImportSectionEntryGate(9, 9), 0);
  /* count gate — UNSIGNED: only exact 0 skips; 0x80000000 and
     0xffffffff (negative as int32) still pass. */
  assert.equal(wasm.isaac_pgd_import_section_count_gate(0), 0);
  assert.equal(wasm.isaac_pgd_import_section_count_gate(1), 1);
  assert.equal(wasm.isaac_pgd_import_section_count_gate(0x100), 1);
  assert.equal(wasm.isaac_pgd_import_section_count_gate(0x80000000), 1);
  assert.equal(wasm.isaac_pgd_import_section_count_gate(0xffffffff), 1);
  assert.equal(pgdImportSectionCountGate(0), 0);
  assert.equal(pgdImportSectionCountGate(0xffffffff), 1);
  /* clamp — UNSIGNED cmova: 0x80000000 / 0xffffffff FOLD to max;
     a signed clamp would pass them through. */
  assert.equal(wasm.isaac_pgd_import_clamp(0, 0xb3), 0);
  assert.equal(wasm.isaac_pgd_import_clamp(0xb3, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_clamp(0xb4, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_clamp(0x100, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_clamp(0x1ff, 0x5f), 0x5f);
  assert.equal(wasm.isaac_pgd_import_clamp(0xffffffff, 7), 7);
  assert.equal(wasm.isaac_pgd_import_clamp(0x80000000, 7), 7);
  assert.equal(wasm.isaac_pgd_import_clamp(0xffffffff, 1), 1);
  assert.equal(pgdImportClamp(0xffffffff, 0x15b), 0x15b);
  assert.equal(pgdImportClamp(0xc, 0xc), 0xc);
  assert.equal(pgdImportClamp(0xd, 0xc), 0xc);
  /* byte flag — SIGNED setg: 0x80..0xff are NOT > 0; WIDE values
     (0x100/0x1ff/0x80000000/0xffffffff) test the low-byte width. */
  assert.equal(wasm.isaac_pgd_import_byte_flag(0), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(1), 1);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x7f), 1);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x80), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0xff), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x100), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x1ff), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x80000000), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0xffffffff), 0);
  assert.equal(pgdImportByteFlag(0x100), 0);
  assert.equal(pgdImportByteFlag(0x1ff), 0);
  assert.equal(pgdImportByteFlag(0x81), 0);
  assert.equal(pgdImportByteFlag(0x7f), 1);
  assert.equal(pgdImportByteFlag(0x80), 0);
  /* byte-array loop bounds — UNSIGNED min(avail, clamped). */
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(0, 0xb3), 0);
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(1, 0xb3), 1);
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(0xb3, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(0xb4, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(0xffffffff, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(0x100, 0xb3), 0xb3);
  assert.equal(pgdImportByteLoopIterations(0xffffffff, 7), 7);
  assert.equal(pgdImportByteLoopIterations(0, 7), 0);
  /* dword-array loop bounds — 4-byte edi stride, UNSIGNED; avail is
     BYTES, the u32 wrap at avail >= 0xfffffffc is preserved. */
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0, 5), 0);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(4, 5), 1);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(5, 5), 2);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(8, 5), 2);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(9, 5), 3);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xffffffff, 5), 5);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xfffffffc, 5), 5);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xfffffffe, 2), 2);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xfffffffd, 3), 3);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(3, 2), 1);
  assert.equal(pgdImportDwordLoopIterations(0xffffffff, 0x5f), 0x5f);
  assert.equal(pgdImportDwordLoopIterations(0, 0x5f), 0);
  assert.equal(pgdImportDwordLoopIterations(0x17c, 0x5f), 0x5f);
  /* wide clamped corners — the model/wasm closed form is O(1) and
     exact; the machine's avail bound never binds at avail >=
     0xfffffffd (not a multiple of 4): iterations = clamped. */
  assert.equal(pgdImportDwordLoopIterations(0xfffffffd, 0xffffffff), 0xffffffff);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xfffffffd, 0xffffffff) >>> 0, 0xffffffff);
  assert.equal(pgdImportDwordLoopIterations(0xfffffffe, 0x100000000 - 1), 0xffffffff);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xffffffff, 1), 1);
  assert.equal(pgdImportDwordLoopIterations(0xffffffff, 1), 1);
});

test("PE truth: v24 randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x9e4260);
  const tagDwords = [
    0x41415349, 0x53474e43, 0x30455641, /* the real header */
    0x41415348, 0x53474e44, 0x30455642, 0x30455641 + 0x100, 0x100, 0x1ff,
    0x80000000, 0xffffffff, 0, 1, 0xb3, 0x15b,
  ];
  const sections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0x100, 0x80000000, 0xffffffff];
  const elemCounts = [7, 8, 9];
  for (let n = 0; n < 4000; ++n) {
    const d0 = tagDwords[pick(rng, tagDwords.length)];
    const d1 = tagDwords[pick(rng, tagDwords.length)];
    const d2 = tagDwords[pick(rng, tagDwords.length)];
    /* PGDITAG laws across wasm + model + the stream ref. */
    const expFm = refTagFirstMatch(d0, d1, d2);
    assert.equal(wasm.isaac_pgd_import_tag_first_match(d0, d1, d2), expFm,
      `tag first_match ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    assert.equal(pgdImportTagFirstMatch(d0, d1, d2), expFm,
      `model tag first_match ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    const expSec = refTagMatchSection(d0, d1, d2);
    assert.equal(wasm.isaac_pgd_import_tag_match_section(d0, d1, d2), expSec,
      `tag section ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    assert.equal(pgdImportTagMatchSection(d0, d1, d2), expSec,
      `model tag section ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    const expC = refTagMatchCountMax(d0, d1, d2);
    assert.equal(wasm.isaac_pgd_import_tag_match_count_max(d0, d1, d2), expC,
      `tag count ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    assert.equal(pgdImportTagMatchCountMax(d0, d1, d2), expC,
      `model tag count ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    /* PGDIDISP laws across wasm + model + the stream ref. */
    const section = sections[pick(rng, sections.length)];
    const expD = refDispatchIndex(section);
    assert.equal(wasm.isaac_pgd_import_dispatch_index(section), expD,
      `dispatch ${section >>> 0}`);
    assert.equal(pgdImportDispatchIndex(section), expD,
      `model dispatch ${section >>> 0}`);
    const elemCount = elemCounts[pick(rng, elemCounts.length)];
    const expE = refEntryGate(section, elemCount);
    assert.equal(wasm.isaac_pgd_import_section_entry_gate(section, elemCount), expE,
      `entry ${section >>> 0}/${elemCount}`);
    assert.equal(pgdImportSectionEntryGate(section, elemCount), expE,
      `model entry ${section >>> 0}/${elemCount}`);
    const count = pick(rng, 0x100000000);
    const expG = refCountGate(count);
    assert.equal(wasm.isaac_pgd_import_section_count_gate(count), expG,
      `count gate ${count >>> 0}`);
    assert.equal(pgdImportSectionCountGate(count), expG,
      `model count gate ${count >>> 0}`);
    const max = PGDIDISP_CLAMP_MAXES[pick(rng, PGDIDISP_CLAMP_MAXES.length)];
    const expCl = refClamp(count, max);
    assert.equal(wasm.isaac_pgd_import_clamp(count, max) >>> 0, expCl >>> 0,
      `clamp ${count >>> 0}/${max >>> 0}`);
    assert.equal(pgdImportClamp(count, max) >>> 0, expCl >>> 0,
      `model clamp ${count >>> 0}/${max >>> 0}`);
    const raw = pick(rng, 0x100000000);
    const expB = refByteFlag(raw);
    assert.equal(wasm.isaac_pgd_import_byte_flag(raw), expB,
      `byte flag ${raw >>> 0}`);
    assert.equal(pgdImportByteFlag(raw), expB,
      `model byte flag ${raw >>> 0}`);
    const avail = pick(rng, 0x100000000);
    const clampedWide = pick(rng, 0x100000000);
    /* machine-realizable clamped for the reference sim: the
       handlers' cmova clamps cap clamped at <= 0x5f (dword rows)
       / 0x15b (byte rows); 0x200 covers both. The wide clamped
       corners are pinned in the fixed edges / closed-form asserts. */
    const clamped = pick(rng, 0x201);
    const expBl = refByteLoop(avail, clamped);
    assert.equal(wasm.isaac_pgd_import_byte_loop_iterations(avail, clamped) >>> 0,
      expBl >>> 0, `byte loop ${avail >>> 0}/${clamped >>> 0}`);
    assert.equal(pgdImportByteLoopIterations(avail, clamped) >>> 0, expBl >>> 0,
      `model byte loop ${avail >>> 0}/${clamped >>> 0}`);
    const expDl = refDwordLoop(avail, clamped);
    assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(avail, clamped) >>> 0,
      expDl >>> 0, `dword loop ${avail >>> 0}/${clamped >>> 0}`);
    assert.equal(pgdImportDwordLoopIterations(avail, clamped) >>> 0, expDl >>> 0,
      `model dword loop ${avail >>> 0}/${clamped >>> 0}`);
    /* the O(1) law agrees with itself across wasm and model at the
       wide clamped corners too. */
    assert.equal(
      wasm.isaac_pgd_import_dword_loop_iterations(avail, clampedWide) >>> 0,
      pgdImportDwordLoopIterations(avail, clampedWide) >>> 0,
      `dword loop wide ${avail >>> 0}/${clampedWide >>> 0}`);
    /* per-row clamp law across wasm + model. */
    const idx = pick(rng, 9);
    const expRow = refClamp(count, REF_IRDISP_CLAMPS[idx]);
    assert.equal(wasm.isaac_pgd_import_handler_clamp_max(idx), REF_IRDISP_CLAMPS[idx]);
    assert.equal(pgdImportHandlerClampMax(idx), REF_IRDISP_CLAMPS[idx]);
    assert.equal(pgdImportClamp(count, REF_IRDISP_CLAMPS[idx]) >>> 0, expRow >>> 0);
  }
  /* fixed edges the random corpus cannot be trusted to hit. */
  assert.equal(wasm.isaac_pgd_import_tag_first_match(0x41415349, 0x53474e43, 0x30455641), 0);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(9), 8);
  assert.equal(pgdImportDispatchIndex(9), 8);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(0x80000001), -1);
  assert.equal(pgdImportDispatchIndex(0x80000001), -1);
  assert.equal(wasm.isaac_pgd_import_dword_loop_iterations(0xfffffffd, 3), 3);
  assert.equal(pgdImportDwordLoopIterations(0xfffffffd, 3), 3);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_import_clamp(0x80000000, 1), 1);
  /* the v1 reader must stay distinct: it dispatches 10 and 11. */
  assert.equal(wasm.isaac_pgd_reader_section_dispatched(10), 1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(10), -1);
  assert.equal(wasm.isaac_pgd_reader_section_dispatched(11), 1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(11), -1);
  assert.equal(wasm.isaac_pgd_reader_section_dispatched(12), 0);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(12), -1);
});

test("PE truth: v24 mutant — PGDITAG + PGDIDISP laws must stay machine-exact", () => {
  /* MM1: a FIRST-DWORD-ONLY tag compare would match a header whose
     d1/d2 differ; the machine compares all three FULL dwords
     (`cmp eax,[edx] ; jne` x3). */
  assert.equal(pgdImportTagCompare(0, 0x41415349, 0x53474e43, 0x30455641), 1);
  assert.equal(pgdImportTagCompare(0, 0x41415349, 0x53474e43, 0x30455642), 0);
  assert.equal(pgdImportTagCompare(0, 0x41415349, 0x53474e44, 0x30455641), 0);
  assert.equal(pgdImportTagCompare(0, 0x41415348, 0x53474e43, 0x30455641), 0);
  assert.equal(pgdImportTagCompare(5, 0x41415349, 0x53474e43, 0x30455641), 1);
  assert.equal(wasm.isaac_pgd_import_tag_first_match(0x41415349, 0x53474e44, 0x30455641), -1);
  /* MM2: a BYTE-REVERSED header (endianness) would never match the
     read tag — the little-endian dwords 0x41415349/0x53474e43/
     0x30455641 ARE "ISAACNGSAVE0". */
  assert.equal(pgdImportTagHeaderDword(0, 0), 0x41415349);
  assert.equal(pgdImportTagHeaderDword(0, 1), 0x53474e43);
  assert.equal(pgdImportTagHeaderDword(0, 2), 0x30455641);
  assert.notEqual(pgdImportTagHeaderDword(0, 0), 0x49415341);
  assert.equal(pgdImportTagFirstMatch(0x41415349, 0x53474e43, 0x30455641), 0);
  assert.equal(wasm.isaac_pgd_import_tag_first_match(0x41415349, 0x53474e43, 0x30455641), 0);
  /* MM3: a dispatch bound of (section-1) <= 9 would dispatch section
     10; the machine `cmp eax,8 ; ja` allows only 1..9. */
  assert.equal(pgdImportDispatchIndex(9), 8);
  assert.equal(pgdImportDispatchIndex(10), -1);
  assert.equal(pgdImportDispatchIndex(1), 0);
  assert.equal(pgdImportDispatchIndex(0), -1);
  assert.equal(wasm.isaac_pgd_import_dispatch_index(10), -1);
  assert.equal(pgdImportDispatchIndex(0x80000000), -1);
  assert.notEqual(pgdImportDispatchIndex(10), 9);
  assert.equal(PGDIDISP_ENTRIES, 9);
  /* MM4: a NONZERO byte flag (raw & 0xff != 0) would flag 0x80..0xff
     (negative as int8); the machine `setg` needs SIGNED > 0. */
  assert.equal(pgdImportByteFlag(0x7f), 1);
  assert.equal(pgdImportByteFlag(0x80), 0);
  assert.equal(pgdImportByteFlag(0xff), 0);
  assert.equal(pgdImportByteFlag(0x1ff), 0);
  assert.equal(pgdImportByteFlag(0x100), 0);
  assert.equal(pgdImportByteFlag(0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_import_byte_flag(0x1ff), 0);
  assert.equal(pgdImportByteFlag(1), 1);
  /* the reader's signed byte normalisation agrees with v1's law. */
  assert.equal(pgdImportByteFlag(0x80), wasm.isaac_pgd_reader_bool_normalize(0x80));
  assert.equal(pgdImportByteFlag(0x7f), wasm.isaac_pgd_reader_bool_normalize(0x7f));
  assert.equal(pgdImportByteFlag(0x1ff), wasm.isaac_pgd_reader_bool_normalize(0x1ff));
});

/* ===== v25o PGDIMP: TryImportRebirthLocalSave (0x0092b2e0) residual
 * pure islands — pre-read setup (path suffix scan + Rebirth rewrite),
 * file-open result gates, post-import success-path stores. Evidence:
 * section-notes/pgd-wave16o-92b2e0/. PE-truth refs are transcribed
 * from disasm-92b2e0-import-full.txt branch by branch: the suffix scan
 * `cmp eax,0x1c ; jb` + `add eax,-0x1c` + six FULL-dword compares
 * (0x92b3f0..0x92b3ff) + backward `dec edi`; the null-handle abort
 * `test edi,edi ; je 0x92b7ec` (0x92b53d); the io gate `test al,al ;
 * je` (LOW BYTE) + `test eax,eax ; js` (SIGNED); the post-read gate
 * `cmp byte [ebp-0x4f1],0 ; je` (0x92b5b9); changesmade `mov byte
 * [edi],1` (0x92b752); the global-save fence (0x92b755/0x92b75b/
 * 0x92b77a); the save-select chain (0x92b780/0x92b785 LOW BYTE,
 * 0x92b7ac FULL DWORD, 0x92b7b1 LOW BYTE); the result byte
 * `mov al,[ebp-0x4f1]` (0x92b8fe). All expected values below are
 * computed from the model oracle, not from the wasm. */
test("PE truth: v25o PGDIMP — importer residual islands (pins + differential)", () => {
  const lit = (name, value) => {
    const h = readFileSync(header, "utf8");
    assert.match(h, new RegExp(name));
    assert.match(h, new RegExp(value));
  };
  lit("ISAAC_PGDIMP_SUFFIX_PATTERN_VA", "0x00b6d0d8u");
  lit("ISAAC_PGDIMP_SUFFIX_PATTERN_BYTES", "0x1c");
  lit("ISAAC_PGDIMP_SUFFIX_COMPARE_BYTES", "0x18");
  lit("ISAAC_PGDIMP_SUFFIX_SCAN_STEP", "0xffffffffu");
  lit("ISAAC_PGDIMP_SUFFIX_FIRST_CMP_VA", "0x0092b3e5u");
  lit("ISAAC_PGDIMP_SUFFIX_REPLACE_VA", "0x0092b45fu");
  lit("ISAAC_PGDIMP_SUFFIX_REPLACE_POS_LEN", "0x1c");
  lit("ISAAC_PGDIMP_REBIRTH_STR_VA", "0x00b7b024u");
  lit("ISAAC_PGDIMP_REBIRTH_STR_LEN", "0x18");
  lit("ISAAC_PGDIMP_OPEN_GATE_VA", "0x0092b53du");
  lit("ISAAC_PGDIMP_OPEN_FAIL_VA", "0x0092b7ecu");
  lit("ISAAC_PGDIMP_OPEN_STATE_CALL_VA", "0x0092b54cu");
  lit("ISAAC_PGDIMP_OPEN_STATE_GATE_VA", "0x0092b54eu");
  lit("ISAAC_PGDIMP_STREAM_POS_CALL_VA", "0x0092b555u");
  lit("ISAAC_PGDIMP_STREAM_POS_GATE_VA", "0x0092b55eu");
  lit("ISAAC_PGDIMP_IO_CALL_PRE_VA", "0x0092b569u");
  lit("ISAAC_PGDIMP_IO_CALL_POST_VA", "0x0092b5a9u");
  lit("ISAAC_PGDIMP_PRE_READ_COUNT", "1");
  lit("ISAAC_PGDIMP_POST_READ_COUNT", "8");
  lit("ISAAC_PGDIMP_POST_READ_GATE_VA", "0x0092b5b9u");
  lit("ISAAC_PGDIMP_POST_READ_FAIL_VA", "0x0092b7e6u");
  lit("ISAAC_PGDIMP_CHANGESMADE_STORE_VA", "0x0092b752u");
  lit("ISAAC_PGDIMP_CHANGESMADE_STORE_VALUE", "1");
  lit("ISAAC_PGDIMP_SAVE_SELECT_CMP_VA", "0x0092b780u");
  lit("ISAAC_PGDIMP_SAVE_SELECT_0F8C_CMP_VA", "0x0092b785u");
  lit("ISAAC_PGDIMP_SAVE_SELECT_OBJ_VA", "0x0092b7a3u");
  lit("ISAAC_PGDIMP_SAVE_SELECT_OBJ_CMP_VA", "0x0092b7acu");
  lit("ISAAC_PGDIMP_SAVE_SELECT_GLOBAL_VA", "0x0092b7b1u");
  lit("ISAAC_PGDIMP_EVENT_COUNTER_CALL_VA", "0x0092b770u");
  lit("ISAAC_PGDIMP_GLOBAL_SAVE_PTR_VA", "0x00c7169cu");
  lit("ISAAC_PGDIMP_GLOBAL_SAVE_FIELD_OFF", "0x2a378");
  lit("ISAAC_PGDIMP_RETURN1_VA_A", "0x0092b7c7u");
  lit("ISAAC_PGDIMP_RETURN1_VA_B", "0x0092b7ddu");
  /* model consts mirror the header. */
  assert.equal(PGDIMP_SUFFIX_PATTERN_VA, 0xb6d0d8);
  assert.equal(PGDIMP_SUFFIX_PATTERN_BYTES, 0x1c);
  assert.equal(PGDIMP_SUFFIX_COMPARE_BYTES, 0x18);
  assert.equal(PGDIMP_SUFFIX_SCAN_STEP, 0xffffffff);
  assert.equal(PGDIMP_REBIRTH_STR_LEN, 0x18);
  assert.equal(PGDIMP_OPEN_FAIL_VA, 0x92b7ec);
  assert.equal(PGDIMP_POST_READ_COUNT, 8);
  assert.equal(PGDIMP_GLOBAL_SAVE_FIELD_OFF, 0x2a378);
  /* Island 1 — suffix pattern + scan + rewrite. */
  assert.equal(pgdImportSuffixCompareLen(), 0x18);
  assert.equal(wasm.isaac_pgd_import_suffix_compare_len(), 0x18);
  assert.equal(pgdImportSuffixPatternByte(0), 0x42); /* 'B' */
  assert.equal(pgdImportSuffixPatternByte(0x17), 0x61); /* 'a' */
  assert.equal(pgdImportSuffixPatternByte(0x18), 0x6e); /* 'n' — never compared */
  assert.equal(pgdImportSuffixPatternByte(0x1b), 0x2b); /* '+' */
  assert.equal(pgdImportSuffixPatternByte(0x1c), 0);
  assert.equal(wasm.isaac_pgd_import_suffix_pattern_byte(0x1c), 0);
  assert.equal(wasm.isaac_pgd_import_suffix_pattern_byte(0x1b), 0x2b);
  const W0 = [0x646e6942, 0x20676e69, 0x4920666f, 0x63616173, 0x70655220, 0x61746e65];
  assert.equal(pgdImportSuffixWindowMatch(...W0), 1);
  assert.equal(wasm.isaac_pgd_import_suffix_window_match(...W0), 1);
  assert.equal(pgdImportSuffixWindowMatch(W0[0] ^ 1, W0[1], W0[2], W0[3], W0[4], W0[5]), 0);
  assert.equal(pgdImportSuffixWindowMatch(W0[0], W0[1], W0[2], W0[3], W0[4], W0[5] ^ 1), 0);
  assert.equal(pgdImportSuffixWindowMatch(0x100, W0[1], W0[2], W0[3], W0[4], W0[5]), 0);
  assert.equal(pgdImportSuffixWindowMatch(W0[0], W0[1], W0[2], W0[3], W0[4], 0x2b65636e), 0); /* d6 "nce+" never read */
  assert.equal(pgdImportSuffixScanStart(0x1b), 0xffffffff);
  assert.equal(pgdImportSuffixScanStart(0x1c), 0);
  assert.equal(pgdImportSuffixScanStart(0x1d), 1);
  assert.equal(pgdImportSuffixScanStart(0x100), 0xe4);
  assert.equal(pgdImportSuffixScanStart(0x80000000), 0x7fffffe4);
  assert.equal(pgdImportSuffixScanStart(0xffffffff), 0xffffffe3);
  assert.equal(wasm.isaac_pgd_import_suffix_scan_start(0x100), 0xe4);
  assert.equal(wasm.isaac_pgd_import_suffix_scan_start(0xffffffff) >>> 0, 0xffffffe3);
  assert.equal(pgdImportSuffixScanStep(), 0xffffffff);
  assert.equal(wasm.isaac_pgd_import_suffix_scan_step() >>> 0, 0xffffffff);
  assert.equal(pgdImportSuffixFirstCmpVa(), 0x0092b3e5);
  assert.equal(wasm.isaac_pgd_import_suffix_first_cmp_va(), 0x0092b3e5);
  assert.equal(pgdImportSuffixReplaceVa(), 0x0092b45f);
  assert.equal(wasm.isaac_pgd_import_suffix_replace_va(), 0x0092b45f);
  assert.equal(pgdImportSuffixReplacePosLen(), 0x1c);
  assert.equal(wasm.isaac_pgd_import_suffix_replace_pos_len(), 0x1c);
  assert.equal(pgdImportRebirthReplacementLen(), 0x18);
  assert.equal(wasm.isaac_pgd_import_rebirth_replacement_len(), 0x18);
  assert.equal(pgdImportRebirthReplaceLen(0x100, 1), 0xfc);
  assert.equal(wasm.isaac_pgd_import_rebirth_replace_len(0x100, 1), 0xfc);
  assert.equal(pgdImportRebirthReplaceLen(0x100, 0), 0x100);
  assert.equal(pgdImportRebirthReplaceLen(0x1c, 1), 0x18);
  assert.equal(pgdImportRebirthReplaceLen(0x1b, 1), 0x1b);
  assert.equal(pgdImportRebirthReplaceLen(0xffffffff, 1), 0xfffffffb);
  assert.equal(pgdImportRebirthReplaceLen(4, 0), 4);
  /* Island 2 — file-open result gates. */
  assert.equal(pgdImportOpenGateVa(), 0x0092b53d);
  assert.equal(wasm.isaac_pgd_import_open_gate_va(), 0x0092b53d);
  assert.equal(pgdImportOpenFailVa(), 0x0092b7ec);
  assert.equal(wasm.isaac_pgd_import_open_fail_va(), 0x0092b7ec);
  assert.equal(pgdImportOpenSucceeded(0), 0);
  assert.equal(pgdImportOpenSucceeded(1), 1);
  assert.equal(pgdImportOpenSucceeded(0x100), 1);
  assert.equal(pgdImportOpenSucceeded(0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_import_open_succeeded(0x100), 1);
  assert.equal(pgdImportOpenStateCallVa(), 0x0092b54c);
  assert.equal(pgdImportOpenStateGateVa(), 0x0092b54e);
  assert.equal(pgdImportStreamPosCallVa(), 0x0092b555);
  assert.equal(pgdImportStreamPosGateVa(), 0x0092b55e);
  assert.equal(pgdImportFileIoGate(1, 0), 1);
  assert.equal(pgdImportFileIoGate(1, 0x7fffffff), 1);
  assert.equal(pgdImportFileIoGate(1, 0x80000000), 0);
  assert.equal(pgdImportFileIoGate(1, 0xffffffff), 0);
  assert.equal(pgdImportFileIoGate(0, 5), 0);
  assert.equal(pgdImportFileIoGate(0x100, 5), 0);
  assert.equal(pgdImportFileIoGate(0x1ff, 5), 1);
  assert.equal(pgdImportFileIoGate(0x1ff, 0x80000000), 0);
  assert.equal(pgdImportFileIoGate(0xff, 0xffffffff), 0);
  assert.equal(pgdImportFileIoGate(0, 0x80000000), 0);
  assert.equal(wasm.isaac_pgd_import_file_io_gate(1, 0x80000000), 0);
  assert.equal(wasm.isaac_pgd_import_file_io_gate(0x100, 5), 0);
  assert.equal(wasm.isaac_pgd_import_file_io_gate(0x1ff, 5), 1);
  assert.equal(pgdImportPreReadCount(), 1);
  assert.equal(pgdImportPostReadCount(), 8);
  assert.equal(pgdImportPreReadIoCallVa(), 0x0092b569);
  assert.equal(pgdImportPostReadIoCallVa(), 0x0092b5a9);
  assert.equal(wasm.isaac_pgd_import_pre_read_count(), 1);
  assert.equal(wasm.isaac_pgd_import_post_read_count(), 8);
  /* Island 3 — post-import stores. */
  assert.equal(pgdImportPostReadGate(0), 0);
  assert.equal(pgdImportPostReadGate(1), 1);
  assert.equal(pgdImportPostReadGate(0x100), 0);
  assert.equal(pgdImportPostReadGate(0x1ff), 1);
  assert.equal(pgdImportPostReadGate(0x80000000), 0);
  assert.equal(pgdImportPostReadGate(0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_import_post_read_gate(0x100), 0);
  assert.equal(wasm.isaac_pgd_import_post_read_gate(0xffffffff), 1);
  assert.equal(pgdImportPostReadGateVa(), 0x0092b5b9);
  assert.equal(pgdImportPostReadFailVa(), 0x0092b7e6);
  assert.equal(pgdImportChangesmadeStoreVa(), 0x0092b752);
  assert.equal(pgdImportChangesmadeStoreValue(), 1);
  assert.equal(pgdImportChangesmadeClearGate(0, 1), 0);
  assert.equal(pgdImportChangesmadeClearGate(1, 0), 0);
  assert.equal(pgdImportChangesmadeClearGate(1, 1), 1);
  assert.equal(pgdImportChangesmadeClearGate(0x100, 1), 0);
  assert.equal(pgdImportChangesmadeClearGate(1, 0x1ff), 1);
  assert.equal(pgdImportChangesmadeClearGate(0x100, 0x100), 0);
  assert.equal(pgdImportChangesmadeClearGate(0x80000000, 0x80000000), 0);
  assert.equal(wasm.isaac_pgd_import_changesmade_clear_gate(0x100, 1), 0);
  assert.equal(wasm.isaac_pgd_import_changesmade_clear_gate(0x80000000, 0xff), 0);
  assert.equal(wasm.isaac_pgd_import_changesmade_clear_gate(1, 0xff), 1);
  assert.equal(pgdImportSaveSelect(1, 1, 1, 1), 1);
  assert.equal(pgdImportSaveSelect(0, 1, 1, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 0, 1, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 0, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 1, 0), 0);
  assert.equal(pgdImportSaveSelect(0x100, 1, 1, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 0x100, 1), 1);
  assert.equal(pgdImportSaveSelect(1, 1, 1, 0x100), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 0x80000000, 1), 1);
  assert.equal(pgdImportSaveSelect(1, 1, 0, 0xffffffff), 0);
  assert.equal(pgdImportSaveSelect(0x1ff, 0x100, 0, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 1, 0xffffffff), 1);
  assert.equal(wasm.isaac_pgd_import_save_select(1, 1, 0x100, 1), 1);
  assert.equal(wasm.isaac_pgd_import_save_select(0x100, 1, 1, 1), 0);
  assert.equal(pgdImportSaveSelectCmpVa(), 0x0092b780);
  assert.equal(pgdImportSaveSelect0f8cCmpVa(), 0x0092b785);
  assert.equal(pgdImportSaveSelectObjVa(), 0x0092b7a3);
  assert.equal(pgdImportSaveSelectObjCmpVa(), 0x0092b7ac);
  assert.equal(pgdImportSaveSelectGlobalVa(), 0x0092b7b1);
  assert.equal(pgdImportEventCounterVa(), 0x0092b770);
  assert.equal(wasm.isaac_pgd_import_event_counter_va(), 0x0092b770);
  assert.equal(pgdImportGlobalSavePtrVa(), 0xc7169c);
  assert.equal(pgdImportGlobalSaveFieldOff(), 0x2a378);
  assert.equal(pgdImportGlobalSaveCleared(0x12345678), 0);
  assert.equal(pgdImportGlobalSaveCleared(0), 0);
  assert.equal(pgdImportGlobalSaveRestore(0x12345678), 0x12345678);
  assert.equal(pgdImportGlobalSaveRestore(0), 0);
  assert.equal(wasm.isaac_pgd_import_global_save_restore(0x12345678), 0x12345678);
  assert.equal(pgdImportReturn1VaA(), 0x0092b7c7);
  assert.equal(pgdImportReturn1VaB(), 0x0092b7dd);
  assert.equal(pgdImportResult(0, 1), 0);
  assert.equal(pgdImportResult(1, 0), 0);
  assert.equal(pgdImportResult(1, 1), 1);
  assert.equal(pgdImportResult(1, 0x100), 0);
  assert.equal(pgdImportResult(1, 0x1ff), 1);
  assert.equal(pgdImportResult(0xffffffff, 0), 0);
  assert.equal(pgdImportResult(0x100, 0x80000000), 0);
  assert.equal(pgdImportResult(0x100, 0x100), 0);
  assert.equal(pgdImportResult(1, 0x80000000), 0);
  assert.equal(pgdImportResult(0, 0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_import_result(1, 0x100), 0);
  assert.equal(wasm.isaac_pgd_import_result(0x100, 0x1ff), 1);
  /* every remaining export exercised through its wasm binding (guards
     the EXPORTS list against typos). */
  assert.equal(wasm.isaac_pgd_import_open_state_call_va(), 0x0092b54c);
  assert.equal(wasm.isaac_pgd_import_open_state_gate_va(), 0x0092b54e);
  assert.equal(wasm.isaac_pgd_import_stream_pos_call_va(), 0x0092b555);
  assert.equal(wasm.isaac_pgd_import_stream_pos_gate_va(), 0x0092b55e);
  assert.equal(wasm.isaac_pgd_import_pre_read_io_call_va(), 0x0092b569);
  assert.equal(wasm.isaac_pgd_import_post_read_io_call_va(), 0x0092b5a9);
  assert.equal(wasm.isaac_pgd_import_post_read_gate_va(), 0x0092b5b9);
  assert.equal(wasm.isaac_pgd_import_post_read_fail_va(), 0x0092b7e6);
  assert.equal(wasm.isaac_pgd_import_changesmade_store_va(), 0x0092b752);
  assert.equal(wasm.isaac_pgd_import_changesmade_store_value(), 1);
  assert.equal(wasm.isaac_pgd_import_save_select_cmp_va(), 0x0092b780);
  assert.equal(wasm.isaac_pgd_import_save_select_0f8c_cmp_va(), 0x0092b785);
  assert.equal(wasm.isaac_pgd_import_save_select_obj_va(), 0x0092b7a3);
  assert.equal(wasm.isaac_pgd_import_save_select_obj_cmp_va(), 0x0092b7ac);
  assert.equal(wasm.isaac_pgd_import_save_select_global_va(), 0x0092b7b1);
  assert.equal(wasm.isaac_pgd_import_global_save_ptr_va(), 0xc7169c);
  assert.equal(wasm.isaac_pgd_import_global_save_field_off(), 0x2a378);
  assert.equal(wasm.isaac_pgd_import_global_save_cleared(0x9abcdef), 0);
  assert.equal(wasm.isaac_pgd_import_return1_va_a(), 0x0092b7c7);
  assert.equal(wasm.isaac_pgd_import_return1_va_b(), 0x0092b7dd);
});

test("PE truth: v25o mutants — PGDIMP laws must stay machine-exact", () => {
  /* MM1: a 0x1c-WIDE suffix compare (reading "nce+") would be the
     WRONG width — the machine memcmp is 0x18 bytes; the window
     compare must NOT accept d6 (0x2b65636e "nce+"). */
  assert.equal(pgdImportSuffixCompareLen(), 0x18);
  assert.equal(pgdImportSuffixWindowMatch(0x646e6942, 0x20676e69, 0x4920666f, 0x63616173, 0x70655220, 0x2b65636e), 0);
  assert.equal(wasm.isaac_pgd_import_suffix_compare_len(), 0x18);
  /* MM2: a FORWARD scan (`inc edi`) would pick the LEFTMOST
     occurrence; the machine `dec edi` @0x92b444 scans BACKWARD
     (rightmost wins). */
  assert.equal(pgdImportSuffixScanStep(), 0xffffffff);
  assert.equal(wasm.isaac_pgd_import_suffix_scan_step() >>> 0, 0xffffffff);
  /* MM3: an UNSIGNED stream-position gate (pos != 0) would pass
     0x80000000; the machine `test eax,eax ; js` requires (int32)pos
     >= 0. */
  assert.equal(pgdImportFileIoGate(1, 0x80000000), 0);
  assert.equal(pgdImportFileIoGate(1, 0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_import_file_io_gate(1, 0x80000000), 0);
  /* MM4: an OR of the save-select gates would select path A on a
     single nonzero input; the machine requires ALL FOUR nonzero
     (`je` x4). Also the pgd0/f8c/global gates are LOW BYTE (a dword
     test on 0x100 would wrongly pass) while the obj deref is a FULL
     DWORD (a byte test on 0x100 would wrongly fail). */
  assert.equal(pgdImportSaveSelect(1, 0, 1, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 0, 1), 0);
  assert.equal(pgdImportSaveSelect(0x100, 1, 1, 1), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 1, 0x100), 0);
  assert.equal(pgdImportSaveSelect(1, 1, 0x100, 1), 1);
  assert.equal(pgdImportSaveSelect(1, 1, 0x80000000, 1), 1);
  assert.equal(wasm.isaac_pgd_import_save_select(0x100, 1, 1, 1), 0);
  assert.equal(wasm.isaac_pgd_import_save_select(1, 1, 0x100, 1), 1);
  /* MM5: a FULL-dword read-result gate would let 0x100 through; the
     machine `cmp byte [ebp-0x4f1],0` is LOW BYTE. */
  assert.equal(pgdImportPostReadGate(0x100), 0);
  assert.equal(pgdImportPostReadGate(0x80000000), 0);
  assert.equal(wasm.isaac_pgd_import_post_read_gate(0x100), 0);
  assert.equal(pgdImportResult(1, 0x100), 0);
  assert.equal(wasm.isaac_pgd_import_result(1, 0x100), 0);
  /* MM6: the Rebirth rewrite net is exactly -4 (0x1c replaced by
     0x18); a -3 mutant breaks the WIDE row. */
  assert.equal(pgdImportRebirthReplaceLen(0x100, 1), 0xfc);
  assert.equal(pgdImportRebirthReplaceLen(0xffffffff, 1), 0xfffffffb);
  assert.equal(wasm.isaac_pgd_import_rebirth_replace_len(0x100, 1), 0xfc);
});
/* =====================================================================
   ABI v25p — PGDROWSEC: the per-section handler-row semantics of the
   0x009e4260 dispatch (banner v25p; NO ABI bump — the Part-C
   coordinator merges). v24 exported the row TABLE getters keyed by
   dispatch index 0..8; v25p composes the SAME rows keyed by SECTION
   id: dispatch gate `mov eax,[ebp-0x30] ; dec eax ; cmp eax,8 ; ja
   next` @0x9e44c9..0x9e44d0 (UNSIGNED (section-1) <= 8 -> index
   section-1, else NO row), then store offset / elem width / clamp
   max / setg / log VA / target VA by section id, plus the composed
   per-row loop law (byte rows: min(avail, clamped) exact for EVERY
   u32 pair incl. the wrap corners; dword rows: the v24 4*iters mod
   2^32 closed form — both applied to the row's UNSIGNED cmova
   clamp).
   Evidence: section-notes/pgd-v25p-9e4260/. */

/* Branch-by-branch reference for the section-keyed row: the dispatch
   gate `dec eax ; cmp eax,8 ; ja` — UNSIGNED (section-1) <= 8. */
function refSectionRowIndex(section) {
  const biased = (section - 1) >>> 0;
  return biased <= 8 ? biased : -1;
}
function refSectionStoreOff(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_OFFS[r];
}
function refSectionElemWidth(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_WIDTHS[r];
}
function refSectionClampMax(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_CLAMPS[r];
}
function refSectionFlagNormalize(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_SETG[r];
}
function refSectionLogVa(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_LOGS[r];
}
function refSectionTargetVa(section) {
  const r = refSectionRowIndex(section);
  return r < 0 ? 0 : REF_IRDISP_TARGETS[r];
}
/* Composed per-row loop: handler `mov ecx,MAX ; cmova eax,ecx`
   UNSIGNED clamp of the record count, then the byte (`cmp edi,
   [ebp-0x20] ; jae` + `cmp edi,[ebp-0x18] ; jb`, edi += 1/iter) or
   dword (`add edi,4` per iter; off = 4*iters mod 2^32) loop. */
function refSectionLoopIterations(section, avail, count) {
  const r = refSectionRowIndex(section);
  if (r < 0) return 0;
  const clamped = refClamp(count, REF_IRDISP_CLAMPS[r]);
  if (REF_IRDISP_WIDTHS[r] === 1) return refByteLoop(avail, clamped);
  return refDwordLoop(avail, clamped);
}

test("header records the v25p PGDROWSEC evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /ABI v25p — PGDROWSEC/);
  assert.match(h, /ISAAC_PGDROWSEC_ROWS = 9/);
  assert.match(h, /ISAAC_PGDROWSEC_DISPATCH_BIAS = 8/);
  assert.match(h, /isaac_pgd_import_section_row_index/);
  assert.match(h, /isaac_pgd_import_section_loop_iterations/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v25p/);
  assert.match(s, /isaac_pgd_import_section_row_index/);
  assert.match(s, /isaac_pgd_import_section_loop_iterations/);
  /* NO ABI bump per wave-16: the family ABI stays at 24 (the Part-C
     coordinator merges). */
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGDROWSEC_ROWS, 9);
  assert.equal(PGDROWSEC_FIRST_SECTION, 1);
  assert.equal(PGDROWSEC_LAST_SECTION, 9);
  assert.equal(PGDROWSEC_DISPATCH_BIAS, 8);
  /* the rows are the SAME 9 v24 dispatch rows. */
  for (let s = 1; s <= 9; ++s) {
    assert.equal(refSectionRowIndex(s), s - 1);
    assert.equal(PGDIDISP_SECTIONS[s - 1], s);
  }
});

test("PE truth: v25p section-keyed row semantics across wasm and model", () => {
  /* section -> row composition: 1..9 keyed, others inert. */
  for (let s = 1; s <= 9; ++s) {
    assert.equal(wasm.isaac_pgd_import_section_row_index(s), s - 1, `section ${s}`);
    assert.equal(pgdImportSectionRowIndex(s), s - 1, `model section ${s}`);
    assert.equal(wasm.isaac_pgd_import_section_store_off(s), REF_IRDISP_OFFS[s - 1]);
    assert.equal(pgdImportSectionStoreOff(s), REF_IRDISP_OFFS[s - 1]);
    assert.equal(wasm.isaac_pgd_import_section_elem_width(s), REF_IRDISP_WIDTHS[s - 1]);
    assert.equal(pgdImportSectionElemWidth(s), REF_IRDISP_WIDTHS[s - 1]);
    assert.equal(wasm.isaac_pgd_import_section_clamp_max(s), REF_IRDISP_CLAMPS[s - 1]);
    assert.equal(pgdImportSectionClampMax(s), REF_IRDISP_CLAMPS[s - 1]);
    assert.equal(wasm.isaac_pgd_import_section_flag_normalize(s), REF_IRDISP_SETG[s - 1]);
    assert.equal(pgdImportSectionFlagNormalize(s), REF_IRDISP_SETG[s - 1]);
    assert.equal(wasm.isaac_pgd_import_section_log_va(s) >>> 0, REF_IRDISP_LOGS[s - 1]);
    assert.equal(pgdImportSectionLogVa(s), REF_IRDISP_LOGS[s - 1]);
    assert.equal(wasm.isaac_pgd_import_section_target_va(s) >>> 0, REF_IRDISP_TARGETS[s - 1]);
    assert.equal(pgdImportSectionTargetVa(s), REF_IRDISP_TARGETS[s - 1]);
    /* semantic identity with the v24 index-keyed getters. */
    assert.equal(wasm.isaac_pgd_import_section_store_off(s),
      wasm.isaac_pgd_import_handler_store_off(s - 1));
    assert.equal(wasm.isaac_pgd_import_section_clamp_max(s),
      wasm.isaac_pgd_import_handler_clamp_max(s - 1));
    assert.equal(pgdImportSectionTargetVa(s), pgdImportHandlerTargetVa(s - 1));
  }
  /* WIDE section drives: 0, 10, 0x100, 0x80000000, 0xffffffff all
     skip (no row -> inert semantics). */
  for (const bad of [0, 10, 11, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(pgdImportSectionRowIndex(bad), -1, `model section ${bad >>> 0}`);
    assert.equal(pgdImportSectionStoreOff(bad), 0);
    assert.equal(pgdImportSectionElemWidth(bad), 0);
    assert.equal(pgdImportSectionClampMax(bad), 0);
    assert.equal(pgdImportSectionFlagNormalize(bad), 0);
    assert.equal(pgdImportSectionLogVa(bad), 0);
    assert.equal(pgdImportSectionTargetVa(bad), 0);
    assert.equal(pgdImportSectionLoopIterations(bad, 0, 0), 0);
    assert.equal(wasm.isaac_pgd_import_section_row_index(bad), -1);
    assert.equal(wasm.isaac_pgd_import_section_store_off(bad), 0);
    assert.equal(wasm.isaac_pgd_import_section_clamp_max(bad), 0);
    assert.equal(wasm.isaac_pgd_import_section_loop_iterations(bad, 0, 0), 0);
  }
  /* the composed per-row loop law: byte rows (1/4/5/6/7 = width 1)
     min(avail, clamped); dword rows (2/3/8/9 = width 4) closed
     form. Counts drive the clamp; avail is the record BYTE count. */
  /* section 1: clamp 0xb3, width 1. */
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 0x100, 0xb3), 0xb3);
  assert.equal(pgdImportSectionLoopIterations(1, 0x100, 0xb3), 0xb3);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 0x100, 0x1ff), 0xb3);
  assert.equal(pgdImportSectionLoopIterations(1, 0x100, 0x1ff), 0xb3);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 5, 0x1ff), 5);
  assert.equal(pgdImportSectionLoopIterations(1, 5, 0x1ff), 5);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 0, 0x1ff), 0);
  assert.equal(pgdImportSectionLoopIterations(1, 0xffffffff, 0x1ff), 0xb3);
  assert.equal(pgdImportSectionLoopIterations(1, 0xffffffff, 0xb3), 0xb3);
  /* section 2: clamp 0x5f, width 4 — dword wrap corners: avail
     >= 0xfffffffd never binds the avail bound (not a multiple of
     4); iterations = clamped. */
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(2, 0x17c, 0x1ff), 0x5f);
  assert.equal(pgdImportSectionLoopIterations(2, 0x17c, 0x1ff), 0x5f);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(2, 0xfffffffd, 0x1ff), 0x5f);
  assert.equal(pgdImportSectionLoopIterations(2, 0xfffffffd, 0x5f), 0x5f);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(2, 0x100, 0x1ff), 0x40);
  assert.equal(pgdImportSectionLoopIterations(2, 0x100, 0x1ff), 0x40);
  assert.equal(pgdImportSectionLoopIterations(2, 0, 0x1ff), 0);
  /* section 4: clamp 0x15b, width 1 — byte wrap corners: min is
     exact even at avail 0xffffffff with a huge clamped. */
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(4, 0xffffffff, 0x15b), 0x15b);
  assert.equal(pgdImportSectionLoopIterations(4, 0xffffffff, 0x15b), 0x15b);
  assert.equal(pgdImportSectionLoopIterations(4, 0x100, 0xffffffff), 0x100);
  /* composed law: the count clamps to the ROW max FIRST (the
     handler's cmova), so a huge count folds to the row max and the
     byte min binds at the row max — not at the raw count. */
  assert.equal(pgdImportSectionLoopIterations(4, 0xfffffffd, 0xffffffff), 0x15b);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(4, 0xfffffffd, 0xffffffff) >>> 0, 0x15b);
  /* section 9: clamp 1, width 4 — count 0x1000 folds to clamped 1;
     the dword closed form: ceil(avail/4) vs 1. */
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(9, 0x200, 0x1000), 1);
  assert.equal(pgdImportSectionLoopIterations(9, 0x200, 0x1000), 1);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(9, 0x4, 0x1000), 1);
  assert.equal(pgdImportSectionLoopIterations(9, 0x4, 0x1000), 1);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(9, 0x3, 0x1000), 1);
  assert.equal(pgdImportSectionLoopIterations(9, 3, 0x1000), 1);
  assert.equal(pgdImportSectionLoopIterations(9, 0, 0x1000), 0);
  /* section 5 (clamp 7, width 1): count 0x100 -> clamped 7. */
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(5, 0x100, 0x100), 7);
  assert.equal(pgdImportSectionLoopIterations(5, 0x100, 0x100), 7);
  assert.equal(pgdImportSectionLoopIterations(5, 3, 0x100), 3);
  assert.equal(pgdImportSectionLoopIterations(5, 7, 7), 7);
});

test("PE truth: v25p randomized differential — model vs branch-by-branch ref", () => {
  const rng = makeRng(0x9e4932);
  const sections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0x100, 0x80000000, 0xffffffff];
  const wide = [1, 4, 0x100, 0x1ff, 0xb3, 0x5f, 0x15b, 0xfffffffd, 0xfffffffe, 0xffffffff,
    0x80000000, 0];
  for (let n = 0; n < 3000; ++n) {
    const section = sections[pick(rng, sections.length)];
    const expIdx = refSectionRowIndex(section);
    assert.equal(wasm.isaac_pgd_import_section_row_index(section), expIdx,
      `row index ${section >>> 0}`);
    assert.equal(pgdImportSectionRowIndex(section), expIdx,
      `model row index ${section >>> 0}`);
    const expOff = refSectionStoreOff(section);
    assert.equal(wasm.isaac_pgd_import_section_store_off(section), expOff,
      `store off ${section >>> 0}`);
    assert.equal(pgdImportSectionStoreOff(section), expOff,
      `model store off ${section >>> 0}`);
    const expW = refSectionElemWidth(section);
    assert.equal(wasm.isaac_pgd_import_section_elem_width(section), expW);
    assert.equal(pgdImportSectionElemWidth(section), expW);
    const expC = refSectionClampMax(section);
    assert.equal(wasm.isaac_pgd_import_section_clamp_max(section), expC);
    assert.equal(pgdImportSectionClampMax(section), expC);
    const expF = refSectionFlagNormalize(section);
    assert.equal(wasm.isaac_pgd_import_section_flag_normalize(section), expF);
    assert.equal(pgdImportSectionFlagNormalize(section), expF);
    const expL = refSectionLogVa(section);
    assert.equal(wasm.isaac_pgd_import_section_log_va(section) >>> 0, expL >>> 0);
    assert.equal(pgdImportSectionLogVa(section) >>> 0, expL >>> 0);
    const expT = refSectionTargetVa(section);
    assert.equal(wasm.isaac_pgd_import_section_target_va(section) >>> 0, expT >>> 0);
    assert.equal(pgdImportSectionTargetVa(section) >>> 0, expT >>> 0);
    /* composed loop law: avail WIDE, count machine-realizable (the
       rows' cmova clamps cap clamped at <= 0x15b) so the reference
       sim terminates; corner clamped edges are pinned by the fixed
       asserts. */
    const avail = wide[pick(rng, wide.length)];
    const count = pick(rng, 0x200);
    const expLoop = refSectionLoopIterations(section, avail, count);
    assert.equal(wasm.isaac_pgd_import_section_loop_iterations(section, avail, count) >>> 0,
      expLoop >>> 0, `loop ${section >>> 0}/${avail >>> 0}/${count >>> 0}`);
    assert.equal(pgdImportSectionLoopIterations(section, avail, count) >>> 0,
      expLoop >>> 0, `model loop ${section >>> 0}/${avail >>> 0}/${count >>> 0}`);
  }
  /* fixed edges the random corpus cannot be trusted to hit: byte
     loops are min(avail, clamped) for EVERY u32 pair — the wrap
     corners have NO 4k mod-2^32 skip; the composed law clamps the
     COUNT to the row max first (cmova), so huge counts fold to the
     row max before the byte min binds. */
  assert.equal(pgdImportSectionLoopIterations(1, 0xfffffffd, 0xffffffff), 0xb3);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 0xfffffffd, 0xffffffff) >>> 0,
    0xb3);
  assert.equal(pgdImportSectionLoopIterations(4, 0xfffffffe, 0xffffffff), 0x15b);
  assert.equal(pgdImportSectionLoopIterations(7, 0xffffffff, 0xffffffff), 0x15);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(7, 0xffffffff, 0xffffffff) >>> 0,
    0x15);
  /* dword rows: the 4k mod-2^32 skip IS present (v24 closed form). */
  assert.equal(pgdImportSectionLoopIterations(2, 0xffffffff, 0x5f), 0x5f);
  assert.equal(pgdImportSectionLoopIterations(3, 0xfffffffd, 0xc), 0xc);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(8, 0xfffffffe, 0x14), 0x14);
  assert.equal(pgdImportSectionLoopIterations(9, 0xfffffffd, 0xffffffff), 1);
});

test("PE truth: v25p mutant — per-section row semantics must stay machine-exact", () => {
  /* MP1: a RAW-section dispatch gate ((section) <= 9, no dec bias)
     would key section 0 to row 0; the machine `dec eax ; cmp eax,8`
     makes section 0 -> (0-1) = 0xffffffff -> NO row. */
  assert.equal(pgdImportSectionRowIndex(0), -1);
  assert.equal(pgdImportSectionRowIndex(1), 0);
  assert.equal(pgdImportSectionRowIndex(9), 8);
  assert.equal(pgdImportSectionRowIndex(10), -1);
  assert.equal(pgdImportSectionRowIndex(0xffffffff), -1);
  assert.equal(wasm.isaac_pgd_import_section_row_index(0), -1);
  assert.equal(wasm.isaac_pgd_import_section_row_index(10), -1);
  /* MP2: a NO-CLAMP byte loop (iterations = avail unconditionally)
     would write avail elements for count 5; the handler clamps the
     count UNSIGNED cmova to the row max first (`mov ecx,MAX ; cmova
     eax,ecx`). */
  assert.equal(pgdImportSectionLoopIterations(5, 0x100, 5), 5);
  assert.equal(pgdImportSectionLoopIterations(5, 0x100, 0x100), 7);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(5, 0x100, 0x100), 7);
  assert.equal(pgdImportSectionLoopIterations(1, 0x100, 0x1ff), 0xb3);
  /* MP3: a SIGNED clamp (count < 0 passes through) would let a
     0x80000000 count write 0x80000000 elements on byte rows; the
     cmova clamp folds 0x80000000/0xffffffff to the row max. */
  assert.equal(pgdImportSectionLoopIterations(1, 0xffffffff, 0xffffffff), 0xb3);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(1, 0xffffffff, 0xffffffff) >>> 0,
    0xb3);
  assert.equal(pgdImportSectionLoopIterations(4, 0xffffffff, 0x80000000), 0x15b);
  /* MP4: a section-2 (dword row) treated as a byte row would write
     min(avail, clamped) elements; the machine's `add edi,4` stride
     caps at ceil(avail/4). */
  assert.equal(pgdImportSectionLoopIterations(2, 0x100, 0x1ff), 0x40);
  assert.equal(pgdImportSectionLoopIterations(2, 5, 0x1ff), 2);
  assert.equal(wasm.isaac_pgd_import_section_loop_iterations(2, 5, 0x1ff), 2);
  assert.notEqual(pgdImportSectionLoopIterations(2, 5, 0x1ff), 5);
  /* the semantic rows agree with v24's index-keyed tables 1:1. */
  assert.equal(pgdImportSectionStoreOff(3), pgdImportHandlerStoreOff(2));
  assert.equal(pgdImportSectionClampMax(9), pgdImportHandlerClampMax(8));
  assert.equal(pgdImportSectionFlagNormalize(6), pgdImportHandlerFlagNormalize(5));
  assert.equal(pgdImportSectionLogVa(8), pgdImportHandlerLogVa(7));
});

/* =====================================================================
   ABI v25n — PGDTALLY: the stage-4 TALLY loops of the 0x009e4260
   reader (banner v25n; NO ABI bump — the Part-C coordinator merges).
   v24 covered the version-tag table + section dispatch; v25n covers
   the tally stage 0x9e4618..0x9e4a8f (entered by fall-through after
   the PGDCLMP call @0x9e4613, runs UNCONDITIONALLY; success `mov
   al,1` 0x9e4a8f -> ret 0x9e4aa1; fail tail 0x9e4aa2 only from the
   tag mismatch). Laws: (1) the collection walk — byte
   [esi+eax+0x268] for eax 1..0x15a (`cmp eax,0x15b ; jl` SIGNED,
   index 0 never scanned); NONZERO byte -> set B (ecx) with the
   alias table SKIPPED; ZERO byte -> {0x114,0x14d,0x14e,0x14f,0x11b,
   0x14b} set A (edi) / {0x2b,0x3d,0xeb} set B; exit `lea
   eax,[edi+ecx] ; cmp eax,0x15a ; jl` SIGNED: (A+B) < 0x15a
   FINISHES (success return; the settings walk never runs; no
   +0x7d/+0x8c stores); (2) the settings walk — byte [esi+eax+0x38]
   for eax 1..0xb2 (`cmp eax,0xb3 ; jl` SIGNED); NONZERO -> set B;
   ZERO + {0x81..0x85,0x9c,0x52,0x54,0xaf} -> set A (edx); edi is
   NOT reset — still the COLLECTION set A; (3) `cmp eax,0xb1 ; jl`
   SIGNED on (A+B) gates byte [esi+0x7d]=1 @0x9e4a78; `cmp ecx,0xb1
   ; jl` SIGNED on settB AND `test edi,edi` (collection set A == 0)
   gate byte [esi+0x8c]=1 @0x9e4a88. The vtbl stream calls, logs,
   cookie 0xaef12b, PGDCLMP 0x9e4af0 and the +0x4a4 finish write
   stay HOST; the reader's leaf count is UNCHANGED.
   Expected values in the rows below are computed FROM THE MODEL
   (plain JS) per the wave-16 contract; wasm is exercised for the
   exported scalar laws.
   ================================================================== */

/* ---- branch-by-branch reference transcription (raw disasm; not
   derived from the model or wasm) ---- */
function refTallyCollBucket(index, byte) {
  const b = byte & 0xff;                                /* cmp byte,0 */
  if (b !== 0) return 2;   /* nonzero: set B, aliases skipped */
  if ([0x114, 0x14d, 0x14e, 0x14f, 0x11b, 0x14b].includes(index)) return 1;
  if ([0x2b, 0x3d, 0xeb].includes(index)) return 2;
  return 0;
}
function refTallySettBucket(index, byte) {
  const b = byte & 0xff;
  if (b !== 0) return 2;
  if ([0x81, 0x82, 0x83, 0x84, 0x85, 0x9c, 0x52, 0x54, 0xaf].includes(index)) return 1;
  return 0;
}
function refTallyCollContinue(setA, setB) {
  return ((setA + setB) | 0) < 0x15a ? 0 : 1;           /* lea + SIGNED jl */
}
function refTallySettStore7d(setA, setB) {
  return ((setA + setB) | 0) < 0xb1 ? 0 : 1;
}
function refTallySettStore8c(settB, collA) {
  if ((settB | 0) < 0xb1) return 0;                     /* cmp ecx,0xb1 ; jl */
  if (collA !== 0) return 0;                            /* test edi,edi ; jne */
  return 1;
}

test("header records the v25n PGDTALLY evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /v25n \(this unit\) lands PGDTALLY/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35\b/); /* v25n itself did NOT bump; family at 29 since v29 PGDISP */
  assert.match(h, /ISAAC_PGDTALLY_RUN_VA = 0x009e4618/);
  assert.match(h, /ISAAC_PGDTALLY_STORE_7D_VA = 0x009e4a78/);
  assert.match(h, /ISAAC_PGDTALLY_STORE_8C_VA = 0x009e4a88/);
  assert.match(h, /ISAAC_PGDTALLY_COLL_BOUND = 0x15b/);
  assert.match(h, /test edi,edi/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /v25n \(this unit\) lands PGDTALLY/);
  assert.match(s, /isaac_pgd_import_tally_coll_bucket/);
  assert.match(s, /isaac_pgd_import_tally_sett_store_8c/);
  assert.equal(PGD_PURE_ABI_VERSION, 35); /* family ABI now 29 (v29 PGDISP); v25n itself did not bump */
  assert.equal(pgdImportTallyRunVa(), 0x009e4618);
  assert.equal(PGDTALLY_RUN_VA, 0x009e4618);
  /* the frontier record still points at the reader (boundary NOT
     removed; only the tally decision surface is now covered). */
  assert.equal(PGD_COUNT_PROBE_NEXT_VA, 0x009e4260);
});

test("PGDTALLY walk bounds + alias tables (wasm + model)", () => {
  assert.equal(wasm.isaac_pgd_import_tally_coll_first_idx(), 1);
  assert.equal(pgdImportTallyCollFirstIdx(), 1);
  assert.equal(wasm.isaac_pgd_import_tally_coll_bound(), 0x15b);
  assert.equal(pgdImportTallyCollBound(), 0x15b);
  assert.equal(wasm.isaac_pgd_import_tally_coll_iters(), 0x15a);
  assert.equal(pgdImportTallyCollIters(), 0x15a);
  assert.equal(wasm.isaac_pgd_import_tally_sett_first_idx(), 1);
  assert.equal(pgdImportTallySettFirstIdx(), 1);
  assert.equal(wasm.isaac_pgd_import_tally_sett_bound(), 0xb3);
  assert.equal(pgdImportTallySettBound(), 0xb3);
  assert.equal(wasm.isaac_pgd_import_tally_sett_iters(), 0xb2);
  assert.equal(pgdImportTallySettIters(), 0xb2);
  assert.equal(PGDTALLY_COLL_ITERS, 0x15a);
  assert.equal(PGDTALLY_SETT_ITERS, 0xb2);
  /* alias tables in machine compare order */
  assert.equal(pgdImportTallyCollAliasACount(), 6);
  assert.equal(wasm.isaac_pgd_import_tally_coll_alias_a_count(), 6);
  assert.equal(pgdImportTallyCollAliasBCount(), 3);
  assert.equal(wasm.isaac_pgd_import_tally_coll_alias_b_count(), 3);
  assert.equal(pgdImportTallySettAliasCount(), 9);
  assert.equal(wasm.isaac_pgd_import_tally_sett_alias_count(), 9);
  for (let i = 0; i < 10; ++i) {
    const wantA = PGDTALLY_COLL_ALIAS_A[i] ?? 0;
    const wantB = PGDTALLY_COLL_ALIAS_B[i] ?? 0;
    const wantS = PGDTALLY_SETT_ALIAS[i] ?? 0;
    assert.equal(pgdImportTallyCollAliasA(i), wantA);
    assert.equal(wasm.isaac_pgd_import_tally_coll_alias_a(i), wantA);
    assert.equal(pgdImportTallyCollAliasB(i), wantB);
    assert.equal(wasm.isaac_pgd_import_tally_coll_alias_b(i), wantB);
    assert.equal(pgdImportTallySettAlias(i), wantS);
    assert.equal(wasm.isaac_pgd_import_tally_sett_alias(i), wantS);
  }
  /* the compare ORDER is part of the contract: index 0 is never
     scanned, bounds are exclusive and SIGNED */
  assert.equal(PGDTALLY_COLL_ALIAS_A[0], 0x114);
  assert.equal(PGDTALLY_COLL_ALIAS_A[5], 0x14b);
  assert.equal(PGDTALLY_COLL_ALIAS_B[2], 0xeb);
  assert.equal(PGDTALLY_SETT_ALIAS[8], 0xaf);
});

test("PGDTALLY bucket + gate laws driven WIDE (wasm + model)", () => {
  /* the byte gate is cmp byte,0 zero/nonzero re-narrowed to & 0xff:
     0x100 -> 0 (alias scan), 0x1ff/0xffffffff -> nonzero (set B). */
  const wide = [0, 1, 0x7f, 0x80, 0xff, 0x100, 0x1ff, 0xffffffff];
  const collIdx = [0, 1, 0x114, 0x14d, 0x14e, 0x14f, 0x11b, 0x14b,
    0x2b, 0x3d, 0xeb, 0x15a, 0x15b, 0x99, 0x1000];
  const settIdx = [0, 1, 0x81, 0x82, 0x83, 0x84, 0x85, 0x9c, 0x52,
    0x54, 0xaf, 0xb0, 0xb2, 0xb3, 0x5, 0x1000];
  for (const idx of collIdx) {
    for (const b of wide) {
      const want = refTallyCollBucket(idx, b);
      assert.equal(pgdImportTallyCollBucket(idx, b), want, `model collBucket ${idx}/${b >>> 0}`);
      assert.equal(wasm.isaac_pgd_import_tally_coll_bucket(idx, b), want, `wasm collBucket ${idx}/${b >>> 0}`);
    }
  }
  for (const idx of settIdx) {
    for (const b of wide) {
      const want = refTallySettBucket(idx, b);
      assert.equal(pgdImportTallySettBucket(idx, b), want, `model settBucket ${idx}/${b >>> 0}`);
      assert.equal(wasm.isaac_pgd_import_tally_sett_bucket(idx, b), want, `wasm settBucket ${idx}/${b >>> 0}`);
    }
  }
  /* key discriminators: a NONZERO flag at an A-alias index counts
     set B (2) — the alias table only runs on byte == 0; 0x80/0xff
     (negative int8) are still NONZERO for the tally walk (NOT the
     stage-3 setg law). */
  assert.equal(pgdImportTallyCollBucket(0x114, 1), 2);
  assert.equal(pgdImportTallyCollBucket(0x114, 0), 1);
  assert.equal(pgdImportTallyCollBucket(0xeb, 0), 2);
  assert.equal(pgdImportTallyCollBucket(0x99, 0xff), 2);
  assert.equal(pgdImportTallyCollBucket(0x99, 0x80), 2);
  assert.equal(pgdImportTallyCollBucket(0x114, 0x100), 1);
  assert.equal(pgdImportTallyCollBucket(0x114, 0x1ff), 2);
  assert.equal(pgdImportTallySettBucket(0x81, 0), 1);
  assert.equal(pgdImportTallySettBucket(0x81, 1), 2);
  assert.equal(pgdImportTallySettBucket(0xaf, 0), 1);
  assert.equal(pgdImportTallySettBucket(0xb0, 0), 0);
  /* gate laws: the SUM is a 32-bit add compared SIGNED — wide
     corners discriminate signed vs unsigned. */
  const pairs = [
    [0, 0], [0x159, 0], [0x15a, 0], [0x15a, 1],
    [0xffffffff, 0], [0x80000000, 0], [0x0, 0xffffffff],
    [0x80000000, 0x80000000], [0x7fffffff, 0],
    [0xb0, 0], [0xb1, 0], [0xb1, 1], [0xb1, 0xffffffff],
    [0xffffffff, 0xffffffff],
  ];
  for (const [a, b] of pairs) {
    const wc = refTallyCollContinue(a, b);
    const w7 = refTallySettStore7d(a, b);
    const w8 = refTallySettStore8c(a, b);
    assert.equal(pgdImportTallyCollContinue(a, b), wc, `collContinue ${a >>> 0}/${b >>> 0}`);
    assert.equal(wasm.isaac_pgd_import_tally_coll_continue(a, b), wc, `wasm collContinue ${a >>> 0}/${b >>> 0}`);
    assert.equal(pgdImportTallySettStore7d(a, b), w7, `settStore7d ${a >>> 0}/${b >>> 0}`);
    assert.equal(wasm.isaac_pgd_import_tally_sett_store_7d(a, b), w7, `wasm settStore7d ${a >>> 0}/${b >>> 0}`);
    assert.equal(pgdImportTallySettStore8c(a, b), w8, `settStore8c ${a >>> 0}/${b >>> 0}`);
    assert.equal(wasm.isaac_pgd_import_tally_sett_store_8c(a, b), w8, `wasm settStore8c ${a >>> 0}/${b >>> 0}`);
  }
  /* signed-vs-unsigned pins: 0xffffffff/0x80000000 sums are NEGATIVE
     as int32 -> below every gate (FINISH/NO store), never above. */
  assert.equal(pgdImportTallyCollContinue(0xffffffff, 0), 0);
  assert.equal(pgdImportTallyCollContinue(0x80000000, 0), 0);
  assert.equal(pgdImportTallySettStore7d(0xffffffff, 0), 0);
  assert.equal(pgdImportTallySettStore8c(0xb1, 1), 0);  /* coll setA != 0 */
  assert.equal(pgdImportTallySettStore8c(0xb1, 0), 1);
  assert.equal(pgdImportTallySettStore8c(0xb0, 0), 0);
});

test("PGDTALLY composite walks + full run (expected values from the model)", () => {
  /* all-zero collection flags: the alias scan adds setA=6 (A-ids)
     + setB=3 (B-ids) -> sum 9 < 0x15a -> FINISH: the settings walk
     never runs and no +0x7d/+0x8c store fires. */
  const collAllZero = new Array(PGDTALLY_COLL_BOUND).fill(0);
  const settAllOnes = new Array(PGDTALLY_SETT_BOUND).fill(1);
  const r1 = pgdImportTallyRun(collAllZero, settAllOnes);
  assert.deepEqual(r1.collections, { setA: 6, setB: 3 });
  assert.equal(r1.skipSettings, 1);
  assert.equal(r1.store7d, 0);
  assert.equal(r1.store8c, 0);
  /* all-one collection flags: setB=0x15a, setA=0 -> gate 0x15a !<
     0x15a -> CONTINUE; all-one settings flags: sett setB=0xb2,
     setA=0 -> store7d fires (0xb2 !< 0xb1) and store8c fires
     (settB >= 0xb1 AND coll setA == 0). */
  const collAllOnes = new Array(PGDTALLY_COLL_BOUND).fill(1);
  const settAllOnes2 = new Array(PGDTALLY_SETT_BOUND).fill(1);
  const r2 = pgdImportTallyRun(collAllOnes, settAllOnes2);
  assert.deepEqual(r2.collections, { setA: 0, setB: PGDTALLY_COLL_ITERS });
  assert.deepEqual(r2.settings, { setA: 0, setB: PGDTALLY_SETT_ITERS });
  assert.equal(r2.skipSettings, 0);
  assert.equal(r2.store7d, 1);
  assert.equal(r2.store8c, 1);
  /* randomized differential: model composites vs the branch-by-branch
     reference over random flag arrays (seed 0x9e4618). */
  const rng = makeRng(0x9e4618);
  const randByte = () => {
    const r = pick(rng, 0x100000000);
    return r % 5 === 0 ? 0 : r % 7 === 1 ? 0xff : r % 9 === 2 ? 0x80 : (r >>> 24) & 0xff;
  };
  for (let n = 0; n < 400; ++n) {
    const collFlags = new Array(PGDTALLY_COLL_BOUND).fill(0);
    for (let i = 1; i < PGDTALLY_COLL_BOUND; ++i) collFlags[i] = randByte();
    for (const a of PGDTALLY_COLL_ALIAS_A) collFlags[a] = n % 3 === 0 ? 0 : randByte();
    for (const a of PGDTALLY_COLL_ALIAS_B) collFlags[a] = n % 2 === 0 ? 0 : randByte();
    const settFlags = new Array(PGDTALLY_SETT_BOUND).fill(0);
    for (let i = 1; i < PGDTALLY_SETT_BOUND; ++i) settFlags[i] = randByte();
    for (const a of PGDTALLY_SETT_ALIAS) settFlags[a] = n % 4 === 0 ? 0 : randByte();

    let refA = 0, refB = 0;
    for (let i = 1; i < PGDTALLY_COLL_BOUND; ++i) {
      const bk = refTallyCollBucket(i, collFlags[i]);
      if (bk === 1) refA += 1;
      else if (bk === 2) refB += 1;
    }
    const mColl = pgdImportTallyCollectionCounts(collFlags);
    assert.deepEqual(mColl, { setA: refA, setB: refB }, `coll walk ${n}`);

    let refSA = 0, refSB = 0;
    for (let i = 1; i < PGDTALLY_SETT_BOUND; ++i) {
      const bk = refTallySettBucket(i, settFlags[i]);
      if (bk === 1) refSA += 1;
      else if (bk === 2) refSB += 1;
    }
    const mSett = pgdImportTallySettingsCounts(settFlags);
    assert.deepEqual(mSett, { setA: refSA, setB: refSB }, `sett walk ${n}`);

    const mRun = pgdImportTallyRun(collFlags, settFlags);
    if (refTallyCollContinue(refA, refB) === 0) {
      assert.equal(mRun.skipSettings, 1, `skip ${n}`);
      assert.equal(mRun.store7d, 0, `skip7d ${n}`);
      assert.equal(mRun.store8c, 0, `skip8c ${n}`);
    } else {
      assert.equal(mRun.skipSettings, 0, `cont ${n}`);
      assert.equal(mRun.store7d, refTallySettStore7d(refSA, refSB), `7d ${n}`);
      assert.equal(mRun.store8c, refTallySettStore8c(refSB, refA), `8c ${n} (coll setA=${refA})`);
    }
  }
});

test("PE truth: v25n mutant guards — PGDTALLY laws stay machine-exact", () => {
  /* MN1: a NONZERO collection byte at an A-alias index must count
     set B (2) — a mutant that sends nonzero bytes to set A would
     mis-tally every enabled alias flag. */
  assert.equal(pgdImportTallyCollBucket(0x114, 1), 2);
  assert.equal(pgdImportTallyCollBucket(0x114, 0xff), 2);
  assert.equal(pgdImportTallyCollBucket(0x114, 0x1ff), 2);
  assert.equal(pgdImportTallyCollBucket(0x14b, 0x80), 2);
  assert.equal(wasm.isaac_pgd_import_tally_coll_bucket(0x114, 1), 2);
  /* MN2: the {0x2b,0x3d,0xeb} set-B alias table is complete. */
  assert.equal(pgdImportTallyCollBucket(0xeb, 0), 2);
  assert.equal(pgdImportTallyCollBucket(0x2b, 0), 2);
  assert.equal(pgdImportTallyCollBucket(0x3d, 0), 2);
  assert.equal(pgdImportTallyCollAliasB(2), 0xeb);
  assert.equal(pgdImportTallyCollAliasBCount(), 3);
  /* MN3: the collection gate compares the 32-bit SUM SIGNED — wide
     sums (negative as int32) FINISH, never continue. */
  assert.equal(pgdImportTallyCollContinue(0xffffffff, 0), 0);
  assert.equal(pgdImportTallyCollContinue(0x80000000, 0), 0);
  assert.equal(pgdImportTallyCollContinue(0x15a, 0), 1);
  assert.equal(pgdImportTallyCollContinue(0x159, 0), 0);
  assert.equal(wasm.isaac_pgd_import_tally_coll_continue(0xffffffff, 0), 0);
  /* MN4: the +0x8c store needs the COLLECTION walk's set A == 0
     (edi survives the settings walk) — settB alone must not fire. */
  assert.equal(pgdImportTallySettStore8c(0xb1, 1), 0);
  assert.equal(pgdImportTallySettStore8c(0xb1, 0), 1);
  assert.equal(pgdImportTallySettStore8c(0xffffffff, 1), 0);
  assert.equal(wasm.isaac_pgd_import_tally_sett_store_8c(0xb1, 1), 0);
  /* MN5: the collection walk scans eax 1..0x15a — 0x15a iterations,
     index 0 never scanned (a 0..0x15b walk would read the guard
     slot and shift every count). */
  assert.equal(pgdImportTallyCollFirstIdx(), 1);
  assert.equal(pgdImportTallyCollBound(), 0x15b);
  assert.equal(pgdImportTallyCollIters(), 0x15a);
  assert.equal(wasm.isaac_pgd_import_tally_coll_iters(), 0x15a);
  /* and the settings-side walk mirrors it: 1..0xb2 bound 0xb3. */
  assert.equal(pgdImportTallySettIters(), 0xb2);
  assert.equal(wasm.isaac_pgd_import_tally_sett_iters(), 0xb2);
  /* Model and rebuilt module agree at ABI 34 (v25n group rides the
     family ABI; the in-test rebuild is 34). */
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(wasm.isaac_pgd_pure_helpers_abi_version(), 35);
});

/* =====================================================================
   ABI v26 — PGDIVER + PGDREADER2 (the family ABI 25 -> 26, atomic on
   both sides). PGDIVER = the import reader 0x009e4260's version gates
   (+0x4a0 row-gated read: rows 4..9 / sections 4..6; +0x4a4 default
   store = 1 UNCONDITIONAL + section >= 6 UNSIGNED read) and the fail
   tail (log (1, 0xb80528, buf) HOST, return 0 @0x9e4ac7).
   PGDREADER2 = the SIBLING save reader 0x0041d670's full pure surface
   (own 3-row tag table 0xb1b98c/0xb1b9a0/0xb1b9b4 -> sections 6/7/8,
   counts 9/10/10; the size/checksum gate `cmp edi,8 ; jb` UNSIGNED
   @0x41d748; the version dword reads snap+0x6dc / snap+0x6e0; the
   record loop: SIGNED entry gates, UNSIGNED zero-only count gate,
   UNSIGNED (section-1) <= 9 dispatch; the 10 handler rows; the
   success/fail tails ret 4). The 0x683580 checksum helper, the vtbl
   stream calls + polls, the 12 cdecl logs and the cookie stay HOST.
   Evidence: section-notes/pgd-v26-41d670/.
   ================================================================== */

/* ---- branch-by-branch reference transcription (raw disasm; NOT
   derived from the model or wasm) ---- */
const REF_V26_TAGS = [
  { va: 0x00b1b98c, section: 6, count: 9 },
  { va: 0x00b1b9a0, section: 7, count: 10 },
  { va: 0x00b1b9b4, section: 8, count: 10 },
];
const REF_V26_DWORDS = [0x41415349, 0x53474e43, 0x30455641];
function refV26TagCompare(index, d0, d1, d2) {
  if (index < 0 || index >= 3) return 0;
  return REF_V26_DWORDS[0] === d0 && REF_V26_DWORDS[1] === d1 && REF_V26_DWORDS[2] === d2 ? 1 : 0;
}
function refV26TagFirstMatch(d0, d1, d2) {
  for (let i = 0; i < 3; ++i) {
    if (refV26TagCompare(i, d0, d1, d2)) return i;
  }
  return -1;
}
function refV26TagMatchSection(d0, d1, d2) {
  const m = refV26TagFirstMatch(d0, d1, d2);
  return m < 0 ? 0 : REF_V26_TAGS[m].section;
}
function refV26TagMatchCount(d0, d1, d2) {
  const m = refV26TagFirstMatch(d0, d1, d2);
  return m < 0 ? 0 : REF_V26_TAGS[m].count;
}
function refV26TagHeaderVa(i) { return i >= 0 && i < 3 ? REF_V26_TAGS[i].va : 0; }
function refV26TagHeaderSection(i) { return i >= 0 && i < 3 ? REF_V26_TAGS[i].section : 0; }
function refV26TagHeaderCount(i) { return i >= 0 && i < 3 ? REF_V26_TAGS[i].count : 0; }
/* size gate: `cmp edi,8 ; jb skip` UNSIGNED @0x41d748 + `cmp
   [ebp-0x38],ebx ; je` — 1 = FAIL (log + abort). */
function refV26SizeGate(section, fileCount, checksum) {
  if ((section >>> 0) < 8) return 0;
  return (fileCount >>> 0) === (checksum >>> 0) ? 0 : 1;
}
/* entry gates: `test eax,eax ; js` + `cmp eax,[ebp-0x30] ; jge`
   SIGNED — 1 = stay in the record loop. */
function refV26EntryGate(prev, elemCount) {
  return (prev | 0) >= 0 && (prev | 0) < (elemCount | 0) ? 1 : 0;
}
/* count gate: `cmp [ebp-0x24],0 ; jbe` UNSIGNED zero-only skip. */
function refV26RecordCountGate(count) {
  return (count >>> 0) === 0 ? 1 : 0;
}
/* dispatch gate: `dec eax ; cmp eax,9 ; ja` UNSIGNED. */
function refV26DispatchIndex(section) {
  const biased = (section - 1) >>> 0;
  return biased <= 9 ? biased : -1;
}
const REF_V26_OFFS = [0x038, 0x150, 0x594, 0x3d8, 0x5c4, 0x5cb, 0x60e, 0x630, 0x688, 0x68c];
const REF_V26_WIDTHS = [1, 4, 4, 1, 1, 1, 1, 4, 4, 1];
const REF_V26_CLAMPS = [0x115, 0xa2, 0xc, 0x1ba, 7, 0x43, 0x1f, 0x16, 1, 0x4d];
const REF_V26_SETG = [1, 0, 0, 1, 1, 1, 1, 0, 0, 1];
const REF_V26_LOGS = [0xb1ba38, 0xb1ba60, 0xb1ba60, 0xb1ba84, 0xb1babc, 0xb1babc, 0xb1bae4, 0xb1bb0c, 0xb1bb34, 0xb1bb58];
const REF_V26_TARGETS = [0x41d7fa, 0x41d875, 0x41d93d, 0x41d9c3, 0x41da46, 0x41dac2, 0x41db41, 0x41dbc1, 0x41dc43, 0x41dcc3];
function refV26SectionRowIndex(section) { return refV26DispatchIndex(section); }
function refV26SectionStoreOff(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_OFFS[r];
}
function refV26SectionElemWidth(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_WIDTHS[r];
}
function refV26SectionClampMax(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_CLAMPS[r];
}
function refV26SectionFlagNormalize(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_SETG[r];
}
function refV26SectionLogVa(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_LOGS[r];
}
function refV26SectionTargetVa(section) {
  const r = refV26DispatchIndex(section);
  return r < 0 ? 0 : REF_V26_TARGETS[r];
}
function refV26Clamp(count, max) {
  return (count >>> 0) > (max >>> 0) ? max >>> 0 : count >>> 0;
}
function refV26ByteLoop(avail, clamped) {
  return Math.min(avail >>> 0, clamped >>> 0);
}
function refV26DwordLoop(avail, clamped) {
  const a = avail >>> 0;
  const c = clamped >>> 0;
  if (a === 0) return 0;
  const bound = a > 0xfffffffc ? c : (a + 3) >>> 2;
  return c < bound ? c : bound;
}
function refV26SectionLoopIterations(section, avail, count) {
  const r = refV26DispatchIndex(section);
  if (r < 0) return 0;
  const clamped = refV26Clamp(count, REF_V26_CLAMPS[r]);
  return REF_V26_WIDTHS[r] === 1
    ? refV26ByteLoop(avail, clamped)
    : refV26DwordLoop(avail, clamped);
}
/* import version gates: +0x4a0 read fires for tag rows 4..9
   (sections 4/5/6); +0x4a4 default store 1 UNCONDITIONAL, read fires
   when the tag section >= 6 UNSIGNED. */
function refV26ImportVersionGateRow(row) {
  return row >= 4 && row < 10 ? 1 : 0;
}
function refV26ImportVersionGateSection(section) {
  return section >= 4 && section <= 6 ? 1 : 0;
}
function refV26ImportFinishGate(section) {
  return (section >>> 0) >= 6 ? 1 : 0;
}

test("header records the v26 PGDIVER + PGDREADER2 evidence (ABI 25 -> 26)", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers \u2014 ABI v35/);
  assert.match(h, /v26 \(this unit\) lands PGDREADER2 \+ PGDIVER/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35\b/);
  assert.match(h, /ISAAC_PGDIVER_VERSION_OFF = 0x4a0/);
  assert.match(h, /ISAAC_PGD2_READER_VA = 0x0041d670/);
  assert.match(h, /ISAAC_PGD2ROW_CLAMP9 = 0x4d/);
  assert.match(h, /isaac_pgd_sibling_section_loop_iterations/);
  assert.match(h, /isaac_pgd_import_version_gate_row/);
  assert.match(h, /isaac_pgd_import_finish_gate/);
  assert.match(h, /isaac_pgd_import_tag_fail_ret_va/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_sibling_size_gate/);
  assert.match(s, /isaac_pgd_sibling_section_loop_iterations/);
  assert.match(s, /isaac_pgd_import_version_gate_row/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);           /* bumped 25 -> 26 */
  assert.equal(PGDIVER_VERSION_OFF, 0x4a0);
  assert.equal(PGDIVER_FINISH_OFF, 0x4a4);
  assert.equal(PGDIVER_FINISH_DEFAULT, 1);
  assert.equal(PGDIVER_FAIL_RET_VA, 0x009e4ac7);
  assert.equal(PGD2_READER_VA, 0x0041d670);
  assert.equal(PGD2_RET_OK_VA, 0x0041d93a);
  assert.equal(PGD2_FAIL_RET_VA, 0x0041dd76);
  assert.equal(PGD2_RETURN_STACK_BYTES, 4);
  assert.equal(PGD2_TAG_COMPARE_DWORDS, 3);
  assert.equal(PGD2_HEADERS, 3);
  assert.equal(PGD2_DISPATCH_ENTRIES, 10);
  assert.equal(PGD2_DISPATCH_BIAS, 9);
  assert.equal(PGD2ROW_ROWS, 10);
  assert.equal(PGD2ROW_FIRST_SECTION, 1);
  assert.equal(PGD2ROW_LAST_SECTION, 10);
  assert.equal(PGD2_SIZE_CHECK_SECTION, 8);
  assert.equal(PGD2_VERSION_OFF, 0x6dc);
  assert.equal(PGD2_VERSION_FINISH_OFF, 0x6e0);
  assert.equal(PGD2_VERSION_BYTES, 8);
  /* the tag rows are the sibling's OWN table (sections 6/7/8). */
  assert.equal(PGD2_TAG_HEADERS[0].va, 0x00b1b98c);
  assert.equal(PGD2_TAG_HEADERS[0].section, 6);
  assert.equal(PGD2_TAG_HEADERS[0].count, 9);
  assert.equal(PGD2_TAG_HEADERS[2].section, 8);
  assert.equal(PGD2_TAG_HEADERS[2].count, 10);
});

test("PE truth: v26 PGDIVER version gates + fail tail (model + ref)", () => {
  /* +0x4a0 version-read gate: tag rows 4..9 (sections 4/5/6) read one
     dword into snap+0x4a0; rows 0..3 (sections 2/3) do NOT. */
  for (let row = 0; row < 10; ++row) {
    const want = refV26ImportVersionGateRow(row);
    assert.equal(pgdImportVersionGateRow(row), want, `gate row ${row}`);
    assert.equal(pgdImportVersionGateRow(row), row >= 4 ? 1 : 0);
  }
  assert.equal(pgdImportVersionGateRow(10), 0);
  assert.equal(pgdImportVersionGateRow(0xffffffff), 0);
  for (const s of [2, 3, 4, 5, 6]) {
    assert.equal(pgdImportVersionGateSection(s), refV26ImportVersionGateSection(s), `gate section ${s}`);
  }
  assert.equal(pgdImportVersionGateSection(0), 0);
  assert.equal(pgdImportVersionGateSection(7), 0);
  assert.equal(pgdImportVersionGateSection(0x100), 0);
  assert.equal(pgdImportVersionGateSection(0xffffffff), 0);
  /* the section form is row-equivalent through the PGDITAG rows. */
  assert.equal(pgdImportVersionGateSection(4), pgdImportVersionGateRow(4));
  assert.equal(pgdImportVersionGateSection(5), pgdImportVersionGateRow(6));
  assert.equal(pgdImportVersionGateSection(6), pgdImportVersionGateRow(8));
  assert.equal(pgdImportVersionGateSection(3), pgdImportVersionGateRow(2));
  /* +0x4a4 finish gate: default store = 1 UNCONDITIONAL; the
     overwriting read fires only for UNSIGNED section >= 6. */
  for (const s of [0, 1, 2, 3, 4, 5, 6, 7, 0x100, 0x7fffffff]) {
    const want = refV26ImportFinishGate(s);
    assert.equal(pgdImportFinishGate(s), want, `finish gate ${s >>> 0}`);
    assert.equal(pgdImportFinishGate(s), s >= 6 ? 1 : 0);
  }
  /* WIDE unsigned-vs-signed discriminators: 0x80000000/0xffffffff
     are NEGATIVE as int32 but UNSIGNED >= 6 -> the read fires. */
  assert.equal(pgdImportFinishGate(0x80000000), 1);
  assert.equal(pgdImportFinishGate(0xffffffff), 1);
  assert.notEqual(pgdImportFinishGate(0x80000000), 0);
  /* the version block shape (count 1, width 4 — the machine's
     `push 1 ; push 4 ; push buf ; call [vtbl+0x14]`). */
  assert.equal(pgdImportVersionOff(), 0x4a0);
  assert.equal(pgdImportVersionBytes(), 8);
  assert.equal(pgdImportVersionReadCount(), 1);
  assert.equal(pgdImportVersionReadWidth(), 4);
  assert.equal(pgdImportVersionFinishOff(), 0x4a4);
  assert.equal(pgdImportVersionFinishDefault(), 1);
  /* fail tail: 0x9e4aa2 logs (1, 0xb80528, buf) HOST then returns 0
     @0x9e4ac7. */
  assert.equal(pgdImportTagFailRetVa(), 0x009e4ac7);
  assert.equal(pgdImportTagFailLogArgc(), 3);
  assert.equal(pgdImportTagFailReturnsZero(), 0);
});

test("PE truth: v26 PGDREADER2 tag table + size gate (model + ref)", () => {
  /* the 3-row tag table: three FULL dwords compared, first match in
     PE order wins; all three bodies share "ISAACNGSAVE0" so row 0
     always wins today. */
  assert.equal(pgdSiblingTagCompareBytes(), 0xc);
  assert.equal(pgdSiblingTagCompareDwords(), 3);
  assert.equal(pgdSiblingTagReadBytes(), 0x10);
  for (const [d0, d1, d2] of [[0x41415349, 0x53474e43, 0x30455641]]) {
    assert.equal(pgdSiblingTagCompare(0, d0, d1, d2), 1);
    assert.equal(pgdSiblingTagCompare(1, d0, d1, d2), 1);
    assert.equal(pgdSiblingTagCompare(2, d0, d1, d2), 1);
    assert.equal(pgdSiblingTagCompare(3, d0, d1, d2), 0);
    assert.equal(pgdSiblingTagFirstMatch(d0, d1, d2), 0);
    assert.equal(pgdSiblingTagMatchSection(d0, d1, d2), 6);
    assert.equal(pgdSiblingTagMatchCount(d0, d1, d2), 9);
  }
  /* any SINGLE dword difference -> no row (-1) — the compare is all
     three full dwords. */
  assert.equal(pgdSiblingTagCompare(0, 0x4141534a, 0x53474e43, 0x30455641), 0);
  assert.equal(pgdSiblingTagCompare(0, 0x41415349, 0x53474e42, 0x30455641), 0);
  assert.equal(pgdSiblingTagCompare(0, 0x41415349, 0x53474e43, 0x30455640), 0);
  assert.equal(pgdSiblingTagFirstMatch(0x41415349, 0xffffffff, 0xffffffff), -1);
  assert.equal(pgdSiblingTagFirstMatch(0xffffffff, 0xffffffff, 0xffffffff), -1);
  assert.equal(pgdSiblingTagMatchSection(0x41415349, 0xffffffff, 0xffffffff), 0);
  assert.equal(pgdSiblingTagMatchCount(0x41415349, 0xffffffff, 0xffffffff), 0);
  /* header rows: sections 6/7/8 with elemCounts 9/10/10. */
  for (let i = 0; i < 3; ++i) {
    assert.equal(pgdSiblingTagHeaderVa(i), REF_V26_TAGS[i].va);
    assert.equal(pgdSiblingTagHeaderSection(i), REF_V26_TAGS[i].section);
    assert.equal(pgdSiblingTagHeaderCount(i), REF_V26_TAGS[i].count);
  }
  assert.equal(pgdSiblingTagHeaderVa(3), 0);
  assert.equal(pgdSiblingTagHeaderSection(3), 0);
  assert.equal(pgdSiblingTagHeaderCount(3), 0);
  /* size gate: only UNSIGNED section >= 8 is checked, against the
     HOST 0x683580 checksum (ebx); mismatch -> log (1, 0xb1ba00) +
     FAIL. Sections 6/7 skip entirely. */
  for (const s of [6, 7]) {
    for (const c of [0, 1, 0xffffffff]) {
      assert.equal(pgdSiblingSizeGate(s, c, 0), 0, `section ${s} never checked`);
      assert.equal(pgdSiblingSizeGate(s, c, 0xdeadbeef), 0);
    }
  }
  assert.equal(pgdSiblingSizeGate(8, 0x1234, 0x1234), 0);
  assert.equal(pgdSiblingSizeGate(8, 0x1234, 0x1235), 1);
  assert.equal(pgdSiblingSizeGate(8, 0, 0), 0);
  assert.equal(pgdSiblingSizeGate(8, 0, 1), 1);
  /* WIDE unsigned-vs-signed: 0x80000000/0xffffffff are >= 8
     UNSIGNED, so the check runs (a signed gate would skip them). */
  assert.equal(pgdSiblingSizeGate(0x80000000, 1, 2), 1);
  assert.equal(pgdSiblingSizeGate(0xffffffff, 1, 2), 1);
  assert.equal(pgdSiblingSizeGate(0x80000000, 0xdeadbeef, 0xdeadbeef), 0);
  assert.equal(pgdSiblingCountCheckVa(), 0x0041d748);
  assert.equal(pgdSiblingSizeCheckSection(), 8);
  assert.equal(pgdSiblingTagMissVa(), 0x0041dd51);
  assert.equal(pgdSiblingTagMissLogVa(), 0x00b1b9c8);
  assert.equal(pgdSiblingCountMismatchLogVa(), 0x00b1ba00);
});

test("PE truth: v26 PGDREADER2 record-loop gates + 10 rows (model + ref)", () => {
  /* entry gates: SIGNED 0 <= prev < elemCount (9/0xa). */
  for (const [prev, ec] of [[0, 9], [8, 9], [0, 10], [9, 10], [1, 9]]) {
    assert.equal(pgdSiblingEntryGate(prev, ec), 1, `entry ${prev}/${ec}`);
    assert.equal(pgdSiblingEntryGate(prev, ec), refV26EntryGate(prev, ec));
  }
  for (const [prev, ec] of [[9, 9], [10, 10], [-1, 9], [-2, 10], [0x80000000, 9]]) {
    assert.equal(pgdSiblingEntryGate(prev, ec), 0, `entry ${prev}/${ec}`);
  }
  /* count gate: UNSIGNED zero-only skip. */
  assert.equal(pgdSiblingRecordCountGate(0), 1);
  for (const c of [1, 2, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(pgdSiblingRecordCountGate(c), 0, `count ${c >>> 0}`);
  }
  /* dispatch: UNSIGNED (section-1) <= 9 -> 0..9 else -1. */
  for (let s = 1; s <= 10; ++s) {
    assert.equal(pgdSiblingDispatchIndex(s), s - 1, `dispatch ${s}`);
    assert.equal(refV26DispatchIndex(s), s - 1);
  }
  for (const bad of [0, 11, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(pgdSiblingDispatchIndex(bad), -1, `dispatch ${bad >>> 0}`);
    assert.equal(refV26DispatchIndex(bad), -1);
  }
  assert.equal(pgdSiblingDispatchTableVa(), 0x0041dd7c);
  assert.equal(pgdSiblingDispatchEntries(), 10);
  /* the 10 rows by section id: store off / width / clamp / setg /
     log / target. */
  for (let s = 1; s <= 10; ++s) {
    const r = s - 1;
    assert.equal(pgdSiblingSectionRowIndex(s), r);
    assert.equal(pgdSiblingSectionStoreOff(s), REF_V26_OFFS[r], `off ${s}`);
    assert.equal(pgdSiblingSectionElemWidth(s), REF_V26_WIDTHS[r], `width ${s}`);
    assert.equal(pgdSiblingSectionClampMax(s), REF_V26_CLAMPS[r], `clamp ${s}`);
    assert.equal(pgdSiblingSectionFlagNormalize(s), REF_V26_SETG[r], `setg ${s}`);
    assert.equal(pgdSiblingSectionLogVa(s), REF_V26_LOGS[r], `log ${s}`);
    assert.equal(pgdSiblingSectionTargetVa(s), REF_V26_TARGETS[r], `target ${s}`);
  }
  for (const bad of [0, 11, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(pgdSiblingSectionRowIndex(bad), -1);
    assert.equal(pgdSiblingSectionStoreOff(bad), 0);
    assert.equal(pgdSiblingSectionElemWidth(bad), 0);
    assert.equal(pgdSiblingSectionClampMax(bad), 0);
    assert.equal(pgdSiblingSectionFlagNormalize(bad), 0);
    assert.equal(pgdSiblingSectionLogVa(bad), 0);
    assert.equal(pgdSiblingSectionTargetVa(bad), 0);
    assert.equal(pgdSiblingSectionLoopIterations(bad, 0, 0), 0);
  }
  /* the composed per-row loop law: byte rows min(avail, clamped)
     exact for every u32 pair; dword rows the v24 closed form; the
     count clamps to the ROW max FIRST (cmova). */
  assert.equal(pgdSiblingSectionLoopIterations(1, 0x100, 0x1ff), 0x100); /* avail binds: min(0x100, 0x115) */
  assert.equal(pgdSiblingSectionLoopIterations(1, 5, 0x1ff), 5);
  assert.equal(pgdSiblingSectionLoopIterations(1, 0xffffffff, 0x115), 0x115);
  assert.equal(pgdSiblingSectionLoopIterations(1, 0xfffffffd, 0xffffffff), 0x115);
  assert.equal(pgdSiblingSectionLoopIterations(2, 0x100, 0x1ff), 0x40);
  assert.equal(pgdSiblingSectionLoopIterations(2, 5, 0x1ff), 2);
  assert.equal(pgdSiblingSectionLoopIterations(2, 0xfffffffd, 0xa2), 0xa2);
  assert.equal(pgdSiblingSectionLoopIterations(2, 0, 0x1ff), 0);
  assert.equal(pgdSiblingSectionLoopIterations(4, 0xfffffffd, 0xffffffff), 0x1ba);
  assert.equal(pgdSiblingSectionLoopIterations(4, 0x100, 0xffffffff), 0x100);
  assert.equal(pgdSiblingSectionLoopIterations(5, 0x100, 0x100), 7);
  assert.equal(pgdSiblingSectionLoopIterations(5, 3, 0x100), 3);
  assert.equal(pgdSiblingSectionLoopIterations(9, 0x200, 0x1000), 1);
  assert.equal(pgdSiblingSectionLoopIterations(9, 0x4, 0x1000), 1);
  assert.equal(pgdSiblingSectionLoopIterations(9, 0x3, 0x1000), 1);
  assert.equal(pgdSiblingSectionLoopIterations(10, 0xffffffff, 0x4d), 0x4d);
  /* and the reference agrees on every fixed edge. */
  for (const [s, a, c] of [[1, 0xffffffff, 0x115], [2, 0xfffffffd, 0xa2],
    [4, 0xfffffffe, 0xffffffff], [5, 0x100, 0x100], [9, 0xfffffffd, 0xffffffff]]) {
    assert.equal(pgdSiblingSectionLoopIterations(s, a, c), refV26SectionLoopIterations(s, a, c));
  }
  /* tails: success al=1 @0x41d928 -> ret 0x41d93a; fail 0x41dd64 ->
     ret 0x41dd76; both ret 4 (one stack arg). */
  assert.equal(pgdSiblingSuccessVa(), 0x0041d928);
  assert.equal(pgdSiblingRetOkVa(), 0x0041d93a);
  assert.equal(pgdSiblingFailTailVa(), 0x0041dd64);
  assert.equal(pgdSiblingFailRetVa(), 0x0041dd76);
  assert.equal(pgdSiblingRetStackBytes(), 4);
  /* version reads: snap+0x6dc before the record loop, snap+0x6e0 at
     FINISH — both stream reads (1, 4), UNCONDITIONAL on their paths. */
  assert.equal(pgdSiblingVersionOff(), 0x6dc);
  assert.equal(pgdSiblingVersionFinishOff(), 0x6e0);
  assert.equal(pgdSiblingVersionBytes(), 8);
  assert.equal(pgdSiblingVersionReadCount(), 1);
  assert.equal(pgdSiblingVersionReadWidth(), 4);
});

test("PE truth: v26 PGDREADER2 randomized differential (model vs ref)", () => {
  const rng = makeRng(0x41d670);
  const sections = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0x100, 0x80000000, 0xffffffff];
  const wide = [0, 1, 4, 7, 0x100, 0x1ff, 0x115, 0x1ba, 0xfffffffd, 0xfffffffe, 0xffffffff, 0x80000000];
  const dwords = [0x41415349, 0x53474e43, 0x30455641, 0, 1, 0xffffffff, 0x80000000, 0xdeadbeef];
  for (let n = 0; n < 4000; ++n) {
    const section = sections[pick(rng, sections.length)];
    const expIdx = refV26DispatchIndex(section);
    assert.equal(pgdSiblingDispatchIndex(section), expIdx, `dispatch ${section >>> 0}`);
    assert.equal(pgdSiblingSectionRowIndex(section), refV26SectionRowIndex(section));
    assert.equal(pgdSiblingSectionStoreOff(section), refV26SectionStoreOff(section), `off ${section >>> 0}`);
    assert.equal(pgdSiblingSectionElemWidth(section), refV26SectionElemWidth(section));
    assert.equal(pgdSiblingSectionClampMax(section), refV26SectionClampMax(section));
    assert.equal(pgdSiblingSectionFlagNormalize(section), refV26SectionFlagNormalize(section));
    assert.equal(pgdSiblingSectionLogVa(section), refV26SectionLogVa(section));
    assert.equal(pgdSiblingSectionTargetVa(section), refV26SectionTargetVa(section));
    const avail = wide[pick(rng, wide.length)];
    const count = rng() & 0x3ff;
    const expLoop = refV26SectionLoopIterations(section, avail, count);
    assert.equal(pgdSiblingSectionLoopIterations(section, avail, count) >>> 0, expLoop >>> 0,
      `loop ${section >>> 0}/${avail >>> 0}/${count >>> 0}`);
    const d0 = dwords[pick(rng, dwords.length)], d1 = dwords[pick(rng, dwords.length)], d2 = dwords[pick(rng, dwords.length)];
    assert.equal(pgdSiblingTagCompare(0, d0, d1, d2), refV26TagCompare(0, d0, d1, d2));
    assert.equal(pgdSiblingTagFirstMatch(d0, d1, d2), refV26TagFirstMatch(d0, d1, d2), `match ${d0 >>> 0}/${d1 >>> 0}/${d2 >>> 0}`);
    assert.equal(pgdSiblingTagMatchSection(d0, d1, d2), refV26TagMatchSection(d0, d1, d2));
    assert.equal(pgdSiblingTagMatchCount(d0, d1, d2), refV26TagMatchCount(d0, d1, d2));
    const fc = rng() >>> 0;
    const cs = rng() >>> 0;
    assert.equal(pgdSiblingSizeGate(section, fc, cs), refV26SizeGate(section, fc, cs), `size ${section >>> 0}`);
    const prev = (rng() >>> 0) | 0;
    const ec = (rng() >>> 27) & 0xff;
    assert.equal(pgdSiblingEntryGate(prev, ec), refV26EntryGate(prev, ec), `entry ${prev}/${ec}`);
    assert.equal(pgdSiblingRecordCountGate(fc), refV26RecordCountGate(fc));
  }
});

test("PE truth: v26 mutant guards — PGDIVER + PGDREADER2 stay machine-exact", () => {
  /* MV1: the size gate is UNSIGNED (`cmp edi,8 ; jb`) — a SIGNED
     mutant would skip 0x80000000/0xffffffff (negative) sections; the
     machine checks them. */
  assert.equal(pgdSiblingSizeGate(0x80000000, 1, 2), 1);
  assert.equal(pgdSiblingSizeGate(0xffffffff, 1, 2), 1);
  assert.notEqual(pgdSiblingSizeGate(0x80000000, 1, 2), 0);
  /* MV2: the tag compare is ALL THREE full dwords — a d0-only mutant
     would match rows 0..2 on d0 alone (all three share 0x41415349). */
  assert.equal(pgdSiblingTagCompare(0, 0x41415349, 0xffffffff, 0xffffffff), 0);
  assert.equal(pgdSiblingTagFirstMatch(0x41415349, 0xffffffff, 0xffffffff), -1);
  assert.equal(pgdSiblingTagFirstMatch(0x41415349, 0x53474e43, 0x30455641), 0);
  /* MV3: the +0x4a0 version-read gate fires from tag ROW 4 — a
     row >= 3 mutant would read the version for section-3 headers. */
  assert.equal(pgdImportVersionGateRow(3), 0);
  assert.equal(pgdImportVersionGateRow(4), 1);
  assert.equal(pgdImportVersionGateRow(9), 1);
  assert.equal(pgdImportVersionGateSection(3), 0);
  assert.equal(pgdImportVersionGateSection(4), 1);
  /* MV4: the +0x4a4 finish gate is UNSIGNED `cmp 6 ; jb` — wide
     sections 0x80000000/0xffffffff fire the read (>= 6 unsigned). */
  assert.equal(pgdImportFinishGate(0x80000000), 1);
  assert.equal(pgdImportFinishGate(0xffffffff), 1);
  assert.equal(pgdImportFinishGate(6), 1);
  assert.equal(pgdImportFinishGate(5), 0);
  /* MV5: the composed sibling loop clamps the COUNT to the row max
     FIRST (cmova) — a no-clamp mutant would write avail bytes on
     section 9 (clamp 1). */
  assert.equal(pgdSiblingSectionLoopIterations(9, 0x200, 0x1000), 1);
  assert.equal(pgdSiblingSectionLoopIterations(5, 0x100, 0x100), 7);
  assert.equal(pgdSiblingSectionLoopIterations(1, 0xffffffff, 0xffffffff), 0x115);
  assert.notEqual(pgdSiblingSectionLoopIterations(9, 0x200, 0x1000), 0x200);
  /* ABI 26 on both sides. */
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(pgdSiblingReaderVa(), 0x0041d670);
  assert.equal(pgdImportReaderVa(), 0x009e4260);
});

test("Wasm matches JS: v26 PGDIVER + PGDREADER2 (wasm differential)", () => {
  /* version gates (import reader 0x009e4260). */
  for (let row = 0; row < 12; ++row) {
    assert.equal(wasm.isaac_pgd_import_version_gate_row(row), pgdImportVersionGateRow(row), `gate row ${row}`);
  }
  for (const s of [0, 2, 3, 4, 5, 6, 7, 0x100, 0x80000000, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_import_version_gate_section(s), pgdImportVersionGateSection(s), `gate sec ${s >>> 0}`);
    assert.equal(wasm.isaac_pgd_import_finish_gate(s), pgdImportFinishGate(s), `finish ${s >>> 0}`);
  }
  assert.equal(wasm.isaac_pgd_import_version_off(), pgdImportVersionOff());
  assert.equal(wasm.isaac_pgd_import_version_bytes(), pgdImportVersionBytes());
  assert.equal(wasm.isaac_pgd_import_version_read_count(), pgdImportVersionReadCount());
  assert.equal(wasm.isaac_pgd_import_version_read_width(), pgdImportVersionReadWidth());
  assert.equal(wasm.isaac_pgd_import_version_finish_off(), pgdImportVersionFinishOff());
  assert.equal(wasm.isaac_pgd_import_version_finish_default(), pgdImportVersionFinishDefault());
  assert.equal(wasm.isaac_pgd_import_tag_fail_ret_va(), pgdImportTagFailRetVa());
  assert.equal(wasm.isaac_pgd_import_tag_fail_log_argc(), pgdImportTagFailLogArgc());
  assert.equal(wasm.isaac_pgd_import_tag_fail_returns_zero(), pgdImportTagFailReturnsZero());
  /* sibling tag table. */
  const D0 = 0x41415349, D1 = 0x53474e43, D2 = 0x30455641;
  for (let i = 0; i < 4; ++i) {
    assert.equal(wasm.isaac_pgd_sibling_tag_compare(i, D0, D1, D2), pgdSiblingTagCompare(i, D0, D1, D2), `cmp ${i}`);
  }
  assert.equal(wasm.isaac_pgd_sibling_tag_first_match(D0, D1, D2), 0);
  assert.equal(wasm.isaac_pgd_sibling_tag_first_match(D0, 0xffffffff, 0xffffffff), -1);
  assert.equal(wasm.isaac_pgd_sibling_tag_match_section(D0, D1, D2), 6);
  assert.equal(wasm.isaac_pgd_sibling_tag_match_count(D0, D1, D2), 9);
  assert.equal(wasm.isaac_pgd_sibling_tag_header_va(2), pgdSiblingTagHeaderVa(2));
  assert.equal(wasm.isaac_pgd_sibling_tag_header_section(1), 7);
  assert.equal(wasm.isaac_pgd_sibling_tag_header_count(2), 10);
  assert.equal(wasm.isaac_pgd_sibling_tag_compare_bytes(), 0xc);
  assert.equal(wasm.isaac_pgd_sibling_tag_compare_dwords(), 3);
  assert.equal(wasm.isaac_pgd_sibling_tag_read_bytes(), 0x10);
  /* size gate + tails. */
  assert.equal(wasm.isaac_pgd_sibling_size_gate(8, 0x1234, 0x1235), 1);
  assert.equal(wasm.isaac_pgd_sibling_size_gate(8, 0x1234, 0x1234), 0);
  assert.equal(wasm.isaac_pgd_sibling_size_gate(6, 0x1234, 0x5678), 0);
  assert.equal(wasm.isaac_pgd_sibling_size_gate(0x80000000, 1, 2), 1);
  assert.equal(wasm.isaac_pgd_sibling_count_check_va(), 0x0041d748);
  assert.equal(wasm.isaac_pgd_sibling_size_check_section(), 8);
  assert.equal(wasm.isaac_pgd_sibling_tag_miss_va(), 0x0041dd51);
  assert.equal(wasm.isaac_pgd_sibling_tag_miss_log_va(), 0x00b1b9c8);
  assert.equal(wasm.isaac_pgd_sibling_count_mismatch_log_va(), 0x00b1ba00);
  assert.equal(wasm.isaac_pgd_sibling_success_va(), 0x0041d928);
  assert.equal(wasm.isaac_pgd_sibling_ret_ok_va(), 0x0041d93a);
  assert.equal(wasm.isaac_pgd_sibling_fail_tail_va(), 0x0041dd64);
  assert.equal(wasm.isaac_pgd_sibling_fail_ret_va(), 0x0041dd76);
  assert.equal(wasm.isaac_pgd_sibling_ret_stack_bytes(), 4);
  assert.equal(wasm.isaac_pgd_sibling_version_off(), 0x6dc);
  assert.equal(wasm.isaac_pgd_sibling_version_finish_off(), 0x6e0);
  assert.equal(wasm.isaac_pgd_sibling_version_bytes(), 8);
  assert.equal(wasm.isaac_pgd_sibling_version_read_count(), 1);
  assert.equal(wasm.isaac_pgd_sibling_version_read_width(), 4);
  /* record-loop gates. */
  assert.equal(wasm.isaac_pgd_sibling_entry_gate(0, 9), 1);
  assert.equal(wasm.isaac_pgd_sibling_entry_gate(9, 9), 0);
  assert.equal(wasm.isaac_pgd_sibling_entry_gate(-1, 9), 0);
  assert.equal(wasm.isaac_pgd_sibling_entry_gate(9, 10), 1);
  assert.equal(wasm.isaac_pgd_sibling_record_count_gate(0), 1);
  assert.equal(wasm.isaac_pgd_sibling_record_count_gate(1), 0);
  assert.equal(wasm.isaac_pgd_sibling_record_count_gate(0xffffffff), 0);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_index(1), 0);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_index(10), 9);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_index(11), -1);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_index(0), -1);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_index(0x80000000), -1);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_table_va(), 0x0041dd7c);
  assert.equal(wasm.isaac_pgd_sibling_dispatch_entries(), 10);
  /* the 10 rows keyed by section + the composed loop law. */
  for (let s = 1; s <= 10; ++s) {
    const r = s - 1;
    assert.equal(wasm.isaac_pgd_sibling_section_row_index(s), r, `row ${s}`);
    assert.equal(wasm.isaac_pgd_sibling_section_store_off(s), REF_V26_OFFS[r]);
    assert.equal(wasm.isaac_pgd_sibling_section_elem_width(s), REF_V26_WIDTHS[r]);
    assert.equal(wasm.isaac_pgd_sibling_section_clamp_max(s), REF_V26_CLAMPS[r]);
    assert.equal(wasm.isaac_pgd_sibling_section_flag_normalize(s), REF_V26_SETG[r]);
    assert.equal(wasm.isaac_pgd_sibling_section_log_va(s) >>> 0, REF_V26_LOGS[r] >>> 0);
    assert.equal(wasm.isaac_pgd_sibling_section_target_va(s) >>> 0, REF_V26_TARGETS[r] >>> 0);
  }
  assert.equal(wasm.isaac_pgd_sibling_section_row_index(0), -1);
  assert.equal(wasm.isaac_pgd_sibling_section_row_index(11), -1);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(1, 0x100, 0x1ff), 0x100);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(2, 0x100, 0x1ff), 0x40);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(4, 0xfffffffd, 0xffffffff) >>> 0, 0x1ba);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(9, 0x200, 0x1000), 1);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(5, 0x100, 0x100), 7);
  assert.equal(wasm.isaac_pgd_sibling_section_loop_iterations(10, 0xffffffff, 0x4d) >>> 0, 0x4d);
  /* ABI 34 in the wasm too (in-test rebuild; the v26 laws ride along). */
  assert.equal(wasm.isaac_pgd_pure_helpers_abi_version(), 35);
});

/* =====================================================================
   ABI v27 — PGDIEC (IncreaseEventCounter 0x00929b40 threshold cascade)
   Evidence: section-notes/pgd-v28-929b40/ + cpu-dump/00929b40.txt +
   cpu-dump/00929e38.txt. The 52 direct gate rows below are transcribed
   from the raw instruction stream (cmp/test VA, counter offset,
   threshold, unlock ids, TryUnlock call VAs), NOT from the C++ table.
   The group walk 0x92a000..0x92a253 + the five derived tail gates are
   HOST (.data table 0xc35ed0 / vectors 0xbabxxx, runtime-mutable).
   ===================================================================== */

const PGDIEC_EXPECTED_ROWS = [
  { kind: PGDIEC_KIND_NONZERO, gateVa: 0x00929b8d, off: 0x5e4, off2: 0, thr: 0, ids: [0x167], calls: [0x00929b98] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ba3, off: 0x5e4, off2: 0, thr: 0xa, ids: [0x181], calls: [0x00929baf] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929bb4, off: 0x5dc, off2: 0, thr: 0xa, ids: [0x179], calls: [0x00929bc4] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929bc9, off: 0x5e0, off2: 0, thr: 5, ids: [0x17e], calls: [0x00929bd9] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929be4, off: 0x2c4, off2: 0, thr: 0x64, ids: [0x55], calls: [0x00929bed] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929bf8, off: 0x2c4, off2: 0, thr: 0x1f4, ids: [0x15e], calls: [0x00929c06] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c11, off: 0x2c8, off2: 0, thr: 0xa, ids: [0x1c], calls: [0x00929c1a] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c25, off: 0x2c8, off2: 0, thr: 0x64, ids: [0xc], calls: [0x00929c2e] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c33, off: 0x2d8, off2: 0, thr: 4, ids: [0x24], calls: [0x00929c40] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c45, off: 0x2e0, off2: 0, thr: 0xa, ids: [0x1a], calls: [0x00929c52] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c57, off: 0x2d0, off2: 0, thr: 0x64, ids: [0x91], calls: [0x00929c67] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c6c, off: 0x5c4, off2: 0, thr: 5, ids: [0x161], calls: [0x00929c7c] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c87, off: 0x2e8, off2: 0, thr: 0xa, ids: [0x44], calls: [0x00929c90] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929c9b, off: 0x2e8, off2: 0, thr: 5, ids: [0x39], calls: [0x00929ca4] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ca9, off: 0x2f0, off2: 0, thr: 5, ids: [0x4e], calls: [0x00929cb6] },
  { kind: PGDIEC_KIND_PAIR, gateVa: 0x00929cbb, off: 0x31c, off2: 0x320, thr: 0, ids: [0x29], calls: [0x00929cd1] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929cd6, off: 0x2e4, off2: 0, thr: 0x64, ids: [0x1e], calls: [0x00929ce3] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929cee, off: 0x2c0, off2: 0, thr: 1, ids: [0x51], calls: [0x00929cf7] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d02, off: 0x2c0, off2: 0, thr: 2, ids: [0x96], calls: [0x00929d0e] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d19, off: 0x2c0, off2: 0, thr: 3, ids: [8], calls: [0x00929d22] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d2d, off: 0x2c0, off2: 0, thr: 4, ids: [0x8b], calls: [0x00929d39] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d44, off: 0x2c0, off2: 0, thr: 5, ids: [0x21], calls: [0x00929d4d] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d58, off: 0x2c0, off2: 0, thr: 6, ids: [0x8c], calls: [0x00929d64] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d6f, off: 0x2c0, off2: 0, thr: 7, ids: [0x8d], calls: [0x00929d7b] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d86, off: 0x2c0, off2: 0, thr: 8, ids: [0xa], calls: [0x00929d8f] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929d9a, off: 0x2c0, off2: 0, thr: 9, ids: [0xb], calls: [0x00929da3] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929dae, off: 0x2c0, off2: 0, thr: 0xa, ids: [0x20, 0xea], calls: [0x00929db7, 0x00929dc3] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929dce, off: 0x2c0, off2: 0, thr: 0xb, ids: [0x22, 0x156], calls: [0x00929dd7, 0x00929dee] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929df9, off: 0x2c0, off2: 0, thr: 0x10, ids: [0x157], calls: [0x00929e05] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e10, off: 0x2c0, off2: 0, thr: 0x15, ids: [0x158], calls: [0x00929e1c] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e27, off: 0x2c0, off2: 0, thr: 0x1e, ids: [0x159], calls: [0x00929e33] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e38, off: 0x2ec, off2: 0, thr: 0x14, ids: [0x3d], calls: [0x00929e45] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e4a, off: 0x2f4, off2: 0, thr: 0x64, ids: [0x40], calls: [0x00929e57] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e62, off: 0x2f8, off2: 0, thr: 0xa, ids: [0x42], calls: [0x00929e6b] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e76, off: 0x2f8, off2: 0, thr: 0x19, ids: [0x17c], calls: [0x00929e82] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929e8d, off: 0x2fc, off2: 0, thr: 0x14, ids: [0x8e], calls: [0x00929e99] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ea4, off: 0x2fc, off2: 0, thr: 0x19, ids: [0x178], calls: [0x00929eb0] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ebb, off: 0x2fc, off2: 0, thr: 0x32, ids: [0x17f], calls: [0x00929ec7] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ecc, off: 0x300, off2: 0, thr: 0x1e, ids: [0x93], calls: [0x00929edc] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929ee1, off: 0x304, off2: 0, thr: 0x1e, ids: [0x94], calls: [0x00929ef1] },
  { kind: PGDIEC_KIND_MODE, gateVa: 0x00929ef6, off: 0x5b4, off2: 0, thr: 0x1f, ids: [0x145], calls: [0x00929f11] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f16, off: 0x5bc, off2: 0, thr: 5, ids: [0x150], calls: [0x00929f26] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f2b, off: 0x5c0, off2: 0, thr: 7, ids: [0x162], calls: [0x00929f3b] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f40, off: 0x5c8, off2: 0, thr: 0x14, ids: [0x166], calls: [0x00929f50] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f55, off: 0x5cc, off2: 0, thr: 0x14, ids: [0x16a], calls: [0x00929f65] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f6a, off: 0x5d0, off2: 0, thr: 0x32, ids: [0x16c], calls: [0x00929f7a] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f7f, off: 0x5d4, off2: 0, thr: 0x14, ids: [0x173], calls: [0x00929f8f] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929f94, off: 0x5d8, off2: 0, thr: 0x32, ids: [0x177], calls: [0x00929fa4] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929fa9, off: 0xa70, off2: 0, thr: 0xa, ids: [0x199], calls: [0x00929fb9] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929fbe, off: 0xa74, off2: 0, thr: 0xa, ids: [0x221], calls: [0x00929fce] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929fd3, off: 0xa78, off2: 0, thr: 5, ids: [0x20b], calls: [0x00929fe3] },
  { kind: PGDIEC_KIND_GE, gateVa: 0x00929fe8, off: 0x534, off2: 0, thr: 3, ids: [0x197], calls: [0x00929ff8] },
];

test("PE truth: every PGDIEC gate row is a literal transcription", () => {
  assert.equal(PGDIEC_GATE_ROWS, PGDIEC_EXPECTED_ROWS.length);
  assert.equal(PGDIEC_GATES.length, 52);
  assert.equal(PGDIEC_UNLOCK_CALLS, 54);
  for (let i = 0; i < PGDIEC_EXPECTED_ROWS.length; i++) {
    const e = PGDIEC_EXPECTED_ROWS[i];
    const g = pgdIecGateRow(i);
    assert.ok(g, `row ${i} exists`);
    assert.equal(g.kind, e.kind, `row ${i} kind`);
    assert.equal(g.gateVa, e.gateVa, `row ${i} gateVa`);
    assert.equal(g.off, e.off, `row ${i} off`);
    assert.equal(g.off2, e.off2, `row ${i} off2`);
    assert.equal(g.thr, e.thr, `row ${i} thr`);
    assert.equal(g.id, e.ids[0], `row ${i} id0`);
    assert.equal(g.id2, e.ids[1] ?? 0, `row ${i} id1`);
    assert.equal(g.callVa, e.calls[0], `row ${i} call0`);
    assert.equal(g.callVa2, e.calls[1] ?? 0, `row ${i} call1`);
  }
  assert.equal(pgdIecGateRow(-1), null);
  assert.equal(pgdIecGateRow(52), null);
  /* rows 27/28 (0-indexed 26/27) fire TWO unlocks per gate */
  assert.equal(PGDIEC_GATES[26].id2, 0xea);
  assert.equal(PGDIEC_GATES[27].id2, 0x156);
});

test("PE truth: PGDIEC gate semantics (unsigned jb / nonzero / pair / mode)", () => {
  /* GE rows: `cmp u32, IMM ; jb skip` — UNSIGNED. 0xffffffff and
     0x80000000 (both "negative" as i32) MUST fire. */
  assert.equal(pgdIecGateFires(1, 0xa, 0, 0), 1);      /* 0x5e4 >= 0xa */
  assert.equal(pgdIecGateFires(1, 9, 0, 0), 0);
  assert.equal(pgdIecGateFires(1, 0xffffffff, 0, 0), 1); /* u32, NOT signed */
  assert.equal(pgdIecGateFires(1, 0x80000000, 0, 0), 1);
  assert.equal(pgdIecGateFires(1, 0x7fffffff, 0, 0), 1);
  assert.equal(pgdIecGateFires(5, 0x1f4, 0, 0), 1);    /* 0x2c4 >= 0x1f4 */
  assert.equal(pgdIecGateFires(5, 0x1f3, 0, 0), 0);
  /* row 0: NONZERO `test eax,eax ; je` */
  assert.equal(pgdIecGateFires(0, 0, 0, 0), 0);
  assert.equal(pgdIecGateFires(0, 1, 0, 0), 1);
  assert.equal(pgdIecGateFires(0, 0x100, 0, 0), 1);
  assert.equal(pgdIecGateFires(0, 0xffffffff, 0, 0), 1);
  /* row 15: PAIR — 0x31c AND 0x320 both nonzero (jbe-vs-0) */
  assert.equal(pgdIecGateFires(15, 0, 0, 0), 0);
  assert.equal(pgdIecGateFires(15, 1, 0, 0), 0);
  assert.equal(pgdIecGateFires(15, 0, 1, 0), 0);
  assert.equal(pgdIecGateFires(15, 1, 1, 0), 1);
  assert.equal(pgdIecGateFires(15, 0xffffffff, 0x80000000, 0), 1);
  /* row 40: MODE — u32 >= 0x1f AND mode dword == 1 (FULL dword) */
  assert.equal(pgdIecGateFires(40, 0x1f, 0, 1), 1);
  assert.equal(pgdIecGateFires(40, 0x1e, 0, 1), 0);
  assert.equal(pgdIecGateFires(40, 0x1f, 0, 0), 0);
  assert.equal(pgdIecGateFires(40, 0x1f, 0, 2), 0);
  assert.equal(pgdIecGateFires(40, 0x1f, 0, 0x100), 0);
  assert.equal(pgdIecGateFires(40, 0xffffffff, 0, 1), 1);
  /* out of range */
  assert.equal(pgdIecGateFires(-1, 0, 0, 0), 0);
  assert.equal(pgdIecGateFires(52, 0, 0, 0), 0);
});

test("PE truth: PGDIEC readonly gate + counter store + dirty law", () => {
  /* `cmp byte [esi+1],0 ; jne skip-all` @0x929b5e — LOW BYTE. */
  assert.equal(pgdIecGateOpen(0), 1);
  assert.equal(pgdIecGateOpen(1), 0);
  assert.equal(pgdIecGateOpen(0x100), 1);
  assert.equal(pgdIecGateOpen(0xffffffff), 0);
  assert.equal(pgdIecReadonlyOff(), 1);
  /* UNCHECKED slot offset: 0x2bc + 4*slot mod 2^32 */
  assert.equal(pgdIecCounterStoreOff(0), 0x2bc);
  assert.equal(pgdIecCounterStoreOff(1), 0x2c0);
  assert.equal(pgdIecCounterStoreOff(188), 0x5ac);
  assert.equal(pgdIecCounterStoreOff(496), 0xa7c);
  assert.equal(pgdIecCounterStoreOff(0xffffffff) >>> 0, (0x2bc + 4 * 0xffffffff) >>> 0);
  assert.equal(pgdIecCounterBase(), PGD_OFF_EVENT_COUNTERS);
  /* dirty store fires iff the readonly gate opens (before cascade) */
  assert.equal(pgdIecDirtyFires(0), 1);
  assert.equal(pgdIecDirtyFires(1), 0);
  assert.equal(pgdIecDirtyFires(0x100), 1);
  assert.equal(pgdIecDirtyOff(), 0);
});

test("PGDIEC unlock composition (ids per row) + host classification pins", () => {
  assert.deepEqual(pgdIecUnlocksAt(0, 1, 0, 0), [0x167]);
  assert.deepEqual(pgdIecUnlocksAt(26, 0xa, 0, 0), [0x20, 0xea]);
  assert.deepEqual(pgdIecUnlocksAt(27, 0xb, 0, 0), [0x22, 0x156]);
  assert.deepEqual(pgdIecUnlocksAt(26, 9, 0, 0), []);
  assert.deepEqual(pgdIecUnlocksAt(15, 1, 1, 0), [0x29]);
  assert.deepEqual(pgdIecUnlocksAt(40, 0x1f, 0, 1), [0x145]);
  /* VA pins + host residuals */
  assert.equal(pgdIecVa(), 0x00929b40);
  assert.equal(pgdIecRetVa(), 0x0092a2c8);
  assert.equal(pgdIecBodyBytes(), 1928);
  assert.equal(pgdIecCallSiteCount(), 74);
  assert.equal(pgdIecHostTryUnlockVa(), 0x00929a20);
  assert.equal(pgdIecHostCookieVa(), 0x00aef12b);
  assert.equal(PGDIEC_MODE_GLOBAL_VA, 0x00c7169c);
  assert.equal(PGDIEC_MODE_GLOBAL_OFF, 8);
  assert.equal(PGDIEC_MODE_VALUE, 1);
  /* the group walk is .data-driven -> HOST (census pins only) */
  assert.equal(PGDIEC_GROUP_WALK_VA, 0x0092a000);
  assert.equal(PGDIEC_GROUP_TABLE_VA, 0x00c35ed0);
  assert.equal(PGDIEC_GROUP_STRIDE, 0x90);
});

test("header and model record the exact PGDIEC constants (ABI 26 -> 27)", () => {
  const h = readFileSync(header, "utf8");
  const lit = (name, value) =>
    assert.match(h, new RegExp(`${name}\\s*=\\s*${value}\\b`),
      `${name} must be ${value}`);
  lit("ISAAC_PGDIEC_VA", "0x00929b40u");
  lit("ISAAC_PGDIEC_RET_VA", "0x0092a2c8u");
  lit("ISAAC_PGDIEC_BODY_BYTES", "1928");
  lit("ISAAC_PGDIEC_CALL_SITES", "74");
  lit("ISAAC_PGDIEC_HOST_VA_TRY_UNLOCK", "0x00929a20u");
  lit("ISAAC_PGDIEC_HOST_VA_COOKIE", "0x00aef12bu");
  lit("ISAAC_PGDIEC_READONLY_OFF", "0x01");
  lit("ISAAC_PGDIEC_DIRTY_OFF", "0x00");
  lit("ISAAC_PGDIEC_COUNTER_BASE", "0x2bc");
  lit("ISAAC_PGDIEC_GATE_ROWS", "52");
  lit("ISAAC_PGDIEC_UNLOCK_CALLS", "54");
  lit("ISAAC_PGDIEC_KIND_GE", "1");
  lit("ISAAC_PGDIEC_KIND_NONZERO", "2");
  lit("ISAAC_PGDIEC_KIND_PAIR", "3");
  lit("ISAAC_PGDIEC_KIND_MODE", "4");
  lit("ISAAC_PGDIEC_MODE_GLOBAL_VA", "0x00c7169cu");
  lit("ISAAC_PGDIEC_MODE_GLOBAL_OFF", "8");
  lit("ISAAC_PGDIEC_MODE_VALUE", "1");
  lit("ISAAC_PGDIEC_GROUP_WALK_VA", "0x0092a000u");
  lit("ISAAC_PGDIEC_GROUP_TABLE_VA", "0x00c35ed0u");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /v27 \(this unit\) lands PGDIEC/);
  assert.match(h, /ISAAC_PGDIEC_GATE_ROWS = 52/);
  assert.match(h, /UNSIGNED except row 1/);
  assert.match(h, /0xc35ed0/);
  assert.match(h, /0x92a253/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGDIEC/);
  assert.match(m, /v27: PGDIEC/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGDIEC_VA, 0x00929b40);
  assert.equal(PGDIEC_RET_VA, 0x0092a2c8);
  assert.equal(PGDIEC_BODY_BYTES, 1928);
  assert.equal(PGDIEC_GATE_ROWS, 52);
  assert.equal(PGDIEC_UNLOCK_CALLS, 54);
});

test("PGDIEC randomized differential (model gate law vs branch transcription)", () => {
  const rng = makeRng(0x929b40);
  const wide = [0, 1, 2, 3, 4, 5, 0xa, 0xb, 0x10, 0x1e, 0x1f, 0x32, 0x64,
    0x1f4, 0x100, 0x1ff, 0xffffffff, 0x80000000, 0x7fffffff];
  for (let i = 0; i < 2000; i++) {
    const step = pick(rng, PGDIEC_GATE_ROWS);
    const c0 = wide[pick(rng, wide.length)];
    const c1 = wide[pick(rng, wide.length)];
    const mode = wide[pick(rng, wide.length)];
    const g = PGDIEC_GATES[step];
    let ref;
    if (g.kind === PGDIEC_KIND_NONZERO) {
      ref = (c0 >>> 0) !== 0 ? 1 : 0;
    } else if (g.kind === PGDIEC_KIND_PAIR) {
      ref = (c0 >>> 0) !== 0 && (c1 >>> 0) !== 0 ? 1 : 0;
    } else if (g.kind === PGDIEC_KIND_MODE) {
      ref = (c0 >>> 0) >= (g.thr >>> 0) && (mode >>> 0) === 1 ? 1 : 0;
    } else {
      ref = (c0 >>> 0) >= (g.thr >>> 0) ? 1 : 0;
    }
    assert.equal(pgdIecGateFires(step, c0, c1, mode), ref,
      `row ${step} c0=${c0} c1=${c1} mode=${mode}`);
  }
});

test("Wasm matches JS: PGDIEC gate laws + locks (wasm differential)", () => {
  assert.equal(wasm.isaac_pgd_iec_va() >>> 0, pgdIecVa());
  assert.equal(wasm.isaac_pgd_iec_ret_va() >>> 0, pgdIecRetVa());
  assert.equal(wasm.isaac_pgd_iec_body_bytes(), pgdIecBodyBytes());
  assert.equal(wasm.isaac_pgd_iec_call_site_count(), pgdIecCallSiteCount());
  assert.equal(wasm.isaac_pgd_iec_host_try_unlock_va() >>> 0, 0x00929a20);
  assert.equal(wasm.isaac_pgd_iec_host_cookie_va() >>> 0, 0x00aef12b);
  assert.equal(wasm.isaac_pgd_iec_gate_row_count(), pgdIecGateRowCount());
  assert.equal(wasm.isaac_pgd_iec_counter_base(), PGD_OFF_EVENT_COUNTERS);
  /* readonly byte gate */
  for (const r of [0, 1, 0x100, 0x101, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_iec_gate_open(r), pgdIecGateOpen(r), `gateOpen(${r})`);
    assert.equal(wasm.isaac_pgd_iec_dirty_fires(r), pgdIecDirtyFires(r), `dirty(${r})`);
  }
  /* counter store offset: unchecked slot */
  for (const slot of [0, 1, 188, 496, 0xffffffff, 0x80000000]) {
    assert.equal(
      wasm.isaac_pgd_iec_counter_store_off(slot) >>> 0,
      pgdIecCounterStoreOff(slot),
      `storeOff(${slot})`,
    );
  }
  /* gate rows: full table transcription + fires parity on wide corpus */
  const wide = [0, 1, 2, 3, 4, 5, 0xa, 0xb, 0x1f, 0x32, 0x64, 0x1f4,
    0x100, 0x1ff, 0xffffffff, 0x80000000, 0x7fffffff];
  const REC = SCRATCH_C;
  for (let step = 0; step < PGDIEC_GATE_ROWS; ++step) {
    assert.equal(wasm.isaac_pgd_iec_gate_row(step, REC), 1, `row ${step} ok`);
    assert.equal(readI32(view, REC + 0), step, `step ${step}`);
    assert.equal(readI32(view, REC + 4), PGDIEC_GATES[step].kind, `kind ${step}`);
    assert.equal(readU32(view, REC + 8), PGDIEC_GATES[step].gateVa, `gateVa ${step}`);
    assert.equal(readU32(view, REC + 12), PGDIEC_GATES[step].off, `off ${step}`);
    assert.equal(readU32(view, REC + 16), PGDIEC_GATES[step].off2, `off2 ${step}`);
    assert.equal(readU32(view, REC + 20), PGDIEC_GATES[step].thr, `thr ${step}`);
    assert.equal(readU32(view, REC + 24), PGDIEC_GATES[step].id, `id ${step}`);
    assert.equal(readU32(view, REC + 28), PGDIEC_GATES[step].id2, `id2 ${step}`);
    assert.equal(readU32(view, REC + 32), PGDIEC_GATES[step].callVa, `callVa ${step}`);
    assert.equal(readU32(view, REC + 36), PGDIEC_GATES[step].callVa2, `callVa2 ${step}`);
    for (const c0 of wide) for (const c1 of wide) for (const md of [0, 1, 0x100]) {
      assert.equal(
        wasm.isaac_pgd_iec_gate_fires(step, c0, c1, md),
        pgdIecGateFires(step, c0, c1, md),
        `fires ${step}/${c0}/${c1}/${md}`,
      );
    }
  }
  assert.equal(wasm.isaac_pgd_iec_gate_row(-1, REC), 0);
  assert.equal(wasm.isaac_pgd_iec_gate_row(52, REC), 0);
  assert.equal(wasm.isaac_pgd_iec_gate_fires(-1, 0, 0, 0), 0);
  assert.equal(wasm.isaac_pgd_iec_gate_fires(52, 0, 0, 0), 0);
});

/* =====================================================================
   ABI v28 — PGDULD + PGDHOST (save-cluster final host-leaf)
   Evidence: section-notes/pgd-v28-hostleaf/. PGDULD = the 0x009296c0
   tier-ladder decision island (200 bytes, ret @0x929788, 6 inbound
   call sites; 1 E8 to typed-host TryUnlock 0x929a20 @0x929773,
   0 indirects, ZERO stores to this/.data). The ladder table below is
   transcribed from the raw .rdata bytes at 0xb7b0b0 (46 u32 slots),
   NOT from the C++ table. The magic-divide count law is the raw
   multiply form (0x63e7063f = ceil(2^38/164), 2^38 = 164*M - 92);
   the BigInt oracle below is the byte-truth reference for EVERY u32
   wrap incl. the flip region (x >= M AND x mod 164 == 163) and the
   exact multiples of 164 (the -1 fold). PGDHOST: cookie stub
   0xaef12b VERIFIED PURE (8 bytes: cmp/jne/ret/jmp, 0 E8), checksum
   0x683580 VERIFIED NOT pure (SEH + vtbl) — both law-pinned.
   ===================================================================== */

const PGDU_EXPECTED_LADDER = [
  0x000, 0x000, 0x000, 0x000, 0x09d, 0x09e, 0x09f, 0x0a0, 0x0a1,
  0x0a2, 0x0a3, 0x0a4, 0x000, 0x000, 0x000, 0x000, 0x000, 0x000,
  0x000, 0x0a5, 0x0a6, 0x109, 0x10a, 0x10b, 0x10c, 0x10d, 0x10e,
  0x10f, 0x110, 0x111, 0x112, 0x115, 0x116, 0x117, 0x118, 0x119,
  0x000, 0x1fc, 0x1fd, 0x1fe, 0x1ff, 0x200, 0x201, 0x202, 0x203,
  0x204,
];

test("PGDULD constants + ladder transcription (PE truth)", () => {
  assert.equal(PGDULD_VA, 0x009296c0);
  assert.equal(PGDULD_RET_VA, 0x00929788);
  assert.equal(PGDULD_BODY_BYTES, 200);
  assert.equal(PGDULD_CALL_SITES, 6);
  assert.equal(PGDULD_HOST_VA_TRY_UNLOCK, 0x00929a20);
  assert.equal(PGDULD_TRY_UNLOCK_CALL_VA, 0x00929773);
  assert.equal(PGDULD_DIV_MAGIC, 0x63e7063f);
  assert.equal(PGDULD_DIV_SHIFT, 38);
  assert.equal(PGDULD_DIV_MOD, 164);
  assert.equal(PGDULD_GLOBAL_VA, 0x00c7169c);
  assert.equal(PGDULD_RANGE_OFF, 0x2a664);
  assert.equal(PGDULD_SEG_STRIDE, 0xa4);
  assert.equal(PGDULD_SEG_PTR_OFF, 0x48);
  assert.equal(PGDULD_SEG_COUNT_OFF, 0x4c);
  assert.equal(PGDULD_ENTRY_FLAG_OFF, 0x38);
  assert.equal(PGDULD_LADDER_TABLE_VA, 0x00b7b0b0);
  assert.equal(PGDULD_LADDER_ROWS, 46);
  assert.equal(PGDULD_TIER_MAX, 0x2d);
  assert.equal(PGDU_LADDER.length, 46);
  assert.deepEqual(Array.from(PGDU_LADDER), PGDU_EXPECTED_LADDER);
  /* magic identity: 2^38 = 164 * magic - 92 */
  assert.equal(BigInt(PGDULD_DIV_MOD) * BigInt(PGDULD_DIV_MAGIC) - 92n, 1n << 38n);
  /* tier rows used by the loop: 1..0x2d (index 0 unused) */
  assert.equal(pgdUldUnlockId(0), 0);
  assert.equal(pgdUldUnlockId(4), 0x9d);
  assert.equal(pgdUldUnlockId(45), 0x204);
  assert.equal(pgdUldUnlockId(46), 0);
  assert.equal(pgdUldUnlockId(0xffffffff), 0);
});

test("PGDULD magic-divide count (BigInt oracle parity)", () => {
  const M = BigInt(PGDULD_DIV_MAGIC);
  /* byte-truth: x = u32(end - start); p = i64(x)*M; t = sar(sar64hi,
    6); count = t - (t >= 0 ? 1 : 0). */
  const truth = (x) => {
    const s = x | 0;
    const p = BigInt(s) * M;
    let t = Number(p >> 32n);
    t = t >> 6;
    return t - (t >= 0 ? 1 : 0);
  };
  /* deterministic pseudo-random corpus */
  let seed = 0x9296c0;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed;
  };
  for (let i = 0; i < 5000; i++) {
    const x = rnd();
    assert.equal(pgdUldCount(0, x), truth(x), `x=${x}`);
  }
  /* boundaries: exact multiples of 164, the mod-164 == 163 region
     (below and above the 2^31 signed line — the multiply-high +1
     flip would need x >= 2^38/92 with x mod 164 == 163, but every
     such x is >= 2^31 where the signed imul path applies, so the
     multiply form is checked against truth() everywhere), wrap,
     sign extremes */
  for (let k = 0; k < 500; k++) {
    const x = (164 * k) >>> 0;
    assert.equal(pgdUldCount(0, x), truth(x), `mult x=${x}`);
  }
  for (let k = 0; k < 500; k++) {
    const x = (PGDULD_DIV_MAGIC + 164 * k + 163) >>> 0;
    assert.equal(pgdUldCount(0, x), truth(x), `mod163 x=${x}`);
  }
  for (let k = 0; k < 200; k++) {
    const x = (0xb21d3e88 + 164 * k + 163) >>> 0; /* signed region */
    assert.equal(pgdUldCount(0, x), truth(x), `signed region x=${x}`);
  }
  for (const x of [0, 1, 163, 164, 165, 327, 328, 0x63e7063e,
    0x63e7063f, 0x63e70640, 0x7fffffff, 0x80000000, 0xfffffffe,
    0xffffffff]) {
    assert.equal(pgdUldCount(0, x), truth(x), `boundary x=${x}`);
  }
  /* spot values (hand-verified against the instruction stream) */
  assert.equal(pgdUldCount(0, 163), -1);
  assert.equal(pgdUldCount(0, 164), 0);
  assert.equal(pgdUldCount(0, 165), 0);
  assert.equal(pgdUldCount(0, 1000), 5);
  assert.equal(pgdUldCount(0, 0), -1);
  assert.equal(pgdUldCount(0, 0xffffffff), -1);
  /* end < start wraps */
  assert.equal(pgdUldCount(0x100, 0x0), truth(0xffffff00));
});

test("PGDULD segment index / loop bound / flag accum (byte gates)", () => {
  /* `cmp esi,edi ; mov eax,edi ; cmovb eax,esi` — UNSIGNED min */
  assert.equal(pgdUldSegmentIndex(5, 3), 3);
  assert.equal(pgdUldSegmentIndex(3, 5), 3);
  assert.equal(pgdUldSegmentIndex(0, 5), 0);
  assert.equal(pgdUldSegmentIndex(-1, 5), 5, "wrapped -1 selects the tier");
  assert.equal(pgdUldSegmentIndex(-2, 1), 1);
  assert.equal(pgdUldSegmentIndex(0x80000000 | 0, 0x80000000 | 0), 0x80000000 >>> 0);
  /* inner bound `sub ecx,[0x48] ; sar ecx,2 ; cmp ebx,ecx ; jae` */
  assert.equal(pgdUldLoopIterations(0x100, 0x100), 0);
  assert.equal(pgdUldLoopIterations(0x100, 0x108), 2);
  assert.equal(pgdUldLoopIterations(0x100, 0x10c), 3);
  assert.equal(pgdUldLoopIterations(0x100, 0x0fc), 0xffffffff >>> 0, "negative n is the unsigned bound");
  assert.equal(pgdUldLoopIterations(0, 0x80000000), 0xe0000000 >>> 0, "SAR: 0x80000000 >> 2 = 0xe0000000");
  /* flag accum `cmp byte [entry+0x38],dl ; cmovne edx,eax` — AND */
  assert.equal(pgdUldFlagAccum(1, 0), 0);
  assert.equal(pgdUldFlagAccum(1, 1), 1);
  assert.equal(pgdUldFlagAccum(1, 0xff), 1);
  assert.equal(pgdUldFlagAccum(1, 0x100), 0, "byte gate: 0x100 & 0xff = 0 -> clears");
  assert.equal(pgdUldFlagAccum(0, 1), 0);
  assert.equal(pgdUldFlagAccum(0, 0), 0);
});

test("PGDULD fire gates + TryUnlock pin", () => {
  /* fire = flag && tier <= 0x2d (unsigned) && ladder id != 0 */
  assert.equal(pgdUldFire(1, 4), 1);
  assert.equal(pgdUldFire(1, 11), 1);
  assert.equal(pgdUldFire(1, 45), 1);
  assert.equal(pgdUldFire(1, 12), 0, "ladder id 0");
  assert.equal(pgdUldFire(1, 36), 0, "ladder id 0");
  assert.equal(pgdUldFire(1, 46), 0, "tier > 0x2d");
  assert.equal(pgdUldFire(1, 0xffffffff), 0);
  assert.equal(pgdUldFire(0, 4), 0);
  assert.equal(pgdUldFire(0, 12), 0);
  assert.equal(pgdUldFire(1, 0), 0, "index 0 unused");
});

test("PGDHOST cookie + checksum law pins (verified bodies)", () => {
  assert.equal(PGD_HOST_VA_COOKIE, 0x00aef12b);
  assert.equal(PGD_COOKIE_GLOBAL_VA, 0x00bf93b4);
  assert.equal(PGD_COOKIE_FAIL_VA, 0x00aef775);
  assert.equal(PGD_COOKIE_BODY_BYTES, 8);
  assert.equal(pgdCookieCheckOk(0x1234, 0x1234), 1);
  assert.equal(pgdCookieCheckOk(0x1234, 0x5678), 0);
  assert.equal(pgdCookieCheckOk(0xffffffff, 0xffffffff), 1);
  assert.equal(pgdChecksumRegionSkipFront(), 0x10);
  assert.equal(pgdChecksumRegionSkipBack(), 4);
  assert.equal(PGD_CHECKSUM_NONSTANDARD_TABLE1, 0x09073096);
  /* header/model evidence pins */
  const h = readFileSync(join(root, "native", "decomp", "pgd_pure_helpers.h"), "utf8");
  assert.match(h, /ISAAC_PGDULD_VA = 0x009296c0u/);
  assert.match(h, /ISAAC_PGDULD_DIV_MAGIC = 0x63e7063fu/);
  assert.match(h, /kUldLadder\[ISAAC_PGDULD_LADDER_ROWS\]/);
  assert.match(h, /ISAAC_PGD_HOST_VA_COOKIE = 0x00aef12bu/);
  assert.match(h, /ISAAC_PGD_COOKIE_GLOBAL_VA = 0x00bf93b4u/);
  assert.match(h, /ISAAC_PGD_COOKIE_FAIL_VA = 0x00aef775u/);
  assert.match(h, /ISAAC_PGD_CHECKSUM_REGION_SKIP_FRONT = 0x10/);
  assert.match(h, /ISAAC_PGD_CHECKSUM_REGION_SKIP_BACK = 4/);
  assert.match(h, /ISAAC_PGD_CHECKSUM_NONSTANDARD_TABLE1 = 0x09073096u/);
  assert.match(h, /ISAAC_PGDULD_TRY_UNLOCK_CALL_VA = 0x00929773u/);
  assert.match(h, /0x204u/);
  const c = readFileSync(join(root, "native", "decomp", "pgd_pure_helpers.cpp"), "utf8");
  assert.match(c, /isaac_pgd_uld_count/);
  assert.match(c, /t - \(t >= 0 \? 1 : 0\)/);
  assert.match(c, /isaac_pgd_cookie_check_ok/);
  assert.match(c, /0x706d6173/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /v28-hostleaf/);
  assert.match(m, /PGDULD_VA = 0x009296c0/);
  assert.match(m, /BigInt\(x\) \* BigInt\(PGDULD_DIV_MAGIC\)/);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
  assert.equal(PGDULD_LADDER_TABLE_VA, 0x00b7b0b0);
});

test("Wasm matches JS: v28 tier ladder + host pins (wasm differential)", () => {
  assert.equal(wasm.isaac_pgd_uld_va() >>> 0, PGDULD_VA);
  assert.equal(wasm.isaac_pgd_uld_ret_va() >>> 0, PGDULD_RET_VA);
  assert.equal(wasm.isaac_pgd_uld_body_bytes(), PGDULD_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_uld_call_site_count(), PGDULD_CALL_SITES);
  assert.equal(wasm.isaac_pgd_uld_host_try_unlock_va() >>> 0, 0x00929a20);
  assert.equal(wasm.isaac_pgd_uld_try_unlock_call_va() >>> 0, 0x00929773);
  const wide = [0, 1, 163, 164, 165, 327, 328, 0x63e7063f, 0x7fffffff,
    0x80000000 | 0, 0xffffffff];
  for (const s of wide) for (const e of wide) {
    assert.equal(wasm.isaac_pgd_uld_count(s, e), pgdUldCount(s, e), `count ${s}/${e}`);
  }
  for (const c of wide) for (const t of [0, 1, 2, 4, 12, 45, 46, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_uld_segment_index(c, t) >>> 0,
      pgdUldSegmentIndex(c, t), `segIndex ${c}/${t}`);
  }
  for (const p of [0, 0x100, 0xfffffff0]) {
    for (const w of [p, p + 4, p + 8, p - 4]) {
      assert.equal(wasm.isaac_pgd_uld_loop_iterations(p, w) >>> 0,
        pgdUldLoopIterations(p, w), `loop ${p}/${w}`);
    }
  }
  for (const f of [0, 1]) for (const by of [0, 1, 0xff, 0x100, 0xffffffff]) {
    assert.equal(wasm.isaac_pgd_uld_flag_accum(f, by),
      pgdUldFlagAccum(f, by), `flagAccum ${f}/${by}`);
  }
  for (let t = 0; t < 0x30; t++) {
    assert.equal(wasm.isaac_pgd_uld_unlock_id(t) >>> 0,
      pgdUldUnlockId(t), `unlockId ${t}`);
    assert.equal(wasm.isaac_pgd_uld_fire(1, t), pgdUldFire(1, t), `fire ${t}`);
  }
  assert.equal(wasm.isaac_pgd_host_cookie_va() >>> 0, 0x00aef12b);
  assert.equal(wasm.isaac_pgd_cookie_global_va() >>> 0, 0x00bf93b4);
  assert.equal(wasm.isaac_pgd_cookie_fail_va() >>> 0, 0x00aef775);
  assert.equal(wasm.isaac_pgd_cookie_check_ok(7, 7), 1);
  assert.equal(wasm.isaac_pgd_cookie_check_ok(7, 8), 0);
  assert.equal(wasm.isaac_pgd_checksum_region_skip_front(), 0x10);
  assert.equal(wasm.isaac_pgd_checksum_region_skip_back(), 4);
});

/* =====================================================================
   ABI v33 — PGDISP (the 0x00929660 save DISPATCHER decision laws)
   Evidence: section-notes/pgd-v29-final/. The dispatcher is the
   family's LAST un-landed PURE island: body 0x929660..0x9296bc
   (ret 4 @0x9296bc + path-A ret 4 @0x9296af; BODY_BYTES 92),
   3 direct E8 to typed-host callees (0x9292c0 @0x92967e, 0x928ee0
   @0x9296a7, 0x9294f0 @0x9296b4), 1 indirect (import slot *0xb18a1c
   @0x92968e, host probe arg 0xc5c3a4), 1 this-store (this[0] = 0
   @0x929679). Inbound 2 (CORRECTED tooling — census-callers-fixed.py
   + per-site windows): 0x91a398 and 0x94c91e; the v28-hostleaf
   record's "1" missed 0x94c91e (buggy lea-4 tool). Byte-gate
   discipline: uint32 params, &0xff ONLY where the PE tests a byte
   (`cmpb $0`); the probe result gate is a FULL dword (`cmpl $0`).
   ===================================================================== */

test("ABI v33 — PGDISP const evidence (save dispatcher 0x929660)", () => {
  assert.equal(PGDISP_VA, 0x00929660);
  assert.equal(PGDISP_RET_VA, 0x009296bc);
  assert.equal(PGDISP_BODY_BYTES, 92);
  assert.equal(PGDISP_CALL_SITES, 2); // corrected: 0x91a398 + 0x94c91e
  assert.equal(PGDISP_HOST_VA_STAMP_HELPER, 0x009292c0);
  assert.equal(PGDISP_HOST_VA_SAVE_CLOUD, 0x00928ee0);
  assert.equal(PGDISP_HOST_VA_SAVE_LOCAL, 0x009294f0);
  assert.equal(PGDISP_STORE_VA, 0x00929679);
  assert.equal(PGDISP_STAMP_CALL_VA, 0x0092967e);
  assert.equal(PGDISP_CLOUD_CALL_VA, 0x009296a7);
  assert.equal(PGDISP_LOCAL_CALL_VA, 0x009296b4);
  assert.equal(PGDISP_PROBE_CALL_VA, 0x0092968e);
  assert.equal(PGDISP_PROBE_SLOT_VA, 0x00b18a1c);
  assert.equal(PGDISP_PROBE_ARG_VA, 0x00c5c3a4);
  assert.equal(PGDISP_GLOBAL_VA, 0x00c7169c);
  assert.equal(PGDISP_CLOUD_OFF, 0x2a3a4);
  assert.equal(PGDISP_GATE0_CMP_VA, 0x00929667);
  assert.equal(PGDISP_GATE0F8C_CMP_VA, 0x0092966c);
  assert.equal(PGDISP_ARG_CMP_VA, 0x00929675);
  assert.equal(PGDISP_CLOUD_DWORD_CMP_VA, 0x00929697);
  assert.equal(PGDISP_CLOUD_BYTE_CMP_VA, 0x0092969c);
  assert.equal(PGDISP_RETURN_STACK, 4);
  assert.equal(PGD_PURE_ABI_VERSION, 35);
});

test("ABI v33 — PGDISP proceed gate truth table (this[0] & this[0xf8c] BYTE)", () => {
  // `cmpb $0,(%esi)` @0x929667 + `cmpb $0,0xf8c(%esi)` @0x92966c,
  // both `je` to the silent early return 0x9296b9.
  assert.equal(pgdDispProceed(0, 0), 0);
  assert.equal(pgdDispProceed(0, 1), 0);      // gate1 fails
  assert.equal(pgdDispProceed(1, 0), 0);      // gate2 fails
  assert.equal(pgdDispProceed(0xff, 0xff), 1);
  // byte-gate discipline: 0x100 clears to 0, 0xffffffff clears to 0xff
  assert.equal(pgdDispProceed(0x100, 1), 0);
  assert.equal(pgdDispProceed(1, 0x100), 0);
  assert.equal(pgdDispProceed(0xffffffff, 1), 1);
  assert.equal(pgdDispProceed(1, 0xffffffff), 1);
  assert.equal(pgdDispProceed(0xffffffff, 0xffffffff), 1);
});

test("ABI v33 — PGDISP store-clear fires == proceed (movb @0x929679)", () => {
  // `movb $0,(%esi)` fires iff BOTH entry gates passed (unconditional
  // after them; PGDIEC dirty-store style law).
  for (const a of [0, 1, 0xff, 0x100, 0xffffffff]) {
    for (const b of [0, 1, 0xff, 0x100, 0xffffffff]) {
      assert.equal(pgdDispStoreClearFires(a, b), pgdDispProceed(a, b),
        `storeFires ${a}/${b}`);
    }
  }
  assert.equal(pgdDispStoreClearFires(0, 0xffffffff), 0);
  assert.equal(pgdDispStoreClearFires(0xff, 0xff), 1);
});

test("ABI v33 — PGDISP stamp-call fires (arg1 BYTE gate -> 0x9292c0)", () => {
  // `cmpb $0,0x8(%ebp)` @0x929675 ; `je` skips the call 0x9292c0
  // @0x92967e. Fires iff proceed AND arg byte nonzero.
  assert.equal(pgdDispStampCallFires(0, 1, 1), 0);   // proceed fails
  assert.equal(pgdDispStampCallFires(1, 1, 0), 0);   // arg zero
  assert.equal(pgdDispStampCallFires(1, 1, 1), 1);
  assert.equal(pgdDispStampCallFires(1, 1, 0xff), 1);
  assert.equal(pgdDispStampCallFires(1, 1, 0x100), 0); // byte gate
  assert.equal(pgdDispStampCallFires(1, 1, 0xffffffff), 1);
  assert.equal(pgdDispStampCallFires(0xff, 0xff, 0x80), 1);
  assert.equal(pgdDispStampCallFires(0xff, 0x100, 1), 0);
});

test("ABI v33 — PGDISP cloud-select (FULL dword probe + BYTE global)", () => {
  // `cmpl $0,(%eax)` FULL DWORD @0x929697 (probe result from the
  // import-slot call *0xb18a1c) AND `cmpb $0,0x2a3a4(%edi)` BYTE
  // @0x92969c -> 0x928ee0 @0x9296a7 else 0x9294f0 @0x9296b4.
  assert.equal(pgdDispCloudSelected(0, 1), 0);      // dword zero
  assert.equal(pgdDispCloudSelected(1, 0), 0);      // byte zero
  assert.equal(pgdDispCloudSelected(1, 1), 1);
  assert.equal(pgdDispCloudSelected(0xffffffff, 0xff), 1);
  assert.equal(pgdDispCloudSelected(0x100, 1), 1);  // FULL dword: kept
  assert.equal(pgdDispCloudSelected(1, 0x100), 0);  // byte gate: cleared
  assert.equal(pgdDispCloudSelected(0x80000000, 0x80), 1);
  assert.equal(pgdDispCloudSelected(0, 0xffffffff), 0);
  // kinship: v25o pgdImportSaveSelect folds the same two gates
  // (probe dword + g[0x2a3a4]) with the importer's this[0]/this[0xf8c]
  // entry gates; the dispatcher splits them (proceed + cloud select).
  assert.equal(pgdDispCloudSelected(0xffffffff, 0xffffffff), 1);
});

test("ABI v33 — PGDISP header/model evidence (family files)", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /PGDISP: the 0x00929660 save DISPATCHER/);
  assert.match(h, /ISAAC_PGDISP_VA = 0x00929660u/);
  assert.match(h, /ISAAC_PGDISP_CALL_SITES = 2/);
  assert.match(h, /ISAAC_PGDISP_BODY_BYTES = 92/);
  assert.match(h, /ISAAC_PGDISP_PROBE_SLOT_VA = 0x00b18a1cu/);
  assert.match(h, /ISAAC_PGDISP_CLOUD_OFF = 0x2a3a4/);
  assert.match(h, /isaac_pgd_disp_cloud_selected/);
  assert.match(h, /save-state pure helpers — ABI v35/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_disp_proceed/);
  assert.match(s, /isaac_pgd_disp_cloud_selected/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /export const PGD_PURE_ABI_VERSION = 35;/);
  assert.match(m, /export const PGDISP_VA = 0x00929660;/);
  assert.match(m, /export function pgdDispProceed/);
  assert.match(m, /export function pgdDispCloudSelected/);
});

test("ABI v33 — PGDISP wasm-vs-JS parity", () => {
  for (const a of [0, 1, 0xff, 0x100, 0xffffffff]) {
    for (const b of [0, 1, 0xff, 0x100, 0xffffffff]) {
      assert.equal(wasm.isaac_pgd_disp_proceed(a, b),
        pgdDispProceed(a, b), `proceed ${a}/${b}`);
      assert.equal(wasm.isaac_pgd_disp_store_clear_fires(a, b),
        pgdDispStoreClearFires(a, b), `storeFires ${a}/${b}`);
      assert.equal(wasm.isaac_pgd_disp_stamp_call_fires(a, b, 1),
        pgdDispStampCallFires(a, b, 1), `stamp ${a}/${b}/1`);
      assert.equal(wasm.isaac_pgd_disp_stamp_call_fires(a, b, 0),
        pgdDispStampCallFires(a, b, 0), `stamp ${a}/${b}/0`);
    }
  }
  for (const d of [0, 1, 0x100, 0x80000000, 0xffffffff]) {
    for (const g of [0, 1, 0xff, 0x100, 0xffffffff]) {
      assert.equal(wasm.isaac_pgd_disp_cloud_selected(d, g),
        pgdDispCloudSelected(d, g), `cloud ${d}/${g}`);
    }
  }
  assert.equal(wasm.isaac_pgd_disp_va() >>> 0, PGDISP_VA);
  assert.equal(wasm.isaac_pgd_disp_ret_va() >>> 0, PGDISP_RET_VA);
  assert.equal(wasm.isaac_pgd_disp_body_bytes(), PGDISP_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_disp_call_site_count(), PGDISP_CALL_SITES);
  assert.equal(wasm.isaac_pgd_disp_probe_slot_va() >>> 0, 0x00b18a1c);
  assert.equal(wasm.isaac_pgd_disp_cloud_off(), 0x2a3a4);
});
test("ABI v33 — PGDISP constant accessors: every remaining disp_* wasm pin (assertion census)", () => {
  /* Assertion census (wave-24): the PGDISP wasm-vs-JS parity test
     exact-pins 6 of the 22 isaac_pgd_disp_* constant accessors; the
     other 16 were presence-only (EXPORTS + bindings + model consts).
     This pins them to the header literals (the header is the PE
     transcription; the disciminating layer a constant mutation fails). */
  if (wasm === undefined) {
    wasm = loadExports();
  }
  const rows = [
    ["isaac_pgd_disp_host_stamp_helper_va", 0x009292c0],
    ["isaac_pgd_disp_host_save_cloud_va", 0x00928ee0],
    ["isaac_pgd_disp_host_save_local_va", 0x009294f0],
    ["isaac_pgd_disp_store_va", 0x00929679],
    ["isaac_pgd_disp_stamp_call_va", 0x0092967e],
    ["isaac_pgd_disp_cloud_call_va", 0x009296a7],
    ["isaac_pgd_disp_local_call_va", 0x009296b4],
    ["isaac_pgd_disp_probe_call_va", 0x0092968e],
    ["isaac_pgd_disp_probe_arg_va", 0x00c5c3a4],
    ["isaac_pgd_disp_global_va", 0x00c7169c],
    ["isaac_pgd_disp_gate0_cmp_va", 0x00929667],
    ["isaac_pgd_disp_gate0f8c_cmp_va", 0x0092966c],
    ["isaac_pgd_disp_arg_cmp_va", 0x00929675],
    ["isaac_pgd_disp_cloud_dword_cmp_va", 0x00929697],
    ["isaac_pgd_disp_cloud_byte_cmp_va", 0x0092969c],
    ["isaac_pgd_disp_return_stack", 4],
  ];
  for (const [name, want] of rows) {
    assert.equal(typeof wasm[name], "function", "missing export " + name);
    assert.equal(wasm[name]() >>> 0, want >>> 0, name);
  }
});


/* ============================================================
   ABI v33 — PGDCK (checksum leaf pins) + PGDWRI (writer record
   plan + 61-site checksum-call sequence). Evidence:
   section-notes/pgd-v30-checksum/.
   ============================================================ */

/* The 61 static 0x683410 call sites of the writer 0x9282e0, exactly
   as disassembled (objdump site scan). */
const WRI_SITE_VAS = [
  0x00928336, 0x0092836f, 0x00928393, 0x009283b7, 0x009283eb,
  0x0092842a, 0x0092844e, 0x00928472, 0x0092849f,
  0x009284e1, 0x00928505, 0x00928529, 0x0092855b,
  0x0092859d, 0x009285c1, 0x009285e5, 0x0092861c,
  0x0092865b, 0x0092867f, 0x009286a3, 0x009286db,
  0x0092871a, 0x0092873e, 0x00928762, 0x0092879b,
  0x009287da, 0x009287fe, 0x00928822, 0x0092885b,
  0x0092889a, 0x009288be, 0x009288e2, 0x00928918,
  0x0092895a, 0x0092897e, 0x009289a2, 0x009289d8,
  0x00928a1a, 0x00928a3e, 0x00928a62, 0x00928a9b,
  0x00928aef, 0x00928b13, 0x00928b3e, 0x00928b69, 0x00928b99,
  0x00928bce, 0x00928bf1, 0x00928c2f, 0x00928c5f,
  0x00928c91, 0x00928cb4, 0x00928cf2, 0x00928d22,
  0x00928d54, 0x00928d77, 0x00928db5, 0x00928de5,
  0x00928e1e, 0x00928e41, 0x00928e7c,
];

test("ABI v33 — PGDCK leaf pins match the machine literals", () => {
  assert.equal(PGD_CHECKSUM_UPDATE_VA, 0x00683410);
  assert.equal(PGD_CHECKSUM_UPDATE_RET_VA, 0x00683578);
  assert.equal(PGD_CHECKSUM_UPDATE_BODY_BYTES, 0x00683578 - 0x00683410);
  assert.equal(PGD_CHECKSUM_UPDATE_INBOUND, 1026);
  assert.equal(PGD_CHECKSUM_TABLE_VA, 0x00c7e860);
  assert.equal(PGD_CHECKSUM_TABLE_FLAG_VA, 0x00c7e864);
  assert.equal(PGD_CHECKSUM_GEN_FIRST_SHIFT_VA, 0x00683490);
  assert.equal(PGD_CHECKSUM_GEN_SAR_FIRST_VA, 0x006834a5);
  assert.equal(PGD_CHECKSUM_GEN_STORE_VA, 0x0068352c);
  assert.equal(PGD_CHECKSUM_GEN_LOOP_BACK_VA, 0x0068353a);
  assert.equal(PGD_CHECKSUM_MODE0_FOLD_VA, 0x0068344a);
  assert.equal(PGD_CHECKSUM_MODE1_INIT_VA, 0x00683548);
  assert.equal(PGD_CHECKSUM_MODE1_LOOP_VA, 0x00683551);
  assert.equal(PGD_CHECKSUM_MODE1_LOOP_BACK_VA, 0x0068356d);
  assert.equal(PGD_CHECKSUM_MODE1_FINAL_VA, 0x0068356f);
  assert.equal(PGD_CHECKSUM_STATE_OFF_LANE, 0);
  assert.equal(PGD_CHECKSUM_STATE_OFF_PARTIAL, 4);
  assert.equal(PGD_CHECKSUM_STATE_OFF_ACC, 8);
  assert.equal(PGD_CHECKSUM_STATE_OFF_MODE, 12);
  assert.equal(PGD_CHECKSUM_REGION_VA, 0x00683580);
  assert.equal(PGD_CHECKSUM_REGION_RET_VA, 0x00683674);
  assert.equal(PGD_CHECKSUM_REGION_BODY_BYTES, 0x00683674 - 0x00683580);
  assert.equal(PGD_CHECKSUM_REGION_INBOUND, 5);
  assert.equal(PGD_CHECKSUM_REGION_SEH_HANDLER_VA, 0x00af3860);
  assert.equal(PGD_CHECKSUM_REGION_COOKIE_VA, 0x00bf93b4);
  assert.equal(PGD_CHECKSUM_REGION_UPDATE_CALL_VA, 0x00683606);
  assert.equal(PGD_CHECKSUM_REGION_IO_CALL_VA, 0x006835ce);
  assert.equal(PGD_CHECKSUM_REGION_TELL_CALL_VA, 0x006835ae);
  assert.equal(PGD_CHECKSUM_REGION_SEEK_CALL_VA, 0x006835c5);
  assert.equal(PGD_CHECKSUM_REGION_READ_CALL_VA, 0x006835e6);
  assert.equal(PGD_CHECKSUM_REGION_LEN_SUB_VA, 0x006835b8);
  assert.equal(PGD_CHECKSUM_REGION_SEED_STORE_VA, 0x006835ff);
  assert.equal(PGD_CHECKSUM_VTBL_TELL_OFF, 0x4);
  assert.equal(PGD_CHECKSUM_VTBL_SEEK_OFF, 0xc);
  assert.equal(PGD_CHECKSUM_VTBL_READ_OFF, 0x14);
  // the writer's mode-1 state stores (one state for the whole write)
  assert.equal(PGD_WRI_STATE_MODE_STORE_VA, 0x0092830c);
  assert.equal(PGD_WRI_STATE_SEED_STORE_VA, 0x0092831e);
  assert.equal(PGD_WRI_STATE_LANE_STORE_VA, 0x00928313);
  assert.equal(PGD_WRI_STATE_PARTIAL_STORE_VA, 0x0092831a);
  // accessor parity
  assert.equal(pgdChecksumUpdateVa(), PGD_CHECKSUM_UPDATE_VA);
  assert.equal(pgdChecksumRegionRetVa(), PGD_CHECKSUM_REGION_RET_VA);
  assert.equal(pgdChecksumStateOffMode(), PGD_CHECKSUM_STATE_OFF_MODE);
  assert.equal(pgdChecksumVtblReadOff(), PGD_CHECKSUM_VTBL_READ_OFF);
});

test("ABI v33 — region length is two u32 wraps (0x6835b8/0x6835ba)", () => {
  // pos - skip_front - skip_back, mod 2^32, plain u32 subtracts
  assert.equal(pgdChecksumRegionLen(0x10000, 0x10, 4), 0xffec);
  assert.equal(pgdChecksumRegionLen(0x100, 0x10, 4), 0xec);
  assert.equal(pgdChecksumRegionLen(0x14, 0x10, 4), 0); // exactly the tail
  // undersized wraps on BOTH subtracts, exactly like the machine
  assert.equal(pgdChecksumRegionLen(0x10, 0x10, 4), 0xfffffffc);
  assert.equal(pgdChecksumRegionLen(0, 0x10, 4), 0xffffffec);
  assert.equal(pgdChecksumRegionLen(0xffffffff, 0x10, 4), 0xffffffeb);
  assert.equal(pgdChecksumRegionLen(0xffffffff, 0xffffffff, 0xffffffff), 1);
});

test("ABI v33 — the CRC table generator is the sar-rounds law", () => {
  // independently computed reference values (Python, same machine shape)
  const ref = {
    0x00: 0x00000000, 0x01: 0x09073096, 0x02: 0x120e612c,
    0x03: 0x1b0951ba, 0x04: 0xff6dc419, 0x05: 0xf66af48f,
    0x20: 0xfb6e20c8, 0x40: 0xf6dc4190, 0x7f: 0xeaba6cad,
    0x80: 0xedb88320, 0xfe: 0x0e05df1b, 0xff: 0x0702ef8d,
  };
  for (const [i, want] of Object.entries(ref)) {
    assert.equal(pgdCrcTableEntry(Number(i)), want, `table[${i}]`);
  }
  // the non-standard entry 1 (standard CRC-32 would be 0x77073096)
  assert.equal(pgdCrcTableEntry(1), 0x09073096);
  assert.ok(pgdCrcTableUsesArithmeticShift());
  // the mode-1 fold init/final complement semantics with len == 0 is
  // identity (machine: not; fold-nothing; not)
  assert.equal(pgdChecksumBuffer([], 0, PGD_CHECKSUM_MODE_CRC), PGD_CHECKSUM_SEED);
});

test("ABI v33 — PGDWRI writer pins and census (61-site correction)", () => {
  assert.equal(PGD_WRI_VA, 0x009282e0);
  assert.equal(PGD_WRI_RET_VA, 0x00928ed8);
  assert.equal(PGD_WRI_BODY_BYTES, 0x00928ed8 - 0x009282e0);
  assert.equal(PGD_WRI_PRE_OFF, 0xf84);
  assert.equal(PGD_WRI_PRE_HASH_VA, 0x00928336);
  assert.equal(PGD_WRI_SAVE_COUNTER_OFF, 0xf88);
  assert.equal(PGD_WRI_SAVE_COUNTER_INC_VA, 0x00928e62);
  assert.equal(PGD_WRI_SAVE_COUNTER_HASH_VA, 0x00928e7c);
  assert.equal(PGD_WRI_FINAL_WRITE_VA, 0x00928ecf);
  // corrected census: v29 "60x 0x683410" is superseded — the pre-record
  // dword this+0xf84 hash @0x928336 brings the total to 61
  assert.equal(PGD_WRI_CS_SITES, 61);
  assert.equal(WRI_SITE_VAS.length, 61);
  assert.equal(PGD_WRI_TREE_NEXT_SITES, 4);
  assert.equal(PGD_WRI_VTBL_WRITE_SITES, 63);
  assert.equal(PGD_WRI_MEMSET_SITES, 1);
  assert.equal(PGD_WRI_STORES, 1);
  assert.equal(pgdWriCsSiteCount(), 61);
  assert.equal(pgdWriTreeNextSites(), 4);
  assert.equal(pgdWriVtblWriteSites(), 63);
  assert.equal(pgdWriMemsetSites(), 1);
  assert.equal(pgdWriStores(), 1);
  assert.equal(pgdWriVa(), PGD_WRI_VA);
  assert.equal(pgdWriRetVa(), PGD_WRI_RET_VA);
  assert.equal(pgdWriBodyBytes(), PGD_WRI_BODY_BYTES);
  assert.equal(pgdWriSaveCounterIncVa(), PGD_WRI_SAVE_COUNTER_INC_VA);
});

test("ABI v33 — the 61-site checksum-call table is PE-truth", () => {
  assert.equal(PGD_WRI_CS_TABLE.length, 61);
  for (let i = 0; i < 61; ++i) {
    const row = PGD_WRI_CS_TABLE[i];
    assert.equal(row.va, WRI_SITE_VAS[i], `site ${i} VA`);
    assert.equal(pgdWriCsSiteVa(i), row.va, `accessor va ${i}`);
    assert.equal(pgdWriCsSiteRole(i), row.role, `accessor role ${i}`);
    assert.equal(pgdWriCsSiteLen(i), row.len, `accessor len ${i}`);
  }
  // out-of-range rows fail closed
  assert.equal(pgdWriCsSiteVa(61), 0);
  assert.equal(pgdWriCsSiteVa(-1), 0);
  assert.equal(pgdWriCsSiteRole(61), -1);
  // the roles are exact: pre 1, headers 3 per fixed record + 3 for R11,
  // elements 10 (no ELT row for R11), sub-dwords 8, keys/vals 4 each,
  // tail 1
  const count = (r) => PGD_WRI_CS_TABLE.filter((x) => x.role === r).length;
  assert.equal(count(PGD_WRI_ROLE_PRE), 1);
  assert.equal(count(PGD_WRI_ROLE_ID), 11);
  assert.equal(count(PGD_WRI_ROLE_CAP), 11);
  assert.equal(count(PGD_WRI_ROLE_CNT), 11);
  assert.equal(count(PGD_WRI_ROLE_ELT), 10);
  assert.equal(count(PGD_WRI_ROLE_SUB), 8);
  assert.equal(count(PGD_WRI_ROLE_KEY), 4);
  assert.equal(count(PGD_WRI_ROLE_VAL), 4);
  assert.equal(count(PGD_WRI_ROLE_TAIL), 1);
  // every non-ELT row hashes its full dword; ELT len is the width
  for (const row of PGD_WRI_CS_TABLE) {
    if (row.role !== PGD_WRI_ROLE_ELT) {
      assert.equal(row.len, 4, `role ${row.role} len at 0x${row.va.toString(16)}`);
    }
  }
  // per-record order = ID, CAP, CNT (rows are in execution order: row
  // 1 + 4*(r-1) .. row 3 + 4*(r-1) for R1..R10)
  for (let r = 1; r <= 10; ++r) {
    const base = 1 + 4 * (r - 1);
    assert.deepEqual(
      PGD_WRI_CS_TABLE.slice(base, base + 3).map((x) => x.role),
      [PGD_WRI_ROLE_ID, PGD_WRI_ROLE_CAP, PGD_WRI_ROLE_CNT],
      `record ${r} header roles`,
    );
  }
});

test("ABI v33 — loop bounds and strides equal the section plan", () => {
  // bound = count_word, hash len = width, for every fixed record
  const cases = [
    [1, PGD_COUNT_ACHIEVEMENTS, 1],
    [2, PGD_COUNT_EVENT_COUNTERS, 4],
    [3, PGD_COUNT_SEC3, 4],
    [4, PGD_COUNT_ITEM_COLLECTION, 1],
    [5, PGD_COUNT_SEC5, 1],
    [6, PGD_COUNT_BOSSES, 1],
    [7, PGD_COUNT_CHALLENGES, 1],
    [8, PGD_COUNT_SEC8, 4],
    [9, PGD_COUNT_SEC9, 4],
    [10, PGD_COUNT_SEC10, 1],
  ];
  for (const [id, count, width] of cases) {
    assert.equal(pgdWriLoopIterations(id), count, `record ${id} bound`);
    assert.equal(pgdWriElementHashLen(id), width, `record ${id} width`);
    // the section-descriptor side agrees (cap/count/width transcription)
    const desc = pgdSectionDesc(id);
    assert.equal(desc.countWord, count);
    assert.equal(desc.elemWidth, width);
    assert.equal(desc.payloadBytes, count * width);
  }
  // R11 has no element loop (bestiary walks instead)
  assert.equal(pgdWriLoopIterations(PGD_BESTIARY_SECTION_ID), 0);
  assert.equal(pgdWriElementHashLen(PGD_BESTIARY_SECTION_ID), 0);
  // unknown ids fail closed
  assert.equal(pgdWriLoopIterations(12), -1);
  assert.equal(pgdWriElementHashLen(0), -1);
});

test("ABI v33 — the writer folds exactly the serialized byte stream", () => {
  // Simulate a WRITE with empty bestiary maps (walk counts 0): the
  // serialized payload that the 61 calls fold = pre dword, then per
  // record [id dword, cap dword, count dword, count x width bytes], the
  // R11 header + 8 sub dwords, then the save counter dword. The magic
  // (16 bytes) is NOT hashed (fold starts after it — the region law).
  const le = (b, v) => {
    b.push(v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff);
  };
  const stream = [];
  const counts = {
    1: 3, 2: 5, 3: 2, 4: 4, 5: 2, 6: 3, 7: 2, 8: 2, 9: 2, 10: 3,
  };
  const widths = { 1: 1, 2: 4, 3: 4, 4: 1, 5: 1, 6: 1, 7: 1, 8: 4, 9: 4, 10: 1 };
  le(stream, 0x1234abcd); // pre dword this+0xf84
  for (let r = 1; r <= 10; ++r) {
    le(stream, r); // id
    le(stream, (counts[r] * widths[r]) >>> 0); // cap
    le(stream, counts[r]); // count
    for (let i = 0; i < counts[r]; ++i) {
      for (let w = 0; w < widths[r]; ++w) stream.push((r * 17 + i) & 0xff);
    }
  }
  // R11 header [id=11][cap=total<<2][subcount=4]; total 0 -> cap 0
  le(stream, 0xb);
  le(stream, 0);
  le(stream, 4);
  // the 8 sub dwords: (tag, count<<2) per walk — counts 0 -> all 0
  for (let i = 0; i < 8; ++i) le(stream, 0);
  le(stream, 0x77); // save counter (post-inc value)
  const total = stream.length;
  assert.equal(total, 4 + 10 * 12 + (3 + 20 + 8 + 4 + 2 + 3 + 2 + 8 + 8 + 3) + 12 + 32 + 4);
  // one-buffer fold (the region/writer core)
  const once = pgdChecksumBuffer(stream, total, PGD_CHECKSUM_MODE_CRC);
  // explicit sequential fold (machine shape: one call per site row)
  let s = pgdChecksumInit(PGD_CHECKSUM_MODE_CRC);
  const fold1 = (b) => pgdChecksumUpdate(s, [b], 1);
  const fold4 = (v) => {
    const b = [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
    return pgdChecksumUpdate(s, b, 4);
  };
  fold4(0x1234abcd); // PRE
  for (let r = 1; r <= 10; ++r) {
    fold4(r); // ID
    fold4((counts[r] * widths[r]) >>> 0); // CAP
    fold4(counts[r]); // CNT
    for (let i = 0; i < counts[r]; ++i) {
      const b = (r * 17 + i) & 0xff;
      if (widths[r] === 1) {
        fold1(b); // one ELT hash per byte element
      } else {
        fold4(b | (b << 8) | (b << 16) | (b << 24)); // 4-byte element
      }
    }
  }
  fold4(0xb); // R11 ID
  fold4(0); // R11 CAP
  fold4(4); // R11 CNT (subcount)
  for (let i = 0; i < 8; ++i) fold4(0); // SUB dwords
  fold4(0x77); // TAIL (save counter)
  const seq = pgdChecksumFinalize(s);
  assert.equal(seq, once, "sequential 61-call fold == one-buffer fold");
  assert.equal(pgdWriSaveCounterNext(0x76), 0x77);
  assert.equal(pgdWriSaveCounterNext(0xffffffff), 0);
});

test("ABI v33 — header records the v30 evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGDCK_UPDATE_VA = 0x00683410u/);
  assert.match(h, /ISAAC_PGDCK_REGION_SEH_HANDLER_VA = 0x00af3860u/);
  assert.match(h, /ISAAC_PGDWRI_CS_SITES = 61/);
  assert.match(h, /ISAAC_PGD_CHECKSUM_NONSTANDARD_TABLE1 = 0x09073096u/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_WRI_CS_TABLE = Object\.freeze/);
  assert.match(m, /export function pgdChecksumRegionLen/);
});

test("ABI v33 — wasm differential for PGDCK + PGDWRI", () => {
  assert.ok(wasm, "wasm must be built before this group runs");
  const U = (v) => v >>> 0; // wasm exports uint32 as signed i32
  // leaf pins
  assert.equal(U(wasm.isaac_pgd_checksum_update_va()), PGD_CHECKSUM_UPDATE_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_update_ret_va()), PGD_CHECKSUM_UPDATE_RET_VA);
  assert.equal(wasm.isaac_pgd_checksum_update_body_bytes(), PGD_CHECKSUM_UPDATE_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_checksum_update_inbound(), PGD_CHECKSUM_UPDATE_INBOUND);
  assert.equal(U(wasm.isaac_pgd_checksum_table_va()), PGD_CHECKSUM_TABLE_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_table_flag_va()), PGD_CHECKSUM_TABLE_FLAG_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_gen_first_shift_va()), PGD_CHECKSUM_GEN_FIRST_SHIFT_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_gen_sar_first_va()), PGD_CHECKSUM_GEN_SAR_FIRST_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_gen_store_va()), PGD_CHECKSUM_GEN_STORE_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_gen_loop_back_va()), PGD_CHECKSUM_GEN_LOOP_BACK_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_mode0_fold_va()), PGD_CHECKSUM_MODE0_FOLD_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_mode1_init_va()), PGD_CHECKSUM_MODE1_INIT_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_mode1_loop_va()), PGD_CHECKSUM_MODE1_LOOP_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_mode1_loop_back_va()), PGD_CHECKSUM_MODE1_LOOP_BACK_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_mode1_final_va()), PGD_CHECKSUM_MODE1_FINAL_VA);
  for (const [off, name] of [
    [PGD_CHECKSUM_STATE_OFF_LANE, "isaac_pgd_checksum_state_off_lane"],
    [PGD_CHECKSUM_STATE_OFF_PARTIAL, "isaac_pgd_checksum_state_off_partial"],
    [PGD_CHECKSUM_STATE_OFF_ACC, "isaac_pgd_checksum_state_off_acc"],
    [PGD_CHECKSUM_STATE_OFF_MODE, "isaac_pgd_checksum_state_off_mode"],
  ]) {
    assert.equal(wasm[name](), off, name);
  }
  assert.equal(U(wasm.isaac_pgd_checksum_region_va()), PGD_CHECKSUM_REGION_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_ret_va()), PGD_CHECKSUM_REGION_RET_VA);
  assert.equal(wasm.isaac_pgd_checksum_region_body_bytes(), PGD_CHECKSUM_REGION_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_checksum_region_inbound(), PGD_CHECKSUM_REGION_INBOUND);
  assert.equal(U(wasm.isaac_pgd_checksum_region_seh_handler_va()), PGD_CHECKSUM_REGION_SEH_HANDLER_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_cookie_va()), PGD_CHECKSUM_REGION_COOKIE_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_update_call_va()), PGD_CHECKSUM_REGION_UPDATE_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_io_call_va()), PGD_CHECKSUM_REGION_IO_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_tell_call_va()), PGD_CHECKSUM_REGION_TELL_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_seek_call_va()), PGD_CHECKSUM_REGION_SEEK_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_read_call_va()), PGD_CHECKSUM_REGION_READ_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_len_sub_va()), PGD_CHECKSUM_REGION_LEN_SUB_VA);
  assert.equal(U(wasm.isaac_pgd_checksum_region_seed_store_va()), PGD_CHECKSUM_REGION_SEED_STORE_VA);
  assert.equal(wasm.isaac_pgd_checksum_vtbl_tell_off(), PGD_CHECKSUM_VTBL_TELL_OFF);
  assert.equal(wasm.isaac_pgd_checksum_vtbl_seek_off(), PGD_CHECKSUM_VTBL_SEEK_OFF);
  assert.equal(wasm.isaac_pgd_checksum_vtbl_read_off(), PGD_CHECKSUM_VTBL_READ_OFF);
  // region length law parity (wrap rows)
  for (const [size, front, back] of [
    [0x10000, 0x10, 4],
    [0x14, 0x10, 4],
    [0x10, 0x10, 4],
    [0, 0x10, 4],
    [0xffffffff, 0xffffffff, 0xffffffff],
  ]) {
    assert.equal(
      U(wasm.isaac_pgd_checksum_region_len(size, front, back)),
      pgdChecksumRegionLen(size, front, back),
      `region_len(${size},${front},${back})`,
    );
  }
  // writer pins
  assert.equal(U(wasm.isaac_pgd_wri_va()), PGD_WRI_VA);
  assert.equal(U(wasm.isaac_pgd_wri_ret_va()), PGD_WRI_RET_VA);
  assert.equal(wasm.isaac_pgd_wri_body_bytes(), PGD_WRI_BODY_BYTES);
  assert.equal(U(wasm.isaac_pgd_wri_state_mode_store_va()), PGD_WRI_STATE_MODE_STORE_VA);
  assert.equal(U(wasm.isaac_pgd_wri_state_lane_store_va()), PGD_WRI_STATE_LANE_STORE_VA);
  assert.equal(U(wasm.isaac_pgd_wri_state_partial_store_va()), PGD_WRI_STATE_PARTIAL_STORE_VA);
  assert.equal(U(wasm.isaac_pgd_wri_state_seed_store_va()), PGD_WRI_STATE_SEED_STORE_VA);
  assert.equal(wasm.isaac_pgd_wri_pre_off(), PGD_WRI_PRE_OFF);
  assert.equal(U(wasm.isaac_pgd_wri_pre_hash_va()), PGD_WRI_PRE_HASH_VA);
  assert.equal(wasm.isaac_pgd_wri_save_counter_off(), PGD_WRI_SAVE_COUNTER_OFF);
  assert.equal(U(wasm.isaac_pgd_wri_save_counter_inc_va()), PGD_WRI_SAVE_COUNTER_INC_VA);
  assert.equal(U(wasm.isaac_pgd_wri_save_counter_hash_va()), PGD_WRI_SAVE_COUNTER_HASH_VA);
  assert.equal(U(wasm.isaac_pgd_wri_final_write_va()), PGD_WRI_FINAL_WRITE_VA);
  assert.equal(wasm.isaac_pgd_wri_cs_site_count(), 61);
  assert.equal(wasm.isaac_pgd_wri_tree_next_sites(), 4);
  assert.equal(wasm.isaac_pgd_wri_vtbl_write_sites(), 63);
  assert.equal(wasm.isaac_pgd_wri_memset_sites(), 1);
  assert.equal(wasm.isaac_pgd_wri_stores(), 1);
  // the 61-row table differential (all rows)
  for (let i = 0; i < 61; ++i) {
    assert.equal(U(wasm.isaac_pgd_wri_cs_site_va(i)), PGD_WRI_CS_TABLE[i].va, `row ${i} va`);
    assert.equal(wasm.isaac_pgd_wri_cs_site_role(i), PGD_WRI_CS_TABLE[i].role, `row ${i} role`);
    assert.equal(wasm.isaac_pgd_wri_cs_site_len(i), PGD_WRI_CS_TABLE[i].len, `row ${i} len`);
  }
  assert.equal(U(wasm.isaac_pgd_wri_cs_site_va(61)), 0);
  assert.equal(wasm.isaac_pgd_wri_cs_site_role(61), -1);
  assert.equal(wasm.isaac_pgd_wri_cs_site_len(61), 0);
  // loop bound / width / save-counter parity
  for (let r = 1; r <= 10; ++r) {
    assert.equal(wasm.isaac_pgd_wri_loop_iterations(r), pgdWriLoopIterations(r), `bound ${r}`);
    assert.equal(wasm.isaac_pgd_wri_element_hash_len(r), pgdWriElementHashLen(r), `width ${r}`);
  }
  assert.equal(wasm.isaac_pgd_wri_loop_iterations(0xb), 0);
  assert.equal(wasm.isaac_pgd_wri_loop_iterations(12), -1);
  assert.equal(U(wasm.isaac_pgd_wri_save_counter_next(0xffffffff)), 0);
  assert.equal(U(wasm.isaac_pgd_wri_save_counter_next(0x76)), 0x77);
  // the CRC table generator differential over the full 256 entries
  for (let i = 0; i < 256; ++i) {
    assert.equal(U(wasm.isaac_pgd_crc_table_entry(i)), pgdCrcTableEntry(i), `crc table ${i}`);
  }
});

/* ============================================================
   ABI v33 — PGDVRF: the save verifier 0x926f10 verify-open laws
   (magic-kind selection, fold-region verify-then-compare,
   trailing-dword compare). Evidence:
   section-notes/pgd-v31-verifier/.
   ============================================================ */

/* Byte-exact .rdata dumps: the four magics are 16 ASCII bytes with
   TRAILING SPACES; bytes 0..11 are the shared prefix "ISAACNGSAVE0"
   and byte 12 is the kind digit — dword 3 discriminates. */
const VRF_MAGIC_STRINGS_EXPECTED = [
  "ISAACNGSAVE06R  ",
  "ISAACNGSAVE07R  ",
  "ISAACNGSAVE08R  ",
  "ISAACNGSAVE09R  ",
];
const VRF_DWORD_EXPECTED = [
  [0x41415349, 0x53474e43, 0x30455641, 0x20205236],
  [0x41415349, 0x53474e43, 0x30455641, 0x20205237],
  [0x41415349, 0x53474e43, 0x30455641, 0x20205238],
  [0x41415349, 0x53474e43, 0x30455641, 0x20205239],
];

function vrfLe32(v) {
  return [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
}
function vrfBytesOf(ascii) {
  return [...ascii].map((c) => c.charCodeAt(0));
}
function vrfU32At(buf, i) {
  return (buf[i] | (buf[i + 1] << 8) | (buf[i + 2] << 16) | (buf[i + 3] << 24)) >>> 0;
}

test("ABI v33 — PGDVRF verifier pins match the machine literals", () => {
  assert.equal(PGD_VRF_VA, 0x00926f10);
  assert.equal(PGD_VRF_RET_VA, 0x00927cd0);
  assert.equal(PGD_VRF_BODY_BYTES, 0x00927cd0 - 0x00926f10);
  assert.equal(PGD_VRF_SEH_HANDLER_VA, 0x00b0a991);
  assert.equal(PGD_VRF_COOKIE_VA, 0x00bf93b4);
  assert.equal(PGD_VRF_INBOUND, 5);
  assert.equal(PGD_VRF_RETURN_STACK, 4);
  assert.deepEqual(PGD_VRF_MAGIC_VAS, [0x00b1b98c, 0x00b1b9a0, 0x00b1b9b4, 0x00b7ab6c]);
  assert.equal(PGD_VRF_COMPARE_LOOP_VA, 0x00926f60);
  assert.equal(PGD_VRF_COMPARE_JA_VA, 0x00926f6f);
  assert.deepEqual(PGD_VRF_CASCADE_HEAD_VAS, [0x00926f53, 0x00926f82, 0x00926faf, 0x00926fdf]);
  assert.deepEqual(PGD_VRF_KIND_STORE_VAS, [0x00926f71, 0x00926fa1, 0x00926fd1, 0x00927005]);
  assert.deepEqual(PGD_VRF_BOUND_STORE_VAS, [0x00926f76, 0x00926fa6, 0x00926fd6, 0x0092700a]);
  assert.equal(PGD_VRF_MAGIC_BYTES, 16);
  assert.equal(PGD_VRF_COMPARE_DWORDS, 4);
  assert.equal(PGD_VRF_COMPARE_BYTES, 16);
  assert.equal(PGD_VRF_KIND_DIGIT_OFF, 12);
  assert.equal(PGD_VRF_KIND_MIN, 6);
  assert.equal(PGD_VRF_KIND_MAX, 9);
  assert.equal(PGD_VRF_CHECKSUM_CALL_VA, 0x00927017);
  assert.equal(PGD_VRF_CHECKSUM_SKIP_FRONT, 0x10);
  assert.equal(PGD_VRF_CHECKSUM_SKIP_BACK, 4);
  assert.equal(PGD_VRF_TRAILING_SEEK_VA, 0x0092702c);
  assert.equal(PGD_VRF_TRAILING_READ_VA, 0x00927044);
  assert.equal(PGD_VRF_TRAILING_CMP_VA, 0x00927046);
  assert.equal(PGD_VRF_TRAILING_LOG_VA, 0x00b7ab0c);
  assert.equal(PGD_VRF_HEADER_LOG_VA, 0x00b7ab3c);
  assert.equal(PGD_VRF_OLD_VERSION_LOG_VA, 0x00b7aac8);
  assert.equal(PGD_VRF_KIND_GATE_CMP_VA, 0x0092705f);
  assert.equal(PGD_VRF_KIND_GATE_JA_VA, 0x00927062);
  assert.equal(PGD_VRF_FAIL_RET_VA, 0x00927cb3);
  assert.equal(PGD_VRF_SUCCESS_RET_VA, 0x00927c9c);
  assert.equal(PGD_VRF_SAVE_COUNTER_OFF, 0xf88);
  assert.equal(PGD_VRF_JUMP_TABLE_VA, 0x00927cd8);
  assert.equal(PGD_VRF_JUMP_TABLE_ENTRIES, 11);
  assert.deepEqual(PGD_VRF_BOUNDS, [0x9, 0xa, 0xa, 0xb]);
  // accessor parity
  assert.equal(pgdVrfVa(), PGD_VRF_VA);
  assert.equal(pgdVrfRetVa(), PGD_VRF_RET_VA);
  assert.equal(pgdVrfBodyBytes(), PGD_VRF_BODY_BYTES);
  assert.equal(pgdVrfSehHandlerVa(), PGD_VRF_SEH_HANDLER_VA);
  assert.equal(pgdVrfCookieVa(), PGD_VRF_COOKIE_VA);
  assert.equal(pgdVrfInbound(), PGD_VRF_INBOUND);
  assert.equal(pgdVrfReturnStack(), PGD_VRF_RETURN_STACK);
  assert.equal(pgdVrfMagicVa(0), 0x00b1b98c);
  assert.equal(pgdVrfMagicVa(3), 0x00b7ab6c);
  assert.equal(pgdVrfMagicVa(4), 0);
  assert.equal(pgdVrfCompareLoopVa(), PGD_VRF_COMPARE_LOOP_VA);
  assert.equal(pgdVrfCompareDwords(), PGD_VRF_COMPARE_DWORDS);
  assert.equal(pgdVrfCompareBytes(), PGD_VRF_COMPARE_BYTES);
  assert.equal(pgdVrfKindDigitOff(), PGD_VRF_KIND_DIGIT_OFF);
  assert.equal(pgdVrfCascadeHeadVa(0), 0x00926f53);
  assert.equal(pgdVrfCascadeHeadVa(3), 0x00926fdf);
  assert.equal(pgdVrfCascadeHeadVa(4), 0);
  assert.equal(pgdVrfKindStoreVa(1), 0x00926fa1);
  assert.equal(pgdVrfBoundStoreVa(3), 0x0092700a);
  assert.equal(pgdVrfChecksumCallVa(), 0x00927017);
  assert.equal(pgdVrfChecksumSkipFront(), 0x10);
  assert.equal(pgdVrfChecksumSkipBack(), 4);
  assert.equal(pgdVrfTrailingSeekVa(), 0x0092702c);
  assert.equal(pgdVrfTrailingReadVa(), 0x00927044);
  assert.equal(pgdVrfTrailingCmpVa(), 0x00927046);
  assert.equal(pgdVrfTrailingLogVa(), 0x00b7ab0c);
  assert.equal(pgdVrfHeaderLogVa(), 0x00b7ab3c);
  assert.equal(pgdVrfOldVersionLogVa(), 0x00b7aac8);
  assert.equal(pgdVrfKindGateCmpVa(), 0x0092705f);
  assert.equal(pgdVrfFailRetVa(), 0x00927cb3);
  assert.equal(pgdVrfSuccessRetVa(), 0x00927c9c);
  assert.equal(pgdVrfSaveCounterOff(), 0xf88);
  assert.equal(pgdVrfJumpTableVa(), 0x00927cd8);
  assert.equal(pgdVrfJumpTableEntries(), 11);
});

test("ABI v33 — the 4-magic kind selection is a FULL-DWORD 16-byte compare", () => {
  // byte-exact .rdata magic dumps
  for (let v = 0; v < 4; ++v) {
    assert.equal(PGD_MAGIC_STRINGS[v], VRF_MAGIC_STRINGS_EXPECTED[v]);
    assert.equal(PGD_MAGIC_STRINGS[v].length, PGD_VRF_MAGIC_BYTES);
    for (let j = 0; j < 4; ++j) {
      assert.equal(pgdVrfMagicDword(v, j), VRF_DWORD_EXPECTED[v][j], `magic ${v} dword ${j}`);
      for (let b = 0; b < 4; ++b) {
        const idx = j * 4 + b;
        assert.equal(
          pgdVrfMagicByte(v, idx),
          VRF_MAGIC_STRINGS_EXPECTED[v].charCodeAt(idx) & 0xff,
          `magic ${v} byte ${idx}`,
        );
      }
    }
  }
  // bytes 0..11 are the SHARED prefix "ISAACNGSAVE0" — byte 12 (the
  // kind digit inside dword 3) is the only discriminator
  for (let j = 0; j < 3; ++j) {
    assert.equal(VRF_DWORD_EXPECTED[0][j], VRF_DWORD_EXPECTED[3][j], `shared dword ${j}`);
  }
  assert.deepEqual(
    VRF_DWORD_EXPECTED.map((q) => q[3]),
    [0x20205236, 0x20205237, 0x20205238, 0x20205239],
  );
  // every full 16-byte magic resolves to its own variant/kind
  for (let v = 0; v < 4; ++v) {
    const q = VRF_DWORD_EXPECTED[v];
    assert.equal(pgdVrfMagicVariantDwords(q[0], q[1], q[2], q[3]), v);
    assert.equal(pgdVrfKindFromHeader(q[0], q[1], q[2], q[3]), PGD_VRF_KIND_MIN + v);
  }
  // THE DISCRIMINATING DRIVE: flip the kind digit of the 09R magic
  // ('9' -> '6', dword 3 = 0x20205236) and the header resolves to
  // KIND 6, not 9 — dword 3 is inside the compare. A 12-byte
  // (3-dword) compare would return variant 0 for EVERY header (the
  // shared prefix) and send a 09R save down the too-old fail (M2).
  const q9 = VRF_DWORD_EXPECTED[3];
  assert.equal(pgdVrfMagicVariantDwords(q9[0], q9[1], q9[2], 0x20205236), 0);
  assert.equal(pgdVrfKindFromHeader(q9[0], q9[1], q9[2], 0x20205236), 6);
  assert.equal(pgdVrfKindFromHeader(q9[0], q9[1], q9[2], 0x20205237), 7);
  assert.equal(pgdVrfKindFromHeader(q9[0], q9[1], q9[2], 0x20205238), 8);
  assert.equal(pgdVrfKindFromHeader(q9[0], q9[1], q9[2], 0x20205239), 9);
  // the byte-level law agrees on the same headers
  assert.equal(pgdMagicVariant(vrfBytesOf("ISAACNGSAVE06R  ")), 0);
  assert.equal(pgdMagicVariant(vrfBytesOf("ISAACNGSAVE09R  ")), 3);
  // no match -> the "wrong file header" fail (kind 0 / variant -1)
  assert.equal(pgdVrfMagicVariantDwords(0, 0, 0, 0), -1);
  assert.equal(pgdVrfKindFromHeader(0, 0, 0, 0), 0);
  assert.equal(pgdVrfMagicVariantDwords(0x41415349, 0x53474e43, 0x30455641, 0x12345678), -1);
  assert.equal(pgdVrfKindFromHeader(0x41415349, 0x53474e43, 0x30455641, 0x12345678), 0);
  // dword law == the landed byte law over every magic
  for (let v = 0; v < 4; ++v) {
    const q = VRF_DWORD_EXPECTED[v];
    const asBytes = [...vrfLe32(q[0]), ...vrfLe32(q[1]), ...vrfLe32(q[2]), ...vrfLe32(q[3])];
    assert.equal(pgdMagicVariant(asBytes), v);
    assert.equal(pgdVrfMagicVariantDwords(q[0], q[1], q[2], q[3]), v);
  }
});

test("ABI v33 — kind digit byte gate: uint32 param, &0xff narrowing, wide drives", () => {
  for (let k = PGD_VRF_KIND_MIN; k <= PGD_VRF_KIND_MAX; ++k) {
    assert.equal(pgdVrfKindFromDigitByte(0x30 + k), k);
  }
  assert.equal(pgdVrfKindFromDigitByte(0x35), 0);
  assert.equal(pgdVrfKindFromDigitByte(0x3a), 0);
  assert.equal(pgdVrfKindFromDigitByte(0), 0);
  // wide drives: the parameter is uint32 — the body narrows with
  // & 0xff; 0x100/0x1ff must NOT be truncated by the caller (a
  // uint8_t-shaped law would corrupt these rows)
  assert.equal(pgdVrfKindFromDigitByte(0x100), 0);      // &0xff = 0
  assert.equal(pgdVrfKindFromDigitByte(0x136), 6);      // &0xff = '6'
  assert.equal(pgdVrfKindFromDigitByte(0x1ff), 0);      // &0xff = 0xff
  assert.equal(pgdVrfKindFromDigitByte(0xffffffff), 0); // &0xff = 0xff
  assert.equal(pgdVrfKindFromDigitByte(0x20000039), 9); // &0xff = '9'
});

test("ABI v33 — the kind selects the exclusive section-id ceiling (9/0xa/0xa/0xb)", () => {
  assert.equal(pgdVrfBoundForKind(6), 0x9);
  assert.equal(pgdVrfBoundForKind(7), 0xa);
  assert.equal(pgdVrfBoundForKind(8), 0xa);
  assert.equal(pgdVrfBoundForKind(9), 0xb);
  assert.equal(pgdVrfBoundForKind(0), 0);
  assert.equal(pgdVrfBoundForKind(5), 0);
  assert.equal(pgdVrfBoundForKind(10), 0);
  assert.equal(pgdVrfBoundForKind(0x100), 0);
  assert.equal(pgdVrfBoundForKind(-1), 0);
  // cross-prove against the PGDV ceiling law (same table)
  for (let v = 0; v < PGD_MAGIC_VARIANTS; ++v) {
    assert.equal(
      pgdVrfBoundForKind(pgdVersionForVariant(v)),
      pgdMaxSectionIdForVariant(v),
      `variant ${v} ceiling`,
    );
  }
});

test("ABI v33 — the trailing-dword compare is FULL u32 (cmp @0x927046)", () => {
  assert.equal(pgdVrfTrailingMatch(0, 0), 1);
  assert.equal(pgdVrfTrailingMatch(1, 0), 0);
  assert.equal(pgdVrfTrailingMatch(0, 1), 0);
  assert.equal(pgdVrfTrailingMatch(0xffffffff, 0xffffffff), 1);
  assert.equal(pgdVrfTrailingMatch(0xffffffff, 0), 0);
  // wide drives: 0x100/0x1ff compare as full dwords — a uint8_t
  // narrowing would wrongly pass 0x100 == 0x100 at the wrong width
  // and wrongly fail 0x1ff != 0xff (M3)
  assert.equal(pgdVrfTrailingMatch(0x100, 0x100), 1);
  assert.equal(pgdVrfTrailingMatch(0x1ff, 0x1ff), 1);
  assert.equal(pgdVrfTrailingMatch(0x1ff, 0xff), 0);
  assert.equal(pgdVrfTrailingMatch(0x100, 0), 0);
});

test("ABI v33 — the kind gate is UNSIGNED kind > 8 (`cmp ebx,8 ; ja`)", () => {
  assert.equal(pgdVrfKindAccepted(6), 0);
  assert.equal(pgdVrfKindAccepted(7), 0);
  assert.equal(pgdVrfKindAccepted(8), 0);
  assert.equal(pgdVrfKindAccepted(9), 1);
  assert.equal(pgdVrfKindAccepted(0), 0);
  assert.equal(pgdVrfKindAccepted(4), 0);
  // wide drives: the unsigned ja accepts any value above 8 — the
  // byte-narrowed variant of the gate would fail these (M4)
  assert.equal(pgdVrfKindAccepted(0x100), 1);
  assert.equal(pgdVrfKindAccepted(0x1ff), 1);
  assert.equal(pgdVrfKindAccepted(0xffffffff), 1);
});

test("ABI v33 — verify-open composite: kind -> fold -> trailing (machine order)", () => {
  // synthetic 09R save: 16-byte magic + body + trailing = fold(region)
  const header = vrfBytesOf("ISAACNGSAVE09R  ");
  const body = [];
  for (let i = 0; i < 0x40; ++i) body.push((i * 7 + 1) & 0xff);
  const trailing = pgdChecksumBuffer(body, body.length, PGD_CHECKSUM_MODE_CRC);
  const file = [...header, ...body, ...vrfLe32(trailing)];
  const size = file.length;
  // independent transcription, byte-for-byte from the instruction
  // stream: kind from the byte law, fold over [0x10, size-4) (the body
  // IS the region here), compare full-u32 — verify-then-compare ORDER
  // (kind decided first; the header is NOT part of the fold region)
  const wantKind = pgdMagicVariant(header) + PGD_VRF_KIND_MIN;
  assert.equal(wantKind, 9);
  const got = pgdVrfVerifyOpen(file, size);
  assert.equal(got.kind, 9);
  assert.equal(got.bound, 0xb);
  assert.equal(got.ok, 1);
  assert.equal(got.accepted, 1);
  assert.equal(got.result, 1);
  assert.equal(pgdVrfVerifyOpen(file, size).ok,
               pgdVrfTrailingMatch(trailing,
                                   pgdChecksumBuffer(body, body.length,
                                                     PGD_CHECKSUM_MODE_CRC)));
  // region-len law on this file: size - 0x10 - 4 == bodyLen
  assert.equal(pgdChecksumRegionLen(size, 0x10, 4), body.length);

  // trailing corruption: ok flips to 0, kind/bound/accepted unchanged
  const corrupt = [...file];
  corrupt[size - 1] ^= 0x80;
  const bad = pgdVrfVerifyOpen(corrupt, size);
  assert.equal(bad.kind, 9);
  assert.equal(bad.bound, 0xb);
  assert.equal(bad.ok, 0);
  assert.equal(bad.accepted, 1);
  assert.equal(bad.result, 0);

  // header magic mismatch -> DIFFERENT KIND result (byte 12 '9'->'6')
  // while the checksum region is untouched (the fold starts at 0x10)
  const old6 = [...header];
  old6[12] = 0x36;
  const six = pgdVrfVerifyOpen([...old6, ...body, ...vrfLe32(trailing)], size);
  assert.equal(six.kind, 6);
  assert.equal(six.bound, 0x9);
  assert.equal(six.accepted, 0);
  assert.equal(six.ok, 1, "the fold region excludes the header");
  assert.equal(six.result, 0, "kind 6 fails the too-old gate");

  // garbage header: the pure ok STAYS 1 (trailing still matches the
  // body fold — the region excludes the header), but the machine
  // early-fails at 0x927ca0 ("%.16s" header log) BEFORE the compare,
  // so the machine-final result is 0
  const garbage = pgdVrfVerifyOpen([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...body, ...vrfLe32(trailing)], size);
  assert.equal(garbage.kind, 0);
  assert.equal(garbage.bound, 0);
  assert.equal(garbage.accepted, 0);
  assert.equal(garbage.ok, 1);
  assert.equal(garbage.result, 0);

  // size == 0x14: region len 0 -> fold(empty) == seed; ok iff the
  // trailing dword (the whole 4-byte body) equals the seed
  const tiny = [...header, ...vrfLe32(PGD_CHECKSUM_SEED)];
  const t = pgdVrfVerifyOpen(tiny, 0x14);
  assert.equal(t.kind, 9);
  assert.equal(t.ok, 1);
  assert.equal(t.result, 1);
  const tinyBad = [...tiny];
  tinyBad[0x13] ^= 1;
  assert.equal(pgdVrfVerifyOpen(tinyBad, 0x14).ok, 0);
  assert.equal(pgdVrfVerifyOpen(tinyBad, 0x14).result, 0);

  // undersized rows are deterministic (reads past the file yield 0)
  const under = pgdVrfVerifyOpen(header, 0x10);
  assert.equal(under.kind, 9);
  assert.equal(under.ok, 0, "trailing reads header dword 3 != seed");
  assert.equal(under.result, 0);
  assert.equal(pgdVrfVerifyOpen([], 0).kind, 0);
  assert.equal(pgdVrfVerifyOpen([], 0).ok, 0);
  assert.equal(pgdVrfVerifyOpen([], 0).result, 0);
  assert.equal(pgdVrfVerifyOpen(null, 0x40).kind, 0);
  assert.equal(pgdVrfVerifyOpen(null, 0x40).ok, 0);
  assert.equal(pgdVrfVerifyOpen(null, 0x40).result, 0);
});

test("ABI v33 — PGDVRF oracle parity: composite vs independent transcription (<=500 draws)", () => {
  const rng = makeRng(0x51f0);
  const draws = 200;
  for (let n = 0; n < draws; ++n) {
    // header: 70% a real magic (with a random digit flip 30% of the
    // time), 30% garbage
    const header = new Array(16).fill(0);
    const isMagic = pick(rng, 10) < 7;
    if (isMagic) {
      const v = pick(rng, 4);
      const flip = pick(rng, 10) < 3;
      header[12] = flip ? 0x30 + (pick(rng, 4) + 6) : 0x30 + 6 + v;
      for (let i = 0; i < 12; ++i) header[i] = VRF_MAGIC_STRINGS_EXPECTED[v].charCodeAt(i);
      header[13] = 0x52;
      header[14] = 0x20;
      header[15] = 0x20;
    } else {
      for (let i = 0; i < 16; ++i) header[i] = rng() & 0xff;
    }
    const bodyLen = 0x14 + pick(rng, 0x60);
    const body = [];
    for (let i = 0; i < bodyLen; ++i) body.push(rng() & 0xff);
    const checksum = pgdChecksumBuffer(body, bodyLen, PGD_CHECKSUM_MODE_CRC);
    const corruptTrailing = pick(rng, 4) === 0;
    const trailing = corruptTrailing ? (checksum ^ 0x55aa55aa) >>> 0 : checksum;
    const file = [...header, ...body, ...vrfLe32(trailing)];
    const size = file.length;
    const got = pgdVrfVerifyOpen(file, size);
    // independent transcription (byte law + buffer fold + compare)
    const kind = pgdMagicVariant(header) >= 0 ? pgdMagicVariant(header) + 6 : 0;
    const ok = pgdVrfTrailingMatch(trailing, checksum);
    const accepted = pgdVrfKindAccepted(kind);
    const matched = kind >= PGD_VRF_KIND_MIN && kind <= PGD_VRF_KIND_MAX;
    assert.equal(got.kind, kind, `draw ${n} kind`);
    assert.equal(got.bound, pgdVrfBoundForKind(kind), `draw ${n} bound`);
    assert.equal(got.ok, ok, `draw ${n} ok`);
    assert.equal(got.accepted, accepted, `draw ${n} accepted`);
    assert.equal(got.result, matched && ok === 1 && accepted === 1 ? 1 : 0, `draw ${n} result`);
    // dword law on the same header (byte-composed dwords)
    const q = [vrfU32At(header, 0), vrfU32At(header, 4), vrfU32At(header, 8), vrfU32At(header, 12)];
    assert.equal(pgdVrfKindFromHeader(q[0], q[1], q[2], q[3]), kind, `draw ${n} dword kind`);
  }
  // draw budget respected: 200 < 500
  assert.ok(draws <= 500);
});

test("ABI v33 — header and model record the v31 PGDVRF evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGDVRF_VA = 0x00926f10u/);
  assert.match(h, /ISAAC_PGDVRF_SEH_HANDLER_VA = 0x00b0a991u/);
  assert.match(h, /ISAAC_PGDVRF_COMPARE_DWORDS = 4/);
  assert.match(h, /ISAAC_PGDVRF_OLD_VERSION_LOG_VA = 0x00b7aac8u/);
  assert.match(h, /ISAAC_PGDVRF_CHECKSUM_CALL_VA = 0x00927017u/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /kVrfMagicDwords/);
  assert.match(s, /isaac_pgd_vrf_verify_open/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_VRF_VA = 0x00926f10/);
  assert.match(m, /export function pgdVrfVerifyOpen/);
  assert.match(m, /export const PGD_VRF_MAGIC_VAS/);
});

test("ABI v33 — PGDSAN pins match the sanitizer machine (0x927d20)", () => {
  assert.equal(PGD_SAN_VA, 0x00927d20);
  assert.equal(PGD_SAN_RET_VA, 0x009282d3);
  assert.equal(PGD_SAN_BODY_BYTES, 0x5b4);
  assert.equal(PGD_SAN_INBOUND, 1); /* the driver 0x926ea3 */
  assert.equal(PGD_SAN_RETURN_STACK, 0);
  assert.equal(PGD_SAN_VERSION_OFF, 0x2c0);
  assert.equal(PGD_SAN_FLAG_OFF, 0x3c);
  assert.equal(PGD_SAN_COMMON_OFF, 0xea8);
  assert.equal(PGD_SAN_FLAG_FIELD, 0xeac);
  assert.equal(PGD_SAN_FIELD_COUNT, 21);
  assert.equal(PGD_SAN_FLAG_GATE_CMP_VA, 0x00927d28);
  assert.deepEqual(PGD_SAN_VERSION_GATE_MINS, [1, 2, 3, 4, 5, 6, 7, 8, 9, 0xa, 0xb]);
  assert.deepEqual(PGD_SAN_VERSION_FIELDS,
    [0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc, 0xed0, 0xed4, 0xed8]);
  assert.deepEqual(PGD_SAN_COUNTER_SOURCES,
    [0x2f0, 0x2e8, 0x320, 0x31c, 0x324, 0x534, 0x5a8, 0xa68, 0xa6c]);
  assert.deepEqual(PGD_SAN_COUNTER_FIELDS,
    [0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0, 0xef8, 0xf00, 0xf04]);
  assert.deepEqual(PGD_SAN_GATED_FIELDS,
    [0xeac, 0xeb0, 0xeb4, 0xeb8, 0xebc, 0xec0, 0xec4, 0xec8, 0xecc,
     0xed0, 0xed4, 0xed8, 0xedc, 0xee0, 0xee8, 0xee4, 0xeec, 0xef0,
     0xef8, 0xf00, 0xf04]);
  assert.equal(PGD_SAN_VERSION_GATE_VAS.length, 11);
  assert.equal(PGD_SAN_VERSION_GATE_VAS[0], 0x00927d94);
  assert.equal(PGD_SAN_VERSION_GATE_VAS[10], 0x0092801a);
  assert.equal(PGD_SAN_COUNTER_GATE_VAS.length, 9);
  assert.equal(PGD_SAN_COUNTER_GATE_VAS[0], 0x00928057);
  assert.equal(PGD_SAN_CLAMP_ROW_VAS.length, 21);
  assert.equal(PGD_SAN_CLAMP_ROW_VAS[0], 0x00927d34);
  assert.equal(PGD_SAN_CLAMP_ROW_VAS[20], 0x00928268);
  assert.equal(pgdSanVa(), PGD_SAN_VA);
  assert.equal(pgdSanVersionGateMin(10), 0xb);
  assert.equal(pgdSanClampRowVa(21), 0);
});

test("ABI v33 — PGDSAN clamp is the SIGNED cmovg min-1 (wide drives)", () => {
  assert.equal(pgdSanClampMin1(0), 1);
  assert.equal(pgdSanClampMin1(1), 1);
  assert.equal(pgdSanClampMin1(2), 2);
  assert.equal(pgdSanClampMin1(0x100), 0x100);
  assert.equal(pgdSanClampMin1(0x7fffffff), 0x7fffffff);
  /* the cmovg is SIGNED: high-bit-set u32 values read negative */
  assert.equal(pgdSanClampMin1(0x80000000), 1);
  assert.equal(pgdSanClampMin1(0xffffffff), 1);
  assert.equal(pgdSanClampMin1(0xdeadbeef), 1);
  /* gates: version/counter `jl` are SIGNED too */
  assert.equal(pgdSanVersionGate(0xb, 0xb), 1);
  assert.equal(pgdSanVersionGate(0xa, 0xb), 0);
  assert.equal(pgdSanVersionGate(0x7fffffff, 1), 1);
  assert.equal(pgdSanVersionGate(-1, 1), 0);
  assert.equal(pgdSanCounterGate(0), 0);
  assert.equal(pgdSanCounterGate(1), 1);
  assert.equal(pgdSanCounterGate(0x80000000), 0); /* signed < 1 */
  /* byte flag gate: uint32 + & 0xff (a uint8_t param would fail) */
  assert.equal(pgdSanFlagGate(0), 0);
  assert.equal(pgdSanFlagGate(1), 1);
  assert.equal(pgdSanFlagGate(0x100), 0);
  assert.equal(pgdSanFlagGate(0x1ff), 1);
});

test("ABI v33 — PGDSAN composite: 21 gated fields + the shared 0xea8", () => {
  const fields = new Array(21).fill(0);
  const counters = new Array(9).fill(0);
  let r = pgdSanitizePostLoad(0, 0, counters, fields, 0xea8);
  assert.deepEqual(r.fired, new Array(21).fill(0));
  assert.equal(r.common, 0xea8); /* no block ran -> 0xea8 untouched */
  /* byte flag alone fires block 0 AND the common clamp */
  r = pgdSanitizePostLoad(0, 1, counters, fields, 0xea8);
  assert.equal(r.fired[0], 1);
  assert.equal(r.fired[1], 0);
  assert.equal(r.common, 0xea8); /* 0xea8 > 1 keeps its value */
  /* version 5 fires blocks 1..5; 0xea8 clamps when any gate held */
  r = pgdSanitizePostLoad(5, 0, counters, fields, 0);
  assert.deepEqual(r.fired.slice(1, 6), [1, 1, 1, 1, 1]);
  assert.equal(r.fired[6], 0);
  assert.equal(r.fired[11], 0);
  assert.equal(r.common, 1);
  /* counter sources 0/1 gate the 9 counter blocks */
  const cs = new Array(9).fill(1);
  r = pgdSanitizePostLoad(0, 0, cs, fields, 0);
  assert.deepEqual(r.fired.slice(12), new Array(9).fill(1));
  assert.equal(r.fired[1], 0);
  /* field values clamp only when their gate held */
  const fv = new Array(21).fill(7);
  fv[12] = 0; /* the first counter-gated field: clamps to 1 */
  r = pgdSanitizePostLoad(1, 0, cs, fv, 9);
  assert.equal(r.fields[0], 7); /* flag gate off -> untouched */
  assert.equal(r.fields[2], 7); /* version 1 (gate >= 3) off -> untouched */
  assert.equal(r.fields[12], 1); /* counter gate 0x2f0 >= 1 on; 0 clamps to 1 */
  assert.equal(r.fields[13], 7); /* 7 > 1 stays 7 (clamp fired, value kept) */
  assert.equal(r.fired[12], 1);
  assert.equal(r.common, 9); /* 9 > 1 stays */
});

test("ABI v33 — PGDGATE pins + the 11-row table is PE-truth", () => {
  assert.equal(PGD_GATE_VA, 0x00929820);
  assert.equal(PGD_GATE_RET_VA, 0x009299d0);
  assert.equal(PGD_GATE_BODY_BYTES, 0x1b1);
  assert.equal(PGD_GATE_INBOUND, 1);
  assert.equal(PGD_GATE_RETURN_STACK, 0);
  assert.equal(PGD_GATE_GUARD_GLOBAL_VA, 0x00c7169c);
  assert.equal(PGD_GATE_GUARD_OFF, 0x2a378);
  assert.equal(PGD_GATE_EVENT_COUNTER_CALL_VA, 0x0092983e);
  assert.equal(PGD_GATE_EVENT_COUNTER_TARGET_VA, 0x00929b40);
  assert.equal(PGD_GATE_TRY_UNLOCK_VA, 0x00929a20);
  assert.equal(PGD_GATE_DIV_MAGIC, 0x10624dd3);
  assert.equal(PGD_GATE_DIV_SHIFT, 38);
  assert.equal(PGD_GATE_RUNS_DIVISOR, 1000);
  assert.equal(PGD_GATE_RUNS_THRESHOLD, 0x1f4);
  assert.equal(PGD_GATE_ROW_COUNT, 11);
  assert.deepEqual(PGD_GATE_ROW_IDS,
    [0x17d, 0x16b, 0x154, 0x155, 0x15c, 0x165, 0x15f, 0x16d, 0x170, 0x176, 0x168]);
  assert.deepEqual(PGD_GATE_ROW_GATE_VAS,
    [0x00929843, 0x00929870, 0x0092988e, 0x009298fd, 0x0092993b,
     0x00929950, 0x00929965, 0x00929977, 0x00929989, 0x0092999b, 0x009299ad]);
  assert.deepEqual(PGD_GATE_ROW_CALL_VAS,
    [0x0092986b, 0x00929889, 0x009298f8, 0x00929936, 0x0092994b,
     0x00929960, 0x00929972, 0x00929984, 0x00929996, 0x009299a8, 0x009299bd]);
  assert.deepEqual(PGD_GATE_COUNTER_FIELDS,
    [0x35c, 0x404, 0x43c, 0x474, 0x394, 0x3cc, 0x530, 0x4c0, 0x4f8, 0x5a4]);
  assert.equal(PGD_GATE_RUNS_FIELD, 0x488);
  assert.equal(PGD_GATE_FIELD_COUNT, 27);
  assert.equal(PGD_GATE_FIELD_SLOTS.length, 27);
  assert.equal(PGD_GATE_FIELD_SLOTS[0], "byte1");
  assert.equal(PGD_GATE_FIELD_SLOTS[26], "b189");
  assert.equal(pgdGateRowId(10), 0x168);
  assert.equal(pgdGateRowKind(2), PGD_GATE_ROW_KINDS[2]);
});

test("ABI v33 — PGDGATE byte/u32 gates + the %1000 runs law", () => {
  assert.equal(pgdGateByteSet(0), 0);
  assert.equal(pgdGateByteSet(1), 1);
  assert.equal(pgdGateByteSet(0x100), 0); /* & 0xff — no uint8_t */
  assert.equal(pgdGateByteSet(0x1ff), 1);
  assert.equal(pgdGateByteClear(0), 1);
  assert.equal(pgdGateByteClear(0x1ff), 0);
  assert.equal(pgdGateU32Gt(0), 0);
  assert.equal(pgdGateU32Gt(1), 1);
  assert.equal(pgdGateU32Gt(0xffffffff), 1); /* full width */
  assert.equal(pgdGateAnyCounter([0, 0, 0]), 0);
  assert.equal(pgdGateAnyCounter([0, 0x100, 0]), 1);
  assert.equal(pgdGateAnyCounter([0xffffffff]), 1);
  /* remainder rows vs the PE magic-divide (BigInt oracle) */
  assert.equal(pgdGateRunsRemainder(0), 0);
  assert.equal(pgdGateRunsRemainder(499), 499);
  assert.equal(pgdGateRunsRemainder(500), 500);
  assert.equal(pgdGateRunsRemainder(999), 999);
  assert.equal(pgdGateRunsRemainder(1000), 0);
  assert.equal(pgdGateRunsRemainder(0xffffffff), 0xffffffff % 1000);
  assert.equal(pgdGateRuns1000(500, 0), 1);
  assert.equal(pgdGateRuns1000(499, 0), 0);
  assert.equal(pgdGateRuns1000(499, 1), 1);
  assert.equal(pgdGateRuns1000(0xffffffff, 0), 0); /* 295 < 500 */
  assert.equal(pgdGateRuns1000(0xffffffff, 1), 1); /* flag131 ORs in */
});

test("ABI v33 — PGDGATE row predicates + the ordered composite", () => {
  assert.equal(pgdGateRowA(0, 1, 1, 1), 1);
  assert.equal(pgdGateRowA(1, 1, 1, 1), 0); /* !byte[1] */
  assert.equal(pgdGateRowA(0, 0, 1, 1), 0);
  assert.equal(pgdGateRowB(0, 1, 1), 1);
  assert.equal(pgdGateRowB(1, 1, 1), 0);
  assert.equal(pgdGateRowC(0, [0, 0, 1]), 1);
  assert.equal(pgdGateRowC(1, [0, 1]), 0);
  assert.equal(pgdGateRowD(0, 500, 0), 1);
  assert.equal(pgdGateRowD(1, 500, 0), 0);
  assert.equal(pgdGateRowE(0), 0);
  assert.equal(pgdGateRowE(1), 1);
  /* composite: all 11 rows fire in machine order */
  const all = {
    byte1: 0, b5c: 1, b27: 1, c4c: 1, c39: 1, bd0: 1, b18c: 0,
    counters: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1], b18d: 0, runs: 500,
    b131: 1, c320: 1, c5a8: 1, b5d: 1, b5e: 1, b5f: 1, b60: 1, b189: 1,
  };
  assert.deepEqual(pgdPostLoadGates(all), PGD_GATE_ROW_IDS);
  /* none fire */
  assert.deepEqual(pgdPostLoadGates({}), []);
  /* mixed: A + D + K only */
  const mix = { byte1: 0, b5c: 1, b27: 1, c4c: 1, b18d: 0, runs: 500, b189: 1 };
  assert.deepEqual(pgdPostLoadGates(mix), [0x17d, 0x155, 0x168]);
});

test("ABI v33 — PGDCNT pins + the count/threshold laws", () => {
  assert.equal(PGD_CNT_VA, 0x0092a350);
  assert.equal(PGD_CNT_RET_VA, 0x0092a510);
  assert.equal(PGD_CNT_BODY_BYTES, 0x1c1);
  assert.equal(PGD_CNT_INBOUND, 6);
  assert.equal(PGD_CNT_RETURN_STACK, 0);
  assert.equal(PGD_CNT_ITEM_FLAG_OFF, 0xae8);
  assert.equal(PGD_CNT_ACH_OFF, 0x38);
  assert.equal(PGD_CNT_ITEM_LOOP_HI, 0x2dc);
  assert.equal(PGD_CNT_ACH_CAP, 0x15a);
  assert.deepEqual(PGD_CNT_SPECIAL_IDS, [0x114, 0x14d, 0x14e, 0x14f, 0x11b, 0x14b]);
  assert.deepEqual(PGD_CNT_BADGE_IDS, [0x52, 0x54, 0x81, 0x82, 0x83, 0x84, 0x85, 0x9c, 0xaf]);
  assert.deepEqual(PGD_CNT_UNLOCK_IDS, [0x45, 0x54, 0xeb, 0x153, 0x27d]);
  assert.equal(PGD_CNT_T1, 0x15a);
  assert.equal(PGD_CNT_T2, 0x1fe);
  assert.equal(PGD_CNT_T6, 0x280);
  assert.equal(PGD_CNT_MAP_FIND_VA, 0x0072fd10);
  assert.equal(PGD_CNT_MAP_OFF, 0x2a404);
  assert.equal(PGD_CNT_B3_OFF, 0xb3);
  assert.equal(pgdCntSpecial(0x114), 1);
  assert.equal(pgdCntSpecial(0x115), 0);
  assert.equal(pgdCntBadge(0xaf), 1);
  assert.equal(pgdCntBadge(0x53), 0);
  assert.equal(pgdCntItemFlag([0, 1, 0, 0], 1), 1);
  assert.equal(pgdCntItemFlag([0, 1, 0, 0], 2), 0);
  assert.equal(pgdCntItemFlag([0, 1, 0, 0], 0x2dd), 0);
  assert.equal(pgdCntCountNonzero([0, 1, 0, 1], 1, 3), 2);
  assert.equal(pgdCntCountBadges([0, 0, 0, 0], 1, 3), 0); /* no badge ids in 1..3 */
  const ach = new Array(0xb3).fill(0);
  ach[0x52] = 1;
  assert.equal(pgdCntCountNonzero(ach, 1, 0xb2), 1);
  assert.equal(pgdCntCountBadges(ach, 1, 0xb2), 8); /* 8 unowned badges */
  assert.equal(pgdCntFire(0xb1, 0xb1), 1);
  assert.equal(pgdCntFire(0xb0, 0xb1), 0);
  assert.equal(pgdCntFire(-1, 0xb1), 0); /* signed jl */
});

test("ABI v33 — PGDCNT composite: T1/T2 thresholds + ordered ids", () => {
  /* empty save: 6 special ids count; T1/T2 far below -> no ids */
  let r = pgdPostLoadCounts([], [], []);
  assert.equal(r.special, 6);
  assert.equal(r.total, 0);
  assert.deepEqual(r.ids, []);
  /* item flags: id 1..0x15a count into ach; > 0x15a only total */
  const flags = new Array(0x2dd).fill(0);
  for (let i = 1; i <= 0x2dc; ++i) flags[i] = 1;
  r = pgdPostLoadCounts(flags, new Array(0x283).fill(0), []);
  assert.equal(r.total, 0x2dc);
  assert.equal(r.ach, 0x15a); /* the cmova cap: id > 0x15a excluded */
  assert.equal(r.special, 0); /* flagged special ids count as items */
  assert.equal(r.c1, 0); /* T1 = special+ach = 0x15a >= 0x15a -> fires */
  /* wait: T1 fires at (0 + 0x15a) >= 0x15a; c1 counts ach nonzero = 0 */
  assert.deepEqual(r.ids, []); /* c1+0 = 0 < 0xb1; c1 < 0xb1 */
  /* T2: total 0x2dc >= 0x1fe -> c3 = 0 -> no ids */
  assert.equal(r.c3, 0);
  /* all achievements owned: T1 -> c1 = 0xb2 (ids 1..0xb2), c2 = 0 */
  const ach = new Array(0x283).fill(0);
  for (let i = 1; i <= 0x282; ++i) ach[i] = 1;
  r = pgdPostLoadCounts(flags, ach, []);
  assert.equal(r.c1, 0xb2);
  assert.equal(r.c2, 0);
  assert.equal(r.c3, 0x281);
  /* c1+c2 = 0xb2 >= 0xb1 -> 0x45; c1 >= 0xb1 && special == 0 -> 0x54 */
  /* c3 = 0x281 >= 0x113 -> 0xeb; >= 0x192 -> 0x153; total 0x2dc >= 0x2dc
     AND c3 >= 0x280 -> 0x27d */
  assert.deepEqual(r.ids, [0x45, 0x54, 0xeb, 0x153, 0x27d]);
  /* countable items via the HOST map predicate */
  const countable = new Array(0x2dd).fill(0);
  countable[0x200] = 1;
  r = pgdPostLoadCounts(new Array(0x2dd).fill(0), new Array(0x283).fill(0), countable);
  assert.equal(r.total, 1); /* id 0x200 flagged via map (not special) */
  assert.equal(r.ach, 0); /* 0x200 > 0x15a cap */
});

test("ABI v33 — PGDSAN/PGDGATE/PGDCNT oracle parity (<=500 draws)", () => {
  let seed = 0x9e3779b9;
  const lcg = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const rnd = (n) => lcg() % n;
  for (let d = 0; d < 150; ++d) {
    const version = rnd(0x10);
    const flag = rnd(0x200);
    const counters = Array.from({ length: 9 }, () => rnd(4));
    const fields = Array.from({ length: 21 }, () => rnd(8));
    const common = rnd(8);
    const r = pgdSanitizePostLoad(version, flag, counters, fields, common);
    const want = fields.map((v, i) => {
      let gate = 0;
      if (i === 0) gate = (flag & 0xff) !== 0 ? 1 : 0;
      else if (i <= 11) gate = (version | 0) >= PGD_SAN_VERSION_GATE_MINS[i - 1] ? 1 : 0;
      else gate = (counters[i - 12] | 0) >= 1 ? 1 : 0;
      return gate ? ((v | 0) > 1 ? v : 1) : v;
    });
    const any = want.some((v, i) => v !== fields[i]);
    assert.deepEqual(r.fields, want);
    assert.equal(r.common, any ? ((common | 0) > 1 ? common : 1) : common);
  }
  for (let d = 0; d < 150; ++d) {
    const input = {
      byte1: rnd(0x200), b5c: rnd(0x200), b27: rnd(0x200), c4c: rnd(0x200),
      c39: rnd(0x200), bd0: rnd(0x200), b18c: rnd(0x200),
      counters: Array.from({ length: 10 }, () => rnd(4)),
      b18d: rnd(0x200), runs: rnd(0x2000), b131: rnd(0x200),
      c320: rnd(4), c5a8: rnd(4), b5d: rnd(0x200), b5e: rnd(0x200),
      b5f: rnd(0x200), b60: rnd(0x200), b189: rnd(0x200),
    };
    const got = pgdPostLoadGates(input);
    const want = [];
    const b = (v) => (v & 0xff) !== 0;
    if (!b(input.byte1) && b(input.b5c) && b(input.b27) && b(input.c4c)) want.push(0x17d);
    if (!b(input.byte1) && b(input.c39) && b(input.bd0)) want.push(0x16b);
    if (!b(input.b18c) && input.counters.some((v) => v >>> 0 > 0)) want.push(0x154);
    if (!b(input.b18d) && (pgdGateRunsRemainder(input.runs) >= 500 || b(input.b131))) want.push(0x155);
    if ((input.c320 >>> 0) > 0) want.push(0x15c);
    if ((input.c5a8 >>> 0) > 0) want.push(0x165);
    for (const [k, id] of [["b5d", 0x15f], ["b5e", 0x16d], ["b5f", 0x170], ["b60", 0x176], ["b189", 0x168]]) {
      if (b(input[k])) want.push(id);
    }
    assert.deepEqual(got, want);
  }
  for (let d = 0; d < 200; ++d) {
    const flags = Array.from({ length: 0x2dd + 1 }, () => rnd(2));
    const ach = Array.from({ length: 0x283 + 1 }, () => rnd(2));
    const countable = Array.from({ length: 0x2dd + 1 }, () => rnd(2));
    const r = pgdPostLoadCounts(flags, ach, countable);
    let total = 0, achC = 0, special = 0;
    for (let id = 1; id <= 0x2dc; ++id) {
      if ((flags[id] & 0xff) !== 0) {
        total += 1;
        if ((id >>> 0) <= 0x15a) achC += 1;
      } else if (PGD_CNT_SPECIAL_IDS.includes(id >>> 0)) {
        special += 1;
      } else if ((countable[id] & 0xff) !== 0) {
        total += 1;
        if ((id >>> 0) <= 0x15a) achC += 1;
      }
    }
    const ids = [];
    let c1 = 0, c2 = 0;
    if ((special + achC | 0) >= 0x15a) {
      for (let id = 1; id <= 0xb2; ++id) if ((ach[id] & 0xff) !== 0) c1 += 1;
      for (let id = 1; id <= 0xb2; ++id) {
        if ((ach[id] & 0xff) === 0 && PGD_CNT_BADGE_IDS.includes(id >>> 0)) c2 += 1;
      }
      if ((c1 + c2 | 0) >= 0xb1) ids.push(0x45);
      if ((c1 | 0) >= 0xb1 && special === 0) ids.push(0x54);
    }
    let c3 = 0;
    if ((total | 0) >= 0x1fe) {
      for (let id = 1; id <= 0x281; ++id) if ((ach[id] & 0xff) !== 0) c3 += 1;
      if ((c3 | 0) >= 0x113) ids.push(0xeb);
      if ((c3 | 0) >= 0x192) ids.push(0x153);
      if ((total | 0) >= 0x2dc && (c3 | 0) >= 0x280) ids.push(0x27d);
    }
    assert.deepEqual(r, { total, ach: achC, special, c1, c2, c3, ids });
  }
});

test("ABI v33 — R11 ledger row pinned: id 11 unreachable for kind 9", () => {
  /* the verifier's kind-9 bound excludes id 11 BEFORE the dispatch:
     `cmp eax,[ebp-0x44] ; jge 0x927c8a` with [ebp-0x44] = 0xb -> the
     R11 jump-table case (entry 0x9276e1) is dead code for kind 9.
     Original-binary defect — pinned, NOT corrected. */
  assert.equal(pgdVrfBoundForKind(9), 0xb);
  assert.equal(pgdVrfJumpTableEntries(), 11);
  assert.equal(PGD_VRF_JUMP_TABLE_ENTRIES, 11);
  assert.equal(PGD_VRF_BOUNDS[3], 0xb);
  /* id 11 passes the reader loop gate ONLY below the bound */
  assert.equal(pgdReaderLoopContinue(11, 0xb), false); /* 11 >= 0xb -> stop */
  assert.equal(pgdReaderLoopContinue(10, 0xb), true);
});

test("ABI v33 — header and model record the v32 post-load evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGDSAN_VA = 0x00927d20u/);
  assert.match(h, /ISAAC_PGDGATE_VA = 0x00929820u/);
  assert.match(h, /ISAAC_PGDCNT_VA = 0x0092a350u/);
  assert.match(h, /ISAAC_PGDGATE_DIV_MAGIC = 0x10624dd3u/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_sanitize_post_load/);
  assert.match(s, /isaac_pgd_post_load_gates/);
  assert.match(s, /isaac_pgd_post_load_counts/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_SAN_VA = 0x00927d20/);
  assert.match(m, /PGD_GATE_VA = 0x00929820/);
  assert.match(m, /PGD_CNT_VA = 0x0092a350/);
  assert.match(m, /export function pgdSanitizePostLoad/);
  assert.match(m, /export function pgdPostLoadGates/);
  assert.match(m, /export function pgdPostLoadCounts/);
});

/* ============================================================
   ABI v33 — PGDRO / PGDUNL / PGDADDIT: the TryUnlock-adjacent
   decision islands 0x9299e0 / 0x929aa0 / 0x92a2d0. Evidence:
   section-notes/pgd-v33-islands/.
   ============================================================ */

const V33_RO_CALL_SITES = [0x007fc735, 0x007fc78c, 0x007fc7e3, 0x0095a780];
const V33_UNL_CALL_SITES = [
  0x004226d2, 0x004227b0, 0x00422dc5, 0x005b590e, 0x005b5939, 0x005b5964,
  0x005b5b13, 0x005b84f4, 0x005bb934, 0x005be4d5, 0x0065f66f, 0x006607e4,
  0x00660855, 0x0066fe2c, 0x00730669, 0x00730b0b, 0x00730b73, 0x00736370,
  0x00775d5c, 0x00775d86, 0x00795390, 0x007b3184, 0x007b36b3, 0x007c2fa1,
  0x007ec477, 0x007ec75b, 0x008e21de, 0x00946d1e, 0x0095a9a3, 0x009b9a64,
  0x009edf19, 0x009edf92,
];
const V33_ADDIT_CALL_SITES = [
  0x006eba64, 0x0075f3d4, 0x0079c17f, 0x007a3f84, 0x007a40ab, 0x0090d458,
];

test("ABI v33 — PGDRO pins + the low-byte string-choice/store laws", () => {
  assert.equal(PGD_RO_VA, 0x009299e0);
  assert.equal(PGD_RO_RET_VA, 0x00929a0f);
  assert.equal(PGD_RO_BODY_BYTES, 0x00929a13 - 0x009299e0);
  assert.equal(PGD_RO_INBOUND, 4);
  assert.equal(PGD_RO_RETURN_STACK, 4);
  assert.equal(PGD_RO_READONLY_OFF, 0x01);
  assert.equal(PGD_RO_LOG_VA, 0x00b7aef8);
  assert.equal(PGD_RO_STRING_TRUE_VA, 0x00b64ff0);
  assert.equal(PGD_RO_STRING_FALSE_VA, 0x00b7af24);
  assert.equal(PGD_RO_LOG_CALL_VA, 0x00a112c0);
  assert.equal(PGD_RO_CMP_CMOVE_VA, 0x009299ef);
  assert.equal(PGD_RO_STORE_VA, 0x00929a09);
  assert.deepEqual(PGD_RO_CALL_SITE_VAS, V33_RO_CALL_SITES);
  assert.equal(pgdRoCallSiteCount(), 4);
  assert.equal(pgdRoCallSiteVa(0), V33_RO_CALL_SITES[0]);
  assert.equal(pgdRoCallSiteVa(4), 0);
  /* effective value: the stored byte is value & 0xff (wide drives —
     a uint8_t param would already be narrowed and could not fail) */
  assert.equal(pgdRoEffectiveValue(0), 0);
  assert.equal(pgdRoEffectiveValue(1), 1);
  assert.equal(pgdRoEffectiveValue(0x100), 0);
  assert.equal(pgdRoEffectiveValue(0x1ff), 0xff);
  assert.equal(pgdRoEffectiveValue(0xffffffff), 0xff);
  /* logs-true: the cmove keyed on the LOW byte */
  assert.equal(pgdRoLogsTrue(0), 0);
  assert.equal(pgdRoLogsTrue(1), 1);
  assert.equal(pgdRoLogsTrue(0x100), 0);
  assert.equal(pgdRoLogsTrue(0x1ff), 1);
  assert.equal(pgdRoStringChoiceVa(0), PGD_RO_STRING_FALSE_VA);
  assert.equal(pgdRoStringChoiceVa(0x100), PGD_RO_STRING_FALSE_VA);
  assert.equal(pgdRoStringChoiceVa(1), PGD_RO_STRING_TRUE_VA);
  assert.equal(pgdRoStringChoiceVa(0x1ff), PGD_RO_STRING_TRUE_VA);
});

test("ABI v33 — PGDUNL pins + the ordered gate machine (v1 law re-verified)", () => {
  assert.equal(PGD_UNL_VA, 0x00929aa0);
  assert.equal(PGD_UNL_RET_VA, 0x00929af0);
  assert.equal(PGD_UNL_BODY_BYTES, 0x00929af3 - 0x00929aa0);
  assert.equal(PGD_UNL_INBOUND, 32);
  assert.equal(PGD_UNL_RETURN_STACK, 4);
  assert.equal(PGD_UNL_ACH_OFF, PGD_OFF_ACHIEVEMENTS);
  assert.equal(PGD_UNL_INDEX_HI, PGD_COUNT_ACHIEVEMENTS);
  assert.deepEqual(PGD_UNL_GATE_VAS, [
    0x00929aa6, 0x00929aab, 0x00929ab5, 0x00929abc, 0x00929ac0,
    0x00929acc, 0x00929ad7, 0x00929adb, 0x00929ae4,
  ]);
  assert.equal(PGD_UNL_TRUE_TAIL_VA, 0x00929aaf);
  assert.equal(PGD_UNL_FALSE_TAIL_VA, 0x00929aed);
  assert.deepEqual(PGD_UNL_CALL_SITE_VAS, V33_UNL_CALL_SITES);
  assert.equal(pgdUnlCallSiteCount(), 32);
  assert.equal(pgdUnlCallSiteVa(31), V33_UNL_CALL_SITES[31]);
  assert.equal(pgdUnlCallSiteVa(32), 0);
  assert.equal(pgdUnlGateVa(0), 0x00929aa6);
  assert.equal(pgdUnlGateVa(8), 0x00929ae4);
  assert.equal(pgdUnlGateVa(9), 0);
  /* the ordered machine (the v1 law, re-verified): sentinel -2 FIRST */
  const base = { modeWord: 2, gameNull: 0, game26630: 0, game26589: 0 };
  assert.equal(pgdUnlocked({ ...base, achievementId: PGD_UNLOCKED_SENTINEL_NEVER }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: -2 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: -1 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: -3 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 0 }), true); /* id0 before the byte read */
  assert.equal(pgdUnlocked({ ...base, achievementId: 0x281, achievementByte: 0 }), false); /* window pass, no flags */
  assert.equal(pgdUnlocked({ ...base, achievementId: 0x282 }), false); /* UNSIGNED window */
  assert.equal(pgdUnlocked({ ...base, achievementId: 0xffffffff }), true); /* negative -> true */
  /* ach byte gate (byte-gated & 0xff) */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, achievementByte: 1 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, achievementByte: 0x100 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, achievementByte: 0x1ff }), true);
  /* mode dword == 2 */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, modeWord: 1 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, modeWord: 3 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, modeWord: 0x102 }), false);
  /* Game* null gate */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, gameNull: 1 }), false);
  /* +0x26630 UNSIGNED > 0 (0x80000000 drives) */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, game26630: 1 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, game26630: 0x80000000 }), true);
  /* +0x26589 byte != 0 */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, game26589: 1 }), true);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, game26589: 0x100 }), false);
  assert.equal(pgdUnlocked({ ...base, achievementId: 5, game26589: 0x1ff }), true);
  /* all flags off -> false */
  assert.equal(pgdUnlocked({ ...base, achievementId: 5 }), false);
});

test("ABI v33 — PGDADDIT pins + the store/count/unlock-row laws", () => {
  assert.equal(PGD_ADDIT_VA, 0x0092a2d0);
  assert.equal(PGD_ADDIT_RET_VA, 0x0092a34c);
  assert.equal(PGD_ADDIT_BODY_BYTES, 0x0092a34e - 0x0092a2d0);
  assert.equal(PGD_ADDIT_INBOUND, 6);
  assert.equal(PGD_ADDIT_RETURN_STACK, 4);
  assert.equal(PGD_ADDIT_COUNT_CALL_VA, PGD_CNT_VA);
  assert.equal(PGD_ADDIT_COUNT_CALL_SITE_VA, 0x0092a2ff);
  assert.equal(PGD_ADDIT_TRY_UNLOCK_VA, 0x00929a20);
  assert.equal(PGD_ADDIT_WINDOW_HI, 0x2dc);
  assert.equal(PGD_ADDIT_ITEM_FLAG_OFF, 0xae8);
  assert.equal(PGD_ADDIT_DIRTY_OFF, 0x00);
  assert.equal(PGD_ADDIT_ROW_A_ID, 0x17d);
  assert.equal(PGD_ADDIT_ROW_B_ID, 0x16b);
  assert.equal(PGD_ADDIT_ROW_A_CALL_VA, 0x0092a326);
  assert.equal(PGD_ADDIT_ROW_B_CALL_VA, 0x0092a344);
  assert.deepEqual(PGD_ADDIT_ROW_A_GATE_VAS, [0x0092a304, 0x0092a30d, 0x0092a316]);
  assert.deepEqual(PGD_ADDIT_ROW_B_GATE_VAS, [0x0092a32b, 0x0092a334]);
  assert.deepEqual(PGD_ADDIT_GATE_FIELD_OFFS, [0xb5c, 0xb27, 0xc4c, 0xc39, 0xbd0]);
  assert.equal(PGD_ADDIT_ENTRY_GATE_VA, 0x0092a2d9);
  assert.equal(PGD_ADDIT_WINDOW_GATE_VA, 0x0092a2df);
  assert.equal(PGD_ADDIT_ID0_SKIP_VA, 0x0092a2e6);
  assert.equal(PGD_ADDIT_OWNED_GATE_VA, 0x0092a2ea);
  assert.deepEqual(PGD_ADDIT_CALL_SITE_VAS, V33_ADDIT_CALL_SITES);
  assert.equal(pgdAdditCallSiteCount(), 6);
  assert.equal(pgdAdditCallSiteVa(5), V33_ADDIT_CALL_SITES[5]);
  /* window: UNSIGNED — negatives and > 0x2dc reject */
  assert.equal(pgdAddToCollectionWindowValid(0x2dc), 1);
  assert.equal(pgdAddToCollectionWindowValid(0x2dd), 0);
  assert.equal(pgdAddToCollectionWindowValid(0x1000), 0); /* > hi, non-negative: kills a signed-window mutant */
  assert.equal(pgdAddToCollectionWindowValid(0x7fffffff), 0);
  assert.equal(pgdAddToCollectionWindowValid(-1), 0);
  assert.equal(pgdAddToCollectionWindowValid(0xffffffff), 0);
  /* store path: readonly entry + window + id != 0 + owned == 0 */
  assert.equal(pgdAddToCollectionStoreFires(0, 1, 0), 1);
  assert.equal(pgdAddToCollectionStoreFires(1, 1, 0), 0);
  assert.equal(pgdAddToCollectionStoreFires(0x100, 1, 0), 1); /* wide arg, low byte 0 -> clear */
  assert.equal(pgdAddToCollectionStoreFires(0x1ff, 1, 0), 0); /* low byte 0xff -> readonly set */
  assert.equal(pgdAddToCollectionStoreFires(0, 0, 0), 0); /* id0 never stores */
  assert.equal(pgdAddToCollectionStoreFires(0, 0x2dd, 0), 0);
  assert.equal(pgdAddToCollectionStoreFires(0, -1, 0), 0);
  assert.equal(pgdAddToCollectionStoreFires(0, 1, 1), 0); /* owned */
  assert.equal(pgdAddToCollectionStoreFires(0, 1, 0x100), 1); /* wide arg, low byte 0 -> not owned */
  assert.equal(pgdAddToCollectionStoreFires(0, 1, 0x1ff), 0); /* low byte 0xff -> owned */
  /* count machine fires iff the store path runs */
  assert.equal(pgdAddToCollectionCountMachineFires(0, 1, 0), 1);
  assert.equal(pgdAddToCollectionCountMachineFires(0, 0, 0), 0);
  assert.equal(pgdAddToCollectionCountMachineFires(1, 1, 0), 0);
  /* rows A/B = the PGDGATE rows without the inline byte1 re-check,
     but gated on readonly AND the window */
  assert.equal(pgdAddToCollectionRowA(0, 1, 1, 1, 1), 1);
  assert.equal(pgdAddToCollectionRowA(1, 1, 1, 1, 1), 0); /* readonly held by entry */
  assert.equal(pgdAddToCollectionRowA(0, 0x2dd, 1, 1, 1), 0); /* out of window */
  assert.equal(pgdAddToCollectionRowA(0, -1, 1, 1, 1), 0);
  assert.equal(pgdAddToCollectionRowA(0, 1, 0, 1, 1), 0);
  assert.equal(pgdAddToCollectionRowA(0, 1, 1, 1, 0x100), 0); /* wide byte gate */
  assert.equal(pgdAddToCollectionRowA(0, 1, 1, 1, 0x1ff), 1);
  assert.equal(pgdAddToCollectionRowA(0, 1, 0x100, 1, 1), 0);
  assert.equal(pgdAddToCollectionRowA(0, 0, 1, 1, 1), 1); /* id0 still fires the rows */
  assert.equal(pgdAddToCollectionRowA(0, 1, 1, 1, 1), 1); /* owned id still fires */
  assert.equal(pgdAddToCollectionRowB(0, 1, 1, 1), 1);
  assert.equal(pgdAddToCollectionRowB(1, 1, 1, 1), 0);
  assert.equal(pgdAddToCollectionRowB(0, 0x2dd, 1, 1), 0);
  assert.equal(pgdAddToCollectionRowB(0, 1, 0, 1), 0);
  assert.equal(pgdAddToCollectionRowB(0, 1, 1, 0x1ff), 1);
  assert.equal(pgdAddToCollectionRowB(0, 1, 1, 0x100), 0);
});

test("ABI v33 — PGDADDIT composite + PGDRO/PGDUNL/PGDADDIT oracle parity (<=500 draws)", () => {
  /* composite: store/count/rowA/rowB independently decided in order */
  let d = pgdAddToCollectionDecisions(0, 1, 0, 1, 1, 1, 1, 1);
  assert.deepEqual(d, { store: 1, count: 1, rowA: 1, rowB: 1 });
  d = pgdAddToCollectionDecisions(0, 1, 1, 1, 1, 1, 1, 1); /* owned */
  assert.deepEqual(d, { store: 0, count: 0, rowA: 1, rowB: 1 });
  d = pgdAddToCollectionDecisions(1, 1, 0, 1, 1, 1, 1, 1); /* readonly */
  assert.deepEqual(d, { store: 0, count: 0, rowA: 0, rowB: 0 });
  d = pgdAddToCollectionDecisions(0, 0, 0, 1, 1, 1, 1, 1); /* id0 */
  assert.deepEqual(d, { store: 0, count: 0, rowA: 1, rowB: 1 });
  d = pgdAddToCollectionDecisions(0, 0x2dd, 0, 1, 1, 1, 1, 1); /* window */
  assert.deepEqual(d, { store: 0, count: 0, rowA: 0, rowB: 0 });
  /* seeded-LCG differential against the independent transcription
     (the machine-order semantics written out inline) */
  let seed = 0x243f6a88;
  const lcg = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const rnd = (n) => lcg() % n;
  const b = (v) => (v & 0xff) !== 0;
  for (let i = 0; i < 150; ++i) {
    const readonly = rnd(0x200);
    const id = rnd(3) === 0 ? 0x2dd + rnd(0x1000) : rnd(0x400) - 0x80; /* band + negatives */
    const owned = rnd(0x100);
    const vals = [rnd(0x200), rnd(0x200), rnd(0x200), rnd(0x200), rnd(0x200)];
    const [b5c, b27, c4c, c39, bd0] = vals;
    const got = pgdAddToCollectionDecisions(readonly, id, owned, b5c, b27, c4c, c39, bd0);
    const inWindow = (id >>> 0) <= 0x2dc;
    const ro = b(readonly);
    const wantStore = !ro && inWindow && ((id | 0) !== 0) && !b(owned);
    const wantA = !ro && inWindow && b(b5c) && b(b27) && b(c4c);
    const wantB = !ro && inWindow && b(c39) && b(bd0);
    assert.deepEqual(got, {
      store: wantStore ? 1 : 0,
      count: wantStore ? 1 : 0,
      rowA: wantA ? 1 : 0,
      rowB: wantB ? 1 : 0,
    });
  }
  for (let i = 0; i < 100; ++i) {
    const v = lcg();
    assert.equal(pgdRoEffectiveValue(v), v & 0xff);
    assert.equal(pgdRoLogsTrue(v), (v & 0xff) !== 0 ? 1 : 0);
    const id = (lcg() % 0x400) - 0x100;
    const ach = rnd(0x200);
    const mode = rnd(6) - 1;
    const gNull = rnd(2);
    const g26630 = lcg();
    const g26589 = rnd(0x200);
    const want = (() => {
      const u = id >>> 0;
      if (u === 0xfffffffe) return false;
      if ((id | 0) < 0) return true;
      if (u >= 0x282) return false;
      if (u === 0) return true;
      if (b(ach)) return true;
      if ((mode | 0) !== 2) return false;
      if (gNull) return false;
      if ((g26630 >>> 0) > 0) return true;
      return b(g26589);
    })();
    assert.equal(
      pgdUnlocked({ achievementId: id, achievementByte: ach, modeWord: mode, gameNull: gNull, game26630: g26630, game26589: g26589 }),
      want,
    );
  }
});

test("ABI v33 — wasm differential for PGDRO/PGDUNL/PGDADDIT", () => {
  assert.ok(wasm, "wasm must be built before this group runs");
  const U = (v) => v >>> 0;
  assert.equal(U(wasm.isaac_pgd_ro_va()), PGD_RO_VA);
  assert.equal(U(wasm.isaac_pgd_ro_ret_va()), PGD_RO_RET_VA);
  assert.equal(wasm.isaac_pgd_ro_body_bytes(), PGD_RO_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_ro_inbound(), PGD_RO_INBOUND);
  assert.equal(wasm.isaac_pgd_ro_call_site_count(), 4);
  assert.equal(U(wasm.isaac_pgd_ro_call_site_va(3)), V33_RO_CALL_SITES[3]);
  assert.equal(U(wasm.isaac_pgd_ro_effective_value(0x1ff)), 0xff);
  assert.equal(wasm.isaac_pgd_ro_logs_true(0x100), 0);
  assert.equal(wasm.isaac_pgd_ro_logs_true(0x1ff), 1);
  assert.equal(U(wasm.isaac_pgd_ro_string_choice_va(0)), PGD_RO_STRING_FALSE_VA);
  assert.equal(U(wasm.isaac_pgd_unl_va()), PGD_UNL_VA);
  assert.equal(U(wasm.isaac_pgd_unl_ret_va()), PGD_UNL_RET_VA);
  assert.equal(wasm.isaac_pgd_unl_body_bytes(), PGD_UNL_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_unl_inbound(), PGD_UNL_INBOUND);
  assert.equal(wasm.isaac_pgd_unl_gate_count(), 9);
  assert.equal(U(wasm.isaac_pgd_unl_gate_va(8)), 0x00929ae4);
  assert.equal(U(wasm.isaac_pgd_unl_true_tail_va()), PGD_UNL_TRUE_TAIL_VA);
  assert.equal(U(wasm.isaac_pgd_unl_false_tail_va()), PGD_UNL_FALSE_TAIL_VA);
  assert.equal(wasm.isaac_pgd_unl_call_site_count(), 32);
  assert.equal(U(wasm.isaac_pgd_unl_call_site_va(0)), V33_UNL_CALL_SITES[0]);
  assert.equal(U(wasm.isaac_pgd_addit_va()), PGD_ADDIT_VA);
  assert.equal(U(wasm.isaac_pgd_addit_ret_va()), PGD_ADDIT_RET_VA);
  assert.equal(wasm.isaac_pgd_addit_body_bytes(), PGD_ADDIT_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_addit_inbound(), PGD_ADDIT_INBOUND);
  assert.equal(U(wasm.isaac_pgd_addit_count_call_va()), PGD_ADDIT_COUNT_CALL_VA);
  assert.equal(U(wasm.isaac_pgd_addit_count_call_site_va()), 0x0092a2ff);
  assert.equal(U(wasm.isaac_pgd_addit_row_a_id()), 0x17d);
  assert.equal(U(wasm.isaac_pgd_addit_row_b_id()), 0x16b);
  assert.equal(U(wasm.isaac_pgd_addit_row_a_call_va()), 0x0092a326);
  assert.equal(U(wasm.isaac_pgd_addit_row_b_call_va()), 0x0092a344);
  assert.equal(U(wasm.isaac_pgd_addit_row_a_gate_va(2)), 0x0092a316);
  assert.equal(U(wasm.isaac_pgd_addit_row_b_gate_va(1)), 0x0092a334);
  assert.equal(wasm.isaac_pgd_addit_gate_field_off(4), 0xbd0);
  assert.equal(U(wasm.isaac_pgd_addit_entry_gate_va()), 0x0092a2d9);
  assert.equal(U(wasm.isaac_pgd_addit_window_gate_va()), 0x0092a2df);
  assert.equal(U(wasm.isaac_pgd_addit_id0_skip_va()), 0x0092a2e6);
  assert.equal(U(wasm.isaac_pgd_addit_owned_gate_va()), 0x0092a2ea);
  assert.equal(U(wasm.isaac_pgd_addit_flag_store_va()), 0x0092a2f4);
  assert.equal(U(wasm.isaac_pgd_addit_dirty_store_va()), 0x0092a2fc);
  assert.equal(wasm.isaac_pgd_addit_call_site_count(), 6);
  assert.equal(U(wasm.isaac_pgd_addit_call_site_va(5)), V33_ADDIT_CALL_SITES[5]);
  assert.equal(wasm.isaac_pgd_addit_window_valid(0x2dc), 1);
  assert.equal(wasm.isaac_pgd_addit_window_valid(0x2dd), 0);
  assert.equal(wasm.isaac_pgd_addit_window_valid(0x1000), 0); /* signed-window mutant discriminator */
  assert.equal(wasm.isaac_pgd_addit_window_valid(-1), 0);
  assert.equal(wasm.isaac_pgd_addit_store_fires(0, 1, 0), 1);
  assert.equal(wasm.isaac_pgd_addit_store_fires(0x100, 1, 0), 1);
  assert.equal(wasm.isaac_pgd_addit_store_fires(0, 0, 0), 0);
  assert.equal(wasm.isaac_pgd_addit_count_machine_fires(0, 1, 0), 1);
  assert.equal(wasm.isaac_pgd_addit_count_machine_fires(1, 1, 0), 0);
  assert.equal(wasm.isaac_pgd_addit_row_a(0, 1, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addit_row_a(1, 1, 1, 1, 1), 0);
  assert.equal(wasm.isaac_pgd_addit_row_a(0, 0x2dd, 1, 1, 1), 0);
  assert.equal(wasm.isaac_pgd_addit_row_b(0, 1, 1, 1), 1);
  assert.equal(wasm.isaac_pgd_addit_row_b(0, 1, 0, 1), 0);
  /* decisions composite: write the 4 out params into scratch */
  const base = SCRATCH_A;
  bytes.fill(0xcc, base, base + 16);
  wasm.isaac_pgd_addit_decisions(0, 1, 0, 1, 1, 1, 1, 1, base, base + 4, base + 8, base + 12);
  assert.equal(view.getInt32(base, true), 1);       /* store */
  assert.equal(view.getInt32(base + 4, true), 1);   /* count */
  assert.equal(view.getInt32(base + 8, true), 1);   /* rowA */
  assert.equal(view.getInt32(base + 12, true), 1);  /* rowB */
  const ro = 0x1ff; /* wide readonly — entry gate rejects */
  wasm.isaac_pgd_addit_decisions(ro, 1, 0, 1, 1, 1, 1, 1, base, base + 4, base + 8, base + 12);
  assert.equal(view.getInt32(base, true), 0);
  assert.equal(view.getInt32(base + 4, true), 0);
  assert.equal(view.getInt32(base + 8, true), 0);
  assert.equal(view.getInt32(base + 12, true), 0);
});

test("ABI v33 — header and model record the v33 island evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGDRO_VA = 0x009299e0u/);
  assert.match(h, /ISAAC_PGDUNL_VA = 0x00929aa0u/);
  assert.match(h, /ISAAC_PGDADDIT_VA = 0x0092a2d0u/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_ro_effective_value/);
  assert.match(s, /isaac_pgd_addit_decisions/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_RO_VA = 0x009299e0/);
  assert.match(m, /PGD_UNL_VA = 0x00929aa0/);
  assert.match(m, /PGD_ADDIT_VA = 0x0092a2d0/);
  assert.match(m, /export function pgdAddToCollectionDecisions/);
});

/* ============================================================
   ABI v34 — PGDCPY: the PersistentGameData COPY-ASSIGN 0x00929010
   (operator=, ret 4 @0x0092922e, returns this). Evidence:
   section-notes/pgd-v34-frontier/ (full resync decode; inbound
   window-verified). The row table below is transcribed from the PE,
   NOT from the C++/model — three independent tables must agree.
   ============================================================ */

/* PE-truth literal rows: {site, kind, off, bytes} in machine order. */
const V34_CPY_PE_ROWS = [
  [0x00929064, 0, 0x038, 640],
  [0x0092906b, 1, 0x2b8, 2],
  [0x00929079, 0, 0x2bc, 2092],
  [0x0092908c, 0, 0xae8, 732],
  [0x00929093, 2, 0xdc4, 1],
  [0x009290a7, 3, 0xdc8, 16],
  [0x009290b5, 3, 0xdd8, 16],
  [0x009290c3, 3, 0xde8, 16],
  [0x009290d2, 4, 0xdf8, 8],
  [0x009290e0, 5, 0xe00, 4],
  [0x009290ed, 6, 0xe04, 2],
  [0x009290fb, 7, 0xe06, 1],
  [0x00929101, 0, 0xe07, 104],
  [0x0092911b, 3, 0xe6f, 16],
  [0x00929129, 3, 0xe7f, 16],
  [0x00929138, 4, 0xe8f, 8],
  [0x00929146, 5, 0xe97, 4],
  [0x00929153, 6, 0xe9b, 2],
  [0x0092915a, 0, 0xea0, 108],
  [0x0092916e, 5, 0xf10, 4],
  [0x0092917a, 5, 0xf0c, 4],
  [0x00929188, 3, 0xf14, 16],
  [0x00929196, 3, 0xf24, 16],
  [0x009291a4, 3, 0xf34, 16],
  [0x009291b2, 3, 0xf44, 16],
  [0x009291c0, 3, 0xf54, 16],
  [0x009291c7, 8, 0xf64, 8],
  [0x009291d6, 8, 0xf6c, 8],
  [0x009291e5, 8, 0xf74, 8],
  [0x009291f4, 8, 0xf7c, 8],
  [0x00929202, 5, 0xf84, 4],
  [0x0092920e, 5, 0xf88, 4],
  [0x0092921c, 7, 0xf8c, 1],
];
const V34_CPY_GAPS = [
  [0x2ba, 2],
  [0xdc5, 3],
  [0xe9d, 3],
];

test("ABI v34 — PGDCPY pins (body, strings, guards, vectors, callers)", () => {
  assert.equal(PGD_CPY_VA, 0x00929010);
  assert.equal(PGD_CPY_RET_VA, 0x0092922e);
  assert.equal(PGD_CPY_BODY_BYTES, 0x00929230 - 0x00929010); /* ret 4 @...22e, last byte ...230 (v32 census extent ..0x929230) */
  assert.equal(PGD_CPY_INBOUND, 2);
  assert.equal(PGD_CPY_RETURN_STACK, 4);
  assert.equal(PGD_CPY_RETURNS_THIS, 1);
  assert.equal(PGD_CPY_DIRTY_OFF, 0x00); /* NOT copied, NOT cleared */
  assert.equal(PGD_CPY_HANDLE_OFF, 0x04);
  assert.equal(PGD_CPY_HANDLE_CLEAR_VA, 0x00929225);
  /* string members + the SSO-vs-heap layout inside std::string */
  assert.equal(PGD_CPY_STRING_A_OFF, 0x08);
  assert.equal(PGD_CPY_STRING_B_OFF, 0x20);
  assert.equal(PGD_CPY_STRING_SIZE_OFF, 0x10);
  assert.equal(PGD_CPY_STRING_CAP_OFF, 0x14);
  assert.equal(PGD_CPY_STRING_HEAP_THRESHOLD, 0x10);
  assert.deepEqual(PGD_CPY_SELF_GUARD_CMP_VAS, [0x00929021, 0x00929040]);
  assert.deepEqual(PGD_CPY_SELF_GUARD_JE_VAS, [0x00929023, 0x00929042]);
  assert.deepEqual(PGD_CPY_ASSIGN_CALL_VAS, [0x00929032, 0x00929051]);
  assert.equal(PGD_CPY_ASSIGN_CALLEE_VA, 0x0040ccd0);
  /* deferred count quirk: `mov ecx,0x1a` sits BEFORE rows 5..11 but
     feeds row 12 (+0xe07 bosses, 0x68 = 0x1a*4) four insns later */
  assert.equal(PGD_CPY_DEFERRED_COUNT_SITE_VA, 0x0092908e);
  assert.equal(PGD_CPY_DEFERRED_COUNT, 0x1a);
  assert.equal(PGD_CPY_DEFERRED_COUNT * 4, 104);
  /* vector member copies through 0x92cb30 */
  assert.equal(PGD_CPY_VECTOR_CALLEE_VA, 0x0092cb30);
  assert.equal(PGD_CPY_VECTOR_SITES, 4);
  assert.equal(PGD_CPY_VECTOR_STRIDE, 8);
  for (let i = 0; i < 4; ++i) {
    assert.equal(pgdCpyVectorDstOff(i), 0xf64 + i * 8);
  }
  assert.equal(pgdCpyVectorDstOff(4), -1);
  /* tail rows land exactly on the writer's pre/save-counter/file-ok */
  assert.deepEqual(
    PGD_CPY_TAIL_ROWS.map((tail) => tail.off),
    [0xf84, 0xf88, 0xf8c],
  );
  assert.deepEqual(
    PGD_CPY_TAIL_ROWS.map((tail) => tail.bytes),
    [4, 4, 1],
  );
  /* inbound sites (window-verified rel32 calls) */
  assert.deepEqual(PGD_CPY_CALL_SITE_VAS, [0x0092621a, 0x0090c258]);
});

test("ABI v34 — PGDCPY row table vs PE truth (33 rows, kinds/off/bytes)", () => {
  assert.equal(PGD_CPY_ROWS_TABLE.length, 33);
  for (let i = 0; i < 33; ++i) {
    const [site, kind, off, bytes] = V34_CPY_PE_ROWS[i];
    const got = PGD_CPY_ROWS_TABLE[i];
    assert.equal(got.site, site, `row ${i} site`);
    assert.equal(got.kind, kind, `row ${i} kind`);
    assert.equal(got.off, off, `row ${i} off`);
    assert.equal(got.bytes, bytes, `row ${i} bytes`);
  }
  /* machine-order spot checks that kill reordering mutants */
  assert.ok(PGD_CPY_ROWS_TABLE[19].off > PGD_CPY_ROWS_TABLE[20].off);
  /* bulk coverage law: r0..r25 sum to span-minus-gaps */
  assert.equal(PGD_CPY_BULK_COVERED_BYTES, 3876);
  assert.equal(0xf64 - 0x38 - 8, 3876); /* 3884 - 8 stale */
  /* stale gaps: exact offsets/sizes; each is NOT covered by any row */
  assert.deepEqual(
    PGD_CPY_STALE_GAPS.map((gap) => [gap.off, gap.bytes]),
    V34_CPY_GAPS,
  );
  for (const [off] of V34_CPY_GAPS) {
    for (let b = 0; b < 1; ++b) {
      assert.equal(pgdCpyRowCovers(off), -1, `gap ${hex4(off)} uncovered`);
    }
  }
  /* every non-gap offset in the bulk span IS covered by some row */
  let covered = new Set();
  for (const row of PGD_CPY_ROWS_TABLE.slice(0, 26)) {
    for (let o = row.off; o < row.off + row.bytes; ++o) covered.add(o);
  }
  assert.equal(covered.size, 3876);
  for (const [off, len] of V34_CPY_GAPS) {
    for (let o = off; o < off + len; ++o) {
      assert.ok(!covered.has(o), `stale byte ${hex4(o)} really stale`);
    }
  }
});

function hex4(v) {
  return "0x" + v.toString(16);
}

test("ABI v34 — PGDCPY laws (assign guard, SSO select, totals, composite)", () => {
  /* guarded assign: self-equal skips BOTH pushes and the call */
  assert.equal(pgdCpyStringAssignFires(0), 1);
  assert.equal(pgdCpyStringAssignFires(1), 0);
  /* SSO-vs-heap data select: cap >= 0x10 UNSIGNED -> heap ptr.
     Wide values drive it (a uint8_t param could not fail). */
  assert.equal(pgdCpyStringDataSelect(0x10, 0x1111, 0x2222), 0x2222);
  assert.equal(pgdCpyStringDataSelect(0xff, 0x1111, 0x2222), 0x2222);
  assert.equal(pgdCpyStringDataSelect(0xffffffff, 0x1111, 0x2222), 0x2222);
  assert.equal(pgdCpyStringDataSelect(0xf, 0x1111, 0x2222), 0x1111);
  assert.equal(pgdCpyStringDataSelect(0, 0x1111, 0x2222), 0x1111);
  assert.equal(pgdCpyStringDataSelect(0x10000000, 0x1111, 0x2222), 0x2222);
  /* plan totals: rows / bulk / stale / vectors / tail */
  assert.deepEqual(pgdCpyPlanTotals(), {
    rows: 33,
    bulk: 3876,
    stale: 8,
    vectorBytes: 32,
    tailBytes: 9,
  });
  /* cross-law: every import-restorable offset the v5/v6 laws cover
     (items blob, sec3, sec5, bosses, challenges head, sec8) is inside
     a copy-assign row — the assignor is the FULL plan. */
  assert.equal(pgdCpyRowCovers(0x38), 0); /* achievements head */
  assert.equal(pgdCpyRowCovers(0x2bc), 2); /* event counters head */
  assert.equal(pgdCpyRowCovers(0x2bb), -1); /* G0 interior */
  assert.equal(pgdCpyRowCovers(0xae8), 3); /* items first byte */
  assert.equal(pgdCpyRowCovers(0xdc4), 4); /* the plain-movsb tag byte */
  assert.equal(pgdCpyRowCovers(0xdc8), 5); /* sec3 head */
  assert.equal(pgdCpyRowCovers(0xe07), 12); /* bosses head (deferred) */
  assert.equal(pgdCpyRowCovers(0xe6f), 13); /* challenges head */
  assert.equal(pgdCpyRowCovers(0xea0), 18); /* sec8 array head */
  assert.equal(pgdCpyRowCovers(0xefb), 18); /* import-stale tail COVERED here */
  assert.equal(pgdCpyRowCovers(0xf63), 25); /* last movups byte */
  assert.equal(pgdCpyRowCovers(0xf84), 30); /* tail dword via row table */
  assert.equal(pgdCpyRowCovers(0x2ba), -1); /* gap G0 */
  assert.equal(pgdCpyRowCovers(0xdc6), -1); /* gap G1 interior */
  assert.equal(pgdCpyRowCovers(0xe9e), -1); /* gap G2 interior */
  assert.equal(pgdCpyRowCovers(0), -1); /* dirty: outside all rows */
  assert.equal(pgdCpyRowCovers(4), -1); /* handle: cleared, not copied */
});

test("ABI v34 — header/model record the v34 copy-assign evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGDCPY_VA = 0x00929010u/);
  assert.match(h, /ISAAC_PGDCPY_RET_VA = 0x0092922eu/);
  assert.match(h, /ISAAC_PGDCPY_BULK_COVERED_BYTES = 3876/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35. Chronology:/);
  assert.match(s, /isaac_pgd_cpy_string_data_select/);
  assert.match(s, /isaac_pgd_cpy_plan_totals/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_PURE_ABI_VERSION = 35;/);
  assert.match(m, /export const PGD_CPY_VA = 0x00929010;/);
  assert.match(m, /export function pgdCpyPlanTotals/);
});

test("ABI v34 — wasm differential for PGDCPY", () => {
  assert.ok(wasm, "wasm must be built before this group runs");
  const U = (v) => v >>> 0;
  assert.equal(U(wasm.isaac_pgd_pure_helpers_abi_version()), 35);
  assert.equal(U(wasm.isaac_pgd_cpy_va()), PGD_CPY_VA);
  assert.equal(U(wasm.isaac_pgd_cpy_ret_va()), PGD_CPY_RET_VA);
  assert.equal(wasm.isaac_pgd_cpy_body_bytes(), PGD_CPY_BODY_BYTES);
  assert.equal(wasm.isaac_pgd_cpy_inbound(), PGD_CPY_INBOUND);
  assert.equal(wasm.isaac_pgd_cpy_return_stack(), PGD_CPY_RETURN_STACK);
  assert.equal(wasm.isaac_pgd_cpy_returns_this(), 1);
  assert.equal(wasm.isaac_pgd_cpy_dirty_off(), 0);
  assert.equal(wasm.isaac_pgd_cpy_handle_off(), 4);
  assert.equal(U(wasm.isaac_pgd_cpy_handle_clear_va()), 0x00929225);
  assert.equal(U(wasm.isaac_pgd_cpy_string_a_off()), 0x08);
  assert.equal(U(wasm.isaac_pgd_cpy_string_b_off()), 0x20);
  assert.equal(U(wasm.isaac_pgd_cpy_assign_call_va(0)), 0x00929032);
  assert.equal(U(wasm.isaac_pgd_cpy_assign_call_va(1)), 0x00929051);
  assert.equal(U(wasm.isaac_pgd_cpy_assign_call_va(2)), 0);
  assert.equal(U(wasm.isaac_pgd_cpy_self_guard_cmp_va(1)), 0x00929040);
  assert.equal(U(wasm.isaac_pgd_cpy_self_guard_je_va(0)), 0x00929023);
  assert.equal(U(wasm.isaac_pgd_cpy_assign_callee_va()), 0x0040ccd0);
  assert.equal(wasm.isaac_pgd_cpy_string_assign_fires(0), 1);
  assert.equal(wasm.isaac_pgd_cpy_string_assign_fires(1), 0);
  assert.equal(U(wasm.isaac_pgd_cpy_string_data_select(0x10, 7, 9)), 9);
  assert.equal(U(wasm.isaac_pgd_cpy_string_data_select(0xffffffff, 7, 9)), 9);
  assert.equal(U(wasm.isaac_pgd_cpy_string_data_select(0xf, 7, 9)), 7);
  assert.equal(U(wasm.isaac_pgd_cpy_deferred_count_site_va()), 0x0092908e);
  assert.equal(wasm.isaac_pgd_cpy_deferred_count(), 0x1a);
  assert.equal(U(wasm.isaac_pgd_cpy_vector_callee_va()), 0x0092cb30);
  assert.equal(wasm.isaac_pgd_cpy_vector_sites(), 4);
  assert.equal(wasm.isaac_pgd_cpy_vector_dst_off(3), 0xf7c);
  assert.equal(U(wasm.isaac_pgd_cpy_vector_call_site_va(2)), 0x009291e5);
  assert.equal(wasm.isaac_pgd_cpy_tail_row_off(2), 0xf8c);
  assert.equal(wasm.isaac_pgd_cpy_tail_row_bytes(0), 4);
  assert.equal(wasm.isaac_pgd_cpy_stale_gap_count(), 3);
  assert.equal(wasm.isaac_pgd_cpy_stale_gap_off(1), 0xdc5);
  assert.equal(wasm.isaac_pgd_cpy_stale_gap_bytes(2), 3);
  assert.equal(wasm.isaac_pgd_cpy_row_count(), 33);
  /* full wasm-vs-PE row differential (all 33 rows, 4 fields) */
  for (let i = 0; i < 33; ++i) {
    const [site, kind, off, bytes] = V34_CPY_PE_ROWS[i];
    assert.equal(U(wasm.isaac_pgd_cpy_row_site_va(i)), site, `site ${i}`);
    assert.equal(wasm.isaac_pgd_cpy_row_kind(i), kind, `kind ${i}`);
    assert.equal(wasm.isaac_pgd_cpy_row_off(i), off, `off ${i}`);
    assert.equal(wasm.isaac_pgd_cpy_row_bytes(i), bytes, `bytes ${i}`);
  }
  assert.equal(U(wasm.isaac_pgd_cpy_row_site_va(33)), 0);
  assert.equal(wasm.isaac_pgd_cpy_row_kind(33), -1);
  assert.equal(wasm.isaac_pgd_cpy_bulk_covered_bytes(), 3876);
  /* composite plan totals into scratch */
  const base = SCRATCH_B;
  wasm.isaac_pgd_cpy_plan_totals(base, base + 4, base + 8, base + 12, base + 16);
  assert.equal(view.getInt32(base, true), 33);
  assert.equal(view.getInt32(base + 4, true), 3876);
  assert.equal(view.getInt32(base + 8, true), 8);
  assert.equal(view.getInt32(base + 12, true), 32);
  assert.equal(view.getInt32(base + 16, true), 9);
});

/* ============================================================
   ABI v35 — PGDCON (out-of-cluster consumer census). Evidence:
   section-notes/pgd-v35/ (census + provenance JSON, per-site cpu
   dumps 007fd759 / 006f9b70 / 006f99f5 / 0094d080 / 008cde50 /
   008ced90 / 008cf170 / 00958e40 / 008f0370).
   ============================================================ */

test("ABI v35 — PGDSEC3CON pins + threshold/index row table is PE-truth", () => {
  /* provenance chain */
  assert.equal(PGD_MGR_PGD_DISP, 0x14);
  assert.equal(PGD_READONLY_MGR_DISP, 0x15);
  assert.equal(PGD_DIRTY_MGR_DISP, 0x14);
  assert.equal(PGD_READONLY_MGR_DISP - PGD_DIRTY_MGR_DISP, 1); /* pgd+1 vs pgd+0 */
  assert.equal(PGD_SEC3CON_FN_VA, 0x007fb250);
  assert.equal(PGD_SEC3CON_ADD_DISP_VA - PGD_SEC3CON_MGR_LOAD_VA, 6);
  assert.equal(PGD_SEC3CON_READONLY_CMP_VA - PGD_SEC3CON_ADD_DISP_VA, 3);
  assert.equal(PGD_SEC3CON_INC_VA - PGD_SEC3CON_READONLY_JNE_VA, 2);
  assert.equal(PGD_SEC3CON_INC_FOLDED_DISP, 0xdc8); /* RAW base == SEC3 */
  assert.ok(PGD_SEC3CON_DIRTY_STORE_VA > PGD_SEC3CON_INC_VA);

  /* threshold rows: machine-order spot checks that kill reordering
     mutants; slot offsets fold to sec3 slots via -0xdc8 / 4 */
  assert.equal(PGD_SEC3CON_THRESHOLD_ROWS.length, 3);
  for (let i = 0; i < 3; ++i) {
    const row = PGD_SEC3CON_THRESHOLD_ROWS[i];
    const next = PGD_SEC3CON_THRESHOLD_ROWS[i + 1];
    assert.equal((row.slotOff - 0xdc8) / 4, row.slot, `row ${i} slot`);
    assert.ok(row.threshold > 0, `row ${i} threshold`);
    if (next) {
      assert.ok(row.cmpVa < next.cmpVa, "threshold rows ascend");
      assert.ok(row.slot < next.slot, "slots ascend");
      assert.ok(row.threshold > next.threshold, "thresholds descend 40/30/20");
    }
  }
  assert.deepEqual(
    PGD_SEC3CON_THRESHOLD_ROWS.map((r) => [r.slot, r.threshold, r.unlockId]),
    [
      [2, 0x28, 0x10],
      [4, 0x1e, 0x11],
      [6, 0x14, 0x12],
    ],
  );

  /* index rows: ascending compare VAs, distinct ids */
  assert.deepEqual(
    PGD_SEC3CON_IDX_UNLOCK_ROWS.map((r) => [r.idxValue, r.unlockId]),
    [
      [2, 0xd],
      [4, 0xe],
      [0xb, 0x9b],
    ],
  );
  assert.equal(PGD_SEC3CON_IDX_TAIL_CALL_VA - PGD_SEC3CON_IDX_TAIL_LEA_VA, 3);
});

test("ABI v35 — PGDSEC3CON laws (guard low byte, UNSIGNED jb, defect)", () => {
  /* guard is a LOW-BYTE zero test (same law as PGDRO) */
  assert.equal(pgdSec3ConIncFires(0), 1);
  assert.equal(pgdSec3ConIncFires(1), 0);
  assert.equal(pgdSec3ConIncFires(0x100), 1); /* high bits ignored */
  assert.equal(pgdSec3ConIncFires(0xff01), 0);

  /* threshold fires on POST-increment values; jb is UNSIGNED below so a
     high-bit pre-value wraps past the threshold and does NOT fire */
  const post = (v, inc) => pgdSec3ConThresholdUnlocks({ 2: v, 4: 0, 6: 0 }, inc);
  assert.deepEqual(post(0x27, true), [0x10]); /* 0x27+1 >= 0x28 */
  assert.deepEqual(post(0x27, false), []); /* read-before-inc: below */
  assert.deepEqual(post(0x28, false), [0x10]);
  assert.deepEqual(post(0xffffffff, true), []); /* wraps to 0 */
  assert.deepEqual(post(0xffffffff, false), [0x10]); /* huge unsigned */

  /* DEFECT PINNED: index unlocks are NOT gated by readonly */
  assert.equal(pgdSec3ConIdxGatedByReadonly(), 0);
  assert.equal(pgdSec3ConIdxUnlockId(2), 0xd);
  assert.equal(pgdSec3ConIdxUnlockId(4), 0xe);
  assert.equal(pgdSec3ConIdxUnlockId(0xb), 0x9b);
  assert.equal(pgdSec3ConIdxUnlockId(-5), 0);
  assert.equal(pgdSec3ConIdxUnlockId(12), 0);
  /* composite: readonly run still fires the idx unlock */
  const readonly = 1;
  assert.deepEqual(
    pgdSec3ConThresholdUnlocks({ 2: 0x27, 4: 0, 6: 0 }, pgdSec3ConIncFires(readonly) === 1),
    [],
  );
  assert.notEqual(pgdSec3ConIdxUnlockId(2), 0); /* ...but this still unlocks */
});

test("ABI v35 — PGDSEC8INC pins + bound/aggregate/warn laws", () => {
  assert.equal(PGD_SEC8INC_FN_VA, 0x00958e60);
  assert.equal(PGD_SEC8INC_BOUND_MAX, 0x1a);
  assert.equal(PGD_SEC8INC_BOUND_MAX, 0x1b - 1); /* == PGD_COUNT_SEC8 - 1 */
  assert.equal(PGD_SEC8INC_FOLDED_DISP - PGD_MGR_PGD_DISP, 0xea0); /* sec8 base */
  assert.equal(PGD_SEC8INC_AGG_FOLDED_DISP - PGD_MGR_PGD_DISP,
    0xea0 + PGD_SEC8INC_AGG_SLOT * 4); /* sec8[2] */
  assert.equal(PGD_SEC8INC_RETURN_STACK, 0xc); /* cdecl ret 0xc */
  assert.ok(PGD_SEC8INC_WARN_STRING_VA !== PGD_SEC10COL_SITES[0].logCallVa);

  /* exactly three E8 call sites, and one re-checks the bound first */
  assert.equal(PGD_SEC8INC_CALL_SITES, 3);
  assert.deepEqual([...PGD_SEC8INC_CALL_SITE_VAS], [0x68fcca, 0x6f9a19, 0x8cedbd]);

  /* outcome triple over the full u32 domain edges */
  assert.deepEqual(pgdSec8IncOutcome(0), { incSelf: 1, incAgg: 1, warn: 0 });
  assert.deepEqual(pgdSec8IncOutcome(1), { incSelf: 1, incAgg: 0, warn: 0 });
  assert.deepEqual(pgdSec8IncOutcome(2), { incSelf: 1, incAgg: 1, warn: 0 });
  assert.deepEqual(pgdSec8IncOutcome(0x1a), { incSelf: 1, incAgg: 1, warn: 0 });
  assert.deepEqual(pgdSec8IncOutcome(0x1b), { incSelf: 0, incAgg: 0, warn: 1 });
  assert.deepEqual(pgdSec8IncOutcome(0xffffffff), { incSelf: 0, incAgg: 0, warn: 1 });
  assert.deepEqual(pgdSec8IncOutcome(-1), { incSelf: 0, incAgg: 0, warn: 1 }); /* unsigned cmp */

  /* gates: SIGNED > 0 (jle skip) — negative counters do not fire */
  assert.equal(pgdSec8GateFires(0), 0);
  assert.equal(pgdSec8GateFires(1), 1);
  assert.equal(pgdSec8GateFires(-1), 0);
  assert.equal(pgdSec8GateFires(0x80000000 | 0), 0);
  assert.equal(pgdSec8GateFires(0x7fffffff), 1);
  assert.equal(PGD_SEC8GATE_SITES.length, 2);
  assert.equal(PGD_SEC8GATE_SITES[0].mutatorCallVa, 0x008cedbd);
});

test("ABI v35 — PGDSEC10COL agrees with the v2 PGDX sec10 oracles", () => {
  assert.equal(PGD_SEC10COL_SITES.length, 2);
  assert.equal(PGD_SEC10COL_INDEX_PROVIDER_VA, 0x009e9db0);
  /* both sites share one shape: store -> clear0 -> dirty -> log -> save */
  for (const site of PGD_SEC10COL_SITES) {
    assert.ok(site.storeVa < site.slot0ClearVa, "store precedes slot-0 clear");
    assert.ok(site.slot0ClearVa < site.dirtyVa, "clear precedes dirty");
    assert.ok(site.dirtyVa < site.logCallVa, "dirty precedes log");
    assert.ok(site.saveLocalCallVa > site.logCallVa, "save runs after log");
  }
  /* the clear-only site has neither log nor save fields */
  assert.equal(PGD_SEC10CLEAR_SITE.clearVa < PGD_SEC10CLEAR_SITE.dirtyVa, true);
  assert.equal(PGD_SEC10CLEAR_SITE.logCallVa, undefined);

  /* LAW AGREEMENT with the v2-era PGDX oracles across the window */
  for (const ro of [0, 1, 0xff, 0x100]) {
    for (let idx = -1; idx <= 0x51; ++idx) {
      assert.equal(pgdSec10ColStoreIndex(ro, idx), pgdSec10StoreSlot(ro, idx),
        `store ${ro}/${idx}`);
      assert.equal(pgdSec10ColDirtyFires(ro), (ro & 0xff) === 0 ? 1 : 0);
    }
  }
  assert.equal(pgdSec10ColClearsSlot0(), pgdSec10ResetsSlot0());
  assert.ok(PGD_SEC10CLEAR_SITE.clearVa < PGD_SEC10CLEAR_SITE.dirtyVa);
  assert.equal(pgdSec10ColSaveLocalAlwaysRuns(), 1);
  /* census negatives recorded */
  assert.equal(PGD_SEC5_OUT_OF_CLUSTER_CONSUMERS, 0);
  assert.equal(PGD_SEC9_OUT_OF_CLUSTER_CONSUMERS, 0);
  /* no field promoted to NAMED without an exact-ZHL accessor */
  for (const off of [PGD_OFF_SEC3_DWORDS, PGD_OFF_SEC5_BYTES, PGD_OFF_SEC8_DWORDS,
    PGD_OFF_SEC9_DWORDS, PGD_OFF_SEC10_BYTES]) {
    assert.equal(pgdConFieldStatusUnchanged(off), 1);
  }
});

/* Independent inline transcriptions for the differential (NOT the model's
   expressions): thresholds as explicit if-ladder, sec8 as arithmetic. */
function conThresholdLadder(v2, v4, v6, inc) {
  const out = [];
  let a = v2 >>> 0;
  let b = v4 >>> 0;
  let c = v6 >>> 0;
  if (inc) { a = (a + 1) >>> 0; b = (b + 1) >>> 0; c = (c + 1) >>> 0; }
  if (!((a >>> 0) < 0x28)) out.push(0x10);
  if (!((b >>> 0) < 0x1e)) out.push(0x11);
  if (!((c >>> 0) < 0x14)) out.push(0x12);
  return out;
}
function conSec8Ladder(id) {
  const u = id >>> 0;
  return {
    warn: u > 0x1a ? 1 : 0,
    incSelf: u <= 0x1a ? 1 : 0,
    incAgg: u <= 0x1a && u !== 1 ? 1 : 0,
  };
}

test("Wasm matches JS: v35 randomized high-bit differential (LCG)", () => {
  let seed = 0x853c49e7;
  const lcg = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const rnd = (n) => lcg() % n;
  for (let i = 0; i < 300; ++i) {
    /* threshold differential: band around each threshold plus high bits */
    const pick = (thr) =>
      rnd(4) === 0 ? lcg() : thr - 2 + rnd(5);
    const v2 = pick(0x28);
    const v4 = pick(0x1e);
    const v6 = pick(0x14);
    const inc = rnd(2) === 1 ? 1 : 0;
    const got = pgdSec3ConThresholdUnlocks({ 2: v2, 4: v4, 6: v6 }, inc);
    assert.deepEqual(got, conThresholdLadder(v2, v4, v6, inc), `thr ${v2}/${v4}/${v6}/${inc}`);

    /* sec8 differential: id band + high-bit variants */
    const id = rnd(3) === 0 ? lcg() : rnd(0x40) - 8;
    assert.deepEqual(pgdSec8IncOutcome(id), conSec8Ladder(id), `sec8 ${id}`);
    assert.equal(pgdSec8IncInBound(id), conSec8Ladder(id).incSelf);

    /* gate differential: sign-band values */
    const cv = rnd(4) === 0 ? lcg() : rnd(8) - 4;
    const cvSigned = cv >= 0x80000000 ? (cv - 0x100000000) : cv;
    assert.equal(pgdSec8GateFires(cvSigned), cvSigned > 0 ? 1 : 0, `gate ${cvSigned}`);
  }
});

test("ABI v35 — wasm differential for PGDCON", () => {
  assert.ok(wasm, "wasm must be built before this group runs");
  const U = (v) => v >>> 0;
  assert.equal(U(wasm.isaac_pgd_pure_helpers_abi_version()), 35);
  assert.equal(U(wasm.isaac_pgd_con_mgr_pgd_disp()), 0x14);
  assert.equal(U(wasm.isaac_pgd_sec3con_threshold_row_count()), 3);
  assert.deepEqual([0, 1, 2].map((r) => U(wasm.isaac_pgd_sec3con_threshold_row_slot(r))), [2, 4, 6]);
  assert.deepEqual([0, 1, 2].map((r) => U(wasm.isaac_pgd_sec3con_threshold_row_threshold(r))),
    [0x28, 0x1e, 0x14]);
  assert.deepEqual([0, 1, 2].map((r) => U(wasm.isaac_pgd_sec3con_threshold_row_unlock_id(r))),
    [0x10, 0x11, 0x12]);
  for (const [row, v, inc] of [[0, 0x27, 1], [0, 0x27, 0], [1, 0x1d, 1], [2, 0x13, 1], [2, 0x14, 0]]) {
    assert.equal(U(wasm.isaac_pgd_sec3con_threshold_row_fires(row, v, inc)),
      pgdSec3ConThresholdUnlocks({ 2: row === 0 ? v : 0, 4: row === 1 ? v : 0, 6: row === 2 ? v : 0 }, inc).length > 0 ? 1 : 0,
      `fires ${row}/${v}/${inc}`);
  }
  assert.equal(U(wasm.isaac_pgd_sec3con_idx_unlock_rows()), 3);
  assert.deepEqual([-1, 0, 2, 4, 5, 0xb, 12].map((i) => U(wasm.isaac_pgd_sec3con_idx_unlock_id(i))),
    [0, 0, 0xd, 0xe, 0, 0x9b, 0]);
  assert.equal(U(wasm.isaac_pgd_sec3con_idx_gated_by_readonly()), 0);

  assert.equal(U(wasm.isaac_pgd_sec8inc_bound_max()), 0x1a);
  assert.equal(U(wasm.isaac_pgd_sec8inc_call_site_count()), 3);
  assert.deepEqual([0, 1, 2].map((i) => U(wasm.isaac_pgd_sec8inc_call_site_va(i))),
    [0x68fcca, 0x6f9a19, 0x8cedbd]);
  for (const id of [0, 1, 2, 0x1a, 0x1b, 0xffff0000, 0xffffffff]) {
    const want = pgdSec8IncOutcome(id);
    assert.equal(U(wasm.isaac_pgd_sec8inc_inc_self(id)), want.incSelf, `self ${id}`);
    assert.equal(U(wasm.isaac_pgd_sec8inc_inc_agg(id)), want.incAgg, `agg ${id}`);
    assert.equal(U(wasm.isaac_pgd_sec8inc_warn_fires(id)), want.warn, `warn ${id}`);
    assert.equal(U(wasm.isaac_pgd_sec8inc_in_bound(id)), pgdSec8IncInBound(id), `bound ${id}`);
  }
  for (const cv of [-1, 0, 1, 2, -2147483648, 2147483647]) {
    assert.equal(wasm.isaac_pgd_sec8gate_fires(cv), pgdSec8GateFires(cv), `gate ${cv}`);
  }

  assert.equal(U(wasm.isaac_pgd_sec10col_site_count()), 2);
  for (const ro of [0, 1, 0xff, 0x100, 0xffffffff]) {
    for (const idx of [-1, 0, 7, 0x4f, 0x50]) {
      assert.equal(wasm.isaac_pgd_sec10col_store_index(ro, idx),
        pgdSec10ColStoreIndex(ro, idx), `col ${ro}/${idx}`);
    }
    assert.equal(U(wasm.isaac_pgd_sec10col_dirty_fires(ro)), pgdSec10ColDirtyFires(ro));
  }
  assert.equal(U(wasm.isaac_pgd_sec10col_clears_slot0()), 1);
  assert.equal(U(wasm.isaac_pgd_sec10col_save_local_always_runs()), 1);
});

test("ABI v35 — header/model record the v35 consumer-census evidence", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /save-state pure helpers — ABI v35/);
  assert.match(h, /ISAAC_PGD_PURE_HELPERS_ABI_VERSION = 35/);
  assert.match(h, /ISAAC_PGD_SEC8INC_FN_VA = 0x00958e60u/);
  assert.match(h, /ISAAC_PGD_SEC3CON_READONLY_JNE_TARGET_VA = 0x007fd7abu/);
  assert.match(h, /ISAAC_PGD_SEC8INC_BOUND_MAX = 0x1a/);
  const s = readFileSync(source, "utf8");
  assert.match(s, /ABI v35\. Chronology:/);
  assert.match(s, /isaac_pgd_sec3con_threshold_row_fires/);
  assert.match(s, /isaac_pgd_sec10col_save_local_always_runs/);
  const m = readFileSync(join(root, "scripts", "decomp", "pgd-pure-model.mjs"), "utf8");
  assert.match(m, /PGD_PURE_ABI_VERSION = 35;/);
  assert.match(m, /export const PGD_SEC8INC_FN_VA = 0x00958e60;/);
  assert.match(m, /export function pgdSec3ConThresholdUnlocks/);
});
