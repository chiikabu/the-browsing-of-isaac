/** Independent JS oracle for small frame/menu opaque pure shells
 *  (VA 0x004212c0 / 0x004257b0 / MenuGate_Update 0x009b6840 /
 *  Do not derive from the C++ mechanically. */

export const FRAME_OPAQUE_PURE_ABI_VERSION = 64;

export const FRAME_OPAQUE_409030_PATH_ADVANCE_MID = 0;
export const FRAME_OPAQUE_409030_PATH_REWIND = 1;
export const FRAME_OPAQUE_409030_PATH_NO_LOOP = 2;

export const FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK = 0;
export const FRAME_OPAQUE_956110_PATH_GENERAL = 1;

export const FRAME_OPAQUE_HOST_ADVANCE_POSITION_VA = 0x00408d00;
export const FRAME_OPAQUE_HOST_REWIND_VA = 0x0040a1b0;
export const FRAME_OPAQUE_HOST_FLOOR_VA = 0x00af0917;
export const FRAME_OPAQUE_HOST_408C90_VA = 0x00408c90;
export const FRAME_OPAQUE_HOST_408B90_VA = 0x00408b90;
export const FRAME_OPAQUE_HOST_408C10_VA = 0x00408c10;
export const FRAME_OPAQUE_HOST_ASSERT_LOG_VA = 0x00a112c0;
export const FRAME_OPAQUE_HOST_98DBA0_VA = 0x0098dba0;
export const FRAME_OPAQUE_HOST_956110_VA = 0x00956110;
export const FRAME_OPAQUE_HOST_90B100_VA = 0x0090b100; /* NetplayManager::IsIdxLocalPlayer */
export const FRAME_OPAQUE_HOST_A20390_VA = 0x00a20390;
export const FRAME_OPAQUE_HOST_746560_VA = 0x00746560;
export const FRAME_OPAQUE_HOST_864C30_VA = 0x00864c30; /* 956110 net early host */
export const FRAME_OPAQUE_HOST_A20940_VA = 0x00a20940; /* 956110 general callback */
export const FRAME_OPAQUE_HOST_874910_VA = 0x00874910; /* 864c30 lua pack host */
export const FRAME_OPAQUE_HOST_6A80F0_VA = 0x006a80f0; /* 864c30 rawgeti-shaped */
export const FRAME_OPAQUE_864C30_CAPABILITY_BIT = 0x2000;
export const FRAME_OPAQUE_864C30_PACK_KIND_IMM = 0xd;
export const FRAME_OPAQUE_864C30_NET_FIELD10_OFF = 0x10;
export const FRAME_OPAQUE_864C30_LUA_REGISTRYINDEX = 0xfff0b9d8;
/* ABI v18: 864c30 SEH vtbl dispatch + nested 6a80f0 / 874910 split. */
export const FRAME_OPAQUE_HOST_693180_VA = 0x00693180; /* SEH side log */
export const FRAME_OPAQUE_HOST_85BFF0_VA = 0x0085bff0; /* kind push thunk */
export const FRAME_OPAQUE_HOST_85C080_VA = 0x0085c080; /* pcall error fmt */
export const FRAME_OPAQUE_HOST_8727D0_VA = 0x008727d0; /* noreturn throw */
export const FRAME_OPAQUE_864C30_NET_GLOBAL_VA = 0x00c71678;
export const FRAME_OPAQUE_864C30_SEH_VTBL_NAME_OFF = 4;
export const FRAME_OPAQUE_864C30_SEH_SIDE_RECEIVER_OFF = 0x68d78;
export const FRAME_OPAQUE_874910_USERDATA_SIZE = 8;
export const FRAME_OPAQUE_874910_USERDATA_TAG = 0x00b753c8;
export const FRAME_OPAQUE_874910_METATABLE_KEY = 0x00c8297a;
export const FRAME_OPAQUE_874910_PCALL_NARGS = 5;
export const FRAME_OPAQUE_874910_PCALL_NRESULTS = 1;
export const FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN = 6;

/* ABI v19: FUN_0085c080 error-record builder. */
export const FRAME_OPAQUE_HOST_40CCD0_VA = 0x0040ccd0;
export const FRAME_OPAQUE_HOST_40CF00_VA = 0x0040cf00;
export const FRAME_OPAQUE_HOST_AF08BD_VA = 0x00af08bd;
export const FRAME_OPAQUE_85C080_RECORD_SIZE = 0x28;
export const FRAME_OPAQUE_85C080_VTABLE = 0x00b753d0;
export const FRAME_OPAQUE_85C080_STATE_OFF = 0xc;
export const FRAME_OPAQUE_85C080_STRING_OFF = 0x10;
export const FRAME_OPAQUE_85C080_STRING_SIZE_OFF = 0x20;
export const FRAME_OPAQUE_85C080_STRING_CAP_OFF = 0x24;
export const FRAME_OPAQUE_85C080_SSO_CAPACITY = 0xf;
export const FRAME_OPAQUE_85C080_SSO_BUF_BYTES = 0x10;
export const FRAME_OPAQUE_85C080_FALLBACK_STR_VA = 0x00b1a4ec;
export const FRAME_OPAQUE_85C080_LITERAL_VA = 0x00b6e96c;
export const FRAME_OPAQUE_85C080_LITERAL_LEN = 0xd;
export const FRAME_OPAQUE_85C080_MAX_CAPACITY = 0x7fffffff;

/* ABI v20: FUN_0040ccd0 assign + guest allocator wrapper. */
export const FRAME_OPAQUE_HOST_A0F4C0_VA = 0x00a0f4c0;
export const FRAME_OPAQUE_HOST_AEF15C_VA = 0x00aef15c;
export const FRAME_OPAQUE_HOST_AF05DF_VA = 0x00af05df;
export const FRAME_OPAQUE_HOST_40CCC0_VA = 0x0040ccc0;
export const FRAME_OPAQUE_HOST_40CEE0_VA = 0x0040cee0;
export const FRAME_OPAQUE_HOST_ALLOC_WRAPPER_VA = 0x0040cf00;
export const FRAME_OPAQUE_STRING_SIZE_OFF = 0x10;
export const FRAME_OPAQUE_STRING_CAP_OFF = 0x14;
export const FRAME_OPAQUE_STRING_SSO_BYTES = 0x10;
export const FRAME_OPAQUE_STRING_MAX_SIZE = 0x7fffffff;
export const FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD = 0x1000;
export const FRAME_OPAQUE_ALLOC_HEADER_BIAS = 0x23;
export const FRAME_OPAQUE_ALLOC_ALIGN_MASK = 0xffffffe0;
export const FRAME_OPAQUE_ALLOC_DELTA_MAX = 0x1f;

/* ABI v23: FUN_00874a10 lua pack/push sibling (3-arg pcall, byte→boolean). */
export const FRAME_OPAQUE_874A10_VA = 0x00874a10;
export const FRAME_OPAQUE_874A10_END_VA = 0x00874ab4;
export const FRAME_OPAQUE_874A10_RET_BYTES = 0xc;
export const FRAME_OPAQUE_874A10_CALL_SITES = 3;
export const FRAME_OPAQUE_874A10_PCALL_NARGS = 3;
export const FRAME_OPAQUE_874A10_PUSH_SEQUENCE_LEN = 4;
export const FRAME_OPAQUE_874A10_BYTE_ARG_MASK = 0xff;
export const FRAME_OPAQUE_874A10_PUSH_BOOL_BYTE = 7;
export const FRAME_OPAQUE_HOST_PUSHBOOLEAN_IAT_VA = 0x00b183ec;

/* ABI v24: FUN_0040cfe0 MSVC basic_string default-init. */
export const FRAME_OPAQUE_40CFE0_VA = 0x0040cfe0;
export const FRAME_OPAQUE_40CFE0_END_VA = 0x0040cff1;
export const FRAME_OPAQUE_40CFE0_RET_BYTES = 0;
export const FRAME_OPAQUE_40CFE0_CALL_SITES = 1;
export const FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY = 0xf;

/* ABI v25: FUN_0040cca0 MSVC basic_string zero-init sibling
   (0x0040cca0…0x0040ccb6, thiscall ret 4; one stack arg, NEVER read).
   The buffer store is a DWORD (bytes 0..3) and the capacity literal is 0 —
   both deliberately different from the default-init 0x0040cfe0 (byte 0,
   0xf), pinned by tests. */
export const FRAME_OPAQUE_40CCA0_VA = 0x0040cca0;
export const FRAME_OPAQUE_40CCA0_END_VA = 0x0040ccb6;
export const FRAME_OPAQUE_40CCA0_RET_BYTES = 4;
export const FRAME_OPAQUE_40CCA0_CALL_SITES = 1;
export const FRAME_OPAQUE_40CCA0_ZERO_CAPACITY = 0;

/* ABI v26: FUN_0040d000 release wrapper + FUN_0040d040 string tidy. */
export const FRAME_OPAQUE_40D000_VA = 0x0040d000;
export const FRAME_OPAQUE_40D000_END_VA = 0x0040d02e; /* the `ret 8` */
export const FRAME_OPAQUE_40D000_RET_BYTES = 8;
export const FRAME_OPAQUE_40D000_CALL_SITES = 2; /* e8: 0x41416b, 0x68753c */
export const FRAME_OPAQUE_40D040_VA = 0x0040d040;
export const FRAME_OPAQUE_40D040_END_VA = 0x0040d084; /* the plain `ret` */
export const FRAME_OPAQUE_40D040_RET_BYTES = 0;
export const FRAME_OPAQUE_40D040_CALL_SITES = 1321; /* 1288 e8 + 33 e9 tail */
export const FRAME_OPAQUE_40D040_RESET_CAPACITY = 0xf;
export const FRAME_OPAQUE_HOST_INVALID_PARAM_VA = 0x00b18894; /* IAT:
  api-ms-win-crt-runtime-l1-1-0.dll!_invalid_parameter_noinfo_noreturn */

/* ABI v22: FUN_0040cf50 basic_string copy-construct. */
export const FRAME_OPAQUE_40CF50_VA = 0x0040cf50;
export const FRAME_OPAQUE_40CF50_END_VA = 0x0040cfd3;
export const FRAME_OPAQUE_40CF50_RET_BYTES = 4;
export const FRAME_OPAQUE_40CF50_CALL_SITES = 370;
export const FRAME_OPAQUE_40CF50_SSO_LIMIT = 0x10;
export const FRAME_OPAQUE_40CF50_SSO_CAPACITY = 0xf;
export const FRAME_OPAQUE_40CF50_SSO_COPY_BYTES = 0x10;
export const FRAME_OPAQUE_40CF50_ROUND_MASK = 0xf;
export const FRAME_OPAQUE_40CF50_CAPACITY_MAX = 0x7fffffff;

export const FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK = 0;
export const FRAME_OPAQUE_85C080_PATH_MISSING_ERROR = 1;

export const FRAME_OPAQUE_874910_PUSH_CALLBACK_REF = 0;
export const FRAME_OPAQUE_874910_PUSH_INT_PACK4 = 1;
export const FRAME_OPAQUE_874910_PUSH_INT_PACK8 = 2;
export const FRAME_OPAQUE_874910_PUSH_USERDATA = 3;
export const FRAME_OPAQUE_874910_PUSH_NIL = 4;
export const FRAME_OPAQUE_874910_PUSH_INT_SUB = 5;
export const FRAME_OPAQUE_874910_PUSH_INT_KIND = 6;
export const FRAME_OPAQUE_956110_WALK_VTBL_OFF = 0x30;
export const FRAME_OPAQUE_956110_GENERAL_VTBL_OFF = 0x74;
export const FRAME_OPAQUE_956110_MANAGER_MODE_OFF = 8;
export const FRAME_OPAQUE_PLAYER_ID_OFF = 0x1618;
export const FRAME_OPAQUE_MP_ENTRY_ID_OFF = 0xc;
export const FRAME_OPAQUE_MP_VTBL_HOLDER_OFF = 0x370;
export const FRAME_OPAQUE_MP_VTBL_SLOT_OFF = 0x14;
export const FRAME_OPAQUE_RTTI_FIELD_378_OFF = 0x378;

export const FRAME_OPAQUE_ANIMSTATE_ANIM_OFF = 4;
export const FRAME_OPAQUE_ANIMSTATE_FRAME_OFF = 0x10;
export const FRAME_OPAQUE_ANIMSTATE_MASK18_OFF = 0x18;
export const FRAME_OPAQUE_ANIMSTATE_MASK1C_OFF = 0x1c;
export const FRAME_OPAQUE_ANIMDATA_EVENT_BASE_OFF = 0x28;
export const FRAME_OPAQUE_ANIMDATA_EVENT_COUNT_OFF = 0x2c;
export const FRAME_OPAQUE_ANIM_EVENT_STRIDE = 8;
export const FRAME_OPAQUE_ANIM_EVENT_BIT_OFF = 0;
export const FRAME_OPAQUE_ANIM_EVENT_FRAME_OFF = 4;

export const FRAME_OPAQUE_ANIMSTATE_LAYER_POS_OFF = 8;
export const FRAME_OPAQUE_ANIMDATA_LAYER_BASE_OFF = 0x18;
export const FRAME_OPAQUE_ANIMDATA_LAYER_COUNT_OFF = 0x1c;
export const FRAME_OPAQUE_LAYER_DESC_STRIDE = 0x10;
export const FRAME_OPAQUE_LAYER_DESC_FRAME_TABLE_OFF = 4;
export const FRAME_OPAQUE_LAYER_DESC_FRAME_COUNT_OFF = 8;
export const FRAME_OPAQUE_LAYER_ENTRY_STRIDE = 0x6c;
export const FRAME_OPAQUE_LAYER_ENTRY_FRAME_OFF = 0x68;

export const FRAME_OPAQUE_ANIMSTATE_NULL_POS_OFF = 0xc;
export const FRAME_OPAQUE_ANIMDATA_NULL_BASE_OFF = 0x20;
export const FRAME_OPAQUE_ANIMDATA_NULL_COUNT_OFF = 0x24;
export const FRAME_OPAQUE_NULL_DESC_STRIDE = 0x10;
export const FRAME_OPAQUE_NULL_DESC_FRAME_TABLE_OFF = 8;
export const FRAME_OPAQUE_NULL_DESC_FRAME_COUNT_OFF = 0xc;
export const FRAME_OPAQUE_NULL_ENTRY_STRIDE = 0x54;
export const FRAME_OPAQUE_NULL_ENTRY_FRAME_OFF = 0x50;

export const FRAME_OPAQUE_40ADD0_ENTRY_STRIDE = 0x18;
export const FRAME_OPAQUE_40ADD0_SSO_CAPACITY = 0x10;

export const FRAME_OPAQUE_421B50_VA = 0x00421b50;
export const FRAME_OPAQUE_421B50_END_VA = 0x00421be1;
export const FRAME_OPAQUE_421B50_CALL_SITES = 1;
export const FRAME_OPAQUE_421B50_COUNT_OFF = 0x8b8;
export const FRAME_OPAQUE_421B50_BITMAP_A_OFF = 0x8ac;
export const FRAME_OPAQUE_421B50_BITMAP_B_OFF = 0x8bc;

export const FRAME_OPAQUE_4257B0_VA = 0x004257b0;
export const FRAME_OPAQUE_4257B0_CALLSITE_VA = 0x006fba5d;
export const FRAME_OPAQUE_4257B0_LIST_RECEIVER_OFF = 0x1bbe0;
export const FRAME_OPAQUE_4257B0_LIST_BEGIN_OFF = 0;
export const FRAME_OPAQUE_4257B0_LIST_END_OFF = 4;
export const FRAME_OPAQUE_4257B0_LIST_CAP_OFF = 8;
export const FRAME_OPAQUE_4257B0_ELEM_STRIDE = 0x68;
export const FRAME_OPAQUE_4257B0_DIV_MAGIC = 0x4ec4ec4f;
export const FRAME_OPAQUE_4257B0_DIV_SHIFT = 5;
export const FRAME_OPAQUE_4257B0_RECOUNT_VA = 0x00425870;
export const FRAME_OPAQUE_4257B0_RECOUNT_GATE_VA = 0x00425894;
export const FRAME_OPAQUE_4257B0_ELEM_TIMER_INIT = 1;
export const FRAME_OPAQUE_4257B0_ELEM_ZERO_OFF = 0xc;
export const FRAME_OPAQUE_4257B0_ELEM_ZERO_BYTES = 0x58;
export const FRAME_OPAQUE_4257B0_ELEM_UNDEF_TAIL_OFF = 0x64;
export const FRAME_OPAQUE_HOST_9B9480_VA = 0x009b9480;
export const FRAME_OPAQUE_HOST_9B9310_VA = 0x009b9310;
export const FRAME_OPAQUE_HOST_4264C0_VA = 0x004264c0;
export const FRAME_OPAQUE_HOST_4259B0_VA = 0x004259b0;
export const FRAME_OPAQUE_HOST_426640_VA = 0x00426640;

export const FRAME_OPAQUE_4257B0_PASS_B_VA = 0x0042589a;
export const FRAME_OPAQUE_4257B0_PASS_B_LOOP_VA = 0x004258b0;
export const FRAME_OPAQUE_4257B0_PASS_B_END_VA = 0x0042599c;
export const FRAME_OPAQUE_4257B0_PASS_B_EXIT_VA = 0x004259a2;
export const FRAME_OPAQUE_MANAGER_SLOT_VA = 0x00c7169c;
export const FRAME_OPAQUE_MANAGER_MP_VEC_OFF = 0x4b3d8;
export const FRAME_OPAQUE_90ABF0_VA = 0x0090abf0;
export const FRAME_OPAQUE_90ABF0_END_VA = 0x0090ac67;
export const FRAME_OPAQUE_90ABF0_RET_BYTES = 4;
export const FRAME_OPAQUE_90ABF0_CALL_SITES = 24;
export const FRAME_OPAQUE_90ABF0_SUB_OFF = 0x374;
export const FRAME_OPAQUE_90ABF0_SUB_LO_OFF = 8;
export const FRAME_OPAQUE_90ABF0_SUB_HI_OFF = 0xc;
export const FRAME_OPAQUE_90ABF0_OBJ_ID_OFF = 0xc;
export const FRAME_OPAQUE_949BC0_VA = 0x00949bc0;
export const FRAME_OPAQUE_949BC0_END_VA = 0x00949c1f;
export const FRAME_OPAQUE_949BC0_RET_BYTES = 0;
export const FRAME_OPAQUE_949BC0_CALL_SITES = 4;
export const FRAME_OPAQUE_949BC0_TABLE_VA = 0x00b2415c;
export const FRAME_OPAQUE_949BC0_TABLE_REF_VA = 0x00949bcd;
export const FRAME_OPAQUE_949BC0_ROW_STRIDE = 0x18;
export const FRAME_OPAQUE_949BC0_BLOCK_STRIDE = 0x1b0;
export const FRAME_OPAQUE_949BC0_ROW_LIMIT = 0x12;
export const FRAME_OPAQUE_949BC0_ROWS_SCANNED = 0x11;
export const FRAME_OPAQUE_949BC0_OUTER_LIMIT = 0x360;
export const FRAME_OPAQUE_949BC0_BLOCKS = 2;
export const FRAME_OPAQUE_4257B0_PLAYER_CHAR_OFF = 0x13c0;
export const FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF = 8;
export const FRAME_OPAQUE_4257B0_PASS_B_BOOST = 0x11;

export const FRAME_OPAQUE_9B9480_VA = 0x009b9480;
export const FRAME_OPAQUE_9B9480_END_VA = 0x009b94d3;
export const FRAME_OPAQUE_9B9480_RET_BYTES = 0;
export const FRAME_OPAQUE_9B9480_CALL_SITES = 30;
export const FRAME_OPAQUE_9B9310_VA = 0x009b9310;
export const FRAME_OPAQUE_9B9310_END_VA = 0x009b937c;
export const FRAME_OPAQUE_9B9310_RET_BYTES = 4;
export const FRAME_OPAQUE_9B9310_CALL_SITES = 26;
export const FRAME_OPAQUE_417800_VA = 0x00417800;
export const FRAME_OPAQUE_417800_END_VA = 0x0041781f;
export const FRAME_OPAQUE_417800_RET_BYTES = 0;
export const FRAME_OPAQUE_417800_CALL_SITES = 9;
export const FRAME_OPAQUE_417800_IMM_SITES = 1; /* push 0x417800 @ 0x0086a2fc */
export const FRAME_OPAQUE_90AC70_VA = 0x0090ac70;
export const FRAME_OPAQUE_90AC70_END_VA = 0x0090ae70;
export const FRAME_OPAQUE_90AC70_RET_BYTES = 4;
export const FRAME_OPAQUE_90AC70_CALL_SITES = 11;
export const FRAME_OPAQUE_4264C0_END_VA = 0x00426559;
export const FRAME_OPAQUE_4264C0_RET_BYTES = 4;
export const FRAME_OPAQUE_4264C0_CALL_SITES = 4;
export const FRAME_OPAQUE_PLAYER_Q_OFF = 0x1e68;
export const FRAME_OPAQUE_PLAYER_161C_OFF = 0x161c;
export const FRAME_OPAQUE_90AC70_ELEM_ID_OFF = 0xc;
export const FRAME_OPAQUE_90AC70_ELEM_SUB378_OFF = 0x378;
export const FRAME_OPAQUE_90AC70_DEADBEEF = 0xdeadbeef;
export const FRAME_OPAQUE_90AC70_LOG_NULL_VA = 0x00b78f10;
export const FRAME_OPAQUE_90AC70_LOG_NOTFOUND_VA = 0x00b78eb8;
export const FRAME_OPAQUE_90AC70_LOG_DIVIDER_VA = 0x00b78e78;
export const FRAME_OPAQUE_90AC70_LOG_PLAYER_VA = 0x00b78e48;
export const FRAME_OPAQUE_90AC70_LOG_LIST_VA = 0x00b78e38;
export const FRAME_OPAQUE_90AC70_LOG_ENTRY_VA = 0x00b78e00;
export const FRAME_OPAQUE_90AC70_LOG_DEV_TYPE_VA = 0x00b78da8;
export const FRAME_OPAQUE_90AC70_LOG_NO_ASSOC_VA = 0x00b78dc8;
export const FRAME_OPAQUE_90AC70_LOG_END_DIVIDER_VA = 0x00b790e8;
export const FRAME_OPAQUE_90AC70_BURST_BASE_LOGS = 5;
export const FRAME_OPAQUE_90AC70_BURST_PER_ELEM_LOGS = 2;
export const FRAME_OPAQUE_4264C0_ARM_EMPTY = 0;
export const FRAME_OPAQUE_4264C0_ARM_NOT_FOUND = 1;
export const FRAME_OPAQUE_4264C0_ARM_SUB_NULL = 2;
export const FRAME_OPAQUE_4264C0_ARM_SUB_PAIR = 3;

export const FRAME_OPAQUE_LIST6772C_VA = 0x006fbb2f;
export const FRAME_OPAQUE_LIST6772C_END_VA = 0x006fbba3;
export const FRAME_OPAQUE_LIST6772C_NODE_MAX = 32;
export const FRAME_OPAQUE_LIST6772C_COUNTDOWN_OFF = 0x0c;
export const FRAME_OPAQUE_LIST6772C_NODE_SIZE = 0x40;

export const FRAME_OPAQUE_949BC0_KEYS = (() => {
  const block0 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0xa, 0xd, 0xe, 0xf, 0x10, 0x12, 0x13];
  const block1 = [0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25];
  const rows = [];
  for (let r = 0; r < block0.length; r++) rows.push({ key: block0[r], row: r + 1, block1: 0 });
  for (let r = 0; r < block1.length; r++) rows.push({ key: block1[r], row: r + 1, block1: 1 });
  return rows;
})();


function f32Bits(bits) {
  const u = new Uint32Array([bits >>> 0]);
  return new Float32Array(u.buffer)[0];
}

function asI8(v) {
  return (v | 0) << 24 >> 24;
}

function f32(x) {
  return Math.fround(x);
}

const F32 = { one: f32Bits(0x3f800000) };

function f32BitsFromFloat(x) {
  const f = new Float32Array([Math.fround(x)]);
  return new Uint32Array(f.buffer)[0] >>> 0;
}

export function tryFrameOpaque4212c0Pure(input) {
  const mode = input.mode;
  const secondary = input.secondary;
  const field3c = input.field3c;
  const flag4c = input.flag4c;
  const slotChar = input.slotChar;
  const flag111 = input.flag111;
  if (mode == null || secondary == null) {
    return { hostRequired: true, mode, secondary };
  }
  if ((mode | 0) === 0) {
    return { hostRequired: false, mode: mode | 0, secondary: secondary | 0 };
  }
  if (((flag111 >>> 0) & 0xff) !== 0) {
    return { hostRequired: true, mode: mode | 0, secondary: secondary | 0 };
  }
  if ((secondary | 0) === 3 && (field3c | 0) !== 0) {
    return { hostRequired: true, mode: mode | 0, secondary: secondary | 0 };
  }
  let modeOut = mode | 0;
  let secondaryOut = secondary | 0;
  if (modeOut === 1) {
    if ((field3c | 0) === 0 || ((flag4c >>> 0) & 0xff) === 0) {
      if (((slotChar >>> 0) & 0xff) === 0) {
        modeOut = 0;
      }
    }
  }
  if (secondaryOut === 3) {
    modeOut = 0;
    secondaryOut = 0;
  }
  return { hostRequired: false, mode: modeOut, secondary: secondaryOut };
}

export function frameOpaque4212c0Secondary3AfterProbeFalse(input) {
  let mode = input.mode | 0;
  let secondary = input.secondary | 0;
  const field3c = input.field3c | 0;
  const flag4c = input.flag4c >>> 0;
  if (field3c !== 0 && (flag4c & 0xff) !== 0) {
    return { mode, secondary };
  }
  mode = 0;
  secondary = 0;
  return { mode, secondary };
}

export function frameOpaque409030ApplyMidStore(_float10, sum) {
  return Math.fround(sum);
}

export function frameOpaque409030ApplyNoLoopClear(flag14) {
  return ((flag14 | 0) & ~0xff) | 0;
}

export function frameOpaque408d00ClearMask18(_mask18) {
  return 0;
}

export function frameOpaque408d00ApplyStep(frame) {
  return frameOpaque408d00StepFrame(frame);
}

/* v109 dedupe: 0x408c90 law exports (anim_present / log_needed /
   event_loop_needed / event_frame_eq / mask_bts / event_step /
   apply_from_events / residual_plan) are OWNED by the Exit family
   (isaac_exit_animstate_408c90_*, v18; the 0x40c7f0 pair-ctor precedent
   keeps Exit as the law holder and frame-opaque as host-VA pin). This
   family keeps FRAME_OPAQUE_HOST_408C90_VA + comments only; the suite
   pins the Exit export semantics BY REFERENCE. NO duplicate law exports.
   See section-notes/update-v109-dupva-dedupe/. */

export function frameOpaque40cfe0InitStore() {
  return { bufByte0: 0, size: 0, capacity: FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY };
}

export function frameOpaque40cca0InitStore() {
  return { bufDword0: 0, size: 0, capacity: 0 };
}

export function frameOpaque40cf50InitStore() {
  return { bufWord0: 0, size: 0, capacity: 0 };
}

export function frameOpaque40cf50SsoStore(src, len) {
  const bytes = new Array(FRAME_OPAQUE_40CF50_SSO_COPY_BYTES);
  for (let i = 0; i < FRAME_OPAQUE_40CF50_SSO_COPY_BYTES; i++) {
    bytes[i] = src ? ((src[i] ?? 0) & 0xff) : 0;
  }
  return { bytes, size: len >>> 0, capacity: FRAME_OPAQUE_40CF50_SSO_CAPACITY };
}

export function frameOpaque40d040ResetStore() {
  return { bufByte0: 0, size: 0, capacity: FRAME_OPAQUE_40D040_RESET_CAPACITY };
}

export function frameOpaqueList6772cSweep(timers, count) {
  if ((count | 0) <= 0) {
    return { evicted: 0, timersOut: [], evictOut: [] };
  }
  if ((count | 0) > FRAME_OPAQUE_LIST6772C_NODE_MAX) {
    return { evicted: -1, timersOut: [], evictOut: [] };
  }
  const n = count | 0;
  const timersOut = [];
  const evictOut = [];
  let evicted = 0;
  for (let i = 0; i < n; i++) {
    const timer = timers[i] | 0;
    let next = timer;
    let evict = 0;
    if (timer === 0) {
      evict = 1;
      next = 0;
      evicted += 1;
    } else if (timer > 0) {
      next = (timer - 1) | 0;
    }
    timersOut.push(next);
    evictOut.push(evict);
  }
  return { evicted, timersOut, evictOut };
}

export function frameOpaque421b50ApplyPerBit(aWords, bWords, count) {
  const A = aWords.map((w) => w >>> 0);
  const B = bWords.map((w) => w >>> 0);
  const c = count >>> 0;
  for (let i = 0; i < c; i++) {
    const w = (i >>> 5) >>> 0;
    const b = (i & 31) >>> 0;
    const bit = (1 << b) >>> 0;
    A[w] = (A[w] | (B[w] & bit)) >>> 0;
    B[w] = (B[w] & ~bit) >>> 0;
  }
  return { words: frameOpaque421b50Words(c), A, B };
}

export function frameOpaque421b50ApplyWordLaw(aWords, bWords, count) {
  const A = aWords.map((w) => w >>> 0);
  const B = bWords.map((w) => w >>> 0);
  const c = count >>> 0;
  const words = frameOpaque421b50Words(c);
  for (let w = 0; w < words; w++) {
    const mask = (w + 1 === words) ? frameOpaque421b50PartialMask(c) : 0xffffffff;
    const a = A[w] >>> 0;
    const b = B[w] >>> 0;
    A[w] = frameOpaque421b50MergedA(a, b, mask);
    B[w] = frameOpaque421b50ClearedB(b, mask);
  }
  return { words, A, B };
}

export function frameOpaque409030FloorF32(x) {
  return Math.fround(Math.floor(Math.fround(x)));
}

export function frameOpaque409030TruncF32(x) {
  return Math.trunc(Math.fround(x)) | 0;
}

function foBytes(s) {
  if (s == null) return null;
  if (typeof s === "string") {
    const a = [];
    for (let i = 0; i < s.length; i++) a.push(s.charCodeAt(i) & 0xff);
    a.push(0);
    return a;
  }
  return s;
}

export function frameOpaque40add0Strcmp(a, b) {
  a = foBytes(a);
  b = foBytes(b);
  if (a == null || b == null) return 1;
  let i = 0;
  let j = 0;
  for (;;) {
    const da0 = a[i] & 0xff;
    const db0 = b[j] & 0xff;
    if (da0 !== db0) return da0 < db0 ? -1 : 1;
    if (da0 === 0) return 0;
    const da1 = a[i + 1] & 0xff;
    const db1 = b[j + 1] & 0xff;
    if (da1 !== db1) return da1 < db1 ? -1 : 1;
    i += 2;
    j += 2;
    if (da1 === 0) return 0;
  }
}

export function frameOpaque40add0StrcmpEqual(a, b) {
  return frameOpaque40add0Strcmp(a, b) === 0;
}

export function frameOpaque40add0WalkAfterMiss(s, listCount) {
  s.index = (s.index + 1) >>> 0;
  s.entryAddr = (s.entryAddr + FRAME_OPAQUE_40ADD0_ENTRY_STRIDE) >>> 0;
  const cont = (s.index >>> 0) < (listCount >>> 0);
  return { continue: cont, index: s.index >>> 0, entryAddr: s.entryAddr >>> 0 };
}

export function frameOpaque98dba0Bvar2CounterStep(counter, bVar2) {
  if ((bVar2 | 0) === 0) {
    return { hostFun00746560: false, counter: counter | 0 };
  }
  const next = (counter | 0) + 1;
  return { hostFun00746560: next === 10, counter: next | 0 };
}

export function frameOpaque98dba0ClampFloats(float170, float2d0) {
  const one = f32Bits(0x3f800000);
  const clamp = (raw) => {
    let f = Math.fround(raw);
    if (f <= 0) f = 0;
    if (one <= f) f = one;
    return f;
  };
  return { float170: clamp(float170), float2d0: clamp(float2d0) };
}

export function frameOpaque98dba0VectorCount(begin, end) {
  const delta = (((end >>> 0) - (begin >>> 0)) >>> 0) << 0 >> 0;
  return delta >> 2;
}

export function frameOpaque98dba0MpWalkAfterMiss(index, count) {
  const next = (index >>> 0) + 1;
  return { cont: next < (count >>> 0), index: next >>> 0 };
}

export function frameOpaque98dba0WalkAfterPlayer(index, count) {
  const next = (index >>> 0) + 1;
  return { cont: next < (count >>> 0), index: next >>> 0 };
}

export function frameOpaque98dba0ModeFloatStep(state, bVar2, manager2a35c) {
  const step01 = f32Bits(0x3dcccccd);
  const step02 = f32Bits(0x3e4ccccd);
  const thr09 = f32Bits(0x3f666666);
  const one = f32Bits(0x3f800000);
  const zero = 0;
  const bv = (bVar2 | 0) !== 0 ? 1 : 0;
  let mode = state.mode | 0;
  let flag = state.flag | 0;
  let counter = state.counter | 0;
  let float170 = Math.fround(state.float170);
  let float2d0 = Math.fround(state.float2d0);
  const finish = (fallthrough) => ({
    fallthrough: fallthrough !== 0,
    mode,
    flag,
    counter,
    float170,
    float2d0,
  });
  if (mode === 0) {
    if (float170 < thr09) float170 = Math.fround(float170 + step01);
    else float170 = one;
    if (float2d0 <= step02) float2d0 = zero;
    else float2d0 = Math.fround(float2d0 - step02);
    if (bv !== 0) {
      mode = 1;
      return finish(0);
    }
    counter = 0;
    return finish(1);
  }
  if (mode === 1) {
    if (flag === 0) {
      if (float170 <= step02) float170 = zero;
      else float170 = Math.fround(float170 - step02);
      if ((counter >>> 0) < 9) {
        if (bv !== 0) {
          float2d0 = Math.fround(float2d0 + step01);
          return finish(0);
        }
        mode = 2;
        flag = 1;
        counter = 0;
        return finish(1);
      }
      float2d0 = one;
      if (bv !== 0) return finish(0);
      mode = 0;
      counter = 0;
      return finish(1);
    }
    float170 = zero;
    if ((counter >>> 0) < 9) {
      if (bv !== 0) {
        float2d0 = Math.fround(float2d0 + step01);
        return finish(0);
      }
      mode = 0;
      flag = 0;
      counter = 0;
      return finish(1);
    }
    float2d0 = one;
    if (bv !== 0) return finish(0);
    mode = 2;
    counter = 0;
    return finish(1);
  }
  if (mode === 2) {
    counter = 0;
    if (float170 <= step02) float170 = zero;
    else float170 = Math.fround(float170 - step02);
    const target = Math.fround(manager2a35c);
    if (float2d0 <= Math.fround(target + step01)) {
      if (Math.fround(target - step01) <= float2d0) float2d0 = target;
      else float2d0 = Math.fround(float2d0 + step01);
    } else {
      float2d0 = Math.fround(float2d0 - step01);
    }
    if (bv !== 0) {
      mode = 1;
      return finish(0);
    }
    counter = 0;
    return finish(1);
  }
  if (bv !== 0) return finish(0);
  counter = 0;
  return finish(1);
}

export function frameOpaque98dba0TimerStep(state, genrand) {
  const timer = state.timer | 0;
  const x0 = Math.fround(state.x);
  const y0 = Math.fround(state.y);
  if (timer <= 0) {
    return { applied: false, timer, x: x0, y: y0 };
  }
  const post = (timer - 1) | 0;
  const unit = frameOpaque98dba0TimerUnitFloat(genrand >>> 0);
  const pi = f32Bits(0x4048f5c3);
  const ten = f32Bits(0x41200000);
  const half = f32Bits(0x3f000000);
  let angle = Math.fround(unit * pi);
  angle = Math.fround(angle + angle);
  const t = Math.fround(Math.fround(post) / ten);
  const cosA = Math.fround(Math.cos(angle));
  const sinA = Math.fround(Math.sin(angle));
  const x = Math.fround(Math.fround(cosA * t) + Math.fround(x0 * half));
  const y = Math.fround(Math.fround(sinA * t) + Math.fround(y0 * half));
  return { applied: true, timer: post, x, y };
}

export function frameOpaque874910PushSequence(object) {
  return [
    FRAME_OPAQUE_874910_PUSH_CALLBACK_REF,
    FRAME_OPAQUE_874910_PUSH_INT_PACK4,
    FRAME_OPAQUE_874910_PUSH_INT_PACK8,
    ((object >>> 0) !== 0)
      ? FRAME_OPAQUE_874910_PUSH_USERDATA
      : FRAME_OPAQUE_874910_PUSH_NIL,
    FRAME_OPAQUE_874910_PUSH_INT_SUB,
    FRAME_OPAQUE_874910_PUSH_INT_KIND,
  ];
}

export function frameOpaque874910UserdataInit(object) {
  return [FRAME_OPAQUE_874910_USERDATA_TAG, object >>> 0];
}

export function frameOpaque874910OutRecord(luaState, luaLRefResult) {
  return [luaState >>> 0, luaLRefResult >>> 0];
}

export function frameOpaque874a10PushSequence() {
  return [
    FRAME_OPAQUE_874910_PUSH_CALLBACK_REF,
    FRAME_OPAQUE_874910_PUSH_INT_PACK4,
    FRAME_OPAQUE_874910_PUSH_INT_PACK8,
    FRAME_OPAQUE_874A10_PUSH_BOOL_BYTE,
  ];
}

export function frameOpaque40ccd0InPlaceStore(src, len) {
  const n = len >>> 0;
  const bytes = [];
  for (let i = 0; i < n; i++) bytes.push((src[i] ?? 0) & 0xff);
  bytes.push(0);
  return { size: n, bytes };
}

export function frameOpaque40cf50GrowStores(bufPtr, len) {
  return {
    bufWord0: bufPtr >>> 0,
    size: len >>> 0,
    capacity: frameOpaque40cf50GrowCapacity(len >>> 0),
  };
}

export function frameOpaque4257b0ListCountFromBounds(beginPtr, endPtr) {
  const delta = ((endPtr >>> 0) - (beginPtr >>> 0)) >>> 0;
  const magic = FRAME_OPAQUE_4257B0_DIV_MAGIC | 0;
  const signedDelta = delta << 0 >> 0;
  const prod = BigInt(signedDelta) * BigInt(magic);
  let high = Number((prod >> 32n) & 0xffffffffn);
  high = high << 0 >> 0;
  high >>= FRAME_OPAQUE_4257B0_DIV_SHIFT;
  return ((high + ((high >>> 0) >>> 31)) >>> 0);
}

export function frameOpaque4257b0PassAScanFound(pairs, count, lo, hi) {
  if (pairs == null) return false;
  const n = count >>> 0;
  lo >>>= 0;
  hi >>>= 0;
  for (let i = 0; i < n; i++) {
    if ((pairs[i].lo >>> 0) === lo && (pairs[i].hi >>> 0) === hi) return true;
  }
  return false;
}

export function frameOpaque4257b0PassAInsertDecision(pairs, count, lo, hi) {
  if ((((lo >>> 0) & (hi >>> 0)) >>> 0) === 0xffffffff) return false;
  return !frameOpaque4257b0PassAScanFound(pairs, count, lo, hi);
}

export function frameOpaque4257b0PassACountEvolution(initialPairs, ids) {
  const list = (initialPairs || []).map((p) => ({ lo: p.lo >>> 0, hi: p.hi >>> 0 }));
  let inserted = 0;
  const appended = [];
  for (const id of (ids || [])) {
    const lo = id.lo >>> 0;
    const hi = id.hi >>> 0;
    if (frameOpaque4257b0PassAInsertDecision(list, list.length, lo, hi)) {
      list.push({ lo, hi });
      appended.push({ lo, hi });
      inserted += 1;
    }
  }
  return { finalCount: list.length, inserted, appended, list };
}

export function frameOpaque949bc0KeyAt(block, row) {
  if ((block >>> 0) >= (FRAME_OPAQUE_949BC0_BLOCKS >>> 0) ||
      (row >>> 0) >= (FRAME_OPAQUE_949BC0_ROWS_SCANNED >>> 0)) {
    return 0xffffffff;
  }
  const keys = FRAME_OPAQUE_949BC0_KEYS.filter((e) => e.block1 === ((block >>> 0) === 1 ? 1 : 0));
  return keys[row >>> 0].key >>> 0;
}

export function frameOpaque949bc0Lookup(charId) {
  const id = charId >>> 0;
  for (const e of FRAME_OPAQUE_949BC0_KEYS) {
    if ((e.key >>> 0) === id) {
      return { found: true, row: e.row >>> 0, block1: e.block1 ? 1 : 0 };
    }
  }
  return { found: false, row: 0, block1: 0 };
}

export function frameOpaque956110ResultFromSamples(s) {
  if (s.netGateOpen && s.netHostOk) {
    return frameOpaque956110NetEarlyResult(s.netOutByte);
  }
  if (frameOpaque956110Path(s.mpEmpty, s.id) === FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK) {
    return frameOpaque956110ApplyFromVtableResults(s.vtableResults, s.vtableCount);
  }
  return (s.generalResult | 0) !== 0;
}

export function frameOpaque4264c0PairPlan(input) {
  const containerEmpty = input.containerEmpty ? 1 : 0;
  const playerPtr = input.playerPtr >>> 0;
  const playerId1618 = input.playerId1618 | 0;
  const player161c = input.player161c | 0;
  const qPtr = input.qPtr >>> 0;
  const q161c = input.q161c | 0;
  const objFound = input.objFound ? 1 : 0;
  const objSubPtr = input.objSubPtr >>> 0;
  const objSubLo = input.objSubLo >>> 0;
  const objSubHi = input.objSubHi >>> 0;
  const subject = frameOpaque417800Subject(playerPtr, qPtr, q161c, player161c);
  let arm;
  let lo;
  let hi;
  let hostBurst = false;
  if (containerEmpty !== 0) {
    arm = FRAME_OPAQUE_4264C0_ARM_EMPTY;
    lo = playerId1618 >>> 0;
    hi = 0;
  } else if (objFound === 0) {
    arm = FRAME_OPAQUE_4264C0_ARM_NOT_FOUND;
    lo = 0xffffffff;
    hi = 0xffffffff;
    hostBurst = true;
  } else if (objSubPtr === 0) {
    arm = FRAME_OPAQUE_4264C0_ARM_SUB_NULL;
    lo = 0;
    hi = 0;
  } else {
    arm = FRAME_OPAQUE_4264C0_ARM_SUB_PAIR;
    lo = objSubLo;
    hi = objSubHi;
  }
  return {
    arm,
    lo,
    hi,
    subjectPtr: subject >>> 0,
    host90ac70: containerEmpty === 0,
    hostBurst,
    pureCfOk: true,
  };
}

export function frameOpaque4257b0PassBEntryPlan(
  containerEmpty, objMatchFound, objFieldC, entryLo,
  playerMatchIndex, playerChar13c0, staleSlotValue, staleByte13,
) {
  const empty = containerEmpty ? 1 : 0;
  const s = {
    containerEmpty: empty !== 0,
    probe90abf0: empty === 0,
    haveId: false,
    id: 0,
    playerMatch: false,
    lookup949bc0: false,
    storeEntry8: false,
    lookupFound: false,
    storeValue: 0,
    boost: false,
    finalValue: 0,
    slotOut: staleSlotValue >>> 0,
    byte13Out: staleByte13 & 0xff,
  };
  let haveId = 0;
  let id = 0;
  if (empty !== 0) {
    haveId = 1;
    id = entryLo >>> 0;
  } else if (objMatchFound) {
    haveId = 1;
    id = objFieldC >>> 0;
  }
  s.haveId = haveId !== 0;
  s.id = id >>> 0;
  const playerMatch = (haveId !== 0 && (playerMatchIndex | 0) >= 0) ? 1 : 0;
  s.playerMatch = playerMatch !== 0;
  s.lookup949bc0 = playerMatch !== 0;
  s.storeEntry8 = playerMatch !== 0;
  if (playerMatch !== 0) {
    const lk = frameOpaque949bc0Lookup(playerChar13c0);
    const sp = frameOpaque4257b0PassBStorePlan(
      lk.found ? 1 : 0, lk.row, lk.block1, staleSlotValue, staleByte13,
    );
    s.lookupFound = lk.found;
    s.storeValue = sp.storeValue >>> 0;
    s.boost = sp.boost;
    s.finalValue = sp.finalValue >>> 0;
    s.slotOut = sp.slotOut >>> 0;
    s.byte13Out = sp.byte13Out >>> 0;
    return s;
  }
  s.lookupFound = false;
  s.storeValue = 0;
  s.boost = false;
  s.finalValue = 0;
  s.slotOut = staleSlotValue >>> 0;
  s.byte13Out = staleByte13 & 0xff;
  return s;
}

function foLoadU32(bytes, off) {
  return (bytes[off] | (bytes[off + 1] << 8) | (bytes[off + 2] << 16) | (bytes[off + 3] << 24)) >>> 0;
}

function foStoreU32(bytes, off, v) {
  v >>>= 0;
  bytes[off] = v & 0xff;
  bytes[off + 1] = (v >>> 8) & 0xff;
  bytes[off + 2] = (v >>> 16) & 0xff;
  bytes[off + 3] = (v >>> 24) & 0xff;
}

export function frameOpaque4257b0PassBApply(listBytes, listBeginVa, listEndVa, samples) {
  if (listBytes == null) return { stores: 0, slotOut: 0, byte13Out: 0 };
  let bound = frameOpaque4257b0ListCountFromBounds(listBeginVa, listEndVa) >>> 0;
  if (bound === 0) {
    return { stores: 0, slotOut: samples.passAIdCount >>> 0, byte13Out: samples.initialByte13 & 0xff };
  }
  const ctrEmpty = frameOpaque98dba0MpRangeEmpty(samples.ctrBegin, samples.ctrEnd);
  let slot = samples.passAIdCount >>> 0;
  let byte13 = samples.initialByte13 & 0xff;
  let stores = 0;
  let offset = 0;
  let index = 0;
  do {
    const entry = offset;
    let haveId = 0;
    let id = 0;
    if (ctrEmpty) {
      haveId = 1;
      id = foLoadU32(listBytes, entry);
    } else {
      let walkBound = frameOpaque98dba0VectorCount(samples.ctrBegin, samples.ctrEnd) >>> 0;
      const samplesLen = (samples.ctrSubPtrs || []).length;
      if (walkBound > samplesLen) walkBound = samplesLen;
      const objIdx = frameOpaque90abf0MatchIndex(
        samples.ctrSubPtrs, samples.ctrSubLo, samples.ctrSubHi, walkBound,
        foLoadU32(listBytes, entry), foLoadU32(listBytes, entry + 4),
      );
      if ((objIdx | 0) >= 0 && samples.ctrFieldC != null) {
        haveId = 1;
        id = samples.ctrFieldC[objIdx] >>> 0;
      }
    }
    if (haveId !== 0) {
      let pbound = frameOpaque98dba0VectorCount(samples.idvecBegin, samples.idvecEnd) >>> 0;
      const plen = (samples.playerIds1618 || []).length;
      if (pbound > plen) pbound = plen;
      const pidx = frameOpaque98dba0MpFirstMatchIndex(samples.playerIds1618, pbound, id | 0);
      if ((pidx | 0) >= 0 && samples.playerChars13c0 != null) {
        const lk = frameOpaque949bc0Lookup(samples.playerChars13c0[pidx]);
        const sp = frameOpaque4257b0PassBStorePlan(
          lk.found ? 1 : 0, lk.row, lk.block1, slot, byte13,
        );
        foStoreU32(listBytes, entry + FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF, sp.finalValue);
        slot = sp.slotOut >>> 0;
        byte13 = sp.byte13Out >>> 0;
        stores += 1;
      }
    }
    offset += FRAME_OPAQUE_4257B0_ELEM_STRIDE;
    index += 1;
    bound = frameOpaque4257b0ListCountFromBounds(listBeginVa, listEndVa) >>> 0;
  } while (index < bound);
  return { stores, slotOut: slot, byte13Out: byte13 };
}

export function frameOpaque4257b0PassAPairsFromSamples(s) {
  if (s.pPtrs == null || s.pIds1618 == null || s.p161cs == null ||
      s.qPtrs == null || s.q161cs == null || s.qIds1618 == null ||
      s.qqPtrs == null || s.qq161cs == null) {
    return { resolved: 0, pairs: [] };
  }
  const pairs = [];
  let resolved = 0;
  const idCount = s.idCount >>> 0;
  for (let j = 0; j < idCount; j++) {
    const pi = frameOpaque9b9310FetchIndex(
      s.qPtrs, s.pPtrs, s.q161cs, s.p161cs, s.playerCount >>> 0, j,
    );
    if ((pi | 0) < 0) break;
    const pPtr = s.pPtrs[pi] >>> 0;
    let plan;
    if (s.containerEmpty) {
      plan = frameOpaque4264c0PairPlan({
        containerEmpty: 1,
        playerPtr: pPtr,
        playerId1618: s.pIds1618[pi],
        player161c: s.p161cs[pi],
        qPtr: s.qPtrs[pi],
        q161c: s.q161cs[pi],
        objFound: 0,
        objSubPtr: 0,
        objSubLo: 0,
        objSubHi: 0,
      });
    } else {
      const selQ = (s.qPtrs[pi] >>> 0) !== 0 && (s.q161cs[pi] | 0) !== -1 &&
        ((s.q161cs[pi] | 0) < (s.p161cs[pi] | 0)) ? 1 : 0;
      const subjPtr = selQ ? (s.qPtrs[pi] >>> 0) : pPtr;
      const subjQ = selQ ? (s.qqPtrs[pi] >>> 0) : (s.qPtrs[pi] >>> 0);
      const subjQ161c = selQ ? (s.qq161cs[pi] | 0) : (s.q161cs[pi] | 0);
      const subj161c = selQ ? (s.q161cs[pi] | 0) : (s.p161cs[pi] | 0);
      const subjId = selQ ? (s.qIds1618[pi] | 0) : (s.pIds1618[pi] | 0);
      const obj = frameOpaque90ac70MatchIndex(
        s.elemIds, s.elemCount >>> 0, s.pPtrs, s.pIds1618, s.playerCount >>> 0,
        subjPtr, subjQ, subjQ161c, subj161c, subjId,
      );
      const objFound = (obj | 0) >= 0 ? 1 : 0;
      let subPtr = 0;
      let subLo = 0;
      let subHi = 0;
      if (objFound !== 0 && s.elemSubPtrs != null) {
        subPtr = s.elemSubPtrs[obj] >>> 0;
        if (subPtr !== 0 && s.elemSubLos != null && s.elemSubHis != null) {
          subLo = s.elemSubLos[obj] >>> 0;
          subHi = s.elemSubHis[obj] >>> 0;
        }
      }
      plan = frameOpaque4264c0PairPlan({
        containerEmpty: 0,
        playerPtr: pPtr,
        playerId1618: s.pIds1618[pi],
        player161c: s.p161cs[pi],
        qPtr: s.qPtrs[pi],
        q161c: s.q161cs[pi],
        objFound,
        objSubPtr: subPtr,
        objSubLo: subLo,
        objSubHi: subHi,
      });
    }
    pairs.push(plan.lo >>> 0, plan.hi >>> 0);
    resolved += 1;
  }
  return { resolved, pairs };
}


export function frameOpaque85c080LiteralStore(lit) {
  const n = FRAME_OPAQUE_85C080_LITERAL_LEN;
  const bytes = [];
  for (let i = 0; i < n; i++) bytes.push((lit[i] ?? 0) & 0xff);
  bytes.push(0);
  return { size: n, bytes };
}

export function frameOpaque85c080RecordInitWrites(luaState) {
  const writes = new Map();
  writes.set(0, FRAME_OPAQUE_85C080_VTABLE);
  writes.set(1, 0);
  writes.set(2, 0);
  writes.set(3, luaState >>> 0);
  writes.set(4, 0);
  writes.set(8, 0);
  writes.set(9, FRAME_OPAQUE_85C080_SSO_CAPACITY);
  return writes;
}

export function frameOpaque408d00StepFrame(current) {
  return Math.fround(frameOpaque409030FloorF32(current) + f32Bits(0x3f800000));
}

export function frameOpaque98dba0TimerUnitFloat(genrand) {
  genrand >>>= 0;
  let d = (genrand | 0);
  if ((genrand >>> 31) !== 0) d += 4294967296.0;
  return Math.fround(Math.fround(d) * f32Bits(0x2f800000));
}

export function frameOpaque40cf50GrowCapacity(len) {
  const req = ((len >>> 0) | FRAME_OPAQUE_40CF50_ROUND_MASK) >>> 0;
  const maxCap = FRAME_OPAQUE_40CF50_CAPACITY_MAX >>> 0;
  return (req > maxCap ? maxCap : req) >>> 0;
}

export function frameOpaque4257b0PassBStorePlan(lookupFound, lookupRow, lookupBlock1, staleSlotValue, staleByte13) {
  let slot = staleSlotValue >>> 0;
  let byte13 = staleByte13 & 0xff;
  if (lookupFound) {
    slot = lookupRow >>> 0;
    byte13 = lookupBlock1 ? 1 : 0;
  }
  const boost = byte13 !== 0;
  return {
    storeValue: slot >>> 0,
    boost,
    finalValue: (slot + (boost ? FRAME_OPAQUE_4257B0_PASS_B_BOOST : 0)) >>> 0,
    slotOut: slot >>> 0,
    byte13Out: byte13,
  };
}

export function frameOpaque40d040TidyPlan(capacity, payload, header) {
  const heapUsed = (capacity >>> 0) >= FRAME_OPAQUE_40CF50_SSO_LIMIT ? 1 : 0;
  let freeBytes = 0;
  let freePtr = 0;
  let aligned = 0;
  let invalid = 0;
  if (heapUsed !== 0) {
    const bytes = ((capacity >>> 0) + 1) >>> 0;
    aligned = frameOpaqueFreeAdjustNeeded(bytes) ? 1 : 0;
    const delta = frameOpaqueFreeDelta(payload, header);
    const deltaValid = frameOpaqueFreeDeltaValid(delta) ? 1 : 0;
    invalid = aligned !== 0 ? (deltaValid === 0 ? 1 : 0) : 0;
    freeBytes = aligned !== 0 ? frameOpaqueFreeAdjustBytes(bytes) : bytes;
    freePtr = (aligned !== 0 && invalid === 0) ? header : payload;
  }
  return {
    heapUsed: heapUsed !== 0,
    aligned: aligned !== 0,
    invalid: invalid !== 0,
    freeBytes,
    freePtr,
    hostFree: heapUsed !== 0,
    hostInvalid: invalid !== 0,
    resetSize: 0,
    resetCapacity: FRAME_OPAQUE_40D040_RESET_CAPACITY,
    pureComplete: heapUsed === 0,
    pureCfOk: true,
  };
}

export function frameOpaque956110WalkFromRecounts(results, counts, countsLen) {
  if (results == null || counts == null || countsLen == 0) return false;
  if (counts[0] == 0) return false;
  let i = 0;
  for (;;) {
    if (results[i] != 0) return true;
    i += 1;
    if ((i >>> 0) >= (countsLen >>> 0)) return false;
    if ((i >>> 0) >= (counts[i] >>> 0)) return false;
  }
}

export function frameOpaque4257b0PassANeedsHost(idCount) {
  return idCount != 0;
}
export function frameOpaque4257b0PassBNeedsHost(idCount, listCount) {
  return idCount != 0 || listCount != 0;
}
export function frameOpaque4257b0PassBNeedsHostRecaptured(postPassAListCount) {
  return postPassAListCount != 0;
}

export function frameOpaque40ccd0GrowCapacity(len, oldCapacity) {
  const req = ((len >>> 0) | 0xf) >>> 0;
  const maxCap = FRAME_OPAQUE_STRING_MAX_SIZE >>> 0;
  if (req > maxCap) return maxCap;
  const old = oldCapacity >>> 0;
  const half = old >>> 1;
  if (old > ((maxCap - half) >>> 0)) return maxCap;
  const geom = (old + half) >>> 0;
  return ((req < geom) ? geom : req) >>> 0;
}

export function frameOpaque98dba0MpFirstMatchIndex(entryIds, count, playerId) {
  if (entryIds == null || (count >>> 0) === 0) return -1;
  const want = playerId | 0;
  const n = count >>> 0;
  for (let i = 0; i < n; i++) {
    if ((entryIds[i] | 0) === want) return i | 0;
  }
  return -1;
}

export function frameOpaque90abf0MatchIndex(subPtrs, subLo, subHi, count, entryLo, entryHi) {
  if (subPtrs == null || subLo == null || subHi == null) return -1;
  const n = count >>> 0;
  for (let i = 0; i < n; i++) {
    if (frameOpaque90abf0PairMatches(subPtrs[i], subLo[i], subHi[i], entryLo, entryHi)) {
      return i | 0;
    }
  }
  return -1;
}

export function frameOpaque409030NeedsHost(field4, flag14) {

  if(field4 == 0) {
  return (0) != 0;
  }
  
  if(((flag14) & 0xff) == 0) {
  return (0) != 0;
  }
  return (1) != 0;
}

export function frameOpaque409030PairNeedsHost(field4A, flag14A, field4B, flag14B) {

  if(frameOpaque409030NeedsHost(field4A, flag14A) != 0) {
  return (1) != 0;
  }
  if(frameOpaque409030NeedsHost(field4B, flag14B) != 0) {
  return (1) != 0;
  }
  return (0) != 0;
}

export function frameOpaque409030Sum(float10, layer104) {

  
  return Math.fround(float10 + layer104);
}

export function frameOpaque409030Path(truncSum, frameBound, loopFlag) {

  
  if(truncSum < frameBound) {
  return FRAME_OPAQUE_409030_PATH_ADVANCE_MID;
  }
  if(((loopFlag) & 0xff) != 0) {
  return FRAME_OPAQUE_409030_PATH_REWIND;
  }
  return FRAME_OPAQUE_409030_PATH_NO_LOOP;
}

export function frameOpaque409030NoLoopTargetFrame(frameBound) {

  
  return frameBound - 1;
}

export function frameOpaque409030NoLoopAdvanceNeeded(frameBound, truncOrig) {

  
  var last = frameOpaque409030NoLoopTargetFrame(frameBound);
  return ((last >= truncOrig) ? 1 : 0) != 0;
}

export function frameOpaque409030ResidualPlan(float10, layer104, frameBound, loopFlag) {
  const s = {};

  

  var sum = frameOpaque409030Sum(float10, layer104);
  var floored_sum = frameOpaque409030FloorF32(sum);
  var trunc_sum = frameOpaque409030TruncF32(floored_sum);
  var path =
  frameOpaque409030Path(trunc_sum, frameBound, loopFlag);

  s.path = path
  s.sum = (sum)
  s.flooredSum = (floored_sum)
  s.truncSum = trunc_sum
  s.hostAdvance = false
  s.hostRewind = false
  s.advanceFrame = 0
  s.storeFloat10 = false
  s.clearFlag14 = false

  if(path == FRAME_OPAQUE_409030_PATH_ADVANCE_MID) {
  s.hostAdvance = true
  s.advanceFrame = trunc_sum
  s.storeFloat10 = true
  return s;
  }
  if(path == FRAME_OPAQUE_409030_PATH_REWIND) {
  s.hostRewind = true
  return s;
  }

  
  s.clearFlag14 = true
  var floored_orig = frameOpaque409030FloorF32(float10);
  var trunc_orig = frameOpaque409030TruncF32(floored_orig);
  if(frameOpaque409030NoLoopAdvanceNeeded(frameBound, trunc_orig) !=
  0) {
  s.hostAdvance = true
  s.advanceFrame = frameOpaque409030NoLoopTargetFrame(frameBound)
  }
  return s;
}

export function frameOpaque408d00TargetF32(targetFrame) {

  
  return Math.fround((targetFrame));
}

export function frameOpaque408d00AssertNeeded(targetFrame, truncCur) {

  
  return ((targetFrame < truncCur) ? 1 : 0) != 0;
}

export function frameOpaque408d00AdvanceLoopNeeded(targetF, current) {

  
  return ((targetF > current) ? 1 : 0) != 0;
}

export function frameOpaque408d00LayerLoopNeeded(layerCount) {

  
  return ((layerCount != 0) ? 1 : 0) != 0;
}

export function frameOpaque408d00NullLoopNeeded(nullCount) {

  
  return ((nullCount != 0) ? 1 : 0) != 0;
}

export function frameOpaque408d00ResidualPlan(currentFrame, targetFrame, layerCount, nullCount) {
  const s = {};

  

  var floored_cur = frameOpaque409030FloorF32(currentFrame);
  var trunc_cur = frameOpaque409030TruncF32(floored_cur);
  var target_f = frameOpaque408d00TargetF32(targetFrame);
  var host_assert =
  frameOpaque408d00AssertNeeded(targetFrame, trunc_cur);
  
  var advance_loop =
  frameOpaque408d00AdvanceLoopNeeded(target_f, currentFrame);

  var cur = currentFrame;
  var steps = 0;
  if(advance_loop != 0) {
    
  var kMaxSteps = 1 << 20;
  while(frameOpaque408d00AdvanceLoopNeeded(target_f, cur) != 0 &&
  steps < kMaxSteps) {
  cur = frameOpaque408d00StepFrame(cur);
  steps += 1;
  }
  }

  var host_layer =
  frameOpaque408d00LayerLoopNeeded(layerCount);
  var host_null =
  frameOpaque408d00NullLoopNeeded(nullCount);

  s.truncCur = trunc_cur
  s.flooredCur = (floored_cur)
  s.targetF = (target_f)
  s.hostAssert = ((host_assert) != 0)
  s.clearMask18 = true
  s.advanceLoop = ((advance_loop) != 0)
  s.stepCount = steps
  s.host408c90 = (((steps > 0) ? 1 : 0) != 0)
  s.hostLayerLoop = ((host_layer) != 0)
  s.hostNullLoop = ((host_null) != 0)
  s.finalFrame = (cur)
  s.pureCompleteOk = (((host_assert == 0 && advance_loop == 0 && host_layer == 0 &&
  host_null == 0)
  ? 1
  : 0) != 0)
  return s;
}

/* v109 dedupe: 0x408c90 scalar laws removed here (owned by Exit family;
   see the comment above frameOpaque40cfe0InitStore). */

export function frameOpaque408b90AnimPresent(animPtr) {

  
  return ((animPtr != 0) ? 1 : 0) != 0;
}

export function frameOpaque408b90LayerInRange(layerIndex, layerCount) {

  
  return ((layerIndex >= 0 && layerIndex < layerCount) ? 1 : 0) != 0;
}

export function frameOpaque408b90LogNeeded(animPtr, layerIndex, layerCount) {

  
  if(frameOpaque408b90AnimPresent(animPtr) == 0) {
  return (1) != 0;
  }
  if(frameOpaque408b90LayerInRange(layerIndex, layerCount) == 0) {
  return (1) != 0;
  }
  return (0) != 0;
}

export function frameOpaque408b90PosWalkNeeded(currentPos) {

  
  return ((currentPos >= 0) ? 1 : 0) != 0;
}

export function frameOpaque408b90EntryOffset(pos) {

  
  return pos * (FRAME_OPAQUE_LAYER_ENTRY_STRIDE | 0);
}

export function frameOpaque408b90LayerDescOffset(layerIndex) {

  
  return ((layerIndex) << 4) >>> 0;
}

export function frameOpaque408b90EntryFrameF32(entryFrameI32) {

  
  return Math.fround((entryFrameI32));
}

export function frameOpaque408b90TargetGeEntry(targetF, entryF) {

  
  return ((targetF >= entryF) ? 1 : 0) != 0;
}

export function frameOpaque408b90StepCanAdvance(candidate, frameCount, targetF, entryFrameI32) {

  
  if(candidate >= frameCount) {
  return (0) != 0;
  }
  var entry_f = frameOpaque408b90EntryFrameF32(entryFrameI32);
  return (frameOpaque408b90TargetGeEntry(targetF, entry_f)) != 0;
}

export function frameOpaque408b90ApplyFromEntryFrames(currentPos, frameCount, targetF, entryFrames, entryFramesLen) {

  
  if(currentPos < 0) {
  return currentPos;
  }
  if(entryFrames == null) {
  return currentPos;
  }

  var pos = currentPos;
  
  var kMaxSteps = 1 << 20;
  var steps = 0;
  while(steps < kMaxSteps) {
  var candidate = pos + 1;
  if((pos) >= entryFramesLen) {
      
  break;
  }
  var entry_frame = entryFrames[(pos)];
  if(frameOpaque408b90StepCanAdvance(candidate, frameCount,
  targetF, entry_frame) ==
  0) {
  break;
  }
  pos = candidate;
  steps += 1;
  if(pos < 0) {
  break;
  }
  }
  return pos;
}

export function frameOpaque408b90ResidualPlan(animPtr, layerIndex, layerCount, currentPos) {
  const s = {};

  
  var present = frameOpaque408b90AnimPresent(animPtr);
  var in_range =
  frameOpaque408b90LayerInRange(layerIndex, layerCount);
  var log_needed =
  frameOpaque408b90LogNeeded(animPtr, layerIndex, layerCount);
  s.animPresent = ((present) != 0)
  s.logNeeded = ((log_needed) != 0)
  s.layerInRange = ((in_range) != 0)
  s.posWalkNeeded = ((frameOpaque408b90PosWalkNeeded(currentPos)) != 0)
  
  s.pureCompleteOk = (((present != 0 && log_needed == 0) ? 1 : 0) != 0)
  s.layerIndex = layerIndex
  s.layerCount = layerCount
  s.currentPos = currentPos
  return s;
}

export function frameOpaque408c10AnimPresent(animPtr) {

  
  return ((animPtr != 0) ? 1 : 0) != 0;
}

export function frameOpaque408c10NullInRange(nullIndex, nullCount) {

  
  return ((nullIndex >= 0 && nullIndex < nullCount) ? 1 : 0) != 0;
}

export function frameOpaque408c10LogNeeded(animPtr, nullIndex, nullCount) {

  
  if(frameOpaque408c10AnimPresent(animPtr) == 0) {
  return (1) != 0;
  }
  if(frameOpaque408c10NullInRange(nullIndex, nullCount) == 0) {
  return (1) != 0;
  }
  return (0) != 0;
}

export function frameOpaque408c10PosWalkNeeded(currentPos) {

  
  return ((currentPos >= 0) ? 1 : 0) != 0;
}

export function frameOpaque408c10EntryOffset(pos) {

  
  return pos * (FRAME_OPAQUE_NULL_ENTRY_STRIDE | 0);
}

export function frameOpaque408c10NullDescOffset(nullIndex) {

  
  return ((nullIndex) << 4) >>> 0;
}

export function frameOpaque408c10EntryFrameF32(entryFrameI32) {

  
  return Math.fround((entryFrameI32));
}

export function frameOpaque408c10TargetGeEntry(targetF, entryF) {

  
  return ((targetF >= entryF) ? 1 : 0) != 0;
}

export function frameOpaque408c10StepCanAdvance(candidate, frameCount, targetF, entryFrameI32) {

  
  if(candidate >= frameCount) {
  return (0) != 0;
  }
  var entry_f = frameOpaque408c10EntryFrameF32(entryFrameI32);
  return (frameOpaque408c10TargetGeEntry(targetF, entry_f)) != 0;
}

export function frameOpaque408c10ApplyFromEntryFrames(currentPos, frameCount, targetF, entryFrames, entryFramesLen) {

  
  if(currentPos < 0) {
  return currentPos;
  }
  if(entryFrames == null) {
  return currentPos;
  }

  var pos = currentPos;
  
  var kMaxSteps = 1 << 20;
  var steps = 0;
  while(steps < kMaxSteps) {
  var candidate = pos + 1;
  if((pos) >= entryFramesLen) {
      
  break;
  }
  var entry_frame = entryFrames[(pos)];
  if(frameOpaque408c10StepCanAdvance(candidate, frameCount,
  targetF, entry_frame) ==
  0) {
  break;
  }
  pos = candidate;
  steps += 1;
  if(pos < 0) {
  break;
  }
  }
  return pos;
}

export function frameOpaque408c10ResidualPlan(animPtr, nullIndex, nullCount, currentPos) {
  const s = {};

  
  var present = frameOpaque408c10AnimPresent(animPtr);
  var in_range =
  frameOpaque408c10NullInRange(nullIndex, nullCount);
  var log_needed =
  frameOpaque408c10LogNeeded(animPtr, nullIndex, nullCount);
  s.animPresent = ((present) != 0)
  s.logNeeded = ((log_needed) != 0)
  s.nullInRange = ((in_range) != 0)
  s.posWalkNeeded = ((frameOpaque408c10PosWalkNeeded(currentPos)) != 0)
  
  s.pureCompleteOk = (((present != 0 && log_needed == 0) ? 1 : 0) != 0)
  s.nullIndex = nullIndex
  s.nullCount = nullCount
  s.currentPos = currentPos
  return s;
}

export function anm2UpdateNeedsHost(flag109) {

  return ((((flag109) & 0xff) != 0) ? 1 : 0) != 0;
}

export function frameOpaque40add0NeedsHost(field4, listCount) {

  if(field4 == 0) {
  return (1) != 0;
  }
  if(listCount != 0) {
  return (1) != 0;
  }
  return (0) != 0;
}

export function frameOpaque40add0BitResult(bitfield18, matchIndex) {

  if(matchIndex < 0) {
  return (0) != 0;
  }
  var shift = (matchIndex) & 31;
  var mask = 1 << shift;
  return ((bitfield18 & mask) != 0 ? 1 : 0) != 0;
}

export function frameOpaque40add0EntryStride() {
  return FRAME_OPAQUE_40ADD0_ENTRY_STRIDE >>> 0;
}

export function frameOpaque40add0SsoInline(capacity14) {

  
  return ((capacity14 < (FRAME_OPAQUE_40ADD0_SSO_CAPACITY))
  ? 1
  : 0) != 0;
}

export function frameOpaque40add0EntryDataAddr(entryAddr, capacity14, dword0) {

  if(capacity14 < (FRAME_OPAQUE_40ADD0_SSO_CAPACITY)) {
  return (entryAddr) >>> 0;
  }
  return (dword0) >>> 0;
}

export function frameOpaque40add0WalkInRange(index, listCount) {

  
  return ((index < listCount) ? 1 : 0) != 0;
}

export function frameOpaque40add0FirstMatchIndex(equalFlags, listCount) {

  if(equalFlags == null || listCount == 0) {
  return -1;
  }
  
  for(var i = 0; i < listCount; ++i) {
  if(equalFlags[i] != 0) {
  return(i | 0);
  }
  }
  return -1;
}

export function frameOpaque40add0ProbeFromEqualFlags(equalFlags, listCount, bitfield18) {

  
  var match =
  frameOpaque40add0FirstMatchIndex(equalFlags, listCount);
  if(match < 0) {
  return (0) != 0;
  }
  return (frameOpaque40add0BitResult(bitfield18, match)) != 0;
}

export function frameOpaque40add0NeedsHostWithFlags(field4, listCount, equalFlagsReady) {

  if(field4 == 0) {
  return (1) != 0;
  }
  if(equalFlagsReady != 0) {
    
  return (0) != 0;
  }
  return (frameOpaque40add0NeedsHost(field4, listCount)) != 0;
}

export function frameOpaque4257b0NeedsHost(timedTransitionCleanupMode) {

  return (timedTransitionCleanupMode < 2 ? 1 : 0) != 0;
}

export function frameOpaque4257b0PassAIdConsidered(lo, hi) {

  
  return (((lo & hi) != -1) ? 1 : 0) != 0;
}

export function frameOpaque4257b0PostPassACount(preListCount, inserted) {

  
  return ((preListCount + inserted)) >>> 0;
}

export function frameOpaque90abf0PairMatches(subPtr, subLo, subHi, entryLo, entryHi) {

  
  var pair_lo = (subPtr != 0) ? subLo : 0;
  var pair_hi = (subPtr != 0) ? subHi : 0;
  
  if(pair_lo != entryLo) {
  return (0) != 0;
  }
  return ((pair_hi == entryHi) ? 1 : 0) != 0;
}

export function menuGateUpdateNeedsHost(menuState23a74, gate1b83c, predicate1ba74) {

  if(menuState23a74 == 0) {
  return (0) != 0;
  }
  if(gate1b83c != 0 && predicate1ba74 != 0) {
  return (0) != 0;
  }
  return (1) != 0;
}

export function frameOpaque98dba0TimerNeedsHost(timer61c) {

  
  return (timer61c > 0 ? 1 : 0) != 0;
}

export function frameOpaque98dba0EmptyFatalNeeded(playerCount) {

  
  return ((playerCount == 0) ? 1 : 0) != 0;
}

export function frameOpaque98dba0WalkNeeded(playerCount) {

  
  return ((playerCount != 0) ? 1 : 0) != 0;
}

export function frameOpaque98dba0IndexInRange(index, count) {

  
  return ((index < count) ? 1 : 0) != 0;
}

export function frameOpaque98dba0PlayerSlotAddr(base, index) {

  
  return (base + index * 4) >>> 0;
}

export function frameOpaque98dba0MpRangeEmpty(begin, end) {

  
  return ((begin == end) ? 1 : 0) != 0;
}

export function frameOpaque98dba0MpIdEq(entryId, playerId) {

  
  return ((entryId == playerId) ? 1 : 0) != 0;
}

export function frameOpaque98dba0Bvar2Phase1Sticky(bVar2) {

  
  return ((bVar2 != 0) ? 1 : 0) != 0;
}

export function frameOpaque98dba0Bvar2Phase1Result(sticky, mpHitVtableZero, fun956110Nz) {

  
  if(sticky != 0) {
  return (1) != 0;
  }
  if(mpHitVtableZero != 0) {
  return (0) != 0;
  }
  return ((fun956110Nz != 0) ? 1 : 0) != 0;
}

export function frameOpaque98dba0Phase2RttiNeeded(mpEmpty, mpHitVtableZero) {

  
  if(mpEmpty != 0) {
  return (0) != 0;
  }
  if(mpHitVtableZero != 0) {
  return (0) != 0;
  }
  return (1) != 0;
}

export function frameOpaque98dba0Bvar2Phase3Result(sticky, mpListEmpty, isIdxLocal, fun956110Nz) {

  
  if(sticky != 0) {
  return (1) != 0;
  }
  if(mpListEmpty != 0 || isIdxLocal != 0) {
  return ((fun956110Nz != 0) ? 1 : 0) != 0;
  }
  return (0) != 0;
}

export function frameOpaque98dba0Bvar2PlayerStep(bvar2In, p1MpHitVtableZero, p1Fun956110Nz, phase2RttiSkip, p3RttiActive, p3MpListEmpty, p3IsIdxLocal, p3Fun956110Nz) {

  var bv = frameOpaque98dba0Bvar2Phase1Result(
  bvar2In, p1MpHitVtableZero, p1Fun956110Nz);
  if(phase2RttiSkip != 0 || p3RttiActive == 0) {
  return (bv) != 0;
  }
  return (frameOpaque98dba0Bvar2Phase3Result(
  bv, p3MpListEmpty, p3IsIdxLocal, p3Fun956110Nz)) != 0;
}

export function frameOpaque98dba0Bvar2ApplyFromProbes(probes, playerCount) {

  if(playerCount == 0) {
  return (0) != 0;
  }
  if(probes == null) {
  return (0) != 0;
  }
  var bv = 0;
  for(var i = 0; i < playerCount; ++i) {
  var base = (i) * 8;
  bv = frameOpaque98dba0Bvar2PlayerStep(
  bv,
  probes[base + 0],
  probes[base + 1],
  probes[base + 2],
  probes[base + 3],
  probes[base + 4],
  probes[base + 5],
  probes[base + 6]);
  }
  return (bv) != 0;
}

export function frameOpaque98dba0WalkResidualPlan(playerCount) {
  const s = {};

  
  var fatal = frameOpaque98dba0EmptyFatalNeeded(playerCount);
  var walk = frameOpaque98dba0WalkNeeded(playerCount);
  s.emptyFatal = ((fatal) != 0)
  s.walkNeeded = ((walk) != 0)
  s.pureCfOk = (((fatal == 0) ? 1 : 0) != 0)
  s.hostBody = ((walk) != 0)
  s.playerCount = playerCount
  return s;
}

export function frameOpaque956110NetGate(managerMode, globalC71690) {

  
  if(managerMode != 2) {
  return (0) != 0;
  }
  if(globalC71690 == 0) {
  return (0) != 0;
  }
  return (1) != 0;
}

export function frameOpaque956110IdIsNeg1(id) {

  
  return ((id == -1) ? 1 : 0) != 0;
}

export function frameOpaque956110Path(mpEmpty, id) {

  
  if(mpEmpty != 0) {
  return FRAME_OPAQUE_956110_PATH_GENERAL;
  }
  if(id != -1) {
  return FRAME_OPAQUE_956110_PATH_GENERAL;
  }
  return FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK;
}

export function frameOpaque956110NetEarlyResult(netOutByte) {

  
  return (((netOutByte & 0xff) != 0) ? 1 : 0) != 0;
}

export function frameOpaque956110ApplyFromVtableResults(results, count) {

  
  if(results == null || count == 0) {
  return (0) != 0;
  }
  for(var i = 0; i < count; ++i) {
  if(results[i] != 0) {
  return (1) != 0;
  }
  }
  return (0) != 0;
}

export function frameOpaque956110ResidualPlan(managerMode, globalC71690, mpEmpty, id) {
  const s = {};

  
  var net = frameOpaque956110NetGate(managerMode,
  globalC71690);
  var path = frameOpaque956110Path(mpEmpty, id);
  s.netGate = ((net) != 0)
  s.path = path
  s.host864c30 = ((net) != 0)
  s.hostVtableWalk = (((path == FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK) ? 1 : 0) != 0)
  s.hostGeneral = (((path == FRAME_OPAQUE_956110_PATH_GENERAL) ? 1 : 0) != 0)
  s.pureCfOk = true
  s.hostBody = true
  return s;
}

export function frameOpaque864c30CapabilityGate(flagDword) {

  
  return (((flagDword & FRAME_OPAQUE_864C30_CAPABILITY_BIT) != 0) ? 1
  : 0) != 0;
}

export function frameOpaque864c30NeedsHost(capability) {

  
  return ((capability != 0) ? 1 : 0) != 0;
}

export function frameOpaque864c30ResultFromSamples(capability, hostLuaOk) {

  
  if(capability == 0) {
  return (0) != 0;
  }
  return ((hostLuaOk != 0) ? 1 : 0) != 0;
}

export function frameOpaque864c30PackKindImm() {

  
  return FRAME_OPAQUE_864C30_PACK_KIND_IMM;
}

export function frameOpaque864c30ResidualPlan(capability) {
  const s = {};

  
  var cap = (capability != 0) ? 1 : 0;
  s.capability = ((cap) != 0)
  s.pureEarly = (((cap == 0) ? 1 : 0) != 0)
  s.hostBody = ((cap) != 0)
  s.host874910 = ((cap) != 0)
  s.host6a80f0 = ((cap) != 0)
  s.hostLuaIat = ((cap) != 0)
  s.hostSehLog = ((cap) != 0)
  s.pureCfOk = true
  return s;
}

export function frameOpaque864c30SehSideLogNeeded(globalC71678) {

  
  return ((globalC71678 != 0) ? 1 : 0) != 0;
}

export function frameOpaque864c30SehSideReceiver(globalC71678) {

  
  if(globalC71678 == 0) {
  return (0) >>> 0;
  }
  return ((globalC71678 +
  FRAME_OPAQUE_864C30_SEH_SIDE_RECEIVER_OFF)) >>> 0;
}

export function frameOpaque864c30SehNameVtblSlotOff() {

  
  return FRAME_OPAQUE_864C30_SEH_VTBL_NAME_OFF;
}

export function frameOpaque864c30SehResult() {

  
  return 0;
}

export function frameOpaque864c30SehPlan(globalC71678) {
  const s = {};

  
  var side =
  frameOpaque864c30SehSideLogNeeded(globalC71678);
  s.hostNameVcall = true
  s.hostAssertLog = true
  s.sideLogNeeded = ((side) != 0)
  s.hostSideVcall = ((side) != 0)
  s.hostSideLog = ((side) != 0)
  s.sideReceiver = frameOpaque864c30SehSideReceiver(globalC71678)
  s.resultAl = frameOpaque864c30SehResult()
  s.pureCfOk = true
  return s;
}

export function frameOpaque864c30ResultFromSamplesEx(capability, sehUnwound, hostLuaOk) {

  if(capability == 0) {
  return (0) != 0;
  }
  if(sehUnwound != 0) {
  return (frameOpaque864c30SehResult()) != 0;
  }
  return ((hostLuaOk != 0) ? 1 : 0) != 0;
}

export function frameOpaque6a80f0RefArgLo(ref) {

  
  return ref;
}

export function frameOpaque6a80f0RefArgHi(ref) {

  
  return(ref < 0) ? -1 : 0;
}

export function frameOpaque6a80f0RegistryIndex() {

  
  return (FRAME_OPAQUE_864C30_LUA_REGISTRYINDEX) >>> 0;
}

export function frameOpaque6a80f0ResidualPlan(ref) {
  const s = {};

  
  s.hostRawgeti = true
  s.argLo = frameOpaque6a80f0RefArgLo(ref)
  s.argHi = frameOpaque6a80f0RefArgHi(ref)
  s.registryIndex = frameOpaque6a80f0RegistryIndex()
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque874910ObjectPresent(object) {

  
  return ((object != 0) ? 1 : 0) != 0;
}

export function frameOpaque874910IntArgHi(value) {

  
  return(value < 0) ? -1 : 0;
}

export function frameOpaque874910KindArgHi() {

  
  return 0;
}

export function frameOpaque874910PcallFailed(pcallStatus) {

  
  return ((pcallStatus != 0) ? 1 : 0) != 0;
}

export function frameOpaque874910PcallNargs() {

  return FRAME_OPAQUE_874910_PCALL_NARGS;
}

export function frameOpaque874910PcallNresults() {

  return FRAME_OPAQUE_874910_PCALL_NRESULTS;
}

export function frameOpaque874910UserdataSize() {

  return FRAME_OPAQUE_874910_USERDATA_SIZE;
}

export function frameOpaque874910UserdataTag() {

  return (FRAME_OPAQUE_874910_USERDATA_TAG) >>> 0;
}

export function frameOpaque874910MetatableKey() {

  return (FRAME_OPAQUE_874910_METATABLE_KEY) >>> 0;
}

export function frameOpaque874910ResidualPlan(object, pcallStatus) {
  const s = {};

  
  var present = frameOpaque874910ObjectPresent(object);
  var failed = frameOpaque874910PcallFailed(pcallStatus);
  s.objectPresent = ((present) != 0)
  s.pushUserdata = ((present) != 0)
  s.pushNil = (((present == 0) ? 1 : 0) != 0)
  s.hostRawgeti = true
  s.hostPushinteger = true
  s.hostNewuserdata = ((present) != 0)
  s.host85bff0 = true
  s.hostPcall = true
  s.pcallFailed = ((failed) != 0)
  s.hostThrow = ((failed) != 0)
  s.hostLualRef = (((failed == 0) ? 1 : 0) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque85c080MessagePath(luaGettopResult) {

  
  return(luaGettopResult > 0)
  ? FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK
  : FRAME_OPAQUE_85C080_PATH_MISSING_ERROR;
}

export function frameOpaque85c080TostringFallback(tostringPtr) {

  
  if(tostringPtr == 0) {
  return (FRAME_OPAQUE_85C080_FALLBACK_STR_VA) >>> 0;
  }
  return (tostringPtr) >>> 0;
}

export function frameOpaque85c080Strlen(s) {

  if(s == null) {
  return (0) >>> 0;
  }
  
  var n = 0;
  while(s[n] != 0) {
  n += 1;
  }
  return (n) >>> 0;
}

export function frameOpaque85c080ApplyRecordInit(record, luaState) {

  if(record == null) {
  return;
  }
  record[0] = FRAME_OPAQUE_85C080_VTABLE;
  record[1] = 0;
  record[2] = 0;
  record[3] = luaState;
  record[4] = 0;
  
  record[8] = 0;
  record[9] = FRAME_OPAQUE_85C080_SSO_CAPACITY;
}

export function frameOpaque85c080LiteralNeedsGrow(capacity) {

  
  return ((capacity < FRAME_OPAQUE_85C080_LITERAL_LEN) ? 1 : 0) != 0;
}

export function frameOpaque85c080LiteralDstIsHeap(capacity) {

  
  return ((capacity >= FRAME_OPAQUE_85C080_SSO_BUF_BYTES) ? 1 : 0) != 0;
}

export function frameOpaque85c080GrowCapacity(capacity) {

  
  var half = capacity >>>  1;
  var headroom =
  FRAME_OPAQUE_85C080_MAX_CAPACITY - half;
  if(capacity > headroom) {
  return (FRAME_OPAQUE_85C080_MAX_CAPACITY) >>> 0;
  }
  var grown = (capacity + half);
  var floor_cap = FRAME_OPAQUE_85C080_SSO_CAPACITY;
  return ((grown > floor_cap) ? grown : floor_cap) >>> 0;
}

export function frameOpaque85c080GrowAllocBytes(capacity) {

  
  return ((frameOpaque85c080GrowCapacity(capacity) + 1)) >>> 0;
}

export function frameOpaque85c080ApplyLiteral(dst, literal, sizeField) {

  if(sizeField != null) {
    
  sizeField = FRAME_OPAQUE_85C080_LITERAL_LEN;
  }
  if(dst == null || literal == null) {
  return;
  }
  for(var i = 0; i < FRAME_OPAQUE_85C080_LITERAL_LEN;
  ++i) {
  dst[i] = literal[i];
  }
  
  dst[FRAME_OPAQUE_85C080_LITERAL_LEN] = 0;
}

export function frameOpaque85c080ResidualPlan(luaGettopResult, capacity, tostringPtr) {
  const s = {};

  
  var path = frameOpaque85c080MessagePath(luaGettopResult);
  var from_stack =
  (path == FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK) ? 1 : 0;
  var grow =
  (from_stack == 0) ? frameOpaque85c080LiteralNeedsGrow(capacity)
  : 0;
  s.path = path
  s.hostGettop = true
  s.hostTolstring = ((from_stack) != 0)
  s.hostAssign = ((from_stack) != 0)
  s.tostringNull = (((from_stack != 0 && tostringPtr == 0) ? 1 : 0) != 0)
  s.messagePtr = (from_stack != 0)
  ? frameOpaque85c080TostringFallback(tostringPtr)
  : 0
  s.literalNeedsGrow = ((grow) != 0)
  s.hostAlloc = ((grow) != 0)
  s.hostMemcpy = (((from_stack == 0 && grow == 0) ? 1 : 0) != 0)
  s.dstIsHeap = (((from_stack == 0 && grow == 0)
  ? frameOpaque85c080LiteralDstIsHeap(capacity)
  : 0) != 0)
  s.growCapacity = (grow != 0) ? frameOpaque85c080GrowCapacity(capacity) : 0
  s.entryCapacityIsSso = (((capacity == FRAME_OPAQUE_85C080_SSO_CAPACITY) ? 1 : 0) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque40ccd0InPlace(len, oldCapacity) {

  
  return ((len <= oldCapacity) ? 1 : 0) != 0;
}

export function frameOpaque40ccd0DstIsHeap(capacity) {

  
  return ((capacity >= FRAME_OPAQUE_STRING_SSO_BYTES) ? 1 : 0) != 0;
}

export function frameOpaque40ccd0LengthError(len) {

  
  return ((len > FRAME_OPAQUE_STRING_MAX_SIZE) ? 1 : 0) != 0;
}

export function frameOpaque40ccd0AllocBytes(newCapacity) {

  
  return ((newCapacity + 1)) >>> 0;
}

export function frameOpaque40ccd0ResidualPlan(len, oldCapacity) {
  const s = {};

  
  var in_place = frameOpaque40ccd0InPlace(len, oldCapacity);
  var too_long =
  (in_place == 0) ? frameOpaque40ccd0LengthError(len) : 0;
  var grow = (in_place == 0 && too_long == 0) ? 1 : 0;
  var new_cap =
  (grow != 0) ? frameOpaque40ccd0GrowCapacity(len, oldCapacity)
  : 0;
  s.inPlace = ((in_place) != 0)
  s.dstIsHeap = (((in_place != 0) ? frameOpaque40ccd0DstIsHeap(oldCapacity) : 0) != 0)
  s.lengthError = ((too_long) != 0)
  s.newCapacity = new_cap
  s.allocBytes = (grow != 0) ? frameOpaque40ccd0AllocBytes(new_cap) : 0
  s.hostAlloc = ((grow) != 0)
  s.hostCopy = (((too_long == 0) ? 1 : 0) != 0)
  s.hostFree = (((grow != 0 && frameOpaque40ccd0DstIsHeap(oldCapacity) != 0)
  ? 1
  : 0) != 0)
  s.freeBytes = (s.hostFree != 0) ? (oldCapacity + 1) : 0
  s.storeCapacity = ((grow) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaqueAllocIsAligned(bytes) {

  
  return ((bytes >= FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD) ? 1 : 0) != 0;
}

export function frameOpaqueAllocRawBytes(bytes) {

  
  return ((bytes + FRAME_OPAQUE_ALLOC_HEADER_BIAS)) >>> 0;
}

export function frameOpaqueAllocOverflow(bytes) {

  
  return ((frameOpaqueAllocRawBytes(bytes) <= bytes) ? 1 : 0) != 0;
}

export function frameOpaqueAllocPayload(rawPtr) {

  
  return (((rawPtr + FRAME_OPAQUE_ALLOC_HEADER_BIAS) &
  FRAME_OPAQUE_ALLOC_ALIGN_MASK)) >>> 0;
}

export function frameOpaqueAllocHeaderAddr(payload) {

  
  return ((payload - 4)) >>> 0;
}

export function frameOpaqueAllocSmallIsNull(bytes) {

  
  return ((bytes == 0) ? 1 : 0) != 0;
}

export function frameOpaqueFreeAdjustNeeded(bytes) {

  
  return ((bytes >= FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD) ? 1 : 0) != 0;
}

export function frameOpaqueFreeAdjustBytes(bytes) {

  
  return ((bytes + FRAME_OPAQUE_ALLOC_HEADER_BIAS)) >>> 0;
}

export function frameOpaqueFreeDelta(payload, header) {

  
  return ((payload - header - 4)) >>> 0;
}

export function frameOpaqueFreeDeltaValid(delta) {

  
  return ((delta <= FRAME_OPAQUE_ALLOC_DELTA_MAX) ? 1 : 0) != 0;
}

export function frameOpaqueAllocPlan(bytes) {
  const s = {};

  
  var aligned = frameOpaqueAllocIsAligned(bytes);
  var overflow =
  (aligned != 0) ? frameOpaqueAllocOverflow(bytes) : 0;
  var null_small =
  (aligned == 0) ? frameOpaqueAllocSmallIsNull(bytes) : 0;
  s.aligned = ((aligned) != 0)
  s.overflow = ((overflow) != 0)
  s.rawBytes = (aligned != 0)
  ? frameOpaqueAllocRawBytes(bytes)
  : ((null_small != 0) ? 0 : bytes)
  s.returnsNull = ((null_small) != 0)
  s.hostAlloc = (((overflow == 0 && null_small == 0) ? 1 : 0) != 0)
  s.hostOomAbort = (((aligned != 0 && overflow == 0) ? 1 : 0) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque40cf50SrcIsHeap(srcCapacity) {

  
  return ((srcCapacity >= FRAME_OPAQUE_40CF50_SSO_LIMIT) ? 1
  : 0) != 0;
}

export function frameOpaque40cf50Sso(len) {

  
  return ((len < FRAME_OPAQUE_40CF50_SSO_LIMIT) ? 1 : 0) != 0;
}

export function frameOpaque40cf50AllocBytes(newCapacity) {

  
  return ((newCapacity + 1)) >>> 0;
}

export function frameOpaque40cf50CopyBytes(len) {

  
  return ((len + 1)) >>> 0;
}

export function frameOpaque874a10ByteArg(raw) {

  
  return(raw & FRAME_OPAQUE_874A10_BYTE_ARG_MASK);
}

export function frameOpaque874a10PcallNargs() {

  
  return FRAME_OPAQUE_874A10_PCALL_NARGS;
}

export function frameOpaque874a10ResidualPlan(byteArgRaw, pcallStatus) {
  const s = {};

  
  
  var failed = frameOpaque874910PcallFailed(pcallStatus);
  s.hostRawgeti = true
  s.hostPushinteger = true
  s.hostPushboolean = true
  s.hostPcall = true
  s.pcallFailed = ((failed) != 0)
  s.hostThrow = ((failed) != 0)
  s.hostLualRef = (((failed != 0) ? 0 : 1) != 0)
  s.byteArg = frameOpaque874a10ByteArg(byteArgRaw)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque40cfe0DefaultCapacity() {

  
  return FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY;
}

export function frameOpaque40cfe0ResidualPlan() {
  const s = {};

  
  
  s.pureCfOk = true
  s.pureComplete = true
  s.defaultCapacity = FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY
  return s;
}

export function frameOpaque40cca0ResidualPlan() {
  const s = {};

  
  
  s.pureCfOk = true
  s.pureComplete = true
  s.zeroCapacity = FRAME_OPAQUE_40CCA0_ZERO_CAPACITY
  return s;
}

export function frameOpaque40cf50ResidualPlan(srcSize, srcCapacity) {
  const s = {};

  
  var sso = frameOpaque40cf50Sso(srcSize);
  var new_cap =
  (sso != 0) ? FRAME_OPAQUE_40CF50_SSO_CAPACITY
  : frameOpaque40cf50GrowCapacity(srcSize);
  s.srcIsHeap = ((frameOpaque40cf50SrcIsHeap(srcCapacity)) != 0)
  s.sso = ((sso) != 0)
  s.newCapacity = new_cap
  s.allocBytes = (sso != 0) ? 0 : frameOpaque40cf50AllocBytes(new_cap)
  s.copyBytes = (sso != 0)
  ? FRAME_OPAQUE_40CF50_SSO_COPY_BYTES
  : frameOpaque40cf50CopyBytes(srcSize)
  s.hostAlloc = (((sso != 0) ? 0 : 1) != 0)
  s.hostCopy = true
  s.storePtrBeforeCopy = (((sso != 0) ? 0 : 1) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque40d000ReleasePlan(payload, header, bytes) {
  const s = {};

  
  
  var aligned = frameOpaqueFreeAdjustNeeded(bytes);
  var delta = frameOpaqueFreeDelta(payload, header);
  var delta_valid = frameOpaqueFreeDeltaValid(delta);
  var invalid =
  (aligned != 0) ? ((delta_valid == 0) ? 1 : 0) : 0;
  s.aligned = ((aligned) != 0)
  s.invalid = ((invalid) != 0)
  
  s.freeBytes = (aligned != 0)
  ? frameOpaqueFreeAdjustBytes(bytes)
  : bytes
  
  s.freePtr = (aligned != 0 && invalid == 0) ? header : payload
  s.hostFree = true
  s.hostInvalid = ((invalid) != 0)
  s.pureCfOk = true
  s.pureComplete = false
  return s;
}

export function frameOpaque9b9480PlayerCounted(qPtr, pPtr, q161c, p161c) {

  
  if(qPtr != 0 && q161c != -1 && q161c < p161c && qPtr != pPtr) {
  return (0) != 0;
  }
  return (1) != 0;
}

export function frameOpaque9b9480Count(qPtrs, pPtrs, q161cs, p161cs, count) {

  
  if(qPtrs == null || pPtrs == null || q161cs == null ||
  p161cs == null) {
  return (0) >>> 0;
  }
  var result = 0;
  for(var i = 0; i < count; i++) {
  if(frameOpaque9b9480PlayerCounted(qPtrs[i], pPtrs[i],
  q161cs[i], p161cs[i]) != 0) {
  result = (result + 1);
  }
  }
  return (result) >>> 0;
}

export function frameOpaque9b9310FetchIndex(qPtrs, pPtrs, q161cs, p161cs, count, wanted) {

  
  if(qPtrs == null || pPtrs == null || q161cs == null ||
  p161cs == null) {
  return -1;
  }
  var k = 0;
  for(var i = 0; i < count; i++) {
  if(frameOpaque9b9480PlayerCounted(qPtrs[i], pPtrs[i],
  q161cs[i], p161cs[i]) != 0) {
  if(k == wanted) {
  return i;
  }
  k = (k + 1);
  }
  }
  return -1;
}

export function frameOpaque417800Subject(pPtr, qPtr, q161c, p161c) {

  
  if(qPtr != 0 && q161c != -1 && q161c < p161c) {
  return (qPtr) >>> 0;
  }
  return (pPtr) >>> 0;
}

export function frameOpaque90ac70PlayerForId(playerIds1618, playerCount, id) {

  
  if(playerIds1618 == null) {
  return -1;
  }
  for(var i = 0; i < playerCount; i++) {
  if(playerIds1618[i] == id) {
  return i;
  }
  }
  return -1;
}

export function frameOpaque90ac70ElemMatches(resolvedPlayerPtr, subj2Ptr, elemId, subjectId1618) {

  
  if(resolvedPlayerPtr == subj2Ptr) {
  return (1) != 0;
  }
  if(elemId == subjectId1618) {
  return (1) != 0;
  }
  return (0) != 0;
}

export function frameOpaque90ac70MatchIndex(elemIds, elemCount, playerPtrs, playerIds1618, playerCount, subjectPtr, subjectQPtr, subjectQ161c, subject161c, subjectId1618) {

  
  if(elemIds == null) {
  return -1;
  }
  var subj2 = frameOpaque417800Subject(
  subjectPtr, subjectQPtr, subjectQ161c, subject161c);
  for(var k = 0; k < elemCount; k++) {
  var pidx = frameOpaque90ac70PlayerForId(
  playerIds1618, playerCount, elemIds[k]);
  var resolved = 0;
  if(pidx >= 0 && playerPtrs != null) {
  resolved = playerPtrs[pidx];
  }
  if(frameOpaque90ac70ElemMatches(resolved, subj2,
  elemIds[k],
  subjectId1618) != 0) {
  return k;
  }
  }
  return -1;
}

export function frameOpaque90ac70ResidualPlan(elemIds, elemCount, playerPtrs, playerIds1618, playerCount, subjectPtr, subjectQPtr, subjectQ161c, subject161c, subjectId1618) {
  const s = {};

  
  var subject_null = (subjectPtr == 0) ? 1 : 0;
  var found = 0;
  var elem_index = -1;
  var host_burst = 0;
  var burst_log_count = 0;
  if(subject_null == 0) {
  elem_index = frameOpaque90ac70MatchIndex(
  elemIds, elemCount, playerPtrs, playerIds1618, playerCount,
  subjectPtr, subjectQPtr, subjectQ161c, subject161c,
  subjectId1618);
  found = (elem_index >= 0) ? 1 : 0;
  if(found == 0) {
      
  host_burst = 1;
  burst_log_count = (
  FRAME_OPAQUE_90AC70_BURST_BASE_LOGS +
  FRAME_OPAQUE_90AC70_BURST_PER_ELEM_LOGS *
  elemCount);
  }
  }
  s.subjectNull = ((subject_null) != 0)
  s.found = ((found) != 0)
  s.elemIndex = elem_index
  s.hostNullLog = ((subject_null) != 0)
  s.hostBurst = ((host_burst) != 0)
  s.burstLogCount = burst_log_count
  s.pureCfOk = true
  s.pureComplete = (((found != 0 && subject_null == 0) ? 1 : 0) != 0)
  return s;
}

export function frameOpaque421b50Words(count) {

  
  return ((count == 0) ? 0 : ((count - 1) >>>  5) + 1) >>> 0;
}

export function frameOpaque421b50PartialMask(count) {

  
  var k = count & 31;
  return ((k == 0) ? 0xffffffff : ((1 << k) - 1)) >>> 0;
}

export function frameOpaque421b50MergedA(a, b, mask) {

  
  return (a | (b & mask)) >>> 0;
}

export function frameOpaque421b50ClearedB(b, mask) {

  
  return (b & ~mask) >>> 0;
}

export function frameOpaque421b50Plan(count) {
  const s = {};

  
  
  s.pureCfOk = true
  s.pureComplete = true
  s.words = frameOpaque421b50Words(count)
  return s;
}

/* FUN_004212c0 true-probe interior 0x00421343..0x004213ab ABI v32.
 * Independently transcribed from the instruction stream, not from C++.
 * 0x00421343 mov eax,[0xc7169c] Manager*
 * 0x00421348 lea esi,[eax+0x2a324] SoundEffects object
 * 0x0042134e..0x00421384 manager stores (two incs + immediates)
 * 0x0042138b..0x0042139b movss [esi+0x10]; ucomiss DAT_00baa454 (1.0f);
 * lahf; test ah,0x44; jnp 0x4213ab
 * JNP is taken on ordered-equal (PF=0 after TEST) and skips the store+call.
 * Fallthrough is NOT ordered-equal (or NaN): store 0x3f800000 at [esi+0x10],
 * then host SoundEffects::ClearVolumeModifier (0x0092e430). Later calls at
 * 0x004213ab stay host (0x006fd7c0 / 0x008318a0).
 */

export const FRAME_OPAQUE_4212C0_TRUE_PROBE_VA = 0x00421343;
export const FRAME_OPAQUE_4212C0_TRUE_PROBE_END_VA = 0x004213ab;
export const FRAME_OPAQUE_HOST_92E430_VA = 0x0092e430;
export const FRAME_OPAQUE_HOST_6FD7C0_VA = 0x006fd7c0;
export const FRAME_OPAQUE_HOST_8318A0_VA = 0x008318a0;
export const FRAME_OPAQUE_4212C0_VOLUME_OBJ_OFF = 0x2a324;
export const FRAME_OPAQUE_4212C0_VOLUME_OFF = 0x10;
export const FRAME_OPAQUE_4212C0_ONE_BITS = 0x3f800000;
export const FRAME_OPAQUE_4212C0_ONE_F32_VA = 0x00baa454;
export const FRAME_OPAQUE_4212C0_TIMER_IMM = 0x19;
export const FRAME_OPAQUE_4212C0_MGR_F18_OFF = 0xf18;
export const FRAME_OPAQUE_4212C0_MGR_FLAG14_OFF = 0x14;
export const FRAME_OPAQUE_4212C0_MGR_EBC_OFF = 0xebc;
export const FRAME_OPAQUE_4212C0_MGR_21618_OFF = 0x21618;
export const FRAME_OPAQUE_4212C0_MGR_21620_OFF = 0x21620;
export const FRAME_OPAQUE_4212C0_MGR_21624_OFF = 0x21624;
export const FRAME_OPAQUE_4212C0_MGR_2161C_OFF = 0x2161c;
export const FRAME_OPAQUE_4212C0_MGR_29FB8_OFF = 0x29fb8;

/** PE ucomiss + lahf + test ah,0x44 + jnp: ordered-equal to 1.0f (NaN -> 0). */
export function frameOpaque4212c0VolumeEqOne(volume) {
  return Math.fround(volume) === f32Bits(FRAME_OPAQUE_4212C0_ONE_BITS) ? 1 : 0;
}

/** Host 0x0092e430 (SoundEffects::ClearVolumeModifier) needed on the not-equal arm. */
export function frameOpaque4212c0Host92e430Needed(volume) {
  return frameOpaque4212c0VolumeEqOne(volume) === 0 ? 1 : 0;
}

/** Volume after the gate: leave the input on ordered-equal; else store 1.0f. */
export function frameOpaque4212c0VolumeAfterGate(volume) {
  if (frameOpaque4212c0VolumeEqOne(volume) !== 0) {
    return Math.fround(volume);
  }
  return f32Bits(FRAME_OPAQUE_4212C0_ONE_BITS);
}

/**
 * Combined true-probe interior plan (manager stores + volume gate).
 * Later calls at nextVa stay host. Inc wrap is 32-bit.
 */
export function frameOpaque4212c0TrueProbePlan(mgrF18, mgrEbc, volume) {
  const eq = frameOpaque4212c0VolumeEqOne(volume);
  return {
    mgrF18: ((mgrF18 | 0) + 1) | 0,
    mgrFlag14: 1,
    mgrEbc: ((mgrEbc | 0) + 1) | 0,
    mgr21618: 1,
    mgr21620: 0,
    mgr21624: 1,
    mgr2161c: FRAME_OPAQUE_4212C0_TIMER_IMM,
    mgr29fb8: 1,
    volumeBits: f32BitsFromFloat(frameOpaque4212c0VolumeAfterGate(volume)),
    host92e430: eq === 0,
    nextVa: FRAME_OPAQUE_4212C0_TRUE_PROBE_END_VA,
    pureCfOk: true,
  };
}
/* ABI v47: FUN_00423cc0 slot band (0x423cc0..0x4240ad ret, 1 caller
   0x955c85) + PURE sibling 0x424130 vec leaf. SEH+GS body: 2-iteration
   loop (this+0x11c + 0x130*i) with "Text" layer lookup, PURE 0x424130
   vec selection, render gates (this+0x109/0x70, receivers +0x50/+0x30,
   vec 0xc7b640), slot skip ([+8]==0x20 dword eq / byte[+4]==0), bounds/
   entry table law (sar4 SIGNED diff, UNSIGNED jb, stride 16, sentinel
   -1 -> 0xb6d124 "None"), two struct fills, mode bit-gate
   ([0xc798e4]&4 -> 1/6), float scale (mulss 1.5f from 0xbaa528).
   12 E8 + 5 indirect stay HOST (NARROWED). Laws transcribed from the
   instruction stream (0x423cc0..0x4240ad) + 0x424130 (0x424130..
   0x42420e ret8). */
export const FRAME_OPAQUE_423CC0_VA = 0x00423cc0;
export const FRAME_OPAQUE_423CC0_END_VA = 0x004240ae;
export const FRAME_OPAQUE_423CC0_CALL_SITES = 1;
export const FRAME_OPAQUE_423CC0_CALLER1_VA = 0x00955c85;
export const FRAME_OPAQUE_423CC0_SEH_COOKIE = 0xaf1900;
export const FRAME_OPAQUE_423CC0_GS_COOKIE_GLOBAL_VA = 0x00bf93b4;
export const FRAME_OPAQUE_423CC0_ITERATIONS = 2;
export const FRAME_OPAQUE_423CC0_STRIDE = 0x130;
export const FRAME_OPAQUE_423CC0_SLOT_BASE_OFF = 0x11c;
export const FRAME_OPAQUE_423CC0_FLOAT_SRC_OFF = 0x260;
export const FRAME_OPAQUE_423CC0_FLOAT_STORE_LO_OFF = 0x9c;
export const FRAME_OPAQUE_423CC0_FLOAT_STORE_HI_OFF = 0xa0;
export const FRAME_OPAQUE_423CC0_SCALE_RDATA_VA = 0x00baa528;
export const FRAME_OPAQUE_423CC0_SCALE_F32_BITS = 0x3fc00000;
export const FRAME_OPAQUE_423CC0_MODE_BIT_GLOBAL_VA = 0x00c798e4;
export const FRAME_OPAQUE_423CC0_MODE_BIT_MASK = 4;
export const FRAME_OPAQUE_423CC0_MODE_OFF = 1;
export const FRAME_OPAQUE_423CC0_MODE_ON = 6;
export const FRAME_OPAQUE_423CC0_STORE_INIT_VA = 0x00c79900;
export const FRAME_OPAQUE_423CC0_STORE_MODE_VA = 0x00c79904;
export const FRAME_OPAQUE_423CC0_STORE_B_VA = 0x00c79908;
export const FRAME_OPAQUE_423CC0_STORE_C_VA = 0x00c7990c;
export const FRAME_OPAQUE_423CC0_STORE_D_VA = 0x00c79910;
export const FRAME_OPAQUE_423CC0_SLOT_TYPE_OFF = 8;
export const FRAME_OPAQUE_423CC0_SLOT_BYTE4_OFF = 4;
export const FRAME_OPAQUE_423CC0_SKIP_TYPE = 0x20;
export const FRAME_OPAQUE_423CC0_RENDER_GATE_OFF = 0x109;
export const FRAME_OPAQUE_423CC0_ORDER_GATE_OFF = 0x70;
export const FRAME_OPAQUE_423CC0_RENDER_A_OFF = 0x50;
export const FRAME_OPAQUE_423CC0_RENDER_B_OFF = 0x30;
export const FRAME_OPAQUE_423CC0_RENDER_VEC_VA = 0x00c7b640;
export const FRAME_OPAQUE_423CC0_LAYER_POOL_VA = 0x00b1c208;
export const FRAME_OPAQUE_423CC0_WARN_MSG_VA = 0x00b1a634;
export const FRAME_OPAQUE_423CC0_ASSERT_LEVEL = 4;
export const FRAME_OPAQUE_423CC0_HOST_MODE_DISPATCH_VA = 0x00424220;
export const FRAME_OPAQUE_423CC0_HOST_MGR_CALL_VA = 0x00a20390;
export const FRAME_OPAQUE_423CC0_HOST_LAYER_LOOKUP_VA = 0x0040b430;
export const FRAME_OPAQUE_423CC0_HOST_LAYER_ASSIGN_VA = 0x0040a7e0;
export const FRAME_OPAQUE_423CC0_HOST_ASSERT_VA = 0x00a112c0;
export const FRAME_OPAQUE_423CC0_HOST_RENDER_VA = 0x0040a030;
export const FRAME_OPAQUE_423CC0_HOST_POPUP_VA = 0x00af08b1;
export const FRAME_OPAQUE_423CC0_HOST_FLUSH_VA = 0x0095af30;
export const FRAME_OPAQUE_423CC0_HOST_STRINGIFY_VA = 0x00a0f550;
export const FRAME_OPAQUE_423CC0_HOST_VEC_HELPER_VA = 0x004240b0;
export const FRAME_OPAQUE_423CC0_HOST_COMBINE_VA = 0x00a1b050;
export const FRAME_OPAQUE_423CC0_INDIRECT_C57B18_VA = 0x00c57b18;
export const FRAME_OPAQUE_423CC0_INDIRECT_C7E814_VA = 0x00c7e814;
export const FRAME_OPAQUE_423CC0_AFTER_FN_OFF = 0x264;
export const FRAME_OPAQUE_423CC0_AFTER_ARG_OFF = 0x268;
export const FRAME_OPAQUE_423CC0_POPUP_LIT0_VA = 0x00c5d4c0;
export const FRAME_OPAQUE_423CC0_POPUP_LIT1_VA = 0x00c5d4ec;
export const FRAME_OPAQUE_423CC0_TYPE_EQ3 = 3;
export const FRAME_OPAQUE_423CC0_FLAG_BIT_MASK = 0x20;
export const FRAME_OPAQUE_423CC0_F32_ONE_BITS = 0x3f800000;
export const FRAME_OPAQUE_423CC0_ONES_FLOAT_DWORDS = 4;
export const FRAME_OPAQUE_423CC0_ONES_ZERO_BASE = 0x10;
export const FRAME_OPAQUE_423CC0_ONES_ZERO_DWORDS = 7;
export const FRAME_OPAQUE_423CC0_ONES_SIZE = 0x2c;
export const FRAME_OPAQUE_423CC0_ALT_0 = 4;
export const FRAME_OPAQUE_423CC0_ALT_1 = 0xffff;
export const FRAME_OPAQUE_423CC0_ALT_2 = 0;
export const FRAME_OPAQUE_423CC0_ALT_3 = 0x3f800000;
export const FRAME_OPAQUE_423CC0_ALT_4 = 0xffffffff;
export const FRAME_OPAQUE_423CC0_ALT_5 = 0;
export const FRAME_OPAQUE_423CC0_ALT_6 = 0;
export const FRAME_OPAQUE_423CC0_ALT_BYTES = 0x1c;
export const FRAME_OPAQUE_423CC0_STRINGIFY_ARG = 0xff362f2d;
export const FRAME_OPAQUE_423CC0_SUB_OBJ_OFF = 0x4ae28;
export const FRAME_OPAQUE_423CC0_BEGIN_OFF = 0x10;
export const FRAME_OPAQUE_423CC0_END_OFF = 0x14;
export const FRAME_OPAQUE_423CC0_ENTRY_STRIDE = 0x10;
export const FRAME_OPAQUE_423CC0_RANGE_MSG_VA = 0x00b82e78;
export const FRAME_OPAQUE_423CC0_RANGE_LEVEL = 0x10;
export const FRAME_OPAQUE_423CC0_NONE_SENTINEL = 0xffffffff;
export const FRAME_OPAQUE_423CC0_NONE_PTR_VA = 0x00b6d124;
export const FRAME_OPAQUE_423CC0_GETTER_VTBL_OFF = 0x10;
export const FRAME_OPAQUE_424130_VA = 0x00424130;
export const FRAME_OPAQUE_424130_END_VA = 0x0042420f;
export const FRAME_OPAQUE_424130_ITER_CASE_A = 0;
export const FRAME_OPAQUE_424130_ITER_CASE_B = 1;
export const FRAME_OPAQUE_424130_CASE_A_X_OFF = 0x128;
export const FRAME_OPAQUE_424130_CASE_A_SCALE_OFF = 0x114;
export const FRAME_OPAQUE_424130_CASE_A_Y_OFF = 0x12c;
export const FRAME_OPAQUE_424130_CASE_B_SCALE_OFF = 0x244;
export const FRAME_OPAQUE_424130_CASE_B_X_OFF = 0x258;
export const FRAME_OPAQUE_424130_CASE_B_Y_OFF = 0x25c;
export const FRAME_OPAQUE_424130_RDATA_A1_VA = 0x00baa7e8;
export const FRAME_OPAQUE_424130_RDATA_A2_VA = 0x00baa960;
export const FRAME_OPAQUE_424130_RDATA_B1_VA = 0x00baa9b0;
export const FRAME_OPAQUE_424130_RDATA_B2_VA = 0x00baa990;
export const FRAME_OPAQUE_424130_BSS_X_VA = 0x00c78dc4;
export const FRAME_OPAQUE_424130_BSS_Y_VA = 0x00c78edc;
export const FRAME_OPAQUE_424130_DEF_X_VA = 0x00c7b640;
export const FRAME_OPAQUE_424130_DEF_Y_VA = 0x00c7b644;

export function frameOpaque423cc0HostVa() {
  return FRAME_OPAQUE_423CC0_VA >>> 0;
}
export function frameOpaque423cc0EndVa() {
  return FRAME_OPAQUE_423CC0_END_VA >>> 0;
}
export function frameOpaque423cc0Iterations() {
  return FRAME_OPAQUE_423CC0_ITERATIONS >>> 0;
}
export function frameOpaque423cc0Stride() {
  return FRAME_OPAQUE_423CC0_STRIDE >>> 0;
}
export function frameOpaque423cc0SlotBaseOff() {
  return FRAME_OPAQUE_423CC0_SLOT_BASE_OFF >>> 0;
}
export function frameOpaque423cc0ModeSelect(bitSet) {
  /* PE test byte [0xc798e4],4; mov eax,1; mov ecx,6; cmove eax,ecx —
     cmove = CMOVZ: eax <- 6 only when ZF (bit CLEAR). bit set -> 1. */
  return ((bitSet >>> 0) & 1) !== 0
    ? FRAME_OPAQUE_423CC0_MODE_OFF >>> 0
    : FRAME_OPAQUE_423CC0_MODE_ON >>> 0;
}
export function frameOpaque423cc0ScaleF32(f260) {
  /* PE @0x423eaf mulss xmm0,[0xbaa528] (1.5f) — f32 product. */
  const a = f32Bits(f260 >>> 0);
  return f32BitsFromFloat(a * 1.5);
}
export function frameOpaque423cc0SlotSkip(type, byte4) {
  /* PE @0x423e37 cmp [edi+8],0x20; je skip (FULL-DWORD eq);
     @0x423e41 cmp byte [edi+4],0; je skip (LOW-BYTE zero). */
  if ((type >>> 0) === FRAME_OPAQUE_423CC0_SKIP_TYPE) return 1;
  if (((byte4 >>> 0) & 0xff) === 0) return 1;
  return 0;
}
export function frameOpaque423cc0RenderNeeded(gateA) {
  /* PE @0x423de7 cmp byte [edi-0x13],0; je skip — LOW-BYTE. */
  return ((gateA >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque423cc0RenderFirstOff(order) {
  /* PE @0x423def cmp byte [edi-0xac],0; lea ecx,[edi-0xcc]; je 0x423e16
     — byte==0 -> edi-0xec (this+0x30) first; else edi-0xcc (this+0x50). */
  return ((order >>> 0) & 0xff) !== 0
    ? FRAME_OPAQUE_423CC0_RENDER_A_OFF >>> 0
    : FRAME_OPAQUE_423CC0_RENDER_B_OFF >>> 0;
}
export function frameOpaque423cc0BoundsOk(index, begin, end) {
  /* PE @0x423fba sub ecx,edx; sar ecx,4 (SIGNED) / @0x423fc5
     cmp eax,ecx; jb (UNSIGNED below). */
  const diff = ((end >>> 0) - (begin >>> 0)) | 0;
  const shr = diff >> 4;
  return ((index >>> 0) < (shr >>> 0)) ? 1 : 0;
}
export function frameOpaque423cc0EntryOffset(index) {
  /* PE @0x423fde add eax,eax / mov ecx,[edx+eax*8] — index*16, wrap. */
  return ((index >>> 0) * 16) >>> 0;
}
export function frameOpaque423cc0EntryIsNone(entry) {
  /* PE @0x423fe3 cmp ecx,-1; jne use — sentinel -> 0xb6d124 "None". */
  return ((entry >>> 0) === FRAME_OPAQUE_423CC0_NONE_SENTINEL) ? 1 : 0;
}

/* PURE 0x424130 vec leaf: iter 0 -> caseA (movups [this+0x128]),
   iter 1 -> caseB, else default raw dword vec2. Every mulss/subss/addss
   rounds f32 (sub eax,0; je / sub eax,1; je dispatch). f32Bits /
   f32BitsFromFloat are the shared model helpers. */
export function frameOpaque424130VecX(iter, f260, f128, f114, f12c, f244,
                                       f258, f25c, bssX, bssY, defX, defY) {
  const v260 = f32Bits(f260 >>> 0);
  if ((iter >>> 0) === FRAME_OPAQUE_424130_ITER_CASE_A) {
    /* xmm1 = movups [this+0x128]; xmm0 = xmm2*8.0f; xmm1 -= xmm0. */
    const v128 = f32Bits(f128 >>> 0);
    const t0 = f32(v260 * 8.0);
    return f32BitsFromFloat(v128 - t0);
  }
  if ((iter >>> 0) === FRAME_OPAQUE_424130_ITER_CASE_B) {
    /* xmm1 = [0xc78dc4] - xmm2*88.0f + [this+0x258]. */
    const v258 = f32Bits(f258 >>> 0);
    const vbx = f32Bits(bssX >>> 0);
    const t0 = f32(v260 * 88.0);
    return f32BitsFromFloat(f32(vbx - t0) + v258);
  }
  /* default: raw dword copy of the 0xc7b640 vec2 x. */
  return defX >>> 0;
}
export function frameOpaque424130VecY(iter, f260, f128, f114, f12c, f244,
                                       f258, f25c, bssX, bssY, defX, defY) {
  const v260 = f32Bits(f260 >>> 0);
  if ((iter >>> 0) === FRAME_OPAQUE_424130_ITER_CASE_A) {
    /* [0xc78edc] - xmm2*76.0f + xmm2*[this+0x114] + [this+0x12c]. */
    const v114 = f32Bits(f114 >>> 0);
    const v12c = f32Bits(f12c >>> 0);
    const vby = f32Bits(bssY >>> 0);
    const t0 = f32(v260 * 76.0);
    const t1 = f32(v260 * v114);
    return f32BitsFromFloat(f32(f32(vby - t0) + t1) + v12c);
  }
  if ((iter >>> 0) === FRAME_OPAQUE_424130_ITER_CASE_B) {
    /* [0xc78edc] - xmm2*76.0f + xmm2*[this+0x244] + [this+0x25c]. */
    const v244 = f32Bits(f244 >>> 0);
    const v25c = f32Bits(f25c >>> 0);
    const vby = f32Bits(bssY >>> 0);
    const t0 = f32(v260 * 76.0);
    const t1 = f32(v260 * v244);
    return f32BitsFromFloat(f32(f32(vby - t0) + t1) + v25c);
  }
  /* default: raw dword copy of the 0xc7b640 vec2 y. */
  return defY >>> 0;
}

/* ================== v48: 0x004240b0 icon-pos composer ================
   PE 0x004240b0..0x42411f ret 8 (thiscall this=ecx; args out[ebp+8],
   idx[ebp+0xc]); 5 callers (0x423ed1/0x423fa9/0x8cb2a3/0x95ec83/
   0x95ecf4). Gate [this+idx*0x130+0x34] FULL-DWORD -> walk 0x40ace0
   ("IconPos" 0xb1c248) when nonzero, else ecx=0 (null-deref [0] quirk;
   vec host-sampled). result = f32(scale*vec + base), scale=[this+0x260].
   base vec from PURE sibling 0x424130 (v47 law). */
export const FRAME_OPAQUE_4240B0_VA = 0x004240b0;
export const FRAME_OPAQUE_4240B0_END_VA = 0x00424120;
export const FRAME_OPAQUE_4240B0_CALL_SITES = 5;
export const FRAME_OPAQUE_4240B0_CALLER1_VA = 0x00423ed1;
export const FRAME_OPAQUE_4240B0_CALLER2_VA = 0x00423fa9;
export const FRAME_OPAQUE_4240B0_CALLER3_VA = 0x008cb2a3;
export const FRAME_OPAQUE_4240B0_CALLER4_VA = 0x0095ec83;
export const FRAME_OPAQUE_4240B0_CALLER5_VA = 0x0095ecf4;
export const FRAME_OPAQUE_4240B0_CALLEE_VA = 0x00424130;
export const FRAME_OPAQUE_4240B0_WALK_VA = 0x0040ace0;
export const FRAME_OPAQUE_4240B0_NAME_VA = 0x00b1c248;
export const FRAME_OPAQUE_4240B0_STRIDE = 0x130;
export const FRAME_OPAQUE_4240B0_GATE_OFF = 0x34;
export const FRAME_OPAQUE_4240B0_RECV_OFF = 0x30;
export const FRAME_OPAQUE_4240B0_SCALE_OFF = 0x260;

export function frameOpaque4240b0WalkNeeded(gate) {
  /* cmp dword [this+idx*0x130+0x34],0; jne walk — FULL-DWORD test. */
  return (gate >>> 0) !== 0 ? 1 : 0;
}

export function frameOpaque4240b0ResultX(scaleBits, base0Bits, vec0Bits) {
  /* @0x4240fe mulss xmm0=scale*vec0; @0x424109 addss +base0. */
  const scale = f32Bits(scaleBits >>> 0);
  const base0 = f32Bits(base0Bits >>> 0);
  const vec0 = f32Bits(vec0Bits >>> 0);
  return f32BitsFromFloat(f32(f32(scale * vec0) + base0));
}

export function frameOpaque4240b0ResultY(scaleBits, base1Bits, vec1Bits) {
  /* @0x424103 mulss xmm1=scale*vec1; @0x42410d addss +base1. */
  const scale = f32Bits(scaleBits >>> 0);
  const base1 = f32Bits(base1Bits >>> 0);
  const vec1 = f32Bits(vec1Bits >>> 0);
  return f32BitsFromFloat(f32(f32(scale * vec1) + base1));
}
/* ---- v33-v58 const/getter re-splice (auto-generated from intact cpp + header, 2026-08-18) ---- */
export const FRAME_OPAQUE_4214B0_ANIM_DATA_PTR_OFF = 0x34;
export const FRAME_OPAQUE_4214B0_ANM2_GET_LAYER_VA = 0x0040b220;
export const FRAME_OPAQUE_4214B0_ANM2_LOAD_GRAPHICS_VA = 0x0040c000;
export const FRAME_OPAQUE_4214B0_ANM2_LOAD_VA = 0x0040bd50;
export const FRAME_OPAQUE_4214B0_ANM2_REWIND_VA = 0x0040a1b0;
export const FRAME_OPAQUE_4214B0_ANM2_SET_OVERLAY_VA = 0x0040a5d0;
export const FRAME_OPAQUE_4214B0_END_VA = 0x00421591;
export const FRAME_OPAQUE_4214B0_GET_LAYER_ARG = 4;
export const FRAME_OPAQUE_4214B0_KEY_CAP_OFF = 0x14c;
export const FRAME_OPAQUE_4214B0_KEY_DATA_OFF = 0x138;
export const FRAME_OPAQUE_4214B0_KEY_FLAG_OFF = 0x34;
export const FRAME_OPAQUE_4214B0_LAYER_FLAGS_OFF = 0x8c;
export const FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR = 0x20;
export const FRAME_OPAQUE_4214B0_LOAD_GRAPHICS = 0x01;
export const FRAME_OPAQUE_4214B0_LOAD_PATH_OFF = 0x120;
export const FRAME_OPAQUE_4214B0_MAX_MODE = 4;
export const FRAME_OPAQUE_4214B0_MODE_STORE_OFF = 0x04;
export const FRAME_OPAQUE_4214B0_NEXT_VA = 0x004215a0;
export const FRAME_OPAQUE_4214B0_OPEN_STORE = 0x01;
export const FRAME_OPAQUE_4214B0_OPEN_STORE_OFF = 0x00;
export const FRAME_OPAQUE_4214B0_PLAYING_FLAG_OFF = 0x44;
export const FRAME_OPAQUE_4214B0_PLAYING_FLAG_SET = 0x01;
export const FRAME_OPAQUE_4214B0_RECORD_STRIDE = 0x38;
export const FRAME_OPAQUE_4214B0_REWIND_OFF = 0x30;
export const FRAME_OPAQUE_4214B0_SSO_CAP = 0x10;
export const FRAME_OPAQUE_4215A0_COPY_TOTAL = 0x18;
export const FRAME_OPAQUE_4215A0_DTOR_VA = 0x0040d040;
export const FRAME_OPAQUE_4215A0_END_VA = 0x004215d9;
export const FRAME_OPAQUE_4215A0_NEXT_VA = 0x004215e0;
export const FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY = 0x0f;
export const FRAME_OPAQUE_4215A0_SRC_CAP_OFF = 0x14;
export const FRAME_OPAQUE_4215A0_SRC_DATA_OFF = 0x00;
export const FRAME_OPAQUE_4215A0_SRC_SIZE_OFF = 0x10;
export const FRAME_OPAQUE_4215E0_COPY_TOTAL = 0x18;
export const FRAME_OPAQUE_4215E0_DTOR_VA = 0x0040d040;
export const FRAME_OPAQUE_4215E0_END_VA = 0x00421611;
export const FRAME_OPAQUE_4215E0_NEXT_VA = 0x00421618;
export const FRAME_OPAQUE_4215E0_RET_ARGS = 8;
export const FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY = 0x0f;
export const FRAME_OPAQUE_4215E0_SRC_CAP_OFF = 0x14;
export const FRAME_OPAQUE_4215E0_SRC_DATA_OFF = 0x00;
export const FRAME_OPAQUE_4215E0_SRC_SIZE_OFF = 0x10;
export const FRAME_OPAQUE_421620_ALLOC_VA = 0x0040cf00;
export const FRAME_OPAQUE_421620_END_VA = 0x0042167b;
export const FRAME_OPAQUE_421620_MEMCPY_IAT_VA = 0x00af05df;
export const FRAME_OPAQUE_421620_SRC_CAP_OFF = 0x14;
export const FRAME_OPAQUE_421620_SRC_DATA_OFF = 0x00;
export const FRAME_OPAQUE_421620_SRC_LEN_OFF = 0x10;
export const FRAME_OPAQUE_421620_THROW_VA = 0x0040ccc0;
export const FRAME_OPAQUE_421680_END_VA = 0x00421712;
export const FRAME_OPAQUE_421680_NEXT_VA = 0x00421720;
export const FRAME_OPAQUE_421720_BITMAP_A_OFF = 0x8ac;
export const FRAME_OPAQUE_421720_BITMAP_B_OFF = 0x8bc;
export const FRAME_OPAQUE_421720_BIT_MASK = 0x1f;
export const FRAME_OPAQUE_421720_END_VA = 0x00421767;
export const FRAME_OPAQUE_421720_NEXT_VA = 0x00421770;
export const FRAME_OPAQUE_421720_WORD_SHIFT = 5;
export const FRAME_OPAQUE_421770_END_VA = 0x00421776;
export const FRAME_OPAQUE_421770_FIELD_OFF = 0x26584;
export const FRAME_OPAQUE_421780_END_VA = 0x0042178a;
export const FRAME_OPAQUE_421780_GAME_ADD = 0x26630;
export const FRAME_OPAQUE_421790_END_VA = 0x0042179a;
export const FRAME_OPAQUE_421790_GAME_ADD = 0x18910;
export const FRAME_OPAQUE_4217A0_BITMAP_OFF = 0x26548;
export const FRAME_OPAQUE_4217A0_DWORD_SHIFT = 0x20;
export const FRAME_OPAQUE_4217A0_END_VA = 0x004217f0;
export const FRAME_OPAQUE_4217A0_LO_MASK = 0x3f;
export const FRAME_OPAQUE_4217A0_MAX_ID = 0x34;
export const FRAME_OPAQUE_4217A0_NEXT_VA = 0x004217f3;
export const FRAME_OPAQUE_4217A0_PAIR_STRIDE = 0x08;
export const FRAME_OPAQUE_421800_END_VA = 0x00421804;
export const FRAME_OPAQUE_421800_FIELD_OFF = 0x14;
export const FRAME_OPAQUE_421800_VA = 0x00421800;
export const FRAME_OPAQUE_4218E0_BITMAP_A_OFF = 0x8ac;
export const FRAME_OPAQUE_4218E0_BITMAP_B_OFF = 0x8bc;
export const FRAME_OPAQUE_4218E0_BITMAP_COUNT = 0x68;
export const FRAME_OPAQUE_4218E0_BITMAP_COUNT_OFF = 0x8b8;
export const FRAME_OPAQUE_4218E0_FILL_VA = 0x00423090;
export const FRAME_OPAQUE_4218E0_RECORDS_OFF = 0x28;
export const FRAME_OPAQUE_4218E0_RECORD_COUNT = 0x25;
export const FRAME_OPAQUE_4218E0_RECORD_STRIDE = 0x3c;
export const FRAME_OPAQUE_423950_END_VA = 0x00423957;
export const FRAME_OPAQUE_423950_VA = 0x00423950;
export const FRAME_OPAQUE_423960_END_VA = 0x00423970;
export const FRAME_OPAQUE_423960_VA = 0x00423960;
export const FRAME_OPAQUE_423960_VEC_END_OFF = 0x4b3dc;
export const FRAME_OPAQUE_423960_VEC_OFF = 0x4b3d8;
export const FRAME_OPAQUE_423970_END_VA = 0x00423984;
export const FRAME_OPAQUE_423970_ENTRY_OFF = 0xc;
export const FRAME_OPAQUE_423970_NULL_MARKER = 0xdeadbeef;
export const FRAME_OPAQUE_423970_RTTI_OFF = 0x378;
export const FRAME_OPAQUE_423970_VA = 0x00423970;
export const FRAME_OPAQUE_423990_END_VA = 0x004239ad;
export const FRAME_OPAQUE_423990_INIT_VA = 0x004239b0;
export const FRAME_OPAQUE_423990_SEH_VA = 0x00423aa0;
export const FRAME_OPAQUE_423990_VA = 0x00423990;
export const FRAME_OPAQUE_4239B0_END_VA = 0x00423a92;
export const FRAME_OPAQUE_4239B0_VA = 0x004239b0;
export const FRAME_OPAQUE_423AA0_END_VA = 0x00423cb4;
export const FRAME_OPAQUE_423AA0_VA = 0x00423aa0;
export const FRAME_OPAQUE_424220_CASE_A_GLOBAL_VA = 0x00bf9444;
export const FRAME_OPAQUE_424220_DEFAULT_RESULT = 0xffffffff;
export const FRAME_OPAQUE_424220_END_VA = 0x0042429b;
export const FRAME_OPAQUE_424220_HOST1_VA = 0x0090b070;
export const FRAME_OPAQUE_424220_HOST2_VA = 0x00417870;
export const FRAME_OPAQUE_424220_NULL_MARKER = 0xdeadbeef;
export const FRAME_OPAQUE_424220_VA = 0x00424220;
export const FRAME_OPAQUE_4242B0_CALL_SITES = 8;
export const FRAME_OPAQUE_4242B0_CB_GLOBAL_VA = 0x00c7e814;
export const FRAME_OPAQUE_4242B0_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_4242B0_END_VA = 0x00424306;
export const FRAME_OPAQUE_4242B0_SEH_HANDLER_VA = 0x00af0d10;
export const FRAME_OPAQUE_4242B0_VA = 0x004242b0;
export const FRAME_OPAQUE_424310_ALLOC_HOST_VA = 0x00a0f4c0;
export const FRAME_OPAQUE_424310_ALLOC_SIZE = 0x14;
export const FRAME_OPAQUE_424310_CALL_SITES = 7;
export const FRAME_OPAQUE_424310_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_424310_END_VA = 0x0042441c;
export const FRAME_OPAQUE_424310_SEH_HANDLER_VA = 0x00af192d;
export const FRAME_OPAQUE_424310_SUBINIT_HOST_VA = 0x00424440;
export const FRAME_OPAQUE_424310_VA = 0x00424310;
export const FRAME_OPAQUE_424310_ZERO_DWORD_COUNT = 18;
export const FRAME_OPAQUE_424440_BYTE_ONE_OFF = 0x6c;
export const FRAME_OPAQUE_424440_BYTE_ZERO_OFF = 0x74;
export const FRAME_OPAQUE_424440_CALL_SITES = 14;
export const FRAME_OPAQUE_424440_COPY_COUNT = 3;
export const FRAME_OPAQUE_424440_END_VA = 0x00424502;
export const FRAME_OPAQUE_424440_MINUS_ONE_OFF = 0x38;
export const FRAME_OPAQUE_424440_VA = 0x00424440;
export const FRAME_OPAQUE_424440_ZERO_DWORD_COUNT = 16;
export const FRAME_OPAQUE_424510_CALL_SITES = 39;
export const FRAME_OPAQUE_424510_END_VA = 0x00424527;
export const FRAME_OPAQUE_424510_VA = 0x00424510;
export const FRAME_OPAQUE_424510_ZERO_DWORD_COUNT = 3;
export const FRAME_OPAQUE_424530_END_VA = 0x00424533;
export const FRAME_OPAQUE_424530_VA = 0x00424530;
export const FRAME_OPAQUE_424580_ATAN_VA = 0x00499d60;
export const FRAME_OPAQUE_424580_CALL_SITES = 2;
export const FRAME_OPAQUE_424580_END_VA = 0x0042489c;
export const FRAME_OPAQUE_424580_UNPACK_VA = 0x00a0f550;
export const FRAME_OPAQUE_424580_VA = 0x00424580;
export const FRAME_OPAQUE_4248A0_BAND_A_VA = 0x00424580;
export const FRAME_OPAQUE_4248A0_CALL_SITES = 1;
export const FRAME_OPAQUE_4248A0_END_VA = 0x00424c33;
export const FRAME_OPAQUE_4248A0_VA = 0x004248a0;
export const FRAME_OPAQUE_424C40_CALL_SITES = 3;
export const FRAME_OPAQUE_424C40_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_424C40_END_VA = 0x00424cc4;
export const FRAME_OPAQUE_424C40_PAIR0_CALL_VA = 0x00424c6b;
export const FRAME_OPAQUE_424C40_PAIR1_CALL_VA = 0x00424c7c;
export const FRAME_OPAQUE_424C40_SEH_HANDLER_VA = 0x00af198d;
export const FRAME_OPAQUE_424C40_VA = 0x00424c40;
export const FRAME_OPAQUE_424C40_ZERO_DWORD_COUNT = 7;
export const FRAME_OPAQUE_424CD0_CALL_SITES = 5;
export const FRAME_OPAQUE_424CD0_CHAIN0_CALLBACK_CALL_VA = 0x00424d2c;
export const FRAME_OPAQUE_424CD0_CHAIN0_GATE_VA = 0x00424d10;
export const FRAME_OPAQUE_424CD0_CHAIN0_RELEASE_CALL_VA = 0x00424d1c;
export const FRAME_OPAQUE_424CD0_CHAIN1_CALLBACK_CALL_VA = 0x00424d54;
export const FRAME_OPAQUE_424CD0_CHAIN1_GATE_VA = 0x00424d38;
export const FRAME_OPAQUE_424CD0_CHAIN1_RELEASE_CALL_VA = 0x00424d44;
export const FRAME_OPAQUE_424CD0_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_424CD0_END_VA = 0x00424d6a;
export const FRAME_OPAQUE_424CD0_PAIR0_CALL_VA = 0x00424cf8;
export const FRAME_OPAQUE_424CD0_PAIR1_CALL_VA = 0x00424d04;
export const FRAME_OPAQUE_424CD0_SEH_HANDLER_VA = 0x00af0b40;
export const FRAME_OPAQUE_424CD0_VA = 0x00424cd0;
export const FRAME_OPAQUE_424D70_CALL_4248A0_VA = 0x00424de8;
export const FRAME_OPAQUE_424D70_CALL_SITES = 3;
export const FRAME_OPAQUE_424D70_END_VA = 0x00424e56;
export const FRAME_OPAQUE_424D70_FIELD_COUNT = 4;
export const FRAME_OPAQUE_424D70_RET_BYTES = 0x10;
export const FRAME_OPAQUE_424D70_VA = 0x00424d70;
export const FRAME_OPAQUE_424E60_CALLER1_VA = 0x0066158c;
export const FRAME_OPAQUE_424E60_CALLER2_VA = 0x00661b9b;
export const FRAME_OPAQUE_424E60_CALL_SITES = 2;
export const FRAME_OPAQUE_424E60_END_VA = 0x00424e71;
export const FRAME_OPAQUE_424E60_RET_BYTES = 4;
export const FRAME_OPAQUE_424E60_VA = 0x00424e60;
export const FRAME_OPAQUE_424E80_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_424E80_DTOR_COUNT = 5;
export const FRAME_OPAQUE_424E80_END_VA = 0x00424ee4;
export const FRAME_OPAQUE_424E80_SEH_HANDLER_VA = 0x00af09f0;
export const FRAME_OPAQUE_424E80_VA = 0x00424e80;
export const FRAME_OPAQUE_424EF0_ATTACH_COUNT = 0xc;
export const FRAME_OPAQUE_424EF0_CALLER1_VA = 0x009480d4;
export const FRAME_OPAQUE_424EF0_CALLER2_VA = 0x009b58b5;
export const FRAME_OPAQUE_424EF0_CALL_SITES = 2;
export const FRAME_OPAQUE_424EF0_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_424EF0_END_VA = 0x0042512c;
export const FRAME_OPAQUE_424EF0_RET_BYTES = 4;
export const FRAME_OPAQUE_424EF0_SEH_HANDLER_VA = 0x00af19c5;
export const FRAME_OPAQUE_424EF0_VA = 0x00424ef0;
export const FRAME_OPAQUE_4253B0_CHAR_OFF = 0x13c0;
export const FRAME_OPAQUE_4253B0_END_VA = 0x004253b6;
export const FRAME_OPAQUE_4253B0_VA = 0x004253b0;
export const FRAME_OPAQUE_4253C0_END_VA = 0x004253ca;
export const FRAME_OPAQUE_4253C0_MANAGER_ADD = 0x4a920;
export const FRAME_OPAQUE_4253C0_VA = 0x004253c0;
export const FRAME_OPAQUE_4253D0_ELEM_ID_OFF = 0x1618;
export const FRAME_OPAQUE_4253D0_END_VA = 0x0042540d;
export const FRAME_OPAQUE_4253D0_ID_VEC_END_OFF = 0x1baac;
export const FRAME_OPAQUE_4253D0_ID_VEC_OFF = 0x1baa8;
export const FRAME_OPAQUE_4253D0_KEY_OFF = 0xc;
export const FRAME_OPAQUE_4253D0_VA = 0x004253d0;
export const FRAME_OPAQUE_425430_COUNT = 0x15;
export const FRAME_OPAQUE_425430_END_VA = 0x0042549e;
export const FRAME_OPAQUE_425430_HELPER_VA = 0x00aef638;
export const FRAME_OPAQUE_425430_INIT_COOKIE = 0x00425410;
export const FRAME_OPAQUE_425430_INIT_DEST_OFF = 0xc;
export const FRAME_OPAQUE_425430_STRIDE = 0x34;
export const FRAME_OPAQUE_425430_SUB_CALL_VA = 0x004265d0;
export const FRAME_OPAQUE_425430_VA = 0x00425430;
export const FRAME_OPAQUE_425430_ZERO_BYTE_OFF = 0x450;
export const FRAME_OPAQUE_4254B0_END_VA = 0x004257ac;
export const FRAME_OPAQUE_4254B0_VA = 0x004254b0;
export const FRAME_OPAQUE_499D60_CALL_SITES = 179;
export const FRAME_OPAQUE_499D60_CRT_VA = 0x00af08c3;
export const FRAME_OPAQUE_499D60_END_VA = 0x00499d99;
export const FRAME_OPAQUE_499D60_IAT_VA = 0x00b187f8;
export const FRAME_OPAQUE_499D60_VA = 0x00499d60;
export const FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE = 0x3c;
export const FRAME_OPAQUE_SHUFFLE_END_VA = 0x00421b43;
export const FRAME_OPAQUE_SHUFFLE_LOOP_VA = 0x00421a50;
export const FRAME_OPAQUE_SHUFFLE_PRNG_BOUND = 0x270;
export const FRAME_OPAQUE_SHUFFLE_PRNG_INIT_VA = 0x008fd3c0;
export const FRAME_OPAQUE_SHUFFLE_PRNG_NEXT_VA = 0x008fd410;
export const FRAME_OPAQUE_SHUFFLE_RECORD_SIZE = 0x14;
export function frameOpaque4214b0AnimDataPtrOff() {
  return FRAME_OPAQUE_4214B0_ANIM_DATA_PTR_OFF >>> 0;
}
export function frameOpaque4214b0Anm2GetLayerVa() {
  return FRAME_OPAQUE_4214B0_ANM2_GET_LAYER_VA >>> 0;
}
export function frameOpaque4214b0Anm2LoadGraphicsVa() {
  return FRAME_OPAQUE_4214B0_ANM2_LOAD_GRAPHICS_VA >>> 0;
}
export function frameOpaque4214b0Anm2LoadVa() {
  return FRAME_OPAQUE_4214B0_ANM2_LOAD_VA >>> 0;
}
export function frameOpaque4214b0Anm2RewindVa() {
  return FRAME_OPAQUE_4214B0_ANM2_REWIND_VA >>> 0;
}
export function frameOpaque4214b0Anm2SetOverlayVa() {
  return FRAME_OPAQUE_4214B0_ANM2_SET_OVERLAY_VA >>> 0;
}
export function frameOpaque4214b0EndVa() {
  return FRAME_OPAQUE_4214B0_END_VA >>> 0;
}
export function frameOpaque4214b0GetLayerArg() {
  return FRAME_OPAQUE_4214B0_GET_LAYER_ARG >>> 0;
}
export function frameOpaque4214b0HostVa() {
  return FRAME_OPAQUE_4214B0_HOST_VA >>> 0;
}
export function frameOpaque4214b0KeyCapOff() {
  return FRAME_OPAQUE_4214B0_KEY_CAP_OFF >>> 0;
}
export function frameOpaque4214b0KeyDataOff() {
  return FRAME_OPAQUE_4214B0_KEY_DATA_OFF >>> 0;
}
export function frameOpaque4214b0KeyFlagOff() {
  return FRAME_OPAQUE_4214B0_KEY_FLAG_OFF >>> 0;
}
export function frameOpaque4214b0LayerFlagsOff() {
  return FRAME_OPAQUE_4214B0_LAYER_FLAGS_OFF >>> 0;
}
export function frameOpaque4214b0LayerFlagsOr() {
  return FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR >>> 0;
}
export function frameOpaque4214b0LoadGraphics() {
  return FRAME_OPAQUE_4214B0_LOAD_GRAPHICS >>> 0;
}
export function frameOpaque4214b0LoadPathOff() {
  return FRAME_OPAQUE_4214B0_LOAD_PATH_OFF >>> 0;
}
export function frameOpaque4214b0MaxMode() {
  return FRAME_OPAQUE_4214B0_MAX_MODE >>> 0;
}
export function frameOpaque4214b0ModeStoreOff() {
  return FRAME_OPAQUE_4214B0_MODE_STORE_OFF >>> 0;
}
export function frameOpaque4214b0NextVa() {
  return FRAME_OPAQUE_4214B0_NEXT_VA >>> 0;
}
export function frameOpaque4214b0OpenStore() {
  return FRAME_OPAQUE_4214B0_OPEN_STORE >>> 0;
}
export function frameOpaque4214b0OpenStoreOff() {
  return FRAME_OPAQUE_4214B0_OPEN_STORE_OFF >>> 0;
}
export function frameOpaque4214b0PlayingFlagOff() {
  return FRAME_OPAQUE_4214B0_PLAYING_FLAG_OFF >>> 0;
}
export function frameOpaque4214b0PlayingFlagSet() {
  return FRAME_OPAQUE_4214B0_PLAYING_FLAG_SET >>> 0;
}
export function frameOpaque4214b0RecordStride() {
  return FRAME_OPAQUE_4214B0_RECORD_STRIDE >>> 0;
}
export function frameOpaque4214b0RewindOff() {
  return FRAME_OPAQUE_4214B0_REWIND_OFF >>> 0;
}
export function frameOpaque4214b0SsoCap() {
  return FRAME_OPAQUE_4214B0_SSO_CAP >>> 0;
}
export function frameOpaque4215a0CopyTotal() {
  return FRAME_OPAQUE_4215A0_COPY_TOTAL >>> 0;
}
export function frameOpaque4215a0DtorVa() {
  return FRAME_OPAQUE_4215A0_DTOR_VA >>> 0;
}
export function frameOpaque4215a0EndVa() {
  return FRAME_OPAQUE_4215A0_END_VA >>> 0;
}
export function frameOpaque4215a0HostVa() {
  return FRAME_OPAQUE_4215A0_HOST_VA >>> 0;
}
export function frameOpaque4215a0NextVa() {
  return FRAME_OPAQUE_4215A0_NEXT_VA >>> 0;
}
export function frameOpaque4215a0SrcCapEmpty() {
  return FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY >>> 0;
}
export function frameOpaque4215a0SrcCapOff() {
  return FRAME_OPAQUE_4215A0_SRC_CAP_OFF >>> 0;
}
export function frameOpaque4215a0SrcDataOff() {
  return FRAME_OPAQUE_4215A0_SRC_DATA_OFF >>> 0;
}
export function frameOpaque4215a0SrcSizeOff() {
  return FRAME_OPAQUE_4215A0_SRC_SIZE_OFF >>> 0;
}
export function frameOpaque4215e0CopyTotal() {
  return FRAME_OPAQUE_4215E0_COPY_TOTAL >>> 0;
}
export function frameOpaque4215e0DtorVa() {
  return FRAME_OPAQUE_4215E0_DTOR_VA >>> 0;
}
export function frameOpaque4215e0EndVa() {
  return FRAME_OPAQUE_4215E0_END_VA >>> 0;
}
export function frameOpaque4215e0HostVa() {
  return FRAME_OPAQUE_4215E0_HOST_VA >>> 0;
}
export function frameOpaque4215e0NextVa() {
  return FRAME_OPAQUE_4215E0_NEXT_VA >>> 0;
}
export function frameOpaque4215e0RetArgs() {
  return FRAME_OPAQUE_4215E0_RET_ARGS >>> 0;
}
export function frameOpaque4215e0SrcCapEmpty() {
  return FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY >>> 0;
}
export function frameOpaque4215e0SrcCapOff() {
  return FRAME_OPAQUE_4215E0_SRC_CAP_OFF >>> 0;
}
export function frameOpaque4215e0SrcDataOff() {
  return FRAME_OPAQUE_4215E0_SRC_DATA_OFF >>> 0;
}
export function frameOpaque4215e0SrcSizeOff() {
  return FRAME_OPAQUE_4215E0_SRC_SIZE_OFF >>> 0;
}
export function frameOpaque421620AllocVa() {
  return FRAME_OPAQUE_421620_ALLOC_VA >>> 0;
}
export function frameOpaque421620EndVa() {
  return FRAME_OPAQUE_421620_END_VA >>> 0;
}
export function frameOpaque421620HostVa() {
  return FRAME_OPAQUE_421620_HOST_VA >>> 0;
}
export function frameOpaque421620MemcpyVa() {
  return FRAME_OPAQUE_421620_MEMCPY_IAT_VA >>> 0;
}
export function frameOpaque421620SrcCapOff() {
  return FRAME_OPAQUE_421620_SRC_CAP_OFF >>> 0;
}
export function frameOpaque421620SrcDataOff() {
  return FRAME_OPAQUE_421620_SRC_DATA_OFF >>> 0;
}
export function frameOpaque421620SrcLenOff() {
  return FRAME_OPAQUE_421620_SRC_LEN_OFF >>> 0;
}
export function frameOpaque421620ThrowVa() {
  return FRAME_OPAQUE_421620_THROW_VA >>> 0;
}
export function frameOpaque421680EndVa() {
  return FRAME_OPAQUE_421680_END_VA >>> 0;
}
export function frameOpaque421680HostVa() {
  return FRAME_OPAQUE_421680_HOST_VA >>> 0;
}
export function frameOpaque421680NextVa() {
  return FRAME_OPAQUE_421680_NEXT_VA >>> 0;
}
export function frameOpaque421720BitMaskConst() {
  return FRAME_OPAQUE_421720_BIT_MASK >>> 0;
}
export function frameOpaque421720BitmapAOff() {
  return FRAME_OPAQUE_421720_BITMAP_A_OFF >>> 0;
}
export function frameOpaque421720BitmapBOff() {
  return FRAME_OPAQUE_421720_BITMAP_B_OFF >>> 0;
}
export function frameOpaque421720EndVa() {
  return FRAME_OPAQUE_421720_END_VA >>> 0;
}
export function frameOpaque421720HostVa() {
  return FRAME_OPAQUE_421720_HOST_VA >>> 0;
}
export function frameOpaque421720NextVa() {
  return FRAME_OPAQUE_421720_NEXT_VA >>> 0;
}
export function frameOpaque421720WordShift() {
  return FRAME_OPAQUE_421720_WORD_SHIFT >>> 0;
}
export function frameOpaque421770EndVa() {
  return FRAME_OPAQUE_421770_END_VA >>> 0;
}
export function frameOpaque421770FieldOff() {
  return FRAME_OPAQUE_421770_FIELD_OFF >>> 0;
}
export function frameOpaque421770HostVa() {
  return FRAME_OPAQUE_421770_HOST_VA >>> 0;
}
export function frameOpaque421780EndVa() {
  return FRAME_OPAQUE_421780_END_VA >>> 0;
}
export function frameOpaque421780GameAdd() {
  return FRAME_OPAQUE_421780_GAME_ADD >>> 0;
}
export function frameOpaque421780HostVa() {
  return FRAME_OPAQUE_421780_HOST_VA >>> 0;
}
export function frameOpaque421790EndVa() {
  return FRAME_OPAQUE_421790_END_VA >>> 0;
}
export function frameOpaque421790GameAdd() {
  return FRAME_OPAQUE_421790_GAME_ADD >>> 0;
}
export function frameOpaque421790HostVa() {
  return FRAME_OPAQUE_421790_HOST_VA >>> 0;
}
export function frameOpaque4217a0BitmapOff() {
  return FRAME_OPAQUE_4217A0_BITMAP_OFF >>> 0;
}
export function frameOpaque4217a0DwordShift() {
  return FRAME_OPAQUE_4217A0_DWORD_SHIFT >>> 0;
}
export function frameOpaque4217a0EndVa() {
  return FRAME_OPAQUE_4217A0_END_VA >>> 0;
}
export function frameOpaque4217a0HostVa() {
  return FRAME_OPAQUE_4217A0_HOST_VA >>> 0;
}
export function frameOpaque4217a0LoMask() {
  return FRAME_OPAQUE_4217A0_LO_MASK >>> 0;
}
export function frameOpaque4217a0MaxId() {
  return FRAME_OPAQUE_4217A0_MAX_ID >>> 0;
}
export function frameOpaque4217a0NextVa() {
  return FRAME_OPAQUE_4217A0_NEXT_VA >>> 0;
}
export function frameOpaque4217a0PairStride() {
  return FRAME_OPAQUE_4217A0_PAIR_STRIDE >>> 0;
}
export function frameOpaque421800EndVa() {
  return FRAME_OPAQUE_421800_END_VA >>> 0;
}
export function frameOpaque421800FieldOff() {
  return FRAME_OPAQUE_421800_FIELD_OFF >>> 0;
}
export function frameOpaque421800HostVa() {
  return FRAME_OPAQUE_421800_VA >>> 0;
}
export function frameOpaque4218e0BitmapAOff() {
  return FRAME_OPAQUE_4218E0_BITMAP_A_OFF >>> 0;
}
export function frameOpaque4218e0BitmapBOff() {
  return FRAME_OPAQUE_4218E0_BITMAP_B_OFF >>> 0;
}
export function frameOpaque4218e0BitmapCount() {
  return FRAME_OPAQUE_4218E0_BITMAP_COUNT >>> 0;
}
export function frameOpaque4218e0BitmapCountOff() {
  return FRAME_OPAQUE_4218E0_BITMAP_COUNT_OFF >>> 0;
}
export function frameOpaque4218e0FillVa() {
  return FRAME_OPAQUE_4218E0_FILL_VA >>> 0;
}
export function frameOpaque4218e0HostVa() {
  return FRAME_OPAQUE_4218E0_HOST_VA >>> 0;
}
export function frameOpaque4218e0RecordCount() {
  return FRAME_OPAQUE_4218E0_RECORD_COUNT >>> 0;
}
export function frameOpaque4218e0RecordStride() {
  return FRAME_OPAQUE_4218E0_RECORD_STRIDE >>> 0;
}
export function frameOpaque4218e0RecordsOff() {
  return FRAME_OPAQUE_4218E0_RECORDS_OFF >>> 0;
}
export function frameOpaque423950EndVa() {
  return FRAME_OPAQUE_423950_END_VA >>> 0;
}
export function frameOpaque423950HostVa() {
  return FRAME_OPAQUE_423950_VA >>> 0;
}
export function frameOpaque423950IdOff() {
  return FRAME_OPAQUE_PLAYER_ID_OFF >>> 0;
}
export function frameOpaque423960EndVa() {
  return FRAME_OPAQUE_423960_END_VA >>> 0;
}
export function frameOpaque423960HostVa() {
  return FRAME_OPAQUE_423960_VA >>> 0;
}
export function frameOpaque423960VecEndOff() {
  return FRAME_OPAQUE_423960_VEC_END_OFF >>> 0;
}
export function frameOpaque423960VecOff() {
  return FRAME_OPAQUE_423960_VEC_OFF >>> 0;
}
export function frameOpaque423970EndVa() {
  return FRAME_OPAQUE_423970_END_VA >>> 0;
}
export function frameOpaque423970EntryOff() {
  return FRAME_OPAQUE_423970_ENTRY_OFF >>> 0;
}
export function frameOpaque423970HostVa() {
  return FRAME_OPAQUE_423970_VA >>> 0;
}
export function frameOpaque423970NullMarker() {
  return FRAME_OPAQUE_423970_NULL_MARKER >>> 0;
}
export function frameOpaque423970RttiOff() {
  return FRAME_OPAQUE_423970_RTTI_OFF >>> 0;
}
export function frameOpaque423990EndVa() {
  return FRAME_OPAQUE_423990_END_VA >>> 0;
}
export function frameOpaque423990HostVa() {
  return FRAME_OPAQUE_423990_VA >>> 0;
}
export function frameOpaque423990InitVa() {
  return FRAME_OPAQUE_423990_INIT_VA >>> 0;
}
export function frameOpaque423990SehVa() {
  return FRAME_OPAQUE_423990_SEH_VA >>> 0;
}
export function frameOpaque4239b0EndVa() {
  return FRAME_OPAQUE_4239B0_END_VA >>> 0;
}
export function frameOpaque4239b0HostVa() {
  return FRAME_OPAQUE_4239B0_VA >>> 0;
}
export function frameOpaque423aa0EndVa() {
  return FRAME_OPAQUE_423AA0_END_VA >>> 0;
}
export function frameOpaque423aa0HostVa() {
  return FRAME_OPAQUE_423AA0_VA >>> 0;
}
export function frameOpaque424220CaseAGlobalVa() {
  return FRAME_OPAQUE_424220_CASE_A_GLOBAL_VA >>> 0;
}
export function frameOpaque424220DefaultResult() {
  return FRAME_OPAQUE_424220_DEFAULT_RESULT >>> 0;
}
export function frameOpaque424220EndVa() {
  return FRAME_OPAQUE_424220_END_VA >>> 0;
}
export function frameOpaque424220Host1Va() {
  return FRAME_OPAQUE_424220_HOST1_VA >>> 0;
}
export function frameOpaque424220Host2Va() {
  return FRAME_OPAQUE_424220_HOST2_VA >>> 0;
}
export function frameOpaque424220HostVa() {
  return FRAME_OPAQUE_424220_VA >>> 0;
}
export function frameOpaque424220NullMarker() {
  return FRAME_OPAQUE_424220_NULL_MARKER >>> 0;
}
export function frameOpaque4242b0CallSites() {
  return FRAME_OPAQUE_4242B0_CALL_SITES >>> 0;
}
export function frameOpaque4242b0CbGlobalVa() {
  return FRAME_OPAQUE_4242B0_CB_GLOBAL_VA >>> 0;
}
export function frameOpaque4242b0CookieVa() {
  return FRAME_OPAQUE_4242B0_COOKIE_VA >>> 0;
}
export function frameOpaque4242b0EndVa() {
  return FRAME_OPAQUE_4242B0_END_VA >>> 0;
}
export function frameOpaque4242b0HostVa() {
  return FRAME_OPAQUE_4242B0_VA >>> 0;
}
export function frameOpaque4242b0SehHandlerVa() {
  return FRAME_OPAQUE_4242B0_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque424310AllocHostVa() {
  return FRAME_OPAQUE_424310_ALLOC_HOST_VA >>> 0;
}
export function frameOpaque424310AllocSize() {
  return FRAME_OPAQUE_424310_ALLOC_SIZE >>> 0;
}
export function frameOpaque424310CallSites() {
  return FRAME_OPAQUE_424310_CALL_SITES >>> 0;
}
export function frameOpaque424310CookieVa() {
  return FRAME_OPAQUE_424310_COOKIE_VA >>> 0;
}
export function frameOpaque424310EndVa() {
  return FRAME_OPAQUE_424310_END_VA >>> 0;
}
export function frameOpaque424310HostVa() {
  return FRAME_OPAQUE_424310_VA >>> 0;
}
export function frameOpaque424310SehHandlerVa() {
  return FRAME_OPAQUE_424310_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque424310SubinitHostVa() {
  return FRAME_OPAQUE_424310_SUBINIT_HOST_VA >>> 0;
}
export function frameOpaque424310ZeroDwordCount() {
  return FRAME_OPAQUE_424310_ZERO_DWORD_COUNT >>> 0;
}
export function frameOpaque424440ByteOneOff() {
  return FRAME_OPAQUE_424440_BYTE_ONE_OFF >>> 0;
}
export function frameOpaque424440ByteZeroOff() {
  return FRAME_OPAQUE_424440_BYTE_ZERO_OFF >>> 0;
}
export function frameOpaque424440CallSites() {
  return FRAME_OPAQUE_424440_CALL_SITES >>> 0;
}
export function frameOpaque424440CopyCount() {
  return FRAME_OPAQUE_424440_COPY_COUNT >>> 0;
}
export function frameOpaque424440EndVa() {
  return FRAME_OPAQUE_424440_END_VA >>> 0;
}
export function frameOpaque424440HostVa() {
  return FRAME_OPAQUE_424440_VA >>> 0;
}
export function frameOpaque424440MinusOneOff() {
  return FRAME_OPAQUE_424440_MINUS_ONE_OFF >>> 0;
}
export function frameOpaque424440ZeroDwordCount() {
  return FRAME_OPAQUE_424440_ZERO_DWORD_COUNT >>> 0;
}
export function frameOpaque424510CallSites() {
  return FRAME_OPAQUE_424510_CALL_SITES >>> 0;
}
export function frameOpaque424510EndVa() {
  return FRAME_OPAQUE_424510_END_VA >>> 0;
}
export function frameOpaque424510HostVa() {
  return FRAME_OPAQUE_424510_VA >>> 0;
}
export function frameOpaque424510ZeroDwordCount() {
  return FRAME_OPAQUE_424510_ZERO_DWORD_COUNT >>> 0;
}
export function frameOpaque424530EndVa() {
  return FRAME_OPAQUE_424530_END_VA >>> 0;
}
export function frameOpaque424530HostVa() {
  return FRAME_OPAQUE_424530_VA >>> 0;
}
export function frameOpaque424580AtanVa() {
  return FRAME_OPAQUE_424580_ATAN_VA >>> 0;
}
export function frameOpaque424580CallSites() {
  return FRAME_OPAQUE_424580_CALL_SITES >>> 0;
}
export function frameOpaque424580EndVa() {
  return FRAME_OPAQUE_424580_END_VA >>> 0;
}
export function frameOpaque424580HostVa() {
  return FRAME_OPAQUE_424580_VA >>> 0;
}
export function frameOpaque424580UnpackVa() {
  return FRAME_OPAQUE_424580_UNPACK_VA >>> 0;
}
export function frameOpaque4248a0BandAVa() {
  return FRAME_OPAQUE_4248A0_BAND_A_VA >>> 0;
}
export function frameOpaque4248a0CallSites() {
  return FRAME_OPAQUE_4248A0_CALL_SITES >>> 0;
}
export function frameOpaque4248a0EndVa() {
  return FRAME_OPAQUE_4248A0_END_VA >>> 0;
}
export function frameOpaque4248a0HostVa() {
  return FRAME_OPAQUE_4248A0_VA >>> 0;
}
export function frameOpaque424c40CallSites() {
  return FRAME_OPAQUE_424C40_CALL_SITES >>> 0;
}
export function frameOpaque424c40CookieVa() {
  return FRAME_OPAQUE_424C40_COOKIE_VA >>> 0;
}
export function frameOpaque424c40EndVa() {
  return FRAME_OPAQUE_424C40_END_VA >>> 0;
}
export function frameOpaque424c40HostVa() {
  return FRAME_OPAQUE_424C40_VA >>> 0;
}
export function frameOpaque424c40Pair0CallVa() {
  return FRAME_OPAQUE_424C40_PAIR0_CALL_VA >>> 0;
}
export function frameOpaque424c40Pair1CallVa() {
  return FRAME_OPAQUE_424C40_PAIR1_CALL_VA >>> 0;
}
export function frameOpaque424c40SehHandlerVa() {
  return FRAME_OPAQUE_424C40_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque424c40ZeroDwordCount() {
  return FRAME_OPAQUE_424C40_ZERO_DWORD_COUNT >>> 0;
}
export function frameOpaque424cd0CallSites() {
  return FRAME_OPAQUE_424CD0_CALL_SITES >>> 0;
}
export function frameOpaque424cd0Chain0CallbackCallVa() {
  return FRAME_OPAQUE_424CD0_CHAIN0_CALLBACK_CALL_VA >>> 0;
}
export function frameOpaque424cd0Chain0GateVa() {
  return FRAME_OPAQUE_424CD0_CHAIN0_GATE_VA >>> 0;
}
export function frameOpaque424cd0Chain0ReleaseCallVa() {
  return FRAME_OPAQUE_424CD0_CHAIN0_RELEASE_CALL_VA >>> 0;
}
export function frameOpaque424cd0Chain1CallbackCallVa() {
  return FRAME_OPAQUE_424CD0_CHAIN1_CALLBACK_CALL_VA >>> 0;
}
export function frameOpaque424cd0Chain1GateVa() {
  return FRAME_OPAQUE_424CD0_CHAIN1_GATE_VA >>> 0;
}
export function frameOpaque424cd0Chain1ReleaseCallVa() {
  return FRAME_OPAQUE_424CD0_CHAIN1_RELEASE_CALL_VA >>> 0;
}
export function frameOpaque424cd0CookieVa() {
  return FRAME_OPAQUE_424CD0_COOKIE_VA >>> 0;
}
export function frameOpaque424cd0EndVa() {
  return FRAME_OPAQUE_424CD0_END_VA >>> 0;
}
export function frameOpaque424cd0HostVa() {
  return FRAME_OPAQUE_424CD0_VA >>> 0;
}
export function frameOpaque424cd0Pair0CallVa() {
  return FRAME_OPAQUE_424CD0_PAIR0_CALL_VA >>> 0;
}
export function frameOpaque424cd0Pair1CallVa() {
  return FRAME_OPAQUE_424CD0_PAIR1_CALL_VA >>> 0;
}
export function frameOpaque424cd0SehHandlerVa() {
  return FRAME_OPAQUE_424CD0_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque424d70Call4248a0Va() {
  return FRAME_OPAQUE_424D70_CALL_4248A0_VA >>> 0;
}
export function frameOpaque424d70CallSites() {
  return FRAME_OPAQUE_424D70_CALL_SITES >>> 0;
}
export function frameOpaque424d70EndVa() {
  return FRAME_OPAQUE_424D70_END_VA >>> 0;
}
export function frameOpaque424d70FieldCount() {
  return FRAME_OPAQUE_424D70_FIELD_COUNT >>> 0;
}
export function frameOpaque424d70HostVa() {
  return FRAME_OPAQUE_424D70_VA >>> 0;
}
export function frameOpaque424d70RetBytes() {
  return FRAME_OPAQUE_424D70_RET_BYTES >>> 0;
}
export function frameOpaque424e60CallSites() {
  return FRAME_OPAQUE_424E60_CALL_SITES >>> 0;
}
export function frameOpaque424e60Caller1Va() {
  return FRAME_OPAQUE_424E60_CALLER1_VA >>> 0;
}
export function frameOpaque424e60Caller2Va() {
  return FRAME_OPAQUE_424E60_CALLER2_VA >>> 0;
}
export function frameOpaque424e60EndVa() {
  return FRAME_OPAQUE_424E60_END_VA >>> 0;
}
export function frameOpaque424e60HostVa() {
  return FRAME_OPAQUE_424E60_VA >>> 0;
}
export function frameOpaque424e60RetBytes() {
  return FRAME_OPAQUE_424E60_RET_BYTES >>> 0;
}
export function frameOpaque424e80CookieVa() {
  return FRAME_OPAQUE_424E80_COOKIE_VA >>> 0;
}
export function frameOpaque424e80DtorCount() {
  return FRAME_OPAQUE_424E80_DTOR_COUNT >>> 0;
}
export function frameOpaque424e80EndVa() {
  return FRAME_OPAQUE_424E80_END_VA >>> 0;
}
export function frameOpaque424e80HostVa() {
  return FRAME_OPAQUE_424E80_VA >>> 0;
}
export function frameOpaque424e80SehHandlerVa() {
  return FRAME_OPAQUE_424E80_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque424ef0AttachCount() {
  return FRAME_OPAQUE_424EF0_ATTACH_COUNT >>> 0;
}
export function frameOpaque424ef0CallSites() {
  return FRAME_OPAQUE_424EF0_CALL_SITES >>> 0;
}
export function frameOpaque424ef0Caller1Va() {
  return FRAME_OPAQUE_424EF0_CALLER1_VA >>> 0;
}
export function frameOpaque424ef0Caller2Va() {
  return FRAME_OPAQUE_424EF0_CALLER2_VA >>> 0;
}
export function frameOpaque424ef0CookieVa() {
  return FRAME_OPAQUE_424EF0_COOKIE_VA >>> 0;
}
export function frameOpaque424ef0EndVa() {
  return FRAME_OPAQUE_424EF0_END_VA >>> 0;
}
export function frameOpaque424ef0HostVa() {
  return FRAME_OPAQUE_424EF0_VA >>> 0;
}
export function frameOpaque424ef0RetBytes() {
  return FRAME_OPAQUE_424EF0_RET_BYTES >>> 0;
}
export function frameOpaque424ef0SehHandlerVa() {
  return FRAME_OPAQUE_424EF0_SEH_HANDLER_VA >>> 0;
}
export function frameOpaque4253b0CharOff() {
  return FRAME_OPAQUE_4253B0_CHAR_OFF >>> 0;
}
export function frameOpaque4253b0EndVa() {
  return FRAME_OPAQUE_4253B0_END_VA >>> 0;
}
export function frameOpaque4253b0HostVa() {
  return FRAME_OPAQUE_4253B0_VA >>> 0;
}
export function frameOpaque4253c0EndVa() {
  return FRAME_OPAQUE_4253C0_END_VA >>> 0;
}
export function frameOpaque4253c0HostVa() {
  return FRAME_OPAQUE_4253C0_VA >>> 0;
}
export function frameOpaque4253c0ManagerAdd() {
  return FRAME_OPAQUE_4253C0_MANAGER_ADD >>> 0;
}
export function frameOpaque4253d0ElemIdOff() {
  return FRAME_OPAQUE_4253D0_ELEM_ID_OFF >>> 0;
}
export function frameOpaque4253d0EndVa() {
  return FRAME_OPAQUE_4253D0_END_VA >>> 0;
}
export function frameOpaque4253d0HostVa() {
  return FRAME_OPAQUE_4253D0_VA >>> 0;
}
export function frameOpaque4253d0KeyOff() {
  return FRAME_OPAQUE_4253D0_KEY_OFF >>> 0;
}
export function frameOpaque4253d0VecEndOff() {
  return FRAME_OPAQUE_4253D0_ID_VEC_END_OFF >>> 0;
}
export function frameOpaque4253d0VecOff() {
  return FRAME_OPAQUE_4253D0_ID_VEC_OFF >>> 0;
}
export function frameOpaque425430ArrayCount() {
  return FRAME_OPAQUE_425430_COUNT >>> 0;
}
export function frameOpaque425430ElemStride() {
  return FRAME_OPAQUE_425430_STRIDE >>> 0;
}
export function frameOpaque425430EndVa() {
  return FRAME_OPAQUE_425430_END_VA >>> 0;
}
export function frameOpaque425430HelperVa() {
  return FRAME_OPAQUE_425430_HELPER_VA >>> 0;
}
export function frameOpaque425430HostVa() {
  return FRAME_OPAQUE_425430_VA >>> 0;
}
export function frameOpaque425430InitCookie() {
  return FRAME_OPAQUE_425430_INIT_COOKIE >>> 0;
}
export function frameOpaque425430InitDestOff() {
  return FRAME_OPAQUE_425430_INIT_DEST_OFF >>> 0;
}
export function frameOpaque425430SubCallVa() {
  return FRAME_OPAQUE_425430_SUB_CALL_VA >>> 0;
}
export function frameOpaque425430ZeroByteOff() {
  return FRAME_OPAQUE_425430_ZERO_BYTE_OFF >>> 0;
}
export function frameOpaque4254b0EndVa() {
  return FRAME_OPAQUE_4254B0_END_VA >>> 0;
}
export function frameOpaque4254b0HostVa() {
  return FRAME_OPAQUE_4254B0_VA >>> 0;
}
export function frameOpaque499d60CallSites() {
  return FRAME_OPAQUE_499D60_CALL_SITES >>> 0;
}
export function frameOpaque499d60CrtVa() {
  return FRAME_OPAQUE_499D60_CRT_VA >>> 0;
}
export function frameOpaque499d60EndVa() {
  return FRAME_OPAQUE_499D60_END_VA >>> 0;
}
export function frameOpaque499d60HostVa() {
  return FRAME_OPAQUE_499D60_VA >>> 0;
}
export function frameOpaque499d60IatVa() {
  return FRAME_OPAQUE_499D60_IAT_VA >>> 0;
}

/* ---- v56 FUN_00424c40 pair-ctor seams (re-splice; cpp 7388+) ---- */
export function frameOpaque424c40ZeroedAt(off) {
  /* 7 FULL-DWORD zero stores: 0x10, 0x14, 0x18, 0x1c, 0x24, 0x20, 0x28. */
  switch (off >>> 0) {
    case 0x10: case 0x14: case 0x18: case 0x1c:
    case 0x24: case 0x20: case 0x28:
      return 1;
    default:
      return 0;
  }
}
export function frameOpaque424c40ZeroStoreIndex(off) {
  /* PE STORE ORDER: +0x10, +0x14, +0x18, +0x1c, +0x24, +0x20, +0x28
     (0x24 BEFORE 0x20); 0xff when no store. Byte-gated. */
  switch (off >>> 0) {
    case 0x10: return 0;
    case 0x14: return 1;
    case 0x18: return 2;
    case 0x1c: return 3;
    case 0x24: return 4; /* PE order: +0x24 comes BEFORE +0x20 */
    case 0x20: return 5;
    case 0x28: return 6;
    default:   return FRAME_OPAQUE_424C40_NO_STORE_BYTE;
  }
}
export function frameOpaque424c40ReturnThis(thisPtr) {
  /* mov eax,esi @0x424c88 — the FULL 32-bit this passthrough. */
  return thisPtr >>> 0;
}

/* ---- v57 FUN_00424cd0 release-chain gate + 424d70 float laws (re-splice; cpp 3792-4113) ---- */
export function frameOpaque424cd0ReleaseChainGate(objPresent, releaseResult, callbackPresent) {
  /* 3-branch lattice: callback fires iff obj != 0 AND release-result
     != 0 AND registry != 0. Byte-gated. */
  return (((objPresent >>> 0) !== 0 && (releaseResult >>> 0) !== 0 &&
    (callbackPresent >>> 0) !== 0) ? 1 : 0) & 0xff;
}
export function frameOpaque424d70NeedsUpdate(f10, f28, f14, f1, f18, f2, f1c, f3) {
  /* 4 ucomiss ordered-equality gates: update iff ANY pair
     ordered-not-equal; NaN never counts as NE. Bit-level. */
  return (frameOpaqueF32OrderedNe(f10 >>> 0, f28 >>> 0) ||
    frameOpaqueF32OrderedNe(f14 >>> 0, f1 >>> 0) ||
    frameOpaqueF32OrderedNe(f18 >>> 0, f2 >>> 0) ||
    frameOpaqueF32OrderedNe(f1c >>> 0, f3 >>> 0)) ? 1 : 0;
}
export function frameOpaque424d70DoubledArg(f28Bits) {
  /* cvttss2si (trunc; NaN/Inf/|v|>=2^31 -> 0x80000000) then
     add ax,ax: LOW 16 double with wrap, HIGH 16 unchanged. */
  const bits = f28Bits >>> 0;
  const sign = bits >>> 31;
  const exp = (bits >>> 23) & 0xff;
  const mant = bits & 0x7fffff;
  let v;
  if (exp === 0xff) {
    v = 0x80000000;
  } else if (exp === 0 && mant === 0) {
    v = 0;
  } else if (exp < 127) {
    v = 0;
  } else if (exp >= 158) {
    v = 0x80000000;
  } else {
    const full = (1 << 23) | mant;
    const shift = exp - 127;
    let iv = shift >= 23 ? full << (shift - 23) : full >> (23 - shift);
    if (sign !== 0) iv = -iv;
    v = iv >>> 0;
  }
  const low = ((v & 0xffff) << 1) & 0xffff;
  return ((v & 0xffff0000) | low) >>> 0;
}
export function frameOpaque424d70FieldStoreIndex(off) {
  /* PE STORE ORDER +0x14, +0x18, +0x10, +0x1c — 0x10 THIRD. */
  const i = FRAME_OPAQUE_424D70_FIELD_STORE_ORDER.indexOf(off >>> 0);
  return (i < 0 ? FRAME_OPAQUE_424D70_NO_STORE_BYTE : i) & 0xff;
}
export function frameOpaqueF32IsNaN(bits) {
  return (bits >>> 0 & 0x7fffffff) > 0x7f800000;
}
export function frameOpaqueF32OrderedNe(a, b) {
  if (frameOpaqueF32IsNaN(a) || frameOpaqueF32IsNaN(b)) return false;
  if (a === b) return false;
  if ((a === 0 && b === 0x80000000) || (a === 0x80000000 && b === 0)) {
    return false;
  }
  return true;
}

/* ---- v58 FUN_00424e60 / 424e80 / 424ef0 (my unit; ABI 58) ---- */
export function frameOpaque424e60ElementOff(index) {
  /* PE @0x424e66 mov eax,[ecx+eax*4+0x2bc] — scale + disp, wraps. */
  return (Math.imul(index | 0, FRAME_OPAQUE_424E60_ELEMENT_STRIDE) +
    FRAME_OPAQUE_424E60_ARRAY_BASE_OFF) >>> 0;
}
export function frameOpaque424e80DtorCalleeVa(index) {
  const vas = FRAME_OPAQUE_424E80_DTOR_CALLEE_VAS;
  const i = index >>> 0;
  return (i < vas.length ? vas[i] : 0) >>> 0;
}
export function frameOpaque424e80DtorReceiverOff(index) {
  const offs = FRAME_OPAQUE_424E80_DTOR_RECEIVER_OFFS;
  const i = index >>> 0;
  return (i < offs.length ? offs[i] : FRAME_OPAQUE_424E80_NO_DTOR_BYTE) & 0xff;
}
export function frameOpaque424e80DtorCallVa(index) {
  const vas = FRAME_OPAQUE_424E80_DTOR_CALL_VAS;
  const i = index >>> 0;
  return (i < vas.length ? vas[i] : 0) >>> 0;
}
export function frameOpaque424e80DtorIndex(off) {
  const i = FRAME_OPAQUE_424E80_DTOR_RECEIVER_OFFS.indexOf(off >>> 0);
  return (i < 0 ? FRAME_OPAQUE_424E80_NO_DTOR_BYTE : i) & 0xff;
}
export function frameOpaque424ef0AttachLoopContinue(iter) {
  /* SIGNED jl: continue iff (int32)iter < 12 (i64 sign-extend form). */
  return ((iter | 0) < FRAME_OPAQUE_424EF0_ATTACH_COUNT) ? 1 : 0;
}

/* ---- v44 4254b0 filter laws (re-splice; cpp 5580-5780) ---- */
export function frameOpaque4254b0PassAGate(mpBegin, mpEnd) {
  /* mov eax,[ecx]; cmp eax,[ecx+4]; je skip — POINTER-EQUALITY. */
  return (mpBegin >>> 0) !== (mpEnd >>> 0) ? 1 : 0;
}
export function frameOpaque4254b0RangeCount(begin, end) {
  const delta = ((end >>> 0) - (begin >>> 0)) >>> 0;
  const magic = FRAME_OPAQUE_4254B0_DIV_MAGIC | 0;
  const signedDelta = delta << 0 >> 0;
  const prod = BigInt(signedDelta) * BigInt(magic);
  let high = Number((prod >> 32n) & 0xffffffffn);
  high = high << 0 >> 0;
  high >>= FRAME_OPAQUE_4254B0_DIV_SHIFT;
  return ((high + ((high >>> 0) >>> 31)) >>> 0);
}
export function frameOpaque4254b0TrailingPopCount(startCount, gateFlags) {
  let c = startCount >>> 0;
  let j = 0;
  const flagsLen = gateFlags == null ? 0 : gateFlags.length;
  for (;;) {
    if (c <= (FRAME_OPAQUE_4254B0_TRAILING_MIN_COUNT >>> 0)) break;
    if (j >= flagsLen || (gateFlags[j] >>> 0) === 0) {
      c = (c - 1) >>> 0;
    }
    j = (j + 1) >>> 0;
    if (((startCount >>> 0) - 1 - j) >>> 0 >= c) break;
  }
  return c >>> 0;
}
export function frameOpaque4254b0Cvttss2si(bits) {
  const f = f32Bits(bits >>> 0);
  if (f !== f || f >= 2147483648.0 || f < -2147483648.0) return -2147483648;
  return Math.trunc(f) | 0;
}
export function frameOpaque4254b0RowSkip(kind) {
  return ((kind >>> 0) === (FRAME_OPAQUE_4254B0_ROW_SKIP_KIND >>> 0)) ? 1 : 0;
}
export function frameOpaque4254b0RowXmm1(b1) {
  return (((b1 >>> 0) & 0xff) === 0)
    ? (FRAME_OPAQUE_4254B0_XMM1_DEFAULT_BITS >>> 0)
    : 0;
}
function foF32Lt(aBits, bBits) {
  return f32Bits(aBits >>> 0) < f32Bits(bBits >>> 0);
}
function foF32Gt(aBits, bBits) {
  return f32Bits(aBits >>> 0) > f32Bits(bBits >>> 0);
}
function foF32Unordered(aBits, bBits) {
  const a = f32Bits(aBits >>> 0); const b = f32Bits(bBits >>> 0);
  return (a !== a || b !== b);
}
export function frameOpaque4254b0ElemFilter(b0, b1, fRowBits, dRow, fElemBits, prevFBits) {
  /* 0=REJECT, 1=NO_COPY, 2=COPY, 3=COPY_RESET (F0-filter lattice). */
  const b0b = (b0 >>> 0) & 0xff;
  const b1b = (b1 >>> 0) & 0xff;
  const trunc = frameOpaque4254b0Cvttss2si(fElemBits >>> 0);
  const fRow = fRowBits >>> 0;
  const prevF = prevFBits >>> 0;
  const fEl = fElemBits >>> 0;
  let reset = 0;
  const REJECT = FRAME_OPAQUE_4254B0_FILTER_REJECT >>> 0;
  const NO_COPY = FRAME_OPAQUE_4254B0_FILTER_NO_COPY >>> 0;
  const COPY = FRAME_OPAQUE_4254B0_FILTER_COPY >>> 0;
  const COPY_RESET = FRAME_OPAQUE_4254B0_FILTER_COPY_RESET >>> 0;
  if (b1b !== 0) {
    if (foF32Lt(fEl, fRow)) return REJECT;
    if (foF32Lt(fEl, prevF)) return REJECT;
    if (trunc < (dRow | 0)) return REJECT;
    if (foF32Gt(fEl, prevF)) reset = 1;
    else if (!foF32Unordered(fEl, prevF)) {
      if (b0b === 0) reset = 1;
    }
    if (foF32Unordered(fEl, prevF)) {
      return reset ? COPY_RESET : COPY;
    }
    if (b0b === 0) return NO_COPY;
    return reset ? COPY_RESET : COPY;
  }
  if (foF32Lt(fRow, fEl)) return REJECT;
  if (foF32Lt(prevF, fEl)) return REJECT;
  if (trunc < (dRow | 0)) return REJECT;
  if (foF32Gt(prevF, fEl)) reset = 1;
  else if (!foF32Unordered(fEl, prevF)) {
    if (b0b === 0) reset = 1;
  }
  if (foF32Unordered(fEl, prevF)) {
    return reset ? COPY_RESET : COPY;
  }
  if (b0b === 0) return NO_COPY;
  return reset ? COPY_RESET : COPY;
}
export function frameOpaque4254b0FlushCount(cursor, outList) {
  return (((cursor >>> 0) - (outList >>> 0)) | 0) >> 3;
}

/* ---- model-only consts the re-spliced laws need ---- */
export const FRAME_OPAQUE_424D70_FIELD_STORE_ORDER = [0x14, 0x18, 0x10, 0x1c];
export const FRAME_OPAQUE_424E60_ARRAY_BASE_OFF = 0x2bc;
export const FRAME_OPAQUE_424E60_ELEMENT_STRIDE = 4;
export const FRAME_OPAQUE_424E80_DTOR_CALLEE_VAS = [0x00407f10, 0x004087a0, 0x004087a0, 0x0040d040, 0x0040d040];
export const FRAME_OPAQUE_424E80_DTOR_RECEIVER_OFFS = [4, 0x54, 0x34, 0x1c, 4];
export const FRAME_OPAQUE_424E80_DTOR_CALL_VAS = [0x00424eb0, 0x00424eb8, 0x00424ec0, 0x00424ec8, 0x00424ecf];
export const FRAME_OPAQUE_424E80_NO_DTOR_BYTE = 0xff;
/* ---- v33-v58 getter re-splice pass 2 (commented getters; from intact cpp) ---- */
export const FRAME_OPAQUE_4215A0_COPY_SSO_HI = 0x10;
export const FRAME_OPAQUE_4215A0_COPY_SSO_LO = 0x08;
export const FRAME_OPAQUE_4215E0_COPY_SSO_HI = 0x10;
export const FRAME_OPAQUE_4215E0_COPY_SSO_LO = 0x08;
export const FRAME_OPAQUE_423990_INIT_ARG = 0;
export const FRAME_OPAQUE_423AA0_ALLOC_ARG = 0x20;
export const FRAME_OPAQUE_423AA0_ITERATIONS = 2;
export const FRAME_OPAQUE_423AA0_LOCAL_CAP = 0x1f;
export const FRAME_OPAQUE_423AA0_LOCAL_SIZE = 0x1e;
export const FRAME_OPAQUE_423AA0_PUSH_ARG = 1;
export const FRAME_OPAQUE_423AA0_STRIDE = 0x130;
export const FRAME_OPAQUE_424310_CAPACITY_INIT = 0xf;
export const FRAME_OPAQUE_424310_NODE_MAGIC = 0x101;
export const FRAME_OPAQUE_424440_BYTE_ONE_VALUE = 1;
export const FRAME_OPAQUE_424440_ERASE_ARG_OFF = 4;
export const FRAME_OPAQUE_424440_ERASE_HOST_VA = 0x00424540;
export const FRAME_OPAQUE_424440_MINUS_ONE_VALUE = 0xffffffff;
export const FRAME_OPAQUE_424440_NODE_OFF = 0x18;
export const FRAME_OPAQUE_424C40_PAIR0_OFF = 0;
export const FRAME_OPAQUE_424C40_PAIR1_OFF = 8;
export const FRAME_OPAQUE_424C40_PAIR_ARG = 0;
export const FRAME_OPAQUE_424C40_PAIR_HOST_VA = 0x0040c4a0;
export const FRAME_OPAQUE_424CD0_PAIR0_OFF = 0;
export const FRAME_OPAQUE_424CD0_PAIR1_OFF = 8;
export const FRAME_OPAQUE_424CD0_PAIR_ARG = 0;
export const FRAME_OPAQUE_424CD0_PAIR_HOST_VA = 0x0040c7f0;
export const FRAME_OPAQUE_424CD0_RELEASE_CALLBACK_VA = 0x00c7163c;
export const FRAME_OPAQUE_424CD0_RELEASE_CHAIN_COUNT = 2;
export const FRAME_OPAQUE_424CD0_RELEASE_RECEIVER_OFF = 4;
export const FRAME_OPAQUE_424CD0_RELEASE_VTBL_SLOT_OFF = 0xc;
export const FRAME_OPAQUE_424D70_CALL_4248A0_FLOAT_ARGS = 3;
export const FRAME_OPAQUE_424D70_CALL_4248A0_INT_DUP_VA = 0x00424dde;
export const FRAME_OPAQUE_424D70_CALL_4248A0_RECEIVER_OFF = 8;
export const FRAME_OPAQUE_424D70_CVTT_VA = 0x00424dc8;
export const FRAME_OPAQUE_424D70_HOST_4248A0_VA = 0x004248a0;
export const FRAME_OPAQUE_424D70_VIRTUAL_CALL_VA = 0x00424e4f;
export const FRAME_OPAQUE_424D70_VIRTUAL_RECEIVER_OFF = 8;
export const FRAME_OPAQUE_424D70_VIRTUAL_VTBL_SLOT_OFF = 0x20;
export const FRAME_OPAQUE_424E80_CALL_SITES = 0;
export const FRAME_OPAQUE_424E80_HOST_407F10_VA = 0x00407f10;
export const FRAME_OPAQUE_424E80_HOST_4087A0_VA = 0x004087a0;
export const FRAME_OPAQUE_424E80_HOST_40D040_VA = 0x0040d040;
export const FRAME_OPAQUE_424EF0_ATTACH_CALL_VA = 0x00425042;
export const FRAME_OPAQUE_424EF0_ATTACH_LOOP_CONTINUE_VA = 0x00425086;
export function frameOpaque4215a0CopySsoHi() {
  return FRAME_OPAQUE_4215A0_COPY_SSO_HI >>> 0;
}
export function frameOpaque4215a0CopySsoLo() {
  return FRAME_OPAQUE_4215A0_COPY_SSO_LO >>> 0;
}
export function frameOpaque4215a0StealResetSize() {
  return 0;
}
export function frameOpaque4215e0CopySsoLo() {
  return FRAME_OPAQUE_4215E0_COPY_SSO_LO >>> 0;
}
export function frameOpaque4215e0StealResetSize() {
  return 0;
}

export function frameOpaque423aa0AllocArg() {
  return FRAME_OPAQUE_423AA0_ALLOC_ARG >>> 0;
}
export function frameOpaque423aa0LocalCap() {
  return FRAME_OPAQUE_423AA0_LOCAL_CAP >>> 0;
}
export function frameOpaque423aa0LocalSize() {
  return FRAME_OPAQUE_423AA0_LOCAL_SIZE >>> 0;
}
export function frameOpaque423aa0PushArg() {
  return FRAME_OPAQUE_423AA0_PUSH_ARG >>> 0;
}
export function frameOpaque423aa0Stride() {
  return FRAME_OPAQUE_423AA0_STRIDE >>> 0;
}
export function frameOpaque424310CapacityInit() {
  return FRAME_OPAQUE_424310_CAPACITY_INIT >>> 0;
}
export function frameOpaque424310NodeWordMagic() {
  return FRAME_OPAQUE_424310_NODE_MAGIC >>> 0;
}
export function frameOpaque424440ByteOneValue() {
  return FRAME_OPAQUE_424440_BYTE_ONE_VALUE >>> 0;
}
export function frameOpaque424440EraseArgOff() {
  return FRAME_OPAQUE_424440_ERASE_ARG_OFF >>> 0;
}
export function frameOpaque424440EraseHostVa() {
  return FRAME_OPAQUE_424440_ERASE_HOST_VA >>> 0;
}
export function frameOpaque424440MinusOneValue() {
  return FRAME_OPAQUE_424440_MINUS_ONE_VALUE >>> 0;
}
export function frameOpaque424440NodeOff() {
  return FRAME_OPAQUE_424440_NODE_OFF >>> 0;
}
export function frameOpaque424c40Pair0Off() {
  return FRAME_OPAQUE_424C40_PAIR0_OFF >>> 0;
}
export function frameOpaque424c40Pair1Off() {
  return FRAME_OPAQUE_424C40_PAIR1_OFF >>> 0;
}
export function frameOpaque424c40PairArg() {
  return FRAME_OPAQUE_424C40_PAIR_ARG >>> 0;
}
export function frameOpaque424c40PairHostVa() {
  return FRAME_OPAQUE_424C40_PAIR_HOST_VA >>> 0;
}
export function frameOpaque424cd0Pair0Off() {
  return FRAME_OPAQUE_424CD0_PAIR0_OFF >>> 0;
}
export function frameOpaque424cd0Pair1Off() {
  return FRAME_OPAQUE_424CD0_PAIR1_OFF >>> 0;
}
export function frameOpaque424cd0PairArg() {
  return FRAME_OPAQUE_424CD0_PAIR_ARG >>> 0;
}
export function frameOpaque424cd0ReleaseCallbackVa() {
  return FRAME_OPAQUE_424CD0_RELEASE_CALLBACK_VA >>> 0;
}
export function frameOpaque424cd0ReleaseChainCount() {
  return FRAME_OPAQUE_424CD0_RELEASE_CHAIN_COUNT >>> 0;
}
export function frameOpaque424cd0ReleaseReceiverOff() {
  return FRAME_OPAQUE_424CD0_RELEASE_RECEIVER_OFF >>> 0;
}
export function frameOpaque424cd0ReleaseVtblSlotOff() {
  return FRAME_OPAQUE_424CD0_RELEASE_VTBL_SLOT_OFF >>> 0;
}
export function frameOpaque424d70Call4248a0FloatArgs() {
  return FRAME_OPAQUE_424D70_CALL_4248A0_FLOAT_ARGS >>> 0;
}
export function frameOpaque424d70Call4248a0IntDupVa() {
  return FRAME_OPAQUE_424D70_CALL_4248A0_INT_DUP_VA >>> 0;
}
export function frameOpaque424d70Call4248a0ReceiverOff() {
  return FRAME_OPAQUE_424D70_CALL_4248A0_RECEIVER_OFF >>> 0;
}
export function frameOpaque424d70CvttVa() {
  return FRAME_OPAQUE_424D70_CVTT_VA >>> 0;
}
export function frameOpaque424d70Host4248a0Va() {
  return FRAME_OPAQUE_424D70_HOST_4248A0_VA >>> 0;
}
export function frameOpaque424d70VirtualCallVa() {
  return FRAME_OPAQUE_424D70_VIRTUAL_CALL_VA >>> 0;
}
export function frameOpaque424d70VirtualReceiverOff() {
  return FRAME_OPAQUE_424D70_VIRTUAL_RECEIVER_OFF >>> 0;
}
export function frameOpaque424d70VirtualVtblSlotOff() {
  return FRAME_OPAQUE_424D70_VIRTUAL_VTBL_SLOT_OFF >>> 0;
}
export function frameOpaque424e60ArrayBaseOff() {
  return FRAME_OPAQUE_424E60_ARRAY_BASE_OFF >>> 0;
}
export function frameOpaque424e60ElementStride() {
  return FRAME_OPAQUE_424E60_ELEMENT_STRIDE >>> 0;
}
export function frameOpaque424e80CallSites() {
  return FRAME_OPAQUE_424E80_CALL_SITES >>> 0;
}
export function frameOpaque424e80Host407f10Va() {
  return FRAME_OPAQUE_424E80_HOST_407F10_VA >>> 0;
}
export function frameOpaque424e80Host4087a0Va() {
  return FRAME_OPAQUE_424E80_HOST_4087A0_VA >>> 0;
}
export function frameOpaque424e80Host40d040Va() {
  return FRAME_OPAQUE_424E80_HOST_40D040_VA >>> 0;
}
export function frameOpaque424ef0AttachCallVa() {
  return FRAME_OPAQUE_424EF0_ATTACH_CALL_VA >>> 0;
}
export function frameOpaque424ef0AttachLoopContinueVa() {
  return FRAME_OPAQUE_424EF0_ATTACH_LOOP_CONTINUE_VA >>> 0;
}
/* ---- v33-v58 const fill pass 3 (direct header-backed) ---- */
export const FRAME_OPAQUE_421400_DIV_A_BITS = 0x43f00000;
export const FRAME_OPAQUE_421400_DIV_B_BITS = 0x43870000;
export const FRAME_OPAQUE_421400_END_VA = 0x004214a0;
export const FRAME_OPAQUE_421400_GUARD_VA = 0x00c33910;
export const FRAME_OPAQUE_421400_RENDER_ARG_VA = 0x00c7b640;
export const FRAME_OPAQUE_421400_VA = 0x00421400;
export const FRAME_OPAQUE_4214B0_ANIM_OFF = 0x08;
export const FRAME_OPAQUE_421620_MAX_CAP = 0x7fffffff;
export const FRAME_OPAQUE_421620_MIN_GROW = 0x16;
export const FRAME_OPAQUE_421620_SSO_CAP = 0x10;
export const FRAME_OPAQUE_421800_CALL_SITES = 47;
export const FRAME_OPAQUE_4218E0_SHIFT_1 = 3;
export const FRAME_OPAQUE_4218E0_SHIFT_2 = 13;
export const FRAME_OPAQUE_4218E0_SHIFT_3 = 7;
export const FRAME_OPAQUE_423950_CALL_SITES = 3;
export const FRAME_OPAQUE_423960_CALL_SITES = 3;
export const FRAME_OPAQUE_423970_CALL_SITES = 2;
export const FRAME_OPAQUE_423990_CALLER1_VA = 0x00952783;
export const FRAME_OPAQUE_423990_CALL_SITES = 1;
export const FRAME_OPAQUE_4239B0_BLOCK_DELTA = 0x130;
export const FRAME_OPAQUE_4239B0_BYTE_ONE = 1;
export const FRAME_OPAQUE_4239B0_CALLER1_VA = 0x004239a3;
export const FRAME_OPAQUE_4239B0_CALLER2_VA = 0x008ca647;
export const FRAME_OPAQUE_4239B0_CALLER3_VA = 0x0095e8b9;
export const FRAME_OPAQUE_4239B0_CALLER4_VA = 0x00987502;
export const FRAME_OPAQUE_4239B0_CALLER5_VA = 0x0099981e;
export const FRAME_OPAQUE_4239B0_CALL_SITES = 5;
export const FRAME_OPAQUE_4239B0_CLEAR_DEFAULT = 0x42c00000;
export const FRAME_OPAQUE_4239B0_COUNT_14 = 0x0e;
export const FRAME_OPAQUE_4239B0_COUNT_15 = 0x0f;
export const FRAME_OPAQUE_4239B0_DEFAULT_96_BITS = 0x42c00000;
export const FRAME_OPAQUE_4239B0_F32_0_BITS = 0x3760371c;
export const FRAME_OPAQUE_4239B0_F32_0_VA = 0x00c7b640;
export const FRAME_OPAQUE_4239B0_F32_1_BITS = 0x37873770;
export const FRAME_OPAQUE_4239B0_F32_1_VA = 0x00c7b644;
export const FRAME_OPAQUE_4239B0_OFF_114 = 0x114;
export const FRAME_OPAQUE_4239B0_OFF_118 = 0x118;
export const FRAME_OPAQUE_4239B0_OFF_11C = 0x11c;
export const FRAME_OPAQUE_4239B0_OFF_120 = 0x120;
export const FRAME_OPAQUE_4239B0_OFF_124 = 0x124;
export const FRAME_OPAQUE_4239B0_OFF_128 = 0x128;
export const FRAME_OPAQUE_4239B0_OFF_12C = 0x12c;
export const FRAME_OPAQUE_4239B0_OFF_244 = 0x244;
export const FRAME_OPAQUE_4239B0_OFF_248 = 0x248;
export const FRAME_OPAQUE_4239B0_OFF_24C = 0x24c;
export const FRAME_OPAQUE_4239B0_OFF_250 = 0x250;
export const FRAME_OPAQUE_4239B0_OFF_254 = 0x254;
export const FRAME_OPAQUE_4239B0_OFF_258 = 0x258;
export const FRAME_OPAQUE_4239B0_OFF_25C = 0x25c;
export const FRAME_OPAQUE_4239B0_OFF_260 = 0x260;
export const FRAME_OPAQUE_4239B0_OFF_264 = 0x264;
export const FRAME_OPAQUE_4239B0_OFF_268 = 0x268;
export const FRAME_OPAQUE_4239B0_OFF_COUNT = 17;
export const FRAME_OPAQUE_4239B0_ONE_BITS = 0x3f800000;
export const FRAME_OPAQUE_423AA0_BIG_THRESHOLD = 0x1000;
export const FRAME_OPAQUE_423AA0_CALLER1_VA = 0x0042399a;
export const FRAME_OPAQUE_423AA0_CALLER2_VA = 0x00954739;
export const FRAME_OPAQUE_423AA0_CALL_SITES = 2;
export const FRAME_OPAQUE_423AA0_DELTA_MAX = 0x1f;
export const FRAME_OPAQUE_423AA0_FREE_MIN_CAP = 0x10;
export const FRAME_OPAQUE_423AA0_GS_COOKIE = 0xaf18ad;
export const FRAME_OPAQUE_423AA0_GS_COOKIE_GLOBAL_VA = 0x00bf93b4;
export const FRAME_OPAQUE_423AA0_HEADER_BIAS = 0x23;
export const FRAME_OPAQUE_423AA0_HOST_AFTER_VA = 0x0040a1b0;
export const FRAME_OPAQUE_423AA0_HOST_ALLOC_VA = 0x0040cf00;
export const FRAME_OPAQUE_423AA0_HOST_ASSIGN_VA = 0x0040bd50;
export const FRAME_OPAQUE_423AA0_HOST_FREE_VA = 0x00aef15c;
export const FRAME_OPAQUE_423AA0_HOST_GS_VA = 0x00aef12b;
export const FRAME_OPAQUE_423AA0_HOST_INSERT_VA = 0x0040a5d0;
export const FRAME_OPAQUE_423AA0_HOST_INVALID_PARAM_VA = 0x00b18894;
export const FRAME_OPAQUE_423AA0_LEFT_AFTER_OFF = 0x30;
export const FRAME_OPAQUE_423AA0_LEFT_FLAG_OFF = 0x44;
export const FRAME_OPAQUE_423AA0_LEFT_POOL_VA = 0x00b1c230;
export const FRAME_OPAQUE_423AA0_LEFT_STR_OFF = 0x34;
export const FRAME_OPAQUE_423AA0_LOCAL_POOL_VA = 0x00b1c210;
export const FRAME_OPAQUE_423AA0_RIGHT_AFTER_OFF = 0x160;
export const FRAME_OPAQUE_423AA0_RIGHT_FLAG_OFF = 0x174;
export const FRAME_OPAQUE_423AA0_RIGHT_POOL_VA = 0x00b1c23c;
export const FRAME_OPAQUE_423AA0_RIGHT_RECV_OFF = 0x130;
export const FRAME_OPAQUE_423AA0_RIGHT_STR_OFF = 0x164;
export const FRAME_OPAQUE_423AA0_SSO_HEAP = 0;
export const FRAME_OPAQUE_423AA0_SSO_INLINE = 1;
export const FRAME_OPAQUE_423AA0_STR_BYTE_OFF = 0x34;
export const FRAME_OPAQUE_423AA0_STR_CAP_OFF = 0x14;
export const FRAME_OPAQUE_424220_CALLER1_VA = 0x00423d03;
export const FRAME_OPAQUE_424220_CALLER2_VA = 0x00954f9e;
export const FRAME_OPAQUE_424220_CALL_SITES = 2;
export const FRAME_OPAQUE_424220_DELTA_HI_OFF = 0x1baac;
export const FRAME_OPAQUE_424220_DELTA_LO_OFF = 0x1baa8;
export const FRAME_OPAQUE_424220_DELTA_MASK = 0xfffffffc;
export const FRAME_OPAQUE_424220_DISPATCH_CASE_A = 0;
export const FRAME_OPAQUE_424220_DISPATCH_CASE_B = 1;
export const FRAME_OPAQUE_424220_DISPATCH_DEFAULT = 2;
export const FRAME_OPAQUE_424220_MODE_OFF = 8;
export const FRAME_OPAQUE_424220_MP_VEC_END_OFF = 0x4b3dc;
export const FRAME_OPAQUE_424220_MP_VEC_OFF = 0x4b3d8;
export const FRAME_OPAQUE_424220_NET_GLOBAL_VA = 0x00c71678;
export const FRAME_OPAQUE_424220_OBJ_GLOBAL_VA = 0x00c7169c;
export const FRAME_OPAQUE_424220_RESULT_ID_OFF = 0x1618;
export const FRAME_OPAQUE_424220_RTTI_ENTRY_OFF = 0xc;
export const FRAME_OPAQUE_424220_RTTI_OFF = 0x378;
export const FRAME_OPAQUE_424220_TABLE_VA = 0x0042429c;
export const FRAME_OPAQUE_4242B0_CALLER1_VA = 0x0068b361;
export const FRAME_OPAQUE_4242B0_CALLER2_VA = 0x00691fc9;
export const FRAME_OPAQUE_4242B0_CALLER3_VA = 0x00692059;
export const FRAME_OPAQUE_4242B0_CALLER4_VA = 0x0069211d;
export const FRAME_OPAQUE_4242B0_CALLER5_VA = 0x00783285;
export const FRAME_OPAQUE_4242B0_CALLER6_VA = 0x00783359;
export const FRAME_OPAQUE_4242B0_CALLER7_VA = 0x008d2263;
export const FRAME_OPAQUE_4242B0_CALLER8_VA = 0x00989b52;
export const FRAME_OPAQUE_4242B0_SUB_OFF = 4;
export const FRAME_OPAQUE_4242B0_VTBL_CALL_OFF = 0xc;
export const FRAME_OPAQUE_424310_CALLER1_VA = 0x006f1ba6;
export const FRAME_OPAQUE_424310_CALLER2_VA = 0x00857000;
export const FRAME_OPAQUE_424310_CALLER3_VA = 0x00950d7a;
export const FRAME_OPAQUE_424310_CALLER4_VA = 0x00956b44;
export const FRAME_OPAQUE_424310_CALLER5_VA = 0x00956c36;
export const FRAME_OPAQUE_424310_CALLER6_VA = 0x0095c4f3;
export const FRAME_OPAQUE_424310_CALLER7_VA = 0x0095c5d7;
export const FRAME_OPAQUE_424310_CAPACITY_OFF = 0x14;
export const FRAME_OPAQUE_424310_NODE_OFF = 0x18;
export const FRAME_OPAQUE_424310_NODE_SELF_LINK_COUNT = 3;
export const FRAME_OPAQUE_424310_NODE_SIZE = 0x14;
export const FRAME_OPAQUE_424310_NODE_WORD_OFF = 0xc;
export const FRAME_OPAQUE_424440_CALLER10_VA = 0x00950d9a;
export const FRAME_OPAQUE_424440_CALLER11_VA = 0x00958b66;
export const FRAME_OPAQUE_424440_CALLER12_VA = 0x00981284;
export const FRAME_OPAQUE_424440_CALLER13_VA = 0x009812d4;
export const FRAME_OPAQUE_424440_CALLER14_VA = 0x009ab185;
export const FRAME_OPAQUE_424440_CALLER1_VA = 0x00424404;
export const FRAME_OPAQUE_424440_CALLER2_VA = 0x00426a83;
export const FRAME_OPAQUE_424440_CALLER3_VA = 0x006f1bc6;
export const FRAME_OPAQUE_424440_CALLER4_VA = 0x006f446f;
export const FRAME_OPAQUE_424440_CALLER5_VA = 0x00857020;
export const FRAME_OPAQUE_424440_CALLER6_VA = 0x008e547c;
export const FRAME_OPAQUE_424440_CALLER7_VA = 0x008e56e2;
export const FRAME_OPAQUE_424440_CALLER8_VA = 0x008e5752;
export const FRAME_OPAQUE_424440_CALLER9_VA = 0x008eba12;
export const FRAME_OPAQUE_424440_COPY_DST0_OFF = 0x24;
export const FRAME_OPAQUE_424440_COPY_DST1_OFF = 0x30;
export const FRAME_OPAQUE_424440_COPY_DST2_OFF = 0x9c;
export const FRAME_OPAQUE_424440_COPY_SRC0_OFF = 0x20;
export const FRAME_OPAQUE_424440_COPY_SRC1_OFF = 0x2c;
export const FRAME_OPAQUE_424440_COPY_SRC2_OFF = 0x98;
export const FRAME_OPAQUE_424530_CALL_SITES = 184;
export const FRAME_OPAQUE_424580_BYTE_SCALE_BITS = 0x437f0000;
export const FRAME_OPAQUE_424580_CELL_WRITE_OFF = 4;
export const FRAME_OPAQUE_424580_CHANNEL_COUNT = 4;
export const FRAME_OPAQUE_424580_DEG_ADD_BITS = 0x43b40000;
export const FRAME_OPAQUE_424580_DEG_RAD_BITS = 0x42652ee0;
export const FRAME_OPAQUE_4248A0_HALF_BITS = 0x3f000000;
export const FRAME_OPAQUE_4248A0_HALF_MASK = 0xffff;
export const FRAME_OPAQUE_4248A0_ONE_BITS = 0x3f800000;
export const FRAME_OPAQUE_4248A0_Q025_BITS = 0x3e800000;
export const FRAME_OPAQUE_4248A0_ZERO_BITS = 0x00000000;
export const FRAME_OPAQUE_424C40_CALLER1_VA = 0x006f190b;
export const FRAME_OPAQUE_424C40_CALLER2_VA = 0x006f191a;
export const FRAME_OPAQUE_424C40_CALLER3_VA = 0x006f2358;
export const FRAME_OPAQUE_424C40_NO_STORE_BYTE = 0xff;
export const FRAME_OPAQUE_424CD0_CALLER1_VA = 0x006f355a;
export const FRAME_OPAQUE_424CD0_CALLER2_VA = 0x006f3565;
export const FRAME_OPAQUE_424CD0_CALLER3_VA = 0x0083c535;
export const FRAME_OPAQUE_424CD0_CALLER4_VA = 0x008d1d38;
export const FRAME_OPAQUE_424CD0_CALLER5_VA = 0x008d1d43;
export const FRAME_OPAQUE_424D70_CALLER1_VA = 0x008d24e9;
export const FRAME_OPAQUE_424D70_CALLER2_VA = 0x008d2541;
export const FRAME_OPAQUE_424D70_CALLER3_VA = 0x008d26ab;
export const FRAME_OPAQUE_424D70_NO_STORE_BYTE = 0xff;
export const FRAME_OPAQUE_4253B0_CALL_SITES = 14;
export const FRAME_OPAQUE_4253C0_CALL_SITES = 1;
export const FRAME_OPAQUE_4253D0_CALL_SITES = 24;
export const FRAME_OPAQUE_425430_CALLER_VA = 0x006f365d;
export const FRAME_OPAQUE_425430_CALL_SITES = 1;
export const FRAME_OPAQUE_425430_COPY_SHIFT = 4;
export const FRAME_OPAQUE_4254B0_CALLER1_VA = 0x0090cffc;
export const FRAME_OPAQUE_4254B0_CALLER2_VA = 0x008ca67c;
export const FRAME_OPAQUE_4254B0_CALL_SITES = 2;
export const FRAME_OPAQUE_4254B0_DIV_MAGIC = 0x4ec4ec4f;
export const FRAME_OPAQUE_4254B0_DIV_SHIFT = 5;
export const FRAME_OPAQUE_4254B0_ELEM_FLOAT_OFF = 0xc;
export const FRAME_OPAQUE_4254B0_ELEM_PAIR_HI_OFF = 0x4;
export const FRAME_OPAQUE_4254B0_ELEM_PAIR_OFF = 0x0;
export const FRAME_OPAQUE_4254B0_ELEM_STRIDE = 0x68;
export const FRAME_OPAQUE_4254B0_FILTER_COPY = 2;
export const FRAME_OPAQUE_4254B0_FILTER_COPY_RESET = 3;
export const FRAME_OPAQUE_4254B0_FILTER_NO_COPY = 1;
export const FRAME_OPAQUE_4254B0_FILTER_REJECT = 0;
export const FRAME_OPAQUE_4254B0_FINAL_BYTE_OFF = 0x450;
export const FRAME_OPAQUE_4254B0_FINAL_BYTE_VALUE = 1;
export const FRAME_OPAQUE_4254B0_GATE_VA = 0x0090abf0;
export const FRAME_OPAQUE_4254B0_HOST_4267F0_VA = 0x004267f0;
export const FRAME_OPAQUE_4254B0_HOST_AEF15C_VA = 0x00aef15c;
export const FRAME_OPAQUE_4254B0_HOST_AF08BD_VA = 0x00af08bd;
export const FRAME_OPAQUE_4254B0_MANAGER_SLOT_VA = 0x00c7169c;
export const FRAME_OPAQUE_4254B0_MP_VEC_END_OFF = 0x4b3dc;
export const FRAME_OPAQUE_4254B0_MP_VEC_OFF = 0x4b3d8;
export const FRAME_OPAQUE_4254B0_ROW_B0_OFF = 0x0;
export const FRAME_OPAQUE_4254B0_ROW_B1_OFF = 0x1;
export const FRAME_OPAQUE_4254B0_ROW_BASE_OFF = 0x28;
export const FRAME_OPAQUE_4254B0_ROW_COUNT = 0x15;
export const FRAME_OPAQUE_4254B0_ROW_DWORD_OFF = 0x8;
export const FRAME_OPAQUE_4254B0_ROW_FLOAT_OFF = 0x4;
export const FRAME_OPAQUE_4254B0_ROW_SKIP_KIND = 0x16;
export const FRAME_OPAQUE_4254B0_ROW_STRIDE = 0x34;
export const FRAME_OPAQUE_4254B0_ROW_VEC_OFF = 0xc;
export const FRAME_OPAQUE_4254B0_TRAILING_MIN_COUNT = 4;
export const FRAME_OPAQUE_4254B0_XMM1_DEFAULT_BITS = 0x4f000000;
export const FRAME_OPAQUE_4254B0_XMM1_DEFAULT_VA = 0x00baacbc;
export const FRAME_OPAQUE_HOST_40A030_VA = 0x0040a030;
export const FRAME_OPAQUE_SHUFFLE_MAGIC = 0x66666667;

/* ---- v34 FUN_004214b0 set-overlay-by-mode laws (re-splice) ---- */
export function frameOpaque4214b0ModeAllowed(mode) {
  /* cmp esi,4; ja epilogue — UNSIGNED gate: 0..4 allowed. */
  return (mode >>> 0) <= (FRAME_OPAQUE_4214B0_MAX_MODE >>> 0) ? 1 : 0;
}
export function frameOpaque4214b0RecordOff(mode) {
  /* lea eax,[esi*8]; sub eax,esi; lea [ecx+eax*8] = mode*0x38 wrap. */
  return (Math.imul(mode | 0, FRAME_OPAQUE_4214B0_RECORD_STRIDE)) >>> 0;
}
export function frameOpaque4214b0Mode2or3(mode) {
  return ((mode | 0) === 2 || (mode | 0) === 3) ? 1 : 0;
}
export function frameOpaque4214b0CmpNeeded(animDataPtr) {
  /* cmp dword [edi+0x34],0 / je — FULL dword gate. */
  return (animDataPtr >>> 0) !== 0 ? 1 : 0;
}
export function frameOpaque4214b0HaveEq(cmpResult) {
  /* xor -> 0 equal; sbb/or nonzero mismatch. */
  return ((cmpResult | 0) === 0) ? 1 : 0;
}
export function frameOpaque4214b0SkipSetoverlayNeeded(haveEq, keyFlag, playingFlag) {
  if ((haveEq | 0) === 0) return 0;
  if (((keyFlag >>> 0) & 0xff) !== 0) return 0;
  if (((playingFlag >>> 0) & 0xff) !== 0) return 0;
  return 1;
}
export function frameOpaque4214b0SetoverlayRan(al) {
  /* test al,al / je — LOW-BYTE. */
  return ((al >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque4214b0LayerFlagsAfter(flags) {
  /* or [*+0x8c],0x20 — OR store. */
  return (flags >>> 0 | FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR) >>> 0;
}
export function frameOpaque4214b0SsoInlineNeeded(cap) {
  /* cmp [ebx+0x14c],0x10 / jb — STRICT: 0x10 is heap. */
  return (cap >>> 0) < (FRAME_OPAQUE_4214B0_SSO_CAP >>> 0) ? 1 : 0;
}

/* ---- v35 FUN_004215a0 move-assign laws ---- */
export function frameOpaque4215a0SelfAlias(thisPtr, srcPtr) {
  /* cmp esi,edi / je no-op — FULL dword equality. */
  return (thisPtr >>> 0) === (srcPtr >>> 0) ? 1 : 0;
}
export function frameOpaque4215a0DtorNeeded(alias) {
  return ((alias | 0) === 0) ? 1 : 0;
}
export function frameOpaque4215a0StealResetCap(srcCap) {
  /* mov dword [src+0x14],0xf — CONSTANT, never src_cap. */
  void srcCap;
  return FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY >>> 0;
}
export function frameOpaque4215a0StealResetDataByte() {
  return 0;
}

/* ---- v36 FUN_004215e0 copy-assign laws ---- */
export function frameOpaque4215e0CopySsoHi() {
  return FRAME_OPAQUE_4215E0_COPY_SSO_HI >>> 0;
}
export function frameOpaque4215e0StealResetCap(srcCap) {
  void srcCap;
  return FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY >>> 0;
}
export function frameOpaque4215e0StealResetDataByte() {
  return 0;
}
export function frameOpaque4215e0HasGuard() {
  /* NO self-alias je in this body — the defining law vs v35. */
  return 0;
}

/* ---- v37 FUN_00421620 assign + grow-core laws ---- */
export function frameOpaque421620MaxCapExceeded(len, oldCap) {
  /* sub 0x7fffffff,old_cap; cmp len; jb throw — UNSIGNED compare. */
  const room = (0x7fffffff - (oldCap >>> 0)) >>> 0;
  return ((len | 0) < 0 || ((len >>> 0) > room)) ? 1 : 0;
}
export function frameOpaque421620SsoInlineNeeded(cap) {
  return (cap >>> 0) < (FRAME_OPAQUE_421620_SSO_CAP >>> 0) ? 1 : 0;
}
export function frameOpaque421620GrowthNeeded(request) {
  /* cmp request,0xf / jbe inline. */
  return (request >>> 0) > 0x0f ? 1 : 0;
}
export function frameOpaque421620GrowCap(request) {
  /* cap = request|0xf; clamp 0x7fffffff THEN min 0x16. Inline arm: 0xf. */
  if ((request >>> 0) <= 0x0f) return 0x0f;
  let cap = ((request >>> 0) | 0x0f) >>> 0;
  if (cap > (FRAME_OPAQUE_421620_MAX_CAP >>> 0)) cap = FRAME_OPAQUE_421620_MAX_CAP >>> 0;
  if (cap < (FRAME_OPAQUE_421620_MIN_GROW >>> 0)) cap = FRAME_OPAQUE_421620_MIN_GROW >>> 0;
  return cap >>> 0;
}

/* ---- v38 FUN_00421720 bitset membership (re-splice) ---- */
export function frameOpaque421720WordOff(id) {
  /* shr edx,5; shl edx,2 = (id>>5)*4 (unsigned shift; no wrap for
     id<=0xffffffff: 0x07ffffff*4 = 0x1ffffffc < 2^32). */
  return (id >>> 5) * 4;
}
export function frameOpaque421720BitMask(id) {
  /* and ecx,0x1f; shl esi,cl — 1 << (id & 0x1f). */
  return (1 << ((id >>> 0) & 0x1f)) >>> 0;
}
export function frameOpaque421720Membership(wordA, wordB, bitMask) {
  /* test each word; either set -> 1. */
  return (((wordA >>> 0) & (bitMask >>> 0)) !== 0 ||
          ((wordB >>> 0) & (bitMask >>> 0)) !== 0) ? 1 : 0;
}

/* ---- v39 FUN_0042177a0 bitset-set + getter band (re-splice) ---- */
export function frameOpaque4217a0ClampId(id) {
  /* test eax,eax; cmovle 0; cmp 0x34; cmovl — clamp to [0, 0x34]. */
  if ((id | 0) < 0) return 0;
  return (id | 0) > (FRAME_OPAQUE_4217A0_MAX_ID >>> 0)
    ? (FRAME_OPAQUE_4217A0_MAX_ID >>> 0) : (id | 0);
}
export function frameOpaque4217a0PairOff(clamped) {
  /* shr esi,6; [edi+esi*8] — (clamped>>6)*8. */
  return (((clamped >>> 0) >> 6) << 3) >>> 0;
}
export function frameOpaque4217a0LoBit(clamped) {
  /* and 0x3f; bts edx,eax — bit index WRAPS MOD 32. */
  return (1 << ((clamped >>> 0) & 0x1f)) >>> 0;
}
export function frameOpaque4217a0LoIsHi(clamped) {
  /* cmp eax,0x20; cmovae edx — lo >= 0x20 -> second dword. */
  return ((clamped >>> 0) & 0x3f) >= 0x20 ? 1 : 0;
}
export function frameOpaque4217a0Membership(wordA, wordB, loBit, loIsHi) {
  const mask = loBit >>> 0;
  const a = (loIsHi | 0) === 0 ? ((wordA >>> 0) & mask) : 0;
  const b = (loIsHi | 0) !== 0 ? ((wordB >>> 0) & mask) : 0;
  return (((a | b) >>> 0) !== 0) ? 1 : 0;
}

/* ---- v40 FUN_004218e0 xorshift chain (re-splice) ---- */
export function frameOpaque4218e0HashStep(x) {
  /* xorshift(3,13,7), all UNSIGNED shifts: t=(x>>>3)^x;
     t=((t<<13)^t)>>>0; t=((t>>>7)^t)>>>0. */
  let t = (x >>> 3) ^ x;
  t = ((t << 13) ^ t) >>> 0;
  t = ((t >>> 7) ^ t) >>> 0;
  return t >>> 0;
}
export function frameOpaque4218e0ChainValue(id, i) {
  /* hash^i(id) — the i-th iterate feeds the next. */
  let x = id >>> 0;
  const n = i >>> 0;
  for (let k = 0; k < n; k++) x = frameOpaque4218e0HashStep(x);
  return x >>> 0;
}
export function frameOpaque4218e0BitTransferA(wordA, bit) {
  /* btr: A had the bit -> B must set it. */
  return ((wordA >>> 0) & (bit >>> 0)) !== 0 ? 1 : 0;
}
export function frameOpaque4218e0BitTransferB(wordB, bit) {
  return ((wordB >>> 0) & (bit >>> 0)) !== 0 ? 1 : 0;
}

/* ---- v41 shuffle laws (re-splice) ---- */
export function frameOpaqueShuffleCount(span) {
  /* 0x66666667 magic /5: imul 64-bit, hi32, sar3, shr31-1, add. */
  const prod = BigInt(span | 0) * 0x66666667n;
  let hi = Number((prod >> 32n) & 0xffffffffn) | 0;
  hi = (hi >> 3) | 0;
  const esi = ((hi >>> 0) >>> 31) - 1;
  return (esi + hi) | 0;
}
export function frameOpaqueShuffleSlotOff(idx) {
  /* lea [edx+edx*4]; [ecx+eax*4] = idx*0x14. */
  return (Math.imul(idx | 0, FRAME_OPAQUE_SHUFFLE_RECORD_SIZE)) >>> 0;
}
export function frameOpaqueShuffleWordToIndex(word, divisor) {
  /* xor edx,edx; div ebx — UNSIGNED remainder; divisor 0 -> 0. */
  if ((divisor >>> 0) === 0) return 0;
  return (word >>> 0) % (divisor >>> 0);
}
export function frameOpaqueShuffleNeedsSwap(idx, j) {
  /* cmp esi,edx; je skip-swap. */
  return (idx >>> 0) !== (j >>> 0) ? 1 : 0;
}
export function frameOpaqueShuffleCollectionNonempty(begin, end) {
  /* mov eax,[ebx]; cmp eax,[ebx+4]; je skip. */
  return (begin >>> 0) !== (end >>> 0) ? 1 : 0;
}

/* ---- v42 4253b0/c0/d0 id-vector trio (re-splice) ---- */
export function frameOpaque4253c0AddResult(managerPtr) {
  /* add eax,0x4a920 — 32-bit wrap. */
  return ((managerPtr >>> 0) + (FRAME_OPAQUE_4253C0_MANAGER_ADD >>> 0)) >>> 0;
}
export function frameOpaque4253d0Count(end, begin) {
  /* sub esi,eax; sar esi,2 — ARITHMETIC shift of the wrap delta. */
  return (((end >>> 0) - (begin >>> 0)) | 0) >> 2;
}
export function frameOpaque4253d0InRange(idx, count) {
  return (idx >>> 0) < (count >>> 0) ? 1 : 0;
}
export function frameOpaque4253d0Match(elemId, key) {
  return ((elemId >>> 0) === (key >>> 0)) ? 1 : 0;
}
export function frameOpaque4253d0FirstMatchIndex(elemIds, count, key) {
  if (elemIds == null) return -1;
  const n = count >>> 0;
  const want = key >>> 0;
  for (let i = 0; i < n; i++) {
    if ((elemIds[i] >>> 0) === want) return i | 0;
  }
  return -1;
}
export function frameOpaque4253d0Result(elems, count, matchIndex) {
  if (elems == null || (matchIndex | 0) < 0 ||
      (matchIndex >>> 0) >= (count >>> 0)) return 0;
  return elems[matchIndex >>> 0] >>> 0;
}

/* ---- v43 getter/gate band (re-splice) ---- */
export function frameOpaque421800Result(obj) {
  /* lea eax,[ecx+0x14] — wrap add, no deref. */
  return ((obj >>> 0) + (FRAME_OPAQUE_421800_FIELD_OFF >>> 0)) >>> 0;
}
export function frameOpaque424530Identity(obj) {
  return obj >>> 0;
}
export function frameOpaque423950ReadId(obj, memU8) {
  /* mov eax,[ecx+0x1618] — FULL dword memory read. */
  const off = (obj >>> 0) + (FRAME_OPAQUE_PLAYER_ID_OFF >>> 0);
  return (memU8[off] | (memU8[off + 1] << 8) | (memU8[off + 2] << 16) |
    (memU8[off + 3] << 24)) >>> 0;
}
export function frameOpaque423960Result(begin, end) {
  /* setne al over eax=begin — LOW-BYTE overlay: begin & ~0xff | flag. */
  const flag = (begin >>> 0) !== (end >>> 0) ? 1 : 0;
  return (((begin >>> 0) & 0xffffff00) | flag) >>> 0;
}
export function frameOpaque423970Result(sub, memU8) {
  /* test eax,eax; je DEADBEEF; mov eax,[eax+0xc]. */
  if ((sub >>> 0) === 0) return FRAME_OPAQUE_423970_NULL_MARKER >>> 0;
  const off = (sub >>> 0) + (FRAME_OPAQUE_423970_ENTRY_OFF >>> 0);
  return (memU8[off] | (memU8[off + 1] << 8) | (memU8[off + 2] << 16) |
    (memU8[off + 3] << 24)) >>> 0;
}
export function frameOpaque425430CopySrcOff(k) {
  /* 0x34k wrap multiply. */
  return (Math.imul(k | 0, FRAME_OPAQUE_425430_STRIDE)) >>> 0;
}
export function frameOpaque425430CopyDstOff(k) {
  /* 0x34k + COPY_SHIFT (4). */
  return (Math.imul(k | 0, FRAME_OPAQUE_425430_STRIDE) +
    (FRAME_OPAQUE_425430_COPY_SHIFT >>> 0)) >>> 0;
}
export function frameOpaque425430CopyApply(base, memU8) {
  /* 22 dword copies [base+0x34k+4] = [base+0x34k] (k=0..0x15). */
  const stride = FRAME_OPAQUE_425430_STRIDE >>> 0;
  const shift = FRAME_OPAQUE_425430_COPY_SHIFT >>> 0;
  const count = FRAME_OPAQUE_425430_COUNT >>> 0;
  const b = base >>> 0;
  for (let k = 0; k <= count; k++) {
    const src = b + stride * k;
    const dst = b + src + shift;
    memU8[dst] = memU8[src];
    memU8[dst + 1] = memU8[src + 1];
    memU8[dst + 2] = memU8[src + 2];
    memU8[dst + 3] = memU8[src + 3];
  }
}

/* ---- v45/v46 4239b0 + 423990 + 423aa0 (re-splice) ---- */
export function frameOpaque4239b0ClearValue(arg) {
  /* mov al,[ebp+8]; test al,al; je keep — LOW-BYTE gate: nonzero ->
     0, else 96.0f (0x42c00000). */
  return ((arg >>> 0) & 0xff) !== 0
    ? 0
    : (FRAME_OPAQUE_4239B0_CLEAR_DEFAULT >>> 0);
}
export function frameOpaque4239b0StoreValue(off, arg) {
  /* The 17 store offsets in machine order; +0x120/+0x250 byte-1
     stores; +0x118/+0x248 carry the byte-gate decision. */
  const gated = frameOpaque4239b0ClearValue(arg);
  switch (off >>> 0) {
    case FRAME_OPAQUE_4239B0_OFF_11C: return 1;
    case FRAME_OPAQUE_4239B0_OFF_24C: return 0;
    case FRAME_OPAQUE_4239B0_OFF_124: return FRAME_OPAQUE_4239B0_COUNT_15;
    case FRAME_OPAQUE_4239B0_OFF_254: return FRAME_OPAQUE_4239B0_COUNT_14;
    case FRAME_OPAQUE_4239B0_OFF_120: return FRAME_OPAQUE_4239B0_BYTE_ONE;
    case FRAME_OPAQUE_4239B0_OFF_128: return FRAME_OPAQUE_4239B0_F32_0_BITS;
    case FRAME_OPAQUE_4239B0_OFF_12C: return FRAME_OPAQUE_4239B0_F32_1_BITS;
    case FRAME_OPAQUE_4239B0_OFF_118: return gated;
    case FRAME_OPAQUE_4239B0_OFF_114: return FRAME_OPAQUE_4239B0_DEFAULT_96_BITS;
    case FRAME_OPAQUE_4239B0_OFF_250: return FRAME_OPAQUE_4239B0_BYTE_ONE;
    case FRAME_OPAQUE_4239B0_OFF_258: return FRAME_OPAQUE_4239B0_F32_0_BITS;
    case FRAME_OPAQUE_4239B0_OFF_25C: return FRAME_OPAQUE_4239B0_F32_1_BITS;
    case FRAME_OPAQUE_4239B0_OFF_248: return gated;
    case FRAME_OPAQUE_4239B0_OFF_244: return FRAME_OPAQUE_4239B0_DEFAULT_96_BITS;
    case FRAME_OPAQUE_4239B0_OFF_260: return FRAME_OPAQUE_4239B0_ONE_BITS;
    case FRAME_OPAQUE_4239B0_OFF_264: return 0;
    case FRAME_OPAQUE_4239B0_OFF_268: return 0;
    default: return 0xffffffff;
  }
}
export function frameOpaque423990InitArg() {
  return FRAME_OPAQUE_423990_INIT_ARG >>> 0;
}
export function frameOpaque423aa0Iterations() {
  return FRAME_OPAQUE_423AA0_ITERATIONS >>> 0;
}
export function frameOpaque423aa0FreeNeeded(cap) {
  /* cmp edx,0x10; jb skip-free — UNSIGNED: cap >= 0x10 frees. */
  return (cap >>> 0) >= (FRAME_OPAQUE_423AA0_FREE_MIN_CAP >>> 0) ? 1 : 0;
}
export function frameOpaque423aa0BigHeaderPath(cap) {
  /* inc edx; cmp edx,0x1000; jb small — BIG iff (cap+1) >= 0x1000. */
  return (((cap >>> 0) + 1) >>> 0) >= (FRAME_OPAQUE_423AA0_BIG_THRESHOLD >>> 0) ? 1 : 0;
}
export function frameOpaque423aa0HeaderDelta(buf, header) {
  /* sub eax,ecx; add eax,-4 — (buf - header - 4) mod 2^32. */
  return (((buf >>> 0) - (header >>> 0) - 4)) >>> 0;
}
export function frameOpaque423aa0HeaderSane(delta) {
  /* cmp eax,0x1f; ja invalid — SANE iff delta <= 0x1f. */
  return (delta >>> 0) <= (FRAME_OPAQUE_423AA0_DELTA_MAX >>> 0) ? 1 : 0;
}
export function frameOpaque423aa0SsoInline(cap) {
  /* cap < 0x10 -> SSO data at obj start; else heap ptr at [obj]. */
  return (cap >>> 0) < (FRAME_OPAQUE_423AA0_FREE_MIN_CAP >>> 0)
    ? (FRAME_OPAQUE_423AA0_SSO_INLINE >>> 0)
    : (FRAME_OPAQUE_423AA0_SSO_HEAP >>> 0);
}
export function frameOpaque423aa0InsertLeft(objNull, strEq, objByte34, thisByte44) {
  /* LEFT prompt insert gate: null obj or strcmp mismatch -> insert;
     byte34==0 skip; byte44!=0 skip; else insert. */
  if ((objNull >>> 0) !== 0) return 1;
  if ((strEq >>> 0) === 0) return 1;
  if (((objByte34 >>> 0) & 0xff) === 0) return 0;
  if (((thisByte44 >>> 0) & 0xff) !== 0) return 0;
  return 1;
}
export function frameOpaque423aa0InsertRight(objNull, strEq, objByte34, thisByte174) {
  if ((objNull >>> 0) !== 0) return 1;
  if ((strEq >>> 0) === 0) return 1;
  if (((objByte34 >>> 0) & 0xff) === 0) return 0;
  if (((thisByte174 >>> 0) & 0xff) !== 0) return 0;
  return 1;
}
export function frameOpaque423aa0FlagResult(hostResult) {
  /* test al,al; je skip — LOW-BYTE: nonzero sets the flag byte 1. */
  return ((hostResult >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/* ---- remaining consts (VA aliases + arrays + stragglers) ---- */
export const FRAME_OPAQUE_4214B0_VA = 0x004214b0;
export const FRAME_OPAQUE_4215A0_VA = 0x004215a0;
export const FRAME_OPAQUE_4215E0_VA = 0x004215e0;
export const FRAME_OPAQUE_421620_VA = 0x00421620;
export const FRAME_OPAQUE_421680_VA = 0x00421680;
export const FRAME_OPAQUE_421720_VA = 0x00421720;
export const FRAME_OPAQUE_421770_VA = 0x00421770;
export const FRAME_OPAQUE_421780_VA = 0x00421780;
export const FRAME_OPAQUE_421790_VA = 0x00421790;
export const FRAME_OPAQUE_4217A0_VA = 0x004217a0;
export const FRAME_OPAQUE_4218E0_VA = 0x004218e0;
export function frameOpaque425430ZeroValue() {
  return 0;
}
export function frameOpaqueShuffleCollectionStride() {
  return FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE >>> 0;
}
export function frameOpaqueShuffleRecordSize() {
  return FRAME_OPAQUE_SHUFFLE_RECORD_SIZE >>> 0;
}
export function frameOpaqueShufflePrngInitVa() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_INIT_VA >>> 0;
}
export function frameOpaqueShufflePrngNextVa() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_NEXT_VA >>> 0;
}
export function frameOpaqueShufflePrngBound() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_BOUND >>> 0;
}
export function frameOpaqueShuffleLoopVa() {
  return FRAME_OPAQUE_SHUFFLE_LOOP_VA >>> 0;
}
export function frameOpaqueShuffleEndVa() {
  return FRAME_OPAQUE_SHUFFLE_END_VA >>> 0;
}
export function frameOpaque424cd0PairHostVa() {
  return FRAME_OPAQUE_424CD0_PAIR_HOST_VA >>> 0;
}

/* ---- v33 FUN_00421400 laws (re-splice) ---- */
export function frameOpaque421400ModeActive(mode) {
  /* cmp dword [ecx],0 / je no-op — FULL 32-bit probe. */
  return (mode | 0) !== 0 ? 1 : 0;
}
export function frameOpaque421400PosABits(numA) {
  /* divss [0xc78dc4] / 480.0f (0x43f00000) — f32 quotient. */
  return f32BitsFromFloat(f32(numA / 480.0));
}
export function frameOpaque421400PosBBits(numB) {
  /* divss [0xc78edc] / 270.0f (0x43870000). */
  return f32BitsFromFloat(f32(numB / 270.0));
}
export function frameOpaque421400RenderNeeded(flag111) {
  /* cmp byte [ecx+0x111],0 / je — LOW-BYTE. */
  return ((flag111 >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque421400RenderFirst(field78) {
  /* cmp byte [ecx+0x78],0 / je — LOW-BYTE; 0 -> +0x38 first. */
  return ((field78 >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque421400Plan(mode, numA, numB, flag111, field78) {
  /* mode probe gates the pair writes; host AnimationState::Render
     (0x40a030) stays host with the overlay-clamp Vector 0xc7b640. */
  return {
    modeActive: frameOpaque421400ModeActive(mode),
    posABits: frameOpaque421400PosABits(numA),
    posBBits: frameOpaque421400PosBBits(numB),
    renderNeeded: frameOpaque421400RenderNeeded(flag111),
    renderFirst: frameOpaque421400RenderFirst(field78),
    renderVa: FRAME_OPAQUE_HOST_40A030_VA >>> 0,
    renderArgVa: FRAME_OPAQUE_421400_RENDER_ARG_VA >>> 0,
    guardVa: FRAME_OPAQUE_421400_GUARD_VA >>> 0,
    nextVa: FRAME_OPAQUE_421400_END_VA >>> 0,
    pureCfOk: true,
  };
}

/* ---- v49 FUN_00424220 mode dispatch (re-splice) ---- */
export function frameOpaque424220Dispatch(mode) {
  /* dec; cmp 4; ja DEFAULT; jmp table[idx] — 0->A, 1/2/4->B, 3->D. */
  const idx = ((mode >>> 0) - 1) >>> 0;
  if (idx > 4) return FRAME_OPAQUE_424220_DISPATCH_DEFAULT >>> 0;
  switch (idx) {
    case 0: return FRAME_OPAQUE_424220_DISPATCH_CASE_A >>> 0;
    case 1: case 2: case 4:
      return FRAME_OPAQUE_424220_DISPATCH_CASE_B >>> 0;
    default:
      return FRAME_OPAQUE_424220_DISPATCH_DEFAULT >>> 0;
  }
}
export function frameOpaque424220BGate(lo, hi) {
  /* cmp [..],[..+4] / je PATH2 — FULL-DWORD equality. */
  return (lo >>> 0) === (hi >>> 0) ? 1 : 0;
}
export function frameOpaque424220B1Entry(subobj, memU8) {
  /* [res+0x378] rtti; null -> 0xdeadbeef; else [rtti+0xc]. */
  if ((subobj >>> 0) === 0) return FRAME_OPAQUE_424220_NULL_MARKER >>> 0;
  const off = (subobj >>> 0) + (FRAME_OPAQUE_424220_RTTI_ENTRY_OFF >>> 0);
  return (memU8[off] | (memU8[off + 1] << 8) | (memU8[off + 2] << 16) |
    (memU8[off + 3] << 24)) >>> 0;
}
export function frameOpaque424220B2Delta(hi, lo) {
  /* mov eax,[+0x1baac]; sub eax,[+0x1baa8] — wrap diff. */
  return ((hi >>> 0) - (lo >>> 0)) >>> 0;
}
export function frameOpaque424220B2Gate(delta) {
  /* test eax,0xfffffffc; je DEFAULT — FULL mask test. */
  return ((delta >>> 0) & (FRAME_OPAQUE_424220_DELTA_MASK >>> 0)) === 0 ? 1 : 0;
}
export function frameOpaque424220B2Result(obj, memU8) {
  /* Game::GetPlayer(0) then [res+0x1618] — id read law. */
  const off = (obj >>> 0) + (FRAME_OPAQUE_424220_RESULT_ID_OFF >>> 0);
  return (memU8[off] | (memU8[off + 1] << 8) | (memU8[off + 2] << 16) |
    (memU8[off + 3] << 24)) >>> 0;
}

/* ---- v50 FUN_004242b0 SEH dispatch peel (re-splice) ---- */
export function frameOpaque4242b0SubGate(sub) {
  return (sub >>> 0) !== 0 ? 1 : 0;
}
export function frameOpaque4242b0AlGate(al) {
  /* test al,al / je — LOW-BYTE. */
  return ((al >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque4242b0CbGate(fnptr) {
  return (fnptr >>> 0) !== 0 ? 1 : 0;
}
export function frameOpaque4242b0FireCb(sub, al, fnptr) {
  if ((sub >>> 0) === 0) return 0;
  if (((al >>> 0) & 0xff) === 0) return 0;
  if ((fnptr >>> 0) === 0) return 0;
  return 1;
}

/* ---- v51 424310 / v52 424440 / v53 424510 zero/self-link laws ---- */
export function frameOpaque424310NodeSelfLink(node) {
  /* [eax]=eax; [eax+4]=eax; [eax+8]=eax — FULL node address. */
  return node >>> 0;
}
export function frameOpaque424310ZeroedAt(off) {
  const o = off >>> 0;
  return ([0x00, 0x10, 0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30, 0x34,
           0x48, 0x4c, 0x50, 0x8c, 0x90, 0x94, 0x98, 0x9c, 0xa0]
    .includes(o)) ? 1 : 0;
}
export function frameOpaque424440NodeSelfLink(node) {
  return node >>> 0;
}
export function frameOpaque424440ZeroedAt(off) {
  const o = off >>> 0;
  return ([0x1c, 0x3c, 0x40, 0x44, 0x54, 0x58, 0x5c, 0x60,
           0x64, 0x68, 0x70, 0x78, 0x7c, 0x80, 0x84, 0x88]
    .includes(o)) ? 1 : 0;
}
export function frameOpaque424440CopySrcOff(k) {
  switch (k >>> 0) {
    case 0: return 0x20;
    case 1: return 0x2c;
    case 2: return 0x98;
    default: return FRAME_OPAQUE_424440_OUT_OF_RANGE >>> 0;
  }
}
export function frameOpaque424440CopyDstOff(k) {
  switch (k >>> 0) {
    case 0: return 0x24;
    case 1: return 0x30;
    case 2: return 0x9c;
    default: return FRAME_OPAQUE_424440_OUT_OF_RANGE >>> 0;
  }
}
export function frameOpaque424440CopySnapshot(k) {
  /* k==2: +0x98 read BEFORE the zero storm, +0x9c written LAST. */
  return (k >>> 0) === 2 ? 1 : 0;
}
export function frameOpaque424510ZeroedAt(off) {
  const o = off >>> 0;
  return (o === 0x00 || o === 0x04 || o === 0x08) ? 1 : 0;
}
export function frameOpaque424510ZeroWidthBytes(off) {
  /* all three stores are FULL-DWORD c7 (4 bytes), not byte c6. */
  const o = off >>> 0;
  return (o === 0x00 || o === 0x04 || o === 0x08) ? 4 : 0;
}
export function frameOpaque424510ReturnThis(thisPtr) {
  /* mov eax,ecx @0x424516 — full 32-bit this passthrough. */
  return thisPtr >>> 0;
}

/* ---- v54 FUN_00424580 light-quad laws (re-splice) ---- */
export function frameOpaque424580IterationCount(xmm2Bits) {
  const bound = frameOpaque4254b0Cvttss2si(xmm2Bits >>> 0);
  if ((bound | 0) < 0) return 0;
  return ((bound | 0) + 1) >>> 0;
}
export function frameOpaque424580RadiusOk(dxBits, dyBits, rBits) {
  /* dist2 = f32(f32(dy*dy)+dx2); r2=f32(r*r); comiss dist2,r2; jb skip —
     ordered dist2 >= r2; NaN skips. */
  const dx = f32Bits(dxBits >>> 0);
  const dy = f32Bits(dyBits >>> 0);
  const r = f32Bits(rBits >>> 0);
  const dx2 = f32(dx * dx);
  const dy2 = f32(dy * dy);
  const dist2 = f32(dy2 + dx2);
  const r2 = f32(r * r);
  if (dist2 !== dist2 || r2 !== r2) return 0;
  return dist2 >= r2 ? 1 : 0;
}
export function frameOpaque424580XIdx16(x1Bits, x3Bits) {
  /* addss sum; cvttss2si; movzx ax — LOW-16 of the truncated sum. */
  const sum = f32(f32Bits(x1Bits >>> 0) + f32Bits(x3Bits >>> 0));
  const t = frameOpaque4254b0Cvttss2si(f32BitsFromFloat(sum));
  return (t & 0xffff) >>> 0;
}
export function frameOpaque424580DyF32(ybaseBits, arg0Bits, counter) {
  /* INPUT ybase is the already-summed f32 (xmm2+arg0 done by the
     caller); diff = ybase - i; cvttss2si; movzx di (low16); then
     dy = f32(y16 - arg0). */
  const ybase = f32Bits(ybaseBits >>> 0);
  const arg0 = f32Bits(arg0Bits >>> 0);
  const diff = f32(ybase - (counter >>> 0));
  const t = frameOpaque4254b0Cvttss2si(f32BitsFromFloat(diff));
  const y16 = (t & 0xffff) >>> 0;
  return f32BitsFromFloat(f32(y16 - arg0));
}
export function frameOpaque424580AngleDeg(atanBits) {
  /* mulss by [0xbaa948] = f32 0x42652ee0 (57.2958...); +360.0 =
     [0xbaab30] 0x43b40000 iff deg < 0.0 ORDERED (NaN stays). */
  const atan = f32Bits(atanBits >>> 0);
  const rad = f32Bits(FRAME_OPAQUE_424580_DEG_RAD_BITS >>> 0);
  const add = f32Bits(FRAME_OPAQUE_424580_DEG_ADD_BITS >>> 0);
  let deg = f32(atan * rad);
  if (deg < 0.0) deg = f32(deg + add);
  return f32BitsFromFloat(deg);
}
export function frameOpaque424580AngleOk(degBits, minBits, maxBits) {
  /* comiss deg,min jb skip; comiss max,deg jb skip — ordered min<=deg<=max. */
  const deg = f32Bits(degBits >>> 0);
  const min = f32Bits(minBits >>> 0);
  const max = f32Bits(maxBits >>> 0);
  if (min !== min || deg !== deg || max !== max) return 0;
  return (min <= deg && deg <= max) ? 1 : 0;
}
export function frameOpaque424580ByteScale(chBits) {
  /* ch*255.0f (0x437f0000) mulss; cvttss2si; mov [..],al — LOW-BYTE. */
  const ch = f32(f32Bits(chBits >>> 0) * 255.0);
  const t = frameOpaque4254b0Cvttss2si(f32BitsFromFloat(ch));
  return (t & 0xff) >>> 0;
}
export function frameOpaque424580CellOff(stride, y16, x16) {
  /* movzx stride16; imul y16; add x16; lea [ecx+edx*4] — (s*y+x)*4 wrap. */
  const s = (stride >>> 0) & 0xffff;
  const y = (y16 >>> 0) & 0xffff;
  const x = (x16 >>> 0) & 0xffff;
  return (Math.imul(s, y) + x) * 4 >>> 0;
}

/* ---- v55 FUN_00499d60 atan2 + FUN_004248a0 seams (re-splice) ---- */
export function frameOpaque499d60Atan2(yBits, xBits) {
  /* cvtss2sd y; cvtss2sd x; _CIatan2(y,x); cvtpd2ps — float result. */
  return f32BitsFromFloat(Math.atan2(f32Bits(yBits >>> 0), f32Bits(xBits >>> 0)));
}
export function frameOpaque4248a0CellBytes(p1, p2) {
  /* w=(uint16)(P1+1); h=(uint16)(P2+1); (w*h)*4+4 wrap. */
  const w = ((p1 >>> 0) + 1) & 0xffff;
  const h = ((p2 >>> 0) + 1) & 0xffff;
  return (Math.imul(w, h) * 4 + 4) >>> 0;
}
export function frameOpaque4248a0HalfX(p1) {
  return ((p1 >>> 0) & 0xffff) >> 1;
}
export function frameOpaque4248a0HalfY(p2) {
  return ((p2 >>> 0) & 0xffff) >> 1;
}
export function frameOpaque4248a0Sx2(sx) {
  return f32BitsFromFloat(f32(f32(sx) * f32(sx)));
}
export function frameOpaque4248a0Sy2(sy) {
  return f32BitsFromFloat(f32(f32(sy) * f32(sy)));
}
export function frameOpaque4248a0TwoSx2(sx2Bits) {
  return f32BitsFromFloat(f32(f32Bits(sx2Bits >>> 0) + f32Bits(sx2Bits >>> 0)));
}
export function frameOpaque4248a0TwoSy2(sy2Bits) {
  return f32BitsFromFloat(f32(f32Bits(sy2Bits >>> 0) + f32Bits(sy2Bits >>> 0)));
}
export function frameOpaque4248a0T1(sy, twoSx2Bits) {
  return f32BitsFromFloat(f32(f32(sy) * f32Bits(twoSx2Bits >>> 0)));
}
export function frameOpaque4248a0T3(sy, sx2Bits) {
  return f32BitsFromFloat(f32(f32(sy) * f32Bits(sx2Bits >>> 0)));
}
export function frameOpaque4248a0Acc0(sy2Bits, t3Bits, sx2Bits) {
  /* f32(f32(sy2-t3) + f32(sx2*0.25f)) with 0.25f=0xbaa1d4. */
  const d = f32(f32Bits(sy2Bits >>> 0) - f32Bits(t3Bits >>> 0));
  const m = f32(f32Bits(sx2Bits >>> 0) * 0.25);
  return f32BitsFromFloat(f32(d + m));
}
export function frameOpaque4248a0Loop1Enter(t1Bits, twoSy2Bits) {
  /* comiss t1,t2s; jbe skip — t2s=f32(two_sy2*+0.0); ordered t1>t2s. */
  const t1 = f32Bits(t1Bits >>> 0);
  const t2s = f32(f32Bits(twoSy2Bits >>> 0) * 0.0);
  if (t1 !== t1 || t2s !== t2s) return 0;
  return t1 > t2s ? 1 : 0;
}
export function frameOpaque4248a0MidAcc(aBits, bBits, sx2Bits, sy2Bits) {
  /* acc2 = f32(f32(f32(a+0.5)^2)*sy2 + f32(f32(b-1)^2)*sx2 - f32(sy2*sx2)) */
  const a = f32Bits(aBits >>> 0);
  const b = f32Bits(bBits >>> 0);
  const sx2 = f32Bits(sx2Bits >>> 0);
  const sy2 = f32Bits(sy2Bits >>> 0);
  const ap = f32(a + 0.5);
  const bm = f32(b - 1.0);
  const ap2 = f32(ap * ap);
  const bm2 = f32(bm * bm);
  const t = f32(ap2 * sy2);
  const u = f32(bm2 * sx2);
  const v = f32(sy2 * sx2);
  const w = f32(t + u);
  return f32BitsFromFloat(f32(w - v));
}
export function frameOpaque4248a0Loop2Enter(bBits) {
  /* comiss b,0.0; jb skip — ordered b >= 0.0f; NaN skips. */
  const b = f32Bits(bBits >>> 0);
  if (b !== b) return 0;
  return b >= 0.0 ? 1 : 0;
}
export const FRAME_OPAQUE_424310_ZERO_OFFSETS = [0x00, 0x10, 0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30, 0x34, 0x48, 0x4c, 0x50, 0x8c, 0x90, 0x94, 0x98, 0x9c, 0xa0];
export const FRAME_OPAQUE_424440_ZERO_OFFSETS = [0x1c, 0x3c, 0x40, 0x44, 0x54, 0x58, 0x5c, 0x60, 0x64, 0x68, 0x70, 0x78, 0x7c, 0x80, 0x84, 0x88];
export const FRAME_OPAQUE_424510_ZERO_OFFSETS = [0x00, 0x04, 0x08];
export const FRAME_OPAQUE_4254B0_ROW_KIND_OFF = -4;
/* ---- unreferenced-const fill (header-backed) ---- */
export const FRAME_OPAQUE_4214B0_HOST_VA = 0x004214b0;
export const FRAME_OPAQUE_4215A0_HOST_VA = 0x004215a0;
export const FRAME_OPAQUE_4215E0_HOST_VA = 0x004215e0;
export const FRAME_OPAQUE_421620_HOST_VA = 0x00421620;
export const FRAME_OPAQUE_421680_HOST_VA = 0x00421680;
export const FRAME_OPAQUE_421720_HOST_VA = 0x00421720;
export const FRAME_OPAQUE_421770_HOST_VA = 0x00421770;
export const FRAME_OPAQUE_421780_HOST_VA = 0x00421780;
export const FRAME_OPAQUE_421790_HOST_VA = 0x00421790;
export const FRAME_OPAQUE_4217A0_HOST_VA = 0x004217a0;
export const FRAME_OPAQUE_4218E0_HOST_VA = 0x004218e0;
export const FRAME_OPAQUE_424440_OUT_OF_RANGE = 0xffffffff;
/* ---- strict getter regeneration (2nd pass) ---- */
export function frameOpaqueshuffleCollectionStride() {
  return FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE >>> 0;
}
export function frameOpaqueshuffleRecordSize() {
  return FRAME_OPAQUE_SHUFFLE_RECORD_SIZE >>> 0;
}
export function frameOpaqueshufflePrngInitVa() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_INIT_VA >>> 0;
}
export function frameOpaqueshufflePrngNextVa() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_NEXT_VA >>> 0;
}
export function frameOpaqueshufflePrngBound() {
  return FRAME_OPAQUE_SHUFFLE_PRNG_BOUND >>> 0;
}
export function frameOpaqueshuffleLoopVa() {
  return FRAME_OPAQUE_SHUFFLE_LOOP_VA >>> 0;
}
export function frameOpaqueshuffleEndVa() {
  return FRAME_OPAQUE_SHUFFLE_END_VA >>> 0;
}
export function frameOpaque4240b0HostVa() {
  return FRAME_OPAQUE_4240B0_VA >>> 0;
}
export function frameOpaque4240b0EndVa() {
  return FRAME_OPAQUE_4240B0_END_VA >>> 0;
}
export function frameOpaque4240b0CalleeVa() {
  return FRAME_OPAQUE_4240B0_CALLEE_VA >>> 0;
}
export function frameOpaque4240b0WalkVa() {
  return FRAME_OPAQUE_4240B0_WALK_VA >>> 0;
}
export function frameOpaque4240b0NameVa() {
  return FRAME_OPAQUE_4240B0_NAME_VA >>> 0;
}
export function frameOpaque423990ClearAfter() {
  /* composition: the wrapper runs the v45 init with arg 0 after the
     SEH body -> +0x118/+0x248 keep 96.0f (0x42c00000). */
  return frameOpaque4239b0ClearValue(FRAME_OPAQUE_423990_INIT_ARG);
}

/* ---- v59 FUN_00425130 CompletionWidget::Update pure seams ----
   PE 0x00425130..0x004252e5 plain ret x2 (thiscall this=ecx, no
   stack args; GS cookie [0xbf93b4] @0x425136; NO SEH; 116 insns;
   2 window-verified direct rel32 callers 0x0094de41 / 0x009b68fb).
   Body stays HOST (12x ANM2::SetLayerFrame 0x40a7e0 = family pin
   423CC0_HOST_LAYER_ASSIGN_VA + 2x 0x409030 AdvancePosition pair).
   Independent JS oracle for the scalar seams — NOT derived
   mechanically from the C++. */
export const FRAME_OPAQUE_425130_VA = 0x00425130;
export const FRAME_OPAQUE_425130_END_VA = 0x004252e6;
export const FRAME_OPAQUE_425130_CALL_SITES = 2;
export const FRAME_OPAQUE_425130_CALLER1_VA = 0x0094de41;
export const FRAME_OPAQUE_425130_CALLER2_VA = 0x009b68fb;
export const FRAME_OPAQUE_425130_COOKIE_VA = 0x00bf93b4;
export const FRAME_OPAQUE_425130_PAIR_CALL1_VA = 0x004251b1;
export const FRAME_OPAQUE_425130_PAIR_CALL2_VA = 0x004251b9;
export const FRAME_OPAQUE_425130_SET_LAYER_VA = 0x00425293;
export const FRAME_OPAQUE_425130_EARLY_EXIT_VA = 0x004252bf;
export const FRAME_OPAQUE_425130_FALLBACK_LOOP_VA = 0x004252c1;
export const FRAME_OPAQUE_425130_FALLBACK_COUNT = 0xc;
export const FRAME_OPAQUE_425130_MGR_FLAG_OFF = 0x4abbc;
export const FRAME_OPAQUE_425130_MGR_FLAG_BIT = 1;
export const FRAME_OPAQUE_425130_BYTE_10D_OFF = 0x10d;
export const FRAME_OPAQUE_425130_COUNTER_OFF = 0x118;
export const FRAME_OPAQUE_425130_MP_BEGIN_OFF = 0x4b3d8;
export const FRAME_OPAQUE_425130_MP_END_OFF = 0x4b3dc;
export const FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF = 0x4b434;
export const FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF = 0x14;
export const FRAME_OPAQUE_425130_ELEM_ARRAY_OFF = 0x2bc;
export const FRAME_OPAQUE_425130_MODE_TABLE_VA = 0x00c35ed0;
export const FRAME_OPAQUE_425130_MODE_TABLE_STRIDE = 0x90;
export const FRAME_OPAQUE_425130_LANE_COUNT = 0xc;
export const FRAME_OPAQUE_425130_VEC_A_VA = 0x00bab240;
export const FRAME_OPAQUE_425130_VEC_B_VA = 0x00bab510;
export const FRAME_OPAQUE_425130_VEC_C_VA = 0x00bab280;
export const FRAME_OPAQUE_425130_VEC_D_VA = 0x00bab3c0;
export const FRAME_OPAQUE_425130_VEC_E_VA = 0x00bab4a0;

export function frameOpaque425130HostVa() {
  return FRAME_OPAQUE_425130_VA >>> 0;
}
export function frameOpaque425130EndVa() {
  return FRAME_OPAQUE_425130_END_VA >>> 0;
}
export function frameOpaque425130CallSites() {
  return FRAME_OPAQUE_425130_CALL_SITES >>> 0;
}
export function frameOpaque425130Caller1Va() {
  return FRAME_OPAQUE_425130_CALLER1_VA >>> 0;
}
export function frameOpaque425130Caller2Va() {
  return FRAME_OPAQUE_425130_CALLER2_VA >>> 0;
}
export function frameOpaque425130CookieVa() {
  return FRAME_OPAQUE_425130_COOKIE_VA >>> 0;
}
export function frameOpaque425130PairCall1Va() {
  return FRAME_OPAQUE_425130_PAIR_CALL1_VA >>> 0;
}
export function frameOpaque425130PairCall2Va() {
  return FRAME_OPAQUE_425130_PAIR_CALL2_VA >>> 0;
}
export function frameOpaque425130SetLayerVa() {
  return FRAME_OPAQUE_425130_SET_LAYER_VA >>> 0;
}
export function frameOpaque425130EarlyExitVa() {
  return FRAME_OPAQUE_425130_EARLY_EXIT_VA >>> 0;
}
export function frameOpaque425130FallbackLoopVa() {
  return FRAME_OPAQUE_425130_FALLBACK_LOOP_VA >>> 0;
}
export function frameOpaque425130FallbackCount() {
  return FRAME_OPAQUE_425130_FALLBACK_COUNT >>> 0;
}
export function frameOpaque425130MgrFlagOff() {
  return FRAME_OPAQUE_425130_MGR_FLAG_OFF >>> 0;
}
export function frameOpaque425130MgrFlagBit() {
  return FRAME_OPAQUE_425130_MGR_FLAG_BIT >>> 0;
}
export function frameOpaque425130Byte10dOff() {
  return FRAME_OPAQUE_425130_BYTE_10D_OFF >>> 0;
}
export function frameOpaque425130CounterOff() {
  return FRAME_OPAQUE_425130_COUNTER_OFF >>> 0;
}
export function frameOpaque425130MpBeginOff() {
  return FRAME_OPAQUE_425130_MP_BEGIN_OFF >>> 0;
}
export function frameOpaque425130MpEndOff() {
  return FRAME_OPAQUE_425130_MP_END_OFF >>> 0;
}
export function frameOpaque425130MpBaseNonemptyOff() {
  return FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF >>> 0;
}
export function frameOpaque425130MpBaseEmptyOff() {
  return FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF >>> 0;
}
export function frameOpaque425130ElemArrayOff() {
  return FRAME_OPAQUE_425130_ELEM_ARRAY_OFF >>> 0;
}
export function frameOpaque425130ModeTableVa() {
  return FRAME_OPAQUE_425130_MODE_TABLE_VA >>> 0;
}
export function frameOpaque425130ModeTableStride() {
  return FRAME_OPAQUE_425130_MODE_TABLE_STRIDE >>> 0;
}
export function frameOpaque425130LaneCount() {
  return FRAME_OPAQUE_425130_LANE_COUNT >>> 0;
}
export function frameOpaque425130VecAVa() {
  return FRAME_OPAQUE_425130_VEC_A_VA >>> 0;
}
export function frameOpaque425130VecBVa() {
  return FRAME_OPAQUE_425130_VEC_B_VA >>> 0;
}
export function frameOpaque425130VecCVa() {
  return FRAME_OPAQUE_425130_VEC_C_VA >>> 0;
}
export function frameOpaque425130VecDVa() {
  return FRAME_OPAQUE_425130_VEC_D_VA >>> 0;
}
export function frameOpaque425130VecEVa() {
  return FRAME_OPAQUE_425130_VEC_E_VA >>> 0;
}
export function frameOpaque425130PairGate(mgrFlagByte, byte10d) {
  /* PE @0x425182 test byte [mgr+0x4abbc],1 / je-skip + @0x4251a5
     cmp byte [this+0x10d],0 / je-skip — byte gates (& 0xff). */
  return ((mgrFlagByte >>> 0) & 0xff) & 1 ? 0
    : ((byte10d >>> 0) & 0xff) === 0 ? 0 : 1;
}
export function frameOpaque425130ModeGt0x28(mode) {
  /* UNSIGNED cmp [mode],0x28; ja — early exit when mode > 0x28. */
  return (mode >>> 0) > 0x28 ? 1 : 0;
}
export function frameOpaque425130ModeGe0x29(mode) {
  /* SIGNED cmp,0x29; jge — wasm32 compare-flip class: the i64
     sign-extend form (0xffffffff = -1 -> 0). */
  return (mode | 0) >= 0x29 ? 1 : 0;
}
export function frameOpaque425130ModeLt0x15(mode) {
  /* SIGNED cmp,0x15; jl — wasm32 compare-flip class (0xffffffff
     = -1 -> 1). */
  return (mode | 0) < 0x15 ? 1 : 0;
}
export function frameOpaque425130Lane1(index) {
  /* [ebp+esi-0x64] dwords: vecA lanes (+0/+4 splat offsets) then
     vecB lanes. Out-of-range -> 0. */
  if ((index >>> 0) >= 12) {
    return 0;
  }
  return [0, 1, 2, 3, 4, 5, 6, 7, 9, 12, 13, 14][index >>> 0] >>> 0;
}
export function frameOpaque425130Lane2(index) {
  /* [ebp+esi-0x34] dwords: vecC/vecD/vecE lane groups. i=9 -> 0
     (feeds the +5 score law). Out-of-range -> 0. */
  if ((index >>> 0) >= 12) {
    return 0;
  }
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 10, 11][index >>> 0] >>> 0;
}
export function frameOpaque425130ElemBaseOff(mpNonempty) {
  /* manager+0x4b434 (mp vec non-empty) else manager+0x14. */
  return (mpNonempty >>> 0) !== 0
    ? FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF >>> 0
    : FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF >>> 0;
}
export function frameOpaque425130ElemOff(index) {
  /* [base + idx*4 + 0x2bc] dword offset; u32 wrap on idx*4. */
  return (0x2bc + Math.imul(index | 0, 4)) >>> 0;
}
export function frameOpaque425130TableElemOff(mode, lane) {
  /* 0xc35ed0 + mode*0x90 + lane*8 — u32 wraps (the add-zero je is
     unreachable: mode*144 == -0xc35ed0 mod 2^32 has no solution). */
  return (0xc35ed0 + Math.imul(mode | 0, 0x90) + Math.imul(lane | 0, 8)) >>> 0;
}
export function frameOpaque425130ScoreBase(v) {
  /* and eax,1 (FULL bit0) + test bl,2; cmovne 2 (LOW-BYTE bit1). */
  const u = v >>> 0;
  return ((u & 0xff) & 2) !== 0 ? 2 : (u & 1);
}
export function frameOpaque425130ScoreAdj(v, mpNonempty) {
  /* Empty mp vec AND base != 0 -> the 0x425254 jne KEEPS the base
     (bit4/bit8 chain skipped). Else bit8 (4/2) beats bit4 (3/1);
     the 3/4 vs 1/2 split is the snapshotted begin/end setne. */
  const u = v >>> 0;
  const base = frameOpaque425130ScoreBase(u);
  const nonempty = (mpNonempty >>> 0) !== 0;
  if (!nonempty && base !== 0) {
    return base;
  }
  if (((u & 0xff) & 8) !== 0) {
    return nonempty ? 4 : 2;
  }
  if (((u & 0xff) & 4) !== 0) {
    return nonempty ? 3 : 1;
  }
  return base;
}
export function frameOpaque425130ScoreFinal(score, lane2, mode) {
  /* FULL-dword lane2 zero test + SIGNED mode < 0x15 skip -> +5. */
  if ((lane2 >>> 0) === 0 && frameOpaque425130ModeLt0x15(mode) === 0) {
    return (score + 5) >>> 0;
  }
  return score >>> 0;
}
export function frameOpaque425130CounterInc(v) {
  /* test ebx,ebx FULL-dword -> inc [this+0x118]. */
  return (v >>> 0) !== 0 ? 1 : 0;
}

/* ---- v60 FUN_004252f0 CompletionWidget::Render pure seams ----
   PE 0x004252f0..0x425357 `ret 8` @0x425357 (thiscall this=ecx,
   arg1 Vector* [ebp+8], arg2 Vector* [ebp+0xc]; NO GS cookie, NO
   SEH; 32 insns, 3 E8 all 0x40a030 AnimationState::Render host —
   pins REUSED: HOST_40A030_VA / 421400_RENDER_ARG_VA (0xc7b640
   overlay clamp) — 2 window-verified direct rel32 callers
   0x0094ae79 / 0x009b7451). Body stays HOST: the pure seams are
   the unconditional pair copy [arg2]+0/+4 -> [ecx+0xa0]/[ecx+0xa4]
   (@0x4252fc/@0x425305), the byte-0x10d render gate (@0x42530b)
   and the byte-0x74 order select (@0x42532c). Both gates are
   byte==0 compares (NO signed 32-bit compare in this body -> no
   compare-flip law needed; 425130's i64 sign-extend laws stay).
   Mirrored mechanically from the C++. */
export const FRAME_OPAQUE_4252F0_VA = 0x004252f0;
export const FRAME_OPAQUE_4252F0_END_VA = 0x0042535a;
export const FRAME_OPAQUE_4252F0_RET_BYTES = 8;
export const FRAME_OPAQUE_4252F0_CALL_SITES = 2;
export const FRAME_OPAQUE_4252F0_CALLER1_VA = 0x0094ae79;
export const FRAME_OPAQUE_4252F0_CALLER2_VA = 0x009b7451;
export const FRAME_OPAQUE_4252F0_PAIR_X_OFF = 0xa0;
export const FRAME_OPAQUE_4252F0_PAIR_Y_OFF = 0xa4;
export const FRAME_OPAQUE_4252F0_GATE_OFF = 0x10d;
export const FRAME_OPAQUE_4252F0_ORDER_OFF = 0x74;
export const FRAME_OPAQUE_4252F0_SUB0_OFF = 0x34;
export const FRAME_OPAQUE_4252F0_SUB1_OFF = 0x54;
export const FRAME_OPAQUE_4252F0_FIRST0_CALL_VA = 0x0042533b;
export const FRAME_OPAQUE_4252F0_FIRST1_CALL_VA = 0x00425330;
export const FRAME_OPAQUE_4252F0_SECOND_CALL_VA = 0x0042534d;

export function frameOpaque4252f0HostVa() {
  return FRAME_OPAQUE_4252F0_VA >>> 0;
}
export function frameOpaque4252f0EndVa() {
  return FRAME_OPAQUE_4252F0_END_VA >>> 0;
}
export function frameOpaque4252f0RetBytes() {
  return FRAME_OPAQUE_4252F0_RET_BYTES >>> 0;
}
export function frameOpaque4252f0CallSites() {
  return FRAME_OPAQUE_4252F0_CALL_SITES >>> 0;
}
export function frameOpaque4252f0Caller1Va() {
  return FRAME_OPAQUE_4252F0_CALLER1_VA >>> 0;
}
export function frameOpaque4252f0Caller2Va() {
  return FRAME_OPAQUE_4252F0_CALLER2_VA >>> 0;
}
export function frameOpaque4252f0PairXOff() {
  return FRAME_OPAQUE_4252F0_PAIR_X_OFF >>> 0;
}
export function frameOpaque4252f0PairYOff() {
  return FRAME_OPAQUE_4252F0_PAIR_Y_OFF >>> 0;
}
export function frameOpaque4252f0GateOff() {
  return FRAME_OPAQUE_4252F0_GATE_OFF >>> 0;
}
export function frameOpaque4252f0OrderOff() {
  return FRAME_OPAQUE_4252F0_ORDER_OFF >>> 0;
}
export function frameOpaque4252f0Sub0Off() {
  return FRAME_OPAQUE_4252F0_SUB0_OFF >>> 0;
}
export function frameOpaque4252f0Sub1Off() {
  return FRAME_OPAQUE_4252F0_SUB1_OFF >>> 0;
}
export function frameOpaque4252f0First0CallVa() {
  return FRAME_OPAQUE_4252F0_FIRST0_CALL_VA >>> 0;
}
export function frameOpaque4252f0First1CallVa() {
  return FRAME_OPAQUE_4252F0_FIRST1_CALL_VA >>> 0;
}
export function frameOpaque4252f0SecondCallVa() {
  return FRAME_OPAQUE_4252F0_SECOND_CALL_VA >>> 0;
}
export function frameOpaque4252f0RenderGate(byte10d) {
  /* PE @0x42530b cmp byte [ecx+0x10d],0; je skip-all — LOW-BYTE
     gate: renders run iff the low byte is non-zero (0x100 -> 0). */
  return ((byte10d >>> 0) & 0xff) !== 0 ? 1 : 0;
}
export function frameOpaque4252f0RenderOrder(byte74) {
  /* PE @0x425314 cmp byte [ecx+0x74],0; je 0x425339 — LOW-BYTE
     order: 0 -> this+0x34 first, non-zero -> this+0x54 first. */
  return ((byte74 >>> 0) & 0xff) === 0 ? 0 : 1;
}
export function frameOpaque4252f0PairDestOff(index) {
  /* The unconditional copy destinations: [arg2] -> +0xa0,
     [arg2+4] -> +0xa4 (FULL dword movs @0x4252fc/@0x425305,
     BEFORE the gate). Out of range -> 0. */
  const i = index >>> 0;
  if (i === 0) {
    return FRAME_OPAQUE_4252F0_PAIR_X_OFF >>> 0;
  }
  if (i === 1) {
    return FRAME_OPAQUE_4252F0_PAIR_Y_OFF >>> 0;
  }
  return 0;
}


/* ---- v61 FUN_00425360 array element ctor init-store table ----
   PE 0x00425360..0x4253a6 ret (thiscall this=ecx, straight-line, NO
   SEH/cookie; 12 insns, 10 stores: 9 dword `c7` + 1 word `66 c7`).
   `mov eax,ecx` @0x425366 -> returns this. END 0x4253a7 (ret c3
   @0x4253a6). 0 direct E8 callers; the ONLY inbound edge is the
   dispatcher cookie `push 0x00425360` @0x6f174c feeding the
   __ehvec-style helper 0xaef5c4 (loop call [ebp+0x14], ret 0x14) —
   FUN_00425360 is the element default ctor of the 21x0x34 array at
   this+0xc (dtor cookie 0x425410 = v43 425430_INIT_COOKIE). The
   store stream is the law: [0x00]=0, [0x10]=0, [0x14]=0xf, [0x18]=
   0x16, WORD [0x1c]=0x101, [0x20..0x30]=0. Mirrored from the PE
   stream (independent of the C++ switch tables). */
export const FRAME_OPAQUE_425360_VA = 0x00425360;
export const FRAME_OPAQUE_425360_END_VA = 0x004253a7;
export const FRAME_OPAQUE_425360_CALL_SITES = 0;
export const FRAME_OPAQUE_425360_COOKIE_VA = 0x006f174c;
export const FRAME_OPAQUE_425360_DISPATCHER_VA = 0x00aef5c4;
export const FRAME_OPAQUE_425360_STORE_COUNT = 10;
export const FRAME_OPAQUE_425360_NO_STORE_BYTE = 0xff;
/* The PE store stream (index -> [off, value, width, insn_va]). */
const FRAME_OPAQUE_425360_STORES = [
  [0x00, 0, 4, 0x00425360],
  [0x10, 0, 4, 0x00425368],
  [0x14, 0xf, 4, 0x0042536f],
  [0x18, 0x16, 4, 0x00425376],
  [0x1c, 0x101, 2, 0x0042537d],
  [0x20, 0, 4, 0x00425383],
  [0x24, 0, 4, 0x0042538a],
  [0x28, 0, 4, 0x00425391],
  [0x2c, 0, 4, 0x00425398],
  [0x30, 0, 4, 0x0042539f],
];

export function frameOpaque425360HostVa() {
  return FRAME_OPAQUE_425360_VA >>> 0;
}
export function frameOpaque425360EndVa() {
  return FRAME_OPAQUE_425360_END_VA >>> 0;
}
export function frameOpaque425360CallSites() {
  return FRAME_OPAQUE_425360_CALL_SITES >>> 0;
}
export function frameOpaque425360CookieVa() {
  return FRAME_OPAQUE_425360_COOKIE_VA >>> 0;
}
export function frameOpaque425360DispatcherVa() {
  return FRAME_OPAQUE_425360_DISPATCHER_VA >>> 0;
}
export function frameOpaque425360StoreCount() {
  return FRAME_OPAQUE_425360_STORE_COUNT >>> 0;
}
export function frameOpaque425360NoStoreByte() {
  return FRAME_OPAQUE_425360_NO_STORE_BYTE >>> 0;
}
export function frameOpaque425360InitStoreOff(index) {
  /* PE store offsets per index 0..9 (order-exact); byte-width result,
     0xff for invalid. */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425360_STORES.length) {
    return FRAME_OPAQUE_425360_STORES[i][0] & 0xff;
  }
  return FRAME_OPAQUE_425360_NO_STORE_BYTE;
}
export function frameOpaque425360InitStoreValue(index) {
  /* The immediate written per index (full u32; the 0x101 word imm). */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425360_STORES.length) {
    return FRAME_OPAQUE_425360_STORES[i][1] >>> 0;
  }
  return 0;
}
export function frameOpaque425360InitStoreWidth(index) {
  /* Store width per index: 4 except index 4 (the `66 c7` word store). */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425360_STORES.length) {
    return FRAME_OPAQUE_425360_STORES[i][2] >>> 0;
  }
  return 0;
}
export function frameOpaque425360InitStoreIndex(off) {
  /* FIRST-match store index for the ten offsets; 0xff absent (the
     low-byte semantics: off & 0xff like the byte-gate discipline). */
  const o = (off >>> 0) & 0xff;
  const n = FRAME_OPAQUE_425360_STORES.length;
  for (let i = 0; i < n; i += 1) {
    if (FRAME_OPAQUE_425360_STORES[i][0] === o) {
      return i;
    }
  }
  return FRAME_OPAQUE_425360_NO_STORE_BYTE;
}
export function frameOpaque425360InitStoreVa(index) {
  /* The instruction VA of each store (PE order); 0 invalid. */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425360_STORES.length) {
    return FRAME_OPAQUE_425360_STORES[i][3] >>> 0;
  }
  return 0;
}
export function frameOpaque425360InitHasStore(off) {
  /* 1 iff off is one of the ten store offsets, else 0. */
  const o = off >>> 0;
  const n = FRAME_OPAQUE_425360_STORES.length;
  for (let i = 0; i < n; i += 1) {
    if (FRAME_OPAQUE_425360_STORES[i][0] === o) {
      return 1;
    }
  }
  return 0;
}
export function frameOpaque425360ReturnThis(thisPtr) {
  /* PE @0x425366 `mov eax,ecx` — full 32-bit `this` passthrough. */
  return thisPtr >>> 0;
}

/* ======================= v62: FUN_00425b70 coop-award sub-object ctor ======================= */

/* PE 0x00425b70..0x4264b0 ret (thiscall this=ecx; 611 insns; NO SEH, NO
   GS cookie, NO int3 pad inside). Phase A: 21 static string-slot seeds
   (triad `push len; push seed; mov ecx, slot; call 0x40ccd0`, slot_i =
   0xc78f08 + i*0x18, seeds = the 21 `#Online/COOP_AWARD_*` rdata
   constants, ASCII-verified). Phase B: 21 member records base
   R_i = i*0x34 (the SAME 21x0x34 array as the v61 425360 element
   ctor): SSO-select `cmp [slot+0x14],0x10; cmovae ecx,[slot]` (cap >=
   0x10 UNSIGNED -> heap ptr, else the slot ADDRESS), host lookup
   `mov eax,[0xc7169c]; add eax,0x4a920; push ecx; push eax; call
   0x9586f0` (ret 8), pure inline strlen, `lea ecx,[this+0xc+i*0x34]`
   + `push len; push str; call 0x40ccd0` (ret 8), then the 4-store
   stream: dword [R_i+0x24] A, WORD [R_i+0x28] B (only 16-bit store),
   dword [R_i+0x2c] C, dword [R_i+0x30] D. 1 direct rel32 caller
   @0x6f176f; 63 E8 calls = 42 x host 0x40ccd0 (family v20 model
   REUSED) + 21 x host 0x9586f0 (NEW pin). LAWS: the seed tables, the
   member tables, the census pins and the sso_uses_heap decision. */
export const FRAME_OPAQUE_425B70_VA = 0x00425b70;
export const FRAME_OPAQUE_425B70_END_VA = 0x004264b1;
export const FRAME_OPAQUE_425B70_CALL_SITES = 1;
export const FRAME_OPAQUE_425B70_CALLSITE_VA = 0x006f176f;
export const FRAME_OPAQUE_425B70_INSNS = 611;
export const FRAME_OPAQUE_425B70_RET_VA = 0x004264b0;
export const FRAME_OPAQUE_425B70_RECORD_COUNT = 21;
export const FRAME_OPAQUE_425B70_RECORD_STRIDE = 0x34;
export const FRAME_OPAQUE_425B70_STRING_FIELD_OFF = 0xc;
export const FRAME_OPAQUE_425B70_STORE_A_OFF = 0x24;
export const FRAME_OPAQUE_425B70_STORE_B_OFF = 0x28;
export const FRAME_OPAQUE_425B70_STORE_C_OFF = 0x2c;
export const FRAME_OPAQUE_425B70_STORE_D_OFF = 0x30;
export const FRAME_OPAQUE_425B70_SLOT_BASE_VA = 0x00c78f08;
export const FRAME_OPAQUE_425B70_SLOT_STRIDE = 0x18;
export const FRAME_OPAQUE_425B70_SLOT_CAP_OFF = 0x14;
export const FRAME_OPAQUE_425B70_SSO_CAP = 0x10;
export const FRAME_OPAQUE_425B70_SOURCE_OFF = 0x4a920;
export const FRAME_OPAQUE_HOST_9586F0_VA = 0x009586f0;
export const FRAME_OPAQUE_425B70_STRING_CALLS = 42;
export const FRAME_OPAQUE_425B70_LOOKUP_CALLS = 21;
export const FRAME_OPAQUE_425B70_NO_INDEX = 0xff;

/* Seed VAs (rdata `#Online/COOP_AWARD_*` labels, order-exact). */
const FRAME_OPAQUE_425B70_SEED_VAS = [
  0x00b1c2e4, 0x00b1c300, 0x00b1c320, 0x00b1c33c, 0x00b1c35c,
  0x00b1c378, 0x00b1c394, 0x00b1c3b0, 0x00b1c3cc, 0x00b1c3e8,
  0x00b1c408, 0x00b1c428, 0x00b1c444, 0x00b1c468, 0x00b1c484,
  0x00b1c4a0, 0x00b1c4bc, 0x00b1c4dc, 0x00b1c4fc, 0x00b1c518,
  0x00b1c534,
];
/* Seed byte lengths (the `push` imm of each head triad). */
const FRAME_OPAQUE_425B70_SEED_LENS = [
  0x1a, 0x1c, 0x1a, 0x1d, 0x1b, 0x19, 0x1b, 0x1b, 0x1b, 0x1d,
  0x1d, 0x1b, 0x20, 0x1a, 0x19, 0x19, 0x1e, 0x1e, 0x1a, 0x1a,
  0x1b,
];
/* Member record values (order-exact): [A dword, B word, C dword,
   D dword] at [R_i+0x24, R_i+0x28, R_i+0x2c, R_i+0x30]. */
const FRAME_OPAQUE_425B70_MEMBER_VALUES = [
  [0x15, 0x101, 0x3f800000, 0],
  [7, 1, 0x3f800000, 2],
  [4, 0x101, 0x3f800000, 0],
  [0xa, 0x101, 0x40000000, 0],
  [2, 0, 0x41400000, 2],
  [0xc, 0x101, 0x40400000, 0],
  [0xf, 0x101, 0x41a00000, 0],
  [0x14, 0x101, 0x40a00000, 0],
  [0x13, 0x101, 0x40a00000, 0],
  [8, 0x101, 0x41200000, 0],
  [0x12, 0x101, 0x40400000, 0],
  [0x10, 0x101, 0x40400000, 0],
  [9, 0x101, 0x40000000, 0],
  [0xb, 0x101, 0x41a00000, 0],
  [1, 0x101, 0x40400000, 0],
  [5, 0x101, 0x40a00000, 0],
  [6, 0x101, 0x40a00000, 0],
  [0xd, 0x101, 0x41f80000, 0],
  [0xe, 0x101, 0x41200000, 0],
  [3, 0x101, 0x3f800000, 1],
  [0x11, 1, 0x447a0000, 1],
];

export function frameOpaque425b70HostVa() {
  return FRAME_OPAQUE_425B70_VA >>> 0;
}
export function frameOpaque425b70EndVa() {
  return FRAME_OPAQUE_425B70_END_VA >>> 0;
}
export function frameOpaque425b70CallSites() {
  return FRAME_OPAQUE_425B70_CALL_SITES >>> 0;
}
export function frameOpaque425b70CallsiteVa() {
  return FRAME_OPAQUE_425B70_CALLSITE_VA >>> 0;
}
export function frameOpaque425b70InsnCount() {
  return FRAME_OPAQUE_425B70_INSNS >>> 0;
}
export function frameOpaque425b70RetVa() {
  return FRAME_OPAQUE_425B70_RET_VA >>> 0;
}
export function frameOpaque425b70RecordCount() {
  return FRAME_OPAQUE_425B70_RECORD_COUNT >>> 0;
}
export function frameOpaque425b70RecordStride() {
  return FRAME_OPAQUE_425B70_RECORD_STRIDE >>> 0;
}
export function frameOpaque425b70StringFieldOff() {
  return FRAME_OPAQUE_425B70_STRING_FIELD_OFF >>> 0;
}
export function frameOpaque425b70StoreAOff() {
  return FRAME_OPAQUE_425B70_STORE_A_OFF & 0xff;
}
export function frameOpaque425b70StoreBOff() {
  return FRAME_OPAQUE_425B70_STORE_B_OFF & 0xff;
}
export function frameOpaque425b70StoreCOff() {
  return FRAME_OPAQUE_425B70_STORE_C_OFF & 0xff;
}
export function frameOpaque425b70StoreDOff() {
  return FRAME_OPAQUE_425B70_STORE_D_OFF & 0xff;
}
export function frameOpaque425b70StaticSlotVa(index) {
  /* slot_i = 0xc78f08 + i*0x18 (the machine's own linear progression:
     21 `mov ecx, imm` immediates). 0 for invalid index. */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_RECORD_COUNT) {
    return (FRAME_OPAQUE_425B70_SLOT_BASE_VA +
            i * FRAME_OPAQUE_425B70_SLOT_STRIDE) >>> 0;
  }
  return 0;
}
export function frameOpaque425b70StaticSeedVa(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_SEED_VAS.length) {
    return FRAME_OPAQUE_425B70_SEED_VAS[i] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70StaticSeedLen(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_SEED_LENS.length) {
    return FRAME_OPAQUE_425B70_SEED_LENS[i] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70MemberStringOff(index) {
  /* 0xc + i*0x34 (the machine's own linear progression: 20 `lea`
     immediates + `add esi,0x41c` @0x426437 for the last). 0 invalid. */
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_RECORD_COUNT) {
    return (FRAME_OPAQUE_425B70_STRING_FIELD_OFF +
            i * FRAME_OPAQUE_425B70_RECORD_STRIDE) >>> 0;
  }
  return 0;
}
export function frameOpaque425b70MemberValueA(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_MEMBER_VALUES.length) {
    return FRAME_OPAQUE_425B70_MEMBER_VALUES[i][0] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70MemberValueB(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_MEMBER_VALUES.length) {
    return FRAME_OPAQUE_425B70_MEMBER_VALUES[i][1] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70MemberValueC(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_MEMBER_VALUES.length) {
    return FRAME_OPAQUE_425B70_MEMBER_VALUES[i][2] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70MemberValueD(index) {
  const i = index >>> 0;
  if (i < FRAME_OPAQUE_425B70_MEMBER_VALUES.length) {
    return FRAME_OPAQUE_425B70_MEMBER_VALUES[i][3] >>> 0;
  }
  return 0;
}
export function frameOpaque425b70SsoUsesHeap(cap) {
  /* PE: `cmp [slot+0x14],0x10; cmovae ecx,[slot]` — cmovae = UNSIGNED
     above-or-equal: heap ptr iff cap >= 0x10; else the slot ADDRESS. */
  return (cap >>> 0) >= FRAME_OPAQUE_425B70_SSO_CAP ? 1 : 0;
}
export function frameOpaque425b70SourceBaseVa() {
  /* `mov eax,[0xc7169c]` — the Manager slot pin REUSED. */
  return FRAME_OPAQUE_MANAGER_SLOT_VA >>> 0;
}
export function frameOpaque425b70SourceOff() {
  return FRAME_OPAQUE_425B70_SOURCE_OFF >>> 0;
}
export function frameOpaque425b70HostLookupVa() {
  return FRAME_OPAQUE_HOST_9586F0_VA >>> 0;
}
export function frameOpaque425b70HostStringVa() {
  /* The family v20 string-assign model pin REUSED. */
  return FRAME_OPAQUE_HOST_40CCD0_VA >>> 0;
}

/* ======================= v63: FUN_00425a70 duplicate-seam pair finder ======================= */

/* PE 0x00425a70..0x425ab5, TWO `ret 8` (miss-exit 0x425aad, found-exit
   0x425ab5; END 0x00425ab8 = first int3 of the 8-byte pad 0x425ab8..
   0x425abf; next body 0x425ac0 = frame_effect HOST-pinned
   ISAAC_FRAME_EFFECT_HOST_425AC0_VA, NOT FO-open), 35 insns, 0 E8,
   0 stores, NO SEH / NO GS. PURE body, STRICT DUPLICATE of the landed
   4257b0 laws: count = magic-div(end-begin) with the SAME divider
   (0x4ec4ec4f / shift 5 / 0x68 stride — 4257B0_DIV_MAGIC/_DIV_SHIFT/
   _ELEM_STRIDE REUSED) then a stride-0x68 FIRST-MATCH pair scan
   ([e+0]==lo && [e+4]==hi; UNSIGNED jb bound) ==
   `frameOpaque4257b0ListCountFromBounds` + `frameOpaque4257b0PassAScanFound`.
   Seam row: PINNED (census + the composition law below), body NOT
   re-landed. 3 direct rel32 callers: 0x425b24 (inside 0x425ac0),
   0x6fdecd, 0x78ffe9 (whole-.text E8 rel32 census, this unit). */
export const FRAME_OPAQUE_425A70_VA = 0x00425a70;
export const FRAME_OPAQUE_425A70_END_VA = 0x00425ab8;
export const FRAME_OPAQUE_425A70_CALL_SITES = 3;
export const FRAME_OPAQUE_425A70_CALLER1_VA = 0x00425b24;
export const FRAME_OPAQUE_425A70_CALLER2_VA = 0x006fdecd;
export const FRAME_OPAQUE_425A70_CALLER3_VA = 0x0078ffe9;
export const FRAME_OPAQUE_425A70_INSNS = 35;
export const FRAME_OPAQUE_425A70_RET_BYTES = 8;
export const FRAME_OPAQUE_425A70_PAIR_LO_OFF = 0;
export const FRAME_OPAQUE_425A70_PAIR_HI_OFF = 4;

export function frameOpaque425a70HostVa() {
  return FRAME_OPAQUE_425A70_VA >>> 0;
}
export function frameOpaque425a70EndVa() {
  return FRAME_OPAQUE_425A70_END_VA >>> 0;
}
export function frameOpaque425a70CallSites() {
  return FRAME_OPAQUE_425A70_CALL_SITES >>> 0;
}
export function frameOpaque425a70Caller1Va() {
  return FRAME_OPAQUE_425A70_CALLER1_VA >>> 0;
}
export function frameOpaque425a70Caller2Va() {
  return FRAME_OPAQUE_425A70_CALLER2_VA >>> 0;
}
export function frameOpaque425a70Caller3Va() {
  return FRAME_OPAQUE_425A70_CALLER3_VA >>> 0;
}
export function frameOpaque425a70InsnCount() {
  return FRAME_OPAQUE_425A70_INSNS >>> 0;
}
export function frameOpaque425a70RetBytes() {
  return FRAME_OPAQUE_425A70_RET_BYTES >>> 0;
}
export function frameOpaque425a70PairLoOff() {
  return FRAME_OPAQUE_425A70_PAIR_LO_OFF & 0xff;
}
export function frameOpaque425a70PairHiOff() {
  return FRAME_OPAQUE_425A70_PAIR_HI_OFF & 0xff;
}
export function frameOpaque425a70Find(listBytes, listBeginVa, listEndVa,
                                      lo, hi) {
  /* The machine body (0x425a70..0x425ab5) exactly: begin=[ecx],
     end=[ecx+4] (the 0x68-stride vector), count = signed magic div
     (== frameOpaque4257b0ListCountFromBounds), then for i < count
     (UNSIGNED jb): first entry with [e+0]==lo && [e+4]==hi (FULL
     dword equality) returns AL=1; count 0 or miss -> AL=0. This is the
     pinned composition of the two landed 4257b0 laws (duplicate-seam;
     the JS oracle was reasoned independently from the C++ for parity). */
  if (listBytes == null) return 0;
  const count = frameOpaque4257b0ListCountFromBounds(
    listBeginVa >>> 0, listEndVa >>> 0) >>> 0;
  lo >>>= 0;
  hi >>>= 0;
  let off = 0;
  for (let i = 0; i < count; i += 1, off += FRAME_OPAQUE_4257B0_ELEM_STRIDE) {
    if (foLoadU32(listBytes, off) === lo &&
        foLoadU32(listBytes, off + 4) === hi) {
      return 1;
    }
  }
  return 0;
}
