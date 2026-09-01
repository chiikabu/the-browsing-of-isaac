import test from "node:test";



import assert from "node:assert/strict";



import { spawnSync } from "node:child_process";



import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";



import { homedir } from "node:os";



import { dirname, join } from "node:path";



import { fileURLToPath } from "node:url";



import {



  PROCESS_INPUT_PURE_ABI_VERSION,



  INPUT_MASK_BIT0,



  INPUT_MASK_BIT1,



  INPUT_MASK_BIT2,



  INPUT_MASK_BIT3,



  INPUT_MASK_BIT4,



  INPUT_MASK_BIT5,



  INPUT_MASK_BIT6,



  INPUT_MASK_B_ID_46_FORCE,



  INPUT_MASK_A_GATE39_MODE_EXCLUDE,



  MANAGER_EARLY_CONTINUE,



  MANAGER_EARLY_RETURN_SILENT,



  MANAGER_EARLY_RETURN_INC,



  MANAGER_FLOAT_APPROACH_STEP_BITS,



  inputMapNodePresent,



  peSignedMod2Eq1,















  inputMaskCombine,

  INPUT_MASK_6F9400_HOST_VA,
  INPUT_MASK_6F95A0_HOST_VA,



  inputDeviceRangeContains,



  inputGetDeviceTypeRanges,



  managerGate6f9730,



  managerUpdateEarlySkip,



  managerEarlyCounterNext,



  managerFloatApproach,



  managerPollPrefixNeeded,



  managerPollPlatformUsesA69f60,



  managerPollA6de60BodyNeeded,



  managerPollA6de60VectorCount,



  managerPollA6de60LoopNeeded,



  A6DE60_EDGE_NONE,



  A6DE60_EDGE_PRESS,



  A6DE60_EDGE_RELEASE,



  A6DE60_EDGE_SILENT,



  A6DE60_DIERR_INPUTLOST,



  A6DE60_DIERR_NOTACQUIRED,



  A6DE60_AXIS_DISPATCH_DEFAULT,



  A6DE60_AXIS_DISPATCH_OOR,



  managerPollA6de60DeviceEnabled,



  managerPollA6de60QueryOk,



  managerPollA6de60ButtonBit,



  managerPollA6de60ButtonSlotShift,



  managerPollA6de60ButtonEdge,



  managerPollA6de60AxisNormalizeI16,



  managerPollA6de60AxisNormalizeU8,



  managerPollA6de60FloatChanged,



  managerPollA6de60FloatCallbackNeeded,



  managerPollA6de60DierrReacquire,



  managerPollA6de60IndexContinue,



  managerPollA6de60AxisTypeDispatch,



  managerPollA6de60DeviceContinue,



  A6DE60_DIDOD_STRIDE,



  A6DE60_POV_CENTER_LO16,



  A6DE60_POV_EAST,



  A6DE60_POV_SOUTH,



  A6DE60_POV_WEST,



  managerPollA6de60QueryUsesHook,



  managerPollA6de60QpcFreqInitNeeded,



  managerPollA6de60U64ToF64,



  managerPollA6de60QpcSecondsF64,



  managerPollA6de60ComSucceeded,



  managerPollA6de60BufferedMode,



  managerPollA6de60DidodAllocSize,



  managerPollA6de60TimestampToSecondsF64,



  managerPollA6de60NonzeroBit,



  managerPollA6de60PovAxis0,



  managerPollA6de60PovAxis1,



  A6DE60_HOOK_COMPACT_DWORDS,



  A648B0_MODE_ALLOC,



  A648B0_MODE_FREE,



  A648B0_MODE_ACCOUNT,



  A648B0_MODE_NOP,



  managerPollA6de60HookRepackDw0,



  managerPollA6de60HookRepackDw1,



  managerPollA6de60HookRepackDw2,



  managerPollA6de60HookRepack,



  managerPollA6de60DidodOfsMatch,



  managerPollA6de60AxisMapIsPov,



  managerPollA6de60QueryFailClearValue,



  managerPollA6da10IndexAfterRemove,



  managerPollA6da10DisconnectCbNeeded,



  managerPollA6da10FreeComMaps,



  managerPollA6da10RemoveMoveBytes,



  managerPollA6da10EndAfterRemove,



  managerPollA648b0Mode,



  managerPollA648b0AllocMallocSize,



  managerPollA648b0TrackerSubSize,



  managerPollA648b0TrackerAdd,



  A1FC00_QUEUE_STRIDE,



  A1FC00_FREE_HEADER_THRESHOLD,



  A1FC00_FREE_HEADER_ADD,



  A1FC00_FREE_HEADER_OFFSET_MAX,



  A1FC00_SLOT_FULL,



  A1F280_DIR_NEG_X,



  A1F280_DIR_POS_X,



  A1F280_DIR_NEG_Y,



  A1F280_DIR_POS_Y,



  A1F280_ACTION_MODE_IDLE,



  A1F280_RUMBLE_SUPPRESS_FLAG,



  managerPollA1fc00LockObjPresent,



  managerPollA1fc00QueueLoopNeeded,



  managerPollA1fc00QueueCount,



  managerPollA1fc00EntryAlreadyActive,



  managerPollA1fc00EntryMarkActive,



  managerPollA1fc00SlotTableUsable,



  managerPollA1fc00SlotIsFree,



  managerPollA1fc00SlotIndexContinue,



  managerPollA1fc00SlotFindFree,



  managerPollA1fc00QueueEndAfterErase,



  managerPollA1fc00IterAdvance,



  managerPollA1fc00IterContinue,



  managerPollA1fc00PendingNeedsGrow,



  managerPollA1fc00PendingEndAfterPush,



  managerPollA1fc00PendingCapacityBytes,



  managerPollA1fc00FreeUsesHeapHeader,



  managerPollA1fc00FreeHeaderSize,



  managerPollA1fc00FreeHeaderOffsetOk,



  managerPollA1fc00NotifyCbNeeded,



  managerPollA1f280BufferBytes,



  managerPollA1f280AxisDir,



  managerPollA1f280AxisPairBits,



  managerPollA1f280BufferCount,



  managerPollA1eed0DeadzoneRemap,



  managerPollA1f280AxisNegPart,



  managerPollA1f280AxisPosPart,



  managerPollA1f280ActionModeIdle,



  managerPollA1f280ActionIdValid,



  managerPollA1f280BufferIndexInRange,



  managerPollA1f280BufferSlotOffset,



  managerPollA1f280RumblePathNeeded,



  managerPollA1f280TimerPositive,



  managerPollA1f280TimerClampNonneg,



  A68490_NS_SCALE,



  A1F280_TICK_DELTA_TO_SEC_BITS,



  A1F280_TICK_SCALE_MUL_LO,



  A1F280_TICK_SCALE_MUL_HI,



  A1F280_TICK_SCALE_SHIFT,



  managerPollA68490NsF64,



  managerPollA1f280ScaleTick,



  managerPollA1f280ScaleTickLo,



  managerPollA1f280ScaleTickHi,



  managerPollA1f280TickDelta,



  managerPollA1f280TickDeltaLo,



  managerPollA1f280TickDeltaHi,



  managerPollA1f280TickDeltaNonzero,



  managerPollA1f280TickDeltaSecondsF32,



  managerPollA1f280TimerSubDelta,



  managerPollA1f280RumbleIntensityActive,



  A1F280_OFF_TIMER,



  A1F280_OFF_INTENSITY,



  A1F280_OFF_BASELINE_LO,



  A1F280_OFF_BASELINE_HI,



  A1F280_VTBL_RUMBLE,



  A1F280_SUCCESS_AL,



  managerPollA1f280RumbleVcallTimer,



  managerPollA1f280RumbleVcallIntensity,



  managerPollA1f280RumbleVcallArgs,



  managerPollA1f280RumbleTimerAfterGate,



  managerPollA1f280RumbleNegTimerPath,



  managerPollA1f280BaselineStore,



  managerPollA1f280SuccessReturn,



  managerPollA1f280RumbleVtblSlot,



  A112C0_LEVEL_INFO,



  A112C0_LEVEL_NET,



  A112C0_LEVEL_WARN,



  A112C0_LEVEL_ERROR,



  A112C0_LEVEL_ASSERT,



  A112C0_STATE_IDLE,



  A112C0_STATE_INIT,



  A112C0_STATE_READY,



  A112C0_BUF_CAP,



  A112C0_PREFIX_VA_INFO,



  A112C0_PREFIX_VA_NET,



  A112C0_PREFIX_VA_WARN,



  A112C0_PREFIX_VA_ERROR,



  A112C0_PREFIX_VA_ASSERT,



  A112C0_PREFIX_VA_EMPTY,



  A112C0_FMT_VA,



  A112C0_MSG_VA_INVALID_MUTEX,



  A112C0_MSG_VA_ACTION_ID_OOR,



  A112C0_HOST_VA,



  a112c0ReenterSkip,



  a112c0SinkActive,



  a112c0BodyNeeded,



  a112c0InitNeeded,



  a112c0StateAfterInit,



  a112c0PrefixEnabled,



  a112c0PrefixVa,



  a112c0OdsNeeded,



  a112c0SinkWriteNeeded,



  a112c0BufRemaining,



  a112c0TrailNewline,



  a112c0HostVa,



  a112c0FmtVa,



  a112c0BufCap,



  a112c0LevelAssert,



  a112c0MsgVaInvalidMutex,



  a112c0MsgVaActionIdOor,



  managerPollA1f280ActionIdOorLogNeeded,



  A1F280_OFF_ACTION_INDEX,



  A1F280_OFF_ACTION_MODE,



  A1F280_VTBL_ACTION_QUERY,



  A1F280_ACTION_QUERY_ARG,



  A1F280_ACTION_QUERY_CALL_VA,



  A1F280_ACTION_INDEX_CLEARED,



  A1F280_ACTION_MODE_AFTER_PUSH,



  managerPollA1f280ActionQueryVcallNeeded,



  managerPollA1f280ActionQueryVcallArg,



  managerPollA1f280ActionQueryVtblSlot,



  managerPollA1f280ActionQueryCallVa,



  managerPollA1f280ActionIndexAfterPush,



  managerPollA1f280ActionModeAfterPush,



  A1F280_VTBL_FILL,



  A1F280_VTBL_AXIS_FILL,



  A1F280_FILL_PAIR0_CALL_VA,



  A1F280_FILL_PAIR1_CALL_VA,



  A1F280_FILL_PAIR0_ARG,



  A1F280_FILL_PAIR1_ARG,



  A1F280_OFF_AXIS_PAIR0,



  A1F280_OFF_AXIS_PAIR1,



  A1F280_DIR_BIT_BASE_PAIR0,



  A1F280_DIR_BIT_BASE_PAIR1,



  managerPollA1f280FillVcallOk,



  managerPollA1f280FillPair1Arg,



  managerPollA1f280FillPair0Arg,



  managerPollA1f280FillVtblSlot,



  managerPollA1f280FillCallVa,



  managerPollA1f280FillPair0CallVa,



  managerPollA1f280AxisFillVtblSlot,



  managerPollA1f280FillAxisStoreBasePair1,



  managerPollA1f280FillDirBitBasePair1,



  A1F280_AXIS_FILL_PAIR0_CALL_VA,



  A1F280_AXIS_FILL_PAIR1_CALL_VA,



  A1EED0_AXIS_FILL_CALL_VA,



  A1F280_AXIS_FILL_OUT_FLOAT_COUNT,



  A1F280_AXIS_FILL_OUT_X_OFS,



  A1F280_AXIS_FILL_OUT_Y_OFS,



  A1F280_OFF_DIR_BITS,



  A1F280_OFF_DIR_THRESH,



  A1F280_OFF_REMAP_THRESH,



  managerPollA1f280AxisFillCallVa,



  managerPollA1f280AxisFillPair0CallVa,



  managerPollA1eed0AxisFillCallVa,



  managerPollA1f280AxisFillOutFloatCount,



  managerPollA1f280AxisFillOutXOfs,



  managerPollA1f280AxisFillOutYOfs,



  managerPollA1f280DirThreshOfs,



  managerPollA1f280RemapThreshOfs,



  managerPollA1f280DirBitsOfs,



  managerPollA1f280FillAxisStoreBasePair0,



  managerPollA1f280FillDirBitBasePair0,



  managerPollA1f280DirBitsMerge,



  A1F280_VTBL_READY,



  A1F280_READY_CALL_VA,



  managerPollA1f280ReadyVcallOk,



  managerPollA1f280ReadyEarlyReturn,



  managerPollA1f280ReadyVtblSlot,



  managerPollA1f280ReadyCallVa,



  A648B0_HEADER_BYTES,



  A648B0_TRACKER_CTX_VA,



  A648B0_TRACKER_CTX_OFS,



  A648B0_TRACKER_FALLBACK_VA,



  A648B0_MALLOC_IAT_VA,



  A648B0_FREE_IAT_VA,



  A648B0_OOM_HOST_VA,



  A648B0_OOM_CODE,



  managerPollA648b0TrackerBase,



  managerPollA648b0AccountTarget,



  managerPollA648b0AllocClampNeeded,



  managerPollA648b0AllocSizeClampedLo,



  managerPollA648b0AllocMallocSizeHi,



  managerPollA648b0AllocOk,



  managerPollA648b0AllocHeaderValue,



  managerPollA648b0AllocPayloadPtr,



  managerPollA648b0AllocReturn,



  managerPollA648b0FreeNeeded,



  managerPollA648b0FreeBlockPtr,



  managerPollA648b0HeaderBytes,



  managerPollA648b0OomCode,



  managerPollA648b0OomHostVa,



  managerPollA648b0MallocIatVa,



  managerPollA648b0FreeIatVa,



  A6DA10_SLOT_STRIDE,



  A6DA10_COM_RELEASE_VTBL,



  A6DA10_OFF_DEV_STATE,



  A6DA10_OFF_DEV_NAME,



  A6DA10_OFF_DEV_BUF_A,



  A6DA10_OFF_DEV_BUF_B,



  A6DA10_OFF_STATE_COM,



  A6DA10_OFF_STATE_MAP_A,



  A6DA10_OFF_STATE_MAP_B,



  A6DA10_DISCONNECT_CB_VA,



  A6DA10_DISCONNECT_USER_VA,



  A6DA10_STEP_COM_RELEASE,



  A6DA10_STEP_FREE_STATE_MAP_A,



  A6DA10_STEP_FREE_STATE_MAP_B,



  A6DA10_STEP_FREE_DEV_NAME,



  A6DA10_STEP_FREE_STATE,



  A6DA10_STEP_FREE_DEV_BUF_A,



  A6DA10_STEP_FREE_DEV_BUF_B,



  A6DA10_STEP_FREE_DEV,



  A6DA10_TEARDOWN_STEPS_FULL,



  A6DA10_TEARDOWN_STEPS_TAIL,



  managerPollA6da10SlotByteOffset,



  managerPollA6da10SlotAddr,



  managerPollA6da10MemmoveDst,



  managerPollA6da10MemmoveSrc,



  managerPollA6da10TeardownStepCount,



  managerPollA6da10TeardownPlan,



  managerPollA6da10ComReleaseVtblSlot,



  A6DD30_OFF_AXIS_BASE,



  A6DD30_CB_VA,



  A6DD30_CB_USER_VA,



  A6DD30_CB_FRAME_BYTES,



  A6DD30_CB_ARG_DEVICE,



  A6DD30_CB_ARG_INDEX,



  A6DD30_CB_ARG_NEW,



  A6DD30_CB_ARG_OLD,



  A6DD30_CB_ARG_TIME,



  A6DD30_CB_ARG_USER,



  A6DD30_CB_ARG_COUNT,



  managerPollA6dd30AxisBaseOfs,



  managerPollA6dd30AxisSlotOffset,



  managerPollA6dd30AxisSlotOffsetY,



  managerPollA6dd30IndexAfterX,



  managerPollA6dd30CbNeeded,



  managerPollA6dd30CbFrameBytes,



  managerPollA6dd30CbArgOfs,



  A6DAB0_SLOT_COUNT,



  A6DAB0_SLOT_TABLE_VA,



  A6DAB0_NAME_TABLE_VA,



  A6DAB0_ENABLE_VA,



  A6DAB0_CAPS_MODE_MATCH,



  A6DAB0_CAPS_OFS_VID,



  A6DAB0_CAPS_OFS_PID,



  A6DAB0_ENUM_VTBL,



  A6DAB0_ENUM_DEVCLASS,



  A6DAB0_ENUM_CALLBACK_VA,



  A6DAB0_RECORD_BYTES,



  A6DAB0_STATE_BYTES,



  A6DAB0_AXIS_COUNT,



  A6DAB0_BUTTON_COUNT,



  A6DAB0_AXIS_ELEM_BYTES,



  A6DAB0_BUTTON_ELEM_BYTES,



  A6DAB0_REC_ID,



  A6DAB0_REC_NAME,



  A6DAB0_REC_ENABLED,



  A6DAB0_REC_VID,



  A6DAB0_REC_PID,



  A6DAB0_REC_AXIS_COUNT,



  A6DAB0_REC_BUTTON_COUNT,



  A6DAB0_REC_AXIS_ARRAY,



  A6DAB0_REC_BUTTON_ARRAY,



  A6DAB0_REC_STATE,



  A6DAB0_REC_FIELD_COUNT,



  A6DAB0_ST_ENABLE,



  A6DAB0_ST_SLOT,



  A6DAB0_ST_FIELD_COUNT,



  A6DAB0_STATE_ENABLE_VALUE,



  A6DAB0_SEARCH_NOT_FOUND,



  A6DAB0_MSG_VA_ENUM_FAIL,



  A6DAB0_MSG_VA_CONNECT,



  A6DAB0_MSG_VA_CAPS_FAIL,



  managerPollA6dab0ScanEnabled,



  managerPollA6dab0PumpNeeded,



  managerPollA6dab0EnumNeeded,



  managerPollA6dab0EnumFlagAfter,



  managerPollA6dab0SlotScanNeeded,



  managerPollA6dab0SlotContinue,



  managerPollA6dab0SlotTableAddr,



  managerPollA6dab0NameTableAddr,



  managerPollA6dab0SlotClearValue,



  managerPollA6dab0QueryOk,



  managerPollA6dab0RecordPresent,



  managerPollA6dab0ConnectNeeded,



  managerPollA6dab0DisconnectNeeded,



  managerPollA6dab0CapsModeOk,



  managerPollA6dab0CapsCallNeeded,



  managerPollA6dab0CapsOk,



  managerPollA6dab0IdWord,



  managerPollA6dab0NextDeviceId,



  managerPollA6dab0StateEnableValue,



  managerPollA6dab0RecordFieldOfs,



  managerPollA6dab0StateFieldOfs,



  managerPollA6dab0AxisCallocArgs,



  managerPollA6dab0ButtonCallocArgs,



  managerPollA6dab0PushNeedsGrow,



  managerPollA6dab0EndAfterPush,



  managerPollA6dab0ConnectCbNeeded,



  managerPollA6dab0SearchLoopNeeded,



  managerPollA6dab0SearchIndexContinue,



  managerPollA6dab0VectorFind,



  managerPollA6dab0SlotCount,



  managerPollA6dab0EnumVtblSlot,



  managerPollA6dab0EnumCallbackVa,



  managerPollA6dab0MsgVaEnumFail,



  managerPollA6dab0MsgVaConnect,



  managerPollA6dab0MsgVaCapsFail,



  A220C0_OBJ_VA,



  A220C0_FLAGS_VA,



  A220C0_RUN_BIT,



  A220C0_SLEEP_MS,



  A220C0_THREAD_PROC_VA,



  A220C0_SPAWN_VTBL,



  A220C0_SPAWN_PRIORITY,



  A220C0_SPAWN_STACK,



  managerPollA220c0ThreadRun,



  managerPollA220c0ThreadContinue,



  managerPollA220c0SpawnNeeded,



  managerPollA220c0FlagAfterStart,



  managerPollA220c0FlagAfterStop,



  managerPollA220c0ScanIterations,



  managerPollA220c0SleepMs,



  managerPollA220c0ThreadProcVa,



  managerPollA220c0SpawnVtblSlot,



  A6CF80_PROBE_COUNT,



  A6CF80_PROBE_NOT_FOUND,



  A6CF80_MODE_NONE,



  A6CF80_MODE_LEGACY,



  A6CF80_MODE_MODERN,



  A6CF80_HOOK_ORD_PRIMARY,



  A6CF80_HOOK_GET_STATE,



  A6CF80_HOOK_SET_STATE,



  A6CF80_HOOK_GET_CAPS,



  A6CF80_HOOK_CAPS_EX,



  A6CF80_HOOK_SLOT_COUNT,



  A6CF80_PROC_ORD_PRIMARY,



  A6CF80_PROC_ORD_CAPS_EX,



  A6CF80_COINIT_CHANGED_MODE,



  A6CF80_COINIT_FLAGS_FIRST,



  A6CF80_COINIT_FLAGS_RETRY,



  A6CF80_NOTIFY_FILTER_BYTES,



  A6CF80_NOTIFY_FILTER_CBSIZE,



  A6CF80_WNDCLASS_NAME_VA,



  A6CF80_WNDPROC_VA,



  A6CF80_HWND_MESSAGE,



  managerPollA6cf80InitSkip,



  managerPollA6cf80ProbeNameVa,



  managerPollA6cf80ModeForProbe,



  managerPollA6cf80SelectProbe,



  managerPollA6cf80ModeAfterProbes,



  managerPollA6cf80LogLevelForMode,



  managerPollA6cf80LogMsgVaForMode,



  managerPollA6cf80ScanFlagAfter,



  managerPollA6cf80CapsHookProbeNeeded,



  managerPollA6cf80HookSlotTargetVa,



  managerPollA6cf80HookSlotNameVa,



  managerPollA6cf80HookSlotOrdinal,



  managerPollA6cf80CoinitRetryNeeded,



  managerPollA6cf80EnableAfterInit,



  managerPollA6cf80EnumFlagAfterInit,



  managerPollA6cf80ProbeCount,



  managerPollA6cf80CoinitFlagsFirst,



  managerPollA6cf80CoinitFlagsRetry,



  managerPollA6cf80NotifyFilterBytes,



  managerPollA6cf80NotifyFilterCbsize,



  MANAGER_SHELL_OFF_STATE,



  MANAGER_SHELL_OFF_SUB_9C34F0,



  MANAGER_SHELL_OFF_APPROACH,



  MANAGER_SHELL_OFF_SUB_90B150,



  MANAGER_SHELL_OFF_PROBE_A,



  MANAGER_SHELL_OFF_PROBE_B,



  MANAGER_SHELL_RECV_SELF,



  MANAGER_SHELL_RECV_9C34F0,



  MANAGER_SHELL_RECV_APPROACH,



  MANAGER_SHELL_RECV_90B150,



  MANAGER_SHELL_RECV_COUNT,



  MANAGER_APPROACH_SLOT_COUNT,



  MANAGER_APPROACH_SLOT_STRIDE,



  MANAGER_APPROACH_FIRST_OFS,



  MANAGER_APPROACH_OFF_CURRENT,



  MANAGER_APPROACH_OFF_TARGET,



  MANAGER_APPROACH_OFF_MODE,



  MANAGER_APPROACH_MODE_SKIP_HOST,



  MANAGER_SHELL_STATE_MIN,



  MANAGER_SHELL_STATE_MAX,



  MANAGER_SHELL_STATE_TABLE_VA,



  MANAGER_SHELL_STATE_DEFAULT_VA,



  managerShellReceiverOfs,



  managerShellReceiverAddr,



  managerApproachSlotAddr,



  managerApproachSlotContinue,



  managerApproachUsesAddPath,



  managerApproachHostCallNeeded,



  managerApproachHostArgSlot,



  managerShellFlagBAfterLoop,



  managerShellProbeNeeded,



  managerShellSub90b150Blocks,



  managerShellStateUsesGame,



  managerShellGamePresent,



  managerShellSilentReturn,



  managerShellStateIndex,



  managerShellStateInTable,



  managerShellStateTargetVa,



  managerShellStateTableVa,



  managerShellStateDefaultVa,



  managerApproachSlotCount,



  managerApproachSlotStride,



  managerPollA6dd30XCbRan,



  managerPollA6dd30YAxisBase,



  managerPollA6dd30YCbPtr,



  managerPollA6dd30YCbNeeded,



  managerPollA6dd30TimestampIsStable,



  managerPollA1f280ActionSlotModeCc,



  managerPollA1f280ActionStoreBase,



  managerPollA1f280ActionStoreAddr,



  managerPollA1f280ActionCountIsPrelog,



  MANAGER_STATE2_OFF_BLOCK_FLAG,



  MANAGER_STATE2_OFF_PARITY,



  GAME_STATE2_OFF_CONTAINER,



  STATE2_OFF_ENTITY_COUNT,



  STATE2_OFF_ENTITY_ARRAY,



  STATE2_OFF_ENTITY_FLAG,



  STATE2_OFF_ENTITY_SRC_A,



  STATE2_OFF_ENTITY_SRC_B,



  STATE2_OFF_ENTITY_DST_A,



  STATE2_OFF_ENTITY_DST_B,



  STATE2_FIXUP_A,



  STATE2_FIXUP_B,



  STATE2_FIXUP_COUNT,



  managerState2Blocked,



  managerState2ParityAlt,



  managerState2SweepNeeded,



  managerState2SweepStep,



  managerState2EntitySlotAddr,



  managerState2EntityNeedsFixup,



  managerState2FixupSrcOfs,



  managerState2FixupDstOfs,



  managerState2EntityFlagAfterFixup,



  P9505E0_FIELD_A_DWORD,



  P9505E0_FIELD_A_BYTE,



  P9505E0_FIELD_B_DWORD,



  P9505E0_FIELD_B_BYTE,



  P9505E0_FIELD_COUNT,



  P9505E0_OFF_A_DWORD,



  P9505E0_OFF_A_BYTE,



  P9505E0_OFF_B_DWORD,



  P9505E0_OFF_B_BYTE,



  P9505E0_RECV_OFS,



  manager9505e0Gate,



  manager9505e0ReadsBPair,



  manager9505e0FieldOfs,



  manager9505e0ManagerOfs,



  P9C3990_OFF_NODE_OBJ,



  P9C3990_OFF_OBJ_FLAGS,



  P9C3990_MATCH_BIT,



  P9C3990_OFF_LOCK_SUBOBJ,



  P9C3990_LOCK_VTBL,



  P9C3990_UNLOCK_VTBL,



  P9C3990_LOCK_ARG,



  manager9c3990NodeMatches,



  manager9c3990WalkContinue,



  manager9c3990Result,



  manager9c3990Scanned,



  manager9c3990UnlockAlways,



  manager9c3990LockArg,



  manager9c3990LockVtblSlot,



  manager9c3990UnlockVtblSlot,



  STATE_ARM_PROBE_RECV_OFS,



  STATE3_RECV_OFS,



  STATE5_RECV_OFS,



  STATE1_MODE_GLOBAL,



  STATE1_MODE_OFS,



  STATE1_MODE_MATCH,



  STATE1_TERMINAL_VA,



  STATE2_TERMINAL_VA,



  STATE_ARM_PROBE_VA,



  STATE3_CALL_VA,



  STATE5_CALL_VA,



  managerState1SecondGateNeeded,



  managerState1ModeReadUnconditional,



  managerState1TerminalNeeded,



  managerState1TerminalNeededFromFields,



  managerState2HeadGateNeeded,



  managerState2HeadTerminalNeeded,



  managerState2HeadTerminalNeededFromFields,



  managerShellArmRecvOfs,



  managerShellArmCallVa,



  managerState1TerminalVa,



  managerState2HeadTerminalVa,



  PREDISPATCH_FIELD_OBJ,



  PREDISPATCH_FIELD_RECV,



  PREDISPATCH_FIELD_SUPPRESS,



  PREDISPATCH_FIELD_MODE,



  PREDISPATCH_FIELD_COUNT,



  PREDISPATCH_OFF_OBJ,



  PREDISPATCH_OFF_RECV,



  PREDISPATCH_OFF_SUPPRESS,



  PREDISPATCH_OFF_MODE,



  PREDISPATCH_MODE_MATCH,



  PREDISPATCH_QUEUE_BEGIN_OFS,



  PREDISPATCH_QUEUE_END_OFS,



  PREDISPATCH_CALL_VA,



  managerPredispatchCallNeeded,



  managerPredispatchObjAfter,



  managerPredispatchSuppressAfter,



  managerPredispatchQueueGateReached,



  managerPredispatchForcesDefault,



  managerPredispatchDispatches,



  managerPredispatchFieldOfs,



  managerState2GameNullGuarded,



  STATE2_MID_OFF_2A3C0,



  STATE2_MID_OFF_GAME_A,



  STATE2_MID_OFF_GAME_B,



  STATE2_MID_GAME_B_MATCH,



  STATE2_MID_OFF_MODE,



  STATE2_MID_MODE_V2,



  STATE2_MID_OFF_PARITY,



  STATE2_MID_OFF_OBJ_INNER,



  STATE2_MID_OFF_OBJ_BYTE,



  STATE2_MID_CALL_A_VA,



  STATE2_MID_CALL_B_VA,



  STATE2_MID_PARITY_CALL_VA,



  STATE2_MID_IS_PAUSED_VA,



  managerState2MidParityGateNeeded,



  managerState2MidDispatchNeeded,



  managerState2MidModeIsTwo,



  managerState2MidParityBit,



  managerState2MidWriteByteNeeded,



  managerState2MidCallAVa,



  managerState2MidCallBVa,



  managerState2MidParityCallVa,



  managerState2MidIsPausedVa,



  managerState2MidObjInnerOfs,



  managerState2MidObjByteOfs,



  managerState2MidModeOfs,



  SHELL_ANGLE_BASE_OFS,



  SHELL_ANGLE_SLOT_STRIDE,



  SHELL_ANGLE_SLOT_COUNT,



  SHELL_ANGLE_COUNT_END_OFS,



  SHELL_ANGLE_COUNT_BEGIN_OFS,



  SHELL_ANGLE_HALF_MUL_BITS,



  SHELL_ANGLE_EPS_BITS,



  SHELL_ANGLE_NEG_EPS_BITS,



  SHELL_ANGLE_ABS_MASK_VA,



  SHELL_ANGLE_SIGN_MASK_VA,



  SHELL_ANGLE_FIXUP_VA,



  managerShellAngleWrapCount,



  managerShellAngleWrapActive,



  managerShellAngleWrapSlot,



  managerShellAngleWrapBaseOfs,



  managerShellAngleWrapSlotStride,



  managerShellAngleWrapSlotCount,



  managerShellAngleWrapCountEndOfs,



  managerShellAngleWrapCountBeginOfs,



  SHELL_APPROACH_RECV_OFS,



  SHELL_APPROACH_VALUE_OFS,



  SHELL_APPROACH_STEP_OFS,



  SHELL_APPROACH_TARGET_BITS,



  SHELL_APPROACH_HOST_VA,



  managerShellApproachTailNeeded,



  managerShellApproachTailStoreNeeded,



  managerShellApproachTailNext,



  managerShellApproachTailHostVa,



  managerShellApproachTailRecvOfs,



  managerShellApproachTailValueOfs,



  managerShellApproachTailStepOfs,



  STATE2_TAIL_OFF_CALL_A_RECV,



  STATE2_TAIL_CALL_A_VA,



  STATE2_TAIL_OFF_GATE_B,



  STATE2_TAIL_CALL_B_VA,



  STATE2_TAIL_CALL_B_RECV_GLOBAL_VA,



  STATE2_TAIL_CALL_B_EDX_ARG,



  STATE2_TAIL_ANIM_IDLE_VA,



  STATE2_TAIL_ANIM_CLICKED_VA,



  STATE2_TAIL_PLAY_VA,



  STATE2_TAIL_OFF_PLAY_RECV,



  STATE2_TAIL_PLAY_RESET_ARG,



  managerState2TailCallAVa,



  managerState2TailCallARecvOfs,



  managerState2TailCallBNeeded,



  managerState2TailCallBVa,



  managerState2TailCallBRecvGlobalVa,



  managerState2TailCallBArgEdx,



  managerState2TailAnimVa,



  managerState2TailPlayVa,



  managerState2TailPlayRecvOfs,



  managerState2TailPlayAnimIdleVa,



  managerState2TailPlayAnimClickedVa,



  managerState2TailPlayResetArg,



  SHELL_TAIL_WASSERT_MSG_VA,



  SHELL_TAIL_WASSERT_FILE_VA,



  SHELL_TAIL_WASSERT_LINE,



  SHELL_TAIL_WASSERT_IAT_VA,



  SHELL_TAIL_WIN_GLOBAL_VA,



  SHELL_TAIL_PLATFORM_POLL_VA,



  SHELL_TAIL_PLATFORM_POLL_ARG0,



  SHELL_TAIL_PLATFORM_POLL_ARG1,



  SHELL_TAIL_PLATFORM_FLAG_VA,



  SHELL_TAIL_WIN_KIND_OFS,



  SHELL_TAIL_WIN_KIND_DIRECT_COPY,



  SHELL_TAIL_WIN_D0_OFS,



  SHELL_TAIL_WIN_D1_OFS,



  SHELL_TAIL_PLATFORM_QUERY_VA,



  SHELL_TAIL_TIMER_OFS,



  SHELL_TAIL_TIMER_RESET,



  SHELL_TAIL_STORE_F0_OFS,



  SHELL_TAIL_STORE_F1_OFS,



  SHELL_TAIL_PARITY_OFS,



  MANAGER_SHELL_OFF_COUNTER,



  managerShellTailWinAssertNeeded,



  managerShellTailUsesPlatformPoll,



  managerShellTailDirectCopyNeeded,



  managerShellTailFloatOfF64,



  managerShellTailLaneOrderedEqual,



  managerShellTailBothLanesEqual,



  managerShellTailTimerNext,



  managerShellTailParityNext,



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



  managerPrepollGameB0Next,



  managerPrepollLogNeeded,



  managerPrepollNightmareArg,



  managerPrepollCopySrcOfs,



  managerPrepollCopySrcDwordOfs,



  managerPrepollStateOfs,



  managerPrepollHistoryOfs,



  managerPrepollG1Ofs,



  managerPrepollCutsceneIdOfs,



  managerPrepollG2Ofs,



  managerPrepollCopySlotIndexOfs,



  managerPrepollCopySrcBase,



  managerPrepollCopySrcDw,



  managerPrepollCopyStride,



  managerPrepollCopyDstCoreOfs,



  managerPrepollCopyDstDwordOfs,



  managerPrepollCopyDstExtOfs,



  managerPrepollCopyExtFromOfs,



  managerPrepollCopyFlagOfs,



  managerPrepollCopyFlagValue,



  managerPrepollG3Ofs,



  managerPrepollNightmareArgOfs,



  managerPrepollG4Ofs,



  managerPrepollState3ArmByteOfs,



  managerPrepollPredispatchRecvOfs,



  managerPrepollState5RecvOfs,



  managerPrepollGameStoreBaseOfs,



  managerPrepollGameStoreB4Ofs,



  managerPrepollGameStoreB8Ofs,



  managerPrepollGameStoreBcOfs,



  managerPrepollGameStoreB8Bits,



  managerPrepollGameStoreBcValue,



  managerPrepollCrossfadeRecvOfs,



  managerPrepollCrossfadeMusicId,



  managerPrepollCrossfadeRateBits,



  managerPrepollHostAVa,



  managerPrepollHostBVa,



  managerPrepollHostCVa,



  managerPrepollHostDVa,



  managerPrepollHostEVa,



  managerPrepollHostFVa,



  managerPrepollHostGVa,



  managerPrepollHostGArg,



  managerPrepollLogVa,



  managerPrepollLogLevel,



  managerPrepollLogMsgVa,



  managerPrepollHostHVa,



  managerPrepollState4Value,



  managerPlayerscanCountFromBounds,



  managerPlayerscanElementPtr,



  managerPlayerscanMatchNeeded,



  managerPlayerscanState2Gate,



  managerPlayerscanPlayerCountFromBounds,



  managerPlayerscanLogNeeded,



  managerPlayerscanReleaseGate,



  managerPlayerscanCallbackNeeded,



  managerPlayerscanElementCtrlOfs,



  managerPlayerscanManagerStoreOfs,



  managerPlayerscanPlayerListBeginOfs,



  managerPlayerscanPlayerListEndOfs,



  managerPlayerscanVectorThisVa,



  managerPlayerscanVectorBeginVa,



  managerPlayerscanVectorEndVa,



  managerPlayerscanVectorLockVa,



  managerPlayerscanVectorStride,



  managerPlayerscanPlayerListStride,



  managerPlayerscanLastIndexGlobalVa,



  managerPlayerscanReleaseCallbackGlobalVa,



  managerPlayerscanManagerGlobalVa,



  managerPlayerscanGameGlobalVa,



  managerPlayerscanAccessorVa,



  managerPlayerscanSetControllerVa,



  managerPlayerscanSetControllerArg,



  managerPlayerscanMatchVcallSlot,



  managerPlayerscanMatchVcallArg,



  managerPlayerscanMatchSentinel,



  managerPlayerscanReleaseVcallSlot,



  managerPlayerscanLogLevel,



  managerPlayerscanLogMsgVa,



  managerPlayerscanState2Value,



  managerA0f550R,



  managerA0f550G,



  managerA0f550B,



  managerA0f550A,



  managerA0f550ChannelF32,



  managerA0f550F0,



  managerA0f550F1,



  managerA0f550F2,



  managerA0f550F3,



  managerA0f550TailStore,



  managerA0f550F0Ofs,



  managerA0f550F1Ofs,



  managerA0f550F2Ofs,



  managerA0f550F3Ofs,



  managerA0f550TailOfs,



  managerA0f550DenomBits,



  managerA0f550DenomVa,



  managerA0f550SignedTableVa,



  managerA0f550Va,



  managerA0f550RetVa,



  managerA0f550BodyBytes,



  managerA0f550NextVa,



  manager959d00BodyNeeded,



  manager959d00State2Needed,



  manager959d00QueueNonempty,



  manager959d00State2IslandNeeded,



  manager959d00QuietArg,



  manager959d00Host907690Needed,



  manager959d00MenuAllocNeeded,



  manager959d00MenuCtorNeeded,



  manager959d00FlagOfs,



  manager959d00StateOfs,



  manager959d00State2Value,



  manager959d00QueueBeginOfs,



  manager959d00QueueEndOfs,



  manager959d00GameModeOfs,



  manager959d00Game26630Ofs,



  manager959d00ExtOfs,



  manager959d00ExtSkip,



  manager959d00CoreOfs,



  manager959d00F0Ofs,



  manager959d00F1Ofs,



  manager959d00F2Ofs,



  manager959d00DwOfs,



  manager959d00MenuGlobalVa,



  manager959d00MenuAllocSize,



  manager959d00MenuStoreCoreOfs,



  manager959d00MenuStoreF0Ofs,



  manager959d00MenuStoreF1Ofs,



  manager959d00MenuStoreF2Ofs,



  manager959d00MenuStoreDwOfs,



  manager959d00MenuStoreFlagOfs,



  manager959d00MenuStoreFlagValue,



  manager959d00StateAfter,



  manager959d00FlagClear,



  manager959d00ManagerGlobalVa,



  manager959d00GameGlobalVa,



  manager959d00Host90cd10Va,



  manager959d00Host90a8a0Va,



  manager959d00Host907690Va,



  manager959d00Host959670Va,



  manager959d00Host91c770Va,



  manager959d00HostA0f4c0Va,



  manager959d00Host986450Va,



  manager959d00Host987450Va,



  manager959d00Host98aa30Va,



  manager959d00Va,



  manager959d00RetVa,



  manager959d00BodyBytes,



  manager959d00Sites,



  manager959d00NextVa,



  manager959720BodyNeeded,



  manager959720ProbeNeeded,



  manager959720ProbeOk,



  manager959720BodyContinue,



  manager959720ParityIncNeeded,



  manager959720ParityNext,



  manager959720GameAllocNeeded,



  manager959720GameCtorNeeded,



  manager959720QueueNonempty,



  manager959720Host6eef20Needed,



  manager959720Host923450Needed,



  manager959720JoinArm,



  manager959720JoinParityIncNeeded,



  manager959720FlagOfs,



  manager959720ProbeOfs,



  manager959720ParityOfs,



  manager959720QueueBeginOfs,



  manager959720QueueEndOfs,



  manager959720StateOfs,



  manager959720StateAfter,



  manager959720Flag4b131Ofs,



  manager959720Flag4b132Ofs,



  manager959720Ptr4b140Ofs,



  manager959720Dword4b3e4Ofs,



  manager959720Recv923450Ofs,



  manager959720Dword4b1c0Ofs,



  manager959720Flag4b19cOfs,



  manager959720Word4b284Ofs,



  manager959720Word4b284Value,



  manager959720FlagClear,



  manager959720GameAllocSize,



  manager959720ManagerGlobalVa,



  manager959720GameGlobalVa,



  manager959720Host90c400Va,



  manager959720Host959670Va,



  manager959720HostA0f4c0Va,



  manager959720Host6f1020Va,



  manager959720Host6f4740Va,



  manager959720Host90a8a0Va,



  manager959720Host6eef20Va,



  manager959720Host91c770Va,



  manager959720Host923450Va,



  manager959720Host6f6dd0Va,



  manager959720Host6f7750Va,



  manager959720Host6f5320Va,



  manager959720ArmSeedThen,



  manager959720ArmHost6f5850,



  manager959720ArmSeedElse,



  manager959720Arm4b132,



  manager959720ArmDaily,



  manager959720ArmDebug,



  manager959720ArmStart,



  manager959720Va,



  manager959720RetVa,



  manager959720BodyBytes,



  manager959720Sites,



  manager959720SiteVa,



  manager959720NextVa,



  manager959670StateId,



  manager959670State1Needed,



  manager959670State2Needed,



  manager959670GamePresent,



  manager959670GameBodyNeeded,



  manager959670MenuPresent,



  manager959670MenuBodyNeeded,



  manager959670ExitSaveArg,



  manager959670Flag4b285Clear,



  manager959670ValueStoreNeeded,



  manager959670Host429170Recv,



  manager959670StateOfs,



  manager959670StateOther,



  manager959670StateMenu,



  manager959670StateGame,



  manager959670Flag4b284Ofs,



  manager959670Flag4b285Ofs,



  manager959670RecvOfs,



  manager959670ValueOfs,



  manager959670StepOfs,



  manager959670ValueStoreBits,



  manager959670StepStoreBits,



  manager959670TargetVa,



  manager959670GameGlobalVa,



  manager959670MenuGlobalVa,



  manager959670MenuFreeSize,



  manager959670MenuClear,



  manager959670Host429170Ofs,



  manager959670Host6fa0c0Va,



  manager959670Host92e430Va,



  manager959670Host429170Va,



  manager959670Host986f30Va,



  manager959670HostAef15cVa,



  manager959670EpilogVa,



  manager959670ManagerGlobalVa,



  manager959670Va,



  manager959670Int3Va,



  manager959670BodyBytes,



  manager959670FirstRetTrapBytes,



  manager959670Sites,



  manager959670Site0Va,



  manager959670Site1Va,



  manager959670Site2Va,



  manager959670NextVa,



  cutscene95e7c0IdInRange,



  cutscene95e7c0UnloadNeeded,



  cutscene95e7c0IdNonzero,



  cutscene95e7c0ShowBodyNeeded,



  cutscene95e7c0EntryOfs,



  cutscene95e7c0QueueGt1,



  cutscene95e7c0SsoInline,



  cutscene95e7c0IdIs2,



  cutscene95e7c0GamePresent,



  cutscene95e7c0Game1bb88Needed,



  cutscene95e7c0FlagE5Continue,



  cutscene95e7c0VecCount,



  cutscene95e7c0VecLoopNeeded,



  cutscene95e7c0IdMax,



  cutscene95e7c0EntryCount,



  cutscene95e7c0EntryStride,



  cutscene95e7c0EntriesOfs,



  cutscene95e7c0StateOfs,



  cutscene95e7c0QueuedOfs,



  cutscene95e7c0SsoCap,



  cutscene95e7c0IdSpecial,



  cutscene95e7c0FlagE5Ofs,



  cutscene95e7c0VecBeginOfs,



  cutscene95e7c0VecEndOfs,



  cutscene95e7c0Game1bb88Ofs,



  cutscene95e7c0QueueBeginOfs,



  cutscene95e7c0QueueEndOfs,



  cutscene95e7c0QueueHelperVa,



  cutscene95e7c0RecvOfs,



  cutscene95e7c0ArgOfs,



  cutscene95e7c0MusicIndexOfs,



  cutscene95e7c0MusicStride,



  cutscene95e7c0MusicVolOfs,



  cutscene95e7c0MusicRateOfs,



  cutscene95e7c0MusicRateBits,



  cutscene95e7c0Music2a2ccOfs,



  cutscene95e7c0Store828Ofs,



  cutscene95e7c0Store838Ofs,



  cutscene95e7c0Store838Value,



  cutscene95e7c0StateAfter,



  cutscene95e7c0ManagerGlobalVa,



  cutscene95e7c0GameGlobalVa,



  cutscene95e7c0Host960840Va,



  cutscene95e7c0Host40e910Va,



  cutscene95e7c0HostA112c0Va,



  cutscene95e7c0Host95ead0Va,



  cutscene95e7c0Host91c7e0Va,



  cutscene95e7c0Host8fd750Va,



  cutscene95e7c0Host4239b0Va,



  cutscene95e7c0Host6eef60Va,



  cutscene95e7c0Va,



  cutscene95e7c0RetVa,



  cutscene95e7c0OobRetVa,



  cutscene95e7c0Int3Va,



  cutscene95e7c0BodyBytes,



  cutscene95e7c0FirstRetTrapBytes,



  cutscene95e7c0Sites,



  cutscene95e7c0SiteVa,



  cutscene95e7c0NextVa,



  nightmare921ce0PlayersCount,



  nightmare921ce0PlayersLogNeeded,



  nightmare921ce0MapPresent,



  nightmare921ce0MapFound,



  nightmare921ce0StrncmpOk,



  nightmare921ce0GfxNeeded,



  nightmare921ce0SsoInline,



  nightmare921ce0SpriteOfs,



  nightmare921ce0Dogma,



  nightmare921ce0CollectiblePathNeeded,



  nightmare921ce0Flag4b1Continue,



  nightmare921ce0BoolArg,



  nightmare921ce0MusicId,



  nightmare921ce0StageIsC,



  nightmare921ce0StageIsD,



  nightmare921ce0OwnerPresent,



  nightmare921ce0MapKey,



  nightmare921ce0MapIsnilOfs,



  nightmare921ce0MapKeyOfs,



  nightmare921ce0MapOfs,



  nightmare921ce0PlayersBeginOfs,



  nightmare921ce0PlayersEndOfs,



  nightmare921ce0SsoCap,



  nightmare921ce0StrncmpN,



  nightmare921ce0SpriteStride,



  nightmare921ce0IndexOfs,



  nightmare921ce0TableOfs,



  nightmare921ce0BaseOfs,



  nightmare921ce0DogmaOfs,



  nightmare921ce0BoolStoreOfs,



  nightmare921ce0Flag4b1Ofs,



  nightmare921ce0Flag4bcOfs,



  nightmare921ce0Flag4bcClear,



  nightmare921ce0Flag4bcSet,



  nightmare921ce0MusicIdNormal,



  nightmare921ce0MusicIdDogma,



  nightmare921ce0MusicRecvOfs,



  nightmare921ce0MusicVolOfs,



  nightmare921ce0StageC,



  nightmare921ce0StageD,



  nightmare921ce0CollectibleId,



  nightmare921ce0LazTag,



  nightmare921ce0Anm2LoadGraphics,



  nightmare921ce0Store3a4Ofs,



  nightmare921ce0Store3a4Value,



  nightmare921ce0LogLevel,



  nightmare921ce0LogMsgVa,



  nightmare921ce0PathVa,



  nightmare921ce0IatStrncmpVa,



  nightmare921ce0GameGlobalVa,



  nightmare921ce0ManagerGlobalVa,



  nightmare921ce0RecvOfs,



  nightmare921ce0ArgOfs,



  nightmare921ce0G3Ofs,



  nightmare921ce0HostA112c0Va,



  nightmare921ce0Host4288a0Va,



  nightmare921ce0Host4074c0Va,



  nightmare921ce0Host40bd50Va,



  nightmare921ce0Host407f10Va,



  nightmare921ce0Host9be080Va,



  nightmare921ce0Host7e1d50Va,



  nightmare921ce0HostAef15cVa,



  nightmare921ce0HostA0f4c0Va,



  nightmare921ce0Va,



  nightmare921ce0RetVa,



  nightmare921ce0Int3Va,



  nightmare921ce0BodyBytes,



  nightmare921ce0FirstRetTrapBytes,



  nightmare921ce0Sites,



  nightmare921ce0SiteVa,



  nightmare921ce0SiblingVa,



  nightmare921ce0NextVa,



  fco9be080TwinWalkFlag,



  fco9be080ListEmpty,



  fco9be080SlotCheckable,



  fco9be080HasCollectibleHit,



  fco9be080TwinPresent,



  fco9be080TwinCheckNeeded,

  rco9be140ListEmpty,
  rco9be140SlotCheckable,
  rco9be140HasCollectibleHit,
  rco9be140SeedAssertNeeded,
  rco9be140XorshiftState,
  rco9be140StateAsF64,
  rco9be140NextFloat,
  rco9be140ScaleValue,
  rco9be140BestInitValue,
  rco9be140BestUpdateNeeded,
  rco9be140WalkNext,
  rco9be140WalkContinue,
  rco9be140OutPresent,
  rco9be140WinnerPresent,
  rco9be140IdNegative,
  rco9be140CollectibleCount,
  rco9be140CollectibleIdOob,
  rco9be140CollectibleCountMinus1,
  rco9be140CollectibleIndexClamp,
  rco9be140CollectibleEntryPtr,
  rco9be140ResultPlayer,
  rco9be140NextVa,
  a9be2a0PlayersCount,
  a9be2a0IdMask15,
  a9be2a0DirectIndexOor,
  a9be2a0DirectPlayerPtr,
  a9be2a0TwinFlag,
  a9be2a0ListEmpty,
  a9be2a0SlotCheckable,
  a9be2a0HasCollectibleHit,
  a9be2a0TwinCheckNeeded,
  a9be2a0WalkNext,
  a9be2a0WalkContinue,
  a9be2a0OutPresent,
  a9be2a0IdNegative,
  a9be2a0CollectCount,
  a9be2a0IdOob,
  a9be2a0LogNeeded,
  a9be2a0CollectCountMinus1,
  a9be2a0CollectIndexClamp,
  a9be2a0CollectEntryPtr,
  a9be2a0TwinResult,
  a9be2a0ResultNotFound,
  a9be2a0ResultPlayer,
  a9be2a0StoreZeroValue,
  a9be2a0PlayersBeginOfs,
  a9be2a0PlayersEndOfs,
  a9be2a0CollectBeginOfs,
  a9be2a0CollectEndOfs,
  a9be2a0HasCollectibleVa,
  a9be2a0TwinGetVa,
  a9be2a0OobMsgVa,
  a9be2a0NextVa,

  rto9be3e0ListEmpty,
  rto9be3e0SlotCheckable,
  rto9be3e0HasCollectibleHit,
  rto9be3e0SeedAssertNeeded,
  rto9be3e0XorshiftState,
  rto9be3e0StateAsF64,
  rto9be3e0NextFloat,
  rto9be3e0ScaleValue,
  rto9be3e0BestInitValue,
  rto9be3e0BestUpdateNeeded,
  rto9be3e0WalkNext,
  rto9be3e0WalkContinue,
  rto9be3e0OutPresent,
  rto9be3e0WinnerPresent,
  rto9be3e0IdNegative,
  rto9be3e0CollectibleCount,
  rto9be3e0IdOob,
  rto9be3e0LogNeeded,
  rto9be3e0CollectibleCountMinus1,
  rto9be3e0CollectibleIndexClamp,
  rto9be3e0CollectibleEntryPtr,
  rto9be3e0ResultPlayer,
  rto9be3e0StoreZeroValue,
  rto9be3e0ListBeginOfs,
  rto9be3e0ListEndOfs,
  rto9be3e0CollectBeginOfs,
  rto9be3e0CollectEndOfs,
  rto9be3e0SeedAssertMsgVa,
  rto9be3e0OobAssertMsgVa,
  rto9be3e0AssertTrapVa,
  rto9be3e0HasCollectibleVa,
  rto9be3e0RngShiftTableVa,
  rto9be3e0RngShift1,
  rto9be3e0RngShift2,
  rto9be3e0RngShift3,
  rto9be3e0BestInitBits,
  rto9be3e0ScaleBits,
  rto9be3e0SignCorrTableVa,
  rto9be3e0NextVa,
  rto9be3e0Va,
  rto9be3e0RetVa,
  rto9be3e0FirstRetVa,
  rto9be3e0Int3Va,
  rto9be3e0BodyBytes,
  rto9be3e0Sites,

  fco9be080WalkNext,



  fco9be080WalkContinue,



  fco9be080ResultPlayer,



  fco9be080ResultTwin,



  fco9be080ResultNotFound,



  fco9be080ItemConfigOfs,



  fco9be080GetCollectibleVa,



  fco9be080HasCollectibleVa,



  fco9be080ItemFlagsOfs,



  fco9be080TwinBit,



  fco9be080ListBeginOfs,



  fco9be080ListEndOfs,



  fco9be080ListStride,



  fco9be080SlotFlagOfs,



  fco9be080TwinPtrOfs,



  fco9be080LazArgOfs,



  fco9be080ManagerGlobalVa,



  fco9be080Va,



  fco9be080RetVa,



  fco9be080FirstRetVa,



  fco9be080Int3Va,



  fco9be080BodyBytes,



  fco9be080Sites,



  fco9be080SiteVa,



  fco9be080Site2Va,



  fco9be080NextVa,






  A959720_ARM_SEED_THEN,



  A959720_ARM_HOST_6F5850,



  A959720_ARM_SEED_ELSE,



  A959720_ARM_4B132,



  A959720_ARM_DAILY,



  A959720_ARM_DEBUG,



  A959720_ARM_START,



} from "../scripts/decomp/process-input-pure-model.mjs";
import {
  renderShell6f9400Gate39,
  renderShell6f9400Mask,
  renderShell6f9400MaskFull,
  renderShell6f95a0Mask,
} from "../scripts/decomp/render-shell-pure-model.mjs";

import {
  A9BE530_LIST_BEGIN_OFS,
  A9BE530_LIST_END_OFS,
  A9BE530_LIST_STRIDE,
  A9BE530_SLOT_FLAG_OFS,
  A9BE530_FLAG_202C_OFS,
  A9BE530_FLAG_20A9_OFS,
  A9BE530_CHARGE_OFS,
  A9BE530_CHARGE_MIN,
  A9BE530_SEED_ASSERT_MSG_VA,
  A9BE530_LOG_LEVEL,
  A9BE530_ASSERT_TRAP_VA,
  A9BE530_HOST_LOG_VA,
  A9BE530_RNG_SHIFT_TABLE_VA,
  A9BE530_RNG_SHIFT1,
  A9BE530_RNG_SHIFT2,
  A9BE530_RNG_SHIFT3,
  A9BE530_BEST_INIT_BITS,
  A9BE530_SCALE_BITS,
  A9BE530_SIGN_CORR_TABLE_VA,
  A9BE530_VA,
  A9BE530_FIRST_RET_VA,
  A9BE530_RET_VA,
  A9BE530_INT3_VA,
  A9BE530_BODY_BYTES,
  A9BE530_SITES,
  A9BE530_NEXT_VA,
  a9be530ListEmpty,
  a9be530SlotCheckable,
  a9be530Flag202cCheckable,
  a9be530Flag20a9Checkable,
  a9be530ChargeOk,
  a9be530SeedAssertNeeded,
  a9be530XorshiftState,
  a9be530StateAsF64,
  a9be530NextFloat,
  a9be530BestUpdateNeeded,
  a9be530WalkNext,
  a9be530WalkContinue,
  a9be530ResultPlayer,
  a9be530ListBeginOfs,
  a9be530ListEndOfs,
  a9be530ListStride,
  a9be530SlotFlagOfs,
  a9be530Flag202cOfs,
  a9be530Flag20a9Ofs,
  a9be530ChargeOfs,
  a9be530ChargeMin,
  a9be530SeedAssertMsgVa,
  a9be530LogLevel,
  a9be530AssertTrapVa,
  a9be530HostLogVa,
  a9be530RngShiftTableVa,
  a9be530RngShift1,
  a9be530RngShift2,
  a9be530RngShift3,
  a9be530BestInitBits,
  a9be530ScaleBits,
  a9be530SignCorrTableVa,
  a9be530BestInitValue,
  a9be530ScaleValue,
  a9be530Va,
  a9be530RetVa,
  a9be530FirstRetVa,
  a9be530Int3Va,
  a9be530BodyBytes,
  a9be530Sites,
  a9be530NextVa,
  A9BE630_LIST_BEGIN_OFS,
  A9BE630_LIST_END_OFS,
  A9BE630_LIST_STRIDE,
  A9BE630_SLOT_FLAG_OFS,
  A9BE630_FLAG_20A9_OFS,
  A9BE630_SLOT_VALUE_OFS,
  A9BE630_VA,
  A9BE630_FIRST_RET_VA,
  A9BE630_RET_VA,
  A9BE630_INT3_VA,
  A9BE630_BODY_BYTES,
  A9BE630_SITES,
  A9BE630_NEXT_VA,
  a9be630ListEmpty,
  a9be630SlotCheckable,
  a9be630Flag20a9Checkable,
  a9be630SlotMatches,
  a9be630WalkNext,
  a9be630WalkContinue,
  a9be630ResultNotfound,
  a9be630ResultFound,
  a9be630ListBeginOfs,
  a9be630ListEndOfs,
  a9be630ListStride,
  a9be630SlotFlagOfs,
  a9be630Flag20a9Ofs,
  a9be630SlotValueOfs,
  a9be630Va,
  a9be630RetVa,
  a9be630FirstRetVa,
  a9be630Int3Va,
  a9be630BodyBytes,
  a9be630Sites,
  a9be630NextVa,
  A9BE670_LIST_BEGIN_OFS,
  A9BE670_LIST_END_OFS,
  A9BE670_LIST_STRIDE,
  A9BE670_SLOT_FLAG_OFS,
  A9BE670_FLAG_20A9_OFS,
  A9BE670_SLOT_VALUE_OFS,
  A9BE670_SLOT_NEEDLE,
  A9BE670_VA,
  A9BE670_FIRST_RET_VA,
  A9BE670_RET_VA,
  A9BE670_INT3_VA,
  A9BE670_BODY_BYTES,
  A9BE670_SITES,
  A9BE670_NEXT_VA,
  a9be670ListEmpty,
  a9be670SlotCheckable,
  a9be670Flag20a9Checkable,
  a9be670SlotEqualsNeedle,
  a9be670WalkNext,
  a9be670WalkContinue,
  a9be670ResultTrue,
  a9be670ResultFalse,
  a9be670ListBeginOfs,
  a9be670ListEndOfs,
  a9be670ListStride,
  a9be670SlotFlagOfs,
  a9be670Flag20a9Ofs,
  a9be670SlotValueOfs,
  a9be670SlotNeedle,
  a9be670Va,
  a9be670RetVa,
  a9be670FirstRetVa,
  a9be670Int3Va,
  a9be670BodyBytes,
  a9be670Sites,
  a9be670NextVa,
  A9BE6B0_LIST_BEGIN_OFS,
  A9BE6B0_LIST_END_OFS,
  A9BE6B0_LIST_STRIDE,
  A9BE6B0_FIELD_2EF8_OFS,
  A9BE6B0_FLAG_2EF0_OFS,
  A9BE6B0_QUERY_ARG1,
  A9BE6B0_QUERY_ARG2,
  A9BE6B0_STATUS_CALL_VA,
  A9BE6B0_QUERY_CALL_VA,
  A9BE6B0_VA,
  A9BE6B0_FIRST_RET_VA,
  A9BE6B0_RET_VA,
  A9BE6B0_INT3_VA,
  A9BE6B0_BODY_BYTES,
  A9BE6B0_SITES,
  A9BE6B0_NEXT_VA,
  a9be6b0ListEmpty,
  a9be6b0FieldNonzero,
  a9be6b0FieldEqNeedle,
  a9be6b0Flag2ef0Set,
  a9be6b0StatusGt1,
  a9be6b0StatusGt0,
  a9be6b0BlForced,
  a9be6b0AcceptNeeded,
  a9be6b0WinnerStoreNeeded,
  a9be6b0WalkNext,
  a9be6b0WalkContinue,
  a9be6b0ResultPlayer,
  a9be6b0ResultWinner,
  a9be6b0ListBeginOfs,
  a9be6b0ListEndOfs,
  a9be6b0ListStride,
  a9be6b0Field2ef8Ofs,
  a9be6b0Flag2ef0Ofs,
  a9be6b0QueryArg1,
  a9be6b0QueryArg2,
  a9be6b0StatusCallVa,
  a9be6b0QueryCallVa,
  a9be6b0Va,
  a9be6b0RetVa,
  a9be6b0FirstRetVa,
  a9be6b0Int3Va,
  a9be6b0BodyBytes,
  a9be6b0Sites,
  a9be6b0NextVa,
  GNC9BE750_LIST_BEGIN_OFS,
  GNC9BE750_LIST_END_OFS,
  GNC9BE750_LIST_STRIDE,
  GNC9BE750_SLOT_FLAG_OFS,
  GNC9BE750_TWIN_PTR_OFS,
  GNC9BE750_TWIN_FLAGS_OFS,
  GNC9BE750_TWIN_BIT,
  GNC9BE750_MANAGER_GLOBAL_VA,
  GNC9BE750_GAME_GLOBAL_VA,
  GNC9BE750_RECEIVER_OFS,
  GNC9BE750_TWIN_CONTAINER_OFS,
  GNC9BE750_HOST_TWIN_GET_VA,
  GNC9BE750_HOST_COUNT_VA,
  GNC9BE750_VA,
  GNC9BE750_RET_VA,
  GNC9BE750_INT3_VA,
  GNC9BE750_BODY_BYTES,
  GNC9BE750_SITES,
  GNC9BE750_SITE_VA,
  GNC9BE750_NEXT_VA,
  gnc9be750TwinFlag,
  gnc9be750ListEmpty,
  gnc9be750SlotCheckable,
  gnc9be750CountAdd,
  gnc9be750TwinCallNeeded,
  gnc9be750WalkNext,
  gnc9be750WalkContinue,
  gnc9be750ResultSum,
  gnc9be750ListBeginOfs,
  gnc9be750ListEndOfs,
  gnc9be750ListStride,
  gnc9be750SlotFlagOfs,
  gnc9be750TwinPtrOfs,
  gnc9be750TwinFlagsOfs,
  gnc9be750TwinBit,
  gnc9be750ManagerGlobalVa,
  gnc9be750GameGlobalVa,
  gnc9be750ReceiverOfs,
  gnc9be750TwinContainerOfs,
  gnc9be750HostTwinGetVa,
  gnc9be750HostCountVa,
  gnc9be750Va,
  gnc9be750RetVa,
  gnc9be750Int3Va,
  gnc9be750BodyBytes,
  gnc9be750Sites,
  gnc9be750SiteVa,
  gnc9be750NextVa,
  HTE9BE7F0_LIST_BEGIN_OFS,
  HTE9BE7F0_LIST_END_OFS,
  HTE9BE7F0_LIST_STRIDE,
  HTE9BE7F0_SLOT_FLAG_OFS,
  HTE9BE7F0_FLAG1519_OFS,
  HTE9BE7F0_VEC_BEGIN_OFS,
  HTE9BE7F0_VEC_END_OFS,
  HTE9BE7F0_VEC_STRIDE,
  HTE9BE7F0_VA,
  HTE9BE7F0_FIRST_RET_VA,
  HTE9BE7F0_RET_VA,
  HTE9BE7F0_INT3_VA,
  HTE9BE7F0_BODY_BYTES,
  HTE9BE7F0_SITES,
  HTE9BE7F0_SITE_VA,
  HTE9BE7F0_SITE2_VA,
  HTE9BE7F0_NEXT_VA,
  hte9be7f0ListEmpty,
  hte9be7f0SlotCheckable,
  hte9be7f0Flag1519Checkable,
  hte9be7f0VecNotEmpty,
  hte9be7f0EntryHit,
  hte9be7f0VecWalkNext,
  hte9be7f0VecWalkContinue,
  hte9be7f0WalkNext,
  hte9be7f0WalkContinue,
  hte9be7f0ResultFound,
  hte9be7f0ResultNotFound,
  hte9be7f0ListBeginOfs,
  hte9be7f0ListEndOfs,
  hte9be7f0ListStride,
  hte9be7f0SlotFlagOfs,
  hte9be7f0Flag1519Ofs,
  hte9be7f0VecBeginOfs,
  hte9be7f0VecEndOfs,
  hte9be7f0VecStride,
  hte9be7f0Va,
  hte9be7f0FirstRetVa,
  hte9be7f0RetVa,
  hte9be7f0Int3Va,
  hte9be7f0BodyBytes,
  hte9be7f0Sites,
  hte9be7f0SiteVa,
  hte9be7f0Site2Va,
  hte9be7f0NextVa,
  A9BE850_LIST_BEGIN_OFS,
  A9BE850_LIST_END_OFS,
  A9BE850_LIST_STRIDE,
  A9BE850_MANAGER_GLOBAL_VA,
  A9BE850_VEC_A_BEGIN_OFS,
  A9BE850_VEC_A_END_OFS,
  A9BE850_VEC_A_SLOT_OFS,
  A9BE850_HOST_GATE_THRESHOLD,
  A9BE850_HOST_GATE_MASK,
  A9BE850_SLOT_FIELD_OFS,
  A9BE850_HOST_RECEIVER_OFS,
  A9BE850_TWIN_FIELD_OFS,
  A9BE850_FLAG1519_OFS,
  A9BE850_TWIN_VEC_BEGIN_OFS,
  A9BE850_TWIN_VEC_END_OFS,
  A9BE850_TWIN_VEC_STRIDE,
  A9BE850_MARKER_FIELD0_VALUE,
  A9BE850_MARKER_FIELD4_VALUE,
  A9BE850_HOST_VA,
  A9BE850_HOST_ARG2,
  A9BE850_HOST_ARG3,
  A9BE850_GAME_GLOBAL_VA,
  A9BE850_RECEIVER_OFS,
  A9BE850_CALLER_ARG1,
  A9BE850_VA,
  A9BE850_RET_VA,
  A9BE850_INT3_VA,
  A9BE850_BODY_BYTES,
  A9BE850_SITES,
  A9BE850_SITE_VA,
  A9BE850_NEXT_VA,
  a9be850ListCount,
  a9be850LoopNeeded,
  a9be850HostGateNeeded,
  a9be850SlotPresent,
  a9be850TwinPresent,
  a9be850Flag1519Clear,
  a9be850TwinVecNotEmpty,
  a9be850MarkerHit,
  a9be850VecWalkNext,
  a9be850VecWalkContinue,
  a9be850WalkNext,
  a9be850WalkContinue,
  a9be850ListBeginOfs,
  a9be850ListEndOfs,
  a9be850ListStride,
  a9be850ManagerGlobalVa,
  a9be850VecABeginOfs,
  a9be850VecAEndOfs,
  a9be850VecASlotOfs,
  a9be850HostGateThreshold,
  a9be850HostGateMask,
  a9be850SlotFieldOfs,
  a9be850HostReceiverOfs,
  a9be850TwinFieldOfs,
  a9be850Flag1519Ofs,
  a9be850TwinVecBeginOfs,
  a9be850TwinVecEndOfs,
  a9be850TwinVecStride,
  a9be850MarkerField0Value,
  a9be850MarkerField4Value,
  a9be850HostVa,
  a9be850HostArg2,
  a9be850HostArg3,
  a9be850GameGlobalVa,
  a9be850ReceiverOfs,
  a9be850CallerArg1,
  a9be850Va,
  a9be850RetVa,
  a9be850Int3Va,
  a9be850BodyBytes,
  a9be850Sites,
  a9be850SiteVa,
  a9be850NextVa,
  A9BE990_LIST_BEGIN_OFS,
  A9BE990_LIST_END_OFS,
  A9BE990_LIST_STRIDE,
  A9BE990_SLOT_FIELD_OFS,
  A9BE990_SKIP_CODE_ZERO,
  A9BE990_SKIP_CODE_THREE,
  A9BE990_MANAGER_GLOBAL_VA,
  A9BE990_RECEIVER_OFS,
  A9BE990_VA,
  A9BE990_FIRST_RET_VA,
  A9BE990_RET_VA,
  A9BE990_INT3_VA,
  A9BE990_BODY_BYTES,
  A9BE990_SITES,
  A9BE990_SITE_VA,
  A9BE990_SITE2_VA,
  A9BE990_NEXT_VA,
  a9be990Hit,
  a9be990ListEmpty,
  a9be990WalkNext,
  a9be990WalkContinue,
  a9be990ListBeginOfs,
  a9be990ListEndOfs,
  a9be990ListStride,
  a9be990SlotFieldOfs,
  a9be990SkipCodeZero,
  a9be990SkipCodeThree,
  a9be990ManagerGlobalVa,
  a9be990ReceiverOfs,
  a9be990Va,
  a9be990FirstRetVa,
  a9be990RetVa,
  a9be990Int3Va,
  a9be990BodyBytes,
  a9be990Sites,
  a9be990SiteVa,
  a9be990Site2Va,
  a9be990NextVa,
  A9BE9C0_LIST_BEGIN_OFS,
  A9BE9C0_LIST_END_OFS,
  A9BE9C0_LIST_STRIDE,
  A9BE9C0_FLAG20A9_OFS,
  A9BE9C0_FIELD184_OFS,
  A9BE9C0_FOUND_CODE_ZERO,
  A9BE9C0_FOUND_CODE_ONE,
  A9BE9C0_FOUND_CODE_TWO,
  A9BE9C0_FOUND_CODE_THREE,
  A9BE9C0_MANAGER_GLOBAL_VA,
  A9BE9C0_RECEIVER_OFS,
  A9BE9C0_RECEIVER_GETTER_VA,
  A9BE9C0_VA,
  A9BE9C0_FIRST_RET_VA,
  A9BE9C0_RET_VA,
  A9BE9C0_INT3_VA,
  A9BE9C0_BODY_BYTES,
  A9BE9C0_SITES,
  A9BE9C0_SITE_VA,
  A9BE9C0_NEXT_VA,
  a9be9c0ListEmpty,
  a9be9c0Flag20a9Checkable,
  a9be9c0Field184Found,
  a9be9c0WalkNext,
  a9be9c0WalkContinue,
  a9be9c0ListBeginOfs,
  a9be9c0ListEndOfs,
  a9be9c0ListStride,
  a9be9c0Flag20a9Ofs,
  a9be9c0Field184Ofs,
  a9be9c0FoundCodeZero,
  a9be9c0FoundCodeOne,
  a9be9c0FoundCodeTwo,
  a9be9c0FoundCodeThree,
  a9be9c0ManagerGlobalVa,
  a9be9c0ReceiverOfs,
  a9be9c0ReceiverGetterVa,
  a9be9c0Va,
  a9be9c0FirstRetVa,
  a9be9c0RetVa,
  a9be9c0Int3Va,
  a9be9c0BodyBytes,
  a9be9c0Sites,
  a9be9c0SiteVa,
  a9be9c0NextVa,
  A9BEA40_LIST_BEGIN_OFS,
  A9BEA40_LIST_END_OFS,
  A9BEA40_LIST_STRIDE,
  A9BEA40_SLOT_FLAG_OFS,
  A9BEA40_FLAG20A9_OFS,
  A9BEA40_FIELD156C_OFS,
  A9BEA40_MANAGER_GLOBAL_VA,
  A9BEA40_RECEIVER_OFS,
  A9BEA40_RECEIVER_GETTER_VA,
  A9BEA40_VA,
  A9BEA40_FIRST_RET_VA,
  A9BEA40_RET_VA,
  A9BEA40_INT3_VA,
  A9BEA40_BODY_BYTES,
  A9BEA40_SITES,
  A9BEA40_SITE0_VA,
  A9BEA40_SITE1_VA,
  A9BEA40_SITE2_VA,
  A9BEA40_NEXT_VA,
  a9bea40ListEmpty,
  a9bea40SlotCheckable,
  a9bea40Flag20a9Checkable,
  a9bea40Field156cAddSs,
  a9bea40WalkNext,
  a9bea40WalkContinue,
  a9bea40ListBeginOfs,
  a9bea40ListEndOfs,
  a9bea40ListStride,
  a9bea40SlotFlagOfs,
  a9bea40Flag20a9Ofs,
  a9bea40Field156cOfs,
  a9bea40ManagerGlobalVa,
  a9bea40ReceiverOfs,
  a9bea40ReceiverGetterVa,
  a9bea40Va,
  a9bea40FirstRetVa,
  a9bea40RetVa,
  a9bea40Int3Va,
  a9bea40BodyBytes,
  a9bea40Sites,
  a9bea40Site0Va,
  a9bea40Site1Va,
  a9bea40Site2Va,
  a9bea40NextVa,
  GTM9BEA80_LIST_BEGIN_OFS,
  GTM9BEA80_LIST_END_OFS,
  GTM9BEA80_LIST_STRIDE,
  GTM9BEA80_SLOT_FLAG_OFS,
  GTM9BEA80_TWIN_PTR_OFS,
  GTM9BEA80_SLOT_ARRAY_BEGIN_OFS,
  GTM9BEA80_SLOT_ARRAY_END_OFS,
  GTM9BEA80_ID_MASK,
  GTM9BEA80_TWIN_FLAGS_OFS,
  GTM9BEA80_TWIN_FLAG_BIT,
  GTM9BEA80_MANAGER_GLOBAL_VA,
  GTM9BEA80_GAME_GLOBAL_VA,
  GTM9BEA80_RECEIVER_OFS,
  GTM9BEA80_HOST_STATUS_VA,
  GTM9BEA80_VA,
  GTM9BEA80_FIRST_RET_VA,
  GTM9BEA80_RET_VA,
  GTM9BEA80_INT3_VA,
  GTM9BEA80_BODY_BYTES,
  GTM9BEA80_SITES,
  GTM9BEA80_NEXT_VA,
  gtm9bea80IdMask,
  gtm9bea80ListCount,
  gtm9bea80RangeGate,
  gtm9bea80SlotPresent,
  gtm9bea80SlotFlag,
  gtm9bea80ListEmpty,
  gtm9bea80SlotCheckable,
  gtm9bea80SumAdd,
  gtm9bea80TwinCallNeeded,
  gtm9bea80WalkNext,
  gtm9bea80WalkContinue,
  gtm9bea80ResultSum,
  gtm9bea80ListBeginOfs,
  gtm9bea80ListEndOfs,
  gtm9bea80ListStride,
  gtm9bea80SlotFlagOfs,
  gtm9bea80TwinPtrOfs,
  gtm9bea80SlotArrayBeginOfs,
  gtm9bea80SlotArrayEndOfs,
  gtm9bea80Mask,
  gtm9bea80TwinFlagsOfs,
  gtm9bea80TwinFlagBit,
  gtm9bea80ManagerGlobalVa,
  gtm9bea80GameGlobalVa,
  gtm9bea80ReceiverOfs,
  gtm9bea80HostStatusVa,
  gtm9bea80Va,
  gtm9bea80FirstRetVa,
  gtm9bea80RetVa,
  gtm9bea80Int3Va,
  gtm9bea80BodyBytes,
  gtm9bea80Sites,
  gtm9bea80NextVa,
  A9BEB30_LIST_BEGIN_OFS,
  A9BEB30_LIST_END_OFS,
  A9BEB30_LIST_STRIDE,
  A9BEB30_SLOT_FLAG_OFS,
  A9BEB30_FLAG20A9_OFS,
  A9BEB30_CHARGE_OFS,
  A9BEB30_CHARGE_ADDEND_OFS,
  A9BEB30_CHARGE_MAX_OFS,
  A9BEB30_MANAGER_GLOBAL_VA,
  A9BEB30_RECEIVER_OFS,
  A9BEB30_HOST_CURSE_VA,
  A9BEB30_VA,
  A9BEB30_FIRST_RET_VA,
  A9BEB30_RET_VA,
  A9BEB30_INT3_VA,
  A9BEB30_BODY_BYTES,
  A9BEB30_SITES,
  A9BEB30_SITE0_VA,
  A9BEB30_SITE1_VA,
  A9BEB30_SITE2_VA,
  A9BEB30_NEXT_VA,
  a9beb30ArgByte,
  a9beb30ModeAnd,
  a9beb30ListEmpty,
  a9beb30SlotCheckable,
  a9beb30Flag20a9Checkable,
  a9beb30ChargeSum,
  a9beb30ChargeGate,
  a9beb30HostMatch,
  a9beb30Combine,
  a9beb30WalkNext,
  a9beb30WalkContinue,
  a9beb30ResultByte,
  a9beb30ListBeginOfs,
  a9beb30ListEndOfs,
  a9beb30ListStride,
  a9beb30SlotFlagOfs,
  a9beb30Flag20a9Ofs,
  a9beb30ChargeOfs,
  a9beb30ChargeAddendOfs,
  a9beb30ChargeMaxOfs,
  a9beb30ManagerGlobalVa,
  a9beb30ReceiverOfs,
  a9beb30HostCurseVa,
  a9beb30Va,
  a9beb30FirstRetVa,
  a9beb30RetVa,
  a9beb30Int3Va,
  a9beb30BodyBytes,
  a9beb30Sites,
  a9beb30Site0Va,
  a9beb30Site1Va,
  a9beb30Site2Va,
  a9beb30NextVa,
  A9BEBA0_LIST_BEGIN_OFS,
  A9BEBA0_LIST_END_OFS,
  A9BEBA0_LIST_STRIDE,
  A9BEBA0_SECOND_LIST_BEGIN_OFS,
  A9BEBA0_SECOND_LIST_END_OFS,
  A9BEBA0_SLOT_FLAG_OFS,
  A9BEBA0_WATCH_OFS,
  A9BEBA0_WATCH_VALUE,
  A9BEBA0_FLAG20A9_OFS,
  A9BEBA0_LOOKUP_KEY_OFS,
  A9BEBA0_LOOKUP_TAG_OFS,
  A9BEBA0_POS_X_OFS,
  A9BEBA0_POS_Y_OFS,
  A9BEBA0_PRED_OBJ_OFS,
  A9BEBA0_PRED_SLOT_OFS,
  A9BEBA0_GOBJ_TS_OFS,
  A9BEBA0_GOBJ_LIST_BEGIN_OFS,
  A9BEBA0_GOBJ_LIST_END_OFS,
  A9BEBA0_CACHE_TS_VA,
  A9BEBA0_CACHE_X_VA,
  A9BEBA0_CACHE_Y_VA,
  A9BEBA0_GOBJ_GLOBAL_VA,
  A9BEBA0_MANAGER_GLOBAL_VA,
  A9BEBA0_RECEIVER_OFS,
  A9BEBA0_ASSERT_VA,
  A9BEBA0_ASSERT_MSG_VA,
  A9BEBA0_ASSERT_CODE,
  A9BEBA0_VA,
  A9BEBA0_FIRST_RET_VA,
  A9BEBA0_RET_VA,
  A9BEBA0_INT3_VA,
  A9BEBA0_BODY_BYTES,
  A9BEBA0_SITES,
  A9BEBA0_SITE0_VA,
  A9BEBA0_SITE1_VA,
  A9BEBA0_SITE2_VA,
  A9BEBA0_SITE3_VA,
  A9BEBA0_SITE4_VA,
  A9BEBA0_SITE5_VA,
  A9BEBA0_SITE6_VA,
  A9BEBA0_SITE7_VA,
  A9BEBA0_SITE8_VA,
  A9BEBA0_NEXT_VA,
  a9beba0ModeFast,
  a9beba0CacheFresh,
  a9beba0ListCount,
  a9beba0IdxInRange,
  a9beba0SlotEligible,
  a9beba0WatchGate,
  a9beba0Flag20a9Gate,
  a9beba0PlayerCandidate,
  a9beba0LookupMatch,
  a9beba0ScanEmpty,
  a9beba0ScanContinue,
  a9beba0AccumGate,
  a9beba0PredMatch,
  a9beba0AccumX,
  a9beba0AccumY,
  a9beba0CountInc,
  a9beba0HasAvg,
  a9beba0AvgX,
  a9beba0AvgY,
  a9beba0FallbackX,
  a9beba0FallbackY,
  a9beba0AssertNeeded,
  a9beba0ListBeginOfs,
  a9beba0ListEndOfs,
  a9beba0ListStride,
  a9beba0SecondListBeginOfs,
  a9beba0SecondListEndOfs,
  a9beba0SlotFlagOfs,
  a9beba0WatchOfs,
  a9beba0WatchValue,
  a9beba0Flag20a9Ofs,
  a9beba0LookupKeyOfs,
  a9beba0LookupTagOfs,
  a9beba0PosXOfs,
  a9beba0PosYOfs,
  a9beba0PredObjOfs,
  a9beba0PredSlotOfs,
  a9beba0GobjTsOfs,
  a9beba0GobjListBeginOfs,
  a9beba0GobjListEndOfs,
  a9beba0CacheTsVa,
  a9beba0CacheXVa,
  a9beba0CacheYVa,
  a9beba0GobjGlobalVa,
  a9beba0ManagerGlobalVa,
  a9beba0ReceiverOfs,
  a9beba0AssertVa,
  a9beba0AssertMsgVa,
  a9beba0AssertCode,
  a9beba0Va,
  a9beba0FirstRetVa,
  a9beba0RetVa,
  a9beba0Int3Va,
  a9beba0BodyBytes,
  a9beba0Sites,
  a9beba0Site0Va,
  a9beba0Site1Va,
  a9beba0Site2Va,
  a9beba0Site3Va,
  a9beba0Site4Va,
  a9beba0Site5Va,
  a9beba0Site6Va,
  a9beba0Site7Va,
  a9beba0Site8Va,
  a9beba0NextVa,
  A9BFA70_LIST_BEGIN_OFS,
  A9BFA70_LIST_END_OFS,
  A9BFA70_LIST_STRIDE,
  A9BFA70_SLOT_FLAG_OFS,
  A9BFA70_STATE_OFS,
  A9BFA70_LINK_OFS,
  A9BFA70_INDEX_OFS,
  A9BFA70_FLAG20A9_OFS,
  A9BFA70_MANAGER_GLOBAL_VA,
  A9BFA70_RECEIVER_OFS,
  A9BFA70_VA,
  A9BFA70_FIRST_RET_VA,
  A9BFA70_RET_VA,
  A9BFA70_INT3_VA,
  A9BFA70_BODY_BYTES,
  A9BFA70_SITES,
  A9BFA70_SITE0_VA,
  A9BFA70_SITE1_VA,
  A9BFA70_SITE2_VA,
  A9BFA70_SITE3_VA,
  A9BFA70_NEXT_VA,
  a9bfa70ListCount,
  a9bfa70IdxContinue,
  a9bfa70SlotFree,
  a9bfa70StateIdle,
  a9bfa70LinkNull,
  a9bfa70LinkIndexNeg1,
  a9bfa70IndexGe,
  a9bfa70LinkIsSelf,
  a9bfa70Flag20a9Set,
  a9bfa70CountGate,
  a9bfa70CountResult,
  a9bfa70ListBeginOfs,
  a9bfa70ListEndOfs,
  a9bfa70ListStride,
  a9bfa70SlotFlagOfs,
  a9bfa70StateOfs,
  a9bfa70LinkOfs,
  a9bfa70IndexOfs,
  a9bfa70Flag20a9Ofs,
  a9bfa70ManagerGlobalVa,
  a9bfa70ReceiverOfs,
  a9bfa70Va,
  a9bfa70FirstRetVa,
  a9bfa70RetVa,
  a9bfa70Int3Va,
  a9bfa70BodyBytes,
  a9bfa70Sites,
  a9bfa70Site0Va,
  a9bfa70Site1Va,
  a9bfa70Site2Va,
  a9bfa70Site3Va,
  a9bfa70NextVa,
  CBO9BA980_BITSET_OFS,
  CBO9BA980_BITSET_MASK,
  CBO9BA980_MANAGER_GLOBAL_VA,
  CBO9BA980_VA,
  CBO9BA980_FIRST_RET_VA,
  CBO9BA980_RET_VA,
  CBO9BA980_INT3_VA,
  CBO9BA980_BODY_BYTES,
  CBO9BA980_SITES,
  CBO9BA980_SITE0_VA,
  CBO9BA980_SITE1_VA,
  CBO9BA980_SITE2_VA,
  CBO9BA980_NEXT_VA,
  cbo9ba980FlagBit4Set,
  cbo9ba980ResultTrue,
  cbo9ba980ResultFalse,
  cbo9ba980BitsetOfs,
  cbo9ba980BitsetMask,
  cbo9ba980ManagerGlobalVa,
  cbo9ba980Va,
  cbo9ba980FirstRetVa,
  cbo9ba980RetVa,
  cbo9ba980Int3Va,
  cbo9ba980BodyBytes,
  cbo9ba980Sites,
  cbo9ba980Site0Va,
  cbo9ba980Site1Va,
  cbo9ba980Site2Va,
  cbo9ba980NextVa,
  A9C6110_VA,
  A9C6110_FIRST_RET_VA,
  A9C6110_RET_VA,
  A9C6110_INT3_VA,
  A9C6110_BODY_BYTES,
  A9C6110_SITES,
  A9C6110_POINTER_REF_VA,
  A9C6110_HOST_WALK_VA,
  A9C6110_WALK_OWNER_VA,
  A9C6110_STATE_OFS,
  A9C6110_FIELD8_OFS,
  A9C6110_MATCH_STATE,
  A9C6110_VALUE_TWO,
  A9C6110_VALUE_FOUR,
  A9C6110_NEXT_VA,
  a9c6110Gate,
  a9c6110Value,
  a9c6110NextState,
  a9c6110Field8Ofs,
  a9c6110StateOfs,
  a9c6110MatchState,
  a9c6110ValueTwo,
  a9c6110ValueFour,
  a9c6110Va,
  a9c6110FirstRetVa,
  a9c6110RetVa,
  a9c6110Int3Va,
  a9c6110BodyBytes,
  a9c6110Sites,
  a9c6110PointerRefVa,
  a9c6110HostWalkVa,
  a9c6110WalkOwnerVa,
  a9c6110NextVa,
} from "../scripts/decomp/process-input-pure-model.mjs";



import {



  PROCESS_INPUT_RESIDUAL_PLAN_VERSION,



  PROCESS_INPUT_RESIDUAL_PURE_ABI,



  PROCESS_INPUT_A1F280_RESIDUAL_NOTE,



  A1F280_RESIDUAL_NONE,



  A1F280_RESIDUAL_READY_VCALL,



  A1F280_RESIDUAL_FILL_AXIS,



  A1F280_RESIDUAL_MONOLITHIC,



  A1F280_PURE_POSTS_PE_ORDER,



  A1F280_PURE_HELPER_BY_POST,



  A1F280_PURE_HELPER_NAMES,



  A1F280_HOST_VA_ENTRY,



  A1F280_HOST_VA_READY,



  A1F280_HOST_VA_FILL_PAIR1,



  A1F280_HOST_VA_AXIS_PAIR1,



  A1F280_HOST_VA_ACTION_QUERY,



  a1f280HostVas,



  a1f280PurePostsInterleaveDoc,



  a1f280PurePostsFromEvent,



  a1f280ResidualLabel,



  a1f280ResidualPlan,



  applyA1f280VcallGatePurePosts,



  normalizeA1f280GateSamples,



} from "../scripts/decomp/process-input-residual.mjs";







const root = join(dirname(fileURLToPath(import.meta.url)), "..");



const header = join(root, "native", "decomp", "process_input_pure_helpers.h");



const source = join(root, "native", "decomp", "process_input_pure_helpers.cpp");



const outDir = join(root, "output", "decomp", "process-input-pure");



const wasmPath = join(outDir, "process-input-pure-helpers.wasm");







/* Wasm scratch bases. Everything here must sit at 0x100000 (1 MiB) or above:



 * a pure-helper module keeps its switch/jump tables and constant data in low



 * linear memory, and emscripten places a 64 KiB shadow stack immediately after



 * static data, so buffers at 4 KiB / 8 KiB / 16 KiB / 20 KiB (what this file



 * used before ABI v21) silently corrupt either module tables or helper locals.



 * Both failure modes are silent: arithmetic-only helpers keep passing. */



const SCRATCH_DEVICE_RANGES = 0x100000;



const SCRATCH_PROBE_LADDER = 0x101000;



const SCRATCH_A220C0_SEQ = 0x102000;



const SCRATCH_A220C0_LADDER = 0x103000;



const SCRATCH_9C3990_NODES = 0x104000;



const SCRATCH_HOOK_REPACK = 0x105000;



const SCRATCH_TEARDOWN_PLAN = 0x106000;







function firstExisting(paths, label) {



  const found = paths.find((path) => path && existsSync(path));



  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);



  return found;



}







const EXPORTS = [



  "isaac_input_map_node_present",



















  "isaac_input_mask_combine",



  "isaac_input_device_range_contains",



  "isaac_input_get_device_type_ranges",



  "isaac_manager_gate_6f9730",



  "isaac_manager_update_early_skip",



  "isaac_manager_early_counter_next",



  "isaac_manager_float_approach",



  "isaac_manager_poll_prefix_needed",



  "isaac_manager_poll_platform_uses_a69f60",



  "isaac_manager_poll_a6de60_body_needed",



  "isaac_manager_poll_a6de60_vector_count",



  "isaac_manager_poll_a6de60_loop_needed",



  "isaac_manager_poll_a6de60_device_enabled",



  "isaac_manager_poll_a6de60_query_ok",



  "isaac_manager_poll_a6de60_button_bit",



  "isaac_manager_poll_a6de60_button_slot_shift",



  "isaac_manager_poll_a6de60_button_edge",



  "isaac_manager_poll_a6de60_axis_normalize_i16",



  "isaac_manager_poll_a6de60_axis_normalize_u8",



  "isaac_manager_poll_a6de60_float_changed",



  "isaac_manager_poll_a6de60_float_callback_needed",



  "isaac_manager_poll_a6de60_dierr_reacquire",



  "isaac_manager_poll_a6de60_index_continue",



  "isaac_manager_poll_a6de60_axis_type_dispatch",



  "isaac_manager_poll_a6de60_device_continue",



  "isaac_manager_poll_a6de60_query_uses_hook",



  "isaac_manager_poll_a6de60_qpc_freq_init_needed",



  "isaac_manager_poll_a6de60_u64_to_f64",



  "isaac_manager_poll_a6de60_qpc_seconds_f64",



  "isaac_manager_poll_a6de60_com_succeeded",



  "isaac_manager_poll_a6de60_buffered_mode",



  "isaac_manager_poll_a6de60_didod_alloc_size",



  "isaac_manager_poll_a6de60_timestamp_to_seconds_f64",



  "isaac_manager_poll_a6de60_nonzero_bit",



  "isaac_manager_poll_a6de60_pov_axis0",



  "isaac_manager_poll_a6de60_pov_axis1",



  "isaac_manager_poll_a6de60_hook_repack",



  "isaac_manager_poll_a6de60_hook_repack_dw0",



  "isaac_manager_poll_a6de60_hook_repack_dw1",



  "isaac_manager_poll_a6de60_hook_repack_dw2",



  "isaac_manager_poll_a6de60_didod_ofs_match",



  "isaac_manager_poll_a6de60_axis_map_is_pov",



  "isaac_manager_poll_a6de60_query_fail_clear_value",



  "isaac_manager_poll_a6da10_index_after_remove",



  "isaac_manager_poll_a6da10_disconnect_cb_needed",



  "isaac_manager_poll_a6da10_free_com_maps",



  "isaac_manager_poll_a6da10_remove_move_bytes",



  "isaac_manager_poll_a6da10_end_after_remove",



  "isaac_manager_poll_a648b0_mode",



  "isaac_manager_poll_a648b0_alloc_malloc_size",



  "isaac_manager_poll_a648b0_tracker_sub_size",



  "isaac_manager_poll_a648b0_tracker_add",



  "isaac_manager_poll_a1fc00_lock_obj_present",



  "isaac_manager_poll_a1fc00_queue_loop_needed",



  "isaac_manager_poll_a1fc00_queue_count",



  "isaac_manager_poll_a1fc00_entry_already_active",



  "isaac_manager_poll_a1fc00_entry_mark_active",



  "isaac_manager_poll_a1fc00_slot_table_usable",



  "isaac_manager_poll_a1fc00_slot_is_free",



  "isaac_manager_poll_a1fc00_slot_index_continue",



  "isaac_manager_poll_a1fc00_slot_find_free",



  "isaac_manager_poll_a1fc00_queue_end_after_erase",



  "isaac_manager_poll_a1fc00_iter_advance",



  "isaac_manager_poll_a1fc00_iter_continue",



  "isaac_manager_poll_a1fc00_pending_needs_grow",



  "isaac_manager_poll_a1fc00_pending_end_after_push",



  "isaac_manager_poll_a1fc00_pending_capacity_bytes",



  "isaac_manager_poll_a1fc00_free_uses_heap_header",



  "isaac_manager_poll_a1fc00_free_header_size",



  "isaac_manager_poll_a1fc00_free_header_offset_ok",



  "isaac_manager_poll_a1fc00_notify_cb_needed",



  "isaac_manager_poll_a1f280_buffer_bytes",



  "isaac_manager_poll_a1f280_axis_dir",



  "isaac_manager_poll_a1f280_axis_pair_bits",



  "isaac_manager_poll_a1f280_buffer_count",



  "isaac_manager_poll_a1eed0_deadzone_remap",



  "isaac_manager_poll_a1f280_axis_neg_part",



  "isaac_manager_poll_a1f280_axis_pos_part",



  "isaac_manager_poll_a1f280_action_mode_idle",



  "isaac_manager_poll_a1f280_action_id_valid",



  "isaac_manager_poll_a1f280_buffer_index_in_range",



  "isaac_manager_poll_a1f280_buffer_slot_offset",



  "isaac_manager_poll_a1f280_rumble_path_needed",



  "isaac_manager_poll_a1f280_timer_positive",



  "isaac_manager_poll_a1f280_timer_clamp_nonneg",



  "isaac_manager_poll_a68490_ns_f64",



  "isaac_manager_poll_a1f280_scale_tick_lo",



  "isaac_manager_poll_a1f280_scale_tick_hi",



  "isaac_manager_poll_a1f280_scale_tick",



  "isaac_manager_poll_a1f280_tick_delta_lo",



  "isaac_manager_poll_a1f280_tick_delta_hi",



  "isaac_manager_poll_a1f280_tick_delta",



  "isaac_manager_poll_a1f280_tick_delta_nonzero",



  "isaac_manager_poll_a1f280_tick_delta_seconds_f32",



  "isaac_manager_poll_a1f280_timer_sub_delta",



  "isaac_manager_poll_a1f280_rumble_intensity_active",



  "isaac_manager_poll_a1f280_rumble_vcall_timer",



  "isaac_manager_poll_a1f280_rumble_vcall_intensity",



  "isaac_manager_poll_a1f280_rumble_vcall_args",



  "isaac_manager_poll_a1f280_rumble_timer_after_gate",



  "isaac_manager_poll_a1f280_rumble_neg_timer_path",



  "isaac_manager_poll_a1f280_baseline_store",



  "isaac_manager_poll_a1f280_success_return",



  "isaac_manager_poll_a1f280_rumble_vtbl_slot",



  "isaac_a112c0_reenter_skip",



  "isaac_a112c0_sink_active",



  "isaac_a112c0_body_needed",



  "isaac_a112c0_init_needed",



  "isaac_a112c0_state_after_init",



  "isaac_a112c0_prefix_enabled",



  "isaac_a112c0_prefix_va",



  "isaac_a112c0_ods_needed",



  "isaac_a112c0_sink_write_needed",



  "isaac_a112c0_buf_remaining",



  "isaac_a112c0_trail_newline",



  "isaac_a112c0_host_va",



  "isaac_a112c0_fmt_va",



  "isaac_a112c0_buf_cap",



  "isaac_a112c0_level_assert",



  "isaac_a112c0_msg_va_invalid_mutex",



  "isaac_a112c0_msg_va_action_id_oor",



  "isaac_manager_poll_a1f280_action_id_oor_log_needed",



  "isaac_manager_poll_a1f280_action_query_vcall_needed",



  "isaac_manager_poll_a1f280_action_query_vcall_arg",



  "isaac_manager_poll_a1f280_action_query_vtbl_slot",



  "isaac_manager_poll_a1f280_action_query_call_va",



  "isaac_manager_poll_a1f280_action_index_after_push",



  "isaac_manager_poll_a1f280_action_mode_after_push",



  "isaac_manager_poll_a1f280_fill_vcall_ok",



  "isaac_manager_poll_a1f280_fill_pair1_arg",



  "isaac_manager_poll_a1f280_fill_pair0_arg",



  "isaac_manager_poll_a1f280_fill_vtbl_slot",



  "isaac_manager_poll_a1f280_fill_call_va",



  "isaac_manager_poll_a1f280_fill_pair0_call_va",



  "isaac_manager_poll_a1f280_axis_fill_vtbl_slot",



  "isaac_manager_poll_a1f280_fill_axis_store_base_pair1",



  "isaac_manager_poll_a1f280_fill_dir_bit_base_pair1",



  "isaac_manager_poll_a1f280_axis_fill_call_va",



  "isaac_manager_poll_a1f280_axis_fill_pair0_call_va",



  "isaac_manager_poll_a1eed0_axis_fill_call_va",



  "isaac_manager_poll_a1f280_axis_fill_out_float_count",



  "isaac_manager_poll_a1f280_axis_fill_out_x_ofs",



  "isaac_manager_poll_a1f280_axis_fill_out_y_ofs",



  "isaac_manager_poll_a1f280_dir_thresh_ofs",



  "isaac_manager_poll_a1f280_remap_thresh_ofs",



  "isaac_manager_poll_a1f280_dir_bits_ofs",



  "isaac_manager_poll_a1f280_fill_axis_store_base_pair0",



  "isaac_manager_poll_a1f280_fill_dir_bit_base_pair0",



  "isaac_manager_poll_a1f280_dir_bits_merge",



  "isaac_manager_poll_a1f280_ready_vcall_ok",



  "isaac_manager_poll_a1f280_ready_early_return",



  "isaac_manager_poll_a1f280_ready_vtbl_slot",



  "isaac_manager_poll_a1f280_ready_call_va",



  "isaac_manager_poll_a648b0_tracker_base",



  "isaac_manager_poll_a648b0_account_target",



  "isaac_manager_poll_a648b0_alloc_clamp_needed",



  "isaac_manager_poll_a648b0_alloc_size_clamped_lo",



  "isaac_manager_poll_a648b0_alloc_malloc_size_hi",



  "isaac_manager_poll_a648b0_alloc_ok",



  "isaac_manager_poll_a648b0_alloc_header_value",



  "isaac_manager_poll_a648b0_alloc_payload_ptr",



  "isaac_manager_poll_a648b0_alloc_return",



  "isaac_manager_poll_a648b0_free_needed",



  "isaac_manager_poll_a648b0_free_block_ptr",



  "isaac_manager_poll_a648b0_header_bytes",



  "isaac_manager_poll_a648b0_oom_code",



  "isaac_manager_poll_a648b0_oom_host_va",



  "isaac_manager_poll_a648b0_malloc_iat_va",



  "isaac_manager_poll_a648b0_free_iat_va",



  "isaac_manager_poll_a6da10_slot_byte_offset",



  "isaac_manager_poll_a6da10_slot_addr",



  "isaac_manager_poll_a6da10_memmove_dst",



  "isaac_manager_poll_a6da10_memmove_src",



  "isaac_manager_poll_a6da10_teardown_step_count",



  "isaac_manager_poll_a6da10_teardown_plan",



  "isaac_manager_poll_a6da10_com_release_vtbl_slot",



  "isaac_manager_poll_a6dd30_axis_base_ofs",



  "isaac_manager_poll_a6dd30_axis_slot_offset",



  "isaac_manager_poll_a6dd30_axis_slot_offset_y",



  "isaac_manager_poll_a6dd30_index_after_x",



  "isaac_manager_poll_a6dd30_cb_needed",



  "isaac_manager_poll_a6dd30_cb_frame_bytes",



  "isaac_manager_poll_a6dd30_cb_arg_ofs",



  "isaac_manager_poll_a6dab0_scan_enabled",



  "isaac_manager_poll_a6dab0_pump_needed",



  "isaac_manager_poll_a6dab0_enum_needed",



  "isaac_manager_poll_a6dab0_enum_flag_after",



  "isaac_manager_poll_a6dab0_slot_scan_needed",



  "isaac_manager_poll_a6dab0_slot_continue",



  "isaac_manager_poll_a6dab0_slot_table_addr",



  "isaac_manager_poll_a6dab0_name_table_addr",



  "isaac_manager_poll_a6dab0_slot_clear_value",



  "isaac_manager_poll_a6dab0_query_ok",



  "isaac_manager_poll_a6dab0_record_present",



  "isaac_manager_poll_a6dab0_connect_needed",



  "isaac_manager_poll_a6dab0_disconnect_needed",



  "isaac_manager_poll_a6dab0_caps_mode_ok",



  "isaac_manager_poll_a6dab0_caps_call_needed",



  "isaac_manager_poll_a6dab0_caps_ok",



  "isaac_manager_poll_a6dab0_id_word",



  "isaac_manager_poll_a6dab0_next_device_id",



  "isaac_manager_poll_a6dab0_state_enable_value",



  "isaac_manager_poll_a6dab0_record_field_ofs",



  "isaac_manager_poll_a6dab0_state_field_ofs",



  "isaac_manager_poll_a6dab0_axis_calloc_args",



  "isaac_manager_poll_a6dab0_button_calloc_args",



  "isaac_manager_poll_a6dab0_push_needs_grow",



  "isaac_manager_poll_a6dab0_end_after_push",



  "isaac_manager_poll_a6dab0_connect_cb_needed",



  "isaac_manager_poll_a6dab0_search_loop_needed",



  "isaac_manager_poll_a6dab0_search_index_continue",



  "isaac_manager_poll_a6dab0_vector_find",



  "isaac_manager_poll_a6dab0_slot_count",



  "isaac_manager_poll_a6dab0_enum_vtbl_slot",



  "isaac_manager_poll_a6dab0_enum_callback_va",



  "isaac_manager_poll_a6dab0_msg_va_enum_fail",



  "isaac_manager_poll_a6dab0_msg_va_connect",



  "isaac_manager_poll_a6dab0_msg_va_caps_fail",



  "isaac_manager_poll_a220c0_thread_run",



  "isaac_manager_poll_a220c0_thread_continue",



  "isaac_manager_poll_a220c0_spawn_needed",



  "isaac_manager_poll_a220c0_flag_after_start",



  "isaac_manager_poll_a220c0_flag_after_stop",



  "isaac_manager_poll_a220c0_scan_iterations",



  "isaac_manager_poll_a220c0_sleep_ms",



  "isaac_manager_poll_a220c0_thread_proc_va",



  "isaac_manager_poll_a220c0_spawn_vtbl_slot",



  "isaac_manager_poll_a6cf80_init_skip",



  "isaac_manager_poll_a6cf80_probe_name_va",



  "isaac_manager_poll_a6cf80_mode_for_probe",



  "isaac_manager_poll_a6cf80_select_probe",



  "isaac_manager_poll_a6cf80_mode_after_probes",



  "isaac_manager_poll_a6cf80_log_level_for_mode",



  "isaac_manager_poll_a6cf80_log_msg_va_for_mode",



  "isaac_manager_poll_a6cf80_scan_flag_after",



  "isaac_manager_poll_a6cf80_caps_hook_probe_needed",



  "isaac_manager_poll_a6cf80_hook_slot_target_va",



  "isaac_manager_poll_a6cf80_hook_slot_name_va",



  "isaac_manager_poll_a6cf80_hook_slot_ordinal",



  "isaac_manager_poll_a6cf80_coinit_retry_needed",



  "isaac_manager_poll_a6cf80_enable_after_init",



  "isaac_manager_poll_a6cf80_enum_flag_after_init",



  "isaac_manager_poll_a6cf80_probe_count",



  "isaac_manager_poll_a6cf80_coinit_flags_first",



  "isaac_manager_poll_a6cf80_coinit_flags_retry",



  "isaac_manager_poll_a6cf80_notify_filter_bytes",



  "isaac_manager_poll_a6cf80_notify_filter_cbsize",



  "isaac_manager_shell_receiver_ofs",



  "isaac_manager_shell_receiver_addr",



  "isaac_manager_approach_slot_addr",



  "isaac_manager_approach_slot_continue",



  "isaac_manager_approach_uses_add_path",



  "isaac_manager_approach_host_call_needed",



  "isaac_manager_approach_host_arg_slot",



  "isaac_manager_shell_flag_b_after_loop",



  "isaac_manager_shell_probe_needed",



  "isaac_manager_shell_sub_90b150_blocks",



  "isaac_manager_shell_state_uses_game",



  "isaac_manager_shell_game_present",



  "isaac_manager_shell_silent_return",



  "isaac_manager_shell_state_index",



  "isaac_manager_shell_state_in_table",



  "isaac_manager_shell_state_target_va",



  "isaac_manager_shell_state_table_va",



  "isaac_manager_shell_state_default_va",



  "isaac_manager_approach_slot_count",



  "isaac_manager_approach_slot_stride",



  "isaac_manager_poll_a6dd30_x_cb_ran",



  "isaac_manager_poll_a6dd30_y_axis_base",



  "isaac_manager_poll_a6dd30_y_cb_ptr",



  "isaac_manager_poll_a6dd30_y_cb_needed",



  "isaac_manager_poll_a6dd30_timestamp_is_stable",



  "isaac_manager_poll_a1f280_action_slot_mode_cc",



  "isaac_manager_poll_a1f280_action_store_base",



  "isaac_manager_poll_a1f280_action_store_addr",



  "isaac_manager_poll_a1f280_action_count_is_prelog",



  "isaac_manager_state2_blocked",



  "isaac_manager_state2_parity_alt",



  "isaac_manager_state2_sweep_needed",



  "isaac_manager_state2_sweep_step",



  "isaac_manager_state2_entity_slot_addr",



  "isaac_manager_state2_entity_needs_fixup",



  "isaac_manager_state2_fixup_src_ofs",



  "isaac_manager_state2_fixup_dst_ofs",



  "isaac_manager_state2_entity_flag_after_fixup",



  "isaac_manager_9505e0_gate",



  "isaac_manager_9505e0_reads_b_pair",



  "isaac_manager_9505e0_field_ofs",



  "isaac_manager_9505e0_manager_ofs",



  "isaac_manager_9c3990_node_matches",



  "isaac_manager_9c3990_walk_continue",



  "isaac_manager_9c3990_result",



  "isaac_manager_9c3990_scanned",



  "isaac_manager_9c3990_unlock_always",



  "isaac_manager_9c3990_lock_arg",



  "isaac_manager_9c3990_lock_vtbl_slot",



  "isaac_manager_9c3990_unlock_vtbl_slot",



  "isaac_manager_state1_second_gate_needed",



  "isaac_manager_state1_mode_read_unconditional",



  "isaac_manager_state1_terminal_needed",



  "isaac_manager_state1_terminal_needed_from_fields",



  "isaac_manager_state2_head_gate_needed",



  "isaac_manager_state2_head_terminal_needed",



  "isaac_manager_state2_head_terminal_needed_from_fields",



  "isaac_manager_shell_arm_recv_ofs",



  "isaac_manager_shell_arm_call_va",



  "isaac_manager_state1_terminal_va",



  "isaac_manager_state2_head_terminal_va",



  "isaac_manager_predispatch_call_needed",



  "isaac_manager_predispatch_obj_after",



  "isaac_manager_predispatch_suppress_after",



  "isaac_manager_predispatch_queue_gate_reached",



  "isaac_manager_predispatch_forces_default",



  "isaac_manager_predispatch_dispatches",



  "isaac_manager_predispatch_field_ofs",



  "isaac_manager_state2_game_null_guarded",



  "isaac_manager_state2_mid_parity_gate_needed",



  "isaac_manager_state2_mid_dispatch_needed",



  "isaac_manager_state2_mid_mode_is_two",



  "isaac_manager_state2_mid_parity_bit",



  "isaac_manager_state2_mid_write_byte_needed",



  "isaac_manager_state2_mid_call_a_va",



  "isaac_manager_state2_mid_call_b_va",



  "isaac_manager_state2_mid_parity_call_va",



  "isaac_manager_state2_mid_is_paused_va",



  "isaac_manager_state2_mid_obj_inner_ofs",



  "isaac_manager_state2_mid_obj_byte_ofs",



  "isaac_manager_state2_mid_mode_ofs",



  "isaac_manager_shell_angle_wrap_count",



  "isaac_manager_shell_angle_wrap_active",



  "isaac_manager_shell_angle_wrap_slot",



  "isaac_manager_shell_approach_tail_needed",



  "isaac_manager_shell_approach_tail_store_needed",



  "isaac_manager_shell_approach_tail_next",



  "isaac_manager_shell_approach_tail_host_va",



  "isaac_manager_shell_approach_tail_recv_ofs",



  "isaac_manager_shell_approach_tail_value_ofs",



  "isaac_manager_shell_approach_tail_step_ofs",



  "isaac_manager_state2_tail_call_a_va",



  "isaac_manager_state2_tail_call_a_recv_ofs",



  "isaac_manager_state2_tail_call_b_needed",



  "isaac_manager_state2_tail_call_b_va",



  "isaac_manager_state2_tail_call_b_recv_global_va",



  "isaac_manager_state2_tail_call_b_arg_edx",



  "isaac_manager_state2_tail_anim_va",



  "isaac_manager_state2_tail_play_va",



  "isaac_manager_state2_tail_play_recv_ofs",



  "isaac_manager_state2_tail_play_anim_idle_va",



  "isaac_manager_state2_tail_play_anim_clicked_va",



  "isaac_manager_state2_tail_play_reset_arg",



  "isaac_manager_shell_tail_win_assert_needed",



  "isaac_manager_shell_tail_wassert_msg_va",



  "isaac_manager_shell_tail_wassert_file_va",



  "isaac_manager_shell_tail_wassert_line",



  "isaac_manager_shell_tail_wassert_iat_va",



  "isaac_manager_shell_tail_win_global_va",



  "isaac_manager_shell_tail_uses_platform_poll",



  "isaac_manager_shell_tail_platform_poll_va",



  "isaac_manager_shell_tail_platform_poll_arg0",



  "isaac_manager_shell_tail_platform_poll_arg1",



  "isaac_manager_shell_tail_platform_flag_va",



  "isaac_manager_shell_tail_direct_copy_needed",



  "isaac_manager_shell_tail_kind_ofs",



  "isaac_manager_shell_tail_kind_magic",



  "isaac_manager_shell_tail_d0_ofs",



  "isaac_manager_shell_tail_d1_ofs",



  "isaac_manager_shell_tail_platform_query_va",



  "isaac_manager_shell_tail_float_of_f64",



  "isaac_manager_shell_tail_lane_ordered_equal",



  "isaac_manager_shell_tail_both_lanes_equal",



  "isaac_manager_shell_tail_timer_next",



  "isaac_manager_shell_tail_timer_ofs",



  "isaac_manager_shell_tail_timer_reset_value",



  "isaac_manager_shell_tail_store_f0_ofs",



  "isaac_manager_shell_tail_store_f1_ofs",



  "isaac_manager_shell_tail_parity_next",



  "isaac_manager_shell_tail_parity_ofs",



  "isaac_manager_prepoll_state4_store_needed",



  "isaac_manager_prepoll_g1_needed",



  "isaac_manager_prepoll_g2_needed",



  "isaac_manager_prepoll_host_c_needed",



  "isaac_manager_prepoll_state3_transition_needed",



  "isaac_manager_prepoll_g3_needed",



  "isaac_manager_prepoll_state5_transition_needed",



  "isaac_manager_prepoll_arm_select",



  "isaac_manager_prepoll_copy_block_needed",



  "isaac_manager_prepoll_g4_needed",



  "isaac_manager_prepoll_game_b0_next",



  "isaac_manager_prepoll_log_needed",



  "isaac_manager_prepoll_nightmare_arg",



  "isaac_manager_prepoll_copy_src_ofs",



  "isaac_manager_prepoll_copy_src_dword_ofs",



  "isaac_manager_prepoll_state_ofs",



  "isaac_manager_prepoll_history_ofs",



  "isaac_manager_prepoll_g1_ofs",



  "isaac_manager_prepoll_cutscene_id_ofs",



  "isaac_manager_prepoll_g2_ofs",



  "isaac_manager_prepoll_copy_slot_index_ofs",



  "isaac_manager_prepoll_copy_src_base",



  "isaac_manager_prepoll_copy_src_dword",



  "isaac_manager_prepoll_copy_stride",



  "isaac_manager_prepoll_copy_dst_core_ofs",



  "isaac_manager_prepoll_copy_dst_dword_ofs",



  "isaac_manager_prepoll_copy_dst_ext_ofs",



  "isaac_manager_prepoll_copy_ext_from_ofs",



  "isaac_manager_prepoll_copy_flag_ofs",



  "isaac_manager_prepoll_copy_flag_value",



  "isaac_manager_prepoll_g3_ofs",



  "isaac_manager_prepoll_nightmare_arg_ofs",



  "isaac_manager_prepoll_g4_ofs",



  "isaac_manager_prepoll_state3arm_byte_ofs",



  "isaac_manager_prepoll_predispatch_recv_ofs",



  "isaac_manager_prepoll_state5_recv_ofs",



  "isaac_manager_prepoll_game_store_base_ofs",



  "isaac_manager_prepoll_game_store_b4_ofs",



  "isaac_manager_prepoll_game_store_b8_ofs",



  "isaac_manager_prepoll_game_store_bc_ofs",



  "isaac_manager_prepoll_game_store_b8_bits",



  "isaac_manager_prepoll_game_store_bc_value",



  "isaac_manager_prepoll_crossfade_recv_ofs",



  "isaac_manager_prepoll_crossfade_music_id",



  "isaac_manager_prepoll_crossfade_rate_bits",



  "isaac_manager_prepoll_host_a_va",



  "isaac_manager_prepoll_host_b_va",



  "isaac_manager_prepoll_host_c_va",



  "isaac_manager_prepoll_host_d_va",



  "isaac_manager_prepoll_host_e_va",



  "isaac_manager_prepoll_host_f_va",



  "isaac_manager_prepoll_host_g_va",



  "isaac_manager_prepoll_host_g_arg",



  "isaac_manager_prepoll_log_va",



  "isaac_manager_prepoll_log_level",



  "isaac_manager_prepoll_log_msg_va",



  "isaac_manager_prepoll_host_h_va",



  "isaac_manager_prepoll_state4_value",



  "isaac_manager_playerscan_count_from_bounds",



  "isaac_manager_playerscan_element_ptr",



  "isaac_manager_playerscan_match_needed",



  "isaac_manager_playerscan_state2_gate",



  "isaac_manager_playerscan_player_count_from_bounds",



  "isaac_manager_playerscan_log_needed",



  "isaac_manager_playerscan_release_gate",



  "isaac_manager_playerscan_callback_needed",



  "isaac_manager_playerscan_element_ctrl_ofs",



  "isaac_manager_playerscan_manager_store_ofs",



  "isaac_manager_playerscan_player_list_begin_ofs",



  "isaac_manager_playerscan_player_list_end_ofs",



  "isaac_manager_playerscan_vector_this_va",



  "isaac_manager_playerscan_vector_begin_va",



  "isaac_manager_playerscan_vector_end_va",



  "isaac_manager_playerscan_vector_lock_va",



  "isaac_manager_playerscan_vector_stride",



  "isaac_manager_playerscan_player_list_stride",



  "isaac_manager_playerscan_last_index_global_va",



  "isaac_manager_playerscan_release_callback_global_va",



  "isaac_manager_playerscan_manager_global_va",



  "isaac_manager_playerscan_game_global_va",



  "isaac_manager_playerscan_accessor_va",



  "isaac_manager_playerscan_set_controller_va",



  "isaac_manager_playerscan_set_controller_arg",



  "isaac_manager_playerscan_match_vcall_slot",



  "isaac_manager_playerscan_match_vcall_arg",



  "isaac_manager_playerscan_match_sentinel",



  "isaac_manager_playerscan_release_vcall_slot",



  "isaac_manager_playerscan_log_level",



  "isaac_manager_playerscan_log_msg_va",



  "isaac_manager_playerscan_state2_value",



  "isaac_manager_a0f550_r",



  "isaac_manager_a0f550_g",



  "isaac_manager_a0f550_b",



  "isaac_manager_a0f550_a",



  "isaac_manager_a0f550_channel_f32",



  "isaac_manager_a0f550_f0",



  "isaac_manager_a0f550_f1",



  "isaac_manager_a0f550_f2",



  "isaac_manager_a0f550_f3",



  "isaac_manager_a0f550_tail_store",



  "isaac_manager_a0f550_f0_ofs",



  "isaac_manager_a0f550_f1_ofs",



  "isaac_manager_a0f550_f2_ofs",



  "isaac_manager_a0f550_f3_ofs",



  "isaac_manager_a0f550_tail_ofs",



  "isaac_manager_a0f550_denom_bits",



  "isaac_manager_a0f550_denom_va",



  "isaac_manager_a0f550_signed_table_va",



  "isaac_manager_a0f550_va",



  "isaac_manager_a0f550_ret_va",



  "isaac_manager_a0f550_body_bytes",



  "isaac_manager_a0f550_next_va",



  "isaac_manager_959d00_body_needed",



  "isaac_manager_959d00_state2_needed",



  "isaac_manager_959d00_queue_nonempty",



  "isaac_manager_959d00_state2_island_needed",



  "isaac_manager_959d00_quiet_arg",



  "isaac_manager_959d00_host_907690_needed",



  "isaac_manager_959d00_menu_alloc_needed",



  "isaac_manager_959d00_menu_ctor_needed",



  "isaac_manager_959d00_flag_ofs",



  "isaac_manager_959d00_state_ofs",



  "isaac_manager_959d00_state2_value",



  "isaac_manager_959d00_queue_begin_ofs",



  "isaac_manager_959d00_queue_end_ofs",



  "isaac_manager_959d00_game_mode_ofs",



  "isaac_manager_959d00_game_26630_ofs",



  "isaac_manager_959d00_ext_ofs",



  "isaac_manager_959d00_ext_skip",



  "isaac_manager_959d00_core_ofs",



  "isaac_manager_959d00_f0_ofs",



  "isaac_manager_959d00_f1_ofs",



  "isaac_manager_959d00_f2_ofs",



  "isaac_manager_959d00_dw_ofs",



  "isaac_manager_959d00_menu_global_va",



  "isaac_manager_959d00_menu_alloc_size",



  "isaac_manager_959d00_menu_store_core_ofs",



  "isaac_manager_959d00_menu_store_f0_ofs",



  "isaac_manager_959d00_menu_store_f1_ofs",



  "isaac_manager_959d00_menu_store_f2_ofs",



  "isaac_manager_959d00_menu_store_dw_ofs",



  "isaac_manager_959d00_menu_store_flag_ofs",



  "isaac_manager_959d00_menu_store_flag_value",



  "isaac_manager_959d00_state_after",



  "isaac_manager_959d00_flag_clear",



  "isaac_manager_959d00_manager_global_va",



  "isaac_manager_959d00_game_global_va",



  "isaac_manager_959d00_host_90cd10_va",



  "isaac_manager_959d00_host_90a8a0_va",



  "isaac_manager_959d00_host_907690_va",



  "isaac_manager_959d00_host_959670_va",



  "isaac_manager_959d00_host_91c770_va",



  "isaac_manager_959d00_host_a0f4c0_va",



  "isaac_manager_959d00_host_986450_va",



  "isaac_manager_959d00_host_987450_va",



  "isaac_manager_959d00_host_98aa30_va",



  "isaac_manager_959d00_va",



  "isaac_manager_959d00_ret_va",



  "isaac_manager_959d00_body_bytes",



  "isaac_manager_959d00_sites",



  "isaac_manager_959d00_next_va",



  "isaac_manager_959720_body_needed",



  "isaac_manager_959720_probe_needed",



  "isaac_manager_959720_probe_ok",



  "isaac_manager_959720_body_continue",



  "isaac_manager_959720_parity_inc_needed",



  "isaac_manager_959720_parity_next",



  "isaac_manager_959720_game_alloc_needed",



  "isaac_manager_959720_game_ctor_needed",



  "isaac_manager_959720_queue_nonempty",



  "isaac_manager_959720_host_6eef20_needed",



  "isaac_manager_959720_host_923450_needed",



  "isaac_manager_959720_join_arm",



  "isaac_manager_959720_join_parity_inc_needed",



  "isaac_manager_959720_flag_ofs",



  "isaac_manager_959720_probe_ofs",



  "isaac_manager_959720_parity_ofs",



  "isaac_manager_959720_queue_begin_ofs",



  "isaac_manager_959720_queue_end_ofs",



  "isaac_manager_959720_state_ofs",



  "isaac_manager_959720_state_after",



  "isaac_manager_959720_flag_4b131_ofs",



  "isaac_manager_959720_flag_4b132_ofs",



  "isaac_manager_959720_ptr_4b140_ofs",



  "isaac_manager_959720_dword_4b3e4_ofs",



  "isaac_manager_959720_recv_923450_ofs",



  "isaac_manager_959720_dword_4b1c0_ofs",



  "isaac_manager_959720_flag_4b19c_ofs",



  "isaac_manager_959720_word_4b284_ofs",



  "isaac_manager_959720_word_4b284_value",



  "isaac_manager_959720_flag_clear",



  "isaac_manager_959720_game_alloc_size",



  "isaac_manager_959720_manager_global_va",



  "isaac_manager_959720_game_global_va",



  "isaac_manager_959720_host_90c400_va",



  "isaac_manager_959720_host_959670_va",



  "isaac_manager_959720_host_a0f4c0_va",



  "isaac_manager_959720_host_6f1020_va",



  "isaac_manager_959720_host_6f4740_va",



  "isaac_manager_959720_host_90a8a0_va",



  "isaac_manager_959720_host_6eef20_va",



  "isaac_manager_959720_host_91c770_va",



  "isaac_manager_959720_host_923450_va",



  "isaac_manager_959720_host_6f6dd0_va",



  "isaac_manager_959720_host_6f7750_va",



  "isaac_manager_959720_host_6f5320_va",



  "isaac_manager_959720_arm_seed_then",



  "isaac_manager_959720_arm_host_6f5850",



  "isaac_manager_959720_arm_seed_else",



  "isaac_manager_959720_arm_4b132",



  "isaac_manager_959720_arm_daily",



  "isaac_manager_959720_arm_debug",



  "isaac_manager_959720_arm_start",



  "isaac_manager_959720_va",



  "isaac_manager_959720_ret_va",



  "isaac_manager_959720_body_bytes",



  "isaac_manager_959720_sites",



  "isaac_manager_959720_site_va",



  "isaac_manager_959720_next_va",



  "isaac_manager_959670_state_id",



  "isaac_manager_959670_state1_needed",



  "isaac_manager_959670_state2_needed",



  "isaac_manager_959670_game_present",



  "isaac_manager_959670_game_body_needed",



  "isaac_manager_959670_menu_present",



  "isaac_manager_959670_menu_body_needed",



  "isaac_manager_959670_exit_save_arg",



  "isaac_manager_959670_flag_4b285_clear",



  "isaac_manager_959670_value_store_needed",



  "isaac_manager_959670_host_429170_recv",



  "isaac_manager_959670_state_ofs",



  "isaac_manager_959670_state_other",



  "isaac_manager_959670_state_menu",



  "isaac_manager_959670_state_game",



  "isaac_manager_959670_flag_4b284_ofs",



  "isaac_manager_959670_flag_4b285_ofs",



  "isaac_manager_959670_recv_ofs",



  "isaac_manager_959670_value_ofs",



  "isaac_manager_959670_step_ofs",



  "isaac_manager_959670_value_store_bits",



  "isaac_manager_959670_step_store_bits",



  "isaac_manager_959670_target_va",



  "isaac_manager_959670_game_global_va",



  "isaac_manager_959670_menu_global_va",



  "isaac_manager_959670_menu_free_size",



  "isaac_manager_959670_menu_clear",



  "isaac_manager_959670_host_429170_ofs",



  "isaac_manager_959670_host_6fa0c0_va",



  "isaac_manager_959670_host_92e430_va",



  "isaac_manager_959670_host_429170_va",



  "isaac_manager_959670_host_986f30_va",



  "isaac_manager_959670_host_aef15c_va",



  "isaac_manager_959670_epilog_va",



  "isaac_manager_959670_manager_global_va",



  "isaac_manager_959670_va",



  "isaac_manager_959670_int3_va",



  "isaac_manager_959670_body_bytes",



  "isaac_manager_959670_first_ret_trap_bytes",



  "isaac_manager_959670_sites",



  "isaac_manager_959670_site0_va",



  "isaac_manager_959670_site1_va",



  "isaac_manager_959670_site2_va",



  "isaac_manager_959670_next_va",



  "isaac_cutscene_95e7c0_id_in_range",



  "isaac_cutscene_95e7c0_unload_needed",



  "isaac_cutscene_95e7c0_id_nonzero",



  "isaac_cutscene_95e7c0_show_body_needed",



  "isaac_cutscene_95e7c0_entry_ofs",



  "isaac_cutscene_95e7c0_queue_gt1",



  "isaac_cutscene_95e7c0_sso_inline",



  "isaac_cutscene_95e7c0_id_is_2",



  "isaac_cutscene_95e7c0_game_present",



  "isaac_cutscene_95e7c0_game_1bb88_needed",



  "isaac_cutscene_95e7c0_flag_e5_continue",



  "isaac_cutscene_95e7c0_vec_count",



  "isaac_cutscene_95e7c0_vec_loop_needed",



  "isaac_cutscene_95e7c0_id_max",



  "isaac_cutscene_95e7c0_entry_count",



  "isaac_cutscene_95e7c0_entry_stride",



  "isaac_cutscene_95e7c0_entries_ofs",



  "isaac_cutscene_95e7c0_state_ofs",



  "isaac_cutscene_95e7c0_queued_ofs",



  "isaac_cutscene_95e7c0_sso_cap",



  "isaac_cutscene_95e7c0_id_special",



  "isaac_cutscene_95e7c0_flag_e5_ofs",



  "isaac_cutscene_95e7c0_vec_begin_ofs",



  "isaac_cutscene_95e7c0_vec_end_ofs",



  "isaac_cutscene_95e7c0_game_1bb88_ofs",



  "isaac_cutscene_95e7c0_queue_begin_ofs",



  "isaac_cutscene_95e7c0_queue_end_ofs",



  "isaac_cutscene_95e7c0_queue_helper_va",



  "isaac_cutscene_95e7c0_recv_ofs",



  "isaac_cutscene_95e7c0_arg_ofs",



  "isaac_cutscene_95e7c0_music_index_ofs",



  "isaac_cutscene_95e7c0_music_stride",



  "isaac_cutscene_95e7c0_music_vol_ofs",



  "isaac_cutscene_95e7c0_music_rate_ofs",



  "isaac_cutscene_95e7c0_music_rate_bits",



  "isaac_cutscene_95e7c0_music_2a2cc_ofs",



  "isaac_cutscene_95e7c0_store_828_ofs",



  "isaac_cutscene_95e7c0_store_838_ofs",



  "isaac_cutscene_95e7c0_store_838_value",



  "isaac_cutscene_95e7c0_state_after",



  "isaac_cutscene_95e7c0_manager_global_va",



  "isaac_cutscene_95e7c0_game_global_va",



  "isaac_cutscene_95e7c0_host_960840_va",



  "isaac_cutscene_95e7c0_host_40e910_va",



  "isaac_cutscene_95e7c0_host_a112c0_va",



  "isaac_cutscene_95e7c0_host_95ead0_va",



  "isaac_cutscene_95e7c0_host_91c7e0_va",



  "isaac_cutscene_95e7c0_host_8fd750_va",



  "isaac_cutscene_95e7c0_host_4239b0_va",



  "isaac_cutscene_95e7c0_host_6eef60_va",



  "isaac_cutscene_95e7c0_va",



  "isaac_cutscene_95e7c0_ret_va",



  "isaac_cutscene_95e7c0_oob_ret_va",



  "isaac_cutscene_95e7c0_int3_va",



  "isaac_cutscene_95e7c0_body_bytes",



  "isaac_cutscene_95e7c0_first_ret_trap_bytes",



  "isaac_cutscene_95e7c0_sites",



  "isaac_cutscene_95e7c0_site_va",



  "isaac_cutscene_95e7c0_next_va",



  "isaac_nightmare_921ce0_players_count",



  "isaac_nightmare_921ce0_players_log_needed",



  "isaac_nightmare_921ce0_map_present",



  "isaac_nightmare_921ce0_map_found",



  "isaac_nightmare_921ce0_strncmp_ok",



  "isaac_nightmare_921ce0_gfx_needed",



  "isaac_nightmare_921ce0_sso_inline",



  "isaac_nightmare_921ce0_sprite_ofs",



  "isaac_nightmare_921ce0_dogma",



  "isaac_nightmare_921ce0_collectible_path_needed",



  "isaac_nightmare_921ce0_flag_4b1_continue",



  "isaac_nightmare_921ce0_bool_arg",



  "isaac_nightmare_921ce0_music_id",



  "isaac_nightmare_921ce0_stage_is_c",



  "isaac_nightmare_921ce0_stage_is_d",



  "isaac_nightmare_921ce0_owner_present",



  "isaac_nightmare_921ce0_map_key",



  "isaac_nightmare_921ce0_map_isnil_ofs",



  "isaac_nightmare_921ce0_map_key_ofs",



  "isaac_nightmare_921ce0_map_ofs",



  "isaac_nightmare_921ce0_players_begin_ofs",



  "isaac_nightmare_921ce0_players_end_ofs",



  "isaac_nightmare_921ce0_sso_cap",



  "isaac_nightmare_921ce0_strncmp_n",



  "isaac_nightmare_921ce0_sprite_stride",



  "isaac_nightmare_921ce0_index_ofs",



  "isaac_nightmare_921ce0_table_ofs",



  "isaac_nightmare_921ce0_base_ofs",



  "isaac_nightmare_921ce0_dogma_ofs",



  "isaac_nightmare_921ce0_bool_store_ofs",



  "isaac_nightmare_921ce0_flag_4b1_ofs",



  "isaac_nightmare_921ce0_flag_4bc_ofs",



  "isaac_nightmare_921ce0_flag_4bc_clear",



  "isaac_nightmare_921ce0_flag_4bc_set",



  "isaac_nightmare_921ce0_music_id_normal",



  "isaac_nightmare_921ce0_music_id_dogma",



  "isaac_nightmare_921ce0_music_recv_ofs",



  "isaac_nightmare_921ce0_music_vol_ofs",



  "isaac_nightmare_921ce0_stage_c",



  "isaac_nightmare_921ce0_stage_d",



  "isaac_nightmare_921ce0_collectible_id",



  "isaac_nightmare_921ce0_laz_tag",



  "isaac_nightmare_921ce0_anm2_load_graphics",



  "isaac_nightmare_921ce0_store_3a4_ofs",



  "isaac_nightmare_921ce0_store_3a4_value",



  "isaac_nightmare_921ce0_log_level",



  "isaac_nightmare_921ce0_log_msg_va",



  "isaac_nightmare_921ce0_path_va",



  "isaac_nightmare_921ce0_iat_strncmp_va",



  "isaac_nightmare_921ce0_game_global_va",



  "isaac_nightmare_921ce0_manager_global_va",



  "isaac_nightmare_921ce0_recv_ofs",



  "isaac_nightmare_921ce0_arg_ofs",



  "isaac_nightmare_921ce0_g3_ofs",



  "isaac_nightmare_921ce0_host_a112c0_va",



  "isaac_nightmare_921ce0_host_4288a0_va",



  "isaac_nightmare_921ce0_host_4074c0_va",



  "isaac_nightmare_921ce0_host_40bd50_va",



  "isaac_nightmare_921ce0_host_407f10_va",



  "isaac_nightmare_921ce0_host_9be080_va",



  "isaac_nightmare_921ce0_host_7e1d50_va",



  "isaac_nightmare_921ce0_host_aef15c_va",



  "isaac_nightmare_921ce0_host_a0f4c0_va",



  "isaac_nightmare_921ce0_va",



  "isaac_nightmare_921ce0_ret_va",



  "isaac_nightmare_921ce0_int3_va",



  "isaac_nightmare_921ce0_body_bytes",



  "isaac_nightmare_921ce0_first_ret_trap_bytes",



  "isaac_nightmare_921ce0_sites",



  "isaac_nightmare_921ce0_site_va",



  "isaac_nightmare_921ce0_sibling_va",



  "isaac_nightmare_921ce0_next_va",



  "isaac_fco_9be080_twin_walk_flag",



  "isaac_fco_9be080_list_empty",



  "isaac_fco_9be080_slot_checkable",



  "isaac_fco_9be080_has_collectible_hit",



  "isaac_fco_9be080_twin_present",



  "isaac_fco_9be080_twin_check_needed",



  "isaac_fco_9be080_walk_next",



  "isaac_fco_9be080_walk_continue",



  "isaac_fco_9be080_result_player",



  "isaac_fco_9be080_result_twin",



  "isaac_fco_9be080_result_not_found",



  "isaac_fco_9be080_item_config_ofs",



  "isaac_fco_9be080_get_collectible_va",

  "isaac_rco_9be140_list_empty",

  "isaac_rco_9be140_slot_checkable",

  "isaac_rco_9be140_has_collectible_hit",

  "isaac_rco_9be140_seed_assert_needed",

  "isaac_rco_9be140_xorshift_state",

  "isaac_rco_9be140_state_as_f64",

  "isaac_rco_9be140_next_float",

  "isaac_rco_9be140_best_update_needed",

  "isaac_rco_9be140_walk_next",

  "isaac_rco_9be140_walk_continue",

  "isaac_rco_9be140_out_present",

  "isaac_rco_9be140_winner_present",

  "isaac_rco_9be140_id_negative",

  "isaac_rco_9be140_collectible_count",

  "isaac_rco_9be140_collectible_id_oob",

  "isaac_rco_9be140_collectible_count_minus1",

  "isaac_rco_9be140_collectible_index_clamp",

  "isaac_rco_9be140_collectible_entry_ptr",

  "isaac_rco_9be140_result_player",

  "isaac_rco_9be140_list_begin_ofs",

  "isaac_rco_9be140_list_end_ofs",

  "isaac_rco_9be140_list_stride",

  "isaac_rco_9be140_slot_flag_ofs",

  "isaac_rco_9be140_collect_begin_ofs",

  "isaac_rco_9be140_collect_end_ofs",

  "isaac_rco_9be140_collect_stride",

  "isaac_rco_9be140_seed_assert_msg_va",

  "isaac_rco_9be140_oob_assert_msg_va",

  "isaac_rco_9be140_log_level",

  "isaac_rco_9be140_assert_trap_va",

  "isaac_rco_9be140_has_collectible_va",

  "isaac_rco_9be140_host_log_va",

  "isaac_rco_9be140_game_global_va",

  "isaac_rco_9be140_receiver_ofs",

  "isaac_rco_9be140_rng_shift_table_va",

  "isaac_rco_9be140_rng_shift1",

  "isaac_rco_9be140_rng_shift2",

  "isaac_rco_9be140_rng_shift3",

  "isaac_rco_9be140_best_init_bits",

  "isaac_rco_9be140_scale_bits",

  "isaac_rco_9be140_sign_corr_table_va",

  "isaac_rco_9be140_best_init_value",

  "isaac_rco_9be140_scale_value",

  "isaac_rco_9be140_va",

  "isaac_rco_9be140_ret_va",

  "isaac_rco_9be140_first_ret_va",

  "isaac_rco_9be140_int3_va",

  "isaac_rco_9be140_body_bytes",

  "isaac_rco_9be140_sites",

  "isaac_rco_9be140_next_va",

  "isaac_a9be2a0_players_count",

  "isaac_a9be2a0_id_mask15",

  "isaac_a9be2a0_direct_index_oor",

  "isaac_a9be2a0_direct_player_ptr",

  "isaac_a9be2a0_twin_flag",

  "isaac_a9be2a0_list_empty",

  "isaac_a9be2a0_slot_checkable",

  "isaac_a9be2a0_has_collectible_hit",

  "isaac_a9be2a0_twin_check_needed",

  "isaac_a9be2a0_walk_next",

  "isaac_a9be2a0_walk_continue",

  "isaac_a9be2a0_out_present",

  "isaac_a9be2a0_id_negative",

  "isaac_a9be2a0_collect_count",

  "isaac_a9be2a0_id_oob",

  "isaac_a9be2a0_log_needed",

  "isaac_a9be2a0_collect_count_minus1",

  "isaac_a9be2a0_collect_index_clamp",

  "isaac_a9be2a0_collect_entry_ptr",

  "isaac_a9be2a0_twin_result",

  "isaac_a9be2a0_result_not_found",

  "isaac_a9be2a0_result_player",

  "isaac_a9be2a0_store_zero_value",

  "isaac_a9be2a0_players_begin_ofs",

  "isaac_a9be2a0_players_end_ofs",

  "isaac_a9be2a0_list_begin_ofs",

  "isaac_a9be2a0_list_end_ofs",

  "isaac_a9be2a0_list_stride",

  "isaac_a9be2a0_slot_flag_ofs",

  "isaac_a9be2a0_item_flags_ofs",

  "isaac_a9be2a0_twin_bit",

  "isaac_a9be2a0_twin_ptr_ofs",

  "isaac_a9be2a0_collect_begin_ofs",

  "isaac_a9be2a0_collect_end_ofs",

  "isaac_a9be2a0_collect_stride",

  "isaac_a9be2a0_id_mask",

  "isaac_a9be2a0_manager_global_va",

  "isaac_a9be2a0_game_global_va",

  "isaac_a9be2a0_receiver_ofs",

  "isaac_a9be2a0_has_collectible_va",

  "isaac_a9be2a0_twin_get_va",

  "isaac_a9be2a0_host_log_va",

  "isaac_a9be2a0_oob_msg_va",

  "isaac_a9be2a0_log_level",

  "isaac_a9be2a0_va",

  "isaac_a9be2a0_ret_va",

  "isaac_a9be2a0_first_ret_va",

  "isaac_a9be2a0_int3_va",

  "isaac_a9be2a0_body_bytes",

  "isaac_a9be2a0_sites",

  "isaac_a9be2a0_site_va",

  "isaac_a9be2a0_next_va",

  "isaac_rto_9be3e0_list_empty",

  "isaac_rto_9be3e0_slot_checkable",

  "isaac_rto_9be3e0_has_collectible_hit",

  "isaac_rto_9be3e0_seed_assert_needed",

  "isaac_rto_9be3e0_xorshift_state",

  "isaac_rto_9be3e0_state_as_f64",

  "isaac_rto_9be3e0_next_float",

  "isaac_rto_9be3e0_best_update_needed",

  "isaac_rto_9be3e0_walk_next",

  "isaac_rto_9be3e0_walk_continue",

  "isaac_rto_9be3e0_out_present",

  "isaac_rto_9be3e0_winner_present",

  "isaac_rto_9be3e0_id_negative",

  "isaac_rto_9be3e0_collectible_count",

  "isaac_rto_9be3e0_collectible_id_oob",

  "isaac_rto_9be3e0_log_needed",

  "isaac_rto_9be3e0_collectible_count_minus1",

  "isaac_rto_9be3e0_collectible_index_clamp",

  "isaac_rto_9be3e0_collectible_entry_ptr",

  "isaac_rto_9be3e0_result_player",

  "isaac_rto_9be3e0_store_zero_value",

  "isaac_rto_9be3e0_list_begin_ofs",

  "isaac_rto_9be3e0_list_end_ofs",

  "isaac_rto_9be3e0_list_stride",

  "isaac_rto_9be3e0_slot_flag_ofs",

  "isaac_rto_9be3e0_collect_begin_ofs",

  "isaac_rto_9be3e0_collect_end_ofs",

  "isaac_rto_9be3e0_collect_stride",

  "isaac_rto_9be3e0_seed_assert_msg_va",

  "isaac_rto_9be3e0_oob_assert_msg_va",

  "isaac_rto_9be3e0_log_level",

  "isaac_rto_9be3e0_assert_trap_va",

  "isaac_rto_9be3e0_has_collectible_va",

  "isaac_rto_9be3e0_host_log_va",

  "isaac_rto_9be3e0_game_global_va",

  "isaac_rto_9be3e0_receiver_ofs",

  "isaac_rto_9be3e0_rng_shift_table_va",

  "isaac_rto_9be3e0_rng_shift1",

  "isaac_rto_9be3e0_rng_shift2",

  "isaac_rto_9be3e0_rng_shift3",

  "isaac_rto_9be3e0_best_init_bits",

  "isaac_rto_9be3e0_scale_bits",

  "isaac_rto_9be3e0_sign_corr_table_va",

  "isaac_rto_9be3e0_best_init_value",

  "isaac_rto_9be3e0_scale_value",

  "isaac_rto_9be3e0_va",

  "isaac_rto_9be3e0_ret_va",

  "isaac_rto_9be3e0_first_ret_va",

  "isaac_rto_9be3e0_int3_va",

  "isaac_rto_9be3e0_body_bytes",

  "isaac_rto_9be3e0_sites",

  "isaac_rto_9be3e0_next_va",

  "isaac_a9be530_list_empty",

  "isaac_a9be530_slot_checkable",

  "isaac_a9be530_flag202c_checkable",

  "isaac_a9be530_flag20a9_checkable",

  "isaac_a9be530_charge_ok",

  "isaac_a9be530_seed_assert_needed",

  "isaac_a9be530_xorshift_state",

  "isaac_a9be530_state_as_f64",

  "isaac_a9be530_next_float",

  "isaac_a9be530_best_update_needed",

  "isaac_a9be530_walk_next",

  "isaac_a9be530_walk_continue",

  "isaac_a9be530_result_player",

  "isaac_a9be530_list_begin_ofs",

  "isaac_a9be530_list_end_ofs",

  "isaac_a9be530_list_stride",

  "isaac_a9be530_slot_flag_ofs",

  "isaac_a9be530_flag202c_ofs",

  "isaac_a9be530_flag20a9_ofs",

  "isaac_a9be530_charge_ofs",

  "isaac_a9be530_charge_min",

  "isaac_a9be530_seed_assert_msg_va",

  "isaac_a9be530_log_level",

  "isaac_a9be530_assert_trap_va",

  "isaac_a9be530_host_log_va",

  "isaac_a9be530_rng_shift_table_va",

  "isaac_a9be530_rng_shift1",

  "isaac_a9be530_rng_shift2",

  "isaac_a9be530_rng_shift3",

  "isaac_a9be530_best_init_bits",

  "isaac_a9be530_scale_bits",

  "isaac_a9be530_sign_corr_table_va",

  "isaac_a9be530_best_init_value",

  "isaac_a9be530_scale_value",

  "isaac_a9be530_va",

  "isaac_a9be530_ret_va",

  "isaac_a9be530_first_ret_va",

  "isaac_a9be530_int3_va",

  "isaac_a9be530_body_bytes",

  "isaac_a9be530_sites",

  "isaac_a9be530_next_va",

  "isaac_a9be630_list_empty",

  "isaac_a9be630_slot_checkable",

  "isaac_a9be630_flag20a9_checkable",

  "isaac_a9be630_slot_matches",

  "isaac_a9be630_walk_next",

  "isaac_a9be630_walk_continue",

  "isaac_a9be630_result_notfound",

  "isaac_a9be630_result_found",

  "isaac_a9be630_list_begin_ofs",

  "isaac_a9be630_list_end_ofs",

  "isaac_a9be630_list_stride",

  "isaac_a9be630_slot_flag_ofs",

  "isaac_a9be630_flag20a9_ofs",

  "isaac_a9be630_slot_value_ofs",

  "isaac_a9be630_va",

  "isaac_a9be630_ret_va",

  "isaac_a9be630_first_ret_va",

  "isaac_a9be630_int3_va",

  "isaac_a9be630_body_bytes",

  "isaac_a9be630_sites",

  "isaac_a9be630_next_va",

  "isaac_a9be670_list_empty",

  "isaac_a9be670_slot_checkable",

  "isaac_a9be670_flag20a9_checkable",

  "isaac_a9be670_slot_equals_needle",

  "isaac_a9be670_walk_next",

  "isaac_a9be670_walk_continue",

  "isaac_a9be670_result_true",

  "isaac_a9be670_result_false",

  "isaac_a9be670_list_begin_ofs",

  "isaac_a9be670_list_end_ofs",

  "isaac_a9be670_list_stride",

  "isaac_a9be670_slot_flag_ofs",

  "isaac_a9be670_flag20a9_ofs",

  "isaac_a9be670_slot_value_ofs",

  "isaac_a9be670_slot_needle",

  "isaac_a9be670_va",

  "isaac_a9be670_ret_va",

  "isaac_a9be670_first_ret_va",

  "isaac_a9be670_int3_va",

  "isaac_a9be670_body_bytes",

  "isaac_a9be670_sites",

  "isaac_a9be670_next_va",

  "isaac_a9be6b0_list_empty",

  "isaac_a9be6b0_field_nonzero",

  "isaac_a9be6b0_field_eq_needle",

  "isaac_a9be6b0_flag2ef0_set",

  "isaac_a9be6b0_status_gt1",

  "isaac_a9be6b0_status_gt0",

  "isaac_a9be6b0_bl_forced",

  "isaac_a9be6b0_accept_needed",

  "isaac_a9be6b0_winner_store_needed",

  "isaac_a9be6b0_walk_next",

  "isaac_a9be6b0_walk_continue",

  "isaac_a9be6b0_result_player",

  "isaac_a9be6b0_result_winner",

  "isaac_a9be6b0_list_begin_ofs",

  "isaac_a9be6b0_list_end_ofs",

  "isaac_a9be6b0_list_stride",

  "isaac_a9be6b0_field_2ef8_ofs",

  "isaac_a9be6b0_flag_2ef0_ofs",

  "isaac_a9be6b0_query_arg1",

  "isaac_a9be6b0_query_arg2",

  "isaac_a9be6b0_status_call_va",

  "isaac_a9be6b0_query_call_va",

  "isaac_a9be6b0_va",

  "isaac_a9be6b0_ret_va",

  "isaac_a9be6b0_first_ret_va",

  "isaac_a9be6b0_int3_va",

  "isaac_a9be6b0_body_bytes",

  "isaac_a9be6b0_sites",

  "isaac_a9be6b0_next_va",

  "isaac_gnc_9be750_twin_flag",

  "isaac_gnc_9be750_list_empty",

  "isaac_gnc_9be750_slot_checkable",

  "isaac_gnc_9be750_count_add",

  "isaac_gnc_9be750_twin_call_needed",

  "isaac_gnc_9be750_walk_next",

  "isaac_gnc_9be750_walk_continue",

  "isaac_gnc_9be750_result_sum",

  "isaac_gnc_9be750_list_begin_ofs",

  "isaac_gnc_9be750_list_end_ofs",

  "isaac_gnc_9be750_list_stride",

  "isaac_gnc_9be750_slot_flag_ofs",

  "isaac_gnc_9be750_twin_ptr_ofs",

  "isaac_gnc_9be750_twin_flags_ofs",

  "isaac_gnc_9be750_twin_bit",

  "isaac_gnc_9be750_manager_global_va",

  "isaac_gnc_9be750_game_global_va",

  "isaac_gnc_9be750_receiver_ofs",

  "isaac_gnc_9be750_twin_container_ofs",

  "isaac_gnc_9be750_host_twin_get_va",

  "isaac_gnc_9be750_host_count_va",

  "isaac_gnc_9be750_va",

  "isaac_gnc_9be750_ret_va",

  "isaac_gnc_9be750_int3_va",

  "isaac_gnc_9be750_body_bytes",

  "isaac_gnc_9be750_sites",

  "isaac_gnc_9be750_site_va",

  "isaac_gnc_9be750_next_va",
  "isaac_hte_9be7f0_list_empty",

  "isaac_hte_9be7f0_slot_checkable",

  "isaac_hte_9be7f0_flag1519_checkable",

  "isaac_hte_9be7f0_vec_not_empty",

  "isaac_hte_9be7f0_entry_hit",

  "isaac_hte_9be7f0_vec_walk_next",

  "isaac_hte_9be7f0_vec_walk_continue",

  "isaac_hte_9be7f0_walk_next",

  "isaac_hte_9be7f0_walk_continue",

  "isaac_hte_9be7f0_result_found",

  "isaac_hte_9be7f0_result_not_found",

  "isaac_hte_9be7f0_list_begin_ofs",

  "isaac_hte_9be7f0_list_end_ofs",

  "isaac_hte_9be7f0_list_stride",

  "isaac_hte_9be7f0_slot_flag_ofs",

  "isaac_hte_9be7f0_flag1519_ofs",

  "isaac_hte_9be7f0_vec_begin_ofs",

  "isaac_hte_9be7f0_vec_end_ofs",

  "isaac_hte_9be7f0_vec_stride",

  "isaac_hte_9be7f0_va",

  "isaac_hte_9be7f0_first_ret_va",

  "isaac_hte_9be7f0_ret_va",

  "isaac_hte_9be7f0_int3_va",

  "isaac_hte_9be7f0_body_bytes",

  "isaac_hte_9be7f0_sites",

  "isaac_hte_9be7f0_site_va",

  "isaac_hte_9be7f0_site2_va",

  "isaac_hte_9be7f0_next_va",

  "isaac_a9be850_list_count",

  "isaac_a9be850_loop_needed",

  "isaac_a9be850_host_gate_needed",

  "isaac_a9be850_slot_present",

  "isaac_a9be850_twin_present",

  "isaac_a9be850_flag1519_clear",

  "isaac_a9be850_twin_vec_not_empty",

  "isaac_a9be850_marker_hit",

  "isaac_a9be850_vec_walk_next",

  "isaac_a9be850_vec_walk_continue",

  "isaac_a9be850_walk_next",

  "isaac_a9be850_walk_continue",

  "isaac_a9be850_list_begin_ofs",

  "isaac_a9be850_list_end_ofs",

  "isaac_a9be850_list_stride",

  "isaac_a9be850_manager_global_va",

  "isaac_a9be850_vec_a_begin_ofs",

  "isaac_a9be850_vec_a_end_ofs",

  "isaac_a9be850_vec_a_slot_ofs",

  "isaac_a9be850_host_gate_threshold",

  "isaac_a9be850_host_gate_mask",

  "isaac_a9be850_slot_field_ofs",

  "isaac_a9be850_host_receiver_ofs",

  "isaac_a9be850_twin_field_ofs",

  "isaac_a9be850_flag1519_ofs",

  "isaac_a9be850_twin_vec_begin_ofs",

  "isaac_a9be850_twin_vec_end_ofs",

  "isaac_a9be850_twin_vec_stride",

  "isaac_a9be850_marker_field0_value",

  "isaac_a9be850_marker_field4_value",

  "isaac_a9be850_host_va",

  "isaac_a9be850_host_arg2",

  "isaac_a9be850_host_arg3",

  "isaac_a9be850_game_global_va",

  "isaac_a9be850_receiver_ofs",

  "isaac_a9be850_caller_arg1",

  "isaac_a9be850_va",

  "isaac_a9be850_ret_va",

  "isaac_a9be850_int3_va",

  "isaac_a9be850_body_bytes",

  "isaac_a9be850_sites",

  "isaac_a9be850_site_va",

  "isaac_a9be850_next_va",

  "isaac_a9be990_hit",

  "isaac_a9be990_list_empty",

  "isaac_a9be990_walk_next",

  "isaac_a9be990_walk_continue",

  "isaac_a9be990_list_begin_ofs",

  "isaac_a9be990_list_end_ofs",

  "isaac_a9be990_list_stride",

  "isaac_a9be990_slot_field_ofs",

  "isaac_a9be990_skip_code_zero",

  "isaac_a9be990_skip_code_three",

  "isaac_a9be990_manager_global_va",

  "isaac_a9be990_receiver_ofs",

  "isaac_a9be990_va",

  "isaac_a9be990_first_ret_va",

  "isaac_a9be990_ret_va",

  "isaac_a9be990_int3_va",

  "isaac_a9be990_body_bytes",

  "isaac_a9be990_sites",

  "isaac_a9be990_site_va",

  "isaac_a9be990_site2_va",

  "isaac_a9be990_next_va",

  "isaac_a9be9c0_list_empty",

  "isaac_a9be9c0_flag20a9_checkable",

  "isaac_a9be9c0_field184_found",

  "isaac_a9be9c0_walk_next",

  "isaac_a9be9c0_walk_continue",

  "isaac_a9be9c0_list_begin_ofs",

  "isaac_a9be9c0_list_end_ofs",

  "isaac_a9be9c0_list_stride",

  "isaac_a9be9c0_flag20a9_ofs",

  "isaac_a9be9c0_field184_ofs",

  "isaac_a9be9c0_found_code_zero",

  "isaac_a9be9c0_found_code_one",

  "isaac_a9be9c0_found_code_two",

  "isaac_a9be9c0_found_code_three",

  "isaac_a9be9c0_manager_global_va",

  "isaac_a9be9c0_receiver_ofs",

  "isaac_a9be9c0_receiver_getter_va",

  "isaac_a9be9c0_va",

  "isaac_a9be9c0_first_ret_va",

  "isaac_a9be9c0_ret_va",

  "isaac_a9be9c0_int3_va",

  "isaac_a9be9c0_body_bytes",

  "isaac_a9be9c0_sites",

  "isaac_a9be9c0_site_va",

  "isaac_a9be9c0_next_va",

  "isaac_a9bea40_list_empty",

  "isaac_a9bea40_slot_checkable",

  "isaac_a9bea40_flag20a9_checkable",

  "isaac_a9bea40_field156c_add_ss",

  "isaac_a9bea40_walk_next",

  "isaac_a9bea40_walk_continue",

  "isaac_a9bea40_list_begin_ofs",

  "isaac_a9bea40_list_end_ofs",

  "isaac_a9bea40_list_stride",

  "isaac_a9bea40_slot_flag_ofs",

  "isaac_a9bea40_flag20a9_ofs",

  "isaac_a9bea40_field156c_ofs",

  "isaac_a9bea40_manager_global_va",

  "isaac_a9bea40_receiver_ofs",

  "isaac_a9bea40_receiver_getter_va",

  "isaac_a9bea40_va",

  "isaac_a9bea40_first_ret_va",

  "isaac_a9bea40_ret_va",

  "isaac_a9bea40_int3_va",

  "isaac_a9bea40_body_bytes",

  "isaac_a9bea40_sites",

  "isaac_a9bea40_site0_va",

  "isaac_a9bea40_site1_va",

  "isaac_a9bea40_site2_va",

  "isaac_a9bea40_next_va",
  "isaac_gtm_9bea80_id_mask",
  "isaac_gtm_9bea80_list_count",
  "isaac_gtm_9bea80_range_gate",
  "isaac_gtm_9bea80_slot_present",
  "isaac_gtm_9bea80_slot_flag",
  "isaac_gtm_9bea80_list_empty",
  "isaac_gtm_9bea80_slot_checkable",
  "isaac_gtm_9bea80_sum_add",
  "isaac_gtm_9bea80_twin_call_needed",
  "isaac_gtm_9bea80_walk_next",
  "isaac_gtm_9bea80_walk_continue",
  "isaac_gtm_9bea80_result_sum",
  "isaac_gtm_9bea80_list_begin_ofs",
  "isaac_gtm_9bea80_list_end_ofs",
  "isaac_gtm_9bea80_list_stride",
  "isaac_gtm_9bea80_slot_flag_ofs",
  "isaac_gtm_9bea80_twin_ptr_ofs",
  "isaac_gtm_9bea80_slot_array_begin_ofs",
  "isaac_gtm_9bea80_slot_array_end_ofs",
  "isaac_gtm_9bea80_mask",
  "isaac_gtm_9bea80_twin_flags_ofs",
  "isaac_gtm_9bea80_twin_flag_bit",
  "isaac_gtm_9bea80_manager_global_va",
  "isaac_gtm_9bea80_game_global_va",
  "isaac_gtm_9bea80_receiver_ofs",
  "isaac_gtm_9bea80_host_status_va",
  "isaac_gtm_9bea80_va",
  "isaac_gtm_9bea80_first_ret_va",
  "isaac_gtm_9bea80_ret_va",
  "isaac_gtm_9bea80_int3_va",
  "isaac_gtm_9bea80_body_bytes",
  "isaac_gtm_9bea80_sites",
  "isaac_gtm_9bea80_next_va",
  "isaac_a9beb30_arg_byte",
  "isaac_a9beb30_mode_and",
  "isaac_a9beb30_list_empty",
  "isaac_a9beb30_slot_checkable",
  "isaac_a9beb30_flag20a9_checkable",
  "isaac_a9beb30_charge_sum",
  "isaac_a9beb30_charge_gate",
  "isaac_a9beb30_host_match",
  "isaac_a9beb30_combine",
  "isaac_a9beb30_walk_next",
  "isaac_a9beb30_walk_continue",
  "isaac_a9beb30_result_byte",
  "isaac_a9beb30_list_begin_ofs",
  "isaac_a9beb30_list_end_ofs",
  "isaac_a9beb30_list_stride",
  "isaac_a9beb30_slot_flag_ofs",
  "isaac_a9beb30_flag20a9_ofs",
  "isaac_a9beb30_charge_ofs",
  "isaac_a9beb30_charge_addend_ofs",
  "isaac_a9beb30_charge_max_ofs",
  "isaac_a9beb30_manager_global_va",
  "isaac_a9beb30_receiver_ofs",
  "isaac_a9beb30_host_curse_va",
  "isaac_a9beb30_va",
  "isaac_a9beb30_first_ret_va",
  "isaac_a9beb30_ret_va",
  "isaac_a9beb30_int3_va",
  "isaac_a9beb30_body_bytes",
  "isaac_a9beb30_sites",
  "isaac_a9beb30_site0_va",
  "isaac_a9beb30_site1_va",
  "isaac_a9beb30_site2_va",
  "isaac_a9beb30_next_va",
  "isaac_a9beba0_mode_fast",
  "isaac_a9beba0_cache_fresh",
  "isaac_a9beba0_list_count",
  "isaac_a9beba0_idx_in_range",
  "isaac_a9beba0_slot_eligible",
  "isaac_a9beba0_watch_gate",
  "isaac_a9beba0_flag20a9_gate",
  "isaac_a9beba0_player_candidate",
  "isaac_a9beba0_lookup_match",
  "isaac_a9beba0_scan_empty",
  "isaac_a9beba0_scan_continue",
  "isaac_a9beba0_accum_gate",
  "isaac_a9beba0_pred_match",
  "isaac_a9beba0_accum_x",
  "isaac_a9beba0_accum_y",
  "isaac_a9beba0_count_inc",
  "isaac_a9beba0_has_avg",
  "isaac_a9beba0_avg_x",
  "isaac_a9beba0_avg_y",
  "isaac_a9beba0_fallback_x",
  "isaac_a9beba0_fallback_y",
  "isaac_a9beba0_assert_needed",
  "isaac_a9beba0_list_begin_ofs",
  "isaac_a9beba0_list_end_ofs",
  "isaac_a9beba0_list_stride",
  "isaac_a9beba0_second_list_begin_ofs",
  "isaac_a9beba0_second_list_end_ofs",
  "isaac_a9beba0_slot_flag_ofs",
  "isaac_a9beba0_watch_ofs",
  "isaac_a9beba0_watch_value",
  "isaac_a9beba0_flag20a9_ofs",
  "isaac_a9beba0_lookup_key_ofs",
  "isaac_a9beba0_lookup_tag_ofs",
  "isaac_a9beba0_pos_x_ofs",
  "isaac_a9beba0_pos_y_ofs",
  "isaac_a9beba0_pred_obj_ofs",
  "isaac_a9beba0_pred_slot_ofs",
  "isaac_a9beba0_gobj_ts_ofs",
  "isaac_a9beba0_gobj_list_begin_ofs",
  "isaac_a9beba0_gobj_list_end_ofs",
  "isaac_a9beba0_cache_ts_va",
  "isaac_a9beba0_cache_x_va",
  "isaac_a9beba0_cache_y_va",
  "isaac_a9beba0_gobj_global_va",
  "isaac_a9beba0_manager_global_va",
  "isaac_a9beba0_receiver_ofs",
  "isaac_a9beba0_assert_va",
  "isaac_a9beba0_assert_msg_va",
  "isaac_a9beba0_assert_code",
  "isaac_a9beba0_va",
  "isaac_a9beba0_first_ret_va",
  "isaac_a9beba0_ret_va",
  "isaac_a9beba0_int3_va",
  "isaac_a9beba0_body_bytes",
  "isaac_a9beba0_sites",
  "isaac_a9beba0_site0_va",
  "isaac_a9beba0_site1_va",
  "isaac_a9beba0_site2_va",
  "isaac_a9beba0_site3_va",
  "isaac_a9beba0_site4_va",
  "isaac_a9beba0_site5_va",
  "isaac_a9beba0_site6_va",
  "isaac_a9beba0_site7_va",
  "isaac_a9beba0_site8_va",
  "isaac_a9beba0_next_va",

  "isaac_a9bfa70_list_count",
  "isaac_a9bfa70_idx_continue",
  "isaac_a9bfa70_slot_free",
  "isaac_a9bfa70_state_idle",
  "isaac_a9bfa70_link_null",
  "isaac_a9bfa70_link_index_neg1",
  "isaac_a9bfa70_index_ge",
  "isaac_a9bfa70_link_is_self",
  "isaac_a9bfa70_flag20a9_set",
  "isaac_a9bfa70_count_gate",
  "isaac_a9bfa70_count_result",
  "isaac_a9bfa70_list_begin_ofs",
  "isaac_a9bfa70_list_end_ofs",
  "isaac_a9bfa70_list_stride",
  "isaac_a9bfa70_slot_flag_ofs",
  "isaac_a9bfa70_state_ofs",
  "isaac_a9bfa70_link_ofs",
  "isaac_a9bfa70_index_ofs",
  "isaac_a9bfa70_flag20a9_ofs",
  "isaac_a9bfa70_manager_global_va",
  "isaac_a9bfa70_receiver_ofs",
  "isaac_a9bfa70_va",
  "isaac_a9bfa70_first_ret_va",
  "isaac_a9bfa70_ret_va",
  "isaac_a9bfa70_int3_va",
  "isaac_a9bfa70_body_bytes",
  "isaac_a9bfa70_sites",
  "isaac_a9bfa70_site0_va",
  "isaac_a9bfa70_site1_va",
  "isaac_a9bfa70_site2_va",
  "isaac_a9bfa70_site3_va",
  "isaac_a9bfa70_next_va",

  "isaac_cbo9ba980_flag_bit4_set",
  "isaac_cbo9ba980_result_true",
  "isaac_cbo9ba980_result_false",
  "isaac_cbo9ba980_bitset_ofs",
  "isaac_cbo9ba980_bitset_mask",
  "isaac_cbo9ba980_manager_global_va",
  "isaac_cbo9ba980_va",
  "isaac_cbo9ba980_first_ret_va",
  "isaac_cbo9ba980_ret_va",
  "isaac_cbo9ba980_int3_va",
  "isaac_cbo9ba980_body_bytes",
  "isaac_cbo9ba980_sites",
  "isaac_cbo9ba980_site0_va",
  "isaac_cbo9ba980_site1_va",
  "isaac_cbo9ba980_site2_va",
  "isaac_cbo9ba980_next_va",

  "isaac_a9c6110_gate",
  "isaac_a9c6110_value",
  "isaac_a9c6110_next_state",
  "isaac_a9c6110_field8_ofs",
  "isaac_a9c6110_state_ofs",
  "isaac_a9c6110_match_state",
  "isaac_a9c6110_value_two",
  "isaac_a9c6110_value_four",
  "isaac_a9c6110_va",
  "isaac_a9c6110_first_ret_va",
  "isaac_a9c6110_ret_va",
  "isaac_a9c6110_int3_va",
  "isaac_a9c6110_body_bytes",
  "isaac_a9c6110_sites",
  "isaac_a9c6110_pointer_ref_va",
  "isaac_a9c6110_host_walk_va",
  "isaac_a9c6110_walk_owner_va",
  "isaac_a9c6110_next_va",

  "isaac_fco_9be080_has_collectible_va",



  "isaac_fco_9be080_item_flags_ofs",



  "isaac_fco_9be080_twin_bit",



  "isaac_fco_9be080_list_begin_ofs",



  "isaac_fco_9be080_list_end_ofs",



  "isaac_fco_9be080_list_stride",



  "isaac_fco_9be080_slot_flag_ofs",



  "isaac_fco_9be080_twin_ptr_ofs",



  "isaac_fco_9be080_laz_arg_ofs",



  "isaac_fco_9be080_manager_global_va",



  "isaac_fco_9be080_va",



  "isaac_fco_9be080_ret_va",



  "isaac_fco_9be080_first_ret_va",



  "isaac_fco_9be080_int3_va",



  "isaac_fco_9be080_body_bytes",



  "isaac_fco_9be080_sites",



  "isaac_fco_9be080_site_va",



  "isaac_fco_9be080_site2_va",



  "isaac_fco_9be080_next_va",



  "isaac_process_input_pure_helpers_abi_version",



];







function buildWasm() {



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



  // Clang response file: Windows CreateProcess ~32k limit; ABI v30's



  // -Wl,--export list no longer fits on the command line. Each line is a



  // clang flag so @rsp is expanded by clang, not by CreateProcess.



  const rspPath = join(outDir, "exports.rsp").replace(/\\/g, "/");



  writeFileSync(



    rspPath,



    EXPORTS.map((name) => `-Wl,--export=${name}`).join("\n"),



  );



  const built = spawnSync(emxx, [



    source,



    "-std=c++20",



    "-O2",



    "-I", join(root, "native", "decomp"),



    "--no-entry",



    "-sSTANDALONE_WASM=1",



    "-sERROR_ON_UNDEFINED_SYMBOLS=1",



    `@${rspPath}`,



    "-o", wasmPath,



  ], { cwd: root, encoding: "utf8" });



    assert.ok(existsSync(wasmPath));



}







async function loadWasm() {



  buildWasm();



  const { instance } = await WebAssembly.instantiate(readFileSync(wasmPath));



  const exp = (name) => {



    assert.equal(typeof instance.exports[name], "function", name);



    return instance.exports[name];



  };



  return {



    mapPresent: exp("isaac_input_map_node_present"),



















    combine: exp("isaac_input_mask_combine"),



    rangeContains: exp("isaac_input_device_range_contains"),



    deviceTypeRanges: exp("isaac_input_get_device_type_ranges"),



    gate6f9730: exp("isaac_manager_gate_6f9730"),



    earlySkip: exp("isaac_manager_update_early_skip"),



    earlyNext: exp("isaac_manager_early_counter_next"),



    floatApproach: exp("isaac_manager_float_approach"),



    pollPrefix: exp("isaac_manager_poll_prefix_needed"),



    pollPlatform: exp("isaac_manager_poll_platform_uses_a69f60"),



    pollBody: exp("isaac_manager_poll_a6de60_body_needed"),



    pollVecCount: exp("isaac_manager_poll_a6de60_vector_count"),



    pollLoop: exp("isaac_manager_poll_a6de60_loop_needed"),



    deviceEnabled: exp("isaac_manager_poll_a6de60_device_enabled"),



    queryOk: exp("isaac_manager_poll_a6de60_query_ok"),



    buttonBit: exp("isaac_manager_poll_a6de60_button_bit"),



    buttonSlotShift: exp("isaac_manager_poll_a6de60_button_slot_shift"),



    buttonEdge: exp("isaac_manager_poll_a6de60_button_edge"),



    axisNormI16: exp("isaac_manager_poll_a6de60_axis_normalize_i16"),



    axisNormU8: exp("isaac_manager_poll_a6de60_axis_normalize_u8"),



    floatChanged: exp("isaac_manager_poll_a6de60_float_changed"),



    floatCb: exp("isaac_manager_poll_a6de60_float_callback_needed"),



    dierr: exp("isaac_manager_poll_a6de60_dierr_reacquire"),



    indexCont: exp("isaac_manager_poll_a6de60_index_continue"),



    axisDispatch: exp("isaac_manager_poll_a6de60_axis_type_dispatch"),



    deviceCont: exp("isaac_manager_poll_a6de60_device_continue"),



    queryHook: exp("isaac_manager_poll_a6de60_query_uses_hook"),



    qpcFreqInit: exp("isaac_manager_poll_a6de60_qpc_freq_init_needed"),



    u64ToF64: exp("isaac_manager_poll_a6de60_u64_to_f64"),



    qpcSeconds: exp("isaac_manager_poll_a6de60_qpc_seconds_f64"),



    comOk: exp("isaac_manager_poll_a6de60_com_succeeded"),



    bufferedMode: exp("isaac_manager_poll_a6de60_buffered_mode"),



    didodSize: exp("isaac_manager_poll_a6de60_didod_alloc_size"),



    tsSeconds: exp("isaac_manager_poll_a6de60_timestamp_to_seconds_f64"),



    nonzeroBit: exp("isaac_manager_poll_a6de60_nonzero_bit"),



    povAxis0: exp("isaac_manager_poll_a6de60_pov_axis0"),



    povAxis1: exp("isaac_manager_poll_a6de60_pov_axis1"),



    hookRepack: exp("isaac_manager_poll_a6de60_hook_repack"),



    hookDw0: exp("isaac_manager_poll_a6de60_hook_repack_dw0"),



    hookDw1: exp("isaac_manager_poll_a6de60_hook_repack_dw1"),



    hookDw2: exp("isaac_manager_poll_a6de60_hook_repack_dw2"),



    didodOfs: exp("isaac_manager_poll_a6de60_didod_ofs_match"),



    axisMapPov: exp("isaac_manager_poll_a6de60_axis_map_is_pov"),



    failClear: exp("isaac_manager_poll_a6de60_query_fail_clear_value"),



    idxAfterRm: exp("isaac_manager_poll_a6da10_index_after_remove"),



    discCb: exp("isaac_manager_poll_a6da10_disconnect_cb_needed"),



    freeCom: exp("isaac_manager_poll_a6da10_free_com_maps"),



    rmMoveBytes: exp("isaac_manager_poll_a6da10_remove_move_bytes"),



    endAfterRm: exp("isaac_manager_poll_a6da10_end_after_remove"),



    a648Mode: exp("isaac_manager_poll_a648b0_mode"),



    a648Alloc: exp("isaac_manager_poll_a648b0_alloc_malloc_size"),



    a648Sub: exp("isaac_manager_poll_a648b0_tracker_sub_size"),



    a648Add: exp("isaac_manager_poll_a648b0_tracker_add"),



    a1fcLock: exp("isaac_manager_poll_a1fc00_lock_obj_present"),



    a1fcQLoop: exp("isaac_manager_poll_a1fc00_queue_loop_needed"),



    a1fcQCount: exp("isaac_manager_poll_a1fc00_queue_count"),



    a1fcActive: exp("isaac_manager_poll_a1fc00_entry_already_active"),



    a1fcMark: exp("isaac_manager_poll_a1fc00_entry_mark_active"),



    a1fcSlotUse: exp("isaac_manager_poll_a1fc00_slot_table_usable"),



    a1fcSlotFree: exp("isaac_manager_poll_a1fc00_slot_is_free"),



    a1fcSlotCont: exp("isaac_manager_poll_a1fc00_slot_index_continue"),



    a1fcSlotFind: exp("isaac_manager_poll_a1fc00_slot_find_free"),



    a1fcEndErase: exp("isaac_manager_poll_a1fc00_queue_end_after_erase"),



    a1fcIterAdv: exp("isaac_manager_poll_a1fc00_iter_advance"),



    a1fcIterCont: exp("isaac_manager_poll_a1fc00_iter_continue"),



    a1fcGrow: exp("isaac_manager_poll_a1fc00_pending_needs_grow"),



    a1fcPushEnd: exp("isaac_manager_poll_a1fc00_pending_end_after_push"),



    a1fcCapBytes: exp("isaac_manager_poll_a1fc00_pending_capacity_bytes"),



    a1fcFreeHdr: exp("isaac_manager_poll_a1fc00_free_uses_heap_header"),



    a1fcFreeSz: exp("isaac_manager_poll_a1fc00_free_header_size"),



    a1fcFreeOff: exp("isaac_manager_poll_a1fc00_free_header_offset_ok"),



    a1fcNotify: exp("isaac_manager_poll_a1fc00_notify_cb_needed"),



    a1f280Buf: exp("isaac_manager_poll_a1f280_buffer_bytes"),



    a1f280Dir: exp("isaac_manager_poll_a1f280_axis_dir"),



    a1f280Pair: exp("isaac_manager_poll_a1f280_axis_pair_bits"),



    a1f280Count: exp("isaac_manager_poll_a1f280_buffer_count"),



    a1eed0Remap: exp("isaac_manager_poll_a1eed0_deadzone_remap"),



    a1f280Neg: exp("isaac_manager_poll_a1f280_axis_neg_part"),



    a1f280Pos: exp("isaac_manager_poll_a1f280_axis_pos_part"),



    a1f280Idle: exp("isaac_manager_poll_a1f280_action_mode_idle"),



    a1f280IdOk: exp("isaac_manager_poll_a1f280_action_id_valid"),



    a1f280IdxOk: exp("isaac_manager_poll_a1f280_buffer_index_in_range"),



    a1f280Slot: exp("isaac_manager_poll_a1f280_buffer_slot_offset"),



    a1f280Rumble: exp("isaac_manager_poll_a1f280_rumble_path_needed"),



    a1f280TimerPos: exp("isaac_manager_poll_a1f280_timer_positive"),



    a1f280TimerClamp: exp("isaac_manager_poll_a1f280_timer_clamp_nonneg"),



    a68490Ns: exp("isaac_manager_poll_a68490_ns_f64"),



    a1f280ScaleLo: exp("isaac_manager_poll_a1f280_scale_tick_lo"),



    a1f280ScaleHi: exp("isaac_manager_poll_a1f280_scale_tick_hi"),



    a1f280Scale: exp("isaac_manager_poll_a1f280_scale_tick"),



    a1f280DeltaLo: exp("isaac_manager_poll_a1f280_tick_delta_lo"),



    a1f280DeltaHi: exp("isaac_manager_poll_a1f280_tick_delta_hi"),



    a1f280Delta: exp("isaac_manager_poll_a1f280_tick_delta"),



    a1f280DeltaNz: exp("isaac_manager_poll_a1f280_tick_delta_nonzero"),



    a1f280DeltaSec: exp("isaac_manager_poll_a1f280_tick_delta_seconds_f32"),



    a1f280TimerSub: exp("isaac_manager_poll_a1f280_timer_sub_delta"),



    a1f280IntActive: exp("isaac_manager_poll_a1f280_rumble_intensity_active"),



    a1f280VcallT: exp("isaac_manager_poll_a1f280_rumble_vcall_timer"),



    a1f280VcallI: exp("isaac_manager_poll_a1f280_rumble_vcall_intensity"),



    a1f280VcallArgs: exp("isaac_manager_poll_a1f280_rumble_vcall_args"),



    a1f280TimerGate: exp("isaac_manager_poll_a1f280_rumble_timer_after_gate"),



    a1f280NegPath: exp("isaac_manager_poll_a1f280_rumble_neg_timer_path"),



    a1f280Baseline: exp("isaac_manager_poll_a1f280_baseline_store"),



    a1f280Success: exp("isaac_manager_poll_a1f280_success_return"),



    a1f280VtblSlot: exp("isaac_manager_poll_a1f280_rumble_vtbl_slot"),



    a112c0Reenter: exp("isaac_a112c0_reenter_skip"),



    a112c0Sink: exp("isaac_a112c0_sink_active"),



    a112c0Body: exp("isaac_a112c0_body_needed"),



    a112c0Init: exp("isaac_a112c0_init_needed"),



    a112c0StateInit: exp("isaac_a112c0_state_after_init"),



    a112c0PrefixEn: exp("isaac_a112c0_prefix_enabled"),



    a112c0PrefixVa: exp("isaac_a112c0_prefix_va"),



    a112c0Ods: exp("isaac_a112c0_ods_needed"),



    a112c0SinkWrite: exp("isaac_a112c0_sink_write_needed"),



    a112c0BufRem: exp("isaac_a112c0_buf_remaining"),



    a112c0TrailNl: exp("isaac_a112c0_trail_newline"),



    a112c0HostVa: exp("isaac_a112c0_host_va"),



    a112c0FmtVa: exp("isaac_a112c0_fmt_va"),



    a112c0BufCap: exp("isaac_a112c0_buf_cap"),



    a112c0LvlAssert: exp("isaac_a112c0_level_assert"),



    a112c0MsgMutex: exp("isaac_a112c0_msg_va_invalid_mutex"),



    a112c0MsgOor: exp("isaac_a112c0_msg_va_action_id_oor"),



    a1f280OorLog: exp("isaac_manager_poll_a1f280_action_id_oor_log_needed"),



    a1f280QueryNeeded: exp("isaac_manager_poll_a1f280_action_query_vcall_needed"),



    a1f280QueryArg: exp("isaac_manager_poll_a1f280_action_query_vcall_arg"),



    a1f280QueryVtbl: exp("isaac_manager_poll_a1f280_action_query_vtbl_slot"),



    a1f280QueryVa: exp("isaac_manager_poll_a1f280_action_query_call_va"),



    a1f280IdxAfter: exp("isaac_manager_poll_a1f280_action_index_after_push"),



    a1f280ModeAfter: exp("isaac_manager_poll_a1f280_action_mode_after_push"),



    a1f280FillOk: exp("isaac_manager_poll_a1f280_fill_vcall_ok"),



    a1f280FillP1Arg: exp("isaac_manager_poll_a1f280_fill_pair1_arg"),



    a1f280FillP0Arg: exp("isaac_manager_poll_a1f280_fill_pair0_arg"),



    a1f280FillVtbl: exp("isaac_manager_poll_a1f280_fill_vtbl_slot"),



    a1f280FillVa: exp("isaac_manager_poll_a1f280_fill_call_va"),



    a1f280FillP0Va: exp("isaac_manager_poll_a1f280_fill_pair0_call_va"),



    a1f280AxisFillVtbl: exp("isaac_manager_poll_a1f280_axis_fill_vtbl_slot"),



    a1f280FillAxisBase: exp("isaac_manager_poll_a1f280_fill_axis_store_base_pair1"),



    a1f280FillDirBase: exp("isaac_manager_poll_a1f280_fill_dir_bit_base_pair1"),



    a1f280AxisFillVa: exp("isaac_manager_poll_a1f280_axis_fill_call_va"),



    a1f280AxisFillP0Va: exp("isaac_manager_poll_a1f280_axis_fill_pair0_call_va"),



    a1eed0AxisFillVa: exp("isaac_manager_poll_a1eed0_axis_fill_call_va"),



    a1f280AxisFillOutN: exp("isaac_manager_poll_a1f280_axis_fill_out_float_count"),



    a1f280AxisFillOutX: exp("isaac_manager_poll_a1f280_axis_fill_out_x_ofs"),



    a1f280AxisFillOutY: exp("isaac_manager_poll_a1f280_axis_fill_out_y_ofs"),



    a1f280DirThreshOfs: exp("isaac_manager_poll_a1f280_dir_thresh_ofs"),



    a1f280RemapThreshOfs: exp("isaac_manager_poll_a1f280_remap_thresh_ofs"),



    a1f280DirBitsOfs: exp("isaac_manager_poll_a1f280_dir_bits_ofs"),



    a1f280FillAxisBaseP0: exp("isaac_manager_poll_a1f280_fill_axis_store_base_pair0"),



    a1f280FillDirBaseP0: exp("isaac_manager_poll_a1f280_fill_dir_bit_base_pair0"),



    a1f280DirBitsMerge: exp("isaac_manager_poll_a1f280_dir_bits_merge"),



    a1f280ReadyOk: exp("isaac_manager_poll_a1f280_ready_vcall_ok"),



    a1f280ReadyEarly: exp("isaac_manager_poll_a1f280_ready_early_return"),



    a1f280ReadyVtbl: exp("isaac_manager_poll_a1f280_ready_vtbl_slot"),



    a1f280ReadyVa: exp("isaac_manager_poll_a1f280_ready_call_va"),



    a648TrackerBase: exp("isaac_manager_poll_a648b0_tracker_base"),



    a648AccountTarget: exp("isaac_manager_poll_a648b0_account_target"),



    a648ClampNeeded: exp("isaac_manager_poll_a648b0_alloc_clamp_needed"),



    a648ClampedLo: exp("isaac_manager_poll_a648b0_alloc_size_clamped_lo"),



    a648MallocHi: exp("isaac_manager_poll_a648b0_alloc_malloc_size_hi"),



    a648AllocOk: exp("isaac_manager_poll_a648b0_alloc_ok"),



    a648HeaderValue: exp("isaac_manager_poll_a648b0_alloc_header_value"),



    a648Payload: exp("isaac_manager_poll_a648b0_alloc_payload_ptr"),



    a648AllocReturn: exp("isaac_manager_poll_a648b0_alloc_return"),



    a648FreeNeeded: exp("isaac_manager_poll_a648b0_free_needed"),



    a648FreeBlock: exp("isaac_manager_poll_a648b0_free_block_ptr"),



    a648HeaderBytes: exp("isaac_manager_poll_a648b0_header_bytes"),



    a648OomCode: exp("isaac_manager_poll_a648b0_oom_code"),



    a648OomVa: exp("isaac_manager_poll_a648b0_oom_host_va"),



    a648MallocVa: exp("isaac_manager_poll_a648b0_malloc_iat_va"),



    a648FreeVa: exp("isaac_manager_poll_a648b0_free_iat_va"),



    a6da10SlotOfs: exp("isaac_manager_poll_a6da10_slot_byte_offset"),



    a6da10SlotAddr: exp("isaac_manager_poll_a6da10_slot_addr"),



    a6da10MoveDst: exp("isaac_manager_poll_a6da10_memmove_dst"),



    a6da10MoveSrc: exp("isaac_manager_poll_a6da10_memmove_src"),



    a6da10StepCount: exp("isaac_manager_poll_a6da10_teardown_step_count"),



    a6da10Plan: exp("isaac_manager_poll_a6da10_teardown_plan"),



    a6da10ComSlot: exp("isaac_manager_poll_a6da10_com_release_vtbl_slot"),



    a6dd30AxisBase: exp("isaac_manager_poll_a6dd30_axis_base_ofs"),



    a6dd30SlotX: exp("isaac_manager_poll_a6dd30_axis_slot_offset"),



    a6dd30SlotY: exp("isaac_manager_poll_a6dd30_axis_slot_offset_y"),



    a6dd30IndexAfterX: exp("isaac_manager_poll_a6dd30_index_after_x"),



    a6dd30CbNeeded: exp("isaac_manager_poll_a6dd30_cb_needed"),



    a6dd30CbFrame: exp("isaac_manager_poll_a6dd30_cb_frame_bytes"),



    a6dd30CbArgOfs: exp("isaac_manager_poll_a6dd30_cb_arg_ofs"),



    a6dab0ScanEnabled: exp("isaac_manager_poll_a6dab0_scan_enabled"),



    a6dab0PumpNeeded: exp("isaac_manager_poll_a6dab0_pump_needed"),



    a6dab0EnumNeeded: exp("isaac_manager_poll_a6dab0_enum_needed"),



    a6dab0EnumFlagAfter: exp("isaac_manager_poll_a6dab0_enum_flag_after"),



    a6dab0SlotScanNeeded: exp("isaac_manager_poll_a6dab0_slot_scan_needed"),



    a6dab0SlotContinue: exp("isaac_manager_poll_a6dab0_slot_continue"),



    a6dab0SlotTableAddr: exp("isaac_manager_poll_a6dab0_slot_table_addr"),



    a6dab0NameTableAddr: exp("isaac_manager_poll_a6dab0_name_table_addr"),



    a6dab0SlotClear: exp("isaac_manager_poll_a6dab0_slot_clear_value"),



    a6dab0QueryOk: exp("isaac_manager_poll_a6dab0_query_ok"),



    a6dab0RecordPresent: exp("isaac_manager_poll_a6dab0_record_present"),



    a6dab0ConnectNeeded: exp("isaac_manager_poll_a6dab0_connect_needed"),



    a6dab0DisconnectNeeded: exp("isaac_manager_poll_a6dab0_disconnect_needed"),



    a6dab0CapsModeOk: exp("isaac_manager_poll_a6dab0_caps_mode_ok"),



    a6dab0CapsCallNeeded: exp("isaac_manager_poll_a6dab0_caps_call_needed"),



    a6dab0CapsOk: exp("isaac_manager_poll_a6dab0_caps_ok"),



    a6dab0IdWord: exp("isaac_manager_poll_a6dab0_id_word"),



    a6dab0NextDeviceId: exp("isaac_manager_poll_a6dab0_next_device_id"),



    a6dab0StateEnable: exp("isaac_manager_poll_a6dab0_state_enable_value"),



    a6dab0RecFieldOfs: exp("isaac_manager_poll_a6dab0_record_field_ofs"),



    a6dab0StateFieldOfs: exp("isaac_manager_poll_a6dab0_state_field_ofs"),



    a6dab0AxisCalloc: exp("isaac_manager_poll_a6dab0_axis_calloc_args"),



    a6dab0ButtonCalloc: exp("isaac_manager_poll_a6dab0_button_calloc_args"),



    a6dab0PushGrow: exp("isaac_manager_poll_a6dab0_push_needs_grow"),



    a6dab0EndAfterPush: exp("isaac_manager_poll_a6dab0_end_after_push"),



    a6dab0ConnectCb: exp("isaac_manager_poll_a6dab0_connect_cb_needed"),



    a6dab0SearchLoop: exp("isaac_manager_poll_a6dab0_search_loop_needed"),



    a6dab0SearchContinue: exp("isaac_manager_poll_a6dab0_search_index_continue"),



    a6dab0VectorFind: exp("isaac_manager_poll_a6dab0_vector_find"),



    a6dab0SlotCount: exp("isaac_manager_poll_a6dab0_slot_count"),



    a6dab0EnumVtbl: exp("isaac_manager_poll_a6dab0_enum_vtbl_slot"),



    a6dab0EnumCbVa: exp("isaac_manager_poll_a6dab0_enum_callback_va"),



    a6dab0MsgEnumFail: exp("isaac_manager_poll_a6dab0_msg_va_enum_fail"),



    a6dab0MsgConnect: exp("isaac_manager_poll_a6dab0_msg_va_connect"),



    a6dab0MsgCapsFail: exp("isaac_manager_poll_a6dab0_msg_va_caps_fail"),



    a220c0Run: exp("isaac_manager_poll_a220c0_thread_run"),



    a220c0Continue: exp("isaac_manager_poll_a220c0_thread_continue"),



    a220c0SpawnNeeded: exp("isaac_manager_poll_a220c0_spawn_needed"),



    a220c0FlagStart: exp("isaac_manager_poll_a220c0_flag_after_start"),



    a220c0FlagStop: exp("isaac_manager_poll_a220c0_flag_after_stop"),



    a220c0Iterations: exp("isaac_manager_poll_a220c0_scan_iterations"),



    a220c0SleepMs: exp("isaac_manager_poll_a220c0_sleep_ms"),



    a220c0ProcVa: exp("isaac_manager_poll_a220c0_thread_proc_va"),



    a220c0SpawnVtbl: exp("isaac_manager_poll_a220c0_spawn_vtbl_slot"),



    a6cf80InitSkip: exp("isaac_manager_poll_a6cf80_init_skip"),



    a6cf80ProbeNameVa: exp("isaac_manager_poll_a6cf80_probe_name_va"),



    a6cf80ModeForProbe: exp("isaac_manager_poll_a6cf80_mode_for_probe"),



    a6cf80SelectProbe: exp("isaac_manager_poll_a6cf80_select_probe"),



    a6cf80ModeAfterProbes: exp("isaac_manager_poll_a6cf80_mode_after_probes"),



    a6cf80LogLevel: exp("isaac_manager_poll_a6cf80_log_level_for_mode"),



    a6cf80LogMsgVa: exp("isaac_manager_poll_a6cf80_log_msg_va_for_mode"),



    a6cf80ScanFlagAfter: exp("isaac_manager_poll_a6cf80_scan_flag_after"),



    a6cf80CapsProbe: exp("isaac_manager_poll_a6cf80_caps_hook_probe_needed"),



    a6cf80HookTarget: exp("isaac_manager_poll_a6cf80_hook_slot_target_va"),



    a6cf80HookName: exp("isaac_manager_poll_a6cf80_hook_slot_name_va"),



    a6cf80HookOrdinal: exp("isaac_manager_poll_a6cf80_hook_slot_ordinal"),



    a6cf80CoinitRetry: exp("isaac_manager_poll_a6cf80_coinit_retry_needed"),



    a6cf80EnableAfter: exp("isaac_manager_poll_a6cf80_enable_after_init"),



    a6cf80EnumFlagAfter: exp("isaac_manager_poll_a6cf80_enum_flag_after_init"),



    a6cf80ProbeCount: exp("isaac_manager_poll_a6cf80_probe_count"),



    a6cf80CoinitFirst: exp("isaac_manager_poll_a6cf80_coinit_flags_first"),



    a6cf80CoinitRetryFlags: exp("isaac_manager_poll_a6cf80_coinit_flags_retry"),



    a6cf80FilterBytes: exp("isaac_manager_poll_a6cf80_notify_filter_bytes"),



    a6cf80FilterCbsize: exp("isaac_manager_poll_a6cf80_notify_filter_cbsize"),



    shellRecvOfs: exp("isaac_manager_shell_receiver_ofs"),



    shellRecvAddr: exp("isaac_manager_shell_receiver_addr"),



    approachSlotAddr: exp("isaac_manager_approach_slot_addr"),



    approachSlotContinue: exp("isaac_manager_approach_slot_continue"),



    approachAddPath: exp("isaac_manager_approach_uses_add_path"),



    approachHostNeeded: exp("isaac_manager_approach_host_call_needed"),



    approachHostArg: exp("isaac_manager_approach_host_arg_slot"),



    shellFlagBAfter: exp("isaac_manager_shell_flag_b_after_loop"),



    shellProbeNeeded: exp("isaac_manager_shell_probe_needed"),



    shell90b150Blocks: exp("isaac_manager_shell_sub_90b150_blocks"),



    shellStateUsesGame: exp("isaac_manager_shell_state_uses_game"),



    shellGamePresent: exp("isaac_manager_shell_game_present"),



    shellSilentReturn: exp("isaac_manager_shell_silent_return"),



    shellStateIndex: exp("isaac_manager_shell_state_index"),



    shellStateInTable: exp("isaac_manager_shell_state_in_table"),



    shellStateTargetVa: exp("isaac_manager_shell_state_target_va"),



    shellStateTableVa: exp("isaac_manager_shell_state_table_va"),



    shellStateDefaultVa: exp("isaac_manager_shell_state_default_va"),



    approachSlotCount: exp("isaac_manager_approach_slot_count"),



    approachSlotStride: exp("isaac_manager_approach_slot_stride"),



    a6dd30XCbRan: exp("isaac_manager_poll_a6dd30_x_cb_ran"),



    a6dd30YBase: exp("isaac_manager_poll_a6dd30_y_axis_base"),



    a6dd30YCbPtr: exp("isaac_manager_poll_a6dd30_y_cb_ptr"),



    a6dd30YCbNeeded: exp("isaac_manager_poll_a6dd30_y_cb_needed"),



    a6dd30TsStable: exp("isaac_manager_poll_a6dd30_timestamp_is_stable"),



    a1f280SlotModeCc: exp("isaac_manager_poll_a1f280_action_slot_mode_cc"),



    a1f280StoreBase: exp("isaac_manager_poll_a1f280_action_store_base"),



    a1f280StoreAddr: exp("isaac_manager_poll_a1f280_action_store_addr"),



    a1f280CountPrelog: exp("isaac_manager_poll_a1f280_action_count_is_prelog"),



    state2Blocked: exp("isaac_manager_state2_blocked"),



    state2ParityAlt: exp("isaac_manager_state2_parity_alt"),



    state2SweepNeeded: exp("isaac_manager_state2_sweep_needed"),



    state2SweepStep: exp("isaac_manager_state2_sweep_step"),



    state2EntitySlot: exp("isaac_manager_state2_entity_slot_addr"),



    state2NeedsFixup: exp("isaac_manager_state2_entity_needs_fixup"),



    state2SrcOfs: exp("isaac_manager_state2_fixup_src_ofs"),



    state2DstOfs: exp("isaac_manager_state2_fixup_dst_ofs"),



    state2FlagAfter: exp("isaac_manager_state2_entity_flag_after_fixup"),



    p9505e0Gate: exp("isaac_manager_9505e0_gate"),



    p9505e0ReadsB: exp("isaac_manager_9505e0_reads_b_pair"),



    p9505e0FieldOfs: exp("isaac_manager_9505e0_field_ofs"),



    p9505e0MgrOfs: exp("isaac_manager_9505e0_manager_ofs"),



    p9c3990Matches: exp("isaac_manager_9c3990_node_matches"),



    p9c3990WalkCont: exp("isaac_manager_9c3990_walk_continue"),



    p9c3990Result: exp("isaac_manager_9c3990_result"),



    p9c3990Scanned: exp("isaac_manager_9c3990_scanned"),



    p9c3990UnlockAlways: exp("isaac_manager_9c3990_unlock_always"),



    p9c3990LockArg: exp("isaac_manager_9c3990_lock_arg"),



    p9c3990LockSlot: exp("isaac_manager_9c3990_lock_vtbl_slot"),



    p9c3990UnlockSlot: exp("isaac_manager_9c3990_unlock_vtbl_slot"),



    state1Gate: exp("isaac_manager_state1_second_gate_needed"),



    state1ModeRead: exp("isaac_manager_state1_mode_read_unconditional"),



    state1Terminal: exp("isaac_manager_state1_terminal_needed"),



    state1TerminalFields: exp("isaac_manager_state1_terminal_needed_from_fields"),



    state2HeadGate: exp("isaac_manager_state2_head_gate_needed"),



    state2HeadTerminal: exp("isaac_manager_state2_head_terminal_needed"),



    state2HeadTerminalFields: exp(



      "isaac_manager_state2_head_terminal_needed_from_fields",



    ),



    armRecvOfs: exp("isaac_manager_shell_arm_recv_ofs"),



    armCallVa: exp("isaac_manager_shell_arm_call_va"),



    state1TerminalVa: exp("isaac_manager_state1_terminal_va"),



    state2HeadTerminalVa: exp("isaac_manager_state2_head_terminal_va"),



    predCallNeeded: exp("isaac_manager_predispatch_call_needed"),



    predObjAfter: exp("isaac_manager_predispatch_obj_after"),



    predSuppressAfter: exp("isaac_manager_predispatch_suppress_after"),



    predQueueReached: exp("isaac_manager_predispatch_queue_gate_reached"),



    predForcesDefault: exp("isaac_manager_predispatch_forces_default"),



    predDispatches: exp("isaac_manager_predispatch_dispatches"),



    predFieldOfs: exp("isaac_manager_predispatch_field_ofs"),



    state2NullGuarded: exp("isaac_manager_state2_game_null_guarded"),



    midParityGate: exp("isaac_manager_state2_mid_parity_gate_needed"),



    midDispatch: exp("isaac_manager_state2_mid_dispatch_needed"),



    midModeIsTwo: exp("isaac_manager_state2_mid_mode_is_two"),



    midParityBit: exp("isaac_manager_state2_mid_parity_bit"),



    midWriteByte: exp("isaac_manager_state2_mid_write_byte_needed"),



    midCallAVa: exp("isaac_manager_state2_mid_call_a_va"),



    midCallBVa: exp("isaac_manager_state2_mid_call_b_va"),



    midParityCallVa: exp("isaac_manager_state2_mid_parity_call_va"),



    midIsPausedVa: exp("isaac_manager_state2_mid_is_paused_va"),



    midObjInnerOfs: exp("isaac_manager_state2_mid_obj_inner_ofs"),



    midObjByteOfs: exp("isaac_manager_state2_mid_obj_byte_ofs"),



    midModeOfs: exp("isaac_manager_state2_mid_mode_ofs"),



    angleWrapCount: exp("isaac_manager_shell_angle_wrap_count"),



    angleWrapActive: exp("isaac_manager_shell_angle_wrap_active"),



    angleWrapSlot: exp("isaac_manager_shell_angle_wrap_slot"),



    appTailNeeded: exp("isaac_manager_shell_approach_tail_needed"),



    appTailStore: exp("isaac_manager_shell_approach_tail_store_needed"),



    appTailNext: exp("isaac_manager_shell_approach_tail_next"),



    appTailHostVa: exp("isaac_manager_shell_approach_tail_host_va"),



    appTailRecvOfs: exp("isaac_manager_shell_approach_tail_recv_ofs"),



    appTailValueOfs: exp("isaac_manager_shell_approach_tail_value_ofs"),



    appTailStepOfs: exp("isaac_manager_shell_approach_tail_step_ofs"),



    tailCallAVa: exp("isaac_manager_state2_tail_call_a_va"),



    tailCallARecvOfs: exp("isaac_manager_state2_tail_call_a_recv_ofs"),



    tailCallBNeeded: exp("isaac_manager_state2_tail_call_b_needed"),



    tailCallBVa: exp("isaac_manager_state2_tail_call_b_va"),



    tailCallBRecvGlobalVa: exp("isaac_manager_state2_tail_call_b_recv_global_va"),



    tailCallBArgEdx: exp("isaac_manager_state2_tail_call_b_arg_edx"),



    tailAnimVa: exp("isaac_manager_state2_tail_anim_va"),



    tailPlayVa: exp("isaac_manager_state2_tail_play_va"),



    tailPlayRecvOfs: exp("isaac_manager_state2_tail_play_recv_ofs"),



    tailPlayAnimIdleVa: exp("isaac_manager_state2_tail_play_anim_idle_va"),



    tailPlayAnimClickedVa: exp("isaac_manager_state2_tail_play_anim_clicked_va"),



    tailPlayResetArg: exp("isaac_manager_state2_tail_play_reset_arg"),



    tailWinAssert: exp("isaac_manager_shell_tail_win_assert_needed"),



    tailWassertMsg: exp("isaac_manager_shell_tail_wassert_msg_va"),



    tailWassertFile: exp("isaac_manager_shell_tail_wassert_file_va"),



    tailWassertLine: exp("isaac_manager_shell_tail_wassert_line"),



    tailWassertIat: exp("isaac_manager_shell_tail_wassert_iat_va"),



    tailWinGlobal: exp("isaac_manager_shell_tail_win_global_va"),



    tailUsesPoll: exp("isaac_manager_shell_tail_uses_platform_poll"),



    tailPollVa: exp("isaac_manager_shell_tail_platform_poll_va"),



    tailPollArg0: exp("isaac_manager_shell_tail_platform_poll_arg0"),



    tailPollArg1: exp("isaac_manager_shell_tail_platform_poll_arg1"),



    tailPollFlag: exp("isaac_manager_shell_tail_platform_flag_va"),



    tailDirectCopy: exp("isaac_manager_shell_tail_direct_copy_needed"),



    tailKindOfs: exp("isaac_manager_shell_tail_kind_ofs"),



    tailKindMagic: exp("isaac_manager_shell_tail_kind_magic"),



    tailD0Ofs: exp("isaac_manager_shell_tail_d0_ofs"),



    tailD1Ofs: exp("isaac_manager_shell_tail_d1_ofs"),



    tailQueryVa: exp("isaac_manager_shell_tail_platform_query_va"),



    tailFloatOfF64: exp("isaac_manager_shell_tail_float_of_f64"),



    tailLaneEq: exp("isaac_manager_shell_tail_lane_ordered_equal"),



    tailBothEq: exp("isaac_manager_shell_tail_both_lanes_equal"),



    tailTimerNext: exp("isaac_manager_shell_tail_timer_next"),



    tailTimerOfs: exp("isaac_manager_shell_tail_timer_ofs"),



    tailTimerReset: exp("isaac_manager_shell_tail_timer_reset_value"),



    tailStoreF0Ofs: exp("isaac_manager_shell_tail_store_f0_ofs"),



    tailStoreF1Ofs: exp("isaac_manager_shell_tail_store_f1_ofs"),



    tailParityNext: exp("isaac_manager_shell_tail_parity_next"),



    tailParityOfs: exp("isaac_manager_shell_tail_parity_ofs"),



    prepState4: exp("isaac_manager_prepoll_state4_store_needed"),



    prepG1: exp("isaac_manager_prepoll_g1_needed"),



    prepG2: exp("isaac_manager_prepoll_g2_needed"),



    prepHostC: exp("isaac_manager_prepoll_host_c_needed"),



    prepS3Trans: exp("isaac_manager_prepoll_state3_transition_needed"),



    prepG3: exp("isaac_manager_prepoll_g3_needed"),



    prepS5Trans: exp("isaac_manager_prepoll_state5_transition_needed"),



    prepArm: exp("isaac_manager_prepoll_arm_select"),



    prepCopyBlock: exp("isaac_manager_prepoll_copy_block_needed"),



    prepG4: exp("isaac_manager_prepoll_g4_needed"),



    prepB0Next: exp("isaac_manager_prepoll_game_b0_next"),



    prepLog: exp("isaac_manager_prepoll_log_needed"),



    prepNightmare: exp("isaac_manager_prepoll_nightmare_arg"),



    prepCopySrc: exp("isaac_manager_prepoll_copy_src_ofs"),



    prepCopySrcDw: exp("isaac_manager_prepoll_copy_src_dword_ofs"),



    prepStateOfs: exp("isaac_manager_prepoll_state_ofs"),



    prepHistoryOfs: exp("isaac_manager_prepoll_history_ofs"),



    prepG1Ofs: exp("isaac_manager_prepoll_g1_ofs"),



    prepCutsceneIdOfs: exp("isaac_manager_prepoll_cutscene_id_ofs"),



    prepG2Ofs: exp("isaac_manager_prepoll_g2_ofs"),



    prepSlotIdxOfs: exp("isaac_manager_prepoll_copy_slot_index_ofs"),



    prepSrcBase: exp("isaac_manager_prepoll_copy_src_base"),



    prepSrcDw: exp("isaac_manager_prepoll_copy_src_dword"),



    prepStride: exp("isaac_manager_prepoll_copy_stride"),



    prepDstCore: exp("isaac_manager_prepoll_copy_dst_core_ofs"),



    prepDstDw: exp("isaac_manager_prepoll_copy_dst_dword_ofs"),



    prepDstExt: exp("isaac_manager_prepoll_copy_dst_ext_ofs"),



    prepExtFrom: exp("isaac_manager_prepoll_copy_ext_from_ofs"),



    prepFlagOfs: exp("isaac_manager_prepoll_copy_flag_ofs"),



    prepFlagVal: exp("isaac_manager_prepoll_copy_flag_value"),



    prepG3Ofs: exp("isaac_manager_prepoll_g3_ofs"),



    prepNightmareArgOfs: exp("isaac_manager_prepoll_nightmare_arg_ofs"),



    prepG4Ofs: exp("isaac_manager_prepoll_g4_ofs"),



    prepS3ArmByteOfs: exp("isaac_manager_prepoll_state3arm_byte_ofs"),



    prepPredispatchRecv: exp("isaac_manager_prepoll_predispatch_recv_ofs"),



    prepS5Recv: exp("isaac_manager_prepoll_state5_recv_ofs"),



    prepStoreBase: exp("isaac_manager_prepoll_game_store_base_ofs"),



    prepStoreB4: exp("isaac_manager_prepoll_game_store_b4_ofs"),



    prepStoreB8: exp("isaac_manager_prepoll_game_store_b8_ofs"),



    prepStoreBc: exp("isaac_manager_prepoll_game_store_bc_ofs"),



    prepStoreB8Bits: exp("isaac_manager_prepoll_game_store_b8_bits"),



    prepStoreBcVal: exp("isaac_manager_prepoll_game_store_bc_value"),



    prepCrossRecv: exp("isaac_manager_prepoll_crossfade_recv_ofs"),



    prepCrossMusic: exp("isaac_manager_prepoll_crossfade_music_id"),



    prepCrossRate: exp("isaac_manager_prepoll_crossfade_rate_bits"),



    prepHostA: exp("isaac_manager_prepoll_host_a_va"),



    prepHostB: exp("isaac_manager_prepoll_host_b_va"),



    prepHostCVa: exp("isaac_manager_prepoll_host_c_va"),



    prepHostD: exp("isaac_manager_prepoll_host_d_va"),



    prepHostE: exp("isaac_manager_prepoll_host_e_va"),



    prepHostF: exp("isaac_manager_prepoll_host_f_va"),



    prepHostG: exp("isaac_manager_prepoll_host_g_va"),



    prepHostGArg: exp("isaac_manager_prepoll_host_g_arg"),



    prepLogVa: exp("isaac_manager_prepoll_log_va"),



    prepLogLevel: exp("isaac_manager_prepoll_log_level"),



    prepLogMsg: exp("isaac_manager_prepoll_log_msg_va"),



    prepHostH: exp("isaac_manager_prepoll_host_h_va"),



    prepState4Val: exp("isaac_manager_prepoll_state4_value"),



    psCount: exp("isaac_manager_playerscan_count_from_bounds"),



    psElemPtr: exp("isaac_manager_playerscan_element_ptr"),



    psMatch: exp("isaac_manager_playerscan_match_needed"),



    psState2: exp("isaac_manager_playerscan_state2_gate"),



    psPlayerCount: exp("isaac_manager_playerscan_player_count_from_bounds"),



    psLog: exp("isaac_manager_playerscan_log_needed"),



    psRelease: exp("isaac_manager_playerscan_release_gate"),



    psCallback: exp("isaac_manager_playerscan_callback_needed"),



    psElemCtrlOfs: exp("isaac_manager_playerscan_element_ctrl_ofs"),



    psMgrStoreOfs: exp("isaac_manager_playerscan_manager_store_ofs"),



    psListBeginOfs: exp("isaac_manager_playerscan_player_list_begin_ofs"),



    psListEndOfs: exp("isaac_manager_playerscan_player_list_end_ofs"),



    psVecThis: exp("isaac_manager_playerscan_vector_this_va"),



    psVecBegin: exp("isaac_manager_playerscan_vector_begin_va"),



    psVecEnd: exp("isaac_manager_playerscan_vector_end_va"),



    psVecLock: exp("isaac_manager_playerscan_vector_lock_va"),



    psVecStride: exp("isaac_manager_playerscan_vector_stride"),



    psListStride: exp("isaac_manager_playerscan_player_list_stride"),



    psLastIdxVa: exp("isaac_manager_playerscan_last_index_global_va"),



    psCbVa: exp("isaac_manager_playerscan_release_callback_global_va"),



    psMgrVa: exp("isaac_manager_playerscan_manager_global_va"),



    psGameVa: exp("isaac_manager_playerscan_game_global_va"),



    psAccessor: exp("isaac_manager_playerscan_accessor_va"),



    psSetCtrl: exp("isaac_manager_playerscan_set_controller_va"),



    psSetCtrlArg: exp("isaac_manager_playerscan_set_controller_arg"),



    psMatchSlot: exp("isaac_manager_playerscan_match_vcall_slot"),



    psMatchArg: exp("isaac_manager_playerscan_match_vcall_arg"),



    psMatchSent: exp("isaac_manager_playerscan_match_sentinel"),



    psRelSlot: exp("isaac_manager_playerscan_release_vcall_slot"),



    psLogLevel: exp("isaac_manager_playerscan_log_level"),



    psLogMsg: exp("isaac_manager_playerscan_log_msg_va"),



    psState2Val: exp("isaac_manager_playerscan_state2_value"),



    a0r: exp("isaac_manager_a0f550_r"),



    a0g: exp("isaac_manager_a0f550_g"),



    a0b: exp("isaac_manager_a0f550_b"),



    a0a: exp("isaac_manager_a0f550_a"),



    a0ch: exp("isaac_manager_a0f550_channel_f32"),



    a0f0: exp("isaac_manager_a0f550_f0"),



    a0f1: exp("isaac_manager_a0f550_f1"),



    a0f2: exp("isaac_manager_a0f550_f2"),



    a0f3: exp("isaac_manager_a0f550_f3"),



    a0tail: exp("isaac_manager_a0f550_tail_store"),



    a0f0Ofs: exp("isaac_manager_a0f550_f0_ofs"),



    a0f1Ofs: exp("isaac_manager_a0f550_f1_ofs"),



    a0f2Ofs: exp("isaac_manager_a0f550_f2_ofs"),



    a0f3Ofs: exp("isaac_manager_a0f550_f3_ofs"),



    a0tailOfs: exp("isaac_manager_a0f550_tail_ofs"),



    a0denomBits: exp("isaac_manager_a0f550_denom_bits"),



    a0denomVa: exp("isaac_manager_a0f550_denom_va"),



    a0tableVa: exp("isaac_manager_a0f550_signed_table_va"),



    a0va: exp("isaac_manager_a0f550_va"),



    a0retVa: exp("isaac_manager_a0f550_ret_va"),



    a0bytes: exp("isaac_manager_a0f550_body_bytes"),



    a0next: exp("isaac_manager_a0f550_next_va"),



    b28body: exp("isaac_manager_959d00_body_needed"),



    b28state2: exp("isaac_manager_959d00_state2_needed"),



    b28queue: exp("isaac_manager_959d00_queue_nonempty"),



    b28island: exp("isaac_manager_959d00_state2_island_needed"),



    b28quiet: exp("isaac_manager_959d00_quiet_arg"),



    b28h907690: exp("isaac_manager_959d00_host_907690_needed"),



    b28alloc: exp("isaac_manager_959d00_menu_alloc_needed"),



    b28ctor: exp("isaac_manager_959d00_menu_ctor_needed"),



    b28flagOfs: exp("isaac_manager_959d00_flag_ofs"),



    b28stateOfs: exp("isaac_manager_959d00_state_ofs"),



    b28state2Val: exp("isaac_manager_959d00_state2_value"),



    b28qBegin: exp("isaac_manager_959d00_queue_begin_ofs"),



    b28qEnd: exp("isaac_manager_959d00_queue_end_ofs"),



    b28modeOfs: exp("isaac_manager_959d00_game_mode_ofs"),



    b2826630Ofs: exp("isaac_manager_959d00_game_26630_ofs"),



    b28extOfs: exp("isaac_manager_959d00_ext_ofs"),



    b28extSkip: exp("isaac_manager_959d00_ext_skip"),



    b28coreOfs: exp("isaac_manager_959d00_core_ofs"),



    b28f0Ofs: exp("isaac_manager_959d00_f0_ofs"),



    b28f1Ofs: exp("isaac_manager_959d00_f1_ofs"),



    b28f2Ofs: exp("isaac_manager_959d00_f2_ofs"),



    b28dwOfs: exp("isaac_manager_959d00_dw_ofs"),



    b28menuVa: exp("isaac_manager_959d00_menu_global_va"),



    b28allocSz: exp("isaac_manager_959d00_menu_alloc_size"),



    b28storeCore: exp("isaac_manager_959d00_menu_store_core_ofs"),



    b28storeF0: exp("isaac_manager_959d00_menu_store_f0_ofs"),



    b28storeF1: exp("isaac_manager_959d00_menu_store_f1_ofs"),



    b28storeF2: exp("isaac_manager_959d00_menu_store_f2_ofs"),



    b28storeDw: exp("isaac_manager_959d00_menu_store_dw_ofs"),



    b28storeFlag: exp("isaac_manager_959d00_menu_store_flag_ofs"),



    b28storeFlagVal: exp("isaac_manager_959d00_menu_store_flag_value"),



    b28stateAfter: exp("isaac_manager_959d00_state_after"),



    b28flagClear: exp("isaac_manager_959d00_flag_clear"),



    b28mgrVa: exp("isaac_manager_959d00_manager_global_va"),



    b28gameVa: exp("isaac_manager_959d00_game_global_va"),



    b28h90cd10: exp("isaac_manager_959d00_host_90cd10_va"),



    b28h90a8a0: exp("isaac_manager_959d00_host_90a8a0_va"),



    b28h907690Va: exp("isaac_manager_959d00_host_907690_va"),



    b28h959670: exp("isaac_manager_959d00_host_959670_va"),



    b28h91c770: exp("isaac_manager_959d00_host_91c770_va"),



    b28hA0f4c0: exp("isaac_manager_959d00_host_a0f4c0_va"),



    b28h986450: exp("isaac_manager_959d00_host_986450_va"),



    b28h987450: exp("isaac_manager_959d00_host_987450_va"),



    b28h98aa30: exp("isaac_manager_959d00_host_98aa30_va"),



    b28va: exp("isaac_manager_959d00_va"),



    b28ret: exp("isaac_manager_959d00_ret_va"),



    b28bytes: exp("isaac_manager_959d00_body_bytes"),



    b28sites: exp("isaac_manager_959d00_sites"),



    b28next: exp("isaac_manager_959d00_next_va"),



    a29body: exp("isaac_manager_959720_body_needed"),



    a29probe: exp("isaac_manager_959720_probe_needed"),



    a29probeOk: exp("isaac_manager_959720_probe_ok"),



    a29cont: exp("isaac_manager_959720_body_continue"),



    a29pInc: exp("isaac_manager_959720_parity_inc_needed"),



    a29pNext: exp("isaac_manager_959720_parity_next"),



    a29gAlloc: exp("isaac_manager_959720_game_alloc_needed"),



    a29gCtor: exp("isaac_manager_959720_game_ctor_needed"),



    a29queue: exp("isaac_manager_959720_queue_nonempty"),



    a29h6eef20: exp("isaac_manager_959720_host_6eef20_needed"),



    a29h923450: exp("isaac_manager_959720_host_923450_needed"),



    a29arm: exp("isaac_manager_959720_join_arm"),



    a29jInc: exp("isaac_manager_959720_join_parity_inc_needed"),



    a29flagOfs: exp("isaac_manager_959720_flag_ofs"),



    a29probeOfs: exp("isaac_manager_959720_probe_ofs"),



    a29parityOfs: exp("isaac_manager_959720_parity_ofs"),



    a29qBegin: exp("isaac_manager_959720_queue_begin_ofs"),



    a29qEnd: exp("isaac_manager_959720_queue_end_ofs"),



    a29stateOfs: exp("isaac_manager_959720_state_ofs"),



    a29stateAfter: exp("isaac_manager_959720_state_after"),



    a294b131Ofs: exp("isaac_manager_959720_flag_4b131_ofs"),



    a294b132Ofs: exp("isaac_manager_959720_flag_4b132_ofs"),



    a294b140Ofs: exp("isaac_manager_959720_ptr_4b140_ofs"),



    a294b3e4Ofs: exp("isaac_manager_959720_dword_4b3e4_ofs"),



    a29recvOfs: exp("isaac_manager_959720_recv_923450_ofs"),



    a294b1c0Ofs: exp("isaac_manager_959720_dword_4b1c0_ofs"),



    a294b19cOfs: exp("isaac_manager_959720_flag_4b19c_ofs"),



    a294b284Ofs: exp("isaac_manager_959720_word_4b284_ofs"),



    a294b284Val: exp("isaac_manager_959720_word_4b284_value"),



    a29flagClear: exp("isaac_manager_959720_flag_clear"),



    a29gAllocSz: exp("isaac_manager_959720_game_alloc_size"),



    a29mgrVa: exp("isaac_manager_959720_manager_global_va"),



    a29gameVa: exp("isaac_manager_959720_game_global_va"),



    a29h90c400: exp("isaac_manager_959720_host_90c400_va"),



    a29h959670: exp("isaac_manager_959720_host_959670_va"),



    a29hA0f4c0: exp("isaac_manager_959720_host_a0f4c0_va"),



    a29h6f1020: exp("isaac_manager_959720_host_6f1020_va"),



    a29h6f4740: exp("isaac_manager_959720_host_6f4740_va"),



    a29h90a8a0: exp("isaac_manager_959720_host_90a8a0_va"),



    a29h6eef20Va: exp("isaac_manager_959720_host_6eef20_va"),



    a29h91c770: exp("isaac_manager_959720_host_91c770_va"),



    a29h923450Va: exp("isaac_manager_959720_host_923450_va"),



    a29h6f6dd0: exp("isaac_manager_959720_host_6f6dd0_va"),



    a29h6f7750: exp("isaac_manager_959720_host_6f7750_va"),



    a29h6f5320: exp("isaac_manager_959720_host_6f5320_va"),



    a29armSeedThen: exp("isaac_manager_959720_arm_seed_then"),



    a29arm6f5850: exp("isaac_manager_959720_arm_host_6f5850"),



    a29armSeedElse: exp("isaac_manager_959720_arm_seed_else"),



    a29arm4b132: exp("isaac_manager_959720_arm_4b132"),



    a29armDaily: exp("isaac_manager_959720_arm_daily"),



    a29armDebug: exp("isaac_manager_959720_arm_debug"),



    a29armStart: exp("isaac_manager_959720_arm_start"),



    a29va: exp("isaac_manager_959720_va"),



    a29ret: exp("isaac_manager_959720_ret_va"),



    a29bytes: exp("isaac_manager_959720_body_bytes"),



    a29sites: exp("isaac_manager_959720_sites"),



    a29siteVa: exp("isaac_manager_959720_site_va"),



    a29next: exp("isaac_manager_959720_next_va"),



    c30sid: exp("isaac_manager_959670_state_id"),



    c30s1: exp("isaac_manager_959670_state1_needed"),



    c30s2: exp("isaac_manager_959670_state2_needed"),



    c30gPres: exp("isaac_manager_959670_game_present"),



    c30gBody: exp("isaac_manager_959670_game_body_needed"),



    c30mPres: exp("isaac_manager_959670_menu_present"),



    c30mBody: exp("isaac_manager_959670_menu_body_needed"),



    c30exit: exp("isaac_manager_959670_exit_save_arg"),



    c30clr: exp("isaac_manager_959670_flag_4b285_clear"),



    c30store: exp("isaac_manager_959670_value_store_needed"),



    c30recv: exp("isaac_manager_959670_host_429170_recv"),



    c30stateOfs: exp("isaac_manager_959670_state_ofs"),



    c30stOther: exp("isaac_manager_959670_state_other"),



    c30stMenu: exp("isaac_manager_959670_state_menu"),



    c30stGame: exp("isaac_manager_959670_state_game"),



    c304b284Ofs: exp("isaac_manager_959670_flag_4b284_ofs"),



    c304b285Ofs: exp("isaac_manager_959670_flag_4b285_ofs"),



    c30recvOfs: exp("isaac_manager_959670_recv_ofs"),



    c30valOfs: exp("isaac_manager_959670_value_ofs"),



    c30stepOfs: exp("isaac_manager_959670_step_ofs"),



    c30valBits: exp("isaac_manager_959670_value_store_bits"),



    c30stepBits: exp("isaac_manager_959670_step_store_bits"),



    c30tgtVa: exp("isaac_manager_959670_target_va"),



    c30gameVa: exp("isaac_manager_959670_game_global_va"),



    c30menuVa: exp("isaac_manager_959670_menu_global_va"),



    c30freeSz: exp("isaac_manager_959670_menu_free_size"),



    c30menuClr: exp("isaac_manager_959670_menu_clear"),



    c30ofs429170: exp("isaac_manager_959670_host_429170_ofs"),



    c30h6fa0c0: exp("isaac_manager_959670_host_6fa0c0_va"),



    c30h92e430: exp("isaac_manager_959670_host_92e430_va"),



    c30h429170: exp("isaac_manager_959670_host_429170_va"),



    c30h986f30: exp("isaac_manager_959670_host_986f30_va"),



    c30hAef15c: exp("isaac_manager_959670_host_aef15c_va"),



    c30epilog: exp("isaac_manager_959670_epilog_va"),



    c30mgrVa: exp("isaac_manager_959670_manager_global_va"),



    c30va: exp("isaac_manager_959670_va"),



    c30int3: exp("isaac_manager_959670_int3_va"),



    c30bytes: exp("isaac_manager_959670_body_bytes"),



    c30trap: exp("isaac_manager_959670_first_ret_trap_bytes"),



    c30sites: exp("isaac_manager_959670_sites"),



    c30site0: exp("isaac_manager_959670_site0_va"),



    c30site1: exp("isaac_manager_959670_site1_va"),



    c30site2: exp("isaac_manager_959670_site2_va"),



    c30next: exp("isaac_manager_959670_next_va"),



    c31range: exp("isaac_cutscene_95e7c0_id_in_range"),



    c31unload: exp("isaac_cutscene_95e7c0_unload_needed"),



    c31nz: exp("isaac_cutscene_95e7c0_id_nonzero"),



    c31body: exp("isaac_cutscene_95e7c0_show_body_needed"),



    c31entry: exp("isaac_cutscene_95e7c0_entry_ofs"),



    c31qgt1: exp("isaac_cutscene_95e7c0_queue_gt1"),



    c31sso: exp("isaac_cutscene_95e7c0_sso_inline"),



    c31id2: exp("isaac_cutscene_95e7c0_id_is_2"),



    c31gPres: exp("isaac_cutscene_95e7c0_game_present"),



    c31g1bb88: exp("isaac_cutscene_95e7c0_game_1bb88_needed"),



    c31e5: exp("isaac_cutscene_95e7c0_flag_e5_continue"),



    c31vec: exp("isaac_cutscene_95e7c0_vec_count"),



    c31vloop: exp("isaac_cutscene_95e7c0_vec_loop_needed"),



    c31idMax: exp("isaac_cutscene_95e7c0_id_max"),



    c31entCnt: exp("isaac_cutscene_95e7c0_entry_count"),



    c31stride: exp("isaac_cutscene_95e7c0_entry_stride"),



    c31entOfs: exp("isaac_cutscene_95e7c0_entries_ofs"),



    c31stOfs: exp("isaac_cutscene_95e7c0_state_ofs"),



    c31queued: exp("isaac_cutscene_95e7c0_queued_ofs"),



    c31ssoCap: exp("isaac_cutscene_95e7c0_sso_cap"),



    c31idSpec: exp("isaac_cutscene_95e7c0_id_special"),



    c31e5Ofs: exp("isaac_cutscene_95e7c0_flag_e5_ofs"),



    c31vbOfs: exp("isaac_cutscene_95e7c0_vec_begin_ofs"),



    c31veOfs: exp("isaac_cutscene_95e7c0_vec_end_ofs"),



    c311bb88Ofs: exp("isaac_cutscene_95e7c0_game_1bb88_ofs"),



    c31qBegin: exp("isaac_cutscene_95e7c0_queue_begin_ofs"),



    c31qEnd: exp("isaac_cutscene_95e7c0_queue_end_ofs"),



    c31qHelp: exp("isaac_cutscene_95e7c0_queue_helper_va"),



    c31recvOfs: exp("isaac_cutscene_95e7c0_recv_ofs"),



    c31argOfs: exp("isaac_cutscene_95e7c0_arg_ofs"),



    c31musIdx: exp("isaac_cutscene_95e7c0_music_index_ofs"),



    c31musStr: exp("isaac_cutscene_95e7c0_music_stride"),



    c31musVol: exp("isaac_cutscene_95e7c0_music_vol_ofs"),



    c31musRateOfs: exp("isaac_cutscene_95e7c0_music_rate_ofs"),



    c31musRate: exp("isaac_cutscene_95e7c0_music_rate_bits"),



    c31mus2a2cc: exp("isaac_cutscene_95e7c0_music_2a2cc_ofs"),



    c31828: exp("isaac_cutscene_95e7c0_store_828_ofs"),



    c31838: exp("isaac_cutscene_95e7c0_store_838_ofs"),



    c31838v: exp("isaac_cutscene_95e7c0_store_838_value"),



    c31stAfter: exp("isaac_cutscene_95e7c0_state_after"),



    c31mgrVa: exp("isaac_cutscene_95e7c0_manager_global_va"),



    c31gameVa: exp("isaac_cutscene_95e7c0_game_global_va"),



    c31h960840: exp("isaac_cutscene_95e7c0_host_960840_va"),



    c31h40e910: exp("isaac_cutscene_95e7c0_host_40e910_va"),



    c31hA112c0: exp("isaac_cutscene_95e7c0_host_a112c0_va"),



    c31h95ead0: exp("isaac_cutscene_95e7c0_host_95ead0_va"),



    c31h91c7e0: exp("isaac_cutscene_95e7c0_host_91c7e0_va"),



    c31h8fd750: exp("isaac_cutscene_95e7c0_host_8fd750_va"),



    c31h4239b0: exp("isaac_cutscene_95e7c0_host_4239b0_va"),



    c31h6eef60: exp("isaac_cutscene_95e7c0_host_6eef60_va"),



    c31va: exp("isaac_cutscene_95e7c0_va"),



    c31ret: exp("isaac_cutscene_95e7c0_ret_va"),



    c31oob: exp("isaac_cutscene_95e7c0_oob_ret_va"),



    c31int3: exp("isaac_cutscene_95e7c0_int3_va"),



    c31bytes: exp("isaac_cutscene_95e7c0_body_bytes"),



    c31trap: exp("isaac_cutscene_95e7c0_first_ret_trap_bytes"),



    c31sites: exp("isaac_cutscene_95e7c0_sites"),



    c31site: exp("isaac_cutscene_95e7c0_site_va"),



    c31next: exp("isaac_cutscene_95e7c0_next_va"),



    c32count: exp("isaac_nightmare_921ce0_players_count"),



    c32log: exp("isaac_nightmare_921ce0_players_log_needed"),



    c32map: exp("isaac_nightmare_921ce0_map_present"),



    c32found: exp("isaac_nightmare_921ce0_map_found"),



    c32strncmp: exp("isaac_nightmare_921ce0_strncmp_ok"),



    c32gfx: exp("isaac_nightmare_921ce0_gfx_needed"),



    c32sso: exp("isaac_nightmare_921ce0_sso_inline"),



    c32sprite: exp("isaac_nightmare_921ce0_sprite_ofs"),



    c32dogma: exp("isaac_nightmare_921ce0_dogma"),



    c32col: exp("isaac_nightmare_921ce0_collectible_path_needed"),



    c324b1: exp("isaac_nightmare_921ce0_flag_4b1_continue"),



    c32bool: exp("isaac_nightmare_921ce0_bool_arg"),



    c32mus: exp("isaac_nightmare_921ce0_music_id"),



    c32stC: exp("isaac_nightmare_921ce0_stage_is_c"),



    c32stD: exp("isaac_nightmare_921ce0_stage_is_d"),



    c32owner: exp("isaac_nightmare_921ce0_owner_present"),



    c32mapKey: exp("isaac_nightmare_921ce0_map_key"),



    c32ssoCap: exp("isaac_nightmare_921ce0_sso_cap"),



    c32stride: exp("isaac_nightmare_921ce0_sprite_stride"),



    c32dogmaOfs: exp("isaac_nightmare_921ce0_dogma_ofs"),



    c32boolOfs: exp("isaac_nightmare_921ce0_bool_store_ofs"),



    c32musN: exp("isaac_nightmare_921ce0_music_id_normal"),



    c32musD: exp("isaac_nightmare_921ce0_music_id_dogma"),



    c32va: exp("isaac_nightmare_921ce0_va"),



    c32ret: exp("isaac_nightmare_921ce0_ret_va"),



    c32int3: exp("isaac_nightmare_921ce0_int3_va"),



    c32bytes: exp("isaac_nightmare_921ce0_body_bytes"),



    c32trap: exp("isaac_nightmare_921ce0_first_ret_trap_bytes"),



    c32sites: exp("isaac_nightmare_921ce0_sites"),



    c32site: exp("isaac_nightmare_921ce0_site_va"),



    c32sib: exp("isaac_nightmare_921ce0_sibling_va"),



    c32next: exp("isaac_nightmare_921ce0_next_va"),



    c32beginOfs: exp("isaac_nightmare_921ce0_players_begin_ofs"),



    c32endOfs: exp("isaac_nightmare_921ce0_players_end_ofs"),



    c32logLvl: exp("isaac_nightmare_921ce0_log_level"),



    c32logMsg: exp("isaac_nightmare_921ce0_log_msg_va"),



    c32path: exp("isaac_nightmare_921ce0_path_va"),



    c32hostE: exp("isaac_nightmare_921ce0_va"),
    c33twin: exp("isaac_fco_9be080_twin_walk_flag"),



    c33empty: exp("isaac_fco_9be080_list_empty"),



    c33slot: exp("isaac_fco_9be080_slot_checkable"),



    c33hit: exp("isaac_fco_9be080_has_collectible_hit"),



    c33twinP: exp("isaac_fco_9be080_twin_present"),



    c33need: exp("isaac_fco_9be080_twin_check_needed"),



    c33walk: exp("isaac_fco_9be080_walk_next"),



    c33cont: exp("isaac_fco_9be080_walk_continue"),



    c33rPlayer: exp("isaac_fco_9be080_result_player"),



    c33rTwin: exp("isaac_fco_9be080_result_twin"),



    c33rNone: exp("isaac_fco_9be080_result_not_found"),



    c33itemOfs: exp("isaac_fco_9be080_item_config_ofs"),



    c33gcol: exp("isaac_fco_9be080_get_collectible_va"),



    c33hascol: exp("isaac_fco_9be080_has_collectible_va"),



    c33flagsOfs: exp("isaac_fco_9be080_item_flags_ofs"),



    c33twinBit: exp("isaac_fco_9be080_twin_bit"),



    c33lBegin: exp("isaac_fco_9be080_list_begin_ofs"),



    c33lEnd: exp("isaac_fco_9be080_list_end_ofs"),



    c33stride: exp("isaac_fco_9be080_list_stride"),



    c33slotOfs: exp("isaac_fco_9be080_slot_flag_ofs"),



    c33twinOfs: exp("isaac_fco_9be080_twin_ptr_ofs"),



    c33lazOfs: exp("isaac_fco_9be080_laz_arg_ofs"),



    c33mgr: exp("isaac_fco_9be080_manager_global_va"),



    c33va: exp("isaac_fco_9be080_va"),



    c33ret: exp("isaac_fco_9be080_ret_va"),



    c33firstRet: exp("isaac_fco_9be080_first_ret_va"),



    c33int3: exp("isaac_fco_9be080_int3_va"),



    c33bytes: exp("isaac_fco_9be080_body_bytes"),



    c33sites: exp("isaac_fco_9be080_sites"),



    c33site: exp("isaac_fco_9be080_site_va"),



    c33site2: exp("isaac_fco_9be080_site2_va"),



    c33nextVa: exp("isaac_fco_9be080_next_va"),



    c35count: exp("isaac_a9be2a0_players_count"),



    c35mask: exp("isaac_a9be2a0_id_mask15"),



    c35oor: exp("isaac_a9be2a0_direct_index_oor"),



    c35slot: exp("isaac_a9be2a0_direct_player_ptr"),



    c35flag: exp("isaac_a9be2a0_twin_flag"),



    c35empty: exp("isaac_a9be2a0_list_empty"),



    c35chk: exp("isaac_a9be2a0_slot_checkable"),



    c35hit: exp("isaac_a9be2a0_has_collectible_hit"),



    c35need: exp("isaac_a9be2a0_twin_check_needed"),



    c35walk: exp("isaac_a9be2a0_walk_next"),



    c35cont: exp("isaac_a9be2a0_walk_continue"),



    c35out: exp("isaac_a9be2a0_out_present"),



    c35neg: exp("isaac_a9be2a0_id_negative"),



    c35ccount: exp("isaac_a9be2a0_collect_count"),



    c35oob: exp("isaac_a9be2a0_id_oob"),



    c35log: exp("isaac_a9be2a0_log_needed"),



    c35cm1: exp("isaac_a9be2a0_collect_count_minus1"),



    c35clamp: exp("isaac_a9be2a0_collect_index_clamp"),



    c35cptr: exp("isaac_a9be2a0_collect_entry_ptr"),



    c35twinR: exp("isaac_a9be2a0_twin_result"),



    c35none: exp("isaac_a9be2a0_result_not_found"),



    c35rPlayer: exp("isaac_a9be2a0_result_player"),



    c35zero: exp("isaac_a9be2a0_store_zero_value"),



    c35pBegin: exp("isaac_a9be2a0_players_begin_ofs"),



    c35pEnd: exp("isaac_a9be2a0_players_end_ofs"),



    c35lBegin: exp("isaac_a9be2a0_list_begin_ofs"),



    c35lEnd: exp("isaac_a9be2a0_list_end_ofs"),



    c35stride: exp("isaac_a9be2a0_list_stride"),



    c35slotOfs: exp("isaac_a9be2a0_slot_flag_ofs"),



    c35flagsOfs: exp("isaac_a9be2a0_item_flags_ofs"),



    c35twinBit: exp("isaac_a9be2a0_twin_bit"),



    c35twinOfs: exp("isaac_a9be2a0_twin_ptr_ofs"),



    c35cBegin: exp("isaac_a9be2a0_collect_begin_ofs"),



    c35cEnd: exp("isaac_a9be2a0_collect_end_ofs"),



    c35cStride: exp("isaac_a9be2a0_collect_stride"),



    c35idMask: exp("isaac_a9be2a0_id_mask"),



    c35mgr: exp("isaac_a9be2a0_manager_global_va"),



    c35game: exp("isaac_a9be2a0_game_global_va"),



    c35recv: exp("isaac_a9be2a0_receiver_ofs"),



    c35hascol: exp("isaac_a9be2a0_has_collectible_va"),



    c35twinGet: exp("isaac_a9be2a0_twin_get_va"),



    c35hostLog: exp("isaac_a9be2a0_host_log_va"),



    c35oobMsg: exp("isaac_a9be2a0_oob_msg_va"),



    c35logLvl: exp("isaac_a9be2a0_log_level"),



    c35va: exp("isaac_a9be2a0_va"),



    c35ret: exp("isaac_a9be2a0_ret_va"),



    c35firstRet: exp("isaac_a9be2a0_first_ret_va"),



    c35int3: exp("isaac_a9be2a0_int3_va"),



    c35bytes: exp("isaac_a9be2a0_body_bytes"),



    c35sites: exp("isaac_a9be2a0_sites"),



    c35site: exp("isaac_a9be2a0_site_va"),



    c35nextVa: exp("isaac_a9be2a0_next_va"),

    c36empty: exp("isaac_rto_9be3e0_list_empty"),
    c36chk: exp("isaac_rto_9be3e0_slot_checkable"),
    c36hit: exp("isaac_rto_9be3e0_has_collectible_hit"),
    c36seed: exp("isaac_rto_9be3e0_seed_assert_needed"),
    c36xs: exp("isaac_rto_9be3e0_xorshift_state"),
    c36f64: exp("isaac_rto_9be3e0_state_as_f64"),
    c36nf: exp("isaac_rto_9be3e0_next_float"),
    c36buy: exp("isaac_rto_9be3e0_best_update_needed"),
    c36walk: exp("isaac_rto_9be3e0_walk_next"),
    c36cont: exp("isaac_rto_9be3e0_walk_continue"),
    c36out: exp("isaac_rto_9be3e0_out_present"),
    c36win: exp("isaac_rto_9be3e0_winner_present"),
    c36neg: exp("isaac_rto_9be3e0_id_negative"),
    c36ccount: exp("isaac_rto_9be3e0_collectible_count"),
    c36oob: exp("isaac_rto_9be3e0_collectible_id_oob"),
    c36log: exp("isaac_rto_9be3e0_log_needed"),
    c36cm1: exp("isaac_rto_9be3e0_collectible_count_minus1"),
    c36clamp: exp("isaac_rto_9be3e0_collectible_index_clamp"),
    c36cptr: exp("isaac_rto_9be3e0_collectible_entry_ptr"),
    c36rPlayer: exp("isaac_rto_9be3e0_result_player"),
    c36zero: exp("isaac_rto_9be3e0_store_zero_value"),
    c36lBegin: exp("isaac_rto_9be3e0_list_begin_ofs"),
    c36lEnd: exp("isaac_rto_9be3e0_list_end_ofs"),
    c36stride: exp("isaac_rto_9be3e0_list_stride"),
    c36slotOfs: exp("isaac_rto_9be3e0_slot_flag_ofs"),
    c36cBegin: exp("isaac_rto_9be3e0_collect_begin_ofs"),
    c36cEnd: exp("isaac_rto_9be3e0_collect_end_ofs"),
    c36cStride: exp("isaac_rto_9be3e0_collect_stride"),
    c36seedMsg: exp("isaac_rto_9be3e0_seed_assert_msg_va"),
    c36oobMsg: exp("isaac_rto_9be3e0_oob_assert_msg_va"),
    c36logLvl: exp("isaac_rto_9be3e0_log_level"),
    c36trap: exp("isaac_rto_9be3e0_assert_trap_va"),
    c36hascol: exp("isaac_rto_9be3e0_has_collectible_va"),
    c36hostLog: exp("isaac_rto_9be3e0_host_log_va"),
    c36game: exp("isaac_rto_9be3e0_game_global_va"),
    c36recv: exp("isaac_rto_9be3e0_receiver_ofs"),
    c36rngTab: exp("isaac_rto_9be3e0_rng_shift_table_va"),
    c36s1: exp("isaac_rto_9be3e0_rng_shift1"),
    c36s2: exp("isaac_rto_9be3e0_rng_shift2"),
    c36s3: exp("isaac_rto_9be3e0_rng_shift3"),
    c36bestBits: exp("isaac_rto_9be3e0_best_init_bits"),
    c36scaleBits: exp("isaac_rto_9be3e0_scale_bits"),
    c36signCorr: exp("isaac_rto_9be3e0_sign_corr_table_va"),
    c36bestVal: exp("isaac_rto_9be3e0_best_init_value"),
    c36scaleVal: exp("isaac_rto_9be3e0_scale_value"),
    c36va: exp("isaac_rto_9be3e0_va"),
    c36ret: exp("isaac_rto_9be3e0_ret_va"),
    c36firstRet: exp("isaac_rto_9be3e0_first_ret_va"),
    c36int3: exp("isaac_rto_9be3e0_int3_va"),
    c36bytes: exp("isaac_rto_9be3e0_body_bytes"),
    c36sites: exp("isaac_rto_9be3e0_sites"),
    c36nextVa: exp("isaac_rto_9be3e0_next_va"),

    c37empty: exp("isaac_a9be530_list_empty"),
    c37chk: exp("isaac_a9be530_slot_checkable"),
    c37f202c: exp("isaac_a9be530_flag202c_checkable"),
    c37f20a9: exp("isaac_a9be530_flag20a9_checkable"),
    c37charge: exp("isaac_a9be530_charge_ok"),
    c37seed: exp("isaac_a9be530_seed_assert_needed"),
    c37xs: exp("isaac_a9be530_xorshift_state"),
    c37f64: exp("isaac_a9be530_state_as_f64"),
    c37nf: exp("isaac_a9be530_next_float"),
    c37buy: exp("isaac_a9be530_best_update_needed"),
    c37walk: exp("isaac_a9be530_walk_next"),
    c37cont: exp("isaac_a9be530_walk_continue"),
    c37rPlayer: exp("isaac_a9be530_result_player"),
    c37lBegin: exp("isaac_a9be530_list_begin_ofs"),
    c37lEnd: exp("isaac_a9be530_list_end_ofs"),
    c37stride: exp("isaac_a9be530_list_stride"),
    c37slotOfs: exp("isaac_a9be530_slot_flag_ofs"),
    c37f202cOfs: exp("isaac_a9be530_flag202c_ofs"),
    c37f20a9Ofs: exp("isaac_a9be530_flag20a9_ofs"),
    c37chargeOfs: exp("isaac_a9be530_charge_ofs"),
    c37chargeMin: exp("isaac_a9be530_charge_min"),
    c37seedMsg: exp("isaac_a9be530_seed_assert_msg_va"),
    c37logLvl: exp("isaac_a9be530_log_level"),
    c37trap: exp("isaac_a9be530_assert_trap_va"),
    c37hostLog: exp("isaac_a9be530_host_log_va"),
    c37rngTab: exp("isaac_a9be530_rng_shift_table_va"),
    c37s1: exp("isaac_a9be530_rng_shift1"),
    c37s2: exp("isaac_a9be530_rng_shift2"),
    c37s3: exp("isaac_a9be530_rng_shift3"),
    c37bestBits: exp("isaac_a9be530_best_init_bits"),
    c37scaleBits: exp("isaac_a9be530_scale_bits"),
    c37signCorr: exp("isaac_a9be530_sign_corr_table_va"),
    c37bestVal: exp("isaac_a9be530_best_init_value"),
    c37scaleVal: exp("isaac_a9be530_scale_value"),
    c37va: exp("isaac_a9be530_va"),
    c37ret: exp("isaac_a9be530_ret_va"),
    c37firstRet: exp("isaac_a9be530_first_ret_va"),
    c37int3: exp("isaac_a9be530_int3_va"),
    c37bytes: exp("isaac_a9be530_body_bytes"),
    c37sites: exp("isaac_a9be530_sites"),
    c37nextVa: exp("isaac_a9be530_next_va"),

    c38empty: exp("isaac_a9be630_list_empty"),
    c38chk: exp("isaac_a9be630_slot_checkable"),
    c38f20a9: exp("isaac_a9be630_flag20a9_checkable"),
    c38match: exp("isaac_a9be630_slot_matches"),
    c38walk: exp("isaac_a9be630_walk_next"),
    c38cont: exp("isaac_a9be630_walk_continue"),
    c38notFound: exp("isaac_a9be630_result_notfound"),
    c38found: exp("isaac_a9be630_result_found"),
    c38lBegin: exp("isaac_a9be630_list_begin_ofs"),
    c38lEnd: exp("isaac_a9be630_list_end_ofs"),
    c38stride: exp("isaac_a9be630_list_stride"),
    c38slotOfs: exp("isaac_a9be630_slot_flag_ofs"),
    c38f20a9Ofs: exp("isaac_a9be630_flag20a9_ofs"),
    c38slotValOfs: exp("isaac_a9be630_slot_value_ofs"),
    c38va: exp("isaac_a9be630_va"),
    c38ret: exp("isaac_a9be630_ret_va"),
    c38firstRet: exp("isaac_a9be630_first_ret_va"),
    c38int3: exp("isaac_a9be630_int3_va"),
    c38bytes: exp("isaac_a9be630_body_bytes"),
    c38sites: exp("isaac_a9be630_sites"),
    c38nextVa: exp("isaac_a9be630_next_va"),

    c39empty: exp("isaac_a9be670_list_empty"),
    c39chk: exp("isaac_a9be670_slot_checkable"),
    c39f20a9: exp("isaac_a9be670_flag20a9_checkable"),
    c39eq: exp("isaac_a9be670_slot_equals_needle"),
    c39walk: exp("isaac_a9be670_walk_next"),
    c39cont: exp("isaac_a9be670_walk_continue"),
    c39true: exp("isaac_a9be670_result_true"),
    c39false: exp("isaac_a9be670_result_false"),
    c39lBegin: exp("isaac_a9be670_list_begin_ofs"),
    c39lEnd: exp("isaac_a9be670_list_end_ofs"),
    c39stride: exp("isaac_a9be670_list_stride"),
    c39slotOfs: exp("isaac_a9be670_slot_flag_ofs"),
    c39f20a9Ofs: exp("isaac_a9be670_flag20a9_ofs"),
    c39slotValOfs: exp("isaac_a9be670_slot_value_ofs"),
    c39needle: exp("isaac_a9be670_slot_needle"),
    c39va: exp("isaac_a9be670_va"),
    c39ret: exp("isaac_a9be670_ret_va"),
    c39firstRet: exp("isaac_a9be670_first_ret_va"),
    c39int3: exp("isaac_a9be670_int3_va"),
    c39bytes: exp("isaac_a9be670_body_bytes"),
    c39sites: exp("isaac_a9be670_sites"),
    c39nextVa: exp("isaac_a9be670_next_va"),

    c6bEmpty: exp("isaac_a9be6b0_list_empty"),
    c6bFieldNz: exp("isaac_a9be6b0_field_nonzero"),
    c6bFieldEq: exp("isaac_a9be6b0_field_eq_needle"),
    c6bF2ef0: exp("isaac_a9be6b0_flag2ef0_set"),
    c6bGt1: exp("isaac_a9be6b0_status_gt1"),
    c6bGt0: exp("isaac_a9be6b0_status_gt0"),
    c6bBl: exp("isaac_a9be6b0_bl_forced"),
    c6bAcc: exp("isaac_a9be6b0_accept_needed"),
    c6bWin: exp("isaac_a9be6b0_winner_store_needed"),
    c6bWalk: exp("isaac_a9be6b0_walk_next"),
    c6bCont: exp("isaac_a9be6b0_walk_continue"),
    c6bPlayer: exp("isaac_a9be6b0_result_player"),
    c6bWinner: exp("isaac_a9be6b0_result_winner"),
    c6bLBegin: exp("isaac_a9be6b0_list_begin_ofs"),
    c6bLEnd: exp("isaac_a9be6b0_list_end_ofs"),
    c6bStride: exp("isaac_a9be6b0_list_stride"),
    c6bF2ef8Ofs: exp("isaac_a9be6b0_field_2ef8_ofs"),
    c6bF2ef0Ofs: exp("isaac_a9be6b0_flag_2ef0_ofs"),
    c6bQArg1: exp("isaac_a9be6b0_query_arg1"),
    c6bQArg2: exp("isaac_a9be6b0_query_arg2"),
    c6bStatusVa: exp("isaac_a9be6b0_status_call_va"),
    c6bQueryVa: exp("isaac_a9be6b0_query_call_va"),
    c6bVa: exp("isaac_a9be6b0_va"),
    c6bRet: exp("isaac_a9be6b0_ret_va"),
    c6bFirstRet: exp("isaac_a9be6b0_first_ret_va"),
    c6bInt3: exp("isaac_a9be6b0_int3_va"),
    c6bBytes: exp("isaac_a9be6b0_body_bytes"),
    c6bSites: exp("isaac_a9be6b0_sites"),
    c6bNextVa: exp("isaac_a9be6b0_next_va"),

    c40flag: exp("isaac_gnc_9be750_twin_flag"),
    c40empty: exp("isaac_gnc_9be750_list_empty"),
    c40chk: exp("isaac_gnc_9be750_slot_checkable"),
    c40add: exp("isaac_gnc_9be750_count_add"),
    c40twin: exp("isaac_gnc_9be750_twin_call_needed"),
    c40walk: exp("isaac_gnc_9be750_walk_next"),
    c40cont: exp("isaac_gnc_9be750_walk_continue"),
    c40sum: exp("isaac_gnc_9be750_result_sum"),
    c40lBegin: exp("isaac_gnc_9be750_list_begin_ofs"),
    c40lEnd: exp("isaac_gnc_9be750_list_end_ofs"),
    c40stride: exp("isaac_gnc_9be750_list_stride"),
    c40slotOfs: exp("isaac_gnc_9be750_slot_flag_ofs"),
    c40twinOfs: exp("isaac_gnc_9be750_twin_ptr_ofs"),
    c40flagsOfs: exp("isaac_gnc_9be750_twin_flags_ofs"),
    c40bit: exp("isaac_gnc_9be750_twin_bit"),
    c40mgr: exp("isaac_gnc_9be750_manager_global_va"),
    c40game: exp("isaac_gnc_9be750_game_global_va"),
    c40recv: exp("isaac_gnc_9be750_receiver_ofs"),
    c40twinCont: exp("isaac_gnc_9be750_twin_container_ofs"),
    c40twinGet: exp("isaac_gnc_9be750_host_twin_get_va"),
    c40countVa: exp("isaac_gnc_9be750_host_count_va"),
    c40va: exp("isaac_gnc_9be750_va"),
    c40ret: exp("isaac_gnc_9be750_ret_va"),
    c40int3: exp("isaac_gnc_9be750_int3_va"),
    c40bytes: exp("isaac_gnc_9be750_body_bytes"),
    c40sites: exp("isaac_gnc_9be750_sites"),
    c40site: exp("isaac_gnc_9be750_site_va"),
    c40nextVa: exp("isaac_gnc_9be750_next_va"),
    c41empty: exp("isaac_hte_9be7f0_list_empty"),
    c41chk: exp("isaac_hte_9be7f0_slot_checkable"),
    c41f1519: exp("isaac_hte_9be7f0_flag1519_checkable"),
    c41vEmpty: exp("isaac_hte_9be7f0_vec_not_empty"),
    c41hit: exp("isaac_hte_9be7f0_entry_hit"),
    c41vWalk: exp("isaac_hte_9be7f0_vec_walk_next"),
    c41vCont: exp("isaac_hte_9be7f0_vec_walk_continue"),
    c41walk: exp("isaac_hte_9be7f0_walk_next"),
    c41cont: exp("isaac_hte_9be7f0_walk_continue"),
    c41found: exp("isaac_hte_9be7f0_result_found"),
    c41nfound: exp("isaac_hte_9be7f0_result_not_found"),
    c41lBegin: exp("isaac_hte_9be7f0_list_begin_ofs"),
    c41lEnd: exp("isaac_hte_9be7f0_list_end_ofs"),
    c41stride: exp("isaac_hte_9be7f0_list_stride"),
    c41slotOfs: exp("isaac_hte_9be7f0_slot_flag_ofs"),
    c41flagOfs: exp("isaac_hte_9be7f0_flag1519_ofs"),
    c41vBeginOfs: exp("isaac_hte_9be7f0_vec_begin_ofs"),
    c41vEndOfs: exp("isaac_hte_9be7f0_vec_end_ofs"),
    c41vStride: exp("isaac_hte_9be7f0_vec_stride"),
    c41va: exp("isaac_hte_9be7f0_va"),
    c41firstRet: exp("isaac_hte_9be7f0_first_ret_va"),
    c41ret: exp("isaac_hte_9be7f0_ret_va"),
    c41int3: exp("isaac_hte_9be7f0_int3_va"),
    c41bytes: exp("isaac_hte_9be7f0_body_bytes"),
    c41sites: exp("isaac_hte_9be7f0_sites"),
    c41site: exp("isaac_hte_9be7f0_site_va"),
    c41site2: exp("isaac_hte_9be7f0_site2_va"),
    c41nextVa: exp("isaac_hte_9be7f0_next_va"),
    c42count: exp("isaac_a9be850_list_count"),
    c42loop: exp("isaac_a9be850_loop_needed"),
    c42gate: exp("isaac_a9be850_host_gate_needed"),
    c42slot: exp("isaac_a9be850_slot_present"),
    c42twin: exp("isaac_a9be850_twin_present"),
    c42f1519: exp("isaac_a9be850_flag1519_clear"),
    c42tvec: exp("isaac_a9be850_twin_vec_not_empty"),
    c42mark: exp("isaac_a9be850_marker_hit"),
    c42vWalk: exp("isaac_a9be850_vec_walk_next"),
    c42vCont: exp("isaac_a9be850_vec_walk_continue"),
    c42walk: exp("isaac_a9be850_walk_next"),
    c42cont: exp("isaac_a9be850_walk_continue"),
    c42lBegin: exp("isaac_a9be850_list_begin_ofs"),
    c42lEnd: exp("isaac_a9be850_list_end_ofs"),
    c42stride: exp("isaac_a9be850_list_stride"),
    c42mgr: exp("isaac_a9be850_manager_global_va"),
    c42vecAB: exp("isaac_a9be850_vec_a_begin_ofs"),
    c42vecAE: exp("isaac_a9be850_vec_a_end_ofs"),
    c42slotOfs: exp("isaac_a9be850_vec_a_slot_ofs"),
    c42thresh: exp("isaac_a9be850_host_gate_threshold"),
    c42mask: exp("isaac_a9be850_host_gate_mask"),
    c42slotF: exp("isaac_a9be850_slot_field_ofs"),
    c42recv: exp("isaac_a9be850_host_receiver_ofs"),
    c42twinOfs: exp("isaac_a9be850_twin_field_ofs"),
    c42flagOfs: exp("isaac_a9be850_flag1519_ofs"),
    c42tvecB: exp("isaac_a9be850_twin_vec_begin_ofs"),
    c42tvecE: exp("isaac_a9be850_twin_vec_end_ofs"),
    c42tvecS: exp("isaac_a9be850_twin_vec_stride"),
    c42m0: exp("isaac_a9be850_marker_field0_value"),
    c42m4: exp("isaac_a9be850_marker_field4_value"),
    c42hostVa: exp("isaac_a9be850_host_va"),
    c42arg2: exp("isaac_a9be850_host_arg2"),
    c42arg3: exp("isaac_a9be850_host_arg3"),
    c42game: exp("isaac_a9be850_game_global_va"),
    c42recvOfs: exp("isaac_a9be850_receiver_ofs"),
    c42arg1: exp("isaac_a9be850_caller_arg1"),
    c42va: exp("isaac_a9be850_va"),
    c42ret: exp("isaac_a9be850_ret_va"),
    c42int3: exp("isaac_a9be850_int3_va"),
    c42bytes: exp("isaac_a9be850_body_bytes"),
    c42sites: exp("isaac_a9be850_sites"),
    c42site: exp("isaac_a9be850_site_va"),
    c42nextVa: exp("isaac_a9be850_next_va"),
    c43hit: exp("isaac_a9be990_hit"),
    c43empty: exp("isaac_a9be990_list_empty"),
    c43walk: exp("isaac_a9be990_walk_next"),
    c43cont: exp("isaac_a9be990_walk_continue"),
    c43lBegin: exp("isaac_a9be990_list_begin_ofs"),
    c43lEnd: exp("isaac_a9be990_list_end_ofs"),
    c43stride: exp("isaac_a9be990_list_stride"),
    c43slotOfs: exp("isaac_a9be990_slot_field_ofs"),
    c43skip0: exp("isaac_a9be990_skip_code_zero"),
    c43skip3: exp("isaac_a9be990_skip_code_three"),
    c43mgr: exp("isaac_a9be990_manager_global_va"),
    c43recv: exp("isaac_a9be990_receiver_ofs"),
    c43va: exp("isaac_a9be990_va"),
    c43firstRet: exp("isaac_a9be990_first_ret_va"),
    c43ret: exp("isaac_a9be990_ret_va"),
    c43int3: exp("isaac_a9be990_int3_va"),
    c43bytes: exp("isaac_a9be990_body_bytes"),
    c43sites: exp("isaac_a9be990_sites"),
    c43site: exp("isaac_a9be990_site_va"),
    c43site2: exp("isaac_a9be990_site2_va"),
    c43nextVa: exp("isaac_a9be990_next_va"),
    c44empty: exp("isaac_a9be9c0_list_empty"),
    c44flag: exp("isaac_a9be9c0_flag20a9_checkable"),
    c44field: exp("isaac_a9be9c0_field184_found"),
    c44walk: exp("isaac_a9be9c0_walk_next"),
    c44cont: exp("isaac_a9be9c0_walk_continue"),
    c44lBegin: exp("isaac_a9be9c0_list_begin_ofs"),
    c44lEnd: exp("isaac_a9be9c0_list_end_ofs"),
    c44stride: exp("isaac_a9be9c0_list_stride"),
    c44flagOfs: exp("isaac_a9be9c0_flag20a9_ofs"),
    c44fieldOfs: exp("isaac_a9be9c0_field184_ofs"),
    c44fc0: exp("isaac_a9be9c0_found_code_zero"),
    c44fc1: exp("isaac_a9be9c0_found_code_one"),
    c44fc2: exp("isaac_a9be9c0_found_code_two"),
    c44fc3: exp("isaac_a9be9c0_found_code_three"),
    c44mgr: exp("isaac_a9be9c0_manager_global_va"),
    c44recv: exp("isaac_a9be9c0_receiver_ofs"),
    c44getter: exp("isaac_a9be9c0_receiver_getter_va"),
    c44va: exp("isaac_a9be9c0_va"),
    c44firstRet: exp("isaac_a9be9c0_first_ret_va"),
    c44ret: exp("isaac_a9be9c0_ret_va"),
    c44int3: exp("isaac_a9be9c0_int3_va"),
    c44bytes: exp("isaac_a9be9c0_body_bytes"),
    c44sites: exp("isaac_a9be9c0_sites"),
    c44site: exp("isaac_a9be9c0_site_va"),
    c44nextVa: exp("isaac_a9be9c0_next_va"),
    c45empty: exp("isaac_a9bea40_list_empty"),
    c45slot: exp("isaac_a9bea40_slot_checkable"),
    c45flag: exp("isaac_a9bea40_flag20a9_checkable"),
    c45add: exp("isaac_a9bea40_field156c_add_ss"),
    c45walk: exp("isaac_a9bea40_walk_next"),
    c45cont: exp("isaac_a9bea40_walk_continue"),
    c45lBegin: exp("isaac_a9bea40_list_begin_ofs"),
    c45lEnd: exp("isaac_a9bea40_list_end_ofs"),
    c45stride: exp("isaac_a9bea40_list_stride"),
    c45slotOfs: exp("isaac_a9bea40_slot_flag_ofs"),
    c45flagOfs: exp("isaac_a9bea40_flag20a9_ofs"),
    c45fieldOfs: exp("isaac_a9bea40_field156c_ofs"),
    c45mgr: exp("isaac_a9bea40_manager_global_va"),
    c45recv: exp("isaac_a9bea40_receiver_ofs"),
    c45getter: exp("isaac_a9bea40_receiver_getter_va"),
    c45va: exp("isaac_a9bea40_va"),
    c45firstRet: exp("isaac_a9bea40_first_ret_va"),
    c45ret: exp("isaac_a9bea40_ret_va"),
    c45int3: exp("isaac_a9bea40_int3_va"),
    c45bytes: exp("isaac_a9bea40_body_bytes"),
    c45sites: exp("isaac_a9bea40_sites"),
    c45site0: exp("isaac_a9bea40_site0_va"),
    c45site1: exp("isaac_a9bea40_site1_va"),
    c45site2: exp("isaac_a9bea40_site2_va"),
    c45nextVa: exp("isaac_a9bea40_next_va"),
    c46mask: exp("isaac_gtm_9bea80_id_mask"),
    c46count: exp("isaac_gtm_9bea80_list_count"),
    c46range: exp("isaac_gtm_9bea80_range_gate"),
    c46slotPresent: exp("isaac_gtm_9bea80_slot_present"),
    c46flag: exp("isaac_gtm_9bea80_slot_flag"),
    c46empty: exp("isaac_gtm_9bea80_list_empty"),
    c46slot: exp("isaac_gtm_9bea80_slot_checkable"),
    c46sum: exp("isaac_gtm_9bea80_sum_add"),
    c46twin: exp("isaac_gtm_9bea80_twin_call_needed"),
    c46walk: exp("isaac_gtm_9bea80_walk_next"),
    c46cont: exp("isaac_gtm_9bea80_walk_continue"),
    c46resSum: exp("isaac_gtm_9bea80_result_sum"),
    c46lBegin: exp("isaac_gtm_9bea80_list_begin_ofs"),
    c46lEnd: exp("isaac_gtm_9bea80_list_end_ofs"),
    c46stride: exp("isaac_gtm_9bea80_list_stride"),
    c46slotOfs: exp("isaac_gtm_9bea80_slot_flag_ofs"),
    c46twinOfs: exp("isaac_gtm_9bea80_twin_ptr_ofs"),
    c46arrB: exp("isaac_gtm_9bea80_slot_array_begin_ofs"),
    c46arrE: exp("isaac_gtm_9bea80_slot_array_end_ofs"),
    c46maskVal: exp("isaac_gtm_9bea80_mask"),
    c46flagsOfs: exp("isaac_gtm_9bea80_twin_flags_ofs"),
    c46flagBit: exp("isaac_gtm_9bea80_twin_flag_bit"),
    c46mgr: exp("isaac_gtm_9bea80_manager_global_va"),
    c46game: exp("isaac_gtm_9bea80_game_global_va"),
    c46recv: exp("isaac_gtm_9bea80_receiver_ofs"),
    c46statusVa: exp("isaac_gtm_9bea80_host_status_va"),
    c46va: exp("isaac_gtm_9bea80_va"),
    c46firstRet: exp("isaac_gtm_9bea80_first_ret_va"),
    c46ret: exp("isaac_gtm_9bea80_ret_va"),
    c46int3: exp("isaac_gtm_9bea80_int3_va"),
    c46bytes: exp("isaac_gtm_9bea80_body_bytes"),
    c46sites: exp("isaac_gtm_9bea80_sites"),
    c46nextVa: exp("isaac_gtm_9bea80_next_va"),
    c47argByte: exp("isaac_a9beb30_arg_byte"),
    c47mode: exp("isaac_a9beb30_mode_and"),
    c47empty: exp("isaac_a9beb30_list_empty"),
    c47slot: exp("isaac_a9beb30_slot_checkable"),
    c47flag20a9: exp("isaac_a9beb30_flag20a9_checkable"),
    c47chargeSum: exp("isaac_a9beb30_charge_sum"),
    c47charge: exp("isaac_a9beb30_charge_gate"),
    c47host: exp("isaac_a9beb30_host_match"),
    c47comb: exp("isaac_a9beb30_combine"),
    c47walk: exp("isaac_a9beb30_walk_next"),
    c47cont: exp("isaac_a9beb30_walk_continue"),
    c47resByte: exp("isaac_a9beb30_result_byte"),
    c47lBegin: exp("isaac_a9beb30_list_begin_ofs"),
    c47lEnd: exp("isaac_a9beb30_list_end_ofs"),
    c47stride: exp("isaac_a9beb30_list_stride"),
    c47slotOfs: exp("isaac_a9beb30_slot_flag_ofs"),
    c47flag20a9Ofs: exp("isaac_a9beb30_flag20a9_ofs"),
    c47chargeOfs: exp("isaac_a9beb30_charge_ofs"),
    c47addendOfs: exp("isaac_a9beb30_charge_addend_ofs"),
    c47maxOfs: exp("isaac_a9beb30_charge_max_ofs"),
    c47mgr: exp("isaac_a9beb30_manager_global_va"),
    c47recv: exp("isaac_a9beb30_receiver_ofs"),
    c47curseVa: exp("isaac_a9beb30_host_curse_va"),
    c47va: exp("isaac_a9beb30_va"),
    c47firstRet: exp("isaac_a9beb30_first_ret_va"),
    c47ret: exp("isaac_a9beb30_ret_va"),
    c47int3: exp("isaac_a9beb30_int3_va"),
    c47bytes: exp("isaac_a9beb30_body_bytes"),
    c47sites: exp("isaac_a9beb30_sites"),
    c47site0: exp("isaac_a9beb30_site0_va"),
    c47site1: exp("isaac_a9beb30_site1_va"),
    c47site2: exp("isaac_a9beb30_site2_va"),
    c47nextVa: exp("isaac_a9beb30_next_va"),
    c48mode: exp("isaac_a9beba0_mode_fast"),
    c48fresh: exp("isaac_a9beba0_cache_fresh"),
    c48count: exp("isaac_a9beba0_list_count"),
    c48inrange: exp("isaac_a9beba0_idx_in_range"),
    c48slot: exp("isaac_a9beba0_slot_eligible"),
    c48watch: exp("isaac_a9beba0_watch_gate"),
    c48flag20a9: exp("isaac_a9beba0_flag20a9_gate"),
    c48cand: exp("isaac_a9beba0_player_candidate"),
    c48match: exp("isaac_a9beba0_lookup_match"),
    c48scanEmpty: exp("isaac_a9beba0_scan_empty"),
    c48scanCont: exp("isaac_a9beba0_scan_continue"),
    c48accumGate: exp("isaac_a9beba0_accum_gate"),
    c48pred: exp("isaac_a9beba0_pred_match"),
    c48accX: exp("isaac_a9beba0_accum_x"),
    c48accY: exp("isaac_a9beba0_accum_y"),
    c48cntInc: exp("isaac_a9beba0_count_inc"),
    c48hasAvg: exp("isaac_a9beba0_has_avg"),
    c48avgX: exp("isaac_a9beba0_avg_x"),
    c48avgY: exp("isaac_a9beba0_avg_y"),
    c48fbX: exp("isaac_a9beba0_fallback_x"),
    c48fbY: exp("isaac_a9beba0_fallback_y"),
    c48assert: exp("isaac_a9beba0_assert_needed"),
    c48lBegin: exp("isaac_a9beba0_list_begin_ofs"),
    c48lEnd: exp("isaac_a9beba0_list_end_ofs"),
    c48stride: exp("isaac_a9beba0_list_stride"),
    c48secBegin: exp("isaac_a9beba0_second_list_begin_ofs"),
    c48secEnd: exp("isaac_a9beba0_second_list_end_ofs"),
    c48slotOfs: exp("isaac_a9beba0_slot_flag_ofs"),
    c48watchOfs: exp("isaac_a9beba0_watch_ofs"),
    c48watchVal: exp("isaac_a9beba0_watch_value"),
    c48flag20a9Ofs: exp("isaac_a9beba0_flag20a9_ofs"),
    c48keyOfs: exp("isaac_a9beba0_lookup_key_ofs"),
    c48tagOfs: exp("isaac_a9beba0_lookup_tag_ofs"),
    c48posXOfs: exp("isaac_a9beba0_pos_x_ofs"),
    c48posYOfs: exp("isaac_a9beba0_pos_y_ofs"),
    c48predObjOfs: exp("isaac_a9beba0_pred_obj_ofs"),
    c48predSlotOfs: exp("isaac_a9beba0_pred_slot_ofs"),
    c48gobjTsOfs: exp("isaac_a9beba0_gobj_ts_ofs"),
    c48glistBegin: exp("isaac_a9beba0_gobj_list_begin_ofs"),
    c48glistEnd: exp("isaac_a9beba0_gobj_list_end_ofs"),
    c48cacheTsVa: exp("isaac_a9beba0_cache_ts_va"),
    c48cacheXVa: exp("isaac_a9beba0_cache_x_va"),
    c48cacheYVa: exp("isaac_a9beba0_cache_y_va"),
    c48gobjVa: exp("isaac_a9beba0_gobj_global_va"),
    c48mgr: exp("isaac_a9beba0_manager_global_va"),
    c48recv: exp("isaac_a9beba0_receiver_ofs"),
    c48assertVa: exp("isaac_a9beba0_assert_va"),
    c48assertMsg: exp("isaac_a9beba0_assert_msg_va"),
    c48assertCode: exp("isaac_a9beba0_assert_code"),
    c48va: exp("isaac_a9beba0_va"),
    c48firstRet: exp("isaac_a9beba0_first_ret_va"),
    c48ret: exp("isaac_a9beba0_ret_va"),
    c48int3: exp("isaac_a9beba0_int3_va"),
    c48bytes: exp("isaac_a9beba0_body_bytes"),
    c48sites: exp("isaac_a9beba0_sites"),
    c48site0: exp("isaac_a9beba0_site0_va"),
    c48site1: exp("isaac_a9beba0_site1_va"),
    c48site2: exp("isaac_a9beba0_site2_va"),
    c48site3: exp("isaac_a9beba0_site3_va"),
    c48site4: exp("isaac_a9beba0_site4_va"),
    c48site5: exp("isaac_a9beba0_site5_va"),
    c48site6: exp("isaac_a9beba0_site6_va"),
    c48site7: exp("isaac_a9beba0_site7_va"),
    c48site8: exp("isaac_a9beba0_site8_va"),
    c48nextVa: exp("isaac_a9beba0_next_va"),

    c49listCount: exp("isaac_a9bfa70_list_count"),
    c49idxContinue: exp("isaac_a9bfa70_idx_continue"),
    c49slot: exp("isaac_a9bfa70_slot_free"),
    c49state: exp("isaac_a9bfa70_state_idle"),
    c49linkNull: exp("isaac_a9bfa70_link_null"),
    c49linkIdxNeg1: exp("isaac_a9bfa70_link_index_neg1"),
    c49indexGe: exp("isaac_a9bfa70_index_ge"),
    c49linkSelf: exp("isaac_a9bfa70_link_is_self"),
    c49flag: exp("isaac_a9bfa70_flag20a9_set"),
    c49gate: exp("isaac_a9bfa70_count_gate"),
    c49cntRes: exp("isaac_a9bfa70_count_result"),
    c49lBegin: exp("isaac_a9bfa70_list_begin_ofs"),
    c49lEnd: exp("isaac_a9bfa70_list_end_ofs"),
    c49stride: exp("isaac_a9bfa70_list_stride"),
    c49slotOfs: exp("isaac_a9bfa70_slot_flag_ofs"),
    c49stateOfs: exp("isaac_a9bfa70_state_ofs"),
    c49linkOfs: exp("isaac_a9bfa70_link_ofs"),
    c49indexOfs: exp("isaac_a9bfa70_index_ofs"),
    c49flag20a9Ofs: exp("isaac_a9bfa70_flag20a9_ofs"),
    c49mgr: exp("isaac_a9bfa70_manager_global_va"),
    c49recv: exp("isaac_a9bfa70_receiver_ofs"),
    c49va: exp("isaac_a9bfa70_va"),
    c49firstRet: exp("isaac_a9bfa70_first_ret_va"),
    c49ret: exp("isaac_a9bfa70_ret_va"),
    c49int3: exp("isaac_a9bfa70_int3_va"),
    c49bytes: exp("isaac_a9bfa70_body_bytes"),
    c49sites: exp("isaac_a9bfa70_sites"),
    c49site0: exp("isaac_a9bfa70_site0_va"),
    c49site1: exp("isaac_a9bfa70_site1_va"),
    c49site2: exp("isaac_a9bfa70_site2_va"),
    c49site3: exp("isaac_a9bfa70_site3_va"),
    c49nextVa: exp("isaac_a9bfa70_next_va"),
    c50flag: exp("isaac_cbo9ba980_flag_bit4_set"),
    c50true: exp("isaac_cbo9ba980_result_true"),
    c50false: exp("isaac_cbo9ba980_result_false"),
    c50bitsetOfs: exp("isaac_cbo9ba980_bitset_ofs"),
    c50bitsetMask: exp("isaac_cbo9ba980_bitset_mask"),
    c50mgr: exp("isaac_cbo9ba980_manager_global_va"),
    c50va: exp("isaac_cbo9ba980_va"),
    c50firstRet: exp("isaac_cbo9ba980_first_ret_va"),
    c50ret: exp("isaac_cbo9ba980_ret_va"),
    c50int3: exp("isaac_cbo9ba980_int3_va"),
    c50bytes: exp("isaac_cbo9ba980_body_bytes"),
    c50sites: exp("isaac_cbo9ba980_sites"),
    c50site0: exp("isaac_cbo9ba980_site0_va"),
    c50site1: exp("isaac_cbo9ba980_site1_va"),
    c50site2: exp("isaac_cbo9ba980_site2_va"),
    c50nextVa: exp("isaac_cbo9ba980_next_va"),

    c52gate: exp("isaac_a9c6110_gate"),
    c52value: exp("isaac_a9c6110_value"),
    c52nextState: exp("isaac_a9c6110_next_state"),
    c52field8Ofs: exp("isaac_a9c6110_field8_ofs"),
    c52stateOfs: exp("isaac_a9c6110_state_ofs"),
    c52match: exp("isaac_a9c6110_match_state"),
    c52val2: exp("isaac_a9c6110_value_two"),
    c52val4: exp("isaac_a9c6110_value_four"),
    c52va: exp("isaac_a9c6110_va"),
    c52firstRet: exp("isaac_a9c6110_first_ret_va"),
    c52ret: exp("isaac_a9c6110_ret_va"),
    c52int3: exp("isaac_a9c6110_int3_va"),
    c52bytes: exp("isaac_a9c6110_body_bytes"),
    c52sites: exp("isaac_a9c6110_sites"),
    c52ptrRef: exp("isaac_a9c6110_pointer_ref_va"),
    c52hostWalk: exp("isaac_a9c6110_host_walk_va"),
    c52owner: exp("isaac_a9c6110_walk_owner_va"),
    c52nextVa: exp("isaac_a9c6110_next_va"),

    abi: exp("isaac_process_input_pure_helpers_abi_version"),



    memory: instance.exports.memory,



  };



}







test("process_input pure helpers sources exist", () => {



  assert.ok(existsSync(header));



  assert.ok(existsSync(source));



  const h = readFileSync(header, "utf8");



  assert.match(h, /ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION = 52/);



  assert.match(h, /NOT pinned/);



  assert.match(h, /0x006f9400/);



  assert.match(h, /0x006f95a0/);



  assert.match(h, /0x00a6f620/);



  assert.match(h, /0x006f9730/);



  assert.match(h, /0x00a6de60/);



  assert.match(h, /0x00a6ded0/);



  assert.match(h, /0x00a6dee5/);



  assert.match(h, /0x00a6def6/);



  assert.match(h, /0x00a6df35/);



  assert.match(h, /0x00aefe80/);



  assert.match(h, /0x00a6dd30/);



  assert.match(h, /0x00a6da10/);



  assert.match(h, /0x00a648b0/);



  assert.match(h, /0x00a1fc00/);



  assert.match(h, /0x00a1f280/);



  assert.match(h, /0x00a1eed0/);



  assert.match(h, /0x00a20020/);



  assert.match(h, /0x00c57b18/);



  assert.match(h, /GetDeviceType/);



  assert.match(h, /Manager poll host chain/);



  assert.match(h, /button_edge/);



  assert.match(h, /axis_normalize/);



  assert.match(h, /query_uses_hook/);



  assert.match(h, /hook_repack/);



  assert.match(h, /pov_axis/);



  assert.match(h, /a1fc00_lock_obj_present/);



  assert.match(h, /a1f280_axis_pair_bits/);



  assert.match(h, /a1eed0_deadzone_remap/);



  assert.match(h, /a1f280_axis_neg_part/);



  assert.match(h, /a1f280_timer_clamp_nonneg/);



  assert.match(h, /0x00a68490/);



  assert.match(h, /a68490_ns_f64/);



  assert.match(h, /scale_tick/);



  assert.match(h, /tick_delta/);



  assert.match(h, /0x00a1f65a/);



  assert.match(h, /rumble_vcall_timer/);



  assert.match(h, /rumble_vcall_intensity/);



  assert.match(h, /rumble_neg_timer_path/);



  assert.match(h, /baseline_store/);



  assert.match(h, /VTBL_RUMBLE/);



  assert.match(h, /Entity_Familiar::Shoot/);



  assert.match(h, /0x00a112c0/);



  assert.match(h, /a112c0_body_needed/);



  assert.match(h, /a112c0_prefix_va/);



  assert.match(h, /MSG_VA_INVALID_MUTEX/);



  assert.match(h, /MSG_VA_ACTION_ID_OOR/);



  assert.match(h, /action_id_oor_log_needed/);



  assert.match(h, /0x00a1f4db/);



  assert.match(h, /action_query_vcall_needed/);



  assert.match(h, /action_query_vcall_arg/);



  assert.match(h, /VTBL_ACTION_QUERY/);



  assert.match(h, /action_index_after_push/);



  assert.match(h, /action_mode_after_push/);



  assert.match(h, /0x00a1f3f8/);



  assert.match(h, /fill_vcall_ok/);



  assert.match(h, /fill_pair1_arg/);



  assert.match(h, /VTBL_FILL/);



  assert.match(h, /VTBL_AXIS_FILL/);



  assert.match(h, /0x00a1f320/);



  assert.match(h, /0x00a1f40d/);



  assert.match(h, /axis_fill_call_va/);



  assert.match(h, /dir_bits_merge/);



  assert.match(h, /OFF_DIR_THRESH/);



  assert.match(h, /OFF_REMAP_THRESH/);



  assert.match(h, /0x00a1eee0/);



  assert.match(h, /0x00a1f30a/);



  assert.match(h, /ready_vcall_ok/);



  assert.match(h, /ready_early_return/);



  assert.match(h, /VTBL_READY/);



  assert.match(h, /ready_call_va/);



  // ABI v16 â€” walk residual callee pure islands.



  assert.match(h, /0x00a64960/);



  assert.match(h, /0x00b187e0/);



  assert.match(h, /0x00b187dc/);



  assert.match(h, /malloc/);



  assert.match(h, /api-ms-win-crt-heap/);



  assert.match(h, /a648b0_tracker_base/);



  assert.match(h, /a648b0_alloc_malloc_size_hi/);



  assert.match(h, /a648b0_free_block_ptr/);



  assert.match(h, /A648B0_OOM_CODE/);



  assert.match(h, /0x00a23200/);



  assert.match(h, /a6da10_teardown_plan/);



  assert.match(h, /A6DA10_STEP_COM_RELEASE/);



  assert.match(h, /A6DA10_COM_RELEASE_VTBL/);



  assert.match(h, /a6dd30_cb_arg_ofs/);



  assert.match(h, /A6DD30_CB_FRAME_BYTES/);



  assert.match(h, /0x00a6de45/);



  // ABI v17 â€” sibling device scan/connect FUN_00a6dab0.



  assert.match(h, /0x00a6dab0/);



  assert.match(h, /0x00a6dd2e/);



  assert.match(h, /0x00a6dd02/);



  assert.match(h, /a6dab0_slot_continue/);



  assert.match(h, /a6dab0_vector_find/);



  assert.match(h, /a6dab0_record_field_ofs/);



  assert.match(h, /a6dab0_axis_calloc_args/);



  assert.match(h, /A6DAB0_SLOT_COUNT/);



  assert.match(h, /A6DAB0_SEARCH_NOT_FOUND/);



  assert.match(h, /0x00b468b0/);



  assert.match(h, /0x00b185e4/);



  assert.match(h, /calloc/);



  assert.match(h, /FUN_00a6ef50/);



  // String evidence must be recorded but never promoted to a symbol name.



  assert.match(h, /XInput Controller 1/);



  assert.match(h, /keeps the address-stable name FUN_00a6dab0/);



  assert.doesNotMatch(h, /isaac_manager_poll_xinput/);



  // ABI v18 â€” the two callers of the scan, and the root-pin evaluation.



  assert.match(h, /0x00a220c0/);



  assert.match(h, /0x00a220ed/);



  assert.match(h, /0x00a6cf80/);



  assert.match(h, /0x00a6d266/);



  assert.match(h, /a220c0_thread_run/);



  assert.match(h, /a220c0_scan_iterations/);



  assert.match(h, /a6cf80_mode_after_probes/);



  assert.match(h, /a6cf80_hook_slot_target_va/);



  assert.match(h, /A220C0_RUN_BIT/);



  assert.match(h, /A6CF80_COINIT_CHANGED_MODE/);



  assert.match(h, /0x00c57b18/);



  assert.match(h, /Sleep/);



  // The root-pin evaluation must be recorded, and must stay negative.



  assert.match(h, /0 exact hits/);



  assert.match(h, /Root\s+remains unpinned/);



  assert.match(h, /__thiscall/);



  assert.match(h, /Gamepad_init/);



  assert.doesNotMatch(h, /isaac_game_process_input/);



  // ABI v19 â€” Manager shell body after the poll prefix.



  assert.match(h, /0x00954f82/);



  assert.match(h, /0x0095559c/);



  assert.match(h, /manager_shell_state_target_va/);



  assert.match(h, /manager_approach_uses_add_path/);



  assert.match(h, /manager_approach_host_call_needed/);



  assert.match(h, /MANAGER_APPROACH_MODE_SKIP_HOST/);



  assert.match(h, /MANAGER_SHELL_STATE_TABLE_VA/);



  // The two ABI v2 corrections must stay recorded.



  assert.match(h, /0x130/);



  assert.match(h, /the PE immediate is 0x20/i);



  assert.match(h, /unordered/);



  // The 0095b310 collision stays recorded and unpromoted even though the ZHL



  // match at that VA is exact.



  assert.match(h, /LuaEngine::RegisterClasses/);



  assert.match(h, /EXACT ZHL match/);



  assert.doesNotMatch(h, /isaac_lua_engine_register_classes/);



  // ABI v20 â€” audit fixes F8/F10/F11 and the state-2 arm.



  assert.match(h, /0x00a6dddf/);



  assert.match(h, /0x00a6dde5/);



  assert.match(h, /0x00a1f4e4/);



  assert.match(h, /0x00a1f513/);



  assert.match(h, /0x009551f0/);



  assert.match(h, /a6dd30_y_axis_base/);



  assert.match(h, /a6dd30_y_cb_ptr/);



  assert.match(h, /a1f280_action_store_base/);



  assert.match(h, /state2_sweep_step/);



  assert.match(h, /RE-READ/);



  // The F8 correction and the retracted "distinct" rationalisation.



  assert.match(h, /a NaN timer is \*\*kept\*\*/);



  assert.match(h, /rationalising a bug/);



  assert.doesNotMatch(h, /Distinct from timer_clamp_nonneg which zeros NaN/);



  // ABI v21 â€” the complete state table, the leaf FUN_009505e0, the ladder.



  assert.match(h, /0x009505e0/);



  assert.match(h, /0x009553a6/);



  assert.match(h, /0x009551a3/);



  assert.match(h, /0x0095514a/);



  assert.match(h, /0x00955168/);



  assert.match(h, /0x009c39b3/);



  assert.match(h, /0x0095df20/);



  assert.match(h, /0x00920510/);



  assert.match(h, /9505e0_gate/);



  assert.match(h, /predispatch_obj_after/);



  assert.match(h, /state1_second_gate_needed/);



  assert.match(h, /state2_head_gate_needed/);



  // The load-bearing evidence for v21 must stay in the record.



  assert.match(h, /`83 78 40 11`/);



  assert.match(h, /exactly 2 callers/);



  assert.match(h, /7 identical leading bytes/);



  assert.match(h, /UNCONDITIONAL/);



  assert.match(h, /DISJUNCTION/);



  assert.match(h, /Reachability defect recorded, not corrected/);



  // v21 callees stay address-stable: no ZHL name is promoted for any of them.



  for (const name of [



    "AchievementOverlay",



    "SoundEffects",



    "ClearVolumeModifier",



  ]) {



    assert.doesNotMatch(h, new RegExp(`isaac_[a-z0-9_]*${name.toLowerCase()}`));



  }



  // Must not claim a ProcessInput pin.



  assert.doesNotMatch(h, /ProcessInput.*pinned at/i);







  /* ABI v21 — narrow-parameter toolchain defect, standing guard.



   *



   * A `uint8_t` / `uint16_t` / `int16_t` SCALAR parameter is a live divergence



   * in this build: the Wasm ABI never narrows an i32 argument and -O2 deletes



   * an in-body mask it can prove redundant for a narrow parameter type, so the



   * shipped module compares the caller's full 32 bits where the PE compares a



   * byte or a word. Pointer parameters (`const uint8_t*`) read real memory and



   * are unaffected; return types are produced by the callee and are fine.



   *



   * This is the closest thing to a static assertion the header can carry, and



   * it is what stops the class from coming back one declaration at a time. */



  const noComments = h.replace(/\/\*[\s\S]*?\*\//g, "");



  const protos = [...noComments.matchAll(/^[A-Za-z_][\w *]*?\s+(isaac_[a-z0-9_]+)\s*\(([^;]*?)\);/gm)];



  assert.ok(protos.length > 100, `header prototype scan found only ${protos.length}`);



  const narrowScalars = [];



  for (const p of protos) {



    for (const raw of p[2].split(",")) {



      const m = raw.trim().match(/^(?:const\s+)?(u?int(?:8|16)_t)\s+(?!\*)(\w+)$/);



      if (m) narrowScalars.push(`${p[1]}(${m[1]} ${m[2]})`);



    }



  }



  assert.deepEqual(



    narrowScalars,



    [],



    `narrow scalar parameters must be uint32_t/int32_t with an explicit\n` +



      `in-body mask — -O2 deletes the mask for a narrow parameter type:\n` +



      narrowScalars.join("\n"),



  );



  // The masking idiom itself must stay in the source, with its reason.



  const cpp = readFileSync(source, "utf8");



  assert.match(cpp, /inline uint8_t nonzero_u8\(uint32_t v\)/);



  assert.match(cpp, /\(v & 0xffu\) != 0u/);



  assert.match(cpp, /does not narrow an i32 argument/);



  assert.match(cpp, /80 7d 08 00/); // the byte test on the 4-byte stack slot



  assert.match(h, /53 of the 61/);



  assert.match(h, /setne bl/);



  assert.match(h, /Three distinct globals/);



  // ABI v23 — state-2 arm tail: two typed host events stay address-stable



  // (no exact ZHL match), ANM2::Play keeps its exact-ZHL name as a recorded



  // cross-family fact, and the byte gate + receiver globals are pinned.



  assert.match(h, /0x00955463/);



  assert.match(h, /0x00955469/);



  assert.match(h, /0x0095546e/);



  assert.match(h, /0x00955483/);



  assert.match(h, /state2_tail_call_b_needed/);



  assert.match(h, /0x00c7999c/);



  assert.match(h, /0x009554a0/);



  assert.match(h, /ANM2::Play/);



  assert.match(h, /caller census: 0x7ba00a, 0x955483/);



  assert.match(h, /caller census: only 0x955469/);



  assert.match(h, /129 pattern bytes/);



  // ABI v24 — Manager shell GLFW window tail: last block of FUN_00954cd0



  // (ret @ 0x00955599). Pinned PE evidence: the win NULL assert (GLFW



  // "window != NULL", line 784), the kind/direct-copy magic 0x34003, the



  // ucomiss ordered-equality idiom, timer reset 0x12c, and the parity



  // counter 0x4abbc shared with the shell early-skip / state-2 parity.



  assert.match(h, /0x009554a5/);



  assert.match(h, /0x00955580/);



  assert.match(h, /0x00955599/);



  assert.match(h, /_wassert/);



  assert.match(h, /window != NULL/);



  assert.match(h, /0x34003/);



  assert.match(h, /cvtpd2ps/);



  assert.match(h, /test ah,0x44/);



  assert.match(h, /0x4b3bc/);



  assert.match(h, /0x4b3c4/);



  assert.match(h, /SHELL_TAIL_TIMER_RESET = 0x12c/);



  assert.match(h, /ISAAC_SHELL_TAIL_PARITY_OFS = 0x4abbc/);



  assert.match(h, /SAME field as MANAGER_SHELL_OFF_COUNTER/);



  // ABI v30 — FUN_00959670 / Manager::cleanup_current_state (host C).



  // Exact body 0xac (172 B); first-ret 1672 B is a trap. Next VA host D.



  assert.match(h, /cleanup_current_state/);



  assert.match(h, /0xac/);



  assert.match(h, /1672/);



  assert.match(h, /0x0095e7c0/);



  assert.match(h, /0x4b285/);



  assert.match(h, /g_Game==0 still calls/);



  assert.match(h, /ISAAC_959670_BODY_BYTES = 0xac/);



  assert.match(h, /ISAAC_959670_FIRST_RET_TRAP_BYTES = 0x688/);



  assert.match(h, /ISAAC_959670_NEXT_VA = 0x0095e7c0/);



  // ABI v31 — FUN_0095e7c0 / Cutscene::Show (host D). Exact body 0x305



  // (773 B); 0x800 dump window is a trap. Next VA host E.



  assert.match(h, /Cutscene::Show/);



  assert.match(h, /0x305/);



  assert.match(h, /0x800/);



  assert.match(h, /0x00921ce0/);



  assert.match(h, /ISAAC_95E7C0_BODY_BYTES = 0x305/);



  assert.match(h, /ISAAC_95E7C0_FIRST_RET_TRAP_BYTES = 0x800/);



  assert.match(h, /ISAAC_95E7C0_NEXT_VA = 0x00921ce0/);



  assert.match(h, /unsigned ja vs 26/);



  assert.match(h, /g_Manager; NO null test/);



  // ABI v32 — NightmareScene::Show (host E). Exact body 0x1630 (5680 B);



  // 0x800 dump window is a trap (first_ret NONE). Next VA FirstCollectibleOwner.



  assert.match(h, /NightmareScene::Show/);



  assert.match(h, /0x1630/);



  assert.match(h, /0x800/);



  assert.match(h, /0x009be080/);



  assert.match(h, /ISAAC_921CE0_BODY_BYTES = 0x1630/);



  assert.match(h, /ISAAC_921CE0_FIRST_RET_TRAP_BYTES = 0x800/);



  assert.match(h, /ISAAC_921CE0_NEXT_VA = 0x009be080/);



  assert.match(h, /IsDogmaNightmare/);



  assert.match(h, /SIGNED key/);



  // ABI v33 -- PlayerManager::FirstCollectibleOwner (0x009be080). Complete



  // 0xb8 (184 B) walk; arg2 RNG** unused; 175 rel32 E8 callers; Next VA



  // RandomCollectibleOwner sibling. Cross-family: HUD v13 / Room own FCO.



  assert.match(h, /FirstCollectibleOwner/);



  assert.match(h, /0xb8/);



  assert.match(h, /ISAAC_FCO9BE080_BODY_BYTES = 0xb8/);



  assert.match(h, /ISAAC_FCO9BE080_SITES = 175/);



  assert.match(h, /ISAAC_FCO9BE080_NEXT_VA = 0x009be140/);



  assert.match(h, /0x0072fd10/);



  assert.match(h, /0x007706e0/);



  assert.match(h, /RNG\*\* is UNUSED|UNUSED by this PE body/);



  assert.match(h, /Cross-family|separate wasm/);



});







test("JS oracle: map node present + signed mod2", () => {



  assert.equal(inputMapNodePresent(0, 0x38, 0x38), true);



  assert.equal(inputMapNodePresent(0, 0x37, 0x38), true);



  assert.equal(inputMapNodePresent(0, 0x39, 0x38), false);



  assert.equal(inputMapNodePresent(1, 0x38, 0x38), false);



  assert.equal(peSignedMod2Eq1(1), true);



  assert.equal(peSignedMod2Eq1(2), false);



  assert.equal(peSignedMod2Eq1(7), true);



  assert.equal(peSignedMod2Eq1(8), false); // even



  assert.equal(peSignedMod2Eq1(9), true); // odd; stage>=8 gated separately



  assert.equal(peSignedMod2Eq1(0), false);



  assert.equal(peSignedMod2Eq1(-1), false);



});







test("v109 CROSS-FAMILY PIN: 6f9400/6f95a0 masks owned by render-shell", () => {
  /* v109 dedupe: the FUN_006f9400 / FUN_006f95a0 law exports are OWNED by
     the render-shell family (isaac_render_shell_6f9400_gate39 / _mask /
     _mask_full and isaac_render_shell_6f95a0_mask, ABI v31; the
     render-slice build links render_shell_pure_helpers.cpp and consumes
     them by name). This family keeps the INPUT_MASK_* constants + host VAs
     below and pins the RShell export semantics BY REFERENCE. NO duplicate
     law exports. */
  assert.equal(INPUT_MASK_6F9400_HOST_VA, 0x006f9400);
  assert.equal(INPUT_MASK_6F95A0_HOST_VA, 0x006f95a0);

  /* gate39 (RShell law, same PE truth as the removed PI transcription). */
  assert.equal(renderShell6f9400Gate39(0, 1, 0), true);
  assert.equal(renderShell6f9400Gate39(INPUT_MASK_A_GATE39_MODE_EXCLUDE, 1, 0), false);
  assert.equal(renderShell6f9400Gate39(0, 2, 0), false);
  assert.equal(renderShell6f9400Gate39(0, 9, 0), false); // odd but >= 8
  assert.equal(renderShell6f9400Gate39(0, 1, 2), false);
  assert.equal(renderShell6f9400Gate39(0, 1, 3), false);

  const none = {
    present38: 0, present39: 0, present3a: 0, present3b: 0,
    present3c: 0, present3d: 0, present3e: 0,
  };
  assert.equal(renderShell6f9400Mask(none, true), 0);

  const all = {
    present38: 1, present39: 1, present3a: 1, present3b: 1,
    present3c: 1, present3d: 1, present3e: 1,
  };
  assert.equal(
    renderShell6f9400Mask(all, true),
    INPUT_MASK_BIT0 | INPUT_MASK_BIT1 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
      INPUT_MASK_BIT4 | INPUT_MASK_BIT5 | INPUT_MASK_BIT6,
  );
  assert.equal(
    renderShell6f9400Mask(all, false),
    INPUT_MASK_BIT0 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
      INPUT_MASK_BIT4 | INPUT_MASK_BIT5 | INPUT_MASK_BIT6,
  );
  assert.equal(
    renderShell6f9400MaskFull(all, 0, 1, 0),
    INPUT_MASK_BIT0 | INPUT_MASK_BIT1 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
      INPUT_MASK_BIT4 | INPUT_MASK_BIT5 | INPUT_MASK_BIT6,
  );
  assert.equal(
    renderShell6f9400MaskFull(all, INPUT_MASK_A_GATE39_MODE_EXCLUDE, 1, 0) & INPUT_MASK_BIT1,
    0,
  );

  const empty = {
    present3f: 0, present40: 0, present41: 0, present42: 0,
    present43: 0, present44: 0, present46: 0, present4f: 0,
  };
  assert.equal(renderShell6f95a0Mask(empty), 0);

  const bits = {
    present3f: 1, present40: 1, present41: 1, present42: 1,
    present43: 1, present44: 1, present46: 0, present4f: 0,
  };
  assert.equal(
    renderShell6f95a0Mask(bits),
    INPUT_MASK_BIT0 | INPUT_MASK_BIT1 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
      INPUT_MASK_BIT5 | INPUT_MASK_BIT6,
  );

  const force = { ...bits, present46: 1 };
  assert.equal(renderShell6f95a0Mask(force), INPUT_MASK_B_ID_46_FORCE);

  const forceThen4f = { ...empty, present3f: 1, present46: 1, present4f: 1 };
  assert.equal(renderShell6f95a0Mask(forceThen4f), INPUT_MASK_B_ID_46_FORCE);

  assert.equal(inputMaskCombine(0x3, 0x1, 0x4), ((~0x1) & (0x3 | 0x4)) >>> 0);
});

test("JS oracle: GetDeviceType range membership", () => {



  assert.equal(inputDeviceRangeContains(0, 0, 1), true);



  assert.equal(inputDeviceRangeContains(0, 0, 0), false);



  assert.equal(inputDeviceRangeContains(5, 0, 5), false); // end exclusive



  assert.equal(inputDeviceRangeContains(4, 0, 5), true);



  assert.equal(inputDeviceRangeContains(1, 2, 3), false);



  assert.equal(inputDeviceRangeContains(2, 2, 3), true);



  assert.equal(inputDeviceRangeContains(4, 2, 3), true);



  assert.equal(inputDeviceRangeContains(5, 2, 3), false);



  // PE wrap: start+count wraps so end < start â†’ empty under unsigned jb pair



  assert.equal(inputDeviceRangeContains(0xfffffff0, 0xfffffff0, 0x20), false);



  assert.equal(inputDeviceRangeContains(0x5, 0xfffffff0, 0x20), false);



  // non-wrapping near top: start=0xfffffffe count=1 â†’ end=0xffffffff



  assert.equal(inputDeviceRangeContains(0xfffffffe, 0xfffffffe, 1), true);



  assert.equal(inputDeviceRangeContains(0xffffffff, 0xfffffffe, 1), false);







  assert.equal(inputGetDeviceTypeRanges(3, [{ start: 0, count: 2 }, { start: 2, count: 4 }]), true);



  assert.equal(inputGetDeviceTypeRanges(10, [{ start: 0, count: 2 }]), false);



  assert.equal(inputGetDeviceTypeRanges(0, []), false);



});







test("JS oracle: manager gate 6f9730 + early skip + float approach", () => {



  assert.equal(managerGate6f9730(0, 0, 0, 0, 0), true);



  assert.equal(managerGate6f9730(-1, 0, 0, 0, 0), true);



  assert.equal(managerGate6f9730(0.1, 0, 0, 0, 0), false);



  assert.equal(managerGate6f9730(Number.NaN, 0, 0, 0, 0), false);



  assert.equal(managerGate6f9730(0, 1, 0, 0, 0), false);



  assert.equal(managerGate6f9730(0, 0, 1, 0, 0), false);



  assert.equal(managerGate6f9730(0, 0, 0, 1, 0), false);



  assert.equal(managerGate6f9730(0, 0, 0, 0, 1), false);







  assert.equal(managerUpdateEarlySkip(0, 0, 0, 0), MANAGER_EARLY_CONTINUE); // even



  assert.equal(managerUpdateEarlySkip(1, 0, 0, 0), MANAGER_EARLY_RETURN_INC);



  assert.equal(managerUpdateEarlySkip(1, 0, 1, 0), MANAGER_EARLY_RETURN_SILENT);



  assert.equal(managerUpdateEarlySkip(1, 0, 1, 1), MANAGER_EARLY_RETURN_INC);



  assert.equal(managerUpdateEarlySkip(1, 1, 1, 0), MANAGER_EARLY_CONTINUE);



  assert.equal(managerEarlyCounterNext(1), 2);



  assert.equal(managerEarlyCounterNext(0xffffffff | 0), 0);







  const step = new Float32Array(new Uint32Array([MANAGER_FLOAT_APPROACH_STEP_BITS]).buffer)[0];



  assert.equal(managerFloatApproach(0, 10, step), 6);



  assert.equal(managerFloatApproach(8, 10, step), 10); // clamp



  assert.equal(managerFloatApproach(10, 0, step), 4);



  assert.equal(managerFloatApproach(3, 0, step), 0); // clamp



});







test("JS oracle: Manager poll prefix + a6de60 entry gates", () => {



  assert.equal(managerPollPrefixNeeded(0), false);



  assert.equal(managerPollPrefixNeeded(1), true);



  assert.equal(managerPollPrefixNeeded(0xff), true);







  assert.equal(managerPollPlatformUsesA69f60(0), true);



  assert.equal(managerPollPlatformUsesA69f60(1), false);



  assert.equal(managerPollPlatformUsesA69f60(0x1234), false);







  assert.equal(managerPollA6de60BodyNeeded(0, 0), false); // disabled



  assert.equal(managerPollA6de60BodyNeeded(1, 0), true);



  assert.equal(managerPollA6de60BodyNeeded(1, 1), false); // reenter



  assert.equal(managerPollA6de60BodyNeeded(0, 1), false);







  // four pointer-slots: end = begin + 16 â†’ count 4



  assert.equal(managerPollA6de60VectorCount(0x1000, 0x0ff0), 4);



  assert.equal(managerPollA6de60VectorCount(0x1000, 0x1000), 0);



  // signed SAR: negative span stays negative



  assert.equal(managerPollA6de60VectorCount(0, 16), -4);



  // wrap: end < begin as unsigned still SAR of wrapped sub



  assert.equal(



    managerPollA6de60VectorCount(0x0, 0x4),



    ((0 - 4) | 0) >> 2,



  );







  assert.equal(managerPollA6de60LoopNeeded(0), false);



  assert.equal(managerPollA6de60LoopNeeded(1), true);



  assert.equal(managerPollA6de60LoopNeeded(-1), true);



});







test("JS oracle: a6de60 device-walk pure islands (ABI v4)", () => {



  assert.equal(managerPollA6de60DeviceEnabled(0), false);



  assert.equal(managerPollA6de60DeviceEnabled(1), true);



  assert.equal(managerPollA6de60DeviceEnabled(0xff), true);







  assert.equal(managerPollA6de60QueryOk(0), true);



  assert.equal(managerPollA6de60QueryOk(1), false);



  assert.equal(managerPollA6de60QueryOk(-1), false);







  assert.equal(managerPollA6de60ButtonBit(0, 0), 0);



  assert.equal(managerPollA6de60ButtonBit(1, 0), 1);



  assert.equal(managerPollA6de60ButtonBit(0x4000, 0xe), 1);



  assert.equal(managerPollA6de60ButtonBit(0x0400, 0xa), 1);



  assert.equal(managerPollA6de60ButtonBit(0x8000, 0xf), 1);







  const shifts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0xc, 0xd, 0xe, 0xf, 0xa];



  for (let s = 0; s < 15; s += 1) {



    assert.equal(managerPollA6de60ButtonSlotShift(s), shifts[s], `slot ${s}`);



  }



  assert.equal(managerPollA6de60ButtonSlotShift(15), 0xffffffff);







  assert.equal(managerPollA6de60ButtonEdge(0, 0, 1, 1), A6DE60_EDGE_NONE);



  assert.equal(managerPollA6de60ButtonEdge(1, 1, 1, 1), A6DE60_EDGE_NONE);



  assert.equal(managerPollA6de60ButtonEdge(1, 0, 1, 1), A6DE60_EDGE_PRESS);



  assert.equal(managerPollA6de60ButtonEdge(0, 1, 1, 1), A6DE60_EDGE_RELEASE);



  assert.equal(managerPollA6de60ButtonEdge(1, 0, 0, 1), A6DE60_EDGE_SILENT);



  assert.equal(managerPollA6de60ButtonEdge(0, 1, 1, 0), A6DE60_EDGE_SILENT);







  // i16: 0 â†’ (0+0x8000)/65535*2 - 1 = 1/65535; -0x8000 â†’ -1; 0x7fff â†’ ~1



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeI16(0) - (1 / 65535)) < 1e-6);



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeI16(-0x8000) - (-1)) < 1e-5);



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeI16(0x7fff) - 1) < 1e-4);







  // u8: 0 â†’ -1; 0xff â†’ (255/127.5)-1 = 1; 0x7f â†’ ~0



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeU8(0) - (-1)) < 1e-5);



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeU8(0xff) - 1) < 1e-5);



  assert.ok(Math.abs(managerPollA6de60AxisNormalizeU8(0x7f) - (127 / 127.5 - 1)) < 1e-5);







  assert.equal(managerPollA6de60FloatChanged(1, 1), false);



  assert.equal(managerPollA6de60FloatChanged(1, 2), true);



  assert.equal(managerPollA6de60FloatChanged(Number.NaN, 0), true);



  assert.equal(managerPollA6de60FloatCallbackNeeded(1, 2, 1), true);



  assert.equal(managerPollA6de60FloatCallbackNeeded(1, 2, 0), false);



  assert.equal(managerPollA6de60FloatCallbackNeeded(1, 1, 1), false);







  assert.equal(managerPollA6de60DierrReacquire(A6DE60_DIERR_INPUTLOST), true);



  assert.equal(managerPollA6de60DierrReacquire(A6DE60_DIERR_NOTACQUIRED), true);



  assert.equal(managerPollA6de60DierrReacquire(0), false);



  assert.equal(managerPollA6de60DierrReacquire(0x80004005), false);







  assert.equal(managerPollA6de60IndexContinue(0, 2), true);



  assert.equal(managerPollA6de60IndexContinue(1, 2), false);



  assert.equal(managerPollA6de60IndexContinue(0, 0), false);



  // wrap: 0xffffffff+1 â†’ 0; 0 < 1 â†’ continue (PE unsigned jb)



  assert.equal(managerPollA6de60IndexContinue(0xffffffff, 1), true);



  assert.equal(managerPollA6de60IndexContinue(0xffffffff, 0), false);







  assert.equal(managerPollA6de60AxisTypeDispatch(0), 0);



  assert.equal(managerPollA6de60AxisTypeDispatch(4), 1);



  assert.equal(managerPollA6de60AxisTypeDispatch(0x2c), 11);



  assert.equal(managerPollA6de60AxisTypeDispatch(1), A6DE60_AXIS_DISPATCH_DEFAULT);



  assert.equal(managerPollA6de60AxisTypeDispatch(0x2d), A6DE60_AXIS_DISPATCH_OOR);







  // 4 devices: end = begin + 16 â†’ count 4; index 2 â†’ continue; index 3 â†’ stop



  assert.equal(managerPollA6de60DeviceContinue(2, 0x1000, 0x0ff0), true);



  assert.equal(managerPollA6de60DeviceContinue(3, 0x1000, 0x0ff0), false);



  assert.equal(managerPollA6de60DeviceContinue(0, 0x1000, 0x1000), false);



});







test("JS oracle: a6de60 residual path pure islands (ABI v5)", () => {



  assert.equal(managerPollA6de60QueryUsesHook(0), false);



  assert.equal(managerPollA6de60QueryUsesHook(0x12345678), true);







  assert.equal(managerPollA6de60QpcFreqInitNeeded(0, 0), true);



  assert.equal(managerPollA6de60QpcFreqInitNeeded(1, 0), false);



  assert.equal(managerPollA6de60QpcFreqInitNeeded(0, 1), false);



  assert.equal(managerPollA6de60QpcFreqInitNeeded(10, 20), false);







  // u64â†’f64: 0; 1; 2^32; 2^32+1; high bit of lo



  assert.equal(managerPollA6de60U64ToF64(0, 0), 0);



  assert.equal(managerPollA6de60U64ToF64(1, 0), 1);



  assert.equal(managerPollA6de60U64ToF64(0, 1), 4294967296);



  assert.equal(managerPollA6de60U64ToF64(1, 1), 4294967297);



  assert.equal(managerPollA6de60U64ToF64(0x80000000, 0), 2147483648);







  // 10_000_000 / 10_000_000 â†’ 1.0 after f32 roundtrip



  assert.equal(managerPollA6de60QpcSecondsF64(10_000_000, 0, 10_000_000, 0), 1);



  // 5e6 / 10e6 â†’ 0.5



  assert.equal(managerPollA6de60QpcSecondsF64(5_000_000, 0, 10_000_000, 0), 0.5);







  assert.equal(managerPollA6de60ComSucceeded(0), true);



  assert.equal(managerPollA6de60ComSucceeded(1), true); // S_FALSE



  assert.equal(managerPollA6de60ComSucceeded(-1), false);



  assert.equal(managerPollA6de60ComSucceeded(0x8007001e | 0), false);







  assert.equal(managerPollA6de60BufferedMode(0), false);



  assert.equal(managerPollA6de60BufferedMode(1), true);







  assert.equal(managerPollA6de60DidodAllocSize(0), 0);



  assert.equal(managerPollA6de60DidodAllocSize(1), A6DE60_DIDOD_STRIDE);



  assert.equal(managerPollA6de60DidodAllocSize(2), 0x28);



  // overflow: count such that count*0x14 > 0xffffffff



  assert.equal(managerPollA6de60DidodAllocSize(0x10000000), 0xffffffff);



  assert.equal(managerPollA6de60DidodAllocSize(0x0ccccccd), 0xffffffff);







  assert.equal(managerPollA6de60TimestampToSecondsF64(0), 0);



  assert.equal(managerPollA6de60TimestampToSecondsF64(1000), 1);



  assert.equal(managerPollA6de60TimestampToSecondsF64(2500), 2.5);



  assert.equal(managerPollA6de60TimestampToSecondsF64(0x80000000), 2147483648 / 1000);







  assert.equal(managerPollA6de60NonzeroBit(0), 0);



  assert.equal(managerPollA6de60NonzeroBit(1), 1);



  assert.equal(managerPollA6de60NonzeroBit(0x100), 1);







  // POV matrix (PE FUN_00a6dd30)



  const povCases = [



    [0xffffffff, 0, 0],



    [A6DE60_POV_CENTER_LO16, 0, 0],



    [0, 0, -1],



    [1, 1, -1],



    [4500, 1, -1],



    [A6DE60_POV_EAST, 1, 0],



    [13500, 1, 1],



    [A6DE60_POV_SOUTH, 0, 1],



    [A6DE60_POV_SOUTH + 1, -1, 1],



    [22500, -1, 1],



    // v16 correction: 270Â° west is (-1, 0); the `jb 0x6978` that keeps +1 is



    // strict, so equality falls through to the `xorps xmm0` at 0x00a6de50.



    [A6DE60_POV_WEST, -1, 0],



    [A6DE60_POV_WEST + 1, -1, -1],



    [31500, -1, -1],



    // Low-word centered test wins over the 32-bit ladder.



    [0x0001ffff, 0, 0],



    // High dword outside the ladder: > 27000 â†’ (-1, -1).



    [0x00010000, -1, -1],



  ];



  for (const [pov, a0, a1] of povCases) {



    assert.equal(managerPollA6de60PovAxis0(pov), a0, `pov axis0 ${pov}`);



    assert.equal(managerPollA6de60PovAxis1(pov), a1, `pov axis1 ${pov}`);



  }



});







test("JS oracle: a6de60 post-query pure islands (ABI v6)", () => {



  // Hook repack: buttons 0x00ff, u8 axes 0x10/0x20, i16 axes



  assert.equal(managerPollA6de60HookRepackDw0(0x00ff, 0x10, 0x20), 0x201000ff);



  assert.equal(managerPollA6de60HookRepackDw1(0x1234, 0x5678), 0x56781234);



  assert.equal(managerPollA6de60HookRepackDw2(0xabcd, 0xef01), 0xef01abcd);



  assert.deepEqual(



    managerPollA6de60HookRepack(0x00ff, 0x10, 0x20, 0x1234, 0x5678, 0xabcd, 0xef01),



    [0x201000ff, 0x56781234, 0xef01abcd],



  );



  // zero pack



  assert.deepEqual(



    managerPollA6de60HookRepack(0, 0, 0, 0, 0, 0, 0),



    [0, 0, 0],



  );



  assert.equal(A6DE60_HOOK_COMPACT_DWORDS, 3);







  assert.equal(managerPollA6de60DidodOfsMatch(0x100, 0x100), true);



  assert.equal(managerPollA6de60DidodOfsMatch(0x100, 0x101), false);



  assert.equal(managerPollA6de60DidodOfsMatch(0xffffffff, 0xffffffff), true);







  assert.equal(managerPollA6de60AxisMapIsPov(0), false);



  assert.equal(managerPollA6de60AxisMapIsPov(1), true);



  assert.equal(managerPollA6de60AxisMapIsPov(0xff), true);







  assert.equal(managerPollA6de60QueryFailClearValue(), 0);







  assert.equal(managerPollA6da10IndexAfterRemove(0), -1);



  assert.equal(managerPollA6da10IndexAfterRemove(1), 0);



  assert.equal(managerPollA6da10IndexAfterRemove(0), 0xffffffff | 0);



  assert.equal(managerPollA6da10IndexAfterRemove(0x80000000 | 0), 0x7fffffff);







  assert.equal(managerPollA6da10DisconnectCbNeeded(0), false);



  assert.equal(managerPollA6da10DisconnectCbNeeded(0x1234), true);







  assert.equal(managerPollA6da10FreeComMaps(0), true);



  assert.equal(managerPollA6da10FreeComMaps(1), false);







  // begin=0x1000, index=1 â†’ slot=0x1004, next=0x1008; end=0x1010 â†’ 8 bytes



  assert.equal(managerPollA6da10RemoveMoveBytes(0x1010, 0x1000, 1), 8);



  assert.equal(managerPollA6da10RemoveMoveBytes(0x1000, 0x1000, 0), 0xfffffffc >>> 0);



  // last slot: index=3, begin=0x1000, end=0x1010 â†’ slot=0x100c next=0x1010 size=0



  assert.equal(managerPollA6da10RemoveMoveBytes(0x1010, 0x1000, 3), 0);







  assert.equal(managerPollA6da10EndAfterRemove(0x1010), 0x100c);



  assert.equal(managerPollA6da10EndAfterRemove(0), 0xfffffffc >>> 0);







  assert.equal(managerPollA648b0Mode(0), A648B0_MODE_ALLOC);



  assert.equal(managerPollA648b0Mode(1), A648B0_MODE_FREE);



  assert.equal(managerPollA648b0Mode(2), A648B0_MODE_ACCOUNT);



  assert.equal(managerPollA648b0Mode(3), A648B0_MODE_NOP);



  assert.equal(managerPollA648b0Mode(0xff), A648B0_MODE_NOP);







  assert.equal(managerPollA648b0AllocMallocSize(0, 0), 4);



  assert.equal(managerPollA648b0AllocMallocSize(0x10, 0), 0x14);



  assert.equal(managerPollA648b0AllocMallocSize(0x10, 1), 4); // hi rejects â†’ 0+4



  assert.equal(managerPollA648b0AllocMallocSize(0xfffffffc, 0), 0); // wrap



  assert.equal(managerPollA648b0AllocMallocSize(0xffffffff, 0), 3);







  assert.deepEqual(



    managerPollA648b0TrackerSubSize(10, 0, 3),



    { lo: 7, hi: 0 },



  );



  assert.deepEqual(



    managerPollA648b0TrackerSubSize(1, 1, 2),



    { lo: 0xffffffff, hi: 0 },



  );



  assert.deepEqual(



    managerPollA648b0TrackerSubSize(0, 0, 1),



    { lo: 0xffffffff, hi: 0xffffffff },



  );







  assert.deepEqual(



    managerPollA648b0TrackerAdd(1, 0, 2, 0),



    { lo: 3, hi: 0 },



  );



  assert.deepEqual(



    managerPollA648b0TrackerAdd(0xffffffff, 0, 1, 0),



    { lo: 0, hi: 1 },



  );



  assert.deepEqual(



    managerPollA648b0TrackerAdd(0xffffffff, 0, 1, 1),



    { lo: 0, hi: 2 },



  );



});







test("JS oracle: a1fc00 / a1f280 pure islands (ABI v7 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 7);



  assert.equal(A1FC00_QUEUE_STRIDE, 8);



  assert.equal(A1FC00_FREE_HEADER_THRESHOLD, 0x1000);



  assert.equal(A1FC00_FREE_HEADER_ADD, 0x23);



  assert.equal(A1FC00_FREE_HEADER_OFFSET_MAX, 0x1f);



  assert.equal(A1FC00_SLOT_FULL, 0xffffffff);







  assert.equal(managerPollA1fc00LockObjPresent(0), false);



  assert.equal(managerPollA1fc00LockObjPresent(0xc57b2c), true);







  assert.equal(managerPollA1fc00QueueLoopNeeded(0x1000, 0x1000), false);



  assert.equal(managerPollA1fc00QueueLoopNeeded(0x1000, 0x1008), true);







  // 3 elems of 8 bytes: end = begin + 24



  assert.equal(managerPollA1fc00QueueCount(0x1018, 0x1000), 3);



  assert.equal(managerPollA1fc00QueueCount(0x1000, 0x1000), 0);



  // wrap: begin > end â†’ SAR32(0-8, 3) = -1



  assert.equal(managerPollA1fc00QueueCount(0, 8), -1);







  assert.equal(managerPollA1fc00EntryAlreadyActive(0), false);



  assert.equal(managerPollA1fc00EntryAlreadyActive(1), true);



  assert.equal(managerPollA1fc00EntryAlreadyActive(2), false);



  assert.equal(managerPollA1fc00EntryAlreadyActive(3), true);







  assert.equal(managerPollA1fc00EntryMarkActive(0), 1);



  assert.equal(managerPollA1fc00EntryMarkActive(0x100), 0x101);



  assert.equal(managerPollA1fc00EntryMarkActive(0xffff), 0xffff);







  assert.equal(managerPollA1fc00SlotTableUsable(0), false);



  assert.equal(managerPollA1fc00SlotTableUsable(4), true);







  assert.equal(managerPollA1fc00SlotIsFree(0), true);



  assert.equal(managerPollA1fc00SlotIsFree(1), false);







  assert.equal(managerPollA1fc00SlotIndexContinue(0, 2), true);



  assert.equal(managerPollA1fc00SlotIndexContinue(1, 2), false);



  assert.equal(managerPollA1fc00SlotIndexContinue(0xffffffff, 1), true);







  assert.equal(managerPollA1fc00SlotFindFree([], 0), A1FC00_SLOT_FULL);



  assert.equal(managerPollA1fc00SlotFindFree([1, 2, 3], 3), A1FC00_SLOT_FULL);



  assert.equal(managerPollA1fc00SlotFindFree([1, 0, 3], 3), 1);



  assert.equal(managerPollA1fc00SlotFindFree([0, 0], 2), 0);



  assert.equal(managerPollA1fc00SlotFindFree([1, 2], 2), A1FC00_SLOT_FULL);







  assert.equal(managerPollA1fc00QueueEndAfterErase(0x1010), 0x1008);



  assert.equal(managerPollA1fc00QueueEndAfterErase(0), 0xfffffff8);



  assert.equal(managerPollA1fc00IterAdvance(0x1000), 0x1008);



  assert.equal(managerPollA1fc00IterContinue(0x1000, 0x1008), true);



  assert.equal(managerPollA1fc00IterContinue(0x1008, 0x1008), false);







  assert.equal(managerPollA1fc00PendingNeedsGrow(0x10, 0x10), true);



  assert.equal(managerPollA1fc00PendingNeedsGrow(0x10, 0x18), false);



  assert.equal(managerPollA1fc00PendingEndAfterPush(0x10), 0x18);







  assert.equal(managerPollA1fc00PendingCapacityBytes(0x1010, 0x1000), 0x10);



  assert.equal(managerPollA1fc00PendingCapacityBytes(0x1007, 0x1000), 0);



  assert.equal(managerPollA1fc00PendingCapacityBytes(0x2000, 0x1000), 0x1000);







  assert.equal(managerPollA1fc00FreeUsesHeapHeader(0xfff), false);



  assert.equal(managerPollA1fc00FreeUsesHeapHeader(0x1000), true);



  assert.equal(managerPollA1fc00FreeHeaderSize(0x1000), 0x1023);



  assert.equal(managerPollA1fc00FreeHeaderSize(0xffffffdd), 0); // wrap







  // begin=header+4 â†’ off 0 â†’ ok; begin=header+4+0x1f â†’ ok; +0x20 â†’ fail



  assert.equal(managerPollA1fc00FreeHeaderOffsetOk(0x1004, 0x1000), true);



  assert.equal(managerPollA1fc00FreeHeaderOffsetOk(0x1023, 0x1000), true);



  assert.equal(managerPollA1fc00FreeHeaderOffsetOk(0x1024, 0x1000), false);







  assert.equal(managerPollA1fc00NotifyCbNeeded(0), false);



  assert.equal(managerPollA1fc00NotifyCbNeeded(0xdeadbeef), true);







  // buffer bytes: 2 elems of 16 â†’ SAR(32,4)=2; <<2 = 8



  assert.equal(managerPollA1f280BufferBytes(0x1020, 0x1000), 8);



  assert.equal(managerPollA1f280BufferBytes(0x1000, 0x1000), 0);







  assert.equal(managerPollA1f280AxisDir(0, 0.5), 0);



  assert.equal(managerPollA1f280AxisDir(0.5, 0.5), 0); // equal â†’ no bit



  assert.equal(managerPollA1f280AxisDir(0.6, 0.5), A1F280_DIR_POS_X);



  assert.equal(managerPollA1f280AxisDir(-0.6, 0.5), A1F280_DIR_NEG_X);



  assert.equal(managerPollA1f280AxisDir(Number.NaN, 0.5), 0);







  // pair0: +x and -y



  assert.equal(



    managerPollA1f280AxisPairBits(0.9, -0.9, 0.5, 0),



    A1F280_DIR_POS_X | A1F280_DIR_NEG_Y,



  );



  // pair1 shifted +4



  assert.equal(



    managerPollA1f280AxisPairBits(0.9, -0.9, 0.5, 4),



    (A1F280_DIR_POS_X | A1F280_DIR_NEG_Y) << 4,



  );



});







test("JS oracle: a1f280 / a1eed0 deeper peels (ABI v8 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 8);



  assert.equal(A1F280_ACTION_MODE_IDLE, 4);



  assert.equal(A1F280_RUMBLE_SUPPRESS_FLAG, 0x8);







  // buffer count: 2 elems of 16 â†’ SAR(32,4)=2; bytes = count<<2



  assert.equal(managerPollA1f280BufferCount(0x1020, 0x1000), 2);



  assert.equal(managerPollA1f280BufferCount(0x1000, 0x1000), 0);



  assert.equal(



    managerPollA1f280BufferBytes(0x1020, 0x1000),



    managerPollA1f280BufferCount(0x1020, 0x1000) << 2,



  );







  // a1eed0 deadzone remap



  assert.equal(managerPollA1eed0DeadzoneRemap(0, 0.25), 0);



  assert.equal(managerPollA1eed0DeadzoneRemap(0.25, 0.25), 0);



  assert.equal(managerPollA1eed0DeadzoneRemap(-0.25, 0.25), 0);



  // (0.75-0.25)/(1-0.25) = 0.5/0.75 = 2/3



  assert.equal(



    managerPollA1eed0DeadzoneRemap(0.75, 0.25),



    Math.fround(Math.fround(0.5) / Math.fround(0.75)),



  );



  assert.equal(



    managerPollA1eed0DeadzoneRemap(-0.75, 0.25),



    Math.fround(Math.fround(-0.5) / Math.fround(0.75)),



  );



  assert.equal(managerPollA1eed0DeadzoneRemap(Number.NaN, 0.25), 0);







  // axis pos/neg split



  assert.equal(managerPollA1f280AxisNegPart(0.5), 0);



  assert.equal(managerPollA1f280AxisNegPart(-0.5), 0.5);



  assert.equal(managerPollA1f280AxisNegPart(0), 0);



  assert.equal(managerPollA1f280AxisNegPart(Number.NaN), 0);



  assert.equal(managerPollA1f280AxisPosPart(0.5), 0.5);



  assert.equal(managerPollA1f280AxisPosPart(-0.5), 0);



  assert.equal(managerPollA1f280AxisPosPart(0), 0);



  assert.equal(managerPollA1f280AxisPosPart(Number.NaN), 0);







  assert.equal(managerPollA1f280ActionModeIdle(4), true);



  assert.equal(managerPollA1f280ActionModeIdle(0), false);



  assert.equal(managerPollA1f280ActionModeIdle(3), false);







  assert.equal(managerPollA1f280ActionIdValid(-1), false);



  assert.equal(managerPollA1f280ActionIdValid(0), true);



  assert.equal(managerPollA1f280ActionIdValid(42), true);







  assert.equal(managerPollA1f280BufferIndexInRange(0, 2), true);



  assert.equal(managerPollA1f280BufferIndexInRange(1, 2), true);



  assert.equal(managerPollA1f280BufferIndexInRange(2, 2), false);



  assert.equal(managerPollA1f280BufferIndexInRange(0xffffffff, 0), false);







  // (cc + index*4)*4: cc=1 index=2 â†’ (1+8)*4 = 36



  assert.equal(managerPollA1f280BufferSlotOffset(1, 2), 36);



  assert.equal(managerPollA1f280BufferSlotOffset(0, 0), 0);



  assert.equal(managerPollA1f280BufferSlotOffset(4, 0), 16);







  assert.equal(managerPollA1f280RumblePathNeeded(0), true);



  assert.equal(managerPollA1f280RumblePathNeeded(8), false);



  assert.equal(managerPollA1f280RumblePathNeeded(0xf7), true);



  assert.equal(managerPollA1f280RumblePathNeeded(0xff), false);







  assert.equal(managerPollA1f280TimerPositive(1), true);



  assert.equal(managerPollA1f280TimerPositive(0), false);



  assert.equal(managerPollA1f280TimerPositive(-1), false);



  assert.equal(managerPollA1f280TimerPositive(Number.NaN), false);







  assert.equal(managerPollA1f280TimerClampNonneg(1.5), 1.5);



  assert.equal(managerPollA1f280TimerClampNonneg(0), 0);



  assert.equal(managerPollA1f280TimerClampNonneg(-0.25), 0);



  // ABI v20: the zero-store is skipped on an unordered compare, so NaN is kept.



  assert.ok(Number.isNaN(managerPollA1f280TimerClampNonneg(Number.NaN)));







  // Sibling a20020 pure return is queue_count (already covered by a1fc00).



  assert.equal(managerPollA1fc00QueueCount(0x1018, 0x1000), 3);



});







test("JS oracle: a68490 / post-tick scale peels (ABI v9 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 9);



  assert.equal(A68490_NS_SCALE, 1e9);



  assert.equal(A1F280_TICK_DELTA_TO_SEC_BITS, 0x3a83126f);



  assert.equal(A1F280_TICK_SCALE_MUL_LO, 0xd7b634db);



  assert.equal(A1F280_TICK_SCALE_MUL_HI, 0x431bde82);



  assert.equal(Number(A1F280_TICK_SCALE_SHIFT), 82);







  // (1e9 / 1e9) * 1e9 = 1e9; (2e9 / 1e6) * 1e9 = 2e12



  assert.equal(managerPollA68490NsF64(1e9, 1e9), 1e9);



  assert.equal(managerPollA68490NsF64(2e9, 1e6), 2e12);



  assert.equal(managerPollA68490NsF64(0, 1e9), 0);







  // scale: (seed * magic) >> 82 â‰ˆ seed/1e6 (nsâ†’ms for a68490 ns seed)



  assert.deepEqual(managerPollA1f280ScaleTick(0, 0), { lo: 0, hi: 0 });



  assert.deepEqual(managerPollA1f280ScaleTick(1000, 0), { lo: 0, hi: 0 });



  const ms1 = managerPollA1f280ScaleTick(1000000, 0);



  assert.equal(ms1.lo, 1);



  assert.equal(ms1.hi, 0);



  assert.equal(managerPollA1f280ScaleTickLo(1000000, 0), 1);



  assert.equal(managerPollA1f280ScaleTickHi(1000000, 0), 0);



  // 2_000_000 ns â†’ 2 ms



  const ms2 = managerPollA1f280ScaleTick(2000000, 0);



  assert.equal(ms2.lo, 2);



  assert.equal(ms2.hi, 0);



  // large seed crosses into hi



  const big = managerPollA1f280ScaleTick(0, 1); // 2^32 ns



  assert.equal(typeof big.lo, "number");



  assert.equal(typeof big.hi, "number");



  // cross-check: (2^32 * mul) >> 82



  const expectedBig =



    ((1n << 32n) * ((BigInt(A1F280_TICK_SCALE_MUL_HI) << 32n) |



      BigInt(A1F280_TICK_SCALE_MUL_LO))) >>



    82n;



  assert.equal(big.lo, Number(expectedBig & 0xffffffffn) >>> 0);



  assert.equal(big.hi, Number((expectedBig >> 32n) & 0xffffffffn) >>> 0);







  // delta: 10 - 3 = 7; borrow across halves



  assert.deepEqual(managerPollA1f280TickDelta(10, 0, 3, 0), { lo: 7, hi: 0 });



  assert.deepEqual(managerPollA1f280TickDelta(0, 1, 1, 0), {



    lo: 0xffffffff,



    hi: 0,



  });



  assert.equal(managerPollA1f280TickDeltaLo(5, 0, 5, 0), 0);



  assert.equal(managerPollA1f280TickDeltaHi(5, 0, 5, 0), 0);







  assert.equal(managerPollA1f280TickDeltaNonzero(0, 0), false);



  assert.equal(managerPollA1f280TickDeltaNonzero(1, 0), true);



  assert.equal(managerPollA1f280TickDeltaNonzero(0, 1), true);







  // 16666 us * 0.001 = 16.666â€¦ f32



  assert.equal(



    managerPollA1f280TickDeltaSecondsF32(16666),



    Math.fround(Math.fround(16666) * Math.fround(0.001)),



  );



  assert.equal(managerPollA1f280TickDeltaSecondsF32(0), 0);







  assert.equal(managerPollA1f280TimerSubDelta(1.0, 0.25), Math.fround(0.75));



  assert.equal(managerPollA1f280TimerSubDelta(0.5, 0.5), 0);







  assert.equal(managerPollA1f280RumbleIntensityActive(1), true);



  assert.equal(managerPollA1f280RumbleIntensityActive(0), false);



  assert.equal(managerPollA1f280RumbleIntensityActive(-1), false);



  assert.equal(managerPollA1f280RumbleIntensityActive(Number.NaN), true);



});







test("JS oracle: a1f65a rumble vcall arg prep (ABI v10 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 10);



  assert.equal(A1F280_OFF_TIMER, 0xd8);



  assert.equal(A1F280_OFF_INTENSITY, 0xdc);



  assert.equal(A1F280_OFF_BASELINE_LO, 0xe0);



  assert.equal(A1F280_OFF_BASELINE_HI, 0xe4);



  assert.equal(A1F280_VTBL_RUMBLE, 0x84);



  assert.equal(A1F280_SUCCESS_AL, 1);



  assert.equal(managerPollA1f280RumbleVtblSlot(), 0x84);



  assert.equal(managerPollA1f280SuccessReturn(), 1);







  // Active timer keeps both; inactive zeros both.



  assert.equal(managerPollA1f280RumbleVcallTimer(1.5), 1.5);



  assert.equal(managerPollA1f280RumbleVcallIntensity(1.5, 0.75), 0.75);



  assert.equal(managerPollA1f280RumbleVcallTimer(0), 0);



  assert.equal(managerPollA1f280RumbleVcallIntensity(0, 0.75), 0);



  assert.equal(managerPollA1f280RumbleVcallTimer(-0.5), 0);



  assert.equal(managerPollA1f280RumbleVcallIntensity(-0.5, 0.75), 0);



  // NaN: intensity active keeps timer as NaN and saved intensity.



  // Since ABI v20 timer_clamp_nonneg agrees (it models the same PE range).



  assert.ok(Number.isNaN(managerPollA1f280RumbleVcallTimer(Number.NaN)));



  assert.equal(managerPollA1f280RumbleVcallIntensity(Number.NaN, 0.5), 0.5);



  assert.ok(Number.isNaN(managerPollA1f280TimerClampNonneg(Number.NaN)));







  assert.deepEqual(managerPollA1f280RumbleVcallArgs(2, 0.3), {



    timer: Math.fround(2),



    intensity: Math.fround(0.3),



  });



  assert.deepEqual(managerPollA1f280RumbleVcallArgs(0, 0.3), {



    timer: 0,



    intensity: 0,



  });







  assert.equal(managerPollA1f280RumbleTimerAfterGate(1.25), 1.25);



  assert.equal(managerPollA1f280RumbleTimerAfterGate(-1), 0);







  // Neg-timer alternate path: only ordered timer < 0.



  assert.equal(managerPollA1f280RumbleNegTimerPath(-0.1), true);



  assert.equal(managerPollA1f280RumbleNegTimerPath(0), false);



  assert.equal(managerPollA1f280RumbleNegTimerPath(1), false);



  assert.equal(managerPollA1f280RumbleNegTimerPath(Number.NaN), false);







  assert.deepEqual(managerPollA1f280BaselineStore(0x1234, 0x5678), {



    lo: 0x1234,



    hi: 0x5678,



  });



  assert.deepEqual(managerPollA1f280BaselineStore(-1, -2), {



    lo: 0xffffffff,



    hi: 0xfffffffe,



  });



});







test("JS oracle: a112c0 pure CF / message ptrs (ABI v11 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 11);



  assert.equal(A112C0_LEVEL_INFO, 0x1);



  assert.equal(A112C0_LEVEL_NET, 0x2);



  assert.equal(A112C0_LEVEL_WARN, 0x4);



  assert.equal(A112C0_LEVEL_ERROR, 0x8);



  assert.equal(A112C0_LEVEL_ASSERT, 0x10);



  assert.equal(A112C0_STATE_IDLE, 0);



  assert.equal(A112C0_STATE_INIT, 1);



  assert.equal(A112C0_STATE_READY, 2);



  assert.equal(A112C0_BUF_CAP, 0x2800);



  assert.equal(A112C0_HOST_VA, 0x00a112c0);



  assert.equal(A112C0_FMT_VA, 0x00b62fdc);



  assert.equal(A112C0_MSG_VA_INVALID_MUTEX, 0x00b9fda8);



  assert.equal(A112C0_MSG_VA_ACTION_ID_OOR, 0x00b82e78);



  assert.equal(a112c0HostVa(), 0x00a112c0);



  assert.equal(a112c0FmtVa(), 0x00b62fdc);



  assert.equal(a112c0BufCap(), 0x2800);



  assert.equal(a112c0LevelAssert(), 0x10);



  assert.equal(a112c0MsgVaInvalidMutex(), 0x00b9fda8);



  assert.equal(a112c0MsgVaActionIdOor(), 0x00b82e78);







  // Reenter: only state==1 skips.



  assert.equal(a112c0ReenterSkip(0), false);



  assert.equal(a112c0ReenterSkip(1), true);



  assert.equal(a112c0ReenterSkip(2), false);







  // Sink active requires ptr and mask bit.



  assert.equal(a112c0SinkActive(0, 0xff, 0x10), false);



  assert.equal(a112c0SinkActive(0x1234, 0, 0x10), false);



  assert.equal(a112c0SinkActive(0x1234, 0x01, 0x10), false);



  assert.equal(a112c0SinkActive(0x1234, 0x10, 0x10), true);



  assert.equal(a112c0SinkActive(0x1234, 0xff, 0x08), true);







  // Body: reenter wins; else low-byte OR sink.



  assert.equal(a112c0BodyNeeded(1, 0x1234, 0xff, 0x10), false);



  assert.equal(a112c0BodyNeeded(0, 0, 0, 0), false);



  assert.equal(a112c0BodyNeeded(0, 0, 0, 0x10), true);



  assert.equal(a112c0BodyNeeded(2, 0x1, 0x10, 0x10), true);



  // level with high bits only, low byte 0, no sink â†’ skip



  assert.equal(a112c0BodyNeeded(0, 0, 0, 0x100), false);



  // level low byte 0 but sink matches full level dword



  assert.equal(a112c0BodyNeeded(0, 0x1, 0x100, 0x100), true);







  assert.equal(a112c0InitNeeded(0), true);



  assert.equal(a112c0InitNeeded(1), false);



  assert.equal(a112c0InitNeeded(2), false);



  assert.equal(a112c0StateAfterInit(0), A112C0_STATE_IDLE);



  assert.equal(a112c0StateAfterInit(1), A112C0_STATE_READY);



  assert.equal(a112c0StateAfterInit(0xff), A112C0_STATE_READY);







  assert.equal(a112c0PrefixEnabled(0), false);



  assert.equal(a112c0PrefixEnabled(1), true);







  // Prefix VA switch (exact PE table).



  assert.equal(a112c0PrefixVa(A112C0_LEVEL_INFO), A112C0_PREFIX_VA_INFO);



  assert.equal(a112c0PrefixVa(A112C0_LEVEL_NET), A112C0_PREFIX_VA_NET);



  assert.equal(a112c0PrefixVa(A112C0_LEVEL_WARN), A112C0_PREFIX_VA_WARN);



  assert.equal(a112c0PrefixVa(A112C0_LEVEL_ERROR), A112C0_PREFIX_VA_ERROR);



  assert.equal(a112c0PrefixVa(A112C0_LEVEL_ASSERT), A112C0_PREFIX_VA_ASSERT);



  assert.equal(a112c0PrefixVa(0), A112C0_PREFIX_VA_EMPTY);



  assert.equal(a112c0PrefixVa(3), A112C0_PREFIX_VA_EMPTY); // level-1=2 â†’ case 5



  assert.equal(a112c0PrefixVa(0x20), A112C0_PREFIX_VA_EMPTY);



  assert.equal(a112c0PrefixVa(0xffffffff), A112C0_PREFIX_VA_EMPTY);







  assert.equal(a112c0OdsNeeded(0), false);



  assert.equal(a112c0OdsNeeded(0x10), true);



  assert.equal(a112c0OdsNeeded(0x100), false); // low byte only



  assert.equal(a112c0SinkWriteNeeded(0x1, 0x10, 0x10), true);



  assert.equal(a112c0SinkWriteNeeded(0, 0xff, 0x10), false);







  assert.equal(a112c0BufRemaining(0), 0x2800);



  assert.equal(a112c0BufRemaining(9), 0x2800 - 9);



  assert.equal(a112c0BufRemaining(0x2800), 0);



  // wrap: 0x2800 - 0x2801



  assert.equal(a112c0BufRemaining(0x2801), (0x2800 - 0x2801) >>> 0);







  assert.equal(a112c0TrailNewline(0x0a), true);



  assert.equal(a112c0TrailNewline(0x00), false);



  assert.equal(a112c0TrailNewline(0x0d), false);



  assert.equal(a112c0TrailNewline("\n".charCodeAt(0)), true);







  // a1f280 ActionId OOR log: inverse of index-in-range.



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(0, 2), false);



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(1, 2), false);



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(2, 2), true);



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(0, 0), true);



  // null lock â†’ a112c0: covered by existing lock_obj_present(0)==false



  assert.equal(managerPollA1fc00LockObjPresent(0), false);



});







test("JS oracle: a1f4db action-query vcall arg/gate CF (ABI v12 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 12);



  assert.equal(A1F280_OFF_ACTION_INDEX, 0xc8);



  assert.equal(A1F280_OFF_ACTION_MODE, 0xcc);



  assert.equal(A1F280_VTBL_ACTION_QUERY, 0x3c);



  assert.equal(A1F280_ACTION_QUERY_ARG, 0);



  assert.equal(A1F280_ACTION_QUERY_CALL_VA, 0x00a1f4db);



  assert.equal(A1F280_ACTION_INDEX_CLEARED, 0xffffffff);



  assert.equal(A1F280_ACTION_MODE_AFTER_PUSH, 4);



  assert.equal(A1F280_ACTION_MODE_AFTER_PUSH, A1F280_ACTION_MODE_IDLE);







  assert.equal(managerPollA1f280ActionQueryVtblSlot(), 0x3c);



  assert.equal(managerPollA1f280ActionQueryCallVa(), 0x00a1f4db);



  assert.equal(managerPollA1f280ActionQueryVcallArg(), 0);



  assert.equal(managerPollA1f280ActionIndexAfterPush(), 0xffffffff);



  assert.equal(managerPollA1f280ActionModeAfterPush(), 4);







  // Gate: inverse of mode idle (mode==4 skips vcall).



  assert.equal(managerPollA1f280ActionQueryVcallNeeded(4), false);



  assert.equal(managerPollA1f280ActionQueryVcallNeeded(0), true);



  assert.equal(managerPollA1f280ActionQueryVcallNeeded(3), true);



  assert.equal(managerPollA1f280ActionQueryVcallNeeded(5), true);



  assert.equal(managerPollA1f280ActionQueryVcallNeeded(0xffffffff), true);



  // Cross-check retained v8 idle predicate.



  assert.equal(



    managerPollA1f280ActionQueryVcallNeeded(4),



    !managerPollA1f280ActionModeIdle(4),



  );



  assert.equal(



    managerPollA1f280ActionQueryVcallNeeded(0),



    !managerPollA1f280ActionModeIdle(0),



  );







  // Post-vcall id_valid remains host result gate (retained v8).



  assert.equal(managerPollA1f280ActionIdValid(-1), false);



  assert.equal(managerPollA1f280ActionIdValid(0), true);



  assert.equal(managerPollA1f280ActionIdValid(42), true);



});







test("JS oracle: a1f3f8 fill vcall+0x80 arg/gate CF (ABI v13 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 13);



  assert.equal(A1F280_VTBL_FILL, 0x80);



  assert.equal(A1F280_VTBL_AXIS_FILL, 0x7c);



  assert.equal(A1F280_FILL_PAIR1_CALL_VA, 0x00a1f3f8);



  assert.equal(A1F280_FILL_PAIR0_CALL_VA, 0x00a1f320);



  assert.equal(A1F280_FILL_PAIR1_ARG, 1);



  assert.equal(A1F280_FILL_PAIR0_ARG, 0);



  assert.equal(A1F280_OFF_AXIS_PAIR0, 0x40);



  assert.equal(A1F280_OFF_AXIS_PAIR1, 0x50);



  assert.equal(A1F280_DIR_BIT_BASE_PAIR0, 0);



  assert.equal(A1F280_DIR_BIT_BASE_PAIR1, 4);







  assert.equal(managerPollA1f280FillVtblSlot(), 0x80);



  assert.equal(managerPollA1f280FillCallVa(), 0x00a1f3f8);



  assert.equal(managerPollA1f280FillPair0CallVa(), 0x00a1f320);



  assert.equal(managerPollA1f280AxisFillVtblSlot(), 0x7c);



  assert.equal(managerPollA1f280FillPair1Arg(), 1);



  assert.equal(managerPollA1f280FillPair0Arg(), 0);



  assert.equal(managerPollA1f280FillAxisStoreBasePair1(), 0x50);



  assert.equal(managerPollA1f280FillDirBitBasePair1(), 4);







  // Post-vcall gate: AL != 0 â†’ pair fill body.



  assert.equal(managerPollA1f280FillVcallOk(0), false);



  assert.equal(managerPollA1f280FillVcallOk(1), true);



  assert.equal(managerPollA1f280FillVcallOk(0xff), true);



  assert.equal(managerPollA1f280FillVcallOk(0x100), false); // low-byte only



  assert.equal(managerPollA1f280FillVcallOk(0x101), true);







  // Pair1 dir bits reuse v7 axis_pair_bits with bit_base 4.



  const bits = managerPollA1f280AxisPairBits(-1, 1, 0.2, 4);



  assert.equal(bits & 0x10, 0x10); // neg-x â†’ bit4



  assert.equal(bits & 0x20, 0); // not pos-x



  assert.equal(bits & 0x80, 0x80); // pos-y â†’ bit7



  assert.equal(bits & 0x40, 0); // not neg-y







  // Pair1 axis split stores use same pure neg/pos as pair0 (v8).



  assert.equal(managerPollA1f280AxisNegPart(-0.5), 0.5);



  assert.equal(managerPollA1f280AxisPosPart(-0.5), 0);



  assert.equal(managerPollA1f280AxisPosPart(0.5), 0.5);



});







test("JS oracle: a1f40d axis-fill vcall+0x7c out-buffer / field CF (ABI v14 retained)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 14);



  assert.equal(A1F280_AXIS_FILL_PAIR1_CALL_VA, 0x00a1f40d);



  assert.equal(A1F280_AXIS_FILL_PAIR0_CALL_VA, 0x00a1f335);



  assert.equal(A1EED0_AXIS_FILL_CALL_VA, 0x00a1eee0);



  assert.equal(A1F280_AXIS_FILL_OUT_FLOAT_COUNT, 2);



  assert.equal(A1F280_AXIS_FILL_OUT_X_OFS, 0);



  assert.equal(A1F280_AXIS_FILL_OUT_Y_OFS, 4);



  assert.equal(A1F280_OFF_DIR_BITS, 0x30);



  assert.equal(A1F280_OFF_DIR_THRESH, 0xd4);



  assert.equal(A1F280_OFF_REMAP_THRESH, 0xd0);



  // Remap thresh and dir thresh are distinct fields.



  assert.notEqual(A1F280_OFF_DIR_THRESH, A1F280_OFF_REMAP_THRESH);







  assert.equal(managerPollA1f280AxisFillCallVa(), 0x00a1f40d);



  assert.equal(managerPollA1f280AxisFillPair0CallVa(), 0x00a1f335);



  assert.equal(managerPollA1eed0AxisFillCallVa(), 0x00a1eee0);



  assert.equal(managerPollA1f280AxisFillOutFloatCount(), 2);



  assert.equal(managerPollA1f280AxisFillOutXOfs(), 0);



  assert.equal(managerPollA1f280AxisFillOutYOfs(), 4);



  assert.equal(managerPollA1f280DirThreshOfs(), 0xd4);



  assert.equal(managerPollA1f280RemapThreshOfs(), 0xd0);



  assert.equal(managerPollA1f280DirBitsOfs(), 0x30);



  assert.equal(managerPollA1f280FillAxisStoreBasePair0(), 0x40);



  assert.equal(managerPollA1f280FillDirBitBasePair0(), 0);



  // vtbl slot retained from v13.



  assert.equal(managerPollA1f280AxisFillVtblSlot(), 0x7c);







  // dir_bits_merge = prior | pair_bits (pair1 bit_base 4).



  const prior = 0x0f; // pair0 nibble already set



  const merged = managerPollA1f280DirBitsMerge(prior, -1, 1, 0.2, 4);



  assert.equal(merged & 0x0f, 0x0f); // prior retained



  assert.equal(merged & 0x10, 0x10); // neg-x â†’ bit4



  assert.equal(merged & 0x80, 0x80); // pos-y â†’ bit7



  assert.equal(merged & 0x20, 0); // not pos-x



  assert.equal(merged & 0x40, 0); // not neg-y







  // pair0 bit_base 0: same axes â†’ low nibble.



  const m0 = managerPollA1f280DirBitsMerge(0, -1, 1, 0.2, 0);



  assert.equal(m0 & 0x1, 0x1);



  assert.equal(m0 & 0x8, 0x8);



  assert.equal(m0 & 0xf0, 0);







  // Inside deadzone â†’ no new bits; prior preserved.



  assert.equal(managerPollA1f280DirBitsMerge(0x33, 0.05, -0.05, 0.2, 4), 0x33);







  // NaN â†’ no bits.



  assert.equal(



    managerPollA1f280DirBitsMerge(0x5, Number.NaN, Number.NaN, 0.2, 0),



    0x5,



  );







  // Matches independent pair_bits composition.



  const bits = managerPollA1f280AxisPairBits(0.9, -0.9, 0.1, 4);



  assert.equal(managerPollA1f280DirBitsMerge(0, 0.9, -0.9, 0.1, 4), bits);



});







test("JS oracle: a1f30a ready-gate vcall+0x78 arg/gate CF (ABI v15)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 15);



  assert.equal(A1F280_VTBL_READY, 0x78);



  assert.equal(A1F280_READY_CALL_VA, 0x00a1f30a);







  assert.equal(managerPollA1f280ReadyVtblSlot(), 0x78);



  assert.equal(managerPollA1f280ReadyCallVa(), 0x00a1f30a);







  // Post-vcall gate: AL != 0 â†’ continue into pair0 fill path.



  assert.equal(managerPollA1f280ReadyVcallOk(0), false);



  assert.equal(managerPollA1f280ReadyVcallOk(1), true);



  assert.equal(managerPollA1f280ReadyVcallOk(0xff), true);



  assert.equal(managerPollA1f280ReadyVcallOk(0x100), false); // low-byte only



  assert.equal(managerPollA1f280ReadyVcallOk(0x101), true);



  assert.equal(managerPollA1f280ReadyVcallOk(0xffffffff), true);







  // Early return is the inverse (PE epilog when not ready).



  assert.equal(managerPollA1f280ReadyEarlyReturn(0), true);



  assert.equal(managerPollA1f280ReadyEarlyReturn(1), false);



  assert.equal(managerPollA1f280ReadyEarlyReturn(0x100), true);



  assert.equal(managerPollA1f280ReadyEarlyReturn(0x80), false);







  // Same pure "ok" predicate as fill_vcall_ok (low-byte AL != 0).



  for (const al of [0, 1, 0xff, 0x100, 0x101, 0x7f, 0x80]) {



    assert.equal(



      managerPollA1f280ReadyVcallOk(al),



      managerPollA1f280FillVcallOk(al),



      `readyOk â‰¡ fillOk al=${al}`,



    );



    assert.equal(



      managerPollA1f280ReadyEarlyReturn(al),



      !managerPollA1f280ReadyVcallOk(al),



      `early inverse al=${al}`,



    );



  }







  // Slot ordering on this path: ready 0x78 < axis fill 0x7c < fill present 0x80.



  assert.ok(A1F280_VTBL_READY < A1F280_VTBL_AXIS_FILL);



  assert.ok(A1F280_VTBL_AXIS_FILL < A1F280_VTBL_FILL);



  // Ready call is before pair0 fill-present and pair1 axis fill sites.



  assert.ok(A1F280_READY_CALL_VA < A1F280_FILL_PAIR0_CALL_VA);



  assert.ok(A1F280_READY_CALL_VA < A1F280_AXIS_FILL_PAIR1_CALL_VA);



});







test("JS oracle: a648b0 tracked-heap control flow (ABI v16)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 16);







  // Import-table proven CRT heap slots + OOM broadcast constants.



  assert.equal(A648B0_MALLOC_IAT_VA, 0x00b187e0);



  assert.equal(A648B0_FREE_IAT_VA, 0x00b187dc);



  assert.equal(A648B0_OOM_HOST_VA, 0x00a23200);



  assert.equal(A648B0_OOM_CODE, 0x7fcb9dd6);



  assert.equal(A648B0_HEADER_BYTES, 4);



  assert.equal(managerPollA648b0MallocIatVa(), 0x00b187e0);



  assert.equal(managerPollA648b0FreeIatVa(), 0x00b187dc);



  assert.equal(managerPollA648b0OomHostVa(), 0x00a23200);



  assert.equal(managerPollA648b0OomCode(), 0x7fcb9dd6);



  assert.equal(managerPollA648b0HeaderBytes(), 4);







  // Tracker base select: null context falls back to the static counter pair.



  assert.equal(A648B0_TRACKER_CTX_VA, 0x00c7de78);



  assert.equal(A648B0_TRACKER_CTX_OFS, 0x30);



  assert.equal(A648B0_TRACKER_FALLBACK_VA, 0x00c7f618);



  assert.equal(managerPollA648b0TrackerBase(0), 0x00c7f618);



  assert.equal(managerPollA648b0TrackerBase(0x1000), 0x1030);



  assert.equal(managerPollA648b0TrackerBase(0xfffffff0), 0x20); // wrap



  // Account mode never uses the fallback (it adds through the raw context).



  assert.equal(managerPollA648b0AccountTarget(0), 0x30);



  assert.equal(managerPollA648b0AccountTarget(0x1000), 0x1030);



  assert.notEqual(



    managerPollA648b0AccountTarget(0),



    managerPollA648b0TrackerBase(0),



  );







  // Clamp is exactly size_hi != 0 (the low-dword guard can never fail).



  assert.equal(managerPollA648b0AllocClampNeeded(0), false);



  assert.equal(managerPollA648b0AllocClampNeeded(1), true);



  assert.equal(managerPollA648b0AllocClampNeeded(0xffffffff), true);



  assert.equal(managerPollA648b0AllocSizeClampedLo(0xffffffff, 0), 0xffffffff);



  assert.equal(managerPollA648b0AllocSizeClampedLo(0xffffffff, 1), 0);



  assert.equal(managerPollA648b0AllocSizeClampedLo(0x40, 0), 0x40);







  // malloc size = clamped_lo + 4, with the carry as the accounted high dword.



  assert.equal(managerPollA648b0AllocMallocSize(0x40, 0), 0x44);



  assert.equal(managerPollA648b0AllocMallocSizeHi(0x40, 0), 0);



  assert.equal(managerPollA648b0AllocMallocSize(0x40, 7), 4); // clamped



  assert.equal(managerPollA648b0AllocMallocSizeHi(0x40, 7), 0);



  assert.equal(managerPollA648b0AllocMallocSize(0xfffffffc, 0), 0);



  assert.equal(managerPollA648b0AllocMallocSizeHi(0xfffffffc, 0), 1);



  assert.equal(managerPollA648b0AllocMallocSize(0xfffffffb, 0), 0xffffffff);



  assert.equal(managerPollA648b0AllocMallocSizeHi(0xfffffffb, 0), 0);







  // The stored header is exactly the padded low dword pushed to malloc.



  for (const [lo, hi] of [[0, 0], [1, 0], [0x14, 0], [0xffffffff, 0], [9, 3]]) {



    assert.equal(



      managerPollA648b0AllocHeaderValue(lo, hi),



      managerPollA648b0AllocMallocSize(lo, hi),



      `header ${lo},${hi}`,



    );



  }







  // Failure/commit split and the payload offset.



  assert.equal(managerPollA648b0AllocOk(0), false);



  assert.equal(managerPollA648b0AllocOk(0x1000), true);



  assert.equal(managerPollA648b0AllocPayloadPtr(0x1000), 0x1004);



  assert.equal(managerPollA648b0AllocPayloadPtr(0xfffffffe), 2); // wrap



  assert.equal(managerPollA648b0AllocReturn(0), 0);



  assert.equal(managerPollA648b0AllocReturn(0x1000), 0x1004);







  // Free path: null payload is a no-op; otherwise the block is payload - 4.



  assert.equal(managerPollA648b0FreeNeeded(0), false);



  assert.equal(managerPollA648b0FreeNeeded(4), true);



  assert.equal(managerPollA648b0FreeBlockPtr(0x1004), 0x1000);



  assert.equal(managerPollA648b0FreeBlockPtr(0), 0xfffffffc); // wrap



  // Round-trip: freeing an allocation returns the original block.



  for (const block of [0x10, 0x1000, 0x7ffffff0]) {



    assert.equal(



      managerPollA648b0FreeBlockPtr(managerPollA648b0AllocPayloadPtr(block)),



      block,



      `roundtrip ${block}`,



    );



  }







  // Balanced tracker for ordinary sizes: alloc adds N, free subtracts N.



  {



    const size = 0x140;



    const add = managerPollA648b0AllocMallocSize(size, 0);



    const afterAlloc = managerPollA648b0TrackerAdd(



      0,



      0,



      add,



      managerPollA648b0AllocMallocSizeHi(size, 0),



    );



    const afterFree = managerPollA648b0TrackerSubSize(



      afterAlloc.lo,



      afterAlloc.hi,



      managerPollA648b0AllocHeaderValue(size, 0),



    );



    assert.equal(afterFree.lo, 0);



    assert.equal(afterFree.hi, 0);



  }



  // PE asymmetry: the alloc carry high dword is never subtracted back, because



  // free only reads a 32-bit header and borrows with 0.



  {



    const size = 0xfffffffc;



    const add = managerPollA648b0AllocMallocSize(size, 0); // 0



    const hi = managerPollA648b0AllocMallocSizeHi(size, 0); // 1



    assert.equal(hi, 1);



    const afterAlloc = managerPollA648b0TrackerAdd(0, 0, add, hi);



    const afterFree = managerPollA648b0TrackerSubSize(



      afterAlloc.lo,



      afterAlloc.hi,



      managerPollA648b0AllocHeaderValue(size, 0),



    );



    assert.equal(afterFree.lo, 0);



    assert.equal(afterFree.hi, 1); // residue left behind by the PE



  }







  // Walk wiring: DIDOD alloc size feeds a648b0 as size_lo with size_hi = 0.



  const didod = managerPollA6de60DidodAllocSize(3);



  assert.equal(didod, 3 * A6DE60_DIDOD_STRIDE);



  assert.equal(managerPollA648b0AllocMallocSize(didod, 0), didod + 4);



  // Saturated DIDOD size still only carries into the high dword.



  assert.equal(managerPollA6de60DidodAllocSize(0xffffffff), 0xffffffff);



  assert.equal(managerPollA648b0AllocMallocSize(0xffffffff, 0), 3);



  assert.equal(managerPollA648b0AllocMallocSizeHi(0xffffffff, 0), 1);



});







test("JS oracle: a6da10 teardown plan (ABI v16)", () => {



  assert.equal(A6DA10_SLOT_STRIDE, 4);



  assert.equal(A6DA10_COM_RELEASE_VTBL, 8);



  assert.equal(managerPollA6da10ComReleaseVtblSlot(), 8);



  assert.equal(A6DA10_DISCONNECT_CB_VA, 0x00c78d7c);



  assert.equal(A6DA10_DISCONNECT_USER_VA, 0x00c78d88);







  // Field offsets touched by the teardown are all distinct.



  const offsets = [



    A6DA10_OFF_DEV_STATE, A6DA10_OFF_DEV_NAME, A6DA10_OFF_DEV_BUF_A,



    A6DA10_OFF_DEV_BUF_B, A6DA10_OFF_STATE_COM, A6DA10_OFF_STATE_MAP_A,



    A6DA10_OFF_STATE_MAP_B,



  ];



  assert.equal(new Set(offsets).size, offsets.length);



  assert.equal(A6DA10_OFF_DEV_STATE, 0x20);



  assert.equal(A6DA10_OFF_STATE_COM, 0x14);







  // Slot addressing (32-bit wrap on both the scale and the add).



  assert.equal(managerPollA6da10SlotByteOffset(0), 0);



  assert.equal(managerPollA6da10SlotByteOffset(3), 12);



  assert.equal(managerPollA6da10SlotByteOffset(0x40000001), 4); // wrap



  assert.equal(managerPollA6da10SlotAddr(0x1000, 2), 0x1008);



  assert.equal(managerPollA6da10SlotAddr(0xfffffffc, 1), 0);



  assert.equal(managerPollA6da10MemmoveDst(0x1000, 2), 0x1008);



  assert.equal(managerPollA6da10MemmoveSrc(0x1000, 2), 0x100c);



  // Byte count (v6) is end - src.



  assert.equal(



    managerPollA6da10RemoveMoveBytes(0x1020, 0x1000, 2),



    0x1020 - managerPollA6da10MemmoveSrc(0x1000, 2),



  );



  // Removing the last element moves zero bytes.



  assert.equal(managerPollA6da10RemoveMoveBytes(0x100c, 0x1000, 2), 0);







  // Ordered teardown: COM block only when the state enable byte is 0.



  assert.equal(managerPollA6da10TeardownStepCount(0), A6DA10_TEARDOWN_STEPS_FULL);



  assert.equal(managerPollA6da10TeardownStepCount(1), A6DA10_TEARDOWN_STEPS_TAIL);



  assert.equal(managerPollA6da10TeardownStepCount(0xff), A6DA10_TEARDOWN_STEPS_TAIL);



  assert.deepEqual(managerPollA6da10TeardownPlan(0), [



    A6DA10_STEP_COM_RELEASE,



    A6DA10_STEP_FREE_STATE_MAP_A,



    A6DA10_STEP_FREE_STATE_MAP_B,



    A6DA10_STEP_FREE_DEV_NAME,



    A6DA10_STEP_FREE_STATE,



    A6DA10_STEP_FREE_DEV_BUF_A,



    A6DA10_STEP_FREE_DEV_BUF_B,



    A6DA10_STEP_FREE_DEV,



  ]);



  assert.deepEqual(managerPollA6da10TeardownPlan(1), [



    A6DA10_STEP_FREE_STATE,



    A6DA10_STEP_FREE_DEV_BUF_A,



    A6DA10_STEP_FREE_DEV_BUF_B,



    A6DA10_STEP_FREE_DEV,



  ]);



  // The tail is always a suffix of the full plan, in the same order.



  for (const enable of [0, 1, 2, 0xff]) {



    const plan = managerPollA6da10TeardownPlan(enable);



    assert.equal(plan.length, managerPollA6da10TeardownStepCount(enable));



    assert.deepEqual(plan.slice(-4), managerPollA6da10TeardownPlan(1));



    // The device object itself is always freed last.



    assert.equal(plan[plan.length - 1], A6DA10_STEP_FREE_DEV);



    // Plan gate agrees with the v6 enable predicate.



    assert.equal(



      plan.includes(A6DA10_STEP_COM_RELEASE),



      managerPollA6da10FreeComMaps(enable),



      `com gate ${enable}`,



    );



  }



});







test("JS oracle: a6dd30 axis store + callback frame (ABI v16)", () => {



  assert.equal(A6DD30_OFF_AXIS_BASE, 0x18);



  assert.equal(managerPollA6dd30AxisBaseOfs(), 0x18);



  assert.equal(A6DD30_CB_VA, 0x00c78d70);



  assert.equal(A6DD30_CB_USER_VA, 0x00c75dac);







  // Two adjacent float slots; the y lane is written at index + 1.



  assert.equal(managerPollA6dd30AxisSlotOffset(0), 0);



  assert.equal(managerPollA6dd30AxisSlotOffsetY(0), 4);



  assert.equal(managerPollA6dd30AxisSlotOffset(5), 20);



  assert.equal(managerPollA6dd30AxisSlotOffsetY(5), 24);



  assert.equal(managerPollA6dd30IndexAfterX(5), 6);



  assert.equal(managerPollA6dd30IndexAfterX(0xffffffff), 0); // wrap



  assert.equal(managerPollA6dd30AxisSlotOffsetY(0xffffffff), 0);



  // The y slot is always one float past x, modulo the 32-bit address wrap.



  for (const i of [0, 1, 7, 0x3fffffff, 0xffffffff]) {



    assert.equal(



      (managerPollA6dd30AxisSlotOffsetY(i) -



        managerPollA6dd30AxisSlotOffset(i)) >>>



        0,



      4,



      `slot delta ${i}`,



    );



  }







  // Callback frame layout (0x1c bytes popped by the caller).



  assert.equal(A6DD30_CB_FRAME_BYTES, 0x1c);



  assert.equal(managerPollA6dd30CbFrameBytes(), 0x1c);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_DEVICE), 0x00);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_INDEX), 0x04);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_NEW), 0x08);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_OLD), 0x0c);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_TIME), 0x10);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_USER), 0x18);



  assert.equal(managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_COUNT), 0xffffffff);



  assert.equal(managerPollA6dd30CbArgOfs(-1), 0xffffffff);



  // Offsets are strictly increasing and fit the frame (time is an f64).



  const argIds = [



    A6DD30_CB_ARG_DEVICE, A6DD30_CB_ARG_INDEX, A6DD30_CB_ARG_NEW,



    A6DD30_CB_ARG_OLD, A6DD30_CB_ARG_TIME, A6DD30_CB_ARG_USER,



  ];



  let prevOfs = -1;



  for (const id of argIds) {



    const ofs = managerPollA6dd30CbArgOfs(id);



    assert.ok(ofs > prevOfs, `increasing ${id}`);



    prevOfs = ofs;



  }



  assert.equal(



    managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_USER) + 4,



    A6DD30_CB_FRAME_BYTES,



  );



  assert.equal(



    managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_USER) -



      managerPollA6dd30CbArgOfs(A6DD30_CB_ARG_TIME),



    8, // f64 slot



  );







  // Callback gate: change AND non-null callback pointer.



  assert.equal(managerPollA6dd30CbNeeded(1, 0, 0x1234), true);



  assert.equal(managerPollA6dd30CbNeeded(1, 0, 0), false);



  assert.equal(managerPollA6dd30CbNeeded(1, 1, 0x1234), false);



  assert.equal(managerPollA6dd30CbNeeded(0, -0, 0x1234), false); // +0 == -0



  assert.equal(managerPollA6dd30CbNeeded(Number.NaN, 0, 0x1234), true);



  assert.equal(managerPollA6dd30CbNeeded(0, Number.NaN, 0x1234), true);



  assert.equal(managerPollA6dd30CbNeeded(Number.NaN, Number.NaN, 0), false);



  // Gate reuses the walk's float-change predicate exactly.



  for (const [a, b] of [[0, 0], [1, 0], [-1, 1], [Number.NaN, 0], [0, 0]]) {



    assert.equal(



      managerPollA6dd30CbNeeded(a, b, 1),



      managerPollA6de60FloatChanged(a, b),



      `cb â‰¡ changed ${a},${b}`,



    );



  }







  // POV lanes feed those stores; west is (-1, 0) after the v16 correction.



  assert.equal(managerPollA6de60PovAxis0(A6DE60_POV_WEST), -1);



  assert.equal(managerPollA6de60PovAxis1(A6DE60_POV_WEST), 0);



  // Cardinal directions are unit vectors; diagonals are (Â±1, Â±1).



  for (const [pov, x, y] of [



    [0, 0, -1],



    [A6DE60_POV_EAST, 1, 0],



    [A6DE60_POV_SOUTH, 0, 1],



    [A6DE60_POV_WEST, -1, 0],



  ]) {



    assert.equal(managerPollA6de60PovAxis0(pov), x, `pov x ${pov}`);



    assert.equal(managerPollA6de60PovAxis1(pov), y, `pov y ${pov}`);



    assert.equal(Math.abs(x) + Math.abs(y), 1, `cardinal ${pov}`);



  }



});







test("JS oracle: a6dab0 scan gates + 4-slot loop (ABI v17)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 17);







  // Outer gates. The enable byte is the same global the a6de60 entry reads.



  assert.equal(A6DAB0_ENABLE_VA, 0x00c7e300);



  assert.equal(managerPollA6dab0ScanEnabled(0), false);



  assert.equal(managerPollA6dab0ScanEnabled(1), true);



  assert.equal(managerPollA6dab0ScanEnabled(0xff), true);



  // Byte-wide test: only the low byte of the loaded value participates.



  assert.equal(managerPollA6dab0ScanEnabled(0x100), false);



  for (const b of [0, 1, 2, 0x7f, 0x80, 0xff]) {



    assert.equal(



      managerPollA6dab0ScanEnabled(b),



      managerPollA6de60BodyNeeded(b, 0),



      `scan gate agrees with a6de60 body gate for ${b}`,



    );



  }







  assert.equal(managerPollA6dab0PumpNeeded(0), false);



  assert.equal(managerPollA6dab0PumpNeeded(0x00010000), true);



  assert.equal(managerPollA6dab0EnumNeeded(0), false);



  assert.equal(managerPollA6dab0EnumNeeded(1), true);



  assert.equal(managerPollA6dab0EnumFlagAfter(), 0);



  assert.equal(managerPollA6dab0SlotScanNeeded(0), false);



  assert.equal(managerPollA6dab0SlotScanNeeded(3), true);







  // COM EnumDevices refresh constants.



  assert.equal(A6DAB0_ENUM_VTBL, 0x10);



  assert.equal(A6DAB0_ENUM_DEVCLASS, 4);



  assert.equal(A6DAB0_ENUM_CALLBACK_VA, 0x00a6d560);



  assert.equal(managerPollA6dab0EnumVtblSlot(), 0x10);



  assert.equal(managerPollA6dab0EnumCallbackVa(), 0x00a6d560);







  // 4-slot loop bound and table addressing.



  assert.equal(A6DAB0_SLOT_COUNT, 4);



  assert.equal(managerPollA6dab0SlotCount(), 4);



  assert.equal(managerPollA6dab0SlotContinue(0), true);



  assert.equal(managerPollA6dab0SlotContinue(2), true);



  assert.equal(managerPollA6dab0SlotContinue(3), false);



  assert.equal(managerPollA6dab0SlotContinue(4), false);



  assert.equal(managerPollA6dab0SlotContinue(0xffffffff), true); // inc wraps



  assert.equal(A6DAB0_SLOT_TABLE_VA, 0x00c7e2e0);



  assert.equal(A6DAB0_NAME_TABLE_VA, 0x00b468b0);



  for (let slot = 0; slot < A6DAB0_SLOT_COUNT; slot += 1) {



    assert.equal(



      managerPollA6dab0SlotTableAddr(slot),



      0x00c7e2e0 + slot * 4,



      `slot table ${slot}`,



    );



    assert.equal(



      managerPollA6dab0NameTableAddr(slot),



      0x00b468b0 + slot * 4,



      `name table ${slot}`,



    );



  }



  assert.equal(managerPollA6dab0SlotClearValue(), 0);







  // Per-slot decision matrix (status x record presence).



  assert.equal(managerPollA6dab0QueryOk(0), true);



  assert.equal(managerPollA6dab0QueryOk(1), false);



  assert.equal(managerPollA6dab0QueryOk(-1), false);



  assert.equal(managerPollA6dab0RecordPresent(0), false);



  assert.equal(managerPollA6dab0RecordPresent(0x1000), true);



  const matrix = [



    // [status, record, connect, disconnect]



    [0, 0, true, false],



    [0, 0x1000, false, false],



    [1, 0, false, false],



    [1, 0x1000, false, true],



    [-1, 0x1000, false, true],



  ];



  for (const [status, rec, wantC, wantD] of matrix) {



    assert.equal(



      managerPollA6dab0ConnectNeeded(status, rec),



      wantC,



      `connect ${status},${rec}`,



    );



    assert.equal(



      managerPollA6dab0DisconnectNeeded(status, rec),



      wantD,



      `disconnect ${status},${rec}`,



    );



    // The two decisions are mutually exclusive at every point.



    assert.ok(



      !(



        managerPollA6dab0ConnectNeeded(status, rec) &&



        managerPollA6dab0DisconnectNeeded(status, rec)



      ),



      `exclusive ${status},${rec}`,



    );



  }



  // Query gate agrees with the a6de60 walk's status predicate.



  for (const s of [0, 1, -1, 0x7fffffff]) {



    assert.equal(managerPollA6dab0QueryOk(s), managerPollA6de60QueryOk(s));



  }







  // Capability branch.



  assert.equal(A6DAB0_CAPS_MODE_MATCH, 2);



  assert.equal(managerPollA6dab0CapsModeOk(2), true);



  assert.equal(managerPollA6dab0CapsModeOk(0), false);



  assert.equal(managerPollA6dab0CapsModeOk(3), false);



  assert.equal(managerPollA6dab0CapsCallNeeded(2, 0x1000), true);



  assert.equal(managerPollA6dab0CapsCallNeeded(2, 0), false);



  assert.equal(managerPollA6dab0CapsCallNeeded(1, 0x1000), false);



  assert.equal(managerPollA6dab0CapsOk(0), true);



  assert.equal(managerPollA6dab0CapsOk(5), false);



  assert.equal(A6DAB0_CAPS_OFS_VID, 0x14);



  assert.equal(A6DAB0_CAPS_OFS_PID, 0x16);



  assert.equal(A6DAB0_CAPS_OFS_PID - A6DAB0_CAPS_OFS_VID, 2); // adjacent u16s







  // Log message VAs are recorded evidence, all distinct.



  assert.equal(managerPollA6dab0MsgVaEnumFail(), A6DAB0_MSG_VA_ENUM_FAIL);



  assert.equal(managerPollA6dab0MsgVaConnect(), A6DAB0_MSG_VA_CONNECT);



  assert.equal(managerPollA6dab0MsgVaCapsFail(), A6DAB0_MSG_VA_CAPS_FAIL);



  assert.equal(



    new Set([



      A6DAB0_MSG_VA_ENUM_FAIL,



      A6DAB0_MSG_VA_CONNECT,



      A6DAB0_MSG_VA_CAPS_FAIL,



    ]).size,



    3,



  );



});







test("JS oracle: a6dab0 record init + vector push (ABI v17)", () => {



  // Allocation sizes and element counts.



  assert.equal(A6DAB0_RECORD_BYTES, 0x24);



  assert.equal(A6DAB0_STATE_BYTES, 0x30);



  assert.equal(A6DAB0_AXIS_COUNT, 6);



  assert.equal(A6DAB0_BUTTON_COUNT, 0xf);



  assert.equal(managerPollA6dab0StateEnableValue(), A6DAB0_STATE_ENABLE_VALUE);



  assert.equal(A6DAB0_STATE_ENABLE_VALUE, 1);







  // Record layout: every field is inside the allocated record.



  const recIds = [



    A6DAB0_REC_ID, A6DAB0_REC_NAME, A6DAB0_REC_ENABLED, A6DAB0_REC_VID,



    A6DAB0_REC_PID, A6DAB0_REC_AXIS_COUNT, A6DAB0_REC_BUTTON_COUNT,



    A6DAB0_REC_AXIS_ARRAY, A6DAB0_REC_BUTTON_ARRAY, A6DAB0_REC_STATE,



  ];



  assert.equal(recIds.length, A6DAB0_REC_FIELD_COUNT);



  const recOffsets = recIds.map((id) => managerPollA6dab0RecordFieldOfs(id));



  assert.deepEqual(recOffsets, [0x00, 0x04, 0x08, 0x0a, 0x0c, 0x10, 0x14, 0x18, 0x1c, 0x20]);



  let prev = -1;



  for (const ofs of recOffsets) {



    assert.ok(ofs > prev, `record offsets increase (${ofs})`);



    assert.ok(ofs < A6DAB0_RECORD_BYTES, `record offset fits (${ofs})`);



    prev = ofs;



  }



  // The last dword field ends exactly at the record size.



  assert.equal(managerPollA6dab0RecordFieldOfs(A6DAB0_REC_STATE) + 4, A6DAB0_RECORD_BYTES);



  assert.equal(managerPollA6dab0RecordFieldOfs(A6DAB0_REC_FIELD_COUNT), 0xffffffff);



  assert.equal(managerPollA6dab0RecordFieldOfs(-1), 0xffffffff);







  // State layout.



  assert.equal(A6DAB0_ST_FIELD_COUNT, 2);



  assert.equal(managerPollA6dab0StateFieldOfs(A6DAB0_ST_ENABLE), 0x00);



  assert.equal(managerPollA6dab0StateFieldOfs(A6DAB0_ST_SLOT), 0x2c);



  assert.ok(managerPollA6dab0StateFieldOfs(A6DAB0_ST_SLOT) + 4 <= A6DAB0_STATE_BYTES);



  assert.equal(managerPollA6dab0StateFieldOfs(A6DAB0_ST_FIELD_COUNT), 0xffffffff);







  // Monotonic device id: the record keeps the old value, the global advances.



  assert.equal(managerPollA6dab0NextDeviceId(0), 1);



  assert.equal(managerPollA6dab0NextDeviceId(41), 42);



  assert.equal(managerPollA6dab0NextDeviceId(0xffffffff), 0); // wrap



  // Two consecutive connects get distinct ids.



  let counter = 7;



  const first = counter;



  counter = managerPollA6dab0NextDeviceId(counter);



  const second = counter;



  counter = managerPollA6dab0NextDeviceId(counter);



  assert.notEqual(first, second);



  assert.equal(counter, 9);







  // vid/pid truncate to 16 bits at both the load and the store.



  assert.equal(managerPollA6dab0IdWord(0), 0);



  assert.equal(managerPollA6dab0IdWord(0x045e), 0x045e);



  assert.equal(managerPollA6dab0IdWord(0x1234ffff), 0xffff);



  assert.equal(managerPollA6dab0IdWord(0xffff0000), 0);







  // calloc argument pairs (cdecl num, size â€” calloc itself stays host).



  const axis = managerPollA6dab0AxisCallocArgs(A6DAB0_AXIS_COUNT);



  assert.deepEqual(axis, { num: A6DAB0_AXIS_ELEM_BYTES, size: A6DAB0_AXIS_COUNT });



  assert.equal(axis.num * axis.size, 24); // 6 floats



  const button = managerPollA6dab0ButtonCallocArgs(A6DAB0_BUTTON_COUNT);



  assert.deepEqual(button, {



    num: A6DAB0_BUTTON_ELEM_BYTES,



    size: A6DAB0_BUTTON_COUNT,



  });



  assert.equal(button.num * button.size, 15); // 15 bytes



  // The counts come from the record fields written just above the callocs.



  assert.equal(managerPollA6dab0AxisCallocArgs(0).size, 0);



  assert.equal(managerPollA6dab0ButtonCallocArgs(0xffffffff).size, 0xffffffff);







  // Vector push / grow.



  assert.equal(managerPollA6dab0PushNeedsGrow(0x1000, 0x1000), true);



  assert.equal(managerPollA6dab0PushNeedsGrow(0x1000, 0x1004), false);



  assert.equal(managerPollA6dab0PushNeedsGrow(0, 0), true);



  assert.equal(managerPollA6dab0EndAfterPush(0x1000), 0x1004);



  assert.equal(managerPollA6dab0EndAfterPush(0xfffffffc), 0); // wrap



  // A push that does not grow advances the end by exactly one slot.



  assert.equal(



    managerPollA6dab0EndAfterPush(0x2000) - 0x2000,



    managerPollA6da10SlotByteOffset(1),



  );



  assert.equal(managerPollA6dab0ConnectCbNeeded(0), false);



  assert.equal(managerPollA6dab0ConnectCbNeeded(0x400000), true);



});







test("JS oracle: a6dab0 device-id vector search (ABI v17)", () => {



  assert.equal(A6DAB0_SEARCH_NOT_FOUND, 0xffffffff);







  // Entry gate is a plain non-zero test on the SIGNED SAR32 count.



  assert.equal(managerPollA6dab0SearchLoopNeeded(0), false);



  assert.equal(managerPollA6dab0SearchLoopNeeded(1), true);



  assert.equal(managerPollA6dab0SearchLoopNeeded(-1), true); // negative enters



  // The count itself is the same SAR32 the walk entry uses.



  assert.equal(managerPollA6de60VectorCount(0x1010, 0x1000), 4);



  assert.equal(



    managerPollA6dab0SearchLoopNeeded(



      managerPollA6de60VectorCount(0x1000, 0x1000),



    ),



    false,



  );







  // Continue test is UNSIGNED against the signed count.



  assert.equal(managerPollA6dab0SearchIndexContinue(0, 3), true);



  assert.equal(managerPollA6dab0SearchIndexContinue(1, 3), true);



  assert.equal(managerPollA6dab0SearchIndexContinue(2, 3), false);



  assert.equal(managerPollA6dab0SearchIndexContinue(0, -1), true); // 0xffffffff



  assert.equal(managerPollA6dab0SearchIndexContinue(0xfffffffd, -1), true);



  assert.equal(managerPollA6dab0SearchIndexContinue(0xfffffffe, -1), false);



  // Same shape as the walk's per-device index continue.



  for (const [i, n] of [[0, 1], [0, 4], [3, 4], [7, 4]]) {



    assert.equal(



      managerPollA6dab0SearchIndexContinue(i, n),



      managerPollA6de60IndexContinue(i, n),



      `continue ${i},${n}`,



    );



  }







  // First-match linear search; the index feeds a6da10 in ECX.



  assert.equal(managerPollA6dab0VectorFind([], 0, 5), 0xffffffff);



  assert.equal(managerPollA6dab0VectorFind(null, 0, 5), 0xffffffff);



  assert.equal(managerPollA6dab0VectorFind([5], 1, 5), 0);



  assert.equal(managerPollA6dab0VectorFind([1, 2, 3], 3, 3), 2);



  assert.equal(managerPollA6dab0VectorFind([1, 2, 3], 3, 4), 0xffffffff);



  // First match wins even when the id repeats.



  assert.equal(managerPollA6dab0VectorFind([7, 7, 7], 3, 7), 0);



  // Only the first `count` entries are considered.



  assert.equal(managerPollA6dab0VectorFind([1, 2, 9], 2, 9), 0xffffffff);



  // Full 32-bit ids compare exactly.



  assert.equal(managerPollA6dab0VectorFind([0xffffffff, 0], 2, 0xffffffff), 0);



  assert.equal(managerPollA6dab0VectorFind([0, 0xffffffff], 2, 0), 0);







  // A found index is always a legal a6da10 argument (< count).



  const entries = [11, 22, 33, 44];



  for (const target of entries) {



    const idx = managerPollA6dab0VectorFind(entries, entries.length, target);



    assert.notEqual(idx, A6DAB0_SEARCH_NOT_FOUND);



    assert.ok(idx < entries.length);



    // The removal helpers accept that index directly.



    assert.equal(



      managerPollA6da10SlotAddr(0x1000, idx),



      0x1000 + idx * 4,



      `slot for found index ${idx}`,



    );



  }



});







test("JS oracle: a220c0 hot-plug poll thread (ABI v18)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 18);







  // The flag word lives at obj+4 of the same static object a1fc00 uses.



  assert.equal(A220C0_OBJ_VA, 0x00c57b18);



  assert.equal(A220C0_FLAGS_VA, 0x00c57b1c);



  assert.equal(A220C0_FLAGS_VA - A220C0_OBJ_VA, 4);



  assert.equal(A220C0_RUN_BIT, 2);







  // Byte-wide run test.



  assert.equal(managerPollA220c0ThreadRun(0), false);



  assert.equal(managerPollA220c0ThreadRun(1), false);



  assert.equal(managerPollA220c0ThreadRun(2), true);



  assert.equal(managerPollA220c0ThreadRun(3), true);



  assert.equal(managerPollA220c0ThreadRun(0x102), true);



  assert.equal(managerPollA220c0ThreadRun(0x100), false);



  assert.equal(managerPollA220c0ThreadRun(0xfffffffd), false);



  assert.equal(managerPollA220c0ThreadRun(0xffffffff), true);



  // The back-edge test is the same predicate.



  for (const f of [0, 1, 2, 3, 0x100, 0x102, 0xffffffff]) {



    assert.equal(managerPollA220c0ThreadContinue(f), managerPollA220c0ThreadRun(f));



    assert.equal(managerPollA220c0SpawnNeeded(f), !managerPollA220c0ThreadRun(f));



  }







  // Bit set / clear round trip.



  assert.equal(managerPollA220c0FlagAfterStart(0), 2);



  assert.equal(managerPollA220c0FlagAfterStart(1), 3);



  assert.equal(managerPollA220c0FlagAfterStart(2), 2); // idempotent



  assert.equal(managerPollA220c0FlagAfterStop(3), 1);



  assert.equal(managerPollA220c0FlagAfterStop(1), 1); // idempotent



  assert.equal(managerPollA220c0FlagAfterStop(0xffffffff), 0xfffffffd);



  for (const f of [0, 1, 0x55, 0xff00, 0xffffffff]) {



    // Starting then stopping restores every other bit.



    assert.equal(



      managerPollA220c0FlagAfterStop(managerPollA220c0FlagAfterStart(f)),



      managerPollA220c0FlagAfterStop(f),



      `start/stop preserves other bits ${f}`,



    );



    // After start the thread runs; after stop it does not.



    assert.equal(managerPollA220c0ThreadRun(managerPollA220c0FlagAfterStart(f)), true);



    assert.equal(managerPollA220c0ThreadRun(managerPollA220c0FlagAfterStop(f)), false);



  }







  // Loop shape: do-while whose entry test is the same predicate.



  assert.equal(managerPollA220c0ScanIterations([], 0), 0);



  assert.equal(managerPollA220c0ScanIterations(null, 0), 0);



  assert.equal(managerPollA220c0ScanIterations([0], 1), 0); // never scans



  assert.equal(managerPollA220c0ScanIterations([2], 1), 1);



  assert.equal(managerPollA220c0ScanIterations([2, 2, 2, 0, 2], 5), 3);



  assert.equal(managerPollA220c0ScanIterations([2, 2, 2, 2], 4), 4);



  assert.equal(managerPollA220c0ScanIterations([2, 0x100], 2), 1); // low-byte







  // Spawn constants.



  assert.equal(managerPollA220c0SleepMs(), A220C0_SLEEP_MS);



  assert.equal(A220C0_SLEEP_MS, 0x64);



  assert.equal(managerPollA220c0ThreadProcVa(), A220C0_THREAD_PROC_VA);



  assert.equal(A220C0_THREAD_PROC_VA, 0x00a220c0);



  assert.equal(managerPollA220c0SpawnVtblSlot(), 8);



  assert.equal(A220C0_SPAWN_VTBL, 8);



  assert.equal(A220C0_SPAWN_PRIORITY, 2);



  assert.equal(A220C0_SPAWN_STACK, 0x1000);



  // The thread proc VA is its own function start, not a mid-body site.



  assert.equal(managerPollA220c0ThreadProcVa(), A220C0_THREAD_PROC_VA);



});







test("JS oracle: a6cf80 one-time init probe ladder + hook table (ABI v18)", () => {



  // The init guard reads the same byte the scan tests, with inverted use.



  assert.equal(managerPollA6cf80InitSkip(0), false);



  assert.equal(managerPollA6cf80InitSkip(1), true);



  for (const b of [0, 1, 2, 0x7f, 0xff]) {



    assert.equal(



      managerPollA6cf80InitSkip(b),



      managerPollA6dab0ScanEnabled(b),



      `init guard is the scan gate predicate ${b}`,



    );



  }







  // Probe ladder: four names, first success wins.



  assert.equal(A6CF80_PROBE_COUNT, 4);



  assert.equal(managerPollA6cf80ProbeCount(), 4);



  const probeVas = [0, 1, 2, 3].map((i) => managerPollA6cf80ProbeNameVa(i));



  assert.deepEqual(probeVas, [0x00ba1750, 0x00ba1760, 0x00ba1974, 0x00ba18f4]);



  assert.equal(new Set(probeVas).size, 4);



  assert.equal(managerPollA6cf80ProbeNameVa(4), 0xffffffff);



  assert.equal(managerPollA6cf80ProbeNameVa(-1), 0xffffffff);







  assert.equal(managerPollA6cf80ModeForProbe(0), A6CF80_MODE_MODERN);



  assert.equal(managerPollA6cf80ModeForProbe(1), A6CF80_MODE_MODERN);



  assert.equal(managerPollA6cf80ModeForProbe(2), A6CF80_MODE_LEGACY);



  assert.equal(managerPollA6cf80ModeForProbe(3), A6CF80_MODE_LEGACY);



  assert.equal(managerPollA6cf80ModeForProbe(4), A6CF80_MODE_NONE);







  assert.equal(managerPollA6cf80SelectProbe([0, 0, 0, 0], 4), A6CF80_PROBE_NOT_FOUND);



  assert.equal(managerPollA6cf80SelectProbe([1, 1, 1, 1], 4), 0);



  assert.equal(managerPollA6cf80SelectProbe([0, 1, 1, 1], 4), 1);



  assert.equal(managerPollA6cf80SelectProbe([0, 0, 1, 0], 4), 2);



  assert.equal(managerPollA6cf80SelectProbe([0, 0, 0, 1], 4), 3);



  assert.equal(managerPollA6cf80SelectProbe(null, 0), A6CF80_PROBE_NOT_FOUND);







  // Full ladder outcomes.



  assert.equal(managerPollA6cf80ModeAfterProbes([1, 0, 0, 0], 4), A6CF80_MODE_MODERN);



  assert.equal(managerPollA6cf80ModeAfterProbes([0, 1, 0, 0], 4), A6CF80_MODE_MODERN);



  assert.equal(managerPollA6cf80ModeAfterProbes([0, 0, 1, 0], 4), A6CF80_MODE_LEGACY);



  assert.equal(managerPollA6cf80ModeAfterProbes([0, 0, 0, 1], 4), A6CF80_MODE_LEGACY);



  assert.equal(managerPollA6cf80ModeAfterProbes([0, 0, 0, 0], 4), A6CF80_MODE_NONE);



  // A later success never overrides an earlier one.



  assert.equal(managerPollA6cf80ModeAfterProbes([0, 0, 1, 1], 4), A6CF80_MODE_LEGACY);



  assert.equal(managerPollA6cf80ModeAfterProbes([1, 0, 1, 0], 4), A6CF80_MODE_MODERN);







  // Mode -> log level / message, reusing the a112c0 level enum.



  assert.equal(managerPollA6cf80LogLevelForMode(A6CF80_MODE_MODERN), A112C0_LEVEL_INFO);



  assert.equal(managerPollA6cf80LogLevelForMode(A6CF80_MODE_LEGACY), A112C0_LEVEL_WARN);



  assert.equal(managerPollA6cf80LogLevelForMode(A6CF80_MODE_NONE), A112C0_LEVEL_ERROR);



  const msgVas = [A6CF80_MODE_MODERN, A6CF80_MODE_LEGACY, A6CF80_MODE_NONE].map(



    (m) => managerPollA6cf80LogMsgVaForMode(m),



  );



  assert.deepEqual(msgVas, [0x00ba1960, 0x00ba1908, 0x00ba19b0]);



  assert.equal(new Set(msgVas).size, 3);







  // Post-ladder stores feed the v17 gates.



  assert.equal(managerPollA6cf80ScanFlagAfter(A6CF80_MODE_MODERN), 1);



  assert.equal(managerPollA6cf80ScanFlagAfter(A6CF80_MODE_LEGACY), 1);



  assert.equal(managerPollA6cf80ScanFlagAfter(A6CF80_MODE_NONE), 0);



  for (const mode of [0, 1, 2]) {



    assert.equal(



      managerPollA6dab0SlotScanNeeded(managerPollA6cf80ScanFlagAfter(mode)),



      mode !== A6CF80_MODE_NONE,



      `scan flag arms the v17 loop gate (mode ${mode})`,



    );



    // The caps predicate is shared with the v17 per-slot branch.



    assert.equal(



      managerPollA6cf80CapsHookProbeNeeded(mode),



      managerPollA6dab0CapsModeOk(mode),



      `caps predicate agrees (mode ${mode})`,



    );



  }



  // Init arms both gates the scan reads immediately before the first scan.



  assert.equal(managerPollA6cf80EnableAfterInit(), 1);



  assert.equal(managerPollA6cf80EnumFlagAfterInit(), 1);



  assert.equal(managerPollA6dab0ScanEnabled(managerPollA6cf80EnableAfterInit()), true);



  assert.equal(managerPollA6dab0EnumNeeded(managerPollA6cf80EnumFlagAfterInit()), true);







  // GetProcAddress table: distinct targets, ordinal xor name per slot.



  assert.equal(A6CF80_HOOK_SLOT_COUNT, 5);



  const slots = [



    A6CF80_HOOK_ORD_PRIMARY, A6CF80_HOOK_GET_STATE, A6CF80_HOOK_SET_STATE,



    A6CF80_HOOK_GET_CAPS, A6CF80_HOOK_CAPS_EX,



  ];



  const targets = slots.map((s) => managerPollA6cf80HookSlotTargetVa(s));



  assert.deepEqual(targets, [0x00c7e29c, 0x00c7e2dc, 0x00c7e2f0, 0x00c7e2f4, 0x00c7e2f8]);



  assert.equal(new Set(targets).size, 5);



  for (const s of slots) {



    const name = managerPollA6cf80HookSlotNameVa(s);



    const ord = managerPollA6cf80HookSlotOrdinal(s);



    // Exactly one of the two lookup forms is defined per slot.



    assert.equal(



      (name === 0xffffffff ? 0 : 1) + (ord === 0xffffffff ? 0 : 1),



      1,



      `slot ${s} is looked up by exactly one of name/ordinal`,



    );



  }



  assert.equal(managerPollA6cf80HookSlotOrdinal(A6CF80_HOOK_ORD_PRIMARY), A6CF80_PROC_ORD_PRIMARY);



  assert.equal(managerPollA6cf80HookSlotOrdinal(A6CF80_HOOK_CAPS_EX), A6CF80_PROC_ORD_CAPS_EX);



  assert.equal(A6CF80_PROC_ORD_PRIMARY, 0x64);



  assert.equal(A6CF80_PROC_ORD_CAPS_EX, 0x6c);



  assert.equal(managerPollA6cf80HookSlotNameVa(A6CF80_HOOK_GET_STATE), 0x00ba1a08);



  assert.equal(managerPollA6cf80HookSlotNameVa(A6CF80_HOOK_SET_STATE), 0x00ba1984);



  assert.equal(managerPollA6cf80HookSlotNameVa(A6CF80_HOOK_GET_CAPS), 0x00ba1994);



  assert.equal(managerPollA6cf80HookSlotTargetVa(A6CF80_HOOK_SLOT_COUNT), 0xffffffff);



  assert.equal(managerPollA6cf80HookSlotTargetVa(-1), 0xffffffff);



  // The init resolves exactly the globals earlier ABIs read as hooks.



  assert.equal(managerPollA6cf80HookSlotTargetVa(A6CF80_HOOK_GET_CAPS), 0x00c7e2f4);



  assert.equal(managerPollA6cf80HookSlotTargetVa(A6CF80_HOOK_CAPS_EX), 0x00c7e2f8);







  // CoInitializeEx retry.



  assert.equal(A6CF80_COINIT_CHANGED_MODE, 0x80010106);



  assert.equal(managerPollA6cf80CoinitRetryNeeded(0x80010106), true);



  assert.equal(managerPollA6cf80CoinitRetryNeeded(0), false);



  assert.equal(managerPollA6cf80CoinitRetryNeeded(0x80010107), false);



  assert.equal(managerPollA6cf80CoinitFlagsFirst(), 2);



  assert.equal(managerPollA6cf80CoinitFlagsRetry(), 0);



  assert.notEqual(A6CF80_COINIT_FLAGS_FIRST, A6CF80_COINIT_FLAGS_RETRY);







  // Device-notification filter block: the cbSize fits inside the cleared area.



  assert.equal(managerPollA6cf80NotifyFilterBytes(), 0x3c);



  assert.equal(managerPollA6cf80NotifyFilterCbsize(), 0x30);



  assert.ok(A6CF80_NOTIFY_FILTER_CBSIZE < A6CF80_NOTIFY_FILTER_BYTES);



  assert.equal(A6CF80_WNDCLASS_NAME_VA, 0x00ba1710);



  assert.equal(A6CF80_WNDPROC_VA, 0x00a6cef0);



  assert.equal(A6CF80_HWND_MESSAGE, -3);



});







test("JS oracle: Manager shell body after the poll prefix (ABI v19)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 19);







  // Receivers for the two host calls right after the poll prefix.



  assert.equal(managerShellReceiverOfs(MANAGER_SHELL_RECV_SELF), 0);



  assert.equal(managerShellReceiverOfs(MANAGER_SHELL_RECV_9C34F0), 0x4d070);



  assert.equal(managerShellReceiverOfs(MANAGER_SHELL_RECV_APPROACH), 0x4a950);



  assert.equal(managerShellReceiverOfs(MANAGER_SHELL_RECV_90B150), 0x4b3d8);



  assert.equal(managerShellReceiverOfs(MANAGER_SHELL_RECV_COUNT), 0xffffffff);



  assert.equal(managerShellReceiverOfs(-1), 0xffffffff);



  assert.equal(managerShellReceiverAddr(0x1000, MANAGER_SHELL_RECV_9C34F0), 0x1000 + 0x4d070);



  assert.equal(managerShellReceiverAddr(0x1000, MANAGER_SHELL_RECV_SELF), 0x1000);



  assert.equal(managerShellReceiverAddr(0x1000, 99), 0xffffffff);



  assert.equal(managerShellReceiverAddr(0xfffff000, MANAGER_SHELL_RECV_9C34F0), 0x4c070); // wrap



  // Offsets are distinct and match the declared field constants.



  const recvOffsets = [



    MANAGER_SHELL_RECV_SELF, MANAGER_SHELL_RECV_9C34F0,



    MANAGER_SHELL_RECV_APPROACH, MANAGER_SHELL_RECV_90B150,



  ].map((r) => managerShellReceiverOfs(r));



  assert.equal(new Set(recvOffsets).size, 4);



  assert.equal(MANAGER_SHELL_OFF_SUB_9C34F0, 0x4d070);



  assert.equal(MANAGER_SHELL_OFF_APPROACH, 0x4a950);



  assert.equal(MANAGER_SHELL_OFF_SUB_90B150, 0x4b3d8);



  assert.equal(MANAGER_SHELL_OFF_STATE, 8);







  // Approach block geometry.



  assert.equal(MANAGER_APPROACH_SLOT_COUNT, 2);



  assert.equal(managerApproachSlotCount(), 2);



  assert.equal(MANAGER_APPROACH_SLOT_STRIDE, 0x130);



  assert.equal(managerApproachSlotStride(), 0x130);



  assert.equal(MANAGER_APPROACH_FIRST_OFS, 0x114);



  assert.equal(managerApproachSlotAddr(0, 0), 0x114);



  assert.equal(managerApproachSlotAddr(0, 1), 0x114 + 0x130);



  assert.equal(managerApproachSlotAddr(0x4a950, 0), 0x4a950 + 0x114);



  assert.equal(managerApproachSlotAddr(0x4a950, 1), 0x4a950 + 0x114 + 0x130);



  // Consecutive slots are exactly one stride apart.



  assert.equal(



    managerApproachSlotAddr(0x1000, 1) - managerApproachSlotAddr(0x1000, 0),



    MANAGER_APPROACH_SLOT_STRIDE,



  );



  // Field offsets inside a slot.



  assert.equal(MANAGER_APPROACH_OFF_CURRENT, 0);



  assert.equal(MANAGER_APPROACH_OFF_TARGET, 4);



  assert.equal(MANAGER_APPROACH_OFF_MODE, 0x10);







  assert.equal(managerApproachSlotContinue(0), true);



  assert.equal(managerApproachSlotContinue(1), false);



  assert.equal(managerApproachSlotContinue(2), false);



  assert.equal(managerApproachSlotContinue(0xffffffff), true); // inc wraps







  // ABI v19 correction (a): the host gate constant is 0x20, not 1.



  assert.equal(MANAGER_APPROACH_MODE_SKIP_HOST, 0x20);



  assert.equal(managerApproachHostCallNeeded(0x20), false);



  assert.equal(managerApproachHostCallNeeded(1), true); // the old constant



  assert.equal(managerApproachHostCallNeeded(0), true);



  assert.equal(managerApproachHostCallNeeded(0x21), true);



  assert.equal(managerApproachHostArgSlot(0), 0);



  assert.equal(managerApproachHostArgSlot(1), 1);







  // ABI v19 correction (b): the branch and both selects take the NaN arm.



  assert.equal(managerApproachUsesAddPath(1, 3), true);



  assert.equal(managerApproachUsesAddPath(3, 3), true); // equal -> jbe taken



  assert.equal(managerApproachUsesAddPath(5, 3), false);



  assert.equal(managerApproachUsesAddPath(Number.NaN, 3), true);



  assert.equal(managerApproachUsesAddPath(3, Number.NaN), true);



  assert.equal(managerApproachUsesAddPath(Number.NaN, Number.NaN), true);







  // Ordered behaviour is unchanged from the ABI v2 description.



  assert.equal(managerFloatApproach(1, 10, 6), 7);



  assert.equal(managerFloatApproach(1, 3, 6), 3); // clamps up to target



  assert.equal(managerFloatApproach(5, 3, 6), 3); // clamps down to target



  assert.equal(managerFloatApproach(20, 3, 6), 14);



  assert.equal(managerFloatApproach(3, 3, 6), 3); // at target, stays



  assert.equal(managerFloatApproach(0, 0, 0), 0);



  // Zero step never moves an ordered value.



  for (const [c, t] of [[1, 5], [5, 1], [2, 2]]) {



    assert.equal(managerFloatApproach(c, t, 0), c, `zero step ${c},${t}`);



  }



  // NaN keeps the stepped value rather than clamping to the target.



  assert.ok(Number.isNaN(managerFloatApproach(Number.NaN, 3, 6)));



  assert.equal(managerFloatApproach(5, Number.NaN, 6), 11);



  assert.ok(Number.isNaN(managerFloatApproach(5, 3, Number.NaN)));



  // Infinities are saturating: the step never moves them, and the keep test



  // succeeds on both arms, so neither clamps to the target.



  assert.equal(managerFloatApproach(-Infinity, 3, 6), -Infinity);



  assert.equal(managerFloatApproach(Infinity, 3, 6), Infinity);







  // Post-loop store and probe gate.



  assert.equal(managerShellFlagBAfterLoop(), 0);



  assert.equal(managerShellProbeNeeded(0, 0), true);



  assert.equal(managerShellProbeNeeded(0, -1), true); // signed jg skips only >0



  assert.equal(managerShellProbeNeeded(0, 1), false);



  assert.equal(managerShellProbeNeeded(1, 0), false);



  assert.equal(managerShellProbeNeeded(0, -0x80000000), true);



  assert.equal(managerShellProbeNeeded(0, 0x7fffffff), false);



  assert.equal(MANAGER_SHELL_OFF_PROBE_A, 0x4c610);



  assert.equal(MANAGER_SHELL_OFF_PROBE_B, 0x4c658);







  // Game branch gates.



  assert.equal(managerShellSub90b150Blocks(0), false);



  assert.equal(managerShellSub90b150Blocks(1), true);



  assert.equal(managerShellSub90b150Blocks(0x100), false); // low byte only



  assert.equal(managerShellStateUsesGame(2), true);



  assert.equal(managerShellStateUsesGame(5), true);



  assert.equal(managerShellStateUsesGame(1), false);



  assert.equal(managerShellStateUsesGame(3), false);



  assert.equal(managerShellStateUsesGame(4), false);



  assert.equal(managerShellStateUsesGame(0), false);



  assert.equal(managerShellGamePresent(0), false);



  assert.equal(managerShellGamePresent(0x00c71678), true);







  // Flag pair, second site: matches the ABI v2 early-skip silent-return rule.



  assert.equal(managerShellSilentReturn(0, 0), false);



  assert.equal(managerShellSilentReturn(0, 1), false);



  assert.equal(managerShellSilentReturn(1, 0), true);



  assert.equal(managerShellSilentReturn(1, 1), false);



  for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1], [0xff, 0], [1, 0xff]]) {



    assert.equal(



      managerShellSilentReturn(a, b),



      managerUpdateEarlySkip(1, 0, a, b) === MANAGER_EARLY_RETURN_SILENT,



      `silent return agrees with the v2 early skip ${a},${b}`,



    );



  }







  // State dispatch.



  assert.equal(MANAGER_SHELL_STATE_MIN, 1);



  assert.equal(MANAGER_SHELL_STATE_MAX, 5);



  assert.equal(managerShellStateTableVa(), 0x0095559c);



  assert.equal(managerShellStateDefaultVa(), 0x009553ef);



  assert.equal(MANAGER_SHELL_STATE_TABLE_VA, 0x0095559c);



  assert.equal(MANAGER_SHELL_STATE_DEFAULT_VA, 0x009553ef);



  assert.equal(managerShellStateIndex(1), 0);



  assert.equal(managerShellStateIndex(5), 4);



  assert.equal(managerShellStateIndex(0), 0xffffffff); // dec wraps



  // The bound test is unsigned, so state 0 falls out of the table.



  assert.equal(managerShellStateInTable(0), false);



  assert.equal(managerShellStateInTable(1), true);



  assert.equal(managerShellStateInTable(5), true);



  assert.equal(managerShellStateInTable(6), false);



  assert.equal(managerShellStateInTable(-1), false);



  const arms = [1, 2, 3, 4, 5].map((s) => managerShellStateTargetVa(s));



  assert.deepEqual(arms, [0x009553a6, 0x009551a3, 0x009553d7, 0x009553ef, 0x009553e4]);



  // Out-of-range states all land on the default arm.



  for (const s of [0, 6, 7, -1, 0x7fffffff]) {



    assert.equal(



      managerShellStateTargetVa(s),



      MANAGER_SHELL_STATE_DEFAULT_VA,



      `default arm for state ${s}`,



    );



  }



  // All five table entries are distinct addresses, but state 4's entry happens



  // to be the same address the out-of-range default branches to.



  assert.equal(new Set(arms).size, 5);



  assert.equal(managerShellStateTargetVa(4), MANAGER_SHELL_STATE_DEFAULT_VA);



  assert.equal(



    arms.filter((a) => a === MANAGER_SHELL_STATE_DEFAULT_VA).length,



    1,



    "only state 4 shares the default arm",



  );



  // The state-2 arm is the one that reaches the game branch.



  assert.equal(managerShellStateUsesGame(2), true);



  assert.notEqual(managerShellStateTargetVa(2), MANAGER_SHELL_STATE_DEFAULT_VA);



});







test("JS oracle: audit F8 â€” NaN timer survives the clamp (ABI v20)", () => {



  assert.equal(PROCESS_INPUT_PURE_ABI_VERSION, 52);







  // The zero-store is skipped on an unordered compare, so NaN is kept.



  assert.ok(Number.isNaN(managerPollA1f280TimerClampNonneg(Number.NaN)));



  // Ordered behaviour is unchanged.



  assert.equal(managerPollA1f280TimerClampNonneg(2), 2);



  assert.equal(managerPollA1f280TimerClampNonneg(0), 0);



  assert.equal(managerPollA1f280TimerClampNonneg(-1), 0);



  assert.equal(managerPollA1f280TimerClampNonneg(-0), 0);



  assert.equal(managerPollA1f280TimerClampNonneg(Infinity), Infinity);



  assert.equal(managerPollA1f280TimerClampNonneg(-Infinity), 0);







  // It models the same instruction range as the rumble vcall timer argument,



  // so the two must agree on every input â€” this is the invariant the old



  // "distinct because it zeros NaN" comment was violating.



  for (const t of [



    Number.NaN, 0, -0, 1, -1, 2, 1e-45, -1e-45, Infinity, -Infinity, 1e30,



  ]) {



    const a = managerPollA1f280TimerClampNonneg(t);



    const b = managerPollA1f280RumbleVcallTimer(t);



    assert.ok(



      Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b)),



      `clamp â‰¡ vcall timer for ${t}: ${a} vs ${b}`,



    );



  }



  // The selecting predicate is the shared "below or unordered" test: it is



  // true exactly for a positive or NaN timer, which are the inputs kept.



  for (const [t, wantActive] of [



    [Number.NaN, true], [-1, false], [0, false], [1, true], [Infinity, true],



    [-Infinity, false],



  ]) {



    assert.equal(



      managerPollA1f280RumbleIntensityActive(t),



      wantActive,



      `intensity_active(${t})`,



    );



    const kept = managerPollA1f280TimerClampNonneg(t);



    assert.equal(



      Number.isNaN(kept) || kept !== 0,



      wantActive,



      `clamp keeps iff active for ${t}`,



    );



  }



});







test("JS oracle: audit F10 â€” a6dd30 y-lane recapture (ABI v20)", () => {



  const cbBefore = 0x1000;



  const cbAfter = 0x2000;



  const baseBefore = 0x3000;



  const baseAfter = 0x4000;







  // x lane ran: both the base and the callback pointer are reloaded.



  assert.equal(managerPollA6dd30XCbRan(1, 0, cbBefore), true);



  assert.equal(managerPollA6dd30YAxisBase(true, baseBefore, baseAfter), baseAfter);



  assert.equal(managerPollA6dd30YCbPtr(true, cbBefore, cbAfter), cbAfter);







  // x lane skipped (no change): the y lane keeps the pre-call registers.



  assert.equal(managerPollA6dd30XCbRan(1, 1, cbBefore), false);



  assert.equal(managerPollA6dd30YAxisBase(false, baseBefore, baseAfter), baseBefore);



  assert.equal(managerPollA6dd30YCbPtr(false, cbBefore, cbAfter), cbBefore);







  // x lane skipped because the callback pointer was null: same, no reload.



  assert.equal(managerPollA6dd30XCbRan(1, 0, 0), false);



  assert.equal(managerPollA6dd30YCbPtr(false, 0, cbAfter), 0);







  // A callback that unregisters itself suppresses its own y-lane invocation.



  const ranThenCleared = managerPollA6dd30YCbNeeded(1, 0, true, cbBefore, 0);



  assert.equal(ranThenCleared, false);



  // If the x callback never ran, the y lane keeps the pre-call pointer, so a



  // pointer that only appears in the post-call slot cannot enable it.



  assert.equal(managerPollA6dd30YCbNeeded(1, 0, false, 0, cbAfter), false);



  // When it did run, the reloaded pointer governs.



  assert.equal(managerPollA6dd30YCbNeeded(1, 0, true, 0, cbAfter), true);



  assert.equal(managerPollA6dd30YCbNeeded(1, 0, true, cbBefore, cbAfter), true);







  // With no reload the y gate degenerates to the plain predicate.



  for (const [nv, ov] of [[1, 0], [0, 0], [Number.NaN, 0]]) {



    assert.equal(



      managerPollA6dd30YCbNeeded(nv, ov, false, cbBefore, cbAfter),



      managerPollA6dd30CbNeeded(nv, ov, cbBefore),



      `no-reload y gate ${nv},${ov}`,



    );



  }







  // The stale-state trap: feeding the pre-call base to the y lane is wrong



  // exactly when the callback moved the array.



  assert.notEqual(



    managerPollA6dd30YAxisBase(true, baseBefore, baseAfter),



    baseBefore,



  );



  // Both lanes report the same timestamp (restored from the spill slot).



  assert.equal(managerPollA6dd30TimestampIsStable(), true);







  // Slot offsets are relative to whichever base the lane selected.



  const yBase = managerPollA6dd30YAxisBase(true, baseBefore, baseAfter);



  assert.equal(yBase + managerPollA6dd30AxisSlotOffsetY(3), baseAfter + 16);



  assert.equal(



    managerPollA6dd30AxisSlotOffsetY(3) - managerPollA6dd30AxisSlotOffset(3),



    4,



  );



});







test("JS oracle: audit F11 â€” a1f280 action push snapshots (ABI v20)", () => {



  // The offset consumes the post-vcall mode read.



  assert.equal(managerPollA1f280ActionSlotModeCc(7), 7);



  assert.equal(managerPollA1f280ActionSlotModeCc(4), 4);







  // The base is refreshed only on the log path.



  assert.equal(managerPollA1f280ActionStoreBase(false, 0x1000, 0x2000), 0x1000);



  assert.equal(managerPollA1f280ActionStoreBase(true, 0x1000, 0x2000), 0x2000);







  // Store address composes the selected base with the frozen mode/index.



  assert.equal(



    managerPollA1f280ActionStoreAddr(0x1000, 0, 0),



    0x1000 + managerPollA1f280BufferSlotOffset(0, 0),



  );



  assert.equal(



    managerPollA1f280ActionStoreAddr(0x1000, 2, 3),



    0x1000 + managerPollA1f280BufferSlotOffset(2, 3),



  );



  // (mode + index*4) * 4



  assert.equal(managerPollA1f280ActionStoreAddr(0, 2, 3), (2 + 3 * 4) * 4);



  assert.equal(managerPollA1f280ActionStoreAddr(0xfffffff0, 0, 0), 0xfffffff0);







  // The in-range path never refreshes, so both snapshots must be equal there.



  const inRangeAddr = managerPollA1f280ActionStoreAddr(



    managerPollA1f280ActionStoreBase(false, 0x1000, 0x9999),



    2,



    3,



  );



  assert.equal(inRangeAddr, 0x1000 + (2 + 3 * 4) * 4);



  // The log path uses the refreshed base with the same frozen mode/index.



  const logAddr = managerPollA1f280ActionStoreAddr(



    managerPollA1f280ActionStoreBase(true, 0x1000, 0x9000),



    2,



    3,



  );



  assert.equal(logAddr, 0x9000 + (2 + 3 * 4) * 4);



  assert.notEqual(inRangeAddr, logAddr);







  // The range check keeps the pre-log count.



  assert.equal(managerPollA1f280ActionCountIsPrelog(), true);



  // The OOR log fires exactly when the index is out of the pre-log range.



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(3, 4), false);



  assert.equal(managerPollA1f280ActionIdOorLogNeeded(4, 4), true);



  assert.equal(



    managerPollA1f280ActionIdOorLogNeeded(4, 4),



    !managerPollA1f280BufferIndexInRange(4, 4),



  );



});







test("JS oracle: state-2 arm entity sweep (ABI v20)", () => {



  // Arm gates.



  assert.equal(MANAGER_STATE2_OFF_BLOCK_FLAG, 0x4b130);



  assert.equal(MANAGER_STATE2_OFF_PARITY, 0x4abbc);



  assert.equal(managerState2Blocked(0), false);



  assert.equal(managerState2Blocked(1), true);



  assert.equal(managerState2Blocked(0xff), true);



  assert.equal(managerState2ParityAlt(0), false);



  assert.equal(managerState2ParityAlt(1), true);



  assert.equal(managerState2ParityAlt(2), false);



  assert.equal(managerState2ParityAlt(3), true);



  assert.equal(managerState2ParityAlt(0xfe), false);



  // The parity byte is the low byte of the same counter the early skip reads



  // (ABI v2 recorded that field as Manager+0x4abbc).



  assert.equal(MANAGER_STATE2_OFF_PARITY, 0x4abbc);







  // Container / entity layout.



  assert.equal(GAME_STATE2_OFF_CONTAINER, 0x18300);



  assert.equal(STATE2_OFF_ENTITY_COUNT, 0x1264);



  assert.equal(STATE2_OFF_ENTITY_ARRAY, 0x125c);



  assert.equal(STATE2_OFF_ENTITY_COUNT - STATE2_OFF_ENTITY_ARRAY, 8);



  assert.equal(STATE2_OFF_ENTITY_FLAG, 0x175);







  // Sweep entry and the re-derived bound.



  assert.equal(managerState2SweepNeeded(0), false);



  assert.equal(managerState2SweepNeeded(1), true);



  assert.equal(managerState2SweepNeeded(0xffffffff), true);



  assert.equal(managerState2SweepStep(0, 1), false);



  assert.equal(managerState2SweepStep(0, 2), true);



  assert.equal(managerState2SweepStep(1, 2), false);



  // `inc` wraps to 0, which is still below the bound, so the loop continues â€”



  // the same wrap behaviour as the other index-continue helpers in this file.



  assert.equal(managerState2SweepStep(0xffffffff, 2), true);



  assert.equal(managerState2SweepStep(0xffffffff, 0), false);



  // A bound that shrinks mid-sweep stops the loop early; a folded count would



  // not notice. This is the property the re-derived-bound helper exists for.



  assert.equal(managerState2SweepStep(2, 8), true);



  assert.equal(managerState2SweepStep(2, 3), false);







  // Entity addressing.



  assert.equal(managerState2EntitySlotAddr(0x1000, 0), 0x1000);



  assert.equal(managerState2EntitySlotAddr(0x1000, 3), 0x100c);



  assert.equal(managerState2EntitySlotAddr(0xfffffffc, 1), 0);







  // Fixup gate and the two copy pairs.



  assert.equal(managerState2EntityNeedsFixup(0), false);



  assert.equal(managerState2EntityNeedsFixup(1), true);



  assert.equal(managerState2FixupSrcOfs(STATE2_FIXUP_A), 0x344);



  assert.equal(managerState2FixupDstOfs(STATE2_FIXUP_A), 0x33c);



  assert.equal(managerState2FixupSrcOfs(STATE2_FIXUP_B), 0x348);



  assert.equal(managerState2FixupDstOfs(STATE2_FIXUP_B), 0x340);



  assert.equal(managerState2FixupSrcOfs(STATE2_FIXUP_COUNT), 0xffffffff);



  assert.equal(managerState2FixupDstOfs(-1), 0xffffffff);



  // Each pair copies src -> dst 8 bytes lower, and the pairs are adjacent.



  for (const id of [STATE2_FIXUP_A, STATE2_FIXUP_B]) {



    assert.equal(managerState2FixupSrcOfs(id) - managerState2FixupDstOfs(id), 8);



  }



  assert.equal(



    managerState2FixupSrcOfs(STATE2_FIXUP_B) - managerState2FixupSrcOfs(STATE2_FIXUP_A),



    4,



  );



  assert.equal(



    managerState2FixupDstOfs(STATE2_FIXUP_B) - managerState2FixupDstOfs(STATE2_FIXUP_A),



    4,



  );



  assert.equal(managerState2EntityFlagAfterFixup(), 0);



  // The sweep only runs on the state-2 arm.



  assert.equal(managerShellStateUsesGame(2), true);



});







test("JS oracle: FUN_009505e0 complete leaf predicate (ABI v21)", () => {



  // Header-only constants are invisible to the differential â€” pin the literals.



  assert.equal(P9505E0_OFF_A_DWORD, 0x1918);



  assert.equal(P9505E0_OFF_A_BYTE, 0x1928);



  assert.equal(P9505E0_OFF_B_DWORD, 0x1b6c);



  assert.equal(P9505E0_OFF_B_BYTE, 0x1b7c);



  assert.equal(P9505E0_RECV_OFS, 0x4b3d8);



  assert.equal(P9505E0_FIELD_COUNT, 4);



  // Receiver is the v19 90b150 block, so Manager-relative offsets follow.



  assert.equal(P9505E0_RECV_OFS, MANAGER_SHELL_OFF_SUB_90B150);



  assert.equal(manager9505e0ManagerOfs(P9505E0_FIELD_A_DWORD), 0x4ccf0);



  assert.equal(manager9505e0ManagerOfs(P9505E0_FIELD_A_BYTE), 0x4cd00);



  assert.equal(manager9505e0ManagerOfs(P9505E0_FIELD_B_DWORD), 0x4cf44);



  assert.equal(manager9505e0ManagerOfs(P9505E0_FIELD_B_BYTE), 0x4cf54);



  assert.equal(manager9505e0FieldOfs(P9505E0_FIELD_COUNT), 0xffffffff);



  assert.equal(manager9505e0FieldOfs(-1), 0xffffffff);



  assert.equal(manager9505e0ManagerOfs(9), 0xffffffff);







  // Full 16-entry truth table over "each field zero / non-zero".



  for (let bits = 0; bits < 16; bits += 1) {



    const a = bits & 1 ? 1 : 0;



    const b = bits & 2 ? 1 : 0;



    const c = bits & 4 ? 1 : 0;



    const d = bits & 8 ? 1 : 0;



    assert.equal(



      manager9505e0Gate(a, b, c, d),



      (a === 1 && b === 1) || (c === 1 && d === 1),



      `9505e0 truth ${bits}`,



    );



  }







  // Width split: 0x100 is TRUE at a dword site and FALSE at a byte site.



  assert.equal(manager9505e0Gate(0x100, 1, 0, 0), true);



  assert.equal(manager9505e0Gate(1, 0x100, 0, 0), false);



  assert.equal(manager9505e0Gate(0, 0, 0x100, 1), true);



  assert.equal(manager9505e0Gate(0, 0, 1, 0x100), false);



  // â€¦and a value whose low byte is set is true at both.



  assert.equal(manager9505e0Gate(0x101, 0x101, 0, 0), true);



  assert.equal(manager9505e0Gate(0, 0, 0x101, 0x101), true);



  // The high half alone never satisfies a byte site.



  assert.equal(manager9505e0Gate(0xffffff00, 0xffffff00, 0xffffff00, 0xffffff00), false);



  assert.equal(manager9505e0Gate(0xffffffff, 0xffffffff, 0, 0), true);







  // Short circuit: pair B is untouched exactly when pair A already answered.



  assert.equal(manager9505e0ReadsBPair(1, 1), false);



  assert.equal(manager9505e0ReadsBPair(1, 0), true);



  assert.equal(manager9505e0ReadsBPair(0, 1), true);



  assert.equal(manager9505e0ReadsBPair(0, 0), true);



  assert.equal(manager9505e0ReadsBPair(1, 0x100), true); // byte site clear



  // Whenever B is skipped, its fields cannot influence the answer.



  for (const [a, b] of [[1, 1], [1, 3], [0xffffffff, 0xff]]) {



    assert.equal(manager9505e0ReadsBPair(a, b), false);



    assert.equal(manager9505e0Gate(a, b, 0, 0), manager9505e0Gate(a, b, 1, 1));



  }



});







test("JS oracle: FUN_009c3990 probe islands (ABI v21)", () => {



  assert.equal(P9C3990_OFF_NODE_OBJ, 0x8);



  assert.equal(P9C3990_OFF_OBJ_FLAGS, 0x24);



  assert.equal(P9C3990_MATCH_BIT, 0x4);



  assert.equal(P9C3990_OFF_LOCK_SUBOBJ, 0x8);



  assert.equal(P9C3990_LOCK_VTBL, 0xc);



  assert.equal(P9C3990_UNLOCK_VTBL, 0x10);



  assert.equal(P9C3990_LOCK_ARG, -1);



  assert.equal(manager9c3990LockArg(), -1);



  assert.equal(manager9c3990LockVtblSlot(), 0xc);



  assert.equal(manager9c3990UnlockVtblSlot(), 0x10);



  assert.equal(manager9c3990UnlockAlways(), true);







  // `test byte â€¦,4`: bit 2, and only of the low byte.



  assert.equal(manager9c3990NodeMatches(0), false);



  assert.equal(manager9c3990NodeMatches(4), true);



  assert.equal(manager9c3990NodeMatches(0xfb), false);



  assert.equal(manager9c3990NodeMatches(0xff), true);



  assert.equal(manager9c3990NodeMatches(0x400), false);



  assert.equal(manager9c3990NodeMatches(0x104), true);



  // Adjacent bits must not be accepted â€” the mask alone is not the property.



  assert.equal(manager9c3990NodeMatches(2), false);



  assert.equal(manager9c3990NodeMatches(8), false);







  // The entry test and the back edge are the same comparison against the head.



  assert.equal(manager9c3990WalkContinue(0x1000, 0x1000), false);



  assert.equal(manager9c3990WalkContinue(0x1004, 0x1000), true);



  assert.equal(manager9c3990WalkContinue(0, 0), false);







  // Empty ring: bl stays clear, nothing is scanned, the unlock still happens.



  assert.equal(manager9c3990Result(null, 0), false);



  assert.equal(manager9c3990Scanned(null, 0), 0);



  assert.equal(manager9c3990Result([], 0), false);



  // First-match stop.



  assert.equal(manager9c3990Scanned([0, 0, 4, 4], 4), 3);



  assert.equal(manager9c3990Result([0, 0, 4, 4], 4), true);



  assert.equal(manager9c3990Scanned([0, 0, 0, 0], 4), 4);



  assert.equal(manager9c3990Result([0, 0, 0, 0], 4), false);



  assert.equal(manager9c3990Scanned([4], 1), 1);



  // A match at the last position still reports a match (boundary of the



  // "scanned < n" shortcut a naive implementation reaches for).



  assert.equal(manager9c3990Result([0, 0, 0, 4], 4), true);



  assert.equal(manager9c3990Scanned([0, 0, 0, 4], 4), 4);



});







test("JS oracle: state-1 arm + state-2 head siblings (ABI v21)", () => {



  assert.equal(STATE1_MODE_GLOBAL, 0x00c72a20);



  assert.equal(STATE1_MODE_OFS, 0x40);



  assert.equal(STATE1_MODE_MATCH, 0x11);



  assert.equal(STATE1_TERMINAL_VA, 0x009897d0);



  assert.equal(STATE2_TERMINAL_VA, 0x006fa540);



  assert.equal(STATE_ARM_PROBE_VA, 0x009c3990);



  assert.equal(STATE_ARM_PROBE_RECV_OFS, 0x4d070);



  assert.equal(STATE3_RECV_OFS, 0x20dd0);



  assert.equal(STATE5_RECV_OFS, 0x21628);



  assert.equal(STATE3_CALL_VA, 0x0095df20);



  assert.equal(STATE5_CALL_VA, 0x00920510);



  assert.equal(managerState1TerminalVa(), 0x009897d0);



  assert.equal(managerState2HeadTerminalVa(), 0x006fa540);



  assert.equal(managerState1ModeReadUnconditional(), true);



  // The probe receiver is the same sub-object the v3 post-poll chain uses.



  assert.equal(STATE_ARM_PROBE_RECV_OFS, MANAGER_SHELL_OFF_SUB_9C34F0);







  // Arm table: states 1/2 share the probe, 3 and 5 have their own receivers,



  // state 4's slot is the default VA so it has no arm body of its own.



  assert.equal(managerShellArmRecvOfs(1), 0x4d070);



  assert.equal(managerShellArmRecvOfs(2), 0x4d070);



  assert.equal(managerShellArmRecvOfs(3), 0x20dd0);



  assert.equal(managerShellArmRecvOfs(4), 0xffffffff);



  assert.equal(managerShellArmRecvOfs(5), 0x21628);



  assert.equal(managerShellArmRecvOfs(0), 0xffffffff);



  assert.equal(managerShellArmRecvOfs(6), 0xffffffff);



  assert.equal(managerShellArmCallVa(1), 0x009c3990);



  assert.equal(managerShellArmCallVa(2), 0x009c3990);



  assert.equal(managerShellArmCallVa(3), 0x0095df20);



  assert.equal(managerShellArmCallVa(4), 0xffffffff);



  assert.equal(managerShellArmCallVa(5), 0x00920510);



  // Every state whose table slot is not the default VA has an arm body.



  for (const s of [1, 2, 3, 5]) {



    assert.notEqual(managerShellStateTargetVa(s), MANAGER_SHELL_STATE_DEFAULT_VA);



    assert.notEqual(managerShellArmCallVa(s), 0xffffffff);



  }



  assert.equal(managerShellStateTargetVa(4), MANAGER_SHELL_STATE_DEFAULT_VA);



  assert.equal(managerShellArmCallVa(4), 0xffffffff);







  // State-1 gate is a DISJUNCTION: the mode match wins even with a set probe.



  assert.equal(managerState1SecondGateNeeded(0, 0), true);



  assert.equal(managerState1SecondGateNeeded(1, 0), false);



  assert.equal(managerState1SecondGateNeeded(1, 0x11), true);



  assert.equal(managerState1SecondGateNeeded(0xff, 0x11), true);



  assert.equal(managerState1SecondGateNeeded(0, 0x11), true);



  // The probe result is an AL test: a value clear in the low byte enters.



  assert.equal(managerState1SecondGateNeeded(0x100, 0), true);



  assert.equal(managerState1SecondGateNeeded(0x101, 0), false);



  // The mode compare is a full dword compare against 0x11 exactly.



  assert.equal(managerState1SecondGateNeeded(1, 0x10), false);



  assert.equal(managerState1SecondGateNeeded(1, 0x12), false);



  assert.equal(managerState1SecondGateNeeded(1, 0x111), false);



  assert.equal(managerState1SecondGateNeeded(1, 0xffffff11), false);







  // State-2 head has no disjunct at all.



  assert.equal(managerState2HeadGateNeeded(0), true);



  assert.equal(managerState2HeadGateNeeded(1), false);



  assert.equal(managerState2HeadGateNeeded(0x100), true);



  assert.equal(managerState2HeadGateNeeded(0x101), false);







  // Cross-helper sibling law: the two arms agree on every probe value EXCEPT



  // when the state-1 mode dword equals 0x11, where state 1 forces entry.



  for (const probe of [0, 1, 2, 0x7f, 0xff, 0x100, 0x101, 0xffffffff]) {



    for (const mode of [0, 1, 0x10, 0x11, 0x12, 0xffffffff]) {



      const s1 = managerState1SecondGateNeeded(probe, mode);



      const s2 = managerState2HeadGateNeeded(probe);



      if (mode === STATE1_MODE_MATCH) {



        assert.equal(s1, true, `state1 forced ${probe}`);



      } else {



        assert.equal(s1, s2, `sibling gates ${probe},${mode}`);



      }



    }



  }







  // Terminal decision: the predicate byte SKIPS the call when set.



  assert.equal(managerState1TerminalNeeded(0, 0, 0), true);



  assert.equal(managerState1TerminalNeeded(0, 0, 1), false);



  assert.equal(managerState1TerminalNeeded(1, 0, 0), false);



  assert.equal(managerState1TerminalNeeded(1, 0x11, 0), true);



  assert.equal(managerState1TerminalNeeded(0, 0, 0x100), true); // AL test



  assert.equal(managerState2HeadTerminalNeeded(0, 0), true);



  assert.equal(managerState2HeadTerminalNeeded(0, 1), false);



  assert.equal(managerState2HeadTerminalNeeded(1, 0), false);



  assert.equal(managerState2HeadTerminalNeeded(0, 0x100), true);







  // Cascade collapse: composing over the leaf's fields must equal composing



  // over its result byte, for every field pattern.



  for (let bits = 0; bits < 16; bits += 1) {



    const f = [bits & 1, (bits >> 1) & 1, (bits >> 2) & 1, (bits >> 3) & 1];



    const gate = manager9505e0Gate(f[0], f[1], f[2], f[3]) ? 1 : 0;



    for (const probe of [0, 1]) {



      for (const mode of [0, 0x11]) {



        assert.equal(



          managerState1TerminalNeededFromFields(probe, mode, f[0], f[1], f[2], f[3]),



          managerState1TerminalNeeded(probe, mode, gate),



          `state1 collapse ${bits},${probe},${mode}`,



        );



      }



      assert.equal(



        managerState2HeadTerminalNeededFromFields(probe, f[0], f[1], f[2], f[3]),



        managerState2HeadTerminalNeeded(probe, gate),



        `state2 collapse ${bits},${probe}`,



      );



    }



  }



});







test("JS oracle: pre-dispatch ladder conditional recapture (ABI v21)", () => {



  assert.equal(PREDISPATCH_OFF_OBJ, 0x21c38);



  assert.equal(PREDISPATCH_OFF_RECV, 0x21c1c);



  assert.equal(PREDISPATCH_OFF_SUPPRESS, 0x29fb8);



  assert.equal(PREDISPATCH_OFF_MODE, 0x2a378);



  assert.equal(PREDISPATCH_MODE_MATCH, 1);



  assert.equal(PREDISPATCH_QUEUE_BEGIN_OFS, 0x0);



  assert.equal(PREDISPATCH_QUEUE_END_OFS, 0x4);



  assert.equal(PREDISPATCH_CALL_VA, 0x00931ba0);



  assert.equal(PREDISPATCH_FIELD_COUNT, 4);



  assert.equal(managerPredispatchFieldOfs(PREDISPATCH_FIELD_OBJ), 0x21c38);



  assert.equal(managerPredispatchFieldOfs(PREDISPATCH_FIELD_RECV), 0x21c1c);



  assert.equal(managerPredispatchFieldOfs(PREDISPATCH_FIELD_SUPPRESS), 0x29fb8);



  assert.equal(managerPredispatchFieldOfs(PREDISPATCH_FIELD_MODE), 0x2a378);



  assert.equal(managerPredispatchFieldOfs(PREDISPATCH_FIELD_COUNT), 0xffffffff);



  assert.equal(managerPredispatchFieldOfs(-1), 0xffffffff);



  // The gate object and the call receiver are 0x1c apart in the same block.



  assert.equal(PREDISPATCH_OFF_OBJ - PREDISPATCH_OFF_RECV, 0x1c);







  // Call gate: pointer non-null AND suppress byte clear.



  assert.equal(managerPredispatchCallNeeded(0, 0), false);



  assert.equal(managerPredispatchCallNeeded(1, 0), true);



  assert.equal(managerPredispatchCallNeeded(1, 1), false);



  assert.equal(managerPredispatchCallNeeded(1, 0x100), true); // byte test



  assert.equal(managerPredispatchCallNeeded(1, 0x101), false);







  // CONDITIONAL recapture: "always after" is as wrong as "always before".



  assert.equal(managerPredispatchObjAfter(true, 0xaa, 0xbb), 0xbb);



  assert.equal(managerPredispatchObjAfter(false, 0xaa, 0xbb), 0xaa);



  assert.equal(managerPredispatchSuppressAfter(true, 0, 1), 1);



  assert.equal(managerPredispatchSuppressAfter(false, 0, 1), 0);







  // A callee that clears the object pointer stops the ladderâ€¦



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 0, 0, 0, 1),



    false,



    "callee cleared the object",



  );



  // â€¦and the discriminating case for the suppress recapture: the byte was set



  // before, so the call and both reloads are skipped and the SECOND read sees



  // the same set byte. An "always take the post-call value" model would let a



  // clear `suppressAfter` through and wrongly reach the queue comparison.



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 1, 0, 0, 1),



    false,



    "suppress set before the call blocks even if the after-value is clear",



  );



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 1, 0x1000, 0, 1),



    false,



    "same, with the pointer unchanged",



  );



  // PE truth, not just oracle agreement: a set suppress byte makes the ladder



  // unreachable for EVERY other input, because the skip path re-reads the same



  // memory with nothing in between that could have changed it.



  for (const objAfter of [0, 1, 0x1000, 0xffffffff]) {



    for (const suppressAfter of [0, 1, 0xff, 0x100]) {



      for (const mode of [0, 1, 2]) {



        assert.equal(



          managerPredispatchQueueGateReached(0x1000, 1, objAfter, suppressAfter, mode),



          false,



          `suppressed ladder ${objAfter},${suppressAfter},${mode}`,



        );



      }



    }



  }



  // The object recapture is NOT observable through this composed gate (both



  // skip paths already fail for another reason), so it is pinned directly on



  // the recapture helper above rather than here.



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 1, 0, 1, 1),



    managerPredispatchQueueGateReached(0x1000, 1, 0x1000, 1, 1),



  );



  // A callee that SETS the suppress byte blocks even though it was clear.



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 0, 0x1000, 1, 1),



    false,



    "callee set suppress",



  );



  // Mode is a full-word compare against exactly 1.



  assert.equal(managerPredispatchQueueGateReached(0x1000, 0, 0x1000, 0, 1), true);



  assert.equal(managerPredispatchQueueGateReached(0x1000, 0, 0x1000, 0, 0), false);



  assert.equal(managerPredispatchQueueGateReached(0x1000, 0, 0x1000, 0, 2), false);



  assert.equal(



    managerPredispatchQueueGateReached(0x1000, 0, 0x1000, 0, 0x101),



    false,



  );



  // A null pointer never reaches the second read at all.



  assert.equal(managerPredispatchQueueGateReached(0, 0, 0x1000, 0, 1), false);







  // Queue comparison and the whole-ladder decision.



  assert.equal(managerPredispatchForcesDefault(0x20, 0x20), true);



  assert.equal(managerPredispatchForcesDefault(0x20, 0x24), false);



  assert.equal(managerPredispatchForcesDefault(0, 0), true);



  // Reaching the comparison with equal dwords is the ONLY way to skip the



  // jump table; every earlier exit falls into the dispatch.



  assert.equal(



    managerPredispatchDispatches(0x1000, 0, 0x1000, 0, 1, 0x20, 0x20),



    false,



  );



  assert.equal(



    managerPredispatchDispatches(0x1000, 0, 0x1000, 0, 1, 0x20, 0x24),



    true,



  );



  assert.equal(managerPredispatchDispatches(0, 0, 0, 0, 1, 0x20, 0x20), true);



  assert.equal(



    managerPredispatchDispatches(0x1000, 0, 0x1000, 0, 2, 0x20, 0x20),



    true,



  );



  assert.equal(



    managerPredispatchDispatches(0x1000, 0, 0, 0, 1, 0x20, 0x20),



    true,



  );







  // Recorded defect: the state-2 arm has no g_Game null guard, and the port



  // must not invent one. Asserting the absence keeps a later unit honest.



  assert.equal(managerState2GameNullGuarded(), false);



});







test("JS oracle: state-2 arm remainder + angle wrap + approach tail (ABI v22)", () => {



  // VA 0x00955238: byte [Manager+0x2a3c0] gate, byte compare.



  assert.equal(managerState2MidParityGateNeeded(0), false);



  assert.equal(managerState2MidParityGateNeeded(1), true);



  assert.equal(managerState2MidParityGateNeeded(0x100), false); // byte test



  assert.equal(managerState2MidParityGateNeeded(0x101), true);



  assert.equal(STATE2_MID_OFF_2A3C0, 0x2a3c0);



  assert.equal(managerState2MidParityCallVa(), STATE2_MID_PARITY_CALL_VA);



  assert.equal(STATE2_MID_PARITY_CALL_VA, 0x006fd3f0);







  // VA 0x00955271/…83: not paused always dispatches; while paused both



  // recaptured g_Game dwords gate. Byte test on paused, word on the dwords.



  assert.equal(managerState2MidDispatchNeeded(0, 0, 0), true);



  assert.equal(managerState2MidDispatchNeeded(0x100, 0, 0), true);



  assert.equal(managerState2MidDispatchNeeded(1, 0, 0), false);



  assert.equal(managerState2MidDispatchNeeded(1, 1, 0), false);



  assert.equal(managerState2MidDispatchNeeded(1, 0, 0x13), false);



  assert.equal(managerState2MidDispatchNeeded(1, 1, 0x13), true);



  assert.equal(managerState2MidDispatchNeeded(1, 1, 0x14), false);



  assert.equal(managerState2MidDispatchNeeded(1, 1, 0xffffffff), false);



  assert.equal(STATE2_MID_OFF_GAME_A, 0x1b83c);



  assert.equal(STATE2_MID_OFF_GAME_B, 0x1b858);



  assert.equal(STATE2_MID_GAME_B_MATCH, 0x13);



  assert.equal(managerState2MidIsPausedVa(), STATE2_MID_IS_PAUSED_VA);



  assert.equal(STATE2_MID_IS_PAUSED_VA, 0x006fd350);







  // VA 0x00955290/…95: mode == 2 ONLY. Mode 1 and 3+ take the parity call.



  assert.equal(managerState2MidModeIsTwo(0), false);



  assert.equal(managerState2MidModeIsTwo(1), false);



  assert.equal(managerState2MidModeIsTwo(2), true);



  assert.equal(managerState2MidModeIsTwo(3), false);



  assert.equal(managerState2MidModeIsTwo(0x10000002), false);



  assert.equal(managerState2MidModeIsTwo(0xffffffff), false);



  assert.equal(STATE2_MID_OFF_MODE, 0x2a380);



  assert.equal(STATE2_MID_MODE_V2, 2);



  assert.equal(managerState2MidCallAVa(), STATE2_MID_CALL_A_VA);



  assert.equal(STATE2_MID_CALL_A_VA, 0x009446e0);



  assert.equal(managerState2MidCallBVa(), STATE2_MID_CALL_B_VA);



  assert.equal(STATE2_MID_CALL_B_VA, 0x009439d0);







  // VA 0x0095525e/…64: byte [Manager+0x4abbc] & 1.



  assert.equal(managerState2MidParityBit(0), 0);



  assert.equal(managerState2MidParityBit(1), 1);



  assert.equal(managerState2MidParityBit(2), 0);



  assert.equal(managerState2MidParityBit(3), 1);



  assert.equal(managerState2MidParityBit(0x100), 0); // byte test



  assert.equal(managerState2MidParityBit(0x101), 1);



  assert.equal(STATE2_MID_OFF_PARITY, 0x4abbc);







  // VA 0x009552a5/…bd: write byte [obj+0x8c]=0 — delayed store on the v==2



  // path only when the spill byte is set; always on the other path.



  assert.equal(managerState2MidWriteByteNeeded(2, 1), true);



  assert.equal(managerState2MidWriteByteNeeded(2, 0), false);



  assert.equal(managerState2MidWriteByteNeeded(2, 0x100), false); // byte test



  assert.equal(managerState2MidWriteByteNeeded(2, 0x101), true);



  assert.equal(managerState2MidWriteByteNeeded(1, 0), true);



  assert.equal(managerState2MidWriteByteNeeded(0, 0), true);



  assert.equal(managerState2MidWriteByteNeeded(0x10000002, 0x101), true);



  assert.equal(STATE2_MID_OFF_OBJ_INNER, 0x11f8);



  assert.equal(STATE2_MID_OFF_OBJ_BYTE, 0x8c);



  assert.equal(managerState2MidObjInnerOfs(), 0x11f8);



  assert.equal(managerState2MidObjByteOfs(), 0x8c);



  assert.equal(managerState2MidModeOfs(), 0x2a380);







  // The angle-wrap loop: count is SAR32(end - begin) with 32-bit wrap on the



  // subtract; the pair is re-read on EVERY iteration.



  assert.equal(SHELL_ANGLE_BASE_OFS, 0x1bab4);



  assert.equal(SHELL_ANGLE_SLOT_STRIDE, 0x14);



  assert.equal(SHELL_ANGLE_SLOT_COUNT, 4);



  assert.equal(SHELL_ANGLE_COUNT_END_OFS, 0x1bb1c);



  assert.equal(SHELL_ANGLE_COUNT_BEGIN_OFS, 0x1bb18);



  assert.equal(managerShellAngleWrapCountEndOfs(), 0x1bb1c);



  assert.equal(managerShellAngleWrapCountBeginOfs(), 0x1bb18);



  assert.equal(managerShellAngleWrapBaseOfs(), 0x1bab4);



  assert.equal(managerShellAngleWrapSlotStride(), 0x14);



  assert.equal(managerShellAngleWrapSlotCount(), 4);



  // Count wraps: end < begin reads as a huge unsigned diff -> negative SAR.



  assert.equal(managerShellAngleWrapCount(0x100, 0x104), -1);



  assert.equal(managerShellAngleWrapCount(0x104, 0x100), 1);



  assert.equal(managerShellAngleWrapCount(0, 1), -1); // 32-bit wrap to 0xffffffff



  // PE 0x0095530f is `sar eax,2` — SIGNED. end=0xffffffff, begin=0 gives



  // diff = 0xffffffff = -1 (int32), SAR32 -> -1. 0x3fffffff would require



  // `shr eax,2` (unsigned), which the instruction stream does not contain.



  assert.equal(managerShellAngleWrapCount(0xffffffff, 0), -1);



  // Slot gate: signed dword < 0 skips.



  assert.equal(managerShellAngleWrapActive(0), true);



  assert.equal(managerShellAngleWrapActive(-1), false);



  assert.equal(managerShellAngleWrapActive(0x80000000), false);



  assert.equal(managerShellAngleWrapActive(0x7fffffff), true);







  // Slot body: int32 lane as f32, unsigned-32-bit count rounded ONCE to f32.



  // The wrap loop is mod-c: only w within 0.25 of a multiple of the lane



  // snaps. Exact +-0.25 stays the step arm (comiss eps,|w| / jb).



  assert.equal(managerShellAngleWrapSlot(-1, 4, 8.6, 0x10, 0), Math.fround(8.6),



    "skipped slot leaves the f32 value untouched");



  assert.equal(managerShellAngleWrapSlot(1, 8, 8.1, 0x10, 0), 8,



    "within 0.25 of the lane snaps");



  assert.equal(managerShellAngleWrapSlot(1, 8, 8, 0x10, 0), 8);



  assert.equal(managerShellAngleWrapSlot(1, 8, 7.7, 0x10, 0), Math.fround(7.95),



    "below the lane on the step arm moves up 0.25");



  assert.equal(managerShellAngleWrapSlot(1, 8, 8.3, 0x10, 0), Math.fround(8.05),



    "above the lane on the step arm moves down 0.25");



  assert.equal(managerShellAngleWrapSlot(1, 4, 7, 0x10, 0), 7.25,



    "up-wrap arm: w crosses -half then steps +0.25");



  assert.equal(managerShellAngleWrapSlot(1, 4, 0.5, 0x10, 0), 0.25,



    "down-wrap arm folds past +half then steps -0.25");



  // Boundary: |w| exactly 0.25 does NOT snap, both step arms give 0.



  assert.equal(managerShellAngleWrapSlot(1, 0, 0.25, 0x10, 0), 0);



  assert.equal(managerShellAngleWrapSlot(1, 0, -0.25, 0x10, 0), 0);



  // Within 0.25 snaps directly.



  assert.equal(managerShellAngleWrapSlot(1, 0, 0.125, 0x10, 0), 0);



  // Unsigned-count rounding: (0xffffffff - 0) SAR2 = -1, treated as unsigned



  // 4294967295 and rounded once to f32 (4294967296.0); half is huge so no wrap



  // and the value 1.0 lands on the -step arm.



  assert.equal(managerShellAngleWrapSlot(1, 0, 1, 0xffffffff, 0), 0.75);







  // Approach tail: g_Game non-null AND IsPaused() == 0 (byte test).



  assert.equal(SHELL_APPROACH_RECV_OFS, 0x2a324);



  assert.equal(SHELL_APPROACH_VALUE_OFS, 0x2a334);



  assert.equal(SHELL_APPROACH_STEP_OFS, 0x2a338);



  assert.equal(SHELL_APPROACH_TARGET_BITS, 0x3f800000);



  assert.equal(SHELL_APPROACH_HOST_VA, 0x0092e430);



  assert.equal(managerShellApproachTailHostVa(), SHELL_APPROACH_HOST_VA);



  assert.equal(managerShellApproachTailRecvOfs(), SHELL_APPROACH_RECV_OFS);



  assert.equal(managerShellApproachTailValueOfs(), SHELL_APPROACH_VALUE_OFS);



  assert.equal(managerShellApproachTailStepOfs(), SHELL_APPROACH_STEP_OFS);



  assert.equal(managerShellApproachTailNeeded(0, 0), false);



  assert.equal(managerShellApproachTailNeeded(1, 1), false);



  assert.equal(managerShellApproachTailNeeded(1, 0), true);



  assert.equal(managerShellApproachTailNeeded(1, 0x100), true); // byte test



  assert.equal(managerShellApproachTailNeeded(0xffffffff, 0x101), false);







  // Skip gate: EXACTLY ordered equality (ucomiss+lahf+test+jn…p). NaN and



  // -0.0 fall through; the skip means no store AND no host call.



  assert.equal(managerShellApproachTailStoreNeeded(1, 0.5), false);



  assert.equal(managerShellApproachTailStoreNeeded(0.5, 0), false);



  assert.equal(managerShellApproachTailStoreNeeded(0.5, -0), false);



  assert.equal(managerShellApproachTailStoreNeeded(1, 0), false);



  assert.equal(managerShellApproachTailStoreNeeded(0.75, 0.25), true);



  assert.equal(Number.isNaN(managerShellApproachTailStoreNeeded(NaN, 0.25)), false);



  assert.equal(managerShellApproachTailStoreNeeded(NaN, 0.25), true);



  assert.equal(managerShellApproachTailStoreNeeded(0.5, NaN), true);







  // Next: |1.0 - v|, land when step >= |d| (ordered); NaN step falls through.



  assert.equal(managerShellApproachTailNext(0.75, 0.25), 1);



  assert.equal(managerShellApproachTailNext(0.74, 0.25), Math.fround(0.99));



  assert.equal(managerShellApproachTailNext(1.26, 0.25), Math.fround(1.01));



  assert.equal(managerShellApproachTailNext(1.25, 0.25), 1);



  assert.equal(Number.isNaN(managerShellApproachTailNext(NaN, 0.25)), true);



  assert.equal(Number.isNaN(managerShellApproachTailNext(0.5, NaN)), true);



  // -0 step: skip gate, but the float itself is still exact through next().



  assert.equal(managerShellApproachTailNext(1.5, 0), 1.5);



});







test("JS oracle: state-2 arm tail call sites + ANM2 name select (ABI v23)", () => {



  // Host event A @ 0x00955463/…69: `lea ecx,[edi+0x29fbc]; call 0x7e17b0`.



  // Unconditional — the four approach-tail skip branches land at 0x00955463.



  assert.equal(STATE2_TAIL_CALL_A_VA, 0x007e17b0);



  assert.equal(STATE2_TAIL_OFF_CALL_A_RECV, 0x29fbc);



  assert.equal(managerState2TailCallAVa(), STATE2_TAIL_CALL_A_VA);



  assert.equal(managerState2TailCallARecvOfs(), STATE2_TAIL_OFF_CALL_A_RECV);







  // VA 0x0095546e: BYTE gate on [Manager+0x2a3a6]; clear skips host B and



  // the ANM2::Play edge (je @ 0x00955475 to the parity-counter inc).



  assert.equal(STATE2_TAIL_OFF_GATE_B, 0x2a3a6);



  assert.equal(managerState2TailCallBNeeded(0), false);



  assert.equal(managerState2TailCallBNeeded(1), true);



  assert.equal(managerState2TailCallBNeeded(0x100), false); // byte test



  assert.equal(managerState2TailCallBNeeded(0x101), true);



  assert.equal(managerState2TailCallBNeeded(0xffffffff), true);



  assert.equal(managerState2TailCallBNeeded(0xff), true);







  // Host event B @ 0x0095547b/…83: this = dword [0xc7999c] (no null test in



  // the PE), edx = 0. Argument order (ecx, edx) is fixed.



  assert.equal(STATE2_TAIL_CALL_B_VA, 0x00a264f0);



  assert.equal(STATE2_TAIL_CALL_B_RECV_GLOBAL_VA, 0x00c7999c);



  assert.equal(STATE2_TAIL_CALL_B_EDX_ARG, 0);



  assert.equal(managerState2TailCallBVa(), STATE2_TAIL_CALL_B_VA);



  assert.equal(managerState2TailCallBRecvGlobalVa(), STATE2_TAIL_CALL_B_RECV_GLOBAL_VA);



  assert.equal(managerState2TailCallBArgEdx(), STATE2_TAIL_CALL_B_EDX_ARG);







  // VA 0x00955488/…94: `test eax,eax; mov ecx,0xb1bc54; mov edx,0xb7c444;



  // cmove edx,ecx` — FULL dword test: result==0 → "Idle", else "Clicked".



  assert.equal(STATE2_TAIL_ANIM_IDLE_VA, 0x00b1bc54);



  assert.equal(STATE2_TAIL_ANIM_CLICKED_VA, 0x00b7c444);



  assert.equal(managerState2TailAnimVa(0), STATE2_TAIL_ANIM_IDLE_VA);



  assert.equal(managerState2TailAnimVa(1), STATE2_TAIL_ANIM_CLICKED_VA);



  assert.equal(managerState2TailAnimVa(0xffffffff), STATE2_TAIL_ANIM_CLICKED_VA);



  assert.equal(managerState2TailAnimVa(0x100), STATE2_TAIL_ANIM_CLICKED_VA);



  assert.equal(managerState2TailAnimVa(0x80000000), STATE2_TAIL_ANIM_CLICKED_VA);



  assert.equal(managerState2TailAnimVa(0x7fffffff), STATE2_TAIL_ANIM_CLICKED_VA);



  assert.equal(managerState2TailAnimVa(-0), STATE2_TAIL_ANIM_IDLE_VA);







  // ANM2::Play edge @ 0x00955497/…a0: this=Manager+0x4b2a8, anim=selected



  // name, reset=0 (`push 0` is the LAST cdecl arg). Exact ZHL fact:



  // __thiscall void ANM2::Play(const char*, bool) — callee gate is the ANM2



  // family's translated surface; the edge args are what this slice records.



  assert.equal(STATE2_TAIL_PLAY_VA, 0x0040a380);



  assert.equal(STATE2_TAIL_OFF_PLAY_RECV, 0x4b2a8);



  assert.equal(STATE2_TAIL_PLAY_RESET_ARG, 0);



  assert.equal(managerState2TailPlayVa(), STATE2_TAIL_PLAY_VA);



  assert.equal(managerState2TailPlayRecvOfs(), STATE2_TAIL_OFF_PLAY_RECV);



  assert.equal(managerState2TailPlayResetArg(), STATE2_TAIL_PLAY_RESET_ARG);



});







test("JS oracle: Manager shell GLFW window tail (ABI v24)", () => {



  // 0x009554ab: win==NULL -> host _wassert (full 32-bit null test)



  assert.equal(SHELL_TAIL_WIN_GLOBAL_VA, 0x00c7999c);



  assert.equal(SHELL_TAIL_WASSERT_MSG_VA, 0x00b9bbcc);



  assert.equal(SHELL_TAIL_WASSERT_FILE_VA, 0x00b9bbf0);



  assert.equal(SHELL_TAIL_WASSERT_LINE, 0x310);



  assert.equal(SHELL_TAIL_WASSERT_IAT_VA, 0x00b18884);



  assert.equal(managerShellTailWinAssertNeeded(0), true);



  assert.equal(managerShellTailWinAssertNeeded(1), false);



  assert.equal(managerShellTailWinAssertNeeded(0x100), false); // full-dword null



  assert.equal(managerShellTailWinAssertNeeded(0xffffffff), false);







  // 0x009554c7: DAT_00c73680 == 0 -> host poll (cross-site with v3)



  assert.equal(SHELL_TAIL_PLATFORM_FLAG_VA, 0x00c73680);



  assert.equal(SHELL_TAIL_PLATFORM_POLL_VA, 0x00a69f60);



  assert.equal(SHELL_TAIL_PLATFORM_POLL_ARG0, 0x10001);



  assert.equal(SHELL_TAIL_PLATFORM_POLL_ARG1, 0);



  assert.equal(managerShellTailUsesPlatformPoll(0), true);



  assert.equal(managerShellTailUsesPlatformPoll(1), false);



  assert.equal(managerShellTailUsesPlatformPoll(0x100), false);



  // same predicate as the v3 poll prefix branch:



  for (const flag of [0, 1, 0xff, 0x100, 0xffffffff]) {



    assert.equal(managerShellTailUsesPlatformPoll(flag),



                 managerPollPlatformUsesA69f60(flag));



  }







  // 0x009554f0: [win+0x70] == 0x34003 -> direct f64 copy



  assert.equal(SHELL_TAIL_WIN_KIND_OFS, 0x70);



  assert.equal(SHELL_TAIL_WIN_KIND_DIRECT_COPY, 0x34003);



  assert.equal(SHELL_TAIL_WIN_D0_OFS, 0x1e0);



  assert.equal(SHELL_TAIL_WIN_D1_OFS, 0x1e8);



  assert.equal(SHELL_TAIL_PLATFORM_QUERY_VA, 0x00c736a0);



  assert.equal(managerShellTailDirectCopyNeeded(0x34003), true);



  assert.equal(managerShellTailDirectCopyNeeded(0x34002), false);



  assert.equal(managerShellTailDirectCopyNeeded(0x34004), false);



  assert.equal(managerShellTailDirectCopyNeeded(0x100), false);



  assert.equal(managerShellTailDirectCopyNeeded(0xffffffff), false);







  // cvtpd2ps narrowing: double -> f32 round-half-even



  assert.ok(Object.is(managerShellTailFloatOfF64(0.1), Math.fround(0.1)));



  assert.ok(Object.is(managerShellTailFloatOfF64(1e10), Math.fround(1e10)));



  assert.ok(Number.isNaN(managerShellTailFloatOfF64(NaN)));



  assert.equal(managerShellTailFloatOfF64(0), 0);



  assert.ok(Object.is(managerShellTailFloatOfF64(-0), -0));







  // ordered-equality idiom: jp taken iff NOT ordered-equal -> NaN resets



  assert.equal(managerShellTailLaneOrderedEqual(1, 1), true);



  assert.equal(managerShellTailLaneOrderedEqual(0, -0), true); // -0 == +0



  assert.equal(managerShellTailLaneOrderedEqual(1, 2), false);



  assert.equal(managerShellTailLaneOrderedEqual(NaN, NaN), false);



  assert.equal(managerShellTailLaneOrderedEqual(NaN, 1), false);



  assert.equal(managerShellTailBothLanesEqual(1, 1, 2, 2), true);



  assert.equal(managerShellTailBothLanesEqual(1, 1, 2, 3), false);



  assert.equal(managerShellTailBothLanesEqual(NaN, NaN, 1, 1), false);







  // timer decay/reset + stores + parity



  assert.equal(SHELL_TAIL_STORE_F0_OFS, 0x4b3bc);



  assert.equal(SHELL_TAIL_STORE_F1_OFS, 0x4b3c0);



  assert.equal(SHELL_TAIL_TIMER_OFS, 0x4b3c4);



  assert.equal(SHELL_TAIL_TIMER_RESET, 0x12c);



  assert.equal(managerShellTailTimerNext(5, true), 4);



  assert.equal(managerShellTailTimerNext(0, true), 0);   // jle skips dec



  assert.equal(managerShellTailTimerNext(-1, true), -1);  // signed



  assert.equal(managerShellTailTimerNext(5, false), 0x12c);



  assert.equal(managerShellTailTimerNext(-5, false), 0x12c);



  assert.equal(managerShellTailTimerNext(0x7fffffff, true), 0x7ffffffe);







  assert.equal(SHELL_TAIL_PARITY_OFS, 0x4abbc);



  assert.equal(managerShellTailParityNext(0), 1);



  assert.equal(managerShellTailParityNext(0xffffffff), 0); // 32-bit wrap



  assert.equal(managerShellTailParityNext(0x100), 0x101);



  // cross-field law: same counter the early-skip / state-2 parity arm reads



  assert.equal(managerShellTailParityNext(7), managerEarlyCounterNext(7));



  assert.equal(managerShellTailParityNext(0xffffffff), managerEarlyCounterNext(0xffffffff));



});











test("JS oracle: pre-poll state-machine block (ABI v25)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 25);







  // 0x00954d4d: byte [Manager+0x0] != 0 -> state=4 + byte0=0 (WIDE8)



  assert.equal(managerPrepollState4StoreNeeded(0), false);



  assert.equal(managerPrepollState4StoreNeeded(1), true);



  assert.equal(managerPrepollState4StoreNeeded(0x100), false); // low byte 0



  assert.equal(managerPrepollState4StoreNeeded(0x1ff), true); // wide nonzero



  assert.equal(managerPrepollState4StoreNeeded(0xffffffff), true);



  assert.equal(managerPrepollState4StoreNeeded(0x10000), false); // low byte 0







  // G1 / G2 byte gates (PE `cmp byte ptr`); hosts C/D/E + transitions



  for (const g of [managerPrepollG1Needed, managerPrepollG2Needed,



                   managerPrepollG3Needed, managerPrepollG4Needed]) {



    assert.equal(g(0), false);



    assert.equal(g(1), true);



    assert.equal(g(0xff), true);



    assert.equal(g(0x100), false);   // low byte 0: PE `cmp byte` sees 0



    assert.equal(g(0x1ff), true);



    assert.equal(g(0xffffffff), true);



    assert.equal(g(0x10000), false);



  }



  assert.equal(managerPrepollHostCNeeded(1, 1), true);



  assert.equal(managerPrepollHostCNeeded(1, 0), false);



  assert.equal(managerPrepollHostCNeeded(0, 1), false);



  assert.equal(managerPrepollHostCNeeded(0x100, 0xff), false); // g1 low byte 0



  assert.equal(managerPrepollHostCNeeded(0x1ff, 0xff), true);



  assert.equal(managerPrepollState3TransitionNeeded(1), true);



  assert.equal(managerPrepollState3TransitionNeeded(0x100), false); // low byte 0



  assert.equal(managerPrepollState3TransitionNeeded(0x1ff), true);



  assert.equal(managerPrepollState3TransitionNeeded(0), false);



  assert.equal(managerPrepollState5TransitionNeeded(0xff), true);



  assert.equal(managerPrepollState5TransitionNeeded(0), false);







  // 0x00954df0..0x00954e13 arm select: full-dword receiver zero tests



  assert.equal(managerPrepollArmSelect(3, 0, 0, 0), 3);   // state 3, recv clear



  assert.equal(managerPrepollArmSelect(3, 0, 0, 1), 0);   // 0x20dd0 != 0 -> poll



  assert.equal(managerPrepollArmSelect(3, 0, 0, 0xffffffff), 0);



  assert.equal(managerPrepollArmSelect(5, 0, 0, 0), 5);   // state 5, recv clear



  assert.equal(managerPrepollArmSelect(5, 0, 1, 0), 0);   // 0x21628 != 0 -> poll



  assert.equal(managerPrepollArmSelect(5, 1, 0, 999), 5); // G3 wins (eax=5)



  assert.equal(managerPrepollArmSelect(3, 1, 0, 0), 5);   // G3 forces state-5 arm



  assert.equal(managerPrepollArmSelect(3, 1, 1, 0), 0);   // G3 + 0x21628 set



  assert.equal(managerPrepollArmSelect(4, 0, 0, 0), 0);   // state 4 -> poll



  assert.equal(managerPrepollArmSelect(0, 0, 0, 0), 0);



  assert.equal(managerPrepollArmSelect(0x100, 0, 0, 0), 0); // state is dword



  assert.equal(managerPrepollArmSelect(-1, 0, 0, 0), 0);







  // copy block: eax==3 && G2 (only the state-3 arm copies)



  assert.equal(managerPrepollCopyBlockNeeded(3, 1), true);



  assert.equal(managerPrepollCopyBlockNeeded(3, 0x100), false); // low byte 0



  assert.equal(managerPrepollCopyBlockNeeded(3, 0x1ff), true);



  assert.equal(managerPrepollCopyBlockNeeded(3, 0), false);



  assert.equal(managerPrepollCopyBlockNeeded(5, 1), false); // state-5 skips



  assert.equal(managerPrepollCopyBlockNeeded(0, 1), false);







  // 0x00954efd addss [g+0x265b0], 1.0f (f32, one rounding)



  assert.ok(Object.is(managerPrepollGameB0Next(1), 2));



  assert.ok(Object.is(managerPrepollGameB0Next(0.5), 1.5));



  assert.ok(Object.is(managerPrepollGameB0Next(0), 1));



  assert.ok(Object.is(managerPrepollGameB0Next(-1), 0));



  assert.ok(Object.is(managerPrepollGameB0Next(-0), 1)); // -0 + 1 == 1



  assert.ok(Object.is(managerPrepollGameB0Next(1e38), Math.fround(1e38 + 1))); // f32 wrap



  assert.ok(Object.is(managerPrepollGameB0Next(Infinity), Infinity));



  assert.ok(Number.isNaN(managerPrepollGameB0Next(NaN)));



  assert.equal(managerPrepollGameB0Next(3.5), 4.5);







  // history==1 log/music tail: FULL-dword compare



  assert.equal(managerPrepollLogNeeded(1), true);



  assert.equal(managerPrepollLogNeeded(0), false);



  assert.equal(managerPrepollLogNeeded(2), false);



  assert.equal(managerPrepollLogNeeded(-1), false);



  assert.equal(managerPrepollLogNeeded(0x100), false); // full dword, not byte



  assert.equal(managerPrepollLogNeeded(0xffffffff), false);







  // movzx byte for NightmareScene::Show(bool)



  assert.equal(managerPrepollNightmareArg(0), 0);



  assert.equal(managerPrepollNightmareArg(1), 1);



  assert.equal(managerPrepollNightmareArg(0xff), 0xff);



  assert.equal(managerPrepollNightmareArg(0x100), 0);   // movzx, low byte only



  assert.equal(managerPrepollNightmareArg(0xffffffff), 0xff);







  // imul 0x4c slot arithmetic with 32-bit wrap



  assert.equal(managerPrepollCopySrcOfs(0), 0x20e00);



  assert.equal(managerPrepollCopySrcOfs(1), 0x20e4c);



  assert.equal(managerPrepollCopySrcOfs(2), 0x20e98);



  assert.equal(managerPrepollCopySrcDwordOfs(0), 0x20e10);



  assert.equal(managerPrepollCopySrcDwordOfs(1), 0x20e5c);



  // 32-bit wrap: 0x40000000 * 0x4c == 19 * 2^32 -> wraps to 0 (imul)



  assert.equal(managerPrepollCopySrcOfs(0x40000000), 0x20e00);



  assert.equal(managerPrepollCopySrcDwordOfs(0x40000000), 0x20e10);



  assert.equal(managerPrepollCopySrcOfs(0x11111111), 0x11131f0c);



  assert.equal(managerPrepollCopySrcDwordOfs(0x11111111), 0x11131f1c);



  assert.equal(managerPrepollCopySrcOfs(0xffffffff), 0x20db4);



  assert.equal(managerPrepollCopySrcDwordOfs(0xffffffff), 0x20dc4);







  // offsets / receivers / host VAs



  assert.equal(managerPrepollStateOfs(), 0x8);



  assert.equal(managerPrepollHistoryOfs(), 0xc);



  assert.equal(managerPrepollG1Ofs(), 0x21618);



  assert.equal(managerPrepollCutsceneIdOfs(), 0x2161c);



  assert.equal(managerPrepollG2Ofs(), 0x21620);



  assert.equal(managerPrepollCopySlotIndexOfs(), 0x215d8);



  assert.equal(managerPrepollCopySrcBase(), 0x20e00);



  assert.equal(managerPrepollCopySrcDw(), 0x20e10);



  assert.equal(managerPrepollCopyStride(), 0x4c);



  assert.equal(managerPrepollCopyDstCoreOfs(), 0x4b290);



  assert.equal(managerPrepollCopyDstDwordOfs(), 0x4b2a0);



  assert.equal(managerPrepollCopyDstExtOfs(), 0x4b28c);



  assert.equal(managerPrepollCopyExtFromOfs(), 0x21624);



  assert.equal(managerPrepollCopyFlagOfs(), 0x4b288);



  assert.equal(managerPrepollCopyFlagValue(), 1);



  assert.equal(managerPrepollG3Ofs(), 0x4b2a4);



  assert.equal(managerPrepollNightmareArgOfs(), 0x4b2a5);



  assert.equal(managerPrepollG4Ofs(), 0x4b428);



  assert.equal(managerPrepollState4Value(), 4);







  // cross-site laws with v21 ladder / state arms



  assert.equal(managerPrepollState3ArmByteOfs(), PREDISPATCH_OFF_SUPPRESS);



  assert.equal(managerPrepollState3ArmByteOfs(), 0x29fb8);



  assert.equal(managerPrepollPredispatchRecvOfs(), STATE3_RECV_OFS);



  assert.equal(managerPrepollPredispatchRecvOfs(), 0x20dd0);



  assert.equal(managerPrepollState5RecvOfs(), STATE5_RECV_OFS);



  assert.equal(managerPrepollState5RecvOfs(), 0x21628);







  // g_Game store block constants (0x00954e9c..0x00954f0d)



  assert.equal(managerPrepollGameStoreBaseOfs(), 0x265a4);



  assert.equal(managerPrepollGameStoreB4Ofs(), 0x265b4);



  assert.equal(managerPrepollGameStoreB8Ofs(), 0x265b8);



  assert.equal(managerPrepollGameStoreBcOfs(), 0x265bc);



  assert.equal(managerPrepollGameStoreB8Bits(), 0x3f800000);



  assert.equal(managerPrepollGameStoreBcValue(), 8);







  // history==1 tail: log 0xa112c0(1, 0xb7d234 "Cutscene End") + Crossfade



  assert.equal(managerPrepollLogVa(), 0x00a112c0);



  assert.equal(managerPrepollLogLevel(), 1);



  assert.equal(managerPrepollLogMsgVa(), 0x00b7d234);



  assert.equal(managerPrepollHostHVa(), 0x007e1e70);



  assert.equal(managerPrepollCrossfadeRecvOfs(), 0x29fbc);



  assert.equal(managerPrepollCrossfadeMusicId(), 0x3f);



  assert.equal(managerPrepollCrossfadeRateBits(), 0x3da3d70a);







  // host edge VAs



  assert.equal(managerPrepollHostAVa(), 0x00959720);



  assert.equal(managerPrepollHostBVa(), 0x00959d00);



  assert.equal(managerPrepollHostCVa(), 0x00959670);



  assert.equal(managerPrepollHostDVa(), 0x0095e7c0);



  assert.equal(managerPrepollHostEVa(), 0x00921ce0);



  assert.equal(managerPrepollHostFVa(), 0x00954b40);



  assert.equal(managerPrepollHostGVa(), 0x00a0f550);



  assert.equal(managerPrepollHostGArg(), 0xff000000);



});







test("JS oracle: playerscan depth FUN_00954b40 (ABI v26)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 26);







  // 0x00954b85/8b: count = SAR32(end-begin)>>3 (8-byte {ptr,ctrl} pairs).



  assert.equal(managerPlayerscanCountFromBounds(0, 0), 0);



  assert.equal(managerPlayerscanCountFromBounds(8, 0), 1);



  assert.equal(managerPlayerscanCountFromBounds(0x50, 0), 10);



  assert.equal(managerPlayerscanCountFromBounds(7, 0), 0);



  assert.equal(managerPlayerscanCountFromBounds(0x100, 0x80), 16);



  assert.equal(managerPlayerscanCountFromBounds(0, 8), -1); // wrapped



  assert.equal(managerPlayerscanCountFromBounds(0xffffffff, 0), -1);



  assert.equal(managerPlayerscanCountFromBounds(0x80000000, 0), -0x10000000); // SAR: -2^28



  assert.equal(managerPlayerscanCountFromBounds(-8, 0), -1);



  assert.equal(managerPlayerscanCountFromBounds(-1, -1), 0);







  // 0x00a202ae lea eax,[ecx+edx*8] -- slot address, 32-bit wrap.



  assert.equal(managerPlayerscanElementPtr(0, 0), 0);



  assert.equal(managerPlayerscanElementPtr(0x100, 0), 0x100);



  assert.equal(managerPlayerscanElementPtr(0x100, 1), 0x108);



  // 32-bit address wrap: 0x100 + 0x20000000*8 == 0x100 (mod 2^32)



  assert.equal(managerPlayerscanElementPtr(0x100, 0x20000000), 0x100);



  assert.equal(managerPlayerscanElementPtr(0xfffffff8, 1), 0);



  assert.equal(managerPlayerscanElementPtr(0xffffffff, 0x20000000), 0xffffffff);







  // 0x00954bde cmp eax,-1 / jne -- FULL dword compare.



  assert.equal(managerPlayerscanMatchNeeded(0), true);



  assert.equal(managerPlayerscanMatchNeeded(1), true);



  assert.equal(managerPlayerscanMatchNeeded(-1), false);



  assert.equal(managerPlayerscanMatchNeeded(0xffffffff), false);



  assert.equal(managerPlayerscanMatchNeeded(0x7fffffff), true);



  assert.equal(managerPlayerscanMatchNeeded(0x80000000), true);







  // 0x00954c2c cmp dword [ebx+8],2 -- full dword state test.



  assert.equal(managerPlayerscanState2Gate(2), true);



  assert.equal(managerPlayerscanState2Gate(0), false);



  assert.equal(managerPlayerscanState2Gate(3), false);



  assert.equal(managerPlayerscanState2Gate(0x10000002), false);



  assert.equal(managerPlayerscanState2Gate(-1), false);







  // 0x00954c44 SAR32(end-begin)>>2 -- g_Game player-pointer vector.



  assert.equal(managerPlayerscanPlayerCountFromBounds(0, 0), 0);



  assert.equal(managerPlayerscanPlayerCountFromBounds(4, 0), 1);



  assert.equal(managerPlayerscanPlayerCountFromBounds(0x40, 0), 16);



  assert.equal(managerPlayerscanPlayerCountFromBounds(0, 4), -1);



  assert.equal(managerPlayerscanPlayerCountFromBounds(0xffffffff, 0), -1);



  assert.equal(managerPlayerscanPlayerCountFromBounds(0x80000000, 0), -0x20000000); // SAR: -2^29







  // 0x00954c49 test eax,eax / jne -- full dword zero test.



  assert.equal(managerPlayerscanLogNeeded(0), true);



  assert.equal(managerPlayerscanLogNeeded(1), false);



  assert.equal(managerPlayerscanLogNeeded(-1), false);



  assert.equal(managerPlayerscanLogNeeded(0x100), false);



  assert.equal(managerPlayerscanLogNeeded(0x80000000), false);







  // 0x00954bea test ecx,ecx / je -- full dword.



  assert.equal(managerPlayerscanReleaseGate(0), false);



  assert.equal(managerPlayerscanReleaseGate(1), true);



  assert.equal(managerPlayerscanReleaseGate(0xffffffff), true);



  assert.equal(managerPlayerscanReleaseGate(0x100), true);







  // 0x00954bf8 test al,al (BYTE) + 0x00954c01 test eax,eax (dword).



  assert.equal(managerPlayerscanCallbackNeeded(0, 0), false);



  assert.equal(managerPlayerscanCallbackNeeded(1, 0), false);



  assert.equal(managerPlayerscanCallbackNeeded(0, 1), false);



  assert.equal(managerPlayerscanCallbackNeeded(1, 1), true);



  assert.equal(managerPlayerscanCallbackNeeded(0x100, 1), false); // al==0



  assert.equal(managerPlayerscanCallbackNeeded(0x1ff, 1), true);  // al!=0



  assert.equal(managerPlayerscanCallbackNeeded(0xff, 0xffffffff), true);



  assert.equal(managerPlayerscanCallbackNeeded(0xffffffff, 0), false);







  // constants



  assert.equal(managerPlayerscanElementCtrlOfs(), 0xc);



  assert.equal(managerPlayerscanManagerStoreOfs(), 0x4abd4);



  assert.equal(managerPlayerscanPlayerListBeginOfs(), 0x1baa8);



  assert.equal(managerPlayerscanPlayerListEndOfs(), 0x1baac);



  assert.equal(managerPlayerscanVectorThisVa(), 0xc57b18);



  assert.equal(managerPlayerscanVectorBeginVa(), 0xc57b20);



  assert.equal(managerPlayerscanVectorEndVa(), 0xc57b24);



  assert.equal(managerPlayerscanVectorLockVa(), 0xc57b2c);



  assert.equal(managerPlayerscanVectorStride(), 8);



  assert.equal(managerPlayerscanPlayerListStride(), 4);



  assert.equal(managerPlayerscanLastIndexGlobalVa(), 0xbf9444);



  assert.equal(managerPlayerscanReleaseCallbackGlobalVa(), 0xc7e814);



  assert.equal(managerPlayerscanManagerGlobalVa(), 0xc7169c);



  assert.equal(managerPlayerscanGameGlobalVa(), 0xc71678);



  assert.equal(managerPlayerscanAccessorVa(), 0xa20240);



  assert.equal(managerPlayerscanSetControllerVa(), 0x7a6450);



  assert.equal(managerPlayerscanSetControllerArg(), 1);



  assert.equal(managerPlayerscanMatchVcallSlot(), 0x3c);



  assert.equal(managerPlayerscanMatchVcallArg(), 0);



  assert.equal(managerPlayerscanMatchSentinel(), 0xffffffff);



  assert.equal(managerPlayerscanReleaseVcallSlot(), 0xc);



  assert.equal(managerPlayerscanLogLevel(), 0x10);



  assert.equal(managerPlayerscanLogMsgVa(), 0xb7e6bc);



  assert.equal(managerPlayerscanState2Value(), 2);







  // cross-field laws (v25 shell vs v26 depth)



  assert.equal(managerPlayerscanState2Value(), 2);



  // the state field read at [0xc7169c]+8 in FUN_00954b40 is the SAME field



  // the shell's state machine uses (ISAAC_PREPOLL_STATE_OFS == 0x8).



  assert.equal(managerPrepollStateOfs(), 0x8);



  // the Manager global is the one the v25 crossfade tail reads



  assert.equal(managerPlayerscanManagerGlobalVa(), 0xc7169c);



  // g_Game is the same global the v25 G4 store block dereferences



  assert.equal(managerPlayerscanGameGlobalVa(), 0xc71678);



});







test("JS oracle: a0f550 packed-ARGB complete body (ABI v27)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 27);







  // Byte extracts: PE movzx / shr. Wide values unmasked (uint8 defect class).



  assert.equal(managerA0f550R(0), 0);



  assert.equal(managerA0f550G(0), 0);



  assert.equal(managerA0f550B(0), 0);



  assert.equal(managerA0f550A(0), 0);



  assert.equal(managerA0f550R(0x00aabbcc), 0xaa);



  assert.equal(managerA0f550G(0x00aabbcc), 0xbb);



  assert.equal(managerA0f550B(0x00aabbcc), 0xcc);



  assert.equal(managerA0f550A(0x00aabbcc), 0);



  assert.equal(managerA0f550R(0xff000000), 0);



  assert.equal(managerA0f550G(0xff000000), 0);



  assert.equal(managerA0f550B(0xff000000), 0);



  assert.equal(managerA0f550A(0xff000000), 0xff); // G4 arm arg



  assert.equal(managerA0f550R(0xffffffff), 0xff);



  assert.equal(managerA0f550G(0xffffffff), 0xff);



  assert.equal(managerA0f550B(0xffffffff), 0xff);



  assert.equal(managerA0f550A(0xffffffff), 0xff);



  // High bits above the packed dword wrap via >>>0; 0x1_00aabbcc -> 0x00aabbcc.



  assert.equal(managerA0f550R(0x100aabbcc), 0xaa);



  assert.equal(managerA0f550B(0x100), 0);         // low byte 0



  assert.equal(managerA0f550B(0x1ff), 0xff);



  assert.equal(managerA0f550G(0x10000), 0);



  assert.equal(managerA0f550G(0x1ff00), 0xff);







  // channel_f32: byte gate narrows in the body. 0x100 -> 0.0, 0x1ff -> 1.0



  assert.ok(Object.is(managerA0f550ChannelF32(0), 0));



  assert.ok(Object.is(managerA0f550ChannelF32(0xff), 1));



  assert.ok(Object.is(managerA0f550ChannelF32(0x100), 0));   // low byte 0



  assert.ok(Object.is(managerA0f550ChannelF32(0x1ff), 1));   // low byte 0xff



  assert.ok(Object.is(managerA0f550ChannelF32(0xffffffff), 1));



  assert.equal(



    managerA0f550ChannelF32(0x80),



    Math.fround(Math.fround(0x80) / Math.fround(255)),



  );







  // G4 arm: arg 0xff000000 -> f0/f1/f2 = 0, f3 = 1, tail = 0



  assert.ok(Object.is(managerA0f550F0(0xff000000), 0));



  assert.ok(Object.is(managerA0f550F1(0xff000000), 0));



  assert.ok(Object.is(managerA0f550F2(0xff000000), 0));



  assert.ok(Object.is(managerA0f550F3(0xff000000), 1));



  assert.equal(managerA0f550TailStore(), 0);







  // Opaque white (-1 / 0xffffffff) -> 1,1,1,1



  assert.ok(Object.is(managerA0f550F0(0xffffffff), 1));



  assert.ok(Object.is(managerA0f550F1(0xffffffff), 1));



  assert.ok(Object.is(managerA0f550F2(0xffffffff), 1));



  assert.ok(Object.is(managerA0f550F3(0xffffffff), 1));







  // Mixed packed 0x80ff4010 -> A=0x80 G=0x40? wait ARGB: A=0x80 R=0xff G=0x40 B=0x10



  assert.ok(Object.is(managerA0f550F0(0x80ff4010), managerA0f550ChannelF32(0xff)));



  assert.ok(Object.is(managerA0f550F1(0x80ff4010), managerA0f550ChannelF32(0x40)));



  assert.ok(Object.is(managerA0f550F2(0x80ff4010), managerA0f550ChannelF32(0x10)));



  assert.ok(Object.is(managerA0f550F3(0x80ff4010), managerA0f550ChannelF32(0x80)));







  // Offsets / DAT / next VA



  assert.equal(managerA0f550F0Ofs(), 0);



  assert.equal(managerA0f550F1Ofs(), 4);



  assert.equal(managerA0f550F2Ofs(), 8);



  assert.equal(managerA0f550F3Ofs(), 0xc);



  assert.equal(managerA0f550TailOfs(), 0x10);



  assert.equal(managerA0f550DenomBits(), 0x437f0000);



  assert.equal(managerA0f550DenomVa(), 0x00baaae4);



  assert.equal(managerA0f550SignedTableVa(), 0x00bacb00);



  assert.equal(managerA0f550Va(), 0x00a0f550);



  assert.equal(managerA0f550RetVa(), 0x00a0f601);



  assert.equal(managerA0f550BodyBytes(), 0xb1);



  assert.equal(managerA0f550NextVa(), 0x00959d00);







  // Cross-field: same VA/arg the v25 G4 arm already pinned



  assert.equal(managerA0f550Va(), managerPrepollHostGVa());



  assert.equal(managerPrepollHostGArg(), 0xff000000);



});







test("JS oracle: 959d00 host B decision table (ABI v28)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 28);







  // 0x00959d29: byte [this+0x4b288] != 0. Wide values unmasked.



  assert.equal(manager959d00BodyNeeded(0), false);



  assert.equal(manager959d00BodyNeeded(1), true);



  assert.equal(manager959d00BodyNeeded(0xff), true);



  assert.equal(manager959d00BodyNeeded(0x100), false); // low byte 0



  assert.equal(manager959d00BodyNeeded(0x1ff), true);  // low byte 0xff



  assert.equal(manager959d00BodyNeeded(0xffffffff), true);







  // 0x00959d36: FULL dword state == 2



  assert.equal(manager959d00State2Needed(2), true);



  assert.equal(manager959d00State2Needed(0), false);



  assert.equal(manager959d00State2Needed(1), false);



  assert.equal(manager959d00State2Needed(3), false);



  assert.equal(manager959d00State2Needed(-1), false);



  assert.equal(manager959d00State2Needed(0x100000002), true); // asI32 wrap







  // 0x00959d42/48: queue begin != end



  assert.equal(manager959d00QueueNonempty(0, 0), false);



  assert.equal(manager959d00QueueNonempty(1, 1), false);



  assert.equal(manager959d00QueueNonempty(0, 1), true);



  assert.equal(manager959d00QueueNonempty(0xffffffff, 0), true);



  assert.equal(manager959d00QueueNonempty(0xffffffff, 0xffffffff), false);







  // Combined island: flag && state==2 && queue nonempty



  assert.equal(manager959d00State2IslandNeeded(1, 2, 0, 4), true);



  assert.equal(manager959d00State2IslandNeeded(0, 2, 0, 4), false);



  assert.equal(manager959d00State2IslandNeeded(1, 1, 0, 4), false);



  assert.equal(manager959d00State2IslandNeeded(1, 2, 4, 4), false);



  assert.equal(manager959d00State2IslandNeeded(0x100, 2, 0, 4), false);







  // UNSIGNED jbe vs 0 on +0x26630. 0xffffffff / 0x80000000 FAIL.



  assert.equal(manager959d00QuietArg(0, 0), true);



  assert.equal(manager959d00QuietArg(0, 1), false);



  assert.equal(manager959d00QuietArg(0, 0xffffffff), false);



  assert.equal(manager959d00QuietArg(0, 0x80000000), false);



  assert.equal(manager959d00QuietArg(0, 0x7fffffff), false);



  assert.equal(manager959d00QuietArg(1, 0), false);



  assert.equal(manager959d00QuietArg(0xffffffff, 0), false);



  assert.equal(manager959d00QuietArg(0x100, 0), false);







  // 0x00959d8c: ext != 0x11



  assert.equal(manager959d00Host907690Needed(0x11), false);



  assert.equal(manager959d00Host907690Needed(0), true);



  assert.equal(manager959d00Host907690Needed(0x10), true);



  assert.equal(manager959d00Host907690Needed(0x12), true);



  assert.equal(manager959d00Host907690Needed(0xffffffff), true);







  // 0x00959dbc: menu ptr == 0 -> alloc



  assert.equal(manager959d00MenuAllocNeeded(0), true);



  assert.equal(manager959d00MenuAllocNeeded(1), false);



  assert.equal(manager959d00MenuAllocNeeded(0xffffffff), false);



  assert.equal(manager959d00MenuAllocNeeded(0x100), false);







  // 0x00959dd7: alloc != 0 -> ctor



  assert.equal(manager959d00MenuCtorNeeded(0), false);



  assert.equal(manager959d00MenuCtorNeeded(1), true);



  assert.equal(manager959d00MenuCtorNeeded(0xffffffff), true);







  // Offsets / DAT / next VA



  assert.equal(manager959d00FlagOfs(), 0x4b288);



  assert.equal(manager959d00StateOfs(), 8);



  assert.equal(manager959d00State2Value(), 2);



  assert.equal(manager959d00QueueBeginOfs(), 0x4b3d8);



  assert.equal(manager959d00QueueEndOfs(), 0x4b3dc);



  assert.equal(manager959d00GameModeOfs(), 0x26584);



  assert.equal(manager959d00Game26630Ofs(), 0x26630);



  assert.equal(manager959d00ExtOfs(), 0x4b28c);



  assert.equal(manager959d00ExtSkip(), 0x11);



  assert.equal(manager959d00CoreOfs(), 0x4b290);



  assert.equal(manager959d00F0Ofs(), 0x4b294);



  assert.equal(manager959d00F1Ofs(), 0x4b298);



  assert.equal(manager959d00F2Ofs(), 0x4b29c);



  assert.equal(manager959d00DwOfs(), 0x4b2a0);



  assert.equal(manager959d00MenuGlobalVa(), 0x00c72a20);



  assert.equal(manager959d00MenuAllocSize(), 0xf930);



  assert.equal(manager959d00MenuStoreCoreOfs(), 0x1c);



  assert.equal(manager959d00MenuStoreF0Ofs(), 0x20);



  assert.equal(manager959d00MenuStoreF1Ofs(), 0x24);



  assert.equal(manager959d00MenuStoreF2Ofs(), 0x28);



  assert.equal(manager959d00MenuStoreDwOfs(), 0x2c);



  assert.equal(manager959d00MenuStoreFlagOfs(), 0x14);



  assert.equal(manager959d00MenuStoreFlagValue(), 1);



  assert.equal(manager959d00StateAfter(), 1);



  assert.equal(manager959d00FlagClear(), 0);



  assert.equal(manager959d00ManagerGlobalVa(), 0x00c7169c);



  assert.equal(manager959d00GameGlobalVa(), 0x00c71678);



  assert.equal(manager959d00Host90cd10Va(), 0x0090cd10);



  assert.equal(manager959d00Host90a8a0Va(), 0x0090a8a0);



  assert.equal(manager959d00Host907690Va(), 0x00907690);



  assert.equal(manager959d00Host959670Va(), 0x00959670);



  assert.equal(manager959d00Host91c770Va(), 0x0091c770);



  assert.equal(manager959d00HostA0f4c0Va(), 0x00a0f4c0);



  assert.equal(manager959d00Host986450Va(), 0x00986450);



  assert.equal(manager959d00Host987450Va(), 0x00987450);



  assert.equal(manager959d00Host98aa30Va(), 0x0098aa30);



  assert.equal(manager959d00Va(), 0x00959d00);



  assert.equal(manager959d00RetVa(), 0x00959e66);



  assert.equal(manager959d00BodyBytes(), 0x166);



  assert.equal(manager959d00Sites(), 2);



  assert.equal(manager959d00NextVa(), 0x00959720);







  // Cross-field: same pins the earlier ABIs already own



  assert.equal(manager959d00Va(), managerPrepollHostBVa());



  assert.equal(manager959d00FlagOfs(), managerPrepollCopyFlagOfs());



  assert.equal(manager959d00StateOfs(), managerPrepollStateOfs());



  assert.equal(manager959d00State2Value(), managerPlayerscanState2Value());



  assert.equal(manager959d00QueueBeginOfs(), 0x4b3d8);



  assert.equal(manager959d00ExtOfs(), managerPrepollCopyDstExtOfs());



  assert.equal(manager959d00ExtSkip(), STATE1_MODE_MATCH);



  assert.equal(manager959d00CoreOfs(), managerPrepollCopyDstCoreOfs());



  assert.equal(manager959d00DwOfs(), managerPrepollCopyDstDwordOfs());



  assert.equal(manager959d00MenuGlobalVa(), STATE1_MODE_GLOBAL);



  assert.equal(manager959d00Host959670Va(), managerPrepollHostCVa());



  assert.equal(manager959d00ManagerGlobalVa(), managerPlayerscanManagerGlobalVa());



  assert.equal(manager959d00GameGlobalVa(), managerPlayerscanGameGlobalVa());







  // Mutant: signed jle on 0x26630 would take 0xffffffff. Unsigned jbe must not.



  assert.equal(manager959d00QuietArg(0, 0xffffffff), false);



  assert.equal(manager959d00QuietArg(0, 0x80000000), false);



});







test("JS oracle: 959720 host A entry/join table (ABI v29)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 29);







  // 0x00959756: byte [this+0x4b130] != 0. Wide values unmasked.



  assert.equal(manager959720BodyNeeded(0), false);



  assert.equal(manager959720BodyNeeded(1), true);



  assert.equal(manager959720BodyNeeded(0xff), true);



  assert.equal(manager959720BodyNeeded(0x100), false);



  assert.equal(manager959720BodyNeeded(0x1ff), true);



  assert.equal(manager959720BodyNeeded(0xffffffff), true);







  // 0x00959763: byte [this+0x4b274]



  assert.equal(manager959720ProbeNeeded(0), false);



  assert.equal(manager959720ProbeNeeded(1), true);



  assert.equal(manager959720ProbeNeeded(0x100), false);



  assert.equal(manager959720ProbeNeeded(0x1ff), true);







  // 0x00959777: test al,al



  assert.equal(manager959720ProbeOk(0), false);



  assert.equal(manager959720ProbeOk(1), true);



  assert.equal(manager959720ProbeOk(0x100), false);



  assert.equal(manager959720ProbeOk(0x1ff), true);







  // Combined continue: body && (!probe || ok)



  assert.equal(manager959720BodyContinue(0, 0, 0), false);



  assert.equal(manager959720BodyContinue(1, 0, 0), true);



  assert.equal(manager959720BodyContinue(1, 1, 0), false);



  assert.equal(manager959720BodyContinue(1, 1, 1), true);



  assert.equal(manager959720BodyContinue(0x100, 0, 0), false);



  assert.equal(manager959720BodyContinue(1, 0x100, 0), true);







  // Entry parity: bit0 of FULL dword (NOT peSignedMod2Eq1).



  assert.equal(manager959720ParityIncNeeded(0), false);



  assert.equal(manager959720ParityIncNeeded(1), true);



  assert.equal(manager959720ParityIncNeeded(2), false);



  assert.equal(manager959720ParityIncNeeded(3), true);



  assert.equal(manager959720ParityIncNeeded(0x80000000), false);



  assert.equal(manager959720ParityIncNeeded(0x80000001), true);



  assert.equal(manager959720ParityIncNeeded(0xffffffff), true);



  // Mutant: peSignedMod2Eq1(-1 / 0x80000001) is FALSE; bit0 is TRUE.



  assert.equal(peSignedMod2Eq1(-1), false);



  assert.equal(manager959720ParityIncNeeded(0xffffffff), true);



  assert.equal(peSignedMod2Eq1(0x80000001), false);



  assert.equal(manager959720ParityIncNeeded(0x80000001), true);







  assert.equal(manager959720ParityNext(0), 1);



  assert.equal(manager959720ParityNext(0xffffffff), 0);



  assert.equal(manager959720ParityNext(7), managerEarlyCounterNext(7) >>> 0);







  // FULL dword game ptr / ctor



  assert.equal(manager959720GameAllocNeeded(0), true);



  assert.equal(manager959720GameAllocNeeded(1), false);



  assert.equal(manager959720GameAllocNeeded(0xffffffff), false);



  assert.equal(manager959720GameCtorNeeded(0), false);



  assert.equal(manager959720GameCtorNeeded(1), true);



  assert.equal(manager959720GameCtorNeeded(0xffffffff), true);







  assert.equal(manager959720QueueNonempty(0, 0), false);



  assert.equal(manager959720QueueNonempty(0, 1), true);



  assert.equal(manager959720QueueNonempty(0xffffffff, 0xffffffff), false);







  // 6eef20: flag274 && ptr && dword==0



  assert.equal(manager959720Host6eef20Needed(1, 1, 0), true);



  assert.equal(manager959720Host6eef20Needed(0, 1, 0), false);



  assert.equal(manager959720Host6eef20Needed(1, 0, 0), false);



  assert.equal(manager959720Host6eef20Needed(1, 1, 1), false);



  assert.equal(manager959720Host6eef20Needed(0x100, 1, 0), false);



  assert.equal(manager959720Host6eef20Needed(0x1ff, 1, 0), true);







  // 923450: skip when both bytes set



  assert.equal(manager959720Host923450Needed(0, 0), true);



  assert.equal(manager959720Host923450Needed(1, 0), true);



  assert.equal(manager959720Host923450Needed(0, 1), true);



  assert.equal(manager959720Host923450Needed(1, 1), false);



  assert.equal(manager959720Host923450Needed(0x100, 1), true);



  assert.equal(manager959720Host923450Needed(1, 0x100), true);







  // Join arm. UNSIGNED 4b1c0 > 0 takes daily.



  assert.equal(manager959720JoinArm(1, 1, 0, 0, 0), A959720_ARM_SEED_THEN);



  assert.equal(manager959720JoinArm(1, 0, 0, 0, 0), A959720_ARM_HOST_6F5850);



  assert.equal(manager959720JoinArm(0, 1, 0, 0, 0), A959720_ARM_SEED_ELSE);



  assert.equal(manager959720JoinArm(0, 0, 1, 0, 0), A959720_ARM_4B132);



  assert.equal(manager959720JoinArm(0, 0, 0, 1, 0), A959720_ARM_DAILY);



  assert.equal(manager959720JoinArm(0, 0, 0, 0xffffffff, 0), A959720_ARM_DAILY);



  assert.equal(manager959720JoinArm(0, 0, 0, 0x80000000, 0), A959720_ARM_DAILY);



  assert.equal(manager959720JoinArm(0, 0, 0, 0, 1), A959720_ARM_DEBUG);



  assert.equal(manager959720JoinArm(0, 0, 0, 0, 0), A959720_ARM_START);



  assert.equal(manager959720JoinArm(0x100, 0, 0, 0, 0), A959720_ARM_START);



  assert.equal(manager959720JoinArm(0, 0, 0x100, 0, 0), A959720_ARM_START);



  // 4b274&&4b131 wins over later flags



  assert.equal(manager959720JoinArm(1, 1, 1, 1, 1), A959720_ARM_SEED_THEN);







  // Join parity IS peSignedMod2Eq1 (mutant: bit0 would take -1 / 0x80000001)



  assert.equal(manager959720JoinParityIncNeeded(1), true);



  assert.equal(manager959720JoinParityIncNeeded(2), false);



  assert.equal(manager959720JoinParityIncNeeded(-1), false);



  assert.equal(manager959720JoinParityIncNeeded(0x80000001), false);



  assert.equal(manager959720JoinParityIncNeeded(0xffffffff), false);



  assert.equal(manager959720JoinParityIncNeeded(7), true);







  // Offsets / DAT / next VA



  assert.equal(manager959720FlagOfs(), 0x4b130);



  assert.equal(manager959720ProbeOfs(), 0x4b274);



  assert.equal(manager959720ParityOfs(), 0x4abbc);



  assert.equal(manager959720QueueBeginOfs(), 0x4b3d8);



  assert.equal(manager959720QueueEndOfs(), 0x4b3dc);



  assert.equal(manager959720StateOfs(), 8);



  assert.equal(manager959720StateAfter(), 2);



  assert.equal(manager959720Flag4b131Ofs(), 0x4b131);



  assert.equal(manager959720Flag4b132Ofs(), 0x4b132);



  assert.equal(manager959720Ptr4b140Ofs(), 0x4b140);



  assert.equal(manager959720Dword4b3e4Ofs(), 0x4b3e4);



  assert.equal(manager959720Recv923450Ofs(), 0x21628);



  assert.equal(manager959720Dword4b1c0Ofs(), 0x4b1c0);



  assert.equal(manager959720Flag4b19cOfs(), 0x4b19c);



  assert.equal(manager959720Word4b284Ofs(), 0x4b284);



  assert.equal(manager959720Word4b284Value(), 1);



  assert.equal(manager959720FlagClear(), 0);



  assert.equal(manager959720GameAllocSize(), 0x68e88);



  assert.equal(manager959720ManagerGlobalVa(), 0x00c7169c);



  assert.equal(manager959720GameGlobalVa(), 0x00c71678);



  assert.equal(manager959720Host90c400Va(), 0x0090c400);



  assert.equal(manager959720Host959670Va(), 0x00959670);



  assert.equal(manager959720HostA0f4c0Va(), 0x00a0f4c0);



  assert.equal(manager959720Host6f1020Va(), 0x006f1020);



  assert.equal(manager959720Host6f4740Va(), 0x006f4740);



  assert.equal(manager959720Host90a8a0Va(), 0x0090a8a0);



  assert.equal(manager959720Host6eef20Va(), 0x006eef20);



  assert.equal(manager959720Host91c770Va(), 0x0091c770);



  assert.equal(manager959720Host923450Va(), 0x00923450);



  assert.equal(manager959720Host6f6dd0Va(), 0x006f6dd0);



  assert.equal(manager959720Host6f7750Va(), 0x006f7750);



  assert.equal(manager959720Host6f5320Va(), 0x006f5320);



  assert.equal(manager959720ArmSeedThen(), 1);



  assert.equal(manager959720ArmHost6f5850(), 2);



  assert.equal(manager959720ArmSeedElse(), 3);



  assert.equal(manager959720Arm4b132(), 4);



  assert.equal(manager959720ArmDaily(), 5);



  assert.equal(manager959720ArmDebug(), 6);



  assert.equal(manager959720ArmStart(), 7);



  assert.equal(manager959720Va(), 0x00959720);



  assert.equal(manager959720RetVa(), 0x00959cf8);



  assert.equal(manager959720BodyBytes(), 0x5d8);



  assert.equal(manager959720Sites(), 1);



  assert.equal(manager959720SiteVa(), 0x00954d5e);



  assert.equal(manager959720NextVa(), 0x00959670);







  // Cross-field: same pins the earlier ABIs already own



  assert.equal(manager959720Va(), managerPrepollHostAVa());



  assert.equal(manager959720FlagOfs(), MANAGER_STATE2_OFF_BLOCK_FLAG);



  assert.equal(manager959720ParityOfs(), MANAGER_SHELL_OFF_COUNTER);



  assert.equal(manager959720QueueBeginOfs(), manager959d00QueueBeginOfs());



  assert.equal(manager959720StateOfs(), managerPrepollStateOfs());



  assert.equal(manager959720Recv923450Ofs(), managerPrepollState5RecvOfs());



  assert.equal(manager959720Host959670Va(), managerPrepollHostCVa());



  assert.equal(manager959720Host959670Va(), manager959d00Host959670Va());



  assert.equal(manager959720ManagerGlobalVa(), manager959d00ManagerGlobalVa());



  assert.equal(manager959720GameGlobalVa(), manager959d00GameGlobalVa());



  assert.equal(manager959720HostA0f4c0Va(), manager959d00HostA0f4c0Va());



  assert.equal(manager959720Host91c770Va(), manager959d00Host91c770Va());



  assert.equal(manager959720Host90a8a0Va(), manager959d00Host90a8a0Va());







  // Mutant: signed jle on 4b1c0 would SKIP 0xffffffff. Unsigned must take daily.



  assert.equal(manager959720JoinArm(0, 0, 0, 0xffffffff, 0), A959720_ARM_DAILY);



  assert.equal(manager959720JoinArm(0, 0, 0, 0x80000000, 0), A959720_ARM_DAILY);



});







test("JS oracle: 959670 cleanup_current_state islands (ABI v30)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 30);







  // 0x00959673: sub/sub cascade. FULL dword asI32. 0/1/2/-1 plus wide.



  assert.equal(manager959670StateId(0), 0);



  assert.equal(manager959670StateId(1), 1);



  assert.equal(manager959670StateId(2), 2);



  assert.equal(manager959670StateId(-1), 0);



  assert.equal(manager959670StateId(0xffffffff), 0);



  assert.equal(manager959670StateId(3), 0);



  assert.equal(manager959670StateId(0x100), 0);







  assert.equal(manager959670State1Needed(0), false);



  assert.equal(manager959670State1Needed(1), true);



  assert.equal(manager959670State1Needed(2), false);



  assert.equal(manager959670State1Needed(-1), false);



  assert.equal(manager959670State1Needed(0xffffffff), false);







  assert.equal(manager959670State2Needed(0), false);



  assert.equal(manager959670State2Needed(1), false);



  assert.equal(manager959670State2Needed(2), true);



  assert.equal(manager959670State2Needed(-1), false);



  assert.equal(manager959670State2Needed(0xffffffff), false);







  // FULL dword present tests.



  assert.equal(manager959670GamePresent(0), false);



  assert.equal(manager959670GamePresent(1), true);



  assert.equal(manager959670GamePresent(0xffffffff), true);



  assert.equal(manager959670MenuPresent(0), false);



  assert.equal(manager959670MenuPresent(1), true);



  assert.equal(manager959670MenuPresent(0xffffffff), true);







  // Game body: state==2 AND game!=0. Empty g_Game still later calls 0x429170.



  assert.equal(manager959670GameBodyNeeded(2, 1), true);



  assert.equal(manager959670GameBodyNeeded(2, 0), false);



  assert.equal(manager959670GameBodyNeeded(1, 1), false);



  assert.equal(manager959670GameBodyNeeded(0, 1), false);



  assert.equal(manager959670GameBodyNeeded(2, 0xffffffff), true);







  // Menu body: state==1 AND menu!=0. Empty-menu is NOT a 0x4b3d8 queue.



  assert.equal(manager959670MenuBodyNeeded(1, 1), true);



  assert.equal(manager959670MenuBodyNeeded(1, 0), false);



  assert.equal(manager959670MenuBodyNeeded(2, 1), false);



  assert.equal(manager959670MenuBodyNeeded(0, 1), false);



  assert.equal(manager959670MenuBodyNeeded(1, 0xffffffff), true);







  // 0x0095968e: movzx byte. RAW uint32, low byte. 0x100/0xffffffff unmasked.



  assert.equal(manager959670ExitSaveArg(0), 0);



  assert.equal(manager959670ExitSaveArg(1), 1);



  assert.equal(manager959670ExitSaveArg(0xff), 0xff);



  assert.equal(manager959670ExitSaveArg(0x100), 0);



  assert.equal(manager959670ExitSaveArg(0x1ff), 0xff);



  assert.equal(manager959670ExitSaveArg(0xffffffff), 0xff);







  assert.equal(manager959670Flag4b285Clear(), 0);







  // ucomiss vs 1.0f: skip ONLY ordered-equal. NaN stores.



  assert.equal(manager959670ValueStoreNeeded(1.0), false);



  assert.equal(manager959670ValueStoreNeeded(0.0), true);



  assert.equal(manager959670ValueStoreNeeded(-0.0), true);



  assert.equal(manager959670ValueStoreNeeded(Number.NaN), true);



  assert.equal(manager959670ValueStoreNeeded(Infinity), true);



  assert.equal(manager959670ValueStoreNeeded(-Infinity), true);



  assert.equal(manager959670ValueStoreNeeded(0.9999999), true);



  // Mutant: invert (NaN skip) would return false here.



  assert.equal(manager959670ValueStoreNeeded(Number.NaN), true);







  // 0x009596dc: add 0x26614 even when game==0. 32-bit wrap.



  assert.equal(manager959670Host429170Recv(0), 0x26614);



  assert.equal(manager959670Host429170Recv(1), 0x26615);



  assert.equal(manager959670Host429170Recv(0xffffffff), 0x26613);



  // Mutant: signed add on 0x80000000.



  assert.equal(manager959670Host429170Recv(0x80000000), (0x80000000 + 0x26614) >>> 0);







  // Offsets / DAT / trap / next VA



  assert.equal(manager959670StateOfs(), 8);



  assert.equal(manager959670StateOther(), 0);



  assert.equal(manager959670StateMenu(), 1);



  assert.equal(manager959670StateGame(), 2);



  assert.equal(manager959670Flag4b284Ofs(), 0x4b284);



  assert.equal(manager959670Flag4b285Ofs(), 0x4b285);



  assert.equal(manager959670RecvOfs(), 0x2a324);



  assert.equal(manager959670ValueOfs(), 0x2a334);



  assert.equal(manager959670StepOfs(), 0x2a338);



  assert.equal(manager959670ValueStoreBits(), 0x3f800000);



  assert.equal(manager959670StepStoreBits(), 0x3ba3d70a);



  assert.equal(manager959670TargetVa(), 0x00baa454);



  assert.equal(manager959670GameGlobalVa(), 0x00c71678);



  assert.equal(manager959670MenuGlobalVa(), 0x00c72a20);



  assert.equal(manager959670MenuFreeSize(), 0xf930);



  assert.equal(manager959670MenuClear(), 0);



  assert.equal(manager959670Host429170Ofs(), 0x26614);



  assert.equal(manager959670Host6fa0c0Va(), 0x006fa0c0);



  assert.equal(manager959670Host92e430Va(), 0x0092e430);



  assert.equal(manager959670Host429170Va(), 0x00429170);



  assert.equal(manager959670Host986f30Va(), 0x00986f30);



  assert.equal(manager959670HostAef15cVa(), 0x00aef15c);



  assert.equal(manager959670EpilogVa(), 0x0040e910);



  assert.equal(manager959670ManagerGlobalVa(), 0x00c7169c);



  assert.equal(manager959670Va(), 0x00959670);



  assert.equal(manager959670Int3Va(), 0x0095971c);



  assert.equal(manager959670BodyBytes(), 0xac);



  assert.equal(manager959670FirstRetTrapBytes(), 0x688);



  assert.equal(manager959670Sites(), 3);



  assert.equal(manager959670Site0Va(), 0x00954d85);



  assert.equal(manager959670Site1Va(), 0x00959792);



  assert.equal(manager959670Site2Va(), 0x00959da5);



  assert.equal(manager959670NextVa(), 0x0095e7c0);







  // Cross-field: same pins earlier ABIs already own



  assert.equal(manager959670Va(), managerPrepollHostCVa());



  assert.equal(manager959670Va(), manager959720Host959670Va());



  assert.equal(manager959670GameGlobalVa(), manager959720GameGlobalVa());



  assert.equal(manager959670ManagerGlobalVa(), manager959720ManagerGlobalVa());



  assert.equal(manager959670MenuGlobalVa(), manager959d00MenuGlobalVa());



  assert.equal(manager959670MenuFreeSize(), manager959d00MenuAllocSize());



  assert.equal(manager959670RecvOfs(), managerShellApproachTailRecvOfs());



  assert.equal(manager959670ValueOfs(), managerShellApproachTailValueOfs());



  assert.equal(manager959670StepOfs(), managerShellApproachTailStepOfs());



  assert.equal(manager959670Host92e430Va(), managerShellApproachTailHostVa());



  assert.equal(manager959670Flag4b284Ofs(), manager959720Word4b284Ofs());



  assert.equal(manager959670StateOfs(), manager959720StateOfs());



  assert.equal(manager959670NextVa(), 0x0095e7c0);







  // Mutant: signed add would not wrap 0xffffffff+0x26614 to 0x26613.



  assert.equal(manager959670Host429170Recv(0xffffffff), 0x26613);



  // Mutant: drop & 0xff on Exit arg.



  assert.equal(manager959670ExitSaveArg(0x100), 0);



  assert.equal(manager959670ExitSaveArg(0xffffffff), 0xff);



});







test("JS oracle: 95e7c0 Cutscene::Show islands (ABI v31)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 31);







  // 0x0095e7d1: UNSIGNED ja vs 0x1a. 0..26 in range; 27 and 0xffffffff OOB.



  assert.equal(cutscene95e7c0IdInRange(0), true);



  assert.equal(cutscene95e7c0IdInRange(1), true);



  assert.equal(cutscene95e7c0IdInRange(0x1a), true);



  assert.equal(cutscene95e7c0IdInRange(0x1b), false);



  assert.equal(cutscene95e7c0IdInRange(0x1c), false);



  assert.equal(cutscene95e7c0IdInRange(0xffffffff), false);



  assert.equal(cutscene95e7c0IdInRange(0x80000000), false);



  // Mutant: signed jg would treat 0xffffffff as in-range (-1 <= 26).



  assert.equal(cutscene95e7c0IdInRange(0xffffffff), false);







  assert.equal(cutscene95e7c0UnloadNeeded(0), false);



  assert.equal(cutscene95e7c0UnloadNeeded(1), true);



  assert.equal(cutscene95e7c0UnloadNeeded(0xffffffff), true);







  assert.equal(cutscene95e7c0IdNonzero(0), false);



  assert.equal(cutscene95e7c0IdNonzero(1), true);



  assert.equal(cutscene95e7c0IdNonzero(0x100), true);



  assert.equal(cutscene95e7c0IdNonzero(0xffffffff), true);







  assert.equal(cutscene95e7c0ShowBodyNeeded(0), false);



  assert.equal(cutscene95e7c0ShowBodyNeeded(1), true);



  assert.equal(cutscene95e7c0ShowBodyNeeded(0x1a), true);



  assert.equal(cutscene95e7c0ShowBodyNeeded(0x1b), false);



  assert.equal(cutscene95e7c0ShowBodyNeeded(0xffffffff), false);







  // 4 + index*0x4c, 32-bit wrap.



  assert.equal(cutscene95e7c0EntryOfs(0), 4);



  assert.equal(cutscene95e7c0EntryOfs(1), 0x50);



  assert.equal(cutscene95e7c0EntryOfs(0x1a), 4 + 0x1a * 0x4c);



  assert.equal(cutscene95e7c0EntryOfs(0xffffffff), (4 + Math.imul(0xffffffff, 0x4c)) >>> 0);



  // Mutant: missing wrap on 0xffffffff * 0x4c.



  assert.equal(cutscene95e7c0EntryOfs(0xffffffff), 0xffffffb8);







  // Queue > 1: SAR then UNSIGNED > 1. count 0/1 false; 2 true.



  assert.equal(cutscene95e7c0QueueGt1(0, 0), false);



  assert.equal(cutscene95e7c0QueueGt1(0, 4), false);



  assert.equal(cutscene95e7c0QueueGt1(0, 8), true);



  assert.equal(cutscene95e7c0QueueGt1(8, 0), true); // wrapped negative → unsigned large



  // Mutant: signed > 1 would reject 0xffffffff count.



  assert.equal(cutscene95e7c0QueueGt1(4, 0), true);







  assert.equal(cutscene95e7c0SsoInline(0), true);



  assert.equal(cutscene95e7c0SsoInline(0xf), true);



  assert.equal(cutscene95e7c0SsoInline(0x10), false);



  assert.equal(cutscene95e7c0SsoInline(0xffffffff), false);







  assert.equal(cutscene95e7c0IdIs2(2), true);



  assert.equal(cutscene95e7c0IdIs2(0), false);



  assert.equal(cutscene95e7c0IdIs2(1), false);



  assert.equal(cutscene95e7c0IdIs2(3), false);



  assert.equal(cutscene95e7c0IdIs2(0x102), false);







  assert.equal(cutscene95e7c0GamePresent(0), false);



  assert.equal(cutscene95e7c0GamePresent(1), true);



  assert.equal(cutscene95e7c0GamePresent(0xffffffff), true);



  assert.equal(cutscene95e7c0Game1bb88Needed(0, 1), false);



  assert.equal(cutscene95e7c0Game1bb88Needed(1, 0), false);



  assert.equal(cutscene95e7c0Game1bb88Needed(1, 1), true);



  assert.equal(cutscene95e7c0Game1bb88Needed(0xffffffff, 0xffffffff), true);







  // RAW uint32, low byte. 0x100 continues (low byte 0).



  assert.equal(cutscene95e7c0FlagE5Continue(0), true);



  assert.equal(cutscene95e7c0FlagE5Continue(1), false);



  assert.equal(cutscene95e7c0FlagE5Continue(0x100), true);



  assert.equal(cutscene95e7c0FlagE5Continue(0xffffffff), false);



  // Mutant: drop & 0xff would treat 0x100 as skip.



  assert.equal(cutscene95e7c0FlagE5Continue(0x100), true);







  assert.equal(cutscene95e7c0VecCount(0, 0), 0);



  assert.equal(cutscene95e7c0VecCount(0, 4), 1);



  assert.equal(cutscene95e7c0VecCount(0, 8), 2);



  assert.equal(cutscene95e7c0VecLoopNeeded(0, 0), false);



  assert.equal(cutscene95e7c0VecLoopNeeded(0, 4), true);



  // wrapped end<begin: SAR negative ≠ 0 → loop



  assert.equal(cutscene95e7c0VecLoopNeeded(4, 0), true);







  assert.equal(cutscene95e7c0IdMax(), 0x1a);



  assert.equal(cutscene95e7c0EntryCount(), 0x1b);



  assert.equal(cutscene95e7c0EntryStride(), 0x4c);



  assert.equal(cutscene95e7c0EntriesOfs(), 4);



  assert.equal(cutscene95e7c0StateOfs(), 0);



  assert.equal(cutscene95e7c0QueuedOfs(), 0x808);



  assert.equal(cutscene95e7c0SsoCap(), 0x10);



  assert.equal(cutscene95e7c0IdSpecial(), 2);



  assert.equal(cutscene95e7c0FlagE5Ofs(), 0xe5);



  assert.equal(cutscene95e7c0VecBeginOfs(), 0xb8);



  assert.equal(cutscene95e7c0VecEndOfs(), 0xbc);



  assert.equal(cutscene95e7c0Game1bb88Ofs(), 0x1bb88);



  assert.equal(cutscene95e7c0QueueBeginOfs(), 0x4b3d8);



  assert.equal(cutscene95e7c0QueueEndOfs(), 0x4b3dc);



  assert.equal(cutscene95e7c0QueueHelperVa(), 0x0095ead0);



  assert.equal(cutscene95e7c0RecvOfs(), 0x20dd0);



  assert.equal(cutscene95e7c0ArgOfs(), 0x2161c);



  assert.equal(cutscene95e7c0MusicIndexOfs(), 0x29fbc);



  assert.equal(cutscene95e7c0MusicStride(), 0x184);



  assert.equal(cutscene95e7c0MusicVolOfs(), 0x2a138);



  assert.equal(cutscene95e7c0MusicRateOfs(), 0x2a13c);



  assert.equal(cutscene95e7c0MusicRateBits(), 0x3da3d70a);



  assert.equal(cutscene95e7c0Music2a2ccOfs(), 0x2a2cc);



  assert.equal(cutscene95e7c0Store828Ofs(), 0x828);



  assert.equal(cutscene95e7c0Store838Ofs(), 0x838);



  assert.equal(cutscene95e7c0Store838Value(), 0xffffffff);



  assert.equal(cutscene95e7c0StateAfter(), 1);



  assert.equal(cutscene95e7c0ManagerGlobalVa(), 0x00c7169c);



  assert.equal(cutscene95e7c0GameGlobalVa(), 0x00c71678);



  assert.equal(cutscene95e7c0Host960840Va(), 0x00960840);



  assert.equal(cutscene95e7c0Host40e910Va(), 0x0040e910);



  assert.equal(cutscene95e7c0HostA112c0Va(), 0x00a112c0);



  assert.equal(cutscene95e7c0Host95ead0Va(), 0x0095ead0);



  assert.equal(cutscene95e7c0Host91c7e0Va(), 0x0091c7e0);



  assert.equal(cutscene95e7c0Host8fd750Va(), 0x008fd750);



  assert.equal(cutscene95e7c0Host4239b0Va(), 0x004239b0);



  assert.equal(cutscene95e7c0Host6eef60Va(), 0x006eef60);



  assert.equal(cutscene95e7c0Va(), 0x0095e7c0);



  assert.equal(cutscene95e7c0RetVa(), 0x0095eaa9);



  assert.equal(cutscene95e7c0OobRetVa(), 0x0095eac2);



  assert.equal(cutscene95e7c0Int3Va(), 0x0095eac5);



  assert.equal(cutscene95e7c0BodyBytes(), 0x305);



  assert.equal(cutscene95e7c0FirstRetTrapBytes(), 0x800);



  assert.equal(cutscene95e7c0Sites(), 1);



  assert.equal(cutscene95e7c0SiteVa(), 0x00954d96);



  assert.equal(cutscene95e7c0NextVa(), 0x00921ce0);







  // Cross-field: same pins earlier ABIs already own



  assert.equal(cutscene95e7c0Va(), managerPrepollHostDVa());



  assert.equal(cutscene95e7c0NextVa(), managerPrepollHostEVa());



  assert.equal(cutscene95e7c0RecvOfs(), managerPrepollPredispatchRecvOfs());



  assert.equal(cutscene95e7c0ArgOfs(), managerPrepollCutsceneIdOfs());



  assert.equal(cutscene95e7c0QueueBeginOfs(), manager959720QueueBeginOfs());



  assert.equal(cutscene95e7c0QueueEndOfs(), manager959720QueueEndOfs());



  assert.equal(cutscene95e7c0ManagerGlobalVa(), manager959670ManagerGlobalVa());



  assert.equal(cutscene95e7c0GameGlobalVa(), manager959670GameGlobalVa());



  assert.equal(cutscene95e7c0MusicRateBits(), managerPrepollCrossfadeRateBits());



  assert.equal(cutscene95e7c0HostA112c0Va(), a112c0HostVa());



});











test("JS oracle: 921ce0 NightmareScene::Show islands (ABI v32)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 32);







  // SAR32(end-begin,2). Same math as v26 player-list count.



  assert.equal(nightmare921ce0PlayersCount(0, 0), 0);



  assert.equal(nightmare921ce0PlayersCount(0, 4), 1);



  assert.equal(nightmare921ce0PlayersCount(0, 8), 2);



  assert.equal(nightmare921ce0PlayersLogNeeded(0, 0), true);



  assert.equal(nightmare921ce0PlayersLogNeeded(0, 4), false);



  assert.equal(nightmare921ce0PlayersLogNeeded(4, 0), false); // wrapped nonzero







  // BYTE isnil + SIGNED key <= 0x4f.



  assert.equal(nightmare921ce0MapPresent(0, 0x4f), true);



  assert.equal(nightmare921ce0MapPresent(0, 0x4e), true);



  assert.equal(nightmare921ce0MapPresent(0, 0x50), false);



  assert.equal(nightmare921ce0MapPresent(1, 0x4f), false);



  assert.equal(nightmare921ce0MapPresent(0x100, 0x4f), true); // low byte 0



  // Mutant: unsigned ja would reject 0xffffffff as huge; signed jle accepts -1 <= 0x4f.



  assert.equal(nightmare921ce0MapPresent(0, 0xffffffff), true);



  assert.equal(nightmare921ce0MapPresent(0, 0x80000000), true); // signed min <= 0x4f







  assert.equal(nightmare921ce0MapFound(1, 2), true);



  assert.equal(nightmare921ce0MapFound(2, 2), false);



  assert.equal(nightmare921ce0MapFound(0xffffffff, 0), true);







  assert.equal(nightmare921ce0StrncmpOk(0), true);



  assert.equal(nightmare921ce0StrncmpOk(1), false);



  assert.equal(nightmare921ce0StrncmpOk(0xffffffff), false);







  assert.equal(nightmare921ce0GfxNeeded(0, 0x4f, 1, 2, 0), true);



  assert.equal(nightmare921ce0GfxNeeded(1, 0x4f, 1, 2, 0), false);



  assert.equal(nightmare921ce0GfxNeeded(0, 0x50, 1, 2, 0), false);



  assert.equal(nightmare921ce0GfxNeeded(0, 0x4f, 2, 2, 0), false);



  assert.equal(nightmare921ce0GfxNeeded(0, 0x4f, 1, 2, 1), false);







  // UNSIGNED SSO cap < 0x10.



  assert.equal(nightmare921ce0SsoInline(0), true);



  assert.equal(nightmare921ce0SsoInline(0xf), true);



  assert.equal(nightmare921ce0SsoInline(0x10), false);



  assert.equal(nightmare921ce0SsoInline(0xffffffff), false);



  // Mutant: signed jl would treat 0xffffffff as in-range.







  // index*24, 32-bit wrap.



  assert.equal(nightmare921ce0SpriteOfs(0), 0);



  assert.equal(nightmare921ce0SpriteOfs(1), 0x18);



  assert.equal(nightmare921ce0SpriteOfs(0xffffffff), (Math.imul(0xffffffff, 0x18) >>> 0));



  // Mutant: missing wrap on 0xffffffff * 0x18.



  assert.equal(nightmare921ce0SpriteOfs(0xffffffff), 0xffffffe8);







  // RAW uint32, low byte. 0x100 is not dogma.



  assert.equal(nightmare921ce0Dogma(0), false);



  assert.equal(nightmare921ce0Dogma(1), true);



  assert.equal(nightmare921ce0Dogma(0x100), false);



  assert.equal(nightmare921ce0Dogma(0x1ff), true);



  assert.equal(nightmare921ce0Dogma(0xffffffff), true);



  // Mutant: drop & 0xff would treat 0x100 as dogma.



  assert.equal(nightmare921ce0Dogma(0x100), false);







  assert.equal(nightmare921ce0CollectiblePathNeeded(0), true);



  assert.equal(nightmare921ce0CollectiblePathNeeded(1), false);



  assert.equal(nightmare921ce0CollectiblePathNeeded(0x100), true);







  assert.equal(nightmare921ce0Flag4b1Continue(0), true);



  assert.equal(nightmare921ce0Flag4b1Continue(1), false);



  assert.equal(nightmare921ce0Flag4b1Continue(0x100), true);



  assert.equal(nightmare921ce0Flag4b1Continue(0xffffffff), false);







  assert.equal(nightmare921ce0BoolArg(0), 0);



  assert.equal(nightmare921ce0BoolArg(1), 1);



  assert.equal(nightmare921ce0BoolArg(0x100), 0);



  assert.equal(nightmare921ce0BoolArg(0x1ff), 0xff);



  assert.equal(nightmare921ce0BoolArg(0xffffffff), 0xff);







  assert.equal(nightmare921ce0MusicId(0), 0x60);



  assert.equal(nightmare921ce0MusicId(1), 0x41);



  assert.equal(nightmare921ce0MusicId(0x100), 0x60);



  assert.equal(nightmare921ce0MusicId(0x1ff), 0x41);







  assert.equal(nightmare921ce0StageIsC(0xc), true);



  assert.equal(nightmare921ce0StageIsC(0xd), false);



  assert.equal(nightmare921ce0StageIsC(0), false);



  assert.equal(nightmare921ce0StageIsD(0xd), true);



  assert.equal(nightmare921ce0StageIsD(0xc), false);







  assert.equal(nightmare921ce0OwnerPresent(0), false);



  assert.equal(nightmare921ce0OwnerPresent(1), true);



  assert.equal(nightmare921ce0OwnerPresent(0xffffffff), true);







  assert.equal(nightmare921ce0MapKey(), 0x4f);



  assert.equal(nightmare921ce0MapIsnilOfs(), 0xd);



  assert.equal(nightmare921ce0MapKeyOfs(), 0x10);



  assert.equal(nightmare921ce0MapOfs(), 0x1bbd8);



  assert.equal(nightmare921ce0PlayersBeginOfs(), 0x1baa8);



  assert.equal(nightmare921ce0PlayersEndOfs(), 0x1baac);



  assert.equal(nightmare921ce0SsoCap(), 0x10);



  assert.equal(nightmare921ce0StrncmpN(), 0x16);



  assert.equal(nightmare921ce0SpriteStride(), 0x18);



  assert.equal(nightmare921ce0IndexOfs(), 0x360);



  assert.equal(nightmare921ce0TableOfs(), 0x14);



  assert.equal(nightmare921ce0BaseOfs(), 0x8);



  assert.equal(nightmare921ce0DogmaOfs(), 0x5e8);



  assert.equal(nightmare921ce0BoolStoreOfs(), 0x368);



  assert.equal(nightmare921ce0Flag4b1Ofs(), 0x4b1);



  assert.equal(nightmare921ce0Flag4bcOfs(), 0x4bc);



  assert.equal(nightmare921ce0Flag4bcClear(), 0);



  assert.equal(nightmare921ce0Flag4bcSet(), 1);



  assert.equal(nightmare921ce0MusicIdNormal(), 0x60);



  assert.equal(nightmare921ce0MusicIdDogma(), 0x41);



  assert.equal(nightmare921ce0MusicRecvOfs(), 0x29fbc);



  assert.equal(nightmare921ce0MusicVolOfs(), 0x2a354);



  assert.equal(nightmare921ce0StageC(), 0xc);



  assert.equal(nightmare921ce0StageD(), 0xd);



  assert.equal(nightmare921ce0CollectibleId(), 0x236);



  assert.equal(nightmare921ce0LazTag(), 1);



  assert.equal(nightmare921ce0Anm2LoadGraphics(), 1);



  assert.equal(nightmare921ce0Store3a4Ofs(), 0x3a4);



  assert.equal(nightmare921ce0Store3a4Value(), 0x28);



  assert.equal(nightmare921ce0LogLevel(), 0x10);



  assert.equal(nightmare921ce0LogMsgVa(), 0x00b7e6bc);



  assert.equal(nightmare921ce0PathVa(), 0x00b79fa0);



  assert.equal(nightmare921ce0IatStrncmpVa(), 0x00b18934);



  assert.equal(nightmare921ce0GameGlobalVa(), 0x00c71678);



  assert.equal(nightmare921ce0ManagerGlobalVa(), 0x00c7169c);



  assert.equal(nightmare921ce0RecvOfs(), 0x21628);



  assert.equal(nightmare921ce0ArgOfs(), 0x4b2a5);



  assert.equal(nightmare921ce0G3Ofs(), 0x4b2a4);



  assert.equal(nightmare921ce0HostA112c0Va(), 0x00a112c0);



  assert.equal(nightmare921ce0Host4288a0Va(), 0x004288a0);



  assert.equal(nightmare921ce0Host4074c0Va(), 0x004074c0);



  assert.equal(nightmare921ce0Host40bd50Va(), 0x0040bd50);



  assert.equal(nightmare921ce0Host407f10Va(), 0x00407f10);



  assert.equal(nightmare921ce0Host9be080Va(), 0x009be080);



  assert.equal(nightmare921ce0Host7e1d50Va(), 0x007e1d50);



  assert.equal(nightmare921ce0HostAef15cVa(), 0x00aef15c);



  assert.equal(nightmare921ce0HostA0f4c0Va(), 0x00a0f4c0);



  assert.equal(nightmare921ce0Va(), 0x00921ce0);



  assert.equal(nightmare921ce0RetVa(), 0x0092330c);



  assert.equal(nightmare921ce0Int3Va(), 0x0092330f);



  assert.equal(nightmare921ce0BodyBytes(), 0x1630);



  assert.equal(nightmare921ce0FirstRetTrapBytes(), 0x800);



  assert.equal(nightmare921ce0Sites(), 1);



  assert.equal(nightmare921ce0SiteVa(), 0x00954dd0);



  assert.equal(nightmare921ce0SiblingVa(), 0x00923320);



  assert.equal(nightmare921ce0NextVa(), 0x009be080);







  // Cross-field: same pins earlier ABIs already own.



  assert.equal(nightmare921ce0Va(), managerPrepollHostEVa());



  assert.equal(nightmare921ce0MapKey(), 0x4f);



  assert.equal(nightmare921ce0PlayersBeginOfs(), managerPlayerscanPlayerListBeginOfs());



  assert.equal(nightmare921ce0PlayersEndOfs(), managerPlayerscanPlayerListEndOfs());



  assert.equal(nightmare921ce0LogLevel(), managerPlayerscanLogLevel());



  assert.equal(nightmare921ce0LogMsgVa(), managerPlayerscanLogMsgVa());



  assert.equal(nightmare921ce0SsoCap(), cutscene95e7c0SsoCap());



  assert.equal(nightmare921ce0SsoInline(0xf), cutscene95e7c0SsoInline(0xf));



  assert.equal(nightmare921ce0HostA112c0Va(), a112c0HostVa());



  assert.equal(nightmare921ce0RecvOfs(), managerPrepollState5RecvOfs());



  assert.equal(nightmare921ce0ArgOfs(), managerPrepollNightmareArgOfs());



  assert.equal(nightmare921ce0G3Ofs(), managerPrepollG3Ofs());



  assert.equal(nightmare921ce0NextVa(), nightmare921ce0Host9be080Va());



});







test("JS oracle: 9be080 FirstCollectibleOwner islands (ABI v33)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 33);



  // laz byte && item nonzero && bit31 of item+0xb8.



  assert.equal(fco9be080TwinWalkFlag(0, 1, 0x80000000), false);



  assert.equal(fco9be080TwinWalkFlag(1, 0, 0x80000000), false);



  assert.equal(fco9be080TwinWalkFlag(1, 1, 0x00000000), false);



  assert.equal(fco9be080TwinWalkFlag(1, 1, 0x40000000), false);



  assert.equal(fco9be080TwinWalkFlag(1, 1, 0x80000000), true);



  assert.equal(fco9be080TwinWalkFlag(0x100, 1, 0x80000000), false); // low byte 0



  assert.equal(fco9be080TwinWalkFlag(0x1ff, 1, 0x80000000), true);



  // Mutant: drop & 0xff on laz would treat 0x100 as set.



  // Mutant: drop item!=0 gate would pass item==0 with bit31 set.



  // Mutant: bit0 test would reject 0x80000000.



  assert.equal(fco9be080ListEmpty(0, 0), true);



  assert.equal(fco9be080ListEmpty(0, 4), false);



  assert.equal(fco9be080ListEmpty(0xffffffff, 0xffffffff), true);



  assert.equal(fco9be080SlotCheckable(0), true);



  assert.equal(fco9be080SlotCheckable(1), false);



  assert.equal(fco9be080SlotCheckable(0xffffffff), false);



  assert.equal(fco9be080HasCollectibleHit(0), false);



  assert.equal(fco9be080HasCollectibleHit(1), true);



  assert.equal(fco9be080HasCollectibleHit(0x100), false); // low byte 0



  assert.equal(fco9be080HasCollectibleHit(0x1ff), true);



  assert.equal(fco9be080TwinPresent(0), false);



  assert.equal(fco9be080TwinPresent(1), true);



  assert.equal(fco9be080TwinPresent(0xffffffff), true);



  // shared byte checked before twin pointer in the PE (0x9be0ed then 0x9be0f9).



  assert.equal(fco9be080TwinCheckNeeded(0, 1), false);



  assert.equal(fco9be080TwinCheckNeeded(1, 0), false);



  assert.equal(fco9be080TwinCheckNeeded(1, 1), true);



  assert.equal(fco9be080TwinCheckNeeded(0xffffffff, 0xffffffff), true);



  // stride 4 with 32-bit wrap.



  assert.equal(fco9be080WalkNext(0), 4);



  assert.equal(fco9be080WalkNext(0xffffffff), 3);



  // Mutant: no wrap would give 0x100000003.



  assert.equal(fco9be080WalkContinue(4, 4), false);



  assert.equal(fco9be080WalkContinue(4, 8), true);



  assert.equal(fco9be080WalkContinue(0xffffffff, 3), true);



  assert.equal(fco9be080ResultPlayer(0x12345678), 0x12345678);



  assert.equal(fco9be080ResultPlayer(0), 0);



  assert.equal(fco9be080ResultTwin(0x9abcdef0), 0x9abcdef0);



  assert.equal(fco9be080ResultNotFound(), 0);



  assert.equal(fco9be080ItemConfigOfs(), 0x2a404);



  assert.equal(fco9be080GetCollectibleVa(), 0x0072fd10);



  assert.equal(fco9be080HasCollectibleVa(), 0x007706e0);



  assert.equal(fco9be080ItemFlagsOfs(), 0xb8);



  assert.equal(fco9be080TwinBit(), 0x80000000);



  assert.equal(fco9be080ListBeginOfs(), 0);



  assert.equal(fco9be080ListEndOfs(), 4);



  assert.equal(fco9be080ListStride(), 4);



  assert.equal(fco9be080SlotFlagOfs(), 0x2c);



  assert.equal(fco9be080TwinPtrOfs(), 0x1e6c);



  assert.equal(fco9be080LazArgOfs(), 0x10);



  assert.equal(fco9be080ManagerGlobalVa(), 0x00c7169c);



  assert.equal(fco9be080Va(), 0x009be080);



  assert.equal(fco9be080RetVa(), 0x009be137);



  assert.equal(fco9be080FirstRetVa(), 0x009be11d);



  assert.equal(fco9be080Int3Va(), 0x009be13a);



  assert.equal(fco9be080BodyBytes(), 0xb8);



  assert.equal(fco9be080Sites(), 175);



  assert.equal(fco9be080SiteVa(), 0x009220a8);



  assert.equal(fco9be080Site2Va(), 0x0092225f);



  assert.equal(fco9be080NextVa(), 0x009be140);



  // Cross-field: v32 recorded FCO as its host + next; v33 makes it a unit.



  assert.equal(fco9be080Va(), nightmare921ce0Host9be080Va());



  assert.equal(fco9be080Va(), nightmare921ce0NextVa());



  assert.equal(fco9be080NextVa(), 0x009be140);



  assert.equal(fco9be080GetCollectibleVa(), 0x0072fd10);



});




test("native Wasm differential vs JS oracle", async () => {



  const w = await loadWasm();



  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);







  const casesPresent = [



    [0, 0x38, 0x38],



    [1, 0x38, 0x38],



    [0, 0x39, 0x38],



    [0, 0x37, 0x38],



  ];



  for (const [isnil, key, id] of casesPresent) {



    assert.equal(



      w.mapPresent(isnil, key, id),



      inputMapNodePresent(isnil, key, id) ? 1 : 0,



      `present isnil=${isnil} key=${key} id=${id}`,



    );



  }







  const gateCases = [
    [0, 0, 0],
    [0, 1, 0],
    [0, 1, 3],
    [5, -1, 0],
    [0, 0, 1],
  ];

  /* v109 dedupe: 6f9400/6f95a0 laws are OWNED by the render-shell family;
     the PI wasm no longer exports gate39/maskA/maskAFull/maskB. The PE
     truth is pinned BY REFERENCE to the RShell model laws: the gate + mask
     expectations below are the exact PE outputs the removed PI laws produced,
     now asserted through the owner (render-shell) exports. */
  for (const [mode, stage, diff, want] of [
    [0, 0, 0, false],   /* stage 0: (signed stage % 2) != 1 */
    [0, 1, 0, true],
    [0, 1, 3, false],   /* difficulty 3 excluded */
    [5, -1, 0, false],  /* stage -1: (signed %2) is -1 */
    [0, 0, 1, false],
    [INPUT_MASK_A_GATE39_MODE_EXCLUDE, 1, 0, false],
    [0, 2, 0, false],
    [0, 9, 0, false],   /* stage >= 8 */
  ]) {
    assert.equal(
      renderShell6f9400Gate39(mode, stage, diff),
      want,
      `gate39 m=${mode} s=${stage} d=${diff}`,
    );
  }

  const masksA = [
    { p: { present38: 0, present39: 0, present3a: 0, present3b: 0,
           present3c: 0, present3d: 0, present3e: 0 }, gate: 0, want: 0 },
    { p: { present38: 1, present39: 1, present3a: 1, present3b: 1,
           present3c: 1, present3d: 1, present3e: 1 }, gate: 1,
      want: INPUT_MASK_BIT0 | INPUT_MASK_BIT1 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
             INPUT_MASK_BIT4 | INPUT_MASK_BIT5 | INPUT_MASK_BIT6 },
    { p: { present38: 1, present39: 1, present3a: 0, present3b: 0,
           present3c: 0, present3d: 0, present3e: 1 }, gate: 0,
      want: INPUT_MASK_BIT0 | INPUT_MASK_BIT4 },  /* 38 + 3e; 39 gated by 0 */
    { p: { present38: 0, present39: 1, present3a: 0, present3b: 1,
           present3c: 1, present3d: 0, present3e: 0 }, gate: 1,
      want: INPUT_MASK_BIT1 | INPUT_MASK_BIT3 | INPUT_MASK_BIT5 },
  ];

  for (const c of masksA) {
    assert.equal(
      renderShell6f9400Mask(c.p, c.gate) >>> 0,
      c.want,
      `maskA ${JSON.stringify(c.p)}`,
    );
    /* maskAFull recomputes gate39(0,1,0) = true, so BIT1 joins the
       plain-mask bits whenever present39 is nonzero. */
    const gateFull = renderShell6f9400Gate39(0, 1, 0) ? 1 : 0;
    assert.equal(
      renderShell6f9400MaskFull(c.p, 0, 1, 0) >>> 0,
      renderShell6f9400Mask(c.p, gateFull) >>> 0,
      "maskAFull",
    );
  }

  const masksB = [
    { p: { present3f: 0, present40: 0, present41: 0, present42: 0,
           present43: 0, present44: 0, present46: 0, present4f: 0 }, want: 0 },
    { p: { present3f: 1, present40: 1, present41: 1, present42: 1,
           present43: 1, present44: 1, present46: 0, present4f: 1 },
      want: INPUT_MASK_BIT0 | INPUT_MASK_BIT1 | INPUT_MASK_BIT2 | INPUT_MASK_BIT3 |
             INPUT_MASK_BIT5 | INPUT_MASK_BIT6 },
    { p: { present3f: 1, present40: 0, present41: 0, present42: 0,
           present43: 0, present44: 0, present46: 1, present4f: 0 },
      want: INPUT_MASK_B_ID_46_FORCE },
    { p: { present3f: 1, present40: 1, present41: 1, present42: 1,
           present43: 1, present44: 1, present46: 1, present4f: 1 },
      want: INPUT_MASK_B_ID_46_FORCE | INPUT_MASK_BIT6 },
  ];

  for (const c of masksB) {
    assert.equal(
      renderShell6f95a0Mask(c.p) >>> 0,
      c.want,
      `maskB ${JSON.stringify(c.p)}`,
    );
  }

const combos = [



    [0, 0, 0],



    [0xff, 0x0f, 0x100],



    [0x3, 0x1, 0x4],



    [0xffffffff, 0x80000000, 1],



  ];



  for (const [a, b, m] of combos) {



    assert.equal(



      w.combine(a, b, m) >>> 0,



      inputMaskCombine(a, b, m),



      `combine a=${a} b=${b} m=${m}`,



    );



  }







  const ranges = [



    [0, 0, 1],



    [0, 0, 0],



    [5, 0, 5],



    [4, 0, 5],



    [0xfffffff0, 0xfffffff0, 0x20],



    [0xfffffffe, 0xfffffffe, 1],



    [0xffffffff, 0xfffffffe, 1],



  ];



  for (const [idx, start, count] of ranges) {



    assert.equal(



      w.rangeContains(idx >>> 0, start >>> 0, count >>> 0),



      inputDeviceRangeContains(idx, start, count) ? 1 : 0,



      `range idx=${idx} start=${start} count=${count}`,



    );



  }







  // multi-range via wasm memory. Scratch must live at 0x100000 or above:



  // low linear memory holds the module's own switch/const tables and the



  // 64 KiB shadow stack sits immediately after static data, so buffers below



  // 1 MiB corrupt tables or helper locals with no error (v21 relocation).



  {



    assert.ok(w.memory, "wasm memory export");



    const base = SCRATCH_DEVICE_RANGES;



    const u8 = new Uint8Array(w.memory.buffer);



    const dv = new DataView(w.memory.buffer);



    // starts[2] at base, counts[2] at base+8



    dv.setUint32(base + 0, 0, true);



    dv.setUint32(base + 4, 10, true);



    dv.setUint32(base + 8, 2, true);



    dv.setUint32(base + 12, 5, true);



    assert.equal(w.deviceTypeRanges(1, base, base + 8, 2), 1); // in first [0,2)



    assert.equal(w.deviceTypeRanges(11, base, base + 8, 2), 1); // in second [10,15)



    assert.equal(w.deviceTypeRanges(20, base, base + 8, 2), 0);



    assert.equal(w.deviceTypeRanges(0, base, base + 8, 0), 0);



    void u8;



  }







  const gate9730 = [



    [0, 0, 0, 0, 0, true],



    [-1, 0, 0, 0, 0, true],



    [0.5, 0, 0, 0, 0, false],



    [0, 1, 0, 0, 0, false],



    [0, 0, 2, 0, 0, false],



    [0, 0, 0, 1, 0, false],



    [0, 0, 0, 0, 3, false],



  ];



  for (const [f, a, b, c, d, exp] of gate9730) {



    assert.equal(



      w.gate6f9730(f, a, b, c, d),



      managerGate6f9730(f, a, b, c, d) ? 1 : 0,



      `6f9730 f=${f} a=${a}`,



    );



    assert.equal(!!exp, managerGate6f9730(f, a, b, c, d));



  }



  // NaN: comiss unordered â†’ fail



  assert.equal(w.gate6f9730(Number.NaN, 0, 0, 0, 0), 0);







  const early = [



    [0, 0, 0, 0],



    [1, 0, 0, 0],



    [1, 0, 1, 0],



    [1, 0, 1, 1],



    [1, 1, 1, 0],



    [3, 0, 0, 0],



    [2, 0, 1, 0],



  ];



  for (const [ctr, f0, f1, f2] of early) {



    assert.equal(



      w.earlySkip(ctr, f0, f1, f2),



      managerUpdateEarlySkip(ctr, f0, f1, f2),



      `early ctr=${ctr}`,



    );



    assert.equal(



      w.earlyNext(ctr) | 0,



      managerEarlyCounterNext(ctr),



      `next ctr=${ctr}`,



    );



  }







  const stepBits = MANAGER_FLOAT_APPROACH_STEP_BITS;



  const step = new Float32Array(new Uint32Array([stepBits]).buffer)[0];



  const approaches = [



    [0, 10, step],



    [8, 10, step],



    [10, 0, step],



    [3, 0, step],



    [5, 5, step],



  ];



  for (const [cur, tgt, st] of approaches) {



    const js = managerFloatApproach(cur, tgt, st);



    const nat = w.floatApproach(cur, tgt, st);



    assert.ok(Object.is(nat, js) || Math.abs(nat - js) < 1e-6, `approach ${cur}->${tgt}`);



  }







  // ABI v3: Manager poll prefix + FUN_00a6de60 pure entry



  for (const p of [0, 1, 2, 0xff]) {



    assert.equal(



      w.pollPrefix(p),



      managerPollPrefixNeeded(p) ? 1 : 0,



      `pollPrefix ${p}`,



    );



  }



  for (const f of [0, 1, 0xdead, 0xffffffff]) {



    assert.equal(



      w.pollPlatform(f >>> 0),



      managerPollPlatformUsesA69f60(f) ? 1 : 0,



      `pollPlatform ${f}`,



    );



  }



  const bodyCases = [



    [0, 0],



    [1, 0],



    [1, 1],



    [0, 1],



    [0xff, 0],



    [1, 0xff],



  ];



  for (const [en, re] of bodyCases) {



    assert.equal(



      w.pollBody(en, re),



      managerPollA6de60BodyNeeded(en, re) ? 1 : 0,



      `pollBody en=${en} re=${re}`,



    );



  }



  const vecCases = [



    [0x1000, 0x0ff0],



    [0x1000, 0x1000],



    [0, 16],



    [0, 4],



    [0xfffffffc, 0],



    [0x10, 0],



  ];



  for (const [end, begin] of vecCases) {



    assert.equal(



      w.pollVecCount(end | 0, begin | 0) | 0,



      managerPollA6de60VectorCount(end, begin),



      `vecCount end=${end} begin=${begin}`,



    );



  }



  for (const c of [0, 1, -1, 4, 0x7fffffff, -0x80000000]) {



    assert.equal(



      w.pollLoop(c | 0),



      managerPollA6de60LoopNeeded(c) ? 1 : 0,



      `pollLoop ${c}`,



    );



  }







  // ABI v4: device-walk pure islands



  for (const b of [0, 1, 0x80, 0xff]) {



    assert.equal(



      w.deviceEnabled(b),



      managerPollA6de60DeviceEnabled(b) ? 1 : 0,



      `deviceEnabled ${b}`,



    );



  }



  for (const s of [0, 1, -1, 0x8007001e]) {



    assert.equal(



      w.queryOk(s | 0),



      managerPollA6de60QueryOk(s) ? 1 : 0,



      `queryOk ${s}`,



    );



  }



  const bitCases = [



    [0, 0],



    [1, 0],



    [0x4000, 0xe],



    [0x0400, 0xa],



    [0x8000, 0xf],



    [0xffffffff, 31],



  ];



  for (const [st, sh] of bitCases) {



    assert.equal(



      w.buttonBit(st >>> 0, sh >>> 0) & 0xff,



      managerPollA6de60ButtonBit(st, sh),



      `buttonBit ${st}>>${sh}`,



    );



  }



  for (let slot = 0; slot <= 16; slot += 1) {



    assert.equal(



      w.buttonSlotShift(slot) >>> 0,



      managerPollA6de60ButtonSlotShift(slot) >>> 0,



      `slotShift ${slot}`,



    );



  }



  const edgeCases = [



    [0, 0, 1, 1],



    [1, 1, 1, 1],



    [1, 0, 1, 1],



    [0, 1, 1, 1],



    [1, 0, 0, 1],



    [0, 1, 1, 0],



    [2, 0, 1, 0], // nonzero new treated as pressed



  ];



  for (const [n, o, p, r] of edgeCases) {



    assert.equal(



      w.buttonEdge(n, o, p, r),



      managerPollA6de60ButtonEdge(n, o, p, r),



      `edge n=${n} o=${o}`,



    );



  }



  const i16s = [0, -1, 1, -0x8000, 0x7fff, 0x100, -0x100];



  for (const raw of i16s) {



    const js = managerPollA6de60AxisNormalizeI16(raw);



    const nat = w.axisNormI16(raw);



    assert.ok(



      Object.is(nat, js) || Math.abs(nat - js) < 1e-6,



      `axisI16 raw=${raw} js=${js} nat=${nat}`,



    );



  }



  for (const raw of [0, 1, 0x7f, 0x80, 0xff]) {



    const js = managerPollA6de60AxisNormalizeU8(raw);



    const nat = w.axisNormU8(raw);



    assert.ok(



      Object.is(nat, js) || Math.abs(nat - js) < 1e-6,



      `axisU8 raw=${raw}`,



    );



  }



  const floats = [



    [0, 0],



    [1, 1],



    [1, 2],



    [-1, 1],



    [Number.NaN, 0],



    [0, Number.NaN],



  ];



  for (const [a, b] of floats) {



    assert.equal(



      w.floatChanged(a, b),



      managerPollA6de60FloatChanged(a, b) ? 1 : 0,



      `floatChanged ${a},${b}`,



    );



    assert.equal(



      w.floatCb(a, b, 1),



      managerPollA6de60FloatCallbackNeeded(a, b, 1) ? 1 : 0,



    );



    assert.equal(



      w.floatCb(a, b, 0),



      managerPollA6de60FloatCallbackNeeded(a, b, 0) ? 1 : 0,



    );



  }



  for (const hr of [



    0,



    A6DE60_DIERR_INPUTLOST,



    A6DE60_DIERR_NOTACQUIRED,



    0x80004005,



    0xffffffff,



  ]) {



    assert.equal(



      w.dierr(hr >>> 0),



      managerPollA6de60DierrReacquire(hr) ? 1 : 0,



      `dierr ${hr}`,



    );



  }



  for (const [i, c] of [[0, 2], [1, 2], [0, 0], [0xffffffff, 1], [5, 5]]) {



    assert.equal(



      w.indexCont(i >>> 0, c >>> 0),



      managerPollA6de60IndexContinue(i, c) ? 1 : 0,



      `indexCont ${i}/${c}`,



    );



  }



  for (const t of [0, 1, 2, 3, 4, 8, 0x2b, 0x2c, 0x2d, 0x100]) {



    assert.equal(



      w.axisDispatch(t >>> 0),



      managerPollA6de60AxisTypeDispatch(t),



      `axisDispatch ${t}`,



    );



  }



  const devCont = [



    [0, 0x1000, 0x0ff0],



    [2, 0x1000, 0x0ff0],



    [3, 0x1000, 0x0ff0],



    [0, 0x1000, 0x1000],



    [0, 0, 16],



  ];



  for (const [idx, end, begin] of devCont) {



    assert.equal(



      w.deviceCont(idx >>> 0, end | 0, begin | 0),



      managerPollA6de60DeviceContinue(idx, end, begin) ? 1 : 0,



      `deviceCont idx=${idx}`,



    );



  }







  // ABI v5: residual IAT/query path + POV pure islands



  for (const h of [0, 1, 0xdeadbeef, 0xffffffff]) {



    assert.equal(



      w.queryHook(h >>> 0),



      managerPollA6de60QueryUsesHook(h) ? 1 : 0,



      `queryHook ${h}`,



    );



  }



  const freqInit = [



    [0, 0],



    [1, 0],



    [0, 1],



    [10, 20],



    [0xffffffff, 0],



  ];



  for (const [lo, hi] of freqInit) {



    assert.equal(



      w.qpcFreqInit(lo >>> 0, hi >>> 0),



      managerPollA6de60QpcFreqInitNeeded(lo, hi) ? 1 : 0,



      `qpcFreqInit ${lo},${hi}`,



    );



  }



  const u64s = [



    [0, 0],



    [1, 0],



    [0, 1],



    [1, 1],



    [0x80000000, 0],



    [0xffffffff, 0],



    [0, 0x7fffffff],



    [0x12345678, 0x9],



  ];



  for (const [lo, hi] of u64s) {



    const js = managerPollA6de60U64ToF64(lo, hi);



    const nat = w.u64ToF64(lo >>> 0, hi >>> 0);



    assert.ok(



      Object.is(nat, js) || Math.abs(nat - js) <= Number.EPSILON * Math.max(1, Math.abs(js)),



      `u64ToF64 lo=${lo} hi=${hi} js=${js} nat=${nat}`,



    );



  }



  const qpcSecs = [



    [10_000_000, 0, 10_000_000, 0],



    [5_000_000, 0, 10_000_000, 0],



    [1, 0, 1, 0],



    [0, 1, 0, 1], // 2^32 / 2^32



    [3, 0, 7, 0],



  ];



  for (const [clo, chi, flo, fhi] of qpcSecs) {



    const js = managerPollA6de60QpcSecondsF64(clo, chi, flo, fhi);



    const nat = w.qpcSeconds(clo >>> 0, chi >>> 0, flo >>> 0, fhi >>> 0);



    assert.ok(



      Object.is(nat, js) || Math.abs(nat - js) < 1e-6,



      `qpcSeconds c=${clo}/${chi} f=${flo}/${fhi} js=${js} nat=${nat}`,



    );



  }



  for (const hr of [0, 1, -1, 0x8007001e, 0x7fffffff, -0x80000000]) {



    assert.equal(



      w.comOk(hr | 0),



      managerPollA6de60ComSucceeded(hr) ? 1 : 0,



      `comOk ${hr}`,



    );



  }



  for (const b of [0, 1, 0xff]) {



    assert.equal(



      w.bufferedMode(b),



      managerPollA6de60BufferedMode(b) ? 1 : 0,



      `bufferedMode ${b}`,



    );



  }



  for (const c of [0, 1, 2, 100, 0x0ccccccc, 0x0ccccccd, 0x10000000, 0xffffffff]) {



    assert.equal(



      w.didodSize(c >>> 0) >>> 0,



      managerPollA6de60DidodAllocSize(c) >>> 0,



      `didodSize ${c}`,



    );



  }



  for (const t of [0, 1, 1000, 2500, 0x7fffffff, 0x80000000, 0xffffffff]) {



    const js = managerPollA6de60TimestampToSecondsF64(t);



    const nat = w.tsSeconds(t >>> 0);



    assert.ok(



      Object.is(nat, js) || Math.abs(nat - js) < 1e-9,



      `tsSeconds ${t} js=${js} nat=${nat}`,



    );



  }



  for (const v of [0, 1, 0x100, 0xffffffff]) {



    assert.equal(



      w.nonzeroBit(v >>> 0) & 0xff,



      managerPollA6de60NonzeroBit(v),



      `nonzeroBit ${v}`,



    );



  }



  const povDiff = [



    0xffffffff, A6DE60_POV_CENTER_LO16, 0, 1, 4500,



    A6DE60_POV_EAST, 13500, A6DE60_POV_SOUTH, A6DE60_POV_SOUTH + 1,



    22500, A6DE60_POV_WEST, A6DE60_POV_WEST + 1, 31500, 35999,



  ];



  for (const pov of povDiff) {



    const a0j = managerPollA6de60PovAxis0(pov);



    const a1j = managerPollA6de60PovAxis1(pov);



    const a0n = w.povAxis0(pov >>> 0);



    const a1n = w.povAxis1(pov >>> 0);



    assert.ok(Object.is(a0n, a0j) || Math.abs(a0n - a0j) < 1e-6, `pov0 ${pov}`);



    assert.ok(Object.is(a1n, a1j) || Math.abs(a1n - a1j) < 1e-6, `pov1 ${pov}`);



  }







  // ABI v6: post-query hook repack + DIDOD / a6da10 / a648b0 pure islands



  const hookCases = [



    [0x00ff, 0x10, 0x20, 0x1234, 0x5678, 0xabcd, 0xef01],



    [0, 0, 0, 0, 0, 0, 0],



    [0xffff, 0xff, 0xff, 0xffff, 0xffff, 0xffff, 0xffff],



    [1, 2, 3, 4, 5, 6, 7],



  ];



  for (const c of hookCases) {



    const [w4, b6, b7, w8, wa, wc, we] = c;



    assert.equal(



      w.hookDw0(w4, b6, b7) >>> 0,



      managerPollA6de60HookRepackDw0(w4, b6, b7),



      `hookDw0 ${c}`,



    );



    assert.equal(



      w.hookDw1(w8, wa) >>> 0,



      managerPollA6de60HookRepackDw1(w8, wa),



      `hookDw1 ${c}`,



    );



    assert.equal(



      w.hookDw2(wc, we) >>> 0,



      managerPollA6de60HookRepackDw2(wc, we),



      `hookDw2 ${c}`,



    );



    {



      const base = 8192;



      const dv = new DataView(w.memory.buffer);



      w.hookRepack(w4, b6, b7, w8, wa, wc, we, base);



      const js = managerPollA6de60HookRepack(w4, b6, b7, w8, wa, wc, we);



      assert.equal(dv.getUint32(base + 0, true), js[0], `hookRepack[0] ${c}`);



      assert.equal(dv.getUint32(base + 4, true), js[1], `hookRepack[1] ${c}`);



      assert.equal(dv.getUint32(base + 8, true), js[2], `hookRepack[2] ${c}`);



    }



  }







  for (const [e, m] of [[0, 0], [1, 1], [1, 2], [0xffffffff, 0xffffffff], [0x100, 0x200]]) {



    assert.equal(



      w.didodOfs(e >>> 0, m >>> 0),



      managerPollA6de60DidodOfsMatch(e, m) ? 1 : 0,



      `didodOfs ${e},${m}`,



    );



  }



  for (const b of [0, 1, 0x80, 0xff]) {



    assert.equal(



      w.axisMapPov(b),



      managerPollA6de60AxisMapIsPov(b) ? 1 : 0,



      `axisMapPov ${b}`,



    );



  }



  assert.equal(w.failClear(), managerPollA6de60QueryFailClearValue());







  for (const i of [0, 1, -1, 5, 0x80000000]) {



    assert.equal(



      w.idxAfterRm(i | 0) | 0,



      managerPollA6da10IndexAfterRemove(i),



      `idxAfterRm ${i}`,



    );



  }



  for (const cb of [0, 1, 0xdead, 0xffffffff]) {



    assert.equal(



      w.discCb(cb >>> 0),



      managerPollA6da10DisconnectCbNeeded(cb) ? 1 : 0,



      `discCb ${cb}`,



    );



  }



  for (const b of [0, 1, 0xff]) {



    assert.equal(



      w.freeCom(b),



      managerPollA6da10FreeComMaps(b) ? 1 : 0,



      `freeCom ${b}`,



    );



  }



  const moveCases = [



    [0x1010, 0x1000, 0],



    [0x1010, 0x1000, 1],



    [0x1010, 0x1000, 3],



    [0x1000, 0x1000, 0],



    [0, 0, 0],



    [0xffffffff, 0, 0],



  ];



  for (const [end, begin, idx] of moveCases) {



    assert.equal(



      w.rmMoveBytes(end >>> 0, begin >>> 0, idx >>> 0) >>> 0,



      managerPollA6da10RemoveMoveBytes(end, begin, idx) >>> 0,



      `rmMoveBytes end=${end} begin=${begin} idx=${idx}`,



    );



  }



  for (const end of [0, 4, 0x1010, 0xffffffff]) {



    assert.equal(



      w.endAfterRm(end >>> 0) >>> 0,



      managerPollA6da10EndAfterRemove(end) >>> 0,



      `endAfterRm ${end}`,



    );



  }



  for (const cl of [0, 1, 2, 3, 4, 0xff]) {



    assert.equal(



      w.a648Mode(cl),



      managerPollA648b0Mode(cl),



      `a648Mode ${cl}`,



    );



  }



  const allocCases = [



    [0, 0],



    [0x10, 0],



    [0x10, 1],



    [0xfffffffc, 0],



    [0xffffffff, 0],



    [0, 0xffffffff],



  ];



  for (const [lo, hi] of allocCases) {



    assert.equal(



      w.a648Alloc(lo >>> 0, hi >>> 0) >>> 0,



      managerPollA648b0AllocMallocSize(lo, hi) >>> 0,



      `a648Alloc ${lo},${hi}`,



    );



  }



  const subCases = [



    [10, 0, 3],



    [1, 1, 2],



    [0, 0, 1],



    [0xffffffff, 0xffffffff, 1],



    [5, 2, 5],



  ];



  {



    const base = 12288;



    const dv = new DataView(w.memory.buffer);



    for (const [tLo, tHi, sz] of subCases) {



      const js = managerPollA648b0TrackerSubSize(tLo, tHi, sz);



      w.a648Sub(tLo >>> 0, tHi >>> 0, sz >>> 0, base, base + 4);



      assert.equal(dv.getUint32(base, true), js.lo, `a648Sub lo ${tLo}`);



      assert.equal(dv.getUint32(base + 4, true), js.hi, `a648Sub hi ${tLo}`);



    }



    const addCases = [



      [1, 0, 2, 0],



      [0xffffffff, 0, 1, 0],



      [0xffffffff, 0, 1, 1],



      [0, 0, 0, 0],



      [0xfffffffe, 0, 3, 0],



    ];



    for (const [tLo, tHi, aLo, aHi] of addCases) {



      const js = managerPollA648b0TrackerAdd(tLo, tHi, aLo, aHi);



      w.a648Add(tLo >>> 0, tHi >>> 0, aLo >>> 0, aHi >>> 0, base, base + 4);



      assert.equal(dv.getUint32(base, true), js.lo, `a648Add lo ${tLo}`);



      assert.equal(dv.getUint32(base + 4, true), js.hi, `a648Add hi ${tLo}`);



    }



  }







  // ABI v7: FUN_00a1fc00 + FUN_00a1f280 pure islands



  for (const p of [0, 1, 0xc57b2c, 0xffffffff]) {



    assert.equal(



      w.a1fcLock(p >>> 0),



      managerPollA1fc00LockObjPresent(p) ? 1 : 0,



      `a1fcLock ${p}`,



    );



  }



  const qLoop = [



    [0, 0],



    [0x1000, 0x1000],



    [0x1000, 0x1008],



    [0xffffffff, 0],



  ];



  for (const [b, e] of qLoop) {



    assert.equal(



      w.a1fcQLoop(b >>> 0, e >>> 0),



      managerPollA1fc00QueueLoopNeeded(b, e) ? 1 : 0,



      `a1fcQLoop ${b},${e}`,



    );



  }



  const qCount = [



    [0x1018, 0x1000],



    [0x1000, 0x1000],



    [0, 8],



    [0x20, 0],



    [0, 0],



  ];



  for (const [end, begin] of qCount) {



    assert.equal(



      w.a1fcQCount(end | 0, begin | 0) | 0,



      managerPollA1fc00QueueCount(end, begin),



      `a1fcQCount end=${end} begin=${begin}`,



    );



  }



  for (const f of [0, 1, 2, 3, 0xff, 0x80]) {



    assert.equal(



      w.a1fcActive(f),



      managerPollA1fc00EntryAlreadyActive(f) ? 1 : 0,



      `a1fcActive ${f}`,



    );



    assert.equal(



      w.a1fcMark(f) & 0xffff,



      managerPollA1fc00EntryMarkActive(f),



      `a1fcMark ${f}`,



    );



  }



  for (const c of [0, 1, 4, 0xffffffff]) {



    assert.equal(



      w.a1fcSlotUse(c >>> 0),



      managerPollA1fc00SlotTableUsable(c) ? 1 : 0,



      `a1fcSlotUse ${c}`,



    );



  }



  for (const k of [0, 1, 0xdead, 0xffffffff]) {



    assert.equal(



      w.a1fcSlotFree(k >>> 0),



      managerPollA1fc00SlotIsFree(k) ? 1 : 0,



      `a1fcSlotFree ${k}`,



    );



  }



  for (const [i, c] of [[0, 2], [1, 2], [0, 0], [0xffffffff, 1]]) {



    assert.equal(



      w.a1fcSlotCont(i >>> 0, c >>> 0),



      managerPollA1fc00SlotIndexContinue(i, c) ? 1 : 0,



      `a1fcSlotCont ${i}/${c}`,



    );



  }



  {



    const base = 16384;



    const dv = new DataView(w.memory.buffer);



    const tables = [



      { keys: [], count: 0 },



      { keys: [1, 2, 3], count: 3 },



      { keys: [1, 0, 3], count: 3 },



      { keys: [0, 0], count: 2 },



      { keys: [0xffffffff, 0, 5], count: 3 },



    ];



    for (const t of tables) {



      for (let i = 0; i < t.keys.length; i += 1) {



        dv.setUint32(base + i * 4, t.keys[i] >>> 0, true);



      }



      const js = managerPollA1fc00SlotFindFree(t.keys, t.count);



      const nat = w.a1fcSlotFind(t.count === 0 ? 0 : base, t.count >>> 0) >>> 0;



      assert.equal(nat, js >>> 0, `a1fcSlotFind ${JSON.stringify(t.keys)}`);



    }



  }



  for (const end of [0, 8, 0x1010, 0xffffffff]) {



    assert.equal(



      w.a1fcEndErase(end >>> 0) >>> 0,



      managerPollA1fc00QueueEndAfterErase(end) >>> 0,



      `a1fcEndErase ${end}`,



    );



    assert.equal(



      w.a1fcIterAdv(end >>> 0) >>> 0,



      managerPollA1fc00IterAdvance(end) >>> 0,



      `a1fcIterAdv ${end}`,



    );



    assert.equal(



      w.a1fcPushEnd(end >>> 0) >>> 0,



      managerPollA1fc00PendingEndAfterPush(end) >>> 0,



      `a1fcPushEnd ${end}`,



    );



  }



  for (const [it, end] of [[0x1000, 0x1008], [0x1008, 0x1008], [0, 0]]) {



    assert.equal(



      w.a1fcIterCont(it >>> 0, end >>> 0),



      managerPollA1fc00IterContinue(it, end) ? 1 : 0,



      `a1fcIterCont ${it},${end}`,



    );



  }



  for (const [e, c] of [[0x10, 0x10], [0x10, 0x18], [0, 0]]) {



    assert.equal(



      w.a1fcGrow(e >>> 0, c >>> 0),



      managerPollA1fc00PendingNeedsGrow(e, c) ? 1 : 0,



      `a1fcGrow ${e},${c}`,



    );



  }



  const capCases = [



    [0x1010, 0x1000],



    [0x1007, 0x1000],



    [0x2000, 0x1000],



    [0, 0],



    [0xffffffff, 0],



  ];



  for (const [cap, begin] of capCases) {



    assert.equal(



      w.a1fcCapBytes(cap >>> 0, begin >>> 0) >>> 0,



      managerPollA1fc00PendingCapacityBytes(cap, begin) >>> 0,



      `a1fcCapBytes ${cap},${begin}`,



    );



  }



  for (const s of [0, 0xfff, 0x1000, 0x1001, 0xffffffff]) {



    assert.equal(



      w.a1fcFreeHdr(s >>> 0),



      managerPollA1fc00FreeUsesHeapHeader(s) ? 1 : 0,



      `a1fcFreeHdr ${s}`,



    );



    assert.equal(



      w.a1fcFreeSz(s >>> 0) >>> 0,



      managerPollA1fc00FreeHeaderSize(s) >>> 0,



      `a1fcFreeSz ${s}`,



    );



  }



  const offCases = [



    [0x1004, 0x1000],



    [0x1023, 0x1000],



    [0x1024, 0x1000],



    [0x1000, 0x1000],



    [0, 0],



  ];



  for (const [begin, header] of offCases) {



    assert.equal(



      w.a1fcFreeOff(begin >>> 0, header >>> 0),



      managerPollA1fc00FreeHeaderOffsetOk(begin, header) ? 1 : 0,



      `a1fcFreeOff ${begin},${header}`,



    );



  }



  for (const cb of [0, 1, 0xdeadbeef, 0xffffffff]) {



    assert.equal(



      w.a1fcNotify(cb >>> 0),



      managerPollA1fc00NotifyCbNeeded(cb) ? 1 : 0,



      `a1fcNotify ${cb}`,



    );



  }



  const bufCases = [



    [0x1020, 0x1000],



    [0x1000, 0x1000],



    [0x1010, 0x1000],



    [0, 0x10],



    [0x40, 0],



  ];



  for (const [end, begin] of bufCases) {



    assert.equal(



      w.a1f280Buf(end | 0, begin | 0) | 0,



      managerPollA1f280BufferBytes(end, begin),



      `a1f280Buf end=${end} begin=${begin}`,



    );



  }



  const dirCases = [



    [0, 0.5],



    [0.5, 0.5],



    [0.6, 0.5],



    [-0.6, 0.5],



    [-0.5, 0.5],



    [1, 0],



    [-1, 0],



    [Number.NaN, 0.5],



    [0.5, Number.NaN],



  ];



  for (const [v, t] of dirCases) {



    assert.equal(



      w.a1f280Dir(v, t),



      managerPollA1f280AxisDir(v, t),



      `a1f280Dir v=${v} t=${t}`,



    );



  }



  const pairCases = [



    [0, 0, 0.5, 0],



    [0.9, -0.9, 0.5, 0],



    [0.9, -0.9, 0.5, 4],



    [-0.9, 0.9, 0.3, 0],



    [-0.9, 0.9, 0.3, 4],



    [0, 0, 0.5, 4],



  ];



  for (const [x, y, t, base] of pairCases) {



    assert.equal(



      w.a1f280Pair(x, y, t, base >>> 0) >>> 0,



      managerPollA1f280AxisPairBits(x, y, t, base) >>> 0,



      `a1f280Pair x=${x} y=${y} base=${base}`,



    );



  }







  // ABI v8: deeper a1f280 / a1eed0 pure islands



  for (const [end, begin] of bufCases) {



    assert.equal(



      w.a1f280Count(end | 0, begin | 0) | 0,



      managerPollA1f280BufferCount(end, begin),



      `a1f280Count end=${end} begin=${begin}`,



    );



  }



  const remapCases = [



    [0, 0.25],



    [0.25, 0.25],



    [-0.25, 0.25],



    [0.75, 0.25],



    [-0.75, 0.25],



    [1, 0.5],



    [-1, 0.5],



    [0.1, 0.5],



    [Number.NaN, 0.25],



    [0.5, Number.NaN],



  ];



  for (const [v, t] of remapCases) {



    assert.equal(



      w.a1eed0Remap(v, t),



      managerPollA1eed0DeadzoneRemap(v, t),



      `a1eed0Remap v=${v} t=${t}`,



    );



  }



  const splitCases = [0, 0.5, -0.5, 1, -1, Number.NaN, -0];



  for (const v of splitCases) {



    assert.equal(



      w.a1f280Neg(v),



      managerPollA1f280AxisNegPart(v),



      `a1f280Neg ${v}`,



    );



    assert.equal(



      w.a1f280Pos(v),



      managerPollA1f280AxisPosPart(v),



      `a1f280Pos ${v}`,



    );



  }



  for (const m of [0, 3, 4, 5, 0xffffffff]) {



    assert.equal(



      w.a1f280Idle(m >>> 0),



      managerPollA1f280ActionModeIdle(m) ? 1 : 0,



      `a1f280Idle ${m}`,



    );



  }



  for (const id of [-1, 0, 1, 42, 0x7fffffff, -2]) {



    assert.equal(



      w.a1f280IdOk(id | 0),



      managerPollA1f280ActionIdValid(id) ? 1 : 0,



      `a1f280IdOk ${id}`,



    );



  }



  for (const [i, c] of [[0, 2], [1, 2], [2, 2], [0, 0], [0xffffffff, 1]]) {



    assert.equal(



      w.a1f280IdxOk(i >>> 0, c | 0),



      managerPollA1f280BufferIndexInRange(i, c) ? 1 : 0,



      `a1f280IdxOk ${i}/${c}`,



    );



  }



  for (const [cc, idx] of [[0, 0], [1, 2], [4, 0], [0, 1], [0xffffffff, 1]]) {



    assert.equal(



      w.a1f280Slot(cc >>> 0, idx >>> 0) >>> 0,



      managerPollA1f280BufferSlotOffset(cc, idx) >>> 0,



      `a1f280Slot cc=${cc} idx=${idx}`,



    );



  }



  for (const f of [0, 1, 8, 0xf7, 0xff, 0x10]) {



    assert.equal(



      w.a1f280Rumble(f),



      managerPollA1f280RumblePathNeeded(f) ? 1 : 0,



      `a1f280Rumble ${f}`,



    );



  }



  for (const t of [0, 1, -1, 0.5, -0.25, Number.NaN]) {



    assert.equal(



      w.a1f280TimerPos(t),



      managerPollA1f280TimerPositive(t) ? 1 : 0,



      `a1f280TimerPos ${t}`,



    );



    assert.equal(



      w.a1f280TimerClamp(t),



      managerPollA1f280TimerClampNonneg(t),



      `a1f280TimerClamp ${t}`,



    );



  }







  // ABI v9: a68490 pure + post-tick rumble scale



  const nsCases = [



    [1e9, 1e9],



    [2e9, 1e6],



    [0, 1e9],



    [1e7, 1e7],



    [3.5e12, 2.5e6],



  ];



  for (const [c, f] of nsCases) {



    assert.equal(



      w.a68490Ns(c, f),



      managerPollA68490NsF64(c, f),



      `a68490Ns c=${c} f=${f}`,



    );



  }



  const seedCases = [



    [0, 0],



    [1000, 0],



    [1000000, 0],



    [0xffffffff, 0],



    [0, 1],



    [0x89abcdef, 0x01234567],



    [0xffffffff, 0xffffffff],



  ];



  for (const [lo, hi] of seedCases) {



    const js = managerPollA1f280ScaleTick(lo, hi);



    assert.equal(



      w.a1f280ScaleLo(lo >>> 0, hi >>> 0) >>> 0,



      js.lo >>> 0,



      `scaleLo seed=${lo},${hi}`,



    );



    assert.equal(



      w.a1f280ScaleHi(lo >>> 0, hi >>> 0) >>> 0,



      js.hi >>> 0,



      `scaleHi seed=${lo},${hi}`,



    );



  }



  const deltaCases = [



    [10, 0, 3, 0],



    [0, 1, 1, 0],



    [5, 0, 5, 0],



    [0, 0, 1, 0],



    [0xffffffff, 0xffffffff, 1, 0],



    [100, 2, 50, 1],



  ];



  for (const [sl, sh, bl, bh] of deltaCases) {



    const js = managerPollA1f280TickDelta(sl, sh, bl, bh);



    assert.equal(



      w.a1f280DeltaLo(sl >>> 0, sh >>> 0, bl >>> 0, bh >>> 0) >>> 0,



      js.lo >>> 0,



      `deltaLo ${sl},${sh}-${bl},${bh}`,



    );



    assert.equal(



      w.a1f280DeltaHi(sl >>> 0, sh >>> 0, bl >>> 0, bh >>> 0) >>> 0,



      js.hi >>> 0,



      `deltaHi ${sl},${sh}-${bl},${bh}`,



    );



    assert.equal(



      w.a1f280DeltaNz(js.lo >>> 0, js.hi >>> 0),



      managerPollA1f280TickDeltaNonzero(js.lo, js.hi) ? 1 : 0,



      `deltaNz ${js.lo},${js.hi}`,



    );



  }



  for (const d of [0, 1, 1000, 16666, 1e6, 1e9, -1]) {



    assert.equal(



      w.a1f280DeltaSec(d),



      managerPollA1f280TickDeltaSecondsF32(d),



      `deltaSec ${d}`,



    );



  }



  const timerSubCases = [



    [1, 0.25],



    [0.5, 0.5],



    [0, 0],



    [10, 0.016],



    [-1, 0.5],



  ];



  for (const [t, d] of timerSubCases) {



    assert.equal(



      w.a1f280TimerSub(t, d),



      managerPollA1f280TimerSubDelta(t, d),



      `timerSub t=${t} d=${d}`,



    );



  }



  for (const t of [0, 1, -1, 0.5, -0.25, Number.NaN]) {



    assert.equal(



      w.a1f280IntActive(t),



      managerPollA1f280RumbleIntensityActive(t) ? 1 : 0,



      `intActive ${t}`,



    );



  }







  // ABI v10: rumble vcall arg prep around 0x00a1f65a



  assert.equal(w.a1f280VtblSlot() >>> 0, managerPollA1f280RumbleVtblSlot());



  assert.equal(w.a1f280Success(), managerPollA1f280SuccessReturn());



  const vcallCases = [



    [1.5, 0.75],



    [0, 0.75],



    [-0.5, 0.75],



    [0.001, 1],



    [Number.NaN, 0.5],



    [2, 0],



  ];



  for (const [t, saved] of vcallCases) {



    const jsT = managerPollA1f280RumbleVcallTimer(t);



    const jsI = managerPollA1f280RumbleVcallIntensity(t, saved);



    const natT = w.a1f280VcallT(t);



    const natI = w.a1f280VcallI(t, saved);



    if (Number.isNaN(jsT)) {



      assert.ok(Number.isNaN(natT), `vcallT NaN t=${t}`);



    } else {



      assert.equal(natT, jsT, `vcallT t=${t}`);



    }



    assert.equal(natI, jsI, `vcallI t=${t} saved=${saved}`);



    assert.equal(



      w.a1f280TimerGate(t),



      managerPollA1f280RumbleTimerAfterGate(t),



      `timerGate t=${t}`,



    );



    {



      const base = 20480;



      const f32 = new Float32Array(w.memory.buffer, base, 2);



      w.a1f280VcallArgs(t, saved, base, base + 4);



      const js = managerPollA1f280RumbleVcallArgs(t, saved);



      if (Number.isNaN(js.timer)) {



        assert.ok(Number.isNaN(f32[0]), `vcallArgs timer NaN t=${t}`);



      } else {



        assert.equal(f32[0], js.timer, `vcallArgs timer t=${t}`);



      }



      assert.equal(f32[1], js.intensity, `vcallArgs intensity t=${t}`);



    }



  }



  for (const t of [0, 1, -1, -0.01, 0.01, Number.NaN]) {



    assert.equal(



      w.a1f280NegPath(t),



      managerPollA1f280RumbleNegTimerPath(t) ? 1 : 0,



      `negPath ${t}`,



    );



  }



  {



    const base = 24576;



    const dv = new DataView(w.memory.buffer);



    const baseCases = [



      [0, 0],



      [1, 2],



      [0x12345678, 0x9abcdef0],



      [0xffffffff, 0xffffffff],



    ];



    for (const [lo, hi] of baseCases) {



      const js = managerPollA1f280BaselineStore(lo, hi);



      w.a1f280Baseline(lo >>> 0, hi >>> 0, base, base + 4);



      assert.equal(dv.getUint32(base, true), js.lo, `baseline lo ${lo}`);



      assert.equal(dv.getUint32(base + 4, true), js.hi, `baseline hi ${hi}`);



    }



  }







  // ABI v11: FUN_00a112c0 pure CF / message ptrs



  assert.equal(w.a112c0HostVa() >>> 0, a112c0HostVa());



  assert.equal(w.a112c0FmtVa() >>> 0, a112c0FmtVa());



  assert.equal(w.a112c0BufCap() >>> 0, a112c0BufCap());



  assert.equal(w.a112c0LvlAssert() >>> 0, a112c0LevelAssert());



  assert.equal(w.a112c0MsgMutex() >>> 0, a112c0MsgVaInvalidMutex());



  assert.equal(w.a112c0MsgOor() >>> 0, a112c0MsgVaActionIdOor());







  for (const s of [0, 1, 2, -1, 0x7fffffff]) {



    assert.equal(



      w.a112c0Reenter(s | 0),



      a112c0ReenterSkip(s) ? 1 : 0,



      `reenter ${s}`,



    );



    assert.equal(



      w.a112c0Init(s | 0),



      a112c0InitNeeded(s) ? 1 : 0,



      `initNeeded ${s}`,



    );



  }



  for (const al of [0, 1, 0xff, 2]) {



    assert.equal(



      w.a112c0StateInit(al),



      a112c0StateAfterInit(al),



      `stateAfterInit ${al}`,



    );



  }



  for (const f of [0, 1, 0xff]) {



    assert.equal(



      w.a112c0PrefixEn(f),



      a112c0PrefixEnabled(f) ? 1 : 0,



      `prefixEn ${f}`,



    );



  }







  const sinkCases = [



    [0, 0, 0],



    [0, 0xff, 0x10],



    [1, 0, 0x10],



    [1, 0x10, 0x10],



    [0xdead, 0xff, 0x08],



    [0xdead, 0x01, 0x10],



    [0x1000, 0x100, 0x100],



  ];



  for (const [ptr, mask, lvl] of sinkCases) {



    assert.equal(



      w.a112c0Sink(ptr >>> 0, mask >>> 0, lvl >>> 0),



      a112c0SinkActive(ptr, mask, lvl) ? 1 : 0,



      `sink ${ptr},${mask},${lvl}`,



    );



    assert.equal(



      w.a112c0SinkWrite(ptr >>> 0, mask >>> 0, lvl >>> 0),



      a112c0SinkWriteNeeded(ptr, mask, lvl) ? 1 : 0,



      `sinkWrite ${ptr},${mask},${lvl}`,



    );



  }







  const a112c0BodyCases = [



    [1, 0x1, 0xff, 0x10],



    [0, 0, 0, 0],



    [0, 0, 0, 0x10],



    [2, 0x1, 0x10, 0x10],



    [0, 0, 0, 0x100],



    [0, 0x1, 0x100, 0x100],



    [0, 0, 0, 1],



    [2, 0, 0, 0],



  ];



  for (const [st, ptr, mask, lvl] of a112c0BodyCases) {



    assert.equal(



      w.a112c0Body(st | 0, ptr >>> 0, mask >>> 0, lvl >>> 0),



      a112c0BodyNeeded(st, ptr, mask, lvl) ? 1 : 0,



      `body st=${st} lvl=${lvl}`,



    );



  }







  const levelCases = [



    0, 1, 2, 3, 4, 5, 7, 8, 0x10, 0x11, 0x20, 0x100, 0xffffffff,



  ];



  for (const lvl of levelCases) {



    assert.equal(



      w.a112c0PrefixVa(lvl >>> 0) >>> 0,



      a112c0PrefixVa(lvl) >>> 0,



      `prefixVa ${lvl}`,



    );



    assert.equal(



      w.a112c0Ods(lvl >>> 0),



      a112c0OdsNeeded(lvl) ? 1 : 0,



      `ods ${lvl}`,



    );



  }







  for (const len of [0, 1, 9, 0x100, 0x2800, 0x2801, 0xffffffff]) {



    assert.equal(



      w.a112c0BufRem(len >>> 0) >>> 0,



      a112c0BufRemaining(len) >>> 0,



      `bufRem ${len}`,



    );



  }



  for (const ch of [0, 0x0a, 0x0d, 0x20, 0xff]) {



    assert.equal(



      w.a112c0TrailNl(ch),



      a112c0TrailNewline(ch) ? 1 : 0,



      `trailNl ${ch}`,



    );



  }



  for (const [i, c] of [[0, 2], [1, 2], [2, 2], [0, 0], [0xffffffff, 1]]) {



    assert.equal(



      w.a1f280OorLog(i >>> 0, c | 0),



      managerPollA1f280ActionIdOorLogNeeded(i, c) ? 1 : 0,



      `oorLog ${i}/${c}`,



    );



  }







  // ABI v12: action-query vcall+0x3c pure arg/gate CF @ 0x00a1f4db



  assert.equal(



    w.a1f280QueryVtbl() >>> 0,



    managerPollA1f280ActionQueryVtblSlot() >>> 0,



  );



  assert.equal(



    w.a1f280QueryVa() >>> 0,



    managerPollA1f280ActionQueryCallVa() >>> 0,



  );



  assert.equal(w.a1f280QueryArg() | 0, managerPollA1f280ActionQueryVcallArg());



  assert.equal(



    w.a1f280IdxAfter() >>> 0,



    managerPollA1f280ActionIndexAfterPush() >>> 0,



  );



  assert.equal(



    w.a1f280ModeAfter() >>> 0,



    managerPollA1f280ActionModeAfterPush() >>> 0,



  );



  for (const m of [0, 3, 4, 5, 0xffffffff, 1, 0x7fffffff]) {



    assert.equal(



      w.a1f280QueryNeeded(m >>> 0),



      managerPollA1f280ActionQueryVcallNeeded(m) ? 1 : 0,



      `queryNeeded mode=${m}`,



    );



  }







  // ABI v13 retained: fill vcall+0x80 pure arg/gate CF @ 0x00a1f3f8



  assert.equal(w.a1f280FillVtbl() >>> 0, managerPollA1f280FillVtblSlot() >>> 0);



  assert.equal(w.a1f280FillVa() >>> 0, managerPollA1f280FillCallVa() >>> 0);



  assert.equal(



    w.a1f280FillP0Va() >>> 0,



    managerPollA1f280FillPair0CallVa() >>> 0,



  );



  assert.equal(



    w.a1f280AxisFillVtbl() >>> 0,



    managerPollA1f280AxisFillVtblSlot() >>> 0,



  );



  assert.equal(w.a1f280FillP1Arg() | 0, managerPollA1f280FillPair1Arg());



  assert.equal(w.a1f280FillP0Arg() | 0, managerPollA1f280FillPair0Arg());



  assert.equal(



    w.a1f280FillAxisBase() >>> 0,



    managerPollA1f280FillAxisStoreBasePair1() >>> 0,



  );



  assert.equal(



    w.a1f280FillDirBase() >>> 0,



    managerPollA1f280FillDirBitBasePair1() >>> 0,



  );



  for (const al of [0, 1, 2, 0x7f, 0x80, 0xff, 0x100, 0x101, 0xffffffff]) {



    assert.equal(



      w.a1f280FillOk(al >>> 0),



      managerPollA1f280FillVcallOk(al) ? 1 : 0,



      `fillOk al=${al >>> 0}`,



    );



  }







  // ABI v14 retained: axis-fill vcall+0x7c pure out-buffer / field CF @ 0x00a1f40d



  assert.equal(



    w.a1f280AxisFillVa() >>> 0,



    managerPollA1f280AxisFillCallVa() >>> 0,



  );



  assert.equal(



    w.a1f280AxisFillP0Va() >>> 0,



    managerPollA1f280AxisFillPair0CallVa() >>> 0,



  );



  assert.equal(



    w.a1eed0AxisFillVa() >>> 0,



    managerPollA1eed0AxisFillCallVa() >>> 0,



  );



  assert.equal(



    w.a1f280AxisFillOutN() >>> 0,



    managerPollA1f280AxisFillOutFloatCount() >>> 0,



  );



  assert.equal(



    w.a1f280AxisFillOutX() >>> 0,



    managerPollA1f280AxisFillOutXOfs() >>> 0,



  );



  assert.equal(



    w.a1f280AxisFillOutY() >>> 0,



    managerPollA1f280AxisFillOutYOfs() >>> 0,



  );



  assert.equal(



    w.a1f280DirThreshOfs() >>> 0,



    managerPollA1f280DirThreshOfs() >>> 0,



  );



  assert.equal(



    w.a1f280RemapThreshOfs() >>> 0,



    managerPollA1f280RemapThreshOfs() >>> 0,



  );



  assert.equal(w.a1f280DirBitsOfs() >>> 0, managerPollA1f280DirBitsOfs() >>> 0);



  assert.equal(



    w.a1f280FillAxisBaseP0() >>> 0,



    managerPollA1f280FillAxisStoreBasePair0() >>> 0,



  );



  assert.equal(



    w.a1f280FillDirBaseP0() >>> 0,



    managerPollA1f280FillDirBitBasePair0() >>> 0,



  );



  const mergeCases = [



    [0, -1, 1, 0.2, 4],



    [0x0f, -1, 1, 0.2, 4],



    [0, 0.9, -0.9, 0.1, 0],



    [0x33, 0.05, -0.05, 0.2, 4],



    [0, 0, 0, 0.5, 0],



    [0xffffffff, 2, -2, 0.5, 4],



    [0, 1, 1, 0, 0],



    [0x5, Number.NaN, 0.5, 0.2, 0],



  ];



  for (const [prior, x, y, t, base] of mergeCases) {



    const js = managerPollA1f280DirBitsMerge(prior, x, y, t, base) >>> 0;



    const nat = w.a1f280DirBitsMerge(prior >>> 0, x, y, t, base >>> 0) >>> 0;



    assert.equal(nat, js, `dirBitsMerge p=${prior} x=${x} y=${y} t=${t} b=${base}`);



  }







  // ABI v15: ready-gate vcall+0x78 pure arg/gate CF @ 0x00a1f30a



  assert.equal(w.a1f280ReadyVtbl() >>> 0, managerPollA1f280ReadyVtblSlot() >>> 0);



  assert.equal(w.a1f280ReadyVa() >>> 0, managerPollA1f280ReadyCallVa() >>> 0);



  for (const al of [0, 1, 2, 0x7f, 0x80, 0xff, 0x100, 0x101, 0xffffffff]) {



    assert.equal(



      w.a1f280ReadyOk(al >>> 0),



      managerPollA1f280ReadyVcallOk(al) ? 1 : 0,



      `readyOk al=${al >>> 0}`,



    );



    assert.equal(



      w.a1f280ReadyEarly(al >>> 0),



      managerPollA1f280ReadyEarlyReturn(al) ? 1 : 0,



      `readyEarly al=${al >>> 0}`,



    );



  }







  // ABI v16: a648b0 tracked-heap CF



  assert.equal(w.a648HeaderBytes() >>> 0, managerPollA648b0HeaderBytes());



  assert.equal(w.a648OomCode() >>> 0, managerPollA648b0OomCode());



  assert.equal(w.a648OomVa() >>> 0, managerPollA648b0OomHostVa());



  assert.equal(w.a648MallocVa() >>> 0, managerPollA648b0MallocIatVa());



  assert.equal(w.a648FreeVa() >>> 0, managerPollA648b0FreeIatVa());







  const ctxCases = [



    0, 1, 0x30, 0x1000, 0x00c7de78, 0x7fffffff, 0xfffffff0, 0xffffffff,



  ];



  for (const ctx of ctxCases) {



    assert.equal(



      w.a648TrackerBase(ctx >>> 0) >>> 0,



      managerPollA648b0TrackerBase(ctx),



      `trackerBase ${ctx >>> 0}`,



    );



    assert.equal(



      w.a648AccountTarget(ctx >>> 0) >>> 0,



      managerPollA648b0AccountTarget(ctx),



      `accountTarget ${ctx >>> 0}`,



    );



  }







  const sizeCases = [



    [0, 0], [1, 0], [4, 0], [0x14, 0], [0x140, 0],



    [0xfffffffb, 0], [0xfffffffc, 0], [0xfffffffe, 0], [0xffffffff, 0],



    [0, 1], [0x40, 1], [0xffffffff, 0xffffffff], [7, 0x80000000],



  ];



  for (const [lo, hi] of sizeCases) {



    const label = `${lo >>> 0},${hi >>> 0}`;



    assert.equal(



      w.a648ClampNeeded(hi >>> 0),



      managerPollA648b0AllocClampNeeded(hi) ? 1 : 0,



      `clampNeeded ${label}`,



    );



    assert.equal(



      w.a648ClampedLo(lo >>> 0, hi >>> 0) >>> 0,



      managerPollA648b0AllocSizeClampedLo(lo, hi),



      `clampedLo ${label}`,



    );



    assert.equal(



      w.a648Alloc(lo >>> 0, hi >>> 0) >>> 0,



      managerPollA648b0AllocMallocSize(lo, hi),



      `mallocSize ${label}`,



    );



    assert.equal(



      w.a648MallocHi(lo >>> 0, hi >>> 0) >>> 0,



      managerPollA648b0AllocMallocSizeHi(lo, hi),



      `mallocSizeHi ${label}`,



    );



    assert.equal(



      w.a648HeaderValue(lo >>> 0, hi >>> 0) >>> 0,



      managerPollA648b0AllocHeaderValue(lo, hi),



      `headerValue ${label}`,



    );



  }







  const ptrCases = [0, 1, 3, 4, 0x1000, 0x1004, 0x7ffffffc, 0xfffffffc, 0xffffffff];



  for (const p of ptrCases) {



    assert.equal(



      w.a648AllocOk(p >>> 0),



      managerPollA648b0AllocOk(p) ? 1 : 0,



      `allocOk ${p >>> 0}`,



    );



    assert.equal(



      w.a648Payload(p >>> 0) >>> 0,



      managerPollA648b0AllocPayloadPtr(p),



      `payload ${p >>> 0}`,



    );



    assert.equal(



      w.a648AllocReturn(p >>> 0) >>> 0,



      managerPollA648b0AllocReturn(p),



      `allocReturn ${p >>> 0}`,



    );



    assert.equal(



      w.a648FreeNeeded(p >>> 0),



      managerPollA648b0FreeNeeded(p) ? 1 : 0,



      `freeNeeded ${p >>> 0}`,



    );



    assert.equal(



      w.a648FreeBlock(p >>> 0) >>> 0,



      managerPollA648b0FreeBlockPtr(p),



      `freeBlock ${p >>> 0}`,



    );



  }







  // ABI v16: a6da10 teardown plan



  assert.equal(w.a6da10ComSlot() >>> 0, managerPollA6da10ComReleaseVtblSlot());



  const slotCases = [



    [0, 0], [0x1000, 0], [0x1000, 1], [0x1000, 5],



    [0xfffffff8, 2], [0, 0x40000001], [0x10, 0xffffffff],



  ];



  for (const [begin, index] of slotCases) {



    const label = `${begin >>> 0},${index >>> 0}`;



    assert.equal(



      w.a6da10SlotOfs(index >>> 0) >>> 0,



      managerPollA6da10SlotByteOffset(index),



      `slotOfs ${label}`,



    );



    assert.equal(



      w.a6da10SlotAddr(begin >>> 0, index >>> 0) >>> 0,



      managerPollA6da10SlotAddr(begin, index),



      `slotAddr ${label}`,



    );



    assert.equal(



      w.a6da10MoveDst(begin >>> 0, index >>> 0) >>> 0,



      managerPollA6da10MemmoveDst(begin, index),



      `moveDst ${label}`,



    );



    assert.equal(



      w.a6da10MoveSrc(begin >>> 0, index >>> 0) >>> 0,



      managerPollA6da10MemmoveSrc(begin, index),



      `moveSrc ${label}`,



    );



  }



  {



    const dv = new DataView(w.memory.buffer);



    const base = 8192;



    for (const enable of [0, 1, 2, 0x80, 0xff]) {



      const js = managerPollA6da10TeardownPlan(enable);



      assert.equal(



        w.a6da10StepCount(enable) | 0,



        managerPollA6da10TeardownStepCount(enable),



        `stepCount ${enable}`,



      );



      // Fill with a sentinel so truncation behaviour is observable.



      for (let i = 0; i < 16; i += 1) dv.setInt32(base + i * 4, -7, true);



      const n = w.a6da10Plan(enable, base, 16) | 0;



      assert.equal(n, js.length, `planCount ${enable}`);



      for (let i = 0; i < n; i += 1) {



        assert.equal(dv.getInt32(base + i * 4, true), js[i], `plan[${i}] ${enable}`);



      }



      assert.equal(dv.getInt32(base + n * 4, true), -7, `plan tail ${enable}`);



      // Truncated / null writes still report the full count.



      for (let i = 0; i < 16; i += 1) dv.setInt32(base + i * 4, -7, true);



      assert.equal(w.a6da10Plan(enable, base, 2) | 0, js.length, `trunc ${enable}`);



      assert.equal(dv.getInt32(base + 8, true), -7, `trunc stop ${enable}`);



      assert.equal(w.a6da10Plan(enable, 0, 0) | 0, js.length, `null out ${enable}`);



    }



  }







  // ABI v16: a6dd30 axis store + callback frame



  assert.equal(w.a6dd30AxisBase() >>> 0, managerPollA6dd30AxisBaseOfs());



  assert.equal(w.a6dd30CbFrame() >>> 0, managerPollA6dd30CbFrameBytes());



  for (const i of [0, 1, 2, 7, 0x3fffffff, 0xfffffffe, 0xffffffff]) {



    assert.equal(



      w.a6dd30SlotX(i >>> 0) >>> 0,



      managerPollA6dd30AxisSlotOffset(i),



      `slotX ${i >>> 0}`,



    );



    assert.equal(



      w.a6dd30SlotY(i >>> 0) >>> 0,



      managerPollA6dd30AxisSlotOffsetY(i),



      `slotY ${i >>> 0}`,



    );



    assert.equal(



      w.a6dd30IndexAfterX(i >>> 0) >>> 0,



      managerPollA6dd30IndexAfterX(i),



      `indexAfterX ${i >>> 0}`,



    );



  }



  for (const id of [-1, 0, 1, 2, 3, 4, 5, 6, 99]) {



    assert.equal(



      w.a6dd30CbArgOfs(id | 0) >>> 0,



      managerPollA6dd30CbArgOfs(id),



      `cbArgOfs ${id}`,



    );



  }



  const cbCases = [



    [0, 0, 0], [0, 0, 1], [1, 0, 1], [1, 0, 0], [-1, 1, 0xdead],



    [0, -0, 1], [Number.NaN, 0, 1], [0, Number.NaN, 1],



    [Number.NaN, Number.NaN, 1], [Number.NaN, Number.NaN, 0],



    [1e-7, 0, 1], [Infinity, Infinity, 1], [Infinity, -Infinity, 1],



  ];



  for (const [nv, ov, cb] of cbCases) {



    assert.equal(



      w.a6dd30CbNeeded(Math.fround(nv), Math.fround(ov), cb >>> 0),



      managerPollA6dd30CbNeeded(Math.fround(nv), Math.fround(ov), cb) ? 1 : 0,



      `cbNeeded ${nv},${ov},${cb}`,



    );



  }







  // Deterministic randomized differential across the v16 surface.



  let seed = 0x1f6de60;



  const nextU32 = () => {



    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;



    return seed;



  };



  for (let i = 0; i < 512; i += 1) {



    const lo = nextU32();



    const hi = (nextU32() & 3) === 0 ? nextU32() : 0;



    assert.equal(



      w.a648Alloc(lo, hi) >>> 0,



      managerPollA648b0AllocMallocSize(lo, hi),



      `rand mallocSize ${lo},${hi}`,



    );



    assert.equal(



      w.a648MallocHi(lo, hi) >>> 0,



      managerPollA648b0AllocMallocSizeHi(lo, hi),



      `rand mallocSizeHi ${lo},${hi}`,



    );



    assert.equal(



      w.a648TrackerBase(lo) >>> 0,



      managerPollA648b0TrackerBase(lo),



      `rand trackerBase ${lo}`,



    );



    assert.equal(



      w.a648FreeBlock(lo) >>> 0,



      managerPollA648b0FreeBlockPtr(lo),



      `rand freeBlock ${lo}`,



    );



    assert.equal(



      w.a648AllocReturn(lo) >>> 0,



      managerPollA648b0AllocReturn(lo),



      `rand allocReturn ${lo}`,



    );



    const begin = nextU32();



    const idx = nextU32();



    assert.equal(



      w.a6da10SlotAddr(begin, idx) >>> 0,



      managerPollA6da10SlotAddr(begin, idx),



      `rand slotAddr ${begin},${idx}`,



    );



    assert.equal(



      w.a6da10MoveSrc(begin, idx) >>> 0,



      managerPollA6da10MemmoveSrc(begin, idx),



      `rand moveSrc ${begin},${idx}`,



    );



    assert.equal(



      w.a6dd30SlotY(idx) >>> 0,



      managerPollA6dd30AxisSlotOffsetY(idx),



      `rand slotY ${idx}`,



    );



    const pov = (nextU32() & 1) === 0 ? nextU32() % 36000 : nextU32();



    assert.equal(



      w.povAxis0(pov >>> 0),



      managerPollA6de60PovAxis0(pov),



      `rand pov0 ${pov}`,



    );



    assert.equal(



      w.povAxis1(pov >>> 0),



      managerPollA6de60PovAxis1(pov),



      `rand pov1 ${pov}`,



    );



    const nv = Math.fround((nextU32() / 0xffffffff) * 4 - 2);



    const ov = (nextU32() & 7) === 0 ? nv : Math.fround((nextU32() / 0xffffffff) * 4 - 2);



    const cb = (nextU32() & 3) === 0 ? 0 : nextU32();



    assert.equal(



      w.a6dd30CbNeeded(nv, ov, cb),



      managerPollA6dd30CbNeeded(nv, ov, cb) ? 1 : 0,



      `rand cbNeeded ${nv},${ov},${cb}`,



    );



  }







  // ABI v17: a6dab0 scan gates / slot loop



  assert.equal(w.a6dab0SlotCount() >>> 0, managerPollA6dab0SlotCount());



  assert.equal(w.a6dab0EnumVtbl() >>> 0, managerPollA6dab0EnumVtblSlot());



  assert.equal(w.a6dab0EnumCbVa() >>> 0, managerPollA6dab0EnumCallbackVa());



  assert.equal(w.a6dab0MsgEnumFail() >>> 0, managerPollA6dab0MsgVaEnumFail());



  assert.equal(w.a6dab0MsgConnect() >>> 0, managerPollA6dab0MsgVaConnect());



  assert.equal(w.a6dab0MsgCapsFail() >>> 0, managerPollA6dab0MsgVaCapsFail());



  assert.equal(w.a6dab0EnumFlagAfter() | 0, managerPollA6dab0EnumFlagAfter());



  assert.equal(w.a6dab0SlotClear() >>> 0, managerPollA6dab0SlotClearValue());



  assert.equal(w.a6dab0StateEnable() >>> 0, managerPollA6dab0StateEnableValue());







  for (const b of [0, 1, 2, 0x7f, 0x80, 0xff]) {



    assert.equal(



      w.a6dab0ScanEnabled(b),



      managerPollA6dab0ScanEnabled(b) ? 1 : 0,



      `scanEnabled ${b}`,



    );



    assert.equal(



      w.a6dab0EnumNeeded(b),



      managerPollA6dab0EnumNeeded(b) ? 1 : 0,



      `enumNeeded ${b}`,



    );



    assert.equal(



      w.a6dab0SlotScanNeeded(b),



      managerPollA6dab0SlotScanNeeded(b) ? 1 : 0,



      `slotScanNeeded ${b}`,



    );



  }



  for (const p of [0, 1, 0x10000, 0xffffffff]) {



    assert.equal(



      w.a6dab0PumpNeeded(p >>> 0),



      managerPollA6dab0PumpNeeded(p) ? 1 : 0,



      `pumpNeeded ${p >>> 0}`,



    );



    assert.equal(



      w.a6dab0ConnectCb(p >>> 0),



      managerPollA6dab0ConnectCbNeeded(p) ? 1 : 0,



      `connectCb ${p >>> 0}`,



    );



    assert.equal(



      w.a6dab0RecordPresent(p >>> 0),



      managerPollA6dab0RecordPresent(p) ? 1 : 0,



      `recordPresent ${p >>> 0}`,



    );



  }



  for (const slot of [0, 1, 2, 3, 4, 5, 0xfffffffe, 0xffffffff]) {



    assert.equal(



      w.a6dab0SlotContinue(slot >>> 0),



      managerPollA6dab0SlotContinue(slot) ? 1 : 0,



      `slotContinue ${slot >>> 0}`,



    );



    assert.equal(



      w.a6dab0SlotTableAddr(slot >>> 0) >>> 0,



      managerPollA6dab0SlotTableAddr(slot),



      `slotTableAddr ${slot >>> 0}`,



    );



    assert.equal(



      w.a6dab0NameTableAddr(slot >>> 0) >>> 0,



      managerPollA6dab0NameTableAddr(slot),



      `nameTableAddr ${slot >>> 0}`,



    );



  }



  for (const [status, rec] of [



    [0, 0], [0, 0x1000], [1, 0], [1, 0x1000], [-1, 0], [-1, 0x1000],



    [0x80000000 | 0, 0x20], [0x7fffffff, 0],



  ]) {



    const label = `${status | 0},${rec >>> 0}`;



    assert.equal(



      w.a6dab0QueryOk(status | 0),



      managerPollA6dab0QueryOk(status) ? 1 : 0,



      `queryOk ${label}`,



    );



    assert.equal(



      w.a6dab0ConnectNeeded(status | 0, rec >>> 0),



      managerPollA6dab0ConnectNeeded(status, rec) ? 1 : 0,



      `connectNeeded ${label}`,



    );



    assert.equal(



      w.a6dab0DisconnectNeeded(status | 0, rec >>> 0),



      managerPollA6dab0DisconnectNeeded(status, rec) ? 1 : 0,



      `disconnectNeeded ${label}`,



    );



  }



  for (const [mode, hook] of [[2, 0x1000], [2, 0], [0, 0x1000], [1, 1], [3, 9]]) {



    assert.equal(



      w.a6dab0CapsModeOk(mode >>> 0),



      managerPollA6dab0CapsModeOk(mode) ? 1 : 0,



      `capsModeOk ${mode}`,



    );



    assert.equal(



      w.a6dab0CapsCallNeeded(mode >>> 0, hook >>> 0),



      managerPollA6dab0CapsCallNeeded(mode, hook) ? 1 : 0,



      `capsCallNeeded ${mode},${hook}`,



    );



  }



  for (const s of [0, 1, -1, 5, 0x7fffffff]) {



    assert.equal(w.a6dab0CapsOk(s | 0), managerPollA6dab0CapsOk(s) ? 1 : 0, `capsOk ${s}`);



  }



  for (const raw of [0, 1, 0x045e, 0xffff, 0x10000, 0x1234abcd, 0xffffffff]) {



    assert.equal(



      w.a6dab0IdWord(raw >>> 0) >>> 0,



      managerPollA6dab0IdWord(raw),



      `idWord ${raw >>> 0}`,



    );



  }



  for (const c of [0, 1, 41, 0xfffffffe, 0xffffffff]) {



    assert.equal(



      w.a6dab0NextDeviceId(c >>> 0) >>> 0,



      managerPollA6dab0NextDeviceId(c),



      `nextDeviceId ${c >>> 0}`,



    );



  }



  for (let id = -2; id <= A6DAB0_REC_FIELD_COUNT + 1; id += 1) {



    assert.equal(



      w.a6dab0RecFieldOfs(id | 0) >>> 0,



      managerPollA6dab0RecordFieldOfs(id),



      `recFieldOfs ${id}`,



    );



    assert.equal(



      w.a6dab0StateFieldOfs(id | 0) >>> 0,



      managerPollA6dab0StateFieldOfs(id),



      `stateFieldOfs ${id}`,



    );



  }



  {



    const dv = new DataView(w.memory.buffer);



    const base = 8192;



    for (const n of [0, 1, 6, 0xf, 0xffffffff]) {



      dv.setUint32(base, 0xdeadbeef, true);



      dv.setUint32(base + 4, 0xdeadbeef, true);



      w.a6dab0AxisCalloc(n >>> 0, base, base + 4);



      const axis = managerPollA6dab0AxisCallocArgs(n);



      assert.equal(dv.getUint32(base, true), axis.num, `axisCalloc num ${n}`);



      assert.equal(dv.getUint32(base + 4, true), axis.size, `axisCalloc size ${n}`);



      w.a6dab0ButtonCalloc(n >>> 0, base, base + 4);



      const btn = managerPollA6dab0ButtonCallocArgs(n);



      assert.equal(dv.getUint32(base, true), btn.num, `buttonCalloc num ${n}`);



      assert.equal(dv.getUint32(base + 4, true), btn.size, `buttonCalloc size ${n}`);



      // Null out pointers must be ignored, not trap.



      w.a6dab0AxisCalloc(n >>> 0, 0, 0);



      w.a6dab0ButtonCalloc(n >>> 0, 0, 0);



    }



  }



  for (const [end, cap] of [



    [0, 0], [0x1000, 0x1000], [0x1000, 0x1004], [0xffffffff, 0xffffffff],



    [0xfffffffc, 0],



  ]) {



    assert.equal(



      w.a6dab0PushGrow(end >>> 0, cap >>> 0),



      managerPollA6dab0PushNeedsGrow(end, cap) ? 1 : 0,



      `pushGrow ${end >>> 0},${cap >>> 0}`,



    );



    assert.equal(



      w.a6dab0EndAfterPush(end >>> 0) >>> 0,



      managerPollA6dab0EndAfterPush(end),



      `endAfterPush ${end >>> 0}`,



    );



  }







  // ABI v17: device-id vector search



  for (const c of [0, 1, -1, 4, 0x7fffffff, 0x80000000 | 0]) {



    assert.equal(



      w.a6dab0SearchLoop(c | 0),



      managerPollA6dab0SearchLoopNeeded(c) ? 1 : 0,



      `searchLoop ${c | 0}`,



    );



  }



  for (const [i, c] of [



    [0, 3], [1, 3], [2, 3], [0, -1], [0xfffffffe, -1], [0xffffffff, 4], [5, 0],



  ]) {



    assert.equal(



      w.a6dab0SearchContinue(i >>> 0, c | 0),



      managerPollA6dab0SearchIndexContinue(i, c) ? 1 : 0,



      `searchContinue ${i >>> 0},${c | 0}`,



    );



  }



  {



    const dv = new DataView(w.memory.buffer);



    const base = 8192;



    const findCases = [



      [[], 5], [[5], 5], [[1, 2, 3], 3], [[1, 2, 3], 4], [[7, 7, 7], 7],



      [[0xffffffff, 0], 0xffffffff], [[0, 0xffffffff], 0],



      [[11, 22, 33, 44], 44], [[11, 22, 33, 44], 55],



    ];



    for (const [entries, target] of findCases) {



      for (let i = 0; i < entries.length; i += 1) {



        dv.setUint32(base + i * 4, entries[i] >>> 0, true);



      }



      assert.equal(



        w.a6dab0VectorFind(entries.length ? base : 0, entries.length, target >>> 0) >>> 0,



        managerPollA6dab0VectorFind(entries, entries.length, target),



        `vectorFind [${entries}] ${target >>> 0}`,



      );



    }



    // Truncated count only inspects the leading entries.



    dv.setUint32(base, 1, true);



    dv.setUint32(base + 4, 2, true);



    dv.setUint32(base + 8, 9, true);



    assert.equal(



      w.a6dab0VectorFind(base, 2, 9) >>> 0,



      managerPollA6dab0VectorFind([1, 2, 9], 2, 9),



    );



  }







  // Deterministic randomized differential over the v17 surface.



  let seed17 = 0x6dab0;



  const next17 = () => {



    seed17 = (Math.imul(seed17, 1664525) + 1013904223) >>> 0;



    return seed17;



  };



  {



    const dv = new DataView(w.memory.buffer);



    const base = 16384;



    for (let iter = 0; iter < 256; iter += 1) {



      const slot = (next17() & 7) === 0 ? next17() : next17() % 6;



      assert.equal(



        w.a6dab0SlotContinue(slot >>> 0),



        managerPollA6dab0SlotContinue(slot) ? 1 : 0,



        `rand slotContinue ${slot >>> 0}`,



      );



      assert.equal(



        w.a6dab0SlotTableAddr(slot >>> 0) >>> 0,



        managerPollA6dab0SlotTableAddr(slot),



        `rand slotTableAddr ${slot >>> 0}`,



      );



      const status = (next17() & 1) === 0 ? 0 : next17() | 0;



      const rec = (next17() & 1) === 0 ? 0 : next17();



      assert.equal(



        w.a6dab0ConnectNeeded(status | 0, rec >>> 0),



        managerPollA6dab0ConnectNeeded(status, rec) ? 1 : 0,



        `rand connectNeeded ${status | 0},${rec >>> 0}`,



      );



      assert.equal(



        w.a6dab0DisconnectNeeded(status | 0, rec >>> 0),



        managerPollA6dab0DisconnectNeeded(status, rec) ? 1 : 0,



        `rand disconnectNeeded ${status | 0},${rec >>> 0}`,



      );



      const counter = next17();



      assert.equal(



        w.a6dab0NextDeviceId(counter) >>> 0,



        managerPollA6dab0NextDeviceId(counter),



        `rand nextDeviceId ${counter}`,



      );



      assert.equal(



        w.a6dab0IdWord(counter) >>> 0,



        managerPollA6dab0IdWord(counter),



        `rand idWord ${counter}`,



      );



      const idx = next17();



      const cnt = (next17() & 3) === 0 ? next17() | 0 : (next17() % 8) | 0;



      assert.equal(



        w.a6dab0SearchContinue(idx >>> 0, cnt | 0),



        managerPollA6dab0SearchIndexContinue(idx, cnt) ? 1 : 0,



        `rand searchContinue ${idx >>> 0},${cnt | 0}`,



      );



      // Random small vector search.



      const n = next17() % 8;



      const entries = [];



      for (let i = 0; i < n; i += 1) {



        const v = (next17() & 1) === 0 ? next17() % 5 : next17();



        entries.push(v >>> 0);



        dv.setUint32(base + i * 4, v >>> 0, true);



      }



      const target = (next17() & 1) === 0 && n > 0



        ? entries[next17() % n]



        : next17() >>> 0;



      assert.equal(



        w.a6dab0VectorFind(n ? base : 0, n, target >>> 0) >>> 0,



        managerPollA6dab0VectorFind(entries, n, target),



        `rand vectorFind n=${n} t=${target >>> 0}`,



      );



      const end = next17();



      const cap = (next17() & 1) === 0 ? end : next17();



      assert.equal(



        w.a6dab0PushGrow(end, cap),



        managerPollA6dab0PushNeedsGrow(end, cap) ? 1 : 0,



        `rand pushGrow ${end},${cap}`,



      );



      assert.equal(



        w.a6dab0EndAfterPush(end) >>> 0,



        managerPollA6dab0EndAfterPush(end),



        `rand endAfterPush ${end}`,



      );



    }



  }







  // ABI v18: a220c0 poll thread



  assert.equal(w.a220c0SleepMs() >>> 0, managerPollA220c0SleepMs());



  assert.equal(w.a220c0ProcVa() >>> 0, managerPollA220c0ThreadProcVa());



  assert.equal(w.a220c0SpawnVtbl() >>> 0, managerPollA220c0SpawnVtblSlot());



  for (const f of [0, 1, 2, 3, 0xff, 0x100, 0x102, 0xfffffffd, 0xffffffff]) {



    const label = `${f >>> 0}`;



    assert.equal(



      w.a220c0Run(f >>> 0),



      managerPollA220c0ThreadRun(f) ? 1 : 0,



      `threadRun ${label}`,



    );



    assert.equal(



      w.a220c0Continue(f >>> 0),



      managerPollA220c0ThreadContinue(f) ? 1 : 0,



      `threadContinue ${label}`,



    );



    assert.equal(



      w.a220c0SpawnNeeded(f >>> 0),



      managerPollA220c0SpawnNeeded(f) ? 1 : 0,



      `spawnNeeded ${label}`,



    );



    assert.equal(



      w.a220c0FlagStart(f >>> 0) >>> 0,



      managerPollA220c0FlagAfterStart(f),



      `flagStart ${label}`,



    );



    assert.equal(



      w.a220c0FlagStop(f >>> 0) >>> 0,



      managerPollA220c0FlagAfterStop(f),



      `flagStop ${label}`,



    );



  }



  {



    const dv = new DataView(w.memory.buffer);



    const base = 8192;



    const seqs = [



      [], [0], [2], [2, 2], [2, 2, 2, 0, 2], [2, 2, 2, 2],



      [2, 0x100], [3, 3, 1], [0xffffffff, 0xfffffffd],



    ];



    for (const seq of seqs) {



      for (let i = 0; i < seq.length; i += 1) {



        dv.setUint32(base + i * 4, seq[i] >>> 0, true);



      }



      assert.equal(



        w.a220c0Iterations(seq.length ? base : 0, seq.length) >>> 0,



        managerPollA220c0ScanIterations(seq, seq.length),



        `scanIterations [${seq}]`,



      );



    }



  }







  // ABI v18: a6cf80 one-time init



  assert.equal(w.a6cf80ProbeCount() >>> 0, managerPollA6cf80ProbeCount());



  assert.equal(w.a6cf80CoinitFirst() >>> 0, managerPollA6cf80CoinitFlagsFirst());



  assert.equal(w.a6cf80CoinitRetryFlags() >>> 0, managerPollA6cf80CoinitFlagsRetry());



  assert.equal(w.a6cf80FilterBytes() >>> 0, managerPollA6cf80NotifyFilterBytes());



  assert.equal(w.a6cf80FilterCbsize() >>> 0, managerPollA6cf80NotifyFilterCbsize());



  assert.equal(w.a6cf80EnableAfter() >>> 0, managerPollA6cf80EnableAfterInit());



  assert.equal(w.a6cf80EnumFlagAfter() >>> 0, managerPollA6cf80EnumFlagAfterInit());



  for (const b of [0, 1, 2, 0x7f, 0xff]) {



    assert.equal(



      w.a6cf80InitSkip(b),



      managerPollA6cf80InitSkip(b) ? 1 : 0,



      `initSkip ${b}`,



    );



  }



  for (let p = -2; p <= 5; p += 1) {



    assert.equal(



      w.a6cf80ProbeNameVa(p | 0) >>> 0,



      managerPollA6cf80ProbeNameVa(p),



      `probeNameVa ${p}`,



    );



    assert.equal(



      w.a6cf80ModeForProbe(p | 0) >>> 0,



      managerPollA6cf80ModeForProbe(p),



      `modeForProbe ${p}`,



    );



  }



  for (const mode of [0, 1, 2, 3, 0xffffffff]) {



    assert.equal(



      w.a6cf80LogLevel(mode >>> 0) >>> 0,



      managerPollA6cf80LogLevelForMode(mode),



      `logLevel ${mode >>> 0}`,



    );



    assert.equal(



      w.a6cf80LogMsgVa(mode >>> 0) >>> 0,



      managerPollA6cf80LogMsgVaForMode(mode),



      `logMsgVa ${mode >>> 0}`,



    );



    assert.equal(



      w.a6cf80ScanFlagAfter(mode >>> 0) >>> 0,



      managerPollA6cf80ScanFlagAfter(mode),



      `scanFlagAfter ${mode >>> 0}`,



    );



    assert.equal(



      w.a6cf80CapsProbe(mode >>> 0),



      managerPollA6cf80CapsHookProbeNeeded(mode) ? 1 : 0,



      `capsProbe ${mode >>> 0}`,



    );



  }



  for (let s = -2; s <= 6; s += 1) {



    assert.equal(



      w.a6cf80HookTarget(s | 0) >>> 0,



      managerPollA6cf80HookSlotTargetVa(s),



      `hookTarget ${s}`,



    );



    assert.equal(



      w.a6cf80HookName(s | 0) >>> 0,



      managerPollA6cf80HookSlotNameVa(s),



      `hookName ${s}`,



    );



    assert.equal(



      w.a6cf80HookOrdinal(s | 0) >>> 0,



      managerPollA6cf80HookSlotOrdinal(s),



      `hookOrdinal ${s}`,



    );



  }



  for (const hr of [0, 1, 0x80010106, 0x80010107, 0x80004005, 0xffffffff]) {



    assert.equal(



      w.a6cf80CoinitRetry(hr >>> 0),



      managerPollA6cf80CoinitRetryNeeded(hr) ? 1 : 0,



      `coinitRetry ${hr >>> 0}`,



    );



  }



  {



    const mem = new Uint8Array(w.memory.buffer);



    const base = SCRATCH_PROBE_LADDER;



    const ladders = [



      [0, 0, 0, 0], [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1],



      [1, 1, 1, 1], [0, 0, 1, 1], [1, 0, 1, 0], [0xff, 0, 0, 0],



    ];



    for (const loaded of ladders) {



      mem.set(Uint8Array.from(loaded), base);



      assert.equal(



        w.a6cf80SelectProbe(base, loaded.length) >>> 0,



        managerPollA6cf80SelectProbe(loaded, loaded.length),



        `selectProbe [${loaded}]`,



      );



      assert.equal(



        w.a6cf80ModeAfterProbes(base, loaded.length) >>> 0,



        managerPollA6cf80ModeAfterProbes(loaded, loaded.length),



        `modeAfterProbes [${loaded}]`,



      );



    }



    // Null / empty inputs.



    assert.equal(



      w.a6cf80SelectProbe(0, 0) >>> 0,



      managerPollA6cf80SelectProbe(null, 0),



    );



    assert.equal(



      w.a6cf80ModeAfterProbes(0, 0) >>> 0,



      managerPollA6cf80ModeAfterProbes(null, 0),



    );



  }







  // Deterministic randomized differential over the v18 surface.



  let seed18 = 0xa220c0;



  const next18 = () => {



    seed18 = (Math.imul(seed18, 1664525) + 1013904223) >>> 0;



    return seed18;



  };



  {



    const dv = new DataView(w.memory.buffer);



    const mem = new Uint8Array(w.memory.buffer);



    const seqBase = SCRATCH_A220C0_SEQ;



    const ladderBase = SCRATCH_A220C0_LADDER;



    for (let iter = 0; iter < 256; iter += 1) {



      const flags = (next18() & 1) === 0 ? next18() & 0xff : next18();



      assert.equal(



        w.a220c0Run(flags),



        managerPollA220c0ThreadRun(flags) ? 1 : 0,



        `rand threadRun ${flags}`,



      );



      assert.equal(



        w.a220c0FlagStart(flags) >>> 0,



        managerPollA220c0FlagAfterStart(flags),



        `rand flagStart ${flags}`,



      );



      assert.equal(



        w.a220c0FlagStop(flags) >>> 0,



        managerPollA220c0FlagAfterStop(flags),



        `rand flagStop ${flags}`,



      );



      // Random flag-observation sequence for the loop-count helper.



      const n = next18() % 8;



      const seq = [];



      for (let i = 0; i < n; i += 1) {



        const v = (next18() & 3) === 0 ? next18() & ~2 : next18() | 2;



        seq.push(v >>> 0);



        dv.setUint32(seqBase + i * 4, v >>> 0, true);



      }



      assert.equal(



        w.a220c0Iterations(n ? seqBase : 0, n) >>> 0,



        managerPollA220c0ScanIterations(seq, n),



        `rand scanIterations n=${n}`,



      );



      // Random probe ladder.



      const loaded = [];



      for (let i = 0; i < 4; i += 1) {



        const v = (next18() & 3) === 0 ? next18() & 0xff : 0;



        loaded.push(v);



        mem[ladderBase + i] = v;



      }



      assert.equal(



        w.a6cf80SelectProbe(ladderBase, 4) >>> 0,



        managerPollA6cf80SelectProbe(loaded, 4),



        `rand selectProbe [${loaded}]`,



      );



      const mode = w.a6cf80ModeAfterProbes(ladderBase, 4) >>> 0;



      assert.equal(mode, managerPollA6cf80ModeAfterProbes(loaded, 4), "rand mode");



      assert.equal(



        w.a6cf80LogLevel(mode) >>> 0,



        managerPollA6cf80LogLevelForMode(mode),



        `rand logLevel ${mode}`,



      );



      assert.equal(



        w.a6cf80ScanFlagAfter(mode) >>> 0,



        managerPollA6cf80ScanFlagAfter(mode),



        `rand scanFlagAfter ${mode}`,



      );



      const hr = (next18() & 3) === 0 ? 0x80010106 : next18();



      assert.equal(



        w.a6cf80CoinitRetry(hr >>> 0),



        managerPollA6cf80CoinitRetryNeeded(hr) ? 1 : 0,



        `rand coinitRetry ${hr >>> 0}`,



      );



    }



  }







  // ABI v19: Manager shell body after the poll prefix



  assert.equal(w.shellStateTableVa() >>> 0, managerShellStateTableVa());



  assert.equal(w.shellStateDefaultVa() >>> 0, managerShellStateDefaultVa());



  assert.equal(w.approachSlotCount() >>> 0, managerApproachSlotCount());



  assert.equal(w.approachSlotStride() >>> 0, managerApproachSlotStride());



  assert.equal(w.shellFlagBAfter() >>> 0, managerShellFlagBAfterLoop());



  for (let r = -2; r <= MANAGER_SHELL_RECV_COUNT + 1; r += 1) {



    assert.equal(



      w.shellRecvOfs(r | 0) >>> 0,



      managerShellReceiverOfs(r),



      `shellRecvOfs ${r}`,



    );



    for (const mgr of [0, 0x1000, 0xfffff000]) {



      assert.equal(



        w.shellRecvAddr(mgr >>> 0, r | 0) >>> 0,



        managerShellReceiverAddr(mgr, r),



        `shellRecvAddr ${mgr >>> 0},${r}`,



      );



    }



  }



  for (const [base, slot] of [



    [0, 0], [0, 1], [0x4a950, 0], [0x4a950, 1], [0xfffffff0, 3], [0x1000, 0xffffffff],



  ]) {



    assert.equal(



      w.approachSlotAddr(base >>> 0, slot >>> 0) >>> 0,



      managerApproachSlotAddr(base, slot),



      `approachSlotAddr ${base >>> 0},${slot >>> 0}`,



    );



  }



  for (const slot of [0, 1, 2, 3, 0xfffffffe, 0xffffffff]) {



    assert.equal(



      w.approachSlotContinue(slot >>> 0),



      managerApproachSlotContinue(slot) ? 1 : 0,



      `approachSlotContinue ${slot >>> 0}`,



    );



    assert.equal(



      w.approachHostArg(slot >>> 0) >>> 0,



      managerApproachHostArgSlot(slot),



      `approachHostArg ${slot >>> 0}`,



    );



  }



  for (const mode of [0, 1, 0x1f, 0x20, 0x21, 0xffffffff]) {



    assert.equal(



      w.approachHostNeeded(mode >>> 0),



      managerApproachHostCallNeeded(mode) ? 1 : 0,



      `approachHostNeeded ${mode >>> 0}`,



    );



  }



  const approachPairs = [



    [1, 3], [3, 1], [3, 3], [0, 0], [-1, 1], [1, -1],



    [Number.NaN, 3], [3, Number.NaN], [Number.NaN, Number.NaN],



    [Infinity, 3], [-Infinity, 3], [3, Infinity], [3, -Infinity],



    [1e-8, 0], [0, 1e-8], [16777216, 16777217],



  ];



  for (const [c, t] of approachPairs) {



    const cf = Math.fround(c);



    const tf = Math.fround(t);



    assert.equal(



      w.approachAddPath(cf, tf),



      managerApproachUsesAddPath(cf, tf) ? 1 : 0,



      `approachAddPath ${c},${t}`,



    );



    for (const s of [0, 6, 0.5, 1e30, Number.NaN]) {



      const sf = Math.fround(s);



      const nat = w.floatApproach(cf, tf, sf);



      const js = managerFloatApproach(cf, tf, sf);



      assert.ok(



        Object.is(nat, js) || (Number.isNaN(nat) && Number.isNaN(js)),



        `floatApproach ${c},${t},${s} -> native ${nat} js ${js}`,



      );



    }



  }



  for (const [a, b] of [



    [0, 0], [0, -1], [0, 1], [1, 0], [0, -0x80000000], [0, 0x7fffffff],



    [0xffffffff, 0], [0, 0x80000000 | 0],



  ]) {



    assert.equal(



      w.shellProbeNeeded(a >>> 0, b | 0),



      managerShellProbeNeeded(a, b) ? 1 : 0,



      `shellProbeNeeded ${a >>> 0},${b | 0}`,



    );



  }



  for (const al of [0, 1, 0x7f, 0x80, 0xff, 0x100, 0x101]) {



    assert.equal(



      w.shell90b150Blocks(al >>> 0),



      managerShellSub90b150Blocks(al) ? 1 : 0,



      `shell90b150Blocks ${al}`,



    );



  }



  for (const g of [0, 1, 0x00c71678, 0xffffffff]) {



    assert.equal(



      w.shellGamePresent(g >>> 0),



      managerShellGamePresent(g) ? 1 : 0,



      `shellGamePresent ${g >>> 0}`,



    );



  }



  for (const [a, b] of [[0, 0], [0, 1], [1, 0], [1, 1], [0xff, 0], [1, 0xff]]) {



    assert.equal(



      w.shellSilentReturn(a, b),



      managerShellSilentReturn(a, b) ? 1 : 0,



      `shellSilentReturn ${a},${b}`,



    );



  }



  for (let s = -3; s <= 9; s += 1) {



    assert.equal(



      w.shellStateIndex(s | 0) >>> 0,



      managerShellStateIndex(s),



      `shellStateIndex ${s}`,



    );



    assert.equal(



      w.shellStateInTable(s | 0),



      managerShellStateInTable(s) ? 1 : 0,



      `shellStateInTable ${s}`,



    );



    assert.equal(



      w.shellStateTargetVa(s | 0) >>> 0,



      managerShellStateTargetVa(s),



      `shellStateTargetVa ${s}`,



    );



    assert.equal(



      w.shellStateUsesGame(s | 0),



      managerShellStateUsesGame(s) ? 1 : 0,



      `shellStateUsesGame ${s}`,



    );



  }







  // Deterministic randomized differential over the v19 surface.



  //



  // ABI v21 correction: this block also drew every selection with `% n` on the



  // shared LCG, i.e. from its LOW bits (period 2^k). All selections now come



  // from the HIGH bits and the corpus asserts it reaches every seeded value.



  let seed19 = 0x954cd0;



  const next19 = () => {



    seed19 = (Math.imul(seed19, 1664525) + 1013904223) >>> 0;



    return seed19;



  };



  const pick19 = (n) => Math.floor((next19() / 0x100000000) * n);



  const seen19 = { float: new Set(), state: new Set(), slot: new Set() };



  const randFloat = () => {



    const pick = pick19(10);



    seen19.float.add(pick);



    if (pick === 0) return Number.NaN;



    if (pick === 1) return Infinity;



    if (pick === 2) return -Infinity;



    if (pick === 3) return 0;



    return Math.fround((next19() / 0xffffffff) * 200 - 100);



  };



  for (let i = 0; i < 512; i += 1) {



    const c = randFloat();



    const t = randFloat();



    const s = pick19(8) === 0 ? randFloat() : Math.fround(pick19(1000) / 100);



    assert.equal(



      w.approachAddPath(c, t),



      managerApproachUsesAddPath(c, t) ? 1 : 0,



      `rand approachAddPath ${c},${t}`,



    );



    const nat = w.floatApproach(c, t, s);



    const js = managerFloatApproach(c, t, s);



    assert.ok(



      Object.is(nat, js) || (Number.isNaN(nat) && Number.isNaN(js)),



      `rand floatApproach ${c},${t},${s} -> native ${nat} js ${js}`,



    );



    const state = pick19(2) === 0 ? pick19(8) : next19() | 0;



    seen19.state.add(state >= 0 && state < 8 ? state : -1);



    assert.equal(



      w.shellStateTargetVa(state | 0) >>> 0,



      managerShellStateTargetVa(state),



      `rand shellStateTargetVa ${state}`,



    );



    assert.equal(



      w.shellStateInTable(state | 0),



      managerShellStateInTable(state) ? 1 : 0,



      `rand shellStateInTable ${state}`,



    );



    const base = next19();



    const slot = pick19(4);



    seen19.slot.add(slot);



    assert.equal(



      w.approachSlotAddr(base, slot) >>> 0,



      managerApproachSlotAddr(base, slot),



      `rand approachSlotAddr ${base},${slot}`,



    );



    const mode = pick19(4) === 0 ? 0x20 : next19();



    assert.equal(



      w.approachHostNeeded(mode),



      managerApproachHostCallNeeded(mode) ? 1 : 0,



      `rand approachHostNeeded ${mode}`,



    );



    const pa = pick19(2) === 0 ? 0 : next19();



    const pb = next19() | 0;



    assert.equal(



      w.shellProbeNeeded(pa, pb),



      managerShellProbeNeeded(pa, pb) ? 1 : 0,



      `rand shellProbeNeeded ${pa},${pb}`,



    );



  }



  // The float corpus must reach all ten shapes — including both infinities and



  // NaN, which the previous low-bit draw could silently omit.



  assert.equal(seen19.float.size, 10, `float shapes: ${[...seen19.float].sort((x, y) => x - y)}`);



  assert.equal(seen19.state.size, 9, `states: ${[...seen19.state].sort((x, y) => x - y)}`);



  assert.equal(seen19.slot.size, 4, `slots: ${[...seen19.slot].sort((x, y) => x - y)}`);







  // ABI v20: audit fixes + state-2 arm



  assert.equal(w.a6dd30TsStable(), managerPollA6dd30TimestampIsStable() ? 1 : 0);



  assert.equal(w.a1f280CountPrelog(), managerPollA1f280ActionCountIsPrelog() ? 1 : 0);



  assert.equal(w.state2FlagAfter() >>> 0, managerState2EntityFlagAfterFixup());







  // F8: the corrected clamp must match the oracle AND its sibling on every input.



  for (const t of [



    Number.NaN, 0, -0, 1, -1, 2, 1e-45, -1e-45, Infinity, -Infinity, 1e30, -1e30,



  ]) {



    const tf = Math.fround(t);



    const nat = w.a1f280TimerClamp(tf);



    const js = managerPollA1f280TimerClampNonneg(tf);



    assert.ok(



      Object.is(nat, js) || (Number.isNaN(nat) && Number.isNaN(js)),



      `timerClamp ${t} -> native ${nat} js ${js}`,



    );



    const sib = w.a1f280VcallT(tf);



    assert.ok(



      Object.is(nat, sib) || (Number.isNaN(nat) && Number.isNaN(sib)),



      `timerClamp â‰¡ vcallTimer native ${t}: ${nat} vs ${sib}`,



    );



  }







  // F10: y-lane recapture.



  const f10Cases = [



    [1, 0, 0x1000, 0x2000, 0x3000, 0x4000],



    [1, 1, 0x1000, 0x2000, 0x3000, 0x4000],



    [1, 0, 0, 0x2000, 0x3000, 0x4000],



    [1, 0, 0x1000, 0, 0x3000, 0x4000],



    [Number.NaN, 0, 0x1000, 0x2000, 0x3000, 0x4000],



    [0, 0, 0x1000, 0x2000, 0x3000, 0x4000],



  ];



  for (const [nx, ox, cbB, cbA, baseB, baseA] of f10Cases) {



    const label = `${nx},${ox},${cbB},${cbA}`;



    const ranNat = w.a6dd30XCbRan(Math.fround(nx), Math.fround(ox), cbB >>> 0);



    const ranJs = managerPollA6dd30XCbRan(nx, ox, cbB);



    assert.equal(ranNat, ranJs ? 1 : 0, `xCbRan ${label}`);



    assert.equal(



      w.a6dd30YBase(ranNat, baseB >>> 0, baseA >>> 0) >>> 0,



      managerPollA6dd30YAxisBase(ranJs, baseB, baseA),



      `yBase ${label}`,



    );



    assert.equal(



      w.a6dd30YCbPtr(ranNat, cbB >>> 0, cbA >>> 0) >>> 0,



      managerPollA6dd30YCbPtr(ranJs, cbB, cbA),



      `yCbPtr ${label}`,



    );



    for (const [ny, oy] of [[1, 0], [0, 0], [Number.NaN, 0]]) {



      assert.equal(



        w.a6dd30YCbNeeded(Math.fround(ny), Math.fround(oy), ranNat, cbB >>> 0, cbA >>> 0),



        managerPollA6dd30YCbNeeded(ny, oy, ranJs, cbB, cbA) ? 1 : 0,



        `yCbNeeded ${label} ${ny},${oy}`,



      );



    }



  }







  // F11: action-push snapshots.



  for (const mode of [0, 2, 4, 0xffffffff]) {



    assert.equal(



      w.a1f280SlotModeCc(mode >>> 0) >>> 0,



      managerPollA1f280ActionSlotModeCc(mode),



      `slotModeCc ${mode >>> 0}`,



    );



  }



  for (const [ran, b0, b1] of [



    [0, 0x1000, 0x2000], [1, 0x1000, 0x2000], [1, 0, 0], [0, 0xfffffff0, 4],



  ]) {



    assert.equal(



      w.a1f280StoreBase(ran, b0 >>> 0, b1 >>> 0) >>> 0,



      managerPollA1f280ActionStoreBase(!!ran, b0, b1),



      `storeBase ${ran},${b0},${b1}`,



    );



  }



  for (const [base, mode, idx] of [



    [0, 0, 0], [0x1000, 2, 3], [0xfffffff0, 0, 0], [0x10, 4, 0xffffffff],



  ]) {



    assert.equal(



      w.a1f280StoreAddr(base >>> 0, mode >>> 0, idx >>> 0) >>> 0,



      managerPollA1f280ActionStoreAddr(base, mode, idx),



      `storeAddr ${base},${mode},${idx}`,



    );



  }







  // State-2 arm.



  for (const b of [0, 1, 2, 0xff]) {



    assert.equal(w.state2Blocked(b), managerState2Blocked(b) ? 1 : 0, `state2Blocked ${b}`);



    assert.equal(



      w.state2ParityAlt(b),



      managerState2ParityAlt(b) ? 1 : 0,



      `state2ParityAlt ${b}`,



    );



    assert.equal(



      w.state2NeedsFixup(b),



      managerState2EntityNeedsFixup(b) ? 1 : 0,



      `state2NeedsFixup ${b}`,



    );



  }



  for (const c of [0, 1, 2, 0xffffffff]) {



    assert.equal(



      w.state2SweepNeeded(c >>> 0),



      managerState2SweepNeeded(c) ? 1 : 0,



      `state2SweepNeeded ${c >>> 0}`,



    );



  }



  for (const [i, c] of [



    [0, 1], [0, 2], [1, 2], [2, 3], [2, 8], [0xffffffff, 2], [5, 0],



  ]) {



    assert.equal(



      w.state2SweepStep(i >>> 0, c >>> 0),



      managerState2SweepStep(i, c) ? 1 : 0,



      `state2SweepStep ${i >>> 0},${c >>> 0}`,



    );



  }



  for (const [base, idx] of [[0x1000, 0], [0x1000, 3], [0xfffffffc, 1], [0, 0xffffffff]]) {



    assert.equal(



      w.state2EntitySlot(base >>> 0, idx >>> 0) >>> 0,



      managerState2EntitySlotAddr(base, idx),



      `state2EntitySlot ${base >>> 0},${idx >>> 0}`,



    );



  }



  for (let id = -2; id <= STATE2_FIXUP_COUNT + 1; id += 1) {



    assert.equal(



      w.state2SrcOfs(id | 0) >>> 0,



      managerState2FixupSrcOfs(id),



      `state2SrcOfs ${id}`,



    );



    assert.equal(



      w.state2DstOfs(id | 0) >>> 0,



      managerState2FixupDstOfs(id),



      `state2DstOfs ${id}`,



    );



  }







  // Deterministic randomized differential over the v20 surface.



  //



  // ABI v21 correction: every selection below used `next20() % n`, which draws



  // from the LCG's LOW bits (period 2^k). Measured coverage of the v20 corpus



  // was 2/8 modes, 16/64 indices, 4/16 counts, and the `& 7` special-float gate



  // fired 0 times in 384 iterations — the NaN/Inf timer cases were never



  // randomized at all. All selections now draw from the HIGH bits, and the



  // corpus asserts it actually reaches every value it claims to cover.



  let seed20 = 0x9551a3;



  const next20 = () => {



    seed20 = (Math.imul(seed20, 1664525) + 1013904223) >>> 0;



    return seed20;



  };



  const pick20 = (n) => Math.floor((next20() / 0x100000000) * n);



  const seen20 = { special: new Set(), mode: new Set(), idx: new Set(), cnt: new Set() };



  for (let i = 0; i < 384; i += 1) {



    let t;



    if (pick20(8) === 0) {



      const s = pick20(4);



      seen20.special.add(s);



      t = [Number.NaN, Infinity, -Infinity, 0][s];



    } else {



      t = Math.fround((next20() / 0xffffffff) * 20 - 10);



    }



    const natClamp = w.a1f280TimerClamp(t);



    const jsClamp = managerPollA1f280TimerClampNonneg(t);



    assert.ok(



      Object.is(natClamp, jsClamp) || (Number.isNaN(natClamp) && Number.isNaN(jsClamp)),



      `rand timerClamp ${t}`,



    );



    const nx = Math.fround((next20() / 0xffffffff) * 2 - 1);



    const ox = (next20() & 3) === 0 ? nx : Math.fround((next20() / 0xffffffff) * 2 - 1);



    const cbB = (next20() & 3) === 0 ? 0 : next20();



    const cbA = (next20() & 3) === 0 ? 0 : next20();



    const baseB = next20();



    const baseA = next20();



    const ranNat = w.a6dd30XCbRan(nx, ox, cbB);



    assert.equal(ranNat, managerPollA6dd30XCbRan(nx, ox, cbB) ? 1 : 0, "rand xCbRan");



    assert.equal(



      w.a6dd30YBase(ranNat, baseB, baseA) >>> 0,



      managerPollA6dd30YAxisBase(!!ranNat, baseB, baseA),



      "rand yBase",



    );



    assert.equal(



      w.a6dd30YCbPtr(ranNat, cbB, cbA) >>> 0,



      managerPollA6dd30YCbPtr(!!ranNat, cbB, cbA),



      "rand yCbPtr",



    );



    const ny = Math.fround((next20() / 0xffffffff) * 2 - 1);



    const oy = (next20() & 3) === 0 ? ny : Math.fround((next20() / 0xffffffff) * 2 - 1);



    assert.equal(



      w.a6dd30YCbNeeded(ny, oy, ranNat, cbB, cbA),



      managerPollA6dd30YCbNeeded(ny, oy, !!ranNat, cbB, cbA) ? 1 : 0,



      "rand yCbNeeded",



    );



    const ran = next20() & 1;



    const b0 = next20();



    const b1 = next20();



    assert.equal(



      w.a1f280StoreBase(ran, b0, b1) >>> 0,



      managerPollA1f280ActionStoreBase(!!ran, b0, b1),



      "rand storeBase",



    );



    const mode = pick20(8);



    const idx = pick20(64);



    seen20.mode.add(mode);



    seen20.idx.add(idx);



    assert.equal(



      w.a1f280StoreAddr(b0, mode, idx) >>> 0,



      managerPollA1f280ActionStoreAddr(b0, mode, idx),



      "rand storeAddr",



    );



    const sIdx = next20();



    const sCnt = pick20(16);



    seen20.cnt.add(sCnt);



    assert.equal(



      w.state2SweepStep(sIdx, sCnt),



      managerState2SweepStep(sIdx, sCnt) ? 1 : 0,



      `rand state2SweepStep ${sIdx},${sCnt}`,



    );



    assert.equal(



      w.state2EntitySlot(b1, sCnt) >>> 0,



      managerState2EntitySlotAddr(b1, sCnt),



      "rand state2EntitySlot",



    );



  }



  // The corpus must actually reach every value it claims to cover, or the



  // reported case count overstates real coverage (this is the assertion whose



  // absence let the v20 corpus report 4224 cases while covering 2/8 modes).



  assert.equal(seen20.special.size, 4, `special-float draws: ${[...seen20.special]}`);



  assert.equal(seen20.mode.size, 8, `mode draws: ${[...seen20.mode]}`);



  assert.equal(seen20.idx.size, 64, `idx draws: ${seen20.idx.size}`);



  assert.equal(seen20.cnt.size, 16, `count draws: ${[...seen20.cnt]}`);







  // --- ABI v21: complete state table, FUN_009505e0, pre-dispatch ladder ---



  assert.equal(w.state1ModeRead(), managerState1ModeReadUnconditional() ? 1 : 0);



  assert.equal(w.p9c3990UnlockAlways(), manager9c3990UnlockAlways() ? 1 : 0);



  assert.equal(w.p9c3990LockArg() | 0, manager9c3990LockArg());



  assert.equal(w.p9c3990LockSlot() >>> 0, manager9c3990LockVtblSlot());



  assert.equal(w.p9c3990UnlockSlot() >>> 0, manager9c3990UnlockVtblSlot());



  assert.equal(w.state1TerminalVa() >>> 0, managerState1TerminalVa());



  assert.equal(w.state2HeadTerminalVa() >>> 0, managerState2HeadTerminalVa());



  assert.equal(w.state2NullGuarded(), managerState2GameNullGuarded() ? 1 : 0);



  assert.equal(w.state2NullGuarded(), 0);







  // FUN_009505e0: the full 16-entry truth table, plus the byte/dword split.



  const p9505Vals = [0, 1, 2, 0xff, 0x100, 0x101, 0xffffff00, 0xffffffff];



  for (const a of p9505Vals) {



    for (const b of p9505Vals) {



      assert.equal(



        w.p9505e0ReadsB(a >>> 0, b >>> 0),



        manager9505e0ReadsBPair(a, b) ? 1 : 0,



        `9505e0 readsB ${a},${b}`,



      );



      for (const c of [0, 1, 0x100]) {



        for (const d of [0, 1, 0x100]) {



          assert.equal(



            w.p9505e0Gate(a >>> 0, b >>> 0, c >>> 0, d >>> 0),



            manager9505e0Gate(a, b, c, d) ? 1 : 0,



            `9505e0 gate ${a},${b},${c},${d}`,



          );



        }



      }



    }



  }



  for (let id = -2; id <= P9505E0_FIELD_COUNT + 1; id += 1) {



    assert.equal(w.p9505e0FieldOfs(id | 0) >>> 0, manager9505e0FieldOfs(id), `fieldOfs ${id}`);



    assert.equal(w.p9505e0MgrOfs(id | 0) >>> 0, manager9505e0ManagerOfs(id), `mgrOfs ${id}`);



  }







  // FUN_009c3990 islands, including the ring walk over Wasm scratch.



  for (const f of [0, 1, 2, 4, 5, 8, 0xfb, 0xff, 0x100, 0x104, 0x400, 0xfffffffb]) {



    assert.equal(



      w.p9c3990Matches(f >>> 0),



      manager9c3990NodeMatches(f) ? 1 : 0,



      `9c3990 matches ${f}`,



    );



  }



  for (const [n, h] of [[0, 0], [0x1000, 0x1000], [0x1000, 0x1004], [0xffffffff, 0]]) {



    assert.equal(



      w.p9c3990WalkCont(n >>> 0, h >>> 0),



      manager9c3990WalkContinue(n, h) ? 1 : 0,



      `9c3990 walk ${n},${h}`,



    );



  }



  {



    const mem = new Uint8Array(w.memory.buffer);



    const rings = [



      [], [0], [4], [0, 0, 0], [0, 0, 4], [4, 0, 0], [0, 4, 0],



      [0, 0, 0, 4], [4, 4, 4], [0xfb, 0xfb], [0xfb, 0xff], [2, 8, 0x40],



    ];



    for (const ring of rings) {



      mem.set(Uint8Array.from(ring), SCRATCH_9C3990_NODES);



      const ptr = ring.length ? SCRATCH_9C3990_NODES : 0;



      assert.equal(



        w.p9c3990Result(ptr, ring.length) | 0,



        manager9c3990Result(ring, ring.length) ? 1 : 0,



        `9c3990 result [${ring}]`,



      );



      assert.equal(



        w.p9c3990Scanned(ptr, ring.length) >>> 0,



        manager9c3990Scanned(ring, ring.length),



        `9c3990 scanned [${ring}]`,



      );



    }



    // Null receiver (empty ring) must not read memory.



    assert.equal(w.p9c3990Result(0, 0) | 0, 0);



    assert.equal(w.p9c3990Scanned(0, 0) >>> 0, 0);



  }







  // State arms.



  for (let s = -1; s <= 7; s += 1) {



    assert.equal(w.armRecvOfs(s | 0) >>> 0, managerShellArmRecvOfs(s), `armRecvOfs ${s}`);



    assert.equal(w.armCallVa(s | 0) >>> 0, managerShellArmCallVa(s), `armCallVa ${s}`);



  }



  const probeVals = [0, 1, 2, 0x7f, 0xff, 0x100, 0x101, 0xffffffff];



  const modeVals = [0, 1, 0x10, 0x11, 0x12, 0x111, 0xffffff11, 0xffffffff];



  for (const probe of probeVals) {



    assert.equal(



      w.state2HeadGate(probe >>> 0),



      managerState2HeadGateNeeded(probe) ? 1 : 0,



      `state2HeadGate ${probe}`,



    );



    for (const mode of modeVals) {



      const natS1 = w.state1Gate(probe >>> 0, mode >>> 0);



      assert.equal(



        natS1,



        managerState1SecondGateNeeded(probe, mode) ? 1 : 0,



        `state1Gate ${probe},${mode}`,



      );



      // Native-side sibling law (PE truth, not just oracle agreement).



      if (mode === 0x11) {



        assert.equal(natS1, 1, `native state1 forced ${probe}`);



      } else {



        assert.equal(natS1, w.state2HeadGate(probe >>> 0), `native siblings ${probe},${mode}`);



      }



      for (const gate of [0, 1, 0x100, 0xff]) {



        assert.equal(



          w.state1Terminal(probe >>> 0, mode >>> 0, gate >>> 0),



          managerState1TerminalNeeded(probe, mode, gate) ? 1 : 0,



          `state1Terminal ${probe},${mode},${gate}`,



        );



      }



    }



    for (const gate of [0, 1, 0x100, 0xff]) {



      assert.equal(



        w.state2HeadTerminal(probe >>> 0, gate >>> 0),



        managerState2HeadTerminalNeeded(probe, gate) ? 1 : 0,



        `state2HeadTerminal ${probe},${gate}`,



      );



    }



  }



  // Cascade collapse over every field pattern, on both sides.



  for (let bits = 0; bits < 16; bits += 1) {



    const f = [bits & 1, (bits >> 1) & 1, (bits >> 2) & 1, (bits >> 3) & 1];



    const natGate = w.p9505e0Gate(f[0], f[1], f[2], f[3]);



    for (const probe of [0, 1, 0x100]) {



      for (const mode of [0, 0x11, 0x12]) {



        const natFields = w.state1TerminalFields(



          probe >>> 0, mode >>> 0, f[0], f[1], f[2], f[3],



        );



        assert.equal(



          natFields,



          managerState1TerminalNeededFromFields(probe, mode, f[0], f[1], f[2], f[3]) ? 1 : 0,



          `state1Fields ${bits},${probe},${mode}`,



        );



        assert.equal(



          natFields,



          w.state1Terminal(probe >>> 0, mode >>> 0, natGate >>> 0),



          `state1 collapse native ${bits},${probe},${mode}`,



        );



      }



      const natHead = w.state2HeadTerminalFields(probe >>> 0, f[0], f[1], f[2], f[3]);



      assert.equal(



        natHead,



        managerState2HeadTerminalNeededFromFields(probe, f[0], f[1], f[2], f[3]) ? 1 : 0,



        `state2Fields ${bits},${probe}`,



      );



      assert.equal(



        natHead,



        w.state2HeadTerminal(probe >>> 0, natGate >>> 0),



        `state2 collapse native ${bits},${probe}`,



      );



    }



  }







  // Pre-dispatch ladder.



  for (let id = -2; id <= PREDISPATCH_FIELD_COUNT + 1; id += 1) {



    assert.equal(



      w.predFieldOfs(id | 0) >>> 0,



      managerPredispatchFieldOfs(id),



      `predFieldOfs ${id}`,



    );



  }



  const ladderVals = [0, 1, 0xff, 0x100, 0x101, 0x1000, 0xffffffff];



  for (const objB of [0, 1, 0x1000]) {



    for (const supB of ladderVals) {



      assert.equal(



        w.predCallNeeded(objB >>> 0, supB >>> 0),



        managerPredispatchCallNeeded(objB, supB) ? 1 : 0,



        `predCallNeeded ${objB},${supB}`,



      );



    }



  }



  for (const ran of [0, 1]) {



    for (const [b, a] of [[0, 1], [0xaa, 0xbb], [0xffffffff, 0], [7, 7]]) {



      assert.equal(



        w.predObjAfter(ran, b >>> 0, a >>> 0) >>> 0,



        managerPredispatchObjAfter(!!ran, b, a),



        `predObjAfter ${ran},${b},${a}`,



      );



      assert.equal(



        w.predSuppressAfter(ran, b >>> 0, a >>> 0) >>> 0,



        managerPredispatchSuppressAfter(!!ran, b, a),



        `predSuppressAfter ${ran},${b},${a}`,



      );



    }



  }



  for (const objB of [0, 0x1000]) {



    for (const supB of [0, 1, 0x100]) {



      for (const objA of [0, 0x1000]) {



        for (const supA of [0, 1, 0x100]) {



          for (const mode of [0, 1, 2, 0x101]) {



            const natReached = w.predQueueReached(



              objB >>> 0, supB >>> 0, objA >>> 0, supA >>> 0, mode >>> 0,



            );



            assert.equal(



              natReached,



              managerPredispatchQueueGateReached(objB, supB, objA, supA, mode) ? 1 : 0,



              `predQueueReached ${objB},${supB},${objA},${supA},${mode}`,



            );



            // A suppress byte set before the call blocks unconditionally.



            if (objB !== 0 && (supB & 0xff) !== 0) {



              assert.equal(natReached, 0, `native suppressed ladder ${supB}`);



            }



            for (const [qb, qe] of [[0, 0], [0x20, 0x20], [0x20, 0x24], [0xffffffff, 0]]) {



              assert.equal(



                w.predDispatches(



                  objB >>> 0, supB >>> 0, objA >>> 0, supA >>> 0, mode >>> 0,



                  qb >>> 0, qe >>> 0,



                ),



                managerPredispatchDispatches(objB, supB, objA, supA, mode, qb, qe) ? 1 : 0,



                `predDispatches ${objB},${supB},${objA},${supA},${mode},${qb},${qe}`,



              );



            }



          }



        }



      }



    }



  }



  for (const [qb, qe] of [[0, 0], [1, 1], [0x20, 0x24], [0xffffffff, 0xffffffff], [0, 0xffffffff]]) {



    assert.equal(



      w.predForcesDefault(qb >>> 0, qe >>> 0),



      managerPredispatchForcesDefault(qb, qe) ? 1 : 0,



      `predForcesDefault ${qb},${qe}`,



    );



  }







  // Deterministic randomized differential over the v21 surface, high bits only.



  let seed21 = 0x9553a6;



  const next21 = () => {



    seed21 = (Math.imul(seed21, 1664525) + 1013904223) >>> 0;



    return seed21;



  };



  const pick21 = (n) => Math.floor((next21() / 0x100000000) * n);



  // Bias to the boundaries the arithmetic actually has rather than uniform u32.



  const EDGE = [0, 1, 4, 0xff, 0x100, 0x101, 0x11, 0xffffffff];



  const edge21 = () => (pick21(2) === 0 ? EDGE[pick21(EDGE.length)] : next21());



  const seen21 = { edge: new Set(), ring: new Set(), state: new Set() };



  {



    const mem = new Uint8Array(w.memory.buffer);



    for (let i = 0; i < 512; i += 1) {



      const a = edge21();



      const b = edge21();



      const c = edge21();



      const d = edge21();



      seen21.edge.add(EDGE.indexOf(a));



      assert.equal(



        w.p9505e0Gate(a >>> 0, b >>> 0, c >>> 0, d >>> 0),



        manager9505e0Gate(a, b, c, d) ? 1 : 0,



        `rand 9505e0 ${a},${b},${c},${d}`,



      );



      assert.equal(



        w.p9505e0ReadsB(a >>> 0, b >>> 0),



        manager9505e0ReadsBPair(a, b) ? 1 : 0,



        `rand 9505e0 readsB ${a},${b}`,



      );



      const probe = edge21();



      const mode = pick21(4) === 0 ? 0x11 : edge21();



      const gate = edge21();



      assert.equal(



        w.state1Gate(probe >>> 0, mode >>> 0),



        managerState1SecondGateNeeded(probe, mode) ? 1 : 0,



        `rand state1Gate ${probe},${mode}`,



      );



      assert.equal(



        w.state1Terminal(probe >>> 0, mode >>> 0, gate >>> 0),



        managerState1TerminalNeeded(probe, mode, gate) ? 1 : 0,



        `rand state1Terminal ${probe},${mode},${gate}`,



      );



      assert.equal(



        w.state2HeadTerminal(probe >>> 0, gate >>> 0),



        managerState2HeadTerminalNeeded(probe, gate) ? 1 : 0,



        `rand state2HeadTerminal ${probe},${gate}`,



      );



      assert.equal(



        w.state1TerminalFields(probe >>> 0, mode >>> 0, a >>> 0, b >>> 0, c >>> 0, d >>> 0),



        managerState1TerminalNeededFromFields(probe, mode, a, b, c, d) ? 1 : 0,



        `rand state1Fields ${probe},${mode}`,



      );



      const state = pick21(9) - 1;



      seen21.state.add(state);



      assert.equal(



        w.armRecvOfs(state | 0) >>> 0,



        managerShellArmRecvOfs(state),



        `rand armRecvOfs ${state}`,



      );



      assert.equal(



        w.armCallVa(state | 0) >>> 0,



        managerShellArmCallVa(state),



        `rand armCallVa ${state}`,



      );



      // Random ring for the probe walk.



      const n = pick21(8);



      seen21.ring.add(n);



      const ring = [];



      for (let k = 0; k < n; k += 1) {



        ring.push(pick21(4) === 0 ? 4 | pick21(0x100) : pick21(0x100) & ~4);



      }



      if (n) mem.set(Uint8Array.from(ring), SCRATCH_9C3990_NODES);



      assert.equal(



        w.p9c3990Result(n ? SCRATCH_9C3990_NODES : 0, n) | 0,



        manager9c3990Result(ring, n) ? 1 : 0,



        `rand 9c3990 result [${ring}]`,



      );



      assert.equal(



        w.p9c3990Scanned(n ? SCRATCH_9C3990_NODES : 0, n) >>> 0,



        manager9c3990Scanned(ring, n),



        `rand 9c3990 scanned [${ring}]`,



      );



      // Ladder.



      const objB = pick21(3) === 0 ? 0 : next21();



      const supB = pick21(2) === 0 ? edge21() : 0;



      const objA = pick21(3) === 0 ? 0 : next21();



      const supA = pick21(2) === 0 ? edge21() : 0;



      const lmode = pick21(2) === 0 ? 1 : edge21();



      const qb = pick21(2) === 0 ? 0x20 : next21();



      const qe = pick21(3) === 0 ? qb : next21();



      assert.equal(



        w.predQueueReached(objB >>> 0, supB >>> 0, objA >>> 0, supA >>> 0, lmode >>> 0),



        managerPredispatchQueueGateReached(objB, supB, objA, supA, lmode) ? 1 : 0,



        `rand predQueueReached ${objB},${supB},${objA},${supA},${lmode}`,



      );



      assert.equal(



        w.predDispatches(



          objB >>> 0, supB >>> 0, objA >>> 0, supA >>> 0, lmode >>> 0, qb >>> 0, qe >>> 0,



        ),



        managerPredispatchDispatches(objB, supB, objA, supA, lmode, qb, qe) ? 1 : 0,



        `rand predDispatches`,



      );



      assert.equal(



        w.predForcesDefault(qb >>> 0, qe >>> 0),



        managerPredispatchForcesDefault(qb, qe) ? 1 : 0,



        `rand predForcesDefault ${qb},${qe}`,



      );



    }



  }



  // The v21 corpus must reach every seeded boundary, ring length and state.



  assert.equal(seen21.edge.size, EDGE.length + 1, `edge draws: ${[...seen21.edge]}`);



  assert.equal(seen21.ring.size, 8, `ring lengths: ${[...seen21.ring].sort((x, y) => x - y)}`);



  assert.equal(seen21.state.size, 9, `states: ${[...seen21.state].sort((x, y) => x - y)}`);







  /* -------------------------------------------------------------------------



   * ABI v21 — narrow-parameter toolchain defect (class-wide).



   *



   * The Wasm ABI does not narrow an i32 argument, and -O2 deletes an in-body



   * mask it can prove redundant for a `uint8_t` / `uint16_t` parameter. Every



   * byte/word gate in this family therefore shipped an UNMASKED comparison:



   * 53 of the 61 former `uint8_t` scalar parameters were confirmed divergent



   * by direct probe of the built module, plus 6 sites in the 16-bit class.



   *



   * The differential could not see it because every Wasm-side argument was



   * pre-masked before the call. The block below drives the SAME exports with



   * deliberately WIDE arguments and never masks the Wasm side — the oracle is



   * the only thing allowed to narrow.



   * ---------------------------------------------------------------------- */



  // Wide values must include ones whose LOW BYTE still satisfies the gate,



  // otherwise a dropped mask only ever turns a true into a false and an



  // equality gate like `last_char == '\n'` survives untested. (`0x10a` /



  // `0xffffff0a` carry the newline byte; `0x101` carries a set bit 0.)



  const WIDE8 = [



    0x100, 0x1ff, 0x200, 0xff00, 0xffffff00, 0xffffffff, 0x12345600,



    0x10a, 0xffffff0a, 0x101, 0x104, 0x108, 0xffffff01,



  ];



  const WIDE16 = [0x10000, 0x1ffff, 0xffff0000, 0xffffffff, 0x12340000, 0x1000a];



  const b2i = (v) => (v ? 1 : 0);







  for (const x of WIDE8) {



    const w32 = x >>> 0;



    // Single-byte-parameter gates: the Wasm side sees the wide value raw.



    assert.equal(w.mapPresent(w32, 0, 0), b2i(inputMapNodePresent(x, 0, 0)), `wide mapPresent ${x}`);



    assert.equal(w.pollPrefix(w32), b2i(managerPollPrefixNeeded(x)), `wide pollPrefix ${x}`);



    assert.equal(w.deviceEnabled(w32), b2i(managerPollA6de60DeviceEnabled(x)), `wide deviceEnabled ${x}`);



    assert.equal(w.bufferedMode(w32), b2i(managerPollA6de60BufferedMode(x)), `wide bufferedMode ${x}`);



    assert.equal(w.axisMapPov(w32), b2i(managerPollA6de60AxisMapIsPov(x)), `wide axisMapPov ${x}`);



    assert.equal(w.freeCom(w32), b2i(managerPollA6da10FreeComMaps(x)), `wide freeCom ${x}`);



    assert.equal(w.a648Mode(w32) | 0, managerPollA648b0Mode(x), `wide a648Mode ${x}`);



    assert.equal(w.a1fcActive(w32), b2i(managerPollA1fc00EntryAlreadyActive(x)), `wide a1fcActive ${x}`);



    assert.equal(w.a1f280Rumble(w32), b2i(managerPollA1f280RumblePathNeeded(x)), `wide rumblePath ${x}`);



    assert.equal(w.a112c0StateInit(w32) | 0, a112c0StateAfterInit(x), `wide stateAfterInit ${x}`);



    assert.equal(w.a112c0PrefixEn(w32), b2i(a112c0PrefixEnabled(x)), `wide prefixEnabled ${x}`);



    assert.equal(w.a112c0TrailNl(w32), b2i(a112c0TrailNewline(x)), `wide trailNewline ${x}`);



    assert.equal(w.a6da10StepCount(w32) | 0, managerPollA6da10TeardownStepCount(x), `wide stepCount ${x}`);



    assert.equal(w.a6dab0ScanEnabled(w32), b2i(managerPollA6dab0ScanEnabled(x)), `wide scanEnabled ${x}`);



    assert.equal(w.a6dab0EnumNeeded(w32), b2i(managerPollA6dab0EnumNeeded(x)), `wide enumNeeded ${x}`);



    assert.equal(w.a6dab0SlotScanNeeded(w32), b2i(managerPollA6dab0SlotScanNeeded(x)), `wide slotScan ${x}`);



    assert.equal(w.a6cf80InitSkip(w32), b2i(managerPollA6cf80InitSkip(x)), `wide initSkip ${x}`);



    assert.equal(w.state2Blocked(w32), b2i(managerState2Blocked(x)), `wide state2Blocked ${x}`);



    assert.equal(w.state2ParityAlt(w32), b2i(managerState2ParityAlt(x)), `wide parityAlt ${x}`);



    assert.equal(w.state2NeedsFixup(w32), b2i(managerState2EntityNeedsFixup(x)), `wide needsFixup ${x}`);



    const nu8 = w.axisNormU8(w32);



    const ju8 = managerPollA6de60AxisNormalizeU8(x);



    assert.ok(Object.is(nu8, ju8), `wide axisNormU8 ${x}: ${nu8} vs ${ju8}`);



    /* Multi-parameter gates. ONE base vector is not enough: a mask site behind



     * an earlier gate is never reached if that gate short-circuits, and the



     * mutant then produces the same answer for the wrong reason. The exhaustive



     * per-site mask-drop sweep found exactly this — four sites survived purely



     * because the base vector never let control reach them. Every base below is



     * chosen so each masked position is reachable AND decisive. */



    for (const base of [[1, 1], [1, 0], [0, 1], [0, 0]]) {



      for (const pos of [0, 1]) {



        const a = base.slice();



        a[pos] = w32;



        assert.equal(



          w.pollBody(a[0] >>> 0, a[1] >>> 0),



          b2i(managerPollA6de60BodyNeeded(a[0], a[1])),



          `wide pollBody [${base}] pos${pos} ${x}`,



        );



        assert.equal(



          w.shellSilentReturn(a[0] >>> 0, a[1] >>> 0),



          b2i(managerShellSilentReturn(a[0], a[1])),



          `wide silentReturn [${base}] pos${pos} ${x}`,



        );



      }



    }



    for (const base of [[1, 0, 1, 1], [0, 1, 1, 1], [1, 0, 0, 0], [0, 1, 0, 0]]) {



      for (let pos = 0; pos < 4; pos += 1) {



        const a = base.slice();



        a[pos] = w32;



        assert.equal(



          w.buttonEdge(a[0] >>> 0, a[1] >>> 0, a[2] >>> 0, a[3] >>> 0) | 0,



          managerPollA6de60ButtonEdge(a[0], a[1], a[2], a[3]),



          `wide buttonEdge [${base}] pos${pos} ${x}`,



        );



      }



    }



    // counter must be odd (the signed mod2 gate) and flag_2a3c0 must be clear,



    // or the 0x4abc4 / 0x4abc5 pair at the end of the ladder is unreachable.



    for (const base of [[1, 1, 1, 0], [1, 0, 1, 0], [1, 0, 0, 1], [1, 0, 1, 1], [1, 0, 0, 0]]) {



      for (const pos of [1, 2, 3]) {



        const a = base.slice();



        a[pos] = w32;



        assert.equal(



          w.earlySkip(a[0] | 0, a[1] >>> 0, a[2] >>> 0, a[3] >>> 0) | 0,



          managerUpdateEarlySkip(a[0], a[1], a[2], a[3]),



          `wide earlySkip [${base}] pos${pos} ${x}`,



        );



      }



    }



    assert.equal(



      w.gate6f9730(0, 0, 0, w32, 0),



      b2i(managerGate6f9730(0, 0, 0, x, 0)),



      `wide gate6f9730 ${x}`,



    );



    assert.equal(



      w.floatCb(0, 1, w32),



      b2i(managerPollA6de60FloatCallbackNeeded(0, 1, x)),



      `wide floatCb ${x}`,



    );



    // v109 dedupe: 6f9400/6f95a0 laws are OWNED by the render-shell family;
    // the PI wasm no longer exports the mask assemblers. The WIDE-byte gate
    // law (presence flags are setne booleans on the PE, so bits set on any
    // nonzero low byte, high bits stripped) is pinned BY REFERENCE to the
    // RShell model: assert each lane via the owner law directly.
    for (let pos = 0; pos < 7; pos += 1) {
      const a = [0, 0, 0, 0, 0, 0, 0];
      a[pos] = w32;
      /* presence flags are setne booleans on the PE: only the LOW BYTE
         decides (nonzero -> present), high bits are stripped. */
      const on = (w32 & 0xff) !== 0;
      const want = on
        ? ({ 0: INPUT_MASK_BIT0, 1: INPUT_MASK_BIT1, 2: INPUT_MASK_BIT2,
             3: INPUT_MASK_BIT3, 5: INPUT_MASK_BIT6, 4: INPUT_MASK_BIT5,
             6: INPUT_MASK_BIT4 })[pos]
        : 0;
      assert.equal(
        renderShell6f9400Mask(
          {
            present38: a[0], present39: a[1], present3a: a[2], present3b: a[3],
            present3c: a[4], present3d: a[5], present3e: a[6],
          },
          1,
        ) >>> 0,
        want,
        `wide maskA pos${pos} ${x}`,
      );
    }
    for (let pos = 0; pos < 8; pos += 1) {
      const a = [0, 0, 0, 0, 0, 0, 0, 0];
      a[pos] = w32;
      const p = {
        present3f: a[0], present40: a[1], present41: a[2], present42: a[3],
        present43: a[4], present44: a[5], present46: a[6], present4f: a[7],
      };
      const on = (w32 & 0xff) !== 0;
      const want = !on ? 0
        : pos === 6
          ? INPUT_MASK_B_ID_46_FORCE
          : pos === 7
            ? INPUT_MASK_BIT6
            : ({ 0: INPUT_MASK_BIT0, 1: INPUT_MASK_BIT1, 2: INPUT_MASK_BIT2,
                 3: INPUT_MASK_BIT3, 4: INPUT_MASK_BIT5, 5: INPUT_MASK_BIT6 })[pos];
      assert.equal(
        renderShell6f95a0Mask(p) >>> 0,
        want,
        `wide maskB pos${pos} ${x}`,
      );
    }

    // Byte lanes of the hook repack pack into fixed bit positions.



    for (const pos of [1, 2]) {



      const a = [1, 1, 1];



      a[pos] = w32;



      assert.equal(



        w.hookDw0(a[0] >>> 0, a[1] >>> 0, a[2] >>> 0) >>> 0,



        managerPollA6de60HookRepackDw0(a[0], a[1], a[2]),



        `wide hookDw0 pos${pos} ${x}`,



      );



    }



  }







  // 16-bit class: same trap, same rule.



  for (const x of WIDE16) {



    const w32 = x >>> 0;



    const ni16 = w.axisNormI16(w32 | 0);



    const ji16 = managerPollA6de60AxisNormalizeI16(x | 0);



    assert.ok(Object.is(ni16, ji16), `wide axisNormI16 ${x}: ${ni16} vs ${ji16}`);



    assert.equal(



      w.a1fcMark(w32) >>> 0,



      managerPollA1fc00EntryMarkActive(x),



      `wide entryMarkActive ${x}`,



    );



    // PE truth for this one: the store is a 16-bit `mov word`, so the RESULT



    // is narrowed regardless of what the parameter mask does. Pin that the



    // module never returns anything above 0xffff — this is why dropping the



    // parameter mask here is an equivalent mutant rather than a bug, and it is



    // the property that would break if the return narrowing were ever elided.



    assert.ok(



      (w.a1fcMark(w32) >>> 0) <= 0xffff,



      `entryMarkActive must return a 16-bit word (${x})`,



    );



    assert.equal(w.hookDw0(w32, 1, 1) >>> 0, managerPollA6de60HookRepackDw0(x, 1, 1), `wide hookDw0 u16 ${x}`);



    for (const pos of [0, 1]) {



      const a = [1, 1];



      a[pos] = w32;



      assert.equal(



        w.hookDw1(a[0] >>> 0, a[1] >>> 0) >>> 0,



        managerPollA6de60HookRepackDw1(a[0], a[1]),



        `wide hookDw1 pos${pos} ${x}`,



      );



      assert.equal(



        w.hookDw2(a[0] >>> 0, a[1] >>> 0) >>> 0,



        managerPollA6de60HookRepackDw2(a[0], a[1]),



        `wide hookDw2 pos${pos} ${x}`,



      );



    }



  }







  // The void-returning repack writes through memory, so drive it wide there.



  {



    const dv = new DataView(w.memory.buffer);



    for (const x of [0x100, 0x1ff, 0x10000, 0xffffffff]) {



      const u = x >>> 0;



      w.hookRepack(u, u, u, u, u, u, u, SCRATCH_HOOK_REPACK);



      const got = [0, 1, 2].map((i) => dv.getUint32(SCRATCH_HOOK_REPACK + i * 4, true));



      const want = [



        managerPollA6de60HookRepackDw0(x, x, x),



        managerPollA6de60HookRepackDw1(x, x),



        managerPollA6de60HookRepackDw2(x, x),



      ];



      assert.deepEqual(got, want, `wide hookRepack ${x}`);



    }



  }







  // The teardown plan takes its gate byte the same way.



  {



    const dv = new DataView(w.memory.buffer);



    for (const x of WIDE8) {



      const u = x >>> 0;



      const n = w.a6da10Plan(u, SCRATCH_TEARDOWN_PLAN, 8) | 0;



      const got = [];



      for (let i = 0; i < Math.min(n, 8); i += 1) {



        got.push(dv.getInt32(SCRATCH_TEARDOWN_PLAN + i * 4, true));



      }



      const want = managerPollA6da10TeardownPlan(x);



      assert.equal(n, want.length, `wide teardownPlan count ${x}`);



      assert.deepEqual(got, want.slice(0, 8), `wide teardownPlan steps ${x}`);



    }



  }







  // v22 angle-wrap family: the count is SAR32(end - begin) — PE 0x0095530f



  // `sar eax,2`, NOT `shr` (0x3fffffff would be a shr-mutant). The slot gate



  // is a SIGNED dword test (`jl` @ 0x009552f3), and the wrapped slot value is



  // f32 end to end. These exports were export-listed but never behaviorally



  // asserted before the count/tail fix unit; pin them here so both the



  // shr-mutant and the sign-flip mutant fail the suite.



  {



    const wideEnds = [0xffffffff, 0x80000000, 0x7fffffff, 0x100, 0x100000, 0];



    const wideBegins = [0, 1, 0xffffffff, 0x104, 0x100, 0x80000000];



    for (const end of wideEnds) {



      for (const begin of wideBegins) {



        const js = managerShellAngleWrapCount(end, begin);



        const nat = w.angleWrapCount(end >>> 0, begin >>> 0) | 0;



        assert.equal(nat, js, `wide angleWrapCount end=${end} begin=${begin}`);



      }



    }



    for (const d0 of [0, 1, -1, 0x7fffffff, 0x80000000, 0xffffffff]) {



      assert.equal(



        w.angleWrapActive(d0 | 0),



        managerShellAngleWrapActive(d0) ? 1 : 0,



        `angleWrapActive ${d0}`,



      );



    }



    const slotPairs = [



      [-1, 4, 8.6, 0x10, 0],



      [1, 8, 8.1, 0x10, 0],



      [1, 8, 8, 0x10, 0],



      [1, 8, 7.7, 0x10, 0],



      [1, 8, 8.3, 0x10, 0],



      [1, 4, 7, 0x10, 0],



      [1, 4, 0.5, 0x10, 0],



      [1, 0, 0.25, 0x10, 0],



      [1, 0, -0.25, 0x10, 0],



      [1, 0, 0.125, 0x10, 0],



      [1, 0, 1, 0xffffffff, 0],



      // An active slot with end == begin has c == 0, so the PE wrap loop



      // intentionally makes no progress. Exercise that wide count only



      // through the signed negative slot gate, which returns before the loop.



      [-1, 0, 1, 0xffffffff, 0xffffffff],



      [1, 0, 1.5, 0x100, 0x104],



      [0, 0, 0.5, 0, 1],



    ];



    for (const [d0, d8, value, end, begin] of slotPairs) {



      const js = managerShellAngleWrapSlot(d0, d8, value, end, begin);



      const nat = w.angleWrapSlot(



        d0 | 0, d8 | 0, Math.fround(value), end >>> 0, begin >>> 0,



      );



      assert.ok(



        Object.is(nat, js) || Math.abs(nat - js) < 1e-6,



        `angleWrapSlot d0=${d0} d8=${d8} v=${value} end=${end} begin=${begin}: native=${nat} js=${js}`,



      );



    }



  }







  // ABI v23 differential closure — these exports were wired into loadWasm



  // but NEVER asserted against the native module (green-suite mask #1:



  // exported but unexercised). Pin each against its JS oracle here, with



  // wide-value draws on the byte gate (the F21-style blindness guard).



  {



    assert.equal(w.tailCallAVa(), STATE2_TAIL_CALL_A_VA);



    assert.equal(w.tailCallARecvOfs(), STATE2_TAIL_OFF_CALL_A_RECV);



    for (const b of [0, 1, 0xff, 0x100, 0x101, 0xffffff0a, 0xffffffff]) {



      assert.equal(



        w.tailCallBNeeded(b >>> 0),



        managerState2TailCallBNeeded(b) ? 1 : 0,



        `v23 wide tail gate b=0x${(b >>> 0).toString(16)}`,



      );



    }



    assert.equal(w.tailCallBVa(), STATE2_TAIL_CALL_B_VA);



    assert.equal(w.tailCallBRecvGlobalVa(), STATE2_TAIL_CALL_B_RECV_GLOBAL_VA);



    assert.equal(w.tailCallBArgEdx(), STATE2_TAIL_CALL_B_EDX_ARG);



    for (const r of [0, 1, 0x100, 0x7fffffff, 0x80000000, 0xffffffff]) {



      assert.equal(



        w.tailAnimVa(r >>> 0),



        managerState2TailAnimVa(r),



        `v23 anim va select r=0x${(r >>> 0).toString(16)}`,



      );



    }



    assert.equal(w.tailPlayVa(), STATE2_TAIL_PLAY_VA);



    assert.equal(w.tailPlayRecvOfs(), STATE2_TAIL_OFF_PLAY_RECV);



    assert.equal(w.tailPlayAnimIdleVa(), STATE2_TAIL_ANIM_IDLE_VA);



    assert.equal(w.tailPlayAnimClickedVa(), STATE2_TAIL_ANIM_CLICKED_VA);



    assert.equal(w.tailPlayResetArg(), STATE2_TAIL_PLAY_RESET_ARG);



  }







  // -------------------------------------------------------------------------



  // ABI v24 — Manager shell GLFW window tail (0x009554a5…0x00955580).



  // Native vs JS oracle:



  //  - win-assert gate: FULL dword null test (wide 0x100 must NOT assert)



  //  - platform flag: full-dword == 0 (same law as the v3 poll branch)



  //  - kind gate: [win+0x70] == 0x34003



  //  - f64→f32 narrowing, ordered-equality lanes, timer decay/reset, parity



  {



    for (const win of [0, 1, 0x100, 0xffffffff, 0x80000000]) {



      assert.equal(



        w.tailWinAssert(win >>> 0),



        managerShellTailWinAssertNeeded(win) ? 1 : 0,



        `tail win assert ${win}`,



      );



    }



    assert.equal(w.tailWassertMsg(), SHELL_TAIL_WASSERT_MSG_VA);



    assert.equal(w.tailWassertFile(), SHELL_TAIL_WASSERT_FILE_VA);



    assert.equal(w.tailWassertLine(), SHELL_TAIL_WASSERT_LINE);



    assert.equal(w.tailWassertIat(), SHELL_TAIL_WASSERT_IAT_VA);



    assert.equal(w.tailWinGlobal(), SHELL_TAIL_WIN_GLOBAL_VA);







    // cross-site law: the tail platform gate is the SAME test as the v3



    // poll-prefix platform branch (DAT_00c73680 == 0 → FUN_00a69f60(0x10001,0))



    for (const flag of [0, 1, 0x100, 0x7fffffff, 0x80000000, 0xffffffff]) {



      assert.equal(



        w.tailUsesPoll(flag >>> 0),



        managerShellTailUsesPlatformPoll(flag) ? 1 : 0,



        `tail uses poll ${flag}`,



      );



      assert.equal(



        w.tailUsesPoll(flag >>> 0),



        w.pollPlatform(flag >>> 0),



        `tail/poll-prefix agreement flag=${flag}`,



      );



    }



    assert.equal(w.tailPollVa(), SHELL_TAIL_PLATFORM_POLL_VA);



    assert.equal(w.tailPollArg0(), SHELL_TAIL_PLATFORM_POLL_ARG0);



    assert.equal(w.tailPollArg1(), SHELL_TAIL_PLATFORM_POLL_ARG1);



    assert.equal(w.tailPollFlag(), SHELL_TAIL_PLATFORM_FLAG_VA);







    for (const kind of [0, 0x34002, 0x34003, 0x34004, 0xffffffff, 0x100]) {



      assert.equal(



        w.tailDirectCopy(kind >>> 0),



        managerShellTailDirectCopyNeeded(kind) ? 1 : 0,



        `tail direct copy kind=${kind}`,



      );



    }



    assert.equal(w.tailKindOfs(), SHELL_TAIL_WIN_KIND_OFS);



    assert.equal(w.tailKindMagic(), SHELL_TAIL_WIN_KIND_DIRECT_COPY);



    assert.equal(w.tailD0Ofs(), SHELL_TAIL_WIN_D0_OFS);



    assert.equal(w.tailD1Ofs(), SHELL_TAIL_WIN_D1_OFS);



    assert.equal(w.tailQueryVa(), SHELL_TAIL_PLATFORM_QUERY_VA);







    const doubles = [0, 1, -1, 0.5, 1e10, 1e-10, 2 ** -106, 3.4028234663852886e38,



                     3.141592653589793, 1.0000001192092896, -0, Infinity,



                     -Infinity, NaN];



    for (const d of doubles) {



      const nat = w.tailFloatOfF64(d);



      const js = managerShellTailFloatOfF64(d);



      assert.ok(



        Object.is(nat, js) || Math.abs(nat - js) < 1e-40,



        `tail float_of_f64 ${d}: native=${nat} js=${js}`,



      );



    }



    const pairs = [



      [0, 0], [0, -0], [1, 1], [1, 2], [-1, -1], [NaN, NaN], [NaN, 1],



      [Infinity, Infinity], [-Infinity, -Infinity], [3.5, 3.5],



      [0.1, 0.1], [2 ** 25, 2 ** 25], [-2.5, -2.5],



    ];



    for (const [a, b] of pairs) {



      const fa = Math.fround(a);



      const fb = Math.fround(b);



      assert.equal(



        w.tailLaneEq(fa, fb),



        managerShellTailLaneOrderedEqual(fa, fb) ? 1 : 0,



        `lane eq ${a} vs ${b}`,



      );



    }



    for (const [f0, s0, f1, s1] of [



      [0, 0, 0, 0],



      [1, 1, 2, 2],



      [1, 1, 2, 3],



      [NaN, NaN, 1, 1],



      [1, 1, NaN, NaN],



      [0, -0, 1, 1],



      [0.5, 0.5, -0.25, -0.25],



    ]) {



      const jsv = managerShellTailBothLanesEqual(f0, s0, f1, s1);



      const nat = w.tailBothEq(Math.fround(f0), Math.fround(s0),



                               Math.fround(f1), Math.fround(s1));



      assert.equal(nat, jsv ? 1 : 0, `both lanes ${f0},${s0},${f1},${s1}`);



    }







    for (const [timer, eq] of [



      [0, 1], [1, 1], [5, 1], [300, 1], [-1, 1], [-5, 1], [0x7fffffff, 1],



      [0, 0], [5, 0], [-2, 0], [0x80000000, 0],



    ]) {



      assert.equal(



        w.tailTimerNext(timer | 0, eq),



        managerShellTailTimerNext(timer, eq !== 0),



        `tail timer ${timer} eq=${eq}`,



      );



    }



    assert.equal(w.tailTimerOfs(), SHELL_TAIL_TIMER_OFS);



    assert.equal(w.tailTimerReset(), SHELL_TAIL_TIMER_RESET);



    assert.equal(w.tailStoreF0Ofs(), SHELL_TAIL_STORE_F0_OFS);



    assert.equal(w.tailStoreF1Ofs(), SHELL_TAIL_STORE_F1_OFS);







    for (const p of [0, 1, 0xff, 0x100, 0x7fffffff, 0xffffffff]) {



      assert.equal(



        w.tailParityNext(p | 0),



        managerShellTailParityNext(p),



        `tail parity ${p}`,



      );



      // cross-field law: the shell tail increments the SAME counter the



      // early-skip / state-2 parity arm reads.



      assert.equal(



        w.tailParityNext(p | 0),



        w.earlyNext(p | 0),



        `tail/early parity cross ${p}`,



      );



    }



    assert.equal(w.tailParityOfs(), SHELL_TAIL_PARITY_OFS);



    assert.equal(SHELL_TAIL_PARITY_OFS, MANAGER_SHELL_OFF_COUNTER);







    /* ---------------- ABI v25: pre-poll state-machine block ---------------- */



    for (const b of [0, 1, 0xff, 0x100, 0x10000, 0x7fffffff, 0xffffffff]) {



      assert.equal(w.prepState4(b >>> 0),



                   managerPrepollState4StoreNeeded(b) ? 1 : 0,



                   `prepoll state4 byte=${b}`);



      assert.equal(w.prepG1(b >>> 0),



                   managerPrepollG1Needed(b) ? 1 : 0, `prepoll G1 ${b}`);



      assert.equal(w.prepG2(b >>> 0),



                   managerPrepollG2Needed(b) ? 1 : 0, `prepoll G2 ${b}`);



      assert.equal(w.prepG3(b >>> 0),



                   managerPrepollG3Needed(b) ? 1 : 0, `prepoll G3 ${b}`);



      assert.equal(w.prepG4(b >>> 0),



                   managerPrepollG4Needed(b) ? 1 : 0, `prepoll G4 ${b}`);



      assert.equal(w.prepNightmare(b >>> 0),



                   managerPrepollNightmareArg(b), `prepoll nightmare arg ${b}`);



    }



    for (const [g1, g2] of [[0, 0], [1, 0], [0, 1], [1, 1], [0x100, 0xff],



                            [0xffffffff, 0xffffffff], [0x10000, 1]]) {



      assert.equal(w.prepHostC(g1 >>> 0, g2 >>> 0),



                   managerPrepollHostCNeeded(g1, g2) ? 1 : 0,



                   `prepoll hostC g1=${g1} g2=${g2}`);



      assert.equal(w.prepS3Trans(g1 >>> 0),



                   managerPrepollState3TransitionNeeded(g1) ? 1 : 0,



                   `prepoll s3trans g1=${g1}`);



      assert.equal(w.prepS5Trans(g2 >>> 0),



                   managerPrepollState5TransitionNeeded(g2) ? 1 : 0,



                   `prepoll s5trans g2=${g2}`);



    }



    for (const [st, g3, d28, d0] of [



      [3, 0, 0, 0], [3, 0, 0, 1], [3, 0, 0, 0xffffffff], [5, 0, 0, 0],



      [5, 0, 1, 0], [5, 0, 0xffffffff, 0], [5, 1, 0, 999], [3, 1, 0, 0],



      [3, 1, 1, 0], [4, 0, 0, 0], [0, 0, 0, 0], [0x100, 0, 0, 0],



      [-1, 0, 0, 0], [0x7fffffff, 1, 0x80000000, 0],



    ]) {



      assert.equal(



        w.prepArm(st | 0, g3 >>> 0, d28 | 0, d0 | 0),



        managerPrepollArmSelect(st, g3, d28, d0),



        `prepoll arm st=${st} g3=${g3} d28=${d28} d0=${d0}`,



      );



    }



    for (const [arm, g2] of [[3, 1], [3, 0x100], [3, 0], [5, 1], [0, 1],



                             [3, 0x10000], [0xffffffff, 0xff]]) {



      assert.equal(



        w.prepCopyBlock(arm | 0, g2 >>> 0),



        managerPrepollCopyBlockNeeded(arm, g2) ? 1 : 0,



        `prepoll copyBlock arm=${arm} g2=${g2}`,



      );



    }



    for (const h of [1, 0, 2, -1, 0x100, 0xffffffff, 0x7fffffff,



                     0x80000000]) {



      assert.equal(w.prepLog(h | 0),



                   managerPrepollLogNeeded(h) ? 1 : 0,



                   `prepoll log history=${h}`);



    }



    for (const slot of [0, 1, 2, 0x40000000, 0xffffffff, 0x1000000]) {



      assert.equal(w.prepCopySrc(slot >>> 0),



                   managerPrepollCopySrcOfs(slot),



                   `prepoll copySrc slot=${slot}`);



      assert.equal(w.prepCopySrcDw(slot >>> 0),



                   managerPrepollCopySrcDwordOfs(slot),



                   `prepoll copySrcDw slot=${slot}`);



    }



    for (const v of [1, 0, -1, 0.5, 1e38, -1e38, 3.5, 0.1, NaN, Infinity,



                     -Infinity, 2 ** 25, 2 ** 26, 2 ** 27, 1e-20]) {



      const fv = Math.fround(v);



      const nat = w.prepB0Next(fv);



      const js = managerPrepollGameB0Next(fv);



      assert.ok(



        Object.is(nat, js) || Math.abs(nat - js) < 1e-40,



        `prepoll b0 next ${fv}: native=${nat} js=${js}`,



      );



    }



    assert.equal(w.prepStateOfs(), 0x8);



    assert.equal(w.prepHistoryOfs(), 0xc);



    assert.equal(w.prepG1Ofs(), 0x21618);



    assert.equal(w.prepCutsceneIdOfs(), 0x2161c);



    assert.equal(w.prepG2Ofs(), 0x21620);



    assert.equal(w.prepSlotIdxOfs(), 0x215d8);



    assert.equal(w.prepSrcBase(), 0x20e00);



    assert.equal(w.prepSrcDw(), 0x20e10);



    assert.equal(w.prepStride(), 0x4c);



    assert.equal(w.prepDstCore(), 0x4b290);



    assert.equal(w.prepDstDw(), 0x4b2a0);



    assert.equal(w.prepDstExt(), 0x4b28c);



    assert.equal(w.prepExtFrom(), 0x21624);



    assert.equal(w.prepFlagOfs(), 0x4b288);



    assert.equal(w.prepFlagVal(), 1);



    assert.equal(w.prepG3Ofs(), 0x4b2a4);



    assert.equal(w.prepNightmareArgOfs(), 0x4b2a5);



    assert.equal(w.prepG4Ofs(), 0x4b428);



    assert.equal(w.prepS3ArmByteOfs(), 0x29fb8);



    assert.equal(w.prepPredispatchRecv(), 0x20dd0);



    assert.equal(w.prepS5Recv(), 0x21628);



    assert.equal(w.prepStoreBase(), 0x265a4);



    assert.equal(w.prepStoreB4(), 0x265b4);



    assert.equal(w.prepStoreB8(), 0x265b8);



    assert.equal(w.prepStoreBc(), 0x265bc);



    assert.equal(w.prepStoreB8Bits(), 0x3f800000);



    assert.equal(w.prepStoreBcVal(), 8);



    assert.equal(w.prepCrossRecv(), 0x29fbc);



    assert.equal(w.prepCrossMusic(), 0x3f);



    assert.equal(w.prepCrossRate(), 0x3da3d70a);



    assert.equal(w.prepHostA(), 0x00959720);



    assert.equal(w.prepHostB(), 0x00959d00);



    assert.equal(w.prepHostCVa(), 0x00959670);



    assert.equal(w.prepHostD(), 0x0095e7c0);



    assert.equal(w.prepHostE(), 0x00921ce0);



    assert.equal(w.prepHostF(), 0x00954b40);



    assert.equal(w.prepHostG(), 0x00a0f550);



    assert.equal(w.prepHostGArg() >>> 0, 0xff000000);



    assert.equal(w.prepLogVa(), 0x00a112c0);



    assert.equal(w.prepLogLevel(), 1);



    assert.equal(w.prepLogMsg(), 0x00b7d234);



    assert.equal(w.prepHostH(), 0x007e1e70);







    /* ---------------- ABI v26: playerscan depth FUN_00954b40 ---------------- */



    for (const [end, begin] of [



      [0, 0], [8, 0], [0x50, 0], [7, 0], [0x100, 0x80], [0, 8],



      [0xffffffff, 0], [0x80000000, 0], [-8, 0], [-1, -1], [0x1000, 0x900],



    ]) {



      assert.equal(



        w.psCount(end | 0, begin | 0),



        managerPlayerscanCountFromBounds(end, begin),



        `playerscan count end=${end} begin=${begin}`,



      );



      assert.equal(



        w.psPlayerCount(end | 0, begin | 0),



        managerPlayerscanPlayerCountFromBounds(end, begin),



        `playerscan playerCount end=${end} begin=${begin}`,



      );



    }



    for (const [begin, index] of [



      [0, 0], [0x100, 0], [0x100, 1], [0x100, 0x20000000],



      [0xfffffff8, 1], [0xffffffff, 0x20000000], [0x40000000, 3],



      [0x80000000, 0x10000000],



    ]) {



      assert.equal(



        w.psElemPtr(begin >>> 0, index >>> 0) >>> 0,



        managerPlayerscanElementPtr(begin, index),



        `playerscan elemPtr begin=${begin} index=${index}`,



      );



    }



    for (const r of [-1, 0, 1, 0x7fffffff, 0x80000000, 0xffffffff, -2,



                     0x100, 0x1ff]) {



      assert.equal(



        w.psMatch(r | 0),



        managerPlayerscanMatchNeeded(r) ? 1 : 0,



        `playerscan match r=${r}`,



      );



    }



    for (const st of [2, 0, 3, 1, 0x100, 0x10000002, -1, 0x7fffffff,



                      0x80000000]) {



      assert.equal(



        w.psState2(st | 0),



        managerPlayerscanState2Gate(st) ? 1 : 0,



        `playerscan state2 st=${st}`,



      );



    }



    for (const n of [0, 1, -1, 0x100, 0x80000000, 0x7fffffff, 0xffffffff]) {



      assert.equal(



        w.psLog(n | 0),



        managerPlayerscanLogNeeded(n) ? 1 : 0,



        `playerscan log n=${n}`,



      );



      assert.equal(



        w.psRelease(n >>> 0),



        managerPlayerscanReleaseGate(n) ? 1 : 0,



        `playerscan release ctrl=${n}`,



      );



    }



    // WIDE byte drives, never pre-masked (uint8-param defect class): 0x100's



    // low byte is 0 and 0x1ff's is 0xff.



    for (const [al, cb] of [



      [0, 0], [1, 0], [0, 1], [1, 1], [0x100, 1], [0x1ff, 1],



      [0xff, 0xffffffff], [0xffffffff, 0], [0x10000, 0x7fffffff],



      [0x101, 0x100], [0xffffffff, 0xffffffff],



    ]) {



      assert.equal(



        w.psCallback(al >>> 0, cb >>> 0),



        managerPlayerscanCallbackNeeded(al, cb) ? 1 : 0,



        `playerscan callback al=${al} cb=${cb}`,



      );



    }



    assert.equal(w.psElemCtrlOfs(), 0xc);



    assert.equal(w.psMgrStoreOfs(), 0x4abd4);



    assert.equal(w.psListBeginOfs(), 0x1baa8);



    assert.equal(w.psListEndOfs(), 0x1baac);



    assert.equal(w.psVecThis(), 0xc57b18);



    assert.equal(w.psVecBegin(), 0xc57b20);



    assert.equal(w.psVecEnd(), 0xc57b24);



    assert.equal(w.psVecLock(), 0xc57b2c);



    assert.equal(w.psVecStride(), 8);



    assert.equal(w.psListStride(), 4);



    assert.equal(w.psLastIdxVa(), 0xbf9444);



    assert.equal(w.psCbVa(), 0xc7e814);



    assert.equal(w.psMgrVa(), 0xc7169c);



    assert.equal(w.psGameVa(), 0xc71678);



    assert.equal(w.psAccessor(), 0x00a20240);



    assert.equal(w.psSetCtrl(), 0x007a6450);



    assert.equal(w.psSetCtrlArg(), 1);



    assert.equal(w.psMatchSlot(), 0x3c);



    assert.equal(w.psMatchArg(), 0);



    assert.equal(w.psMatchSent() >>> 0, 0xffffffff);



    assert.equal(w.psRelSlot(), 0xc);



    assert.equal(w.psLogLevel(), 0x10);



    assert.equal(w.psLogMsg(), 0x00b7e6bc);



    assert.equal(w.psState2Val(), 2);







    // Deterministic randomized differential over the v26 surface (LCG high



    // bits only, standing rule).



    let seed26 = 0x954b40;



    const next26 = () => {



      seed26 = (Math.imul(seed26, 1664525) + 1013904223) >>> 0;



      return seed26 >>> 16; // high bits



    };



    for (let k = 0; k < 256; k++) {



      const end = next26();



      const begin = next26();



      assert.equal(



        w.psCount(end | 0, begin | 0),



        managerPlayerscanCountFromBounds(end, begin),



        `playerscan rnd count ${k}`,



      );



      assert.equal(



        w.psPlayerCount(end | 0, begin | 0),



        managerPlayerscanPlayerCountFromBounds(end, begin),



        `playerscan rnd playerCount ${k}`,



      );



      const idx = next26();



      const beg = next26();



      assert.equal(



        w.psElemPtr(beg >>> 0, idx >>> 0) >>> 0,



        managerPlayerscanElementPtr(beg, idx),



        `playerscan rnd elemPtr ${k}`,



      );



      const r = next26();



      assert.equal(



        w.psMatch(r | 0),



        managerPlayerscanMatchNeeded(r) ? 1 : 0,



        `playerscan rnd match ${k}`,



      );



      const st = next26();



      assert.equal(



        w.psState2(st | 0),



        managerPlayerscanState2Gate(st) ? 1 : 0,



        `playerscan rnd state2 ${k}`,



      );



      const al = next26();



      const cb = next26();



      assert.equal(



        w.psCallback(al >>> 0, cb >>> 0),



        managerPlayerscanCallbackNeeded(al, cb) ? 1 : 0,



        `playerscan rnd callback ${k}`,



      );



      assert.equal(



        w.psLog(al | 0),



        managerPlayerscanLogNeeded(al) ? 1 : 0,



        `playerscan rnd log ${k}`,



      );



      assert.equal(



        w.psRelease(cb >>> 0),



        managerPlayerscanReleaseGate(cb) ? 1 : 0,



        `playerscan rnd release ${k}`,



      );



    }







    /* ---------------- ABI v27: FUN_00a0f550 packed-ARGB body ---------------- */



    const packedCases = [



      0, 1, 0xff, 0x100, 0x1ff, 0xff00, 0xff0000, 0xff000000,



      0x00aabbcc, 0x80ff4010, 0xffffffff, 0x7fffffff, 0x80000000,



      0x01020304, 0x10203040,



    ];



    for (const p of packedCases) {



      assert.equal(w.a0r(p >>> 0), managerA0f550R(p), `a0f550 R ${p}`);



      assert.equal(w.a0g(p >>> 0), managerA0f550G(p), `a0f550 G ${p}`);



      assert.equal(w.a0b(p >>> 0), managerA0f550B(p), `a0f550 B ${p}`);



      assert.equal(w.a0a(p >>> 0), managerA0f550A(p), `a0f550 A ${p}`);



      const nat0 = w.a0f0(p >>> 0);



      const js0 = managerA0f550F0(p);



      assert.ok(Object.is(nat0, js0) || Math.abs(nat0 - js0) < 1e-40,



                `a0f550 f0 ${p}: native=${nat0} js=${js0}`);



      const nat1 = w.a0f1(p >>> 0);



      const js1 = managerA0f550F1(p);



      assert.ok(Object.is(nat1, js1) || Math.abs(nat1 - js1) < 1e-40,



                `a0f550 f1 ${p}: native=${nat1} js=${js1}`);



      const nat2 = w.a0f2(p >>> 0);



      const js2 = managerA0f550F2(p);



      assert.ok(Object.is(nat2, js2) || Math.abs(nat2 - js2) < 1e-40,



                `a0f550 f2 ${p}: native=${nat2} js=${js2}`);



      const nat3 = w.a0f3(p >>> 0);



      const js3 = managerA0f550F3(p);



      assert.ok(Object.is(nat3, js3) || Math.abs(nat3 - js3) < 1e-40,



                `a0f550 f3 ${p}: native=${nat3} js=${js3}`);



    }



    // Wide byte-gate values unmasked on channel_f32



    for (const b of [0, 1, 0x7f, 0x80, 0xff, 0x100, 0x1ff, 0x10000,



                     0x7fffffff, 0xffffffff]) {



      const nat = w.a0ch(b >>> 0);



      const js = managerA0f550ChannelF32(b);



      assert.ok(Object.is(nat, js) || Math.abs(nat - js) < 1e-40,



                `a0f550 ch ${b}: native=${nat} js=${js}`);



    }



    assert.equal(w.a0tail(), 0);



    assert.equal(w.a0f0Ofs(), 0);



    assert.equal(w.a0f1Ofs(), 4);



    assert.equal(w.a0f2Ofs(), 8);



    assert.equal(w.a0f3Ofs(), 0xc);



    assert.equal(w.a0tailOfs(), 0x10);



    assert.equal(w.a0denomBits() >>> 0, 0x437f0000);



    assert.equal(w.a0denomVa() >>> 0, 0x00baaae4);



    assert.equal(w.a0tableVa() >>> 0, 0x00bacb00);



    assert.equal(w.a0va() >>> 0, 0x00a0f550);



    assert.equal(w.a0retVa() >>> 0, 0x00a0f601);



    assert.equal(w.a0bytes(), 0xb1);



    assert.equal(w.a0next() >>> 0, 0x00959d00);







    let seed27 = 0xa0f550;



    const next27 = () => {



      seed27 = (Math.imul(seed27, 1664525) + 1013904223) >>> 0;



      return seed27;



    };



    for (let k = 0; k < 256; k++) {



      const p = next27();



      assert.equal(w.a0r(p >>> 0), managerA0f550R(p), `a0f550 rnd R ${k}`);



      assert.equal(w.a0g(p >>> 0), managerA0f550G(p), `a0f550 rnd G ${k}`);



      assert.equal(w.a0b(p >>> 0), managerA0f550B(p), `a0f550 rnd B ${k}`);



      assert.equal(w.a0a(p >>> 0), managerA0f550A(p), `a0f550 rnd A ${k}`);



      const nat = w.a0f0(p >>> 0);



      const js = managerA0f550F0(p);



      assert.ok(Object.is(nat, js) || Math.abs(nat - js) < 1e-40,



                `a0f550 rnd f0 ${k}`);



    }







    /* ---------------- ABI v28: FUN_00959d00 host B decision table ---------- */



    assert.equal(w.b28body(0), manager959d00BodyNeeded(0) ? 1 : 0);



    assert.equal(w.b28body(1), manager959d00BodyNeeded(1) ? 1 : 0);



    assert.equal(w.b28body(0x100), manager959d00BodyNeeded(0x100) ? 1 : 0);



    assert.equal(w.b28body(0x1ff), manager959d00BodyNeeded(0x1ff) ? 1 : 0);



    assert.equal(w.b28body(0xffffffff), manager959d00BodyNeeded(0xffffffff) ? 1 : 0);



    assert.equal(w.b28state2(2), 1);



    assert.equal(w.b28state2(0), 0);



    assert.equal(w.b28state2(-1), 0);



    assert.equal(w.b28queue(0, 0), 0);



    assert.equal(w.b28queue(0, 1), 1);



    assert.equal(w.b28queue(0xffffffff, 0xffffffff), 0);



    assert.equal(w.b28island(1, 2, 0, 4), 1);



    assert.equal(w.b28island(0, 2, 0, 4), 0);



    assert.equal(w.b28island(0x100, 2, 0, 4), 0);



    // UNSIGNED jbe mutant target: 0xffffffff / 0x80000000 must stay 0



    assert.equal(w.b28quiet(0, 0), 1);



    assert.equal(w.b28quiet(0, 1), 0);



    assert.equal(w.b28quiet(0, 0xffffffff), 0);



    assert.equal(w.b28quiet(0, 0x80000000), 0);



    assert.equal(w.b28quiet(1, 0), 0);



    assert.equal(w.b28quiet(0xffffffff, 0), 0);



    assert.equal(w.b28h907690(0x11), 0);



    assert.equal(w.b28h907690(0), 1);



    assert.equal(w.b28h907690(0xffffffff), 1);



    assert.equal(w.b28alloc(0), 1);



    assert.equal(w.b28alloc(1), 0);



    assert.equal(w.b28alloc(0xffffffff), 0);



    assert.equal(w.b28ctor(0), 0);



    assert.equal(w.b28ctor(1), 1);



    assert.equal(w.b28ctor(0xffffffff), 1);



    assert.equal(w.b28flagOfs(), 0x4b288);



    assert.equal(w.b28stateOfs(), 8);



    assert.equal(w.b28state2Val(), 2);



    assert.equal(w.b28qBegin(), 0x4b3d8);



    assert.equal(w.b28qEnd(), 0x4b3dc);



    assert.equal(w.b28modeOfs(), 0x26584);



    assert.equal(w.b2826630Ofs(), 0x26630);



    assert.equal(w.b28extOfs(), 0x4b28c);



    assert.equal(w.b28extSkip(), 0x11);



    assert.equal(w.b28coreOfs(), 0x4b290);



    assert.equal(w.b28f0Ofs(), 0x4b294);



    assert.equal(w.b28f1Ofs(), 0x4b298);



    assert.equal(w.b28f2Ofs(), 0x4b29c);



    assert.equal(w.b28dwOfs(), 0x4b2a0);



    assert.equal(w.b28menuVa() >>> 0, 0x00c72a20);



    assert.equal(w.b28allocSz(), 0xf930);



    assert.equal(w.b28storeCore(), 0x1c);



    assert.equal(w.b28storeF0(), 0x20);



    assert.equal(w.b28storeF1(), 0x24);



    assert.equal(w.b28storeF2(), 0x28);



    assert.equal(w.b28storeDw(), 0x2c);



    assert.equal(w.b28storeFlag(), 0x14);



    assert.equal(w.b28storeFlagVal(), 1);



    assert.equal(w.b28stateAfter(), 1);



    assert.equal(w.b28flagClear(), 0);



    assert.equal(w.b28mgrVa() >>> 0, 0x00c7169c);



    assert.equal(w.b28gameVa() >>> 0, 0x00c71678);



    assert.equal(w.b28h90cd10() >>> 0, 0x0090cd10);



    assert.equal(w.b28h90a8a0() >>> 0, 0x0090a8a0);



    assert.equal(w.b28h907690Va() >>> 0, 0x00907690);



    assert.equal(w.b28h959670() >>> 0, 0x00959670);



    assert.equal(w.b28h91c770() >>> 0, 0x0091c770);



    assert.equal(w.b28hA0f4c0() >>> 0, 0x00a0f4c0);



    assert.equal(w.b28h986450() >>> 0, 0x00986450);



    assert.equal(w.b28h987450() >>> 0, 0x00987450);



    assert.equal(w.b28h98aa30() >>> 0, 0x0098aa30);



    assert.equal(w.b28va() >>> 0, 0x00959d00);



    assert.equal(w.b28ret() >>> 0, 0x00959e66);



    assert.equal(w.b28bytes(), 0x166);



    assert.equal(w.b28sites(), 2);



    assert.equal(w.b28next() >>> 0, 0x00959720);







    let seed28 = 0x959d00;



    const next28 = () => {



      seed28 = (Math.imul(seed28, 1664525) + 1013904223) >>> 0;



      return seed28;



    };



    for (let k = 0; k < 256; k++) {



      const fl = next28();



      const st = next28() | 0;



      const bgn = next28();



      const end = next28();



      const mode = next28();



      const d26 = next28();



      const ext = next28();



      const menu = next28();



      assert.equal(



        w.b28body(fl >>> 0),



        manager959d00BodyNeeded(fl) ? 1 : 0,



        `959d00 rnd body ${k}`,



      );



      assert.equal(



        w.b28state2(st),



        manager959d00State2Needed(st) ? 1 : 0,



        `959d00 rnd state2 ${k}`,



      );



      assert.equal(



        w.b28queue(bgn >>> 0, end >>> 0),



        manager959d00QueueNonempty(bgn, end) ? 1 : 0,



        `959d00 rnd queue ${k}`,



      );



      assert.equal(



        w.b28island(fl >>> 0, st, bgn >>> 0, end >>> 0),



        manager959d00State2IslandNeeded(fl, st, bgn, end) ? 1 : 0,



        `959d00 rnd island ${k}`,



      );



      assert.equal(



        w.b28quiet(mode >>> 0, d26 >>> 0),



        manager959d00QuietArg(mode, d26) ? 1 : 0,



        `959d00 rnd quiet ${k}`,



      );



      assert.equal(



        w.b28h907690(ext >>> 0),



        manager959d00Host907690Needed(ext) ? 1 : 0,



        `959d00 rnd 907690 ${k}`,



      );



      assert.equal(



        w.b28alloc(menu >>> 0),



        manager959d00MenuAllocNeeded(menu) ? 1 : 0,



        `959d00 rnd alloc ${k}`,



      );



      assert.equal(



        w.b28ctor(menu >>> 0),



        manager959d00MenuCtorNeeded(menu) ? 1 : 0,



        `959d00 rnd ctor ${k}`,



      );



    }







    /* ---------------- ABI v29: FUN_00959720 host A entry/join ------------- */



    assert.equal(w.a29body(0), manager959720BodyNeeded(0) ? 1 : 0);



    assert.equal(w.a29body(1), manager959720BodyNeeded(1) ? 1 : 0);



    assert.equal(w.a29body(0x100), manager959720BodyNeeded(0x100) ? 1 : 0);



    assert.equal(w.a29body(0x1ff), manager959720BodyNeeded(0x1ff) ? 1 : 0);



    assert.equal(w.a29body(0xffffffff), manager959720BodyNeeded(0xffffffff) ? 1 : 0);



    assert.equal(w.a29probe(0), 0);



    assert.equal(w.a29probe(1), 1);



    assert.equal(w.a29probe(0x100), 0);



    assert.equal(w.a29probeOk(0), 0);



    assert.equal(w.a29probeOk(1), 1);



    assert.equal(w.a29probeOk(0x100), 0);



    assert.equal(w.a29cont(0, 0, 0), 0);



    assert.equal(w.a29cont(1, 0, 0), 1);



    assert.equal(w.a29cont(1, 1, 0), 0);



    assert.equal(w.a29cont(1, 1, 1), 1);



    assert.equal(w.a29pInc(0), 0);



    assert.equal(w.a29pInc(1), 1);



    assert.equal(w.a29pInc(0x80000000), 0);



    assert.equal(w.a29pInc(0x80000001), 1);



    assert.equal(w.a29pInc(0xffffffff), 1);



    assert.equal(w.a29pNext(0) >>> 0, 1);



    assert.equal(w.a29pNext(0xffffffff) >>> 0, 0);



    assert.equal(w.a29gAlloc(0), 1);



    assert.equal(w.a29gAlloc(1), 0);



    assert.equal(w.a29gCtor(0), 0);



    assert.equal(w.a29gCtor(1), 1);



    assert.equal(w.a29queue(0, 0), 0);



    assert.equal(w.a29queue(0, 1), 1);



    assert.equal(w.a29h6eef20(1, 1, 0), 1);



    assert.equal(w.a29h6eef20(0, 1, 0), 0);



    assert.equal(w.a29h6eef20(1, 0, 0), 0);



    assert.equal(w.a29h6eef20(1, 1, 1), 0);



    assert.equal(w.a29h923450(0, 0), 1);



    assert.equal(w.a29h923450(1, 1), 0);



    assert.equal(w.a29h923450(1, 0), 1);



    // UNSIGNED 4b1c0 mutant target



    assert.equal(w.a29arm(0, 0, 0, 0, 0), A959720_ARM_START);



    assert.equal(w.a29arm(1, 1, 0, 0, 0), A959720_ARM_SEED_THEN);



    assert.equal(w.a29arm(1, 0, 0, 0, 0), A959720_ARM_HOST_6F5850);



    assert.equal(w.a29arm(0, 1, 0, 0, 0), A959720_ARM_SEED_ELSE);



    assert.equal(w.a29arm(0, 0, 1, 0, 0), A959720_ARM_4B132);



    assert.equal(w.a29arm(0, 0, 0, 1, 0), A959720_ARM_DAILY);



    assert.equal(w.a29arm(0, 0, 0, 0xffffffff, 0), A959720_ARM_DAILY);



    assert.equal(w.a29arm(0, 0, 0, 0x80000000, 0), A959720_ARM_DAILY);



    assert.equal(w.a29arm(0, 0, 0, 0, 1), A959720_ARM_DEBUG);



    // Join parity: peSignedMod2Eq1, NOT bit0



    assert.equal(w.a29jInc(1), 1);



    assert.equal(w.a29jInc(2), 0);



    assert.equal(w.a29jInc(-1), 0);



    assert.equal(w.a29jInc(0x80000001), 0);



    assert.equal(w.a29jInc(0xffffffff), 0);



    assert.equal(w.a29flagOfs(), 0x4b130);



    assert.equal(w.a29probeOfs(), 0x4b274);



    assert.equal(w.a29parityOfs(), 0x4abbc);



    assert.equal(w.a29qBegin(), 0x4b3d8);



    assert.equal(w.a29qEnd(), 0x4b3dc);



    assert.equal(w.a29stateOfs(), 8);



    assert.equal(w.a29stateAfter(), 2);



    assert.equal(w.a294b131Ofs(), 0x4b131);



    assert.equal(w.a294b132Ofs(), 0x4b132);



    assert.equal(w.a294b140Ofs(), 0x4b140);



    assert.equal(w.a294b3e4Ofs(), 0x4b3e4);



    assert.equal(w.a29recvOfs(), 0x21628);



    assert.equal(w.a294b1c0Ofs(), 0x4b1c0);



    assert.equal(w.a294b19cOfs(), 0x4b19c);



    assert.equal(w.a294b284Ofs(), 0x4b284);



    assert.equal(w.a294b284Val(), 1);



    assert.equal(w.a29flagClear(), 0);



    assert.equal(w.a29gAllocSz(), 0x68e88);



    assert.equal(w.a29mgrVa() >>> 0, 0x00c7169c);



    assert.equal(w.a29gameVa() >>> 0, 0x00c71678);



    assert.equal(w.a29h90c400() >>> 0, 0x0090c400);



    assert.equal(w.a29h959670() >>> 0, 0x00959670);



    assert.equal(w.a29hA0f4c0() >>> 0, 0x00a0f4c0);



    assert.equal(w.a29h6f1020() >>> 0, 0x006f1020);



    assert.equal(w.a29h6f4740() >>> 0, 0x006f4740);



    assert.equal(w.a29h90a8a0() >>> 0, 0x0090a8a0);



    assert.equal(w.a29h6eef20Va() >>> 0, 0x006eef20);



    assert.equal(w.a29h91c770() >>> 0, 0x0091c770);



    assert.equal(w.a29h923450Va() >>> 0, 0x00923450);



    assert.equal(w.a29h6f6dd0() >>> 0, 0x006f6dd0);



    assert.equal(w.a29h6f7750() >>> 0, 0x006f7750);



    assert.equal(w.a29h6f5320() >>> 0, 0x006f5320);



    assert.equal(w.a29armSeedThen(), 1);



    assert.equal(w.a29arm6f5850(), 2);



    assert.equal(w.a29armSeedElse(), 3);



    assert.equal(w.a29arm4b132(), 4);



    assert.equal(w.a29armDaily(), 5);



    assert.equal(w.a29armDebug(), 6);



    assert.equal(w.a29armStart(), 7);



    assert.equal(w.a29va() >>> 0, 0x00959720);



    assert.equal(w.a29ret() >>> 0, 0x00959cf8);



    assert.equal(w.a29bytes(), 0x5d8);



    assert.equal(w.a29sites(), 1);



    assert.equal(w.a29siteVa() >>> 0, 0x00954d5e);



    assert.equal(w.a29next() >>> 0, 0x00959670);







    let seed29 = 0x959720;



    const next29 = () => {



      seed29 = (Math.imul(seed29, 1664525) + 1013904223) >>> 0;



      return seed29;



    };



    for (let k = 0; k < 256; k++) {



      const f130 = next29();



      const f274 = next29();



      const pal = next29();



      const ctr = next29();



      const gp = next29();



      const bgn = next29();



      const end = next29();



      const p140 = next29();



      const d3e4 = next29();



      const f131 = next29();



      const f132 = next29();



      const d1c0 = next29();



      const f19c = next29();



      assert.equal(



        w.a29body(f130 >>> 0),



        manager959720BodyNeeded(f130) ? 1 : 0,



        `959720 rnd body ${k}`,



      );



      assert.equal(



        w.a29probe(f274 >>> 0),



        manager959720ProbeNeeded(f274) ? 1 : 0,



        `959720 rnd probe ${k}`,



      );



      assert.equal(



        w.a29probeOk(pal >>> 0),



        manager959720ProbeOk(pal) ? 1 : 0,



        `959720 rnd probeOk ${k}`,



      );



      assert.equal(



        w.a29cont(f130 >>> 0, f274 >>> 0, pal >>> 0),



        manager959720BodyContinue(f130, f274, pal) ? 1 : 0,



        `959720 rnd cont ${k}`,



      );



      assert.equal(



        w.a29pInc(ctr >>> 0),



        manager959720ParityIncNeeded(ctr) ? 1 : 0,



        `959720 rnd pInc ${k}`,



      );



      assert.equal(



        w.a29pNext(ctr >>> 0) >>> 0,



        manager959720ParityNext(ctr),



        `959720 rnd pNext ${k}`,



      );



      assert.equal(



        w.a29gAlloc(gp >>> 0),



        manager959720GameAllocNeeded(gp) ? 1 : 0,



        `959720 rnd gAlloc ${k}`,



      );



      assert.equal(



        w.a29gCtor(gp >>> 0),



        manager959720GameCtorNeeded(gp) ? 1 : 0,



        `959720 rnd gCtor ${k}`,



      );



      assert.equal(



        w.a29queue(bgn >>> 0, end >>> 0),



        manager959720QueueNonempty(bgn, end) ? 1 : 0,



        `959720 rnd queue ${k}`,



      );



      assert.equal(



        w.a29h6eef20(f274 >>> 0, p140 >>> 0, d3e4 >>> 0),



        manager959720Host6eef20Needed(f274, p140, d3e4) ? 1 : 0,



        `959720 rnd 6eef20 ${k}`,



      );



      assert.equal(



        w.a29h923450(f274 >>> 0, f131 >>> 0),



        manager959720Host923450Needed(f274, f131) ? 1 : 0,



        `959720 rnd 923450 ${k}`,



      );



      assert.equal(



        w.a29arm(f274 >>> 0, f131 >>> 0, f132 >>> 0, d1c0 >>> 0, f19c >>> 0),



        manager959720JoinArm(f274, f131, f132, d1c0, f19c),



        `959720 rnd arm ${k}`,



      );



      assert.equal(



        w.a29jInc(ctr | 0),



        manager959720JoinParityIncNeeded(ctr | 0) ? 1 : 0,



        `959720 rnd jInc ${k}`,



      );



    }







    /* ---------------- ABI v30: FUN_00959670 cleanup_current_state --------- */



    assert.equal(w.c30sid(0), 0);



    assert.equal(w.c30sid(1), 1);



    assert.equal(w.c30sid(2), 2);



    assert.equal(w.c30sid(-1), 0);



    assert.equal(w.c30sid(0xffffffff), 0);



    assert.equal(w.c30s1(0), manager959670State1Needed(0) ? 1 : 0);



    assert.equal(w.c30s1(1), 1);



    assert.equal(w.c30s1(2), 0);



    assert.equal(w.c30s1(-1), 0);



    assert.equal(w.c30s2(0), 0);



    assert.equal(w.c30s2(1), 0);



    assert.equal(w.c30s2(2), 1);



    assert.equal(w.c30s2(-1), 0);



    assert.equal(w.c30gPres(0), 0);



    assert.equal(w.c30gPres(1), 1);



    assert.equal(w.c30gPres(0xffffffff), 1);



    assert.equal(w.c30gBody(2, 1), 1);



    assert.equal(w.c30gBody(2, 0), 0);



    assert.equal(w.c30gBody(1, 1), 0);



    assert.equal(w.c30mPres(0), 0);



    assert.equal(w.c30mPres(1), 1);



    assert.equal(w.c30mBody(1, 1), 1);



    assert.equal(w.c30mBody(1, 0), 0);



    assert.equal(w.c30mBody(2, 1), 0);



    assert.equal(w.c30exit(0), 0);



    assert.equal(w.c30exit(1), 1);



    assert.equal(w.c30exit(0x100), 0);



    assert.equal(w.c30exit(0x1ff), 0xff);



    assert.equal(w.c30exit(0xffffffff), 0xff);



    assert.equal(w.c30clr(), 0);



    assert.equal(w.c30store(1.0), 0);



    assert.equal(w.c30store(0.0), 1);



    assert.equal(w.c30store(Number.NaN), 1);



    assert.equal(w.c30store(Infinity), 1);



    assert.equal(w.c30recv(0) >>> 0, 0x26614);



    assert.equal(w.c30recv(1) >>> 0, 0x26615);



    assert.equal(w.c30recv(0xffffffff) >>> 0, 0x26613);



    assert.equal(w.c30recv(0x80000000) >>> 0, (0x80000000 + 0x26614) >>> 0);



    assert.equal(w.c30stateOfs(), 8);



    assert.equal(w.c30stOther(), 0);



    assert.equal(w.c30stMenu(), 1);



    assert.equal(w.c30stGame(), 2);



    assert.equal(w.c304b284Ofs(), 0x4b284);



    assert.equal(w.c304b285Ofs(), 0x4b285);



    assert.equal(w.c30recvOfs(), 0x2a324);



    assert.equal(w.c30valOfs(), 0x2a334);



    assert.equal(w.c30stepOfs(), 0x2a338);



    assert.equal(w.c30valBits() >>> 0, 0x3f800000);



    assert.equal(w.c30stepBits() >>> 0, 0x3ba3d70a);



    assert.equal(w.c30tgtVa() >>> 0, 0x00baa454);



    assert.equal(w.c30gameVa() >>> 0, 0x00c71678);



    assert.equal(w.c30menuVa() >>> 0, 0x00c72a20);



    assert.equal(w.c30freeSz(), 0xf930);



    assert.equal(w.c30menuClr(), 0);



    assert.equal(w.c30ofs429170(), 0x26614);



    assert.equal(w.c30h6fa0c0() >>> 0, 0x006fa0c0);



    assert.equal(w.c30h92e430() >>> 0, 0x0092e430);



    assert.equal(w.c30h429170() >>> 0, 0x00429170);



    assert.equal(w.c30h986f30() >>> 0, 0x00986f30);



    assert.equal(w.c30hAef15c() >>> 0, 0x00aef15c);



    assert.equal(w.c30epilog() >>> 0, 0x0040e910);



    assert.equal(w.c30mgrVa() >>> 0, 0x00c7169c);



    assert.equal(w.c30va() >>> 0, 0x00959670);



    assert.equal(w.c30int3() >>> 0, 0x0095971c);



    assert.equal(w.c30bytes(), 0xac);



    assert.equal(w.c30trap(), 0x688);



    assert.equal(w.c30sites(), 3);



    assert.equal(w.c30site0() >>> 0, 0x00954d85);



    assert.equal(w.c30site1() >>> 0, 0x00959792);



    assert.equal(w.c30site2() >>> 0, 0x00959da5);



    assert.equal(w.c30next() >>> 0, 0x0095e7c0);







    /* ---------------- ABI v31: FUN_0095e7c0 Cutscene::Show ---------------- */



    assert.equal(w.c31range(0), 1);



    assert.equal(w.c31range(0x1a), 1);



    assert.equal(w.c31range(0x1b), 0);



    assert.equal(w.c31range(0xffffffff), 0);



    assert.equal(w.c31unload(0), 0);



    assert.equal(w.c31unload(1), 1);



    assert.equal(w.c31nz(0), 0);



    assert.equal(w.c31nz(1), 1);



    assert.equal(w.c31nz(0x100), 1);



    assert.equal(w.c31body(0), 0);



    assert.equal(w.c31body(1), 1);



    assert.equal(w.c31body(0x1b), 0);



    assert.equal(w.c31entry(0) >>> 0, 4);



    assert.equal(w.c31entry(1) >>> 0, 0x50);



    assert.equal(w.c31entry(0xffffffff) >>> 0, 0xffffffb8);



    assert.equal(w.c31qgt1(0, 0), 0);



    assert.equal(w.c31qgt1(0, 4), 0);



    assert.equal(w.c31qgt1(0, 8), 1);



    assert.equal(w.c31qgt1(4, 0), 1);



    assert.equal(w.c31sso(0), 1);



    assert.equal(w.c31sso(0xf), 1);



    assert.equal(w.c31sso(0x10), 0);



    assert.equal(w.c31sso(0xffffffff), 0);



    assert.equal(w.c31id2(2), 1);



    assert.equal(w.c31id2(0), 0);



    assert.equal(w.c31gPres(0), 0);



    assert.equal(w.c31gPres(1), 1);



    assert.equal(w.c31g1bb88(0, 1), 0);



    assert.equal(w.c31g1bb88(1, 0), 0);



    assert.equal(w.c31g1bb88(1, 1), 1);



    assert.equal(w.c31e5(0), 1);



    assert.equal(w.c31e5(1), 0);



    assert.equal(w.c31e5(0x100), 1);



    assert.equal(w.c31e5(0xffffffff), 0);



    assert.equal(w.c31vec(0, 0), 0);



    assert.equal(w.c31vec(0, 8), 2);



    assert.equal(w.c31vloop(0, 0), 0);



    assert.equal(w.c31vloop(0, 4), 1);



    assert.equal(w.c31idMax(), 0x1a);



    assert.equal(w.c31entCnt(), 0x1b);



    assert.equal(w.c31stride(), 0x4c);



    assert.equal(w.c31entOfs(), 4);



    assert.equal(w.c31stOfs(), 0);



    assert.equal(w.c31queued(), 0x808);



    assert.equal(w.c31ssoCap(), 0x10);



    assert.equal(w.c31idSpec(), 2);



    assert.equal(w.c31e5Ofs(), 0xe5);



    assert.equal(w.c31vbOfs(), 0xb8);



    assert.equal(w.c31veOfs(), 0xbc);



    assert.equal(w.c311bb88Ofs(), 0x1bb88);



    assert.equal(w.c31qBegin(), 0x4b3d8);



    assert.equal(w.c31qEnd(), 0x4b3dc);



    assert.equal(w.c31qHelp() >>> 0, 0x0095ead0);



    assert.equal(w.c31recvOfs(), 0x20dd0);



    assert.equal(w.c31argOfs(), 0x2161c);



    assert.equal(w.c31musIdx(), 0x29fbc);



    assert.equal(w.c31musStr(), 0x184);



    assert.equal(w.c31musVol(), 0x2a138);



    assert.equal(w.c31musRateOfs(), 0x2a13c);



    assert.equal(w.c31musRate() >>> 0, 0x3da3d70a);



    assert.equal(w.c31mus2a2cc(), 0x2a2cc);



    assert.equal(w.c31828(), 0x828);



    assert.equal(w.c31838(), 0x838);



    assert.equal(w.c31838v() >>> 0, 0xffffffff);



    assert.equal(w.c31stAfter(), 1);



    assert.equal(w.c31mgrVa() >>> 0, 0x00c7169c);



    assert.equal(w.c31gameVa() >>> 0, 0x00c71678);



    assert.equal(w.c31h960840() >>> 0, 0x00960840);



    assert.equal(w.c31h40e910() >>> 0, 0x0040e910);



    assert.equal(w.c31hA112c0() >>> 0, 0x00a112c0);



    assert.equal(w.c31h95ead0() >>> 0, 0x0095ead0);



    assert.equal(w.c31h91c7e0() >>> 0, 0x0091c7e0);



    assert.equal(w.c31h8fd750() >>> 0, 0x008fd750);



    assert.equal(w.c31h4239b0() >>> 0, 0x004239b0);



    assert.equal(w.c31h6eef60() >>> 0, 0x006eef60);



    assert.equal(w.c31va() >>> 0, 0x0095e7c0);



    assert.equal(w.c31ret() >>> 0, 0x0095eaa9);



    assert.equal(w.c31oob() >>> 0, 0x0095eac2);



    assert.equal(w.c31int3() >>> 0, 0x0095eac5);



    assert.equal(w.c31bytes(), 0x305);



    assert.equal(w.c31trap(), 0x800);



    assert.equal(w.c31sites(), 1);



    assert.equal(w.c31site() >>> 0, 0x00954d96);



    assert.equal(w.c31next() >>> 0, 0x00921ce0);



    assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);







    assert.equal(w.c32count(0, 0), 0);



    assert.equal(w.c32count(0, 4), 1);



    assert.equal(w.c32log(0, 0), 1);



    assert.equal(w.c32log(0, 4), 0);



    assert.equal(w.c32map(0, 0x4f), 1);



    assert.equal(w.c32map(0, 0x50), 0);



    assert.equal(w.c32map(0, 0xffffffff), 1);



    assert.equal(w.c32map(0x100, 0x4f), 1);



    assert.equal(w.c32found(1, 2), 1);



    assert.equal(w.c32found(2, 2), 0);



    assert.equal(w.c32strncmp(0), 1);



    assert.equal(w.c32strncmp(1), 0);



    assert.equal(w.c32sso(0xf), 1);



    assert.equal(w.c32sso(0x10), 0);



    assert.equal(w.c32sso(0xffffffff), 0);



    assert.equal(w.c32sprite(1) >>> 0, 0x18);



    assert.equal(w.c32sprite(0xffffffff) >>> 0, 0xffffffe8);



    assert.equal(w.c32dogma(0), 0);



    assert.equal(w.c32dogma(1), 1);



    assert.equal(w.c32dogma(0x100), 0);



    assert.equal(w.c32dogma(0x1ff), 1);



    assert.equal(w.c32col(0), 1);



    assert.equal(w.c32col(1), 0);



    assert.equal(w.c324b1(0), 1);



    assert.equal(w.c324b1(0x100), 1);



    assert.equal(w.c32bool(0x1ff), 0xff);



    assert.equal(w.c32mus(0), 0x60);



    assert.equal(w.c32mus(1), 0x41);



    assert.equal(w.c32mus(0x100), 0x60);



    assert.equal(w.c32stC(0xc), 1);



    assert.equal(w.c32stD(0xd), 1);



    assert.equal(w.c32owner(0), 0);



    assert.equal(w.c32owner(1), 1);



    assert.equal(w.c32mapKey(), 0x4f);



    assert.equal(w.c32ssoCap(), 0x10);



    assert.equal(w.c32stride(), 0x18);



    assert.equal(w.c32dogmaOfs(), 0x5e8);



    assert.equal(w.c32boolOfs(), 0x368);



    assert.equal(w.c32musN(), 0x60);



    assert.equal(w.c32musD(), 0x41);



    assert.equal(w.c32va() >>> 0, 0x00921ce0);



    assert.equal(w.c32ret() >>> 0, 0x0092330c);



    assert.equal(w.c32int3() >>> 0, 0x0092330f);



    assert.equal(w.c32bytes(), 0x1630);



    assert.equal(w.c32trap(), 0x800);



    assert.equal(w.c32sites(), 1);



    assert.equal(w.c32site() >>> 0, 0x00954dd0);



    assert.equal(w.c32sib() >>> 0, 0x00923320);



    assert.equal(w.c32next() >>> 0, 0x009be080);

    assert.equal(

      WebAssembly.Module.imports(new WebAssembly.Module(readFileSync(wasmPath))).length,

      0,

    );



    assert.equal(w.c32beginOfs(), 0x1baa8);



    assert.equal(w.c32endOfs(), 0x1baac);



    assert.equal(w.c32logLvl(), 0x10);



    assert.equal(w.c32logMsg() >>> 0, 0x00b7e6bc);



    assert.equal(w.c32path() >>> 0, 0x00b79fa0);



    assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);







    let seed32 = 0x921ce0;



    const next32 = () => {



      seed32 = (Math.imul(seed32, 1664525) + 1013904223) >>> 0;



      return seed32;



    };



    for (let k = 0; k < 256; k++) {



      const bgn = next32();



      const end = next32();



      const isnil = next32();



      const key = next32();



      const node = next32();



      const cap = next32();



      const idx = next32();



      const fl = next32();



      const st = next32();



      assert.equal(w.c32count(bgn >>> 0, end >>> 0) | 0, nightmare921ce0PlayersCount(bgn, end) | 0, `921ce0 rnd count ${k}`);



      assert.equal(w.c32log(bgn >>> 0, end >>> 0), nightmare921ce0PlayersLogNeeded(bgn, end) ? 1 : 0, `921ce0 rnd log ${k}`);



      assert.equal(w.c32map(isnil >>> 0, key >>> 0), nightmare921ce0MapPresent(isnil, key) ? 1 : 0, `921ce0 rnd map ${k}`);



      assert.equal(w.c32found(node >>> 0, end >>> 0), nightmare921ce0MapFound(node, end) ? 1 : 0, `921ce0 rnd found ${k}`);



      assert.equal(w.c32sso(cap >>> 0), nightmare921ce0SsoInline(cap) ? 1 : 0, `921ce0 rnd sso ${k}`);



      assert.equal(w.c32sprite(idx >>> 0) >>> 0, nightmare921ce0SpriteOfs(idx), `921ce0 rnd sprite ${k}`);



      assert.equal(w.c32dogma(fl >>> 0), nightmare921ce0Dogma(fl) ? 1 : 0, `921ce0 rnd dogma ${k}`);



      assert.equal(w.c32col(fl >>> 0), nightmare921ce0CollectiblePathNeeded(fl) ? 1 : 0, `921ce0 rnd col ${k}`);



      assert.equal(w.c324b1(fl >>> 0), nightmare921ce0Flag4b1Continue(fl) ? 1 : 0, `921ce0 rnd 4b1 ${k}`);



      assert.equal(w.c32bool(fl >>> 0), nightmare921ce0BoolArg(fl), `921ce0 rnd bool ${k}`);



      assert.equal(w.c32mus(fl >>> 0), nightmare921ce0MusicId(fl), `921ce0 rnd mus ${k}`);



      assert.equal(w.c32stC(st >>> 0), nightmare921ce0StageIsC(st) ? 1 : 0, `921ce0 rnd stC ${k}`);



      assert.equal(w.c32stD(st >>> 0), nightmare921ce0StageIsD(st) ? 1 : 0, `921ce0 rnd stD ${k}`);



    }











    /* ---------------- ABI v33: FUN_009be080 FirstCollectibleOwner ---------------- */

    assert.equal(w.c33twin(0, 1, 0x80000000), 0);

    assert.equal(w.c33twin(1, 0, 0x80000000), 0);

    assert.equal(w.c33twin(1, 1, 0), 0);

    assert.equal(w.c33twin(1, 1, 0x80000000), 1);

    assert.equal(w.c33twin(0x100, 1, 0x80000000), 0);

    assert.equal(w.c33empty(0, 0), 1);

    assert.equal(w.c33empty(0, 4), 0);

    assert.equal(w.c33slot(0), 1);

    assert.equal(w.c33slot(1), 0);

    assert.equal(w.c33hit(0), 0);

    assert.equal(w.c33hit(1), 1);

    assert.equal(w.c33hit(0x100), 0);

    assert.equal(w.c33twinP(0), 0);

    assert.equal(w.c33twinP(1), 1);

    assert.equal(w.c33need(0, 1), 0);

    assert.equal(w.c33need(1, 0), 0);

    assert.equal(w.c33need(1, 1), 1);

    assert.equal(w.c33walk(0) >>> 0, 4);

    assert.equal(w.c33walk(0xffffffff) >>> 0, 3);

    assert.equal(w.c33cont(4, 4), 0);

    assert.equal(w.c33cont(4, 8), 1);

    assert.equal(w.c33rPlayer(0x12345678) >>> 0, 0x12345678);

    assert.equal(w.c33rTwin(0x9abcdef0) >>> 0, 0x9abcdef0);

    assert.equal(w.c33rNone() >>> 0, 0);

    assert.equal(w.c33itemOfs(), 0x2a404);

    assert.equal(w.c33gcol() >>> 0, 0x0072fd10);

    assert.equal(w.c33hascol() >>> 0, 0x007706e0);

    assert.equal(w.c33flagsOfs(), 0xb8);

    assert.equal(w.c33twinBit() >>> 0, 0x80000000);

    assert.equal(w.c33lBegin(), 0);

    assert.equal(w.c33lEnd(), 4);

    assert.equal(w.c33stride(), 4);

    assert.equal(w.c33slotOfs(), 0x2c);

    assert.equal(w.c33twinOfs(), 0x1e6c);

    assert.equal(w.c33lazOfs(), 0x10);

    assert.equal(w.c33mgr() >>> 0, 0x00c7169c);

    assert.equal(w.c33va() >>> 0, 0x009be080);

    assert.equal(w.c33ret() >>> 0, 0x009be137);

    assert.equal(w.c33firstRet() >>> 0, 0x009be11d);

    assert.equal(w.c33int3() >>> 0, 0x009be13a);

    assert.equal(w.c33bytes(), 0xb8);

    assert.equal(w.c33sites(), 175);

    assert.equal(w.c33site() >>> 0, 0x009220a8);

    assert.equal(w.c33site2() >>> 0, 0x0092225f);

    assert.equal(w.c33nextVa() >>> 0, 0x009be140);





    let seed33 = 0x9be080;



    const next33 = () => {



      seed33 = (Math.imul(seed33, 1664525) + 1013904223) >>> 0;



      return seed33;



    };



    for (let k = 0; k < 256; k++) {



      const laz = next33();



      const item = next33();



      const fl = next33();



      const bgn = next33();



      const end = next33();



      const f2c = next33();



      const al = next33();



      const twin = next33();



      const it = next33();



      const lz = laz >>> 0;



      const ip = item >>> 0;



      const fb = fl >>> 0;



      const egg = end >>> 0;



      assert.equal(



        w.c33twin(lz, ip, fb),



        fco9be080TwinWalkFlag(lz, ip, fb) ? 1 : 0,



        `9be080 rnd twin ${k}`,



      );



      assert.equal(



        w.c33empty(bgn >>> 0, egg),



        fco9be080ListEmpty(bgn, egg) ? 1 : 0,



        `9be080 rnd empty ${k}`,



      );



      assert.equal(



        w.c33slot(f2c >>> 0),



        fco9be080SlotCheckable(f2c) ? 1 : 0,



        `9be080 rnd slot ${k}`,



      );



      assert.equal(



        w.c33hit(al >>> 0),



        fco9be080HasCollectibleHit(al) ? 1 : 0,



        `9be080 rnd hit ${k}`,



      );



      assert.equal(



        w.c33twinP(twin >>> 0),



        fco9be080TwinPresent(twin) ? 1 : 0,



        `9be080 rnd twinP ${k}`,



      );



      assert.equal(



        w.c33need(lz, twin >>> 0),



        fco9be080TwinCheckNeeded(lz, twin) ? 1 : 0,



        `9be080 rnd need ${k}`,



      );



      assert.equal(



        w.c33walk(it >>> 0) >>> 0,



        fco9be080WalkNext(it),



        `9be080 rnd walk ${k}`,



      );



      assert.equal(



        w.c33cont((it + 4) >>> 0, egg),



        fco9be080WalkContinue((it + 4) >>> 0, egg) ? 1 : 0,



        `9be080 rnd cont ${k}`,



      );



      assert.equal(



        w.c33rPlayer(ip) >>> 0,



        fco9be080ResultPlayer(ip),



        `9be080 rnd rPlayer ${k}`,



      );



      assert.equal(



        w.c33rTwin(twin >>> 0) >>> 0,



        fco9be080ResultTwin(twin),



        `9be080 rnd rTwin ${k}`,



      );



    }









    let seed31 = 0x95e7c0;



    const next31 = () => {



      seed31 = (Math.imul(seed31, 1664525) + 1013904223) >>> 0;



      return seed31;



    };



    for (let k = 0; k < 256; k++) {



      const id = next31();



      const st = next31();



      const gp = next31();



      const d1 = next31();



      const fl = next31();



      const bgn = next31();



      const end = next31();



      const cap = next31();



      assert.equal(



        w.c31range(id >>> 0),



        cutscene95e7c0IdInRange(id) ? 1 : 0,



        `95e7c0 rnd range ${k}`,



      );



      assert.equal(



        w.c31unload(st >>> 0),



        cutscene95e7c0UnloadNeeded(st) ? 1 : 0,



        `95e7c0 rnd unload ${k}`,



      );



      assert.equal(



        w.c31nz(id >>> 0),



        cutscene95e7c0IdNonzero(id) ? 1 : 0,



        `95e7c0 rnd nz ${k}`,



      );



      assert.equal(



        w.c31body(id >>> 0),



        cutscene95e7c0ShowBodyNeeded(id) ? 1 : 0,



        `95e7c0 rnd body ${k}`,



      );



      assert.equal(



        w.c31entry(id >>> 0) >>> 0,



        cutscene95e7c0EntryOfs(id),



        `95e7c0 rnd entry ${k}`,



      );



      assert.equal(



        w.c31qgt1(bgn >>> 0, end >>> 0),



        cutscene95e7c0QueueGt1(bgn, end) ? 1 : 0,



        `95e7c0 rnd qgt1 ${k}`,



      );



      assert.equal(



        w.c31sso(cap >>> 0),



        cutscene95e7c0SsoInline(cap) ? 1 : 0,



        `95e7c0 rnd sso ${k}`,



      );



      assert.equal(



        w.c31id2(id >>> 0),



        cutscene95e7c0IdIs2(id) ? 1 : 0,



        `95e7c0 rnd id2 ${k}`,



      );



      assert.equal(



        w.c31gPres(gp >>> 0),



        cutscene95e7c0GamePresent(gp) ? 1 : 0,



        `95e7c0 rnd gPres ${k}`,



      );



      assert.equal(



        w.c31g1bb88(gp >>> 0, d1 >>> 0),



        cutscene95e7c0Game1bb88Needed(gp, d1) ? 1 : 0,



        `95e7c0 rnd 1bb88 ${k}`,



      );



      assert.equal(



        w.c31e5(fl >>> 0),



        cutscene95e7c0FlagE5Continue(fl) ? 1 : 0,



        `95e7c0 rnd e5 ${k}`,



      );



      assert.equal(



        w.c31vec(bgn >>> 0, end >>> 0) | 0,



        cutscene95e7c0VecCount(bgn, end) | 0,



        `95e7c0 rnd vec ${k}`,



      );



      assert.equal(



        w.c31vloop(bgn >>> 0, end >>> 0),



        cutscene95e7c0VecLoopNeeded(bgn, end) ? 1 : 0,



        `95e7c0 rnd vloop ${k}`,



      );



    }







    let seed30 = 0x959670;



    const next30 = () => {



      seed30 = (Math.imul(seed30, 1664525) + 1013904223) >>> 0;



      return seed30;



    };



    for (let k = 0; k < 256; k++) {



      const st = next30() | 0;



      const gp = next30();



      const mp = next30();



      const fl = next30();



      const bits = next30();



      const fbuf = new ArrayBuffer(4);



      new Uint32Array(fbuf)[0] = bits;



      const fv = new Float32Array(fbuf)[0];



      assert.equal(



        w.c30sid(st),



        manager959670StateId(st),



        `959670 rnd sid ${k}`,



      );



      assert.equal(



        w.c30s1(st),



        manager959670State1Needed(st) ? 1 : 0,



        `959670 rnd s1 ${k}`,



      );



      assert.equal(



        w.c30s2(st),



        manager959670State2Needed(st) ? 1 : 0,



        `959670 rnd s2 ${k}`,



      );



      assert.equal(



        w.c30gPres(gp >>> 0),



        manager959670GamePresent(gp) ? 1 : 0,



        `959670 rnd gPres ${k}`,



      );



      assert.equal(



        w.c30gBody(st, gp >>> 0),



        manager959670GameBodyNeeded(st, gp) ? 1 : 0,



        `959670 rnd gBody ${k}`,



      );



      assert.equal(



        w.c30mPres(mp >>> 0),



        manager959670MenuPresent(mp) ? 1 : 0,



        `959670 rnd mPres ${k}`,



      );



      assert.equal(



        w.c30mBody(st, mp >>> 0),



        manager959670MenuBodyNeeded(st, mp) ? 1 : 0,



        `959670 rnd mBody ${k}`,



      );



      assert.equal(



        w.c30exit(fl >>> 0),



        manager959670ExitSaveArg(fl),



        `959670 rnd exit ${k}`,



      );



      assert.equal(



        w.c30store(fv),



        manager959670ValueStoreNeeded(fv) ? 1 : 0,



        `959670 rnd store ${k}`,



      );



      assert.equal(



        w.c30recv(gp >>> 0) >>> 0,



        manager959670Host429170Recv(gp),



        `959670 rnd recv ${k}`,



      );



    }



  }




  /* ---------------- ABI v35: address-stable 0x009be2a0 RNG**-variant ---- */
  assert.equal(w.c35count(0, 0), 0);
  assert.equal(w.c35count(4, 0), 1);
  assert.equal(w.c35count(0, 4), -1);
  assert.equal(w.c35mask(0), 0);
  assert.equal(w.c35mask(0x7fff), 0x7fff);
  assert.equal(w.c35mask(0x8000), 0);
  assert.equal(w.c35mask(0xffffffff), 0x7fff);
  assert.equal(w.c35oor(0, 4), 0);
  assert.equal(w.c35oor(3, 4), 0);
  assert.equal(w.c35oor(4, 4), 1);
  assert.equal(w.c35oor(0xffffffff, 4), 0); // signed -1 < 4, jge not taken
  assert.equal(w.c35oor(0x80000000, 0), 0); // signed jge: -2^31 < 0
  assert.equal(w.c35slot(0x1000, 2) >>> 0, 0x1008);
  assert.equal(w.c35slot(0xffffffff, 1) >>> 0, 3);
  assert.equal(w.c35flag(0, 1, 0x80000000), 0);
  assert.equal(w.c35flag(0x100, 1, 0x80000000), 0);
  assert.equal(w.c35flag(1, 0, 0x80000000), 0);
  assert.equal(w.c35flag(1, 1, 0), 0);
  assert.equal(w.c35flag(1, 1, 0x80000000), 1);
  assert.equal(w.c35empty(0, 0), 1);
  assert.equal(w.c35empty(0, 4), 0);
  assert.equal(w.c35empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c35chk(0), 1);
  assert.equal(w.c35chk(0x10000000), 0);
  assert.equal(w.c35hit(0), 0);
  assert.equal(w.c35hit(0x100), 0);
  assert.equal(w.c35hit(0x1ff), 1);
  assert.equal(w.c35need(0, 1), 0);
  assert.equal(w.c35need(0x100, 1), 1);
  assert.equal(w.c35need(1, 0), 0);
  assert.equal(w.c35need(1, 1), 1);
  assert.equal(w.c35walk(0) >>> 0, 4);
  assert.equal(w.c35walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c35cont(4, 4), 0);
  assert.equal(w.c35cont(4, 8), 1);
  assert.equal(w.c35out(0), 0);
  assert.equal(w.c35out(1), 1);
  assert.equal(w.c35out(0x80000000), 1);
  assert.equal(w.c35neg(0), 0);
  assert.equal(w.c35neg(1), 0);
  assert.equal(w.c35neg(-1), 1);
  assert.equal(w.c35neg(0x80000000), 1);
  assert.equal(w.c35neg(0x7fffffff), 0);
  assert.equal(w.c35ccount(0x40, 0), 4);
  assert.equal(w.c35ccount(0, 0x40), -4);
  assert.equal(w.c35oob(2, 2), 1);
  assert.equal(w.c35oob(1, 2), 0);
  assert.equal(w.c35oob(-1, 2), 0);
  assert.equal(w.c35log(-1, 2), 1);
  assert.equal(w.c35log(2, 2), 1);
  assert.equal(w.c35log(1, 2), 0);
  assert.equal(w.c35cm1(0) >>> 0, 0xffffffff);
  assert.equal(w.c35cm1(5), 4);
  assert.equal(w.c35clamp(9, 4), 4);
  assert.equal(w.c35clamp(3, 4), 3);
  assert.equal(w.c35clamp(0x80000000, 4), 4);
  assert.equal(w.c35clamp(0, 4), 0);
  assert.equal(w.c35cptr(0x1000, 2) >>> 0, 0x1020);
  assert.equal(w.c35cptr(0xfffffff0, 1) >>> 0, 0);
  assert.equal(w.c35twinR(0x9abcdef0) >>> 0, 0x9abcdef0);
  assert.equal(w.c35none() >>> 0, 0);
  assert.equal(w.c35rPlayer(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c35zero() >>> 0, 0);
  assert.equal(w.c35pBegin(), 0x2a410);
  assert.equal(w.c35pEnd(), 0x2a414);
  assert.equal(w.c35lBegin(), 0);
  assert.equal(w.c35lEnd(), 4);
  assert.equal(w.c35stride(), 4);
  assert.equal(w.c35slotOfs(), 0x2c);
  assert.equal(w.c35flagsOfs(), 0xb8);
  assert.equal(w.c35twinBit() >>> 0, 0x80000000);
  assert.equal(w.c35twinOfs(), 0x1e6c);
  assert.equal(w.c35cBegin(), 0x177c);
  assert.equal(w.c35cEnd(), 0x1780);
  assert.equal(w.c35cStride(), 0x10);
  assert.equal(w.c35idMask(), 0x7fff);
  assert.equal(w.c35mgr() >>> 0, 0x00c7169c);
  assert.equal(w.c35game() >>> 0, 0x00c71678);
  assert.equal(w.c35recv(), 0x1baa8);
  assert.equal(w.c35hascol() >>> 0, 0x00771550);
  assert.equal(w.c35twinGet() >>> 0, 0x0065cf80);
  assert.equal(w.c35hostLog() >>> 0, 0x00a112c0);
  assert.equal(w.c35oobMsg() >>> 0, 0x00b64a88);
  assert.equal(w.c35logLvl(), 0x10);
  assert.equal(w.c35va() >>> 0, 0x009be2a0);
  assert.equal(w.c35ret() >>> 0, 0x009be3d8);
  assert.equal(w.c35firstRet() >>> 0, 0x009be356);
  assert.equal(w.c35int3() >>> 0, 0x009be3db);
  assert.equal(w.c35bytes(), 0x13b);
  assert.equal(w.c35sites(), 1);
  assert.equal(w.c35site() >>> 0, 0x006eca9d);
  assert.equal(w.c35nextVa() >>> 0, 0x009be3e0);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  let seed35 = 0x9be2a0;
  const next35 = () => {
    seed35 = (Math.imul(seed35, 1664525) + 1013904223) >>> 0;
    return seed35;
  };
  for (let k = 0; k < 256; k++) {
    const bgn = next35();
    const end = next35();
    const id = next35();
    const msk = next35();
    const cnt = next35();
    const a3 = next35();
    const pp = next35();
    const fb = next35();
    const al = next35();
    const tf = next35();
    const tw = next35();
    const it = next35();
    const out = next35();
    const cb = next35();
    const ce = next35();
    const i32id = id | 0;
    const i32cnt = cnt | 0;
    assert.equal(w.c35count(end >>> 0, bgn >>> 0) | 0, a9be2a0PlayersCount(end, bgn) | 0, `9be2a0 rnd count ${k}`);
    assert.equal(w.c35mask(id >>> 0) >>> 0, a9be2a0IdMask15(id), `9be2a0 rnd mask ${k}`);
    assert.equal(w.c35oor(msk >>> 0, cnt >>> 0), a9be2a0DirectIndexOor(msk, cnt) ? 1 : 0, `9be2a0 rnd oor ${k}`);
    assert.equal(w.c35slot(bgn >>> 0, msk >>> 0) >>> 0, a9be2a0DirectPlayerPtr(bgn, msk), `9be2a0 rnd slot ${k}`);
    assert.equal(w.c35flag(a3 >>> 0, pp >>> 0, fb >>> 0), a9be2a0TwinFlag(a3, pp, fb) ? 1 : 0, `9be2a0 rnd flag ${k}`);
    assert.equal(w.c35empty(bgn >>> 0, end >>> 0), a9be2a0ListEmpty(bgn, end) ? 1 : 0, `9be2a0 rnd empty ${k}`);
    assert.equal(w.c35chk(pp >>> 0), a9be2a0SlotCheckable(pp) ? 1 : 0, `9be2a0 rnd chk ${k}`);
    assert.equal(w.c35hit(al >>> 0), a9be2a0HasCollectibleHit(al) ? 1 : 0, `9be2a0 rnd hit ${k}`);
    assert.equal(w.c35need(tf >>> 0, tw >>> 0), a9be2a0TwinCheckNeeded(tf, tw) ? 1 : 0, `9be2a0 rnd need ${k}`);
    assert.equal(w.c35walk(it >>> 0) >>> 0, a9be2a0WalkNext(it), `9be2a0 rnd walk ${k}`);
    assert.equal(w.c35cont((it + 4) >>> 0, end >>> 0), a9be2a0WalkContinue((it + 4) >>> 0, end) ? 1 : 0, `9be2a0 rnd cont ${k}`);
    assert.equal(w.c35out(out >>> 0), a9be2a0OutPresent(out) ? 1 : 0, `9be2a0 rnd out ${k}`);
    assert.equal(w.c35neg(id >>> 0), a9be2a0IdNegative(i32id) ? 1 : 0, `9be2a0 rnd neg ${k}`);
    assert.equal(w.c35ccount(ce >>> 0, cb >>> 0) | 0, a9be2a0CollectCount(ce, cb) | 0, `9be2a0 rnd ccount ${k}`);
    assert.equal(w.c35oob(id >>> 0, cnt >>> 0), a9be2a0IdOob(i32id, i32cnt) ? 1 : 0, `9be2a0 rnd oob ${k}`);
    assert.equal(w.c35log(id >>> 0, cnt >>> 0), a9be2a0LogNeeded(i32id, i32cnt) ? 1 : 0, `9be2a0 rnd log ${k}`);
    assert.equal(w.c35cm1(cnt >>> 0) >>> 0, a9be2a0CollectCountMinus1(i32cnt), `9be2a0 rnd cm1 ${k}`);
    assert.equal(w.c35clamp(id >>> 0, (cnt >>> 0) - 1) >>> 0, a9be2a0CollectIndexClamp(id, (cnt >>> 0) - 1), `9be2a0 rnd clamp ${k}`);
    assert.equal(w.c35cptr(cb >>> 0, msk >>> 0) >>> 0, a9be2a0CollectEntryPtr(cb, msk), `9be2a0 rnd cptr ${k}`);
    assert.equal(w.c35twinR(tw >>> 0) >>> 0, a9be2a0TwinResult(tw), `9be2a0 rnd twinR ${k}`);
    assert.equal(w.c35none() >>> 0, a9be2a0ResultNotFound(), `9be2a0 rnd none ${k}`);
    assert.equal(w.c35rPlayer(pp >>> 0) >>> 0, a9be2a0ResultPlayer(pp), `9be2a0 rnd rPlayer ${k}`);
    assert.equal(w.c35zero() >>> 0, a9be2a0StoreZeroValue(), `9be2a0 rnd zero ${k}`);
  }

  /* ---------------- ABI v36: PlayerManager::RandomTrinketOwner
     0x009be3e0 (exact ZHL 10 B).  v34 RCO walk + xorshift draw with the
     v35 leaf/vector; constants PE-verified on this unit ------------------ */
  assert.equal(w.c36empty(0, 0), 1);
  assert.equal(w.c36empty(0, 4), 0);
  assert.equal(w.c36empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c36chk(0), 1);
  assert.equal(w.c36chk(0x10000000), 0);
  assert.equal(w.c36hit(0), 0);
  assert.equal(w.c36hit(0x100), 0);
  assert.equal(w.c36hit(0x1ff), 1);
  assert.equal(w.c36hit(0xffffffff), 1);
  assert.equal(w.c36seed(0), 1);
  assert.equal(w.c36seed(1), 0);
  assert.equal(w.c36seed(0x80000000), 0);
  assert.equal(w.c36xs(0x12345678, 3, 5, 20) >>> 0, 0x1e294bb5);
  assert.equal(w.c36xs(0x13579bdf, 33, 5, 20) >>> 0, w.c36xs(0x13579bdf, 1, 5, 20) >>> 0); // cl masks 33 -> 1
  assert.equal(w.c36xs(0xffffffff, 3, 5, 20) >>> 0, 0xe0000e00);
  assert.equal(w.c36f64(0), 0);
  assert.equal(w.c36f64(1), 1);
  assert.equal(w.c36f64(0xffffffff), 4294967295);
  assert.equal(w.c36nf(0), 0);
  assert.equal(w.c36nf(1), Math.fround(2.3283061589829401e-10)); // scale 0x2f7ffffe
  assert.equal(w.c36nf(0x80000000), 0.4999999403953552);
  assert.equal(w.c36nf(0xffffffff), 0.9999998807907104);
  assert.equal(w.c36buy(2, 1), 1);
  assert.equal(w.c36buy(1, 2), 0);
  assert.equal(w.c36buy(1, 1), 0);
  assert.equal(w.c36buy(Number.NaN, 1), 0);
  assert.equal(w.c36buy(1, Number.NaN), 0);
  assert.equal(w.c36walk(0) >>> 0, 4);
  assert.equal(w.c36walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c36cont(4, 4), 0);
  assert.equal(w.c36cont(4, 8), 1);
  assert.equal(w.c36out(0), 0);
  assert.equal(w.c36out(1), 1);
  assert.equal(w.c36out(0x80000000), 1);
  assert.equal(w.c36win(0), 0);
  assert.equal(w.c36win(0x80000000), 1);
  assert.equal(w.c36neg(0), 0);
  assert.equal(w.c36neg(1), 0);
  assert.equal(w.c36neg(-1), 1);
  assert.equal(w.c36neg(0x80000000), 1);
  assert.equal(w.c36neg(0x7fffffff), 0);
  assert.equal(w.c36ccount(0x40, 0), 4);
  assert.equal(w.c36ccount(0, 0x40), -4);
  assert.equal(w.c36oob(2, 2), 1);
  assert.equal(w.c36oob(1, 2), 0);
  assert.equal(w.c36oob(-1, 2), 0);
  assert.equal(w.c36log(-1, 2), 1);
  assert.equal(w.c36log(2, 2), 1);
  assert.equal(w.c36log(1, 2), 0);
  assert.equal(w.c36cm1(0) >>> 0, 0xffffffff);
  assert.equal(w.c36cm1(5), 4);
  assert.equal(w.c36clamp(9, 4), 4);
  assert.equal(w.c36clamp(3, 4), 3);
  assert.equal(w.c36clamp(0x80000000, 4), 4);
  assert.equal(w.c36clamp(0, 4), 0);
  assert.equal(w.c36clamp(0xffffffff, 4), 4); // v36: id<0 clamps (no v34 fixed-out)
  assert.equal(w.c36cptr(0x1000, 2) >>> 0, 0x1020);
  assert.equal(w.c36cptr(0xfffffff0, 1) >>> 0, 0);
  assert.equal(w.c36rPlayer(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c36zero() >>> 0, 0);
  assert.equal(w.c36lBegin(), 0);
  assert.equal(w.c36lEnd(), 4);
  assert.equal(w.c36stride(), 4);
  assert.equal(w.c36slotOfs(), 0x2c);
  assert.equal(w.c36cBegin(), 0x177c); // v35 vector, NOT v34's 0x1770
  assert.equal(w.c36cEnd(), 0x1780);
  assert.equal(w.c36cStride(), 0x10);
  assert.equal(w.c36seedMsg() >>> 0, 0x00b6bf54);
  assert.equal(w.c36oobMsg() >>> 0, 0x00b64a88);
  assert.equal(w.c36logLvl(), 0x10);
  assert.equal(w.c36trap() >>> 0, 0x009be451);
  assert.equal(w.c36hascol() >>> 0, 0x00771550); // v35 leaf, NOT v34's 0x7706e0
  assert.equal(w.c36hostLog() >>> 0, 0x00a112c0);
  assert.equal(w.c36game() >>> 0, 0x00c71678);
  assert.equal(w.c36recv(), 0x1baa8);
  assert.equal(w.c36rngTab() >>> 0, 0x00b1f5d0);
  assert.equal(w.c36s1(), 3);
  assert.equal(w.c36s2(), 5);
  assert.equal(w.c36s3(), 20);
  assert.equal(w.c36bestBits() >>> 0, 0xbf800000);
  assert.equal(w.c36scaleBits() >>> 0, 0x2f7ffffe); // PE-verified dword
  assert.equal(w.c36signCorr() >>> 0, 0x00bacb00);
  assert.equal(w.c36bestVal(), -1);
  assert.equal(w.c36scaleVal(), Math.fround(2.3283061589829401e-10));
  assert.equal(w.c36va() >>> 0, 0x009be3e0);
  assert.equal(w.c36ret() >>> 0, 0x009be52a);
  assert.equal(w.c36firstRet() >>> 0, 0x009be51b);
  assert.equal(w.c36int3() >>> 0, 0x009be52d);
  assert.equal(w.c36bytes(), 0x14d);
  assert.equal(w.c36sites(), 10);
  assert.equal(w.c36nextVa() >>> 0, 0x009be530);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v37: 0x009be530 RCO-family sibling pins (all PE-derived this
  // unit; byte-gate args driven WIDE — no pre-mask). ---
  assert.equal(w.c37empty(0, 0), 1);
  assert.equal(w.c37empty(0, 4), 0);
  assert.equal(w.c37empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c37chk(0), 1);
  assert.equal(w.c37chk(1), 0);
  assert.equal(w.c37chk(0x10000000), 0); // FULL dword == 0 gate
  assert.equal(w.c37f202c(0), 1);
  assert.equal(w.c37f202c(0x100), 1);    // low byte 0 -> clear (RAW, wide)
  assert.equal(w.c37f202c(0x1ff), 0);
  assert.equal(w.c37f202c(0xffffffff), 0);
  assert.equal(w.c37f20a9(0), 1);
  assert.equal(w.c37f20a9(0x100), 1);    // low byte 0 -> clear (RAW, wide)
  assert.equal(w.c37f20a9(0x1ff), 0);
  assert.equal(w.c37f20a9(0xffffffff), 0);
  assert.equal(w.c37charge(2), 0);       // SIGNED < 3 fails
  assert.equal(w.c37charge(3), 1);
  assert.equal(w.c37charge(0xffffffff), 0); // int32 -1 < 3 fails (SIGNED)
  assert.equal(w.c37charge(0x80000000), 0); // int32 -2^31 fails (SIGNED)
  assert.equal(w.c37charge(0x7fffffff), 1);
  assert.equal(w.c37seed(0), 1);
  assert.equal(w.c37seed(1), 0);
  assert.equal(w.c37seed(0x80000000), 0);
  assert.equal(w.c37xs(0x12345678, 3, 5, 20) >>> 0, 0x1e294bb5);
  assert.equal(w.c37xs(0x13579bdf, 33, 5, 20) >>> 0, w.c37xs(0x13579bdf, 1, 5, 20) >>> 0); // cl masks 33 -> 1
  assert.equal(w.c37xs(0xffffffff, 3, 5, 20) >>> 0, 0xe0000e00);
  assert.equal(w.c37f64(0), 0);
  assert.equal(w.c37f64(1), 1);
  assert.equal(w.c37f64(0xffffffff), 4294967295);
  assert.equal(w.c37nf(0), 0);
  assert.equal(w.c37nf(1), Math.fround(2.3283061589829401e-10));
  assert.equal(w.c37nf(0x80000000), 0.4999999403953552);
  assert.equal(w.c37nf(0xffffffff), 0.9999998807907104);
  assert.equal(w.c37buy(2, 1), 1);
  assert.equal(w.c37buy(1, 2), 0);
  assert.equal(w.c37buy(1, 1), 0);
  assert.equal(w.c37buy(Number.NaN, 1), 0);
  assert.equal(w.c37buy(1, Number.NaN), 0);
  assert.equal(w.c37walk(0), 4);
  assert.equal(w.c37walk(0xfffffffc), 0);
  assert.equal(w.c37walk(0xffffffff), 3);
  assert.equal(w.c37cont(4, 4), 0);
  assert.equal(w.c37cont(4, 8), 1);
  assert.equal(w.c37cont(0, 0xffffffff), 1);
  assert.equal(w.c37rPlayer(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c37rPlayer(0) >>> 0, 0);
  assert.equal(w.c37lBegin(), 0);
  assert.equal(w.c37lEnd(), 4);
  assert.equal(w.c37stride(), 4);
  assert.equal(w.c37slotOfs(), 0x2c);
  assert.equal(w.c37f202cOfs(), 0x202c);
  assert.equal(w.c37f20a9Ofs(), 0x20a9);
  assert.equal(w.c37chargeOfs(), 0x17e0);
  assert.equal(w.c37chargeMin(), 3);
  assert.equal(w.c37seedMsg() >>> 0, 0x00b6bf54);
  assert.equal(w.c37logLvl(), 0x10);
  assert.equal(w.c37trap() >>> 0, 0x009be5be);
  assert.equal(w.c37hostLog() >>> 0, 0x00a112c0);
  assert.equal(w.c37rngTab() >>> 0, 0x00b1f5d0);
  assert.equal(w.c37s1(), 3);
  assert.equal(w.c37s2(), 5);
  assert.equal(w.c37s3(), 20);
  assert.equal(w.c37bestBits() >>> 0, 0xbf800000);
  assert.equal(w.c37scaleBits() >>> 0, 0x2f7ffffe); // PE-verified dword
  assert.equal(w.c37signCorr() >>> 0, 0x00bacb00);
  assert.equal(w.c37bestVal(), -1);
  assert.equal(w.c37scaleVal(), Math.fround(2.3283061589829401e-10));
  assert.equal(w.c37va() >>> 0, 0x009be530);
  assert.equal(w.c37ret() >>> 0, 0x009be62d);
  assert.equal(w.c37firstRet() >>> 0, 0x009be62d);
  assert.equal(w.c37int3() >>> 0, 0x009be5be);
  assert.equal(w.c37bytes(), 0x8e);
  assert.equal(w.c37sites(), 7);
  assert.equal(w.c37nextVa() >>> 0, 0x009be630);

  // --- ABI v38: 0x009be630 slot-match sibling pins (all PE-derived this
  // unit; search body — NO xorshift/float/seed assert; byte gates driven
  // WIDE — no pre-mask). ---
  assert.equal(w.c38empty(0, 0), 1);
  assert.equal(w.c38empty(0, 4), 0);
  assert.equal(w.c38empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c38chk(0), 1);
  assert.equal(w.c38chk(1), 0);
  assert.equal(w.c38chk(0x10000000), 0); // FULL dword == 0 gate
  assert.equal(w.c38f20a9(0), 1);
  assert.equal(w.c38f20a9(0x100), 1);    // low byte 0 -> clear (RAW, wide)
  assert.equal(w.c38f20a9(0x1ff), 0);
  assert.equal(w.c38f20a9(0xffffffff), 0);
  assert.equal(w.c38match(0x12, 0x12), 1); // FULL dword equality
  assert.equal(w.c38match(0x12, 0x24), 0);
  assert.equal(w.c38match(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c38match(0x100, 0x1ff), 0);
  assert.equal(w.c38walk(0), 4);
  assert.equal(w.c38walk(0xfffffffc), 0);
  assert.equal(w.c38walk(0xffffffff), 3);
  assert.equal(w.c38cont(4, 4), 0);
  assert.equal(w.c38cont(4, 8), 1);
  assert.equal(w.c38cont(0, 0xffffffff), 1);
  assert.equal(w.c38notFound(), 0);       // xor eax,eax
  assert.equal(w.c38found(0x12345678) >>> 0, 0x12345678); // mov eax,edx
  assert.equal(w.c38found(0) >>> 0, 0);
  assert.equal(w.c38lBegin(), 0);
  assert.equal(w.c38lEnd(), 4);
  assert.equal(w.c38stride(), 4);
  assert.equal(w.c38slotOfs(), 0x2c);
  assert.equal(w.c38f20a9Ofs(), 0x20a9);
  assert.equal(w.c38slotValOfs(), 0x13c0);
  assert.equal(w.c38va() >>> 0, 0x009be630);
  assert.equal(w.c38ret() >>> 0, 0x009be66b);
  assert.equal(w.c38firstRet() >>> 0, 0x009be664);
  assert.equal(w.c38int3() >>> 0, 0x009be66e);
  assert.equal(w.c38bytes(), 0x3e);
  assert.equal(w.c38sites(), 23);
  assert.equal(w.c38nextVa() >>> 0, 0x009be670);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v39: 0x009be670 PURE slot-0x19 predicate pins (all PE-derived
  // this unit; empty list is TRUE 1 — inverse of v38's not-found 0; the
  // needle 0x19 is an IMMEDIATE, never an arg; byte gates driven WIDE).
  // ---
  assert.equal(w.c39empty(0, 0), 1);       // empty -> TRUE arm (mov al,1)
  assert.equal(w.c39empty(0, 4), 0);
  assert.equal(w.c39empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c39chk(0), 1);
  assert.equal(w.c39chk(1), 0);
  assert.equal(w.c39chk(0x10000000), 0);   // FULL dword == 0 gate
  assert.equal(w.c39f20a9(0), 1);
  assert.equal(w.c39f20a9(0x100), 1);      // low byte 0 -> clear (RAW, wide)
  assert.equal(w.c39f20a9(0x1ff), 0);
  assert.equal(w.c39f20a9(0xffffffff), 0);
  assert.equal(w.c39eq(0x19, 0x19), 1);    // FULL dword vs IMMEDIATE 0x19
  assert.equal(w.c39eq(0x18, 0x18), 0);    // needle is 0x19, NOT the arg
  assert.equal(w.c39eq(0x19, 0x18), 1);
  assert.equal(w.c39eq(0xffffffff, 0xffffffff), 0);
  assert.equal(w.c39walk(0), 4);
  assert.equal(w.c39walk(0xfffffffc), 0);
  assert.equal(w.c39walk(0xffffffff), 3);
  assert.equal(w.c39cont(4, 4), 0);
  assert.equal(w.c39cont(4, 8), 1);
  assert.equal(w.c39cont(0, 0xffffffff), 1);
  assert.equal(w.c39true(), 1);            // mov al,1 arm
  assert.equal(w.c39false(), 0);           // xor al,al arm
  assert.equal(w.c39lBegin(), 0);
  assert.equal(w.c39lEnd(), 4);
  assert.equal(w.c39stride(), 4);
  assert.equal(w.c39slotOfs(), 0x2c);
  assert.equal(w.c39f20a9Ofs(), 0x20a9);
  assert.equal(w.c39slotValOfs(), 0x13c0);
  assert.equal(w.c39needle(), 0x19);
  assert.equal(w.c39va() >>> 0, 0x009be670);
  assert.equal(w.c39ret() >>> 0, 0x009be6a8);
  assert.equal(w.c39firstRet() >>> 0, 0x009be6a3);
  assert.equal(w.c39int3() >>> 0, 0x009be6ab);
  assert.equal(w.c39bytes(), 0x3b);
  assert.equal(w.c39sites(), 3);
  assert.equal(w.c39nextVa() >>> 0, 0x009be6b0);

  // --- ABI v39: 0x009be6b0 owner/quality select pins (NARROWED — pure
  // path selection + accept/winner CF around host 0x7cb6e0/0x7706e0;
  // SIGNED setg thresholds + LOW-byte accept gate driven WIDE). ---
  assert.equal(w.c6bEmpty(0, 0), 1);
  assert.equal(w.c6bEmpty(0, 4), 0);
  assert.equal(w.c6bEmpty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c6bFieldNz(0), 0);
  assert.equal(w.c6bFieldNz(1), 1);
  assert.equal(w.c6bFieldNz(0xffffffff), 1);   // FULL dword != 0
  assert.equal(w.c6bFieldEq(0x97, 0x97), 1);
  assert.equal(w.c6bFieldEq(0x97, 0x98), 0);
  assert.equal(w.c6bFieldEq(0xffffffff, 0xffffffff), 1); // FULL dword
  assert.equal(w.c6bF2ef0(1), 1);
  assert.equal(w.c6bF2ef0(0x100), 0);           // low byte 0 -> NOT set (RAW)
  assert.equal(w.c6bF2ef0(0x1ff), 1);
  assert.equal(w.c6bF2ef0(0xffffff00), 0);      // low byte 0 -> clear
  assert.equal(w.c6bF2ef0(0), 0);
  assert.equal(w.c6bGt1(0), 0);
  assert.equal(w.c6bGt1(1), 0);
  assert.equal(w.c6bGt1(2), 1);                 // SIGNED > 1
  assert.equal(w.c6bGt1(0xffffffff), 0);        // int32 -1 FAILS (SIGNED)
  assert.equal(w.c6bGt1(0x80000000), 0);        // int32 -2^31 FAILS
  assert.equal(w.c6bGt1(0x7fffffff), 1);
  assert.equal(w.c6bGt0(0), 0);                 // NON-strict: 0 fails
  assert.equal(w.c6bGt0(1), 1);
  assert.equal(w.c6bGt0(0xffffffff), 0);        // int32 -1 FAILS (SIGNED)
  assert.equal(w.c6bGt0(0x80000000), 0);
  assert.equal(w.c6bGt0(0x7fffffff), 1);
  assert.equal(w.c6bBl(), 1);                   // path A bl FORCED 1
  assert.equal(w.c6bAcc(1, 0x1), 1);
  assert.equal(w.c6bAcc(1, 0x100), 0);          // LOW byte gate: 0x100 = 0
  assert.equal(w.c6bAcc(1, 0x1ff), 1);
  assert.equal(w.c6bAcc(0, 0x1), 0);            // bl == 0 -> skip
  assert.equal(w.c6bAcc(0xffffffff, 0xffffffff), 1); // RAW uint32s
  assert.equal(w.c6bWin(0, 1), 1);
  assert.equal(w.c6bWin(0, 0), 0);
  assert.equal(w.c6bWin(1, 1), 0);              // winner already set
  assert.equal(w.c6bWin(0xffffffff, 0xffffffff), 0);
  assert.equal(w.c6bWalk(0), 4);
  assert.equal(w.c6bWalk(0xfffffffc), 0);
  assert.equal(w.c6bWalk(0xffffffff), 3);
  assert.equal(w.c6bCont(4, 4), 0);
  assert.equal(w.c6bCont(4, 8), 1);
  assert.equal(w.c6bCont(0, 0xffffffff), 1);
  assert.equal(w.c6bPlayer(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c6bPlayer(0) >>> 0, 0);
  assert.equal(w.c6bWinner(0) >>> 0, 0);
  assert.equal(w.c6bWinner(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c6bLBegin(), 0);
  assert.equal(w.c6bLEnd(), 4);
  assert.equal(w.c6bStride(), 4);
  assert.equal(w.c6bF2ef8Ofs(), 0x2ef8);
  assert.equal(w.c6bF2ef0Ofs(), 0x2ef0);
  assert.equal(w.c6bQArg1(), 0x1b7);
  assert.equal(w.c6bQArg2(), 0);
  assert.equal(w.c6bStatusVa() >>> 0, 0x007cb6e0);
  assert.equal(w.c6bQueryVa() >>> 0, 0x007706e0);
  assert.equal(w.c6bVa() >>> 0, 0x009be6b0);
  assert.equal(w.c6bRet() >>> 0, 0x009be747);
  assert.equal(w.c6bFirstRet() >>> 0, 0x009be73c);
  assert.equal(w.c6bInt3() >>> 0, 0x009be74a);
  assert.equal(w.c6bBytes(), 0x9a);
  assert.equal(w.c6bSites(), 41);
  assert.equal(w.c6bNextVa() >>> 0, 0x009be750);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v40: 0x009be750 GetNumCollectibles pins (exact ZHL 19 B:
  // `__thiscall int PlayerManager::GetNumCollectibles(CollectibleType);`
  // NARROWED around host 0x72fd10 ItemConfig::GetCollectible twin-get +
  // 0x770ca0 Entity_Player::GetCollectibleNum count leaf; the twin flag is
  // computed ONCE pre-walk; the sum wraps 32-bit per add ebx,eax).
  // ---
  assert.equal(w.c40flag(0, 0x80000000), 0);      // twin ptr == 0 -> flag 0
  assert.equal(w.c40flag(1, 0), 0);               // bit31 clear -> flag 0
  assert.equal(w.c40flag(1, 0x7fffffff), 0);
  assert.equal(w.c40flag(1, 0x80000000), 1);      // FULL dword bit31 test
  assert.equal(w.c40flag(0x100, 0x80000000), 1);  // FULL-dword ptr gate
  assert.equal(w.c40empty(0, 0), 1);
  assert.equal(w.c40empty(0, 4), 0);
  assert.equal(w.c40empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c40chk(0), 1);
  assert.equal(w.c40chk(0x10000000), 0);          // FULL dword == 0 gate
  assert.equal(w.c40chk(0xffffffff), 0);
  assert.equal(w.c40add(0, 0), 0);
  assert.equal(w.c40add(5, 7), 12);
  assert.equal(w.c40add(0xffffffff, 1) >>> 0, 0); // 32-bit wrap
  assert.equal(w.c40add(0xfffffffe, 2) >>> 0, 0);
  assert.equal(w.c40add(0x80000000, 0x80000000) >>> 0, 0);
  assert.equal(w.c40twin(0, 0x1234), 0);          // flag byte 0 -> no twin
  assert.equal(w.c40twin(0x100, 0x1234), 0);      // flag LOW byte 0 (RAW)
  assert.equal(w.c40twin(0x1ff, 0x1234), 1);      // flag LOW byte nonzero
  assert.equal(w.c40twin(1, 0), 0);               // twin ptr FULL dword 0
  assert.equal(w.c40twin(1, 0x1234), 1);
  assert.equal(w.c40walk(0), 4);
  assert.equal(w.c40walk(0xffffffff), 3);
  assert.equal(w.c40cont(4, 4), 0);
  assert.equal(w.c40cont(4, 8), 1);
  assert.equal(w.c40cont(0, 0xffffffff), 1);      // FULL dword
  assert.equal(w.c40sum(0x12345678) >>> 0, 0x12345678);
  assert.equal(w.c40sum(0xffffffff) >>> 0, 0xffffffff);
  assert.equal(w.c40lBegin(), 0);
  assert.equal(w.c40lEnd(), 4);
  assert.equal(w.c40stride(), 4);
  assert.equal(w.c40slotOfs(), 0x2c);
  assert.equal(w.c40twinOfs(), 0x1e6c);
  assert.equal(w.c40flagsOfs(), 0xb8);
  assert.equal(w.c40bit() >>> 0, 0x80000000);
  assert.equal(w.c40mgr() >>> 0, 0x00c7169c);
  assert.equal(w.c40game() >>> 0, 0x00c71678);
  assert.equal(w.c40recv(), 0x1baa8);
  assert.equal(w.c40twinCont(), 0x2a404);
  assert.equal(w.c40twinGet() >>> 0, 0x0072fd10);
  assert.equal(w.c40countVa() >>> 0, 0x00770ca0);
  assert.equal(w.c40va() >>> 0, 0x009be750);
  assert.equal(w.c40ret() >>> 0, 0x009be7e7);
  assert.equal(w.c40int3() >>> 0, 0x009be7ea);
  assert.equal(w.c40bytes(), 0x9a);
  assert.equal(w.c40sites(), 3);
  assert.equal(w.c40site() >>> 0, 0x007f9332);
  assert.equal(w.c40nextVa() >>> 0, 0x009be7f0);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v41: 0x009be7f0 HasTemporaryEffect pins (exact ZHL 8-B
  // prologue `558bec8b11568b71`:
  // `__thiscall bool PlayerManager::HasTemporaryEffect(ItemConfig_Item*);`
  // PURE bool scan; EMPTY list -> NOT-FOUND 0 (v38 polarity, NOT v39
  // 9be670's TRUE-on-empty); list end CAPTURED ONCE; vec end captured per
  // candidate; first [entry]==needle hit returns 1 mid-walk).
  // ---
  assert.equal(w.c41empty(0, 0), 1);                  // empty -> not-found 0
  assert.equal(w.c41empty(0, 4), 0);
  assert.equal(w.c41empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c41chk(0), 1);
  assert.equal(w.c41chk(0x100), 0);                   // FULL dword == 0 gate
  assert.equal(w.c41chk(0xffffffff), 0);
  assert.equal(w.c41f1519(0), 1);                     // LOW byte gate
  assert.equal(w.c41f1519(0x100), 1);                 // 0x100 low byte 0 -> OK
  assert.equal(w.c41f1519(0x1ff), 0);                 // low byte nonzero
  assert.equal(w.c41f1519(0xffffffff), 0);
  assert.equal(w.c41vEmpty(0, 4), 1);                 // non-empty vec scans
  assert.equal(w.c41vEmpty(4, 4), 0);                 // empty vec skips
  assert.equal(w.c41vEmpty(0xffffffff, 0xffffffff), 0);
  assert.equal(w.c41hit(0x33, 0x33), 1);              // FULL dword [entry]==needle
  assert.equal(w.c41hit(0x100, 0x100), 1);
  assert.equal(w.c41hit(0x100, 0x1ff), 0);
  assert.equal(w.c41hit(0x12345678, 0x12345678), 1);
  assert.equal(w.c41vWalk(0), 0x10);                  // stride 16 wrap
  assert.equal(w.c41vWalk(0xfffffff0) >>> 0, 0);
  assert.equal(w.c41vWalk(0xffffffff), 0xf);
  assert.equal(w.c41vCont(4, 4), 0);
  assert.equal(w.c41vCont(4, 8), 1);
  assert.equal(w.c41vCont(0, 0xffffffff), 1);         // FULL dword
  assert.equal(w.c41walk(0), 4);                      // stride 4 wrap
  assert.equal(w.c41walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c41walk(0xffffffff), 3);
  assert.equal(w.c41cont(4, 4), 0);                   // end captured-once law
  assert.equal(w.c41cont(4, 8), 1);
  assert.equal(w.c41cont(0, 0xffffffff), 1);
  assert.equal(w.c41found(), 1);
  assert.equal(w.c41nfound(), 0);
  assert.equal(w.c41lBegin(), 0);
  assert.equal(w.c41lEnd(), 4);
  assert.equal(w.c41stride(), 4);
  assert.equal(w.c41slotOfs(), 0x2c);
  assert.equal(w.c41flagOfs(), 0x1519);
  assert.equal(w.c41vBeginOfs(), 0x150c);
  assert.equal(w.c41vEndOfs(), 0x1510);
  assert.equal(w.c41vStride(), 0x10);
  assert.equal(w.c41va() >>> 0, 0x009be7f0);
  assert.equal(w.c41firstRet() >>> 0, 0x009be839);    // not-found epilogue
  assert.equal(w.c41ret() >>> 0, 0x009be841);         // found epilogue
  assert.equal(w.c41int3() >>> 0, 0x009be844);
  assert.equal(w.c41bytes(), 0x54);
  assert.equal(w.c41sites(), 2);
  assert.equal(w.c41site() >>> 0, 0x006bdcb5);
  assert.equal(w.c41site2() >>> 0, 0x007fe7ee);
  assert.equal(w.c41nextVa() >>> 0, 0x009be850);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v42: 0x009be850 slot-accumulator gates (address-stable;
  // NO exact ZHL; NARROWED — the 2 host calls to 0x930220 stay host).
  // Outer loop count = SAR32(end-begin,2) RE-DERIVED per iteration;
  // UNSIGNED esi < count (jb @ 0x009be973).  Host gate (both sites):
  // SIGNED ((vec_end-vec_begin)&~3) > 0x1c0 && slot = [vec_begin+0x1c0]
  // != 0.  Marker scan (skips host2): byte [twin+0x1519]==0 && twin vec
  // non-empty, walk stride 0x10, [entry+0]==0 && [entry+4]==0x70.
  // Host receiver player+0x1508 / twin+0x1508; buf16 {slot,0,[slot+0x78],
  // 0}; args (1,1); arg1 (0x70) DEAD.
  // ---
  assert.equal(w.c42count(0x10, 0) | 0, 4);           // SAR32(0x10,2)=4
  assert.equal(w.c42count(0x10, 8) | 0, 2);
  assert.equal(w.c42count(0xffffffff, 0xfffffff3) | 0, 3);
  assert.equal(w.c42count(0x80000000, 0) | 0, -0x20000000); // SAR high bit
  assert.equal(w.c42loop(0), 0);                       // empty -> early out
  assert.equal(w.c42loop(1), 1);
  assert.equal(w.c42loop(-1), 1);                      // FULL dword nonzero
  assert.equal(w.c42gate(0x1c4, 0), 1);                // (0x1c4&~3)=0x1c4 > 0x1c0
  assert.equal(w.c42gate(0x1c0, 0), 0);                // == threshold no
  assert.equal(w.c42gate(0, 0), 0);
  assert.equal(w.c42gate(0xffffffff, 0) | 0, 0);       // signed negative
  assert.equal(w.c42gate(0xfffffff0, 0) | 0, 0);       // (0xfffffff0&~3) signed < 0
  assert.equal(w.c42gate(0x1c400000, 0x1c400000), 0);  // zero delta
  assert.equal(w.c42slot(0), 0);                       // slot absent -> skip
  assert.equal(w.c42slot(1), 1);
  assert.equal(w.c42slot(0x100), 1);                   // FULL dword
  assert.equal(w.c42twin(0), 0);                       // no twin -> tail
  assert.equal(w.c42twin(0x100), 1);
  assert.equal(w.c42f1519(0), 1);                      // LOW byte gate
  assert.equal(w.c42f1519(0x100), 1);                  // 0x100 low byte 0 -> scan
  assert.equal(w.c42f1519(0x1ff), 0);
  assert.equal(w.c42f1519(0xffffffff), 0);
  assert.equal(w.c42tvec(0, 0x10), 1);                 // non-empty scans
  assert.equal(w.c42tvec(0x10, 0x10), 0);              // empty -> skip scan
  assert.equal(w.c42mark(0, 0x70), 1);                 // marker -> skip host2
  assert.equal(w.c42mark(0x100, 0x70), 0);             // FULL dword field0
  assert.equal(w.c42mark(0, 0x71), 0);                 // field4 mismatch
  assert.equal(w.c42mark(0x100, 0x100), 0);
  assert.equal(w.c42vWalk(0), 0x10);                   // stride 16 wrap
  assert.equal(w.c42vWalk(0xfffffff0) >>> 0, 0);
  assert.equal(w.c42vWalk(0xffffffff), 0xf);
  assert.equal(w.c42vCont(0x10, 0x10), 0);
  assert.equal(w.c42vCont(0x10, 0x20), 1);
  assert.equal(w.c42walk(0), 1);                       // inc esi, wrap
  assert.equal(w.c42walk(0xffffffff) >>> 0, 0);
  assert.equal(w.c42cont(0, 4) | 0, 1);                // UNSIGNED 0 < 4
  assert.equal(w.c42cont(4, 4) | 0, 0);
  assert.equal(w.c42cont(0, -1) | 0, 1);               // unsigned 0 < huge
  assert.equal(w.c42cont(-1, 4) | 0, 0);               // unsigned huge < 4 no
  assert.equal(w.c42lBegin(), 0);
  assert.equal(w.c42lEnd(), 4);
  assert.equal(w.c42stride(), 4);
  assert.equal(w.c42mgr() >>> 0, 0x00c7169c);
  assert.equal(w.c42vecAB(), 0x2a41c);
  assert.equal(w.c42vecAE(), 0x2a420);
  assert.equal(w.c42slotOfs(), 0x1c0);
  assert.equal(w.c42thresh(), 0x1c0);
  assert.equal(w.c42mask() >>> 0, 0xfffffffc);
  assert.equal(w.c42slotF(), 0x78);
  assert.equal(w.c42recv(), 0x1508);
  assert.equal(w.c42twinOfs(), 0x1e6c);
  assert.equal(w.c42flagOfs(), 0x1519);
  assert.equal(w.c42tvecB(), 0x150c);
  assert.equal(w.c42tvecE(), 0x1510);
  assert.equal(w.c42tvecS(), 0x10);
  assert.equal(w.c42m0(), 0);
  assert.equal(w.c42m4(), 0x70);
  assert.equal(w.c42hostVa() >>> 0, 0x00930220);
  assert.equal(w.c42arg2(), 1);
  assert.equal(w.c42arg3(), 1);
  assert.equal(w.c42game() >>> 0, 0x00c71678);
  assert.equal(w.c42recvOfs(), 0x1baa8);
  assert.equal(w.c42arg1(), 0x70);
  assert.equal(w.c42va() >>> 0, 0x009be850);
  assert.equal(w.c42ret() >>> 0, 0x009be97f);
  assert.equal(w.c42int3() >>> 0, 0x009be982);
  assert.equal(w.c42bytes(), 0x132);
  assert.equal(w.c42sites(), 1);
  assert.equal(w.c42site() >>> 0, 0x00772bcf);
  assert.equal(w.c42nextVa() >>> 0, 0x009be990);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v43: 0x009be990 PURE bool scan (address-stable; NO exact
  // ZHL).  __thiscall ret 0; NO stack args; this = g_Game + 0x1baa8 at
  // BOTH live callers (0x004531b6 / 0x0049118a).  PURE-complete: 0 E8 /
  // 0 indirect / 0 mem-stores.  FOUND al=1 / NOT-FOUND al=0; both
  // consumers test only AL.  Walk players [this+0..this+4) stride 4;
  // begin/end captured ONCE at entry (end NEVER re-read).  Per player:
  // code = [player+0x3fc] FULL dword ==0 (test/je) or ==3
  // (cmp/jne-not-taken) -> advance; else FOUND.
  // ---
  assert.equal(w.c43hit(0), 0);                      // test/je advance
  assert.equal(w.c43hit(3), 0);                      // cmp/jne-not-taken
  assert.equal(w.c43hit(1), 1);                      // FOUND
  assert.equal(w.c43hit(2), 1);                      // FOUND
  assert.equal(w.c43hit(0x100), 1);                  // FULL dword, not 0/3
  assert.equal(w.c43hit(0x1ff), 1);                  // FULL dword
  assert.equal(w.c43hit(0xffffffff), 1);             // FULL dword
  assert.equal(w.c43hit(0x10000003), 1);             // != 3 as FULL dword
  assert.equal(w.c43empty(0x1000, 0x1000), 1);       // je @ 0x009be997
  assert.equal(w.c43empty(0, 0x1000), 0);
  assert.equal(w.c43empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c43empty(0, 0xffffffff), 0);
  assert.equal(w.c43walk(0), 4);                     // add eax,4 wrap
  assert.equal(w.c43walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c43walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c43cont(4, 4), 0);                  // jne @ 0x009be9b6
  assert.equal(w.c43cont(4, 8), 1);
  assert.equal(w.c43cont(0x30, 0x20), 1);            // next > end still walks
  assert.equal(w.c43cont(0, 0xffffffff), 1);
  assert.equal(w.c43lBegin(), 0);
  assert.equal(w.c43lEnd(), 4);
  assert.equal(w.c43stride(), 4);
  assert.equal(w.c43slotOfs(), 0x3fc);
  assert.equal(w.c43skip0(), 0);
  assert.equal(w.c43skip3(), 3);
  assert.equal(w.c43mgr() >>> 0, 0x00c71678);
  assert.equal(w.c43recv(), 0x1baa8);
  assert.equal(w.c43va() >>> 0, 0x009be990);
  assert.equal(w.c43firstRet() >>> 0, 0x009be9ba);
  assert.equal(w.c43ret() >>> 0, 0x009be9bd);
  assert.equal(w.c43int3() >>> 0, 0x009be9be);
  assert.equal(w.c43bytes(), 0x2e);
  assert.equal(w.c43sites(), 2);
  assert.equal(w.c43site() >>> 0, 0x004531b6);
  assert.equal(w.c43site2() >>> 0, 0x0049118a);
  assert.equal(w.c43nextVa() >>> 0, 0x009be9c0);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v44: 0x009be9c0 PURE bool scan (address-stable; NO exact
  // ZHL).  __thiscall ret 0; NO stack args; this = g_Game + 0x1baa8 at
  // the SOLE live caller 0x006c83b3 (receiver via getter 0x00417860 =
  // `lea eax,[ecx+0x1baa8]; ret`; `mov ecx,[0xc71678] / call 0x417860 /
  // mov ecx,eax / call 0x9be9c0 / test al,al / jne`).  PURE-complete:
  // 0 E8 / 0 indirect / 0 mem-stores.  FOUND al=1 (ret 0x009bea00) /
  // NOT-FOUND al=0 (ret 0x009be9fd); the sole consumer tests only AL.
  // Walk players [this+0..this+4) stride 4; begin/end captured ONCE at
  // entry (end NEVER re-read).  Per player: byte [player+0x20a9] != 0 ->
  // advance; FULL dword [player+0x184] IN {0,1,2,3} (test/je ==0,
  // cmp/je ==3, cmp/je ==1, cmp/je ==2) -> FOUND; else advance.
  // ---
  assert.equal(w.c44empty(0x1000, 0x1000), 1);       // je @ 0x009be9c7
  assert.equal(w.c44empty(0, 0x1000), 0);
  assert.equal(w.c44empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c44empty(0, 0xffffffff), 0);
  assert.equal(w.c44flag(0), 1);                     // low byte 0 -> examine
  assert.equal(w.c44flag(0xff), 0);                  // low byte != 0 -> skip
  assert.equal(w.c44flag(0x100), 1);                 // WIDE byte gate: low=0
  assert.equal(w.c44flag(0x1ff), 0);                 // WIDE: low=0xff
  assert.equal(w.c44flag(0xffffffff), 0);            // low=0xff
  assert.equal(w.c44field(0), 1);                    // test/je FOUND
  assert.equal(w.c44field(1), 1);                    // cmp/je FOUND
  assert.equal(w.c44field(2), 1);                    // cmp/je FOUND
  assert.equal(w.c44field(3), 1);                    // cmp/je FOUND
  assert.equal(w.c44field(4), 0);                    // else ADVANCE
  assert.equal(w.c44field(0x100), 0);                // FULL dword, not 0..3
  assert.equal(w.c44field(0x1ff), 0);                // FULL dword
  assert.equal(w.c44field(0xffffffff), 0);           // FULL dword
  assert.equal(w.c44field(0x10000003), 0);           // != 3 as FULL dword
  assert.equal(w.c44walk(0), 4);                     // add eax,4 wrap
  assert.equal(w.c44walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c44walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c44cont(4, 4), 0);                  // jne @ 0x009be9f9
  assert.equal(w.c44cont(4, 8), 1);
  assert.equal(w.c44cont(0x30, 0x20), 1);            // next > end still walks
  assert.equal(w.c44cont(0, 0xffffffff), 1);
  assert.equal(w.c44lBegin(), 0);
  assert.equal(w.c44lEnd(), 4);
  assert.equal(w.c44stride(), 4);
  assert.equal(w.c44flagOfs(), 0x20a9);
  assert.equal(w.c44fieldOfs(), 0x184);
  assert.equal(w.c44fc0(), 0);
  assert.equal(w.c44fc1(), 1);
  assert.equal(w.c44fc2(), 2);
  assert.equal(w.c44fc3(), 3);
  assert.equal(w.c44mgr() >>> 0, 0x00c71678);
  assert.equal(w.c44recv(), 0x1baa8);
  assert.equal(w.c44getter() >>> 0, 0x00417860);
  assert.equal(w.c44va() >>> 0, 0x009be9c0);
  assert.equal(w.c44firstRet() >>> 0, 0x009be9fd);
  assert.equal(w.c44ret() >>> 0, 0x009bea00);
  assert.equal(w.c44int3() >>> 0, 0x009bea01);
  assert.equal(w.c44bytes(), 0x41);
  assert.equal(w.c44sites(), 1);
  assert.equal(w.c44site() >>> 0, 0x006c83b3);
  assert.equal(w.c44nextVa() >>> 0, 0x009bea10);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v45: 0x009bea40 PURE f32-sum walk (address-stable; NO exact
  // ZHL).  __thiscall ret 0; NO stack args; this = g_Game + 0x1baa8 at
  // the 3 live rel32 callers 0x0065ab45 / 0x006c8fdd / 0x007fb912 (first
  // two via getter 0x00417860 = `lea eax,[ecx+0x1baa8]; ret`, third
  // `lea ecx,[esi+0x1baa8]` with esi = g_Game).  PURE-complete: 0 E8 /
  // 0 indirect / 0 mem-stores.  Returns f32 in xmm0 (single epilogue ret
  // 0x009bea70; consumers cvttss2si / mulss on the sum).  Walk players
  // [this+0..this+4) stride 4; begin/end captured ONCE at entry (end
  // NEVER re-read).  Per player: FULL dword [p+0x2c]==0 AND byte
  // [p+0x20a9]==0 -> xmm0 = addss(xmm0, f32 [p+0x156c]) (f32 rounding
  // per add); else advance.  Empty list (cmp/je @ 0x009bea4a) -> ret
  // +0.0f.  ---
  assert.equal(w.c45empty(0x1000, 0x1000), 1);       // je @ 0x009bea4a
  assert.equal(w.c45empty(0, 0x1000), 0);
  assert.equal(w.c45empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c45empty(0, 0xffffffff), 0);
  assert.equal(w.c45slot(0), 1);                     // FULL dword == 0
  assert.equal(w.c45slot(1), 0);
  assert.equal(w.c45slot(0x100), 0);                 // WIDE: full dword
  assert.equal(w.c45slot(0xffffffff), 0);
  assert.equal(w.c45slot(0x10000000), 0);
  assert.equal(w.c45flag(0), 1);                     // low byte 0 -> may add
  assert.equal(w.c45flag(0xff), 0);
  assert.equal(w.c45flag(0x100), 1);                 // WIDE byte gate: low=0
  assert.equal(w.c45flag(0x1ff), 0);                 // WIDE: low=0xff
  assert.equal(w.c45flag(0xffffffff), 0);
  assert.equal(w.c45add(1.5, 2.25), 3.75);           // addss f32
  assert.equal(w.c45add(16777216.0, 1.0), 16777216.0); // f32 rounding: 2^24+1
  assert.equal(w.c45add(-0.0, 0.0), 0.0);            // +0 + -0 = +0 (addss)
  assert.ok(Number.isNaN(w.c45add(0.0, NaN)), "addss NaN propagates");
  // f32-bit inputs via DataView round-trip: 0x3f800000 = 1.0f, 0x40400000 = 3.0f.
  const f32u = (bits) => new Float32Array(new Uint32Array([bits >>> 0]).buffer)[0];
  assert.equal(w.c45add(f32u(0x3f800000), f32u(0x40000000)), 3.0); // 1.0 + 2.0
  assert.equal(w.c45walk(0), 4);                     // add eax,4 wrap
  assert.equal(w.c45walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c45walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c45cont(4, 4), 0);                  // jne @ 0x009bea6e
  assert.equal(w.c45cont(4, 8), 1);
  assert.equal(w.c45cont(0x30, 0x20), 1);            // past end still walks
  assert.equal(w.c45cont(0, 0xffffffff), 1);
  assert.equal(w.c45lBegin(), 0);
  assert.equal(w.c45lEnd(), 4);
  assert.equal(w.c45stride(), 4);
  assert.equal(w.c45slotOfs(), 0x2c);
  assert.equal(w.c45flagOfs(), 0x20a9);
  assert.equal(w.c45fieldOfs(), 0x156c);
  assert.equal(w.c45mgr() >>> 0, 0x00c71678);
  assert.equal(w.c45recv(), 0x1baa8);
  assert.equal(w.c45getter() >>> 0, 0x00417860);
  assert.equal(w.c45va() >>> 0, 0x009bea40);
  assert.equal(w.c45firstRet() >>> 0, 0x009bea70);
  assert.equal(w.c45ret() >>> 0, 0x009bea70);
  assert.equal(w.c45int3() >>> 0, 0x009bea71);
  assert.equal(w.c45bytes(), 0x31);
  assert.equal(w.c45sites(), 3);
  assert.equal(w.c45site0() >>> 0, 0x0065ab45);
  assert.equal(w.c45site1() >>> 0, 0x006c8fdd);
  assert.equal(w.c45site2() >>> 0, 0x007fb912);
  assert.equal(w.c45nextVa() >>> 0, 0x009bea80);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v46: 0x009bea80 GetTrinketMultiplier (EXACT ZHL 18 B:
  // `__thiscall int PlayerManager::GetTrinketMultiplier(int TrinketID);`).
  // NARROWED: 2 E8s to HOST 0x007cb6e0 (HUD-family count resolver ABI
  // v19; typed host event), 0 indirect, 3 mem-stores ALL [esp+N] locals.
  // this = g_Game + 0x1baa8; arg1 = raw TrinketID; ret 4 @ 0x009beb27.
  // Slot flag byte = 1 iff SIGNED (id&0x7fff) < SAR32(end-begin,2) &&
  // slotArray[id&0x7fff] != 0 && bit31([slot+0xb8]); walk players
  // [this+0..this+4): FULL dword [p+0x2c]==0 -> host1(p, RAW id) sum +=
  // eax; flag LOW byte != 0 && [p+0x1e6c] != 0 -> host2(twin, RAW id)
  // sum += eax; END RE-READ per iteration; return sum (SIGNED consumer
  // cvtdq2ps).  ---
  assert.equal(w.c46mask(0x7fff), 0x7fff);         // and edx,0x7fff
  assert.equal(w.c46mask(0x10000), 0);
  assert.equal(w.c46mask(0xffffffff), 0x7fff);     // WIDE raw input
  assert.equal(w.c46count(0x1000, 0) | 0, 0x400);  // sar32(0x1000-0,2)
  assert.equal(w.c46count(0xffffffff, 0) | 0, -1); // wrap: sar32(-1,2) = -1
  assert.equal(w.c46count(0xfffffff8, 0) | 0, -2); // wrap: sar32(-8,2) = -2
  assert.equal(w.c46range(0x10, 0x100), 1);        // SIGNED < (jge skip)
  assert.equal(w.c46range(0x100, 0x100), 0);
  assert.equal(w.c46range(0x8000, 0x10), 0);       // 0x8000 >= 0x10 signed
  assert.equal(w.c46range(0x80000000, 0), 1);      // WIDE: -2^31 < 0 SIGNED
  assert.equal(w.c46range(0xffffffff, 6), 1);      // WIDE: -1 < 6 SIGNED
  assert.equal(w.c46slotPresent(0), 0);            // test eax,eax / je
  assert.equal(w.c46slotPresent(1), 1);
  assert.equal(w.c46slotPresent(0xffffffff), 1);
  assert.equal(w.c46flag(0x80000000), 1);          // and/or/jne bit31
  assert.equal(w.c46flag(0x7fffffff), 0);
  assert.equal(w.c46flag(0), 0);
  assert.equal(w.c46flag(0x80000001), 1);          // WIDE bit31
  assert.equal(w.c46flag(0xffffffff), 1);
  assert.equal(w.c46empty(0x1000, 0x1000), 1);     // je @ 0x009beadf
  assert.equal(w.c46empty(0, 0x1000), 0);
  assert.equal(w.c46empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c46slot(0), 1);                   // FULL dword == 0
  assert.equal(w.c46slot(1), 0);
  assert.equal(w.c46slot(0x100), 0);               // WIDE: full dword
  assert.equal(w.c46slot(0xffffffff), 0);
  assert.equal(w.c46sum(5, 7), 12);                // add edi,eax
  assert.equal(w.c46sum(0xffffffff, 2) >>> 0, 1);  // 32-bit wrap
  assert.equal(w.c46twin(0, 0x10), 0);             // flag low byte 0
  assert.equal(w.c46twin(1, 0), 0);                // twin null
  assert.equal(w.c46twin(1, 0x10), 1);
  assert.equal(w.c46twin(0x100, 0x10), 0);         // WIDE: low byte 0 -> skip
  assert.equal(w.c46twin(0x1ff, 0x10), 1);         // WIDE: low byte 0xff
  assert.equal(w.c46twin(0xffffffff, 0x10), 1);    // WIDE: low byte 0xff
  assert.equal(w.c46walk(0), 4);                   // add esi,4 wrap
  assert.equal(w.c46walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c46walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c46cont(4, 4), 0);                // jne @ 0x009beb1d
  assert.equal(w.c46cont(4, 8), 1);
  assert.equal(w.c46cont(0x30, 0x20), 1);          // past end still walks
  assert.equal(w.c46resSum(0x12345678), 0x12345678); // mov eax,edi
  assert.equal(w.c46lBegin(), 0);
  assert.equal(w.c46lEnd(), 4);
  assert.equal(w.c46stride(), 4);
  assert.equal(w.c46slotOfs(), 0x2c);
  assert.equal(w.c46twinOfs(), 0x1e6c);
  assert.equal(w.c46arrB(), 0x2a410);
  assert.equal(w.c46arrE(), 0x2a414);
  assert.equal(w.c46maskVal(), 0x7fff);
  assert.equal(w.c46flagsOfs(), 0xb8);
  assert.equal(w.c46flagBit() >>> 0, 0x80000000);
  assert.equal(w.c46mgr() >>> 0, 0x00c7169c);
  assert.equal(w.c46game() >>> 0, 0x00c71678);
  assert.equal(w.c46recv(), 0x1baa8);
  assert.equal(w.c46statusVa() >>> 0, 0x007cb6e0);
  assert.equal(w.c46va() >>> 0, 0x009bea80);
  assert.equal(w.c46firstRet() >>> 0, 0x009beb27);
  assert.equal(w.c46ret() >>> 0, 0x009beb27);
  assert.equal(w.c46int3() >>> 0, 0x009beb2a);
  assert.equal(w.c46bytes(), 0xaa);
  assert.equal(w.c46sites(), 43);
  assert.equal(w.c46nextVa() >>> 0, 0x009beb30);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v47: 0x009beb30 all/any instant-death-curse walk (NO exact
  // ZHL; address-stable prefix A9BEB30).  NARROWED: 1 E8 to HOST
  // 0x007db6b0 (Entity_Player::HasInstantDeathCurse, EXACT ZHL 14 B,
  // PURE body — typed host event this unit per ONE-BODY mandate), 0
  // indirect, 0 mem-stores (zero observable stores).  this = g_Game +
  // 0x1baa8; arg1 = uint32 mode (LOW byte only); ret 4 @ 0x009beb9b.
  // bh = arg&0xff seeds bl; begin/end CAPTURED ONCE; empty/no-eligible
  // -> ret arg&0xff ECHO; per candidate (FULL dword [p+0x2c]==0 && byte
  // [p+0x20a9]==0): a = [p+0x134c]+[p+0x1344] (wrap); SIGNED a >=
  // [p+0x1340] -> al=1 no host; else host(player) -> al=(host!=0);
  // mode!=0 AND / mode==0 OR combine (LOW bytes); return byte.  ---
  assert.equal(w.c47argByte(0), 0);              // mov bh,byte [ebp+8]
  assert.equal(w.c47argByte(0x2f), 0x2f);
  assert.equal(w.c47argByte(0x100), 0);          // WIDE: low byte 0
  assert.equal(w.c47argByte(0x1ff), 0xff);       // WIDE: low byte 0xff
  assert.equal(w.c47argByte(0xffffffff), 0xff);  // WIDE
  assert.equal(w.c47mode(0), 0);                 // test bh,bh / je OR
  assert.equal(w.c47mode(1), 1);
  assert.equal(w.c47mode(0x100), 0);             // WIDE: low byte 0
  assert.equal(w.c47mode(0x1ff), 1);             // WIDE: low byte 0xff
  assert.equal(w.c47mode(0xffffffff), 1);        // WIDE
  assert.equal(w.c47empty(0x1000, 0x1000), 1);   // je @ 0x009beb42
  assert.equal(w.c47empty(0, 0x1000), 0);
  assert.equal(w.c47empty(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c47slot(0), 1);                 // FULL dword == 0
  assert.equal(w.c47slot(1), 0);
  assert.equal(w.c47slot(0x100), 0);             // WIDE: full dword
  assert.equal(w.c47slot(0xffffffff), 0);
  assert.equal(w.c47flag20a9(0), 1);             // LOW byte == 0
  assert.equal(w.c47flag20a9(1), 0);
  assert.equal(w.c47flag20a9(0x100), 1);         // WIDE: low byte 0
  assert.equal(w.c47flag20a9(0x1ff), 0);         // WIDE: low byte 0xff
  assert.equal(w.c47flag20a9(0xffffffff), 0);    // WIDE
  assert.equal(w.c47chargeSum(5, 7), 12);        // add eax,[+0x1344]
  assert.equal(w.c47chargeSum(0xffffffff, 2) >>> 0, 1); // 32-bit wrap
  assert.equal(w.c47charge(0x100, 0x100), 1);    // SIGNED >= (jge)
  assert.equal(w.c47charge(0xff, 0x100), 0);
  assert.equal(w.c47charge(0x80000000, 0x100), 0); // WIDE: -2^31 < 256
  assert.equal(w.c47charge(0xffffffff, 0), 0);   // WIDE: -1 >= 0 false
  assert.equal(w.c47host(0), 0);                 // test al,al / je
  assert.equal(w.c47host(1), 1);
  assert.equal(w.c47host(0xff), 1);              // WIDE: nonzero byte
  assert.equal(w.c47host(0x100), 0);             // WIDE: low byte 0
  assert.equal(w.c47comb(0, 0, 0), 0);           // OR: all zero
  assert.equal(w.c47comb(0, 0, 1), 1);           // OR: al set
  assert.equal(w.c47comb(0, 1, 0), 1);           // OR: bl sticky
  assert.equal(w.c47comb(1, 1, 1), 1);           // AND: both set
  assert.equal(w.c47comb(1, 1, 0), 0);           // AND: al clear
  assert.equal(w.c47comb(1, 0, 1), 0);           // AND: bl clear
  assert.equal(w.c47comb(0x100, 0, 1), 1);       // WIDE: mode low byte 0
  assert.equal(w.c47comb(0x1ff, 1, 1), 1);       // WIDE: mode low byte ff
  assert.equal(w.c47comb(0xffffffff, 1, 0), 0);  // WIDE: AND mode
  assert.equal(w.c47walk(0), 4);                 // add esi,4 wrap
  assert.equal(w.c47walk(0xfffffffc) >>> 0, 0);
  assert.equal(w.c47walk(0xffffffff) >>> 0, 3);
  assert.equal(w.c47cont(4, 4), 0);              // jne @ 0x009beb93
  assert.equal(w.c47cont(4, 8), 1);
  assert.equal(w.c47cont(0x30, 0x20), 1);        // past end still walks
  assert.equal(w.c47resByte(1), 1);              // mov al,bl
  assert.equal(w.c47resByte(0x2f), 0x2f);        // echo path
  assert.equal(w.c47resByte(0x1234ff), 0xff);    // byte truncation
  assert.equal(w.c47lBegin(), 0);
  assert.equal(w.c47lEnd(), 4);
  assert.equal(w.c47stride(), 4);
  assert.equal(w.c47slotOfs(), 0x2c);
  assert.equal(w.c47flag20a9Ofs(), 0x20a9);
  assert.equal(w.c47chargeOfs(), 0x134c);
  assert.equal(w.c47addendOfs(), 0x1344);
  assert.equal(w.c47maxOfs(), 0x1340);
  assert.equal(w.c47mgr() >>> 0, 0x00c71678);
  assert.equal(w.c47recv(), 0x1baa8);
  assert.equal(w.c47curseVa() >>> 0, 0x007db6b0);
  assert.equal(w.c47va() >>> 0, 0x009beb30);
  assert.equal(w.c47firstRet() >>> 0, 0x009beb9b);
  assert.equal(w.c47ret() >>> 0, 0x009beb9b);
  assert.equal(w.c47int3() >>> 0, 0x009beb9e);
  assert.equal(w.c47bytes(), 0x6e);
  assert.equal(w.c47sites(), 3);
  assert.equal(w.c47site0() >>> 0, 0x0073ada9);
  assert.equal(w.c47site1() >>> 0, 0x0073bd21);
  assert.equal(w.c47site2() >>> 0, 0x00748819);
  assert.equal(w.c47nextVa() >>> 0, 0x009beba0);
  assert.equal(w.abi(), PROCESS_INPUT_PURE_ABI_VERSION);

  // --- ABI v48: 0x009beba0 avg-player-position walk (NO exact ZHL;
  // address-stable prefix A9BEBA0).  NARROWED (NOT PURE-removed): pure
  // walk + slot/watch/flag20a9 gates + gobj scan + f32 accumulate/average
  // math; 2 INDIRECT host predicates (vtable slot [[gitem+0x370]+0x14],
  // byte result) + 2 E8 assert calls 0x00a112c0 stay typed host events;
  // observable stores (*out float2 + cache 0xc9436c/0xc94370 + cacheTs
  // 0xc5c4d4) are POST events (laws compute the VALUES).  this = g_Game +
  // 0x1baa8; arg1 = out float2, arg2 = uint32 mode (LOW byte gate); ret 8
  // (fast epilogue 0x009bebe9, main epilogue 0x009bee74).  ---
  assert.equal(w.c48mode(0), 0);               // cmp byte [ebp+0xc],0 / je
  assert.equal(w.c48mode(1), 1);
  assert.equal(w.c48mode(0x100), 0);           // WIDE: low byte 0
  assert.equal(w.c48mode(0x1ff), 1);           // WIDE: low byte ff
  assert.equal(w.c48mode(0xffffffff), 1);      // WIDE
  assert.equal(w.c48fresh(0x1234, 0x1234), 1); // FULL dword ts==cacheTs
  assert.equal(w.c48fresh(0x1234, 0x1235), 0);
  assert.equal(w.c48fresh(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c48count(0x1000, 0x1010), 4); // SAR32(end-begin,2)
  assert.equal(w.c48count(0x1000, 0x1000), 0);
  assert.equal(w.c48count(0x1000, 0) | 0, -1024); // WIDE begin>end
  assert.equal(w.c48inrange(0, 1), 1);         // cmp/jae @ 0x009bec55
  assert.equal(w.c48inrange(1, 1), 0);
  assert.equal(w.c48inrange(0, 0), 0);
  assert.equal(w.c48inrange(0xffffffff, 0xffffffff), 0);
  assert.equal(w.c48slot(0), 1);               // FULL dword [p+0x2c]==0
  assert.equal(w.c48slot(1), 0);
  assert.equal(w.c48slot(0x100), 0);           // WIDE: full dword
  assert.equal(w.c48slot(0xffffffff), 0);
  assert.equal(w.c48watch(0x23), 0);           // FULL dword != 0x23
  assert.equal(w.c48watch(0x22), 1);
  assert.equal(w.c48watch(0x10023), 1);        // WIDE: full dword != 0x23
  assert.equal(w.c48watch(0xffffffff), 1);     // WIDE
  assert.equal(w.c48flag20a9(0), 0);           // LOW byte != 0
  assert.equal(w.c48flag20a9(1), 1);
  assert.equal(w.c48flag20a9(0x100), 0);       // WIDE: low byte 0
  assert.equal(w.c48flag20a9(0x1ff), 1);       // WIDE: low byte ff
  assert.equal(w.c48flag20a9(0xffffffff), 1);  // WIDE
  assert.equal(w.c48cand(0, 0x22, 0), 1);      // slot ok + watch != 0x23
  assert.equal(w.c48cand(0, 0x23, 0), 0);      // watch 0x23 && flag20a9 0
  assert.equal(w.c48cand(0, 0x23, 1), 1);      // flag20a9 set unblocks
  assert.equal(w.c48cand(0, 0x23, 0x100), 0);  // WIDE: flag20a9 low byte 0
  assert.equal(w.c48cand(1, 0x22, 0), 0);      // slot gate blocks
  assert.equal(w.c48cand(0x100, 0x22, 0), 0);  // WIDE: full dword slot
  assert.equal(w.c48match(0x23, 0x23), 1);     // FULL dword [gitem+0xc]==want
  assert.equal(w.c48match(0x23, 0x24), 0);
  assert.equal(w.c48match(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c48scanEmpty(0x1000, 0x1000), 1); // glist begin==end
  assert.equal(w.c48scanEmpty(0x1000, 0x1004), 0);
  assert.equal(w.c48scanCont(0, 1), 1);        // index < count
  assert.equal(w.c48scanCont(1, 1), 0);
  assert.equal(w.c48scanCont(0xffffffff, 0), 0);
  assert.equal(w.c48accumGate(0, 0), 1);       // not found -> accumulate
  assert.equal(w.c48accumGate(0, 1), 1);
  assert.equal(w.c48accumGate(1, 0), 0);       // found && !pred -> skip
  assert.equal(w.c48accumGate(1, 1), 1);
  assert.equal(w.c48accumGate(0x100, 0), 0);   // WIDE found nonzero
  assert.equal(w.c48pred(0), 0);               // test al,al
  assert.equal(w.c48pred(1), 1);
  assert.equal(w.c48pred(0xff), 1);            // WIDE nonzero byte
  assert.equal(w.c48pred(0x100), 0);           // WIDE: low byte 0
  assert.equal(w.c48pred(0xffffffff), 1);      // WIDE
  assert.equal(w.c48accX(1.5, 2.25), 3.75);    // addss
  assert.equal(w.c48accY(0.5, 0.25), 0.75);
  assert.equal(w.c48accX(0.1, 0.2), a9beba0AccumX(0.1, 0.2)); // f32 lane
  assert.equal(w.c48cntInc(0), 1);             // inc dword
  assert.equal(w.c48cntInc(0xffffffff) >>> 0, 0); // wrap
  assert.equal(w.c48hasAvg(0), 0);             // SIGNED count > 0
  assert.equal(w.c48hasAvg(1), 1);
  assert.equal(w.c48hasAvg(0xffffffff), 0);    // WIDE: -1 <= 0
  assert.equal(w.c48hasAvg(0x80000000), 0);    // WIDE: -2^31 <= 0
  assert.equal(w.c48hasAvg(0x100), 1);         // WIDE: +256 > 0
  assert.equal(w.c48avgX(3, 2), 1.5);          // divss
  assert.equal(w.c48avgY(3, 2), 1.5);
  assert.equal(w.c48avgX(0.1, 3), a9beba0AvgX(0.1, 3)); // f32 lane
  assert.equal(w.c48fbX(2.5), 2.5);            // movss passthrough
  assert.equal(w.c48fbY(-1.25), -1.25);
  assert.equal(w.c48assert(0), 1);             // count==0 -> host assert
  assert.equal(w.c48assert(1), 0);
  assert.equal(w.c48assert(0xffffffff), 0);    // WIDE full dword
  assert.equal(w.c48lBegin(), 0);
  assert.equal(w.c48lEnd(), 4);
  assert.equal(w.c48stride(), 4);
  assert.equal(w.c48secBegin(), 0xd0);
  assert.equal(w.c48secEnd(), 0xd4);
  assert.equal(w.c48slotOfs(), 0x2c);
  assert.equal(w.c48watchOfs(), 0x13c0);
  assert.equal(w.c48watchVal(), 0x23);
  assert.equal(w.c48flag20a9Ofs(), 0x20a9);
  assert.equal(w.c48keyOfs(), 0x1618);
  assert.equal(w.c48tagOfs(), 0xc);
  assert.equal(w.c48posXOfs(), 0x33c);
  assert.equal(w.c48posYOfs(), 0x340);
  assert.equal(w.c48predObjOfs(), 0x370);
  assert.equal(w.c48predSlotOfs(), 0x14);
  assert.equal(w.c48gobjTsOfs(), 0x4abbc);
  assert.equal(w.c48glistBegin(), 0x4b3d8);
  assert.equal(w.c48glistEnd(), 0x4b3dc);
  assert.equal(w.c48cacheTsVa() >>> 0, 0x00c5c4d4);
  assert.equal(w.c48cacheXVa() >>> 0, 0x00c9436c);
  assert.equal(w.c48cacheYVa() >>> 0, 0x00c94370);
  assert.equal(w.c48gobjVa() >>> 0, 0x00c7169c);
  assert.equal(w.c48mgr() >>> 0, 0x00c71678);
  assert.equal(w.c48recv(), 0x1baa8);
  assert.equal(w.c48assertVa() >>> 0, 0x00a112c0);
  assert.equal(w.c48assertMsg() >>> 0, 0x00b7e6bc);
  assert.equal(w.c48assertCode(), 0x10);
  assert.equal(w.c48va() >>> 0, 0x009beba0);
  assert.equal(w.c48firstRet() >>> 0, 0x009bebe9);
  assert.equal(w.c48ret() >>> 0, 0x009bee74);
  assert.equal(w.c48int3() >>> 0, 0x009bee77);
  assert.equal(w.c48bytes(), 0x2d7);
  assert.equal(w.c48sites(), 9);
  assert.equal(w.c48site0() >>> 0, 0x004ac128);
  assert.equal(w.c48site1() >>> 0, 0x00800524);
  assert.equal(w.c48site2() >>> 0, 0x00943032);
  assert.equal(w.c48site3() >>> 0, 0x00943850);
  assert.equal(w.c48site4() >>> 0, 0x00943a4d);
  assert.equal(w.c48site5() >>> 0, 0x00943e6d);
  assert.equal(w.c48site6() >>> 0, 0x009446fd);
  assert.equal(w.c48site7() >>> 0, 0x009940a5);
  assert.equal(w.c48site8() >>> 0, 0x009940fc);
  assert.equal(w.c48nextVa() >>> 0, 0x009bee80);

  // ---- ABI v49: 0x009bfa70 PURE bool-walk counter (0 E8 / 0 stores;
  // this = g_Game + 0x1baa8; ret plain; count of slots p where
  // [p+0x2c]==0 && [p+0x3bc]==0 && (link==0 || linkIdx==-1 ||
  // SIGNED(linkIdx) >= SIGNED(ownIdx) || link==p) && byte[p+0x20a9]!=0;
  // link=[p+0x1e68], linkIdx=[link+0x161c], ownIdx=[p+0x161c]).  ---
  assert.equal(w.c49listCount(0x1000, 0x1010), 4); // sar ebx,2 @ 0x009bfa82
  assert.equal(w.c49listCount(0x1000, 0x1000), 0);
  assert.equal(w.c49listCount(0x1000, 0) | 0, -1024); // WIDE begin>end
  assert.equal(w.c49listCount(0xffffffff, 0x3) | 0, 1); // WIDE wrap
  assert.equal(w.c49idxContinue(0, 1), 1);       // cmp/jb @ 0x009bfad1
  assert.equal(w.c49idxContinue(1, 1), 0);
  assert.equal(w.c49idxContinue(0, 0), 0);
  assert.equal(w.c49idxContinue(0xffffffff, 0xffffffff), 0);
  assert.equal(w.c49slot(0), 1);                 // FULL dword [p+0x2c]==0
  assert.equal(w.c49slot(1), 0);
  assert.equal(w.c49slot(0x100), 0);             // WIDE: full dword
  assert.equal(w.c49slot(0xffffffff), 0);
  assert.equal(w.c49state(0), 1);                // FULL dword [p+0x3bc]==0
  assert.equal(w.c49state(1), 0);
  assert.equal(w.c49state(0x100), 0);            // WIDE: full dword
  assert.equal(w.c49state(0xffffffff), 0);
  assert.equal(w.c49linkNull(0), 1);             // FULL dword link==0
  assert.equal(w.c49linkNull(1), 0);
  assert.equal(w.c49linkNull(0xffffffff), 0);
  assert.equal(w.c49linkNull(0x100), 0);         // WIDE
  assert.equal(w.c49linkIdxNeg1(0xffffffff), 1); // FULL dword == -1
  assert.equal(w.c49linkIdxNeg1(0), 0);
  assert.equal(w.c49linkIdxNeg1(0x100), 0);      // WIDE: 0x100 != 0xffffffff
  assert.equal(w.c49linkIdxNeg1(0x1ff), 0);      // WIDE: low byte ff still != -1
  assert.equal(w.c49linkIdxNeg1(0xfffffffe), 0);
  assert.equal(w.c49indexGe(0x23, 0x22), 1);     // SIGNED jge @ 0x009bfab7
  assert.equal(w.c49indexGe(0x22, 0x23), 0);
  assert.equal(w.c49indexGe(0x23, 0x23), 1);
  assert.equal(w.c49indexGe(0xffffffff, 1), 0);  // WIDE: -1 >= 1 false
  assert.equal(w.c49indexGe(0x80000000, 0), 0);  // WIDE: -2^31 >= 0 false
  assert.equal(w.c49indexGe(0x80000000, 0x7fffffff), 0); // -2^31 >= +2^31-1
  assert.equal(w.c49indexGe(0x7fffffff, 0x80000000), 1); // +2^31-1 >= -2^31
  assert.equal(w.c49indexGe(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c49linkSelf(0x1000, 0x1000), 1); // FULL dword link==player
  assert.equal(w.c49linkSelf(0x1000, 0x1004), 0);
  assert.equal(w.c49linkSelf(0xffffffff, 0xffffffff), 1);
  assert.equal(w.c49flag(0), 0);                 // LOW byte != 0
  assert.equal(w.c49flag(1), 1);
  assert.equal(w.c49flag(0x100), 0);             // WIDE: low byte 0
  assert.equal(w.c49flag(0x1ff), 1);             // WIDE: low byte ff
  assert.equal(w.c49flag(0xffffffff), 1);        // WIDE
  assert.equal(w.c49gate(1, 1, 1, 0, 0, 0, 1), 1); // link_null path
  assert.equal(w.c49gate(1, 1, 0, 1, 0, 0, 1), 1); // link_index_neg1 path
  assert.equal(w.c49gate(1, 1, 0, 0, 1, 0, 1), 1); // index_ge path
  assert.equal(w.c49gate(1, 1, 0, 0, 0, 1, 1), 1); // link_is_self path
  assert.equal(w.c49gate(1, 1, 0, 0, 0, 0, 1), 0); // no link path -> 0
  assert.equal(w.c49gate(0, 1, 1, 0, 0, 0, 1), 0); // slot gate blocks
  assert.equal(w.c49gate(1, 0, 1, 0, 0, 0, 1), 0); // state gate blocks
  assert.equal(w.c49gate(1, 1, 1, 0, 0, 0, 0), 0); // flag gate blocks
  assert.equal(w.c49gate(0x100, 1, 1, 0, 0, 0, 1), 1); // WIDE nonzero = set
  assert.equal(w.c49gate(1, 1, 1, 0, 0, 0, 0x100), 1); // WIDE nonzero = set
  assert.equal(w.c49gate(1, 1, 1, 0, 0, 0, 0x1ff), 1); // WIDE flag low byte ff
  assert.equal(w.c49cntRes(0, 1), 1);            // inc esi @ 0x009bfacc
  assert.equal(w.c49cntRes(3, 1), 4);
  assert.equal(w.c49cntRes(3, 0), 3);
  assert.equal(w.c49cntRes(0xffffffff, 1) >>> 0, 0); // wrap
  assert.equal(w.c49lBegin(), 0);
  assert.equal(w.c49lEnd(), 4);
  assert.equal(w.c49stride(), 4);
  assert.equal(w.c49slotOfs(), 0x2c);
  assert.equal(w.c49stateOfs(), 0x3bc);
  assert.equal(w.c49linkOfs(), 0x1e68);
  assert.equal(w.c49indexOfs(), 0x161c);
  assert.equal(w.c49flag20a9Ofs(), 0x20a9);
  assert.equal(w.c49mgr() >>> 0, 0x00c71678);
  assert.equal(w.c49recv(), 0x1baa8);
  assert.equal(w.c49va() >>> 0, 0x009bfa70);
  assert.equal(w.c49firstRet() >>> 0, 0x009bfadd);
  assert.equal(w.c49ret() >>> 0, 0x009bfadd);
  assert.equal(w.c49int3() >>> 0, 0x009bfade);
  assert.equal(w.c49bytes(), 0x70);
  assert.equal(w.c49sites(), 4);
  assert.equal(w.c49site0() >>> 0, 0x006622bf);
  assert.equal(w.c49site1() >>> 0, 0x0066233d);
  assert.equal(w.c49site2() >>> 0, 0x008ef9c2);
  assert.equal(w.c49site3() >>> 0, 0x008efe49);
  assert.equal(w.c49nextVa() >>> 0, 0x009bfae0);

  // ---- ABI v50: 0x009ba980 PURE bit-0x10 getter
  // (PlayerManager::CoopBabiesOnly, EXACT ZHL 14 B; PURE 0 E8 / 0
  // stores; 7 insns / 2 rets; static — ignores ecx; reads
  // g_Game[0xc71678]+0x26548 challenge bitset bit 4 (0x10)).  ---
  assert.equal(w.c50flag(0), 0);                 // and eax,0x10 @ 0x9ba98b
  assert.equal(w.c50flag(0x10), 1);
  assert.equal(w.c50flag(0x100), 0);             // WIDE: bit 4 clear
  assert.equal(w.c50flag(0x110), 1);             // WIDE: bit 4 set
  assert.equal(w.c50flag(0x1ff), 1);             // WIDE: low byte ff, bit4 set
  assert.equal(w.c50flag(0xffffffff), 1);        // WIDE: bit 4 set
  assert.equal(w.c50flag(0x08), 0);              // bit 3 clear -> false
  assert.equal(w.c50true(), 1);                  // mov al,1 @ 0x9ba993
  assert.equal(w.c50false(), 0);                 // xor al,al @ 0x9ba996
  assert.equal(w.c50bitsetOfs(), 0x26548);
  assert.equal(w.c50bitsetMask(), 0x10);
  assert.equal(w.c50mgr() >>> 0, 0x00c71678);
  assert.equal(w.c50va() >>> 0, 0x009ba980);
  assert.equal(w.c50firstRet() >>> 0, 0x009ba995);
  assert.equal(w.c50ret() >>> 0, 0x009ba998);
  assert.equal(w.c50int3() >>> 0, 0x009ba999);
  assert.equal(w.c50bytes(), 0x19);
  assert.equal(w.c50sites(), 3);
  assert.equal(w.c50site0() >>> 0, 0x009bae7e);
  assert.equal(w.c50site1() >>> 0, 0x009bb081);
  assert.equal(w.c50site2() >>> 0, 0x009bb288);
  assert.equal(w.c50nextVa() >>> 0, 0x009ba9a0);

  let seed36 = 0x9be3e0;
  const next36 = () => {
    seed36 = (Math.imul(seed36, 1664525) + 1013904223) >>> 0;
    return seed36;
  };
  for (let k = 0; k < 256; k++) {
    const bgn = next36();
    const end = next36();
    const id = next36();
    const cnt = next36();
    const al = next36();
    const sd = next36();
    const s1 = next36();
    const s2 = next36();
    const s3 = next36();
    const st = next36();
    const ca = Math.fround((next36() >>> 8) / 16777215);
    const be = Math.fround((next36() >>> 8) / 16777215);
    const it = next36();
    const out = next36();
    const pp = next36();
    const cb = next36();
    const ce = next36();
    const cm1 = (cnt >>> 0) - 1;
    const i32id = id | 0;
    const i32cnt = cnt | 0;
    assert.equal(w.c36empty(bgn >>> 0, end >>> 0), rto9be3e0ListEmpty(bgn, end) ? 1 : 0, `9be3e0 rnd empty ${k}`);
    assert.equal(w.c36chk(pp >>> 0), rto9be3e0SlotCheckable(pp) ? 1 : 0, `9be3e0 rnd chk ${k}`);
    assert.equal(w.c36hit(al >>> 0), rto9be3e0HasCollectibleHit(al) ? 1 : 0, `9be3e0 rnd hit ${k}`);
    assert.equal(w.c36seed(sd >>> 0), rto9be3e0SeedAssertNeeded(sd) ? 1 : 0, `9be3e0 rnd seed ${k}`);
    assert.equal(w.c36xs(sd >>> 0, s1 >>> 0, s2 >>> 0, s3 >>> 0) >>> 0, rto9be3e0XorshiftState(sd, s1, s2, s3), `9be3e0 rnd xs ${k}`);
    assert.equal(w.c36f64(st >>> 0), rto9be3e0StateAsF64(st), `9be3e0 rnd f64 ${k}`);
    assert.equal(w.c36nf(st >>> 0), rto9be3e0NextFloat(st), `9be3e0 rnd nf ${k}`);
    assert.equal(w.c36buy(ca, be), rto9be3e0BestUpdateNeeded(ca, be) ? 1 : 0, `9be3e0 rnd buy ${k}`);
    assert.equal(w.c36walk(it >>> 0) >>> 0, rto9be3e0WalkNext(it), `9be3e0 rnd walk ${k}`);
    assert.equal(w.c36cont((it + 4) >>> 0, end >>> 0), rto9be3e0WalkContinue((it + 4) >>> 0, end) ? 1 : 0, `9be3e0 rnd cont ${k}`);
    assert.equal(w.c36out(out >>> 0), rto9be3e0OutPresent(out) ? 1 : 0, `9be3e0 rnd out ${k}`);
    assert.equal(w.c36win(pp >>> 0), rto9be3e0WinnerPresent(pp) ? 1 : 0, `9be3e0 rnd win ${k}`);
    assert.equal(w.c36neg(id >>> 0), rto9be3e0IdNegative(i32id) ? 1 : 0, `9be3e0 rnd neg ${k}`);
    assert.equal(w.c36ccount(ce >>> 0, cb >>> 0) | 0, rto9be3e0CollectibleCount(ce, cb) | 0, `9be3e0 rnd ccount ${k}`);
    assert.equal(w.c36oob(id >>> 0, cnt >>> 0), rto9be3e0IdOob(i32id, i32cnt) ? 1 : 0, `9be3e0 rnd oob ${k}`);
    assert.equal(w.c36log(id >>> 0, cnt >>> 0), rto9be3e0LogNeeded(i32id, i32cnt) ? 1 : 0, `9be3e0 rnd log ${k}`);
    assert.equal(w.c36cm1(cnt >>> 0) >>> 0, rto9be3e0CollectibleCountMinus1(i32cnt), `9be3e0 rnd cm1 ${k}`);
    assert.equal(w.c36clamp(id >>> 0, cm1) >>> 0, rto9be3e0CollectibleIndexClamp(id, cm1), `9be3e0 rnd clamp ${k}`);
    assert.equal(w.c36cptr(cb >>> 0, it >>> 0) >>> 0, rto9be3e0CollectibleEntryPtr(cb, it), `9be3e0 rnd cptr ${k}`);
    assert.equal(w.c36rPlayer(pp >>> 0) >>> 0, rto9be3e0ResultPlayer(pp), `9be3e0 rnd rPlayer ${k}`);
    assert.equal(w.c36zero() >>> 0, rto9be3e0StoreZeroValue(), `9be3e0 rnd zero ${k}`);
  }

  let seed37 = 0x9be530;
  const next37 = () => {
    seed37 = (Math.imul(seed37, 1664525) + 1013904223) >>> 0;
    return seed37;
  };
  for (let k = 0; k < 256; k++) {
    const bgn = next37();
    const end = next37();
    const p2c = next37();
    const b202c = next37();
    const b20a9 = next37();
    const d17e0 = next37();
    const sd = next37();
    const s1 = next37();
    const s2 = next37();
    const s3 = next37();
    const st = next37();
    const ca = Math.fround((next37() >>> 8) / 16777215);
    const be = Math.fround((next37() >>> 8) / 16777215);
    const it = next37();
    const pp = next37();
    assert.equal(w.c37empty(bgn >>> 0, end >>> 0), a9be530ListEmpty(bgn, end) ? 1 : 0, `9be530 rnd empty ${k}`);
    assert.equal(w.c37chk(p2c >>> 0), a9be530SlotCheckable(p2c) ? 1 : 0, `9be530 rnd chk ${k}`);
    assert.equal(w.c37f202c(b202c >>> 0), a9be530Flag202cCheckable(b202c) ? 1 : 0, `9be530 rnd f202c ${k}`);
    assert.equal(w.c37f20a9(b20a9 >>> 0), a9be530Flag20a9Checkable(b20a9) ? 1 : 0, `9be530 rnd f20a9 ${k}`);
    assert.equal(w.c37charge(d17e0 >>> 0), a9be530ChargeOk(d17e0) ? 1 : 0, `9be530 rnd charge ${k}`);
    assert.equal(w.c37seed(sd >>> 0), a9be530SeedAssertNeeded(sd) ? 1 : 0, `9be530 rnd seed ${k}`);
    assert.equal(w.c37xs(sd >>> 0, s1 >>> 0, s2 >>> 0, s3 >>> 0) >>> 0, a9be530XorshiftState(sd, s1, s2, s3), `9be530 rnd xs ${k}`);
    assert.equal(w.c37f64(st >>> 0), a9be530StateAsF64(st), `9be530 rnd f64 ${k}`);
    assert.equal(w.c37nf(st >>> 0), a9be530NextFloat(st), `9be530 rnd nf ${k}`);
    assert.equal(w.c37buy(ca, be), a9be530BestUpdateNeeded(ca, be) ? 1 : 0, `9be530 rnd buy ${k}`);
    assert.equal(w.c37walk(it >>> 0) >>> 0, a9be530WalkNext(it), `9be530 rnd walk ${k}`);
    assert.equal(w.c37cont((it + 4) >>> 0, end >>> 0), a9be530WalkContinue((it + 4) >>> 0, end) ? 1 : 0, `9be530 rnd cont ${k}`);
    assert.equal(w.c37rPlayer(pp >>> 0) >>> 0, a9be530ResultPlayer(pp), `9be530 rnd rPlayer ${k}`);
  }

  let seed38 = 0x9be630;
  const next38 = () => {
    seed38 = (Math.imul(seed38, 1664525) + 1013904223) >>> 0;
    return seed38;
  };
  for (let k = 0; k < 256; k++) {
    const bgn = next38();
    const end = next38();
    const p2c = next38();
    const b20a9 = next38();
    const slot = next38();
    const needle = next38();
    const it = next38();
    const pp = next38();
    assert.equal(w.c38empty(bgn >>> 0, end >>> 0), a9be630ListEmpty(bgn, end) ? 1 : 0, `9be630 rnd empty ${k}`);
    assert.equal(w.c38chk(p2c >>> 0), a9be630SlotCheckable(p2c) ? 1 : 0, `9be630 rnd chk ${k}`);
    assert.equal(w.c38f20a9(b20a9 >>> 0), a9be630Flag20a9Checkable(b20a9) ? 1 : 0, `9be630 rnd f20a9 ${k}`);
    assert.equal(w.c38match(slot >>> 0, needle >>> 0), a9be630SlotMatches(slot, needle) ? 1 : 0, `9be630 rnd match ${k}`);
    assert.equal(w.c38walk(it >>> 0) >>> 0, a9be630WalkNext(it), `9be630 rnd walk ${k}`);
    assert.equal(w.c38cont((it + 4) >>> 0, end >>> 0), a9be630WalkContinue((it + 4) >>> 0, end) ? 1 : 0, `9be630 rnd cont ${k}`);
    assert.equal(w.c38notFound(), a9be630ResultNotfound(), `9be630 rnd notFound ${k}`);
    assert.equal(w.c38found(pp >>> 0) >>> 0, a9be630ResultFound(pp), `9be630 rnd found ${k}`);
  }

  let seed40 = 0x9be750;
  const next40 = () => {
    seed40 = (Math.imul(seed40, 1664525) + 1013904223) >>> 0;
    return seed40;
  };
  for (let k = 0; k < 256; k++) {
    const tp = next40();
    const fb = next40();
    const bgn = next40();
    const end = next40();
    const p2c = next40();
    const acc = next40();
    const cnt = next40();
    const flag = next40();
    const tw = next40();
    const it = next40();
    const sm = next40();
    assert.equal(w.c40flag(tp >>> 0, fb >>> 0), gnc9be750TwinFlag(tp, fb) ? 1 : 0, `9be750 rnd flag ${k}`);
    assert.equal(w.c40empty(bgn >>> 0, end >>> 0), gnc9be750ListEmpty(bgn, end) ? 1 : 0, `9be750 rnd empty ${k}`);
    assert.equal(w.c40chk(p2c >>> 0), gnc9be750SlotCheckable(p2c) ? 1 : 0, `9be750 rnd chk ${k}`);
    assert.equal(w.c40add(acc >>> 0, cnt >>> 0) >>> 0, gnc9be750CountAdd(acc, cnt), `9be750 rnd add ${k}`);
    assert.equal(w.c40twin(flag >>> 0, tw >>> 0), gnc9be750TwinCallNeeded(flag, tw) ? 1 : 0, `9be750 rnd twin ${k}`);
    assert.equal(w.c40walk(it >>> 0) >>> 0, gnc9be750WalkNext(it), `9be750 rnd walk ${k}`);
    assert.equal(w.c40cont((it + 4) >>> 0, end >>> 0), gnc9be750WalkContinue((it + 4) >>> 0, end) ? 1 : 0, `9be750 rnd cont ${k}`);
    assert.equal(w.c40sum(sm >>> 0) >>> 0, gnc9be750ResultSum(sm), `9be750 rnd sum ${k}`);
  }
});











/* ---------------------------------------------------------------------------



 * Freestanding a1f280 residual pure-post plan (HostHandler future pin).



 * No Update residual kind wire â€” documentation + apply path only.



 * --------------------------------------------------------------------------- */







test("a1f280 residual plan: PE-order slots cover ready/fill/axis/action/rumble", () => {



  assert.equal(PROCESS_INPUT_RESIDUAL_PLAN_VERSION, 1);



  assert.equal(PROCESS_INPUT_RESIDUAL_PURE_ABI, PROCESS_INPUT_PURE_ABI_VERSION);



  assert.equal(A1F280_PURE_POSTS_PE_ORDER.length, 8);



  assert.deepEqual(



    A1F280_PURE_POSTS_PE_ORDER.map((r) => r.slot),



    [



      "A1F280_BUFFER_CLEAR",



      "A1F280_READY_GATE",



      "A1F280_FILL_PAIR0",



      "A1F280_AXIS_PAIR0",



      "A1F280_FILL_PAIR1",



      "A1F280_AXIS_PAIR1",



      "A1F280_ACTION_QUERY",



      "A1F280_RUMBLE",



    ],



  );



  assert.deepEqual(A1F280_PURE_POSTS_PE_ORDER[1].posts, [



    "ready_vcall_ok",



    "ready_early_return",



    "ready_vtbl_slot",



    "ready_call_va",



  ]);



  assert.deepEqual(A1F280_PURE_POSTS_PE_ORDER[2].posts.slice(0, 2), [



    "fill_vcall_ok",



    "fill_pair0_arg",



  ]);



  assert.ok(A1F280_PURE_POSTS_PE_ORDER[5].posts.includes("dir_bits_merge"));



  assert.ok(A1F280_PURE_POSTS_PE_ORDER[5].posts.includes("axis_fill_call_va"));



  assert.ok(



    A1F280_PURE_HELPER_NAMES.includes("managerPollA1f280ReadyVcallOk"),



  );



  assert.ok(



    A1F280_PURE_HELPER_NAMES.includes("managerPollA1f280FillVcallOk"),



  );



  assert.ok(



    A1F280_PURE_HELPER_NAMES.includes("managerPollA1f280DirBitsMerge"),



  );



  assert.equal(



    A1F280_PURE_HELPER_BY_POST.ready_vcall_ok,



    "managerPollA1f280ReadyVcallOk",



  );



  assert.equal(



    A1F280_PURE_HELPER_BY_POST.fill_vcall_ok,



    "managerPollA1f280FillVcallOk",



  );



  assert.equal(



    A1F280_PURE_HELPER_BY_POST.axis_fill_call_va,



    "managerPollA1f280AxisFillCallVa",



  );







  const doc = a1f280PurePostsInterleaveDoc();



  assert.equal(doc.length, 8);



  assert.deepEqual(doc[1].pureHelpers, [



    "managerPollA1f280ReadyVcallOk",



    "managerPollA1f280ReadyEarlyReturn",



    "managerPollA1f280ReadyVtblSlot",



    "managerPollA1f280ReadyCallVa",



  ]);







  const vas = a1f280HostVas();



  assert.equal(vas.entry >>> 0, A1F280_HOST_VA_ENTRY >>> 0);



  assert.equal(vas.ready >>> 0, A1F280_HOST_VA_READY >>> 0);



  assert.equal(vas.fillPair1 >>> 0, A1F280_HOST_VA_FILL_PAIR1 >>> 0);



  assert.equal(vas.axisPair1 >>> 0, A1F280_HOST_VA_AXIS_PAIR1 >>> 0);



  assert.equal(vas.actionQuery >>> 0, A1F280_HOST_VA_ACTION_QUERY >>> 0);



  assert.equal(vas.vtbl.ready >>> 0, 0x78);



  assert.equal(vas.vtbl.fill >>> 0, 0x80);



  assert.equal(vas.vtbl.axisFill >>> 0, 0x7c);



  assert.equal(vas.vtbl.actionQuery >>> 0, 0x3c);







  assert.equal(PROCESS_INPUT_A1F280_RESIDUAL_NOTE.updateHostHandlerWired, false);



  assert.equal(PROCESS_INPUT_A1F280_RESIDUAL_NOTE.processInputPinned, false);



  assert.equal(PROCESS_INPUT_A1F280_RESIDUAL_NOTE.pureRootId, "processInput");



  assert.equal(PROCESS_INPUT_A1F280_RESIDUAL_NOTE.futureHostKind, "processInputA1f280");



  assert.equal(



    PROCESS_INPUT_A1F280_RESIDUAL_NOTE.nextHostVa >>> 0,



    A1F280_HOST_VA_READY >>> 0,



  );



});







test("a1f280 residual plan: doc-only event has no samples; monolithic plan", () => {



  const docOnly = a1f280PurePostsFromEvent({});



  assert.equal(docOnly.purePostsFromSamples, false);



  assert.equal(docOnly.purePostsApplied, null);



  assert.equal(docOnly.purePostsPeOrder.length, 8);



  assert.deepEqual(docOnly.pureHelperNames, [...A1F280_PURE_HELPER_NAMES]);



  assert.equal(docOnly.residualKind, A1F280_RESIDUAL_MONOLITHIC);



  assert.equal(docOnly.pureComplete, 0);



  assert.equal(docOnly.processInputPinned, false);



  assert.equal(docOnly.futureHostKind, "processInputA1f280");



  assert.equal(a1f280ResidualLabel(docOnly), "a1f280-monolithic-host");







  const plan = a1f280ResidualPlan({});



  assert.equal(plan.residualKind, A1F280_RESIDUAL_MONOLITHIC);



  assert.equal(plan.needsReadyHost, true);



  assert.equal(plan.pureComplete, false);



});







test("a1f280 residual plan: ready early-return pure-complete", () => {



  const applied = applyA1f280VcallGatePurePosts({ readyAl: 0 });



  assert.equal(applied.length, 1);



  assert.equal(applied[0].slot, "A1F280_READY_GATE");



  assert.equal(applied[0].readyOk, 0);



  assert.equal(applied[0].readyEarlyReturn, 1);



  assert.equal(applied[0].readyCallVa >>> 0, A1F280_HOST_VA_READY >>> 0);







  const plan = a1f280ResidualPlan({ readyAl: 0 });



  assert.equal(plan.residualKind, A1F280_RESIDUAL_NONE);



  assert.equal(plan.pureComplete, true);



  assert.equal(plan.earlyReturn, true);



  assert.equal(plan.needsFillAxisHost, false);



  assert.equal(a1f280ResidualLabel(plan), "a1f280-ready-early-pure-complete");







  const fromEvent = a1f280PurePostsFromEvent({ readyAl: 0 });



  assert.equal(fromEvent.purePostsFromSamples, true);



  assert.equal(fromEvent.pureComplete, 1);



  assert.equal(fromEvent.residualKind, A1F280_RESIDUAL_NONE);



  assert.equal(fromEvent.purePostsApplied.length, 1);



});







test("a1f280 residual plan: ready ok + fill/axis pure posts", () => {



  const samples = {



    readyAl: 1,



    fillPair0Al: 1,



    fillPair1Al: 1,



    pair0: { x: -0.9, y: 0.9, dirThresh: 0.2, priorDirBits: 0 },



    pair1: { x: 0.5, y: -0.5, dirThresh: 0.1, priorDirBits: 0x0f },



    modeCc: 4, // idle â†’ action query not needed



    bufferEnd14: 0x100,



    bufferBegin10: 0x80,



    flagsByte8: 0x8, // rumble suppress



    timer: 0,



  };



  const applied = applyA1f280VcallGatePurePosts(samples);



  const slots = applied.map((r) => r.slot);



  assert.ok(slots.includes("A1F280_BUFFER_CLEAR"));



  assert.ok(slots.includes("A1F280_READY_GATE"));



  assert.ok(slots.includes("A1F280_FILL_PAIR0"));



  assert.ok(slots.includes("A1F280_AXIS_PAIR0"));



  assert.ok(slots.includes("A1F280_FILL_PAIR1"));



  assert.ok(slots.includes("A1F280_AXIS_PAIR1"));



  assert.ok(slots.includes("A1F280_ACTION_QUERY"));



  assert.ok(slots.includes("A1F280_RUMBLE"));







  const ready = applied.find((r) => r.slot === "A1F280_READY_GATE");



  assert.equal(ready.readyOk, 1);



  assert.equal(ready.readyEarlyReturn, 0);







  const axis1 = applied.find((r) => r.slot === "A1F280_AXIS_PAIR1");



  const expectedMerge = managerPollA1f280DirBitsMerge(



    0x0f,



    0.5,



    -0.5,



    0.1,



    4,



  );



  assert.equal(axis1.dirBitsMerged >>> 0, expectedMerge >>> 0);



  assert.equal(axis1.axisFillCallVa >>> 0, A1F280_HOST_VA_AXIS_PAIR1 >>> 0);







  const action = applied.find((r) => r.slot === "A1F280_ACTION_QUERY");



  assert.equal(action.actionQueryNeeded, 0);



  assert.equal(



    action.actionQueryNeeded,



    managerPollA1f280ActionQueryVcallNeeded(4) ? 1 : 0,



  );







  const rumble = applied.find((r) => r.slot === "A1F280_RUMBLE");



  assert.equal(rumble.rumblePathNeeded, 0);







  const plan = a1f280ResidualPlan(samples);



  assert.equal(plan.readyOk, true);



  assert.equal(plan.needsReadyHost, false);



  assert.equal(plan.needsFillAxisHost, true);



  assert.equal(plan.needsActionQueryHost, false);



  assert.equal(plan.needsRumbleHost, false);



  assert.equal(plan.residualKind, A1F280_RESIDUAL_FILL_AXIS);



  assert.equal(a1f280ResidualLabel(plan), "a1f280-fill-axis-host");







  // fill_ok false skips axis pure posts for that pair



  const skipAxis = applyA1f280VcallGatePurePosts({



    readyAl: 1,



    fillPair0Al: 0,



    fillPair1Al: 0,



  });



  assert.equal(managerPollA1f280FillVcallOk(0), false);



  assert.ok(!skipAxis.some((r) => r.slot === "A1F280_AXIS_PAIR0"));



  assert.ok(!skipAxis.some((r) => r.slot === "A1F280_AXIS_PAIR1"));



});







test("a1f280 residual plan: sample aliases + normalize", () => {



  const n = normalizeA1f280GateSamples({



    gateSamples: {



      ready_al: 0xff,



      fill_pair1_al: 1,



      mode_cc: 3,



      axis1: { axisX: 1, axisY: -1, thresh: 0.25 },



    },



  });



  assert.ok(n);



  assert.equal(n.readyAl, 0xff);



  assert.equal(n.fillPair1Al, 1);



  assert.equal(n.modeCc, 3);



  assert.equal(n.pair1.x, Math.fround(1));



  assert.equal(n.pair1.dirThresh, Math.fround(0.25));







  assert.equal(normalizeA1f280GateSamples(null), null);



  assert.equal(normalizeA1f280GateSamples([]), null);



  assert.equal(normalizeA1f280GateSamples({}), null);







  // Ready sample missing but other fields present â†’ READY_VCALL residual kind



  const plan = a1f280ResidualPlan({ modeCc: 0, fillPair1Al: 1 });



  assert.equal(plan.residualKind, A1F280_RESIDUAL_READY_VCALL);



  assert.equal(plan.needsReadyHost, true);



  assert.equal(a1f280ResidualLabel(plan), "a1f280-ready-host");



});



test("JS oracle: 9be140 RandomCollectibleOwner islands (ABI v34)", () => {



  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 34);



  // List-empty: full dword compare (0x009be16f).



  assert.equal(rco9be140ListEmpty(0, 0), true);



  assert.equal(rco9be140ListEmpty(0, 4), false);



  assert.equal(rco9be140ListEmpty(0xffffffff, 0xffffffff), true);



  // Slot checkable: [player+0x2c] == 0 (full dword, 0x009be187).



  assert.equal(rco9be140SlotCheckable(0), true);



  assert.equal(rco9be140SlotCheckable(1), false);



  assert.equal(rco9be140SlotCheckable(0x10000000), false);



  // HasCollectible hit: LOW BYTE only (test al,al 0x009be197).  Mutant: full-word.



  assert.equal(rco9be140HasCollectibleHit(0x100), false);



  assert.equal(rco9be140HasCollectibleHit(0x1ff), true);



  assert.equal(rco9be140HasCollectibleHit(0xff), true);



  assert.equal(rco9be140HasCollectibleHit(0), false);



  // Seed assert: FULL dword zero test (0x009be19e) -> assert log + trap.



  assert.equal(rco9be140SeedAssertNeeded(0), true);



  assert.equal(rco9be140SeedAssertNeeded(1), false);



  assert.equal(rco9be140SeedAssertNeeded(0x80000000), false);



  // Xorshift: shift counts are (byte & 0x1f) from the table dwords.



  assert.equal(rco9be140XorshiftState(0x12345678, 3, 5, 20), ((()=>{let t1=(0x12345678^(0x12345678>>>3))>>>0;let t2=(t1^(t1<<5))>>>0;return (t2^(t2>>>20))>>>0;})()));



  // Mutant: unmasked shift count 32 would shift-by-zero -> identical; 33 -> differ.

  // The shift count is the LOW BYTE masked to 5 bits by the hardware

  assert.equal(rco9be140XorshiftState(0x13579bdf, 33, 5, 20), rco9be140XorshiftState(0x13579bdf, 1, 5, 20)); // cl masks 33 -> 1



  // NextFloat: (u32 as f64 -> f32) * 2^-32f, f32 rounding each step.



  assert.equal(rco9be140NextFloat(0), 0);



  assert.equal(rco9be140NextFloat(0xffffffff), 0.9999998807907104);



  assert.equal(rco9be140NextFloat(0x80000000), 0.4999999403953552);



  assert.equal(rco9be140NextFloat(1), Math.fround(2.3283061589829401e-10));



  // Best-update: ordered candidate > best; NaN keeps old (comiss jbe).



  assert.equal(rco9be140BestUpdateNeeded(2, 1), true);



  assert.equal(rco9be140BestUpdateNeeded(1, 2), false);



  assert.equal(rco9be140BestUpdateNeeded(1, 1), false);



  assert.equal(rco9be140BestUpdateNeeded(Number.NaN, 1), false);



  assert.equal(rco9be140BestUpdateNeeded(1, Number.NaN), false);



  // Walk: stride 4 wrap; bound re-read full dword.



  assert.equal(rco9be140WalkNext(0), 4);



  assert.equal(rco9be140WalkNext(0xfffffffc), 0);



  assert.equal(rco9be140WalkContinue(4, 4), false);



  assert.equal(rco9be140WalkContinue(4, 8), true);



  // Out/winner present: full dword.



  assert.equal(rco9be140OutPresent(0), false);



  assert.equal(rco9be140OutPresent(1), true);



  assert.equal(rco9be140WinnerPresent(0), false);



  assert.equal(rco9be140WinnerPresent(0x80000000), true);



  // id<0: SIGNED (jns 0x009be223) -> fixed-out path.



  assert.equal(rco9be140IdNegative(-1), true);



  assert.equal(rco9be140IdNegative(0x80000000), true);



  assert.equal(rco9be140IdNegative(1), false);



  assert.equal(rco9be140IdNegative(0x7fffffff), false);



  // Count: (end-begin) SAR 4, 32-bit wrap (0x009be240).



  assert.equal(rco9be140CollectibleCount(0x40, 0), 4);



  assert.equal(rco9be140CollectibleCount(0, 0x40), -4);



  // oob: SIGNED id >= count (0x009be24b) -> assert log, flow continues.



  assert.equal(rco9be140CollectibleIdOob(2, 2), true);



  assert.equal(rco9be140CollectibleIdOob(1, 2), false);



  assert.equal(rco9be140CollectibleIdOob(-1, 2), false);



  assert.equal(rco9be140CollectibleIdOob(0x80000000, 0), true);



  // Clamp: count-1 wrap-safe; UNSIGNED below (cmovb 0x009be272).



  assert.equal(rco9be140CollectibleCountMinus1(0), 0xffffffff);



  assert.equal(rco9be140CollectibleCountMinus1(5), 4);



  assert.equal(rco9be140CollectibleIndexClamp(9, 4), 4);



  assert.equal(rco9be140CollectibleIndexClamp(3, 4), 3);



  assert.equal(rco9be140CollectibleIndexClamp(0x80000000, 4), 4);



  // Entry ptr: base + index*16 wrap (shl 4).



  assert.equal(rco9be140CollectibleEntryPtr(0x1000, 2), 0x1020);



  assert.equal(rco9be140CollectibleEntryPtr(0xfffffff0, 1), 0);



  // Constants.



  assert.equal(rco9be140NextVa(), 0x009be2a0);



  assert.equal(rco9be140ScaleValue(), Math.fround(2.3283061589829401e-10));



  assert.equal(rco9be140BestInitValue(), -1);



});

test("JS oracle: 9be2a0 RNG**-variant sibling islands (ABI v35)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 35);

  // Players count: SAR32(end-begin,2), signed wrap (0x009be2bf..0x009be2c3).
  assert.equal(a9be2a0PlayersCount(0, 0), 0);
  assert.equal(a9be2a0PlayersCount(4, 0), 1);
  assert.equal(a9be2a0PlayersCount(0, 4), -1);

  // 15-bit id mask (0x009be2c6 and ecx,0x7fff).
  assert.equal(a9be2a0IdMask15(0), 0);
  assert.equal(a9be2a0IdMask15(0x7fff), 0x7fff);
  assert.equal(a9be2a0IdMask15(0x8000), 0);
  assert.equal(a9be2a0IdMask15(0xffffffff), 0x7fff);

  // Direct index range: SIGNED jge (0x009be2cf/0x009be2d1) -> OOR.
  assert.equal(a9be2a0DirectIndexOor(0, 4), false);
  assert.equal(a9be2a0DirectIndexOor(3, 4), false);
  assert.equal(a9be2a0DirectIndexOor(4, 4), true);
  assert.equal(a9be2a0DirectIndexOor(0xffffffff, 4), false); // signed -1 < 4
  assert.equal(a9be2a0DirectIndexOor(0x80000000, 0), false); // signed: -2^31 < 0, jge not taken

  // Direct slot ptr: begin + maskedId*4, wrap (0x009be2d3).
  assert.equal(a9be2a0DirectPlayerPtr(0x1000, 2), 0x1008);
  assert.equal(a9be2a0DirectPlayerPtr(0xffffffff, 1), 3);

  // Twin flag: arg3 byte && player && bit31 of [player+0xb8]
  // (0x009be2da..0x009be2f8).  Byte gate: 0x100 is false.
  assert.equal(a9be2a0TwinFlag(0, 1, 0x80000000), false);
  assert.equal(a9be2a0TwinFlag(0x100, 1, 0x80000000), false);
  assert.equal(a9be2a0TwinFlag(1, 0, 0x80000000), false);
  assert.equal(a9be2a0TwinFlag(1, 1, 0), false);
  assert.equal(a9be2a0TwinFlag(1, 1, 0x80000000), true);
  assert.equal(a9be2a0TwinFlag(0x1ff, 1, 0x80000000), true);

  // Walk gates identical shape to FCO/RCO (this PE re-derivation).
  assert.equal(a9be2a0ListEmpty(0, 0), true);
  assert.equal(a9be2a0ListEmpty(0, 4), false);
  assert.equal(a9be2a0ListEmpty(0xffffffff, 0xffffffff), true);
  assert.equal(a9be2a0SlotCheckable(0), true);
  assert.equal(a9be2a0SlotCheckable(1), false);
  assert.equal(a9be2a0SlotCheckable(0x10000000), false);
  assert.equal(a9be2a0HasCollectibleHit(0), false);
  assert.equal(a9be2a0HasCollectibleHit(0x100), false);
  assert.equal(a9be2a0HasCollectibleHit(0x1ff), true);
  assert.equal(a9be2a0TwinCheckNeeded(0, 1), false);
  assert.equal(a9be2a0TwinCheckNeeded(0x100, 1), true);
  assert.equal(a9be2a0TwinCheckNeeded(1, 0), false);
  assert.equal(a9be2a0TwinCheckNeeded(1, 1), true);
  assert.equal(a9be2a0WalkNext(0), 4);
  assert.equal(a9be2a0WalkNext(0xffffffff), 3);
  assert.equal(a9be2a0WalkContinue(4, 4), false);
  assert.equal(a9be2a0WalkContinue(4, 8), true);
  assert.equal(a9be2a0OutPresent(0), false);
  assert.equal(a9be2a0OutPresent(1), true);
  assert.equal(a9be2a0OutPresent(0x80000000), true);

  // Player-hit arm: id<0 SIGNED (js 0x009be386).
  assert.equal(a9be2a0IdNegative(0), false);
  assert.equal(a9be2a0IdNegative(1), false);
  assert.equal(a9be2a0IdNegative(-1), true);
  assert.equal(a9be2a0IdNegative(0x80000000), true);
  assert.equal(a9be2a0IdNegative(0x7fffffff), false);

  // Collect count: SAR32(end-begin,4) (0x009be38e..0x009be394).
  assert.equal(a9be2a0CollectCount(0x40, 0), 4);
  assert.equal(a9be2a0CollectCount(0, 0x40), -4);

  // OOB: SIGNED id >= count (jl 0x009be399); combined log gate.
  assert.equal(a9be2a0IdOob(2, 2), true);
  assert.equal(a9be2a0IdOob(1, 2), false);
  assert.equal(a9be2a0IdOob(-1, 2), false);
  assert.equal(a9be2a0IdOob(0x80000000, 0), false); // signed -2^31 < 0
  assert.equal(a9be2a0LogNeeded(-1, 2), true);
  assert.equal(a9be2a0LogNeeded(2, 2), true);
  assert.equal(a9be2a0LogNeeded(1, 2), false);
  assert.equal(a9be2a0LogNeeded(0x80000000, 1), true);

  // Clamp: sbb/and idiom == UNSIGNED min(id, count-1) (0x009be3be..c6).
  assert.equal(a9be2a0CollectCountMinus1(0), 0xffffffff);
  assert.equal(a9be2a0CollectCountMinus1(5), 4);
  assert.equal(a9be2a0CollectIndexClamp(9, 4), 4);
  assert.equal(a9be2a0CollectIndexClamp(3, 4), 3);
  assert.equal(a9be2a0CollectIndexClamp(0x80000000, 4), 4);
  assert.equal(a9be2a0CollectIndexClamp(0, 4), 0);

  // Entry ptr: base + index*16 wrap (0x009be3c9..cc).
  assert.equal(a9be2a0CollectEntryPtr(0x1000, 2), 0x1020);
  assert.equal(a9be2a0CollectEntryPtr(0xfffffff0, 1), 0);

  // Results: twin-hit / not-found / player-hit / *out zero store.
  assert.equal(a9be2a0TwinResult(0x9abcdef0), 0x9abcdef0);
  assert.equal(a9be2a0ResultNotFound(), 0);
  assert.equal(a9be2a0ResultPlayer(0x12345678), 0x12345678);
  assert.equal(a9be2a0StoreZeroValue(), 0);

  // Constants.
  assert.equal(a9be2a0NextVa(), 0x009be3e0);
  assert.equal(a9be2a0PlayersBeginOfs(), 0x2a410);
  assert.equal(a9be2a0PlayersEndOfs(), 0x2a414);
  assert.equal(a9be2a0CollectBeginOfs(), 0x177c);
  assert.equal(a9be2a0CollectEndOfs(), 0x1780);
  assert.equal(a9be2a0HasCollectibleVa(), 0x00771550);
  assert.equal(a9be2a0TwinGetVa(), 0x0065cf80);
  assert.equal(a9be2a0OobMsgVa(), 0x00b64a88);
});

test("JS oracle: 9be3e0 RandomTrinketOwner islands (ABI v36)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 36);

  // Empty gate: cmp esi,[this+4] / je tail (0x009be3f9 / 0x009be418).
  assert.equal(rto9be3e0ListEmpty(0, 0), true);
  assert.equal(rto9be3e0ListEmpty(0, 4), false);
  assert.equal(rto9be3e0ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate: FULL dword [player+0x2c] == 0 (0x009be423).
  assert.equal(rto9be3e0SlotCheckable(0), true);
  assert.equal(rto9be3e0SlotCheckable(1), false);
  assert.equal(rto9be3e0SlotCheckable(0x10000000), false);

  // HasCollectible hit: RAW uint32 al byte (0x009be437) — 0x100 is false.
  assert.equal(rto9be3e0HasCollectibleHit(0), false);
  assert.equal(rto9be3e0HasCollectibleHit(0x100), false);
  assert.equal(rto9be3e0HasCollectibleHit(0x1ff), true);
  assert.equal(rto9be3e0HasCollectibleHit(0xffffffff), true);

  // Seed assert: FULL dword seed==0 (0x009be43e) -> log + int3.
  assert.equal(rto9be3e0SeedAssertNeeded(0), true);
  assert.equal(rto9be3e0SeedAssertNeeded(1), false);
  assert.equal(rto9be3e0SeedAssertNeeded(0x80000000), false);

  // xorshift32 (0x009be455..0x009be46e); shifts 3/5/20 PE-verified.
  assert.equal(rto9be3e0XorshiftState(0x12345678, 3, 5, 20), 0x1e294bb5);
  assert.equal(rto9be3e0XorshiftState(0x13579bdf, 33, 5, 20),
               rto9be3e0XorshiftState(0x13579bdf, 1, 5, 20)); // cl masks 33 -> 1
  assert.equal(rto9be3e0XorshiftState(0xffffffff, 3, 5, 20), 0xe0000e00);

  // Draw -> [0,1) float with the VERIFIED PE scale 0x2f7ffffe.
  assert.equal(rto9be3e0StateAsF64(0), 0);
  assert.equal(rto9be3e0StateAsF64(1), 1);
  assert.equal(rto9be3e0StateAsF64(0xffffffff), 4294967295);
  assert.equal(rto9be3e0NextFloat(0), 0);
  assert.equal(rto9be3e0NextFloat(1), Math.fround(2.3283061589829401e-10));
  assert.equal(rto9be3e0NextFloat(0x80000000), 0.4999999403953552);
  assert.equal(rto9be3e0NextFloat(0xffffffff), 0.9999998807907104);
  assert.equal(rto9be3e0BestUpdateNeeded(2, 1), true);
  assert.equal(rto9be3e0BestUpdateNeeded(1, 2), false);
  assert.equal(rto9be3e0BestUpdateNeeded(1, 1), false);
  assert.equal(rto9be3e0BestUpdateNeeded(Number.NaN, 1), false);
  assert.equal(rto9be3e0BestUpdateNeeded(1, Number.NaN), false);

  // Walk gates (0x009be4ae / 0x009be4b1), bound re-read per iteration.
  assert.equal(rto9be3e0WalkNext(0), 4);
  assert.equal(rto9be3e0WalkNext(0xfffffffc), 0);
  assert.equal(rto9be3e0WalkNext(0xffffffff), 3);
  assert.equal(rto9be3e0WalkContinue(4, 4), false);
  assert.equal(rto9be3e0WalkContinue(4, 8), true);

  // Tail gates: out present (0x009be4bd) / winner present (0x009be4c1).
  assert.equal(rto9be3e0OutPresent(0), false);
  assert.equal(rto9be3e0OutPresent(1), true);
  assert.equal(rto9be3e0OutPresent(0x80000000), true);
  assert.equal(rto9be3e0WinnerPresent(0), false);
  assert.equal(rto9be3e0WinnerPresent(0x80000000), true);

  // Player-hit arm: id<0 SIGNED js 0x009be4c7 — logs, then clamps (NO v34
  // fixed-out arm).
  assert.equal(rto9be3e0IdNegative(0), false);
  assert.equal(rto9be3e0IdNegative(1), false);
  assert.equal(rto9be3e0IdNegative(-1), true);
  assert.equal(rto9be3e0IdNegative(0x80000000), true);
  assert.equal(rto9be3e0IdNegative(0x7fffffff), false);

  // Collect count: SAR32(end-begin,4) of [p+0x1780]-[p+0x177c].
  assert.equal(rto9be3e0CollectibleCount(0x40, 0), 4);
  assert.equal(rto9be3e0CollectibleCount(0, 0x40), -4);

  // OOB: SIGNED id >= count (jl 0x009be4da); combined log gate.
  assert.equal(rto9be3e0IdOob(2, 2), true);
  assert.equal(rto9be3e0IdOob(1, 2), false);
  assert.equal(rto9be3e0IdOob(-1, 2), false);
  assert.equal(rto9be3e0IdOob(0x80000000, 0), false); // signed: -2^31 < 0
  assert.equal(rto9be3e0LogNeeded(-1, 2), true);
  assert.equal(rto9be3e0LogNeeded(2, 2), true);
  assert.equal(rto9be3e0LogNeeded(1, 2), false);
  assert.equal(rto9be3e0LogNeeded(0x80000000, 1), true);

  // Clamp: sbb/and idiom == UNSIGNED min(id, count-1) (0x009be4ff..509).
  // 0xffffffff (id = -1) clamps to count-1 — the v36 (no fixed-out) shape.
  assert.equal(rto9be3e0CollectibleCountMinus1(0), 0xffffffff);
  assert.equal(rto9be3e0CollectibleCountMinus1(5), 4);
  assert.equal(rto9be3e0CollectibleIndexClamp(9, 4), 4);
  assert.equal(rto9be3e0CollectibleIndexClamp(3, 4), 3);
  assert.equal(rto9be3e0CollectibleIndexClamp(0x80000000, 4), 4);
  assert.equal(rto9be3e0CollectibleIndexClamp(0, 4), 0);
  assert.equal(rto9be3e0CollectibleIndexClamp(0xffffffff, 4), 4);

  // Entry ptr: base + index*16 wrap (0x009be50e..511).
  assert.equal(rto9be3e0CollectibleEntryPtr(0x1000, 2), 0x1020);
  assert.equal(rto9be3e0CollectibleEntryPtr(0xfffffff0, 1), 0);

  // Results / *out zero store.
  assert.equal(rto9be3e0ResultPlayer(0x12345678), 0x12345678);
  assert.equal(rto9be3e0StoreZeroValue(), 0);

  // Constants (all PE-verified this unit).
  assert.equal(rto9be3e0NextVa(), 0x009be530);
  assert.equal(rto9be3e0Va(), 0x009be3e0);
  assert.equal(rto9be3e0RetVa(), 0x009be52a);
  assert.equal(rto9be3e0FirstRetVa(), 0x009be51b);
  assert.equal(rto9be3e0Int3Va(), 0x009be52d);
  assert.equal(rto9be3e0BodyBytes(), 0x14d);
  assert.equal(rto9be3e0Sites(), 10);
  assert.equal(rto9be3e0ListBeginOfs(), 0);
  assert.equal(rto9be3e0ListEndOfs(), 4);
  assert.equal(rto9be3e0CollectBeginOfs(), 0x177c);
  assert.equal(rto9be3e0CollectEndOfs(), 0x1780);
  assert.equal(rto9be3e0SeedAssertMsgVa(), 0x00b6bf54);
  assert.equal(rto9be3e0OobAssertMsgVa(), 0x00b64a88);
  assert.equal(rto9be3e0AssertTrapVa(), 0x009be451);
  assert.equal(rto9be3e0HasCollectibleVa(), 0x00771550);
  assert.equal(rto9be3e0RngShiftTableVa(), 0x00b1f5d0);
  assert.equal(rto9be3e0RngShift1(), 3);
  assert.equal(rto9be3e0RngShift2(), 5);
  assert.equal(rto9be3e0RngShift3(), 20);
  assert.equal(rto9be3e0BestInitBits(), 0xbf800000);
  assert.equal(rto9be3e0ScaleBits(), 0x2f7ffffe);
  assert.equal(rto9be3e0SignCorrTableVa(), 0x00bacb00);
  assert.equal(rto9be3e0BestInitValue(), -1);
  assert.equal(rto9be3e0ScaleValue(), Math.fround(2.3283061589829401e-10));
});

/* ---------------------------------------------------------------------------
 * ABI v37 -- 0x009be530: address-stable RCO/RTO-family sibling.  Full-body
 * reference transcribed branch-by-branch from the 0x009be530 instruction
 * stream (independent of every law export above; seed==0 towers into the
 * draw with state 0 — the int3 trap is a host boundary, the fall-through
 * code is PE-real).
 * ------------------------------------------------------------------------- */
function p9be530BodyRef(begin, end, seed, players) {
  // players[i] = { p2c, b202c, b20a9, d17e0, ptr }
  let iter = begin >>> 0;
  let best = -1.0; // movss [0xbaad50] best init
  let winner = 0; // xor eax,eax winner local
  let state = seed >>> 0; // ebx
  // 0x009be56b cmp esi,[this+4] / 0x009be56e je epilogue (FULL dword)
  if ((iter >>> 0) === (end >>> 0)) return 0;
  for (;;) {
    const p = players[((iter - begin) >>> 0) >>> 2];
    // 0x009be582 cmp dword [p+0x2c],0 / jne skip
    // 0x009be58c cmp byte [p+0x202c],0 / jne skip
    // 0x009be599 cmp byte [p+0x20a9],0 / jne skip
    // 0x009be5a2 cmp dword [p+0x17e0],3 / jl skip  (SIGNED)
    const pass =
      (p.p2c >>> 0) === 0 &&
      (p.b202c & 0xff) === 0 &&
      (p.b20a9 & 0xff) === 0 &&
      (p.d17e0 | 0) >= 3;
    if (pass) {
      // 0x009be5ab test ebx,ebx / 0x009be5ad jne draw (assert host edge
      // a112c0(0x10,0xb6bf54)+int3; draw continues with state 0)
      // 0x009be5c4..0x009be5dd xorshift32 3/5/20 (cl-masked)
      let t1 = state ^ (state >>> 3);
      let t2 = t1 ^ ((t1 << 5) >>> 0);
      state = (t2 ^ (t2 >>> 20)) >>> 0;
      // (double)u32 -> (float) * scale 0x2f7ffffe
      const cand = Math.fround(Math.fround(Number(state >>> 0)) *
                               f32FromBits(A9BE530_SCALE_BITS));
      // 0x009be604 comiss cand,best / 0x009be607 jbe keep-old
      if (cand > best) {
        best = cand; // 0x009be609 movaps
        winner = p.ptr >>> 0; // 0x009be60c mov eax,edi
      }
    }
    iter = (iter + 4) >>> 0; // 0x009be61b add esi,4
    // 0x009be61e cmp esi,[ecx+4] / 0x009be621 jne loop (bound re-read)
    if ((iter >>> 0) === (end >>> 0)) break;
  }
  return winner >>> 0; // eax = winner local
}

/* The law composition used by the oracle (advance state per passing
   candidate, in list order, keeping the strict-max winner). */
function p9be530Laws(begin, end, seed, players) {
  let iter = begin >>> 0;
  let best = -1.0;
  let winner = 0;
  let state = seed >>> 0;
  if (!a9be530ListEmpty(iter, end)) {
    for (;;) {
      const p = players[((iter - begin) >>> 0) >>> 2];
      if (a9be530SlotCheckable(p.p2c) &&
          a9be530Flag202cCheckable(p.b202c) &&
          a9be530Flag20a9Checkable(p.b20a9) &&
          a9be530ChargeOk(p.d17e0)) {
        state = a9be530XorshiftState(state, 3, 5, 20);
        const cand = a9be530NextFloat(state);
        if (a9be530BestUpdateNeeded(cand, best)) {
          best = cand;
          winner = p.ptr >>> 0;
        }
      }
      iter = a9be530WalkNext(iter);
      if (!a9be530WalkContinue(iter, end)) break;
    }
  }
  return a9be530ResultPlayer(winner);
}

test("JS oracle: 9be530 RCO-family sibling islands (ABI v37)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 37);

  // Empty gate: cmp esi,[this+4] / je epilogue (0x009be56b).  FULL dword.
  assert.equal(a9be530ListEmpty(0, 0), true);
  assert.equal(a9be530ListEmpty(0, 4), false);
  assert.equal(a9be530ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate: FULL dword [player+0x2c] == 0 (0x009be582).
  assert.equal(a9be530SlotCheckable(0), true);
  assert.equal(a9be530SlotCheckable(1), false);
  assert.equal(a9be530SlotCheckable(0x10000000), false);

  // Low-byte gates [p+0x202c] / [p+0x20a9] == 0 (0x009be58c / 0x009be599):
  // RAW uint32, low byte — 0x100 has a 0 low byte so it PASSES.
  assert.equal(a9be530Flag202cCheckable(0), true);
  assert.equal(a9be530Flag202cCheckable(0x100), true);
  assert.equal(a9be530Flag202cCheckable(0x1ff), false);
  assert.equal(a9be530Flag202cCheckable(0xffffffff), false);
  assert.equal(a9be530Flag20a9Checkable(0), true);
  assert.equal(a9be530Flag20a9Checkable(0x100), true);
  assert.equal(a9be530Flag20a9Checkable(0x1ff), false);
  assert.equal(a9be530Flag20a9Checkable(0xffffffff), false);

  // Charge gate: SIGNED [p+0x17e0] >= 3 (0x009be5a2 jl): 0xffffffff FAILS.
  assert.equal(a9be530ChargeOk(2), false);
  assert.equal(a9be530ChargeOk(3), true);
  assert.equal(a9be530ChargeOk(0xffffffff), false);
  assert.equal(a9be530ChargeOk(0x80000000), false);
  assert.equal(a9be530ChargeOk(0x7fffffff), true);

  // Seed assert: FULL dword seed==0 (0x009be5ab) -> log + int3 @ 0x009be5be.
  assert.equal(a9be530SeedAssertNeeded(0), true);
  assert.equal(a9be530SeedAssertNeeded(1), false);
  assert.equal(a9be530SeedAssertNeeded(0x80000000), false);

  // xorshift32 (0x009be5c4..0x009be5dd); shifts 3/5/20 PE-verified.
  assert.equal(a9be530XorshiftState(0x12345678, 3, 5, 20), 0x1e294bb5);
  assert.equal(a9be530XorshiftState(0x13579bdf, 33, 5, 20),
               a9be530XorshiftState(0x13579bdf, 1, 5, 20)); // cl masks 33 -> 1
  assert.equal(a9be530XorshiftState(0xffffffff, 3, 5, 20), 0xe0000e00);

  // Draw -> [0,1) float with the VERIFIED PE scale 0x2f7ffffe.
  assert.equal(a9be530StateAsF64(0), 0);
  assert.equal(a9be530StateAsF64(1), 1);
  assert.equal(a9be530StateAsF64(0xffffffff), 4294967295);
  assert.equal(a9be530NextFloat(0), 0);
  assert.equal(a9be530NextFloat(1), Math.fround(2.3283061589829401e-10));
  assert.equal(a9be530NextFloat(0x80000000), 0.4999999403953552);
  assert.equal(a9be530NextFloat(0xffffffff), 0.9999998807907104);
  assert.equal(a9be530BestUpdateNeeded(2, 1), true);
  assert.equal(a9be530BestUpdateNeeded(1, 2), false);
  assert.equal(a9be530BestUpdateNeeded(1, 1), false);
  assert.equal(a9be530BestUpdateNeeded(Number.NaN, 1), false);
  assert.equal(a9be530BestUpdateNeeded(1, Number.NaN), false);

  // Walk gates (0x009be61b / 0x009be61e), bound re-read per iteration.
  assert.equal(a9be530WalkNext(0), 4);
  assert.equal(a9be530WalkNext(0xfffffffc), 0);
  assert.equal(a9be530WalkNext(0xffffffff), 3);
  assert.equal(a9be530WalkContinue(4, 4), false);
  assert.equal(a9be530WalkContinue(4, 8), true);

  // Result: winner local init 0 (xor eax,eax @ 0x009be53e), kept in
  // [ebp-0xc]; return eax (0x009be60c / 0x009be618).  No *out store.
  assert.equal(a9be530ResultPlayer(0x12345678), 0x12345678);
  assert.equal(a9be530ResultPlayer(0), 0);

  // Full-body differential: branch-by-branch PE-truth reference vs the law
  // composition, over random lists (covers gate order, draw count == number
  // of passing candidates, strict-max best update, wrap walking).
  let seed37 = 0x9be5c4;
  const next37 = () => {
    seed37 = (Math.imul(seed37, 1664525) + 1013904223) >>> 0;
    return seed37;
  };
  for (let k = 0; k < 512; k++) {
    const n = next37() % 9;
    const begin = 0x1000;
    const end = (begin + n * 4) >>> 0;
    const seed = next37();
    const players = [];
    for (let i = 0; i < n; i++) {
      players.push({
        p2c: next37(),
        b202c: next37(),
        b20a9: next37(),
        d17e0: next37(),
        ptr: (begin + i * 4) >>> 0, // list-mapped so winner index = (ref-begin)/4
      });
    }
    const ref = p9be530BodyRef(begin, end, seed, players);
    const laws = p9be530Laws(begin, end, seed, players);
    assert.equal(laws, ref, `9be530 body diff k=${k} n=${n} seed=${seed >>> 0}`);
    // Sanity: the winner (when any) must be a passing candidate, and the
    // empty list must yield 0.
    if (n === 0) {
      assert.equal(ref, 0, `9be530 empty list k=${k}`);
    } else if (ref !== 0) {
      const idx = ((ref - begin) >>> 0) >>> 2;
      const p = players[idx];
      assert.ok(a9be530SlotCheckable(p.p2c) &&
                a9be530Flag202cCheckable(p.b202c) &&
                a9be530Flag20a9Checkable(p.b20a9) &&
                a9be530ChargeOk(p.d17e0),
                `9be530 winner must pass all gates k=${k}`);
    }
  }

  // Constants (all PE-verified this unit).
  assert.equal(a9be530NextVa(), 0x009be630);
  assert.equal(a9be530Va(), 0x009be530);
  assert.equal(a9be530RetVa(), 0x009be62d);
  assert.equal(a9be530FirstRetVa(), 0x009be62d);
  assert.equal(a9be530Int3Va(), 0x009be5be);
  assert.equal(a9be530BodyBytes(), 0x8e);
  assert.equal(a9be530Sites(), 7);
  assert.equal(a9be530ListBeginOfs(), 0);
  assert.equal(a9be530ListEndOfs(), 4);
  assert.equal(a9be530ListStride(), 4);
  assert.equal(a9be530SlotFlagOfs(), 0x2c);
  assert.equal(a9be530Flag202cOfs(), 0x202c);
  assert.equal(a9be530Flag20a9Ofs(), 0x20a9);
  assert.equal(a9be530ChargeOfs(), 0x17e0);
  assert.equal(a9be530ChargeMin(), 3);
  assert.equal(a9be530SeedAssertMsgVa(), 0x00b6bf54);
  assert.equal(a9be530LogLevel(), 0x10);
  assert.equal(a9be530AssertTrapVa(), 0x009be5be);
  assert.equal(a9be530HostLogVa(), 0x00a112c0);
  assert.equal(a9be530RngShiftTableVa(), 0x00b1f5d0);
  assert.equal(a9be530RngShift1(), 3);
  assert.equal(a9be530RngShift2(), 5);
  assert.equal(a9be530RngShift3(), 20);
  assert.equal(a9be530BestInitBits(), 0xbf800000);
  assert.equal(a9be530ScaleBits(), 0x2f7ffffe);
  assert.equal(a9be530SignCorrTableVa(), 0x00bacb00);
  assert.equal(a9be530BestInitValue(), -1);
  assert.equal(a9be530ScaleValue(), Math.fround(2.3283061589829401e-10));
});

/* ---------------------------------------------------------------------------
 * ABI v38 -- 0x009be630: address-stable slot-match sibling.  Full-body
 * reference transcribed branch-by-branch from the 0x009be630 instruction
 * stream (independent of every law export above; PURE search — the v37
 * xorshift/draw laws explicitly do NOT apply to this body).  Bound
 * captured ONCE pre-loop (ecx @ 0x009be635, not re-read per iteration).
 * ------------------------------------------------------------------------- */
function p9be630BodyRef(begin, end, needle, players) {
  // players[i] = { p2c, b20a9, slot, ptr }
  let iter = begin >>> 0;
  // 0x009be633 mov eax,[ecx] / 0x009be635 mov ecx,[ecx+4]: begin/end held
  // in eax/ecx for the WHOLE walk (bound NOT re-read per iteration).
  // 0x009be639 cmp eax,ecx / 0x009be63b je not-found (empty -> 0; arg1
  // never read on this path — esi loaded only @ 0x009be63d).
  if ((iter >>> 0) === (end >>> 0)) return 0;
  for (;;) {
    const p = players[((iter - begin) >>> 0) >>> 2];
    // 0x009be640 mov edx,[eax] = player ptr
    // 0x009be642 cmp dword [p+0x2c],0 / jne skip (FULL dword)
    // 0x009be648 cmp byte [p+0x20a9],0 / jne skip (LOW byte)
    // 0x009be651 cmp dword [p+0x13c0],esi / je found (FULL dword == needle)
    if ((p.p2c >>> 0) === 0 &&
        (p.b20a9 & 0xff) === 0 &&
        (p.slot >>> 0) === (needle >>> 0)) {
      return p.ptr >>> 0; // 0x009be667 mov eax,edx / ret 4
    }
    iter = (iter + 4) >>> 0; // 0x009be659 add eax,4
    // 0x009be65c cmp eax,ecx / 0x009be65e jne loop (end = ecx capture)
    if ((iter >>> 0) === (end >>> 0)) break;
  }
  return 0; // 0x009be660 xor eax,eax / ret 4
}

/* The law composition used by the oracle (first passing + matching
   candidate wins; not-found -> 0). */
function p9be630Laws(begin, end, needle, players) {
  let iter = begin >>> 0;
  if (!a9be630ListEmpty(iter, end)) {
    for (;;) {
      const p = players[((iter - begin) >>> 0) >>> 2];
      if (a9be630SlotCheckable(p.p2c) &&
          a9be630Flag20a9Checkable(p.b20a9) &&
          a9be630SlotMatches(p.slot, needle)) {
        return a9be630ResultFound(p.ptr);
      }
      iter = a9be630WalkNext(iter);
      if (!a9be630WalkContinue(iter, end)) break;
    }
  }
  return a9be630ResultNotfound();
}

test("JS oracle: 9be630 slot-match sibling islands (ABI v38)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 38);

  // Empty gate: cmp eax,ecx / je not-found (0x009be639/63b).  FULL dword;
  // the empty path never reads arg1 (esi loaded @ 0x009be63d AFTER the je).
  assert.equal(a9be630ListEmpty(0, 0), true);
  assert.equal(a9be630ListEmpty(0, 4), false);
  assert.equal(a9be630ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate: FULL dword [player+0x2c] == 0 (0x009be642).
  assert.equal(a9be630SlotCheckable(0), true);
  assert.equal(a9be630SlotCheckable(1), false);
  assert.equal(a9be630SlotCheckable(0x10000000), false);

  // Low-byte gate [p+0x20a9] == 0 (0x009be648): RAW uint32, low byte —
  // 0x100 has a 0 low byte so it PASSES.
  assert.equal(a9be630Flag20a9Checkable(0), true);
  assert.equal(a9be630Flag20a9Checkable(0x100), true);
  assert.equal(a9be630Flag20a9Checkable(0x1ff), false);
  assert.equal(a9be630Flag20a9Checkable(0xffffffff), false);

  // Match gate: FULL dword [player+0x13c0] == needle (0x009be651).
  assert.equal(a9be630SlotMatches(0x12, 0x12), true);
  assert.equal(a9be630SlotMatches(0x12, 0x24), false);
  assert.equal(a9be630SlotMatches(0xffffffff, 0xffffffff), true);
  assert.equal(a9be630SlotMatches(0x100, 0x1ff), false);

  // Walk gates (0x009be659 / 0x009be65c): end CAPTURED ONCE pre-loop
  // (ecx @ 0x009be635) — NOT re-read per iteration (v37 re-read [this+4]).
  assert.equal(a9be630WalkNext(0), 4);
  assert.equal(a9be630WalkNext(0xfffffffc), 0);
  assert.equal(a9be630WalkNext(0xffffffff), 3);
  assert.equal(a9be630WalkContinue(4, 4), false);
  assert.equal(a9be630WalkContinue(4, 8), true);
  assert.equal(a9be630WalkContinue(0, 0xffffffff), true);

  // Result arms: not-found -> xor eax,eax (0x009be660); found -> mov
  // eax,edx = player ptr (0x009be667).
  assert.equal(a9be630ResultNotfound(), 0);
  assert.equal(a9be630ResultFound(0x12345678), 0x12345678);
  assert.equal(a9be630ResultFound(0), 0);

  // Full-body differential: branch-by-branch PE-truth reference vs the law
  // composition, over random lists (covers gate order, first-match winner,
  // bound captured once, wrap walking, needle collisions).
  let seed38 = 0x9be630;
  const next38 = () => {
    seed38 = (Math.imul(seed38, 1664525) + 1013904223) >>> 0;
    return seed38;
  };
  for (let k = 0; k < 512; k++) {
    const n = next38() % 9;
    const begin = 0x1000;
    const end = (begin + n * 4) >>> 0;
    const needle = next38();
    const players = [];
    for (let i = 0; i < n; i++) {
      players.push({
        p2c: next38(),
        b20a9: next38(),
        slot: next38(),
        ptr: (begin + i * 4) >>> 0, // list-mapped so found index = (ref-begin)/4
      });
    }
    const ref = p9be630BodyRef(begin, end, needle, players);
    const laws = p9be630Laws(begin, end, needle, players);
    assert.equal(laws, ref, `9be630 body diff k=${k} n=${n} needle=${needle >>> 0}`);
    // Sanity: a found result must be a passing + matching candidate; an
    // empty list must yield 0.
    if (n === 0) {
      assert.equal(ref, 0, `9be630 empty list k=${k}`);
    } else if (ref !== 0) {
      const idx = ((ref - begin) >>> 0) >>> 2;
      const p = players[idx];
      assert.ok(a9be630SlotCheckable(p.p2c) &&
                a9be630Flag20a9Checkable(p.b20a9) &&
                a9be630SlotMatches(p.slot, needle),
                `9be630 winner must pass all gates + match k=${k}`);
    }
  }

  // Constants (all PE-verified this unit).
  assert.equal(a9be630NextVa(), 0x009be670);
  assert.equal(a9be630Va(), 0x009be630);
  assert.equal(a9be630RetVa(), 0x009be66b);
  assert.equal(a9be630FirstRetVa(), 0x009be664);
  assert.equal(a9be630Int3Va(), 0x009be66e);
  assert.equal(a9be630BodyBytes(), 0x3e);
  assert.equal(a9be630Sites(), 23);
  assert.equal(a9be630ListBeginOfs(), 0);
  assert.equal(a9be630ListEndOfs(), 4);
  assert.equal(a9be630ListStride(), 4);
  assert.equal(a9be630SlotFlagOfs(), 0x2c);
  assert.equal(a9be630Flag20a9Ofs(), 0x20a9);
  assert.equal(a9be630SlotValueOfs(), 0x13c0);
});

/* ---------------------------------------------------------------------------
 * ABI v39 -- 0x009be670: address-stable PURE slot-0x19 predicate.  Full-body
 * reference transcribed branch-by-branch from the 0x009be670 instruction
 * stream (independent of every law export above): walk players, skip
 * candidates failing the slot-flag / flag20a9 gates, return 0 IMMEDIATELY
 * when a CHECKABLE candidate's slot != 0x19, else (empty OR all checkable
 * have slot == 0x19) return 1.  Bound captured ONCE pre-loop (ecx @
 * 0x009be672).  Needle is the IMMEDIATE 0x19 — arg1 is never read.
 * ------------------------------------------------------------------------- */
function be670Ref(players, begin, end) {
  let iter = begin >>> 0;
  if (a9be670ListEmpty(iter, end)) {
    return a9be670ResultTrue();
  }
  for (;;) {
    const p = players[((iter - begin) >>> 0) >>> 2];
    if (a9be670SlotCheckable(p.p2c) && a9be670Flag20a9Checkable(p.b20a9)) {
      if (!a9be670SlotEqualsNeedle(p.slot)) {
        return a9be670ResultFalse();
      }
    }
    iter = a9be670WalkNext(iter);
    if (!a9be670WalkContinue(iter, end)) break;
  }
  return a9be670ResultTrue();
}

test("JS oracle: 9be670 slot-0x19 predicate islands (ABI v39)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 39);

  // Empty gate: cmp eax,ecx / je TRUE arm (0x009be675/677).  FULL dword;
  // the EMPTY list returns 1 — the inverse of v38's not-found 0.
  assert.equal(a9be670ListEmpty(0, 0), true);
  assert.equal(a9be670ListEmpty(0, 4), false);
  assert.equal(a9be670ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate: FULL dword [player+0x2c] == 0 (0x009be682).
  assert.equal(a9be670SlotCheckable(0), true);
  assert.equal(a9be670SlotCheckable(1), false);
  assert.equal(a9be670SlotCheckable(0x10000000), false);

  // Low-byte gate [p+0x20a9] == 0 (0x009be688): RAW uint32, low byte.
  assert.equal(a9be670Flag20a9Checkable(0), true);
  assert.equal(a9be670Flag20a9Checkable(0x100), true);
  assert.equal(a9be670Flag20a9Checkable(0x1ff), false);
  assert.equal(a9be670Flag20a9Checkable(0xffffffff), false);

  // Needle gate (0x009be691): FULL dword [p+0x13c0] == IMMEDIATE 0x19 —
  // the extra arg is ignored (a9be670SlotEqualsNeedle takes ONE input).
  assert.equal(a9be670SlotEqualsNeedle(0x19), true);
  assert.equal(a9be670SlotEqualsNeedle(0x18), false);
  assert.equal(a9be670SlotEqualsNeedle(0xffffffff), false);

  // Walk gates (0x009be69a / 0x009be69d): end CAPTURED ONCE pre-loop
  // (ecx @ 0x009be672) — NOT re-read per iteration (differs from 9be6b0).
  assert.equal(a9be670WalkNext(0), 4);
  assert.equal(a9be670WalkNext(0xfffffffc), 0);
  assert.equal(a9be670WalkNext(0xffffffff), 3);
  assert.equal(a9be670WalkContinue(4, 4), false);
  assert.equal(a9be670WalkContinue(4, 8), true);
  assert.equal(a9be670WalkContinue(0, 0xffffffff), true);

  // Result arms: TRUE -> mov al,1 (0x009be6a1); FALSE -> xor al,al
  // (0x009be6a6).
  assert.equal(a9be670ResultTrue(), 1);
  assert.equal(a9be670ResultFalse(), 0);

  // Full-body differential: PE-truth predicate vs law composition over
  // random lists, exercising the empty-1 polarity, the skip gates, the
  // immediate-needle false arm, and the loop-complete true arm.
  let seed = 0x9be670;
  const rnd32 = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  let refBoth = 0;
  for (let k = 0; k < 512; k++) {
    const players = [];
    const begin = 0x1000;
    const end = begin + 4 * (rnd32() % 6);
    let seenCheckableNon19 = false;
    for (let i = 0; i < (end - begin) / 4; i++) {
      const p2c = rnd32() & 0x1f; // wide: 0 or nonzero
      const b20a9 = rnd32(); // wide raw for the low-byte gate
      const slot = rnd32();
      players.push({ p2c, b20a9, slot });
      if (a9be670SlotCheckable(p2c) && a9be670Flag20a9Checkable(b20a9) &&
          slot !== 0x19) {
        seenCheckableNon19 = true;
      }
    }
    // The machine scans in list order and returns 0 on the FIRST checkable
    // non-0x19 candidate; the aggregate condition is order-independent for
    // the value (0 iff ANY checkable non-0x19 exists), but the reference
    // preserves the order anyway.  Compare full walk.
    const got = be670Ref(players, begin, end);
    const expected = seenCheckableNon19 ? 0 : 1;
    assert.equal(got, expected, `9be670 rnd list ${k}`);
    refBoth += got;
  }
  assert.ok(refBoth >= 0 && refBoth <= 512);

  // Full-body PE-truth vs DIRECT law composition on a hand-built list that
  // includes a skip candidate, a matching candidate, and a mismatch.
  const hand = [
    { p2c: 1, b20a9: 0, slot: 0x19 },      // skipped: slot flag set
    { p2c: 0, b20a9: 0x100, slot: 0x19 },  // skipped: flag20a9 low byte 0? 0x100 -> byte 0 -> checkable
    { p2c: 0, b20a9: 0, slot: 0x19 },      // checkable, matches -> continue
    { p2c: 0, b20a9: 0, slot: 0x12 },      // checkable, != 0x19 -> FALSE
  ];
  assert.equal(be670Ref(hand, 0x2000, 0x2000 + 16), 0,
               "any checkable non-0x19 -> return 0");
  const hand2 = [
    { p2c: 0, b20a9: 0, slot: 0x19 },
    { p2c: 0, b20a9: 0, slot: 0x19 },
    { p2c: 1, b20a9: 0, slot: 0x12 },      // non-checkable mismatch ignored
  ];
  assert.equal(be670Ref(hand2, 0x2000, 0x2000 + 12), 1,
               "all checkable == 0x19 -> return 1 (skips ignored)");
  assert.equal(be670Ref([], 0x2000, 0x2000), 1, "empty list -> TRUE 1");

  // Constants (all PE-verified this unit).
  assert.equal(a9be670NextVa(), 0x009be6b0);
  assert.equal(a9be670Va(), 0x009be670);
  assert.equal(a9be670RetVa(), 0x009be6a8);
  assert.equal(a9be670FirstRetVa(), 0x009be6a3);
  assert.equal(a9be670Int3Va(), 0x009be6ab);
  assert.equal(a9be670BodyBytes(), 0x3b);
  assert.equal(a9be670Sites(), 3);
  assert.equal(a9be670ListBeginOfs(), 0);
  assert.equal(a9be670ListEndOfs(), 4);
  assert.equal(a9be670ListStride(), 4);
  assert.equal(a9be670SlotFlagOfs(), 0x2c);
  assert.equal(a9be670Flag20a9Ofs(), 0x20a9);
  assert.equal(a9be670SlotValueOfs(), 0x13c0);
  assert.equal(a9be670SlotNeedle(), 0x19);
});

/* ---------------------------------------------------------------------------
 * ABI v39 -- 0x009be6b0: address-stable owner/quality player select
 * (NARROWED).  Full-body reference transcribed branch-by-branch from the
 * 0x009be6b0 instruction stream.  The two HOST call bodies (0x7cb6e0
 * status, 0x7706e0 query) stay host residual; the reference receives their
 * results as per-candidate MOCK values and composes them through the PURE
 * path-selection + accept/winner CF exactly as the machine does:
 *   path A: field != 0 == needle && byte2ef0 != 0 -> bl = 1 (FORCED)
 *   path B: field matches && byte2ef0 == 0 -> status call, bl = st > 1
 *   path C: field == 0 || != needle          -> status call, bl = st > 0
 *   accept = bl && LOW byte(query) -> return player immediately
 *   winner = FIRST bl-set non-accepted candidate; end -> return winner
 * Bound RE-READ per iteration (eax = this reloaded @ 0x009be72b feeds
 * cmp esi,[eax+4] at loop top @ 0x009be6c4).
 * ------------------------------------------------------------------------- */
function be6b0Ref(players, begin, end, needle, statusOf, queryOf) {
  let iter = begin >>> 0;
  let winner = 0;
  if (a9be6b0ListEmpty(iter, end)) {
    return a9be6b0ResultWinner(winner);
  }
  for (;;) {
    const idx = ((iter - begin) >>> 0) >>> 2;
    const p = players[idx];
    // fields: p.f2ef8 (owner id), p.b2ef0 (flag byte, wide), p.ptr (player)
    let bl = 0;
    const pathAB = a9be6b0FieldNonzero(p.f2ef8) &&
                  a9be6b0FieldEqNeedle(p.f2ef8, needle);
    let qres;
    if (pathAB) {
      if (a9be6b0Flag2ef0Set(p.b2ef0)) {
        bl = a9be6b0BlForced();             // path A: no status call
        qres = queryOf(idx);                // 0x7706e0(player, 0x1b7, 0)
      } else {
        bl = a9be6b0StatusGt1(statusOf(idx)) ? 1 : 0; // path B
        qres = queryOf(idx);
      }
    } else {
      bl = a9be6b0StatusGt0(statusOf(idx)) ? 1 : 0;   // path C
      qres = queryOf(idx);
    }
    if (a9be6b0AcceptNeeded(bl, qres)) {
      return a9be6b0ResultPlayer(p.ptr);
    }
    if (a9be6b0WinnerStoreNeeded(winner, bl)) {
      winner = p.ptr;
    }
    iter = a9be6b0WalkNext(iter);
    if (!a9be6b0WalkContinue(iter, end)) break;
  }
  return a9be6b0ResultWinner(winner);
}

test("JS oracle: 9be6b0 owner/quality select islands (ABI v39)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 39);

  // Empty gate: cmp esi,[this+4] / je epilogue A (0x009be6c4/67) -> return
  // winner 0.  FULL dword.
  assert.equal(a9be6b0ListEmpty(0, 0), true);
  assert.equal(a9be6b0ListEmpty(0, 4), false);
  assert.equal(a9be6b0ListEmpty(0xffffffff, 0xffffffff), true);

  // Path-select gates: field nonzero + field == needle (0x009be6ce/6d8).
  assert.equal(a9be6b0FieldNonzero(0), false);
  assert.equal(a9be6b0FieldNonzero(1), true);
  assert.equal(a9be6b0FieldNonzero(0xffffffff), true);
  assert.equal(a9be6b0FieldEqNeedle(0x97, 0x97), true);
  assert.equal(a9be6b0FieldEqNeedle(0x97, 0x98), false);
  assert.equal(a9be6b0FieldEqNeedle(0xffffffff, 0xffffffff), true);

  // Path A select flag [p+0x2ef0] (0x009be6dc): RAW uint32, LOW byte != 0.
  assert.equal(a9be6b0Flag2ef0Set(0), false);
  assert.equal(a9be6b0Flag2ef0Set(1), true);
  assert.equal(a9be6b0Flag2ef0Set(0x100), false); // LOW byte 0 -> NOT set
  assert.equal(a9be6b0Flag2ef0Set(0x1ff), true);
  assert.equal(a9be6b0Flag2ef0Set(0xffffff00), false);

  // setg thresholds (0x009be70a): SIGNED.  Path B cmp eax,1 -> >1; path C
  // test eax,eax -> >0.  0xffffffff (-1) FAILS both; 0 FAILS gt0.
  assert.equal(a9be6b0StatusGt1(0), false);
  assert.equal(a9be6b0StatusGt1(1), false);
  assert.equal(a9be6b0StatusGt1(2), true);
  assert.equal(a9be6b0StatusGt1(0xffffffff), false);
  assert.equal(a9be6b0StatusGt1(0x80000000), false);
  assert.equal(a9be6b0StatusGt1(0x7fffffff), true);
  assert.equal(a9be6b0StatusGt0(0), false);
  assert.equal(a9be6b0StatusGt0(1), true);
  assert.equal(a9be6b0StatusGt0(0xffffffff), false);
  assert.equal(a9be6b0StatusGt0(0x80000000), false);
  assert.equal(a9be6b0StatusGt0(0x7fffffff), true);

  // Path A forced bl (0x009be6ec mov bl,1).
  assert.equal(a9be6b0BlForced(), 1);

  // Accept gate (0x009be719..1f): bl != 0 && LOW byte(query) != 0.
  assert.equal(a9be6b0AcceptNeeded(1, 0x1), true);
  assert.equal(a9be6b0AcceptNeeded(1, 0x100), false);
  assert.equal(a9be6b0AcceptNeeded(1, 0x1ff), true);
  assert.equal(a9be6b0AcceptNeeded(0, 0x1), false);
  assert.equal(a9be6b0AcceptNeeded(0xffffffff, 0xffffffff), true);

  // Winner store (0x009be721..29): winner==0 && bl!=0.
  assert.equal(a9be6b0WinnerStoreNeeded(0, 1), true);
  assert.equal(a9be6b0WinnerStoreNeeded(0, 0), false);
  assert.equal(a9be6b0WinnerStoreNeeded(1, 1), false);
  assert.equal(a9be6b0WinnerStoreNeeded(0xffffffff, 0xffffffff), false);

  // Walk (0x009be72f / 0x009be6c4): stride 4 wrap; bound RE-READ per iter.
  assert.equal(a9be6b0WalkNext(0), 4);
  assert.equal(a9be6b0WalkNext(0xfffffffc), 0);
  assert.equal(a9be6b0WalkNext(0xffffffff), 3);
  assert.equal(a9be6b0WalkContinue(4, 4), false);
  assert.equal(a9be6b0WalkContinue(4, 8), true);
  assert.equal(a9be6b0WalkContinue(0, 0xffffffff), true);

  // Result arms: epilogue B mov eax,[esi] (0x009be734); epilogue A mov
  // eax,edi (0x009be73f).
  assert.equal(a9be6b0ResultPlayer(0x12345678), 0x12345678);
  assert.equal(a9be6b0ResultPlayer(0), 0);
  assert.equal(a9be6b0ResultWinner(0), 0);
  assert.equal(a9be6b0ResultWinner(0x12345678), 0x12345678);

  // Full-body differential: the PE-truth walk with MOCKED host results.
  // The mock status/query results are inputs — the pure CF (path select,
  // setg thresholds, accept gate, winner fallback, re-read bound) must
  // match the machine for every combination.
  let seed = 0x9be6b0;
  const rnd32 = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let k = 0; k < 512; k++) {
    const players = [];
    const begin = 0x3000;
    const end = begin + 4 * (rnd32() % 6);
    for (let i = 0; i < (end - begin) / 4; i++) {
      players.push({
        f2ef8: rnd32(),
        b2ef0: rnd32(),
        ptr: begin + 0x10000 + i * 4, // fake player ptrs
      });
    }
    const needle = rnd32();
    const statuses = [];
    const queries = [];
    for (let i = 0; i < players.length; i++) {
      statuses.push(rnd32());
      queries.push(rnd32());
    }
    const got = be6b0Ref(players, begin, end, needle,
                         (i) => statuses[i], (i) => queries[i]);

    // Independent recomputation from the raw machine gates (not the law
    // fns) for a true cross-check of the reference composition.
    let iter = begin >>> 0;
    let winner = 0;
    if (iter !== end) {
      for (;;) {
        const idx = ((iter - begin) >>> 0) >>> 2;
        const p = players[idx];
        const field = p.f2ef8 >>> 0;
        const n = needle >>> 0;
        const pathAB = field !== 0 && field === n;
        const flag = (p.b2ef0 & 0xff) !== 0;
        const st = statuses[idx] | 0;
        const q = queries[idx] & 0xff;
        let bl;
        let qres;
        if (pathAB) {
          if (flag) { bl = 1; } else { bl = st > 1 ? 1 : 0; }
          qres = queries[idx];
        } else {
          bl = st > 0 ? 1 : 0;
          qres = queries[idx];
        }
        if (bl !== 0 && (qres & 0xff) !== 0) {
          assert.equal(got, a9be6b0ResultPlayer(p.ptr),
                       `9be6b0 early accept k=${k}`);
          break;
        }
        if (winner === 0 && bl !== 0) winner = p.ptr;
        iter = (iter + 4) >>> 0;
        if (iter === end) {
          assert.equal(got, a9be6b0ResultWinner(winner),
                       `9be6b0 winner k=${k}`);
          break;
        }
      }
    } else {
      assert.equal(got, a9be6b0ResultWinner(0), `9be6b0 empty k=${k}`);
    }
  }

  // Hand-built: path A accept on candidate 0 (forced bl + query low byte).
  const handA = [
    { f2ef8: 0x97, b2ef0: 1, ptr: 0x1111 },
    { f2ef8: 0x97, b2ef0: 1, ptr: 0x2222 },
  ];
  assert.equal(
    be6b0Ref(handA, 0x4000, 0x4000 + 8, 0x97, () => 99, () => 0x1), 0x1111,
    "path A forced-bl accept returns the first player");
  const handA0 = [
    { f2ef8: 0x97, b2ef0: 1, ptr: 0x1111 },
    { f2ef8: 0x97, b2ef0: 1, ptr: 0x2222 },
  ];
  assert.equal(
    be6b0Ref(handA0, 0x4000, 0x4000 + 8, 0x97, () => 99, () => 0x100),
    0x1111,
    "bl-set non-accepted candidate becomes the winner (query low byte 0)");
  const handB = [
    { f2ef8: 0x97, b2ef0: 0, ptr: 0x1111 }, // path B: st=2 (>1) -> bl
    { f2ef8: 0x97, b2ef0: 0, ptr: 0x2222 },
  ];
  assert.equal(
    be6b0Ref(handB, 0x4000, 0x4000 + 8, 0x97, () => 2, () => 0x1), 0x1111,
    "path B accept via status>1 + query");
  const handC = [
    { f2ef8: 0x99, b2ef0: 0, ptr: 0x1111 }, // path C: field != needle
    { f2ef8: 0x97, b2ef0: 0, ptr: 0x2222 },
  ];
  assert.equal(
    be6b0Ref(handC, 0x4000, 0x4000 + 8, 0x97, (i) => (i === 0 ? 1 : 2),
             () => 0x1),
    0x1111,
    "path C accept via status>0 (first candidate)");
  assert.equal(
    be6b0Ref([], 0x4000, 0x4000, 0x97, () => 1, () => 1), 0,
    "empty list -> winner 0");

  // Constants (all PE-verified this unit).
  assert.equal(a9be6b0NextVa(), 0x009be750);
  assert.equal(a9be6b0Va(), 0x009be6b0);
  assert.equal(a9be6b0RetVa(), 0x009be747);
  assert.equal(a9be6b0FirstRetVa(), 0x009be73c);
  assert.equal(a9be6b0Int3Va(), 0x009be74a);
  assert.equal(a9be6b0BodyBytes(), 0x9a);
  assert.equal(a9be6b0Sites(), 41);
  assert.equal(a9be6b0ListBeginOfs(), 0);
  assert.equal(a9be6b0ListEndOfs(), 4);
  assert.equal(a9be6b0ListStride(), 4);
  assert.equal(a9be6b0Field2ef8Ofs(), 0x2ef8);
  assert.equal(a9be6b0Flag2ef0Ofs(), 0x2ef0);
  assert.equal(a9be6b0QueryArg1(), 0x1b7);
  assert.equal(a9be6b0QueryArg2(), 0);
  assert.equal(a9be6b0StatusCallVa(), 0x007cb6e0);
  assert.equal(a9be6b0QueryCallVa(), 0x007706e0);
});

/* ---------------------------------------------------------------------------
 * ABI v40 -- 0x009be750: GetNumCollectibles (EXACT ZHL 19 B:
 * `__thiscall int PlayerManager::GetNumCollectibles(CollectibleType type);`).
 * NARROWED.  Full-body reference transcribed branch-by-branch from the
 * 0x009be750 instruction stream: the twin flag is computed ONCE pre-walk
 * from the host 0x72fd10 twin-get (twin != 0 && bit31([twin+0xb8]),
 * 0x009be778..0x009be790); then per candidate (iter from begin):
 *   slot dword [p+0x2c] == 0 (0x009be7a2) ->
 *     sum += host GetCollectibleNum(player, type, 0) (add ebx,eax
 *     0x009be7b4, 32-bit wrap);
 *     if flag low byte != 0 (0x009be7b6) && [p+0x1e6c] != 0 (0x009be7c3):
 *       sum += GetCollectibleNum(twin, type, 0) (0x009be7d1);
 *   iter += 4 (0x009be7d7); end RE-READ from this per iteration
 *   (0x009be7d3 .. cmp [eax+4] / jne 0x009be7dd);
 * return sum (mov eax,ebx @ 0x009be7e1).
 * The host result streams are injected as inputs (per-player and per-twin
 * GetCollectibleNum values).
 * ------------------------------------------------------------------------- */
function gnc9be750Ref(begin, end, flag, players) {
  let sum = 0;
  let iter = begin >>> 0;
  if (gnc9be750ListEmpty(iter, end)) {
    return gnc9be750ResultSum(sum);
  }
  for (;;) {
    const p = players[((iter - begin) >>> 0) >>> 2];
    if (gnc9be750SlotCheckable(p.p2c)) {
      sum = gnc9be750CountAdd(sum, p.count);
      if (gnc9be750TwinCallNeeded(flag, p.twinPtr)) {
        sum = gnc9be750CountAdd(sum, p.twinCount);
      }
    }
    iter = gnc9be750WalkNext(iter);
    if (!gnc9be750WalkContinue(iter, end)) break;
  }
  return gnc9be750ResultSum(sum);
}

test("JS oracle: 9be750 GetNumCollectibles islands (ABI v40)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 40);

  // Twin flag (0x009be778..0x009be790): FULL dword bit31 of [twin+0xb8],
  // gated on the twin ptr != 0; the stored byte [esp+0x13] is 0/1.
  assert.equal(gnc9be750TwinFlag(0, 0x80000000), false);
  assert.equal(gnc9be750TwinFlag(1, 0), false);
  assert.equal(gnc9be750TwinFlag(1, 0x7fffffff), false);
  assert.equal(gnc9be750TwinFlag(1, 0x80000000), true);
  assert.equal(gnc9be750TwinFlag(0x100, 0x80000000), true);

  // Empty gate (0x009be796..799): FULL dword begin==end -> skip walk.
  assert.equal(gnc9be750ListEmpty(0, 0), true);
  assert.equal(gnc9be750ListEmpty(0, 4), false);
  assert.equal(gnc9be750ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate (0x009be7a2): FULL dword [p+0x2c] == 0.
  assert.equal(gnc9be750SlotCheckable(0), true);
  assert.equal(gnc9be750SlotCheckable(1), false);
  assert.equal(gnc9be750SlotCheckable(0x10000000), false);
  assert.equal(gnc9be750SlotCheckable(0xffffffff), false);

  // Sum (0x009be7b4 / 0x009be7d1): add ebx,eax, 32-bit wrap.
  assert.equal(gnc9be750CountAdd(0, 0), 0);
  assert.equal(gnc9be750CountAdd(5, 7), 12);
  assert.equal(gnc9be750CountAdd(0xffffffff, 1), 0);
  assert.equal(gnc9be750CountAdd(0xfffffffe, 2), 0);
  assert.equal(gnc9be750CountAdd(0x80000000, 0x80000000), 0);

  // Twin call gate (0x009be7b6..c5): flag LOW byte != 0 AND twin ptr
  // FULL dword != 0.
  assert.equal(gnc9be750TwinCallNeeded(0, 0x1234), false);
  assert.equal(gnc9be750TwinCallNeeded(0x100, 0x1234), false);
  assert.equal(gnc9be750TwinCallNeeded(0x1ff, 0x1234), true);
  assert.equal(gnc9be750TwinCallNeeded(1, 0), false);
  assert.equal(gnc9be750TwinCallNeeded(1, 0x1234), true);

  // Walk (0x009be7d7 / 0x009be7da..dd): stride 4 wrap; end re-read.
  assert.equal(gnc9be750WalkNext(0), 4);
  assert.equal(gnc9be750WalkNext(0xfffffffc), 0);
  assert.equal(gnc9be750WalkNext(0xffffffff), 3);
  assert.equal(gnc9be750WalkContinue(4, 4), false);
  assert.equal(gnc9be750WalkContinue(4, 8), true);
  assert.equal(gnc9be750WalkContinue(0, 0xffffffff), true);

  // Result (0x009be7e1): eax = ebx (the accumulated sum).
  assert.equal(gnc9be750ResultSum(0), 0);
  assert.equal(gnc9be750ResultSum(0x12345678), 0x12345678);
  assert.equal(gnc9be750ResultSum(0xffffffff), 0xffffffff);

  // Full-body differential: PE-truth reference vs law composition over
  // random lists, exercising the empty-0 sum, the slot-skip, the twin
  // flag low-byte gate, the wrap, and the re-read walk.
  let seed = 0x9be750;
  const rnd32 = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let k = 0; k < 512; k++) {
    const n = rnd32() % 7;
    const begin = 0x1000;
    const end = (begin + n * 4) >>> 0;
    const twinPresent = rnd32() >>> 0;
    const flagsB8 = rnd32() >>> 0;
    const flag = gnc9be750TwinFlag(twinPresent, flagsB8) ? 1 : 0;
    const players = [];
    for (let i = 0; i < n; i++) {
      players.push({
        p2c: rnd32(),
        count: rnd32(),
        twinPtr: rnd32(),
        twinCount: rnd32(),
      });
    }
    const got = gnc9be750Ref(begin, end, flag, players);

    // Independent recomputation from the raw machine gates, not the law
    // fns: PE-order add ebx,eax on the slot gate, flag low-byte + twin
    // full-dword gate, 32-bit wrap, re-read end.
    let iter = begin >>> 0;
    let sum = 0;
    if ((iter >>> 0) !== (end >>> 0)) {
      for (;;) {
        const idx = ((iter - begin) >>> 0) >>> 2;
        const p = players[idx];
        if (p.p2c === 0) {
          sum = (sum + (p.count >>> 0)) >>> 0;
          if (((flag & 0xff) !== 0) && (p.twinPtr >>> 0) !== 0) {
            sum = (sum + (p.twinCount >>> 0)) >>> 0;
          }
        }
        iter = (iter + 4) >>> 0;
        if ((iter >>> 0) === (end >>> 0)) break;
      }
    }
    assert.equal(got, sum >>> 0, `9be750 body diff k=${k} n=${n} flag=${flag}`);
    if (n === 0) {
      assert.equal(got, 0, `9be750 empty sum k=${k}`);
    }
  }

  // Hand-built: wrap sum across players + twins; flag/slot gates; empty.
  assert.equal(
    gnc9be750Ref(0x1000, 0x1008, 1, [
      { p2c: 0, count: 0xffffffff, twinPtr: 0, twinCount: 0 },
      { p2c: 0, count: 4, twinPtr: 0x200, twinCount: 1 },
    ]),
    4, "wrap: 0xffffffff + 4 + 1 -> 4");
  assert.equal(
    gnc9be750Ref(0x1000, 0x1008, 0, [
      { p2c: 0, count: 5, twinPtr: 0x200, twinCount: 9 },
      { p2c: 1, count: 7, twinPtr: 0x200, twinCount: 9 },
    ]),
    5, "flag 0 -> twins not counted; slot-gated candidate skipped");
  assert.equal(
    gnc9be750Ref(0xfffffff8, 0, 0, [
      { p2c: 0, count: 5, twinPtr: 0, twinCount: 0 },
      { p2c: 0, count: 7, twinPtr: 0, twinCount: 0 },
    ]),
    12, "two-step wrap walk: begin 0xfffffff8 -> 0xfffffffc -> 0 (= end)");
  assert.equal(
    gnc9be750Ref(0xfffffffc, 0, 0, [
      { p2c: 0, count: 5, twinPtr: 0, twinCount: 0 },
      { p2c: 0, count: 7, twinPtr: 0, twinCount: 0 },
    ]),
    5, "single-iteration wrap walk (begin 0xfffffffc -> 0 = end)");
  assert.equal(
    gnc9be750Ref(0x1000, 0x1000, 1, []),
    0, "empty list -> sum 0 (je to the tail @ 0x009be7df)");

  // Constants (all PE-derived this unit).
  assert.equal(gnc9be750NextVa(), 0x009be7f0);
  assert.equal(gnc9be750Va(), 0x009be750);
  assert.equal(gnc9be750RetVa(), 0x009be7e7);
  assert.equal(gnc9be750Int3Va(), 0x009be7ea);
  assert.equal(gnc9be750BodyBytes(), 0x9a);
  assert.equal(gnc9be750Sites(), 3);
  assert.equal(gnc9be750SiteVa(), 0x007f9332);
  assert.equal(gnc9be750ListBeginOfs(), 0);
  assert.equal(gnc9be750ListEndOfs(), 4);
  assert.equal(gnc9be750ListStride(), 4);
  assert.equal(gnc9be750SlotFlagOfs(), 0x2c);
  assert.equal(gnc9be750TwinPtrOfs(), 0x1e6c);
  assert.equal(gnc9be750TwinFlagsOfs(), 0xb8);
  assert.equal(gnc9be750TwinBit(), 0x80000000);
  assert.equal(gnc9be750ManagerGlobalVa(), 0x00c7169c);
  assert.equal(gnc9be750GameGlobalVa(), 0x00c71678);
  assert.equal(gnc9be750ReceiverOfs(), 0x1baa8);
  assert.equal(gnc9be750TwinContainerOfs(), 0x2a404);
  assert.equal(gnc9be750HostTwinGetVa(), 0x0072fd10);
  assert.equal(gnc9be750HostCountVa(), 0x00770ca0);
});

/* ---------------------------------------------------------------------------
 * ABI v41 -- 0x009be7f0: HasTemporaryEffect (EXACT ZHL 8-B prologue pattern
 * `558bec8b11568b71`; `__thiscall bool PlayerManager::HasTemporaryEffect(
 * ItemConfig_Item *item);`).  PURE.  Full-body reference transcribed
 * branch-by-branch from the 0x009be7f0 instruction stream: list end
 * CAPTURED ONCE (esi @ 0x009be7f6); empty list -> NOT-FOUND 0 WITHOUT
 * reading the needle (0x009be7fa/7fc je 0x9be834 -> xor al,al); per
 * candidate (player = *iter): dword [p+0x2c]==0 (0x009be803) AND byte
 * [p+0x1519]==0 (0x009be809) -> scan the temp-effect vector
 * [p+0x150c..p+0x1510) stride 0x10 (begin==end skips, 0x009be81e);
 * [entry]==needle FULL dword (0x009be822) -> FOUND 1 immediately
 * (0x9be83c mov al,1); iter += 4 until iter == end (0x009be82d/830/832,
 * end captured once).  No E8 / stores in the body.
 * ------------------------------------------------------------------------- */
function hte9be7f0Ref(begin, end, needle, players) {
  const listEnd = end >>> 0;
  let iter = begin >>> 0;
  if (hte9be7f0ListEmpty(iter, listEnd)) {
    return hte9be7f0ResultNotFound();
  }
  for (;;) {
    const p = players[((iter - begin) >>> 0) >>> 2];
    if (hte9be7f0SlotCheckable(p.p2c) && hte9be7f0Flag1519Checkable(p.flag1519)) {
      const vBegin = p.vecBegin >>> 0;
      const vEnd = p.vecEnd >>> 0;
      if (hte9be7f0VecNotEmpty(vBegin, vEnd)) {
        let e = vBegin;
        for (;;) {
          const entry = p.entries[((e - vBegin) >>> 0) >>> 4];
          if (hte9be7f0EntryHit(entry, needle)) {
            return hte9be7f0ResultFound();
          }
          e = hte9be7f0VecWalkNext(e);
          if (!hte9be7f0VecWalkContinue(e, vEnd)) break;
        }
      }
    }
    iter = hte9be7f0WalkNext(iter);
    if (!hte9be7f0WalkContinue(iter, listEnd)) break;
  }
  return hte9be7f0ResultNotFound();
}

test("JS oracle: 9be7f0 HasTemporaryEffect islands (ABI v41)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 41);

  // Empty gate (0x009be7fa..7fc): FULL dword begin==end -> NOT-FOUND 0.
  // Polarity is the v38 not-found 0, NOT v39 9be670's TRUE-on-empty 1.
  assert.equal(hte9be7f0ListEmpty(0, 0), true);
  assert.equal(hte9be7f0ListEmpty(0, 4), false);
  assert.equal(hte9be7f0ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate (0x009be803): FULL dword [p+0x2c] == 0.
  assert.equal(hte9be7f0SlotCheckable(0), true);
  assert.equal(hte9be7f0SlotCheckable(1), false);
  assert.equal(hte9be7f0SlotCheckable(0x100), false);
  assert.equal(hte9be7f0SlotCheckable(0xffffffff), false);

  // Byte gate (0x009be809): LOW byte [p+0x1519] == 0 (raw arg).
  assert.equal(hte9be7f0Flag1519Checkable(0), true);
  assert.equal(hte9be7f0Flag1519Checkable(0x100), true);
  assert.equal(hte9be7f0Flag1519Checkable(0x1ff), false);
  assert.equal(hte9be7f0Flag1519Checkable(0xffffffff), false);

  // Vector scan gate (0x009be81e): FULL dword vec begin != vec end.
  assert.equal(hte9be7f0VecNotEmpty(0, 4), true);
  assert.equal(hte9be7f0VecNotEmpty(4, 4), false);
  assert.equal(hte9be7f0VecNotEmpty(0xffffffff, 0xffffffff), false);

  // Entry compare (0x009be822): FULL dword [entry] == needle.
  assert.equal(hte9be7f0EntryHit(0x33, 0x33), true);
  assert.equal(hte9be7f0EntryHit(0x100, 0x100), true);
  assert.equal(hte9be7f0EntryHit(0x100, 0x1ff), false);
  assert.equal(hte9be7f0EntryHit(0x12345678, 0x12345678), true);
  assert.equal(hte9be7f0EntryHit(0x12345678, 0x12345679), false);

  // Vec walk (0x009be826 / 0x009be829..82b): stride 16 wrap; end captured
  // per candidate.
  assert.equal(hte9be7f0VecWalkNext(0), 0x10);
  assert.equal(hte9be7f0VecWalkNext(0xfffffff0), 0);
  assert.equal(hte9be7f0VecWalkNext(0xffffffff), 0xf);
  assert.equal(hte9be7f0VecWalkContinue(4, 4), false);
  assert.equal(hte9be7f0VecWalkContinue(4, 8), true);
  assert.equal(hte9be7f0VecWalkContinue(0, 0xffffffff), true);

  // Player walk (0x009be82d / 0x009be830..832): stride 4 wrap; END
  // CAPTURED ONCE (esi @ 0x009be7f6) -- the captured-bound law.
  assert.equal(hte9be7f0WalkNext(0), 4);
  assert.equal(hte9be7f0WalkNext(0xfffffffc), 0);
  assert.equal(hte9be7f0WalkNext(0xffffffff), 3);
  assert.equal(hte9be7f0WalkContinue(4, 4), false);
  assert.equal(hte9be7f0WalkContinue(4, 8), true);
  assert.equal(hte9be7f0WalkContinue(0, 0xffffffff), true);

  // Epilogues (0x009be835 xor al,al / 0x009be83d mov al,1).
  assert.equal(hte9be7f0ResultNotFound(), 0);
  assert.equal(hte9be7f0ResultFound(), 1);

  // Hand-built full-body cases (PE-truth).
  // Empty list -> 0 (je @ 0x009be7fc to the not-found epilogue).
  assert.equal(hte9be7f0Ref(0x1000, 0x1000, 0x33, []), 0,
    "empty list -> not-found 0 (needle never read)");
  // Single candidate, first entry hit.
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2020,
      entries: [0x33, 0x44] },
  ]), 1, "first entry matches -> found 1");
  // Slot gate skips the candidate entirely.
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 1, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x33] },
  ]), 0, "slot dword [p+0x2c] != 0 skips candidate");
  // Byte gate: 0x100 (low byte 0) passes, 0x1ff skips.
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 0, flag1519: 0x100, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x33] },
  ]), 1, "flag1519 low byte 0x00 (raw 0x100) passes");
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 0, flag1519: 0x1ff, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x33] },
  ]), 0, "flag1519 low byte nonzero skips");
  // Empty temp-effect vector skips the candidate (0x009be81e je skip).
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2000, entries: [] },
  ]), 0, "empty vec -> skip (begin==end)");
  // Vec walk wrap: entries at 0xfffffff0 and 0x0, end 0x10.
  assert.equal(hte9be7f0Ref(0x1000, 0x1004, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0xfffffff0, vecEnd: 0x10,
      entries: [0x99, 0x33] },
  ]), 1, "vec walk wraps 0xfffffff0 -> 0 -> 0x10 (hit on entry 1)");
  // Player walk wrap: begin 0xfffffffc -> iter 0 == end.
  assert.equal(hte9be7f0Ref(0xfffffffc, 0, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x33] },
  ]), 1, "player walk wraps 0xfffffffc -> 0 (single candidate)");
  assert.equal(hte9be7f0Ref(0xfffffffc, 0, 0x33, [
    { p2c: 1, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x33] },
  ]), 0, "wrapped single candidate skipped by slot gate");
  // Two candidates: second matches (first misses) -> found.
  assert.equal(hte9be7f0Ref(0x1000, 0x1008, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x99] },
    { p2c: 0, flag1519: 0, vecBegin: 0x3000, vecEnd: 0x3010,
      entries: [0x33] },
  ]), 1, "second candidate entry matches -> found");
  // No candidate matches -> 0.
  assert.equal(hte9be7f0Ref(0x1000, 0x1008, 0x33, [
    { p2c: 0, flag1519: 0, vecBegin: 0x2000, vecEnd: 0x2010,
      entries: [0x99] },
    { p2c: 0, flag1519: 0, vecBegin: 0x3000, vecEnd: 0x3010,
      entries: [0x44] },
  ]), 0, "no entry matches -> not-found 0");

  // Full-body differential: law-composed reference vs an independent
  // recomputation straight from the raw machine gates over random lists
  // (exercises the empty-0 polarity, the byte-gate low-byte masking, the
  // vec-empty skip, the early-exit first-hit, the wrap walks, and the
  // captured list end).
  let seed = 0x9be7f0;
  const rnd32 = () =>
    (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0);
  for (let k = 0; k < 512; k++) {
    const n = rnd32() % 6;
    const begin = rnd32() >>> 0;
    const end = (begin + n * 4) >>> 0;
    const needle = rnd32() >>> 0;
    const players = [];
    for (let i = 0; i < n; i++) {
      const len = rnd32() % 5;
      const wrapVec = len >= 2 && (rnd32() & 7) === 0;
      const vecBegin = wrapVec ? 0xfffffff0 : (0x2000 + i * 0x1000) >>> 0;
      const vecEnd = (vecBegin + len * 0x10) >>> 0;
      const entries = [];
      for (let j = 0; j < len; j++) entries.push(rnd32() >>> 0);
      players.push({
        p2c: rnd32() >>> 0,
        flag1519: rnd32() >>> 0,
        vecBegin,
        vecEnd,
        entries,
      });
    }
    const got = hte9be7f0Ref(begin, end, needle, players);

    // Independent recomputation from the raw machine gates (not the law
    // fns): PE-order cmp/je gates, low-byte flag test, stride 4/0x10 walks,
    // captured end, early-exit found arm.
    let raw = 0;
    let it = begin >>> 0;
    const lend = end >>> 0;
    if (it !== lend) {
      for (;;) {
        const p = players[(it - begin) >>> 2];
        if ((p.p2c >>> 0) === 0 && ((p.flag1519 >>> 0) & 0xff) === 0) {
          const vb = p.vecBegin >>> 0;
          const ve = p.vecEnd >>> 0;
          if (vb !== ve) {
            let e = vb;
            for (;;) {
              const ev = p.entries[((e - vb) >>> 0) >>> 4];
              if ((ev >>> 0) === (needle >>> 0)) { raw = 1; break; }
              e = (e + 0x10) >>> 0;
              if (e === ve) break;
            }
          }
        }
        if (raw === 1) break;
        it = (it + 4) >>> 0;
        if (it === lend) break;
      }
    }
    assert.equal(got, raw, `9be7f0 body diff k=${k} n=${n} needle=0x${needle.toString(16)}`);
    if (n === 0) {
      assert.equal(got, 0, `9be7f0 empty list k=${k}`);
    }
  }

  // Constants (all PE-derived this unit).
  assert.equal(hte9be7f0NextVa(), 0x009be850);
  assert.equal(hte9be7f0Va(), 0x009be7f0);
  assert.equal(hte9be7f0FirstRetVa(), 0x009be839);
  assert.equal(hte9be7f0RetVa(), 0x009be841);
  assert.equal(hte9be7f0Int3Va(), 0x009be844);
  assert.equal(hte9be7f0BodyBytes(), 0x54);
  assert.equal(hte9be7f0Sites(), 2);
  assert.equal(hte9be7f0SiteVa(), 0x006bdcb5);
  assert.equal(hte9be7f0Site2Va(), 0x007fe7ee);
  assert.equal(hte9be7f0ListBeginOfs(), 0);
  assert.equal(hte9be7f0ListEndOfs(), 4);
  assert.equal(hte9be7f0ListStride(), 4);
  assert.equal(hte9be7f0SlotFlagOfs(), 0x2c);
  assert.equal(hte9be7f0Flag1519Ofs(), 0x1519);
  assert.equal(hte9be7f0VecBeginOfs(), 0x150c);
  assert.equal(hte9be7f0VecEndOfs(), 0x1510);
  assert.equal(hte9be7f0VecStride(), 0x10);
});

/* ---------------------------------------------------------------------------
 * ABI v42 -- 0x009be850: slot-accumulator walk (address-stable, NO exact
 * ZHL).  NARROWED: the 2 host calls to 0x930220 stay host; these laws pin
 * the pure CF + full arg-prep.  Full-body reference transcribed
 * branch-by-branch from the 0x009be850 instruction stream: count =
 * SAR32(end-begin,2) @ 0x009be865..867; count==0 -> early out (je @
 * 0x009be86c); per candidate (index esi from 0, player = [begin+idx*4]):
 * host1 gate 0x009be88c..896 SIGNED ((vecA_end - vecA_begin) & ~3) >
 * 0x1c0 AND slot = [vecA_begin+0x1c0] != 0 -> host 0x930220(player+
 * 0x1508, &buf16{slot,0,[slot+0x78],0}, 1, 1); player RE-FETCHED and
 * begin RE-READ after the call (0x009be8cb/cd); twin = [player+0x1e6c]
 * (0x009be8d0); twin==0 -> tail; ebx = twin+0x1508 (host2 receiver,
 * loaded unconditionally @ 0x009be8e5); byte [twin+0x1519] != 0 -> skip
 * scan (host2 still runs); [twin+0x150c..+0x1510) empty -> skip scan
 * (host2 still runs); scan stride 0x10: [entry+0]==0 && [entry+4]==0x70
 * -> loop TAIL (SKIP host2) @ 0x009be902..90b; otherwise host2 gate
 * (identical predicate, vecA re-read @ 0x009be914..939) -> host
 * 0x930220(twin+0x1508, buf16, 1, 1); tail re-derives count (end/begin
 * RE-READ @ 0x009be966/96a) and compares UNSIGNED esi < count (jb @
 * 0x009be973); single ret 4 epilogue (void).  arg1 (0x70) DEAD.
 * ------------------------------------------------------------------------- */
function a9be850Ref(begin, end, players, va) {
  const listBegin = begin >>> 0;
  const listEnd = end >>> 0;
  let count = a9be850ListCount(listEnd, listBegin);
  if (!a9be850LoopNeeded(count)) {
    return null; // early out: no candidate is visited (je @ 0x009be86c)
  }
  let idx = 0;
  for (;;) {
    const player = players[idx];
    // host1 gate + call (pure gates; the host call itself stays host):
    const gate1 = a9be850HostGateNeeded(va.vecAEnd, va.vecABegin);
    const slot1 = gate1 ? va.slot : 0;
    if (gate1 && a9be850SlotPresent(slot1)) {
      // host 0x930220(player+0x1508, &buf16{slot1,0,[slot1+0x78],0},1,1)
      va.host1Calls += 1;
    }
    // player RE-FETCHED, begin RE-READ after the host call (0x009be8cb/cd).
    const twin = player.twin;
    if (a9be850TwinPresent(twin)) {
      // ebx = twin + 0x1508 load is unconditional (@ 0x009be8e5).
      const flagOk = a9be850Flag1519Clear(player.flag1519);
      const vecOk = a9be850TwinVecNotEmpty(player.tvecB, player.tvecE);
      let skipHost2 = false;
      if (flagOk && vecOk) {
        let it = player.tvecB >>> 0;
        for (;;) {
          const entry = player.entries[((it - player.tvecB) >>> 0) >>> 4];
          if (a9be850MarkerHit(entry.field0, entry.field4)) {
            skipHost2 = true; // loop TAIL: skip host2 (0x009be90b)
            break;
          }
          it = a9be850VecWalkNext(it);
          if (!a9be850VecWalkContinue(it, player.tvecE)) break;
        }
      }
      if (!skipHost2) {
        const gate2 = a9be850HostGateNeeded(va.vecAEnd2, va.vecABegin2);
        const slot2 = gate2 ? va.slot2 : 0;
        if (gate2 && a9be850SlotPresent(slot2)) {
          // host 0x930220(twin+0x1508, &buf16{slot2,0,[slot2+0x78],0},1,1)
          va.host2Calls += 1;
        }
      }
    }
    count = a9be850ListCount(listEnd, listBegin); // RE-DERIVED per iter
    idx = a9be850WalkNext(idx);
    if (!a9be850WalkContinue(idx, count)) break;
  }
  return { host1: va.host1Calls, host2: va.host2Calls };
}

test("JS oracle: 9be850 slot-accumulator gates (ABI v42)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 42);

  // Count (0x009be865..867): SAR32(end-begin,2), signed arithmetic shift.
  assert.equal(a9be850ListCount(0x10, 0), 4);
  assert.equal(a9be850ListCount(0x10, 8), 2);
  assert.equal(a9be850ListCount(0xffffffff, 0xfffffff3), 3);
  assert.equal(a9be850ListCount(0x80000000, 0), -0x20000000);
  assert.equal(a9be850ListCount(0, 0x80000000), -0x20000000);
  assert.equal(a9be850ListCount(4, 0), 1);
  assert.equal(a9be850ListCount(0, 8) | 0, -2);

  // Loop gate (0x009be86a..86c): FULL dword count != 0.
  assert.equal(a9be850LoopNeeded(0), false);
  assert.equal(a9be850LoopNeeded(1), true);
  assert.equal(a9be850LoopNeeded(-1), true);
  assert.equal(a9be850LoopNeeded(0x80000000), true);

  // Host gate (0x009be88c..896): SIGNED ((e-b)&~3) > 0x1c0.  The jle is
  // signed, so a masked delta that is negative in int32 never fires.
  assert.equal(a9be850HostGateNeeded(0x1c4, 0), true);
  assert.equal(a9be850HostGateNeeded(0x1c0, 0), false);
  assert.equal(a9be850HostGateNeeded(0x1c3, 0), false); // masked 0x1c0
  assert.equal(a9be850HostGateNeeded(0x1c0, 4), false);
  assert.equal(a9be850HostGateNeeded(0, 0), false);
  assert.equal(a9be850HostGateNeeded(0xffffffff, 0), false); // signed neg
  assert.equal(a9be850HostGateNeeded(0xfffffff0, 0), false);
  assert.equal(a9be850HostGateNeeded(0x1c400000, 0x1c400000), false);
  assert.equal(a9be850HostGateNeeded(0x40, 0xffffffff), false);

  // Slot presence (0x009be898..8a0): FULL dword != 0.
  assert.equal(a9be850SlotPresent(0), false);
  assert.equal(a9be850SlotPresent(1), true);
  assert.equal(a9be850SlotPresent(0x100), true);
  assert.equal(a9be850SlotPresent(0xffffffff), true);

  // Twin presence (0x009be8d0..d8): FULL dword [player+0x1e6c] != 0.
  assert.equal(a9be850TwinPresent(0), false);
  assert.equal(a9be850TwinPresent(1), true);
  assert.equal(a9be850TwinPresent(0x100), true);

  // Flag gate (0x009be8de..eb): RAW uint32, LOW byte == 0.
  assert.equal(a9be850Flag1519Clear(0), true);
  assert.equal(a9be850Flag1519Clear(0x100), true);
  assert.equal(a9be850Flag1519Clear(0x1ff), false);
  assert.equal(a9be850Flag1519Clear(0xffffffff), false);

  // Twin vec non-empty (0x009be8f9..fb): FULL dword begin != end.
  assert.equal(a9be850TwinVecNotEmpty(0, 0x10), true);
  assert.equal(a9be850TwinVecNotEmpty(0x10, 0x10), false);
  assert.equal(a9be850TwinVecNotEmpty(0xffffffff, 0xffffffff), false);

  // Marker (0x009be902..90b): FULL dwords [entry+0]==0 && [entry+4]==0x70.
  assert.equal(a9be850MarkerHit(0, 0x70), true);
  assert.equal(a9be850MarkerHit(0x100, 0x70), false);
  assert.equal(a9be850MarkerHit(0, 0x71), false);
  assert.equal(a9be850MarkerHit(0x100, 0x100), false);
  assert.equal(a9be850MarkerHit(0, 0x170), false);

  // Marker vec walk (0x009be90d / 0x009be910..912): stride 16 wrap.
  assert.equal(a9be850VecWalkNext(0), 0x10);
  assert.equal(a9be850VecWalkNext(0xfffffff0), 0);
  assert.equal(a9be850VecWalkNext(0xffffffff), 0xf);
  assert.equal(a9be850VecWalkContinue(0x10, 0x10), false);
  assert.equal(a9be850VecWalkContinue(0x10, 0x20), true);
  assert.equal(a9be850VecWalkContinue(0, 0xffffffff), true);

  // Outer index walk (0x009be969 inc / 0x009be966..973 re-derived count
  // with UNSIGNED jb compare).
  assert.equal(a9be850WalkNext(0), 1);
  assert.equal(a9be850WalkNext(0xffffffff), 0);
  assert.equal(a9be850WalkContinue(0, 4), true);
  assert.equal(a9be850WalkContinue(4, 4), false);
  assert.equal(a9be850WalkContinue(0, -1), true);   // unsigned 0 < huge
  assert.equal(a9be850WalkContinue(-1, 4), false);  // unsigned huge < 4 no
  assert.equal(a9be850WalkContinue(-1, -1), false); // unsigned equal

  // Full-body PE-truth: host1/host2 call counts over hand-built worlds.
  // Empty list -> early out (je @ 0x009be86c): no candidate visited.
  assert.equal(a9be850Ref(0x1000, 0x1000, [], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  }), null, "empty list -> early out (no candidate)");

  // Single candidate, gate1 passes, twin absent -> host1=1, host2=0.
  let w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0, flag1519: 0, tvecB: 0, tvecE: 0, entries: [] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 1, "gate1 passes -> host1 called");
  assert.equal(w.host2, 0, "twin absent -> tail, no host2");
  assert.equal(a9be850LoopNeeded(a9be850ListCount(0x1004, 0x1000)), true);

  // gate1 blocked by slot==0 -> host1 skipped.
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0, flag1519: 0, tvecB: 0, tvecE: 0, entries: [] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 0, "slot absent -> no host1");

  // gate1 blocked by size: SIGNED masked delta == threshold -> skip.
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0, flag1519: 0, tvecB: 0, tvecE: 0, entries: [] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c0, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c0, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 0, "masked delta == 0x1c0 -> jle skip");

  // Twin present, flag allows scan, vec empty -> host2 still runs.
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0x5000, flag1519: 0, tvecB: 0x6000, tvecE: 0x6000, entries: [] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 1, "gate1 passes -> host1 called");
  assert.equal(w.host2, 1, "twin vec empty -> scan skipped, host2 runs");

  // Marker found -> SKIP host2.
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0x5000, flag1519: 0, tvecB: 0x6000, tvecE: 0x6020,
      entries: [{ field0: 0x11, field4: 0x22 },
                { field0: 0, field4: 0x70 }] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 1, "gate1 passes -> host1 called");
  assert.equal(w.host2, 0, "marker [0]==0 && [4]==0x70 -> SKIP host2");

  // Byte flag != 0 -> scan skipped, host2 still runs (jne @ 0x009be8eb).
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0x5000, flag1519: 0x1ff, tvecB: 0x6000, tvecE: 0x6010,
      entries: [{ field0: 0, field4: 0x70 }] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host2, 1, "flag1519 low byte nonzero -> scan skipped, host2");

  // Marker vec walk wraps 0xfffffff0 -> 0 -> 0x10.
  w = a9be850Ref(0x1000, 0x1004, [
    { twin: 0x5000, flag1519: 0, tvecB: 0xfffffff0, tvecE: 0x10,
      entries: [{ field0: 0x55, field4: 0x66 },
                { field0: 0, field4: 0x70 }] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host2, 0, "marker found after vec wrap -> skip host2");

  // Two candidates: both gates pass; second marker skips its host2.
  w = a9be850Ref(0x1000, 0x1008, [
    { twin: 0x5000, flag1519: 0, tvecB: 0x6000, tvecE: 0x6010,
      entries: [{ field0: 0x11, field4: 0x22 }] },
    { twin: 0x5004, flag1519: 0, tvecB: 0x7000, tvecE: 0x7020,
      entries: [{ field0: 0, field4: 0x70 }] },
  ], {
    vecABegin: 0x2000, vecAEnd: 0x21c4, slot: 0x4000,
    vecABegin2: 0x2000, vecAEnd2: 0x21c4, slot2: 0x4000,
    host1Calls: 0, host2Calls: 0,
  });
  assert.equal(w.host1, 2, "both gates pass -> host1 twice");
  assert.equal(w.host2, 1, "second candidate marker -> its host2 skipped");

  // Constants (all PE-derived this unit).
  assert.equal(a9be850NextVa(), 0x009be990);
  assert.equal(a9be850Va(), 0x009be850);
  assert.equal(a9be850RetVa(), 0x009be97f);
  assert.equal(a9be850Int3Va(), 0x009be982);
  assert.equal(a9be850BodyBytes(), 0x132);
  assert.equal(a9be850Sites(), 1);
  assert.equal(a9be850SiteVa(), 0x00772bcf);
  assert.equal(a9be850ListBeginOfs(), 0);
  assert.equal(a9be850ListEndOfs(), 4);
  assert.equal(a9be850ListStride(), 4);
  assert.equal(a9be850ManagerGlobalVa(), 0x00c7169c);
  assert.equal(a9be850VecABeginOfs(), 0x2a41c);
  assert.equal(a9be850VecAEndOfs(), 0x2a420);
  assert.equal(a9be850VecASlotOfs(), 0x1c0);
  assert.equal(a9be850HostGateThreshold(), 0x1c0);
  assert.equal(a9be850HostGateMask(), 0xfffffffc);
  assert.equal(a9be850SlotFieldOfs(), 0x78);
  assert.equal(a9be850HostReceiverOfs(), 0x1508);
  assert.equal(a9be850TwinFieldOfs(), 0x1e6c);
  assert.equal(a9be850Flag1519Ofs(), 0x1519);
  assert.equal(a9be850TwinVecBeginOfs(), 0x150c);
  assert.equal(a9be850TwinVecEndOfs(), 0x1510);
  assert.equal(a9be850TwinVecStride(), 0x10);
  assert.equal(a9be850MarkerField0Value(), 0);
  assert.equal(a9be850MarkerField4Value(), 0x70);
  assert.equal(a9be850HostVa(), 0x00930220);
  assert.equal(a9be850HostArg2(), 1);
  assert.equal(a9be850HostArg3(), 1);
  assert.equal(a9be850GameGlobalVa(), 0x00c71678);
  assert.equal(a9be850ReceiverOfs(), 0x1baa8);
  assert.equal(a9be850CallerArg1(), 0x70);
});

/* ---------------------------------------------------------------------------
 * ABI v43 -- 0x009be990: PURE bool scan (address-stable, NO exact ZHL).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Full-body reference
 * transcribed branch-by-branch from the 0x009be990 instruction stream:
 * eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry);
 * cmp eax,ecx / je NOT-FOUND (0x009be995..997); per candidate
 * (edx = player = [iter], iter from begin, stride 4):
 *   code = [player+0x3fc] FULL dword (0x009be9a2)
 *   test edx,edx / je advance (0x009be9a8..aa)
 *   cmp edx,3 / jne FOUND   (0x009be9ac..af)
 *   advance: add eax,4 (0x009be9b1); cmp eax,ecx / jne loop (0x009be9b4..b6)
 * FOUND: mov al,1; ret (0x009be9bb..bd).  NOT-FOUND: xor al,al; ret
 * (0x009be9b8..ba).  Loop bound END CAPTURED ONCE — NEVER re-read.
 * ------------------------------------------------------------------------- */
function a9be990Ref(begin, end, codes) {
  const listBegin = begin >>> 0;
  const listEnd = end >>> 0;
  // cmp eax,ecx / je NOT-FOUND (0x009be997): empty -> al=0 immediately.
  if (a9be990ListEmpty(listBegin, listEnd)) {
    return 0;
  }
  let iter = listBegin;
  let idx = 0;
  for (;;) {
    // edx = [iter] player; code = [player+0x3fc] FULL dword.
    const code = codes[idx];
    if (a9be990Hit(code)) {
      return 1; // jne @ 0x009be9af -> FOUND al=1
    }
    iter = a9be990WalkNext(iter);              // add eax,4
    if (!a9be990WalkContinue(iter, listEnd)) {
      break; // jne @ 0x009be9b6 not taken -> loop exhausted
    }
    idx += 1;
  }
  return 0; // xor al,al @ 0x009be9b8
}

test("JS oracle: 9be990 PURE bool scan (ABI v43)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 43);

  // Hit (0x009be9a2..0x009be9af): FULL dword on [player+0x3fc].
  // test/je ==0 advance; cmp/jne !=3 advance; else FOUND.
  assert.equal(a9be990Hit(0), false);          // ==0 -> advance
  assert.equal(a9be990Hit(3), false);          // ==3 -> advance
  assert.equal(a9be990Hit(1), true);           // FOUND
  assert.equal(a9be990Hit(2), true);           // FOUND
  assert.equal(a9be990Hit(0x100), true);       // FULL dword (not low byte)
  assert.equal(a9be990Hit(0x1ff), true);       // FULL dword
  assert.equal(a9be990Hit(0xffffffff), true);  // FULL dword
  assert.equal(a9be990Hit(0x10000003), true);  // != 3 as FULL dword
  assert.equal(a9be990Hit(-1), true);          // 0xffffffff != 0/3

  // Empty gate (0x009be995..997): FULL dword begin==end -> NOT-FOUND.
  assert.equal(a9be990ListEmpty(0x1000, 0x1000), true);
  assert.equal(a9be990ListEmpty(0x1000, 0x1004), false);
  assert.equal(a9be990ListEmpty(0xffffffff, 0xffffffff), true);
  assert.equal(a9be990ListEmpty(0, 0xffffffff), false);

  // Walk next (0x009be9b1): add eax,4, 32-bit wrap.
  assert.equal(a9be990WalkNext(0), 4);
  assert.equal(a9be990WalkNext(0xfffffffc) >>> 0, 0);
  assert.equal(a9be990WalkNext(0xffffffff) >>> 0, 3);

  // Walk continue (0x009be9b4..b6): FULL dword next != end; end captured
  // ONCE pre-loop (ecx @ 0x009be992) — walking PAST end still continues.
  assert.equal(a9be990WalkContinue(4, 4), false);
  assert.equal(a9be990WalkContinue(4, 8), true);
  assert.equal(a9be990WalkContinue(0x30, 0x20), true); // past end, !=
  assert.equal(a9be990WalkContinue(0, 0xffffffff), true);
  assert.equal(a9be990WalkContinue(0xffffffff, 4), true); // past end, != -> walk

  // Full-body PE-truth: empty list -> NOT-FOUND without examining anyone.
  assert.equal(a9be990Ref(0x1000, 0x1000, []), 0, "empty -> al=0 (je)");

  // Only skip codes -> loop exhausted -> NOT-FOUND.
  assert.equal(a9be990Ref(0x1000, 0x1004, [0]), 0);
  assert.equal(a9be990Ref(0x1000, 0x1004, [3]), 0);
  assert.equal(a9be990Ref(0x1000, 0x1008, [0, 3]), 0);
  assert.equal(a9be990Ref(0x1000, 0x100c, [0, 3, 3]), 0);

  // Hit at first / later candidate -> FOUND (al=1).
  assert.equal(a9be990Ref(0x1000, 0x1004, [1]), 1);
  assert.equal(a9be990Ref(0x1000, 0x100c, [0, 3, 2]), 1);
  assert.equal(a9be990Ref(0x1000, 0x1008, [3, 0x100]), 1); // second FOUND

  // Wrap walk: begin 0xfffffffc, end 0x0 -> one candidate then step wraps
  // to 0x0 == end -> loop exhausted.
  assert.equal(a9be990Ref(0xfffffffc, 0, [1]), 1, "hit before wrap end");
  assert.equal(a9be990Ref(0xfffffffc, 0, [3]), 0, "skip -> wrap to end");

  // Constants (all PE-derived this unit).
  assert.equal(a9be990NextVa(), 0x009be9c0);
  assert.equal(a9be990Va(), 0x009be990);
  assert.equal(a9be990FirstRetVa(), 0x009be9ba);
  assert.equal(a9be990RetVa(), 0x009be9bd);
  assert.equal(a9be990Int3Va(), 0x009be9be);
  assert.equal(a9be990BodyBytes(), 0x2e);
  assert.equal(a9be990Sites(), 2);
  assert.equal(a9be990SiteVa(), 0x004531b6);
  assert.equal(a9be990Site2Va(), 0x0049118a);
  assert.equal(a9be990ListBeginOfs(), 0);
  assert.equal(a9be990ListEndOfs(), 4);
  assert.equal(a9be990ListStride(), 4);
  assert.equal(a9be990SlotFieldOfs(), 0x3fc);
  assert.equal(a9be990SkipCodeZero(), 0);
  assert.equal(a9be990SkipCodeThree(), 3);
  assert.equal(a9be990ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9be990ReceiverOfs(), 0x1baa8);
});

/* ---------------------------------------------------------------------------
 * ABI v44 -- 0x009be9c0: PURE bool scan (address-stable, NO exact ZHL).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Full-body reference
 * transcribed branch-by-branch from the 0x009be9c0 instruction stream:
 * eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry,
 * end NEVER re-read per iteration — matches a9be990, NOT a9be850).
 * cmp/je begin==end -> NOT-FOUND (0x009be9c7).  Per candidate
 * (edx = player = [iter], iter stride 4 from begin):
 *   cmp byte [edx+0x20a9],0 / jne advance (0x009be9d2..d9): byte!=0 skip
 *   code = FULL dword [player+0x184] (0x009be9db)
 *   test/je code==0 FOUND; cmp/je code==3 FOUND; cmp/je code==1 FOUND;
 *   cmp/je code==2 FOUND (0x009be9e1..f2) — FOUND iff code IN {0,1,2,3}
 * add eax,4 (0x009be9f4); cmp/jne next != end -> loop (0x009be9f7..f9).
 * Loop-exhausted -> xor al,al; ret (0x009be9fb..fd).  FOUND -> mov al,1;
 * ret (0x009be9fe..a00).  players = [[flag20a9, field184], ...].
 * ------------------------------------------------------------------------- */
function a9be9c0Ref(begin, end, players) {
  const listBegin = begin >>> 0;
  const listEnd = end >>> 0;
  // cmp eax,ecx / je NOT-FOUND (0x009be9c7): empty -> al=0 immediately.
  if (a9be9c0ListEmpty(listBegin, listEnd)) {
    return 0;
  }
  let iter = listBegin;
  let idx = 0;
  for (;;) {
    const [flag20a9, field184] = players[idx];
    // cmp byte [edx+0x20a9],0 / jne advance (0x009be9d2..d9): byte != 0
    // -> candidate skipped regardless of field184.
    if (a9be9c0Flag20a9Checkable(flag20a9)) {
      // FULL dword [player+0x184] IN {0,1,2,3} -> FOUND (0x009be9db..f2).
      if (a9be9c0Field184Found(field184)) {
        return 1; // mov al,1; ret @ 0x009be9fe..a00
      }
    }
    iter = a9be9c0WalkNext(iter);              // add eax,4
    if (!a9be9c0WalkContinue(iter, listEnd)) {
      break; // jne @ 0x009be9f9 not taken -> loop exhausted
    }
    idx += 1;
  }
  return 0; // xor al,al; ret @ 0x009be9fb..fd
}

test("JS oracle: 9be9c0 PURE bool scan (ABI v44)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 44);

  // Empty gate (0x009be9c5..c7): FULL dword begin==end -> NOT-FOUND.
  assert.equal(a9be9c0ListEmpty(0x1000, 0x1000), true);
  assert.equal(a9be9c0ListEmpty(0x1000, 0x1004), false);
  assert.equal(a9be9c0ListEmpty(0xffffffff, 0xffffffff), true);
  assert.equal(a9be9c0ListEmpty(0, 0xffffffff), false);

  // Byte gate flag20a9 (0x009be9d2..d9): cmp byte [edx+0x20a9],0 / jne
  // advance.  RAW uint32 LOW byte only: WIDE values 0x100/0x1ff/
  // 0xffffffff must be re-narrowed to al.
  assert.equal(a9be9c0Flag20a9Checkable(0), true);
  assert.equal(a9be9c0Flag20a9Checkable(0xff), false);
  assert.equal(a9be9c0Flag20a9Checkable(0x100), true);
  assert.equal(a9be9c0Flag20a9Checkable(0x1ff), false);
  assert.equal(a9be9c0Flag20a9Checkable(0xffffffff), false);
  assert.equal(a9be9c0Flag20a9Checkable(-1), false);
  assert.equal(a9be9c0Flag20a9Checkable(0x200), true);

  // Found law (0x009be9db..f2): FULL dword [player+0x184] IN {0,1,2,3}
  // (test/je ==0, cmp/je ==3, cmp/je ==1, cmp/je ==2, all -> FOUND).
  assert.equal(a9be9c0Field184Found(0), true);
  assert.equal(a9be9c0Field184Found(1), true);
  assert.equal(a9be9c0Field184Found(2), true);
  assert.equal(a9be9c0Field184Found(3), true);
  assert.equal(a9be9c0Field184Found(4), false);
  assert.equal(a9be9c0Field184Found(0x100), false);   // FULL dword
  assert.equal(a9be9c0Field184Found(0x1ff), false);   // FULL dword
  assert.equal(a9be9c0Field184Found(0xffffffff), false);
  assert.equal(a9be9c0Field184Found(0x10000003), false);
  assert.equal(a9be9c0Field184Found(-1), false);

  // Walk next (0x009be9f4): add eax,4, 32-bit wrap.
  assert.equal(a9be9c0WalkNext(0), 4);
  assert.equal(a9be9c0WalkNext(0xfffffffc) >>> 0, 0);
  assert.equal(a9be9c0WalkNext(0xffffffff) >>> 0, 3);

  // Walk continue (0x009be9f7..f9): FULL dword next != end; end captured
  // ONCE pre-loop (ecx @ 0x009be9c2) — walking PAST end still continues.
  assert.equal(a9be9c0WalkContinue(4, 4), false);
  assert.equal(a9be9c0WalkContinue(4, 8), true);
  assert.equal(a9be9c0WalkContinue(0x30, 0x20), true);
  assert.equal(a9be9c0WalkContinue(0, 0xffffffff), true);
  assert.equal(a9be9c0WalkContinue(0xffffffff, 4), true);

  // Full-body PE-truth: empty list -> NOT-FOUND.
  assert.equal(a9be9c0Ref(0x1000, 0x1000, []), 0, "empty -> al=0 (je)");

  // Flag gate skips regardless of field: 0xff -> advance even with
  // field 0 / 1 / 2 / 3.
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0xff, 0]]), 0, "flag!=0 skip");
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0xff, 2]]), 0);
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0x1ff, 0]]), 0);
  assert.equal(a9be9c0Ref(0x1000, 0x100c, [[0xff, 0], [0xff, 0], [0xff, 0]]), 0);

  // Field not in {0,1,2,3} -> advance -> loop exhausted -> NOT-FOUND.
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 4]]), 0);
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 0x100]]), 0, "FULL dword");
  assert.equal(a9be9c0Ref(0x1000, 0x1008, [[0, 4], [0, 5]]), 0);
  assert.equal(a9be9c0Ref(0x1000, 0x100c, [[0xff, 0], [0, 4], [0, 4]]), 0);

  // FOUND on each member of {0,1,2,3}, first or later candidate.
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 0]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 1]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 2]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x1004, [[0, 3]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x100c, [[0xff, 0], [0x100, 4], [0, 2]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x1008, [[0, 4], [0, 3]]), 1);
  assert.equal(a9be9c0Ref(0x1000, 0x1008, [[0, 2], [0, 4]]), 1, "hit first");

  // Wrap walk: begin 0xfffffffc, end 0x0 -> one candidate then step wraps
  // to 0x0 == end -> loop exhausted.
  assert.equal(a9be9c0Ref(0xfffffffc, 0, [[0, 1]]), 1, "hit before wrap");
  assert.equal(a9be9c0Ref(0xfffffffc, 0, [[0, 4]]), 0, "skip -> wrap end");

  // Constants (all PE-derived this unit; 1-site census re-verified).
  assert.equal(a9be9c0NextVa(), 0x009bea10);
  assert.equal(a9be9c0Va(), 0x009be9c0);
  assert.equal(a9be9c0FirstRetVa(), 0x009be9fd);
  assert.equal(a9be9c0RetVa(), 0x009bea00);
  assert.equal(a9be9c0Int3Va(), 0x009bea01);
  assert.equal(a9be9c0BodyBytes(), 0x41);
  assert.equal(a9be9c0Sites(), 1);
  assert.equal(a9be9c0SiteVa(), 0x006c83b3);
  assert.equal(a9be9c0ListBeginOfs(), 0);
  assert.equal(a9be9c0ListEndOfs(), 4);
  assert.equal(a9be9c0ListStride(), 4);
  assert.equal(a9be9c0Flag20a9Ofs(), 0x20a9);
  assert.equal(a9be9c0Field184Ofs(), 0x184);
  assert.equal(a9be9c0FoundCodeZero(), 0);
  assert.equal(a9be9c0FoundCodeOne(), 1);
  assert.equal(a9be9c0FoundCodeTwo(), 2);
  assert.equal(a9be9c0FoundCodeThree(), 3);
  assert.equal(a9be9c0ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9be9c0ReceiverOfs(), 0x1baa8);
  assert.equal(a9be9c0ReceiverGetterVa(), 0x00417860);
});

/* ---------------------------------------------------------------------------
 * ABI v45 -- 0x009bea40: PURE f32-sum walk (address-stable, NO exact ZHL).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  Full-body reference
 * transcribed branch-by-branch from the 0x009bea40 instruction stream:
 * eax = [this+0] begin; ecx = [this+4] end (BOTH captured ONCE at entry,
 * end NEVER re-read per iteration); xorps xmm0,xmm0 -> sum = +0.0f;
 * cmp/je begin==end -> ret +0.0f (0x009bea4a).  Per candidate
 * (edx = player = [iter], iter stride 4 from begin):
 *   FULL dword [edx+0x2c] != 0 -> ADVANCE (jne @ 0x009bea56)
 *   byte [edx+0x20a9] != 0 -> ADVANCE (jne @ 0x009bea5f)
 *   xmm0 = addss(xmm0, f32 [edx+0x156c]) (f32 round-to-nearest-even)
 * add eax,4 (0x009bea69); cmp/jne next != end -> loop (0x009bea6c..6e).
 * Loop-exhausted -> ret sum (xmm0, 0x009bea70).  players = [[field2c,
 * flag20a9, field156c], ...] where field156c is a JS f32 number (model
 * a9bea40Field156cAddSs re-rounds each add to f32 like addss).
 * ------------------------------------------------------------------------- */
function a9bea40Ref(begin, end, players) {
  const listBegin = begin >>> 0;
  const listEnd = end >>> 0;
  // xorps xmm0,xmm0; cmp/je begin==end -> ret +0.0f (loop never runs).
  if (a9bea40ListEmpty(listBegin, listEnd)) {
    return 0.0;
  }
  let sum = 0.0; // +0.0f accumulator in xmm0
  let iter = listBegin;
  let idx = 0;
  for (;;) {
    const [field2c, flag20a9, field156c] = players[idx];
    // cmp dword [edx+0x2c],0 / jne advance: FULL dword gate.
    if (a9bea40SlotCheckable(field2c)) {
      // cmp byte [edx+0x20a9],0 / jne advance: RAW low byte gate.
      if (a9bea40Flag20a9Checkable(flag20a9)) {
        // addss xmm0,[edx+0x156c]: f32 re-round per add.
        sum = a9bea40Field156cAddSs(sum, field156c);
      }
    }
    iter = a9bea40WalkNext(iter);              // add eax,4
    if (!a9bea40WalkContinue(iter, listEnd)) {
      break; // jne @ 0x009bea6e not taken -> loop exhausted
    }
    idx += 1;
  }
  return sum; // ret xmm0 @ 0x009bea70
}

test("JS oracle: 9bea40 PURE f32-sum walk (ABI v45)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 45);

  // Empty gate (0x009bea48..4a): FULL dword begin==end -> sum +0.0f.
  assert.equal(a9bea40ListEmpty(0x1000, 0x1000), true);
  assert.equal(a9bea40ListEmpty(0x1000, 0x1004), false);
  assert.equal(a9bea40ListEmpty(0xffffffff, 0xffffffff), true);
  assert.equal(a9bea40ListEmpty(0, 0xffffffff), false);

  // Slot gate (0x009bea52..56): FULL dword [p+0x2c]==0 -> may add.
  assert.equal(a9bea40SlotCheckable(0), true);
  assert.equal(a9bea40SlotCheckable(1), false);
  assert.equal(a9bea40SlotCheckable(0x100), false);   // FULL dword
  assert.equal(a9bea40SlotCheckable(0xffffffff), false);
  assert.equal(a9bea40SlotCheckable(-1), false);

  // Byte gate flag20a9 (0x009bea58..5f): RAW low byte ==0 -> may add.
  assert.equal(a9bea40Flag20a9Checkable(0), true);
  assert.equal(a9bea40Flag20a9Checkable(0xff), false);
  assert.equal(a9bea40Flag20a9Checkable(0x100), true);
  assert.equal(a9bea40Flag20a9Checkable(0x1ff), false);
  assert.equal(a9bea40Flag20a9Checkable(0xffffffff), false);
  assert.equal(a9bea40Flag20a9Checkable(-1), false);

  // addss law (0x009bea61): f32 round-to-nearest-even per add.
  assert.equal(a9bea40Field156cAddSs(1.5, 2.25), 3.75);
  assert.equal(a9bea40Field156cAddSs(16777216.0, 1.0), 16777216.0);
  assert.equal(a9bea40Field156cAddSs(-0.0, 0.0), 0.0); // +0 + -0 = +0
  assert.ok(Number.isNaN(a9bea40Field156cAddSs(0.0, NaN)), "addss NaN");

  // Walk next (0x009bea69): add eax,4, 32-bit wrap.
  assert.equal(a9bea40WalkNext(0), 4);
  assert.equal(a9bea40WalkNext(0xfffffffc) >>> 0, 0);
  assert.equal(a9bea40WalkNext(0xffffffff) >>> 0, 3);

  // Walk continue (0x009bea6c..6e): FULL dword next != end; end captured
  // ONCE pre-loop (ecx @ 0x009bea45) — walking PAST end still continues.
  assert.equal(a9bea40WalkContinue(4, 4), false);
  assert.equal(a9bea40WalkContinue(4, 8), true);
  assert.equal(a9bea40WalkContinue(0x30, 0x20), true);
  assert.equal(a9bea40WalkContinue(0, 0xffffffff), true);
  assert.equal(a9bea40WalkContinue(0xffffffff, 4), true);

  // Full-body PE-truth: empty -> +0.0f without examining anyone.
  assert.equal(a9bea40Ref(0x1000, 0x1000, []), 0.0, "empty -> +0.0f");

  // Gates skip: field2c != 0 or flag20a9 low byte != 0 -> no add.
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[1, 0, 5.0]]), 0.0, "slot gate");
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0, 1, 5.0]]), 0.0, "flag gate");
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0x100, 0, 5.0]]), 0.0, "FULL dword slot");
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0, 0x1ff, 5.0]]), 0.0, "FULL dword flag");

  // Single candidate adds its f32.
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0, 0, 1.5]]), 1.5);
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0, 0, 2.5]]), 2.5);
  assert.equal(a9bea40Ref(0x1000, 0x1004, [[0, 0, -3.25]]), -3.25);

  // f32 accumulation semantics: each add re-rounds to f32 (addss).
  // 2^24 + 1 rounds back down to 2^24, then stays.
  assert.equal(a9bea40Ref(0x1000, 0x1008, [[0, 0, 16777216.0], [0, 0, 1.0]]),
               16777216.0, "f32 rounding per add");
  // Three candidates: 1.5 + 2.25 = 3.75, then + 0.25 = 4.0.
  assert.equal(a9bea40Ref(0x1000, 0x100c, [[0, 0, 1.5], [0, 0, 2.25], [0, 0, 0.25]]),
               4.0);
  // Skipped middle candidate does not contribute.
  assert.equal(a9bea40Ref(0x1000, 0x100c, [[0, 0, 1.5], [0, 0xff, 2.25], [0, 0, 0.25]]),
               1.75);
  // Negative + positive cancellation.
  assert.equal(a9bea40Ref(0x1000, 0x1008, [[0, 0, 100.0], [0, 0, -37.5]]), 62.5);

  // Wrap walk: begin 0xfffffffc, end 0x0 -> one candidate then step wraps
  // to 0x0 == end -> loop exhausted.
  assert.equal(a9bea40Ref(0xfffffffc, 0, [[0, 0, 7.0]]), 7.0, "hit before wrap");
  assert.equal(a9bea40Ref(0xfffffffc, 0, [[1, 0, 7.0]]), 0.0, "skip -> wrap end");

  // NaN propagates through the accumulate chain (addss NaN lane).
  assert.ok(Number.isNaN(a9bea40Ref(0x1000, 0x1008, [[0, 0, 1.0], [0, 0, NaN]])),
            "NaN propagates");

  // Constants (all PE-derived this unit; 3-site census re-verified).
  assert.equal(a9bea40NextVa(), 0x009bea80);
  assert.equal(a9bea40Va(), 0x009bea40);
  assert.equal(a9bea40FirstRetVa(), 0x009bea70);
  assert.equal(a9bea40RetVa(), 0x009bea70);
  assert.equal(a9bea40Int3Va(), 0x009bea71);
  assert.equal(a9bea40BodyBytes(), 0x31);
  assert.equal(a9bea40Sites(), 3);
  assert.equal(a9bea40Site0Va(), 0x0065ab45);
  assert.equal(a9bea40Site1Va(), 0x006c8fdd);
  assert.equal(a9bea40Site2Va(), 0x007fb912);
  assert.equal(a9bea40ListBeginOfs(), 0);
  assert.equal(a9bea40ListEndOfs(), 4);
  assert.equal(a9bea40ListStride(), 4);
  assert.equal(a9bea40SlotFlagOfs(), 0x2c);
  assert.equal(a9bea40Flag20a9Ofs(), 0x20a9);
  assert.equal(a9bea40Field156cOfs(), 0x156c);
  assert.equal(a9bea40ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9bea40ReceiverOfs(), 0x1baa8);
  assert.equal(a9bea40ReceiverGetterVa(), 0x00417860);
});

/* ---------------------------------------------------------------------------
 * ABI v46 -- 0x009bea80: GetTrinketMultiplier (EXACT ZHL 18 B:
 * `__thiscall int PlayerManager::GetTrinketMultiplier(int TrinketID);`).
 * NARROWED: the slot-flag gates + walk + 32-bit wrap sum are pure; the TWO
 * host calls 0x007cb6e0 (HUD-family count resolver ABI v19, typed host
 * event) stay host.  Full-body reference transcribed branch-by-branch from
 * the 0x009bea80 instruction stream:
 *   g = [0xc7169c]; slotArray = [g+0x2a410..+0x2a414)
 *   idm = id & 0x7fff (and @ 0x009beaa3)
 *   count = SAR32(slotEnd - slotBegin, 2) (sub/sar @ 0x009beaa9..af)
 *   flag byte [esp+0x13] = 0; if (int32)idm < (int32)count (SIGNED jge @
 *     0x009beab5): slot = slotArray[idm]; if slot != 0 (je @ 0x009beabc):
 *     if bit31([slot+0xb8]) (and 0x80000000 / or eax,0 / jne @
 *     0x009beac4..d1): flag = 1
 *   esi = [this+0] begin; edi = 0; cmp esi,[this+4] / je ret-0 (@
 *     0x009bead8..df)
 *   per player = [iter] (stride 4): FULL dword [p+0x2c]==0 (jne @
 *     0x009beae9) -> HOST1 0x7cb6e0(p, RAW id); edi += eax (wrap);
 *     flag LOW byte != 0 AND [p+0x1e6c] != 0 (je @ 0x009beafa/0x009beb04)
 *     -> HOST2 0x7cb6e0(twin, RAW id); edi += eax
 *   iter += 4; next != [this+4] RE-READ (jne @ 0x009beb1d) -> loop
 *   ret edi (mov eax,edi @ 0x009beb1f)
 * players = [[field2c, twinPtr, playerStatus, twinStatus], ...] — the two
 * status values are MOCK host results the reference composes through the
 * pure gates (both hosts receive the UNMASKED raw id).
 * ------------------------------------------------------------------------- */
function gtm9bea80Ref(listBegin, listEnd, slotBegin, slotEnd, slotArray, id, players) {
  const begin = listBegin >>> 0;
  const end = listEnd >>> 0;
  // Pre-walk slot-flag byte (0x009bea89..0x009bead3).
  let flag = 0;
  {
    const idm = gtm9bea80IdMask(id);                       // and edx,0x7fff
    const count = gtm9bea80ListCount(slotEnd, slotBegin);  // SAR32(e-b,2)
    // cmp edx,eax / jge skip (SIGNED).
    if (gtm9bea80RangeGate(idm, count)) {
      const slot = slotArray[idm];                          // [esi+edx*4]
      if (slot !== undefined && slot !== null) {            // test/je
        // and eax,0x80000000 / or eax,0 / jne keep.
        if (gtm9bea80SlotFlag(slot)) flag = 1;
      }
    }
  }
  // Walk: cmp esi,[this+4] / je ret-0.
  if (gtm9bea80ListEmpty(begin, end)) {
    return 0;
  }
  let sum = 0; // edi
  let iter = begin;
  let idx = 0;
  for (;;) {
    const [field2c, twinPtr, playerStatus, twinStatus] = players[idx];
    // cmp dword [ebx+0x2c],0 / jne advance (FULL dword).
    if (gtm9bea80SlotCheckable(field2c)) {
      // HOST1 0x7cb6e0(player, RAW id); add edi,eax.
      sum = gtm9bea80SumAdd(sum, playerStatus);
      // cmp byte [esp+0x13],0 / je; test [p+0x1e6c] / je.
      if (gtm9bea80TwinCallNeeded(flag, twinPtr)) {
        // HOST2 0x7cb6e0(twin, RAW id); add edi,eax.
        sum = gtm9bea80SumAdd(sum, twinStatus);
      }
    }
    iter = gtm9bea80WalkNext(iter);              // add esi,4
    if (!gtm9bea80WalkContinue(iter, end)) {
      break; // jne @ 0x009beb1d not taken -> loop exhausted
    }
    idx += 1;
  }
  return sum >>> 0; // mov eax,edi; ret 4 @ 0x009beb27
}

test("JS oracle: 9bea80 GetTrinketMultiplier islands (ABI v46)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 46);

  // Id mask (0x009beaa3): RAW id & 0x7fff.
  assert.equal(gtm9bea80IdMask(0x8f), 0x8f);
  assert.equal(gtm9bea80IdMask(0x800f), 0xf);
  assert.equal(gtm9bea80IdMask(0x10000), 0);
  assert.equal(gtm9bea80IdMask(0xffffffff), 0x7fff);

  // Count (0x009beaa9..af): SAR32(end-begin,2), signed arithmetic shift.
  assert.equal(gtm9bea80ListCount(0x1000, 0), 0x400);
  assert.equal(gtm9bea80ListCount(0xffffffff, 0) | 0, -1); // wrapped -1
  assert.equal(gtm9bea80ListCount(0xfffffff8, 0) | 0, -2); // wrapped -8 sar 2
  assert.equal(gtm9bea80ListCount(4, 0), 1);
  assert.equal(gtm9bea80ListCount(0, 4) | 0, -1); // 0-4 wraps to -4 -> sar -1

  // Range gate (0x009beab3..b5): SIGNED (int32)idm < (int32)count.
  assert.equal(gtm9bea80RangeGate(0x10, 0x100), true);
  assert.equal(gtm9bea80RangeGate(0x100, 0x100), false);
  assert.equal(gtm9bea80RangeGate(0x8000, 0x10), false); // 0x8000 >= 16
  assert.equal(gtm9bea80RangeGate(0x80000000, 0), true); // WIDE signed -2^31
  assert.equal(gtm9bea80RangeGate(0xffffffff, 6), true); // WIDE signed -1 < 6

  // Slot present (0x009beaba..bc): FULL dword slot != 0.
  assert.equal(gtm9bea80SlotPresent(0), false);
  assert.equal(gtm9bea80SlotPresent(1), true);
  assert.equal(gtm9bea80SlotPresent(0xffffffff), true);

  // Slot flag (0x009beac4..d1): FULL dword bit31 of [slot+0xb8].
  assert.equal(gtm9bea80SlotFlag(0x80000000), true);
  assert.equal(gtm9bea80SlotFlag(0x7fffffff), false);
  assert.equal(gtm9bea80SlotFlag(0), false);
  assert.equal(gtm9bea80SlotFlag(0x80000001), true);
  assert.equal(gtm9bea80SlotFlag(0xffffffff), true);

  // Empty gate (0x009beadc..df): FULL dword begin==end -> sum 0.
  assert.equal(gtm9bea80ListEmpty(0x1000, 0x1000), true);
  assert.equal(gtm9bea80ListEmpty(0x1000, 0x1004), false);
  assert.equal(gtm9bea80ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate (0x009beae5..e9): FULL dword [p+0x2c]==0 -> may call host1.
  assert.equal(gtm9bea80SlotCheckable(0), true);
  assert.equal(gtm9bea80SlotCheckable(1), false);
  assert.equal(gtm9bea80SlotCheckable(0x100), false);  // WIDE full dword
  assert.equal(gtm9bea80SlotCheckable(0xffffffff), false);

  // Sum add (0x009beaf3 / 0x009beb0e): 32-bit wrap.
  assert.equal(gtm9bea80SumAdd(5, 7) >>> 0, 12);
  assert.equal(gtm9bea80SumAdd(0xffffffff, 2) >>> 0, 1);
  assert.equal(gtm9bea80SumAdd(0x80000000, 0x80000000) >>> 0, 0);

  // Twin call gate (0x009beaf5..04): flag LOW byte != 0 AND twin ptr != 0.
  assert.equal(gtm9bea80TwinCallNeeded(0, 0x10), false);
  assert.equal(gtm9bea80TwinCallNeeded(1, 0), false);
  assert.equal(gtm9bea80TwinCallNeeded(1, 0x10), true);
  assert.equal(gtm9bea80TwinCallNeeded(0x100, 0x10), false); // WIDE low byte 0
  assert.equal(gtm9bea80TwinCallNeeded(0x1ff, 0x10), true);  // WIDE low byte 0xff
  assert.equal(gtm9bea80TwinCallNeeded(0xffffffff, 0x10), true);
  assert.equal(gtm9bea80TwinCallNeeded(0x100, 0), false);

  // Walk next (0x009beb17): add esi,4, 32-bit wrap.
  assert.equal(gtm9bea80WalkNext(0), 4);
  assert.equal(gtm9bea80WalkNext(0xfffffffc) >>> 0, 0);
  assert.equal(gtm9bea80WalkNext(0xffffffff) >>> 0, 3);

  // Walk continue (0x009beb1a..1d): FULL dword next != end; end RE-READ
  // each iteration (this reloaded from local [esp+0x14]).
  assert.equal(gtm9bea80WalkContinue(4, 4), false);
  assert.equal(gtm9bea80WalkContinue(4, 8), true);
  assert.equal(gtm9bea80WalkContinue(0x30, 0x20), true);
  assert.equal(gtm9bea80WalkContinue(0, 0xffffffff), true);

  // Result sum (0x009beb1f mov eax,edi): SIGNED int32 consumer.
  assert.equal(gtm9bea80ResultSum(0x12345678) >>> 0, 0x12345678);
  assert.equal(gtm9bea80ResultSum(0xffffffff) >>> 0, 0xffffffff);

  // --- Full-body PE-truth differential ---
  // Empty list -> 0 (loop never runs, sum untouched; flag irrelevant).
  assert.equal(gtm9bea80Ref(0x1000, 0x1000, 0x2000, 0x2010, [0x80000000], 0x8f, []), 0, "empty -> 0");

  // Flag set (slot range ok, slot present, bit31 set): twin host runs.
  // slot array: [g]+0x2a410 = 0x2000, end 0x2010 -> count 4; id 0x8f ->
  // idm 0xf OUT of range -> flag 0 even though slotArray would fit idm 0.
  // Use id 0x2 so idm 2 < 4 and slotArray[2] present bit31.
  const slots = [null, null, 0x80000000, null];
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x2, [[0, 0x10, 5, 7]]),
    12, "flag=1: host1 + host2 both summed");

  // Twin null -> host2 skipped even with flag set.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x2, [[0, 0, 5, 7]]),
    5, "twin null: host1 only");
  // Twin present but host2 status 0: host2 still ran, adds 0.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x2, [[0, 0x10, 5, 0]]),
    5, "host2 ran with status 0");

  // Flag 0 (slot entry present but bit31 clear): only host1 runs.
  const slotsNoFlag = [null, null, 0x7fffffff, null];
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slotsNoFlag, 0x2, [[0, 0x10, 5, 7]]),
    5, "flag=0: host1 only");

  // Flag 0 via range: idm >= count -> slot lookup skipped wholesale.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x8f, [[0, 0x10, 5, 7]]),
    5, "range miss: flag=0, host2 skipped");

  // Raw-id mask feeds only the index: id 0x8002 -> idm 2 hits slot 2.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x8002, [[0, 0x10, 5, 7]]),
    12, "id&0x7fff indexes the slot array");

  // Slot gate: FULL dword [p+0x2c] != 0 -> neither host runs.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x2, [[1, 0x10, 5, 7]]),
    0, "slot gate skip");
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1004, 0x2000, 0x2010, slots, 0x2, [[0x100, 0x10, 5, 7]]),
    0, "FULL dword slot gate");

  // 32-bit wrap accumulation across candidates: ffffffff + 3 (twin) wraps
  // to 2, then + 2 (host1) -> 4, twin status 0 adds nothing.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x1008, 0x2000, 0x2010, slots, 0x2,
      [[0, 0x10, 0xffffffff, 3], [0, 0x10, 2, 0]]) >>> 0,
    4, "wrap: ffffffff+3 -> 2, +2 -> 4");

  // Skipped twin (null ptr) contributes host1 only on every candidate.
  assert.equal(
    gtm9bea80Ref(0x1000, 0x100c, 0x2000, 0x2010, slots, 0x2,
      [[0, 0, 1, 0], [0, 0, 2, 0], [0, 0, 4, 0]]) >>> 0,
    7, "twin null on all candidates -> host1 sums 1+2+4");

  // Walk wraps past end once (begin 0xfffffffc, end 0).
  assert.equal(
    gtm9bea80Ref(0xfffffffc, 0, 0x2000, 0x2010, slots, 0x2, [[0, 0, 9, 1]]),
    9, "hit before wrap");

  // Constants (all PE-derived this unit; 43-site rel32 census re-verified).
  assert.equal(gtm9bea80NextVa(), 0x009beb30);
  assert.equal(gtm9bea80Va(), 0x009bea80);
  assert.equal(gtm9bea80FirstRetVa(), 0x009beb27);
  assert.equal(gtm9bea80RetVa(), 0x009beb27);
  assert.equal(gtm9bea80Int3Va(), 0x009beb2a);
  assert.equal(gtm9bea80BodyBytes(), 0xaa);
  assert.equal(gtm9bea80Sites(), 43);
  assert.equal(gtm9bea80ListBeginOfs(), 0);
  assert.equal(gtm9bea80ListEndOfs(), 4);
  assert.equal(gtm9bea80ListStride(), 4);
  assert.equal(gtm9bea80SlotFlagOfs(), 0x2c);
  assert.equal(gtm9bea80TwinPtrOfs(), 0x1e6c);
  assert.equal(gtm9bea80SlotArrayBeginOfs(), 0x2a410);
  assert.equal(gtm9bea80SlotArrayEndOfs(), 0x2a414);
  assert.equal(gtm9bea80Mask(), 0x7fff);
  assert.equal(gtm9bea80TwinFlagsOfs(), 0xb8);
  assert.equal(gtm9bea80TwinFlagBit() >>> 0, 0x80000000);
  assert.equal(gtm9bea80ManagerGlobalVa(), 0x00c7169c);
  assert.equal(gtm9bea80GameGlobalVa(), 0x00c71678);
  assert.equal(gtm9bea80ReceiverOfs(), 0x1baa8);
  assert.equal(gtm9bea80HostStatusVa(), 0x007cb6e0);
});

/* ---------------------------------------------------------------------------
 * ABI v47 -- 0x009beb30: all/any instant-death-curse walk (NO exact ZHL;
 * address-stable prefix A9BEB30).  NARROWED: the walk + byte/full-word
 * gates + 32-bit wrap charge arithmetic + AND/OR byte combine are pure;
 * the ONE host call 0x007db6b0 (`Entity_Player::HasInstantDeathCurse`,
 * EXACT ZHL 14 B, PURE body) stays a typed host event this unit per the
 * ONE-BODY mandate.  Full-body reference transcribed branch-by-branch
 * from the 0x009beb30 instruction stream:
 *   bh = arg1 & 0xff (mode/seed; mov bh,byte [ebp+8] @ 0x009beb34)
 *   bl = bh (mov bl,bh @ 0x009beb3a)
 *   esi = [this+0] begin; edi = [this+4] end (BOTH captured ONCE at
 *     entry, end NEVER re-read)
 *   begin == end -> ret bl = arg&0xff (ECHO, NOT 0/1; cmp/je @
 *     0x009beb40..42); consumers test al,al (nonzero -> true)
 *   per candidate (player = [iter], stride 4):
 *     FULL dword [p+0x2c]==0 (jne @ 0x009beb4a) AND byte [p+0x20a9]==0
 *       (jne @ 0x009beb53) -> candidate; else ADVANCE (bl unchanged)
 *     a = [p+0x134c]+[p+0x1344] (32-bit wrap, mov/add @ 0x009beb55..5b)
 *     SIGNED a >= [p+0x1340] (jge @ 0x009beb67) -> al=1 WITHOUT host;
 *       else HOST 0x7db6b0(player) -> al = (host != 0)
 *     COMBINE (0x009beb74..8c): mode != 0 -> AND (bl&&al); mode == 0
 *       -> OR (bl||al); bl/al LOW bytes
 *   iter += 4 (wrap); next != end (captured ONCE edi) -> loop
 *   ret bl (mov al,bl @ 0x009beb97; byte result)
 * players = [[field2c, field20a9, field134c, field1344, field1340,
 * curse], ...] — `curse` is a MOCK host result the reference composes
 * through the pure gates (host receives this = player only).
 * ------------------------------------------------------------------------- */
function a9beb30Ref(listBegin, listEnd, arg, players) {
  const begin = listBegin >>> 0;
  const end = listEnd >>> 0;
  const mode = a9beb30ArgByte(arg);          // bh = arg LOW byte
  let bl = mode;                             // mov bl,bh (seed = echo)
  // cmp esi,edi / je ret (FULL dword begin==end -> ret bl = arg&0xff).
  if (a9beb30ListEmpty(begin, end)) {
    return bl;                               // ECHO (NOT 0/1)
  }
  let iter = begin;
  let idx = 0;
  for (;;) {
    const [field2c, field20a9, field134c, field1344, field1340, curse] =
      players[idx];
    // cmp dword [ecx+0x2c],0 / jne advance (FULL dword).
    if (a9beb30SlotCheckable(field2c) &&
        a9beb30Flag20a9Checkable(field20a9)) {
      // a = [p+0x134c]+[p+0x1344] (32-bit wrap); SIGNED compare vs max.
      const charge = a9beb30ChargeSum(field134c, field1344);
      let al;
      if (a9beb30ChargeGate(charge, field1340)) {
        al = 1;                              // jge -> skip host
      } else {
        al = a9beb30HostMatch(curse) ? 1 : 0; // host 0x7db6b0(player)
      }
      bl = a9beb30Combine(mode, bl, al);     // AND/OR by mode byte
    }
    iter = a9beb30WalkNext(iter);            // add esi,4
    if (!a9beb30WalkContinue(iter, end)) {
      break; // jne @ 0x009beb93 not taken -> loop exhausted
    }
    idx += 1;
  }
  return a9beb30ResultByte(bl);              // mov al,bl; ret 4
}

test("JS oracle: 9beb30 all/any instant-death walk islands (ABI v47)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 47);

  // Arg byte (0x009beb34): RAW arg & 0xff (LOW byte only).
  assert.equal(a9beb30ArgByte(0), 0);
  assert.equal(a9beb30ArgByte(0x2f), 0x2f);
  assert.equal(a9beb30ArgByte(0x100), 0);    // WIDE low byte 0
  assert.equal(a9beb30ArgByte(0x1ff), 0xff); // WIDE low byte ff
  assert.equal(a9beb30ArgByte(0xffffffff), 0xff);

  // Mode (0x009beb74..76): LOW byte != 0 -> AND accumulation.
  assert.equal(a9beb30ModeAnd(0), false);
  assert.equal(a9beb30ModeAnd(1), true);
  assert.equal(a9beb30ModeAnd(0x100), false); // WIDE low byte 0
  assert.equal(a9beb30ModeAnd(0x1ff), true);  // WIDE low byte ff
  assert.equal(a9beb30ModeAnd(0xffffffff), true);

  // Empty (0x009beb40..42): FULL dword begin==end -> ECHO arg&0xff.
  assert.equal(a9beb30ListEmpty(0x1000, 0x1000), true);
  assert.equal(a9beb30ListEmpty(0x1000, 0x1004), false);
  assert.equal(a9beb30ListEmpty(0xffffffff, 0xffffffff), true);

  // Slot gate (0x009beb46..4a): FULL dword [p+0x2c]==0.
  assert.equal(a9beb30SlotCheckable(0), true);
  assert.equal(a9beb30SlotCheckable(1), false);
  assert.equal(a9beb30SlotCheckable(0x100), false); // WIDE full dword
  assert.equal(a9beb30SlotCheckable(0xffffffff), false);

  // Flag20a9 gate (0x009beb4c..53): LOW byte [p+0x20a9]==0.
  assert.equal(a9beb30Flag20a9Checkable(0), true);
  assert.equal(a9beb30Flag20a9Checkable(1), false);
  assert.equal(a9beb30Flag20a9Checkable(0x100), true);  // WIDE low byte 0
  assert.equal(a9beb30Flag20a9Checkable(0x1ff), false); // WIDE low byte ff
  assert.equal(a9beb30Flag20a9Checkable(0xffffffff), false);

  // Charge sum (0x009beb55..5b): 32-bit wrap [p+0x134c]+[p+0x1344].
  assert.equal(a9beb30ChargeSum(5, 7) >>> 0, 12);
  assert.equal(a9beb30ChargeSum(0xffffffff, 2) >>> 0, 1);
  assert.equal(a9beb30ChargeSum(0x80000000, 0x80000000) >>> 0, 0);

  // Charge gate (0x009beb61..67): SIGNED (int32)a >= (int32)max.
  assert.equal(a9beb30ChargeGate(0x100, 0x100), true);
  assert.equal(a9beb30ChargeGate(0xff, 0x100), false);
  assert.equal(a9beb30ChargeGate(0x80000000, 0x100), false); // WIDE -2^31
  assert.equal(a9beb30ChargeGate(0xffffffff, 0), false);     // WIDE -1
  assert.equal(a9beb30ChargeGate(0, 0x80000000), true);      // 0 >= -2^31

  // Host match (0x009beb6e..72): (host_al & 0xff) != 0 ? 1 : 0.
  assert.equal(a9beb30HostMatch(0), false);
  assert.equal(a9beb30HostMatch(1), true);
  assert.equal(a9beb30HostMatch(0xff), true);  // WIDE nonzero byte
  assert.equal(a9beb30HostMatch(0x100), false); // WIDE low byte 0

  // Combine (0x009beb74..8c): mode!=0 AND / mode==0 OR; bl/al LOW bytes.
  assert.equal(a9beb30Combine(0, 0, 0), 0);   // OR all zero
  assert.equal(a9beb30Combine(0, 0, 1), 1);   // OR al set
  assert.equal(a9beb30Combine(0, 1, 0), 1);   // OR bl sticky
  assert.equal(a9beb30Combine(1, 1, 1), 1);   // AND both set
  assert.equal(a9beb30Combine(1, 1, 0), 0);   // AND al clear
  assert.equal(a9beb30Combine(1, 0, 1), 0);   // AND bl clear
  assert.equal(a9beb30Combine(0x100, 0, 1), 1);  // WIDE mode low byte 0
  assert.equal(a9beb30Combine(0x1ff, 1, 1), 1);  // WIDE mode low byte ff
  assert.equal(a9beb30Combine(0xffffffff, 1, 0), 0); // WIDE AND mode

  // Walk next (0x009beb8e): add esi,4, 32-bit wrap.
  assert.equal(a9beb30WalkNext(0), 4);
  assert.equal(a9beb30WalkNext(0xfffffffc) >>> 0, 0);
  assert.equal(a9beb30WalkNext(0xffffffff) >>> 0, 3);

  // Walk continue (0x009beb91..93): FULL dword next != end; END
  // CAPTURED ONCE at entry (edi).
  assert.equal(a9beb30WalkContinue(4, 4), false);
  assert.equal(a9beb30WalkContinue(4, 8), true);
  assert.equal(a9beb30WalkContinue(0x30, 0x20), true);
  assert.equal(a9beb30WalkContinue(0, 0xffffffff), true);

  // Result byte (0x009beb97 mov al,bl): byte result (0/1 or arg&0xff echo).
  assert.equal(a9beb30ResultByte(1), 1);
  assert.equal(a9beb30ResultByte(0x2f), 0x2f);
  assert.equal(a9beb30ResultByte(0x1234ff), 0xff); // byte truncation

  // --- Full-body PE-truth differential ---
  // Empty list -> ECHO arg&0xff (NOT 0): consumers test al,al.
  assert.equal(a9beb30Ref(0x1000, 0x1000, 0x2f, []), 0x2f, "empty -> echo");
  assert.equal(a9beb30Ref(0x1000, 0x1000, 0, []), 0, "empty -> echo 0");
  assert.equal(a9beb30Ref(0x1000, 0x1000, 0xffffffff, []), 0xff,
    "empty -> echo low byte");

  // No candidate passes the gates -> bl keeps the seed (echo arg&0xff).
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0x2f, [[1, 0, 0, 0, 0x100, 1]]),
    0x2f, "slot gate skip -> echo");
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0x2f, [[0, 1, 0, 0, 0x100, 1]]),
    0x2f, "flag20a9 gate skip -> echo");
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0x100, [[0x100, 0, 0, 0, 0x100, 1]]),
    0, "FULL dword slot gate WIDE -> echo 0");

  // AND mode (arg low byte != 0): ALL candidates must match.
  // charge 0x100 >= max 0x100 -> al=1 without host -> bl=1.
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 1, [[0, 0, 0x100, 0, 0x100, 0]]),
    1, "and: charge gate alone matches");
  // charge 0xff < max 0x100 -> host consulted; host 0 (curse false).
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 1, [[0, 0, 0xff, 0, 0x100, 0]]),
    0, "and: host false -> no match");
  // host 1 (curse true) -> match.
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 1, [[0, 0, 0xff, 0, 0x100, 1]]),
    1, "and: host true -> match");
  // AND accumulation: first matches, second does not -> bl sticks at 0.
  assert.equal(
    a9beb30Ref(0x1000, 0x1008, 1,
      [[0, 0, 0x100, 0, 0x100, 0], [0, 0, 0xff, 0, 0x100, 0]]),
    0, "and: one fail kills all");
  // AND accumulation: all match -> 1.
  assert.equal(
    a9beb30Ref(0x1000, 0x1008, 1,
      [[0, 0, 0x100, 0, 0x100, 0], [0, 0, 0x100, 0, 0x100, 0]]),
    1, "and: all match -> 1");

  // OR mode (arg low byte == 0): ANY candidate matches.
  assert.equal(
    a9beb30Ref(0x1000, 0x1008, 0,
      [[0, 0, 0xff, 0, 0x100, 0], [0, 0, 0xff, 0, 0x100, 1]]),
    1, "or: second host true -> 1");
  assert.equal(
    a9beb30Ref(0x1000, 0x1008, 0,
      [[0, 0, 0xff, 0, 0x100, 0], [0, 0, 0xff, 0, 0x100, 0]]),
    0, "or: none match -> 0");

  // Charge sum 32-bit wrap: 0xffffffff + 0x10 wraps to 0xf; SIGNED
  // 0xf < max 0x100 -> host path; host 1 -> match.
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0,
      [[0, 0, 0xffffffff, 0x10, 0x100, 1]]),
    1, "wrap charge falls below max -> host consulted");

  // Charge gate SIGNED: charge -2^31 (0x80000000) < max 0x100 -> host;
  // charge 0 >= max -2^31 -> no host needed.
  assert.equal(
    a9beb30Ref(0x1000, 0x1008, 1,
      [[0, 0, 0x80000000, 0, 0x100, 0], [0, 0, 0, 0, 0x80000000, 0]]),
    0, "signed charge gates: -2^31 fails host, 0 >= -2^31 matches -> AND fail");

  // Walk wraps past end once (begin 0xfffffffc, end 0).
  assert.equal(
    a9beb30Ref(0xfffffffc, 0, 1, [[0, 0, 0x100, 0, 0x100, 0]]),
    1, "hit before wrap (AND mode)");

  // Host-match byte semantics: host returns 0x100 (nonzero but low byte
  // 0) -> treated as false by test al,al in the match OR in host path.
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0, [[0, 0, 0xff, 0, 0x100, 0x100]]),
    0, "host low byte 0 -> no match");
  assert.equal(
    a9beb30Ref(0x1000, 0x1004, 0, [[0, 0, 0xff, 0, 0x100, 0xff]]),
    1, "host low byte ff -> match");

  // Constants (all PE-derived this unit; 3-site rel32 census re-verified).
  assert.equal(a9beb30NextVa(), 0x009beba0);
  assert.equal(a9beb30Va(), 0x009beb30);
  assert.equal(a9beb30FirstRetVa(), 0x009beb9b);
  assert.equal(a9beb30RetVa(), 0x009beb9b);
  assert.equal(a9beb30Int3Va(), 0x009beb9e);
  assert.equal(a9beb30BodyBytes(), 0x6e);
  assert.equal(a9beb30Sites(), 3);
  assert.equal(a9beb30Site0Va(), 0x0073ada9);
  assert.equal(a9beb30Site1Va(), 0x0073bd21);
  assert.equal(a9beb30Site2Va(), 0x00748819);
  assert.equal(a9beb30ListBeginOfs(), 0);
  assert.equal(a9beb30ListEndOfs(), 4);
  assert.equal(a9beb30ListStride(), 4);
  assert.equal(a9beb30SlotFlagOfs(), 0x2c);
  assert.equal(a9beb30Flag20a9Ofs(), 0x20a9);
  assert.equal(a9beb30ChargeOfs(), 0x134c);
  assert.equal(a9beb30ChargeAddendOfs(), 0x1344);
  assert.equal(a9beb30ChargeMaxOfs(), 0x1340);
  assert.equal(a9beb30ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9beb30ReceiverOfs(), 0x1baa8);
  assert.equal(a9beb30HostCurseVa(), 0x007db6b0);
});

/* ---------------------------------------------------------------------------
 * ABI v48 -- 0x009beba0: avg-player-position walk (NO exact ZHL;
 * address-stable prefix A9BEBA0).  NARROWED (NOT PURE-removed): the
 * walk + slot/watch/flag20a9 gates + gobj scan + f32 accumulate/average
 * math are pure; the 2 INDIRECT host predicates (vtable slot
 * [[gitem+0x370]+0x14], byte result) and the 2 E8 assert calls
 * 0x00a112c0 stay typed host events; the observable stores (*out float2
 * + cache 0xc9436c/0xc94370 + cacheTs 0xc5c4d4) are POST events — the
 * laws compute the VALUES, the slice applies the stores.  Full-body
 * reference transcribed branch-by-branch from the 0x009beba0 stream:
 *   fast (0x009beba6..c5): (arg2&0xff)!=0 && [gobj+0x4abbc]==cacheTs ->
 *     *out = cached float2 [0xc9436c/0xc94370], NO stores
 *   slow: sum/count over (a) eligible players [this+0..this+4) then (b)
 *     EVERY entry of [this+0xd0..this+0xd4]; per element the gobj scan
 *     [gobj+0x4b3d8..0x4b3dc) looks for [gitem+0xc]==[elem+0x1618]; only
 *     when FOUND does the INDIRECT HOST predicate gate the accumulation
 *     (pred byte == 0 -> skip; else accumulate [elem+0x33c]/[elem+0x340]);
 *     EMPTY glist or NOT-FOUND -> accumulate without predicate
 *   FINALIZE (0x009bed8f..74): cacheTs store ALWAYS; SIGNED count>0 ->
 *     avg = sum/count (divss); else fallback player0 = [g_Game+0x1baa8][0]
 *     pos (HOST assert when that list is empty; value dropped); cache
 *     floats + *out = avg-or-fallback
 * players = [[p2c, p13c0, p20a9, key1618, x33c, y340], ...] (this+0 list,
 * ALSO the fallback list — all 9 callers pass this = g_Game+0x1baa8);
 * second = [[key1618, x33c, y340], ...] (this+0xd0 list);
 * gobj = [[tagC, pred], ...] (gobj+0x4b3d8 list; pred = MOCK host result
 * the reference composes through the pure gates).
 * ------------------------------------------------------------------------- */
function a9beba0Ref(mode, players, second, gobj, gobjTs, cacheTs, cacheX,
                    cacheY) {
  // Fast path (0x009beba6 cmp byte / 0x009bebb2 je slow; 0x009bebbf cmp
  // / 0x009bebc5 jne slow): mode LOW byte != 0 && ts == cacheTs.
  if (a9beba0ModeFast(mode) && a9beba0CacheFresh(gobjTs, cacheTs)) {
    return {
      x: Math.fround(+cacheX),
      y: Math.fround(+cacheY),
      count: -1,   // no walk, no stores (fast epilogue ret @ 0x009bebe9)
      ts: null,
    };
  }
  let count = 0;
  let sumX = 0;
  let sumY = 0;
  // LOOP1 (0x009bec22..0x009becf6): idx over the players list.  The PE
  // RE-DERIVES count per iteration; the list is static here (0 body
  // stores besides the cache/out posts) so one derivation is faithful.
  const n = a9beba0ListCount(0, players.length * 4);
  for (let idx = 0; n !== 0 && a9beba0IdxInRange(idx, n); idx += 1) {
    const p = players[idx];
    if (!a9beba0PlayerCandidate(p[0], p[1], p[2])) {
      continue; // 0x009bec60 jne advance / 0x009bec72 je advance
    }
    // Inner gobj scan (0x009bec74..b1): want = [p+0x1618].
    let found = -1;
    if (!a9beba0ScanEmpty(0, gobj.length * 4)) {
      for (let i = 0; a9beba0ScanContinue(i, gobj.length); i += 1) {
        if (a9beba0LookupMatch(gobj[i][0], p[3])) {
          found = i; // 0x009beca5 je found -> HOST predicate
          break;
        }
      }
    }
    let predOk = 0;
    if (found >= 0) {
      // INDIRECT HOST: [[gitem+0x370]+0x14](gitem+0x370) -> al.
      predOk = a9beba0PredMatch(gobj[found][1]) ? 1 : 0;
    }
    if (a9beba0AccumGate(found >= 0 ? 1 : 0, predOk)) {
      sumX = a9beba0AccumX(sumX, p[4]); // 0x009becbe addss
      sumY = a9beba0AccumY(sumY, p[5]); // 0x009becb6 addss
      count = a9beba0CountInc(count);   // 0x009becc6 inc
    }
  }
  // WALK2 (0x009becf9..0x009bed8c): EVERY entry of the second list; no
  // slot/watch gates; same gobj scan + predicate pattern.
  const n2 = a9beba0ListCount(0, second.length * 4);
  for (let idx2 = 0; n2 !== 0 && a9beba0IdxInRange(idx2, n2); idx2 += 1) {
    const item = second[idx2];
    let found = -1;
    if (!a9beba0ScanEmpty(0, gobj.length * 4)) {
      for (let i = 0; a9beba0ScanContinue(i, gobj.length); i += 1) {
        if (a9beba0LookupMatch(gobj[i][0], item[0])) {
          found = i; // 0x009bed45 je found2 -> HOST predicate
          break;
        }
      }
    }
    let predOk = 0;
    if (found >= 0) {
      predOk = a9beba0PredMatch(gobj[found][1]) ? 1 : 0;
    }
    if (a9beba0AccumGate(found >= 0 ? 1 : 0, predOk)) {
      sumX = a9beba0AccumX(sumX, item[1]); // 0x009bed61 addss
      sumY = a9beba0AccumY(sumY, item[2]); // 0x009bed59 addss
      count = a9beba0CountInc(count);      // 0x009bed69 inc
    }
  }
  // FINALIZE (0x009bed8f..0x009bee74): cacheTs store ALWAYS; avg or
  // fallback; cache floats + *out stores (POST events; values below).
  let outX;
  let outY;
  if (a9beba0HasAvg(count)) {
    outX = a9beba0AvgX(sumX, count); // 0x009bedae divss
    outY = a9beba0AvgY(sumY, count); // 0x009bedaa divss
  } else {
    // Fallback (0x009bee10..4a): player0 = [g_Game+0x1baa8][0] (the SAME
    // list this = g_Game+0x1baa8; all 9 callers).  HOST assert 0x00a112c0
    // fires when that list is empty; the PE continues and reads [begin3] —
    // the value lane is documented (tests always supply >= 1 player).
    if (a9beba0AssertNeeded(players.length)) {
      // host 0x00a112c0 "Gamestate corrupted or has new data!" event.
    }
    const p0 = players[0];
    outX = a9beba0FallbackX(p0[4]); // 0x009bee42 movss
    outY = a9beba0FallbackY(p0[5]); // 0x009bee4a movss
  }
  return { x: outX, y: outY, count, ts: gobjTs };
}

test("JS oracle: 9beba0 avg-player-position walk islands (ABI v48)", () => {
  assert.ok(PROCESS_INPUT_PURE_ABI_VERSION >= 48);

  // Mode fast (0x009beba6..b2): LOW byte != 0 -> cache eligible.
  assert.equal(a9beba0ModeFast(0), false);
  assert.equal(a9beba0ModeFast(1), true);
  assert.equal(a9beba0ModeFast(0x100), false); // WIDE low byte 0
  assert.equal(a9beba0ModeFast(0x1ff), true);  // WIDE low byte ff
  assert.equal(a9beba0ModeFast(0xffffffff), true);

  // Cache fresh (0x009bebbf..c5): FULL dword ts == cacheTs.
  assert.equal(a9beba0CacheFresh(0x1234, 0x1234), true);
  assert.equal(a9beba0CacheFresh(0x1234, 0x1235), false);
  assert.equal(a9beba0CacheFresh(0xffffffff, 0xffffffff), true);
  assert.equal(a9beba0CacheFresh(0xffffffff, 0), false);

  // List count (0x009bec12..14): SIGNED SAR32(end-begin,2).
  assert.equal(a9beba0ListCount(0x1000, 0x1010), 4);
  assert.equal(a9beba0ListCount(0x1000, 0x1000), 0);
  assert.equal(a9beba0ListCount(0x1000, 0) | 0, -1024); // WIDE begin>end
  assert.equal(a9beba0ListCount(0, 0xffffffff) | 0, -1); // SAR32 of -1 stays -1

  // Idx in range (0x009bec53..55): FULL dword idx < count.
  assert.equal(a9beba0IdxInRange(0, 1), true);
  assert.equal(a9beba0IdxInRange(1, 1), false);
  assert.equal(a9beba0IdxInRange(0, 0), false);
  assert.equal(a9beba0IdxInRange(0xffffffff, 0xffffffff), false);

  // Slot eligible (0x009bec5c..60): FULL dword [p+0x2c]==0.
  assert.equal(a9beba0SlotEligible(0), true);
  assert.equal(a9beba0SlotEligible(1), false);
  assert.equal(a9beba0SlotEligible(0x100), false); // WIDE full dword
  assert.equal(a9beba0SlotEligible(0xffffffff), false);

  // Watch gate (0x009bec62..69): FULL dword [p+0x13c0] != 0x23.
  assert.equal(a9beba0WatchGate(0x23), false);
  assert.equal(a9beba0WatchGate(0x22), true);
  assert.equal(a9beba0WatchGate(0x10023), true); // WIDE full dword
  assert.equal(a9beba0WatchGate(0xffffffff), true);

  // Flag20a9 gate (0x009bec6b..72): LOW byte [p+0x20a9] != 0.
  assert.equal(a9beba0Flag20a9Gate(0), false);
  assert.equal(a9beba0Flag20a9Gate(1), true);
  assert.equal(a9beba0Flag20a9Gate(0x100), false);  // WIDE low byte 0
  assert.equal(a9beba0Flag20a9Gate(0x1ff), true);   // WIDE low byte ff
  assert.equal(a9beba0Flag20a9Gate(0xffffffff), true);

  // Player candidate (composed): slot==0 && (watch!=0x23 || flag20a9!=0).
  assert.equal(a9beba0PlayerCandidate(0, 0x22, 0), true);
  assert.equal(a9beba0PlayerCandidate(0, 0x23, 0), false); // watch blocks
  assert.equal(a9beba0PlayerCandidate(0, 0x23, 1), true);   // flag unblocks
  assert.equal(a9beba0PlayerCandidate(0, 0x23, 0x100), false); // WIDE flag
  assert.equal(a9beba0PlayerCandidate(1, 0x22, 0), false);
  assert.equal(a9beba0PlayerCandidate(0x100, 0x22, 0), false); // WIDE slot

  // Lookup match (0x009beca2 / 0x009bed42): FULL dword [gitem+0xc]==want.
  assert.equal(a9beba0LookupMatch(0x23, 0x23), true);
  assert.equal(a9beba0LookupMatch(0x23, 0x24), false);
  assert.equal(a9beba0LookupMatch(0xffffffff, 0xffffffff), true);

  // Scan empty (0x009bec85..87 / 0x009bed27..29): FULL dword begin==end.
  assert.equal(a9beba0ScanEmpty(0x1000, 0x1000), true);
  assert.equal(a9beba0ScanEmpty(0x1000, 0x1004), false);

  // Scan continue (0x009becaf..b1 / 0x009bed4f..51): FULL dword idx<count.
  assert.equal(a9beba0ScanContinue(0, 1), true);
  assert.equal(a9beba0ScanContinue(1, 1), false);
  assert.equal(a9beba0ScanContinue(0xffffffff, 0), false);

  // Accum gate: skip iff found && !pred.
  assert.equal(a9beba0AccumGate(0, 0), 1);
  assert.equal(a9beba0AccumGate(0, 1), 1);
  assert.equal(a9beba0AccumGate(1, 0), 0);
  assert.equal(a9beba0AccumGate(1, 1), 1);
  assert.equal(a9beba0AccumGate(0x100, 0), 0); // WIDE found nonzero

  // Pred match (0x009bedd5 / 0x009bee00): (host_al & 0xff) != 0.
  assert.equal(a9beba0PredMatch(0), false);
  assert.equal(a9beba0PredMatch(1), true);
  assert.equal(a9beba0PredMatch(0xff), true);  // WIDE nonzero byte
  assert.equal(a9beba0PredMatch(0x100), false); // WIDE low byte 0
  assert.equal(a9beba0PredMatch(0xffffffff), true);

  // f32 accumulate (addss) + count inc.
  assert.equal(a9beba0AccumX(1.5, 2.25), 3.75);
  assert.equal(a9beba0AccumY(0.5, 0.25), 0.75);
  assert.equal(a9beba0AccumX(0.1, 0.2), Math.fround(Math.fround(0.1) + Math.fround(0.2)));
  assert.equal(a9beba0CountInc(0), 1);
  assert.equal(a9beba0CountInc(0xffffffff) >>> 0, 0); // wrap

  // Has avg (0x009bed9f..a1): SIGNED count > 0.
  assert.equal(a9beba0HasAvg(0), false);
  assert.equal(a9beba0HasAvg(1), true);
  assert.equal(a9beba0HasAvg(0xffffffff), false); // WIDE -1
  assert.equal(a9beba0HasAvg(0x80000000), false); // WIDE -2^31
  assert.equal(a9beba0HasAvg(0x100), true);       // WIDE +256

  // f32 average (divss).
  assert.equal(a9beba0AvgX(3, 2), 1.5);
  assert.equal(a9beba0AvgY(3, 2), 1.5);
  assert.equal(a9beba0AvgX(0.1, 3), Math.fround(Math.fround(0.1) / Math.fround(3)));

  // Fallback (movss passthrough).
  assert.equal(a9beba0FallbackX(2.5), 2.5);
  assert.equal(a9beba0FallbackY(-1.25), -1.25);

  // Assert needed (0x009bec2c..2e / 0x009bee27..29): FULL dword count==0.
  assert.equal(a9beba0AssertNeeded(0), true);
  assert.equal(a9beba0AssertNeeded(1), false);
  assert.equal(a9beba0AssertNeeded(0xffffffff), false);

  // --- Full-body PE-truth differential (a9beba0Ref) ---

  // Fast path: mode 1 + fresh cache -> cached float2, NO walk/stores.
  let r = a9beba0Ref(1, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 4.5, 6.5);
  assert.equal(r.x, 4.5, "fast: cached x");
  assert.equal(r.y, 6.5, "fast: cached y");
  assert.equal(r.count, -1, "fast: no walk");
  assert.equal(r.ts, null, "fast: no cacheTs store");

  // mode 0 forces the slow path even when the cache is fresh.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 4.5, 6.5);
  assert.equal(r.count, 1, "mode 0 -> slow path");
  assert.equal(r.x, 10, "mode 0: avg x over 1 player");
  assert.equal(r.y, 20, "mode 0: avg y over 1 player");
  assert.equal(r.ts, 0x100, "slow: cacheTs store always");

  // WIDE mode (low byte 0) behaves as mode 0 (slow).
  r = a9beba0Ref(0x100, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 4.5, 6.5);
  assert.equal(r.count, 1, "wide mode low byte 0 -> slow");

  // Stale cache + mode 1 -> slow path.
  r = a9beba0Ref(1, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x101, 4.5, 6.5);
  assert.equal(r.count, 1, "stale -> slow");
  assert.equal(r.x, 10);

  // Slot gate blocks the player -> count 0 -> FALLBACK to players[0] pos.
  r = a9beba0Ref(0, [[1, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "slot gate -> nothing counted");
  assert.equal(r.x, 10, "fallback x = players[0].x");
  assert.equal(r.y, 20, "fallback y = players[0].y");
  assert.equal(r.ts, 0x100, "fallback still stores cacheTs");

  // Watch gate: [p+0x13c0]==0x23 && flag20a9==0 -> blocked; flag20a9
  // set or watch != 0x23 -> candidate.
  r = a9beba0Ref(0, [[0, 0x23, 0, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "watch 0x23 + flag20a9 0 -> blocked -> fallback");
  r = a9beba0Ref(0, [[0, 0x23, 1, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "flag20a9 set unblocks");
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "watch != 0x23 unblocks");
  // WIDE flag20a9 (low byte 0) does NOT unblock.
  r = a9beba0Ref(0, [[0, 0x23, 0x100, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "wide flag20a9 low byte 0 stays blocked");

  // Average over two players (mode 0 -> avg; count 2).
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20], [0, 0x22, 0, 8, 30, 40]], [],
                 [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 2);
  assert.equal(r.x, 20, "avg x = (10+30)/2");
  assert.equal(r.y, 30, "avg y = (20+40)/2");
  assert.equal(r.ts, 0x100);

  // gobj EMPTY -> accumulate without predicate.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "empty glist -> accumulate");
  assert.equal(r.x, 10);

  // gobj NOT-FOUND -> accumulate without predicate.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [[9, 0]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "not found -> accumulate");

  // gobj FOUND + pred true -> accumulate.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [[7, 1]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "found + pred true -> accumulate");

  // gobj FOUND + pred false -> SKIP (found && !pred).
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [[7, 0]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "found + pred false -> skip -> fallback");
  assert.equal(r.x, 10, "fallback still players[0] pos");

  // pred byte semantics: host 0x100 (nonzero, low byte 0) -> pred false.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [[7, 0x100]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "host low byte 0 -> pred false -> skip");
  // host 0xff -> pred true.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20]], [], [[7, 0xff]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "host low byte ff -> pred true -> accumulate");

  // Second list: entries have NO slot/watch gate — only the gobj scan.
  // gobj empty -> every second entry accumulates.
  r = a9beba0Ref(0, [], [[7, 100, 200]], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1, "second list accumulates (no slot gate)");
  assert.equal(r.x, 100);
  assert.equal(r.y, 200);
  // second found + pred false -> skip -> fallback (players[0] present as
  // in real states where the fallback list [g_Game+0x1baa8] is non-empty).
  r = a9beba0Ref(0, [[1, 0x22, 0, 7, 5, 6]], [[7, 100, 200]], [[7, 0]], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 0, "second found + pred false -> skip -> fallback");
  assert.equal(r.x, 5, "fallback x = players[0].x");
  assert.equal(r.y, 6, "fallback y = players[0].y");

  // Combined: 2 players + 1 second entry (gobj empty) -> count 3.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 10, 20], [0, 0x22, 0, 8, 30, 40]],
                 [[9, 50, 60]], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 3, "combined count 3");
  assert.equal(r.x, 30, "avg x = (10+30+50)/3");
  assert.equal(r.y, 40, "avg y = (20+40+60)/3");

  // f32 lanes stay single-precision: large accumulate + divide.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 1e30, -1e30]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1);
  assert.equal(r.x, Math.fround(1e30));
  assert.equal(r.y, Math.fround(-1e30));

  // Empty everything (players + second + gobj) -> fallback requires a
  // player (assert event fires; PE reads [begin3]); model lane documented
  // — tests always keep >= 1 player for the fallback.
  r = a9beba0Ref(0, [[0, 0x22, 0, 7, 3, 4]], [], [], 0x100, 0x100, 0, 0);
  assert.equal(r.count, 1);
  assert.equal(r.x, 3);

  // Constants (all PE-derived this unit; 9-site rel32 census re-verified).
  assert.equal(a9beba0NextVa(), 0x009bee80);
  assert.equal(a9beba0Va(), 0x009beba0);
  assert.equal(a9beba0FirstRetVa(), 0x009bebe9);
  assert.equal(a9beba0RetVa(), 0x009bee74);
  assert.equal(a9beba0Int3Va(), 0x009bee77);
  assert.equal(a9beba0BodyBytes(), 0x2d7);
  assert.equal(a9beba0Sites(), 9);
  assert.equal(a9beba0Site0Va(), 0x004ac128);
  assert.equal(a9beba0Site1Va(), 0x00800524);
  assert.equal(a9beba0Site2Va(), 0x00943032);
  assert.equal(a9beba0Site3Va(), 0x00943850);
  assert.equal(a9beba0Site4Va(), 0x00943a4d);
  assert.equal(a9beba0Site5Va(), 0x00943e6d);
  assert.equal(a9beba0Site6Va(), 0x009446fd);
  assert.equal(a9beba0Site7Va(), 0x009940a5);
  assert.equal(a9beba0Site8Va(), 0x009940fc);
  assert.equal(a9beba0ListBeginOfs(), 0);
  assert.equal(a9beba0ListEndOfs(), 4);
  assert.equal(a9beba0ListStride(), 4);
  assert.equal(a9beba0SecondListBeginOfs(), 0xd0);
  assert.equal(a9beba0SecondListEndOfs(), 0xd4);
  assert.equal(a9beba0SlotFlagOfs(), 0x2c);
  assert.equal(a9beba0WatchOfs(), 0x13c0);
  assert.equal(a9beba0WatchValue(), 0x23);
  assert.equal(a9beba0Flag20a9Ofs(), 0x20a9);
  assert.equal(a9beba0LookupKeyOfs(), 0x1618);
  assert.equal(a9beba0LookupTagOfs(), 0xc);
  assert.equal(a9beba0PosXOfs(), 0x33c);
  assert.equal(a9beba0PosYOfs(), 0x340);
  assert.equal(a9beba0PredObjOfs(), 0x370);
  assert.equal(a9beba0PredSlotOfs(), 0x14);
  assert.equal(a9beba0GobjTsOfs(), 0x4abbc);
  assert.equal(a9beba0GobjListBeginOfs(), 0x4b3d8);
  assert.equal(a9beba0GobjListEndOfs(), 0x4b3dc);
  assert.equal(a9beba0CacheTsVa(), 0x00c5c4d4);
  assert.equal(a9beba0CacheXVa(), 0x00c9436c);
  assert.equal(a9beba0CacheYVa(), 0x00c94370);
  assert.equal(a9beba0GobjGlobalVa(), 0x00c7169c);
  assert.equal(a9beba0ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9beba0ReceiverOfs(), 0x1baa8);
  assert.equal(a9beba0AssertVa(), 0x00a112c0);
  assert.equal(a9beba0AssertMsgVa(), 0x00b7e6bc);
  assert.equal(a9beba0AssertCode(), 0x10);
});

/* ---------------------------------------------------------------------------
 * ABI v49 -- 0x009bfa70: PURE bool-walk counter (NO exact ZHL;
 * address-stable prefix A9BFA70).  PURE (0 E8 / 0 indirect / 0 observable
 * stores — the single [ebp-4] store is a local save).  this =
 * g_Game + 0x1baa8 (players vector container); NO stack args; ret plain.
 * begin/end captured ONCE at entry (begin re-read from a local each
 * iteration — value-identical); walk [begin + idx*4] for idx < count.
 * Per slot p (0x009bfa93..cc):
 *   [p+0x2c]==0 && [p+0x3bc]==0 -> link check
 *   link = [p+0x1e68]: link==0 -> flag check
 *   linkIdx = [link+0x161c]: linkIdx==0xffffffff -> flag check
 *   SIGNED linkIdx >= SIGNED [p+0x161c] (jge) -> flag check
 *   link != [p+0x161c object] (cmp edx,eax / jne) -> skip
 *   flag check: byte [p+0x20a9] != 0 -> res++
 * Full-body reference transcribed branch-by-branch from the 0x009bfa70
 * stream; players = [[addr, p2c, p3bc, linkAddr, linkIdx, ownIdx, flag],
 * ...] (addr is the PLAYER POINTER VALUE used by link==player compare;
 * linkAddr 0 = NULL link; linkIdx is [link+0x161c]).
 * ------------------------------------------------------------------------- */
test("JS oracle: 9bfa70 PURE bool-walk counter (ABI v49)", () => {
  // List count (0x009bfa82 sar ebx,2): SIGNED SAR32(end-begin,2).
  assert.equal(a9bfa70ListCount(0x1000, 0x1010), 4);
  assert.equal(a9bfa70ListCount(0x1000, 0x1000), 0);
  assert.equal(a9bfa70ListCount(0x1000, 0) | 0, -1024); // WIDE begin>end
  assert.equal(a9bfa70ListCount(0xffffffff, 0x3) | 0, 1); // 32-bit wrap

  // Idx continue (0x009bfad1..d3): FULL dword idx < count.
  assert.equal(a9bfa70IdxContinue(0, 1), true);
  assert.equal(a9bfa70IdxContinue(1, 1), false);
  assert.equal(a9bfa70IdxContinue(0, 0), false);
  assert.equal(a9bfa70IdxContinue(0xffffffff, 0xffffffff), false);

  // Slot free (0x009bfa93..97): FULL dword [p+0x2c]==0.
  assert.equal(a9bfa70SlotFree(0), true);
  assert.equal(a9bfa70SlotFree(1), false);
  assert.equal(a9bfa70SlotFree(0x100), false); // WIDE: full dword
  assert.equal(a9bfa70SlotFree(0xffffffff), false);

  // State idle (0x009bfa99..a0): FULL dword [p+0x3bc]==0.
  assert.equal(a9bfa70StateIdle(0), true);
  assert.equal(a9bfa70StateIdle(1), false);
  assert.equal(a9bfa70StateIdle(0x100), false); // WIDE: full dword
  assert.equal(a9bfa70StateIdle(0xffffffff), false);

  // Link null (0x009bfaa8..aa): FULL dword link==0 -> flag check.
  assert.equal(a9bfa70LinkNull(0), true);
  assert.equal(a9bfa70LinkNull(1), false);
  assert.equal(a9bfa70LinkNull(0x100), false); // WIDE
  assert.equal(a9bfa70LinkNull(0xffffffff), false);

  // Link index -1 (0x009bfab2..b5): FULL dword == 0xffffffff.
  assert.equal(a9bfa70LinkIndexNeg1(0xffffffff), true);
  assert.equal(a9bfa70LinkIndexNeg1(0), false);
  assert.equal(a9bfa70LinkIndexNeg1(0x100), false); // WIDE: not -1
  assert.equal(a9bfa70LinkIndexNeg1(0xfffffffe), false);

  // Index ge (0x009bfab7..bd): SIGNED int32 linkIdx >= ownIdx (jge).
  assert.equal(a9bfa70IndexGe(0x23, 0x22), true);
  assert.equal(a9bfa70IndexGe(0x22, 0x23), false);
  assert.equal(a9bfa70IndexGe(0x23, 0x23), true);
  assert.equal(a9bfa70IndexGe(0xffffffff, 1), false); // WIDE: -1 >= 1
  assert.equal(a9bfa70IndexGe(0x80000000, 0), false); // -2^31 >= 0
  assert.equal(a9bfa70IndexGe(0x7fffffff, 0x80000000), true); // +max >= -2^31
  assert.equal(a9bfa70IndexGe(0xffffffff, 0xffffffff), true);

  // Link is self (0x009bfabf..c1): FULL dword link == player ptr.
  assert.equal(a9bfa70LinkIsSelf(0x1000, 0x1000), true);
  assert.equal(a9bfa70LinkIsSelf(0x1000, 0x1004), false);
  assert.equal(a9bfa70LinkIsSelf(0xffffffff, 0xffffffff), true);

  // Flag 20a9 (0x009bfac3..ca): LOW byte [p+0x20a9] != 0.
  assert.equal(a9bfa70Flag20a9Set(0), false);
  assert.equal(a9bfa70Flag20a9Set(1), true);
  assert.equal(a9bfa70Flag20a9Set(0x100), false); // WIDE low byte 0
  assert.equal(a9bfa70Flag20a9Set(0x1ff), true);  // WIDE low byte ff
  assert.equal(a9bfa70Flag20a9Set(0xffffffff), true);

  // Count gate (composed `inc esi` @ 0x009bfacc): slot && state &&
  // (link_null || linkIdxNeg1 || indexGe || linkSelf) && flag.
  assert.equal(a9bfa70CountGate(1, 1, 1, 0, 0, 0, 1), true);  // null link
  assert.equal(a9bfa70CountGate(1, 1, 0, 1, 0, 0, 1), true);  // idx -1
  assert.equal(a9bfa70CountGate(1, 1, 0, 0, 1, 0, 1), true);  // idx >= own
  assert.equal(a9bfa70CountGate(1, 1, 0, 0, 0, 1, 1), true);  // self link
  assert.equal(a9bfa70CountGate(1, 1, 0, 0, 0, 0, 1), false); // blocked link
  assert.equal(a9bfa70CountGate(0, 1, 1, 0, 0, 0, 1), false); // slot blocks
  assert.equal(a9bfa70CountGate(1, 0, 1, 0, 0, 0, 1), false); // state blocks
  assert.equal(a9bfa70CountGate(1, 1, 1, 0, 0, 0, 0), false); // flag blocks
  // Composed gate params are LAW VALUES (0/1) — any nonzero = set.
  assert.equal(a9bfa70CountGate(0x100, 1, 1, 0, 0, 0, 1), true); // WIDE set
  assert.equal(a9bfa70CountGate(1, 1, 1, 0, 0, 0, 0x100), true);  // WIDE set
  assert.equal(a9bfa70CountGate(1, 1, 1, 0, 0, 0, 0x1ff), true);  // WIDE flag

  // Count result (inc esi): res + gate, 32-bit wrap.
  assert.equal(a9bfa70CountResult(0, 1), 1);
  assert.equal(a9bfa70CountResult(3, 1), 4);
  assert.equal(a9bfa70CountResult(3, 0), 3);
  assert.equal(a9bfa70CountResult(0xffffffff, 1) >>> 0, 0); // wrap

  // --- Full-body PE-truth differential (a9bfa70Ref) ---
  const noLink = 0;
  // Empty list -> 0.
  let r = a9bfa70Ref(0x1000, 0x1000, []);
  assert.equal(r, 0, "empty list -> 0");

  // Single fully-eligible slot (null link + flag set) -> 1.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, noLink, 0, 7, 1]]);
  assert.equal(r, 1, "null link + flag -> counted");

  // Slot gate blocks (FULL dword; WIDE 0x100 also blocks).
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 1, 0, noLink, 0, 7, 1]]);
  assert.equal(r, 0, "slot nonzero -> not counted");
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0x100, 0, noLink, 0, 7, 1]]);
  assert.equal(r, 0, "slot WIDE -> not counted");

  // State gate blocks (FULL dword).
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 1, noLink, 0, 7, 1]]);
  assert.equal(r, 0, "state nonzero -> not counted");

  // Flag byte semantics: 0 / WIDE 0x100 skip; 0xff / 0x1ff count.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, noLink, 0, 7, 0]]);
  assert.equal(r, 0, "flag 0 -> not counted");
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, noLink, 0, 7, 0x100]]);
  assert.equal(r, 0, "flag WIDE low byte 0 -> not counted");
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, noLink, 0, 7, 0x1ff]]);
  assert.equal(r, 1, "flag WIDE low byte ff -> counted");
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, noLink, 0, 7, 0xff]]);
  assert.equal(r, 1, "flag 0xff -> counted");

  // Link present + linkIdx == -1 -> flag check -> counted.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, 0x3000, 0xffffffff, 7, 1]]);
  assert.equal(r, 1, "linkIdx -1 -> counted");

  // Link present + linkIdx < own (SIGNED) + link foreign -> SKIP.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, 0x3000, 3, 7, 1]]);
  assert.equal(r, 0, "foreign link with smaller index -> skip");

  // Link present + link == player (self) -> flag check -> counted.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, 0x2000, 3, 7, 1]]);
  assert.equal(r, 1, "self link -> counted");

  // Link present + linkIdx >= own (SIGNED) -> flag check EVEN foreign.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, 0x3000, 7, 7, 1]]);
  assert.equal(r, 1, "foreign link with index >= own -> counted");
  // SIGNED lane: linkIdx 0xffffffff (-1) >= own 0xffffffff (-1) -> true.
  r = a9bfa70Ref(0x1000, 0x1004, [[0x2000, 0, 0, 0x3000, 0xffffffff, 0xffffffff, 1]]);
  assert.equal(r, 1, "signed equal negative indices -> counted");

  // Combined: 3 slots — eligible, slot-blocked, flag-blocked -> 1.
  r = a9bfa70Ref(0x1000, 0x100c, [
    [0x2000, 0, 0, noLink, 0, 0, 1],
    [0x2004, 1, 0, noLink, 0, 0, 1],
    [0x2008, 0, 0, noLink, 0, 0, 0x100],
  ]);
  assert.equal(r, 1, "combined count 1 (slot + flag wide blocks)");

  // Combined: 3 slots — eligible, eligible, flag-blocked -> 2.
  r = a9bfa70Ref(0x1000, 0x100c, [
    [0x2000, 0, 0, noLink, 0, 0, 1],
    [0x2004, 0, 0, noLink, 0, 0, 0xff],
    [0x2008, 0, 0, noLink, 0, 0, 0x100],
  ]);
  assert.equal(r, 2, "combined count 2 (two eligible, flag wide blocks one)");

  // Combined: self-link path + null-link path + foreign-small-index skip.
  r = a9bfa70Ref(0x1000, 0x100c, [
    [0x2000, 0, 0, 0x2000, 2, 5, 1],   // self link -> counted
    [0x2004, 0, 0, noLink, 0, 5, 0xff], // null link -> counted
    [0x2008, 0, 0, 0x3000, 1, 5, 1],   // foreign smaller -> skipped
  ]);
  assert.equal(r, 2, "combined count 2 (self + null, foreign smaller skip)");

  // Third slot with linkIdx >= own -> counted too (3 total).
  r = a9bfa70Ref(0x1000, 0x100c, [
    [0x2000, 0, 0, noLink, 0, 5, 1],
    [0x2004, 0, 0, noLink, 0, 5, 1],
    [0x2008, 0, 0, 0x3000, 5, 5, 1],
  ]);
  assert.equal(r, 3, "combined count 3 (foreign index >= own counted)");

  // Constants (all PE-derived this unit; 4-site rel32 census).
  assert.equal(a9bfa70NextVa(), 0x009bfae0);
  assert.equal(a9bfa70Va(), 0x009bfa70);
  assert.equal(a9bfa70FirstRetVa(), 0x009bfadd);
  assert.equal(a9bfa70RetVa(), 0x009bfadd);
  assert.equal(a9bfa70Int3Va(), 0x009bfade);
  assert.equal(a9bfa70BodyBytes(), 0x70);
  assert.equal(a9bfa70Sites(), 4);
  assert.equal(a9bfa70Site0Va(), 0x006622bf);
  assert.equal(a9bfa70Site1Va(), 0x0066233d);
  assert.equal(a9bfa70Site2Va(), 0x008ef9c2);
  assert.equal(a9bfa70Site3Va(), 0x008efe49);
  assert.equal(a9bfa70ListBeginOfs(), 0);
  assert.equal(a9bfa70ListEndOfs(), 4);
  assert.equal(a9bfa70ListStride(), 4);
  assert.equal(a9bfa70SlotFlagOfs(), 0x2c);
  assert.equal(a9bfa70StateOfs(), 0x3bc);
  assert.equal(a9bfa70LinkOfs(), 0x1e68);
  assert.equal(a9bfa70IndexOfs(), 0x161c);
  assert.equal(a9bfa70Flag20a9Ofs(), 0x20a9);
  assert.equal(a9bfa70ManagerGlobalVa(), 0x00c71678);
  assert.equal(a9bfa70ReceiverOfs(), 0x1baa8);
});

function a9bfa70Ref(begin, end, players) {
  let count = a9bfa70ListCount(begin, end);
  let res = 0;
  let idx = 0;
  let guard = 0;
  while (a9bfa70IdxContinue(idx, count) && guard++ < 1000000) {
    const p = players[idx] || [idx * 4 + begin, 1, 1, 0, 0, 1, 0];
    const addr = p[0], p2c = p[1], p3bc = p[2], linkAddr = p[3],
          linkIdx = p[4], ownIdx = p[5], flag = p[6];
    const gate = a9bfa70CountGate(
      a9bfa70SlotFree(p2c) ? 1 : 0,
      a9bfa70StateIdle(p3bc) ? 1 : 0,
      a9bfa70LinkNull(linkAddr) ? 1 : 0,
      a9bfa70LinkIndexNeg1(linkIdx) ? 1 : 0,
      a9bfa70IndexGe(linkIdx, ownIdx) ? 1 : 0,
      a9bfa70LinkIsSelf(linkAddr, addr) ? 1 : 0,
      a9bfa70Flag20a9Set(flag) ? 1 : 0);
    res = a9bfa70CountResult(res, gate);
    idx = (idx + 1) >>> 0;
  }
  return res;
}

test("JS oracle: 9ba980 PURE CoopBabiesOnly bit-0x10 getter (ABI v50)", () => {
  // Law-level lane coverage (byte-gate uint32_ & 0x10; no uint8_t).
  assert.equal(cbo9ba980FlagBit4Set(0), false);
  assert.equal(cbo9ba980FlagBit4Set(0x10), true);
  assert.equal(cbo9ba980FlagBit4Set(0x100), false); // WIDE: bit 4 clear
  assert.equal(cbo9ba980FlagBit4Set(0x110), true);  // WIDE: bit 4 set
  assert.equal(cbo9ba980FlagBit4Set(0x1ff), true);  // WIDE: bit 4 set
  assert.equal(cbo9ba980FlagBit4Set(0xffffffff), true); // WIDE
  assert.equal(cbo9ba980FlagBit4Set(0x08), false);  // bit 3 only
  assert.equal(cbo9ba980FlagBit4Set(0x18), true);   // bits 3+4
  assert.equal(cbo9ba980ResultTrue(), 1);
  assert.equal(cbo9ba980ResultFalse(), 0);

  // Full-body PE-truth differential (cbo9ba980Ref).
  assert.equal(cbo9ba980Ref(0), 0);
  assert.equal(cbo9ba980Ref(0x10), 1);
  assert.equal(cbo9ba980Ref(0x100), 0);
  assert.equal(cbo9ba980Ref(0x110), 1);
  assert.equal(cbo9ba980Ref(0x1ff), 1);
  assert.equal(cbo9ba980Ref(0xffffffff), 1);
  assert.equal(cbo9ba980Ref(0x08), 0);
  assert.equal(cbo9ba980Ref(0x18), 1);

  // Constants (all PE-derived this unit; 3-site rel32 census in-band).
  assert.equal(cbo9ba980NextVa(), 0x009ba9a0);
  assert.equal(cbo9ba980Va(), 0x009ba980);
  assert.equal(cbo9ba980FirstRetVa(), 0x009ba995);
  assert.equal(cbo9ba980RetVa(), 0x009ba998);
  assert.equal(cbo9ba980Int3Va(), 0x009ba999);
  assert.equal(cbo9ba980BodyBytes(), 0x19);
  assert.equal(cbo9ba980Sites(), 3);
  assert.equal(cbo9ba980Site0Va(), 0x009bae7e);
  assert.equal(cbo9ba980Site1Va(), 0x009bb081);
  assert.equal(cbo9ba980Site2Va(), 0x009bb288);
  assert.equal(cbo9ba980BitsetOfs(), 0x26548);
  assert.equal(cbo9ba980BitsetMask(), 0x10);
  assert.equal(cbo9ba980ManagerGlobalVa(), 0x00c71678);
});

function cbo9ba980Ref(field26548) {
  // PE-truth: mov eax,[g_Game]; mov eax,[eax+0x26548]; and eax,0x10;
  // or eax,0; je -> xor al,al / mov al,1.  The field value is passed
  // in place of the memory read; the gate is the only behavior.
  return cbo9ba980FlagBit4Set(field26548) ? cbo9ba980ResultTrue()
                                          : cbo9ba980ResultFalse();
}

/* ====================================================================== */
/* v52 -- A9C6110: VA 0x009c6110 pure out-state decision island          */
/* (band 0x9c6000..0x9c7000 residual below the GameState edge 0x9c7000;  */
/* W32-F14 residual census).  cdecl, TWO stack args (arg1 = [ebp+8]      */
/* in-state ptr, arg2 = [ebp+0xc] out-state ptr), plain ret.  Body       */
/* 0x009c6110..0x009c612e (SINGLE ret @0x009c612e; int3 @0x009c612f).     */
/* PURE-class: 0 E8 / 0 indirect / 1 observable out-param store          */
/* @0x009c612b.  ZERO direct rel32 callers (full E8 census) — reached    */
/* ONLY as an address-taken callback (`push 0x9c6110` @0x009c60c4,       */
/* visitor arg to the HOST walk 0x00a51c60, picker owner 0x009c60a0).    */
/* Both gates FULL-DWORD — zero uint8_t, zero byte masks.                */
/*   PE law: cmp dword [ecx],1 ; jne ret      state==1u gate             */
/*           xor edx,edx ; cmp edx,[eax+8]    flags of 0 - field8        */
/*           sbb eax,eax ; and eax,~2 ; add eax,4    2 (CF) / 4 (no CF)  */
/*           mov [ecx],eax                    store ONLY under the gate  */
/*   CF = borrow of (0 - field8) unsigned = (field8 != 0u).              */
/* ====================================================================== */

function v52A9c6110GatePe(state) {
  /* 0x009c6116 cmp dword [ecx],1 / 0x009c6119 jne 0x9c612d — FULL-DWORD
     equality (0x100/0x1ff/0xffffffff do NOT gate; no low-byte trick). */
  return (state >>> 0) === A9C6110_MATCH_STATE ? 1 : 0;
}

function v52A9c6110ValuePe(field8) {
  /* 0x009c611e xor edx,edx / 0x009c6120 cmp edx,[eax+8] — flags of
     0 - field8; 0x009c6123 sbb eax,eax -> eax = -CF; 0x009c6125 and
     eax,0xfffffffe; 0x009c6128 add eax,4.  CF (unsigned borrow of
     0 - field8) holds iff field8 != 0u (0 - 0 = 0 no borrow; any
     nonzero unsigned value borrows).  Result 2 / 4. */
  return (field8 >>> 0) !== 0 ? A9C6110_VALUE_TWO : A9C6110_VALUE_FOUR;
}

function v52A9c6110NextStatePe(state, field8) {
  /* Whole body: the store @0x009c612b fires ONLY under the gate; the
     gate-miss arm (jne 0x9c612d) returns the state byte-for-byte
     unchanged (no store, no call). */
  if (v52A9c6110GatePe(state) === 0) return state >>> 0;
  return v52A9c6110ValuePe(field8);
}

test("v52 A9C6110: 0x009c6110 pure out-state decision island (build + ABI + census + laws + differential)", async () => {
  const w = await loadWasm();
  assert.equal(w.abi(), 52);

  assert.equal(PROCESS_INPUT_PURE_ABI_VERSION, 52);
  assert.equal(w.abi(), 52);
  const h = readFileSync(header, "utf8");
  /* v52 A9C6110 island needles. */
  assert.match(h, /ABI v52 -- 0x009c6110/);
  assert.match(h, /ISAAC_A9C6110_VA = 0x009c6110/);
  assert.match(h, /ISAAC_A9C6110_RET_VA = 0x009c612e/);
  assert.match(h, /ISAAC_A9C6110_FIRST_RET_VA = 0x009c612e/);
  assert.match(h, /ISAAC_A9C6110_INT3_VA = 0x009c612f/);
  assert.match(h, /ISAAC_A9C6110_BODY_BYTES = 0x1f/);
  assert.match(h, /ISAAC_A9C6110_SITES = 0/);
  assert.match(h, /ISAAC_A9C6110_POINTER_REF_VA = 0x009c60c4/);
  assert.match(h, /ISAAC_A9C6110_HOST_WALK_VA = 0x00a51c60/);
  assert.match(h, /ISAAC_A9C6110_WALK_OWNER_VA = 0x009c60a0/);
  assert.match(h, /ISAAC_A9C6110_STATE_OFS = 0/);
  assert.match(h, /ISAAC_A9C6110_FIELD8_OFS = 8/);
  assert.match(h, /ISAAC_A9C6110_MATCH_STATE = 1/);
  assert.match(h, /ISAAC_A9C6110_VALUE_TWO = 2/);
  assert.match(h, /ISAAC_A9C6110_VALUE_FOUR = 4/);
  assert.match(h, /ISAAC_A9C6110_NEXT_VA = 0x009c6130/);
  assert.match(h, /ABI_VERSION = 52 }/);
  assert.match(h, /zero uint8_t params, zero in-body byte masks/);
  assert.equal((h.match(/ABI_VERSION = 52/g) || []).length >= 1, true);
  /* Model constants agree (A9C6110 mirror). */
  assert.equal(A9C6110_VA, 0x009c6110);
  assert.equal(A9C6110_FIRST_RET_VA, 0x009c612e);
  assert.equal(A9C6110_RET_VA, 0x009c612e);
  assert.equal(A9C6110_INT3_VA, 0x009c612f);
  assert.equal(A9C6110_BODY_BYTES, 0x1f);
  assert.equal(A9C6110_SITES, 0);
  assert.equal(A9C6110_POINTER_REF_VA, 0x009c60c4);
  assert.equal(A9C6110_HOST_WALK_VA, 0x00a51c60);
  assert.equal(A9C6110_WALK_OWNER_VA, 0x009c60a0);
  assert.equal(A9C6110_STATE_OFS, 0);
  assert.equal(A9C6110_FIELD8_OFS, 8);
  assert.equal(A9C6110_MATCH_STATE, 1);
  assert.equal(A9C6110_VALUE_TWO, 2);
  assert.equal(A9C6110_VALUE_FOUR, 4);
  assert.equal(A9C6110_NEXT_VA, 0x009c6130);
  assert.equal(a9c6110Va(), 0x009c6110);
  assert.equal(a9c6110Field8Ofs(), 8);
  assert.equal(a9c6110StateOfs(), 0);
  assert.equal(a9c6110MatchState(), 1);
  assert.equal(a9c6110ValueTwo(), 2);
  assert.equal(a9c6110ValueFour(), 4);
  assert.equal(a9c6110FirstRetVa(), 0x009c612e);
  assert.equal(a9c6110RetVa(), 0x009c612e);
  assert.equal(a9c6110Int3Va(), 0x009c612f);
  assert.equal(a9c6110BodyBytes(), 0x1f);
  assert.equal(a9c6110Sites(), 0);
  assert.equal(a9c6110PointerRefVa(), 0x009c60c4);
  assert.equal(a9c6110HostWalkVa(), 0x00a51c60);
  assert.equal(a9c6110WalkOwnerVa(), 0x009c60a0);
  assert.equal(a9c6110NextVa(), 0x009c6130);
  /* Raw disasm needles (cpu-dump/009c6110.txt = this unit's body dump). */
  const dis = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "009c6110.txt"),
    "utf8");
  assert.match(dis, /0x009c6116: 833901\s+cmp\s+dword ptr \[ecx\], 1/);
  assert.match(dis, /0x009c6119: 7512\s+jne\s+0x9c612d/);
  assert.match(dis, /0x009c6120: 3b5008\s+cmp\s+edx, dword ptr \[eax \+ 8\]/);
  assert.match(dis, /0x009c6123: 1bc0\s+sbb\s+eax, eax/);
  assert.match(dis, /0x009c6125: 83e0fe\s+and\s+eax, 0xfffffffe/);
  assert.match(dis, /0x009c6128: 83c004\s+add\s+eax, 4/);
  assert.match(dis, /0x009c612b: 8901\s+mov\s+dword ptr \[ecx\], eax/);
  assert.match(dis, /0x009c612e: c3\s+ret/);
  /* Census evidence: the address-take push @0x009c60c4 (picker body
     0x9c60a0..0x9c60d8, host walk E8 @0x9c60d1). */
  const owner = readFileSync(
    join(root, "output", "decomp", "5129df723e64", "section-notes",
         "cpu-dump", "009c60a0.txt"),
    "utf8");
  assert.match(owner, /0x009c60c4: 6810619c00\s+push\s+0x9c6110/);


  /* ---- scalar laws (FULL-DWORD gate / nonzero value chain) ---- */

  /* gate: FULL-DWORD equality vs 1 — only 1u gates. */
  assert.equal(w.c52gate(0), 0);
  assert.equal(w.c52gate(1), 1);
  assert.equal(w.c52gate(2), 0);
  assert.equal(w.c52gate(0x100 | 0), 0);
  assert.equal(w.c52gate(0x1ff | 0), 0);
  assert.equal(w.c52gate(0x7fffffff | 0), 0);
  assert.equal(w.c52gate(0x80000000 | 0), 0);
  assert.equal(w.c52gate(-1), 0);
  assert.equal(w.c52gate(0xffffffff), 0);
  /* value: (field8 != 0u) ? 2 : 4 — UNSIGNED nonzero (0x80000000/0xffffffff
     are 2, NOT 4; 0x100/0x1ff are 2, NOT 4 — no low-byte masking). */
  assert.equal(w.c52value(0), 4);
  assert.equal(w.c52value(1), 2);
  assert.equal(w.c52value(0xff), 2);
  assert.equal(w.c52value(0x100 | 0), 2);
  assert.equal(w.c52value(0x1ff | 0), 2);
  assert.equal(w.c52value(0x7fffffff | 0), 2);
  assert.equal(w.c52value(0x80000000 | 0), 2);
  assert.equal(w.c52value(-1), 2);
  /* next_state: gate-miss keeps the state byte-for-byte (incl. wide). */
  assert.equal(w.c52nextState(0, 0x12345678) | 0, 0);
  assert.equal(w.c52nextState(2, 0) | 0, 2);
  assert.equal(w.c52nextState(0x100 | 0, 0) | 0, 0x100 | 0);
  assert.equal(w.c52nextState(-1, 0) | 0, -1);
  assert.equal(w.c52nextState(0x80000000, 1) | 0, 0x80000000 | 0);
  /* gate-hit writes the value. */
  assert.equal(w.c52nextState(1, 0) | 0, 4);
  assert.equal(w.c52nextState(1, 1) | 0, 2);
  assert.equal(w.c52nextState(1, 0xffffffff) | 0, 2);
  assert.equal(w.c52nextState(1, 0x80000000) | 0, 2);
  assert.equal(w.c52nextState(1, 0x100 | 0) | 0, 2);
  /* row parity: wasm == model == PE-truth. */
  const rows = [
    [0, 0], [1, 0], [1, 1], [1, 0xff], [1, 0x100], [2, 0x100],
    [0x1ff, 0x1ff], [1, 0x80000000], [0x80000000, 0], [0xffffffff, 0],
    [0xffffffff, 0xffffffff], [1, 0x7fffffff], [0x100, 0x100],
  ];
  for (const [st, f8] of rows) {
    assert.equal(w.c52gate(st >>> 0) | 0, v52A9c6110GatePe(st),
                 `gate ${st}`);
    assert.equal(w.c52gate(st >>> 0) | 0,
                 a9c6110Gate(st) | 0, `gate-model ${st}`);
    assert.equal(w.c52value(f8 >>> 0) | 0, v52A9c6110ValuePe(f8),
                 `value ${f8}`);
    assert.equal(w.c52value(f8 >>> 0) | 0,
                 a9c6110Value(f8) | 0, `value-model ${f8}`);
    assert.equal(w.c52nextState(st >>> 0, f8 >>> 0) | 0,
                 v52A9c6110NextStatePe(st, f8) | 0, `next ${st}/${f8}`);
    assert.equal(w.c52nextState(st >>> 0, f8 >>> 0) | 0,
                 a9c6110NextState(st, f8) | 0, `next-model ${st}/${f8}`);
  }
  /* Mutant discriminators: the wide drives above kill, by construction:
     M1 gate inverted (==1 -> !=1) fails gate(0)/gate(1);
     M2 value flipped (2<->4) fails value(0)/value(1);
     M3 next_state ignoring the gate fails nextState(0, 0x12345678);
     M4 field8 low-byte masked (& 0xff) fails value(0x100) (would be 2
        under the mask — PE says 2 anyway? NO: PE compares the FULL dword;
        under the mask 0x100 -> 0 -> 4, so value(0x100) === 4 kills it). */
  assert.equal(w.c52value(0x100 | 0) | 0, 2); /* full-dword, not 4 */


  /* ---- deterministic randomized differential corpus (500 draws) ---- */

  let seed = 0x009c6110 >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed; };
  let cases = 0;
  for (let trial = 0; trial < 500; trial++) {
    const st = rnd();
    const f8 = rnd();
    assert.equal(w.c52gate(st >>> 0) | 0, v52A9c6110GatePe(st),
                 `trial ${trial} gate-pe`);
    assert.equal(w.c52gate(st >>> 0) | 0, a9c6110Gate(st) | 0,
                 `trial ${trial} gate-model`);
    assert.equal(w.c52value(f8 >>> 0) | 0, v52A9c6110ValuePe(f8),
                 `trial ${trial} value-pe`);
    assert.equal(w.c52value(f8 >>> 0) | 0, a9c6110Value(f8) | 0,
                 `trial ${trial} value-model`);
    assert.equal(w.c52nextState(st >>> 0, f8 >>> 0) | 0,
                 v52A9c6110NextStatePe(st, f8) | 0, `trial ${trial} next-pe`);
    assert.equal(w.c52nextState(st >>> 0, f8 >>> 0) | 0,
                 a9c6110NextState(st, f8) | 0, `trial ${trial} next-model`);
    /* coherence: next == gate ? value : state (whole-body composition). */
    assert.equal(w.c52nextState(st >>> 0, f8 >>> 0) | 0,
                 (v52A9c6110GatePe(st) === 1 ? v52A9c6110ValuePe(f8) : st >>> 0) | 0,
                 `trial ${trial} next==gate?value:state`);
    /* coherence: value is 2 or 4, decided by the full dword only. */
    assert.ok(w.c52value(f8 >>> 0) === 2 || w.c52value(f8 >>> 0) === 4,
              `trial ${trial} value in {2,4}`);
    cases += 8;
  }
  /* Wide drives (v9 rule: never pre-mask the wasm arg). */
  for (const wd of [0x100, 0x1ff, 0x7fffffff, 0x80000000, 0xffffffff]) {
    assert.equal(w.c52gate(wd >>> 0) | 0, v52A9c6110GatePe(wd), `wide gate ${wd}`);
    assert.equal(w.c52value(wd >>> 0) | 0, v52A9c6110ValuePe(wd), `wide value ${wd}`);
    assert.equal(w.c52nextState(wd >>> 0, wd >>> 0) | 0,
                 v52A9c6110NextStatePe(wd, wd) | 0, `wide next ${wd}`);
    cases += 3;
  }
  assert.ok(cases >= 4000 + 15, `expected >= 4015 cases, got ${cases}`);

});
