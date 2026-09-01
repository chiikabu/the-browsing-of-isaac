/** Independent JS oracle for the SFX / SoundEffects manager pure helpers.
 *  Do not derive mechanically from native/decomp/sfx_pure_helpers.cpp.
…
 */

/*  Helpers ABI v2 adds:
 *    0x0092e560 is-playing probe â€” same four gate tests as the mutators, but a
…
 */

/*  Helpers ABI v3 adds:
 *    0x0092cfb0 SoundEffect::Load, split. The bookkeeping it performs on the
…
 */

/*  Helpers ABI v4 adds two bounded blocks of 0x0092d140, the sample-table
 *  (re)builder that follows SoundEffect::Load:
…
 */

/*  Helpers ABI v6 adds the per-sound tail of 0x0092d140
 *  (0x0092da86..0x0092db29): the SoundEffect::Load entry with the wrapped
…
 */

export const SFX_PURE_ABI_VERSION = 41;

/* ---------- PE constants ---------- */

export const SFX_MGR_OFF_NOT_PRELOADED_COUNT = 0x0c;
export const SFX_MGR_OFF_VOLUME_MODIFIER_10 = 0x10;

export const SFX_ENTRY_STRIDE = 0x1b8;
export const SFX_ENTRY_OFF_FRAME_START = 0x000;
export const SFX_ENTRY_OFF_FRAME_END = 0x004;
export const SFX_ENTRY_OFF_VOICE_COUNT_190 = 0x190;
export const SFX_ENTRY_OFF_BASE_VOLUME_194 = 0x194;
export const SFX_ENTRY_OFF_ENABLED_198 = 0x198;

export const SFX_VOICE_STRIDE = 0x38;
export const SFX_VOICE_BASE_OFF = 0x20;
export const SFX_VOICE_OFF_SECONDARY_04 = 0x04;
export const SFX_VOICE_OFF_LOOP_08 = 0x08;
export const SFX_VOICE_OFF_PENDING_09 = 0x09;
export const SFX_VOICE_OFF_FLAG_0A = 0x0a;
export const SFX_VOICE_OFF_VOLUME_0C = 0x0c;
export const SFX_VOICE_OFF_PAN_10 = 0x10;
export const SFX_VOICE_OFF_PITCH_14 = 0x14;
export const SFX_VOICE_OFF_STREAM_18 = 0x18;
export const SFX_VOICE_NAME_OFF = 0x08;
export const SFX_VOICE_NAME_CAPACITY_OFF = 0x14;

export const SFX_ENTRY_DIV_MAGIC = 0x094f2095;
export const SFX_ENTRY_DIV_SHIFT = 4;
export const SFX_GLOBAL_ROOT_VA = 0x00c7169c;
export const SFX_GLOBAL_OFF_FRAME_CLOCK_4ABBC = 0x4abbc;
export const SFX_GLOBAL_OFF_MASTER_VOLUME_2A358 = 0x2a358;

export const SFX_RNG_SEED_VA = 0x00c5d2a0;
export const SFX_RNG_SHIFT1_VA = 0x00c5d2a4;
export const SFX_RNG_SHIFT2_VA = 0x00c5d2a8;
export const SFX_RNG_SHIFT3_VA = 0x00c5d2ac;
export const SFX_RNG_SEED_DEFAULT = 0x12345678;
export const SFX_RNG_SHIFT1_DEFAULT = 5;
export const SFX_RNG_SHIFT2_DEFAULT = 0x1b;
export const SFX_RNG_SHIFT3_DEFAULT = 8;
export const SFX_RNG_SHIFT_TRIPLE_RDATA_VA = 0x00b1f6c0;
export const SFX_RNG_INIT_GUARD_VA = 0x00c94050;

export const SFX_F32_ONE_BITS = 0x3f800000;
export const SFX_STOP_FRAME_END_SENTINEL = -1;

export const SFX_HOST_VA_PLAY = 0x0092dc30;
export const SFX_HOST_VA_SET_VOLUME = 0x0092df40;
export const SFX_HOST_VA_SET_PITCH = 0x0092e050;
export const SFX_HOST_VA_STOP = 0x0092e230;
export const SFX_HOST_VA_CLEAR_VOLUME_MODIFIER = 0x0092e430;
export const SFX_HOST_VA_IS_PLAYING = 0x0092e560;
export const SFX_HOST_VA_SOUND_EFFECT_LOAD = 0x0092cfb0;
export const SFX_HOST_VA_LOG = 0x00a112c0;
export const SFX_HOST_VA_CHANNEL_RESET = 0x00a2abd0;
export const SFX_HOST_VA_CHANNEL_ASSIGN = 0x00a2add0;
export const SFX_HOST_VA_CHANNEL_PAN = 0x00a2ac20;
export const SFX_HOST_VA_CHANNEL_RELEASE_INNER = 0x00a2ae60;
export const SFX_HOST_VA_CHANNEL_ATTACH = 0x008f2c90;
export const SFX_HOST_VA_STRING_DTOR = 0x007e2740;
export const SFX_HOST_VA_SOUND_SYSTEM_GLOBAL = 0x00c5aaa0;
export const SFX_HOST_VA_ATTACH_HOOK_PTR = 0x00c7f484;

export const SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD = 0;
export const SFX_CHANNEL_DEFAULT_FLAG_0A = 0;
export const SFX_CHANNEL_DEFAULT_VOLUME_BITS = 0x3f800000;
export const SFX_CHANNEL_DEFAULT_PAN_BITS = 0;
export const SFX_CHANNEL_DEFAULT_PITCH_BITS = 0x3f800000;
export const SFX_PLAY_STARTED_WORD = 1;

export const SFX_PAN_MONO_MAX_CHANNELS = 1;
export const SFX_PAN_NEUTRAL_BITS = 0;
export const SFX_PAN_WARN_LOG_LEVEL = 4;
export const SFX_PAN_WARN_STR_VA = 0x00b9c3e0;

export const SFX_GATE_FORM_MUTATOR = 0;
export const SFX_GATE_FORM_PLAY = 1;
export const SFX_GATE_FORM_PROBE = 2;

export const SFX_PAN_ACTION_NONE = 0;
export const SFX_PAN_ACTION_SET = 1;
export const SFX_PAN_ACTION_WARN = 2;

export const SFX_LOG_LEVEL_WARN = 1;
export const SFX_LOG_LEVEL_FATAL = 0x10;
export const SFX_LOG_STR_NO_SAMPLES_VA = 0x00b7b1fc;
export const SFX_LOG_STR_NOT_PRELOADED_VA = 0x00b7b1d8;
export const SFX_LOG_STR_SEED_ZERO_VA = 0x00b6bf54;

/* ---------- v3 ---------- */

export const SFX_HOST_VA_LOAD_REDIRECT_PATH = 0x008f5ad0;
export const SFX_HOST_VA_LOAD_SUFFIX_COMPARE = 0x00423480;
export const SFX_HOST_VA_LOAD_PATH_FATAL = 0x00499950;
export const SFX_HOST_VA_LOAD_PATH_MANAGER_OFF = 0x2a6c0;
export const SFX_LOAD_STREAM_SUFFIX_VA = 0x00b7b1bc;
export const SFX_LOAD_SUFFIX_LEN = 4;
export const SFX_LOAD_MIN_PATH_LEN = 4;
export const SFX_LOAD_SSO_CAPACITY_LIMIT = 0x10;
export const SFX_LOAD_ENABLED_AFTER = 1;
export const SFX_LOAD_STREAM_BYTE_STREAM = 1;
export const SFX_LOAD_STREAM_BYTE_STATIC = 0;
export const SFX_LOAD_VOICE_SLOT_CAPACITY = 7;
export const SFX_LOAD_HEADER_ALIAS_INDEX = 7;
export const SFX_LOAD_CALLER_COUNT = 22;
/* v22: [created]->vtbl[0x0c] probe whose LOW-BYTE result gates the hook. */
export const SFX_LOAD_PROBE_SLOT_0C = 0x0c;

export const SFX_HOST_VA_CHANNEL_COPY_ASSIGN = 0x00a2ac90;
export const SFX_HOST_VA_CHANNEL_COPY_CTOR_CALLSITE = 0x00a2ab21;
export const SFX_HOST_VA_CHANNEL_RESET_HOOKED = 0x00a2ab40;
export const SFX_HOST_VA_CHANNEL_START = 0x00a2ac00;
export const SFX_HOST_VA_CHANNEL_ADOPT = 0x008f2d20;
export const SFX_CHANNEL_RESET_PACK_SITE_COUNT = 8;
export const SFX_CHANNEL_COPY_ASSIGN_ADOPT_CALLS = 2;
export const SFX_CHANNEL_COPY_ASSIGN_HOOK_SITES = 2;
export const SFX_CHANNEL_START_ARG = 1;

export const SFX_PLAY_RECAPTURE_NONE = 0;
export const SFX_PLAY_RECAPTURE_ENTRY_END_4 = 1;
export const SFX_PLAY_RECAPTURE_VOICES_190 = 2;
export const SFX_PLAY_RECAPTURE_STREAM_FLAG = 4;

/* ---------- v4 ---------- */

export const SFX_TABLE_TARGET_COUNT = 0x443;
export const SFX_TABLE_TARGET_BYTES = 0x75328;
export const SFX_ENTRY_VOICE_DTOR_BASE_OFF = 0x08;
export const SFX_ENTRY_VOICE_DTOR_STRIDE = 0x38;
export const SFX_ENTRY_VOICE_DTOR_COUNT = 7;
export const SFX_VOICE_SLOT_OFF_NAME = 0x00;
export const SFX_VOICE_SLOT_OFF_WRAPPER = 0x18;
export const SFX_ENTRY_OFF_NAME_STRING_1A0 = 0x1a0;
export const SFX_STRING_OFF_SIZE_10 = 0x10;
export const SFX_STRING_OFF_CAPACITY_14 = 0x14;
export const SFX_STRING_SSO_LIMIT = 0x10;
export const SFX_STRING_BIG_ALLOC_LIMIT = 0x1000;
export const SFX_STRING_BIG_ALLOC_BIAS = 0x23;
export const SFX_STRING_ALIGN_SLACK_MAX = 0x1f;
export const SFX_STRING_RESET_CAPACITY = 0x0f;
export const SFX_HOST_VA_TABLE_LOAD = 0x0092d140;
export const SFX_HOST_VA_TABLE_DESTROY_RANGE = 0x0092ea80;
export const SFX_HOST_VA_TABLE_APPEND_N = 0x0092edc0;
export const SFX_HOST_VA_TABLE_GROW = 0x0092ee40;
export const SFX_HOST_VA_VOICE_SLOT_DTOR = 0x0092cf10;
export const SFX_HOST_VA_VECTOR_DTOR_ITER = 0x00aef638;
export const SFX_HOST_VA_STRING_DTOR_40D040 = 0x0040d040;
export const SFX_HOST_VA_FREE = 0x00aef15c;
export const SFX_TABLE_LOAD_CALLER_COUNT = 2;

export const SFX_TABLE_RESIZE_SHRINK = 0;
export const SFX_TABLE_RESIZE_NONE = 1;
export const SFX_TABLE_RESIZE_GROW_INPLACE = 2;
export const SFX_TABLE_RESIZE_GROW_REALLOC = 3;

export const SFX_DEAD_BRANCH_PLAY_VOICE_DIV_GUARD = 0;
export const SFX_DEAD_BRANCH_TABLE_SELF_ASSIGN = 1;
export const SFX_DEAD_BRANCH_COUNT = 2;

/* ---------- v5: XML layout + attribute constants (0x0092d140 C/D) ------- */
export const SFX_XML_NODE_OFF_NAME_00 = 0x00;
export const SFX_XML_NODE_OFF_NAME_LEN_08 = 0x08;
export const SFX_XML_NODE_OFF_CHILDREN_18 = 0x18;
export const SFX_XML_NODE_OFF_ATTRS_20 = 0x20;
export const SFX_XML_NODE_OFF_NEXT_2C = 0x2c;
export const SFX_XML_ATTR_OFF_NAME_00 = 0x00;
export const SFX_XML_ATTR_OFF_VALUE_04 = 0x04;
export const SFX_XML_ATTR_OFF_CONTINUE_10 = 0x10;
export const SFX_XML_ATTR_OFF_NEXT_18 = 0x18;
export const SFX_ATTR_NAME_ID_VA = 0x00b1bff0;
export const SFX_ATTR_NAME_NAME_VA = 0x00b1c13c;
export const SFX_ATTR_NAME_PATH_VA = 0x00b66e0c;
export const SFX_ATTR_NAME_WEIGHT_VA = 0x00b1c174;
export const SFX_XML_SAMPLE_ELEMENT_VA = 0x00b7b168;
export const SFX_XML_SOUND_ELEMENT_VA = 0x00b7b1ac;
export const SFX_XML_ROOT_ELEMENT_VA = 0x00b66f40;
export const SFX_XML_SAMPLE_NAME_LEN = 6;
export const SFX_ATTR_CONSTANT_COUNT = 5;
export const SFX_ATTR_EMPTY_STRING_VA = 0x00c71640;
export const SFX_ATTR_PARSE_IAT_VA = 0x00b187a8;
export const SFX_ENTRY_OFF_PAD_199 = 0x199;
export const SFX_ENTRY_OFF_ID_19C = 0x19c;
export const SFX_SLOT_OFF_WEIGHT_34 = 0x34;
export const SFX_MAX_SAMPLES_PER_SOUND = 7;
export const SFX_OUT_OF_BOUNDS_WARN_VA = 0x00b7b170;
export const SFX_MAX_SAMPLES_WARN_VA = 0x00b7b220;

/* ---------- v6: tail constants + original-defect pins ---------- */

/* The out-of-bounds warn (0x92d6cf) pushes fmt + level with NO vararg for
   its "%d" (original defect); the max-samples warn (0x92da76) pushes
   index + fmt + level. Never conflate the two stack shapes. */
export const SFX_WARN_KIND_OUT_OF_BOUNDS = 0;
export const SFX_WARN_KIND_MAX_SAMPLES = 1;
export const SFX_OUT_OF_BOUNDS_WARN_LEVEL = 0x10;
export const SFX_MAX_SAMPLES_WARN_LEVEL = 1;
export const SFX_OUT_OF_BOUNDS_WARN_ARGS = 2;
export const SFX_MAX_SAMPLES_WARN_ARGS = 3;
export const SFX_OUT_OF_BOUNDS_WARN_VARARGS = 0;
export const SFX_MAX_SAMPLES_WARN_VARARGS = 1;

/* The fill loop's five header stores. Sources for index 1 (entry+0x194,
   movss from a stack slot the proto builder never writes) and index 3
   (entry+0x199, a byte from another unwritten slot) are uninitialized
   garbage â€” original defect, pinned. */
export const SFX_FILL_HEADER_COUNT = 5;
export const SFX_FILL_HEADER_OFFS = [0x190, 0x194, 0x198, 0x199, 0x19c];
export const SFX_FILL_HEADER_UNINIT_MASK = 0xa; // bits 1 and 3: 0x194 + 0x199

export const SFX_HOST_VA_EHVEC_DTOR = 0x00aef638;
export const SFX_HOST_VA_ABORT_B18894 = 0x00b18894;
export const SFX_HOST_VA_DOC_DTOR_414730 = 0x00414730;
export const SFX_TAIL_CHAIN_OFF_2C = 0x2c;
export const SFX_HOST_VA_STRING_ASSIGN_40CCD0 = 0x0040ccd0;
export const SFX_HOST_VA_STRING_ASSIGN_421680 = 0x00421680;
export const SFX_HOST_VA_VECTOR_EMPLACE = 0x0092e830;
export const SFX_HOST_VA_VECTOR_GROW_APPEND = 0x0092e900;
export const SFX_HOST_VA_EHVEC_CTOR = 0x00aef5c4;
export const SFX_ATTR_SITE_ENTRY = 0;
export const SFX_ATTR_SITE_SLOT = 1;
export const SFX_ATTR_ARM_NONE = 0;
export const SFX_ATTR_ARM_FIRST = 1;
export const SFX_ATTR_ARM_SECOND = 2;
export const SFX_ATTR_ACTION_NONE = 0;
export const SFX_ATTR_ACTION_NUMERIC_PARSE = 1;
export const SFX_ATTR_ACTION_STRING_ASSIGN = 2;

export const SFX_GATE_MISS = 0;
export const SFX_GATE_NO_SAMPLES = 1;
export const SFX_GATE_DISABLED = 2;
export const SFX_GATE_LIVE = 3;

export const SFX_PLAY_GATE_MISS = 0;
export const SFX_PLAY_GATE_NO_SAMPLES = 1;
export const SFX_PLAY_GATE_PRELOAD = 2;
export const SFX_PLAY_GATE_LIVE = 3;

/* ---------- small numeric helpers ---------- */

function i32(v) {
  return v | 0;
}

function u32(v) {
  return v >>> 0;
}

function byte(v) {
  return u32(v) & 0xff;
}

function f32(v) {
  return Math.fround(v);
}
function nameByteAt(name, i) {
  if (typeof name === "string") {
    return i < name.length ? name.charCodeAt(i) & 0xff : 0;
  }
  return 0;
}
function gateImpl(id, spanBytes, voices190, enabled198, form) {
  const play = normalizeForm(form) === SFX_GATE_FORM_PLAY ? 1 : 0;
  if (!sfxIdInRange(id, spanBytes)) {
    return play ? SFX_PLAY_GATE_MISS : SFX_GATE_MISS;
  }
  if (u32(voices190) === 0) {
    return play ? SFX_PLAY_GATE_NO_SAMPLES : SFX_GATE_NO_SAMPLES;
  }
  if (byte(enabled198) === 0) {
    return play ? SFX_PLAY_GATE_PRELOAD : SFX_GATE_DISABLED;
  }
  return play ? SFX_PLAY_GATE_LIVE : SFX_GATE_LIVE;
}

function f32FromBits(bits) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setUint32(0, u32(bits), true);
  return view.getFloat32(0, true);
}

const ONE = f32FromBits(SFX_F32_ONE_BITS);

/* ---------- SG: entry-table gate ---------- */

/**
 * Number of SoundEffect entries in the manager's vector. The machine reaches
…
 */
export function sfxEntryCount(spanBytes) {
  const span = i32(spanBytes);
  const mag = SFX_ENTRY_DIV_MAGIC | 0;
  const prod = BigInt(mag) * BigInt(span);
  let high = Number((prod >> 32n) & 0xffffffffn);
  if (high >= 0x80000000) high -= 0x100000000;
  const shifted = high >> SFX_ENTRY_DIV_SHIFT;
  return (shifted + (shifted >>> 31)) | 0;
}

/** Byte offset of entry `id`. Unchecked, and wraps at 32 bits. */
export function sfxEntryOffset(id) {
  return Math.imul(i32(id), SFX_ENTRY_STRIDE) | 0;
}

/** Both the sign test and the upper bound test are signed. */
export function sfxIdInRange(id, spanBytes) {
  const i = i32(id);
  if (i < 0) return false;
  return i < sfxEntryCount(spanBytes);
}

/**
 * How far a mutator (stop / set volume / set pitch) gets for a given id.
 * A missing index and a disabled entry both leave with nothing done; an
 * entry with no voices logs a warning first.
 */
export function sfxMutatorGate(id, spanBytes, voices190, enabled198) {
  return gateImpl(id, spanBytes, voices190, enabled198, SFX_GATE_FORM_MUTATOR);
}

/**
 * Play shares the first three tests but treats a disabled entry as a
 * lazy-load: it preloads the effect, warns, bumps the manager's counter and
 * then carries on into the same body a live entry would take.
 */
export function sfxPlayGate(id, spanBytes, voices190, enabled198) {
  return gateImpl(id, spanBytes, voices190, enabled198, SFX_GATE_FORM_PLAY);
}

/** Mutator gates that leave no trace whatsoever. */
export function sfxMutatorNoEffect(gateKind) {
  const k = i32(gateKind);
  return k === SFX_GATE_MISS || k === SFX_GATE_DISABLED;
}

/**
 * Form-aware "this exit did nothing at all". The disabled-mutator kind and
 * the Play-preload kind are the same number, so the bare kind cannot answer
 * this: a preload still loads the sample, logs, bumps a counter and plays.
 */
export function sfxGateNoEffect(gateKind, form) {
  const norm = normalizeForm(form);
  if (norm === SFX_GATE_FORM_PLAY) {
    return i32(gateKind) === SFX_PLAY_GATE_MISS;
  }
  if (norm === SFX_GATE_FORM_PROBE) {
    return i32(gateKind) !== SFX_GATE_LIVE;
  }
  return sfxMutatorNoEffect(gateKind);
}

/**
 * The is-playing probe classifies exactly like a mutator: it too abandons a
 * disabled entry. Only what it does at the exits differs.
 */
export function sfxProbeGate(id, spanBytes, voices190, enabled198) {
  return sfxMutatorGate(id, spanBytes, voices190, enabled198);
}

/** v1 passed a boolean; anything truthy that is not the probe means Play. */
function normalizeForm(form) {
  if (i32(form) === SFX_GATE_FORM_PROBE) return SFX_GATE_FORM_PROBE;
  return form ? SFX_GATE_FORM_PLAY : SFX_GATE_FORM_MUTATOR;
}

/**
 * Only the four roots that mean to *do* something announce a sample-less
 * entry. The query does not: it simply reports "not playing".
 */
export function sfxGateWarnLogNeeded(gateKind, form) {
  if (i32(gateKind) !== SFX_GATE_NO_SAMPLES) return false;
  return normalizeForm(form) !== SFX_GATE_FORM_PROBE;
}

/**
 * @param {number} id
…
 */
export function sfxGatePlan(id, spanBytes, voices190, enabled198, form) {
  const norm = normalizeForm(form);
  const kind = gateImpl(id, spanBytes, voices190, enabled198, norm);
  const inRange = sfxIdInRange(id, spanBytes);
  let voiceLoopNeeded;
  if (norm === SFX_GATE_FORM_PLAY) {
    voiceLoopNeeded = kind === SFX_PLAY_GATE_LIVE || kind === SFX_PLAY_GATE_PRELOAD;
  } else {
    voiceLoopNeeded = kind === SFX_GATE_LIVE;
  }
  return {
    kind,
    entryCount: sfxEntryCount(spanBytes),
    entryOffset: inRange ? sfxEntryOffset(id) : 0,
    indexInRange: inRange,
    warnLogNeeded: sfxGateWarnLogNeeded(kind, norm),
    voiceLoopNeeded,
    noEffect: sfxGateNoEffect(kind, norm),
  };
}

/* ---------- SV: voice cursor + loop control flow ---------- */

/** Voices are packed 0x38 apart starting 0x20 into the entry. */
export function sfxVoiceBaseOffset(index) {
  return u32(Math.imul(i32(index), SFX_VOICE_STRIDE) + SFX_VOICE_BASE_OFF) | 0;
}

/** The machine actually walks the pending flag, nine bytes past the pointer. */
export function sfxVoicePendingOffset(index) {
  return (u32(Math.imul(i32(index), SFX_VOICE_STRIDE)) +
    SFX_VOICE_BASE_OFF + SFX_VOICE_OFF_PENDING_09) | 0;
}

/** Loop-back test, unsigned, against the voice count re-read from the entry. */
export function sfxVoiceLoopContinue(nextIndex, voicesReloaded) {
  return u32(nextIndex) < u32(voicesReloaded);
}

/* ---------- SA: per-voice activity decision ---------- */

/** No channel object at all means the voice is skipped before any probe. */
export function sfxVoiceFirstProbeNeeded(channelNull, pending09) {
  if (i32(channelNull) !== 0) return false;
  return byte(pending09) !== 0;
}

/**
 * The pending flag is cleared when the first activity probe reports true,
 * and the later comparison observes that updated value, not the original.
 */
export function sfxVoicePendingAfter(channelNull, pending09, probeFirst) {
  const pending = byte(pending09);
  if (!sfxVoiceFirstProbeNeeded(channelNull, pending09)) return pending;
  return probeFirst ? 0 : pending;
}

/**
 * The voice body runs when the second probe reports activity, or when the
 * pending flag is still set after the optional clear.
 */
export function sfxVoiceAct(channelNull, pending09, probeFirst, probeSecond) {
  if (i32(channelNull) !== 0) return false;
  if (probeSecond) return true;
  return sfxVoicePendingAfter(channelNull, pending09, probeFirst) !== 0;
}

export function sfxVoiceDecide(channelNull, pending09, probeFirst, probeSecond) {
  const first = sfxVoiceFirstProbeNeeded(channelNull, pending09);
  const after = sfxVoicePendingAfter(channelNull, pending09, probeFirst);
  const act = sfxVoiceAct(channelNull, pending09, probeFirst, probeSecond);
  return {
    firstProbeNeeded: first,
    secondProbeNeeded: i32(channelNull) === 0,
    pendingCleared: !!(first && probeFirst && byte(pending09) !== 0),
    pendingAfter: after,
    act,
    skip: !act,
  };
}

/**
 * The stop path re-reads the channel pointer once more before stopping, and
 * only clears the pending flag when that reload is still live.
 */
export function sfxStopClearsPending(act, channelNullReload) {
  if (!act) return false;
  return i32(channelNullReload) === 0;
}

/** Stop stamps a plain sentinel into the entry's end slot every iteration. */
export function sfxStopFrameEndValue() {
  return SFX_STOP_FRAME_END_SENTINEL;
}

/* ---------- SM: volume / pitch float arithmetic ---------- */

/**
 * The manager's volume modifier only participates when it is strictly above
 * zero under an ordered comparison; anything else (negative, -0, NaN)
 * contributes +0.
 */
export function sfxVolumeModifierBase(mgrVolumeModifier) {
  const x = f32(mgrVolumeModifier);
  return x > 0 ? x : 0;
}

/**
 * Ceiling at one. The machine keeps the left operand only when it compares
 * strictly below one, so a NaN input comes out as exactly 1.
 */
export function sfxMinOne(x) {
  const v = f32(x);
  return v < ONE ? v : ONE;
}

/** Play and the set-volume mutator: modifier * volume * master, capped at 1. */
export function sfxVoiceVolumeClamped(mgrVolumeModifier, volume, masterVolume) {
  let x = sfxVolumeModifierBase(mgrVolumeModifier);
  x = f32(x * f32(volume));
  x = f32(x * f32(masterVolume));
  return sfxMinOne(x);
}

/**
 * ClearVolumeModifier multiplies by the entry's own stored base volume and
 * never applies the ceiling, so its result can exceed one.
 */
export function sfxVoiceVolumeUnclamped(
  mgrVolumeModifier,
  entryBaseVolume,
  masterVolume,
) {
  let x = sfxVolumeModifierBase(mgrVolumeModifier);
  x = f32(x * f32(entryBaseVolume));
  return f32(x * f32(masterVolume));
}

/* ---------- SP: SFXManager::Play ---------- */

/** The global clock is halved with an arithmetic shift, so negatives floor. */
export function sfxPlayFrameHalf(clock4abbc) {
  return i32(clock4abbc) >> 1;
}

/**
 * Play bails out only when the halved clock is still behind the entry's end
 * stamp AND that stamp is non-negative. A negative stamp (the value stop
 * writes) therefore always lets a new play through.
 */
export function sfxPlayWindowOpen(clock4abbc, entryEnd4) {
  const half = sfxPlayFrameHalf(clock4abbc);
  const end = i32(entryEnd4);
  const returns = half < end && end >= 0;
  return returns ? false : true;
}

/** The new end stamp is the halved clock plus the delay, wrapping at 32 bits. */
export function sfxPlayFrameEnd(clock4abbc, frameDelay) {
  return u32(sfxPlayFrameHalf(clock4abbc) + i32(frameDelay)) | 0;
}

/**
 * Three-term xorshift (right, left, right) over the 0x00c5d2a0 word. Each
 * count arrives through cl, so only its low five bits matter. Defaults are
 * 5 / 27 / 8 from .rdata 0x00b1f6c0.
 */
export function sfxRngNext(seed, shift1, shift2, shift3) {
  let x = u32(seed);
  x ^= x >>> (u32(shift1) & 31);
  x ^= (x << (u32(shift2) & 31)) >>> 0;
  x >>>= 0;
  x ^= x >>> (u32(shift3) & 31);
  return u32(x);
}

/**
 * Which voice slot the draw lands on: an unsigned remainder, except that a
 * zero voice count skips the divide entirely and leaves slot 0.
 */
export function sfxVoiceSelect(seedOut, voices) {
  const v = u32(voices);
  if (v === 0) return 0;
  return u32(seedOut) % v;
}

/** Byte offset of a picked voice inside the entry; wraps at 32 bits. */
export function sfxVoicePickOffset(voiceIndex) {
  return Math.imul(u32(voiceIndex) | 0, SFX_VOICE_STRIDE) | 0;
}

/** The reload flag sits one whole voice stride past the picked voice's base. */
export function sfxPlayStreamFlagOffset(voiceIndex) {
  return u32(sfxVoicePickOffset(voiceIndex) + SFX_VOICE_STRIDE) | 0;
}

const PLAY_INPUT_DEFAULTS = {
  id: 0,
  spanBytes: 0,
  voices190: 0,
  enabled198: 0,
  clock4abbc: 0,
  entryEnd4: 0,
  frameDelay: 0,
  rngSeed: SFX_RNG_SEED_DEFAULT,
  rngShift1: SFX_RNG_SHIFT1_DEFAULT,
  rngShift2: SFX_RNG_SHIFT2_DEFAULT,
  rngShift3: SFX_RNG_SHIFT3_DEFAULT,
  streamFlag38: 0,
  loopArg: 0,
  volume: 0,
  pitch: 0,
  pan: 0,
  mgrVolumeModifier: 0,
  masterVolume: 0,
};

function emptyPlayPlan() {
  return {
    gateKind: SFX_PLAY_GATE_MISS,
    entryCount: 0,
    entryOffset: 0,
    warnNoSamples: false,
    preloadNeeded: false,
    windowOpen: false,
    frameStart: 0,
    frameEnd: 0,
    entryStoresDone: false,
    rngAdvanced: false,
    rngSeedOut: 0,
    seedZeroFatal: false,
    voiceIndex: 0,
    voiceOffset: 0,
    streamCreateNeeded: false,
    voiceLoopByte: 0,
    voiceLoopArg: 0,
    entryVolume: 0,
    voiceVolume: 0,
    voicePitch: 0,
    voicePan: 0,
    pureComplete: true,
    hostNeeded: false,
  };
}

/**
 * Resolve one SFXManager::Play call as far as it can be resolved without an
…
 */
export function sfxPlayPlan(opts = {}) {
  const in_ = { ...PLAY_INPUT_DEFAULTS, ...opts };
  const out = emptyPlayPlan();
  const kind = sfxPlayGate(in_.id, in_.spanBytes, in_.voices190, in_.enabled198);
  const inRange = sfxIdInRange(in_.id, in_.spanBytes);
  out.gateKind = kind;
  out.entryCount = sfxEntryCount(in_.spanBytes);
  out.entryOffset = inRange ? sfxEntryOffset(in_.id) : 0;
  if (kind === SFX_PLAY_GATE_MISS) return out;
  if (kind === SFX_PLAY_GATE_NO_SAMPLES) {
    out.warnNoSamples = true;
    out.pureComplete = false;
    out.hostNeeded = true;
    return out;
  }
  if (kind === SFX_PLAY_GATE_PRELOAD) {
    out.preloadNeeded = true;
    out.pureComplete = false;
    out.hostNeeded = true;
  }
  out.windowOpen = sfxPlayWindowOpen(in_.clock4abbc, in_.entryEnd4);
  if (!out.windowOpen) return out;
  out.pureComplete = false;
  out.hostNeeded = true;
  out.entryStoresDone = true;
  out.frameStart = sfxPlayFrameHalf(in_.clock4abbc);
  out.frameEnd = sfxPlayFrameEnd(in_.clock4abbc, in_.frameDelay);
  out.entryVolume = f32(in_.volume);
  if (u32(in_.rngSeed) === 0) {
    out.seedZeroFatal = true;
    return out;
  }
  const seedOut = sfxRngNext(in_.rngSeed, in_.rngShift1, in_.rngShift2, in_.rngShift3);
  const index = sfxVoiceSelect(seedOut, in_.voices190);
  out.rngAdvanced = true;
  out.rngSeedOut = seedOut;
  out.voiceIndex = index;
  out.voiceOffset = sfxVoicePickOffset(index);
  out.streamCreateNeeded = byte(in_.streamFlag38) !== 0;
  out.voiceLoopByte = byte(in_.loopArg);
  out.voiceLoopArg = i32(in_.loopArg);
  out.voicePitch = f32(in_.pitch);
  out.voicePan = f32(in_.pan);
  out.voiceVolume = sfxVoiceVolumeClamped(
    in_.mgrVolumeModifier, in_.volume, in_.masterVolume);
  return out;
}

/* ---------- SP-B: Play device-LEAF decisions (v26b) ---------- */

/** Gate -> typed host leaf: the warn-log-only NO_SAMPLES arm. */
export function sfxPlayNoSamplesHost(gateKind) {
  return i32(gateKind) === SFX_PLAY_GATE_NO_SAMPLES ? 1 : 0;
}

/** Gate -> typed host leaf: the Load + "not preloaded" + counter edge. */
export function sfxPlayPreloadHost(gateKind) {
  return i32(gateKind) === SFX_PLAY_GATE_PRELOAD ? 1 : 0;
}

/** Gate -> typed host leaf: the LIVE per-voice device body. */
export function sfxPlayBodyHost(gateKind) {
  return i32(gateKind) === SFX_PLAY_GATE_LIVE ? 1 : 0;
}

/** 0x92dd98 test ecx,ecx ; je skip — vtbl+0x28 probe iff channel != 0. */
export function sfxPlayProbeNeeded(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

/** 0x92dda3 test al,al ; je skip — reset 0xa2abd0 iff live channel that
 *  probed true. */
export function sfxPlayResetNeeded(channelNull, probeAlive) {
  if (i32(channelNull) !== 0) return 0;
  return i32(probeAlive) !== 0 ? 1 : 0;
}

/** 0x92ddb3..0x92ddb8 — UNSIGNED capacity < 0x10 -> inline SSO buffer,
 *  else the heap pointer at slot+8. */
export function sfxPlayStreamNamePtr(nameCap, inlineBase, heapPtr) {
  return u32(nameCap) < 0x10 ? u32(inlineBase) : u32(heapPtr);
}

/** 0x92ddfc — set-loop vtbl+0x40 iff channel != 0 (first read). */
export function sfxPlaySetLoopNeeded(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

/** 0x92de13 — set-pitch vtbl+0x58 iff channel != 0. */
export function sfxPlaySetPitchNeeded(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

/** 0x92de5b — set-volume vtbl+0x48 iff channel != 0. */
export function sfxPlaySetVolumeNeeded(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

/** 0x92de6d — start vtbl+0x2c iff channel != 0 at the reload. */
export function sfxPlayStartNeeded(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

/** Word [voice+0x29] = 1 iff the start call fires (pending 1, flag 0). */
export function sfxPlayPendingWord(channelNull) {
  return i32(channelNull) !== 0 ? 0 : 1;
}

const PLAY_LEAF_INPUT_DEFAULTS = {
  gateKind: SFX_PLAY_GATE_LIVE,
  windowOpen: 1,
  channelNull: 0,
  probeAlive: 0,
  streamFlag: 0,
  nameCap: 0,
  nameInline: 0,
  nameHeap: 0,
  channelCount: 0,
  pan: 0,
};

/**
 * Full typed-leaf record of the Play continuation: which host leaves fire
 * (warn / preload / allocate probe+reset+create / set-* / start / pan)
 * and how many device calls the PE issues on this path. `pureComplete`
 * is 1 only when NOTHING host fires (MISS, or LIVE with a closed window).
 */
export function sfxPlayLeafPlan(opts = {}) {
  const in_ = { ...PLAY_LEAF_INPUT_DEFAULTS, ...opts };
  const gate = i32(in_.gateKind);
  const noSamples = sfxPlayNoSamplesHost(gate);
  const preload = sfxPlayPreloadHost(gate);
  const body = (preload !== 0 || sfxPlayBodyHost(gate) !== 0) && i32(in_.windowOpen) !== 0 ? 1 : 0;
  const chNull = i32(in_.channelNull);
  const allocate = body !== 0 && byte(in_.streamFlag) !== 0 ? 1 : 0;
  const probe = allocate !== 0 ? sfxPlayProbeNeeded(chNull) : 0;
  const reset = allocate !== 0 ? sfxPlayResetNeeded(chNull, in_.probeAlive) : 0;
  const setLoop = body !== 0 ? sfxPlaySetLoopNeeded(chNull) : 0;
  const setPitch = body !== 0 ? sfxPlaySetPitchNeeded(chNull) : 0;
  const setVolume = body !== 0 ? sfxPlaySetVolumeNeeded(chNull) : 0;
  const start = body !== 0 ? sfxPlayStartNeeded(chNull) : 0;
  const panAction = body !== 0
    ? sfxChannelPanAction(chNull, in_.channelCount, f32(in_.pan))
    : SFX_PAN_ACTION_NONE;
  let calls = 0;
  if (allocate !== 0) {
    calls += 3; /* create + assign + release */
    calls += probe;
    calls += reset;
  }
  calls += setLoop + setPitch + setVolume + start;
  if (body !== 0) calls += 1; /* 0xa2ac20 pan wrapper */
  const pureComplete = noSamples === 0 && preload === 0 && calls === 0 ? 1 : 0;
  return {
    noSamplesHost: noSamples,
    preloadHost: preload,
    bodyReached: body,
    allocateNeeded: allocate,
    probeNeeded: probe,
    resetNeeded: reset,
    streamNamePtr: allocate !== 0
      ? sfxPlayStreamNamePtr(in_.nameCap, in_.nameInline, in_.nameHeap) >>> 0
      : 0,
    setLoopNeeded: setLoop,
    setPitchNeeded: setPitch,
    setVolumeNeeded: setVolume,
    startNeeded: start,
    pendingWord: start !== 0 ? 1 : 0,
    panAction,
    deviceCalls: calls,
    pureComplete,
    hostNeeded: pureComplete === 0 ? 1 : 0,
  };
}

/* ---------- SC: SoundEffects::ClearVolumeModifier ---------- */

/** An empty table returns before touching anything. */
export function sfxClearVolumeWalkEnter(spanBytes) {
  return sfxEntryCount(spanBytes) !== 0;
}

/** A voice-less entry is skipped silently â€” no warning, unlike the mutators. */
export function sfxClearVolumeEntryOpen(voices190) {
  return u32(voices190) !== 0;
}

/** The enabled flag is consulted once per voice, not once per entry. */
export function sfxClearVolumeVoiceEnabled(enabled198) {
  return byte(enabled198) !== 0;
}

/* ---------- SQ: is-playing probe 0x0092e560 (v2) ---------- */

/** Where the walk's cursor lands for voice `index` of entry `entryOffset`. */
export function sfxProbeVoiceChannelOffset(entryOffset, index) {
  return (u32(entryOffset) + u32(Math.imul(i32(index), SFX_VOICE_STRIDE)) +
    SFX_VOICE_BASE_OFF) | 0;
}

export function sfxProbeVoicePendingOffset(entryOffset, index) {
  return (u32(entryOffset) + u32(Math.imul(i32(index), SFX_VOICE_STRIDE)) +
    SFX_VOICE_BASE_OFF + SFX_VOICE_OFF_PENDING_09) | 0;
}

/**
 * A voice with no channel object costs nothing. Otherwise the activity probe
 * runs once, or twice when the pending flag was set on entry.
 */
export function sfxProbeVoiceProbeCalls(channelNull, pending09) {
  if (i32(channelNull) !== 0) return 0;
  return byte(pending09) !== 0 ? 2 : 1;
}

/** Anything short of a live entry answers without consulting the device. */
export function sfxIsPlayingKnown(gateKind) {
  return i32(gateKind) !== SFX_GATE_LIVE;
}

/** All of those early exits share one return path, and it reports false. */
export function sfxIsPlayingShortCircuitResult(gateKind) {
  void gateKind;
  return 0;
}

/**
 * Walk the query's voice loop. The per-voice test is the same one the
…
 */
export function sfxIsPlayingWalk(gateKind, samples, count) {
  const out = {
    gateKind: i32(gateKind),
    result: 0,
    knownWithoutHost: true,
    voicesVisited: 0,
    probeCalls: 0,
    firstActiveIndex: -1,
    pendingClearMask: 0,
    pureComplete: true,
  };
  if (i32(gateKind) !== SFX_GATE_LIVE) {
    out.result = sfxIsPlayingShortCircuitResult(gateKind);
    return out;
  }
  const n = (!samples || i32(count) < 0) ? 0 : i32(count);
  for (let i = 0; i < n; i++) {
    const s = samples[i];
    out.voicesVisited++;
    out.probeCalls += sfxProbeVoiceProbeCalls(s.channelNull, s.pending09);
    if (i32(s.channelNull) === 0 && byte(s.pending09) !== 0 && s.probeFirst) {
      if (i < 32) out.pendingClearMask |= (1 << i) >>> 0;
    }
    if (sfxVoiceAct(s.channelNull, s.pending09, s.probeFirst, s.probeSecond)) {
      out.result = 1;
      out.firstActiveIndex = i;
      break;
    }
  }
  out.knownWithoutHost = out.probeCalls === 0;
  out.pureComplete = out.probeCalls === 0 && out.pendingClearMask === 0;
  return out;
}

/* ---------- SW: 16-bit stores over two byte fields (v2) ---------- */

/** A word store lands on two adjacent byte fields, low byte first. */
export function sfxWordStoreLo(word) {
  return u32(word) & 0xff;
}

export function sfxWordStoreHi(word) {
  return (u32(word) >>> 8) & 0xff;
}

/* ---------- SR / SN: channel wrapper reset + assign (v2) ---------- */

/** The fixed state both wrapper helpers install before touching the device. */
export function sfxChannelResetDefaults() {
  return {
    loop08: sfxWordStoreLo(SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD),
    pending09: sfxWordStoreHi(SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD),
    flag0a: SFX_CHANNEL_DEFAULT_FLAG_0A,
    volume0c: f32FromBits(SFX_CHANNEL_DEFAULT_VOLUME_BITS),
    pan10: f32FromBits(SFX_CHANNEL_DEFAULT_PAN_BITS),
    pitch14: f32FromBits(SFX_CHANNEL_DEFAULT_PITCH_BITS),
  };
}

/** The old channel is let go before any field is rewritten. */
export function sfxChannelResetReleaseFirst() {
  return true;
}

/**
 * The assign helper resets first, then attaches, then replays the fields it
 * just wrote to the new channel. Because the attach only exchanges the two
 * pointer slots, those replayed values are exactly the reset constants.
 */
export function sfxChannelAssignPlan(channelNullAfterAttach) {
  const defaults = sfxChannelResetDefaults();
  return {
    releaseNeeded: sfxChannelResetReleaseFirst(),
    attachNeeded: true,
    deviceCalls: i32(channelNullAfterAttach) !== 0 ? 0 : 4,
    setLoopArg: defaults.loop08,
    setVolumeArg: defaults.volume0c,
    setPanArg: defaults.pan10,
    setPitchArg: defaults.pitch14,
  };
}

/* ---------- v32: the [entry+0x20] stream state machine (wave-25 F14
   census; notes sfx-v32-stream) ----------
   Whole-.text may-dataflow census (census-sfx-stream.py): the channel
   slot [entry+0x20+i*0x38] has EXACTLY five writer sites in four bodies
   (0xa2a9bc/0xa2aa29 dword-zero in the wrapper default ctor 0xa2a990,
   0xa2aee1 arg echo in the release 0xa2ae60, 0x8f2cd8 attach pair-swap,
   0xa2ad39 copy-assign pair-swap); zero direct stores elsewhere; the
   stream object is OPAQUE (0 stores, one direct +0xc read pair pinned
   v31/v2). Value state machine: FRESH/RESET/DTOR -> channel 0
   (constant stores / release arg 0); ATTACH/COPY -> runtime device
   handle. Verdict: RUNTIME-MUTABLE -> the 0x92e300 vtbl slots
   (+0x38/+0x44/+0x3c) cannot fold; record idx 1 stays NARROWED (49).

   Oracular transcription: branch-by-branch from the fresh dumps
   cpu-dump/00a2a990.txt (wrapper ctor), 00a2ae60.txt (release),
   0092cea0.txt (entry ctor), 0092ce30.txt (slot ctor), 008f2c90.txt
   (attach) — NOT derived from the cpp. The release probe byte is
   masked & 0xff inside (vtbl[0xc] `test al,al`); release_arg and
   old_secondary/hook_ptr are FULL dwords. */

export const SFX_CHANNEL_CTOR_VA_A2A990 = 0x00a2a990;
export const SFX_CHANNEL_CTOR_CHANNEL_STORE1_VA_A2A9BC = 0x00a2a9bc;
export const SFX_CHANNEL_CTOR_CHANNEL_STORE2_VA_A2AA29 = 0x00a2aa29;
export const SFX_CHANNEL_CTOR_ZERO_STORES_2 = 2;
export const SFX_CHANNEL_CTOR_SECONDARY_ALLOC_18 = 0x18;
export const SFX_CHANNEL_CTOR_SECONDARY_VTABLE_B9C430 = 0x00b9c430;
export const SFX_CHANNEL_CTOR_SECONDARY_ZEROED_FIRST = 1;
export const SFX_RELEASE_VA_A2AE60 = 0x00a2ae60;
export const SFX_RELEASE_CHANNEL_STORE_VA_A2AEE1 = 0x00a2aee1;
export const SFX_RELEASE_SECONDARY_STORE_VA_A2AEE3 = 0x00a2aee3;
export const SFX_RELEASE_SECONDARY_ALLOC_18 = 0x18;
export const SFX_RELEASE_SECONDARY_VTABLE_B9C430 = 0x00b9c430;
export const SFX_RELEASE_ARG_ECHO_OFF_14 = 0x14;
export const SFX_RELEASE_PROBE_SLOT_0C = 0x0c;
export const SFX_RELEASE_HOOK_GLOBAL_C7F484 = 0x00c7f484;
export const SFX_ENTRY_CTOR_VA_92CEA0 = 0x0092cea0;
export const SFX_ENTRY_CTOR_FRAME_END_STORE_VA_92CEBC = 0x0092cebc;
export const SFX_ENTRY_CTOR_FRAME_END_NEG1 = 0xffffffff;
export const SFX_ENTRY_CTOR_VOICES_0 = 0;
export const SFX_ENTRY_CTOR_ENABLED_0 = 0;
export const SFX_ENTRY_CTOR_STRING_CAP_0F = 0x0f;
export const SFX_ENTRY_CTOR_VOICE_SLOTS_7 = 7;
export const SFX_SLOT_CTOR_VA_92CE30 = 0x0092ce30;
export const SFX_SLOT_CTOR_STREAM_BYTE_STORE_VA_92CE7F = 0x0092ce7f;
export const SFX_SLOT_CTOR_FIELD_1C_STORE_VA_92CE85 = 0x0092ce85;
export const SFX_SLOT_CTOR_FIELD_1C_DEFAULT_1 = 1;

/**
 * Wrapper default ctor 0xa2a990 (NULL BY CONSTRUCTION): channel = 0 via
 * two explicit dword-zero stores (0xa2a9bc/0xa2aa29), secondary = fresh
 * 0x18 heap object with .rdata vtable 0xb9c430 (host alloc), then the
 * shared constant pack. 0 inputs — the immutable construction state.
 */
export function sfxChannelCtorDefaults() {
  return {
    channel00After: 0,
    secondary04Alloc: 1,
    secondary04Vtable: SFX_CHANNEL_CTOR_SECONDARY_VTABLE_B9C430,
    loopPending08After: sfxWordStoreLo(SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD),
    flag0aAfter: SFX_CHANNEL_DEFAULT_FLAG_0A,
    volume0cAfter: f32FromBits(SFX_CHANNEL_DEFAULT_VOLUME_BITS),
    pan10After: f32FromBits(SFX_CHANNEL_DEFAULT_PAN_BITS),
    pitch14After: f32FromBits(SFX_CHANNEL_DEFAULT_PITCH_BITS),
  };
}

/**
 * Release 0xa2ae60: channel := release_arg (FULL-dword echo @0xa2aee1 —
 * reset/slot-dtor/clear pass 0 so the slot stays null; assign passes the
 * runtime handle), secondary := fresh 0x18 object (vtable 0xb9c430, arg
 * echoed at +0x14), and the OLD-secondary hook gate (old != 0 FULL word,
 * vtbl[0xc] probe LOW BYTE (test al,al — 0x100/0x1ff answer "no"),
 * hook ptr 0xc7f484 FULL word) — the v22 island-A gate shape.
 */
export function sfxChannelReleasePlan(releaseArg, oldSecondary04, probeResult,
    hookPtr) {
  const oldNonzero = u32(oldSecondary04) !== 0 ? 1 : 0;
  const probeAlive = (u32(probeResult) & 0xff) !== 0 ? 1 : 0;
  const hookInstalled = u32(hookPtr) !== 0 ? 1 : 0;
  return {
    channel00After: i32(releaseArg),
    secondary04Alloc: 1,
    secondary04Vtable: SFX_RELEASE_SECONDARY_VTABLE_B9C430,
    argEcho14: i32(releaseArg),
    hookProbeRuns: oldNonzero,
    hookRuns: oldNonzero !== 0 && probeAlive !== 0 && hookInstalled !== 0 ? 1 : 0,
  };
}

/**
 * SoundEffect default ctor 0x92cea0: entry[4] := 0xffffffff (the -1
 * frame-end DEFAULT — fresh entries already carry the sentinel; this is
 * why StopAll 0x92e300 has NO `mov [entry+4],-1`), voices := 0,
 * enabled := 0, entry string SSO (cap 0xf), all seven voice slots built
 * via 0x92ce30 -> 0xa2a990 (every channel null, stream bytes 0).
 * 0 inputs.
 */
export function sfxEntryCtorDefaults() {
  return {
    frameEnd04After: -1, /* i32 of 0xffffffff */
    voices190After: SFX_ENTRY_CTOR_VOICES_0,
    enabled198After: SFX_ENTRY_CTOR_ENABLED_0,
    entryStringCap: SFX_ENTRY_CTOR_STRING_CAP_0F,
    voiceSlots: SFX_ENTRY_CTOR_VOICE_SLOTS_7,
    channelsNull: SFX_ENTRY_CTOR_VOICE_SLOTS_7,
    streamBytesZero: SFX_ENTRY_CTOR_VOICE_SLOTS_7,
  };
}

/* ---------- v33: SoundEffect::Load (0x92cfb0) load-arm gates (wave-26
   F14; notes sfx-v33-load; census-sfx-load.py) ----------
   Oracular transcription from the fresh dump cpu-dump/0092cfb0.txt —
   NOT derived from the cpp. Entry gate 0x92cfe0 `cmp dword
   [esi+0x190],0 ; jbe 0x92d10f` (UNSIGNED, full dword; 0 is the only
   skip value); per-voice arm 0x92d023..0x92d0c7 — FATAL when the
   resolved size borrows below 4 (`lea ecx,[eax-4] ; cmp eax,ecx ; jb
   0x92d138`, size==4 NOT fatal), STREAM when the ".ogg" 4-byte compare
   (0x92d052) returns 0 (al=1 — the vtbl[0x24] device open is skipped
   ENTIRELY), DEVICE otherwise (open + assign + vtbl[0xc] probe + hook
   run, al=0). Cold tails typed-host, single-inbound (census): abort
   0x92d132 -> IAT 0xb18894 (sole source 0x92d0ea ja, big-alloc slack
   > 0x1f UNSIGNED); fatal 0x92d138 -> 0x499950 (sole source 0x92d028
   jb); enable 0x92d10f (2 sources: 0x92cfee jbe + 0x92d109 fall). */

export const SFX_LOAD_ENTRY_GATE_SKIP = 0;
export const SFX_LOAD_ENTRY_GATE_LOOP = 1;
export const SFX_LOAD_ARM_FATAL = 0;
export const SFX_LOAD_ARM_STREAM = 1;
export const SFX_LOAD_ARM_DEVICE = 2;
export const SFX_LOAD_TAIL_ABORT_VA_92D132 = 0x0092d132;
export const SFX_LOAD_TAIL_FATAL_VA_92D138 = 0x0092d138;
export const SFX_LOAD_TAIL_ABORT_IAT_B18894 = 0x00b18894;
export const SFX_LOAD_TAIL_FATAL_CALLEE_499950 = 0x00499950;
export const SFX_LOAD_TAIL_ABORT_SOURCE_D0EA = 0x0092d0ea;
export const SFX_LOAD_TAIL_FATAL_SOURCE_D028 = 0x0092d028;
export const SFX_LOAD_TAIL_ENABLE_VA_D10F = 0x0092d10f;
export const SFX_LOAD_TAIL_ENABLE_SOURCES_2 = 2;
export const SFX_LOAD_TAIL_COUNT_2 = 2;

/** Entry gate 0x92cfe0/0x92cfee: LOOP when the full voices dword is
    nonzero (unsigned jbe test), SKIP on 0 — skip still enables. */
export function sfxLoadEntryGate(voices190) {
  return u32(voices190) !== 0 ? SFX_LOAD_ENTRY_GATE_LOOP
                              : SFX_LOAD_ENTRY_GATE_SKIP;
}

/**
 * Per-voice load-arm decision. FATAL: resolved_size < 4 (unsigned
 * borrow; 4 itself passes; 0xffffffff passes) — 0x499950, nothing
 * below happens. STREAM: ".ogg" compare returns 0 — al=1 and the
 * device open is skipped ENTIRELY. DEVICE: compare != 0 — vtbl[0x24]
 * open + assign + probe + hook run, al=0. Composes the v3 primitives.
 */
export function sfxLoadArmPlan(resolvedSize, capacity, suffixCompareResult) {
  const fatal = sfxLoadPathLenFatal(resolvedSize);
  const oggMatch = !fatal && i32(suffixCompareResult) === 0;
  const arm = fatal ? SFX_LOAD_ARM_FATAL
    : oggMatch ? SFX_LOAD_ARM_STREAM : SFX_LOAD_ARM_DEVICE;
  const heap = sfxLoadUsesHeapBuffer(capacity);
  return {
    armKind: arm,
    fatal: fatal ? 1 : 0,
    oggMatch: oggMatch ? 1 : 0,
    fileOpenNeeded: arm === SFX_LOAD_ARM_DEVICE ? 1 : 0,
    streamByteValue: fatal ? 0
      : oggMatch ? SFX_LOAD_STREAM_BYTE_STREAM : SFX_LOAD_STREAM_BYTE_STATIC,
    usesHeapBuffer: heap ? 1 : 0,
    heapFreeNeeded: fatal ? 0 : (heap ? 1 : 0),
    suffixCompareNeeded: fatal ? 0 : 1,
  };
}

/** 0x92d132 — the abort IAT stub (typed-host). */
export function sfxLoadTailAbortVa() {
  return SFX_LOAD_TAIL_ABORT_VA_92D132;
}

/** 0x92d138 — the fatal tail (typed-host). */
export function sfxLoadTailFatalVa() {
  return SFX_LOAD_TAIL_FATAL_VA_92D138;
}

/** 0xb18894 — the abort IAT slot called from 0x92d132. */
export function sfxLoadTailAbortIatVa() {
  return SFX_LOAD_TAIL_ABORT_IAT_B18894;
}

/** 0x499950 — the fatal callee called from 0x92d138 (18 E8 sites
    image-wide; Load's is the only one through 0x92d138). */
export function sfxLoadTailFatalCalleeVa() {
  return SFX_LOAD_TAIL_FATAL_CALLEE_499950;
}

/** 0x92d0ea — the SOLE inbound of 0x92d132 (`ja` — big-alloc slack
    (ptr-back-4) > 0x1f, UNSIGNED). */
export function sfxLoadTailAbortSourceVa() {
  return SFX_LOAD_TAIL_ABORT_SOURCE_D0EA;
}

/** 0x92d028 — the SOLE inbound of 0x92d138 (`jb` — resolved size < 4). */
export function sfxLoadTailFatalSourceVa() {
  return SFX_LOAD_TAIL_FATAL_SOURCE_D028;
}

/** 0x92d10f — the enabled:=1 tail. */
export function sfxLoadTailEnableVa() {
  return SFX_LOAD_TAIL_ENABLE_VA_D10F;
}

/** 2 — the enable tail's inbound edges: the 0x92cfee jbe (entry gate)
    and the 0x92d109 loop-exit fallthrough. */
export function sfxLoadTailEnableInbounds() {
  return SFX_LOAD_TAIL_ENABLE_SOURCES_2;
}

/** 2 — cold tails (abort + fatal), both typed-host. */
export function sfxLoadTailCount() {
  return SFX_LOAD_TAIL_COUNT_2;
}

/* ---------- v34: audio-wrapper 0xa2b1e0 suffix/arm gates (wave-27
   F14; notes sfx-v34-wrapper; census-sfx-wrapper.py) ----------
   Oracular transcription from the byte-exact body listing (NOT derived
   from the cpp). Slot +0x28 of three manager vtables (0xb9c4d8 /
   0xba3068 / 0xba30ac), ret 0x10 @0xa2b779, 98 jcc/call edges, 0 direct
   callers. The suffix decision runs through the runtime-resolved
   audio-API slot 0xb18770 (20 sites image-wide; typed host) as a
   2-arg fn(name, literal): NON-ZERO = "literal present in the name"
   -> the stage's arms; ZERO -> next literal; all-zero -> the unknown
   arm (log 8 'Unknown sound type'). The ".ogg" literal 0xb7b1bc has
   exactly 2 imm refs image-wide: Load 0x92d048 + wrapper 0xa2b3e9.
   Mode dispatch 0xa2b360: FULL dword compares, 0 -> sample arms
   (0xa9fa20 ctor), 1 -> stream arms (0xaa0110 ctor), else the error
   tail (log 1 'Failed to open %s "%s"' with 'sample'/'stream' chosen
   by test ebx,ebx ; cmovne). Gates: init `test al,1` on [this+4]
   (LOW BYTE; 0x100 is NOT initialized), byte gate on a4
   `cmp byte [ebp+0x14],0` (0x100 -> 0), chain gate (vtbl28 result
   FULL dword zero OR byte gate), name-copy gate `test edi,edi`
   (NULL skips strlen/alloc/strcpy/hash). ALL byte gates are
   uint32_t + & 0xff — no uint8_t. */

export const SFX_WRAPPER_VA_A2B1E0 = 0x00a2b1e0;
export const SFX_WRAPPER_END_VA_A2B779 = 0x00a2b779;
export const SFX_WRAPPER_RET_IMM = 0x10;
export const SFX_WRAPPER_BODY_EDGES = 98;
export const SFX_WRAPPER_FNPTR_SLOT_B18770 = 0x00b18770;
export const SFX_WRAPPER_FNPTR_SLOT_PAIR_6C = 0x00b1876c;
export const SFX_WRAPPER_FNPTR_SITES = 20;
export const SFX_WRAPPER_FNPTR_THUNK_AF05D9 = 0x00af05d9;
export const SFX_WRAPPER_DIRECT_CALLERS = 0;
export const SFX_WRAPPER_VTABLE_SLOT = 0x28;
export const SFX_WRAPPER_VTABLE_B9C4D8 = 0x00b9c4d8;
export const SFX_WRAPPER_VTABLE_BA3068 = 0x00ba3068;
export const SFX_WRAPPER_VTABLE_BA30AC = 0x00ba30ac;
export const SFX_WRAPPER_VTABLE_SLOT_SITES = 3;
export const SFX_WRAPPER_OFF_FLAGS_04 = 4;
export const SFX_WRAPPER_FLAG_BIT_INIT = 1;
export const SFX_WRAPPER_INIT_GATE_SITES_2 = 2;
export const SFX_WRAPPER_WAV_LITERAL_VA = 0x00b9c448;
export const SFX_WRAPPER_ORG_LITERAL_VA = 0x00b9c4b0;
export const SFX_WRAPPER_LIT_UNKNOWN_TYPE = 0x00b9c478;
export const SFX_WRAPPER_LIT_FAILED_OPEN = 0x00b9c4b8;
export const SFX_WRAPPER_LIT_SAMPLE = 0x00b7b168;
export const SFX_WRAPPER_LIT_STREAM = 0x00b9c4d0;
export const SFX_WRAPPER_LOG_LEVEL_UNKNOWN_TYPE = 8;
export const SFX_WRAPPER_LOG_LEVEL_FAILED_OPEN = 1;
export const SFX_WRAPPER_OGG_LITERAL_SHARE_SITES = 2;
export const SFX_WRAPPER_OGG_LITERAL_LOAD_SITE_D048 = 0x0092d048;
export const SFX_WRAPPER_OGG_LITERAL_WRAPPER_SITE_A2B3E9 = 0x00a2b3e9;
export const SFX_WRAPPER_HOOK_GATES = 4;
export const SFX_WRAPPER_SELF_DISPATCH_SITE_A2B2CF = 0x00a2b2cf;
export const SFX_WRAPPER_SECONDARY_ALLOC_18 = 0x18;
export const SFX_WRAPPER_SECONDARY_CTOR_40CC10 = 0x0040cc10;
export const SFX_WRAPPER_SECONDARY_VTABLE_B9C430 = 0x00b9c430;
export const SFX_WRAPPER_PAIR_MOVE_A2BD60_CALLERS = 1;
export const SFX_WRAPPER_MODE_SAMPLE = 0;
export const SFX_WRAPPER_MODE_STREAM = 1;
export const SFX_WRAPPER_MODE_OTHER = 2;
export const SFX_WRAPPER_SUFFIX_WAV = 0;
export const SFX_WRAPPER_SUFFIX_OGG = 1;
export const SFX_WRAPPER_SUFFIX_ORG = 2;
export const SFX_WRAPPER_SUFFIX_NONE = 3;
export const SFX_WRAPPER_ARM_WAV_SAMPLE = 0;
export const SFX_WRAPPER_ARM_WAV_STREAM = 1;
export const SFX_WRAPPER_ARM_OGG_SAMPLE = 2;
export const SFX_WRAPPER_ARM_OGG_STREAM = 3;
export const SFX_WRAPPER_ARM_ORG_SAMPLE = 4;
export const SFX_WRAPPER_ARM_ORG_STREAM = 5;
export const SFX_WRAPPER_ARM_UNKNOWN = 6;
export const SFX_WRAPPER_ARM_INVALID_MODE = 7;
export const SFX_WRAPPER_ARM_COUNT = 8;
export const SFX_WRAPPER_ARM_WAV_SAMPLE_ALLOC = 0x64;
export const SFX_WRAPPER_ARM_WAV_STREAM_ALLOC = 0xa8;
export const SFX_WRAPPER_ARM_OGG_SAMPLE_ALLOC = 0x58;
export const SFX_WRAPPER_ARM_OGG_STREAM_ALLOC = 0xc4;
export const SFX_WRAPPER_ARM_ORG_SAMPLE_ALLOC = 0x4c;
export const SFX_WRAPPER_ARM_ORG_STREAM_ALLOC = 0x20740;
export const SFX_WRAPPER_CTOR_SAMPLE_A9FA20 = 0x00a9fa20;
export const SFX_WRAPPER_CTOR_STREAM_AA0110 = 0x00aa0110;
export const SFX_WRAPPER_VTABLE_WAV_SAMPLE_BA2974 = 0x00ba2974;
export const SFX_WRAPPER_VTABLE_WAV_STREAM_BA29E4 = 0x00ba29e4;
export const SFX_WRAPPER_VTABLE_OGG_SAMPLE_BAAAA4 = 0x00ba2aa4;
export const SFX_WRAPPER_VTABLE_OGG_STREAM_BA2B50 = 0x00ba2b50;
export const SFX_WRAPPER_VTABLE_ORG_SAMPLE_BA2BEC = 0x00ba2bec;
export const SFX_WRAPPER_VTABLE_ORG_STREAM_BA2C5C = 0x00ba2c5c;

/** Init gate 0xa2b217/0xa2b231 `mov eax,[this+4] ; test al,1 ; jne
    loaded`: the LOW BYTE of the flags dword is read (al), bit 0
    tested. 0x100 -> low byte 0 -> NOT initialized. Two reads of the
    same dword, one decision (the log arm re-tests). */
export function sfxWrapperInitGate(flags) {
  return (u32(flags) & 0xff) & SFX_WRAPPER_FLAG_BIT_INIT
    ? 1 : 0;
}

/** Byte gate 0xa2b2e3 `cmp byte [ebp+0x14],0 ; jne 0xa2b347`: the a4
    word's LOW BYTE forces the suffix chain (0x100 -> 0). */
export function sfxWrapperByteGate(a4) {
  return (u32(a4) & 0xff) !== 0 ? 1 : 0;
}

/** Chain gate: suffix chain iff vtbl28 result is 0 (FULL dword test
    0xa2b2df) OR byte_gate(a4); else the normal-return path
    (0xa2b2e9 adopt + hook). */
export function sfxWrapperChainGate(vtbl28Result, a4) {
  return u32(vtbl28Result) === 0 || sfxWrapperByteGate(a4) !== 0
    ? 1 : 0;
}

/** Mode dispatch 0xa2b360..0xa2b36a — FULL dword compares: 0 sample,
    1 stream, else the error tail (0x100 is OTHER). */
export function sfxWrapperMode(mode) {
  if (i32(mode) === 0) return SFX_WRAPPER_MODE_SAMPLE;
  if (i32(mode) === 1) return SFX_WRAPPER_MODE_STREAM;
  return SFX_WRAPPER_MODE_OTHER;
}

/** Error tail 0xa2b5ff `test ebx,ebx ; cmovne`: mode != 0 -> 0xb9c4d0
    'stream', else 0xb7b168 'sample'. */
export function sfxWrapperModeLogKind(mode) {
  return i32(mode) !== 0 ? SFX_WRAPPER_LIT_STREAM : SFX_WRAPPER_LIT_SAMPLE;
}

/** The fn-ptr compare's decision bit (0xa2b358 test eax,eax ; je
    next): NON-ZERO = the literal is present in the name. */
export function sfxWrapperSuffixMatch(compareResult) {
  return i32(compareResult) !== 0 ? 1 : 0;
}

/** Stage chain: first non-zero bit wins (stage 1 dispatches BEFORE
    the .ogg compare runs), NONE when all three are zero. */
export function sfxWrapperSuffixKind(hasWav, hasOgg, hasOrg) {
  if (u32(hasWav) !== 0) return SFX_WRAPPER_SUFFIX_WAV;
  if (u32(hasOgg) !== 0) return SFX_WRAPPER_SUFFIX_OGG;
  if (u32(hasOrg) !== 0) return SFX_WRAPPER_SUFFIX_ORG;
  return SFX_WRAPPER_SUFFIX_NONE;
}

/** Eight-way arm: kind*2 + mode for the six construction arms;
    UNKNOWN ignores mode; INVALID_MODE when mode not in {0,1}. */
export function sfxWrapperArm(hasWav, hasOgg, hasOrg, mode) {
  const kind = sfxWrapperSuffixKind(hasWav, hasOgg, hasOrg);
  if (kind === SFX_WRAPPER_SUFFIX_NONE) return SFX_WRAPPER_ARM_UNKNOWN;
  const modeKind = sfxWrapperMode(mode);
  if (modeKind === SFX_WRAPPER_MODE_OTHER) return SFX_WRAPPER_ARM_INVALID_MODE;
  return kind * 2 + modeKind;
}

/** Full arm plan (host constants per arm; byte gates are uint32_t &
    0xff; the v22 hook islands are consumed by reference). */
export function sfxWrapperArmPlan(hasWav, hasOgg, hasOrg, mode, name) {
  const arm = sfxWrapperArm(hasWav, hasOgg, hasOrg, mode);
  const kind = sfxWrapperSuffixKind(hasWav, hasOgg, hasOrg);
  const modeKind = sfxWrapperMode(mode);
  let allocSize = 0;
  let ctorVa = 0;
  let vtableVa = 0;
  let logLevel = 0;
  let logFormatVa = 0;
  let logKindVa = 0;
  let logNeeded = 0;
  switch (arm) {
    case SFX_WRAPPER_ARM_WAV_SAMPLE:
      allocSize = SFX_WRAPPER_ARM_WAV_SAMPLE_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtableVa = SFX_WRAPPER_VTABLE_WAV_SAMPLE_BA2974;
      break;
    case SFX_WRAPPER_ARM_WAV_STREAM:
      allocSize = SFX_WRAPPER_ARM_WAV_STREAM_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtableVa = SFX_WRAPPER_VTABLE_WAV_STREAM_BA29E4;
      break;
    case SFX_WRAPPER_ARM_OGG_SAMPLE:
      allocSize = SFX_WRAPPER_ARM_OGG_SAMPLE_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtableVa = SFX_WRAPPER_VTABLE_OGG_SAMPLE_BAAAA4;
      break;
    case SFX_WRAPPER_ARM_OGG_STREAM:
      allocSize = SFX_WRAPPER_ARM_OGG_STREAM_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtableVa = SFX_WRAPPER_VTABLE_OGG_STREAM_BA2B50;
      break;
    case SFX_WRAPPER_ARM_ORG_SAMPLE:
      allocSize = SFX_WRAPPER_ARM_ORG_SAMPLE_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtableVa = SFX_WRAPPER_VTABLE_ORG_SAMPLE_BA2BEC;
      break;
    case SFX_WRAPPER_ARM_ORG_STREAM:
      allocSize = SFX_WRAPPER_ARM_ORG_STREAM_ALLOC;
      ctorVa = SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtableVa = SFX_WRAPPER_VTABLE_ORG_STREAM_BA2C5C;
      break;
    case SFX_WRAPPER_ARM_UNKNOWN:
      logNeeded = 1;
      logLevel = SFX_WRAPPER_LOG_LEVEL_UNKNOWN_TYPE;
      logFormatVa = SFX_WRAPPER_LIT_UNKNOWN_TYPE;
      break;
    case SFX_WRAPPER_ARM_INVALID_MODE:
      logNeeded = 1;
      logLevel = SFX_WRAPPER_LOG_LEVEL_FAILED_OPEN;
      logFormatVa = SFX_WRAPPER_LIT_FAILED_OPEN;
      logKindVa = sfxWrapperModeLogKind(mode);
      break;
    default:
      break;
  }
  const stages = kind === SFX_WRAPPER_SUFFIX_WAV ? 1
    : kind === SFX_WRAPPER_SUFFIX_OGG ? 2 : 3;
  return {
    arm,
    suffixKind: kind,
    modeKind,
    validMode: modeKind !== SFX_WRAPPER_MODE_OTHER ? 1 : 0,
    compareStages: stages,
    allocNeeded: allocSize !== 0 ? 1 : 0,
    allocSize,
    ctorVa,
    vtableVa,
    logNeeded,
    logLevel,
    logFormatVa,
    logKindVa,
    nameCopyNeeded: u32(name) !== 0 ? 1 : 0,
    hashCallRuns: u32(name) !== 0 ? 1 : 0,
  };
}

/** Name-copy gate 0xa2b625 `test edi,edi ; jne copy`: NULL skips
    strlen/alloc/strcpy (IAT 0xb1893c) and the 0xa159d0 hash call. */
export function sfxWrapperNameCopyNeeded(name) {
  return u32(name) !== 0 ? 1 : 0;
}

/** Census pins (corrected tooling; notes sfx-v34-wrapper). */
export function sfxWrapperVa() { return SFX_WRAPPER_VA_A2B1E0; }
export function sfxWrapperRetImm() { return SFX_WRAPPER_RET_IMM; }
export function sfxWrapperBodyEdges() { return SFX_WRAPPER_BODY_EDGES; }
export function sfxWrapperDirectCallers() { return SFX_WRAPPER_DIRECT_CALLERS; }
export function sfxWrapperVtableSlotSites() { return SFX_WRAPPER_VTABLE_SLOT_SITES; }
export function sfxWrapperFnptrSites() { return SFX_WRAPPER_FNPTR_SITES; }
export function sfxWrapperFnptrThunkVa() { return SFX_WRAPPER_FNPTR_THUNK_AF05D9; }
export function sfxWrapperOggLiteralShareSites() { return SFX_WRAPPER_OGG_LITERAL_SHARE_SITES; }
export function sfxWrapperHookGates() { return SFX_WRAPPER_HOOK_GATES; }
export function sfxWrapperPairMoveCallers() { return SFX_WRAPPER_PAIR_MOVE_A2BD60_CALLERS; }

/* ---------- v35: audio-wrapper cluster rest (wave-28 F11; notes
   sfx-v35-cluster; census-sfx-cluster.py) ----------
   Oracular transcription from the byte-exact body listings (NOT
   derived from the cpp). Sibling slot methods of the SAME three
   manager vtables (0xb9c4d8/0xba3068/0xba30ac) + the shared flag-bit
   family (also in class rows 0xb81a84/0xb82468/0xb82638). All 17
   bodies: 0 E8 callers, 0 imm32 refs (vtable-borne). The flags dword
   at [this+4] is the word the v34 init gate tests; the getters read
   (flags>>bit)&1 via `shr eax,imm ; and al,1` (FULL-dword shift), the
   setters bts/btr on `cmp byte [ebp+8],0` (BYTE gate on the arg), the
   manager bodies OR/AND bit1 unconditionally, the hook pair writes the
   ONLY two 0xc7f484 stores (install 0xa2bb10 + flags|1 + return 1;
   clear 0 + flags&~1), the dtor free gate is `test byte [ebp+8],1`
   (byte bit0, size 0x34), the walk entry gate needs bit0 SET + bit1
   CLEAR (byte reads), the probe keep is the LOW BYTE of the vtbl[0x74]
   result, the forwarders push const 0/1 to vtbl[0x24], and the map
   found gate is a FULL dword result != end. ALL byte gates are
   uint32_t + & 0xff — no uint8_t. */

export const SFX_CLUSTER_DTOR_WRAPPER_VA = 0x00a2af00;
export const SFX_CLUSTER_HOOK_INSTALL_VA = 0x00a2afd0;
export const SFX_CLUSTER_HOOK_CLEAR_VA = 0x00a2b000;
export const SFX_CLUSTER_WALK_VA = 0x00a2b050;
export const SFX_CLUSTER_FORWARD0_VA = 0x00a2b180;
export const SFX_CLUSTER_FORWARD1_VA = 0x00a2b1a0;
export const SFX_CLUSTER_FLAG_SET1_VA = 0x00a2b1c0;
export const SFX_CLUSTER_FLAG_CLEAR1_VA = 0x00a2b1d0;
export const SFX_FLAG_GET1_VA = 0x00a135c0;
export const SFX_FLAG_SET2_VA = 0x00a135d0;
export const SFX_FLAG_GET2_VA = 0x00a13600;
export const SFX_FLAG_SET3_VA = 0x00a13610;
export const SFX_FLAG_GET3_VA = 0x00a13640;
export const SFX_FLAG_SET4_VA = 0x00a13650;
export const SFX_FLAG_GET4_VA = 0x00a13680;
export const SFX_CLUSTER_MAP_VA = 0x00a2b7f0;
export const SFX_CLUSTER_INIT_WALK_VA = 0x00a2b990;
export const SFX_CLUSTER_BODY_COUNT = 17;
export const SFX_CLUSTER_DIRECT_CALLERS = 0;
export const SFX_FLAG_FAMILY_VTABLE_ROWS = 6;
export const SFX_HOOK_GLOBAL = 0x00c7f484;
export const SFX_HOOK_INSTALL_TARGET = 0x00a2bb10;
export const SFX_HOOK_WRITE_SITES = 2;
export const SFX_HOOK_INSTALL_SITE = 0x00a2afeb;
export const SFX_HOOK_CLEAR_SITE = 0x00a2b004;
export const SFX_DTOR_FREE_SIZE_34 = 0x34;
export const SFX_DTOR_FREE_GATE_SITE = 0x00a2af0b;
export const SFX_WRAPPER_FORWARDER_RET_IMM = 0x0c;
export const SFX_WALK_ENTRY_BIT0 = 1;
export const SFX_WALK_ENTRY_BIT1 = 2;
export const SFX_WALK_BOUND_RELOAD = 1;
export const SFX_MAP_FOUND_BODIES = 2;
export const SFX_INIT_GATE_BODY_SITES = 3;
export const SFX_INIT_GATE_WALK_SITE = 0x00a2b9b8;

/** Flag-bit getter 0xa135c0/0xa13600/0xa13640/0xa13680 `shr eax,imm ;
    and al,1`: (flags >> bit) & 1 — FULL dword shift, the al-mask is
    the return width (NOT an input byte gate: wide flags still report
    their high bits). */
export function sfxFlagBitGet(flags, bit) {
  return (u32(flags) >> (u32(bit) & 31)) & 1;
}

/** BYTE-gated setter 0xa135d0/0xa13610/0xa13650 `cmp byte [ebp+8],0
    ; je clear` then bts/btr: set iff (arg & 0xff) != 0 (0x100 -> 0 ->
    CLEAR arm). */
export function sfxFlagBitSet(flags, bit, arg) {
  const mask = 1 << (u32(bit) & 31);
  return u32((arg & 0xff) !== 0 ? u32(flags) | mask : u32(flags) & ~mask);
}

/** Manager flags bit1 SET 0xa2b1c0 `or dword [ecx+4],2`. */
export function sfxManagerFlagSet1(flags) {
  return u32(u32(flags) | 2);
}

/** Manager flags bit1 CLEAR 0xa2b1d0 `and dword [ecx+4],0xfffffffd`. */
export function sfxManagerFlagClear1(flags) {
  return u32(u32(flags) & ~2);
}

/** Hook install 0xa2afd0 (the ONLY 0xc7f484 writers, census):
    flags|1, hook := 0xa2bb10, return 1. */
export function sfxWrapperHookInstallPlan(flags) {
  return {
    flagsAfter: u32(u32(flags) | 1),
    hookValue: SFX_HOOK_INSTALL_TARGET,
    returnsOne: 1,
  };
}

/** Hook clear 0xa2b000: flags & ~1, hook := 0 (void ret). */
export function sfxWrapperHookClearPlan(flags) {
  return {
    flagsAfter: u32(u32(flags) & ~1),
    hookValue: 0,
  };
}

/** Dtor free gate 0xa2af0b `test byte [ebp+8],1`: free(this, 0x34)
    iff bit0 of the arg's LOW BYTE (0x100 -> 0). */
export function sfxDtorFreeGate(arg) {
  return (u32(arg) & 0xff) & 1;
}

/** Walk entry gate 0xa2b080/0xa2b088: bit0 SET && bit1 CLEAR (BYTE
    reads of the flags dword). */
export function sfxWalkEntryGate(flags) {
  const low = u32(flags) & 0xff;
  return (low & SFX_WALK_ENTRY_BIT0) !== 0 && (low & SFX_WALK_ENTRY_BIT1) === 0
    ? 1 : 0;
}

/** Walk probe keep 0xa2b0d9 `test al,al ; je skip`: the vtbl[0x74]
    probe result's LOW BYTE (0x100 -> 0). */
export function sfxWalkProbeKeep(probeAl) {
  return (u32(probeAl) & 0xff) !== 0 ? 1 : 0;
}

/** Forwarder consts 0xa2b180 `push 0` / 0xa2b1a0 `push 1`. */
export function sfxWrapperForward0Const() { return 0; }
export function sfxWrapperForward1Const() { return 1; }

/** Map find gate 0xa2b853/0xa2b9fe `cmp eax,[esi+8] ; je` — FULL
    dword result != end. */
export function sfxMapFound(result, end) {
  return u32(result) !== u32(end) ? 1 : 0;
}

/** Census pins (corrected tooling; notes sfx-v35-cluster). */
export function sfxClusterDirectCallers() { return SFX_CLUSTER_DIRECT_CALLERS; }
export function sfxClusterBodyCount() { return SFX_CLUSTER_BODY_COUNT; }
export function sfxFlagFamilyVtableRows() { return SFX_FLAG_FAMILY_VTABLE_ROWS; }
export function sfxHookWriteSites() { return SFX_HOOK_WRITE_SITES; }
export function sfxHookInstallTarget() { return SFX_HOOK_INSTALL_TARGET; }
export function sfxDtorFreeSize() { return SFX_DTOR_FREE_SIZE_34; }
export function sfxWalkBoundReload() { return SFX_WALK_BOUND_RELOAD; }
export function sfxInitGateBodySites() { return SFX_INIT_GATE_BODY_SITES; }

/* ---------- v36: map find/construct 0xa2b7f0 + init walk 0xa2b990
   (wave-29 F4; notes sfx-v36-mapwalk; fresh dumps
   cpu-dump/00a2b7f0.txt + 00a2b990.txt) ----------
   Oracular transcription from the full-body listings (NOT derived from
   the cpp). The last two v35-cluster bodies, both vtable-borne (0 E8
   callers, v35 census). Every device/allocator edge stays host (hash
   0xa159d0, map find 0xa12280, adopt 0x8f2d20, alloc 0xa0f4c0, ctor
   0x40cc10, advance 0x414a80, remove 0x415d20, free 0xaef15c, logger
   0xa112c0); the DECISION layer is translated. 0xa2b7f0: `ret 0xc`
   at 0xa2b98d = THREE stack args (the v35 NOTES' "ret 4" came from
   the truncated 129-insn dump and is now corrected); arg3 [ebp+0x10]
   never referenced; arg2 hashed IN PLACE (0xa2b834); arg1 echoed back
   (`mov eax,esi`). FOUND arm (v35 map-found law): adopt1(node+0x14 ->
   pair), island3 probes the adopt pair's second dword, adopt2(arg1).
   CONSTRUCT arm: alloc 0x18 + ctor + [obj+0]=0xb9c430 + [obj+0x14]=0,
   island1 dead-by-construction (probe slot zero-init), island2 probes
   the new secondary, adopt2(arg1). The ebx bit dance makes island2
   construct-only and island3 found-only. 0xa2b990: `ret 4` (ONE stack
   arg, arg1). Init gate at its second body (site 0xa2b9b8): warn
   (level 0x10, fmt 0xb9c450) iff byte bit0 of [this+4] clear, then
   body continues. arg1 == 0 (FULL dword) skips everything including
   the tail. Otherwise vtbl[0xc], key := [arg1+0x10], map find with
   the result landing in the arg slot, node chain walk with FULL dword
   member-key and member-vs-arg1 compares, advance via 0x414a80, found
   arm = remove 0x415d20 + island (probe [node+0x18]) + free(node,
   0x1c), then the vtbl[0x10] tail on every non-NULL path. Byte gates
   are uint32_t & 0xff; pointer/key compares are FULL dword. */

export const SFX_MAP_CONSTRUCT_ARM_FOUND = 0;
export const SFX_MAP_CONSTRUCT_ARM_CONSTRUCT = 1;
export const SFX_INIT_WALK_STEP_MISS = 0;
export const SFX_INIT_WALK_STEP_FOUND = 1;
export const SFX_INIT_WALK_STEP_ADVANCE = 2;
export const SFX_INIT_WALK_STEP_MISMATCH = 3;
export const SFX_MAP_CONSTRUCT_RET_IMM = 0x0c;
export const SFX_MAP_CONSTRUCT_STACK_ARGS = 3;
export const SFX_MAP_CONSTRUCT_ARG3_DEAD = 1;
export const SFX_MAP_CONSTRUCT_VTABLE_ROWS = 3;
export const SFX_MAP_CONSTRUCT_SEH_HANDLER_VA = 0x00b1220f;
export const SFX_MAP_CONSTRUCT_ALLOC_SIZE = 0x18;
export const SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF = 0x14;
export const SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA = 0x00b9c430;
export const SFX_MAP_CONSTRUCT_HASH_SITE = 0x00a2b82f;
export const SFX_MAP_CONSTRUCT_FIND_SITE = 0x00a2b842;
export const SFX_MAP_CONSTRUCT_ADOPT1_SITE = 0x00a2b85f;
export const SFX_MAP_CONSTRUCT_ALLOC_SITE = 0x00a2b885;
export const SFX_MAP_CONSTRUCT_CTOR_SITE = 0x00a2b89f;
export const SFX_MAP_CONSTRUCT_ADOPT2_SITE = 0x00a2b8ff;
export const SFX_MAP_CONSTRUCT_VTABLE_STORE_SITE = 0x00a2b8a4;
export const SFX_MAP_CONSTRUCT_FIELD14_STORE_SITE = 0x00a2b8aa;
export const SFX_MAP_CONSTRUCT_HASH_IN_PLACE_SITE = 0x00a2b834;
export const SFX_MAP_ISLAND1_SITE = 0x00a2b8b9;
export const SFX_MAP_ISLAND2_SITE = 0x00a2b919;
export const SFX_MAP_ISLAND3_SITE = 0x00a2b956;
export const SFX_INIT_WALK_RET_IMM = 4;
export const SFX_INIT_WALK_STACK_ARGS = 1;
export const SFX_INIT_WALK_VTABLE_ROWS = 1;
export const SFX_INIT_WALK_SEH_HANDLER_VA = 0x00af0eb0;
export const SFX_INIT_WALK_WARN_SITE = 0x00a2b9be;
export const SFX_INIT_WALK_WARN_FMT_VA = 0x00b9c450;
export const SFX_INIT_WALK_WARN_LEVEL = 0x10;
export const SFX_INIT_WALK_WARN_STACK_ARGS = 2;
export const SFX_INIT_WALK_MEMBER_OFF = 0x14;
export const SFX_INIT_WALK_KEY_OFF = 0x10;
export const SFX_INIT_WALK_NODE_B_OFF = 0x18;
export const SFX_INIT_WALK_FREE_SIZE = 0x1c;
export const SFX_INIT_WALK_ADVANCE_VA = 0x00414a80;
export const SFX_INIT_WALK_REMOVE_VA = 0x00415d20;
export const SFX_INIT_WALK_FIND_SITE = 0x00a2b9f6;
export const SFX_INIT_WALK_ISLAND_SITE = 0x00a2ba39;
export const SFX_INIT_WALK_FREE_SITE = 0x00a2ba64;
export const SFX_INIT_WALK_TAIL_SITE = 0x00a2ba6c;

/** Init gate at its second body 0xa2b9b8 `test byte [edi+4],1 ; jne`:
    the "not initialized" warn runs iff the flags dword's LOW BYTE has
    bit0 CLEAR; the walk continues either way. */
export function sfxInitWalkWarnNeeded(flags) {
  return ((u32(flags) & 0xff) & 1) === 0 ? 1 : 0;
}

/** Arg gate 0xa2b9d0 `test esi,esi ; je`: arg1 == 0 (FULL dword)
    skips the vtbl[0xc] call, the map find, the walk and the tail
    vtbl[0x10] call. */
export function sfxInitWalkBodyRuns(arg1) {
  return u32(arg1) !== 0 ? 1 : 0;
}

/** One iteration of the member walk (0xa2ba03..0xa2ba20). The
    sentinel head test comes FIRST (no member deref on a sentinel);
    then the member key vs key compare (FULL dword); then member vs
    arg1 (FULL dword); else ADVANCE (host 0x414a80 runs once). */
export function sfxInitWalkStep(nodeIsSentinel, nodeMemberPtr,
                                nodeMemberKey, arg1, key) {
  if (u32(nodeIsSentinel) !== 0) return SFX_INIT_WALK_STEP_MISS;
  if (u32(nodeMemberKey) !== u32(key)) return SFX_INIT_WALK_STEP_MISMATCH;
  if (u32(nodeMemberPtr) === u32(arg1)) return SFX_INIT_WALK_STEP_FOUND;
  return SFX_INIT_WALK_STEP_ADVANCE;
}

/** Found-arm hook island 0xa2ba39: gate stack = [node+0x18] != 0 &&
    (vtbl[0xc] result & 0xff) != 0 && hook != 0 (v22 island shape). */
export function sfxInitWalkIslandHook(foundArmRuns, nodeB, probeAl, hook) {
  if (i32(foundArmRuns) === 0) return 0;
  if (u32(nodeB) === 0 || (u32(probeAl) & 0xff) === 0 || u32(hook) === 0) {
    return 0;
  }
  return 1;
}

/** Construct-arm island 0xa2b919 (probe = the new secondary). */
export function sfxMapConstructIsland2(allocNonnull, probeAl, hook) {
  if (u32(allocNonnull) === 0 || (u32(probeAl) & 0xff) === 0 ||
      u32(hook) === 0) {
    return 0;
  }
  return 1;
}

/** Found-arm island 0xa2b956 (probe = the adopt pair's second dword,
    host-written by 0x8f2d20). */
export function sfxMapConstructIsland3(pair1, probeAl, hook) {
  if (u32(pair1) === 0 || (u32(probeAl) & 0xff) === 0 || u32(hook) === 0) {
    return 0;
  }
  return 1;
}

/** Island1 0xa2b8b9 can never call the hook: its probe slot
    [ebp-0x18] is zero-initialized at 0xa2b87e and not written again
    before the island (the store at 0xa2b8dd is AFTER it). */
export function sfxMapConstructIsland1() {
  return 0;
}

/** Full plan of 0xa2b7f0. find_result/map_end go through the v35
    map-found law; alloc_nonnull, pair1, the two probe bytes and the
    hook are host recaptures. The hash call runs unconditionally on
    arg2 (site 0xa2b82f) and the hash replaces the arg2 slot in place
    (0xa2b834) — recorded as pins, not inputs. */
export function sfxMapConstructPlan({
  findResult = 0,
  mapEnd = 0,
  allocNonNull = 0,
  pair1 = 0,
  probe2Al = 0,
  probe3Al = 0,
  hook = 0,
} = {}) {
  const found = sfxMapFound(findResult, mapEnd);
  const arm = found !== 0 ? SFX_MAP_CONSTRUCT_ARM_FOUND
                          : SFX_MAP_CONSTRUCT_ARM_CONSTRUCT;
  const ctorRuns = arm === SFX_MAP_CONSTRUCT_ARM_CONSTRUCT &&
    u32(allocNonNull) !== 0 ? 1 : 0;
  const island2 = arm === SFX_MAP_CONSTRUCT_ARM_CONSTRUCT
    ? sfxMapConstructIsland2(allocNonNull, probe2Al, hook) : 0;
  const island3 = arm === SFX_MAP_CONSTRUCT_ARM_FOUND
    ? sfxMapConstructIsland3(pair1, probe3Al, hook) : 0;
  return {
    arm,
    found,
    adoptCalls: found !== 0 ? 2 : 1,
    allocCallRuns: arm === SFX_MAP_CONSTRUCT_ARM_CONSTRUCT ? 1 : 0,
    ctorCallRuns: ctorRuns,
    secondaryVtableVa: ctorRuns !== 0
      ? SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA : 0,
    secondaryField14Zero: ctorRuns,
    island1HookRuns: 0,
    island2HookRuns: island2,
    island3HookRuns: island3,
    returnsArg1: 1,
    retImm: SFX_MAP_CONSTRUCT_RET_IMM,
    stackArgs: SFX_MAP_CONSTRUCT_STACK_ARGS,
    arg3Dead: SFX_MAP_CONSTRUCT_ARG3_DEAD,
    allocSize: SFX_MAP_CONSTRUCT_ALLOC_SIZE,
    nodeMemberOffset: SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF,
  };
}

/** Full plan of 0xa2b990. The warn (init gate at its second body) is
    independent of the walk; arg1 == 0 skips everything including the
    tail. The step law covers one iteration; node_b/probe_al/hook gate
    the found-arm island. */
export function sfxInitWalkPlan({
  flags = 0,
  arg1 = 0,
  nodeIsSentinel = 0,
  nodeMemberPtr = 0,
  nodeMemberKey = 0,
  key = 0,
  nodeB = 0,
  probeAl = 0,
  hook = 0,
} = {}) {
  const warn = sfxInitWalkWarnNeeded(flags);
  const body = sfxInitWalkBodyRuns(arg1);
  const step = body !== 0
    ? sfxInitWalkStep(nodeIsSentinel, nodeMemberPtr, nodeMemberKey, arg1, key)
    : SFX_INIT_WALK_STEP_MISS;
  const foundArm = step === SFX_INIT_WALK_STEP_FOUND ? 1 : 0;
  return {
    warnNeeded: warn,
    bodyRuns: body,
    step,
    foundArmRuns: foundArm,
    advanceCalls: step === SFX_INIT_WALK_STEP_ADVANCE ? 1 : 0,
    removeCallRuns: foundArm,
    freeRuns: foundArm,
    freeSize: SFX_INIT_WALK_FREE_SIZE,
    islandHookRuns: sfxInitWalkIslandHook(foundArm, nodeB, probeAl, hook),
    tailSub10CallRuns: body,
    memberOffset: SFX_INIT_WALK_MEMBER_OFF,
    keyOffsetInMember: SFX_INIT_WALK_KEY_OFF,
    keyOffsetInArg: SFX_INIT_WALK_KEY_OFF,
    nodeBOffset: SFX_INIT_WALK_NODE_B_OFF,
    retImm: SFX_INIT_WALK_RET_IMM,
    stackArgs: SFX_INIT_WALK_STACK_ARGS,
    warnLevel: SFX_INIT_WALK_WARN_LEVEL,
    warnFmtVa: SFX_INIT_WALK_WARN_FMT_VA,
    warnStackArgs: SFX_INIT_WALK_WARN_STACK_ARGS,
  };
}

/* v36 census pins (fresh full-body dumps; see notes sfx-v36-mapwalk). */
export function sfxMapConstructRetImm() { return SFX_MAP_CONSTRUCT_RET_IMM; }
export function sfxMapConstructStackArgs() { return SFX_MAP_CONSTRUCT_STACK_ARGS; }
export function sfxMapConstructArg3Dead() { return SFX_MAP_CONSTRUCT_ARG3_DEAD; }
export function sfxMapConstructVtableRows() { return SFX_MAP_CONSTRUCT_VTABLE_ROWS; }
export function sfxMapConstructSehHandlerVa() { return SFX_MAP_CONSTRUCT_SEH_HANDLER_VA; }
export function sfxMapConstructAllocSize() { return SFX_MAP_CONSTRUCT_ALLOC_SIZE; }
export function sfxMapConstructNodeMemberOff() { return SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF; }
export function sfxMapConstructSecondaryVtableVa() { return SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA; }
export function sfxMapConstructHashSite() { return SFX_MAP_CONSTRUCT_HASH_SITE; }
export function sfxMapConstructFindSite() { return SFX_MAP_CONSTRUCT_FIND_SITE; }
export function sfxMapConstructAdopt1Site() { return SFX_MAP_CONSTRUCT_ADOPT1_SITE; }
export function sfxMapConstructAllocSite() { return SFX_MAP_CONSTRUCT_ALLOC_SITE; }
export function sfxMapConstructCtorSite() { return SFX_MAP_CONSTRUCT_CTOR_SITE; }
export function sfxMapConstructAdopt2Site() { return SFX_MAP_CONSTRUCT_ADOPT2_SITE; }
export function sfxMapConstructVtableStoreSite() { return SFX_MAP_CONSTRUCT_VTABLE_STORE_SITE; }
export function sfxMapConstructField14StoreSite() { return SFX_MAP_CONSTRUCT_FIELD14_STORE_SITE; }
export function sfxMapConstructHashInPlaceSite() { return SFX_MAP_CONSTRUCT_HASH_IN_PLACE_SITE; }
export function sfxMapIsland1Site() { return SFX_MAP_ISLAND1_SITE; }
export function sfxMapIsland2Site() { return SFX_MAP_ISLAND2_SITE; }
export function sfxMapIsland3Site() { return SFX_MAP_ISLAND3_SITE; }
export function sfxInitWalkRetImm() { return SFX_INIT_WALK_RET_IMM; }
export function sfxInitWalkStackArgs() { return SFX_INIT_WALK_STACK_ARGS; }
export function sfxInitWalkVtableRows() { return SFX_INIT_WALK_VTABLE_ROWS; }
export function sfxInitWalkSehHandlerVa() { return SFX_INIT_WALK_SEH_HANDLER_VA; }
export function sfxInitWalkWarnSite() { return SFX_INIT_WALK_WARN_SITE; }
export function sfxInitWalkWarnFmtVa() { return SFX_INIT_WALK_WARN_FMT_VA; }
export function sfxInitWalkWarnLevel() { return SFX_INIT_WALK_WARN_LEVEL; }
export function sfxInitWalkWarnStackArgs() { return SFX_INIT_WALK_WARN_STACK_ARGS; }
export function sfxInitWalkMemberOff() { return SFX_INIT_WALK_MEMBER_OFF; }
export function sfxInitWalkKeyOff() { return SFX_INIT_WALK_KEY_OFF; }
export function sfxInitWalkNodeBOff() { return SFX_INIT_WALK_NODE_B_OFF; }
export function sfxInitWalkFreeSize() { return SFX_INIT_WALK_FREE_SIZE; }
export function sfxInitWalkAdvanceVa() { return SFX_INIT_WALK_ADVANCE_VA; }
export function sfxInitWalkRemoveVa() { return SFX_INIT_WALK_REMOVE_VA; }
export function sfxInitWalkFindSite() { return SFX_INIT_WALK_FIND_SITE; }
export function sfxInitWalkIslandSite() { return SFX_INIT_WALK_ISLAND_SITE; }
export function sfxInitWalkFreeSite() { return SFX_INIT_WALK_FREE_SITE; }
export function sfxInitWalkTailSite() { return SFX_INIT_WALK_TAIL_SITE; }

/* ---------- v37: 0xb9c4dc dtor-forest vtable chain census + pure
   dtor laws (wave-30 F4; notes sfx-v37-dtorforest; fresh dumps
   cpu-dump/00a156e0.txt, 00a68440.txt, 00a61a80.txt, 0040cb50.txt,
   0040cbb0.txt, 004149d0.txt, 00a13590.txt, 00a7d260.txt,
   00a7dac0.txt, 00a2bcb0.txt, 00a2bb10.txt) ----------
   Oracular transcription from the fresh listings (NOT derived from
   the cpp): 0xb9c4dc IS the manager vftable (0xb9c4d8 = its RTTI
   locator 0xbb0978; the object vptr is 0xb9c4dc — dtor swap
   0xa2af34). Row tables 0-indexed from the STORED vftable base.
   ALL forest dtor bodies are HOST (0 pure leaves): manager row
   0xa2af00 (v35 gate), shared nested dtor 0xa2af30 (3 wrappers,
   E8 callers 0xa2af06/0xa7d276/0xa7dad6), manager base 0xa61a80,
   member rows 0xa156e0/0xa15730/0xa157c0, member base 0xa68440,
   pair rows 0x40cb50/0x40cbb0, foreign secondaries 0xa7d260/
   0xa7dac0, flag-row [0] 0xa13590 = the byte-gated bit1 SETTER
   (not a dtor — 8th site of the v35 flag-bit-set law), list clear
   0xa2bcb0 (5 E8 callers), hook callable 0xa2bb10. The v35
   dtor_free_gate byte gate now covers EIGHT bodies with free sizes
   0x34/8/8/0x18/0x14/0xc/0x4c/0x64. Host edges: free 0xaef15c,
   runtime release fnptr 0xb18274 (37 reads, 0 writers), block free
   0x4149d0 (the v4 shape BY REFERENCE). Every machine byte read is
   uint32_t + & 0xff; owned-ptr tests and the flags put0 are FULL
   dword ops. */

export const SFX_MANAGER_VFTABLE_VA = 0x00b9c4dc;
export const SFX_MANAGER_VFTABLE_RTTI_VA = 0x00b9c4d8;
export const SFX_NESTED_DTOR_VA = 0x00a2af30;
export const SFX_NESTED_DTOR_SHARED_BODIES = 3;
export const SFX_NESTED_DTOR_E8_CALLERS = 3;
export const SFX_NESTED_DTOR_CALLER1 = 0x00a2af06;
export const SFX_NESTED_DTOR_CALLER2 = 0x00a7d276;
export const SFX_NESTED_DTOR_CALLER3 = 0x00a7dad6;
export const SFX_NESTED_DTOR_THUNK_VA = 0x00b16e59;
export const SFX_SECONDARY1_VFTABLE_VA = 0x00ba306c;
export const SFX_SECONDARY1_RTTI_VA = 0x00ba3068;
export const SFX_SECONDARY2_VFTABLE_VA = 0x00ba30b0;
export const SFX_SECONDARY2_RTTI_VA = 0x00ba30ac;
export const SFX_SECONDARY_DTOR1_VA = 0x00a7d260;
export const SFX_SECONDARY_DTOR2_VA = 0x00a7dac0;
export const SFX_SECONDARY_DTOR_FREE1 = 0x4c;
export const SFX_SECONDARY_DTOR_FREE2 = 0x64;
export const SFX_SECONDARY_BASE_DTOR_VA = 0x00a5a4c0;
export const SFX_MANAGER_BASE_VFTABLE_VA = 0x00b9fdcc;
export const SFX_MANAGER_BASE_DTOR_VA = 0x00a61a80;
export const SFX_MANAGER_BASE_DTOR_FREE = 8;
export const SFX_MEMBER_VFTABLE_VA = 0x00b81c0c;
export const SFX_MEMBER_DTOR_VA = 0x00a156e0;
export const SFX_MEMBER_DTOR_PLAIN_VA = 0x00a15730;
export const SFX_MEMBER_RELEASE_VA = 0x00a157c0;
export const SFX_MEMBER_LOCK_ACQUIRE_VA = 0x00a15770;
export const SFX_MEMBER_DTOR_FREE = 0xc;
export const SFX_MEMBER_BASE_VFTABLE_VA = 0x00ba04b4;
export const SFX_MEMBER_BASE_DTOR_VA = 0x00a68440;
export const SFX_MEMBER_BASE_DTOR_FREE = 8;
export const SFX_MEMBER_BASE_LOCK_CLEAR_VA = 0x00a68480;
export const SFX_PAIR_VFTABLE_VA = 0x00b9c430;
export const SFX_PAIR_DTOR_VA = 0x0040cb50;
export const SFX_PAIR_BASE_VFTABLE_VA = 0x00b1a6fc;
export const SFX_PAIR_BASE_DTOR_VA = 0x0040cbb0;
export const SFX_PAIR_DTOR_FREE = 0x18;
export const SFX_PAIR_BASE_DTOR_FREE = 0x14;
export const SFX_FLAG_ROW0_VA = 0x00b81a84;
export const SFX_FLAG_ROW1_VA = 0x00b82468;
export const SFX_FLAG_ROW2_VA = 0x00b82638;
export const SFX_FLAG_BIT1_SETTER_VA = 0x00a13590;
export const SFX_DTOR_FOREST_VTABLES = 6;
export const SFX_DTOR_DELETE_GATE_BODIES = 8;
export const SFX_DTOR_OWNED_FREE_GATE_SITES = 7;
export const SFX_DTOR_LOCK_CLEAR_SITES = 8;
export const SFX_DTOR_FLAGS_PUT0_SITES = 3;
export const SFX_DTOR_OWNED_FREE_SIZE = 0x1c;
export const SFX_DTOR_MAP_HEAD_OFF = 0x08;
export const SFX_DTOR_MAP_SIZE_OFF = 0x0c;
export const SFX_DTOR_MEMBER1_OFF = 0x10;
export const SFX_DTOR_MEMBER1_LOCK_OFF = 0x14;
export const SFX_DTOR_MEMBER1_PTR_OFF = 0x18;
export const SFX_DTOR_MEMBER1_VEC_OFF = 0x1c;
export const SFX_DTOR_MEMBER2_OFF = 0x28;
export const SFX_DTOR_MEMBER2_LOCK_OFF = 0x2c;
export const SFX_DTOR_MEMBER2_PTR_OFF = 0x30;
export const SFX_DTOR_BLOCK_FREE_VA = 0x004149d0;
export const SFX_DTOR_BLOCK_FREE_SITE = 0x00a2af6f;
export const SFX_LIST_CLEAR_VA = 0x00a2bcb0;
export const SFX_LIST_CLEAR_CALLERS = 5;
export const SFX_HOOK_CALLABLE_VA = 0x00a2bb10;
export const SFX_RELEASE_FNPTR_VA = 0x00b18274;
export const SFX_DTOR_VPTR_STORE1_VA = 0x00a2af34;
export const SFX_DTOR_VPTR_STORE2_VA = 0x00a2afc6;
export const SFX_DTOR_FLAGS_PUT0_SITE1 = 0x00a2afbf;
export const SFX_DTOR_FLAGS_PUT0_SITE2 = 0x00a2b040;
export const SFX_DTOR_FLAGS_PUT0_SITE3 = 0x00a61a86;
export const SFX_HOOK_INSTALL_LOCK_SITES = 2;
export const SFX_HOOK_CLEAR_LOCK_SITES = 2;
export const SFX_HOOK_CLEAR_REINIT_STORES = 4;
export const SFX_HOOK_CLEAR_REINIT_SITES_3 = 3;
export const SFX_HOOK_CLEAR_COUNT_STORE_VA = 0x00a2b02b;

/** Owned-pointer free gate, 0xa2af44/0xa2af7e + the member/pair dtor
    rows (7 sites): `test esi,esi ; je skip` — FULL dword. When 1 the
    body runs the IAT [0xb18274] release + free(ptr, 0x1c) + zero
    store; 0x100 is a LIVE pointer (0x100 -> 1). */
export function sfxDtorOwnedFreeGate(ptr) {
  return u32(ptr) !== 0 ? 1 : 0;
}

/** Lock-byte clear, `and byte [m+4], 0xfe` (8 sites incl. the two
    inline member clears in 0xa2af30 and the 0xa68480 virtual):
    unconditional byte bit0 clear on the destroy path. The machine
    reads/writes a BYTE: the input is masked & 0xff and the result is
    the stored byte. */
export function sfxDtorLockBitClear(byte) {
  return (u32(byte) & 0xff) & 0xfe;
}

/** Manager flags put0, `and dword [this+4], 0xfffffffe` — 3 sites:
    0xa2afbf (nested dtor), 0xa2b040 (hook-clear tail; the v35
    hook-clear plan's flags_after consumes this op BY REFERENCE),
    0xa61a86 (manager base dtor). FULL dword op. */
export function sfxDtorFlagsPut0(flags) {
  return (u32(flags) & ~1) >>> 0;
}

/* v37 census pins (fresh dumps + whole-.text census; see notes
   sfx-v37-dtorforest). */
export function sfxNestedDtorVa() { return SFX_NESTED_DTOR_VA; }
export function sfxNestedDtorSharedBodies() { return SFX_NESTED_DTOR_SHARED_BODIES; }
export function sfxNestedDtorE8Callers() { return SFX_NESTED_DTOR_E8_CALLERS; }
export function sfxManagerVftableVa() { return SFX_MANAGER_VFTABLE_VA; }
export function sfxSecondary1VftableVa() { return SFX_SECONDARY1_VFTABLE_VA; }
export function sfxSecondary2VftableVa() { return SFX_SECONDARY2_VFTABLE_VA; }
export function sfxManagerBaseVftableVa() { return SFX_MANAGER_BASE_VFTABLE_VA; }
export function sfxMemberVftableVa() { return SFX_MEMBER_VFTABLE_VA; }
export function sfxMemberBaseVftableVa() { return SFX_MEMBER_BASE_VFTABLE_VA; }
export function sfxPairVftableVa() { return SFX_PAIR_VFTABLE_VA; }
export function sfxPairBaseVftableVa() { return SFX_PAIR_BASE_VFTABLE_VA; }
export function sfxFlagBit1SetterVa() { return SFX_FLAG_BIT1_SETTER_VA; }
export function sfxDtorForestVtables() { return SFX_DTOR_FOREST_VTABLES; }
export function sfxDtorDeleteGateBodies() { return SFX_DTOR_DELETE_GATE_BODIES; }
export function sfxDtorOwnedFreeGateSites() { return SFX_DTOR_OWNED_FREE_GATE_SITES; }
export function sfxDtorLockClearSites() { return SFX_DTOR_LOCK_CLEAR_SITES; }
export function sfxDtorFlagsPut0Sites() { return SFX_DTOR_FLAGS_PUT0_SITES; }
export function sfxDtorOwnedFreeSize() { return SFX_DTOR_OWNED_FREE_SIZE; }
export function sfxDtorBlockFreeVa() { return SFX_DTOR_BLOCK_FREE_VA; }
export function sfxDtorBlockFreeSite() { return SFX_DTOR_BLOCK_FREE_SITE; }
export function sfxListClearVa() { return SFX_LIST_CLEAR_VA; }
export function sfxListClearCallers() { return SFX_LIST_CLEAR_CALLERS; }
export function sfxHookCallableVa() { return SFX_HOOK_CALLABLE_VA; }
export function sfxReleaseFnptrVa() { return SFX_RELEASE_FNPTR_VA; }
export function sfxDtorVptrStore1Va() { return SFX_DTOR_VPTR_STORE1_VA; }
export function sfxDtorVptrStore2Va() { return SFX_DTOR_VPTR_STORE2_VA; }
export function sfxHookInstallLockSites() { return SFX_HOOK_INSTALL_LOCK_SITES; }
export function sfxHookClearLockSites() { return SFX_HOOK_CLEAR_LOCK_SITES; }
export function sfxHookClearReinitStores() { return SFX_HOOK_CLEAR_REINIT_STORES; }

/* ---------- SX: channel set-pan 0x00a2ac20 (v2) ---------- */

/**
 * The guard compares the requested pan against a neutral zero. The machine
 * spells the comparison out through the flags byte, and the branch it takes
 * requires an ordered equality â€” so negative zero passes and NaN does not.
 */
export function sfxPanEqualsNeutral(pan) {
  return f32(pan) === f32FromBits(SFX_PAN_NEUTRAL_BITS);
}

/**
 * With no channel there is nothing to tell. A mono source always accepts the
…
 */
export function sfxChannelPanAction(channelNull, channelCount, pan) {
  if (i32(channelNull) !== 0) return SFX_PAN_ACTION_NONE;
  if (i32(channelCount) <= SFX_PAN_MONO_MAX_CHANNELS) return SFX_PAN_ACTION_SET;
  if (sfxPanEqualsNeutral(pan)) return SFX_PAN_ACTION_SET;
  return SFX_PAN_ACTION_WARN;
}

export function sfxChannelPanPlan(channelNull, channelCount, pan) {
  const action = sfxChannelPanAction(channelNull, channelCount, pan);
  return {
    action,
    storeNeeded: true,
    countProbeNeeded: i32(channelNull) === 0,
    warnLogNeeded: action === SFX_PAN_ACTION_WARN,
    storedPan: f32(pan),
  };
}

/* ---------- RNG stream identity (v2) ---------- */

/**
 * Kept as data so a caller cannot quietly substitute the other xorshift in
 * this binary. The pre-play helper drives a separate word sixteen bytes
 * further on with a different seed and a different shift triple.
 */
export function sfxRngDefaults() {
  return {
    seed: SFX_RNG_SEED_DEFAULT,
    shift1: SFX_RNG_SHIFT1_DEFAULT,
    shift2: SFX_RNG_SHIFT2_DEFAULT,
    shift3: SFX_RNG_SHIFT3_DEFAULT,
    seedVa: SFX_RNG_SEED_VA,
    shiftRdataVa: SFX_RNG_SHIFT_TRIPLE_RDATA_VA,
  };
}

/**
 * @param {object} opts
 */
export function sfxClearVolumePlan({
  spanBytes = 0,
  voices190 = 0,
  enabled198 = 0,
  mgrVolumeModifier = 0,
  entryBaseVolume = 0,
  masterVolume = 0,
} = {}) {
  const enter = sfxClearVolumeWalkEnter(spanBytes);
  const open = sfxClearVolumeEntryOpen(voices190);
  const enabled = sfxClearVolumeVoiceEnabled(enabled198);
  const visited = enter && open;
  const gateOpen = visited && enabled;
  return {
    entryCount: sfxEntryCount(spanBytes),
    walkEnter: enter,
    entryVoicesOpen: open,
    voiceEnabled: enabled,
    voiceVisited: visited,
    voiceGateOpen: gateOpen,
    voiceVolume: gateOpen
      ? sfxVoiceVolumeUnclamped(mgrVolumeModifier, entryBaseVolume, masterVolume)
      : 0,
  };
}

/* ---------- SL: SoundEffect::Load bookkeeping split (v3) ---------- */

/** The voice's own name string, which is what the path redirect is handed. */
export function sfxLoadVoiceNameOffset(index) {
  return u32(Math.imul(i32(index), SFX_VOICE_STRIDE) + SFX_VOICE_NAME_OFF) | 0;
}

export function sfxLoadVoiceWrapperOffset(index) {
  return sfxVoiceBaseOffset(index);
}

/**
 * The stream byte sits at the very top of the voice's own slot, which is the
 * same address as the start of the next slot minus its leading string â€” i.e.
 * one whole stride past the entry base for voice zero.
 */
export function sfxLoadStreamByteOffset(index) {
  return u32(Math.imul(i32(index) + 1, SFX_VOICE_STRIDE)) | 0;
}

/**
 * The suffix test needs four characters. The machine asks for them by
…
 */
export function sfxLoadPathLenFatal(resolvedSize) {
  return u32(resolvedSize) < SFX_LOAD_MIN_PATH_LEN;
}

/**
 * How many characters the comparison actually looks at. The difference
 * between the length and the length-minus-four is four by construction, so
 * the clamp the compiler emitted alongside it is dead code.
 */
export function sfxLoadCompareLength(resolvedSize) {
  return sfxLoadPathLenFatal(resolvedSize) ? 0 : SFX_LOAD_SUFFIX_LEN;
}

/** Short strings live inline; a capacity of sixteen or more means the heap. */
export function sfxLoadUsesHeapBuffer(capacity) {
  return u32(capacity) >= SFX_LOAD_SSO_CAPACITY_LIMIT;
}

/** Equal to the ".ogg" literal means stream; anything else means static. */
export function sfxLoadStreamByte(suffixCompareResult) {
  return i32(suffixCompareResult) === 0
    ? SFX_LOAD_STREAM_BYTE_STREAM
    : SFX_LOAD_STREAM_BYTE_STATIC;
}

/**
 * The device-create arm's hook wiring, PE 0x92d094..0x92d0b8 (v22). The
 * probe target is gated FULL-WORD (test ecx,ecx), the vtbl[0x0c] probe
 * result at its LOW BYTE (test al,al), and the 0x00c7f484 attach-hook
 * pointer FULL-WORD (test eax,eax). Reachable only on the non-".ogg" arm.
 */
export function sfxLoadHookPlan(probeTarget, probeResult, hookPtr) {
  const probeRuns = u32(probeTarget) !== 0 ? 1 : 0;
  const probeByte = (u32(probeResult) & 0xff) !== 0 ? 1 : 0;
  const hookPtrNonZero = u32(hookPtr) !== 0 ? 1 : 0;
  return {
    probeRuns,
    probeByteNonzero: probeByte,
    hookPtrNonzero: hookPtrNonZero,
    hookRuns: probeRuns && probeByte && hookPtrNonZero ? 1 : 0,
  };
}

/**
 * The per-voice redirected-path free, PE 0x92d0ca..0x92d0f5 (v22): the
 * shared MSVC tail (cap >= 0x10 to free, size = cap+1, < 0x1000 fast, else
 * back pointer, +0x23 bias, slack-4 > 0x1f UNSIGNED -> abort 0x00b18894).
 * Reset never happens here (unlike the 0x0092d217 entry-string site).
 */
export function sfxLoadVoiceFreePlan(capacity, ptrMinusBack) {
  const freeNeeded = u32(capacity) >= SFX_STRING_SSO_LIMIT ? 1 : 0;
  const size = (u32(capacity) + 1) >>> 0;
  const big = size >= SFX_STRING_BIG_ALLOC_LIMIT;
  const slack = (u32(ptrMinusBack) - 4) >>> 0;
  return {
    freeNeeded,
    freeFast: freeNeeded !== 0 && !big ? 1 : 0,
    freeSize:
      freeNeeded !== 0
        ? big ? u32(size + SFX_STRING_BIG_ALLOC_BIAS) : size
        : 0,
    slackChecked: freeNeeded !== 0 && big ? 1 : 0,
    corruptFatal:
      freeNeeded !== 0 && big && slack > SFX_STRING_ALIGN_SLACK_MAX ? 1 : 0,
    resetNeeded: 0,
  };
}

/* A voice slot is the name string plus the wrapper, one stride wide, and the
   first one starts eight bytes into the entry. */
function voiceSlotSpan(index) {
  const i = i32(index);
  const lo = SFX_VOICE_NAME_OFF + i * SFX_VOICE_STRIDE;
  return { lo, hi: lo + SFX_VOICE_STRIDE };
}

/** True while the whole slot still lies below the entry's own header. */
export function sfxLoadVoiceSlotInBounds(index) {
  if (i32(index) < 0) return false;
  const end = SFX_VOICE_NAME_OFF + (i32(index) + 1) * SFX_VOICE_STRIDE;
  return end <= SFX_ENTRY_OFF_VOICE_COUNT_190;
}

/* ---------- v23: TryRedirectPath probe walk (0x008f5ad0) ---------- */

export const SFX_REDIRECT_PROBE_MASK = 0x7fff;
export const SFX_REDIRECT_PROBE_CAP = 0x8000;
export const SFX_REDIRECT_SLOT_OFF = 0x0c;
export const SFX_REDIRECT_SLOT_STRIDE = 4;
export const SFX_REDIRECT_KEY0_OFF = 0x00;
export const SFX_REDIRECT_KEY1_OFF = 0x04;
export const SFX_REDIRECT_DTOR_THIS_OFF = 0x0c;
export const SFX_REDIRECT_FREE_SIZE = 0x24;
export const SFX_REDIRECT_DTOR_VA = 0x0040d040;
export const SFX_REDIRECT_FREE_VA = 0x00aef15c;
export const SFX_REDIRECT_FIRST_PROBE_VA = 0x008f5b60;
export const SFX_REDIRECT_WALK_END_VA = 0x008f5bc1;
export const SFX_REDIRECT_FOUND_TAIL_VA = 0x008f608f;

/** hash & 0x7fff — the first open-addressing probe index. */
export function sfxRedirectProbeStart(hash) {
  return (u32(hash) & SFX_REDIRECT_PROBE_MASK) >>> 0;
}

/** (index + 1) & 0x7fff — the next probe. */
export function sfxRedirectProbeNext(index) {
  return ((u32(index) + 1) & SFX_REDIRECT_PROBE_MASK) >>> 0;
}

/** count >= 0x8000, UNSIGNED (cmp eax,0x8000 ; jae). */
export function sfxRedirectProbeCap(count) {
  return u32(count) >= SFX_REDIRECT_PROBE_CAP ? 1 : 0;
}

/** FULL-WORD key equality: slot_key0 == k0 && slot_key1 == k1. */
export function sfxRedirectProbeMatch(k0, k1, slotKey0, slotKey1) {
  return u32(slotKey0) === u32(k0) && u32(slotKey1) === u32(k1) ? 1 : 0;
}

/** One probe iteration. outcome: 0=CONTINUE 1=FOUND 2=NOT_FOUND
    3=CAP_DESTROY. The cap EVICTS even a matched node (PE 0x8f5b99..0x8f5bb7:
    match at count==0x8000 -> dtor [0x40d040] + free 0x24 -> NOT_FOUND). */
export function sfxRedirectProbeStep(count, index, slotPresent, keysMatch) {
  const c = u32(count);
  const idx = u32(index);
  if (!slotPresent) {
    return { outcome: 2, nextCount: c, nextIndex: idx, destroySize: 0 };
  }
  if (keysMatch) {
    if (c !== SFX_REDIRECT_PROBE_CAP) {
      return { outcome: 1, nextCount: c, nextIndex: idx, destroySize: 0 };
    }
    return {
      outcome: 3,
      nextCount: c,
      nextIndex: idx,
      destroySize: SFX_REDIRECT_FREE_SIZE,
    };
  }
  if (c >= SFX_REDIRECT_PROBE_CAP) {
    /* 0x8f5b7c cmp eax,0x8000 ; jae 0x8f5b9e. The shared 0x8f5b9e
       `jne 0x8f5bb9` re-tests EQUALITY: only c == 0x8000 falls to the
       evict arm; c > 0x8000 (unreachable in the machine) takes the jne
       and returns FOUND for the present slot — transcribed exactly. */
    if (c === SFX_REDIRECT_PROBE_CAP) {
      return {
        outcome: 3,
        nextCount: c,
        nextIndex: idx,
        destroySize: SFX_REDIRECT_FREE_SIZE,
      };
    }
    return { outcome: 1, nextCount: c, nextIndex: idx, destroySize: 0 };
  }
  return {
    outcome: 0,
    nextCount: (c + 1) >>> 0,
    nextIndex: sfxRedirectProbeNext(idx),
    destroySize: 0,
  };
}

/**
 * True when the slot runs into the header the loop itself reads â€” the count,
 * the base volume and the enabled byte. Only the eighth slot does, and there
 * the "name string" is those very fields. Kept, not fixed.
 */
export function sfxLoadVoiceAliasesEntryHeader(index) {
  if (i32(index) < 0) return false;
  const { lo, hi } = voiceSlotSpan(index);
  return lo < SFX_ENTRY_STRIDE && hi > SFX_ENTRY_OFF_VOICE_COUNT_190;
}

/**
 * Can one Load call put a byte anywhere inside the four-byte entry field at
…
 */
export function sfxLoadWritesEntryField(offset, voices) {
  if (i32(offset) < 0) return 0;
  const lo = u32(offset);
  const hi = lo + 4;
  const enabled = SFX_ENTRY_OFF_ENABLED_198;
  if (enabled >= lo && enabled < hi) return 1;
  const v = u32(voices);
  if (v === 0) return 0;
  const stride = SFX_VOICE_STRIDE;
  const k = Math.floor((lo + stride - 1) / stride);
  if (k === 0 || k > v) return 0;
  const at = k * stride;
  return at >= lo && at < hi ? 1 : 0;
}

/** @param {number} index */
export function sfxLoadVoicePlan(
  index,
  resolvedSize,
  capacity,
  suffixCompareResult,
) {
  const fatal = sfxLoadPathLenFatal(resolvedSize);
  const heap = sfxLoadUsesHeapBuffer(capacity);
  const stream = sfxLoadStreamByte(suffixCompareResult);
  const device = !fatal && stream === 0;
  return {
    nameOffset: sfxLoadVoiceNameOffset(index),
    wrapperOffset: sfxLoadVoiceWrapperOffset(index),
    streamByteOffset: sfxLoadStreamByteOffset(index),
    pathLenFatal: fatal,
    suffixCompareNeeded: !fatal,
    compareLength: sfxLoadCompareLength(resolvedSize),
    usesHeapBuffer: heap,
    streamByteValue: fatal ? 0 : stream,
    deviceCreateNeeded: device,
    channelAssignNeeded: device,
    heapFreeNeeded: fatal ? false : !!heap,
    aliasesEntryHeader: sfxLoadVoiceAliasesEntryHeader(index),
  };
}

/**
 * What one Load call leaves behind in the entry. The enabled flag is set on
 * the way out whether or not the loop ran at all, and the loop's own bound is
 * a field the loop never touches, so the visit count is simply the count.
 */
export function sfxLoadPlan(voices190, frameStart, frameEnd) {
  const enter = u32(voices190) !== 0;
  return {
    voiceLoopEnter: enter,
    voicesVisited: u32(voices190),
    enabledAfter: SFX_LOAD_ENABLED_AFTER,
    voicesAfter: u32(voices190),
    frameStartAfter: i32(frameStart),
    frameEndAfter: i32(frameEnd),
    entryHeaderStores: 1,
    streamByteStores: u32(voices190),
    headerAliasIndex: u32(voices190) > SFX_LOAD_HEADER_ALIAS_INDEX
      ? SFX_LOAD_HEADER_ALIAS_INDEX
      : -1,
    pureComplete: !enter,
  };
}

/**
 * Which values Play must fetch again after the preload. Asking the Load model
…
 */
export function sfxPlayRecaptureMask(gateKind, voices) {
  let mask = SFX_PLAY_RECAPTURE_NONE;
  if (i32(gateKind) === SFX_PLAY_GATE_PRELOAD) {
    if (sfxLoadWritesEntryField(SFX_ENTRY_OFF_FRAME_END, voices)) {
      mask |= SFX_PLAY_RECAPTURE_ENTRY_END_4;
    }
    if (sfxLoadWritesEntryField(SFX_ENTRY_OFF_VOICE_COUNT_190, voices)) {
      mask |= SFX_PLAY_RECAPTURE_VOICES_190;
    }
  }
  if (i32(gateKind) === SFX_PLAY_GATE_PRELOAD ||
      i32(gateKind) === SFX_PLAY_GATE_LIVE) {
    mask |= SFX_PLAY_RECAPTURE_STREAM_FLAG;
  }
  return mask;
}

/* ---------- SY: channel-wrapper copy-assign 0x00a2ac90 (v3) ---------- */

/**
 * Both pointer slots change hands. Each side reads its old value before the
 * other side overwrites it, so the temporary walks away holding what the
 * wrapper used to own â€” which is exactly what the following probe inspects.
 */
export function sfxChannelPointerSwap(dst00, dst04, tmp00, tmp04) {
  return { dst00: tmp00, dst04: tmp04, tmp00: dst00, tmp04: dst04 };
}

/**
 * Copy-assign takes its five readable fields from the source before it lets
…
 */
export function sfxChannelCopyAssignPlan(
  srcLoop08,
  srcPending09,
  srcVolume0c,
  srcPan10,
  srcPitch14,
) {
  const defaults = sfxChannelResetDefaults();
  return {
    releaseNeeded: true,
    adoptCalls: SFX_CHANNEL_COPY_ASSIGN_ADOPT_CALLS,
    swapNeeded: true,
    snapshotBeforeRelease: true,
    selfAssignSafe: true,
    hookProbeSites: SFX_CHANNEL_COPY_ASSIGN_HOOK_SITES,
    transientLoop08: defaults.loop08,
    transientPending09: defaults.pending09,
    transientFlag0a: defaults.flag0a,
    transientVolume0c: defaults.volume0c,
    transientPan10: defaults.pan10,
    transientPitch14: defaults.pitch14,
    finalLoop08: byte(srcLoop08),
    finalPending09: byte(srcPending09),
    finalFlag0a: defaults.flag0a,
    finalVolume0c: f32(srcVolume0c),
    finalPan10: f32(srcPan10),
    finalPitch14: f32(srcPitch14),
  };
}

/* ---------- SZ: channel start 0x00a2ac00 (v3) ---------- */

/**
 * With no channel there is nothing to start and nothing is written. With one,
 * the device is told to start and a single sixteen-bit store marks the voice
 * pending while wiping the byte next to it.
 */
/* ---------- SD: table clear / destroy walk (v4) ---------- */

/**
 * What the machine tells the CRT destructor iterator about a SoundEffect's
…
 */
export function sfxEntryVoiceDtorArgs() {
  return {
    baseOffset: SFX_ENTRY_VOICE_DTOR_BASE_OFF,
    stride: SFX_ENTRY_VOICE_DTOR_STRIDE,
    count: SFX_ENTRY_VOICE_DTOR_COUNT,
    dtorVa: SFX_HOST_VA_VOICE_SLOT_DTOR,
    slotNameOffset: SFX_VOICE_SLOT_OFF_NAME,
    slotWrapperOffset: SFX_VOICE_SLOT_OFF_WRAPPER,
    spanEnd: SFX_ENTRY_VOICE_DTOR_BASE_OFF +
      SFX_ENTRY_VOICE_DTOR_COUNT * SFX_ENTRY_VOICE_DTOR_STRIDE,
  };
}

/* Shared tail of both deallocation sites, starting from a known byte size.
   Small blocks go straight to the deallocator. Large ones were handed back a
   shifted payload, so the real allocation starts at the word stored just
   below it; the size is padded and the distance between the two pointers is
   sanity-checked against a small window before either is used. */
function freeTail(size, ptrMinusBack, freeNeeded) {
  const out = {
    freeNeeded: !!freeNeeded,
    usesBackPointer: false,
    freeSize: 0,
    slackChecked: false,
    corruptFatal: false,
    resetSize: 0,
    resetCapacity: SFX_STRING_RESET_CAPACITY,
  };
  if (!freeNeeded) return out;
  const big = u32(size) >= SFX_STRING_BIG_ALLOC_LIMIT;
  out.usesBackPointer = big;
  out.slackChecked = big;
  if (!big) {
    out.freeSize = u32(size);
    return out;
  }
  out.freeSize = (u32(size) + SFX_STRING_BIG_ALLOC_BIAS) >>> 0;
  const slack = (u32(ptrMinusBack) - 4) >>> 0;
  out.corruptFatal = slack > SFX_STRING_ALIGN_SLACK_MAX;
  return out;
}

/** A string keeps its characters inline until its capacity reaches sixteen. */
export function sfxStringFreePlan(capacity, ptrMinusBack) {
  const freeNeeded = u32(capacity) >= SFX_STRING_SSO_LIMIT;
  return freeTail((u32(capacity) + 1) >>> 0, ptrMinusBack, freeNeeded);
}

/** The element block always reaches the deallocator once it is non-null. */
export function sfxBlockFreePlan(blockSize, ptrMinusBack) {
  return freeTail(blockSize, ptrMinusBack, true);
}

/**
 * Clearing the table. The three pointer slots are read and then all zeroed
…
 */
export function sfxTableClearPlan(beginNull, sizeSpanBytes, capSpanBytes) {
  const out = {
    selfAssignGuardTaken: false,
    detachStores: 3,
    detachBeforeDestroy: true,
    destroyLoopEnter: false,
    elementsDestroyed: 0,
    freeNeeded: false,
    freeBytes: 0,
    freeSpanRoundedDown: false,
    pureComplete: true,
  };
  if (i32(beginNull) !== 0) return out;
  const enter = i32(sizeSpanBytes) !== 0;
  out.destroyLoopEnter = enter;
  out.elementsDestroyed = enter ? sfxEntryCount(sizeSpanBytes) : 0;
  out.freeNeeded = true;
  const capCount = sfxEntryCount(capSpanBytes);
  const bytes = Math.imul(capCount, SFX_ENTRY_STRIDE) | 0;
  out.freeBytes = bytes;
  out.freeSpanRoundedDown = bytes !== i32(capSpanBytes);
  out.pureComplete = false;
  return out;
}

/* ---------- SE: resize to 0x443 elements (v4) ---------- */

/** The table is always brought to the same fixed length. */
export function sfxTableTargetBytes() {
  return Math.imul(SFX_TABLE_TARGET_COUNT, SFX_ENTRY_STRIDE) | 0;
}

/**
 * Four outcomes from two unsigned comparisons against the fixed length.
 * Longer than it shrinks; exactly right and nothing happens at all; shorter
 * and it either fills the room it already has or asks for more.
 */
export function sfxTableResizeAction(sizeCount, capacityCount) {
  const target = SFX_TABLE_TARGET_COUNT;
  if (u32(sizeCount) > target) return SFX_TABLE_RESIZE_SHRINK;
  if (u32(sizeCount) === target) return SFX_TABLE_RESIZE_NONE;
  if (u32(capacityCount) >= target) return SFX_TABLE_RESIZE_GROW_INPLACE;
  return SFX_TABLE_RESIZE_GROW_REALLOC;
}

export function sfxTableResizePlan(sizeCount, capacityCount) {
  const action = sfxTableResizeAction(sizeCount, capacityCount);
  const target = SFX_TABLE_TARGET_COUNT;
  return {
    action,
    targetCount: target,
    destroyRangeNeeded: action === SFX_TABLE_RESIZE_SHRINK,
    appendNeeded: action === SFX_TABLE_RESIZE_GROW_INPLACE,
    growNeeded: action === SFX_TABLE_RESIZE_GROW_REALLOC,
    capacityRead: action === SFX_TABLE_RESIZE_GROW_INPLACE ||
      action === SFX_TABLE_RESIZE_GROW_REALLOC,
    appendCount: action === SFX_TABLE_RESIZE_GROW_INPLACE
      ? (target - u32(sizeCount)) >>> 0 : 0,
    newEndOffset: action === SFX_TABLE_RESIZE_SHRINK ? sfxTableTargetBytes() : 0,
    pureComplete: action === SFX_TABLE_RESIZE_NONE,
  };
}

/* ---------- proven-dead branch registry (v4) ---------- */

const DEAD_BRANCH_VAS = [0x0092dd7e, 0x0092d1c9];

export function sfxDeadBranchCount() {
  return SFX_DEAD_BRANCH_COUNT;
}

/**
 * Branches this family has shown can never be taken. They stay in the model
 * with their arithmetic intact; only the fact that control never reaches
 * them is recorded, so nothing can quietly promote one back to a live path.
 */
export function sfxDeadBranch(id) {
  const out = { id: i32(id), va: 0, taken: 0, arithmeticRetained: true };
  if (out.id === SFX_DEAD_BRANCH_PLAY_VOICE_DIV_GUARD) {
    out.va = 0x0092dd7e;
    return out;
  }
  if (out.id === SFX_DEAD_BRANCH_TABLE_SELF_ASSIGN) {
    out.va = 0x0092d1c9;
    return out;
  }
  out.id = -1;
  out.va = 0;
  out.arithmeticRetained = false;
  return out;
}

export function sfxChannelStartPlan(channelNull, pending09, flag0a) {
  const start = i32(channelNull) === 0;
  const out = {
    deviceStartNeeded: start,
    startArg: SFX_CHANNEL_START_ARG,
    wordStoreNeeded: start,
    pending09After: byte(pending09),
    flag0aAfter: byte(flag0a),
  };
  if (!start) return out;
  out.pending09After = sfxWordStoreLo(SFX_PLAY_STARTED_WORD);
  out.flag0aAfter = sfxWordStoreHi(SFX_PLAY_STARTED_WORD);
  return out;
}

/* ---------- v5: attribute walks + fill control (0x0092d140 C/D) ---------- */

/* The four attribute names plus "sample", in constant-table order, exactly
   as read from .rdata of this image. */
const ATTR_CONSTANTS = ["id", "name", "path", "weight", "sample"];

export function sfxAttrConstantLen(constantIndex) {
  const i = i32(constantIndex);
  if (i < 0 || i >= ATTR_CONSTANTS.length) return 0;
  return ATTR_CONSTANTS[i].length;
}

export function sfxAttrConstantVa(constantIndex) {
  const vas = [
    SFX_ATTR_NAME_ID_VA, SFX_ATTR_NAME_NAME_VA, SFX_ATTR_NAME_PATH_VA,
    SFX_ATTR_NAME_WEIGHT_VA, SFX_XML_SAMPLE_ELEMENT_VA,
  ];
  const i = i32(constantIndex);
  if (i < 0 || i >= vas.length) return 0;
  return vas[i];
}

/**
 * The inline strcmp (0x0092d4f3..0x0092d560): two bytes per iteration,
…
 */
export function sfxAttrStrcmp(nameNull, name, nameLen, constantIndex) {
  const idx = i32(constantIndex);
  if (idx < 0 || idx >= ATTR_CONSTANTS.length) return 1;
  const s = ATTR_CONSTANTS[idx];
  const clen = s.length;
  if (i32(nameNull) !== 0) return clen === 0 ? 0 : -1;
  const n = i32(nameLen) < 0 ? 0 : i32(nameLen);
  for (let i = 0; i < n; i++) {
    const a = nameByteAt(name, i);
    const b = i < clen ? s.charCodeAt(i) & 0xff : 0;
    if (a !== b) return a < b ? -1 : 1;
    if (a === 0) return 0;
  }
  if (n === clen) return 0;
  return n < clen ? -1 : 1;
}

export function sfxAttrArm(cmpFirst, cmpSecond) {
  if (i32(cmpFirst) === 0) return SFX_ATTR_ARM_FIRST;
  if (i32(cmpSecond) === 0) return SFX_ATTR_ARM_SECOND;
  return SFX_ATTR_ARM_NONE;
}

export function sfxAttrArmAction(arm, site) {
  if (i32(arm) === SFX_ATTR_ARM_NONE) return SFX_ATTR_ACTION_NONE;
  const siteN = site ? SFX_ATTR_SITE_SLOT : SFX_ATTR_SITE_ENTRY;
  const firstIsParse = siteN === SFX_ATTR_SITE_SLOT ? 0 : 1;
  const isFirst = i32(arm) === SFX_ATTR_ARM_FIRST ? 1 : 0;
  if (firstIsParse === isFirst) return SFX_ATTR_ACTION_NUMERIC_PARSE;
  return SFX_ATTR_ACTION_STRING_ASSIGN;
}

export function sfxAttrValueStrlen(valueNull, value, maxLen) {
  if (i32(valueNull) !== 0) return 0;
  const n = i32(maxLen) < 0 ? 0 : i32(maxLen);
  for (let i = 0; i < n; i++) {
    if (nameByteAt(value, i) === 0) return i;
  }
  return n;
}

export function sfxAttrWalkContinue(nextFlagNonzero, nextNull) {
  if (i32(nextFlagNonzero) === 0) return 0;
  return i32(nextNull) === 0 ? 1 : 0;
}

export function sfxXmlNodeIsSample(nameLen, name, nameCap) {
  if (i32(nameLen) !== SFX_XML_SAMPLE_NAME_LEN) return 0;
  if (i32(nameCap) < SFX_XML_SAMPLE_NAME_LEN) return 0;
  const s = ATTR_CONSTANTS[4];
  for (let i = 0; i < SFX_XML_SAMPLE_NAME_LEN; i++) {
    if (nameByteAt(name, i) !== (s.charCodeAt(i) & 0xff)) return 0;
  }
  return 1;
}

export function sfxTableAppendFlag(flag) {
  return (u32(flag) & 0xff) !== 0 ? 1 : 0; /* cmp byte [arg+0xc],0 */
}

/**
 * The 0x0092d5b0 arm decision and fill-target arithmetic. `id` is the
…
 */
export function sfxTableFillPlan(appendFlag, id, idAfterWarn, spanBytes,
                                 stringSelfAssign) {
  const append = (u32(appendFlag) & 0xff) !== 0;
  const out = {
    appendMode: append,
    countRecomputed: false,
    targetIndex: 0,
    targetOffset: 0,
    outOfBoundsWarn: false,
    idRecheckNeeded: false,
    fillSkipped: false,
    fillNeeded: false,
    slotCopies: 0,
    headerStores: 0,
    tailCopies: 0,
    entryStringAssign: false,
    pureComplete: false,
  };
  if (append) {
    const count = sfxEntryCount(spanBytes);
    out.countRecomputed = true;
    out.targetIndex = count;
    out.fillNeeded = true;
  } else {
    out.targetIndex = i32(id);
    const warn = i32(id) >= SFX_TABLE_TARGET_COUNT;
    out.outOfBoundsWarn = warn;
    out.idRecheckNeeded = warn;
    out.fillSkipped = warn && i32(idAfterWarn) >= SFX_TABLE_TARGET_COUNT;
    out.fillNeeded = !out.fillSkipped;
  }
  out.targetOffset = sfxEntryOffset(out.targetIndex) >>> 0;
  out.slotCopies = out.fillNeeded ? 7 : 0;
  out.headerStores = out.fillNeeded ? 6 : 0;
  out.tailCopies = out.fillNeeded ? 14 : 0;
  out.entryStringAssign = out.fillNeeded && i32(stringSelfAssign) === 0;
  return out;
}

export function sfxSampleSlotPlan(voiceCount) {
  const overflow = u32(voiceCount) >= SFX_MAX_SAMPLES_PER_SOUND;
  if (overflow) {
    return {
      overflow: true,
      slotOffset: 0,
      countAfter: i32(voiceCount),
      attrWalkNeeded: false,
      pureComplete: false,
    };
  }
  const c = u32(voiceCount);
  const slot = (((c * 8) - c) * 8 + 8) >>> 0;
  return {
    overflow: false,
    slotOffset: slot | 0,
    countAfter: (c + 1) | 0,
    attrWalkNeeded: true,
    pureComplete: true,
  };
}

export function sfxSlotWeightOffset(index) {
  return (u32(index) * SFX_VOICE_STRIDE + 8 + SFX_SLOT_OFF_WEIGHT_34) | 0;
}

export function sfxAttrWalk(headNull, samples, count, site) {
  const out = {
    attrsVisited: 0,
    numericCount: 0,
    stringCount: 0,
    inertCount: 0,
    valueFallbackCount: 0,
    numericMask: 0,
    stringMask: 0,
    fallbackMask: 0,
    hostParseNeeded: false,
    hostAssignNeeded: false,
    pureComplete: true,
  };
  if (i32(headNull) !== 0 || !samples || i32(count) <= 0) return out;
  const siteN = site ? SFX_ATTR_SITE_SLOT : SFX_ATTR_SITE_ENTRY;
  const first = siteN === SFX_ATTR_SITE_SLOT ? 2 : 0;
  const second = siteN === SFX_ATTR_SITE_SLOT ? 3 : 1;
  const n = i32(count);
  for (let i = 0; i < n; i++) {
    const s = samples[i];
    out.attrsVisited = i + 1;
    const cmpFirst = sfxAttrStrcmp(s.nameNull, s.namePtr ?? s.name, s.nameLen, first);
    let arm;
    if (cmpFirst === 0) arm = SFX_ATTR_ARM_FIRST;
    else {
      const cmpSecond = sfxAttrStrcmp(s.nameNull, s.namePtr ?? s.name, s.nameLen, second);
      arm = cmpSecond === 0 ? SFX_ATTR_ARM_SECOND : SFX_ATTR_ARM_NONE;
    }
    const action = sfxAttrArmAction(arm, siteN);
    if (action === SFX_ATTR_ACTION_NUMERIC_PARSE) {
      out.numericCount++;
      if (i < 32) out.numericMask |= (1 << i) >>> 0;
    } else if (action === SFX_ATTR_ACTION_STRING_ASSIGN) {
      out.stringCount++;
      if (i < 32) out.stringMask |= (1 << i) >>> 0;
    } else {
      out.inertCount++;
    }
    if (arm !== SFX_ATTR_ARM_NONE && i32(s.valueNull) !== 0) {
      out.valueFallbackCount++;
      if (i < 32) out.fallbackMask |= (1 << i) >>> 0;
    }
    if (sfxAttrWalkContinue(s.nextFlag ?? s.nextFlagNonzero, s.nextNull) === 0) break;
  }
  out.hostParseNeeded = out.numericCount > 0;
  out.hostAssignNeeded = out.stringCount > 0;
  out.pureComplete = out.numericCount === 0 && out.stringCount === 0;
  return out;
}

/* ---------- v6: tail plan / chain walk (0x0092da86..0x0092db29) -------- */

/**
 * inc dword [mgr+0xc] (0x0092da9d) â€” 32-bit wrap, pure.
 */
export function sfxPreloadCounterAfter(before) {
  return (u32(before) + 1) >>> 0;
}

/**
 * test esi,esi ; jne 0x0092d470 on the re-read sound[0x2c] â€” a
 * FULL-WORD null test, so 0x100 is a live link, not null.
 */
export function sfxTailChainContinue(nextNode) {
  return i32(nextNode) !== 0 ? 1 : 0;
}

/**
 * One sound's post-samples tail (0x0092da86..0x0092db23): the wrapped
…
 */
export function sfxTailPlan(entryIndex, counterBefore, protoCapacity,
                            protoPtrMinus, nextNode) {
  const f = sfxStringFreePlan(protoCapacity, protoPtrMinus);
  const d = sfxEntryVoiceDtorArgs();
  const loop = i32(nextNode) !== 0;
  return {
    entryIndex: i32(entryIndex),
    entryOffset: sfxEntryOffset(entryIndex) >>> 0,
    loadNeeded: true,
    counterBefore: u32(counterBefore),
    counterAfter: sfxPreloadCounterAfter(counterBefore),
    protoFreeNeeded: f.freeNeeded,
    protoUsesBackPointer: f.usesBackPointer,
    protoFreeSize: f.freeSize,
    protoSlackChecked: f.slackChecked,
    protoCorruptFatal: f.corruptFatal,
    protoResetStores: 3,
    dtorRuns: true,
    dtorCount: d.count,
    dtorStride: d.stride,
    dtorVa: d.dtorVa,
    freeBeforeDtor: true,
    resetBeforeDtor: true,
    loadBeforeFree: true,
    loopBack: loop,
    exitReached: !loop,
    pureComplete: false,
  };
}

/**
 * The sound-node chain walk â€” the outer loop of 0x0092d140. nextNull[i]
…
 */
export function sfxSoundChainPlan(headNonzero, nextLinks) {
  const out = {
    headNonzero: false,
    soundsVisited: 0,
    loopsBack: 0,
    stopsAtNull: false,
    truncated: false,
    pureComplete: true,
  };
  if (i32(headNonzero) === 0) return out;
  out.headNonzero = true;
  if (!nextLinks || nextLinks.length <= 0) {
    out.truncated = true;
    return out;
  }
  for (let i = 0; i < nextLinks.length; i++) {
    out.soundsVisited = i + 1;
    if (u32(nextLinks[i]) === 0) {
      out.loopsBack = i;
      out.stopsAtNull = true;
      return out;
    }
  }
  out.loopsBack = nextLinks.length;
  out.truncated = true;
  return out;
}

/**
 * The five header stores of the fill, in the PE's order: 0x190, 0x194,
 * 0x198, 0x199, 0x19c. Out of range -> -1. Pins the offsets the fill
 * writes even for the two whose sources are uninitialized.
 */
export function sfxFillHeaderOffset(index) {
  const i = i32(index);
  if (i < 0 || i >= SFX_FILL_HEADER_OFFS.length) return -1;
  return SFX_FILL_HEADER_OFFS[i];
}

/**
 * 1 when this header store's SOURCE byte is stack garbage the proto
…
 */
export function sfxFillHeaderUninitialized(index) {
  const i = i32(index);
  if (i < 0 || i >= SFX_FILL_HEADER_COUNT) return 0;
  return (SFX_FILL_HEADER_UNINIT_MASK >>> i) & 1;
}

/**
 * Exact stack shape of the two logger warns. OOB: {level, fmt} only â€”
 * varargCount 0, so the format's "%d" reads garbage (original defect).
 * Max-samples: {level, fmt, index} â€” varargCount 1.
 */
export function sfxWarnStack(kind) {
  const k = i32(kind);
  if (k === SFX_WARN_KIND_OUT_OF_BOUNDS) {
    return {
      argCount: SFX_OUT_OF_BOUNDS_WARN_ARGS,
      varargCount: SFX_OUT_OF_BOUNDS_WARN_VARARGS,
      level: SFX_OUT_OF_BOUNDS_WARN_LEVEL,
      formatStringVa: SFX_OUT_OF_BOUNDS_WARN_VA,
    };
  }
  if (k === SFX_WARN_KIND_MAX_SAMPLES) {
    return {
      argCount: SFX_MAX_SAMPLES_WARN_ARGS,
      varargCount: SFX_MAX_SAMPLES_WARN_VARARGS,
      level: SFX_MAX_SAMPLES_WARN_LEVEL,
      formatStringVa: SFX_MAX_SAMPLES_WARN_VA,
    };
  }
  if (k === SFX_WARN_KIND_PRELOAD) {
    return {
      argCount: SFX_PRELOAD_WARN_ARGS,
      varargCount: SFX_PRELOAD_WARN_VARARGS,
      level: SFX_PRELOAD_WARN_LEVEL,
      formatStringVa: SFX_LOG_STR_PRELOAD_VA,
    };
  }
  return { argCount: 0, varargCount: 0, level: 0, formatStringVa: 0 };
}

/* ======================= v7: the two SFX stop bodies =======================
 *
…
 */

export const SFX_HOST_VA_STOP_ALL = 0x0092e300;
export const SFX_MANAGER_RECEIVER_OFF = 0x2a324;
export const SFX_STOP_SIZE_BYTES = 0xc5;
export const SFX_STOP_ALL_SIZE_BYTES = 0x123;
export const SFX_STOP_DIRECT_CALLERS = 51;
export const SFX_STOP_ALL_DIRECT_CALLERS = 4;

/* v7 handoff: this family's next VA. The shared continuation table still
 * points at 0x0092cfb0, which landed at v3 â€” see the header handoff block. */
export const SFX_HOST_VA_PRELOAD = 0x0092cf40;
/* v8 lands the whole body; 0x64 is the measured span 0x92cf40..0x92cfa3
 * (ret 4 at 0x92cfa1), correcting the v7 estimate 0x62. */
export const SFX_PRELOAD_SIZE_BYTES = 0x64;
export const SFX_LOG_STR_PRELOAD_VA = 0x00b7b1c4;
export const SFX_PRELOAD_PAD_OFF_199 = 0x199;
export const SFX_PRELOAD_PAD_CLEAR_VALUE = 0;

/* v8: the preload gate's arms (no voice-count test, inverted enabled). */
export const SFX_PRELOAD_GATE_MISS = 0;
export const SFX_PRELOAD_GATE_ENABLED = 1;
export const SFX_PRELOAD_GATE_LOAD = 2;

/* v8: the third logger warn shape {level 1, 0x00b7b1c4, id} WITH vararg. */
export const SFX_WARN_KIND_PRELOAD = 2;
export const SFX_PRELOAD_WARN_LEVEL = 1;
export const SFX_PRELOAD_WARN_ARGS = 3;
export const SFX_PRELOAD_WARN_VARARGS = 1;

/* v8: the 0x0092d140 epilogue host edges and allocator-counter select. */
export const SFX_HOST_VA_FREE_B187DC = 0x00b187dc;
export const SFX_EPILOGUE_HEAP_COUNTER_PTR_VA = 0x00c7de78;
export const SFX_EPILOGUE_HEAP_COUNTER_FALLBACK_VA = 0x00c7f618;
export const SFX_EPILOGUE_HEAP_COUNTER_OFF_30 = 0x30;
export const SFX_EPILOGUE_CRT_COUNTER_STORES = 2;

/* v9: the 0x0092d140 append-arm skip law (0x92d5b0..0x92d6c2). */
export const SFX_APPEND_ARM_GATE_OFF_0C = 0x0c; /* byte [ebx+0xc] = arg2 low */
export const SFX_APPEND_ARM_COUNT_CAP = 0x443;  /* warn iff count >= this */
export const SFX_APPEND_ARM_HOST_CALLS_RUN = 3; /* ctor + push_back + append */

/* v10: 0x00413b90 XML document constructor (whole body). */
export const SFX_HOST_VA_XML_DOC_CTOR = 0x00413b90;
export const SFX_XML_DOC_CTOR_SIZE_BYTES = 0x5b;
export const SFX_XML_DOC_CTOR_INSNS = 22;
export const SFX_XML_DOC_CTOR_CALLERS = 40;
export const SFX_XML_DOC_CTOR_SFX_CALLSITE = 0x0092d3cc;
export const SFX_HOST_VA_XML_DOC_PARSE = 0x004155d0;
export const SFX_XML_DOC_POOL_BASE_OFF = 0x3c;
export const SFX_XML_DOC_POOL_END_OFF = 0x1003c;
export const SFX_XML_DOC_POOL_BYTES = 0x10000;
export const SFX_XML_DOC_OFF_CURSOR_34 = 0x34;
export const SFX_XML_DOC_OFF_POOL_BASE_30 = 0x30;
export const SFX_XML_DOC_OFF_POOL_END_38 = 0x38;
export const SFX_XML_DOC_OFF_POOL_MARK_1003C = 0x1003c;
export const SFX_XML_DOC_OFF_10040 = 0x10040;
export const SFX_XML_DOC_CTOR_STORE_COUNT = 11;
export const SFX_XML_DOC_CTOR_ZERO_STORES = 8;
export const SFX_XML_DOC_CTOR_FIRST_STORE_OFF = 0x1003c;
export const SFX_XML_DOC_CTOR_ALIGN = 4;
export const SFX_XML_DOC_CTOR_STORE_OFFS = Object.freeze([
  0x1003c, 0x00, 0x04, 0x10, 0x14, 0x18, 0x34, 0x20, 0x10040, 0x30, 0x38,
]);

export const SFX_STOP_ALL_GROUP_DISABLED = 0;
export const SFX_STOP_ALL_GROUP_EMPTY = 1;
export const SFX_STOP_ALL_GROUP_WALK = 2;

export const SFX_STOP_DIVERGENCE_COUNT = 9;
export const SFX_STOP_DIVERGE_ABSENT = 0;
export const SFX_STOP_DIVERGE_DIFFERENT = 1;

/* --- the trace machinery --- */

function newTrace() {
  return { blocks: [], effects: [], steps: 0 };
}

function emit(tr, kind, detail) {
  tr.effects.push({ kind, ...detail });
}

/* Follow a block table from `start` until a block returns null. Blocks are
 * `{ [va]: (env, tr) => nextVa | null }`. A step cap keeps a mis-specified
 * back edge from hanging the suite instead of failing it. */
function runTrace(table, start, env, tr, cap) {
  let va = start;
  let steps = 0;
  const limit = cap == null ? 1024 : cap;
  while (va != null && steps < limit) {
    tr.steps++;
    tr.blocks.push(va);
    const fn = table[va];
    if (!fn) break;
    va = fn(env, tr);
    steps++;
  }
  return tr;
}

function countKind(tr, kind) {
  return tr.effects.filter((e) => e.kind === kind).length;
}

function countBlock(tr, va) {
  return tr.blocks.filter((b) => b === va).length;
}

/* --- 0x0092e230 --- */

/* Only LIVE reaches 0x0092e2a0, and 0x0092e2a0 is the first instruction of
 * the loop body, so the sentinel store and "the gate is LIVE" are the same
 * fact. Stated as a block-reachability question, not re-derived. */
export function sfxStopWritesFrameEnd(gateKind) {
  return i32(gateKind) === SFX_GATE_LIVE;
}

const STOP_BLOCKS = {};

/**
 * Whole body of 0x0092e230. `samples[i]` is what the PE observed on voice i:
 * { channelNull, pending09, probeFirst, probeSecond, channelNullReload,
 *   voicesReloaded }.
 */
export function sfxStopPlan(id, spanBytes, voices190, enabled198, samples) {
  const gate = sfxMutatorGate(id, spanBytes, voices190, enabled198);
  const out = {
    gateKind: gate,
    warnLogNeeded: sfxGateWarnLogNeeded(gate, SFX_GATE_FORM_MUTATOR) ? 1 : 0,
    frameEndWrites: 0,
    frameEndValue: 0,
    voicesVisited: 0,
    probeCalls: 0,
    stopCalls: 0,
    pendingClearMask: 0,
    observableStores: 0,
    deviceCalls: 0,
    pureComplete: 1,
    hostIsLoggerOnly: 1,
  };
  if (sfxStopWritesFrameEnd(gate)) {
    out.frameEndValue = SFX_STOP_FRAME_END_SENTINEL;
    const bound = !samples ? 0 : samples.length;
    for (let i = 0; i < bound; i++) {
      const s = samples[i];
      out.voicesVisited++;
      out.frameEndWrites++;
      out.observableStores++;
      if (i32(s.channelNull) === 0) {
        out.probeCalls += sfxProbeVoiceProbeCalls(s.channelNull, s.pending09);
        if (sfxVoiceFirstProbeNeeded(s.channelNull, s.pending09) && s.probeFirst) {
          if (i < 32) out.pendingClearMask |= (1 << i) >>> 0;
          out.observableStores++;
        }
        const act = sfxVoiceAct(s.channelNull, s.pending09, s.probeFirst, s.probeSecond);
        if (sfxStopClearsPending(act, s.channelNullReload)) {
          out.stopCalls++;
          if (i < 32) out.pendingClearMask |= (1 << i) >>> 0;
          out.observableStores++;
        }
      }
      if (!sfxVoiceLoopContinue(i + 1, s.voicesReloaded)) break;
    }
  }
  out.deviceCalls = out.probeCalls + out.stopCalls;
  out.pureComplete = (out.deviceCalls === 0 && out.observableStores === 0) ? 1 : 0;
  out.hostIsLoggerOnly = out.deviceCalls === 0 ? 1 : 0;
  return out;
}

/* --- 0x0092e300 --- */

export function sfxStopAllGroupAction(enabled198, voices190) {
  if (byte(enabled198) === 0) return SFX_STOP_ALL_GROUP_DISABLED;
  if (u32(voices190) === 0) return SFX_STOP_ALL_GROUP_EMPTY;
  return SFX_STOP_ALL_GROUP_WALK;
}

/* 0x0092e3e9 restores ebx from [ebp-8] because the EMPTY test at 0x0092e350
 * zeroed it first. The inner-loop exit at 0x0092e3e6 FALLS THROUGH into it,
 * so a completed walk restores too; only the DISABLED edge jumps past it to
 * 0x0092e3ec, its test at 0x0092e340 running before the xor. */
export function sfxStopAllGroupRestoresIndex(action) {
  return i32(action) !== SFX_STOP_ALL_GROUP_DISABLED;
}

const STOP_ALL_BLOCKS = {};

/** One inner iteration of 0x0092e300, as a four-stage decision. */
export function sfxStopAllVoiceDecide(sample) {
  const out = {
    firstProbeNeeded: false,
    secondProbeNeeded: false,
    pendingClearedEarly: false,
    act: false,
    queryNeeded: false,
    queryFromLoopByte: false,
    queryValue: 0,
    stopCalled: false,
    pendingClearedLate: false,
    probeCalls: 0,
    deviceCalls: 0,
    observableStores: 0,
  };
  if (!sample) return out;
  const s = sample;
  if (i32(s.channelNull) !== 0) return out;
  out.firstProbeNeeded = sfxVoiceFirstProbeNeeded(s.channelNull, s.pending09);
  out.secondProbeNeeded = true;
  out.probeCalls = sfxProbeVoiceProbeCalls(s.channelNull, s.pending09);
  if (out.firstProbeNeeded && s.probeFirst) {
    out.pendingClearedEarly = true;
    out.observableStores++;
  }
  out.act = sfxVoiceAct(s.channelNull, s.pending09, s.probeFirst, s.probeSecond);
  if (!out.act) {
    out.deviceCalls = out.probeCalls;
    return out;
  }
  if (i32(s.channelNullThird) !== 0) {
    out.queryFromLoopByte = true;
    out.queryValue = byte(s.loop08);
  } else {
    out.queryNeeded = true;
    out.queryValue = byte(s.query44);
  }
  if (out.queryValue === 0) {
    out.deviceCalls = out.probeCalls + (out.queryNeeded ? 1 : 0);
    return out;
  }
  if (i32(s.channelNullFourth) === 0) {
    out.stopCalled = true;
    out.pendingClearedLate = true;
    out.observableStores++;
  }
  out.deviceCalls = out.probeCalls + (out.queryNeeded ? 1 : 0) + (out.stopCalled ? 1 : 0);
  return out;
}

/**
 * Whole body of 0x0092e300. `groups[g]` is { enabled198, voices190,
 * firstVoice }; `samples` is the flat voice array.
 */
export function sfxStopAllPlan(spanBytes, groups, samples, voiceCount) {
  const count = sfxEntryCount(spanBytes);
  const out = {
    groupCount: count,
    returnsImmediately: count === 0 ? 1 : 0,
    groupsVisited: 0,
    groupsDisabled: 0,
    groupsEmpty: 0,
    groupsWalked: 0,
    indexRestores: 0,
    voicesVisited: 0,
    probeCalls: 0,
    queryCalls: 0,
    stopCalls: 0,
    deviceCalls: 0,
    observableStores: 0,
    frameEndWrites: 0,
    loggerCalls: 0,
    pureComplete: 1,
    hostIsLoggerOnly: 1,
  };
  const groupBound = groups ? groups.length : 0;
  /* The C++ side bounds the inner loop by voice_count_supplied (the runtime
     voice count), not by the array length — the JS mirror must do the same
     or voices past the sampled window fabricate calls (measured 0x0092e300
     drop divergence at case 1178). */
  const voiceBound = samples
    ? Math.min(samples.length, (voiceCount ?? samples.length) >>> 0)
    : 0;
  if (count !== 0) {
    for (let g = 0; g < groupBound && u32(g) < u32(count); g++) {
      const grp = groups[g];
      out.groupsVisited++;
      const action = sfxStopAllGroupAction(grp.enabled198, grp.voices190);
      out.indexRestores += sfxStopAllGroupRestoresIndex(action) ? 1 : 0;
      if (action === SFX_STOP_ALL_GROUP_DISABLED) {
        out.groupsDisabled++;
        continue;
      }
      if (action === SFX_STOP_ALL_GROUP_EMPTY) {
        out.groupsEmpty++;
        continue;
      }
      out.groupsWalked++;
      for (let i = 0; i < voiceBound; i++) {
        const slot = (grp.firstVoice | 0) + i;
        if (slot < 0 || slot >= voiceBound) break;
        const s = samples[slot];
        out.voicesVisited++;
        const d = sfxStopAllVoiceDecide(s);
        out.probeCalls += d.probeCalls;
        out.queryCalls += d.queryNeeded ? 1 : 0;
        out.stopCalls += d.stopCalled ? 1 : 0;
        out.observableStores += d.observableStores;
        if (!sfxVoiceLoopContinue(i + 1, s.voicesReloaded)) break;
      }
    }
  }
  out.deviceCalls = out.probeCalls + out.queryCalls + out.stopCalls;
  out.pureComplete = (out.deviceCalls === 0 && out.observableStores === 0) ? 1 : 0;
  out.hostIsLoggerOnly = out.deviceCalls === 0 ? 1 : 0;
  return out;
}

/* --- the sibling divergence table --- */

const STOP_DIVERGENCES = [
  { stopSite: 0x0092e2a0, stopAllSite: 0, kind: SFX_STOP_DIVERGE_ABSENT },
  { stopSite: 0x0092e27a, stopAllSite: 0, kind: SFX_STOP_DIVERGE_ABSENT },
  { stopSite: 0, stopAllSite: 0x0092e3ad, kind: SFX_STOP_DIVERGE_ABSENT },
  { stopSite: 0, stopAllSite: 0x0092e3a2, kind: SFX_STOP_DIVERGE_ABSENT },
  { stopSite: 0x0092e270, stopAllSite: 0x0092e359, kind: SFX_STOP_DIVERGE_DIFFERENT },
  { stopSite: 0x0092e290, stopAllSite: 0x0092e34a, kind: SFX_STOP_DIVERGE_DIFFERENT },
  { stopSite: 0x0092e23b, stopAllSite: 0x0092e32a, kind: SFX_STOP_DIVERGE_DIFFERENT },
  { stopSite: 0x0092e2e6, stopAllSite: 0x0092e3d5, kind: SFX_STOP_DIVERGE_DIFFERENT },
  { stopSite: 0, stopAllSite: 0x0092e416, kind: SFX_STOP_DIVERGE_ABSENT },
];

export function sfxStopDivergenceCount() {
  return SFX_STOP_DIVERGENCE_COUNT;
}

export function sfxStopDivergence(id) {
  const i = i32(id);
  if (i < 0 || i >= STOP_DIVERGENCES.length) {
    return { id: -1, stopSite: 0, stopAllSite: 0, kind: 0 };
  }
  const row = STOP_DIVERGENCES[i];
  return { id: i, stopSite: row.stopSite, stopAllSite: row.stopAllSite, kind: row.kind };
}


/* ======================= v8: 0x0092cf40 PreloadSound =======================
 *
…
 */

export function sfxPreloadPadOffset() {
  return SFX_PRELOAD_PAD_OFF_199;
}

export function sfxPreloadGate(id, spanBytes, enabled198) {
  if (!sfxIdInRange(id, spanBytes)) return SFX_PRELOAD_GATE_MISS;
  return byte(enabled198) === 0 ? SFX_PRELOAD_GATE_LOAD : SFX_PRELOAD_GATE_ENABLED;
}

export function sfxPreloadClearsPad(gateKind) {
  return gateKind === SFX_PRELOAD_GATE_MISS ? 0 : 1;
}

export function sfxPreloadPlan(id, spanBytes, enabled198, counterBefore) {
  const gate = sfxPreloadGate(id, spanBytes, enabled198);
  const inRange = gate === SFX_PRELOAD_GATE_MISS ? 0 : 1;
  const load = gate === SFX_PRELOAD_GATE_LOAD ? 1 : 0;
  return {
    gateKind: gate,
    inRange,
    entryOffset: inRange ? sfxEntryOffset(id) : 0,
    padCleared: inRange,
    warnLogNeeded: load,
    loadNeeded: load,
    counterStep: load,
    counterBefore: u32(counterBefore),
    counterAfter: load ? sfxPreloadCounterAfter(counterBefore) : u32(counterBefore),
    hostCalls: load ? 2 : 0,
    observableStores: inRange,
    pureComplete: inRange ? 0 : 1,
    logBeforeLoad: load,
    loadBeforeCounter: load,
    counterBeforePad: load,
  };
}


/* ===================== v9: the append-arm skip law ========================
 *
…
 */

export function sfxAppendArmCount(srcBegin, srcEnd) {
  return sfxEntryCount((u32(srcEnd) - u32(srcBegin)) | 0);
}

export function sfxAppendArmPlan(gateByte, srcBegin, srcEnd, prevCount) {
  const skip = byte(gateByte) === 0 ? 1 : 0;
  const count = skip ? i32(prevCount) : sfxAppendArmCount(srcBegin, srcEnd);
  return {
    skip,
    armRuns: skip ? 0 : 1,
    count,
    warnPath: count >= 0x443 ? 1 : 0,
    prevCountCarried: skip,
    hostMutatesSource: skip ? 0 : 1,
    armStringFreeDead: 1,
    hostCalls: skip ? 0 : 3,
  };
}

/* ============ v9 (wave-2 XML-read half): read prologue, root name,
                proto template, append push ==============================
…
 */

export function sfxTableOpenGate(fileOpenResult) {
  return i32(fileOpenResult) !== 0 ? 1 : 0; /* test edi,edi ; jne */
}

export function sfxTableReadPlan(readSize) {
  return {
    allocSize: (u32(readSize) + 1) >>> 0,
    nulOffset: u32(readSize),
    nulStore: 1,
    counterReset: 1,
    counterOffset: SFX_MGR_OFF_NOT_PRELOADED_COUNT,
    hostEdgeCount: 4,
  };
}

export function sfxTableRootNamePlan(valueNull, value, maxLen) {
  return {
    initStoreCount: 4,
    initCap: 0xf,
    fallbackUsed: i32(valueNull) !== 0 ? 1 : 0,
    nameLen: sfxAttrValueStrlen(valueNull, value, maxLen),
    assignNeeded: 1,
    assignVa: SFX_HOST_VA_STRING_ASSIGN_40CCD0,
  };
}

export function sfxTableProtoInitPlan(site) {
  const append = site ? 1 : 0;
  return {
    siteValid: 1,
    storeCount: 7,
    sentinelOffset: 4,
    sentinelValue: 0xffffffff,
    firstStoreOffset: append ? 0x1a0 : 0x190,
    uninitMask: 0xa,
    ctorVa: SFX_HOST_VA_EHVEC_CTOR,
    ctorCount: SFX_ENTRY_VOICE_DTOR_COUNT,
    ctorStride: SFX_ENTRY_VOICE_DTOR_STRIDE,
    ctorCtorVa: 0x0092ce30,
    ctorDtorVa: 0x0092cf10,
    voiceBaseOff: SFX_ENTRY_VOICE_DTOR_BASE_OFF,
  };
}

export function sfxTablePushPlan(end, cap) {
  const e = u32(end);
  const c = u32(cap);
  const grow = e === c ? 1 : 0;
  return {
    emplace: grow ? 0 : 1,
    grow,
    endAfter: grow ? e : (e + SFX_ENTRY_STRIDE) >>> 0,
    emplaceVa: SFX_HOST_VA_VECTOR_EMPLACE,
    growVa: SFX_HOST_VA_VECTOR_GROW_APPEND,
  };
}

/* ===================== v10: 0x00413b90 XML document ctor ==================
 *
…
 */

export function sfxXmlDocCtorPoolBase(thisPtr) {
  return (u32(thisPtr) + SFX_XML_DOC_POOL_BASE_OFF) >>> 0;
}

export function sfxXmlDocCtorPoolEnd(thisPtr) {
  return (u32(thisPtr) + SFX_XML_DOC_POOL_END_OFF) >>> 0;
}

export function sfxXmlDocCtorAlignSlack(thisPtr) {
  const pool = sfxXmlDocCtorPoolBase(thisPtr);
  return (0 - pool) >>> 0 & 3;
}

export function sfxXmlDocCtorCursor(thisPtr) {
  return (sfxXmlDocCtorPoolBase(thisPtr) + sfxXmlDocCtorAlignSlack(thisPtr)) >>> 0;
}

export function sfxXmlDocCtorWritesOffset(off) {
  return SFX_XML_DOC_CTOR_STORE_OFFS.includes(u32(off)) ? 1 : 0;
}

export function sfxXmlDocCtorPlan(thisPtr) {
  return {
    poolBase: sfxXmlDocCtorPoolBase(thisPtr),
    poolEnd: sfxXmlDocCtorPoolEnd(thisPtr),
    cursor: sfxXmlDocCtorCursor(thisPtr),
    alignSlack: sfxXmlDocCtorAlignSlack(thisPtr),
    storeCount: SFX_XML_DOC_CTOR_STORE_COUNT,
    zeroStoreCount: SFX_XML_DOC_CTOR_ZERO_STORES,
    firstStoreOffset: SFX_XML_DOC_CTOR_FIRST_STORE_OFF,
    hostCalls: 0,
    returnsThis: 1,
    sizeBytes: SFX_XML_DOC_CTOR_SIZE_BYTES,
    callerCount: SFX_XML_DOC_CTOR_CALLERS,
  };
}

/* ===================== v8: the 0x0092d140 epilogue ========================
 *
…
 */

export function sfxTableEpiloguePlan(rootNameCapacity, rootNamePtrMinusBack,
                                     bufferNull, heapStateNull) {
  const sfp = sfxStringFreePlan(rootNameCapacity, rootNamePtrMinusBack);
  const bufferFree = i32(bufferNull) === 0 ? 1 : 0;
  const rootFreeHost = sfp.corruptFatal ? 1 : (sfp.freeNeeded ? 1 : 0);
  return {
    rootNameFreeNeeded: sfp.freeNeeded ? 1 : 0,
    rootUsesBackPointer: sfp.usesBackPointer ? 1 : 0,
    rootFreeSize: sfp.freeSize,
    rootSlackChecked: sfp.slackChecked ? 1 : 0,
    rootCorruptFatal: sfp.corruptFatal ? 1 : 0,
    rootResetStores: 0,
    docDtorRuns: 1,
    docDtorVa: SFX_HOST_VA_DOC_DTOR_414730,
    bufferFreeNeeded: bufferFree,
    bufferFreeVa: SFX_HOST_VA_FREE_B187DC,
    crtCounterStores: bufferFree ? SFX_EPILOGUE_CRT_COUNTER_STORES : 0,
    counterUsesFallback: i32(heapStateNull) !== 0 ? 1 : 0,
    counterFallbackVa: SFX_EPILOGUE_HEAP_COUNTER_FALLBACK_VA,
    returnsAl1: 1,
    hostCalls: rootFreeHost + 1 + bufferFree,
    observableStores: 0,
    pureComplete: 0,
    stringFreeBeforeDtor: 1,
    dtorBeforeBufferFree: 1,
  };
}

/* ===================== v11: 0x004155d0 XML document Parse islands =========
 *
 * Not the whole body. Nested parse 0x00416040 (allocator 0x416510 inside)
 * and the input/whitespace skip stay host. The islands are the FULL-WORD
 * head tests, the LOW-BYTE UTF-8 BOM, the 0xb1b060 space predicate (1 at
 * 9/10/13/32 only), EMPTY / '<' / ERROR, and which this-offsets Parse
 * writes. Independently reasoned from the PE, not copied from the C++.
 * v12 lands the next sequential helpers: ATTR find 0x00413bf0 and
 * CHILD find 0x00413c70 below.
 */

export const SFX_XML_DOC_PARSE_SIZE_BYTES = 0xe5;
export const SFX_XML_DOC_PARSE_INSNS = 88;
export const SFX_XML_DOC_PARSE_CALLERS = 40;
export const SFX_XML_DOC_PARSE_SFX_CALLSITE = 0x0092d3e4;
export const SFX_HOST_VA_XML_NESTED_PARSE = 0x00416040;
export const SFX_HOST_VA_XML_PARSE_ERROR_SLOT = 0x00c7de4c;
export const SFX_XML_PARSE_ERROR_STR_VA = 0x00b1b66c;
export const SFX_XML_PARSE_SPACE_TABLE_VA = 0x00b1b060;
export const SFX_HOST_VA_XML_ATTR_FIND = 0x00413bf0; /* v12: landed, pure */
export const SFX_HOST_VA_XML_CHILD_FIND = 0x00413c70; /* v12: landed, pure */
export const SFX_XML_PARSE_BOM0 = 0xef;
export const SFX_XML_PARSE_BOM1 = 0xbb;
export const SFX_XML_PARSE_BOM2 = 0xbf;
export const SFX_XML_PARSE_BOM_SKIP = 3;
export const SFX_XML_PARSE_LT = 0x3c;
export const SFX_XML_PARSE_SPACE_TAB = 9;
export const SFX_XML_PARSE_SPACE_LF = 10;
export const SFX_XML_PARSE_SPACE_CR = 13;
export const SFX_XML_PARSE_SPACE_SP = 32;
export const SFX_XML_PARSE_GATE_EMPTY = 0;
export const SFX_XML_PARSE_GATE_LT = 1;
export const SFX_XML_PARSE_GATE_ERROR = 2;
export const SFX_XML_DOC_OFF_18 = 0x18;
export const SFX_XML_DOC_OFF_20 = 0x20;
export const SFX_XML_DOC_OFF_LAST_1C = 0x1c;
export const SFX_XML_DOC_PARSE_THIS_STORE_COUNT = 3;
export const SFX_XML_NESTED_PARSE_CALLERS = 3;
export const SFX_XML_ATTR_FIND_CALLERS = 39;
export const SFX_XML_CHILD_FIND_CALLERS = 96;
export const SFX_XML_ATTR_FIND_SIZE_BYTES = 0x72;
export const SFX_XML_DOC_PARSE_THIS_STORE_OFFS = Object.freeze([
  0x18, 0x20, 0x1c,
]);

export function sfxXmlDocParseHeadLive(head) {
  return u32(head) !== 0 ? 1 : 0;
}

export function sfxXmlDocParseBomSkip(b0, b1, b2) {
  if (byte(b0) === SFX_XML_PARSE_BOM0 &&
      byte(b1) === SFX_XML_PARSE_BOM1 &&
      byte(b2) === SFX_XML_PARSE_BOM2) {
    return SFX_XML_PARSE_BOM_SKIP;
  }
  return 0;
}

export function sfxXmlDocParseIsSpace(b) {
  const c = byte(b);
  return (c === SFX_XML_PARSE_SPACE_TAB ||
          c === SFX_XML_PARSE_SPACE_LF ||
          c === SFX_XML_PARSE_SPACE_CR ||
          c === SFX_XML_PARSE_SPACE_SP) ? 1 : 0;
}

export function sfxXmlDocParseGate(b) {
  const c = byte(b);
  if (c === 0) return SFX_XML_PARSE_GATE_EMPTY;
  if (c === SFX_XML_PARSE_LT) return SFX_XML_PARSE_GATE_LT;
  return SFX_XML_PARSE_GATE_ERROR;
}

export function sfxXmlDocParseWritesThisOffset(off) {
  return SFX_XML_DOC_PARSE_THIS_STORE_OFFS.includes(u32(off)) ? 1 : 0;
}

export function sfxXmlDocParsePlan(childrenHead, attrsHead, b0, b1, b2,
                                   afterWsByte, parsedNode, firstChildRe) {
  const gate = sfxXmlDocParseGate(afterWsByte);
  const nested = gate === SFX_XML_PARSE_GATE_LT ? 1 : 0;
  const link = (nested !== 0 && u32(parsedNode) !== 0) ? 1 : 0;
  return {
    childrenWalk: sfxXmlDocParseHeadLive(childrenHead),
    attrsWalk: sfxXmlDocParseHeadLive(attrsHead),
    detachChildren: 1,
    detachAttrs: 1,
    bomSkip: sfxXmlDocParseBomSkip(b0, b1, b2),
    gateKind: gate,
    nestedParseNeeded: nested,
    nestedParseVa: SFX_HOST_VA_XML_NESTED_PARSE,
    errorStore: gate === SFX_XML_PARSE_GATE_ERROR ? 1 : 0,
    errorSlotVa: SFX_HOST_VA_XML_PARSE_ERROR_SLOT,
    errorStrVa: SFX_XML_PARSE_ERROR_STR_VA,
    linkNeeded: link,
    linkFirst: (link !== 0 && u32(firstChildRe) === 0) ? 1 : 0,
    hostCalls: nested,
    pureComplete: 0,
    sizeBytes: SFX_XML_DOC_PARSE_SIZE_BYTES,
    callerCount: SFX_XML_DOC_PARSE_CALLERS,
  };
}

/* ===================== v12: XML ATTR/CHILD name find ======================
 *
 * 0x00413bf0 (ATTR find) and 0x00413c70 (CHILD find) are byte-identical
 * twins over 125/128 bytes — the 3-byte law is (head [this+X], next
 * [node+Y], null-name return [this+X]). Full bodies: 71 insns, 0 E8,
 * 0 indirect, 0 stores, three `ret 0xc`. Independently re-traced from
 * the PE, branch by branch:
 *
 *   arg = C-string at [esp+4] (this in ecx).
 *   arg == 0          -> return [this+head_off]          (NULL_ARG)
 *   len = strlen(arg) (scan to NUL, length = end - arg)
 *   node = [this+head_off] ;  node == 0 -> return 0      (MISS)
 *   per node:
 *     buf = [node+0x00]                                  (name ptr)
 *     buf == 0 -> size = 0, buf = 0x00c71640 (empty-inline SSO arm)
 *     buf != 0 -> size = [node+0x08]                     (name length)
 *     size != len                  -> next node
 *     size == len -> compare `size` bytes: buf[i] vs arg[i]
 *         all equal -> return node                       (MATCH)
 *     next = [node+next_off] ;  next == 0 -> return 0    (MISS)
 *
 * ATTR: head_off 0x20, next_off 0x18, 39 rel32 callers.
 * CHILD: head_off 0x18, next_off 0x2c, 96 rel32 callers.
 * node+0x00 / node+0x08 are the family's SFX_XML_NODE_OFF_NAME_00 /
 * SFX_XML_NODE_OFF_NAME_LEN_08 (custom {ptr,len} pair, not std::string);
 * 0x00c71640 is SFX_ATTR_EMPTY_STRING_VA (also the v5 "" fallback).
 */

export const SFX_XML_ATTR_FIND_HEAD_OFF = 0x20;
export const SFX_XML_ATTR_FIND_NEXT_OFF = 0x18;
export const SFX_XML_CHILD_FIND_HEAD_OFF = 0x18;
export const SFX_XML_CHILD_FIND_NEXT_OFF = 0x2c;
export const SFX_XML_FIND_NAME_OFF = SFX_XML_NODE_OFF_NAME_00; /* 0x00 */
export const SFX_XML_FIND_NAME_LEN_OFF = SFX_XML_NODE_OFF_NAME_LEN_08; /* 0x08 */
export const SFX_XML_FIND_EMPTY_STRING_VA = SFX_ATTR_EMPTY_STRING_VA; /* 0x00c71640 */
export const SFX_XML_FIND_SIZE_BYTES = 0x72; /* 0x413bf0..0x413c61 / 0x413c70..0x413ce1 */
export const SFX_XML_FIND_INSNS = 71;
export const SFX_XML_FIND_RET_ADJUST = 0xc;  /* 3 dwords: this + 2 args */
export const SFX_XML_FIND_KIND_MISS = 0;     /* xor eax,eax ; ret 0xc */
export const SFX_XML_FIND_KIND_MATCH = 1;    /* mov eax,edx ; ret 0xc */
export const SFX_XML_FIND_KIND_NULL_ARG = 2; /* mov eax,[this+head] ; ret 0xc */

function xmlMemU32(mem, addr) {
  addr = u32(addr);
  return (mem[addr] | (mem[addr + 1] << 8) |
          (mem[addr + 2] << 16) | (mem[addr + 3] << 24)) >>> 0;
}
function xmlMemByte(mem, addr) {
  return mem[u32(addr)] & 0xff;
}

/** Twin template shared by both finds. Walks exact machine control flow:
 *  strlen scan -> head -> per-node SSO name decode -> length compare ->
 *  byte compare -> next. Fully pure (0 calls / 0 stores / 0 host edges). */
export function sfxXmlFindPlan(mem, {
  receiver, argAddr, headOff, nextOff, callerCount,
}) {
  const plan = {
    entered: 0, argNull: 0, argLen: 0, head: 0, headNull: 0,
    kind: SFX_XML_FIND_KIND_MISS, result: 0, visited: 0, matchedIndex: -1,
    hostCalls: 0, pureComplete: 1, sizeBytes: SFX_XML_FIND_SIZE_BYTES,
    callerCount,
  };
  if (u32(receiver) === 0) return plan;
  plan.entered = 1;
  const head = xmlMemU32(mem, u32(receiver) + headOff);
  plan.head = head;
  if (u32(argAddr) === 0) {
    plan.argNull = 1;
    plan.kind = SFX_XML_FIND_KIND_NULL_ARG;
    plan.result = head;
    return plan;
  }
  let len = 0;
  while (xmlMemByte(mem, u32(argAddr) + len) !== 0) len++;
  plan.argLen = len;
  if (head === 0) {
    plan.headNull = 1;
    plan.kind = SFX_XML_FIND_KIND_MISS;
    return plan;
  }
  let node = head;
  let idx = 0;
  while (node !== 0) {
    plan.visited += 1;
    const buf = xmlMemU32(mem, u32(node) + SFX_XML_FIND_NAME_OFF);
    let size;
    let bufVa;
    if (buf === 0) {
      size = 0;
      bufVa = SFX_XML_FIND_EMPTY_STRING_VA;
    } else {
      size = xmlMemU32(mem, u32(node) + SFX_XML_FIND_NAME_LEN_OFF);
      bufVa = buf;
    }
    if (u32(size) === len) {
      let ok = 1;
      for (let i = 0; i < len; i++) {
        if (xmlMemByte(mem, u32(bufVa) + i) !== xmlMemByte(mem, u32(argAddr) + i)) {
          ok = 0;
          break;
        }
      }
      if (ok !== 0) {
        plan.kind = SFX_XML_FIND_KIND_MATCH;
        plan.result = node;
        plan.matchedIndex = idx;
        return plan;
      }
    }
    node = xmlMemU32(mem, u32(node) + nextOff);
    idx++;
  }
  plan.kind = SFX_XML_FIND_KIND_MISS;
  return plan;
}

export function sfxXmlAttrFindPlan(mem, opts) {
  return sfxXmlFindPlan(mem, {
    ...opts,
    headOff: SFX_XML_ATTR_FIND_HEAD_OFF,
    nextOff: SFX_XML_ATTR_FIND_NEXT_OFF,
    callerCount: SFX_XML_ATTR_FIND_CALLERS,
  });
}

export function sfxXmlChildFindPlan(mem, opts) {
  return sfxXmlFindPlan(mem, {
    ...opts,
    headOff: SFX_XML_CHILD_FIND_HEAD_OFF,
    nextOff: SFX_XML_CHILD_FIND_NEXT_OFF,
    callerCount: SFX_XML_CHILD_FIND_CALLERS,
  });
}

/* ---------- v13: 0x00423480 the ".ogg" suffix compare ---------- */

/* PE 0x423487: `mov esi,edx ; cmp ebx,edx ; cmovb esi,ebx` — the UNSIGNED
   min of the two lengths. `cmovb` fires on borrow, i.e. len_b < len_a. */
export const SFX_OGG_LITERAL_VA = 0x00b7b1bc;
export const SFX_OGG_BYTE0 = 0x2e; /* '.' */
export const SFX_OGG_BYTE1 = 0x6f; /* 'o' */
export const SFX_OGG_BYTE2 = 0x67; /* 'g' */
export const SFX_OGG_BYTE3 = 0x67; /* 'g' */
export const SFX_OGG_DWORD_LE = 0x67676f2e;
export const SFX_OGG_SUFFIX_LEN = 4;
export const SFX_HOST_VA_OGG_COMPARE = 0x00423480;
export const SFX_OGG_COMPARE_SIZE_BYTES = 0x7d;
export const SFX_OGG_COMPARE_INSNS = 65;
export const SFX_OGG_COMPARE_CALLERS = 33;
export const SFX_OGG_COMPARE_SFX_CALLSITE = 0x0092d052;

export function sfxCmpCommonLen(lenA, lenB) {
  const a = u32(lenA);
  const b = u32(lenB);
  return b < a ? b : a;
}

/* PE 0x4234e8..0x4234f6: `cmp len_b,len_a ; jbe`; the jbe path folds the
   borrow through `sbb eax,eax ; neg eax` (+1 iff len_a > len_b), the fall
   path stores -1 (len_b > len_a). */
export function sfxCmpLengthTie(lenA, lenB) {
  const a = u32(lenA);
  const b = u32(lenB);
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

/* PE 0x4234db `sbb eax,eax ; or eax,1`: the borrow of the last byte compare
   is set exactly when a_byte < b_byte (UNSIGNED), so the differing byte
   resolves +1 for a > b and -1 for a < b. */
export function sfxCmpByteResolve(a, b) {
  const av = byte(a);
  const bv = byte(b);
  return av > bv ? 1 : -1;
}

/* The body's comparison over the first n of the four slots: the dword pass
   (0x423498) and the byte tail (0x4234ae) decide the common prefix exactly
   as the machine does. */
export function sfxCmp4Prefix(a0, a1, a2, a3, b0, b1, b2, b3, n) {
  const a = [byte(a0), byte(a1), byte(a2), byte(a3)];
  const b = [byte(b0), byte(b1), byte(b2), byte(b3)];
  const m = u32(n) < 4 ? u32(n) : 4;
  for (let i = 0; i < m; i++) {
    if (a[i] !== b[i]) return sfxCmpByteResolve(a[i], b[i]);
  }
  return 0;
}

/* The LE dword the dword pass compares (`mov eax,[ecx]`). */
export function sfxCmpDwordLe(b0, b1, b2, b3) {
  return (
    byte(b0) |
    (byte(b1) << 8) |
    (byte(b2) << 16) |
    ((byte(b3) << 24) >>> 0)
  ) >>> 0;
}

/* Full body for the four-byte span (the site's lengths are always 4): one
   LE dword pass at 0x423498, then the byte resolution at 0x4234ae when the
   dwords differ. Returns -1 / 0 / +1. */
export function sfxCmp4ThreeWay(a0, a1, a2, a3, b0, b1, b2, b3) {
  if (sfxCmpDwordLe(a0, a1, a2, a3) !== sfxCmpDwordLe(b0, b1, b2, b3)) {
    return sfxCmp4Prefix(a0, a1, a2, a3, b0, b1, b2, b3, 4);
  }
  return 0;
}

/* The Load call at 0x0092d052: a-side = the resolved tail bytes, b-side is
   pinned to the ".ogg" literal (2e 6f 67 67). 0 exactly on a match. */
export function sfxOggSuffixCompare(b0, b1, b2, b3) {
  return sfxCmp4ThreeWay(b0, b1, b2, b3, SFX_OGG_BYTE0, SFX_OGG_BYTE1,
                         SFX_OGG_BYTE2, SFX_OGG_BYTE3);
}

/* 0x0092d05a `test eax,eax ; jne create ; mov al,1` — zero result streams.
   This is the decision v3 consumed as an opaque host bit. */
export function sfxOggSuffixMatch(b0, b1, b2, b3) {
  return sfxOggSuffixCompare(b0, b1, b2, b3) === 0 ? 1 : 0;
}

/* Integration: the same law as sfxLoadStreamByte, computed from the four
   resolved-path tail bytes instead of an opaque compare result. */
export function sfxLoadStreamByteFromTail(b0, b1, b2, b3) {
  return sfxOggSuffixMatch(b0, b1, b2, b3) !== 0
    ? SFX_LOAD_STREAM_BYTE_STREAM
    : SFX_LOAD_STREAM_BYTE_STATIC;
}

export function sfxSuffixComparePlan(
  a0, a1, a2, a3, b0, b1, b2, b3, lenA, lenB,
) {
  const common = sfxCmpCommonLen(lenA, lenB);
  const n = common < 4 ? common : 4;
  const prefix = sfxCmp4Prefix(a0, a1, a2, a3, b0, b1, b2, b3, n);
  const three = prefix !== 0 ? prefix : sfxCmpLengthTie(lenA, lenB);
  return {
    commonLen: u32(common),
    dwordLoop: common >= 4 ? 1 : 0,
    prefixEqual: prefix === 0 ? 1 : 0,
    threeWay: i32(three),
    match: three === 0 ? 1 : 0,
    tailBytes: u32(common % 4),
  };
}

/* ===================== v14: 0x00416040 the nested XML node parse =========
 *
 * The decision layer of the document's nested node parser. The whole body
 * stays host-irreducible: the three callees — node allocator 0x416510
 * (which itself calls 0xa0f4e0 / an indirect pool allocator), attrs
 * 0x4165a0, children 0x416770 — and the host-length input walks remain
 * host. What is landed here duplicates NOTHING from the C++ (each law is
 * independently re-traced from the machine listing):
 *
 *   head byte 0x21 '!' -> MARKUP, 0x3f '?' -> PI, else ELEMENT.
 *   name chars: table 0xb1ae60 (1 except 0,9,10,13,32,47,62,63).
 *   PI decl gate: x|X m|M l|L + space table byte 4.
 *   markup kind: "<!--" / "<!DOCTYPE "+space / "<![CDATA[" (b7==b1) /
 *     generic, in machine order.
 *   element name error: name_len==0 -> 0xb1b690 else prev (FULL-WORD).
 *   tail '/' close: close byte 0x3e -> prev else 0xb1b6a8.
 *   scan NUL latch: byte 0 -> 0xb1b678 ("unexpected end of data").
 *   node type at +0x14: ELEMENT 1, CDATA 3; init stores at
 *     {0x00,0x04,0x10,0x14,0x18,0x20}.
 *   NUL-in-place: element name_ptr+name_len; cdata text at found_pos.
 *   cursor after: elem post_attrs +1(>'')/+2('/')/0; PI found+2,
 *     COMMENT/CDATA found+3, DOCTYPE found+1, GENERIC found+1.
 */

export const SFX_XML_NESTED_PARSE_SIZE_BYTES = 0x3f1;
export const SFX_XML_NESTED_PARSE_INSNS = 336;
export const SFX_XML_NESTED_PARSE_RETS = 7;
export const SFX_XML_NESTED_PARSE_E8 = 4;
export const SFX_XML_NESTED_PARSE_STORES = 50;
export const SFX_XML_NESTED_NAME_TABLE_VA = 0x00b1ae60;
export const SFX_XML_NESTED_ERR_UNEXPECTED_VA = 0x00b1b678;
export const SFX_XML_NESTED_ERR_NAME_VA = 0x00b1b690;
export const SFX_XML_NESTED_ERR_GT_VA = 0x00b1b6a8;
export const SFX_XML_NESTED_HEAD_ELEMENT = 0;
export const SFX_XML_NESTED_HEAD_PI = 1;
export const SFX_XML_NESTED_HEAD_MARKUP = 2;
export const SFX_XML_NESTED_HEAD_BANG = 0x21;
export const SFX_XML_NESTED_HEAD_QMARK = 0x3f;
export const SFX_XML_NESTED_TAIL_OTHER = 0;
export const SFX_XML_NESTED_TAIL_GT = 1;
export const SFX_XML_NESTED_TAIL_CLOSE = 2;
export const SFX_XML_NESTED_TAIL_GT_BYTE = 0x3e;
export const SFX_XML_NESTED_TAIL_SLASH_BYTE = 0x2f;
export const SFX_XML_NESTED_MARKUP_DASH_BYTE = 0x2d;
export const SFX_XML_NESTED_MARKUP_GENERIC = 0;
export const SFX_XML_NESTED_MARKUP_COMMENT = 1;
export const SFX_XML_NESTED_MARKUP_CDATA = 2;
export const SFX_XML_NESTED_MARKUP_DOCTYPE = 3;
export const SFX_XML_NESTED_NODE_TYPE_ELEMENT = 1;
export const SFX_XML_NESTED_NODE_TYPE_CDATA = 3;
export const SFX_XML_NESTED_NODE_SIZE = 0x30;
export const SFX_XML_NESTED_ALLOC_VA = 0x00416510;
export const SFX_XML_NESTED_ALLOC_TARGET = 0x00a0f4e0;
export const SFX_XML_NESTED_ATTRS_VA = 0x004165a0;
export const SFX_XML_NESTED_CHILDREN_VA = 0x00416770;
export const SFX_XML_NODE_OFF_TEXT_04 = 0x04;
export const SFX_XML_NODE_OFF_TEXT_LEN_0C = 0x0c;
export const SFX_XML_NODE_OFF_TYPE_14 = 0x14;
export const SFX_XML_NODE_OFF_PARENT_10 = 0x10;
export const SFX_XML_NESTED_INIT_OFFSETS_COUNT = 6;

const SFX_XML_NESTED_NAME_ZEROS = new Set([0, 9, 10, 13, 32, 47, 62, 63]);

export function sfxXmlNestedParseHeadGate(headByte) {
  const h = byte(headByte);
  if (h === SFX_XML_NESTED_HEAD_BANG) return SFX_XML_NESTED_HEAD_MARKUP;
  if (h === SFX_XML_NESTED_HEAD_QMARK) return SFX_XML_NESTED_HEAD_PI;
  return SFX_XML_NESTED_HEAD_ELEMENT;
}

export function sfxXmlNestedParseNameChar(b) {
  return SFX_XML_NESTED_NAME_ZEROS.has(byte(b)) ? 0 : 1;
}

export function sfxXmlNestedParsePiDeclGate(b1, b2, b3, b4) {
  const x = byte(b1), m = byte(b2), l = byte(b3);
  const xOk = (x === 0x78 || x === 0x58) ? 1 : 0;
  const mOk = (m === 0x6d || m === 0x4d) ? 1 : 0;
  const lOk = (l === 0x6c || l === 0x4c) ? 1 : 0;
  if (xOk === 0 || mOk === 0 || lOk === 0) return 0;
  return sfxXmlDocParseIsSpace(b4) !== 0 ? 1 : 0;
}

export function sfxXmlNestedParseMarkupKind(b1, b2, b3, b4, b5, b6, b7, b8) {
  const c1 = byte(b1), c2 = byte(b2), c3 = byte(b3), c4 = byte(b4);
  const c5 = byte(b5), c6 = byte(b6), c7 = byte(b7);
  if (c1 === 0x2d && c2 === 0x2d) {
    return SFX_XML_NESTED_MARKUP_COMMENT;
  }
  if (c1 === 0x44 && c2 === 0x4f && c3 === 0x43 && c4 === 0x54 &&
      c5 === 0x59 && c6 === 0x50 && c7 === 0x45) {
    if (sfxXmlDocParseIsSpace(b8) !== 0) return SFX_XML_NESTED_MARKUP_DOCTYPE;
    return SFX_XML_NESTED_MARKUP_GENERIC;
  }
  if (c1 === 0x5b && c2 === 0x43 && c3 === 0x44 && c4 === 0x41 &&
      c5 === 0x54 && c6 === 0x41 && c7 === c1) {
    return SFX_XML_NESTED_MARKUP_CDATA;
  }
  return SFX_XML_NESTED_MARKUP_GENERIC;
}

export function sfxXmlNestedParseNameLen(nameStart, nameEnd) {
  return u32(nameEnd - nameStart);
}

export function sfxXmlNestedParseNameError(prevError, nameLen) {
  return u32(nameLen) === 0 ? SFX_XML_NESTED_ERR_NAME_VA : u32(prevError);
}

export function sfxXmlNestedParseTailError(prevError, closeByte) {
  return byte(closeByte) === SFX_XML_NESTED_TAIL_GT_BYTE
    ? u32(prevError)
    : SFX_XML_NESTED_ERR_GT_VA;
}

export function sfxXmlNestedParseScanError(prevError, b) {
  return byte(b) === 0 ? SFX_XML_NESTED_ERR_UNEXPECTED_VA : u32(prevError);
}

export function sfxXmlNestedParseNodeType(headGate, markupKind) {
  if (headGate === SFX_XML_NESTED_HEAD_ELEMENT) return SFX_XML_NESTED_NODE_TYPE_ELEMENT;
  if (headGate === SFX_XML_NESTED_HEAD_MARKUP &&
      markupKind === SFX_XML_NESTED_MARKUP_CDATA) return SFX_XML_NESTED_NODE_TYPE_CDATA;
  return 0;
}

const SFX_XML_NESTED_INIT_OFFSETS = [0x00, 0x04, 0x10, 0x14, 0x18, 0x20];

export function sfxXmlNestedParseNodeWritesOffset(off) {
  return SFX_XML_NESTED_INIT_OFFSETS.includes(u32(off)) ? 1 : 0;
}

export function sfxXmlNestedParseNulPosition(namePtr, nameLen) {
  return u32(u32(namePtr) + u32(nameLen));
}

export function sfxXmlNestedParseCdataTextLen(textStart, found) {
  return u32(found - textStart);
}

export function sfxXmlNestedParseCursorAfter(headGate, markupKind, tailGate,
                                             postAttrs, foundPos) {
  if (headGate === SFX_XML_NESTED_HEAD_ELEMENT) {
    let c = u32(postAttrs);
    if (tailGate === SFX_XML_NESTED_TAIL_GT) c = u32(c + 1);
    else if (tailGate === SFX_XML_NESTED_TAIL_CLOSE) c = u32(c + 2);
    return c;
  }
  switch (markupKind) {
    case SFX_XML_NESTED_MARKUP_COMMENT:
      return u32(foundPos + 3);
    case SFX_XML_NESTED_MARKUP_CDATA:
      return u32(foundPos + 3);
    case SFX_XML_NESTED_MARKUP_DOCTYPE:
      return u32(foundPos + 1);
    default:
      return headGate === SFX_XML_NESTED_HEAD_PI
        ? u32(foundPos + 2)
        : u32(foundPos + 1);
  }
}

export function sfxXmlNestedParsePlan(cursorBase, postAttrs, headGate,
                                      markupKind, nameLen, wsSkip,
                                      tailGate, closeByte, foundPos,
                                      scanLatched, prevError) {
  const nodeType = sfxXmlNestedParseNodeType(headGate, markupKind);
  const plan = {
    entered: 1,
    headGate,
    markupKind,
    nodeType,
    allocatorCall: nodeType !== 0 ? 1 : 0,
    allocatorVa: SFX_XML_NESTED_ALLOC_VA,
    allocatorTarget: SFX_XML_NESTED_ALLOC_TARGET,
    nodeSize: SFX_XML_NESTED_NODE_SIZE,
    attrsCall: headGate === SFX_XML_NESTED_HEAD_ELEMENT ? 1 : 0,
    attrsVa: SFX_XML_NESTED_ATTRS_VA,
    childrenCall: (headGate === SFX_XML_NESTED_HEAD_ELEMENT &&
                   tailGate === SFX_XML_NESTED_TAIL_GT) ? 1 : 0,
    childrenVa: SFX_XML_NESTED_CHILDREN_VA,
    namePtr: 0,
    nameLen: 0,
    nameEmpty: 0,
    nameError: u32(prevError),
    wsSkip: 0,
    tailGate,
    closeError: 0,
    errorSlot: u32(prevError),
    errorStore: 0,
    scanLatched: scanLatched !== 0 ? 1 : 0,
    textPtr: 0,
    textLen: 0,
    nulPos: 0,
    cursorAfter: 0,
    hostCalls: 0,
    pureComplete: 0,
    sizeBytes: SFX_XML_NESTED_PARSE_SIZE_BYTES,
    callerCount: SFX_XML_NESTED_PARSE_CALLERS,
  };
  if (headGate === SFX_XML_NESTED_HEAD_ELEMENT) {
    plan.namePtr = u32(cursorBase);
    plan.nameLen = u32(nameLen);
    plan.nameEmpty = u32(nameLen) === 0 ? 1 : 0;
    plan.nameError = sfxXmlNestedParseNameError(prevError, nameLen);
    plan.wsSkip = i32(wsSkip);
    plan.errorSlot = plan.nameError;
    plan.errorStore = 1;
    if (tailGate === SFX_XML_NESTED_TAIL_GT) {
      /* children call leaves it */
    } else if (tailGate === SFX_XML_NESTED_TAIL_CLOSE) {
      plan.closeError = sfxXmlNestedParseTailError(plan.nameError, closeByte);
      plan.errorSlot = plan.closeError;
    } else {
      plan.errorSlot = SFX_XML_NESTED_ERR_GT_VA;
    }
    plan.nulPos = u32(plan.namePtr) !== 0
      ? sfxXmlNestedParseNulPosition(plan.namePtr, plan.nameLen)
      : SFX_ATTR_EMPTY_STRING_VA;
    plan.hostCalls = plan.allocatorCall + plan.attrsCall + plan.childrenCall;
  } else if (headGate === SFX_XML_NESTED_HEAD_PI ||
             headGate === SFX_XML_NESTED_HEAD_MARKUP) {
    plan.errorSlot = plan.scanLatched !== 0
      ? SFX_XML_NESTED_ERR_UNEXPECTED_VA
      : u32(prevError);
    if (headGate === SFX_XML_NESTED_HEAD_MARKUP &&
        markupKind === SFX_XML_NESTED_MARKUP_DOCTYPE) {
      plan.errorStore = plan.scanLatched;
    } else if (headGate === SFX_XML_NESTED_HEAD_MARKUP &&
               markupKind === SFX_XML_NESTED_MARKUP_GENERIC) {
      plan.errorStore = u32(foundPos) !== u32(cursorBase + 1) ? 1 : 0;
    } else {
      plan.errorStore = 1;
    }
    if (headGate === SFX_XML_NESTED_HEAD_MARKUP &&
        markupKind === SFX_XML_NESTED_MARKUP_CDATA) {
      plan.textPtr = u32(cursorBase + 8);
      plan.textLen = sfxXmlNestedParseCdataTextLen(plan.textPtr, foundPos);
      plan.nulPos = u32(foundPos);
    }
    plan.hostCalls = plan.allocatorCall;
  } else {
    plan.hostCalls = 0;
  }
  plan.cursorAfter = sfxXmlNestedParseCursorAfter(
    headGate, markupKind, tailGate, postAttrs, foundPos,
  );
  return plan;
}

/* ===================== v15: 0x00416510 pool + 0x004165a0 attrs ============
 *
 * The node allocator's pool arithmetic and the attrs parse's decision
 * laws (see the header's v15 block and the CPU listings). The allocator
 * grow call (0xa0f4e0 direct / [pool+0x1000c] indirect) and the attrs
 * scanner callees (0x416b70 / 0x416920) stay host; everything below is
 * re-traced branch-by-branch from the machine:
 *
 *   0x41651a..0x416522  align4(x) = x + ((-x) & 3), wrap.
 *   0x416525..0x41652b  need_grow = align4(free)+size > end, UNSIGNED.
 *   0x416533..0x416540  grow_request = max(size,0x10000)+0xa, UNSIGNED.
 *   0x41656d..0x416594  grow tail given host alloc r: link_slot=align4(r),
 *     node_ptr=align4(link_slot+4), base=r, end=r+request, free=node+size.
 *   0x41658f..0x416594  fast tail: ptr=align4(free), free=ptr+size.
 *   attrs 0xb1af60 name table (0 at 0,9,10,13,32,33,47,60,61,62,63),
 *   FULL-WORD name-empty -> 0xb1b6c4, LOW-BYTE '=' gate -> 0xb1b6dc,
 *   quote dispatch 0x27/0x22 (in order) else unquoted, LOW-BYTE value
 *   close -> 0xb1b6e8, value len end-start, and the 7 attr-node store
 *   offsets {0x00,0x04,0x08,0x0c,0x10,0x14,0x18}.
 */

export const SFX_XML_POOL_ALLOC_VA = 0x00416510;
export const SFX_XML_POOL_DIRECT_TARGET = 0x00a0f4e0;
export const SFX_XML_POOL_OFF_BASE_00 = 0x00;
export const SFX_XML_POOL_OFF_FREE_04 = 0x04;
export const SFX_XML_POOL_OFF_END_08 = 0x08;
export const SFX_XML_POOL_OFF_GROW_FN_1000C = 0x1000c;
export const SFX_XML_POOL_ALIGN = 4;
export const SFX_XML_POOL_CAP = 0x10000;
export const SFX_XML_POOL_GROW_OVERHEAD = 0x0a;
export const SFX_XML_POOL_ERR_OOM_VA = 0x00b1b6b4;
export const SFX_XML_POOL_ERR_SLOT_VA = 0x00c7de4c;
export const SFX_XML_POOL_ARM_DIRECT = 0;
export const SFX_XML_POOL_ARM_INDIRECT = 1;

/* v21: 0x0092d140 element-dispatch name table + SEH states + pipeline
   stage bits (header ISAAC_SFX_XML_ELEM_* / ISAAC_SFX_SOUND_PIPE_*). */
export const SFX_XML_ELEM_SOUNDS_VA = 0x00b7b1b4; /* "sounds" */
export const SFX_XML_ELEM_SOUNDS_LEN = 7;
export const SFX_XML_ELEM_ROOT_VA = 0x00b66f40;   /* "root" */
export const SFX_XML_ELEM_ROOT_LEN = 4;
export const SFX_XML_ELEM_SOUND_VA = 0x00b7b1ac;  /* "sound" */
export const SFX_XML_ELEM_SOUND_LEN = 5;
export const SFX_XML_SOUND_DISPATCH_COUNT = 3;
export const SFX_XML_SEH_STATE_PARSE = 1;  /* dword [ebp-4] 0x92d3dd */
export const SFX_XML_SEH_STATE_SOUND = 2;  /* byte  [ebp-4] 0x92d44e */
export const SFX_XML_ROOT_NAME_READ_OFF = 0x04; /* attr VALUE ptr */
export const SFX_XML_FIND_VARIANT_CHILD = 0; /* head 0x18 / next 0x2c */
export const SFX_XML_FIND_VARIANT_ATTR = 1;  /* head 0x20 / next 0x18 */
export const SFX_SOUND_PIPE_PROTO = 0x01;
export const SFX_SOUND_PIPE_ENTRY_ATTRS = 0x02;
export const SFX_SOUND_PIPE_APPEND_ARM = 0x04;
export const SFX_SOUND_PIPE_FILL = 0x08;
export const SFX_SOUND_PIPE_SAMPLE_FIND = 0x10;
export const SFX_SOUND_PIPE_SLOT_FILL = 0x20;
export const SFX_SOUND_PIPE_TAIL = 0x40;
export const SFX_SOUND_PIPE_CHAIN = 0x80;
export const SFX_SOUND_PIPE_ALL = 0xff;
export const SFX_XML_SOUND_DISPATCH_HOST_CALLS = 4;
export const SFX_XML_SOUND_DISPATCH_SIZE_BYTES = 0x84; /* 0x92d3ec..0x92d470 */
export const SFX_XML_SOUND_DISPATCH_CALLERS = 2; /* 0x008f42cd / 0x0095310f */
export const SFX_XML_POOL_ALLOC_SIZE_BYTES = 0x90;
export const SFX_XML_POOL_ALLOC_INSNS = 66;
export const SFX_XML_POOL_ALLOC_RETS = 1;
export const SFX_XML_POOL_ALLOC_E8 = 1;
export const SFX_XML_POOL_ALLOC_INDIRECT = 1;
export const SFX_XML_POOL_ALLOC_STORES = 5;
export const SFX_XML_POOL_ALLOC_CALLERS = 16;

export const SFX_XML_ATTR_NAME_TABLE_VA = 0x00b1af60;
export const SFX_XML_ATTR_ERR_NAME_VA = 0x00b1b6c4;
export const SFX_XML_ATTR_ERR_EQ_VA = 0x00b1b6dc;
export const SFX_XML_ATTR_ERR_VALUE_VA = 0x00b1b6e8;
export const SFX_XML_ATTR_EQ_BYTE = 0x3d;
export const SFX_XML_ATTR_QUOTE_SINGLE_BYTE = 0x27;
export const SFX_XML_ATTR_QUOTE_DOUBLE_BYTE = 0x22;
export const SFX_XML_ATTR_QUOTE_UNQUOTED = 0;
export const SFX_XML_ATTR_QUOTE_SINGLE = 1;
export const SFX_XML_ATTR_QUOTE_DOUBLE = 2;
export const SFX_XML_ATTR_QUOTE_NONE = 3;
export const SFX_XML_ATTR_NODE_SIZE = 0x1c;
export const SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT = 7;
export const SFX_XML_ATTRS_SIZE_BYTES = 0x1d0;
export const SFX_XML_ATTRS_INSNS = 152;
export const SFX_XML_ATTRS_RETS = 1;
export const SFX_XML_ATTRS_E8 = 3;
export const SFX_XML_ATTRS_STORES = 31;
export const SFX_XML_ATTRS_CALLERS = 1;

const SFX_XML_ATTR_NAME_ZEROS = new Set([0, 9, 10, 13, 32, 33, 47, 60, 61, 62, 63]);
const SFX_XML_ATTR_NODE_STORE_OFFSETS = [0x00, 0x04, 0x08, 0x0c, 0x10, 0x14, 0x18];

export function sfxXmlPoolAlign4(x) {
  const neg = u32(0 - u32(x));
  return u32(u32(x) + (neg & 3));
}

export function sfxXmlPoolNeedGrow(free, end, size) {
  return u32(sfxXmlPoolAlign4(free) + u32(size)) > u32(end) ? 1 : 0;
}

export function sfxXmlPoolGrowRequest(size) {
  const s = u32(size);
  const cap = s <= SFX_XML_POOL_CAP ? SFX_XML_POOL_CAP : s;
  return u32(cap + SFX_XML_POOL_GROW_OVERHEAD);
}

export function sfxXmlPoolGrowTail(allocPtr, request, size) {
  const linkSlot = sfxXmlPoolAlign4(allocPtr);
  const nodePtr = sfxXmlPoolAlign4(u32(linkSlot + 4));
  return {
    linkSlot,
    nodePtr,
    newBase: u32(allocPtr),
    newEnd: u32(u32(allocPtr) + u32(request)),
    newFree: u32(nodePtr + u32(size)),
  };
}

export function sfxXmlPoolPlan(free, end, size) {
  const alignedFree = sfxXmlPoolAlign4(free);
  const grow = sfxXmlPoolNeedGrow(free, end, size);
  return {
    alignedFree,
    fastBump: u32(alignedFree + u32(size)),
    grow,
    growRequest: grow !== 0 ? sfxXmlPoolGrowRequest(size) : 0,
    poolSlots: 4,
    allocVa: SFX_XML_POOL_ALLOC_VA,
    allocTarget: SFX_XML_POOL_DIRECT_TARGET,
    growFnOffset: SFX_XML_POOL_OFF_GROW_FN_1000C,
    hostCalls: grow,
    pureComplete: 0,
  };
}

/* v20: the audit found the v15 "OOM slot stays host" claim wrong on the
   VALUE. 0x416543..0x416545 `test eax,eax ; je 0x416551` on the pool
   mark ([pool+0x1000c], loaded at 0x41653a: grow_fn == 0 -> DIRECT
   0xa0f4e0 else INDIRECT). FULL-WORD zero test. */
export function sfxXmlPoolGrowArm(growFn) {
  return u32(growFn) === 0 ? SFX_XML_POOL_ARM_DIRECT : SFX_XML_POOL_ARM_INDIRECT;
}

/* 0x41655a..0x416561 `mov eax,0xb1b6b4 ; test edx,edx ; cmovne
   eax,[0xc7de4c]` — r == 0 -> 0xb1b6b4 else the PREV slot value
   (recapture at cmovne time). FULL-WORD; the store stays host. */
export function sfxXmlPoolOomSlot(allocR, prevSlot) {
  return u32(allocR) === 0 ? SFX_XML_POOL_ERR_OOM_VA : u32(prevSlot);
}

/* v21: the parent XML reader 0x0092d140 element dispatch (0x92d3ec..
   0x92d470). */

/* The dispatch-name table row: index 0..2 = sounds/root/sound; -1 out
   of range. */
export function sfxXmlDispatchElemVa(index) {
  if (index < 0 || index >= SFX_XML_SOUND_DISPATCH_COUNT) return -1;
  return [SFX_XML_ELEM_SOUNDS_VA, SFX_XML_ELEM_ROOT_VA,
          SFX_XML_ELEM_SOUND_VA][index];
}

export function sfxXmlDispatchElemLen(index) {
  if (index < 0 || index >= SFX_XML_SOUND_DISPATCH_COUNT) return -1;
  return [SFX_XML_ELEM_SOUNDS_LEN, SFX_XML_ELEM_ROOT_LEN,
          SFX_XML_ELEM_SOUND_LEN][index];
}

/* 0x92d466 `test esi,esi ; je 0x92db29` — FULL-WORD on the find("sound")
   result: nonzero -> the per-sound pipeline, zero -> the TRUE epilogue. */
export function sfxXmlSoundGate(nodeNonzero) {
  return u32(nodeNonzero) !== 0 ? 1 : 0;
}

/* The composed dispatch record. The gate is ONLY the sound find: the
   machine branches nowhere on find("sounds") or the root attr, so those
   two are reported, never gate. */
export function sfxXmlSoundDispatchPlan(findSounds, findRoot, findSound) {
  const soundsFound = i32(findSounds) !== 0 ? 1 : 0;
  const rootFound = i32(findRoot) !== 0 ? 1 : 0;
  const soundFound = i32(findSound) !== 0 ? 1 : 0;
  return {
    soundsFound,
    rootAttrFound: rootFound,
    soundFound,
    loopEntered: soundFound,
    epilogueSkip: soundFound === 0 ? 1 : 0,
    stagesMask: soundFound !== 0 ? SFX_SOUND_PIPE_ALL : 0,
    dispatchHostCalls: SFX_XML_SOUND_DISPATCH_HOST_CALLS,
    perSoundHostCalls: soundFound !== 0 ? 1 : 0,
    sehStateParse: SFX_XML_SEH_STATE_PARSE,
    sehStateSound: SFX_XML_SEH_STATE_SOUND,
    rootNameReadOff: SFX_XML_ROOT_NAME_READ_OFF,
    soundsFindKind: SFX_XML_FIND_VARIANT_CHILD,
    rootFindKind: SFX_XML_FIND_VARIANT_ATTR,
    soundFindKind: SFX_XML_FIND_VARIANT_CHILD,
    soundsElemVa: SFX_XML_ELEM_SOUNDS_VA,
    rootElemVa: SFX_XML_ELEM_ROOT_VA,
    soundElemVa: SFX_XML_ELEM_SOUND_VA,
    sizeBytes: SFX_XML_SOUND_DISPATCH_SIZE_BYTES,
    callerCount: SFX_XML_SOUND_DISPATCH_CALLERS,
  };
}

export function sfxXmlAttrNameChar(b) {
  return SFX_XML_ATTR_NAME_ZEROS.has(byte(b)) ? 0 : 1;
}

export function sfxXmlAttrNameError(prevError, nameLen) {
  return u32(nameLen) === 0 ? SFX_XML_ATTR_ERR_NAME_VA : u32(prevError);
}

export function sfxXmlAttrEqError(prevError, b) {
  return byte(b) === SFX_XML_ATTR_EQ_BYTE ? u32(prevError) : SFX_XML_ATTR_ERR_EQ_VA;
}

export function sfxXmlAttrQuoteKind(b) {
  const c = byte(b);
  if (c === SFX_XML_ATTR_QUOTE_SINGLE_BYTE) return SFX_XML_ATTR_QUOTE_SINGLE;
  if (c === SFX_XML_ATTR_QUOTE_DOUBLE_BYTE) return SFX_XML_ATTR_QUOTE_DOUBLE;
  return SFX_XML_ATTR_QUOTE_NONE;
}

export function sfxXmlAttrValueError(prevError, quoteByte, endByte) {
  return byte(endByte) === byte(quoteByte) ? u32(prevError) : SFX_XML_ATTR_ERR_VALUE_VA;
}

export function sfxXmlAttrValueLen(valueStart, valueEnd) {
  return u32(u32(valueEnd) - u32(valueStart));
}

export function sfxXmlAttrNodeWritesOffset(off) {
  return SFX_XML_ATTR_NODE_STORE_OFFSETS.includes(u32(off)) ? 1 : 0;
}

export function sfxXmlAttrPlan(prevError, firstByte, nameLen, eqByte,
                               quoteByte, endByte, valueStart, valueEnd) {
  const entered = sfxXmlAttrNameChar(firstByte) !== 0 ? 1 : 0;
  if (entered === 0) {
    /* 0x4165b5 arm: nothing computed, slot untouched. */
    return {
      entered: 0,
      nameEmpty: 0,
      nameError: u32(prevError),
      quoteKind: SFX_XML_ATTR_QUOTE_NONE,
      eqError: u32(prevError),
      valueError: u32(prevError),
      errorSlot: u32(prevError),
      valueLen: 0,
      allocatorVa: SFX_XML_POOL_ALLOC_VA,
      nodeSize: SFX_XML_ATTR_NODE_SIZE,
      nodeStores: 0,
      hostCalls: 0,
      pureComplete: 0,
      sizeBytes: SFX_XML_ATTRS_SIZE_BYTES,
      callerCount: SFX_XML_ATTRS_CALLERS,
    };
  }
  const nameError = sfxXmlAttrNameError(prevError, nameLen);
  const quoteKind = sfxXmlAttrQuoteKind(quoteByte);
  const eqError = sfxXmlAttrEqError(nameError, eqByte);
  /* The value-close law's prev is the CURRENT slot: the unquoted arm
     stores 0xb1b6e8 BEFORE the scan (0x4166d0), the quoted arms keep
     the '=' gate value. */
  const valueError = sfxXmlAttrValueError(
    quoteKind === SFX_XML_ATTR_QUOTE_NONE ? SFX_XML_ATTR_ERR_VALUE_VA : eqError,
    quoteByte, endByte,
  );
  return {
    entered: 1,
    nameEmpty: u32(nameLen) === 0 ? 1 : 0,
    nameError,
    quoteKind,
    eqError,
    valueError,
    errorSlot: valueError,
    valueLen: sfxXmlAttrValueLen(valueStart, valueEnd),
    allocatorVa: SFX_XML_POOL_ALLOC_VA,
    nodeSize: SFX_XML_ATTR_NODE_SIZE,
    nodeStores: SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT,
    hostCalls: 2,
    pureComplete: 0,
    sizeBytes: SFX_XML_ATTRS_SIZE_BYTES,
    callerCount: SFX_XML_ATTRS_CALLERS,
  };
}

/* ===================== v16: 0x00416770 the children parse ============
 *
 * The recursion/continuation decision layer of the document's children
 * parse. The 3 callees — the nested node parse 0x416040, the text scanner
 * 0x416e80 and the node allocator 0x416510 — and the host-length ws/name
 * skip walks stay host. Landed here (each independently re-traced from
 * the machine listing of cpu-dump/00416770.txt, duplicating NOTHING in
 * the C++):
 *
 *   top byte gate: 0 -> END (0xb1b678 slot store), '<' -> TAG, else TEXT.
 *   close-open: cursor[1] == '/' -> the close-tag path (LOW BYTE).
 *   nested-return gate: nested node != 0 -> link (FULL-WORD).
 *   sibling tail-append: children_head == 0 -> FIRST arm (FULL-WORD);
 *     the +0x28 store is the constant 0 on FIRST, parent->last on append.
 *   text ctor: type 2 at +0x14, store offsets
 *     {0x00,0x04,0x0c,0x10,0x14,0x18,0x20,0x28,0x2c}.
 *   text len: end - start (wrap); the accum law: parent->text != 0
 *     (FULL-WORD) && *parent->text == 0 (LOW BYTE) — the 0xc71640 default
 *     first byte is 0xed so the default arm never stores.
 *   END slot: unconditional 0xb1b678 (the scan NUL latch is v14's).
 *   close "expected >": same opcode pair as v14 tail_error (REUSED).
 *   cursor continuation: END/TEXT -> scanner end; TAG elem -> +1;
 *     TAG close -> name_end + 1.
 */

export const SFX_XML_CHILDREN_NESTED_VA = 0x00416040;
export const SFX_XML_CHILDREN_SCANNER_VA = 0x00416e80;
export const SFX_XML_CHILDREN_ALLOC_VA = 0x00416510;
export const SFX_XML_CHILDREN_ERR_END_VA = 0x00b1b678;
export const SFX_XML_CHILDREN_ERR_GT_VA = 0x00b1b6a8;
export const SFX_XML_CHILDREN_ERR_SLOT_VA = 0x00c7de4c;
export const SFX_XML_CHILDREN_TEXT_DEFAULT_VA = 0x00c71640;
export const SFX_XML_CHILDREN_TEXT_TYPE = 2;
export const SFX_XML_CHILDREN_NODE_SIZE = 0x30;
export const SFX_XML_CHILDREN_TOP_END = 0;
export const SFX_XML_CHILDREN_TOP_TAG = 1;
export const SFX_XML_CHILDREN_TOP_TEXT = 2;
export const SFX_XML_CHILDREN_CLOSE_OPEN_BYTE = 0x2f;
export const SFX_XML_CHILDREN_TEXT_STORE_OFFSETS_COUNT = 9;
export const SFX_XML_CHILDREN_SIZE_BYTES = 0x1a2;
export const SFX_XML_CHILDREN_INSNS = 139;
export const SFX_XML_CHILDREN_RETS = 1;
export const SFX_XML_CHILDREN_E8 = 3;
export const SFX_XML_CHILDREN_STORES = 38;
export const SFX_XML_CHILDREN_CALLERS = 1;

const SFX_XML_CHILDREN_TEXT_STORE_OFFSETS =
  [0x00, 0x04, 0x0c, 0x10, 0x14, 0x18, 0x20, 0x28, 0x2c];

export function sfxXmlChildrenTopGate(b) {
  const c = byte(b);
  if (c === 0) return SFX_XML_CHILDREN_TOP_END;
  if (c === 0x3c) return SFX_XML_CHILDREN_TOP_TAG;
  return SFX_XML_CHILDREN_TOP_TEXT;
}

export function sfxXmlChildrenCloseOpen(b) {
  return byte(b) === SFX_XML_CHILDREN_CLOSE_OPEN_BYTE ? 1 : 0;
}

export function sfxXmlChildrenNestedLive(node) {
  return u32(node) !== 0 ? 1 : 0;
}

export function sfxXmlChildrenLinkFirst(childrenHead) {
  return u32(childrenHead) === 0 ? 1 : 0;
}

export function sfxXmlChildrenLinkPrev(childrenHead, lastChild) {
  return u32(childrenHead) === 0 ? 0 : u32(lastChild);
}

export function sfxXmlChildrenTextLen(textStart, textEnd) {
  return u32(u32(textEnd) - u32(textStart));
}

export function sfxXmlChildrenTextAccum(parentText, firstByte) {
  if (u32(parentText) === 0) return 0;
  return byte(firstByte) === 0 ? 1 : 0;
}

export function sfxXmlChildrenTextNodeWritesOffset(off) {
  return SFX_XML_CHILDREN_TEXT_STORE_OFFSETS.includes(u32(off)) ? 1 : 0;
}

export function sfxXmlChildrenCursorAfter(topGate, closeOpen, tagPos,
                                          textEnd, nameEnd) {
  if (topGate === SFX_XML_CHILDREN_TOP_TAG) {
    return closeOpen !== 0 ? u32(u32(nameEnd) + 1) : u32(u32(tagPos) + 1);
  }
  return u32(textEnd);
}

export function sfxXmlChildrenPlan(topByte, closeByte, tagPos, nestedNode,
                                   childrenHead, lastChild, textStart,
                                   textEnd, parentText, textFirstByte,
                                   nameEnd, closeTailByte, prevError) {
  const top = sfxXmlChildrenTopGate(topByte);
  const tag = top === SFX_XML_CHILDREN_TOP_TAG ? 1 : 0;
  const textArm = tag === 0 ? 1 : 0; /* END falls through into TEXT */
  const close = tag !== 0 ? sfxXmlChildrenCloseOpen(closeByte) : 0;
  const recurses = (tag !== 0 && close === 0) ? 1 : 0;
  const live = recurses !== 0
    ? sfxXmlChildrenNestedLive(nestedNode)
    : (textArm !== 0 ? 1 : 0);
  const link = (textArm !== 0 || recurses !== 0) ? live : 0;
  return {
    topGate: top,
    endError: top === SFX_XML_CHILDREN_TOP_END
      ? SFX_XML_CHILDREN_ERR_END_VA : u32(prevError),
    closeOpen: close,
    nestedRecurses: recurses,
    nestedLive: live,
    linkNeeded: link,
    linkFirst: link !== 0 ? sfxXmlChildrenLinkFirst(childrenHead) : 0,
    linkPrev: link !== 0
      ? sfxXmlChildrenLinkPrev(childrenHead, lastChild) : 0,
    textLen: textArm !== 0 ? sfxXmlChildrenTextLen(textStart, textEnd) : 0,
    textType: textArm !== 0 ? SFX_XML_CHILDREN_TEXT_TYPE : 0,
    textAccum: textArm !== 0
      ? sfxXmlChildrenTextAccum(parentText, textFirstByte) : 0,
    cursorUndo: textArm,
    closeError: close !== 0
      ? sfxXmlNestedParseTailError(prevError, closeTailByte)
      : u32(prevError),
    cursorAfter: sfxXmlChildrenCursorAfter(top, close, tagPos, textEnd,
                                           nameEnd),
    nestedVa: SFX_XML_CHILDREN_NESTED_VA,
    scannerVa: SFX_XML_CHILDREN_SCANNER_VA,
    allocatorVa: SFX_XML_CHILDREN_ALLOC_VA,
    hostCalls: close !== 0 ? 0 : (textArm !== 0 ? 2 : 1),
    pureComplete: 0,
    sizeBytes: SFX_XML_CHILDREN_SIZE_BYTES,
    insns: SFX_XML_CHILDREN_INSNS,
    stores: SFX_XML_CHILDREN_STORES,
    callerCount: SFX_XML_CHILDREN_CALLERS,
  };
}

/* ============ v17: 0x00416e80 the text scanner ============
 * The leaf decode the children TEXT/END arms call (0x4167fd). Each law
 * re-traced from cpu-dump/00416e80.txt (NOT from the C++). The entry
 * skip walk, the decode walk, the digit walk and the utf8-append helper
 * 0x416dc0 (HOST) stay host; landed here are the per-byte gates, the
 * dispatch, the named/numeric decisions and the two position laws
 * (cursor = READ pos vs return = OUT pos — they differ when an entity
 * shrinks the text). */

export const SFX_XML_SCAN_HELPER_VA = 0x00416dc0;
export const SFX_XML_SCAN_SKIP_TABLE_VA = 0x00b1a760;
export const SFX_XML_SCAN_TEXT_TABLE_VA = 0x00b1aa60;
export const SFX_XML_SCAN_HEX_TABLE_VA = 0x00b1ad60;
export const SFX_XML_SCAN_JUMP_TABLE_VA = 0x0041705c;
export const SFX_XML_SCAN_DISPATCH_TABLE_VA = 0x00417074;
export const SFX_XML_SCAN_ERR_SEMI_VA = 0x00b1b6f8;
export const SFX_XML_SCAN_DISPATCH_RANGE_LO = 0x23;
export const SFX_XML_SCAN_DISPATCH_RANGE_HI = 0x4e;
export const SFX_XML_SCAN_AMP_BYTE = 0x26;
export const SFX_XML_SCAN_SEMI_BYTE = 0x3b;
export const SFX_XML_SCAN_HEX_X_BYTE = 0x78;
export const SFX_XML_SCAN_CASE_NUM = 0;
export const SFX_XML_SCAN_CASE_AMP = 1;
export const SFX_XML_SCAN_CASE_GT = 2;
export const SFX_XML_SCAN_CASE_LT = 3;
export const SFX_XML_SCAN_CASE_QUOT = 4;
export const SFX_XML_SCAN_CASE_NONE = 5;
export const SFX_XML_SCAN_AMP_EMIT = 0x26;
export const SFX_XML_SCAN_APOS_EMIT = 0x27;
export const SFX_XML_SCAN_QUOT_EMIT = 0x22;
export const SFX_XML_SCAN_GT_EMIT = 0x3e;
export const SFX_XML_SCAN_LT_EMIT = 0x3c;
export const SFX_XML_SCAN_AMP_SKIP = 5;
export const SFX_XML_SCAN_APOS_SKIP = 6;
export const SFX_XML_SCAN_QUOT_SKIP = 6;
export const SFX_XML_SCAN_GT_SKIP = 4;
export const SFX_XML_SCAN_LT_SKIP = 4;
export const SFX_XML_SCAN_SIZE_BYTES = 0xdb;
export const SFX_XML_SCAN_INSNS = 146;
export const SFX_XML_SCAN_RETS = 1;
export const SFX_XML_SCAN_E8 = 1;
export const SFX_XML_SCAN_STORES = 11;
export const SFX_XML_SCAN_CALLERS = 1;

/* 0x416e8b..0x416eac — entry skip-until-special gate (table 0xb1a760,
   zeros {0,'&','<'}); the walk advances while this returns 1. */
export function sfxXmlScanSkipChar(b) {
  const c = byte(b);
  return (c === 0 || c === SFX_XML_SCAN_AMP_BYTE || c === 0x3c) ? 0 : 1;
}

/* 0x416eba / 0x417044 — text-continue gate (table 0xb1aa60, zeros
   {0,'<'}); the decode loop continues while this returns 1. */
export function sfxXmlScanTextChar(b) {
  const c = byte(b);
  return (c === 0 || c === 0x3c) ? 0 : 1;
}

/* 0x416fcc / 0x416ff4 — digit nibble (table 0xb1ad60): 0..15 or 0xff
   ("not a digit"); gates BOTH the hex and the decimal paths. */
export function sfxXmlScanHexNibble(b) {
  const c = byte(b);
  if (c >= 0x30 && c <= 0x39) return c - 0x30;
  if (c >= 0x41 && c <= 0x46) return c - 0x37;
  if (c >= 0x61 && c <= 0x66) return c - 0x57;
  return 0xff;
}

/* 0x416ed0..0x416ee7 — entity dispatch: (int8)b - 0x23 in the unsigned
   window [0,0x4e] -> table 0x417074 case index ('#'0 'a'1 'g'2 'l'3
   'q'4, in-window others 5); out of window -> 5. */
export function sfxXmlScanEntityCase(b) {
  const s = (byte(b) << 24) >> 24; /* movsx */
  const idx = (u32(s - SFX_XML_SCAN_DISPATCH_RANGE_LO)) >>> 0;
  if (idx > SFX_XML_SCAN_DISPATCH_RANGE_HI) return SFX_XML_SCAN_CASE_NONE;
  switch (s) {
    case 0x23: return SFX_XML_SCAN_CASE_NUM;
    case 0x61: return SFX_XML_SCAN_CASE_AMP;
    case 0x67: return SFX_XML_SCAN_CASE_GT;
    case 0x6c: return SFX_XML_SCAN_CASE_LT;
    case 0x71: return SFX_XML_SCAN_CASE_QUOT;
    default: return SFX_XML_SCAN_CASE_NONE;
  }
}

/* 0x416eee..0x416f76 — named full-match, packed (skip<<8)|emit, 0 = no
   match; the a-case COMMITS to 'm' before trying 'p' ("apos;"). */
export function sfxXmlScanNamedEntity(caseId, b2, b3, b4, b5) {
  const c2 = byte(b2), c3 = byte(b3), c4 = byte(b4), c5 = byte(b5);
  switch (i32(caseId)) {
    case SFX_XML_SCAN_CASE_AMP:
      if (c2 === 0x6d) { /* 'm' first — the machine COMMITS */
        return (c3 === 0x70 && c4 === SFX_XML_SCAN_SEMI_BYTE)
          ? (SFX_XML_SCAN_AMP_SKIP << 8) | SFX_XML_SCAN_AMP_EMIT : 0;
      }
      return (c2 === 0x70 && c3 === 0x6f && c4 === 0x73 &&
              c5 === SFX_XML_SCAN_SEMI_BYTE)
        ? (SFX_XML_SCAN_APOS_SKIP << 8) | SFX_XML_SCAN_APOS_EMIT : 0;
    case SFX_XML_SCAN_CASE_GT:
      return (c2 === 0x74 && c3 === SFX_XML_SCAN_SEMI_BYTE)
        ? (SFX_XML_SCAN_GT_SKIP << 8) | SFX_XML_SCAN_GT_EMIT : 0;
    case SFX_XML_SCAN_CASE_LT:
      return (c2 === 0x74 && c3 === SFX_XML_SCAN_SEMI_BYTE)
        ? (SFX_XML_SCAN_LT_SKIP << 8) | SFX_XML_SCAN_LT_EMIT : 0;
    case SFX_XML_SCAN_CASE_QUOT:
      return (c2 === 0x75 && c3 === 0x6f && c4 === 0x74 &&
              c5 === SFX_XML_SCAN_SEMI_BYTE)
        ? (SFX_XML_SCAN_QUOT_SKIP << 8) | SFX_XML_SCAN_QUOT_EMIT : 0;
    default:
      return 0;
  }
}

/* 0x416fda / 0x417007 — per-digit fold, 32-bit wrap: hex (v<<4)+nibble,
   decimal v*10+nibble. */
export function sfxXmlScanNumValue(value, nibble, isHex) {
  const v = u32(value);
  const n = u32(nibble);
  return u32((i32(isHex) !== 0) ? (v << 4) + n : v * 10 + n);
}

/* 0x41701f..0x417034 — numeric ';' law: ';' keeps prev_error (and the
   machine consumes it), else the slot is UNCONDITIONALLY 0xb1b6f8. */
export function sfxXmlScanNumError(prevError, b) {
  return byte(b) === SFX_XML_SCAN_SEMI_BYTE
    ? u32(prevError) : SFX_XML_SCAN_ERR_SEMI_VA;
}

/* 0x417051 — the *cursor write = READ pos at exit (wrap). */
export function sfxXmlScanCursorAfter(start, skipLen, consumed) {
  return u32(u32(start) + u32(skipLen) + u32(consumed));
}

/* 0x417053 — the RETURN = OUT pos at exit (wrap); the children TEXT
   arm's text_len end. */
export function sfxXmlScanEndPos(start, skipLen, written) {
  return u32(u32(start) + u32(skipLen) + u32(written));
}

/* ============ v18: 0x00416dc0 the utf8-append helper ============
 * The single host edge shared by ALL THREE entity scanners (0x416e80,
 * 0x416b70, 0x416920): ecx = &out, edx = value. All four length
 * compares UNSIGNED; continuation 0x80|(x&0x3f), lead 0xc0/0xe0/0xf0
 * | ((v>>6/12/18)&0xff); v >= 0x110000 -> error store 0xb1b704, NO
 * bytes. Also the four attrs-leaf gate tables (dquote/squote), the
 * only per-byte truth the leaves add beyond the shared v17 laws. */

export const SFX_XML_UTF8_VA = 0x00416dc0;
export const SFX_XML_UTF8_SIZE_BYTES = 0xaa;
export const SFX_XML_UTF8_INSNS = 70;
export const SFX_XML_UTF8_RETS = 5;
export const SFX_XML_UTF8_E8 = 0;
export const SFX_XML_UTF8_STORES = 15;
export const SFX_XML_UTF8_CALLERS = 3;
export const SFX_XML_UTF8_L1 = 0x80;
export const SFX_XML_UTF8_L2 = 0x800;
export const SFX_XML_UTF8_L3 = 0x10000;
export const SFX_XML_UTF8_MAX = 0x110000;
export const SFX_XML_UTF8_CONT = 0x80;
export const SFX_XML_UTF8_CONT_MASK = 0x3f;
export const SFX_XML_UTF8_LEAD_L2 = 0xc0;
export const SFX_XML_UTF8_LEAD_L3 = 0xe0;
export const SFX_XML_UTF8_LEAD_L4 = 0xf0;
export const SFX_XML_UTF8_ERR_VA = 0x00b1b704;
export const SFX_XML_UTF8_ERR_SLOT_VA = 0x00c7de4c;
export const SFX_XML_UTF8_NO_BYTE = 0x100;

export const SFX_XML_ATTR_DQUOTE_VA = 0x00416b70;
export const SFX_XML_ATTR_SQUOTE_VA = 0x00416920;
export const SFX_XML_ATTR_DQUOTE_SIZE_BYTES = 0x1dc;
export const SFX_XML_ATTR_SQUOTE_SIZE_BYTES = 0x1dc;
export const SFX_XML_ATTR_DQUOTE_INSNS = 146;
export const SFX_XML_ATTR_SQUOTE_INSNS = 146;
export const SFX_XML_ATTR_DQUOTE_RETS = 1;
export const SFX_XML_ATTR_SQUOTE_RETS = 1;
export const SFX_XML_ATTR_DQUOTE_E8 = 1;
export const SFX_XML_ATTR_SQUOTE_E8 = 1;
export const SFX_XML_ATTR_DQUOTE_STORES = 11;
export const SFX_XML_ATTR_SQUOTE_STORES = 11;
export const SFX_XML_ATTR_DQUOTE_CALLERS = 1;
export const SFX_XML_ATTR_SQUOTE_CALLERS = 1;
export const SFX_XML_ATTR_DQUOTE_SKIP_TABLE_VA = 0x00b1a860;
export const SFX_XML_ATTR_SQUOTE_SKIP_TABLE_VA = 0x00b1a960;
export const SFX_XML_ATTR_DQUOTE_TEXT_TABLE_VA = 0x00b1ab60;
export const SFX_XML_ATTR_SQUOTE_TEXT_TABLE_VA = 0x00b1ac60;
export const SFX_XML_ATTR_DQUOTE_DISPATCH_VA = 0x00416d64;
export const SFX_XML_ATTR_SQUOTE_DISPATCH_VA = 0x00416b14;
export const SFX_XML_ATTR_DQUOTE_JUMP_VA = 0x00416d4c;
export const SFX_XML_ATTR_SQUOTE_JUMP_VA = 0x00416afc;

/* 0x416dc3..0x416e2a — the UNSIGNED length ladder: 1/2/3/4, 0 = the
   error arm (v >= 0x110000, no bytes, no advance). */
export function sfxXmlUtf8Len(value) {
  const v = u32(value);
  if (v < SFX_XML_UTF8_L1) return 1;
  if (v < SFX_XML_UTF8_L2) return 2;
  if (v < SFX_XML_UTF8_L3) return 3;
  return v < SFX_XML_UTF8_MAX ? 4 : 0;
}

/* 0x416dcb..0x416e5a — the per-index encoding byte (index 0..3);
   index >= len (or the error arm) -> NO_BYTE (not written). */
export function sfxXmlUtf8Byte(value, index) {
  const v = u32(value);
  const len = sfxXmlUtf8Len(v);
  if (u32(index) >= len) return SFX_XML_UTF8_NO_BYTE;
  if (len === 1) return v & 0xff;
  if (len === 2) {
    return index === 0
      ? (SFX_XML_UTF8_LEAD_L2 | ((v >>> 6) & 0xff))
      : (SFX_XML_UTF8_CONT | (v & SFX_XML_UTF8_CONT_MASK));
  }
  if (len === 3) {
    if (index === 0) return SFX_XML_UTF8_LEAD_L3 | ((v >>> 12) & 0xff);
    if (index === 1) {
      return SFX_XML_UTF8_CONT | ((v >>> 6) & SFX_XML_UTF8_CONT_MASK);
    }
    return SFX_XML_UTF8_CONT | (v & SFX_XML_UTF8_CONT_MASK);
  }
  if (index === 0) return SFX_XML_UTF8_LEAD_L4 | ((v >>> 18) & 0xff);
  if (index === 1) {
    return SFX_XML_UTF8_CONT | ((v >>> 12) & SFX_XML_UTF8_CONT_MASK);
  }
  if (index === 2) {
    return SFX_XML_UTF8_CONT | ((v >>> 6) & SFX_XML_UTF8_CONT_MASK);
  }
  return SFX_XML_UTF8_CONT | (v & SFX_XML_UTF8_CONT_MASK);
}

/* 0x416e5e — error-slot law: v < 0x110000 keeps prev (slot untouched);
   else UNCONDITIONALLY 0xb1b704 (no bytes written). */
export function sfxXmlUtf8Error(prevError, value) {
  return u32(value) < SFX_XML_UTF8_MAX
    ? u32(prevError) : SFX_XML_UTF8_ERR_VA;
}

/* 0x416b7b/0x416b95 — dquote attrs value ENTRY gate (0xb1a860 zeros
   {0,'"','&'}). */
export function sfxXmlAttrDquoteSkipChar(b) {
  const c = byte(b);
  return (c === 0 || c === 0x22 || c === SFX_XML_SCAN_AMP_BYTE) ? 0 : 1;
}

/* 0x416baa/0x416d34 — dquote attrs value TEXT gate (0xb1ab60 zeros
   {0,'"'}). */
export function sfxXmlAttrDquoteTextChar(b) {
  const c = byte(b);
  return (c === 0 || c === 0x22) ? 0 : 1;
}

/* 0x41692e/0x416945 — squote attrs value ENTRY gate (0xb1a960 zeros
   {0,'&','\''}). */
export function sfxXmlAttrSquoteSkipChar(b) {
  const c = byte(b);
  return (c === 0 || c === 0x27 || c === SFX_XML_SCAN_AMP_BYTE) ? 0 : 1;
}

/* 0x41695a/0x416ae4 — squote attrs value TEXT gate (0xb1ac60 zeros
   {0,'\''}). */
export function sfxXmlAttrSquoteTextChar(b) {
  const c = byte(b);
  return (c === 0 || c === 0x27) ? 0 : 1;
}

/* ============ v19: 0x004165a0 the attrs parse-loop DECISION LAYER =========
 *
 * The decisions BETWEEN the v15 per-attr laws of the whole attrs body
 * (see the header's v19 block and cpu-dump/004165a0.txt): the cursor +1
 * arithmetic between the host walks, the link-append wiring into the
 * parent attrs list, the NUL-in-place addresses, the once-per-loop
 * error-slot capture and the per-attr continuation gate. The two ws
 * walks, the name walk, the allocator 0x416510 and the two value
 * scanners 0x416b70/0x416920 stay host; their ENDS/returns are the
 * recaptures below. The stale-slot law is the body's error gating:
 * `mov edx,[0xc7de4c]` runs ONCE at 0x4165bb, so the name-empty cmovne
 * reads the ENTRY slot on every iteration — the slot never accumulates.
 */

export const SFX_XML_ATTR_OFF_NAME_LEN_08 = 0x08;
export const SFX_XML_ATTR_OFF_VALUE_LEN_0C = 0x0c;
export const SFX_XML_ATTR_OFF_PARENT_10 = 0x10;
export const SFX_XML_ATTR_OFF_PREV_14 = 0x14;
export const SFX_XML_ATTR_PARENT_OFF_HEAD_20 = 0x20;
export const SFX_XML_ATTR_PARENT_OFF_TAIL_24 = 0x24;
export const SFX_XML_ATTR_NUL_DEFAULT_VA = 0x00c71640;

/* 0x416687..0x41668a `lea eax,[ecx+1] ; mov [ebx],eax` — the cursor
   after the '=' gate = ws1_end + 1, wrap. */
export function sfxXmlAttrCursorAfterEq(ws1End) {
  return u32(u32(ws1End) + 1);
}

/* 0x4166cd (unquoted) / 0x416713 (quoted) `lea esi,[ecx+1]` — the value
   start = ws2_end + 1, wrap, BOTH arms. */
export function sfxXmlAttrValueStart(ws2End) {
  return u32(u32(ws2End) + 1);
}

/* 0x4166fe..0x4166ff `inc eax ; mov [ebx],eax` — the cursor after the
   value span = value_end + 1, wrap. */
export function sfxXmlAttrCursorAfterValue(valueEnd) {
  return u32(u32(valueEnd) + 1);
}

/* 0x41662a `cmp dword ptr [ecx+0x20],0 ; je first` — the attrs list
   append gate, FULL-WORD on the parent attrs head. */
export function sfxXmlAttrLinkFirst(parentHead) {
  return u32(parentHead) === 0 ? 1 : 0;
}

/* 0x416630 / 0x41663e — the node+0x14 (prev) store: head == 0 -> 0,
   else the tail (re-read at 0x416630 and 0x416636). */
export function sfxXmlAttrLinkPrev(parentHead, parentTail) {
  return u32(parentHead) === 0 ? 0 : u32(parentTail);
}

/* 0x416639 / 0x41664e — the previous tail's +0x18 store: head == 0 ->
   0 (no tail exists; node->next is zeroed instead), else node. */
export function sfxXmlAttrLinkTailNext(parentHead, node) {
  return u32(parentHead) === 0 ? 0 : u32(node);
}

/* 0x416645 — the parent attrs HEAD store value: head == 0 -> node (the
   first arm writes the head); else the head is left untouched. */
export function sfxXmlAttrLinkNewHead(parentHead, node) {
  return u32(parentHead) === 0 ? u32(node) : u32(parentHead);
}

/* 0x41668c..0x41669e (name) / 0x416701..0x41672c (value) — the NUL-in-
   place ADDRESS law, FULL-WORD ptr test: ptr != 0 -> ptr + len (wrap),
   else 0xc71640 + 0 (the fallback offset is xored). */
export function sfxXmlAttrNulAddr(ptr, len) {
  return u32(ptr) !== 0
    ? u32(u32(ptr) + u32(len))
    : SFX_XML_ATTR_NUL_DEFAULT_VA;
}

/* The composed per-iteration record (IsaacSfxXmlAttrsIterPlan). Params
   as the header doc: entry_slot is the 0x4165bb capture; ws1_end/ws2_end
   are the host ws walk ENDS with eq_byte = byte[ws1_end]; value_start/
   value_end bound the scanned span and end_byte = byte[value_end];
   parent_head/parent_tail are the link-time [parent+0x20]/[parent+0x24];
   node is the allocator result; name_ptr/value_ptr are the node's stored
   pointers at the NUL writes; cont_byte = byte[ws3_end]. */
export function sfxXmlAttrsIterPlan(entrySlot, firstByte, nameStart,
                                    nameEnd, ws1End, eqByte, ws2End,
                                    quoteByte, valueStart, valueEnd,
                                    endByte, parentHead, parentTail,
                                    node, namePtr, valuePtr, contByte) {
  const entered = sfxXmlAttrNameChar(firstByte) !== 0 ? 1 : 0;
  if (entered === 0) {
    /* 0x4165b5 arm: nothing computed, nothing touched. */
    return {
      entered: 0,
      nameEmpty: 0,
      nameError: u32(entrySlot),
      quoteKind: SFX_XML_ATTR_QUOTE_NONE,
      eqError: u32(entrySlot),
      valueError: u32(entrySlot),
      errorSlot: u32(entrySlot),
      valueLen: 0,
      cursorAfterEq: 0,
      valueStartPos: 0,
      cursorAfterValue: 0,
      linkFirst: 0,
      nodePrev: 0,
      tailNext: 0,
      newHead: 0,
      nameNulAddr: 0,
      valueNulAddr: 0,
      parentOffHead: SFX_XML_ATTR_PARENT_OFF_HEAD_20,
      parentOffTail: SFX_XML_ATTR_PARENT_OFF_TAIL_24,
      nodeOffParent: SFX_XML_ATTR_OFF_PARENT_10,
      nodeOffPrev: SFX_XML_ATTR_OFF_PREV_14,
      nodeOffNext: SFX_XML_ATTR_OFF_NEXT_18,
      nulDefaultVa: SFX_XML_ATTR_NUL_DEFAULT_VA,
      iterate: 0,
      nodeSize: SFX_XML_ATTR_NODE_SIZE,
      nodeStores: 0,
      hostCalls: 0,
      pureComplete: 0,
      sizeBytes: SFX_XML_ATTRS_SIZE_BYTES,
      callerCount: SFX_XML_ATTRS_CALLERS,
    };
  }
  const nameLen = u32(u32(nameEnd) - u32(nameStart)); /* 0x416620, wrap */
  /* The stale-slot law: prev = entry_slot on EVERY iteration. */
  const nameError = sfxXmlAttrNameError(entrySlot, nameLen);
  const quoteKind = sfxXmlAttrQuoteKind(quoteByte);
  const eqError = sfxXmlAttrEqError(nameError, eqByte);
  const valueError = sfxXmlAttrValueError(
    quoteKind === SFX_XML_ATTR_QUOTE_NONE
      ? SFX_XML_ATTR_ERR_VALUE_VA : eqError,
    quoteByte, endByte);
  const valueLen = sfxXmlAttrValueLen(valueStart, valueEnd);
  return {
    entered: 1,
    nameEmpty: nameLen === 0 ? 1 : 0,
    nameError,
    quoteKind,
    eqError,
    valueError,
    errorSlot: valueError,
    valueLen,
    cursorAfterEq: sfxXmlAttrCursorAfterEq(ws1End),
    valueStartPos: sfxXmlAttrValueStart(ws2End),
    cursorAfterValue: sfxXmlAttrCursorAfterValue(valueEnd),
    linkFirst: sfxXmlAttrLinkFirst(parentHead),
    nodePrev: sfxXmlAttrLinkPrev(parentHead, parentTail),
    tailNext: sfxXmlAttrLinkTailNext(parentHead, node),
    newHead: sfxXmlAttrLinkNewHead(parentHead, node),
    nameNulAddr: sfxXmlAttrNulAddr(namePtr, nameLen),
    valueNulAddr: sfxXmlAttrNulAddr(valuePtr, valueLen),
    parentOffHead: SFX_XML_ATTR_PARENT_OFF_HEAD_20,
    parentOffTail: SFX_XML_ATTR_PARENT_OFF_TAIL_24,
    nodeOffParent: SFX_XML_ATTR_OFF_PARENT_10,
    nodeOffPrev: SFX_XML_ATTR_OFF_PREV_14,
    nodeOffNext: SFX_XML_ATTR_OFF_NEXT_18,
    nulDefaultVa: SFX_XML_ATTR_NUL_DEFAULT_VA,
    iterate: sfxXmlAttrNameChar(contByte) !== 0 ? 1 : 0,
    nodeSize: SFX_XML_ATTR_NODE_SIZE,
    nodeStores: SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT,
    hostCalls: 2,
    pureComplete: 0,
    sizeBytes: SFX_XML_ATTRS_SIZE_BYTES,
    callerCount: SFX_XML_ATTRS_CALLERS,
  };
}

/* ---------- v24: 0x92d140 callee depth audit — string/alloc/vector
   growth laws ----------
   The XML-reader block's internal E8 callees: the std::string assign
   (0x0040ccd0, 4 in-block sites), the concat builder (0x00421680, site
   0x92d984), the grow allocator (0x0040cf00), the SoundEntry vector
   growth (0x0092e900 push-back at 0x92d654, 0x0092ee40 reserve at
   0x92d353), the string copy-ctor (0x0040cf50) and the file-open gates
   (0x00a178d0, site 0x92d1a2). All compares UNSIGNED/low-byte/full-word
   exactly as the machine spells them. */

export const SFX_STRING_SSO_CAP = 0x0f;
export const SFX_STRING_CAP_CLAMP = 0x7fffffff;
export const SFX_BUILD_FLOOR_16 = 0x16;
export const SFX_THROW_LEN_40CCC0 = 0x0040ccc0;
export const SFX_THROW_LENGTH_40CEE0 = 0x0040cee0;
export const SFX_THROW_VEC_COUNT_MAX_415BC0 = 0x00415bc0;
export const SFX_ASSIGN_VA_40CCD0 = 0x0040ccd0;
export const SFX_BUILD_VA_421680 = 0x00421680;
export const SFX_ALLOC_FAST_LIMIT = 0x1000;
export const SFX_ALLOC_BIG_BIAS = 0x23;
export const SFX_ALLOC_ALIGN_MASK = 0xffffffe0;
export const SFX_ALLOC_BACK_PTR_OFF = 4;
export const SFX_GROW_ALLOC_VA_40CF00 = 0x0040cf00;
export const SFX_ALLOC_CRT_VA_A0F4C0 = 0x00a0f4c0;
export const SFX_VEC_MAX_COUNT = 0x94f209;
export const SFX_VEC_RESERVE_FLOOR = 0x443;
export const SFX_VEC_PUSH_GROW_VA_92E900 = 0x0092e900;
export const SFX_VEC_RESERVE_VA_92EE40 = 0x0092ee40;
export const SFX_VEC_COPY_CTOR_VA_40CF50 = 0x0040cf50;
export const SFX_FILE_OPEN_VA_A178D0 = 0x00a178d0;
export const SFX_FILE_OPEN_ALLOC_VA_A648B0 = 0x00a648b0;

/** len > cap, UNSIGNED (0x40cce2 cmp/ja) — grow the assign target. */
export function sfxStringAssignGrow(len, cap) {
  return u32(len) > u32(cap) ? 1 : 0;
}

/** cap < 0x10, UNSIGNED FULL-WORD (0x40cce8 cmp cap,0x10 ; jb) — SSO
    in-place buffer when set. */
export function sfxStringAssignSso(cap) {
  return u32(cap) < SFX_STRING_SSO_LIMIT ? 1 : 0;
}

/** len > 0x7fffffff, UNSIGNED (0x40cd0e cmp/ja) — throws 0x40ccc0. */
export function sfxStringGrowLenOk(len) {
  return u32(len) > SFX_STRING_CAP_CLAMP ? 0 : 1;
}

/** The MSVC assign grow-cap chain (0x40cd1a..0x40cd49): start = len|0xf;
    clamp1 > 0x7fffffff; clamp2 cap > 0x7fffffff-(cap>>1); else
    max(start, cap+(cap>>1)); all UNSIGNED. Alloc size = cap+1. */
export function sfxStringGrowCap(cap, len) {
  const start = u32(len | SFX_STRING_SSO_CAP);
  if (start > SFX_STRING_CAP_CLAMP) return SFX_STRING_CAP_CLAMP;
  const half = u32(cap) >>> 1;
  if (u32(cap) > (SFX_STRING_CAP_CLAMP - half) >>> 0) {
    return SFX_STRING_CAP_CLAMP;
  }
  const grown = u32((cap >>> 0) + half);
  return u32(start) < grown ? grown : start;
}

/** len1+len2, 32-bit wrap (0x421684 add). */
export function sfxStringBuildTotal(len1, len2) {
  return u32((len1 >>> 0) + (len2 >>> 0));
}

/** total <= 0xf, UNSIGNED (0x4216ad cmp total,0xf ; jbe) — SSO. */
export function sfxStringBuildSso(total) {
  return u32(total) <= SFX_STRING_SSO_CAP ? 1 : 0;
}

/** Builder cap (0x4216b1..0x4216cf): SSO -> 0xf; else total|0xf clamped
    0x7fffffff, floored 0x16 (U cmovb; floor unobservable —
    total >= 0x10 ORs to >= 0x1f). Alloc size = cap+1. */
export function sfxStringBuildCap(total) {
  if (u32(total) <= SFX_STRING_SSO_CAP) return SFX_STRING_SSO_CAP;
  const cap = u32(total | SFX_STRING_SSO_CAP);
  if (cap > SFX_STRING_CAP_CLAMP) return SFX_STRING_CAP_CLAMP;
  return cap < SFX_BUILD_FLOOR_16 ? SFX_BUILD_FLOOR_16 : cap;
}

/** size < 0x1000, UNSIGNED (0x40cf01 cmp/jb) — fast alloc arm. */
export function sfxGrowAllocFast(size) {
  return u32(size) < SFX_ALLOC_FAST_LIMIT ? 1 : 0;
}

/** size == 0, FULL-WORD (0x40cf30 test/je) — NULL fast path. */
export function sfxGrowAllocZero(size) {
  return u32(size) === 0 ? 1 : 0;
}

/** Big arm: size+0x23 with the UNSIGNED wrap gate (0x40cf09..0x40cf0e
    cmp/jbe) — wrapped throws 0x40cee0. */
export function sfxGrowAllocBigPlan(size) {
  const allocSize = u32(u32(size) + SFX_ALLOC_BIG_BIAS);
  return { allocSize, wrapped: allocSize <= u32(size) ? 1 : 0 };
}

/** (raw+0x23) & ~0x1f (0x40cf1f/22) — slow-arm aligned pointer; the raw
    malloc result sits at aligned-4 (back ptr). */
export function sfxGrowAllocAlign(raw) {
  return u32(u32(raw) + SFX_ALLOC_BIG_BIAS) & SFX_ALLOC_ALIGN_MASK;
}

/** 0x92e990/0x92eea7 `cmp ecc,0x94f209-(ecc>>1) ; jbe in-place` UNSIGNED:
    1 = allocate-MAX arm. */
export function sfxVecCapGate(ecc) {
  const threshold = u32(SFX_VEC_MAX_COUNT - (u32(ecc) >>> 1));
  return u32(ecc) > threshold ? 1 : 0;
}

/** 0x92e9f6..0x92e9fd push-back only: max(ecc+(ecc>>1), count+1)
    UNSIGNED cmovae; count+1 wraps. */
export function sfxVecPushGrowNew(ecc, count) {
  const grown = u32(u32(ecc) + (u32(ecc) >>> 1));
  const needed = u32(u32(count) + 1);
  return grown < needed ? needed : grown;
}

/** 0x92ef24..0x92ef2f reserve only: max(ecc+(ecc>>1), 0x443) UNSIGNED
    floor (no count+1 term). */
export function sfxVecReserveGrowNew(ecc) {
  const grown = u32(u32(ecc) + (u32(ecc) >>> 1));
  return grown < SFX_VEC_RESERVE_FLOOR ? SFX_VEC_RESERVE_FLOOR : grown;
}

/** new_cap > 0x94f209 UNSIGNED (0x92ea03/0x92ef3c cmp/ja) — throw. */
export function sfxVecCapOverflow(newCap) {
  return u32(newCap) > SFX_VEC_MAX_COUNT ? 1 : 0;
}

/** count == 0x94f209 EQUALITY ONLY (0x92e961 cmp/je) — push-back throw
    0x415bc0; the reserve body has no such test. */
export function sfxVecCountMax(count) {
  return u32(count) === SFX_VEC_MAX_COUNT ? 1 : 0;
}

/** size < 0x10 (0x40cf7d cmp size,0x10 ; jae heap) — SSO copy. */
export function sfxStringCopySso(size) {
  return u32(size) < SFX_STRING_SSO_LIMIT ? 1 : 0;
}

/** Copy-ctor heap cap = size|0xf clamped 0x7fffffff (0x40cf9c..0x40cfa8
    cmova UNSIGNED). No 1.5x, no floor. */
export function sfxStringCopyCap(size) {
  const cap = u32(size | SFX_STRING_SSO_CAP);
  return cap > SFX_STRING_CAP_CLAMP ? SFX_STRING_CAP_CLAMP : cap;
}

/** Path NULL (FULL-WORD) or first byte 0 (LOW-BYTE) skips the open
    (0xa178f9/0xa17901). */
export function sfxFileOpenPathGate(pathPtr, firstByte) {
  if (u32(pathPtr) === 0) return 0;
  return byte(firstByte) === 0 ? 0 : 1;
}

/** Open-result flag FULL-WORD nonzero (0xa1792a cmp [ebp+8],0 ; jne). */
export function sfxFileOpenFlagGate(flag) {
  return u32(flag) !== 0 ? 1 : 0;
}

/* ---------- v25f: 0xa178d0 file-open POST-GATE decisions + 0x92d140
   arg-prep (wave-16, banner v25f, NO ABI bump). v24 laws 19/20 covered
   the path NULL/empty gates and the result flag; v9 (sfxTableOpenGate)
   covered the 0x92d1af call-site result gate. These are the REMAINING
   decision islands of the open body — the attempt-#2 retry gate
   (0xa1792a), the arg2 OUT-store gate (0xa1793d/0xa17951), the esi
   ALLOC-arm gate (0xa17941/0xa17955), the SEH guard select (0xa17945
   vs 0xa17959) and the call-site arg-prep pins (0x92d190/0x92d195).
   ALL tests FULL-WORD (0x100/0x1ff/0xffffffff drives). */

export const SFX_OPEN_CALL_THIS_C37A10 = 0xc37a10;
export const SFX_OPEN_CALL_ARG2 = 0;
export const SFX_OPEN_GUARD_NONE = 0xffffffff;
export const SFX_OPEN_GUARD_RETRY = 0;
export const SFX_OPEN_GUARD_SKIP = 1;

/** 0xa1792a cmp [ebp+8],0 ; jne 0xa1794e — FULL-WORD: attempt #2 runs
    iff the result slot == 0. Complement of sfxFileOpenFlagGate. */
export function sfxFileOpenRetryGate(result1) {
  return u32(result1) === 0 ? 1 : 0;
}

/** 0xa1793d/0xa17951 test arg2 ; jne 0xa17982 — FULL-WORD: arg2 != 0
    stores the handle (*arg2 = esi). */
export function sfxFileOpenOutGate(arg2) {
  return u32(arg2) !== 0 ? 1 : 0;
}

/** 0xa17941/0xa17955 test esi ; je 0xa17984 — FULL-WORD: the guard
    write + the 0xa648b0 alloc arm are reached iff handle != 0. */
export function sfxFileOpenAllocGate(handle) {
  return u32(handle) !== 0 ? 1 : 0;
}

/** 0xa17945 (1, attempt-#2 skipped) / 0xa17959 (eax==arg2==0, retry);
    the out-store and esi==0 tails leave the SEH state at its initial
    -1 (NONE). arg2 and handle are FULL-WORD tests. */
export function sfxFileOpenGuardSelect(result1, arg2, handle) {
  if (u32(arg2) !== 0 || u32(handle) === 0) return SFX_OPEN_GUARD_NONE;
  return u32(result1) !== 0 ? SFX_OPEN_GUARD_SKIP : SFX_OPEN_GUARD_RETRY;
}

/** 0x92d195 push 0 — the open call's arg2 prep (NULL out-ptr). */
export function sfxOpenCallArg2() {
  return SFX_OPEN_CALL_ARG2;
}

/** 0x92d190 mov ecx,0xc37a10 — the open call's this prep. */
export function sfxOpenCallThis() {
  return SFX_OPEN_CALL_THIS_C37A10;
}

/* ---------- v25e: 0x92d140 sibling callee BODIES — emplace/destroy-range/
   resize-n decision layers ----------
   The three STILL-HOST callee bodies of the 0x92d140 XML block that v24
   left classified: 0x92e830 slot emplace (move-construct at end, site
   0x92d640), 0x92ea80 destroy-range [begin..end) (sites 0x92d30d +
   0x92edc0's tail), 0x92edc0 resize-n construct (site 0x92d371, n =
   0x443 - size_count). The decision content is pure: the n==0/empty je
   trivial arms, the equality-terminated stride-loop iteration counts,
   the emplace copy-run map, the 8-write source/dest reset ORDER, the
   funclet state parity and the calling-convention shapes (destroy-range
   `ret` + caller dummy stack arg; resize-n `ret 0xc` = 3 stack args).
   Host edges stay host: 0xaef956 (0x38 mover), 0x40d040 (string dtor),
   0xaef638 (__ehvec_dtor), 0x92cea0 (element ctor). */

export const SFX_EMPLACE_VA_92E830 = 0x0092e830;
export const SFX_DESTROY_RANGE_VA_92EA80 = 0x0092ea80;
export const SFX_RESIZE_N_VA_92EDC0 = 0x0092edc0;
export const SFX_EMPLACE_MOVER_VA_AEF956 = 0x00aef956;
export const SFX_EHVEC_DTOR_VA_AEF638 = 0x00aef638;
export const SFX_STRING_DTOR_VA_40D040 = 0x0040d040;
export const SFX_RESIZE_N_CTOR_VA_92CEA0 = 0x0092cea0;
export const SFX_EMPLACE_STR_OFF_1A0 = 0x1a0;
export const SFX_EMPLACE_SUB_OFF_8 = 0x08;
export const SFX_EMPLACE_SUB_SIZE_38 = 0x38;
export const SFX_EMPLACE_RESET_SSO_TAG = 0x0f;
export const SFX_DESTROY_STR_OFF_1A0 = 0x1a0;
export const SFX_DESTROY_SUB_OFF_8 = 0x08;
export const SFX_DESTROY_SUB_SIZE_38 = 0x38;
export const SFX_GUARD_SENTINEL_FFFFFFFF = 0xffffffff;
export const SFX_FUNCLET_STATE_AFTER = 0xffffffff;
export const SFX_EMPLACE_RUNS = 8;

/* [start, width] of the emplace copy runs (0x92e846..0x92e8d1); the 0x38
   run at +8 is the 0xaef956 mover span (host, but a straight byte copy),
   0x40..0x190 is NEVER copied (dest left as-is). */
const SFX_EMPLACE_COPY_RUNS = [
  [0x00, 8], [0x08, 0x38], [0x190, 4], [0x194, 4],
  [0x198, 1], [0x199, 1], [0x19c, 4], [0x1a0, 0x20],
];

/** Run k's source offset (0x92e846..0x92e8d1); k >= 8 -> the 0xffffffff
    guard. */
export function sfxEmplaceCopyRunStart(k) {
  if (u32(k) >= SFX_EMPLACE_RUNS) return SFX_GUARD_SENTINEL_FFFFFFFF;
  return SFX_EMPLACE_COPY_RUNS[k][0];
}

/** Run k's byte width; the +8 run is 0x38 (0xaef956 span), the trailing
    string run is the contiguous 0x1a0..0x1b8 = 0x20 (movups 16 + movq 8). */
export function sfxEmplaceCopyRunWidth(k) {
  if (u32(k) >= SFX_EMPLACE_RUNS) return SFX_GUARD_SENTINEL_FFFFFFFF;
  return SFX_EMPLACE_COPY_RUNS[k][1];
}

/* [target(0=dest pre-zero,1=source reset, copy rows use target 0=dest
   write), offset, width, value|0xffffffff-for-copy] — the 8-write ORDER
   of the emplace body. Pre-zero dest first (0x92e89d/0x92e8a7/0x92e8b1),
   then the copy (movups 16 then movq 8, 0x92e8bb/0x92e8c9), then the
   source reset (0x92e8d9 dword 0 / 0x92e8e3 dword 0xf / 0x92e8ed BYTE 0 —
   the byte form leaves 0x1a4/0x1a8/0x1ac stale). */
const SFX_EMPLACE_WRITE_TABLE = [
  [0, 0x1a0, 4, 0],
  [0, 0x1b0, 4, 0],
  [0, 0x1b4, 4, 0],
  [0, 0x1a0, 16, SFX_GUARD_SENTINEL_FFFFFFFF],
  [0, 0x1b0, 8, SFX_GUARD_SENTINEL_FFFFFFFF],
  [1, 0x1b0, 4, 0],
  [1, 0x1b4, 4, SFX_EMPLACE_RESET_SSO_TAG],
  [1, 0x1a0, 1, 0],
];

/** Write-event kind for step 0..7: 0 = dest pre-zero, 1 = copy,
    2 = source reset; step >= 8 -> guard. */
export function sfxEmplaceWriteKind(step) {
  if (u32(step) >= SFX_EMPLACE_RUNS) return SFX_GUARD_SENTINEL_FFFFFFFF;
  if (step < 3) return 0;
  if (step < 5) return 1;
  return 2;
}

/** Field of write-event step (0 target, 1 offset, 2 width, 3 value);
    copy events report value = 0xffffffff (no constant); invalid step or
    field -> guard. */
export function sfxEmplaceWriteInfo(step, field) {
  const s = u32(step);
  if (s >= SFX_EMPLACE_RUNS) return SFX_GUARD_SENTINEL_FFFFFFFF;
  const f = u32(field);
  if (f > 3) return SFX_GUARD_SENTINEL_FFFFFFFF;
  const w = SFX_EMPLACE_WRITE_TABLE[s];
  if (f === 0) return w[0];
  if (f === 1) return w[1];
  if (f === 2) return w[2];
  return w[3];
}

/** Destroy-range iteration count (0x92eaa6..0x92eae3): begin == end ->
    0 (the je trivial arm); aligned spans -> (end-begin)/0x1b8 (the loop
    is EQUALITY-terminated on begin+(i+1)*0x1b8 != end); misaligned or
    inverted spans never hit the equality before wrap — the machine
    spins; the model reports the 0xffffffff unbounded guard. */
export function sfxDestroyRangeIters(begin, end) {
  const b = u32(begin);
  const e = u32(end);
  if (b === e) return 0;
  if (e < b) return SFX_GUARD_SENTINEL_FFFFFFFF;
  const span = e - b;
  if (span % SFX_ENTRY_STRIDE !== 0) return SFX_GUARD_SENTINEL_FFFFFFFF;
  return span / SFX_ENTRY_STRIDE;
}

/** The i-th iteration's std::string dtor target offset (slot+0x1a0;
    `lea ecx,[esi+0x198]` with esi = slot+8), 32-bit wrap. */
export function sfxDestroyRangeSlotStringOff(i) {
  return (Math.imul(u32(i), SFX_ENTRY_STRIDE) + SFX_DESTROY_STR_OFF_1A0)
    >>> 0;
}

/** The i-th iteration's 0x38 subobject (__ehvec_dtor) offset slot+8,
    32-bit wrap. */
export function sfxDestroyRangeSlotSubOff(i) {
  return (Math.imul(u32(i), SFX_ENTRY_STRIDE) + SFX_DESTROY_SUB_OFF_8)
    >>> 0;
}

/** Funclet state at transition t (0-based): even t -> 0 (before the
    string dtor), odd t -> 0xffffffff (after the __ehvec_dtor):
    [ebp-4] = 0 at 0x92eab6, = 0xffffffff at 0x92ead7, repeated per
    iteration. */
export function sfxDestroyRangeFuncletState(t) {
  return (u32(t) & 1) === 0 ? 0 : SFX_FUNCLET_STATE_AFTER;
}

/** The caller pushes a dummy stack arg at 0x92d302 / 0x92ee16 that the
    callee never reads; the body is `ret` (cleans nothing) — the shape
    law pins 1 (dummy present). */
export function sfxDestroyRangeStackDummy() {
  return 1;
}

/** Resize-n ctor count (0x92edfd..0x92ee14): `test edi,edi ; je`
    trivial arm -> 0 for n==0, else the `sub edi,1 ; jne` down-count runs
    EXACTLY n times. */
export function sfxResizeNCtorCount(n) {
  return u32(n);
}

/** Result pointer = begin + n*0x1b8, 32-bit wrap per-step add
    (0x92ee08/0x92ee23). */
export function sfxResizeNEnd(begin, n) {
  return (u32(begin) + Math.imul(u32(n), SFX_ENTRY_STRIDE)) >>> 0;
}

/** The i-th default-ctor target offset (0x92ee01..0x92ee08), 32-bit
    wrap. */
export function sfxResizeNCtorOff(begin, i) {
  return (u32(begin) + Math.imul(u32(i), SFX_ENTRY_STRIDE)) >>> 0;
}

/** The tail destroy_range(new_end, new_end) (0x92ee16..0x92ee1b) is
    ALWAYS the destroy-range trivial arm — 0 iterations. */
export function sfxResizeNTailIters(begin, n) {
  const e = sfxResizeNEnd(begin, n);
  return sfxDestroyRangeIters(e, e);
}

/** `ret 0xc` = 3 stack args (begin, n, unused allocator dword). */
export function sfxResizeNStackArgs() {
  return 3;
}

/* ===================== v25a: 0x92d93a..0x92d984 "path" arm caller =====
 * The concat TOTAL gate (0x92d963 cmp/jb UNSIGNED, wrap limit) and the
 * cmovae root-buffer select (0x92d96b, boundary 0x10 -> heap). */

export const SFX_SAMPLE_PATH_SSO_LIMIT = 0x10;

/** 0x92d961 sub eax,esi — 0x7fffffff - root_len, 32-bit wrap. */
export function sfxSamplePathLimit(rootLen) {
  return u32((SFX_STRING_CAP_CLAMP - u32(rootLen)) >>> 0);
}

/** 0x92d963 cmp eax,ecx ; jb — UNSIGNED strict: value_len > limit. */
export function sfxSamplePathOverflow(rootLen, valueLen) {
  const limit = u32(SFX_STRING_CAP_CLAMP - u32(rootLen));
  return u32(valueLen) > limit ? 1 : 0;
}

/** 0x92d96b..0x92d973 cmovae — UNSIGNED; cap >= 0x10 picks the heap. */
export function sfxSamplePathRootBuf(rootCap, ssoPtr, heapPtr) {
  return u32(rootCap) >= SFX_SAMPLE_PATH_SSO_LIMIT
    ? u32(heapPtr)
    : u32(ssoPtr);
}

/** Composed caller decision for the "path" attr arm (slot site, first
 *  arm, constant "path" 0xb66e0c). value_null FULL-WORD (0x92d942
 *  cmovne selects the 0xc71640 empty fallback). */
export function sfxSamplePathPlan(rootLen, rootCap, rootSso, rootHeap,
                                  valueNull, valuePtr, valueMax,
                                  throwVa) {
  const valueLen = sfxAttrValueStrlen(
    valueNull !== 0 ? 1 : 0,
    valueNull !== 0 ? 0 : valuePtr,
    valueMax);
  const limit = sfxSamplePathLimit(rootLen);
  const overflow = sfxSamplePathOverflow(rootLen, valueLen);
  const rootBuf = sfxSamplePathRootBuf(rootCap, rootSso, rootHeap);
  return {
    value_len: valueLen,
    limit,
    overflow,
    root_buf: rootBuf,
    concat_called: overflow === 0 ? 1 : 0,
    throw_va: overflow !== 0 ? u32(throwVa) : 0,
    host_calls: 1,
    pure_complete: 0,
  };
}

/* ============ v25c: 0x00416e80 numeric/amp entity scan gates ============
 * Wave-16, banner v25c, NO ABI bump (stays 24 — coordinator merges).
 * The text scanner's CASE 0 numeric-entity run WALK layer (hex/decimal
 * path select 0x416fc0, digit-run entry 0x416fc5/0x416ff1, run gate
 * 0x416fd2/0x416ffa/0x416fe8/0x417013, fold walk shl4/*10 with 32-bit
 * wrap, read-pos offset = entry + run_len) and the amp named-entity
 * consume/emit split. The utf8-append call 0x416dc0 and the walks
 * stay HOST (v18/v17 laws cover their decisions). */

export const SFX_XML_SCAN_VA = 0x00416e80; /* the scanner anchor */
export const SFX_XML_SCAN_NUM_ENTRY_DEC = 2; /* decimal entry skip */
export const SFX_XML_SCAN_NUM_ENTRY_HEX = 3; /* hex entry skip */
export const SFX_XML_SCAN_NUM_NOT_DIGIT = 0xff; /* not-a-digit marker */
export const SFX_XML_SCAN_AMP_LITERAL_CONSUMED = 1; /* packed 0 -> 1 */
export const SFX_XML_SCAN_AMP_LITERAL_EMIT = 0x26; /* packed 0 -> '&' */

/** 0x416fc0 `cmp cl,0x78 ; jne dec` — LOW-BYTE 'x' path select. */
export function sfxXmlScanNumHexPath(cl) {
  return byte(cl) === SFX_XML_SCAN_HEX_X_BYTE ? 1 : 0;
}

/** 0x416fc5 add esi,3 / 0x416ff1 add esi,2 — first-digit '&' offset. */
export function sfxXmlScanNumEntryDigits(isHex) {
  return i32(isHex) !== 0 ? SFX_XML_SCAN_NUM_ENTRY_HEX
                          : SFX_XML_SCAN_NUM_ENTRY_DEC;
}

/** 0x416fd2/0x416ffa/0x416fe8/0x417013 — LOW BYTE: 0xff -> 0 (stop). */
export function sfxXmlScanNumDigitGate(nibble) {
  return byte(nibble) === SFX_XML_SCAN_NUM_NOT_DIGIT ? 0 : 1;
}

/** 0x41701f read-pos offset = entry + run_len, 32-bit wrap. */
export function sfxXmlScanNumEndDigits(isHex, runLen) {
  const entry = i32(isHex) !== 0 ? SFX_XML_SCAN_NUM_ENTRY_HEX
                                 : SFX_XML_SCAN_NUM_ENTRY_DEC;
  return u32(entry + u32(runLen)) | 0;
}

/** The digit-run fold walk over the NIBBLE sequence. */
export function sfxXmlScanNumRun(isHex, nibbles, count, out) {
  const o = out ?? {};
  const hexPath = i32(isHex) !== 0 ? 1 : 0;
  const entry = hexPath !== 0 ? SFX_XML_SCAN_NUM_ENTRY_HEX
                              : SFX_XML_SCAN_NUM_ENTRY_DEC;
  const n = (nibbles == null || i32(count) < 0) ? 0 : i32(count);
  let runLen = 0;
  let value = 0;
  for (let i = 0; i < n; i++) {
    if (byte(nibbles[i]) === SFX_XML_SCAN_NUM_NOT_DIGIT) break;
    /* machine: movzx eax, al — the fold consumes the LOW byte of the
       loaded nibble; a wide 0x100/0x1ff element folds as 0/0xff. */
    value = sfxXmlScanNumValue(value, byte(nibbles[i]), hexPath);
    runLen++;
  }
  o.hexPath = hexPath;
  o.entryDigits = entry;
  o.firstDigitOk = (n > 0 && byte(nibbles[0]) !== SFX_XML_SCAN_NUM_NOT_DIGIT)
    ? 1 : 0;
  o.runLen = runLen;
  o.value = u32(value);
  o.endDigits = u32(entry + runLen) | 0;
  o.utf8Va = SFX_XML_UTF8_VA;
  o.pureComplete = 1;
  o.scanVa = SFX_XML_SCAN_VA;
  return o;
}

/** 0x416f09..0x416fb6 commits + 0x417036 literal — skip = packed>>8,
 *  packed 0 -> 1 (the literal '&' arm consumes exactly 1). */
export function sfxXmlScanAmpConsumed(packed) {
  const skip = u32(packed) >>> 8;
  return skip !== 0 ? skip : SFX_XML_SCAN_AMP_LITERAL_CONSUMED;
}

/** 0x417039 literal store 0x26 / commits — emit = packed&0xff,
 *  packed 0 -> 0x26 (the literal '&'). */
export function sfxXmlScanAmpEmit(packed) {
  const p = u32(packed);
  return p === 0 ? SFX_XML_SCAN_AMP_LITERAL_EMIT : (p & 0xff);
}

/* ============ v25d: 0x92d528/0x92da3a numeric-scan gates at the atoi
 * IAT (wave-16, banner v25d, NO ABI bump — coordinator merges).
 * The v24 census labeled slot 0xb187a8 "strtoul"; the import table says
 * **atoi** (hint 80) — one arg, `push ; call ; add esp,4`. The atoi
 * call itself stays HOST; these are the PURE decisions around it: the
 * FULL-WORD value-ptr select for the atoi ARG (SAME shape both islands
 * 0x92d51d..0x92d524 / 0x92da2f..0x92da36), the IAT-VA pin, the count
 * store [ebp-0x10264] = FULL eax (0x92d531 — later SIGNED-checked, v9),
 * the POST-CALL slot re-read [ebp-0x1040c] (0x92da40 — defect-class-1:
 * the store targets the post-call value, never the pre-call fold) and
 * the weight store [slot+0x34] = FULL eax (0x92da49). */

export const SFX_NUMERIC_ID_CALL_92D528 = 0x0092d528;
export const SFX_NUMERIC_WEIGHT_CALL_92DA3A = 0x0092da3a;
export const SFX_NUMERIC_COUNT_FIELD_10264 = 0x00010264;
export const SFX_NUMERIC_WEIGHT_OFF_34 = 0x34;

/** 0x92d51d..0x92d524 / 0x92da2f..0x92da36 cmovne — FULL-WORD NULL
 *  select: value_ptr != 0 -> value_ptr, else 0xc71640 (empty string).
 *  A LOW-BYTE test would wrongly fall back on 0x100. */
export function sfxNumericAtoiArg(valuePtr) {
  return u32(valuePtr) !== 0 ? u32(valuePtr) : SFX_ATTR_EMPTY_STRING_VA;
}

/** 0x92d527/0x92da39 — the IAT slot is atoi (hint 80), VA 0xb187a8. */
export function sfxNumericAtoiIatVa() {
  return SFX_ATTR_PARSE_IAT_VA;
}

/** 0x92d531 — the count field = the atoi result, FULL 32-bit eax
 *  (signed-checked later at 0x92d6c4, v9-landed). */
export function sfxNumericIdCount(atoiResult) {
  return i32(atoiResult);
}

/** 0x92da40 — the slot pointer re-read AFTER the atoi call: the weight
 *  store targets the POST-call slot (defect-class-1; a pre-call fold
 *  diverges when the slot pointer changes across the call). */
export function sfxNumericWeightSlotAfter(slotPre, slotPost) {
  return u32(slotPost);
}

/** 0x92da49 — slot->weight = the atoi result, FULL 32-bit at +0x34. */
export function sfxNumericWeightValue(atoiResult) {
  return i32(atoiResult);
}

/* ============ v25b: 0x00416b70/0x00416920 attr-value scanners =========
 * Wave-16, banner v25b, NO ABI bump (stays 24 — the coordinator merges).
 * Mirrors of the C++ v25b exports: the attr-value scanner SITE identity
 * (dquote "..." 0x416b70 / squote '...' 0x416920 — callees of the attrs
 * parse 0x4165a0) and the composed per-iteration decode record. The
 * four gate-table per-char laws and the shared entity laws are v15/v17/
 * v18/v25c; this block pins WHICH tables each site uses and WIRES the
 * loop arms (entry skip gate, text gate, dispatch case, named ladder,
 * numeric ';' error, cursor/out counts). */

export const SFX_XML_ATTR_VALUE_SITE_DQUOTE = 0;
export const SFX_XML_ATTR_VALUE_SITE_SQUOTE = 1;
export const SFX_XML_ATTR_VALUE_SITE_COUNT = 2;
export const SFX_XML_ATTR_VALUE_AMP_BYTE = 0x26;
export const SFX_XML_ATTR_VALUE_ERR_SEMI_VA = 0x00b1b6f8;

/** 0x416bd0/0x416980 — dispatch window: movsx (int8)b1 - 0x23 in
    unsigned [0,0x4e]. LOW BYTE; 0x80..0xff are negative -> OUT. */
export function sfxXmlAttrValueDispatchOk(b1) {
  const s = (byte(b1) << 24) >> 24; /* movsx */
  const idx = u32(s - 0x23);
  return idx <= 0x4e ? 1 : 0;
}

/** Entry-skip gate, SITE-select: dquote 0xb1a860 / squote 0xb1a960.
    LOW BYTE (v15 per-char laws, table == 1 for plain value bytes). */
export function sfxXmlAttrValueEntryChar(site, b) {
  const c = byte(b);
  if (u32(site) === SFX_XML_ATTR_VALUE_SITE_SQUOTE) {
    return (c === 0 || c === 0x27 || c === 0x26) ? 0 : 1;
  }
  return (c === 0 || c === 0x22 || c === 0x26) ? 0 : 1;
}

/** Text-continue gate, SITE-select: dquote 0xb1ab60 / squote 0xb1ac60.
    LOW BYTE. */
export function sfxXmlAttrValueTextChar(site, b) {
  const c = byte(b);
  if (u32(site) === SFX_XML_ATTR_VALUE_SITE_SQUOTE) {
    return (c === 0 || c === 0x27) ? 0 : 1;
  }
  return (c === 0 || c === 0x22) ? 0 : 1;
}

/** 0x416d0f..0x416d24 — the numeric ';' law: on the numeric arm the
    byte AFTER the utf8 call decides; ';' keeps prev (and consumes),
    else the slot is UNCONDITIONALLY 0xb1b6f8. LOW BYTE of semi. */
export function sfxXmlAttrValueSemiError(numeric, semiByte, prevError) {
  if (i32(numeric) === 0) return u32(prevError);
  return byte(semiByte) === SFX_XML_SCAN_SEMI_BYTE
    ? u32(prevError) : SFX_XML_ATTR_VALUE_ERR_SEMI_VA;
}

/** One iteration's cursor advance: numeric -> numEndDigits + (semi?1:0);
    literal -> 1; named -> skip = packed>>8, packed 0 -> 1. */
export function sfxXmlAttrValueConsumed(namedPacked, numeric, numEndDigits,
                                        numSemiOk, literal) {
  if (i32(numeric) !== 0) {
    return u32(numEndDigits) + (i32(numSemiOk) !== 0 ? 1 : 0);
  }
  if (i32(literal) !== 0) return 1;
  const skip = u32(namedPacked) >>> 8;
  return skip !== 0 ? skip : 1;
}

/** One iteration's out advance: numeric -> utf8Len; every other path
    (literal OR named) stores exactly 1 byte — the named emit arms each
    write a single byte, so the COUNT is 1, not the emit byte value. */
export function sfxXmlAttrValueEmitted(namedPacked, numeric, numValue,
                                       utf8Len, literal) {
  if (i32(numeric) !== 0) return i32(utf8Len);
  return 1;
}

/** Composed per-iteration decode record. Inputs mirror the machine:
    entryByte = byte under the cursor BEFORE the entry skip walk;
    firstByte = byte[skip_end]; b1..b5 the five bytes after a '&';
    semiByte = the byte at the numeric ';' check; prevError =
    [0xc7de4c] at iteration entry; numRunLen/numValue = the host
    digit-run results (v25c law) when numeric. */
export function sfxXmlAttrValueScanPlan(
  site, entryByte, firstByte, b1, b2, b3, b4, b5, semiByte, prevError,
  numRunLen, numValue, out) {
  const o = out ?? {};
  const dquote = u32(site) === SFX_XML_ATTR_VALUE_SITE_DQUOTE ? 1 : 0;
  const known = u32(site) < SFX_XML_ATTR_VALUE_SITE_COUNT ? 1 : 0;
  const entryTableVa = known !== 0
    ? (dquote !== 0 ? SFX_XML_ATTR_DQUOTE_SKIP_TABLE_VA
                    : SFX_XML_ATTR_SQUOTE_SKIP_TABLE_VA) : 0;
  const textTableVa = known !== 0
    ? (dquote !== 0 ? SFX_XML_ATTR_DQUOTE_TEXT_TABLE_VA
                    : SFX_XML_ATTR_SQUOTE_TEXT_TABLE_VA) : 0;
  const entryAdvances =
    known !== 0 && sfxXmlAttrValueEntryChar(site, entryByte) !== 0 ? 1 : 0;
  const textOpen =
    known !== 0 && sfxXmlAttrValueTextChar(site, firstByte) !== 0 ? 1 : 0;
  const entity = textOpen !== 0 && byte(firstByte) === 0x26 ? 1 : 0;
  const dispatchOk = entity !== 0 ? sfxXmlAttrValueDispatchOk(b1) : 0;
  let caseId = SFX_XML_SCAN_CASE_NONE;
  if (dispatchOk !== 0) {
    const s = (byte(b1) << 24) >> 24;
    switch (s) {
      case 0x23: caseId = SFX_XML_SCAN_CASE_NUM; break;
      case 0x61: caseId = SFX_XML_SCAN_CASE_AMP; break;
      case 0x67: caseId = SFX_XML_SCAN_CASE_GT; break;
      case 0x6c: caseId = SFX_XML_SCAN_CASE_LT; break;
      case 0x71: caseId = SFX_XML_SCAN_CASE_QUOT; break;
      default: caseId = SFX_XML_SCAN_CASE_NONE; break;
    }
  }
  const namedPacked = caseId === SFX_XML_SCAN_CASE_NONE
    ? 0 : u32(sfxXmlScanNamedEntity(caseId, b2, b3, b4, b5));
  const numeric = caseId === SFX_XML_SCAN_CASE_NUM ? 1 : 0;
  const numHex = numeric !== 0 && byte(b2) === SFX_XML_SCAN_HEX_X_BYTE ? 1 : 0;
  const firstDigit = numHex !== 0 ? b3 : b2;
  const numFirstDigitOk =
    numeric !== 0 && byte(sfxXmlScanHexNibble(firstDigit)) !== 0xff ? 1 : 0;
  const numEndDigits = numeric !== 0
    ? (numHex !== 0 ? SFX_XML_SCAN_NUM_ENTRY_HEX : SFX_XML_SCAN_NUM_ENTRY_DEC)
        + u32(numRunLen) : 0;
  const numSemiOk = byte(semiByte) === SFX_XML_SCAN_SEMI_BYTE ? 1 : 0;
  const errorAfter = sfxXmlAttrValueSemiError(numeric, semiByte, prevError);
  const namedMiss =
    caseId === SFX_XML_SCAN_CASE_NONE || (numeric === 0 && namedPacked === 0)
      ? 1 : 0;
  const textClosed = textOpen === 0 ? 1 : 0;
  const literal =
    textClosed === 0 && (entity === 0 || dispatchOk === 0 || namedMiss !== 0)
      ? 1 : 0;
  const utf8Len = numeric !== 0 ? i32(sfxXmlUtf8Len(numValue)) : 0;
  const consumed = textClosed !== 0 ? 0 : sfxXmlAttrValueConsumed(
    namedPacked, numeric, numEndDigits, numSemiOk, literal);
  const emitted = textClosed !== 0 ? 0 : sfxXmlAttrValueEmitted(
    namedPacked, numeric, numValue, utf8Len, literal);
  o.scannerVa = known !== 0
    ? (dquote !== 0 ? SFX_XML_ATTR_DQUOTE_VA : SFX_XML_ATTR_SQUOTE_VA) : 0;
  o.entryTableVa = entryTableVa;
  o.textTableVa = textTableVa;
  o.dispatchTableVa = known !== 0
    ? (dquote !== 0 ? SFX_XML_ATTR_DQUOTE_DISPATCH_VA
                    : SFX_XML_ATTR_SQUOTE_DISPATCH_VA) : 0;
  o.jumpTableVa = known !== 0
    ? (dquote !== 0 ? SFX_XML_ATTR_DQUOTE_JUMP_VA
                    : SFX_XML_ATTR_SQUOTE_JUMP_VA) : 0;
  o.entryAdvances = entryAdvances;
  o.textOpen = textOpen;
  o.entity = entity;
  o.dispatchOk = dispatchOk;
  o.caseId = caseId;
  o.namedPacked = namedPacked;
  o.namedSkip = sfxXmlScanAmpConsumed(namedPacked);
  o.namedEmit = sfxXmlScanAmpEmit(namedPacked);
  o.numeric = numeric;
  o.numHex = numHex;
  o.numFirstDigitOk = numFirstDigitOk;
  o.numRunLen = i32(numRunLen);
  o.numValue = u32(numValue);
  o.numEndDigits = i32(numEndDigits);
  o.numSemiOk = numSemiOk;
  o.errorAfter = errorAfter;
  o.consumed = consumed;
  o.emitted = emitted;
  o.utf8Called = numeric;
  o.literal = literal;
  o.hostCalls = numeric;
  o.pureComplete = 0;
  o.sizeBytes = SFX_XML_ATTR_DQUOTE_SIZE_BYTES;
  o.callerCount = 1;
  return o;
}

/* ---------- v26: 0xa17f40 / 0xa17ea0 attempt bodies of the 0xa178d0
   file-open retry gate (wave-18) ----------

   The open 0xa178d0 calls attempt #1 (0xa17f40) with (this, handle,
   &result_slot); the retry gate (v25f law) runs attempt #2 (0xa17ea0)
   iff the caller's slot is ZERO after attempt #1. Both attempts write
   the caller's result slot ONLY through the out pointer (the *out
   write laws below); their own [ebp+8] writes are MSVC arg-slot reuse
   (hash1 / alloc spills) and are NOT the caller slot. Decision islands:
   probe start/next/done/match/found, the ret/out plans of attempt #1,
   and the attempt #2 out/alloc gates, direct-dispatch select, keep
   (LOW-BYTE al test) and ret/out plans. IO/hash/alloc/ctor stay host:
   a159d0/a15ab0 (string hashes), slot-table memory reads, a0f4c0
   (alloc), a68a50 (ctor), a524b0/a52540 + vtbl[0x24] (loaders), vtbl[0]
   dtor. */

export const SFX_OPEN_ATTEMPT1_VA_A17F40 = 0x00a17f40;
export const SFX_OPEN_ATTEMPT2_VA_A17EA0 = 0x00a17ea0;
export const SFX_OPEN_ATTEMPT1_HASH1_VA_A159D0 = 0x00a159d0;
export const SFX_OPEN_ATTEMPT1_HASH2_VA_A15AB0 = 0x00a15ab0;
export const SFX_OPEN_ATTEMPT2_LOADER_VA_A524B0 = 0x00a524b0;
export const SFX_OPEN_ATTEMPT2_LOADER_VA_A52540 = 0x00a52540;
export const SFX_OPEN_ATTEMPT2_VTABLE_B9E940 = 0x00b9e940;
export const SFX_OPEN_ATTEMPT1_CTOR_VA_A68A50 = 0x00a68a50;
export const SFX_OPEN_ATTEMPT1_SLOTS_OFF_108 = 0x108;
export const SFX_OPEN_ATTEMPT_PROBE_MASK = 0x7fff;
export const SFX_OPEN_ATTEMPT_PROBE_LIMIT = 0x8000;
export const SFX_OPEN_ATTEMPT1_ALLOC_SIZE = 0xc2c;
export const SFX_OPEN_ATTEMPT2_ALLOC_SIZE = 0x10;
export const SFX_OPEN_OUT_NONE = 0xffffffff;

/** 0xa17f8d `and esi,0x7fff` — probe start index = hash1 & 0x7fff
    (the 0x8000-slot table at this+0x108, stride 4). */
export function sfxOpenAttempt1ProbeStart(hash1) {
  return u32(hash1) & SFX_OPEN_ATTEMPT_PROBE_MASK;
}

/** 0xa17fcf/d0 `inc esi ; and esi,0x7fff` — probe advance wraps at
    0x7fff back to 0 (UNSIGNED 32-bit inc then 15-bit mask). */
export function sfxOpenAttempt1ProbeNext(idx) {
  return (u32(idx) + 1) & SFX_OPEN_ATTEMPT_PROBE_MASK;
}

/** 0xa17fc5/0xa17fee `cmp counter,0x8000 ; jae` — UNSIGNED probe bound:
    1 = counter >= 0x8000 (walk exhausted all 0x8000 slots). */
export function sfxOpenAttempt1ProbeDone(counter) {
  return u32(counter) >= SFX_OPEN_ATTEMPT_PROBE_LIMIT ? 1 : 0;
}

/** 0xa17fb8/0xa17fbd — FULL-WORD pair compare: entry->key1 == hash1
    AND entry->key2 == hash2. */
export function sfxOpenAttempt1SlotMatch(key1, key2, hash1, hash2) {
  return u32(key1) === u32(hash1) && u32(key2) === u32(hash2) ? 1 : 0;
}

/** 0xa17fe1 (slot nonzero) + 0xa17fee (counter < 0x8000, UNSIGNED). */
export function sfxOpenAttempt1Found(slotNonzero, counter) {
  return u32(slotNonzero) !== 0 && u32(counter) < SFX_OPEN_ATTEMPT_PROBE_LIMIT
    ? 1 : 0;
}

/** 0xa18027/0xa18041 al=1 vs 0xa18057 al=0 — ret = name_ok && found. */
export function sfxOpenAttempt1Ret(nameOk, found) {
  return u32(nameOk) !== 0 && u32(found) !== 0 ? 1 : 0;
}

/** 0xa17ff9 (out NULL -> ret TRUE, no store) + 0xa18014/0xa18025/0xa1803d
    (*out = alloc_ok ? ctor_result : 0). NONE = no *out write. */
export function sfxOpenAttempt1OutPlan(nameOk, found, out, allocOk,
                                       ctorResult) {
  if (u32(nameOk) === 0 || u32(found) === 0 || u32(out) === 0) {
    return SFX_OPEN_OUT_NONE;
  }
  return u32(allocOk) !== 0 ? u32(ctorResult) : 0;
}

/** 0xa17eba `test ebx,ebx ; je host-arm` — FULL-WORD: out != 0 keeps
    the alloc/load path; out == 0 goes to the HOST 0xa524b0 arm. */
export function sfxOpenAttempt2OutGate(out) {
  return u32(out) !== 0 ? 1 : 0;
}

/** 0xa17ecd `test esi,esi ; je 0xa17eee` — FULL-WORD: alloc != 0
    initializes the object; alloc == 0 arm (esi=0) is a PE NULL-deref
    crash in practice, typed-host note. */
export function sfxOpenAttempt2AllocGate(alloc) {
  return u32(alloc) !== 0 ? 1 : 0;
}

/** 0xa17ef8 `cmp fn,0xa52540 ; jne indirect` — direct-call select:
    the vtbl[0x24] loader pointer equals the 0xa52540 constant. */
export function sfxOpenAttempt2DispatchDirect(fn) {
  return u32(fn) === SFX_OPEN_ATTEMPT2_LOADER_VA_A52540 ? 1 : 0;
}

/** 0xa17f08 `test al,al ; jne keep` — LOW-BYTE: loader's al result
    nonzero keeps the object; 0x100/0x1ff drive must NOT keep. */
export function sfxOpenAttempt2Keep(loadResult) {
  return byte(loadResult) !== 0 ? 1 : 0;
}

/** 0xa17f1a `setne al` — ret = alloc_ok && keep (obj != NULL). */
export function sfxOpenAttempt2Ret(allocOk, keep) {
  return u32(allocOk) !== 0 && u32(keep) !== 0 ? 1 : 0;
}

/** 0xa17f18 `[ebx] = esi` — *out = kept ? alloc : NULL; NONE when the
    main path is not reached (name fail or out==0 host arms). */
export function sfxOpenAttempt2OutPlan(nameOk, out, allocOk, keep,
                                       allocPtr) {
  if (u32(nameOk) === 0 || u32(out) === 0) {
    return SFX_OPEN_OUT_NONE;
  }
  return u32(allocOk) !== 0 && u32(keep) !== 0 ? u32(allocPtr) : 0;
}

/* ---------- v27: 0xa17180 build body (the 0xa178d0 file-open's
   canonical-key builder; wave-19; ABI 26 -> 27). Pure decision layer
   of the span 0xa17180..0xa172d3 (ret 4, ONE dword arg; ecx/this
   never read): ABS arm iff name!=0 (FULL-WORD) && strlen>2 (UNSIGNED
   jbe) && name[1]==':' (BYTE) && name[2] in {'\\','/'} (BYTE); ABS
   tail keep = LOW-BYTE validator al, return = keep ? s1 : 0, dispose
   edge iff !keep && s1!=0; FAIL arm resolve gate (FULL-WORD r!=0),
   variant select (BYTE flag: 0 -> A), variant-A dispose edge
   (FULL-WORD s2!=0). Host stays: a5a7a0 canonicalizer, a524b0
   validator, a16c60 resolver, a68790 join, a648b0 dispose, inline
   strlen (CRT), and every final return value (canonicalizer result).
   All params uint32_t; byte tests & 0xff inside the laws. */

export const SFX_BUILD_VA_A17180 = 0x00a17180;
export const SFX_BUILD_CHAR_COLON = 0x3a;
export const SFX_BUILD_CHAR_BACKSLASH = 0x5c;
export const SFX_BUILD_CHAR_SLASH = 0x2f;
export const SFX_BUILD_MIN_ABS_LEN = 2;
export const SFX_BUILD_CANON_VA_A5A7A0 = 0x00a5a7a0;
export const SFX_BUILD_RESOLVE_VA_A16C60 = 0x00a16c60;
export const SFX_BUILD_JOIN_VA_A68790 = 0x00a68790;

/** 0xa171a5..0xa171ce — drive-absolute prefix test selecting the ABS
    arm: name!=0 (FULL-WORD 0xa171a8) && strlen>2 (UNSIGNED jbe
    0xa171ba) && c1==':' (BYTE 0xa171bf) && c2=='\\' || c2=='/'
    (BYTE 0xa171c8/0xa171cc). Any failure -> FAIL arm. */
export function sfxBuildAbsGate(nameNonzero, len, c1, c2) {
  if (u32(nameNonzero) === 0) return 0;
  if (u32(len) <= SFX_BUILD_MIN_ABS_LEN) return 0; /* UNSIGNED jbe */
  if (byte(c1) !== SFX_BUILD_CHAR_COLON) return 0;
  const c2b = byte(c2);
  return c2b === SFX_BUILD_CHAR_BACKSLASH || c2b === SFX_BUILD_CHAR_SLASH
    ? 1 : 0;
}

/** 0xa171e9 `test al,al ; jne RET` — LOW-BYTE: validator's al nonzero
    keeps s1; 0x100/0x1ff drive must NOT keep (al only). */
export function sfxBuildAbsKeep(okResult) {
  return byte(okResult) !== 0 ? 1 : 0;
}

/** 0xa1720a `mov eax,esi` — ABS-arm return: keep ? s1 : 0 (dispose
    arm xors esi to 0; s1==0 arm is already 0). */
export function sfxBuildAbsOut(keep, s1) {
  return u32(keep) !== 0 ? u32(s1) : 0;
}

/** 0xa171ed `test esi,esi ; je RET` (FULL-WORD) + 0xa171f1..08 —
    the 0xa648b0 dispose edge fires iff NOT keep AND s1 != 0. */
export function sfxBuildAbsDispose(keep, s1) {
  return u32(keep) === 0 && u32(s1) !== 0 ? 1 : 0;
}

/** 0xa17230 `test edi,edi ; je RET0` — FULL-WORD gate on the FAIL-arm
    resolve result (0xa16c60): r==0 -> RET 0, else variant select. */
export function sfxBuildResolveGate(r) {
  return u32(r) !== 0 ? 1 : 0;
}

/** 0xa17238 `cmp byte[ebp+0xb],0 ; je A` — LOW-BYTE flag test: flag
    byte 0 -> VARIANT A (1); nonzero byte -> VARIANT B (0). */
export function sfxBuildVariantSelect(flag) {
  return byte(flag) === 0 ? 1 : 0;
}

/** 0xa17279 `test esi,esi ; je skip` — FULL-WORD: variant-A's second
    canonicalizer result s2 != 0 runs the 0xa648b0 dispose edge. */
export function sfxBuildVariantADispose(s2) {
  return u32(s2) !== 0 ? 1 : 0;
}
/* ---------- v28: 0xa159d0 / 0xa15ab0 string-hash pair (wave-20;
   ABI 27 -> 28). The file-open canonical-key hashes: hash #1
   (0xa159d0, djb2-style h = h*33 + byte, 23 direct rel32 callers) and
   hash #2 (0xa15ab0, FNV-1a h = (h ^ byte) * 0x1000193, 2 callers).
   Both bodies are self-contained folds (0 E8 / 0 indirect / 0
   stores); the string POINTER/BYTES are the host input stream, the
   fold arithmetic is pure. Shared per-byte layer: norm (A..Z -> a..z
   via UNSIGNED (b-0x41)>0x19, then 0x5c -> 0x2f) + loop-continue
   (LOW-BYTE); per-hash layer: FULL-WORD null gate, seed init, fold
   step. Consumers unchanged: v26 probe_start (hash1 & 0x7fff) /
   slot_match (hash1+hash2 pair). All params uint32_t; byte discipline
   = & 0xff inside the laws. */

export const SFX_HASH1_VA_A159D0 = 0x00a159d0;
export const SFX_HASH2_VA_A15AB0 = 0x00a15ab0;
export const SFX_HASH1_SEED = 0x1505;
export const SFX_HASH2_SEED = 0x5bb2220e;
export const SFX_HASH2_PRIME = 0x1000193;
export const SFX_HASH_NORM_A = 0x41;
export const SFX_HASH_NORM_LOWER_DELTA = 0x19;
export const SFX_HASH_NORM_CASE_SHIFT = 0x20;
export const SFX_HASH_NORM_BACKSLASH = 0x5c;
export const SFX_HASH_NORM_SLASH = 0x2f;
export const SFX_HASH1_CALLER_COUNT = 23;
export const SFX_HASH2_CALLER_COUNT = 2;

/** 0xa159f7..0xa15a11 == 0xa15ad7..0xa15aee - shared per-byte
    normalize: b = c & 0xff; d = (b - 0x41) mod 256; lo = (b + 0x20)
    mod 256; n = d > 0x19 (UNSIGNED) ? b : lo; 0x5c -> 0x2f. */
export function sfxHashByteNorm(c) {
  const b = byte(c);
  const d = (b + 0x100 - SFX_HASH_NORM_A) & 0xff;
  const lo = (b + SFX_HASH_NORM_CASE_SHIFT) & 0xff;
  let n = d > SFX_HASH_NORM_LOWER_DELTA ? b : lo;
  if (n === SFX_HASH_NORM_BACKSLASH) n = SFX_HASH_NORM_SLASH;
  return n;
}

/** 0xa159e3/0xa15a21 + 0xa15ac0/0xa15aff - LOW-BYTE loop-continue:
    (c & 0xff) !== 0 keeps folding; NUL terminates (never folded). */
export function sfxHashByteContinue(c) {
  return byte(c) !== 0 ? 1 : 0;
}

/** 0xa159d5 `test esi,esi ; jne body` - FULL-WORD: hash1(s==0) = 0. */
export function sfxHash1NullGate(s) {
  return u32(s) !== 0 ? 1 : 0;
}

/** 0xa159dd `mov eax,0x1505` - hash #1 seed. */
export function sfxHash1Init() {
  return SFX_HASH1_SEED;
}

/** 0xa15a14..0xa15a1c - djb2 step: h = h*33 + norm(c) (mod 2^32). */
export function sfxHash1Step(h, c) {
  return (Math.imul(u32(h), 33) + sfxHashByteNorm(c)) >>> 0;
}

/** 0xa15ab2 `test ecx,ecx ; jne body` - FULL-WORD: hash2(s==0) = 0. */
export function sfxHash2NullGate(s) {
  return u32(s) !== 0 ? 1 : 0;
}

/** 0xa15abb `mov esi,0x5bb2220e` - hash #2 seed. */
export function sfxHash2Init() {
  return SFX_HASH2_SEED;
}

/** 0xa15af4..0xa15af6 - FNV-1a step: h = (h ^ norm(c)) * 0x1000193
    (mod 2^32). */
export function sfxHash2Step(h, c) {
  return Math.imul(u32(h) ^ sfxHashByteNorm(c), SFX_HASH2_PRIME) >>> 0;
}

/* ---------- v29: 0x92dbd0 SoundEffect entry destructor (ABI 29) --------
   Net-audit landing (sfx-v29-net): the FIRST caller-bearing
   unclassified body of the SFX-declared band. Body 0x92dbd0..0x92dc21
   (ret plain; int3 pad ..0x92dc2f; next 0x92dc30 = Play). Straight-line:
   0 conditional branches, no gates. Inbound census: 2 jmp-tail callers
   (0xb0ab89 / 0xb0ab94 - the 0x92d140 proto SEH cold arms). The pure
   layer is the exact destroy plan: string @ +0x1a0 via 0x40d040 FIRST,
   then __ehvec_dtor(entry+8, 0x38, 7, 0x92cf10) - the third independent
   confirmation of the v4 entry layout, from the destructor side. */

export const SFX_ENTRY_DTOR_VA_92DBD0 = 0x0092dbd0;
export const SFX_ENTRY_DTOR_END_VA_92DC21 = 0x0092dc21;
export const SFX_ENTRY_DTOR_NEXT_VA_92DC30 = 0x0092dc30;
export const SFX_ENTRY_DTOR_CALLER_COUNT = 2;
export const SFX_ENTRY_DTOR_CALLER1_VA_B0AB89 = 0x00b0ab89;
export const SFX_ENTRY_DTOR_CALLER2_VA_B0AB94 = 0x00b0ab94;
export const SFX_ENTRY_DTOR_STRING_OFF_1A0 = 0x1a0;
export const SFX_ENTRY_DTOR_STRING_DTOR_VA_40D040 = 0x0040d040;
export const SFX_ENTRY_DTOR_VOICES_OFF_8 = 0x08;
export const SFX_ENTRY_DTOR_STRIDE_38 = 0x38;
export const SFX_ENTRY_DTOR_COUNT_7 = 7;
export const SFX_ENTRY_DTOR_SLOT_DTOR_VA_92CF10 = 0x0092cf10;
export const SFX_ENTRY_DTOR_EHVEC_VA_AEF638 = 0x00aef638;
export const SFX_ENTRY_DTOR_ORDER_STRING_FIRST = 1;
export const SFX_ENTRY_DTOR_SEH_GUARD_INITIAL = 0xffffffff;
export const SFX_ENTRY_DTOR_BRANCH_COUNT = 0;

/** 0x92dbd0 - body root. */
export function sfxEntryDtorVa() {
  return SFX_ENTRY_DTOR_VA_92DBD0;
}

/** 0x92dc21 - first ret (body end, exclusive). */
export function sfxEntryDtorEndVa() {
  return SFX_ENTRY_DTOR_END_VA_92DC21;
}

/** 0x92dc30 - next body (Play). */
export function sfxEntryDtorNextVa() {
  return SFX_ENTRY_DTOR_NEXT_VA_92DC30;
}

/** 2 jmp-tail callers (0xb0ab89 / 0xb0ab94). */
export function sfxEntryDtorCallerCount() {
  return SFX_ENTRY_DTOR_CALLER_COUNT;
}

/** 0x92dbf5 `lea ecx,[esi+0x1a0]` - the entry's own name string. */
export function sfxEntryDtorStringOff() {
  return SFX_ENTRY_DTOR_STRING_OFF_1A0;
}

/** 0x92dbfb - std::string dtor for the name string. */
export function sfxEntryDtorStringDtorVa() {
  return SFX_ENTRY_DTOR_STRING_DTOR_VA_40D040;
}

/** 0x92dc09 `lea eax,[esi+8]` - seven-slot voice array base. */
export function sfxEntryDtorVoicesOff() {
  return SFX_ENTRY_DTOR_VOICES_OFF_8;
}

/** 0x92dc07 `push 0x38` - per-slot stride for __ehvec_dtor. */
export function sfxEntryDtorStride() {
  return SFX_ENTRY_DTOR_STRIDE_38;
}

/** 0x92dc05 `push 7` - slot count for __ehvec_dtor. */
export function sfxEntryDtorCount() {
  return SFX_ENTRY_DTOR_COUNT_7;
}

/** 0x92dc00 `push 0x92cf10` - per-slot dtor (v4 record). */
export function sfxEntryDtorSlotDtorVa() {
  return SFX_ENTRY_DTOR_SLOT_DTOR_VA_92CF10;
}

/** 0x92dc0d - __ehvec_dtor (host; arity is pure). */
export function sfxEntryDtorEhvecVa() {
  return SFX_ENTRY_DTOR_EHVEC_VA_AEF638;
}

/** Order: 1 = string dtor (0x92dbfb) BEFORE the voices (0x92dc0d). */
export function sfxEntryDtorStringFirst() {
  return SFX_ENTRY_DTOR_ORDER_STRING_FIRST;
}

/** 0x92dbd3 `push -1` - SEH guard initial; never transitioned. */
export function sfxEntryDtorGuardInitial() {
  return SFX_ENTRY_DTOR_SEH_GUARD_INITIAL;
}

/** Conditional-branch census of the body: 0 (straight-line). */
export function sfxEntryDtorBranches() {
  return SFX_ENTRY_DTOR_BRANCH_COUNT;
}

/* ---------- v30: 0x92e620 Play-ducking wrapper (ABI 30) --------
   Wave-22 F6 handoff landing: the sfx-side consumer of the 0x956780
   pre-play ctor (PM family lease) + the wrapper the 0x92e68c arm lives
   in. Body 0x92e620..0x92e6d3 (ret 0xc @ 0x92e6d3; int3 pad ..0x92e6df;
   next 0x92e6e0 = GetVolume). thiscall, 3 stack args (id @ 8, volume @
   0xc, pitch @ 0x10). Decision tree: comiss vs the .rdata 0.01f
   threshold (0xbaa06c = 0x3c23d70a); jb (0.01f < volume) -> AUDIBLE
   arm, fall -> SILENT arm; each arm probes is_playing (0x92e560, ret
   4) - SILENT: idle -> shared tail (no stop), playing -> stop (0x92e230,
   ret 4); AUDIBLE: playing -> set_volume (0x92df40) THEN set_pitch
   (0x92e050) (both ret 8), idle -> PLAY arm 0x92e68c: id slot @ [ebp+8]
   := id, pre_play(&slot) via 0x956780 (thiscall 0 args, C3 @0x956884),
   then Play(this = *(0xc7169c)+0x2a324, id', vol, 2, 1, pitch, 0) - 6
   stack args (ret 0x18 @ 0x92dcce/0x92de9c) - then the shared tail.
   Inbound census: 31 direct call sites + 2 imm32 refs (0x86daf1 binding
   push, 0x89564a binder slot-store). No byte gates in the body (the
   gates are the comiss compare and the is_playing AL result); all 37
   laws are uint32_t. */

export const SFX_DUCK_VA_92E620 = 0x0092e620;
export const SFX_DUCK_END_VA_92E6D3 = 0x0092e6d3;
export const SFX_DUCK_FIRST_RET_VA_92E653 = 0x0092e653;
export const SFX_DUCK_NEXT_VA_92E6E0 = 0x0092e6e0;
export const SFX_DUCK_CALLER_COUNT = 31;
export const SFX_DUCK_IMM32_REF1_VA_86DAF1 = 0x0086daf1;
export const SFX_DUCK_IMM32_REF2_VA_89564A = 0x0089564a;
export const SFX_DUCK_THRESHOLD_VA_BAA06C = 0x00baa06c;
export const SFX_DUCK_THRESHOLD_BITS_3C23D70A = 0x3c23d70a;
export const SFX_DUCK_ID_ARG_OFF_8 = 0x08;
export const SFX_DUCK_VOL_ARG_OFF_C = 0x0c;
export const SFX_DUCK_PITCH_ARG_OFF_10 = 0x10;
export const SFX_DUCK_STACK_ARGS_3 = 3;
export const SFX_DUCK_ARM_SILENT_VA_92E63A = 0x0092e63a;
export const SFX_DUCK_ARM_AUDIBLE_VA_92E656 = 0x0092e656;
export const SFX_DUCK_ARM_PLAY_VA_92E68C = 0x0092e68c;
export const SFX_DUCK_GATE_AUDIBLE_GT = 1;
export const SFX_DUCK_SHARED_ID_PUSH_VA_92E637 = 0x0092e637;
export const SFX_DUCK_SILENT_STOP_WHEN_PLAYING = 1;
export const SFX_DUCK_SILENT_IDLE_EXIT_VA_92E6CF = 0x0092e6cf;
export const SFX_DUCK_AUDIBLE_ADJUST_WHEN_PLAYING = 1;
export const SFX_DUCK_VOLUME_BEFORE_PITCH = 1;
export const SFX_DUCK_AUDIBLE_PLAY_WHEN_IDLE = 1;
export const SFX_DUCK_PRE_PLAY_VA_956780 = 0x00956780;
export const SFX_DUCK_PRE_SLOT_OFF_8 = 0x08;
export const SFX_DUCK_PLAY_ROOT_VA_C7169C = 0x00c7169c;
export const SFX_DUCK_PLAY_RECV_OFF_2A324 = 0x2a324;
export const SFX_DUCK_PLAY_VA_92DC30 = 0x0092dc30;
export const SFX_DUCK_PLAY_ARG3_IMM_2 = 2;
export const SFX_DUCK_PLAY_ARG4_IMM_1 = 1;
export const SFX_DUCK_PLAY_ARG6_IMM_0 = 0;
export const SFX_DUCK_PLAY_STACK_ARGS_6 = 6;
export const SFX_DUCK_IS_PLAYING_VA_92E560 = 0x0092e560;
export const SFX_DUCK_STOP_VA_92E230 = 0x0092e230;
export const SFX_DUCK_SET_VOLUME_VA_92DF40 = 0x0092df40;
export const SFX_DUCK_SET_PITCH_VA_92E050 = 0x0092e050;
export const SFX_DUCK_BRANCH_COUNT_3 = 3;

/** 0x92e620 - the Play-ducking wrapper body root. */
export function sfxDuckVa() {
  return SFX_DUCK_VA_92E620;
}

/** 0x92e6d3 - the shared-tail ret (last ret in the body). */
export function sfxDuckEndVa() {
  return SFX_DUCK_END_VA_92E6D3;
}

/** 0x92e653 - the silent arm's ret (first ret in the body). */
export function sfxDuckFirstRetVa() {
  return SFX_DUCK_FIRST_RET_VA_92E653;
}

/** 0x92e6e0 - the next body after the int3 pad (GetVolume). */
export function sfxDuckNextVa() {
  return SFX_DUCK_NEXT_VA_92E6E0;
}

/** Raw .text E8/E9 census: 31 direct call sites. */
export function sfxDuckCallerCount() {
  return SFX_DUCK_CALLER_COUNT;
}

/** 0x86daf1 - `push 0x92e620` (script-binding block). */
export function sfxDuckImm32Ref1Va() {
  return SFX_DUCK_IMM32_REF1_VA_86DAF1;
}

/** 0x89564a - binder tail `mov [eax],0x92e620` slot-store. */
export function sfxDuckImm32Ref2Va() {
  return SFX_DUCK_IMM32_REF2_VA_89564A;
}

/** 0xbaa06c - the .rdata ducking-threshold float dword. */
export function sfxDuckThresholdVa() {
  return SFX_DUCK_THRESHOLD_VA_BAA06C;
}

/** 0x3c23d70a - the threshold's float bits = 0.01f. */
export function sfxDuckThresholdBits() {
  return SFX_DUCK_THRESHOLD_BITS_3C23D70A;
}

/** id argument offset [ebp+8]. */
export function sfxDuckIdArgOff() {
  return SFX_DUCK_ID_ARG_OFF_8;
}

/** volume argument offset [ebp+0xc] (comiss operand). */
export function sfxDuckVolArgOff() {
  return SFX_DUCK_VOL_ARG_OFF_C;
}

/** pitch argument offset [ebp+0x10]. */
export function sfxDuckPitchArgOff() {
  return SFX_DUCK_PITCH_ARG_OFF_10;
}

/** `ret 0xc` - 3 stack args (id, volume, pitch). */
export function sfxDuckStackArgs() {
  return SFX_DUCK_STACK_ARGS_3;
}

/** 0x92e63a - the silent arm (volume <= threshold). */
export function sfxDuckArmSilentVa() {
  return SFX_DUCK_ARM_SILENT_VA_92E63A;
}

/** 0x92e656 - the audible arm (volume > threshold). */
export function sfxDuckArmAudibleVa() {
  return SFX_DUCK_ARM_AUDIBLE_VA_92E656;
}

/** 0x92e68c - the pre-play + Play delegation arm. */
export function sfxDuckArmPlayVa() {
  return SFX_DUCK_ARM_PLAY_VA_92E68C;
}

/** Gate: 1 = comiss jb jumps to AUDIBLE when 0.01f < volume. */
export function sfxDuckGateAudibleGt() {
  return SFX_DUCK_GATE_AUDIBLE_GT;
}

/** 0x92e637 - the single id push for either arm's is_playing. */
export function sfxDuckSharedIdPushVa() {
  return SFX_DUCK_SHARED_ID_PUSH_VA_92E637;
}

/** Silent arm: 1 = stop runs only when is_playing is true. */
export function sfxDuckSilentStopWhenPlaying() {
  return SFX_DUCK_SILENT_STOP_WHEN_PLAYING;
}

/** Silent arm: 1 = idle exits via the shared tail (0x92e6cf). */
export function sfxDuckSilentIdleExitVa() {
  return SFX_DUCK_SILENT_IDLE_EXIT_VA_92E6CF;
}

/** Audible arm: 1 = set_volume + set_pitch run only when playing. */
export function sfxDuckAudibleAdjustWhenPlaying() {
  return SFX_DUCK_AUDIBLE_ADJUST_WHEN_PLAYING;
}

/** Order: 1 = set_volume (0x92e66d) BEFORE set_pitch (0x92e680). */
export function sfxDuckVolumeBeforePitch() {
  return SFX_DUCK_VOLUME_BEFORE_PITCH;
}

/** Audible arm: 1 = idle (is_playing false) jumps to the PLAY arm. */
export function sfxDuckAudiblePlayWhenIdle() {
  return SFX_DUCK_AUDIBLE_PLAY_WHEN_IDLE;
}

/** 0x956780 - the pre-play ctor (thiscall, 0 stack args; PM host). */
export function sfxDuckPrePlayVa() {
  return SFX_DUCK_PRE_PLAY_VA_956780;
}

/** 0x92e692 `lea ecx,[ebp+8]` - pre-play receives the &id slot. */
export function sfxDuckPreSlotOff() {
  return SFX_DUCK_PRE_SLOT_OFF_8;
}

/** 0xc7169c - the global root for the Play receiver (cross v1). */
export function sfxDuckPlayRootVa() {
  return SFX_DUCK_PLAY_ROOT_VA_C7169C;
}

/** 0x2a324 - receiver = *(0xc7169c) + 0x2a324 (cross v1). */
export function sfxDuckPlayRecvOff() {
  return SFX_DUCK_PLAY_RECV_OFF_2A324;
}

/** 0x92dc30 - Play (ret 0x18; 6 stack args). */
export function sfxDuckPlayVa() {
  return SFX_DUCK_PLAY_VA_92DC30;
}

/** Play arg3 - the `push 2` at 0x92e6b9. */
export function sfxDuckPlayArg3() {
  return SFX_DUCK_PLAY_ARG3_IMM_2;
}

/** Play arg4 - the `push 1` at 0x92e6b7. */
export function sfxDuckPlayArg4() {
  return SFX_DUCK_PLAY_ARG4_IMM_1;
}

/** Play arg6 - the `mov [esp+4],0` at 0x92e6a5. */
export function sfxDuckPlayArg6() {
  return SFX_DUCK_PLAY_ARG6_IMM_0;
}

/** Play stack args - 6 (ret 0x18 = 24 bytes). */
export function sfxDuckPlayStackArgs() {
  return SFX_DUCK_PLAY_STACK_ARGS_6;
}

/** 0x92e560 - is_playing (the shared gate callee; ret 4). */
export function sfxDuckIsPlayingVa() {
  return SFX_DUCK_IS_PLAYING_VA_92E560;
}

/** 0x92e230 - stop (the silent arm's action; ret 4). */
export function sfxDuckStopVa() {
  return SFX_DUCK_STOP_VA_92E230;
}

/** 0x92df40 - set_volume (audible action 1; ret 8). */
export function sfxDuckSetVolumeVa() {
  return SFX_DUCK_SET_VOLUME_VA_92DF40;
}

/** 0x92e050 - set_pitch (audible action 2; ret 8). */
export function sfxDuckSetPitchVa() {
  return SFX_DUCK_SET_PITCH_VA_92E050;
}

/** Conditional-branch census of the body: 3 (jb@0x92e638, je@0x92e641,
    je@0x92e65d). */
export function sfxDuckBranches() {
  return SFX_DUCK_BRANCH_COUNT_3;
}

/* ---------- v31: 0x92e120 manager SetPan / 0x92e6e0 GetVolume /
   0x92e750 vector clear+dealloc (ABI 31) --------
   Wave-23 F14 handoff landing: the three in-band unclassified
   caller-bearing bodies the v29 net audit left open. Independent
   oracle: transcribed branch-by-branch from the fresh full-window
   instruction streams (cpu-dump/0092e120.txt, 0092e6e0.txt,
   0092e750.txt, 00a2ac20.txt this unit) — NOT derived from the cpp.
   All byte tests (enabled 0x198, pending 0x09, both vtbl[0x38] probe
   AL results, the is_playing AL result) are uint32_t params masked
   `& 0xff` inside the laws. The pan laws take the pan as its BITS
   (the spill-slot dword) and convert inside. */

export const SFX_SETPAN_VA_92E120 = 0x0092e120;
export const SFX_SETPAN_FIRST_RET_VA_92E178 = 0x0092e178;
export const SFX_SETPAN_END_VA_92E221 = 0x0092e221;
export const SFX_SETPAN_NEXT_VA_92E230 = 0x0092e230;
export const SFX_SETPAN_CALLER_COUNT = 2;
export const SFX_SETPAN_CALLER1_VA_7089BE = 0x007089be;
export const SFX_SETPAN_CALLER2_VA_801D44 = 0x00801d44;
export const SFX_SETPAN_ID_ARG_OFF_8 = 0x08;
export const SFX_SETPAN_STACK_ARGS_1 = 1; /* ret 4; pan rides in XMM2 */
export const SFX_SETPAN_PAN_SPILL_VA_92E134 = 0x0092e134; /* movss [ebp-4],xmm2 */
export const SFX_SETPAN_PAN_RELOAD_VA_92E1D2 = 0x0092e1d2;
export const SFX_SETPAN_PAN_STORE_SITE_92E1C4 = 0x0092e1c4; /* wrapper[0x10] */
export const SFX_SETPAN_PAN_FIELD_OFF_10 = 0x10;
export const SFX_SETPAN_PROBE_SLOT_38 = 0x38;
export const SFX_SETPAN_COUNT_SLOT_60 = 0x60;
export const SFX_SETPAN_SET_SLOT_50 = 0x50;
export const SFX_SETPAN_WARN_SITE_92E1F4 = 0x0092e1f4;
export const SFX_SETPAN_WARN_LOG_LEVEL_4 = 4;
export const SFX_SETPAN_WARN_STR_VA_B9C3E0 = 0x00b9c3e0;
export const SFX_SETPAN_WARN_ARG_OFF_C = 0x0c;
export const SFX_SETPAN_NEUTRAL_XORPS_VA_92E1DC = 0x0092e1dc;
export const SFX_SETPAN_LACKS_FLOOR = 1; /* no id<0 test (defect pin) */
export const SFX_SETPAN_VOICE_BOUND_RELOAD = 1;
export const SFX_SETPAN_BRANCH_COUNT_13 = 13;

export const SFX_GETVOLUME_VA_92E6E0 = 0x0092e6e0;
export const SFX_GETVOLUME_FIRST_RET_VA_92E72C = 0x0092e72c;
export const SFX_GETVOLUME_END_VA_92E74B = 0x0092e74b;
export const SFX_GETVOLUME_NEXT_VA_92E750 = 0x0092e750;
export const SFX_GETVOLUME_CALLER_COUNT = 7;
export const SFX_GETVOLUME_IMM32_REF1_VA_86DB02 = 0x0086db02;
export const SFX_GETVOLUME_IMM32_REF2_VA_8956AA = 0x008956aa;
export const SFX_GETVOLUME_ID_ARG_OFF_8 = 0x08;
export const SFX_GETVOLUME_STACK_ARGS_1 = 1;
export const SFX_GETVOLUME_ZERO_RET_VA_92E727 = 0x0092e727;
export const SFX_GETVOLUME_VALUE_RET_VA_92E742 = 0x0092e742;
export const SFX_GETVOLUME_BASE_OFF_194 = 0x194;
export const SFX_GETVOLUME_IS_PLAYING_SITE_92E739 = 0x0092e739;
export const SFX_GETVOLUME_BRANCH_COUNT_5 = 5;

export const SFX_CLEARVEC_VA_92E750 = 0x0092e750;
export const SFX_CLEARVEC_END_VA_92E7BE = 0x0092e7be;
export const SFX_CLEARVEC_NEXT_VA_92E7D0 = 0x0092e7d0;
export const SFX_CLEARVEC_CALLER_COUNT = 2;
export const SFX_CLEARVEC_CALL_SITE_VA_951686 = 0x00951686;
export const SFX_CLEARVEC_JMP_STUB_VA_92CF30 = 0x0092cf30;
export const SFX_CLEARVEC_STUB_INBOUND_VA_B0BB1D = 0x00b0bb1d;
export const SFX_CLEARVEC_BEGIN_GATE_VA_92E755 = 0x0092e755;
export const SFX_CLEARVEC_STACK_ARGS_0 = 0;
export const SFX_CLEARVEC_DEAD_PUSH_ARG = 1;
export const SFX_CLEARVEC_DESTROY_SITE_92E75E = 0x0092e75e;
export const SFX_CLEARVEC_ZERO_STORES_3 = 3;
export const SFX_CLEARVEC_BRANCH_COUNT_3 = 3;

/** 0x92e120 - the manager SetPan body root. */
export function sfxSetPanVa() {
  return SFX_SETPAN_VA_92E120;
}

/** 0x92e178 - the NO_SAMPLES warn epilogue (first ret in the body). */
export function sfxSetPanFirstRetVa() {
  return SFX_SETPAN_FIRST_RET_VA_92E178;
}

/** 0x92e221 - the last ret (ret 4). */
export function sfxSetPanEndVa() {
  return SFX_SETPAN_END_VA_92E221;
}

/** 0x92e230 - the next body (stop). */
export function sfxSetPanNextVa() {
  return SFX_SETPAN_NEXT_VA_92E230;
}

/** Raw .text E8/E9 census: 2 direct call sites. */
export function sfxSetPanCallerCount() {
  return SFX_SETPAN_CALLER_COUNT;
}

/** 0x7089be - caller 1: `movss xmm2,[esp+0x24]` then push id 0x3f0. */
export function sfxSetPanCaller1Va() {
  return SFX_SETPAN_CALLER1_VA_7089BE;
}

/** 0x801d44 - caller 2: end of the divss/maxss/minss/mulss chain. */
export function sfxSetPanCaller2Va() {
  return SFX_SETPAN_CALLER2_VA_801D44;
}

/** [ebp+8] - the id argument offset. */
export function sfxSetPanIdArgOff() {
  return SFX_SETPAN_ID_ARG_OFF_8;
}

/** `ret 4` - 1 stack arg; the pan argument arrives in XMM2. */
export function sfxSetPanStackArgs() {
  return SFX_SETPAN_STACK_ARGS_1;
}

/** 0x92e134 - `movss [ebp-4],xmm2`: the pan spill. */
export function sfxSetPanPanSpillVa() {
  return SFX_SETPAN_PAN_SPILL_VA_92E134;
}

/** 0x92e1d2 - `movss xmm2,[ebp-4]`: the pan reload before the island. */
export function sfxSetPanPanReloadVa() {
  return SFX_SETPAN_PAN_RELOAD_VA_92E1D2;
}

/** 0x92e1c4 - the wrapper pan store `movss [esi+0x10],xmm0`. */
export function sfxSetPanPanStoreSite() {
  return SFX_SETPAN_PAN_STORE_SITE_92E1C4;
}

/** 0x10 - the wrapper pan field (== SFX_VOICE_OFF_PAN_10). */
export function sfxSetPanPanFieldOff() {
  return SFX_SETPAN_PAN_FIELD_OFF_10;
}

/** 0x38 - the vtbl activity-probe slot (probed twice per voice). */
export function sfxSetPanProbeSlot() {
  return SFX_SETPAN_PROBE_SLOT_38;
}

/** 0x60 - the vtbl channel-count probe (island input). */
export function sfxSetPanCountSlot() {
  return SFX_SETPAN_COUNT_SLOT_60;
}

/** 0x50 - the vtbl device set-pan slot. */
export function sfxSetPanSetSlot() {
  return SFX_SETPAN_SET_SLOT_50;
}

/** 0x92e1f4 - the pan-warn log call. */
export function sfxSetPanWarnSite() {
  return SFX_SETPAN_WARN_SITE_92E1F4;
}

/** 4 - the pan-warn log level (== SFX_PAN_WARN_LOG_LEVEL). */
export function sfxSetPanWarnLevel() {
  return SFX_SETPAN_WARN_LOG_LEVEL_4;
}

/** 0xb9c3e0 - the pan-warn format string (== SFX_PAN_WARN_STR_VA). */
export function sfxSetPanWarnStrVa() {
  return SFX_SETPAN_WARN_STR_VA_B9C3E0;
}

/** 0xc - the warn's extra arg: [channel+0xc], an object field. */
export function sfxSetPanWarnArgOff() {
  return SFX_SETPAN_WARN_ARG_OFF_C;
}

/** 0x92e1dc - the island's +0.0 is INLINED (xorps), unlike the
    wrapper's .rdata 0xba9fe4 load. */
export function sfxSetPanNeutralXorpsVa() {
  return SFX_SETPAN_NEUTRAL_XORPS_VA_92E1DC;
}

/** 1 - the entry gate has NO id<0 floor (`cmp id,count ; jge` SIGNED
    upper bound only): negative ids fall through (defect, pinned). */
export function sfxSetPanLacksFloor() {
  return SFX_SETPAN_LACKS_FLOOR;
}

/** 1 - the voice-loop bound re-reads [entry+0x190] every iteration. */
export function sfxSetPanVoiceBoundReload() {
  return SFX_SETPAN_VOICE_BOUND_RELOAD;
}

/** Conditional-branch census of the body: 13. */
export function sfxSetPanBranches() {
  return SFX_SETPAN_BRANCH_COUNT_13;
}

/** Per-voice wrapper-arm dispatch: 1 when the voice reaches the pan
    store and the island (channel live && (probe2 || pending-after)).
    Byte gates: pending09 / probe1 / probe2 masked & 0xff. */
export function sfxSetPanVoiceEnter(channelNull, pending09, probe1, probe2) {
  if (i32(channelNull) !== 0) return 0;
  if (byte(probe2) !== 0) return 1;
  const pending = byte(pending09);
  if (pending === 0) return 0;
  return byte(probe1) !== 0 ? 0 : 1;
}

/** 1 when the pending byte store [w+9] := 0 ran. Byte gate on probe1. */
export function sfxSetPanPendingClear(channelNull, pending09, probe1) {
  if (i32(channelNull) !== 0) return 0;
  if (byte(pending09) === 0) return 0;
  return byte(probe1) !== 0 ? 1 : 0;
}

/** Island decision: SET when count <= 1 (SIGNED cmp eax,1 ; jle) or the
    pan (from its bits) is ordered-equal +0.0; WARN otherwise (every
    nonzero pan and NaN). Decision-identical to
    sfxChannelPanAction(0, count, pan) - the v2 wrapper island
    re-verified on this body, consumed by reference (channel_null = 0:
    the null arm lives in the loop dispatch). */
export function sfxSetPanPanAction(channelCount, panBits) {
  return sfxChannelPanAction(0, channelCount, f32FromBits(panBits));
}

/** Struct-form voice plan. The wrapper pan store runs ONLY on the
    enter path - the v2 wrapper 0x00a2ac20 stores before its null test;
    that divergence is what storeNeeded/enter pin. */
export function sfxSetPanVoicePlan(channelNull, pending09, probe1, probe2,
                                   channelCount, panBits) {
  const enter = sfxSetPanVoiceEnter(channelNull, pending09, probe1, probe2);
  const action = enter !== 0
    ? sfxSetPanPanAction(channelCount, panBits)
    : SFX_PAN_ACTION_NONE;
  return {
    enter,
    pendingClear: sfxSetPanPendingClear(channelNull, pending09, probe1),
    panStored: enter !== 0,
    action,
    warnLogNeeded: action === SFX_PAN_ACTION_WARN,
    deviceCallNeeded: action === SFX_PAN_ACTION_SET,
    storedPanBits: u32(panBits),
  };
}

/** 0x92e6e0 - the GetVolume body root. */
export function sfxGetVolumeVa() {
  return SFX_GETVOLUME_VA_92E6E0;
}

/** 0x92e72c - the +0.0 return (first ret). */
export function sfxGetVolumeFirstRetVa() {
  return SFX_GETVOLUME_FIRST_RET_VA_92E72C;
}

/** 0x92e74b - the base-volume return (last ret). */
export function sfxGetVolumeEndVa() {
  return SFX_GETVOLUME_END_VA_92E74B;
}

/** 0x92e750 - the next body (vector clear). */
export function sfxGetVolumeNextVa() {
  return SFX_GETVOLUME_NEXT_VA_92E750;
}

/** Raw .text E8/E9 census: 7 direct call sites. */
export function sfxGetVolumeCallerCount() {
  return SFX_GETVOLUME_CALLER_COUNT;
}

/** 0x86db02 - `push 0x92e6e0` (script-binding block). */
export function sfxGetVolumeImm32Ref1Va() {
  return SFX_GETVOLUME_IMM32_REF1_VA_86DB02;
}

/** 0x8956aa - binder tail `mov [eax],0x92e6e0` slot-store. */
export function sfxGetVolumeImm32Ref2Va() {
  return SFX_GETVOLUME_IMM32_REF2_VA_8956AA;
}

/** [ebp+8] - the id argument offset. */
export function sfxGetVolumeIdArgOff() {
  return SFX_GETVOLUME_ID_ARG_OFF_8;
}

/** `ret 4` - 1 stack arg; the value returns in x87 ST0. */
export function sfxGetVolumeStackArgs() {
  return SFX_GETVOLUME_STACK_ARGS_1;
}

/** 0x92e727 - the `fldz` return tail (every zero path). */
export function sfxGetVolumeZeroRetVa() {
  return SFX_GETVOLUME_ZERO_RET_VA_92E727;
}

/** 0x92e742 - the `fld [esi+0x194]` return tail. */
export function sfxGetVolumeValueRetVa() {
  return SFX_GETVOLUME_VALUE_RET_VA_92E742;
}

/** 0x194 - the entry base-volume offset (== SFX_ENTRY_OFF_BASE_VOLUME_194). */
export function sfxGetVolumeBaseOff() {
  return SFX_GETVOLUME_BASE_OFF_194;
}

/** 0x92e739 - the is_playing call site (-> 0x92e560, ret 4). */
export function sfxGetVolumeIsPlayingSite() {
  return SFX_GETVOLUME_IS_PLAYING_SITE_92E739;
}

/** Conditional-branch census of the body: 5. */
export function sfxGetVolumeBranches() {
  return SFX_GETVOLUME_BRANCH_COUNT_5;
}

/** The getter decision. gate_kind SFX_GATE_*: MISS and DISABLED are
    silent; NO_SAMPLES warns (0xb7b1fc, level 1, id) then returns +0.0;
    LIVE runs the is_playing LOW-BYTE al gate -> +0.0 or the entry base
    volume. */
export function sfxGetVolumePlan(id, spanBytes, voices190, enabled198,
                                 playingAl) {
  const out = {
    gateKind: SFX_GATE_MISS,
    warnLogNeeded: false,
    isPlayingGateRan: false,
    returnsBaseVolume: false,
    baseVolumeOff: SFX_GETVOLUME_BASE_OFF_194,
  };
  /* test edi,edi ; js + cmp edi,count ; jge: BOTH bounds silent; the
     getter HAS the floor the SetPan gate lacks. */
  if (i32(id) < 0 || i32(id) >= sfxEntryCount(spanBytes)) return out;
  if (u32(voices190) === 0) {
    out.gateKind = SFX_GATE_NO_SAMPLES;
    out.warnLogNeeded = true;
    return out;
  }
  if (byte(enabled198) === 0) {
    out.gateKind = SFX_GATE_DISABLED;
    return out;
  }
  out.gateKind = SFX_GATE_LIVE;
  out.isPlayingGateRan = true;
  out.returnsBaseVolume = byte(playingAl) !== 0;
  return out;
}

/** 0x92e750 - the vector clear body root. */
export function sfxClearVecVa() {
  return SFX_CLEARVEC_VA_92E750;
}

/** 0x92e7be - the plain ret (first and last). */
export function sfxClearVecEndVa() {
  return SFX_CLEARVEC_END_VA_92E7BE;
}

/** 0x92e7d0 - the next body (destroy-range wrapper; the 0x92e7bf abort
    IAT stub sits between). */
export function sfxClearVecNextVa() {
  return SFX_CLEARVEC_NEXT_VA_92E7D0;
}

/** Raw .text E8/E9 census: 2 inbound (call 0x951686 + jmp tail
    0x92cf30). */
export function sfxClearVecCallerCount() {
  return SFX_CLEARVEC_CALLER_COUNT;
}

/** 0x951686 - the direct caller. */
export function sfxClearVecCallSiteVa() {
  return SFX_CLEARVEC_CALL_SITE_VA_951686;
}

/** 0x92cf30 - the `jmp 0x92e750` stub (right before PreloadSound). */
export function sfxClearVecJmpStubVa() {
  return SFX_CLEARVEC_JMP_STUB_VA_92CF30;
}

/** 0xb0bb1d - the cold-arm `jmp 0x92cf30` (chained tail). */
export function sfxClearVecStubInboundVa() {
  return SFX_CLEARVEC_STUB_INBOUND_VA_B0BB1D;
}

/** 0x92e755 - the FULL-WORD begin==0 gate (`test ecx,ecx ; je`). */
export function sfxClearVecBeginGateVa() {
  return SFX_CLEARVEC_BEGIN_GATE_VA_92E755;
}

/** plain ret - 0 stack args (thiscall). */
export function sfxClearVecStackArgs() {
  return SFX_CLEARVEC_STACK_ARGS_0;
}

/** 1 - the destroy-range call carries a DEAD stack arg (begin) the
    plain-ret callee ignores; popped at 0x92e76d. */
export function sfxClearVecDeadPushArg() {
  return SFX_CLEARVEC_DEAD_PUSH_ARG;
}

/** 0x92e75e - the destroy-range call site (-> 0x92ea80, host walk). */
export function sfxClearVecDestroySite() {
  return SFX_CLEARVEC_DESTROY_SITE_92E75E;
}

/** 3 - the zero dword stores begin := end := cap := 0 (0x92e7a8/ae/b5),
    only on the destroy path. */
export function sfxClearVecZeroStores() {
  return SFX_CLEARVEC_ZERO_STORES_3;
}

/** Conditional-branch census of the body: 3. */
export function sfxClearVecBranches() {
  return SFX_CLEARVEC_BRANCH_COUNT_3;
}

/** size = entry_count(cap - begin) * 0x1b8: the shared divide
    re-multiplied (32-bit wrap, down-round). The span is the ALLOCATED
    extent (CAP-begin). 0x92e770..0x92e77e. */
export function sfxClearVecSize(capBytes, beginBytes) {
  const span = i32(u32(capBytes) - u32(beginBytes));
  return (Math.imul(sfxEntryCount(span), SFX_ENTRY_STRIDE) | 0) >>> 0;
}

/** Struct-form clear decision: destroy-range first, then the
    element-block free (the v4 block-free tail consumed by reference),
    then the three zero stores. beginNonzero == 0 -> no-op everywhere. */
export function sfxClearVecFreePlan(beginNonzero, capBytes, beginBytes,
                                    ptrMinusBack) {
  if (i32(beginNonzero) === 0) {
    return {
      destroyRuns: false,
      blockSize: 0,
      usesBackPointer: false,
      freeSize: 0,
      slackChecked: false,
      corruptFatal: false,
      zeroStores: 0,
    };
  }
  const blockSize = sfxClearVecSize(capBytes, beginBytes);
  const t = sfxBlockFreePlan(blockSize, ptrMinusBack);
  return {
    destroyRuns: true,
    blockSize,
    usesBackPointer: t.usesBackPointer,
    freeSize: t.freeSize,
    slackChecked: t.slackChecked,
    corruptFatal: t.corruptFatal,
    zeroStores: SFX_CLEARVEC_ZERO_STORES_3,
  };
}


/* ---------- v38: 0xa2bb10 hook-callable decision layer (wave-31 F4;
   notes sfx-v38-hook; fresh dump cpu-dump/00a2bb10.txt) ----------
   Oracular transcription from the full-body listing (NOT derived from
   the cpp). The v22 attach-hook BODY: installed into 0xc7f484 by the
   wrapper cluster (imm32 refs 0xa2afeb + 0xa7d53a), dispatched by
   the family's own islands (0 direct E8/E9 callers). cdecl, ONE stack
   arg = the pair pointer ([pair+0] key, [pair+4] member2). Decision
   tree: G1 member2 FULL-dword non-null else nothing; G2 16-BIT lock
   word [member2+4] == 1 (read after the child vtbl[0xc] acquire,
   before the vtbl[0x10] release; byte4 lock + byte5 clear); G3 key
   FULL-dword non-null else walk skipped (the 64-entry member-table
   walk on [0xc5aadc], stride 0xc, CONSTANT 0x300 bound, base re-read
   every iteration, entry[8] == key FULL dword -> [match+0x34] := 0 +
   [entry+8] := 0 + IAT 0xb18540(entry[0]) + 0xb1854c(entry[0],
   0x1009, 0), walk continues); G5 BYTE bit0 of the flags GLOBAL
   0xc5aaa4 clear -> warn 0xa112c0(0x10, 0xb9c450 — the v36 warn
   consts at body #2); G6 key non-null else map skipped (no unlock
   tail); map phase = the v36 step model at body #2 (vtbl[0xc] on
   0xc5aab0, key2 = [key+0x10], map find 0xa12280, result ==
   [0xc5aaa8] -> MISS — v35 map_found body #2, loop member check,
   0x414a80 advance, remove 0x415d20, island at body #3 (probe
   [node+0x18] FULL dword + vtbl[0xc] LOW-BYTE result + hook ptr ->
   hook(&node+0x14)), free(node, 0x1c) UNCONDITIONAL); tail
   vtbl[0x10] on 0xc5aab0 on EVERY map exit. All byte gates uint32_t
   & 0xff; the WORD gate reads the two member bytes as the machine
   does (b4 | b5<<8 == 1). */

export const SFX_HOOK_VA_A2BB10 = 0x00a2bb10;
export const SFX_HOOK_END_VA_A2BC9D = 0x00a2bc9d;
export const SFX_HOOK_NEXT_VA_A2BCB0 = 0x00a2bcb0;
export const SFX_HOOK_DIRECT_CALLERS = 0;
export const SFX_HOOK_IMM32_REFS = 2;
export const SFX_HOOK_INSTALL2_SITE = 0x00a7d53a;
export const SFX_HOOK_BODY_INSNS = 125;
export const SFX_HOOK_SEH_HANDLER_VA = 0x00af12f0;
export const SFX_HOOK_STACK_ARGS = 1;
export const SFX_HOOK_RET_IMM = 0;
export const SFX_HOOK_PAIR_MEMBER2_OFF = 4;
export const SFX_HOOK_PAIR_KEY_OFF = 0;
export const SFX_HOOK_MEMBER_LOCK_WORD_OFF = 4;
export const SFX_HOOK_LOCK_WORD_GATE_VALUE = 1;
export const SFX_HOOK_KEY_GATE_SITES = 2;
export const SFX_HOOK_KEY_GATE_WALK_SITE = 0x00a2bb69;
export const SFX_HOOK_KEY_GATE_MAP_SITE = 0x00a2bbda;
export const SFX_HOOK_TABLE_GLOBAL = 0x00c5aadc;
export const SFX_HOOK_TABLE_STRIDE = 0x0c;
export const SFX_HOOK_TABLE_BOUND = 0x300;
export const SFX_HOOK_TABLE_ITERATIONS = 64;
export const SFX_HOOK_TABLE_KEY_OFF = 8;
export const SFX_HOOK_TABLE_HANDLE_OFF = 0;
export const SFX_HOOK_TABLE_RELOAD = 1;
export const SFX_HOOK_MATCH_FIELD34_OFF = 0x34;
export const SFX_HOOK_MATCH_CLEARS = 2;
export const SFX_HOOK_IAT_RELEASE_18540 = 0x00b18540;
export const SFX_HOOK_IAT_KILL_1854C = 0x00b1854c;
export const SFX_HOOK_KILL_ARG1 = 0x1009;
export const SFX_HOOK_KILL_ARG2 = 0;
export const SFX_HOOK_IAT_CALL_SITE1 = 0x00a2bb99;
export const SFX_HOOK_IAT_CALL_SITE2 = 0x00a2bbae;
export const SFX_HOOK_FLAGS_GLOBAL = 0x00c5aaa4;
export const SFX_HOOK_WARN_SITE = 0x00a2bbc2;
export const SFX_HOOK_WARN_FMT_VA = 0x00b9c450;
export const SFX_HOOK_WARN_LEVEL = 0x10;
export const SFX_HOOK_MAP_GLOBAL = 0x00c5aaa8;
export const SFX_HOOK_MAP_LOCK_GLOBAL = 0x00c5aab0;
export const SFX_HOOK_MAP_FIND_SITE = 0x00a2bc04;
export const SFX_HOOK_MAP_FOUND_SITE = 0x00a2bc12;
export const SFX_HOOK_MAP_LOOP_SITE = 0x00a2bc16;
export const SFX_HOOK_MAP_MEMBER_OFF = 0x14;
export const SFX_HOOK_MAP_KEY_OFF = 0x10;
export const SFX_HOOK_MAP_REMOVE_SITE = 0x00a2bc36;
export const SFX_HOOK_ISLAND_SITE = 0x00a2bc4d;
export const SFX_HOOK_ISLAND_PROBE_OFF = 4;
export const SFX_HOOK_ISLAND_TARGET_OFF = 0x14;
export const SFX_HOOK_FREE_SIZE = 0x1c;
export const SFX_HOOK_FREE_SITE = 0x00a2bc78;
export const SFX_HOOK_TAIL_SITE = 0x00a2bc80;
export const SFX_HOOK_LOCK_ACQUIRE_SITE = 0x00a2bb4d;
export const SFX_HOOK_LOCK_RELEASE_SITE = 0x00a2bb58;
export const SFX_HOOK_ISLAND_SELF_SITE = 0x00a2bc5f;
export const SFX_HOOK_STEP_MISS = 0;
export const SFX_HOOK_STEP_FOUND = 1;
export const SFX_HOOK_STEP_ADVANCE = 2;
export const SFX_HOOK_STEP_MISMATCH = 3;

/** G1 0xa2bb3b: 1 iff the pair's member2 pointer is non-NULL (FULL
    dword; NULL -> the body does nothing). */
export function sfxHookGatePair1(pair1) {
  return u32(pair1) !== 0 ? 1 : 0;
}

/** G2 0xa2bb54/0xa2bb5b: the 16-bit member lock word == 1 — the
    machine reads SIXTEEN bits (movzx, re-read after the child lock
    acquire) and compares to 1; b4/b5 are the two bytes (byte4 lock
    set AND byte5 clear). NOT a byte gate. */
export function sfxHookLockWordGate(b4, b5) {
  const word = (u32(b4) & 0xff) | ((u32(b5) & 0xff) << 8);
  return word === 1 ? 1 : 0;
}

/** G3/G6 0xa2bb69 + 0xa2bbda: 1 iff the key pointer is non-NULL
    (FULL dword, TWO sites). */
export function sfxHookGateKey(key) {
  return u32(key) !== 0 ? 1 : 0;
}

/** G4 0xa2bb79: walk entry[8] == key (FULL dword); a match clears
    [match+0x34] and [entry+8] and runs the IAT release pair (host);
    the walk CONTINUES (no early exit). */
export function sfxHookWalkMatch(entry8, key) {
  return u32(entry8) === u32(key) ? 1 : 0;
}

/** Loop bound 0xa2bbb7/0xa2bbba: (index + 0xc) < 0x300 UNSIGNED with
    32-bit wrap; in-reach runs are 64 iterations (0..0x2f4), stop at
    index 0x2f4 (next == 0x300). CONSTANT bound. */
export function sfxHookWalkContinue(index) {
  return u32(u32(index) + 0x0c) < 0x300 ? 1 : 0;
}

/** G5 0xa2bbc2: warn iff BYTE bit0 of the flags global (0xc5aaa4)
    is clear — the v36 warn law at its second body/site/global. */
export function sfxHookWarnNeeded(flags) {
  return ((u32(flags) & 0xff) & 1) === 0 ? 1 : 0;
}

/** Full plan for the hook body. The map phase is the v36 step model
    (sfxInitWalkStep) at body #2 and the island is the v36 island law
    at body #3; map_result/map_end feed the v35 map_found at body #2.
    out is a plain object (plan struct mirror). */
export function sfxHookPlan(pair1, lockB4, lockB5, key, walkMatchFound,
                            flagsGlobal, mapResult, mapEnd,
                            nodeMemberPtr, nodeMemberKey, nodeB,
                            probeAl, hook) {
  const pair1Gate = sfxHookGatePair1(pair1);
  const lockWordGate = sfxHookLockWordGate(lockB4, lockB5);
  const bodyRuns = (pair1Gate !== 0 && lockWordGate !== 0) ? 1 : 0;
  const keyGate = sfxHookGateKey(key);
  const walkRuns = (bodyRuns !== 0 && keyGate !== 0) ? 1 : 0;
  const mapRuns = walkRuns; /* G6 repeats the key gate */
  const step = sfxInitWalkStep(u32(mapResult) === u32(mapEnd) ? 1 : 0,
                               nodeMemberPtr, nodeMemberKey, key, key);
  const found = step === SFX_INIT_WALK_STEP_FOUND ? 1 : 0;
  const island = sfxInitWalkIslandHook(found, nodeB, probeAl, hook);
  return {
    pair1Gate,
    lockWordGate,
    bodyRuns,
    keyGate,
    walkRuns,
    walkIterations: walkRuns !== 0 ? SFX_HOOK_TABLE_ITERATIONS : 0,
    walkMatchFound: u32(walkMatchFound) & 1,
    warnRuns: (bodyRuns !== 0 && sfxHookWarnNeeded(flagsGlobal) !== 0) ? 1 : 0,
    mapRuns,
    mapStep: mapRuns !== 0 ? step : SFX_HOOK_STEP_MISS,
    foundArmRuns: found,
    advanceCalls: step === SFX_INIT_WALK_STEP_ADVANCE ? 1 : 0,
    removeCallRuns: found,
    freeRuns: found,
    islandHookRuns: island,
    tailUnlockRuns: mapRuns,
    mapFindCallRuns: mapRuns,
  };
}

/* v38 census pins (lea-corrected tooling; notes sfx-v38-hook). */
export function sfxHookEndVa() { return SFX_HOOK_END_VA_A2BC9D; }
export function sfxHookNextVa() { return SFX_HOOK_NEXT_VA_A2BCB0; }
export function sfxHookDirectCallers() { return SFX_HOOK_DIRECT_CALLERS; }
export function sfxHookImm32Refs() { return SFX_HOOK_IMM32_REFS; }
export function sfxHookInstall2Site() { return SFX_HOOK_INSTALL2_SITE; }
export function sfxHookBodyInsns() { return SFX_HOOK_BODY_INSNS; }
export function sfxHookSehHandlerVa() { return SFX_HOOK_SEH_HANDLER_VA; }
export function sfxHookStackArgs() { return SFX_HOOK_STACK_ARGS; }
export function sfxHookPairMember2Off() { return SFX_HOOK_PAIR_MEMBER2_OFF; }
export function sfxHookPairKeyOff() { return SFX_HOOK_PAIR_KEY_OFF; }
export function sfxHookMemberLockWordOff() { return SFX_HOOK_MEMBER_LOCK_WORD_OFF; }
export function sfxHookLockWordGateValue() { return SFX_HOOK_LOCK_WORD_GATE_VALUE; }
export function sfxHookKeyGateSites() { return SFX_HOOK_KEY_GATE_SITES; }
export function sfxHookKeyGateWalkSite() { return SFX_HOOK_KEY_GATE_WALK_SITE; }
export function sfxHookKeyGateMapSite() { return SFX_HOOK_KEY_GATE_MAP_SITE; }
export function sfxHookTableGlobal() { return SFX_HOOK_TABLE_GLOBAL; }
export function sfxHookTableStride() { return SFX_HOOK_TABLE_STRIDE; }
export function sfxHookTableBound() { return SFX_HOOK_TABLE_BOUND; }
export function sfxHookTableIterations() { return SFX_HOOK_TABLE_ITERATIONS; }
export function sfxHookTableKeyOff() { return SFX_HOOK_TABLE_KEY_OFF; }
export function sfxHookTableHandleOff() { return SFX_HOOK_TABLE_HANDLE_OFF; }
export function sfxHookTableReload() { return SFX_HOOK_TABLE_RELOAD; }
export function sfxHookMatchField34Off() { return SFX_HOOK_MATCH_FIELD34_OFF; }
export function sfxHookMatchClears() { return SFX_HOOK_MATCH_CLEARS; }
export function sfxHookIatRelease() { return SFX_HOOK_IAT_RELEASE_18540; }
export function sfxHookIatKill() { return SFX_HOOK_IAT_KILL_1854C; }
export function sfxHookKillArg1() { return SFX_HOOK_KILL_ARG1; }
export function sfxHookKillArg2() { return SFX_HOOK_KILL_ARG2; }
export function sfxHookIatCallSite1() { return SFX_HOOK_IAT_CALL_SITE1; }
export function sfxHookIatCallSite2() { return SFX_HOOK_IAT_CALL_SITE2; }
export function sfxHookFlagsGlobal() { return SFX_HOOK_FLAGS_GLOBAL; }
export function sfxHookWarnSite() { return SFX_HOOK_WARN_SITE; }
export function sfxHookWarnFmtVa() { return SFX_HOOK_WARN_FMT_VA; }
export function sfxHookWarnLevel() { return SFX_HOOK_WARN_LEVEL; }
export function sfxHookMapGlobal() { return SFX_HOOK_MAP_GLOBAL; }
export function sfxHookMapLockGlobal() { return SFX_HOOK_MAP_LOCK_GLOBAL; }
export function sfxHookMapFindSite() { return SFX_HOOK_MAP_FIND_SITE; }
export function sfxHookMapFoundSite() { return SFX_HOOK_MAP_FOUND_SITE; }
export function sfxHookMapLoopSite() { return SFX_HOOK_MAP_LOOP_SITE; }
export function sfxHookMapMemberOff() { return SFX_HOOK_MAP_MEMBER_OFF; }
export function sfxHookMapKeyOff() { return SFX_HOOK_MAP_KEY_OFF; }
export function sfxHookMapRemoveSite() { return SFX_HOOK_MAP_REMOVE_SITE; }
export function sfxHookIslandSite() { return SFX_HOOK_ISLAND_SITE; }
export function sfxHookIslandProbeOff() { return SFX_HOOK_ISLAND_PROBE_OFF; }
export function sfxHookIslandTargetOff() { return SFX_HOOK_ISLAND_TARGET_OFF; }
export function sfxHookFreeSize() { return SFX_HOOK_FREE_SIZE; }
export function sfxHookFreeSite() { return SFX_HOOK_FREE_SITE; }
export function sfxHookTailSite() { return SFX_HOOK_TAIL_SITE; }
export function sfxHookLockAcquireSite() { return SFX_HOOK_LOCK_ACQUIRE_SITE; }
export function sfxHookLockReleaseSite() { return SFX_HOOK_LOCK_RELEASE_SITE; }
export function sfxHookIslandSelfSite() { return SFX_HOOK_ISLAND_SELF_SITE; }

/* ---------- v39: 0xa2bcb0 list-clear decision seams + the
   0x92e7d0/0x92e7f0 declared destroy/free wrappers (wave-32 F4;
   notes sfx-v39-listclear; fresh dumps cpu-dump/00a2bcb0.txt,
   0092e7d0.txt, 0092e7f0.txt) ----------
   Oracular transcription from the full-body listings (NOT derived
   from the cpp). List clear: body 0xa2bcb0..0xa2bd4c (ret 8, thiscall
   this + TWO stack args: [ebp+8] arg1, [ebp+0xc] the node), SEH
   0xaf1380, 5 E8 callers re-censused (0xa2afb1, 0xa2b01b, 0xa2bcec
   SELF recursion, 0xa7d599, 0xa9e61e), the v37 §2h reached-leaves row
   that v38 left host. Per-node decision tree: G entry BYTE node[0xd]
   == 0 (masked & 0xff; TWO sites 0xa2bcde entry / 0xa2bd35 loop) else
   TAIL; per walked node RECURSE(this, arg1, node[8]) FIRST (0xa2bcec),
   then the island = the v36 island law at body #4 (probe ptr
   pair[4] == node+0x18 FULL dword, vtbl[0xc] LOW-BYTE result, hook
   global 0xc7f484 FULL dword -> hook(&node+0x14)), then free(node,
   0x1c) UNCONDITIONAL (0xa2bd20 -> 0xaef15c), then next := node[0]
   and loop while BYTE next[0xd] == 0. Wrappers: 0x92e7d0 (8 insns,
   ret 8) UNCONDITIONALLY forwards to the v4 host destroy-range
   0x92ea80 (ecx=begin, edx=end; the begin==end gate is INSIDE the
   host at 0x92eaa6) — 2 callers 0x92ea54 (0x92e900 grow body) +
   0x92ef4f (0x92ee40 grow SEH cleanup arm); 0x92e7f0 (18 insns, ret
   8) is the v4 sfxBlockFreePlan tail at its next body with size =
   imul(count, 0x1b8): < 0x1000 UNSIGNED -> free(begin, size); else
   back = [begin-4] (ptr_minus_back input), size += 0x23, slack =
   (ptrMinusBack - 4) UNSIGNED > 0x1f -> abort IAT 0xb18894 at
   0x92e825, else free(back, size') — 2 callers 0x92ea5f +
   0x92ef5a. All byte gates uint32_t & 0xff. */

export const SFX_LIST_CLEAR_VA_A2BCB0 = 0x00a2bcb0;
export const SFX_LIST_CLEAR_END_VA_A2BD4C = 0x00a2bd4c;
export const SFX_LIST_CLEAR_NEXT_VA_A2BD60 = 0x00a2bd60;
/* caller count comes from the v37 census pin SFX_LIST_CLEAR_CALLERS
   (this family's v37/v38 blocks assert it) — no duplicate export. */
export const SFX_LIST_CLEAR_CALLER1_VA_A2AFB1 = 0x00a2afb1;
export const SFX_LIST_CLEAR_CALLER2_VA_A2B01B = 0x00a2b01b;
export const SFX_LIST_CLEAR_SELF_SITE_A2BCEC = 0x00a2bcec;
export const SFX_LIST_CLEAR_CALLER4_VA_A7D599 = 0x00a7d599;
export const SFX_LIST_CLEAR_CALLER5_VA_A9E61E = 0x00a9e61e;
export const SFX_LIST_CLEAR_IMM32_REFS = 5;
export const SFX_LIST_CLEAR_BODY_INSNS = 58;
export const SFX_LIST_CLEAR_SEH_HANDLER_VA = 0x00af1380;
export const SFX_LIST_CLEAR_STACK_ARGS = 2;
export const SFX_LIST_CLEAR_RET_IMM = 8;
export const SFX_LIST_CLEAR_NODE_NEXT_OFF = 0;
export const SFX_LIST_CLEAR_NODE_CHILD_OFF = 8;
export const SFX_LIST_CLEAR_NODE_FLAG_BYTE_OFF = 0x0d;
export const SFX_LIST_CLEAR_PAIR_OFF = 0x14;
export const SFX_LIST_CLEAR_PROBE_OFF = 0x18;
export const SFX_LIST_CLEAR_ENTRY_GATE_SITES = 2;
export const SFX_LIST_CLEAR_ENTRY_GATE_SITE_1 = 0x00a2bcde;
export const SFX_LIST_CLEAR_ENTRY_GATE_SITE_2 = 0x00a2bd35;
export const SFX_LIST_CLEAR_RECURSION_SITE = 0x00a2bcec;
export const SFX_LIST_CLEAR_ISLAND_SITE = 0x00a2bcff;
export const SFX_LIST_CLEAR_HOOK_READ_SITE = 0x00a2bd11;
export const SFX_LIST_CLEAR_FREE_SIZE = 0x1c;
export const SFX_LIST_CLEAR_FREE_SITE = 0x00a2bd2a;
export const SFX_LIST_CLEAR_LOOP_SITE = 0x00a2bd35;
export const SFX_DESTROY_WRAP_VA_92E7D0 = 0x0092e7d0;
export const SFX_DESTROY_WRAP_END_VA_92E7E3 = 0x0092e7e3;
export const SFX_DESTROY_WRAP_NEXT_VA_92E7F0 = 0x0092e7f0;
export const SFX_DESTROY_WRAP_CALLERS = 2;
export const SFX_DESTROY_WRAP_CALLER1_VA_92EA54 = 0x0092ea54;
export const SFX_DESTROY_WRAP_CALLER2_VA_92EF4F = 0x0092ef4f;
export const SFX_DESTROY_WRAP_IMM32_REFS = 2;
export const SFX_DESTROY_WRAP_BODY_INSNS = 8;
export const SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80 = 0x0092ea80;
export const SFX_DESTROY_WRAP_STACK_ARGS = 2;
export const SFX_DESTROY_WRAP_RET_IMM = 8;
export const SFX_DESTROY_RANGE_CALLERS = 8;
export const SFX_FREE_WRAP_VA_92E7F0 = 0x0092e7f0;
export const SFX_FREE_WRAP_END_VA_92E822 = 0x0092e822;
export const SFX_FREE_WRAP_ABORT_SITE_92E825 = 0x0092e825;
export const SFX_FREE_WRAP_NEXT_VA_92E830 = 0x0092e830;
export const SFX_FREE_WRAP_CALLERS = 2;
export const SFX_FREE_WRAP_CALLER1_VA_92EA5F = 0x0092ea5f;
export const SFX_FREE_WRAP_CALLER2_VA_92EF5A = 0x0092ef5a;
export const SFX_FREE_WRAP_IMM32_REFS = 2;
export const SFX_FREE_WRAP_BODY_INSNS = 18;
export const SFX_FREE_WRAP_STACK_ARGS = 2;
export const SFX_FREE_WRAP_RET_IMM = 8;
export const SFX_FREE_WRAP_STRIDE_1B8 = 0x1b8;
export const SFX_FREE_WRAP_BIG_THRESHOLD = 0x1000;
export const SFX_FREE_WRAP_BIG_BIAS = 0x23;
export const SFX_FREE_WRAP_SLACK_MAX = 0x1f;
export const SFX_FREE_WRAP_ABORT_IAT_VA = 0x00b18894;

/** BYTE gate at TWO sites (0xa2bcde entry + 0xa2bd35 loop): 1 iff
    the node's [0xd] flag byte is 0 (`cmp byte [esi+0xd],0 ; jne
    tail`). The input is the byte the machine reads; wide values are
    masked & 0xff exactly like the machine's `cmp byte`. */
export function sfxListClearEntryGate(flagByte) {
  return (u32(flagByte) & 0xff) === 0 ? 1 : 0;
}

/** The v36 island law at body #4 (site 0xa2bcff): probe ptr
    (pair[4] == node+0x18) FULL dword != 0 && vtbl[0xc] result
    LOW-BYTE != 0 && hook global 0xc7f484 FULL dword != 0 ->
    hook(&node+0x14). Same shape/offsets as the v38 hook island
    (body #3) — consumed by reference via sfxInitWalkIslandHook. */
export function sfxListClearIslandHook(probePtr, probeAl, hook) {
  if (u32(probePtr) === 0 || (u32(probeAl) & 0xff) === 0 ||
      u32(hook) === 0) {
    return 0;
  }
  return 1;
}

/** Per-node plan. The recursion (this, arg1, node[8]) runs FIRST for
    every walked node; free(node, 0x1c) is UNCONDITIONAL — free_runs
    == walk_runs, NOT gated by the island. next_continue re-tests the
    SAME byte gate on node[0]+0xd (second site). */
export function sfxListClearPlan(flagByte, nextFlagByte, probePtr,
                                 probeAl, hook) {
  const entryGate = sfxListClearEntryGate(flagByte);
  const walkRuns = entryGate;
  const island = walkRuns !== 0
    ? sfxListClearIslandHook(probePtr, probeAl, hook) : 0;
  return {
    entryGate,
    walkRuns,
    recursionRuns: walkRuns,
    probePtrGate: walkRuns !== 0 && u32(probePtr) !== 0 ? 1 : 0,
    probeAlGate: walkRuns !== 0 && (u32(probeAl) & 0xff) !== 0 ? 1 : 0,
    hookGate: walkRuns !== 0 && u32(hook) !== 0 ? 1 : 0,
    islandHookRuns: island,
    freeRuns: walkRuns,
    freeSize: SFX_LIST_CLEAR_FREE_SIZE,
    nextContinue: walkRuns !== 0 && sfxListClearEntryGate(nextFlagByte)
      ? 1 : 0,
    stackArgs: SFX_LIST_CLEAR_STACK_ARGS,
    retImm: SFX_LIST_CLEAR_RET_IMM,
  };
}

/** 0x92e7d0: UNCONDITIONAL forward to the v4 host destroy-range
    0x92ea80 (ecx=begin, edx=end). There is no gate in the wrapper —
    the begin==end gate lives inside the host (0x92eaa6). */
export function sfxDestroyWrapperPlan(begin, end) {
  return {
    destroyRuns: 1,
    beginPassthrough: u32(begin),
    endPassthrough: u32(end),
    forwardTarget: SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80,
    stackArgs: SFX_DESTROY_WRAP_STACK_ARGS,
    retImm: SFX_DESTROY_WRAP_RET_IMM,
  };
}

/** imul [ebp+0xc],0x1b8: the free size is count * 0x1b8, 32-bit
    wrapped (the v4 entry stride). */
export function sfxFreeWrapperSize(count) {
  return Math.imul(u32(count), SFX_FREE_WRAP_STRIDE_1B8) >>> 0;
}

/** 0x92e7f0: the v4 sfxBlockFreePlan tail at its next body, fed the
    imul'd size. size < 0x1000 UNSIGNED (jb) -> free(begin, size), no
    slack check; else back = [begin-4] (ptrMinusBack input), size +=
    0x23, slack = (ptrMinusBack - 4) >>> 0 > 0x1f -> abort IAT
    0xb18894 (0x92e825), else free(back, size'). */
export function sfxFreeWrapperPlan(count, ptrMinusBack) {
  const size = sfxFreeWrapperSize(count);
  const block = sfxBlockFreePlan(size, ptrMinusBack);
  return {
    size,
    big: block.usesBackPointer ? 1 : 0,
    usesBackPointer: block.usesBackPointer ? 1 : 0,
    slackChecked: block.slackChecked ? 1 : 0,
    corruptFatal: block.corruptFatal ? 1 : 0,
    freeSize: block.freeSize,
    freeNeeded: 1,
    stackArgs: SFX_FREE_WRAP_STACK_ARGS,
    retImm: SFX_FREE_WRAP_RET_IMM,
  };
}

/* v39 census pins (lea-corrected tooling; notes sfx-v39-listclear). */
export function sfxListClearEndVa() { return SFX_LIST_CLEAR_END_VA_A2BD4C; }
export function sfxListClearNextVa() { return SFX_LIST_CLEAR_NEXT_VA_A2BD60; }
/* sfxListClearCallers (v37 census pin) covers the 5-caller count. */
export function sfxListClearCaller1Va() { return SFX_LIST_CLEAR_CALLER1_VA_A2AFB1; }
export function sfxListClearCaller2Va() { return SFX_LIST_CLEAR_CALLER2_VA_A2B01B; }
export function sfxListClearSelfSite() { return SFX_LIST_CLEAR_SELF_SITE_A2BCEC; }
export function sfxListClearCaller4Va() { return SFX_LIST_CLEAR_CALLER4_VA_A7D599; }
export function sfxListClearCaller5Va() { return SFX_LIST_CLEAR_CALLER5_VA_A9E61E; }
export function sfxListClearImm32Refs() { return SFX_LIST_CLEAR_IMM32_REFS; }
export function sfxListClearBodyInsns() { return SFX_LIST_CLEAR_BODY_INSNS; }
export function sfxListClearSehHandlerVa() { return SFX_LIST_CLEAR_SEH_HANDLER_VA; }
export function sfxListClearStackArgs() { return SFX_LIST_CLEAR_STACK_ARGS; }
export function sfxListClearRetImm() { return SFX_LIST_CLEAR_RET_IMM; }
export function sfxListClearNodeNextOff() { return SFX_LIST_CLEAR_NODE_NEXT_OFF; }
export function sfxListClearNodeChildOff() { return SFX_LIST_CLEAR_NODE_CHILD_OFF; }
export function sfxListClearNodeFlagByteOff() { return SFX_LIST_CLEAR_NODE_FLAG_BYTE_OFF; }
export function sfxListClearPairOff() { return SFX_LIST_CLEAR_PAIR_OFF; }
export function sfxListClearProbeOff() { return SFX_LIST_CLEAR_PROBE_OFF; }
export function sfxListClearEntryGateSites() { return SFX_LIST_CLEAR_ENTRY_GATE_SITES; }
export function sfxListClearEntryGateSite1() { return SFX_LIST_CLEAR_ENTRY_GATE_SITE_1; }
export function sfxListClearEntryGateSite2() { return SFX_LIST_CLEAR_ENTRY_GATE_SITE_2; }
export function sfxListClearRecursionSite() { return SFX_LIST_CLEAR_RECURSION_SITE; }
export function sfxListClearIslandSite() { return SFX_LIST_CLEAR_ISLAND_SITE; }
export function sfxListClearHookReadSite() { return SFX_LIST_CLEAR_HOOK_READ_SITE; }
export function sfxListClearFreeSize() { return SFX_LIST_CLEAR_FREE_SIZE; }
export function sfxListClearFreeSite() { return SFX_LIST_CLEAR_FREE_SITE; }
export function sfxListClearLoopSite() { return SFX_LIST_CLEAR_LOOP_SITE; }
export function sfxDestroyWrapEndVa() { return SFX_DESTROY_WRAP_END_VA_92E7E3; }
export function sfxDestroyWrapNextVa() { return SFX_DESTROY_WRAP_NEXT_VA_92E7F0; }
export function sfxDestroyWrapCallers() { return SFX_DESTROY_WRAP_CALLERS; }
export function sfxDestroyWrapCaller1Va() { return SFX_DESTROY_WRAP_CALLER1_VA_92EA54; }
export function sfxDestroyWrapCaller2Va() { return SFX_DESTROY_WRAP_CALLER2_VA_92EF4F; }
export function sfxDestroyWrapImm32Refs() { return SFX_DESTROY_WRAP_IMM32_REFS; }
export function sfxDestroyWrapBodyInsns() { return SFX_DESTROY_WRAP_BODY_INSNS; }
export function sfxDestroyWrapForwardTarget() { return SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80; }
export function sfxDestroyWrapStackArgs() { return SFX_DESTROY_WRAP_STACK_ARGS; }
export function sfxDestroyWrapRetImm() { return SFX_DESTROY_WRAP_RET_IMM; }
export function sfxDestroyRangeCallers() { return SFX_DESTROY_RANGE_CALLERS; }
export function sfxFreeWrapEndVa() { return SFX_FREE_WRAP_END_VA_92E822; }
export function sfxFreeWrapAbortSite() { return SFX_FREE_WRAP_ABORT_SITE_92E825; }
export function sfxFreeWrapNextVa() { return SFX_FREE_WRAP_NEXT_VA_92E830; }
export function sfxFreeWrapCallers() { return SFX_FREE_WRAP_CALLERS; }
export function sfxFreeWrapCaller1Va() { return SFX_FREE_WRAP_CALLER1_VA_92EA5F; }
export function sfxFreeWrapCaller2Va() { return SFX_FREE_WRAP_CALLER2_VA_92EF5A; }
export function sfxFreeWrapImm32Refs() { return SFX_FREE_WRAP_IMM32_REFS; }
export function sfxFreeWrapBodyInsns() { return SFX_FREE_WRAP_BODY_INSNS; }
export function sfxFreeWrapStackArgs() { return SFX_FREE_WRAP_STACK_ARGS; }
export function sfxFreeWrapRetImm() { return SFX_FREE_WRAP_RET_IMM; }
export function sfxFreeWrapStride() { return SFX_FREE_WRAP_STRIDE_1B8; }
export function sfxFreeWrapBigThreshold() { return SFX_FREE_WRAP_BIG_THRESHOLD; }
export function sfxFreeWrapBigBias() { return SFX_FREE_WRAP_BIG_BIAS; }
export function sfxFreeWrapSlackMax() { return SFX_FREE_WRAP_SLACK_MAX; }
export function sfxFreeWrapAbortIatVa() { return SFX_FREE_WRAP_ABORT_IAT_VA; }

/* ---------- v40: 0xa2bd60 copy-pair helper (+ its 0xa2bd90 insert
   body) and the 0x92e900 vector grow body's decision seams (wave-33
   F4; notes sfx-v40-pairgrow; fresh dumps cpu-dump/00a2bd60.txt,
   00a2bd90.txt, 0092e900.txt) ----------
   Oracular transcription from the full-body listings (NOT derived
   from the cpp). Copy-pair wrapper 0xa2bd60..0xa2bd81 (13 insns,
   ret 8, NO branches): unconditional call 0xa2bd71 ->
   0xa2bd90(out, src) with thiscall this passed through, then the
   out-pair FIRST dword -> *dst (0xa2bd7c). Insert body
   0xa2bd90..0xa2bf51 (152 insns, SEH 0xb1227d): alloc 0x1c node
   (0xa0f4c0), src[0] -> node[0x10] (key dword), 8-byte pair
   {src[4], src[8]} -> node[0x14] via 0x8f2d20 (the v36 adopt-pair
   law; its island at 0x8f2d60 consumed by reference — none of the
   three bodies reads 0xc7f484 directly), links [0]/[4]/[8] := head
   + word [0xc] := 0, then: WALK from head[4], BYTE [x+0xd] gate
   (0xa2be16/0xa2be35, masked & 0xff) else UNSIGNED jae key
   compare (0xa2be25): new_key >= node_key -> right ([x+8]) else
   left ([x]); COUNT this[4] == 0x9249249 (0xa2be3e, EQUALITY) ->
   throw 0x4170d0, else this[4]++; LINK [node+4] := parent always,
   parent == head -> head arm ([head]=[head+4]=[head+8]=node, byte
   [node+0xc] := 1, no fixup), else the sbb/neg side bit
   (0xa2be31, carried): new_key < parent_key -> left ([parent] :=
   node + head[0] update) else right ([parent+8] := node + head[8]
   update); FIXUP while BYTE [parent+0xc] == 0 (0xa2be83 entry,
   0xa2bf23 retest): uncle color BYTE == 0 -> recolor arm (0xa2beda:
   parent := 1, uncle := 1, grandparent := 0, node := grandparent);
   else rotate arm (node on the parent's inner side -> pre-rotate
   0x415fe0/0x415f80 with node := parent — host; parent := 1,
   grandparent := 0, rotate — host); OUT (0xa2bf37/0xa2bf3c):
   [out] := node, byte [out+4] := 1. Grow body 0x92e900..0x92ea4b
   (117 insns, ret 8) + SEH cleanup arm 0x92ea4e..0x92ea6b
   (9 insns, SEH 0xb0ac10): the v24 laws consumed by reference at
   their sites (vec_count_max 0x92e961, vec_cap_gate 0x92e990,
   vec_push_grow_new 0x92e9f6, vec_cap_overflow 0x92ea03,
   grow_alloc_fast on the 0x92e99c size); this unit: size_count/
   cur_count (sfxEntryCount), alloc_size = imul(new_cap, 0x1b8),
   spot = block + size_count*0x1b8, new_end = spot + 0x1b8, emplace
   0x92e830 (host), G 0x92e9e7 arm gate (== -> ONE 0x92ec30 move
   call; extended -> TWO 0x92ed30 calls), relink 0x92eba0 (host),
   SEH cleanup = the v39 wrapper edges by reference (0x92ea54 ->
   destroy wrapper, 0x92ea5f -> free wrapper, 0x92ea68 -> unwind)
   with the constructed-so-far boundary: stage 1 (emplace threw) ->
   new_end; stage 2 (first move threw) -> spot; stage 3 (later) ->
   block (extended arm) / spot (== arm). All byte gates uint32_t &
   0xff. */

export const SFX_COPY_PAIR_VA_A2BD60 = 0x00a2bd60;
export const SFX_COPY_PAIR_END_VA_A2BD81 = 0x00a2bd81;
export const SFX_COPY_PAIR_NEXT_VA_A2BD90 = 0x00a2bd90;
export const SFX_COPY_PAIR_CALLERS = 1;
export const SFX_COPY_PAIR_CALLER1_VA_A2B6A4 = 0x00a2b6a4;
export const SFX_COPY_PAIR_IMM32_REFS = 1;
export const SFX_COPY_PAIR_BODY_INSNS = 13;
export const SFX_COPY_PAIR_STACK_ARGS = 2;
export const SFX_COPY_PAIR_RET_IMM = 8;
export const SFX_COPY_PAIR_FORWARD_VA_A2BD90 = 0x00a2bd90;
export const SFX_COPY_PAIR_CALL_SITE = 0x00a2bd71;
export const SFX_COPY_PAIR_OUT_COPY_SITE = 0x00a2bd7c;
export const SFX_COPY_PAIR_OUT_FLAG_OFF = 4;
export const SFX_INSERT_VA_A2BD90 = 0x00a2bd90;
export const SFX_INSERT_END_VA_A2BF51 = 0x00a2bf51;
export const SFX_INSERT_NEXT_VA_A2BF60 = 0x00a2bf60;
export const SFX_INSERT_CALLERS = 1;
export const SFX_INSERT_CALLER1_VA_A2BD71 = 0x00a2bd71;
export const SFX_INSERT_IMM32_REFS = 1;
export const SFX_INSERT_BODY_INSNS = 152;
export const SFX_INSERT_SEH_HANDLER_VA = 0x00b1227d;
export const SFX_INSERT_STACK_ARGS = 2;
export const SFX_INSERT_RET_IMM = 8;
export const SFX_INSERT_NODE_SIZE = 0x1c;
export const SFX_INSERT_NODE_LEFT_OFF = 0;
export const SFX_INSERT_NODE_PARENT_OFF = 4;
export const SFX_INSERT_NODE_RIGHT_OFF = 8;
export const SFX_INSERT_NODE_COLOR_BYTE_OFF = 0x0c;
export const SFX_INSERT_NODE_FLAG_BYTE_OFF = 0x0d;
export const SFX_INSERT_NODE_KEY_DWORD_OFF = 0x10;
export const SFX_INSERT_NODE_PAIR_OFF = 0x14;
export const SFX_INSERT_TREE_HEAD_OFF = 0;
export const SFX_INSERT_TREE_COUNT_OFF = 4;
export const SFX_INSERT_WALK_START_OFF = 4;
export const SFX_INSERT_COUNT_SENTINEL = 0x09249249;
export const SFX_INSERT_WALK_GATE_SITE = 0x00a2be16;
export const SFX_INSERT_WALK_LOOP_SITE = 0x00a2be20;
export const SFX_INSERT_WALK_CMP_SITE = 0x00a2be25;
export const SFX_INSERT_WALK_RETEST_SITE = 0x00a2be35;
export const SFX_INSERT_COUNT_CMP_SITE = 0x00a2be3e;
export const SFX_INSERT_COUNT_INC_SITE = 0x00a2be4a;
export const SFX_INSERT_SIDE_DETECT_SITE = 0x00a2be31;
export const SFX_INSERT_HEAD_ARM_SITE = 0x00a2be54;
export const SFX_INSERT_HEAD_COLOR_STORE = 0x00a2be5c;
export const SFX_INSERT_LINK_RIGHT_SITE = 0x00a2be69;
export const SFX_INSERT_LINK_LEFT_SITE = 0x00a2be76;
export const SFX_INSERT_FIXUP_ENTRY_SITE = 0x00a2be83;
export const SFX_INSERT_FIXUP_LOOP_SITE = 0x00a2be90;
export const SFX_INSERT_RECOLOR_SITE = 0x00a2beda;
export const SFX_INSERT_FIXUP_RETEST_SITE = 0x00a2bf23;
export const SFX_INSERT_OUT_STORE_SITE = 0x00a2bf37;
export const SFX_INSERT_OUT_FLAG_SITE = 0x00a2bf3c;
export const SFX_INSERT_THROW_SITE = 0x00a2bf54;
export const SFX_INSERT_ALLOC_SITE = 0x00a2bdcf;
export const SFX_INSERT_ADOPT_SITE = 0x00a2bdf2;
export const SFX_INSERT_ROTATE_SITES = 4;
export const SFX_INSERT_ROTATE_SITE_1 = 0x00a2beaf;
export const SFX_INSERT_ROTATE_SITE_2 = 0x00a2becd;
export const SFX_INSERT_ROTATE_SITE_3 = 0x00a2befd;
export const SFX_INSERT_ROTATE_SITE_4 = 0x00a2bf1b;
export const SFX_ADOPT_CALLEE_CENSUS = 10;
export const SFX_ROTATE_FE0_CENSUS = 105;
export const SFX_ROTATE_F80_CENSUS = 105;
export const SFX_COPY_PAIR_STEP_LEFT = 0;
export const SFX_COPY_PAIR_STEP_RIGHT = 1;
export const SFX_COPY_PAIR_STEP_SITE = 2;
export const SFX_GROW_VA_92E900 = 0x0092e900;
export const SFX_GROW_END_VA_92EA4B = 0x0092ea4b;
export const SFX_GROW_SEH_ARM_END = 0x0092ea6b;
export const SFX_GROW_NEXT_VA_92EA80 = 0x0092ea80;
export const SFX_GROW_CALLERS = 1;
export const SFX_GROW_CALLER1_VA_92D654 = 0x0092d654;
export const SFX_GROW_IMM32_REFS = 1;
export const SFX_GROW_BODY_INSNS = 117;
export const SFX_GROW_SEH_ARM_INSNS = 9;
export const SFX_GROW_SEH_HANDLER_VA = 0x00b0ac10;
export const SFX_GROW_STACK_ARGS = 2;
export const SFX_GROW_RET_IMM = 8;
export const SFX_GROW_GATE_SITE = 0x0092e9e7;
export const SFX_GROW_ARM_EQUAL_SITE = 0x0092e9eb;
export const SFX_GROW_ARM_EXTENDED_SITE = 0x0092ea0d;
export const SFX_GROW_EMPLACE_SITE = 0x0092e9d0;
export const SFX_GROW_MOVE1_SITE = 0x0092e9ef;
export const SFX_GROW_MOVE2_SITE = 0x0092ea11;
export const SFX_GROW_MOVE3_SITE = 0x0092ea24;
export const SFX_GROW_RELINK_SITE = 0x0092ea32;
export const SFX_GROW_ALLOC_SITE = 0x0092e9a2;
export const SFX_GROW_THROW_MAX_SITE = 0x0092ea6d;
export const SFX_GROW_THROW_OVER_SITE = 0x0092ea72;
export const SFX_GROW_DESTROY_WRAP_SITE = 0x0092ea54;
export const SFX_GROW_FREE_WRAP_SITE = 0x0092ea5f;
export const SFX_GROW_UNWIND_SITE = 0x0092ea68;
export const SFX_GROW_ARM_EQUAL_MOVE_CALLS = 1;
export const SFX_GROW_ARM_EXTENDED_MOVE_CALLS = 2;

/** The wrapper's CONSTANT contract: the call (0xa2bd71) and the
    out-dword copy (0xa2bd7c) are unconditional; only the pair's
    FIRST dword is copied (out_flag_off 4 = the body's flag byte,
    never copied). */
export function sfxCopyPairWrapperPlan() {
  return {
    callRuns: 1,
    outDwordCopyRuns: 1,
    outFlagOff: SFX_COPY_PAIR_OUT_FLAG_OFF,
    forwardTarget: SFX_COPY_PAIR_FORWARD_VA_A2BD90,
    stackArgs: SFX_COPY_PAIR_STACK_ARGS,
    retImm: SFX_COPY_PAIR_RET_IMM,
  };
}

/** One ordered-tree walk step: BYTE node_flag (& 0xff) != 0 ->
    SITE (the walk stops here); else UNSIGNED (jae, 0xa2be25):
    new_key >= node_key -> RIGHT ([node+8]), else LEFT ([node]). */
export function sfxCopyPairWalkStep(newKey, nodeKey, nodeFlag) {
  if ((u32(nodeFlag) & 0xff) !== 0) {
    return SFX_COPY_PAIR_STEP_SITE;
  }
  return u32(newKey) >= u32(nodeKey)
    ? SFX_COPY_PAIR_STEP_RIGHT : SFX_COPY_PAIR_STEP_LEFT;
}

/** 0xa2be3e: count == 0x9249249 (UNSIGNED EQUALITY; the first count
    whose 0x1c node span overflows 32 bits) -> the 0x4170d0 throw. */
export function sfxCopyPairCountFatal(count) {
  return u32(count) === SFX_INSERT_COUNT_SENTINEL ? 1 : 0;
}

/** The sbb/neg of the walk's last key compare (0xa2be31..0xa2be33,
    carried into 0xa2be65): 1 iff new_key < parent_key (LEFT),
    else 0 (RIGHT). */
export function sfxCopyPairSide(newKey, parentKey) {
  return u32(newKey) < u32(parentKey)
    ? SFX_COPY_PAIR_STEP_LEFT : SFX_COPY_PAIR_STEP_RIGHT;
}

/** Per-call insert plan. walk_steps / fixup_steps / rotation_calls
    are host chain tallies (inputs); every DECISION is derived from
    the given tree-state recaptures (parent_is_head_left/right
    update only when the parent is NOT the head — the machine's jne
    at 0xa2be50 already excluded the head arm). */
export function sfxCopyPairInsertPlan(count, headParentFlag, newKey,
                                      parentKey, parentIsHead,
                                      parentIsHeadLeft, parentIsHeadRight,
                                      parentColor, uncleColor, nodeIsInner,
                                      walkSteps, fixupSteps,
                                      rotationCalls) {
  const walkEntry = (u32(headParentFlag) & 0xff) === 0 ? 1 : 0;
  const fatal = sfxCopyPairCountFatal(count);
  const side = sfxCopyPairSide(newKey, parentKey);
  const headArm = u32(parentIsHead) !== 0 ? 1 : 0;
  const headLeft = u32(parentIsHeadLeft) !== 0 && headArm === 0 ? 1 : 0;
  const headRight = u32(parentIsHeadRight) !== 0 && headArm === 0 ? 1 : 0;
  const fixupEntry = (u32(parentColor) & 0xff) === 0 ? 1 : 0;
  const fixupRecolor = (u32(uncleColor) & 0xff) === 0 ? 1 : 0;
  return {
    allocCallRuns: 1,
    nodeSize: SFX_INSERT_NODE_SIZE,
    keyDwordOff: SFX_INSERT_NODE_KEY_DWORD_OFF,
    pairOff: SFX_INSERT_NODE_PAIR_OFF,
    pairCopyRuns: 1,
    walkEntry,
    walkSteps: u32(walkSteps),
    countFatal: fatal,
    countIncStore: fatal === 0 ? 1 : 0,
    parentLinkStore: 1,
    side,
    headArm,
    headLeftmostUpdate: headLeft,
    headRightmostUpdate: headRight,
    fixupEntry,
    fixupSteps: u32(fixupSteps),
    fixupRecolor,
    fixupRotate: fixupRecolor === 0 ? 1 : 0,
    preRotateLeft: u32(nodeIsInner) !== 0 ? 1 : 0,
    rotationCalls: u32(rotationCalls),
    outStoreRuns: 1,
    throwRuns: fatal,
    stackArgs: SFX_INSERT_STACK_ARGS,
    retImm: SFX_INSERT_RET_IMM,
  };
}

/** G 0x92e9e7 (FULL dword cmp): 1 iff arg1 (new_end) != end — the
    extended arm (TWO 0x92ed30 move calls); 0 = the == arm (ONE
    0x92ec30 call). */
export function sfxGrowExtended(newEnd, oldEnd) {
  return u32(newEnd) !== u32(oldEnd) ? 1 : 0;
}

/** 0x92e99c `imul ecx, edi, 0x1b8`: the 0x40cf00 size input,
    32-bit wrap. */
export function sfxGrowAllocSize(newCap) {
  return Math.imul(u32(newCap), SFX_FREE_WRAP_STRIDE_1B8) >>> 0;
}

/** 0x92e9b3 `imul eax, [ebp-0x1c], 0x1b8`: the emplace spot offset
    from the new block, 32-bit wrap. */
export function sfxGrowSpotOffset(sizeCount) {
  return Math.imul(u32(sizeCount), SFX_FREE_WRAP_STRIDE_1B8) >>> 0;
}

/** The 0x92e900 SEH cleanup arm with the v39 wrapper edges by
    reference. fail_stage: 0 = no exception; 1 = emplace threw
    (destroy begin == new_end, an empty range); 2 = a move call
    threw (begin == spot); 3 = later (second move / relink threw;
    begin == block on the extended arm, spot on the == arm). The
    free-wrapper call (count = new_cap, begin = block) and the
    unwind run on every failure stage. */
export function sfxGrowCleanupPlan(failStage, extended, block, spot,
                                   newEnd, newCap) {
  const cleanup = u32(failStage) !== 0 ? 1 : 0;
  let destroyBegin = 0;
  if (cleanup !== 0) {
    if (u32(failStage) === 1) {
      destroyBegin = u32(newEnd);
    } else if (u32(failStage) === 2) {
      destroyBegin = u32(spot);
    } else {
      destroyBegin = u32(extended) !== 0 ? u32(block) : u32(spot);
    }
  }
  return {
    destroyWrapperRuns: cleanup,
    freeWrapperRuns: cleanup,
    unwindRuns: cleanup,
    cleanupDestroyBegin: destroyBegin >>> 0,
    cleanupDestroyEnd: u32(newEnd),
    cleanupFreeCount: u32(newCap),
    cleanupFreeBegin: u32(block),
  };
}

/** The full body plan; the v24 growth laws are consumed by
    reference (sfxVecCountMax / sfxVecCapGate / sfxVecPushGrowNew /
    sfxVecCapOverflow / sfxGrowAllocFast). fail_stage feeds the
    cleanup fields. */
export function sfxGrowPlan(newEnd, begin, oldEnd, cap, block,
                            failStage) {
  const sizeCount = sfxEntryCount(
    (u32(newEnd) - u32(begin)) | 0);
  const curCount = sfxEntryCount(
    (u32(oldEnd) - u32(begin)) | 0);
  const capCount = sfxEntryCount(
    (u32(cap) - u32(begin)) | 0);
  const countMaxFatal = sfxVecCountMax(u32(curCount));
  const capGate = sfxVecCapGate(u32(capCount));
  const newCap = capGate !== 0
    ? SFX_VEC_MAX_COUNT
    : sfxVecPushGrowNew(u32(capCount), u32(curCount));
  const newCapOverflow = sfxVecCapOverflow(newCap);
  const allocSize = sfxGrowAllocSize(newCap);
  const allocFast = sfxGrowAllocFast(allocSize);
  const spotOffset = sfxGrowSpotOffset(u32(sizeCount));
  const newEndOffset = (spotOffset + SFX_FREE_WRAP_STRIDE_1B8) >>> 0;
  const extended = sfxGrowExtended(newEnd, oldEnd);
  const spot = (u32(block) + spotOffset) >>> 0;
  const newEndAbs = (u32(block) + newEndOffset) >>> 0;
  const cleanup = sfxGrowCleanupPlan(failStage, extended, block, spot,
                                     newEndAbs, newCap);
  return {
    sizeCount: u32(sizeCount),
    curCount: u32(curCount),
    countMaxFatal,
    capGateMaxAlloc: capGate,
    newCap,
    newCapOverflow,
    allocSize,
    allocFast,
    spotOffset,
    newEndOffset,
    extended,
    moveCalls: extended !== 0
      ? SFX_GROW_ARM_EXTENDED_MOVE_CALLS : SFX_GROW_ARM_EQUAL_MOVE_CALLS,
    emplaceRuns: 1,
    relinkRuns: 1,
    ...cleanup,
  };
}

/* v40 census pins (lea-corrected tooling; notes sfx-v40-pairgrow). */
export function sfxCopyPairEndVa() { return SFX_COPY_PAIR_END_VA_A2BD81; }
export function sfxCopyPairNextVa() { return SFX_COPY_PAIR_NEXT_VA_A2BD90; }
export function sfxCopyPairCallers() { return SFX_COPY_PAIR_CALLERS; }
export function sfxCopyPairCaller1Va() { return SFX_COPY_PAIR_CALLER1_VA_A2B6A4; }
export function sfxCopyPairImm32Refs() { return SFX_COPY_PAIR_IMM32_REFS; }
export function sfxCopyPairBodyInsns() { return SFX_COPY_PAIR_BODY_INSNS; }
export function sfxCopyPairStackArgs() { return SFX_COPY_PAIR_STACK_ARGS; }
export function sfxCopyPairRetImm() { return SFX_COPY_PAIR_RET_IMM; }
export function sfxCopyPairForwardVa() { return SFX_COPY_PAIR_FORWARD_VA_A2BD90; }
export function sfxCopyPairCallSite() { return SFX_COPY_PAIR_CALL_SITE; }
export function sfxCopyPairOutCopySite() { return SFX_COPY_PAIR_OUT_COPY_SITE; }
export function sfxCopyPairOutFlagOff() { return SFX_COPY_PAIR_OUT_FLAG_OFF; }
export function sfxInsertEndVa() { return SFX_INSERT_END_VA_A2BF51; }
export function sfxInsertNextVa() { return SFX_INSERT_NEXT_VA_A2BF60; }
export function sfxInsertCallers() { return SFX_INSERT_CALLERS; }
export function sfxInsertCaller1Va() { return SFX_INSERT_CALLER1_VA_A2BD71; }
export function sfxInsertImm32Refs() { return SFX_INSERT_IMM32_REFS; }
export function sfxInsertBodyInsns() { return SFX_INSERT_BODY_INSNS; }
export function sfxInsertSehHandlerVa() { return SFX_INSERT_SEH_HANDLER_VA; }
export function sfxInsertStackArgs() { return SFX_INSERT_STACK_ARGS; }
export function sfxInsertRetImm() { return SFX_INSERT_RET_IMM; }
export function sfxInsertNodeSize() { return SFX_INSERT_NODE_SIZE; }
export function sfxInsertNodeLeftOff() { return SFX_INSERT_NODE_LEFT_OFF; }
export function sfxInsertNodeParentOff() { return SFX_INSERT_NODE_PARENT_OFF; }
export function sfxInsertNodeRightOff() { return SFX_INSERT_NODE_RIGHT_OFF; }
export function sfxInsertNodeColorByteOff() { return SFX_INSERT_NODE_COLOR_BYTE_OFF; }
export function sfxInsertNodeFlagByteOff() { return SFX_INSERT_NODE_FLAG_BYTE_OFF; }
export function sfxInsertNodeKeyDwordOff() { return SFX_INSERT_NODE_KEY_DWORD_OFF; }
export function sfxInsertNodePairOff() { return SFX_INSERT_NODE_PAIR_OFF; }
export function sfxInsertTreeHeadOff() { return SFX_INSERT_TREE_HEAD_OFF; }
export function sfxInsertTreeCountOff() { return SFX_INSERT_TREE_COUNT_OFF; }
export function sfxInsertWalkStartOff() { return SFX_INSERT_WALK_START_OFF; }
export function sfxInsertCountSentinel() { return SFX_INSERT_COUNT_SENTINEL; }
export function sfxInsertWalkGateSite() { return SFX_INSERT_WALK_GATE_SITE; }
export function sfxInsertWalkLoopSite() { return SFX_INSERT_WALK_LOOP_SITE; }
export function sfxInsertWalkCmpSite() { return SFX_INSERT_WALK_CMP_SITE; }
export function sfxInsertWalkRetestSite() { return SFX_INSERT_WALK_RETEST_SITE; }
export function sfxInsertCountCmpSite() { return SFX_INSERT_COUNT_CMP_SITE; }
export function sfxInsertCountIncSite() { return SFX_INSERT_COUNT_INC_SITE; }
export function sfxInsertSideDetectSite() { return SFX_INSERT_SIDE_DETECT_SITE; }
export function sfxInsertHeadArmSite() { return SFX_INSERT_HEAD_ARM_SITE; }
export function sfxInsertHeadColorStore() { return SFX_INSERT_HEAD_COLOR_STORE; }
export function sfxInsertLinkRightSite() { return SFX_INSERT_LINK_RIGHT_SITE; }
export function sfxInsertLinkLeftSite() { return SFX_INSERT_LINK_LEFT_SITE; }
export function sfxInsertFixupEntrySite() { return SFX_INSERT_FIXUP_ENTRY_SITE; }
export function sfxInsertFixupLoopSite() { return SFX_INSERT_FIXUP_LOOP_SITE; }
export function sfxInsertRecolorSite() { return SFX_INSERT_RECOLOR_SITE; }
export function sfxInsertFixupRetestSite() { return SFX_INSERT_FIXUP_RETEST_SITE; }
export function sfxInsertOutStoreSite() { return SFX_INSERT_OUT_STORE_SITE; }
export function sfxInsertOutFlagSite() { return SFX_INSERT_OUT_FLAG_SITE; }
export function sfxInsertThrowSite() { return SFX_INSERT_THROW_SITE; }
export function sfxInsertAllocSite() { return SFX_INSERT_ALLOC_SITE; }
export function sfxInsertAdoptSite() { return SFX_INSERT_ADOPT_SITE; }
export function sfxInsertRotateSites() { return SFX_INSERT_ROTATE_SITES; }
export function sfxInsertRotateSite1() { return SFX_INSERT_ROTATE_SITE_1; }
export function sfxInsertRotateSite2() { return SFX_INSERT_ROTATE_SITE_2; }
export function sfxInsertRotateSite3() { return SFX_INSERT_ROTATE_SITE_3; }
export function sfxInsertRotateSite4() { return SFX_INSERT_ROTATE_SITE_4; }
export function sfxAdoptCalleeCensus() { return SFX_ADOPT_CALLEE_CENSUS; }
export function sfxRotateFe0Census() { return SFX_ROTATE_FE0_CENSUS; }
export function sfxRotateF80Census() { return SFX_ROTATE_F80_CENSUS; }
export function sfxGrowEndVa() { return SFX_GROW_END_VA_92EA4B; }
export function sfxGrowSehArmEnd() { return SFX_GROW_SEH_ARM_END; }
export function sfxGrowNextVa() { return SFX_GROW_NEXT_VA_92EA80; }
export function sfxGrowCallers() { return SFX_GROW_CALLERS; }
export function sfxGrowCaller1Va() { return SFX_GROW_CALLER1_VA_92D654; }
export function sfxGrowImm32Refs() { return SFX_GROW_IMM32_REFS; }
export function sfxGrowBodyInsns() { return SFX_GROW_BODY_INSNS; }
export function sfxGrowSehArmInsns() { return SFX_GROW_SEH_ARM_INSNS; }
export function sfxGrowSehHandlerVa() { return SFX_GROW_SEH_HANDLER_VA; }
export function sfxGrowStackArgs() { return SFX_GROW_STACK_ARGS; }
export function sfxGrowRetImm() { return SFX_GROW_RET_IMM; }
export function sfxGrowGateSite() { return SFX_GROW_GATE_SITE; }
export function sfxGrowArmEqualSite() { return SFX_GROW_ARM_EQUAL_SITE; }
export function sfxGrowArmExtendedSite() { return SFX_GROW_ARM_EXTENDED_SITE; }
export function sfxGrowEmplaceSite() { return SFX_GROW_EMPLACE_SITE; }
export function sfxGrowMove1Site() { return SFX_GROW_MOVE1_SITE; }
export function sfxGrowMove2Site() { return SFX_GROW_MOVE2_SITE; }
export function sfxGrowMove3Site() { return SFX_GROW_MOVE3_SITE; }
export function sfxGrowRelinkSite() { return SFX_GROW_RELINK_SITE; }
export function sfxGrowAllocSite() { return SFX_GROW_ALLOC_SITE; }
export function sfxGrowThrowMaxSite() { return SFX_GROW_THROW_MAX_SITE; }
export function sfxGrowThrowOverSite() { return SFX_GROW_THROW_OVER_SITE; }
export function sfxGrowDestroyWrapSite() { return SFX_GROW_DESTROY_WRAP_SITE; }
export function sfxGrowFreeWrapSite() { return SFX_GROW_FREE_WRAP_SITE; }
export function sfxGrowUnwindSite() { return SFX_GROW_UNWIND_SITE; }
export function sfxGrowArmEqualMoveCalls() { return SFX_GROW_ARM_EQUAL_MOVE_CALLS; }
export function sfxGrowArmExtendedMoveCalls() { return SFX_GROW_ARM_EXTENDED_MOVE_CALLS; }

/* ---------- v41: 0xa2bf60 leaf/node destroy (notes
   sfx-v41-frontier) ---------- */

export const SFX_LEAF_DESTROY_VA_A2BF60 = 0x00a2bf60;
export const SFX_LEAF_DESTROY_END_VA_A2BFDA = 0x00a2bfda;
export const SFX_LEAF_DESTROY_NEXT_VA_A2BFE0 = 0x00a2bfe0;
export const SFX_LEAF_DESTROY_E8_CALLERS = 0;
export const SFX_LEAF_DESTROY_E9_COLD_VA_B12273 = 0x00b12273;
export const SFX_LEAF_DESTROY_IMM32_REFS = 0;
export const SFX_LEAF_DESTROY_BODY_INSNS = 48;
export const SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0 = 0x00af09f0;
export const SFX_LEAF_DESTROY_NODE_LOAD_SITE = 0x00a2bf86;
export const SFX_LEAF_DESTROY_PAIR_ADD_SITE = 0x00a2bf8d;
export const SFX_LEAF_DESTROY_OBJ_LOAD_SITE = 0x00a2bf97;
export const SFX_LEAF_DESTROY_PROBE_CALL_SITE = 0x00a2bfa3;
export const SFX_LEAF_DESTROY_HOOK_READ_SITE = 0x00a2bfa9;
export const SFX_LEAF_DESTROY_HOOK_CALL_SITE = 0x00a2bfb3;
export const SFX_LEAF_DESTROY_RELOAD_SITE = 0x00a2bfb8;
export const SFX_LEAF_DESTROY_FREE_SITE = 0x00a2bfc2;
export const SFX_LEAF_DESTROY_NODE_OFF_4 = 4;
export const SFX_LEAF_DESTROY_PAIR_OFF_14 = 0x14;
export const SFX_LEAF_DESTROY_OBJ_OFF_4 = 4;
export const SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C = 0x0c;
export const SFX_LEAF_DESTROY_FREE_SIZE_1C = 0x1c;
export const SFX_LEAF_DESTROY_FREE_CALLEE_AEF15C = 0x00aef15c;
export const SFX_LEAF_DESTROY_INDIRECT_CALLS = 2;
export const SFX_LEAF_DESTROY_HOOK_REFS_INBODY = 1;

/** The whole-body decision/tally layer of 0xa2bf60. node /
    pairObj / probeBit / hookPresent are recaptures (the vtable
    probe and the hook call are HOST edges; their results are
    inputs). G3 0xa2bfa7 consumes the probe bit LOW BYTE only. */
export function sfxLeafDestroyPlan(node, pairObj, probeBit, hookPresent) {
  const nodeLive = u32(node) !== 0 ? 1 : 0;
  const probeRuns = nodeLive !== 0 && u32(pairObj) !== 0 ? 1 : 0;
  const hookRuns = probeRuns !== 0 && (u32(probeBit) & 0xff) !== 0 &&
                   u32(hookPresent) !== 0 ? 1 : 0;
  return {
    nodeLoaded: nodeLive,
    pairOffset: SFX_LEAF_DESTROY_PAIR_OFF_14,
    probeCallRuns: probeRuns,
    probeVtblSlot: SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C,
    hookCallRuns: hookRuns,
    hookArg: hookRuns !== 0 ? (u32(node) + SFX_LEAF_DESTROY_PAIR_OFF_14) >>> 0 : 0,
    reloadRuns: 1,
    freeRuns: nodeLive,
    freeSize: SFX_LEAF_DESTROY_FREE_SIZE_1C,
    sehHandlerVa: SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0,
    stackArgs: 0,
    retImm: 0,
  };
}

/* v41 census pins (lea-corrected tooling; notes sfx-v41-frontier). */
export function sfxLeafDestroyEndVa() { return SFX_LEAF_DESTROY_END_VA_A2BFDA; }
export function sfxLeafDestroyNextVa() { return SFX_LEAF_DESTROY_NEXT_VA_A2BFE0; }
export function sfxLeafDestroyE8Callers() { return SFX_LEAF_DESTROY_E8_CALLERS; }
export function sfxLeafDestroyE9ColdVa() { return SFX_LEAF_DESTROY_E9_COLD_VA_B12273; }
export function sfxLeafDestroyImm32Refs() { return SFX_LEAF_DESTROY_IMM32_REFS; }
export function sfxLeafDestroyBodyInsns() { return SFX_LEAF_DESTROY_BODY_INSNS; }
export function sfxLeafDestroySehHandlerVa() { return SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0; }
export function sfxLeafDestroyNodeLoadSite() { return SFX_LEAF_DESTROY_NODE_LOAD_SITE; }
export function sfxLeafDestroyPairAddSite() { return SFX_LEAF_DESTROY_PAIR_ADD_SITE; }
export function sfxLeafDestroyObjLoadSite() { return SFX_LEAF_DESTROY_OBJ_LOAD_SITE; }
export function sfxLeafDestroyProbeCallSite() { return SFX_LEAF_DESTROY_PROBE_CALL_SITE; }
export function sfxLeafDestroyHookReadSite() { return SFX_LEAF_DESTROY_HOOK_READ_SITE; }
export function sfxLeafDestroyHookCallSite() { return SFX_LEAF_DESTROY_HOOK_CALL_SITE; }
export function sfxLeafDestroyReloadSite() { return SFX_LEAF_DESTROY_RELOAD_SITE; }
export function sfxLeafDestroyFreeSite() { return SFX_LEAF_DESTROY_FREE_SITE; }
export function sfxLeafDestroyNodeOff() { return SFX_LEAF_DESTROY_NODE_OFF_4; }
export function sfxLeafDestroyPairOff() { return SFX_LEAF_DESTROY_PAIR_OFF_14; }
export function sfxLeafDestroyObjOff() { return SFX_LEAF_DESTROY_OBJ_OFF_4; }
export function sfxLeafDestroyProbeVtblSlot() { return SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C; }
export function sfxLeafDestroyFreeSize() { return SFX_LEAF_DESTROY_FREE_SIZE_1C; }
export function sfxLeafDestroyFreeCalleeVa() { return SFX_LEAF_DESTROY_FREE_CALLEE_AEF15C; }