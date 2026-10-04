/** Independent JS oracle for FUN_0082ee40 pure islands (VA 0x0082ee40) and
 *  its per-entry body FUN_007abe20 (ABI v5). Do not derive from the C++
 *  implementation mechanically. */

export const ROOM_TRANSITION_ENGINE_PURE_ABI_VERSION = 30;

/* v7/D1 — DAT_00c7b640 / DAT_00c7b644 are NOT 0x3760371c / 0x37873770.
 *
…
 */
export const ROOM_TRANSITION_ENGINE_C7B640_VA = 0x00c7b640;
export const ROOM_TRANSITION_ENGINE_C7B644_VA = 0x00c7b644;
export const ROOM_TRANSITION_ENGINE_C7B640_BITS = 0x00000000;
export const ROOM_TRANSITION_ENGINE_C7B644_BITS = 0x00000000;
export const ROOM_TRANSITION_ENGINE_DATA_RAW_END_VA = 0x00c61e00;

const bitsToF32 = (bits) => new Float32Array(new Uint32Array([bits >>> 0]).buffer)[0];
const PE_C7B640 = bitsToF32(ROOM_TRANSITION_ENGINE_C7B640_BITS);
const PE_C7B644 = bitsToF32(ROOM_TRANSITION_ENGINE_C7B644_BITS);

/** Early epilog after log/ANM2: Game+0x1ba78 != 0 && anim != 0xf. */
export function roomTransitionEngine82ee40EarlySkipSetup(gate1ba78, anim) {
  return (gate1ba78 | 0) !== 0 && (anim | 0) !== 0xf ? 1 : 0;
}

/** ANM2::Load path when this+0x141 == 0. */
export function roomTransitionEngine82ee40NeedsAnm2Load(field141Byte) {
  return (field141Byte & 0xff) === 0 ? 1 : 0;
}

/** Same-room/same-dim slot rewrite to -1. */
export function roomTransitionEngine82ee40RewriteSlot(
  room,
  arg2,
  dim,
  game18304,
  game1830c,
) {
  if ((room | 0) === (game18304 | 0) && (dim | 0) === (game1830c | 0)) return -1;
  return arg2 | 0;
}

/** dim < 0 → Game+0x1830c. */
export function roomTransitionEngine82ee40EffectiveDim(dim, game1830c) {
  return (dim | 0) < 0 ? game1830c | 0 : dim | 0;
}

/**
 * Receiver setup stores (excludes Game+0x1bb74 player write).
 * @returns {object}
 */
export function roomTransitionEngine82ee40ApplySetup(input) {
  return {
    field4: 0,
    field10: input.slot | 0,
    field14: input.room | 0,
    field18: input.effectiveDim | 0,
    field1c: input.anim | 0,
    field20: 0,
    field24: 0,
    field238: 0,
  };
}

/**
 * Start-state after player loop.
 * anim==2 → field8=0x1e; else field8 = slot==-1 ? 3 : 7.
 */
export function roomTransitionEngine82ee40ApplyStartState(anim, slot) {
  return {
    field0: 1,
    field8: (anim | 0) === 2 ? 0x1e : ((slot | 0) === -1 ? 3 : 7),
    fieldC: 0,
    field22c: PE_C7B640,
    field230: PE_C7B644,
  };
}

/** anim == 0x12 on non-anim2 path → SFX residual. */
export function roomTransitionEngine82ee40NeedsAnim12Sfx(anim) {
  return (anim | 0) === 0x12 ? 1 : 0;
}

/** SFX id: 0x260 if dim==1 else 0x261. */
export function roomTransitionEngine82ee40Anim12SfxId(dim) {
  return (dim | 0) === 1 ? 0x260 : 0x261;
}

/** Player entry float reset. */
export function roomTransitionEngine82ee40PlayerEntryFloatReset() {
  return { field360: PE_C7B640, field364: PE_C7B644, field410: 0 };
}

/* ---------------------------------------------------------------------------
 * v11 — THE PLAYER-RESET LANE (0x0082f08f..0x0082f0b2) + THE INDEX LAW.
…
 * ------------------------------------------------------------------------- */
export const ROOM_TRANSITION_ENGINE_PLAYER_F360_OFF = 0x360;
export const ROOM_TRANSITION_ENGINE_PLAYER_F364_OFF = 0x364;
export const ROOM_TRANSITION_ENGINE_PLAYER_410_OFF = 0x410;
export const ROOM_TRANSITION_ENGINE_PLAYER_RESET_STORE_COUNT = 3;
export const ROOM_TRANSITION_ENGINE_STORE_VA_F360 = 0x0082f09a;
export const ROOM_TRANSITION_ENGINE_STORE_VA_F364 = 0x0082f0aa;
export const ROOM_TRANSITION_ENGINE_STORE_VA_410 = 0x0082f0b2;
export const ROOM_TRANSITION_ENGINE_VA_INDEX_RELOAD = 0x0082f097;
export const ROOM_TRANSITION_ENGINE_VA_INDEX_INC = 0x0082f0b9;
export const ROOM_TRANSITION_ENGINE_VA_INDEX_STORE_BACK = 0x0082f0c0;
export const ROOM_TRANSITION_ENGINE_VA_INDEX_BOTTOM_CMP = 0x0082f0cb;

/**
 * Index-after law (0x0082f0b9 `inc eax`). entryEligible is the 0x0082f049
…
 */
export function roomTransitionEngine82ee40PlayerResetIndexAfter(
  entryEligible,
  indexAtTop,
  indexReloaded,
) {
  const base = (entryEligible | 0) !== 0 ? indexReloaded : indexAtTop;
  return ((base >>> 0) + 1) | 0;
}

/** Static three-store reset plan (PE order 360, 364, 410). */
export function roomTransitionEngine82ee40PlayerResetStorePlan() {
  return { stores: [
    { offset: ROOM_TRANSITION_ENGINE_PLAYER_F360_OFF, value: ROOM_TRANSITION_ENGINE_C7B640_BITS, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_F360, width: 4 },
    { offset: ROOM_TRANSITION_ENGINE_PLAYER_F364_OFF, value: ROOM_TRANSITION_ENGINE_C7B644_BITS, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_F364, width: 4 },
    { offset: ROOM_TRANSITION_ENGINE_PLAYER_410_OFF, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_410, width: 1 },
  ]};
}

/**
 * Fused reset lane: the three stores plus the index law and the 0x0082f0c0
 * store-back (== index_after, re-read at 0x0082f0cb).
 */
export function roomTransitionEngine82ee40PlayerResetPlan(input) {
  const stores = roomTransitionEngine82ee40PlayerResetStorePlan().stores;
  const indexAfter = roomTransitionEngine82ee40PlayerResetIndexAfter(input.entryEligible, input.indexAtTop, input.indexReloaded);
  return { stores, indexAfter, indexStoredBack: indexAfter, reloadUsed: (input.entryEligible | 0) !== 0 ? 1 : 0 };
}

/** FUN_0082eb90 pure predicate on engine field_1c / anim. */
export function roomTransitionEngine82eb90Predicate(field1c) {
  const v = field1c | 0;
  return v === 3 || v === 0xc || v === 0xd || v === 0xb ? 1 : 0;
}

/** Player-loop needs 7abcc0/7abe20 host residual for this field_1c. */
export function roomTransitionEnginePlayerLoopNeedsHost(field1c) {
  if (roomTransitionEngine82eb90Predicate(field1c) !== 0) return 1;
  return (field1c | 0) === 0x14 ? 1 : 0;
}

/* ---- v3 CORRECTNESS FIX: the player loop bound is not loop-invariant -----
 *
…
 */

export const ROOM_TRANSITION_ENGINE_PLAYER_VEC_OFF = 0x1baa8;
export const ROOM_TRANSITION_ENGINE_PLAYER_VEC_END_OFF = 0x1baac;
export const ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE = 4;
export const ROOM_TRANSITION_ENGINE_PLAYER_SKIP_OFF = 0x2c;
export const ROOM_TRANSITION_ENGINE_HOST_VA_LOOP_TOP = 0x0082f010;
export const ROOM_TRANSITION_ENGINE_HOST_VA_FATAL = 0x0082f025;
export const ROOM_TRANSITION_ENGINE_HOST_VA_CLAMP = 0x0082f040;
export const ROOM_TRANSITION_ENGINE_HOST_VA_PREDICATE = 0x0082eb90;
export const ROOM_TRANSITION_ENGINE_HOST_VA_7ABE20 = 0x007abe20;
export const ROOM_TRANSITION_ENGINE_HOST_VA_BOUND = 0x0082f0c3;
export const ROOM_TRANSITION_ENGINE_HOST_VA_EXIT = 0x0082f0d4;
export const ROOM_TRANSITION_ENGINE_PLAYER_173_OFF = 0x173;
export const ROOM_TRANSITION_ENGINE_HOST_VA_173_GATE = 0x0082f05a;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANIM_ARG = 0x0082f063;
export const ROOM_TRANSITION_ENGINE_HOST_VA_14_GATE = 0x0082f077;
export const ROOM_TRANSITION_ENGINE_HOST_VA_7ABCC0_CALL = 0x0082f070;
export const ROOM_TRANSITION_ENGINE_HOST_VA_7ABE20_CALL = 0x0082f084;
export const ROOM_TRANSITION_ENGINE_HOST_VA_GAME_REREAD = 0x0082f089;

/** (end - begin) >> 2 with an ARITHMETIC shift, exactly as `sar eax,2`. */
export function roomTransitionEngine82ee40PlayerCount(begin, end) {
  return ((((end >>> 0) - (begin >>> 0)) | 0) >> 2);
}

/** Entry gate `test eax,eax; je` — only zero skips; negatives still enter. */
export function roomTransitionEngine82ee40PlayerLoopEnter(count) {
  return (count | 0) !== 0 ? 1 : 0;
}

/** Top-of-iteration CF. begin/end must be re-read live for every call. */
export function roomTransitionEngine82ee40PlayerLoopStep(index, begin, end) {
  const count = roomTransitionEngine82ee40PlayerCount(begin, end);
  const clamped = (index >>> 0) >= (count >>> 0) ? 1 : 0;
  return {
    count, index: index | 0, fatalNeeded: count === 0 ? 1 : 0, clampedToFirst: clamped,
    elementPtr: clamped !== 0 ? begin >>> 0 : (begin + Math.imul(index | 0, ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE)) >>> 0,
    indexAfter: ((index >>> 0) + 1) | 0,
  };
}

/** `cmp [ebp-0x34],eax; jb` against a bound re-derived AFTER the host calls. */
export function roomTransitionEngine82ee40PlayerLoopContinue(indexAfter, beginAfter, endAfter) {
  const count = roomTransitionEngine82ee40PlayerCount(beginAfter, endAfter);
  return (indexAfter >>> 0) < (count >>> 0) ? 1 : 0;
}

/** entry+0x2c != 0 skips the body. */
export function roomTransitionEngine82ee40PlayerEntryEligible(field2c) {
  return (field2c | 0) === 0 ? 1 : 0;
}

/* ---- v4: in-loop host-call selection (VA 0x0082f04f … 0x0082f089) ----
 *
…
 */

/** pred && entry+0x173 == 0 → host 0x007abcc0. Byte-gated (mask wide input). */
export function roomTransitionEngine82ee407Abcc0Needed(predicate, entry173Byte) {
  return (predicate | 0) !== 0 && (entry173Byte & 0xff) === 0 ? 1 : 0;
}

/** 0x007abcc0 second argument: (anim != 0xb) ? 1 : 0. */
export function roomTransitionEngine82ee407Abcc0Arg(anim) {
  return (anim | 0) !== 0xb ? 1 : 0;
}

/** field_1c == 0x14 → host 0x007abe20 (full-word compare). */
export function roomTransitionEngine82ee407Abe20Needed(field1c) {
  return (field1c | 0) === 0x14 ? 1 : 0;
}

/** Fused in-loop plan. */
export function roomTransitionEngine82ee40PlayerCallPlan(input) {
  const call7abcc0 = roomTransitionEngine82ee407Abcc0Needed(input.predicate, input.entry173Byte);
  const call7abe20 = roomTransitionEngine82ee407Abe20Needed(input.field1c);
  return {
    call7abcc0, arg7abcc0: roomTransitionEngine82ee407Abcc0Arg(input.anim), call7abe20,
    gameReread: (call7abcc0 !== 0 || call7abe20 !== 0) ? 1 : 0,
  };
}

/* ---- v5: FUN_007abe20 per-entry body pure core ----------------------------
 *
…
 */

export const ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF = 0x8c;
export const ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF = 0x14c;
export const ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF = 0x139a;
export const ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF = 0x1398;
export const ROOM_TRANSITION_ENGINE_ENTRY_41C_OFF = 0x41c;
export const ROOM_TRANSITION_ENGINE_ENTRY_98_OFF = 0x98;
export const ROOM_TRANSITION_ENGINE_ENTRY_48_OFF = 0x48;
export const ROOM_TRANSITION_ENGINE_ENTRY_78_OFF = 0x78;
export const ROOM_TRANSITION_ENGINE_HOST_VA_407F10 = 0x00407f10;
export const ROOM_TRANSITION_ENGINE_HOST_VA_408830 = 0x00408830;
export const ROOM_TRANSITION_ENGINE_HOST_VA_40A5D0 = 0x0040a5d0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_40A1B0 = 0x0040a1b0;
export const ROOM_TRANSITION_ENGINE_STORE_VA_139A_HEAD = 0x007abe2e;
export const ROOM_TRANSITION_ENGINE_STORE_VA_14C = 0x007abe42;
export const ROOM_TRANSITION_ENGINE_STORE_VA_8C = 0x007abe6a;
export const ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL = 0x007abe71;
export const ROOM_TRANSITION_ENGINE_STORE_VA_1398 = 0x007abe78;
export const ROOM_TRANSITION_ENGINE_PARAM2_82F07D = 0x00b6ce1c;
// v7/D3 — the v6 string labels were inverted. Raw section-table reads:
//   0x00b1e010 -> "TeleportDown"   (selected when the arg LOW BYTE is 0)
//   0x00b1dff0 -> "TeleportUp"     (selected when the arg LOW BYTE is != 0)
// The cmove law itself is unchanged; only the names v6 attached were wrong.
export const ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGZERO = 0x00b1e010; // "TeleportDown"
export const ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGNONZERO = 0x00b1dff0; // "TeleportUp"
export const ROOM_TRANSITION_ENGINE_7ABE20_STORE_COUNT = 5;

/** 0x007abe5e `test al,al`: any nonzero low byte → rewind + store 0x8c. */
export function roomTransitionEngine7abe20RewindNeeded(a5d0ResultByte) {
  return (a5d0ResultByte & 0xff) !== 0 ? 1 : 0;
}

/** Typed decision surface: rewind_needed mirrors store_8c (same byte test). */
export function roomTransitionEngine7abe20RewindDecision(a5d0ResultByte) {
  const rewindNeeded = roomTransitionEngine7abe20RewindNeeded(a5d0ResultByte);
  return { rewindNeeded, store8c: rewindNeeded };
}

/** Typed store surface: five STATIC records in PE order. The single gated
 *  record (0x8c, the only conditional store of the body) is fired only when
 *  the runtime RewindDecision says so — mirroring the PE, which has no store
 *  instruction on the AL==0 path. */
export function roomTransitionEngine7abe20StorePlan() {
  return [
    { offset: ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_139A_HEAD, width: 1, gated: 0 },
    { offset: ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF, value: 0x3f800000, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_14C, width: 4, gated: 0 },
    { offset: ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF, value: 1, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_8C, width: 1, gated: 1 },
    { offset: ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL, width: 1, gated: 0 },
    { offset: ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF, value: 1, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_1398, width: 1, gated: 0 },
  ];
}

/* ---- v6: FUN_007abcc0 pure shell + shared SFX Play pack --------------------
 *
…
 */

export const ROOM_TRANSITION_ENGINE_PARAM2_82F07D_STR = "DeathTeleport";
// v7/D3: swapped relative to v6 — verified against the raw PE bytes.
export const ROOM_TRANSITION_ENGINE_PARAM2_ARGZERO_STR = "TeleportDown";
export const ROOM_TRANSITION_ENGINE_PARAM2_ARGNONZERO_STR = "TeleportUp";

export const ROOM_TRANSITION_ENGINE_SFX_GLOBAL_VA = 0x00c7169c;
export const ROOM_TRANSITION_ENGINE_SFX_RECEIVER_OFF = 0x2a324;
export const ROOM_TRANSITION_ENGINE_SFX_ID_7ABCC0 = 0xd7;
export const ROOM_TRANSITION_ENGINE_SFX_ID_DIM1 = 0x260;
export const ROOM_TRANSITION_ENGINE_SFX_ID_DIMOTHER = 0x261;
export const ROOM_TRANSITION_ENGINE_SFX_VOLUME_BITS = 0x3f800000;
export const ROOM_TRANSITION_ENGINE_SFX_FRAME_DELAY = 2;
export const ROOM_TRANSITION_ENGINE_SFX_LOOP = 0;
export const ROOM_TRANSITION_ENGINE_SFX_PITCH_BITS = 0x3f800000;
export const ROOM_TRANSITION_ENGINE_SFX_PAN = 0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_7ABCC0 = 0x007abcc0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_956780 = 0x00956780;
export const ROOM_TRANSITION_ENGINE_HOST_VA_92DC30 = 0x0092dc30;
export const ROOM_TRANSITION_ENGINE_7ABCC0_CMOVE_VA = 0x007abcd5;
export const ROOM_TRANSITION_ENGINE_7ABCC0_7ABE20_CALL_VA = 0x007abcd9;
export const ROOM_TRANSITION_ENGINE_7ABCC0_SFX_GATE_VA = 0x007abcde;
export const ROOM_TRANSITION_ENGINE_7ABCC0_ID_STORE_VA = 0x007abceb;
export const ROOM_TRANSITION_ENGINE_7ABCC0_PREP_CALL_VA = 0x007abcf2;
export const ROOM_TRANSITION_ENGINE_7ABCC0_PLAY_CALL_VA = 0x007abd1e;
export const ROOM_TRANSITION_ENGINE_82EE40_SFX_GATE_VA = 0x0082f14f;
export const ROOM_TRANSITION_ENGINE_82EE40_SFX_ID_VA = 0x0082f16b;
export const ROOM_TRANSITION_ENGINE_82EE40_PREP_CALL_VA = 0x0082f16e;
export const ROOM_TRANSITION_ENGINE_82EE40_PLAY_CALL_VA = 0x0082f19a;

/** 0x007abcd5 CMOVZ law: low byte == 0 -> 0xb1e010 ("TeleportUp"). */
export function roomTransitionEngine7abcc0Param2(argByte) {
  return (argByte & 0xff) === 0 ? ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGZERO : ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGNONZERO;
}

/** 0x007abcde `test bl,bl; je`: SFX block runs iff low byte != 0. */
export function roomTransitionEngine7abcc0SfxNeeded(argByte) {
  return (argByte & 0xff) !== 0 ? 1 : 0;
}

/** Fused wrapper surface: param2, sfx gate, pre-prep id const 0xd7. */
export function roomTransitionEngine7abcc0Plan(argByte) {
  return { param2: roomTransitionEngine7abcc0Param2(argByte), sfxNeeded: roomTransitionEngine7abcc0SfxNeeded(argByte), sfxId: ROOM_TRANSITION_ENGINE_SFX_ID_7ABCC0 };
}

/** Shared SFXManager::Play residual pack (engine H3 + 7abcc0 block). */
export function roomTransitionEngineSfxPlayPack() {
  return {
    volumeBits: ROOM_TRANSITION_ENGINE_SFX_VOLUME_BITS, frameDelay: ROOM_TRANSITION_ENGINE_SFX_FRAME_DELAY,
    loop: ROOM_TRANSITION_ENGINE_SFX_LOOP, pitchBits: ROOM_TRANSITION_ENGINE_SFX_PITCH_BITS, pan: ROOM_TRANSITION_ENGINE_SFX_PAN,
    receiverOff: ROOM_TRANSITION_ENGINE_SFX_RECEIVER_OFF, prepVa: ROOM_TRANSITION_ENGINE_HOST_VA_956780, playVa: ROOM_TRANSITION_ENGINE_HOST_VA_92DC30,
  };
}

/* ---- v7 -------------------------------------------------------------------
 *
…
 */

export const ROOM_TRANSITION_ENGINE_ENTRY_LOG_LEVEL = 1;
export const ROOM_TRANSITION_ENGINE_ENTRY_LOG_FMT_VA = 0x00b6cdc8;
export const ROOM_TRANSITION_ENGINE_ENTRY_LOG_FRAME_OFF = 0x264f8;
export const ROOM_TRANSITION_ENGINE_ENTRY_LOG_ARGC = 4;
export const ROOM_TRANSITION_ENGINE_ENTRY_LOG_FMT_STR =
  "[Frame %d] Starting room transition (type %d) \n";
export const ROOM_TRANSITION_ENGINE_HOST_VA_LOG = 0x00a112c0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ENTRY_LOG_CALL = 0x0082ee96;

export const ROOM_TRANSITION_ENGINE_FATAL_LEVEL = 0x10;
export const ROOM_TRANSITION_ENGINE_FATAL_MSG_VA = 0x00b7e6bc;
export const ROOM_TRANSITION_ENGINE_FATAL_ARGC = 2;
export const ROOM_TRANSITION_ENGINE_FATAL_MSG_STR =
  "PlayerManager::GetPlayer() : There are no players! \n";
export const ROOM_TRANSITION_ENGINE_HOST_VA_END_REREAD = 0x0082f02a;
export const ROOM_TRANSITION_ENGINE_HOST_VA_FATAL_GAME_REREAD = 0x0082f030;
export const ROOM_TRANSITION_ENGINE_HOST_VA_BEGIN_REREAD = 0x0082f036;
export const ROOM_TRANSITION_ENGINE_HOST_VA_LOOP_REBASE = 0x0082f0ba;

export const ROOM_TRANSITION_ENGINE_GAME_SRC_PRELOOP = 0;
export const ROOM_TRANSITION_ENGINE_GAME_SRC_FATAL = 1;
export const ROOM_TRANSITION_ENGINE_GAME_SRC_HOSTCALL = 2;

export const ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_ANIM_REREAD = 0x0082f0d4;
export const ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_FIELD0 = 0x0082f0d7;
export const ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_ANIM2 = 0x0082f0dd;
export const ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_SLOT = 0x0082f115;
export const ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_DIM_CMP = 0x0082f15f;
export const ROOM_TRANSITION_ENGINE_TAIL_FIELD8_ANIM2 = 0x1e;
export const ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_NEG1 = 3;
export const ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_OTHER = 7;
export const ROOM_TRANSITION_ENGINE_TAIL_SFX_ID_NONE = -1;

export const ROOM_TRANSITION_ENGINE_ANM2_LITERAL_VA = 0x00b6cda8;
export const ROOM_TRANSITION_ENGINE_ANM2_LITERAL_LEN = 0x1d;
export const ROOM_TRANSITION_ENGINE_ANM2_LITERAL_STR =
  "gfx/ui/boss/versusscreen.anm2";
export const ROOM_TRANSITION_ENGINE_ANM2_SSO_CAPACITY = 0xf;
export const ROOM_TRANSITION_ENGINE_ANM2_HEAP_CAPACITY = 0x1f;
export const ROOM_TRANSITION_ENGINE_ANM2_ALLOC_REQUEST = 0x20;
export const ROOM_TRANSITION_ENGINE_ANM2_SSO_LIMIT = 0x10;
export const ROOM_TRANSITION_ENGINE_ANM2_LOAD_GRAPHICS = 1;
export const ROOM_TRANSITION_ENGINE_ANM2_LOAD_RECEIVER_OFF = 0x38;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_ALLOC = 0x0040cf00;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_LOAD = 0x0040bd50;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_FREE = 0x00aef15c;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_GATE = 0x0082ee9e;
export const ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_RELEASE_GATE = 0x0082ef2c;

/** Raw bits of DAT_00c7b640 (v7/D1: uninitialised `.data`, never written). */
export function roomTransitionEngineC7b640Bits() {
  return ROOM_TRANSITION_ENGINE_C7B640_BITS >>> 0;
}

/** Raw bits of DAT_00c7b644. */
export function roomTransitionEngineC7b644Bits() {
  return ROOM_TRANSITION_ENGINE_C7B644_BITS >>> 0;
}

/** The `end` value alive in ECX at 0x0082f038 (0x0082f02a overwrote it only
 *  when the fatal block ran). */
export function roomTransitionEngine82ee40PlayerLoopEndUsed(fatalNeeded, endF010, endF02a) {
  return ((fatalNeeded | 0) !== 0 ? endF02a : endF010) >>> 0;
}

/**
 * PE-exact top of iteration, 0x0082f010 .. 0x0082f047, traced register by
 * register. Four SEPARATE live reads go in; folding them into one (begin,end)
 * pair is only correct when the host log at 0x0082f025 leaves the vector alone.
 */
export function roomTransitionEngine82ee40PlayerLoopStepExact(input) {
  const index = input.index | 0;
  const endF010 = input.endF010 >>> 0, beginF015 = input.beginF015 >>> 0;
  const endF02a = input.endF02a >>> 0, beginF036 = input.beginF036 >>> 0;
  const countHead = ((endF010 - beginF015) | 0) >> 2;
  const fatal = countHead === 0 ? 1 : 0;
  const ecx = fatal !== 0 ? endF02a : endF010;
  const countBound = ((ecx - beginF036) | 0) >> 2;
  const clamped = (index >>> 0) >= (countBound >>> 0) ? 1 : 0;
  return {
    countHead, fatalNeeded: fatal, endRereads: fatal, gameRereadFatal: fatal, countBound, index,
    clampedToFirst: clamped,
    slotPtr: clamped !== 0 ? beginF036 : (beginF036 + Math.imul(index, ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE)) >>> 0,
    indexAfter: ((index >>> 0) + 1) | 0,
  };
}

/**
 * Which `mov edx,[0xc71678]` feeds the 0x0082f0ba re-base. 0x0082f030 fires on
…
 */
export function roomTransitionEngine82ee40LoopGameSource(input) {
  const hostCall = (input.entryEligible | 0) !== 0 && ((input.call7abcc0 | 0) !== 0 || (input.call7abe20 | 0) !== 0) ? 1 : 0;
  if (hostCall !== 0) return ROOM_TRANSITION_ENGINE_GAME_SRC_HOSTCALL;
  if ((input.fatalNeeded | 0) !== 0) return ROOM_TRANSITION_ENGINE_GAME_SRC_FATAL;
  return ROOM_TRANSITION_ENGINE_GAME_SRC_PRELOOP;
}

/**
 * SFX id from the arguments as the PE sees them. game1830c is accepted only so
 * that a model which wrongly switched to the effective dimension would differ:
 * 0x0082f15f reads [ebx+0x18], the untouched arg5 slot.
 */
export function roomTransitionEngine82ee40Anim12SfxIdFromArgs(dimArgRaw, game1830c) {
  void game1830c;
  return (dimArgRaw | 0) === 1 ? ROOM_TRANSITION_ENGINE_SFX_ID_DIM1 : ROOM_TRANSITION_ENGINE_SFX_ID_DIMOTHER;
}

/** Tail 0x0082f0d4 .. 0x0082f19a, traced register by register. */
export function roomTransitionEngine82ee40TailPlan(input) {
  const edx = input.field1cAfterLoop | 0;
  const anim2 = edx === 2 ? 1 : 0;
  const field8 = anim2 !== 0 ? ROOM_TRANSITION_ENGINE_TAIL_FIELD8_ANIM2
    : ((input.slotAfterRewrite | 0) === -1 ? ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_NEG1 : ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_OTHER);
  const sfxNeeded = (anim2 === 0 && edx === 0x12) ? 1 : 0;
  return {
    field0: 1, anim2Path: anim2, field8, fieldC: 0,
    field22cBits: ROOM_TRANSITION_ENGINE_C7B640_BITS, field230Bits: ROOM_TRANSITION_ENGINE_C7B644_BITS,
    sfxNeeded,
    sfxId: sfxNeeded !== 0 ? roomTransitionEngine82ee40Anim12SfxIdFromArgs(input.dimArgRaw, 0) : ROOM_TRANSITION_ENGINE_TAIL_SFX_ID_NONE,
  };
}

/** Entry log 0x0082ee88..0x0082ee9b (cdecl, four dwords, right to left). */
export function roomTransitionEngine82ee40EntryLogPack(animArg) {
  return {
    level: ROOM_TRANSITION_ENGINE_ENTRY_LOG_LEVEL, formatVa: ROOM_TRANSITION_ENGINE_ENTRY_LOG_FMT_VA,
    frameFieldOff: ROOM_TRANSITION_ENGINE_ENTRY_LOG_FRAME_OFF, animArg: animArg | 0,
    logVa: ROOM_TRANSITION_ENGINE_HOST_VA_LOG, argc: ROOM_TRANSITION_ENGINE_ENTRY_LOG_ARGC,
  };
}

/** ANM2 string build 0x0082eeab..0x0082ef70 (constants only; static). */
export function roomTransitionEngine82ee40Anm2StringPlan() {
  return {
    literalVa: ROOM_TRANSITION_ENGINE_ANM2_LITERAL_VA, literalLen: ROOM_TRANSITION_ENGINE_ANM2_LITERAL_LEN,
    ssoCapacity: ROOM_TRANSITION_ENGINE_ANM2_SSO_CAPACITY, heapCapacity: ROOM_TRANSITION_ENGINE_ANM2_HEAP_CAPACITY,
    allocRequest: ROOM_TRANSITION_ENGINE_ANM2_ALLOC_REQUEST, loadGraphics: ROOM_TRANSITION_ENGINE_ANM2_LOAD_GRAPHICS,
    loadReceiverOff: ROOM_TRANSITION_ENGINE_ANM2_LOAD_RECEIVER_OFF, loadVa: ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_LOAD,
    allocVa: ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_ALLOC, freeVa: ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_FREE,
  };
}

/** 0x0082ef2c `cmp edx,0x10 ; jb` on the CAPACITY — unsigned, full word. */
export function roomTransitionEngine82ee40Anm2StringNeedsRelease(capacity) {
  return (capacity >>> 0) >= ROOM_TRANSITION_ENGINE_ANM2_SSO_LIMIT ? 1 : 0;
}

/** 0x0082ef34 `inc edx` — capacity + 1 with 32-bit wrap. */
export function roomTransitionEngine82ee40Anm2StringReleaseSize(capacity) {
  return ((capacity >>> 0) + 1) >>> 0;
}

/* =========================================================================
 * v8 — FUN_0040a5d0, the animation-name lookup (VA 0x0040a5d0 .. 0x0040a685,
…
 * ========================================================================= */

export const ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE = 0x13c;
export const ROOM_TRANSITION_ENGINE_40A5D0_TABLE_OFF = 0x74;
export const ROOM_TRANSITION_ENGINE_40A5D0_COUNT_OFF = 0x78;
export const ROOM_TRANSITION_ENGINE_40A5D0_RECEIVER_OFF = 0x30;
export const ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF = 0x14;
export const ROOM_TRANSITION_ENGINE_40A5D0_SSO_LIMIT = 0x10;
export const ROOM_TRANSITION_ENGINE_40A5D0_STRCMP_STEP = 2;
export const ROOM_TRANSITION_ENGINE_40A5D0_NOT_FOUND = -1;
export const ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND = 1;
export const ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING = 0;
export const ROOM_TRANSITION_ENGINE_40A5D0_WARN_LEVEL = 1;
export const ROOM_TRANSITION_ENGINE_40A5D0_WARN_MSG_VA = 0x00b1a614;
export const ROOM_TRANSITION_ENGINE_40A5D0_WARN_ARGC = 3;
/* Raw section-table read of 0x00b1a614 (.rdata VA 0x00b18000, raw 0x00716600
   -> file offset 0x00718c14). Pinned against the PE by the v8 PE-truth test. */
export const ROOM_TRANSITION_ENGINE_40A5D0_WARN_MSG_STR =
  "[warn] no animation named %s\n";
export const ROOM_TRANSITION_ENGINE_HOST_VA_408970 = 0x00408970;

export const ROOM_TRANSITION_ENGINE_40A5D0_VA_NEEDLE_LOAD = 0x0040a5d9;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_COUNT_LOAD = 0x0040a5e3;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_COUNT_GATE = 0x0040a5e6;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_TABLE_LOAD = 0x0040a5ea;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_LOOP_TOP = 0x0040a5f2;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_SSO_SPLIT = 0x0040a5f8;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_TOP = 0x0040a600;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_STEP2 = 0x0040a612;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_EQ = 0x0040a61c;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_NE = 0x0040a620;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_MATCH_TEST = 0x0040a625;
/* D4 — the per-iteration needle reload (`8b 4d 08`, the same three bytes as
   the prologue load at 0x0040a5d9). */
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_NEEDLE_RELOAD = 0x0040a629;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_STRIDE_ADD = 0x0040a62d;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_LOOP_BACK = 0x0040a635;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_WARN = 0x0040a637;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_AL_ZERO = 0x0040a647;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_MATCH = 0x0040a652;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_ENTRY_IMUL = 0x0040a655;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_RECEIVER = 0x0040a65b;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_ARG2_GATE = 0x0040a661;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_CALL_408830 = 0x0040a668;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_CALL_408970 = 0x0040a678;
export const ROOM_TRANSITION_ENGINE_40A5D0_VA_END = 0x0040a685;
export const ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2 = 1;
export const ROOM_TRANSITION_ENGINE_7ABE20_A5D0_CALL_VA = 0x007abe59;

/** 0x0040a5e6 `test ebx,ebx ; je` — a FULL DWORD test; only zero skips. */
export function roomTransitionEngine40a5d0SearchEnter(count) {
  return (count | 0) !== 0 ? 1 : 0;
}

/** 0x0040a5f2/f8 `cmp dword [esi+0x14],0x10 ; jb` — UNSIGNED, full dword. */
export function roomTransitionEngine40a5d0NamePtr(elemPtr, capacity, heapPtr) {
  return (capacity >>> 0) < (ROOM_TRANSITION_ENGINE_40A5D0_SSO_LIMIT >>> 0) ? elemPtr >>> 0 : heapPtr >>> 0;
}

/** 0x0040a633/35 `cmp edi,ebx ; jb` — UNSIGNED and strict. */
export function roomTransitionEngine40a5d0LoopContinue(indexAfter, count) {
  return (indexAfter >>> 0) < (count >>> 0) ? 1 : 0;
}

/** 0x0040a655 `imul eax,edi,0x13c` + 0x0040a65e `add eax,[ebp-8]`. */
export function roomTransitionEngine40a5d0EntryPtr(tableBase, index) {
  return (tableBase + Math.imul(index | 0, ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE)) >>> 0;
}

/** 0x0040a65b `add ecx,0x30`. */
export function roomTransitionEngine40a5d0Receiver(thisPtr) {
  return ((thisPtr >>> 0) + ROOM_TRANSITION_ENGINE_40A5D0_RECEIVER_OFF) >>> 0;
}

/** 0x0040a661 `cmp byte ptr [ebp+0xc],0` — a BYTE gate on a dword argument. */
export function roomTransitionEngine40a5d0MatchCallee(arg2) {
  return (arg2 & 0xff) !== 0 ? ROOM_TRANSITION_ENGINE_HOST_VA_408830 >>> 0 : ROOM_TRANSITION_ENGINE_HOST_VA_408970 >>> 0;
}

/** D6 — `xor al,al` / `mov al,1` patch AL only; bits 8..31 are the previous
 *  call's EAX. That is exactly why 0x007abe5e spells `test al,al`. */
export function roomTransitionEngine40a5d0ReturnEax(al, calleeEax) {
  const low = (al | 0) !== 0 ? ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND : ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING;
  return ((calleeEax & 0xffffff00) | (low & 0xff)) >>> 0;
}

/** 0x0040a637..0x0040a647, shared by "count == 0" and "search exhausted". */
export function roomTransitionEngine40a5d0WarnPack(needle) {
  return {
    level: ROOM_TRANSITION_ENGINE_40A5D0_WARN_LEVEL, formatVa: ROOM_TRANSITION_ENGINE_40A5D0_WARN_MSG_VA,
    needle: needle >>> 0, logVa: ROOM_TRANSITION_ENGINE_HOST_VA_LOG,
    argc: ROOM_TRANSITION_ENGINE_40A5D0_WARN_ARGC, al: ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING,
  };
}

const rte40a5d0Load32 = (mem, off) =>
  (mem[off] | (mem[off + 1] << 8) | (mem[off + 2] << 16) | (mem[off + 3] << 24)) >>>
  0;

/**
 * The inlined strcmp at 0x0040a600..0x0040a622, derived semantically.
…
 */
export function roomTransitionEngine40a5d0Strcmp(mem, haystackOff, needleOff) {
  let i = 0;
  while (mem[haystackOff + i] === mem[needleOff + i] && mem[haystackOff + i] !== 0) i += 1;
  const av = mem[haystackOff + i], cv = mem[needleOff + i];
  const result = av === cv ? 0 : (av < cv ? -1 : 1);
  return { result, advance: (result === 0 && (i & 1) === 1) ? (i + 1) : (i - (i & 1)) };
}

/**
 * Whole body of 0x0040a5d0. Every data address is an offset into `mem`
…
 */
export function roomTransitionEngine40a5d0Lookup(input) {
  const mem = input.mem, tableOff = input.tableOff >>> 0, count = input.count | 0;
  const needleOff = input.needleOff >>> 0, thisOff = input.thisOff >>> 0, arg2 = input.arg2 >>> 0;
  const iterationLimit = input.iterationLimit === undefined ? -1 : (input.iterationLimit | 0);
  const load32 = (off) => (mem[off] | (mem[off + 1] << 8) | (mem[off + 2] << 16) | (mem[off + 3] << 24)) >>> 0;
  const out = {
    entered: 0, iterations: 0, found: 0, index: ROOM_TRANSITION_ENGINE_40A5D0_NOT_FOUND,
    entryPtr: 0, receiver: 0, calleeVa: 0, warnNeedle: 0, al: ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING, truncated: 0,
  };
  let ecx = needleOff, edi = 0;
  if (roomTransitionEngine40a5d0SearchEnter(count) === 0) {
    out.calleeVa = ROOM_TRANSITION_ENGINE_HOST_VA_LOG >>> 0; out.warnNeedle = ecx; return out;
  }
  out.entered = 1;
  let esi = tableOff;
  for (;;) {
    if (iterationLimit >= 0 && out.iterations >= iterationLimit) { out.truncated = 1; return out; }
    const eax = roomTransitionEngine40a5d0NamePtr(esi, load32(esi + ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF), load32(esi));
    const cmp = roomTransitionEngine40a5d0Strcmp(mem, eax, ecx);
    out.iterations += 1;
    if (cmp.result === 0) {
      out.found = 1; out.index = edi | 0;
      out.entryPtr = roomTransitionEngine40a5d0EntryPtr(tableOff, edi);
      out.receiver = roomTransitionEngine40a5d0Receiver(thisOff);
      out.calleeVa = roomTransitionEngine40a5d0MatchCallee(arg2);
      out.al = ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND;
      return out;
    }
    ecx = needleOff;
    edi = ((edi >>> 0) + 1) | 0;
    esi = (esi + ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE) >>> 0;
    if (roomTransitionEngine40a5d0LoopContinue(edi, count) === 0) break;
  }
  out.calleeVa = ROOM_TRANSITION_ENGINE_HOST_VA_LOG >>> 0;
  out.warnNeedle = ecx;
  out.al = ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING;
  return out;
}

/* ======================================================================== */
/* v9 — the 0x00408830 / 0x00408970 AnimationState apply pair.              */
/*                                                                          */
/* Oracle written from the instruction stream (830 raw 0x7c30 size 0x131,   */
/* 970 raw 0x7d70 size 0x214), NOT from the C++ side and NOT from the anm2  */
/* or exit models — the v9 tests assert three-way agreement afterwards.     */
/* Divergence table V1..V9 and the SEH recovery: see the header.            */
/* ======================================================================== */

export const ROOM_TRANSITION_ENGINE_ANIMSTATE_DATA_OFF = 4;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF = 8;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF = 0xc;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_F10_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_BYTE14_OFF = 0x14;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_F18_OFF = 0x18;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_F1C_OFF = 0x1c;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_A_OFF = 0x1c;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_B_OFF = 0x24;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_ELEM_SIZE = 4;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE = 0xff;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_ALLOC_SAT = 0xffffffff;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_BLOCK_BIAS = 4;
export const ROOM_TRANSITION_ENGINE_408830_F10_BITS = 0xbf800000;
export const ROOM_TRANSITION_ENGINE_408830_END_VA = 0x00408961;
export const ROOM_TRANSITION_ENGINE_408970_END_VA = 0x00408b84;
export const ROOM_TRANSITION_ENGINE_HOST_VA_A648B0 = 0x00a648b0;
export const ROOM_TRANSITION_ENGINE_A648B0_CL_FREE = 1;
export const ROOM_TRANSITION_ENGINE_A648B0_CL_ALLOC = 0;
export const ROOM_TRANSITION_ENGINE_THUNK_VA_MEMSET = 0x00af05e5;
export const ROOM_TRANSITION_ENGINE_THUNK_VA_MEMCPY = 0x00af05df;
export const ROOM_TRANSITION_ENGINE_IAT_VA_MEMSET = 0x00b1875c;
export const ROOM_TRANSITION_ENGINE_IAT_VA_MEMCPY = 0x00b18760;
export const ROOM_TRANSITION_ENGINE_IAT_VA_FREE = 0x00b187dc;
export const ROOM_TRANSITION_ENGINE_IAT_VA_TERMINATE = 0x00b18780;
export const ROOM_TRANSITION_ENGINE_IAT_VA_CXXHANDLER = 0x00b18784;
export const ROOM_TRANSITION_ENGINE_STATS_HEAD_VA = 0x00c7de78;
export const ROOM_TRANSITION_ENGINE_STATS_HEAD_DELTA = 0x30;
export const ROOM_TRANSITION_ENGINE_STATS_FIXED_VA = 0x00c7f618;
export const ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408830 = 0x00af0b60;
export const ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408970 = 0x00af0b80;
export const ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408830 = 0x00bb3550;
export const ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408970 = 0x00bb3584;
export const ROOM_TRANSITION_ENGINE_SEH_MAGIC = 0x19930522;
export const ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830 = 2;
export const ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970 = 4;
export const ROOM_TRANSITION_ENGINE_SEH_TRY_BLOCKS = 0;
export const ROOM_TRANSITION_ENGINE_SEH_EH_FLAGS = 1;
export const ROOM_TRANSITION_ENGINE_SEH_UNWIND_TO_STATE = -1;
export const ROOM_TRANSITION_ENGINE_SEH_ACTION_VA = 0x00af05cd;
export const ROOM_TRANSITION_ENGINE_SEH_DISPATCH_VA = 0x00af05c7;
export const ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA = 0x00bf93b4;
export const ROOM_TRANSITION_ENGINE_408970_ARM_SKIP = 0;
export const ROOM_TRANSITION_ENGINE_408970_ARM_FREE = 1;
export const ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC = 2;
export const ROOM_TRANSITION_ENGINE_408970_PUBLISH_OFF = 8;
export const ROOM_TRANSITION_ENGINE_7ABE20_408830_ARG = 0;
export const ROOM_TRANSITION_ENGINE_7ABE20_408830_PUSH_VA = 0x007abe3a;
export const ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA = 0x007abe4c;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA = 0x30;
export const ROOM_TRANSITION_ENGINE_ANIMSTATE_OVERLAY_DELTA = 0x50;
export const ROOM_TRANSITION_ENGINE_408830_ARG_STORE_VA = 0x0040885c;
export const ROOM_TRANSITION_ENGINE_408830_STATE0_STORE_VA = 0x00408869;
export const ROOM_TRANSITION_ENGINE_408830_STATE1_STORE_VA = 0x00408893;
export const ROOM_TRANSITION_ENGINE_408830_FREE_A_CALL_VA = 0x00408870;
export const ROOM_TRANSITION_ENGINE_408830_FREE_B_CALL_VA = 0x0040889a;
export const ROOM_TRANSITION_ENGINE_408830_DATA_GATE_VA = 0x004088b8;
export const ROOM_TRANSITION_ENGINE_408830_COUNT_A_GATE_VA = 0x004088bf;
export const ROOM_TRANSITION_ENGINE_408830_ALLOC_A_CALL_VA = 0x004088d5;
export const ROOM_TRANSITION_ENGINE_408830_MEMSET_A_CALL_VA = 0x004088ed;
export const ROOM_TRANSITION_ENGINE_408830_DATA_REREAD_GATE_VA = 0x004088f8;
export const ROOM_TRANSITION_ENGINE_408830_COUNT_B_GATE_VA = 0x004088ff;
export const ROOM_TRANSITION_ENGINE_408830_ALLOC_B_CALL_VA = 0x00408915;
export const ROOM_TRANSITION_ENGINE_408830_MEMSET_B_CALL_VA = 0x0040892d;
export const ROOM_TRANSITION_ENGINE_408830_TAIL_STORE_VA = 0x00408935;
export const ROOM_TRANSITION_ENGINE_408970_SKIP_A_GATE_VA = 0x004089df;
export const ROOM_TRANSITION_ENGINE_408970_SIGN_A_GATE_VA = 0x004089e7;
export const ROOM_TRANSITION_ENGINE_408970_STATE0_STORE_VA = 0x004089fc;
export const ROOM_TRANSITION_ENGINE_408970_FREE_A_CALL_VA = 0x00408a03;
export const ROOM_TRANSITION_ENGINE_408970_ALLOC_A_CALL_VA = 0x00408a32;
export const ROOM_TRANSITION_ENGINE_408970_MEMSET_A_CALL_VA = 0x00408a48;
export const ROOM_TRANSITION_ENGINE_408970_MEMCPY_A_CALL_VA = 0x00408a62;
export const ROOM_TRANSITION_ENGINE_408970_RELEASE_A_CALL_VA = 0x00408a92;
export const ROOM_TRANSITION_ENGINE_408970_PUBLISH_A_STORE_VA = 0x00408aa2;
export const ROOM_TRANSITION_ENGINE_408970_SKIP_B_GATE_VA = 0x00408aad;
export const ROOM_TRANSITION_ENGINE_408970_SIGN_B_GATE_VA = 0x00408ab6;
export const ROOM_TRANSITION_ENGINE_408970_STATE2_STORE_VA = 0x00408acb;
export const ROOM_TRANSITION_ENGINE_408970_FREE_B_CALL_VA = 0x00408ad2;
export const ROOM_TRANSITION_ENGINE_408970_ALLOC_B_CALL_VA = 0x00408afa;
export const ROOM_TRANSITION_ENGINE_408970_MEMSET_B_CALL_VA = 0x00408b10;
export const ROOM_TRANSITION_ENGINE_408970_MEMCPY_B_CALL_VA = 0x00408b2a;
export const ROOM_TRANSITION_ENGINE_408970_RELEASE_B_CALL_VA = 0x00408b5a;
export const ROOM_TRANSITION_ENGINE_408970_CLEAR_0C_STORE_VA = 0x00408b63;
export const ROOM_TRANSITION_ENGINE_408970_PUBLISH_B_STORE_VA = 0x00408b6a;
export const ROOM_TRANSITION_ENGINE_408970_ARG_STORE_VA = 0x00408b6d;

/** mul r32,4 / seto / neg / or — an overflowed product reads 0xffffffff. */
export function roomTransitionEngineAnimstateAllocSize(count) {
  const c = count >>> 0;
  if (c > 0x3fffffff) return ROOM_TRANSITION_ENGINE_ANIMSTATE_ALLOC_SAT >>> 0;
  return Math.imul(c, ROOM_TRANSITION_ENGINE_ANIMSTATE_ELEM_SIZE) >>> 0;
}

/** shl/lea count*4 — plain 32-bit wrap, never saturated. */
export function roomTransitionEngineAnimstateMemsetSize(count) {
  return ((count >>> 0) << 2) >>> 0;
}

/** 970 inline release frees buf-4 ([ptr-4] carries the byte size). */
export function roomTransitionEngineAnimstateFreeBlockPtr(bufPtr) {
  return ((bufPtr >>> 0) - ROOM_TRANSITION_ENGINE_ANIMSTATE_BLOCK_BIAS) >>> 0;
}

/** Stats block: live head → head+0x30, else the fixed fallback pair. */
export function roomTransitionEngineAnimstateStatsBlock(statsHead) {
  if ((statsHead >>> 0) === 0) return ROOM_TRANSITION_ENGINE_STATS_FIXED_VA >>> 0;
  return (statsHead + ROOM_TRANSITION_ENGINE_STATS_HEAD_DELTA) >>> 0;
}

/** 830 count gate: FULL-DWORD test/je — zero only (V2). */
export function roomTransitionEngine408830CountGate(count) {
  return (count >>> 0) !== 0 ? 1 : 0;
}

/**
 * Whole-CF plan of 0x00408830. Every input is one machine observation:
 * dataZero/dataAfterA are the 0x004088b0 / 0x004088f2 re-reads and the two
 * count pairs are the pre-alloc and post-alloc reads (V9).
 */
export function roomTransitionEngine408830Plan(input) {
  const arg = (input.arg ?? 0) >>> 0, bufA = (input.bufA ?? 0) >>> 0, bufB = (input.bufB ?? 0) >>> 0;
  const data0 = (input.data0 ?? 0) >>> 0, countAAlloc = (input.countAAlloc ?? 0) >>> 0;
  const countAMemset = (input.countAMemset ?? 0) >>> 0, dataAfterA = (input.dataAfterA ?? 0) >>> 0;
  const countBAlloc = (input.countBAlloc ?? 0) >>> 0, countBMemset = (input.countBMemset ?? 0) >>> 0;
  const allocAResult = (input.allocAResult ?? 0) >>> 0, allocBResult = (input.allocBResult ?? 0) >>> 0;
  const freeA = bufA !== 0 ? 1 : 0, freeB = bufB !== 0 ? 1 : 0, dataLive = data0 !== 0;
  const allocA = (dataLive && roomTransitionEngine408830CountGate(countAAlloc) !== 0) ? 1 : 0;
  let bLive;
  if (!dataLive) bLive = false;
  else if (allocA !== 0) bLive = dataAfterA !== 0;
  else bLive = true;
  const allocB = (bLive && roomTransitionEngine408830CountGate(countBAlloc) !== 0) ? 1 : 0;
  return {
    storeArgFirst: 1, freeA, freeB, allocA,
    allocASize: allocA !== 0 ? roomTransitionEngineAnimstateAllocSize(countAAlloc) : 0,
    memsetASize: allocA !== 0 ? roomTransitionEngineAnimstateMemsetSize(countAMemset) : 0,
    allocB,
    allocBSize: allocB !== 0 ? roomTransitionEngineAnimstateAllocSize(countBAlloc) : 0,
    memsetBSize: allocB !== 0 ? roomTransitionEngineAnimstateMemsetSize(countBMemset) : 0,
    memsetFill: ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE, final4: arg,
    final8: allocA !== 0 ? allocAResult : 0, finalC: allocB !== 0 ? allocBResult : 0,
    tail10Bits: ROOM_TRANSITION_ENGINE_408830_F10_BITS, tail14Byte: 0, tail18: 0, tail1c: 0,
    hostCalls: freeA + freeB + 2 * allocA + 2 * allocB,
  };
}

/** 970 null-safe count sample: a missing descriptor contributes zero. */
export function roomTransitionEngine408970CountSample(dataPtr, rawCount) {
  return (dataPtr >>> 0) === 0 ? 0 : rawCount | 0;
}

/** 970 arm law: equality skips; then SIGNED jg splits realloc from free. */
export function roomTransitionEngine408970ArmSelect(oldCount, newCount) {
  if ((oldCount >>> 0) === (newCount >>> 0)) return ROOM_TRANSITION_ENGINE_408970_ARM_SKIP;
  if ((newCount | 0) > 0) return ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC;
  return ROOM_TRANSITION_ENGINE_408970_ARM_FREE;
}

/** Copy gate: OLD count > 0 SIGNED (jle skips). */
export function roomTransitionEngine408970CopyNeeded(oldCount) {
  return (oldCount | 0) > 0 ? 1 : 0;
}

/** Copy length: OLD count * 4, wrapped — never clamped to the new size. */
export function roomTransitionEngine408970CopySize(oldCount) {
  return ((oldCount >>> 0) << 2) >>> 0;
}

/** One 970 arm. whichB selects buffer B semantics (slot 0xc, V7 publish). */
export function roomTransitionEngine408970ArmPlan(input) {
  const whichB = (input.whichB ?? 0) >>> 0, oldCount = (input.oldCount ?? 0) >>> 0;
  const newCount = (input.newCount ?? 0) >>> 0, slotPtr = (input.slotPtr ?? 0) >>> 0;
  const statsHead = (input.statsHead ?? 0) >>> 0, allocResult = (input.allocResult ?? 0) >>> 0;
  const ownOff = whichB !== 0 ? ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF : ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF;
  const arm = roomTransitionEngine408970ArmSelect(oldCount, newCount);
  const slotLive = slotPtr !== 0;
  const out = {
    arm, wrapperFree: 0, zeroNeeded: 0, zeroOff: 0, allocSize: 0, memsetSize: 0,
    memsetFill: ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE, copyNeeded: 0, copySize: 0,
    copySrcOff: ownOff, releaseOld: 0, statsBlock: 0, releasePtr: 0,
    publishNeeded: 0, publishOff: 0, publishValue: 0, hostCalls: 0,
  };
  if (arm === ROOM_TRANSITION_ENGINE_408970_ARM_FREE) {
    if (slotLive) { out.wrapperFree = 1; out.zeroNeeded = 1; out.zeroOff = ownOff; out.hostCalls = 1; }
    return out;
  }
  if (arm !== ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC) return out;
  out.allocSize = roomTransitionEngineAnimstateAllocSize(newCount);
  out.memsetSize = roomTransitionEngineAnimstateMemsetSize(newCount);
  out.copyNeeded = roomTransitionEngine408970CopyNeeded(oldCount);
  out.copySize = out.copyNeeded !== 0 ? roomTransitionEngine408970CopySize(oldCount) : 0;
  if (slotLive) {
    out.releaseOld = 1;
    out.statsBlock = roomTransitionEngineAnimstateStatsBlock(statsHead);
    out.releasePtr = roomTransitionEngineAnimstateFreeBlockPtr(slotPtr);
    if (whichB !== 0) { out.zeroNeeded = 1; out.zeroOff = ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF; }
  }
  out.publishNeeded = 1; out.publishOff = ROOM_TRANSITION_ENGINE_408970_PUBLISH_OFF; out.publishValue = allocResult;
  out.hostCalls = 2 + out.copyNeeded + out.releaseOld;
  return out;
}

/**
 * Whole 0x00408970: four null-safe samples up front, arm A, arm B, then the
 * descriptor published LAST — with the V7 slot-8 double publish folded into
 * the final slot values exactly as the store order dictates.
 */
export function roomTransitionEngine408970Plan(input) {
  const oldData = (input.oldData ?? 0) >>> 0, newData = (input.newData ?? 0) >>> 0;
  const sample = (ptr, raw) => (ptr === 0 ? 0 : (raw | 0));
  const oldCountA = sample(oldData, input.oldCountARaw ?? 0);
  const newCountA = sample(newData, input.newCountARaw ?? 0);
  const oldCountB = sample(oldData, input.oldCountBRaw ?? 0);
  const newCountB = sample(newData, input.newCountBRaw ?? 0);
  const armA = roomTransitionEngine408970ArmPlan({ whichB: 0, oldCount: oldCountA >>> 0, newCount: newCountA >>> 0, slotPtr: input.slot08 ?? 0, statsHead: input.statsHead ?? 0, allocResult: input.allocAResult ?? 0 });
  const armB = roomTransitionEngine408970ArmPlan({ whichB: 1, oldCount: oldCountB >>> 0, newCount: newCountB >>> 0, slotPtr: input.slot0c ?? 0, statsHead: input.statsHead ?? 0, allocResult: input.allocBResult ?? 0 });
  let v08 = (input.slot08 ?? 0) >>> 0, v0c = (input.slot0c ?? 0) >>> 0, clobberedA = 0;
  if (armA.wrapperFree === 1) v08 = 0;
  else if (armA.publishNeeded === 1) v08 = (input.allocAResult ?? 0) >>> 0;
  if (armB.wrapperFree === 1) v0c = 0;
  else if (armB.publishNeeded === 1) {
    if (armB.zeroNeeded === 1) v0c = 0;
    clobberedA = v08; v08 = (input.allocBResult ?? 0) >>> 0;
  }
  return { oldCountA, newCountA, oldCountB, newCountB, armA, armB, final4: newData, final8: v08, finalC: v0c, clobberedA, storeArgLast: 1, hostCalls: armA.hostCalls + armB.hostCalls };
}

/** SEH pack: the recovered frame facts for either sibling. */
export function roomTransitionEngineAnimstateSehPack(which970) {
  const alt = (which970 >>> 0) !== 0;
  return {
    bodyVa: alt ? ROOM_TRANSITION_ENGINE_HOST_VA_408970 : ROOM_TRANSITION_ENGINE_HOST_VA_408830,
    handlerVa: alt ? ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408970 : ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408830,
    funcinfoVa: alt ? ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408970 : ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408830,
    magic: ROOM_TRANSITION_ENGINE_SEH_MAGIC,
    maxState: alt ? ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970 : ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830,
    tryBlocks: ROOM_TRANSITION_ENGINE_SEH_TRY_BLOCKS, ehFlags: ROOM_TRANSITION_ENGINE_SEH_EH_FLAGS,
    unwindActionVa: ROOM_TRANSITION_ENGINE_SEH_ACTION_VA, unwindToState: ROOM_TRANSITION_ENGINE_SEH_UNWIND_TO_STATE,
    terminateIatVa: ROOM_TRANSITION_ENGINE_IAT_VA_TERMINATE, dispatchVa: ROOM_TRANSITION_ENGINE_SEH_DISPATCH_VA,
    dispatchIatVa: ROOM_TRANSITION_ENGINE_IAT_VA_CXXHANDLER, cookieVa: ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA,
  };
}

/** Unwinding from any registered state terminates; -1 propagates. */
export function roomTransitionEngineAnimstateSehUnwindTerminates(state, which970) {
  const maxState = (which970 >>> 0) !== 0 ? ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970 : ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830;
  return ((state | 0) >= 0 && (state | 0) < maxState) ? 1 : 0;
}

/** The 0x007abe4c direct-call shape plus the receiver-chain layout proof. */
export function roomTransitionEngine7abe20408830CallPack() {
  return {
    calleeVa: ROOM_TRANSITION_ENGINE_HOST_VA_408830, receiverOff: ROOM_TRANSITION_ENGINE_ENTRY_98_OFF,
    arg: ROOM_TRANSITION_ENGINE_7ABE20_408830_ARG, pushVa: ROOM_TRANSITION_ENGINE_7ABE20_408830_PUSH_VA,
    callVa: ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA, viaA5d0ReceiverOff: ROOM_TRANSITION_ENGINE_ENTRY_78_OFF,
    anm2Off: ROOM_TRANSITION_ENGINE_ENTRY_48_OFF, animStateDelta: ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA,
    overlayStateDelta: ROOM_TRANSITION_ENGINE_ANIMSTATE_OVERLAY_DELTA,
  };
}

/** arg==0 site: with both buffers null the body is stores-only (no host). */
export function roomTransitionEngine7abe20408830PureComplete(bufA, bufB) {
  return (bufA >>> 0) === 0 && (bufB >>> 0) === 0 ? 1 : 0;
}

/* ==========================================================================
 * v10 — the composed FUN_007abe20 body, the missing Game store, the frame.
…
 * ========================================================================== */

export const ROOM_TRANSITION_ENGINE_82EE40_VA = 0x0082ee40;
export const ROOM_TRANSITION_ENGINE_82EE40_RET_VA = 0x0082f1bc;
export const ROOM_TRANSITION_ENGINE_82EE40_END_VA = 0x0082f1bf;
export const ROOM_TRANSITION_ENGINE_82EE40_SIZE = 0x37f;
export const ROOM_TRANSITION_ENGINE_82EE40_RET_BYTES = 0x14;
export const ROOM_TRANSITION_ENGINE_82EE40_ARGC = 5;
export const ROOM_TRANSITION_ENGINE_82EE40_ARG_ROOM_OFF = 8;
export const ROOM_TRANSITION_ENGINE_82EE40_ARG_SLOT_OFF = 0xc;
export const ROOM_TRANSITION_ENGINE_82EE40_ARG_ANIM_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_82EE40_ARG_PLAYER_OFF = 0x14;
export const ROOM_TRANSITION_ENGINE_82EE40_ARG_DIM_OFF = 0x18;
export const ROOM_TRANSITION_ENGINE_82EE40_SEH_HANDLER_VA = 0x00af85cd;
export const ROOM_TRANSITION_ENGINE_82EE40_SEH_PUSH_VA = 0x0082ee56;
export const ROOM_TRANSITION_ENGINE_82EE40_COOKIE_LOAD_VA = 0x0082ee68;
export const ROOM_TRANSITION_ENGINE_HOST_VA_COOKIE_CHECK = 0x00aef12b;
export const ROOM_TRANSITION_ENGINE_82EE40_COOKIE_CHECK_VA = 0x0082f1b1;
export const ROOM_TRANSITION_ENGINE_82EE40_CALL_SITES = 12;
export const ROOM_TRANSITION_ENGINE_82EE40_CALLEES = 11;
export const ROOM_TRANSITION_ENGINE_82EE40_DIRECT_CALL_SITES = 11;
export const ROOM_TRANSITION_ENGINE_82EE40_INDIRECT_CALL_SITES = 1;
export const ROOM_TRANSITION_ENGINE_IAT_VA_INVALID_PARAM = 0x00b18894;
export const ROOM_TRANSITION_ENGINE_82EE40_INVALID_PARAM_CALL_VA = 0x0082ef4f;
export const ROOM_TRANSITION_ENGINE_SETUP_STORE_COUNT = 9;
export const ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS = 0;
export const ROOM_TRANSITION_ENGINE_SETUP_TARGET_GAME = 1;
export const ROOM_TRANSITION_ENGINE_GAME_PLAYER_ARG_OFF = 0x1bb74;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_14 = 0x0082efae;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_4 = 0x0082efb4;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_1C = 0x0082efbb;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_10 = 0x0082efbe;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_238 = 0x0082efc1;
export const ROOM_TRANSITION_ENGINE_STORE_VA_GAME_1BB74 = 0x0082efcb;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_20 = 0x0082efd7;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_24 = 0x0082efde;
export const ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_18 = 0x0082efef;
export const ROOM_TRANSITION_ENGINE_7ABE20_VA = 0x007abe20;
export const ROOM_TRANSITION_ENGINE_7ABE20_END_VA = 0x007abe86;
export const ROOM_TRANSITION_ENGINE_7ABE20_SIZE = 0x66;
export const ROOM_TRANSITION_ENGINE_7ABE20_RET_BYTES = 4;
export const ROOM_TRANSITION_ENGINE_7ABE20_CALL_SITES = 4;
export const ROOM_TRANSITION_ENGINE_7ABE20_BODY_STEPS = 9;
export const ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF = 0x41c;
export const ROOM_TRANSITION_ENGINE_7ABE20_407F10_CALL_VA = 0x007abe35;
export const ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2_PUSH_VA = 0x007abe51;
export const ROOM_TRANSITION_ENGINE_7ABE20_NEEDLE_PUSH_VA = 0x007abe53;
export const ROOM_TRANSITION_ENGINE_7ABE20_AL_GATE_VA = 0x007abe5e;
export const ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_RECV_VA = 0x007abe62;
export const ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_CALL_VA = 0x007abe65;
export const ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE = 0;
export const ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL = 1;
export const ROOM_TRANSITION_ENGINE_OWNER_THIS = 0;
export const ROOM_TRANSITION_ENGINE_OWNER_ANM2 = 1;
export const ROOM_TRANSITION_ENGINE_OWNER_PURE = 2;

const u32 = (v) => v >>> 0;
const add32 = (a, b) => (((a >>> 0) + (b >>> 0)) & 0xffffffff) >>> 0;

/* ---- recorded instruction list: the setup block 0x0082efae..0x0082efef ----
 * Nine consecutive stores; the sixth targets EDX (the Game pointer reloaded
…
 */
const RTE_SETUP_INSNS = [];

/** N7 — the complete setup store block, Game write included, PE order. */
export function roomTransitionEngine82ee40SetupStorePlan(
  room,
  slot,
  anim,
  effectiveDim,
  playerArg,
) {
  return { stores: [
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x14, value: room >>> 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_14 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x04, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_4 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x1c, value: anim >>> 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_1C },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x10, value: slot >>> 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_10 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x238, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_238 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_GAME, offset: ROOM_TRANSITION_ENGINE_GAME_PLAYER_ARG_OFF, value: playerArg >>> 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_GAME_1BB74 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x20, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_20 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x24, value: 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_24 },
    { target: ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS, offset: 0x18, value: effectiveDim >>> 0, peVa: ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_18 },
  ]};
}

/** N8 — the frame of 0x0082ee40 (aligned-stack thunk, SEH, cookie, calls). */
export function roomTransitionEngine82ee40FramePack() {
  return {
    bodyVa: ROOM_TRANSITION_ENGINE_82EE40_VA, retVa: ROOM_TRANSITION_ENGINE_82EE40_RET_VA,
    endVa: ROOM_TRANSITION_ENGINE_82EE40_END_VA, size: ROOM_TRANSITION_ENGINE_82EE40_SIZE,
    retBytes: ROOM_TRANSITION_ENGINE_82EE40_RET_BYTES, argc: ROOM_TRANSITION_ENGINE_82EE40_ARGC,
    argRoomOff: ROOM_TRANSITION_ENGINE_82EE40_ARG_ROOM_OFF, argSlotOff: ROOM_TRANSITION_ENGINE_82EE40_ARG_SLOT_OFF,
    argAnimOff: ROOM_TRANSITION_ENGINE_82EE40_ARG_ANIM_OFF, argPlayerOff: ROOM_TRANSITION_ENGINE_82EE40_ARG_PLAYER_OFF,
    argDimOff: ROOM_TRANSITION_ENGINE_82EE40_ARG_DIM_OFF, sehHandlerVa: ROOM_TRANSITION_ENGINE_82EE40_SEH_HANDLER_VA,
    sehPushVa: ROOM_TRANSITION_ENGINE_82EE40_SEH_PUSH_VA, cookieVa: ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA,
    cookieCheckVa: ROOM_TRANSITION_ENGINE_82EE40_COOKIE_CHECK_VA, callSites: ROOM_TRANSITION_ENGINE_82EE40_CALL_SITES,
    callees: ROOM_TRANSITION_ENGINE_82EE40_CALLEES, directCallSites: ROOM_TRANSITION_ENGINE_82EE40_DIRECT_CALL_SITES,
    indirectCallSites: ROOM_TRANSITION_ENGINE_82EE40_INDIRECT_CALL_SITES, indirectIatVa: ROOM_TRANSITION_ENGINE_IAT_VA_INVALID_PARAM,
  };
}

/** N9b — the four `lea` receivers, 32-bit wrap, plus the computed alias. */
export function roomTransitionEngine7abe20Receivers(entryPtr) {
  const a5d0 = (entryPtr + ROOM_TRANSITION_ENGINE_ENTRY_48_OFF) >>> 0;
  const a5d0Match = (a5d0 + ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA) >>> 0;
  const rewind = (entryPtr + ROOM_TRANSITION_ENGINE_ENTRY_78_OFF) >>> 0;
  return {
    reset: (entryPtr + ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF) >>> 0,
    direct830: (entryPtr + ROOM_TRANSITION_ENGINE_ENTRY_98_OFF) >>> 0,
    a5d0, a5d0Match, rewind, alias: a5d0Match === rewind ? 1 : 0,
  };
}

/** N9a — the byte at 0x007abe5e also says the nested 0x00408830 already ran. */
export function roomTransitionEngine7abe20Nested830Needed(a5d0ResultByte) {
  return (a5d0ResultByte & 0xff) !== 0 ? 1 : 0;
}

/* ---- recorded instruction list: FUN_007abe20, 0x007abe20..0x007abe83 ----
 * Only the instructions with an observable effect are carried; the walker
 * below follows `je` exactly as the PE does, so the two AL-gated records are
 * skipped by CONTROL FLOW, not by a flag test copied from the C++.
 */
const RTE_7ABE20_INSNS = [];

/** N9 — the whole composed body, produced by walking the recorded trace. */
export function roomTransitionEngine7abe20BodyPlan(input) {
  const entryPtr = (input.entryPtr ?? 0) >>> 0;
  const a5d0ResultByte = (input.a5d0ResultByte ?? 0) >>> 0;
  const empty830 = { hostCalls: 0, final4: 0 };
  const directPresent = input.direct830 != null;
  const nestedPresent = input.nested830 != null;
  const direct = directPresent ? input.direct830 : empty830;
  const nested = nestedPresent ? input.nested830 : empty830;
  const resetHostCalls = (input.resetHostCalls ?? 0) | 0;
  const rewindHostCalls = (input.rewindHostCalls ?? 0) | 0;
  const matched = roomTransitionEngine7abe20Nested830Needed(a5d0ResultByte);
  const nested830HostCalls = matched !== 0 ? (nested.hostCalls | 0) : 0;
  const a5d0WarnHost = matched !== 0 ? 0 : 1;
  const a5d0HostCalls = a5d0WarnHost + nested830HostCalls;
  const effectiveRewindHost = matched !== 0 ? rewindHostCalls : 0;
  const step = (peVa, kind, offset, value, width, gated, ran, owner, hostCalls) => ({ peVa, kind, offset, value, width, gated, ran, owner, hostCalls });
  const STORE = ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE, CALL = ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL;
  const PURE = ROOM_TRANSITION_ENGINE_OWNER_PURE, ANM2 = ROOM_TRANSITION_ENGINE_OWNER_ANM2, THIS = ROOM_TRANSITION_ENGINE_OWNER_THIS;
  const steps = [
    step(0x007abe2e, STORE, ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF, 0, 1, 0, 1, PURE, 0),
    step(ROOM_TRANSITION_ENGINE_7ABE20_407F10_CALL_VA, CALL, ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF, ROOM_TRANSITION_ENGINE_HOST_VA_407F10, 0, 0, 1, ANM2, resetHostCalls >>> 0),
    step(ROOM_TRANSITION_ENGINE_STORE_VA_14C, STORE, ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF, 0x3f800000, 4, 0, 1, PURE, 0),
    step(ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA, CALL, ROOM_TRANSITION_ENGINE_ENTRY_98_OFF, ROOM_TRANSITION_ENGINE_HOST_VA_408830, 0, 0, 1, THIS, (direct.hostCalls | 0) >>> 0),
    step(ROOM_TRANSITION_ENGINE_7ABE20_A5D0_CALL_VA, CALL, ROOM_TRANSITION_ENGINE_ENTRY_48_OFF, ROOM_TRANSITION_ENGINE_HOST_VA_40A5D0, 0, 0, 1, THIS, a5d0HostCalls >>> 0),
    step(ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_CALL_VA, CALL, ROOM_TRANSITION_ENGINE_ENTRY_78_OFF, ROOM_TRANSITION_ENGINE_HOST_VA_40A1B0, 0, 1, matched >>> 0, ANM2, effectiveRewindHost >>> 0),
    step(ROOM_TRANSITION_ENGINE_STORE_VA_8C, STORE, ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF, 1, 1, 1, matched >>> 0, PURE, 0),
    step(ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL, STORE, ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF, 0, 1, 0, 1, PURE, 0),
    step(ROOM_TRANSITION_ENGINE_STORE_VA_1398, STORE, ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF, 1, 1, 0, 1, PURE, 0),
  ];
  const hostCalls = resetHostCalls + (direct.hostCalls | 0) + a5d0HostCalls + effectiveRewindHost;
  return {
    steps,
    rewindNeeded: roomTransitionEngine7abe20RewindNeeded(a5d0ResultByte),
    nested830Ran: matched, a5d0WarnHost, resetHostCalls,
    direct830HostCalls: direct.hostCalls | 0, nested830HostCalls, a5d0HostCalls,
    rewindHostCalls: effectiveRewindHost, hostCalls,
    pureComplete: hostCalls === 0 ? 1 : 0,
    directArgOk: (directPresent && ((direct.final4 >>> 0) === 0)) ? 1 : 0,
    nested830CalleeVa: roomTransitionEngine40a5d0MatchCallee(ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2),
    nested830Data: (matched !== 0 && nestedPresent) ? (nested.final4 >>> 0) : 0,
    receivers: roomTransitionEngine7abe20Receivers(entryPtr),
  };
}

/* ---------------------------------------------------------------------------
   v12 - FUN_0040a1b0 (exact-ZHL AnimationState::Rewind) body: three reset
…
   (AnimationState::Rewind, 25 pattern bytes) only. */
export const ROOM_TRANSITION_ENGINE_HOST_VA_408C90 = 0x00408c90;
export const ROOM_TRANSITION_ENGINE_408C90_END_VA = 0x00408cfc;
export const ROOM_TRANSITION_ENGINE_408C90_WARN_LEVEL = 0x10;
export const ROOM_TRANSITION_ENGINE_408C90_WARN_MSG_VA = 0x00b1a504;
export const ROOM_TRANSITION_ENGINE_408C90_WARN_ARGC = 2;
export const ROOM_TRANSITION_ENGINE_408C90_DATA_OFF = 4;
export const ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF = 0x2c;
export const ROOM_TRANSITION_ENGINE_408C90_PAIRS_OFF = 0x28;
export const ROOM_TRANSITION_ENGINE_408C90_PAIR_STRIDE = 8;
export const ROOM_TRANSITION_ENGINE_408C90_KEY_OFF = 0;
export const ROOM_TRANSITION_ENGINE_408C90_VAL_OFF = 4;
export const ROOM_TRANSITION_ENGINE_408C90_VA_DATA_LOAD = 0x00408c95;
export const ROOM_TRANSITION_ENGINE_408C90_VA_WARN = 0x00408c9e;
export const ROOM_TRANSITION_ENGINE_408C90_VA_REREAD = 0x00408caa;
export const ROOM_TRANSITION_ENGINE_408C90_VA_COUNT_GATE = 0x00408cb4;
export const ROOM_TRANSITION_ENGINE_408C90_VA_LOOP_TOP = 0x00408cc0;
export const ROOM_TRANSITION_ENGINE_408C90_VA_COMPARE = 0x00408ccc;
export const ROOM_TRANSITION_ENGINE_408C90_VA_SKIP = 0x00408cd3;
export const ROOM_TRANSITION_ENGINE_408C90_VA_STORE_F18 = 0x00408ce1;
export const ROOM_TRANSITION_ENGINE_408C90_VA_STORE_F1C = 0x00408cf0;
export const ROOM_TRANSITION_ENGINE_408C90_VA_LOOP_BACK = 0x00408cf7;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F10 = 0x0040a1b3;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F18 = 0x0040a1ba;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F1C = 0x0040a1c1;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_CALL_408C90 = 0x0040a1c8;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_A_GATE = 0x0040a1d2;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_A_TOP = 0x0040a1e0;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_B_GATE = 0x0040a1f5;
export const ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_B_TOP = 0x0040a200;
export const ROOM_TRANSITION_ENGINE_40A1B0_END_VA = 0x0040a214;
export const ROOM_TRANSITION_ENGINE_40A1B0_RESET_STORE_COUNT = 3;

/* ---------------------------------------------------------------------------
   v12 - FUN_0040a1b0 AnimationState::Rewind whole body + callee 0x00408c90.
…
   ------------------------------------------------------------------------- */

/**
 * The 0x00408c90 bitset loop. data = [this+4]; count = [data+0x2c];
…
 */
export function roomTransitionEngine408c90Plan(input) {
  const mem = input.mem, thisOff = input.thisOff >>> 0, thresholdBits = input.thresholdBits >>> 0;
  const f18In = (input.f18In ?? 0) >>> 0, f1cIn = (input.f1cIn ?? 0) >>> 0;
  const iterationLimit = input.iterationLimit === undefined ? -1 : (input.iterationLimit | 0);
  const load32 = (off) => (mem[off] | (mem[off + 1] << 8) | (mem[off + 2] << 16) | (mem[off + 3] << 24)) >>> 0;
  const out = { entered: 0, iterations: 0, f18: f18In, f1c: f1cIn, warnDataNull: 0, fault: 0, truncated: 0 };
  let data = load32(thisOff + ROOM_TRANSITION_ENGINE_408C90_DATA_OFF);
  if (data === 0) {
    out.warnDataNull = 1;
    data = load32(thisOff + ROOM_TRANSITION_ENGINE_408C90_DATA_OFF);
  }
  if (data === 0) { out.fault = 1; return out; }
  let count = load32(data + ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF);
  if (count === 0) return out;
  out.entered = 1;
  const threshold = bitsToF32(thresholdBits);
  let edx = 0;
  for (;;) {
    if (iterationLimit >= 0 && out.iterations >= iterationLimit) { out.truncated = 1; return out; }
    const base = load32(data + ROOM_TRANSITION_ENGINE_408C90_PAIRS_OFF);
    const val = load32(base + edx * 8 + ROOM_TRANSITION_ENGINE_408C90_VAL_OFF);
    const fv = Math.fround(val | 0);
    out.iterations += 1;
    if (!(fv === threshold)) {
      const key = load32(base + edx * 8 + ROOM_TRANSITION_ENGINE_408C90_KEY_OFF);
      out.f18 = (out.f18 | (1 << (key & 31))) >>> 0;
      out.f1c = (out.f1c | (1 << (key & 31))) >>> 0;
    }
    edx += 1;
    count = load32(data + ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF);
    if (!(edx < count)) break;
  }
  return out;
}

/** The two zero loops at 0x0040a1d2/0x0040a1f5 (counts [data+0x1c/+0x24],
 *  buffers [this+8/+0xc]; jbe gates are UNSIGNED, needs iff count != 0). */
export function roomTransitionEngine40a1b0ZeroPlan(input) {
  const mem = input.mem, thisOff = input.thisOff >>> 0;
  const load32 = (off) => (mem[off] | (mem[off + 1] << 8) | (mem[off + 2] << 16) | (mem[off + 3] << 24)) >>> 0;
  const out = { countA: 0, bufA: 0, needsA: 0, countB: 0, bufB: 0, needsB: 0 };
  const data = load32(thisOff + ROOM_TRANSITION_ENGINE_408C90_DATA_OFF);
  if (data === 0) return out;
  out.countA = load32(data + ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_A_OFF);
  out.bufA = load32(thisOff + ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF);
  out.needsA = out.countA !== 0 ? 1 : 0;
  out.countB = load32(data + ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_B_OFF);
  out.bufB = load32(thisOff + ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF);
  out.needsB = out.countB !== 0 ? 1 : 0;
  return out;
}

/** Whole 0x0040a1b0 body: three dword-zero stores (PE order, this-relative),
 *  then 0x00408c90 with threshold 0 / accumulators 0 (the stores just
 *  wrote them), then the zero loops. fault propagates (stores already
 *  happened); the zero plan is only valid when fault == 0. */
export function roomTransitionEngine40a1b0RewindPlan(input) {
  const stores = [
    { disp: ROOM_TRANSITION_ENGINE_ANIMSTATE_F10_OFF, width: 4, imm: 0, va: ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F10 },
    { disp: ROOM_TRANSITION_ENGINE_ANIMSTATE_F18_OFF, width: 4, imm: 0, va: ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F18 },
    { disp: ROOM_TRANSITION_ENGINE_ANIMSTATE_F1C_OFF, width: 4, imm: 0, va: ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F1C },
  ];
  const bits = roomTransitionEngine408c90Plan({ mem: input.mem, thisOff: input.thisOff, thresholdBits: 0, f18In: 0, f1cIn: 0, iterationLimit: input.iterationLimit });
  const out = {
    stores, entered: bits.entered, iterations: bits.iterations, f18: bits.f18, f1c: bits.f1c,
    warnDataNull: bits.warnDataNull, fault: bits.fault, truncated: bits.truncated,
    zero: { countA: 0, bufA: 0, needsA: 0, countB: 0, bufB: 0, needsB: 0 },
  };
  if (bits.fault !== 0) return out;
  out.zero = roomTransitionEngine40a1b0ZeroPlan({ mem: input.mem, thisOff: input.thisOff });
  return out;
}


/* v13 FUN_00956780 xorshift core. Map/TLS/log/Play stay host. [edi] never read. */

export const ROOM_TRANSITION_ENGINE_956780_VA = 0x00956780;
export const ROOM_TRANSITION_ENGINE_956780_END_VA = 0x00956885;
export const ROOM_TRANSITION_ENGINE_956780_SIZE = 0x105;
export const ROOM_TRANSITION_ENGINE_956780_CL_MASK = 0x1f;
export const ROOM_TRANSITION_ENGINE_956780_ID_COMMON = 0x25;
export const ROOM_TRANSITION_ENGINE_956780_ID_RARE = 0x12d;
export const ROOM_TRANSITION_ENGINE_956780_MAGIC = 0xcccccccd;
export const ROOM_TRANSITION_ENGINE_956780_MAGIC_SHIFT = 4;
export const ROOM_TRANSITION_ENGINE_956780_MAP_KEY = 7;
export const ROOM_TRANSITION_ENGINE_956780_MAP_OFF = 0x1bbd8;
export const ROOM_TRANSITION_ENGINE_956780_MODULUS = 0x14;
export const ROOM_TRANSITION_ENGINE_956780_NODE_BYTE_D_OFF = 0x0d;
export const ROOM_TRANSITION_ENGINE_956780_NODE_FIELD_10_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_956780_SEED_INIT = 0x69696969;
export const ROOM_TRANSITION_ENGINE_956780_SEED_VA = 0x00c5d2b0;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_A_VA = 0x00c5d2b4;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_B_VA = 0x00c5d2b8;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_C_VA = 0x00c5d2bc;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_VA = 0x00b1f54c;
export const ROOM_TRANSITION_ENGINE_956780_VA_BYTE_GATE = 0x009567d5;
export const ROOM_TRANSITION_ENGINE_956780_VA_GAME_GATE = 0x009567b0;
export const ROOM_TRANSITION_ENGINE_956780_VA_GAME_LOAD = 0x009567a9;
export const ROOM_TRANSITION_ENGINE_956780_VA_INT3 = 0x0095682f;
export const ROOM_TRANSITION_ENGINE_956780_VA_MAP_CALL = 0x009567cd;
export const ROOM_TRANSITION_ENGINE_956780_VA_SEED_LOAD = 0x0095680c;
export const ROOM_TRANSITION_ENGINE_956780_VA_SEED_REREAD = 0x00956822;
export const ROOM_TRANSITION_ENGINE_956780_VA_SEED_STORE = 0x0095685b;
export const ROOM_TRANSITION_ENGINE_956780_VA_SEED_TEST = 0x00956812;
export const ROOM_TRANSITION_ENGINE_956780_VA_SENTINEL_GATE = 0x009567e9;
export const ROOM_TRANSITION_ENGINE_956780_VA_SIGNED_GATE = 0x009567df;
export const ROOM_TRANSITION_ENGINE_956780_VA_STORE_12D = 0x0095686e;
export const ROOM_TRANSITION_ENGINE_956780_VA_STORE_25 = 0x00956806;
export const ROOM_TRANSITION_ENGINE_956780_VA_WARN = 0x0095681d;
export const ROOM_TRANSITION_ENGINE_956780_VA_XORSHIFT = 0x00956830;
export const ROOM_TRANSITION_ENGINE_956780_WARN_ARGC = 2;
export const ROOM_TRANSITION_ENGINE_956780_WARN_LEVEL = 0x10;
export const ROOM_TRANSITION_ENGINE_956780_WARN_MSG_VA = 0x00b6bf54;
export const ROOM_TRANSITION_ENGINE_HOST_VA_4288A0 = 0x004288a0;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_A = 2;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_B = 7;
export const ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_C = 7;

export function roomTransitionEngine956780Gate(game, nodeByteD, nodeField10, nodePtr, sentinel) {
  if ((game | 0) === 0) return 0;
  if ((nodeByteD & 0xff) !== 0) return 0;
  if ((nodeField10 | 0) > 7) return 0;
  if ((nodePtr >>> 0) === (sentinel >>> 0)) return 0;
  return 1;
}

export function roomTransitionEngine956780Xorshift(seed, shiftA, shiftB, shiftC) {
  let s = seed >>> 0;
  s = (s ^ (s >>> (shiftA & ROOM_TRANSITION_ENGINE_956780_CL_MASK))) >>> 0;
  s = (s ^ ((s << (shiftB & ROOM_TRANSITION_ENGINE_956780_CL_MASK)) >>> 0)) >>> 0;
  s = (s ^ (s >>> (shiftC & ROOM_TRANSITION_ENGINE_956780_CL_MASK))) >>> 0;
  return s;
}

export function roomTransitionEngine956780Mod20(value) {
  const n = value >>> 0;
  const hi = Number((BigInt(n) * BigInt(ROOM_TRANSITION_ENGINE_956780_MAGIC >>> 0)) >> 32n) >>> 0;
  const q = hi >>> ROOM_TRANSITION_ENGINE_956780_MAGIC_SHIFT;
  return (n - Math.imul(q, ROOM_TRANSITION_ENGINE_956780_MODULUS)) >>> 0;
}

export function roomTransitionEngine956780RemapId(remainder) {
  return ((remainder >>> 0) === 0)
    ? ROOM_TRANSITION_ENGINE_956780_ID_RARE
    : ROOM_TRANSITION_ENGINE_956780_ID_COMMON;
}

export function roomTransitionEngine956780Plan(input) {
  const game = input.game | 0;
  const nodeByteD = input.nodeByteD | 0;
  const nodeField10 = input.nodeField10 | 0;
  const nodePtr = input.nodePtr >>> 0;
  const sentinel = input.sentinel >>> 0;
  const idIn = (input.idIn ?? 0) | 0;
  const seed = (input.seed ?? 0) >>> 0;
  const seedReread = (input.seedReread ?? seed) >>> 0;
  const shiftA = (input.shiftA ?? 0) | 0;
  const shiftB = (input.shiftB ?? 0) | 0;
  const shiftC = (input.shiftC ?? 0) | 0;
  const ran = roomTransitionEngine956780Gate(game, nodeByteD, nodeField10, nodePtr, sentinel);
  if (ran === 0) {
    return {
      ran: 0, seedWarn: 0, seedFault: 0, seedAfter: seed, remainder: 0,
      idOut: idIn, store25: 0, store12d: 0,
    };
  }
  const out = {
    ran: 1, seedWarn: 0, seedFault: 0, seedAfter: seed, remainder: 0,
    idOut: ROOM_TRANSITION_ENGINE_956780_ID_COMMON, store25: 1, store12d: 0,
  };
  let live = seed;
  if (live === 0) {
    out.seedWarn = 1;
    live = seedReread;
    if (live === 0) {
      out.seedFault = 1;
      out.seedAfter = 0;
      return out;
    }
  }
  const shifted = roomTransitionEngine956780Xorshift(live, shiftA, shiftB, shiftC);
  out.seedAfter = shifted;
  out.remainder = roomTransitionEngine956780Mod20(shifted);
  if (out.remainder === 0) {
    out.store12d = 1;
    out.idOut = ROOM_TRANSITION_ENGINE_956780_ID_RARE;
  }
  return out;
}

/* ==========================================================================
   v14 - FUN_004288a0 sorted-map lower-bound walk (FULLY PURE, ret 8).
   Called from 0x9567cd (the v13 SFX-prep) with this = Game+0x1bbd8 and
   key = 7. Transcribed branch-by-branch from the instruction stream
   0x4288a0..0x4288e8; 204 direct E8 callers image-wide - a shared map
   primitive (PM/room/hud families only reference the VA as host).
   root = [this]; node = [root+4]; walk while byte [node+0xd] == 0:
   SIGNED [node+0x10] >= key -> out[8]=node, flag=1, node=[node+0];
   < key -> flag=0, node=[node+8]. out[0] = last examined node,
   out[4] = last branch flag, out[8] = last >= node else root.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_4288A0_VA = 0x004288a0;
export const ROOM_TRANSITION_ENGINE_4288A0_END_VA = 0x004288e8;
export const ROOM_TRANSITION_ENGINE_4288A0_RET_BYTES = 8;
export const ROOM_TRANSITION_ENGINE_4288A0_ROOT_NODE_OFF = 4;
export const ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_GE_OFF = 0;
export const ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_LT_OFF = 8;
export const ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF = 0x0d;
export const ROOM_TRANSITION_ENGINE_4288A0_NODE_FIELD_10_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_FIRST_LOAD = 0x004288a3;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_BYTE_GATE = 0x004288b7;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_LOOP_TOP = 0x004288c3;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_COMPARE = 0x004288c5;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_GE_BRANCH = 0x004288c8;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_GE_STORE = 0x004288d1;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_FLAG_STORE = 0x004288db;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_LOOP_GATE = 0x004288de;
export const ROOM_TRANSITION_ENGINE_4288A0_VA_END = 0x004288e5;

/* ==========================================================================
   v15 - FUN_004288f0 / FUN_00428910 map-result getters (FULLY PURE, ret 4).
   Two 12-byte bodies right after the v14 walk; 40 / 50 direct E8 callers
   image-wide (entity/room band), none on the engine's own edge path.
   thiscall, one stack arg `out` (the 4288a0 walk triple), zero calls /
   branches / byte gates - plain dword copies:
     0x4288f0: [this+0x33c]=out[0] / [this+0x340]=out[4] (VA 0x4288f6..0x428908)
     0x428910: [this+0x360]=out[0] / [this+0x364]=out[4] (VA 0x428916..0x428928)
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF = 0;
export const ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF = 4;
export const ROOM_TRANSITION_ENGINE_4288F0_VA = 0x004288f0;
export const ROOM_TRANSITION_ENGINE_4288F0_END_VA = 0x00428908;
export const ROOM_TRANSITION_ENGINE_4288F0_RET_BYTES = 4;
export const ROOM_TRANSITION_ENGINE_4288F0_DST_0_OFF = 0x33c;
export const ROOM_TRANSITION_ENGINE_4288F0_DST_4_OFF = 0x340;
export const ROOM_TRANSITION_ENGINE_4288F0_VA_FIRST_LOAD = 0x004288f6;
export const ROOM_TRANSITION_ENGINE_4288F0_VA_STORE_0 = 0x004288f8;
export const ROOM_TRANSITION_ENGINE_4288F0_VA_STORE_4 = 0x00428901;
export const ROOM_TRANSITION_ENGINE_428910_VA = 0x00428910;
export const ROOM_TRANSITION_ENGINE_428910_END_VA = 0x00428928;
export const ROOM_TRANSITION_ENGINE_428910_RET_BYTES = 4;
export const ROOM_TRANSITION_ENGINE_428910_DST_0_OFF = 0x360;
export const ROOM_TRANSITION_ENGINE_428910_DST_4_OFF = 0x364;
export const ROOM_TRANSITION_ENGINE_428910_VA_FIRST_LOAD = 0x00428916;
export const ROOM_TRANSITION_ENGINE_428910_VA_STORE_0 = 0x00428918;
export const ROOM_TRANSITION_ENGINE_428910_VA_STORE_4 = 0x00428921;

/** 0x4288f0 map-result getter: the dwords the machine stores to
 *  receiver+0x33c / receiver+0x340 (out[0] / out[4] of the walk triple). */
export function roomTransitionEngine4288f0Copy(input) {
  const mem = input.mem;
  const outOff = input.outOff >>> 0;
  return {
    node0: rte4288a0Load32(mem, (outOff + ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF) >>> 0) >>> 0,
    flag4: rte4288a0Load32(mem, (outOff + ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF) >>> 0) >>> 0,
  };
}

/** 0x428910 map-result getter: the dwords the machine stores to
 *  receiver+0x360 / receiver+0x364 (out[0] / out[4] of the walk triple). */
export function roomTransitionEngine428910Copy(input) {
  const mem = input.mem;
  const outOff = input.outOff >>> 0;
  return {
    node0: rte4288a0Load32(mem, (outOff + ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF) >>> 0) >>> 0,
    flag4: rte4288a0Load32(mem, (outOff + ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF) >>> 0) >>> 0,
  };
}

const rte4288a0Load32 = (mem, off) =>
  (mem[off] | (mem[off + 1] << 8) | (mem[off + 2] << 16) | (mem[off + 3] << 24)) >>>
  0;

/** Whole 0x004288a0 walk. `mem` is a buffer viewed at offset 0; every pointer
 *  (root, node, next) is an offset into it, exactly like the v12 mem plans.
 *  thisOff points at the receiver; [thisOff] = root, [root+4] = first node. */
export function roomTransitionEngine4288a0Lookup(input) {
  const mem = input.mem;
  const thisOff = input.thisOff >>> 0;
  const key = input.key | 0;
  const iterationLimit =
    input.iterationLimit === undefined ? -1 : input.iterationLimit | 0;
  const out = {
    node0: 0, flag4: 0, node8: 0, root: 0,
    entered: 0, iterations: 0, truncated: 0,
  };
  const root = rte4288a0Load32(mem, thisOff);
  let node = rte4288a0Load32(
    mem, (root + ROOM_TRANSITION_ENGINE_4288A0_ROOT_NODE_OFF) >>> 0);
  out.node0 = node;
  out.flag4 = 0;
  out.node8 = root;
  out.root = root;
  if ((mem[(node + ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF) >>> 0] & 0xff) !== 0) {
    return out; /* 0x4288bb jne end: first node terminates the walk */
  }
  out.entered = 1;
  for (;;) {
    if (iterationLimit >= 0 && out.iterations >= iterationLimit) {
      out.truncated = 1;
      return out;
    }
    out.node0 = node; /* 0x4288c3 mov [edx],eax */
    const field10 = rte4288a0Load32(
      mem, (node + ROOM_TRANSITION_ENGINE_4288A0_NODE_FIELD_10_OFF) >>> 0);
    if ((field10 | 0) >= key) { /* 0x4288c8 jge SIGNED */
      out.node8 = node; /* 0x4288d1 mov [edx+8],eax BEFORE the move */
      out.flag4 = 1;
      node = rte4288a0Load32(
        mem, (node + ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_GE_OFF) >>> 0);
    } else {
      out.flag4 = 0;
      node = rte4288a0Load32(
        mem, (node + ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_LT_OFF) >>> 0);
    }
    out.iterations += 1;
    if ((mem[(node + ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF) >>> 0] & 0xff) !== 0) {
      return out; /* 0x4288de cmp byte / 0x4288e2 je LOOP: nonzero exits */
    }
  }
}

/* ==========================================================================
   v16 - FUN_00428940 xorshift128+-style RNG core (ret 4) + FUN_00428a80
   bit setter/clearer (ret 8). 48 / 10 direct E8 callers image-wide, both
   address-stable (identify-zhl empty). 0x428940: state = 4 dword lanes
   (two 64-bit words, LE: word0 = lane1:lane0, word1 = lane3:lane2);
   lane0 is xorshift32'd three times with byte-gated CL-masked counts from
   the other lanes, then once with the .rdata constants (11, 7, 12) at
   0xb1f7e0 (qword) / 0xb1f7e8 (dword); the four 0xa112c0 CRT assert walls
   only trap on zero and never alter the arithmetic (host edges, gated
   out). Receiver stores +0x58/+0x5c/+0x60/+0x64; state lane0 write-back
   = step60 (the final combine never stores back). 0x428a80: signed
   clamps index to [0, 25] (cmovle <= 0 / jge >= 25 -> 25), word = idx>>5,
   bit = idx & 0x1f, dword at this+0x1839c + word*4 |= / &= ~(1 << bit)
   by the flag byte (set iff (flag & 0xff) != 0); its 0x428ad0 call to
   0x42a030 (jae >= 0x1a UNSIGNED) is STATICALLY UNREACHABLE after the
   clamps - dead assert leftover, gated.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_428940_VA = 0x00428940;
export const ROOM_TRANSITION_ENGINE_428940_END_VA = 0x00428a4a;
export const ROOM_TRANSITION_ENGINE_428940_RET_BYTES = 4;
export const ROOM_TRANSITION_ENGINE_428940_STATE_LANE0_OFF = 0;
export const ROOM_TRANSITION_ENGINE_428940_STATE_LANE1_OFF = 4;
export const ROOM_TRANSITION_ENGINE_428940_STATE_LANE2_OFF = 8;
export const ROOM_TRANSITION_ENGINE_428940_STATE_LANE3_OFF = 0x0c;
export const ROOM_TRANSITION_ENGINE_428940_DST_58_OFF = 0x58;
export const ROOM_TRANSITION_ENGINE_428940_DST_5C_OFF = 0x5c;
export const ROOM_TRANSITION_ENGINE_428940_DST_60_OFF = 0x60;
export const ROOM_TRANSITION_ENGINE_428940_DST_64_OFF = 0x64;
export const ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_VA = 0x00b1f7e0;
export const ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST2_VA = 0x00b1f7e8;
export const ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_0 = 0x0b;
export const ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_1 = 7;
export const ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_2 = 0x0c;
export const ROOM_TRANSITION_ENGINE_428940_CL_MASK = 0x1f;
export const ROOM_TRANSITION_ENGINE_428940_VA_FIRST_LOAD = 0x0042894e;
export const ROOM_TRANSITION_ENGINE_428940_VA_CORE_1 = 0x0042896a;
export const ROOM_TRANSITION_ENGINE_428940_VA_CORE_2 = 0x004289a6;
export const ROOM_TRANSITION_ENGINE_428940_VA_CORE_3 = 0x004289e2;
export const ROOM_TRANSITION_ENGINE_428940_VA_FINAL = 0x00428a27;
export const ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_1 = 0x00428985;
export const ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_2 = 0x004289c1;
export const ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_3 = 0x00428a0a;
export const ROOM_TRANSITION_ENGINE_428940_VA_STORE_58 = 0x00428987;
export const ROOM_TRANSITION_ENGINE_428940_VA_STORE_5C = 0x004289c3;
export const ROOM_TRANSITION_ENGINE_428940_VA_STORE_60 = 0x00428a12;
export const ROOM_TRANSITION_ENGINE_428940_VA_STORE_64 = 0x00428a43;
export const ROOM_TRANSITION_ENGINE_428940_VA_WALL_1 = 0x00428950;
export const ROOM_TRANSITION_ENGINE_428940_VA_WALL_2 = 0x0042898c;
export const ROOM_TRANSITION_ENGINE_428940_VA_WALL_3 = 0x004289c8;
export const ROOM_TRANSITION_ENGINE_428940_VA_WALL_4 = 0x00428a15;
export const ROOM_TRANSITION_ENGINE_428940_WALL_ARGC = 2;
export const ROOM_TRANSITION_ENGINE_428940_WALL_LEVEL = 0x10;
export const ROOM_TRANSITION_ENGINE_428940_WALL_MSG_VA = 0x00b6bf54;

export const ROOM_TRANSITION_ENGINE_428A80_VA = 0x00428a80;
export const ROOM_TRANSITION_ENGINE_428A80_END_VA = 0x00428ad5;
export const ROOM_TRANSITION_ENGINE_428A80_RET_BYTES = 8;
export const ROOM_TRANSITION_ENGINE_428A80_BITS_BASE_OFF = 0x1839c;
export const ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX = 0x19;
export const ROOM_TRANSITION_ENGINE_428A80_BIT_COUNT = 0x1a;
export const ROOM_TRANSITION_ENGINE_428A80_WORD_SHIFT = 5;
export const ROOM_TRANSITION_ENGINE_428A80_BOUND_VA = 0x0042a030;
export const ROOM_TRANSITION_ENGINE_428A80_VA_CMOVE = 0x00428a90;
export const ROOM_TRANSITION_ENGINE_428A80_VA_CLAMP_GE = 0x00428a93;
export const ROOM_TRANSITION_ENGINE_428A80_VA_BOUND_EDGE = 0x00428a9b;
export const ROOM_TRANSITION_ENGINE_428A80_VA_SHR_WORD = 0x00428aa9;
export const ROOM_TRANSITION_ENGINE_428A80_VA_BIT_MASK = 0x00428aa6;
export const ROOM_TRANSITION_ENGINE_428A80_VA_SLOT_LEA = 0x00428aac;
export const ROOM_TRANSITION_ENGINE_428A80_VA_FLAG_GATE = 0x00428ab6;
export const ROOM_TRANSITION_ENGINE_428A80_VA_SET_STORE = 0x00428ac0;
export const ROOM_TRANSITION_ENGINE_428A80_VA_CLEAR_STORE = 0x00428aca;
export const ROOM_TRANSITION_ENGINE_428A80_VA_BOUND_CALL = 0x00428ad0;

/** 0x428940 xorshift step: byte-gated counts (dword & 0xff, CL low byte),
 *  hardware 5-bit mask, uint32 wrap. */
export function roomTransitionEngine428940Xorshift(x, c1, c2, c3) {
  const mask = ROOM_TRANSITION_ENGINE_428940_CL_MASK;
  let s = x >>> 0;
  s = (s ^ (s >>> (((c1 >>> 0) & 0xff) & mask))) >>> 0;
  s = (s ^ ((s << (((c2 >>> 0) & 0xff) & mask)) >>> 0)) >>> 0;
  s = (s ^ (s >>> (((c3 >>> 0) & 0xff) & mask))) >>> 0;
  return s;
}

/** Whole 0x428940 core: the four receiver dwords + state lane0 write-back.
 *  `mem` is a buffer viewed at offset 0; stateOff points at the 16-byte
 *  state (two 64-bit words, LE dword lanes 0..3). */
export function roomTransitionEngine428940Plan(input) {
  const mem = input.mem;
  const stateOff = input.stateOff >>> 0;
  const lane0 = rte4288a0Load32(mem, (stateOff + ROOM_TRANSITION_ENGINE_428940_STATE_LANE0_OFF) >>> 0);
  const c1 = rte4288a0Load32(mem, (stateOff + ROOM_TRANSITION_ENGINE_428940_STATE_LANE1_OFF) >>> 0);
  const c2 = rte4288a0Load32(mem, (stateOff + ROOM_TRANSITION_ENGINE_428940_STATE_LANE2_OFF) >>> 0);
  const c3 = rte4288a0Load32(mem, (stateOff + ROOM_TRANSITION_ENGINE_428940_STATE_LANE3_OFF) >>> 0);
  const step58 = roomTransitionEngine428940Xorshift(lane0, c1, c2, c3);
  const step5c = roomTransitionEngine428940Xorshift(step58, c1, c2, c3);
  const step60 = roomTransitionEngine428940Xorshift(step5c, c1, c2, c3);
  const step64 = roomTransitionEngine428940Xorshift(
    step60,
    ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_0,
    ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_1,
    ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_2,
  );
  return {
    step58, step5c, step60, step64,
    state0After: step60, /* 0x428a0a mov [esi],edi; final never stores back */
  };
}

/** Whole 0x428a80 bit setter: clamped index, word/bit decomposition, mask,
 *  the dword stored at this+0x1839c + word*4, and the set flag. The
 *  0x42a030 bound edge (jae >= 0x1a) is statically unreachable after the
 *  clamps - never fires. */
export function roomTransitionEngine428a80BitPlan(input) {
  const mem = input.mem;
  const thisOff = input.thisOff >>> 0;
  let idx = input.index | 0;
  if (idx <= 0) idx = 0;
  else if (idx >= ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX) idx = ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX;
  const flag = input.flag >>> 0;
  const uidx = idx >>> 0;
  const word = uidx >>> ROOM_TRANSITION_ENGINE_428A80_WORD_SHIFT;
  const bit = uidx & 0x1f;
  const mask = 1 << bit;
  const slotOff = (thisOff + ROOM_TRANSITION_ENGINE_428A80_BITS_BASE_OFF + word * 4) >>> 0;
  let dword = rte4288a0Load32(mem, slotOff);
  let set = 0;
  if ((flag & 0xff) !== 0) {
    dword = (dword | mask) >>> 0;
    set = 1;
  } else {
    dword = (dword & ~mask) >>> 0;
  }
  return {
    indexClamped: idx, word, bit,
    mask: mask >>> 0, dwordAfter: dword, set,
  };
}

/* ==========================================================================
   v17 - FUN_00428a50 field getter (ret 0, thiscall, no stack args).
   46 direct E8 callers image-wide; address-stable (identify-zhl empty).
   `lea eax,[ecx+0x1258]; ret` (0x428a50..0x428a56) carries the effective
   address of the receiver's field at +0x1258 - the callers dereference
   the returned pointer (MSVC field-pointer getter). The law is exactly
   the u32-wrapping address add; no byte gates anywhere.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_428A50_VA = 0x00428a50;
export const ROOM_TRANSITION_ENGINE_428A50_END_VA = 0x00428a56;
export const ROOM_TRANSITION_ENGINE_428A50_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428A50_FIELD_OFF = 0x1258;
export const ROOM_TRANSITION_ENGINE_428A50_VA_LEA = 0x00428a50;
export const ROOM_TRANSITION_ENGINE_428A50_VA_RET = 0x00428a56;

/** 0x428a50 field getter: eax = ecx + 0x1258 (u32 wrap), the effective
 *  address of the receiver field the callers dereference. */
export function roomTransitionEngine428a50FieldGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return (thisOff + ROOM_TRANSITION_ENGINE_428A50_FIELD_OFF) >>> 0;
}

/* ==========================================================================
   v18 - FUN_00428a60 field getter + FUN_00428a70 value getter (ret 0,
   thiscall, no stack args) - the band-closing residue one-liners.
   0x428a60: 144 direct E8 callers image-wide; address-stable
   (identify-zhl empty). `lea eax,[ecx+0x1218]; ret` (0x428a60..0x428a66)
   carries the effective address of the receiver's field at +0x1218 - the
   callers dereference the returned pointer (same MSVC field-pointer
   getter pattern as v17). The law is exactly the u32-wrapping address
   add; no byte gates anywhere.
   0x428a70: 2 direct E8 callers image-wide (0x5c2a21 / 0x6ca2d9, both
   this-call the loaded dword as an object pointer); address-stable
   (identify-zhl empty). `mov eax,[ecx+0x11f8]; ret` (0x428a70..0x428a76)
   LOADS the receiver's u32 LE dword at +0x11f8 and returns the value -
   a mem-law read at the u32-wrapping offset add. No byte gates anywhere.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_428A60_VA = 0x00428a60;
export const ROOM_TRANSITION_ENGINE_428A60_END_VA = 0x00428a66;
export const ROOM_TRANSITION_ENGINE_428A60_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428A60_FIELD_OFF = 0x1218;
export const ROOM_TRANSITION_ENGINE_428A60_VA_LEA = 0x00428a60;
export const ROOM_TRANSITION_ENGINE_428A60_VA_RET = 0x00428a66;
export const ROOM_TRANSITION_ENGINE_428A70_VA = 0x00428a70;
export const ROOM_TRANSITION_ENGINE_428A70_END_VA = 0x00428a76;
export const ROOM_TRANSITION_ENGINE_428A70_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428A70_FIELD_OFF = 0x11f8;
export const ROOM_TRANSITION_ENGINE_428A70_VA_MOV = 0x00428a70;
export const ROOM_TRANSITION_ENGINE_428A70_VA_RET = 0x00428a76;

/** 0x428a60 field getter: eax = ecx + 0x1218 (u32 wrap), the effective
 *  address of the receiver field the callers dereference. */
export function roomTransitionEngine428a60FieldGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return (thisOff + ROOM_TRANSITION_ENGINE_428A60_FIELD_OFF) >>> 0;
}

/** 0x428a70 value getter: eax = u32 LE at mem + ecx + 0x11f8 (the offset
 *  add wraps u32); the loaded dword the callers this-call as a pointer. */
export function roomTransitionEngine428a70ValueGetter(input) {
  const thisOff = input.thisOff >>> 0;
  const off = (thisOff + ROOM_TRANSITION_ENGINE_428A70_FIELD_OFF) >>> 0;
  return rte4288a0Load32(input.mem, off);
}

/* ============================================================================
   v19 - band residue one-liners (ABI 18 -> 19): the nine unclaimed stubs
   around the closed 0x428940..0x428a80 band: 0x428930 lea field getter,
   0x428ae0 signed clamp-setter (ret 4), 0x428b10 dword value getter,
   0x428b50 / 0x428cd0 BSS-global field getters, 0x429550 signed GE-2
   byte check (157 callers), 0x429560 EQ-4 byte check, 0x429f20 .rdata
   float constant getter, 0x42a020 zero-store init. All address-stable
   (identify-zhl empty), zero calls/branches; the only stores are 428ae0's
   clamped dword and 42a020's zero at the constant offsets. The 0x428b50 /
   0x428cd0 machines load the BSS Game / Sfx pointers from [0xc71678] /
   [0xc7169c] (host-resolved, not file-backed constants) and add the field
   offset - the law is the u32-wrapping address add with the resolved base
   as this_off, exactly the v17/v18 lea shape. The 0x429550 / 0x429560
   compares are FULL-dword; setge is SIGNED, sete signedness-free. The
   0x429f20 machine loads the file-backed .rdata dword 0x3e4ccccd
   (float 0.2f) at 0xbaa198. No byte gates anywhere.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_428930_VA = 0x00428930;
export const ROOM_TRANSITION_ENGINE_428930_END_VA = 0x00428933;
export const ROOM_TRANSITION_ENGINE_428930_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428930_FIELD_OFF = 0x40;
export const ROOM_TRANSITION_ENGINE_428930_VA_LEA = 0x00428930;
export const ROOM_TRANSITION_ENGINE_428930_VA_RET = 0x00428933;
export const ROOM_TRANSITION_ENGINE_428AE0_VA = 0x00428ae0;
export const ROOM_TRANSITION_ENGINE_428AE0_END_VA = 0x00428aff;
export const ROOM_TRANSITION_ENGINE_428AE0_RET_BYTES = 4;
export const ROOM_TRANSITION_ENGINE_428AE0_FIELD_OFF = 0x18318;
export const ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN = -1;
export const ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX = 7;
export const ROOM_TRANSITION_ENGINE_428AE0_VA_CMOVLE = 0x00428aeb;
export const ROOM_TRANSITION_ENGINE_428AE0_VA_CMOVL = 0x00428af5;
export const ROOM_TRANSITION_ENGINE_428AE0_VA_STORE = 0x00428af8;
export const ROOM_TRANSITION_ENGINE_428AE0_VA_RET = 0x00428aff;
export const ROOM_TRANSITION_ENGINE_428B10_VA = 0x00428b10;
export const ROOM_TRANSITION_ENGINE_428B10_END_VA = 0x00428b16;
export const ROOM_TRANSITION_ENGINE_428B10_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428B10_FIELD_OFF = 0x1344;
export const ROOM_TRANSITION_ENGINE_428B10_VA_MOV = 0x00428b10;
export const ROOM_TRANSITION_ENGINE_428B10_VA_RET = 0x00428b16;
export const ROOM_TRANSITION_ENGINE_428B50_VA = 0x00428b50;
export const ROOM_TRANSITION_ENGINE_428B50_END_VA = 0x00428b5a;
export const ROOM_TRANSITION_ENGINE_428B50_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428B50_FIELD_OFF = 0x1ba78;
export const ROOM_TRANSITION_ENGINE_428B50_VA_GLOBAL_LOAD = 0x00428b50;
export const ROOM_TRANSITION_ENGINE_428B50_VA_ADD = 0x00428b55;
export const ROOM_TRANSITION_ENGINE_428B50_VA_RET = 0x00428b5a;
export const ROOM_TRANSITION_ENGINE_428CD0_VA = 0x00428cd0;
export const ROOM_TRANSITION_ENGINE_428CD0_END_VA = 0x00428cda;
export const ROOM_TRANSITION_ENGINE_428CD0_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_428CD0_FIELD_OFF = 0x29fbc;
export const ROOM_TRANSITION_ENGINE_428CD0_VA_GLOBAL_LOAD = 0x00428cd0;
export const ROOM_TRANSITION_ENGINE_428CD0_VA_ADD = 0x00428cd5;
export const ROOM_TRANSITION_ENGINE_428CD0_VA_RET = 0x00428cda;

/** 0x428930 field getter: eax = ecx + 0x40 (u32 wrap), the effective
 *  address of the receiver field the callers dereference. */
export function roomTransitionEngine428930FieldGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return (thisOff + ROOM_TRANSITION_ENGINE_428930_FIELD_OFF) >>> 0;
}

/** 0x428ae0 clamp-setter: eax = clamp_signed(value, -1, 7). Both clamp
 *  compares are SIGNED (cmovle low / cmovl high); the machine stores the
 *  clamped dword at [this+0x18318] (constant field offset) and returns it
 *  in eax. */
export function roomTransitionEngine428ae0ClampValue(value) {
  let v = value | 0;
  if (v <= ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN) {
    v = ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN;
  } else if (v >= ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX) {
    v = ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX;
  }
  return v;
}

/** 0x428b10 value getter: eax = u32 LE at mem + ecx + 0x1344 (the offset
 *  add wraps u32). Zero direct E8 callers; exposed as a Lua-registered
 *  callback (push 0x428b10 @0x8698cb). */
export function roomTransitionEngine428b10ValueGetter(input) {
  const thisOff = input.thisOff >>> 0;
  const off = (thisOff + ROOM_TRANSITION_ENGINE_428B10_FIELD_OFF) >>> 0;
  return rte4288a0Load32(input.mem, off);
}

/** 0x428b50 field getter: eax = [0xc71678] + 0x1ba78 (u32 wrap). The PE
 *  loads the BSS Game pointer from 0xc71678 (host-resolved); this_off IS
 *  that resolved value and the law is the address add (mem unused). */
export function roomTransitionEngine428b50FieldGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return (thisOff + ROOM_TRANSITION_ENGINE_428B50_FIELD_OFF) >>> 0;
}

/** 0x428cd0 field getter: eax = [0xc7169c] + 0x29fbc (u32 wrap). The PE
 *  loads the BSS Sfx global from 0xc7169c (host-resolved); this_off IS
 *  that resolved value and the law is the address add (mem unused). */
export function roomTransitionEngine428cd0FieldGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return (thisOff + ROOM_TRANSITION_ENGINE_428CD0_FIELD_OFF) >>> 0;
}

export const ROOM_TRANSITION_ENGINE_429550_VA = 0x00429550;
export const ROOM_TRANSITION_ENGINE_429550_END_VA = 0x00429556;
export const ROOM_TRANSITION_ENGINE_429550_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_429550_COMPARE_VALUE = 2;
export const ROOM_TRANSITION_ENGINE_429550_VA_CMP = 0x00429550;
export const ROOM_TRANSITION_ENGINE_429550_VA_SETGE = 0x00429553;
export const ROOM_TRANSITION_ENGINE_429550_VA_RET = 0x00429556;
export const ROOM_TRANSITION_ENGINE_429560_VA = 0x00429560;
export const ROOM_TRANSITION_ENGINE_429560_END_VA = 0x00429566;
export const ROOM_TRANSITION_ENGINE_429560_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_429560_COMPARE_VALUE = 4;
export const ROOM_TRANSITION_ENGINE_429560_VA_CMP = 0x00429560;
export const ROOM_TRANSITION_ENGINE_429560_VA_SETE = 0x00429563;
export const ROOM_TRANSITION_ENGINE_429560_VA_RET = 0x00429566;
export const ROOM_TRANSITION_ENGINE_429F20_VA = 0x00429f20;
export const ROOM_TRANSITION_ENGINE_429F20_END_VA = 0x00429f28;
export const ROOM_TRANSITION_ENGINE_429F20_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_429F20_CONST_VA = 0x00baa198;
export const ROOM_TRANSITION_ENGINE_429F20_CONST_BITS = 0x3e4ccccd;
export const ROOM_TRANSITION_ENGINE_429F20_VA_MOVSS = 0x00429f20;
export const ROOM_TRANSITION_ENGINE_429F20_VA_RET = 0x00429f28;
export const ROOM_TRANSITION_ENGINE_42A020_VA = 0x0042a020;
export const ROOM_TRANSITION_ENGINE_42A020_END_VA = 0x0042a028;
export const ROOM_TRANSITION_ENGINE_42A020_RET_BYTES = 0;
export const ROOM_TRANSITION_ENGINE_42A020_VA_ZERO_STORE = 0x0042a020;
export const ROOM_TRANSITION_ENGINE_42A020_VA_MOV_EAX = 0x0042a026;
export const ROOM_TRANSITION_ENGINE_42A020_VA_RET = 0x0042a028;

/** 0x429550 GE-2 check: the FULL-DWORD compare cmp dword [ecx],2 with a
 *  SIGNED setge (SF==OF) into al; the export returns the born-0/1 byte.
 *  157 direct E8 callers - the family's largest shared primitive. */
export function roomTransitionEngine429550Ge2Check(input) {
  const d = rte4288a0Load32(input.mem, input.thisOff >>> 0) | 0;
  return d >= ROOM_TRANSITION_ENGINE_429550_COMPARE_VALUE ? 1 : 0;
}

/** 0x429560 EQ-4 check: cmp dword [ecx],4 / sete al (ZF, signedness-free). */
export function roomTransitionEngine429560Eq4Check(input) {
  const d = rte4288a0Load32(input.mem, input.thisOff >>> 0) >>> 0;
  return d === ROOM_TRANSITION_ENGINE_429560_COMPARE_VALUE ? 1 : 0;
}

/** 0x429f20 constant getter: movss xmm0,[0xbaa198] loads the file-backed
 *  .rdata dword 0x3e4ccccd (float 0.2f); the export returns those bits. */
export function roomTransitionEngine429f20FloatConstant() {
  return ROOM_TRANSITION_ENGINE_429F20_CONST_BITS >>> 0;
}

/** 0x42a020 zero-store init: mov dword [ecx],0 / mov eax,ecx / ret. The
 *  machine stores 0 at [this+0] (host applies) and returns the receiver
 *  identity in eax; the export returns this_off (u32). */
export function roomTransitionEngine42a020ZeroStore(input) {
  return input.thisOff >>> 0;
}

/* ============================================================================
   v20 - the 0x42a030/0x42a040 bound handler census seam (ABI 19 -> 20).
   0x42a030 itself is the 5-byte noreturn bitset-position throw stub
   (push 0xb1c618 "invalid bitset position" / call [0xb18468], 19 direct
   E8 callers, host). The 342-insn body is FUN_0042a040..0x0042a1f8
   (ret 8), a sorted-map INSERT: it calls the family's own v14 walk
   0x4288a0 with (out triple @ [ebp-0x20], key ptr), then dispatches on
   the walk's last-GE node (out[8]) - the FOUND prefix 0x42a077..0x42a08c
   is PURE (byte gate node+0xd, SIGNED key-vs-field10 compare, out stores
   node/0); the bound path 0x42a0a4.. is host (uninitialized-map guard
   -> 0x4170d0, malloc 0xa0f4c0, node stores, RB-style rebalance with
   rotation calls 0x415f80/0x415fe0, out stores new node/1). Same
   node-byte-d / signed-field10 decision shape as the family's v13
   956780 gate and v14 walk.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42A040_VA = 0x0042a040;
export const ROOM_TRANSITION_ENGINE_42A040_END_VA = 0x0042a1f8;
export const ROOM_TRANSITION_ENGINE_42A040_RET_BYTES = 8;
export const ROOM_TRANSITION_ENGINE_42A030_VA = 0x0042a030;
export const ROOM_TRANSITION_ENGINE_42A030_THROW_PUSH_VA = 0x0042a030;
export const ROOM_TRANSITION_ENGINE_42A030_CALL_VA = 0x0042a035;
export const ROOM_TRANSITION_ENGINE_42A030_MSG_VA = 0x00b1c618;
export const ROOM_TRANSITION_ENGINE_42A030_SLOT_VA = 0x00b18468;
export const ROOM_TRANSITION_ENGINE_42A030_THROW_CALLERS = 19;
export const ROOM_TRANSITION_ENGINE_42A040_CALLERS = 1;
export const ROOM_TRANSITION_ENGINE_42A040_NODE_BYTE_D_OFF = 0x0d;
export const ROOM_TRANSITION_ENGINE_42A040_NODE_FIELD_10_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_42A040_OUT_NODE0_OFF = 0;
export const ROOM_TRANSITION_ENGINE_42A040_OUT_FLAG4_OFF = 4;
export const ROOM_TRANSITION_ENGINE_42A040_FOUND_FLAG = 0;
export const ROOM_TRANSITION_ENGINE_42A040_INSERT_FLAG = 1;
export const ROOM_TRANSITION_ENGINE_42A040_VA_NODE_LOAD = 0x0042a077;
export const ROOM_TRANSITION_ENGINE_42A040_VA_BYTE_GATE = 0x0042a07a;
export const ROOM_TRANSITION_ENGINE_42A040_VA_GATE_JUMP = 0x0042a07e;
export const ROOM_TRANSITION_ENGINE_42A040_VA_KEY_LOAD = 0x0042a080;
export const ROOM_TRANSITION_ENGINE_42A040_VA_GE_CMP = 0x0042a082;
export const ROOM_TRANSITION_ENGINE_42A040_VA_GE_JUMP = 0x0042a085;
export const ROOM_TRANSITION_ENGINE_42A040_VA_NODE_STORE = 0x0042a08a;
export const ROOM_TRANSITION_ENGINE_42A040_VA_FLAG_STORE = 0x0042a08c;
export const ROOM_TRANSITION_ENGINE_42A040_VA_BOUND_TOP = 0x0042a0a4;
export const ROOM_TRANSITION_ENGINE_42A040_VA_GUARD_CMP = 0x0042a0a4;
export const ROOM_TRANSITION_ENGINE_42A040_VA_GUARD_JUMP = 0x0042a0ab;
export const ROOM_TRANSITION_ENGINE_42A040_VA_INSERT_STORE = 0x0042a1e1;
export const ROOM_TRANSITION_ENGINE_42A040_VA_INSERT_FLAG = 0x0042a1e3;
export const ROOM_TRANSITION_ENGINE_42A040_FOUND_PREFIX_VA = 0x0042a077;
export const ROOM_TRANSITION_ENGINE_42A040_FOUND_PREFIX_END = 0x0042a08c;
export const ROOM_TRANSITION_ENGINE_HOST_VA_4170D0 = 0x004170d0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_A0F4C0 = 0x00a0f4c0;
export const ROOM_TRANSITION_ENGINE_HOST_VA_415F80 = 0x00415f80;
export const ROOM_TRANSITION_ENGINE_HOST_VA_415FE0 = 0x00415fe0;

/** 0x42a07a byte gate: `cmp byte [node+0xd],0 / jne bound`. The node is
 *  the walk's last-GE node (out[8] of the family v14 triple); found
 *  requires the byte at +0xd to be zero. WIDE input masked &0xff (family
 *  byte-gate convention). */
export function roomTransitionEngine42a040FoundGate(nodeByteD) {
  return (nodeByteD & 0xff) === 0 ? 1 : 0;
}

/** 0x42a082 SIGNED compare: `cmp eax,[node+0x10] / jl bound`. eax = the
 *  key dword; jl is SIGNED, so found requires key >= field10 as int32. */
export function roomTransitionEngine42a040KeyGeField10(key, nodeField10) {
  return (key | 0) >= (nodeField10 | 0) ? 1 : 0;
}

/** Fused bound-dispatch (FOUND prefix 0x42a077..0x42a08c): found iff the
 *  byte gate holds AND the signed key compare holds; outFlag is the byte
 *  the machine stores at out[4] (0 found / 1 insert); outNode is the node
 *  the machine stores at out[0] on the found path (the walk's last-GE
 *  node pass-through) and 0 on insert (the machine stores the host's new
 *  node instead - host-owned). */
export function roomTransitionEngine42a040BoundDecision(input) {
  const nodeByteD = (input.nodeByteD ?? 0) >>> 0;
  const nodeField10 = (input.nodeField10 ?? 0) | 0;
  const key = (input.key ?? 0) | 0;
  const node = (input.node ?? 0) >>> 0;
  const found =
    roomTransitionEngine42a040FoundGate(nodeByteD) !== 0 &&
    roomTransitionEngine42a040KeyGeField10(key, nodeField10) !== 0;
  return {
    found: found ? 1 : 0,
    outFlag: found ? ROOM_TRANSITION_ENGINE_42A040_FOUND_FLAG : ROOM_TRANSITION_ENGINE_42A040_INSERT_FLAG,
    outNode: found ? node : 0,
  };
}

/* ============================================================================
   v21 - POST: the first post-band cluster (ABI 20 -> 21). Three FULLY PURE
   one-liners immediately after the v20 end 0x42a1f8, all thiscall plain-ret,
   identify-zhl empty, zero claims: 0x42a250 eq-3 byte check (11 direct E8
   callers; sete is ZF-based signedness-free), 0x42a260 dword value getter
   at +0x3bc (23 callers; the v18 0x428a70 shape), 0x42a270 chained fallback
   getter [this+4] -> +0x10 -> +0x48 with null->1 (13 callers). The run's
   HOST-adjacent neighbours (0x42a210/0x42a230 free wrappers E8 0xaef15c,
   0x42a2d0 log-guarded getter E8 0xa112c0, bounded index getter 0x42a2f0)
   stay unlanded. ZERO byte gates anywhere.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42A250_VA = 0x0042a250;
export const ROOM_TRANSITION_ENGINE_42A250_VA_RET = 0x0042a257;
export const ROOM_TRANSITION_ENGINE_42A250_BODY_BYTES = 8;
export const ROOM_TRANSITION_ENGINE_42A250_CALLSITE_COUNT = 11;
export const ROOM_TRANSITION_ENGINE_42A250_FIELD_28_OFF = 0x28;
export const ROOM_TRANSITION_ENGINE_42A250_CMP_IMM = 3;
export const ROOM_TRANSITION_ENGINE_42A260_VA = 0x0042a260;
export const ROOM_TRANSITION_ENGINE_42A260_VA_RET = 0x0042a266;
export const ROOM_TRANSITION_ENGINE_42A260_BODY_BYTES = 7;
export const ROOM_TRANSITION_ENGINE_42A260_CALLSITE_COUNT = 23;
export const ROOM_TRANSITION_ENGINE_42A260_FIELD_3BC_OFF = 0x3bc;
export const ROOM_TRANSITION_ENGINE_42A270_VA = 0x0042a270;
export const ROOM_TRANSITION_ENGINE_42A270_VA_RET = 0x0042a287;
export const ROOM_TRANSITION_ENGINE_42A270_BODY_BYTES = 24;
export const ROOM_TRANSITION_ENGINE_42A270_CALLSITE_COUNT = 13;
export const ROOM_TRANSITION_ENGINE_42A270_PTR_OFF = 0x4;
export const ROOM_TRANSITION_ENGINE_42A270_INNER_OFF = 0x10;
export const ROOM_TRANSITION_ENGINE_42A270_VALUE_OFF = 0x48;
export const ROOM_TRANSITION_ENGINE_42A270_FALLBACK = 1;

/** 0x42a250: cmp dword [ecx+0x28],3 / sete al — EQUALITY (ZF), exactly
 *  3 -> 1; signedness-free (no range compare exists). */
export function roomTransitionEngine42a250Eq3Check(field28) {
  return (field28 >>> 0) === ROOM_TRANSITION_ENGINE_42A250_CMP_IMM ? 1 : 0;
}

/** 0x42a260 value getter: eax = u32 LE at mem + ecx + 0x3bc (u32-wrapping
 *  offset add — the v18 0x428a70 shape). */
export function roomTransitionEngine42a260ValueGetter(input) {
  const thisOff = input.thisOff >>> 0;
  return rte4288a0Load32(
    input.mem, (thisOff + ROOM_TRANSITION_ENGINE_42A260_FIELD_3BC_OFF) >>> 0);
}

/** 0x42a270 chained fallback value: [this+4] -> +0x10 -> +0x48, either
 *  null hop returns 1 (u32 LE loads, u32-wrapping adds). */
export function roomTransitionEngine42a270ChainValue(input) {
  const thisOff = input.thisOff >>> 0;
  const chain = rte4288a0Load32(input.mem, (thisOff + ROOM_TRANSITION_ENGINE_42A270_PTR_OFF) >>> 0);
  if (chain === 0) return ROOM_TRANSITION_ENGINE_42A270_FALLBACK;
  const inner = rte4288a0Load32(input.mem, (chain + ROOM_TRANSITION_ENGINE_42A270_INNER_OFF) >>> 0);
  if (inner === 0) return ROOM_TRANSITION_ENGINE_42A270_FALLBACK;
  return rte4288a0Load32(input.mem, (inner + ROOM_TRANSITION_ENGINE_42A270_VALUE_OFF) >>> 0);
}

/** 0x42a270 fallback decision: 1 iff either je hop ran (either pointer
 *  is null); mirrors the two-value composition above. */
export function roomTransitionEngine42a270UsedFallback(input) {
  const thisOff = input.thisOff >>> 0;
  const chain = rte4288a0Load32(input.mem, (thisOff + ROOM_TRANSITION_ENGINE_42A270_PTR_OFF) >>> 0);
  if (chain === 0) return 1;
  return rte4288a0Load32(input.mem, (chain + ROOM_TRANSITION_ENGINE_42A270_INNER_OFF) >>> 0) === 0 ? 1 : 0;
}

/* ============================================================================
   v22 - POOL: six verify-open one-liners from the ready pool (ABI 21 -> 22),
   one law each. The seventh pool body 0x42a2f0 was DECLINED: EXACT ZHL
   Entity_Player::GetBatteryCharge(int slot) (EntityPlayer-family claim).
   All six landed bodies are FULLY PURE thiscall plain-ret; V22-D is a
   BYTE-width load (mov al) -> & 0xff explicit in-body (v9 rule); V22-A is
   an UNSIGNED bound (ja) modeled directly.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42A290_VA = 0x0042a290;
export const ROOM_TRANSITION_ENGINE_42A290_VA_RET = 0x0042a2b1;
export const ROOM_TRANSITION_ENGINE_42A290_BODY_BYTES = 34;
export const ROOM_TRANSITION_ENGINE_42A290_CALLSITE_COUNT = 1;
export const ROOM_TRANSITION_ENGINE_42A290_BOUND = 0x1bf;
export const ROOM_TRANSITION_ENGINE_42A290_ARRAY_BASE_OFF = 0x76c;
export const ROOM_TRANSITION_ENGINE_42A290_ELEM_SCALE = 4;
export const ROOM_TRANSITION_ENGINE_42A2C0_VA = 0x0042a2c0;
export const ROOM_TRANSITION_ENGINE_42A2C0_VA_RET = 0x0042a2c7;
export const ROOM_TRANSITION_ENGINE_42A2C0_BODY_BYTES = 8;
export const ROOM_TRANSITION_ENGINE_42A2C0_CALLSITE_COUNT = 4;
export const ROOM_TRANSITION_ENGINE_42A2C0_FIELD_4_OFF = 0x4;
export const ROOM_TRANSITION_ENGINE_42A310_VA = 0x0042a310;
export const ROOM_TRANSITION_ENGINE_42A310_VA_RET = 0x0042a316;
export const ROOM_TRANSITION_ENGINE_42A310_BODY_BYTES = 7;
export const ROOM_TRANSITION_ENGINE_42A310_CALLSITE_COUNT = 1;
export const ROOM_TRANSITION_ENGINE_42A310_FIELD_1340_OFF = 0x1340;
export const ROOM_TRANSITION_ENGINE_42A320_VA = 0x0042a320;
export const ROOM_TRANSITION_ENGINE_42A320_VA_RET = 0x0042a326;
export const ROOM_TRANSITION_ENGINE_42A320_BODY_BYTES = 7;
export const ROOM_TRANSITION_ENGINE_42A320_CALLSITE_COUNT = 9;
export const ROOM_TRANSITION_ENGINE_42A320_FIELD_20A9_OFF = 0x20a9;
export const ROOM_TRANSITION_ENGINE_42A320_BYTE_MASK = 0xff;
export const ROOM_TRANSITION_ENGINE_42A330_VA = 0x0042a330;
export const ROOM_TRANSITION_ENGINE_42A330_VA_RET = 0x0042a336;
export const ROOM_TRANSITION_ENGINE_42A330_BODY_BYTES = 7;
export const ROOM_TRANSITION_ENGINE_42A330_CALLSITE_COUNT = 63;
export const ROOM_TRANSITION_ENGINE_42A330_FIELD_1A740_OFF = 0x1a740;
export const ROOM_TRANSITION_ENGINE_42A340_VA = 0x0042a340;
export const ROOM_TRANSITION_ENGINE_42A340_VA_RET = 0x0042a346;
export const ROOM_TRANSITION_ENGINE_42A340_BODY_BYTES = 7;
export const ROOM_TRANSITION_ENGINE_42A340_CALLSITE_COUNT = 22;
export const ROOM_TRANSITION_ENGINE_42A340_FIELD_1BB84_OFF = 0x1bb84;

/** 0x42a290 bounded setter ACCEPT decision: ja is UNSIGNED above 0x1bf. */
export function roomTransitionEngine42a290Accepts(index) {
  return (index >>> 0) <= ROOM_TRANSITION_ENGINE_42A290_BOUND ? 1 : 0;
}

/** 0x42a2c0 null check: setne — 1 iff nonzero. */
export function roomTransitionEngine42a2c0NonNull(field4) {
  return (field4 >>> 0) !== 0 ? 1 : 0;
}

/** 0x42a310 value getter: u32 LE at this + 0x1340 (u32-wrapping add). */
export function roomTransitionEngine42a310ValueGetter(input) {
  return rte4288a0Load32(
    input.mem, ((input.thisOff >>> 0) + ROOM_TRANSITION_ENGINE_42A310_FIELD_1340_OFF) >>> 0);
}

/** 0x42a320 byte getter: BYTE-width load -> low byte only (v9 rule). */
export function roomTransitionEngine42a320ByteGetter(input) {
  return rte4288a0Load32(
    input.mem, ((input.thisOff >>> 0) + ROOM_TRANSITION_ENGINE_42A320_FIELD_20A9_OFF) >>> 0,
  ) & ROOM_TRANSITION_ENGINE_42A320_BYTE_MASK;
}

/** 0x42a330 field-pointer getter: u32-wrapping this + 0x1a740. */
export function roomTransitionEngine42a330FieldGetter(thisOff) {
  return ((thisOff >>> 0) + ROOM_TRANSITION_ENGINE_42A330_FIELD_1A740_OFF) >>> 0;
}

/** 0x42a340 field-pointer getter: u32-wrapping this + 0x1bb84. */
export function roomTransitionEngine42a340FieldGetter(thisOff) {
  return ((thisOff >>> 0) + ROOM_TRANSITION_ENGINE_42A340_FIELD_1BB84_OFF) >>> 0;
}

/* ============================================================================
   v23 - 0x0042b020 multi-table switch classifier (797 B, FULLY PURE). One
   law: contains(arg) — whole-body composition over BOTH pinned byte tables.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42B020_VA = 0x0042b020;
export const ROOM_TRANSITION_ENGINE_42B020_VA_TRUE = 0x0042b061;
export const ROOM_TRANSITION_ENGINE_42B020_VA_FALSE = 0x0042b067;
export const ROOM_TRANSITION_ENGINE_42B020_EQ_IMM = 0xe8;
export const ROOM_TRANSITION_ENGINE_42B020_LOW_REBIAS = 0xb;
export const ROOM_TRANSITION_ENGINE_42B020_LOW_BOUND = 0xcc;
export const ROOM_TRANSITION_ENGINE_42B020_LOW_TABLE_VA = 0x0042b078;
export const ROOM_TRANSITION_ENGINE_42B020_HIGH_REBIAS = 234;
export const ROOM_TRANSITION_ENGINE_42B020_HIGH_BOUND = 0x1eb;
export const ROOM_TRANSITION_ENGINE_42B020_HIGH_TABLE_VA = 0x0042b150;
export const ROOM_TRANSITION_ENGINE_42B020_LOW_TABLE_BYTES = 205;
export const ROOM_TRANSITION_ENGINE_42B020_HIGH_TABLE_BYTES = 492;
export const ROOM_TRANSITION_ENGINE_42B020_BODY_END_VA = 0x0042b33d;

export const ROOM_TRANSITION_ENGINE_42B020_BYTE_TABLE1 = [
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
  1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1,
  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
  0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0,
];
export const ROOM_TRANSITION_ENGINE_42B020_BYTE_TABLE2 = [
  0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1,
  0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
  1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1,
  1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0,
  0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
  0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
  1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1,
  0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0,
  1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0,
  0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0,
  1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1,
  1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
  1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1,
  0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0,
  1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1,
  1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1,
  0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0,
];

/** 0x42b020 whole-body law: bool decision for arbitrary int32 input. */
export function roomTransitionEngine42b020Contains(arg) {
  const a = arg | 0;
  if (a === ROOM_TRANSITION_ENGINE_42B020_EQ_IMM) return 1;
  let idx;
  let table;
  if (a > ROOM_TRANSITION_ENGINE_42B020_EQ_IMM) {
    idx = ((a >>> 0) - 234) >>> 0;
    if (idx > ROOM_TRANSITION_ENGINE_42B020_HIGH_BOUND) return 0;
    table = ROOM_TRANSITION_ENGINE_42B020_BYTE_TABLE2;
  } else {
    idx = ((a >>> 0) - 11) >>> 0;
    if (idx > ROOM_TRANSITION_ENGINE_42B020_LOW_BOUND) return 0;
    table = ROOM_TRANSITION_ENGINE_42B020_BYTE_TABLE1;
  }
  return table[idx] === 0 ? 1 : 0;
}

/* ============================================================================
   v24 - PAIR: sibling switch classifiers 0x42b340 (186-entry table, rebias
   3, bound 0xb9) + 0x42b430 (24-entry table, rebias 0x13, bound 0x17).
   Both FULLY PURE cdecl plain-ret bool-in-al.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42B340_VA = 0x0042b340;
export const ROOM_TRANSITION_ENGINE_42B340_VA_TRUE = 0x0042b35e;
export const ROOM_TRANSITION_ENGINE_42B340_VA_FALSE = 0x0042b364;
export const ROOM_TRANSITION_ENGINE_42B340_REBIAS = 3;
export const ROOM_TRANSITION_ENGINE_42B340_BOUND = 0xb9;
export const ROOM_TRANSITION_ENGINE_42B340_BYTE_TABLE_VA = 0x0042b374;
export const ROOM_TRANSITION_ENGINE_42B340_DWORD_TABLE_VA = 0x0042b36c;
export const ROOM_TRANSITION_ENGINE_42B340_TABLE_BYTES = 186;
export const ROOM_TRANSITION_ENGINE_42B340_NEXT_FUNC = 0x0042b430;
export const ROOM_TRANSITION_ENGINE_42B430_VA = 0x0042b430;
export const ROOM_TRANSITION_ENGINE_42B430_VA_TRUE = 0x0042b44c;
export const ROOM_TRANSITION_ENGINE_42B430_VA_FALSE = 0x0042b452;
export const ROOM_TRANSITION_ENGINE_42B430_REBIAS = 0x13;
export const ROOM_TRANSITION_ENGINE_42B430_BOUND = 0x17;
export const ROOM_TRANSITION_ENGINE_42B430_BYTE_TABLE_VA = 0x0042b460;
export const ROOM_TRANSITION_ENGINE_42B430_DWORD_TABLE_VA = 0x0042b458;
export const ROOM_TRANSITION_ENGINE_42B430_TABLE_BYTES = 24;
export const ROOM_TRANSITION_ENGINE_42B430_NEXT_FUNC = 0x0042b470;

export const ROOM_TRANSITION_ENGINE_42B340_BYTE_TABLE = [
  0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1, 1,
  1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1,
  1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0,
  0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
  0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0,
  1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0,
  0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0,
];

export const ROOM_TRANSITION_ENGINE_42B430_BYTE_TABLE = [
  0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0,
];

/** 0x42b340 whole-body law: idx = u32(arg - 3); ja over 0xb9 -> FALSE;
 *  byte value 0 -> TRUE / nonzero -> FALSE. */
export function roomTransitionEngine42b340Contains(arg) {
  const idx = (((arg | 0) >>> 0) - 3) >>> 0;
  if (idx > ROOM_TRANSITION_ENGINE_42B340_BOUND) return 0;
  return ROOM_TRANSITION_ENGINE_42B340_BYTE_TABLE[idx] === 0 ? 1 : 0;
}

/** 0x42b430 whole-body law: idx = u32(arg - 0x13); ja over 0x17 -> FALSE;
 *  byte value 0 -> TRUE / nonzero -> FALSE. */
export function roomTransitionEngine42b430Contains(arg) {
  const idx = (((arg | 0) >>> 0) - 0x13) >>> 0;
  if (idx > ROOM_TRANSITION_ENGINE_42B430_BOUND) return 0;
  return ROOM_TRANSITION_ENGINE_42B430_BYTE_TABLE[idx] === 0 ? 1 : 0;
}

/* ============================================================================
   v25 - 0x42b480 switch classifier (97-entry table, rebias 1, bound 0x60) +
   0x42b550 field-pointer getter (+0x10). Both FULLY PURE.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42B480_VA = 0x0042b480;
export const ROOM_TRANSITION_ENGINE_42B480_VA_TRUE = 0x0042b49a;
export const ROOM_TRANSITION_ENGINE_42B480_VA_FALSE = 0x0042b4a0;
export const ROOM_TRANSITION_ENGINE_42B480_REBIAS = 1;
export const ROOM_TRANSITION_ENGINE_42B480_BOUND = 0x60;
export const ROOM_TRANSITION_ENGINE_42B480_BYTE_TABLE_VA = 0x0042b4b0;
export const ROOM_TRANSITION_ENGINE_42B480_DWORD_TABLE_VA = 0x0042b4a8;
export const ROOM_TRANSITION_ENGINE_42B480_TABLE_BYTES = 97;
export const ROOM_TRANSITION_ENGINE_42B480_NEXT_FUNC = 0x0042b520;
export const ROOM_TRANSITION_ENGINE_42B550_VA = 0x0042b550;
export const ROOM_TRANSITION_ENGINE_42B550_FIELD_OFF = 0x10;

export const ROOM_TRANSITION_ENGINE_42B480_BYTE_TABLE = [
  0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 1, 1,
  1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
  1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0,
  1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,
  0,
];

/** 0x42b480 whole-body law: idx = u32(arg - 1); ja over 0x60 -> FALSE;
 *  byte value 0 -> TRUE / nonzero -> FALSE. */
export function roomTransitionEngine42b480Contains(arg) {
  const idx = (((arg | 0) >>> 0) - ROOM_TRANSITION_ENGINE_42B480_REBIAS) >>> 0;
  if (idx > ROOM_TRANSITION_ENGINE_42B480_BOUND) return 0;
  return ROOM_TRANSITION_ENGINE_42B480_BYTE_TABLE[idx] === 0 ? 1 : 0;
}

/** 0x42b550 field-pointer getter: u32-wrapping this + 0x10. */
export function roomTransitionEngine42b550FieldGetter(thisOff) {
  return ((thisOff >>> 0) + ROOM_TRANSITION_ENGINE_42B550_FIELD_OFF) >>> 0;
}

/* ============================================================================
   v26 - 0x0042b940 multi-case setter (94 B, FULLY PURE). Three store sites
   stay host; retired VALUES decided by these three laws.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42B940_VA = 0x0042b940;
export const ROOM_TRANSITION_ENGINE_42B940_BODY_END_VA = 0x0042b99f;
export const ROOM_TRANSITION_ENGINE_42B940_TYPE_OFF = 0x4;
export const ROOM_TRANSITION_ENGINE_42B940_STORE_5C_OFF = 0x5c;
export const ROOM_TRANSITION_ENGINE_42B940_STORE_58_OFF = 0x58;
export const ROOM_TRANSITION_ENGINE_42B940_STORE_60_OFF = 0x60;
export const ROOM_TRANSITION_ENGINE_42B940_TYPE_14E = 0x14e;
export const ROOM_TRANSITION_ENGINE_42B940_TYPE_81 = 0x81;
export const ROOM_TRANSITION_ENGINE_42B940_TYPE_12D = 0x12d;
export const ROOM_TRANSITION_ENGINE_42B940_TYPE_1AC = 0x1ac;
export const ROOM_TRANSITION_ENGINE_42B940_VALUE_10 = 10;
export const ROOM_TRANSITION_ENGINE_42B940_VALUE_2 = 2;
export const ROOM_TRANSITION_ENGINE_42B940_VALUE_4 = 4;
export const ROOM_TRANSITION_ENGINE_42B940_NO_STORE = -1;

/** [obj+0x5c] <- 10 iff type is 0x14e or 0x81. */
export function roomTransitionEngine42b940Store5c(type) {
  const t = type >>> 0;
  return (t === 0x14e || t === 0x81) ? 10 : -1;
}

/** [obj+0x58] <- 10 iff type is 0x14e. */
export function roomTransitionEngine42b940Store58(type) {
  return (type >>> 0) === 0x14e ? 10 : -1;
}

/** [obj+0x60] <- 2 iff type is 0x12d; <- 4 iff type is 0x1ac. */
export function roomTransitionEngine42b940Store60(type) {
  const t = type >>> 0;
  if (t === 0x12d) return 2;
  if (t === 0x1ac) return 4;
  return -1;
}

/* ============================================================================
   v31 - 0x42c6e0 linked-list pop-head (15 B, FULLY PURE). NO null check.
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42C6E0_VA = 0x0042c6e0;
export const ROOM_TRANSITION_ENGINE_42C6E0_VA_RET = 0x0042c6ef;
export const ROOM_TRANSITION_ENGINE_42C6E0_BODY_BYTES = 15;
export const ROOM_TRANSITION_ENGINE_42C6E0_CALLSITE_COUNT = 1;
export const ROOM_TRANSITION_ENGINE_42C6E0_CALLER0 = 0x005bab91;
export const ROOM_TRANSITION_ENGINE_42C6E0_HEAD_OFF = 0x0;
export const ROOM_TRANSITION_ENGINE_42C6E0_NEXT_FUNC = 0x0042c160;

/** 0x42c6e0 popped value: [this+0] retired verbatim to *arg0. */
export function roomTransitionEngine42c6e0Popped(oldHead) {
  return oldHead >>> 0;
}

/** 0x42c6e0 advanced head: [[this+0]] retired verbatim to [this+0]. */
export function roomTransitionEngine42c6e0Advanced(next) {
  return next >>> 0;
}

/* ============================================================================
   v32 - POST: two verify-open one-liners. V32-A: value+8 getter.
   V32-B: ne-check between [this+0] and [*other].
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42C700_VA = 0x0042c700;
export const ROOM_TRANSITION_ENGINE_42C700_VA_RET = 0x0042c705;
export const ROOM_TRANSITION_ENGINE_42C700_BODY_BYTES = 6;
export const ROOM_TRANSITION_ENGINE_42C700_CALLSITE_COUNT = 5;
export const ROOM_TRANSITION_ENGINE_42C700_E8_COUNT = 0;
export const ROOM_TRANSITION_ENGINE_42C700_ADD_IMM = 8;
export const ROOM_TRANSITION_ENGINE_42C710_VA = 0x0042c710;
export const ROOM_TRANSITION_ENGINE_42C710_BODY_BYTES = 17;
export const ROOM_TRANSITION_ENGINE_42C710_CALLSITE_COUNT = 25;
export const ROOM_TRANSITION_ENGINE_42C710_NEXT_FUNC = 0x0042c730;

/** 0x42c700: [this+0] + 8 (u32 LE load at wrapped offset add, then
 *  u32-wrapping add of 8). */
export function roomTransitionEngine42c700ValuePlus8(input) {
  const base = rte4288a0Load32(input.mem, input.thisOff >>> 0);
  return (base + ROOM_TRANSITION_ENGINE_42C700_ADD_IMM) >>> 0;
}

/** 0x42c710: [this+0] != [*other] -> 1 (EQUALITY only). */
export function roomTransitionEngine42c710NeCheck(input) {
  const lhs = rte4288a0Load32(input.mem, input.thisOff >>> 0);
  const rhs = rte4288a0Load32(input.mem, input.otherOff >>> 0);
  return lhs !== rhs ? 1 : 0;
}

/* ============================================================================
   v33 - 0x42c7f0 element count getter (SIGNED div by 12 via magic).
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42C7F0_VA = 0x0042c7f0;
export const ROOM_TRANSITION_ENGINE_42C7F0_BODY_BYTES = 27;
export const ROOM_TRANSITION_ENGINE_42C7F0_CALLSITE_COUNT = 6;
export const ROOM_TRANSITION_ENGINE_42C7F0_ELEM_STRIDE = 12;
export const ROOM_TRANSITION_ENGINE_42C7F0_VA_RET = 0x0042c80a;
export const ROOM_TRANSITION_ENGINE_42C7F0_BEGIN_OFF = 0x0;
export const ROOM_TRANSITION_ENGINE_42C7F0_END_OFF = 0x4;
export const ROOM_TRANSITION_ENGINE_42C7F0_DIV_MAGIC = 0x92492493;

/** 0x42c7f0: SIGNED (end - begin) / 12. */
export function roomTransitionEngine42c7f0ElemCount(spanBytes) {
  return Math.trunc((spanBytes | 0) / ROOM_TRANSITION_ENGINE_42C7F0_ELEM_STRIDE);
}

/* ============================================================================
   v34 - 0x42c810 element address getter (base + index*4, u32 wrap).
   ========================================================================== */

export const ROOM_TRANSITION_ENGINE_42C810_VA = 0x0042c810;
export const ROOM_TRANSITION_ENGINE_42C810_BODY_BYTES = 10;
export const ROOM_TRANSITION_ENGINE_42C810_CALLSITE_COUNT = 53;
export const ROOM_TRANSITION_ENGINE_42C810_BASE_OFF = 0x0;
export const ROOM_TRANSITION_ENGINE_42C810_ELEM_SCALE = 4;
export const ROOM_TRANSITION_ENGINE_42C810_NEXT_FUNC = 0x0042c820;

/** 0x42c810: base + index*4 (u32 wrap). */
export function roomTransitionEngine42c810ElemAddr(thisBase, index) {
  return ((thisBase >>> 0) + (index >>> 0) * ROOM_TRANSITION_ENGINE_42C810_ELEM_SCALE) >>> 0;
}


export const ROOM_TRANSITION_ENGINE_42D040_VA = 0x0042d040;
export const ROOM_TRANSITION_ENGINE_42D040_BODY_BYTES = 17;
export const ROOM_TRANSITION_ENGINE_42D040_CALLSITE_COUNT = 9;
export const ROOM_TRANSITION_ENGINE_42D040_PRIMARY_OFF = 0x13dc;
export const ROOM_TRANSITION_ENGINE_42D040_FALLBACK_OFF = 0x13e0;
export const ROOM_TRANSITION_ENGINE_42D040_NEXT_FUNC = 0x0042d060;
export function roomTransitionEngine42d040ConditionalGetter(field13dc, field13e0) {
  return (field13dc >>> 0) !== 0 ? field13dc >>> 0 : field13e0 >>> 0;
}