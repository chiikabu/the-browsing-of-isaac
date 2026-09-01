/** Independent JS oracle for PlayerManager::Update pure helpers
 *  (VA 0x009bb5d0). Do not derive mechanically from the C++ implementation.
 */
export const PM_UPDATE_PURE_ABI_VERSION = 45;

function asU32(x) { return x >>> 0; }
function asI32(x) { return x | 0; }
function asU8(x) { return x & 0xff; }
function i64Imul(a, b) {
  return BigInt.asIntN(64, BigInt(a | 0) * BigInt(b | 0));
}
function u64Hi32(prod) {
  return Number((BigInt.asUintN(64, prod) >> 32n) & 0xffffffffn) | 0;
}

function f32FromBits(bits) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setUint32(0, bits >>> 0, true);
  return view.getFloat32(0, true);
}
function f32ToBits(f) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, f, true);
  return view.getUint32(0, true);
}
function f32Bits(bits) { return f32FromBits(bits); }
function urhRatio(red, max) { return pmUrhRatio(red, max); }
/** Signed 32x32 -> 64 imul; high dword as signed i32. */
function imul64High(a, b) {
  const p = BigInt(a | 0) * BigInt(b | 0);
  return Number(BigInt.asIntN(32, BigInt.asUintN(64, p) >> 32n));
}
function sseMaxss(a, b) { return a > b ? a : b; }
function sseMinss(a, b) { return a < b ? a : b; }
function clampRaw(raw1ea8) {
  let x = Math.fround((raw1ea8 | 0) / f32FromBits(PM_INTENSITY_F32_SCALE_20_BITS));
  x = sseMaxss(x, 0);
  x = sseMinss(x, f32FromBits(PM_INTENSITY_F32_ONE_BITS));
  return x;
}
function cascadeInRange(stageIndex) {
  return (stageIndex | 0) >= 0 && (stageIndex | 0) < (PM_TD_CASCADE_STAGES | 0) ? 1 : 0;
}
function rvbSarHalf(v) {
  const u = v | 0;
  const adj = (u + ((u >>> 31) >>> 0)) | 0;
  return adj >> 1;
}
function c0tHalfOfInc(v) {
  const inc = ((v | 0) + 1) | 0;
  const adj = (inc + (inc < 0 ? 1 : 0)) | 0;
  return adj >> 1;
}
function ubhTruncHalf(v) {
  const adj = ((v | 0) + ((v | 0) < 0 ? 1 : 0)) | 0;
  return adj >> 1;
}
function rol32(x, n) {
  const s = n & 31;
  x >>>= 0;
  return ((x << s) | (x >>> ((32 - s) & 31))) >>> 0;
}
function ror32(x, n) {
  const s = n & 31;
  x >>>= 0;
  return ((x >>> s) | (x << ((32 - s) & 31))) >>> 0;
}
function deathPack(p) {
  if (!p) {
    return { dead173: 0, anim7c: 0, anim8c: 0, twinNull: 0, twinAnim7c: 0, twinAnim8c: 0 };
  }
  return {
    dead173: p.dead173 ?? p.dead_173 ?? p.dead ?? 0,
    anim7c: p.anim7c ?? p.anim_7c ?? 0,
    anim8c: p.anim8c ?? p.anim_8c ?? 0,
    twinNull: p.twinNull ?? p.twin_null ?? 0,
    twinAnim7c: p.twinAnim7c ?? p.twin_anim_7c ?? 0,
    twinAnim8c: p.twinAnim8c ?? p.twin_anim_8c ?? 0,
  };
}
function intensityPack(p) {
  if (!p) return { raw1ea8: 0, flags168: 0, dead173: 0 };
  return {
    raw1ea8: p.raw1ea8 ?? p.raw_1ea8 ?? 0,
    flags168: p.flags168 ?? p.flags_168 ?? 0,
    dead173: p.dead173 ?? p.dead_173 ?? 0,
  };
}
function fillDeathPlan(residualKind, deathWalkGate, pm1Pure, eligibleCount, eligibleMask) {
  const pureComplete = (residualKind | 0) === (PM_DEATH_RESIDUAL_NONE | 0);
  return {
    residualKind: residualKind | 0,
    pureComplete,
    hostNeeded: !pureComplete,
    deathWalkGate: (deathWalkGate | 0) !== 0 ? 1 : 0,
    pm1Pure: (pm1Pure | 0) !== 0 ? 1 : 0,
    eligibleCount: eligibleCount | 0,
    eligibleMask: eligibleMask >>> 0,
    triggerDeathVa: PM_DEATH_HOST_VA_TRIGGER_DEATH,
    triggerArg: PM_DEATH_TRIGGER_ARG_CHECK_ONLY,
  };
}

export const PM_ABH_ESAU_CHAR = 17;
export const PM_ABH_PLAN_BYTES = 44;
export const PM_ABH_RESIDUAL_EARLY_HT2 = 1;
export const PM_ABH_RESIDUAL_EARLY_HT3 = 2;
export const PM_ABH_RESIDUAL_EARLY_TWIN = 3;
export const PM_ABH_RESIDUAL_ESAU_HOP = 8;
export const PM_ABH_RESIDUAL_HOST_HARD = 5;
export const PM_ABH_RESIDUAL_HOST_HT3 = 4;
export const PM_ABH_RESIDUAL_HOST_NEG = 6;
export const PM_ABH_RESIDUAL_HOST_POS = 7;
export const PM_ABH_RESIDUAL_WALK_CAP = 0;
export const PM_ABH_WALK_CHAR = 40;
export const PM_C0T_BODY_BYTES = 252;
export const PM_C0T_CALLSITE_COUNT = 8;
export const PM_C0T_GAME_GLOBAL_VA = 0x00c71678;
export const PM_C0T_OFF_134C = 0x134c;
export const PM_C0T_OFF_CHAR_13C0 = 0x13c0;
export const PM_C0T_OFF_FATAL_1340 = 0x1340;
export const PM_C0T_OFF_SOUL_1344 = 0x1344;
export const PM_C0T_SCAN_BASE_OFF = 0x1da04;
export const PM_C0T_SCAN_BYTE_OFF = 0xc;
export const PM_C0T_SCAN_BYTE_VALUE = 4;
export const PM_C0T_SCAN_NO_MATCH = 8;
export const PM_C0T_SCAN_SKIPPED = -1;
export const PM_C0T_SCAN_SLOTS = 8;
export const PM_C0T_SCAN_STRIDE = 0x6dc;
export const PM_C0T_STR_SETFULLHEARTS_VA = 0x00b719ec;
export const PM_C0T_VA_BODY = 0x007791f0;
export const PM_C0T_VA_CALLSITE_42C14B = 0x0042c14b;
export const PM_C0T_VA_CALLSITE_717DAF = 0x00717daf;
export const PM_C0T_VA_CALLSITE_7A258B = 0x007a258b;
export const PM_C0T_VA_CALLSITE_7B35EE = 0x007b35ee;
export const PM_C0T_VA_CALLSITE_7C4F0A = 0x007c4f0a;
export const PM_C0T_VA_CALLSITE_7CB110 = 0x007cb110;
export const PM_C0T_VA_CALLSITE_7FF46A = 0x007ff46a;
export const PM_C0T_VA_CALLSITE_9ACDB4 = 0x009acdb4;
export const PM_C0T_VA_GETTER_7CB060 = 0x007cb060;
export const PM_C0T_VA_GET_HEALTH_LIMIT = 0x007cae60;
export const PM_C0T_VA_GET_HEALTH_TYPE = 0x007cafe0;
export const PM_C0T_VA_NEXT_FUNC = 0x007792f0;
export const PM_C0T_VA_REGISTRATION_PUSH = 0x00869750;
export const PM_C0T_VA_RET = 0x007792eb;
export const PM_C0T_VA_UPDATE_BONE_HEARTS = 0x007cabc0;
export const PM_C0T_WALK_CHAR = 0x11;
export const PM_CHAIN_PLAN_BYTES = 48;
export const PM_CHAIN_VA_PLAY = 0x009bb82b;
export const PM_CHAIN_VA_PLAY_RELOAD = 0x009bb7e8;
export const PM_CHAIN_VA_PRE_PLAY = 0x009bb7fa;
export const PM_CHAIN_VA_SET_PITCH = 0x009bb7dd;
export const PM_CHAIN_VA_SET_VOLUME = 0x009bb7c9;
export const PM_CHAIN_VA_STOP_CALL = 0x009bb7a2;
export const PM_CHAIN_VA_STOP_PROBE = 0x009bb78e;
export const PM_CHAIN_VA_STOP_TEST = 0x009bb793;
export const PM_CHAIN_VA_UPDATE_PROBE = 0x009bb7ad;
export const PM_CHAIN_VA_UPDATE_TEST = 0x009bb7b2;
export const PM_DEATH_HOST_VA_EMPTY_FATAL = 0x00a112c0;
export const PM_DEATH_HOST_VA_TRIGGER_DEATH = 0x007a1090;
export const PM_DEATH_OFF_ANIM_7C = 0x7c;
export const PM_DEATH_OFF_ANIM_8C = 0x8c;
export const PM_DEATH_OFF_DEAD_173 = 0x173;
export const PM_DEATH_OFF_TWIN_1E68 = 0x1e68;
export const PM_DEATH_PLAYER_MAX = 8;
export const PM_DEATH_RESIDUAL_MONOLITHIC = 2;
export const PM_DEATH_RESIDUAL_NONE = 0;
export const PM_DEATH_RESIDUAL_WALK = 1;
export const PM_DEATH_TRIGGER_ARG_CHECK_ONLY = 0;
export const PM_EP_HT_BYTE_TABLE_VA = 0x007cb02c;
export const PM_EP_HT_CHAR_MIN = 4;
export const PM_EP_HT_INDEX_MAX = 0x24;
export const PM_EP_HT_JUMP_RETURNS = [1, 2, 3, 4, 0];
export const PM_EP_HT_JUMP_TABLE_VA = 0x007cb018;
export const PM_EP_HT_TABLE_LEN = 0x25;
export const PM_GHL_BASE_DEFAULT = 0x18;
export const PM_GHL_BASE_SMALL = 0xc;
export const PM_GHL_BODY_BYTES = 373;
export const PM_GHL_CALLSITE_COUNT = 28;
export const PM_GHL_CHAR1_BONUS = 0xc;
export const PM_GHL_CHAR_10_RESULT = 6;
export const PM_GHL_CHAR_14_RESULT = 4;
export const PM_GHL_COIN_DIV_MAGIC = 0x51eb851f;
export const PM_GHL_COIN_DIV_MODULUS = 25;
export const PM_GHL_COIN_DIV_SHIFT = 3;
export const PM_GHL_COIN_SPECIAL_63 = 0x63;
export const PM_GHL_COLLECTIBLE_1F5 = 0x1f5;
export const PM_GHL_COLLECTIBLE_26B = 0x26b;
export const PM_GHL_KEEPER_26B_BONUS = 2;
export const PM_GHL_KEEPER_CAP = 0x18;
export const PM_GHL_KEEPER_CHAR_21 = 0x21;
export const PM_GHL_KEEPER_CHAR_E = 0xe;
export const PM_GHL_KEEPER_SEL_BASE = 4;
export const PM_GHL_NULL_EFFECT_78 = 0x78;
export const PM_GHL_NULL_EFFECT_79 = 0x79;
export const PM_GHL_OFF_CLAMP_1DA0 = 0x1da0;
export const PM_GHL_OFF_COINS_1368 = 0x1368;
export const PM_GHL_OFF_STATE_2C = 0x2c;
export const PM_GHL_OFF_TEMP_EFFECTS_1508 = 0x1508;
export const PM_GHL_RESULT_GATE_CLOSED = 0xa0;
export const PM_GHL_STR_GETHEARTLIMIT_VA = 0x00b722b4;
export const PM_GHL_VA_BODY = 0x007cae60;
export const PM_GHL_VA_GULLET = 0x007ce390;
export const PM_GHL_VA_HAS_COLLECTIBLE = 0x007706e0;
export const PM_GHL_VA_HAS_NULL_EFFECT = 0x00930680;
export const PM_GHL_VA_REGISTRATION_PUSH = 0x0086a04f;
export const PM_GHL_VA_REGISTRATION_SINK = 0x008836b0;
export const PM_GHL_VA_RET_A0 = 0x007cae85;
export const PM_GHL_VA_RET_COMMON = 0x007cafd2;
export const PM_GHL_VA_RET_NULL78 = 0x007caeb6;
export const PM_GHL_VA_RET_NULL79 = 0x007caed4;
export const PM_HEAL_BURST_DRAWS = 20;
export const PM_HEAL_EMIT_BODY_BYTES = 119;
export const PM_HEAL_EMIT_CALLSITE_COUNT = 12;
export const PM_HEAL_EMIT_PLAN_BYTES = 20;
export const PM_HEAL_EMIT_VA = 0x007ca7c0;
export const PM_HEAL_EMIT_VA_BODY = 0x007ca7c0;
export const PM_HEAL_EMIT_VA_NEXT_FUNC = 0x007ca840;
export const PM_HEAL_EMIT_VA_RET = 0x007ca834;
export const PM_HEAL_F32_033_BITS = 0x3ea8f5c3;
export const PM_HEAL_F32_066_BITS = 0x3f28f5c3;
export const PM_HEAL_F32_12_BITS = 0x41400000;
export const PM_HEAL_F32_2NEG32_BITS = 0x2f800000;
export const PM_HEAL_F32_8_BITS = 0x41000000;
export const PM_HEAL_FROZEN_BIT = 0x400;
export const PM_HEAL_INNER_MAX = 4;
export const PM_HEAL_OUTER_MAX = 4;
export const PM_HEAL_PRE_ID_INITIAL = 0x1ab;
export const PM_HEAL_SFX_PLAY_VA = 0x0092dc30;
export const PM_HEAL_TAIL_KIND_HI = 0x3dd;
export const PM_HEAL_TAIL_KIND_LO = 0xa;
export const PM_HEAL_TAIL_MAX = 8;
export const PM_HEAL_VA = 0x007ca2d0;
export const PM_HEAL_VA_EXIT = 0x007ca7bd;
export const PM_HEAL_VA_RET = 0x007ca2d0;
export const PM_INTENSITY_F32_ONE_BITS = 0x3f800000;
export const PM_INTENSITY_F32_SCALE_20_BITS = 0x41a00000;
export const PM_INTENSITY_F32_THRESHOLD_BITS = 0x3c23d70a;
export const PM_INTENSITY_FLAG_BIT_40 = 0x40;
export const PM_INTENSITY_HOST_VA_IS_PLAYING = 0x0092e560;
export const PM_INTENSITY_HOST_VA_PLAY = 0x0092dc30;
export const PM_INTENSITY_HOST_VA_PRE_PLAY = 0x00956780;
export const PM_INTENSITY_HOST_VA_SET_PITCH = 0x0092e050;
export const PM_INTENSITY_HOST_VA_SET_VOLUME = 0x0092df40;
export const PM_INTENSITY_HOST_VA_STOP = 0x0092e230;
export const PM_INTENSITY_OFF_DEAD_173 = 0x173;
export const PM_INTENSITY_OFF_FLAGS_168 = 0x168;
export const PM_INTENSITY_OFF_RAW_1EA8 = 0x1ea8;
export const PM_INTENSITY_PLAYER_MAX = 8;
export const PM_INTENSITY_PLAY_FRAME_DELAY = 2;
export const PM_INTENSITY_PLAY_LOOP = 1;
export const PM_INTENSITY_PLAY_PAN_BITS = 0;
export const PM_INTENSITY_PLAY_PITCH_BITS = 0x3f800000;
const PLAY_PITCH = f32FromBits(PM_INTENSITY_PLAY_PITCH_BITS);
const PLAY_PAN = f32FromBits(PM_INTENSITY_PLAY_PAN_BITS);
export const PM_INTENSITY_SFX_ID = 0x1fc;
export const PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC = 4;
export const PM_INTENSITY_SFX_RESIDUAL_NONE = 0;
export const PM_INTENSITY_SFX_RESIDUAL_PLAY = 2;
export const PM_INTENSITY_SFX_RESIDUAL_STOP = 3;
export const PM_INTENSITY_SFX_RESIDUAL_UPDATE = 1;
export const PM_PLAYER_PTR_SHIFT = 2;
export const PM_PLAYER_VECTOR_BEGIN_OFF = 0x1baa8;
export const PM_PLAYER_VECTOR_END_OFF = 0x1baac;
export const PM_PRE_PLAY_GAME_GLOBAL_VA = 0x00c71678;
export const PM_PRE_PLAY_HOST_VA_MAP_LOOKUP = 0x004288a0;
export const PM_PRE_PLAY_HOST_VA_SEED_ZERO_FATAL = 0x00a112c0;
export const PM_PRE_PLAY_ID_DEFAULT = 0x1fc;
export const PM_PRE_PLAY_ID_FOUND = 0x25;
export const PM_PRE_PLAY_ID_RARE = 0x12d;
export const PM_PRE_PLAY_MAP_KEY = 7;
export const PM_PRE_PLAY_MAP_OFF = 0x1bbd8;
export const PM_PRE_PLAY_RARE_MODULUS = 20;
export const PM_PRE_PLAY_RNG_SEED_DEFAULT = 0x69696969;
export const PM_PRE_PLAY_RNG_SEED_VA = 0x00c5d2b0;
export const PM_PRE_PLAY_RNG_SHIFT1_DEFAULT = 2;
export const PM_PRE_PLAY_RNG_SHIFT1_VA = 0x00c5d2b4;
export const PM_PRE_PLAY_RNG_SHIFT2_DEFAULT = 7;
export const PM_PRE_PLAY_RNG_SHIFT2_VA = 0x00c5d2b8;
export const PM_PRE_PLAY_RNG_SHIFT3_DEFAULT = 7;
export const PM_PRE_PLAY_RNG_SHIFT3_VA = 0x00c5d2bc;
export const PM_PRE_PLAY_SEED_ZERO_FATAL_LEVEL = 0x10;
export const PM_PRE_PLAY_SEED_ZERO_STR_VA = 0x00b6bf54;
export const PM_SFX_ENTRY_DIV_MAGIC = 0x094f2095;
export const PM_SFX_ENTRY_DIV_SHIFT = 4;
export const PM_SFX_ENTRY_OFF_ENABLED_198 = 0x198;
export const PM_SFX_ENTRY_OFF_VOICE_COUNT_190 = 0x190;
export const PM_SFX_ENTRY_OFF_VOICE_PTR_20 = 0x20;
export const PM_SFX_ENTRY_OFF_VOLUME_194 = 0x194;
export const PM_SFX_ENTRY_STRIDE = 0x1b8;
export const PM_SFX_ENTRY_VOICE_STRIDE = 0x38;
export const PM_SFX_GATE_DISABLED = 2;
export const PM_SFX_GATE_LIVE = 3;
export const PM_SFX_GATE_MISS = 0;
export const PM_SFX_GATE_NO_SAMPLES = 1;
export const PM_SFX_MANAGER_GLOBAL_VA = 0x00c7169c;
export const PM_SFX_MANAGER_OFF = 0x2a324;
export const PM_SFX_WARN_LOG_LEVEL = 1;
export const PM_SFX_WARN_LOG_STR_VA = 0x00b7b1fc;
export const PM_SFX_WARN_LOG_VA = 0x00a112c0;
export const PM_TD_CASCADE_CHAR_TYPE_MATCH = 8;
export const PM_TD_CASCADE_STAGES = 10;
export const PM_TD_CHAR_PATH_0 = 0;
export const PM_TD_CHAR_PATH_1 = 1;
export const PM_TD_CHAR_PATH_2 = 2;
export const PM_TD_EARLY_CHECK_ONLY = 1;
export const PM_TD_EARLY_NONE = 0;
export const PM_TD_EARLY_REMOVE = 2;
export const PM_TD_GUARD_CHAR_TYPE = 1;
export const PM_TD_GUARD_NONE = 0;
export const PM_TD_GUARD_RNG_BIT = 2;
export const PM_TD_GUARD_STAGE17 = 3;
export const PM_TD_LIST_ELEM_STRIDE = 0x10;
export const PM_TD_LIST_MATCH_ID = 0x71;
export const PM_TD_OFF_CHAR_TYPE_13C0 = 0x13c0;
export const PM_TD_OFF_DEAD_171 = 0x171;
export const PM_TD_OFF_ORDER_161C = 0x161c;
export const PM_TD_OFF_POCKET_BASE_17A0 = 0x17a0;
export const PM_TD_OFF_STATE_2C = 0x2c;
export const PM_TD_OFF_TWIN_1E68 = 0x1e68;
export const PM_TD_POCKET_MATCH_ID = 0x59;
export const PM_TD_POCKET_SLOTS = 4;
export const PM_TD_PROBE_KIND_A = 1;
export const PM_TD_PROBE_KIND_B = 2;
export const PM_TD_PROBE_KIND_NONE = 0;
export const PM_TD_REMOVE_STORE_171 = 0;
export const PM_TD_RVB_ARM_CHAIN_SKIP = 2;
export const PM_TD_RVB_ARM_FATAL = 1;
export const PM_TD_RVB_ARM_NOTIFY = 3;
export const PM_TD_RVB_ARM_SKIP = 0;
export const PM_TD_RVB_BODY_CASE0 = 0;
export const PM_TD_RVB_BODY_CASE1 = 1;
export const PM_TD_RVB_BODY_CASE2 = 2;
export const PM_TD_RVB_BODY_CASE3 = 3;
export const PM_TD_RVB_BODY_DEFAULT = 8;
export const PM_TD_RVB_BODY_EQ137 = 4;
export const PM_TD_RVB_BODY_HIGH0 = 5;
export const PM_TD_RVB_BODY_HIGH1 = 6;
export const PM_TD_RVB_BODY_HIGH2 = 7;
export const PM_TD_RVB_CASE0_BRANCH_CHAR12 = 4;
export const PM_TD_RVB_CASE0_BRANCH_ELSE = 5;
export const PM_TD_RVB_CASE0_BRANCH_HT1 = 0;
export const PM_TD_RVB_CASE0_BRANCH_HT3 = 3;
export const PM_TD_RVB_CASE0_BRANCH_HT4 = 1;
export const PM_TD_RVB_CASE0_BRANCH_KEEP = 2;
export const PM_TD_RVB_CASE1_BRANCH_ELSE = 3;
export const PM_TD_RVB_CASE1_BRANCH_HT1 = 0;
export const PM_TD_RVB_CASE1_BRANCH_HT2 = 2;
export const PM_TD_RVB_CASE1_BRANCH_HT4 = 1;
export const PM_TD_RVB_CASE2_CHAR_KEEP = 0x19;
export const PM_TD_RVB_CASE2_CHAR_NEW = 4;
export const PM_TD_RVB_CASE2_CONST_134C = 6;
export const PM_TD_RVB_CFG_BEGIN_OFF = 8;
export const PM_TD_RVB_CFG_DIV_MAGIC = 0x63e7063f;
export const PM_TD_RVB_CFG_DIV_SHIFT = 7;
export const PM_TD_RVB_CFG_END_OFF = 0xc;
export const PM_TD_RVB_CFG_MANAGER_GLOBAL_VA = 0x00c7169c;
export const PM_TD_RVB_CFG_OFF_B0 = 0xb0;
export const PM_TD_RVB_CFG_OFF_B4 = 0xb4;
export const PM_TD_RVB_CFG_OFF_B8 = 0xb8;
export const PM_TD_RVB_CFG_PROBE_0 = 0;
export const PM_TD_RVB_CFG_PROBE_1 = 1;
export const PM_TD_RVB_CFG_SITE_5BE49E = 0x005be49e;
export const PM_TD_RVB_CFG_SITE_65D7CE = 0x0065d7ce;
export const PM_TD_RVB_CFG_SITE_8ECB88 = 0x008ecb88;
export const PM_TD_RVB_CFG_SITE_9A2E30 = 0x009a2e30;
export const PM_TD_RVB_CFG_SITE_CASE0_HT1_A = 0x007a24bb;
export const PM_TD_RVB_CFG_SITE_CASE0_HT1_B = 0x007a24d9;
export const PM_TD_RVB_CFG_SITE_CASE0_HT4 = 0x007a2518;
export const PM_TD_RVB_CFG_SITE_CHECKED = 1;
export const PM_TD_RVB_CFG_SITE_UNCHECKED = 0;
export const PM_TD_RVB_CFG_SITE_UNKNOWN = -1;
export const PM_TD_RVB_CFG_STRIDE = 0x148;
export const PM_TD_RVB_CFG_VA_END = 0x0069bd4c;
export const PM_TD_RVB_CFG_VA_RECEIVER_GETTER = 0x00417910;
export const PM_TD_RVB_CFG_VA_RET_FALLBACK = 0x0069bd47;
export const PM_TD_RVB_CFG_VA_RET_IN_RANGE = 0x0069bd44;
export const PM_TD_RVB_CFG_VEC_OFF = 0x2a670;
export const PM_TD_RVB_DEFAULT_FMT_VA = 0x00b6b138;
export const PM_TD_RVB_DEFAULT_LOG_LEVEL = 4;
export const PM_TD_RVB_EQ137_CHAR_KEEP = 0x18;
export const PM_TD_RVB_EQ137_CHAR_NEW = 0xc;
export const PM_TD_RVB_EQ137_CONST_134C = 4;
export const PM_TD_RVB_EQ137_CONST_1350 = -1;
export const PM_TD_RVB_FATAL_TIMER_78 = 0x78;
export const PM_TD_RVB_HEAL_LIMIT = 2;
export const PM_TD_RVB_HEAL_OFF_26614 = 0x26614;
export const PM_TD_RVB_HIGH0_CFG_ELEM_OFF = 0x530;
export const PM_TD_RVB_HIGH0_CFG_VEC_BEGIN_OFF = 0x2a404;
export const PM_TD_RVB_HIGH0_CFG_VEC_END_OFF = 0x2a408;
export const PM_TD_RVB_HIGH0_CHAR_KEEP_A = 0x1d;
export const PM_TD_RVB_HIGH0_CHAR_KEEP_B = 0x26;
export const PM_TD_RVB_HIGH0_CHAR_NEW = 0xb;
export const PM_TD_RVB_HIGH0_CHAR_NO_PRE = 0x23;
export const PM_TD_RVB_HIGH0_CHAR_SKIP_ALL = 8;
export const PM_TD_RVB_HIGH0_COSTUME_FULL = 2;
export const PM_TD_RVB_HIGH0_COSTUME_NO_PRE = 1;
export const PM_TD_RVB_HIGH0_COSTUME_SKIP = 0;
export const PM_TD_RVB_HIGH0_EXTRA_LIVES_OFF_1E74 = 0x1e74;
export const PM_TD_RVB_HIGH0_EXTRA_LIVES_VALUE = 0x708;
export const PM_TD_RVB_HIGH0_ITEM_ELEM_OFF = 0xc4;
export const PM_TD_RVB_HIGH0_ITEM_VEC_BEGIN_OFF = 0x2a41c;
export const PM_TD_RVB_HIGH0_ITEM_VEC_END_OFF = 0x2a420;
export const PM_TD_RVB_HIGH1_CONST_134C = 1;
export const PM_TD_RVB_HIGH1_NOTIFY_ARG = 0xe;
export const PM_TD_RVB_HIGH2_1EFC_BITS = 0x40c00000;
export const PM_TD_RVB_HIGH2_EFFECT_ID_2B0 = 0x2b0;
export const PM_TD_RVB_HIGH2_NOTIFY_ARG = 6;
export const PM_TD_RVB_NOTIFY_CLAMP_MAX = 7;
export const PM_TD_RVB_NOTIFY_OFF_18308 = 0x18308;
export const PM_TD_RVB_NOTIFY_OFF_18318 = 0x18318;
export const PM_TD_RVB_NOTIFY_OFF_1831C = 0x1831c;
export const PM_TD_RVB_OFF_1574 = 0x1574;
export const PM_TD_RVB_OFF_BONE_1D88 = 0x1d88;
export const PM_TD_RVB_OFF_RED_194C = 0x194c;
export const PM_TD_RVB_OFF_TIMER_13BC = 0x13bc;
export const PM_TD_RVB_OFF_TWIN_1D98 = 0x1d98;
export const PM_TD_RVB_OFF_TWIN_1D9C = 0x1d9c;
export const PM_TD_RVB_OR_1574_MASK = 0xffff;
export const PM_TD_RVB_SFX_10A = 0x10a;
export const PM_TD_RVB_SFX_1B = 0x1b;
export const PM_TD_RVB_SFX_1C = 0x1c;
export const PM_TD_RVB_SFX_50 = 0x50;
export const PM_TD_RVB_SFX_VOL_1_0_BITS = 0x3f800000;
export const PM_TD_RVB_SFX_VOL_1_25_BITS = 0x3fa00000;
export const PM_TD_RVB_STAGE_CASE0 = 7;
export const PM_TD_RVB_STAGE_CASE1 = 6;
export const PM_TD_RVB_STAGE_CASE2 = 5;
export const PM_TD_RVB_STAGE_CASE3 = 8;
export const PM_TD_RVB_STAGE_EQ137 = 9;
export const PM_TD_RVB_STR_PICKUP_VA = 0x00b61760;
export const PM_TD_RVB_STR_SPARKLE_VA = 0x00b62268;
export const PM_TD_RVB_TIMER_5A = 0x5a;
export const PM_TD_RVB_VA_ADD_BLACK_HEARTS = 0x00758f90;
export const PM_TD_RVB_VA_ADD_COSTUME = 0x0075d1d0;
export const PM_TD_RVB_VA_ANIMATE = 0x007ab380;
export const PM_TD_RVB_VA_CASE0_TAIL_HOST = 0x007791f0;
export const PM_TD_RVB_VA_CONFIG_BY_CHAR = 0x0069bd10;
export const PM_TD_RVB_VA_EFFECT_ADD_930220 = 0x00930220;
export const PM_TD_RVB_VA_EFFECT_ADD_9302E0 = 0x009302e0;
export const PM_TD_RVB_VA_EXIT_FLOOR = 0x007a3292;
export const PM_TD_RVB_VA_EXIT_NOTIFY = 0x007a32b9;
export const PM_TD_RVB_VA_GAME_NOTIFY_703670 = 0x00703670;
export const PM_TD_RVB_VA_GET_COLLECTIBLE = 0x0072fd10;
export const PM_TD_RVB_VA_HEAL_HOST = 0x007ca2d0;
export const PM_TD_RVB_VA_HOST_7592A0 = 0x007592a0;
export const PM_TD_RVB_VA_HOST_763570 = 0x00763570;
export const PM_TD_RVB_VA_HOST_7BEBB0 = 0x007bebb0;
export const PM_TD_RVB_VA_NOTIFY_SINK = 0x006fd7c0;
export const PM_TD_RVB_VA_PRE_HOST_7C3620 = 0x007c3620;
export const PM_TD_RVB_VA_UPDATE_RED_HEARTS = 0x007c9ea0;
export const PM_TD_RVB_ZERO_MASK_CASE0 = 0xfc;
export const PM_TD_RVB_ZERO_MASK_CASE1 = 0xf4;
export const PM_TD_RVB_ZERO_MASK_CASE2 = 0xf7;
export const PM_TD_RVB_ZERO_MASK_CASE3 = 0xfc;
export const PM_TD_RVB_ZERO_MASK_DEFAULT = 0;
export const PM_TD_RVB_ZERO_MASK_EQ137 = 0xe7;
export const PM_TD_RVB_ZERO_MASK_HIGH0 = 0xfc;
export const PM_TD_RVB_ZERO_MASK_HIGH1 = 0xf5;
export const PM_TD_RVB_ZERO_MASK_HIGH2 = 0xfc;
export const PM_TD_RVH_CHAIN_FIELD0_MATCH = 0x23;
export const PM_TD_RVH_CHAIN_FIELD8_MATCH = 0x10;
export const PM_TD_RVH_ID_HIGH_BOUND = 0x137;
export const PM_TD_RVH_ID_CASE0 = 0xb;
export const PM_TD_RVH_ID_CASE1 = 0x51;
export const PM_TD_RVH_ID_CASE2 = 0xa1;
export const PM_TD_RVH_ID_CASE3 = 0xd4;
export const PM_TD_RVH_ID_HIGH0 = 0x14c;
export const PM_TD_RVH_ID_HIGH1 = 0x26b;
export const PM_TD_RVH_ID_HIGH2 = 0x2b0;
export const PM_TD_RVH_VA_CASE0 = 0x007a2456;
export const PM_TD_RVH_VA_CASE1 = 0x007a25e3;
export const PM_TD_RVH_VA_CASE2 = 0x007a2811;
export const PM_TD_RVH_VA_CASE3 = 0x007a26e4;
export const PM_TD_RVH_VA_HIGH0 = 0x007a30a6;
export const PM_TD_RVH_VA_HIGH1 = 0x007a2eeb;
export const PM_TD_RVH_VA_HIGH2 = 0x007a2ab7;
export const PM_TD_RVH_REGION_DEFAULT = 3;
export const PM_TD_RVH_REGION_EQ137 = 1;
export const PM_TD_RVH_REGION_HIGH = 2;
export const PM_TD_RVH_REGION_TABLE = 0;
export const PM_TD_RVH_TABLE_BIAS = 0xb;
export const PM_TD_RVH_TABLE_CASE_DEFAULT = 4;
export const PM_TD_RVH_TABLE_LIMIT = 0xc9;
export const PM_TD_RVH_VA_DEFAULT = 0x007a2a32;
export const PM_TD_RVH_VA_EQ137 = 0x007a28e9;
export const PM_TD_RVH_VA_HIGH = 0x007a2a11;
export const PM_TD_SEQ_ALT = 2;
export const PM_TD_SEQ_FULL = 3;
export const PM_TD_SEQ_NOT_DEAD = 0;
export const PM_TD_SEQ_REMOVE = 1;
export const PM_TD_STAGE17_ACCEPT_VALUE = 0xd;
export const PM_TD_STAGE17_MGR_8_MATCH = 2;
export const PM_TD_STAGE17_PATH_X = 0;
export const PM_TD_STAGE17_PATH_Y = 1;
export const PM_TD_STAGE17_RESULT_FALSE = 2;
export const PM_TD_STAGE17_RESULT_HOST = 0;
export const PM_TD_STAGE17_RESULT_TRUE = 1;
export const PM_TD_VA_MAIN = 0x007a10f0;
export const PM_TD_VA_NOOP = 0x007a1ca1;
export const PM_TD_VA_REMOVE = 0x007a10bd;
export const PM_UBH_BODY_BYTES = 227;
export const PM_UBH_CALLSITE_COUNT = 19;
export const PM_UBH_GATE_LIMIT = 2;
export const PM_UBH_OFF_BITS_1D8C = 0x1d8c;
export const PM_UBH_VA_BODY = 0x007cabc0;
export const PM_UBH_VA_RET_EARLY = 0x007cac22;
export const PM_UBH_VA_RET_TAIL = 0x007caca2;
export const PM_UBH_WORD_BITS = 0x20;
export const PM_URH_BODY_BYTES = 1071;
export const PM_URH_CALLSITE_COUNT = 26;
export const PM_URH_CHAR_1A = 0x1a;
export const PM_URH_CHAR_5 = 5;
export const PM_URH_ELEM_FIELD_78 = 0x78;
export const PM_URH_ENT_OFF_DEAD_173 = 0x173;
export const PM_URH_ENT_OFF_PARENT_410 = 0x410;
export const PM_URH_ENT_OFF_SUBTYPE_30 = 0x30;
export const PM_URH_ENT_OFF_TYPE_28 = 0x28;
export const PM_URH_ENT_OFF_VARIANT_2C = 0x2c;
export const PM_URH_ENT_SUBTYPE_SKIP_7 = 7;
export const PM_URH_ENT_TYPE_3 = 3;
export const PM_URH_ENT_VARIANT_EE = 0xee;
export const PM_URH_F32_01_BITS = 0x3dcccccd;
export const PM_URH_F32_01_VA = 0x00baa120;
export const PM_URH_F32_03_BITS = 0x3e99999a;
export const PM_URH_F32_03_VA = 0x00baa1f8;
export const PM_URH_F32_08_BITS = 0x3f4ccccd;
export const PM_URH_F32_08_VA = 0x00baa3a4;
const URH_F32_08 = f32FromBits(PM_URH_F32_08_BITS);
const URH_F32_01 = f32FromBits(PM_URH_F32_01_BITS);
const URH_F32_03 = f32FromBits(PM_URH_F32_03_BITS);
export const PM_URH_ID_19F = 0x19f;
export const PM_URH_ID_1BA = 0x1ba;
export const PM_URH_ID_1ED = 0x1ed;
export const PM_URH_ID_26B = 0x26b;
export const PM_URH_ID_7A = 0x7a;
export const PM_URH_ID_NULL_6E = 0x6e;
export const PM_URH_ITEMVEC_BEGIN_OFF = 0x2a41c;
export const PM_URH_ITEMVEC_ELEM_OFF = 0x1b8;
export const PM_URH_ITEMVEC_END_OFF = 0x2a420;
export const PM_URH_ITEMVEC_SPAN_MIN = 0x1b8;
export const PM_URH_OFF_1DA4 = 0x1da4;
export const PM_URH_OFF_BYTE_13B5 = 0x13b5;
export const PM_URH_OFF_BYTE_1824 = 0x1824;
export const PM_URH_OFF_ETERNAL_1348 = 0x1348;
export const PM_URH_OFF_FLAG_1574 = 0x1574;
export const PM_URH_OFF_FRAME_264F8 = 0x264f8;
export const PM_URH_OFF_OVERLAY_1C034 = 0x1c034;
export const PM_URH_OFF_ROOM_11F0 = 0x11f0;
export const PM_URH_OFF_ROOM_18300 = 0x18300;
export const PM_URH_OFF_ROOM_COUNT_1254 = 0x1254;
export const PM_URH_OFF_ROOM_LIST_124C = 0x124c;
export const PM_URH_OR_1574_BIT = 1;
export const PM_URH_ROOM_RECENT_MIN = 1;
export const PM_URH_SHOW_DELAY = 3;
export const PM_URH_SHOW_OVERLAY_ID = 3;
export const PM_URH_SHOW_PLAYER_NULL = 0;
export const PM_URH_SPRITE_530_OFF = 0x530;
export const PM_URH_SPRITE_644_OFF = 0x644;
export const PM_URH_STR_FLOATGLOW_VA = 0x00b6ae50;
export const PM_URH_STR_FLOATNOGLOW_VA = 0x00b6ae44;
export const PM_URH_THR2_LOW = 2;
export const PM_URH_THR_HIGH = 0x10;
export const PM_URH_THR_LOW = 1;
export const PM_URH_VA_ANM2_PLAY = 0x0040a380;
export const PM_URH_VA_BODY = 0x007c9ea0;
export const PM_URH_VA_EFFECT_ADD_930220 = 0x00930220;
export const PM_URH_VA_EFFECT_ADD_9302E0 = 0x009302e0;
export const PM_URH_VA_END = 0x007ca2ce;
export const PM_URH_VA_GULLET_7CE420 = 0x007ce420;
export const PM_URH_VA_HAS_COLLECTIBLE = 0x007706e0;
export const PM_URH_VA_HAS_EFFECT = 0x009305f0;
export const PM_URH_VA_HAS_NULL_EFFECT = 0x00930680;
export const PM_URH_VA_HOST_763570 = 0x00763570;
export const PM_URH_VA_NEXT_FUNC = 0x007ca2d0;
export const PM_URH_VA_OVERLAY_SHOW = 0x009ad210;
export const PM_URH_VA_PROBE_6DACD0 = 0x006dacd0;
export const PM_URH_VA_REMOVE_EFFECT = 0x009304a0;
export const PM_URH_VA_RET = 0x007ca29a;
export const PM_WALK_EMPTY_FATAL_LEVEL = 0x10;
export const PM_WALK_EMPTY_FATAL_STR_VA = 0x00b7e6bc;
export const PM_WALK_GAME_GLOBAL_VA = 0x00c71678;
export const PM_WALK_PLAN_BYTES = 36;
export const PM_WALK_TICK_PLAN_BYTES = 44;
export const PM_WALK_VA_CURSOR_LOAD = 0x009bb64a;
export const PM_WALK_VA_ELIG_DEAD = 0x009bb64c;
export const PM_WALK_VA_ELIG_IDLE_7C = 0x009bb655;
export const PM_WALK_VA_ELIG_IDLE_8C = 0x009bb65b;
export const PM_WALK_VA_ELIG_TWIN = 0x009bb664;
export const PM_WALK_VA_FATAL_RELOAD = 0x009bb636;
export const PM_WALK_VA_LOOP_BACK = 0x009bb68a;
export const PM_WALK_VA_LOOP_TOP = 0x009bb616;
export const PM_WALK_VA_SELECTOR = 0x009bb63c;
export const PM_WALK_VA_TRIGGER_CALL = 0x009bb67d;
export const PM_WALK_VA_TRIGGER_RELOAD = 0x009bb684;

export const PM_C0T_CALLSITES = [0x0042c14b,0x00717daf,0x007a258b,0x007b35ee,0x007c4f0a,0x007cb110,0x007ff46a,0x009acdb4];
export const PM_C0T_VA_CALLSITE_CASE0 = 0x007a258b;
export const PM_UBH_CALLSITES = [0x00758a54, 0x00758ba4, 0x00758efd, 0x007591ce, 0x0075920f, 0x00778bd8, 0x007792e0, 0x007b4fcb, 0x007b5002, 0x007ca91a, 0x007cea75, 0x007ceba7, 0x007cf001, 0x007cf018, 0x007d311b, 0x007d3163, 0x007daa7f, 0x009ba214, 0x009bd845];
export const PM_GHL_CALLSITES = [0x005c3082, 0x006e914a, 0x0075897a, 0x00758ea5, 0x0075908d, 0x00761e06, 0x00761e1e, 0x00761e30, 0x00762695, 0x007626c5, 0x00777f80, 0x007a224d, 0x007a5344, 0x007a5392, 0x007b3226, 0x007b5e96, 0x007c350e, 0x007ca937, 0x007ca968, 0x007caa5f, 0x007cabd9, 0x007cacd8, 0x007d0eae, 0x007d0ebd, 0x007d1573, 0x007d2a75, 0x007d9126, 0x00844ccf];
export const PM_URH_CALLSITES = [0x005b659a, 0x00612178, 0x00758a44, 0x00758b93, 0x007604b7, 0x00761f5e, 0x0077727a, 0x00777e3d, 0x00779277, 0x00793fd5, 0x007a17c5, 0x007a32bb, 0x007a355a, 0x007b7670, 0x007c5f0c, 0x007ca8be, 0x007ca921, 0x007ca9c5, 0x007cebae, 0x007cf008, 0x007cf01f, 0x007d310b, 0x007d3153, 0x007da8b2, 0x007da930, 0x007da956];
export const PM_TD_CASCADE_TABLE = [
  { id: 0x0b, probe: 1, guard: 0, va: 0x007a12d4 },
  { id: 0x00, probe: 0, guard: 1, va: 0x007a1848 },
  { id: 0x51, probe: 1, guard: 0, va: 0x007a1878 },
  { id: 0x2b0, probe: 1, guard: 0, va: 0x007a1936 },
  { id: 0xd4, probe: 1, guard: 2, va: 0x007a199d },
  { id: 0x14c, probe: 1, guard: 0, va: 0x007a1a09 },
  { id: 0xa1, probe: 1, guard: 0, va: 0x007a1a70 },
  { id: 0x1c, probe: 2, guard: 0, va: 0x007a1ab3 },
  { id: 0x137, probe: 1, guard: 0, va: 0x007a1b66 },
  { id: 0x17, probe: 2, guard: 3, va: 0x007a1ba9 },
];
export const PM_TD_RVH_CASE_VA = [0x007a2456, 0x007a25e3, 0x007a2811, 0x007a26e4, 0x007a2a32];
export const PM_TD_RVH_HIGH_SPECIAL = new Map([[0x14c, 0x007a30a6],[0x26b, 0x007a2eeb],[0x2b0, 0x007a2ab7]]);
export const PM_TD_RVH_TABLE_ENTRIES = 202;
export const PM_TD_RVH_JUMP_TABLE_CASES = 5;
export const PM_TD_RVH_TABLE_SPECIAL = [];

export function pmGhlGateLt2(game26614) { return asI32(game26614) < 2 ? 1 : 0; }
export function pmUbhGate(game26614) { return asI32(game26614) < 2 ? 1 : 0; }
export function pmC0tWalkEngaged(charType13c0) {
  return asU32(charType13c0) === 0x11 ? 1 : 0;
}
export function pmEpGetHealthType(charType) {
  const ch = asU32(charType);
  const index = ch - 4;
  if (index > 0x24) return 0;
  if (ch === 4 || ch === 0xc || ch === 0x11 || ch === 0x18 || ch === 0x19 || ch === 0x23 || ch === 0x24) return 1;
  if (ch === 0xa || ch === 0x1f || ch === 0x28) return 2;
  if (ch === 0xe || ch === 0x21) return 3;
  if (ch === 0x10) return 4;
  return 0;
}
export function pmTdRvbHealCapacity(v1340, v1344, v134c, v1d88) {
  return pmC0tHealCapacity(v1340, v1344, v134c, v1d88);
}
export function pmTdRvbHealGate(game26614, dead173, red194c) {
  return (pmGhlGateLt2(game26614) !== 0 && asU8(dead173) === 0 && asI32(red194c) > 0) ? 1 : 0;
}

export function pmAbhWalkEngaged(charType13c0) {
  return asU32(charType13c0) === 0x28 ? 1 : 0;
}
export function pmAbhWalkContinue(charType13c0, twin1e68) {
  return pmAbhWalkEngaged(charType13c0) !== 0 && asU32(twin1e68) !== 0 ? 1 : 0;
}
export function pmAbhEsauEngaged(charType13c0) {
  return asU32(charType13c0) === 0x11 ? 1 : 0;
}
export function pmAbhEsauContinue(charType13c0, twin1d98) {
  return pmAbhEsauEngaged(charType13c0) !== 0 && asU32(twin1d98) !== 0 ? 1 : 0;
}
export function pmAbhHt2Early(ht) { return asI32(ht) === 2 ? 1 : 0; }
export function pmAbhHt3Soul(ht) { return asI32(ht) === 3 ? 1 : 0; }
export function pmAbhHt3Applies(ht, amount) {
  return asI32(ht) === 3 && asI32(amount) > 0 ? 1 : 0;
}
export function pmAbhGameHard(game26614) {
  return pmGhlGateLt2(game26614) === 0 ? 1 : 0;
}
export function pmAbhAmountNeg(amount) { return asI32(amount) < 0 ? 1 : 0; }

function abhFill({ walked = 0, term = 1, hops28 = 0, hops11 = 0, ht = 0, probes = 0, kind }) {
  const early = kind === 1 || kind === 2 || kind === 3;
  let retVa = 0, nextVa = 0;
  if (kind === 1 || kind === 2) retVa = 0x007ca9f8;
  else if (kind === 3) retVa = 0x007ca89c;
  else if (kind === 4) nextVa = 0x007599d0;
  else if (kind === 5) nextVa = 0x007cacb0;
  else if (kind === 6) nextVa = ht === 4 ? 0x00758850 : 0x007cb060;
  else if (kind === 7) nextVa = 0x007cae60;
  return {
    walkedAddr: walked >>> 0, walkTerminated: term | 0,
    hops28: hops28 | 0, hops11: hops11 | 0, healthType: ht | 0,
    htProbes: probes | 0, residualKind: kind | 0,
    pureComplete: early ? 1 : 0,
    hostNeeded: (!early && kind !== 0 && kind !== 8) ? 1 : 0,
    retVa: retVa >>> 0, nextHostVa: nextVa >>> 0,
  };
}

export function pmAbhPrefixPlan({ charType13c0, twin1d98 = 0, game26614 = 0, amount = 0 } = {}) {
  const ch = asU32(charType13c0);
  const ht = pmEpGetHealthType(ch);
  if (pmAbhHt2Early(ht)) return abhFill({ ht, probes: 1, kind: 1 });
  if (pmAbhHt3Soul(ht)) {
    return abhFill({ ht, probes: 2, kind: asI32(amount) <= 0 ? 2 : 4 });
  }
  if (pmAbhEsauEngaged(ch)) {
    return abhFill({ ht, probes: 2, kind: asU32(twin1d98) === 0 ? 3 : 8 });
  }
  if (pmAbhGameHard(game26614)) return abhFill({ ht, probes: 2, kind: 5 });
  if (pmAbhAmountNeg(amount)) return abhFill({ ht, probes: 2, kind: 6 });
  return abhFill({ ht, probes: 2, kind: 7 });
}

export function pmAbhWalk28(players, startAddr, cap) {
  let cur = startAddr >>> 0; let hops = 0;
  for (;;) {
    const p = players.get(cur);
    const ch = p ? asU32(p.char) : 0;
    if (ch !== 0x28) return { addr: cur, terminated: 1, hops };
    const twin = p ? asU32(p.twin) : 0;
    if (twin === 0) return { addr: cur, terminated: 1, hops };
    if (hops >= cap) return { addr: 0, terminated: 0, hops };
    hops += 1; cur = twin;
  }
}

export function pmAbhRunPre({ players, startAddr, game26614 = 0, amount = 0, walkCap = 32 } = {}) {
  let cur = startAddr >>> 0, hops28 = 0, hops11 = 0, steps = 0;
  for (;;) {
    const p = players.get(cur) || { char: 0, twin: 0, twin1e68: 0, twin1d98: 0 };
    const ch = asU32(p.char);
    if (ch === 0x28 && asU32(p.twin1e68 || p.twin) !== 0) {
      if (steps >= walkCap) return abhFill({ term: 0, hops28, hops11, kind: 0 });
      hops28 += 1; steps += 1; cur = asU32(p.twin1e68 || p.twin); continue;
    }
    const ht = pmEpGetHealthType(ch);
    if (pmAbhHt2Early(ht)) return abhFill({ walked: cur, hops28, hops11, ht, probes: 1, kind: 1 });
    if (pmAbhHt3Soul(ht)) return abhFill({ walked: cur, hops28, hops11, ht, probes: 2, kind: asI32(amount) <= 0 ? 2 : 4 });
    if (ch === 0x11) {
      const t = asU32(p.twin1d98 || 0);
      if (t === 0) return abhFill({ walked: cur, hops28, hops11, ht, probes: 2, kind: 3 });
      if (steps >= walkCap) return abhFill({ term: 0, hops28, hops11, ht, probes: 2, kind: 0 });
      hops11 += 1; steps += 1; cur = t; continue;
    }
    if (pmAbhGameHard(game26614)) return abhFill({ walked: cur, hops28, hops11, ht, probes: 2, kind: 5 });
    if (pmAbhAmountNeg(amount)) return abhFill({ walked: cur, hops28, hops11, ht, probes: 2, kind: 6 });
    return abhFill({ walked: cur, hops28, hops11, ht, probes: 2, kind: 7 });
  }
}

/* ===================================================================== */
/* v22 — GHT: VA 0x007caa00 GetHeartLimit sibling (address-stable;      */
/* "GetHeartLimit" registration evidence only). PURE predicate.         */
/* PE 0x007caa00..0x007caa9d, ret 0, __thiscall.                        */
/* ===================================================================== */

export const PM_GHT_VA_BODY = 0x007caa00;
export const PM_GHT_VA_RET_ONE = 0x007caa84;
export const PM_GHT_VA_RET_ZERO = 0x007caa8b;
export const PM_GHT_VA_RET_HARD = 0x007caa9d;
export const PM_GHT_BODY_BYTES = 158;
export const PM_GHT_CALLSITE_COUNT = 3;
export const PM_GHT_PLAN_BYTES = 44;
export const PM_GHT_WALK_CHAR_28 = 0x28;
export const PM_GHT_WALK_CHAR_11 = 0x11;
export const PM_GHT_HARD_CAP_A0 = 0xa0;
export const PM_GHT_OFF_CHAR_13C0 = 0x13c0;
export const PM_GHT_OFF_TWIN_1E68 = 0x1e68;
export const PM_GHT_OFF_TWIN_1D98 = 0x1d98;
export const PM_GHT_OFF_V1340 = 0x1340;
export const PM_GHT_OFF_V1D88 = 0x1d88;
export const PM_GHT_VA_GET_HEALTH_TYPE = 0x007cafe0;
export const PM_GHT_VA_GET_HEALTH_LIMIT = 0x007cae60;
export const PM_GHT_VA_GAME_GLOBAL = 0x00c71678;
export const PM_GHT_OFF_GAME_26614 = 0x26614;

export function pmGhtHardGate(game26614) {
  /* 0x007caa0f cmp dword [eax+0x26614],2 ; 0x007caa16 jge — SIGNED. */
  return asI32(game26614) >= 2 ? 1 : 0;
}

export function pmGhtHardResult(v1340) {
  /* 0x007caa8c cmp dword [esi+0x1340],0xa0 ; setl al — SIGNED. */
  return asI32(v1340) < PM_GHT_HARD_CAP_A0 ? 1 : 0;
}

export function pmGhtWalkEngaged28(charType13c0) {
  return asU32(charType13c0) === PM_GHT_WALK_CHAR_28 ? 1 : 0;
}

export function pmGhtWalkContinue28(charType13c0, twin1e68) {
  return pmGhtWalkEngaged28(charType13c0) !== 0 && asU32(twin1e68) !== 0 ? 1 : 0;
}

export function pmGhtWalkEngaged11(charType13c0) {
  return asU32(charType13c0) === PM_GHT_WALK_CHAR_11 ? 1 : 0;
}

export function pmGhtWalkContinue11(charType13c0, twin1d98) {
  return pmGhtWalkEngaged11(charType13c0) !== 0 && asU32(twin1d98) !== 0 ? 1 : 0;
}

export function pmGhtHt2Block(healthType) {
  /* 0x007caa53 cmp eax,2 ; je 0x7caa85. */
  return asI32(healthType) === 2 ? 1 : 0;
}

export function pmGhtChar11Block(charType13c0) {
  /* 0x007caa58 cmp edx,0x11 ; je 0x7caa85 — SETTLED char, full dword. */
  return asU32(charType13c0) === PM_GHT_WALK_CHAR_11 ? 1 : 0;
}

export function pmGhtTruncHalf(limit) {
  /* 0x007caa6a cdq ; sub eax,edx ; sar eax,1 — trunc-toward-zero halve. */
  return ubhTruncHalf(asI32(limit));
}

export function pmGhtHalfLeft(v1340, v1d88) {
  /* 0x007caa75 lea ecx,[ecx+edx*2] ; sar ecx,1 — 32-bit wrap sum,
     ARITHMETIC shift (floor, NOT trunc-half). */
  return asI32(asU32(v1340) + 2 * asU32(v1d88)) >> 1;
}

export function pmGhtRoomLt(halfLeft, halfRight) {
  /* 0x007caa7a cmp ecx,eax ; jge — SIGNED less-than keeps al=1. */
  return asI32(halfLeft) < asI32(halfRight) ? 1 : 0;
}

function ghtFill({ walked = 0, term = 1, hops28 = 0, hops11 = 0, ht = 0,
                   char11Gate = 0, limit = 0, halfLeft = 0, halfRight = 0,
                   result = 0, retVa = 0 }) {
  return {
    walkedAddr: walked >>> 0, walkTerminated: term | 0,
    hops28: hops28 | 0, hops11: hops11 | 0, healthType: ht | 0,
    char11Gate: char11Gate | 0, limit: limit | 0,
    halfLeft: halfLeft | 0, halfRight: halfRight | 0,
    result: result | 0, retVa: retVa >>> 0,
  };
}

export function pmGhtPlan({ players = new Map(), startAddr = 0, gameAddr = 0,
                            game26614 = 0, walkCap = 32, null78 = 0,
                            null79 = 0, has26bChar1 = 0, gullet = 0,
                            has26bCharE = 0, has1f5 = 0 } = {}) {
  const g = asI32(game26614);
  if (pmGhtHardGate(g)) {
    const p = players.get(asU32(startAddr)) || {};
    const hard = pmGhtHardResult(asI32(p.v1340 ?? 0));
    return ghtFill({ walked: startAddr, result: hard,
                     retVa: PM_GHT_VA_RET_HARD });
  }
  /* Soft path: walk both hop kinds, settle. */
  let cur = asU32(startAddr);
  let hops28 = 0, hops11 = 0, steps = 0;
  let walked = 1;
  for (;;) {
    const p = players.get(cur) || { char: 0, twin1e68: 0, twin1d98: 0 };
    const ch = asU32(p.char);
    if (ch === PM_GHT_WALK_CHAR_28) {
      const t = asU32(p.twin1e68 || 0);
      if (t === 0) break;
      if (steps >= walkCap) { walked = 0; break; }
      hops28 += 1; steps += 1; cur = t; continue;
    }
    if (ch === PM_GHT_WALK_CHAR_11) {
      const t = asU32(p.twin1d98 || 0);
      if (t === 0) break;
      if (steps >= walkCap) { walked = 0; break; }
      hops11 += 1; steps += 1; cur = t; continue;
    }
    break;
  }
  if (walked === 0) {
    return ghtFill({ term: 0, hops28, hops11 });
  }
  const p = players.get(cur) || { char: 0, v1340: 0, v1d88: 0 };
  const ch = asU32(p.char);
  const ht = pmEpGetHealthType(ch);
  if (pmGhtHt2Block(ht)) {
    return ghtFill({ walked: cur, hops28, hops11, ht,
                     retVa: PM_GHT_VA_RET_ZERO });
  }
  const char11 = pmGhtChar11Block(ch);
  if (char11) {
    return ghtFill({ walked: cur, hops28, hops11, ht, char11Gate: 1,
                     retVa: PM_GHT_VA_RET_ZERO });
  }
  /* GetHealthLimit(false) on the settled player — GHL law by reference,
     keeper=false. */
  const ghl = pmGhlPlan({
    game26614: g,
    v2c: asI32(p.v2c ?? 0),
    char1: ch, char2: ch, char3: ch, char4: ch,
    keeper: 0,
    null78, null79, has26bChar1, gullet7ce390: gullet, has26bCharE, has1f5,
    coins1368: asI32(p.coins1368 ?? 0),
    v1da0: asI32(p.v1da0 ?? 0),
  });
  const limit = asI32(ghl.result);
  const halfLeft = pmGhtHalfLeft(asI32(p.v1340 ?? 0), asI32(p.v1d88 ?? 0));
  const halfRight = pmGhtTruncHalf(limit);
  const result = pmGhtRoomLt(halfLeft, halfRight);
  return ghtFill({ walked: cur, hops28, hops11, ht, limit, halfLeft,
                   halfRight, result,
                   retVa: result ? PM_GHT_VA_RET_ONE : PM_GHT_VA_RET_ZERO });
}

/* ===================================================================== */
/* v23 — BTT: VA 0x007caaa0 bit-test sibling (address-stable, NO exact   */
/* ZHL). PURE: 0 stores, 0 indirect, 0 E8. Signed count gate on          */
/* [player+0x1d88], then bit-test [player+0x1d8c] with 1 << (bit & 31).  */
/* ret 4 (__thiscall, one 4-byte stack arg). Bool in al.                 */
/* PE 0x007caaa0..0x007caac9, two `ret 4` at 0x007caac3 / 0x007caac9.    */
/* ===================================================================== */

export const PM_BTT_VA_BODY = 0x007caaa0;
export const PM_BTT_VA_RET_ONE = 0x007caac3;
export const PM_BTT_VA_RET_ZERO = 0x007caac9;
export const PM_BTT_BODY_BYTES = 42;
export const PM_BTT_CALLSITE_COUNT = 2;
export const PM_BTT_OFF_V1D88 = 0x1d88;
export const PM_BTT_OFF_BITS_1D8C = 0x1d8c;
export const PM_BTT_SHIFT_MOD = 31;
export const PM_BTT_ARGBYTES = 4;

export function pmBttCountGate(v1d88) {
  /* 0x007caaa5 cmp dword [edx+0x1d88],0 ; 0x007caaac jle 0x7caac6 —
     SIGNED: the bit test runs only while the count is > 0. */
  return asI32(v1d88) > 0 ? 1 : 0;
}

export function pmBttMask(bitIndex) {
  /* 0x007caab1 mov eax,1 ; 0x007caab6 shl eax,cl — x86 masks the shift
     count to CL & 31 (JS << auto-masks to 5 bits, same law). */
  return (1 << (asU32(bitIndex) & PM_BTT_SHIFT_MOD)) >>> 0;
}

export function pmBttBitHit(bits1d8c, bitIndex) {
  /* 0x007caab8 test dword [edx+0x1d8c],eax ; 0x007caabe je 0x7caac6 ;
     0x007caac0 mov al,1 — bool in al only. */
  return (asU32(bits1d8c) & pmBttMask(bitIndex)) !== 0 ? 1 : 0;
}

export function pmBttResult(v1d88, bits1d8c, bitIndex) {
  /* Whole 0x007caaa0 predicate: signed count gate first, then bit test. */
  return pmBttCountGate(v1d88) !== 0 && pmBttBitHit(bits1d8c, bitIndex) !== 0
    ? 1 : 0;
}

/* ===================================================================== */
/* v24 — TPD: VA 0x007caad0 Entity_Player::TryPreventDeath dispatch.      */
/* ret plain (__thiscall, self only). 7 direct rel32 callers (0x7604cb,   */
/* 0x762c6d, 0x777f94, 0x7a2062, 0x7c4fe3, 0x7c5b6c, 0x7ceba0). The       */
/* whole body is PURE up to the jump-table selection; the case BODIES     */
/* are host (0x7588a0 verified IMPURE — 4 E8 incl. host HasCollectible    */
/* 0x7706e0 + sibling 0x758d00; 0x758a70 2 stores + E8 0x7d2d40; default  */
/* case stores [0x134c]=1). This layer lands the gate + switch selection  */
/* + the per-case pure scalar guard decisions; host actions stay host.    */
/* Jump table [eax*4+0x7caba8]: 0->0x7cab3b CASE0, 1->0x7cab8d DEFAULT,   */
/* 2->0x7cab8d DEFAULT, 3->0x7cab15 CASE3, 4->0x7cab07 CASE4;             */
/* `cmp eax,4 ; ja 0x7cab8d` UNSIGNED over-range -> DEFAULT.              */
/* ===================================================================== */

export const PM_TPD_VA_BODY = 0x007caad0;
export const PM_TPD_VA_JUMP_TABLE = 0x007caba8;
export const PM_TPD_VA_CASE0 = 0x007cab3b;
export const PM_TPD_VA_CASE3 = 0x007cab15;
export const PM_TPD_VA_CASE4 = 0x007cab07;
export const PM_TPD_VA_DEFAULT = 0x007cab8d;
export const PM_TPD_VA_RET_FALSE = 0x007caba4;
export const PM_TPD_BODY_BYTES = 213;
export const PM_TPD_CALLSITE_COUNT = 7;
export const PM_TPD_CASE0 = 0;
export const PM_TPD_CASE3 = 3;
export const PM_TPD_CASE4 = 4;
export const PM_TPD_CASE_DEFAULT = 1;
export const PM_TPD_OFF_BONE_1D88 = 0x1d88;
export const PM_TPD_OFF_SOUL_1344 = 0x1344;
export const PM_TPD_OFF_ETERNAL_134C = 0x134c;
export const PM_TPD_OFF_FATAL_1340 = 0x1340;
export const PM_TPD_OFF_CHAR_13C0 = 0x13c0;
export const PM_TPD_GAME_FIELD_26614 = 0x26614;
export const PM_TPD_CHAR_12 = 0x12;
export const PM_TPD_FATAL_CMP = 2;
export const PM_TPD_DEFAULT_134C_VALUE = 1;
export const PM_TPD_HOST_VA_HALF = 0x007588a0;
export const PM_TPD_HOST_VA_APPLY = 0x00758a70;
export const PM_TPD_HOST_VA_GLOBAL_FATAL = 0x007dd380;
export const PM_TPD_C0_ELSE_GE2 = 8;
export const PM_TPD_C0_ELSE_LT2 = 1;

export function pmTpdGate(v1d88, v1344, v134c) {
  /* 0x007caada mov eax,[esi+0x1d88]; add eax,[esi+0x1344];
     0x007caae6 add eax,[esi+0x134c]; 0x007caaec jne 0x7cab9e —
     ZF from the LAST add: proceed (dispatch) iff the wrapped 32-bit
     sum of bone+soul+eternal hearts is exactly 0. */
  return ((asU32(v1d88) + asU32(v1344) + asU32(v134c)) >>> 0) === 0 ? 1 : 0;
}

export function pmTpdCase(healthType) {
  /* 0x007caaf7 cmp eax,4; 0x007caafa ja 0x7cab8d (UNSIGNED over-range ->
     DEFAULT); 0x007cab00 jmp [eax*4+0x7caba8]. Table 0..4 -> CASE0,
     DEFAULT, DEFAULT, CASE3, CASE4. Negative health types wrap unsigned
     (>4) and take DEFAULT. */
  const u = asU32(healthType);
  if (u > 4) {
    return PM_TPD_CASE_DEFAULT;
  }
  return [PM_TPD_CASE0, PM_TPD_CASE_DEFAULT, PM_TPD_CASE_DEFAULT,
          PM_TPD_CASE3, PM_TPD_CASE4][u];
}

export function pmTpdCase0IsChar12(v13c0) {
  /* 0x007cab3b cmp dword [esi+0x13c0],0x12 ; 0x007cab48 jne 0x7cab6c —
     FULL-DWORD compare (char type == 0x12 splits CASE0). */
  return asU32(v13c0) === PM_TPD_CHAR_12 ? 1 : 0;
}

export function pmTpdFatalLt2(fatal1340) {
  /* 0x007cab1c (CASE3) cmp [esi+0x1340],2 ; jge 0x7cab27 and
     0x007cab4d (CASE0-char12) jge 0x7cab58 — SIGNED: the host 0x7588a0
     half-heart call runs only while fatal < 2. */
  return asI32(fatal1340) < PM_TPD_FATAL_CMP ? 1 : 0;
}

export function pmTpdCase0FatalLe0(fatal1340) {
  /* 0x007cab6e (CASE0-else) test eax,eax ; 0x007cab6e jle 0x7cab8d —
     SIGNED: fatal <= 0 falls to the DEFAULT body (store [0x134c]=1). */
  return asI32(fatal1340) <= 0 ? 1 : 0;
}

export function pmTpdCase0ElseFatal(game26614) {
  /* CASE0-else 0x007cab79 mov ecx,1 ; call 0x7dd380. The callee is a
     PURE leaf (0 stores, 0 E8): mov eax,[0xc71678]; cmp [eax+0x26614],2;
     lea eax,[ecx*8] (unconditional); jge ret (game >= 2 -> 1*8); mov
     eax,ecx (game < 2 -> 1). Callsite folds ecx=1, so the CASE0-else
     fatal argument is game26614 >= 2 (SIGNED jge) ? 8 : 1. */
  return asI32(game26614) >= 2 ? PM_TPD_C0_ELSE_GE2 : PM_TPD_C0_ELSE_LT2;
}

/* =====================================================================
 * v25 — GF: VA 0x007dd380 global-fatal scale leaf WHOLE (general-ecx).
 * PURE (17 insns, 0 E8 / 0 indirect / 0 stores). mov eax,[0xc71678] ;
 * cmp [eax+0x26614],2 ; lea eax,[ecx*8] (UNCONDITIONAL, 32-bit wrap) ;
 * jge ret ; mov eax,ecx ; ret. Law: game[0x26614] >= 2 (SIGNED jge) ?
 * ecx*8 : ecx. 21 direct E8 callers; ecx is a real variable (e.g.
 * 0x7ce5a1 add ecx,ecx ; 0x7da944 lea ecx,[edi+1]). The PE loads
 * [0x26614] via [0xc71678] (game-instance global); the loaded field is
 * passed as game26614 like every other byte-gate/dword gate in the
 * family.
 * ===================================================================== */
export const PM_GF_VA_BODY = 0x007dd380;
export const PM_GF_VA_RET = 0x007dd397;
export const PM_GF_BODY_BYTES = 24;
export const PM_GF_CALLSITE_COUNT = 21;
export const PM_GF_GAME_GLOBAL_VA = 0x00c71678;
export const PM_GF_GAME_FIELD = 0x26614;
export const PM_GF_CMP = 2;
export const PM_GF_SCALE = 8;
export const PM_GF_SCALE_SHIFT = 3;

export function pmGlobalFatalScale(game26614, ecx) {
  /* 0x007dd385 cmp dword ptr [eax + 0x26614], 2 ; 0x007dd393 jge
     0x7dd397 (SIGNED >= 2 keeps eax = ecx*8); 0x007dd395 mov eax,ecx
     (game < 2). The lea [ecx*8] executes unconditionally and wraps
     32-bit (Math.imul). */
  return asI32(game26614) >= 2 ? Math.imul(asI32(ecx), PM_GF_SCALE)
                               : asI32(ecx);
}

/* =====================================================================
 * v26 — BF: VA 0x007db0a0 flag/effect decision island (NARROWED).
 * thiscall, ret plain; 73 insns, 2 E8 (0x7cb6e0 count resolver + 
 * 0x930220 effect add — both typed PM host events, bodies stay host),
 * 1 observable store (byte [this+0x1eec]). Laws from the instruction
 * stream (dump 007db0a0.txt):
 *   count = countResolver(this, 0x79)              [HOST sample]
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2        (sub/je chain)
 *   flag  = byte [this + 0x1eec]
 *   delta = SIGNED max(0, mapped - (flag & 0xf))    (cmovs clamp)
 *   delta == 0 -> early epilogue (NO store, NO host)
 *   size  = ((end - begin) & ~3) from [game+0x2a404..0x2a408]
 *   host 0x930220(this+0x1508, &buf16, 1, 1) iff
 *     SIGNED size > 0x4e4 && slot = [begin+0x4e4] != 0
 *   new_flag = ((flag & 0xf0) + 0x10) | (flag & 0xf), byte-rounded
 *     (8-bit add wraps: 0xf0 + 0x10 -> 0x00); STORED iff delta != 0.
 * ===================================================================== */
export const PM_BF_VA_BODY = 0x007db0a0;
export const PM_BF_VA_RET = 0x007db152;
export const PM_BF_BODY_BYTES = 179;
export const PM_BF_CALLSITE_COUNT = 3;
export const PM_BF_COUNT_ID = 0x79;
export const PM_BF_FLAG_OFF = 0x1eec;
export const PM_BF_GAME_GLOBAL_VA = 0x00c7169c;
export const PM_BF_VEC_BEGIN_OFF = 0x2a404;
export const PM_BF_VEC_END_OFF = 0x2a408;
export const PM_BF_SIZE_CMP = 0x4e4;
export const PM_BF_SLOT_OFF = 0x4e4;
export const PM_BF_RECEIVER_OFF = 0x1508;
export const PM_BF_HOST_VA_COUNT = 0x007cb6e0;
export const PM_BF_HOST_VA_EFFECT = 0x00930220;
export const PM_BF_FLAG_INC = 0x10;

export function pm7db0a0MapCount(count) {
  return asI32(count) === 0 ? 0 : asI32(count) === 1 ? 1 : 2;
}

export function pm7db0a0Delta(count, flag) {
  const mapped = pm7db0a0MapCount(count);
  const delta = mapped - (asU32(flag) & 0xf);
  return delta < 0 ? 0 : delta;
}

export function pm7db0a0Proceed(count, flag) {
  return pm7db0a0Delta(count, flag) !== 0 ? 1 : 0;
}

export function pm7db0a0SizeGate(begin, end) {
  const size = (asU32(end) - asU32(begin)) & 0xfffffffc;
  return asI32(size) > PM_BF_SIZE_CMP ? 1 : 0;
}

export function pm7db0a0HostNeeded(begin, end, slot) {
  return pm7db0a0SizeGate(begin, end) !== 0 && asU32(slot) !== 0 ? 1 : 0;
}

export function pm7db0a0FlagNext(flag) {
  const high = (asU32(flag) & 0xf0) + PM_BF_FLAG_INC;
  return ((high & 0xff) | (asU32(flag) & 0xf)) >>> 0;
}

/* =====================================================================
 * v27 — BQ: VA 0x007db160 small-host decision island (NARROWED), the
 * body directly AFTER the v26 0x7db0a0 island in the 0x7db0xx queue
 * band. thiscall, ret plain; 124 insns, 4 E8 (0x7cb6e0 count resolver,
 * 0x9303f0 effect add, 0x75d850 RemoveCostume x2 — all stay host),
 * 1 observable store (byte [this+0x1eec]). Laws from the instruction
 * stream (dump disasm-007db160.txt):
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2         (sub/je chain)
 *   delta  = SIGNED max(0, mapped - (flag & 0xf))      (cmovs clamp)
 *   high   = (flag & 0xff) >> 4
 *   UNSIGNED high <= delta -> skip loop (store no-op == flag)
 *   else loopCount = high - delta iterations; per-iteration gates:
 *     size = ((end - begin) & ~3); SIGNED size > 0x4e4 drives BOTH the
 *       0x9303f0 effect call gate (0x7db1dc) AND the 0x75d850 arg
 *       selection (0x7db279)
 *   stored byte = (delta << 4) | (reloaded_flag & 0xf) on the run path
 *     (bl=delta after the loop; cl = flag RELOADED at 0x7db2a6 AFTER
 *     all host calls — post-call recapture), == flag on the skip path.
 * ===================================================================== */
export const PM_BQ_VA_BODY = 0x007db160;
export const PM_BQ_VA_RET = 0x007db2c0;
export const PM_BQ_BODY_BYTES = 352;
export const PM_BQ_CALLSITE_COUNT = 3;
export const PM_BQ_COUNT_ID = 0x79;
export const PM_BQ_FLAG_OFF = 0x1eec;
export const PM_BQ_GAME_GLOBAL_VA = 0x00c7169c;
export const PM_BQ_VEC_BEGIN_OFF = 0x2a404;
export const PM_BQ_VEC_END_OFF = 0x2a408;
export const PM_BQ_SIZE_CMP = 0x4e4;
export const PM_BQ_SLOT_OFF = 0x4e4;
export const PM_BQ_RECEIVER_OFF = 0x1508;
export const PM_BQ_WALK_GATE_OFF = 0x1519;
export const PM_BQ_WALK_BEGIN_OFF = 0x150c;
export const PM_BQ_WALK_END_OFF = 0x1510;
export const PM_BQ_WALK_STRIDE = 0x10;
export const PM_BQ_WALK_ID_CMP = 0x139;
export const PM_BQ_HOST_VA_COUNT = 0x007cb6e0;
export const PM_BQ_HOST_VA_EFFECT = 0x009303f0;
export const PM_BQ_HOST_VA_REMOVE_COSTUME = 0x0075d850;

export function pm7db160MapCount(count) {
  return asI32(count) === 0 ? 0 : asI32(count) === 1 ? 1 : 2;
}

export function pm7db160Delta(count, flag) {
  const mapped = pm7db160MapCount(count);
  const delta = mapped - (asU32(flag) & 0xf);
  return delta < 0 ? 0 : delta;
}

export function pm7db160RunLoop(flag, delta) {
  const high = (asU32(flag) & 0xff) >> 4;
  return high > (delta >>> 0) ? 1 : 0;
}

export function pm7db160LoopCount(flag, delta) {
  return (((asU32(flag) & 0xff) >> 4) - (delta >>> 0)) >>> 0;
}

export function pm7db160SizeGate(begin, end) {
  const size = (asU32(end) - asU32(begin)) & 0xfffffffc;
  return asI32(size) > PM_BQ_SIZE_CMP ? 1 : 0;
}

export function pm7db160EffectHostNeeded(begin, end, slot) {
  return pm7db160SizeGate(begin, end) !== 0 && asU32(slot) !== 0 ? 1 : 0;
}

export function pm7db160FlagStore(count, flag, reloadedFlag) {
  const high = (asU32(flag) & 0xff) >> 4;
  const delta = pm7db160Delta(count, flag);
  if (high <= delta) {
    /* Skip path: store == original flag byte (pre-loop load). */
    return asU32(flag) & 0xff;
  }
  return (((delta & 0xf) << 4) | (asU32(reloadedFlag) & 0xf)) >>> 0;
}

/* =====================================================================
 * v28 — BR: VA 0x007db2d0 small-host advance island (NARROWED), the
 * function the v27 header records as "next function 0x007db2d0"
 * (0x7db200 lies INSIDE the landed v27 0x7db160 body — stale note).
 * thiscall, ret plain; 41 insns, 1 E8 (0x7cb6e0 count resolver —
 * host), 1 observable store (byte [this+0x1eec] at 0x7db31f), 2 rets
 * (0x7db328 returned 1, 0x7db32c returned 0).  Laws from the
 * instruction stream (dump disasm-007db2d0.txt), 1 direct E8 caller
 * (0x774114):
 *   count  = countResolver(this, 0x79)              [HOST sample]
 *   mapped = count==0 ? 0 : count==1 ? 1 : 2          (sub/je chain)
 *   flag   = byte [this + 0x1eec] (ONE load, NO recapture: the only
 *     host call precedes the load; no host call between load and store)
 *   delta  = SIGNED max(0, mapped - (flag & 0xf))      (cmovs clamp)
 *   delta == 0 -> return 0, NO store
 *   else new_flag = ((((flag&0xff)>>4) - 1) & 0xf) << 4
 *                    | (((flag&0xff) + 1) & 0xf)      (8-bit wrap on
 *     BOTH nibbles); STORED; return 1
 *   effective byte = proceed ? advance : flag
 * ===================================================================== */
export const PM_BR_VA_BODY = 0x007db2d0;
export const PM_BR_VA_RET_ONE = 0x007db328;
export const PM_BR_VA_RET_ZERO = 0x007db32c;
export const PM_BR_BODY_BYTES = 92;
export const PM_BR_CALLSITE_COUNT = 1;
export const PM_BR_COUNT_ID = 0x79;
export const PM_BR_FLAG_OFF = 0x1eec;
export const PM_BR_HOST_VA_COUNT = 0x007cb6e0;
export const PM_BR_CALLER_VA = 0x00774114;

export function pm7db2d0MapCount(count) {
  return asI32(count) === 0 ? 0 : asI32(count) === 1 ? 1 : 2;
}

export function pm7db2d0Delta(count, flag) {
  const mapped = pm7db2d0MapCount(count);
  const delta = mapped - (asU32(flag) & 0xf);
  return delta < 0 ? 0 : delta;
}

export function pm7db2d0Proceed(count, flag) {
  return pm7db2d0Delta(count, flag) !== 0 ? 1 : 0;
}

export function pm7db2d0FlagAdvance(flag) {
  /* 8-bit wrap on BOTH nibbles: high 0 -> dec -> 0xff -> shl 4 -> 0xf0;
     low 0xf -> inc 0x00 -> & 0xf -> 0.  asU32 first so the byte narrow
     is explicit (no uint8_t param; uint32_t + & 0xff in the body). */
  const high = (asU32(flag) & 0xff) >> 4;
  const low = asU32(flag) & 0xff;
  return (((((high - 1) & 0xf) << 4) | ((low + 1) & 0xf)) & 0xff) >>> 0;
}

export function pm7db2d0FlagStore(count, flag) {
  /* proceed ? advance : flag — the effective byte after the call
     (delta == 0 epilogue at 0x7db329 does NOT touch [this+0x1eec]). */
  if (pm7db2d0Proceed(count, flag) === 0) {
    return asU32(flag) & 0xff;
  }
  return pm7db2d0FlagAdvance(flag);
}

/* =====================================================================
 * v29 — BS: VA 0x007db330 scale island (NARROWED). __stdcall ret 4;
 * 19 insns, 0 E8, 0 indirect, 0 mem-stores, 2 rets (0x7db355 SCALED,
 * 0x7db35b RAW). prologue mov eax,[0xc71678] ; cmp [eax+0x26614],2 ;
 * jl RAW — SIGNED mode < 2 returns the arg unchanged. Scale path:
 * mov eax,1 ; shr ecx,3 (LOGICAL) ; cmp edx,0x10 ; cmovge eax,ecx
 * (SIGNED) -> (int32)arg >= 0x10 ? (arg >>> 3) : 1. 6 direct E8
 * callers (0x7741ac/0x7741d4/0x774277 in the 0x7740d0 band +
 * 0x778656/0x7787bd/0x7787ed in the 0x778xxx band), all feeding the
 * PM [edi+0x13bc] slot count. Full-dword only — no byte narrow.
 * ===================================================================== */
export const PM_BS_VA_BODY = 0x007db330;
export const PM_BS_VA_RET_SCALED = 0x007db355;
export const PM_BS_VA_RET_RAW = 0x007db35b;
export const PM_BS_BODY_BYTES = 43;
export const PM_BS_CALLSITE_COUNT = 6;
export const PM_BS_CALLER0_VA = 0x007741ac;
export const PM_BS_CALLER1_VA = 0x007741d4;
export const PM_BS_CALLER2_VA = 0x00774277;
export const PM_BS_CALLER3_VA = 0x00778656;
export const PM_BS_CALLER4_VA = 0x007787bd;
export const PM_BS_CALLER5_VA = 0x007787ed;
export const PM_BS_GAME_GLOBAL_VA = 0x00c71678;
export const PM_BS_MODE_OFF = 0x26614;
export const PM_BS_MODE_CMP = 2;
export const PM_BS_SCALE_SHIFT = 3;
export const PM_BS_MIN_ARG = 0x10;

export function pm7db330ModeGe2(mode) {
  /* 0x007db33b cmp [eax+0x26614],2 ; 0x007db342 jl 0x7db358 — SIGNED:
     (int32)mode < 2 chains to the raw epilogue (arg unchanged). */
  return (mode | 0) >= 2 ? 1 : 0;
}

export function pm7db330Scale(arg) {
  /* 0x007db344 mov ecx,edx ; 0x007db346 mov eax,1 ; 0x007db34b shr
     ecx,3 ; 0x007db34e cmp edx,0x10 ; 0x007db351 cmovge eax,ecx.
     shr is LOGICAL (>>>), cmovge is SIGNED ((arg | 0) >= 0x10). */
  return (arg | 0) >= 0x10 ? (arg >>> 3) >>> 0 : 1;
}

export function pm7db330Value(arg, mode) {
  /* Whole body: the mode gate selects the raw (mov eax,edx at
     0x7db358) or the scaled epilogue. */
  return pm7db330ModeGe2(mode) === 0 ? arg >>> 0 : pm7db330Scale(arg);
}

/* =====================================================================
 * v30 — BT: VA 0x007db360 soul/fatal ratio-window island (NARROWED).
 * thiscall, plain ret, ZERO stack args, bool in al. 26 insns, 0 E8,
 * 0 indirect, 0 mem-stores, 3 rets (0x7db3a2 ONE, 0x7db3a5 ZERO,
 * 0x7db3ac EQ2). prologue mov eax,[0xc71678] ; mov edx,[ecx+0x1344]
 * (soul) ; cmp [eax+0x26614],2 ; jl EQ2 — SIGNED mode < 2 returns
 * soul == 2. Window path: cvtdq2ps SIGNED converts of soul/fatal
 * ([0x1344]/[0x1340]), divss, comiss r,[0xbaa120=0.1f] jb -> 0 (LESS
 * OR UNORDERED — NaN 0/0 lands here), comiss [0xbaa1f8=0.3f],r jb ->
 * 0 (0.3f < r — +inf exits here); ordered INCLUSIVE 0.1f <= r <= 0.3f
 * keeps 1. Same comiss pair + same constants as pmUrhDAddBand. 2
 * direct E8 callers (0x797be5, 0x7a8afd — PM effect bands, both
 * `mov ecx,edi ; call`, al tested). Full-dword only — no byte narrow.
 * ===================================================================== */
export const PM_BT_VA_BODY = 0x007db360;
export const PM_BT_VA_RET_ONE = 0x007db3a2;
export const PM_BT_VA_RET_ZERO = 0x007db3a5;
export const PM_BT_VA_RET_EQ2 = 0x007db3ac;
export const PM_BT_BODY_BYTES = 76;
export const PM_BT_CALLSITE_COUNT = 2;
export const PM_BT_CALLER0_VA = 0x00797be5;
export const PM_BT_CALLER1_VA = 0x007a8afd;
export const PM_BT_GAME_GLOBAL_VA = 0x00c71678;
export const PM_BT_MODE_OFF = 0x26614;
export const PM_BT_MODE_CMP = 2;
export const PM_BT_SOUL_OFF = 0x1344;
export const PM_BT_FATAL_OFF = 0x1340;
export const PM_BT_EQ2 = 2;
export const PM_BT_F32_LO_BITS = 0x3dcccccd;
export const PM_BT_F32_LO_VA = 0x00baa120;
export const PM_BT_F32_HI_BITS = 0x3e99999a;
export const PM_BT_F32_HI_VA = 0x00baa1f8;

export function pm7db360ModeGe2(mode) {
  /* 0x007db36b cmp [eax+0x26614],2 ; 0x007db372 jl 0x7db3a6 — SIGNED:
     (int32)mode < 2 chains to the EQ2 epilogue. */
  return (mode | 0) >= 2 ? 1 : 0;
}

export function pm7db360RatioBits(soul, fatal) {
  /* 0x007db37c movd xmm1,edx ; 0x007db380 cvtdq2ps xmm1,xmm1 ;
     0x007db383 cvtdq2ps xmm0,xmm0 ; 0x007db386 divss xmm1,xmm0 —
     SIGNED int32->f32 converts, single-precision round-to-nearest
     division (same computation as pmUrhRatioBits, operand order
     soul/fatal). */
  return f32ToBits(Math.fround(Math.fround(asI32(soul)) /
                               Math.fround(asI32(fatal))));
}

export function pm7db360Window(soul, fatal) {
  /* 0x007db38a comiss r,[0.1f] / jb . 0 (LESS OR UNORDERED — NaN 0/0
     lands here, exactly like the PE); 0x007db39b comiss [0.3f],r /
     jb . 0 (0.3f < r — +inf exits here); ordered INCLUSIVE
     0.1f <= r <= 0.3f keeps 1. */
  const r = Math.fround(Math.fround(asI32(soul)) / Math.fround(asI32(fatal)));
  if (!(r >= f32FromBits(PM_BT_F32_LO_BITS))) {
    return 0; /* jb 1: NaN lands here, exactly like the PE */
  }
  if (f32FromBits(PM_BT_F32_HI_BITS) < r) {
    return 0; /* jb 2 */
  }
  return 1;
}

export function pm7db360Eq2(soul) {
  /* 0x007db3a6 cmp edx,2 ; 0x007db3a9 sete al — FULL-DWORD equality
     (signed/unsigned agree), the mode < 2 fallback epilogue. */
  return soul === PM_BT_EQ2 ? 1 : 0;
}

export function pm7db360Value(soul, fatal, mode) {
  /* Whole body: mode < 2 (SIGNED jl at 0x7db372) -> the EQ2 epilogue
     0x7db3a6; mode >= 2 -> the window epilogues 0x7db3a2/0x7db3a5.
     soul is read ONCE (mov edx,[ecx+0x1344] before the mode cmp) and
     feeds BOTH paths — no recapture. */
  return pm7db360ModeGe2(mode) === 0
    ? pm7db360Eq2(soul)
    : pm7db360Window(soul, fatal);
}

/* =====================================================================
 * v31 — BU: VA 0x007db3b0 revive-queue body (NARROWED). thiscall,
 * plain ret, ZERO stack args, VOID return. 245 insns, 1 ret
 * (0x007db699); MSVC SEH frame + cookie, unwind tail [0xb18894]
 * @0x7db69a; int3 pad 0x7db6a0..0x7db6ad; next function 0x7db6b0.
 * 1 direct E8 caller (0x73f3c6 — per-player loop in a room-wide
 * teardown/revive pass; PM-band host). g_Game [0xc71678] +
 * Game+0x18300 + 0x1218 + the 0x41af60 fill stay host; the five
 * decision laws are in-module. BYTE gates: byte [this+0x172] and
 * byte [this+0x170] both non-zero -> proceed (cmp byte ptr / je
 * epilogue at 0x7db3da/0x7db3e7) — engage() masks & 0xff. Walk
 * filter: entry != 0 && [entry+0x28] == 3 && [entry+0x410] == this
 * (FULL dword; virtual [eax+0x28] hit is host). Char machine:
 * [edi+0x13c0] FULL-DWORD sub-dispatch 0x26 -> store 0x1d, 0x27 ->
 * store 0x25, else unchanged; no host between read and store. Node
 * pick: twinA-first + 0x20dc (32-bit wrap), 0 when both null.
 * Transfer gate: local0 != local1 (FULL dword) runs the loop.
 * ===================================================================== */
export const PM_BU_VA_BODY = 0x007db3b0;
export const PM_BU_VA_RET = 0x007db699;
export const PM_BU_BODY_BYTES = 745;
export const PM_BU_CALLSITE_COUNT = 1;
export const PM_BU_CALLER0_VA = 0x0073f3c6;
export const PM_BU_E8_COUNT = 9;
export const PM_BU_INDIRECT_COUNT = 3;
export const PM_BU_STORE_COUNT = 50;
export const PM_BU_GATE_172_OFF = 0x172;
export const PM_BU_GATE_170_OFF = 0x170;
export const PM_BU_TYPE_OFF = 0x28;
export const PM_BU_TYPE_CMP = 3;
export const PM_BU_OWNER_OFF = 0x410;
export const PM_BU_CHAR_OFF = 0x13c0;
export const PM_BU_CHAR_26 = 0x26;
export const PM_BU_CHAR_27 = 0x27;
export const PM_BU_CHAR_26_NEW = 0x1d;
export const PM_BU_CHAR_27_NEW = 0x25;
export const PM_BU_TWIN_A_OFF = 0x1e68;
export const PM_BU_TWIN_B_OFF = 0x1e6c;
export const PM_BU_NODE_OFF = 0x20dc;

export function pm7db3b0Engage(flag172, flag170) {
  /* 0x007db3da cmp byte ptr [edi+0x172],0 / je 0x7db688 ;
     0x007db3e7 cmp byte ptr [edi+0x170],0 / je 0x7db688 — BYTE
     gates: both non-zero proceeds past the prologue. */
  if ((flag172 & 0xff) === 0) {
    return 0;
  }
  if ((flag170 & 0xff) === 0) {
    return 0;
  }
  return 1;
}

export function pm7db3b0EntryMatch(entry, type28, owner410, self) {
  /* 0x007db437 test ecx,ecx / je ; 0x007db43b cmp dword
     [ecx+0x28],3 / jne ; 0x007db441 cmp dword [ecx+0x410],edi /
     jne — FULL DWORD filter before the walk-hit virtual. */
  return (entry >>> 0) !== 0 &&
      (type28 >>> 0) === PM_BU_TYPE_CMP &&
      (owner410 >>> 0) === (self >>> 0)
    ? 1
    : 0;
}

export function pm7db3b0CharNext(cur) {
  /* 0x007db4b9 mov eax,[edi+0x13c0] ; sub eax,0x26 / je -> store
     0x1d ; sub eax,1 / jne -> unchanged ; else store 0x25. FULL
     DWORD exact dispatch — 0x126/0x127 do NOT match. */
  const c = cur >>> 0;
  if (c === PM_BU_CHAR_26) {
    return PM_BU_CHAR_26_NEW;
  }
  if (c === PM_BU_CHAR_27) {
    return PM_BU_CHAR_27_NEW;
  }
  return c;
}

export function pm7db3b0NodeAddr(twinA, twinB) {
  /* 0x007db470 mov eax,[edi+0x1e68] ; test / jne pick ;
     0x007db47f mov eax,[edi+0x1e6c] ; test / je none ;
     0x007db48c add eax,0x20dc — twinA-first, +0x20dc 32-bit wrap,
     0 when both null (je skips the add). */
  let picked = twinA >>> 0;
  if (picked === 0) {
    picked = twinB >>> 0;
  }
  if (picked === 0) {
    return 0;
  }
  return (picked + PM_BU_NODE_OFF) >>> 0;
}

export function pm7db3b0LoopNeeded(local0, local1) {
  /* 0x007db57f mov eax,[ebp-0x18] ; 0x007db584 cmp eax,[ebp-0x10] ;
     0x007db587 je 0x7db61a — FULL-DWORD local0 != local1 runs the
     transfer loop + sized delete + node reviver. */
  return (local0 >>> 0) !== (local1 >>> 0) ? 1 : 0;
}

/* =====================================================================
 * v32 — BV: VA 0x007da770 char+collectible bool gate (NARROWED), the
 * FIRST caller-bearing unlanded body of the band net-audit. thiscall,
 * plain ret, ZERO stack args, bool in al. 13 insns, 2 rets
 * (0x007da792 ONE / 0x007da795 ZERO); 1 E8 (0x7706e0
 * Entity_Player::HasCollectible(this, 0x26b, false) — typed host
 * sample, stays host); 0 indirect; 0 obj stores. int3 pad
 * 0x7da796..0x7da79f; next function 0x7da7a0. 2 direct E8 callers
 * (0x77099b char gate consumed directly; 0x785681 inverse-polarity
 * gate). char dispatch: dword [this+0x13c0] cmp 3 / je host ; cmp
 * 0xc / jne ZERO — FULL-DWORD exact, high bits never match. The host
 * bool is tested BYTE-wise (test al,al / je ZERO ; mov al,1) — the
 * body's ONLY byte gate, & 0xff on `has`.
 * ===================================================================== */
export const PM_BV_VA_BODY = 0x007da770;
export const PM_BV_VA_RET_ONE = 0x007da792;
export const PM_BV_VA_RET_ZERO = 0x007da795;
export const PM_BV_BODY_BYTES = 37;
export const PM_BV_CALLSITE_COUNT = 2;
export const PM_BV_CALLER0_VA = 0x0077099b;
export const PM_BV_CALLER1_VA = 0x00785681;
export const PM_BV_E8_COUNT = 1;
export const PM_BV_INDIRECT_COUNT = 0;
export const PM_BV_STORE_COUNT = 0;
export const PM_BV_HAS_COLLECTIBLE_VA = 0x007706e0;
export const PM_BV_COLLECTIBLE_ID = 0x26b;
export const PM_BV_CHAR_OFF = 0x13c0;
export const PM_BV_CHAR_A = 3;
export const PM_BV_CHAR_B = 0xc;

export function pm7da770CharGate(char13c0) {
  /* 0x007da776 cmp eax,3 / je host ; 0x007da77b cmp eax,0xc / jne
     ZERO — FULL-DWORD equality dispatch, exact 3/0xc. */
  const c = char13c0 >>> 0;
  return c === PM_BV_CHAR_A || c === PM_BV_CHAR_B ? 1 : 0;
}

export function pm7da770Value(char13c0, has) {
  /* 0x007da78c test al,al / je ZERO ; mov al,1 — the host bool is
     tested BYTE-wise (the body's ONLY byte gate), so `has` is
     masked & 0xff in-module (v9 rule). */
  if (pm7da770CharGate(char13c0) === 0) {
    return 0;
  }
  return (has & 0xff) !== 0 ? 1 : 0;
}

/* =====================================================================
 * v33 — BW: VA 0x007db6b0 Entity_Player::HasInstantDeathCurse (exact
 * ZHL, wave-20 C5), the v31-declared frontier. FULLY PURE: 36 insns,
 * E8 0, indirect 0, stores 0 — the whole body lands in-module, zero
 * host leaves, zero g_Game/global access. thiscall, plain ret, bool
 * in al (2 rets 0x7db6f0 ZERO / 0x7db6f1 ONE; sampled callers
 * consume `test al, al` only). 14 direct rel32 callers (0x6b6250,
 * 0x6cd4c7, 0x6e8409, 0x6e863d, 0x7106dd, 0x777ea1, 0x78ab38,
 * 0x7c40ee, 0x7c4136, 0x81654d, 0x816621, 0x844277, 0x983b8d,
 * 0x9beb69). Machine law: byte [this+0x1519] != 0 -> skip the list
 * scan (BYTE gate, the body's only one); scan entries begin/end
 * [this+0x150c]/[this+0x1510] stride 0x10 (same list fields as v27
 * BQ and the TD laws): obj[0] == 0 && obj[4] == 0x70 (FULL-DWORD,
 * the 0x70 sentinel) -> ONE; char [this+0x13c0] == 0x27 (FULL-DWORD,
 * post-merge — runs in EVERY case) -> ONE. Bounds
 * 0x007db6b0..0x007db6f4, 68 bytes; int3 pad 0x7db6f5..0x7db6ff;
 * next function 0x007db700 (B17 IsHologram, HOST).
 * ===================================================================== */
export const PM_BW_VA_BODY = 0x007db6b0;
export const PM_BW_VA_RET_ZERO = 0x007db6f0;
export const PM_BW_VA_RET_ONE = 0x007db6f1;
export const PM_BW_BODY_BYTES = 68;
export const PM_BW_CALLSITE_COUNT = 14;
export const PM_BW_CALLER0_VA = 0x006b6250;
export const PM_BW_CALLER1_VA = 0x006cd4c7;
export const PM_BW_CALLER2_VA = 0x006e8409;
export const PM_BW_CALLER3_VA = 0x006e863d;
export const PM_BW_CALLER4_VA = 0x007106dd;
export const PM_BW_CALLER5_VA = 0x00777ea1;
export const PM_BW_CALLER6_VA = 0x0078ab38;
export const PM_BW_CALLER7_VA = 0x007c40ee;
export const PM_BW_CALLER8_VA = 0x007c4136;
export const PM_BW_CALLER9_VA = 0x0081654d;
export const PM_BW_CALLER10_VA = 0x00816621;
export const PM_BW_CALLER11_VA = 0x00844277;
export const PM_BW_CALLER12_VA = 0x00983b8d;
export const PM_BW_CALLER13_VA = 0x009beb69;
export const PM_BW_E8_COUNT = 0;
export const PM_BW_INDIRECT_COUNT = 0;
export const PM_BW_STORE_COUNT = 0;
export const PM_BW_LIST_GATE_OFF = 0x1519;
export const PM_BW_LIST_BEGIN_OFF = 0x150c;
export const PM_BW_LIST_END_OFF = 0x1510;
export const PM_BW_LIST_ELEM_STRIDE = 0x10;
export const PM_BW_LIST_MATCH_TAG = 0;
export const PM_BW_LIST_MATCH_ID = 0x70;
export const PM_BW_CHAR_OFF = 0x13c0;
export const PM_BW_CHAR_CMP = 0x27;

export function pm7db6b0ScanSkipped(flag1519) {
  /* 0x007db6b3 cmp byte ptr [esi + 0x1519], 0 / jne skip — BYTE
     test, the body's only byte gate (v9: uint32 sample, & 0xff). */
  return (flag1519 & 0xff) !== 0 ? 1 : 0;
}

export function pm7db6b0ElemMatch(elemTag, elemId) {
  /* 0x007db6d2 cmp dword [ecx],0 ; jne next ; 0x007db6d7 cmp dword
     [ecx+4],0x70 ; je ONE — FULL-DWORD exact compares (the 0x70
     sentinel; TD's sibling scan uses 0x71). */
  return elemTag === PM_BW_LIST_MATCH_TAG && elemId === PM_BW_LIST_MATCH_ID
    ? 1 : 0;
}

export function pm7db6b0WalkTerminates(listBegin, listEnd) {
  /* 0x007db6c8 cmp eax,edx (walk while eax != edx, eax += 0x10) — a
     wrapped span can never converge; a non-multiple-of-0x10 span can
     never land exactly on end. TD walk_terminates discipline. */
  const span = asI32(asU32(listEnd) - asU32(listBegin));
  if (span < 0) {
    return 0;
  }
  return span % PM_BW_LIST_ELEM_STRIDE === 0 ? 1 : 0;
}

export function pm7db6b0WalkSteps(listBegin, listEnd) {
  if (pm7db6b0WalkTerminates(listBegin, listEnd) === 0) {
    return -1;
  }
  const span = asI32(asU32(listEnd) - asU32(listBegin));
  return span / PM_BW_LIST_ELEM_STRIDE;
}

export function pm7db6b0ScanFound(elemTags, elemIds) {
  /* The list scan accumulation: early exit `je ONE` on the FIRST
     match — an order-independent OR over the entry tag/id dwords.
     Null/empty arrays -> -1 (host contract) / 0 (empty list skips
     the scan in the PE: begin==end je skip). */
  if (!elemTags || !elemIds || elemTags.length <= 0 || elemIds.length <= 0) {
    return -1;
  }
  const n = Math.min(elemTags.length, elemIds.length);
  for (let i = 0; i < n; i += 1) {
    if (pm7db6b0ElemMatch(elemTags[i], elemIds[i]) === 1) {
      return 1;
    }
  }
  return 0;
}

export function pm7db6b0CharGate(char13c0) {
  /* 0x007db6e4 cmp dword [esi + 0x13c0], 0x27 / je ONE — FULL-DWORD
     equality: exact 0x27, high bits never match. */
  return (char13c0 >>> 0) === PM_BW_CHAR_CMP ? 1 : 0;
}

export function pm7db6b0Value(flag1519, char13c0, elemTags, elemIds) {
  /* Whole-body composition: the skip byte gates the scan (jne skip at
     0x7db6ba); the char check is post-merge (0x7db6e4 — runs in
     EVERY case: skip, empty, not-found alike). */
  if (pm7db6b0ScanSkipped(flag1519) === 0 &&
      pm7db6b0ScanFound(elemTags, elemIds) === 1) {
    return 1;
  }
  return pm7db6b0CharGate(char13c0);
}

/* =====================================================================
 * v34 — B3: VA 0x007da7a0 collectible-drop bool gate (NARROWED — the
 * HUD host leaf 0x72fd10 GetCollectible call stays host, its result
 * is a typed sample). thiscall, ret 4 (ONE stack arg), bool in al.
 * 2 callers (0x6ebb9c arg 0 / 0x6ebbd5 arg 1 — both `test al,al`).
 * Gates: arg UNSIGNED > 3 -> ONE (first, before the array read);
 * slot (dword [this+0x1580+arg*0x20]) == 0 -> ONE; SIGNED slot >=
 * size ((end-begin)>>2 span) -> ONE; slot in {0xeb,0x2b,0x3d} -> ONE;
 * cfg (host sample) == 0 -> ONE; slot in {0x248,0x3b} -> ONE;
 * else ZERO. ZERO byte gates (nothing masked); all FULL-DWORD.
 * ===================================================================== */
export const PM_B3_VA_BODY = 0x007da7a0;
export const PM_B3_VA_RET_ZERO = 0x007da800;
export const PM_B3_VA_RET_ONE = 0x007da807;
export const PM_B3_BODY_BYTES = 103;
export const PM_B3_CALLSITE_COUNT = 2;
export const PM_B3_CALLER0_VA = 0x006ebb9c;
export const PM_B3_CALLER1_VA = 0x006ebbd5;
export const PM_B3_E8_COUNT = 1;
export const PM_B3_INDIRECT_COUNT = 0;
export const PM_B3_STORE_COUNT = 0;
export const PM_B3_GET_COLLECTIBLE_VA = 0x0072fd10;
export const PM_B3_ARG_MAX = 3;
export const PM_B3_SLOT_BASE_OFF = 0x1580;
export const PM_B3_SLOT_STRIDE = 0x20;
export const PM_B3_ROOM_GLOBAL = 0xc7169c;
export const PM_B3_ROOM_CONTAINER_OFF = 0x2a404;
export const PM_B3_ID_SKIP_A = 0xeb;
export const PM_B3_ID_SKIP_B = 0x2b;
export const PM_B3_ID_SKIP_C = 0x3d;
export const PM_B3_ID_SKIP_D = 0x248;
export const PM_B3_ID_SKIP_E = 0x3b;

export function pm7da7a0ArgGate(arg) {
  /* 0x007da7a7 cmp eax,3 / 0x007da7aa ja ONE — UNSIGNED bound, the
     body's first gate (before the slot array read). FULL-DWORD. */
  return (arg >>> 0) > PM_B3_ARG_MAX ? 1 : 0;
}

export function pm7da7a0Value(arg, slot, size, cfg) {
  /* Whole-body composition: arg gate first (PE order), then slot
     zero (FULL-DWORD), SIGNED slot >= size, pre-host id skips, the
     host cfg sample FULL-DWORD, post-host id skips. The size sample
     is the DERIVED (end-begin)>>2 span value. Zero byte gates. */
  if (pm7da7a0ArgGate(arg) === 1) return 1;
  if ((slot >>> 0) === 0) return 1;
  if ((slot | 0) >= (size | 0)) return 1;
  if ((slot >>> 0) === PM_B3_ID_SKIP_A ||
      (slot >>> 0) === PM_B3_ID_SKIP_B ||
      (slot >>> 0) === PM_B3_ID_SKIP_C) return 1;
  if ((cfg >>> 0) === 0) return 1;
  if ((slot >>> 0) === PM_B3_ID_SKIP_D ||
      (slot >>> 0) === PM_B3_ID_SKIP_E) return 1;
  return 0;
}

/* =====================================================================
 * v34 — B5: VA 0x007dac30 clot-crowd bool gate (FULLY PURE — E8 0 /
 * indirect 0 / stores 0, the whole body in-module). thiscall, plain
 * ret, ZERO stack args, bool in al (the only caller 0x77cc34 — TRUE
 * gates the clot counter that releases the B4 SpawnClot host at 60).
 * Gates: SIGNED v194c > 0; SIGNED v1348 > 0; v1344 > 0 AND SIGNED
 * (v1d88+v134c wrapped) > 0; SIGNED (v1344-v1da4 wrapped) > 1;
 * SIGNED (v1d88+v134c wrapped) > 1; else ZERO. ZERO byte gates.
 * ===================================================================== */
export const PM_B5_VA_BODY = 0x007dac30;
export const PM_B5_VA_RET_ZERO = 0x007dac7a;
export const PM_B5_VA_RET_ONE = 0x007dac7d;
export const PM_B5_BODY_BYTES = 77;
export const PM_B5_CALLSITE_COUNT = 1;
export const PM_B5_CALLER0_VA = 0x0077cc34;
export const PM_B5_E8_COUNT = 0;
export const PM_B5_INDIRECT_COUNT = 0;
export const PM_B5_STORE_COUNT = 0;
export const PM_B5_OFF_194C = 0x194c;
export const PM_B5_OFF_1348 = 0x1348;
export const PM_B5_OFF_1344 = 0x1344;
export const PM_B5_OFF_1D88 = 0x1d88;
export const PM_B5_OFF_134C = 0x134c;
export const PM_B5_OFF_1DA4 = 0x1da4;

export function pm7dac30Value(v194c, v1348, v1344, v1d88, v134c, v1da4) {
  /* Whole-body composition (PE 0x007dac30..0x007dac7d): every gate is
     a SIGNED full-dword compare (jg/jle); the two sums/sub wrap at 32
     bits exactly like the PE add/sub (asU32 then |0). Zero byte
     gates — nothing masked. */
  if ((v194c | 0) > 0) return 1;
  if ((v1348 | 0) > 0) return 1;
  if ((v1344 | 0) > 0 && ((v1d88 >>> 0) + (v134c >>> 0) | 0) > 0) return 1;
  if (((v1344 >>> 0) - (v1da4 >>> 0) | 0) > 1) return 1;
  if (((v1d88 >>> 0) + (v134c >>> 0) | 0) > 1) return 1;
  return 0;
}

/* =====================================================================
 * v35 — B9: VA 0x007daff0 flag/effect decision island (NARROWED).
 * thiscall, ret plain, void (the only caller 0x7a50d7 does NOT consume
 * a return value). 67 insns, 2 E8 (0x7cb6e0 count resolver + 0x930220
 * effect add — both typed PM host events, bodies stay host),
 * 2 observable stores (byte [this+0x1eec] at 0x7db01f and 0x7db089 —
 * the flag is OVERWRITTEN unconditionally, unlike B10/B11/B12 which
 * preserve the low nibble). Laws from the instruction stream
 * (dump disasm-007daff0.txt):
 *   count = countResolver(this, 0x79)              [HOST sample]
 *   flag  = byte [this + 0x1eec] stored as
 *     count==0 ? 0x00 : count==1 ? 0x10 : 0x20     (sub;je chain,
 *       FULL-DWORD: -1/0x100/0x1ff -> the >= 2 arm)
 *   iters = count==0 ? 0 : count==1 ? 1 : 2        (esi loop count)
 *   per iteration (fresh [game+0x2a404..0x2a408] samples):
 *     size  = ((end - begin) & ~3)
 *     host 0x930220(this+0x1508, &buf16, 1, 1) iff
 *       SIGNED size > 0x4e4 && slot = [begin+0x4e4] != 0
 *     (buf16 = { slot, 0, [slot+0x78], 0 } — host call args)
 * ===================================================================== */
export const PM_B9_VA_BODY = 0x007daff0;
export const PM_B9_VA_RET_ONE = 0x007db086;
export const PM_B9_VA_RET_ZERO = 0x007db094;
export const PM_B9_BODY_BYTES = 164;
export const PM_B9_CALLSITE_COUNT = 1;
export const PM_B9_CALLER0_VA = 0x007a50d7;
export const PM_B9_E8_COUNT = 2;
export const PM_B9_INDIRECT_COUNT = 0;
export const PM_B9_STORE_COUNT = 2;
export const PM_B9_COUNT_ID = 0x79;
export const PM_B9_FLAG_OFF = 0x1eec;
export const PM_B9_GAME_GLOBAL_VA = 0x00c7169c;
export const PM_B9_VEC_BEGIN_OFF = 0x2a404;
export const PM_B9_VEC_END_OFF = 0x2a408;
export const PM_B9_SIZE_CMP = 0x4e4;
export const PM_B9_SLOT_OFF = 0x4e4;
export const PM_B9_RECEIVER_OFF = 0x1508;
export const PM_B9_HOST_VA_COUNT = 0x007cb6e0;
export const PM_B9_HOST_VA_EFFECT = 0x00930220;
export const PM_B9_FLAG_NONE = 0x00;
export const PM_B9_FLAG_SINGLE = 0x10;
export const PM_B9_FLAG_MULTI = 0x20;
export const PM_B9_LOOP_SINGLE = 1;
export const PM_B9_LOOP_MULTI = 2;

export function pm7daff0FlagValue(count) {
  /* 0x007db005 sub eax,0 ; je 0x7db087 (count==0 -> store 0x00) ;
     0x007db00a sub eax,1 ; je 0x7db018 (count==1 -> 0x10) ; else
     0x20 (0x7db014). FULL-DWORD equality dispatch. */
  return asI32(count) === 0 ? PM_B9_FLAG_NONE
       : asI32(count) === 1 ? PM_B9_FLAG_SINGLE
       : PM_B9_FLAG_MULTI;
}

export function pm7daff0LoopIters(count) {
  /* 0x007db00f mov esi,2 (count>=2) / 0x007db018 mov esi,1 (count==1) ;
     0x007db07b sub esi,1 ; 0x007db07e jne 0x7db025 — the effect loop
     runs esi times; count==0 never reaches the loop. */
  return asI32(count) === 0 ? 0
       : asI32(count) === 1 ? PM_B9_LOOP_SINGLE
       : PM_B9_LOOP_MULTI;
}

export function pm7daff0SizeGate(begin, end) {
  /* 0x007db036 sub eax,ecx (32-bit wrap) ; 0x007db038 and eax,~3 ;
     0x007db03b cmp eax,0x4e4 ; 0x007db040 jle skip — SIGNED size
     > 0x4e4 (compare-flip class: asI32 keeps the signed oracle). */
  const size = (asU32(end) - asU32(begin)) & 0xfffffffc;
  return asI32(size) > PM_B9_SIZE_CMP ? 1 : 0;
}

export function pm7daff0HostNeeded(begin, end, slot) {
  /* 0x007db042 mov eax,[ecx+0x4e4] ; 0x007db048 test eax,eax ;
     0x007db04a je skip — effect call iff SIGNED size > 0x4e4 AND
     slot = [begin + 0x4e4] != 0 (FULL dword). */
  return pm7daff0SizeGate(begin, end) !== 0 && asU32(slot) !== 0 ? 1 : 0;
}

/* =====================================================================
 * v37 — FB: VA 0x009bf930 PlayerManager::FirstBirthrightOwner (EXACT
 * ZHL 14 B, PlayerManager.zhl). NARROWED — the HasCollectible probe
 * 0x7706e0 stays host (HUD-family HasCollectible-shaped leaf; PM
 * family pin Entity_Player::HasCollectible(this, 0x26b, false),
 * typed host sample), the returned player pointer stays host data.
 * thiscall, ret 4 (ONE stack arg = type), Entity_Player* in eax
 * (NULL or first winner). 40 insns, 2 rets (0x9bf978 ZERO /
 * 0x9bf983 FOUND), 1 E8 (0x7706e0), 0 indirect, 0 stores. int3 pad
 * 0x9bf986..0x9bf98f; next function 0x009bf990 (IsCoopPlay, family
 * pin). 8 direct rel32 callers; receiver g_Game+0x1baa8 in 5/8.
 * ===================================================================== */
export const PM_FB_VA_BODY = 0x009bf930;
export const PM_FB_VA_RET_NULL = 0x009bf978;
export const PM_FB_VA_RET_FOUND = 0x009bf983;
export const PM_FB_BODY_BYTES = 83;
export const PM_FB_CALLSITE_COUNT = 8;
export const PM_FB_CALLER0_VA = 0x0065cfe6;
export const PM_FB_CALLER1_VA = 0x006e0cec;
export const PM_FB_CALLER2_VA = 0x007304cf;
export const PM_FB_CALLER3_VA = 0x0073bd82;
export const PM_FB_CALLER4_VA = 0x007d65ce;
export const PM_FB_CALLER5_VA = 0x007d6604;
export const PM_FB_CALLER6_VA = 0x007d8eb2;
export const PM_FB_CALLER7_VA = 0x009a48e1;
export const PM_FB_E8_COUNT = 1;
export const PM_FB_INDIRECT_COUNT = 0;
export const PM_FB_STORE_COUNT = 0;
export const PM_FB_LIST_BEGIN_OFF = 0x00;
export const PM_FB_LIST_END_OFF = 0x04;
export const PM_FB_LIST_ELEM_STRIDE = 4;
export const PM_FB_LIST_HOLDER_OFF = 0x1baa8;
export const PM_FB_STATE_OFF = 0x2c;
export const PM_FB_CHAR_OFF = 0x13c0;
export const PM_FB_PROBE_VA = 0x007706e0;
export const PM_FB_PROBE_ID = 0x26b;

export function pm9bf930WalkTerminates(listBegin, listEnd) {
  /* 0x009bf93e cmp esi,[ebx+4] (walk while esi != end, esi += 4 at
     0x9bf968) — a wrapped span can never converge; a non-multiple-
     of-4 span can never land exactly on end. TD/BW walk_terminates
     discipline (wasm32 compare-flip class: asI32 keeps the signed
     oracle). */
  const span = asI32(asU32(listEnd) - asU32(listBegin));
  if (span < 0) {
    return 0;
  }
  return span % PM_FB_LIST_ELEM_STRIDE === 0 ? 1 : 0;
}

export function pm9bf930WalkSteps(listBegin, listEnd) {
  if (pm9bf930WalkTerminates(listBegin, listEnd) === 0) {
    return -1;
  }
  const span = asI32(asU32(listEnd) - asU32(listBegin));
  return span / PM_FB_LIST_ELEM_STRIDE;
}

export function pm9bf930SlotEligible(state2c, char13c0, type) {
  /* 0x009bf945 cmp dword [edi+0x2c],0 / jne next ; 0x009bf94e cmp
     dword [edi+0x13c0],eax / jne next — BOTH FULL-DWORD equality
     gates (the unsigned int type arg = [ebp+8]; 0x127 != 0x27). */
  if (asU32(state2c) !== 0) {
    return 0;
  }
  return (char13c0 | 0) === (type | 0) ? 1 : 0;
}

export function pm9bf930ProbeMatch(has26b) {
  /* 0x009bf964 test al,al / jne FOUND — the body's ONLY byte gate
     (low byte of the 0x7706e0 host sample; v9: & 0xff). */
  return (has26b & 0xff) !== 0 ? 1 : 0;
}

export function pm9bf930ScanFound(states, chars, has, type, count) {
  /* The owner-walk accumulation: early exit `jne FOUND` on the FIRST
     winning player — an order-independent OR over slots of
     (slot_eligible && probe_match); the probe sample of an
     ineligible slot is never consulted (the PE calls 0x7706e0 only
     after both gates pass). Null/empty -> -1 (host contract); empty
     list contributes 0 (begin==end je ZERO). */
  if (!states || !chars || !has || count <= 0) {
    return -1;
  }
  const n = Math.min(states.length, chars.length, has.length, count);
  for (let i = 0; i < n; i += 1) {
    if (pm9bf930SlotEligible(states[i], chars[i], type) === 0) {
      continue;
    }
    if (pm9bf930ProbeMatch(has[i]) === 1) {
      return 1;
    }
  }
  return 0;
}

export function pm9bf930OwnerFound(listBegin, listEnd, states, chars, has,
                                   type, count) {
  /* Whole-body composition: the walked slot count comes from the
     bounds — begin==end (steps 0) -> NULL (je ZERO at 0x9bf941, no
     probe runs); non-terminating spans (steps -1) never converge;
     the scan covers min(count, steps) sampled slots; scan_found == 1
     is the only FOUND-side ONE path (the -1 sentinel behaves like an
     empty scan). */
  const steps = pm9bf930WalkSteps(listBegin, listEnd);
  if (steps < 0 || steps === 0) {
    return 0;
  }
  const n = count < steps ? count : steps;
  return pm9bf930ScanFound(states, chars, has, type, n) === 1 ? 1 : 0;
}

/* =====================================================================
 * v38 — B18: VA 0x007db8d0 mode-dispatch resolver (NARROWED). The
 * mode-scan chain 0x7db860 -> 0x4288a0 and the Game-Start-Seed fatal
 * 0xa112c0 stay host; g_Game [0xc71678] / count [Game+0x1bb88] stay
 * host samples. thiscall, ret plain, int32 value consumed FULL-DWORD
 * (14 direct rel32 callers). 152 insns, 13 E8 (1 real edge + 7
 * cookie checks + 2 fatals + 3 in the next function), 1 indirect
 * (jump table 0x7dba10), 2 stack-local stores (0 observable).
 * ===================================================================== */
export const PM_B18_VA_BODY = 0x007db8d0;
export const PM_B18_VA_RET_FIRST = 0x007db90b;
export const PM_B18_VA_RET_LAST = 0x007dba0e;
export const PM_B18_BODY_BYTES = 318;
export const PM_B18_CALLSITE_COUNT = 14;
export const PM_B18_CALLER0_VA = 0x00764dce;
export const PM_B18_CALLER1_VA = 0x007655e3;
export const PM_B18_CALLER2_VA = 0x007679eb;
export const PM_B18_CALLER3_VA = 0x007685ab;
export const PM_B18_CALLER4_VA = 0x00770a46;
export const PM_B18_CALLER5_VA = 0x00770f5b;
export const PM_B18_CALLER6_VA = 0x007c2a34;
export const PM_B18_CALLER7_VA = 0x007c2b11;
export const PM_B18_CALLER8_VA = 0x009f5c34;
export const PM_B18_CALLER9_VA = 0x00a0a8de;
export const PM_B18_CALLER10_VA = 0x00a0b63e;
export const PM_B18_CALLER11_VA = 0x00a0b65c;
export const PM_B18_CALLER12_VA = 0x00a0c99c;
export const PM_B18_CALLER13_VA = 0x00a0cfd6;
export const PM_B18_E8_COUNT = 13;
export const PM_B18_INDIRECT_COUNT = 1;
export const PM_B18_STORE_COUNT = 2;
export const PM_B18_FAST_MAX = 7;
export const PM_B18_TABLE = [-1, -1, 0, 1, 2, 3, 4, 5];
export const PM_B18_JUMP_TABLE_VA = 0x007dba10;
export const PM_B18_MODE_SCAN_VA = 0x007db860;
export const PM_B18_FATAL_VA = 0x00a112c0;
export const PM_B18_GAME_GLOBAL_VA = 0x00c71678;
export const PM_B18_COUNT_OFF = 0x1bb88;
export const PM_B18_HASH_C1 = 2;
export const PM_B18_HASH_C2 = 15;
export const PM_B18_HASH_C3 = 17;
export const PM_B18_HASH_FOLD_ADD = 2;
export const PM_B18_HASH_FOLD_MASK = 3;

export function pm7db8d0FastGate(mode) {
  /* 0x007db8e9 cmp esi,7 ; 0x007db8ec ja slow — UNSIGNED mode <= 7u
     (the body's ONLY compare class; no signed arm to flip). */
  return (mode >>> 0) <= PM_B18_FAST_MAX ? 1 : 0;
}

export function pm7db8d0FastValue(mode) {
  /* 0x007db8f2 jmp [esi*4 + 0x7dba10] — entries 0 AND 1 both -> -1.
     Meaningful only when fast_gate(mode); totalized to 0 outside. */
  const m = mode >>> 0;
  return m <= PM_B18_FAST_MAX ? PM_B18_TABLE[m] : 0;
}

export function pm7db8d0SlowFatal(count) {
  /* 0x007db993 test eax,eax ; jne skip — count == 0 (FULL DWORD)
     decides the Game-Start-Seed fatal 0xa112c0 (host by contract;
     count re-read at 0x7db9a3). 0x80000000 is NOT fatal. */
  return (count >>> 0) === 0 ? 1 : 0;
}

export function pm7db8d0SlowHash(count, mode) {
  /* 0x007db9b4 add eax,esi (32-bit wrap) ; cmp eax,1 ; cmova esi,eax
     — v = (sum > 1u) ? sum : 1 (UNSIGNED max). Then:
     t = (v >> 2) ^ v ; u = ((t << 15) >>> 0) ^ t ;
     w = (u >> 17) ^ u ; result = (w & 3) + 2
     with the TRUE constants [0xb1f57c..0xb1f584] = 2, 15, 17
     (the oracle executes the real PE bytes; HUD v16's claimed
     constants live elsewhere). The "RNG Seed is zero!" arm is DEAD
     (max(1,·) >= 1). */
  const sum = ((count >>> 0) + (mode >>> 0)) >>> 0;
  const v = sum > 1 ? sum : 1;
  const t = (v >>> 2) ^ v;
  const u = (((t << PM_B18_HASH_C2) >>> 0) ^ t) >>> 0;
  const w = (u >>> PM_B18_HASH_C3) ^ u;
  return (w & PM_B18_HASH_FOLD_MASK) + PM_B18_HASH_FOLD_ADD;
}

export function pm7db8d0Value(mode, count) {
  /* Whole-body composition: the fast dispatch happens BEFORE any Game
     access — the fast path NEVER reads the count; the slow path folds
     the count sample (fatal stays host, count re-read). */
  return pm7db8d0FastGate(mode) === 1
    ? pm7db8d0FastValue(mode)
    : pm7db8d0SlowHash(count, mode);
}

export function pm7db8d0HostNeeded(mode, count) {
  /* The fatal runs iff slow && count == 0 (FULL DWORD). */
  return (mode >>> 0) > PM_B18_FAST_MAX && (count >>> 0) === 0 ? 1 : 0;
}

/* =====================================================================
 * v40 — B20: VA 0x007dbba0 RNG-item-pick + EffectAdd (NARROWED — the
 * lazy-init "RNG Seed is zero!" log 0xa112c0, GetCollectible 0x72fd10,
 * EffectAdd 0x930220 and the cookie check 0xaef12b stay host; g_Game
 * [0xc71678]/[0xc7169c], mode [Game+0x26614], and the RNG struct dwords
 * at [*(this+0x177c) + 0x840 + {0,4,8,0xc}] stay host samples).
 * thiscall, ret plain, SIDE-EFFECT call (2 direct rel32 callers
 * 0x7a848b + 0x7ad962, return unused). 68 insns, 4 E8, 0 indirect,
 * 9 mem-stores (7 stack locals + 2 observable). The pure chain: the
 * family three-step xorshift (PMP/TD-record chain, shifts masked & 31
 * = the x86 cl hardware mask), the & 7 sample-index gate, the 8-dword
 * table sample (TRUE .rdata constants), and the SIGNED mode >= 2
 * store gate.
 * ===================================================================== */
export const PM_B20_VA_BODY = 0x007dbba0;
export const PM_B20_VA_RET = 0x007dbc75;
export const PM_B20_BODY_BYTES = 213;
export const PM_B20_CALLSITE_COUNT = 2;
export const PM_B20_CALLER0_VA = 0x007a848b;
export const PM_B20_CALLER1_VA = 0x007ad962;
export const PM_B20_E8_COUNT = 4;
export const PM_B20_INDIRECT_COUNT = 0;
export const PM_B20_STORE_COUNT = 9;
export const PM_B20_RNG_PTR_OFF = 0x177c;
export const PM_B20_RNG_OFF = 0x840;
export const PM_B20_STORE_OFF = 0x2edc;
export const PM_B20_SHIFT_MASK = 31;
export const PM_B20_IDX_MASK = 7;
export const PM_B20_MODE_CMP = 2;
export const PM_B20_GAME_GLOBAL_VA = 0x00c71678;
export const PM_B20_CONFIG_GLOBAL_VA = 0x00c7169c;
export const PM_B20_CONFIG_OFF = 0x2a404;
export const PM_B20_MODE_OFF = 0x26614;
export const PM_B20_PAIR_OFF = 0x1508;
export const PM_B20_TABLE_VA = 0x00bab750;
export const PM_B20_TABLE8 = [0xd, 0xe, 0xf0, 0x46, 0x8f, 0x159, 0x1ed, 0x1f0];
export const PM_B20_LOG_VA = 0x00a112c0;
export const PM_B20_LOG_STR_VA = 0x00b6bf54;
export const PM_B20_LOG_LEVEL = 0x10;
export const PM_B20_GET_COLLECTIBLE_VA = 0x0072fd10;
export const PM_B20_EFFECT_ADD_VA = 0x00930220;
export const PM_B20_COOKIE_VA = 0x00aef12b;

export function pm7dbba0RngNeedsInit(state) {
  /* 0x007dbbd8 test edx,edx ; jne skip — FULL-DWORD zero test; the
     "RNG Seed is zero!" log (0xa112c0, 0x10, 0xb6bf54) stays host
     and the state is re-read (still 0 -> int3). */
  return (state >>> 0) === 0 ? 1 : 0;
}

export function pm7dbba0RngNext(state, c1, c2, c3) {
  /* 0x007dbbf2..0x007dbc11 — the family three-step xorshift (same
     chain as the PMP global 0x956830 / TD record 0x7a2100); x86
     shr/shl mask cl to 5 bits, so (c & 31) is the hardware mask. */
  let x = state >>> 0;
  x ^= x >>> (c1 & 31);
  x = (x ^ (x << (c2 & 31))) >>> 0;
  x ^= x >>> (c3 & 31);
  return x >>> 0;
}

export function pm7dbba0SampleIndex(state) {
  /* 0x007dbc15 and eax,7 — the BYTE-gate class (3-bit mask; v9
     uint32_t param with the mask in the body). */
  return (state >>> 0) & PM_B20_IDX_MASK;
}

export function pm7dbba0SampleValue(table8, index) {
  /* 0x007dbc1e mov esi,[ebp+eax*4-0x24] — the 8-dword table of the
     two 16-byte .rdata constants {0xd,0xe,0xf0,0x46,0x8f,0x159,0x1ed,
     0x1f0}; null/out-of-range totalized to 0 (B18 fast_value
     discipline). */
  if (!table8) return 0;
  const i = index | 0;
  if (i < 0 || i > 7) return 0;
  return (table8[i] >>> 0);
}

export function pm7dbba0StoreGate(mode) {
  /* 0x007dbc57 cmp [eax+0x26614],2 ; 0x007dbc5e jl skip — SIGNED
     (int32)mode >= 2 stores the sampled id to [this+0x2edc]. */
  return (mode | 0) >= PM_B20_MODE_CMP ? 1 : 0;
}

export function pm7dbba0Update(state, c1, c2, c3, table8) {
  /* Whole-body composition — the sampled collectible id v; state==0
     rows run the host lazy-init path (the 0 here is a documented
     totalization; pm7dbba0RngNeedsInit is authoritative). mode does
     NOT feed v — the store decision is pm7dbba0StoreGate(mode). */
  if (pm7dbba0RngNeedsInit(state) === 1) return 0;
  return pm7dbba0SampleValue(
    table8, pm7dbba0SampleIndex(pm7dbba0RngNext(state, c1, c2, c3)));
}

export const PM_TD_OFF_LIST_SKIP_1519 = 0x1519;
export const PM_TD_OFF_LIST_BEGIN_150C = 0x150c;
export const PM_TD_OFF_LIST_END_1510 = 0x1510;
export const PM_TD_LIST_MATCH_TAG = 0;
export const PM_TD_POCKET_STRIDE = 8;
export const PM_TD_POCKET_CLAMP_MAX = 3;
export const PM_TD_POCKET_MATCH_TYPE = 1;
export const PM_TD_POCKET_LAST_ID_OFF = 0x17b8;
export const PM_TD_POCKET_LAST_TYPE_OFF = 0x17bc;
export const PM_TD_POCKET_LAST_ID_VALUE = 0;
export const PM_TD_POCKET_LAST_TYPE_VALUE = 1;
export const PM_TD_COMPACT_DWORD_MASK = 0x3ffffffe;
export const PM_TD_VEC_BEGIN_VA = 0x00c812a0;
export const PM_TD_VEC_END_VA = 0x00c812a4;
export const PM_TD_VEC_CAP_VA = 0x00c812a8;
export const PM_TD_GUARD_VA = 0x00c8129c;
export const PM_TD_TEB_TLS_PTR_OFF = 0x2c;
export const PM_TD_TLS_EPOCH_OFF = 0xc;
export const PM_TD_DTOR_THUNK_VA = 0x00b15b90;
export const PM_TD_HOST_VA_SELF = 0x007a1090;
export const PM_TD_HOST_VA_PRE_REMOVE = 0x007bb5e0;
export const PM_TD_HOST_VA_PLAYER_REMOVE = 0x009bc120;
export const PM_TD_HOST_VA_VECTOR_GROW = 0x0042c920;
export const PM_TD_HOST_VA_INIT_HEADER = 0x00aef29d;
export const PM_TD_HOST_VA_INIT_FOOTER = 0x00aef253;
export const PM_TD_HOST_VA_DTOR_REGISTER = 0x00aef5af;
export const PM_TD_HOST_VA_REVIVE = 0x007a2220;
export const PM_TD_HOST_VA_TRY_PREVENT_DEATH = 0x007caad0;
export const PM_TD_RET_FALSE_VA_EARLY = 0x007a10da;
export const PM_TD_RET_FALSE_VA = 0x007a1ca1;
export const PM_TD_RET_TRUE_VA = 0x007a21c4;
export const PM_TD_HOST_VA_PROBE_A = 0x007a0fe0;
export const PM_TD_HOST_VA_PROBE_B = 0x007a1020;
export const PM_TD_HOST_VA_HAS_COLLECTIBLE = 0x007706e0;
export const PM_TD_HOST_VA_COLLECTIBLE_COUNT = 0x007cb6e0;
export const PM_TD_HOST_VA_COLLECTIBLE_RNG = 0x005b17c0;
export const PM_TD_OFF_PENDING_2EF8 = 0x2ef8;
export const PM_TD_OFF_PENDING_FLAG_2EF0 = 0x2ef0;
export const PM_TD_PROBE_B_PATH_IMMEDIATE = 0;
export const PM_TD_PROBE_B_PATH_COUNT_GT1 = 1;
export const PM_TD_PROBE_B_PATH_COUNT_GT0 = 2;
export const PM_TD_RVH_HOST_VA = 0x007a23a0;
export const PM_TD_RVH_OFF_ORDER_161C = 0x161c;
export const PM_TD_RVH_BYTE_TABLE_VA = 0x007a335c;
export const PM_TD_RVH_JUMP_TABLE_VA = 0x007a3348;
export const PM_TD_HEART_VA_PROBE = 0x00771550;
export const PM_TD_HEART_PROBE_ARG_ID = 0x17;
export const PM_TD_HEART_PROBE_ARG_FLAG = 0;
export const PM_TD_HEART_GAME_18300_OFF = 0x18300;
export const PM_TD_HEART_ACCEPT = 0xd;
export const PM_TD_HEART_VA_UNLOCK = 0x00929a20;
export const PM_TD_HEART_UNLOCK_ACH = 0x52;
export const PM_TD_HEART_MANAGER_GLOBAL_VA = 0x00c7169c;
export const PM_TD_HEART_PGD_OFF = 0x14;
export const PM_TD_TAIL_CHAR_MATCH = 0x1f;
export const PM_TD_TAIL_ID = 0x26b;
export const PM_TD_TAIL_VA_HAS_COLLECTIBLE = 0x007706e0;
export const PM_TD_TAIL_VA_REVIVE_CAST = 0x0078f840;
export const PM_TD_TAIL_VA_RVH = 0x007a23a0;
export const PM_TD_TAIL_VA_SHARED = 0x007a1335;
export const PM_TD_VEC_OFF_REC1_BEGIN_1770 = 0x1770;
export const PM_TD_VEC_OFF_REC1_END_1774 = 0x1774;
export const PM_TD_VEC_OFF_REC2_BEGIN_177C = 0x177c;
export const PM_TD_VEC_OFF_REC2_END_1780 = 0x1780;
export const PM_TD_VEC_RNG_SEED_OFF = 0;
export const PM_TD_VEC_RNG_S1_OFF = 0x4;
export const PM_TD_VEC_RNG_S2_OFF = 0x8;
export const PM_TD_VEC_RNG_S3_OFF = 0xc;
export const PM_TD_VEC_REC1_LIMIT_ENTRIES = 0xd4;
export const PM_TD_VEC_REC2_LIMIT_ENTRIES = 0x1c;
export const PM_TD_VEC_REC1_LIMIT_BYTES = 0xd40;
export const PM_TD_VEC_REC2_LIMIT_BYTES = 0x1c0;
export const PM_TD_VEC_WARN_REC1_STR_VA = 0x00b62a7c;
export const PM_TD_VEC_WARN_REC2_STR_VA = 0x00b64a88;
export const PM_TD_VEC_WARN_LEVEL = 0x10;
export const PM_TD_VEC_SEED_ZERO_STR_VA = 0x00b6bf54;
export const PM_TD_VEC_VA_RANDOM_INT = 0x007e9020;
export const PM_TD_VEC_RANDOM_INT_MAX = 0x64;
export const PM_TD_VEC_VA_AFTER_DEATH_A = 0x007cbcd0;
export const PM_TD_VEC_VA_AFTER_DEATH_B = 0x007cba30;
export const PM_TD_VEC_VIRTUAL_SLOT_60 = 0x60;
export const PM_TD_CHAR_SFX_ID_DEFAULT = 0x1e;
export const PM_TD_CHAR_SFX_ID_PATH01 = 0x1b;
export const PM_TD_CHAR_SFX_ID_ALT = 0x50;
export const PM_TD_SEQ_OFF_FATAL_3BC = 0x3bc;
export const PM_TD_SEQ_OFF_FATAL_STATE_28 = 0x28;
export const PM_TD_SEQ_EFFECT_ID_29B = 0x29b;
export const PM_TD_SEQ_VA_HAS_EFFECT = 0x009305f0;
export const PM_TD_SEQ_VA_REMOVE = 0x009bc120;
export const PM_TD_SEQ_OFF_171 = 0x171;
export const PM_TD_GHOST_OFF_FLAG_20A9 = 0x20a9;
export const PM_TD_GHOST_VA_IS_COOP = 0x009bf990;
export const PM_TD_GHOST_VA_COOP_COUNT = 0x009bfa00;
export const PM_TD_GHOST_VA_MORPH = 0x007d96f0;
export const PM_TD_RESET_OFF_1340 = 0x1340;
export const PM_TD_RESET_OFF_1344 = 0x1344;
export const PM_TD_RESET_OFF_134C = 0x134c;
export const PM_TD_RESET_OFF_1348 = 0x1348;
export const PM_TD_RESET_OFF_1350 = 0x1350;
export const PM_TD_RESET_OFF_1D88 = 0x1d88;
export const PM_TD_RESET_OFF_1D8C = 0x1d8c;
export const PM_TD_RESET_OFF_1DA4 = 0x1da4;
export const PM_TD_RESET_VA_GET_HEALTH_TYPE = 0x007cafe0;
export const PM_TD_RESET_VA_ADD_BONE_HEARTS = 0x007ca840;
export const PM_TD_RESET_BONE_HEARTS_ARG = 1;
export const PM_TD_RESET_CHAR_MATCH = 0x12;
export const PM_TD_RESET_BRANCH_GT0_HT1_NE3 = 0;
export const PM_TD_RESET_BRANCH_GT0_HT1_EQ3 = 1;
export const PM_TD_RESET_BRANCH_LE0_HT1_EQ4 = 2;
export const PM_TD_RESET_BRANCH_LE0_HT2_EQ3 = 3;
export const PM_TD_RESET_BRANCH_CHAR_12 = 4;
export const PM_TD_RESET_BRANCH_ELSE = 5;
export const PM_EP_HT_TABLE_BYTES = [0, 4, 4, 4, 4, 4, 1, 4, 0, 4, 2, 4, 3, 0, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 1, 4, 2, 4, 0, 0, 4, 4, 4, 1];

export function pmDeathDualZeroGate(gate1b83c, gate1ba78) {
  return asI32(gate1b83c) === 0 && asI32(gate1ba78) === 0;
}

export function pmDeathAnimIdle(anim7c, anim8c) {
  /* PE: cmp dword [+0x7c],0; jz idle; cmp byte [+0x8c],0; jnz not-idle.
     anim8c is a byte test: widened parameter, explicit low-byte mask. */
  if (anim7c === 0) {
    return true;
  }
  if ((anim8c & 0xff) === 0) {
    return true;
  }
  return false;
}

export function pmDeathPlayerEligible(dead173, anim7c, anim8c, twinNull, twinAnim7c, twinAnim8c) {
  if (((dead173 >>> 0) & 0xff) === 0) return false;
  if (!pmDeathAnimIdle(anim7c, anim8c)) return false;
  if (((twinNull >>> 0) & 0xff) !== 0) return true;
  return pmDeathAnimIdle(twinAnim7c, twinAnim8c);
}

export function pmDeathPlayerEligiblePack(player) {
  if (!player) return false;
  const p = deathPack(player);
  return pmDeathPlayerEligible(p.dead173, p.anim7c, p.anim8c, p.twinNull, p.twinAnim7c, p.twinAnim8c);
}

export function pmDeathEligibleCount(players) {
  if (!players || players.length <= 0) return 0;
  let n = 0;
  for (let i = 0; i < players.length; i += 1) {
    if (pmDeathPlayerEligiblePack(players[i])) n += 1;
  }
  return n;
}

export function pmDeathEligibleMask(players) {
  let mask = 0;
  if (!players || players.length <= 0) return mask;
  const n = players.length > 32 ? 32 : players.length;
  for (let i = 0; i < n; i += 1) {
    if (pmDeathPlayerEligiblePack(players[i])) mask |= (1 << i) >>> 0;
  }
  return mask >>> 0;
}

export function pmDeathWalkPureComplete(residualKind) {
  return asI32(residualKind) === PM_DEATH_RESIDUAL_NONE;
}

export function pmDeathPlanFromPlayers(gate1b83c, gate1ba78, players) {
  const gate = pmDeathDualZeroGate(gate1b83c, gate1ba78);
  if (!gate) return fillDeathPlan(PM_DEATH_RESIDUAL_NONE, 0, 1, 0, 0);
  const elig = pmDeathEligibleCount(players || []);
  const mask = pmDeathEligibleMask(players || []);
  if (elig === 0) return fillDeathPlan(PM_DEATH_RESIDUAL_NONE, 1, 1, 0, 0);
  return fillDeathPlan(PM_DEATH_RESIDUAL_WALK, 1, 1, elig, mask);
}

export function pmDeathWireDecide({ gate1b83c = 0, gate1ba78 = 0, playerCount = 0, blobReady = false, players = [] } = {}) {
  const gate = pmDeathDualZeroGate(gate1b83c, gate1ba78);
  if (!gate) return fillDeathPlan(PM_DEATH_RESIDUAL_NONE, 0, 1, 0, 0);
  const count = (playerCount | 0) < 0 ? 0 : (playerCount | 0);
  if (count === 0) return fillDeathPlan(PM_DEATH_RESIDUAL_NONE, 1, 1, 0, 0);
  const ready = blobReady ? 1 : 0;
  if (ready === 0 || count > PM_DEATH_PLAYER_MAX || !players || players.length < count) {
    return fillDeathPlan(PM_DEATH_RESIDUAL_MONOLITHIC, 1, 0, 0, 0);
  }
  let n = players.length;
  if (n > count) n = count;
  if (n > PM_DEATH_PLAYER_MAX) n = PM_DEATH_PLAYER_MAX;
  const slice = players.slice(0, n);
  const elig = pmDeathEligibleCount(slice);
  const mask = pmDeathEligibleMask(slice);
  if (elig === 0) return fillDeathPlan(PM_DEATH_RESIDUAL_NONE, 1, 1, 0, 0);
  return fillDeathPlan(PM_DEATH_RESIDUAL_WALK, 1, 1, elig, mask);
}

export function pmDeathTriggerVa() {
  return PM_DEATH_HOST_VA_TRIGGER_DEATH;
}

export function pmDeathTriggerArg() {
  return PM_DEATH_TRIGGER_ARG_CHECK_ONLY;
}

export function pmIntensityPlayerEligible(raw1ea8, flags168, dead173) {
  /* PE: test esi,esi; jle skip; and eax,0x40; jnz skip; cmp dead,0; jnz skip.
     dead173 is a byte test: widened parameter, explicit low-byte mask. */
  if ((raw1ea8 | 0) <= 0) {
    return false;
  }
  if ((flags168 & asU32(PM_INTENSITY_FLAG_BIT_40)) !== 0) {
    return false;
  }
  if ((dead173 & 0xff) !== 0) {
    return false;
  }
  return true;
}

export function pmIntensityClampRaw(raw1ea8) {
  return clampRaw(raw1ea8);
}

export function pmIntensityPlayerContrib(raw1ea8, flags168, dead173) {
  if (!pmIntensityPlayerEligible(raw1ea8, flags168, dead173)) {
    return 0.0;
  }
  return clampRaw(raw1ea8);
}

export function pmIntensityMaxOverPlayers(players) {
  let maxVol = 0;
  if (!players || players.length <= 0) return maxVol;
  for (let i = 0; i < players.length; i += 1) {
    const p = intensityPack(players[i]);
    maxVol = sseMaxss(maxVol, pmIntensityPlayerContrib(p.raw1ea8, p.flags168, p.dead173));
  }
  return maxVol;
}

export function pmIntensityMaxOverArrays(rawArr, flagsArr, deadArr) {
  let maxVol = 0;
  if (!rawArr || !flagsArr || !deadArr) return maxVol;
  const n = Math.min(rawArr.length, flagsArr.length, deadArr.length);
  for (let i = 0; i < n; i += 1) {
    maxVol = sseMaxss(maxVol, pmIntensityPlayerContrib(rawArr[i], flagsArr[i], deadArr[i]));
  }
  return maxVol;
}

export function pmIntensitySfxStartNeeded(maxVol) {
  /* PE: comiss [0.01], maxVol; jb play
     CF=1 when threshold < maxVol or unordered. C: !(threshold >= maxVol)
     is true for NaN and for maxVol > threshold. */
  let thr = f32FromBits(PM_INTENSITY_F32_THRESHOLD_BITS);
  return !!(!(thr >= Math.fround(maxVol)));
}

export function pmIntensitySfxStopCandidate(maxVol) {
  return !pmIntensitySfxStartNeeded(maxVol);
}

export function pmIntensityPlanFromPlayers(players) {
  const maxVol = pmIntensityMaxOverPlayers(players);
  return {
    maxVol,
    sfxStartNeeded: !!pmIntensitySfxStartNeeded(maxVol),
    sfxStopCandidate: !!pmIntensitySfxStopCandidate(maxVol),
  };
}

export function pmIntensityPlanFromArrays(rawArr, flagsArr, deadArr) {
  const maxVol = pmIntensityMaxOverArrays(rawArr, flagsArr, deadArr);
  return {
    maxVol,
    sfxStartNeeded: !!pmIntensitySfxStartNeeded(maxVol),
    sfxStopCandidate: !!pmIntensitySfxStopCandidate(maxVol),
  };
}

export function pmIntensitySfxResidualKind(maxVol, isPlaying) {
  let playing = isPlaying !== 0 ? 1 : 0;
  if (pmIntensitySfxStartNeeded(maxVol)) {
    return playing !== 0 ? PM_INTENSITY_SFX_RESIDUAL_UPDATE
                        : PM_INTENSITY_SFX_RESIDUAL_PLAY;
  }
  return playing !== 0 ? PM_INTENSITY_SFX_RESIDUAL_STOP
                      : PM_INTENSITY_SFX_RESIDUAL_NONE;
}

export function pmIntensityHeartbeatPureComplete(maxVol, isPlaying) {
  return !!(pmIntensitySfxResidualKind(maxVol, isPlaying) === PM_INTENSITY_SFX_RESIDUAL_NONE);
}

export function pmIntensityHeartbeatPlan(maxVol, isPlaying) {
  const residualKind = pmIntensitySfxResidualKind(maxVol, isPlaying);
  const pureComplete = residualKind === PM_INTENSITY_SFX_RESIDUAL_NONE;
  return {
    maxVol,
    residualKind,
    pureComplete,
    hostNeeded: !pureComplete,
    pm2Pure: true,
    sfxId: PM_INTENSITY_SFX_ID,
    playFrameDelay: PM_INTENSITY_PLAY_FRAME_DELAY,
    playLoop: PM_INTENSITY_PLAY_LOOP,
    playPitch: f32FromBits(PM_INTENSITY_PLAY_PITCH_BITS),
    playPan: f32FromBits(PM_INTENSITY_PLAY_PAN_BITS),
  };
}

export function pmIntensityWireDecide({ playerCount = 0, blobReady = false, sfxPlaying = 0, players = [] } = {}) {
  const count = playerCount | 0;
  if (count <= 0) {
    const plan = pmIntensityHeartbeatPlan(0, sfxPlaying);
    plan.maxVol = 0;
    return plan;
  }
  if (!blobReady || count > PM_INTENSITY_PLAYER_MAX || !players || players.length < count) {
    return {
      maxVol: 0,
      residualKind: PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC,
      pureComplete: false,
      hostNeeded: true,
      pm2Pure: false,
      sfxId: PM_INTENSITY_SFX_ID,
      playFrameDelay: PM_INTENSITY_PLAY_FRAME_DELAY,
      playLoop: PM_INTENSITY_PLAY_LOOP,
      playPitch: f32FromBits(PM_INTENSITY_PLAY_PITCH_BITS),
      playPan: f32FromBits(PM_INTENSITY_PLAY_PAN_BITS),
    };
  }
  const maxVol = pmIntensityMaxOverPlayers(players.slice(0, count));
  const plan = pmIntensityHeartbeatPlan(maxVol, sfxPlaying);
  plan.pm2Pure = true;
  return plan;
}

export function pmIntensitySfxId() {
  return PM_INTENSITY_SFX_ID;
}

export function pmIntensityPlayFrameDelay() {
  return PM_INTENSITY_PLAY_FRAME_DELAY;
}

export function pmIntensityPlayLoop() {
  return PM_INTENSITY_PLAY_LOOP;
}

export function pmIntensityPlayPitch() {
  return PLAY_PITCH;
}

export function pmIntensityPlayPan() {
  return PLAY_PAN;
}

export function pmPlayerCountFromSpan(spanBytes) {
  return asI32(spanBytes) >> PM_PLAYER_PTR_SHIFT;
}

export function pmPlayerIndexSelect(index, count) {
  return asU32(index) < asU32(count) ? asI32(index) : 0;
}

export function pmWalkEnter(count) {
  return asI32(count) !== 0;
}

export function pmWalkNeedsEmptyFatal(countNow) {
  return asI32(countNow) === 0;
}

export function pmWalkContinue(nextIndex, countReloaded) {
  return asU32(nextIndex) < asU32(countReloaded);
}

export function pmSfxEntryCountFromSpan(spanBytes) {
  const magic = PM_SFX_ENTRY_DIV_MAGIC | 0;
  const span = spanBytes | 0;
  const product = BigInt(magic) * BigInt(span);
  const high = Number(BigInt.asUintN(64, product) >> 32n) | 0;
  const shifted = high >> (PM_SFX_ENTRY_DIV_SHIFT | 0);
  const sign = shifted >>> 31;
  return (shifted + sign) | 0;
}

export function pmSfxEntryByteOffset(id) {
  return Math.imul(asI32(id), PM_SFX_ENTRY_STRIDE) | 0;
}

export function pmSfxEntryIndexInRange(id, spanBytes) {
  if (id < 0) {
    return false;
  }
  return !!(id < pmSfxEntryCountFromSpan(spanBytes));
}

export function pmSfxEntryGate(id, spanBytes, voices190, enabled198) {
  if ((id | 0) < 0) return PM_SFX_GATE_MISS;
  if ((id | 0) >= pmSfxEntryCountFromSpan(spanBytes)) return PM_SFX_GATE_MISS;
  if ((voices190 >>> 0) === 0) return PM_SFX_GATE_NO_SAMPLES;
  if ((enabled198 & 0xff) === 0) return PM_SFX_GATE_DISABLED;
  return PM_SFX_GATE_LIVE;
}

export function pmSfxIsPlayingKnown(gateKind) {
  return asI32(gateKind) !== PM_SFX_GATE_LIVE;
}

export function pmSfxIsPlayingPureResult(gateKind) {
  /* Every non-LIVE gate falls through to `xor al,al` at VA 0x0092e5ff. */
  void gateKind;
  return 0;
}

export function pmSfxMutatorPureComplete(gateKind) {
  return !!(gateKind === PM_SFX_GATE_MISS ||
          gateKind === PM_SFX_GATE_DISABLED);
}

export function pmSfxManagerReceiver(globalC7169c) {
  return asU32(asU32(globalC7169c) + PM_SFX_MANAGER_OFF);
}

export function pmSfxEntryGatePlan(id, spanBytes, voices190, enabled198) {
  const kind = pmSfxEntryGate(id, spanBytes, voices190, enabled198);
  const inRange = pmSfxEntryIndexInRange(id, spanBytes);
  return {
    kind,
    entryCount: pmSfxEntryCountFromSpan(spanBytes),
    entryOffset: inRange ? pmSfxEntryByteOffset(id) : 0,
    indexInRange: inRange ? 1 : 0,
    probeKnown: pmSfxIsPlayingKnown(kind) ? 1 : 0,
    probeResult: pmSfxIsPlayingPureResult(kind),
    warnLogNeeded: kind === PM_SFX_GATE_NO_SAMPLES ? 1 : 0,
    voiceLoopNeeded: kind === PM_SFX_GATE_LIVE ? 1 : 0,
  };
}

export function pmPrePlayRngNext(seed, shift1, shift2, shift3) {
  /* PE VA 0x00956830..0x00956857; x86 shr/shl mask cl to 5 bits. */
  let x = seed >>> 0;
  x ^= x >>> (shift1 & 31);
  x = (x ^ (x << (shift2 & 31))) >>> 0;
  x ^= x >>> (shift3 & 31);
  return x >>> 0;
}

export function pmPrePlayRareHit(seedOut) {
  return asU32(seedOut) % PM_PRE_PLAY_RARE_MODULUS === 0;
}

export function pmPrePlayPlan({ gameNull = 0, entryFound = 0, seed = 0, shift1 = 2, shift2 = 7, shift3 = 7 } = {}) {
  if ((gameNull | 0) !== 0) {
    return {
      soundId: PM_PRE_PLAY_ID_DEFAULT,
      rngSeedOut: seed >>> 0,
      rngAdvanced: false,
      hostLookupNeeded: false,
      seedZeroFatal: false,
      pureComplete: true,
    };
  }
  if ((entryFound | 0) === 0) {
    return {
      soundId: PM_PRE_PLAY_ID_DEFAULT,
      rngSeedOut: seed >>> 0,
      rngAdvanced: false,
      hostLookupNeeded: true,
      seedZeroFatal: false,
      pureComplete: false,
    };
  }
  let id = PM_PRE_PLAY_ID_FOUND;
  if ((seed >>> 0) === 0) {
    return {
      soundId: id,
      rngSeedOut: 0,
      rngAdvanced: false,
      hostLookupNeeded: true,
      seedZeroFatal: true,
      pureComplete: false,
    };
  }
  const next = pmPrePlayRngNext(seed, shift1, shift2, shift3);
  if (pmPrePlayRareHit(next)) id = PM_PRE_PLAY_ID_RARE;
  return {
    soundId: id,
    rngSeedOut: next >>> 0,
    rngAdvanced: true,
    hostLookupNeeded: true,
    seedZeroFatal: false,
    pureComplete: true,
  };
}

export function pmPrePlaySoundId(gameNull, entryFound, seed, shift1, shift2, shift3) {
  if (gameNull !== null && typeof gameNull === "object") {
    const o = gameNull;
    return pmPrePlayPlan({
      gameNull: o.gameNull, entryFound: o.entryFound, seed: o.seed,
      shift1: o.shift1, shift2: o.shift2, shift3: o.shift3,
    }).soundId;
  }
  return pmPrePlayPlan({ gameNull, entryFound, seed, shift1, shift2, shift3 }).soundId;
}

export function pmIntensityPlayId(opts) {
  return pmPrePlaySoundId(opts);
}

export function pmTdEarlyKind(state2c, checkOnly) {
  /* PE 0x007a10ad: cmp dword [ebx+0x2c], 1 ; jne 0x007a10f0 */
  if (state2c !== 1) {
    return PM_TD_EARLY_NONE;
  }
  /* PE 0x007a10b3: cmp byte [ebp+8], 0 ; jne 0x007a1ca1
     The argument occupies a 4-byte stack slot but only its low byte is
     tested, so mask explicitly — the Wasm ABI does not narrow the i32
     parameter for us. */
  if ((checkOnly & 0xff) !== 0) {
    return PM_TD_EARLY_CHECK_ONLY;
  }
  return PM_TD_EARLY_REMOVE;
}

export function pmTdEarlyPureComplete(earlyKind) {
  return asI32(earlyKind) === PM_TD_EARLY_CHECK_ONLY;
}

export function pmTdEarlyReturnsFalse(earlyKind) {
  return !!(earlyKind === PM_TD_EARLY_CHECK_ONLY ||
          earlyKind === PM_TD_EARLY_REMOVE);
}

export function pmTdStaticGuardSlow(guard, tlsEpoch) {
  return asI32(guard) > asI32(tlsEpoch);
}

export function pmTdStaticGuardRunsInit(guardAfterHeader) {
  return asI32(guardAfterHeader) === -1;
}

export function pmTdStaticGuardGameEffect() {
  return 0;
}

export function pmTdTwinFirst(twinPtr, selfPtr, twinOrder161c, selfOrder161c) {
  /* PE 0x007a1123: cmp edx, -1  ; je  selfFirst
     PE 0x007a1128: cmp edx, [ebx+0x161c] ; jge selfFirst  (signed)
     PE 0x007a1130: cmp ecx, ebx ; je  selfFirst */
  if ((twinOrder161c | 0) === -1) {
    return false;
  }
  if ((twinOrder161c | 0) >= (selfOrder161c | 0)) {
    return false;
  }
  if (twinPtr === selfPtr) {
    return false;
  }
  return true;
}

export function pmTdOrderPlan(twinPtr, selfPtr, twinOrder161c, selfOrder161c) {
  const twinPresent = (twinPtr >>> 0) !== 0;
  const firstIsTwin = twinPresent && pmTdTwinFirst(twinPtr, selfPtr, twinOrder161c, selfOrder161c);
  return {
    count: twinPresent ? 2 : 1,
    firstIsTwin,
    secondIsTwin: twinPresent && !firstIsTwin,
    twinPresent,
  };
}

export function pmTdPushNeedsGrow(vecEnd, vecCap) {
  return asU32(vecEnd) === asU32(vecCap);
}

export function pmTdPocketSlotClamp(index) {
  return Math.min(Math.max(asI32(index), 0), PM_TD_POCKET_CLAMP_MAX) | 0;
}

export function pmTdPocketSlotOffset(slot) {
  /* PE addressing: [ebx + ecx*8 + 0x17a0]. */
  let off =
      asU32(PM_TD_OFF_POCKET_BASE_17A0) +
      asU32(slot) *
          asU32(PM_TD_POCKET_STRIDE);
  return asI32(off);
}

export function pmTdPocketMatch(id, type) {
  /* PE 0x007a1630: cmp dword [eax+4],1 ; jne next
     PE 0x007a1636: cmp dword [eax],0x59 ; je found */
  if (type !== PM_TD_POCKET_MATCH_TYPE) {
    return false;
  }
  return !!(id === PM_TD_POCKET_MATCH_ID);
}

export function pmTdPocketFind(slots) {
  if (!slots) return PM_TD_POCKET_SLOTS;
  const n = Math.min(slots.length, PM_TD_POCKET_SLOTS);
  for (let k = 0; k < n; k += 1) {
    if (pmTdPocketMatch(slots[k].id, slots[k].type)) return k;
  }
  return PM_TD_POCKET_SLOTS;
}

export function pmTdPocketCompactDwords(foundIndex) {
  /* PE 0x007a1646: cmp ecx,3 ; jae 0x007a166f (skip the copy entirely). */
  if (foundIndex >= PM_TD_POCKET_CLAMP_MAX) {
    return 0;
  }
  if (foundIndex < 0) {
    return 0;
  }
  /* PE: mov eax,3 ; sub eax,ecx ; add eax,eax ; and eax,0x3ffffffe */
  let doubled = asU32(
      (PM_TD_POCKET_CLAMP_MAX - foundIndex) * 2);
  return asI32(
      doubled & asU32(PM_TD_COMPACT_DWORD_MASK));
}

export function pmTdPocketCompact(slotsIn) {
  const slots = (slotsIn || []).map((s) => ({ id: s.id | 0, type: s.type | 0 }));
  while (slots.length < PM_TD_POCKET_SLOTS) slots.push({ id: 0, type: 0 });
  const foundIndex = pmTdPocketFind(slots);
  const found = foundIndex < PM_TD_POCKET_SLOTS;
  const shiftDwords = found ? pmTdPocketCompactDwords(foundIndex) : 0;
  if (found) {
    for (let i = foundIndex; i < PM_TD_POCKET_SLOTS - 1; i += 1) {
      slots[i] = { id: slots[i + 1].id, type: slots[i + 1].type };
    }
    slots[PM_TD_POCKET_SLOTS - 1] = {
      id: PM_TD_POCKET_LAST_ID_VALUE | 0,
      type: PM_TD_POCKET_LAST_TYPE_VALUE | 0,
    };
  }
  return {
    plan: {
      foundIndex,
      found,
      shiftDwords,
      lastSlotId: found ? (PM_TD_POCKET_LAST_ID_VALUE | 0) : 0,
      lastSlotType: found ? (PM_TD_POCKET_LAST_TYPE_VALUE | 0) : 0,
      storesApplied: found,
    },
    slots: slots.slice(0, PM_TD_POCKET_SLOTS),
  };
}

export function pmTdListScanSkipped(skip1519) {
  return asU8(skip1519) !== 0;
}

export function pmTdListElemMatch(elemTag, elemId) {
  /* PE 0x007a1252: cmp dword [edx],0 ; jne next
     PE 0x007a1257: cmp dword [edx+4],0x71 ; je found */
  if (elemTag !== PM_TD_LIST_MATCH_TAG) {
    return false;
  }
  return !!(elemId === PM_TD_LIST_MATCH_ID);
}

export function pmTdListWalkTerminates(listBegin, listEnd) {
  let span = asI32(listEnd - listBegin);
  if (span < 0) {
    return false;
  }
  return !!((span % PM_TD_LIST_ELEM_STRIDE) === 0);
}

export function pmTdListWalkSteps(listBegin, listEnd) {
  if (!pmTdListWalkTerminates(listBegin, listEnd)) {
    return -1;
  }
  let span = asI32(asU32(listEnd) - asU32(listBegin));
  return (span / PM_TD_LIST_ELEM_STRIDE) | 0;
}

export function pmTdProbeAPlayerMatch(hasCollectible) {
  return asU8(hasCollectible) !== 0;
}

export function pmTdProbeAScan(hasFlags) {
  if (!hasFlags || hasFlags.length <= 0) return -1;
  for (let i = 0; i < hasFlags.length; i += 1) {
    if (pmTdProbeAPlayerMatch(hasFlags[i])) return i;
  }
  return -1;
}

export function pmTdProbeBPath(pending2ef8, id, pendingFlag2ef0) {
  /* PE 0x007a1042: mov eax,[ecx+0x2ef8] ; test eax,eax ; je plain
     PE 0x007a104c: cmp eax, edi          ; jne plain
     PE 0x007a1050: cmp byte [ecx+0x2ef0],0 ; jne found */
  if (pending2ef8 === 0 || pending2ef8 !== id) {
    return PM_TD_PROBE_B_PATH_COUNT_GT0;
  }
  if ((pendingFlag2ef0 & 0xff) !== 0) {
    return PM_TD_PROBE_B_PATH_IMMEDIATE;
  }
  return PM_TD_PROBE_B_PATH_COUNT_GT1;
}

export function pmTdProbeBNeedsCountProbe(path) {
  return asI32(path) !== PM_TD_PROBE_B_PATH_IMMEDIATE;
}

export function pmTdProbeBPlayerMatch(path, count) {
  /* PE: `cmp eax,1 ; setg` on the pending path, `test eax,eax ; setg`
     otherwise — both signed. */
  if (path === PM_TD_PROBE_B_PATH_IMMEDIATE) {
    return true;
  }
  if (path === PM_TD_PROBE_B_PATH_COUNT_GT1) {
    return !!(count > 1);
  }
  return !!(count > 0);
}

export function pmTdProbeBScan(players, id) {
  if (!players || players.length <= 0) return -1;
  for (let i = 0; i < players.length; i += 1) {
    const p = players[i];
    const path = pmTdProbeBPath(
      p.pending2ef8 ?? p.pending_2ef8 ?? p.pending ?? 0,
      id,
      p.pendingFlag2ef0 ?? p.pending_flag_2ef0 ?? p.flag ?? 0,
    );
    if (pmTdProbeBPlayerMatch(path, p.count ?? p.counts ?? 0)) return i;
  }
  return -1;
}

export function pmTdCascadeStageCount() {
  return PM_TD_CASCADE_STAGES;
}

export function pmTdCascadeStageId(stageIndex) {
  switch (stageIndex) {
    case 0: return 0x0b;   /* 0x007a12d4 */
    case 1: return 0x00;   /* 0x007a1848 — character-type stage, no id */
    case 2: return 0x51;   /* 0x007a1878 */
    case 3: return 0x2b0;  /* 0x007a1936 */
    case 4: return 0xd4;   /* 0x007a199d */
    case 5: return 0x14c;  /* 0x007a1a09 */
    case 6: return 0xa1;   /* 0x007a1a70 */
    case 7: return 0x1c;   /* 0x007a1ab3 */
    case 8: return 0x137;  /* 0x007a1b66 */
    case 9: return 0x17;   /* 0x007a1ba9 */
    default: return -1;
  }
}

export function pmTdCascadeProbeKind(stageIndex) {
  if (cascadeInRange(stageIndex) === 0) {
    return -1;
  }
  if (stageIndex === 1) {
    return PM_TD_PROBE_KIND_NONE;
  }
  if (stageIndex === 7 || stageIndex === 9) {
    return PM_TD_PROBE_KIND_B;
  }
  return PM_TD_PROBE_KIND_A;
}

export function pmTdCascadeGuardKind(stageIndex) {
  if (cascadeInRange(stageIndex) === 0) {
    return -1;
  }
  if (stageIndex === 1) {
    return PM_TD_GUARD_CHAR_TYPE;
  }
  if (stageIndex === 4) {
    return PM_TD_GUARD_RNG_BIT;
  }
  if (stageIndex === 9) {
    return PM_TD_GUARD_STAGE17;
  }
  return PM_TD_GUARD_NONE;
}

export function pmTdCascadeStageVa(stageIndex) {
  switch (stageIndex) {
    case 0: return 0x007a12d4;
    case 1: return 0x007a1848;
    case 2: return 0x007a1878;
    case 3: return 0x007a1936;
    case 4: return 0x007a199d;
    case 5: return 0x007a1a09;
    case 6: return 0x007a1a70;
    case 7: return 0x007a1ab3;
    case 8: return 0x007a1b66;
    case 9: return 0x007a1ba9;
    default: return 0;
  }
}

export function pmTdCascadeFirstMatch(matched) {
  if (!matched || matched.length <= 0) return -1;
  for (let i = 0; i < matched.length; i += 1) {
    if ((matched[i] | 0) !== 0) return i;
  }
  return -1;
}

export function pmTdStageD4Guard(rngFirstByte) {
  return (asU8(rngFirstByte) & 1) !== 0;
}

export function pmTdStage1cValue(count1, count2) {
  /* PE 0x007a1ad0: cmp eax,1 ; jne alt ; lea edi,[eax+0x15]  (eax === 1) */
  if (count1 === 1) {
    return 1 + 0x15;
  }
  /* PE 0x007a1ae3: cmp eax,2 ; mov edi,0x32 ; mov ecx,0x21 ; cmove edi,ecx */
  return count2 === 2 ? 0x21 : 0x32;
}

export function pmTdStage1cSecondProbeNeeded(count1) {
  return asI32(count1) !== 1;
}

export function pmTdStage17Path(mgr9e, mgr8, gamePtr, game26630, game26589) {
  /* PE 0x007a1bc2: cmp byte [eax+0x9e],0 ; jne 0x007a1c10 */
  if ((mgr9e & 0xff) !== 0) {
    return PM_TD_STAGE17_PATH_X;
  }
  /* PE 0x007a1bcb: cmp dword [eax+8],2 ; jne 0x007a1bec */
  if (mgr8 !== PM_TD_STAGE17_MGR_8_MATCH) {
    return PM_TD_STAGE17_PATH_Y;
  }
  /* PE 0x007a1bd6: test eax,eax ; je 0x007a1bec */
  if (gamePtr === 0) {
    return PM_TD_STAGE17_PATH_Y;
  }
  /* PE 0x007a1bda: cmp dword [eax+0x26630],0 ; ja 0x007a1c10 (unsigned) */
  if (game26630 !== 0) {
    return PM_TD_STAGE17_PATH_X;
  }
  /* PE 0x007a1be3: cmp byte [eax+0x26589],0 ; jne 0x007a1c10 */
  if ((game26589 & 0xff) !== 0) {
    return PM_TD_STAGE17_PATH_X;
  }
  return PM_TD_STAGE17_PATH_Y;
}

export function pmTdStage17Result(path, checkOnly, game18300Field8) {
  let co = (checkOnly & 0xff) !== 0 ? 1 : 0;
  if (path === PM_TD_STAGE17_PATH_X) {
    /* PE 0x007a1c10: cmp byte [ebp+8],0 ; jne 0x007a21c4 */
    return co !== 0 ? PM_TD_STAGE17_RESULT_TRUE
                   : PM_TD_STAGE17_RESULT_HOST;
  }
  /* PE 0x007a1bec: cmp byte [ebp+8],0 ; je 0x007a1335 (host) */
  if (co === 0) {
    return PM_TD_STAGE17_RESULT_HOST;
  }
  /* PE 0x007a1c01: cmp dword [Game[0x18300] + 8], 0xd ; jne 0x007a1ca1 */
  return game18300Field8 === PM_TD_STAGE17_ACCEPT_VALUE
             ? PM_TD_STAGE17_RESULT_TRUE
             : PM_TD_STAGE17_RESULT_FALSE;
}

export function pmTdCascadeCheckOnlyReturnsTrue(stageIndex) {
  if (cascadeInRange(stageIndex) === 0) {
    return false;
  }
  /* Stage 9 has its own rule (isaacPmTdStage17Result). */
  if (pmTdCascadeGuardKind(stageIndex) === PM_TD_GUARD_STAGE17) {
    return false;
  }
  return true;
}

export function pmTdRvhReviveCalled(order161c) {
  return !(asI32(order161c) < 0);
}

export function pmTdRvhChainFlag(chainPtr, chainField8, chainField0) {
  /* PE 0x007a240b: test eax,eax ; je clear
     PE 0x007a240f: cmp [eax+8], 0x10 ; jne clear
     PE 0x007a2415: cmp [eax], 0x23   ; je set */
  if (chainPtr === 0) {
    return false;
  }
  if (chainField8 !== PM_TD_RVH_CHAIN_FIELD8_MATCH) {
    return false;
  }
  return !!(chainField0 === PM_TD_RVH_CHAIN_FIELD0_MATCH);
}

export function pmTdRvhRegion(id) {
  /* PE order: signed jg, then je, then an unsigned biased range test. */
  if ((id | 0) > (PM_TD_RVH_ID_HIGH_BOUND | 0)) {
    return PM_TD_RVH_REGION_HIGH;
  }
  if ((id | 0) === (PM_TD_RVH_ID_HIGH_BOUND | 0)) {
    return PM_TD_RVH_REGION_EQ137;
  }
  let idx = asU32(asU32(id) - asU32(PM_TD_RVH_TABLE_BIAS));
  if (idx > asU32(PM_TD_RVH_TABLE_LIMIT)) {
    return PM_TD_RVH_REGION_DEFAULT;
  }
  return PM_TD_RVH_REGION_TABLE;
}

export function pmTdRvhTableIndex(id) {
  if (pmTdRvhRegion(id) !== PM_TD_RVH_REGION_TABLE) {
    return -1;
  }
  return asI32(asU32(id) -
                              asU32(PM_TD_RVH_TABLE_BIAS));
}

export function pmTdRvhRegionVa(region) {
  switch (region) {
    case PM_TD_RVH_REGION_EQ137: return 0x007a28e9;
    case PM_TD_RVH_REGION_HIGH: return 0x007a2a11;
    case PM_TD_RVH_REGION_DEFAULT: return 0x007a2a32;
    default: return 0;
  }
}

export function pmTdRvhTableCase(id) {
  /* Literal contents of the 202-byte table at 0x007a335c, expressed as a
     compare chain so the helper needs no linear memory. Only four indices
     hold a value other than 4. */
  if (pmTdRvhRegion(id) !== PM_TD_RVH_REGION_TABLE) {
    return -1;
  }
  switch (id) {
    case PM_TD_RVH_ID_CASE0: return 0;
    case PM_TD_RVH_ID_CASE1: return 1;
    case PM_TD_RVH_ID_CASE2: return 2;
    case PM_TD_RVH_ID_CASE3: return 3;
    default: return PM_TD_RVH_TABLE_CASE_DEFAULT;
  }
}

export function pmTdRvhDispatchVa(id) {
  let region = pmTdRvhRegion(id);

  if (region === PM_TD_RVH_REGION_EQ137) {
    return PM_TD_RVH_VA_EQ137;
  }

  if (region === PM_TD_RVH_REGION_HIGH) {
    /* PE 0x007a2a11: three cumulative `sub`/`je` steps, then fallthrough
       lands exactly on 0x007a2a32 (the shared DEFAULT). */
    switch (id | 0) {
      case PM_TD_RVH_ID_HIGH0: return PM_TD_RVH_VA_HIGH0;
      case PM_TD_RVH_ID_HIGH1: return PM_TD_RVH_VA_HIGH1;
      case PM_TD_RVH_ID_HIGH2: return PM_TD_RVH_VA_HIGH2;
      default: return PM_TD_RVH_VA_DEFAULT;
    }
  }

  if (region === PM_TD_RVH_REGION_DEFAULT) {
    return PM_TD_RVH_VA_DEFAULT;
  }

  /* REGION_TABLE: resolve the byte-table case to its jump-table target. */
  switch (pmTdRvhTableCase(id)) {
    case 0: return PM_TD_RVH_VA_CASE0;
    case 1: return PM_TD_RVH_VA_CASE1;
    case 2: return PM_TD_RVH_VA_CASE2;
    case 3: return PM_TD_RVH_VA_CASE3;
    default: return PM_TD_RVH_VA_DEFAULT;
  }
}

export function pmTdRvhIsDefault(id) {
  return pmTdRvhDispatchVa(id) === PM_TD_RVH_VA_DEFAULT;
}

export function pmTdHeartGate(checkOnly, stopProbe, game18300Field8) {
  /* PE 0x007a11dc: cmp byte [ebp+8],0 ; jne skip            (checkOnly)
     PE 0x007a11ed: test al,al ; je skip                     (probe low byte)
     PE 0x007a11fc: cmp dword [eax+8],0xd ; jne skip         (full dword) */
  if ((checkOnly & 0xff) !== 0) {
    return 0;
  }
  if ((stopProbe & 0xff) === 0) {
    return 0;
  }
  return game18300Field8 === PM_TD_HEART_ACCEPT ? 1 : 0;
}

export function pmTdTailHold(charType13c0, has26b) {
  /* PE 0x007a1c47: cmp dword [ebx+0x13c0],0x1f ; jne 0x007a1c97
     PE 0x007a1c5e: test al,al ; je 0x007a1c97 (low byte) */
  if (charType13c0 !== PM_TD_TAIL_CHAR_MATCH) {
    return 0;
  }
  return (has26b & 0xff) !== 0 ? 1 : 0;
}

export function pmTdTailCheckOnlyResult(charType, has26b) {
  return pmTdTailHold(charType, has26b);
}

export function pmTdTailHostReviveNeeded(checkOnly, charType13c0, has26b) {
  /* 0x007a1c6c..0x007a1c92: !checkOnly && hold . 0x0078f840 + rvh. */
  if ((checkOnly & 0xff) !== 0) {
    return 0;
  }
  return pmTdTailHold(charType13c0, has26b) !== 0 ? 1 : 0;
}

export function pmTdCheckOnlyTermination(firstMatch, stage17Result, tailHold) {
  /* Cascade matched: every stage returns TRUE at 0x007a21c4 except stage 9,
     whose isaacPmTdStage17Result can be FALSE (0x007a1ca1). Cascade
     fell through (firstMatch === -1): the tail decides. */
  if (firstMatch === -1) {
    return tailHold !== 0 ? 1 : 0;
  }
  return stage17Result === PM_TD_STAGE17_RESULT_FALSE ? 0 : 1;
}

export function pmTdVecSpanAligned(span) {
  return asI32(asU32(span) & 0xfffffff0);
}

export function pmTdVecWarnNeeded(spanAligned, limitBytes) {
  return asI32(spanAligned) > limitBytes ? 0 : 1;
}

export function pmTdVecSlotIndex(span, limitEntries) {
  /* PE 0x007a1b2b / 0x007a20d2: sub; sar edx,4 ; lea eax,[edx-1] ;
     cmp eax, limit ; cmovb (UNSIGNED) . slot index in [0, limit]. */
  let count = span >> 4;
  let last = count - 1;
  if (asU32(last) < asU32(limitEntries)) {
    return last;
  }
  return limitEntries;
}

export function pmTdVecSlotOffset(span, limitEntries) {
  return asI32(pmTdVecSlotIndex(span, limitEntries) << 4);
}

export function pmTdRngRecordNext(seed, shift1, shift2, shift3) {
  /* PE 0x007a2100..0x007a211b — same three-step xorshift as PMP. */
  return pmPrePlayRngNext(seed, shift1, shift2, shift3);
}

export function pmTdRngSeedZero(seed) {
  return seed === 0 ? 1 : 0;
}

export function pmTdRngSeedStillZero(seedReloaded) {
  return seedReloaded === 0 ? 1 : 0;
}

export function pmTdCharDeathPath(charType13c0) {
  /* PE 0x007a14f6 / 0x007a1df0: full-dword compares. */
  switch (charType13c0) {
    case 0x10:
    case 0x23:
      return PM_TD_CHAR_PATH_0;
    case 0xa:
    case 0x1f:
    case 0x27:
      return PM_TD_CHAR_PATH_1;
    default:
      return PM_TD_CHAR_PATH_2;
  }
}

export function pmTdDeathSeqKind(dead173, fatalNull, state2c, fatalState28, hasEffect29b) {
  /* PE 0x007a13dd: cmp byte [edi+0x173],0 ; je 0x007a1f74
     PE 0x007a13f0: test esi,esi ; je 0x007a1f56
     PE 0x007a13f8: cmp dword [edi+0x2c],0 ; jne 0x007a1f56
     PE 0x007a1402: cmp dword [esi+0x28],1 ; jne 0x007a1f56
     PE 0x007a1422: test al,al ; je 0x007a1de7 (low byte) */
  if ((dead173 & 0xff) === 0) {
    return PM_TD_SEQ_NOT_DEAD;
  }
  if (fatalNull !== 0 || state2c !== 0 ||
      fatalState28 !== 1) {
    return PM_TD_SEQ_REMOVE;
  }
  return (hasEffect29b & 0xff) !== 0 ? PM_TD_SEQ_FULL
                                        : PM_TD_SEQ_ALT;
}

export function pmTdGhostMorphGate(dead173, fatalNull, isCoop, coopCount, flag20a9) {
  /* PE 0x007a1376: cmp byte [edi+0x173],0 ; je skip        (dead)
     PE 0x007a137f: cmp dword [edi+0x3bc],0 ; jne skip      (fatal)
     PE 0x007a139d: test al,al ; je skip                   (isCoop low byte)
     PE 0x007a13aa: cmp eax,1 ; jbe skip                   (UNSIGNED)
     PE 0x007a13af: cmp byte [edi+0x20a9],0 ; jne skip     (flag low byte) */
  if ((dead173 & 0xff) === 0) {
    return 0;
  }
  if (fatalNull !== 0) {
    return 0;
  }
  if ((isCoop & 0xff) === 0) {
    return 0;
  }
  if (coopCount <= 1) {
    return 0;
  }
  return (flag20a9 & 0xff) === 0 ? 1 : 0;
}

export function pmTdResetReviveNeeded(order) {
  return order >= 0 ? 1 : 0;
}

export function pmTdResetHealthBranch(fatal1340, healthType1, healthType2, charType13c0) {
  /* PE 0x007a16f4: cmp dword [edi+0x1340],0 ; jle 0x007a1716
     PE 0x007a1705: cmp eax,3 (probe 1) ; jne done
     PE 0x007a171d: cmp eax,4 (probe 1) ; jne 0x007a1735
     PE 0x007a173a: cmp eax,3 (probe 2, re-issued) ; jne 0x007a1755
     PE 0x007a1755: cmp dword [edi+0x13c0],0x12 ; jne 0x007a1774 */
  if (fatal1340 > 0) {
    return healthType1 === 3 ? PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (healthType1 === 4) {
    return PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (healthType2 === 3) {
    return PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return charType13c0 === PM_TD_RESET_CHAR_MATCH
             ? PM_TD_RESET_BRANCH_CHAR_12
             : PM_TD_RESET_BRANCH_ELSE;
}

export function pmTdResetBoneHearts(branch) {
  return branch === PM_TD_RESET_BRANCH_LE0_HT1_EQ4 ? 1 : 0;
}

export function pmTdResetProbeCount(branch) {
  return branch <= PM_TD_RESET_BRANCH_LE0_HT1_EQ4 ? 1 : 2;
}

export function pmTdRvbBodyFromId(id) {
  /* Same classifier order as the PE head (0x007a2428..0x007a244f), then
     the byte-table/HIGH-chain resolution. Must agree with
     isaacPmTdRvhDispatchVa on every int32 (census test). */
  if ((id | 0) > (PM_TD_RVH_ID_HIGH_BOUND | 0)) {
    /* HIGH compare chain 0x007a2a11: sub 0x14c / sub 0x11f / sub 0x45. */
    switch (id | 0) {
      case PM_TD_RVH_ID_HIGH0: return PM_TD_RVB_BODY_HIGH0;
      case PM_TD_RVH_ID_HIGH1: return PM_TD_RVB_BODY_HIGH1;
      case PM_TD_RVH_ID_HIGH2: return PM_TD_RVB_BODY_HIGH2;
      default: return PM_TD_RVB_BODY_DEFAULT;
    }
  }
  if ((id | 0) === (PM_TD_RVH_ID_HIGH_BOUND | 0)) {
    return PM_TD_RVB_BODY_EQ137;
  }
  let idx = asU32(asU32(id) - asU32(PM_TD_RVH_TABLE_BIAS));
  if (idx > asU32(PM_TD_RVH_TABLE_LIMIT)) {
    return PM_TD_RVB_BODY_DEFAULT;
  }
  /* Byte table 0x007a335c: only four indices hold a case other than 4. */
  switch (id | 0) {
    case PM_TD_RVH_ID_CASE0: return PM_TD_RVB_BODY_CASE0;
    case PM_TD_RVH_ID_CASE1: return PM_TD_RVB_BODY_CASE1;
    case PM_TD_RVH_ID_CASE2: return PM_TD_RVB_BODY_CASE2;
    case PM_TD_RVH_ID_CASE3: return PM_TD_RVB_BODY_CASE3;
    default: return PM_TD_RVB_BODY_DEFAULT;
  }
}

export function pmTdRvbHasFlagGate(body) {
  return body >= PM_TD_RVB_BODY_CASE0 && body <= PM_TD_RVB_BODY_EQ137 ? 1 : 0;
}

export function pmTdRvbFlagArm(flag, fatal3bc, chainFlag) {
  /* PE (CASE0 site) 0x007a2590: cmp byte [ebx+0xc],0 ; je 0x007a3292
     PE 0x007a259a: cmp dword [edi+0x3bc],0 ; je 0x007a25cc
     PE 0x007a25cc: cmp byte [ebp-0x9d],0 ; jne 0x007a3292 */
  if ((flag & 0xff) === 0) {
    return PM_TD_RVB_ARM_SKIP;
  }
  if (fatal3bc !== 0) {
    return PM_TD_RVB_ARM_FATAL;
  }
  if ((chainFlag & 0xff) !== 0) {
    return PM_TD_RVB_ARM_CHAIN_SKIP;
  }
  return PM_TD_RVB_ARM_NOTIFY;
}

export function pmTdRvbNotifyStage(id) {
  /* mov edx, N sites: 0x007a25d9 (7), 0x007a26da (6), 0x007a2807 (8),
     0x007a28df (5), 0x007a29be (9). */
  switch (id) {
    case PM_TD_RVH_ID_CASE0: return PM_TD_RVB_STAGE_CASE0;
    case PM_TD_RVH_ID_CASE1: return PM_TD_RVB_STAGE_CASE1;
    case PM_TD_RVH_ID_CASE2: return PM_TD_RVB_STAGE_CASE2;
    case PM_TD_RVH_ID_CASE3: return PM_TD_RVB_STAGE_CASE3;
    case PM_TD_RVH_ID_HIGH_BOUND: return PM_TD_RVB_STAGE_EQ137;
    default: return -1;
  }
}

export function pmTdRvbNotifyClamp(game1831c) {
  /* PE 0x007a29ce: cmp eax,-1 ; jle . or esi,0xffffffff
     PE 0x007a29d5: cmp eax,7 ; jl keep ; mov esi,7 */
  if (game1831c <= -1) {
    return -1;
  }
  return game1831c < PM_TD_RVB_NOTIFY_CLAMP_MAX
             ? game1831c
             : PM_TD_RVB_NOTIFY_CLAMP_MAX;
}

export function pmTdRvbNotifyMod4(game1831c) {
  /* PE 0x007a29f4: and eax,0x80000003 ; jns done ; dec eax ;
     or eax,0xfffffffc ; inc eax — MSVC signed %4, applied to the
     UNCLAMPED value. */
  let a = asU32(game1831c) & 0x80000003;
  if (asI32(a) >= 0) {
    return asI32(a);
  }
  a -= 1;
  a |= 0xfffffffc;
  a += 1;
  return asI32(a);
}

export function pmTdRvbExitRouteVa(arm) {
  /* Notify ends `jmp 0x7a32b9` (0x007a2a0c); the other arms rejoin the
     floor block at 0x007a3292. */
  return arm === PM_TD_RVB_ARM_NOTIFY
             ? asU32(PM_TD_RVB_VA_EXIT_NOTIFY)
             : asU32(PM_TD_RVB_VA_EXIT_FLOOR);
}

export function pmTdRvbTimerFloor(cur13bc) {
  /* PE 0x007a329f: cmp dword [ecx],0x5a ; cmovge eax,ecx — keep the
     current value only when it is >= 0x5a (signed). */
  return cur13bc >= PM_TD_RVB_TIMER_5A ? cur13bc
                                              : PM_TD_RVB_TIMER_5A;
}

export function pmTdRvbHealApplies(red194c, capacity) {
  return asI32(red194c) > asI32(capacity) ? 1 : 0;
}

export function pmTdRvbHealExcess(red194c, capacity) {
  /* PE 0x007a3317: sub eax,esi ; push eax — the raw wrapped difference. */
  if (red194c <= capacity) {
    return 0;
  }
  return asI32(asU32(red194c) -
                              asU32(capacity));
}

export function pmTdRvbCase0Branch(healthType, fatal1340, charType13c0) {
  /* PE 0x007a2499: cmp eax,1 ; jne 0x7a24f7
     PE 0x007a24f7: cmp eax,4 ; jne 0x7a2532
     PE 0x007a2532: cmp dword [edi+0x1340],0 ; jne 0x7a2589   (ANY nonzero)
     PE 0x007a253b: cmp eax,3 ; jne 0x7a2556
     PE 0x007a2556: cmp dword [edi+0x13c0],0x12 ; jne 0x7a2575
     One GetHealthType probe serves all three compares — unlike CASE3,
     which re-probes on the low path. */
  if (healthType === 1) {
    return PM_TD_RVB_CASE0_BRANCH_HT1;
  }
  if (healthType === 4) {
    return PM_TD_RVB_CASE0_BRANCH_HT4;
  }
  if (fatal1340 !== 0) {
    return PM_TD_RVB_CASE0_BRANCH_KEEP;
  }
  if (healthType === 3) {
    return PM_TD_RVB_CASE0_BRANCH_HT3;
  }
  if (charType13c0 === PM_TD_RESET_CHAR_MATCH) {
    return PM_TD_RVB_CASE0_BRANCH_CHAR12;
  }
  return PM_TD_RVB_CASE0_BRANCH_ELSE;
}

export function pmTdRvbCase0BoneArg(cfgB0) {
  return rvbSarHalf(cfgB0);
}

export function pmTdRvbCase0CfgProbes(branch) {
  /* HT1 calls 0x0069bd10 at 0x007a24bb AND again at 0x007a24d9 (the PE
     re-issues the config lookup; folding it is the per-iteration-reload
     defect class). HT4 calls it once at 0x007a2518. */
  if (branch === PM_TD_RVB_CASE0_BRANCH_HT1) {
    return 2;
  }
  return branch === PM_TD_RVB_CASE0_BRANCH_HT4 ? 1 : 0;
}

export function pmTdRvbCase1Branch(healthType) {
  /* PE 0x007a261c: cmp eax,1 ; 0x007a2637: cmp eax,4 ;
     0x007a264f: cmp eax,2 ; else. Single probe. */
  if (healthType === 1) {
    return PM_TD_RVB_CASE1_BRANCH_HT1;
  }
  if (healthType === 4) {
    return PM_TD_RVB_CASE1_BRANCH_HT4;
  }
  if (healthType === 2) {
    return PM_TD_RVB_CASE1_BRANCH_HT2;
  }
  return PM_TD_RVB_CASE1_BRANCH_ELSE;
}

export function pmTdRvbCase1Soul2(branch) {
  /* HT4 jumps to 0x007a2674 and ELSE falls through to it: both store
     [0x1344]=2. HT1/HT2 jump past it to 0x007a267e. */
  return branch === PM_TD_RVB_CASE1_BRANCH_HT4 ||
                 branch === PM_TD_RVB_CASE1_BRANCH_ELSE
             ? 1
             : 0;
}

export function pmTdRvbCase1Recurse(twin1d98) {
  return asU32(twin1d98) !== 0 ? 1 : 0;
}

export function pmTdRvbCase3Branch(fatal1340, healthType1, healthType2, charType13c0) {
  /* PE 0x007a26e4 cmp / 0x007a2729 jle split; 0x007a273a cmp eax,3 on the
     gt0 arm; 0x007a2750 cmp eax,4; RE-PROBE 0x007a2768 then cmp eax,3;
     0x007a2788 cmp [0x13c0],0x12. Same shape as RESET 0x007a16af..0x1788;
     implemented from its own range, agreement pinned by test. */
  if (fatal1340 > 0) {
    return healthType1 === 3 ? PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (healthType1 === 4) {
    return PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (healthType2 === 3) {
    return PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return charType13c0 === PM_TD_RESET_CHAR_MATCH
             ? PM_TD_RESET_BRANCH_CHAR_12
             : PM_TD_RESET_BRANCH_ELSE;
}

export function pmTdRvbHigh2Branch(fatal1340, healthType1, healthType2, charType13c0) {
  /* PE 0x007a2acb cmp / 0x007a2b10 jle; 0x007a2b21 cmp eax,3;
     0x007a2b3a cmp eax,4; RE-PROBE 0x007a2b4f then cmp eax,3;
     0x007a2b76 cmp [0x13c0],0x12. Third sibling of the RESET machine. */
  if (fatal1340 > 0) {
    return healthType1 === 3 ? PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (healthType1 === 4) {
    return PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (healthType2 === 3) {
    return PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return charType13c0 === PM_TD_RESET_CHAR_MATCH
             ? PM_TD_RESET_BRANCH_CHAR_12
             : PM_TD_RESET_BRANCH_ELSE;
}

export function pmTdRvbCase2NewChar(charType13c0) {
  /* PE 0x007a2818 cmp [0x13c0],0x19 ; 0x007a286f je keep ;
     0x007a2871 mov [0x13c0],4. */
  return charType13c0 === PM_TD_RVB_CASE2_CHAR_KEEP
             ? charType13c0
             : PM_TD_RVB_CASE2_CHAR_NEW;
}

export function pmTdRvbEq137NewChar(charType13c0) {
  /* PE 0x007a28f0 cmp [0x13c0],0x18 ; 0x007a2933 je ; mov [0x13c0],0xc. */
  return charType13c0 === PM_TD_RVB_EQ137_CHAR_KEEP
             ? charType13c0
             : PM_TD_RVB_EQ137_CHAR_NEW;
}

export function pmTdRvbHigh0NewChar(charType13c0) {
  /* PE 0x007a318e cmp eax,0x1d ; je ; cmp eax,0x26 ; je ;
     mov [0x13c0],0xb. */
  if (charType13c0 === PM_TD_RVB_HIGH0_CHAR_KEEP_A ||
      charType13c0 === PM_TD_RVB_HIGH0_CHAR_KEEP_B) {
    return charType13c0;
  }
  return PM_TD_RVB_HIGH0_CHAR_NEW;
}

export function pmTdRvbHigh2CharPath(charType13c0) {
  /* PE 0x007a2be3: cmp 0x10 / cmp 0x23 . 0x7a2da3; cmp 0xa / 0x1f / 0x27
     . 0x7a2d29; else fallthrough 0x7a2c10. Same sets as the v10 CHAR
     dispatch; agreement pinned by test. */
  if (charType13c0 === 0x10 || charType13c0 === 0x23) {
    return PM_TD_CHAR_PATH_0;
  }
  if (charType13c0 === 0xa || charType13c0 === 0x1f ||
      charType13c0 === 0x27) {
    return PM_TD_CHAR_PATH_1;
  }
  return PM_TD_CHAR_PATH_2;
}

export function pmTdRvbHigh2FirstSfx(path) {
  /* Path 0 plays 0x1b at 0x007a2daf; path 1 plays only 0x50 at
     0x007a2d35; path 2 plays 0x1c at 0x007a2c1c. NOT the v10 CHAR site's
     0x1e default — different site, different id. */
  switch (path) {
    case PM_TD_CHAR_PATH_0: return PM_TD_RVB_SFX_1B;
    case PM_TD_CHAR_PATH_1: return PM_TD_RVB_SFX_50;
    default: return PM_TD_RVB_SFX_1C;
  }
}

export function pmTdRvbHigh2FirstSfxVolBits(path) {
  /* 0x3fa00000 (1.25) for paths 0/2 (0x007a2dd5 / 0x007a2c42);
     0x3f800000 (1.0) for path 1 (0x007a2d5b). */
  return path === PM_TD_CHAR_PATH_1
             ? asU32(PM_TD_RVB_SFX_VOL_1_0_BITS)
             : asU32(PM_TD_RVB_SFX_VOL_1_25_BITS);
}

export function pmTdRvbHigh2SfxCount(path) {
  return path === PM_TD_CHAR_PATH_1 ? 1 : 2;
}

export function pmTdRvbHigh0CostumeKind(charType13c0) {
  /* PE 0x007a30ac: cmp eax,8 ; je 0x7a30ee (skip the whole block)
     PE 0x007a30b1: cmp eax,0x23 ; je 0x7a30bd (skip only 0x007c3620). */
  if (charType13c0 === PM_TD_RVB_HIGH0_CHAR_SKIP_ALL) {
    return PM_TD_RVB_HIGH0_COSTUME_SKIP;
  }
  return charType13c0 === PM_TD_RVB_HIGH0_CHAR_NO_PRE
             ? PM_TD_RVB_HIGH0_COSTUME_NO_PRE
             : PM_TD_RVB_HIGH0_COSTUME_FULL;
}

export function pmTdRvbHigh0CfgInBounds(begin, end) {
  /* PE 0x007a30ce: sub eax,ecx ; and eax,0xfffffffc ; cmp eax,0x530 ;
     jg read — signed compare of the dword-aligned byte span. */
  let span = asI32((end - begin) & 0xfffffffc);
  return span > PM_TD_RVB_HIGH0_CFG_ELEM_OFF ? 1 : 0;
}

export function pmTdRvbHigh0ItemGate(begin, end, elemC4) {
  /* PE 0x007a31bd: sub ; and 0xfffffffc ; cmp eax,0xc4 ; jle skip
     PE 0x007a31cf: test eax,eax ; je skip. */
  let span = asI32((end - begin) & 0xfffffffc);
  if (span <= PM_TD_RVB_HIGH0_ITEM_ELEM_OFF) {
    return 0;
  }
  return elemC4 !== 0 ? 1 : 0;
}

export function pmTdRvbHigh0FatalUpdate(v1340) {
  /* PE 0x007a30fa: add eax,-2 (32-bit wrap) ; mov ecx,2 ; cmp ; cmovg
     ecx,eax ; mov [0x1340],ecx. */
  let t = asI32(asU32(v1340) - 2);
  return t > 2 ? t : 2;
}

export function pmTdRvbHigh0SoulUpdate(v1340) {
  /* PE 0x007a3131: cmp ecx,2 ; cmovle eax,edx ; mov eax,[eax] ;
     mov [0x1344],eax. ecx = max(v1340-2, 2) >= 2, so both arms produce
     2 — the faithful expression is kept, not folded. */
  let c = pmTdRvbHigh0FatalUpdate(v1340);
  return c <= 2 ? c : 2;
}

export function pmTdRvbHigh0ExtraLivesGate(has26b, charType13c0) {
  /* PE 0x007a3171: test al,al ; je (low byte of the 0x007706e0 probe,
     char re-read AFTER the call at 0x007a3175)
     PE 0x007a3175: cmp dword [edi+0x13c0],8 ; jne. */
  if ((has26b & 0xff) === 0) {
    return 0;
  }
  return charType13c0 === PM_TD_RVB_HIGH0_CHAR_SKIP_ALL ? 1 : 0;
}

export function pmTdRvbTwinPosAdopt(twin1d9c) {
  return asU32(twin1d9c) !== 0 ? 1 : 0;
}

export function pmTdRvbZeroMask(body) {
  switch (body) {
    case PM_TD_RVB_BODY_CASE0: return PM_TD_RVB_ZERO_MASK_CASE0;
    case PM_TD_RVB_BODY_CASE1: return PM_TD_RVB_ZERO_MASK_CASE1;
    case PM_TD_RVB_BODY_CASE2: return PM_TD_RVB_ZERO_MASK_CASE2;
    case PM_TD_RVB_BODY_CASE3: return PM_TD_RVB_ZERO_MASK_CASE3;
    case PM_TD_RVB_BODY_EQ137: return PM_TD_RVB_ZERO_MASK_EQ137;
    case PM_TD_RVB_BODY_HIGH0: return PM_TD_RVB_ZERO_MASK_HIGH0;
    case PM_TD_RVB_BODY_HIGH1: return PM_TD_RVB_ZERO_MASK_HIGH1;
    case PM_TD_RVB_BODY_HIGH2: return PM_TD_RVB_ZERO_MASK_HIGH2;
    case PM_TD_RVB_BODY_DEFAULT:
      return PM_TD_RVB_ZERO_MASK_DEFAULT;
    default: return -1;
  }
}

export function pmTdRvbConst134c(body) {
  switch (body) {
    case PM_TD_RVB_BODY_CASE2: return PM_TD_RVB_CASE2_CONST_134C;
    case PM_TD_RVB_BODY_EQ137: return PM_TD_RVB_EQ137_CONST_134C;
    case PM_TD_RVB_BODY_HIGH1: return PM_TD_RVB_HIGH1_CONST_134C;
    default: return -1;
  }
}

export function pmTdRvbCfgReceiver(managerPtr) {
  return asU32(asU32(managerPtr) + PM_TD_RVB_CFG_VEC_OFF);
}

export function pmTdRvbCfgCount(begin, end) {
  /* 0x0069bd27 sub ecx,edi — 32-bit wrapping subtraction, then read as a
     SIGNED dword by the one-operand imul. */
  let span = asI32(asU32(asU32(end) - asU32(begin)));
  /* 0x0069bd29 imul ecx — signed 64-bit product in EDX:EAX. Modelled as
     the machine sequence, never as `span / 0x148`. */
  let high = imul64High(PM_TD_RVB_CFG_DIV_MAGIC, span);
  /* 0x0069bd2b sar edx,7 — arithmetic, so it floors for negatives. */
  let shifted = high >> PM_TD_RVB_CFG_DIV_SHIFT;
  /* 0x0069bd30 shr eax,0x1f — the sign fix that turns the floor into a
     truncation toward zero. Dropping it breaks every negative span. */
  let signFix = asU32(shifted) >>> 31;
  /* 0x0069bd33 add eax,edx — 32-bit wrap. */
  return asI32(asU32(shifted) + signFix);
}

export function pmTdRvbCfgInRange(id, begin, end) {
  /* 0x0069bd18 test esi,esi ; 0x0069bd1a js — SIGNED sign test. An
     unsigned model can never take this branch and inverts the result for
     every id with bit 31 set. */
  if ((id | 0) < 0) {
    return 0;
  }
  /* 0x0069bd35 cmp esi,eax ; 0x0069bd37 jge — SIGNED. With a negative
     count (negative span) this is always true, so every id falls back. */
  return id >= pmTdRvbCfgCount(begin, end) ? 0 : 1;
}

export function pmTdRvbCfgEntry(id, begin, end) {
  if (pmTdRvbCfgInRange(id, begin, end) === 0) {
    /* 0x0069bd47 pop edi ; 0x0069bd48 xor eax,eax — the recovered
       fallback tail returns NULL and does nothing else. */
    return 0;
  }
  /* 0x0069bd39 imul eax,esi,0x148 then 0x0069bd3f add eax,edi — both
     32-bit wrapping. */
  let scaled = asU32(id) *
                          asU32(PM_TD_RVB_CFG_STRIDE);
  return asU32(scaled + begin);
}

export function pmTdRvbCfgExitVa(id, begin, end) {
  return pmTdRvbCfgInRange(id, begin, end) !== 0
             ? asU32(PM_TD_RVB_CFG_VA_RET_IN_RANGE)
             : asU32(PM_TD_RVB_CFG_VA_RET_FALLBACK);
}

export function pmTdRvbCase0CfgFieldOff(branch, probeIndex) {
  /* 0x007a24c7 mov eax,[eax+0xb4] (HT1 slot 0);
     0x007a24e6 mov eax,[eax+0xb8] (HT1 slot 1);
     0x007a251f mov eax,[eax+0xb0] (HT4 slot 0). */
  if (branch === PM_TD_RVB_CASE0_BRANCH_HT1) {
    if (probeIndex === PM_TD_RVB_CFG_PROBE_0) {
      return PM_TD_RVB_CFG_OFF_B4;
    }
    if (probeIndex === PM_TD_RVB_CFG_PROBE_1) {
      return PM_TD_RVB_CFG_OFF_B8;
    }
    return -1;
  }
  if (branch === PM_TD_RVB_CASE0_BRANCH_HT4 &&
      probeIndex === PM_TD_RVB_CFG_PROBE_0) {
    return PM_TD_RVB_CFG_OFF_B0;
  }
  return -1;
}

export function pmTdRvbCase0CfgFieldVa(branch, probeIndex, charType13c0, begin, end) {
  let field = pmTdRvbCase0CfgFieldOff(branch,
                                                            probeIndex);
  if (field < 0) {
    return 0;
  }
  /* Both HT1 probes read [p+0x13c0] ONCE at 0x007a24ae into edi, which
     0x0069bd10 preserves (push edi / pop edi), so slot 1 re-issues the
     probe with the identical id and receiver. The pointer is the same;
     only the field differs. The issuance COUNT stays 2 (v11). */
  let entry = pmTdRvbCfgEntry(charType13c0, begin,
                                                   end);
  if (entry === 0) {
    return 0;
  }
  return asU32(entry + asU32(field));
}

export function pmTdRvbCfgSiteNullChecked(callsiteVa) {
  switch (callsiteVa) {
    /* 0x005be4a9 test eax,eax ; je 0x005be4fe. */
    case asU32(PM_TD_RVB_CFG_SITE_5BE49E):
    /* 0x0065d7d3 test eax,eax ; je 0x0065d8c2. */
    case asU32(PM_TD_RVB_CFG_SITE_65D7CE):
    /* 0x008ecb90 test eax,eax ; je 0x008ecbd8. */
    case asU32(PM_TD_RVB_CFG_SITE_8ECB88):
      return PM_TD_RVB_CFG_SITE_CHECKED;
    /* 0x007a24c7 / 0x007a24e6 / 0x007a251f / 0x009a2e35 all dereference
       the returned pointer immediately. Original defect: reproduced. */
    case asU32(PM_TD_RVB_CFG_SITE_CASE0_HT1_A):
    case asU32(PM_TD_RVB_CFG_SITE_CASE0_HT1_B):
    case asU32(PM_TD_RVB_CFG_SITE_CASE0_HT4):
    case asU32(PM_TD_RVB_CFG_SITE_9A2E30):
      return PM_TD_RVB_CFG_SITE_UNCHECKED;
    default:
      return PM_TD_RVB_CFG_SITE_UNKNOWN;
  }
}

export function pmEpHealthTypeTableByte(index) {
  /* The 0x25 bytes at 0x007cb02c, index = char - 4. Zero .text writes
     into [0x007cb018,0x007cb051) — constant for the process lifetime.
     Spelled as a compare chain (freestanding-module convention): jump
     index 0 (. ht 1) for chars 4,0xc,0x11,0x18,0x19,0x23,0x24; 1 (. 2)
     for 0xa,0x1f,0x28; 2 (. 3) for 0xe,0x21; 3 (. 4) for 0x10; else 4
     (. 0). */
  if (index < 0 || index > PM_EP_HT_INDEX_MAX) {
    return -1;
  }
  switch (index + PM_EP_HT_CHAR_MIN) {
    case 0x04: case 0x0c: case 0x11: case 0x18: case 0x19:
    case 0x23: case 0x24:
      return 0;
    case 0x0a: case 0x1f: case 0x28:
      return 1;
    case 0x0e: case 0x21:
      return 2;
    case 0x10:
      return 3;
    default:
      return 4;
  }
}

export function pmC0tGetter7cb060(charType13c0, v1340, v1d88) {
  return pmC0tNew1344(pmEpGetHealthType(charType13c0), v1340, v1d88);
}

export function pmC0tWalkContinue(charType13c0, twin1d98) {
  /* PE test order: char first (0x00779203 jne), then the twin NULL test
     (0x0077920d je). */
  if (pmC0tWalkEngaged(charType13c0) === 0) {
    return 0;
  }
  return twin1d98 !== 0 ? 1 : 0;
}

export function pmC0tTwinWalk(players, startAddr, stepCap) {
  let cur = startAddr >>> 0;
  const get = (addr) => {
    if (!players || typeof players.get !== "function") return null;
    return players.get(addr >>> 0) || players.get(addr | 0) || players.get(addr) || null;
  };
  const charOf = (p) => asU32(p && (p.char ?? p.charType13c0 ?? 0));
  const twinOf = (p) => asU32(p && (p.twin ?? p.twin1d98 ?? 0));
  const p0 = get(cur);
  if (!p0 || charOf(p0) !== (PM_C0T_WALK_CHAR >>> 0)) {
    return { terminated: 1, addr: cur };
  }
  let hops = 0;
  for (;;) {
    const p = get(cur);
    const twin = twinOf(p);
    if (twin === 0) return { terminated: 1, addr: cur };
    if (hops >= (stepCap | 0)) return { terminated: 0, addr: 0 };
    hops += 1;
    cur = twin;
    const nxt = get(cur);
    if (!nxt || charOf(nxt) !== (PM_C0T_WALK_CHAR >>> 0)) {
      return { terminated: 1, addr: cur };
    }
  }
}

export function pmC0tNew1344(healthType, v1340, v1d88) {
  /* 0x00779227 cmp eax,1 ; 0x0077922c cmp eax,2 — full-dword equality.
     The {1,2} arm takes [0x1340] ALONE; the bone term is on the ELSE
     arm. 0x0077923d lea eax,[eax+ecx*2] wraps at 32 bits. */
  if (healthType === 1 || healthType === 2) {
    return v1340;
  }
  return asI32(
      asU32(v1340) + 2 * asU32(v1d88));
}

export function pmC0tRecomputeUsesBone(healthType) {
  return (healthType === 1 || healthType === 2) ? 0 : 1;
}

export function pmC0tScanGate(new1344, pre1344) {
  return asI32(new1344) >= asI32(pre1344) ? 1 : 0;
}

export function pmC0tScanSlotVa(gameAddr, slotIndex) {
  /* 0x00779257 add eax,0x1da04 then per-iteration 0x00779265 add
     eax,0x6dc — all 32-bit wrapping adds. */
  return asU32(
      gameAddr + asU32(PM_C0T_SCAN_BASE_OFF) +
      asU32(slotIndex) *
          asU32(PM_C0T_SCAN_STRIDE));
}

export function pmC0tScanFind(gameAddr, playerAddr) {
  if (Array.isArray(gameAddr)) {
    const player = playerAddr >>> 0;
    for (let i = 0; i < asU32(PM_C0T_SCAN_SLOTS); i += 1) {
      if ((gameAddr[i] >>> 0) === player) return asI32(i);
    }
    return PM_C0T_SCAN_NO_MATCH;
  }
  return PM_C0T_SCAN_NO_MATCH;
}

export function pmC0tHealGate(game26614, dead173, red194c) {
  /* 0x00779281 cmp dword,2 ; jge skip — SIGNED. */
  if (game26614 >= PM_TD_RVB_HEAL_LIMIT) {
    return 0;
  }
  /* 0x0077928a cmp byte [esi+0x173],0 — LOW BYTE ONLY; the parameter is
     widened and re-narrowed here (v9 rule). */
  if ((dead173 & 0xff) !== 0) {
    return 0;
  }
  /* 0x00779299 test edi,edi ; jle — SIGNED, zero also skips. */
  return red194c > 0 ? 1 : 0;
}

export function pmC0tHealCapacity(v1340, v1344, v134c, v1d88) {
  /* 0x007792a9 cmp ecx,eax ; 0x007792ab cmovl — minSigned of the two
     post-host heart fields, then the two halve idioms and the wrapping
     adds (0x007792c2 / 0x007792c4). */
  let minHearts = v1340 < v1344 ? v1340 : v1344;
  let halfA = c0tHalfOfInc(minHearts);
  let halfB = c0tHalfOfInc(v134c);
  return asI32(asU32(halfA) +
                              asU32(halfB) +
                              asU32(v1d88));
}

export function pmC0tHealApplies(red194c, capacity) {
  return asI32(red194c) > asI32(capacity) ? 1 : 0;
}

export function pmC0tHealExcess(red194c, capacity) {
  /* 0x007792ce sub edi,ebx — 32-bit wrap; pushed as-is. */
  if (red194c <= capacity) {
    return 0;
  }
  return asI32(asU32(red194c) -
                              asU32(capacity));
}

export function pmC0tRunPre(players, startAddr, slots, stepCap) {
  const plan = {
    nextHostVa: 0x007c9ea0,
    walkedAddr: 0, walkTerminated: 0, pre1344: 0, healthType: 0, new1344: 0,
    scanRuns: 0, scanIndex: PM_C0T_SCAN_SKIPPED, scanStoreApplied: 0,
  };
  const walked = pmC0tTwinWalk(players, startAddr, stepCap);
  if (!walked.terminated) return plan;
  plan.walkedAddr = walked.addr >>> 0;
  plan.walkTerminated = 1;
  const get = (addr) => {
    if (!players || typeof players.get !== "function") return null;
    return players.get(addr >>> 0) || players.get(addr | 0) || players.get(addr) || null;
  };
  const p = get(walked.addr) || {};
  const pre = p.v1344 ?? p.soul1344 ?? p.pre1344 ?? 0;
  plan.pre1344 = pre | 0;
  const ch = p.char ?? p.charType13c0 ?? 0;
  const ht = pmEpGetHealthType(ch);
  plan.healthType = ht | 0;
  const nv = pmC0tNew1344(ht, p.v1340 ?? p.fatal1340 ?? 0, p.v1d88 ?? p.bone1d88 ?? 0);
  plan.new1344 = nv | 0;
  const runs = pmC0tScanGate(nv, pre);
  plan.scanRuns = runs | 0;
  if (runs === 0) {
    plan.scanIndex = PM_C0T_SCAN_SKIPPED;
    plan.scanStoreApplied = 0;
    return plan;
  }
  const found = pmC0tScanFind(slots || [], walked.addr);
  plan.scanIndex = found | 0;
  plan.scanStoreApplied = (found | 0) !== (PM_C0T_SCAN_SKIPPED | 0) && (found | 0) !== (PM_C0T_SCAN_NO_MATCH | 0) ? 1 : 0;
  return plan;
}

export function pmC0tHealPlan(game26614, dead173, red194c, v1340, v1344, v134c, v1d88) {
  const plan = {
    tailHostVa: PM_C0T_VA_UPDATE_BONE_HEARTS >>> 0,
    gate: pmC0tHealGate(game26614, dead173, red194c),
    capacity: 0, applies: 0, excess: 0, store194cAfterHost: 0, healHostVa: 0,
  };
  if (plan.gate === 0) return plan;
  plan.capacity = pmC0tHealCapacity(v1340, v1344, v134c, v1d88);
  plan.applies = pmC0tHealApplies(red194c, plan.capacity);
  plan.excess = pmC0tHealExcess(red194c, plan.capacity);
  plan.store194cAfterHost = plan.applies;
  plan.healHostVa = 0;
  return plan;
}

export function pmUbhNewBone(limit, v1340, v134c, v1d88) {
  /* 0x007cabf6 sar eax,1 carries the 0x007cabeb cdq/sub trunc fix;
     0x007cabf8 sar ecx,1 does NOT — the sum half is a FLOOR. The sum
     itself wraps at 32 bits (inc + add). */
  let halfLimit = ubhTruncHalf(limit);
  let sum = asI32(
      asU32(v1340) + 1 + asU32(v134c));
  let floorHalf = sum >> 1; /* bare sar */
  let avail = asI32(
      asU32(halfLimit) - asU32(floorHalf));
  /* 0x007cabfc cmp ; 0x007cabfe cmovl — minSigned. */
  return avail < v1d88 ? avail : v1d88;
}

export function pmUbhEarlyZero(newBone) {
  return asI32(newBone) <= 0 ? 1 : 0;
}

export function pmUbhTotalSlots(v134c, newBone) {
  /* 0x007cac23 lea eax,[edx+1] (wrap) ; trunc half ; 0x007cac35 add
     ebx,esi (wrap). */
  let inc = asI32(
      asU32(v134c) + 1);
  return asI32(
      asU32(ubhTruncHalf(inc)) +
      asU32(newBone));
}

export function pmUbhMask1d8c(totalSlots) {
  return asU32(0xffffffff >>> ((PM_UBH_WORD_BITS - asI32(totalSlots)) & 31));
}

export function pmUbhLoop1Runs(totalSlots) {
  return asI32(totalSlots) > 0 ? 1 : 0;
}

export function pmUbhLoop2Enters(totalSlots) {
  return asI32(asI32(totalSlots) - 1) >= 0 ? 1 : 0;
}

export function pmUbhLoop1(bits, totalSlots, budget) {
  let outBits = bits >>> 0;
  let outBudget = budget | 0;
  if ((totalSlots | 0) <= 0) return { bits: outBits, budget: outBudget };
  let probe = 1;
  for (let idx = 0; idx < (totalSlots | 0); idx = (idx + 1) | 0) {
    if ((outBits & probe) !== 0) {
      outBudget = (outBudget - 1) | 0;
      if (outBudget < 0) {
        outBits = (outBits & ~(probe >>> 0)) >>> 0;
      }
    }
    probe = rol32(probe, 1);
  }
  return { bits: outBits, budget: outBudget };
}

export function pmUbhLoop2(bits, totalSlots, budget) {
  let idx = (asU32(totalSlots) - 1) | 0;
  if (idx < 0) return { bits: bits >>> 0, budget: budget | 0 };
  let probe = rol32(1, idx >>> 0);
  let outBits = bits >>> 0;
  let outBudget = budget | 0;
  for (;;) {
    if (outBudget <= 0) return { bits: outBits, budget: outBudget };
    if ((outBits & probe) === 0) {
      outBits = (outBits | ((1 << (idx & 31)) >>> 0)) >>> 0;
      outBudget = (outBudget - 1) | 0;
    }
    probe = ror32(probe, 1);
    idx = (asU32(idx) - 1) | 0;
    if (idx < 0) return { bits: outBits, budget: outBudget };
  }
}

export function pmUbhRun(game26614, limit, v1340, v134c, v1d88, bits1d8c) {
  const plan = {
    gateOpen: pmUbhGate(game26614), newBone: 0, earlyZero: 0, totalSlots: 0,
    mask: 0, maskApplied: 0, loop1Ran: 0, loop2Entered: 0, budgetAfterLoop1: 0,
    final1d88: 0, final1d8c: 0, retVa: 0,
  };
  if (plan.gateOpen === 0) {
    plan.final1d88 = v1d88 | 0;
    plan.final1d8c = bits1d8c >>> 0;
    plan.retVa = PM_UBH_VA_RET_TAIL >>> 0;
    return plan;
  }
  const nb = pmUbhNewBone(limit, v1340, v134c, v1d88);
  plan.newBone = nb;
  if (pmUbhEarlyZero(nb)) {
    plan.earlyZero = 1;
    plan.final1d88 = 0;
    plan.final1d8c = 0;
    plan.retVa = PM_UBH_VA_RET_EARLY >>> 0;
    return plan;
  }
  const slots = pmUbhTotalSlots(v134c, nb);
  plan.totalSlots = slots;
  const mask = pmUbhMask1d8c(slots);
  plan.mask = mask >>> 0;
  plan.maskApplied = 1;
  let bits = (bits1d8c >>> 0) & (mask >>> 0);
  let budget = nb | 0;
  plan.loop1Ran = pmUbhLoop1Runs(slots);
  if (plan.loop1Ran !== 0) {
    const l1 = pmUbhLoop1(bits, slots, budget);
    bits = l1.bits >>> 0;
    budget = l1.budget | 0;
  }
  plan.budgetAfterLoop1 = budget | 0;
  plan.loop2Entered = pmUbhLoop2Enters(slots);
  if (plan.loop2Entered !== 0) bits = pmUbhLoop2(bits, slots, budget).bits >>> 0;
  plan.final1d88 = nb | 0;
  plan.final1d8c = bits >>> 0;
  plan.retVa = PM_UBH_VA_RET_TAIL >>> 0;
  return plan;
}

export function pmGhlBase(v2c, char2) {
  /* v2c === 1 jumps straight to the 0xc arm (0x007caeda je 0x007caef3);
     otherwise the JOIN tests char2 against 0x10/0x11 full-dword. */
  if (v2c === 1) {
    return PM_GHL_BASE_SMALL;
  }
  if (char2 === 0x10 || char2 === 0x11) {
    return PM_GHL_BASE_SMALL;
  }
  return PM_GHL_BASE_DEFAULT;
}

export function pmGhlKeeperFamily(char3) {
  return (char3 === PM_GHL_KEEPER_CHAR_E ||
          char3 === PM_GHL_KEEPER_CHAR_21)
             ? 1
             : 0;
}

export function pmGhlKeeperSkips(keeper) {
  return (keeper & 0xff) !== 0 ? 1 : 0;
}

export function pmGhlKeeperSel(char3) {
  /* xor ecx,ecx ; cmp esi,0x21 ; setne cl ; lea ecx,[ecx*2+4]. */
  return PM_GHL_KEEPER_SEL_BASE +
         2 * (char3 !== PM_GHL_KEEPER_CHAR_21 ? 1 : 0);
}

export function pmGhlKeeperBase(char3, gullet) {
  /* mov ebx,0x18 ; lea eax,[ecx+eax*2] (wrap) ; cmp ; cmovl. */
  let cand = asI32(
      asU32(pmGhlKeeperSel(char3)) +
      2 * asU32(gullet));
  return cand < PM_GHL_KEEPER_CAP ? cand : PM_GHL_KEEPER_CAP;
}

export function pmGhlCoinBonusQ(coins1368) {
  /* mov eax,0x51eb851f ; imul esi — SIGNED 64-bit product; sar edx,3 ;
     shr/add sign fix; cmovne keeps q+1 only at coins === 0x63. */
  let high = imul64High(coins1368, PM_GHL_COIN_DIV_MAGIC);
  let shifted = high >> PM_GHL_COIN_DIV_SHIFT;
  let q = asI32(
      asU32(shifted) +
      (asU32(shifted) >>> 31));
  return coins1368 === PM_GHL_COIN_SPECIAL_63
             ? asI32(asU32(q) + 1)
             : q;
}

export function pmGhlClamp(base, v1da0) {
  /* add eax,eax (wrap) ; sub ecx,eax (wrap) ; cmovg — maxSigned(0, d). */
  let doubled = asI32(
      2 * asU32(v1da0));
  let diff = asI32(
      asU32(base) - asU32(doubled));
  return diff > 0 ? diff : 0;
}

export function pmGhlPlan(inp = {}) {
  const plan = {};

  
  plan.result = 0;
  plan.retVa = 0;
  plan.base = 0;
  plan.keeperSkip = 0;
  plan.clampApplied = 0;
  plan.probe78Issued = 0;
  plan.probe79Issued = 0;
  plan.has26bChar1Issued = 0;
  plan.gulletIssued = 0;
  plan.has26bCharEIssued = 0;
  plan.has1f5Issued = 0;
  plan.coinBonus = 0;
  
  if (pmGhlGateLt2(inp.game26614) === 0) {
    /* 0x007cae7a mov eax,0xa0 — RET A; ebx never holds it. */
    plan.result = PM_GHL_RESULT_GATE_CLOSED;
    plan.retVa = asU32(PM_GHL_VA_RET_A0);
    return plan;
  }
  if (inp.v2c === 0) {
    /* char READ 1 arms; the 0x14 test reuses the SAME read 1 register,
       so a hit on 0x10 can never fall into the 0x79 probe. */
    if (inp.char1 === 0x10) {
      plan.probe78Issued = 1;
      if ((inp.null78 & 0xff) !== 0) { /* test al,al */
        plan.result = PM_GHL_CHAR_10_RESULT; /* lea eax,[ebx-0xa] */
        plan.retVa = asU32(PM_GHL_VA_RET_NULL78);
        return plan;
      }
    }
    if (inp.char1 === 0x14) {
      plan.probe79Issued = 1;
      if ((inp.null79 & 0xff) !== 0) {
        plan.result = PM_GHL_CHAR_14_RESULT; /* lea eax,[ebx-0x10] */
        plan.retVa = asU32(PM_GHL_VA_RET_NULL79);
        return plan;
      }
    }
  }
  /* v2c !== 0 paths issue no null-effect probe: v2c === 1 jumps straight
     to the 0xc arm, any other nonzero joins at 0x007caedc. */
  let base = pmGhlBase(inp.v2c, inp.char2);
  /* 0x007caefe cmp eax,1 — eax is char READ 2 on every path here. */
  if (inp.char2 === 1) {
    plan.has26bChar1Issued = 1;
    if ((inp.has26bChar1 & 0xff) !== 0) {
      base = asI32(
          asU32(base) +
          asU32(PM_GHL_CHAR1_BONUS));
    }
  }
  if (pmGhlKeeperFamily(inp.char3) === 0) {
    if (pmGhlKeeperSkips(inp.keeper) !== 0) {
      plan.keeperSkip = 1;
      plan.base = base;
      plan.result = base; /* mov eax,ebx at 0x007cafcc — NO clamp */
      plan.retVa = asU32(PM_GHL_VA_RET_COMMON);
      return plan;
    }
  } else {
    if (pmGhlKeeperSkips(inp.keeper) !== 0) {
      plan.keeperSkip = 1;
      plan.base = base;
      plan.result = base;
      plan.retVa = asU32(PM_GHL_VA_RET_COMMON);
      return plan;
    }
    plan.gulletIssued = 1;
    /* 0x007caf4a mov ebx,0x18 — the reset DISCARDS any char==1 bonus. */
    base = pmGhlKeeperBase(inp.char3, inp.gullet7ce390);
    /* 0x007caf64 — char READ 4, a fresh memory load after the call. */
    if (inp.char4 === PM_GHL_KEEPER_CHAR_E) {
      plan.has26bCharEIssued = 1;
      if (((inp.has26bCharE ?? inp.has26b_charE) & 0xff) !== 0) {
        base = asI32(
            asU32(base) +
            asU32(PM_GHL_KEEPER_26B_BONUS));
      }
    }
    plan.has1f5Issued = 1;
    if ((inp.has1f5 & 0xff) !== 0) {
      let q = pmGhlCoinBonusQ(inp.coins1368);
      plan.coinBonus = asI32(2 * asU32(q));
      base = asI32(
          asU32(base) + 2 * asU32(q));
    }
  }
  plan.clampApplied = 1;
  plan.base = base;
  plan.result = pmGhlClamp(base, inp.v1da0);
  plan.retVa = asU32(PM_GHL_VA_RET_COMMON);

  return plan;
}

export function pmUbhFullPlan(fields = {}, probes = {}) {
  const ch = fields.char;
  const inp = {
    ...fields,
    ...probes,
    char1: fields.char1 ?? ch,
    char2: fields.char2 ?? ch,
    char3: fields.char3 ?? ch,
    char4: fields.char4 ?? ch,
    gullet7ce390: fields.gullet7ce390 ?? probes.gullet ?? fields.gullet ?? 0,
  };
  const ghl = pmGhlGateLt2(fields.game26614 ?? inp.game26614 ?? 0) === 0
    ? {
        result: 0, retVa: 0, base: 0, keeperSkip: 0, clampApplied: 0,
        probe78Issued: 0, probe79Issued: 0, has26bChar1Issued: 0,
        gulletIssued: 0, has26bCharEIssued: 0, has1f5Issued: 0, coinBonus: 0,
      }
    : pmGhlPlan(inp);
  const limit = fields.limit ?? ghl.result ?? 0;
  const ubh = pmUbhRun(
    fields.game26614 ?? inp.game26614 ?? 0,
    limit,
    fields.v1340 ?? 0,
    fields.v134c ?? 0,
    fields.v1d88 ?? 0,
    fields.bits1d8c ?? 0,
  );
  return { ghl, ubh };
}

export function pmUrhFoldGate(game26614) {
  return asI32(game26614) < 2 ? 1 : 0;
}

export function pmUrhFoldHalf(red) {
  /* 0x007c9ec8 lea eax,[esi+1] wraps FIRST; then 0x007c9ecb cdq /
     sub / sar — the trunc runs on the WRAPPED value (red 0x7fffffff
     halves as INT_MIN/2 = -0x40000000). */
  let inc = asI32(
      asU32(red) + 1);
  let adj = asI32(
      asU32(inc) + (inc < 0 ? 1 : 0));
  return adj >> 1;
}

export function pmUrhFold1da4(red, v1da4) {
  /* 0x007c9ed0 cmp eax,ecx ; 0x007c9ed2 cmovl ecx,eax — minSigned. */
  let half = pmUrhFoldHalf(red);
  return half < v1da4 ? half : v1da4;
}

export function pmUrhFoldRed(red, v1da4) {
  /* 0x007c9edb lea eax,[ecx+ecx] (wrap) ; 0x007c9ede cmp esi,eax ;
     0x007c9ee0 cmovl esi,eax — maxSigned(red, doubled). */
  let doubled = asI32(
      2 * asU32(pmUrhFold1da4(red, v1da4)));
  return red < doubled ? doubled : red;
}

export function pmUrhFgGate(dead1, char1) {
  /* 0x007c9ef0 cmp byte [edi+0x173],0 — LOW BYTE (widened input,
     masked here); 0x007c9efd cmp dword [edi+0x13c0],0x1a — FULL
     DWORD. */
  if ((dead1 & 0xff) !== 0) {
    return 0;
  }
  return char1 === PM_URH_CHAR_1A ? 1 : 0;
}

export function pmUrhFgSum(bone1d88, red194c, soul134c, eternal1348, redB) {
  /* 0x007c9f0a..0x007c9f22 — four adds, every one wrapping. */
  return asI32(
      asU32(bone1d88) + asU32(red194c) +
      asU32(soul134c) + asU32(eternal1348) +
      asU32(redB));
}

export function pmUrhFgSumIsOne(sum) {
  return asI32(sum) === 1 ? 1 : 0;
}

export function pmUrhScanEntityMatch(entAddr, type28, parent410, playerAddr, variant2c, subtype30, dead173) {
  /* PE compare order (0x007c9f8a..0x007c9fb2): null skips first and
     the fields are never read for a null slot. */
  if (entAddr === 0) {
    return 0;
  }
  if (type28 !== PM_URH_ENT_TYPE_3) {
    return 0;
  }
  if (parent410 !== playerAddr) {
    return 0;
  }
  if (variant2c !== PM_URH_ENT_VARIANT_EE) {
    return 0;
  }
  if (subtype30 === PM_URH_ENT_SUBTYPE_SKIP_7) {
    return 0; /* je — subtype 7 SKIPS counting */
  }
  if ((dead173 & 0xff) !== 0) {
    return 0; /* LOW BYTE dead skips */
  }
  return 1;
}

export function pmUrhScanCount(listBase, entCount, playerAddr) {
  /* Abstract-list oracle: tests pass slot objects (or null). Exactly
     entCount iterations; no first-match break. */
  let matches = 0;
  const n = entCount | 0;
  if (Array.isArray(listBase)) {
    for (let i = 0; i < n; i += 1) {
      const slot = listBase[i];
      if (!slot) continue;
      matches = asI32(asU32(matches) + pmUrhScanEntityMatch(
        slot.addr ?? 1,
        slot.type, slot.parent, playerAddr,
        slot.variant, slot.subtype, slot.dead,
      ));
    }
    return matches;
  }
  return 0;
}

export function pmUrhItemvecSpan(begin, end) {
  return asI32((asU32(end) - asU32(begin)) & 0xfffffffc);
}

export function pmUrhItemvecGate(begin, end, elem1b8) {
  /* 0x007c9fe8 cmp eax,0x1b8 ; 0x007c9fed jle — SIGNED (a negative
     masked span never passes); then 0x007c9ff5 test/je on the elem.
     Same masked-span idiom as the v11 HIGH0 item gate. */
  if (pmUrhItemvecSpan(begin, end) <= PM_URH_ITEMVEC_SPAN_MIN) {
    return 0;
  }
  return elem1b8 !== 0 ? 1 : 0;
}

export function pmUrhWThr0(game266142) {
  /* 0x007ca034 xor / cmp / setge / inc, then 0x007ca04f shl eax,3 on
     the g >= 2 arm only — kept as the faithful sequence. */
  let t = 1 + (game266142 >= PM_UBH_GATE_LIMIT ? 1 : 0);
  if (game266142 >= PM_UBH_GATE_LIMIT) {
    t <<= 3;
  }
  return t;
}

export function pmUrhWThr2(game266142) {
  return asI32(game266142) < 2 ? PM_URH_THR2_LOW : PM_URH_THR_HIGH;
}

export function pmUrhRatio(red, max) {
  return Math.fround(Math.fround(asI32(red)) / Math.fround(asI32(max)));
}

export function pmUrhRatioBits(red, max) {
  return f32ToBits(urhRatio(red, max));
}

export function pmUrhCHigh(red, max) {
  return pmUrhRatio(red, max) >= f32FromBits(PM_URH_F32_08_BITS) ? 1 : 0;
}

export function pmUrhDAddBand(red, max) {
  /* 0x007ca20c comiss ratio,[0.1] / jb . REMOVE (less OR
     UNORDERED); 0x007ca21d comiss [0.3],ratio / jb . REMOVE
     (0.3 < ratio); ADD only on ordered 0.1 <= ratio <= 0.3. */
  let r = urhRatio(red, max);
  if (!(r >= f32FromBits(PM_URH_F32_01_BITS))) {
    return 0; /* jb 1: NaN lands here, exactly like the PE */
  }
  if (f32FromBits(PM_URH_F32_03_BITS) < r) {
    return 0; /* jb 2 */
  }
  return 1;
}

export function pmUrhProbe6dacd0(char13c0, v1340, v1d88, v1344) {
  /* 0x006dacd0 whole body: mov edx,ecx / call 0x007cafe0 (the v13
     GetHealthType leaf) / cmp eax,1 / je ; cmp eax,2 / je ; the
     NOT-{1,2} arm threshold is [0x1340] + 2*[0x1d88] (lea, wrap),
     the {1,2} arm is [0x1340] alone; setge — SIGNED [0x1344] >=
     threshold. Only AL is consumed at the 0x007ca15a callsite. */
  let ht = pmEpGetHealthType(char13c0);
  let threshold;
  if (ht === 1 || ht === 2) {
    threshold = v1340;
  } else {
    threshold = asI32(
        asU32(v1340) + 2 * asU32(v1d88));
  }
  return v1344 >= threshold ? 1 : 0;
}

export function pmUrhPlan(inp = {}) {
  const plan = {};

  
  plan.foldRan = 0;
  plan.store1da4 = 0;
  plan.store1344 = 0;
  plan.hostGullet = 0;
  plan.fgGate = 0;
  plan.fgSum = 0;
  plan.fgSumIsOne = 0;
  plan.fgRoomGate = 0;
  plan.probeNull6eIssued = 0;
  plan.scanRan = 0;
  plan.scanMatches = 0;
  plan.spawnReached = 0;
  plan.hostShow1 = 0;
  plan.itemvecGate = 0;
  plan.hostEffect930220 = 0;
  plan.pairElem = 0;
  plan.pairElem78 = 0;
  plan.gRereadJ1 = 0;
  plan.wThr0 = 0;
  plan.wLow = 0;
  plan.wChar5 = 0;
  plan.wThr2 = 0;
  plan.probeHas26bIssued = 0;
  plan.wGReload = 0;
  plan.wRoomGate = 0;
  plan.probeHas7aIssued = 0;
  plan.probeEff7aIssued = 0;
  plan.hostShow2 = 0;
  plan.hostAdd7a = 0;
  plan.probeHas19fIssued = 0;
  plan.cRan = 0;
  plan.cAlt = 0;
  plan.probe6dacd0Issued = 0;
  plan.probe6dacd0Result = 0;
  plan.cHigh = 0;
  plan.probeEff19fHighIssued = 0;
  plan.probeEff19fLowIssued = 0;
  plan.hostAdd19f = 0;
  plan.hostRemove19f = 0;
  plan.play530StrVa = 0;
  plan.hostPlay530 = 0;
  plan.probeHas1baIssued = 0;
  plan.dRan = 0;
  plan.dAlt = 0;
  plan.dAddSide = 0;
  plan.probeEff1baRmIssued = 0;
  plan.probeEff1baAddIssued = 0;
  plan.hostAdd1ba = 0;
  plan.hostRemove1ba = 0;
  plan.play644StrVa = 0;
  plan.hostPlay644 = 0;
  plan.probeHas1edIssued = 0;
  plan.probeEff1edIssued = 0;
  plan.store1574Or1 = 0;
  plan.host763570 = 0;
  plan.retVa = 0;
  
  plan.retVa = asU32(PM_URH_VA_RET);
  /* FOLD — the only pre-host stores. */
  plan.foldRan = pmUrhFoldGate(inp.game266141);
  if (plan.foldRan !== 0) {
    plan.store1da4 = pmUrhFold1da4(inp.redA, inp.v1da4);
    plan.store1344 = pmUrhFoldRed(inp.redA, inp.v1da4);
  }
  plan.hostGullet = 1; /* 0x007c9eeb — unconditional host boundary */
  /* FG — decides which g_Game pointer feeds the 0x007ca02e read. */
  let j1 = 0;
  plan.fgGate = pmUrhFgGate(inp.dead1, inp.char1);
  if (plan.fgGate === 0) {
    j1 = 1;
  } else {
    plan.fgSum = pmUrhFgSum(inp.bone1d88, inp.red194c,
                                       inp.soul134c, inp.eternal1348,
                                       inp.redB);
    plan.fgSumIsOne = pmUrhFgSumIsOne(plan.fgSum);
    if (plan.fgSumIsOne === 0) {
      j1 = 1;
    } else {
      plan.fgRoomGate = pmUrhRoomGateFg(
          inp.roomByte1, inp.frame1, inp.room11f01);
      if (plan.fgRoomGate !== 0) {
        plan.probeNull6eIssued = 1;
        if ((inp.null6e & 0xff) === 0) {
          plan.scanRan = (inp.entCount | 0) !== 0 ? 1 : 0;
          plan.scanMatches = plan.scanRan !== 0 ? (inp.scanMatches | 0) : 0;
          if (plan.scanRan === 0 || plan.scanMatches === 0) {
            /* SPAWN block: Show #1 then the record add behind the
               item-vector gate; both routes rejoin at J1. */
            plan.spawnReached = 1;
            plan.hostShow1 = 1;
            plan.itemvecGate = pmUrhItemvecGate(
                inp.ivecBegin, inp.ivecEnd, inp.elem1b8);
            if (plan.itemvecGate !== 0) {
              plan.hostEffect930220 = 1;
              plan.pairElem = inp.elem1b8;
              plan.pairElem78 = inp.elem78;
            }
            j1 = 1;
          }
          /* matches !== 0 . J2 with the LOAD-2 snapshot. */
        }
        /* null6e truthy . J2 holding esi ACROSS the host call. */
      }
      /* room gate closed . J2 (snapshot, no host call crossed). */
    }
  }
  plan.gRereadJ1 = j1;
  /* W — the soul-heart / char-5 section. */
  let toBprime = 0;
  if ((inp.dead2 & 0xff) === 0) {
    plan.wThr0 = pmUrhWThr0(inp.game266142);
    if (inp.redC <= plan.wThr0) {
      plan.wLow = 1; /* jle 0x007ca0b0 — straight to B' */
      toBprime = 1;
    } else if (inp.char2 === PM_URH_CHAR_5) {
      plan.wChar5 = 1;
      plan.wThr2 = pmUrhWThr2(inp.game266142);
      let reachRoom = 0;
      if (inp.redC <= plan.wThr2) {
        reachRoom = 1; /* jle 0x007ca094 — STALE esi, no reload */
      } else {
        plan.probeHas26bIssued = 1;
        if ((inp.has26b & 0xff) !== 0) {
          plan.wGReload = 1; /* 0x007ca08e — this path ONLY */
          reachRoom = 1;
        }
      }
      if (reachRoom !== 0) {
        plan.wRoomGate = pmUrhRoomGateC5(
            inp.roomByte2, inp.frame2, inp.room11f02);
        if (plan.wRoomGate !== 0) {
          toBprime = 1;
        }
      }
    }
  }
  if (toBprime !== 0) {
    plan.probeHas7aIssued = 1;
    if ((inp.has7a & 0xff) !== 0) {
      plan.probeEff7aIssued = 1;
      if ((inp.eff7a & 0xff) === 0) {
        /* cmp byte [edi+0x1824],al with AL === 0 — LOW BYTE gate on
           the Show; the effect add runs regardless. */
        if ((inp.byte1824 & 0xff) !== 0) {
          plan.hostShow2 = 1;
        }
        plan.hostAdd7a = 1;
      }
    }
  }
  /* C — the 0x19f block. */
  plan.probeHas19fIssued = 1;
  if ((inp.has19f & 0xff) !== 0) {
    plan.cRan = 1;
    let high = 0;
    if (inp.game266143 < PM_UBH_GATE_LIMIT) {
      plan.cAlt = 1;
      if ((inp.byte13b5 & 0xff) === 0) {
        plan.probe6dacd0Issued = 1;
        plan.probe6dacd0Result = pmUrhProbe6dacd0(
            inp.char3, inp.p1340, inp.p1d88, inp.p1344);
        high = plan.probe6dacd0Result;
      }
      /* byte13b5 set . LOW join directly, probe never issued. */
    } else {
      high = pmUrhCHigh(inp.redD, inp.maxD);
    }
    plan.cHigh = high;
    if (high !== 0) {
      plan.probeEff19fHighIssued = 1;
      if ((inp.eff19fHigh & 0xff) === 0) {
        plan.hostAdd19f = 1;
        plan.play530StrVa =
            asU32(PM_URH_STR_FLOATGLOW_VA);
        plan.hostPlay530 = 1;
      }
    } else {
      plan.probeEff19fLowIssued = 1;
      if ((inp.eff19fLow & 0xff) !== 0) {
        plan.hostRemove19f = 1;
        plan.play530StrVa =
            asU32(PM_URH_STR_FLOATNOGLOW_VA);
        plan.hostPlay530 = 1;
      }
    }
  }
  /* D — the 0x1ba block. */
  plan.probeHas1baIssued = 1;
  if ((inp.has1ba & 0xff) !== 0) {
    plan.dRan = 1;
    let add = 0;
    if (inp.game266144 < PM_UBH_GATE_LIMIT) {
      plan.dAlt = 1;
      add = inp.redE === 2 ? 1 : 0; /* cmp ecx,2 / jne — the register
                                       copy of READ 5 */
    } else {
      add = pmUrhDAddBand(inp.redE, inp.maxE);
    }
    plan.dAddSide = add;
    if (add !== 0) {
      plan.probeEff1baAddIssued = 1;
      if ((inp.eff1baAdd & 0xff) === 0) {
        plan.hostAdd1ba = 1;
        plan.play644StrVa =
            asU32(PM_URH_STR_FLOATGLOW_VA);
        plan.hostPlay644 = 1;
      }
    } else {
      plan.probeEff1baRmIssued = 1;
      if ((inp.eff1baRm & 0xff) !== 0) {
        plan.hostRemove1ba = 1;
        plan.play644StrVa =
            asU32(PM_URH_STR_FLOATNOGLOW_VA);
        plan.hostPlay644 = 1;
      }
    }
  }
  /* E — the 0x1ed block: FLAG on owned OR (not-owned AND effect ON);
     eff1ed is probed only when NOT owned. */
  plan.probeHas1edIssued = 1;
  let flag = 0;
  if ((inp.has1ed & 0xff) !== 0) {
    flag = 1;
  } else {
    plan.probeEff1edIssued = 1;
    if ((inp.eff1ed & 0xff) !== 0) {
      flag = 1;
    }
  }
  if (flag !== 0) {
    plan.store1574Or1 = 1;
    plan.host763570 = 1;
  }

  return plan;
}

export function pmUrhApplyModel(mem, playerAddr, gameAddr, mgrAddr, probes) {
  const P = playerAddr >>> 0;
  const G = gameAddr >>> 0;
  const M = mgrAddr >>> 0;
  const pr = probes || {};
  const r32 = (a) => mem && mem.r32 ? mem.r32(a >>> 0) >>> 0 : 0;
  const r8 = (a) => mem && mem.r8 ? mem.r8(a >>> 0) & 0xff : 0;
  const w32 = (a, v) => { if (mem && mem.w32) mem.w32(a >>> 0, v >>> 0); };
  const ri = (a) => r32(a) | 0;
  const inp = {
    null6e: pr.null6e ?? 0,
    has26b: pr.has26b ?? 0,
    has7a: pr.has7a ?? 0,
    eff7a: pr.eff7a ?? 0,
    has19f: pr.has19f ?? 0,
    eff19fHigh: pr.eff19fHigh ?? 0,
    eff19fLow: pr.eff19fLow ?? 0,
    has1ba: pr.has1ba ?? 0,
    eff1baRm: pr.eff1baRm ?? 0,
    eff1baAdd: pr.eff1baAdd ?? 0,
    has1ed: pr.has1ed ?? 0,
    eff1ed: pr.eff1ed ?? 0,
  };
  inp.game266141 = ri(G + PM_TD_RVB_HEAL_OFF_26614);
  if (pmUrhFoldGate(inp.game266141) !== 0) {
    inp.redA = ri(P + PM_C0T_OFF_SOUL_1344);
    inp.v1da4 = ri(P + PM_URH_OFF_1DA4);
    w32(P + PM_URH_OFF_1DA4, pmUrhFold1da4(inp.redA, inp.v1da4));
    w32(P + PM_C0T_OFF_SOUL_1344, pmUrhFoldRed(inp.redA, inp.v1da4));
  }
  inp.dead1 = r8(P + PM_DEATH_OFF_DEAD_173);
  inp.char1 = ri(P + PM_C0T_OFF_CHAR_13C0);
  if (pmUrhFgGate(inp.dead1, inp.char1) !== 0) {
    inp.bone1d88 = ri(P + PM_TD_RVB_OFF_BONE_1D88);
    inp.red194c = ri(P + PM_TD_RVB_OFF_RED_194C);
    inp.soul134c = ri(P + PM_C0T_OFF_134C);
    inp.eternal1348 = ri(P + PM_URH_OFF_ETERNAL_1348);
    inp.redB = ri(P + PM_C0T_OFF_SOUL_1344);
    if (pmUrhFgSumIsOne(pmUrhFgSum(inp.bone1d88, inp.red194c, inp.soul134c,
                                   inp.eternal1348, inp.redB)) !== 0) {
      const room = r32(G + PM_URH_OFF_ROOM_18300);
      inp.roomByte1 = r8(room);
      if ((inp.roomByte1 & 0xff) !== 0) {
        inp.frame1 = ri(G + PM_URH_OFF_FRAME_264F8);
        inp.room11f01 = ri(room + PM_URH_OFF_ROOM_11F0);
        if (pmUrhRoomGateFg(inp.roomByte1, inp.frame1, inp.room11f01) !== 0 &&
            ((inp.null6e & 0xff) === 0)) {
          inp.entCount = r32(room + PM_URH_OFF_ROOM_COUNT_1254);
          if (inp.entCount !== 0) {
            const room2 = r32(G + PM_URH_OFF_ROOM_18300);
            const list = r32(room2 + PM_URH_OFF_ROOM_LIST_124C);
            const ents = [];
            const n = inp.entCount | 0;
            for (let i = 0; i < n; i += 1) {
              const addr = r32(list + 4 * i);
              if (addr === 0) {
                ents.push(null);
                continue;
              }
              ents.push({
                addr,
                type: ri(addr + PM_URH_ENT_OFF_TYPE_28),
                parent: r32(addr + PM_URH_ENT_OFF_PARENT_410),
                variant: ri(addr + PM_URH_ENT_OFF_VARIANT_2C),
                subtype: ri(addr + PM_URH_ENT_OFF_SUBTYPE_30),
                dead: r8(addr + PM_URH_ENT_OFF_DEAD_173),
              });
            }
            inp.scanMatches = pmUrhScanCount(ents, n, P) | 0;
          }
          if (inp.entCount === 0 || (inp.scanMatches | 0) === 0) {
            inp.ivecBegin = r32(M + PM_URH_ITEMVEC_BEGIN_OFF);
            inp.ivecEnd = r32(M + PM_URH_ITEMVEC_END_OFF);
            if (pmUrhItemvecSpan(inp.ivecBegin, inp.ivecEnd) > PM_URH_ITEMVEC_SPAN_MIN) {
              inp.elem1b8 = r32(inp.ivecBegin + PM_URH_ITEMVEC_ELEM_OFF);
              if (inp.elem1b8 !== 0) {
                inp.elem78 = r32(inp.elem1b8 + PM_URH_ELEM_FIELD_78);
              }
            }
          }
        }
      }
    }
  }
  inp.game266142 = ri(G + PM_TD_RVB_HEAL_OFF_26614);
  inp.dead2 = r8(P + PM_DEATH_OFF_DEAD_173);
  if ((inp.dead2 & 0xff) === 0) {
    inp.redC = ri(P + PM_C0T_OFF_SOUL_1344);
    if ((inp.redC | 0) > pmUrhWThr0(inp.game266142)) {
      inp.char2 = ri(P + PM_C0T_OFF_CHAR_13C0);
      if (inp.char2 === PM_URH_CHAR_5) {
        const thr2 = pmUrhWThr2(inp.game266142);
        const probePath = (inp.redC | 0) > thr2 ? 1 : 0;
        if (probePath === 0 || (inp.has26b & 0xff) !== 0) {
          const room3 = r32(G + PM_URH_OFF_ROOM_18300);
          inp.roomByte2 = r8(room3);
          if ((inp.roomByte2 & 0xff) !== 0) {
            inp.frame2 = ri(G + PM_URH_OFF_FRAME_264F8);
            inp.room11f02 = ri(room3 + PM_URH_OFF_ROOM_11F0);
          }
        }
      }
    }
    const bprime =
        (inp.redC | 0) <= pmUrhWThr0(inp.game266142) ||
                (inp.char2 === PM_URH_CHAR_5 &&
                 ((inp.redC | 0) <= pmUrhWThr2(inp.game266142) ||
                  (inp.has26b & 0xff) !== 0) &&
                 pmUrhRoomGateC5(inp.roomByte2, inp.frame2, inp.room11f02) !== 0)
            ? 1
            : 0;
    if (bprime !== 0 && (inp.has7a & 0xff) !== 0 && (inp.eff7a & 0xff) === 0) {
      inp.byte1824 = r8(P + PM_URH_OFF_BYTE_1824);
    }
  }
  if ((inp.has19f & 0xff) !== 0) {
    inp.game266143 = ri(G + PM_TD_RVB_HEAL_OFF_26614);
    if ((inp.game266143 | 0) < PM_UBH_GATE_LIMIT) {
      inp.byte13b5 = r8(P + PM_URH_OFF_BYTE_13B5);
      if ((inp.byte13b5 & 0xff) === 0) {
        inp.char3 = ri(P + PM_C0T_OFF_CHAR_13C0);
        const ht = pmEpGetHealthType(inp.char3);
        inp.p1340 = ri(P + PM_C0T_OFF_FATAL_1340);
        if (ht !== 1 && ht !== 2) {
          inp.p1d88 = ri(P + PM_TD_RVB_OFF_BONE_1D88);
        }
        inp.p1344 = ri(P + PM_C0T_OFF_SOUL_1344);
      }
    } else {
      inp.redD = ri(P + PM_C0T_OFF_SOUL_1344);
      inp.maxD = ri(P + PM_C0T_OFF_FATAL_1340);
    }
  }
  if ((inp.has1ba & 0xff) !== 0) {
    inp.redE = ri(P + PM_C0T_OFF_SOUL_1344);
    inp.game266144 = ri(G + PM_TD_RVB_HEAL_OFF_26614);
    if ((inp.game266144 | 0) >= PM_UBH_GATE_LIMIT) {
      inp.maxE = ri(P + PM_C0T_OFF_FATAL_1340);
    }
  }
  const plan = pmUrhPlan(inp);
  if ((plan.store1574Or1 | 0) !== 0) {
    const flagVa = P + PM_URH_OFF_FLAG_1574;
    w32(flagVa, r32(flagVa) | PM_URH_OR_1574_BIT);
  }
  return { plan };
}

export function pmWalkCountReloaded(endNow, beginNow) {
  return asI32(asI32(endNow) - asI32(beginNow)) >> PM_PLAYER_PTR_SHIFT;
}

export function pmWalkTopFatal(endNow, beginNow) {
  return pmWalkCountReloaded(endNow, beginNow) === 0 ? 1 : 0;
}

export function pmWalkElemCursor(beginNow, index, countSel) {
  return asU32(asI32(beginNow) + pmPlayerIndexSelect(index, countSel) * 4);
}

export function pmWalkBackContinues(endBack, beginBack, index) {
  /* inc edi wraps; jb is unsigned against the re-derived count. */
  let next = asI32(asU32(index) + 1);
  return asU32(next) <
                 asU32(
                     pmWalkCountReloaded(endBack, beginBack))
             ? 1
             : 0;
}

export function pmWalkIterPlan({
  index = 0, begin1 = 0, end1 = 0, end2 = 0, begin2 = 0, begin3 = 0, end3 = 0, triggered = 0,
} = {}) {
  const countTop = pmWalkCountReloaded(end1, begin1);
  const fatalTop = countTop === 0 ? 1 : 0;
  const countSel = pmWalkCountReloaded(end2, begin2);
  const elemIndex = (index >>> 0) < (countSel >>> 0) ? (index | 0) : 0;
  const cursor = pmWalkElemCursor(begin2 >>> 0, index, countSel);
  const countBack = pmWalkCountReloaded(end3, begin3);
  const nextIndex = ((index >>> 0) + 1) | 0;
  const continues = (nextIndex >>> 0) < (countBack >>> 0) ? 1 : 0;
  const baseReloaded = (fatalTop !== 0 || (triggered | 0) !== 0) ? 1 : 0;
  return { countTop, fatalTop, countSel, elemIndex, cursor, countBack, nextIndex, continues, baseReloaded };
}

export function pmChainPlaying(isPlaying) {
  return (asU32(isPlaying) & 0xff) !== 0 ? 1 : 0;
}

export function pmChainReceiverReloaded(residualKind) {
  return asI32(residualKind) === PM_INTENSITY_SFX_RESIDUAL_PLAY ? 1 : 0;
}

export function pmChainReceiver(globalPre, globalNow, residualKind) {
  let base =
      pmChainReceiverReloaded(residualKind) !== 0 ? globalNow
                                                           : globalPre;
  return pmSfxManagerReceiver(base);
}

export function pmPrePlayChainPlan({
  maxVol = 0, isPlaying = 0, globalPre = 0, globalNow = 0,
  gameNull = 0, entryFound = 0, seed = 0, shift1 = 2, shift2 = 7, shift3 = 7,
} = {}) {
  const playing = pmChainPlaying(isPlaying);
  const loud = pmIntensitySfxStartNeeded(maxVol) ? 1 : 0;
  const residualKind = pmIntensitySfxResidualKind(maxVol, playing);
  const receiverReloaded = pmChainReceiverReloaded(residualKind);
  let call0Va = 0, call1Va = 0, playId = PM_INTENSITY_SFX_ID, playIdFromPre = 0;
  if (residualKind === PM_INTENSITY_SFX_RESIDUAL_STOP) {
    call0Va = PM_INTENSITY_HOST_VA_STOP;
  } else if (residualKind === PM_INTENSITY_SFX_RESIDUAL_UPDATE) {
    call0Va = PM_INTENSITY_HOST_VA_SET_VOLUME;
    call1Va = PM_INTENSITY_HOST_VA_SET_PITCH;
  } else if (residualKind === PM_INTENSITY_SFX_RESIDUAL_PLAY) {
    call0Va = PM_INTENSITY_HOST_VA_PRE_PLAY;
    call1Va = PM_INTENSITY_HOST_VA_PLAY;
    playId = pmPrePlaySoundId(gameNull, entryFound, seed, shift1, shift2, shift3);
    playIdFromPre = 1;
  }
  return {
    residualKind, playing, loud,
    hostNeeded: residualKind !== PM_INTENSITY_SFX_RESIDUAL_NONE ? 1 : 0,
    probeId: PM_INTENSITY_SFX_ID >>> 0,
    probeVa: PM_INTENSITY_HOST_VA_IS_PLAYING >>> 0,
    receiver: pmChainReceiver(globalPre, globalNow, residualKind),
    receiverReloaded, call0Va: call0Va >>> 0, call1Va: call1Va >>> 0,
    playId, playIdFromPre,
  };
}

export function pmTdRemoveMutationsVector(earlyKind) {
  return asI32(earlyKind) === PM_TD_EARLY_REMOVE ? 1 : 0;
}

export function pmWalkTickPlan({
  index = 0, begin1 = 0, end1 = 0, end2 = 0, begin2 = 0, begin3 = 0, end3 = 0, triggered = 0,
  dead = 0, anim7c = 0, anim8c = 0, twinNull = 0, twinAnim7c = 0, twinAnim8c = 0,
} = {}) {
  const it = pmWalkIterPlan({ index, begin1, end1, end2, begin2, begin3, end3, triggered });
  const cursorEligible = pmDeathPlayerEligible(dead, anim7c, anim8c, twinNull, twinAnim7c, twinAnim8c);
  return { ...it, cursorEligible: cursorEligible ? 1 : 0, shouldTrigger: cursorEligible ? 1 : 0 };
}

export function pmHealAnmSet(stateNull, nameEq, state34, a44) {
  if ((stateNull & 0xff) !== 0) return 1;
  if ((nameEq & 0xff) === 0) return 1;
  if ((state34 & 0xff) === 0) return 0;
  if ((a44 & 0xff) !== 0) return 0;
  return 1;
}

export function pmHealApplies(amount) {
  return (amount | 0) > 0 ? 1 : 0;
}

export function pmHealEmitPlan(inp = {}) {
  const game26614 = inp.game26614 ?? 0;
  const dead173 = inp.dead173 ?? 0;
  const red194c = inp.red194c ?? 0;
  const v1340 = inp.v1340 ?? 0;
  const v1344 = inp.v1344 ?? 0;
  const v134c = inp.v134c ?? 0;
  const v1d88 = inp.v1d88 ?? 0;
  const emitFlag = inp.emitFlag ?? 0;
  const retVa = inp.retVa ?? 0x007ca2d0;
  const applies = pmTdRvbHealGate(game26614, dead173, red194c) === 1 ? 1 : 0;
  const cap = pmTdRvbHealCapacity(v1340, v1344, v134c, v1d88);
  const store = applies !== 0 && (red194c | 0) > (cap | 0) ? 1 : 0;
  let excess = 0;
  if (store !== 0 && ((emitFlag >>> 0) & 0xff) === 0) {
    excess = ((red194c | 0) - (cap | 0)) | 0;
  }
  return { applies, cap, store, excess, retVa: retVa >>> 0 };
}

export function pmHealF0Bits(rng) {
  let t = pmHealU32ToF32(rng);
  t = Math.fround(t * f32FromBits(PM_HEAL_F32_2NEG32_BITS));
  t = Math.fround(t * f32FromBits(PM_HEAL_F32_12_BITS));
  t = Math.fround(t + f32FromBits(PM_HEAL_F32_8_BITS));
  return f32ToBits(t);
}

export function pmHealInnerCount(rng) {
  return (3 + ((rng >>> 0) % 6)) | 0;
}

export function pmHealPlan(inp = {}) {
  const outerMax = PM_HEAL_OUTER_MAX | 0;
  const innerMax = PM_HEAL_INNER_MAX | 0;
  const tailMax = PM_HEAL_TAIL_MAX | 0;
  const f0 = [0, 0, 0, 0];
  const innerCount = [0, 0, 0, 0];
  const v2 = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const spawnPosX = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const spawnPosY = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  const plan = {
    applies: pmHealApplies(inp.amount ?? 0),
    preId: 0, preSeedOut: 0, preAdvanced: 0, preHost: 0, preFatal: 0,
    sfxPlay: 0, spawn1: 0, anmLoad: 0, anmSetRan: 0, anmRewindRan: 0,
    vcallA: 0, spawn2: 0, vcallB: 0, outerRuns: 0, outerOverflow: 0,
    innerOverflow: 0, tailEligible: 0, tailFrozenCnt: 0, tailTotal: 0,
    tailOverflow: 0, listFreeRan: 0, hostDraws: 0,
    retVa: (PM_HEAL_VA || 0x007ca2d0) >>> 0,
    f0, innerCount, v2, spawnPosX, spawnPosY,
  };
  if (plan.applies === 0) return plan;
  plan.preId = pmHealPreId(
    inp.preInitialId ?? 0, inp.preGameNull ?? 0, inp.preEntryFound ?? 0,
    inp.preSeed ?? 0, inp.preShift1 ?? 2, inp.preShift2 ?? 7, inp.preShift3 ?? 7,
  );
  plan.preSeedOut = (inp.preSeed ?? 0) >>> 0;
  plan.preHost = (inp.preGameNull ?? 0) === 0 ? 1 : 0;
  if ((inp.preGameNull ?? 0) === 0 && (inp.preEntryFound ?? 0) !== 0) {
    if (((inp.preSeed ?? 0) >>> 0) === 0) {
      plan.preFatal = 1;
      plan.preHost = 1;
    } else {
      plan.preSeedOut = pmPrePlayRngNext(
        inp.preSeed, inp.preShift1 ?? 2, inp.preShift2 ?? 7, inp.preShift3 ?? 7,
      ) >>> 0;
      plan.preAdvanced = 1;
    }
  }
  plan.sfxPlay = 1;
  plan.spawn1 = 1;
  plan.anmLoad = 1;
  plan.anmSetRan = pmHealAnmSet(
    inp.anmStateNull ?? inp.stateNull ?? 0,
    inp.anmNameEq ?? inp.nameEq ?? 0,
    inp.anmState34 ?? inp.state34 ?? 0,
    inp.anmA44 ?? inp.a44 ?? 0,
  );
  plan.anmRewindRan = plan.anmSetRan !== 0 && ((inp.anmSetResult ?? 0) & 0xff) !== 0 ? 1 : 0;
  plan.vcallA = 1;
  plan.spawn2 = 1;
  plan.vcallB = 1;
  const outerFull = (inp.amount ?? 0) >>> 0;
  plan.outerRuns = outerFull > outerMax ? outerMax : (outerFull | 0);
  plan.outerOverflow = outerFull > (outerMax >>> 0) ? 1 : 0;
  const rngF0 = inp.rngF0 ?? [];
  const rngCnt = inp.rngCnt ?? [];
  const rngV2 = inp.rngV2 ?? [];
  const anmPosX = inp.anmPosX ?? [];
  const anmPosY = inp.anmPosY ?? [];
  for (let oi = 0; oi < plan.outerRuns; oi += 1) {
    f0[oi] = pmHealF0Bits(rngF0[oi] ?? 0);
    innerCount[oi] = pmHealInnerCount(rngCnt[oi] ?? 0);
    const ic = innerCount[oi];
    if (ic > innerMax) plan.innerOverflow = 1;
    const cap = ic < innerMax ? ic : innerMax;
    for (let ii = 0; ii < cap; ii += 1) {
      v2[oi][ii] = pmHealV2Bits((rngV2[oi] ?? [])[ii] ?? 0);
      spawnPosX[oi][ii] = pmHealF32AddBits(0, (anmPosX[oi] ?? [])[ii] ?? 0);
      spawnPosY[oi][ii] = pmHealF32AddBits(0, (anmPosY[oi] ?? [])[ii] ?? 0);
    }
  }
  const tailCount = (inp.tailCount ?? 0) >>> 0;
  plan.tailTotal = tailCount > (tailMax >>> 0) ? tailMax : (tailCount | 0);
  plan.tailOverflow = tailCount > (tailMax >>> 0) ? 1 : 0;
  const kinds = inp.tailKind ?? [];
  const isps = inp.tailIsPlayer ?? [];
  const frozen = inp.tailFrozen ?? [];
  for (let ti = 0; ti < plan.tailTotal; ti += 1) {
    if (pmHealTailEligible(inp.tailGame26614 ?? 0, kinds[ti] ?? 0, isps[ti] ?? 0) !== 0) {
      plan.tailEligible += 1;
      if (((frozen[ti] ?? 0) & PM_HEAL_FROZEN_BIT) !== 0) plan.tailFrozenCnt += 1;
    }
  }
  plan.listFreeRan = (((inp.tailFreeFlag ?? 0) & 0xff) === 0 && tailCount > 0) ? 1 : 0;
  plan.hostDraws = ((inp.amount ?? 0) >>> 0) * (PM_HEAL_BURST_DRAWS >>> 0);
  return plan;
}


export function pmHealPreId(initialId, gameNull, entryFound, seed, s1, s2, s3) {
  if ((gameNull | 0) !== 0 || (entryFound | 0) === 0) return initialId | 0;
  let id = PM_PRE_PLAY_ID_FOUND;
  if ((seed >>> 0) === 0) return id;
  const next = pmPrePlayRngNext(seed, s1, s2, s3);
  if (pmPrePlayRareHit(next)) id = PM_PRE_PLAY_ID_RARE;
  return id;
}

export function pmHealTailEligible(game26614, kind, isPlayer) {
  if ((isPlayer | 0) !== 0) return 0;
  const k = kind >>> 0;
  if ((game26614 | 0) >= 2 && k === 1) return 1;
  if (((k - (PM_HEAL_TAIL_KIND_LO >>> 0)) >>> 0) > (PM_HEAL_TAIL_KIND_HI >>> 0)) return 0;
  return 1;
}

export function pmHealV2Bits(rng) {
  let t = pmHealU32ToF32(rng);
  t = Math.fround(t * f32FromBits(PM_HEAL_F32_2NEG32_BITS));
  t = Math.fround(t * f32FromBits(PM_HEAL_F32_066_BITS));
  t = Math.fround(t + f32FromBits(PM_HEAL_F32_033_BITS));
  return f32ToBits(t);
}

export function pmUrhRoomGate(roomByte, frame, room11f0) {
  if (((roomByte >>> 0) & 0xff) === 0) return 0;
  const diff = ((frame | 0) - (room11f0 | 0)) | 0;
  return diff > (PM_URH_ROOM_RECENT_MIN | 0) ? 1 : 0;
}
export function pmUrhRoomGateFg(roomByte, frame, room11f0) {
  return pmUrhRoomGate(roomByte, frame, room11f0);
}
export function pmUrhRoomGateC5(roomByte, frame, room11f0) {
  return pmUrhRoomGate(roomByte, frame, room11f0);
}

export function pmHealU32ToF32(rng) {
  const u = rng >>> 0;
  let d = u | 0;
  if (u & 0x80000000) d += 4294967296.0;
  return Math.fround(d);
}

export function pmHealF32AddBits(a, b) {
  return f32ToBits(Math.fround(f32FromBits(a >>> 0) + f32FromBits(b >>> 0)));
}

/* ---- v39 B19 0x7dba30 (item-278 flag gate) ---- */

export const PM_B19_TABLE_BYTES = 183;
export const PM_B19_CASE_21 = 0x21;
export const PM_B19_CASE_0_ID = 0x2710;
export const PM_B19_CASE_9_ID = 2;
export const PM_B19_CASE_3E8_ID_BASE = 0x16;
export const PM_B19_TABLE_BOUND = 0xb6;
export const PM_B19_OFF_FLAG_26D4 = 0x26d4;
export const PM_B19_COUNT_CMP = 0x1e;
export const PM_B19_BYTE_TABLE = [
  0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1,
  1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
  1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 0,
];

export function pm7dba30HasItem(has278, has278Effect) {
  return (asU8(has278) !== 0 || asU8(has278Effect) !== 0) ? 1 : 0;
}
export function pm7dba30EffectProbeRuns(has278) {
  return asU8(has278) === 0 ? 1 : 0;
}
export function pm7dba30SpecialCase(arg0) {
  return asU32(arg0) === PM_B19_CASE_21 ? 1 : 0;
}
export function pm7dba30TableIndex(arg1) {
  const t = asU32(arg1 - PM_B19_CASE_3E8_ID_BASE);
  if (t > PM_B19_TABLE_BOUND) return -1;
  return PM_B19_BYTE_TABLE[t];
}
export function pm7dba30Bl(arg0, arg1) {
  const a = asU32(arg0);
  const b = asU32(arg1);
  if (asI32(a) > PM_B19_CASE_21) {
    if (a === 0x3e8) {
      const t = asU32(b - PM_B19_CASE_3E8_ID_BASE);
      if (t <= PM_B19_TABLE_BOUND) return PM_B19_BYTE_TABLE[t] === 0 ? 1 : 0;
    }
    return 0;
  }
  if (a === 0) return b === PM_B19_CASE_0_ID ? 1 : 0;
  if (a === 9) return b === PM_B19_CASE_9_ID ? 1 : 0;
  return 0;
}
export function pm7dba30FlagStore(has278, has278Effect, arg0, arg1, state26d4) {
  if (pm7dba30HasItem(has278, has278Effect) === 0) return -1;
  if (asU32(arg0) === PM_B19_CASE_21) return -1;
  const bl = pm7dba30Bl(arg0, arg1);
  if (asU8(state26d4) !== 0 || bl !== 0) return 1;
  return 0;
}
export function pm7dba30Result(has278, has278Effect, arg0, arg1, state26d4, state26d0) {
  if (pm7dba30HasItem(has278, has278Effect) === 0) return 0;
  if (asU32(arg0) === PM_B19_CASE_21) return 1;
  const bl = pm7dba30Bl(arg0, arg1);
  if (asU8(state26d4) === 0 && bl === 0) return 0;
  if (bl === 0) return 0;
  if (asI32(state26d0) >= PM_B19_COUNT_CMP) return 0;
  return 1;
}

/* ---- v39 B21 0x7dbc80 (RNG 13-slot pick) ---- */

export const PM_B21_PICK_SLOTS = 13;
export const PM_B21_PICK_DIVISOR = 0xd;
export const PM_B21_MODE_CMP = 2;
export const PM_B21_PICK_TABLE = [
  0x1d, 0x1e, 0x1f, 0x37, 0x6e, 0x72, 0xc7, 0xc8, 0xd9, 0xe4, 0x163, 0x1fc, 0x2dc
];

export function pm7dbc80RngSeedZero(seed) {
  return asU32(seed) === 0 ? 1 : 0;
}
export function pm7dbc80RngSeedStillZero(seedReloaded) {
  return asU32(seedReloaded) === 0 ? 1 : 0;
}
export function pm7dbc80RngNext(seed, shift1, shift2, shift3) {
  let a = asU32(seed);
  a ^= a >>> (asU32(shift1) & 31);
  a ^= (a << (asU32(shift2) & 31)) >>> 0;
  a ^= a >>> (asU32(shift3) & 31);
  return asU32(a);
}
export function pm7dbc80PickIndex(stateNext) {
  return asU32(stateNext) % PM_B21_PICK_DIVISOR;
}
export function pm7dbc80PickValue(index) {
  const i = asU32(index);
  if (i >= PM_B21_PICK_SLOTS) return 0;
  return PM_B21_PICK_TABLE[i];
}
export function pm7dbc80StoreGate(game26614) {
  return asI32(game26614) >= PM_B21_MODE_CMP ? 1 : 0;
}
export function pm7dbc80Pick(seed, shift1, shift2, shift3) {
  return pm7dbc80PickValue(pm7dbc80PickIndex(pm7dbc80RngNext(seed, shift1, shift2, shift3)));
}

/* ---- v39 B22 0x7dbd70 (RNG revive tail) ---- */

export const PM_B22_FLAG_OFF = 0x1574;

export function pm7dbd70RngSeedZero(seed) {
  return asU32(seed) === 0 ? 1 : 0;
}
export function pm7dbd70RngSeedStillZero(seedReloaded) {
  return asU32(seedReloaded) === 0 ? 1 : 0;
}
export function pm7dbd70RngNext(seed, shift1, shift2, shift3) {
  let a = asU32(seed);
  a ^= a >>> (asU32(shift1) & 31);
  a ^= (a << (asU32(shift2) & 31)) >>> 0;
  a ^= a >>> (asU32(shift3) & 31);
  return asU32(a);
}
export function pm7dbd70PushGrow(vecEnd, vecCap) {
  return asU32(vecEnd) === asU32(vecCap) ? 1 : 0;
}
export function pm7dbd70CfgGate(cfg) {
  return asU32(cfg) !== 0 ? 1 : 0;
}
export function pm7dbd70CostumeGate(cfgB2) {
  return asU8(cfgB2) !== 0 ? 1 : 0;
}
export function pm7dbd70Flag1574(flag1574, cfg54) {
  return asU32(flag1574) | asU32(cfg54);
}

/* ---- v41 B23 0x7dbe70 (revive-queue predicate, FULLY PURE) ---- */

export const PM_B23_VA_BODY = 0x007dbe70;
export const PM_B23_VA_RET_ZERO = 0x007dbe9f;
export const PM_B23_VA_RET_ONE = 0x007dbea5;
export const PM_B23_BODY_BYTES = 0x36;
export const PM_B23_CALLSITE_COUNT = 0; /* caller-less: indirect vec slot */
export const PM_B23_E8_COUNT = 0;
export const PM_B23_INDIRECT_COUNT = 0;
export const PM_B23_STORE_COUNT = 0;
export const PM_B23_NEXT_FUNC = 0x007dbeb0;
export const PM_B23_OBJ_TYPE_OFF = 0x0;
export const PM_B23_OBJ_FLAGS_OFF = 0xb8;
export const PM_B23_TYPE_CMP_1 = 1;
export const PM_B23_TYPE_CMP_3 = 3;
export const PM_B23_TYPE_CMP_4 = 4;
export const PM_B23_FLAGS_BIT = 0x1000000;
export const PM_B23_VEC_HOLDER_OFF = 0x2a508;
export const PM_B23_VEC_END_OFF = 0x2a50c;
export const PM_B23_VEC_CONSUMER = 0x00730177;

export function pm7dbe70TypeSpecial(type) {
  /* 0x007dbe7b cmp 1 / je, 0x007dbe80 cmp 3 / je, 0x007dbe85 cmp 4 /
     jne — FULL-DWORD exact equality (the ONLY branch class; no range
     compare exists, so the B19 jg equivalence does not apply). */
  const t = type >>> 0;
  return t === PM_B23_TYPE_CMP_1 || t === PM_B23_TYPE_CMP_3 ||
         t === PM_B23_TYPE_CMP_4 ? 1 : 0;
}

export function pm7dbe70FlagsBit(flags) {
  /* 0x007dbe90 and eax,0x1000000 / 0x007dbe95 or eax,0 /
     0x007dbe98 jne — FULL-DWORD bit-24 mask gate, the body's ONLY
     gate (no byte semantics anywhere: the & 0xff rule has nothing
     to widen). */
  return asU32(flags) & PM_B23_FLAGS_BIT ? 1 : 0;
}

export function pm7dbe70Result(type, flags) {
  /* Whole-body composition: special types (1/3/4) pass iff the
     bit-24 flag is set; all other types always pass. The PE reads
     [obj+0xb8] ONLY on the special path (probe-count contract). */
  return pm7dbe70TypeSpecial(type) === 1 ? pm7dbe70FlagsBit(flags) : 1;
}

/* ---- v42 VEC 0x7dc610 + 0x7dc650 (outlined container-cursor leaves) ---- */

export const PM_V42A_VA_BODY = 0x007dc610;
export const PM_V42A_VA_RET = 0x007dc615;
export const PM_V42A_BODY_BYTES = 6;
export const PM_V42A_CALLSITE_COUNT = 1;
export const PM_V42A_CALLER0 = 0x007b47ea;
export const PM_V42A_E8_COUNT = 0;
export const PM_V42A_INDIRECT_COUNT = 0;
export const PM_V42A_STORE_COUNT = 1;
export const PM_V42A_READ_OFF = 0x0;
export const PM_V42A_STORE_OFF = 0x4;
export const PM_V42A_NEXT_FUNC = 0x007dc620;
export const PM_V42B_VA_BODY = 0x007dc650;
export const PM_V42B_VA_RET = 0x007dc654;
export const PM_V42B_BODY_BYTES = 5;
export const PM_V42B_CALLSITE_COUNT = 2;
export const PM_V42B_CALLER0 = 0x0076efb9;
export const PM_V42B_CALLER1 = 0x0076f10b;
export const PM_V42B_E8_COUNT = 0;
export const PM_V42B_INDIRECT_COUNT = 0;
export const PM_V42B_STORE_COUNT = 1;
export const PM_V42B_END_OFF = 0x4;
export const PM_V42B_POP_DELTA_U32 = 0xfffffffc;
export const PM_V42B_NEXT_FUNC = 0x007dc660;

export function pm7dc610EndAfterReset(beginNow) {
  /* 0x007dc610 mov eax,[ecx] ; mov [ecx+4],eax — the read dword is
     retired verbatim (FULL-DWORD u32 copy; the & 0xff rule has
     nothing to widen, no branches exist). */
  return asU32(beginNow);
}

export function pm7dc610StoreOff() {
  /* 0x007dc612 store site [this+4]. */
  return PM_V42A_STORE_OFF | 0;
}

export function pm7dc650EndAfterPop(endNow) {
  /* 0x007dc650 add dword ptr [ecx+4],-4 — u32 wrap. */
  return (asU32(endNow) + PM_V42B_POP_DELTA_U32) >>> 0;
}

export function pm7dc650PopDelta() {
  /* 0x007dc650 the signed delta. */
  return -4;
}

/* ---- v43 SEL 0x7dd3a0 + 0x7dd490 (byte-min select + record copy) ---- */

export const PM_V43A_VA_BODY = 0x007dd3a0;
export const PM_V43A_VA_RET = 0x007dd3a9;
export const PM_V43A_BODY_BYTES = 10;
export const PM_V43A_CALLSITE_COUNT = 2;
export const PM_V43A_CALLER0 = 0x0076e44a;
export const PM_V43A_CALLER1 = 0x0076e461;
export const PM_V43A_E8_COUNT = 0;
export const PM_V43A_INDIRECT_COUNT = 0;
export const PM_V43A_STORE_COUNT = 0;
export const PM_V43A_BYTE_MASK = 0xff;
export const PM_V43A_NEXT_FUNC = 0x007dd3b0;
export const PM_V43B_VA_BODY = 0x007dd490;
export const PM_V43B_VA_RET = 0x007dd4a8;
export const PM_V43B_BODY_BYTES = 25;
export const PM_V43B_CALLSITE_COUNT = 1;
export const PM_V43B_CALLER0 = 0x0079b9f3;
export const PM_V43B_E8_COUNT = 0;
export const PM_V43B_INDIRECT_COUNT = 0;
export const PM_V43B_STORE_COUNT = 3;
export const PM_V43B_OFF_FIELD0 = 0x0;
export const PM_V43B_OFF_FIELD1 = 0x4;
export const PM_V43B_OFF_FIELD2 = 0x8;
export const PM_V43B_NEXT_FUNC = 0x007dd4b0;

export function pm7dd3a0MinByte(aByte, bByte) {
  /* 0x007dd3a0 mov al,[edx] ; cmp al,[ecx] — BYTE-WIDTH unsigned
     compare (v9 rule: & 0xff in-body); the smaller low byte wins. */
  const a = asU32(aByte) & PM_V43A_BYTE_MASK;
  const b = asU32(bByte) & PM_V43A_BYTE_MASK;
  return b < a ? b : a;
}

export function pm7dd3a0SelectsB(aByte, bByte) {
  /* 0x007dd3a4 cmovb ecx,edx — 1 iff byte[b] <u byte[a]. */
  const a = asU32(aByte) & PM_V43A_BYTE_MASK;
  const b = asU32(bByte) & PM_V43A_BYTE_MASK;
  return b < a ? 1 : 0;
}

export function pm7dd490CopyPlan(src1_0, src2_0, src2_1) {
  /* Whole-body plan of 0x007dd490: {src1[0], src2[0], src2[1]} ->
     this[0]/[4]/[8]; store sites stay host (MSVC retires field2
     first, but plan order is field order). */
  return {
    field0: asU32(src1_0),
    field1: asU32(src2_0),
    field2: asU32(src2_1),
  };
}

/* ---- v44 FILL 0x7de2f0 (zero-fill leaf, 7 dwords x count @ stride 0x1c) ---- */

export const PM_V44_VA_BODY = 0x007de2f0;
export const PM_V44_VA_RET = 0x007de31f;
export const PM_V44_BODY_BYTES = 50;
export const PM_V44_CALLSITE_COUNT = 2;
export const PM_V44_CALLER0 = 0x007dc8b9;
export const PM_V44_CALLER1 = 0x007deb8a;
export const PM_V44_E8_COUNT = 0;
export const PM_V44_INDIRECT_COUNT = 0;
export const PM_V44_STORE_COUNT = 7;
export const PM_V44_STRIDE = 0x1c;
export const PM_V44_DWORDS_PER_ELEM = 7;
export const PM_V44_NEXT_FUNC = 0x007de330;

export function pm7de2f0StoreCount(count) {
  /* do-while runs exactly count times when count != 0; u32 wrap. */
  const n = asU32(count);
  return n === 0 ? 0 : (n * PM_V44_DWORDS_PER_ELEM) >>> 0;
}

export function pm7de2f0SkipsZeroCount(count) {
  /* 0x007de2f9 test ecx,ecx / je — equality-to-zero skip. */
  return asU32(count) === 0 ? 1 : 0;
}

export function pm7de2f0Stride() {
  /* 0x007de316 add eax,0x1c. */
  return PM_V44_STRIDE | 0;
}

export function pm7de2f0DwordsPerElem() {
  /* 0x007de302..0x7de313 seven dword zero-stores. */
  return PM_V44_DWORDS_PER_ELEM | 0;
}

/* ---- v45 INIT 0x7df200 (constant initializer, 15 stores through this) ---- */

export const PM_V45_VA_BODY = 0x007df200;
export const PM_V45_VA_RET = 0x007df269;
export const PM_V45_BODY_BYTES = 106;
export const PM_V45_CALLSITE_COUNT = 2;
export const PM_V45_CALLER0 = 0x007e2f72;
export const PM_V45_CALLER1 = 0x007e3008;
export const PM_V45_E8_COUNT = 0;
export const PM_V45_INDIRECT_COUNT = 0;
export const PM_V45_STORE_COUNT = 15;
export const PM_V45_DWORD_STORES = 14;
export const PM_V45_WORD_STORES = 1;
export const PM_V45_STRING_CAP = 0xf;
export const PM_V45_CAP_SITE_COUNT = 3;
export const PM_V45_UNITY_F32_BITS = 0x3f800000;
export const PM_V45_SCALE_F32_BITS = 0x3ca3d70a;
export const PM_V45_WORD_4C_INIT = 0x100;
export const PM_V45_NEXT_FUNC = 0x007df270;

export function pm7df200StoreCount() {
  return PM_V45_DWORD_STORES + PM_V45_WORD_STORES | 0;
}

export function pm7df200StringCap() {
  /* three cap headers @0x18/0x30/0x48 all retire this. */
  return PM_V45_STRING_CAP >>> 0;
}

export function pm7df200CapSiteCount() {
  return PM_V45_CAP_SITE_COUNT | 0;
}

export function pm7df200ScaleF32Bits() {
  /* 0x007df254 — f32 bit pattern verbatim (0.02f). */
  return PM_V45_SCALE_F32_BITS >>> 0;
}

export function pm7df200UnityF32Bits() {
  /* 0x007df24d — f32 bit pattern verbatim (1.0f). */
  return PM_V45_UNITY_F32_BITS >>> 0;
}

export function pm7df200Word4cInit() {
  /* 0x007df247 — the only sub-dword store: exact WORD 0x100. */
  return PM_V45_WORD_4C_INIT >>> 0;
}
