/** Independent JS oracle for the ANM2 animation-system pure helpers.
 *  Do not derive mechanically from native/decomp/anm2_pure_helpers.cpp.
…
 */

export const ANM2_PURE_ABI_VERSION = 77;

/* Sizes and strides. */
export const ANM2_SIZE = 0x114;
export const ANM2_ANIM_STATE_SIZE = 0x20;
export const ANM2_LAYER_STATE_STRIDE = 0xa0;
export const ANM2_ANIM_DATA_STRIDE = 0x13c;
export const ANM2_ARRAY_HEADER_BIAS = 4;
export const ANM2_SSO_CAPACITY_THRESHOLD = 0x10;

/* Field offsets. */
export const ANM2_OFF_FILENAME_STR_00 = 0x00;
export const ANM2_OFF_FILENAME_SIZE_10 = 0x10;
export const ANM2_OFF_FILENAME_CAP_14 = 0x14;
export const ANM2_OFF_ANIM_NAME_STR_18 = 0x18;
export const ANM2_OFF_ANIM_NAME_SIZE_28 = 0x28;
export const ANM2_OFF_ANIM_NAME_CAP_2C = 0x2c;
export const ANM2_OFF_ANIM_STATE_30 = 0x30;
export const ANM2_OFF_OVERLAY_STATE_50 = 0x50;
export const ANM2_OFF_OVERLAY_FIRST_70 = 0x70;
export const ANM2_OFF_ANIM_DATA_74 = 0x74;
export const ANM2_OFF_ANIM_COUNT_78 = 0x78;
export const ANM2_OFF_LAYER_STATE_7C = 0x7c;
export const ANM2_OFF_LAYER_COUNT_80 = 0x80;
export const ANM2_OFF_OFFSET_94 = 0x94;
export const ANM2_OFF_SCALE_9C = 0x9c;
export const ANM2_OFF_ROTATION_A4 = 0xa4;
export const ANM2_OFF_COLOR_A8 = 0xa8;
export const ANM2_OFF_CHAMPION_COLOR_D4 = 0xd4;
export const ANM2_OFF_FLIP_PAIR_100 = 0x100;
export const ANM2_OFF_PLAYBACK_SPEED_104 = 0x104;
export const ANM2_OFF_LOADED_PAIR_108 = 0x108;
export const ANM2_OFF_UNNAMED_10C = 0x10c;
export const ANM2_OFF_BITFLAGS_110 = 0x110;
export const ANM2_LAYER_DATA_PTR_OFF = 0x00;
export const ANM2_LAYER_DATA_NAME_OFF = 0x08;

/* Immediates. */
export const ANM2_F32_ONE_BITS = 0x3f800000;
export const ANM2_RESET_UNNAMED_10C_VALUE = 0xffffffff;

/* Runtime float sources (writable .data). */
export const ANM2_OFFSET_X_SRC_VA = 0x00c7b640;
export const ANM2_OFFSET_Y_SRC_VA = 0x00c7b644;
export const ANM2_SCALE_X_SRC_VA = 0x00c3793c;
export const ANM2_SCALE_Y_SRC_VA = 0x00c37940;
export const ANM2_OFFSET_X_LOAD_DEFAULT_BITS = 0x00000000;
export const ANM2_OFFSET_Y_LOAD_DEFAULT_BITS = 0x00000000;
export const ANM2_SCALE_X_LOAD_DEFAULT_BITS = 0x3f800000;
export const ANM2_SCALE_Y_LOAD_DEFAULT_BITS = 0x3f800000;

/* Host VAs. */
export const ANM2_HOST_VA_RESET_NAME_PROLOGUE = 0x0040e2b0;
export const ANM2_HOST_VA_ANIM_STATE_APPLY = 0x00408830;
export const ANM2_HOST_VA_ANIM_STATE_APPLY_ALT = 0x00408970;
export const ANM2_HOST_VA_LAYER_ELEM_DTOR = 0x00407a60;
export const ANM2_HOST_VA_EHVEC_DTOR_ITER = 0x00aef638;
export const ANM2_HOST_VA_OPERATOR_DELETE = 0x00aef15c;
export const ANM2_HOST_VA_LOG = 0x00a112c0;
export const ANM2_HOST_VA_FRAME_ADVANCE = 0x00408e00;
export const ANM2_SEH_FRAME_RESET_VA = 0x00af0a30;
export const ANM2_SECURITY_COOKIE_VA = 0x00bf93b4;
export const ANM2_GET_LAYER_STATIC_VA = 0x00c7f630;
export const ANM2_GET_LAYER_GUARD_VA = 0x00c7f628;

/* Logger immediates. */
export const ANM2_GET_LAYER_LOG_LEVEL = 0x10;
export const ANM2_GET_LAYER_LOG_STR_VA = 0x00b1a68c;
export const ANM2_ANIM_MISS_LOG_LEVEL = 1;
export const ANM2_ANIM_MISS_LOG_STR_VA = 0x00b1a614;
export const ANM2_EMPTY_LITERAL_VA = 0x00b1a4ec;

function u32(v) {
  return v >>> 0;
}

function i32(v) {
  return v | 0;
}

/* ---------- little-endian memory helpers over a Uint8Array ---------- */

function readU32(mem, addr) {
  addr = u32(addr);
  return (mem[addr] | (mem[addr + 1] << 8) | (mem[addr + 2] << 16) | (mem[addr + 3] << 24)) >>> 0;
}

function writeBytes(mem, addr, value, width) {
  addr = u32(addr);
  let v = u32(value);
  for (let i = 0; i < width; i++) {
    mem[u32(addr + i)] = v & 0xff;
    v >>>= 8;
  }
}

/* ---------- shared std::string / strcmp primitives ---------- */

/** Length-bounded byte equality over `n` bytes (v38 0x40cae0 semantics:
 * sizes must match AND bytes must match; short-circuit on size first). */
export function bytesEqual(mem, aAddr, bAddr, n) {
  aAddr = u32(aAddr);
  bAddr = u32(bAddr);
  const len = u32(n);
  for (let i = 0; i < len; i++) {
    if ((mem[u32(aAddr + i)] & 0xff) !== (mem[u32(bAddr + i)] & 0xff)) return false;
  }
  return true;
}

/**
 * A short string keeps its characters inside the object; once the reserved
 * capacity reaches sixteen the object holds a pointer instead. The boundary
 * value itself is already a pointer, and the comparison never sees a sign.
 */
export function anm2SsoUsesHeap(capacity) {
  return u32(capacity) >= ANM2_SSO_CAPACITY_THRESHOLD;
}

export function anm2SsoDataPtr(strBase, capacity, heapPtr) {
  return anm2SsoUsesHeap(capacity) ? u32(heapPtr) : u32(strBase);
}

/** Address of the characters of the std::string object living at `strAddr`. */
export function anm2SsoDataAddr(mem, strAddr) {
  strAddr = u32(strAddr);
  const cap = readU32(mem, strAddr + ANM2_OFF_FILENAME_CAP_14);
  return anm2SsoUsesHeap(cap) ? readU32(mem, strAddr) : strAddr;
}

/**
 * Character comparison over NUL-terminated bytes. Characters are ordered by
 * their unsigned value, and the answer is squashed to a sign rather than a
 * difference.
 */
export function anm2StrcmpMem(mem, aAddr, bAddr) {
  aAddr = u32(aAddr);
  bAddr = u32(bAddr);
  for (;;) {
    const d0 = mem[aAddr] & 0xff;
    const e0 = mem[bAddr] & 0xff;
    if (d0 !== e0) return d0 < e0 ? -1 : 1;
    if (d0 === 0) return 0;
    const d1 = mem[u32(aAddr + 1)] & 0xff;
    const e1 = mem[u32(bAddr + 1)] & 0xff;
    if (d1 !== e1) return d1 < e1 ? -1 : 1;
    aAddr = u32(aAddr + 2);
    bAddr = u32(bAddr + 2);
    if (d1 === 0) return 0;
  }
}

/** Convenience: compare a NUL-terminated region against a JS string. */
export function anm2StrcmpBytes(aBytes, bBytes) {
  let i = 0;
  for (;;) {
    const d0 = (aBytes[i] ?? 0) & 0xff;
    const e0 = (bBytes[i] ?? 0) & 0xff;
    if (d0 !== e0) return d0 < e0 ? -1 : 1;
    if (d0 === 0) return 0;
    const d1 = (aBytes[i + 1] ?? 0) & 0xff;
    const e1 = (bBytes[i + 1] ?? 0) & 0xff;
    if (d1 !== e1) return d1 < e1 ? -1 : 1;
    i += 2;
    if (d1 === 0) return 0;
  }
}

/* ---------- AR: ANM2::Reset (0x00407f10) ---------- */

/** The prologue helper runs whenever the filename string is not empty. */
export function anm2ResetNameHostNeeded(filenameSize10) {
  return i32(filenameSize10) !== 0;
}

export function anm2ResetTeardownNeeded(layerState7c) {
  return u32(layerState7c) !== 0;
}

/** MSVC stores the element count of a `new[]` block one dword below the base. */
export function anm2ResetArrayHeader(layerState7c) {
  return u32(u32(layerState7c) - ANM2_ARRAY_HEADER_BIAS);
}

/** Bytes released: the elements plus the count cookie, wrapping at 32 bits. */
export function anm2ResetFreeSize(headerCount) {
  return u32(Math.imul(u32(headerCount), ANM2_LAYER_STATE_STRIDE) + ANM2_ARRAY_HEADER_BIAS);
}

/**
 * @param {object} opts
…
 */
export function anm2ResetTeardownPlan({
  layerState7c = 0,
  countBefore = 0,
  countAfter = 0,
} = {}) {
  const needed = anm2ResetTeardownNeeded(layerState7c);
  if (!needed) {
    return {
      teardownNeeded: false, headerPtr: 0, dtorArrayPtr: 0,
      dtorElemSize: ANM2_LAYER_STATE_STRIDE, dtorCount: 0,
      dtorElemVa: ANM2_HOST_VA_LAYER_ELEM_DTOR, ehvecVa: ANM2_HOST_VA_EHVEC_DTOR_ITER,
      freeCount: 0, freeSize: 0, operatorDeleteVa: ANM2_HOST_VA_OPERATOR_DELETE,
    };
  }
  return {
    teardownNeeded: true, headerPtr: anm2ResetArrayHeader(layerState7c),
    dtorArrayPtr: u32(layerState7c), dtorElemSize: ANM2_LAYER_STATE_STRIDE,
    dtorCount: u32(countBefore), dtorElemVa: ANM2_HOST_VA_LAYER_ELEM_DTOR,
    ehvecVa: ANM2_HOST_VA_EHVEC_DTOR_ITER, freeCount: u32(countAfter),
    freeSize: anm2ResetFreeSize(countAfter), operatorDeleteVa: ANM2_HOST_VA_OPERATOR_DELETE,
  };
}

/**
 * @param {object} opts
…
 */
export function anm2ResetPlan({
  filenameSize10 = 0, layerState7c = 0, countBefore = 0, countAfter = 0,
} = {}) {
  const nameHost = anm2ResetNameHostNeeded(filenameSize10);
  const teardown = anm2ResetTeardownNeeded(layerState7c);
  return {
    nameHostNeeded: nameHost, nameHostVa: ANM2_HOST_VA_RESET_NAME_PROLOGUE,
    animStateCalls: 2, animStateVa: ANM2_HOST_VA_ANIM_STATE_APPLY,
    animStateRecv0: ANM2_OFF_ANIM_STATE_30, animStateRecv1: ANM2_OFF_OVERLAY_STATE_50,
    teardownNeeded: teardown, freeSize: teardown ? anm2ResetFreeSize(countAfter) : 0,
    hostCallCount: (nameHost ? 1 : 0) + 2 + (teardown ? 2 : 0), pureComplete: false,
  };
}

/**
 * Every scalar slot Reset rewrites, as (offset, byte width, value). Derived by
…
 */
export function anm2ResetFieldWrites({
  offsetXBits = ANM2_OFFSET_X_LOAD_DEFAULT_BITS,
  offsetYBits = ANM2_OFFSET_Y_LOAD_DEFAULT_BITS,
  scaleXBits = ANM2_SCALE_X_LOAD_DEFAULT_BITS,
  scaleYBits = ANM2_SCALE_Y_LOAD_DEFAULT_BITS,
} = {}) {
  const one = ANM2_F32_ONE_BITS;
  const w = (offset, width, value) => ({ offset, width, value: u32(value) });
  return [
    w(ANM2_OFF_FILENAME_SIZE_10, 4, 0), w(ANM2_OFF_ANIM_NAME_SIZE_28, 4, 0),
    w(ANM2_OFF_ANIM_DATA_74, 4, 0), w(ANM2_OFF_ANIM_COUNT_78, 4, 0),
    w(ANM2_OFF_LAYER_STATE_7C, 4, 0), w(ANM2_OFF_LAYER_COUNT_80, 4, 0),
    w(0x84, 4, 0), w(0x88, 4, 0), w(0x8c, 4, 0), w(0x90, 4, 0),
    w(ANM2_OFF_OFFSET_94, 4, offsetXBits), w(ANM2_OFF_OFFSET_94 + 4, 4, offsetYBits),
    w(ANM2_OFF_SCALE_9C, 4, scaleXBits), w(ANM2_OFF_SCALE_9C + 4, 4, scaleYBits),
    w(ANM2_OFF_ROTATION_A4, 4, 0),
    w(ANM2_OFF_COLOR_A8, 4, one), w(0xac, 4, one), w(0xb0, 4, one), w(0xb4, 4, one),
    w(0xb8, 4, 0), w(0xbc, 4, 0), w(0xc0, 4, 0), w(0xc4, 4, 0), w(0xc8, 4, 0), w(0xcc, 4, 0), w(0xd0, 4, 0),
    w(0xe4, 4, 0), w(0xe8, 4, 0), w(0xec, 4, 0), w(0xf0, 4, 0), w(0xf4, 4, 0), w(0xf8, 4, 0), w(0xfc, 4, 0),
    w(ANM2_OFF_CHAMPION_COLOR_D4, 4, one), w(0xd8, 4, one), w(0xdc, 4, one), w(0xe0, 4, 0),
    w(ANM2_OFF_FLIP_PAIR_100, 2, 0), w(ANM2_OFF_PLAYBACK_SPEED_104, 4, one),
    w(ANM2_OFF_LOADED_PAIR_108, 2, 0), w(ANM2_OFF_OVERLAY_FIRST_70, 1, 0),
    w(ANM2_OFF_UNNAMED_10C, 4, ANM2_RESET_UNNAMED_10C_VALUE), w(ANM2_OFF_BITFLAGS_110, 4, 0),
  ];
}

/**
 * Apply the pure half of Reset into `mem` at `objAddr`. The two animation-state
…
 */
export function anm2ResetApplyFields(mem, objAddr, {
  nameHeapAddr = 0, animHeapAddr = 0,
  offsetXBits = ANM2_OFFSET_X_LOAD_DEFAULT_BITS,
  offsetYBits = ANM2_OFFSET_Y_LOAD_DEFAULT_BITS,
  scaleXBits = ANM2_SCALE_X_LOAD_DEFAULT_BITS,
  scaleYBits = ANM2_SCALE_Y_LOAD_DEFAULT_BITS,
} = {}) {
  objAddr = u32(objAddr);
  if (objAddr === 0) return;
  const nameCap = readU32(mem, objAddr + ANM2_OFF_FILENAME_CAP_14);
  writeBytes(mem, objAddr + ANM2_OFF_FILENAME_SIZE_10, 0, 4);
  const nameData = anm2SsoUsesHeap(nameCap) ? u32(nameHeapAddr) : (objAddr + ANM2_OFF_FILENAME_STR_00);
  if (nameData !== 0) writeBytes(mem, nameData, 0, 1);
  const animCap = readU32(mem, objAddr + ANM2_OFF_ANIM_NAME_CAP_2C);
  writeBytes(mem, objAddr + ANM2_OFF_ANIM_NAME_SIZE_28, 0, 4);
  const animData = anm2SsoUsesHeap(animCap) ? u32(animHeapAddr) : (objAddr + ANM2_OFF_ANIM_NAME_STR_18);
  if (animData !== 0) writeBytes(mem, animData, 0, 1);
  for (const wr of anm2ResetFieldWrites({ offsetXBits, offsetYBits, scaleXBits, scaleYBits })) {
    if (wr.offset === ANM2_OFF_FILENAME_SIZE_10 || wr.offset === ANM2_OFF_ANIM_NAME_SIZE_28) continue;
    writeBytes(mem, u32(objAddr + wr.offset), wr.value, wr.width);
  }
}

/* ---------- AL: ANM2::GetLayer(int) (0x0040b220) ---------- */

/**
 * The index overload rejects a negative index and any index that reaches the
 * stored layer count. Both tests read the count as a signed quantity, so a
 * count whose top bit is set rejects everything.
 */
export function anm2LayerIndexInRange(index, count) {
  index = i32(index); count = i32(count);
  if (index < 0) return false;
  return index < count;
}

/** Byte distance from the array base to element `index`, wrapping at 32 bits. */
export function anm2LayerByteOffset(index) {
  return u32(Math.imul(i32(index), ANM2_LAYER_STATE_STRIDE));
}

/**
 * @param {object} opts
…
 */
export function anm2GetLayerPlan({
  index = 0, countPre = 0, countPost = 0, basePost = 0,
} = {}) {
  const pre = anm2LayerIndexInRange(index, countPre);
  const post = pre ? true : anm2LayerIndexInRange(index, countPost);
  return {
    inRangePre: pre, logNeeded: !pre, logVa: ANM2_HOST_VA_LOG,
    logLevel: ANM2_GET_LAYER_LOG_LEVEL, logFormatVa: ANM2_GET_LAYER_LOG_STR_VA,
    inRangePost: post,
    resultPtr: post ? u32(u32(basePost) + anm2LayerByteOffset(index)) : ANM2_GET_LAYER_STATIC_VA,
    usesStaticFallback: !post, staticLayerVa: ANM2_GET_LAYER_STATIC_VA,
    staticGuardVa: ANM2_GET_LAYER_GUARD_VA,
  };
}

/* ---------- ALN: ANM2::GetLayer(const char*) (0x0040b430) ---------- */

export function anm2LayerWalkEnter(count) {
  return u32(count) !== 0;
}

/** The scan advances while the next slot is still below the count, unsigned. */
export function anm2LayerWalkContinue(nextIndex, count) {
  return u32(nextIndex) < u32(count);
}

/**
 * Find the layer whose descriptor name equals the requested one. Element `i`
…
 */
export function anm2FindLayerIndexByName(mem, baseAddr, count, nameAddr) {
  if (!anm2LayerWalkEnter(count)) return -1;
  let i = 0; let cursor = u32(baseAddr);
  for (;;) {
    const layerData = readU32(mem, cursor + ANM2_LAYER_DATA_PTR_OFF);
    let cmp;
    if (layerData === 0) {
      cmp = ((mem[u32(nameAddr)] & 0xff) === 0) ? 0 : -1;
    } else {
      cmp = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, u32(layerData + ANM2_LAYER_DATA_NAME_OFF)), nameAddr);
    }
    if (cmp === 0) return i32(i);
    i = u32(i + 1);
    cursor = u32(cursor + ANM2_LAYER_STATE_STRIDE);
    if (!anm2LayerWalkContinue(i, count)) return -1;
  }
}

/* ---------- AD: AnimationData name walk (0x0040bcd0 / 0x0040a5d0) --------- */

export function anm2AnimDataByteOffset(index) {
  return u32(Math.imul(i32(index), ANM2_ANIM_DATA_STRIDE));
}

/**
 * Same scan, wider elements, and the name string sits at the very start of the
…
 */
export function anm2AnimDataIndexByName(mem, baseAddr, count, nameAddr) {
  if (!anm2LayerWalkEnter(count)) return -1;
  let i = 0; let cursor = u32(baseAddr);
  for (;;) {
    if (anm2StrcmpMem(mem, anm2SsoDataAddr(mem, cursor), nameAddr) === 0) return i32(i);
    i = u32(i + 1);
    cursor = u32(cursor + ANM2_ANIM_DATA_STRIDE);
    if (!anm2LayerWalkContinue(i, count)) return -1;
  }
}

/**
 * Residual of 0x0040a5d0 once the scan answered. A miss warns and reports
 * failure; a hit routes the found element to one of two apply helpers, chosen
 * by the low byte of the second argument.
 */
export function anm2AnimApplyPlan(foundIndex, resetFlag) {
  const found = i32(foundIndex) >= 0;
  if (!found) {
    return {
      found: false, foundIndex: -1, elemByteOffset: 0, warnLogNeeded: true,
      warnLogVa: ANM2_HOST_VA_LOG, warnLogLevel: ANM2_ANIM_MISS_LOG_LEVEL,
      warnLogStrVa: ANM2_ANIM_MISS_LOG_STR_VA, applyVa: 0, applyRecvOff: 0, result: 0,
    };
  }
  return {
    found: true, foundIndex: i32(foundIndex), elemByteOffset: anm2AnimDataByteOffset(foundIndex),
    warnLogNeeded: false, warnLogVa: ANM2_HOST_VA_LOG, warnLogLevel: ANM2_ANIM_MISS_LOG_LEVEL,
    warnLogStrVa: ANM2_ANIM_MISS_LOG_STR_VA,
    applyVa: ((resetFlag | 0) & 0xff) !== 0 ? ANM2_HOST_VA_ANIM_STATE_APPLY : ANM2_HOST_VA_ANIM_STATE_APPLY_ALT,
    applyRecvOff: ANM2_OFF_ANIM_STATE_30, result: 1,
  };
}

/** 0x0040a5d0 whole body as a single pure decision (v6). The count is read
 *  from [anm2+0x78] and the base from [anm2+0x74] once, then the SAME
…
 *  model their internals). */
export function anm2WalkApplyPlan(mem, { anm2Addr, nameAddr, resetFlag }) {
  const plan = {
    found: 0, foundIndex: -1, elemByteOffset: 0, warnLogNeeded: 1,
    warnLogVa: ANM2_HOST_VA_LOG, warnLogLevel: ANM2_ANIM_MISS_LOG_LEVEL,
    warnLogStrVa: ANM2_ANIM_MISS_LOG_STR_VA, applyVa: 0, applyRecvOff: 0,
    result: 0, hostCallCount: 1,
  };
  let index = -1;
  if (u32(anm2Addr) !== 0) {
    const base = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_74);
    const count = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_COUNT_78);
    if (count !== 0) index = anm2AnimDataIndexByName(mem, base, count, nameAddr);
  }
  if (index < 0) return plan;
  const hit = anm2AnimApplyPlan(index, resetFlag);
  plan.found = 1; plan.foundIndex = hit.foundIndex; plan.elemByteOffset = hit.elemByteOffset;
  plan.warnLogNeeded = 0; plan.applyVa = hit.applyVa; plan.applyRecvOff = hit.applyRecvOff;
  plan.result = 1; plan.hostCallCount = 1;
  return plan;
}

/* ============ v59-gapscan: 0x0040bcb0 SSO AD name-walk wrapper ===========
   Independently reasoned from the instruction stream (NOT derived from the
   cpp): the wrapper's only logic is the SSO select at 0x40bcb6..0x40bcbe
   (`cmp dword [eax+0x14],0x10 ; jb` — UNSIGNED strict below; arg slot
   [ebp+8] rewritten to the selected chars) then a tail-jump into the pure
   v1/v6 walk 0x40bcd0 with ecx UNCHANGED. Combined body: zero host calls.
   Machine result on hit = base + idx*0x13c (the ELEMENT ADDRESS), 0 else. */

export const ANM2_ANIM_DATA_SSO_WALK_VA = 0x0040bcb0;
export const ANM2_ANIM_DATA_SSO_WALK_END_VA = 0x0040bcc6;
export const ANM2_ANIM_DATA_SSO_WALK_BODY_BYTES = 0x17;
export const ANM2_ANIM_DATA_SSO_WALK_CALLSITE_COUNT = 4;
export const ANM2_ANIM_DATA_SSO_WALK_CALLER_FIRST_VA = 0x0077fe78;
export const ANM2_ANIM_DATA_SSO_WALK_CALLER_LAST_VA = 0x00788d0c;
export const ANM2_ANIM_DATA_SSO_WALK_WALK_VA = 0x0040bcd0;

/** 0x0040bcb0 whole wrapper: SSO-select the arg string (the select IS the
 *  existing anm2SsoUsesHeap/anm2SsoDataPtr law; no scalar duplicate), then
 *  the pure AD name walk (count [anm2+0x78], base [anm2+0x74], stride
 *  0x13c). resultPtr = base + idx*0x13c on hit, 0 on miss — the machine's
 *  element ADDRESS. */
export function anm2AnimDataSsoWalkPlan(mem, { anm2Addr, strAddr }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0,
    count: 0, base: 0, found: 0, foundIndex: -1, elemByteOffset: 0,
    resultPtr: 0, pureComplete: 1,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (cap < ANM2_SSO_CAPACITY_THRESHOLD) {
      plan.heapUsed = 0;
      nameAddr = u32(strAddr);
    } else {
      plan.heapUsed = 1;
      nameAddr = readU32(mem, u32(strAddr));
    }
    plan.nameAddr = nameAddr;
  }
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    const base = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_74);
    const count = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_COUNT_78);
    plan.base = base;
    plan.count = count;
    if (count !== 0) {
      const idx = anm2AnimDataIndexByName(mem, base, count, nameAddr);
      if (idx >= 0) {
        plan.found = 1;
        plan.foundIndex = idx;
        plan.elemByteOffset = anm2AnimDataByteOffset(idx);
        plan.resultPtr = u32(base + plan.elemByteOffset);
      }
    }
  }
  return plan;
}

/* ============ v60-c380: 0x0040c380 string SSO default ctor ===============
   Independently reasoned from the instruction stream (NOT derived from the
   cpp): MSVC std::basic_string SSO default ctor — `mov dword [ecx],0 ;
   mov eax,ecx ; mov dword [ecx+0x10],0 ; mov dword [ecx+0x14],0xf ; ret`.
   CONSTANT dword stores only (chars +0, size +0x10, cap +0x14 = 0xf =
   BUF_SIZE 16 - 1, the same cap the v38/v43 SSO laws pin). No gates, no
   byte reads anywhere — the family byte-gate rule is vacuous here.
   Return value = this (mov eax,ecx). Zero host calls. Census: E8=0,
   E9=0, push-imm32 addr-taken = 16 (container emplace/new-string
   shapes) — no direct .text caller. */

export const ANM2_STRING_DEFAULT_CTOR_VA = 0x0040c380;
export const ANM2_STRING_DEFAULT_CTOR_END_VA = 0x0040c396;
export const ANM2_STRING_DEFAULT_CTOR_BODY_BYTES = 0x17;
export const ANM2_STRING_DEFAULT_CTOR_CALLSITE_COUNT = 0;
export const ANM2_STRING_DEFAULT_CTOR_ADDR_TAKEN = 16;
export const ANM2_STRING_DEFAULT_CTOR_CAP_VALUE = 0xf;

/* Load-sibling census pins (wave-31 F3 re-verified windowed rel32; body
   VAs pinned at v7 as ANM2_LOAD_HOST_VA_CACHE_FETCH / _GRAPHICS). */
export const ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLSITE_COUNT = 3;
export const ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLER_FIRST_VA = 0x00407866;
export const ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLER_LAST_VA = 0x0040beb1;
export const ANM2_LOAD_HOST_VA_GRAPHICS_CALLSITE_COUNT = 102;
export const ANM2_LOAD_HOST_VA_GRAPHICS_CALLER_FIRST_VA = 0x0040bd97;
export const ANM2_LOAD_HOST_VA_GRAPHICS_CALLER_LAST_VA = 0x009fc92f;

/** 0x0040c380: the three constant stores are ALWAYS reported when entered
 *  (self != 0); result = self. Null self -> not-entered zeroed plan (the
 *  machine would fault; the law folds to the v42 head posture). */
export function anm2StringDefaultCtorPlan({ self }) {
  self = u32(self);
  const entered = self !== 0 ? 1 : 0;
  return {
    entered,
    self,
    result: entered !== 0 ? self : 0,
    storeCount: 3,
    charsOff: 0, charsValue: 0,
    sizeOff: ANM2_STRING_SIZE_OFF, sizeValue: 0,
    capOff: ANM2_STRING_CAP_OFF, capValue: ANM2_STRING_DEFAULT_CTOR_CAP_VALUE,
    pureComplete: 1, hostCallCount: 0,
  };
}

/* ============ v61-c5b0: 0x0040c5b0 2-dword pair ctor =======================
   Independently reasoned from the instruction stream (NOT derived from the
   cpp): `mov dword [ecx],0 ; mov eax,ecx ; mov dword [ecx+4],0 ; ret` — a
   2-dword zero-init ctor (pointer-pair / std::pair / SSO first-8-bytes
   shape) between the v8 CTOR_ANIM pin (0x40c550) and the vtbl-dtor
   cluster (0x40c5c0). CONSTANT dword stores only ([self+0] := 0,
   [self+4] := 0), no gates, no byte reads — the family byte-gate rule is
   vacuous here. Return value = this (mov eax,ecx @ 0x40c5b6). Zero host
   calls. Census: E8=0, E9=0, push-imm32 addr-taken = 5 (0x950c73,
   0x9df4f0, 0xa1a98f, 0xa1fa9b, 0xa219fb) — no direct .text caller. */

export const ANM2_PAIR_CTOR_VA = 0x0040c5b0;
export const ANM2_PAIR_CTOR_END_VA = 0x0040c5bf;
export const ANM2_PAIR_CTOR_BODY_BYTES = 0xf;
export const ANM2_PAIR_CTOR_CALLSITE_COUNT = 0;
export const ANM2_PAIR_CTOR_ADDR_TAKEN = 5;
export const ANM2_PAIR_CTOR_FIRST_OFF = 0x0;
export const ANM2_PAIR_CTOR_SECOND_OFF = 0x4;

/** 0x0040c5b0: the two constant stores are ALWAYS reported when entered
 *  (self != 0); result = self. Null self -> not-entered zeroed plan (the
 *  machine would fault; the law folds to the v42 head posture). */
export function anm2PairCtorPlan({ self }) {
  self = u32(self);
  const entered = self !== 0 ? 1 : 0;
  return {
    entered,
    self,
    result: entered !== 0 ? self : 0,
    storeCount: 2,
    firstOff: ANM2_PAIR_CTOR_FIRST_OFF, firstValue: 0,
    secondOff: ANM2_PAIR_CTOR_SECOND_OFF, secondValue: 0,
    pureComplete: 1, hostCallCount: 0,
  };
}

/* ============ v62 unit: 0x0040d140 / 0x0040d170 / 0x0040d210 ===============
   Three complete small pure bodies in the 0x40d120..0x40d220 gap (between
   the v44 float ctor end 0x40d13a and the v59 node-raze row 0x40d220).
   All three dead code: zero E8/E9 (windowed census), no branches. */

export const ANM2_STRPAIR_CTOR_VA = 0x0040d140;
export const ANM2_STRPAIR_CTOR_END_VA = 0x0040d16c;
export const ANM2_STRPAIR_CTOR_BODY_BYTES = 0x2d;
export const ANM2_STRPAIR_CTOR_CALLSITE_COUNT = 0;
export const ANM2_STRPAIR_CTOR_ADDR_TAKEN = 2;
export const ANM2_STRPAIR_CTOR_STORE_COUNT = 7;
export const ANM2_STRPAIR_CTOR_A_OFF = 0x8;
export const ANM2_STRPAIR_CTOR_B_OFF = 0x20;
export const ANM2_STRPAIR_CTOR_SSO_CAP = 0xf;

/** 0x0040d140: two std::strings at self+0x8 / self+0x20; the machine
 *  zeroes each string's first dword (data slot), size, and cap — 7 dword
 *  stores, reported via the base offsets + SSO cap. result = self
 *  (mov eax,ecx @ 0x40d147). Null self -> not-entered zeroed plan. */
export function anm2StrPairCtorPlan({ self }) {
  self = u32(self);
  const entered = self !== 0 ? 1 : 0;
  return {
    entered,
    self,
    result: entered !== 0 ? self : 0,
    storeCount: ANM2_STRPAIR_CTOR_STORE_COUNT,
    aOff: ANM2_STRPAIR_CTOR_A_OFF,
    bOff: ANM2_STRPAIR_CTOR_B_OFF,
    ssoCap: ANM2_STRPAIR_CTOR_SSO_CAP,
    pureComplete: 1, hostCallCount: 0,
  };
}

export const ANM2_IDENTITY_CTOR_VA = 0x0040d170;
export const ANM2_IDENTITY_CTOR_END_VA = 0x0040d208;
export const ANM2_IDENTITY_CTOR_BODY_BYTES = 0x99;
export const ANM2_IDENTITY_CTOR_CALLSITE_COUNT = 0;
export const ANM2_IDENTITY_CTOR_ADDR_TAKEN = 0;
export const ANM2_IDENTITY_CTOR_DWORD_STORE_COUNT = 21;
export const ANM2_IDENTITY_CTOR_ONE_BITS = 0x3f800000; /* 1.0f */
export const ANM2_IDENTITY_CTOR_ONES_FIRST_OFF = 0x30;
export const ANM2_IDENTITY_CTOR_BYTE_OFF = 0x60;

/** 0x0040d170: 22 constant stores — the +0x00..+0x24 dwords zeroed in the
 *  PE's pairwise order (+0x28 NOT stored), four 1.0f words at +0x30..+0x3c,
 *  dwords +0x40..+0x58 zeroed, byte +0x60 zeroed. result = self
 *  (mov eax,ecx @ 0x40d177). Null self -> not-entered zeroed plan. */
export function anm2IdentityCtorPlan({ self }) {
  self = u32(self);
  const entered = self !== 0 ? 1 : 0;
  return {
    entered,
    self,
    result: entered !== 0 ? self : 0,
    storeCount: 22,
    oneBits: ANM2_IDENTITY_CTOR_ONE_BITS,
    onesFirstOff: ANM2_IDENTITY_CTOR_ONES_FIRST_OFF,
    byteOff: ANM2_IDENTITY_CTOR_BYTE_OFF,
    pureComplete: 1, hostCallCount: 0,
  };
}

export const ANM2_GLOBAL_BASE_GETTER_VA = 0x0040d210;
export const ANM2_GLOBAL_BASE_GETTER_END_VA = 0x0040d21a;
export const ANM2_GLOBAL_BASE_GETTER_BODY_BYTES = 0xb;
export const ANM2_GLOBAL_BASE_GETTER_CALLSITE_COUNT = 0;
export const ANM2_GLOBAL_BASE_GETTER_ADDR_TAKEN = 0;
export const ANM2_GLOBAL_BASE_PTR_VA = 0x00c7169c;
export const ANM2_GLOBAL_BASE_DELTA = 0x2a6c0;

/** 0x0040d210: mov eax,[0xc7169c]; add eax,0x2a6c0; ret. The loaded dword
 *  is a runtime input (host-fed); the add wraps mod 2^32. */
export function anm2GlobalBaseGetter(loaded) {
  return (u32(loaded) + ANM2_GLOBAL_BASE_DELTA) >>> 0;
}

/* ============ v64 unit: 0x00413b40 / 0x00413b90 ============================
   First true body boundaries after the 0x40ed50 INSERT tail. 0x00413b40
   is a HOST SEH wrapper (frame 0xaf11c0, cookie 0xbf93b4, `add ecx,0x30;
   call 0x414730`) — census row, not modeled. 0x00413b90 lands. */

export const ANM2_SEH_CLEAR_WRAP_VA = 0x00413b40;
export const ANM2_SEH_CLEAR_WRAP_END_VA = 0x00413b7f;
export const ANM2_SEH_CLEAR_WRAP_BODY_BYTES = 0x40;
export const ANM2_SEH_CLEAR_WRAP_CALLSITE_COUNT = 0;
export const ANM2_SEH_CLEAR_WRAP_ADDR_TAKEN = 0;
export const ANM2_SEH_CLEAR_WRAP_FRAME_VA = 0x00af11c0;
export const ANM2_SEH_CLEAR_WRAP_CLEAR_VA = 0x00414730;
export const ANM2_SEH_CLEAR_WRAP_RECV_OFF = 0x30;

export const ANM2_ALIGNED_STATE_CTOR_VA = 0x00413b90;
export const ANM2_ALIGNED_STATE_CTOR_END_VA = 0x00413bea;
export const ANM2_ALIGNED_STATE_CTOR_BODY_BYTES = 0x5b;
export const ANM2_ALIGNED_STATE_CTOR_CALLSITE_COUNT = 0;
export const ANM2_ALIGNED_STATE_CTOR_ADDR_TAKEN = 0;
export const ANM2_ALIGNED_STATE_CTOR_STORE_COUNT = 11;
export const ANM2_ALIGNED_STATE_CTOR_BASE_OFF = 0x3c;
export const ANM2_ALIGNED_STATE_CTOR_SENTINEL_OFF = 0x1003c;
export const ANM2_ALIGNED_STATE_CTOR_ALIGN_MASK = 3;

/** PE 0x413ba8/0x413bb1/0x413bba/0x413bc4: aligned = base + ((-base) & 3),
 *  32-bit wrap — round UP to the next multiple of 4. */
export function anm2AlignedStateCtorAligned(base) {
  return (u32(base) + ((0 - u32(base)) & 3)) >>> 0;
}

/** 0x00413b90: 11 dword stores (PE order: +0x1003c, +0x00, +0x04, +0x10,
 *  +0x14, +0x18, +0x34 := aligned, +0x20, +0x10040, +0x30 := base,
 *  +0x38 := self+0x1003c). result = self (mov eax,esi @ 0x413bd0).
 *  Null self -> not-entered zeroed plan. */
export function anm2AlignedStateCtorPlan({ self }) {
  self = u32(self);
  const entered = self !== 0 ? 1 : 0;
  const base = (self + ANM2_ALIGNED_STATE_CTOR_BASE_OFF) >>> 0;
  return {
    entered,
    self,
    result: entered !== 0 ? self : 0,
    storeCount: ANM2_ALIGNED_STATE_CTOR_STORE_COUNT,
    baseOff: ANM2_ALIGNED_STATE_CTOR_BASE_OFF,
    sentinelOff: ANM2_ALIGNED_STATE_CTOR_SENTINEL_OFF,
    alignedValue: entered !== 0 ? anm2AlignedStateCtorAligned(base) : 0,
    pureComplete: 1, hostCallCount: 0,
  };
}

/* ============ v65 unit: 0x00413bf0 / 0x00413c70 ============================
   Twin by-name intrusive-list lookups. Machine shape: needle == 0 ->
   return the RAW head; len = strlen(needle); walk nodes {name +0x0,
   len +0x8, next +N}; name == 0 substitutes the 0x00c71640 empty global
   with cmpLen 0; match iff cmpLen == len and bytes equal; exhausted ->
   0. Twins differ only in head_off / next_off. */

export const ANM2_LIST_FIND_A_VA = 0x00413bf0;
export const ANM2_LIST_FIND_A_END_VA = 0x00413c61;
export const ANM2_LIST_FIND_A_BODY_BYTES = 0x72;
export const ANM2_LIST_FIND_A_HEAD_OFF = 0x20;
export const ANM2_LIST_FIND_A_NEXT_OFF = 0x18;
export const ANM2_LIST_FIND_B_VA = 0x00413c70;
export const ANM2_LIST_FIND_B_END_VA = 0x00413cdf;
export const ANM2_LIST_FIND_B_BODY_BYTES = 0x70;
export const ANM2_LIST_FIND_B_HEAD_OFF = 0x18;
export const ANM2_LIST_FIND_B_NEXT_OFF = 0x2c;
export const ANM2_LIST_FIND_CALLSITE_COUNT = 0;
export const ANM2_LIST_FIND_ADDR_TAKEN = 0;
export const ANM2_LIST_FIND_NAME_OFF = 0x0;
export const ANM2_LIST_FIND_LEN_OFF = 0x8;
export const ANM2_LIST_FIND_EMPTY_GLOBAL = 0x00c71640;
export const ANM2_LIST_FIND_RET_BYTES = 0xc;

/** Shared twin oracle. mem is the flat byte image (shadow); needle and
 *  node bytes are read from the same image the wasm reads. */
export function anm2ListFindPlan(mem, { thisAddr, needleAddr, headOff, nextOff }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const entered = u32(needleAddr) !== 0 ? 1 : 0;
  const plan = {
    entered,
    thisAddr: u32(thisAddr),
    needleAddr: u32(needleAddr),
    head: 0, found: 0, result: 0, walkedCount: 0,
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.head = rd32(u32(thisAddr) + u32(headOff));
  if (entered === 0) {
    plan.result = plan.head;          /* null needle -> raw head */
    return plan;
  }
  let len = 0;
  while (mem[u32(needleAddr) + len] !== 0) ++len;
  let node = plan.head;
  while (node !== 0) {
    plan.walkedCount += 1;
    const name = rd32(node);
    let cmpLen; let chars;
    if (name === 0) {
      cmpLen = 0;
      chars = ANM2_LIST_FIND_EMPTY_GLOBAL;
    } else {
      cmpLen = rd32(node + ANM2_LIST_FIND_LEN_OFF);
      chars = name;
    }
    if (cmpLen === len) {
      let eq = true;
      for (let i = 0; i < len; ++i) {
        if (mem[chars + i] !== mem[u32(needleAddr) + i]) { eq = false; break; }
      }
      if (eq) {
        plan.found = 1;
        plan.result = node;
        return plan;
      }
    }
    node = rd32(node + u32(nextOff));
  }
  plan.result = 0;
  return plan;
}

/* ============ v66 unit: 0x00413cf0 manager seek ============================
   Call-free virtual method (vtable 0xb1b1bc). Report-only plan: req64 =
   X + Y (32-bit halves + carry); a_val = *[*[this+0x1c]]; if flag byte
   [this+0x3c] bit1 CLEAR: c_val = *[*[this+0x20]] and the UNSIGNED
   max-update arm [this+0x38] := c_val when c_val != 0 && [this+0x38] <
   c_val; pos_lo = *[*[this+0xc]]; limit64 = sext64([this+0x38] - pos_lo);
   FAIL iff req64 >u limit64, or (req != 0 && ((flags&1 && a_val == 0) ||
   (flags&2 && c_val == 0))); new_lo = pos_lo + req_lo; arm A/B iff
   flags&1 && a_val != 0; arm C/D iff flags&2 && c_val != 0; out = req64
   on ok else {-1,-1}; [out+8..0x17] always zeroed (not modeled -- the
   out struct is caller-owned). */

export const ANM2_MGR_SEEK_VA = 0x00413cf0;
export const ANM2_MGR_SEEK_END_VA = 0x00413df0;
export const ANM2_MGR_SEEK_BODY_BYTES = 0x100;
export const ANM2_MGR_SEEK_CALLSITE_COUNT = 0;
export const ANM2_MGR_SEEK_ADDR_TAKEN = 1;
export const ANM2_MGR_SEEK_VTABLE_SLOT_VA = 0x00b1b1bc;
export const ANM2_MGR_SEEK_RET_BYTES = 0x20;
export const ANM2_MGR_SEEK_FLAG_MASK = 2;

/** 0x00413cf0 report-only plan. mem is the flat byte image. Null-cell
 *  reads (a null inner pointer) fold to 0 -- the machine would fault; the
 *  law documents the v42 posture. */
export function anm2MgrSeekPlan(mem, { thisAddr, xLo, xHi, yLo, yHi, flags }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr),
    xLo: u32(xLo), xHi: u32(xHi), yLo: u32(yLo), yHi: u32(yHi),
    flags: u32(flags),
    reqLo: 0, reqHi: 0, posLo: 0, limHi: 0, limitLo: 0, limitHi: 0,
    aVal: 0, cVal: 0, maxUpdated: 0, ok: 0, newLo: 0,
    abApplied: 0, abAAddr: 0, abAValue: 0, abBAddr: 0, abBValue: 0,
    cdApplied: 0, cdPosAddr: 0, cdPosValue: 0,
    cdCAddr: 0, cdCValue: 0, cdDAddr: 0, cdDValue: 0,
    outLo: 0, outHi: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);

  plan.reqLo = (plan.xLo + plan.yLo) >>> 0;
  plan.reqHi = (plan.xHi + plan.yHi + (plan.reqLo < plan.xLo ? 1 : 0)) >>> 0;

  const aPtr = rd32(t + 0x1c);
  plan.aVal = aPtr !== 0 ? rd32(aPtr) : 0;

  const flag2 = (mem[t + 0x3c] & 2) !== 0;
  if (!flag2) {
    const cPtr = rd32(t + 0x20);
    const cVal = cPtr !== 0 ? rd32(cPtr) : 0;
    plan.cVal = cVal;
    const curLim = rd32(t + 0x38);
    if (cVal !== 0 && curLim < cVal) {
      plan.maxUpdated = 1;
      plan.limHi = cVal;
    } else {
      plan.limHi = curLim;
    }
  } else {
    plan.limHi = rd32(t + 0x38);
  }

  const posPtr = rd32(t + 0x0c);
  plan.posLo = posPtr !== 0 ? rd32(posPtr) : 0;

  const diff = (plan.limHi - plan.posLo) >>> 0;
  plan.limitLo = diff;
  plan.limitHi = (diff & 0x80000000) !== 0 ? 0xffffffff : 0;

  let ok = 1;
  if (plan.reqHi > plan.limitHi ||
      (plan.reqHi === plan.limitHi && plan.reqLo > plan.limitLo)) {
    ok = 0;
  }
  const dl = plan.flags & 0xff;
  if ((plan.reqLo | plan.reqHi) !== 0) {
    if ((dl & 1) !== 0 && plan.aVal === 0) ok = 0;
    if ((dl & 2) !== 0 && plan.cVal === 0) ok = 0;
  }
  plan.ok = ok;
  plan.newLo = (plan.posLo + plan.reqLo) >>> 0;

  if (ok) {
    if ((dl & 1) !== 0 && plan.aVal !== 0) {
      plan.abApplied = 1;
      plan.abAAddr = rd32(t + 0x1c);
      plan.abAValue = plan.newLo;
      plan.abBAddr = rd32(t + 0x2c);
      plan.abBValue = (plan.limHi - plan.newLo) >>> 0;
    }
    if ((dl & 2) !== 0 && plan.cVal !== 0) {
      plan.cdApplied = 1;
      plan.cdPosAddr = rd32(t + 0x10);
      plan.cdPosValue = plan.posLo;
      plan.cdCAddr = rd32(t + 0x20);
      plan.cdCValue = plan.newLo;
      plan.cdDAddr = rd32(t + 0x30);
      const oldC = rd32(plan.cdCAddr);
      const oldD = rd32(plan.cdDAddr);
      plan.cdDValue = (oldC + oldD - plan.newLo) >>> 0;
    }
    plan.outLo = plan.reqLo;
    plan.outHi = plan.reqHi;
  } else {
    plan.outLo = 0xffffffff;
    plan.outHi = 0xffffffff;
  }
  return plan;
}

/* ============ v67 unit: 0x00413e00 whence-switch seek ======================
   Twin seek with whence dispatch: 0 -> target 0; 1 (cur) -> ALIGN GUARD
   (flags&3 == 3 rejects), then target = sext64(a_val - pos) under
   flags&1 or sext64(c_val - pos) under flags&2 (each with a null-source
   FAIL when the source is 0 while pos != 0), no flag bit -> FAIL;
   2 (end) -> target = sext64(diff); else invalid. req64 = target + off
   (carry); FAIL iff req64 >u sext64(diff); gates when req != 0:
   flags&1 needs pos != 0 (NOT a_val -- differs from v66), flags&2 needs
   c_val != 0; arms A/B (pos != 0) and C/D (c_val != 0) as in v66;
   out = req64 or {-1,-1}. Report-only. */

export const ANM2_MGR_SEEK2_VA = 0x00413e00;
export const ANM2_MGR_SEEK2_END_VA = 0x00413f8f;
export const ANM2_MGR_SEEK2_BODY_BYTES = 0x8f;
export const ANM2_MGR_SEEK2_CALLSITE_COUNT = 0;
export const ANM2_MGR_SEEK2_ADDR_TAKEN = 1;
export const ANM2_MGR_SEEK2_VTABLE_SLOT_VA = 0x00b1b1b8;
export const ANM2_MGR_SEEK2_RET_BYTES = 0x14;
export const ANM2_MGR_SEEK2_ALIGN_MASK = 3;

/** 0x00413e00 report-only plan (flat-image oracle). */
export function anm2MgrSeek2Plan(mem, { thisAddr, offLo, offHi, whence, flags }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr),
    offLo: u32(offLo), offHi: u32(offHi),
    whence: u32(whence), flags: u32(flags),
    posLo: 0, limHi: 0, aVal: 0, cVal: 0, maxUpdated: 0,
    targetLo: 0, targetHi: 0, reqLo: 0, reqHi: 0,
    limitLo: 0, limitHi: 0, invalidWhence: 0, alignFail: 0, ok: 0,
    newLo: 0,
    abApplied: 0, abAAddr: 0, abAValue: 0, abBAddr: 0, abBValue: 0,
    cdApplied: 0, cdPosAddr: 0, cdPosValue: 0,
    cdCAddr: 0, cdCValue: 0, cdDAddr: 0, cdDValue: 0,
    outLo: 0, outHi: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);

  const aPtr = rd32(t + 0x1c);
  plan.aVal = aPtr !== 0 ? rd32(aPtr) : 0;
  const flag2 = (mem[t + 0x3c] & 2) !== 0;
  if (!flag2) {
    const cPtr = rd32(t + 0x20);
    const cVal = cPtr !== 0 ? rd32(cPtr) : 0;
    plan.cVal = cVal;
    const curLim = rd32(t + 0x38);
    if (cVal !== 0 && curLim < cVal) {
      plan.maxUpdated = 1;
      plan.limHi = cVal;
    } else {
      plan.limHi = curLim;
    }
  } else {
    plan.limHi = rd32(t + 0x38);
  }

  const posPtr = rd32(t + 0x0c);
  plan.posLo = posPtr !== 0 ? rd32(posPtr) : 0;
  const diff = (plan.limHi - plan.posLo) >>> 0;

  const sext = (d) => ({ lo: d >>> 0, hi: (d & 0x80000000) !== 0 ? 0xffffffff : 0 });
  const dl = plan.flags & 0xff;
  let tgtLo = 0, tgtHi = 0, fail = 0;
  if (plan.whence === 0) {
    /* target = 0 */
  } else if (plan.whence === 1) {
    if ((plan.flags & 3) === 3) {
      plan.alignFail = 1; fail = 1;
    } else if ((dl & 1) !== 0) {
      if (plan.aVal === 0 && plan.posLo !== 0) { fail = 1; }
      else { const s2 = sext((plan.aVal - plan.posLo) >>> 0); tgtLo = s2.lo; tgtHi = s2.hi; }
    } else if ((dl & 2) !== 0) {
      if (plan.cVal === 0 && plan.posLo !== 0) { fail = 1; }
      else { const s2 = sext((plan.cVal - plan.posLo) >>> 0); tgtLo = s2.lo; tgtHi = s2.hi; }
    } else {
      fail = 1;
    }
  } else if (plan.whence === 2) {
    const s2 = sext(diff); tgtLo = s2.lo; tgtHi = s2.hi;
  } else {
    plan.invalidWhence = 1; fail = 1;
  }
  plan.targetLo = tgtLo; plan.targetHi = tgtHi;

  plan.reqLo = (tgtLo + plan.offLo) >>> 0;
  plan.reqHi = (tgtHi + plan.offHi + (plan.reqLo < tgtLo ? 1 : 0)) >>> 0;

  const lim = sext(diff);
  plan.limitLo = lim.lo; plan.limitHi = lim.hi;
  if (plan.reqHi > plan.limitHi ||
      (plan.reqHi === plan.limitHi && plan.reqLo > plan.limitLo)) {
    fail = 1;
  }
  if ((plan.reqLo | plan.reqHi) !== 0) {
    if ((dl & 1) !== 0 && plan.posLo === 0) fail = 1;
    if ((dl & 2) !== 0 && plan.cVal === 0) fail = 1;
  }
  plan.ok = fail ? 0 : 1;
  plan.newLo = (plan.posLo + plan.reqLo) >>> 0;

  if (plan.ok) {
    if ((dl & 1) !== 0 && plan.posLo !== 0) {
      plan.abApplied = 1;
      plan.abAAddr = rd32(t + 0x1c);
      plan.abAValue = plan.newLo;
      plan.abBAddr = rd32(t + 0x2c);
      plan.abBValue = (plan.limHi - plan.newLo) >>> 0;
    }
    if ((dl & 2) !== 0 && plan.cVal !== 0) {
      plan.cdApplied = 1;
      plan.cdPosAddr = rd32(t + 0x10);
      plan.cdPosValue = plan.posLo;
      plan.cdCAddr = rd32(t + 0x20);
      plan.cdCValue = plan.newLo;
      plan.cdDAddr = rd32(t + 0x30);
      const oldC = rd32(plan.cdCAddr);
      const oldD = rd32(plan.cdDAddr);
      plan.cdDValue = (oldC + oldD - plan.newLo) >>> 0;
    }
    plan.outLo = plan.reqLo;
    plan.outHi = plan.reqHi;
  } else {
    plan.outLo = 0xffffffff;
    plan.outHi = 0xffffffff;
  }
  return plan;
}

/* ============ v68-retry: 0x00413ff0 put-char + 0x00413f90 get-byte ========
   Two call-free manager-vtable methods. Report-only plans.

   put-char: PE-ORDERED evaluation -- bounds fails (pos==0, pos<=u size)
   each skip everything after; the mismatch gate runs ONLY on
   bounds-pass and only when ch != -1; success arms ++end/--pos and
   iff ch != -1 byte[POST-DEC pos] = (byte)ch (post-dec simulated);
   result = ch == -1 ? 0 : ch (full dword); FAIL -> -1.

   get-byte: FAIL iff pos == 0; end = *endPtr + pos (pos ADDED);
   direct hit pos <u end -> byte[pos]; else refresh arm: e == 0 -> -1,
   byte[this+0x3c]&4 -> -1, lim_new = max_u32(lim_old, e) (cmovb),
   lim_new <=u pos -> -1, commit lim, *[*[this+0x2c]] = lim_new - pos,
   SAME-VALUE writeback of the pos cell, result = byte[pos]. */

export const ANM2_MGR_PUTC_VA = 0x00413ff0;
export const ANM2_MGR_PUTC_END_VA = 0x00414041;
export const ANM2_MGR_PUTC_BODY_BYTES = 0x52;
export const ANM2_MGR_PUTC_CALLSITE_COUNT = 0;
export const ANM2_MGR_PUTC_ADDR_TAKEN = 1;
export const ANM2_MGR_PUTC_VTABLE_SLOT_VA = 0x00b1b1a0;
export const ANM2_MGR_PUTC_RET_BYTES = 4;
export const ANM2_MGR_GETC_VA = 0x00413f90;
export const ANM2_MGR_GETC_END_VA = 0x00413fe5;
export const ANM2_MGR_GETC_BODY_BYTES = 0x56;
export const ANM2_MGR_GETC_CALLSITE_COUNT = 0;
export const ANM2_MGR_GETC_ADDR_TAKEN = 1;
export const ANM2_MGR_GETC_VTABLE_SLOT_VA = 0x00b1b1a8;
export const ANM2_MGR_GETC_FLAG4_MASK = 4;

/** 0x00413ff0 report-only plan (flat-image oracle). */
export function anm2MgrPutcPlan(mem, { thisAddr, ch }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr), ch: u32(ch),
    pos: 0, sizeVal: 0, mismatch: 0, ok: 0,
    endIncApplied: 0, endIncAddr: 0, endIncValue: 0,
    posDecApplied: 0, posDecAddr: 0, posDecValue: 0,
    chStoreApplied: 0, chStoreAddr: 0, chStoreValue: 0,
    result: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);
  const posPtr = rd32(t + 0x1c);
  plan.pos = posPtr !== 0 ? rd32(posPtr) : 0;
  const sizePtr = rd32(t + 0x0c);
  plan.sizeVal = sizePtr !== 0 ? rd32(sizePtr) : 0;

  /* PE ORDER: bounds first. */
  let ok = 1;
  if (plan.pos === 0) ok = 0;
  if (ok && plan.pos <= plan.sizeVal) ok = 0;

  const dl = plan.ch & 0xff;
  let mismatch = 0;
  if (ok && plan.ch !== 0xffffffff) {
    const prev = mem[(plan.pos - 1) >>> 0];
    if (dl !== prev) {
      mismatch = 1;
      if ((mem[t + 0x3c] & 2) !== 0) ok = 0;
    }
  }
  plan.mismatch = mismatch;
  plan.ok = ok;

  if (plan.ok) {
    plan.endIncApplied = 1;
    plan.endIncAddr = rd32(t + 0x2c);
    plan.endIncValue = (rd32(plan.endIncAddr) + 1) >>> 0;
    plan.posDecApplied = 1;
    plan.posDecAddr = rd32(t + 0x1c);
    plan.posDecValue = (rd32(plan.posDecAddr) - 1) >>> 0;
    if (plan.ch !== 0xffffffff) {
      plan.chStoreApplied = 1;
      plan.chStoreAddr = plan.posDecValue; /* POST-DEC pos (simulated) */
      plan.chStoreValue = dl;
    }
    plan.result = plan.ch === 0xffffffff ? 0 : plan.ch | 0;
  } else {
    plan.result = -1;
  }
  return plan;
}

/** 0x00413f90 report-only plan (flat-image oracle). */
export function anm2MgrGetcPlan(mem, { thisAddr }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr),
    pos: 0, endBase: 0, endVal: 0, directHit: 0, directByte: 0,
    refreshUsed: 0, eVal: 0, refreshFlag4Fail: 0,
    limOld: 0, limNew: 0, limCommitted: 0,
    endWrApplied: 0, endWrAddr: 0, endWrValue: 0,
    posWrApplied: 0, posWrAddr: 0, posWrValue: 0,
    result: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);
  const posPtr = rd32(t + 0x1c);
  plan.pos = posPtr !== 0 ? rd32(posPtr) : 0;

  let fail = 0;
  if (plan.pos === 0) fail = 1;

  if (!fail) {
    plan.endBase = rd32(t + 0x2c);
    const endBaseVal = plan.endBase !== 0 ? rd32(plan.endBase) : 0;
    plan.endVal = (endBaseVal + plan.pos) >>> 0;  /* pos ADDED */
    if (plan.pos < plan.endVal) {
      plan.directHit = 1;
      plan.directByte = mem[plan.pos];
      plan.result = plan.directByte | 0;
      return plan;
    }
    plan.refreshUsed = 1;
    const ePtr = rd32(t + 0x20);
    plan.eVal = ePtr !== 0 ? rd32(ePtr) : 0;
    if (plan.eVal === 0) fail = 1;
    if ((mem[t + 0x3c] & 4) !== 0) { plan.refreshFlag4Fail = 1; fail = 1; }
    if (!fail) {
      plan.limOld = rd32(t + 0x38);
      plan.limNew = Math.max(plan.limOld >>> 0, plan.eVal) >>> 0;
      if (plan.limNew <= plan.pos) fail = 1;
      if (!fail) {
        plan.limCommitted = 1;
        plan.endWrApplied = 1;
        plan.endWrAddr = plan.endBase;
        plan.endWrValue = (plan.limNew - plan.pos) >>> 0;
        plan.posWrApplied = 1;
        plan.posWrAddr = rd32(t + 0x1c);
        plan.posWrValue = plan.pos;
        plan.result = mem[plan.pos] | 0;
        return plan;
      }
    }
  }
  plan.result = -1;
  return plan;
}

/* ============ v71 unit: 0x004143f0 + 0x00414410 tiny getters ==============
   Two complete small pure scalar laws (both dead code: zero E8/E9/
   push-imm/data refs; identify-zhl EMPTY).

   0x004143f0 stride-24 offset getter: result = base + arg*24 via
   lea edx,[eax+eax*2] / lea eax,[eax+edx*8] -- 32-bit wrap throughout
   ((arg*3)*8 == arg*24 mod 2^32).

   0x00414410 signed divide-by-24 magic (MSVC /24 pattern): d = hi-lo
   (u32 wrap, read as i32); edx:eax = d * 0x2aaaaaab SIGNED (magic =
   ceil(2^34/24)); high = sar(prod_hi, 2); result = high +
   (high >>>u 31) -- trunc-toward-zero d/24, NOT floor (d = -24 ->
   -1; dropping the sign-add gives -2). BYTE-VERIFIED: d = 3 -> 0,
   d = 24 -> 1. */

export const ANM2_STRIDE24_GETTER_VA = 0x004143f0;
export const ANM2_STRIDE24_GETTER_END_VA = 0x00414401;
export const ANM2_STRIDE24_GETTER_BODY_BYTES = 0x12;
export const ANM2_STRIDE24_GETTER_CALLSITE_COUNT = 0;
export const ANM2_STRIDE24_GETTER_ADDR_TAKEN = 0;
export const ANM2_STRIDE24_GETTER_STRIDE = 24;
export const ANM2_STRIDE24_GETTER_RET_BYTES = 4;
export const ANM2_DIFF_DIV24_VA = 0x00414410;
export const ANM2_DIFF_DIV24_END_VA = 0x00414426;
export const ANM2_DIFF_DIV24_BODY_BYTES = 0x17;
export const ANM2_DIFF_DIV24_CALLSITE_COUNT = 0;
export const ANM2_DIFF_DIV24_ADDR_TAKEN = 0;
export const ANM2_DIFF_DIV24_MAGIC = 0x2aaaaaab;
export const ANM2_DIFF_DIV24_SHIFT = 2;

/** 0x004143f0: result = base + arg*24, 32-bit wrap. */
export function anm2Stride24Offset(base, arg) {
  const triple = (u32(arg) * 3) >>> 0;
  return (u32(base) + (triple * 8) >>> 0) >>> 0;
}

/** 0x00414410: trunc-toward-zero((i32)(hi - lo) / 24) via the PE's
 *  0x2aaaaaab imul / sar 2 / sign-add sequence (MSVC /24 pattern). */
export function anm2DiffDiv24(lo, hi) {
  const d = (u32(hi) - u32(lo)) | 0;          /* u32 wrap, then signed */
  const prod = BigInt(d) * 0x2aaaaaabn;        /* signed 64-bit product */
  let high = Number(BigInt.asIntN(32, prod >> 32n)) | 0;
  high = high >> 2;                            /* sar -- arithmetic */
  const sign = (high >>> 31) & 1;              /* shr eax,0x1f */
  return (high + sign) | 0;
}

/* ============ v73 unit: 0x00414520 string resize-tail setter ==============
   SPLIT law. thiscall this=ecx (std::string-like: size @+0x10,
   cap @+0x14, data ptr-or-SSO-buf @+0); arg [ebp+8] = new size.
   GROW iff arg >u cur_size -> delta = arg - cur, HOST tail 0x00414870
   receives it in the first stack slot. Otherwise (shrink/equal):
   SSO select (heap data ptr iff cap >= 0x10), size := arg, byte
   terminator at (heap ? *this : this) + arg. Equal sizes take the
   shrink arm. Report-only: shrink stores REPORTED; grow arm reports
   delta + host tail VA. */

export const ANM2_STR_RESIZE_VA = 0x00414520;
export const ANM2_STR_RESIZE_END_VA = 0x00414549;
export const ANM2_STR_RESIZE_BODY_BYTES = 0x2a;
export const ANM2_STR_RESIZE_CALLSITE_COUNT = 0;
export const ANM2_STR_RESIZE_ADDR_TAKEN = 0;
export const ANM2_STR_RESIZE_RET_BYTES = 8;
export const ANM2_STR_RESIZE_SSO_CAP = 0x10;
export const ANM2_STR_RESIZE_SIZE_OFF = 0x10;
export const ANM2_STR_RESIZE_CAP_OFF = 0x14;
export const ANM2_STR_RESIZE_HOST_TAIL_VA = 0x00414870;

/** 0x00414520 report-only plan (flat-image oracle). */
export function anm2StrResizePlan(mem, { thisAddr, newSize }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr), newSize: u32(newSize),
    curSize: 0, cap: 0, heapDataUsed: 0, grow: 0, delta: 0,
    sizeStoreApplied: 0, sizeStoreAddr: 0, sizeStoreValue: 0,
    termStoreApplied: 0, termStoreAddr: 0, termStoreValue: 0,
    hostTailVa: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);

  plan.curSize = rd32(t + ANM2_STR_RESIZE_SIZE_OFF);
  const grow = u32(newSize) > plan.curSize ? 1 : 0;
  plan.grow = grow;

  if (grow) {
    plan.delta = (u32(newSize) - plan.curSize) >>> 0;
    plan.hostTailVa = ANM2_STR_RESIZE_HOST_TAIL_VA;
    return plan;
  }

  plan.cap = rd32(t + ANM2_STR_RESIZE_CAP_OFF);
  const heap = plan.cap >= ANM2_STR_RESIZE_SSO_CAP ? 1 : 0;
  plan.heapDataUsed = heap;
  plan.sizeStoreApplied = 1;
  plan.sizeStoreAddr = (t + ANM2_STR_RESIZE_SIZE_OFF) >>> 0;
  plan.sizeStoreValue = u32(newSize);
  plan.termStoreApplied = 1;
  const base = heap ? rd32(t) : t;              /* SSO select */
  plan.termStoreAddr = (base + u32(newSize)) >>> 0;
  plan.termStoreValue = 0;
  return plan;
}

/* ============ v76 unit: 0x00414a80 std::_Tree successor ====================
   Pure plan over an MSVC _Tree node graph {left +0x0, parent +0x4,
   right +0x8, _Isnil byte +0xd (NONZERO = header/nil)}. this=esi is an
   ITERATOR SLOT: node = [esi]; the successor is stored BACK into [esi]
   and this is returned. Paths:
     0 leftmost-of-right-subtree (right not-nil -> descend +0 chain)
     1 climb while parent not-nil AND node == parent->right
     2 parent nil -> result = parent (nil head)
     3 node != parent->right -> result = parent
   Report-only: the [this] := successor store is REPORTED. */

export const ANM2_TREE_NEXT_VA = 0x00414a80;
export const ANM2_TREE_NEXT_END_VA = 0x00414ad2;
export const ANM2_TREE_NEXT_BODY_BYTES = 0x53;
export const ANM2_TREE_NEXT_CALLSITE_COUNT = 0;
export const ANM2_TREE_NEXT_ADDR_TAKEN = 0;
export const ANM2_TREE_NEXT_LEFT_OFF = 0x0;
export const ANM2_TREE_NEXT_PARENT_OFF = 0x4;
export const ANM2_TREE_NEXT_RIGHT_OFF = 0x8;
export const ANM2_TREE_NEXT_ISNIL_OFF = 0xd;
export const ANM2_TREE_NEXT_PATH_LEFTMOST = 0;
export const ANM2_TREE_NEXT_PATH_CLIMB = 1;
export const ANM2_TREE_NEXT_PATH_PARENT_NIL = 2;
export const ANM2_TREE_NEXT_PATH_PARENT_DIRECT = 3;

/** 0x00414a80 report-only plan (flat-image oracle). */
export function anm2TreeNextPlan(mem, { thisAddr }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const isnil = (a) => (mem[u32(a) + ANM2_TREE_NEXT_ISNIL_OFF] !== 0 ? 1 : 0);
  const plan = {
    entered: 0, thisAddr: u32(thisAddr), node: 0, resultNode: 0,
    path: 0, climbCount: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  const t = u32(thisAddr);
  plan.node = rd32(t);
  if (plan.node === 0) return plan;   /* v42 fold */

  const right = rd32(plan.node + ANM2_TREE_NEXT_RIGHT_OFF);
  if (isnil(right) === 0) {
    /* PATH 0: leftmost of the right subtree. */
    let c = rd32(right + ANM2_TREE_NEXT_LEFT_OFF);
    let leftmost = right;
    while (isnil(c) === 0) {
      leftmost = c;
      c = rd32(c + ANM2_TREE_NEXT_LEFT_OFF);
    }
    plan.path = ANM2_TREE_NEXT_PATH_LEFTMOST;
    plan.resultNode = leftmost;
    return plan;
  }

  const parent = rd32(plan.node + ANM2_TREE_NEXT_PARENT_OFF);
  if (isnil(parent) !== 0) {
    plan.path = ANM2_TREE_NEXT_PATH_PARENT_NIL;
    plan.resultNode = parent;
    return plan;
  }
  if (plan.node !== rd32(parent + ANM2_TREE_NEXT_RIGHT_OFF)) {
    plan.path = ANM2_TREE_NEXT_PATH_PARENT_DIRECT;
    plan.resultNode = parent;
    return plan;
  }
  /* PATH 1: climb. */
  let cur = plan.node;
  let anc = parent;
  for (;;) {
    plan.climbCount += 1;
    cur = anc;
    anc = rd32(anc + ANM2_TREE_NEXT_PARENT_OFF);
    if (isnil(anc) !== 0) break;
    if (cur !== rd32(anc + ANM2_TREE_NEXT_RIGHT_OFF)) break;
  }
  plan.path = ANM2_TREE_NEXT_PATH_CLIMB;
  plan.resultNode = anc;
  return plan;
}

/* ============ v82 unit: 0x00415f80 _Tree erase-splice =====================
   Pure-complete plan law (89 B, ret 4 x3, zero calls). this=ecx =
   container ([ecx] = header ptr, header+4 = root); arg = node being
   erased. Splices the node's LEFT child into the node's position:
     node->left := left->right   (0x00415f8c)
     left->right's parent := node when that subtree is non-nil
     left->parent := node->parent
     PATH 0 root:    node == header->root  -> root := left
     PATH 1 right:   node == parent->right -> parent->right := left
     PATH 2 left:    parent->left := left
     common tail:    left->right := node; node->parent := left
   Report-only: graph stores are REPORTED (path + node_left_after +
   parent/left ids); the caller's tree is never touched. */

export const ANM2_TREE_SPLICE_VA = 0x00415f80;
export const ANM2_TREE_SPLICE_END_VA = 0x00415fd7;
export const ANM2_TREE_SPLICE_BODY_BYTES = 0x58;
export const ANM2_TREE_SPLICE_CALLSITE_COUNT = 0;
export const ANM2_TREE_SPLICE_ADDR_TAKEN = 0;
export const ANM2_TREE_SPLICE_PATH_ROOT = 0;
export const ANM2_TREE_SPLICE_PATH_RIGHT_CHILD = 1;
export const ANM2_TREE_SPLICE_PATH_LEFT_CHILD = 2;

/** 0x00415f80 report-only plan (flat-image oracle). */
export function anm2TreeSplicePlan(mem, { container, node }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, container: u32(container), node: u32(node),
    leftChild: 0, parent: 0, nodeLeftAfter: 0,
    path: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(container) === 0 || u32(node) === 0) return plan;
  plan.entered = 1;
  const n = u32(node);
  plan.leftChild = rd32(n);
  plan.parent = rd32(n + 0x4);
  plan.nodeLeftAfter =
    plan.leftChild !== 0 ? rd32(plan.leftChild + 0x8) : 0;

  const header = rd32(u32(container));
  const root = rd32(header + 0x4);
  if (n === root) {
    plan.path = ANM2_TREE_SPLICE_PATH_ROOT;
  } else if (plan.parent !== 0 &&
             n === rd32(plan.parent + 0x8)) {
    plan.path = ANM2_TREE_SPLICE_PATH_RIGHT_CHILD;
  } else {
    plan.path = ANM2_TREE_SPLICE_PATH_LEFT_CHILD;
  }
  return plan;
}

/* ============ v83 unit: 0x00415fe0 _Tree erase-splice RIGHT ===============
   Mirror of the v82 left-splice. Pure-complete plan law (85 B, ret 4
   x3, zero calls). this=ecx = container ([ecx] = header ptr,
   header+4 = root); arg = node being erased. Splices the node's RIGHT
   child into the node's position:
     node->right := right->left   (0x00415fec)
     right->left's parent := node when that subtree is non-nil
     right->parent := node->parent
     PATH 0 root:  node == header->root -> root := right
     PATH 1 left:  node == parent->left -> parent->left := right
     PATH 2 right: parent->right := right
     common tail:  right->left := node; node->parent := right
   Report-only: graph stores are REPORTED; the caller's tree is never
   touched. */

export const ANM2_TREE_SPLICE_R_VA = 0x00415fe0;
export const ANM2_TREE_SPLICE_R_END_VA = 0x00416034;
export const ANM2_TREE_SPLICE_R_BODY_BYTES = 0x55;
export const ANM2_TREE_SPLICE_R_CALLSITE_COUNT = 0;
export const ANM2_TREE_SPLICE_R_ADDR_TAKEN = 0;
export const ANM2_TREE_SPLICE_R_PATH_ROOT = 0;
export const ANM2_TREE_SPLICE_R_PATH_LEFT_CHILD = 1;
export const ANM2_TREE_SPLICE_R_PATH_RIGHT_CHILD = 2;

/** 0x00415fe0 report-only plan (flat-image oracle). */
export function anm2TreeSpliceRPlan(mem, { container, node }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, container: u32(container), node: u32(node),
    rightChild: 0, parent: 0, nodeRightAfter: 0,
    path: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(container) === 0 || u32(node) === 0) return plan;
  plan.entered = 1;
  const n = u32(node);
  plan.rightChild = rd32(n + 0x8);
  plan.parent = rd32(n + 0x4);
  plan.nodeRightAfter =
    plan.rightChild !== 0 ? rd32(plan.rightChild) : 0;

  const header = rd32(u32(container));
  const root = rd32(header + 0x4);
  if (n === root) {
    plan.path = ANM2_TREE_SPLICE_R_PATH_ROOT;
  } else if (plan.parent !== 0 && n === rd32(plan.parent)) {
    plan.path = ANM2_TREE_SPLICE_R_PATH_LEFT_CHILD;
  } else {
    plan.path = ANM2_TREE_SPLICE_R_PATH_RIGHT_CHILD;
  }
  return plan;
}

/* ============ v84-retry: 0x00416440 _Tree lower_bound =====================
   Pure-complete plan law (75 B, ret 8, zero calls). this=ecx =
   container ([ecx] = header ptr); out slot (3 dwords) @ [ebp+8];
   key-slot ptr @ [ebp+0xc], key loaded ONCE.
   Walk: x = header->root; root nil -> immediate return;
   while x NOT nil: visit x; node_key = [x+0x10];
     node_key >=u key -> y := x, flag := 1, x := x->left (+0)
     else             -> flag := 0,        x := x->right (+8)
   Report-only: the caller's out slot ({x, flag, y}) is REPORTED
   field-by-field, never written. */

export const ANM2_TREE_LOWER_BOUND_VA = 0x00416440;
export const ANM2_TREE_LOWER_BOUND_END_VA = 0x0041648c;
export const ANM2_TREE_LOWER_BOUND_BODY_BYTES = 0x4c;
export const ANM2_TREE_LOWER_BOUND_CALLSITE_COUNT = 0;
export const ANM2_TREE_LOWER_BOUND_ADDR_TAKEN = 0;
export const ANM2_TREE_LOWER_BOUND_KEY_OFF = 0x10;
export const ANM2_TREE_LOWER_BOUND_LEFT_OFF = 0x0;
export const ANM2_TREE_LOWER_BOUND_RIGHT_OFF = 0x8;
export const ANM2_TREE_LOWER_BOUND_ISNIL_OFF = 0xd;

/** 0x00416440 report-only plan (flat-image oracle). */
export function anm2TreeLowerBoundPlan(mem, { container, outSlot, keySlot }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const isnil = (a) => (mem[u32(a) + ANM2_TREE_LOWER_BOUND_ISNIL_OFF] !== 0 ? 1 : 0);
  const plan = {
    entered: 0, container: u32(container), outSlot: u32(outSlot),
    keySlot: u32(keySlot), key: 0, root: 0, iterations: 0,
    yNode: 0, lastFlag: 0, finalX: 0, rootIsnilEarly: 0,
    pureComplete: 1, hostCallCount: 0,
  };
  if (u32(container) === 0) return plan;
  plan.container = u32(container);
  plan.outSlot = u32(outSlot);
  plan.keySlot = u32(keySlot);
  const hdr = rd32(u32(container));
  if (hdr === 0) return plan;
  plan.entered = 1;

  plan.root = rd32(hdr + 0x4);
  let x = plan.root;
  const rootIsnil = isnil(x);
  plan.rootIsnilEarly = rootIsnil;
  plan.finalX = x;

  plan.key = u32(keySlot) !== 0 ? rd32(u32(keySlot)) : 0;

  while (rootIsnil === 0) {
    plan.iterations += 1;
    plan.finalX = x;
    const nodeKey = rd32(x + ANM2_TREE_LOWER_BOUND_KEY_OFF);
    if (nodeKey >= plan.key) {
      plan.yNode = x;
      plan.lastFlag = 1;
      x = rd32(x + ANM2_TREE_LOWER_BOUND_LEFT_OFF);
    } else {
      plan.lastFlag = 0;
      x = rd32(x + ANM2_TREE_LOWER_BOUND_RIGHT_OFF);
    }
    if (isnil(x) !== 0) break;
  }
  return plan;
}

/* ===================== v7: ANM2::Load observable store lane ============= */

/* Exact ZHL root: `__thiscall void ANM2::Load(std_string &ANM2Path, bool
   loadgraphics)` at 0x0040bd50 (14 pattern bytes; corroborated at the record-22
…
   hostCallCount = 5 + (filenameSize != 0) + (arg2 & 0xff != 0). */

export const ANM2_LOAD_SHADOW_STR_VA = 0x00b1a6c0;   /* "shadow" */

/* The 0x0040bdf4 strcmp second operand is the literal at 0x00b1a6c0. The
   oracle compares against the literal's BYTES (as the C++ kShadowName does),
   never by reading a PE-address cell out of test scratch memory. */
const ANM2_LOAD_SHADOW_BYTES = [0x73, 0x68, 0x61, 0x64, 0x6f, 0x77, 0]; /* "shadow" */

function anm2LoadShadowEq(mem, nameAddr) {
  const shadow = ANM2_LOAD_SHADOW_BYTES;
  let i = 0; const aAddr = u32(nameAddr);
  for (;;) {
    const d0 = mem[u32(aAddr + i)] & 0xff; const e0 = (shadow[i] ?? 0) & 0xff;
    if (d0 !== e0) return 0;
    if (d0 === 0) return 1;
    const d1 = mem[u32(aAddr + i + 1)] & 0xff; const e1 = (shadow[i + 1] ?? 0) & 0xff;
    if (d1 !== e1) return 0;
    i += 2; if (d1 === 0) return 1;
  }
}
export const ANM2_LOAD_EMPTY_NAME_VA = 0x00b1a4ec;   /* "" (same literal as the v1 empty name) */
export const ANM2_LOAD_STAR_CHAR = 0x2a;             /* '*' */
export const ANM2_LOAD_LAYER_STAR_OR = 5;            /* S4 mask */
export const ANM2_LOAD_BITFLAG_400 = 0x400;          /* S5 */
export const ANM2_LOAD_BITFLAG_800 = 0x800;          /* S6 */
export const ANM2_LOAD_OFF_LAYER_STATE_7C = 0x7c;
export const ANM2_LOAD_OFF_LAYER_COUNT_80 = 0x80;
export const ANM2_LOAD_OFF_EXTRAS_PTR_84 = 0x84;
export const ANM2_LOAD_OFF_EXTRAS_COUNT_88 = 0x88;
export const ANM2_LOAD_OFF_NAME_8 = 0x08;            /* std::string at data+8 */
export const ANM2_LOAD_LAYER_STRIDE = 0xa0;
export const ANM2_LOAD_EXTRA_STRIDE = 0x18;
export const ANM2_LOAD_LAYER_STAR_FLAG_OFF = 0x8c;
export const ANM2_LOAD_HOST_VA_STRING_ASSIGN = 0x0040ccd0;
export const ANM2_LOAD_HOST_VA_CACHE_GUARD = 0x0040db90;
export const ANM2_LOAD_HOST_VA_CACHE_FETCH = 0x0040e110;
export const ANM2_LOAD_HOST_VA_GRAPHICS = 0x0040c000;
/* v52: 0x0040bc90 state anim-key getter (unit anm2-v52-getters). */
export const ANM2_ANIM_KEY_VA = 0x0040bc90;
export const ANM2_ANIM_KEY_END_VA = 0x0040bca1;
export const ANM2_ANIM_KEY_BODY_BYTES = 18;
export const ANM2_ANIM_KEY_DATA_OFF = 0x04;          /* [state+4] _animData */
export const ANM2_ANIM_KEY_RECORD_OFF = 0x138;       /* [animData+0x138] key */
export const ANM2_ANIM_KEY_NULL_RESULT = 0xffffffff; /* or eax,-1 */
export const ANM2_ANIM_KEY_CALLSITE_COUNT = 2;       /* direct e8 census */
/* v53: 0x00407ae0 Isaac::SwapANM2 (unit anm2-v53-swapanm2). EXACT ZHL
   (`558bec0f1002`); 933 B, 0 E8, ret 0x00407e84, 19 lea-corrected callers.
   Field-pair exchange of two 0x114-byte ANM2 images; offsets reuse the v1
   pins where they exist. Companion 0x00407e90 stays HOST (census only). */
export const ANM2_SWAP_VA = 0x00407ae0;
export const ANM2_SWAP_END_VA = 0x00407e84;
export const ANM2_SWAP_BODY_BYTES = 933;
export const ANM2_SWAP_CALLSITE_COUNT = 19;
export const ANM2_SWAP_SSO_BLOCK_BYTES = 24;
export const ANM2_SWAP_COLORMOD_BYTES = 44;
export const ANM2_SWAP_LAYER_OWNER_OFF = 0x04;
export const ANM2_SWAP_STATE_FRAMES_OFF = 0x38;
export const ANM2_SWAP_STATE_NULL_OFF = 0x3c;
export const ANM2_SWAP_STATE_FRAME_OFF = 0x40;
export const ANM2_SWAP_STATE_18_OFF = 0x48;
export const ANM2_SWAP_STATE_1C_OFF = 0x4c;
export const ANM2_SWAP_OVERLAY_DATA_OFF = 0x54;
export const ANM2_SWAP_OVERLAY_FRAMES_OFF = 0x58;
export const ANM2_SWAP_OVERLAY_NULL_OFF = 0x5c;
export const ANM2_SWAP_OVERLAY_FRAME_OFF = 0x60;
export const ANM2_SWAP_OVERLAY_BYTE_OFF = 0x64;
export const ANM2_SWAP_OVERLAY_18_OFF = 0x68;
export const ANM2_SWAP_OVERLAY_1C_OFF = 0x6c;
export const ANM2_SWAP_EXTRAS_PTR_OFF = 0x84;
export const ANM2_SWAP_EXTRAS_COUNT_OFF = 0x88;
export const ANM2_SWAP_EXTRAS_PTR2_OFF = 0x8c;
export const ANM2_SWAP_EXTRAS_COUNT2_OFF = 0x90;
export const ANM2_LOAD_GRAPHICS_FLAG_OFF = 0x30;
export const ANM2_LOAD_GRAPHICS_CLEAR_OFF = 0x31;
export const ANM2_LOAD_GRAPHICS_LOAD_IMAGE_VA = 0x009588a0;
export const ANM2_LOAD_GRAPHICS_SEH_FRAME = 0x00af0cc5;
export const ANM2_LOAD_GRAPHICS_CTOR_ANIM = 0x0040c550;
export const ANM2_LOAD_GRAPHICS_CTOR_LAYER = 0x0040c4a0;
export const ANM2_LOAD_GRAPHICS_APPLY_ANIM = 0x0040e520;
export const ANM2_LOAD_GRAPHICS_APPLY_LAYER = 0x0040e740;
export const ANM2_LOAD_GRAPHICS_GET_LAYER = 0x00408590;
export const ANM2_LOAD_GRAPHICS_SET_ANIM = 0x00408640;

/**
 * 0x0040bd50 ANM2::Load — the pure observable store lane (S1..S6) plus the
…
 */
export function anm2LoadPlan(mem, { anm2Addr, loadGraphics }) {
  const plan = {
    entered: 0, latchOff: ANM2_OFF_LOADED_PAIR_108 + 1, latchValue: 1,
    slot10cUncond: 0, slot10cUncondValue: -1, shadowIndex: -1, shadowSet: 0,
    starLayerCount: 0, starLayerFirst: -1, starExtraCount: 0, starExtraFirst: -1,
    bitflagsOr400: 0, bitflagsOr800: 0, bitflagsOff: ANM2_OFF_BITFLAGS_110,
    starFlagOff: ANM2_LOAD_LAYER_STAR_FLAG_OFF, layerStride: ANM2_LOAD_LAYER_STRIDE,
    extraStride: ANM2_LOAD_EXTRA_STRIDE, layerCount: 0, extraCount: 0, filenameSize: 0,
    graphicsLoaded: 0, shadowStrVa: ANM2_LOAD_SHADOW_STR_VA, hostCallCount: 0,
    layersGuest: 0, extrasGuest: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1; plan.slot10cUncond = 1;
  const a = u32(anm2Addr);
  plan.filenameSize = readU32(mem, a + ANM2_OFF_FILENAME_SIZE_10);
  plan.layerCount = readU32(mem, a + ANM2_LOAD_OFF_LAYER_COUNT_80);
  plan.extraCount = readU32(mem, a + ANM2_LOAD_OFF_EXTRAS_COUNT_88);
  plan.layersGuest = readU32(mem, a + ANM2_LOAD_OFF_LAYER_STATE_7C);
  plan.extrasGuest = readU32(mem, a + ANM2_LOAD_OFF_EXTRAS_PTR_84);
  plan.graphicsLoaded = ((loadGraphics | 0) & 0xff) !== 0 ? 1 : 0;
  plan.hostCallCount = 5 + (plan.filenameSize !== 0 ? 1 : 0) + plan.graphicsLoaded;
  let shadow = -1, starFirst = -1, starCount = 0;
  if (plan.layerCount !== 0) {
    for (let i = 0; u32(i) < u32(plan.layerCount); i++) {
      const layer = u32(plan.layersGuest + u32(Math.imul(i, ANM2_LOAD_LAYER_STRIDE)));
      const data = readU32(mem, layer);
      if (data === 0) {
        /* empty name vs "shadow" never matches; first char 0 is not '*' */
      } else {
        const nameAddr = anm2SsoDataAddr(mem, u32(data + ANM2_LOAD_OFF_NAME_8));
        if (anm2LoadShadowEq(mem, nameAddr)) shadow = i32(i);
        if ((mem[nameAddr] & 0xff) === ANM2_LOAD_STAR_CHAR) {
          starCount += 1; if (starFirst < 0) starFirst = i32(i);
        }
      }
    }
  }
  plan.shadowIndex = shadow; plan.shadowSet = shadow >= 0 ? 1 : 0;
  plan.starLayerCount = starCount; plan.starLayerFirst = starFirst;
  plan.bitflagsOr400 = starCount > 0 ? 1 : 0;
  let extraFirst = -1, extraStar = 0;
  if (plan.extraCount !== 0) {
    for (let k = 0; u32(k) < u32(plan.extraCount); k++) {
      const elem = u32(plan.extrasGuest + u32(Math.imul(k, ANM2_LOAD_EXTRA_STRIDE)));
      const nameAddr = anm2SsoDataAddr(mem, elem);
      if ((mem[nameAddr] & 0xff) === ANM2_LOAD_STAR_CHAR) {
        extraStar += 1; if (extraFirst < 0) extraFirst = i32(k);
      }
    }
  }
  plan.starExtraCount = extraStar; plan.starExtraFirst = extraFirst;
  plan.bitflagsOr800 = extraStar > 0 ? 1 : 0;
  return plan;
}

/**
 * Applies S1..S6 into the images. S4 needs the full star-layer index list, so
…
 */
export function anm2LoadApply(mem, { anm2Addr, loadGraphics }) {
  const plan = anm2LoadPlan(mem, { anm2Addr, loadGraphics });
  if (u32(anm2Addr) === 0) return plan;
  const a = u32(anm2Addr);
  writeBytes(mem, a + ANM2_OFF_LOADED_PAIR_108 + 1, 1, 1);
  writeBytes(mem, a + ANM2_OFF_UNNAMED_10C, 0xffffffff, 4);
  if (plan.shadowIndex >= 0) writeBytes(mem, a + ANM2_OFF_UNNAMED_10C, plan.shadowIndex, 4);
  if (plan.bitflagsOr400) {
    writeBytes(mem, a + ANM2_OFF_BITFLAGS_110, readU32(mem, a + ANM2_OFF_BITFLAGS_110) | ANM2_LOAD_BITFLAG_400, 4);
    for (let i = 0; u32(i) < u32(plan.layerCount); i++) {
      const layer = u32(plan.layersGuest + u32(Math.imul(i, ANM2_LOAD_LAYER_STRIDE)));
      const data = readU32(mem, layer);
      if (data === 0) continue;
      const nameAddr = anm2SsoDataAddr(mem, u32(data + ANM2_LOAD_OFF_NAME_8));
      if ((mem[nameAddr] & 0xff) === ANM2_LOAD_STAR_CHAR) {
        writeBytes(mem, layer + ANM2_LOAD_LAYER_STAR_FLAG_OFF,
          readU32(mem, layer + ANM2_LOAD_LAYER_STAR_FLAG_OFF) | ANM2_LOAD_LAYER_STAR_OR, 4);
      }
    }
  }
  if (plan.bitflagsOr800) {
    writeBytes(mem, a + ANM2_OFF_BITFLAGS_110, readU32(mem, a + ANM2_OFF_BITFLAGS_110) | ANM2_LOAD_BITFLAG_800, 4);
  }
  return plan;
}

/* -------- v51: ANM2::Load (0x0040bd50) frame laws (unit anm2-v51-load-depth;
   model twins of isaac_anm2_load_* scalar exports; exact PE gates) -------- */

/** PE 0x0040bd59 cmp dword [esi+0x10],0 / je — FULL-DWORD. */
export function anm2LoadPathPresent(filenameSize) {
  return u32(filenameSize) !== 0 ? 1 : 0;
}

/** PE 0x0040bd68 cmp esi,edi / je — ADDRESS equality. */
export function anm2LoadPathIsSelf(thisAddr, pathAddr) {
  return u32(thisAddr) === u32(pathAddr) ? 1 : 0;
}

/** PE 0x0040bd8e cmp byte [ebp+0xc],0 / je — LOW-BYTE (0x100 skipped). */
export function anm2LoadGraphicsNeeded(loadGraphics) {
  return (u32(loadGraphics) & 0xff) !== 0 ? 1 : 0;
}

/** Composed PE-order law: 4 unconditional + !self + present + graphics. */
export function anm2LoadFrameHostCalls(filenameSize, thisAddr, pathAddr, loadGraphics) {
  return 4 +
    (anm2LoadPathIsSelf(thisAddr, pathAddr) === 0 ? 1 : 0) +
    anm2LoadPathPresent(filenameSize) +
    anm2LoadGraphicsNeeded(loadGraphics);
}

/** Caller one-shot arm gate 0x0082ee9e: latch low byte CLEAR -> ready. */
export function anm2LoadLatchReady(latch) {
  return (u32(latch) & 0xff) === 0 ? 1 : 0;
}

/** S1 0x0040bdb2 BYTE store: high pre bits preserved (unsigned result). */
export function anm2LoadLatchStoreValue(latchPre) {
  return u32((u32(latchPre) & 0xffffff00) | 1);
}

/** PE 0x0040bdd4..0x0040bdef: layer name SSO walk with the null-LayerData
    guard (-> empty literal 0x00b1a4ec). Returns the guest name address. */
export function anm2LoadLayerNameAddr(mem, anm2Addr, layerIndex) {
  anm2Addr = u32(anm2Addr);
  if (anm2Addr === 0) return 0;
  const base = readU32(mem, anm2Addr + ANM2_LOAD_OFF_LAYER_STATE_7C);
  const layer = u32(base + u32(Math.imul(u32(layerIndex), ANM2_LOAD_LAYER_STRIDE)));
  const data = readU32(mem, layer);
  if (data === 0) return ANM2_LOAD_EMPTY_NAME_VA;
  return anm2SsoDataAddr(mem, u32(data + ANM2_LOAD_OFF_NAME_8));
}

/** PE 0x0040be6d..0x0040be73: extras name SSO walk, NO null guard. */
export function anm2LoadExtraNameAddr(mem, anm2Addr, extraIndex) {
  anm2Addr = u32(anm2Addr);
  if (anm2Addr === 0) return 0;
  const base = readU32(mem, anm2Addr + ANM2_LOAD_OFF_EXTRAS_PTR_84);
  const elem = u32(base + u32(Math.imul(u32(extraIndex), ANM2_LOAD_EXTRA_STRIDE)));
  return anm2SsoDataAddr(mem, elem);
}

/** PE 0x0040bdf4: two-byte strcmp vs the 0x00b1a6c0 literal. */
export function anm2LoadNameIsShadow(mem, nameAddr) {
  nameAddr = u32(nameAddr);
  if (nameAddr === 0) return 0;
  return anm2LoadShadowEq(mem, nameAddr) ? 1 : 0;
}

/** PE 0x0040be31 / 0x0040be7d: first char equals '*'. */
export function anm2LoadNameIsStar(mem, nameAddr) {
  nameAddr = u32(nameAddr);
  if (nameAddr === 0) return 0;
  return (mem[nameAddr] & 0xff) === ANM2_LOAD_STAR_CHAR ? 1 : 0;
}

/* -------- v52: 0x0040bc90 state->animData key getter (unit
   anm2-v52-getters; model twin of isaac_anm2_state_anim_key_dword) -------- */

/** PE 0x0040bc90..0x0040bca1: mov eax,[ecx+4]; test; jne +5; or eax,-1; ret;
    mov eax,[eax+0x138]; ret — 0 E8 / 0 stores. [state+4] is the state's
    _animData (ANM2+0x34 gate field); null -> 0xffffffff (or eax,-1); else
    the RAW first dword of the anim-record SSO key string at +0x138 (no cap
    decode in this body). Unsigned result (wasm i32 compared with >>>0). */
export function anm2StateAnimKeyDword(mem, stateAddr) {
  stateAddr = u32(stateAddr);
  const anim = readU32(mem, stateAddr + ANM2_STATE_OFF_ANIM_DATA_04);
  if (anim === 0) return 0xffffffff;
  return readU32(mem, anim + ANM2_ANIM_KEY_RECORD_OFF);
}

/* -------- v53: 0x00407ae0 Isaac::SwapANM2 (unit anm2-v53-swapanm2;
   model twin of isaac_anm2_swap_anm2) -------- */

/** PE 0x00407ae0..0x00407e85: pure field-pair exchange of two 0x114-byte
    ANM2 images (left<ecx>/right<edx>), 0 E8, in the machine's field order.
    Byte fields exchange with 8-bit stores (values masked & 0xff). The 24-
    byte SSO blocks and the 44-byte ColorMod blocks swap as whole blocks;
    the ColorMod copy is guarded (left == right -> identity). NOT swapped:
    0x30/0x50 state headers, 0x70..0x73, 0x94/0x98 _offset, 0x102/0x103,
    0x10a/0x10b padding. Layer back-pointer loops (0x407e30..0x407e7c):
    for i in [0, count): [layers + i*0xa0 + 4] = owner — UNSIGNED bounds,
    array AND count re-read EVERY iteration. Mutates `mem` in place (no
    return). */
export function anm2SwapAnm2(mem, leftAddr, rightAddr) {
  leftAddr = u32(leftAddr);
  rightAddr = u32(rightAddr);

  const swapDword = (off) => {
    const lv = readU32(mem, u32(leftAddr + off));
    const rv = readU32(mem, u32(rightAddr + off));
    writeBytes(mem, u32(leftAddr + off), rv, 4);
    writeBytes(mem, u32(rightAddr + off), lv, 4);
  };
  const swapByte = (off) => {
    const lv = readU32(mem, u32(leftAddr + off)) & 0xff;
    const rv = readU32(mem, u32(rightAddr + off)) & 0xff;
    writeBytes(mem, u32(leftAddr + off), rv, 1);
    writeBytes(mem, u32(rightAddr + off), lv, 1);
  };
  const swapBlock = (off, len) => {
    const saved = [];
    for (let k = 0; k < len; k++) saved.push(mem[u32(leftAddr + off + k)]);
    for (let k = 0; k < len; k++) mem[u32(leftAddr + off + k)] = mem[u32(rightAddr + off + k)];
    for (let k = 0; k < len; k++) mem[u32(rightAddr + off + k)] = saved[k];
  };
  const swapColormod = (off) => {
    const saved = [];
    for (let k = 0; k < ANM2_SWAP_COLORMOD_BYTES; k++) {
      saved.push(mem[u32(leftAddr + off + k)]);
    }
    if (u32(leftAddr + off) !== u32(rightAddr + off)) {
      for (let k = 0; k < ANM2_SWAP_COLORMOD_BYTES; k++) {
        mem[u32(leftAddr + off + k)] = mem[u32(rightAddr + off + k)];
      }
    }
    for (let k = 0; k < ANM2_SWAP_COLORMOD_BYTES; k++) {
      mem[u32(rightAddr + off + k)] = saved[k];
    }
  };
  const layerOwners = (img, selfAddr) => {
    let i = 0;
    let n = readU32(mem, u32(img + ANM2_OFF_LAYER_COUNT_80));
    while (u32(i) < u32(n)) {
      const arr = readU32(mem, u32(img + ANM2_OFF_LAYER_STATE_7C));
      i = u32(i + 1);
      writeBytes(mem,
        u32(arr + u32(Math.imul(u32(i - 1), ANM2_LAYER_STATE_STRIDE)) +
            ANM2_SWAP_LAYER_OWNER_OFF),
        selfAddr, 4);
      n = readU32(mem, u32(img + ANM2_OFF_LAYER_COUNT_80));
    }
  };

  /* 1. SSO string blocks. */
  swapBlock(ANM2_OFF_FILENAME_STR_00, ANM2_SWAP_SSO_BLOCK_BYTES);
  swapBlock(ANM2_OFF_ANIM_NAME_STR_18, ANM2_SWAP_SSO_BLOCK_BYTES);

  /* 2. Primary AnimationState (0x30 header NOT swapped). */
  swapDword(ANM2_OFF_ANIM_DATA_PTR_34);
  swapDword(ANM2_SWAP_STATE_FRAMES_OFF);
  swapDword(ANM2_SWAP_STATE_NULL_OFF);
  swapDword(ANM2_SWAP_STATE_FRAME_OFF);
  swapByte(ANM2_OFF_PLAYING_FLAG_44);
  swapDword(ANM2_SWAP_STATE_18_OFF);
  swapDword(ANM2_SWAP_STATE_1C_OFF);

  /* 3. Overlay AnimationState (0x50 header NOT swapped). */
  swapDword(ANM2_SWAP_OVERLAY_DATA_OFF);
  swapDword(ANM2_SWAP_OVERLAY_FRAMES_OFF);
  swapDword(ANM2_SWAP_OVERLAY_NULL_OFF);
  swapDword(ANM2_SWAP_OVERLAY_FRAME_OFF);
  swapByte(ANM2_SWAP_OVERLAY_BYTE_OFF);
  swapDword(ANM2_SWAP_OVERLAY_18_OFF);
  swapDword(ANM2_SWAP_OVERLAY_1C_OFF);

  /* 4. Anim pointers / counts / extras quads (0x70..0x73 NOT swapped). */
  swapDword(ANM2_OFF_ANIM_DATA_74);
  swapDword(ANM2_OFF_ANIM_COUNT_78);
  swapDword(ANM2_OFF_LAYER_STATE_7C);
  swapDword(ANM2_OFF_LAYER_COUNT_80);
  swapDword(ANM2_SWAP_EXTRAS_PTR_OFF);
  swapDword(ANM2_SWAP_EXTRAS_COUNT_OFF);
  swapDword(ANM2_SWAP_EXTRAS_PTR2_OFF);
  swapDword(ANM2_SWAP_EXTRAS_COUNT2_OFF);

  /* 5. Scale vector + rotation (0x94/0x98 _offset NOT swapped). */
  swapDword(ANM2_OFF_SCALE_9C);
  swapDword(u32(ANM2_OFF_SCALE_9C + 4));
  swapDword(ANM2_OFF_ROTATION_A4);

  /* 6. ColorMod pair. */
  swapColormod(ANM2_OFF_COLOR_A8);
  swapColormod(ANM2_OFF_CHAMPION_COLOR_D4);

  /* 7. Tail bytes/dwords. */
  swapByte(ANM2_OFF_FLIP_PAIR_100);
  swapByte(u32(ANM2_OFF_FLIP_PAIR_100 + 1));
  swapDword(ANM2_OFF_PLAYBACK_SPEED_104);
  swapByte(ANM2_OFF_LOADED_PAIR_108);
  swapByte(ANM2_OFF_LOADED_BYTE_109);
  swapDword(ANM2_OFF_UNNAMED_10C);
  swapDword(ANM2_OFF_BITFLAGS_110);

  /* 8. Layer owner fix-up (left loop, then right). */
  layerOwners(leftAddr, leftAddr);
  layerOwners(rightAddr, rightAddr);
}

/* ===================== v2: AnimationState advance / apply ================= */

export const ANM2_STATE_OFF_ANIMATION_00 = 0x00;
export const ANM2_STATE_OFF_ANIM_DATA_04 = 0x04;
export const ANM2_STATE_OFF_LAYER_FRAMES_08 = 0x08;
export const ANM2_STATE_OFF_NULL_FRAMES_0C = 0x0c;
export const ANM2_STATE_OFF_ANIM_FRAME_10 = 0x10;
export const ANM2_STATE_OFF_CLEARED_18 = 0x18;
export const ANM2_DATA_OFF_LAYER_COUNT_1C = 0x1c;
export const ANM2_DATA_OFF_SECOND_COUNT_24 = 0x24;
export const ANM2_DATA_OFF_LENGTH_30 = 0x30;
export const ANM2_FRAME_SLOT_SIZE = 4;
export const ANM2_STATE_MEMSET_FILL = 0xff;

export const ANM2_HOST_VA_ADVANCE = 0x00408e00;
export const ANM2_HOST_VA_ADVANCE_PRE = 0x00408c90;
export const ANM2_HOST_VA_LAYER_BODY = 0x00408b90;
export const ANM2_HOST_VA_NULL_BODY = 0x00408c10;
export const ANM2_HOST_VA_ALLOC = 0x00a648b0;
export const ANM2_HOST_VA_MEMSET = 0x00af05e5;
export const ANM2_IAT_VA_NEXTAFTERF = 0x00b18838;
export const ANM2_ADVANCE_LOG_LEVEL = 0x10;
export const ANM2_ADVANCE_LOG_STR_VA = 0x00b1a4f0;

export const ANM2_WALK_LAYER = 0;
export const ANM2_WALK_NULL = 1;

const bitScratch = new DataView(new ArrayBuffer(8));
function bitsToF32(bits) {
  bitScratch.setUint32(0, u32(bits), true);
  return bitScratch.getFloat32(0, true);
}
function f32ToBits(value) {
  bitScratch.setFloat32(0, Math.fround(value), true);
  return bitScratch.getUint32(0, true);
}

/** True for everything except a NaN encoding: those are the values for which
 *  the magnitude step below really is the standard's answer. An infinity
 *  qualifies (its neighbour toward zero is the largest finite value). The
 *  machine only ever arrives here through an integer conversion, so it stays
 *  well inside this domain. */
/**
 * 0x0040c000 ANM2::LoadGraphics — the pure observable store lane.
…
 */
export function anm2LoadGraphicsPlan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, layerCount: 0, layersGuest: 0, processedCount: 0,
    processedFirst: -1, processedLast: -1, layerStride: ANM2_LOAD_LAYER_STRIDE,
    loadFlagOff: ANM2_LOAD_GRAPHICS_FLAG_OFF, clearFlagOff: ANM2_LOAD_GRAPHICS_CLEAR_OFF,
    loadImageVa: ANM2_LOAD_GRAPHICS_LOAD_IMAGE_VA, hostCallCount: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const a = u32(anm2Addr);
  const count = readU32(mem, a + ANM2_LOAD_OFF_LAYER_COUNT_80);
  plan.layerCount = count;
  if (count === 0) return plan;
  let base = 0, first = -1, last = -1, processed = 0;
  for (let i = 0; u32(i) < u32(count); i++) {
    base = readU32(mem, a + ANM2_LOAD_OFF_LAYER_STATE_7C);
    const layer = u32(base + u32(Math.imul(i, ANM2_LOAD_LAYER_STRIDE)));
    if ((mem[u32(layer + ANM2_LOAD_GRAPHICS_FLAG_OFF)] & 0xff) === 0) {
      if (first < 0) first = i32(i);
      last = i32(i); processed += 1;
    }
  }
  plan.layersGuest = base; plan.processedFirst = first; plan.processedLast = last;
  plan.processedCount = processed; plan.hostCallCount = processed;
  return plan;
}

/**
 * Re-walks the images like the PE (base re-read per iteration, u32 wrap,
…
 */
export function anm2LoadGraphicsApply(mem, { anm2Addr, flagsAddr }) {
  const plan = anm2LoadGraphicsPlan(mem, { anm2Addr });
  if (u32(anm2Addr) === 0 || u32(flagsAddr) === 0) return plan;
  let k = 0; const a = u32(anm2Addr);
  for (let i = 0; u32(i) < u32(plan.layerCount); i++) {
    const base = readU32(mem, a + ANM2_LOAD_OFF_LAYER_STATE_7C);
    const layer = u32(base + u32(Math.imul(i, ANM2_LOAD_LAYER_STRIDE)));
    if ((mem[u32(layer + ANM2_LOAD_GRAPHICS_FLAG_OFF)] & 0xff) === 0) {
      const flag = mem[u32(flagsAddr + k)] & 0xff;
      writeBytes(mem, layer + ANM2_LOAD_GRAPHICS_FLAG_OFF, flag !== 0 ? 1 : 0, 1);
      writeBytes(mem, layer + ANM2_LOAD_GRAPHICS_CLEAR_OFF, 0, 1);
      k += 1;
    }
  }
  return plan;
}

/* ==================== v9: 0x0040bea0 ANM2::Reload (gate + recipes) ======= */

/* Reload constants (v9; re-verified with identify-zhl-address.mjs —
   0x0040bea0 is an EXACT 10-byte ZHL match for ANM2::Reload; the three
   callees have no exact match and stay address-stable). */
export const ANM2_RELOAD_VA = 0x0040bea0;
export const ANM2_RELOAD_GATE_OFF = 0x10; /* _filename std::string size */
export const ANM2_RELOAD_CALL0_VA = 0x0040db90; /* cache guard, no ZHL */
export const ANM2_RELOAD_CALL0_ARGC = 2;
export const ANM2_RELOAD_CALL1_VA = 0x0040e110; /* cache fetch, no ZHL */
export const ANM2_RELOAD_CALL1_ARGC = 1;
export const ANM2_RELOAD_CALL2_VA = 0x0040c000; /* LoadGraphics, no ZHL */
export const ANM2_RELOAD_CALL2_ARGC = 1; /* DEAD: [ebp+8] never read */
export const ANM2_RELOAD_CALL_COUNT = 3;

/**
 * The whole 32-byte body of 0x0040bea0 as a pure decision + typed call
…
 */
export function anm2ReloadPlan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, gate: 0, gateOff: ANM2_RELOAD_GATE_OFF, callCount: 0, hostCallCount: 0,
    call0Va: ANM2_LOAD_HOST_VA_CACHE_GUARD, call0Argc: ANM2_RELOAD_CALL0_ARGC,
    call1Va: ANM2_LOAD_HOST_VA_CACHE_FETCH, call1Argc: ANM2_RELOAD_CALL1_ARGC,
    call2Va: ANM2_LOAD_HOST_VA_GRAPHICS, call2Argc: ANM2_RELOAD_CALL2_ARGC,
    receiversAnm2: 1, argsAnm2: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  if (readU32(mem, u32(anm2Addr) + ANM2_OFF_FILENAME_SIZE_10) !== 0) {
    plan.gate = 1; plan.callCount = ANM2_RELOAD_CALL_COUNT; plan.hostCallCount = ANM2_RELOAD_CALL_COUNT;
  }
  return plan;
}

export function anm2NextTowardZeroDomainOk(xBits) {
  return (u32(xBits) & 0x7fffffff) <= 0x7f800000;
}

/**
 * Step one representable value closer to zero.
…
 */
export function anm2NextTowardZeroF32Bits(xBits) {
  xBits = u32(xBits);
  const mag = xBits & 0x7fffffff;
  if (mag > 0x7f800000) return xBits;
  if (mag === 0) return 0;
  return ((xBits & 0x80000000) | (mag - 1)) >>> 0;
}

/**
 * The machine's single-precision minimum keeps its first operand only when the
…
 */
export function anm2MinssBits(dstBits, memBits) {
  return bitsToF32(dstBits) < bitsToF32(memBits) ? u32(dstBits) : u32(memBits);
}

/** Clamp the requested frame to just inside the animation length. */
export function anm2FrameClampBits(length30, incomingBits) {
  const x = Math.fround(i32(length30));
  return anm2MinssBits(anm2NextTowardZeroF32Bits(f32ToBits(x)), incomingBits);
}

export function anm2AdvanceStorePlan(length30, incomingBits) {
  return {
    clampedBits: anm2FrameClampBits(length30, incomingBits), cleared18: 0,
    preWalkHostVa: ANM2_HOST_VA_ADVANCE_PRE, storeFrameOff: ANM2_STATE_OFF_ANIM_FRAME_10,
    storeClearedOff: ANM2_STATE_OFF_CLEARED_18,
  };
}

/** The loop is entered unless the count is exactly zero; the test is unsigned,
 *  so a count that looks negative still enters. */
export function anm2AdvanceWalkEnter(count) {
  return u32(count) !== 0;
}

/** Inside the loop the same count is read as a signed quantity. */
export function anm2AdvanceInnerOk(animDataNull, index, count) {
  if (i32(animDataNull) !== 0) return false;
  if (i32(index) < 0) return false;
  return i32(index) < i32(count);
}

/** The step-back test is unsigned again, against a freshly re-derived count. */
export function anm2AdvanceWalkContinue(nextIndex, countReloaded) {
  return u32(nextIndex) < u32(countReloaded);
}

/**
 * One iteration of either frame walk. The diagnostic is advisory: it does not
 * skip the slot store or the body call.
 */
export function anm2AdvanceWalkPlan({
  which = ANM2_WALK_LAYER, animDataNull = 0, index = 0, count = 0, countReloaded = 0,
} = {}) {
  const enter = !!anm2AdvanceWalkEnter(count);
  const inner = !!anm2AdvanceInnerOk(animDataNull, index, count);
  return {
    enter, innerOk: inner, logNeeded: !inner, bodyRuns: enter,
    logVa: ANM2_HOST_VA_LOG, logLevel: ANM2_ADVANCE_LOG_LEVEL, logStrVa: ANM2_ADVANCE_LOG_STR_VA,
    slotByteOffset: u32(Math.imul(i32(index), ANM2_FRAME_SLOT_SIZE)),
    bodyVa: which === ANM2_WALK_NULL ? ANM2_HOST_VA_NULL_BODY : ANM2_HOST_VA_LAYER_BODY,
    continueLoop: !!anm2AdvanceWalkContinue(u32(i32(index) + 1), countReloaded),
  };
}

/** Byte count requested from the allocator: four bytes per slot, pinned to the
 *  largest representable value if that product does not fit. */
export function anm2StateAllocSize(count) {
  const wide = BigInt(u32(count)) * 4n;
  const high = Number(wide >> 32n);
  const low = Number(wide & 0xffffffffn);
  return high !== 0 ? 0xffffffff : u32(low);
}

/** Byte count handed to the fill: the same product, allowed to wrap. */
export function anm2StateMemsetSize(count) {
  return u32(u32(count) * 4);
}

export function anm2StateSizeDisagrees(count) {
  return anm2StateAllocSize(count) !== anm2StateMemsetSize(count);
}

/**
 * @param {object} opts every field is a separate observation of guest memory,
 *   because the routine re-reads the descriptor pointer and both counts around
 *   its allocator calls.
 */
export function anm2StateApplyPlan({
  layerFrames08 = 0, nullFrames0c = 0, dataNullInitial = 0,
  layerCountAlloc = 0, layerCountMemset = 0, dataNullAfterFirst = 0,
  nullCountAlloc = 0, nullCountMemset = 0,
} = {}) {
  const freeLayer = i32(layerFrames08) !== 0;
  const freeNull = i32(nullFrames0c) !== 0;
  const dataOk = i32(dataNullInitial) === 0;
  const allocLayer = dataOk && u32(layerCountAlloc) !== 0;
  let secondOk;
  if (!dataOk) secondOk = false;
  else if (allocLayer) secondOk = i32(dataNullAfterFirst) === 0;
  else secondOk = true;
  const allocNull = secondOk && u32(nullCountAlloc) !== 0;
  return {
    freeLayerFrames: freeLayer, freeNullFrames: freeNull,
    allocLayer, allocLayerSize: allocLayer ? anm2StateAllocSize(layerCountAlloc) : 0,
    memsetLayerSize: allocLayer ? anm2StateMemsetSize(layerCountMemset) : 0,
    allocNull, allocNullSize: allocNull ? anm2StateAllocSize(nullCountAlloc) : 0,
    memsetNullSize: allocNull ? anm2StateMemsetSize(nullCountMemset) : 0,
    memsetFill: ANM2_STATE_MEMSET_FILL,
    hostCallCount: (freeLayer ? 1 : 0) + (freeNull ? 1 : 0) + (allocLayer ? 2 : 0) + (allocNull ? 2 : 0),
  };
}

/* ===================== v3: apply epilogue + 0x00408970 ==================== */

export const ANM2_STATE_OFF_TAIL_BYTE_14 = 0x14;
export const ANM2_STATE_OFF_TAIL_18 = 0x18;
export const ANM2_STATE_OFF_TAIL_1C = 0x1c;
export const ANM2_STATE_APPLY_TAIL_FRAME_BITS = 0xbf800000;
export const ANM2_HOST_VA_MEMCPY = 0x00af05df;
export const ANM2_IAT_VA_MEMSET = 0x00b1875c;
export const ANM2_IAT_VA_MEMCPY = 0x00b18760;
export const ANM2_IAT_VA_FREE = 0x00b187dc;
export const ANM2_SEH_FRAME_APPLY_VA = 0x00af0b60;
export const ANM2_SEH_FRAME_APPLY_ALT_VA = 0x00af0b80;
export const ANM2_ALLOC_COUNTER_HEAD_VA = 0x00c7de78;
export const ANM2_ALLOC_COUNTER_HEAD_OFF = 0x30;
export const ANM2_ALLOC_COUNTER_FIXED_VA = 0x00c7f618;
export const ANM2_ALLOC_BLOCK_HEADER_BIAS = 4;
export const ANM2_ALT_ARM_LAYER = 0;
export const ANM2_ALT_ARM_NULL = 1;
export const ANM2_ALT_STORE_SLOT_OFF = 0x08;

/**
 * The four writes that close 0x00408830 on every exit, described as a write
…
 */
export function anm2StateApplyTailWrites() {
  return [
    { off: ANM2_STATE_OFF_ANIM_FRAME_10, width: 4, value: ANM2_STATE_APPLY_TAIL_FRAME_BITS },
    { off: ANM2_STATE_OFF_TAIL_BYTE_14, width: 1, value: 0 },
    { off: ANM2_STATE_OFF_TAIL_18, width: 4, value: 0 },
    { off: ANM2_STATE_OFF_TAIL_1C, width: 4, value: 0 },
  ];
}

/** Apply those writes to a Uint8Array at `base`. A null base is a no-op. */
export function anm2StateApplyTailFields(mem, base) {
  base = u32(base);
  if (base === 0) return;
  for (const w of anm2StateApplyTailWrites()) writeBytes(mem, u32(base + w.off), w.value, w.width);
}

/**
 * Where the allocator's running byte total lives. A published heap head moves
…
 */
export function anm2AllocCounterBlock(counterHead) {
  return u32(counterHead) === 0 ? ANM2_ALLOC_COUNTER_FIXED_VA : u32(u32(counterHead) + ANM2_ALLOC_COUNTER_HEAD_OFF);
}

/** A count field is only consulted when its descriptor exists. */
export function anm2StateAltCount(dataNull, rawCount) {
  return i32(dataNull) !== 0 ? 0 : i32(rawCount);
}

/** Growing the buffer requires a positive count as a *signed* quantity. */
export function anm2StateAltReallocPath(newCount) {
  return i32(newCount) > 0;
}

/** Carrying the old contents over is likewise gated on a signed positive. */
export function anm2StateAltMemcpyNeeded(oldCount) {
  return i32(oldCount) > 0;
}

/** ...and its length is four bytes per OLD slot, wrapped, never capped. */
export function anm2StateAltMemcpySize(oldCount) {
  return u32(Math.imul(i32(oldCount), 4));
}

/**
 * One array of 0x00408970.
…
 */
export function anm2StateAltArmPlan({
  which = ANM2_ALT_ARM_LAYER, oldCount = 0, newCount = 0, slotPtr = 0, counterHead = 0,
} = {}) {
  const equal = i32(oldCount) === i32(newCount);
  const reallocPath = (!equal) && anm2StateAltReallocPath(newCount);
  const freePath = (!equal) && !reallocPath;
  const slotLive = u32(slotPtr) !== 0;
  const wrapperFreeCall = freePath && slotLive;
  const releaseOld = reallocPath && slotLive;
  const slotZeroed = wrapperFreeCall || (releaseOld && which === ANM2_ALT_ARM_NULL);
  const memcpyNeeded = reallocPath && anm2StateAltMemcpyNeeded(oldCount);
  return {
    countsEqual: equal, freePath, reallocPath, wrapperFreeCall, slotZeroed,
    allocSize: reallocPath ? anm2StateAllocSize(newCount) : 0,
    memsetSize: reallocPath ? anm2StateMemsetSize(newCount) : 0,
    memcpyNeeded, memcpySize: memcpyNeeded ? anm2StateAltMemcpySize(oldCount) : 0,
    releaseOld, counterBlock: anm2AllocCounterBlock(counterHead),
    releaseFreePtr: releaseOld ? u32(u32(slotPtr) - ANM2_ALLOC_BLOCK_HEADER_BIAS) : 0,
    storeSlotOff: reallocPath ? ANM2_ALT_STORE_SLOT_OFF : 0,
    hostCallCount: (wrapperFreeCall ? 1 : 0) + (reallocPath ? 2 : 0) + (memcpyNeeded ? 1 : 0) + (releaseOld ? 1 : 0),
  };
}

/**
 * The whole of 0x00408970.
…
 */
export function anm2StateApplyAltPlan({
  oldDataNull = 0, oldLayerCountRaw = 0, oldSecondCountRaw = 0,
  newDataNull = 0, newLayerCountRaw = 0, newSecondCountRaw = 0,
  slot08 = 0, slot0c = 0, alloc0Result = 0, alloc1Result = 0, newDataPtr = 0, counterHead = 0,
} = {}) {
  const oldLayer = anm2StateAltCount(oldDataNull, oldLayerCountRaw);
  const newLayer = anm2StateAltCount(newDataNull, newLayerCountRaw);
  const oldSecond = anm2StateAltCount(oldDataNull, oldSecondCountRaw);
  const newSecond = anm2StateAltCount(newDataNull, newSecondCountRaw);
  const arm0 = anm2StateAltArmPlan({ which: ANM2_ALT_ARM_LAYER, oldCount: oldLayer, newCount: newLayer, slotPtr: slot08, counterHead });
  const arm1 = anm2StateAltArmPlan({ which: ANM2_ALT_ARM_NULL, oldCount: oldSecond, newCount: newSecond, slotPtr: slot0c, counterHead });
  let v08 = u32(slot08); let v0c = u32(slot0c); let clobbered = 0;
  if (arm0.wrapperFreeCall) v08 = 0;
  else if (arm0.reallocPath) v08 = u32(alloc0Result);
  if (arm1.wrapperFreeCall) v0c = 0;
  else if (arm1.reallocPath) { v0c = 0; clobbered = v08; v08 = u32(alloc1Result); }
  return {
    oldLayerCount: oldLayer, newLayerCount: newLayer, oldSecondCount: oldSecond, newSecondCount: newSecond,
    arm0FreePath: arm0.freePath, arm0ReallocPath: arm0.reallocPath, arm0MemcpyNeeded: arm0.memcpyNeeded,
    arm0AllocSize: arm0.allocSize, arm0MemsetSize: arm0.memsetSize, arm0MemcpySize: arm0.memcpySize,
    arm0ReleaseOld: arm0.releaseOld,
    arm1FreePath: arm1.freePath, arm1ReallocPath: arm1.reallocPath, arm1MemcpyNeeded: arm1.memcpyNeeded,
    arm1AllocSize: arm1.allocSize, arm1MemsetSize: arm1.memsetSize, arm1MemcpySize: arm1.memcpySize,
    arm1ReleaseOld: arm1.releaseOld,
    counterBlock: anm2AllocCounterBlock(counterHead),
    hostCallCount: arm0.hostCallCount + arm1.hostCallCount,
    final04: u32(newDataPtr), final08: v08, final0c: v0c, clobberedLayerPtr: clobbered,
  };
}

/* ============ v4: 0x00408c90 / 0x00408b90 / 0x00408c10 bodies ============ */

export const ANM2_DATA_OFF_TRIGGER_LIST_28 = 0x28;
export const ANM2_DATA_OFF_TRIGGER_COUNT_2C = 0x2c;
export const ANM2_TRIGGER_ELEM_STRIDE = 8;
export const ANM2_TRIGGER_ELEM_ID_OFF = 0;
export const ANM2_TRIGGER_ELEM_TIME_OFF = 4;
export const ANM2_STATE_OFF_TRIGGER_BITS_18 = 0x18;
export const ANM2_STATE_OFF_TRIGGER_BITS_1C = 0x1c;
export const ANM2_BTS_SHIFT_MASK = 31;
export const ANM2_HOST_VA_PREWALK = 0x00408c90;
export const ANM2_PREWALK_LOG_LEVEL = 0x10;
export const ANM2_PREWALK_LOG_STR_VA = 0x00b1a504;
export const ANM2_LAHF_TEST_MASK = 0x44;
export const ANM2_LAHF_ZF_BIT = 0x40;
export const ANM2_LAHF_PF_BIT = 0x04;

export const ANM2_FRAME_WALK_LAYER = 0;
export const ANM2_FRAME_WALK_NULL = 1;
export const ANM2_FRAME_WALK_ENTRY_STRIDE = 0x10;
export const ANM2_FRAME_WALK_SLOT_STRIDE = 4;
export const ANM2_W0_DATA_COUNT_OFF = 0x1c;
export const ANM2_W0_STATE_FRAMES_OFF = 0x08;
export const ANM2_W0_DATA_LIST_OFF = 0x18;
export const ANM2_W0_ELEM_STRIDE = 0x6c;
export const ANM2_W0_ELEM_TIME_OFF = 0x68;
export const ANM2_W0_LIST_COUNT_OFF = 0x08;
export const ANM2_W0_LIST_BASE_OFF = 0x04;
export const ANM2_W1_DATA_COUNT_OFF = 0x24;
export const ANM2_W1_STATE_FRAMES_OFF = 0x0c;
export const ANM2_W1_DATA_LIST_OFF = 0x20;
export const ANM2_W1_ELEM_STRIDE = 0x54;
export const ANM2_W1_ELEM_TIME_OFF = 0x50;
export const ANM2_W1_LIST_COUNT_OFF = 0x0c;
export const ANM2_W1_LIST_BASE_OFF = 0x08;
export const ANM2_WALK_STOP_NOT_ENTERED = 3;
export const ANM2_WALK_STOP_COUNT = 0;
export const ANM2_WALK_STOP_TIME = 1;
export const ANM2_WALK_STOP_WRAPPED = 2;
export const ANM2_HOST_VA_ADVANCE_POSITION = 0x00408d00;

/**
 * The flag byte the machine actually inspects after comparing two singles and
…
 */
export function anm2UcomissAhTest44(aBits, bBits) {
  const a = bitsToF32(aBits); const b = bitsToF32(bBits);
  const unordered = !(a === a) || !(b === b);
  let ah = 0;
  if (unordered) { ah |= ANM2_LAHF_ZF_BIT; ah |= ANM2_LAHF_PF_BIT; }
  else if (a === b) ah |= ANM2_LAHF_ZF_BIT;
  return ah & ANM2_LAHF_TEST_MASK;
}

/**
 * Whether the machine falls past the parity branch. The branch skips whenever
…
 */
export function anm2UcomissEqBits(aBits, bBits) {
  let bits = anm2UcomissAhTest44(aBits, bBits); let parity = 0;
  while (bits !== 0) { parity ^= bits & 1; bits >>>= 1; }
  return parity !== 0;
}

/** The carry the machine's ordered compare leaves: set when the first operand
 *  is smaller, and also whenever the pair cannot be ordered at all. */
export function anm2ComissBelowBits(aBits, bBits) {
  return !(bitsToF32(aBits) >= bitsToF32(bBits));
}

/** Bit-set with a five-bit offset: the machine ignores everything above. */
export function anm2BtsMask(bitIndex) {
  return u32(1 << (u32(bitIndex) & ANM2_BTS_SHIFT_MASK));
}

export function anm2BtsApply(value, bitIndex) {
  return u32(u32(value) | anm2BtsMask(bitIndex));
}

/** Signed dword -> single, the way the machine widens an integer field. */
function cvtdq2psBits(raw) {
  return f32ToBits(Math.fround(i32(raw)));
}

/**
 * The trigger scan (`0x00408c90`).
…
 */
export function anm2PrewalkApply(mem, stateAddr) {
  const plan = {
    logNeeded: false, logVa: ANM2_HOST_VA_LOG, logLevel: ANM2_PREWALK_LOG_LEVEL,
    logStrVa: ANM2_PREWALK_LOG_STR_VA, faultsAfterLog: false, entered: false, count: 0,
    frameBits: 0, matches: 0, bits18: 0, bits1c: 0, iterations: 0,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  let data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  if (data === 0) {
    plan.logNeeded = true;
    data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
    if (data === 0) { plan.faultsAfterLog = true; return plan; }
  }
  let count = readU32(mem, data + ANM2_DATA_OFF_TRIGGER_COUNT_2C);
  plan.count = count;
  if (count === 0) {
    plan.bits18 = readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_18);
    plan.bits1c = readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_1C);
    return plan;
  }
  plan.entered = true;
  const frameBits = readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10);
  plan.frameBits = frameBits;
  let i = 0;
  for (;;) {
    const list = readU32(mem, data + ANM2_DATA_OFF_TRIGGER_LIST_28);
    const elem = u32(list + u32(Math.imul(i, ANM2_TRIGGER_ELEM_STRIDE)));
    const timeBits = cvtdq2psBits(readU32(mem, elem + ANM2_TRIGGER_ELEM_TIME_OFF));
    if (anm2UcomissEqBits(timeBits, frameBits)) {
      const listA = readU32(mem, data + ANM2_DATA_OFF_TRIGGER_LIST_28);
      const idA = readU32(mem, u32(listA + u32(Math.imul(i, ANM2_TRIGGER_ELEM_STRIDE)) + ANM2_TRIGGER_ELEM_ID_OFF));
      writeBytes(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_18, anm2BtsApply(readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_18), idA), 4);
      const listB = readU32(mem, data + ANM2_DATA_OFF_TRIGGER_LIST_28);
      const idB = readU32(mem, u32(listB + u32(Math.imul(i, ANM2_TRIGGER_ELEM_STRIDE)) + ANM2_TRIGGER_ELEM_ID_OFF));
      writeBytes(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_1C, anm2BtsApply(readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_1C), idB), 4);
      plan.matches += 1;
    }
    plan.iterations += 1;
    i = u32(i + 1);
    count = readU32(mem, data + ANM2_DATA_OFF_TRIGGER_COUNT_2C);
    if (u32(i) >= u32(count)) break;
  }
  plan.bits18 = readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_18);
  plan.bits1c = readU32(mem, st + ANM2_STATE_OFF_TRIGGER_BITS_1C);
  return plan;
}

/** The seven field offsets that separate the two otherwise identical walks. */
export function anm2FrameWalkParams(which) {
  if (which === ANM2_FRAME_WALK_NULL) {
    return {
      dataCountOff: ANM2_W1_DATA_COUNT_OFF, stateFramesOff: ANM2_W1_STATE_FRAMES_OFF,
      dataListOff: ANM2_W1_DATA_LIST_OFF, elemStride: ANM2_W1_ELEM_STRIDE,
      elemTimeOff: ANM2_W1_ELEM_TIME_OFF, listCountOff: ANM2_W1_LIST_COUNT_OFF,
      listBaseOff: ANM2_W1_LIST_BASE_OFF, entryStride: ANM2_FRAME_WALK_ENTRY_STRIDE,
    };
  }
  return {
    dataCountOff: ANM2_W0_DATA_COUNT_OFF, stateFramesOff: ANM2_W0_STATE_FRAMES_OFF,
    dataListOff: ANM2_W0_DATA_LIST_OFF, elemStride: ANM2_W0_ELEM_STRIDE,
    elemTimeOff: ANM2_W0_ELEM_TIME_OFF, listCountOff: ANM2_W0_LIST_COUNT_OFF,
    listBaseOff: ANM2_W0_LIST_BASE_OFF, entryStride: ANM2_FRAME_WALK_ENTRY_STRIDE,
  };
}

/**
 * One frame walk (`0x00408b90` or `0x00408c10`).
…
 */
export function anm2FrameWalkApply(mem, { which = ANM2_FRAME_WALK_LAYER, stateAddr = 0, index = 0, timeBits = 0 } = {}) {
  const p = anm2FrameWalkParams(which);
  const plan = {
    boundOk: false, logNeeded: true, logVa: ANM2_HOST_VA_LOG, logLevel: ANM2_ADVANCE_LOG_LEVEL,
    logStrVa: ANM2_ADVANCE_LOG_STR_VA, recaptured: false, faultsAtListBase: false,
    frameSlotPtr: 0, entryPtr: 0, startFrame: 0, finalFrame: 0, steps: 0,
    stopReason: ANM2_WALK_STOP_NOT_ENTERED,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  let data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  let boundOk = 0;
  if (data !== 0) {
    const count = i32(readU32(mem, u32(data + p.dataCountOff)));
    boundOk = anm2AdvanceInnerOk(0, index, count) ? 1 : 0;
  }
  plan.boundOk = boundOk !== 0;
  plan.logNeeded = boundOk === 0;
  if (boundOk === 0) {
    data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
    plan.recaptured = true;
  }
  const frames = readU32(mem, st + p.stateFramesOff);
  const slot = u32(frames + u32(i32(index)) * ANM2_FRAME_WALK_SLOT_STRIDE);
  plan.frameSlotPtr = slot;
  let cur = i32(readU32(mem, slot));
  plan.startFrame = cur; plan.finalFrame = cur;
  if (data === 0) { plan.faultsAtListBase = true; return plan; }
  const listBase = readU32(mem, u32(data + p.dataListOff));
  const entry = u32(listBase + u32(i32(index)) * p.entryStride);
  plan.entryPtr = entry;
  if (cur < 0) { plan.stopReason = ANM2_WALK_STOP_NOT_ENTERED; return plan; }
  let off = u32(u32(cur) * p.elemStride);
  for (;;) {
    cur = i32(u32(cur) + 1);
    const listCount = i32(readU32(mem, u32(entry + p.listCountOff)));
    if (cur >= listCount) { plan.stopReason = ANM2_WALK_STOP_COUNT; break; }
    const base = readU32(mem, u32(entry + p.listBaseOff));
    const t = cvtdq2psBits(readU32(mem, u32(base + off + p.elemTimeOff)));
    if (anm2ComissBelowBits(timeBits, t)) { plan.stopReason = ANM2_WALK_STOP_TIME; break; }
    off = u32(off + p.elemStride);
    writeBytes(mem, slot, u32(cur), 4);
    plan.steps += 1; plan.finalFrame = cur;
    if (cur < 0) { plan.stopReason = ANM2_WALK_STOP_WRAPPED; break; }
  }
  return plan;
}

/* ================== v5: Play family + state update chain ================== */

export const ANM2_OFF_ANIM_DATA_PTR_34 = 0x34;
export const ANM2_OFF_PLAYING_FLAG_44 = 0x44;
export const ANM2_ANIM_NAME_SIZE_OFF = 0x10;
export const ANM2_ANIM_NAME_CAP_OFF = 0x14;
export const ANM2_DATA_OFF_RESTART_FLAG_34 = 0x34;
export const ANM2_OFF_LOADED_BYTE_109 = 0x109;
export const ANM2_PLAY_APPLY_VA = 0x0040a5d0;
export const ANM2_PLAY_VA = 0x0040a380;
export const ANM2_PLAY_INDEX_VA = 0x0040a400;
export const ANM2_PLAY_RANDOM_VA = 0x0040a2b0;
export const ANM2_STATE_UPDATE_VA = 0x00409030;
export const ANM2_ANM_UPDATE_VA = 0x00409100;
export const ANM2_PRED_VA = 0x0040a4d0;
export const ANM2_PRED_ALT_VA = 0x0040a550;
export const ANM2_REWIND_VA = 0x0040a1b0;
export const ANM2_ADVANCE_BACKWARD_LOG_STR_VA = 0x00b1a520;
export const ANM2_ADVANCE_BACKWARD_LOG_LEVEL = 0x10;
export const ANM2_INDEX_LOG_STR_VA = 0x00b1a5ec;
export const ANM2_INDEX_LOG_LEVEL = 1;
export const ANM2_PLAY_RANDOM_LOG_STR_VA = 0x00b1a5c8;
export const ANM2_PLAY_RANDOM_LOG_LEVEL = 1;
export const ANM2_PLAY_RANDOM_CALLSITE_COUNT = 3;
export const ANM2_ADVANCE_STEP_BITS = 0x3f800000;
export const ANM2_ADVANCE_STEP_VA = 0x00baa454;
export const ANM2_CVTTSS2SI_INDEFINITE = 0x80000000;
export const ANM2_IAT_VA_FLOOR = 0x00b18840;
export const ANM2_ADVANCE_RUNAWAY_AT = 0x1000000;

/**
 * The single-precision floor the CRT performs on the widened argument.
…
 */
export function anm2FloorF32Bits(xBits) {
  xBits = u32(xBits);
  const sign = xBits >>> 31; const exp = (xBits >>> 23) & 0xff; const frac = xBits & 0x7fffff;
  if (exp === 0xff) return xBits;
  if (xBits === 0 || xBits === 0x80000000) return xBits;
  if (exp >= 150) return xBits;
  if (exp < 127) return sign !== 0 ? 0xbf800000 : 0;
  const shift = 150 - exp; const mask = (1 << shift) - 1; const truncated = (xBits & ~mask) >>> 0;
  if (sign !== 0 && (frac & mask) !== 0) return u32(truncated + (1 << shift));
  return truncated;
}

/**
 * cvttss2si truncation with the SSE indefinite result. Implemented from the
…
 */
export function anm2Cvttss2siBits(fBits) {
  const f = bitsToF32(fBits);
  if (!(f === f) || f >= 2147483648.0 || f < -2147483648.0) return ANM2_CVTTSS2SI_INDEFINITE | 0;
  return i32(f);
}

/** The `jbe` after comiss a,b: CF|ZF, i.e. everything except an ordered >. */
export function anm2ComissJbeBits(aBits, bBits) {
  return bitsToF32(aBits) > bitsToF32(bBits) ? 0 : 1;
}

/** The `ja` after comiss a,b: !CF && !ZF, i.e. an ordered strict >. */
export function anm2ComissJaBits(aBits, bBits) {
  return bitsToF32(aBits) > bitsToF32(bBits) ? 1 : 0;
}

/** float32 addss on raw bits (NaN payloads canonicalise, as in wasm). */
export function anm2F32AddBits(aBits, bBits) {
  return f32ToBits(Math.fround(bitsToF32(aBits) + bitsToF32(bBits)));
}

/**
 * The Play gate matrix shared by 0x0040a380 / 0x0040a400 / 0x0040a2b0:
…
 */
export function anm2PlayGateSkip(resetFlag, dataNull, nameEqual, data34Flag, state44Flag) {
  if ((u32(resetFlag) & 0xff) !== 0) return 0;
  if (i32(dataNull) !== 0) return 0;
  if (i32(nameEqual) === 0) return 0;
  if ((u32(data34Flag) & 0xff) !== 0 && (u32(state44Flag) & 0xff) === 0) return 0;
  return 1;
}

/** The gate inputs read out of an ANM2 image. A null image behaves exactly
 *  like the C++ side: dataNull stays 0 and the gate collapses on nameEqual. */
function gateFromImage(mem, anm2Addr, nameAddr, resetFlag) {
  let dataNull = 0, nameEqual = 0, data34Flag = 0, state44Flag = 0;
  if (u32(anm2Addr) !== 0) {
    const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    dataNull = data === 0 ? 1 : 0;
    if (data !== 0) {
      nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
      data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
    }
    state44Flag = mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff;
  }
  return { resetFlag: resetFlag | 0, dataNull, nameEqual, data34Flag, state44Flag };
}

/** 0x0040a380 ANM2::Play(const char*, bool): the pure gate + host-call plan. */
export function anm2PlayPlan(mem, { anm2Addr, nameAddr, resetFlag }) {
  const plan = {
    resetFlag: resetFlag | 0, dataNull: 0, nameEqual: 0, data34Flag: 0, state44Flag: 0,
    skip: 0, callApply: 1, applyVa: ANM2_PLAY_APPLY_VA, applyResetArg: 1,
    rewindVa: ANM2_REWIND_VA, rewindRan: 0, flag44Set: 0,
  };
  if (u32(anm2Addr) !== 0) {
    const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.dataNull = data === 0 ? 1 : 0;
    if (data !== 0) {
      plan.nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
      plan.data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
    }
    plan.state44Flag = mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff;
  }
  plan.skip = anm2PlayGateSkip(resetFlag, plan.dataNull, plan.nameEqual, plan.data34Flag, plan.state44Flag);
  plan.callApply = plan.skip !== 0 ? 0 : 1;
  return plan;
}

/** Play plus the post-call tail: rewind + flag store when the host apply
 *  returned AL != 0. hostApplyAl is supplied by the harness. */
export function anm2PlayApply(mem, { anm2Addr, nameAddr, resetFlag, hostApplyAl }) {
  const plan = anm2PlayPlan(mem, { anm2Addr, nameAddr, resetFlag });
  if (plan.callApply !== 0 && (u32(hostApplyAl) & 0xff) !== 0) {
    plan.rewindRan = 1; plan.flag44Set = 1;
    if (u32(anm2Addr) !== 0) {
      anm2RewindApply(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 1, 1);
    }
  }
  return plan;
}

/** 0x0040a400 ANM2::Play(int, bool): SIGNED bounds, element-name SSO select,
 *  then the same gate with the element name as the query. */
export function anm2PlayIndexPlan(mem, { anm2Addr, index }) {
  const plan = {
    indexInRange: 0, logNeeded: 1, logVa: ANM2_HOST_VA_LOG, logLevel: ANM2_INDEX_LOG_LEVEL,
    logStrVa: ANM2_INDEX_LOG_STR_VA, dataNull: 0, nameEqual: 0, data34Flag: 0, state44Flag: 0,
    skip: 0, callApply: 0, applyVa: ANM2_PLAY_APPLY_VA, applyResetArg: 1,
    rewindVa: ANM2_REWIND_VA, rewindRan: 0, flag44Set: 0,
  };
  if (u32(anm2Addr) !== 0) {
    const count = i32(readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_COUNT_78));
    const inRange = (i32(index) >= 0 && i32(index) < count) ? 1 : 0;
    plan.indexInRange = inRange; plan.logNeeded = inRange !== 0 ? 0 : 1;
    if (inRange !== 0) {
      const elem = u32(readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_74) + u32(Math.imul(i32(index), ANM2_ANIM_DATA_STRIDE)));
      const elemName = anm2SsoDataAddr(mem, elem);
      const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
      plan.dataNull = data === 0 ? 1 : 0;
      if (data !== 0) {
        plan.nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), elemName) === 0 ? 1 : 0;
        plan.data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
      }
      plan.state44Flag = mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff;
      plan.skip = anm2PlayGateSkip(0, plan.dataNull, plan.nameEqual, plan.data34Flag, plan.state44Flag);
      plan.callApply = plan.skip !== 0 ? 0 : 1;
    }
  }
  return plan;
}

/** Play(int) plus the post-call tail. */
export function anm2PlayIndexApply(mem, { anm2Addr, index, hostApplyAl }) {
  const plan = anm2PlayIndexPlan(mem, { anm2Addr, index });
  if (plan.callApply !== 0 && (u32(hostApplyAl) & 0xff) !== 0) {
    plan.rewindRan = 1; plan.flag44Set = 1;
    if (u32(anm2Addr) !== 0) {
      anm2RewindApply(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 1, 1);
    }
  }
  return plan;
}

/**
 * 0x0040a2b0 PlayRandom. Count at [anm2+0x78] is a FULL dword (`test
…
 */
export function anm2PlayRandomPlan(mem, { anm2Addr, seed }) {
  const plan = {
    entered: 0, count: 0, countZero: 1, logNeeded: 1, logVa: ANM2_HOST_VA_LOG,
    logLevel: ANM2_PLAY_RANDOM_LOG_LEVEL, logStrVa: ANM2_PLAY_RANDOM_LOG_STR_VA,
    seed: u32(seed), remainder: 0, dataNull: 0, nameEqual: 0, data34Flag: 0, state44Flag: 0,
    skip: 0, callApply: 0, applyVa: ANM2_PLAY_APPLY_VA, applyResetArg: 1,
    rewindVa: ANM2_REWIND_VA, rewindRan: 0, flag44Set: 0,
  };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    const count = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_COUNT_78);
    plan.count = count;
    if (count !== 0) {
      plan.countZero = 0; plan.logNeeded = 0;
      const rem = u32(u32(seed) % count);
      plan.remainder = rem;
      const elem = u32(readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_74) + u32(Math.imul(rem, ANM2_ANIM_DATA_STRIDE)));
      const elemName = anm2SsoDataAddr(mem, elem);
      const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
      plan.dataNull = data === 0 ? 1 : 0;
      if (data !== 0) {
        plan.nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), elemName) === 0 ? 1 : 0;
        plan.data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
      }
      plan.state44Flag = mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff;
      plan.skip = anm2PlayGateSkip(0, plan.dataNull, plan.nameEqual, plan.data34Flag, plan.state44Flag);
      plan.callApply = plan.skip !== 0 ? 0 : 1;
    }
  }
  return plan;
}

/** PlayRandom plus the post-call Rewind / flag-44 tail. */
export function anm2PlayRandomApply(mem, { anm2Addr, seed, hostApplyAl }) {
  const plan = anm2PlayRandomPlan(mem, { anm2Addr, seed });
  if (plan.callApply !== 0 && (u32(hostApplyAl) & 0xff) !== 0) {
    plan.rewindRan = 1; plan.flag44Set = 1;
    if (u32(anm2Addr) !== 0) {
      anm2RewindApply(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 1, 1);
    }
  }
  return plan;
}

/** 0x0040a4d0: data && playing flag && (name empty || strcmp equal). */
export function anm2PlayingNamePred(mem, { anm2Addr, nameAddr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  if (data === 0) return 0;
  if ((mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff) === 0) return 0;
  if ((mem[u32(nameAddr)] & 0xff) === 0) return 1;
  return anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
}

/** 0x0040a550 (D27): on the null-data path the decision is the raw name
 *  POINTER, so any non-null name (including "") returns 0 there. A null
 *  pointer would fault at the byte read in the PE; the harness models the
 *  discarded read as linear address 0 and defines nameAddr == 0 as 1. */
export function anm2PlayingNamePredAlt(mem, { anm2Addr, nameAddr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  if (data === 0) {
    void (mem[u32(nameAddr)] & 0xff);
    return u32(nameAddr) === 0 ? 1 : 0;
  }
  if ((mem[u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44] & 0xff) !== 0) return 0;
  if ((mem[u32(nameAddr)] & 0xff) === 0) return 1;
  return anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
}

/** 0x0040a1b0 Rewind: zero frame + trigger fields, prewalk, zero both frame
 *  arrays. Counts and pointers are re-read per iteration; bounds UNSIGNED. */
export function anm2RewindApply(mem, stateAddr) {
  const plan = {
    prewalkLogNeeded: 0, prewalkFaulted: 0, faultsAtCount: 0,
    count0: 0, count1: 0, zeros0: 0, zeros1: 0, faultsAtSlot: 0,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  writeBytes(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10, 0, 4);
  writeBytes(mem, st + ANM2_STATE_OFF_CLEARED_18, 0, 4);
  writeBytes(mem, st + ANM2_STATE_OFF_TAIL_1C, 0, 4);
  const pw = anm2PrewalkApply(mem, st);
  plan.prewalkLogNeeded = pw.logNeeded ? 1 : 0;
  if (pw.faultsAfterLog) { plan.prewalkFaulted = 1; return plan; }
  let data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  if (data === 0) { plan.faultsAtCount = 1; return plan; }
  const count0 = readU32(mem, data + ANM2_DATA_OFF_LAYER_COUNT_1C);
  plan.count0 = count0;
  if (count0 !== 0) {
    let i = 0;
    for (;;) {
      const frames = readU32(mem, st + ANM2_STATE_OFF_LAYER_FRAMES_08);
      if (frames === 0) { plan.faultsAtSlot = 1; return plan; }
      writeBytes(mem, u32(frames + i * 4), 0, 4);
      plan.zeros0 += 1;
      i = u32(i + 1);
      data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
      if (data === 0) { plan.faultsAtCount = 1; return plan; }
      if (!(u32(i) < readU32(mem, data + ANM2_DATA_OFF_LAYER_COUNT_1C))) break;
    }
  }
  const count1 = readU32(mem, data + ANM2_DATA_OFF_SECOND_COUNT_24);
  plan.count1 = count1;
  if (count1 !== 0) {
    let i = 0;
    for (;;) {
      const frames = readU32(mem, st + ANM2_STATE_OFF_NULL_FRAMES_0C);
      if (frames === 0) { plan.faultsAtSlot = 1; break; }
      writeBytes(mem, u32(frames + i * 4), 0, 4);
      plan.zeros1 += 1;
      i = u32(i + 1);
      data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
      if (data === 0) { plan.faultsAtCount = 1; break; }
      if (!(u32(i) < readU32(mem, data + ANM2_DATA_OFF_SECOND_COUNT_24))) break;
    }
  }
  return plan;
}

/** 0x00408d00 AdvancePosition(int target). The backward log is an advisory
 *  host action after which the frame is re-read; the loop steps
 *  frame = floor(frame)+1.0f until (float)target stops being ordered-greater
 *  (D28: a no-progress step means the PE would spin forever, so the loop
 *  stops at the first no-progress iteration BEFORE the prewalk runs). */
export function anm2AdvancePositionApply(mem, stateAddr, target) {
  const plan = {
    logNeeded: 0, logVa: ANM2_HOST_VA_LOG, logLevel: ANM2_ADVANCE_BACKWARD_LOG_LEVEL,
    logStrVa: ANM2_ADVANCE_BACKWARD_LOG_STR_VA, logNewArg: target | 0, logCurArg: 0,
    frameSnapshotBits: 0, floorBits: 0, floorInt: 0, selectedBits: 0, targetFBits: 0,
    loopEntered: 0, iterations: 0, runaway: 0, prewalkLogNeeded: 0, prewalkFaulted: 0,
    faultsAtWalkEntry: 0, walk0Iterations: 0, walk1Iterations: 0, hostCallCount: 0,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  const frameBits = readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10);
  plan.frameSnapshotBits = frameBits;
  const floorBits = anm2FloorF32Bits(frameBits);
  const cur = anm2Cvttss2siBits(floorBits);
  plan.floorBits = floorBits; plan.floorInt = cur; plan.logCurArg = cur;
  plan.logNeeded = (i32(target) < cur) ? 1 : 0;
  const selectedBits = plan.logNeeded !== 0 ? readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10) : frameBits;
  plan.selectedBits = selectedBits;
  const targetFBits = cvtdq2psBits(u32(target));
  plan.targetFBits = targetFBits;
  writeBytes(mem, st + ANM2_STATE_OFF_CLEARED_18, 0, 4);
  plan.loopEntered = anm2ComissJaBits(targetFBits, selectedBits);
  if (plan.loopEntered !== 0) {
    for (;;) {
      const frame = readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10);
      const stepped = anm2F32AddBits(anm2FloorF32Bits(frame), ANM2_ADVANCE_STEP_BITS);
      writeBytes(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10, stepped, 4);
      if (stepped === frame) { plan.runaway = 1; break; }
      const pre = anm2PrewalkApply(mem, st);
      plan.prewalkLogNeeded = pre.logNeeded ? 1 : 0;
      if (pre.faultsAfterLog) { plan.prewalkFaulted = 1; break; }
      plan.iterations += 1;
      if (!anm2ComissJaBits(targetFBits, readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10))) break;
    }
  }
  if (plan.prewalkFaulted !== 0 || plan.runaway !== 0) return plan;
  let data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  if (data === 0) { plan.faultsAtWalkEntry = 1; return plan; }
  let count = readU32(mem, data + ANM2_DATA_OFF_LAYER_COUNT_1C);
  if (count !== 0) {
    let i = 0;
    for (;;) {
      anm2FrameWalkApply(mem, { which: ANM2_FRAME_WALK_LAYER, stateAddr: st, index: i32(i), timeBits: targetFBits });
      plan.walk0Iterations += 1;
      i = u32(i + 1);
      data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
      if (data === 0) { plan.faultsAtWalkEntry = 1; break; }
      if (!(u32(i) < readU32(mem, data + ANM2_DATA_OFF_LAYER_COUNT_1C))) break;
    }
    if (plan.faultsAtWalkEntry !== 0) return plan;
  }
  const count1 = readU32(mem, data + ANM2_DATA_OFF_SECOND_COUNT_24);
  if (count1 !== 0) {
    let i = 0;
    for (;;) {
      anm2FrameWalkApply(mem, { which: ANM2_FRAME_WALK_NULL, stateAddr: st, index: i32(i), timeBits: targetFBits });
      plan.walk1Iterations += 1;
      i = u32(i + 1);
      data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
      if (data === 0) { plan.faultsAtWalkEntry = 1; break; }
      if (!(u32(i) < readU32(mem, data + ANM2_DATA_OFF_SECOND_COUNT_24))) break;
    }
  }
  return plan;
}

/** 0x00409030 AnimationState update: gate, floor(frame+_playbackSpeed),
 *  signed length compare, then advance / rewind / wrap. */
export function anm2StateUpdateApply(mem, stateAddr) {
  const plan = {
    entered: 0, dataNull: 0, flagClear: 0, frameBits: 0, speedBits: 0,
    framePlusSpeedBits: 0, floorBits: 0, floorInt: 0, length: 0, belowLength: 0,
    data34Flag: 0, rewindPath: 0, wrapPath: 0, wrapTarget: 0, wrapAdvanceCalled: 0,
    advancePath: 0, advanceTarget: 0, flagCleared: 0, frameStored: 0, hostCallCount: 0,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  const data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  plan.dataNull = data === 0 ? 1 : 0;
  plan.flagClear = (mem[st + ANM2_STATE_OFF_TAIL_BYTE_14] & 0xff) === 0 ? 1 : 0;
  if (data === 0 || (mem[st + ANM2_STATE_OFF_TAIL_BYTE_14] & 0xff) === 0) return plan;
  plan.entered = 1;
  const anm2 = readU32(mem, st + ANM2_STATE_OFF_ANIMATION_00);
  const frameBits = readU32(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10);
  const speedBits = readU32(mem, u32(anm2 + ANM2_OFF_PLAYBACK_SPEED_104));
  plan.frameBits = frameBits; plan.speedBits = speedBits;
  const fpsBits = anm2F32AddBits(frameBits, speedBits);
  plan.framePlusSpeedBits = fpsBits;
  const fpsFloorBits = anm2FloorF32Bits(fpsBits);
  const floorFs = anm2Cvttss2siBits(fpsFloorBits);
  const length = i32(readU32(mem, data + ANM2_DATA_OFF_LENGTH_30));
  plan.length = length;
  plan.belowLength = (floorFs < length) ? 1 : 0;
  if (floorFs < length) {
    plan.floorBits = fpsFloorBits; plan.floorInt = floorFs;
    plan.advancePath = 1; plan.advanceTarget = floorFs;
    anm2AdvancePositionApply(mem, st, floorFs);
    writeBytes(mem, st + ANM2_STATE_OFF_ANIM_FRAME_10, fpsBits, 4);
    plan.frameStored = 1;
    return plan;
  }
  plan.data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
  if (plan.data34Flag !== 0) {
    plan.rewindPath = 1;
    anm2RewindApply(mem, st);
    return plan;
  }
  plan.wrapPath = 1;
  const wrapTarget = u32(u32(length) - 1);
  plan.wrapTarget = wrapTarget | 0;
  const origFloorBits = anm2FloorF32Bits(frameBits);
  const origFloorInt = anm2Cvttss2siBits(origFloorBits);
  plan.floorBits = origFloorBits; plan.floorInt = origFloorInt;
  plan.wrapAdvanceCalled = (i32(wrapTarget) >= origFloorInt) ? 1 : 0;
  if (plan.wrapAdvanceCalled !== 0) anm2AdvancePositionApply(mem, st, i32(wrapTarget));
  writeBytes(mem, st + ANM2_STATE_OFF_TAIL_BYTE_14, 0, 1);
  plan.flagCleared = 1;
  return plan;
}

/** 0x00409100 ANM2::Update: both states when byte[anm2+0x109] is set. */
export function anm2AnmUpdateApply(mem, anm2Addr) {
  const plan = { loaded: 0, state0Entered: 0, state1Entered: 0, hostCallCount: 0 };
  if (u32(anm2Addr) !== 0) {
    plan.loaded = (mem[u32(anm2Addr) + ANM2_OFF_LOADED_BYTE_109] & 0xff) !== 0 ? 1 : 0;
    if (plan.loaded !== 0) {
      const s0 = anm2StateUpdateApply(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      const s1 = anm2StateUpdateApply(mem, u32(anm2Addr) + ANM2_OFF_OVERLAY_STATE_50);
      plan.state0Entered = s0.entered; plan.state1Entered = s1.entered;
    }
  }
  return plan;
}

/* ================== v11: 0x0040a220 layer-frame getter ================== */

export const ANM2_LAYER_FRAME_VA = 0x0040a220;
export const ANM2_LAYER_FRAME_END_VA = 0x0040a2a4;
export const ANM2_LAYER_FRAME_LOG_NULL_STR_VA = 0x00b1a504;
export const ANM2_LAYER_FRAME_LOG_BOUND_STR_VA = 0x00b1a564;
export const ANM2_LAYER_FRAME_LOG_LEVEL = 0x10;
export const ANM2_LAYER_FRAME_CALLSITE_COUNT = 52;
export const ANM2_DATA_OFF_LAYER_MAP_38 = 0x38;
export const ANM2_LAYER_FRAME_ELEM_STRIDE = 0x6c;
export const ANM2_LAYER_FRAME_NEXT_VA = 0x0040a360;

/**
 * 0x0040a220 AnimationState layer-frame getter. Independent of the C++
…
 */
export function anm2LayerFramePlan(mem, { stateAddr, layerId }) {
  const plan = {
    entered: 0, layerId: layerId | 0, dataNull: 0, logNullNeeded: 0,
    logNullStrVa: ANM2_LAYER_FRAME_LOG_NULL_STR_VA, logBoundNeeded: 0,
    logBoundStrVa: ANM2_LAYER_FRAME_LOG_BOUND_STR_VA, logVa: ANM2_HOST_VA_LOG,
    logLevel: ANM2_LAYER_FRAME_LOG_LEVEL, anm2Ptr: 0, anm2LayerCount: 0,
    dataPtr: 0, dataNullPost: 0, mapIndex: 0, layerCount1c: 0, frameIndex: 0,
    framesPtr: 0, entryPtr: 0, listCount: 0, result: 0, hit: 0, hostCallCount: 0,
  };
  if (u32(stateAddr) === 0) return plan;
  const st = u32(stateAddr);
  plan.entered = 1;
  const data0 = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  plan.dataNull = data0 === 0 ? 1 : 0;
  plan.logNullNeeded = plan.dataNull;
  if (i32(layerId) < 0) plan.logBoundNeeded = 1;
  else {
    const anm2 = readU32(mem, st + ANM2_STATE_OFF_ANIMATION_00);
    plan.anm2Ptr = anm2;
    plan.anm2LayerCount = i32(readU32(mem, u32(anm2 + ANM2_OFF_LAYER_COUNT_80)));
    if (!(i32(layerId) < plan.anm2LayerCount)) plan.logBoundNeeded = 1;
  }
  const data = readU32(mem, st + ANM2_STATE_OFF_ANIM_DATA_04);
  plan.dataPtr = data; plan.dataNullPost = data === 0 ? 1 : 0;
  if (data === 0 || i32(layerId) < 0) return plan;
  const anm2 = readU32(mem, st + ANM2_STATE_OFF_ANIMATION_00);
  plan.anm2Ptr = anm2;
  const count80 = i32(readU32(mem, u32(anm2 + ANM2_OFF_LAYER_COUNT_80)));
  plan.anm2LayerCount = count80;
  if (i32(layerId) > count80) return plan;
  const mapAddr = u32(data + u32(i32(layerId)) * 4 + ANM2_DATA_OFF_LAYER_MAP_38);
  const mapped = i32(readU32(mem, mapAddr));
  plan.mapIndex = mapped;
  if (mapped < 0) return plan;
  const count1c = i32(readU32(mem, data + ANM2_DATA_OFF_LAYER_COUNT_1C));
  plan.layerCount1c = count1c;
  if (!(mapped < count1c)) return plan;
  const frames = readU32(mem, st + ANM2_STATE_OFF_LAYER_FRAMES_08);
  plan.framesPtr = frames;
  const frame = i32(readU32(mem, u32(frames + u32(mapped) * 4)));
  plan.frameIndex = frame;
  if (frame < 0) return plan;
  const entry = u32(readU32(mem, data + ANM2_W0_DATA_LIST_OFF) + (u32(mapped) << 4));
  plan.entryPtr = entry;
  const listCount = i32(readU32(mem, entry + ANM2_W0_LIST_COUNT_OFF));
  plan.listCount = listCount;
  if (!(frame < listCount)) return plan;
  const result = u32(readU32(mem, entry + ANM2_W0_LIST_BASE_OFF) + u32(Math.imul(u32(frame), ANM2_LAYER_FRAME_ELEM_STRIDE)));
  plan.result = result; plan.hit = result !== 0 ? 1 : 0;
  return plan;
}

/* ================== v12: 0x0040a360 SSO trampoline into Play ============= */

export const ANM2_PLAY_SSO_VA = 0x0040a360;
export const ANM2_PLAY_SSO_END_VA = 0x0040a377;
export const ANM2_PLAY_SSO_TARGET_VA = 0x0040a380;
export const ANM2_PLAY_SSO_CALLSITE_COUNT = 12;
export const ANM2_PLAY_SSO_LUA_PUSH_VA = 0x00867262;
export const ANM2_PLAY_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_PLAY_SSO_NEXT_VA = 0x0040a4b0;

/**
 * 0x0040a360 std::string SSO trampoline. Independent of the C++:
…
 */
export function anm2PlaySsoPlan(mem, { anm2Addr, strAddr, resetFlag }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, resetFlag: resetFlag | 0,
    dataNull: 0, nameEqual: 0, data34Flag: 0, state44Flag: 0, skip: 0, callApply: 0,
    applyVa: 0, applyResetArg: 0, rewindVa: 0, rewindRan: 0, flag44Set: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  const play = anm2PlayPlan(mem, { anm2Addr, nameAddr, resetFlag });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.dataNull = play.dataNull; plan.nameEqual = play.nameEqual;
  plan.data34Flag = play.data34Flag; plan.state44Flag = play.state44Flag;
  plan.skip = play.skip; plan.callApply = play.callApply;
  plan.applyVa = play.applyVa; plan.applyResetArg = play.applyResetArg;
  plan.rewindVa = play.rewindVa; plan.rewindRan = play.rewindRan; plan.flag44Set = play.flag44Set;
  return plan;
}

/** Trampoline plus the Play apply tail (Rewind + flag-44). */
export function anm2PlaySsoApply(mem, { anm2Addr, strAddr, resetFlag, hostApplyAl }) {
  const plan = anm2PlaySsoPlan(mem, { anm2Addr, strAddr, resetFlag });
  const play = anm2PlayApply(mem, { anm2Addr, nameAddr: plan.nameAddr, resetFlag, hostApplyAl });
  plan.rewindRan = play.rewindRan; plan.flag44Set = play.flag44Set;
  return plan;
}

/* ================== v13: 0x0040a4b0 SSO trampoline into pred ============ */

export const ANM2_PLAYING_SSO_VA = 0x0040a4b0;
export const ANM2_PLAYING_SSO_END_VA = 0x0040a4c7;
export const ANM2_PLAYING_SSO_TARGET_VA = 0x0040a4d0;
export const ANM2_PLAYING_SSO_CALLSITE_COUNT = 0;
export const ANM2_PLAYING_SSO_LUA_PUSH_VA = 0x008673dc;
export const ANM2_PLAYING_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_PLAYING_SSO_NEXT_VA = 0x0040a530;

/**
 * 0x0040a4b0 std::string SSO trampoline. Independent of the C++:
…
 */
export function anm2PlayingSsoPlan(mem, { anm2Addr, strAddr }) {
  const plan = {
    entered: u32(anm2Addr) !== 0 ? 1 : 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, result: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  plan.result = anm2PlayingNamePred(mem, { anm2Addr, nameAddr });
  return plan;
}

/* ================== v14: 0x0040a530 SSO trampoline into pred_alt ======== */

export const ANM2_PLAYING_SSO_ALT_VA = 0x0040a530;
export const ANM2_PLAYING_SSO_ALT_END_VA = 0x0040a547;
export const ANM2_PLAYING_SSO_ALT_TARGET_VA = 0x0040a550;
export const ANM2_PLAYING_SSO_ALT_CALLSITE_COUNT = 0;
export const ANM2_PLAYING_SSO_ALT_LUA_PUSH_VA = 0x0086724e;
export const ANM2_PLAYING_SSO_ALT_LUA_PUSH_COUNT = 1;
export const ANM2_PLAYING_SSO_ALT_NEXT_VA = 0x0040a5b0;

/**
 * 0x0040a530 std::string SSO trampoline. Independent of the C++:
…
 */
export function anm2PlayingSsoAltPlan(mem, { anm2Addr, strAddr }) {
  const plan = {
    entered: u32(anm2Addr) !== 0 ? 1 : 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, result: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  plan.result = anm2PlayingNamePredAlt(mem, { anm2Addr, nameAddr });
  return plan;
}

/* ================== v15: 0x0040a5b0 SSO trampoline into walk+apply ===== */

export const ANM2_WALK_APPLY_SSO_VA = 0x0040a5b0;
export const ANM2_WALK_APPLY_SSO_END_VA = 0x0040a5c7;
export const ANM2_WALK_APPLY_SSO_TARGET_VA = 0x0040a5d0;
export const ANM2_WALK_APPLY_SSO_CALLSITE_COUNT = 0;
export const ANM2_WALK_APPLY_SSO_LUA_PUSH_VA = 0x0086739d;
export const ANM2_WALK_APPLY_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_WALK_APPLY_SSO_NEXT_VA = 0x0040a690;

/**
 * 0x0040a5b0 std::string SSO trampoline. Independent of the C++:
…
 */
export function anm2WalkApplySsoPlan(mem, { anm2Addr, strAddr, resetFlag }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, resetFlag: resetFlag | 0,
    found: 0, foundIndex: -1, elemByteOffset: 0, warnLogNeeded: 0, warnLogVa: 0,
    warnLogLevel: 0, warnLogStrVa: 0, applyVa: 0, applyRecvOff: 0, result: 0, hostCallCount: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  const walk = anm2WalkApplyPlan(mem, { anm2Addr, nameAddr, resetFlag });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.found = walk.found; plan.foundIndex = walk.foundIndex; plan.elemByteOffset = walk.elemByteOffset;
  plan.warnLogNeeded = walk.warnLogNeeded; plan.warnLogVa = walk.warnLogVa;
  plan.warnLogLevel = walk.warnLogLevel; plan.warnLogStrVa = walk.warnLogStrVa;
  plan.applyVa = walk.applyVa; plan.applyRecvOff = walk.applyRecvOff;
  plan.result = walk.result; plan.hostCallCount = walk.hostCallCount;
  return plan;
}

/* ================== v16: 0x0040a690 ANM2::SetFrame(std_string*, int) === */

export const ANM2_SET_FRAME_VA = 0x0040a690;
export const ANM2_SET_FRAME_END_VA = 0x0040a6d3;
export const ANM2_SET_FRAME_WALK_VA = 0x0040a5d0;
export const ANM2_SET_FRAME_ADVANCE_VA = 0x00408e00;
export const ANM2_SET_FRAME_CALLSITE_COUNT = 15;
export const ANM2_SET_FRAME_LUA_PUSH_VA = 0x00867277;
export const ANM2_SET_FRAME_LUA_PUSH_COUNT = 1;
export const ANM2_SET_FRAME_RESET_IMM = 1;
export const ANM2_SET_FRAME_NEXT_VA = 0x0040a6e0;

/**
 * 0x0040a690 ANM2::SetFrame. Independent of the C++:
…
 */
export function anm2SetFramePlan(mem, { anm2Addr, strAddr, frame }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, frame: frame | 0,
    frameFBits: cvtdq2psBits(u32(frame)), found: 0, foundIndex: -1, elemByteOffset: 0,
    warnLogNeeded: 0, warnLogVa: 0, warnLogLevel: 0, warnLogStrVa: 0, applyVa: 0, applyRecvOff: 0,
    walkResult: 0, dataPresent: 0, dataPresentPost: 0, advanceRan: 0, flag44Cleared: 0, hostCallCount: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  const walk = anm2WalkApplyPlan(mem, { anm2Addr, nameAddr, resetFlag: ANM2_SET_FRAME_RESET_IMM });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.found = walk.found; plan.foundIndex = walk.foundIndex; plan.elemByteOffset = walk.elemByteOffset;
  plan.warnLogNeeded = walk.warnLogNeeded; plan.warnLogVa = walk.warnLogVa;
  plan.warnLogLevel = walk.warnLogLevel; plan.warnLogStrVa = walk.warnLogStrVa;
  plan.applyVa = walk.applyVa; plan.applyRecvOff = walk.applyRecvOff;
  plan.walkResult = walk.result;
  let data = 0;
  if (u32(anm2Addr) !== 0) data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  plan.dataPresent = data !== 0 ? 1 : 0;
  plan.advanceRan = (plan.walkResult !== 0 && plan.dataPresent !== 0) ? 1 : 0;
  let dataPost = 0;
  if (u32(anm2Addr) !== 0) dataPost = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  plan.dataPresentPost = dataPost !== 0 ? 1 : 0;
  plan.flag44Cleared = (plan.advanceRan !== 0 && plan.dataPresentPost !== 0) ? 1 : 0;
  plan.hostCallCount = walk.hostCallCount + plan.advanceRan;
  return plan;
}

/** SetFrame plus the gated byte[this+0x44] = 0 store. */
export function anm2SetFrameApply(mem, { anm2Addr, strAddr, frame }) {
  const plan = anm2SetFramePlan(mem, { anm2Addr, strAddr, frame });
  if (plan.flag44Cleared !== 0 && u32(anm2Addr) !== 0) {
    writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 0, 1);
  }
  return plan;
}

/* ================== v17: 0x0040a6e0 const-char* SetFrame sibling === */

export const ANM2_SET_FRAME_CSTR_VA = 0x0040a6e0;
export const ANM2_SET_FRAME_CSTR_END_VA = 0x0040a71a;
export const ANM2_SET_FRAME_CSTR_WALK_VA = 0x0040a5d0;
export const ANM2_SET_FRAME_CSTR_ADVANCE_VA = 0x00408e00;
export const ANM2_SET_FRAME_CSTR_CALLSITE_COUNT = 80;
export const ANM2_SET_FRAME_CSTR_LUA_PUSH_COUNT = 0;
export const ANM2_SET_FRAME_CSTR_RESET_IMM = 1;
export const ANM2_SET_FRAME_CSTR_NEXT_VA = 0x0040a720;

/**
 * 0x0040a6e0 const-char* SetFrame. Independent of the C++:
…
 */
export function anm2SetFrameCstrPlan(mem, { anm2Addr, nameAddr, frame }) {
  const plan = {
    entered: 0, nameAddr: u32(nameAddr), frame: frame | 0, frameFBits: cvtdq2psBits(u32(frame)),
    found: 0, foundIndex: -1, elemByteOffset: 0, warnLogNeeded: 0, warnLogVa: 0,
    warnLogLevel: 0, warnLogStrVa: 0, applyVa: 0, applyRecvOff: 0, walkResult: 0,
    dataPresent: 0, dataPresentPost: 0, advanceRan: 0, flag44Cleared: 0, hostCallCount: 0,
  };
  const walk = anm2WalkApplyPlan(mem, { anm2Addr, nameAddr, resetFlag: ANM2_SET_FRAME_CSTR_RESET_IMM });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.found = walk.found; plan.foundIndex = walk.foundIndex; plan.elemByteOffset = walk.elemByteOffset;
  plan.warnLogNeeded = walk.warnLogNeeded; plan.warnLogVa = walk.warnLogVa;
  plan.warnLogLevel = walk.warnLogLevel; plan.warnLogStrVa = walk.warnLogStrVa;
  plan.applyVa = walk.applyVa; plan.applyRecvOff = walk.applyRecvOff;
  plan.walkResult = walk.result;
  let data = 0;
  if (u32(anm2Addr) !== 0) data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  plan.dataPresent = data !== 0 ? 1 : 0;
  plan.advanceRan = (plan.walkResult !== 0 && plan.dataPresent !== 0) ? 1 : 0;
  let dataPost = 0;
  if (u32(anm2Addr) !== 0) dataPost = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  plan.dataPresentPost = dataPost !== 0 ? 1 : 0;
  plan.flag44Cleared = (plan.advanceRan !== 0 && plan.dataPresentPost !== 0) ? 1 : 0;
  plan.hostCallCount = walk.hostCallCount + plan.advanceRan;
  return plan;
}

/** SetFrame(const char*) plus the gated byte[this+0x44] = 0 store. */
export function anm2SetFrameCstrApply(mem, { anm2Addr, nameAddr, frame }) {
  const plan = anm2SetFrameCstrPlan(mem, { anm2Addr, nameAddr, frame });
  if (plan.flag44Cleared !== 0 && u32(anm2Addr) !== 0) {
    writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 0, 1);
  }
  return plan;
}

/* ================== v18: 0x0040a720 current-anim SetFrame(int) === */

export const ANM2_SET_FRAME_CUR_VA = 0x0040a720;
export const ANM2_SET_FRAME_CUR_END_VA = 0x0040a73c;
export const ANM2_SET_FRAME_CUR_ADVANCE_VA = 0x00408e00;
export const ANM2_SET_FRAME_CUR_CALLSITE_COUNT = 55;
export const ANM2_SET_FRAME_CUR_LUA_PUSH_VA = 0x0086728c;
export const ANM2_SET_FRAME_CUR_LUA_PUSH_COUNT = 1;
export const ANM2_SET_FRAME_CUR_LE_DWORD_COUNT = 2;
export const ANM2_SET_FRAME_CUR_NEXT_VA = 0x0040a740;

/**
 * 0x0040a720 current-anim SetFrame(int). Independent of the C++:
…
 */
export function anm2SetFrameCurPlan(mem, { anm2Addr, frame }) {
  const plan = {
    entered: 0, frame: frame | 0, frameFBits: cvtdq2psBits(u32(frame)),
    dataPresent: 0, advanceRan: 0, hostCallCount: 0,
  };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.dataPresent = data !== 0 ? 1 : 0;
    plan.advanceRan = plan.dataPresent;
    plan.hostCallCount = plan.advanceRan;
  }
  return plan;
}

/* ================== v19: 0x0040a740 current-anim advance (no frame) === */

export const ANM2_ADVANCE_CUR_VA = 0x0040a740;
export const ANM2_ADVANCE_CUR_END_VA = 0x0040a750;
export const ANM2_ADVANCE_CUR_BODY_BYTES = 0x11;
export const ANM2_ADVANCE_CUR_DATA_OFF = 0x34;
export const ANM2_ADVANCE_CUR_ADVANCE_OFF = 0x30;
export const ANM2_ADVANCE_CUR_ADVANCE_VA = 0x00408e00;
export const ANM2_ADVANCE_CUR_CALLSITE_COUNT = 4;
export const ANM2_ADVANCE_CUR_LUA_PUSH_COUNT = 0;
export const ANM2_ADVANCE_CUR_LE_DWORD_COUNT = 0;
export const ANM2_ADVANCE_CUR_NEXT_VA = 0x0040a760;

/**
 * 0x0040a740 FULL-dword gate. Independent of the C++:
 * `cmp dword [this+0x34], 0 ; je SKIP`. 0x100 IS needed.
 */
export function anm2AdvanceCurNeeded(dataDword) {
  return u32(dataDword) !== 0 ? 1 : 0;
}

/**
 * 0x0040a740 current-anim advance (no frame). Independent of the C++:
…
 */
export function anm2AdvanceCurPlan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, needed: 0, dataDword: 0, advanceRan: 0,
    advanceRecvOff: ANM2_ADVANCE_CUR_ADVANCE_OFF,
    hostOrAdvanceVa: ANM2_ADVANCE_CUR_ADVANCE_VA, hostCallCount: 0,
  };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    plan.dataDword = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2AdvanceCurNeeded(plan.dataDword);
    plan.advanceRan = plan.needed;
    plan.hostCallCount = plan.advanceRan;
  }
  return plan;
}

/* ================== v20: 0x0040a760 AdvancePosition to last frame === */

export const ANM2_ADVANCE_POS_CUR_VA = 0x0040a760;
export const ANM2_ADVANCE_POS_CUR_END_VA = 0x0040a778;
export const ANM2_ADVANCE_POS_CUR_BODY_BYTES = 0x19;
export const ANM2_ADVANCE_POS_CUR_DATA_OFF = 0x34;
export const ANM2_ADVANCE_POS_CUR_STATE_OFF = 0x30;
export const ANM2_ADVANCE_POS_CUR_ADVANCE_VA = 0x00408d00;
export const ANM2_ADVANCE_POS_CUR_NEXT_VA = 0x0040a780;

/**
 * 0x0040a760 FULL-dword gate. Same law as v19 0x40a740:
 * `cmp dword [this+0x34], 0 ; je SKIP`. 0x100 IS needed.
 */
export function anm2AdvancePosCurNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * 0x0040a760 target = `[data+0x30] - 1` (`dec eax`, 32-bit wrap).
 */
export function anm2AdvancePosCurTargetFromData(dataPlus030) {
  return (u32(dataPlus030) - 1) | 0;
}

/**
 * 0x0040a760 current-anim AdvancePosition to last frame.
…
 */
export function anm2AdvancePosCurPlan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, needed: 0, dataDword: 0, target: 0, advanceRan: 0,
    advanceRecvOff: ANM2_ADVANCE_POS_CUR_STATE_OFF,
    hostOrAdvanceVa: ANM2_HOST_VA_ADVANCE_POSITION, hostCallCount: 0,
  };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    plan.dataDword = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2AdvancePosCurNeeded(plan.dataDword);
    if (plan.needed !== 0) {
      const length = readU32(mem, u32(plan.dataDword + ANM2_DATA_OFF_LENGTH_30));
      plan.target = anm2AdvancePosCurTargetFromData(length);
      plan.advanceRan = 1; plan.hostCallCount = 1;
    }
  }
  return plan;
}

/* ================== v21: 0x0040a780 GetFrame-int + 0x0040a7c0 GetFrame-float === */

export const ANM2_GET_FRAME_INT_VA = 0x0040a780;
export const ANM2_GET_FRAME_INT_END_VA = 0x0040a7b3;
export const ANM2_GET_FRAME_INT_BODY_BYTES = 0x34;
export const ANM2_GET_FRAME_INT_DATA_OFF = 0x34;
export const ANM2_GET_FRAME_INT_FRAME_OFF = 0x40;
export const ANM2_GET_FRAME_INT_FLOOR_THUNK_VA = 0x00af0917;
export const ANM2_GET_FRAME_INT_CALLSITE_COUNT = 82;
export const ANM2_GET_FRAME_INT_NEXT_VA = 0x0040a7c0;
export const ANM2_GET_FRAME_F32_VA = 0x0040a7c0;
export const ANM2_GET_FRAME_F32_END_VA = 0x0040a7d4;
export const ANM2_GET_FRAME_F32_BODY_BYTES = 0x15;
export const ANM2_GET_FRAME_F32_DATA_OFF = 0x34;
export const ANM2_GET_FRAME_F32_FRAME_OFF = 0x40;
export const ANM2_GET_FRAME_F32_NULL_VA = 0x00baad50;
export const ANM2_GET_FRAME_F32_NULL_BITS = 0xbf800000;
export const ANM2_GET_FRAME_F32_CALLSITE_COUNT = 8;
export const ANM2_GET_FRAME_F32_NEXT_VA = 0x0040a7e0;

/**
 * 0x0040a780 / 0x0040a7c0 FULL-dword gate. Same law as v19 0x40a740:
 * `cmp dword [this+0x34], 0 ; je SKIP`. 0x100 IS needed.
 */
export function anm2GetFrameNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * 0x0040a780 hit tail: CRT floor then cvttss2si. Reuses v5 primitives.
 */
export function anm2GetFrameIntFromBits(frameBits) {
  return anm2Cvttss2siBits(anm2FloorF32Bits(frameBits));
}

/**
 * 0x0040a780 GetFrame-int. Independent of the C++:
 * full-dword `cmp [this+0x34], 0 ; je → -1`, else
 * cvttss2si(floor([this+0x40])). A null ANM2 is entered=0 / needed=0 / -1.
 */
export function anm2GetFrameIntPlan(mem, { anm2Addr }) {
  const plan = { entered: 0, needed: 0, dataDword: 0, frameBits: 0, floorBits: 0, result: -1 };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    plan.dataDword = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2GetFrameNeeded(plan.dataDword);
    if (plan.needed !== 0) {
      plan.frameBits = readU32(mem, u32(anm2Addr) + ANM2_GET_FRAME_INT_FRAME_OFF);
      plan.floorBits = anm2FloorF32Bits(plan.frameBits);
      plan.result = anm2GetFrameIntFromBits(plan.frameBits);
    }
  }
  return plan;
}

/**
 * 0x0040a7c0 GetFrame-float. Independent of the C++:
…
 */
export function anm2GetFrameF32Plan(mem, { anm2Addr }) {
  const plan = { entered: 0, needed: 0, dataDword: 0, resultBits: ANM2_GET_FRAME_F32_NULL_BITS };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    plan.dataDword = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2GetFrameNeeded(plan.dataDword);
    if (plan.needed !== 0) {
      plan.resultBits = readU32(mem, u32(anm2Addr) + ANM2_GET_FRAME_F32_FRAME_OFF);
    }
  }
  return plan;
}

/* ================== v22: 0x0040a7e0 layer-int frame setter === */

export const ANM2_SET_LAYER_FRAME_VA = 0x0040a7e0;
export const ANM2_SET_LAYER_FRAME_END_VA = 0x0040a85c;
export const ANM2_SET_LAYER_FRAME_BODY_BYTES = 0x7d;
export const ANM2_SET_LAYER_FRAME_DATA_OFF = 0x34;
export const ANM2_SET_LAYER_FRAME_STATE_OFF = 0x30;
export const ANM2_SET_LAYER_FRAME_COUNT_OFF = 0x80;
export const ANM2_SET_LAYER_FRAME_MAP_OFF = 0x38;
export const ANM2_SET_LAYER_FRAME_WALK_VA = 0x00408b90;
export const ANM2_SET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564;
export const ANM2_SET_LAYER_FRAME_LOG_LEVEL = 0x10;
export const ANM2_SET_LAYER_FRAME_NEXT_VA = 0x0040a860;

/**
 * 0x0040a7e0 FULL-dword gate. Same law as v19 0x40a740:
 * `cmp dword [this+0x34], 0 ; je DONE`. 0x100 IS needed.
 */
export function anm2SetLayerFrameNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * 0x0040a7e0 SIGNED layer-vs-count. `test esi,esi ; js` then
 * `cmp esi,[anim+0x80] ; jl`. 0x80000000 is negative.
 */
export function anm2SetLayerFrameLayerInRange(layer, count80) {
  return anm2LayerIndexInRange(layer, count80) ? 1 : 0;
}

/**
 * 0x0040a7e0 layer-int frame setter. Independent of the C++:
…
 */
export function anm2SetLayerFramePlan(mem, { anm2Addr, layer, frame }) {
  const plan = { needed: 0, needsLog: 0, needsWalk: 0, walkIndex: 0, frameBits: cvtdq2psBits(u32(frame)) };
  if (u32(anm2Addr) !== 0) {
    const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2SetLayerFrameNeeded(data);
    if (plan.needed !== 0) {
      const anim = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      const count80 = i32(readU32(mem, u32(anim + ANM2_OFF_LAYER_COUNT_80)));
      const inRange = anm2SetLayerFrameLayerInRange(layer, count80) ? 1 : 0;
      plan.needsLog = inRange === 0 ? 1 : 0;
      plan.needsWalk = inRange;
      if (plan.needsWalk !== 0) {
        const mapAddr = u32(data + u32(i32(layer)) * 4 + ANM2_SET_LAYER_FRAME_MAP_OFF);
        plan.walkIndex = i32(readU32(mem, mapAddr));
      }
    }
  }
  return plan;
}

/* ================== v23: 0x0040a860 name trampoline + 0x0040a8a0 GetLayerFrame-int === */

export const ANM2_SET_LAYER_FRAME_NAME_VA = 0x0040a860;
export const ANM2_SET_LAYER_FRAME_NAME_END_VA = 0x0040a89c;
export const ANM2_SET_LAYER_FRAME_NAME_BODY_BYTES = 0x3d;
export const ANM2_SET_LAYER_FRAME_NAME_GET_LAYER_VA = 0x0040b430;
export const ANM2_SET_LAYER_FRAME_NAME_SET_VA = 0x0040a7e0;
export const ANM2_SET_LAYER_FRAME_NAME_LOG_STR_VA = 0x00b1a634;
export const ANM2_SET_LAYER_FRAME_NAME_LOG_LEVEL = 4;
export const ANM2_SET_LAYER_FRAME_NAME_NEXT_VA = 0x0040a8a0;
export const ANM2_GET_LAYER_FRAME_INT_VA = 0x0040a8a0;
export const ANM2_GET_LAYER_FRAME_INT_END_VA = 0x0040a902;
export const ANM2_GET_LAYER_FRAME_INT_BODY_BYTES = 0x63;
export const ANM2_GET_LAYER_FRAME_INT_DATA_OFF = 0x34;
export const ANM2_GET_LAYER_FRAME_INT_STATE_OFF = 0x30;
export const ANM2_GET_LAYER_FRAME_INT_COUNT_OFF = 0x80;
export const ANM2_GET_LAYER_FRAME_INT_MAP_OFF = 0x38;
export const ANM2_GET_LAYER_FRAME_INT_FRAMES_OFF = 0x38;
export const ANM2_GET_LAYER_FRAME_INT_LOG_STR_VA = 0x00b1a564;
export const ANM2_GET_LAYER_FRAME_INT_LOG_LEVEL = 0x10;
export const ANM2_GET_LAYER_FRAME_INT_NEXT_VA = 0x0040a910;

/**
 * 0x0040a860 name trampoline. Independent of the C++:
…
 */
export function anm2SetLayerFrameNamePlan(mem, { anm2Addr, nameAddr, frame }) {
  const plan = {
    entered: 0, nameAddr: u32(nameAddr), frame: frame | 0, layerPtr: 0,
    needsLog: 0, needsSet: 0, setLayer: 0,
  };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    const base = readU32(mem, u32(anm2Addr) + ANM2_OFF_LAYER_STATE_7C);
    const count = readU32(mem, u32(anm2Addr) + ANM2_OFF_LAYER_COUNT_80);
    const idx = anm2FindLayerIndexByName(mem, base, count, nameAddr);
    if (idx < 0) plan.needsLog = 1;
    else {
      plan.layerPtr = u32(base + anm2LayerByteOffset(idx));
      const layerData = readU32(mem, plan.layerPtr);
      plan.setLayer = i32(readU32(mem, layerData));
      plan.needsSet = 1;
    }
  }
  return plan;
}

/**
 * 0x0040a8a0 FULL-dword gate. Same law as v19/v22:
 * `cmp dword [this+0x34], 0 ; je → -1`. 0x100 IS needed.
 */
export function anm2GetLayerFrameIntNeeded(dataDword) {
  return anm2SetLayerFrameNeeded(dataDword);
}

/**
 * 0x0040a8a0 SIGNED layer-vs-count. Same law as v22.
 * 0x80000000 is negative.
 */
export function anm2GetLayerFrameIntLayerInRange(layer, count80) {
  return anm2SetLayerFrameLayerInRange(layer, count80);
}

/**
 * 0x0040a8a0 GetLayerFrame-int. Independent of the C++:
…
 */
export function anm2GetLayerFrameIntPlan(mem, { anm2Addr, layer }) {
  const plan = { entered: 0, needed: 0, dataDword: 0, layer: layer | 0, needsLog: 0, result: -1 };
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    plan.dataDword = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = anm2GetLayerFrameIntNeeded(plan.dataDword);
    if (plan.needed !== 0) {
      const anim = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_STATE_30);
      const count80 = i32(readU32(mem, u32(anim + ANM2_OFF_LAYER_COUNT_80)));
      const inRange = anm2GetLayerFrameIntLayerInRange(layer, count80) ? 1 : 0;
      plan.needsLog = inRange === 0 ? 1 : 0;
      if (inRange === 0) plan.result = 0;
      else {
        const mapAddr = u32(plan.dataDword + u32(i32(layer)) * 4 + ANM2_GET_LAYER_FRAME_INT_MAP_OFF);
        const mapped = i32(readU32(mem, mapAddr));
        const frames = readU32(mem, u32(anm2Addr) + ANM2_GET_LAYER_FRAME_INT_FRAMES_OFF);
        plan.result = i32(readU32(mem, u32(frames + u32(mapped) * 4)));
      }
    }
  }
  return plan;
}

/* ============ v54-band4: state-receiver frame set/get trio (0x00408ef0 /
   0x00408fc0 / 0x00408f70 — unit anm2-v54-band4) ============ */

export const ANM2_STATE_SET_LAYER_FRAME_VA = 0x00408ef0;
export const ANM2_STATE_SET_LAYER_FRAME_END_VA = 0x00408f65;
export const ANM2_STATE_SET_LAYER_FRAME_BODY_BYTES = 0x76;
export const ANM2_STATE_SET_LAYER_FRAME_CALLSITE_COUNT = 30;
export const ANM2_STATE_SET_LAYER_FRAME_COUNT_OFF = 0x80;
export const ANM2_STATE_SET_LAYER_FRAME_MAP_OFF = 0x38;
export const ANM2_STATE_SET_LAYER_FRAME_DATA_COUNT_OFF = 0x1c;
export const ANM2_STATE_SET_LAYER_FRAME_WALK_VA = 0x00408b90;
export const ANM2_STATE_SET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564;
export const ANM2_STATE_SET_LAYER_FRAME_LOG_LEVEL = 0x10;
export const ANM2_STATE_SET_NULL_FRAME_VA = 0x00408fc0;
export const ANM2_STATE_SET_NULL_FRAME_END_VA = 0x00409023;
export const ANM2_STATE_SET_NULL_FRAME_BODY_BYTES = 0x64;
export const ANM2_STATE_SET_NULL_FRAME_CALLSITE_COUNT = 2;
export const ANM2_STATE_SET_NULL_FRAME_COUNT_OFF = 0x88;
export const ANM2_STATE_SET_NULL_FRAME_DATA_COUNT_OFF = 0x24;
export const ANM2_STATE_SET_NULL_FRAME_WALK_VA = 0x00408c10;
export const ANM2_STATE_SET_NULL_FRAME_LOG_STR_VA = 0x00b1a57c;
export const ANM2_STATE_SET_NULL_FRAME_LOG2_STR_VA = 0x00b1a4f0;
export const ANM2_STATE_SET_NULL_FRAME_LOG_LEVEL = 0x10;
export const ANM2_STATE_GET_LAYER_FRAME_VA = 0x00408f70;
export const ANM2_STATE_GET_LAYER_FRAME_END_VA = 0x00408fb5;
export const ANM2_STATE_GET_LAYER_FRAME_BODY_BYTES = 0x46;
export const ANM2_STATE_GET_LAYER_FRAME_CALLSITE_COUNT = 1;
export const ANM2_STATE_GET_LAYER_FRAME_COUNT_OFF = 0x80;
export const ANM2_STATE_GET_LAYER_FRAME_MAP_OFF = 0x38;
export const ANM2_STATE_GET_LAYER_FRAME_FRAMES_OFF = 0x08;
export const ANM2_STATE_GET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564;
export const ANM2_STATE_GET_LAYER_FRAME_LOG_LEVEL = 0x10;

/**
 * v54 state SetLayerFrame FULL-dword [state+4] gate. Same law as v22/v23
 * (0x100 IS needed). The hit-path map deref at 0x00408f28 is unguarded on
 * the machine — a null data with an in-range index faults; folded: no walk.
 */
export function anm2StateSetLayerFrameNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * v54 SIGNED index-vs-count (test esi,esi ; js / cmp esi,[anim+0x80] ; jl).
 * Same law as v22. 0x80000000 is negative.
 */
export function anm2StateSetLayerFrameInRange(index, count) {
  return anm2SetLayerFrameLayerInRange(index, count) ? 1 : 0;
}

/**
 * 0x00408ef0 plan — state receiver (no v22 top data gate; log1 fires for
 * ANY out-of-range index; needsWalk = in-range && data != 0; walkIndex =
 * mapped layer id; frameBits = cvtdq2ps). Independent of the C++:
 * re-implemented from the PE body; shadows load_guest_u32 semantics.
 */
export function anm2StateSetLayerFramePlan(mem, { stateAddr, layer, frame }) {
  const plan = {
    entered: 0, needsLog: 0, needsWalk: 0, walkIndex: 0,
    frameBits: cvtdq2psBits(u32(frame)),
  };
  if (u32(stateAddr) !== 0) {
    plan.entered = 1;
    const anim = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIMATION_00);
    const count80 = i32(readU32(mem, u32(anim) + ANM2_STATE_SET_LAYER_FRAME_COUNT_OFF));
    const inRange = anm2StateSetLayerFrameInRange(layer, count80) ? 1 : 0;
    plan.needsLog = inRange === 0 ? 1 : 0;
    const data = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIM_DATA_04);
    plan.needsWalk = inRange !== 0 && anm2StateSetLayerFrameNeeded(data) !== 0 ? 1 : 0;
    if (plan.needsWalk !== 0) {
      const mapAddr = u32(data + u32(i32(layer)) * 4 + ANM2_STATE_SET_LAYER_FRAME_MAP_OFF);
      plan.walkIndex = i32(readU32(mem, mapAddr));
    }
  }
  return plan;
}

/**
 * v54 state set-null-frame FULL-dword [state+4] gate. Same law as v22/v23.
 */
export function anm2StateSetNullFrameNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * v54 SIGNED index-vs-count88. Same law as v22 (count from [anim+0x88]).
 */
export function anm2StateSetNullFrameInRange(index, count) {
  return anm2SetLayerFrameLayerInRange(index, count) ? 1 : 0;
}

/**
 * 0x00408fc0 plan — state receiver null-frame setter. NO post-log
 * re-test; needsLog2 = data==0 || !in-range vs [data+0x24]; needsWalk is
 * ALWAYS 1 when entered (unconditional tail: store + 0x00408c10 call);
 * walkIndex = RAW index (may be negative). Independent of the C++:
 * re-implemented from the PE body.
 */
export function anm2StateSetNullFramePlan(mem, { stateAddr, index, frame }) {
  const plan = {
    entered: 0, needsLog1: 0, needsLog2: 0, needsWalk: 0, walkIndex: 0,
    frameBits: cvtdq2psBits(u32(frame)),
  };
  if (u32(stateAddr) !== 0) {
    plan.entered = 1;
    const anim = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIMATION_00);
    const count88 = i32(readU32(mem, u32(anim) + ANM2_STATE_SET_NULL_FRAME_COUNT_OFF));
    plan.needsLog1 = anm2StateSetNullFrameInRange(index, count88) === 0 ? 1 : 0;
    const data = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIM_DATA_04);
    if (data !== 0) {
      const count24 = i32(readU32(mem, u32(data) + ANM2_STATE_SET_NULL_FRAME_DATA_COUNT_OFF));
      plan.needsLog2 = anm2StateSetNullFrameInRange(index, count24) === 0 ? 1 : 0;
    } else {
      plan.needsLog2 = 1;
    }
    plan.needsWalk = 1;
    plan.walkIndex = index | 0;
  }
  return plan;
}

/**
 * v54 state getter FULL-dword [state+4] gate. Same law as v22/v23.
 */
export function anm2StateGetLayerFrameNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * v54 SIGNED index-vs-count80. Same law as v22.
 */
export function anm2StateGetLayerFrameInRange(index, count) {
  return anm2SetLayerFrameLayerInRange(index, count) ? 1 : 0;
}

/**
 * 0x00408f70 plan — state receiver GetLayerFrame-int. result on hit =
 * frames[mapped] with mapped = [data + index*4 + 0x38] (unguarded derefs
 * on the machine; null data folds to result 0). OOB result is pinned 0
 * (HARNESS CONVENTION: machine leaves anim ptr / logger return; the
 * single caller consumes the result only under a bounds-valid guard).
 * Independent of the C++: re-implemented from the PE body.
 */
export function anm2StateGetLayerFramePlan(mem, { stateAddr, index }) {
  const plan = { entered: 0, needsLog: 0, inRange: 0, result: 0 };
  if (u32(stateAddr) !== 0) {
    plan.entered = 1;
    const anim = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIMATION_00);
    const count80 = i32(readU32(mem, u32(anim) + ANM2_STATE_GET_LAYER_FRAME_COUNT_OFF));
    const inRange = anm2StateGetLayerFrameInRange(index, count80) ? 1 : 0;
    plan.needsLog = inRange === 0 ? 1 : 0;
    plan.inRange = inRange;
    if (inRange !== 0) {
      const data = readU32(mem, u32(stateAddr) + ANM2_STATE_OFF_ANIM_DATA_04);
      if (anm2StateGetLayerFrameNeeded(data) !== 0) {
        const mapAddr = u32(data + u32(i32(index)) * 4 + ANM2_STATE_GET_LAYER_FRAME_MAP_OFF);
        const mapped = i32(readU32(mem, mapAddr));
        const frames = readU32(mem, u32(stateAddr) + ANM2_STATE_GET_LAYER_FRAME_FRAMES_OFF);
        plan.result = i32(readU32(mem, u32(frames + u32(mapped) * 4)));
      }
    }
  }
  return plan;
}

/* ================== v24: 0x0040a910 Stop / clear playing flag === */

export const ANM2_STOP_VA = 0x0040a910;
export const ANM2_STOP_END_VA = 0x0040a91a;
export const ANM2_STOP_BODY_BYTES = 0x0b;
export const ANM2_STOP_DATA_OFF = 0x34;
export const ANM2_STOP_FLAG_OFF = 0x44;
export const ANM2_STOP_NEXT_VA = 0x0040a920;

/* ================== v25: 0x0040a920 overlay Play SSO + 0x0040a9c0 Stop === */

export const ANM2_OVERLAY_PLAY_SSO_VA = 0x0040a920;
export const ANM2_OVERLAY_PLAY_SSO_END_VA = 0x0040a936;
export const ANM2_OVERLAY_PLAY_VA = 0x0040a940;
export const ANM2_OVERLAY_PLAY_END_VA = 0x0040a9b3;
export const ANM2_OVERLAY_PLAY_APPLY_VA = 0x0040aaf0;
export const ANM2_OVERLAY_PLAY_DATA_OFF = 0x54;
export const ANM2_OVERLAY_PLAY_FLAG_OFF = 0x64;
export const ANM2_OVERLAY_PLAY_STATE_OFF = 0x50;
export const ANM2_OVERLAY_STOP_VA = 0x0040a9c0;
export const ANM2_OVERLAY_STOP_END_VA = 0x0040a9ca;
export const ANM2_OVERLAY_STOP_BODY_BYTES = 0x0b;
export const ANM2_OVERLAY_STOP_DATA_OFF = 0x54;
export const ANM2_OVERLAY_STOP_FLAG_OFF = 0x64;
export const ANM2_OVERLAY_STOP_NEXT_VA = 0x0040a9d0;

/**
 * Overlay-band Play gate inputs. Independent of the C++:
…
 */
function overlayGateFromImage(mem, anm2Addr, nameAddr, resetFlag) {
  let dataNull = 0, nameEqual = 0, data34Flag = 0, state44Flag = 0;
  if (u32(anm2Addr) !== 0) {
    const data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_DATA_OFF);
    dataNull = data === 0 ? 1 : 0;
    if (data !== 0) {
      nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
      data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
    }
    state44Flag = mem[u32(anm2Addr) + ANM2_OVERLAY_PLAY_FLAG_OFF] & 0xff;
  }
  return { resetFlag: resetFlag | 0, dataNull, nameEqual, data34Flag, state44Flag };
}

/**
 * 0x0040a920 SSO trampoline + 0x0040a940 overlay Play.
…
 */
export function anm2OverlayPlaySsoPlan(mem, { anm2Addr, strAddr, resetFlag }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, resetFlag: resetFlag | 0,
    dataNull: 0, nameEqual: 0, data34Flag: 0, state44Flag: 0, skip: 0, callApply: 0,
    applyVa: ANM2_OVERLAY_PLAY_APPLY_VA, applyResetArg: 1, rewindVa: ANM2_REWIND_VA,
    rewindRan: 0, flag44Set: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  if (u32(anm2Addr) !== 0) {
    plan.entered = 1;
    const data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_DATA_OFF);
    plan.dataNull = data === 0 ? 1 : 0;
    if (data !== 0) {
      plan.nameEqual = anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
      plan.data34Flag = mem[u32(data + ANM2_DATA_OFF_RESTART_FLAG_34)] & 0xff;
    }
    plan.state44Flag = mem[u32(anm2Addr) + ANM2_OVERLAY_PLAY_FLAG_OFF] & 0xff;
  }
  if ((u32(resetFlag) & 0xff) !== 0) plan.skip = 0;
  else plan.skip = anm2PlayGateSkip(0, plan.dataNull, plan.nameEqual, plan.data34Flag, plan.state44Flag);
  plan.callApply = plan.skip !== 0 ? 0 : 1;
  return plan;
}

/** Overlay Play apply tail: Rewind(this+0x50) + byte[this+0x64]=1. */
export function anm2OverlayPlaySsoApply(mem, { anm2Addr, strAddr, resetFlag, hostApplyAl }) {
  const plan = anm2OverlayPlaySsoPlan(mem, { anm2Addr, strAddr, resetFlag });
  if (plan.callApply !== 0 && (u32(hostApplyAl) & 0xff) !== 0) {
    plan.rewindRan = 1; plan.flag44Set = 1;
    if (u32(anm2Addr) !== 0) {
      anm2RewindApply(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_STATE_OFF);
      writeBytes(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_FLAG_OFF, 1, 1);
    }
  }
  return plan;
}

/**
 * 0x0040a9c0 FULL-dword gate. Consume v24 BY REFERENCE:
 * same law, offs 0x34/0x44 → 0x54/0x64. 0x100 IS needed.
 */
export function anm2OverlayStopNeeded(dataDword) {
  return anm2StopNeeded(dataDword);
}

/**
 * 0x0040a9c0 overlay Stop. Independent of the C++:
 * full-dword `cmp [this+0x54], 0 ; je SKIP`, else
 * `mov byte [this+0x64], 0`. A null ANM2 is a no-op.
 */
export function anm2OverlayStopApply(mem, { anm2Addr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_STOP_DATA_OFF);
  const needed = anm2OverlayStopNeeded(data);
  if (needed !== 0) writeBytes(mem, u32(anm2Addr) + ANM2_OVERLAY_STOP_FLAG_OFF, 0, 1);
  return needed;
}

/**
 * 0x0040a910 FULL-dword gate. Consume v19 BY REFERENCE:
 * `cmp dword [this+0x34], 0 ; je SKIP`. 0x100 IS needed.
 */
export function anm2StopNeeded(dataDword) {
  return anm2AdvanceCurNeeded(dataDword);
}

/**
 * 0x0040a910 Stop. Independent of the C++:
 * full-dword `cmp [this+0x34], 0 ; je SKIP`, else
 * `mov byte [this+0x44], 0`. A null ANM2 is a no-op.
 */
export function anm2StopApply(mem, { anm2Addr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OFF_ANIM_DATA_PTR_34);
  const needed = anm2StopNeeded(data);
  if (needed !== 0) writeBytes(mem, u32(anm2Addr) + ANM2_OFF_PLAYING_FLAG_44, 0, 1);
  return needed;
}

/* ================== v26: 0x0040a9d0 overlay Playing SSO + 0x0040a9f0 === */

export const ANM2_OVERLAY_PLAYING_SSO_VA = 0x0040a9d0;
export const ANM2_OVERLAY_PLAYING_SSO_END_VA = 0x0040a9e7;
export const ANM2_OVERLAY_PLAYING_VA = 0x0040a9f0;
export const ANM2_OVERLAY_PLAYING_END_VA = 0x0040aa42;
export const ANM2_OVERLAY_PLAYING_DATA_OFF = 0x54;
export const ANM2_OVERLAY_PLAYING_FLAG_OFF = 0x64;
export const ANM2_OVERLAY_PLAYING_SSO_CALLSITE_COUNT = 0;
export const ANM2_OVERLAY_PLAYING_SSO_LUA_PUSH_VA = 0x00867489;
export const ANM2_OVERLAY_PLAYING_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_OVERLAY_PLAYING_NEXT_VA = 0x0040aa50;

/**
 * 0x0040a9f0 overlay Playing pred. Consume v13 BY REFERENCE:
 * same law, offs 0x34/0x44 → 0x54/0x64. Latch is the LOW BYTE
 * (`cmp byte [this+0x64],0`), so 0x100 is CLEAR.
 */
export function anm2OverlayPlayingNamePred(mem, { anm2Addr, nameAddr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAYING_DATA_OFF);
  if (data === 0) return 0;
  if ((mem[u32(anm2Addr) + ANM2_OVERLAY_PLAYING_FLAG_OFF] & 0xff) === 0) return 0;
  if ((mem[u32(nameAddr)] & 0xff) === 0) return 1;
  return anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
}

/**
 * 0x0040a9d0 SSO trampoline + 0x0040a9f0 overlay Playing.
…
 */
export function anm2OverlayPlayingSsoPlan(mem, { anm2Addr, strAddr }) {
  const plan = {
    entered: u32(anm2Addr) !== 0 ? 1 : 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, result: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  plan.result = anm2OverlayPlayingNamePred(mem, { anm2Addr, nameAddr });
  return plan;
}

/* ================== v27: 0x0040aa50 SSO trampoline into overlay pred_alt === */

export const ANM2_OVERLAY_PLAYING_SSO_ALT_VA = 0x0040aa50;
export const ANM2_OVERLAY_PLAYING_SSO_ALT_END_VA = 0x0040aa67;
export const ANM2_OVERLAY_PLAYING_ALT_VA = 0x0040aa70;
export const ANM2_OVERLAY_PLAYING_ALT_END_VA = 0x0040aaca;
export const ANM2_OVERLAY_PLAYING_ALT_DATA_OFF = 0x54;
export const ANM2_OVERLAY_PLAYING_ALT_FLAG_OFF = 0x64;
export const ANM2_OVERLAY_PLAYING_SSO_ALT_CALLSITE_COUNT = 0;
export const ANM2_OVERLAY_PLAYING_SSO_ALT_LUA_PUSH_VA = 0x00867491;
export const ANM2_OVERLAY_PLAYING_SSO_ALT_LUA_PUSH_COUNT = 1;
export const ANM2_OVERLAY_PLAYING_SSO_ALT_NEXT_VA = 0x0040aad0;

/**
 * 0x0040aa70 overlay Playing-alt pred. Consume v14 BY REFERENCE:
…
 */
export function anm2OverlayPlayingNamePredAlt(mem, { anm2Addr, nameAddr }) {
  if (u32(anm2Addr) === 0) return 0;
  const data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAYING_ALT_DATA_OFF);
  if (data === 0) {
    void (mem[u32(nameAddr)] & 0xff);
    return u32(nameAddr) === 0 ? 1 : 0;
  }
  if ((mem[u32(anm2Addr) + ANM2_OVERLAY_PLAYING_ALT_FLAG_OFF] & 0xff) !== 0) return 0;
  if ((mem[u32(nameAddr)] & 0xff) === 0) return 1;
  return anm2StrcmpMem(mem, anm2SsoDataAddr(mem, data), nameAddr) === 0 ? 1 : 0;
}

/**
 * 0x0040aa50 SSO trampoline + 0x0040aa70 overlay Playing-alt.
…
 */
export function anm2OverlayPlayingSsoAltPlan(mem, { anm2Addr, strAddr }) {
  const plan = {
    entered: u32(anm2Addr) !== 0 ? 1 : 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0, result: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  plan.result = anm2OverlayPlayingNamePredAlt(mem, { anm2Addr, nameAddr });
  return plan;
}

/* ================== v28: 0x0040aad0 SSO trampoline into overlay apply HOST === */

export const ANM2_OVERLAY_APPLY_SSO_VA = 0x0040aad0;
export const ANM2_OVERLAY_APPLY_SSO_END_VA = 0x0040aae7;
export const ANM2_OVERLAY_APPLY_SSO_TARGET_VA = 0x0040aaf0;
export const ANM2_OVERLAY_APPLY_SSO_CALLSITE_COUNT = 0;
export const ANM2_OVERLAY_APPLY_SSO_LUA_PUSH_VA = 0x0086741b;
export const ANM2_OVERLAY_APPLY_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_OVERLAY_APPLY_SSO_NEXT_VA = 0x0040abb0;

/**
 * 0x0040aad0 std::string SSO trampoline into overlay apply HOST
…
 */
export function anm2OverlayApplySsoPlan(mem, { anm2Addr, strAddr, resetFlag }) {
  const plan = {
    entered: u32(anm2Addr) !== 0 ? 1 : 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0,
    resetFlag: resetFlag | 0, hostVa: ANM2_OVERLAY_APPLY_SSO_TARGET_VA, hostCallCount: 1,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  return plan;
}


/* ================== v29: 0x0040abb0 overlay SetFrame SSO === */

export const ANM2_OVERLAY_SET_FRAME_VA = 0x0040abb0;
export const ANM2_OVERLAY_SET_FRAME_END_VA = 0x0040abe7;
export const ANM2_OVERLAY_SET_FRAME_HOST_VA = 0x0040aaf0;
export const ANM2_OVERLAY_SET_FRAME_ADVANCE_VA = 0x00408e00;
export const ANM2_OVERLAY_SET_FRAME_CALLSITE_COUNT = 3;
export const ANM2_OVERLAY_SET_FRAME_LUA_PUSH_VA = 0x00867446;
export const ANM2_OVERLAY_SET_FRAME_LUA_PUSH_COUNT = 1;
export const ANM2_OVERLAY_SET_FRAME_RESET_IMM = 1;
export const ANM2_OVERLAY_SET_FRAME_NEXT_VA = 0x0040abf0;

/**
 * 0x0040abb0 overlay SetFrame. Independent of the C++:
 * SSO UNSIGNED `jb` against cap 0x10, `push 1` / call HOST 0x0040aaf0,
 * `test al,al`, FULL-dword `[this+0x54]`, cvtdq2ps(frame), advance
 * this+0x50. No flag store. Apply recv is 0x50 on a hit.
 */
export function anm2OverlaySetFramePlan(mem, { anm2Addr, strAddr, frame }) {
  const plan = {
    entered: 0, strAddr: u32(strAddr), cap: 0, heapUsed: 0, nameAddr: 0,
    frame: frame | 0, frameFBits: cvtdq2psBits(u32(frame)), found: 0, foundIndex: -1,
    elemByteOffset: 0, warnLogNeeded: 0, warnLogVa: 0, warnLogLevel: 0, warnLogStrVa: 0,
    applyVa: 0, applyRecvOff: 0, walkResult: 0, dataPresent: 0, advanceRan: 0,
    hostVa: ANM2_OVERLAY_SET_FRAME_HOST_VA, hostCallCount: 0,
  };
  let nameAddr = 0;
  if (u32(strAddr) !== 0) {
    const cap = readU32(mem, u32(strAddr) + ANM2_OFF_FILENAME_CAP_14);
    plan.cap = cap;
    if (u32(cap) < ANM2_SSO_CAPACITY_THRESHOLD) { plan.heapUsed = 0; nameAddr = u32(strAddr); }
    else { plan.heapUsed = 1; nameAddr = readU32(mem, strAddr); }
    plan.nameAddr = nameAddr;
  }
  const walk = anm2WalkApplyPlan(mem, {
    anm2Addr, nameAddr, resetFlag: ANM2_OVERLAY_SET_FRAME_RESET_IMM,
  });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.found = walk.found; plan.foundIndex = walk.foundIndex; plan.elemByteOffset = walk.elemByteOffset;
  plan.warnLogNeeded = walk.warnLogNeeded; plan.warnLogVa = walk.warnLogVa;
  plan.warnLogLevel = walk.warnLogLevel; plan.warnLogStrVa = walk.warnLogStrVa;
  plan.applyVa = walk.applyVa;
  if (walk.found) plan.applyRecvOff = ANM2_OVERLAY_PLAY_STATE_OFF;
  plan.walkResult = walk.result;
  let data = 0;
  if (u32(anm2Addr) !== 0) data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_DATA_OFF);
  plan.dataPresent = data !== 0 ? 1 : 0;
  plan.advanceRan = (plan.walkResult !== 0 && plan.dataPresent !== 0) ? 1 : 0;
  plan.hostCallCount = walk.hostCallCount + plan.advanceRan;
  return plan;
}


/* ================== v30: 0x0040abf0 SetOverlayFrame(const char*, int) === */

export const ANM2_OVERLAY_SET_FRAME_CSTR_VA = 0x0040abf0;
export const ANM2_OVERLAY_SET_FRAME_CSTR_END_VA = 0x0040ac1e;
export const ANM2_OVERLAY_SET_FRAME_CSTR_HOST_VA = 0x0040aaf0;
export const ANM2_OVERLAY_SET_FRAME_CSTR_ADVANCE_VA = 0x00408e00;
export const ANM2_OVERLAY_SET_FRAME_CSTR_CALLSITE_COUNT = 4;
export const ANM2_OVERLAY_SET_FRAME_CSTR_LUA_PUSH_VA = 0x00000000;
export const ANM2_OVERLAY_SET_FRAME_CSTR_LUA_PUSH_COUNT = 0;
export const ANM2_OVERLAY_SET_FRAME_CSTR_RESET_IMM = 1;
export const ANM2_OVERLAY_SET_FRAME_CSTR_NEXT_VA = 0x0040ac30;

/**
 * 0x0040abf0 SetOverlayFrame(const char*, int). Independent of the C++:
 * the cstr sibling of 0x0040abb0 with NO SSO select -- [ebp+8] is pushed
 * directly. `push 1` / call HOST 0x0040aaf0, `test al,al`, FULL-dword
 * `[this+0x54]`, cvtdq2ps(frame), advance this+0x50. No flag store.
 * Apply recv is 0x50 on a hit.
 */
export function anm2OverlaySetFrameCstrPlan(mem, { anm2Addr, nameAddr, frame }) {
  const plan = {
    entered: 0, nameAddr: u32(nameAddr), frame: frame | 0,
    frameFBits: cvtdq2psBits(u32(frame)), found: 0, foundIndex: -1,
    elemByteOffset: 0, warnLogNeeded: 0, warnLogVa: 0, warnLogLevel: 0,
    warnLogStrVa: 0, applyVa: 0, applyRecvOff: 0, walkResult: 0,
    dataPresent: 0, advanceRan: 0,
    hostVa: ANM2_OVERLAY_SET_FRAME_CSTR_HOST_VA, hostCallCount: 0,
  };
  const walk = anm2WalkApplyPlan(mem, {
    anm2Addr, nameAddr, resetFlag: ANM2_OVERLAY_SET_FRAME_CSTR_RESET_IMM,
  });
  plan.entered = u32(anm2Addr) !== 0 ? 1 : 0;
  plan.found = walk.found; plan.foundIndex = walk.foundIndex; plan.elemByteOffset = walk.elemByteOffset;
  plan.warnLogNeeded = walk.warnLogNeeded; plan.warnLogVa = walk.warnLogVa;
  plan.warnLogLevel = walk.warnLogLevel; plan.warnLogStrVa = walk.warnLogStrVa;
  plan.applyVa = walk.applyVa;
  if (walk.found) plan.applyRecvOff = ANM2_OVERLAY_PLAY_STATE_OFF;
  plan.walkResult = walk.result;
  let data = 0;
  if (u32(anm2Addr) !== 0) data = readU32(mem, u32(anm2Addr) + ANM2_OVERLAY_PLAY_DATA_OFF);
  plan.dataPresent = data !== 0 ? 1 : 0;
  plan.advanceRan = (plan.walkResult !== 0 && plan.dataPresent !== 0) ? 1 : 0;
  plan.hostCallCount = walk.hostCallCount + plan.advanceRan;
  return plan;
}

/* ================== v31: 0x0040ac30 SetOverlayFrame(int) + 0x0040ac50 =====
   PE 0x0040ac30 (ret 4):
     0x40ac34 cmp dword [ecx+0x54],0 ; je 0x40ac4a   FULL-dword gate
     0x40ac3a movd xmm1,[ebp+8]; add ecx,0x50; cvtdq2ps xmm1,xmm1
     0x40ac45 call 0x408e00                          HOST advance
     0x40ac4a pop/pop; ret 4
   [this+0x54]==0 -> je -> ret with ZERO calls/stores (pure no-op arm).
   [this+0x54]!=0 -> frame float (cvtdq2ps) + host 0x408e00 on this+0x50.
   PE 0x0040ac50 (ret):
     0x40ac50 cmp dword [ecx+0x54],0 ; jne 0x40ac5a
     0x40ac56 or eax,-1 ; ret                        +0x54==0 -> return -1
     0x40ac5a cvttss2si eax,[ecx+0x60]                +0x54!=0 -> (int)[+0x60]
   Fully pure (no calls); 0x40ac50 is address-stable (no ZHL). */

export const ANM2_SET_OVERLAY_FRAME_INT_VA = 0x0040ac30;
export const ANM2_SET_OVERLAY_FRAME_INT_END_VA = 0x0040ac4c;
export const ANM2_SET_OVERLAY_FRAME_INT_ADVANCE_VA = 0x00408e00;
export const ANM2_SET_OVERLAY_FRAME_INT_GATE_OFF = 0x54;
export const ANM2_SET_OVERLAY_FRAME_INT_RECV_OFF = 0x50;
export const ANM2_GET_OVERLAY_FRAME_VA = 0x0040ac50;
export const ANM2_GET_OVERLAY_FRAME_END_VA = 0x0040ac5f;
export const ANM2_GET_OVERLAY_FRAME_GATE_OFF = 0x54;
export const ANM2_GET_OVERLAY_FRAME_CUR_OFF = 0x60;
export const ANM2_GET_OVERLAY_FRAME_MISS = -1;

/** 0x0040ac30 SetOverlayFrame(int): [this+0x54]==0 -> pure no-op; else
 *  cvtdq2ps(frame) + HOST 0x408e00 advance on this+0x50. The gate is a
 *  FULL-dword zero test (PE `cmp dword [ecx+0x54],0`). */
export function anm2SetOverlayFrameIntPlan(mem, { anm2Addr, frame }) {
  const plan = {
    entered: 0, frame: frame | 0,
    frameFBits: cvtdq2psBits(u32(frame)),
    gate54: 0, advanceVa: ANM2_SET_OVERLAY_FRAME_INT_ADVANCE_VA,
    advanceRecvOff: ANM2_SET_OVERLAY_FRAME_INT_RECV_OFF,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_SET_OVERLAY_FRAME_INT_GATE_OFF);
  plan.gate54 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/** 0x0040ac50: [this+0x54]==0 -> -1; else (int)[this+0x60]. Fully pure. */
export function anm2GetOverlayFrameIntPlan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, gate54: 0, result: ANM2_GET_OVERLAY_FRAME_MISS,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_GET_OVERLAY_FRAME_GATE_OFF);
  plan.gate54 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    /* PE 0x40ac5a cvttss2si eax,[ecx+0x60]: float->int truncation. Mirror
       the family's C++ law: NaN, >=2^31, < -2^31 -> 0x80000000 (INDEFINITE),
       else truncation toward zero. */
    plan.result = anm2Cvttss2siBits(readU32(mem, u32(anm2Addr) + ANM2_GET_OVERLAY_FRAME_CUR_OFF));
  }
  return plan;
}

/* ================== v32: 0x0040ac60 forwarder + 0x0040ac70 id lookup ======
   FUN_0040ac60 (11 B, ret 4): push 0; add ecx,0x50; call 0x40882e; ret
     - a thin forwarder to the animation-state apply interior (family-v2
       area); arg count 1 (push 0) after ecx=this+0x50. Host call counted.
   FUN_0040ac70 (ret 4, address-stable):
     [this+4]==0 -> log 0xa112c0('AnimationData is NULL') then RELOAD [this+4]
     (the reload re-dereferences; the PE reproduces a null fault on the
     log arm — original-binary defect, NOT corrected).
     count = [anim+0x24]; count==0 -> return 0.
     loop i in [0,count): idArr = [this+0xc] (STRIDE 4), elems = [anim+0x20]
       (STRIDE 0x10): if [elem]==id && idVal=[idArr+i]>=0 (signed js) &&
       idVal < [elem+0xc] (signed jge): return idVal*0x54 + [elem+8]
       (byte offset into the element).
     not found -> return 0. Fully pure except the null-log (logger split). */

export const ANM2_ANIM_ID_LOOKUP_VA = 0x0040ac70;
export const ANM2_ANIM_ID_LOOKUP_END_VA = 0x0040acca;
export const ANM2_ANIM_ID_LOOKUP_LOG_VA = 0x00a112c0;
export const ANM2_ANIM_ID_LOOKUP_LOG_LEVEL = 0x10;
export const ANM2_ANIM_ID_LOOKUP_LOG_STR_VA = 0x00b1a504;
export const ANM2_ANIM_ID_LOOKUP_ANIM_OFF = 0x04;
export const ANM2_ANIM_ID_LOOKUP_COUNT_OFF = 0x24;
export const ANM2_ANIM_ID_LOOKUP_IDS_OFF = 0x0c;
export const ANM2_ANIM_ID_LOOKUP_ELEMS_OFF = 0x20;
export const ANM2_ANIM_ID_LOOKUP_ELEM_STRIDE = 0x10;
export const ANM2_ANIM_ID_LOOKUP_ID_OFF = 0x00;
export const ANM2_ANIM_ID_LOOKUP_BASE_OFF = 0x08;
export const ANM2_ANIM_ID_LOOKUP_LIMIT_OFF = 0x0c;
export const ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE = 0x54;
export const ANM2_FORWARDER_60_VA = 0x0040ac60;
export const ANM2_FORWARDER_60_END_VA = 0x0040ac6a;
export const ANM2_FORWARDER_60_CALL_VA = 0x0040882e;
export const ANM2_FORWARDER_60_RECV_OFF = 0x50;
export const ANM2_FORWARDER_60_ARG_COUNT = 1;
export const ANM2_FORWARDER_60_HOST_CALL_COUNT = 1;

/** 0x0040ac70 id-based anim-element lookup. count==0 or no match -> 0;
 *  else idVal*0x54 + [elem+8]. The null-anim log is the only host leaf
 *  (logger split). idVal bounds: signed >= 0 and signed < [elem+0xc]. */
export function anm2AnimIdLookupPlan(mem, { anm2Addr, id }) {
  const plan = {
    entered: 0, anim: 0, count: 0, found: 0, idVal: 0, elemBase: 0,
    elemByteOffset: 0, result: 0, logNeeded: 0,
    logVa: ANM2_ANIM_ID_LOOKUP_LOG_VA, logLevel: ANM2_ANIM_ID_LOOKUP_LOG_LEVEL,
    logStrVa: ANM2_ANIM_ID_LOOKUP_LOG_STR_VA, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  let anim = readU32(mem, u32(anm2Addr) + ANM2_ANIM_ID_LOOKUP_ANIM_OFF);
  if (anim === 0) {
    plan.logNeeded = 1;
    plan.logVa = ANM2_ANIM_ID_LOOKUP_LOG_VA;
    plan.logLevel = ANM2_ANIM_ID_LOOKUP_LOG_LEVEL;
    plan.logStrVa = ANM2_ANIM_ID_LOOKUP_LOG_STR_VA;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
    /* PE reloads [this+4] after the log (defect reproduced, not fixed). */
    anim = readU32(mem, u32(anm2Addr) + ANM2_ANIM_ID_LOOKUP_ANIM_OFF);
  }
  plan.anim = anim;
  if (anim === 0) return plan;
  const count = readU32(mem, anim + ANM2_ANIM_ID_LOOKUP_COUNT_OFF);
  plan.count = count;
  if (count === 0) return plan;
  const idArr = readU32(mem, u32(anm2Addr) + ANM2_ANIM_ID_LOOKUP_IDS_OFF);
  const elems = readU32(mem, anim + ANM2_ANIM_ID_LOOKUP_ELEMS_OFF);
  for (let i = 0; u32(i) < u32(count); i++) {
    const elem = u32(elems + Math.imul(i, ANM2_ANIM_ID_LOOKUP_ELEM_STRIDE));
    const elemId = readU32(mem, elem + ANM2_ANIM_ID_LOOKUP_ID_OFF);
    if ((elemId | 0) !== (id | 0)) continue;
    const idVal = i32(readU32(mem, u32(idArr) + Math.imul(i, 4)));
    if (idVal < 0) continue;          /* PE js skip */
    const limit = i32(readU32(mem, elem + ANM2_ANIM_ID_LOOKUP_LIMIT_OFF));
    if (idVal >= limit) continue;     /* PE jge skip */
    plan.found = 1;
    plan.idVal = idVal;
    plan.elemBase = elem;
    plan.elemByteOffset = Math.imul(idVal, ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE);
    plan.result = (Math.imul(idVal, ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE) +
      i32(readU32(mem, elem + ANM2_ANIM_ID_LOOKUP_BASE_OFF))) | 0;
    return plan;
  }
  return plan;
}

/** 0x0040ac60 thin forwarder: host call 0x40882e on this+0x50, push 0. */
export function anm2Forwarder60Plan(mem, { anm2Addr }) {
  const plan = {
    entered: 0, callVa: ANM2_FORWARDER_60_CALL_VA,
    recvOff: ANM2_FORWARDER_60_RECV_OFF, argCount: ANM2_FORWARDER_60_ARG_COUNT,
    hostCallCount: ANM2_FORWARDER_60_HOST_CALL_COUNT, pureComplete: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  return plan;
}

/* ================== v33: 0x0040ace0 extras name->index walk ===============
   PE 0x0040ace0..0x0040ad6a (ret 4), 5 int3 pad before at 0x40acdb..0x40acdf:
     [this+4]==0 -> LOG 0xa112c0('AnimationData is NULL') (call +5 into the
       logger prologue: target 0xa112c5, canonical VA 0xa112c0).
     [this] = animData obj; count = [[this]+0x88]; list = [[this]+0x84].
     count==0 -> return 0.
     loop i in [0,count): elem = list + i*0x18; SSO string at elem (cap
       [elem+0x14], inline when < 0x10 else [elem]); strcmp vs [ebp+8] name;
       equal -> return i; else i++.
     miss -> return 0. Return is the raw INDEX (no stride multiply).
   Fully pure except the null-log (logger split). */

export const ANM2_EXTRAS_NAME_INDEX_VA = 0x0040ace0;
/* v47: the hit path falls through to the stage-2 id-lookup continuation
   (PE 0x40ad6d..0x40adcc), so the function's true end is 0x40adcc — the
   v33 END_VA 0x40ad61 stopped at the miss-path ret and folded the found
   path to the raw index. */
export const ANM2_EXTRAS_NAME_INDEX_END_VA = 0x0040adcc;
export const ANM2_EXTRAS_NAME_INDEX_LOG_VA = 0x00a112c0;
export const ANM2_EXTRAS_NAME_INDEX_LOG_LEVEL = 0x10;
export const ANM2_EXTRAS_NAME_INDEX_LOG_STR_VA = 0x00b1a504;
export const ANM2_EXTRAS_NAME_INDEX_ANIM_OFF = 0x04;
export const ANM2_EXTRAS_NAME_INDEX_DATA_OFF = 0x00;
export const ANM2_EXTRAS_NAME_INDEX_COUNT_OFF = 0x88;
export const ANM2_EXTRAS_NAME_INDEX_LIST_OFF = 0x84;
export const ANM2_EXTRAS_NAME_INDEX_STRIDE = 0x18;
export const ANM2_EXTRAS_NAME_INDEX_SSO_CAP_OFF = 0x14;
export const ANM2_EXTRAS_NAME_INDEX_SSO_CAP = 0x10;
/* Stage-2 continuation (PE 0x40ad6d): [this+4] re-read + RELOAD on null,
   count2 = [anim+0x24], elems2 = [anim+0x20] stride 0x10, id array at
   [this+0xc]; [elem]==found extras index && id_val>=0 (js) &&
   id_val<[elem+0xc] (jl) -> result = id_val*0x54 + [elem+8]. Same elems
   layout as the v32 0x40ac70 id-lookup contract. */
export const ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF = 0x04;
export const ANM2_EXTRAS_NAME_INDEX_COUNT2_OFF = 0x24;
export const ANM2_EXTRAS_NAME_INDEX_ELEMS2_OFF = 0x20;
export const ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE = 0x10;
export const ANM2_EXTRAS_NAME_INDEX_ID_ARR_OFF = 0x0c;
export const ANM2_EXTRAS_NAME_INDEX_ELEM2_ID_OFF = 0x00;
export const ANM2_EXTRAS_NAME_INDEX_ELEM2_BASE_OFF = 0x08;
export const ANM2_EXTRAS_NAME_INDEX_ELEM2_LIMIT_OFF = 0x0c;
export const ANM2_EXTRAS_NAME_INDEX_FOUND_STRIDE = 0x54;

/** 0x0040ace0 extras name->index + stage-2 id-lookup continuation.
 *  Stage 1: SSO strcmp walk over [[this]+0x84] (count [[this]+0x88],
 *  stride 0x18); [this+4]==0 -> log (NO reload) but the WALK STILL RUNS.
 *  count0/miss -> result 0.
 *  Stage 2 (v47, only on a name hit): anim=[this+4] re-read; null ->
 *  log + RELOAD; count2=[anim+0x24]; elems2=[anim+0x20] stride 0x10;
 *  id_arr=[this+0xc]; first j with [elem]==found && id_val=[id_arr+j*4]
 *  >=0 (signed) && id_val<[elem+0xc] (signed) -> result = id_val*0x54 +
 *  [elem+8]; else result 0. Null-anim logs are the only host leaves. */
export function anm2ExtrasNameIndexPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, anim: 0, count: 0, found: -1, result: 0,
    logNeeded: 0, logVa: ANM2_EXTRAS_NAME_INDEX_LOG_VA,
    logLevel: ANM2_EXTRAS_NAME_INDEX_LOG_LEVEL,
    logStrVa: ANM2_EXTRAS_NAME_INDEX_LOG_STR_VA,
    hostCallCount: 0, pureComplete: 1,
    anim2: 0, count2: 0, elems2: 0, idArr: 0, idVal: 0,
    elemByteOffset: -1, found2: 0, stage2Log: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  /* PE 0x40acf3 cmp [edi+4],0: [this+4] gates the null-log (ANIM_OFF).
     PE 0x40ad04 mov esi,[edi]: the WALK base is [this] (DATA_OFF), count
     at [base+0x88], list at [base+0x84]. The log does NOT stop the walk
     (v33's early-out was a fold). */
  const anim = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_INDEX_ANIM_OFF);
  plan.anim = anim;
  if (anim === 0) {
    plan.logNeeded = 1;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  const base = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_INDEX_DATA_OFF);
  const count = readU32(mem, base + ANM2_EXTRAS_NAME_INDEX_COUNT_OFF);
  plan.count = count;
  let found = -1;
  if (count !== 0) {
    const list = readU32(mem, base + ANM2_EXTRAS_NAME_INDEX_LIST_OFF);
    for (let i = 0; u32(i) < u32(count); i++) {
      const elem = u32(list + Math.imul(i, ANM2_EXTRAS_NAME_INDEX_STRIDE));
      const cap = readU32(mem, elem + ANM2_EXTRAS_NAME_INDEX_SSO_CAP_OFF);
      const str = cap < ANM2_EXTRAS_NAME_INDEX_SSO_CAP
        ? elem
        : readU32(mem, elem);
      if (anm2StrcmpMem(mem, str, u32(nameAddr)) === 0) {
        found = i;
        break;
      }
    }
  }
  plan.found = found;
  if (found >= 0) {
    /* Stage-2 continuation (PE 0x40ad6d..0x40adcc), reached only on a hit. */
    let anim2 = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF);
    if (anim2 === 0) {
      plan.stage2Log = 1;
      plan.hostCallCount += 1;
      plan.pureComplete = 0;
      anim2 = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF);
    }
    plan.anim2 = anim2;
    if (anim2 !== 0) {
      const count2 = readU32(mem, anim2 + ANM2_EXTRAS_NAME_INDEX_COUNT2_OFF);
      plan.count2 = count2;
      if (count2 !== 0) {
        const elems2 = readU32(mem, anim2 + ANM2_EXTRAS_NAME_INDEX_ELEMS2_OFF);
        const idArr = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_INDEX_ID_ARR_OFF);
        plan.elems2 = elems2;
        plan.idArr = idArr;
        for (let j = 0; u32(j) < u32(count2); j++) {
          const elem2 = u32(elems2 + Math.imul(j, ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE));
          const elemId = i32(readU32(mem, elem2 + ANM2_EXTRAS_NAME_INDEX_ELEM2_ID_OFF));
          if (elemId !== found) continue;
          /* PE 0x40ad9e test ecx,ecx; js — SIGNED id_val >= 0. */
          const idVal = i32(readU32(mem, idArr + Math.imul(j, 4)));
          if (idVal < 0) continue;
          /* PE 0x40ada2 cmp ecx,[eax+0xc]; jl — SIGNED strict <. */
          const limit = i32(readU32(mem, elem2 + ANM2_EXTRAS_NAME_INDEX_ELEM2_LIMIT_OFF));
          if (idVal >= limit) continue;
          /* PE 0x40adbf imul ecx,ecx,0x54; add ecx,[eax+8]. */
          plan.found2 = 1;
          plan.idVal = idVal;
          plan.elemByteOffset = Math.imul(j, ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE);
          plan.result = (Math.imul(idVal, ANM2_EXTRAS_NAME_INDEX_FOUND_STRIDE) +
            i32(readU32(mem, elem2 + ANM2_EXTRAS_NAME_INDEX_ELEM2_BASE_OFF))) | 0;
          break;
        }
      }
    }
  }
  return plan;
}

/* ================== v34: 0x0040af10 GetAnimation two-stage ===============
   PE 0x0040af10..0x0040aff7 (ret 4), 3 int3 pad before at 0x40af0d..0x40af0f.
   Stage 1 (name -> outer index, miss -1):
     [this+4]==0 -> log 'AnimationData is NULL' (0xa112c0).
     data=[this]; count=[data+0x90]; list=[data+0x8c] (SSO stride 0x18).
     strcmp(es vs [ebp+8]); match -> outer = ebx (index); count0/miss -> -1.
   Stage 2 (inner id-match + min-delta scan):
     inner=[this+4] (re-read); result=-1; elems=[inner+0x28]; count2=[inner+0x2c];
     loop ecx in [0,count2): if [elems+ecx*4] == outer:
       payload=[elems+ecx*4+4]; frameInt=cvttss2si([this+0x10]);
       delta=frameInt-payload; if delta>0 && (delta<best||best<0? per esi law):
       keep best payload. Return best or -1.
   The esi min-scan: esi starts -1; delta>0 && (first || delta<esi) keeps payload.
   Fully pure except the null-log. */

export const ANM2_GET_ANIM_TWO_STAGE_VA = 0x0040af10;
export const ANM2_GET_ANIM_TWO_STAGE_END_VA = 0x0040aff5;
export const ANM2_GET_ANIM_TWO_STAGE_LOG_VA = 0x00a112c0;
export const ANM2_GET_ANIM_TWO_STAGE_LOG_LEVEL = 0x10;
export const ANM2_GET_ANIM_TWO_STAGE_LOG_STR_VA = 0x00b1a504;
export const ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF = 0x04;
export const ANM2_GET_ANIM_TWO_STAGE_DATA_OFF = 0x00;
export const ANM2_GET_ANIM_TWO_STAGE_COUNT_OFF = 0x90;
export const ANM2_GET_ANIM_TWO_STAGE_LIST_OFF = 0x8c;
export const ANM2_GET_ANIM_TWO_STAGE_STRIDE = 0x18;
export const ANM2_GET_ANIM_TWO_STAGE_SSO_CAP_OFF = 0x14;
export const ANM2_GET_ANIM_TWO_STAGE_SSO_CAP = 0x10;
export const ANM2_GET_ANIM_TWO_STAGE_INNER_ELEMS_OFF = 0x28;
export const ANM2_GET_ANIM_TWO_STAGE_INNER_COUNT_OFF = 0x2c;
export const ANM2_GET_ANIM_TWO_STAGE_FRAME_FLOAT_OFF = 0x10;
export const ANM2_GET_ANIM_TWO_STAGE_MISS = -1;

/** 0x0040af10 GetAnimation: outer name->index (miss -1) then inner id-match
 *  kept as the minimum-delta payload (frame - payload > 0), else -1. */
export function anm2GetAnimTwoStagePlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, outer: -1, count: 0, foundOuter: 0, innerCount: 0,
    frameInt: 0, bestDelta: -1, bestPayload: -1, result: ANM2_GET_ANIM_TWO_STAGE_MISS,
    logNeeded: 0, logVa: ANM2_GET_ANIM_TWO_STAGE_LOG_VA,
    logLevel: ANM2_GET_ANIM_TWO_STAGE_LOG_LEVEL,
    logStrVa: ANM2_GET_ANIM_TWO_STAGE_LOG_STR_VA,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const anim = readU32(mem, u32(anm2Addr) + ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF);
  if (anim === 0) {
    plan.logNeeded = 1;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
    return plan;
  }
  const data = readU32(mem, u32(anm2Addr) + ANM2_GET_ANIM_TWO_STAGE_DATA_OFF);
  const count = readU32(mem, data + ANM2_GET_ANIM_TWO_STAGE_COUNT_OFF);
  plan.count = count;
  if (count !== 0) {
    const list = readU32(mem, data + ANM2_GET_ANIM_TWO_STAGE_LIST_OFF);
    for (let o = 0; u32(o) < u32(count); o++) {
      const elem = u32(list + Math.imul(o, ANM2_GET_ANIM_TWO_STAGE_STRIDE));
      const cap = readU32(mem, elem + ANM2_GET_ANIM_TWO_STAGE_SSO_CAP_OFF);
      const str = cap < ANM2_GET_ANIM_TWO_STAGE_SSO_CAP ? elem : readU32(mem, elem);
      if (anm2StrcmpMem(mem, str, u32(nameAddr)) === 0) {
        plan.outer = o;
        plan.foundOuter = 1;
        break;
      }
    }
  }
  if (plan.foundOuter === 0) return plan; /* miss -> -1 */
  const inner = readU32(mem, u32(anm2Addr) + ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF);
  const innerCount = readU32(mem, inner + ANM2_GET_ANIM_TWO_STAGE_INNER_COUNT_OFF);
  plan.innerCount = innerCount;
  plan.frameInt = anm2Cvttss2siBits(readU32(mem, u32(anm2Addr) + ANM2_GET_ANIM_TWO_STAGE_FRAME_FLOAT_OFF));
  if (innerCount === 0) return plan; /* result -1 */
  const elems = readU32(mem, inner + ANM2_GET_ANIM_TWO_STAGE_INNER_ELEMS_OFF);
  let best = -1, bestDelta = -1;
  for (let i = 0; u32(i) < u32(innerCount); i++) {
    const id = readU32(mem, u32(elems) + Math.imul(i, 8)); /* sib scale 8 */
    if (i32(id) !== plan.outer) continue;
    const payload = i32(readU32(mem, u32(elems) + Math.imul(i, 8) + 4));
    const delta = (plan.frameInt - payload) | 0;
    if (delta <= 0) continue;                    /* jle skip */
    if (bestDelta < 0 || delta < bestDelta) {    /* esi min-scan (js positive) */
      bestDelta = delta;
      best = payload;
    }
  }
  plan.bestDelta = bestDelta;
  plan.bestPayload = best;
  plan.result = best;
  return plan;
}

/* ================== v35: 0x0040b0c0 three-stage index lookup ==============
   PE 0x0040b0c0..0x0040b1a2 (ret 0xc — THREE args: (this, dataName, extraName,
   id)). Stage 1: call 0x0040bcd0 (AD name walk, family v6 BY REFERENCE) on
   arg1 -> data ptr (miss -> fail). Stage 2: extras walk count [this+0x88] /
   list [this+0x84] (SSO stride 0x18) vs arg2 -> extra index (cmovne; miss ->
   fail log 0xa112c0(1, 0xb1a650)). Stage 3: inner id-match on the data:
   elems [data+0x20] stride 0x10, count [data+0x24]; [elems+i*4]==arg3 with
   signed bounds -> byte offset arg3*0x54 + [elems+i*4+8]; miss -> 0.
   Fully pure except the fail log. */

export const ANM2_THREE_STAGE_LOOKUP_VA = 0x0040b0c0;
export const ANM2_THREE_STAGE_LOOKUP_END_VA = 0x0040b19f;
export const ANM2_THREE_STAGE_LOOKUP_AD_WALK_VA = 0x0040bcd0;
export const ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_VA = 0x00a112c0;
export const ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_LEVEL = 1;
export const ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_STR_VA = 0x00b1a650;
export const ANM2_THREE_STAGE_LOOKUP_EXTRAS_COUNT_OFF = 0x88;
export const ANM2_THREE_STAGE_LOOKUP_EXTRAS_LIST_OFF = 0x84;
export const ANM2_THREE_STAGE_LOOKUP_EXTRAS_STRIDE = 0x18;
export const ANM2_THREE_STAGE_LOOKUP_SSO_CAP_OFF = 0x14;
export const ANM2_THREE_STAGE_LOOKUP_SSO_CAP = 0x10;
export const ANM2_THREE_STAGE_LOOKUP_INNER_COUNT_OFF = 0x24;
export const ANM2_THREE_STAGE_LOOKUP_INNER_ELEMS_OFF = 0x20;
export const ANM2_THREE_STAGE_LOOKUP_INNER_STRIDE = 0x10;
export const ANM2_THREE_STAGE_LOOKUP_INNER_ID_OFF = 0x00;
export const ANM2_THREE_STAGE_LOOKUP_INNER_BASE_OFF = 0x08;
export const ANM2_THREE_STAGE_LOOKUP_INNER_LIMIT_OFF = 0x0c;
export const ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE = 0x54;

/** 0x0040b0c0: AD name walk (0x40bcd0) -> extras walk -> inner id-match.
 *  Stage 3 return: arg3*0x54 + [elem+8]; all misses -> 0. */
export function anm2ThreeStageLookupPlan(mem, { anm2Addr, dataNameAddr, extraNameAddr, id }) {
  const plan = {
    entered: 0, data: 0, dataFound: 0, extraIndex: -1, extraFound: 0,
    innerCount: 0, innerIdVal: 0, elemByteOffset: 0, result: 0,
    failLogNeeded: 0, failLogVa: ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_VA,
    failLogLevel: ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_LEVEL,
    failLogStrVa: ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_STR_VA,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  /* Stage 1: AD name walk (0x40bcd0). [this+0x74] base, [this+0x78] count. */
  const adBase = readU32(mem, u32(anm2Addr) + 0x74);
  const adCount = readU32(mem, u32(anm2Addr) + 0x78);
  const dataIndex = anm2AnimDataIndexByName(mem, adBase, adCount, u32(dataNameAddr));
  if (dataIndex < 0) return plan; /* miss -> 0 */
  plan.dataFound = 1;
  const data = u32(adBase + Math.imul(dataIndex, ANM2_ANIM_DATA_STRIDE));
  plan.data = data;
  /* Stage 2: extras walk vs extraNameAddr. */
  const exCount = readU32(mem, u32(anm2Addr) + ANM2_THREE_STAGE_LOOKUP_EXTRAS_COUNT_OFF);
  if (exCount !== 0) {
    const exList = readU32(mem, u32(anm2Addr) + ANM2_THREE_STAGE_LOOKUP_EXTRAS_LIST_OFF);
    for (let i = 0; u32(i) < u32(exCount); i++) {
      const elem = u32(exList + Math.imul(i, ANM2_THREE_STAGE_LOOKUP_EXTRAS_STRIDE));
      const cap = readU32(mem, elem + ANM2_THREE_STAGE_LOOKUP_SSO_CAP_OFF);
      const str = cap < ANM2_THREE_STAGE_LOOKUP_SSO_CAP ? elem : readU32(mem, elem);
      if (anm2StrcmpMem(mem, str, u32(extraNameAddr)) === 0) {
        plan.extraIndex = i;
        plan.extraFound = 1;
        break;
      }
    }
  }
  if (plan.extraFound === 0) {
    plan.failLogNeeded = 1;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
    return plan;
  }
  /* Stage 3: inner id-match on the data block. */
  const innerCount = readU32(mem, data + ANM2_THREE_STAGE_LOOKUP_INNER_COUNT_OFF);
  plan.innerCount = innerCount;
  if (innerCount === 0) return plan;
  const elems = readU32(mem, data + ANM2_THREE_STAGE_LOOKUP_INNER_ELEMS_OFF);
  for (let i = 0; u32(i) < u32(innerCount); i++) {
    const elem = u32(elems + Math.imul(i, ANM2_THREE_STAGE_LOOKUP_INNER_STRIDE));
    const elemId = readU32(mem, elem + ANM2_THREE_STAGE_LOOKUP_INNER_ID_OFF);
    if (i32(elemId) !== (id | 0)) continue;
    const idVal = i32(id);
    const limit = i32(readU32(mem, elem + ANM2_THREE_STAGE_LOOKUP_INNER_LIMIT_OFF));
    if (idVal < 0 || idVal >= limit) continue; /* signed js / jge */
    plan.innerIdVal = idVal;
    plan.elemByteOffset = Math.imul(idVal, ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE);
    plan.result = (Math.imul(idVal, ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE) +
      i32(readU32(mem, elem + ANM2_THREE_STAGE_LOOKUP_INNER_BASE_OFF))) | 0;
    break;
  }
  return plan;
}

/* ================== v36: 0x0040b23a bounds-checked element getter ==========
   PE 0x0040b23a..0x0040b2e8 (ret 4, SEH prologue using [0xbf93b4] cookie).
   arg [ebp+8] = index. [this+0x80] = count (unsigned-ish); [this+0x7c] =
   element base. index < 0 (js) OR index >= [this+0x80] (signed jge) ->
   log 0xa112c0(0x10, 0xb1a68c) 'out of range' + fail (return 0).
   else element = [this+0x7c] + index*0xa0 (lea [esi+esi*4]; shl 5 = *0xa0).
   Fully pure except the range log. The 0xa0 stride is the family's
   ANM2_LAYER_STATE_STRIDE. */

export const ANM2_BOUNDED_ELEM_GET_VA = 0x0040b23a;
export const ANM2_BOUNDED_ELEM_GET_END_VA = 0x0040b2e8;
export const ANM2_BOUNDED_ELEM_GET_LOG_VA = 0x00a112c0;
export const ANM2_BOUNDED_ELEM_GET_LOG_LEVEL = 0x10;
export const ANM2_BOUNDED_ELEM_GET_LOG_STR_VA = 0x00b1a68c;
export const ANM2_BOUNDED_ELEM_GET_BASE_OFF = 0x7c;
export const ANM2_BOUNDED_ELEM_GET_COUNT_OFF = 0x80;
export const ANM2_BOUNDED_ELEM_GET_STRIDE = 0xa0;

/** 0x0040b23a: bounds-checked element getter. index<0 or index>=count ->
 *  range log (host); else base + index*0xa0. */
export function anm2BoundedElemGetPlan(mem, { anm2Addr, index }) {
  const plan = {
    entered: 0, count: 0, base: 0, index: index | 0, elem: 0,
    inRange: 0, logNeeded: 0, logVa: ANM2_BOUNDED_ELEM_GET_LOG_VA,
    logLevel: ANM2_BOUNDED_ELEM_GET_LOG_LEVEL,
    logStrVa: ANM2_BOUNDED_ELEM_GET_LOG_STR_VA,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const count = i32(readU32(mem, u32(anm2Addr) + ANM2_BOUNDED_ELEM_GET_COUNT_OFF));
  const base = readU32(mem, u32(anm2Addr) + ANM2_BOUNDED_ELEM_GET_BASE_OFF);
  plan.count = count;
  plan.base = base;
  const idx = index | 0;
  if (idx < 0 || idx >= count) {
    plan.logNeeded = 1;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
    return plan;
  }
  plan.inRange = 1;
  plan.elem = (base + Math.imul(idx, ANM2_BOUNDED_ELEM_GET_STRIDE)) >>> 0;
  return plan;
}

/* ================== v37: 0x0040b44a layer-array name->index ================
   PE 0x0040b44a (ret 4). count = [this+0x80]; base = [this+0x7c]; stride
   0xa0 (the LAYER_STATE_STRIDE). loop i in [0,count): elem = [base+i*0xa0]
   (the ELEMENT POINTER at the slot); if elem==0 skip; SSO name at elem
   (elem+0? the element's std::string: cap [elem+0x14]... the PE does
   add eax,8; cmp [eax+0x14],0x10 -> the string is at elem+8 with cap
   elem+8+0x14 = elem+0x1c? Let me re-read: 'mov eax,[eax]' elem;
   'test eax,eax; je skip'; 'add eax,8'; 'cmp [eax+0x14],0x10; jb; mov eax,[eax]'
   -> str = elem+8, cap at elem+8+0x14 = elem+0x1c; inline when cap<0x10
   else [elem+8]. Compare vs [ebp+8]; match -> return index*0xa0 + base
   (the ELEMENT ADDRESS); miss/count0 -> 0. */

export const ANM2_LAYER_NAME_INDEX_VA = 0x0040b44a;
export const ANM2_LAYER_NAME_INDEX_END_VA = 0x0040b4ab;
export const ANM2_LAYER_NAME_INDEX_BASE_OFF = 0x7c;
export const ANM2_LAYER_NAME_INDEX_COUNT_OFF = 0x80;
export const ANM2_LAYER_NAME_INDEX_STRIDE = 0xa0;
export const ANM2_LAYER_NAME_INDEX_NAME_OFF = 0x08;
export const ANM2_LAYER_NAME_INDEX_SSO_CAP_OFF = 0x1c;
export const ANM2_LAYER_NAME_INDEX_SSO_CAP = 0x10;
export const ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA = 0x00b1a4ec;

/** 0x0040b44a layer-array name->index. Each slot holds a POINTER to the
 *  element; the name is at element+8 (SSO cap element+0x1c); match returns
 *  index*0xa0 + base (element address); miss -> 0. */
export function anm2LayerNameIndexPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, count: 0, base: 0, foundIndex: -1, elem: 0,
    result: 0, logNeeded: 0, logVa: ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA,
    logLevel: 0, logStrVa: ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const count = readU32(mem, u32(anm2Addr) + ANM2_LAYER_NAME_INDEX_COUNT_OFF);
  const base = readU32(mem, u32(anm2Addr) + ANM2_LAYER_NAME_INDEX_BASE_OFF);
  plan.count = i32(count);
  plan.base = base;
  if (count === 0) return plan;
  for (let i = 0; u32(i) < count; i++) {
    const slot = u32(base + Math.imul(i, ANM2_LAYER_NAME_INDEX_STRIDE));
    const elemPtr = readU32(mem, slot);
    if (elemPtr === 0) continue;
    const elem = u32(elemPtr);
    const nameAt = elem + ANM2_LAYER_NAME_INDEX_NAME_OFF;
    const cap = readU32(mem, nameAt + 0x14); /* [elem+8+0x14] = elem+0x1c */
    const str = cap < ANM2_LAYER_NAME_INDEX_SSO_CAP
      ? nameAt
      : readU32(mem, nameAt);
    if (anm2StrcmpMem(mem, str, u32(nameAddr)) === 0) {
      plan.foundIndex = i;
      plan.elem = (base + Math.imul(i, ANM2_LAYER_NAME_INDEX_STRIDE)) >>> 0;
      plan.result = (base + Math.imul(i, ANM2_LAYER_NAME_INDEX_STRIDE)) >>> 0;
      break;
    }
  }
  return plan;
}

/* ================== v38: 0x0040b310 layer name->slot SIZED eq ==============
   PE 0x0040b310..0x0040b421 (ret 4, SEH). count=[this+0x80]; base=[this+0x7c];
   stride 0xa0. arg = std::string* ([ebp+8]). Loop i in [0,count) UNSIGNED jb
   (cmp ebx,[this+0x80]; jb):
     slot = base + i*0xa0; elem_ptr = [slot]           (POINTER to element)
     elem_ptr==0 -> local = empty (size 0, cap 0xf)
     else name = std::string at elem+8 (SSO cap elem+0x1c jb 0x10 inline)
     sized-eq(local, arg): sizes EQUAL AND bytes EQUAL (PE 0x40cae0; returns 1)
     equal -> return base + i*0xa0 (the SLOT address, like v36/v37 shape)
   none equal or count==0 -> 0. Heap locals (cap>=0x10) get an MSVC sized-free
   (0xaef15c) + block validation (ja -> noreturn 0xb18894) — both platform
   primitives (allocator decision), not game logic. */

export const ANM2_LAYER_SLOT_SIZED_EQ_VA = 0x0040b310;
export const ANM2_LAYER_SLOT_SIZED_EQ_END_VA = 0x0040b421;
export const ANM2_LAYER_SLOT_SIZED_EQ_BASE_OFF = 0x7c;
export const ANM2_LAYER_SLOT_SIZED_EQ_COUNT_OFF = 0x80;
export const ANM2_LAYER_SLOT_SIZED_EQ_STRIDE = 0xa0;
export const ANM2_LAYER_SLOT_SIZED_EQ_NAME_OFF = 0x08;
export const ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP_OFF = 0x1c;
export const ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP = 0x10;
export const ANM2_LAYER_SLOT_SIZED_EQ_EQ_HELPER_VA = 0x0040cae0;
export const ANM2_LAYER_SLOT_SIZED_EQ_FREE_VA = 0x00aef15c;
export const ANM2_LAYER_SLOT_SIZED_EQ_INVALID_PARAM_VA = 0x00b18894;

/** 0x0040b310: slot whose element name SIZE-EQUALS the arg std::string
 *  (0x40cae0 semantics: size equal AND byte-equal). Returns the SLOT address
 *  base+i*0xa0; 0 when none. Null slots compare as the empty string. */
export function anm2LayerSlotSizedEqPlan(mem, { anm2Addr, argAddr }) {
  const plan = {
    entered: 0, count: 0, base: 0, foundIndex: -1, slot: 0,
    result: 0, argSize: 0, localHeapCount: 0,
    logNeeded: 0, logVa: 0, logLevel: 0, logStrVa: 0,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const count = readU32(mem, u32(anm2Addr) + ANM2_LAYER_SLOT_SIZED_EQ_COUNT_OFF);
  const base = readU32(mem, u32(anm2Addr) + ANM2_LAYER_SLOT_SIZED_EQ_BASE_OFF);
  plan.count = i32(count);
  plan.base = base;
  /* arg std::string at u32(argAddr): size +0x10, cap +0x14, chars/ptr +0. */
  const argSize = readU32(mem, u32(argAddr) + 0x10);
  const argCap = readU32(mem, u32(argAddr) + 0x14);
  const argData = argCap < ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP
    ? u32(argAddr)
    : readU32(mem, u32(argAddr));
  plan.argSize = i32(argSize);
  for (let i = 0; u32(i) < count; i++) {
    const slot = u32(base + Math.imul(i, ANM2_LAYER_SLOT_SIZED_EQ_STRIDE));
    const elemPtr = readU32(mem, slot);
    let localSize = 0;
    let localData = 0;
    if (elemPtr !== 0) {
      const nameAt = u32(elemPtr) + ANM2_LAYER_SLOT_SIZED_EQ_NAME_OFF;
      const cap = readU32(mem, nameAt + 0x14);
      localSize = readU32(mem, nameAt + 0x10);
      if (cap >= ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP) {
        plan.localHeapCount += 1;
        localData = readU32(mem, nameAt);
      } else {
        localData = nameAt;
      }
    }
    if (localSize === argSize && bytesEqual(mem, localData, argData, argSize)) {
      plan.foundIndex = i;
      plan.slot = slot;
      plan.result = slot;
      break;
    }
  }
  return plan;
}

/* ================== v39: 0x0040b4d0 +0x84/+0x88 bounded getter ============
   PE 0x0040b4d0..0x0040b513 (ret 4). count=[this+0x88]; base=[this+0x84];
   stride 0xc (lea [edi+edi*2] then lea [eax+ecx*4] = index*12). index<0 (js)
   OR index>=[this+0x88] (SIGNED jl) -> side-effect log 0xa112c0(0x10,
   0xb1a6a8 "%s: No null with Id %d\n", this-name SSO, index). The RESULT is
   computed UNCONDITIONALLY (the log does not skip the return):
   base + index*0xc. this-name for the log: SSO at this+0, cap this+0x14. */

export const ANM2_SUBARRAY_GET_VA = 0x0040b4d0;
export const ANM2_SUBARRAY_GET_END_VA = 0x0040b513;
export const ANM2_SUBARRAY_GET_BASE_OFF = 0x84;
export const ANM2_SUBARRAY_GET_COUNT_OFF = 0x88;
export const ANM2_SUBARRAY_GET_STRIDE = 0x0c;
export const ANM2_SUBARRAY_GET_LOG_VA = 0x00a112c0;
export const ANM2_SUBARRAY_GET_LOG_LEVEL = 0x10;
export const ANM2_SUBARRAY_GET_LOG_STR_VA = 0x00b1a6a8;
export const ANM2_SUBARRAY_GET_NAME_CAP_OFF = 0x14;
export const ANM2_SUBARRAY_GET_SSO_CAP = 0x10;

/** 0x0040b4d0: bounded getter over the +0x84/+0x88 sub-array (stride 0xc).
 *  index<0 or index>=count (SIGNED) -> range log with this-name; result =
 *  base + index*0xc ALWAYS. */
export function anm2SubarrayGetPlan(mem, { anm2Addr, index }) {
  const plan = {
    entered: 0, count: 0, base: 0, index: index | 0, result: 0,
    inRange: 0, logNeeded: 0, logVa: ANM2_SUBARRAY_GET_LOG_VA,
    logLevel: ANM2_SUBARRAY_GET_LOG_LEVEL,
    logStrVa: ANM2_SUBARRAY_GET_LOG_STR_VA,
    logNameAddr: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const count = i32(readU32(mem, u32(anm2Addr) + ANM2_SUBARRAY_GET_COUNT_OFF));
  const base = readU32(mem, u32(anm2Addr) + ANM2_SUBARRAY_GET_BASE_OFF);
  plan.count = count;
  plan.base = base;
  const idx = index | 0;
  /* this-name SSO for the log: cap [this+0x14]; inline this else [this]. */
  const nameCap = readU32(mem, u32(anm2Addr) + ANM2_SUBARRAY_GET_NAME_CAP_OFF);
  plan.logNameAddr = nameCap < ANM2_SUBARRAY_GET_SSO_CAP
    ? u32(anm2Addr)
    : readU32(mem, u32(anm2Addr));
  if (idx < 0 || idx >= count) {
    plan.logNeeded = 1;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  } else {
    plan.inRange = 1;
  }
  plan.result = (base + Math.imul(idx, ANM2_SUBARRAY_GET_STRIDE)) >>> 0;
  return plan;
}

/* ================== v40: 0x0040b520 +0x84/+0x88 name->index ===============
   PE 0x0040b520..0x0040b589 (ret 4). Same sub-array as v39: count=[this+0x88]
   (SIGNED: jle count<=0 -> -1; jl loop bound), base=[this+0x84], stride 0x18
   (24-byte elements). Element name std::string at elem+0, SSO cap elem+0x14
   (jb 0x10 inline, else heap ptr [elem+0]). Compare via 2-byte strcmp loop
   against the arg C-string ([ebp+8]). Match -> index i; no match/count<=0 ->
   -1 (NOT 0, unlike v37). Truly pure. */

export const ANM2_SUBARRAY_NAME_INDEX_VA = 0x0040b520;
export const ANM2_SUBARRAY_NAME_INDEX_END_VA = 0x0040b589;
export const ANM2_SUBARRAY_NAME_INDEX_BASE_OFF = 0x84;
export const ANM2_SUBARRAY_NAME_INDEX_COUNT_OFF = 0x88;
export const ANM2_SUBARRAY_NAME_INDEX_STRIDE = 0x18;
export const ANM2_SUBARRAY_NAME_INDEX_SSO_CAP_OFF = 0x14;
export const ANM2_SUBARRAY_NAME_INDEX_SSO_CAP = 0x10;

/** 0x0040b520: name->index over the +0x84/+0x88 sub-array (stride 0x18).
 *  Match -> index; no match / count<=0 (SIGNED) -> -1. */
export function anm2SubarrayNameIndexPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, count: 0, base: 0, foundIndex: -1, result: -1,
    nameAddr: u32(nameAddr), heapCount: 0,
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const count = i32(readU32(mem, u32(anm2Addr) + ANM2_SUBARRAY_NAME_INDEX_COUNT_OFF));
  const base = readU32(mem, u32(anm2Addr) + ANM2_SUBARRAY_NAME_INDEX_BASE_OFF);
  plan.count = count;
  plan.base = base;
  /* PE: test ebx,ebx; jle -> -1 — SIGNED count. */
  if (count <= 0) return plan;
  for (let i = 0; i < count; i++) {
    const elem = u32(base + Math.imul(i, ANM2_SUBARRAY_NAME_INDEX_STRIDE));
    const cap = readU32(mem, elem + ANM2_SUBARRAY_NAME_INDEX_SSO_CAP_OFF);
    let str = elem;
    if (cap >= ANM2_SUBARRAY_NAME_INDEX_SSO_CAP) {
      plan.heapCount += 1;
      str = readU32(mem, elem);
    }
    if (anm2StrcmpMem(mem, str, u32(nameAddr)) === 0) {
      plan.foundIndex = i;
      plan.result = i;
      break;
    }
  }
  return plan;
}

/* ================== v41: 0x0040bbf0 0x6c-byte struct copy =================
   PE 0x0040bbf0..0x0040bc3b (ret 4). this=ecx = DEST; [ebp+8] = SRC. Copies
   the 0x6c-byte element struct field-by-field: dword pairs +0x0..+0x28,
   byte +0x2c, movups +0x30 (16B) / +0x40 (16B), movq +0x50 (8B), dwords
   +0x58/+0x5c, byte +0x60, dwords +0x64/+0x68. Truly pure (no calls); the
   layout IS the contract. */

export const ANM2_STRUCT_COPY_6C_VA = 0x0040bbf0;
export const ANM2_STRUCT_COPY_6C_END_VA = 0x0040bc3b;
export const ANM2_STRUCT_COPY_6C_SIZE = 0x6c;

/** 0x0040bbf0: byte-for-byte 0x6c-byte struct copy (dest=this, src arg). */
export function anm2StructCopy6cPlan(mem, { dstAddr, srcAddr }) {
  const plan = {
    entered: 0, dstAddr: u32(dstAddr), srcAddr: u32(srcAddr),
    byteCount: ANM2_STRUCT_COPY_6C_SIZE, logNeeded: 0, logVa: 0,
    logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(dstAddr) === 0 || u32(srcAddr) === 0) return plan;
  plan.entered = 1;
  return plan;
}

/* ================== v42: 0x0040c310 self-assign-guarded string assign =====
   PE 0x0040c310 (ret 4). ANM2 operator=: this=ecx; src=[ebp+8]. cmp esi,eax;
   je -> self-alias: return *this, PURE NO-OP (host event dropped). Else:
   src std::string SSO decode (cap [src+0x14] jb 0x10 inline : heap [src];
   size [src+0x10]) -> host STRING_ASSIGN 0x40ccd0(this, src_data, src_size)
   continuation; return *this. The self-alias arm is a real PE decision, so
   the host event is only required on the non-alias arm. */

export const ANM2_STRING_ASSIGN_GUARD_VA = 0x0040c310;
export const ANM2_STRING_ASSIGN_GUARD_END_VA = 0x0040c32b;
export const ANM2_STRING_ASSIGN_GUARD_HOST_VA = 0x0040ccd0;
export const ANM2_STRING_ASSIGN_GUARD_SSO_CAP_OFF = 0x14;
export const ANM2_STRING_ASSIGN_GUARD_SIZE_OFF = 0x10;
export const ANM2_STRING_ASSIGN_GUARD_SSO_CAP = 0x10;

/** 0x0040c310: self-assign guard + src SSO decode. selfAlias -> pure no-op;
 *  otherwise host STRING_ASSIGN(src_data, src_size) on this. */
export function anm2StringAssignGuardPlan(mem, { anm2Addr, srcAddr }) {
  const plan = {
    entered: 0, thisAddr: u32(anm2Addr), srcAddr: u32(srcAddr),
    selfAlias: 0, srcData: 0, srcSize: 0,
    hostNeeded: 0, hostVa: ANM2_STRING_ASSIGN_GUARD_HOST_VA,
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  if (u32(srcAddr) === u32(anm2Addr)) {
    plan.selfAlias = 1;
    return plan; /* pure no-op: no host event */
  }
  const src = u32(srcAddr);
  const cap = readU32(mem, src + ANM2_STRING_ASSIGN_GUARD_SSO_CAP_OFF);
  plan.srcSize = i32(readU32(mem, src + ANM2_STRING_ASSIGN_GUARD_SIZE_OFF));
  plan.srcData = cap < ANM2_STRING_ASSIGN_GUARD_SSO_CAP
    ? src
    : readU32(mem, src);
  plan.hostNeeded = 1;
  plan.hostCallCount = 1;
  plan.pureComplete = 0; /* host STRING_ASSIGN required on this arm */
  return plan;
}

/* ================== v43: 0x0040c340 SSO C-string ctor =====================
   PE 0x0040c340..0x0040c37d (ret 4). std::string(const char*): this=ecx;
   cstr=[ebp+8]. Zero-init SSO ([this]=0, [this+0x10]=0, [this+0x14]=0xf),
   then a PURE inline strlen (8a 08 40 84 c9 75 f9 -> length), then host
   STRING_ASSIGN 0x40ccd0(this, cstr, length). The strlen decode is the pure
   translated arm; the assign stays host. */

export const ANM2_SSO_CSTR_CTOR_VA = 0x0040c340;
export const ANM2_SSO_CSTR_CTOR_END_VA = 0x0040c37d;
export const ANM2_SSO_CSTR_CTOR_HOST_VA = 0x0040ccd0;
export const ANM2_SSO_CSTR_CTOR_CAP_OFF = 0x14;
export const ANM2_SSO_CSTR_CTOR_SSO_CAP = 0x0f;

/** 0x0040c340: strlen decode (pure) -> host STRING_ASSIGN(this, cstr, len). */
export function anm2SsoCstrCtorPlan(mem, { anm2Addr, cstrAddr }) {
  const plan = {
    entered: 0, thisAddr: u32(anm2Addr), cstrAddr: u32(cstrAddr),
    strLen: 0, hostNeeded: 0, hostVa: ANM2_SSO_CSTR_CTOR_HOST_VA,
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  /* PE pure strlen: read byte at cstr+i, inc, loop until NUL; length =
     end - (cstr+1). */
  let len = 0;
  while (mem[u32(cstrAddr) + len] !== 0) len = u32(len + 1);
  plan.strLen = i32(len);
  plan.hostNeeded = 1;
  plan.hostCallCount = 1;
  return plan;
}

/* ================== v44: 0x0040d0e0 float ctor (7 float inputs) ===========
   CORRECTED by the v62 unit (byte-exact PE re-read). Body
   0x0040d0e0..0x0040d13a (`pop ebp ; ret 0x10` @ 0x40d137..0x40d13a) —
   the old END_VA 0x0040d11d was a mid-instruction pin (byte 0x40d11d is
   the disp8 of `movss [ecx+0x24],xmm0`). SEVEN distinct float sources:
     stack a0=[ebp+8], a1=[ebp+0xc], a2=[ebp+0x10], a6=[ebp+0x14];
     regs  x1=xmm1, x2=xmm2, x3=xmm3.
   Stores:
     [this+0x10..0x1c] = 0 (4 zero dwords)
     [this+0x0c] = a0, [this+0x20] = a1, [this+0x24] = a2
     [this+0x00] = x1 (0x40d124), [this+0x04] = x2 (0x40d128),
     [this+0x08] = x3 (0x40d12d), [this+0x28] = a6 (0x40d132)
   The old "arg3 replicated to +0/+4/+8/+0x28" reading was WRONG — four
   distinct stores. Truly pure: zero calls, no branches, eax = this. */

export const ANM2_FLOATVEC_CTOR_VA = 0x0040d0e0;
export const ANM2_FLOATVEC_CTOR_END_VA = 0x0040d13a;
export const ANM2_FLOATVEC_CTOR_RET_BYTES = 0x10;

/* float -> raw u32 bit pattern (model-side helper; the C++ side stores the
   float bits directly). */
function f32bits(f) {
  const dv = new DataView(new ArrayBuffer(4));
  dv.setFloat32(0, Math.fround(f), true);
  return dv.getUint32(0, true);
}

/** 0x0040d0e0: pure float ctor layout pin (7 float inputs, ret 0x10). */
export function anm2FloatVecCtorPlan(mem, { anm2Addr, args }) {
  const plan = {
    entered: 0, thisAddr: u32(anm2Addr),
    a0: f32bits(args[0] ?? 0), a1: f32bits(args[1] ?? 0),
    a2: f32bits(args[2] ?? 0), x1: f32bits(args[3] ?? 0),
    x2: f32bits(args[4] ?? 0), x3: f32bits(args[5] ?? 0),
    a6: f32bits(args[6] ?? 0),
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  return plan;
}

/* ================== v45: 0x0040ca70 ORDERED memcmp ========================
   PE 0x0040ca70..0x0040cac9 (ret; ecx=a, edx=b, [ebp+8]=n). dword loop while
   n>=4 (esi=n-4; jae back-edge), then byte tail for the remaining 0..3 bytes
   in order. Returns the ORDER of the first differing byte, UNSIGNED (sbb/or
   normalization: a<b -> -1, a>b -> +1), 0 when all n bytes equal. Distinct
   from the v38 sized-eq 0x40cae0 (returns 1/0 only). The trailing
   push 0xb1a6c8; call [0xb184d4]; int3 after the rets is DEAD (no branch
   reaches it; compiler assert leftover) — recorded, not modeled. */

export const ANM2_ORDERED_MEMCMP_VA = 0x0040ca70;
export const ANM2_ORDERED_MEMCMP_END_VA = 0x0040cac9;
export const ANM2_ORDERED_MEMCMP_ASSERT_MSG_VA = 0x00b1a6c8;
export const ANM2_ORDERED_MEMCMP_ASSERT_HOOK_VA = 0x00b184d4;

/** 0x0040ca70: ordered byte compare of n bytes at a and b (unsigned order). */
export function anm2OrderedMemcmp(mem, aAddr, bAddr, n) {
  aAddr = u32(aAddr);
  bAddr = u32(bAddr);
  const len = u32(n);
  for (let i = 0; i < len; i++) {
    const da = mem[u32(aAddr + i)] & 0xff;
    const db = mem[u32(bAddr + i)] & 0xff;
    if (da !== db) return da < db ? -1 : 1;
  }
  return 0;
}

/** Plan for the 0x0040ca70 export: pinned contract fields. */
export function anm2OrderedMemcmpPlan(mem, { aAddr, bAddr, n }) {
  const plan = {
    entered: 0, aAddr: u32(aAddr), bAddr: u32(bAddr), n: i32(n),
    result: 0, logNeeded: 0, logVa: 0, logLevel: 0,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(aAddr) === 0 || u32(bAddr) === 0) return plan;
  plan.entered = 1;
  plan.result = anm2OrderedMemcmp(mem, u32(aAddr), u32(bAddr), u32(n));
  return plan;
}

/* ================== v46: 0x0040c6f0 hash-table probe ======================
   PE 0x0040c6f0 (ret; no receiver). Pure indexed read over a hash table:
     ecx = [0xc78dc0] (end_hi)
     ecx += [0xc78dbc] (end_lo)   -> end
     edx = [0xc78db8] (key)
     ecx -= 1 / edx -= 1
     idx = edx & ecx              ; (key-1) & (end-1)  UNSIGNED
     eax = [0xc78db4] (base); eax = [base + idx*4]
   The four globals are RUNTIME inputs (writer census v46: sparse direct
   writers — 0xc78dbc has 4 (0x78c2b6/0x78c65d/0x78c72e/0x78d3a6), the rest
   register-held; none constant) — host supplies each tick, apply never
   touches them (v82 flags precedent). Pure. */

export const ANM2_HASH_PROBE_VA = 0x0040c6f0;
export const ANM2_HASH_PROBE_END_VA = 0x0040c70b;
export const ANM2_HASH_PROBE_BASE_GLOBAL = 0x00c78db4;
export const ANM2_HASH_PROBE_KEY_GLOBAL = 0x00c78db8;
export const ANM2_HASH_PROBE_END_LO_GLOBAL = 0x00c78dbc;
export const ANM2_HASH_PROBE_END_HI_GLOBAL = 0x00c78dc0;

/** 0x0040c6f0: idx = (key-1) & (end-1); result = [base + idx*4]. */
export function anm2HashProbePlan(mem, { tableBase, key, endLo, endHi }) {
  const plan = {
    entered: 0, tableBase: u32(tableBase), key: u32(key),
    endLo: u32(endLo), endHi: u32(endHi), index: 0, result: 0,
    logNeeded: 0, logVa: 0, logLevel: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(tableBase) === 0) return plan;
  const end = u32(endLo) + u32(endHi);
  plan.index = (u32(key) - 1) & (end - 1);
  plan.entered = 1;
  plan.result = readU32(mem, u32(tableBase) + plan.index * 4);
  return plan;
}

/* ================== v48: 0x0040c780 float-pointer min =====================
   movss xmm0,[ecx] ; comiss xmm0,[edx] ; cmova ecx,edx ; mov eax,ecx ; ret
   returns the ADDRESS of the smaller float. cmova = CF==0 && ZF==0: b wins
   ONLY when a > b is ORDERED; NaN on either side (PF) and ties keep a (the
   FIRST pointer). */

export const ANM2_FLOAT_MIN_VA = 0x0040c780;
export const ANM2_FLOAT_MIN_END_VA = 0x0040c78c;
export const ANM2_FLOAT_MIN_CALLSITE_COUNT = 66;

function f32BitsIsNan(bits) {
  return ((u32(bits) & 0x7f800000) === 0x7f800000 &&
          (u32(bits) & 0x007fffff) !== 0);
}

export function anm2FloatMinPlan(mem, { aAddr, bAddr }) {
  const plan = {
    entered: 0, aAddr: u32(aAddr), bAddr: u32(bAddr),
    aBits: 0, bBits: 0, unordered: 0, takesB: 0,
    resultAddr: u32(aAddr), pureComplete: 1,
  };
  if (u32(aAddr) === 0 || u32(bAddr) === 0) return plan;
  plan.entered = 1;
  const aBits = readU32(mem, u32(aAddr));
  const bBits = readU32(mem, u32(bAddr));
  plan.aBits = aBits;
  plan.bBits = bBits;
  const unordered = (f32BitsIsNan(aBits) || f32BitsIsNan(bBits)) ? 1 : 0;
  plan.unordered = unordered;
  plan.takesB = (unordered === 0 && bitsToF32(aBits) > bitsToF32(bBits)) ? 1 : 0;
  plan.resultAddr = plan.takesB !== 0 ? u32(bAddr) : u32(aAddr);
  return plan;
}

/* ================== v48: 0x0040c790 SSO sized-eq wrapper ==================
   SSO-select both std::strings (cap [str+0x14] < 0x10 UNSIGNED inline, else
   heap pointer at [str]), a in ecx/edx (chars/size), b pushed (chars,size),
   call 0x0040cae0: sizes EQUAL AND bytes equal over a_size -> AL 1/0. */

export const ANM2_SSO_SIZED_EQ_VA = 0x0040c790;
export const ANM2_SSO_SIZED_EQ_END_VA = 0x0040c7b4;
export const ANM2_SSO_SIZED_EQ_CALLSITE_COUNT = 3;
export const ANM2_SSO_SIZED_EQ_HELPER_VA = 0x0040cae0;
export const ANM2_SSO_SIZED_EQ_SSO_CAP = 0x10;

function ssoSizedEqSelect(mem, strAddr) {
  const cap = readU32(mem, u32(strAddr) + 0x14);
  const size = readU32(mem, u32(strAddr) + 0x10);
  if (cap < ANM2_SSO_SIZED_EQ_SSO_CAP) {
    return { cap, size, heap: 0, chars: u32(strAddr) };
  }
  return { cap, size, heap: 1, chars: readU32(mem, u32(strAddr)) };
}

export function anm2SsoSizedEqPlan(mem, { aAddr, bAddr }) {
  const plan = {
    entered: 0, aAddr: u32(aAddr), bAddr: u32(bAddr),
    aCap: 0, aSize: 0, aHeap: 0, aChars: u32(aAddr),
    bCap: 0, bSize: 0, bHeap: 0, bChars: u32(bAddr),
    result: 0, helperVa: ANM2_SSO_SIZED_EQ_HELPER_VA, pureComplete: 1,
  };
  if (u32(aAddr) === 0 || u32(bAddr) === 0) return plan;
  plan.entered = 1;
  const b = ssoSizedEqSelect(mem, u32(bAddr));
  plan.bCap = b.cap; plan.bSize = b.size; plan.bHeap = b.heap; plan.bChars = b.chars;
  const a = ssoSizedEqSelect(mem, u32(aAddr));
  plan.aCap = a.cap; plan.aSize = a.size; plan.aHeap = a.heap; plan.aChars = a.chars;
  if (a.size === b.size && bytesEqual(mem, a.chars, b.chars, a.size)) {
    plan.result = 1;
  }
  return plan;
}

/* ================== v49: 0x0040ae70 SSO name->flag walk ===================
   __thiscall bool (this, const char* name); 104 .text e8 callers. Twin of
   frame-opaque's FUN_0040add0 walk but the match tail tests [this+0x1c]
   (frame-opaque's +0x18) — the delta is pinned here.
     [this+4]==0 -> HOST 0xa112c0(0xb1a504, 0x10) then FALL THROUGH
     owner=[this]; count=[owner+0x90]; count==0 -> false
     base=[owner+0x8c] (not read when count==0)
     loop i (jb UNSIGNED): entry=base+i*0x18; chars = cap<0x10 ? entry :
       [entry]; strcmp(chars, name)==0 -> MATCH
     MATCH: js guard (dead); bit = 1 << (i&31); result = ([this+0x1c] & bit)!=0
   Independent oracle: transcribed branch-by-branch from the instruction
   stream (cpu-dump/0040ae70.txt), not derived from the cpp. */

export const ANM2_NAME_FLAG_VA = 0x0040ae70;
export const ANM2_NAME_FLAG_END_VA = 0x0040af0a;
export const ANM2_NAME_FLAG_CALLSITE_COUNT = 104;
export const ANM2_NAME_FLAG_OWNER_OFF = 0x00;
export const ANM2_NAME_FLAG_GATE_OFF = 0x04;
export const ANM2_NAME_FLAG_COUNT_OFF = 0x90;
export const ANM2_NAME_FLAG_BASE_OFF = 0x8c;
export const ANM2_NAME_FLAG_STRIDE = 0x18;
export const ANM2_NAME_FLAG_SSO_CAP_OFF = 0x14;
export const ANM2_NAME_FLAG_SSO_CAP = 0x10;
export const ANM2_NAME_FLAG_BITFIELD_OFF = 0x1c; /* NOT frame-opaque +0x18 */
export const ANM2_NAME_FLAG_BITWIDTH = 32;
export const ANM2_NAME_FLAG_LOG_VA = 0x00a112c0;
export const ANM2_NAME_FLAG_LOG_LEVEL = 0x10;
export const ANM2_NAME_FLAG_LOG_STR_VA = 0x00b1a504;

export function anm2NameFlagAssertNeeded(field4) {
  return u32(field4) === 0 ? 1 : 0;
}

export function anm2NameFlagSsoInline(cap14) {
  return u32(cap14) < ANM2_NAME_FLAG_SSO_CAP ? 1 : 0;
}

export function anm2NameFlagBitMask(matchIndex) {
  return (1 << (i32(matchIndex) & 31)) >>> 0;
}

export function anm2NameFlagBitResult(bitfield1c, matchIndex) {
  if (i32(matchIndex) < 0) return 0;
  return (u32(bitfield1c) & anm2NameFlagBitMask(matchIndex)) !== 0 ? 1 : 0;
}

export function anm2NameFlagWalkPlan(mem, { thisAddr, nameAddr }) {
  const plan = {
    entered: 0, thisAddr: u32(thisAddr), nameAddr: u32(nameAddr),
    ownerAddr: 0, countRaw: 0, baseRaw: 0, assertHostNeeded: 0,
    logVa: ANM2_NAME_FLAG_LOG_VA, logLevel: ANM2_NAME_FLAG_LOG_LEVEL,
    logStrVa: ANM2_NAME_FLAG_LOG_STR_VA,
    matchIndex: -1, matchCmp: 0, matchEntryCap: 0, matchCharsAddr: 0,
    flagBit: 0, bitfieldRaw: 0, result: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(thisAddr) === 0 || u32(nameAddr) === 0) return plan;
  plan.entered = 1;
  const field4 = readU32(mem, u32(thisAddr) + ANM2_NAME_FLAG_GATE_OFF);
  plan.assertHostNeeded = anm2NameFlagAssertNeeded(field4);
  if (plan.assertHostNeeded !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
    /* PE 0x40ae8e log -> FALL THROUGH: the walk still runs after the
       assert (BandD M5 discriminator). */
  }
  const owner = readU32(mem, u32(thisAddr));
  plan.ownerAddr = owner;
  const count = readU32(mem, owner + ANM2_NAME_FLAG_COUNT_OFF);
  plan.countRaw = count;
  if (count === 0) return plan;
  const base = readU32(mem, owner + ANM2_NAME_FLAG_BASE_OFF);
  plan.baseRaw = base;
  const name = u32(nameAddr);
  let match = -1;
  for (let i = 0; i < count; i = u32(i + 1)) {
    const entry = u32(base + i * ANM2_NAME_FLAG_STRIDE);
    const cap = readU32(mem, entry + ANM2_NAME_FLAG_SSO_CAP_OFF);
    const chars = cap < ANM2_NAME_FLAG_SSO_CAP ? entry : readU32(mem, entry);
    if (anm2StrcmpMem(mem, chars, name) === 0) {
      match = i;
      plan.matchEntryCap = cap;
      plan.matchCharsAddr = chars;
      plan.matchCmp = 0;
      break;
    }
  }
  plan.matchIndex = match;
  if (match >= 0) {
    const bitfield = readU32(mem, u32(thisAddr) + ANM2_NAME_FLAG_BITFIELD_OFF);
    plan.bitfieldRaw = bitfield;
    plan.flagBit = anm2NameFlagBitMask(match);
    plan.result = anm2NameFlagBitResult(bitfield, match);
  }
  return plan;
}

/* ================== v49: 0x0040b000 IsEventTriggered SSO wrapper ===========
   __thiscall void (this, const std::string& name) — ret 4; address-stable.
   Lua glue "IsEventTriggered" bind (helper 0x0089f1b0 at 0x008674b3) is the
   only inbound edge (register-held const; 0 E8 callers).
     eax = name; cap [name+0x14] cmp 0x10 ; jb (UNSIGNED) -> chars = name
     else chars = [name] (heap ptr)
     cmp dword [this+0x34],0 ; jne -> call arm
     closed: xor al,al ; ret 4   (bool 0; EAX upper 3 bytes = chars & ~0xff)
     open: push chars ; add this,0x30 ; call 0x0040add0 (HOST walk body);
       ret 4
   Independent oracle: transcribed branch-by-branch from the instruction
   stream, not derived from the cpp. */

export const ANM2_EVENT_TRIGGER_SSO_VA = 0x0040b000;
export const ANM2_EVENT_TRIGGER_SSO_END_VA = 0x0040b027;
export const ANM2_EVENT_TRIGGER_SSO_SSO_CAP_OFF = 0x14;
export const ANM2_EVENT_TRIGGER_SSO_SSO_CAP = 0x10;
export const ANM2_EVENT_TRIGGER_SSO_GATE_OFF = 0x34;      /* FULL dword */
export const ANM2_EVENT_TRIGGER_SSO_STATE_OFF = 0x30;     /* recv offset */
export const ANM2_EVENT_TRIGGER_SSO_CALL_VA = 0x0040add0; /* HOST walk */
export const ANM2_EVENT_TRIGGER_SSO_LUA_PUSH_VA = 0x008674b3;
export const ANM2_EVENT_TRIGGER_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_EVENT_TRIGGER_SSO_CALLSITE_COUNT = 1;

export function anm2EventTriggerSsoPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, sso: 0, charsAddr: u32(nameAddr), gate34: 0,
    callVa: ANM2_EVENT_TRIGGER_SSO_CALL_VA,
    recvOff: ANM2_EVENT_TRIGGER_SSO_STATE_OFF,
    result: 0, eaxClosed: u32(nameAddr) & 0xffffff00,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const cap = readU32(mem, u32(nameAddr) + ANM2_EVENT_TRIGGER_SSO_SSO_CAP_OFF);
  const chars = cap < ANM2_EVENT_TRIGGER_SSO_SSO_CAP
    ? u32(nameAddr)
    : readU32(mem, u32(nameAddr));
  plan.sso = cap < ANM2_EVENT_TRIGGER_SSO_SSO_CAP ? 1 : 0;
  plan.charsAddr = chars;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_EVENT_TRIGGER_SSO_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  /* Closed path: xor al,al — BYTE clear; upper 3 bytes stay the chars
     address (pinned as eaxClosed). */
  plan.eaxClosed = chars & 0xffffff00;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/* ============ v49: 0x0040b060 WasEventTriggered SSO wrapper ===============
   __thiscall void (this, const std::string& name) — ret 4; address-stable.
   Lua glue "WasEventTriggered" bind (.rdata 0x00b705ac, push 0x0040b060 at
   0x008674c3, helper 0x0089f1b0 — slot after IsEventTriggered) is the only
   inbound edge (register-held const; 0 E8 callers).
     eax = name; cap [name+0x14] cmp 0x10 ; jb (UNSIGNED) -> chars = name
     else chars = [name] (heap ptr)
     cmp dword [this+0x34],0 ; jne -> call arm
     closed: xor al,al ; ret 4   (bool 0; EAX upper 3 bytes = chars & ~0xff)
     open: push chars ; add this,0x30 ; call 0x0040ae70 (HOST — ANM2 twin
       name->flag walk body, BandD's in-wave export); ret 4
   Byte-identical to 0x0040b000 EXCEPT the call target 0x0040ae70 (the
   +0x1c twin) instead of 0x0040add0 (the +0x18 twin).
   Independent oracle: transcribed branch-by-branch from the instruction
   stream, not derived from the cpp. */

export const ANM2_WAS_EVENT_TRIGGERED_SSO_VA = 0x0040b060;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_END_VA = 0x0040b087;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP_OFF = 0x14;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP = 0x10;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_GATE_OFF = 0x34;  /* FULL dword */
export const ANM2_WAS_EVENT_TRIGGERED_SSO_STATE_OFF = 0x30; /* recv offset */
export const ANM2_WAS_EVENT_TRIGGERED_SSO_CALL_VA = 0x0040ae70; /* HOST walk */
export const ANM2_WAS_EVENT_TRIGGERED_SSO_LUA_PUSH_VA = 0x008674c3;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_LUA_PUSH_COUNT = 1;
export const ANM2_WAS_EVENT_TRIGGERED_SSO_CALLSITE_COUNT = 1;

export function anm2WasEventTriggeredSsoPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, sso: 0, charsAddr: u32(nameAddr), gate34: 0,
    callVa: ANM2_WAS_EVENT_TRIGGERED_SSO_CALL_VA,
    recvOff: ANM2_WAS_EVENT_TRIGGERED_SSO_STATE_OFF,
    result: 0, eaxClosed: u32(nameAddr) & 0xffffff00,
    hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const cap = readU32(mem, u32(nameAddr) + ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP_OFF);
  const chars = cap < ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP
    ? u32(nameAddr)
    : readU32(mem, u32(nameAddr));
  plan.sso = cap < ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP ? 1 : 0;
  plan.charsAddr = chars;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_WAS_EVENT_TRIGGERED_SSO_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  /* Closed path: xor al,al — BYTE clear; upper 3 bytes stay the chars
     address (pinned as eaxClosed). */
  plan.eaxClosed = chars & 0xffffff00;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/* ================== v49 band-b: 0x0040b030 const-char twin ===============
   Same gate/receiver/call shape as the 0x0040b000 SSO wrapper, but the arg
   is a RAW const char* pushed verbatim (PE `push dword [ebp+8]`) — NO SSO
   decode. 386 direct .text e8 callers (rel32 census). Gate [this+0x34] is
   a FULL-dword test; closed -> return 0 (no call); open -> HOST 0x40add0
   on this+0x30 and the callee AL is returned (host-side). Disasm:
   cpu-dump/0040b030.txt. */

export const ANM2_EVENT_TRIGGER_CSTR_VA = 0x0040b030;
export const ANM2_EVENT_TRIGGER_CSTR_END_VA = 0x0040b04e; /* `ret 4` */
export const ANM2_EVENT_TRIGGER_CSTR_GATE_OFF = 0x34;     /* FULL dword */
export const ANM2_EVENT_TRIGGER_CSTR_STATE_OFF = 0x30;    /* recv offset */
export const ANM2_EVENT_TRIGGER_CSTR_CALL_VA = 0x0040add0; /* HOST walk */
export const ANM2_EVENT_TRIGGER_CSTR_CALLSITE_COUNT = 386;

/** 0x0040b030 const-char event-trigger twin: charsAddr is the RAW arg
 *  (never SSO-decoded); gate open -> one host call on this+0x30, result is
 *  the callee AL (host-side). Closed -> pure 0. */
export function anm2EventTriggerCstrPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, gate34: 0, charsAddr: u32(nameAddr),
    callVa: ANM2_EVENT_TRIGGER_CSTR_CALL_VA,
    recvOff: ANM2_EVENT_TRIGGER_CSTR_STATE_OFF,
    result: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_EVENT_TRIGGER_CSTR_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/* ================== v50: 0x0040b090 WasEventTriggered cstr twin ===========
   FOURTH wrapper twin: WasEventTriggered in const-char form. 116 direct
   .text e8 callers (rel32 census). Same gate/receiver/call shape as the
   0x0040b030 twin, but the HOST callee is 0x0040ae70 (ANM2's own SSO name->
   flag walk, the +0x1c twin) NOT 0x0040add0; and vs 0x0040b060 the arg is
   pushed RAW (`push dword [ebp+8]`) — NO SSO decode. VA pin: 0x0040b060 +
   0x30 == 0x0040b090. Disasm: cpu-dump/0040b090.txt. */

export const ANM2_WAS_EVENT_TRIGGERED_CSTR_VA = 0x0040b090;
export const ANM2_WAS_EVENT_TRIGGERED_CSTR_END_VA = 0x0040b0ae; /* `ret 4` */
export const ANM2_WAS_EVENT_TRIGGERED_CSTR_GATE_OFF = 0x34;     /* FULL dword */
export const ANM2_WAS_EVENT_TRIGGERED_CSTR_STATE_OFF = 0x30;    /* recv offset */
export const ANM2_WAS_EVENT_TRIGGERED_CSTR_CALL_VA = 0x0040ae70; /* HOST walk */
export const ANM2_WAS_EVENT_TRIGGERED_CSTR_CALLSITE_COUNT = 116;

/** 0x0040b090 const-char was-event-triggered twin: charsAddr is the RAW arg
 *  (never SSO-decoded); gate open -> one host call on this+0x30 to the ANM2
 *  band-D walk (0x40ae70), result is the callee AL (host-side). Closed ->
 *  pure 0. */
export function anm2WasEventTriggeredCstrPlan(mem, { anm2Addr, nameAddr }) {
  const plan = {
    entered: 0, gate34: 0, charsAddr: u32(nameAddr),
    callVa: ANM2_WAS_EVENT_TRIGGERED_CSTR_CALL_VA,
    recvOff: ANM2_WAS_EVENT_TRIGGERED_CSTR_STATE_OFF,
    result: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_WAS_EVENT_TRIGGERED_CSTR_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/* ================== v51: 0x40b1a0 / 0x40b1d0 / 0x40b200 ===================
   Three thin __thiscall wrappers (ret 4; address-stable, no ZHL) between
   v35's 0x40b0c0..0x40b19f and v1's GetLayer(int) 0x40b220. Direct rel32
   e8 census: 0x40b1a0 = 10, 0x40b1d0 = 16, 0x40b200 = 124 callers. The
   anm2-v36 NOTES recorded 0x40b1d0/0x40b200 as "0x40add0-call duplicates"
   — FACTUALLY WRONG: the callees are ANM2's OWN landed kernels and
   0x40b200 has no gate. Disasm: cpu-dump/0040b1a0.txt, 0040b1d0.txt,
   0040b200.txt. */

export const ANM2_ANIM_ID_WRAPPER_VA = 0x0040b1a0;
export const ANM2_ANIM_ID_WRAPPER_END_VA = 0x0040b1be; /* open-arm ret 4 */
export const ANM2_ANIM_ID_WRAPPER_GATE_OFF = 0x34;     /* FULL dword */
export const ANM2_ANIM_ID_WRAPPER_STATE_OFF = 0x30;    /* recv offset */
export const ANM2_ANIM_ID_WRAPPER_CALL_VA = 0x0040ac70; /* v32 kernel */
export const ANM2_ANIM_ID_WRAPPER_CALLSITE_COUNT = 10;

export const ANM2_EXTRAS_NAME_WRAPPER_VA = 0x0040b1d0;
export const ANM2_EXTRAS_NAME_WRAPPER_END_VA = 0x0040b1ee; /* open-arm ret 4 */
export const ANM2_EXTRAS_NAME_WRAPPER_GATE_OFF = 0x34;     /* FULL dword */
export const ANM2_EXTRAS_NAME_WRAPPER_STATE_OFF = 0x30;    /* recv offset */
export const ANM2_EXTRAS_NAME_WRAPPER_CALL_VA = 0x0040ace0; /* v33/v47 kernel */
export const ANM2_EXTRAS_NAME_WRAPPER_CALLSITE_COUNT = 16;

export const ANM2_GET_LAYER_WRAPPER_VA = 0x0040b200;
export const ANM2_GET_LAYER_WRAPPER_END_VA = 0x0040b20e; /* ret 4 */
export const ANM2_GET_LAYER_WRAPPER_GATE_OFF = 0x34; /* NOT READ — no gate
    (contrast pin: gate34 stays 0 even with nonzero gate memory) */
export const ANM2_GET_LAYER_WRAPPER_STATE_OFF = 0x00; /* ecx unchanged */
export const ANM2_GET_LAYER_WRAPPER_CALL_VA = 0x0040b220; /* v1 GetLayer */
export const ANM2_GET_LAYER_WRAPPER_CALLSITE_COUNT = 124;

/** 0x0040b1a0: FULL-dword gate [this+0x34]; open -> one host call on
 *  this+0x30 to the v32 anim-id lookup (0x40ac70, BY REFERENCE). Closed ->
 *  pure 0. arg is a RAW passthrough. */
export function anm2AnimIdWrapperPlan(mem, { anm2Addr, argAddr }) {
  const plan = {
    entered: 0, gate34: 0, argAddr: u32(argAddr),
    callVa: ANM2_ANIM_ID_WRAPPER_CALL_VA,
    recvOff: ANM2_ANIM_ID_WRAPPER_STATE_OFF,
    result: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_ANIM_ID_WRAPPER_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/** 0x0040b1d0: SAME gate/receiver shape as 0x40b1a0, DIFFERENT callee —
 *  0x40ace0 (extras name->index, v33/v47 kernel, BY REFERENCE). Twin
 *  discipline: must NOT be unified with the anim-id wrapper. */
export function anm2ExtrasNameWrapperPlan(mem, { anm2Addr, argAddr }) {
  const plan = {
    entered: 0, gate34: 0, argAddr: u32(argAddr),
    callVa: ANM2_EXTRAS_NAME_WRAPPER_CALL_VA,
    recvOff: ANM2_EXTRAS_NAME_WRAPPER_STATE_OFF,
    result: 0, hostCallCount: 0, pureComplete: 1,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  const gate = readU32(mem, u32(anm2Addr) + ANM2_EXTRAS_NAME_WRAPPER_GATE_OFF);
  plan.gate34 = gate !== 0 ? 1 : 0;
  if (gate !== 0) {
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  return plan;
}

/** 0x0040b200: NO gate — push [ebp+8] RAW, call 0x40b220 (GetLayer(int),
 *  v1 kernel, BY REFERENCE) with ecx UNCHANGED (recvOff 0). ALWAYS 1 host
 *  call, never pure (contrast twin). */
export function anm2GetLayerWrapperPlan(mem, { anm2Addr, argAddr }) {
  const plan = {
    entered: 0, gate34: 0, argAddr: u32(argAddr),
    callVa: ANM2_GET_LAYER_WRAPPER_CALL_VA,
    recvOff: ANM2_GET_LAYER_WRAPPER_STATE_OFF,
    result: 0, hostCallCount: 1, pureComplete: 0,
  };
  if (u32(anm2Addr) === 0) return plan;
  plan.entered = 1;
  /* No [this+0x34] read exists in this body — gate34 stays pinned 0. */
  return plan;
}

/* ================== v50: 0x0040bf30 ReplaceSpritesheet ====================
   __thiscall bool ANM2::ReplaceSpritesheet(int LayerId, std_string& Png) —
   EXACT ZHL (10 pattern bytes); ret 8 @ 0x40bfbd; 80 direct .text e8 callers
   (rel32 census; the "150" in the brief counts register-held/indirect too).
   Calls 0x0040cae0 sized-eq (MODELED, family bytes_equal law) and 0x0040ccd0
   string assign (HOST — typed; 770 direct callers family-wide).

     test LayerId ; js false                  ; SIGNED < 0
     cmp LayerId,[this+0x80] ; jge false      ; SIGNED >= layerCount (once)
     base = [this+0x7c]                       ; read AFTER the gate, saved
     idx  = LayerId*0xa0                      ; lea [eax+eax*4]; shl 5 (u32)
     name = base + idx + 8                    ; layer name string object
     nameChars = cap[name+0x14] < 0x10 ? name : [name]    (jb STRICT)
     pngChars  = cap[png+0x14]  < 0x10 ? png  : [png]
     sizedEq = (png.size == name.size) && bytesEqual(pngChars, nameChars,
               png.size) ; if sizedEq -> false (jne 0x40bfd6)
     if name == png (string OBJECT addresses, je) -> SELF (unreachable via
       coherent memory; transcribed faithfully): store byte
       [SAVED base + idx + 0x30] = 0 ; return true
     else:
       HOST 0x0040ccd0(recv=name, chars=pngChars, size=png.size)
       byte [RE-READ [this+0x7c] + idx + 0x30] = 0    ; THE POST-CALL RE-READ
                                                       ; TRAP (0x40bfaa)
       return true
   Oracle transcribed branch-by-branch from cpu-dump/0040bf30.txt (raw copy
   in section-notes/anm2-v50-replace-spritesheet/), independent of the cpp. */

export const ANM2_REPLACE_SPRITESHEET_VA = 0x0040bf30;
export const ANM2_REPLACE_SPRITESHEET_END_VA = 0x0040bfbd; /* `ret 8` */
export const ANM2_REPLACE_SPRITESHEET_CALLSITE_COUNT = 80;
export const ANM2_REPLACE_SPRITESHEET_LAYER_COUNT_OFF = 0x80;
export const ANM2_REPLACE_SPRITESHEET_LAYER_STATE_OFF = 0x7c;
export const ANM2_REPLACE_SPRITESHEET_LAYER_STRIDE = 0xa0;
export const ANM2_REPLACE_SPRITESHEET_NAME_OFF = 0x08;
export const ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF = 0x14;
export const ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF = 0x10;
export const ANM2_REPLACE_SPRITESHEET_SSO_CAP = 0x10;
export const ANM2_REPLACE_SPRITESHEET_EQ_HELPER_VA = 0x0040cae0;
export const ANM2_REPLACE_SPRITESHEET_HOST_VA = 0x0040ccd0;
export const ANM2_REPLACE_SPRITESHEET_STORE_OFF = 0x30;
export const ANM2_REPLACE_SPRITESHEET_STORE_VALUE = 0;
export const ANM2_REPLACE_SPRITESHEET_BASE_SAVED = 0;
export const ANM2_REPLACE_SPRITESHEET_BASE_RE_READ = 1;

/** Signed bounds gate: test eax,eax ; js (id < 0) then cmp ; jge (id >= n). */
export function anm2ReplaceSpritesheetBounds(layerId, layerCount) {
  const id = i32(layerId);
  if (id < 0) return 0;
  return id < i32(layerCount) ? 1 : 0;
}

/** lea [eax+eax*4] ; shl 5 = layerId*0xa0 mod 2^32. */
export function anm2ReplaceSpritesheetIdxOff(layerId) {
  return Math.imul(u32(layerId), ANM2_REPLACE_SPRITESHEET_LAYER_STRIDE) >>> 0;
}

/** Store-base source per arm: self arm keeps the SAVED base ([ebp-4]),
 *  assign arm RE-READS [this+0x7c] after the host call (0x40bfaa). */
export function anm2ReplaceSpritesheetStoreBaseSource(selfAlias) {
  return selfAlias !== 0
    ? ANM2_REPLACE_SPRITESHEET_BASE_SAVED
    : ANM2_REPLACE_SPRITESHEET_BASE_RE_READ;
}

/** 0x0040bf30 pure frame. Returns the plan object; `result` is the bool. */
export function anm2ReplaceSpritesheetPlan(mem, { anm2Addr, layerId, pngAddr }) {
  const plan = {
    entered: 0, layerId: u32(layerId), pngAddr: u32(pngAddr),
    layerCountRaw: 0, inBounds: 0, baseRaw: 0, idxOff: 0,
    nameAddr: 0, nameCap: 0, nameSize: 0, nameChars: 0, nameHeap: 0,
    pngCap: 0, pngSize: 0, pngChars: 0, pngHeap: 0,
    namesEqual: 0, selfAlias: 0, assignNeeded: 0,
    hostVa: ANM2_REPLACE_SPRITESHEET_HOST_VA, hostChars: 0, hostSize: 0,
    storeOff: 0, storeValue: ANM2_REPLACE_SPRITESHEET_STORE_VALUE,
    storeBaseSource: ANM2_REPLACE_SPRITESHEET_BASE_SAVED,
    storeAddrSaved: 0, result: 0, hostCallCount: 0, pureComplete: 1,
  };
  const a = u32(anm2Addr);
  const p = u32(pngAddr);
  if (a === 0 || p === 0) return plan;
  plan.entered = 1;
  /* (a) Signed gate; [this+0x80] read at gate time only. */
  const layerCount = readU32(mem, a + ANM2_REPLACE_SPRITESHEET_LAYER_COUNT_OFF);
  plan.layerCountRaw = layerCount;
  plan.inBounds = anm2ReplaceSpritesheetBounds(layerId, layerCount);
  if (plan.inBounds === 0) return plan;
  /* (b) base read AFTER the gate, saved; idx = id*0xa0. */
  const base = readU32(mem, a + ANM2_REPLACE_SPRITESHEET_LAYER_STATE_OFF);
  plan.baseRaw = base;
  const idx = anm2ReplaceSpritesheetIdxOff(layerId);
  plan.idxOff = idx;
  /* (c) name string object at layer+8; SSO decode (jb STRICT). */
  const nameAddr = u32(base + idx + ANM2_REPLACE_SPRITESHEET_NAME_OFF);
  plan.nameAddr = nameAddr;
  const nameCap = readU32(mem, nameAddr + ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF);
  plan.nameCap = nameCap;
  plan.nameSize = readU32(mem, nameAddr + ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF);
  if (nameCap < ANM2_REPLACE_SPRITESHEET_SSO_CAP) {
    plan.nameHeap = 0;
    plan.nameChars = nameAddr;
  } else {
    plan.nameHeap = 1;
    plan.nameChars = readU32(mem, nameAddr);
  }
  /* (d) png decode: size read first (edx), then chars select. */
  const pngCap = readU32(mem, p + ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF);
  plan.pngCap = pngCap;
  plan.pngSize = readU32(mem, p + ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF);
  if (pngCap < ANM2_REPLACE_SPRITESHEET_SSO_CAP) {
    plan.pngHeap = 0;
    plan.pngChars = p;
  } else {
    plan.pngHeap = 1;
    plan.pngChars = readU32(mem, p);
  }
  /* (e) 0x40cae0 sized-eq family law: sizes equal AND bytes equal over the
     png-side size. Names equal -> false, no store. */
  if (plan.pngSize === plan.nameSize &&
      bytesEqual(mem, plan.pngChars, plan.nameChars, plan.pngSize)) {
    plan.namesEqual = 1;
    return plan;
  }
  /* (f) ADDRESS compare of the string objects (je 0x40bfc0). */
  plan.selfAlias = nameAddr === p ? 1 : 0;
  plan.assignNeeded = plan.selfAlias === 0 ? 1 : 0;
  /* (g) store contract: byte [base' + idx + 0x30] = 0, base source per arm. */
  plan.storeOff = u32(idx + ANM2_REPLACE_SPRITESHEET_STORE_OFF);
  plan.storeBaseSource = anm2ReplaceSpritesheetStoreBaseSource(plan.selfAlias);
  plan.storeAddrSaved = u32(base + plan.storeOff);
  if (plan.assignNeeded !== 0) {
    plan.hostChars = plan.pngChars;
    plan.hostSize = plan.pngSize;
    plan.hostCallCount = 1;
    plan.pureComplete = 0;
  }
  plan.result = 1;
  return plan;
}

/** 0x0040bf30 apply: performs the observable store. The assign arm uses the
 *  POST-CALL re-read base (host-supplied hostBasePost) — the P1 fold pin;
 *  the self arm uses the saved base. Returns the plan. */
export function anm2ReplaceSpritesheetApply(mem, { anm2Addr, layerId, pngAddr, hostBasePost }) {
  const plan = anm2ReplaceSpritesheetPlan(mem, { anm2Addr, layerId, pngAddr });
  if (plan.entered === 0) return plan;
  if (plan.assignNeeded !== 0) {
    /* PE 0x40bfaa: base RE-READ after the HOST assign; store at the post-call
       base, NOT the pre-call saved base. */
    writeBytes(mem, u32(u32(hostBasePost) + plan.storeOff), 0, 1);
  } else if (plan.selfAlias !== 0) {
    /* PE 0x40bfc0..0x40bfc9: self arm stores with the SAVED base. */
    writeBytes(mem, plan.storeAddrSaved, 0, 1);
  }
  /* bounds-fail and names-equal: no store (result 0). */
  return plan;
}

/* ================== v51: 0x0040cdc0 / 0x0040cdd0 dword-pointer min =========
   cand1 0x40cdc0: mov eax,[ecx] ; cmp eax,[edx] ; cmovb ecx,edx ; mov eax,ecx
   cand2 0x40cdd0: mov eax,[edx] ; cmp eax,[ecx] ; cmovb ecx,edx ; mov eax,ecx
   UNSIGNED dword min: returns the ADDRESS of the smaller dword; ties keep
   the FIRST pointer (ecx). Integer cmp is TOTAL — no unordered case — so
   the uint twin of the v48 float min drops the float plan's unordered
   field. The two bodies are separate VAs/callers (5 / 3 direct e8 sites)
   and MUST NOT be unified. */

export const ANM2_DWORD_MIN_VA = 0x0040cdc0;
export const ANM2_DWORD_MIN_END_VA = 0x0040cdc9;
export const ANM2_DWORD_MIN_CALLSITE_COUNT = 5;
export const ANM2_DWORD_MIN_ALT_VA = 0x0040cdd0;
export const ANM2_DWORD_MIN_ALT_END_VA = 0x0040cdd9;
export const ANM2_DWORD_MIN_ALT_CALLSITE_COUNT = 3;

function dwordMinPlanBody(mem, aAddr, bAddr) {
  const plan = {
    entered: 0, aAddr: u32(aAddr), bAddr: u32(bAddr),
    aBits: 0, bBits: 0, takesB: 0, resultAddr: u32(aAddr), pureComplete: 1,
  };
  if (u32(aAddr) === 0 || u32(bAddr) === 0) return plan;
  plan.entered = 1;
  const aBits = readU32(mem, u32(aAddr));
  const bBits = readU32(mem, u32(bAddr));
  plan.aBits = aBits;
  plan.bBits = bBits;
  plan.takesB = aBits > bBits ? 1 : 0;
  plan.resultAddr = plan.takesB !== 0 ? u32(bAddr) : u32(aAddr);
  return plan;
}

export function anm2DwordMinPlan(mem, { aAddr, bAddr }) {
  return dwordMinPlanBody(mem, aAddr, bAddr);
}

export function anm2DwordMinAltPlan(mem, { aAddr, bAddr }) {
  return dwordMinPlanBody(mem, aAddr, bAddr);
}

/* ================== v51: 0x0040c7c0 SSO sized-INEQ wrapper ================
   Byte-identical to the v48 0x0040c790 sized-EQ wrapper EXCEPT `xor al,1`
   (inverts the verdict; the call rel32 also differs but resolves to the
   SAME helper 0x0040cae0). SSO-select both std::strings (cap [str+0x14] <
   0x10 UNSIGNED inline, else heap pointer at [str]), call 0x0040cae0 (sizes
   EQUAL AND bytes equal over a_size -> AL 1/0), invert: result 1 iff the
   strings DIFFER. The DISCRIMINATOR from the EQ wrapper: the SAME
   mismatching pair yields 0 there, 1 here; equal pairs (incl. empty==empty)
   yield 1 there, 0 here. */

export const ANM2_SSO_SIZED_INEQ_VA = 0x0040c7c0;
export const ANM2_SSO_SIZED_INEQ_END_VA = 0x0040c7e6;
export const ANM2_SSO_SIZED_INEQ_CALLSITE_COUNT = 1;
export const ANM2_SSO_SIZED_INEQ_HELPER_VA = 0x0040cae0;
export const ANM2_SSO_SIZED_INEQ_SSO_CAP = 0x10;

export function anm2SsoSizedIneqPlan(mem, { aAddr, bAddr }) {
  const plan = {
    entered: 0, aAddr: u32(aAddr), bAddr: u32(bAddr),
    aCap: 0, aSize: 0, aHeap: 0, aChars: u32(aAddr),
    bCap: 0, bSize: 0, bHeap: 0, bChars: u32(bAddr),
    result: 0, helperVa: ANM2_SSO_SIZED_INEQ_HELPER_VA, pureComplete: 1,
  };
  if (u32(aAddr) === 0 || u32(bAddr) === 0) return plan;
  plan.entered = 1;
  const b = ssoSizedEqSelect(mem, u32(bAddr));
  plan.bCap = b.cap; plan.bSize = b.size; plan.bHeap = b.heap; plan.bChars = b.chars;
  const a = ssoSizedEqSelect(mem, u32(aAddr));
  plan.aCap = a.cap; plan.aSize = a.size; plan.aHeap = a.heap; plan.aChars = a.chars;
  const eq = (a.size === b.size && bytesEqual(mem, a.chars, b.chars, a.size)) ? 1 : 0;
  plan.result = eq === 0 ? 1 : 0;
  return plan;
}

/* ====================== v54-cache: filename-cache family (unit
   anm2-v54-cache; 0x0040e5d0 FIND / 0x0040ea10 load-one gate /
   0x0040ea50 load-into-map — see section-notes/anm2-v54-cache) ====== */

export const ANM2_CACHE_FIND_VA = 0x0040e5d0;
export const ANM2_CACHE_FIND_END_VA = 0x0040e738;
export const ANM2_CACHE_FIND_BODY_BYTES = 363;
export const ANM2_CACHE_FIND_CALLSITE_COUNT = 3;
export const ANM2_LOAD_ONE_VA = 0x0040ea10;
export const ANM2_LOAD_ONE_END_VA = 0x0040ea41;
export const ANM2_LOAD_ONE_BODY_BYTES = 52;
export const ANM2_LOAD_ONE_CALLSITE_COUNT = 1;
export const ANM2_LOAD_MAP_VA = 0x0040ea50;
export const ANM2_LOAD_MAP_END_VA = 0x0040ed47;
export const ANM2_LOAD_MAP_BODY_BYTES = 762;
export const ANM2_LOAD_MAP_CALLSITE_COUNT = 1;
export const ANM2_LOAD_MAP_SEH_FRAME = 0x00af0ee0;
export const ANM2_APPLY_ANIM_VA = 0x0040e520;   /* host (v8 pinned) */
export const ANM2_APPLY_ANIM_BODY_BYTES = 164;
export const ANM2_APPLY_ANIM_CALLSITE_COUNT = 5;
export const ANM2_INSERT_VA = 0x0040ed50;       /* typed host */
export const ANM2_INSERT_SEH_FRAME = 0x00af118f;
export const ANM2_INSERT_CALLSITE_COUNT = 2;
export const ANM2_FILENAME_HASH_VA = 0x00a159d0; /* pure, landed */
export const ANM2_FILENAME_HASH_SEED = 0x1505;
export const ANM2_FILENAME_HASH_CASE_DELTA = 0x20;
export const ANM2_FILENAME_HASH_BACKSLASH = 0x5c;
export const ANM2_FILENAME_HASH_SLASH = 0x2f;
export const ANM2_CACHE_SLOTS_VA = 0x00c798b8;
export const ANM2_CACHE_MAINT_GATE_MASK = 0xfffffffc;
export const ANM2_CACHE_PROBE_STRIDE = 4;
export const ANM2_CACHE_CONTAINER_LOAD = 0x00c78ee0;
export const ANM2_CACHE_CONTAINER_FIND = 0x00c78ee8;
export const ANM2_CACHE_RECEIVER_GLOBAL = 0x00c71678;
export const ANM2_MAP_NODE_ISNIL_OFF = 0x0d;
export const ANM2_MAP_NODE_KEY_OFF = 0x10;
export const ANM2_MAP_NODE_LAYERS_OFF = 0x18;
export const ANM2_MAP_NODE_COUNT_OFF = 0x1c;
export const ANM2_LOADMAP_LAYER_STRIDE = 0x38;
export const ANM2_LOADMAP_LAYER_NAME_OFF = 0x20;
export const ANM2_LOADMAP_LAYER_CAP_OFF = 0x14;
export const ANM2_CACHE_QUERY_VA = 0x006fd350;

/** 0x00a159d0 — the machine's filename key hash: djb2-style, seed
    0x1505, per byte 'A'..'Z' -> +0x20, then '\\' -> '/', h = h*33 + c
    (u32 wrap). null string -> 0. Pure leaf, 0 calls; the tree-map keys
    at 0xc78ee0/0xc78ee8 are these dwords. */
export function anm2FilenameHash(mem, nameAddr) {
  if (u32(nameAddr) === 0) return 0;
  let h = ANM2_FILENAME_HASH_SEED;
  let p = u32(nameAddr);
  for (;;) {
    const c = mem[p] & 0xff;
    if (c === 0) break;
    p = u32(p + 1);
    let c1 = c;
    if (((c - 0x41) >>> 0) <= 0x19) c1 = c + ANM2_FILENAME_HASH_CASE_DELTA;
    if (c1 === ANM2_FILENAME_HASH_BACKSLASH) c1 = ANM2_FILENAME_HASH_SLASH;
    h = u32(h * 33 + c1);
  }
  return h;
}

/** The per-probe found decision (0x40e6fb..0x40e710 etc.):
    node != end && byte[node+0xd]==0 && key >= u32[node+0x10]. */
export function anm2CacheProbeFound(mem, node, key, containerEnd) {
  node = u32(node);
  if (node === u32(containerEnd)) return 0;
  if ((mem[u32(node + ANM2_MAP_NODE_ISNIL_OFF)] & 0xff) !== 0) return 0;
  const nodeKey = readU32(mem, u32(node + ANM2_MAP_NODE_KEY_OFF));
  return u32(key) >= nodeKey ? 1 : 0;
}

/** The 0x40e5d0 slot scan law: slot_count = (end-begin)>>2 (u32; none
    when end < begin), probes in order over the fed host outcomes
    (keys/nodes per slot), stop at FIRST found; probe_avail bounds. */
export function anm2CacheFindScan(mem, {
  cacheBegin, cacheEnd, probeKeys, probeNodes, probeAvail, containerEnd,
}) {
  const plan = {
    slotCount: 0, probed: 0, found: 0, foundSlot: 0,
    probeStride: ANM2_CACHE_PROBE_STRIDE,
  };
  const begin = u32(cacheBegin), end = u32(cacheEnd);
  if (end >= begin) plan.slotCount = (end - begin) >>> 2;
  let probes = plan.slotCount;
  if (probes > probeAvail) probes = probeAvail;
  let i = 0;
  for (; i < probes; i++) {
    const key = readU32(mem, u32(u32(probeKeys) + i * 4));
    const node = readU32(mem, u32(u32(probeNodes) + i * 4));
    if (anm2CacheProbeFound(mem, node, key, containerEnd)) {
      plan.probed = i + 1;
      plan.found = 1;
      plan.foundSlot = i;
      return plan;
    }
  }
  plan.probed = i;
  return plan;
}

/** Maintenance GATE: (end-begin) & 0xfffffffc == 0 (u32). */
export function anm2CacheMaintenanceGate(cacheBegin, cacheEnd) {
  const span = u32(u32(cacheEnd) - u32(cacheBegin));
  return (span & ANM2_CACHE_MAINT_GATE_MASK) === 0 ? 1 : 0;
}

/** Maintenance store-back: pop node != 0xc798b8 -> copy its 12 bytes to
    the cache block and zero the node (cache = 12-byte shadow slice). */
export function anm2CacheMaintenanceApply(mem, popNode, cache) {
  popNode = u32(popNode);
  if (popNode === ANM2_CACHE_SLOTS_VA) return;
  for (let k = 0; k < 3; k++) {
    const v = readU32(mem, u32(popNode + k * 4));
    writeBytes(mem, u32(cache + k * 4), v, 4);
  }
  for (let k = 0; k < 3; k++) {
    writeBytes(mem, u32(popNode + k * 4), 0, 4);
  }
}

/** 0x0040ea10 load-one gate: skip = findFound; else the host block
    (query 0x6fd350 + LoadImage 0x9588a0 + APPLY_ANIM 0x40e520). */
export function anm2LoadOnePlan({ nameAddr, findFound }) {
  const skip = findFound !== 0 ? 1 : 0;
  return {
    entered: 1, found: skip, skip,
    nameAddr: u32(nameAddr),
    findCount: 1,
    queryCount: skip ? 0 : 1, loadCount: skip ? 0 : 1,
    applyCount: skip ? 0 : 1,
    findVa: ANM2_CACHE_FIND_VA, queryVa: ANM2_CACHE_QUERY_VA,
    loadImageVa: ANM2_LOAD_GRAPHICS_LOAD_IMAGE_VA,
    applyVa: ANM2_APPLY_ANIM_VA,
    receiverGlobal: ANM2_CACHE_RECEIVER_GLOBAL,
  };
}

/** 0x0040ea50 load-into-map decision law — see NOTES.md §1.5. name is a
    guest string (byte gate), layerFound = per-layer FIND flags (host). */
export function anm2LoadMapPlan(mem, {
  name, cacheBegin, cacheEnd, probeKeys, probeNodes, probeAvail,
  containerEnd, refindNode, refindKey, layerFound, layerAvail,
}) {
  const plan = {
    entered: 1, emptyGate: 0, maintenanceGate: 0,
    slotCount: 0, probed: 0, cacheFound: 0, cacheFoundSlot: 0,
    insert: 0, refindFound: 0, refindNode: u32(refindNode),
    refindKey: u32(refindKey), containerEnd: u32(containerEnd),
    nodeBase: 0, nodeCount: 0, layersScanned: 0,
    loadPairCount: 0, applyCount: 0, skippedLayers: 0,
    insertVa: ANM2_INSERT_VA, findVa: ANM2_CACHE_FIND_VA,
    loadImageVa: ANM2_LOAD_GRAPHICS_LOAD_IMAGE_VA,
    applyVa: ANM2_APPLY_ANIM_VA, queryVa: ANM2_CACHE_QUERY_VA,
    receiverGlobal: ANM2_CACHE_RECEIVER_GLOBAL,
    layerStride: ANM2_LOADMAP_LAYER_STRIDE,
    layerNameOff: ANM2_LOADMAP_LAYER_NAME_OFF,
    layerCapOff: ANM2_LOADMAP_LAYER_CAP_OFF,
    cacheSlotsVa: ANM2_CACHE_SLOTS_VA,
  };
  if (u32(name) === 0) { plan.entered = 0; return plan; }
  if ((mem[u32(name)] & 0xff) === 0) { plan.emptyGate = 1; return plan; }

  plan.maintenanceGate = anm2CacheMaintenanceGate(cacheBegin, cacheEnd);
  const begin = u32(cacheBegin), end = u32(cacheEnd);
  if (end >= begin) plan.slotCount = (end - begin) >>> 2;
  let probes = plan.slotCount;
  if (probes > probeAvail) probes = probeAvail;
  let i = 0;
  for (; i < probes; i++) {
    const key = readU32(mem, u32(u32(probeKeys) + i * 4));
    const node = readU32(mem, u32(u32(probeNodes) + i * 4));
    if (anm2CacheProbeFound(mem, node, key, containerEnd)) {
      plan.cacheFound = 1;
      plan.cacheFoundSlot = i;
      plan.probed = i + 1;
      break;
    }
  }
  if (plan.cacheFound === 0) plan.probed = i;

  let node = 0;
  if (plan.cacheFound !== 0) {
    node = readU32(mem, u32(u32(probeNodes) + plan.cacheFoundSlot * 4));
  } else {
    plan.insert = 1;
    plan.refindFound =
      anm2CacheProbeFound(mem, refindNode, refindKey, containerEnd);
    if (plan.refindFound === 0) return plan;   /* D-v54-1 / still missing */
    node = u32(refindNode);
  }

  /* layer loop — per-iteration re-reads of [node+0x18]/[node+0x1c] with
     UNSIGNED bounds; the machine's jbe entry gate (only 0 exits). */
  for (;;) {
    plan.nodeBase = readU32(mem, u32(node + ANM2_MAP_NODE_LAYERS_OFF));
    plan.nodeCount = readU32(mem, u32(node + ANM2_MAP_NODE_COUNT_OFF));
    if (plan.nodeCount === 0) break;
    let scanned = plan.nodeCount;
    if (scanned > layerAvail) scanned = layerAvail;
    plan.layersScanned = scanned;
    for (let k = 0; k < scanned; k++) {
      if ((readU32(mem, u32(u32(layerFound) + k * 4)) & 0xff) === 0) {
        plan.loadPairCount += 1;
        plan.applyCount += 1;
      } else {
        plan.skippedLayers += 1;
      }
    }
    break;
  }
  return plan;
}

/** 0x0040ea50 layer-loop name SSO-select: slot = base + i*0x38 + 0x20,
    cap = u32[slot+0x14]; cap >= 0x10 -> u32[slot] else slot. */
export function anm2LoadmapLayerNameAddr(mem, layersGuest, layerIndex) {
  const slot = u32(u32(layersGuest) +
    u32(Math.imul(layerIndex, ANM2_LOADMAP_LAYER_STRIDE)) +
    ANM2_LOADMAP_LAYER_NAME_OFF);
  const cap = readU32(mem, u32(slot + ANM2_LOADMAP_LAYER_CAP_OFF));
  if (cap < ANM2_SSO_CAPACITY_THRESHOLD) return slot;
  return readU32(mem, slot);
}

/* ====================== v55: 0x00407690 ANM2::construct_from_copy
   (unit anm2-v55-407690; copy-ctor store lane + decision laws — see
   section-notes/anm2-v55-407690) ===================================== */
export const ANM2_COPYCTOR_VA = 0x00407690;
export const ANM2_COPYCTOR_END_VA = 0x00407a5d;   /* `ret 4` */
export const ANM2_COPYCTOR_BODY_BYTES = 976;
export const ANM2_COPYCTOR_CALLSITE_COUNT = 40;   /* windowed-capstone */
export const ANM2_COPYCTOR_SEH_FRAME = 0x00af09d3;
export const ANM2_COPYCTOR_ALLOC_HEAD = 4;
export const ANM2_COPYCTOR_STRIDE = 0xa0;
export const ANM2_COPYCTOR_OWNER_OFF = 0x04;
export const ANM2_COPYCTOR_PAIR_OFF = 0x98;
export const ANM2_COPYCTOR_INNER_OFF = 0x9c;
export const ANM2_COPYCTOR_LOADED_OFF = 0x109;
export const ANM2_COPYCTOR_STR_OFF = 0x08;
export const ANM2_COPYCTOR_STR_LEN_OFF = 0x10;
export const ANM2_COPYCTOR_STR_CAP_OFF = 0x14;
export const ANM2_COPYCTOR_LAYER_FIELDS_OFF = 0x30;
export const ANM2_COPYCTOR_BLOCK_44 = 0x2c;
export const ANM2_COPYCTOR_CACHE_FETCH_VA = 0x0040e110;
export const ANM2_COPYCTOR_REGISTRY_VA = 0x00c7163c;
export const ANM2_COPYCTOR_STRING_CTOR_VA = 0x0040cf50;
export const ANM2_COPYCTOR_STATE_CTOR_VA = 0x004086e0;
export const ANM2_COPYCTOR_ALLOC_VA = 0x00a0f4e0;
export const ANM2_COPYCTOR_VECTOR_CTOR_VA = 0x00aef5c4;
export const ANM2_COPYCTOR_LAYER_CTOR_VA = 0x004081d0;
export const ANM2_COPYCTOR_LAYER_DTOR_VA = 0x00407a60;
export const ANM2_COPYCTOR_GETTER_VA = 0x00408590;
export const ANM2_COPYCTOR_STRING_ASSIGN_VA = 0x0040ccd0;
export const ANM2_COPYCTOR_KAGE_SWAP_VA = 0x0040c3b0;

/** Stage-3 alloc-size law: mul count*0xa0 (u32 wrap); overflow (seto) ->
    0xffffffff; add 4 with setb wrap (overflow stays 0xffffffff). count == 0
    -> size 4 (the header alone — the alloc still runs on the machine). */
export function anm2CopyCtorAllocSize(layerCount) {
  const product = u32(u32(layerCount) * 0xa0);
  let size;
  if (u32(layerCount) !== 0 && u32(Math.floor(product / u32(layerCount))) !== 0xa0) {
    size = 0xffffffff;
  } else {
    size = u32(product + 4);
  }
  return size >>> 0;
}

/** 0x00407690 construct_from_copy decision law. vectorBase is the HOST
    alloc result + 4 (0 when the allocator failed); allocPending :=
    vectorBase != 0. Processed layers = count && allocPending; the
    alloc-fail-with-count>0 machine path (base 0 in the layer loop) is a
    fault lane, folded to 0. Cache fetch 0x40e110 runs iff byte[src+0x109]
    (_loaded) is set. */
export function anm2CopyCtorPlan(mem, {
  dstAddr, srcAddr, vectorBase,
}) {
  const plan = {
    entered: 1, zeroed7c: 1, zeroed94: 1, zeroed98: 1, zeroed110: 1,
    srcLoaded: 0, cacheFetchCount: 0, layerCount: 0, allocSize: 0,
    allocPending: 0, vectorBase: u32(vectorBase), processedCount: 0,
    stringCtorCount: 2, stateCtorCount: 2, allocCount: 1,
    vectorCtorCount: 0, layerStringAssigns: 0, layerGetterCount: 0,
    kageSwapCount: 0, notifyChainCount: 0,
    cacheFetchVa: ANM2_COPYCTOR_CACHE_FETCH_VA,
    layerStride: ANM2_COPYCTOR_STRIDE, layerOwnerOff: ANM2_COPYCTOR_OWNER_OFF,
    layerSpritePairOff: ANM2_COPYCTOR_PAIR_OFF,
    layerSpriteInnerOff: ANM2_COPYCTOR_INNER_OFF,
    registryGlobalVa: ANM2_COPYCTOR_REGISTRY_VA,
  };
  if (u32(dstAddr) === 0 || u32(srcAddr) === 0) {
    plan.entered = 0;
    plan.zeroed7c = 0;
    plan.zeroed94 = 0;
    plan.zeroed98 = 0;
    plan.zeroed110 = 0;
    plan.stringCtorCount = 0;
    plan.stateCtorCount = 0;
    plan.allocCount = 0;
    return plan;
  }
  plan.srcLoaded =
    (readU32(mem, u32(u32(srcAddr) + ANM2_COPYCTOR_LOADED_OFF)) & 0xff) !== 0 ? 1 : 0;
  plan.cacheFetchCount = plan.srcLoaded;
  plan.layerCount = readU32(mem, u32(u32(srcAddr) + ANM2_OFF_LAYER_COUNT_80));
  plan.allocSize = anm2CopyCtorAllocSize(plan.layerCount);
  plan.allocPending = u32(vectorBase) !== 0 ? 1 : 0;
  plan.vectorCtorCount = plan.allocPending;
  if (plan.layerCount !== 0 && plan.allocPending !== 0) {
    plan.processedCount = plan.layerCount;
  }
  if (plan.processedCount !== 0) {
    /* per-processed layer: 0x40ccd0 assign + 0x408590 + 0x40c3b0. */
    plan.layerStringAssigns = plan.processedCount;
    plan.layerGetterCount = plan.processedCount;
    plan.kageSwapCount = plan.processedCount;
    /* notify gate: [src_i + 0x9c] != 0 (source sprite inner object; the
       machine's vtbl-slot-3 call + [0xc7163c] registry are host). */
    const srcLayers = readU32(mem, u32(u32(srcAddr) + ANM2_OFF_LAYER_STATE_7C));
    for (let i = 0; i < plan.processedCount; i++) {
      const sl = u32(srcLayers + Math.imul(i, ANM2_COPYCTOR_STRIDE));
      if (readU32(mem, u32(sl + ANM2_COPYCTOR_INNER_OFF)) !== 0) {
        plan.notifyChainCount += 1;
      }
    }
  }
  return plan;
}

/** Pure store lane of 0x00407690: the Stage-1 scalar block (with the four
    zero slots, incl. the pre-alloc [dst+0x7c] = 0 then the vector_base
    store), then per-layer field copies for the first processed_count
    layers (machine order: dword +0, bytes 0x30..0x33, dwords 0x34..0x44,
    self-guarded 44-B block 0x48..0x73, byte 0x74, dwords 0x78..0x94) and
    the owner back-ptr [elem+4] = dst. Layer count re-read per iteration
    (UNSIGNED jb); processed gate = count != 0 && vectorBase != 0. Host
    effects (strings/states/sprite chain) are NOT executed. */
export function anm2CopyCtorApply(mem, { dstAddr, srcAddr, vectorBase }) {
  const dst = u32(dstAddr), src = u32(srcAddr);
  if (dst === 0 || src === 0) return;
  const w8 = (a, v) => writeBytes(mem, u32(a), v & 0xff, 1);
  const w32 = (a, v) => writeBytes(mem, u32(a), v >>> 0, 4);
  /* Stage 1 scalar block (machine order). */
  w8(dst + ANM2_OFF_OVERLAY_FIRST_70,
    readU32(mem, src + ANM2_OFF_OVERLAY_FIRST_70) & 0xff);
  w32(dst + ANM2_OFF_ANIM_DATA_74, readU32(mem, src + ANM2_OFF_ANIM_DATA_74));
  w32(dst + ANM2_OFF_ANIM_COUNT_78, readU32(mem, src + ANM2_OFF_ANIM_COUNT_78));
  w32(dst + ANM2_OFF_LAYER_STATE_7C, 0);
  w32(dst + ANM2_OFF_LAYER_COUNT_80, readU32(mem, src + ANM2_OFF_LAYER_COUNT_80));
  w32(dst + ANM2_SWAP_EXTRAS_PTR_OFF, readU32(mem, src + ANM2_SWAP_EXTRAS_PTR_OFF));
  w32(dst + ANM2_SWAP_EXTRAS_COUNT_OFF, readU32(mem, src + ANM2_SWAP_EXTRAS_COUNT_OFF));
  w32(dst + ANM2_SWAP_EXTRAS_PTR2_OFF, readU32(mem, src + ANM2_SWAP_EXTRAS_PTR2_OFF));
  w32(dst + ANM2_SWAP_EXTRAS_COUNT2_OFF, readU32(mem, src + ANM2_SWAP_EXTRAS_COUNT2_OFF));
  w32(dst + ANM2_OFF_OFFSET_94 + 4, 0);   /* 0x98 before 0x94 (PE) */
  w32(dst + ANM2_OFF_OFFSET_94, 0);
  w32(dst + ANM2_OFF_SCALE_9C, readU32(mem, src + ANM2_OFF_SCALE_9C));
  w32(dst + ANM2_OFF_SCALE_9C + 4, readU32(mem, src + ANM2_OFF_SCALE_9C + 4));
  w32(dst + ANM2_OFF_ROTATION_A4, readU32(mem, src + ANM2_OFF_ROTATION_A4));
  copyBlock44(mem, dst + ANM2_OFF_COLOR_A8, src + ANM2_OFF_COLOR_A8);
  copyBlock44(mem, dst + ANM2_OFF_CHAMPION_COLOR_D4, src + ANM2_OFF_CHAMPION_COLOR_D4);
  w8(dst + ANM2_OFF_FLIP_PAIR_100, readU32(mem, src + ANM2_OFF_FLIP_PAIR_100) & 0xff);
  w8(dst + ANM2_OFF_FLIP_PAIR_100 + 1, readU32(mem, src + ANM2_OFF_FLIP_PAIR_100 + 1) & 0xff);
  w32(dst + ANM2_OFF_PLAYBACK_SPEED_104, readU32(mem, src + ANM2_OFF_PLAYBACK_SPEED_104));
  w8(dst + ANM2_OFF_LOADED_PAIR_108, readU32(mem, src + ANM2_OFF_LOADED_PAIR_108) & 0xff);
  w8(dst + ANM2_OFF_LOADED_BYTE_109, readU32(mem, src + ANM2_OFF_LOADED_BYTE_109) & 0xff);
  w32(dst + ANM2_OFF_UNNAMED_10C, readU32(mem, src + ANM2_OFF_UNNAMED_10C));
  w32(dst + ANM2_OFF_BITFLAGS_110, 0);
  /* Stage 3: the vector base store (host-fed value). */
  w32(dst + ANM2_OFF_LAYER_STATE_7C, u32(vectorBase));

  const srcLayers = readU32(mem, src + ANM2_OFF_LAYER_STATE_7C);
  const count0 = readU32(mem, src + ANM2_OFF_LAYER_COUNT_80);
  if (count0 !== 0 && u32(vectorBase) !== 0) {
    /* per-layer loop with per-iteration count re-read (UNSIGNED jb). */
    let i = 0;
    for (;;) {
      const sl = u32(srcLayers + i);
      const dl = u32(u32(vectorBase) + i);
      w32(dl, readU32(mem, sl));
      w8(dl + 0x30, readU32(mem, sl + 0x30) & 0xff);
      w8(dl + 0x31, readU32(mem, sl + 0x31) & 0xff);
      w8(dl + 0x32, readU32(mem, sl + 0x32) & 0xff);
      w8(dl + 0x33, readU32(mem, sl + 0x33) & 0xff);
      w32(dl + 0x34, readU32(mem, sl + 0x34));
      w32(dl + 0x38, readU32(mem, sl + 0x38));
      w32(dl + 0x3c, readU32(mem, sl + 0x3c));
      w32(dl + 0x40, readU32(mem, sl + 0x40));
      w32(dl + 0x44, readU32(mem, sl + 0x44));
      if (u32(dl + 0x48) !== u32(sl + 0x48)) {   /* self-guard (PE 0x4079a0) */
        copyBlock44(mem, dl + 0x48, sl + 0x48);
      }
      w8(dl + 0x74, readU32(mem, sl + 0x74) & 0xff);
      w32(dl + 0x78, readU32(mem, sl + 0x78));
      w32(dl + 0x7c, readU32(mem, sl + 0x7c));
      w32(dl + 0x80, readU32(mem, sl + 0x80));
      w32(dl + 0x84, readU32(mem, sl + 0x84));
      w32(dl + 0x88, readU32(mem, sl + 0x88));
      w32(dl + 0x8c, readU32(mem, sl + 0x8c));
      w32(dl + 0x90, readU32(mem, sl + 0x90));
      w32(dl + 0x94, readU32(mem, sl + 0x94));
      /* owner back-ptr (PE 0x407a2f, element + 4). */
      w32(dl + ANM2_COPYCTOR_OWNER_OFF, dst);
      i = u32(i + ANM2_COPYCTOR_STRIDE);
      const re = readU32(mem, src + ANM2_OFF_LAYER_COUNT_80);
      if (!(u32(i / ANM2_COPYCTOR_STRIDE) < re)) break;  /* UNSIGNED jb */
    }
  }
}

function copyBlock44(mem, d, s) {
  for (let j = 0; j < 0x2c; j++) mem[u32(d + j)] = mem[u32(s + j)];
}

/** 0x00407690 L2 string SSO-select: len = u32[layer+8+0x10]; ptr =
    (u32[layer+8+0x14] >= 0x10) ? u32[layer+8] : layer+8 (PE 0x40790b..). */
export function anm2CopyCtorLayerStringSrc(mem, { layerAddr }) {
  const slot = u32(u32(layerAddr) + ANM2_COPYCTOR_STR_OFF);
  const len = readU32(mem, u32(slot + ANM2_COPYCTOR_STR_LEN_OFF));
  const cap = readU32(mem, u32(slot + ANM2_COPYCTOR_STR_CAP_OFF));
  let ptr = slot;
  if (cap >= ANM2_SSO_CAPACITY_THRESHOLD) {
    ptr = readU32(mem, slot);
  }
  return { ptr: u32(ptr), len: u32(len), cap: u32(cap) };
}

/* ================= v56: 0x0040e470 AnmCache-clear teardown =============== */

/* Container global the walk reads (0xc78ee0 — the same value v54 pinned
   as ANM2_CACHE_CONTAINER_LOAD). */
export const ANM2_CACHE_CLEAR_CONTAINER_VA = 0x00c78ee0;
export const ANM2_CACHE_CLEAR_NODE_SIZE = 0x54;
export const ANM2_CACHE_CLEAR_GATE_OFF = 0x50;
export const ANM2_CACHE_CLEAR_LOG_ID_OFF = 0x10;
export const ANM2_CACHE_CLEAR_STR_A_OFF = 0x14;
export const ANM2_CACHE_CLEAR_STR_B_OFF = 0x38;
export const ANM2_CACHE_CLEAR_LOG_FMT_VA = 0x00b1b2c0; /* "AnmCache: Clear %u.\n" */
export const ANM2_CACHE_CLEAR_LOG_LEVEL = 1;
export const ANM2_CACHE_CLEAR_LOG_VA = 0x00a112c0;
export const ANM2_CACHE_CLEAR_STRING_TEARDOWN_VA = 0x0040d850;
export const ANM2_CACHE_CLEAR_ADVANCE_VA = 0x00414a80;
export const ANM2_CACHE_CLEAR_ERASE_VA = 0x00415d20;
export const ANM2_CACHE_CLEAR_STRING_TIDY_VA = 0x0040d040;
export const ANM2_CACHE_CLEAR_DELETE_VA = 0x00aef15c;

/** 0x0040e48b mov edi,[0xc78ee0] — container head read. */
export function anm2CacheClearHead(mem, containerAddr) {
  return u32(readU32(mem, u32(containerAddr)));
}

/** 0x0040e491 mov esi,[edi] — head->_Next at +0. */
export function anm2CacheClearFirstNode(mem, headAddr) {
  return u32(readU32(mem, u32(headAddr)));
}

/** 0x0040e496 cmp esi,edi ; je — empty iff first == head. */
export function anm2CacheClearEmpty(firstAddr, headAddr) {
  return u32(firstAddr) === u32(headAddr) ? 1 : 0;
}

/** 0x0040e4a0 cmp dword [esi+0x50],0 ; jne — FULL-dword gate. */
export function anm2CacheClearGate(mem, nodeAddr) {
  const g = readU32(mem, u32(u32(nodeAddr) + ANM2_CACHE_CLEAR_GATE_OFF));
  return g === 0 ? 1 : 0;
}

/** 0x40e4a6 push [esi+0x10] — the %u cache id. */
export function anm2CacheClearLogId(mem, nodeAddr) {
  return u32(readU32(mem, u32(u32(nodeAddr) + ANM2_CACHE_CLEAR_LOG_ID_OFF)));
}

/** 0x40e504 cmp esi,edi ; jne — terminate iff node == head. */
export function anm2CacheClearWalkDone(nodeAddr, headAddr) {
  return u32(nodeAddr) === u32(headAddr) ? 1 : 0;
}

/** One machine step (advance 0x414a80 is host-fed, v54 find_scan
    precedent). Teardown path: log + string14 + advance + erase + tidy38 +
    delete(0x54) + head RE-READ from u32[container] (0x40e4ee, D-family
    re-read). Skip path: advance only, head stays stale. */
export function anm2CacheClearStepPlan(mem, {
  containerAddr, nodeAddr, headAddr,
}) {
  const plan = {
    entered: u32(nodeAddr) !== 0 ? 1 : 0,
    gate: 0, logId: 0, walkDone: 0,
    headReloadValue: u32(headAddr), headReloaded: 0,
    logCount: 0, string14Count: 0, advanceCount: 0, eraseCount: 0,
    tidy38Count: 0, deleteCount: 0,
    deleteSize: ANM2_CACHE_CLEAR_NODE_SIZE, nodeSize: ANM2_CACHE_CLEAR_NODE_SIZE,
    gateOff: ANM2_CACHE_CLEAR_GATE_OFF, logIdOff: ANM2_CACHE_CLEAR_LOG_ID_OFF,
    strAOff: ANM2_CACHE_CLEAR_STR_A_OFF, strBOff: ANM2_CACHE_CLEAR_STR_B_OFF,
    logFmtVa: ANM2_CACHE_CLEAR_LOG_FMT_VA, logLevel: ANM2_CACHE_CLEAR_LOG_LEVEL,
  };
  if (u32(nodeAddr) === 0) return plan;
  plan.logId = anm2CacheClearLogId(mem, nodeAddr);
  plan.walkDone = anm2CacheClearWalkDone(nodeAddr, headAddr);
  plan.gate = anm2CacheClearGate(mem, nodeAddr);
  plan.advanceCount = 1;
  if (plan.gate !== 0) {
    plan.logCount = 1;
    plan.string14Count = 1;
    plan.eraseCount = 1;
    plan.tidy38Count = 1;
    plan.deleteCount = 1;
    plan.headReloadValue = anm2CacheClearHead(mem, containerAddr);
    plan.headReloaded = 1;
  }
  return plan;
}

/* =================== v57: 0x0040c890 hash grow/insert =====================
   Model twins of the v57 laws. Same globals as the v46 probe: base
   0xc78db4, cur 0xc78db8, endLo 0xc78dbc, endHi 0xc78dc0. Roles in the
   insert: base = slot array, cur = slot count, endLo = masked cursor,
   endHi = live count. All u32 wrap (>>> 0). Host leaves (0x40cf00,
   0xa0f4c0, 0xaf08bd, 0xaf05e5, 0x40c740, 0x40cad0, 0x40cee0) are
   counted, never executed. */

export const ANM2_HASH_INSERT_VA = 0x0040c890;
export const ANM2_HASH_INSERT_END_VA = 0x0040ca5d;
export const ANM2_HASH_INSERT_BODY_BYTES = 0x1d0;
export const ANM2_HASH_INSERT_CALLSITE_COUNT = 6;
export const ANM2_HASH_INSERT_CALLER_FIRST_VA = 0x006250dd;
export const ANM2_HASH_INSERT_CALLER_LAST_VA = 0x0078d323;
export const ANM2_HASH_INSERT_MIN_CAPACITY = 8;
export const ANM2_HASH_INSERT_CAP_GUARD = 0x5d174d5;
export const ANM2_HASH_INSERT_CAP_MAX = 0x3fffffff;
export const ANM2_HASH_INSERT_SLOT_STRIDE = 4;
export const ANM2_HASH_INSERT_NODE_SIZE = 0x2c;
export const ANM2_HASH_INSERT_ALLOC_VA = 0x0040cf00;
export const ANM2_HASH_INSERT_NODE_ALLOC_VA = 0x00a0f4c0;
export const ANM2_HASH_INSERT_MEMCPY_VA = 0x00af08bd;
export const ANM2_HASH_INSERT_MEMSET_VA = 0x00af05e5;
export const ANM2_HASH_INSERT_FREE_VA = 0x0040c740;
export const ANM2_HASH_INSERT_THROW_A_VA = 0x0040cad0;
export const ANM2_HASH_INSERT_THROW_B_VA = 0x0040cee0;

/** 0x40c8a9 `cmp edx,eax ; ja skip` — grow iff cur <= end_hi + 1 (u32). */
export function anm2HashGrowGate(cur, endHi) {
  return u32(cur) <= ((u32(endHi) + 1) >>> 0) ? 1 : 0;
}

/** 0x40c8af..0x40c8e2 doubling loop (abort returns the pre-double eax). */
export function anm2HashGrowCapacity(cur) {
  let eax = u32(cur) === 0 ? 1 : u32(cur);
  for (;;) {
    const d = (eax - u32(cur)) >>> 0;
    if (d >= 1 && eax >= ANM2_HASH_INSERT_MIN_CAPACITY) return eax >>> 0;
    if (((ANM2_HASH_INSERT_CAP_GUARD - eax) >>> 0) < eax) {
      return eax >>> 0; /* overflow throw point */
    }
    eax = (eax * 2) >>> 0;
  }
}

/** 0x40c9fd..0x40ca06 slot selection, u32 wrap. */
export function anm2HashInsertSlot(endLo, cur, endHi) {
  const mask = (u32(cur) - 1) >>> 0;
  return ((((u32(endLo) & mask) + u32(endHi)) >>> 0) & mask) >>> 0;
}

/** 0x40ca0f probe test: u32[base + slot*4] == 0. */
export function anm2HashSlotEmpty(mem, base, slot) {
  return readU32(mem, (u32(base) + u32(slot) * 4) >>> 0) === 0 ? 1 : 0;
}

/** 0x40c930..0x40c9ed grow data motion + release + global stores. */
export function anm2HashGrowMotionPlan({
  oldBase, oldCap, cur, delta, newBase,
}) {
  oldBase = u32(oldBase); oldCap = u32(oldCap); cur = u32(cur);
  delta = u32(delta); newBase = u32(newBase);
  const caseB = oldCap > delta ? 1 : 0; /* 0x40c949 `ja` */
  const tailBytes = ((cur - oldCap) * 4) >>> 0;
  const plan = {
    entered: 1, caseB, moveCount: 0, move0Dst: 0, move0Src: 0, move0Count: 0,
    move1Dst: 0, move1Src: 0, move1Count: 0, move2Dst: 0, move2Src: 0,
    move2Count: 0, zeroCount: 0, zero0Dst: 0, zero0Count: 0, zero1Dst: 0,
    zero1Count: 0, freeNeeded: 0, freeSize: 0, baseStore: 0, curStore: 0,
  };
  plan.move0Dst = (newBase + oldCap * 4) >>> 0;
  plan.move0Src = (oldBase + oldCap * 4) >>> 0;
  plan.move0Count = tailBytes;
  if (caseB !== 0) {
    plan.moveCount = 3;
    plan.move1Dst = (newBase + cur * 4) >>> 0;
    plan.move1Src = oldBase;
    plan.move1Count = (delta * 4) >>> 0;
    plan.move2Dst = newBase;
    plan.move2Src = (oldBase + delta * 4) >>> 0;
    plan.move2Count = ((oldCap - delta) * 4) >>> 0;
    plan.zeroCount = 1;
    plan.zero0Dst = (newBase + ((oldCap - delta) * 4)) >>> 0;
    plan.zero0Count = (delta * 4) >>> 0;
  } else {
    plan.moveCount = 2;
    plan.move1Dst = (newBase + cur * 4) >>> 0;
    plan.move1Src = oldBase;
    plan.move1Count = (oldCap * 4) >>> 0;
    plan.zeroCount = 2;
    plan.zero0Dst = (newBase + cur * 4 + oldCap * 4) >>> 0;
    plan.zero0Count = ((delta - oldCap) * 4) >>> 0;
    plan.zero1Dst = newBase;
    plan.zero1Count = (oldCap * 4) >>> 0;
  }
  plan.freeNeeded = oldBase !== 0 ? 1 : 0;
  plan.freeSize = cur;
  plan.baseStore = newBase;
  plan.curStore = (cur + delta) >>> 0;
  return plan;
}

/** 0x40c890 whole-body decision plan (newBase = host alloc result). */
export function anm2HashInsertPlan(mem, {
  base, cur, endLo, endHi, newBase,
}) {
  base = u32(base); cur = u32(cur); endLo = u32(endLo);
  endHi = u32(endHi); newBase = u32(newBase);
  const growGate = anm2HashGrowGate(cur, endHi);
  let capacity = 0, delta = 0, overflowThrow = 0, capThrow = 0;
  if (growGate !== 0) {
    let eax = cur === 0 ? 1 : cur;
    for (;;) {
      const d = (eax - cur) >>> 0;
      if (d >= 1 && eax >= ANM2_HASH_INSERT_MIN_CAPACITY) break;
      if (((ANM2_HASH_INSERT_CAP_GUARD - eax) >>> 0) < eax) {
        overflowThrow = 1;
        capacity = eax;
        delta = d;
        break;
      }
      eax = (eax * 2) >>> 0;
    }
    if (overflowThrow === 0) {
      capacity = eax;
      delta = (eax - cur) >>> 0;
      if (capacity > ANM2_HASH_INSERT_CAP_MAX) capThrow = 1;
    }
  }
  const aborted = overflowThrow !== 0 || capThrow !== 0 ? 1 : 0;
  let caseB = 0, moveCount = 0, zeroCount = 0, freeNeeded = 0,
    freeSize = 0, memcpyCount = 0, memsetCount = 0, allocBytes = 0,
    allocCount = 0, freeCount = 0, baseEff = base, baseUpdated = 0,
    curEff = cur, curUpdated = 0;
  if (growGate !== 0 && aborted === 0) {
    allocBytes = (capacity * 4) >>> 0;
    allocCount = 1;
    const m = anm2HashGrowMotionPlan({
      oldBase: base, oldCap: endLo, cur, delta, newBase,
    });
    caseB = m.caseB;
    moveCount = m.moveCount;
    zeroCount = m.zeroCount;
    freeNeeded = m.freeNeeded;
    freeSize = m.freeSize;
    freeCount = m.freeNeeded;
    memcpyCount = m.moveCount;
    memsetCount = m.zeroCount;
    baseEff = m.baseStore;
    baseUpdated = 1;
    curEff = m.curStore;
    curUpdated = 1;
  }
  let slot = 0, endLoStore = 0, slotEmpty = 0, nodeAllocCount = 0,
    endHiInc = 1;
  if (aborted === 0) {
    slot = anm2HashInsertSlot(endLo, curEff, endHi);
    endLoStore = (endLo & ((curEff - 1) >>> 0)) >>> 0;
    slotEmpty = anm2HashSlotEmpty(mem, baseEff, slot);
    if (slotEmpty !== 0) nodeAllocCount = 1;
  } else {
    endHiInc = 0;
  }
  const nodeSize = ANM2_HASH_INSERT_NODE_SIZE;
  const hostCallCount = allocCount + memcpyCount + memsetCount + freeCount +
    nodeAllocCount + overflowThrow + capThrow;
  return {
    entered: 1, base, cur, endLo, endHi, growGate, capacity, delta,
    overflowThrow, capThrow, allocBytes, allocCount, caseB, moveCount,
    zeroCount, freeNeeded, freeSize, freeCount, baseEff, baseUpdated,
    curEff, curUpdated, slot, endLoStore, slotEmpty, nodeAllocCount,
    nodeAllocSize: nodeSize, copySize: nodeSize, endHiInc, memcpyCount,
    memsetCount, hostCallCount, pureComplete: 1,
    allocVa: ANM2_HASH_INSERT_ALLOC_VA,
    nodeAllocVa: ANM2_HASH_INSERT_NODE_ALLOC_VA,
    memcpyVa: ANM2_HASH_INSERT_MEMCPY_VA,
    memsetVa: ANM2_HASH_INSERT_MEMSET_VA,
    freeVa: ANM2_HASH_INSERT_FREE_VA,
    throwAVa: ANM2_HASH_INSERT_THROW_A_VA,
    throwBVa: ANM2_HASH_INSERT_THROW_B_VA,
  };
}

/* ================= v58: 0x0040c2d0 string empty + 0x0040c2f0 clear ===== */

export const ANM2_STRING_EMPTY_VA = 0x0040c2d0;
export const ANM2_STRING_EMPTY_END_VA = 0x0040c2d7;
export const ANM2_STRING_EMPTY_BODY_BYTES = 0x8;
export const ANM2_STRING_EMPTY_CALLSITE_COUNT = 4;
export const ANM2_STRING_EMPTY_CALLER_FIRST_VA = 0x005dbe88;
export const ANM2_STRING_EMPTY_CALLER_LAST_VA = 0x007891d7;
export const ANM2_STRING_SIZE_OFF = 0x10;
export const ANM2_STRING_CAP_OFF = 0x14;
export const ANM2_STRING_CLEAR_VA = 0x0040c2f0;
export const ANM2_STRING_CLEAR_END_VA = 0x0040c30d;
export const ANM2_STRING_CLEAR_BODY_BYTES = 0x1e;
export const ANM2_STRING_CLEAR_CALLSITE_COUNT = 7;
export const ANM2_STRING_CLEAR_CALLER_FIRST_VA = 0x00687897;
export const ANM2_STRING_CLEAR_CALLER_LAST_VA = 0x0094ce31;

/** 0x40c2d4 `sete al` after the FULL-dword `cmp [ecx+0x10],0`: 1 iff
 * size == 0. No byte masking anywhere in the machine. */
export function anm2StringEmpty(size) {
  return u32(size) === 0 ? 1 : 0;
}

/** 0x40c2f0 clear: 0x40c2f4 `jb` (UNSIGNED) -> SSO path for cap < 0x10;
 * heap path selects buf = u32[self] as the first-byte store target.
 * The dword [self+0x10] := 0 store is shared by both exits. The oracle
 * is reasoned from the disassembly independently: a plan of two constant
 * stores (size dword 0, first byte 0) whose byte address the cap gate
 * picks. */
export function anm2StringClearPlan({ cap, buf, self }) {
  cap = u32(cap); buf = u32(buf); self = u32(self);
  const heapPath = cap >= ANM2_SSO_CAPACITY_THRESHOLD ? 1 : 0;
  return {
    entered: 1,
    cap, buf, self,
    heapPath,
    sizeStore: 1,
    sizeOff: ANM2_STRING_SIZE_OFF,
    sizeValue: 0,
    byteStore: 1,
    byteAddr: heapPath !== 0 ? buf : self,
    byteValue: 0,
    pureComplete: 1,
  };
}
/* ============ v85 unit: XML entity-decode trio (0x00416920 / 0x00416b70 /
   0x00416e80) + UTF-8 leaf 0x00416dc0 =====================================
   One MSVC-generated template, three table-constant instantiations:
     site 0 0x00416920 skip 0xb1a960 cls 0xb1ac60 term ' (attrs @0x0041671e)
     site 1 0x00416b70 skip 0xb1a860 cls 0xb1ab60 term " (attrs @0x004166de)
     site 2 0x00416e80 skip 0xb1a760 cls 0xb1aa60 term < (children
            @0x004167fd)
   Shared: hex table 0xb1ad60, error slot 0xc7de4c, strings 0xb1b6f8
   ("expected ;") / 0xb1b704 ("invalid numeric character entity").
   Report-only plans; the UTF-8 callee is landed in the same island set,
   so decode host_call_count stays 0 and utf8_calls counts invocations. */

export const ANM2_XML_UTF8_VA = 0x00416dc0;
export const ANM2_XML_UTF8_END_VA = 0x00416e69;
export const ANM2_XML_UTF8_BODY_BYTES = 0xa9;
export const ANM2_XML_UTF8_CALLSITE_COUNT = 3;
export const ANM2_XML_UTF8_ADDR_TAKEN = 0;
export const ANM2_XML_UTF8_ERR_SLOT_VA = 0xc7de4c;
export const ANM2_XML_UTF8_INVALID_CP_VA = 0xb1b704;

export const ANM2_XML_DECODE_SITES = 3;
export const ANM2_XML_DECODE_TEXT_VA_0 = 0x00416920;
export const ANM2_XML_DECODE_TEXT_END_VA_0 = 0x00416afb;
export const ANM2_XML_DECODE_SKIP_TABLE_VA_0 = 0xb1a960;
export const ANM2_XML_DECODE_CLASS_TABLE_VA_0 = 0xb1ac60;
export const ANM2_XML_DECODE_TERM_CHAR_0 = 0x27;
export const ANM2_XML_DECODE_CALLSITE_VA_0 = 0x0041671e;
export const ANM2_XML_DECODE_TEXT_VA_1 = 0x00416b70;
export const ANM2_XML_DECODE_TEXT_END_VA_1 = 0x00416d4c;
export const ANM2_XML_DECODE_SKIP_TABLE_VA_1 = 0xb1a860;
export const ANM2_XML_DECODE_CLASS_TABLE_VA_1 = 0xb1ab60;
export const ANM2_XML_DECODE_TERM_CHAR_1 = 0x22;
export const ANM2_XML_DECODE_CALLSITE_VA_1 = 0x004166de;
export const ANM2_XML_DECODE_TEXT_VA_2 = 0x00416e80;
export const ANM2_XML_DECODE_TEXT_END_VA_2 = 0x0041705c;
export const ANM2_XML_DECODE_SKIP_TABLE_VA_2 = 0xb1a760;
export const ANM2_XML_DECODE_CLASS_TABLE_VA_2 = 0xb1aa60;
export const ANM2_XML_DECODE_TERM_CHAR_2 = 0x3c;
export const ANM2_XML_DECODE_CALLSITE_VA_2 = 0x004167fd;
export const ANM2_XML_DECODE_HEX_TABLE_VA = 0xb1ad60;
export const ANM2_XML_DECODE_LOOKUP_VA_0 = 0x00416b14;
export const ANM2_XML_DECODE_LOOKUP_VA_1 = 0x00416d64;
export const ANM2_XML_DECODE_LOOKUP_VA_2 = 0x00417074;
export const ANM2_XML_DECODE_JUMPTAB_VA_0 = 0x00416afc;
export const ANM2_XML_DECODE_JUMPTAB_VA_1 = 0x00416d4c;
export const ANM2_XML_DECODE_JUMPTAB_VA_2 = 0x0041705c;
export const ANM2_XML_DECODE_ERROR_SLOT_VA = 0xc7de4c;
export const ANM2_XML_DECODE_EXPECTED_SEMI_VA = 0xb1b6f8;
export const ANM2_XML_DECODE_DISPATCH_BASE = -0x23;
export const ANM2_XML_DECODE_DISPATCH_BOUND = 0x4e;
export const ANM2_XML_DECODE_UTF8_CALLEE_VA = 0x00416dc0;

/** 0x00416dc0 report-only plan (flat-image oracle). */
export function anm2XmlUtf8EncodePlan(mem, { cursorSlotAddr, codePoint }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, cursorSlotAddr: u32(cursorSlotAddr), outStart: 0,
    codePoint: u32(codePoint), length: 0,
    b0: 0, b1: 0, b2: 0, b3: 0, newCursor: 0,
    errorWritten: 0, errorStringVa: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (u32(cursorSlotAddr) === 0 || cursorSlotAddr === undefined) return plan;
  plan.entered = 1;
  const outStart = rd32(cursorSlotAddr);
  plan.outStart = outStart;
  const cp = u32(codePoint);
  let len = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0;
  if (cp < 0x80) {
    len = 1; b0 = cp & 0xff;
  } else if (cp < 0x800) {
    len = 2;
    b0 = (0xc0 | (cp >>> 6)) & 0xff;
    b1 = (0x80 | (cp & 0x3f)) & 0xff;
  } else if (cp < 0x10000) {
    len = 3;
    b0 = (0xe0 | (cp >>> 12)) & 0xff;
    b1 = (0x80 | ((cp >>> 6) & 0x3f)) & 0xff;
    b2 = (0x80 | (cp & 0x3f)) & 0xff;
  } else if (cp < 0x110000) {
    len = 4;
    b0 = (0xf0 | (cp >>> 18)) & 0xff;
    b1 = (0x80 | ((cp >>> 12) & 0x3f)) & 0xff;
    b2 = (0x80 | ((cp >>> 6) & 0x3f)) & 0xff;
    b3 = (0x80 | (cp & 0x3f)) & 0xff;
  } else {
    /* 0x00416e5e: error slot := 0xb1b704; cursor NOT advanced. */
    plan.errorWritten = 1;
    plan.errorStringVa = ANM2_XML_UTF8_INVALID_CP_VA;
    plan.newCursor = outStart;
    return plan;
  }
  plan.length = len;
  plan.b0 = b0; plan.b1 = b1; plan.b2 = b2; plan.b3 = b3;
  plan.newCursor = (outStart + len) >>> 0;
  return plan;
}

/** 0x00416920/0x00416b70/0x00416e80 template report-only plan. */
export function anm2XmlDecodeTextPlan(
  mem, { cursorSlotAddr, skipTable, classTable, hexTable }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, cursorSlotAddr: u32(cursorSlotAddr),
    scanIn: 0, scanAfterSkip: 0, skippedCount: 0,
    scanOut: 0, decodedEnd: 0, outBytes: 0,
    verbatimCopies: 0, namedEntities: 0, numericEntities: 0, utf8Calls: 0,
    semiErrors: 0, invalidCpErrors: 0, lastErrorStringVa: 0,
    pureComplete: 1, hostCallCount: 0,
  };
  if (cursorSlotAddr === undefined ||
      u32(cursorSlotAddr) === 0 || u32(skipTable) === 0 ||
      u32(classTable) === 0 || u32(hexTable) === 0) return plan;
  plan.entered = 1;

  /* 0x00416929..4c: skip while skip_table[*esi] != 0. */
  let esi = rd32(cursorSlotAddr) >>> 0;
  plan.scanIn = esi;
  while (mem[u32(skipTable) + mem[esi]] !== 0) {
    esi = (esi + 1) >>> 0;
    plan.skippedCount++;
  }
  plan.scanAfterSkip = esi;
  /* 0x0041694e: [edi] = esi (reported, not performed). */

  let out = esi;                 /* edx == [ebp-4]: in-place decode */
  const emit = (n) => { out = (out + n) >>> 0; plan.outBytes += n; };

  for (;;) {
    const bl = mem[esi];
    if (mem[u32(classTable) + bl] === 0) break;    /* 0x0041695a */

    if (bl !== 0x26) {                             /* 0x00416967 */
      plan.verbatimCopies++;
      emit(1);                                     /* *out++ = bl */
      esi = (esi + 1) >>> 0;
      continue;
    }

    /* 0x00416970..87: signed [esi+1], -0x23, unsigned bound 0x4e. */
    const raw = mem[esi + 1];
    const sxt = raw >= 0x80 ? raw - 0x100 : raw;
    const idx = (sxt - 0x23) >>> 0;
    if (idx > ANM2_XML_DECODE_DISPATCH_BOUND) {
      plan.verbatimCopies++; emit(1); esi = (esi + 1) >>> 0; continue;
    }
    const key = raw;

    if (key === 0x23) {                            /* '#' numeric */
      plan.numericEntities++;
      let cp = 0;
      if (mem[esi + 2] === 0x78) {                 /* 'x' hex */
        let v = mem[u32(hexTable) + mem[esi + 3]];
        esi = (esi + 3) >>> 0;
        while (v !== 0xff) {
          esi = (esi + 1) >>> 0;
          cp = ((cp << 4) + v) >>> 0;
          v = mem[u32(hexTable) + mem[esi]];
        }
      } else {                                     /* decimal */
        let v = mem[u32(hexTable) + mem[esi + 2]];
        esi = (esi + 2) >>> 0;
        while (v !== 0xff) {
          esi = (esi + 1) >>> 0;
          cp = (((cp + cp * 4) << 1) + v) >>> 0;   /* *10+v, u32 wrap */
          v = mem[u32(hexTable) + mem[esi]];
        }
      }
      plan.utf8Calls++;
      /* inline 0x00416dc0 semantics (same unit, translated callee) */
      if (cp >= 0x110000) {
        plan.invalidCpErrors++;
        plan.lastErrorStringVa = ANM2_XML_UTF8_INVALID_CP_VA;
        emit(0);                                   /* no bytes land */
      } else {
        emit(cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4);
      }
      if (mem[esi] === 0x3b) {                     /* ';' consume */
        esi = (esi + 1) >>> 0;
      } else {
        plan.semiErrors++;
        plan.lastErrorStringVa = ANM2_XML_DECODE_EXPECTED_SEMI_VA;
      }
      continue;
    }

    let matched = 0, adv = 0;
    if (key === 0x61) {                            /* 'a' amp/apos */
      if (mem[esi + 2] === 0x6d && mem[esi + 3] === 0x70 &&
          mem[esi + 4] === 0x3b) {
        matched = 1; adv = 5;                      /* &amp; -> '&' */
      } else if (mem[esi + 2] === 0x70 && mem[esi + 3] === 0x6f &&
                 mem[esi + 4] === 0x73 && mem[esi + 5] === 0x3b) {
        matched = 1; adv = 6;                      /* &apos; -> '\'' */
      }
    } else if (key === 0x67) {                     /* 'g' gt */
      if (mem[esi + 2] === 0x74 && mem[esi + 3] === 0x3b) {
        matched = 1; adv = 4;                      /* &gt; -> '>' */
      }
    } else if (key === 0x6c) {                     /* 'l' lt */
      if (mem[esi + 2] === 0x74 && mem[esi + 3] === 0x3b) {
        matched = 1; adv = 4;                      /* &lt; -> '<' */
      }
    } else if (key === 0x71) {                     /* 'q' quot */
      if (mem[esi + 2] === 0x75 && mem[esi + 3] === 0x6f &&
          mem[esi + 4] === 0x74 && mem[esi + 5] === 0x3b) {
        matched = 1; adv = 6;                      /* &quot; -> '"' */
      }
    }
    if (matched) {
      plan.namedEntities++;
      emit(1);
      esi = (esi + adv) >>> 0;
    } else {
      plan.verbatimCopies++;                       /* default: copy '&' */
      emit(1);
      esi = (esi + 1) >>> 0;
    }
  }

  plan.scanOut = esi;
  plan.decodedEnd = out;
  return plan;
}

/* ============ v86 unit: 0x00416510 XML arena allocator SPLIT law ========
   FAST arm pure-complete (align-up, cap compare, end bump); GROW arm
   reports the alloc shape and leaves the call to the host. */

export const ANM2_XML_ALLOC_VA = 0x00416510;
export const ANM2_XML_ALLOC_END_VA = 0x0041659a;
export const ANM2_XML_ALLOC_BODY_BYTES = 0x8d;
export const ANM2_XML_ALLOC_CALLSITE_COUNT = 16;
export const ANM2_XML_ALLOC_ADDR_TAKEN = 0;
export const ANM2_XML_ALLOC_ALIGN_MASK = 3;
export const ANM2_XML_ALLOC_GROW_FLOOR = 0x10000;
export const ANM2_XML_ALLOC_HDR_SLACK = 0xa;
export const ANM2_XML_ALLOC_CUSTOM_FN_OFF = 0x1000c;
export const ANM2_XML_ALLOC_OOM_STRING_VA = 0xb1b6b4;
export const ANM2_XML_ALLOC_ERROR_SLOT_VA = 0xc7de4c;
export const ANM2_XML_ALLOC_CRT_MALLOC_VA = 0xa0f4e0;

/** 0x00416510 report-only plan (flat-image oracle). */
export function anm2XmlAllocPlan(mem, { arenaAddr, needed }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, arenaAddr: u32(arenaAddr), needed: u32(needed),
    curEnd: 0, alignPad: 0, alignedEnd: 0, reqEnd: 0, cap: 0,
    grow: 0, growBlocks: 0, allocSize: 0, customFn: 0, useCustom: 0,
    oomStringVa: 0, pureComplete: 1, hostCallCount: 0,
    newEnd: 0, retPtr: 0,
  };
  if (arenaAddr === undefined || u32(arenaAddr) === 0) return plan;
  plan.entered = 1;

  /* 0x0041651a..25 */
  const curEnd = rd32(u32(arenaAddr) + 4);
  plan.curEnd = curEnd >>> 0;
  const alignPad = (0 - plan.curEnd) & ANM2_XML_ALLOC_ALIGN_MASK;
  plan.alignPad = alignPad >>> 0;
  const alignedEnd = (plan.curEnd + plan.alignPad) >>> 0;
  plan.alignedEnd = alignedEnd;
  const reqEnd = (alignedEnd + u32(needed)) >>> 0;
  plan.reqEnd = reqEnd;
  plan.cap = rd32(u32(arenaAddr) + 8);

  const grow = reqEnd > plan.cap ? 1 : 0;   /* jbe @0x0041652b */
  plan.grow = grow;

  if (grow === 0) {
    plan.pureComplete = 1;
    plan.hostCallCount = 0;
    plan.newEnd = reqEnd;
    plan.retPtr = alignedEnd;
    return plan;
  }

  plan.pureComplete = 0;
  plan.hostCallCount = 1;
  plan.growBlocks =
    u32(needed) <= ANM2_XML_ALLOC_GROW_FLOOR
      ? ANM2_XML_ALLOC_GROW_FLOOR : u32(needed);
  plan.allocSize = (plan.growBlocks + ANM2_XML_ALLOC_HDR_SLACK) >>> 0;
  plan.customFn =
    rd32(u32(arenaAddr) + ANM2_XML_ALLOC_CUSTOM_FN_OFF);
  plan.useCustom = plan.customFn !== 0 ? 1 : 0;
  if (plan.useCustom === 0) {
    plan.oomStringVa = ANM2_XML_ALLOC_OOM_STRING_VA;
  }
  return plan;
}

/* ============ v87 unit: 0x004165a0 attrs-parser narrow pass =============
   One attribute iteration, report-only; allocator edge host-reported. */

export const ANM2_XML_ATTR_VA = 0x004165a0;
export const ANM2_XML_ATTR_END_VA = 0x00416769;
export const ANM2_XML_ATTR_BODY_BYTES = 0x1ca;
export const ANM2_XML_ATTR_CALLSITE_COUNT = 1;
export const ANM2_XML_ATTR_ADDR_TAKEN = 0;
export const ANM2_XML_ATTR_NAME_GATE_VA = 0xb1af60;
export const ANM2_XML_ATTR_SPACE_GATE_VA = 0xb1b060;
export const ANM2_XML_ATTR_ARENA_OFF = 0x30;
export const ANM2_XML_ATTR_NODE_SIZE = 0x1c;
export const ANM2_XML_ATTR_PARENT_FIRST_OFF = 0x20;
export const ANM2_XML_ATTR_PARENT_LAST_OFF = 0x24;
export const ANM2_XML_ATTR_EMPTY_STR_VA = 0xc71640;
export const ANM2_XML_ATTR_NO_NAME_VA = 0xb1b6c4;
export const ANM2_XML_ATTR_EXPECTED_EQ_VA = 0xb1b6dc;
export const ANM2_XML_ATTR_BAD_VALUE_VA = 0xb1b6e8;
export const ANM2_XML_ATTR_ALLOC_CALLEE_VA = 0x00416510;
export const ANM2_XML_ATTR_DECODE0_CALLEE_VA = 0x00416920;
export const ANM2_XML_ATTR_DECODE1_CALLEE_VA = 0x00416b70;

/** 0x004165a0 report-only plan (flat-image oracle). */
export function anm2XmlAttrPlan(
  mem, { docAddr, cursorSlotAddr, parentNodeAddr,
         nameGateTable, spaceGateTable }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, docAddr: u32(docAddr), cursorSlotAddr: u32(cursorSlotAddr),
    parentNodeAddr: u32(parentNodeAddr), scanIn: 0, nameEnd: 0,
    nameLen: 0, nodeAddr: 0, nameTermAddr: 0, parentFirst: 0,
    parentLastOld: 0, linkPrevValue: 0, linkNextAddr: 0, sawEquals: 0,
    missingEqVa: 0, quoteChar: 0, decodeSite: -1, valueStart: 0,
    valueLen: 0, valueTermAddr: 0, closingQuoteMatched: 0,
    badValueVa: 0, loopAgain: 0, pureComplete: 0, hostCallCount: 1,
  };
  if (docAddr === undefined || u32(docAddr) === 0 ||
      u32(cursorSlotAddr) === 0 || u32(parentNodeAddr) === 0 ||
      u32(nameGateTable) === 0 || u32(spaceGateTable) === 0) return plan;
  const esi = rd32(cursorSlotAddr);
  if (mem[u32(nameGateTable) + mem[esi]] === 0) return plan;  /* gate */
  plan.entered = 1;
  plan.scanIn = esi;

  let ecx = esi + 1;                          /* name skip from cur+1 */
  while (mem[u32(nameGateTable) + mem[ecx]] !== 0) ecx++;
  plan.nameEnd = ecx;
  plan.nameLen = ecx - esi;
  plan.nameTermAddr = (esi + plan.nameLen) >>> 0;

  const parentFirst = rd32(u32(parentNodeAddr) + ANM2_XML_ATTR_PARENT_FIRST_OFF);
  const parentLastOld = rd32(u32(parentNodeAddr) + ANM2_XML_ATTR_PARENT_LAST_OFF);
  plan.parentFirst = parentFirst;
  plan.parentLastOld = parentLastOld;
  plan.linkPrevValue = parentFirst !== 0 ? parentLastOld : 0;
  plan.linkNextAddr = parentFirst !== 0 ? (parentLastOld + 0x18) >>> 0 : 0;

  let cur = ecx; /* slot := ecx (0x004165ee..f0); report-only reuse */
  plan.sawEquals = mem[cur] === 0x3d ? 1 : 0;
  plan.missingEqVa = plan.sawEquals ? 0 : ANM2_XML_ATTR_EXPECTED_EQ_VA;
  cur += 1;

  while (mem[u32(spaceGateTable) + mem[cur]] !== 0) cur++;
  const q = mem[cur];
  plan.quoteChar = q;

  let valueStart;
  if (q === 0x27) {
    plan.decodeSite = 0;
    valueStart = cur + 1;
  } else {
    plan.decodeSite = 1;
    valueStart = cur + 1;
    if (q !== 0x22) plan.badValueVa = ANM2_XML_ATTR_BAD_VALUE_VA;
  }
  plan.valueStart = valueStart;

  {
    const cls = q === 0x27 ? 0xb1ac60 : 0xb1ab60;
    let p = valueStart;
    while (p < mem.length && mem[cls + mem[p]] !== 0) p++;
    plan.valueLen = p - valueStart;
  }
  plan.valueTermAddr = (valueStart + plan.valueLen) >>> 0;

  plan.closingQuoteMatched =
    mem[valueStart + plan.valueLen] === q ? 1 : 0;
  if (!plan.closingQuoteMatched && !plan.badValueVa && q !== 0x22) {
    plan.badValueVa = ANM2_XML_ATTR_BAD_VALUE_VA;
  }

  let tail = valueStart + plan.valueLen + (plan.closingQuoteMatched ? 1 : 0);
  while (tail < mem.length && mem[u32(spaceGateTable) + mem[tail]] !== 0) tail++;
  plan.loopAgain = mem[u32(nameGateTable) + mem[tail]] !== 0 ? 1 : 0;
  return plan;
}
export const ANM2_ACC_U32_GET_COUNT = 8;
export const ANM2_ACC_F32_GET_COUNT = 4;
export const ANM2_ACC_PAIR_GET_COUNT = 3;


/* Byte-exact PE enumeration (band 0x417000..0x41a000). */
export const ANM2_ACC_U32_SITES = [
  { va: 0x00417260, offset: 0x28 },
  { va: 0x00417270, offset: 0x2c },
  { va: 0x00417280, offset: 0x30 },
  { va: 0x00417710, offset: 0xc },
  { va: 0x00417380, offset: 0x188 },
  { va: 0x00417490, offset: 0x330 },
  { va: 0x004174a0, offset: 0x3c8 },
  { va: 0x00417860, offset: 0x1e68 },
];

export const ANM2_ACC_F32_SITES = [
  { va: 0x00417210, offset: 0xa4 },
  { va: 0x00417330, offset: 0xec },
  { va: 0x00417360, offset: 0x384 },
  { va: 0x00417370, offset: 0x380 },
];

export const ANM2_ACC_PAIR_SITES = [
  { va: 0x00417290, offset0: 0x33c, offset1: 0x340 },
  { va: 0x004172b0, offset0: 0x38c, offset1: 0x390 },
  { va: 0x004172d0, offset0: 0x360, offset1: 0x364 },
];

/** T1: mov eax,[ecx+off]; ret */
export function anm2U32FieldGet(mem, { thisAddr, off }) {
  if (u32(thisAddr) === 0) return 0;
  const a = u32(thisAddr) + u32(off);
  return (mem[a] | (mem[a + 1] << 8) | (mem[a + 2] << 16) |
          (mem[a + 3] << 24)) >>> 0;
}

/** T2: fld dword [ecx+off]; ret -- raw bits, never rounded. */
export function anm2F32FieldGetBits(mem, { thisAddr, off }) {
  if (u32(thisAddr) === 0) return 0;
  const a = u32(thisAddr) + u32(off);
  return (mem[a] | (mem[a + 1] << 8) | (mem[a + 2] << 16) |
          (mem[a + 3] << 24)) >>> 0;
}

/** T3: pair copy-out, report-only. */
export function anm2PairFieldGetPlan(mem, { thisAddr, off }) {
  const rd32 = (a) =>
    (mem[u32(a)] | (mem[u32(a) + 1] << 8) | (mem[u32(a) + 2] << 16) |
     (mem[u32(a) + 3] << 24)) >>> 0;
  const plan = {
    entered: 0, thisAddr: u32(thisAddr), off: u32(off),
    lo: 0, hi: 0, pureComplete: 1, hostCallCount: 0,
  };
  if (thisAddr === undefined || u32(thisAddr) === 0) return plan;
  plan.entered = 1;
  plan.lo = rd32(u32(thisAddr) + u32(off));
  plan.hi = rd32(u32(thisAddr) + u32(off) + 4);
  return plan;
}

