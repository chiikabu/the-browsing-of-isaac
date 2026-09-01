/** Independent JS oracle for ProcessInput residual pure peels

 *  (FUN_006f9400 / FUN_006f95a0 / GetDeviceType / Manager shell /

 *  FUN_00a6de60 / NightmareScene::Show). Hash-bound PE helpers.

 *  Game::ProcessInput is not pinned. Not Update-wired.

 */

export const PROCESS_INPUT_PURE_ABI_VERSION = 52;

function asI32(v) {

  if (typeof v === "bigint") return Number(BigInt.asIntN(32, v));

  return (v | 0);

}

function asU32(v) {

  if (typeof v === "bigint") return Number(v & 0xffffffffn);

  return (v >>> 0);

}

function f32FromBits(bits) {
  const u = new Uint32Array(1);
  u[0] = asU32(bits);
  return new Float32Array(u.buffer)[0];
}

function nonzeroU8(v) {

  return ((v | 0) & 0xff) !== 0 ? 1 : 0;

}

function peSignedMod2Eq1Int(stage) {

  let eax = stage | 0;

  eax &= (0x80000001 | 0);

  if (eax < 0) {

    eax -= 1;

    eax |= (0xfffffffe | 0);

    eax += 1;

  }

  return eax === 1 ? 1 : 0;

}

function peComissZeroBelowOrUnordered(f) {

  const x = Math.fround(+f);

  if (x !== x) return 1;

  return x > 0 ? 1 : 0;

}

function a1f280U64(lo, hi) {

  return (BigInt(asU32(hi)) << 32n) | BigInt(asU32(lo));

}

function a1f280ScaleTickU64(seedLo, seedHi) {

  const seed = a1f280U64(seedLo, seedHi);

  const mul =

    (BigInt(asU32(A1F280_TICK_SCALE_MUL_HI)) << 32n) |

    BigInt(asU32(A1F280_TICK_SCALE_MUL_LO));

  const product = seed * mul;

  return product >> BigInt(A1F280_TICK_SCALE_SHIFT);

}

function a1f280Maxss(a, b) {

  const x = Math.fround(+a);

  const y = Math.fround(+b);

  if (x !== x || y !== y) return y;

  return x > y ? x : y;

}

/** PE signed n%2 remainder == 1 (and 0x80000001 + js fixup). */

export function peSignedMod2Eq1(stage) {

  return peSignedMod2Eq1Int(stage) !== 0;

}

export const INPUT_MASK_A_ID_38 = 0x38;

export const INPUT_MASK_A_ID_39 = 0x39;

export const INPUT_MASK_A_ID_3A = 0x3a;

export const INPUT_MASK_A_ID_3B = 0x3b;

export const INPUT_MASK_A_ID_3C = 0x3c;

export const INPUT_MASK_A_ID_3D = 0x3d;

export const INPUT_MASK_A_ID_3E = 0x3e;

export const INPUT_MASK_B_ID_3F = 0x3f;

export const INPUT_MASK_B_ID_40 = 0x40;

export const INPUT_MASK_B_ID_41 = 0x41;

export const INPUT_MASK_B_ID_42 = 0x42;

export const INPUT_MASK_B_ID_43 = 0x43;

export const INPUT_MASK_B_ID_44 = 0x44;

export const INPUT_MASK_B_ID_46 = 0x46;

export const INPUT_MASK_B_ID_4F = 0x4f;

export const INPUT_MASK_BIT0 = 0x01;

export const INPUT_MASK_BIT1 = 0x02;

export const INPUT_MASK_BIT2 = 0x04;

export const INPUT_MASK_BIT3 = 0x08;

export const INPUT_MASK_BIT4 = 0x10;

export const INPUT_MASK_BIT5 = 0x20;

export const INPUT_MASK_BIT6 = 0x40;

export const INPUT_MASK_B_ID_46_FORCE = 0x7f;

export const INPUT_MASK_A_GATE39_MODE_EXCLUDE = 0x2c;

export const INPUT_MASK_A_GATE39_STAGE_MAX = 8;

/* v109 dedupe: the FUN_006f9400 / FUN_006f95a0 law EXPORTS (gate39 / mask /
   mask_full / 6f95a0) are OWNED by the render-shell family
   (isaac_render_shell_6f9400_gate39 / _mask / _mask_full and
   isaac_render_shell_6f95a0_mask, ABI v31; the render-slice build links
   render_shell_pure_helpers.cpp and consumes them by name). This family
   keeps the INPUT_MASK_* constants + host VAs below and pins the RShell
   export semantics BY REFERENCE in the suite; NO duplicate law exports.
   See section-notes/update-v109-dupva-dedupe/. */
export const INPUT_MASK_6F9400_HOST_VA = 0x006f9400;
export const INPUT_MASK_6F95A0_HOST_VA = 0x006f95a0;

export const MANAGER_EARLY_CONTINUE = 0;

export const MANAGER_EARLY_RETURN_SILENT = 1;

export const MANAGER_EARLY_RETURN_INC = 2;

export const MANAGER_FLOAT_APPROACH_STEP_BITS = 0x40c00000;

export const A6DE60_EDGE_NONE = 0;

export const A6DE60_EDGE_PRESS = 1;

export const A6DE60_EDGE_RELEASE = 2;

export const A6DE60_EDGE_SILENT = 3;

export const A6DE60_DIERR_INPUTLOST = 0x8007001e;

export const A6DE60_DIERR_NOTACQUIRED = 0x8007000c;

export const A6DE60_AXIS_TYPE_MAX = 0x2c;

export const A6DE60_AXIS_DISPATCH_DEFAULT = 12;

export const A6DE60_AXIS_DISPATCH_OOR = 13;

export const A6DE60_DIDOD_STRIDE = 0x14;

export const A6DE60_POV_CENTER_LO16 = 0xffff;

export const A6DE60_POV_EAST = 0x2328;

export const A6DE60_POV_SOUTH = 0x4650;

export const A6DE60_POV_WEST = 0x6978;

export const A6DE60_HOOK_COMPACT_DWORDS = 3;

export const A648B0_MODE_ALLOC = 0;

export const A648B0_MODE_FREE = 1;

export const A648B0_MODE_ACCOUNT = 2;

export const A648B0_MODE_NOP = 3;

export const A1FC00_QUEUE_STRIDE = 8;

export const A1FC00_SLOT_STRIDE = 8;

export const A1FC00_FREE_HEADER_THRESHOLD = 0x1000;

export const A1FC00_FREE_HEADER_ADD = 0x23;

export const A1FC00_FREE_HEADER_OFFSET_MAX = 0x1f;

export const A1FC00_SLOT_FULL = 0xffffffff;

export const A1F280_DIR_NEG_X = 0x1;

export const A1F280_DIR_POS_X = 0x2;

export const A1F280_DIR_NEG_Y = 0x4;

export const A1F280_DIR_POS_Y = 0x8;

export const A1F280_ACTION_MODE_IDLE = 4;

export const A1F280_RUMBLE_SUPPRESS_FLAG = 0x8;

export const A1F280_TICK_DELTA_TO_SEC_BITS = 0x3a83126f;

export const A1F280_TICK_SCALE_MUL_LO = 0xd7b634db;

export const A1F280_TICK_SCALE_MUL_HI = 0x431bde82;

export const A1F280_TICK_SCALE_SHIFT = 82;

export const A1F280_OFF_TIMER = 0xd8;

export const A1F280_OFF_INTENSITY = 0xdc;

export const A1F280_OFF_BASELINE_LO = 0xe0;

export const A1F280_OFF_BASELINE_HI = 0xe4;

export const A1F280_VTBL_RUMBLE = 0x84;

export const A1F280_SUCCESS_AL = 1;

export const A112C0_LEVEL_INFO = 0x1;

export const A112C0_LEVEL_NET = 0x2;

export const A112C0_LEVEL_WARN = 0x4;

export const A112C0_LEVEL_ERROR = 0x8;

export const A112C0_LEVEL_ASSERT = 0x10;

export const A112C0_STATE_IDLE = 0;

export const A112C0_STATE_INIT = 1;

export const A112C0_STATE_READY = 2;

export const A112C0_BUF_CAP = 0x2800;

export const A112C0_PREFIX_VA_INFO = 0x00b81818;

export const A112C0_PREFIX_VA_NET = 0x00b8180c;

export const A112C0_PREFIX_VA_WARN = 0x00b81830;

export const A112C0_PREFIX_VA_ERROR = 0x00b81824;

export const A112C0_PREFIX_VA_ASSERT = 0x00b8183c;

export const A112C0_PREFIX_VA_EMPTY = 0x00b1a4ec;

export const A112C0_FMT_VA = 0x00b62fdc;

export const A112C0_MSG_VA_INVALID_MUTEX = 0x00b9fda8;

export const A112C0_MSG_VA_ACTION_ID_OOR = 0x00b82e78;

export const A112C0_HOST_VA = 0x00a112c0;

export const A1F280_OFF_ACTION_INDEX = 0xc8;

export const A1F280_OFF_ACTION_MODE = 0xcc;

export const A1F280_VTBL_ACTION_QUERY = 0x3c;

export const A1F280_ACTION_QUERY_ARG = 0;

export const A1F280_ACTION_QUERY_CALL_VA = 0x00a1f4db;

export const A1F280_ACTION_INDEX_CLEARED = 0xffffffff;

export const A1F280_ACTION_MODE_AFTER_PUSH = 4;

export const A1F280_VTBL_FILL = 0x80;

export const A1F280_VTBL_AXIS_FILL = 0x7c;

export const A1F280_FILL_PAIR0_CALL_VA = 0x00a1f320;

export const A1F280_FILL_PAIR1_CALL_VA = 0x00a1f3f8;

export const A1F280_FILL_PAIR0_ARG = 0;

export const A1F280_FILL_PAIR1_ARG = 1;

export const A1F280_OFF_AXIS_PAIR0 = 0x40;

export const A1F280_OFF_AXIS_PAIR1 = 0x50;

export const A1F280_DIR_BIT_BASE_PAIR0 = 0;

export const A1F280_DIR_BIT_BASE_PAIR1 = 4;

export const A1F280_AXIS_FILL_PAIR0_CALL_VA = 0x00a1f335;

export const A1F280_AXIS_FILL_PAIR1_CALL_VA = 0x00a1f40d;

export const A1EED0_AXIS_FILL_CALL_VA = 0x00a1eee0;

export const A1F280_AXIS_FILL_OUT_FLOAT_COUNT = 2;

export const A1F280_AXIS_FILL_OUT_X_OFS = 0;

export const A1F280_AXIS_FILL_OUT_Y_OFS = 4;

export const A1F280_OFF_DIR_BITS = 0x30;

export const A1F280_OFF_DIR_THRESH = 0xd4;

export const A1F280_OFF_REMAP_THRESH = 0xd0;

export const A1F280_VTBL_READY = 0x78;

export const A1F280_READY_CALL_VA = 0x00a1f30a;

export const A648B0_HEADER_BYTES = 4;

export const A648B0_TRACKER_CTX_VA = 0x00c7de78;

export const A648B0_TRACKER_CTX_OFS = 0x30;

export const A648B0_TRACKER_FALLBACK_VA = 0x00c7f618;

export const A648B0_MALLOC_IAT_VA = 0x00b187e0;

export const A648B0_FREE_IAT_VA = 0x00b187dc;

export const A648B0_OOM_HOST_VA = 0x00a23200;

export const A648B0_OOM_CODE = 0x7fcb9dd6;

export const A6DA10_SLOT_STRIDE = 4;

export const A6DA10_COM_RELEASE_VTBL = 8;

export const A6DA10_OFF_DEV_STATE = 0x20;

export const A6DA10_OFF_DEV_NAME = 0x04;

export const A6DA10_OFF_DEV_BUF_A = 0x18;

export const A6DA10_OFF_DEV_BUF_B = 0x1c;

export const A6DA10_OFF_STATE_COM = 0x14;

export const A6DA10_OFF_STATE_MAP_A = 0x24;

export const A6DA10_OFF_STATE_MAP_B = 0x28;

export const A6DA10_DISCONNECT_CB_VA = 0x00c78d7c;

export const A6DA10_DISCONNECT_USER_VA = 0x00c78d88;

export const A6DA10_STEP_COM_RELEASE = 0;

export const A6DA10_STEP_FREE_STATE_MAP_A = 1;

export const A6DA10_STEP_FREE_STATE_MAP_B = 2;

export const A6DA10_STEP_FREE_DEV_NAME = 3;

export const A6DA10_STEP_FREE_STATE = 4;

export const A6DA10_STEP_FREE_DEV_BUF_A = 5;

export const A6DA10_STEP_FREE_DEV_BUF_B = 6;

export const A6DA10_STEP_FREE_DEV = 7;

export const A6DA10_TEARDOWN_STEPS_FULL = 8;

export const A6DA10_TEARDOWN_STEPS_TAIL = 4;

export const A6DD30_OFF_AXIS_BASE = 0x18;

export const A6DD30_CB_VA = 0x00c78d70;

export const A6DD30_CB_USER_VA = 0x00c75dac;

export const A6DD30_CB_FRAME_BYTES = 0x1c;

export const A6DD30_CB_ARG_DEVICE = 0;

export const A6DD30_CB_ARG_INDEX = 1;

export const A6DD30_CB_ARG_NEW = 2;

export const A6DD30_CB_ARG_OLD = 3;

export const A6DD30_CB_ARG_TIME = 4;

export const A6DD30_CB_ARG_USER = 5;

export const A6DD30_CB_ARG_COUNT = 6;

export const A6DAB0_SLOT_COUNT = 4;

export const A6DAB0_SLOT_TABLE_VA = 0x00c7e2e0;

export const A6DAB0_NAME_TABLE_VA = 0x00b468b0;

export const A6DAB0_ENABLE_VA = 0x00c7e300;

export const A6DAB0_WINDOW_VA = 0x00c7e2d4;

export const A6DAB0_ENUM_FLAG_VA = 0x00c7ac6b;

export const A6DAB0_SCAN_FLAG_VA = 0x00c7e301;

export const A6DAB0_STATE_HOOK_VA = 0x00c7e2f4;

export const A6DAB0_CAPS_HOOK_VA = 0x00c7e2f8;

export const A6DAB0_CAPS_MODE_VA = 0x00c7e304;

export const A6DAB0_ID_COUNTER_VA = 0x00c7e298;

export const A6DAB0_CONNECT_CB_VA = 0x00c75da8;

export const A6DAB0_CONNECT_USER_VA = 0x00c78d8c;

export const A6DAB0_ENUM_VTBL = 0x10;

export const A6DAB0_ENUM_DEVCLASS = 4;

export const A6DAB0_ENUM_CALLBACK_VA = 0x00a6d560;

export const A6DAB0_CAPS_MODE_MATCH = 2;

export const A6DAB0_CAPS_OFS_VID = 0x14;

export const A6DAB0_CAPS_OFS_PID = 0x16;

export const A6DAB0_RECORD_BYTES = 0x24;

export const A6DAB0_STATE_BYTES = 0x30;

export const A6DAB0_AXIS_COUNT = 6;

export const A6DAB0_BUTTON_COUNT = 0xf;

export const A6DAB0_AXIS_ELEM_BYTES = 4;

export const A6DAB0_BUTTON_ELEM_BYTES = 1;

export const A6DAB0_REC_ID = 0;

export const A6DAB0_REC_NAME = 1;

export const A6DAB0_REC_ENABLED = 2;

export const A6DAB0_REC_VID = 3;

export const A6DAB0_REC_PID = 4;

export const A6DAB0_REC_AXIS_COUNT = 5;

export const A6DAB0_REC_BUTTON_COUNT = 6;

export const A6DAB0_REC_AXIS_ARRAY = 7;

export const A6DAB0_REC_BUTTON_ARRAY = 8;

export const A6DAB0_REC_STATE = 9;

export const A6DAB0_REC_FIELD_COUNT = 10;

export const A6DAB0_ST_ENABLE = 0;

export const A6DAB0_ST_SLOT = 1;

export const A6DAB0_ST_FIELD_COUNT = 2;

export const A6DAB0_STATE_ENABLE_VALUE = 1;

export const A6DAB0_SEARCH_NOT_FOUND = 0xffffffff;

export const A6DAB0_MSG_VA_ENUM_FAIL = 0x00ba1a18;

export const A6DAB0_MSG_VA_CONNECT = 0x00ba1a4c;

export const A6DAB0_MSG_VA_CAPS_FAIL = 0x00ba1ae8;

export const A220C0_OBJ_VA = 0x00c57b18;

export const A220C0_FLAGS_VA = 0x00c57b1c;

export const A220C0_RUN_BIT = 2;

export const A220C0_SLEEP_MS = 0x64;

export const A220C0_THREAD_PROC_VA = 0x00a220c0;

export const A220C0_SPAWN_VTBL = 8;

export const A220C0_SPAWN_PRIORITY = 2;

export const A220C0_SPAWN_STACK = 0x1000;

export const A6CF80_PROBE_COUNT = 4;

export const A6CF80_PROBE_NOT_FOUND = 0xffffffff;

export const A6CF80_MODE_NONE = 0;

export const A6CF80_MODE_LEGACY = 1;

export const A6CF80_MODE_MODERN = 2;

export const A6CF80_HOOK_ORD_PRIMARY = 0;

export const A6CF80_HOOK_GET_STATE = 1;

export const A6CF80_HOOK_SET_STATE = 2;

export const A6CF80_HOOK_GET_CAPS = 3;

export const A6CF80_HOOK_CAPS_EX = 4;

export const A6CF80_HOOK_SLOT_COUNT = 5;

export const A6CF80_PROC_ORD_PRIMARY = 0x64;

export const A6CF80_PROC_ORD_CAPS_EX = 0x6c;

export const A6CF80_COINIT_CHANGED_MODE = 0x80010106;

export const A6CF80_COINIT_FLAGS_FIRST = 2;

export const A6CF80_COINIT_FLAGS_RETRY = 0;

export const A6CF80_NOTIFY_FILTER_BYTES = 0x3c;

export const A6CF80_NOTIFY_FILTER_CBSIZE = 0x30;

export const A6CF80_WNDCLASS_NAME_VA = 0x00ba1710;

export const A6CF80_WNDPROC_VA = 0x00a6cef0;

export const A6CF80_HWND_MESSAGE = -3;

export const MANAGER_SHELL_OFF_STATE = 0x8;

export const MANAGER_SHELL_OFF_COUNTER = 0x4abbc;

export const MANAGER_SHELL_OFF_FLAG_A = 0x4abc4;

export const MANAGER_SHELL_OFF_FLAG_B = 0x4abc5;

export const MANAGER_SHELL_OFF_PAUSE_FLAG = 0x2a3c0;

export const MANAGER_SHELL_OFF_SUB_9C34F0 = 0x4d070;

export const MANAGER_SHELL_OFF_APPROACH = 0x4a950;

export const MANAGER_SHELL_OFF_SUB_90B150 = 0x4b3d8;

export const MANAGER_SHELL_OFF_PROBE_A = 0x4c610;

export const MANAGER_SHELL_OFF_PROBE_B = 0x4c658;

export const MANAGER_SHELL_RECV_SELF = 0;

export const MANAGER_SHELL_RECV_9C34F0 = 1;

export const MANAGER_SHELL_RECV_APPROACH = 2;

export const MANAGER_SHELL_RECV_90B150 = 3;

export const MANAGER_SHELL_RECV_COUNT = 4;

export const MANAGER_APPROACH_SLOT_COUNT = 2;

export const MANAGER_APPROACH_SLOT_STRIDE = 0x130;

export const MANAGER_APPROACH_FIRST_OFS = 0x114;

export const MANAGER_APPROACH_OFF_CURRENT = 0x0;

export const MANAGER_APPROACH_OFF_TARGET = 0x4;

export const MANAGER_APPROACH_OFF_MODE = 0x10;

export const MANAGER_APPROACH_MODE_SKIP_HOST = 0x20;

export const MANAGER_SHELL_STATE_MIN = 1;

export const MANAGER_SHELL_STATE_MAX = 5;

export const MANAGER_SHELL_STATE_TABLE_VA = 0x0095559c;

export const MANAGER_SHELL_STATE_DEFAULT_VA = 0x009553ef;

export const MANAGER_STATE2_OFF_BLOCK_FLAG = 0x4b130;

export const MANAGER_STATE2_OFF_PARITY = 0x4abbc;

export const GAME_STATE2_OFF_CONTAINER = 0x18300;

export const STATE2_OFF_ENTITY_COUNT = 0x1264;

export const STATE2_OFF_ENTITY_ARRAY = 0x125c;

export const STATE2_OFF_ENTITY_FLAG = 0x175;

export const STATE2_OFF_ENTITY_SRC_A = 0x344;

export const STATE2_OFF_ENTITY_SRC_B = 0x348;

export const STATE2_OFF_ENTITY_DST_A = 0x33c;

export const STATE2_OFF_ENTITY_DST_B = 0x340;

export const STATE2_FIXUP_A = 0;

export const STATE2_FIXUP_B = 1;

export const STATE2_FIXUP_COUNT = 2;

export const P9505E0_FIELD_A_DWORD = 0;

export const P9505E0_FIELD_A_BYTE = 1;

export const P9505E0_FIELD_B_DWORD = 2;

export const P9505E0_FIELD_B_BYTE = 3;

export const P9505E0_FIELD_COUNT = 4;

export const P9505E0_OFF_A_DWORD = 0x1918;

export const P9505E0_OFF_A_BYTE = 0x1928;

export const P9505E0_OFF_B_DWORD = 0x1b6c;

export const P9505E0_OFF_B_BYTE = 0x1b7c;

export const P9505E0_RECV_OFS = 0x4b3d8;

export const P9C3990_OFF_NODE_OBJ = 0x8;

export const P9C3990_OFF_OBJ_FLAGS = 0x24;

export const P9C3990_MATCH_BIT = 0x4;

export const P9C3990_OFF_LOCK_SUBOBJ = 0x8;

export const P9C3990_LOCK_VTBL = 0xc;

export const P9C3990_UNLOCK_VTBL = 0x10;

export const P9C3990_LOCK_ARG = -1;

export const STATE_ARM_PROBE_RECV_OFS = 0x4d070;

export const STATE3_RECV_OFS = 0x20dd0;

export const STATE5_RECV_OFS = 0x21628;

export const STATE1_MODE_GLOBAL = 0x00c72a20;

export const STATE1_MODE_OFS = 0x40;

export const STATE1_MODE_MATCH = 0x11;

export const STATE1_TERMINAL_VA = 0x009897d0;

export const STATE2_TERMINAL_VA = 0x006fa540;

export const STATE_ARM_PROBE_VA = 0x009c3990;

export const STATE3_CALL_VA = 0x0095df20;

export const STATE5_CALL_VA = 0x00920510;

export const PREDISPATCH_FIELD_OBJ = 0;

export const PREDISPATCH_FIELD_RECV = 1;

export const PREDISPATCH_FIELD_SUPPRESS = 2;

export const PREDISPATCH_FIELD_MODE = 3;

export const PREDISPATCH_FIELD_COUNT = 4;

export const PREDISPATCH_OFF_OBJ = 0x21c38;

export const PREDISPATCH_OFF_RECV = 0x21c1c;

export const PREDISPATCH_OFF_SUPPRESS = 0x29fb8;

export const PREDISPATCH_OFF_MODE = 0x2a378;

export const PREDISPATCH_MODE_MATCH = 1;

export const PREDISPATCH_QUEUE_BEGIN_OFS = 0x0;

export const PREDISPATCH_QUEUE_END_OFS = 0x4;

export const PREDISPATCH_CALL_VA = 0x00931ba0;

export const STATE2_MID_OFF_2A3C0 = 0x2a3c0;

export const STATE2_MID_OFF_GAME_A = 0x1b83c;

export const STATE2_MID_OFF_GAME_B = 0x1b858;

export const STATE2_MID_GAME_B_MATCH = 0x13;

export const STATE2_MID_OFF_MODE = 0x2a380;

export const STATE2_MID_MODE_V2 = 2;

export const STATE2_MID_OFF_PARITY = 0x4abbc;

export const STATE2_MID_OFF_OBJ_INNER = 0x11f8;

export const STATE2_MID_OFF_OBJ_BYTE = 0x8c;

export const STATE2_MID_CALL_A_VA = 0x009446e0;

export const STATE2_MID_CALL_B_VA = 0x009439d0;

export const STATE2_MID_PARITY_CALL_VA = 0x006fd3f0;

export const STATE2_MID_IS_PAUSED_VA = 0x006fd350;

export const SHELL_ANGLE_BASE_OFS = 0x1bab4;

export const SHELL_ANGLE_SLOT_STRIDE = 0x14;

export const SHELL_ANGLE_SLOT_COUNT = 4;

export const SHELL_ANGLE_COUNT_END_OFS = 0x1bb1c;

export const SHELL_ANGLE_COUNT_BEGIN_OFS = 0x1bb18;

export const SHELL_ANGLE_HALF_MUL_BITS = 0x3f000000;

export const SHELL_ANGLE_EPS_BITS = 0x3e800000;

export const SHELL_ANGLE_NEG_EPS_BITS = 0xbe800000;

export const SHELL_ANGLE_ABS_MASK_VA = 0x00bacb40;

export const SHELL_ANGLE_SIGN_MASK_VA = 0x00bacb70;

export const SHELL_ANGLE_FIXUP_VA = 0x00bacb00;

export const SHELL_APPROACH_RECV_OFS = 0x2a324;

export const SHELL_APPROACH_VALUE_OFS = 0x2a334;

export const SHELL_APPROACH_STEP_OFS = 0x2a338;

export const SHELL_APPROACH_TARGET_BITS = 0x3f800000;

export const SHELL_APPROACH_HOST_VA = 0x0092e430;

export const STATE2_TAIL_OFF_CALL_A_RECV = 0x29fbc;

export const STATE2_TAIL_CALL_A_VA = 0x007e17b0;

export const STATE2_TAIL_OFF_GATE_B = 0x2a3a6;

export const STATE2_TAIL_CALL_B_VA = 0x00a264f0;

export const STATE2_TAIL_CALL_B_RECV_GLOBAL_VA = 0x00c7999c;

export const STATE2_TAIL_CALL_B_EDX_ARG = 0;

export const STATE2_TAIL_ANIM_IDLE_VA = 0x00b1bc54;

export const STATE2_TAIL_ANIM_CLICKED_VA = 0x00b7c444;

export const STATE2_TAIL_PLAY_VA = 0x0040a380;

export const STATE2_TAIL_OFF_PLAY_RECV = 0x4b2a8;

export const STATE2_TAIL_PLAY_RESET_ARG = 0;

export const SHELL_TAIL_WIN_GLOBAL_VA = 0x00c7999c;

export const SHELL_TAIL_WASSERT_MSG_VA = 0x00b9bbcc;

export const SHELL_TAIL_WASSERT_FILE_VA = 0x00b9bbf0;

export const SHELL_TAIL_WASSERT_LINE = 0x310;

export const SHELL_TAIL_WASSERT_IAT_VA = 0x00b18884;

export const SHELL_TAIL_WIN_KIND_OFS = 0x70;

export const SHELL_TAIL_WIN_KIND_DIRECT_COPY = 0x34003;

export const SHELL_TAIL_WIN_D0_OFS = 0x1e0;

export const SHELL_TAIL_WIN_D1_OFS = 0x1e8;

export const SHELL_TAIL_PLATFORM_FLAG_VA = 0x00c73680;

export const SHELL_TAIL_PLATFORM_POLL_VA = 0x00a69f60;

export const SHELL_TAIL_PLATFORM_POLL_ARG0 = 0x10001;

export const SHELL_TAIL_PLATFORM_POLL_ARG1 = 0;

export const SHELL_TAIL_PLATFORM_QUERY_VA = 0x00c736a0;

export const SHELL_TAIL_STORE_F0_OFS = 0x4b3bc;

export const SHELL_TAIL_STORE_F1_OFS = 0x4b3c0;

export const SHELL_TAIL_TIMER_OFS = 0x4b3c4;

export const SHELL_TAIL_TIMER_RESET = 0x12c;

export const SHELL_TAIL_PARITY_OFS = 0x4abbc;

export const PREPOLL_STATE_OFS = 0x8;

export const PREPOLL_HISTORY_OFS = 0xc;

export const PREPOLL_G1_OFS = 0x21618;

export const PREPOLL_CUTSCENE_ID_OFS = 0x2161c;

export const PREPOLL_G2_OFS = 0x21620;

export const PREPOLL_COPY_SLOT_INDEX_OFS = 0x215d8;

export const PREPOLL_COPY_SRC_BASE = 0x20e00;

export const PREPOLL_COPY_SRC_DW = 0x20e10;

export const PREPOLL_COPY_STRIDE = 0x4c;

export const PREPOLL_COPY_DST_CORE = 0x4b290;

export const PREPOLL_COPY_DST_DW = 0x4b2a0;

export const PREPOLL_COPY_DST_EXT = 0x4b28c;

export const PREPOLL_COPY_EXT_FROM_OFS = 0x21624;

export const PREPOLL_COPY_FLAG_OFS = 0x4b288;

export const PREPOLL_COPY_FLAG_VALUE = 1;

export const PREPOLL_G3_OFS = 0x4b2a4;

export const PREPOLL_NIGHTMARE_ARG_OFS = 0x4b2a5;

export const PREPOLL_G4_OFS = 0x4b428;

export const PREPOLL_STATE3ARM_BYTE_OFS = 0x29fb8;

export const PREPOLL_PREDISPATCH_RECV_OFS = 0x20dd0;

export const PREPOLL_STATE5_RECV_OFS = 0x21628;

export const PREPOLL_GAME_STORE_BASE_OFS = 0x265a4;

export const PREPOLL_GAME_STORE_B4_OFS = 0x265b4;

export const PREPOLL_GAME_STORE_B8_OFS = 0x265b8;

export const PREPOLL_GAME_STORE_BC_OFS = 0x265bc;

export const PREPOLL_GAME_STORE_B8_BITS = 0x3f800000;

export const PREPOLL_GAME_STORE_BC_VALUE = 8;

export const PREPOLL_CROSSFADE_RECV_OFS = 0x29fbc;

export const PREPOLL_CROSSFADE_MUSIC_ID = 0x3f;

export const PREPOLL_CROSSFADE_RATE_BITS = 0x3da3d70a;

export const PREPOLL_HOST_A_VA = 0x00959720;

export const PREPOLL_HOST_B_VA = 0x00959d00;

export const PREPOLL_HOST_C_VA = 0x00959670;

export const PREPOLL_HOST_D_VA = 0x0095e7c0;

export const PREPOLL_HOST_E_VA = 0x00921ce0;

export const PREPOLL_HOST_F_VA = 0x00954b40;

export const PREPOLL_HOST_G_VA = 0x00a0f550;

export const PREPOLL_HOST_G_ARG = 0xff000000;

export const PREPOLL_LOG_VA = 0x00a112c0;

export const PREPOLL_LOG_LEVEL = 1;

export const PREPOLL_LOG_MSG_VA = 0x00b7d234;

export const PREPOLL_HOST_H_VA = 0x007e1e70;

export const PREPOLL_STATE4_VALUE = 4;

export const PREPOLL_STATE3_VALUE = 3;

export const PREPOLL_STATE5_VALUE = 5;

export const PREPOLL_ARM_POLL = 0;

export const PREPOLL_ARM_STATE3 = 3;

export const PREPOLL_ARM_STATE5 = 5;

export const PLAYERSCAN_ELEMENT_CTRL_OFS = 0xc;

export const PLAYERSCAN_MANAGER_STORE_OFS = 0x4abd4;

export const PLAYERSCAN_PLAYER_LIST_BEGIN_OFS = 0x1baa8;

export const PLAYERSCAN_PLAYER_LIST_END_OFS = 0x1baac;

export const PLAYERSCAN_VECTOR_THIS_VA = 0x00c57b18;

export const PLAYERSCAN_VECTOR_BEGIN_VA = 0x00c57b20;

export const PLAYERSCAN_VECTOR_END_VA = 0x00c57b24;

export const PLAYERSCAN_VECTOR_LOCK_VA = 0x00c57b2c;

export const PLAYERSCAN_VECTOR_STRIDE = 8;

export const PLAYERSCAN_PLAYER_LIST_STRIDE = 4;

export const PLAYERSCAN_LAST_INDEX_GLOBAL_VA = 0x00bf9444;

export const PLAYERSCAN_RELEASE_CALLBACK_GLOBAL_VA = 0x00c7e814;

export const PLAYERSCAN_MANAGER_GLOBAL_VA = 0x00c7169c;

export const PLAYERSCAN_GAME_GLOBAL_VA = 0x00c71678;

export const PLAYERSCAN_ACCESSOR_VA = 0x00a20240;

export const PLAYERSCAN_SET_CONTROLLER_VA = 0x007a6450;

export const PLAYERSCAN_SET_CONTROLLER_ARG = 1;

export const PLAYERSCAN_MATCH_VCALL_SLOT = 0x3c;

export const PLAYERSCAN_MATCH_VCALL_ARG = 0;

export const PLAYERSCAN_MATCH_SENTINEL = 0xffffffff;

export const PLAYERSCAN_RELEASE_VCALL_SLOT = 0xc;

export const PLAYERSCAN_LOG_LEVEL = 0x10;

export const PLAYERSCAN_LOG_MSG_VA = 0x00b7e6bc;

export const PLAYERSCAN_STATE2_VALUE = 2;

export const A0F550_F0_OFS = 0x0;

export const A0F550_F1_OFS = 0x4;

export const A0F550_F2_OFS = 0x8;

export const A0F550_F3_OFS = 0xc;

export const A0F550_TAIL_OFS = 0x10;

export const A0F550_TAIL_STORE = 0;

export const A0F550_DENOM_BITS = 0x437f0000;

export const A0F550_DENOM_VA = 0x00baaae4;

export const A0F550_SIGNED_TABLE_VA = 0x00bacb00;

export const A0F550_VA = 0x00a0f550;

export const A0F550_RET_VA = 0x00a0f601;

export const A0F550_BODY_BYTES = 0xb1;

export const A0F550_NEXT_VA = 0x00959d00;

export const A959D00_FLAG_OFS = 0x4b288;

export const A959D00_STATE_OFS = 0x8;

export const A959D00_STATE2_VALUE = 2;

export const A959D00_QUEUE_BEGIN_OFS = 0x4b3d8;

export const A959D00_QUEUE_END_OFS = 0x4b3dc;

export const A959D00_GAME_MODE_OFS = 0x26584;

export const A959D00_GAME_26630_OFS = 0x26630;

export const A959D00_EXT_OFS = 0x4b28c;

export const A959D00_EXT_SKIP = 0x11;

export const A959D00_CORE_OFS = 0x4b290;

export const A959D00_F0_OFS = 0x4b294;

export const A959D00_F1_OFS = 0x4b298;

export const A959D00_F2_OFS = 0x4b29c;

export const A959D00_DW_OFS = 0x4b2a0;

export const A959D00_MENU_GLOBAL_VA = 0x00c72a20;

export const A959D00_MENU_ALLOC_SIZE = 0xf930;

export const A959D00_MENU_STORE_CORE_OFS = 0x1c;

export const A959D00_MENU_STORE_F0_OFS = 0x20;

export const A959D00_MENU_STORE_F1_OFS = 0x24;

export const A959D00_MENU_STORE_F2_OFS = 0x28;

export const A959D00_MENU_STORE_DW_OFS = 0x2c;

export const A959D00_MENU_STORE_FLAG_OFS = 0x14;

export const A959D00_MENU_STORE_FLAG_VALUE = 1;

export const A959D00_STATE_AFTER = 1;

export const A959D00_FLAG_CLEAR = 0;

export const A959D00_MANAGER_GLOBAL_VA = 0x00c7169c;

export const A959D00_GAME_GLOBAL_VA = 0x00c71678;

export const A959D00_HOST_90CD10_VA = 0x0090cd10;

export const A959D00_HOST_90A8A0_VA = 0x0090a8a0;

export const A959D00_HOST_907690_VA = 0x00907690;

export const A959D00_HOST_959670_VA = 0x00959670;

export const A959D00_HOST_91C770_VA = 0x0091c770;

export const A959D00_HOST_A0F4C0_VA = 0x00a0f4c0;

export const A959D00_HOST_986450_VA = 0x00986450;

export const A959D00_HOST_987450_VA = 0x00987450;

export const A959D00_HOST_98AA30_VA = 0x0098aa30;

export const A959D00_VA = 0x00959d00;

export const A959D00_RET_VA = 0x00959e66;

export const A959D00_BODY_BYTES = 0x166;

export const A959D00_SITES = 2;

export const A959D00_NEXT_VA = 0x00959720;

export const A959720_FLAG_OFS = 0x4b130;

export const A959720_PROBE_OFS = 0x4b274;

export const A959720_PARITY_OFS = 0x4abbc;

export const A959720_QUEUE_BEGIN_OFS = 0x4b3d8;

export const A959720_QUEUE_END_OFS = 0x4b3dc;

export const A959720_STATE_OFS = 0x8;

export const A959720_STATE_AFTER = 2;

export const A959720_FLAG_4B131_OFS = 0x4b131;

export const A959720_FLAG_4B132_OFS = 0x4b132;

export const A959720_PTR_4B140_OFS = 0x4b140;

export const A959720_DWORD_4B3E4_OFS = 0x4b3e4;

export const A959720_RECV_923450_OFS = 0x21628;

export const A959720_DWORD_4B1C0_OFS = 0x4b1c0;

export const A959720_FLAG_4B19C_OFS = 0x4b19c;

export const A959720_WORD_4B284_OFS = 0x4b284;

export const A959720_WORD_4B284_VALUE = 1;

export const A959720_FLAG_CLEAR = 0;

export const A959720_GAME_ALLOC_SIZE = 0x68e88;

export const A959720_MANAGER_GLOBAL_VA = 0x00c7169c;

export const A959720_GAME_GLOBAL_VA = 0x00c71678;

export const A959720_HOST_90C400_VA = 0x0090c400;

export const A959720_HOST_959670_VA = 0x00959670;

export const A959720_HOST_A0F4C0_VA = 0x00a0f4c0;

export const A959720_HOST_6F1020_VA = 0x006f1020;

export const A959720_HOST_6F4740_VA = 0x006f4740;

export const A959720_HOST_90A8A0_VA = 0x0090a8a0;

export const A959720_HOST_6EEF20_VA = 0x006eef20;

export const A959720_HOST_91C770_VA = 0x0091c770;

export const A959720_HOST_923450_VA = 0x00923450;

export const A959720_HOST_6F6DD0_VA = 0x006f6dd0;

export const A959720_HOST_6F7750_VA = 0x006f7750;

export const A959720_HOST_6F5320_VA = 0x006f5320;

export const A959720_ARM_SEED_THEN = 1;

export const A959720_ARM_HOST_6F5850 = 2;

export const A959720_ARM_SEED_ELSE = 3;

export const A959720_ARM_4B132 = 4;

export const A959720_ARM_DAILY = 5;

export const A959720_ARM_DEBUG = 6;

export const A959720_ARM_START = 7;

export const A959720_VA = 0x00959720;

export const A959720_RET_VA = 0x00959cf8;

export const A959720_BODY_BYTES = 0x5d8;

export const A959720_SITES = 1;

export const A959720_SITE_VA = 0x00954d5e;

export const A959720_NEXT_VA = 0x00959670;

export const C959670_STATE_OFS = 0x8;

export const C959670_STATE_OTHER = 0;

export const C959670_STATE_MENU = 1;

export const C959670_STATE_GAME = 2;

export const C959670_FLAG_4B284_OFS = 0x4b284;

export const C959670_FLAG_4B285_OFS = 0x4b285;

export const C959670_FLAG_4B285_CLEAR = 0;

export const C959670_RECV_OFS = 0x2a324;

export const C959670_VALUE_OFS = 0x2a334;

export const C959670_STEP_OFS = 0x2a338;

export const C959670_VALUE_STORE_BITS = 0x3f800000;

export const C959670_STEP_STORE_BITS = 0x3ba3d70a;

export const C959670_TARGET_VA = 0x00baa454;

export const C959670_GAME_GLOBAL_VA = 0x00c71678;

export const C959670_MENU_GLOBAL_VA = 0x00c72a20;

export const C959670_MENU_FREE_SIZE = 0xf930;

export const C959670_MENU_CLEAR = 0;

export const C959670_HOST_429170_OFS = 0x26614;

export const C959670_HOST_6FA0C0_VA = 0x006fa0c0;

export const C959670_HOST_92E430_VA = 0x0092e430;

export const C959670_HOST_429170_VA = 0x00429170;

export const C959670_HOST_986F30_VA = 0x00986f30;

export const C959670_HOST_AEF15C_VA = 0x00aef15c;

export const C959670_EPILOG_VA = 0x0040e910;

export const C959670_MANAGER_GLOBAL_VA = 0x00c7169c;

export const C959670_VA = 0x00959670;

export const C959670_INT3_VA = 0x0095971c;

export const C959670_BODY_BYTES = 0xac;

export const C959670_FIRST_RET_TRAP_BYTES = 0x688;

export const C959670_SITES = 3;

export const C959670_SITE0_VA = 0x00954d85;

export const C959670_SITE1_VA = 0x00959792;

export const C959670_SITE2_VA = 0x00959da5;

export const C959670_NEXT_VA = 0x0095e7c0;

export const C95E7C0_ID_MAX = 0x1a;

export const C95E7C0_ENTRY_COUNT = 0x1b;

export const C95E7C0_ENTRY_STRIDE = 0x4c;

export const C95E7C0_ENTRIES_OFS = 0x4;

export const C95E7C0_STATE_OFS = 0x0;

export const C95E7C0_QUEUED_OFS = 0x808;

export const C95E7C0_SSO_CAP = 0x10;

export const C95E7C0_ID_SPECIAL = 2;

export const C95E7C0_FLAG_E5_OFS = 0xe5;

export const C95E7C0_VEC_BEGIN_OFS = 0xb8;

export const C95E7C0_VEC_END_OFS = 0xbc;

export const C95E7C0_GAME_1BB88_OFS = 0x1bb88;

export const C95E7C0_QUEUE_BEGIN_OFS = 0x4b3d8;

export const C95E7C0_QUEUE_END_OFS = 0x4b3dc;

export const C95E7C0_QUEUE_HELPER_VA = 0x0095ead0;

export const C95E7C0_RECV_OFS = 0x20dd0;

export const C95E7C0_ARG_OFS = 0x2161c;

export const C95E7C0_MUSIC_INDEX_OFS = 0x29fbc;

export const C95E7C0_MUSIC_STRIDE = 0x184;

export const C95E7C0_MUSIC_VOL_OFS = 0x2a138;

export const C95E7C0_MUSIC_RATE_OFS = 0x2a13c;

export const C95E7C0_MUSIC_RATE_BITS = 0x3da3d70a;

export const C95E7C0_MUSIC_2A2CC_OFS = 0x2a2cc;

export const C95E7C0_STORE_828_OFS = 0x828;

export const C95E7C0_STORE_838_OFS = 0x838;

export const C95E7C0_STORE_838_VALUE = 0xffffffff;

export const C95E7C0_STATE_AFTER = 1;

export const C95E7C0_MANAGER_GLOBAL_VA = 0x00c7169c;

export const C95E7C0_GAME_GLOBAL_VA = 0x00c71678;

export const C95E7C0_HOST_960840_VA = 0x00960840;

export const C95E7C0_HOST_40E910_VA = 0x0040e910;

export const C95E7C0_HOST_A112C0_VA = 0x00a112c0;

export const C95E7C0_HOST_95EAD0_VA = 0x0095ead0;

export const C95E7C0_HOST_91C7E0_VA = 0x0091c7e0;

export const C95E7C0_HOST_8FD750_VA = 0x008fd750;

export const C95E7C0_HOST_4239B0_VA = 0x004239b0;

export const C95E7C0_HOST_6EEF60_VA = 0x006eef60;

export const C95E7C0_VA = 0x0095e7c0;

export const C95E7C0_RET_VA = 0x0095eaa9;

export const C95E7C0_OOB_RET_VA = 0x0095eac2;

export const C95E7C0_INT3_VA = 0x0095eac5;

export const C95E7C0_BODY_BYTES = 0x305;

export const C95E7C0_FIRST_RET_TRAP_BYTES = 0x800;

export const C95E7C0_SITES = 1;

export const C95E7C0_SITE_VA = 0x00954d96;

export const C95E7C0_NEXT_VA = 0x00921ce0;

export const C921CE0_MAP_KEY = 0x4f;

export const C921CE0_MAP_ISNIL_OFS = 0xd;

export const C921CE0_MAP_KEY_OFS = 0x10;

export const C921CE0_MAP_OFS = 0x1bbd8;

export const C921CE0_PLAYERS_BEGIN_OFS = 0x1baa8;

export const C921CE0_PLAYERS_END_OFS = 0x1baac;

export const C921CE0_SSO_CAP = 0x10;

export const C921CE0_STRNCMP_N = 0x16;

export const C921CE0_SPRITE_STRIDE = 0x18;

export const C921CE0_INDEX_OFS = 0x360;

export const C921CE0_TABLE_OFS = 0x14;

export const C921CE0_BASE_OFS = 0x8;

export const C921CE0_DOGMA_OFS = 0x5e8;

export const C921CE0_BOOL_STORE_OFS = 0x368;

export const C921CE0_FLAG_4B1_OFS = 0x4b1;

export const C921CE0_FLAG_4BC_OFS = 0x4bc;

export const C921CE0_FLAG_4BC_CLEAR = 0;

export const C921CE0_FLAG_4BC_SET = 1;

export const C921CE0_MUSIC_ID_NORMAL = 0x60;

export const C921CE0_MUSIC_ID_DOGMA = 0x41;

export const C921CE0_MUSIC_RECV_OFS = 0x29fbc;

export const C921CE0_MUSIC_VOL_OFS = 0x2a354;

export const C921CE0_STAGE_C = 0xc;

export const C921CE0_STAGE_D = 0xd;

export const C921CE0_COLLECTIBLE_ID = 0x236;

export const C921CE0_LAZ_TAG = 1;

export const C921CE0_ANM2_LOAD_GRAPHICS = 1;

export const C921CE0_STORE_3A4_OFS = 0x3a4;

export const C921CE0_STORE_3A4_VALUE = 0x28;

export const C921CE0_LOG_LEVEL = 0x10;

export const C921CE0_LOG_MSG_VA = 0x00b7e6bc;

export const C921CE0_PATH_VA = 0x00b79fa0;

export const C921CE0_IAT_STRNCMP_VA = 0x00b18934;

export const C921CE0_GAME_GLOBAL_VA = 0x00c71678;

export const C921CE0_MANAGER_GLOBAL_VA = 0x00c7169c;

export const C921CE0_RECV_OFS = 0x21628;

export const C921CE0_ARG_OFS = 0x4b2a5;

export const C921CE0_G3_OFS = 0x4b2a4;

export const C921CE0_HOST_A112C0_VA = 0x00a112c0;

export const C921CE0_HOST_4288A0_VA = 0x004288a0;

export const C921CE0_HOST_4074C0_VA = 0x004074c0;

export const C921CE0_HOST_40BD50_VA = 0x0040bd50;

export const C921CE0_HOST_407F10_VA = 0x00407f10;

export const C921CE0_HOST_9BE080_VA = 0x009be080;

export const C921CE0_HOST_7E1D50_VA = 0x007e1d50;

export const C921CE0_HOST_AEF15C_VA = 0x00aef15c;

export const C921CE0_HOST_A0F4C0_VA = 0x00a0f4c0;

export const C921CE0_VA = 0x00921ce0;

export const C921CE0_RET_VA = 0x0092330c;

export const C921CE0_INT3_VA = 0x0092330f;

export const C921CE0_BODY_BYTES = 0x1630;

export const C921CE0_FIRST_RET_TRAP_BYTES = 0x800;

export const C921CE0_SITES = 1;

export const C921CE0_SITE_VA = 0x00954dd0;

export const C921CE0_SIBLING_VA = 0x00923320;

export const C921CE0_NEXT_VA = 0x009be080;

/* ABI v33 -- PlayerManager::FirstCollectibleOwner (0x009be080) islands. */
export const C9BE080_ITEM_CONFIG_OFS = 0x2a404;
export const C9BE080_ITEM_FLAGS_OFS = 0xb8;
export const C9BE080_TWIN_BIT = 0x80000000;
export const C9BE080_LIST_BEGIN_OFS = 0;
export const C9BE080_LIST_END_OFS = 4;
export const C9BE080_LIST_STRIDE = 4;
export const C9BE080_SLOT_FLAG_OFS = 0x2c;
export const C9BE080_TWIN_PTR_OFS = 0x1e6c;
export const C9BE080_LAZ_ARG_OFS = 0x10;
export const C9BE080_MANAGER_GLOBAL_VA = 0x00c7169c;
export const C9BE080_HOST_GET_COLLECTIBLE_VA = 0x0072fd10;
export const C9BE080_HOST_HAS_COLLECTIBLE_VA = 0x007706e0;

export const RCO9BE140_LIST_BEGIN_OFS = 0;
export const RCO9BE140_LIST_END_OFS = 4;
export const RCO9BE140_LIST_STRIDE = 4;
export const RCO9BE140_SLOT_FLAG_OFS = 0x2c;
export const RCO9BE140_COLLECT_BEGIN_OFS = 0x1770;
export const RCO9BE140_COLLECT_END_OFS = 0x1774;
export const RCO9BE140_COLLECT_STRIDE = 0x10;
export const RCO9BE140_SEED_ASSERT_MSG_VA = 0x00b6bf54;
export const RCO9BE140_OOB_ASSERT_MSG_VA = 0x00b62a7c;
export const RCO9BE140_LOG_LEVEL = 0x10;
export const RCO9BE140_ASSERT_TRAP_VA = 0x009be1b1;
export const RCO9BE140_HOST_HAS_COLLECTIBLE_VA = 0x007706e0;
export const RCO9BE140_HOST_LOG_VA = 0x00a112c0;
export const RCO9BE140_GAME_GLOBAL_VA = 0x00c71678;
export const RCO9BE140_RECEIVER_OFS = 0x1baa8;
export const RCO9BE140_RNG_SHIFT_TABLE_VA = 0x00b1f5d0;
export const RCO9BE140_RNG_SHIFT1 = 3;
export const RCO9BE140_RNG_SHIFT2 = 5;
export const RCO9BE140_RNG_SHIFT3 = 20;
export const RCO9BE140_BEST_INIT_BITS = 0xbf800000;
/* Verified PE dword @ 0xba9ff0 = 0x2f7ffffe (2^-32f * (1-2^-21)); the handy
   "2^-32f" spelling 0x2f800000 is NOT what the PE stores. */
export const RCO9BE140_SCALE_BITS = 0x2f7ffffe;
export const RCO9BE140_SIGN_CORR_TABLE_VA = 0x00bacb00;
export const RCO9BE140_VA = 0x009be140;
export const RCO9BE140_FIRST_RET_VA = 0x009be237;
export const RCO9BE140_RET_VA = 0x009be295;
export const RCO9BE140_INT3_VA = 0x009be298;
export const RCO9BE140_BODY_BYTES = 0x158;
export const RCO9BE140_SITES = 17;
export const RCO9BE140_NEXT_VA = 0x009be2a0;

/* ---- ABI v35: address-stable RNG**-variant sibling of RCO @ 0x009be2a0.
   Single documented caller 0x006eca9d (enclosing handler start ~0x006e8ae0,
   no ZHL).  Head: direct index into the Manager player list
   ([0xc7169c]+0x2a410/+0x2a414) with a 15-bit id mask and SIGNED range
   check; then the same twin-aware walk as FCO/RCO against this =
   g_Game+0x1baa8, with host HasCollectible 0x00771550.  Not-found returns
   0 (*out=0); twin hit returns [player+0x1e6c] and stores host
   0x0065cf80 result; player hit clamps id via the sbb/and idiom =
   UNSIGNED min(id, count-1) and stores cbegin + index*16. ---- */
export const A9BE2A0_PLAYERS_BEGIN_OFS = 0x2a410; /* Manager+0x2a410 */
export const A9BE2A0_PLAYERS_END_OFS = 0x2a414;
export const A9BE2A0_LIST_BEGIN_OFS = 0;
export const A9BE2A0_LIST_END_OFS = 4;
export const A9BE2A0_LIST_STRIDE = 4;
export const A9BE2A0_SLOT_FLAG_OFS = 0x2c;
export const A9BE2A0_ITEM_FLAGS_OFS = 0xb8;
export const A9BE2A0_TWIN_BIT = 0x80000000;
export const A9BE2A0_TWIN_PTR_OFS = 0x1e6c;
export const A9BE2A0_COLLECT_BEGIN_OFS = 0x177c;
export const A9BE2A0_COLLECT_END_OFS = 0x1780;
export const A9BE2A0_COLLECT_STRIDE = 0x10;
export const A9BE2A0_ID_MASK = 0x7fff;
export const A9BE2A0_MANAGER_GLOBAL_VA = 0x00c7169c;
export const A9BE2A0_GAME_GLOBAL_VA = 0x00c71678;
export const A9BE2A0_RECEIVER_OFS = 0x1baa8;
export const A9BE2A0_HOST_HAS_COLLECTIBLE_VA = 0x00771550;
export const A9BE2A0_HOST_TWIN_GET_VA = 0x0065cf80;
export const A9BE2A0_HOST_LOG_VA = 0x00a112c0;
export const A9BE2A0_OOB_MSG_VA = 0x00b64a88;
export const A9BE2A0_LOG_LEVEL = 0x10;
export const A9BE2A0_VA = 0x009be2a0;
export const A9BE2A0_FIRST_RET_VA = 0x009be356;
export const A9BE2A0_RET_VA = 0x009be3d8;
export const A9BE2A0_INT3_VA = 0x009be3db;
export const A9BE2A0_BODY_BYTES = 0x13b;
export const A9BE2A0_SITES = 1;
export const A9BE2A0_SITE_VA = 0x006eca9d;
export const A9BE2A0_NEXT_VA = 0x009be3e0; /* RNG-returning RCO sibling */

/* ---- ABI v36: PlayerManager::RandomTrinketOwner (0x009be3e0).  Exact ZHL
   10 B: `__thiscall Entity_Player* PlayerManager::RandomTrinketOwner(
   TrinketType trinketType, unsigned int seed, RNG** returnRNG)`.  Full
   rel32 E8 census = 10 sites (0x5348fc 0x663ada 0x6641b1 0x6bccdc 0x71711d
   0x71716a 0x717969 0x7179bb 0x71d1b4 0x71d53c; this = g_Game + 0x1baa8).
   The v34 RCO walk + xorshift draw (host leaf 0x00771550, NOT 0x7706e0) with
   the v35 collect vector 0x177c/0x1780; the drawn state is stored back to
   the LOCAL arg copy [ebp+0xc] only (never written to the caller).  Tail is
   v35-shaped, NOT v34: id<0 (js 0x009be4c7) only fires the OOB log, there is
   NO fixed-out arm; clamp = UNSIGNED min(id, count-1) via the sbb/and/cmovb
   idiom @ 0x009be4ff..0x009be509; *out = cbegin + index*16 (@ 0x009be511);
   return = best player.  Verified PE dwords (this unit): shifts 3/5/20 @
   0xb1f5d0 (v34-shared table), best init -1.0f @ 0xbaad50, scale 0x2f7ffffe
   @ 0xba9ff0, sign-corr f64 0.0/4294967296.0 @ 0xbacb00, seed msg 0xb6bf54
   "RNG Seed is zero!", OOB msg 0xb64a88 "Trinket ID out of bounds!". ---- */
export const RTO9BE3E0_LIST_BEGIN_OFS = 0;
export const RTO9BE3E0_LIST_END_OFS = 4;
export const RTO9BE3E0_LIST_STRIDE = 4;
export const RTO9BE3E0_SLOT_FLAG_OFS = 0x2c;
export const RTO9BE3E0_COLLECT_BEGIN_OFS = 0x177c;
export const RTO9BE3E0_COLLECT_END_OFS = 0x1780;
export const RTO9BE3E0_COLLECT_STRIDE = 0x10;
export const RTO9BE3E0_SEED_ASSERT_MSG_VA = 0x00b6bf54;
export const RTO9BE3E0_OOB_ASSERT_MSG_VA = 0x00b64a88;
export const RTO9BE3E0_LOG_LEVEL = 0x10;
export const RTO9BE3E0_ASSERT_TRAP_VA = 0x009be451; /* int3 after seed assert */
export const RTO9BE3E0_HOST_HAS_COLLECTIBLE_VA = 0x00771550;
export const RTO9BE3E0_HOST_LOG_VA = 0x00a112c0;
export const RTO9BE3E0_GAME_GLOBAL_VA = 0x00c71678;
export const RTO9BE3E0_RECEIVER_OFS = 0x1baa8;
export const RTO9BE3E0_RNG_SHIFT_TABLE_VA = 0x00b1f5d0;
export const RTO9BE3E0_RNG_SHIFT1 = 3;
export const RTO9BE3E0_RNG_SHIFT2 = 5;
export const RTO9BE3E0_RNG_SHIFT3 = 20;
export const RTO9BE3E0_BEST_INIT_BITS = 0xbf800000;
export const RTO9BE3E0_SCALE_BITS = 0x2f7ffffe;
export const RTO9BE3E0_SIGN_CORR_TABLE_VA = 0x00bacb00;
export const RTO9BE3E0_VA = 0x009be3e0;
export const RTO9BE3E0_FIRST_RET_VA = 0x009be51b; /* best==0/out==0 epilogues */
export const RTO9BE3E0_RET_VA = 0x009be52a;       /* terminal ret 0xc */
export const RTO9BE3E0_INT3_VA = 0x009be52d;
export const RTO9BE3E0_BODY_BYTES = 0x14d;        /* 333; through int3 */
export const RTO9BE3E0_SITES = 10;                /* full rel32 E8 census */
export const RTO9BE3E0_NEXT_VA = 0x009be530;      /* next RCO-family sibling */

/* ---- ABI v37: 0x009be530, address-stable RCO/RTO-family sibling (no exact
   ZHL; 7-site rel32 E8 census 0x506e07 0x50f3ce 0x53bb1d 0x5400f0 0x54101a
   0x54ae57 0x54bce3 — all `add ecx,0x1baa8 / push ecx / call`, this =
   g_Game+0x1baa8; arg2 BY-VALUE seed; arg1 pushed receiver UNUSED in the
   body; ret 8 @ 0x009be62d, single epilogue; int3 trap @ 0x009be5be).
   Same walk + xorshift draw as v36 (state advances in ebx across passing
   candidates, one draw each, never written back) with FOUR candidate gates
   — slot dword [p+0x2c]==0, low byte [p+0x202c]==0, low byte [p+0x20a9]==0,
   SIGNED [p+0x17e0]>=3 — and NO collect/id/out arm at all (arg1 is never
   read; the v37 tail is the RTO draw WITHOUT the collect tail).  Seed==0
   assert runs INSIDE the loop per passing candidate (a112c0(0x10, 0xb6bf54)
   + int3 @ 0x009be5be; the 0x009be5bf reload is dead).  Bound re-read:
   ecx=this @ 0x009be5df feeds `cmp esi,[ecx+4]` every iteration (FULL
   dword).  Return = winner player (0 if none); no *out store.  Constants
   verified this unit: shifts 3/5/20 @ 0xb1f5d0, best init 0xbf800000,
   scale 0x2f7ffffe, sign-corr 0xbacb00, seed msg 0xb6bf54. ---- */
export const A9BE530_LIST_BEGIN_OFS = 0;
export const A9BE530_LIST_END_OFS = 4;
export const A9BE530_LIST_STRIDE = 4;
export const A9BE530_SLOT_FLAG_OFS = 0x2c;
export const A9BE530_FLAG_202C_OFS = 0x202c;
export const A9BE530_FLAG_20A9_OFS = 0x20a9;
export const A9BE530_CHARGE_OFS = 0x17e0;
export const A9BE530_CHARGE_MIN = 3;
export const A9BE530_SEED_ASSERT_MSG_VA = 0x00b6bf54;
export const A9BE530_LOG_LEVEL = 0x10;
export const A9BE530_ASSERT_TRAP_VA = 0x009be5be;   /* int3 after seed assert */
export const A9BE530_HOST_LOG_VA = 0x00a112c0;
export const A9BE530_RNG_SHIFT_TABLE_VA = 0x00b1f5d0;
export const A9BE530_RNG_SHIFT1 = 3;
export const A9BE530_RNG_SHIFT2 = 5;
export const A9BE530_RNG_SHIFT3 = 20;
export const A9BE530_BEST_INIT_BITS = 0xbf800000;
export const A9BE530_SCALE_BITS = 0x2f7ffffe;
export const A9BE530_SIGN_CORR_TABLE_VA = 0x00bacb00;
export const A9BE530_VA = 0x009be530;
export const A9BE530_FIRST_RET_VA = 0x009be62d;     /* single ret (no arms) */
export const A9BE530_RET_VA = 0x009be62d;           /* terminal ret 8 */
export const A9BE530_INT3_VA = 0x009be5be;
export const A9BE530_BODY_BYTES = 0x8e;             /* 142; through int3 */
export const A9BE530_SITES = 7;                     /* full rel32 E8 census */
export const A9BE530_NEXT_VA = 0x009be630;          /* next sibling (23 E8s) */

/* ---- ABI v38: 0x009be630 slot-match sibling (address-stable; NO exact
   ZHL; 23-site census verified this unit; this = g_Game + 0x1baa8; arg1
   BY-VALUE needle slot; ret 4; TWO epilogues 0x009be664 / 0x009be66b;
   int3 pad @ 0x009be66e).  PURE linear search — no xorshift / float /
   seed assert (v37 draw laws do NOT carry over). ---- */
export const A9BE630_LIST_BEGIN_OFS = 0;
export const A9BE630_LIST_END_OFS = 4;
export const A9BE630_LIST_STRIDE = 4;
export const A9BE630_SLOT_FLAG_OFS = 0x2c;          /* dword == 0 gate */
export const A9BE630_FLAG_20A9_OFS = 0x20a9;        /* LOW byte == 0 gate */
export const A9BE630_SLOT_VALUE_OFS = 0x13c0;       /* dword == needle gate */
export const A9BE630_VA = 0x009be630;
export const A9BE630_FIRST_RET_VA = 0x009be664;     /* not-found epilogue */
export const A9BE630_RET_VA = 0x009be66b;           /* terminal ret 4 (found) */
export const A9BE630_INT3_VA = 0x009be66e;          /* int3 pad */
export const A9BE630_BODY_BYTES = 0x3e;             /* 62; through int3 */
export const A9BE630_SITES = 23;                    /* full rel32 E8 census */
export const A9BE630_NEXT_VA = 0x009be670;          /* next sibling (3 E8s) */

/* ---- ABI v39: 0x009be670 address-stable PURE slot-0x19 predicate (no
   exact ZHL; 3-site census verified this unit; this = g_Game + 0x1baa8;
   body NEVER reads arg1; ret 4; TWO epilogues 0x009be6a3 (TRUE) /
   0x009be6a8 (FALSE); int3 pad 0x009be6ab).  PURE predicate: return 0 iff
   a CHECKABLE candidate's slot [p+0x13c0] != 0x19 (IMMEDIATE needle);
   empty list returns 1 (TRUE arm — inverse of v38's not-found 0). ---- */
export const A9BE670_LIST_BEGIN_OFS = 0;
export const A9BE670_LIST_END_OFS = 4;
export const A9BE670_LIST_STRIDE = 4;
export const A9BE670_SLOT_FLAG_OFS = 0x2c;          /* dword == 0 gate */
export const A9BE670_FLAG_20A9_OFS = 0x20a9;        /* LOW byte == 0 gate */
export const A9BE670_SLOT_VALUE_OFS = 0x13c0;       /* dword == 0x19 gate */
export const A9BE670_SLOT_NEEDLE = 0x19;            /* IMMEDIATE needle */
export const A9BE670_VA = 0x009be670;
export const A9BE670_FIRST_RET_VA = 0x009be6a3;     /* TRUE arm */
export const A9BE670_RET_VA = 0x009be6a8;           /* terminal ret 4 (FALSE) */
export const A9BE670_INT3_VA = 0x009be6ab;          /* int3 pad */
export const A9BE670_BODY_BYTES = 0x3b;             /* 59; through int3 */
export const A9BE670_SITES = 3;                     /* full rel32 E8 census */
export const A9BE670_NEXT_VA = 0x009be6b0;          /* next sibling (41 E8s) */

/* ---- ABI v39: 0x009be6b0 address-stable owner/quality player select (no
   exact ZHL; 41-site census verified this unit; caller 0x004e7b7d
   `mov ecx,[0xc71678] / push 0x97 / lea ecx,[ecx+0x1baa8] / call` -> this
   = g_Game + 0x1baa8, arg1 BY-VALUE needle; ret 4; TWO epilogues
   0x009be73c (early accept) / 0x009be747 (winner); int3 pad 0x009be74a).
   NARROWED walk: pure path selection + accept/winner CF AROUND host
   0x7cb6e0 (status; thiscall player, needle-by-value) and 0x7706e0
   (query; cdecl 0x1b7, 0).  Bound RE-READ per iteration (this reloaded
   from the local [esp+0xc] @ 0x009be72b). ---- */
export const A9BE6B0_LIST_BEGIN_OFS = 0;
export const A9BE6B0_LIST_END_OFS = 4;
export const A9BE6B0_LIST_STRIDE = 4;
export const A9BE6B0_FIELD_2EF8_OFS = 0x2ef8;       /* dword owner field */
export const A9BE6B0_FLAG_2EF0_OFS = 0x2ef0;        /* LOW byte flag */
export const A9BE6B0_QUERY_ARG1 = 0x1b7;            /* host 0x7706e0 arg1 */
export const A9BE6B0_QUERY_ARG2 = 0x0;              /* host 0x7706e0 arg2 */
export const A9BE6B0_STATUS_CALL_VA = 0x007cb6e0;   /* host status */
export const A9BE6B0_QUERY_CALL_VA = 0x007706e0;    /* host query */
export const A9BE6B0_VA = 0x009be6b0;
export const A9BE6B0_FIRST_RET_VA = 0x009be73c;     /* early accept */
export const A9BE6B0_RET_VA = 0x009be747;           /* terminal ret 4 (winner) */
export const A9BE6B0_INT3_VA = 0x009be74a;          /* int3 pad */
export const A9BE6B0_BODY_BYTES = 0x9a;             /* 154; through int3 */
export const A9BE6B0_SITES = 41;                    /* full rel32 E8 census */
export const A9BE6B0_NEXT_VA = 0x009be750;          /* next sibling (3 E8s) */

/* ---- ABI v40: 0x009be750 GetNumCollectibles (EXACT ZHL 19 B:
   `__thiscall int PlayerManager::GetNumCollectibles(CollectibleType type);`).
   this = g_Game + 0x1baa8, arg1 = type needle, ret 4.  NARROWED: pure walk +
   twin gate + 32-bit wrap sum around TWO host leaves -- 0x0072fd10
   (ItemConfig::GetCollectible, exact ZHL 13 B -- HUD do-not-reopen) twin-get
   once pre-walk, and 0x00770ca0 (Entity_Player::GetCollectibleNum, exact
   ZHL 16 B) per player + per twin.  flag13 computed once pre-walk:
   twin != 0 && bit31([twin+0xb8]).  Body ret 4 @ 0x009be7e7, int3 pad
   0x009be7ea, 154 B.  3 live rel32 E8 sites. ---- */
export const GNC9BE750_LIST_BEGIN_OFS = 0;          /* players vector begin */
export const GNC9BE750_LIST_END_OFS = 4;            /* players vector end */
export const GNC9BE750_LIST_STRIDE = 4;
export const GNC9BE750_SLOT_FLAG_OFS = 0x2c;        /* dword == 0 gate */
export const GNC9BE750_TWIN_PTR_OFS = 0x1e6c;       /* twin player ptr */
export const GNC9BE750_TWIN_FLAGS_OFS = 0xb8;       /* item flags; bit31 twin */
export const GNC9BE750_TWIN_BIT = 0x80000000;       /* twin tag bit */
export const GNC9BE750_MANAGER_GLOBAL_VA = 0x00c7169c; /* twin container base */
export const GNC9BE750_GAME_GLOBAL_VA = 0x00c71678;    /* g_Game */
export const GNC9BE750_RECEIVER_OFS = 0x1baa8;      /* this = g_Game + 0x1baa8 */
export const GNC9BE750_TWIN_CONTAINER_OFS = 0x2a404;   /* this for host 0x72fd10 */
export const GNC9BE750_HOST_TWIN_GET_VA = 0x0072fd10;  /* ItemConfig::GetCollectible */
export const GNC9BE750_HOST_COUNT_VA = 0x00770ca0;     /* Entity_Player::GetCollectibleNum */
export const GNC9BE750_VA = 0x009be750;
export const GNC9BE750_RET_VA = 0x009be7e7;         /* terminal ret 4 */
export const GNC9BE750_INT3_VA = 0x009be7ea;        /* int3 pad */
export const GNC9BE750_BODY_BYTES = 0x9a;           /* 154; through int3 */
export const GNC9BE750_SITES = 3;                   /* full rel32 E8 census */
export const GNC9BE750_SITE_VA = 0x007f9332;        /* verified caller */
export const GNC9BE750_NEXT_VA = 0x009be7f0;        /* next sibling (2 E8s, PURE) */

/* ---- ABI v41: 0x009be7f0 HasTemporaryEffect (EXACT ZHL 8-B prologue
   pattern `558bec8b11568b71`:
   `__thiscall bool PlayerManager::HasTemporaryEffect(ItemConfig_Item *item);`).
   this = PlayerManager container (g_Game + 0x1baa8 at callers), arg1 = item
   needle, ret 4.  PURE: 0 E8 / 0 stores / 0 indirect.  Per candidate:
   slot dword [p+0x2c]==0 AND byte [p+0x1519]==0, then the temp-effect
   vector [p+0x150c .. p+0x1510) (stride 0x10) scanned for [entry]==needle
   (FULL dword); first hit -> 1.  Empty list -> 0 (needle never read).
   List end CAPTURED ONCE (esi @ 0x009be7f6); vec end captured per
   candidate.  Body ret 4 @ 0x009be841 (found) / 0x009be839 (not-found),
   int3 pad 0x009be844, 84 B.  2 live rel32 E8 sites. ---- */
export const HTE9BE7F0_LIST_BEGIN_OFS = 0;          /* players vector begin */
export const HTE9BE7F0_LIST_END_OFS = 4;            /* players vector end */
export const HTE9BE7F0_LIST_STRIDE = 4;
export const HTE9BE7F0_SLOT_FLAG_OFS = 0x2c;        /* dword == 0 gate */
export const HTE9BE7F0_FLAG1519_OFS = 0x1519;       /* LOW byte == 0 gate */
export const HTE9BE7F0_VEC_BEGIN_OFS = 0x150c;      /* temp-effect vec begin */
export const HTE9BE7F0_VEC_END_OFS = 0x1510;        /* temp-effect vec end */
export const HTE9BE7F0_VEC_STRIDE = 0x10;           /* entry stride 16 */
export const HTE9BE7F0_VA = 0x009be7f0;
export const HTE9BE7F0_FIRST_RET_VA = 0x009be839;   /* first epilogue (not-found) */
export const HTE9BE7F0_RET_VA = 0x009be841;         /* last epilogue (found) */
export const HTE9BE7F0_INT3_VA = 0x009be844;        /* int3 pad */
export const HTE9BE7F0_BODY_BYTES = 0x54;           /* 84; through int3 */
export const HTE9BE7F0_SITES = 2;                   /* full rel32 E8 census */
export const HTE9BE7F0_SITE_VA = 0x006bdcb5;        /* verified caller */
export const HTE9BE7F0_SITE2_VA = 0x007fe7ee;       /* verified caller */
export const HTE9BE7F0_NEXT_VA = 0x009be850;        /* next sibling (2 E8s, NARROWED) */

/* ---- ABI v42: 0x009be850 slot-accumulator walk (NO exact ZHL;
   address-stable a9be850, family precedent a9be530/a9be630/a9be670/
   a9be6b0).  __thiscall ret 4; arg1 = 0x70 pushed by the caller but NEVER
   read in the body (dead arg, class v39 9be670).  this = g_Game+0x1baa8
   (sole caller 0x00772bcf).  NARROWED: 2 host calls to 0x930220 (thiscall
   find-or-append accumulator, ret 0xc) stay host; ALL gates + full arg-
   prep pure.  Outer loop over players [this+0..this+4) stride 4, index
   from 0; count RE-DERIVED per iteration (end/begin re-read @
   0x009be966/96a); UNSIGNED index compare (jb @ 0x009be973).  Host1 gate
   (0x009be88c..896): SIGNED ((vecA_end - vecA_begin) & ~3) > 0x1c0 with
   vecA = [[0xc7169c]+0x2a41c .. +0x2a420], AND slot =
   [vecA_begin+0x1c0] != 0 -> host 0x930220(player+0x1508, &buf16{slot, 0,
   [slot+0x78], 0}, 1, 1).  twin = [player+0x1e6c]; byte [twin+0x1519]==0
   AND [twin+0x150c..+0x1510) non-empty -> scan stride 0x10 for marker
   [entry+0]==0 && [entry+4]==0x70 -> SKIP host2; else host2 gate (same
   predicate, vecA re-read) -> host 0x930220(twin+0x1508, buf16, 1, 1).
   Single ret 4 epilogue (void).  1 live rel32 E8 site (0x00772bcf). ---- */
export const A9BE850_LIST_BEGIN_OFS = 0;            /* players vector begin */
export const A9BE850_LIST_END_OFS = 4;              /* players vector end */
export const A9BE850_LIST_STRIDE = 4;
export const A9BE850_MANAGER_GLOBAL_VA = 0x00c7169c; /* ptr -> vec A obj */
export const A9BE850_VEC_A_BEGIN_OFS = 0x2a41c;     /* vec A begin */
export const A9BE850_VEC_A_END_OFS = 0x2a420;       /* vec A end */
export const A9BE850_VEC_A_SLOT_OFS = 0x1c0;        /* slot = [begin+0x1c0] */
export const A9BE850_HOST_GATE_THRESHOLD = 0x1c0;   /* SIGNED > 0x1c0 */
export const A9BE850_HOST_GATE_MASK = 0xfffffffc;   /* & ~3 */
export const A9BE850_SLOT_FIELD_OFS = 0x78;         /* buf16[2] = [slot+0x78] */
export const A9BE850_HOST_RECEIVER_OFS = 0x1508;    /* host this = X+0x1508 */
export const A9BE850_TWIN_FIELD_OFS = 0x1e6c;       /* twin = [player+0x1e6c] */
export const A9BE850_FLAG1519_OFS = 0x1519;         /* byte gate */
export const A9BE850_TWIN_VEC_BEGIN_OFS = 0x150c;   /* twin marker vec begin */
export const A9BE850_TWIN_VEC_END_OFS = 0x1510;     /* twin marker vec end */
export const A9BE850_TWIN_VEC_STRIDE = 0x10;        /* marker stride 16 */
export const A9BE850_MARKER_FIELD0_VALUE = 0;       /* [entry+0] == 0 */
export const A9BE850_MARKER_FIELD4_VALUE = 0x70;    /* [entry+4] == 0x70 */
export const A9BE850_HOST_VA = 0x00930220;          /* host accumulator */
export const A9BE850_HOST_ARG2 = 1;                 /* arg2 pushed imm */
export const A9BE850_HOST_ARG3 = 1;                 /* arg3 pushed imm */
export const A9BE850_GAME_GLOBAL_VA = 0x00c71678;   /* caller receiver base */
export const A9BE850_RECEIVER_OFS = 0x1baa8;        /* this = g_Game+0x1baa8 */
export const A9BE850_CALLER_ARG1 = 0x70;            /* pushed; DEAD */
export const A9BE850_VA = 0x009be850;
export const A9BE850_RET_VA = 0x009be97f;           /* single epilogue ret 4 */
export const A9BE850_INT3_VA = 0x009be982;          /* int3 pad */
export const A9BE850_BODY_BYTES = 0x132;            /* 306; through int3 */
export const A9BE850_SITES = 1;                     /* full rel32 E8 census */
export const A9BE850_SITE_VA = 0x00772bcf;          /* verified caller */
export const A9BE850_NEXT_VA = 0x009be990;          /* next sibling (0 E8s, PURE) */

/* ---- ABI v43: 0x009be990 PURE bool scan (NO exact ZHL; address-stable
   a9be990, family precedent a9be530/a9be630/a9be670/a9be6b0/a9be850).
   __thiscall ret 0; NO stack args.  this = g_Game+0x1baa8 at BOTH live
   callers (0x004531b6 / 0x0049118a).  PURE-complete: 0 E8 / 0 indirect /
   0 mem-stores.  FOUND al=1 (ret 0x009be9bd) / NOT-FOUND al=0 (ret
   0x009be9ba); consumers test only AL.  Walk players [this+0..this+4)
   stride 4 with begin/end BOTH captured ONCE at entry (end NEVER re-read
   per iteration — differs from a9be850 re-derive; matches 9be630/9be670).
   Per player: code = [player+0x3fc] FULL dword; test/je ==0 advance;
   cmp/jne !=3 advance; else FOUND al=1.  Loop-exhausted / empty -> al=0.
   2-site full rel32 E8 census (0x004531b6, 0x0049118a). ---- */
export const A9BE990_LIST_BEGIN_OFS = 0;            /* players vector begin */
export const A9BE990_LIST_END_OFS = 4;              /* players vector end */
export const A9BE990_LIST_STRIDE = 4;               /* slot dword */
export const A9BE990_SLOT_FIELD_OFS = 0x3fc;        /* code = [p+0x3fc] */
export const A9BE990_SKIP_CODE_ZERO = 0;            /* test/je advance */
export const A9BE990_SKIP_CODE_THREE = 3;           /* cmp/jne-not-taken */
export const A9BE990_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const A9BE990_RECEIVER_OFS = 0x1baa8;        /* this = g_Game+0x1baa8 */
export const A9BE990_VA = 0x009be990;
export const A9BE990_FIRST_RET_VA = 0x009be9ba;     /* NOT-FOUND epilogue */
export const A9BE990_RET_VA = 0x009be9bd;           /* FOUND epilogue */
export const A9BE990_INT3_VA = 0x009be9be;          /* int3 pad */
export const A9BE990_BODY_BYTES = 0x2e;             /* 46; through int3 */
export const A9BE990_SITES = 2;                     /* full rel32 E8 census */
export const A9BE990_SITE_VA = 0x004531b6;          /* verified caller */
export const A9BE990_SITE2_VA = 0x0049118a;         /* verified caller */
export const A9BE990_NEXT_VA = 0x009be9c0;          /* next sibling (0 E8s, PURE) */

/* ---- ABI v44: 0x009be9c0 PURE bool scan (NO exact ZHL; address-stable
   a9be9c0, family precedent a9be530/a9be630/a9be670/a9be6b0/a9be850/
   a9be990).  __thiscall ret 0; NO stack args.  this = g_Game+0x1baa8 at
   the SOLE live caller 0x006c83b3 (receiver via getter 0x00417860 =
   `lea eax,[ecx+0x1baa8]; ret`: `mov ecx,[0xc71678] / call 0x417860 /
   mov ecx,eax / call 0x9be9c0 / test al,al / jne 0x6c8453`).  PURE-
   complete: 0 E8 / 0 indirect / 0 mem-stores.  FOUND al=1 (ret
   0x009bea00) / NOT-FOUND al=0 (ret 0x009be9fd); sole consumer tests
   only AL.  Walk players [this+0..this+4) stride 4 with begin/end BOTH
   captured ONCE at entry (end NEVER re-read per iteration — matches
   a9be990).  Per player: byte [player+0x20a9] != 0 -> ADVANCE; code =
   [player+0x184] FULL dword; test/je ==0 FOUND; cmp/je ==3 FOUND;
   cmp/je ==1 FOUND; cmp/je ==2 FOUND (i.e. FOUND iff code in {0,1,2,3};
   test order 0,3,1,2 irrelevant); else ADVANCE.  Loop-exhausted / empty
   -> al=0.  1-site full rel32 E8 census (0x006c83b3). ---- */
export const A9BE9C0_LIST_BEGIN_OFS = 0;            /* players vector begin */
export const A9BE9C0_LIST_END_OFS = 4;              /* players vector end */
export const A9BE9C0_LIST_STRIDE = 4;               /* slot dword */
export const A9BE9C0_FLAG20A9_OFS = 0x20a9;         /* byte gate [p+0x20a9] */
export const A9BE9C0_FIELD184_OFS = 0x184;          /* code = [p+0x184] */
export const A9BE9C0_FOUND_CODE_ZERO = 0;           /* test/je FOUND */
export const A9BE9C0_FOUND_CODE_ONE = 1;            /* cmp/je FOUND */
export const A9BE9C0_FOUND_CODE_TWO = 2;            /* cmp/je FOUND */
export const A9BE9C0_FOUND_CODE_THREE = 3;          /* cmp/je FOUND */
export const A9BE9C0_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const A9BE9C0_RECEIVER_OFS = 0x1baa8;        /* this = g_Game+0x1baa8 */
export const A9BE9C0_RECEIVER_GETTER_VA = 0x00417860; /* lea eax,[ecx+0x1baa8] */
export const A9BE9C0_VA = 0x009be9c0;
export const A9BE9C0_FIRST_RET_VA = 0x009be9fd;     /* NOT-FOUND epilogue */
export const A9BE9C0_RET_VA = 0x009bea00;           /* FOUND epilogue */
export const A9BE9C0_INT3_VA = 0x009bea01;          /* int3 pad */
export const A9BE9C0_BODY_BYTES = 0x41;             /* 65; through int3 */
export const A9BE9C0_SITES = 1;                     /* full rel32 E8 census */
export const A9BE9C0_SITE_VA = 0x006c83b3;          /* verified caller */
export const A9BE9C0_NEXT_VA = 0x009bea10;          /* next sibling (0 E8s, 1 store) */

/* ---- ABI v45: 0x009bea40 PURE f32-sum walk (NO exact ZHL; address-stable
   a9bea40, family precedent a9be530..a9be9c0).  NOTE: the v44-recorded
   next frontier 0x009bea10 was landed by the game-update-slice family
   (ABI v50 (a) `player_flag_410_broadcast`, event `opaque_call_009bea10`);
   its NARROWED write-loop body is NOT re-opened here — this is the first
   body after that int3 pad.  __thiscall ret 0; NO stack args.  this =
   g_Game+0x1baa8 at the 3 live rel32 callers 0x0065ab45 / 0x006c8fdd /
   0x007fb912 (first two via getter 0x00417860 = `lea eax,[ecx+0x1baa8];
   ret`; third `lea ecx,[esi+0x1baa8]` with esi = g_Game).  PURE-complete:
   0 E8 / 0 indirect / 0 mem-stores.  Returns f32 in xmm0 (single epilogue
   ret 0x009bea70; consumers cvttss2si / mulss).  Walk players
   [this+0..this+4) stride 4 with begin/end BOTH captured ONCE at entry
   (end NEVER re-read per iteration — matches a9be990/a9be9c0).
   Per player: FULL dword [player+0x2c]==0 AND byte [player+0x20a9]==0 ->
   sum = addss(sum, f32 [player+0x156c]) (f32 round-to-nearest-even per
   add; NaN propagates); else ADVANCE.  Empty list (cmp/je @ 0x009bea4a)
   -> ret +0.0f, loop never runs (sum untouched).  Loop-exhausted -> ret
   sum.  3-site full rel32 E8 census (0x0065ab45, 0x006c8fdd, 0x007fb912).
   ---- */
export const A9BEA40_LIST_BEGIN_OFS = 0;            /* players vector begin */
export const A9BEA40_LIST_END_OFS = 4;              /* players vector end */
export const A9BEA40_LIST_STRIDE = 4;               /* slot dword */
export const A9BEA40_SLOT_FLAG_OFS = 0x2c;          /* FULL dword gate [p+0x2c] */
export const A9BEA40_FLAG20A9_OFS = 0x20a9;         /* byte gate [p+0x20a9] */
export const A9BEA40_FIELD156C_OFS = 0x156c;        /* f32 addend [p+0x156c] */
export const A9BEA40_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const A9BEA40_RECEIVER_OFS = 0x1baa8;        /* this = g_Game+0x1baa8 */
export const A9BEA40_RECEIVER_GETTER_VA = 0x00417860; /* lea eax,[ecx+0x1baa8] */
export const A9BEA40_VA = 0x009bea40;
export const A9BEA40_FIRST_RET_VA = 0x009bea70;     /* single epilogue ret */
export const A9BEA40_RET_VA = 0x009bea70;           /* single epilogue ret */
export const A9BEA40_INT3_VA = 0x009bea71;          /* int3 pad */
export const A9BEA40_BODY_BYTES = 0x31;             /* 49; through int3 */
export const A9BEA40_SITES = 3;                     /* full rel32 E8 census */
export const A9BEA40_SITE0_VA = 0x0065ab45;         /* verified caller */
export const A9BEA40_SITE1_VA = 0x006c8fdd;         /* verified caller */
export const A9BEA40_SITE2_VA = 0x007fb912;         /* verified caller */
export const A9BEA40_NEXT_VA = 0x009bea80;          /* next sibling (2 E8s, LIVE; landed ABI v46) */

/* ---- ABI v46: 0x009bea80 GetTrinketMultiplier (EXACT ZHL 18 B:
   `__thiscall int PlayerManager::GetTrinketMultiplier(int TrinketID);`).
   NARROWED: pure slot-flag gates + walk + 32-bit wrap sum around TWO host
   calls to 0x007cb6e0 (HUD-family count resolver ABI v19; typed host
   event — body outside this family).  this = g_Game+0x1baa8, arg1 =
   TrinketID BY VALUE (raw, unmasked), ret 4 @ 0x009beb27 (single
   epilogue; int3 pad 0x009beb2a).  g = [0xc7169c]; slotArray =
   [g+0x2a410..+0x2a414); idm = id & 0x7fff; count = SAR32(end-begin,2);
   flag (=1 iff SIGNED idm < count && slotArray[idm] != 0 && bit31
   [slot+0xb8]) computed ONCE pre-walk (byte [esp+0x13]); walk players
   [this+0..this+4) stride 4; per player FULL dword [p+0x2c]==0 -> HOST1
   0x7cb6e0(p, RAW id), sum += eax; flag LOW byte != 0 AND [p+0x1e6c] != 0
   -> HOST2 0x7cb6e0(twin, RAW id), sum += eax; END RE-READ per iteration
   (this reloaded from local [esp+0x14] @ 0x009beb13 — matches
   9be6b0/9be750, differs from a9bea40/9be9c0/9be990).  Empty -> 0.
   Return sum: SIGNED int32 consumer (cvtdq2ps @ 0x007fb90f).  3 mem-
   stores ALL [esp+N] locals; zero observable stores.  43-site full rel32
   E8 census (verified; representative callers 0x005ce064 / 0x007fb900 /
   0x00816757).  ---- */
export const GTM9BEA80_LIST_BEGIN_OFS = 0;          /* players vector begin */
export const GTM9BEA80_LIST_END_OFS = 4;            /* players vector end */
export const GTM9BEA80_LIST_STRIDE = 4;             /* slot dword */
export const GTM9BEA80_SLOT_FLAG_OFS = 0x2c;        /* FULL dword gate [p+0x2c] */
export const GTM9BEA80_TWIN_PTR_OFS = 0x1e6c;      /* twin = [p+0x1e6c] */
export const GTM9BEA80_SLOT_ARRAY_BEGIN_OFS = 0x2a410; /* [g]+0x2a410 */
export const GTM9BEA80_SLOT_ARRAY_END_OFS = 0x2a414;   /* [g]+0x2a414 */
export const GTM9BEA80_ID_MASK = 0x7fff;           /* 15-bit trinket id */
export const GTM9BEA80_TWIN_FLAGS_OFS = 0xb8;      /* flags = [slot+0xb8] */
export const GTM9BEA80_TWIN_FLAG_BIT = 0x80000000; /* bit31 test */
export const GTM9BEA80_MANAGER_GLOBAL_VA = 0x00c7169c; /* ptr -> slot array */
export const GTM9BEA80_GAME_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const GTM9BEA80_RECEIVER_OFS = 0x1baa8;     /* this = g_Game+0x1baa8 */
export const GTM9BEA80_HOST_STATUS_VA = 0x007cb6e0; /* host status x2 */
export const GTM9BEA80_VA = 0x009bea80;
export const GTM9BEA80_FIRST_RET_VA = 0x009beb27;  /* single epilogue ret 4 */
export const GTM9BEA80_RET_VA = 0x009beb27;        /* single epilogue ret 4 */
export const GTM9BEA80_INT3_VA = 0x009beb2a;       /* int3 pad */
export const GTM9BEA80_BODY_BYTES = 0xaa;          /* 170; through int3 */
export const GTM9BEA80_SITES = 43;                 /* full rel32 E8 census */
export const GTM9BEA80_NEXT_VA = 0x009beb30;       /* next sibling (landed ABI v47) */

/* ---- ABI v47: 0x009beb30 all/any instant-death-curse walk (NO exact
   ZHL; address-stable prefix A9BEB30 — family precedent a9be530/a9be630/
   a9be670/a9be6b0/a9be850/a9be990/a9be9c0/a9bea40).  NARROWED: pure
   walk + byte/full-word gates + 32-bit wrap charge arithmetic + AND/OR
   byte combine around ONE host leaf 0x007db6b0 (`Entity_Player::
   HasInstantDeathCurse`, EXACT ZHL 14 B, PURE body 36 insns 0 E8/0
   indirect/0 stores — typed host event this unit per ONE-BODY mandate;
   candidate for a future pure peel).  0 indirect; 0 mem-stores.  this =
   g_Game+0x1baa8 (all 3 rel32 callers `lea ecx,[..+0x1baa8]`); arg1 =
   uint32 mode BY VALUE (LOW byte only, mov bh,byte [ebp+8]); return =
   byte in al (consumers test al,al -> BOOL).  bh=arg&0xff seeds bl
   (mov bl,bh); begin=[this+0], end=[this+4] BOTH captured ONCE (end
   NEVER re-read — matches a9bea40/9be9c0/9be990, DIFFERS from
   9bea80/9be6b0/9be750 re-read); begin==end -> ret arg&0xff ECHO.
   Per candidate (FULL dword [p+0x2c]==0 AND byte [p+0x20a9]==0):
   a = [p+0x134c]+[p+0x1344] (wrap); SIGNED a >= [p+0x1340]
   (cmp/jge @ 0x009beb61..67) -> al=1 WITHOUT host; else HOST
   0x7db6b0(player) (thiscall, no stack args) -> al=(host!=0); COMBINE
   (0x009beb74..8c): mode!=0 -> AND bl=(bl!=0&&al!=0)?1:0; mode==0 ->
   OR bl=(bl!=0||al!=0)?1:0 (bl/al LOW bytes).  iter+=4 (wrap);
   next != end (captured ONCE) -> loop.  Loop-exhausted -> ret bl
   (mov al,bl @ 0x009beb97; byte result, may be arg&0xff echo when no
   candidate processed).  3-site rel32 census (verified; all pinned).
   ---- */
export const A9BEB30_LIST_BEGIN_OFS = 0;           /* players vector begin */
export const A9BEB30_LIST_END_OFS = 4;             /* players vector end */
export const A9BEB30_LIST_STRIDE = 4;              /* slot dword */
export const A9BEB30_SLOT_FLAG_OFS = 0x2c;         /* FULL dword gate [p+0x2c] */
export const A9BEB30_FLAG20A9_OFS = 0x20a9;        /* byte gate [p+0x20a9] */
export const A9BEB30_CHARGE_OFS = 0x134c;          /* a = [p+0x134c] */
export const A9BEB30_CHARGE_ADDEND_OFS = 0x1344;   /* a += [p+0x1344] */
export const A9BEB30_CHARGE_MAX_OFS = 0x1340;      /* SIGNED a >= [p+0x1340] */
export const A9BEB30_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const A9BEB30_RECEIVER_OFS = 0x1baa8;       /* this = g_Game+0x1baa8 */
export const A9BEB30_HOST_CURSE_VA = 0x007db6b0;   /* host HasInstantDeathCurse */
export const A9BEB30_VA = 0x009beb30;
export const A9BEB30_FIRST_RET_VA = 0x009beb9b;    /* single epilogue ret 4 */
export const A9BEB30_RET_VA = 0x009beb9b;          /* single epilogue ret 4 */
export const A9BEB30_INT3_VA = 0x009beb9e;         /* int3 pad */
export const A9BEB30_BODY_BYTES = 0x6e;            /* 110; through int3 */
export const A9BEB30_SITES = 3;                    /* full rel32 E8 census */
export const A9BEB30_SITE0_VA = 0x0073ada9;        /* verified caller */
export const A9BEB30_SITE1_VA = 0x0073bd21;        /* verified caller */
export const A9BEB30_SITE2_VA = 0x00748819;        /* verified caller */
export const A9BEB30_NEXT_VA = 0x009beba0;         /* next sibling (landed ABI v48) */
export const A9BEBA0_LIST_BEGIN_OFS = 0;           /* players vector begin */
export const A9BEBA0_LIST_END_OFS = 4;             /* players vector end */
export const A9BEBA0_LIST_STRIDE = 4;              /* slot dword */
export const A9BEBA0_SECOND_LIST_BEGIN_OFS = 0xd0; /* second walk list begin */
export const A9BEBA0_SECOND_LIST_END_OFS = 0xd4;   /* second walk list end */
export const A9BEBA0_SLOT_FLAG_OFS = 0x2c;         /* FULL dword gate [p+0x2c] */
export const A9BEBA0_WATCH_OFS = 0x13c0;           /* FULL dword [p+0x13c0] vs 0x23 */
export const A9BEBA0_WATCH_VALUE = 0x23;           /* 35: watch type blocks */
export const A9BEBA0_FLAG20A9_OFS = 0x20a9;        /* LOW byte gate [p+0x20a9] */
export const A9BEBA0_LOOKUP_KEY_OFS = 0x1618;      /* gobj scan key */
export const A9BEBA0_LOOKUP_TAG_OFS = 0xc;         /* gobj item tag */
export const A9BEBA0_POS_X_OFS = 0x33c;            /* f32 x */
export const A9BEBA0_POS_Y_OFS = 0x340;            /* f32 y */
export const A9BEBA0_PRED_OBJ_OFS = 0x370;         /* predicate object ptr */
export const A9BEBA0_PRED_SLOT_OFS = 0x14;         /* vtable slot [[o]+0x14] */
export const A9BEBA0_GOBJ_TS_OFS = 0x4abbc;        /* gobj timestamp field */
export const A9BEBA0_GOBJ_LIST_BEGIN_OFS = 0x4b3d8; /* gobj scan list begin */
export const A9BEBA0_GOBJ_LIST_END_OFS = 0x4b3dc;  /* gobj scan list end */
export const A9BEBA0_CACHE_TS_VA = 0x00c5c4d4;     /* timestamp cache */
export const A9BEBA0_CACHE_X_VA = 0x00c9436c;      /* cached f32 x (past
                                                     .data raw end -> 0 at load) */
export const A9BEBA0_CACHE_Y_VA = 0x00c94370;      /* cached f32 y (same) */
export const A9BEBA0_GOBJ_GLOBAL_VA = 0x00c7169c;  /* gobj global pointer */
export const A9BEBA0_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game (caller base) */
export const A9BEBA0_RECEIVER_OFS = 0x1baa8;       /* this = g_Game+0x1baa8 */
export const A9BEBA0_ASSERT_VA = 0x00a112c0;       /* host assert routine */
export const A9BEBA0_ASSERT_MSG_VA = 0x00b7e6bc;   /* "Gamestate corrupted..." */
export const A9BEBA0_ASSERT_CODE = 0x10;           /* 16 = assert code */
export const A9BEBA0_VA = 0x009beba0;
export const A9BEBA0_FIRST_RET_VA = 0x009bebe9;    /* fast epilogue ret 8 */
export const A9BEBA0_RET_VA = 0x009bee74;          /* main epilogue ret 8 */
export const A9BEBA0_INT3_VA = 0x009bee77;         /* int3 pad */
export const A9BEBA0_BODY_BYTES = 0x2d7;           /* 727; through int3 */
export const A9BEBA0_SITES = 9;                    /* full rel32 E8 census */
export const A9BEBA0_SITE0_VA = 0x004ac128;        /* verified caller */
export const A9BEBA0_SITE1_VA = 0x00800524;        /* verified caller */
export const A9BEBA0_SITE2_VA = 0x00943032;        /* verified caller */
export const A9BEBA0_SITE3_VA = 0x00943850;        /* verified caller */
export const A9BEBA0_SITE4_VA = 0x00943a4d;        /* verified caller */
export const A9BEBA0_SITE5_VA = 0x00943e6d;        /* verified caller */
export const A9BEBA0_SITE6_VA = 0x009446fd;        /* verified caller */
export const A9BEBA0_SITE7_VA = 0x009940a5;        /* verified caller */
export const A9BEBA0_SITE8_VA = 0x009940fc;        /* verified caller */
export const A9BEBA0_NEXT_VA = 0x009bee80;         /* 0x009bee80 HOST-classified
                                                      ABI v49 (MSVC EH entity
                                                      swap/relink, no pure
                                                      surface); next law unit
                                                      was 0x009bfa70 (landed
                                                      ABI v49) */

/* ---- ABI v49: 0x009bfa70 PURE bool-walk counter (address-stable
   a9bfa70, family precedent a9be990/a9be9c0 PURE bool scans).  this =
   g_Game + 0x1baa8 (players vector); NO stack args; ret plain.  Count
   of slots p where [p+0x2c]==0 && [p+0x3bc]==0 && (link==0 ||
   linkIdx==-1 || SIGNED(linkIdx) >= SIGNED(ownIdx) || link==p) &&
   byte[p+0x20a9]!=0 (link = [p+0x1e68], linkIdx = [link+0x161c],
   ownIdx = [p+0x161c]).  begin/end captured ONCE (begin re-read from
   a local each iteration).  Byte gate: [p+0x20a9] LOW byte only. */
export const A9BFA70_LIST_BEGIN_OFS = 0;           /* players vector begin */
export const A9BFA70_LIST_END_OFS = 4;             /* players vector end */
export const A9BFA70_LIST_STRIDE = 4;              /* slot dword */
export const A9BFA70_SLOT_FLAG_OFS = 0x2c;         /* FULL dword [p+0x2c] */
export const A9BFA70_STATE_OFS = 0x3bc;            /* FULL dword [p+0x3bc] */
export const A9BFA70_LINK_OFS = 0x1e68;            /* link ptr [p+0x1e68] */
export const A9BFA70_INDEX_OFS = 0x161c;           /* index field */
export const A9BFA70_FLAG20A9_OFS = 0x20a9;        /* LOW byte flag */
export const A9BFA70_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game */
export const A9BFA70_RECEIVER_OFS = 0x1baa8;       /* this = g_Game+0x1baa8 */
export const A9BFA70_VA = 0x009bfa70;
export const A9BFA70_FIRST_RET_VA = 0x009bfadd;    /* single ret */
export const A9BFA70_RET_VA = 0x009bfadd;          /* ret plain */
export const A9BFA70_INT3_VA = 0x009bfade;         /* int3 pad */
export const A9BFA70_BODY_BYTES = 0x70;            /* 112; through int3 */
export const A9BFA70_SITES = 4;                    /* full rel32 E8 census */
export const A9BFA70_SITE0_VA = 0x006622bf;        /* verified caller */
export const A9BFA70_SITE1_VA = 0x0066233d;        /* verified caller */
export const A9BFA70_SITE2_VA = 0x008ef9c2;        /* verified caller */
export const A9BFA70_SITE3_VA = 0x008efe49;        /* verified caller */
export const A9BFA70_NEXT_VA = 0x009bfae0;         /* next sibling (claimed
                                                      lane: game-update greed
                                                      helper FUN_009bfae0) */

/* ---- ABI v50: 0x009ba980 PURE bit-0x10 getter (PlayerManager::
   CoopBabiesOnly, EXACT ZHL 14 B).  7 insns / 2 rets; PURE (0 E8 /
   0 indirect / 0 stores).  static bool — body IGNORES ecx; reads
   g_Game [0xc71678] + 0x26548 (challenge bitset, bit 4 = Coop
   Babies).  `mov eax,[g]; mov eax,[eax+0x26548]; and eax,0x10;
   or eax,0; je false; mov al,1; ret; xor al,al; ret`.  3 rel32 E8
   sites (inside unclaimed HOST 0x9bac40), all `test al,al` after
   the call.  Mask gate: FULL dword & 0x10 (byte-gate law takes
   uint32_t; WIDE drives prove the mask). */
export const CBO9BA980_BITSET_OFS = 0x26548;       /* Game+0x26548 bitset */
export const CBO9BA980_BITSET_MASK = 0x10;         /* bit 4 = Coop Babies */
export const CBO9BA980_MANAGER_GLOBAL_VA = 0x00c71678; /* g_Game */
export const CBO9BA980_VA = 0x009ba980;
export const CBO9BA980_FIRST_RET_VA = 0x009ba995;  /* true-arm ret */
export const CBO9BA980_RET_VA = 0x009ba998;        /* false-arm ret */
export const CBO9BA980_INT3_VA = 0x009ba999;       /* int3 pad */
export const CBO9BA980_BODY_BYTES = 0x19;          /* 25; through int3 */
export const CBO9BA980_SITES = 3;                  /* full rel32 E8 census */
export const CBO9BA980_SITE0_VA = 0x009bae7e;      /* in 0x9bac40 (HOST) */
export const CBO9BA980_SITE1_VA = 0x009bb081;      /* in 0x9bac40 (HOST) */
export const CBO9BA980_SITE2_VA = 0x009bb288;      /* in 0x9bac40 (HOST) */
export const CBO9BA980_NEXT_VA = 0x009ba9a0;       /* SEH EH sibling (HOST) */

/* ---- ABI v52: 0x009c6110 pure out-state decision island (band
   0x9c6000..0x9c7000 residual below the GameState edge 0x9c7000;
   W32-F14 residual census).  0 E8 / 0 indirect / 1 out-param store.
   ZERO direct rel32 callers — address-taken ONLY at 0x009c60c4
   (`push 0x9c6110`, callback arg to the host walk 0x00a51c60 owned by
   the 0x009c60a0 picker body).  Both gates FULL-DWORD (zero uint8_t,
   zero byte masks). ---- */
export const A9C6110_VA = 0x009c6110;
export const A9C6110_FIRST_RET_VA = 0x009c612e;  /* SINGLE ret (both arms) */
export const A9C6110_RET_VA = 0x009c612e;
export const A9C6110_INT3_VA = 0x009c612f;       /* first int3 pad byte */
export const A9C6110_BODY_BYTES = 0x1f;          /* 31; through int3 pad */
export const A9C6110_SITES = 0;                  /* direct E8 census: ZERO */
export const A9C6110_POINTER_REF_VA = 0x009c60c4;   /* push imm address-take */
export const A9C6110_HOST_WALK_VA = 0x00a51c60;      /* host walk (E8 @0x9c60d1) */
export const A9C6110_WALK_OWNER_VA = 0x009c60a0;     /* callback-picker body */
export const A9C6110_STATE_OFS = 0;              /* out-param dword (arg2+0) */
export const A9C6110_FIELD8_OFS = 8;             /* in-param dword (arg1+8) */
export const A9C6110_MATCH_STATE = 1;            /* cmp [ecx],1 FULL-DWORD */
export const A9C6110_VALUE_TWO = 2;              /* field8 != 0 arm */
export const A9C6110_VALUE_FOUR = 4;             /* field8 == 0 arm */
export const A9C6110_NEXT_VA = 0x009c6130;       /* SEH ctor (HOST) */

export const C9BE080_VA = 0x009be080;
export const C9BE080_FIRST_RET_VA = 0x009be11d;
export const C9BE080_RET_VA = 0x009be137;
export const C9BE080_INT3_VA = 0x009be13a;
export const C9BE080_BODY_BYTES = 0xb8;
export const C9BE080_SITES = 175;
export const C9BE080_SITE_VA = 0x009220a8;
export const C9BE080_SITE2_VA = 0x0092225f;
export const C9BE080_NEXT_VA = 0x009be140;

export function inputMapNodePresent(isnil0d, key10, actionId) {

  if((isnil0d & 0xff) != 0) {

  return false;

  }

  if(key10 > actionId) {

  return false;

  }

  return true;

}

/* v109 dedupe: inputMask6f9400Gate39 removed (owned by render-shell;
   see the INPUT_MASK_6F9400_HOST_VA comment above). */

export function inputMaskCombine(maskA, maskB, mgrOr) {

  return asU32(~maskB) & (maskA | mgrOr);

}

export function inputDeviceRangeContains(controlleridx, start, count) {

  if (asU32(controlleridx) < asU32(start)) {

  return false;

  }

  let end = asU32(asU32(start) + asU32(count));

  if (asU32(controlleridx) < asU32(end)) {

  return true;

  }

  return false;

}

export function managerGate6f9730(game26598, game1ba78, game1d520, game25954, game1d654) {

  if(peComissZeroBelowOrUnordered(game26598) != 0) {

  return false;

  }

  if(game1ba78 != 0) {

  return false;

  }

  if(game1d520 != 0) {

  return false;

  }

  if((game25954 & 0xff) != 0) {

  return false;

  }

  if(game1d654 != 0) {

  return false;

  }

  return true;

}

export function managerUpdateEarlySkip(counter4abbc, flag2a3c0, flag4abc4, flag4abc5) {

  if(peSignedMod2Eq1Int(counter4abbc) == 0) {

  return MANAGER_EARLY_CONTINUE;

  }

  if((flag2a3c0 & 0xff) != 0) {

  return MANAGER_EARLY_CONTINUE;

  }

  if((flag4abc4 & 0xff) != 0 && (flag4abc5 & 0xff) == 0) {

  return MANAGER_EARLY_RETURN_SILENT;

  }

  return MANAGER_EARLY_RETURN_INC;

}

export function managerEarlyCounterNext(counter4abbc) {

  return asI32(asU32(counter4abbc) + 1);

}

export function managerFloatApproach(current, target, step) {
  current = Math.fround(current);
  target = Math.fround(target);
  step = Math.fround(step);
  if (managerApproachUsesAddPath(current, target) != 0) {
    const next = Math.fround(current + step);
    return !(next > target) ? next : target;
  }
  const next = Math.fround(current - step);
  return !(target > next) ? next : target;
}

export function managerPollPrefixNeeded(param1) {

  return(param1 & 0xff) != 0 ? true : false;

}

export function managerPollPlatformUsesA69f60(flagC73680) {

  return !!(flagC73680 == 0);

}

export function managerPollA6de60BodyNeeded(enabledC7e300, reenterC9ba98) {

  if((enabledC7e300 & 0xff) == 0) {

  return false;

  }

  if((reenterC9ba98 & 0xff) != 0) {

  return false;

  }

  return true;

}

export function managerPollA6de60VectorCount(endC79bf0, beginC79bec) {

  let diff =

  asI32(asU32(endC79bf0) -

  asU32(beginC79bec));

  return diff >>  2;

}

export function managerPollA6de60LoopNeeded(vectorCount) {

  return !!(vectorCount != 0);

}

export function managerPollA6de60DeviceEnabled(flagByte) {

  return(flagByte & 0xff) != 0 ? true : false;

}

export function managerPollA6de60QueryOk(status) {

  return !!(status == 0);

}

export function managerPollA6de60ButtonEdge(newBit, oldBit, pressCbNz, releaseCbNz) {

  let n = nonzeroU8(newBit);

  let o = nonzeroU8(oldBit);

  if(n == o) {

  return A6DE60_EDGE_NONE;

  }

  if(n != 0) {

  return nonzeroU8(pressCbNz) != 0 ? A6DE60_EDGE_PRESS

  : A6DE60_EDGE_SILENT;

  }

  return nonzeroU8(releaseCbNz) != 0 ? A6DE60_EDGE_RELEASE

  : A6DE60_EDGE_SILENT;

}

export function managerPollA6de60AxisNormalizeI16(raw) {

  let word = asI32(

  (asU32(raw) << 16) >>  16);

  let eax = word + asI32(0x8000);

  let f = Math.fround(eax);

  f = Math.fround(f / 65535.0);

  f = Math.fround(f + f);

  f = Math.fround(f - 1.0);

  return f;

}

export function managerPollA6de60AxisNormalizeU8(raw) {

  let f = Math.fround(raw & 0xff);

  f = Math.fround(f / 127.5);

  f = Math.fround(f - 1.0);

  return f;

}

export function managerPollA6de60FloatChanged(newV, oldV) {

  return(newV == oldV) ? false : true;

}

export function managerPollA6de60FloatCallbackNeeded(newV, oldV, cbNz) {

  if(managerPollA6de60FloatChanged(newV, oldV) == 0) {

  return false;

  }

  return !!(nonzeroU8(cbNz) != 0);

}

export function managerPollA6de60DierrReacquire(hresult) {

  let lost = asU32(A6DE60_DIERR_INPUTLOST);

  let notacq =

  asU32(A6DE60_DIERR_NOTACQUIRED);

  if(hresult == lost || hresult == notacq) {

  return true;

  }

  return false;

}

export function managerPollA6de60IndexContinue(index, count) {

  const next = asU32(asU32(index) + 1);

  return asU32(next) < asU32(count);

}

export function managerPollA6de60AxisTypeDispatch(type) {

  if(type > asU32(A6DE60_AXIS_TYPE_MAX)) {

  return A6DE60_AXIS_DISPATCH_OOR;

  }

  if((type & 3) != 0) {

  return A6DE60_AXIS_DISPATCH_DEFAULT;

  }

  return asI32(type / 4);

}

export function managerPollA6de60DeviceContinue(deviceIndex, endC79bf0, beginC79bec) {

  const next = asU32(asU32(deviceIndex) + 1);

  const recount = managerPollA6de60VectorCount(endC79bf0, beginC79bec);

  return asU32(next) < asU32(recount);

}

export function managerPollA6de60QueryUsesHook(hookFnC7e29c) {

  return !!(hookFnC7e29c != 0);

}

export function managerPollA6de60QpcFreqInitNeeded(freqLoC9ba90, freqHiC9ba94) {

  return(freqLoC9ba90 | freqHiC9ba94) == 0 ? true : false;

}

export function managerPollA6de60U64ToF64(lo, hi) {

  let lo_part = (+asI32(lo));

  if((lo >>  31) != 0) {

  lo_part += 4294967296.0;

  }

  let hi_part =

  (+asI32(hi)) * 4294967296.0;

  return lo_part + hi_part;

}

export function managerPollA6de60QpcSecondsF64(counterLo, counterHi, freqLo, freqHi) {

  let counter =

  managerPollA6de60U64ToF64(counterLo, counterHi);

  let freq = managerPollA6de60U64ToF64(freqLo, freqHi);

  let ratio = counter / freq;

  let as_f32 = Math.fround(ratio);

  return(+as_f32);

}

export function managerPollA6de60ComSucceeded(hresult) {

  return asI32(hresult) >= 0;

}

export function managerPollA6de60BufferedMode(flag18) {

  return(flag18 & 0xff) != 0 ? true : false;

}

export function managerPollA6de60DidodAllocSize(count) {

  const prod = asU32(count) * asU32(A6DE60_DIDOD_STRIDE);

  if (prod > 0xffffffff) {

    return asU32(0xffffffff);

  }

  return asU32(prod);

}

export function managerPollA6de60TimestampToSecondsF64(timestamp) {

  let d = (+asI32(timestamp));

  if((timestamp >>  31) != 0) {

  d += 4294967296.0;

  }

  return d / 1000.0;

}

export function managerPollA6de60NonzeroBit(value) {

  return value != 0 ? 1 : 0;

}

export function managerPollA6de60PovAxis0(pov) {

  if((pov & 0xffff) ==

  asU32(A6DE60_POV_CENTER_LO16)) {

  return Math.fround(0.0);

  }

  if(pov == 0 || pov == asU32(A6DE60_POV_SOUTH)) {

  return 0.0;

  }

  if(pov < asU32(A6DE60_POV_SOUTH)) {

  return 1.0;

  }

  return -1.0;

}

export function managerPollA6de60PovAxis1(pov) {

  if((pov & 0xffff) ==

  asU32(A6DE60_POV_CENTER_LO16)) {

  return Math.fround(0.0);

  }

  if(pov > asU32(A6DE60_POV_WEST)) {

  return -1.0;

  }

  if(pov < asU32(A6DE60_POV_EAST)) {

  return -1.0;

  }

  if(pov == asU32(A6DE60_POV_EAST)) {

  return 0.0;

  }

  if(pov < asU32(A6DE60_POV_WEST)) {

  return 1.0;

  }

  return 0.0;

}

export function managerPollA6de60HookRepackDw0(srcU164, srcU86, srcU87) {

  return asU32((srcU164 & 0xffff) | ((srcU86 & 0xff) << 16) | ((srcU87 & 0xff) << 24));

}

export function managerPollA6de60HookRepackDw1(srcU168, srcU16A) {

  return asU32((srcU168 & 0xffff) | ((srcU16A & 0xffff) << 16));

}

export function managerPollA6de60HookRepackDw2(srcU16C, srcU16E) {

  return asU32((srcU16C & 0xffff) | ((srcU16E & 0xffff) << 16));

}

export function managerPollA6de60DidodOfsMatch(eventOfs, mappedOfs) {

  return !!(eventOfs == mappedOfs);

}

export function managerPollA6de60AxisMapIsPov(typeByte4) {

  return(typeByte4 & 0xff) != 0 ? true : false;

}

export function managerPollA6de60QueryFailClearValue() {

  return 0;

}

export function managerPollA6da10IndexAfterRemove(index) {

  return asI32(asU32(index) - 1);

}

export function managerPollA6da10DisconnectCbNeeded(cbC78d7c) {

  return !!(cbC78d7c != 0);

}

export function managerPollA6da10FreeComMaps(enableByte) {

  return(enableByte & 0xff) == 0 ? true : false;

}

export function managerPollA6da10RemoveMoveBytes(endC79bf0, beginC79bec, index) {

  let slot =

  beginC79bec + asU32(index * 4);

  let next = slot + 4;

  return asU32(endC79bf0 - next);

}

export function managerPollA6da10EndAfterRemove(endC79bf0) {

  return asU32(endC79bf0 - 4);

}

export function managerPollA648b0Mode(cl) {

  let v = cl & 0xff;

  if(v == 0) {

  return A648B0_MODE_ALLOC;

  }

  if(v == 1) {

  return A648B0_MODE_FREE;

  }

  if(v == 2) {

  return A648B0_MODE_ACCOUNT;

  }

  return A648B0_MODE_NOP;

}

export function managerPollA648b0AllocMallocSize(sizeLo, sizeHi) {

  let lo = sizeLo;

  if(sizeHi != 0) {

  lo = 0;

  }

  return asU32(lo + 4);

}

export function managerPollA1fc00LockObjPresent(lockPtr) {

  return !!(lockPtr != 0);

}

export function managerPollA1fc00QueueLoopNeeded(begin8, endC) {

  return !!(begin8 != endC);

}

export function managerPollA1fc00QueueCount(endC, begin8) {

  let diff =

  asI32(asU32(endC) -

  asU32(begin8));

  return diff >>  3;

}

export function managerPollA1fc00EntryAlreadyActive(flagsByte8) {

  return((flagsByte8 & 0xff) & 1) != 0 ? true : false;

}

export function managerPollA1fc00EntryMarkActive(flagsWord8) {

  return((flagsWord8 & 0xffff & 0xffff) | 1);

}

export function managerPollA1fc00SlotTableUsable(countC799f4) {

  return !!(countC799f4 != 0);

}

export function managerPollA1fc00SlotIsFree(keyDword) {

  return !!(keyDword == 0);

}

export function managerPollA1fc00SlotIndexContinue(index, count) {

  const next = asU32(asU32(index) + 1);

  return asU32(next) < asU32(count);

}

export function managerPollA1fc00SlotFindFree(keys, count) {

  if(count == 0) {

  return asU32(A1FC00_SLOT_FULL);

  }

  if(keys == null) {

  return asU32(A1FC00_SLOT_FULL);

  }

  for(let i = 0; i < count; i++) {

  if(keys[i] == 0) {

  return i;

  }

  }

  return asU32(A1FC00_SLOT_FULL);

}

export function managerPollA1fc00QueueEndAfterErase(endC) {

  return asU32(endC - asU32(A1FC00_QUEUE_STRIDE));

}

export function managerPollA1fc00IterAdvance(iter) {

  return asU32(iter + asU32(A1FC00_QUEUE_STRIDE));

}

export function managerPollA1fc00IterContinue(iter, endC) {

  return !!(iter != endC);

}

export function managerPollA1fc00PendingNeedsGrow(end, capacityEnd) {

  return !!(end == capacityEnd);

}

export function managerPollA1fc00PendingEndAfterPush(end) {

  return asU32(end + asU32(A1FC00_QUEUE_STRIDE));

}

export function managerPollA1fc00PendingCapacityBytes(capEnd, begin) {

  let raw = capEnd - begin;

  return asU32(raw & 0xfffffff8);

}

export function managerPollA1fc00FreeUsesHeapHeader(size) {

  return !!(size >= asU32(A1FC00_FREE_HEADER_THRESHOLD));

}

export function managerPollA1fc00FreeHeaderSize(size) {

  return asU32(size + asU32(A1FC00_FREE_HEADER_ADD));

}

export function managerPollA1fc00FreeHeaderOffsetOk(begin, header) {

  const off = asU32(asU32(asU32(begin) - asU32(header)) - 4);

  return off <= asU32(A1FC00_FREE_HEADER_OFFSET_MAX);

}

export function managerPollA1fc00NotifyCbNeeded(cbC7e814) {

  return !!(cbC7e814 != 0);

}

export function managerPollA1f280BufferBytes(end14, begin10) {

  let diff =

  asI32(asU32(end14) -

  asU32(begin10));

  let count = diff >>  4;

  return asI32(asU32(count) << 2);

}

export function managerPollA1f280AxisDir(value, threshold) {

  if(value != value || threshold != threshold) {

  return 0;

  }

  let neg_thr = -threshold;

  if(value < neg_thr) {

  return A1F280_DIR_NEG_X;

  }

  if(value > threshold) {

  return A1F280_DIR_POS_X;

  }

  return 0;

}

export function managerPollA1f280AxisPairBits(x, y, threshold, bitBase) {

  let dx = managerPollA1f280AxisDir(x, threshold);

  let dy = managerPollA1f280AxisDir(y, threshold);

  let nibble =

  asU32(dx) | (asU32(dy) << 2);

  return asU32(nibble << (bitBase & 31));

}

export function managerPollA1f280BufferCount(end14, begin10) {

  let diff =

  asI32(asU32(end14) -

  asU32(begin10));

  return diff >>  4;

}

export function managerPollA1eed0DeadzoneRemap(value, threshold) {

  if(value != value || threshold != threshold) {

  return Math.fround(0.0);

  }

  let neg_thr = -threshold;

  if(neg_thr > value) {

  return Math.fround(Math.fround(value + threshold) / Math.fround(1.0 - threshold));

  }

  if(value > threshold) {

  return Math.fround(Math.fround(value - threshold) / Math.fround(1.0 - threshold));

  }

  return Math.fround(0.0);

}

export function managerPollA1f280AxisNegPart(value) {

  if(value != value) {

  return Math.fround(0.0);

  }

  if(0.0 > value) {

  return -value;

  }

  return 0.0;

}

export function managerPollA1f280AxisPosPart(value) {

  return Math.fround(a1f280Maxss(value, 0.0));

}

export function managerPollA1f280ActionModeIdle(modeCc) {

  return !!(modeCc == asU32(A1F280_ACTION_MODE_IDLE));

}

export function managerPollA1f280ActionIdValid(actionId) {

  return !!(actionId != -1);

}

export function managerPollA1f280BufferIndexInRange(index, bufferCount) {

  return !!(index < asU32(bufferCount));

}

export function managerPollA1f280BufferSlotOffset(modeCc, index) {

  let scaled = modeCc + (index * 4);

  return asU32(scaled * 4);

}

export function managerPollA1f280RumblePathNeeded(flagsByte8) {

  return((flagsByte8 & 0xff) &

  asU32(A1F280_RUMBLE_SUPPRESS_FLAG)) == 0

  ? true : false;

}

export function managerPollA1f280TimerPositive(timer) {

  if(timer != timer) {

  return false;

  }

  return !!(timer > 0.0);

}

export function managerPollA1f280TimerClampNonneg(timer) {

  return Math.fround(peComissZeroBelowOrUnordered(timer) != 0 ? timer : 0.0);

}

export function managerPollA68490NsF64(counterF64, freqF64) {

  return(counterF64 / freqF64) * 1000000000.0;

}

export function managerPollA1f280ScaleTickLo(seedLo, seedHi) {

  return asU32(a1f280ScaleTickU64(seedLo, seedHi));

}

export function managerPollA1f280ScaleTickHi(seedLo, seedHi) {

  return asU32(a1f280ScaleTickU64(seedLo, seedHi) >> 32n);

}

export function managerPollA1f280TickDeltaLo(scaledLo, scaledHi, baseLo, baseHi) {

  let delta =

  a1f280U64(scaledLo, scaledHi) - a1f280U64(baseLo, baseHi);

  return asU32(delta);

}

export function managerPollA1f280TickDeltaHi(scaledLo, scaledHi, baseLo, baseHi) {

  const delta = a1f280U64(scaledLo, scaledHi) - a1f280U64(baseLo, baseHi);

  return asU32(delta >> 32n);

}

export function managerPollA1f280TickDeltaNonzero(deltaLo, deltaHi) {

  return(deltaLo | deltaHi) != 0 ? true : false;

}

export function managerPollA1f280TickDeltaSecondsF32(deltaF64) {
  const as_f32 = Math.fround(deltaF64);
  return Math.fround(as_f32 * Math.fround(0.001));
}

export function managerPollA1f280TimerSubDelta(timer, deltaSec) {

  return Math.fround(timer - deltaSec);

}

export function managerPollA1f280RumbleIntensityActive(timer) {

  if(timer != timer) {

  return true;

  }

  return !!(0.0 < timer);

}

export function managerPollA1f280RumbleVcallTimer(timer) {

  if(managerPollA1f280RumbleIntensityActive(timer) != 0) {

  return Math.fround(timer);

  }

  return 0.0;

}

export function managerPollA1f280RumbleVcallIntensity(timer, savedIntensity) {

  if(managerPollA1f280RumbleIntensityActive(timer) != 0) {

  return Math.fround(savedIntensity);

  }

  return 0.0;

}

export function managerPollA1f280RumbleTimerAfterGate(timer) {

  return Math.fround(managerPollA1f280RumbleVcallTimer(timer));

}

export function managerPollA1f280RumbleNegTimerPath(timer) {

  if(timer != timer) {

  return false;

  }

  return !!(0.0 > timer);

}

export function managerPollA1f280SuccessReturn() {

  return asI32(A1F280_SUCCESS_AL);

}

export function managerPollA1f280RumbleVtblSlot() {

  return asU32(A1F280_VTBL_RUMBLE);

}

export function a112c0ReenterSkip(stateC7de48) {

  return !!(stateC7de48 == A112C0_STATE_INIT);

}

export function a112c0SinkActive(sinkPtrC79bd8, sinkMaskC79bdc, level) {

  if(sinkPtrC79bd8 == 0) {

  return false;

  }

  if((sinkMaskC79bdc & level) == 0) {

  return false;

  }

  return true;

}

export function a112c0BodyNeeded(stateC7de48, sinkPtrC79bd8, sinkMaskC79bdc, level) {

  if(a112c0ReenterSkip(stateC7de48) != 0) {

  return false;

  }

  if((level & 0xff) != 0) {

  return true;

  }

  return a112c0SinkActive(sinkPtrC79bd8, sinkMaskC79bdc, level);

}

export function a112c0InitNeeded(stateC7de48) {

  return !!(stateC7de48 == A112C0_STATE_IDLE);

}

export function a112c0StateAfterInit(initOkAl) {

  return(initOkAl & 0xff) != 0 ? A112C0_STATE_READY

  : A112C0_STATE_IDLE;

}

export function a112c0PrefixEnabled(flagC33911) {

  return(flagC33911 & 0xff) != 0 ? true : false;

}

const kA112c0PrefixCase = [0, 1, 5, 2, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 4];

const kA112c0PrefixVa = [

  A112C0_PREFIX_VA_INFO,

  A112C0_PREFIX_VA_NET,

  A112C0_PREFIX_VA_WARN,

  A112C0_PREFIX_VA_ERROR,

  A112C0_PREFIX_VA_ASSERT,

  A112C0_PREFIX_VA_EMPTY,

];

export function a112c0PrefixVa(level) {

  const idx = asU32(asU32(level) - 1);

  let case_id = 5;

  if (idx <= 0xf) {

    case_id = kA112c0PrefixCase[idx];

  }

  if (case_id >= 6) {

    case_id = 5;

  }

  return asU32(kA112c0PrefixVa[case_id]);

}

export function a112c0OdsNeeded(level) {

  return(level & 0xff) != 0 ? true : false;

}

export function a112c0SinkWriteNeeded(sinkPtrC79bd8, sinkMaskC79bdc, level) {

  return a112c0SinkActive(sinkPtrC79bd8, sinkMaskC79bdc, level);

}

export function a112c0BufRemaining(prefixLen) {

  return asU32(asU32(A112C0_BUF_CAP) - asU32(prefixLen));

}

export function a112c0TrailNewline(lastChar) {

  return(lastChar & 0xff) == 0x0a ? true : false;

}

export function a112c0HostVa() {

  return asU32(A112C0_HOST_VA);

}

export function a112c0FmtVa() {

  return asU32(A112C0_FMT_VA);

}

export function a112c0BufCap() {

  return asU32(A112C0_BUF_CAP);

}

export function a112c0LevelAssert() {

  return asU32(A112C0_LEVEL_ASSERT);

}

export function a112c0MsgVaInvalidMutex() {

  return asU32(A112C0_MSG_VA_INVALID_MUTEX);

}

export function a112c0MsgVaActionIdOor() {

  return asU32(A112C0_MSG_VA_ACTION_ID_OOR);

}

export function managerPollA1f280ActionIdOorLogNeeded(index, bufferCount) {

  return managerPollA1f280BufferIndexInRange(index, bufferCount) ==

  0

  ? true : false;

}

export function managerPollA1f280ActionQueryVcallNeeded(modeCc) {

  return !!(managerPollA1f280ActionModeIdle(modeCc) == 0);

}

export function managerPollA1f280ActionQueryVcallArg() {

  return asI32(A1F280_ACTION_QUERY_ARG);

}

export function managerPollA1f280ActionQueryVtblSlot() {

  return asU32(A1F280_VTBL_ACTION_QUERY);

}

export function managerPollA1f280ActionQueryCallVa() {

  return asU32(A1F280_ACTION_QUERY_CALL_VA);

}

export function managerPollA1f280ActionIndexAfterPush() {

  return asU32(A1F280_ACTION_INDEX_CLEARED);

}

export function managerPollA1f280ActionModeAfterPush() {

  return asU32(A1F280_ACTION_MODE_AFTER_PUSH);

}

export function managerPollA1f280FillVcallOk(al) {

  return(al & 0xff) != 0 ? true : false;

}

export function managerPollA1f280FillPair1Arg() {

  return asI32(A1F280_FILL_PAIR1_ARG);

}

export function managerPollA1f280FillPair0Arg() {

  return asI32(A1F280_FILL_PAIR0_ARG);

}

export function managerPollA1f280FillVtblSlot() {

  return asU32(A1F280_VTBL_FILL);

}

export function managerPollA1f280FillCallVa() {

  return asU32(A1F280_FILL_PAIR1_CALL_VA);

}

export function managerPollA1f280FillPair0CallVa() {

  return asU32(A1F280_FILL_PAIR0_CALL_VA);

}

export function managerPollA1f280AxisFillVtblSlot() {

  return asU32(A1F280_VTBL_AXIS_FILL);

}

export function managerPollA1f280FillAxisStoreBasePair1() {

  return asU32(A1F280_OFF_AXIS_PAIR1);

}

export function managerPollA1f280FillDirBitBasePair1() {

  return asU32(A1F280_DIR_BIT_BASE_PAIR1);

}

export function managerPollA1f280AxisFillCallVa() {

  return asU32(A1F280_AXIS_FILL_PAIR1_CALL_VA);

}

export function managerPollA1f280AxisFillPair0CallVa() {

  return asU32(A1F280_AXIS_FILL_PAIR0_CALL_VA);

}

export function managerPollA1eed0AxisFillCallVa() {

  return asU32(A1EED0_AXIS_FILL_CALL_VA);

}

export function managerPollA1f280AxisFillOutFloatCount() {

  return asU32(A1F280_AXIS_FILL_OUT_FLOAT_COUNT);

}

export function managerPollA1f280AxisFillOutXOfs() {

  return asU32(A1F280_AXIS_FILL_OUT_X_OFS);

}

export function managerPollA1f280AxisFillOutYOfs() {

  return asU32(A1F280_AXIS_FILL_OUT_Y_OFS);

}

export function managerPollA1f280DirThreshOfs() {

  return asU32(A1F280_OFF_DIR_THRESH);

}

export function managerPollA1f280RemapThreshOfs() {

  return asU32(A1F280_OFF_REMAP_THRESH);

}

export function managerPollA1f280DirBitsOfs() {

  return asU32(A1F280_OFF_DIR_BITS);

}

export function managerPollA1f280FillAxisStoreBasePair0() {

  return asU32(A1F280_OFF_AXIS_PAIR0);

}

export function managerPollA1f280FillDirBitBasePair0() {

  return asU32(A1F280_DIR_BIT_BASE_PAIR0);

}

export function managerPollA1f280DirBitsMerge(prior, x, y, threshold, bitBase) {

  let bits =

  managerPollA1f280AxisPairBits(x, y, threshold, bitBase);

  return asU32(prior | bits);

}

export function managerPollA1f280ReadyVcallOk(al) {

  return(al & 0xff) != 0 ? true : false;

}

export function managerPollA1f280ReadyEarlyReturn(al) {

  return !!(managerPollA1f280ReadyVcallOk(al) == 0);

}

export function managerPollA1f280ReadyVtblSlot() {

  return asU32(A1F280_VTBL_READY);

}

export function managerPollA1f280ReadyCallVa() {

  return asU32(A1F280_READY_CALL_VA);

}

export function managerPollA648b0TrackerBase(ctxC7de78) {

  if (asU32(ctxC7de78) === 0) {

    return asU32(A648B0_TRACKER_FALLBACK_VA);

  }

  return asU32(asU32(ctxC7de78) + asU32(A648B0_TRACKER_CTX_OFS));

}

export function managerPollA648b0AccountTarget(ctxC7de78) {

  return asU32(ctxC7de78 + asU32(A648B0_TRACKER_CTX_OFS));

}

export function managerPollA648b0AllocClampNeeded(sizeHi) {

  return !!(sizeHi != 0);

}

export function managerPollA648b0AllocSizeClampedLo(sizeLo, sizeHi) {

  return asU32(managerPollA648b0AllocClampNeeded(sizeHi) != 0 ? 0

  : sizeLo);

}

export function managerPollA648b0AllocMallocSizeHi(sizeLo, sizeHi) {

  const lo = managerPollA648b0AllocSizeClampedLo(sizeLo, sizeHi);

  const sum = asU32(asU32(lo) + 4);

  return asU32(sum < lo ? 1 : 0);

}

export function managerPollA648b0AllocOk(blockPtr) {

  return !!(blockPtr != 0);

}

export function managerPollA648b0AllocHeaderValue(sizeLo, sizeHi) {

  return asU32(managerPollA648b0AllocMallocSize(sizeLo, sizeHi));

}

export function managerPollA648b0AllocPayloadPtr(blockPtr) {

  return asU32(blockPtr + asU32(A648B0_HEADER_BYTES));

}

export function managerPollA648b0AllocReturn(blockPtr) {

  if(managerPollA648b0AllocOk(blockPtr) == 0) {

  return asU32(0);

  }

  return managerPollA648b0AllocPayloadPtr(blockPtr);

}

export function managerPollA648b0FreeNeeded(payloadPtr) {

  return !!(payloadPtr != 0);

}

export function managerPollA648b0FreeBlockPtr(payloadPtr) {

  return asU32(payloadPtr - asU32(A648B0_HEADER_BYTES));

}

export function managerPollA648b0HeaderBytes() {

  return asU32(A648B0_HEADER_BYTES);

}

export function managerPollA648b0OomCode() {

  return asU32(A648B0_OOM_CODE);

}

export function managerPollA648b0OomHostVa() {

  return asU32(A648B0_OOM_HOST_VA);

}

export function managerPollA648b0MallocIatVa() {

  return asU32(A648B0_MALLOC_IAT_VA);

}

export function managerPollA648b0FreeIatVa() {

  return asU32(A648B0_FREE_IAT_VA);

}

export function managerPollA6da10SlotByteOffset(index) {

  return asU32(index * asU32(A6DA10_SLOT_STRIDE));

}

export function managerPollA6da10SlotAddr(beginC79bec, index) {

  return asU32(beginC79bec + managerPollA6da10SlotByteOffset(index));

}

export function managerPollA6da10MemmoveDst(beginC79bec, index) {

  return asU32(managerPollA6da10SlotAddr(beginC79bec, index));

}

export function managerPollA6da10MemmoveSrc(beginC79bec, index) {

  return asU32(managerPollA6da10SlotAddr(beginC79bec, index) +

  asU32(A6DA10_SLOT_STRIDE));

}

export function managerPollA6da10TeardownStepCount(enableByte) {

  return managerPollA6da10FreeComMaps(enableByte) != 0

  ? asI32(A6DA10_TEARDOWN_STEPS_FULL)

  : asI32(A6DA10_TEARDOWN_STEPS_TAIL);

}

export function managerPollA6da10ComReleaseVtblSlot() {

  return asU32(A6DA10_COM_RELEASE_VTBL);

}

export function managerPollA6dd30AxisBaseOfs() {

  return asU32(A6DD30_OFF_AXIS_BASE);

}

export function managerPollA6dd30AxisSlotOffset(index) {

  return asU32(index * 4);

}

export function managerPollA6dd30AxisSlotOffsetY(index) {

  return asU32(managerPollA6dd30IndexAfterX(index) * 4);

}

export function managerPollA6dd30IndexAfterX(index) {

  return asU32(index + 1);

}

export function managerPollA6dd30CbNeeded(newV, oldV, cbC78d70) {

  if(managerPollA6de60FloatChanged(newV, oldV) == 0) {

  return false;

  }

  return !!(cbC78d70 != 0);

}

export function managerPollA6dd30CbFrameBytes() {

  return asU32(A6DD30_CB_FRAME_BYTES);

}

export function managerPollA6dd30CbArgOfs(argId) {

  switch(argId) {

  case A6DD30_CB_ARG_DEVICE:

  return asU32(0x00);

  case A6DD30_CB_ARG_INDEX:

  return 0x04;

  case A6DD30_CB_ARG_NEW:

  return 0x08;

  case A6DD30_CB_ARG_OLD:

  return 0x0c;

  case A6DD30_CB_ARG_TIME:

  return 0x10;

  case A6DD30_CB_ARG_USER:

  return 0x18;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6dab0ScanEnabled(enableC7e300) {

  return(enableC7e300 & 0xff) != 0 ? true : false;

}

export function managerPollA6dab0PumpNeeded(windowC7e2d4) {

  return !!(windowC7e2d4 != 0);

}

export function managerPollA6dab0EnumNeeded(flagC7ac6b) {

  return(flagC7ac6b & 0xff) != 0 ? true : false;

}

export function managerPollA6dab0EnumFlagAfter() {

  return 0;

}

export function managerPollA6dab0SlotScanNeeded(flagC7e301) {

  return(flagC7e301 & 0xff) != 0 ? true : false;

}

export function managerPollA6dab0SlotContinue(slot) {

  const next = asU32(asU32(slot) + 1);

  return asU32(next) < asU32(A6DAB0_SLOT_COUNT);

}

export function managerPollA6dab0SlotTableAddr(slot) {

  return asU32(asU32(A6DAB0_SLOT_TABLE_VA) + asU32(asU32(slot) * 4));

}

export function managerPollA6dab0NameTableAddr(slot) {

  return asU32(asU32(A6DAB0_NAME_TABLE_VA) + asU32(asU32(slot) * 4));

}

export function managerPollA6dab0SlotClearValue() {

  return asU32(0);

}

export function managerPollA6dab0QueryOk(status) {

  return !!(status == 0);

}

export function managerPollA6dab0RecordPresent(recordPtr) {

  return !!(recordPtr != 0);

}

export function managerPollA6dab0ConnectNeeded(status, recordPtr) {

  if(managerPollA6dab0QueryOk(status) == 0) {

  return false;

  }

  return !!(managerPollA6dab0RecordPresent(recordPtr) == 0);

}

export function managerPollA6dab0DisconnectNeeded(status, recordPtr) {

  if(managerPollA6dab0QueryOk(status) != 0) {

  return false;

  }

  return !!(managerPollA6dab0RecordPresent(recordPtr) != 0);

}

export function managerPollA6dab0CapsModeOk(modeC7e304) {

  return !!(modeC7e304 == asU32(A6DAB0_CAPS_MODE_MATCH));

}

export function managerPollA6dab0CapsCallNeeded(modeC7e304, hookC7e2f8) {

  if(managerPollA6dab0CapsModeOk(modeC7e304) == 0) {

  return false;

  }

  return !!(hookC7e2f8 != 0);

}

export function managerPollA6dab0CapsOk(capsStatus) {

  return !!(capsStatus == 0);

}

export function managerPollA6dab0IdWord(raw) {

  return asU32(raw & 0xffff);

}

export function managerPollA6dab0NextDeviceId(counterC7e298) {

  return asU32(counterC7e298 + 1);

}

export function managerPollA6dab0StateEnableValue() {

  return asU32(A6DAB0_STATE_ENABLE_VALUE);

}

export function managerPollA6dab0RecordFieldOfs(fieldId) {

  switch(fieldId) {

  case A6DAB0_REC_ID:

  return asU32(0x00);

  case A6DAB0_REC_NAME:

  return 0x04;

  case A6DAB0_REC_ENABLED:

  return 0x08;

  case A6DAB0_REC_VID:

  return 0x0a;

  case A6DAB0_REC_PID:

  return 0x0c;

  case A6DAB0_REC_AXIS_COUNT:

  return 0x10;

  case A6DAB0_REC_BUTTON_COUNT:

  return 0x14;

  case A6DAB0_REC_AXIS_ARRAY:

  return 0x18;

  case A6DAB0_REC_BUTTON_ARRAY:

  return 0x1c;

  case A6DAB0_REC_STATE:

  return 0x20;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6dab0StateFieldOfs(fieldId) {

  switch(fieldId) {

  case A6DAB0_ST_ENABLE:

  return asU32(0x00);

  case A6DAB0_ST_SLOT:

  return 0x2c;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6dab0PushNeedsGrow(endC79bf0, capacityC79bf4) {

  return !!(endC79bf0 == capacityC79bf4);

}

export function managerPollA6dab0EndAfterPush(endC79bf0) {

  return asU32(endC79bf0 + 4);

}

export function managerPollA6dab0ConnectCbNeeded(cbC75da8) {

  return !!(cbC75da8 != 0);

}

export function managerPollA6dab0SearchLoopNeeded(count) {

  return !!(count != 0);

}

export function managerPollA6dab0SearchIndexContinue(index, count) {

  const next = asU32(asU32(index) + 1);

  return asU32(next) < asU32(count);

}

export function managerPollA6dab0VectorFind(entries, count, targetId) {

  if(entries == null || count == 0) {

  return asU32(A6DAB0_SEARCH_NOT_FOUND);

  }

  for(let i = 0; i < count; i++) {

  if(entries[i] == targetId) {

  return i;

  }

  }

  return asU32(A6DAB0_SEARCH_NOT_FOUND);

}

export function managerPollA6dab0SlotCount() {

  return asU32(A6DAB0_SLOT_COUNT);

}

export function managerPollA6dab0EnumVtblSlot() {

  return asU32(A6DAB0_ENUM_VTBL);

}

export function managerPollA6dab0EnumCallbackVa() {

  return asU32(A6DAB0_ENUM_CALLBACK_VA);

}

export function managerPollA6dab0MsgVaEnumFail() {

  return asU32(A6DAB0_MSG_VA_ENUM_FAIL);

}

export function managerPollA6dab0MsgVaConnect() {

  return asU32(A6DAB0_MSG_VA_CONNECT);

}

export function managerPollA6dab0MsgVaCapsFail() {

  return asU32(A6DAB0_MSG_VA_CAPS_FAIL);

}

export function managerPollA220c0ThreadRun(flagsC57b1c) {

  return((flagsC57b1c & 0xff) &

  asU32(A220C0_RUN_BIT)) != 0

  ? true : false;

}

export function managerPollA220c0ThreadContinue(flagsC57b1c) {

  return managerPollA220c0ThreadRun(flagsC57b1c);

}

export function managerPollA220c0SpawnNeeded(flagsC57b1c) {

  return !!(managerPollA220c0ThreadRun(flagsC57b1c) == 0);

}

export function managerPollA220c0FlagAfterStart(flagsC57b1c) {

  return asU32(flagsC57b1c | asU32(A220C0_RUN_BIT));

}

export function managerPollA220c0FlagAfterStop(flagsC57b1c) {

  return asU32(flagsC57b1c & ~asU32(A220C0_RUN_BIT));

}

export function managerPollA220c0ScanIterations(runSeq, n) {

  if(runSeq == null || n == 0) {

  return asU32(0);

  }

  let scans = 0;

  for(let i = 0; i < n; i++) {

  if(managerPollA220c0ThreadRun(runSeq[i]) == 0) {

  break;

  }

  scans++;

  }

  return scans;

}

export function managerPollA220c0SleepMs() {

  return asU32(A220C0_SLEEP_MS);

}

export function managerPollA220c0ThreadProcVa() {

  return asU32(A220C0_THREAD_PROC_VA);

}

export function managerPollA220c0SpawnVtblSlot() {

  return asU32(A220C0_SPAWN_VTBL);

}

export function managerPollA6cf80InitSkip(enableC7e300) {

  return(enableC7e300 & 0xff) != 0 ? true : false;

}

export function managerPollA6cf80ProbeNameVa(probe) {

  switch(probe) {

  case 0:

  return asU32(0x00ba1750);

  case 1:

  return 0x00ba1760;

  case 2:

  return 0x00ba1974;

  case 3:

  return 0x00ba18f4;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6cf80ModeForProbe(probe) {

  if(probe == 0 || probe == 1) {

  return asU32(A6CF80_MODE_MODERN);

  }

  if(probe == 2 || probe == 3) {

  return asU32(A6CF80_MODE_LEGACY);

  }

  return asU32(A6CF80_MODE_NONE);

}

export function managerPollA6cf80SelectProbe(loaded, n) {

  if(loaded == null || n == 0) {

  return asU32(A6CF80_PROBE_NOT_FOUND);

  }

  for(let i = 0; i < n; i++) {

  if(loaded[i] != 0) {

  return i;

  }

  }

  return asU32(A6CF80_PROBE_NOT_FOUND);

}

export function managerPollA6cf80ModeAfterProbes(loaded, n) {

  let probe = managerPollA6cf80SelectProbe(loaded, n);

  if(probe == asU32(A6CF80_PROBE_NOT_FOUND)) {

  return asU32(A6CF80_MODE_NONE);

  }

  return managerPollA6cf80ModeForProbe(asI32(probe));

}

export function managerPollA6cf80LogLevelForMode(mode) {

  if(mode == asU32(A6CF80_MODE_MODERN)) {

  return asU32(A112C0_LEVEL_INFO);

  }

  if(mode == asU32(A6CF80_MODE_LEGACY)) {

  return asU32(A112C0_LEVEL_WARN);

  }

  return asU32(A112C0_LEVEL_ERROR);

}

export function managerPollA6cf80LogMsgVaForMode(mode) {

  if(mode == asU32(A6CF80_MODE_MODERN)) {

  return asU32(0x00ba1960);

  }

  if(mode == asU32(A6CF80_MODE_LEGACY)) {

  return 0x00ba1908;

  }

  return 0x00ba19b0;

}

export function managerPollA6cf80ScanFlagAfter(mode) {

  return asU32(mode != asU32(A6CF80_MODE_NONE) ? 1 : 0);

}

export function managerPollA6cf80CapsHookProbeNeeded(mode) {

  return !!(mode == asU32(A6CF80_MODE_MODERN));

}

export function managerPollA6cf80HookSlotTargetVa(slot) {

  switch(slot) {

  case A6CF80_HOOK_ORD_PRIMARY:

  return asU32(0x00c7e29c);

  case A6CF80_HOOK_GET_STATE:

  return 0x00c7e2dc;

  case A6CF80_HOOK_SET_STATE:

  return 0x00c7e2f0;

  case A6CF80_HOOK_GET_CAPS:

  return 0x00c7e2f4;

  case A6CF80_HOOK_CAPS_EX:

  return 0x00c7e2f8;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6cf80HookSlotNameVa(slot) {

  switch(slot) {

  case A6CF80_HOOK_GET_STATE:

  return asU32(0x00ba1a08);

  case A6CF80_HOOK_SET_STATE:

  return 0x00ba1984;

  case A6CF80_HOOK_GET_CAPS:

  return 0x00ba1994;

  default:

  return 0xffffffff;

  }

}

export function managerPollA6cf80HookSlotOrdinal(slot) {

  switch(slot) {

  case A6CF80_HOOK_ORD_PRIMARY:

  return asU32(A6CF80_PROC_ORD_PRIMARY);

  case A6CF80_HOOK_CAPS_EX:

  return asU32(A6CF80_PROC_ORD_CAPS_EX);

  default:

  return 0xffffffff;

  }

}

export function managerPollA6cf80CoinitRetryNeeded(hr) {

  return !!(hr == asU32(A6CF80_COINIT_CHANGED_MODE));

}

export function managerPollA6cf80EnableAfterInit() {

  return asU32(1);

}

export function managerPollA6cf80EnumFlagAfterInit() {

  return asU32(1);

}

export function managerPollA6cf80ProbeCount() {

  return asU32(A6CF80_PROBE_COUNT);

}

export function managerPollA6cf80CoinitFlagsFirst() {

  return asU32(A6CF80_COINIT_FLAGS_FIRST);

}

export function managerPollA6cf80CoinitFlagsRetry() {

  return asU32(A6CF80_COINIT_FLAGS_RETRY);

}

export function managerPollA6cf80NotifyFilterBytes() {

  return asU32(A6CF80_NOTIFY_FILTER_BYTES);

}

export function managerPollA6cf80NotifyFilterCbsize() {

  return asU32(A6CF80_NOTIFY_FILTER_CBSIZE);

}

export function managerShellReceiverOfs(recvId) {

  switch(recvId) {

  case MANAGER_SHELL_RECV_SELF:

  return asU32(0);

  case MANAGER_SHELL_RECV_9C34F0:

  return asU32(MANAGER_SHELL_OFF_SUB_9C34F0);

  case MANAGER_SHELL_RECV_APPROACH:

  return asU32(MANAGER_SHELL_OFF_APPROACH);

  case MANAGER_SHELL_RECV_90B150:

  return asU32(MANAGER_SHELL_OFF_SUB_90B150);

  default:

  return 0xffffffff;

  }

}

export function managerShellReceiverAddr(manager, recvId) {

  const ofs = managerShellReceiverOfs(recvId);

  if (asU32(ofs) === 0xffffffff) {

    return asU32(0xffffffff);

  }

  return asU32(asU32(manager) + asU32(ofs));

}

export function managerApproachSlotAddr(approachBase, slot) {

  return asU32(approachBase +

  asU32(MANAGER_APPROACH_FIRST_OFS) +

  slot * asU32(MANAGER_APPROACH_SLOT_STRIDE));

}

export function managerApproachSlotContinue(slot) {

  const next = asU32(asU32(slot) + 1);

  return asU32(next) < asU32(MANAGER_APPROACH_SLOT_COUNT);

}

export function managerApproachUsesAddPath(current, target) {

  return !!(!(current > target));

}

export function managerApproachHostCallNeeded(mode10) {

  return !!(mode10 != asU32(MANAGER_APPROACH_MODE_SKIP_HOST));

}

export function managerApproachHostArgSlot(slot) {

  return asU32(slot);

}

export function managerShellFlagBAfterLoop() {

  return asU32(0);

}

export function managerShellProbeNeeded(probeA4c610, probeB4c658) {

  if(probeA4c610 != 0) {

  return false;

  }

  return !!(probeB4c658 <= 0);

}

export function managerShellSub90b150Blocks(al) {

  return(al & 0xff) != 0 ? true : false;

}

export function managerShellStateUsesGame(state8) {

  return(state8 == 2 || state8 == 5) ? true : false;

}

export function managerShellGamePresent(gameC71678) {

  return !!(gameC71678 != 0);

}

export function managerShellSilentReturn(flagA4abc4, flagB4abc5) {

  if((flagA4abc4 & 0xff) == 0) {

  return false;

  }

  return(flagB4abc5 & 0xff) == 0 ? true : false;

}

export function managerShellStateIndex(state8) {
  return asU32(asU32(state8) - 1);
}

export function managerShellStateInTable(state8) {

  return !!(managerShellStateIndex(state8) <= 4);

}

export function managerShellStateTargetVa(state8) {

  if(managerShellStateInTable(state8) == 0) {

  return asU32(MANAGER_SHELL_STATE_DEFAULT_VA);

  }

  switch(managerShellStateIndex(state8)) {

  case 0:

  return 0x009553a6;

  case 1:

  return 0x009551a3;

  case 2:

  return 0x009553d7;

  case 3:

  return 0x009553ef;

  default:

  return 0x009553e4;

  }

}

export function managerShellStateTableVa() {

  return asU32(MANAGER_SHELL_STATE_TABLE_VA);

}

export function managerShellStateDefaultVa() {

  return asU32(MANAGER_SHELL_STATE_DEFAULT_VA);

}

export function managerApproachSlotCount() {

  return asU32(MANAGER_APPROACH_SLOT_COUNT);

}

export function managerApproachSlotStride() {

  return asU32(MANAGER_APPROACH_SLOT_STRIDE);

}

export function managerPollA6dd30XCbRan(newX, oldX, cbBefore) {

  return managerPollA6dd30CbNeeded(newX, oldX, cbBefore);

}

export function managerPollA6dd30YAxisBase(xCbRan, baseBefore, baseAfter) {

  return asU32(xCbRan != 0 ? baseAfter : baseBefore);

}

export function managerPollA6dd30YCbPtr(xCbRan, cbBefore, cbAfter) {

  return asU32(xCbRan != 0 ? cbAfter : cbBefore);

}

export function managerPollA6dd30YCbNeeded(newY, oldY, xCbRan, cbBefore, cbAfter) {

  let cb =

  managerPollA6dd30YCbPtr(xCbRan, cbBefore, cbAfter);

  return managerPollA6dd30CbNeeded(newY, oldY, cb);

}

export function managerPollA6dd30TimestampIsStable() {

  return true;

}

export function managerPollA1f280ActionSlotModeCc(modeCcAfterVcall) {

  return asU32(modeCcAfterVcall);

}

export function managerPollA1f280ActionStoreBase(oorLogRan, beginBefore, beginAfter) {

  return asU32(oorLogRan != 0 ? beginAfter : beginBefore);

}

export function managerPollA1f280ActionStoreAddr(storeBase, modeCc, index) {

  return asU32(storeBase +

  managerPollA1f280BufferSlotOffset(modeCc, index));

}

export function managerPollA1f280ActionCountIsPrelog() {

  return true;

}

export function managerState2Blocked(flag4b130) {

  return(flag4b130 & 0xff) != 0 ? true : false;

}

export function managerState2ParityAlt(counterLow4abbc) {

  return((counterLow4abbc & 0xff) & 1) != 0 ? true : false;

}

export function managerState2SweepNeeded(entityCount) {

  return !!(entityCount != 0);

}

export function managerState2SweepStep(index, entityCountReloaded) {

  const next = asU32(asU32(index) + 1);

  return asU32(next) < asU32(entityCountReloaded);

}

export function managerState2EntitySlotAddr(arrayBaseReloaded, index) {

  return asU32(asU32(arrayBaseReloaded) + asU32(asU32(index) * 4));

}

export function managerState2EntityNeedsFixup(flag175) {

  return(flag175 & 0xff) != 0 ? true : false;

}

export function managerState2FixupSrcOfs(pairId) {

  switch(pairId) {

  case STATE2_FIXUP_A:

  return asU32(STATE2_OFF_ENTITY_SRC_A);

  case STATE2_FIXUP_B:

  return asU32(STATE2_OFF_ENTITY_SRC_B);

  default:

  return 0xffffffff;

  }

}

export function managerState2FixupDstOfs(pairId) {

  switch(pairId) {

  case STATE2_FIXUP_A:

  return asU32(STATE2_OFF_ENTITY_DST_A);

  case STATE2_FIXUP_B:

  return asU32(STATE2_OFF_ENTITY_DST_B);

  default:

  return 0xffffffff;

  }

}

export function managerState2EntityFlagAfterFixup() {

  return asU32(0);

}

export function manager9505e0Gate(dword1918, byte1928, dword1b6c, byte1b7c) {

  if(dword1918 != 0) {

  if((byte1928 & 0xff) != 0) {

  return true;

  }

  }

  if(dword1b6c == 0) {

  return false;

  }

  return(byte1b7c & 0xff) != 0 ? true : false;

}

export function manager9505e0ReadsBPair(dword1918, byte1928) {

  if(dword1918 != 0 && (byte1928 & 0xff) != 0) {

  return false;

  }

  return true;

}

export function manager9505e0FieldOfs(fieldId) {

  switch(fieldId) {

  case P9505E0_FIELD_A_DWORD:

  return asU32(P9505E0_OFF_A_DWORD);

  case P9505E0_FIELD_A_BYTE:

  return asU32(P9505E0_OFF_A_BYTE);

  case P9505E0_FIELD_B_DWORD:

  return asU32(P9505E0_OFF_B_DWORD);

  case P9505E0_FIELD_B_BYTE:

  return asU32(P9505E0_OFF_B_BYTE);

  default:

  return 0xffffffff;

  }

}

export function manager9505e0ManagerOfs(fieldId) {

  let ofs = manager9505e0FieldOfs(fieldId);

  if(ofs == 0xffffffff) {

  return asU32(0xffffffff);

  }

  return asU32(P9505E0_RECV_OFS) + ofs;

}

export function manager9c3990NodeMatches(flagsByte24) {

  return((flagsByte24 & 0xff) &

  asU32(P9C3990_MATCH_BIT)) != 0

  ? true : false;

}

export function manager9c3990WalkContinue(node, head) {

  return !!(node != head);

}

export function manager9c3990Scanned(flagBytes, n) {

  if(flagBytes == null) {

  return asU32(0);

  }

  for(let i = 0; i < n; i++) {

  if(manager9c3990NodeMatches(flagBytes[i]) != 0) {

  return i + 1;

  }

  }

  return n;

}

export function manager9c3990Result(flagBytes, n) {

  if(flagBytes == null) {

  return false;

  }

  for(let i = 0; i < n; i++) {

  if(manager9c3990NodeMatches(flagBytes[i]) != 0) {

  return true;

  }

  }

  return false;

}

export function manager9c3990UnlockAlways() {

  return true;

}

export function manager9c3990LockArg() {

  return asI32(P9C3990_LOCK_ARG);

}

export function manager9c3990LockVtblSlot() {

  return asU32(P9C3990_LOCK_VTBL);

}

export function manager9c3990UnlockVtblSlot() {

  return asU32(P9C3990_UNLOCK_VTBL);

}

export function managerState1SecondGateNeeded(probeAl, mode40) {

  if(mode40 == asU32(STATE1_MODE_MATCH)) {

  return true;

  }

  return(probeAl & 0xff) == 0 ? true : false;

}

export function managerState1ModeReadUnconditional() {

  return true;

}

export function managerState1TerminalNeeded(probeAl, mode40, gateAl) {

  if(managerState1SecondGateNeeded(probeAl, mode40) == 0) {

  return false;

  }

  return(gateAl & 0xff) == 0 ? true : false;

}

export function managerState1TerminalNeededFromFields(probeAl, mode40, dword1918, byte1928, dword1b6c, byte1b7c) {

  if(managerState1SecondGateNeeded(probeAl, mode40) == 0) {

  return false;

  }

  let gate = asU32(

  manager9505e0Gate(dword1918, byte1928, dword1b6c, byte1b7c));

  return managerState1TerminalNeeded(probeAl, mode40, gate);

}

export function managerState2HeadGateNeeded(probeAl) {

  return(probeAl & 0xff) == 0 ? true : false;

}

export function managerState2HeadTerminalNeeded(probeAl, gateAl) {

  if(managerState2HeadGateNeeded(probeAl) == 0) {

  return false;

  }

  return(gateAl & 0xff) == 0 ? true : false;

}

export function managerState2HeadTerminalNeededFromFields(probeAl, dword1918, byte1928, dword1b6c, byte1b7c) {

  if (managerState2HeadGateNeeded(probeAl) == 0) {

    return false;

  }

  const gate = asU32(manager9505e0Gate(dword1918, byte1928, dword1b6c, byte1b7c));

  return managerState2HeadTerminalNeeded(probeAl, gate);

}

export function managerShellArmRecvOfs(state8) {

  switch(state8) {

  case 1:

  case 2:

  return asU32(STATE_ARM_PROBE_RECV_OFS);

  case 3:

  return asU32(STATE3_RECV_OFS);

  case 5:

  return asU32(STATE5_RECV_OFS);

  default:

  return 0xffffffff;

  }

}

export function managerShellArmCallVa(state8) {

  switch(state8) {

  case 1:

  case 2:

  return asU32(STATE_ARM_PROBE_VA);

  case 3:

  return asU32(STATE3_CALL_VA);

  case 5:

  return asU32(STATE5_CALL_VA);

  default:

  return 0xffffffff;

  }

}

export function managerState1TerminalVa() {

  return asU32(STATE1_TERMINAL_VA);

}

export function managerState2HeadTerminalVa() {

  return asU32(STATE2_TERMINAL_VA);

}

export function managerPredispatchCallNeeded(obj21c38, suppress29fb8) {

  if(obj21c38 == 0) {

  return false;

  }

  return(suppress29fb8 & 0xff) == 0 ? true : false;

}

export function managerPredispatchObjAfter(callRan, objBefore, objAfter) {

  return asU32(callRan != 0 ? objAfter : objBefore);

}

export function managerPredispatchSuppressAfter(callRan, suppressBefore, suppressAfter) {

  return asU32(callRan != 0 ? suppressAfter : suppressBefore);

}

export function managerPredispatchQueueGateReached(objBefore, suppressBefore, objAfter, suppressAfter, mode2a378) {

  if(objBefore == 0) {

  return false;

  }

  let call_ran =

  managerPredispatchCallNeeded(objBefore, suppressBefore);

  let obj =

  managerPredispatchObjAfter(call_ran, objBefore, objAfter);

  if(obj == 0) {

  return false;

  }

  let suppress = managerPredispatchSuppressAfter(

  call_ran, suppressBefore, suppressAfter);

  if((suppress & 0xff) != 0) {

  return false;

  }

  return !!(mode2a378 == asU32(PREDISPATCH_MODE_MATCH));

}

export function managerPredispatchForcesDefault(queueBegin, queueEnd) {

  return !!(queueBegin == queueEnd);

}

export function managerPredispatchDispatches(objBefore, suppressBefore, objAfter, suppressAfter, mode2a378, queueBegin, queueEnd) {

  if(managerPredispatchQueueGateReached(

  objBefore, suppressBefore, objAfter, suppressAfter,

  mode2a378) == 0) {

  return true;

  }

  return !!(managerPredispatchForcesDefault(queueBegin, queueEnd) == 0);

}

export function managerPredispatchFieldOfs(fieldId) {

  switch(fieldId) {

  case PREDISPATCH_FIELD_OBJ:

  return asU32(PREDISPATCH_OFF_OBJ);

  case PREDISPATCH_FIELD_RECV:

  return asU32(PREDISPATCH_OFF_RECV);

  case PREDISPATCH_FIELD_SUPPRESS:

  return asU32(PREDISPATCH_OFF_SUPPRESS);

  case PREDISPATCH_FIELD_MODE:

  return asU32(PREDISPATCH_OFF_MODE);

  default:

  return 0xffffffff;

  }

}

export function managerState2GameNullGuarded() {

  return false;

}

export function managerState2MidParityGateNeeded(flag2a3c0) {

  return(flag2a3c0 & 0xff) != 0 ? true : false;

}

export function managerState2MidDispatchNeeded(pausedAl, dword1b83c, dword1b858) {

  if((pausedAl & 0xff) == 0) {

  return true;

  }

  if(dword1b83c == 0) {

  return false;

  }

  if(dword1b858 != asU32(STATE2_MID_GAME_B_MATCH)) {

  return false;

  }

  return true;

}

export function managerState2MidModeIsTwo(mode2a380) {

  return !!(mode2a380 == asU32(STATE2_MID_MODE_V2));

}

export function managerState2MidParityBit(counter4abbc) {

  return(counter4abbc & 0xff) & 1;

}

export function managerState2MidWriteByteNeeded(mode2a380, parityByte) {

  if(managerState2MidModeIsTwo(mode2a380) != 0) {

  return(parityByte & 0xff) != 0 ? true : false;

  }

  return true;

}

export function managerState2MidCallAVa() {

  return asU32(STATE2_MID_CALL_A_VA);

}

export function managerState2MidCallBVa() {

  return asU32(STATE2_MID_CALL_B_VA);

}

export function managerState2MidParityCallVa() {

  return asU32(STATE2_MID_PARITY_CALL_VA);

}

export function managerState2MidIsPausedVa() {

  return asU32(STATE2_MID_IS_PAUSED_VA);

}

export function managerState2MidObjInnerOfs() {

  return asU32(STATE2_MID_OFF_OBJ_INNER);

}

export function managerState2MidObjByteOfs() {

  return asU32(STATE2_MID_OFF_OBJ_BYTE);

}

export function managerState2MidModeOfs() {

  return asU32(STATE2_MID_OFF_MODE);

}

export function managerShellAngleWrapCount(end1bb1c, begin1bb18) {

  let diff = end1bb1c - begin1bb18;

  return asI32(diff) >>  2;

}

export function managerShellAngleWrapActive(dword0) {

  return asI32(dword0) < 0 ? false : true;

}

export function managerShellAngleWrapSlot(dword0, dword8, value, end1bb1c, begin1bb18) {
  if (asI32(dword0) < 0) {
    return Math.fround(value);
  }
  const i = Math.fround(dword8);
  const count = managerShellAngleWrapCount(end1bb1c, begin1bb18);
  const c = count >= 0
    ? Math.fround(count)
    : Math.fround((+count) + 4294967296.0);
  const half = Math.fround(c * Math.fround(0.5));
  let w = Math.fround(i - Math.fround(value));
  while (w >= half) {
    w = Math.fround(w - c);
  }
  const nhalf = Math.fround(-half);
  while (nhalf > w) {
    w = Math.fround(w + c);
  }
  if (Math.fround(0.25) > Math.fround(Math.abs(Math.fround(w)))) {
    return i;
  }
  const step = (w <= 0.0 || w !== w) ? Math.fround(-0.25) : Math.fround(0.25);
  return Math.fround(Math.fround(value) + step);
}

export function managerShellApproachTailNeeded(gameC71678, pausedAl) {

  if(gameC71678 == 0) {

  return false;

  }

  return(pausedAl & 0xff) == 0 ? true : false;

}

export function managerShellApproachTailStoreNeeded(value2a334, step2a338) {

  if(value2a334 == 1.0) {

  return false;

  }

  if(step2a338 == 0.0) {

  return false;

  }

  return true;

}

export function managerShellApproachTailNext(value2a334, step2a338) {
  const d = Math.fround(Math.abs(Math.fround(Math.fround(value2a334) - Math.fround(1.0))));
  if (step2a338 >= d) {
    return Math.fround(1.0);
  }
  if (Math.fround(1.0) <= value2a334) {
    return Math.fround(Math.fround(value2a334) - Math.fround(step2a338));
  }
  return Math.fround(Math.fround(value2a334) + Math.fround(step2a338));
}

export function managerShellApproachTailHostVa() {

  return asU32(SHELL_APPROACH_HOST_VA);

}

export function managerShellApproachTailRecvOfs() {

  return asU32(SHELL_APPROACH_RECV_OFS);

}

export function managerShellApproachTailValueOfs() {

  return asU32(SHELL_APPROACH_VALUE_OFS);

}

export function managerShellApproachTailStepOfs() {

  return asU32(SHELL_APPROACH_STEP_OFS);

}

export function managerState2TailCallAVa() {

  return asU32(STATE2_TAIL_CALL_A_VA);

}

export function managerState2TailCallARecvOfs() {

  return asU32(STATE2_TAIL_OFF_CALL_A_RECV);

}

export function managerState2TailCallBNeeded(byte2a3a6) {

  return nonzeroU8(byte2a3a6) !== 0;

}

export function managerState2TailCallBVa() {

  return asU32(STATE2_TAIL_CALL_B_VA);

}

export function managerState2TailCallBRecvGlobalVa() {

  return asU32(STATE2_TAIL_CALL_B_RECV_GLOBAL_VA);

}

export function managerState2TailCallBArgEdx() {

  return asU32(STATE2_TAIL_CALL_B_EDX_ARG);

}

export function managerState2TailAnimVa(result) {

  return asU32(result == 0 ? asU32(STATE2_TAIL_ANIM_IDLE_VA)

  : asU32(

  STATE2_TAIL_ANIM_CLICKED_VA));

}

export function managerState2TailPlayVa() {

  return asU32(STATE2_TAIL_PLAY_VA);

}

export function managerState2TailPlayRecvOfs() {

  return asU32(STATE2_TAIL_OFF_PLAY_RECV);

}

export function managerState2TailPlayAnimIdleVa() {

  return asU32(STATE2_TAIL_ANIM_IDLE_VA);

}

export function managerState2TailPlayAnimClickedVa() {

  return asU32(STATE2_TAIL_ANIM_CLICKED_VA);

}

export function managerState2TailPlayResetArg() {

  return asU32(STATE2_TAIL_PLAY_RESET_ARG);

}

export function managerShellTailWinAssertNeeded(win) {

  return !!(win == 0);

}

export function managerShellTailWassertMsgVa() {

  return asU32(SHELL_TAIL_WASSERT_MSG_VA);

}

export function managerShellTailWassertFileVa() {

  return asU32(SHELL_TAIL_WASSERT_FILE_VA);

}

export function managerShellTailWassertLine() {

  return asU32(SHELL_TAIL_WASSERT_LINE);

}

export function managerShellTailWassertIatVa() {

  return asU32(SHELL_TAIL_WASSERT_IAT_VA);

}

export function managerShellTailWinGlobalVa() {

  return asU32(SHELL_TAIL_WIN_GLOBAL_VA);

}

export function managerShellTailUsesPlatformPoll(flag) {

  return !!(flag == 0);

}

export function managerShellTailPlatformPollVa() {

  return asU32(SHELL_TAIL_PLATFORM_POLL_VA);

}

export function managerShellTailPlatformPollArg0() {

  return asU32(SHELL_TAIL_PLATFORM_POLL_ARG0);

}

export function managerShellTailPlatformPollArg1() {

  return asU32(SHELL_TAIL_PLATFORM_POLL_ARG1);

}

export function managerShellTailPlatformFlagVa() {

  return asU32(SHELL_TAIL_PLATFORM_FLAG_VA);

}

export function managerShellTailDirectCopyNeeded(kind) {

  return !!(kind == SHELL_TAIL_WIN_KIND_DIRECT_COPY);

}

export function managerShellTailKindOfs() {

  return asU32(SHELL_TAIL_WIN_KIND_OFS);

}

export function managerShellTailKindMagic() {

  return asU32(SHELL_TAIL_WIN_KIND_DIRECT_COPY);

}

export function managerShellTailD0Ofs() {

  return asU32(SHELL_TAIL_WIN_D0_OFS);

}

export function managerShellTailD1Ofs() {

  return asU32(SHELL_TAIL_WIN_D1_OFS);

}

export function managerShellTailPlatformQueryVa() {

  return asU32(SHELL_TAIL_PLATFORM_QUERY_VA);

}

export function managerShellTailFloatOfF64(d) {

  return Math.fround(d);

}

export function managerShellTailLaneOrderedEqual(a, b) {

  return !!(a == b);

}

export function managerShellTailBothLanesEqual(f0, s0, f1, s1) {

  return(f0 == s0 && f1 == s1) ? true : false;

}

export function managerShellTailTimerNext(timer, bothEqual) {

  if(bothEqual == 0) {

  return asI32(SHELL_TAIL_TIMER_RESET);

  }

  return timer > 0 ? timer - 1 : timer;

}

export function managerShellTailTimerOfs() {

  return asU32(SHELL_TAIL_TIMER_OFS);

}

export function managerShellTailTimerResetValue() {

  return asU32(SHELL_TAIL_TIMER_RESET);

}

export function managerShellTailStoreF0Ofs() {

  return asU32(SHELL_TAIL_STORE_F0_OFS);

}

export function managerShellTailStoreF1Ofs() {

  return asU32(SHELL_TAIL_STORE_F1_OFS);

}

export function managerShellTailParityNext(counter) {

  return asI32(asU32(counter) + 1);

}

export function managerShellTailParityOfs() {

  return asU32(SHELL_TAIL_PARITY_OFS);

}

export function managerPrepollState4StoreNeeded(byte0) {

  return !!(nonzeroU8(byte0) != 0);

}

export function managerPrepollG1Needed(byte21618) {

  return !!(nonzeroU8(byte21618) != 0);

}

export function managerPrepollG2Needed(byte21620) {

  return !!(nonzeroU8(byte21620) != 0);

}

export function managerPrepollHostCNeeded(g1, g2) {

  return(nonzeroU8(g1) != 0 && nonzeroU8(g2) != 0) ? true : false;

}

export function managerPrepollState3TransitionNeeded(g1) {

  return !!(nonzeroU8(g1) != 0);

}

export function managerPrepollG3Needed(byte4b2a4) {

  return !!(nonzeroU8(byte4b2a4) != 0);

}

export function managerPrepollState5TransitionNeeded(g3) {

  return !!(nonzeroU8(g3) != 0);

}

export function managerPrepollArmSelect(state, g3, dword21628, dword20dd0) {

  if(nonzeroU8(g3) != 0) {

  return dword21628 == 0 ? PREPOLL_ARM_STATE5 : PREPOLL_ARM_POLL;

  }

  if(state == PREPOLL_STATE3_VALUE) {

  return dword20dd0 == 0 ? PREPOLL_ARM_STATE3 : PREPOLL_ARM_POLL;

  }

  if(state == PREPOLL_STATE5_VALUE) {

  return dword21628 == 0 ? PREPOLL_ARM_STATE5 : PREPOLL_ARM_POLL;

  }

  return PREPOLL_ARM_POLL;

}

export function managerPrepollCopyBlockNeeded(armEax, byte21620) {

  return !!(asI32(armEax) == PREPOLL_STATE3_VALUE &&

  nonzeroU8(byte21620) != 0);

}

export function managerPrepollG4Needed(byte4b428) {

  return !!(nonzeroU8(byte4b428) != 0);

}

export function managerPrepollGameB0Next(oldB0) {

  return Math.fround(oldB0 + 1.0);

}

export function managerPrepollLogNeeded(history) {

  return !!(history == 1);

}

export function managerPrepollNightmareArg(byte4b2a5) {

  return asU32(byte4b2a5 & 0xff);

}

export function managerPrepollCopySrcOfs(slotIndex) {

  return asU32(slotIndex * PREPOLL_COPY_STRIDE +

  PREPOLL_COPY_SRC_BASE);

}

export function managerPrepollCopySrcDwordOfs(slotIndex) {

  return asU32(slotIndex * PREPOLL_COPY_STRIDE +

  PREPOLL_COPY_SRC_DW);

}

export function managerPrepollStateOfs() {

  return asU32(PREPOLL_STATE_OFS);

}

export function managerPrepollHistoryOfs() {

  return asU32(PREPOLL_HISTORY_OFS);

}

export function managerPrepollG1Ofs() {

  return asU32(PREPOLL_G1_OFS);

}

export function managerPrepollCutsceneIdOfs() {

  return asU32(PREPOLL_CUTSCENE_ID_OFS);

}

export function managerPrepollG2Ofs() {

  return asU32(PREPOLL_G2_OFS);

}

export function managerPrepollCopySlotIndexOfs() {

  return asU32(PREPOLL_COPY_SLOT_INDEX_OFS);

}

export function managerPrepollCopySrcBase() {

  return asU32(PREPOLL_COPY_SRC_BASE);

}

export function managerPrepollCopySrcDword() {

  return asU32(PREPOLL_COPY_SRC_DW);

}

export function managerPrepollCopyStride() {

  return asU32(PREPOLL_COPY_STRIDE);

}

export function managerPrepollCopyDstCoreOfs() {

  return asU32(PREPOLL_COPY_DST_CORE);

}

export function managerPrepollCopyDstDwordOfs() {

  return asU32(PREPOLL_COPY_DST_DW);

}

export function managerPrepollCopyDstExtOfs() {

  return asU32(PREPOLL_COPY_DST_EXT);

}

export function managerPrepollCopyExtFromOfs() {

  return asU32(PREPOLL_COPY_EXT_FROM_OFS);

}

export function managerPrepollCopyFlagOfs() {

  return asU32(PREPOLL_COPY_FLAG_OFS);

}

export function managerPrepollCopyFlagValue() {

  return asU32(PREPOLL_COPY_FLAG_VALUE);

}

export function managerPrepollG3Ofs() {

  return asU32(PREPOLL_G3_OFS);

}

export function managerPrepollNightmareArgOfs() {

  return asU32(PREPOLL_NIGHTMARE_ARG_OFS);

}

export function managerPrepollG4Ofs() {

  return asU32(PREPOLL_G4_OFS);

}

export function managerPrepollState3armByteOfs() {

  return asU32(PREPOLL_STATE3ARM_BYTE_OFS);

}

export function managerPrepollPredispatchRecvOfs() {

  return asU32(PREPOLL_PREDISPATCH_RECV_OFS);

}

export function managerPrepollState5RecvOfs() {

  return asU32(PREPOLL_STATE5_RECV_OFS);

}

export function managerPrepollGameStoreBaseOfs() {

  return asU32(PREPOLL_GAME_STORE_BASE_OFS);

}

export function managerPrepollGameStoreB4Ofs() {

  return asU32(PREPOLL_GAME_STORE_B4_OFS);

}

export function managerPrepollGameStoreB8Ofs() {

  return asU32(PREPOLL_GAME_STORE_B8_OFS);

}

export function managerPrepollGameStoreBcOfs() {

  return asU32(PREPOLL_GAME_STORE_BC_OFS);

}

export function managerPrepollGameStoreB8Bits() {

  return asU32(PREPOLL_GAME_STORE_B8_BITS);

}

export function managerPrepollGameStoreBcValue() {

  return asU32(PREPOLL_GAME_STORE_BC_VALUE);

}

export function managerPrepollCrossfadeRecvOfs() {

  return asU32(PREPOLL_CROSSFADE_RECV_OFS);

}

export function managerPrepollCrossfadeMusicId() {

  return asU32(PREPOLL_CROSSFADE_MUSIC_ID);

}

export function managerPrepollCrossfadeRateBits() {

  return asU32(PREPOLL_CROSSFADE_RATE_BITS);

}

export function managerPrepollHostAVa() {

  return asU32(PREPOLL_HOST_A_VA);

}

export function managerPrepollHostBVa() {

  return asU32(PREPOLL_HOST_B_VA);

}

export function managerPrepollHostCVa() {

  return asU32(PREPOLL_HOST_C_VA);

}

export function managerPrepollHostDVa() {

  return asU32(PREPOLL_HOST_D_VA);

}

export function managerPrepollHostEVa() {

  return asU32(PREPOLL_HOST_E_VA);

}

export function managerPrepollHostFVa() {

  return asU32(PREPOLL_HOST_F_VA);

}

export function managerPrepollHostGVa() {

  return asU32(PREPOLL_HOST_G_VA);

}

export function managerPrepollHostGArg() {

  return asU32(PREPOLL_HOST_G_ARG);

}

export function managerPrepollLogVa() {

  return asU32(PREPOLL_LOG_VA);

}

export function managerPrepollLogLevel() {

  return asU32(PREPOLL_LOG_LEVEL);

}

export function managerPrepollLogMsgVa() {

  return asU32(PREPOLL_LOG_MSG_VA);

}

export function managerPrepollHostHVa() {

  return asU32(PREPOLL_HOST_H_VA);

}

export function managerPrepollState4Value() {

  return asU32(PREPOLL_STATE4_VALUE);

}

export function managerPlayerscanCountFromBounds(end, begin) {

  let diff = asI32(asU32(end) -

  asU32(begin));

  return diff >>  3;

}

export function managerPlayerscanElementPtr(begin, index) {

  return asU32(asU32(begin) + asU32(asU32(index) * 8));

}

export function managerPlayerscanMatchNeeded(vcallResult) {

  return asI32(vcallResult) !== -1;

}

export function managerPlayerscanState2Gate(state) {

  return !!(state == PLAYERSCAN_STATE2_VALUE);

}

export function managerPlayerscanPlayerCountFromBounds(end, begin) {

  let diff = asI32(asU32(end) -

  asU32(begin));

  return diff >>  2;

}

export function managerPlayerscanLogNeeded(playerCount) {

  return !!(playerCount == 0);

}

export function managerPlayerscanReleaseGate(ctrl) {

  return !!(ctrl != 0);

}

export function managerPlayerscanCallbackNeeded(vcallAl, callback) {

  return((vcallAl & 0xff) != 0 && callback != 0) ? true : false;

}

export function managerPlayerscanElementCtrlOfs() {

  return asU32(PLAYERSCAN_ELEMENT_CTRL_OFS);

}

export function managerPlayerscanManagerStoreOfs() {

  return asU32(PLAYERSCAN_MANAGER_STORE_OFS);

}

export function managerPlayerscanPlayerListBeginOfs() {

  return asU32(PLAYERSCAN_PLAYER_LIST_BEGIN_OFS);

}

export function managerPlayerscanPlayerListEndOfs() {

  return asU32(PLAYERSCAN_PLAYER_LIST_END_OFS);

}

export function managerPlayerscanVectorThisVa() {

  return asU32(PLAYERSCAN_VECTOR_THIS_VA);

}

export function managerPlayerscanVectorBeginVa() {

  return asU32(PLAYERSCAN_VECTOR_BEGIN_VA);

}

export function managerPlayerscanVectorEndVa() {

  return asU32(PLAYERSCAN_VECTOR_END_VA);

}

export function managerPlayerscanVectorLockVa() {

  return asU32(PLAYERSCAN_VECTOR_LOCK_VA);

}

export function managerPlayerscanVectorStride() {

  return asU32(PLAYERSCAN_VECTOR_STRIDE);

}

export function managerPlayerscanPlayerListStride() {

  return asU32(PLAYERSCAN_PLAYER_LIST_STRIDE);

}

export function managerPlayerscanLastIndexGlobalVa() {

  return asU32(PLAYERSCAN_LAST_INDEX_GLOBAL_VA);

}

export function managerPlayerscanReleaseCallbackGlobalVa() {

  return asU32(PLAYERSCAN_RELEASE_CALLBACK_GLOBAL_VA);

}

export function managerPlayerscanManagerGlobalVa() {

  return asU32(PLAYERSCAN_MANAGER_GLOBAL_VA);

}

export function managerPlayerscanGameGlobalVa() {

  return asU32(PLAYERSCAN_GAME_GLOBAL_VA);

}

export function managerPlayerscanAccessorVa() {

  return asU32(PLAYERSCAN_ACCESSOR_VA);

}

export function managerPlayerscanSetControllerVa() {

  return asU32(PLAYERSCAN_SET_CONTROLLER_VA);

}

export function managerPlayerscanSetControllerArg() {

  return asU32(PLAYERSCAN_SET_CONTROLLER_ARG);

}

export function managerPlayerscanMatchVcallSlot() {

  return asU32(PLAYERSCAN_MATCH_VCALL_SLOT);

}

export function managerPlayerscanMatchVcallArg() {

  return asU32(PLAYERSCAN_MATCH_VCALL_ARG);

}

export function managerPlayerscanMatchSentinel() {

  return asU32(PLAYERSCAN_MATCH_SENTINEL);

}

export function managerPlayerscanReleaseVcallSlot() {

  return asU32(PLAYERSCAN_RELEASE_VCALL_SLOT);

}

export function managerPlayerscanLogLevel() {

  return asU32(PLAYERSCAN_LOG_LEVEL);

}

export function managerPlayerscanLogMsgVa() {

  return asU32(PLAYERSCAN_LOG_MSG_VA);

}

export function managerPlayerscanState2Value() {

  return asU32(PLAYERSCAN_STATE2_VALUE);

}

export function managerA0f550R(packed) {

  return(packed >>>  16) & 0xff;

}

export function managerA0f550G(packed) {

  return(packed >>>  8) & 0xff;

}

export function managerA0f550B(packed) {

  return asU32(packed & 0xff);

}

export function managerA0f550A(packed) {

  return(packed >>>  24) & 0xff;

}

export function managerA0f550ChannelF32(byte) {

  let b = byte & 0xff;

  return Math.fround(Math.fround(b) / Math.fround(255.0));

}

export function managerA0f550F0(packed) {

  return Math.fround(managerA0f550ChannelF32(managerA0f550R(packed)));

}

export function managerA0f550F1(packed) {

  return Math.fround(managerA0f550ChannelF32(managerA0f550G(packed)));

}

export function managerA0f550F2(packed) {

  return Math.fround(managerA0f550ChannelF32(managerA0f550B(packed)));

}

export function managerA0f550F3(packed) {

  return Math.fround(managerA0f550ChannelF32(managerA0f550A(packed)));

}

export function managerA0f550TailStore() {

  return asU32(A0F550_TAIL_STORE);

}

export function managerA0f550F0Ofs() {

  return asU32(A0F550_F0_OFS);

}

export function managerA0f550F1Ofs() {

  return asU32(A0F550_F1_OFS);

}

export function managerA0f550F2Ofs() {

  return asU32(A0F550_F2_OFS);

}

export function managerA0f550F3Ofs() {

  return asU32(A0F550_F3_OFS);

}

export function managerA0f550TailOfs() {

  return asU32(A0F550_TAIL_OFS);

}

export function managerA0f550DenomBits() {

  return asU32(A0F550_DENOM_BITS);

}

export function managerA0f550DenomVa() {

  return asU32(A0F550_DENOM_VA);

}

export function managerA0f550SignedTableVa() {

  return asU32(A0F550_SIGNED_TABLE_VA);

}

export function managerA0f550Va() {

  return asU32(A0F550_VA);

}

export function managerA0f550RetVa() {

  return asU32(A0F550_RET_VA);

}

export function managerA0f550BodyBytes() {

  return asU32(A0F550_BODY_BYTES);

}

export function managerA0f550NextVa() {

  return asU32(A0F550_NEXT_VA);

}

export function manager959d00BodyNeeded(flagByte) {

  return((flagByte & 0xff) != 0) ? true : false;

}

export function manager959d00State2Needed(state) {

  return asI32(state) === asI32(A959D00_STATE2_VALUE);

}

export function manager959d00QueueNonempty(begin, end) {

  return(begin != end) ? true : false;

}

export function manager959d00State2IslandNeeded(flagByte, state, begin, end) {

  return !!(manager959d00BodyNeeded(flagByte) != 0 &&

  manager959d00State2Needed(state) != 0 &&

  manager959d00QueueNonempty(begin, end) != 0);

}

export function manager959d00QuietArg(mode26584, dword26630) {

  if(mode26584 != 0) {

  return false;

  }

  return(dword26630 <= 0) ? true : false;

}

export function manager959d00Host907690Needed(ext) {

  return(ext != asU32(A959D00_EXT_SKIP)) ? true : false;

}

export function manager959d00MenuAllocNeeded(menuPtr) {

  return(menuPtr == 0) ? true : false;

}

export function manager959d00MenuCtorNeeded(alloc) {

  return(alloc != 0) ? true : false;

}

export function manager959d00FlagOfs() {

  return asU32(A959D00_FLAG_OFS);

}

export function manager959d00StateOfs() {

  return asU32(A959D00_STATE_OFS);

}

export function manager959d00State2Value() {

  return asU32(A959D00_STATE2_VALUE);

}

export function manager959d00QueueBeginOfs() {

  return asU32(A959D00_QUEUE_BEGIN_OFS);

}

export function manager959d00QueueEndOfs() {

  return asU32(A959D00_QUEUE_END_OFS);

}

export function manager959d00GameModeOfs() {

  return asU32(A959D00_GAME_MODE_OFS);

}

export function manager959d00Game26630Ofs() {

  return asU32(A959D00_GAME_26630_OFS);

}

export function manager959d00ExtOfs() {

  return asU32(A959D00_EXT_OFS);

}

export function manager959d00ExtSkip() {

  return asU32(A959D00_EXT_SKIP);

}

export function manager959d00CoreOfs() {

  return asU32(A959D00_CORE_OFS);

}

export function manager959d00F0Ofs() {

  return asU32(A959D00_F0_OFS);

}

export function manager959d00F1Ofs() {

  return asU32(A959D00_F1_OFS);

}

export function manager959d00F2Ofs() {

  return asU32(A959D00_F2_OFS);

}

export function manager959d00DwOfs() {

  return asU32(A959D00_DW_OFS);

}

export function manager959d00MenuGlobalVa() {

  return asU32(A959D00_MENU_GLOBAL_VA);

}

export function manager959d00MenuAllocSize() {

  return asU32(A959D00_MENU_ALLOC_SIZE);

}

export function manager959d00MenuStoreCoreOfs() {

  return asU32(A959D00_MENU_STORE_CORE_OFS);

}

export function manager959d00MenuStoreF0Ofs() {

  return asU32(A959D00_MENU_STORE_F0_OFS);

}

export function manager959d00MenuStoreF1Ofs() {

  return asU32(A959D00_MENU_STORE_F1_OFS);

}

export function manager959d00MenuStoreF2Ofs() {

  return asU32(A959D00_MENU_STORE_F2_OFS);

}

export function manager959d00MenuStoreDwOfs() {

  return asU32(A959D00_MENU_STORE_DW_OFS);

}

export function manager959d00MenuStoreFlagOfs() {

  return asU32(A959D00_MENU_STORE_FLAG_OFS);

}

export function manager959d00MenuStoreFlagValue() {

  return asU32(A959D00_MENU_STORE_FLAG_VALUE);

}

export function manager959d00StateAfter() {

  return asU32(A959D00_STATE_AFTER);

}

export function manager959d00FlagClear() {

  return asU32(A959D00_FLAG_CLEAR);

}

export function manager959d00ManagerGlobalVa() {

  return asU32(A959D00_MANAGER_GLOBAL_VA);

}

export function manager959d00GameGlobalVa() {

  return asU32(A959D00_GAME_GLOBAL_VA);

}

export function manager959d00Host90cd10Va() {

  return asU32(A959D00_HOST_90CD10_VA);

}

export function manager959d00Host90a8a0Va() {

  return asU32(A959D00_HOST_90A8A0_VA);

}

export function manager959d00Host907690Va() {

  return asU32(A959D00_HOST_907690_VA);

}

export function manager959d00Host959670Va() {

  return asU32(A959D00_HOST_959670_VA);

}

export function manager959d00Host91c770Va() {

  return asU32(A959D00_HOST_91C770_VA);

}

export function manager959d00HostA0f4c0Va() {

  return asU32(A959D00_HOST_A0F4C0_VA);

}

export function manager959d00Host986450Va() {

  return asU32(A959D00_HOST_986450_VA);

}

export function manager959d00Host987450Va() {

  return asU32(A959D00_HOST_987450_VA);

}

export function manager959d00Host98aa30Va() {

  return asU32(A959D00_HOST_98AA30_VA);

}

export function manager959d00Va() {

  return asU32(A959D00_VA);

}

export function manager959d00RetVa() {

  return asU32(A959D00_RET_VA);

}

export function manager959d00BodyBytes() {

  return asU32(A959D00_BODY_BYTES);

}

export function manager959d00Sites() {

  return asU32(A959D00_SITES);

}

export function manager959d00NextVa() {

  return asU32(A959D00_NEXT_VA);

}

export function manager959720BodyNeeded(flag4b130) {

  return !!(nonzeroU8(flag4b130));

}

export function manager959720ProbeNeeded(flag4b274) {

  return !!(nonzeroU8(flag4b274));

}

export function manager959720ProbeOk(probeAl) {

  return !!(nonzeroU8(probeAl));

}

export function manager959720BodyContinue(flag4b130, flag4b274, probeAl) {

  if(manager959720BodyNeeded(flag4b130) == 0) {

  return false;

  }

  if(manager959720ProbeNeeded(flag4b274) == 0) {

  return true;

  }

  return manager959720ProbeOk(probeAl);

}

export function manager959720ParityIncNeeded(counter) {

  return((counter & 1) != 0) ? true : false;

}

export function manager959720ParityNext(counter) {

  return asU32(counter + 1);

}

export function manager959720GameAllocNeeded(gamePtr) {

  return(gamePtr == 0) ? true : false;

}

export function manager959720GameCtorNeeded(alloc) {

  return(alloc != 0) ? true : false;

}

export function manager959720QueueNonempty(begin, end) {

  return(begin != end) ? true : false;

}

export function manager959720Host6eef20Needed(flag4b274, ptr4b140, dword4b3e4) {

  return !!(nonzeroU8(flag4b274) != 0 && ptr4b140 != 0 &&

  dword4b3e4 == 0);

}

export function manager959720Host923450Needed(flag4b274, flag4b131) {

  return(nonzeroU8(flag4b274) != 0 && nonzeroU8(flag4b131) != 0)

  ? false : true;

}

export function manager959720JoinArm(flag4b274, flag4b131, flag4b132, dword4b1c0, flag4b19c) {

  let f274 = nonzeroU8(flag4b274) ? 1 : 0;

  let f131 = nonzeroU8(flag4b131) ? 1 : 0;

  if(f274 != 0 && f131 != 0) {

  return A959720_ARM_SEED_THEN;

  }

  if(f274 != 0) {

  return A959720_ARM_HOST_6F5850;

  }

  if(f131 != 0) {

  return A959720_ARM_SEED_ELSE;

  }

  if(nonzeroU8(flag4b132) != 0) {

  return A959720_ARM_4B132;

  }

  if(dword4b1c0 > 0) {

  return A959720_ARM_DAILY;

  }

  if(nonzeroU8(flag4b19c) != 0) {

  return A959720_ARM_DEBUG;

  }

  return A959720_ARM_START;

}

export function manager959720JoinParityIncNeeded(counter) {

  return peSignedMod2Eq1(counter);

}

export function manager959720FlagOfs() {

  return asU32(A959720_FLAG_OFS);

}

export function manager959720ProbeOfs() {

  return asU32(A959720_PROBE_OFS);

}

export function manager959720ParityOfs() {

  return asU32(A959720_PARITY_OFS);

}

export function manager959720QueueBeginOfs() {

  return asU32(A959720_QUEUE_BEGIN_OFS);

}

export function manager959720QueueEndOfs() {

  return asU32(A959720_QUEUE_END_OFS);

}

export function manager959720StateOfs() {

  return asU32(A959720_STATE_OFS);

}

export function manager959720StateAfter() {

  return asU32(A959720_STATE_AFTER);

}

export function manager959720Flag4b131Ofs() {

  return asU32(A959720_FLAG_4B131_OFS);

}

export function manager959720Flag4b132Ofs() {

  return asU32(A959720_FLAG_4B132_OFS);

}

export function manager959720Ptr4b140Ofs() {

  return asU32(A959720_PTR_4B140_OFS);

}

export function manager959720Dword4b3e4Ofs() {

  return asU32(A959720_DWORD_4B3E4_OFS);

}

export function manager959720Recv923450Ofs() {

  return asU32(A959720_RECV_923450_OFS);

}

export function manager959720Dword4b1c0Ofs() {

  return asU32(A959720_DWORD_4B1C0_OFS);

}

export function manager959720Flag4b19cOfs() {

  return asU32(A959720_FLAG_4B19C_OFS);

}

export function manager959720Word4b284Ofs() {

  return asU32(A959720_WORD_4B284_OFS);

}

export function manager959720Word4b284Value() {

  return asU32(A959720_WORD_4B284_VALUE);

}

export function manager959720FlagClear() {

  return asU32(A959720_FLAG_CLEAR);

}

export function manager959720GameAllocSize() {

  return asU32(A959720_GAME_ALLOC_SIZE);

}

export function manager959720ManagerGlobalVa() {

  return asU32(A959720_MANAGER_GLOBAL_VA);

}

export function manager959720GameGlobalVa() {

  return asU32(A959720_GAME_GLOBAL_VA);

}

export function manager959720Host90c400Va() {

  return asU32(A959720_HOST_90C400_VA);

}

export function manager959720Host959670Va() {

  return asU32(A959720_HOST_959670_VA);

}

export function manager959720HostA0f4c0Va() {

  return asU32(A959720_HOST_A0F4C0_VA);

}

export function manager959720Host6f1020Va() {

  return asU32(A959720_HOST_6F1020_VA);

}

export function manager959720Host6f4740Va() {

  return asU32(A959720_HOST_6F4740_VA);

}

export function manager959720Host90a8a0Va() {

  return asU32(A959720_HOST_90A8A0_VA);

}

export function manager959720Host6eef20Va() {

  return asU32(A959720_HOST_6EEF20_VA);

}

export function manager959720Host91c770Va() {

  return asU32(A959720_HOST_91C770_VA);

}

export function manager959720Host923450Va() {

  return asU32(A959720_HOST_923450_VA);

}

export function manager959720Host6f6dd0Va() {

  return asU32(A959720_HOST_6F6DD0_VA);

}

export function manager959720Host6f7750Va() {

  return asU32(A959720_HOST_6F7750_VA);

}

export function manager959720Host6f5320Va() {

  return asU32(A959720_HOST_6F5320_VA);

}

export function manager959720ArmSeedThen() {

  return asU32(A959720_ARM_SEED_THEN);

}

export function manager959720ArmHost6f5850() {

  return asU32(A959720_ARM_HOST_6F5850);

}

export function manager959720ArmSeedElse() {

  return asU32(A959720_ARM_SEED_ELSE);

}

export function manager959720Arm4b132() {

  return asU32(A959720_ARM_4B132);

}

export function manager959720ArmDaily() {

  return asU32(A959720_ARM_DAILY);

}

export function manager959720ArmDebug() {

  return asU32(A959720_ARM_DEBUG);

}

export function manager959720ArmStart() {

  return asU32(A959720_ARM_START);

}

export function manager959720Va() {

  return asU32(A959720_VA);

}

export function manager959720RetVa() {

  return asU32(A959720_RET_VA);

}

export function manager959720BodyBytes() {

  return asU32(A959720_BODY_BYTES);

}

export function manager959720Sites() {

  return asU32(A959720_SITES);

}

export function manager959720SiteVa() {

  return asU32(A959720_SITE_VA);

}

export function manager959720NextVa() {

  return asU32(A959720_NEXT_VA);

}

export function manager959670StateId(state) {

  if(state == C959670_STATE_MENU) {

  return C959670_STATE_MENU;

  }

  if(state == C959670_STATE_GAME) {

  return C959670_STATE_GAME;

  }

  return C959670_STATE_OTHER;

}

export function manager959670State1Needed(state) {

  return(state == C959670_STATE_MENU) ? true : false;

}

export function manager959670State2Needed(state) {

  return(state == C959670_STATE_GAME) ? true : false;

}

export function manager959670GamePresent(gamePtr) {

  return(gamePtr != 0) ? true : false;

}

export function manager959670GameBodyNeeded(state, gamePtr) {

  return !!(manager959670State2Needed(state) != 0 &&

  manager959670GamePresent(gamePtr) != 0);

}

export function manager959670MenuPresent(menuPtr) {

  return(menuPtr != 0) ? true : false;

}

export function manager959670MenuBodyNeeded(state, menuPtr) {

  return !!(manager959670State1Needed(state) != 0 &&

  manager959670MenuPresent(menuPtr) != 0);

}

export function manager959670ExitSaveArg(flag4b284) {

  return asU32(flag4b284 & 0xff);

}

export function manager959670Flag4b285Clear() {

  return asU32(C959670_FLAG_4B285_CLEAR);

}

export function manager959670ValueStoreNeeded(value2a334) {

  return(value2a334 == 1.0) ? false : true;

}

export function manager959670Host429170Recv(gamePtr) {

  return asU32(gamePtr + asU32(C959670_HOST_429170_OFS));

}

export function manager959670StateOfs() {

  return asU32(C959670_STATE_OFS);

}

export function manager959670StateOther() {

  return asU32(C959670_STATE_OTHER);

}

export function manager959670StateMenu() {

  return asU32(C959670_STATE_MENU);

}

export function manager959670StateGame() {

  return asU32(C959670_STATE_GAME);

}

export function manager959670Flag4b284Ofs() {

  return asU32(C959670_FLAG_4B284_OFS);

}

export function manager959670Flag4b285Ofs() {

  return asU32(C959670_FLAG_4B285_OFS);

}

export function manager959670RecvOfs() {

  return asU32(C959670_RECV_OFS);

}

export function manager959670ValueOfs() {

  return asU32(C959670_VALUE_OFS);

}

export function manager959670StepOfs() {

  return asU32(C959670_STEP_OFS);

}

export function manager959670ValueStoreBits() {

  return asU32(C959670_VALUE_STORE_BITS);

}

export function manager959670StepStoreBits() {

  return asU32(C959670_STEP_STORE_BITS);

}

export function manager959670TargetVa() {

  return asU32(C959670_TARGET_VA);

}

export function manager959670GameGlobalVa() {

  return asU32(C959670_GAME_GLOBAL_VA);

}

export function manager959670MenuGlobalVa() {

  return asU32(C959670_MENU_GLOBAL_VA);

}

export function manager959670MenuFreeSize() {

  return asU32(C959670_MENU_FREE_SIZE);

}

export function manager959670MenuClear() {

  return asU32(C959670_MENU_CLEAR);

}

export function manager959670Host429170Ofs() {

  return asU32(C959670_HOST_429170_OFS);

}

export function manager959670Host6fa0c0Va() {

  return asU32(C959670_HOST_6FA0C0_VA);

}

export function manager959670Host92e430Va() {

  return asU32(C959670_HOST_92E430_VA);

}

export function manager959670Host429170Va() {

  return asU32(C959670_HOST_429170_VA);

}

export function manager959670Host986f30Va() {

  return asU32(C959670_HOST_986F30_VA);

}

export function manager959670HostAef15cVa() {

  return asU32(C959670_HOST_AEF15C_VA);

}

export function manager959670EpilogVa() {

  return asU32(C959670_EPILOG_VA);

}

export function manager959670ManagerGlobalVa() {

  return asU32(C959670_MANAGER_GLOBAL_VA);

}

export function manager959670Va() {

  return asU32(C959670_VA);

}

export function manager959670Int3Va() {

  return asU32(C959670_INT3_VA);

}

export function manager959670BodyBytes() {

  return asU32(C959670_BODY_BYTES);

}

export function manager959670FirstRetTrapBytes() {

  return asU32(C959670_FIRST_RET_TRAP_BYTES);

}

export function manager959670Sites() {

  return asU32(C959670_SITES);

}

export function manager959670Site0Va() {

  return asU32(C959670_SITE0_VA);

}

export function manager959670Site1Va() {

  return asU32(C959670_SITE1_VA);

}

export function manager959670Site2Va() {

  return asU32(C959670_SITE2_VA);

}

export function manager959670NextVa() {

  return asU32(C959670_NEXT_VA);

}

export function cutscene95e7c0IdInRange(id) {

  return(id <= asU32(C95E7C0_ID_MAX)) ? true : false;

}

export function cutscene95e7c0UnloadNeeded(state) {

  return(state != 0) ? true : false;

}

export function cutscene95e7c0IdNonzero(id) {

  return(id != 0) ? true : false;

}

export function cutscene95e7c0ShowBodyNeeded(id) {

  return !!(cutscene95e7c0IdInRange(id) != 0 &&

  cutscene95e7c0IdNonzero(id) != 0);

}

export function cutscene95e7c0EntryOfs(index) {

  return asU32(asU32(C95E7C0_ENTRIES_OFS) + asU32(asU32(index) * asU32(C95E7C0_ENTRY_STRIDE)));

}

export function cutscene95e7c0QueueGt1(begin, end) {

  let count = asI32(end - begin) >>  2;

  return(asU32(count) > 1) ? true : false;

}

export function cutscene95e7c0SsoInline(capacity) {

  return(capacity < asU32(C95E7C0_SSO_CAP)) ? true : false;

}

export function cutscene95e7c0IdIs2(id) {

  return(id == asU32(C95E7C0_ID_SPECIAL)) ? true : false;

}

export function cutscene95e7c0GamePresent(gamePtr) {

  return(gamePtr != 0) ? true : false;

}

export function cutscene95e7c0Game1bb88Needed(gamePtr, dword1bb88) {

  return(gamePtr != 0 && dword1bb88 != 0) ? true : false;

}

export function cutscene95e7c0FlagE5Continue(flagE5) {

  return((flagE5 & 0xff) == 0) ? true : false;

}

export function cutscene95e7c0VecCount(begin, end) {

  return asI32(end - begin) >>  2;

}

export function cutscene95e7c0VecLoopNeeded(begin, end) {

  return(cutscene95e7c0VecCount(begin, end) != 0) ? true : false;

}

export function cutscene95e7c0IdMax() {

  return asU32(C95E7C0_ID_MAX);

}

export function cutscene95e7c0EntryCount() {

  return asU32(C95E7C0_ENTRY_COUNT);

}

export function cutscene95e7c0EntryStride() {

  return asU32(C95E7C0_ENTRY_STRIDE);

}

export function cutscene95e7c0EntriesOfs() {

  return asU32(C95E7C0_ENTRIES_OFS);

}

export function cutscene95e7c0StateOfs() {

  return asU32(C95E7C0_STATE_OFS);

}

export function cutscene95e7c0QueuedOfs() {

  return asU32(C95E7C0_QUEUED_OFS);

}

export function cutscene95e7c0SsoCap() {

  return asU32(C95E7C0_SSO_CAP);

}

export function cutscene95e7c0IdSpecial() {

  return asU32(C95E7C0_ID_SPECIAL);

}

export function cutscene95e7c0FlagE5Ofs() {

  return asU32(C95E7C0_FLAG_E5_OFS);

}

export function cutscene95e7c0VecBeginOfs() {

  return asU32(C95E7C0_VEC_BEGIN_OFS);

}

export function cutscene95e7c0VecEndOfs() {

  return asU32(C95E7C0_VEC_END_OFS);

}

export function cutscene95e7c0Game1bb88Ofs() {

  return asU32(C95E7C0_GAME_1BB88_OFS);

}

export function cutscene95e7c0QueueBeginOfs() {

  return asU32(C95E7C0_QUEUE_BEGIN_OFS);

}

export function cutscene95e7c0QueueEndOfs() {

  return asU32(C95E7C0_QUEUE_END_OFS);

}

export function cutscene95e7c0QueueHelperVa() {

  return asU32(C95E7C0_QUEUE_HELPER_VA);

}

export function cutscene95e7c0RecvOfs() {

  return asU32(C95E7C0_RECV_OFS);

}

export function cutscene95e7c0ArgOfs() {

  return asU32(C95E7C0_ARG_OFS);

}

export function cutscene95e7c0MusicIndexOfs() {

  return asU32(C95E7C0_MUSIC_INDEX_OFS);

}

export function cutscene95e7c0MusicStride() {

  return asU32(C95E7C0_MUSIC_STRIDE);

}

export function cutscene95e7c0MusicVolOfs() {

  return asU32(C95E7C0_MUSIC_VOL_OFS);

}

export function cutscene95e7c0MusicRateOfs() {

  return asU32(C95E7C0_MUSIC_RATE_OFS);

}

export function cutscene95e7c0MusicRateBits() {

  return asU32(C95E7C0_MUSIC_RATE_BITS);

}

export function cutscene95e7c0Music2a2ccOfs() {

  return asU32(C95E7C0_MUSIC_2A2CC_OFS);

}

export function cutscene95e7c0Store828Ofs() {

  return asU32(C95E7C0_STORE_828_OFS);

}

export function cutscene95e7c0Store838Ofs() {

  return asU32(C95E7C0_STORE_838_OFS);

}

export function cutscene95e7c0Store838Value() {

  return asU32(C95E7C0_STORE_838_VALUE);

}

export function cutscene95e7c0StateAfter() {

  return asU32(C95E7C0_STATE_AFTER);

}

export function cutscene95e7c0ManagerGlobalVa() {

  return asU32(C95E7C0_MANAGER_GLOBAL_VA);

}

export function cutscene95e7c0GameGlobalVa() {

  return asU32(C95E7C0_GAME_GLOBAL_VA);

}

export function cutscene95e7c0Host960840Va() {

  return asU32(C95E7C0_HOST_960840_VA);

}

export function cutscene95e7c0Host40e910Va() {

  return asU32(C95E7C0_HOST_40E910_VA);

}

export function cutscene95e7c0HostA112c0Va() {

  return asU32(C95E7C0_HOST_A112C0_VA);

}

export function cutscene95e7c0Host95ead0Va() {

  return asU32(C95E7C0_HOST_95EAD0_VA);

}

export function cutscene95e7c0Host91c7e0Va() {

  return asU32(C95E7C0_HOST_91C7E0_VA);

}

export function cutscene95e7c0Host8fd750Va() {

  return asU32(C95E7C0_HOST_8FD750_VA);

}

export function cutscene95e7c0Host4239b0Va() {

  return asU32(C95E7C0_HOST_4239B0_VA);

}

export function cutscene95e7c0Host6eef60Va() {

  return asU32(C95E7C0_HOST_6EEF60_VA);

}

export function cutscene95e7c0Va() {

  return asU32(C95E7C0_VA);

}

export function cutscene95e7c0RetVa() {

  return asU32(C95E7C0_RET_VA);

}

export function cutscene95e7c0OobRetVa() {

  return asU32(C95E7C0_OOB_RET_VA);

}

export function cutscene95e7c0Int3Va() {

  return asU32(C95E7C0_INT3_VA);

}

export function cutscene95e7c0BodyBytes() {

  return asU32(C95E7C0_BODY_BYTES);

}

export function cutscene95e7c0FirstRetTrapBytes() {

  return asU32(C95E7C0_FIRST_RET_TRAP_BYTES);

}

export function cutscene95e7c0Sites() {

  return asU32(C95E7C0_SITES);

}

export function cutscene95e7c0SiteVa() {

  return asU32(C95E7C0_SITE_VA);

}

export function cutscene95e7c0NextVa() {

  return asU32(C95E7C0_NEXT_VA);

}

export function nightmare921ce0PlayersCount(begin, end) {

  return asI32(end - begin) >>  2;

}

export function nightmare921ce0PlayersLogNeeded(begin, end) {

  return!!(nightmare921ce0PlayersCount(begin, end) == 0);

}

export function nightmare921ce0MapPresent(isnil0d, key10) {

  return inputMapNodePresent(isnil0d, asI32(key10),

  C921CE0_MAP_KEY);

}

export function nightmare921ce0MapFound(node, end) {

  return!!(node != end);

}

export function nightmare921ce0StrncmpOk(result) {

  return!!(result == 0);

}

export function nightmare921ce0GfxNeeded(isnil0d, key10, node, end, strncmpResult) {

  return!!(nightmare921ce0MapPresent(isnil0d, key10) != 0 &&

  nightmare921ce0MapFound(node, end) != 0 &&

  nightmare921ce0StrncmpOk(strncmpResult) != 0);

}

export function nightmare921ce0SsoInline(capacity) {

  return!!(capacity < asU32(C921CE0_SSO_CAP));

}

export function nightmare921ce0SpriteOfs(index) {

  return asU32(asU32(index) * asU32(C921CE0_SPRITE_STRIDE));

}

export function nightmare921ce0Dogma(flag5e8) {

  return!!((flag5e8 & 0xff) != 0);

}

export function nightmare921ce0CollectiblePathNeeded(flag5e8) {

  return!!(nightmare921ce0Dogma(flag5e8) == 0);

}

export function nightmare921ce0Flag4b1Continue(flag4b1) {

  return!!((flag4b1 & 0xff) == 0);

}

export function nightmare921ce0BoolArg(unk) {

  return asU32(unk & 0xff);

}

export function nightmare921ce0MusicId(flag5e8) {

  return(nightmare921ce0Dogma(flag5e8) != 0)

  ? asU32(C921CE0_MUSIC_ID_DOGMA)

  : asU32(C921CE0_MUSIC_ID_NORMAL);

}

export function nightmare921ce0StageIsC(stage) {

  return!!(stage == asU32(C921CE0_STAGE_C));

}

export function nightmare921ce0StageIsD(stage) {

  return!!(stage == asU32(C921CE0_STAGE_D));

}

export function nightmare921ce0OwnerPresent(eax) {

  return!!(eax != 0);

}

export function nightmare921ce0MapKey() {

  return asU32(C921CE0_MAP_KEY);

}

export function nightmare921ce0MapIsnilOfs() {

  return asU32(C921CE0_MAP_ISNIL_OFS);

}

export function nightmare921ce0MapKeyOfs() {

  return asU32(C921CE0_MAP_KEY_OFS);

}

export function nightmare921ce0MapOfs() {

  return asU32(C921CE0_MAP_OFS);

}

export function nightmare921ce0PlayersBeginOfs() {

  return asU32(C921CE0_PLAYERS_BEGIN_OFS);

}

export function nightmare921ce0PlayersEndOfs() {

  return asU32(C921CE0_PLAYERS_END_OFS);

}

export function nightmare921ce0SsoCap() {

  return asU32(C921CE0_SSO_CAP);

}

export function nightmare921ce0StrncmpN() {

  return asU32(C921CE0_STRNCMP_N);

}

export function nightmare921ce0SpriteStride() {

  return asU32(C921CE0_SPRITE_STRIDE);

}

export function nightmare921ce0IndexOfs() {

  return asU32(C921CE0_INDEX_OFS);

}

export function nightmare921ce0TableOfs() {

  return asU32(C921CE0_TABLE_OFS);

}

export function nightmare921ce0BaseOfs() {

  return asU32(C921CE0_BASE_OFS);

}

export function nightmare921ce0DogmaOfs() {

  return asU32(C921CE0_DOGMA_OFS);

}

export function nightmare921ce0BoolStoreOfs() {

  return asU32(C921CE0_BOOL_STORE_OFS);

}

export function nightmare921ce0Flag4b1Ofs() {

  return asU32(C921CE0_FLAG_4B1_OFS);

}

export function nightmare921ce0Flag4bcOfs() {

  return asU32(C921CE0_FLAG_4BC_OFS);

}

export function nightmare921ce0Flag4bcClear() {

  return asU32(C921CE0_FLAG_4BC_CLEAR);

}

export function nightmare921ce0Flag4bcSet() {

  return asU32(C921CE0_FLAG_4BC_SET);

}

export function nightmare921ce0MusicIdNormal() {

  return asU32(C921CE0_MUSIC_ID_NORMAL);

}

export function nightmare921ce0MusicIdDogma() {

  return asU32(C921CE0_MUSIC_ID_DOGMA);

}

export function nightmare921ce0MusicRecvOfs() {

  return asU32(C921CE0_MUSIC_RECV_OFS);

}

export function nightmare921ce0MusicVolOfs() {

  return asU32(C921CE0_MUSIC_VOL_OFS);

}

export function nightmare921ce0StageC() {

  return asU32(C921CE0_STAGE_C);

}

export function nightmare921ce0StageD() {

  return asU32(C921CE0_STAGE_D);

}

export function nightmare921ce0CollectibleId() {

  return asU32(C921CE0_COLLECTIBLE_ID);

}

export function nightmare921ce0LazTag() {

  return asU32(C921CE0_LAZ_TAG);

}

export function nightmare921ce0Anm2LoadGraphics() {

  return asU32(C921CE0_ANM2_LOAD_GRAPHICS);

}

export function nightmare921ce0Store3a4Ofs() {

  return asU32(C921CE0_STORE_3A4_OFS);

}

export function nightmare921ce0Store3a4Value() {

  return asU32(C921CE0_STORE_3A4_VALUE);

}

export function nightmare921ce0LogLevel() {

  return asU32(C921CE0_LOG_LEVEL);

}

export function nightmare921ce0LogMsgVa() {

  return asU32(C921CE0_LOG_MSG_VA);

}

export function nightmare921ce0PathVa() {

  return asU32(C921CE0_PATH_VA);

}

export function nightmare921ce0IatStrncmpVa() {

  return asU32(C921CE0_IAT_STRNCMP_VA);

}

export function nightmare921ce0GameGlobalVa() {

  return asU32(C921CE0_GAME_GLOBAL_VA);

}

export function nightmare921ce0ManagerGlobalVa() {

  return asU32(C921CE0_MANAGER_GLOBAL_VA);

}

export function nightmare921ce0RecvOfs() {

  return asU32(C921CE0_RECV_OFS);

}

export function nightmare921ce0ArgOfs() {

  return asU32(C921CE0_ARG_OFS);

}

export function nightmare921ce0G3Ofs() {

  return asU32(C921CE0_G3_OFS);

}

export function nightmare921ce0HostA112c0Va() {

  return asU32(C921CE0_HOST_A112C0_VA);

}

export function nightmare921ce0Host4288a0Va() {

  return asU32(C921CE0_HOST_4288A0_VA);

}

export function nightmare921ce0Host4074c0Va() {

  return asU32(C921CE0_HOST_4074C0_VA);

}

export function nightmare921ce0Host40bd50Va() {

  return asU32(C921CE0_HOST_40BD50_VA);

}

export function nightmare921ce0Host407f10Va() {

  return asU32(C921CE0_HOST_407F10_VA);

}

export function nightmare921ce0Host9be080Va() {

  return asU32(C921CE0_HOST_9BE080_VA);

}

export function nightmare921ce0Host7e1d50Va() {

  return asU32(C921CE0_HOST_7E1D50_VA);

}

export function nightmare921ce0HostAef15cVa() {

  return asU32(C921CE0_HOST_AEF15C_VA);

}

export function nightmare921ce0HostA0f4c0Va() {

  return asU32(C921CE0_HOST_A0F4C0_VA);

}

export function nightmare921ce0Va() {

  return asU32(C921CE0_VA);

}

export function nightmare921ce0RetVa() {

  return asU32(C921CE0_RET_VA);

}

export function nightmare921ce0Int3Va() {

  return asU32(C921CE0_INT3_VA);

}

export function nightmare921ce0BodyBytes() {

  return asU32(C921CE0_BODY_BYTES);

}

export function nightmare921ce0FirstRetTrapBytes() {

  return asU32(C921CE0_FIRST_RET_TRAP_BYTES);

}

export function nightmare921ce0Sites() {

  return asU32(C921CE0_SITES);

}

export function nightmare921ce0SiteVa() {

  return asU32(C921CE0_SITE_VA);

}

export function nightmare921ce0SiblingVa() {

  return asU32(C921CE0_SIBLING_VA);

}

export function nightmare921ce0NextVa() {

  return asU32(C921CE0_NEXT_VA);

}

export function fco9be080TwinWalkFlag(lazByte, itemPtr, itemFlagsB8) {

  return!!(((lazByte & 0xff) != 0) && (itemPtr != 0) && ((itemFlagsB8 & asU32(C9BE080_TWIN_BIT)) != 0));

}

export function fco9be080ListEmpty(begin, end) {

  return!!(begin == end);

}

export function fco9be080SlotCheckable(playerField2c) {

  return!!(playerField2c == 0);

}

export function fco9be080HasCollectibleHit(alByte) {

  return!!((alByte & 0xff) != 0);

}

export function fco9be080TwinPresent(twinPtr) {

  return!!(twinPtr != 0);

}

export function fco9be080TwinCheckNeeded(sharedFlag, twinPtr) {

  return!!(sharedFlag != 0 && twinPtr != 0);

}

export function fco9be080WalkNext(iter) {

  return asU32(asU32(iter) + asU32(C9BE080_LIST_STRIDE));

}

export function fco9be080WalkContinue(nextIter, listEnd) {

  return!!(nextIter != listEnd);

}

export function fco9be080ResultPlayer(playerPtr) {

  return asU32(playerPtr);

}

export function fco9be080ResultTwin(twinPtr) {

  return asU32(twinPtr);

}

export function fco9be080ResultNotFound() {

  return asU32(0);

}

export function fco9be080ItemConfigOfs() {

  return asU32(C9BE080_ITEM_CONFIG_OFS);

}

export function fco9be080GetCollectibleVa() {

  return asU32(C9BE080_HOST_GET_COLLECTIBLE_VA);

}

export function fco9be080HasCollectibleVa() {

  return asU32(C9BE080_HOST_HAS_COLLECTIBLE_VA);

}

export function fco9be080ItemFlagsOfs() {

  return asU32(C9BE080_ITEM_FLAGS_OFS);

}

export function fco9be080TwinBit() {

  return asU32(C9BE080_TWIN_BIT);

}

export function fco9be080ListBeginOfs() {

  return asU32(C9BE080_LIST_BEGIN_OFS);

}

export function fco9be080ListEndOfs() {

  return asU32(C9BE080_LIST_END_OFS);

}

export function fco9be080ListStride() {

  return asU32(C9BE080_LIST_STRIDE);

}

export function fco9be080SlotFlagOfs() {

  return asU32(C9BE080_SLOT_FLAG_OFS);

}

export function fco9be080TwinPtrOfs() {

  return asU32(C9BE080_TWIN_PTR_OFS);

}

export function fco9be080LazArgOfs() {

  return asU32(C9BE080_LAZ_ARG_OFS);

}

export function fco9be080ManagerGlobalVa() {

  return asU32(C9BE080_MANAGER_GLOBAL_VA);

}

export function fco9be080Va() {

  return asU32(C9BE080_VA);

}

export function fco9be080RetVa() {

  return asU32(C9BE080_RET_VA);

}

export function fco9be080FirstRetVa() {

  return asU32(C9BE080_FIRST_RET_VA);

}

export function fco9be080Int3Va() {

  return asU32(C9BE080_INT3_VA);

}

export function fco9be080BodyBytes() {

  return asU32(C9BE080_BODY_BYTES);

}

export function fco9be080Sites() {

  return asU32(C9BE080_SITES);

}

export function fco9be080SiteVa() {

  return asU32(C9BE080_SITE_VA);

}

export function fco9be080Site2Va() {

  return asU32(C9BE080_SITE2_VA);

}

export function fco9be080NextVa() {

  return asU32(C9BE080_NEXT_VA);

}

export function managerPollA6de60ButtonSlotShift(slot) {

  const kShifts = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0xc, 0xd, 0xe, 0xf, 0xa];

  if (asU32(slot) >= 15) return 0xffffffff;

  return asU32(kShifts[asU32(slot)]);

}

export function managerPollA6de60ButtonBit(stateWord, shift) {

  return (asU32(stateWord) >>> (asU32(shift) & 31)) & 1;

}

/* v109 dedupe: inputMask6f9400 / inputMask6f9400Full / inputMask6f95a0
   removed (owned by render-shell; see the INPUT_MASK_6F9400_HOST_VA
   comment above). */

export function inputGetDeviceTypeRanges(controlleridx, rangesOrStarts, counts) {

  if (!rangesOrStarts || rangesOrStarts.length === 0) return false;

  if (typeof rangesOrStarts[0] === "object" && rangesOrStarts[0] !== null && "start" in rangesOrStarts[0]) {

    for (const r of rangesOrStarts) {

      if (inputDeviceRangeContains(controlleridx, r.start, r.count)) return true;

    }

    return false;

  }

  const starts = rangesOrStarts;

  const cnts = counts || [];

  for (let i = 0; i < starts.length; i++) {

    if (inputDeviceRangeContains(controlleridx, starts[i], cnts[i])) return true;

  }

  return false;

}

export function managerPollA6de60HookRepack(

  srcU16_4, srcU8_6, srcU8_7, srcU16_8, srcU16_a, srcU16_c, srcU16_e,

) {

  return [

    managerPollA6de60HookRepackDw0(srcU16_4, srcU8_6, srcU8_7),

    managerPollA6de60HookRepackDw1(srcU16_8, srcU16_a),

    managerPollA6de60HookRepackDw2(srcU16_c, srcU16_e),

  ];

}

export function managerPollA648b0TrackerSubSize(trackerLo, trackerHi, size) {

  const lo = asU32(asU32(trackerLo) - asU32(size));

  const borrow = asU32(trackerLo) < asU32(size) ? 1 : 0;

  const hi = asU32(asU32(trackerHi) - borrow);

  return { lo, hi };

}

export function managerPollA648b0TrackerAdd(trackerLo, trackerHi, addLo, addHi) {

  const lo = asU32(asU32(trackerLo) + asU32(addLo));

  const carry = lo < asU32(trackerLo) ? 1 : 0;

  const hi = asU32(asU32(trackerHi) + asU32(addHi) + carry);

  return { lo, hi };

}

export function managerPollA1f280ScaleTick(seedLo, seedHi) {

  const scaled = a1f280ScaleTickU64(seedLo, seedHi);

  return { lo: Number(scaled & 0xffffffffn) >>> 0, hi: Number(scaled >> 32n) >>> 0 };

}

export function managerPollA1f280TickDelta(scaledLo, scaledHi, baseLo, baseHi) {

  const delta = a1f280U64(scaledLo, scaledHi) - a1f280U64(baseLo, baseHi);

  const u = BigInt.asUintN(64, delta);

  return { lo: Number(u & 0xffffffffn) >>> 0, hi: Number(u >> 32n) >>> 0 };

}

export function managerPollA1f280RumbleVcallArgs(timer, savedIntensity) {

  return {

    timer: managerPollA1f280RumbleVcallTimer(timer),

    intensity: managerPollA1f280RumbleVcallIntensity(timer, savedIntensity),

  };

}

export function managerPollA1f280BaselineStore(scaledLo, scaledHi) {

  return { lo: asU32(scaledLo), hi: asU32(scaledHi) };

}

export function managerPollA6da10TeardownPlan(enableByte) {

  const steps = [];

  if (managerPollA6da10FreeComMaps(enableByte)) {

    steps.push(

      A6DA10_STEP_COM_RELEASE,

      A6DA10_STEP_FREE_STATE_MAP_A,

      A6DA10_STEP_FREE_STATE_MAP_B,

      A6DA10_STEP_FREE_DEV_NAME,

    );

  }

  steps.push(

    A6DA10_STEP_FREE_STATE,

    A6DA10_STEP_FREE_DEV_BUF_A,

    A6DA10_STEP_FREE_DEV_BUF_B,

    A6DA10_STEP_FREE_DEV,

  );

  return steps;

}

export function managerPollA6dab0AxisCallocArgs(axisCount) {

  return { num: asU32(A6DAB0_AXIS_ELEM_BYTES), size: asU32(axisCount) };

}

export function managerPollA6dab0ButtonCallocArgs(buttonCount) {

  return { num: asU32(A6DAB0_BUTTON_ELEM_BYTES), size: asU32(buttonCount) };

}

export const A68490_NS_SCALE = 1e9;

export function managerShellAngleWrapBaseOfs() { return asU32(SHELL_ANGLE_BASE_OFS); }

export function managerShellAngleWrapSlotStride() { return asU32(SHELL_ANGLE_SLOT_STRIDE); }

export function managerShellAngleWrapSlotCount() { return asU32(SHELL_ANGLE_SLOT_COUNT); }

export function managerShellAngleWrapCountEndOfs() { return asU32(SHELL_ANGLE_COUNT_END_OFS); }

export function managerShellAngleWrapCountBeginOfs() { return asU32(SHELL_ANGLE_COUNT_BEGIN_OFS); }

export function managerPrepollCopySrcDw() { return managerPrepollCopySrcDword(); }

export function managerPrepollState3ArmByteOfs() { return managerPrepollState3armByteOfs(); }

/* ---- ABI v34: PlayerManager::RandomCollectibleOwner (0x009be140) pure
   islands, mirrored from a documented extract with the family's
   machine-exact conventions. Host leaves: 0x007706e0 HasCollectible
   (address-stable), 0x00a112c0 assert log, the int3 trap @ 0x009be1b1. ---- */
export function rco9be140ListEmpty(begin, end) {
  return!!(begin == end);
}
export function rco9be140SlotCheckable(playerField2c) {
  return!!(playerField2c == 0);
}
export function rco9be140HasCollectibleHit(alByte) {
  return!!((alByte & 0xff) != 0);
}
export function rco9be140SeedAssertNeeded(seed) {
  return!!(seed == 0);
}
export function rco9be140XorshiftState(seed, shift1, shift2, shift3) {
  const s1 = (shift1 & 0xff) & 0x1f;
  const s2 = (shift2 & 0xff) & 0x1f;
  const s3 = (shift3 & 0xff) & 0x1f;
  const t1 = (asU32(seed) ^ (asU32(seed) >>> s1)) >>> 0;
  const t2 = (t1 ^ (t1 << s2)) >>> 0;
  return (t2 ^ (t2 >>> s3)) >>> 0;
}
export function rco9be140StateAsF64(state) {
  return Number(asU32(state));
}
export function rco9be140NextFloat(state) {
  return Math.fround(Math.fround(Number(asU32(state))) * f32FromBits(RCO9BE140_SCALE_BITS));
}
export function rco9be140BestUpdateNeeded(candidate, best) {
  return!!(candidate > best);
}
export function rco9be140WalkNext(iter) {
  return asU32(asU32(iter) + asU32(RCO9BE140_LIST_STRIDE));
}
export function rco9be140WalkContinue(nextIter, listEnd) {
  return!!(nextIter != listEnd);
}
export function rco9be140OutPresent(outPtr) {
  return!!(outPtr != 0);
}
export function rco9be140WinnerPresent(bestPlayer) {
  return!!(bestPlayer != 0);
}
export function rco9be140IdNegative(collectibleId) {
  /* PE 0x009be223 jns — SIGNED: 0x80000000 (positive in JS) is negative. */
  return !!((collectibleId | 0) < 0);
}
export function rco9be140CollectibleCount(end, begin) {
  return ((asU32(end) - asU32(begin)) | 0) >> 4;
}
export function rco9be140CollectibleIdOob(id, count) {
  return!!(id >= count);
}
export function rco9be140CollectibleCountMinus1(count) {
  return asU32(asU32(count) - 1);
}
export function rco9be140CollectibleIndexClamp(id, countMinus1) {
  return asU32(countMinus1) < asU32(id) ? asU32(countMinus1) : asU32(id);
}
export function rco9be140CollectibleEntryPtr(base, index) {
  return asU32(asU32(base) + ((asU32(index) << 4) >>> 0));
}
export function rco9be140ResultPlayer(bestPlayer) {
  return asU32(bestPlayer);
}
export function rco9be140ListBeginOfs() { return asU32(RCO9BE140_LIST_BEGIN_OFS); }
export function rco9be140ListEndOfs() { return asU32(RCO9BE140_LIST_END_OFS); }
export function rco9be140ListStride() { return asU32(RCO9BE140_LIST_STRIDE); }
export function rco9be140SlotFlagOfs() { return asU32(RCO9BE140_SLOT_FLAG_OFS); }
export function rco9be140CollectBeginOfs() { return asU32(RCO9BE140_COLLECT_BEGIN_OFS); }
export function rco9be140CollectEndOfs() { return asU32(RCO9BE140_COLLECT_END_OFS); }
export function rco9be140CollectStride() { return asU32(RCO9BE140_COLLECT_STRIDE); }
export function rco9be140SeedAssertMsgVa() { return asU32(RCO9BE140_SEED_ASSERT_MSG_VA); }
export function rco9be140OobAssertMsgVa() { return asU32(RCO9BE140_OOB_ASSERT_MSG_VA); }
export function rco9be140LogLevel() { return asU32(RCO9BE140_LOG_LEVEL); }
export function rco9be140AssertTrapVa() { return asU32(RCO9BE140_ASSERT_TRAP_VA); }
export function rco9be140HasCollectibleVa() { return asU32(RCO9BE140_HOST_HAS_COLLECTIBLE_VA); }
export function rco9be140HostLogVa() { return asU32(RCO9BE140_HOST_LOG_VA); }
export function rco9be140GameGlobalVa() { return asU32(RCO9BE140_GAME_GLOBAL_VA); }
export function rco9be140ReceiverOfs() { return asU32(RCO9BE140_RECEIVER_OFS); }
export function rco9be140RngShiftTableVa() { return asU32(RCO9BE140_RNG_SHIFT_TABLE_VA); }
export function rco9be140RngShift1() { return asU32(RCO9BE140_RNG_SHIFT1); }
export function rco9be140RngShift2() { return asU32(RCO9BE140_RNG_SHIFT2); }
export function rco9be140RngShift3() { return asU32(RCO9BE140_RNG_SHIFT3); }
export function rco9be140BestInitBits() { return asU32(RCO9BE140_BEST_INIT_BITS); }
export function rco9be140ScaleBits() { return asU32(RCO9BE140_SCALE_BITS); }
export function rco9be140SignCorrTableVa() { return asU32(RCO9BE140_SIGN_CORR_TABLE_VA); }
export function rco9be140BestInitValue() { return -1.0; }
export function rco9be140ScaleValue() { return f32FromBits(RCO9BE140_SCALE_BITS); }
export function rco9be140Va() { return asU32(RCO9BE140_VA); }
export function rco9be140RetVa() { return asU32(RCO9BE140_RET_VA); }
export function rco9be140FirstRetVa() { return asU32(RCO9BE140_FIRST_RET_VA); }
export function rco9be140Int3Va() { return asU32(RCO9BE140_INT3_VA); }
export function rco9be140BodyBytes() { return asU32(RCO9BE140_BODY_BYTES); }
export function rco9be140Sites() { return asU32(RCO9BE140_SITES); }
export function rco9be140NextVa() { return asU32(RCO9BE140_NEXT_VA); }

/* ---- ABI v35: 0x009be2a0 pure islands.  All gates re-derived from this
   PE body (same walk facts as FCO/RCO, independent oracle per family
   convention).  Host leaves: 0x00771550 HasCollectible x2, 0x0065cf80
   twin-get for *out, 0x00a112c0 OOB log. ---- */
export function a9be2a0PlayersCount(end, begin) {
  /* 0x009be2bf sub eax,edx; 0x009be2c3 sar eax,2.  32-bit wrap, signed. */
  return ((asU32(end) - asU32(begin)) | 0) >> 2;
}
export function a9be2a0IdMask15(id) {
  /* 0x009be2c6 and ecx,0x7fff.  15-bit mask on the collectible id. */
  return asU32(id) & 0x7fff;
}
export function a9be2a0DirectIndexOor(maskedId, count) {
  /* 0x009be2cf cmp ecx,eax / 0x009be2d1 jge 0x9be2d8.  SIGNED: the xor eax
     (player=0) arm runs when maskedId >= count. */
  return !!((maskedId | 0) >= (count | 0));
}
export function a9be2a0DirectPlayerPtr(begin, maskedId) {
  /* 0x009be2d3 mov eax,[edx+ecx*4].  begin + maskedId*4, 32-bit wrap. */
  return asU32(asU32(begin) + ((asU32(maskedId) << 2) >>> 0));
}
export function a9be2a0TwinFlag(arg3Byte, playerPresent, flagsB8) {
  /* 0x009be2da..0x009be2f8: arg3 byte && player!=0 && bit31 of [player+0xb8].
     The 1/0 store to [ebp+0x13] is decided by the jne falling through. */
  return !!(
    ((arg3Byte & 0xff) != 0) &&
    (playerPresent != 0) &&
    ((asU32(flagsB8) & 0x80000000) != 0)
  );
}
export function a9be2a0ListEmpty(begin, end) {
  /* 0x009be2fc/0x009be2fe cmp esi,[edi+4] / je not-found.  FULL dword. */
  return !!(begin == end);
}
export function a9be2a0SlotCheckable(playerField2c) {
  /* 0x009be307 cmp dword [edi+0x2c],0 / jne skip.  FULL dword. */
  return !!(playerField2c == 0);
}
export function a9be2a0HasCollectibleHit(alByte) {
  /* 0x009be317 test al,al / jne player-hit.  LOW byte only. */
  return !!((alByte & 0xff) != 0);
}
export function a9be2a0TwinCheckNeeded(twinFlag, twinPtr) {
  /* 0x009be31b cmp byte [ebp+0x13],al / je skip; 0x009be320 test ecx,ecx
     / je skip.  flag!=0 AND twin!=0 (both full dword; al==0 there). */
  return !!((twinFlag != 0) && (twinPtr != 0));
}
export function a9be2a0WalkNext(iter) {
  /* 0x009be339 add esi,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(A9BE2A0_LIST_STRIDE));
}
export function a9be2a0WalkContinue(nextIter, listEnd) {
  /* 0x009be33c cmp esi,[eax+4] / jne loop.  End re-read from this each
     iteration ([ebp-4] hold).  FULL dword. */
  return !!(nextIter != listEnd);
}
export function a9be2a0OutPresent(outPtr) {
  /* 0x009be341 / 0x009be35c / 0x009be380 test out / je.  FULL dword. */
  return !!(outPtr != 0);
}
export function a9be2a0IdNegative(collectibleId) {
  /* 0x009be384 test ebx,ebx / 0x009be386 js 0x9be39b.  SIGNED. */
  return !!((collectibleId | 0) < 0);
}
export function a9be2a0CollectCount(end, begin) {
  /* 0x009be38e sub eax,[edi+0x177c]; 0x009be394 sar eax,4.  Signed SAR,
     16-byte entries. */
  return ((asU32(end) - asU32(begin)) | 0) >> 4;
}
export function a9be2a0IdOob(id, count) {
  /* 0x009be397 cmp ebx,eax / 0x009be399 jl 0x9be3aa.  SIGNED: the assert
     log runs when id >= count (flow then continues to the clamp). */
  return !!((id | 0) >= (count | 0));
}
export function a9be2a0LogNeeded(id, count) {
  /* 0x009be386 js log (id<0) OR 0x009be399 jl not-taken (id>=count). */
  return a9be2a0IdNegative(id) || a9be2a0IdOob(id, count);
}
export function a9be2a0CollectCountMinus1(count) {
  /* 0x009be3bd dec edx.  Wrap-safe. */
  return asU32(asU32(count) - 1);
}
export function a9be2a0CollectIndexClamp(id, countMinus1) {
  /* 0x009be3be cmp eax,ebx / sbb / and / 0x009be3c4 cmp / 0x009be3c6
     cmovb.  The idiom collapses to UNSIGNED min(id, count-1) for every
     id (id==0 -> 0 -> min is 0; id!=0 -> id -> min). */
  return asU32(countMinus1) < asU32(id) ? asU32(countMinus1) : asU32(id);
}
export function a9be2a0CollectEntryPtr(base, index) {
  /* 0x009be3c9 shl edx,4; 0x009be3cc add edx,ecx.  base + index*16 wrap. */
  return asU32(asU32(base) + ((asU32(index) << 4) >>> 0));
}
export function a9be2a0TwinResult(twinPtr) {
  /* 0x009be36e mov eax,[edi+0x1e6c] -- twin-hit return value. */
  return asU32(twinPtr);
}
export function a9be2a0ResultNotFound() {
  /* 0x009be34e xor eax,eax -- not-found tail return. */
  return 0;
}
export function a9be2a0ResultPlayer(player) {
  /* 0x009be3d0 mov eax,edi -- player-hit return value. */
  return asU32(player);
}
export function a9be2a0StoreZeroValue() {
  /* 0x009be348 mov dword [eax],0 -- not-found *out store. */
  return 0;
}
export function a9be2a0PlayersBeginOfs() { return asU32(A9BE2A0_PLAYERS_BEGIN_OFS); }
export function a9be2a0PlayersEndOfs() { return asU32(A9BE2A0_PLAYERS_END_OFS); }
export function a9be2a0ListBeginOfs() { return asU32(A9BE2A0_LIST_BEGIN_OFS); }
export function a9be2a0ListEndOfs() { return asU32(A9BE2A0_LIST_END_OFS); }
export function a9be2a0ListStride() { return asU32(A9BE2A0_LIST_STRIDE); }
export function a9be2a0SlotFlagOfs() { return asU32(A9BE2A0_SLOT_FLAG_OFS); }
export function a9be2a0ItemFlagsOfs() { return asU32(A9BE2A0_ITEM_FLAGS_OFS); }
export function a9be2a0TwinBit() { return asU32(A9BE2A0_TWIN_BIT); }
export function a9be2a0TwinPtrOfs() { return asU32(A9BE2A0_TWIN_PTR_OFS); }
export function a9be2a0CollectBeginOfs() { return asU32(A9BE2A0_COLLECT_BEGIN_OFS); }
export function a9be2a0CollectEndOfs() { return asU32(A9BE2A0_COLLECT_END_OFS); }
export function a9be2a0CollectStride() { return asU32(A9BE2A0_COLLECT_STRIDE); }
export function a9be2a0IdMask() { return asU32(A9BE2A0_ID_MASK); }
export function a9be2a0ManagerGlobalVa() { return asU32(A9BE2A0_MANAGER_GLOBAL_VA); }
export function a9be2a0GameGlobalVa() { return asU32(A9BE2A0_GAME_GLOBAL_VA); }
export function a9be2a0ReceiverOfs() { return asU32(A9BE2A0_RECEIVER_OFS); }
export function a9be2a0HasCollectibleVa() { return asU32(A9BE2A0_HOST_HAS_COLLECTIBLE_VA); }
export function a9be2a0TwinGetVa() { return asU32(A9BE2A0_HOST_TWIN_GET_VA); }
export function a9be2a0HostLogVa() { return asU32(A9BE2A0_HOST_LOG_VA); }
export function a9be2a0OobMsgVa() { return asU32(A9BE2A0_OOB_MSG_VA); }
export function a9be2a0LogLevel() { return asU32(A9BE2A0_LOG_LEVEL); }
export function a9be2a0Va() { return asU32(A9BE2A0_VA); }
export function a9be2a0RetVa() { return asU32(A9BE2A0_RET_VA); }
export function a9be2a0FirstRetVa() { return asU32(A9BE2A0_FIRST_RET_VA); }
export function a9be2a0Int3Va() { return asU32(A9BE2A0_INT3_VA); }
export function a9be2a0BodyBytes() { return asU32(A9BE2A0_BODY_BYTES); }
export function a9be2a0Sites() { return asU32(A9BE2A0_SITES); }
export function a9be2a0SiteVa() { return asU32(A9BE2A0_SITE_VA); }
export function a9be2a0NextVa() { return asU32(A9BE2A0_NEXT_VA); }

/* ---- ABI v36: 0x009be3e0 RandomTrinketOwner pure islands.  All gates
   re-derived from this PE body (v34 RCO draw shape + v35 leaf/vector
   offsets; independent oracle per family convention).  Host leaves:
   0x00771550 HasCollectible x1, 0x00a112c0 assert log x2 (seed / OOB),
   int3 trap @ 0x009be451 after the seed assert. ---- */
export function rto9be3e0ListEmpty(begin, end) {
  /* 0x009be3f9 cmp esi,[this+4] / 0x009be418 je 0x9be4ba.  FULL dword. */
  return!!(begin == end);
}
export function rto9be3e0SlotCheckable(playerField2c) {
  /* 0x009be423 cmp dword [player+0x2c],0 / 0x009be427 jne skip.  FULL dword. */
  return!!(playerField2c == 0);
}
export function rto9be3e0HasCollectibleHit(alByte) {
  /* 0x009be437 test al,al / 0x009be439 je advance.  RAW uint32, low byte. */
  return!!((alByte & 0xff) != 0);
}
export function rto9be3e0SeedAssertNeeded(seed) {
  /* 0x009be43e test edx,edx / 0x009be440 jne 0x9be455.  FULL dword;
     seed==0 -> a112c0(0x10, 0xb6bf54) + int3 @ 0x009be451 (the 0x009be452
     reload is dead). */
  return!!(seed == 0);
}
export function rto9be3e0XorshiftState(seed, shift1, shift2, shift3) {
  /* 0x009be455..0x009be46e.  Shift counts are cl = LOW BYTE of the table
     dword, masked to 5 bits by the hardware.  Same table as v34 (3/5/20). */
  const s1 = (shift1 & 0xff) & 0x1f;
  const s2 = (shift2 & 0xff) & 0x1f;
  const s3 = (shift3 & 0xff) & 0x1f;
  const t1 = (seed ^ (seed >>> s1)) >>> 0;
  const t2 = (t1 ^ ((t1 << s2) >>> 0)) >>> 0;
  return (t2 ^ (t2 >>> s3)) >>> 0;
}
export function rto9be3e0StateAsF64(state) {
  /* 0x009be476 cvtdq2pd + 0x009be481 addsd [sign*8 + 0xbacb00] ==
     (double)u32 for every state. */
  return Number(asU32(state));
}
export function rto9be3e0NextFloat(state) {
  /* 0x009be48d cvtpd2ps then 0x009be491 mulss [0xba9ff0]. */
  return Math.fround(Math.fround(Number(asU32(state))) *
                     f32FromBits(RTO9BE3E0_SCALE_BITS));
}
export function rto9be3e0BestUpdateNeeded(candidate, best) {
  /* 0x009be499 comiss / 0x009be49d jbe keeps old: update iff ordered &&
     candidate > best (NaN -> false, matching jbe-on-unordered). */
  return!!(candidate > best);
}
export function rto9be3e0WalkNext(iter) {
  /* 0x009be4ae add esi,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(RTO9BE3E0_LIST_STRIDE));
}
export function rto9be3e0WalkContinue(nextIter, listEnd) {
  /* 0x009be4b1 cmp esi,[eax+4] / 0x009be4b4 jne 0x9be421.  Bound re-read
     from [ebp-8]=this each iteration.  FULL dword. */
  return!!(nextIter != listEnd);
}
export function rto9be3e0OutPresent(outPtr) {
  /* 0x009be4bd test edi,edi / 0x009be4bf je 0x9be522 (return best, no
     store).  FULL dword. */
  return!!(outPtr != 0);
}
export function rto9be3e0WinnerPresent(bestPlayer) {
  /* 0x009be4c1 test ebx,ebx / 0x009be4c3 je 0x9be51e (*out=0).  FULL dword. */
  return!!(bestPlayer != 0);
}
export function rto9be3e0IdNegative(collectibleId) {
  /* 0x009be4c5 test ecx,ecx / 0x009be4c7 js 0x9be4dc.  SIGNED: id<0 runs
     the OOB log (NOTE: unlike v34 there is no fixed-out arm -- the flow
     continues into the clamp). */
  return !!((collectibleId | 0) < 0);
}
export function rto9be3e0CollectibleCount(end, begin) {
  /* 0x009be4cf sub eax,[ebx+0x1780]-[ebx+0x177c]; 0x009be4d5 sar eax,4.
     Signed SAR, 16-byte entries, 32-bit wrap. */
  return ((asU32(end) - asU32(begin)) | 0) >> 4;
}
export function rto9be3e0IdOob(id, count) {
  /* 0x009be4d8 cmp ecx,eax / 0x009be4da jl 0x9be4eb.  SIGNED: the assert
     log runs when id >= count (flow then continues to the clamp). */
  return !!((id | 0) >= (count | 0));
}
export function rto9be3e0LogNeeded(id, count) {
  /* 0x009be4c7 js 0x9be4dc (id<0) OR 0x009be4da jl not-taken (id>=count):
     the a112c0(0x10, 0xb64a88) OOB log gate in the player-hit arm. */
  return rto9be3e0IdNegative(id) || rto9be3e0IdOob(id, count);
}
export function rto9be3e0CollectibleCountMinus1(count) {
  /* 0x009be4fb sar edx,4; 0x009be4fe dec edx.  Wrap-safe count-1. */
  return asU32(asU32(count) - 1);
}
export function rto9be3e0CollectibleIndexClamp(id, countMinus1) {
  /* 0x009be4ff xor eax,eax / cmp eax,[ebp+8] / sbb / and / 0x009be507 cmp
     eax,edx / 0x009be509 cmovb edx,eax.  The idiom collapses to UNSIGNED
     min(id, count-1): id==0 -> 0 -> min is 0; id!=0 -> id -> min.  NOT the
     signed jl gate above; 0xffffffff clamps to count-1. */
  return asU32(countMinus1) < asU32(id) ? asU32(countMinus1) : asU32(id);
}
export function rto9be3e0CollectibleEntryPtr(base, index) {
  /* 0x009be50e shl edx,4; 0x009be511 add edx,ecx.  base + index*16 wrap. */
  return asU32(asU32(base) + ((asU32(index) << 4) >>> 0));
}
export function rto9be3e0ResultPlayer(bestPlayer) {
  /* 0x009be50c mov eax,ebx (shared by the out==0 return @ 0x009be524). */
  return asU32(bestPlayer);
}
export function rto9be3e0StoreZeroValue() {
  /* 0x009be51e xor edx,edx / 0x009be520 mov [edi],edx -- best==0 *out store. */
  return 0;
}
export function rto9be3e0ListBeginOfs() { return asU32(RTO9BE3E0_LIST_BEGIN_OFS); }
export function rto9be3e0ListEndOfs() { return asU32(RTO9BE3E0_LIST_END_OFS); }
export function rto9be3e0ListStride() { return asU32(RTO9BE3E0_LIST_STRIDE); }
export function rto9be3e0SlotFlagOfs() { return asU32(RTO9BE3E0_SLOT_FLAG_OFS); }
export function rto9be3e0CollectBeginOfs() { return asU32(RTO9BE3E0_COLLECT_BEGIN_OFS); }
export function rto9be3e0CollectEndOfs() { return asU32(RTO9BE3E0_COLLECT_END_OFS); }
export function rto9be3e0CollectStride() { return asU32(RTO9BE3E0_COLLECT_STRIDE); }
export function rto9be3e0SeedAssertMsgVa() { return asU32(RTO9BE3E0_SEED_ASSERT_MSG_VA); }
export function rto9be3e0OobAssertMsgVa() { return asU32(RTO9BE3E0_OOB_ASSERT_MSG_VA); }
export function rto9be3e0LogLevel() { return asU32(RTO9BE3E0_LOG_LEVEL); }
export function rto9be3e0AssertTrapVa() { return asU32(RTO9BE3E0_ASSERT_TRAP_VA); }
export function rto9be3e0HasCollectibleVa() { return asU32(RTO9BE3E0_HOST_HAS_COLLECTIBLE_VA); }
export function rto9be3e0HostLogVa() { return asU32(RTO9BE3E0_HOST_LOG_VA); }
export function rto9be3e0GameGlobalVa() { return asU32(RTO9BE3E0_GAME_GLOBAL_VA); }
export function rto9be3e0ReceiverOfs() { return asU32(RTO9BE3E0_RECEIVER_OFS); }
export function rto9be3e0RngShiftTableVa() { return asU32(RTO9BE3E0_RNG_SHIFT_TABLE_VA); }
export function rto9be3e0RngShift1() { return asU32(RTO9BE3E0_RNG_SHIFT1); }
export function rto9be3e0RngShift2() { return asU32(RTO9BE3E0_RNG_SHIFT2); }
export function rto9be3e0RngShift3() { return asU32(RTO9BE3E0_RNG_SHIFT3); }
export function rto9be3e0BestInitBits() { return asU32(RTO9BE3E0_BEST_INIT_BITS); }
export function rto9be3e0ScaleBits() { return asU32(RTO9BE3E0_SCALE_BITS); }
export function rto9be3e0SignCorrTableVa() { return asU32(RTO9BE3E0_SIGN_CORR_TABLE_VA); }
export function rto9be3e0BestInitValue() { return -1.0; }
export function rto9be3e0ScaleValue() { return f32FromBits(RTO9BE3E0_SCALE_BITS); }
export function rto9be3e0Va() { return asU32(RTO9BE3E0_VA); }
export function rto9be3e0RetVa() { return asU32(RTO9BE3E0_RET_VA); }
export function rto9be3e0FirstRetVa() { return asU32(RTO9BE3E0_FIRST_RET_VA); }
export function rto9be3e0Int3Va() { return asU32(RTO9BE3E0_INT3_VA); }
export function rto9be3e0BodyBytes() { return asU32(RTO9BE3E0_BODY_BYTES); }
export function rto9be3e0Sites() { return asU32(RTO9BE3E0_SITES); }
export function rto9be3e0NextVa() { return asU32(RTO9BE3E0_NEXT_VA); }

/* ---- ABI v37: 0x009be530 pure islands (address-stable RCO/RTO sibling).
   All gates re-derived from this PE body (RTO draw shape WITHOUT the
   collect tail).  Byte gates narrow RAW uint32_t in the body. ---- */
export function a9be530ListEmpty(begin, end) {
  /* 0x009be56b cmp esi,[this+4] / 0x009be56e je epilogue.  FULL dword. */
  return !!(begin == end);
}
export function a9be530SlotCheckable(playerField2c) {
  /* 0x009be582 cmp dword [player+0x2c],0 / 0x009be586 jne skip.  FULL dword. */
  return !!(playerField2c == 0);
}
export function a9be530Flag202cCheckable(playerField202c) {
  /* 0x009be58c cmp byte [player+0x202c],0 / 0x009be593 jne skip.  RAW
     uint32_t, low byte only (passes iff byte == 0). */
  return !!((playerField202c & 0xff) == 0);
}
export function a9be530Flag20a9Checkable(playerField20a9) {
  /* 0x009be599 cmp byte [player+0x20a9],0 / 0x009be5a0 jne skip.  RAW
     uint32_t, low byte only (passes iff byte == 0). */
  return !!((playerField20a9 & 0xff) == 0);
}
export function a9be530ChargeOk(playerField17e0) {
  /* 0x009be5a2 cmp dword [player+0x17e0],3 / 0x009be5a9 jl skip.  SIGNED:
     passes iff (int32)[player+0x17e0] >= 3; 0xffffffff FAILS. */
  return !!((playerField17e0 | 0) >= 3);
}
export function a9be530SeedAssertNeeded(seed) {
  /* 0x009be5ab test ebx,ebx / 0x009be5ad jne draw.  FULL dword; seed==0 ->
     a112c0(0x10, 0xb6bf54) + int3 @ 0x009be5be.  Runs per passing
     candidate inside the loop. */
  return !!(seed == 0);
}
export function a9be530XorshiftState(seed, shift1, shift2, shift3) {
  /* 0x009be5c4..0x009be5dd.  Shift counts are cl = LOW BYTE of the table
     dword, masked to 5 bits by the hardware.  Same table as v34-v36
     (3/5/20 @ 0xb1f5d0). */
  const s1 = (shift1 & 0xff) & 0x1f;
  const s2 = (shift2 & 0xff) & 0x1f;
  const s3 = (shift3 & 0xff) & 0x1f;
  const t1 = asU32(seed) ^ (asU32(seed) >>> s1);
  const t2 = asU32(t1) ^ ((asU32(t1) << s2) >>> 0);
  return asU32(asU32(t2) ^ (asU32(t2) >>> s3));
}
export function a9be530StateAsF64(state) {
  /* 0x009be5e7 cvtdq2pd + 0x009be5ef addsd [sign*8 + 0xbacb00] ==
     (double)u32 for every state. */
  return Number(asU32(state));
}
export function a9be530NextFloat(state) {
  /* 0x009be5f8 cvtpd2ps then 0x009be5fc mulss [0xba9ff0].  Scale dword
     VERIFIED 0x2f7ffffe. */
  return Math.fround(Math.fround(Number(asU32(state))) *
                     f32FromBits(A9BE530_SCALE_BITS));
}
export function a9be530BestUpdateNeeded(candidate, best) {
  /* 0x009be604 comiss / 0x009be607 jbe keeps old: update iff ordered &&
     candidate > best (NaN -> false, matching jbe-on-unordered). */
  return !!(candidate > best);
}
export function a9be530WalkNext(iter) {
  /* 0x009be61b add esi,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(A9BE530_LIST_STRIDE));
}
export function a9be530WalkContinue(nextIter, listEnd) {
  /* 0x009be61e cmp esi,[ecx+4] / 0x009be621 jne loop.  Bound re-read from
     [this+4] each iteration (ecx = this @ 0x009be5df).  FULL dword. */
  return !!(nextIter != listEnd);
}
export function a9be530ResultPlayer(bestPlayer) {
  /* 0x009be60c mov eax,edi (new winner) / 0x009be618 mov eax,[ebp-0xc]
     (kept winner).  Winner local init 0 (xor eax,eax @ 0x009be53e). */
  return asU32(bestPlayer);
}
export function a9be530ListBeginOfs() { return asU32(A9BE530_LIST_BEGIN_OFS); }
export function a9be530ListEndOfs() { return asU32(A9BE530_LIST_END_OFS); }
export function a9be530ListStride() { return asU32(A9BE530_LIST_STRIDE); }
export function a9be530SlotFlagOfs() { return asU32(A9BE530_SLOT_FLAG_OFS); }
export function a9be530Flag202cOfs() { return asU32(A9BE530_FLAG_202C_OFS); }
export function a9be530Flag20a9Ofs() { return asU32(A9BE530_FLAG_20A9_OFS); }
export function a9be530ChargeOfs() { return asU32(A9BE530_CHARGE_OFS); }
export function a9be530ChargeMin() { return asU32(A9BE530_CHARGE_MIN); }
export function a9be530SeedAssertMsgVa() { return asU32(A9BE530_SEED_ASSERT_MSG_VA); }
export function a9be530LogLevel() { return asU32(A9BE530_LOG_LEVEL); }
export function a9be530AssertTrapVa() { return asU32(A9BE530_ASSERT_TRAP_VA); }
export function a9be530HostLogVa() { return asU32(A9BE530_HOST_LOG_VA); }
export function a9be530RngShiftTableVa() { return asU32(A9BE530_RNG_SHIFT_TABLE_VA); }
export function a9be530RngShift1() { return asU32(A9BE530_RNG_SHIFT1); }
export function a9be530RngShift2() { return asU32(A9BE530_RNG_SHIFT2); }
export function a9be530RngShift3() { return asU32(A9BE530_RNG_SHIFT3); }
export function a9be530BestInitBits() { return asU32(A9BE530_BEST_INIT_BITS); }
export function a9be530ScaleBits() { return asU32(A9BE530_SCALE_BITS); }
export function a9be530SignCorrTableVa() { return asU32(A9BE530_SIGN_CORR_TABLE_VA); }
export function a9be530BestInitValue() { return -1.0; }
export function a9be530ScaleValue() { return f32FromBits(A9BE530_SCALE_BITS); }
export function a9be530Va() { return asU32(A9BE530_VA); }
export function a9be530RetVa() { return asU32(A9BE530_RET_VA); }
export function a9be530FirstRetVa() { return asU32(A9BE530_FIRST_RET_VA); }
export function a9be530Int3Va() { return asU32(A9BE530_INT3_VA); }
export function a9be530BodyBytes() { return asU32(A9BE530_BODY_BYTES); }
export function a9be530Sites() { return asU32(A9BE530_SITES); }
export function a9be530NextVa() { return asU32(A9BE530_NEXT_VA); }

/* ---- ABI v38: 0x009be630 slot-match sibling.  Laws re-derived from THIS
   body (search, NOT a draw — v37 gates/xorshift do NOT apply).  Byte gates
   narrow RAW uint32_t in the body. ---- */
export function a9be630ListEmpty(begin, end) {
  /* 0x009be639 cmp eax,ecx / 0x009be63b je not-found.  FULL dword; the
     empty path never reads arg1 (esi loaded AFTER the je @ 0x009be63d). */
  return !!(begin == end);
}
export function a9be630SlotCheckable(playerField2c) {
  /* 0x009be642 cmp dword [player+0x2c],0 / 0x009be646 jne skip.  FULL dword. */
  return !!(playerField2c == 0);
}
export function a9be630Flag20a9Checkable(playerField20a9) {
  /* 0x009be648 cmp byte [player+0x20a9],0 / 0x009be64f jne skip.  RAW
     uint32_t, low byte only (passes iff byte == 0). */
  return !!((playerField20a9 & 0xff) == 0);
}
export function a9be630SlotMatches(playerSlotValue, needleSlot) {
  /* 0x009be651 cmp dword [player+0x13c0],esi / 0x009be657 je found.
     FULL dword equality with the BY-VALUE needle arg. */
  return !!(asU32(playerSlotValue) == asU32(needleSlot));
}
export function a9be630WalkNext(iter) {
  /* 0x009be659 add eax,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(A9BE630_LIST_STRIDE));
}
export function a9be630WalkContinue(nextIter, listEnd) {
  /* 0x009be65c cmp eax,ecx / 0x009be65e jne loop.  End CAPTURED once into
     ecx @ 0x009be635 (pre-loop) — NOT re-read per iteration (differs from
     v37).  FULL dword. */
  return !!(nextIter != listEnd);
}
export function a9be630ResultNotfound() {
  /* 0x009be660 xor eax,eax.  Not-found result 0. */
  return asU32(0);
}
export function a9be630ResultFound(playerPtr) {
  /* 0x009be667 mov eax,edx; edx held the player ptr loaded @ 0x009be640. */
  return asU32(playerPtr);
}
export function a9be630ListBeginOfs() { return asU32(A9BE630_LIST_BEGIN_OFS); }
export function a9be630ListEndOfs() { return asU32(A9BE630_LIST_END_OFS); }
export function a9be630ListStride() { return asU32(A9BE630_LIST_STRIDE); }
export function a9be630SlotFlagOfs() { return asU32(A9BE630_SLOT_FLAG_OFS); }
export function a9be630Flag20a9Ofs() { return asU32(A9BE630_FLAG_20A9_OFS); }
export function a9be630SlotValueOfs() { return asU32(A9BE630_SLOT_VALUE_OFS); }
export function a9be630Va() { return asU32(A9BE630_VA); }
export function a9be630RetVa() { return asU32(A9BE630_RET_VA); }
export function a9be630FirstRetVa() { return asU32(A9BE630_FIRST_RET_VA); }
export function a9be630Int3Va() { return asU32(A9BE630_INT3_VA); }
export function a9be630BodyBytes() { return asU32(A9BE630_BODY_BYTES); }
export function a9be630Sites() { return asU32(A9BE630_SITES); }
export function a9be630NextVa() { return asU32(A9BE630_NEXT_VA); }

/* ---- ABI v39: 0x009be670 PURE slot-0x19 predicate.  Laws re-derived
   from THIS body (predicate, NOT a search return — empty list is TRUE
   1; the needle is the IMMEDIATE 0x19, never a stack arg).  Byte gates
   narrow RAW uint32_t in the body. ---- */
export function a9be670ListEmpty(begin, end) {
  /* 0x009be675 cmp eax,ecx / 0x009be677 je 0x9be6a1 (TRUE arm).  FULL
     dword; empty -> return 1 (INVERSE of v38's not-found 0). */
  return !!(begin == end);
}
export function a9be670SlotCheckable(playerField2c) {
  /* 0x009be682 cmp dword [player+0x2c],0 / 0x009be686 jne skip.  FULL dword. */
  return !!(playerField2c == 0);
}
export function a9be670Flag20a9Checkable(playerField20a9) {
  /* 0x009be688 cmp byte [player+0x20a9],0 / 0x009be68f jne skip.  RAW
     uint32_t, low byte only (passes iff byte == 0). */
  return !!((playerField20a9 & 0xff) == 0);
}
export function a9be670SlotEqualsNeedle(playerSlotValue) {
  /* 0x009be691 cmp dword [player+0x13c0],0x19 / 0x009be698 jne FALSE.
     FULL dword == IMMEDIATE 0x19; != 0x19 returns 0 (== 0x19 continues
     the walk).  The needle is NOT an argument. */
  return !!(asU32(playerSlotValue) == A9BE670_SLOT_NEEDLE);
}
export function a9be670WalkNext(iter) {
  /* 0x009be69a add eax,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(A9BE670_LIST_STRIDE));
}
export function a9be670WalkContinue(nextIter, listEnd) {
  /* 0x009be69d cmp eax,ecx / 0x009be69f jne loop.  End CAPTURED once into
     ecx @ 0x009be672 (pre-loop) — NOT re-read per iteration.  FULL dword. */
  return !!(nextIter != listEnd);
}
export function a9be670ResultTrue() {
  /* 0x009be6a1 mov al,1.  TRUE result 1 (empty OR all checkable == 0x19). */
  return asU32(1);
}
export function a9be670ResultFalse() {
  /* 0x009be6a6 xor al,al.  FALSE result 0 (checkable slot != 0x19). */
  return asU32(0);
}
export function a9be670ListBeginOfs() { return asU32(A9BE670_LIST_BEGIN_OFS); }
export function a9be670ListEndOfs() { return asU32(A9BE670_LIST_END_OFS); }
export function a9be670ListStride() { return asU32(A9BE670_LIST_STRIDE); }
export function a9be670SlotFlagOfs() { return asU32(A9BE670_SLOT_FLAG_OFS); }
export function a9be670Flag20a9Ofs() { return asU32(A9BE670_FLAG_20A9_OFS); }
export function a9be670SlotValueOfs() { return asU32(A9BE670_SLOT_VALUE_OFS); }
export function a9be670SlotNeedle() { return asU32(A9BE670_SLOT_NEEDLE); }
export function a9be670Va() { return asU32(A9BE670_VA); }
export function a9be670RetVa() { return asU32(A9BE670_RET_VA); }
export function a9be670FirstRetVa() { return asU32(A9BE670_FIRST_RET_VA); }
export function a9be670Int3Va() { return asU32(A9BE670_INT3_VA); }
export function a9be670BodyBytes() { return asU32(A9BE670_BODY_BYTES); }
export function a9be670Sites() { return asU32(A9BE670_SITES); }
export function a9be670NextVa() { return asU32(A9BE670_NEXT_VA); }

/* ---- ABI v39: 0x009be6b0 owner/quality player select.  NARROWED — the
   laws are the pure walk + path selection + arg values + accept/winner CF
   AROUND host 0x7cb6e0 (status) and 0x7706e0 (query).  SIGNED setg laws
   (status_gt1 / status_gt0) and the LOW-byte accept gate are the
   discriminator points; the host call bodies stay host residual. ---- */
export function a9be6b0ListEmpty(begin, end) {
  /* 0x009be6c4 cmp esi,[this+4] / 0x009be6c7 je 0x9be73f (epilogue A).
     FULL dword.  The bound is RE-READ each iteration (this reloaded from
     the local [esp+0xc] @ 0x009be72b), but the empty gate is equivalent
     to begin == end at entry. */
  return !!(begin == end);
}
export function a9be6b0FieldNonzero(playerField2ef8) {
  /* 0x009be6ce test eax,eax / 0x009be6d6 je path C.  FULL dword != 0. */
  return !!(asU32(playerField2ef8) != 0);
}
export function a9be6b0FieldEqNeedle(playerField2ef8, needle) {
  /* 0x009be6d8 cmp eax,edx / 0x009be6da jne path C.  FULL dword equality
     with the BY-VALUE needle arg1 ([ebp+8] loaded @ 0x009be6cb). */
  return !!(asU32(playerField2ef8) == asU32(needle));
}
export function a9be6b0Flag2ef0Set(playerFlag2ef0) {
  /* 0x009be6dc cmp byte [p+0x2ef0],0 / 0x009be6e3 je path B.  RAW uint32,
     low byte only (path A iff byte != 0). */
  return !!((playerFlag2ef0 & 0xff) != 0);
}
export function a9be6b0StatusGt1(statusResult) {
  /* 0x009be6f5..0x9be6fb: path B status call then `cmp eax,1` /
     0x009be70a setg bl.  SIGNED: bl = 1 iff (int32)status > 1.
     0xffffffff (-1) FAILS; 0/1 FAIL; 2/0x7fffffff PASS. */
  return !!((statusResult | 0) > 1);
}
export function a9be6b0StatusGt0(statusResult) {
  /* 0x009be700..0x9be706: path C status call then `test eax,eax` /
     0x009be70a setg bl.  SIGNED: bl = 1 iff (int32)status > 0.
     0 FAILS (non-strict); 0xffffffff (-1) FAILS; 1 PASSES. */
  return !!((statusResult | 0) > 0);
}
export function a9be6b0BlForced() {
  /* 0x009be6ec mov bl,1 (path A) — the accept bit is FORCED 1, the setg
     is skipped (jmp @ 0x009be6f3 to merge_accept). */
  return asU32(1);
}
export function a9be6b0AcceptNeeded(bl, queryResult) {
  /* 0x009be719 test bl,bl / je skip-store; 0x009be71d test al,al /
     0x009be71f jne epilogue B.  Accept iff bl != 0 && LOW byte(query
     result) != 0 -> return player immediately.  RAW uint32s. */
  return !!(bl != 0 && (asU32(queryResult) & 0xff) != 0);
}
export function a9be6b0WinnerStoreNeeded(winner, bl) {
  /* 0x009be721..0x9be729: test edi / jne skip; test bl / je skip;
     mov edi,[esi] — store iff winner==0 && bl!=0 (the FIRST bl-set
     candidate becomes the fallback winner). */
  return !!(asU32(winner) == 0 && bl != 0);
}
export function a9be6b0WalkNext(iter) {
  /* 0x009be72f add esi,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(A9BE6B0_LIST_STRIDE));
}
export function a9be6b0WalkContinue(nextIter, listEnd) {
  /* 0x009be6c4 cmp esi,[eax+4] / 0x009be6c7 je epilogue A.  End RE-READ
     each iteration (eax = this reloaded @ 0x009be72b) — matches v37,
     DIFFERS from v38's captured bound.  FULL dword. */
  return !!(nextIter != listEnd);
}
export function a9be6b0ResultPlayer(playerPtr) {
  /* 0x009be734 mov eax,[esi].  Early-accept result = player ptr. */
  return asU32(playerPtr);
}
export function a9be6b0ResultWinner(winner) {
  /* 0x009be73f mov eax,edi.  Loop-exhausted result = winner (0 if none). */
  return asU32(winner);
}
export function a9be6b0ListBeginOfs() { return asU32(A9BE6B0_LIST_BEGIN_OFS); }
export function a9be6b0ListEndOfs() { return asU32(A9BE6B0_LIST_END_OFS); }
export function a9be6b0ListStride() { return asU32(A9BE6B0_LIST_STRIDE); }
export function a9be6b0Field2ef8Ofs() { return asU32(A9BE6B0_FIELD_2EF8_OFS); }
export function a9be6b0Flag2ef0Ofs() { return asU32(A9BE6B0_FLAG_2EF0_OFS); }
export function a9be6b0QueryArg1() { return asU32(A9BE6B0_QUERY_ARG1); }
export function a9be6b0QueryArg2() { return asU32(A9BE6B0_QUERY_ARG2); }
export function a9be6b0StatusCallVa() { return asU32(A9BE6B0_STATUS_CALL_VA); }
export function a9be6b0QueryCallVa() { return asU32(A9BE6B0_QUERY_CALL_VA); }
export function a9be6b0Va() { return asU32(A9BE6B0_VA); }
export function a9be6b0RetVa() { return asU32(A9BE6B0_RET_VA); }
export function a9be6b0FirstRetVa() { return asU32(A9BE6B0_FIRST_RET_VA); }
export function a9be6b0Int3Va() { return asU32(A9BE6B0_INT3_VA); }
export function a9be6b0BodyBytes() { return asU32(A9BE6B0_BODY_BYTES); }
export function a9be6b0Sites() { return asU32(A9BE6B0_SITES); }
export function a9be6b0NextVa() { return asU32(A9BE6B0_NEXT_VA); }

/* ---- ABI v40: 0x009be750 GetNumCollectibles pure walk laws.  NARROWED:
   host leaves 0x0072fd10 (ItemConfig::GetCollectible -- the pre-walk twin
   lookup, this = [0xc7169c] + 0x2a404) and 0x00770ca0
   (Entity_Player::GetCollectibleNum(player, type, 0)) feed the gates/sum.
   The twin flag byte is computed ONCE pre-walk (or eax,ebx @ 0x009be78c
   with ebx == 0) and gates the per-twin 0x770ca0 call.  The sum wraps
   32-bit per `add ebx,eax` @ 0x009be7b4 / 0x009be7d1. ---- */
export function gnc9be750TwinFlag(twinPresent, flagsB8) {
  /* 0x009be778 test eax,eax / je set0; 0x009be77c mov eax,[eax+0xb8];
     0x009be782 and eax,0x80000000; 0x009be787 mov byte 1;
     0x009be78c or eax,ebx (ebx==0) / jne keep.  FULL dword bit31. */
  return !!((twinPresent !== 0) && ((flagsB8 & GNC9BE750_TWIN_BIT) !== 0));
}
export function gnc9be750ListEmpty(begin, end) {
  /* 0x009be796 mov esi,[edi]; 0x009be796(2) cmp esi,[edi+4] / je 0x9be7df.
     FULL dword begin==end. */
  return !!(begin == end);
}
export function gnc9be750SlotCheckable(playerField2c) {
  /* 0x009be7a2 cmp dword [edi+0x2c],0 / jne 0x9be7d7.  FULL dword. */
  return !!(playerField2c == 0);
}
export function gnc9be750CountAdd(acc, hostCount) {
  /* 0x009be7b4 / 0x009be7d1: add ebx,eax.  32-bit wrap. */
  return asU32(asU32(acc) + asU32(hostCount));
}
export function gnc9be750TwinCallNeeded(flag, twinPtr) {
  /* 0x009be7b6 cmp byte [esp+0x13],0 / je skip; 0x009be7bd mov ecx,
     [edi+0x1e6c]; 0x009be7c3 test ecx,ecx / je skip.  flag LOW byte != 0
     AND twin ptr != 0 (FULL dword). */
  return !!(((flag & 0xff) !== 0) && (twinPtr !== 0));
}
export function gnc9be750WalkNext(iter) {
  /* 0x009be7d7 add esi,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(GNC9BE750_LIST_STRIDE));
}
export function gnc9be750WalkContinue(nextIter, listEnd) {
  /* 0x009be7d3 mov eax,[esp+0x14] (this); 0x009be7da cmp esi,[eax+4]
     / jne 0x9be7a0.  End RE-READ from this each iteration.  FULL dword. */
  return !!(asU32(nextIter) != asU32(listEnd));
}
export function gnc9be750ResultSum(sum) {
  /* 0x009be7e1 mov eax,ebx -- return the accumulated sum. */
  return asU32(sum);
}
export function gnc9be750ListBeginOfs() { return asU32(GNC9BE750_LIST_BEGIN_OFS); }
export function gnc9be750ListEndOfs() { return asU32(GNC9BE750_LIST_END_OFS); }
export function gnc9be750ListStride() { return asU32(GNC9BE750_LIST_STRIDE); }
export function gnc9be750SlotFlagOfs() { return asU32(GNC9BE750_SLOT_FLAG_OFS); }
export function gnc9be750TwinPtrOfs() { return asU32(GNC9BE750_TWIN_PTR_OFS); }
export function gnc9be750TwinFlagsOfs() { return asU32(GNC9BE750_TWIN_FLAGS_OFS); }
export function gnc9be750TwinBit() { return asU32(GNC9BE750_TWIN_BIT); }
export function gnc9be750ManagerGlobalVa() { return asU32(GNC9BE750_MANAGER_GLOBAL_VA); }
export function gnc9be750GameGlobalVa() { return asU32(GNC9BE750_GAME_GLOBAL_VA); }
export function gnc9be750ReceiverOfs() { return asU32(GNC9BE750_RECEIVER_OFS); }
export function gnc9be750TwinContainerOfs() { return asU32(GNC9BE750_TWIN_CONTAINER_OFS); }
export function gnc9be750HostTwinGetVa() { return asU32(GNC9BE750_HOST_TWIN_GET_VA); }
export function gnc9be750HostCountVa() { return asU32(GNC9BE750_HOST_COUNT_VA); }
export function gnc9be750Va() { return asU32(GNC9BE750_VA); }
export function gnc9be750RetVa() { return asU32(GNC9BE750_RET_VA); }
export function gnc9be750Int3Va() { return asU32(GNC9BE750_INT3_VA); }
export function gnc9be750BodyBytes() { return asU32(GNC9BE750_BODY_BYTES); }
export function gnc9be750Sites() { return asU32(GNC9BE750_SITES); }
export function gnc9be750SiteVa() { return asU32(GNC9BE750_SITE_VA); }
export function gnc9be750NextVa() { return asU32(GNC9BE750_NEXT_VA); }

/* ---- ABI v41: 0x009be7f0 HasTemporaryEffect pure walk laws.  PURE:
   the whole body is a freestanding bool scan (0 E8 / 0 stores).  Host
   keeps: g_Game deref + PlayerManager container at 2 call sites, players
   vector memory, per-player temp-effect vector memory.  List end CAPTURED
   ONCE (esi @ 0x009be7f6); vec end captured per candidate (ecx @
   0x009be818); the needle (edi @ 0x009be7fe) is read only when the list is
   non-empty.  Empty list -> result_not_found (0) — the v38 polarity, NOT
   the v39 9be670 TRUE-on-empty.  First [entry]==needle hit returns 1
   immediately (early-exit inner loop). ---- */
export function hte9be7f0ListEmpty(begin, end) {
  /* 0x009be7fa cmp edx,esi / je 0x9be834.  FULL dword begin==end. */
  return !!(begin == end);
}
export function hte9be7f0SlotCheckable(playerField2c) {
  /* 0x009be803 cmp dword [ecx+0x2c],0 / jne 0x9be82d.  FULL dword. */
  return !!(playerField2c == 0);
}
export function hte9be7f0Flag1519Checkable(flag1519) {
  /* 0x009be809 cmp byte [ecx+0x1519],0 / jne 0x9be82d.  LOW byte. */
  return (asU32(flag1519) & 0xff) === 0;
}
export function hte9be7f0VecNotEmpty(vecBegin, vecEnd) {
  /* 0x009be81e cmp eax,ecx / je 0x9be82d.  FULL dword begin != end. */
  return !!(asU32(vecBegin) != asU32(vecEnd));
}
export function hte9be7f0EntryHit(entryValue, needle) {
  /* 0x009be822 cmp dword [eax],edi / je 0x9be83c.  FULL dword == needle. */
  return !!(asU32(entryValue) == asU32(needle));
}
export function hte9be7f0VecWalkNext(iter) {
  /* 0x009be826 add eax,0x10.  32-bit wrap, stride 16. */
  return asU32(asU32(iter) + asU32(HTE9BE7F0_VEC_STRIDE));
}
export function hte9be7f0VecWalkContinue(nextIter, vecEnd) {
  /* 0x009be829 cmp eax,ecx / jne 0x9be822.  FULL dword next != vec end. */
  return !!(asU32(nextIter) != asU32(vecEnd));
}
export function hte9be7f0WalkNext(iter) {
  /* 0x009be82d add edx,4.  32-bit wrap. */
  return asU32(asU32(iter) + asU32(HTE9BE7F0_LIST_STRIDE));
}
export function hte9be7f0WalkContinue(nextIter, listEnd) {
  /* 0x009be830 cmp edx,esi / jne 0x9be801.  FULL dword next != end; END
     CAPTURED ONCE (esi @ 0x009be7f6) — differs from 9be6b0/9be750. */
  return !!(asU32(nextIter) != asU32(listEnd));
}
export function hte9be7f0ResultFound() {
  /* 0x009be83d mov al,1 -- FOUND epilogue. */
  return 1;
}
export function hte9be7f0ResultNotFound() {
  /* 0x009be835 xor al,al -- NOT-FOUND epilogue. */
  return 0;
}
export function hte9be7f0ListBeginOfs() { return asU32(HTE9BE7F0_LIST_BEGIN_OFS); }
export function hte9be7f0ListEndOfs() { return asU32(HTE9BE7F0_LIST_END_OFS); }
export function hte9be7f0ListStride() { return asU32(HTE9BE7F0_LIST_STRIDE); }
export function hte9be7f0SlotFlagOfs() { return asU32(HTE9BE7F0_SLOT_FLAG_OFS); }
export function hte9be7f0Flag1519Ofs() { return asU32(HTE9BE7F0_FLAG1519_OFS); }
export function hte9be7f0VecBeginOfs() { return asU32(HTE9BE7F0_VEC_BEGIN_OFS); }
export function hte9be7f0VecEndOfs() { return asU32(HTE9BE7F0_VEC_END_OFS); }
export function hte9be7f0VecStride() { return asU32(HTE9BE7F0_VEC_STRIDE); }
export function hte9be7f0Va() { return asU32(HTE9BE7F0_VA); }
export function hte9be7f0FirstRetVa() { return asU32(HTE9BE7F0_FIRST_RET_VA); }
export function hte9be7f0RetVa() { return asU32(HTE9BE7F0_RET_VA); }
export function hte9be7f0Int3Va() { return asU32(HTE9BE7F0_INT3_VA); }
export function hte9be7f0BodyBytes() { return asU32(HTE9BE7F0_BODY_BYTES); }
export function hte9be7f0Sites() { return asU32(HTE9BE7F0_SITES); }
export function hte9be7f0SiteVa() { return asU32(HTE9BE7F0_SITE_VA); }
export function hte9be7f0Site2Va() { return asU32(HTE9BE7F0_SITE2_VA); }
export function hte9be7f0NextVa() { return asU32(HTE9BE7F0_NEXT_VA); }

/* ---- ABI v42: 0x009be850 slot-accumulator walk laws.  NARROWED: the 2
   host calls to 0x930220 stay host; these laws pin the pure CF + arg-prep
   exactly.  Outer loop: count = SAR32(end-begin,2) RE-DERIVED per
   iteration (end/begin re-read @ 0x009be966/96a), UNSIGNED esi < count
   (jb @ 0x009be973).  Host gate (both sites): SIGNED ((vec_end -
   vec_begin) & ~3) > 0x1c0 AND slot = [vec_begin+0x1c0] != 0.  Marker
   scan (skips host2): byte [twin+0x1519]==0 AND [twin+0x150c..+0x1510)
   non-empty, walk stride 0x10, marker [entry+0]==0 && [entry+4]==0x70 ->
   loop tail.  Host receiver: player+0x1508 (call1) / twin+0x1508 (call2);
   buf16 {slot, 0, [slot+0x78], 0}; args (1, 1).  Args: arg1 (0x70) DEAD.
   ---- */
export function a9be850ListCount(listEnd, listBegin) {
  /* 0x009be865 sub eax,edx / 0x009be867 sar eax,2.  SIGNED arithmetic
     shift of the 32-bit-wrapped difference: count = (end-begin)>>2. */
  return asI32(asU32(listEnd) - asU32(listBegin)) >> 2;
}
export function a9be850LoopNeeded(count) {
  /* 0x009be86a test eax,eax / 0x009be86c je epilogue.  FULL dword
     count != 0 -> body runs. */
  return !!asI32(count);
}
export function a9be850HostGateNeeded(vecEnd, vecBegin) {
  /* 0x009be88c sub eax,ebx / 0x009be88e and eax,0xfffffffc /
     0x009be891 cmp eax,0x1c0 / 0x009be896 jle skip.  SIGNED: the masked
     delta is compared with jle (signed <=), so it fires only when
     ((vec_end - vec_begin) & ~3) > 0x1c0 as a SIGNED int32.  IDENTICAL
     predicate at both host sites (0x009be88c / 0x009be925). */
  const masked = (asU32(vecEnd) - asU32(vecBegin)) & A9BE850_HOST_GATE_MASK;
  return asI32(masked) > A9BE850_HOST_GATE_THRESHOLD;
}
export function a9be850SlotPresent(slot) {
  /* 0x009be89e test eax,eax / 0x009be8a0 je skip.  FULL dword slot != 0
     (both host gates). */
  return !!asU32(slot);
}
export function a9be850TwinPresent(twin) {
  /* 0x009be8d6 test ecx,ecx / 0x009be8d8 je tail.  FULL dword
     [player+0x1e6c] != 0. */
  return !!asU32(twin);
}
export function a9be850Flag1519Clear(flag1519) {
  /* 0x009be8de cmp byte [ecx+0x1519],0 / 0x009be8eb jne host2-gate.
     RAW uint32, LOW byte == 0 -> marker scan allowed. */
  return (asU32(flag1519) & 0xff) === 0;
}
export function a9be850TwinVecNotEmpty(vecBegin, vecEnd) {
  /* 0x009be8f9 cmp eax,ecx / 0x009be8fb je host2-gate.  FULL dword
     begin != end REQUIRED to scan markers. */
  return !!(asU32(vecBegin) != asU32(vecEnd));
}
export function a9be850MarkerHit(entryField0, entryField4) {
  /* 0x009be902 cmp dword [edx],0 / 0x009be905 jne advance /
     0x009be907 cmp dword [edx+4],0x70 / 0x009be90b je loop-tail.
     FULL dwords: [entry+0]==0 && [entry+4]==0x70 -> marker -> SKIP
     host2 (jump to the loop tail). */
  return asU32(entryField0) === A9BE850_MARKER_FIELD0_VALUE &&
         asU32(entryField4) === A9BE850_MARKER_FIELD4_VALUE;
}
export function a9be850VecWalkNext(iter) {
  /* 0x009be90d add eax,0x10.  32-bit wrap, stride 16. */
  return asU32(asU32(iter) + asU32(A9BE850_TWIN_VEC_STRIDE));
}
export function a9be850VecWalkContinue(nextIter, vecEnd) {
  /* 0x009be910 cmp eax,ecx / 0x009be912 jne 0x009be900.  FULL dword
     next != twin vec end (end captured per candidate @ 0x009be8f3). */
  return !!(asU32(nextIter) != asU32(vecEnd));
}
export function a9be850WalkNext(index) {
  /* 0x009be969 inc esi.  32-bit wrap, index += 1. */
  return asU32(asU32(index) + 1);
}
export function a9be850WalkContinue(nextIndex, count) {
  /* 0x009be966..0x009be973: end/begin RE-READ + sar + cmp esi,eax / jb.
     UNSIGNED next_index < count; count RE-DERIVED per iteration. */
  return asU32(nextIndex) < asU32(count);
}
export function a9be850ListBeginOfs() { return asU32(A9BE850_LIST_BEGIN_OFS); }
export function a9be850ListEndOfs() { return asU32(A9BE850_LIST_END_OFS); }
export function a9be850ListStride() { return asU32(A9BE850_LIST_STRIDE); }
export function a9be850ManagerGlobalVa() { return asU32(A9BE850_MANAGER_GLOBAL_VA); }
export function a9be850VecABeginOfs() { return asU32(A9BE850_VEC_A_BEGIN_OFS); }
export function a9be850VecAEndOfs() { return asU32(A9BE850_VEC_A_END_OFS); }
export function a9be850VecASlotOfs() { return asU32(A9BE850_VEC_A_SLOT_OFS); }
export function a9be850HostGateThreshold() { return asU32(A9BE850_HOST_GATE_THRESHOLD); }
export function a9be850HostGateMask() { return asU32(A9BE850_HOST_GATE_MASK); }
export function a9be850SlotFieldOfs() { return asU32(A9BE850_SLOT_FIELD_OFS); }
export function a9be850HostReceiverOfs() { return asU32(A9BE850_HOST_RECEIVER_OFS); }
export function a9be850TwinFieldOfs() { return asU32(A9BE850_TWIN_FIELD_OFS); }
export function a9be850Flag1519Ofs() { return asU32(A9BE850_FLAG1519_OFS); }
export function a9be850TwinVecBeginOfs() { return asU32(A9BE850_TWIN_VEC_BEGIN_OFS); }
export function a9be850TwinVecEndOfs() { return asU32(A9BE850_TWIN_VEC_END_OFS); }
export function a9be850TwinVecStride() { return asU32(A9BE850_TWIN_VEC_STRIDE); }
export function a9be850MarkerField0Value() { return asU32(A9BE850_MARKER_FIELD0_VALUE); }
export function a9be850MarkerField4Value() { return asU32(A9BE850_MARKER_FIELD4_VALUE); }
export function a9be850HostVa() { return asU32(A9BE850_HOST_VA); }
export function a9be850HostArg2() { return asU32(A9BE850_HOST_ARG2); }
export function a9be850HostArg3() { return asU32(A9BE850_HOST_ARG3); }
export function a9be850GameGlobalVa() { return asU32(A9BE850_GAME_GLOBAL_VA); }
export function a9be850ReceiverOfs() { return asU32(A9BE850_RECEIVER_OFS); }
export function a9be850CallerArg1() { return asU32(A9BE850_CALLER_ARG1); }
export function a9be850Va() { return asU32(A9BE850_VA); }
export function a9be850RetVa() { return asU32(A9BE850_RET_VA); }
export function a9be850Int3Va() { return asU32(A9BE850_INT3_VA); }
export function a9be850BodyBytes() { return asU32(A9BE850_BODY_BYTES); }
export function a9be850Sites() { return asU32(A9BE850_SITES); }
export function a9be850SiteVa() { return asU32(A9BE850_SITE_VA); }
export function a9be850NextVa() { return asU32(A9BE850_NEXT_VA); }

/* ---- ABI v43: 0x009be990 PURE bool-scan laws.  __thiscall ret 0; NO
   stack args; this = g_Game+0x1baa8 (callers 0x004531b6 / 0x0049118a).
   FOUND al=1 / NOT-FOUND al=0; consumers test only AL.  Walk
   [this+0..this+4) stride 4; begin/end captured ONCE at entry (end NEVER
   re-read — differs from a9be850 re-derive; matches 9be630/9be670).
   Per player: code = [player+0x3fc] FULL dword; code==0 (test/je) or
   code==3 (cmp/jne-not-taken) -> ADVANCE; otherwise FOUND al=1.  Empty
   list or loop-exhausted -> NOT-FOUND al=0. ---- */
export function a9be990Hit(code) {
  /* 0x009be9a8 test edx,edx / 0x009be9aa je advance /
     0x009be9ac cmp edx,3 / 0x009be9af jne FOUND.  FULL dword on
     [player+0x3fc]: ==0 or ==3 -> advance; else FOUND. */
  return asU32(code) !== A9BE990_SKIP_CODE_ZERO &&
         asU32(code) !== A9BE990_SKIP_CODE_THREE;
}
export function a9be990ListEmpty(listBegin, listEnd) {
  /* 0x009be995 cmp eax,ecx / 0x009be997 je 0x9be9b8.  FULL dword
     begin==end -> NOT-FOUND (loop never runs). */
  return asU32(listBegin) === asU32(listEnd);
}
export function a9be990WalkNext(iter) {
  /* 0x009be9b1 add eax,4.  32-bit wrap, stride 4. */
  return asU32(asU32(iter) + asU32(A9BE990_LIST_STRIDE));
}
export function a9be990WalkContinue(nextIter, listEnd) {
  /* 0x009be9b4 cmp eax,ecx / 0x009be9b6 jne 0x9be9a0.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009be992). */
  return asU32(nextIter) !== asU32(listEnd);
}
export function a9be990ListBeginOfs() { return asU32(A9BE990_LIST_BEGIN_OFS); }
export function a9be990ListEndOfs() { return asU32(A9BE990_LIST_END_OFS); }
export function a9be990ListStride() { return asU32(A9BE990_LIST_STRIDE); }
export function a9be990SlotFieldOfs() { return asU32(A9BE990_SLOT_FIELD_OFS); }
export function a9be990SkipCodeZero() { return asU32(A9BE990_SKIP_CODE_ZERO); }
export function a9be990SkipCodeThree() { return asU32(A9BE990_SKIP_CODE_THREE); }
export function a9be990ManagerGlobalVa() { return asU32(A9BE990_MANAGER_GLOBAL_VA); }
export function a9be990ReceiverOfs() { return asU32(A9BE990_RECEIVER_OFS); }
export function a9be990Va() { return asU32(A9BE990_VA); }
export function a9be990FirstRetVa() { return asU32(A9BE990_FIRST_RET_VA); }
export function a9be990RetVa() { return asU32(A9BE990_RET_VA); }
export function a9be990Int3Va() { return asU32(A9BE990_INT3_VA); }
export function a9be990BodyBytes() { return asU32(A9BE990_BODY_BYTES); }
export function a9be990Sites() { return asU32(A9BE990_SITES); }
export function a9be990SiteVa() { return asU32(A9BE990_SITE_VA); }
export function a9be990Site2Va() { return asU32(A9BE990_SITE2_VA); }
export function a9be990NextVa() { return asU32(A9BE990_NEXT_VA); }

/* ---- ABI v44: 0x009be9c0 PURE bool scan laws (see A9BE9C0 consts). ---- */
export function a9be9c0ListEmpty(listBegin, listEnd) {
  /* 0x009be9c5 cmp eax,ecx / 0x009be9c7 je 0x9be9fb.  FULL dword
     begin==end -> NOT-FOUND (loop never runs). */
  return asU32(listBegin) === asU32(listEnd);
}
export function a9be9c0Flag20a9Checkable(playerFlag20a9) {
  /* 0x009be9d2 cmp byte [edx+0x20a9],0 / 0x009be9d9 jne advance.  RAW
     uint32 LOW byte: flag==0 -> candidate examined; !=0 -> ADVANCE. */
  return asU32(playerFlag20a9 & 0xff) === 0;
}
export function a9be9c0Field184Found(playerField184) {
  /* 0x009be9e1 test edx,edx / je FOUND; 0x009be9e5 cmp edx,3 / je FOUND;
     0x009be9ea cmp edx,1 / je FOUND; 0x009be9ef cmp edx,2 / je FOUND.
     FULL dword on [player+0x184]: FOUND iff code IN {0,1,2,3}. */
  const code = asU32(playerField184);
  return code === 0 || code === 1 || code === 2 || code === 3;
}
export function a9be9c0WalkNext(iter) {
  /* 0x009be9f4 add eax,4.  32-bit wrap, stride 4. */
  return asU32(asU32(iter) + asU32(A9BE9C0_LIST_STRIDE));
}
export function a9be9c0WalkContinue(nextIter, listEnd) {
  /* 0x009be9f7 cmp eax,ecx / 0x009be9f9 jne 0x9be9d0.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009be9c2), NEVER
     re-read per iteration. */
  return asU32(nextIter) !== asU32(listEnd);
}
export function a9be9c0ListBeginOfs() { return asU32(A9BE9C0_LIST_BEGIN_OFS); }
export function a9be9c0ListEndOfs() { return asU32(A9BE9C0_LIST_END_OFS); }
export function a9be9c0ListStride() { return asU32(A9BE9C0_LIST_STRIDE); }
export function a9be9c0Flag20a9Ofs() { return asU32(A9BE9C0_FLAG20A9_OFS); }
export function a9be9c0Field184Ofs() { return asU32(A9BE9C0_FIELD184_OFS); }
export function a9be9c0FoundCodeZero() { return asU32(A9BE9C0_FOUND_CODE_ZERO); }
export function a9be9c0FoundCodeOne() { return asU32(A9BE9C0_FOUND_CODE_ONE); }
export function a9be9c0FoundCodeTwo() { return asU32(A9BE9C0_FOUND_CODE_TWO); }
export function a9be9c0FoundCodeThree() { return asU32(A9BE9C0_FOUND_CODE_THREE); }
export function a9be9c0ManagerGlobalVa() { return asU32(A9BE9C0_MANAGER_GLOBAL_VA); }
export function a9be9c0ReceiverOfs() { return asU32(A9BE9C0_RECEIVER_OFS); }
export function a9be9c0ReceiverGetterVa() { return asU32(A9BE9C0_RECEIVER_GETTER_VA); }
export function a9be9c0Va() { return asU32(A9BE9C0_VA); }
export function a9be9c0FirstRetVa() { return asU32(A9BE9C0_FIRST_RET_VA); }
export function a9be9c0RetVa() { return asU32(A9BE9C0_RET_VA); }
export function a9be9c0Int3Va() { return asU32(A9BE9C0_INT3_VA); }
export function a9be9c0BodyBytes() { return asU32(A9BE9C0_BODY_BYTES); }
export function a9be9c0Sites() { return asU32(A9BE9C0_SITES); }
export function a9be9c0SiteVa() { return asU32(A9BE9C0_SITE_VA); }
export function a9be9c0NextVa() { return asU32(A9BE9C0_NEXT_VA); }

/* ---- ABI v45: 0x009bea40 PURE f32-sum walk laws (see A9BEA40 consts). ---- */
export function a9bea40ListEmpty(listBegin, listEnd) {
  /* 0x009bea48 cmp eax,ecx / 0x009bea4a je 0x9bea70.  FULL dword
     begin==end -> ret +0.0f (loop never runs). */
  return asU32(listBegin) === asU32(listEnd);
}
export function a9bea40SlotCheckable(playerField2c) {
  /* 0x009bea52 cmp dword [edx+0x2c],0 / 0x009bea56 jne advance.  FULL
     dword: == 0 -> candidate may add. */
  return asU32(playerField2c) === 0;
}
export function a9bea40Flag20a9Checkable(playerFlag20a9) {
  /* 0x009bea58 cmp byte [edx+0x20a9],0 / 0x009bea5f jne advance.  RAW
     uint32 LOW byte: flag==0 -> may add; !=0 -> ADVANCE. */
  return asU32(playerFlag20a9 & 0xff) === 0;
}
export function a9bea40Field156cAddSs(sum, field156c) {
  /* 0x009bea61 addss xmm0,[edx+0x156c].  f32 round-to-nearest-even per
     add; NaN propagates.  Both operands are f32 in the PE (xmm0 kept f32
     across the loop), so each add re-rounds to f32. */
  return Math.fround(Math.fround(+sum) + Math.fround(+field156c));
}
export function a9bea40WalkNext(iter) {
  /* 0x009bea69 add eax,4.  32-bit wrap, stride 4. */
  return asU32(asU32(iter) + asU32(A9BEA40_LIST_STRIDE));
}
export function a9bea40WalkContinue(nextIter, listEnd) {
  /* 0x009bea6c cmp eax,ecx / 0x009bea6e jne 0x9bea50.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009bea45), NEVER
     re-read per iteration. */
  return asU32(nextIter) !== asU32(listEnd);
}
export function a9bea40ListBeginOfs() { return asU32(A9BEA40_LIST_BEGIN_OFS); }
export function a9bea40ListEndOfs() { return asU32(A9BEA40_LIST_END_OFS); }
export function a9bea40ListStride() { return asU32(A9BEA40_LIST_STRIDE); }
export function a9bea40SlotFlagOfs() { return asU32(A9BEA40_SLOT_FLAG_OFS); }
export function a9bea40Flag20a9Ofs() { return asU32(A9BEA40_FLAG20A9_OFS); }
export function a9bea40Field156cOfs() { return asU32(A9BEA40_FIELD156C_OFS); }
export function a9bea40ManagerGlobalVa() { return asU32(A9BEA40_MANAGER_GLOBAL_VA); }
export function a9bea40ReceiverOfs() { return asU32(A9BEA40_RECEIVER_OFS); }
export function a9bea40ReceiverGetterVa() { return asU32(A9BEA40_RECEIVER_GETTER_VA); }
export function a9bea40Va() { return asU32(A9BEA40_VA); }
export function a9bea40FirstRetVa() { return asU32(A9BEA40_FIRST_RET_VA); }
export function a9bea40RetVa() { return asU32(A9BEA40_RET_VA); }
export function a9bea40Int3Va() { return asU32(A9BEA40_INT3_VA); }
export function a9bea40BodyBytes() { return asU32(A9BEA40_BODY_BYTES); }
export function a9bea40Sites() { return asU32(A9BEA40_SITES); }
export function a9bea40Site0Va() { return asU32(A9BEA40_SITE0_VA); }
export function a9bea40Site1Va() { return asU32(A9BEA40_SITE1_VA); }
export function a9bea40Site2Va() { return asU32(A9BEA40_SITE2_VA); }
export function a9bea40NextVa() { return asU32(A9BEA40_NEXT_VA); }

/* ---- ABI v46: 0x009bea80 GetTrinketMultiplier laws (see GTM9BEA80
   consts).  NARROWED: pure gates/walk/sum compose TWO typed host events
   0x007cb6e0 (their bodies stay in the hud-post-update family).  The
   byte-gate laws take RAW uint32 and re-narrow (WIDE 0x100/0x1ff/0xffff
   ffff drives). ---- */
export function gtm9bea80IdMask(id) {
  /* 0x009beaa3 and edx,0x7fff.  RAW id & 0x7fff (15-bit trinket id). */
  return asU32(id) & GTM9BEA80_ID_MASK;
}
export function gtm9bea80ListCount(slotEnd, slotBegin) {
  /* 0x009beaa9 sub eax,esi / 0x009beaaf sar eax,2.  SIGNED arithmetic
     shift of the 32-bit-wrapped difference: count = (end-begin)>>2. */
  return asI32(asU32(slotEnd) - asU32(slotBegin)) >> 2;
}
export function gtm9bea80RangeGate(idMasked, count) {
  /* 0x009beab3 cmp edx,eax / 0x009beab5 jge 0x9bead3.  SIGNED jge:
     lookup runs iff (int32)id_masked < (int32)count. */
  return asI32(idMasked) < asI32(count);
}
export function gtm9bea80SlotPresent(slot) {
  /* 0x009beaba test eax,eax / 0x009beabc je 0x9bead3.  FULL dword
     slot != 0. */
  return asU32(slot) !== 0;
}
export function gtm9bea80SlotFlag(flagsB8) {
  /* 0x009beac4 and eax,0x80000000 / 0x009beace or eax,0 /
     0x009bead1 jne keep.  FULL dword bit31([slot+0xb8]) set -> flag 1. */
  return (asU32(flagsB8) & GTM9BEA80_TWIN_FLAG_BIT) !== 0;
}
export function gtm9bea80ListEmpty(listBegin, listEnd) {
  /* 0x009beadc cmp esi,[ebx+4] / 0x009beadf je 0x9beb1f.  FULL dword
     begin==end -> sum stays 0, loop never runs. */
  return asU32(listBegin) === asU32(listEnd);
}
export function gtm9bea80SlotCheckable(playerField2c) {
  /* 0x009beae5 cmp dword [ebx+0x2c],0 / 0x009beae9 jne advance.  FULL
     dword: == 0 -> candidate may call host1. */
  return asU32(playerField2c) === 0;
}
export function gtm9bea80SumAdd(acc, hostStatus) {
  /* 0x009beaf3 / 0x009beb0e: add edi,eax.  32-bit wrap. */
  return asU32(asU32(acc) + asU32(hostStatus));
}
export function gtm9bea80TwinCallNeeded(flag, twinPtr) {
  /* 0x009beaf5 cmp byte [esp+0x13],0 / je skip; 0x009beafc mov ecx,
     [ebx+0x1e6c]; 0x009beb02 test ecx,ecx / je skip.  flag LOW byte != 0
     AND twin ptr != 0 (FULL dword). */
  return ((asU32(flag) & 0xff) !== 0) && (asU32(twinPtr) !== 0);
}
export function gtm9bea80WalkNext(iter) {
  /* 0x009beb17 add esi,4.  32-bit wrap, stride 4. */
  return asU32(asU32(iter) + asU32(GTM9BEA80_LIST_STRIDE));
}
export function gtm9bea80WalkContinue(nextIter, listEnd) {
  /* 0x009beb1a cmp esi,[eax+4] / 0x009beb1d jne 0x9beae3.  FULL dword
     next != end; END RE-READ per iteration (this reloaded from the
     local save [esp+0x14] @ 0x009beb13) — matches 9be6b0/9be750. */
  return asU32(nextIter) !== asU32(listEnd);
}
export function gtm9bea80ResultSum(sum) {
  /* 0x009beb1f mov eax,edi -- return the accumulated sum (SIGNED int32
     consumer: cvtdq2ps @ caller 0x007fb90f). */
  return asU32(sum);
}
export function gtm9bea80ListBeginOfs() { return asU32(GTM9BEA80_LIST_BEGIN_OFS); }
export function gtm9bea80ListEndOfs() { return asU32(GTM9BEA80_LIST_END_OFS); }
export function gtm9bea80ListStride() { return asU32(GTM9BEA80_LIST_STRIDE); }
export function gtm9bea80SlotFlagOfs() { return asU32(GTM9BEA80_SLOT_FLAG_OFS); }
export function gtm9bea80TwinPtrOfs() { return asU32(GTM9BEA80_TWIN_PTR_OFS); }
export function gtm9bea80SlotArrayBeginOfs() { return asU32(GTM9BEA80_SLOT_ARRAY_BEGIN_OFS); }
export function gtm9bea80SlotArrayEndOfs() { return asU32(GTM9BEA80_SLOT_ARRAY_END_OFS); }
export function gtm9bea80Mask() { return asU32(GTM9BEA80_ID_MASK); }
export function gtm9bea80TwinFlagsOfs() { return asU32(GTM9BEA80_TWIN_FLAGS_OFS); }
export function gtm9bea80TwinFlagBit() { return asU32(GTM9BEA80_TWIN_FLAG_BIT); }
export function gtm9bea80ManagerGlobalVa() { return asU32(GTM9BEA80_MANAGER_GLOBAL_VA); }
export function gtm9bea80GameGlobalVa() { return asU32(GTM9BEA80_GAME_GLOBAL_VA); }
export function gtm9bea80ReceiverOfs() { return asU32(GTM9BEA80_RECEIVER_OFS); }
export function gtm9bea80HostStatusVa() { return asU32(GTM9BEA80_HOST_STATUS_VA); }
export function gtm9bea80Va() { return asU32(GTM9BEA80_VA); }
export function gtm9bea80FirstRetVa() { return asU32(GTM9BEA80_FIRST_RET_VA); }
export function gtm9bea80RetVa() { return asU32(GTM9BEA80_RET_VA); }
export function gtm9bea80Int3Va() { return asU32(GTM9BEA80_INT3_VA); }
export function gtm9bea80BodyBytes() { return asU32(GTM9BEA80_BODY_BYTES); }
export function gtm9bea80Sites() { return asU32(GTM9BEA80_SITES); }
export function gtm9bea80NextVa() { return asU32(GTM9BEA80_NEXT_VA); }

/* ---- ABI v47: 0x009beb30 all/any instant-death walk laws (see A9BEB30
   consts).  NARROWED: pure walk/gates/charge/combine compose ONE typed
   host event 0x007db6b0.  Byte gates take uint32_t args and re-narrow
   with &0xff in the body (Wasm ABI does not narrow i32 args; WIDE
   drives). ---- */
export function a9beb30ArgByte(arg) {
  /* 0x009beb34 mov bh,byte [ebp+8].  RAW arg & 0xff (LOW byte only). */
  return asU32(arg) & 0xff;
}
export function a9beb30ModeAnd(arg) {
  /* 0x009beb74 test bh,bh / 0x009beb76 je OR-path.  LOW byte != 0 -> AND. */
  return (asU32(arg) & 0xff) !== 0;
}
export function a9beb30ListEmpty(listBegin, listEnd) {
  /* 0x009beb40 cmp esi,edi / 0x009beb42 je ret.  FULL dword begin==end
     -> ret bl (= arg&0xff ECHO, NOT 0/1); consumers test al,al. */
  return asU32(listBegin) === asU32(listEnd);
}
export function a9beb30SlotCheckable(playerField2c) {
  /* 0x009beb46 cmp dword [ecx+0x2c],0 / 0x009beb4a jne advance.  FULL
     dword [p+0x2c]==0 -> candidate may run charge/host path. */
  return asU32(playerField2c) === 0;
}
export function a9beb30Flag20a9Checkable(playerField20a9) {
  /* 0x009beb4c cmp byte [ecx+0x20a9],0 / 0x009beb53 jne advance.  RAW
     uint32, LOW byte == 0 -> candidate. */
  return (asU32(playerField20a9) & 0xff) === 0;
}
export function a9beb30ChargeSum(field134c, field1344) {
  /* 0x009beb55 mov eax,[ecx+0x134c] / 0x009beb5b add eax,[ecx+0x1344].
     32-bit wrap. */
  return asU32(asU32(field134c) + asU32(field1344));
}
export function a9beb30ChargeGate(charge, chargeMax) {
  /* 0x009beb61 cmp eax,[ecx+0x1340] / 0x009beb67 jge 0x9beb72.  SIGNED
     (int32)a >= (int32)[p+0x1340] -> al=1 WITHOUT calling the host. */
  return asI32(charge) >= asI32(chargeMax);
}
export function a9beb30HostMatch(hostAl) {
  /* 0x009beb6e test al,al / 0x009beb70 je 0x9beb74 / 0x009beb72 mov
     al,1.  (host_al & 0xff) != 0 ? 1 : 0. */
  return (asU32(hostAl) & 0xff) !== 0;
}
export function a9beb30Combine(mode, bl, al) {
  /* 0x009beb74..0x009beb8c.  mode = bh (arg LOW byte).  mode != 0 ->
     AND bl = (bl != 0 && al != 0) ? 1 : 0 (all candidates must match;
     once 0 stays 0).  mode == 0 -> OR bl = (bl != 0 || al != 0) ? 1 :
     0 (any candidate matches; once 1 stays 1).  bl/al tested as LOW
     BYTES (8-bit test bl,bl / test al,al). */
  const m = asU32(mode) & 0xff;
  const b = asU32(bl) & 0xff;
  const a = asU32(al) & 0xff;
  if (m !== 0) {
    return (b !== 0 && a !== 0) ? 1 : 0;
  }
  return (b !== 0 || a !== 0) ? 1 : 0;
}
export function a9beb30WalkNext(iter) {
  /* 0x009beb8e add esi,4.  32-bit wrap, stride 4. */
  return asU32(asU32(iter) + asU32(A9BEB30_LIST_STRIDE));
}
export function a9beb30WalkContinue(nextIter, listEnd) {
  /* 0x009beb91 cmp esi,edi / 0x009beb93 jne 0x9beb44.  FULL dword next
     != end; END CAPTURED ONCE at entry (edi) — matches a9bea40/9be9c0/
     9be990, DIFFERS from 9bea80/9be6b0/9be750 re-read style. */
  return asU32(nextIter) !== asU32(listEnd);
}
export function a9beb30ResultByte(bl) {
  /* 0x009beb97 mov al,bl -- return the byte result (0/1, or arg&0xff
     echo when no candidate was processed). */
  return asU32(bl) & 0xff;
}
export function a9beb30ListBeginOfs() { return asU32(A9BEB30_LIST_BEGIN_OFS); }
export function a9beb30ListEndOfs() { return asU32(A9BEB30_LIST_END_OFS); }
export function a9beb30ListStride() { return asU32(A9BEB30_LIST_STRIDE); }
export function a9beb30SlotFlagOfs() { return asU32(A9BEB30_SLOT_FLAG_OFS); }
export function a9beb30Flag20a9Ofs() { return asU32(A9BEB30_FLAG20A9_OFS); }
export function a9beb30ChargeOfs() { return asU32(A9BEB30_CHARGE_OFS); }
export function a9beb30ChargeAddendOfs() { return asU32(A9BEB30_CHARGE_ADDEND_OFS); }
export function a9beb30ChargeMaxOfs() { return asU32(A9BEB30_CHARGE_MAX_OFS); }
export function a9beb30ManagerGlobalVa() { return asU32(A9BEB30_MANAGER_GLOBAL_VA); }
export function a9beb30ReceiverOfs() { return asU32(A9BEB30_RECEIVER_OFS); }
export function a9beb30HostCurseVa() { return asU32(A9BEB30_HOST_CURSE_VA); }
export function a9beb30Va() { return asU32(A9BEB30_VA); }
export function a9beb30FirstRetVa() { return asU32(A9BEB30_FIRST_RET_VA); }
export function a9beb30RetVa() { return asU32(A9BEB30_RET_VA); }
export function a9beb30Int3Va() { return asU32(A9BEB30_INT3_VA); }
export function a9beb30BodyBytes() { return asU32(A9BEB30_BODY_BYTES); }
export function a9beb30Sites() { return asU32(A9BEB30_SITES); }
export function a9beb30Site0Va() { return asU32(A9BEB30_SITE0_VA); }
export function a9beb30Site1Va() { return asU32(A9BEB30_SITE1_VA); }
export function a9beb30Site2Va() { return asU32(A9BEB30_SITE2_VA); }
export function a9beb30NextVa() { return asU32(A9BEB30_NEXT_VA); }

/* ---- ABI v48: 0x009beba0 avg-player-position walk laws (see A9BEBA0
   consts).  NARROWED (NOT PURE-removed): pure walk + slot/watch/flag20a9
   gates + gobj scan + f32 accumulate/average math; the 2 INDIRECT host
   predicates ([[gitem+0x370]+0x14], byte result) and the 2 E8 assert
   calls 0x00a112c0 stay typed host events; observable stores (out float2
   + cache 0xc9436c/0xc94370 + cacheTs 0xc5c4d4) are POST events — laws
   compute the VALUES.  Byte gates take uint32_t args and re-narrow with
   &0xff in the body (Wasm ABI does not narrow i32 args; WIDE drives). ---- */
export function a9beba0ModeFast(arg) {
  /* 0x009beba6 cmp byte [ebp+0xc],0 / 0x009bebb2 je slow.  (arg&0xff)!=0
     -> fast path (cache eligible). */
  return (asU32(arg) & 0xff) !== 0;
}
export function a9beba0CacheFresh(gobjTs, cacheTs) {
  /* 0x009bebbf cmp eax,[0xc5c4d4] / 0x009bebc5 jne slow.  FULL dword
     ts == cacheTs -> use cached float2. */
  return asU32(gobjTs) === asU32(cacheTs);
}
export function a9beba0ListCount(listBegin, listEnd) {
  /* 0x009bec12..14 (also 0x009bece8, 0x009bed07..09, 0x009bee22..24):
     sub eax,[esi] / sar eax,2.  SIGNED SAR32(end-begin,2). */
  return asI32(asU32(listEnd) - asU32(listBegin)) >> 2;
}
export function a9beba0IdxInRange(idx, count) {
  /* 0x009bec53..55: cmp ebx,ecx / jae guard.  FULL dword idx < count. */
  return asU32(idx) < asU32(count);
}
export function a9beba0SlotEligible(playerField2c) {
  /* 0x009bec5c..60: cmp dword [edi+0x2c],0 / jne advance.  FULL dword
     [p+0x2c]==0 -> candidate eligible. */
  return asU32(playerField2c) === 0;
}
export function a9beba0WatchGate(playerField13c0) {
  /* 0x009bec62..69: cmp dword [edi+0x13c0],0x23 / jne scan.  FULL dword
     != 0x23 -> candidate passes the watch gate. */
  return asU32(playerField13c0) !== A9BEBA0_WATCH_VALUE;
}
export function a9beba0Flag20a9Gate(playerField20a9) {
  /* 0x009bec6b..72: cmp byte [edi+0x20a9],0 / je advance.  LOW byte
     [p+0x20a9] != 0 -> candidate passes. */
  return (asU32(playerField20a9) & 0xff) !== 0;
}
export function a9beba0PlayerCandidate(field2c, field13c0, field20a9) {
  /* composed eligibility: [p+0x2c]==0 && ([p+0x13c0]!=0x23 ||
     byte[p+0x20a9]!=0) -> gobj scan + accumulate allowed. */
  return a9beba0SlotEligible(field2c) &&
    (a9beba0WatchGate(field13c0) || a9beba0Flag20a9Gate(field20a9));
}
export function a9beba0LookupMatch(itemTagC, want) {
  /* 0x009beca2 / 0x009bed42: cmp [item+0xc],want / je found.  FULL dword
     [gitem+0xc] == want -> scan hit. */
  return asU32(itemTagC) === asU32(want);
}
export function a9beba0ScanEmpty(listBegin, listEnd) {
  /* 0x009bec85..87 / 0x009bed27..29: cmp ecx,edx / je accumulate.  FULL
     dword gobj begin==end -> accumulate WITHOUT predicate. */
  return asU32(listBegin) === asU32(listEnd);
}
export function a9beba0ScanContinue(index, count) {
  /* 0x009becaf..b1 / 0x009bed4f..51: cmp eax,edx / jb loop.  FULL dword
     index < count -> keep scanning. */
  return asU32(index) < asU32(count);
}
export function a9beba0AccumGate(found, predOk) {
  /* found && !pred -> skip; else accumulate.  found/pred FULL dword
     nonzero = set (the PE je/jne CF facts). */
  if (asU32(found) !== 0 && asU32(predOk) === 0) {
    return 0;
  }
  return 1;
}
export function a9beba0PredMatch(hostAl) {
  /* 0x009bedd5 / 0x009bee00: test al,al.  (host_al & 0xff) != 0 -> pred
     ok (2 INDIRECT host predicates, same vtable slot, byte result). */
  return (asU32(hostAl) & 0xff) !== 0;
}
export function a9beba0AccumX(sumX, posX) {
  /* 0x009becbe / 0x009bed61: addss xmm2,[elem+0x33c].  f32 x accum. */
  return Math.fround(Math.fround(+sumX) + Math.fround(+posX));
}
export function a9beba0AccumY(sumY, posY) {
  /* 0x009becb6 / 0x009bed59: addss xmm1,[elem+0x340].  f32 y accum. */
  return Math.fround(Math.fround(+sumY) + Math.fround(+posY));
}
export function a9beba0CountInc(count) {
  /* 0x009becc6 / 0x009bed69: inc dword [ebp-8].  count + 1 (32-bit wrap). */
  return asU32(asU32(count) + 1);
}
export function a9beba0HasAvg(count) {
  /* 0x009bed9f..a1: test edx,edx / jle fallback.  SIGNED count > 0 ->
     use average; else fallback to first player pos. */
  return asI32(count) > 0;
}
export function a9beba0AvgX(sumX, count) {
  /* 0x009bedae: divss xmm2,(float)count.  f32 x average. */
  return Math.fround(Math.fround(+sumX) / Math.fround(+count));
}
export function a9beba0AvgY(sumY, count) {
  /* 0x009bedaa: divss xmm1,(float)count.  f32 y average. */
  return Math.fround(Math.fround(+sumY) / Math.fround(+count));
}
export function a9beba0FallbackX(posX) {
  /* 0x009bee42: movss xmm2,[player0+0x33c].  f32 fallback x. */
  return Math.fround(+posX);
}
export function a9beba0FallbackY(posY) {
  /* 0x009bee4a: movss xmm1,[player0+0x340].  f32 fallback y. */
  return Math.fround(+posY);
}
export function a9beba0AssertNeeded(count) {
  /* 0x009bec2c..2e / 0x009bee27..29: test eax,eax / jne ok.  FULL dword
     count==0 -> HOST assert 0x00a112c0 ("Gamestate corrupted..."). */
  return asU32(count) === 0;
}
export function a9beba0ListBeginOfs() { return asU32(A9BEBA0_LIST_BEGIN_OFS); }
export function a9beba0ListEndOfs() { return asU32(A9BEBA0_LIST_END_OFS); }
export function a9beba0ListStride() { return asU32(A9BEBA0_LIST_STRIDE); }
export function a9beba0SecondListBeginOfs() { return asU32(A9BEBA0_SECOND_LIST_BEGIN_OFS); }
export function a9beba0SecondListEndOfs() { return asU32(A9BEBA0_SECOND_LIST_END_OFS); }
export function a9beba0SlotFlagOfs() { return asU32(A9BEBA0_SLOT_FLAG_OFS); }
export function a9beba0WatchOfs() { return asU32(A9BEBA0_WATCH_OFS); }
export function a9beba0WatchValue() { return asU32(A9BEBA0_WATCH_VALUE); }
export function a9beba0Flag20a9Ofs() { return asU32(A9BEBA0_FLAG20A9_OFS); }
export function a9beba0LookupKeyOfs() { return asU32(A9BEBA0_LOOKUP_KEY_OFS); }
export function a9beba0LookupTagOfs() { return asU32(A9BEBA0_LOOKUP_TAG_OFS); }
export function a9beba0PosXOfs() { return asU32(A9BEBA0_POS_X_OFS); }
export function a9beba0PosYOfs() { return asU32(A9BEBA0_POS_Y_OFS); }
export function a9beba0PredObjOfs() { return asU32(A9BEBA0_PRED_OBJ_OFS); }
export function a9beba0PredSlotOfs() { return asU32(A9BEBA0_PRED_SLOT_OFS); }
export function a9beba0GobjTsOfs() { return asU32(A9BEBA0_GOBJ_TS_OFS); }
export function a9beba0GobjListBeginOfs() { return asU32(A9BEBA0_GOBJ_LIST_BEGIN_OFS); }
export function a9beba0GobjListEndOfs() { return asU32(A9BEBA0_GOBJ_LIST_END_OFS); }
export function a9beba0CacheTsVa() { return asU32(A9BEBA0_CACHE_TS_VA); }
export function a9beba0CacheXVa() { return asU32(A9BEBA0_CACHE_X_VA); }
export function a9beba0CacheYVa() { return asU32(A9BEBA0_CACHE_Y_VA); }
export function a9beba0GobjGlobalVa() { return asU32(A9BEBA0_GOBJ_GLOBAL_VA); }
export function a9beba0ManagerGlobalVa() { return asU32(A9BEBA0_MANAGER_GLOBAL_VA); }
export function a9beba0ReceiverOfs() { return asU32(A9BEBA0_RECEIVER_OFS); }
export function a9beba0AssertVa() { return asU32(A9BEBA0_ASSERT_VA); }
export function a9beba0AssertMsgVa() { return asU32(A9BEBA0_ASSERT_MSG_VA); }
export function a9beba0AssertCode() { return asU32(A9BEBA0_ASSERT_CODE); }
export function a9beba0Va() { return asU32(A9BEBA0_VA); }
export function a9beba0FirstRetVa() { return asU32(A9BEBA0_FIRST_RET_VA); }
export function a9beba0RetVa() { return asU32(A9BEBA0_RET_VA); }
export function a9beba0Int3Va() { return asU32(A9BEBA0_INT3_VA); }
export function a9beba0BodyBytes() { return asU32(A9BEBA0_BODY_BYTES); }
export function a9beba0Sites() { return asU32(A9BEBA0_SITES); }
export function a9beba0Site0Va() { return asU32(A9BEBA0_SITE0_VA); }
export function a9beba0Site1Va() { return asU32(A9BEBA0_SITE1_VA); }
export function a9beba0Site2Va() { return asU32(A9BEBA0_SITE2_VA); }
export function a9beba0Site3Va() { return asU32(A9BEBA0_SITE3_VA); }
export function a9beba0Site4Va() { return asU32(A9BEBA0_SITE4_VA); }
export function a9beba0Site5Va() { return asU32(A9BEBA0_SITE5_VA); }
export function a9beba0Site6Va() { return asU32(A9BEBA0_SITE6_VA); }
export function a9beba0Site7Va() { return asU32(A9BEBA0_SITE7_VA); }
export function a9beba0Site8Va() { return asU32(A9BEBA0_SITE8_VA); }
export function a9beba0NextVa() { return asU32(A9BEBA0_NEXT_VA); }

/* ---- ABI v49: 0x009bfa70 PURE bool-walk counter laws (see A9BFA70
   consts).  PURE (0 E8 / 0 indirect / 0 observable stores).  All
   gates FULL dword except flag20a9 LOW byte (& 0xff in the body —
   Wasm ABI does not narrow i32 args; WIDE drives). ---- */
export function a9bfa70ListCount(listBegin, listEnd) {
  /* 0x009bfa82: sar ebx,2.  SIGNED SAR32(end-begin,2); begin/end
     captured once at entry (begin re-read from local each iter). */
  return asI32(asU32(listEnd) - asU32(listBegin)) >> 2;
}
export function a9bfa70IdxContinue(idx, count) {
  /* 0x009bfad1..d3: cmp ecx,ebx / jb loop.  FULL dword idx < count. */
  return asU32(idx) < asU32(count);
}
export function a9bfa70SlotFree(playerField2c) {
  /* 0x009bfa93..97: cmp dword [eax+0x2c],0 / jne skip.  FULL dword
     [p+0x2c]==0 -> slot free. */
  return asU32(playerField2c) === 0;
}
export function a9bfa70StateIdle(playerField3bc) {
  /* 0x009bfa99..a0: cmp dword [eax+0x3bc],0 / jne skip.  FULL dword
     [p+0x3bc]==0 -> state idle. */
  return asU32(playerField3bc) === 0;
}
export function a9bfa70LinkNull(link) {
  /* 0x009bfaa8..aa: test edx,edx / je flagcheck.  FULL dword
     link==0 -> flag check (count-eligible). */
  return asU32(link) === 0;
}
export function a9bfa70LinkIndexNeg1(linkIndex) {
  /* 0x009bfab2..b5: cmp edi,-1 / je flagcheck.  FULL dword
     linkIdx == 0xffffffff -> flag check. */
  return asU32(linkIndex) === 0xffffffff;
}
export function a9bfa70IndexGe(linkIndex, ownIndex) {
  /* 0x009bfab7..bd: cmp edi,[eax+0x161c] / jge flagcheck.  SIGNED
     int32 linkIdx >= ownIdx -> flag check (jge). */
  return asI32(linkIndex) >= asI32(ownIndex);
}
export function a9bfa70LinkIsSelf(link, player) {
  /* 0x009bfabf..c1: cmp edx,eax / jne skip.  FULL dword link ==
     player ptr -> flag check. */
  return asU32(link) === asU32(player);
}
export function a9bfa70Flag20a9Set(playerField20a9) {
  /* 0x009bfac3..ca: cmp byte [eax+0x20a9],0 / je skip.  LOW byte
     [p+0x20a9] != 0 -> counted. */
  return (asU32(playerField20a9) & 0xff) !== 0;
}
export function a9bfa70CountGate(slotFree, stateIdle, linkNull,
                                 linkIndexNeg1, indexGe, linkIsSelf,
                                 flag20a9Set) {
  /* composed `inc esi` gate (0x009bfacc): slot_free && state_idle &&
     (link_null || link_index_neg1 || index_ge || link_is_self) &&
     flag20a9_set — each param is the corresponding LAW VALUE (0/1). */
  return Boolean(slotFree) && Boolean(stateIdle) &&
    (Boolean(linkNull) || Boolean(linkIndexNeg1) ||
     Boolean(indexGe) || Boolean(linkIsSelf)) && Boolean(flag20a9Set);
}
export function a9bfa70CountResult(res, gate) {
  /* 0x009bfacc: inc esi.  res + (gate ? 1 : 0), 32-bit wrap. */
  return asU32(asU32(res) + (Boolean(gate) ? 1 : 0));
}
export function a9bfa70ListBeginOfs() { return asU32(A9BFA70_LIST_BEGIN_OFS); }
export function a9bfa70ListEndOfs() { return asU32(A9BFA70_LIST_END_OFS); }
export function a9bfa70ListStride() { return asU32(A9BFA70_LIST_STRIDE); }
export function a9bfa70SlotFlagOfs() { return asU32(A9BFA70_SLOT_FLAG_OFS); }
export function a9bfa70StateOfs() { return asU32(A9BFA70_STATE_OFS); }
export function a9bfa70LinkOfs() { return asU32(A9BFA70_LINK_OFS); }
export function a9bfa70IndexOfs() { return asU32(A9BFA70_INDEX_OFS); }
export function a9bfa70Flag20a9Ofs() { return asU32(A9BFA70_FLAG20A9_OFS); }
export function a9bfa70ManagerGlobalVa() { return asU32(A9BFA70_MANAGER_GLOBAL_VA); }
export function a9bfa70ReceiverOfs() { return asU32(A9BFA70_RECEIVER_OFS); }
export function a9bfa70Va() { return asU32(A9BFA70_VA); }
export function a9bfa70FirstRetVa() { return asU32(A9BFA70_FIRST_RET_VA); }
export function a9bfa70RetVa() { return asU32(A9BFA70_RET_VA); }
export function a9bfa70Int3Va() { return asU32(A9BFA70_INT3_VA); }
export function a9bfa70BodyBytes() { return asU32(A9BFA70_BODY_BYTES); }
export function a9bfa70Sites() { return asU32(A9BFA70_SITES); }
export function a9bfa70Site0Va() { return asU32(A9BFA70_SITE0_VA); }
export function a9bfa70Site1Va() { return asU32(A9BFA70_SITE1_VA); }
export function a9bfa70Site2Va() { return asU32(A9BFA70_SITE2_VA); }
export function a9bfa70Site3Va() { return asU32(A9BFA70_SITE3_VA); }
export function a9bfa70NextVa() { return asU32(A9BFA70_NEXT_VA); }

/* ---- ABI v50: 0x009ba980 PURE bit-0x10 getter laws (see CBO9BA980
   consts).  PURE (0 E8 / 0 indirect / 0 observable stores).  The mask
   gate is FULL dword & 0x10 (bit 4 = Coop Babies challenge bit of
   Game+0x26548); no uint8_t params — Wasm ABI does not narrow i32
   args; WIDE drives prove the mask. ---- */
export function cbo9ba980FlagBit4Set(field26548) {
  /* 0x009ba98b and eax,0x10 / 0x009ba98e or eax,0 / 0x009ba991 je:
     bit 4 of the raw dword -> al=1, else al=0.  The `or eax,0` only
     sets flags; value unchanged. */
  return (asU32(field26548) & CBO9BA980_BITSET_MASK) !== 0;
}
export function cbo9ba980ResultTrue() {
  /* 0x009ba993 mov al,1.  TRUE result 1 (bit set). */
  return asU32(1);
}
export function cbo9ba980ResultFalse() {
  /* 0x009ba996 xor al,al.  FALSE result 0 (bit clear). */
  return asU32(0);
}
export function cbo9ba980BitsetOfs() { return asU32(CBO9BA980_BITSET_OFS); }
export function cbo9ba980BitsetMask() { return asU32(CBO9BA980_BITSET_MASK); }
export function cbo9ba980ManagerGlobalVa() {
  return asU32(CBO9BA980_MANAGER_GLOBAL_VA);
}
export function cbo9ba980Va() { return asU32(CBO9BA980_VA); }
export function cbo9ba980FirstRetVa() { return asU32(CBO9BA980_FIRST_RET_VA); }
export function cbo9ba980RetVa() { return asU32(CBO9BA980_RET_VA); }
export function cbo9ba980Int3Va() { return asU32(CBO9BA980_INT3_VA); }
export function cbo9ba980BodyBytes() { return asU32(CBO9BA980_BODY_BYTES); }
export function cbo9ba980Sites() { return asU32(CBO9BA980_SITES); }
export function cbo9ba980Site0Va() { return asU32(CBO9BA980_SITE0_VA); }
export function cbo9ba980Site1Va() { return asU32(CBO9BA980_SITE1_VA); }
export function cbo9ba980Site2Va() { return asU32(CBO9BA980_SITE2_VA); }
export function cbo9ba980NextVa() { return asU32(CBO9BA980_NEXT_VA); }

/* ---- ABI v52: 0x009c6110 laws (see A9C6110 consts).  PE:
   cmp dword [ecx],1 ; jne ret            FULL-DWORD state==1 gate
   xor edx,edx ; cmp edx,[eax+8]          flags of 0 - field8
   sbb eax,eax ; and eax,0xfffffffe ; add eax,4   2 (CF=1) / 4 (CF=0)
   mov [ecx],eax                          store ONLY under the gate
   CF = (field8 != 0u). ---- */
export function a9c6110Gate(state) {
  /* 0x009c6116 cmp dword [ecx],1 / jne 0x9c612d — FULL-DWORD equality;
     0x100/0x1ff/0xffffffff do NOT gate. */
  return asU32(asU32(state) === A9C6110_MATCH_STATE ? 1 : 0);
}
export function a9c6110Value(field8) {
  /* sbb/and/add chain: (field8 != 0u) ? 2 : 4 (unsigned borrow). */
  return asU32(asU32(field8) !== 0 ? A9C6110_VALUE_TWO : A9C6110_VALUE_FOUR);
}
export function a9c6110NextState(state, field8) {
  /* Whole body: the store fires ONLY under the gate; the gate-miss arm
     returns the state unchanged. */
  if (asU32(state) !== A9C6110_MATCH_STATE) return asU32(state);
  return a9c6110Value(field8);
}
export function a9c6110Field8Ofs() { return asU32(A9C6110_FIELD8_OFS); }
export function a9c6110StateOfs() { return asU32(A9C6110_STATE_OFS); }
export function a9c6110MatchState() { return asU32(A9C6110_MATCH_STATE); }
export function a9c6110ValueTwo() { return asU32(A9C6110_VALUE_TWO); }
export function a9c6110ValueFour() { return asU32(A9C6110_VALUE_FOUR); }
export function a9c6110Va() { return asU32(A9C6110_VA); }
export function a9c6110FirstRetVa() { return asU32(A9C6110_FIRST_RET_VA); }
export function a9c6110RetVa() { return asU32(A9C6110_RET_VA); }
export function a9c6110Int3Va() { return asU32(A9C6110_INT3_VA); }
export function a9c6110BodyBytes() { return asU32(A9C6110_BODY_BYTES); }
export function a9c6110Sites() { return asU32(A9C6110_SITES); }
export function a9c6110PointerRefVa() { return asU32(A9C6110_POINTER_REF_VA); }
export function a9c6110HostWalkVa() { return asU32(A9C6110_HOST_WALK_VA); }
export function a9c6110WalkOwnerVa() { return asU32(A9C6110_WALK_OWNER_VA); }
export function a9c6110NextVa() { return asU32(A9C6110_NEXT_VA); }
