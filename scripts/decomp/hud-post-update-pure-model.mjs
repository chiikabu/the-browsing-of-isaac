/** Independent JS oracle for HUD::PostUpdate pure shells.
 *  Restored lockstep with the C++ family (v1–v16) plus v17 0x00771550
 *  narrowed gates, v18 per-slot flag loop (0x009a2b83..0x009a2baa),
 *  v19 count resolver (0x007cb6e0) and v20 0x008318a0 shared signed-
 *  advance + Game+0x22ed0 rewrite + common f32-ratio tail.
 *  Do not derive from the C++: gates follow the PE (v15 ladder 0x007707de,
 *  v16 resolver 0x007db8d0, v17 0x00771550, v18 slot loop, v19 0x007cb6e0,
 *  v20 0x008318a0). */

export const HUD_POST_UPDATE_PURE_ABI_VERSION = 39; /* v39: span-B recorded-residual laws (hud-v39-frontier) */

export const HUD_PLAYER_HUD_COUNT = 8;
export const STAT_HUD_COUNTDOWN_PER_GROUP = 10;
export const STAT_HUD_COUNTDOWN_GROUPS = 2;
export const STAT_HUD_COUNTDOWN_INNER_STRIDE_DWORDS = 5;
export const STAT_HUD_COUNTDOWN_GROUP_STRIDE_DWORDS = 0x33;
export const STAT_HUD_COLLECTIBLE_ID = 0x1f2;
export const STAT_HUD_OWNER_LAZ_SHARED_TAG = 1;
export const STAT_HUD_PLAYER_LIST_GAME_OFFSET = 0x1baa8;
export const STAT_HUD_OWNER_FLAG_OFFSET = 0x2ac;
export const STAT_HUD_RECOMPUTE_FLAGS = 0xfffffeff >>> 0;

export const HISTORY_HUD_SLOT_COUNT = 2;
export const HISTORY_HUD_SLOT_STRIDE = 0x14;
export const HISTORY_HUD_SLOT0_FLAG_OFFSET = 0x5c58;
export const HISTORY_HUD_SLOT_LOOP_VA_HEAD = 0x009a2b83;
export const HISTORY_HUD_SLOT_LOOP_VA_FLAG_GATE = 0x009a2b90;
export const HISTORY_HUD_SLOT_LOOP_VA_RECOMPUTE = 0x009a2b9e;
export const HISTORY_HUD_SLOT_LOOP_VA_SKIP = 0x009a2ba3;
export const HISTORY_HUD_SLOT_LOOP_VA_LOOP_BACK = 0x009a2ba7;
export const HISTORY_HUD_SLOT_LOOP_IMMEDIATE = 1;
export const HISTORY_HUD_SLOT_LOOP_RECOMPUTE_HOST = 0x0083b280;
export const HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET = 0x8;
export const HISTORY_HUD_REVERSE_WALK_START_CURSOR = 2;
export const HISTORY_HUD_REVERSE_WALK_START_OFFSET = 0x14;
export const HISTORY_HUD_TWIN_PTR_OFFSET = 0x1e6c;
export const HISTORY_HUD_CHARACTER_TYPE_OFFSET = 0x13c0;
export const HISTORY_HUD_TWIN_CHAR_A = 0x1d;
export const HISTORY_HUD_TWIN_CHAR_B = 0x26;
export const HISTORY_HUD_LIST_ELEM_STRIDE = 0x28;
export const HISTORY_HUD_PLAYER_LIST_GAME_OFFSET = 0x1baa8;
export const HISTORY_GET_PLAYER_IDX_NETPLAY_EMBED_OFF = 0x4b3d8;
export const HISTORY_GET_PLAYER_IDX_PLAYER_NET_IDX_OFF = 0x1618;
export const HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_2C_OFF = 0x2c;
export const HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_3BC_OFF = 0x3bc;
export const HISTORY_GET_PLAYER_IDX_PLAYER_CHAR_TYPE_OFF = 0x13c0;
export const HISTORY_GET_PLAYER_IDX_REJECT_CHAR = 0x28;
export const HISTORY_HUD_LIST_NODE_SUB_OFF = 0x8;
export const HISTORY_HUD_LIST_NODE_CALLBACK_ARG_OFF = 0x4;
export const HISTORY_HUD_LIST_VTABLE_RELEASE_ENTRY = 0xc;
export const HISTORY_HUD_LIST_CALLBACK_GLOBAL = 0xc7163c;
export const HISTORY_HUD_FREE_LARGE_GATE = 0x1000;
export const HISTORY_HUD_FREE_HEADER_SIZE = 0x23;
export const HISTORY_HUD_FREE_HEADER_OFFSET_BOUND = 0x1f;

export const HUD_HOST_VA_INVALID_PARAMETER = 0x0083bba5;
export const HUD_HOST_VA_HISTORY_RECOMPUTE = 0x0083b280;
export const HUD_HOST_VA_HISTORY_RECOMPUTE_ALL = 0x0083b850;
export const HUD_HOST_VA_HISTORY_GET_PLAYER_IDX = 0x0083bbc0;
export const HUD_HOST_VA_FIRST_COLLECTIBLE_OWNER = 0x009be080;
export const HUD_HOST_VA_STAT_GET_PLAYER_ID = 0x0084bf30;
export const HUD_HOST_VA_STAT_RECOMPUTE_STATS = 0x0084ca00;
export const HUD_HOST_VA_STAT_POST_UPDATE = 0x0084c170;
export const HUD_HOST_VA_FATAL_LOG = 0x00a112c0;
export const HUD_HOST_VA_CRT_FREE = 0x00aef15c;
export const HUD_HOST_VA_NETPLAY_IS_IDX_LOCAL = 0x0090b100;
export const HUD_HOST_VA_GET_COLLECTIBLE = 0x0072fd10;
export const HUD_HOST_VA_HAS_COLLECTIBLE = 0x007706e0;
export const HUD_HOST_VA_GAME_GET_PLAYER = 0x00417870;
export const HUD_HOST_VA_HAS_TRINKET = 0x009e04b0;

export const HUD_GATE_92F1C0_HOST_VA = 0x0092f1c0;
export const HUD_GATE_92F1C0_JUMP_TABLE_VA = 0x0092ffa4;
export const HUD_GATE_92F1C0_TAIL_VA = 0x0092ff60;
export const HUD_GATE_92F1C0_CASE_VAS = [0x0092f203, 0x0092fa09, 0x0092fe88, 0x0092fed2];
export const HUD_GATE_92F1C0_COUNTER_OFF = 4;
export const HUD_GATE_92F1C0_MODE_MAX = 4;
export const HUD_GATE_92F1C0_GAME_FIELD_A = 0x22ed4;
export const HUD_GATE_92F1C0_GAME_FIELD_B = 0x22edc;
export const HUD_GATE_92F1C0_TAIL_STORE_VALUE = 2;

export const HISTORY_HUD_WALK_START_INDEX = 0;
export const HISTORY_HUD_WALK_PLAYER_STRIDE = 4;
export const HISTORY_HUD_WALK_FATAL_STRING_VA = 0x00b7e6bc;
export const HISTORY_HUD_WALK_FATAL_ARG = 0x10;
export const HISTORY_HUD_WALK_VA_START = 0x0083bad7;
export const HISTORY_HUD_WALK_VA_ENTRY_GATE = 0x0083baed;
export const HISTORY_HUD_WALK_VA_FATAL = 0x0083bb0d;
export const HISTORY_HUD_WALK_VA_SELECT = 0x0083bb1a;
export const HISTORY_HUD_WALK_VA_GET_PLAYER_IDX = 0x0083bb2d;
export const HISTORY_HUD_WALK_VA_RECOMPUTE = 0x0083bb36;
export const HISTORY_HUD_WALK_VA_TWIN_GET_PLAYER_IDX = 0x0083bb59;
export const HISTORY_HUD_WALK_VA_TWIN_MARK = 0x0083bb6f;
export const HISTORY_HUD_WALK_VA_LOOP_BACK = 0x0083bb88;
export const HISTORY_HUD_WALK_VA_EXIT = 0x0083bb91;

export const NETPLAY_IS_IDX_LOCAL_PLAYER_FIELD_C_OFF = 0xc;
export const NETPLAY_IS_IDX_LOCAL_PLAYER_VTABLE_OFF = 0x370;
export const NETPLAY_IS_IDX_LOCAL_VTABLE_ENTRY_OFF = 0x14;
export const ENTITY_PLAYER_IS_HOLOGRAM_FLAG_OFF = 0x172;
export const ENTITY_PLAYER_TWIN_PTR_OFF = 0x1e68;
export const ENTITY_PLAYER_NET_IDX_OFF = 0x161c;
export const STAT_HUD_GET_PLAYER_ID_SLOT_BASE_OFF = 0x114;
export const STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE = 0xcc;
export const STAT_HUD_GET_PLAYER_ID_SLOT_COUNT = 2;

export const HISTORY_HUD_ELIMINATION_START_CURSOR = 2;
export const HISTORY_HUD_ELIMINATION_SLOT_STRIDE = 0x14;
export const HISTORY_HUD_ELIMINATION_VA_HEAD = 0x0083b890;
export const HISTORY_HUD_ELIMINATION_VA_GET_PLAYER_IDX = 0x0083b89d;
export const HISTORY_HUD_ELIMINATION_VA_CLEAR = 0x0083b8aa;
export const HISTORY_HUD_ELIMINATION_VA_COMPACT_GATE = 0x0083b8b3;
export const HISTORY_HUD_ELIMINATION_VA_STEP = 0x0083bac4;
export const HISTORY_HUD_ELIMINATION_VA_LOOP_BACK = 0x0083bace;

export const ITEM_CONFIG_TRINKET_BEGIN_OFF = 0x67758;
export const ITEM_CONFIG_TRINKET_END_OFF = 0x6775c;
export const ITEM_CONFIG_GAME_GLOBAL = 0xc71678;
export const FCO_ITEM_CONFIG_OFF = 0x2a404;
export const FCO_ITEM_FLAGS_OFF = 0xb8;
export const FCO_TWIN_BIT = 0x80000000 >>> 0;
export const FCO_PLAYER_FIELD_2C_OFF = 0x2c;
export const FCO_TWIN_PTR_OFF = 0x1e6c;
export const ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL = 0;
export const ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE = 1;
export const ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET = 2;

export const HAS_COLLECTIBLE_PLAYER_FIELD_2C_OFF = 0x2c;
export const HAS_COLLECTIBLE_PARENT_PTR_OFF = 0x3bc;
export const HAS_COLLECTIBLE_QUEST_HIDE_OFF = 0x20a9;
export const HAS_COLLECTIBLE_HELD_ID_OFF = 0x2ef4;
export const HAS_COLLECTIBLE_COUNT_TABLE_OFF = 0x16c8;
export const HAS_COLLECTIBLE_QUEST_BIT = 0x8000;

function i32(x) { return x | 0; }
function u32(x) { return x >>> 0; }
function b(x) { return !!x; }

export function hudPlayerHudOccupiedMask(ptrs) {
  let mask = 0;
  if (!ptrs) return 0;
  for (let i = 0; i < HUD_PLAYER_HUD_COUNT; i++) {
    if (u32(ptrs[i]) !== 0) mask |= (1 << i);
  }
  return mask;
}
export function hudHistoryBlockNeeded(count) { return i32(count) > 0; }
export function hudHistoryRecomputeAllNeeded(flag) { return (u32(flag) & 0xff) === 0; }
export function hudHistoryFlagSet(_v) { return 1; }
export function hudHistorySlotRecomputeNeeded(flag) { return (u32(flag) & 0xff) !== 0; }
export function hudHistorySlotLoopFlagAddr(hudPtr, slotIndex) {
  /* 0x009a2b85 lea edi,[ebx+0x5c58]; 0x009a2ba4 add edi,0x14 per step. */
  return u32(u32(hudPtr) + HISTORY_HUD_SLOT0_FLAG_OFFSET +
             u32(slotIndex) * HISTORY_HUD_SLOT_STRIDE);
}
export function hudHistorySlotLoopContinue(nextIndex) {
  /* 0x009a2ba7 cmp esi,2; 0x009a2baa jl — SIGNED (i+1) < 2 re-enters. */
  return i32(nextIndex) < 2 ? 1 : 0;
}
export function hudHistorySlotLoopPlan({ slot0Flag = 0, slot1Flag = 0 } = {}) {
  const s0 = hudHistorySlotRecomputeNeeded(slot0Flag) ? 1 : 0;
  const s1 = hudHistorySlotRecomputeNeeded(slot1Flag) ? 1 : 0;
  return {
    slot0Recompute: s0,
    slot1Recompute: s1,
    hostEdgeCount: s0 + s1,
    pureComplete: (s0 === 0 && s1 === 0) ? 1 : 0,
  };
}
export function statHudPostUpdateNeeded(flag) { return (u32(flag) & 0xff) !== 0; }
export function tryHudPostUpdatePure({
  playerHudOccupiedMask = 0, managerHistoryCount = 0, managerStatFlag = 0,
} = {}) {
  if ((u32(playerHudOccupiedMask) & 0xff) !== 0) return { hostRequired: true };
  if (i32(managerHistoryCount) > 0) return { hostRequired: true };
  if ((u32(managerStatFlag) & 0xff) !== 0) return { hostRequired: true };
  return { hostRequired: false };
}
export function hudPostUpdateSnapshotSafe(mask) { return (u32(mask) & 0xff) === 0; }

function tickGroup(counters) {
  const out = counters.slice();
  for (let i = 0; i < out.length; i++) if (i32(out[i]) > 0) out[i] = i32(out[i]) - 1;
  return out;
}
export function statHudCountdownTick(state) {
  return { group0: tickGroup(state.group0), group1: tickGroup(state.group1) };
}
export function statHudCountdownTickAt(mem, pad) {
  const inner = STAT_HUD_COUNTDOWN_INNER_STRIDE_DWORDS;
  const group = STAT_HUD_COUNTDOWN_GROUP_STRIDE_DWORDS;
  for (let g = 0; g < STAT_HUD_COUNTDOWN_GROUPS; g++) {
    for (let i = 0; i < STAT_HUD_COUNTDOWN_PER_GROUP; i++) {
      const idx = pad + g * group + (i - 1) * inner;
      if (i32(mem[idx]) > 0) mem[idx] = i32(mem[idx]) - 1;
    }
  }
  return mem;
}

export function tryHistoryHudRecomputePure({ idx = 0, immediate = 0, playerPtr = 0 } = {}) {
  if (u32(idx) > 1) return { hostRequired: false };
  if (u32(playerPtr) === 0) return { hostRequired: false };
  if ((u32(immediate) & 0xff) === 0) return { hostRequired: false, dirty: 1 };
  return { hostRequired: true };
}
export function historyHudSlotDirtySet(_v) { return 1; }
export function tryHistoryHudRecomputeAllPure({
  slot0Player = 0, slot1Player = 0, playerCount = 0,
} = {}) {
  if (u32(slot0Player) === 0 && u32(slot1Player) === 0 && i32(playerCount) === 0) {
    return { hostRequired: false };
  }
  return { hostRequired: true };
}
export function historyHudReverseWalkStep(cursor, offset) {
  const nextCursor = i32(cursor) - 1;
  const nextOff = u32(u32(offset) - HISTORY_HUD_SLOT_STRIDE);
  return { cursor: nextCursor, offset: nextOff, continue: nextCursor >= 1 };
}
export function historyHudPlayerIdxInvalid(idx) { return i32(idx) < 0; }
export function historyHudSlotCompactNeeded(cursor) { return u32(cursor) < 2; }
export function historyHudSlotCompactTripleMoveNeeded(dst, src) {
  return u32(dst) !== u32(src);
}
export function historyHudSlotCompactLoopContinue(cursorAfterInc) {
  return i32(cursorAfterInc) < 2;
}
export function historyHudSlotCompactSwap(dst, src) {
  return {
    dst: { ...src },
    src: { ...dst },
    dstOldList: { listBegin: dst.listBegin, listEnd: dst.listEnd, listCap: dst.listCap },
  };
}
export function historyHudTwinCharEligible(t) {
  const x = i32(t);
  return x === HISTORY_HUD_TWIN_CHAR_A || x === HISTORY_HUD_TWIN_CHAR_B;
}
export function historyHudTwinDirtyNeeded({
  twinPtr = 0, characterType = 0, twinIdx = 0, slotPlayerAtTwinIdx = 0,
} = {}) {
  if (u32(twinPtr) === 0) return false;
  if (!historyHudTwinCharEligible(characterType)) return false;
  if (u32(twinIdx) > 1) return false;
  return u32(slotPlayerAtTwinIdx) !== 0;
}
export function historyHudListByteSize(begin, end) {
  const diff = i32(u32(end) - u32(begin));
  if (diff <= 0) return 0;
  const n = Math.trunc(u32(diff) / HISTORY_HUD_LIST_ELEM_STRIDE);
  return u32(n * HISTORY_HUD_LIST_ELEM_STRIDE);
}
export function historyHudListFreeNeeded(begin) { return u32(begin) !== 0; }

export function historyHudGetPlayerIdxNetplayRangeEmpty(b, e) { return u32(b) === u32(e); }
export function historyHudGetPlayerIdxPlayerEligible({ field2c = 0, field3bc = 0, charType = 0 } = {}) {
  if (u32(field2c) !== 0) return false;
  if (u32(field3bc) !== 0) return false;
  return i32(charType) !== HISTORY_GET_PLAYER_IDX_REJECT_CHAR;
}
export function historyHudGetPlayerIdxResolve({
  slot0Player = 0, slot1Player = 0, playerPtr = 0,
} = {}) {
  const slots = [u32(slot0Player), u32(slot1Player)];
  const p = u32(playerPtr);
  let empty = -1;
  for (let i = 0; i < 2; i++) {
    if (slots[i] === p) return { idx: i, slot0: slots[0], slot1: slots[1], assigned: false };
    if (slots[i] === 0 && empty < 0) empty = i;
  }
  if (empty < 0) return { idx: -1, slot0: slots[0], slot1: slots[1], assigned: false };
  if (empty === 0) return { idx: 0, slot0: p, slot1: slots[1], assigned: true };
  return { idx: 1, slot0: slots[0], slot1: p, assigned: true };
}
export function tryHistoryHudGetPlayerIdxPure({
  netplayBegin = 0, netplayEnd = 0, netplayLocalKnown = -1,
  field2c = 0, field3bc = 0, charType = 0,
  slot0Player = 0, slot1Player = 0, playerPtr = 0,
} = {}) {
  if (!historyHudGetPlayerIdxNetplayRangeEmpty(netplayBegin, netplayEnd)) {
    if (i32(netplayLocalKnown) < 0) return { hostRequired: true };
    if (i32(netplayLocalKnown) === 0) {
      return { hostRequired: false, idx: -1, slot0: u32(slot0Player), slot1: u32(slot1Player), assigned: false };
    }
  }
  if (!historyHudGetPlayerIdxPlayerEligible({ field2c, field3bc, charType })) {
    return { hostRequired: false, idx: -1, slot0: u32(slot0Player), slot1: u32(slot1Player), assigned: false };
  }
  const r = historyHudGetPlayerIdxResolve({ slot0Player, slot1Player, playerPtr });
  return { hostRequired: false, ...r };
}

export function historyHudListTeardownNeeded(begin) { return u32(begin) !== 0; }
export function historyHudListWalkNeeded(begin, end) { return u32(begin) !== u32(end); }
export function historyHudListWalkCount(begin, end) {
  const span = i32(u32(end) - u32(begin));
  if (span < 0 || (span % HISTORY_HUD_LIST_ELEM_STRIDE) !== 0) return -1;
  return (span / HISTORY_HUD_LIST_ELEM_STRIDE) | 0;
}
export function historyHudListWalkContinue(next, end) { return u32(next) !== u32(end); }
export function historyHudListTeardownNodeReleaseNeeded(sub) { return u32(sub) !== 0; }
export function historyHudListTeardownCallbackNeeded(g) { return u32(g) !== 0; }
export function historyHudListTeardownFreeSize(begin, cap) {
  const span = i32(u32(cap) - u32(begin));
  const prod = BigInt(span) * 0x66666667n;
  let hi = Number((prod >> 32n) & 0xffffffffn);
  if (hi >= 0x80000000) hi -= 0x100000000;
  hi = i32(hi) >> 4;
  const rounded = i32(hi + (u32(hi) >>> 31));
  return i32(u32(rounded) * 40);
}
export function historyHudListTeardownLargeGate(size) { return u32(size) >= HISTORY_HUD_FREE_LARGE_GATE; }
export function historyHudListTeardownHeaderResolve(header, begin, freeSize) {
  const delta = u32(u32(begin) - u32(header) - 4);
  const invalid = delta > HISTORY_HUD_FREE_HEADER_OFFSET_BOUND;
  return {
    invalid,
    freePtr: u32(header),
    freeSizeArg: i32(u32(freeSize) + HISTORY_HUD_FREE_HEADER_SIZE),
  };
}
export function historyHudListTeardownPlan({
  listBegin = 0, listEnd = 0, listCap = 0, headerKnown = 0, header = 0,
} = {}) {
  const teardown = historyHudListTeardownNeeded(listBegin);
  const walk = historyHudListWalkNeeded(listBegin, listEnd);
  const count = historyHudListWalkCount(listBegin, listEnd);
  const unbounded = count < 0;
  const freeSize = historyHudListTeardownFreeSize(listBegin, listCap);
  const large = historyHudListTeardownLargeGate(freeSize);
  const out = {
    teardownNeeded: b(teardown), walkNeeded: b(walk), walkCount: count,
    unbounded, hostNodeEdges: (teardown && walk && !unbounded) ? count : 0,
    freeSize, largeGate: b(large), invalidParameterNeeded: false,
    freePtr: 0, freeSizeArg: 0, hostFreeNeeded: false, freeMonolithic: false,
  };
  if (!teardown) return out;
  if (unbounded) {
    out.hostFreeNeeded = true; out.freeMonolithic = true; return out;
  }
  if (!large) {
    out.freePtr = u32(listBegin); out.freeSizeArg = freeSize;
    out.hostFreeNeeded = true; return out;
  }
  if (!headerKnown) {
    out.hostFreeNeeded = true; out.freeMonolithic = true; return out;
  }
  const hr = historyHudListTeardownHeaderResolve(header, listBegin, freeSize);
  if (hr.invalid) { out.invalidParameterNeeded = true; return out; }
  out.freePtr = hr.freePtr; out.freeSizeArg = hr.freeSizeArg;
  out.hostFreeNeeded = true; return out;
}
export function historyHudSlotCompactTeardownOrder({
  srcBeginAddr = 0, tempAddr = 0, srcBeginAfterMove2 = 0, tempBegin = 0,
} = {}) {
  const siteA = u32(srcBeginAfterMove2) !== 0;
  const siteB = u32(srcBeginAddr) === u32(tempAddr) && u32(tempBegin) !== 0;
  return { siteANeeded: b(siteA), siteBNeeded: b(siteB), anyTeardownNeeded: b(siteA || siteB) };
}

export function statHudApplyOwnerFlag(ptr) { return u32(ptr) !== 0 ? 1 : 0; }
export function statHudPlayerVectorCount(b, e) { return i32(u32(e) - u32(b)) >> 2; }
export function statHudPlayerWalkNeeded(c) { return i32(c) !== 0; }
export function statHudPlayerSlotAddr(begin, idx, count) {
  return u32(idx) < u32(i32(count)) ? u32(u32(begin) + u32(idx) * 4) : u32(begin);
}
export function statHudWalkIndexSelect(index, count) {
  return u32(index) < u32(i32(count)) ? i32(index) : 0;
}
export function statHudWalkNeedsEmptyFatal(c) { return i32(c) === 0; }
export function statHudWalkContinue(next, count) { return u32(next) < u32(i32(count)); }
export function statHudRecomputeCountArg(c) { return i32(c); }
export function statHudOwnerFlagValue(p) { return u32(p) !== 0 ? 1 : 0; }
export function statHudTailHostCallCount(needed, iterations) {
  if (!needed) return 0;
  const n = i32(iterations) > 0 ? i32(iterations) : 0;
  return 1 + 2 * n;
}
export function statHudTailPureComplete(flag) { return !statHudPostUpdateNeeded(flag); }
export function statHudTailPlan({
  managerStatFlag = 0, listBegin = 0, listEnd = 0, ownerSample = 0, ownerKnown = 0,
} = {}) {
  const tailNeeded = statHudPostUpdateNeeded(managerStatFlag);
  if (!tailNeeded) {
    return {
      tailNeeded: false, pureComplete: true, fcoHostNeeded: false, ownerFlag: 0,
      ownerFlagKnown: false, playerCount: 0, walkIterations: 0, hostCallCount: 0,
      emptyFatalNeeded: false, countdownApplied: false,
    };
  }
  const count = statHudPlayerVectorCount(listBegin, listEnd);
  const torn = count < 0;
  const iterations = torn ? 0 : (count > 0 ? count : 0);
  return {
    tailNeeded: true, pureComplete: false, fcoHostNeeded: true,
    ownerFlag: ownerKnown ? statHudOwnerFlagValue(ownerSample) : 0,
    ownerFlagKnown: !!ownerKnown, playerCount: count,
    walkIterations: iterations,
    hostCallCount: statHudTailHostCallCount(true, iterations),
    emptyFatalNeeded: torn, countdownApplied: true,
  };
}

export function hudGate92f1c0DispatchCase(mode) {
  const m = u32(mode);
  if (u32(m - 1) > 3) return -1;
  return i32(m - 1);
}
export function hudGate92f1c0CaseVa(c) {
  if (i32(c) < 0 || i32(c) > 3) return 0;
  return HUD_GATE_92F1C0_CASE_VAS[c];
}
export function hudGate92f1c0BodyHostNeeded(mode) { return hudGate92f1c0DispatchCase(mode) >= 0; }
export function hudGate92f1c0TryPure(mode) { return !hudGate92f1c0BodyHostNeeded(mode); }
export function hudGate92f1c0CounterNext(c) { return (i32(c) + 1) | 0; }
export function hudGate92f1c0TailStoresNeeded(modeAfter) {
  const m = u32(modeAfter);
  return m === 2 || m === 3;
}
export function hudGate92f1c0Plan({ mode = 0, modeAfterBody = 0, counter = 0 } = {}) {
  const dc = hudGate92f1c0DispatchCase(mode);
  const host = dc >= 0;
  return {
    dispatchCase: dc,
    bodyHostNeeded: host,
    pureComplete: !host,
    counterOut: hudGate92f1c0CounterNext(counter),
    tailStoresNeeded: hudGate92f1c0TailStoresNeeded(modeAfterBody),
    caseVa: hudGate92f1c0CaseVa(dc),
  };
}

export function historyHudRecomputeWalkEntryNeeded(c) { return i32(c) !== 0; }
export function historyHudRecomputeWalkPlayerCount(b, e) { return statHudPlayerVectorCount(b, e); }
export function historyHudRecomputeWalkSelectAddr(b, i, c) { return statHudPlayerSlotAddr(b, i, c); }
export function historyHudRecomputeWalkFatalNeeded(c) { return i32(c) === 0; }
export function historyHudRecomputeWalkContinue(n, c) { return u32(n) < u32(i32(c)); }
export function historyHudRecomputeWalkPlan({ listBegin = 0, listEnd = 0 } = {}) {
  const count = historyHudRecomputeWalkPlayerCount(listBegin, listEnd);
  const walk = count !== 0;
  const monolithic = count < 0;
  const iterations = walk && !monolithic ? count : 0;
  return {
    walkNeeded: walk, playerCount: count, pureComplete: count === 0,
    monolithic, iterations, hostEdgeBudget: iterations * 3, fatalReachable: false,
  };
}
export function historyHudRecomputeWalkNodePlan(args = {}) {
  const hudPtr = u32(args.hudPtr);
  const idx = u32(args.idx);
  const playerCount = i32(args.playerCount);
  const immediate = u32(args.immediate);
  const netplayBegin = u32(args.netplayBegin);
  const netplayEnd = u32(args.netplayEnd);
  const netplayLocalKnown = i32(args.netplayLocalKnown);
  const playerPtr = u32(args.playerPtr);
  const idxForRecompute = i32(args.idxIn ?? args.idxForRecompute);
  const twinPtr = u32(args.twinPtr);
  const twinCharacterType = i32(args.twinCharacterType);
  const twinIdxResult = i32(args.twinIdxResult);
  const slot0Player = u32(args.slot0Player);
  const slot1Player = u32(args.slot1Player);
  const netplayHost = (netplayBegin !== netplayEnd) && netplayLocalKnown < 0;
  const recomputeBody = (u32(idxForRecompute) <= 1 && playerPtr !== 0 && (immediate & 0xff) !== 0);
  const recomputePureDirty = (u32(idxForRecompute) <= 1 && playerPtr !== 0 && (immediate & 0xff) === 0);
  const twinEligible = twinPtr !== 0 && historyHudTwinCharEligible(twinCharacterType);
  const twinIdx = u32(twinIdxResult);
  const twinSlotPlayer = twinIdx === 0 ? slot0Player : (twinIdx === 1 ? slot1Player : 0);
  const twinDirty = twinEligible && twinIdx <= 1 && twinSlotPlayer !== 0;
  return {
    iteration: idx,
    playerAddr: historyHudRecomputeWalkSelectAddr(args.listBegin, idx, playerCount),
    idxForRecompute: u32(idxForRecompute),
    getPlayerIdxHost: netplayHost,
    recomputeDirty: recomputePureDirty,
    recomputePureDirty: recomputePureDirty ? 1 : 0,
    recomputeHost: recomputeBody,
    recomputeDirtyAddr: recomputePureDirty ? u32(hudPtr + u32(idxForRecompute) * 0x14 + 4) : 0,
    twinPresent: twinEligible,
    twinGetPlayerIdxHost: twinEligible && netplayHost,
    twinDirty,
    twinDirtySlotAddr: twinDirty ? u32(hudPtr + twinIdx * 0x14 + 4) : 0,
  };
}
export function historyHudRecomputeWalkVaGetPlayerIdx() { return HISTORY_HUD_WALK_VA_GET_PLAYER_IDX; }
export function historyHudRecomputeWalkVaRecompute() { return HISTORY_HUD_WALK_VA_RECOMPUTE; }
export function historyHudRecomputeWalkVaTwinGetPlayerIdx() { return HISTORY_HUD_WALK_VA_TWIN_GET_PLAYER_IDX; }
export function historyHudRecomputeWalkVaFatal() { return HISTORY_HUD_WALK_VA_FATAL; }
export function historyHudRecomputeWalkVaMark() { return HISTORY_HUD_WALK_VA_TWIN_MARK; }
export function historyHudRecomputeWalkFatalString() { return HISTORY_HUD_WALK_FATAL_STRING_VA; }
export function historyHudRecomputeWalkFatalArg() { return HISTORY_HUD_WALK_FATAL_ARG; }

export function netplayIsIdxLocalPlayerCount(b, e) { return statHudPlayerVectorCount(b, e); }
export function netplayIsIdxLocalPlayerEmpty(c) { return i32(c) === 0; }
export function netplayIsIdxLocalPlayerMatch(fieldC, idx) { return u32(fieldC) === u32(idx); }
export function netplayIsIdxLocalPlayerContinue(next, c) { return u32(next) < u32(i32(c)); }
export function netplayIsIdxLocalPlayerPlan({ listBegin = 0, listEnd = 0, matchIndex = -1 } = {}) {
  const count = netplayIsIdxLocalPlayerCount(listBegin, listEnd);
  const empty = netplayIsIdxLocalPlayerEmpty(count);
  const monolithic = count < 0;
  const match = (!monolithic && i32(matchIndex) >= 0) ? i32(matchIndex) : -1;
  const host = match >= 0 && !monolithic;
  const pure = empty || (!monolithic && match < 0);
  return {
    count, empty, monolithic, matchIndex: match,
    matchPlayerAddr: match >= 0 ? u32(u32(listBegin) + u32(match) * 4) : 0,
    hostVirtualNeeded: host, pureComplete: pure,
    pureResult: pure ? 1 : 0, resultKnown: pure,
  };
}
export function netplayIsIdxLocalPlayerFieldCOff() { return NETPLAY_IS_IDX_LOCAL_PLAYER_FIELD_C_OFF; }
export function netplayIsIdxLocalPlayerVtableOff() { return NETPLAY_IS_IDX_LOCAL_PLAYER_VTABLE_OFF; }
export function netplayIsIdxLocalPlayerVtableEntryOff() { return NETPLAY_IS_IDX_LOCAL_VTABLE_ENTRY_OFF; }

export function entityPlayerIsHologramPure({
  hologramFlag172 = 0, characterType = 0, twinPtr = 0, twinNetIdx = 0, ownNetIdx = 0, selfPtr = 0,
} = {}) {
  if ((u32(hologramFlag172) & 0xff) === 0) return false;
  const t = i32(characterType);
  if (t !== HISTORY_HUD_TWIN_CHAR_A && t !== HISTORY_HUD_TWIN_CHAR_B) return false;
  if (u32(twinPtr) === 0) return false;
  if (i32(twinNetIdx) === -1) return false;
  if (i32(twinNetIdx) >= i32(ownNetIdx)) return false;
  if (u32(twinPtr) === u32(selfPtr)) return false;
  return true;
}
export function entityPlayerIsHologramFlagOff() { return ENTITY_PLAYER_IS_HOLOGRAM_FLAG_OFF; }
export function entityPlayerTwinPtrOff() { return ENTITY_PLAYER_TWIN_PTR_OFF; }
export function entityPlayerNetIdxOff() { return ENTITY_PLAYER_NET_IDX_OFF; }

export function statHudGetPlayerIdSlotAddr(base, i) {
  return u32(u32(base) + u32(i) * STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE);
}
export function statHudGetPlayerIdSlotBaseOff() { return STAT_HUD_GET_PLAYER_ID_SLOT_BASE_OFF; }
export function statHudGetPlayerIdSlotStride() { return STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE; }
export function statHudGetPlayerIdSlotCount() { return STAT_HUD_GET_PLAYER_ID_SLOT_COUNT; }
export function tryStatHudGetPlayerIdPure(args = {}) {
  const netplayBegin = args.netplayBegin ?? 0;
  const netplayEnd = args.netplayEnd ?? 0;
  const netplayLocalKnown = args.netplayLocalKnown ?? -1;
  const f2c = args.playerField2c ?? args.field2c ?? 0;
  const f3bc = args.playerField3bc ?? args.field3bc ?? 0;
  const ctype = args.playerCharType ?? args.charType ?? 0;
  const isHologram = args.isHologram ?? 0;
  const slot0Player = args.slot0Player ?? 0;
  const slot1Player = args.slot1Player ?? 0;
  const playerPtr = args.playerPtr ?? 0;
  if (!historyHudGetPlayerIdxNetplayRangeEmpty(netplayBegin, netplayEnd)) {
    if (i32(netplayLocalKnown) < 0) return { hostRequired: true };
    if (i32(netplayLocalKnown) === 0) {
      return { hostRequired: false, idx: -1, slot0: u32(slot0Player), slot1: u32(slot1Player), slot0Player: u32(slot0Player), slot1Player: u32(slot1Player), assigned: false };
    }
  }
  if (u32(f2c) !== 0 || u32(f3bc) !== 0 || i32(ctype) === HISTORY_GET_PLAYER_IDX_REJECT_CHAR || isHologram) {
    return { hostRequired: false, idx: -1, slot0: u32(slot0Player), slot1: u32(slot1Player), slot0Player: u32(slot0Player), slot1Player: u32(slot1Player), assigned: false };
  }
  const r = historyHudGetPlayerIdxResolve({ slot0Player, slot1Player, playerPtr });
  return { hostRequired: false, ...r, slot0Player: r.slot0, slot1Player: r.slot1 };
}
export function statHudTailHostCallCountV11(needed, iterations, edges) {
  if (!needed) return 0;
  const n = i32(iterations) > 0 ? i32(iterations) : 0;
  const e = i32(edges) > 0 ? i32(edges) : 0;
  return 1 + n + e;
}

export function historyHudEliminationSlotOccupied(p) { return u32(p) !== 0; }
export function historyHudEliminationClearNeeded(idx) { return i32(idx) < 0; }
export function historyHudEliminationCompactNeeded(clear, cursor) {
  return u32(clear) !== 0 && u32(cursor) < 2;
}
export function historyHudEliminationStepContinue(cursorAfterDec) { return i32(cursorAfterDec) >= 1; }
export function historyHudEliminationSlotAddr(hud, cursor) {
  return u32(u32(hud) + u32(u32(cursor) - 1) * HISTORY_HUD_ELIMINATION_SLOT_STRIDE);
}
function elimNode({
  hudPtr = 0, cursor = 0, slotPlayer = 0, field2c = 0, field3bc = 0, charType = 0,
  slot0Player = 0, slot1Player = 0, netplayBegin = 0, netplayEnd = 0,
  netplayLocalKnown = -1, priorHost = 0,
} = {}) {
  const occupied = historyHudEliminationSlotOccupied(slotPlayer);
  const slotIndex = u32(u32(cursor) - 1);
  const slotAddr = historyHudEliminationSlotAddr(hudPtr, cursor);
  const gpiHost = occupied && u32(netplayBegin) !== u32(netplayEnd) && i32(netplayLocalKnown) < 0;
  const decisionKnown = !gpiHost && !priorHost;
  const node = {
    cursor: u32(cursor), slotIndex, slotAddr, occupied, gpiHost,
    decisionKnown, gpiIdx: 0, clear: false, compact: false,
    compactDstAddr: 0, compactSrcAddr: 0,
    stepContinue: historyHudEliminationStepContinue(i32(u32(cursor) - 1)),
  };
  if (decisionKnown && occupied) {
    const tp = tryHistoryHudGetPlayerIdxPure({
      netplayBegin, netplayEnd, netplayLocalKnown, field2c, field3bc, charType,
      slot0Player, slot1Player, playerPtr: slotPlayer,
    });
    node.gpiIdx = tp.idx;
    node.clear = historyHudEliminationClearNeeded(tp.idx);
    node.compact = historyHudEliminationCompactNeeded(node.clear ? 1 : 0, cursor);
  }
  if (node.compact) {
    node.compactDstAddr = slotAddr;
    node.compactSrcAddr = u32(slotAddr + HISTORY_HUD_ELIMINATION_SLOT_STRIDE);
  }
  return node;
}
export function historyHudEliminationNodePlan(args) { return elimNode(args); }
export function historyHudEliminationPlan({
  hudPtr = 0, netplayBegin = 0, netplayEnd = 0, netplayLocalKnown = -1,
  slot0 = {}, slot1 = {},
} = {}) {
  const s0 = {
    player: u32(slot0.player), dirty: u32(slot0.dirty) & 0xff,
    listBegin: u32(slot0.listBegin), listEnd: u32(slot0.listEnd), listCap: u32(slot0.listCap),
    field2c: u32(slot0.field2c), field3bc: u32(slot0.field3bc), charType: i32(slot0.charType),
  };
  const s1 = {
    player: u32(slot1.player), dirty: u32(slot1.dirty) & 0xff,
    listBegin: u32(slot1.listBegin), listEnd: u32(slot1.listEnd), listCap: u32(slot1.listCap),
    field2c: u32(slot1.field2c), field3bc: u32(slot1.field3bc), charType: i32(slot1.charType),
  };
  const n1 = elimNode({
    hudPtr, cursor: 2, slotPlayer: s1.player, field2c: s1.field2c, field3bc: s1.field3bc,
    charType: s1.charType, slot0Player: s0.player, slot1Player: s1.player,
    netplayBegin, netplayEnd, netplayLocalKnown, priorHost: 0,
  });
  if (n1.decisionKnown && n1.clear) s1.player = 0;
  const n2 = elimNode({
    hudPtr, cursor: 1, slotPlayer: s0.player, field2c: s0.field2c, field3bc: s0.field3bc,
    charType: s0.charType, slot0Player: s0.player, slot1Player: s1.player,
    netplayBegin, netplayEnd, netplayLocalKnown, priorHost: n1.gpiHost ? 1 : 0,
  });
  const stateKnown = !n1.gpiHost && !n2.gpiHost;
  if (n2.decisionKnown && n2.clear) {
    s0.player = 0;
    if (n2.compact) {
      const t = { ...s0 };
      s0.player = s1.player; s0.dirty = s1.dirty; s0.listBegin = s1.listBegin;
      s0.listEnd = s1.listEnd; s0.listCap = s1.listCap;
      s1.player = t.player; s1.dirty = t.dirty; s1.listBegin = t.listBegin;
      s1.listEnd = t.listEnd; s1.listCap = t.listCap;
    }
  }
  return {
    it1: n1, it2: n2,
    hostEdgeCount: (n1.gpiHost ? 1 : 0) + (n2.gpiHost ? 1 : 0),
    pureComplete: stateKnown, stateKnown,
    slot0Out: stateKnown ? { player: s0.player, dirty: s0.dirty, listBegin: s0.listBegin, listEnd: s0.listEnd, listCap: s0.listCap } : null,
    slot1Out: stateKnown ? { player: s1.player, dirty: s1.dirty, listBegin: s1.listBegin, listEnd: s1.listEnd, listCap: s1.listCap } : null,
  };
}

export function itemConfigGetCollectibleNegative(id) { return i32(id) < 0 ? 1 : 0; }
export function itemConfigGetCollectibleTrinketIndex(id) {
  return (~i32(id)) | 0;
}
export function itemConfigGetCollectibleInBounds(index, count) { return i32(index) < i32(count) ? 1 : 0; }
export function itemConfigGetCollectibleSlotAddr(begin, index) { return u32(u32(begin) + u32(i32(index)) * 4); }
export function itemConfigGetCollectibleKind({
  gamePtr = 0, id = 0, configBegin = 0, configEnd = 0, trinketBegin = 0, trinketEnd = 0,
} = {}) {
  if (itemConfigGetCollectibleNegative(id)) {
    if (u32(gamePtr) === 0) return ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
    const ti = itemConfigGetCollectibleTrinketIndex(id);
    const tcount = statHudPlayerVectorCount(trinketBegin, trinketEnd);
    if (!itemConfigGetCollectibleInBounds(ti, tcount)) return ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
    return ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET;
  }
  const count = statHudPlayerVectorCount(configBegin, configEnd);
  if (!itemConfigGetCollectibleInBounds(id, count)) return ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL;
  return ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE;
}
export function itemConfigGetCollectiblePlan({
  gamePtr = 0, id = 0, configBegin = 0, configEnd = 0, trinketBegin = 0, trinketEnd = 0,
  slotSample = 0, innerSample = 0,
} = {}) {
  const negative = itemConfigGetCollectibleNegative(id);
  const trinketIndex = itemConfigGetCollectibleTrinketIndex(id);
  const kind = itemConfigGetCollectibleKind({
    gamePtr, id, configBegin, configEnd, trinketBegin, trinketEnd,
  });
  let count = 0, inBounds = 0, slotAddr = 0, result = 0;
  if (negative !== 0 && u32(gamePtr) !== 0) {
    count = statHudPlayerVectorCount(trinketBegin, trinketEnd);
  } else if (negative === 0) {
    count = statHudPlayerVectorCount(configBegin, configEnd);
  }
  if (kind === ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE) {
    inBounds = 1;
    slotAddr = itemConfigGetCollectibleSlotAddr(configBegin, id);
    result = u32(slotSample);
  } else if (kind === ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET) {
    inBounds = 1;
    slotAddr = itemConfigGetCollectibleSlotAddr(trinketBegin, trinketIndex);
    result = u32(innerSample);
  }
  return { negative, trinketIndex, count, inBounds, kind, slotAddr, result, resultKnown: 1 };
}
export function fcoTwinWalkFlag(tag, cfg, flags) {
  if ((u32(tag) & 0xff) === 0) return 0;
  if (u32(cfg) === 0) return 0;
  return (u32(flags) & FCO_TWIN_BIT) !== 0 ? 1 : 0;
}
export function fcoListEmpty(b, e) { return u32(b) === u32(e) ? 1 : 0; }
export function fcoPlayerSlotActive(f) { return u32(f) === 0 ? 1 : 0; }
export function fcoTwinPresent(p) { return u32(p) !== 0 ? 1 : 0; }
export function fcoHasCollectibleHit(al) { return (u32(al) & 0xff) !== 0 ? 1 : 0; }
export function fcoListContinue(cur, end) { return u32(u32(cur) + 4) !== u32(end) ? 1 : 0; }
export function fcoNodePlan({
  playerPtr = 0, playerField2c = 0, twinPtr = 0, twinFlag = 0,
  primaryKnown = 0, primaryAl = 0, twinKnown = 0, twinAl = 0,
} = {}) {
  const node = {
    skip: fcoPlayerSlotActive(playerField2c) === 0 ? 1 : 0,
    hostPrimary: 0, primaryHit: 0, hostTwin: 0, twinHit: 0,
    result: 0, resultKnown: 0, stepContinue: 0,
  };
  if (node.skip !== 0) { node.stepContinue = 1; return node; }
  node.hostPrimary = 1;
  if (!primaryKnown) return node;
  node.primaryHit = fcoHasCollectibleHit(primaryAl);
  if (node.primaryHit !== 0) {
    node.result = u32(playerPtr); node.resultKnown = 1; return node;
  }
  if (!twinFlag || fcoTwinPresent(twinPtr) === 0) {
    node.stepContinue = 1; return node;
  }
  node.hostTwin = 1;
  if (!twinKnown) return node;
  node.twinHit = fcoHasCollectibleHit(twinAl);
  if (node.twinHit !== 0) {
    node.result = u32(twinPtr); node.resultKnown = 1; return node;
  }
  node.stepContinue = 1;
  return node;
}
export function fcoPlan({
  lazSharedTag = 0, configPtr = 0, configFieldB8 = 0,
  listBegin = 0, listEnd = 0, hitKind = 0, hitPlayer = 0, hitTwin = 0,
} = {}) {
  const twinFlag = fcoTwinWalkFlag(lazSharedTag, configPtr, configFieldB8);
  const empty = fcoListEmpty(listBegin, listEnd);
  const count = statHudPlayerVectorCount(listBegin, listEnd);
  const monolithic = count < 0 ? 1 : 0;
  const walkNeeded = statHudPlayerWalkNeeded(count) ? 1 : 0;
  const plan = {
    twinFlag, empty, count, monolithic, walkNeeded,
    hostHasCollectible: 0, getCollectiblePure: 1,
    pureComplete: 0, resultKnown: 0, result: 0,
  };
  if (empty !== 0) {
    plan.pureComplete = 1; plan.resultKnown = 1; return plan;
  }
  plan.hostHasCollectible = 1;
  if (monolithic !== 0) return plan;
  if (hitKind === 0) { plan.resultKnown = 1; plan.result = 0; }
  else if (hitKind === 1) { plan.resultKnown = 1; plan.result = u32(hitPlayer); }
  else if (hitKind === 2) { plan.resultKnown = 1; plan.result = u32(hitTwin); }
  else { plan.resultKnown = 0; plan.result = 0; }
  return plan;
}
export function statHudTailHostCallCountV13(needed, iterations, edges, fco) {
  if (!needed) return 0;
  const n = i32(iterations) > 0 ? i32(iterations) : 0;
  const e = i32(edges) > 0 ? i32(edges) : 0;
  const f = i32(fco) > 0 ? i32(fco) : 0;
  return f + n + e;
}

export function gameGetPlayerEmpty(count) { return i32(count) === 0 ? 1 : 0; }
export function gameGetPlayerInBounds(index, count) {
  return u32(index) < u32(i32(count)) ? 1 : 0;
}
export function gameGetPlayerSlotAddr(begin, index, count) {
  return statHudPlayerSlotAddr(begin, index, count);
}
export function gameGetPlayerPlan({
  listBegin = 0, listEnd = 0, index = 0, slotSample = 0,
} = {}) {
  const count = statHudPlayerVectorCount(listBegin, listEnd);
  const empty = gameGetPlayerEmpty(count);
  const inBounds = gameGetPlayerInBounds(index, count);
  const slotAddr = gameGetPlayerSlotAddr(listBegin, index, count);
  if (empty !== 0) {
    return { count, empty, hostFatal: 1, inBounds, slotAddr, result: 0, resultKnown: 0 };
  }
  return { count, empty, hostFatal: 0, inBounds, slotAddr, result: u32(slotSample), resultKnown: 1 };
}

export function hasCollectibleConfigNull(p) { return u32(p) === 0 ? 1 : 0; }
export function hasCollectibleRedirectNeeded(f) { return u32(f) === 1 ? 1 : 0; }
export function hasCollectibleParentQualify(p, f) {
  if (u32(p) === 0) return 0;
  return u32(f) === 1 ? 1 : 0;
}
export function hasCollectibleQuestHide(flag20a9, challenge, itemFlags) {
  if ((u32(flag20a9) & 0xff) === 0) return 0;
  if (i32(challenge) >= 2) return 0;
  if ((u32(itemFlags) & HAS_COLLECTIBLE_QUEST_BIT) === 0) return 1;
  return 0;
}
export function hasCollectibleHeldTrue(heldId, id, heldFlag) {
  if (u32(heldId) === 0) return 0;
  if (u32(heldId) !== u32(i32(id))) return 0;
  return (u32(heldFlag) & 0xff) !== 0 ? 1 : 0;
}
export function hasCollectibleIdNegative(id) { return itemConfigGetCollectibleNegative(id); }
export function hasCollectibleIgnoreModifiers(m) { return (u32(m) & 0xff) !== 0 ? 1 : 0; }
export function hasCollectibleInventoryThreshold(heldId, id, heldFlag) {
  if (u32(heldId) === 0) return 0;
  if (u32(heldId) !== u32(i32(id))) return 0;
  return (u32(heldFlag) & 0xff) === 0 ? 1 : 0;
}
export function hasCollectibleCountHit(count, threshold) { return i32(count) > i32(threshold) ? 1 : 0; }
export function hasCollectibleCountSlotAddr(table, id) { return u32(u32(table) + u32(i32(id)) * 4); }
export function hasCollectibleRedirectNode({
  playerIn = 0, field2c = 0, parentPtr = 0, parentField28 = 0,
  getPlayerKnown = 0, getPlayerResult = 0,
} = {}) {
  const redirectNeeded = hasCollectibleRedirectNeeded(field2c);
  const node = {
    redirectNeeded, parentQualify: 0, hostGetPlayer: 0,
    playerOut: u32(playerIn), playerKnown: 1, fallToInventory: 0,
  };
  if (redirectNeeded === 0) return node;
  node.parentQualify = hasCollectibleParentQualify(parentPtr, parentField28);
  if (node.parentQualify !== 0) { node.playerOut = u32(parentPtr); return node; }
  node.hostGetPlayer = 1;
  if (!getPlayerKnown) { node.playerOut = 0; node.playerKnown = 0; return node; }
  if (u32(getPlayerResult) === 0) {
    node.playerOut = u32(playerIn); node.fallToInventory = 1; return node;
  }
  node.playerOut = u32(getPlayerResult);
  return node;
}
export function hasCollectiblePlan({
  configPtr = 0, playerIn = 0, field2c = 0, parentPtr = 0, parentField28 = 0,
  listBegin = 0, listEnd = 0, player0Sample = 0, flag20a9 = 0, challenge = 0,
  itemFlags = 0, heldId = 0, heldFlag = 0, id = 0, ignoreMod = 0, countSample = 0,
} = {}) {
  const plan = {
    configNull: hasCollectibleConfigNull(configPtr),
    redirectNeeded: 0, parentQualify: 0, hostGetPlayer: 0, getPlayerFatal: 0,
    playerKnown: 0, playerOut: 0, questHide: 0, heldTrue: 0, idNegative: 0,
    hostTrinket: 0, ignoreModifiers: 0, hostModifierBody: 0, inventoryThreshold: 0,
    countHit: 0, result: 0, resultKnown: 0, pureComplete: 0,
  };
  if (plan.configNull !== 0) { plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
  const gp = gameGetPlayerPlan({ listBegin, listEnd, index: 0, slotSample: player0Sample });
  const node = hasCollectibleRedirectNode({
    playerIn, field2c, parentPtr, parentField28,
    getPlayerKnown: gp.resultKnown, getPlayerResult: gp.result,
  });
  plan.redirectNeeded = node.redirectNeeded;
  plan.parentQualify = node.parentQualify;
  plan.hostGetPlayer = node.hostGetPlayer;
  plan.playerOut = node.playerOut;
  plan.playerKnown = node.playerKnown;
  if (node.hostGetPlayer !== 0) {
    plan.getPlayerFatal = gp.hostFatal;
    if (gp.hostFatal !== 0 || node.playerKnown === 0) return plan;
  }
  plan.questHide = hasCollectibleQuestHide(flag20a9, challenge, itemFlags);
  if (plan.questHide !== 0) { plan.result = 0; plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
  plan.heldTrue = hasCollectibleHeldTrue(heldId, id, heldFlag);
  if (plan.heldTrue !== 0) { plan.result = 1; plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
  plan.idNegative = hasCollectibleIdNegative(id);
  if (plan.idNegative !== 0) { plan.hostTrinket = 1; return plan; }
  plan.ignoreModifiers = hasCollectibleIgnoreModifiers(ignoreMod);
  plan.inventoryThreshold = hasCollectibleInventoryThreshold(heldId, id, heldFlag);
  plan.countHit = hasCollectibleCountHit(countSample, plan.inventoryThreshold);
  if (plan.ignoreModifiers !== 0) {
    plan.result = plan.countHit; plan.resultKnown = 1; plan.pureComplete = 1; return plan;
  }
  plan.hostModifierBody = 1;
  return plan;
}

/* ---- ABI v15: ignoreModifiers==0 modifier ladder ---- */
export const HUD_HOST_VA_HAS_COLLECTIBLE_771550 = 0x00771550;
export const HUD_HOST_VA_HAS_COLLECTIBLE_7CB6E0 = 0x007cb6e0;
export const HUD_HOST_VA_TEMPFX_HAS_NULL = 0x00930680;
export const HUD_HOST_VA_HAS_COLLECTIBLE_7DA770 = 0x007da770;
export const HUD_HOST_VA_HAS_COLLECTIBLE_7DB8D0 = 0x007db8d0;
export const HAS_COLLECTIBLE_FLAGS_2028_OFF = 0x2028;
export const HAS_COLLECTIBLE_MOD_ID_147 = 0x147;
export const HAS_COLLECTIBLE_MOD_ID_148 = 0x148;
export const HAS_COLLECTIBLE_MOD_ID_139 = 0x139;
export const HAS_COLLECTIBLE_MOD_ID_9 = 9;
export const HAS_COLLECTIBLE_MOD_ID_3B = 0x3b;
export const HAS_COLLECTIBLE_MOD_ID_131 = 0x131;
export const HAS_COLLECTIBLE_MOD_ID_101 = 0x101;
export const HAS_COLLECTIBLE_MOD_ID_E7 = 0xe7;
export const HAS_COLLECTIBLE_MOD_ID_B6 = 0xb6;
export const HAS_COLLECTIBLE_MOD_BIT_131 = 0x10;
export const HAS_COLLECTIBLE_MOD_BIT_101 = 0x08;
export const HAS_COLLECTIBLE_MOD_BIT_E7 = 0x20;
export const HAS_COLLECTIBLE_MOD_BIT_B6 = 0x40;
export const HAS_COLLECTIBLE_MOD_TYPE_10 = 0xa;
export const HAS_COLLECTIBLE_MOD_TYPE_31 = 0x1f;
export const HAS_COLLECTIBLE_MOD_TYPE_3 = 3;
export const HAS_COLLECTIBLE_MOD_TYPE_C = 0xc;
export const HAS_COLLECTIBLE_MOD_ARM_OTHER = 0;
export const HAS_COLLECTIBLE_MOD_ARM_147_148 = 1;
export const HAS_COLLECTIBLE_MOD_ARM_139 = 2;
export const HAS_COLLECTIBLE_MOD_ARM_9 = 3;
export const HAS_COLLECTIBLE_MOD_ARM_3B = 4;
export const HAS_COLLECTIBLE_MOD_ARM_131 = 5;
export const HAS_COLLECTIBLE_MOD_ARM_101 = 6;
export const HAS_COLLECTIBLE_MOD_ARM_E7 = 7;
export const HAS_COLLECTIBLE_MOD_ARM_B6 = 8;
export const TEMPFX_DISABLED_OFF = 0x11;
export const TEMPFX_ELEM_STRIDE = 0x10;
export const TEMPFX_ITEM_TYPE_NULL = 0;

export function hasCollectibleModArm(id) {
  const u = u32(id);
  if (u === HAS_COLLECTIBLE_MOD_ID_147 || u === HAS_COLLECTIBLE_MOD_ID_148) return HAS_COLLECTIBLE_MOD_ARM_147_148;
  if (u === HAS_COLLECTIBLE_MOD_ID_139) return HAS_COLLECTIBLE_MOD_ARM_139;
  if (u === HAS_COLLECTIBLE_MOD_ID_9) return HAS_COLLECTIBLE_MOD_ARM_9;
  if (u === HAS_COLLECTIBLE_MOD_ID_3B) return HAS_COLLECTIBLE_MOD_ARM_3B;
  if (u === HAS_COLLECTIBLE_MOD_ID_131) return HAS_COLLECTIBLE_MOD_ARM_131;
  if (u === HAS_COLLECTIBLE_MOD_ID_101) return HAS_COLLECTIBLE_MOD_ARM_101;
  if (u === HAS_COLLECTIBLE_MOD_ID_E7) return HAS_COLLECTIBLE_MOD_ARM_E7;
  if (u === HAS_COLLECTIBLE_MOD_ID_B6) return HAS_COLLECTIBLE_MOD_ARM_B6;
  return HAS_COLLECTIBLE_MOD_ARM_OTHER;
}
export function hasCollectibleFlags2028Bit(flags, mask) {
  return ((u32(flags) & 0xff) & (u32(mask) & 0xff)) !== 0 ? 1 : 0;
}
export function hasCollectibleSeedMod4(seed) {
  let eax = i32(i32(seed) & 0x80000003);
  if (eax >= 0) return eax;
  eax = i32(eax - 1);
  eax = i32(eax | 0xfffffffc);
  return i32(eax + 1);
}
export function hasCollectibleInnerTrue(id, num15, seedMod4) {
  const u = u32(id);
  if (u !== HAS_COLLECTIBLE_MOD_ID_147 && u !== HAS_COLLECTIBLE_MOD_ID_148) return 0;
  if (i32(num15) > 1) {
    const m = i32(seedMod4);
    return (m === 0 || m === 1) ? 1 : 0;
  }
  if (i32(seedMod4) === 0) return u === HAS_COLLECTIBLE_MOD_ID_147 ? 1 : 0;
  if (i32(seedMod4) === 1) return u === HAS_COLLECTIBLE_MOD_ID_148 ? 1 : 0;
  return 0;
}
export function hasCollectibleType10(t) { return i32(t) === HAS_COLLECTIBLE_MOD_TYPE_10 ? 1 : 0; }
export function hasCollectibleType31(t) { return i32(t) === HAS_COLLECTIBLE_MOD_TYPE_31 ? 1 : 0; }
export function hasCollectibleType3OrC(t) {
  const x = i32(t);
  if (x === HAS_COLLECTIBLE_MOD_TYPE_3) return 1;
  return x === HAS_COLLECTIBLE_MOD_TYPE_C ? 1 : 0;
}
export function tempfxHasNullDisabled(d) { return (u32(d) & 0xff) !== 0 ? 1 : 0; }
export function tempfxHasNullEmpty(b, e) { return u32(b) === u32(e) ? 1 : 0; }
export function tempfxHasNullNodeMatch(typ, id, wanted) {
  if (i32(typ) !== TEMPFX_ITEM_TYPE_NULL) return 0;
  return i32(id) === i32(wanted) ? 1 : 0;
}
export function tempfxHasNullWalkContinue(next, end) { return u32(next) !== u32(end) ? 1 : 0; }
export function tempfxHasNullPlan({
  disabled = 0, begin = 0, end = 0, itemType = 0, itemId = 0, wanted = 0,
} = {}) {
  const plan = {
    disabled: tempfxHasNullDisabled(disabled), empty: tempfxHasNullEmpty(begin, end),
    nodeMatch: 0, walkContinue: 0, result: 0, resultKnown: 0, pureComplete: 0,
  };
  if (plan.disabled !== 0 || plan.empty !== 0) {
    plan.resultKnown = 1; plan.pureComplete = 1; return plan;
  }
  plan.nodeMatch = tempfxHasNullNodeMatch(itemType, itemId, wanted);
  plan.walkContinue = tempfxHasNullWalkContinue(u32(begin) + TEMPFX_ELEM_STRIDE, end);
  if (plan.nodeMatch !== 0) {
    plan.result = 1; plan.resultKnown = 1; plan.pureComplete = 1; return plan;
  }
  if (plan.walkContinue === 0) { plan.resultKnown = 1; plan.pureComplete = 1; }
  return plan;
}
export function hasCollectibleModifierPlan({
  id = 0, flags2028 = 0, charType = 0, seed264f8 = 0,
  hasEffect15Known = 0, hasEffect15 = 0, num15Known = 0, num15 = 0,
  hasNullKnown = 0, hasNull = 0, hasEffect5dKnown = 0, hasEffect5d = 0,
  rec26bKnown = 0, rec26b = 0,
} = {}) {
  const plan = {
    arm: hasCollectibleModArm(id), bitTrue: 0,
    type10: hasCollectibleType10(charType), type31: hasCollectibleType31(charType),
    type3OrC: hasCollectibleType3OrC(charType), seedMod4: hasCollectibleSeedMod4(seed264f8),
    innerTrue: 0, host771550: 0, host7cb6e0: 0, needHasNull: 0, hostRec26b: 0,
    host7db8d0: 0, host139Body: 0, host9Body: 0, result: 0, resultKnown: 0, pureComplete: 0,
  };
  const arm = plan.arm;
  if (arm === HAS_COLLECTIBLE_MOD_ARM_147_148) {
    plan.host771550 = 1;
    if (!hasEffect15Known) return plan;
    if ((i32(hasEffect15) & 0xff) === 0) { plan.host7db8d0 = 1; return plan; }
    plan.host7cb6e0 = 1;
    if (!num15Known) return plan;
    plan.innerTrue = hasCollectibleInnerTrue(id, num15, plan.seedMod4);
    if (plan.innerTrue) { plan.result = 1; plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
    plan.host7db8d0 = 1; return plan;
  }
  if (arm === HAS_COLLECTIBLE_MOD_ARM_139) {
    if (plan.type10) { plan.host139Body = 1; return plan; }
    plan.needHasNull = 1;
    if (!hasNullKnown) return plan;
    if ((i32(hasNull) & 0xff) === 0) { plan.host7db8d0 = 1; return plan; }
    if (plan.type31) { plan.host7db8d0 = 1; return plan; }
    plan.host139Body = 1; return plan;
  }
  if (arm === HAS_COLLECTIBLE_MOD_ARM_9) {
    plan.host771550 = 1;
    if (!hasEffect5dKnown) return plan;
    if ((i32(hasEffect5d) & 0xff) === 0) { plan.host7db8d0 = 1; return plan; }
    plan.host9Body = 1; return plan;
  }
  if (arm === HAS_COLLECTIBLE_MOD_ARM_3B) {
    if (!plan.type3OrC) { plan.host7db8d0 = 1; return plan; }
    plan.hostRec26b = 1;
    if (!rec26bKnown) return plan;
    if ((i32(rec26b) & 0xff) !== 0) { plan.result = 1; plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
    plan.host7db8d0 = 1; return plan;
  }
  let bitMask = 0;
  if (arm === HAS_COLLECTIBLE_MOD_ARM_131) bitMask = HAS_COLLECTIBLE_MOD_BIT_131;
  else if (arm === HAS_COLLECTIBLE_MOD_ARM_101) bitMask = HAS_COLLECTIBLE_MOD_BIT_101;
  else if (arm === HAS_COLLECTIBLE_MOD_ARM_E7) bitMask = HAS_COLLECTIBLE_MOD_BIT_E7;
  else if (arm === HAS_COLLECTIBLE_MOD_ARM_B6) bitMask = HAS_COLLECTIBLE_MOD_BIT_B6;
  if (bitMask) {
    plan.bitTrue = hasCollectibleFlags2028Bit(flags2028, bitMask);
    if (plan.bitTrue) { plan.result = 1; plan.resultKnown = 1; plan.pureComplete = 1; return plan; }
    plan.host7db8d0 = 1; return plan;
  }
  plan.host7db8d0 = 1;
  return plan;
}

/* ---- ABI v16: 0x007db8d0 resolver gates ----
   Chain 0x007db8d0 -> 0x007db860 -> 0x004288a0 is READ-ONLY; the only
   observable effect is the GetPlayer-style fatal 0x00a112c0 on the slow
   path when [Game+0x1bb88]==0 (stays host, v14 precedent). The scan walk
   itself stays host; its decision is modelled over sampled last-node
   fields. Fast path (mode <= 7) never reads Game+0x1bb88. */
export const HUD_HOST_VA_HAS_COLLECTIBLE_7DB860 = 0x007db860;
export const HUD_HOST_VA_HAS_COLLECTIBLE_SCAN_4288A0 = 0x004288a0;
export const HAS_COLLECTIBLE_MOD_SCAN_LIST_OFF = 0x1bbd8;
export const HAS_COLLECTIBLE_MOD_SCAN_HEAD_FIRST_OFF = 0x4;
export const HAS_COLLECTIBLE_MOD_SCAN_NODE_HIT_OFF = 0x0;
export const HAS_COLLECTIBLE_MOD_SCAN_NODE_NEXT_OFF = 0x8;
export const HAS_COLLECTIBLE_MOD_SCAN_NODE_DISABLED_OFF = 0xd;
export const HAS_COLLECTIBLE_MOD_SCAN_NODE_VALUE_OFF = 0x10;
export const HAS_COLLECTIBLE_MOD_SCAN_WANTED = 0x4f;
export const HAS_COLLECTIBLE_MOD_SCAN_PLAYER_BUF_OFF = 0x1fd4;
export const HAS_COLLECTIBLE_MOD_SCAN_PLAYER_BUF_END_OFF = 0x1fd8;
export const HAS_COLLECTIBLE_MOD_SCAN_BUF_GATE_LEN = 0x8f;
export const HAS_COLLECTIBLE_MOD_GAME_COUNT_OFF = 0x1bb88;
export const HAS_COLLECTIBLE_MOD_FAST_MAX = 7;
export const HAS_COLLECTIBLE_MOD_HASH_C1 = 0x3e2d6048;
export const HAS_COLLECTIBLE_MOD_HASH_C2 = 0x652f233e;
export const HAS_COLLECTIBLE_MOD_HASH_C3 = 0x4e31313e;
export const HAS_COLLECTIBLE_MOD_SLOW_RESULT_MASK = 3;
export const HAS_COLLECTIBLE_MOD_SLOW_RESULT_ADD = 2;

export function hasCollectibleModScanActive({
  lastNodeDisabled = 0, lastNodeValue = 0, lastNodeIsHead = 0,
  bufBegin = 0, bufEnd = 0,
} = {}) {
  if ((u32(lastNodeDisabled) & 0xff) !== 0) return 0;
  if (u32(lastNodeValue) > HAS_COLLECTIBLE_MOD_SCAN_WANTED) return 0;
  if (u32(lastNodeIsHead) !== 0) return 0;
  if (i32(u32(bufEnd) - u32(bufBegin)) <= HAS_COLLECTIBLE_MOD_SCAN_BUF_GATE_LEN) return 0;
  return 1;
}
export function hasCollectibleModScanMode({
  lastNodeDisabled = 0, lastNodeValue = 0, lastNodeIsHead = 0,
  bufBegin = 0, bufEnd = 0, bufByte = 0,
} = {}) {
  if (hasCollectibleModScanActive({ lastNodeDisabled, lastNodeValue, lastNodeIsHead, bufBegin, bufEnd }) === 0) return 0;
  return i32(bufByte) & 0xff;
}
export function hasCollectibleModFastApplicable(mode) {
  return u32(mode) <= HAS_COLLECTIBLE_MOD_FAST_MAX ? 1 : 0;
}
export function hasCollectibleModFastResult(mode) {
  const FAST_TABLE = [-1, -1, 0, 1, 2, 3, 4, 5];
  if (u32(mode) > HAS_COLLECTIBLE_MOD_FAST_MAX) return 0;
  return FAST_TABLE[i32(mode)];
}
export function hasCollectibleModSlowFatal(gameCount) {
  return i32(gameCount) === 0 ? 1 : 0;
}
export function hasCollectibleModSlowHash(gameCount, mode) {
  const sum = u32(u32(gameCount) + u32(mode));
  const v = sum > 1 ? sum : 1;
  const t = (v >>> (HAS_COLLECTIBLE_MOD_HASH_C1 & 31)) ^ v;
  const u = ((t << (HAS_COLLECTIBLE_MOD_HASH_C2 & 31)) ^ t) >>> 0;
  const w = (u >>> (HAS_COLLECTIBLE_MOD_HASH_C3 & 31)) ^ u;
  return (w & HAS_COLLECTIBLE_MOD_SLOW_RESULT_MASK) + HAS_COLLECTIBLE_MOD_SLOW_RESULT_ADD;
}
export function hasCollectibleModResolvePlan({
  lastNodeDisabled = 0, lastNodeValue = 0, lastNodeIsHead = 0,
  bufBegin = 0, bufEnd = 0, bufByte = 0, countKnown = 0, gameCount = 0,
} = {}) {
  const active = hasCollectibleModScanActive({ lastNodeDisabled, lastNodeValue, lastNodeIsHead, bufBegin, bufEnd });
  const mode = hasCollectibleModScanMode({ lastNodeDisabled, lastNodeValue, lastNodeIsHead, bufBegin, bufEnd, bufByte });
  const plan = {
    scanActive: active, mode,
    fastApplicable: hasCollectibleModFastApplicable(mode),
    fastResult: hasCollectibleModFastResult(mode),
    slowFatal: 0, slowHash: 0, result: 0, resultKnown: 0,
    hostNeeded: 0, pureComplete: 0,
  };
  if (plan.fastApplicable !== 0) {
    plan.result = plan.fastResult;
    plan.resultKnown = 1;
    plan.pureComplete = 1;
    return plan;
  }
  plan.slowHash = hasCollectibleModSlowHash(gameCount, mode);
  if (countKnown === 0) { plan.hostNeeded = 1; return plan; }
  plan.slowFatal = hasCollectibleModSlowFatal(gameCount);
  if (plan.slowFatal !== 0) { plan.hostNeeded = 1; return plan; }
  plan.result = plan.slowHash;
  plan.resultKnown = 1;
  plan.pureComplete = 1;
  return plan;
}

/* ---- ABI v17: 0x00771550 narrowed gates ----
   Body 0x00771550..0x00771612 (ret 8; this=player, id, flag byte). Store
   census ZERO. Pure gates:
     owned      f=[player+0x2ef8] != 0 && f == id && byte[player+0x2ef0]
                != 0 -> TRUE with no host (checked before flag dispatch);
     strict     (f != 0 && f == id && byte == 0) -> count > 1 (else > 0),
                SIGNED setg both arms;
     flag!=0    width = 1 + (HasCollectible(player,0x8b,0) ||
                HasCollectible(player,0x1ca,0)) with the 0x1ca call
                short-circuited; scan player+0x16c0 stride 4 for `width`
                slots (UNSIGNED loop), TRUE iff any (slot & 0x7fff) == id.
   Host residual: 0x7cb6e0 (count) on flag==0; the two 0x7706e0 samples on
   flag!=0. Ladder sites 0x7707f4 (id 0x15) / 0x770920 (id 0x5d) both
   flag==0. Next peel VA 0x007cb6e0. */
export const HAS_COLLECTIBLE_771550_FIELD_OFF = 0x2ef8;
export const HAS_COLLECTIBLE_771550_BYTE_OFF = 0x2ef0;
export const HAS_COLLECTIBLE_771550_SLOT_BASE_OFF = 0x16c0;
export const HAS_COLLECTIBLE_771550_SLOT_STRIDE = 4;
export const HAS_COLLECTIBLE_771550_SLOT_MASK = 0x7fff;
export const HAS_COLLECTIBLE_771550_WHICH_8B = 0x8b;
export const HAS_COLLECTIBLE_771550_WHICH_1CA = 0x1ca;
export const HAS_COLLECTIBLE_771550_STRICT_CMP = 1;

export function hasCollectible771550Owned(field2ef8, byte2ef0, id) {
  if (u32(field2ef8) === 0) return 0;
  if (u32(field2ef8) !== u32(id)) return 0;
  if ((u32(byte2ef0) & 0xff) === 0) return 0;
  return 1;
}
export function hasCollectible771550Strict(field2ef8, byte2ef0, id) {
  if (u32(field2ef8) === 0) return 0;
  if (u32(field2ef8) !== u32(id)) return 0;
  if ((u32(byte2ef0) & 0xff) !== 0) return 0;
  return 1;
}
export function hasCollectible771550CountGt(count, strict) {
  const threshold = strict !== 0 ? HAS_COLLECTIBLE_771550_STRICT_CMP : 0;
  return i32(count) > threshold ? 1 : 0;
}
export function hasCollectible771550ScanWidth(has8b, has1ca) {
  if ((u32(has8b) & 0xff) !== 0) return 2;
  if ((u32(has1ca) & 0xff) !== 0) return 2;
  return 1;
}
export function hasCollectible771550SlotMatch(slot, id) {
  return (u32(slot) & HAS_COLLECTIBLE_771550_SLOT_MASK) === u32(id) ? 1 : 0;
}
export function hasCollectible771550ScanResult(slot0, slot1, scanWidth, id) {
  for (let i = 0; u32(i) < u32(i32(scanWidth)); i += 1) {
    const slot = i === 0 ? u32(slot0) : u32(slot1);
    if (hasCollectible771550SlotMatch(slot, id) !== 0) return 1;
  }
  return 0;
}
export function hasCollectible771550Plan({
  field2ef8 = 0, byte2ef0 = 0, id = 0, flag = 0,
  countKnown = 0, count = 0,
  has8bKnown = 0, has8b = 0, has1caKnown = 0, has1ca = 0,
  slot0 = 0, slot1 = 0,
} = {}) {
  const plan = {
    owned: hasCollectible771550Owned(field2ef8, byte2ef0, id),
    strict: hasCollectible771550Strict(field2ef8, byte2ef0, id),
    host7cb6e0: 0, countKnown: 0, count: 0,
    hostHas8b: 0, hostHas1ca: 0, scanWidth: 0, scanResult: 0,
    result: 0, resultKnown: 0, hostNeeded: 0, pureComplete: 0,
  };
  if (plan.owned !== 0) {
    plan.result = 1;
    plan.resultKnown = 1;
    plan.pureComplete = 1;
    return plan;
  }
  if ((u32(flag) & 0xff) === 0) {
    plan.host7cb6e0 = 1;
    plan.countKnown = countKnown !== 0 ? 1 : 0;
    plan.count = i32(count);
    if (countKnown === 0) { plan.hostNeeded = 1; return plan; }
    plan.result = hasCollectible771550CountGt(count, plan.strict);
    plan.resultKnown = 1;
    plan.pureComplete = 1;
    return plan;
  }
  plan.hostHas8b = 1;
  if (has8bKnown === 0) { plan.hostNeeded = 1; return plan; }
  if ((u32(has8b) & 0xff) !== 0) {
    plan.scanWidth = 2;
    plan.hostHas1ca = 0;
  } else {
    plan.hostHas1ca = 1;
    if (has1caKnown === 0) { plan.hostNeeded = 1; return plan; }
    plan.scanWidth = hasCollectible771550ScanWidth(has8b, has1ca);
  }
  plan.scanResult = hasCollectible771550ScanResult(slot0, slot1, plan.scanWidth, id);
  plan.result = plan.scanResult;
  plan.resultKnown = 1;
  plan.pureComplete = 1;
  return plan;
}

/* ---- ABI v19: 0x007cb6e0 count resolver ----
   Body 0x007cb6e0..0x007cba1f (ret 4; this=player, id). Transcribed
   from output/decomp/5129df723e64/section-notes/cpu-dump/007cb6e0.txt
   + 007cb7fd.txt + 007cb940.txt (PE-truth; not derived from the C++).
   Pure accumulation: boost -> byte gates (before mask) -> id & 0x7fff ->
   mode-table scan (.rdata 0xb6bad0, 10 dwords, UNSIGNED bound) ->
   special ids 0x15/0x40/0x4b jump to the sampling region -> recursed
   count(id 0x15/0x40/0x4b) branches (0x30 gate, count40 seed-index
   gate, count4b RNG gate) -> part F (0x17 host adder / 0x18 / 0x13) ->
   sampling (16c0 slots, 17c4 block, item list UNSIGNED bound, byte
   buffer SIGNED bound, 2ef8 adjust, 1b7 final gate). Host edges:
   GetPlayer 0x00417870 walk (host), 0x00740bc0 + RNG 0x007e9020
   (count4b), 0x00930aa0 (id 0x17), 0x007706e0 (0x8b/0x1ca/0x1b7).
   seed_idx = (u32)trunc(seed/90) % 10 via signed magic 0xb60b60b7
   (imul/add/sar 6/sign fix; UNSIGNED mod 10). */
export const HUD_COUNT_7CB6E0_VA_HEAD = 0x007cb6e0;
export const HUD_COUNT_7CB6E0_VA_RET = 0x007cba1f;
export const HUD_COUNT_7CB6E0_VA_SAMPLING = 0x007cb8d8;
export const HUD_COUNT_7CB6E0_VA_RECURSE_15 = 0x007cb7b2;
export const HUD_COUNT_7CB6E0_VA_RECURSE_40 = 0x007cb801;
export const HUD_COUNT_7CB6E0_VA_RECURSE_4B = 0x007cb845;
export const HUD_COUNT_7CB6E0_HOST_VA_740BC0 = 0x00740bc0;
export const HUD_COUNT_7CB6E0_HOST_VA_7E9020 = 0x007e9020;
export const HUD_COUNT_7CB6E0_HOST_VA_930AA0 = 0x00930aa0;
export const HUD_COUNT_7CB6E0_TABLE_VA = 0x00b6bad0;
export const HUD_COUNT_7CB6E0_TABLE = [0x9, 0xb, 0x41, 0x1b, 0xa, 0xc, 0x1a, 0x42, 0x60, 0x90];
export const HUD_COUNT_7CB6E0_TABLE_SIZE = 10;
export const HUD_COUNT_7CB6E0_MASK = 0x7fff;
export const HUD_COUNT_7CB6E0_MODE_GATE = 0x1c;
export const HUD_COUNT_7CB6E0_MODE_7A_GATE = 0x29;
export const HUD_COUNT_7CB6E0_ID_15 = 0x15;
export const HUD_COUNT_7CB6E0_ID_30 = 0x30;
export const HUD_COUNT_7CB6E0_ID_40 = 0x40;
export const HUD_COUNT_7CB6E0_ID_4B = 0x4b;
export const HUD_COUNT_7CB6E0_ID_56 = 0x56;
export const HUD_COUNT_7CB6E0_ID_7A = 0x7a;
export const HUD_COUNT_7CB6E0_ID_17 = 0x17;
export const HUD_COUNT_7CB6E0_ID_18 = 0x18;
export const HUD_COUNT_7CB6E0_ID_13 = 0x13;
export const HUD_COUNT_7CB6E0_HC_8B = 0x8b;
export const HUD_COUNT_7CB6E0_HC_1CA = 0x1ca;
export const HUD_COUNT_7CB6E0_HC_1B7 = 0x1b7;
export const HUD_COUNT_7CB6E0_FIELD_13C0_OFF = 0x13c0;
export const HUD_COUNT_7CB6E0_GATE_202C_OFF = 0x202c;
export const HUD_COUNT_7CB6E0_GATE_20A9_OFF = 0x20a9;
export const HUD_COUNT_7CB6E0_SLOT_BASE_OFF = 0x16c0;
export const HUD_COUNT_7CB6E0_SLOT_STRIDE = 4;
export const HUD_COUNT_7CB6E0_ITEM_BEGIN_OFF = 0x1748;
export const HUD_COUNT_7CB6E0_ITEM_END_OFF = 0x174c;
export const HUD_COUNT_7CB6E0_BYTE_BEGIN_OFF = 0x1fe0;
export const HUD_COUNT_7CB6E0_BYTE_END_OFF = 0x1fe4;
export const HUD_COUNT_7CB6E0_BLOCK_17C4_OFF = 0x17c4;
export const HUD_COUNT_7CB6E0_FLAG_17CC_OFF = 0x17cc;
export const HUD_COUNT_7CB6E0_FIELD_18DC_OFF = 0x18dc;
export const HUD_COUNT_7CB6E0_FIELD_18E0_OFF = 0x18e0;
export const HUD_COUNT_7CB6E0_FIELD_2EF8_OFF = 0x2ef8;
export const HUD_COUNT_7CB6E0_BYTE_2EF0_OFF = 0x2ef0;
export const HUD_COUNT_7CB6E0_MGR_SEED_OFF = 0x264f8;
export const HUD_COUNT_7CB6E0_MGR_MODE_OFF = 0x2663c;
export const HUD_COUNT_7CB6E0_MGR_MODE2_OFF = 0x26584;
export const HUD_COUNT_7CB6E0_SEED_DIV_MAGIC = 0xb60b60b7;
export const HUD_COUNT_7CB6E0_SEED_DIV_SHIFT = 6;
export const HUD_COUNT_7CB6E0_SEED_IDX_MOD = 10;
export const HUD_COUNT_7CB6E0_MOD4_MASK = 0x80000003;

export function hudCount7cb6e0Char56Boost(field13c0, id) {
  return (u32(id) === HUD_COUNT_7CB6E0_ID_56 && u32(field13c0) === 4) ? 1 : 0;
}
export function hudCount7cb6e0EarlyGate202c(flag) {
  return (u32(flag) & 0xff) !== 0 ? 1 : 0;
}
export function hudCount7cb6e0EarlyGate20a9(flag) {
  return (u32(flag) & 0xff) !== 0 ? 1 : 0;
}
export function hudCount7cb6e0IdMask(id) {
  return u32(id) & HUD_COUNT_7CB6E0_MASK;
}
export function hudCount7cb6e0TableVa() { return HUD_COUNT_7CB6E0_TABLE_VA; }
export function hudCount7cb6e0TableSize() { return HUD_COUNT_7CB6E0_TABLE_SIZE; }
export function hudCount7cb6e0TableValue(index) {
  return u32(index) < HUD_COUNT_7CB6E0_TABLE_SIZE ? HUD_COUNT_7CB6E0_TABLE[u32(index)] : 0;
}
export function hudCount7cb6e0SamplingVa() { return HUD_COUNT_7CB6E0_VA_SAMPLING; }
export function hudCount7cb6e0ModeGate() { return HUD_COUNT_7CB6E0_MODE_GATE; }
export function hudCount7cb6e0Mask() { return HUD_COUNT_7CB6E0_MASK; }
export function hudCount7cb6e0SlotBaseOff() { return HUD_COUNT_7CB6E0_SLOT_BASE_OFF; }
export function hudCount7cb6e0SlotStride() { return HUD_COUNT_7CB6E0_SLOT_STRIDE; }
export function hudCount7cb6e0ItemBeginOff() { return HUD_COUNT_7CB6E0_ITEM_BEGIN_OFF; }
export function hudCount7cb6e0ItemEndOff() { return HUD_COUNT_7CB6E0_ITEM_END_OFF; }
export function hudCount7cb6e0ByteBeginOff() { return HUD_COUNT_7CB6E0_BYTE_BEGIN_OFF; }
export function hudCount7cb6e0ByteEndOff() { return HUD_COUNT_7CB6E0_BYTE_END_OFF; }
export function hudCount7cb6e0Which1b7() { return HUD_COUNT_7CB6E0_HC_1B7; }
export function hudCount7cb6e0ModeTableHit(managerMode, idMasked) {
  /* 0x7cb76e cmp [Mgr+0x2663c],0x1c; jne skip; UNSIGNED 10-entry scan. */
  if (u32(managerMode) !== HUD_COUNT_7CB6E0_MODE_GATE) return 0;
  return HUD_COUNT_7CB6E0_TABLE.includes(u32(idMasked)) ? 1 : 0;
}
export function hudCount7cb6e0SpecialId(idMasked) {
  const i = u32(idMasked);
  return (i === HUD_COUNT_7CB6E0_ID_15 || i === HUD_COUNT_7CB6E0_ID_40 ||
          i === HUD_COUNT_7CB6E0_ID_4B) ? 1 : 0;
}
export function hudCount7cb6e0SeedMod4(seed) {
  /* 0x7cb7c7 and ecx,0x80000003; jns; dec; or 0xfffffffc; inc — C % 4. */
  let eax = i32(u32(seed) & HUD_COUNT_7CB6E0_MOD4_MASK);
  if (eax >= 0) return eax;
  eax = i32(eax - 1);
  eax |= 0xfffffffc;
  return i32(eax + 1);
}
export function hudCount7cb6e0SeedTableIndex(seed) {
  /* 0x7cb813..0x7cb835: signed div-by-90 magic 0xb60b60b7 (imul high +
     add + sar 6 + sign fix), then UNSIGNED mod 10. */
  const s = BigInt(i32(seed));
  const prod = s * BigInt(i32(HUD_COUNT_7CB6E0_SEED_DIV_MAGIC));
  let edx = Number((prod >> 32n) & 0xffffffffn) >>> 0; /* imul high dword */
  edx = (edx + u32(seed)) >>> 0;                       /* add edx, ecx */
  edx = (edx | 0) >> HUD_COUNT_7CB6E0_SEED_DIV_SHIFT;  /* sar edx, 6 */
  edx = edx >>> 0;
  const eax = edx >>> 31;                              /* shr eax, 0x1f */
  const q = (eax + edx) >>> 0;                         /* add eax, edx */
  return q % HUD_COUNT_7CB6E0_SEED_IDX_MOD;            /* div ecx; rem */
}
export function hudCount7cb6e0SeedGate(seed, idMasked) {
  return HUD_COUNT_7CB6E0_TABLE[hudCount7cb6e0SeedTableIndex(seed)] === u32(idMasked) ? 1 : 0;
}
export function hudCount7cb6e0Id30Gate(idMasked, count15, mod4) {
  const i = u32(idMasked);
  const c = i32(count15);
  const m = i32(mod4);
  if (i !== HUD_COUNT_7CB6E0_ID_30) return 0;
  if (c <= 0) return 0;
  if (m === 2) return 1;
  return (c > 1 && m === 3) ? 1 : 0;
}
export function hudCount7cb6e07a29Skip(idMasked, managerMode26584) {
  return (u32(idMasked) === HUD_COUNT_7CB6E0_ID_7A &&
          u32(managerMode26584) === HUD_COUNT_7CB6E0_MODE_7A_GATE) ? 1 : 0;
}
export function hudCount7cb6e04bCompare(rngPlus1, idMasked) {
  return u32(rngPlus1) === u32(idMasked) ? 1 : 0;
}
export function hudCount7cb6e0Slot16c0(slot, idMasked) {
  /* Two INDEPENDENT increments: low-15 match and bit-15 set. */
  let add = 0;
  if ((u32(slot) & HUD_COUNT_7CB6E0_MASK) === u32(idMasked)) add += 1;
  if ((u32(slot) & 0x8000) !== 0) add += 1;
  return add;
}
export function hudCount7cb6e0ScanWidth(has8b, has1ca) {
  if ((u32(has8b) & 0xff) !== 0) return 2;
  if ((u32(has1ca) & 0xff) !== 0) return 2;
  return 1;
}
export function hudCount7cb6e0Block17c4(blockPtr, block0, block4, field2ef8, idMasked) {
  if (u32(blockPtr) === 0) return 0;
  if (u32(block0) !== 2) return 0;
  if (u32(block4) !== u32(idMasked)) return 0;
  if (u32(field2ef8) !== 0 && u32(field2ef8) !== u32(idMasked)) return 0;
  return 1;
}
export function hudCount7cb6e0BlockFlag17cc(flag) {
  return (u32(flag) & 0x02) !== 0 ? 1 : 0;
}
export function hudCount7cb6e0ItemSpan(begin1748, end174c) {
  return (i32(u32(end174c) - u32(begin1748))) >> 2; /* sar */
}
export function hudCount7cb6e0ItemListAdd(idMasked, itemSpan, itemId, itemCount) {
  /* UNSIGNED bound (jae); esi += item_id + 2*count (32-bit wrap). */
  if (!(u32(idMasked) < u32(i32(itemSpan)))) return 0;
  return i32(i32(itemId) + i32(itemCount) * 2);
}
export function hudCount7cb6e0BytebufAdd(idMasked, byteSpan, byteValue) {
  /* SIGNED bound (jge); +1 iff the byte is non-zero. */
  if (i32(idMasked) >= i32(byteSpan)) return 0;
  return (u32(byteValue) & 0xff) !== 0 ? 1 : 0;
}
export function hudCount7cb6e02ef8Adjust(esi, field2ef8, byte2ef0, idMasked) {
  const f = u32(field2ef8);
  if (f === 0) return i32(esi);
  if ((f & HUD_COUNT_7CB6E0_MASK) !== u32(idMasked)) return i32(esi);
  if ((u32(byte2ef0) & 0xff) !== 0) {
    const t = (f & 0x8000) !== 0 ? 1 : 0; /* neg/sbb/neg */
    return i32(i32(esi) + t + 1);
  }
  let s = i32(i32(esi) - 1); /* cmovg max(0, esi-1) */
  if (s <= 0) s = 0;
  if ((f & 0x8000) !== 0) {
    s = i32(s - 1);
    if (s <= 0) s = 0;
  }
  return s;
}
export function hudCount7cb6e0FinalGate(esi, has1b7) {
  /* SIGNED jle; +1 iff has_1b7 byte set. */
  const e = i32(esi);
  if (e <= 0) return e;
  return (u32(has1b7) & 0xff) !== 0 ? i32(e + 1) : e;
}
export function hudCount7cb6e0WalkStep({
  playerPtr = 0, field2c = 0, parentPtr = 0, parentField28 = 0,
  getPlayerKnown = 0, getPlayerResult = 0, candidateField2c = 0,
} = {}) {
  let player = u32(playerPtr);
  let hostEdge = 0;
  let cont = 0;
  if (u32(field2c) !== 1) return { player, hostEdge, cont };
  if (u32(parentPtr) !== 0 && u32(parentField28) === 1) {
    player = u32(parentPtr);
    cont = u32(candidateField2c) === 1 ? 1 : 0;
    return { player, hostEdge, cont };
  }
  if (getPlayerKnown !== 0) hostEdge = 1;
  if (u32(getPlayerResult) === 0) return { player, hostEdge, cont };
  player = u32(getPlayerResult);
  cont = u32(candidateField2c) === 1 ? 1 : 0;
  return { player, hostEdge, cont };
}

function hudCount7cb6e0Sampling(idMasked, s, has8b, has1ca, has1b7) {
  let esi = 0;
  const width = hudCount7cb6e0ScanWidth(has8b, has1ca);
  for (let i = 0; u32(i) < u32(i32(width)); i += 1) {
    esi = i32(esi + hudCount7cb6e0Slot16c0(i === 0 ? s.slot0 : s.slot1, idMasked));
  }
  esi = i32(esi + hudCount7cb6e0Block17c4(s.blockPtr, s.block0, s.block4, s.field2ef8, idMasked));
  esi = i32(esi + hudCount7cb6e0BlockFlag17cc(s.flag17cc));
  esi = i32(esi + hudCount7cb6e0ItemListAdd(idMasked, hudCount7cb6e0ItemSpan(s.itemBegin, s.itemEnd), s.itemId, s.itemCount));
  esi = i32(esi + hudCount7cb6e0BytebufAdd(idMasked, i32(u32(s.byteEnd) - u32(s.byteBegin)), s.byteValue));
  esi = hudCount7cb6e02ef8Adjust(esi, s.field2ef8, s.byte2ef0, idMasked);
  let edges = 1; /* has_8b call */
  if ((u32(has8b) & 0xff) === 0) edges += 1; /* has_1ca call */
  const gateEsi = esi;
  if (gateEsi > 0) edges += 1; /* has_1b7 call */
  return { add: hudCount7cb6e0FinalGate(esi, has1b7), edges, gateEsi };
}

function hudCount7cb6e0CountFor(id, s, has8b, has1ca, has1b7) {
  let esi = hudCount7cb6e0Char56Boost(s.field13c0, id);
  if (hudCount7cb6e0EarlyGate202c(s.flag202c) !== 0 ||
      hudCount7cb6e0EarlyGate20a9(s.flag20a9) !== 0) {
    return { esi, edges: 0, gateEsi: esi };
  }
  const idm = hudCount7cb6e0IdMask(id);
  esi = i32(esi + hudCount7cb6e0ModeTableHit(s.managerMode, idm));
  const r = hudCount7cb6e0Sampling(idm, s, has8b, has1ca, has1b7);
  return { esi: i32(esi + r.add), edges: r.edges, gateEsi: r.gateEsi };
}

export function hudCount7cb6e0Plan({
  id = 0, field13c0 = 0, flag202c = 0, flag20a9 = 0,
  managerMode = 0, managerSeed = 0, managerMode2 = 0,
  slot0 = 0, slot1 = 0, blockPtr = 0, block0 = 0, block4 = 0, flag17cc = 0,
  itemBegin = 0, itemEnd = 0, itemId = 0, itemCount = 0,
  byteBegin = 0, byteEnd = 0, byteValue = 0,
  field2ef8 = 0, byte2ef0 = 0, field18dc = 0, field18e0 = 0,
  has8bKnown = 0, has8b = 0, has1caKnown = 0, has1ca = 0,
  has1b7Known = 0, has1b7 = 0, host17Known = 0, host17 = 0,
  host4bKnown = 0, host4b = 0,
} = {}) {
  const s = {
    slot0, slot1, blockPtr, block0, block4, flag17cc,
    itemBegin, itemEnd, itemId, itemCount, byteBegin, byteEnd, byteValue,
    field2ef8, byte2ef0, field13c0, flag202c, flag20a9, managerMode,
  };
  const plan = {
    boost: hudCount7cb6e0Char56Boost(field13c0, id),
    earlyGate: 0, idMasked: 0, tableHit: 0, specialId: 0,
    seedMod4: hudCount7cb6e0SeedMod4(managerSeed),
    seedIdx: hudCount7cb6e0SeedTableIndex(managerSeed),
    id30Returned: 0, skip7a29: 0, host4bNeeded: 0, host17Needed: 0,
    count15: 0, count40: 0, count4b: 0, samplingAdd: 0,
    result: 0, resultKnown: 0, hostNeeded: 0, pureComplete: 0, hostEdgeCount: 0,
  };
  plan.earlyGate = (hudCount7cb6e0EarlyGate202c(flag202c) !== 0 ||
                    hudCount7cb6e0EarlyGate20a9(flag20a9) !== 0) ? 1 : 0;
  const idm = hudCount7cb6e0IdMask(id);
  plan.idMasked = idm;
  plan.specialId = hudCount7cb6e0SpecialId(idm);
  if (plan.earlyGate !== 0) {
    plan.result = plan.boost;
    plan.resultKnown = 1;
    plan.pureComplete = 1;
    return plan;
  }
  plan.tableHit = hudCount7cb6e0ModeTableHit(managerMode, idm);
  let esi = i32(plan.boost + plan.tableHit);
  let hostEdges = 0;
  let gateEsiAny = 0;
  if (plan.specialId !== 0) {
    const r = hudCount7cb6e0Sampling(idm, s, has8b, has1ca, has1b7);
    plan.samplingAdd = r.add;
    esi = i32(esi + r.add);
    hostEdges += r.edges;
    if (r.gateEsi > 0) gateEsiAny = 1;
  } else {
    const r15 = hudCount7cb6e0CountFor(HUD_COUNT_7CB6E0_ID_15, s, has8b, has1ca, has1b7);
    plan.count15 = r15.esi;
    hostEdges += r15.edges;
    if (r15.gateEsi > 0) gateEsiAny = 1;
    if (hudCount7cb6e0Id30Gate(idm, plan.count15, plan.seedMod4) !== 0) {
      plan.id30Returned = 1;
      plan.result = i32(plan.count15 + esi);
      plan.hostEdgeCount = hostEdges;
      let unknown = 0;
      if (has8bKnown === 0) unknown = 1;
      if ((u32(has8b) & 0xff) === 0 && has1caKnown === 0) unknown = 1;
      if (gateEsiAny !== 0 && has1b7Known === 0) unknown = 1;
      plan.hostNeeded = unknown;
      plan.resultKnown = unknown ? 0 : 1;
      plan.pureComplete = plan.resultKnown;
      return plan;
    }
    const r40 = hudCount7cb6e0CountFor(HUD_COUNT_7CB6E0_ID_40, s, has8b, has1ca, has1b7);
    plan.count40 = r40.esi;
    hostEdges += r40.edges;
    if (r40.gateEsi > 0) gateEsiAny = 1;
    if (i32(plan.count40) > 0 && hudCount7cb6e0SeedGate(managerSeed, idm) !== 0) {
      esi = i32(esi + plan.count40);
    }
    const r4b = hudCount7cb6e0CountFor(HUD_COUNT_7CB6E0_ID_4B, s, has8b, has1ca, has1b7);
    plan.count4b = r4b.esi;
    hostEdges += r4b.edges;
    if (r4b.gateEsi > 0) gateEsiAny = 1;
    if (i32(plan.count4b) > 0) {
      plan.skip7a29 = hudCount7cb6e07a29Skip(idm, managerMode2);
      if (plan.skip7a29 === 0) {
        plan.host4bNeeded = 1;
        hostEdges += 2; /* 0x740bc0 + RNG 0x7e9020 */
        if (host4bKnown !== 0 && hudCount7cb6e04bCompare(host4b, idm) !== 0) {
          esi = i32(esi + plan.count4b);
        }
      }
    }
    if (plan.skip7a29 === 0) {
      if (idm === HUD_COUNT_7CB6E0_ID_17) {
        plan.host17Needed = 1;
        hostEdges += 1; /* 0x930aa0 */
        if (host17Known !== 0) esi = i32(esi + i32(host17));
      } else if (idm === HUD_COUNT_7CB6E0_ID_18) {
        if (i32(field18dc) > 0) esi = i32(esi + 1);
      } else if (idm === HUD_COUNT_7CB6E0_ID_13) {
        if (i32(field18e0) > 0) esi = i32(esi + 1);
      }
    }
    const r = hudCount7cb6e0Sampling(idm, s, has8b, has1ca, has1b7);
    plan.samplingAdd = r.add;
    esi = i32(esi + r.add);
    hostEdges += r.edges;
    if (r.gateEsi > 0) gateEsiAny = 1;
  }
  plan.result = esi;
  plan.hostEdgeCount = hostEdges;
  let unknown = 0;
  if (has8bKnown === 0) unknown = 1;
  if ((u32(has8b) & 0xff) === 0 && has1caKnown === 0) unknown = 1;
  if (gateEsiAny !== 0 && has1b7Known === 0) unknown = 1;
  if (plan.host4bNeeded !== 0 && host4bKnown === 0) unknown = 1;
  if (plan.host17Needed !== 0 && host17Known === 0) unknown = 1;
  plan.hostNeeded = unknown;
  plan.resultKnown = unknown ? 0 : 1;
  plan.pureComplete = plan.resultKnown;
  return plan;
}

/* ---- ABI v23: 0x007cb6e0 preamble walk / count4b RNG-draw / twin +
   recursion PREP laws (evidence: section-notes/hud-v23-7cb6e0/NOTES.md).
   Host leaves stay host; these are the pure decisions + receiver/arg
   preps around them. */
export const HUD_COUNT_7CB6E0_VA_WALK_GATE = 0x007cb6fb;
export const HUD_COUNT_7CB6E0_VA_M3BC_PROBE = 0x007cb701;
export const HUD_COUNT_7CB6E0_VA_GETPLAYER_CALL = 0x007cb71f;
export const HUD_COUNT_7CB6E0_VA_WALK_ADOPT = 0x007cb728;
export const HUD_COUNT_7CB6E0_VA_WALK_STORE = 0x007cb730;
export const HUD_COUNT_7CB6E0_VA_ROOM_CALL = 0x007cb86d;
export const HUD_COUNT_7CB6E0_VA_RNG_GATE = 0x007cb875;
export const HUD_COUNT_7CB6E0_VA_RNG_CALL = 0x007cb899;
export const HUD_COUNT_7CB6E0_VA_TWIN17_CALL = 0x007cb8b2;
export const HUD_COUNT_7CB6E0_RNG_MAX = 0xbd;
export const HUD_COUNT_7CB6E0_RNG_CONST_VA = 0x00b1f564;
export const HUD_COUNT_7CB6E0_RNG_CONST_A_LO = 0x2;
export const HUD_COUNT_7CB6E0_RNG_CONST_A_HI = 0x7;
export const HUD_COUNT_7CB6E0_RNG_CONST_B = 0x19;
export const HUD_COUNT_7CB6E0_FIELD_2C_OFF = 0x2c;
export const HUD_COUNT_7CB6E0_FIELD_3BC_OFF = 0x3bc;
export const HUD_COUNT_7CB6E0_FIELD_28_OFF = 0x28;
export const HUD_COUNT_7CB6E0_GAME_ROOM_IDX_OFF = 0x18304;
export const HUD_COUNT_7CB6E0_ROOM_FIELD_5C_OFF = 0x5c;
export const HUD_COUNT_7CB6E0_TWIN_RECV_OFF = 0x1508;
export const HUD_COUNT_7CB6E0_WALK_ITER_CAP = 16;
export const HUD_COUNT_7CB6E0_WALK_SAMPLE_STRIDE = 8; /* {known, result} */

export function hudCount7cb6e0WalkActive(field2c) {
  /* 0x7cb6fb cmp dword [edi+0x2c],1 ; jne 0x7cb733 — FULL-WORD == 1. */
  return u32(field2c) === 1 ? 1 : 0;
}
export function hudCount7cb6e0M3bcEligible(parentPtr, parentField28) {
  /* 0x7cb707 test eax,eax ; je 0x7cb711 ; 0x7cb70b cmp [eax+0x28],1
     — full-dword qualify (non-null && +0x28 == 1). */
  return u32(parentPtr) !== 0 && u32(parentField28) === 1 ? 1 : 0;
}
export function hudCount7cb6e0RngGate(roomField5c) {
  /* 0x7cb875 test eax,eax ; je 0x7cb8a6 — full dword != 0. */
  return u32(roomField5c) !== 0 ? 1 : 0;
}
export function hudCount7cb6e0RngPrep(roomField5c) {
  /* 0x7cb879..0x7cb896: 16-byte RandomInt receiver: seed = [room+0x5c],
     a_lo/a_hi = qword[0xb1f564], b = dword[0xb1f56c]. */
  return {
    seed: u32(roomField5c),
    aLo: HUD_COUNT_7CB6E0_RNG_CONST_A_LO,
    aHi: HUD_COUNT_7CB6E0_RNG_CONST_A_HI,
    b: HUD_COUNT_7CB6E0_RNG_CONST_B,
  };
}
export function hudCount7cb6e0RoomPrep(gamePtr, gameField18304) {
  /* 0x7cb865 push -1 ; 0x7cb867 push [ecx+0x18304] ; 0x7cb86d call
     0x740bc0 — receiver = Game (ecx from [0xc71678]), idx = [Game+0x18304],
     arg2 = -1. */
  return { receiver: u32(gamePtr), idx: u32(gameField18304), arg2: -1 };
}
export function hudCount7cb6e0RngMax() { return HUD_COUNT_7CB6E0_RNG_MAX; }
export function hudCount7cb6e04bChain(roomField5c, rngKnown, rngResult, count4b, idMasked) {
  /* 0x7cb875 gate -> 0x7cb899 RNG -> 0x7cb89e inc eax (u32 wrap) ->
     0x7cb89f cmp ebx,eax ; jne skip ; 0x7cb8a3 add esi,count4b. */
  if (u32(roomField5c) === 0) return 0;
  if (rngKnown === 0) return 0;
  return u32(u32(rngResult) + 1) === u32(idMasked) ? i32(count4b) : 0;
}
export function hudCount7cb6e0Twin17Prep(playerPtr) {
  /* 0x7cb8ab push ebx (idm == 0x17) ; 0x7cb8ac lea ecx,[edi+0x1508] —
     receiver = player + 0x1508 (wrap), arg = 0x17. */
  return { receiver: u32(u32(playerPtr) + HUD_COUNT_7CB6E0_TWIN_RECV_OFF), arg: HUD_COUNT_7CB6E0_ID_17 };
}
export function hudCount7cb6e0RecursePrep(playerPtr, id) {
  /* 0x7cb7ae/0x7cb7fd/0x7cb841: push const ; mov ecx,edi ; call 0x7cb6e0
     — receiver = the RESOLVED player (verbatim), arg = id VERBATIM (no
     0x7fff mask; the machine pushes the constants). */
  return { receiver: u32(playerPtr), arg: u32(id) };
}

/* Transcribed instruction table for PE 0x7cb6fb..0x7cb733 (the preamble
   player walk). m.view = linear memory; a handler returns the next PC or
   undefined to fall through; HUD_COUNT_WALK_END = 0x7ffffffe terminates. */
const HUD_COUNT_WALK_END = 0x7ffffffe;
const HUD_COUNT_WALK_SKIP = 0x007cb733; /* jne target from the start gate */
const HUD_COUNT_WALK_TRACE = [
  [HUD_COUNT_7CB6E0_VA_WALK_GATE, (m) => {
    /* cmp dword [edi+0x2c],1 ; jne 0x7cb733 */
    if (loadU32v(m.view, m.edi + HUD_COUNT_7CB6E0_FIELD_2C_OFF) !== 1) {
      return HUD_COUNT_WALK_SKIP;
    }
    m.walkActive = 1;
    return HUD_COUNT_7CB6E0_VA_M3BC_PROBE;
  }],
  [HUD_COUNT_WALK_SKIP, (m) => {
    /* walk skipped: resolved = this unchanged, walk_active = 0. */
    m.resolved = m.edi;
    return HUD_COUNT_WALK_END;
  }],
  [HUD_COUNT_7CB6E0_VA_M3BC_PROBE, (m) => {
    /* mov eax,[edi+0x3bc] */
    m.eax = loadU32v(m.view, m.edi + HUD_COUNT_7CB6E0_FIELD_3BC_OFF);
    return HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 6; /* 0x7cb707 test eax,eax */
  }],
  [HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 6, (m) => {
    /* test eax,eax ; je 0x7cb711 */
    if (m.eax === 0) return HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 0x10; /* 0x7cb711 */
    return HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 0xa; /* 0x7cb70b */
  }],
  [HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 0xa, (m) => {
    /* cmp dword [eax+0x28],1 ; je 0x7cb728 */
    if (loadU32v(m.view, m.eax + HUD_COUNT_7CB6E0_FIELD_28_OFF) === 1) {
      return HUD_COUNT_7CB6E0_VA_WALK_ADOPT;
    }
    return HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 0x10; /* 0x7cb711 */
  }],
  [HUD_COUNT_7CB6E0_VA_M3BC_PROBE + 0x10, (m) => {
    /* cmp dword [edi+0x2c],1 ; jne 0x7cb730 (defensive re-test) */
    if (loadU32v(m.view, m.edi + HUD_COUNT_7CB6E0_FIELD_2C_OFF) !== 1) {
      return HUD_COUNT_7CB6E0_VA_WALK_STORE;
    }
    return HUD_COUNT_7CB6E0_VA_GETPLAYER_CALL;
  }],
  [HUD_COUNT_7CB6E0_VA_GETPLAYER_CALL, (m) => {
    /* GetPlayer(0) HOST: consume one caller sample {known, result}. */
    if (m.edges >= m.samplesCount) {
      m.hostNeeded = 1;
      return HUD_COUNT_7CB6E0_VA_WALK_STORE;
    }
    const base = m.samplesAddr + m.edges * HUD_COUNT_7CB6E0_WALK_SAMPLE_STRIDE;
    const known = loadU32v(m.view, base);
    const result = loadU32v(m.view, base + 4);
    m.edges += 1;
    if (known === 0) {
      m.hostNeeded = 1;
      return HUD_COUNT_7CB6E0_VA_WALK_STORE;
    }
    m.eax = result;
    return HUD_COUNT_7CB6E0_VA_WALK_ADOPT - 4; /* 0x7cb724 test eax,eax */
  }],
  [HUD_COUNT_7CB6E0_VA_WALK_ADOPT - 4, (m) => {
    /* test eax,eax ; je 0x7cb730 */
    if (m.eax === 0) {
      m.stoppedNull = 1;
      return HUD_COUNT_7CB6E0_VA_WALK_STORE;
    }
    return HUD_COUNT_7CB6E0_VA_WALK_ADOPT;
  }],
  [HUD_COUNT_7CB6E0_VA_WALK_ADOPT, (m) => {
    /* cmp dword [eax+0x2c],1 ; mov edi,eax ; je 0x7cb701 */
    m.edi = m.eax;
    m.iterations += 1;
    if (loadU32v(m.view, m.edi + HUD_COUNT_7CB6E0_FIELD_2C_OFF) === 1) {
      if (m.iterations >= m.iterCap) {
        m.truncated = 1;
        return HUD_COUNT_7CB6E0_VA_WALK_STORE;
      }
      return HUD_COUNT_7CB6E0_VA_M3BC_PROBE;
    }
    return HUD_COUNT_7CB6E0_VA_WALK_STORE;
  }],
  [HUD_COUNT_7CB6E0_VA_WALK_STORE, (m) => {
    /* mov [ebp-0x1c],edi — resolved = edi; walk ends. */
    m.resolved = m.edi;
    return HUD_COUNT_WALK_END;
  }],
];

/**
 * Composed preamble walk plan (PE 0x7cb6fb..0x7cb733): resolves the
 * final player. GetPlayer(0) results come from the caller's samples
 * table (8 bytes/entry {known, result}; one per host edge). The
 * walkActive flag is 0 when the start gate fails; resolved is then the
 * input player unchanged.
 */
export function hudCount7cb6e0WalkPlan(view, playerPtr, samplesAddr, samplesCount, iterCap) {
  const m = {
    view,
    edi: u32(playerPtr), eax: 0, edges: 0, iterations: 0,
    samplesAddr: u32(samplesAddr), samplesCount: u32(samplesCount),
    iterCap: i32(iterCap),
    walkActive: 0, truncated: 0, stoppedNull: 0, hostNeeded: 0, resolved: u32(playerPtr),
  };
  let i = 0;
  let guard = 0;
  while (i < HUD_COUNT_WALK_TRACE.length) {
    if (++guard > 4096) throw new Error("hudCount7cb6e0WalkPlan did not terminate");
    const [va, handler] = HUD_COUNT_WALK_TRACE[i];
    const next = handler(m);
    if (next === undefined) { i += 1; continue; }
    if (next === HUD_COUNT_WALK_END) break;
    const target = HUD_COUNT_WALK_TRACE.findIndex(([tva]) => tva === next);
    if (target < 0) throw new Error(`hudCount7cb6e0WalkPlan bad jump target 0x${next.toString(16)}`);
    i = target;
  }
  return {
    resolvedPlayer: m.resolved,
    walkActive: m.walkActive,
    iterations: m.iterations,
    hostEdges: m.edges,
    truncated: m.truncated ? 1 : 0,
    stoppedNull: m.stoppedNull ? 1 : 0,
    hostNeeded: m.hostNeeded ? 1 : 0,
  };
}

/* ---- ABI v20: FUN_008318a0 (0x008318a0) shared signed-advance + ----
   Game+0x22ed0 rewrite + common tail. Evidence: section-notes/hud-v20/
   NOTES.md; cpu-dump/008318a0.txt (head + mode gate 0x8318d4..0x831915),
   00831f90.txt (mode-2/3 island 0x831fa1..0x8320cc), 00832640.txt
   (common tail 0x832663..0x8326bc). The mode gate (0x831902 dec/cmp 3/ja
   + jump table 0x8327bc) is the SHARED v5 gate law shape (92f1c0 by
   reference) — the case VAs are recorded here, not re-dispatching. */
export const HUD_8318A0_VA_HEAD = 0x008318a0;
export const HUD_8318A0_VA_MODE_GATE = 0x00831902;
export const HUD_8318A0_JUMP_TABLE_VA = 0x008327bc;
export const HUD_8318A0_CASE_VA_MODE1 = 0x00831915;
export const HUD_8318A0_CASE_VA_MODE2 = 0x00831fa1;
export const HUD_8318A0_CASE_VA_MODE3 = 0x008320c6;
export const HUD_8318A0_CASE_VA_MODE4 = 0x0083243b;
export const HUD_8318A0_VA_MODE2_FAST = 0x0083209c;
export const HUD_8318A0_VA_JL_MODE2 = 0x008320a2;
export const HUD_8318A0_VA_JL_MODE3 = 0x008320cc;
export const HUD_8318A0_VA_SHARED_ADVANCE = 0x008320bd;
export const HUD_8318A0_VA_REWRITE_GATE = 0x00832024;
export const HUD_8318A0_VA_COMMON_TAIL = 0x00832663;
export const HUD_8318A0_VA_TAIL_MODE_REREAD = 0x00832670;
export const HUD_8318A0_VA_TAIL_RATIO_STORE = 0x00832679;
export const HUD_8318A0_HEAD_FIELD_OFF = 0x234;
export const HUD_8318A0_HEAD_TYPE_OFF = 0x28;
export const HUD_8318A0_HEAD_KIND_OFF = 0x2c;
export const HUD_8318A0_HEAD_TYPE = 0x3c5;
export const HUD_8318A0_HEAD_KIND = 0xa;
export const HUD_8318A0_GAME_IVAR1_OFF = 0x1bb74;
export const HUD_8318A0_COUNTER_OFF = 4;
export const HUD_8318A0_LIMIT_OFF = 8;
export const HUD_8318A0_RATIO_OFF = 0xc;
export const HUD_8318A0_FIELD_238_OFF = 0x238;
export const HUD_8318A0_FIELD_6C_OFF = 0x6c;
export const HUD_8318A0_FIELD_7C_OFF = 0x7c;
export const HUD_8318A0_GAME_22ED0_OFF = 0x22ed0;
export const HUD_8318A0_GAME_22ED0_VALUE = 1;
export const HUD_8318A0_GAME_22ED4_OFF = 0x22ed4;
export const HUD_8318A0_GAME_22EDC_OFF = 0x22edc;
export const HUD_8318A0_TAIL_STORE_VALUE = 2;
export const HUD_8318A0_PLAYER_LIST_OFF = 0x1baa8;
export const HUD_8318A0_PLAYER_STRIDE = 4;
export const HUD_8318A0_PLAYER_418_OFF = 0x418;
export const HUD_8318A0_PLAYER_418_MIN = 10;
export const HUD_8318A0_MODE_AFTER_REWRITE = 3;
export const HUD_8318A0_HOST_VA_TREE_WALK_PREP = 0x00409100;
export const HUD_8318A0_HOST_VA_RESET = 0x00830950;
export const HUD_8318A0_HOST_VA_7EB1B0 = 0x007eb1b0;
export const HUD_8318A0_HOST_VA_MODE1 = 0x004186c0;

/* 0x8318e2..0x8318ff head capture: [this+0x234] candidate gated on
   type +0x28 == 0x3c5 and kind +0x2c == 0xa (cmove), side-effect-free. */
export function hud8318a0HeadCandidate(field234Ptr, type28, kind2c) {
  if (u32(field234Ptr) === 0) return 0;
  if (u32(type28) !== HUD_8318A0_HEAD_TYPE ||
      u32(kind2c) !== HUD_8318A0_HEAD_KIND) return 0;
  return u32(field234Ptr);
}
export function hud8318a0HeadType() { return HUD_8318A0_HEAD_TYPE; }
export function hud8318a0HeadKind() { return HUD_8318A0_HEAD_KIND; }

/* Shared signed advance: mode 2 fast path (0x831fa1 cmp [ebx+0x238],0;
   je 0x83209c) + mode 3 head — both compare counter/limit with SIGNED jl
   (0x8320a2 / 0x8320cc) and jump LAB_008320bd. */
export function hud8318a0AdvanceFires(mode, field238, counter, limit) {
  if (u32(mode) === 2) {
    if (u32(field238) !== 0) return 0;
  } else if (u32(mode) !== 3) {
    return 0;
  }
  return i32(counter) < i32(limit) ? 1 : 0;
}
/* LAB_008320bd: inc eax; mov [ebx+4],eax — full u32 wrap. */
export function hud8318a0CounterNext(counter) { return u32(u32(counter) + 1); }
/* 0x832663..0x832679: movd + cvtdq2ps (SIGNED int32->f32) + divss + movss
   [ebx+0xc] — IEEE f32 bits of (float)(int32)c / (float)(int32)l. */
export function hud8318a0RatioF32Bits(counter, limit) {
  const c = i32(counter);
  const l = i32(limit);
  const ratio = Math.fround(Math.fround(c) / Math.fround(l));
  /* divss 0/0 -> canonical quiet NaN; engine NaN patterns vary, so the
     oracle reports the canonical 0x7fc00000 deterministically. */
  if (!Number.isFinite(ratio) && Number.isNaN(ratio)) return 0x7fc00000;
  const buf = new ArrayBuffer(4);
  new Float32Array(buf)[0] = ratio;
  return new Uint32Array(buf)[0] >>> 0;
}
/* 0x832670 mode RE-READ; 0x83267e/0x832683 cmp 2/3 -> Game+0x22ed4 and
   Game+0x22edc = 2 (dwords). Recaptured mode, never the pre-dispatch one. */
export function hud8318a0TailStoresNeeded(modeAfterBody) {
  return (u32(modeAfterBody) === 2 || u32(modeAfterBody) === 3) ? 1 : 0;
}
/* 0x832024 cmp dword [ebx+0x6c],0 (FULL WORD) / 0x83202a cmp byte
   [ebx+0x7c],0 (LOW BYTE, & 0xff). */
export function hud8318a0RewriteNeeded(field6c, field7c) {
  return (u32(field6c) === 0 || (u32(field7c) & 0xff) === 0) ? 1 : 0;
}
/* 0x83207c mov ecx,0xa; 0x832081 cmp edx,ecx; 0x832083 cmovg ecx,edx —
   SIGNED max(10, value). */
export function hud8318a0Player418Next(value) {
  return i32(value) > HUD_8318A0_PLAYER_418_MIN ? i32(value) : HUD_8318A0_PLAYER_418_MIN;
}
export function hud8318a0AdvancePlan({
  mode = 0, field238 = 0, counter = 0, limit = 0, modeAfterBody = 0,
} = {}) {
  const fires = hud8318a0AdvanceFires(mode, field238, counter, limit);
  const counterOut = hud8318a0CounterNext(counter);
  return {
    advanceFires: fires,
    counterOut,
    /* Tail reads [ebx+4] AFTER the advance store -> post-advance ratio. */
    ratioBits: hud8318a0RatioF32Bits(counterOut, limit),
    tailStoresNeeded: hud8318a0TailStoresNeeded(modeAfterBody),
    hostNeeded: fires ? 0 : 1,
    pureComplete: fires,
  };
}
export function hud8318a0RewritePlan({
  field6c = 0, field7c = 0, receiverLimit = 0, playerBegin = 0, playerEnd = 0,
} = {}) {
  const rewrite = hud8318a0RewriteNeeded(field6c, field7c);
  return {
    rewriteNeeded: rewrite,
    hostLeafNeeded: rewrite,
    game22ed0Store: rewrite ? HUD_8318A0_GAME_22ED0_VALUE : 0,
    counterOut: u32(receiverLimit),
    modeOut: rewrite ? HUD_8318A0_MODE_AFTER_REWRITE : 0,
    playerWalkCount: rewrite ? u32(u32(playerEnd) - u32(playerBegin)) / 4 : 0,
    pureComplete: rewrite ? 0 : 1,
  };
}
export function hud8318a0VaHead() { return HUD_8318A0_VA_HEAD; }
export function hud8318a0VaModeGate() { return HUD_8318A0_VA_MODE_GATE; }
export function hud8318a0JumpTableVa() { return HUD_8318A0_JUMP_TABLE_VA; }
export function hud8318a0CaseVa(dispatchCase) {
  return [HUD_8318A0_CASE_VA_MODE1, HUD_8318A0_CASE_VA_MODE2,
          HUD_8318A0_CASE_VA_MODE3, HUD_8318A0_CASE_VA_MODE4][u32(dispatchCase)] || 0;
}
export function hud8318a0VaMode2Fast() { return HUD_8318A0_VA_MODE2_FAST; }
export function hud8318a0VaSharedAdvance() { return HUD_8318A0_VA_SHARED_ADVANCE; }
export function hud8318a0VaRewriteGate() { return HUD_8318A0_VA_REWRITE_GATE; }
export function hud8318a0VaCommonTail() { return HUD_8318A0_VA_COMMON_TAIL; }
export function hud8318a0HostVaTreeWalkPrep() { return HUD_8318A0_HOST_VA_TREE_WALK_PREP; }
export function hud8318a0HostVaReset() { return HUD_8318A0_HOST_VA_RESET; }
export function hud8318a0HostVa7eb1b0() { return HUD_8318A0_HOST_VA_7EB1B0; }
export function hud8318a0HostVaMode1() { return HUD_8318A0_HOST_VA_MODE1; }
export function hud8318a0CounterOff() { return HUD_8318A0_COUNTER_OFF; }
export function hud8318a0LimitOff() { return HUD_8318A0_LIMIT_OFF; }
export function hud8318a0RatioOff() { return HUD_8318A0_RATIO_OFF; }
export function hud8318a0Field238Off() { return HUD_8318A0_FIELD_238_OFF; }
export function hud8318a0Field6cOff() { return HUD_8318A0_FIELD_6C_OFF; }
export function hud8318a0Field7cOff() { return HUD_8318A0_FIELD_7C_OFF; }
export function hud8318a0Game22ed0Off() { return HUD_8318A0_GAME_22ED0_OFF; }
export function hud8318a0Game22ed4Off() { return HUD_8318A0_GAME_22ED4_OFF; }
export function hud8318a0Game22edcOff() { return HUD_8318A0_GAME_22EDC_OFF; }
export function hud8318a0TailStoreValue() { return HUD_8318A0_TAIL_STORE_VALUE; }
export function hud8318a0PlayerListOff() { return HUD_8318A0_PLAYER_LIST_OFF; }
export function hud8318a0PlayerStride() { return HUD_8318A0_PLAYER_STRIDE; }
export function hud8318a0Player418Off() { return HUD_8318A0_PLAYER_418_OFF; }
export function hud8318a0Player418Min() { return HUD_8318A0_PLAYER_418_MIN; }
export function hud8318a0RewriteMode() { return HUD_8318A0_MODE_AFTER_REWRITE; }
export function hud8318a0GameIvar1Off() { return HUD_8318A0_GAME_IVAR1_OFF; }
export function hud8318a0HeadFieldOff() { return HUD_8318A0_HEAD_FIELD_OFF; }
export function hud8318a0HeadTypeOff() { return HUD_8318A0_HEAD_TYPE_OFF; }
export function hud8318a0HeadKindOff() { return HUD_8318A0_HEAD_KIND_OFF; }

/* ===================== v21: 0x008318a0 mode-2 slow-path _Tree walk ========
   PE 0x831fa1..0x832022 (mode 2, [this+0x238]!=0): host 0x409100 prep then
   an MSVC _Tree successor walk over the container at [this+0x224]:
     node+0=left, +4=parent, +8=right, byte+0xd=_Isnil (0=real, 1=nil).
   Entry: first=[head]; first==head -> empty (jump to rewrite gate).
   Visit: byte[node+0x11d]!=0 -> 2x host 0x409030 (node+0x44, node+0x64).
   Successor (0x831fdb..0x832022):
     if right non-nil: descend leftmost (node+0 while left non-nil).
     else climb: e1=parent; while parent[+0xd]==nil-flag? per machine:
       node == parent.right -> continue climb; parent[+0xd]==0 -> stop.
   Loop back to visit while node != head. NARROWED: the host 0x409030 calls
   + 0x409100 prep stay host; the successor/gates are pure scalar laws. */
export const HUD_8318A0_TREE_HEAD_OFF = 0x224;
export const HUD_8318A0_TREE_NODE_LEFT_OFS = 0x00;
export const HUD_8318A0_TREE_NODE_PARENT_OFS = 0x04;
export const HUD_8318A0_TREE_NODE_RIGHT_OFS = 0x08;
export const HUD_8318A0_TREE_NODE_ISNIL_OFS = 0x0d;
export const HUD_8318A0_TREE_VISIT_GATE_OFS = 0x11d;
export const HUD_8318A0_TREE_VISIT_HOST_VA = 0x00409030;
export const HUD_8318A0_TREE_PREP_HOST_VA = 0x00409100;
export const HUD_8318A0_TREE_SLOW_HEAD_VA = 0x00831fa1;
export const HUD_8318A0_TREE_SLOW_EMPTY_VA = 0x00832024;
export const HUD_8318A0_TREE_SLOW_LOOP_BACK_VA = 0x00831fc2;
export const HUD_8318A0_TREE_SLOW_REWRITE_GATE_VA = 0x00832024;

export function hud8318a0TreeEmpty(firstAddr, headAddr) {
  /* 0x831fbe cmp esi,eax ; je 0x832024 — first == head -> empty. */
  return (u32(firstAddr) === u32(headAddr)) ? 1 : 0;
}
export function hud8318a0TreeVisitGate(gate11d) {
  /* 0x831fc2 cmp byte [esi+0x11d],0 ; je 0x831fdb — LOW BYTE test. */
  return (u32(gate11d) & 0xff) !== 0 ? 1 : 0;
}
export function hud8318a0TreeRightIsReal(rightBytes) {
  /* 0x831fdb mov eax,[esi+8]; 0x831fde cmp byte [eax+0xd],0 ; je descend
     leftmost — real iff right node's _Isnil == 0. Input: the byte at
     [right+0xd]. */
  return (u32(rightBytes) & 0xff) === 0 ? 1 : 0;
}
export function hud8318a0TreeClimbContinue(nodeIsRightChild, parentIsNil) {
  /* 0x831ff0 cmp esi,[eax+8]; jne stop; parent nil? 0x831ffa cmp byte
     [eax+0xd],0 ; je (re-climb) — continue climbing iff node==parent.right
     AND parent _Isnil==0. */
  return (nodeIsRightChild !== 0 && parentIsNil === 0) ? 1 : 0;
}
export function hud8318a0TreeLeftIsReal(leftBytes) {
  /* 0x832010..0x83201a descend section: mov eax,[ecx](left);
     cmp byte [eax+0xd],0 ; je 0x832010 — descend while left's _Isnil==0. */
  return (u32(leftBytes) & 0xff) === 0 ? 1 : 0;
}

/* ===================== v22: 0x008318a0 mode-2 slow-path WALK-ORDER plan
   PE 0x831fa1..0x832022 (recorded in section-notes/hud-v22/NOTES.md and
   cpu-dump/00831f90.txt). The visit loop walks the std::_Tree container at
   [this+0x224] from begin() to end() in MSVC in-order successor order,
   gating each node on byte [node+0x11d]. The JS oracle is a PC-walk trace
   interpreter over the transcribed instruction table (exact VAs); the C++
   export is a straight branch loop, so a wrong branch in one cannot be
   reproduced by the other. ============================================== */

export const HUD_8318A0_TREE_WALK_SLOW_VA = 0x00831fa1;
export const HUD_8318A0_TREE_WALK_PREP_VA = 0x00831fae;
export const HUD_8318A0_TREE_WALK_EMPTY_VA = 0x00831fbe;
export const HUD_8318A0_TREE_WALK_VISIT_VA = 0x00831fc2;
export const HUD_8318A0_TREE_WALK_SUCC_VA = 0x00831fdb;
export const HUD_8318A0_TREE_WALK_DESCEND_VA = 0x00832004;
export const HUD_8318A0_TREE_WALK_CLIMB_VA = 0x00831ff0;
export const HUD_8318A0_TREE_WALK_LOOP_BACK_VA = 0x00832022;
export const HUD_8318A0_TREE_WALK_PREP_RECV_OFF = 0x38;
export const HUD_8318A0_TREE_WALK_NODE_CAP = 32;
export const HUD_8318A0_TREE_WALK_EVENT_CAP = 128;
export const HUD_8318A0_TREE_WALK_KIND_PREP = 1;
export const HUD_8318A0_TREE_WALK_KIND_NODE = 2;
export const HUD_8318A0_TREE_WALK_KIND_HOST_A = 3;
export const HUD_8318A0_TREE_WALK_KIND_HOST_B = 4;

const hudTreeWalkWord = (kind, payload) =>
  (((kind << 24) | ((payload >>> 0) & 0xffffff)) >>> 0) >>> 0;

const loadU32v = (view, addr) => view.getUint32((addr >>> 0), true) >>> 0;
const loadU8v = (view, addr) => view.getUint8((addr >>> 0));

/** PE 0x831fa1: cmp dword [ebx+0x238],0 ; je 0x83209c — FULL-WORD gate. */
export function hud8318a0TreeSlowGate(field238) {
  return (field238 >>> 0) !== 0 ? 1 : 0;
}

/** PE 0x831fae: lea ecx,[ebx+0x38] — 32-bit wrap. */
export function hud8318a0TreePrepReceiver(thisBase) {
  return ((thisBase >>> 0) + HUD_8318A0_TREE_WALK_PREP_RECV_OFF) >>> 0;
}

/** PE 0x831fdb..0x83201a inline successor (same algorithm as the exit
    family's exitRootMapWalkNext / freestanding 0x00414a80). */
export function hud8318a0TreeWalkNext(view, nodeAddr) {
  const node = nodeAddr >>> 0;
  if (node === 0) return 0;
  const right = loadU32v(view, node + HUD_8318A0_TREE_NODE_RIGHT_OFS);
  if (loadU8v(view, right + HUD_8318A0_TREE_NODE_ISNIL_OFS) !== 0) {
    let cur = node;
    let parent = loadU32v(view, cur + HUD_8318A0_TREE_NODE_PARENT_OFS);
    if (loadU8v(view, parent + HUD_8318A0_TREE_NODE_ISNIL_OFS) === 0) {
      while ((cur >>> 0) ===
             (loadU32v(view, parent + HUD_8318A0_TREE_NODE_RIGHT_OFS) >>> 0)) {
        cur = parent;
        parent = loadU32v(view, cur + HUD_8318A0_TREE_NODE_PARENT_OFS);
        if (loadU8v(view, parent + HUD_8318A0_TREE_NODE_ISNIL_OFS) !== 0) break;
      }
    }
    return parent >>> 0;
  }
  let walk = right;
  let left = loadU32v(view, walk + HUD_8318A0_TREE_NODE_LEFT_OFS);
  while (loadU8v(view, left + HUD_8318A0_TREE_NODE_ISNIL_OFS) === 0) {
    walk = left;
    left = loadU32v(view, walk + HUD_8318A0_TREE_NODE_LEFT_OFS);
  }
  return walk >>> 0;
}

/** PE 0x83201c cmp esi,[ebx+0x224] / 0x832022 jne 0x831fc2 — termination:
    keep visiting while successor != head. */
export function hud8318a0TreeWalkContinue(nodeAddr, headAddr) {
  return (nodeAddr >>> 0) !== (headAddr >>> 0) ? 1 : 0;
}

/** PE 0x831fcb lea ecx,[esi+0x44] — first 0x409030 receiver. */
export function hud8318a0TreeVisitHostA(nodeAddr) {
  return ((nodeAddr >>> 0) + 0x44) >>> 0;
}

/** PE 0x831fd3 lea ecx,[esi+0x64] — second 0x409030 receiver. */
export function hud8318a0TreeVisitHostB(nodeAddr) {
  return ((nodeAddr >>> 0) + 0x64) >>> 0;
}

/* Transcribed instruction table for PE 0x831fa1..0x832022. `m` is the
   machine; a handler returns the next PC or undefined to fall through.
   0x7fffffff is the end sentinel. */
const TRACE_HUD_TREE_WALK = [
  // 0x831fa1 cmp dword [ebx+0x238],0 / 0x831fa8 je 0x83209c (fast path)
  [0x00831fa1, (m) => { m.zf = (loadU32v(m.view, (m.thisBase + HUD_8318A0_FIELD_238_OFF) >>> 0)) === 0; }],
  [0x00831fa8, (m) => (m.zf ? 0x7fffffff : undefined)],
  // 0x831fae lea ecx,[ebx+0x38] / 0x831fb1 call 0x409100 (prep host event)
  [0x00831fae, (m) => { m.ecx = (m.thisBase + HUD_8318A0_TREE_WALK_PREP_RECV_OFF) >>> 0; }],
  [0x00831fb1, (m) => {
    m.pushEvent(HUD_8318A0_TREE_WALK_KIND_PREP, m.ecx);
    m.prepHostNeeded = 1;
    m.hostCallCount += 1;
    m.calls.push({ va: HUD_8318A0_TREE_PREP_HOST_VA, thisPtr: m.ecx });
  }],
  // 0x831fb6 mov eax,[ebx+0x224] / 0x831fbc mov esi,[eax]
  [0x00831fb6, (m) => { m.eax = loadU32v(m.view, (m.thisBase + HUD_8318A0_TREE_HEAD_OFF) >>> 0); }],
  [0x00831fbc, (m) => { m.esi = loadU32v(m.view, m.eax); }],
  // 0x831fbe cmp esi,eax / 0x831fc0 je 0x832024 (empty -> rewrite gate)
  [0x00831fbe, (m) => { m.zf = (m.esi >>> 0) === (m.eax >>> 0); }],
  [0x00831fc0, (m) => (m.zf ? 0x00832024 : undefined)],
  // 0x831fc2 cmp byte [esi+0x11d],0 / 0x831fc9 je 0x831fdb (visit gate)
  [0x00831fc2, (m) => {
    m.nodeCount += 1;
    m.pushEvent(HUD_8318A0_TREE_WALK_KIND_NODE, m.esi);
    m.zf = loadU8v(m.view, (m.esi + HUD_8318A0_TREE_VISIT_GATE_OFS) >>> 0) === 0;
  }],
  [0x00831fc9, (m) => (m.zf ? 0x00831fdb : undefined)],
  // 0x831fcb lea ecx,[esi+0x44] / 0x831fce call 0x409030 (host A)
  [0x00831fcb, (m) => { m.ecx = (m.esi + 0x44) >>> 0; }],
  [0x00831fce, (m) => {
    m.pushEvent(HUD_8318A0_TREE_WALK_KIND_HOST_A, m.ecx);
    m.visitGatedCount += 1;
    m.hostCallCount += 2; // both hosts on the gated path (B follows)
    m.calls.push({ va: HUD_8318A0_TREE_VISIT_HOST_VA, thisPtr: m.ecx });
  }],
  // 0x831fd3 lea ecx,[esi+0x64] / 0x831fd6 call 0x409030 (host B)
  [0x00831fd3, (m) => { m.ecx = (m.esi + 0x64) >>> 0; }],
  [0x00831fd6, (m) => {
    m.pushEvent(HUD_8318A0_TREE_WALK_KIND_HOST_B, m.ecx);
    m.calls.push({ va: HUD_8318A0_TREE_VISIT_HOST_VA, thisPtr: m.ecx });
  }],
  // ---- successor 0x831fdb..0x83201a ----
  // 0x831fdb mov eax,[esi+8] / 0x831fde cmp byte [eax+0xd],0 / 0x831fe2
  // je 0x832004 (right REAL -> descend)
  [0x00831fdb, (m) => { m.eax = loadU32v(m.view, (m.esi + HUD_8318A0_TREE_NODE_RIGHT_OFS) >>> 0); }],
  [0x00831fde, (m) => { m.zf = loadU8v(m.view, (m.eax + HUD_8318A0_TREE_NODE_ISNIL_OFS) >>> 0) === 0; }],
  [0x00831fe2, (m) => (m.zf ? 0x00832004 : undefined)],
  // 0x831fe4 mov eax,[esi+4] / 0x831fe7 cmp byte [eax+0xd],0 / 0x831feb
  // jne 0x832000 (parent NIL -> result parent) -- climb entry
  [0x00831fe4, (m) => { m.eax = loadU32v(m.view, (m.esi + HUD_8318A0_TREE_NODE_PARENT_OFS) >>> 0); }],
  [0x00831fe7, (m) => { m.zf = loadU8v(m.view, (m.eax + HUD_8318A0_TREE_NODE_ISNIL_OFS) >>> 0) === 0; }],
  [0x00831feb, (m) => (m.zf ? undefined : 0x00832000)],
  // 0x831ff0 cmp esi,[eax+8] / 0x831ff3 jne 0x832000 (climb loop)
  [0x00831ff0, (m) => {
    m.zf = (m.esi >>> 0) === (loadU32v(m.view, (m.eax + HUD_8318A0_TREE_NODE_RIGHT_OFS) >>> 0) >>> 0);
  }],
  [0x00831ff3, (m) => (m.zf ? undefined : 0x00832000)],
  // 0x831ff5 mov esi,eax / 0x831ff7 mov eax,[eax+4]
  [0x00831ff5, (m) => { m.esi = m.eax; }],
  [0x00831ff7, (m) => { m.eax = loadU32v(m.view, (m.eax + HUD_8318A0_TREE_NODE_PARENT_OFS) >>> 0); }],
  // 0x831ffa cmp byte [eax+0xd],0 / 0x831ffe je 0x831ff0 (parent REAL ->
  // keep climbing)
  [0x00831ffa, (m) => { m.zf = loadU8v(m.view, (m.eax + HUD_8318A0_TREE_NODE_ISNIL_OFS) >>> 0) === 0; }],
  [0x00831ffe, (m) => (m.zf ? 0x00831ff0 : undefined)],
  // 0x832000 mov esi,eax / 0x832002 jmp 0x83201c (climb result)
  [0x00832000, (m) => { m.esi = m.eax; }],
  [0x00832002, (m) => 0x0083201c],
  // ---- descend 0x832004..0x83201a ----
  // 0x832004 mov esi,eax / 0x832006 mov ecx,[esi] / 0x832008 cmp byte
  // [ecx+0xd],0 / 0x83200c jne 0x83201c (left NIL -> done)
  [0x00832004, (m) => { m.esi = m.eax; }],
  [0x00832006, (m) => { m.ecx = loadU32v(m.view, m.esi); }],
  [0x00832008, (m) => { m.zf = loadU8v(m.view, (m.ecx + HUD_8318A0_TREE_NODE_ISNIL_OFS) >>> 0) === 0; }],
  [0x0083200c, (m) => (m.zf ? undefined : 0x0083201c)],
  // 0x832010 mov eax,[ecx] / 0x832012 mov esi,ecx / 0x832014 mov ecx,eax
  [0x00832010, (m) => { m.eax = loadU32v(m.view, m.ecx); }],
  [0x00832012, (m) => { m.esi = m.ecx; }],
  [0x00832014, (m) => { m.ecx = m.eax; }],
  // 0x832016 cmp byte [eax+0xd],0 / 0x83201a je 0x832010 (left REAL ->
  // keep descending)
  [0x00832016, (m) => { m.zf = loadU8v(m.view, (m.eax + HUD_8318A0_TREE_NODE_ISNIL_OFS) >>> 0) === 0; }],
  [0x0083201a, (m) => (m.zf ? 0x00832010 : undefined)],
  // 0x83201c cmp esi,[ebx+0x224] / 0x832022 jne 0x831fc2 (termination)
  [0x0083201c, (m) => {
    m.zf = (m.esi >>> 0) ===
           (loadU32v(m.view, (m.thisBase + HUD_8318A0_TREE_HEAD_OFF) >>> 0) >>> 0);
  }],
  [0x00832022, (m) => (m.zf ? 0x00832024 : 0x00831fc2)],
  // 0x832024 = rewrite gate (v20 landed): walk ended (or empty).
  [0x00832024, (m) => 0x7fffffff],
];

const HUD_TREE_WALK_END = 0x7fffffff;

function traceHudTreeWalk(view, thisBase) {
  const m = {
    view,
    thisBase: thisBase >>> 0,
    esi: 0, eax: 0, ecx: 0, zf: false,
    events: [], calls: [],
    nodeCount: 0, visitGatedCount: 0, hostCallCount: 0,
    prepHostNeeded: 0, truncated: false, terminated: false,
  };
  m.pushEvent = (kind, payload) => {
    if (m.events.length < HUD_8318A0_TREE_WALK_EVENT_CAP) {
      m.events.push(hudTreeWalkWord(kind, payload));
    } else {
      m.truncated = true;
    }
  };

  let i = 0;
  let guard = 0;
  while (i < TRACE_HUD_TREE_WALK.length) {
    if (++guard > 4096) throw new Error("traceHudTreeWalk did not terminate");
    const [va, handler] = TRACE_HUD_TREE_WALK[i];
    if (va === 0x00831fc2) {
      if (m.nodeCount >= HUD_8318A0_TREE_WALK_NODE_CAP) {
        m.truncated = true;
        break;
      }
    }
    const next = handler(m);
    if (next === undefined) { i += 1; continue; }
    if (next === HUD_TREE_WALK_END) break;
    const target = TRACE_HUD_TREE_WALK.findIndex(([tva]) => tva === next);
    if (target < 0) {
      throw new Error(`traceHudTreeWalk bad jump target 0x${next.toString(16)}`);
    }
    i = target;
  }
  if (m.terminated === false && m.nodeCount > 0 && m.truncated === false) {
    // reached 0x832024 via the loop-back fallthrough: successor == head.
    m.terminated = true;
  }
  return m;
}

/**
 * WALK-ORDER plan (PE 0x831fa1..0x832022): visit order = the NODE events
 * in order; per-node visit gate + host pair = HOST_A/HOST_B events; prep
 * edge when slow_path. `terminated` mirrors the C++ field: the successor
 * returned head. Empty container -> prep only (the PE's 0x831fc0 je).
 * field_238 == 0 -> nothing at all (the PE's 0x831fa8 je).
 */
export function hud8318a0TreeWalkPlan(view, thisBase) {
  const m = traceHudTreeWalk(view, thisBase);
  const slow = loadU32v(view, (thisBase >>> 0) + HUD_8318A0_FIELD_238_OFF) !== 0;
  if (!slow) {
    /* closed gate: the C++ export returns before reading [this+0x224]. */
    return {
      slowPath: 0,
      prepHostNeeded: 0,
      prepReceiver: 0,
      headAddr: 0,
      firstNode: 0,
      walkActive: 0,
      nodeCount: 0,
      visitGatedCount: 0,
      hostCallCount: 0,
      terminated: 0,
      truncated: 0,
      eventCount: 0,
      events: [],
    };
  }
  const head = loadU32v(view, (thisBase >>> 0) + HUD_8318A0_TREE_HEAD_OFF);
  const first = loadU32v(view, head);
  return {
    slowPath: 1,
    prepHostNeeded: m.prepHostNeeded,
    prepReceiver: ((thisBase >>> 0) + HUD_8318A0_TREE_WALK_PREP_RECV_OFF) >>> 0,
    headAddr: head,
    firstNode: first,
    walkActive: (first !== head) ? 1 : 0,
    nodeCount: m.nodeCount,
    visitGatedCount: m.visitGatedCount,
    hostCallCount: m.hostCallCount,
    terminated: m.terminated ? 1 : 0,
    truncated: m.truncated ? 1 : 0,
    eventCount: m.events.length,
    events: m.events.slice(),
  };
}

/* ===================== ABI v24: RNG::RandomInt BODY 0x007e9020 ============
   PE-truth from cpu-dump/007e9020.txt (0x7e9020..0x7e9075, ret 4), notes
   hud-v24-rng/NOTES.md. SEPARATE xorshift32 LCG — NOT the room MT19937
   0x006eef60. Receiver = 16-byte {seed, s1, s2, s3}; shifts CL-masked.
     seed==0  -> CRT fatal (log 0xa112c0 "RNG Seed is zero!" @0xb6bf54,
                 level 0x10, int3 @0x7e9041) — host edge, no advance.
     else     -> x = x^(x>>s1); x = x^(x<<s2); x = x^(x>>s3)
                 state[0] stored BEFORE the max test (always advances).
                 value = (max==0) ? 0 : x % max (UNSIGNED). */
export const HUD_RNG_7E9020_VA = 0x007e9020;
export const HUD_RNG_7E9020_RET_VA_MAX0 = 0x007e906a;
export const HUD_RNG_7E9020_RET_VA_MOD = 0x007e9075;
export const HUD_RNG_7E9020_FATAL_LOG_VA = 0x00a112c0;
export const HUD_RNG_7E9020_FATAL_STR_VA = 0x00b6bf54;
export const HUD_RNG_7E9020_FATAL_LEVEL = 0x10;
export const HUD_RNG_7E9020_FATAL_INT3_VA = 0x007e9041;
export const HUD_RNG_7E9020_STATE_BYTES = 0x10;
export const HUD_RNG_7E9020_SEED_OFF = 0x0;
export const HUD_RNG_7E9020_SHIFT1_OFF = 0x4;
export const HUD_RNG_7E9020_SHIFT2_OFF = 0x8;
export const HUD_RNG_7E9020_SHIFT3_OFF = 0xc;
export const HUD_RNG_7E9020_COUNT4B_SHIFT1 = 0x2;
export const HUD_RNG_7E9020_COUNT4B_SHIFT2 = 0x7;
export const HUD_RNG_7E9020_COUNT4B_SHIFT3 = 0x19;
export const HUD_RNG_7E9020_COUNT4B_MAX = 0xbd;

/* 0x7e9028 test edx,edx / 0x7e902a jne 0x7e9042 — FULL-DWORD seed gate:
   0x100 must NOT be a fatal (only seed==0 logs + int3s). */
export function hudRng7e9020SeedZero(seed) {
  return u32(seed) === 0 ? 1 : 0;
}

/* 0x7e9042..0x7e9060 RNG::Next core: shifts from state[1..3] used as
   `cl` (x86 masks to 5 bits -> &31 in-body). u32 wrap throughout. */
export function hudRng7e9020Xorshift(seed, shift1, shift2, shift3) {
  const s = u32(seed);
  const a = u32((s >>> (shift1 & 31)) ^ s);
  const b = u32((a << (shift2 & 31)) ^ a);
  return u32((b >>> (shift3 & 31)) ^ b);
}

/* Full body law 0x7e9020..0x7e9075. Returns {value, seedAfter, fatal}. */
export function hudRng7e9020RandomInt(seed, shift1, shift2, shift3, max) {
  if (hudRng7e9020SeedZero(seed) === 1) {
    return { value: 0, seedAfter: 0, fatal: 1 };
  }
  const next = hudRng7e9020Xorshift(seed, shift1, shift2, shift3);
  /* 0x7e9060 store BEFORE 0x7e9062 max test: max==0 still advances. */
  if (u32(max) === 0) {
    return { value: 0, seedAfter: next, fatal: 0 };
  }
  /* 0x7e906d xor edx,edx ; div ecx ; eax = edx — UNSIGNED remainder. */
  return { value: u32(next % u32(max)), seedAfter: next, fatal: 0 };
}

export function hudRng7e9020Va() { return HUD_RNG_7E9020_VA; }
export function hudRng7e9020RetVaMax0() { return HUD_RNG_7E9020_RET_VA_MAX0; }
export function hudRng7e9020RetVaMod() { return HUD_RNG_7E9020_RET_VA_MOD; }
export function hudRng7e9020FatalLogVa() { return HUD_RNG_7E9020_FATAL_LOG_VA; }
export function hudRng7e9020FatalStrVa() { return HUD_RNG_7E9020_FATAL_STR_VA; }
export function hudRng7e9020FatalLevel() { return HUD_RNG_7E9020_FATAL_LEVEL; }
export function hudRng7e9020FatalInt3Va() { return HUD_RNG_7E9020_FATAL_INT3_VA; }
export function hudRng7e9020StateBytes() { return HUD_RNG_7E9020_STATE_BYTES; }
export function hudRng7e9020SeedOff() { return HUD_RNG_7E9020_SEED_OFF; }
export function hudRng7e9020Shift1Off() { return HUD_RNG_7E9020_SHIFT1_OFF; }
export function hudRng7e9020Shift2Off() { return HUD_RNG_7E9020_SHIFT2_OFF; }
export function hudRng7e9020Shift3Off() { return HUD_RNG_7E9020_SHIFT3_OFF; }
export function hudRng7e9020Count4bShift1() { return HUD_RNG_7E9020_COUNT4B_SHIFT1; }
export function hudRng7e9020Count4bShift2() { return HUD_RNG_7E9020_COUNT4B_SHIFT2; }
export function hudRng7e9020Count4bShift3() { return HUD_RNG_7E9020_COUNT4B_SHIFT3; }
export function hudRng7e9020Count4bMax() { return HUD_RNG_7E9020_COUNT4B_MAX; }

/* ============ ABI v24: HasCollectible 0x007706e0 QUERY accept gate =========
   + composed redirect WALK (notes hud-v24-has-collectible/NOTES.md).
   The query is invoked cdecl 0x1b7 / 0 from the process-input record
   0x009be6b0; the merge accept (0x009be719 test bl,bl / 0x009be71f test
   al,al) is bl != 0 && LOW-BYTE hit. The walk (0x77070d..0x770758)
   loops: entry config sample; config==0 -> FALSE (0x77075a); field_2c!=1
   -> interior (0x77076f); parent [p+0x3bc] qualifies (+0x28==1) else
   GetPlayer(0) sample (null -> interior, edi UNCHANGED); adopt; refetch
   config sample; null -> FALSE; loop. Samples 16 bytes/entry
   {config_known, config_result, gp_known, gp_result}. C++ is a branch
   loop; this JS oracle is a PC-walk TRACE over the exact-VA table — a
   wrong branch cannot be reproduced by the other. */
export const HAS_COLLECTIBLE_QUERY_ARG_ID = 0x1b7;
export const HAS_COLLECTIBLE_QUERY_ARG_IGNORE = 0x0;
export const HAS_COLLECTIBLE_ACCEPT_VA_BL = 0x009be719;
export const HAS_COLLECTIBLE_ACCEPT_VA_AL = 0x009be71f;
export const HAS_COLLECTIBLE_PARENT_FLAG_OFF = 0x28;
export const HAS_COLLECTIBLE_WALK_VA_CONFIG_TEST = 0x00770712;
export const HAS_COLLECTIBLE_WALK_VA_F2C_GATE = 0x00770716;
export const HAS_COLLECTIBLE_WALK_VA_PARENT_PROBE = 0x0077071c;
export const HAS_COLLECTIBLE_WALK_VA_PARENT_TEST = 0x00770726;
export const HAS_COLLECTIBLE_WALK_VA_GETPLAYER = 0x0077072c;
export const HAS_COLLECTIBLE_WALK_VA_GETPLAYER_TEST = 0x00770739;
export const HAS_COLLECTIBLE_WALK_VA_ADOPT = 0x0077073d;
export const HAS_COLLECTIBLE_WALK_VA_CONFIG_REFETCH = 0x0077074c;
export const HAS_COLLECTIBLE_WALK_VA_CONFIG_LOOP = 0x00770756;
export const HAS_COLLECTIBLE_WALK_VA_FALSE = 0x0077075a;
export const HAS_COLLECTIBLE_WALK_VA_INTERIOR = 0x0077076f;
export const HAS_COLLECTIBLE_WALK_STATUS_INTERIOR = 0;
export const HAS_COLLECTIBLE_WALK_STATUS_CONFIG_NULL = 1;
export const HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL = 2;
export const HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED = 3;
export const HAS_COLLECTIBLE_WALK_STATUS_TRUNCATED = 4;
export const HAS_COLLECTIBLE_WALK_ITER_CAP = 16;
export const HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE = 16;

export function hasCollectibleQueryHit(queryResult) {
  /* 0x009be71f test al,al ; jne epilogue-B — LOW-BYTE accept. */
  return (u32(queryResult) & 0xff) !== 0 ? 1 : 0;
}

export function hasCollectibleAcceptGate(bl, queryResult) {
  /* 0x009be719 test bl,bl ; je skip-store ; 0x009be71f test al,al — both
     LOW-BYTE tests. */
  if ((u32(bl) & 0xff) === 0) return 0;
  return (u32(queryResult) & 0xff) !== 0 ? 1 : 0;
}

const HAS_COLLECTIBLE_WALK_END_INTERIOR = Symbol("hcWalkInterior");
const HAS_COLLECTIBLE_WALK_END_GP_NULL = Symbol("hcWalkGpNull");
const HAS_COLLECTIBLE_WALK_END_CONFIG_NULL = Symbol("hcWalkConfigNull");
const HAS_COLLECTIBLE_WALK_END_HOST = Symbol("hcWalkHost");
const HAS_COLLECTIBLE_WALK_END_TRUNCATED = Symbol("hcWalkTruncated");

const HAS_COLLECTIBLE_WALK_TRACE = [
  /* 0x770712 test esi,esi ; je 0x77075a. */
  [HAS_COLLECTIBLE_WALK_VA_CONFIG_TEST, (m) => {
    if (m.config === 0) return HAS_COLLECTIBLE_WALK_END_CONFIG_NULL;
    return HAS_COLLECTIBLE_WALK_VA_F2C_GATE;
  }],
  /* 0x770716 cmp dword [edi+0x2c],1 ; jne 0x77076f. */
  [HAS_COLLECTIBLE_WALK_VA_F2C_GATE, (m) => {
    if (loadU32v(m.view, m.edi + HAS_COLLECTIBLE_PLAYER_FIELD_2C_OFF) !== 1) {
      return HAS_COLLECTIBLE_WALK_END_INTERIOR;
    }
    return HAS_COLLECTIBLE_WALK_VA_PARENT_PROBE;
  }],
  /* 0x77071c mov eax,[edi+0x3bc]. */
  [HAS_COLLECTIBLE_WALK_VA_PARENT_PROBE, (m) => {
    m.eax = loadU32v(m.view, m.edi + HAS_COLLECTIBLE_PARENT_PTR_OFF);
    return HAS_COLLECTIBLE_WALK_VA_PARENT_TEST;
  }],
  /* 0x770726 cmp dword [eax+0x28],1 ; je 0x77073d. */
  [HAS_COLLECTIBLE_WALK_VA_PARENT_TEST, (m) => {
    if (m.eax !== 0 &&
        loadU32v(m.view, m.eax + HAS_COLLECTIBLE_PARENT_FLAG_OFF) === 1) {
      return HAS_COLLECTIBLE_WALK_VA_ADOPT;
    }
    return HAS_COLLECTIBLE_WALK_VA_GETPLAYER;
  }],
  /* 0x77072c call GetPlayer(0) — host edge, sampled. */
  [HAS_COLLECTIBLE_WALK_VA_GETPLAYER, (m) => {
    if (m.idx >= m.samplesCount) {
      m.hostNeeded = 1;
      return HAS_COLLECTIBLE_WALK_END_HOST;
    }
    m.edges += 1;
    const base = m.samplesAddr + m.idx * HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE;
    const known = loadU32v(m.view, base + 8);
    m.eax = loadU32v(m.view, base + 12);
    if (known === 0) {
      m.hostNeeded = 1;
      return HAS_COLLECTIBLE_WALK_END_HOST;
    }
    return HAS_COLLECTIBLE_WALK_VA_GETPLAYER_TEST;
  }],
  /* 0x770739 test eax,eax ; je 0x77076f — edi UNCHANGED. */
  [HAS_COLLECTIBLE_WALK_VA_GETPLAYER_TEST, (m) => {
    if (m.eax === 0) return HAS_COLLECTIBLE_WALK_END_GP_NULL;
    return HAS_COLLECTIBLE_WALK_VA_ADOPT;
  }],
  /* 0x77073d mov edi,eax — adopt. */
  [HAS_COLLECTIBLE_WALK_VA_ADOPT, (m) => {
    m.edi = m.eax;
    m.iterations += 1;
    if (m.iterations >= m.iterCap) {
      m.hostNeeded = 1;
      return HAS_COLLECTIBLE_WALK_END_TRUNCATED;
    }
    return HAS_COLLECTIBLE_WALK_VA_CONFIG_REFETCH;
  }],
  /* 0x77074c call GetCollectible(new edi, id) — host edge, sampled. */
  [HAS_COLLECTIBLE_WALK_VA_CONFIG_REFETCH, (m) => {
    m.idx += 1;
    if (m.idx >= m.samplesCount) {
      m.hostNeeded = 1;
      return HAS_COLLECTIBLE_WALK_END_HOST;
    }
    m.edges += 1;
    const base = m.samplesAddr + m.idx * HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE;
    const known = loadU32v(m.view, base);
    m.config = loadU32v(m.view, base + 4);
    if (known === 0) {
      m.hostNeeded = 1;
      return HAS_COLLECTIBLE_WALK_END_HOST;
    }
    return HAS_COLLECTIBLE_WALK_VA_CONFIG_LOOP;
  }],
  /* 0x770756 test esi,esi ; jne 0x770716. */
  [HAS_COLLECTIBLE_WALK_VA_CONFIG_LOOP, (m) => {
    if (m.config === 0) return HAS_COLLECTIBLE_WALK_END_CONFIG_NULL;
    return HAS_COLLECTIBLE_WALK_VA_F2C_GATE;
  }],
];

const HAS_COLLECTIBLE_WALK_END_STATUS = {
  [HAS_COLLECTIBLE_WALK_END_INTERIOR]: HAS_COLLECTIBLE_WALK_STATUS_INTERIOR,
  [HAS_COLLECTIBLE_WALK_END_GP_NULL]: HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL,
  [HAS_COLLECTIBLE_WALK_END_CONFIG_NULL]: HAS_COLLECTIBLE_WALK_STATUS_CONFIG_NULL,
  [HAS_COLLECTIBLE_WALK_END_HOST]: HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED,
  [HAS_COLLECTIBLE_WALK_END_TRUNCATED]: HAS_COLLECTIBLE_WALK_STATUS_TRUNCATED,
};

/**
 * Composed redirect walk plan (PE 0x77070d..0x770758). Entry consumes the
 * iteration-0 config sample; each adoption refetches the next config
 * sample. GetCollectible (0x72fd10) and GetPlayer(0) (0x417870) results
 * come from the caller's samples table (16 bytes/entry
 * {config_known, config_result, gp_known, gp_result}). Statuses and the
 * config_ptr rule (0 unless the interior is reached with a known config)
 * match the C++ export field-for-field.
 */
export function hasCollectibleWalkPlan(view, playerPtr, samplesAddr, samplesCount, iterCap) {
  const m = {
    view,
    edi: u32(playerPtr), eax: 0, config: 0,
    samplesAddr: u32(samplesAddr), samplesCount: u32(samplesCount),
    iterCap: i32(iterCap),
    idx: 0, iterations: 0, edges: 0, hostNeeded: 0,
  };
  /* entry config sample (0x77070d GetCollectible). */
  if (m.idx >= m.samplesCount) {
    m.hostNeeded = 1;
    return packHasCollectibleWalk(m, HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED);
  }
  m.edges += 1;
  const base = m.samplesAddr + m.idx * HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE;
  const known = loadU32v(m.view, base);
  m.config = loadU32v(m.view, base + 4);
  if (known === 0) {
    m.hostNeeded = 1;
    return packHasCollectibleWalk(m, HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED);
  }
  let i = 0;
  let guard = 0;
  let status = HAS_COLLECTIBLE_WALK_STATUS_INTERIOR;
  while (i < HAS_COLLECTIBLE_WALK_TRACE.length) {
    if (++guard > 4096) throw new Error("hasCollectibleWalkPlan did not terminate");
    const [va, handler] = HAS_COLLECTIBLE_WALK_TRACE[i];
    const next = handler(m);
    if (next === undefined) { i += 1; continue; }
    if (typeof next === "symbol") {
      status = HAS_COLLECTIBLE_WALK_END_STATUS[next];
      break;
    }
    const target = HAS_COLLECTIBLE_WALK_TRACE.findIndex(([tva]) => tva === next);
    if (target < 0) throw new Error(`hasCollectibleWalkPlan bad jump target 0x${next.toString(16)}`);
    i = target;
  }
  return packHasCollectibleWalk(m, status);
}

function packHasCollectibleWalk(m, status) {
  let configPtr = 0;
  if (status === HAS_COLLECTIBLE_WALK_STATUS_INTERIOR ||
      status === HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL) {
    configPtr = m.config;
  }
  return {
    status,
    resolvedPlayer: m.edi,
    configPtr,
    iterations: m.iterations,
    hostEdges: m.edges,
    hostNeeded: m.hostNeeded ? 1 : 0,
  };
}

/* ============ ABI v25: HasCollectible 0x007706e0 RNG-path PREPs ==========
   (notes hud-v25-rng-preps/NOTES.md). Region A (0x770a7e..0x770ad9):
   countA = 0x7db860(player) SIGNED-gated (jle 0x770a88: (int32)countA
   <= 8 closes), extra = 0x436140(&g_game->[0x1bb84]), countB =
   0x7db860(player) RE-CALLED (0x770a9f — never folded from countA),
   seed = (u32)(countB+extra) > 1u ? sum : 1 (0x770abc cmova UNSIGNED,
   32-bit wrap add), draw = RandomInt(&recv{seed,1,0x1b,0x1b}, 6) [the
   v24 law], hit iff id == table[draw] (0xb6bcd0 = {0x131,3,0x23a,
   0x101,0x254,0xe0}, full-dword cmp 0x770ad2) -> TRUE 0x770c29; miss
   -> 0x770ae2 tail (0x771200 host). seed >= 1 by the cmova clamp so
   the v24 law can never fatal on this path. Region B (0x770915..
   0x770979): id==9 arm — 0x771550(_,0x5d,0) LOW-BYTE gate (0x770925
   test al,al), seed = (p18300_4 != 0) ? p18300_4->[+0x58] : 0 (0x77093b
   test eax,eax), draw = RandomInt(&recv{seed,1,0xb,6}, 0x64), hit iff
   (u32)draw < 0x21 (0x770967 jb strict), else TRUE iff (int32)
   Game+0x26614 >= 2 (0x770979 jl); seed==0 -> the PE RNG call int3s
   (FATAL, no compare runs). */

export const HUD_770A7E_VA = 0x00770a7e;
export const HUD_770A7E_VA_COUNT_A_CALL = 0x00770a80;
export const HUD_770A7E_VA_OPEN_CMP = 0x00770a85;
export const HUD_770A7E_VA_OPEN_JLE = 0x00770a88;
export const HUD_770A7E_VA_EXTRA_CALL = 0x00770a96;
export const HUD_770A7E_VA_COUNT_B_CALL = 0x00770a9f;
export const HUD_770A7E_VA_SEED_ADD = 0x00770aac;
export const HUD_770A7E_VA_CMOVA = 0x00770abc;
export const HUD_770A7E_VA_RNG_CALL = 0x00770acd;
export const HUD_770A7E_VA_TABLE_CMP = 0x00770ad2;
export const HUD_770A7E_VA_TABLE_JE = 0x00770ad9;
export const HUD_770A7E_VA_MISS = 0x00770adf;
export const HUD_770A7E_VA_TAIL = 0x00770ae2;
export const HUD_770A7E_VA_TRUE = 0x00770c29;
export const HUD_770A7E_HOST_VA_COUNT = 0x007db860;
export const HUD_770A7E_HOST_VA_EXTRA = 0x00436140;
export const HUD_770A7E_GAME_GLOBAL = 0x00c71678;
export const HUD_770A7E_GAME_EXTRA_OFF = 0x1bb84;
export const HUD_770A7E_SHIFTS_CONST_VA = 0x00b1f528;
export const HUD_770A7E_SHIFT3_CONST_VA = 0x00b1f530;
export const HUD_770A7E_SHIFT1 = 1;
export const HUD_770A7E_SHIFT2 = 0x1b;
export const HUD_770A7E_SHIFT3 = 0x1b;
export const HUD_770A7E_MAX = 6;
export const HUD_770A7E_CMOVA_MIN = 1;
export const HUD_770A7E_OPEN_GT = 8;
export const HUD_770A7E_TABLE_VA = 0x00b6bcd0;
export const HUD_770A7E_TABLE_SIZE = 6;
export const HUD_770A7E_TABLE = [0x131, 0x3, 0x23a, 0x101, 0x254, 0xe0];
export const HUD_770A7E_TABLE_OOB = 0xffffffff;
export const HUD_770A7E_STATUS_CLOSED = 0;
export const HUD_770A7E_STATUS_HIT = 1;
export const HUD_770A7E_STATUS_MISS = 2;
export const HUD_770915_VA_ARM = 0x00770915;
export const HUD_770915_VA_ID_JNE = 0x00770918;
export const HUD_770915_VA_1550_CALL = 0x00770920;
export const HUD_770915_VA_1550_TEST = 0x00770925;
export const HUD_770915_VA_1550_FALSE_CHAIN = 0x00770927;
export const HUD_770915_VA_SEED_LOAD = 0x0077092d;
export const HUD_770915_VA_SEED_JE = 0x0077093d;
export const HUD_770915_VA_PREP = 0x00770942;
export const HUD_770915_VA_SHIFT3_LOAD = 0x00770950;
export const HUD_770915_VA_RNG_CALL = 0x0077095f;
export const HUD_770915_VA_HIT_CMP = 0x00770964;
export const HUD_770915_VA_HIT_JB = 0x00770967;
export const HUD_770915_VA_GATE2_LOAD = 0x0077096d;
export const HUD_770915_VA_GATE2_CMP = 0x00770972;
export const HUD_770915_VA_GATE2_JL = 0x00770979;
export const HUD_770915_VA_TRUE = 0x00770c29;
export const HUD_770915_VA_CHAIN = 0x00770a44;
export const HUD_770915_HOST_VA_1550 = 0x00771550;
export const HUD_770915_ARM_ID = 9;
export const HUD_770915_ARG_ID = 0x5d;
export const HUD_770915_ARG_FLAG = 0;
export const HUD_770915_GAME_GLOBAL = 0x00c71678;
export const HUD_770915_GAME_P18300_OFF = 0x18300;
export const HUD_770915_GAME_P18300_P4_OFF = 4;
export const HUD_770915_GAME_P18300_P4_58_OFF = 0x58;
export const HUD_770915_GAME_26614_OFF = 0x26614;
export const HUD_770915_SHIFTS_CONST_VA = 0x00b1f4f8;
export const HUD_770915_SHIFT3_CONST_VA = 0x00b1f500;
export const HUD_770915_SHIFT1 = 1;
export const HUD_770915_SHIFT2 = 0xb;
export const HUD_770915_SHIFT3 = 6;
export const HUD_770915_MAX = 0x64;
export const HUD_770915_HIT_THRESHOLD = 0x21;
export const HUD_770915_GATE2_THRESHOLD = 2;
export const HUD_770915_STATUS_CLOSED = 0;
export const HUD_770915_STATUS_H1550_FALSE = 1;
export const HUD_770915_STATUS_FATAL = 2;
export const HUD_770915_STATUS_HIT = 3;
export const HUD_770915_STATUS_MISS_TRUE = 4;
export const HUD_770915_STATUS_MISS_CHAIN = 5;

/* 0x770a85 cmp eax,8 ; 0x770a88 jle 0x770ae2 — SIGNED: a full-word -1
   (0xffffffff) CLOSES the path; an unsigned test would open it. */
export function hud770a7eOpen(countA) {
  return (i32(countA) > HUD_770A7E_OPEN_GT) ? 1 : 0;
}

/* 0x770aac add (32-bit wrap) ; 0x770abc cmova — UNSIGNED above:
   seed = sum > 1u ? sum : 1. 0xffffffff keeps 0xffffffff. */
export function hud770a7eSeed(countB, extra) {
  const sum = u32(u32(countB) + u32(extra));
  return sum > HUD_770A7E_CMOVA_MIN ? sum : 1;
}

export function hud770a7eDraw(countB, extra) {
  const seed = hud770a7eSeed(countB, extra);
  const d = hudRng7e9020RandomInt(seed, HUD_770A7E_SHIFT1,
    HUD_770A7E_SHIFT2, HUD_770A7E_SHIFT3, HUD_770A7E_MAX);
  return { seed, draw: d.value };
}

export function hud770a7eTableEntry(index) {
  const i = u32(index);
  if (i < HUD_770A7E_TABLE_SIZE) return HUD_770A7E_TABLE[i];
  return HUD_770A7E_TABLE_OOB;
}

export function hud770a7ePlan(id, countA, countB, extra) {
  if (hud770a7eOpen(countA) === 0) {
    return {
      status: HUD_770A7E_STATUS_CLOSED, seed: 0, draw: 0, hostEdges: 1,
    };
  }
  const d = hud770a7eDraw(countB, extra);
  const hit = u32(id) === hud770a7eTableEntry(d.draw);
  return {
    status: hit ? HUD_770A7E_STATUS_HIT : HUD_770A7E_STATUS_MISS,
    seed: d.seed,
    draw: d.draw,
    hostEdges: 3,
  };
}

/* 0x770915 cmp ebx,9 (full dword) ; 0x770925 test al,al — the 0x771550
   bool return is accepted as a LOW BYTE (0x100 is false). */
export function hud770915Open(id, h1550Result) {
  if (u32(id) !== HUD_770915_ARM_ID) return 0;
  return (u32(h1550Result) & 0xff) !== 0 ? 1 : 0;
}

/* 0x77093b test eax,eax ; 0x77093d je 0x770942 — [+0x58] read only when
   p18300_4 != 0; null leaves seed 0 (the PE RNG then int3s: FATAL). */
export function hud770915Seed(p18300_4, p18300_4_58) {
  return u32(p18300_4) !== 0 ? u32(p18300_4_58) : 0;
}

export function hud770915Draw(seed) {
  const d = hudRng7e9020RandomInt(u32(seed), HUD_770915_SHIFT1,
    HUD_770915_SHIFT2, HUD_770915_SHIFT3, HUD_770915_MAX);
  return { draw: d.value, fatal: d.fatal };
}

/* 0x770964 cmp eax,0x21 ; 0x770967 jb — UNSIGNED strict below:
   draw 0x21 is a miss, 0x20 is a hit. */
export function hud770915Hit(draw) {
  return u32(draw) < HUD_770915_HIT_THRESHOLD ? 1 : 0;
}

/* 0x770972 cmp [eax+0x26614],2 ; 0x770979 jl — SIGNED: 0xffffffff (-1)
   CHAINS; >= 2 is the TRUE epilogue. */
export function hud770915TailGate(game26614) {
  return i32(game26614) >= HUD_770915_GATE2_THRESHOLD ? 1 : 0;
}

export function hud770915Plan(id, h1550Result, p18300_4, p18300_4_58,
                              game26614) {
  if (hud770915Open(id, h1550Result) === 0) {
    return {
      status: u32(id) === HUD_770915_ARM_ID
        ? HUD_770915_STATUS_H1550_FALSE : HUD_770915_STATUS_CLOSED,
      seed: 0, draw: 0, hitDraw: 0, tailTrue: 0, result: 0,
    };
  }
  const seed = hud770915Seed(p18300_4, p18300_4_58);
  const d = hud770915Draw(seed);
  if (d.fatal !== 0) {
    return { status: HUD_770915_STATUS_FATAL, seed, draw: 0,
      hitDraw: 0, tailTrue: 0, result: 0 };
  }
  const hitDraw = hud770915Hit(d.draw);
  const tailTrue = hud770915TailGate(game26614);
  let status, result;
  if (hitDraw !== 0) {
    status = HUD_770915_STATUS_HIT;
    result = 1;
  } else if (tailTrue !== 0) {
    status = HUD_770915_STATUS_MISS_TRUE;
    result = 1;
  } else {
    status = HUD_770915_STATUS_MISS_CHAIN;
    result = 0;
  }
  return {
    status, seed, draw: d.draw, hitDraw, tailTrue, result,
  };
}

/* ============ ABI v26: HasCollectible 0x007706e0 tail true-chain ==========
   (notes hud-v26-next/NOTES.md). Window after the 0x770ae2 0x771200
   tail gate. PURE scalar gate 0x770ba1..0x770bad: (p_1fb8 != 0) &&
   (p_1fb8 == id), FULL-dword equality (a null p_1fb8 skips, so
   p_1fb8 0 with id 0 is FALSE). Sampled tail-gate DECISION laws:
   0x170/0x202c byte gates (masked low byte), 0x1f84 dword gate (full
   word), 0x557b00 element +0x14 SIGNED jg, 0x9e0650 SIGNED jg,
   0x9305f0 LOW-BYTE (id arm), 0x7911c0 SIGNED jns, 0xbf recursion
   LOW-BYTE + [p+0x1390] eq, 0x1e8 LOW-BYTE + [p+0x1388] eq. Signed
   senses use i32() (wide cases 0xffffffff covered). The 0x770c3e
   counter epilogue is the next frontier. */

export const HUD_770BA1_VA_GATE = 0x00770ba1;
export const HUD_770BA1_VA_TEST = 0x00770ba7;
export const HUD_770BA1_VA_JE = 0x00770ba9;
export const HUD_770BA1_VA_CMP = 0x00770bab;
export const HUD_770BA1_VA_JE_TRUE = 0x00770bad;
export const HUD_770BA1_VA_JG_9E0650 = 0x00770bbd;
export const HUD_770BA1_VA_JNS_7911C0 = 0x00770be9;
export const HUD_770BA1_VA_JG_557B00 = 0x00770b9b;
export const HUD_770BA1_VA_CMP_557B00 = 0x00770b95;
export const HUD_770BA1_VA_JE_1390 = 0x00770c0b;
export const HUD_770BA1_VA_CMP_1390 = 0x00770c05;
export const HUD_770BA1_VA_JE_1388 = 0x00770c27;
export const HUD_770BA1_VA_CMP_1388 = 0x00770c21;
export const HUD_770BA1_VA_TEST_9305F0 = 0x00770bdb;
export const HUD_770BA1_VA_TEST_REC = 0x00770c01;
export const HUD_770BA1_VA_TEST_1E8 = 0x00770c1d;
export const HUD_770BA1_VA_GATE_170 = 0x00770b0c;
export const HUD_770BA1_VA_GATE_202C = 0x00770b45;
export const HUD_770BA1_VA_GATE_1F84 = 0x00770b70;
export const HUD_770BA1_VA_TRUE = 0x00770c29;
export const HUD_770BA1_VA_COUNTER_EPILOGUE = 0x00770c3e;
export const HUD_770BA1_OFF_1FB8 = 0x1fb8;
export const HUD_770BA1_OFF_170 = 0x170;
export const HUD_770BA1_OFF_202C = 0x202c;
export const HUD_770BA1_OFF_1F84 = 0x1f84;
export const HUD_770BA1_OFF_1F80 = 0x1f80;
export const HUD_770BA1_OFF_1FC8 = 0x1fc8;
export const HUD_770BA1_OFF_1508 = 0x1508;
export const HUD_770BA1_OFF_1390 = 0x1390;
export const HUD_770BA1_OFF_1388 = 0x1388;
export const HUD_770BA1_OFF_1E6C = 0x1e6c;
export const HUD_770BA1_ELEM_14_OFF = 0x14;
export const HUD_770BA1_HOST_VA_9E0650 = 0x009e0650;
export const HUD_770BA1_HOST_VA_557B00 = 0x00557b00;
export const HUD_770BA1_HOST_VA_9305F0 = 0x009305f0;
export const HUD_770BA1_HOST_VA_7307B0 = 0x007307b0;
export const HUD_770BA1_HOST_VA_7911C0 = 0x007911c0;
export const HUD_770BA1_HOST_VA_771200 = 0x00771200;
export const HUD_770BA1_REC_ID = 0xbf;
export const HUD_770BA1_ID_1E8 = 0x1e8;
export const HUD_770BA1_REC_FLAG = 0;

/* 0x770ba1..0x770bad — FULL-dword equality behind a full-dword zero
   test: p_1fb8 0 + id 0 is FALSE (0x770ba9 je skips the gate). */
export function hud770ba1ScalarGate(p1fb8, id) {
  const p = u32(p1fb8);
  return (p !== 0) && (p === u32(id)) ? 1 : 0;
}

/* 0x770b0c cmp byte [edi+0x170],0 ; je 0x770b45 — LOW-BYTE. */
export function hud770ba1Gate170(byte170) {
  return (u32(byte170) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770b45 cmp byte [edi+0x202c],0 ; je 0x770b70 — LOW-BYTE. */
export function hud770ba1Gate202c(byte202c) {
  return (u32(byte202c) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770b70 cmp dword [edi+0x1f84],0 ; je 0x770ba1 — FULL dword. */
export function hud770ba1Gate1f84(p1f84) {
  return u32(p1f84) !== 0 ? 1 : 0;
}

/* 0x770b95 cmp dword [eax+0x14],0 ; 0x770b9b jg — SIGNED > 0. */
export function hud770ba1Elem557b00Open(field14) {
  return i32(field14) > 0 ? 1 : 0;
}

/* 0x770bbb test eax,eax ; 0x770bbd jg — SIGNED > 0 (full dword). */
export function hud770ba19e0650Open(hostResult) {
  return i32(hostResult) > 0 ? 1 : 0;
}

/* 0x770bdb test al,al ; 0x770bdd jne — LOW-BYTE (0x100 is false). */
export function hud770ba19305f0Open(hostResult) {
  return (u32(hostResult) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770be7 test eax,eax ; 0x770be9 jns — SIGNED >= 0 (full dword). */
export function hud770ba17911c0Open(hostResult) {
  return i32(hostResult) >= 0 ? 1 : 0;
}

/* 0x770c01 test al,al ; je 0x770c0d — LOW-BYTE (recursive 0xbf). */
export function hud770ba1BfRecursiveOpen(hostResult) {
  return (u32(hostResult) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770c1d test al,al ; je 0x770c3e — LOW-BYTE (0x1e8 arm). */
export function hud770ba19305f01e8Open(hostResult) {
  return (u32(hostResult) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770c05 cmp ebx,[edi+0x1390] ; 0x770c0b je 0x770c29 — eq. */
export function hud770ba1Field1390Eq(p1390, id) {
  return u32(p1390) === u32(id) ? 1 : 0;
}

/* 0x770c21 cmp ebx,[edi+0x1388] ; 0x770c27 jne 0x770c3e — eq. */
export function hud770ba1Field1388Eq(p1388, id) {
  return u32(p1388) === u32(id) ? 1 : 0;
}

/* ============ ABI v27: HasCollectible counter epilogue 0x770c3e ==========
   (notes hud-v27-770c3e/NOTES.md). The function's LAST block
   (0x770c3e..0x770c92, ret 8): held_id = dword[p+0x2ef4]; STRICT path
   (count > 1) iff held_id != 0 && id == held_id (FULL dword) &&
   LOW-BYTE[p+0x2ef0] == 0; else LOOSE path (count > 0). table =
   dword[p+0x16c8], [table+id*4] scaled index. Both compares are
   cmp dword,imm ; setg — SIGNED (i32(); wide case 0xffffffff covered). Plus the COMPOSED region-C tail plan (0x770b0c..0x770c27
   v26 chain + this epilogue) as hud770c3eTailPlan: machine-order
   composition of the v26 gate oracles with host known/unknown pairs. */

export const HUD_770C3E_VA_HEAD = 0x00770c3e;
export const HUD_770C3E_VA_TEST_HELD = 0x00770c44;
export const HUD_770C3E_VA_JE_HELD = 0x00770c46;
export const HUD_770C3E_VA_CMP_HELD = 0x00770c48;
export const HUD_770C3E_VA_JNE_HELD = 0x00770c4a;
export const HUD_770C3E_VA_CMP_BYTE = 0x00770c4c;
export const HUD_770C3E_VA_JNE_BYTE = 0x00770c53;
export const HUD_770C3E_VA_TABLE_LOAD = 0x00770c55;
export const HUD_770C3E_VA_CMP_1 = 0x00770c5d;
export const HUD_770C3E_VA_SETG_1 = 0x00770c62;
export const HUD_770C3E_VA_PATH_B = 0x00770c75;
export const HUD_770C3E_VA_CMP_0 = 0x00770c80;
export const HUD_770C3E_VA_SETG_0 = 0x00770c85;
export const HUD_770C3E_VA_RET = 0x00770c92;
export const HUD_770C3E_VA_TRUE = 0x00770c29;
export const HUD_770C3E_VA_FALSE_216 = 0x00770b64;
export const HUD_770C3E_VA_FALSE = 0x0077075a;
export const HUD_770C3E_VA_REGION_C = 0x00770b0c;
export const HUD_770C3E_HELD_ID_OFF = 0x2ef4;
export const HUD_770C3E_HELD_FLAG_OFF = 0x2ef0;
export const HUD_770C3E_TABLE_OFF = 0x16c8;
export const HUD_770C3E_STRICT_THRESHOLD = 1;
export const HUD_770C3E_LOOSE_THRESHOLD = 0;
export const HUD_770C3E_ID_216 = 0x216;
export const HUD_770C3E_ARM170_FLAG = 0x40000000;
export const HUD_770C3E_ARM202C_FLAG = 0x8000;
export const HUD_770C3E_HOST_VA_5B1500 = 0x005b1500;
export const HUD_770C3E_EXIT_EPILOGUE = 0;
export const HUD_770C3E_EXIT_TRUE = 1;
export const HUD_770C3E_EXIT_FALSE_216 = 2;

/* Plan struct offsets (IsaacHud770c3eTailPlan, 16 x int32). */
export const HUD_770C3E_TAIL_PLAN_OFFSETS = {
  gate170: 0,
  gate202c: 4,
  gate1f84: 8,
  scalarHit: 12,
  arm170Active: 16,
  arm202cActive: 20,
  elemArm: 24,
  pairActive: 28,
  recBfActive: 32,
  exitKind: 36,
  epilogueStrict: 40,
  result: 44,
  resultKnown: 48,
  hostNeeded: 52,
  hostEdgeCount: 56,
  pureComplete: 60,
};
export const HUD_770C3E_TAIL_PLAN_BYTES = 64;

/* 0x770c3e..0x770c53 — held_id FULL-dword test/cmp + LOW-BYTE flag. */
export function hud770c3eStrict(heldId, id, heldFlag) {
  const h = u32(heldId);
  if (h === 0) return 0;
  if (h !== u32(id)) return 0;
  return (u32(heldFlag) & 0xff) === 0 ? 1 : 0;
}

/* 0x770c5d cmp dword [eax+ebx*4],1 ; 0x770c62 setg — SIGNED > 1. */
export function hud770c3eCountGt1(count) {
  return i32(count) > 1 ? 1 : 0;
}

/* 0x770c80 cmp dword [eax+ebx*4],0 ; 0x770c85 setg — SIGNED > 0. */
export function hud770c3eCountGt0(count) {
  return i32(count) > 0 ? 1 : 0;
}

/* Path selector 0x770c46/0x770c4a/0x770c53: strict -> cmp 1. */
export function hud770c3eResult(strict, count) {
  return strict !== 0 ? hud770c3eCountGt1(count) : hud770c3eCountGt0(count);
}

/* 0x770c55/0x770c75 [eax+ebx*4] — full 32-bit scaled index. */
export function hud770c3eTableAddr(table, id) {
  return (u32(table) + u32(id) * 4) >>> 0;
}

/* Composed region-C tail (0x770b0c..0x770c27) + counter epilogue
   (0x770c3e..0x770c92) in machine order. Host results are
   {known, value} pairs; a sample is REQUIRED only when the chain
   reaches it. Returns the plan object (mirrors the C struct fields). */
export function hud770c3eTailPlan(inputs) {
  const id = u32(inputs.id);
  const cfg = u32(inputs.cfg);
  const gate170 = hud770ba1Gate170(inputs.byte170);
  const gate202c = hud770ba1Gate202c(inputs.byte202c);
  const gate1f84 = hud770ba1Gate1f84(inputs.p1f84);
  const scalarHit = hud770ba1ScalarGate(inputs.p1fb8, id);
  const arm170Active = gate170 !== 0 && cfg !== 0 ? 1 : 0;
  const arm202cActive = gate202c !== 0 && cfg !== 0 ? 1 : 0;
  const elemArm = gate1f84;
  const pairActive = cfg !== 0 ? 1 : 0;
  const recBfActive = id !== 0xbf ? 1 : 0;
  const strict = hud770c3eStrict(inputs.heldId, id, inputs.heldFlag);

  let needed = 0;
  let edges = 0;
  let exitKind = HUD_770C3E_EXIT_EPILOGUE;
  let done = false;

  if (arm170Active !== 0) {
    if (!inputs.raKnown) needed = 1;
    edges += 1;
    if ((u32(inputs.ra) & 0xff) !== 0 && u32(inputs.twin) !== 0) {
      if (!inputs.rbKnown) needed = 1;
      edges += 1;
      if ((u32(inputs.rb) & 0xff) !== 0) {
        exitKind = HUD_770C3E_EXIT_TRUE;
        done = true;
      }
    }
  }
  if (!done && arm202cActive !== 0) {
    if (!inputs.rcKnown) needed = 1;
    edges += 1;
    if ((u32(inputs.rc) & 0xff) === 0 && id !== HUD_770C3E_ID_216) {
      exitKind = HUD_770C3E_EXIT_FALSE_216;
      done = true;
    }
  }
  if (!done && elemArm !== 0) {
    if (!inputs.elemKnown) needed = 1;
    edges += 1;
    if (u32(inputs.resolvedElem) !== u32(inputs.p1f80)) {
      if (hud770ba1Elem557b00Open(inputs.elem14) !== 0) {
        exitKind = HUD_770C3E_EXIT_TRUE;
        done = true;
      }
    }
  }
  if (!done && scalarHit !== 0) {
    exitKind = HUD_770C3E_EXIT_TRUE;
    done = true;
  }
  if (!done) {
    if (!inputs.r1Known) needed = 1;
    edges += 1;
    if (hud770ba19e0650Open(inputs.r1) !== 0) {
      exitKind = HUD_770C3E_EXIT_TRUE;
      done = true;
    }
  }
  if (!done && cfg !== 0) {
    if (!inputs.r2Known) needed = 1;
    edges += 1;
    if ((u32(inputs.r2) & 0xff) !== 0) {
      if (!inputs.r3Known) needed = 1;
      edges += 1;
      if (hud770ba19305f0Open(inputs.r3) !== 0) {
        exitKind = HUD_770C3E_EXIT_TRUE;
        done = true;
      }
    }
  }
  if (!done) {
    if (!inputs.r4Known) needed = 1;
    edges += 1;
    if (hud770ba17911c0Open(inputs.r4) !== 0) {
      exitKind = HUD_770C3E_EXIT_TRUE;
      done = true;
    }
  }
  if (!done && id !== 0xbf) {
    if (!inputs.r5Known) needed = 1;
    edges += 1;
    if (hud770ba1BfRecursiveOpen(inputs.r5) !== 0 &&
        hud770ba1Field1390Eq(inputs.p1390, id) !== 0) {
      exitKind = HUD_770C3E_EXIT_TRUE;
      done = true;
    }
  }
  if (!done) {
    if (!inputs.r6Known) needed = 1;
    edges += 1;
    if (hud770ba19305f01e8Open(inputs.r6) !== 0 &&
        hud770ba1Field1388Eq(inputs.p1388, id) !== 0) {
      exitKind = HUD_770C3E_EXIT_TRUE;
      done = true;
    }
  }
  let result = 0;
  if (!done) {
    result = hud770c3eResult(strict, inputs.count);
  } else if (exitKind === HUD_770C3E_EXIT_TRUE) {
    result = 1;
  }
  const resultKnown = needed === 0 ? 1 : 0;
  return {
    gate170, gate202c, gate1f84, scalarHit,
    arm170Active, arm202cActive, elemArm, pairActive, recBfActive,
    exitKind, epilogueStrict: strict, result, resultKnown,
    hostNeeded: needed, hostEdgeCount: edges, pureComplete: resultKnown,
  };
}

/* ============ ABI v28: 0x770ae2 tail gate + the 0x771200 body ==========
   (notes hud-v28-771200/NOTES.md). The last un-narrowed region-C
   predecessor of HasCollectible 0x007706e0. Gate 0x770ae2: call
   0x771200(player, id, flag) — flag DEAD (stale ecx from the RNG
   call, never read); test al,al LOW-BYTE -> TRUE 0x770c29; else
   id == 0x76 (FULL dword) opens the 0x9305f0(0x76) arm, LOW-BYTE ->
   TRUE; else region C 0x770b0c (v26/v27 lawed). Body
   0x00771200..0x0077140a: find preamble HOST (0x731ee0 pair find,
   0x914150 resolve -> edi, room/game globals, node bytes, field
   samples); the pure surface is the mode dispatch dword[p+0x13c0]
   over {0xd,0xa,2,5,6,8,0xb,0x12} (FULL dword; default FALSE) with
   FULL-dword id gates + byte gates (& 0xff: 0x132, 0x183, 0x26589)
   + the shared room_game chain ([room+8] == 2 FULL dword &&
   g_game != 0 && ((u32)[g_game+0x26630] > 0 || LOW byte[g_game+
   0x26589])) — 26630 is the UNSIGNED ja (0xffffffff OPENS); mode 8
   adds [g_game+0x26584] == 0; mode 0x12: id 0x248 && 26584 not in
   {0x25, 0x26}. NO signed compares in the body. */

export const HUD_771200_VA_HEAD = 0x00771200;
export const HUD_771200_VA_FIND_GATE = 0x0077121f;
export const HUD_771200_VA_FIND_JE = 0x00771225;
export const HUD_771200_VA_1E50 = 0x0077122d;
export const HUD_771200_VA_FIND_CALL = 0x00771272;
export const HUD_771200_VA_REC_BYTE = 0x0077127b;
export const HUD_771200_VA_PAIR_CMP = 0x00771281;
export const HUD_771200_VA_SENTINEL = 0x00771291;
export const HUD_771200_VA_RESOLVE_CALL = 0x007712a2;
export const HUD_771200_VA_MODE_LOAD = 0x007712b6;
export const HUD_771200_VA_DISPATCH = 0x007712bc;
export const HUD_771200_VA_DISPATCH_JNE = 0x007712f6;
export const HUD_771200_VA_CASE_18 = 0x007712fc;
export const HUD_771200_VA_EXCLUDE_25 = 0x00771307;
export const HUD_771200_VA_EXCLUDE_26 = 0x00771310;
export const HUD_771200_VA_CMP_248 = 0x00771319;
export const HUD_771200_VA_JNE_FALSE = 0x00771320;
export const HUD_771200_VA_TRUE = 0x00771326;
export const HUD_771200_VA_CASE_8B = 0x00771331;
export const HUD_771200_VA_BYTE_183 = 0x0077133e;
export const HUD_771200_VA_ROOM_8 = 0x0077134d;
export const HUD_771200_VA_GAME_NULL = 0x00771357;
export const HUD_771200_VA_26630 = 0x0077135f;
export const HUD_771200_VA_26589 = 0x00771368;
export const HUD_771200_VA_SHARED = 0x00771375;
export const HUD_771200_VA_26584 = 0x0077137a;
export const HUD_771200_VA_CASE_6 = 0x00771383;
export const HUD_771200_VA_CASE_5 = 0x0077138c;
export const HUD_771200_VA_CMP_7A = 0x0077138f;
export const HUD_771200_VA_CMP_75 = 0x00771394;
export const HUD_771200_VA_CASE_2 = 0x00771399;
export const HUD_771200_VA_CASE_A = 0x0077139f;
export const HUD_771200_VA_BYTE_132 = 0x007713a8;
export const HUD_771200_VA_FALSE_DE = 0x007713de;
export const HUD_771200_VA_CASE_D = 0x007713e9;
export const HUD_771200_VA_CMP_168 = 0x007713f1;
export const HUD_771200_VA_CMP_19C = 0x007713f7;
export const HUD_771200_VA_FALSE = 0x00771402;
export const HUD_771200_VA_RET = 0x0077140a;
export const HUD_771200_HOST_VA_731EE0 = 0x00731ee0;
export const HUD_771200_HOST_VA_914150 = 0x00914150;
export const HUD_771200_GAME_GLOBAL = 0x00c71678;
export const HUD_771200_ROOM_GLOBAL = 0x00c7169c;
export const HUD_771200_PLAYER_1E50_OFF = 0x1e50;
export const HUD_771200_PLAYER_MODE_OFF = 0x13c0;
export const HUD_771200_ROOM_BEGIN_OFF = 0x4b3d8;
export const HUD_771200_ROOM_END_OFF = 0x4b3dc;
export const HUD_771200_ROOM_CONTAINER_OFF = 0x4c440;
export const HUD_771200_ROOM_STATE_OFF = 8;
export const HUD_771200_GAME_26584_OFF = 0x26584;
export const HUD_771200_GAME_26630_OFF = 0x26630;
export const HUD_771200_GAME_26589_OFF = 0x26589;
export const HUD_771200_EDI_132_OFF = 0x132;
export const HUD_771200_EDI_183_OFF = 0x183;
export const HUD_771200_MODE_D = 0xd;
export const HUD_771200_MODE_A = 0xa;
export const HUD_771200_MODE_2 = 2;
export const HUD_771200_MODE_5 = 5;
export const HUD_771200_MODE_6 = 6;
export const HUD_771200_MODE_8 = 8;
export const HUD_771200_MODE_B = 0xb;
export const HUD_771200_MODE_12 = 0x12;
export const HUD_771200_ID_248 = 0x248;
export const HUD_771200_ID_D6 = 0xd6;
export const HUD_771200_ID_139 = 0x139;
export const HUD_771200_ID_9D = 0x9d;
export const HUD_771200_ID_7A = 0x7a;
export const HUD_771200_ID_75 = 0x75;
export const HUD_771200_ID_2E = 0x2e;
export const HUD_771200_ID_168 = 0x168;
export const HUD_771200_ID_19C = 0x19c;
export const HUD_771200_ROOM_STATE_2 = 2;
export const HUD_771200_GAME_26584_EXCLUDE_1 = 0x25;
export const HUD_771200_GAME_26584_EXCLUDE_2 = 0x26;

export const HUD_770AE2_VA_CALL = 0x00770ae2;
export const HUD_770AE2_VA_CALL_771200 = 0x00770ae6;
export const HUD_770AE2_VA_TEST = 0x00770aeb;
export const HUD_770AE2_VA_JNE_TRUE = 0x00770aed;
export const HUD_770AE2_VA_CMP_76 = 0x00770af3;
export const HUD_770AE2_VA_JNE_REGION_C = 0x00770af6;
export const HUD_770AE2_VA_CALL_9305F0 = 0x00770aff;
export const HUD_770AE2_VA_TEST_9305F0 = 0x00770b04;
export const HUD_770AE2_VA_JNE_TRUE2 = 0x00770b06;
export const HUD_770AE2_VA_REGION_C = 0x00770b0c;
export const HUD_770AE2_HOST_VA_9305F0 = 0x009305f0;
export const HUD_770AE2_ID_76 = 0x76;

/* 0x7712b6 mov eax,[eax+0x13c0] ; 0x7712bc..0x7712f6 — FULL-dword
   dispatch chain, default FALSE (0x771402). */
export function hud771200ModeOpen(mode) {
  const m = u32(mode);
  return (m === HUD_771200_MODE_D || m === HUD_771200_MODE_A ||
          m === HUD_771200_MODE_2 || m === HUD_771200_MODE_5 ||
          m === HUD_771200_MODE_6 || m === HUD_771200_MODE_8 ||
          m === HUD_771200_MODE_B || m === HUD_771200_MODE_12) ? 1 : 0;
}

/* Shared 0x77134d..0x77136f / 0x7713b5..0x7713d8 chain: room FULL
   dword == 2, g_game null, UNSIGNED ja 26630 > 0, byte 26589. */
export function hud771200RoomGameOpen(room8, gGame, gGame26630, gGame26589) {
  if (u32(room8) !== HUD_771200_ROOM_STATE_2) return 0;
  if (u32(gGame) === 0) return 0;
  if (u32(gGame26630) > 0) return 1;
  return (u32(gGame26589) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7713e9..0x7713fc — FULL-dword id equality. */
export function hud771200CaseD(id) {
  const i = u32(id);
  return (i === HUD_771200_ID_168 || i === HUD_771200_ID_19C) ? 1 : 0;
}

/* 0x77139f id == 0x139 FULL dword; 0x7713a8 byte[edi+0x132] LOW
   BYTE; else the shared room_game chain. */
export function hud771200CaseA(id, byte132, room8, gGame, gGame26630, gGame26589) {
  if (u32(id) !== HUD_771200_ID_139) return 0;
  if ((u32(byte132) & 0xff) !== 0) return 1;
  return hud771200RoomGameOpen(room8, gGame, gGame26630, gGame26589);
}

export function hud771200Case2(id) {
  return u32(id) === HUD_771200_ID_2E ? 1 : 0;
}

/* 0x77138c..0x771397 — FULL dword. */
export function hud771200Case5(id) {
  const i = u32(id);
  return (i === HUD_771200_ID_7A || i === HUD_771200_ID_75) ? 1 : 0;
}

export function hud771200Case6(id) {
  return u32(id) === HUD_771200_ID_9D ? 1 : 0;
}

/* 0x771331 id == 0xd6 FULL dword; byte[edi+0x183] LOW BYTE or the
   shared chain; 0x77137a [g_game+0x26584] == 0 FULL dword (mode !=
   0xb reaches it). */
export function hud771200Case8(id, byte183, room8, gGame, gGame26630,
                                gGame26589, gGame26584) {
  if (u32(id) !== HUD_771200_ID_D6) return 0;
  if ((u32(byte183) & 0xff) === 0 &&
      hud771200RoomGameOpen(room8, gGame, gGame26630, gGame26589) === 0) {
    return 0;
  }
  return u32(gGame26584) === 0 ? 1 : 0;
}

/* 0x771375 cmp eax,0xb ; je 0x771326 — mode 0xb TRUEs WITHOUT the
   26584 test. */
export function hud771200CaseB(id, byte183, room8, gGame, gGame26630, gGame26589) {
  if (u32(id) !== HUD_771200_ID_D6) return 0;
  if ((u32(byte183) & 0xff) !== 0) return 1;
  return hud771200RoomGameOpen(room8, gGame, gGame26630, gGame26589);
}

/* 0x7712fc id == 0x248 && 26584 not in {0x25, 0x26} — FULL dword. */
export function hud771200Case18(id, gGame26584) {
  if (u32(id) !== HUD_771200_ID_248) return 0;
  const g = u32(gGame26584);
  if (g === HUD_771200_GAME_26584_EXCLUDE_1) return 0;
  return g === HUD_771200_GAME_26584_EXCLUDE_2 ? 0 : 1;
}

/* The composed 0x771200 decision (dispatch + case). Inputs mirror the
   C law parameter list. */
export function hud771200Gate(inputs) {
  const mode = u32(inputs.mode);
  switch (mode) {
    case HUD_771200_MODE_D: return hud771200CaseD(inputs.id);
    case HUD_771200_MODE_A:
      return hud771200CaseA(inputs.id, inputs.byte132, inputs.room8,
                            inputs.gGame, inputs.gGame26630, inputs.gGame26589);
    case HUD_771200_MODE_2: return hud771200Case2(inputs.id);
    case HUD_771200_MODE_5: return hud771200Case5(inputs.id);
    case HUD_771200_MODE_6: return hud771200Case6(inputs.id);
    case HUD_771200_MODE_8:
      return hud771200Case8(inputs.id, inputs.byte183, inputs.room8,
                            inputs.gGame, inputs.gGame26630,
                            inputs.gGame26589, inputs.gGame26584);
    case HUD_771200_MODE_B:
      return hud771200CaseB(inputs.id, inputs.byte183, inputs.room8,
                            inputs.gGame, inputs.gGame26630, inputs.gGame26589);
    case HUD_771200_MODE_12: return hud771200Case18(inputs.id, inputs.gGame26584);
    default: return 0;
  }
}

/* 0x770aeb test al,al -> TRUE 0x770c29; 0x770af3 id == 0x76 FULL
   dword opens the 0x9305f0 arm; 0x770b04 test al,al -> TRUE; else
   region C. Wide cases: r 0x100 is CLOSED on both byte gates. */
export function hud770ae2Open(r771200, id, r9305f0) {
  if ((u32(r771200) & 0xff) !== 0) return 1;
  if (u32(id) !== HUD_770AE2_ID_76) return 0;
  return (u32(r9305f0) & 0xff) !== 0 ? 1 : 0;
}

/* ============ ABI v28 (2): Entity_Player::VoidHasCollectible 0x7711a0
   (EXACT ZHL — identify-zhl-prologues.json results[8]:
   third_party/REPENTOGON/libzhl/functions/EntityPlayer.zhl,
   `__thiscall bool Entity_Player::VoidHasCollectible(int id)`, 10
   pattern bytes, ret 4; the function directly BEFORE the packed true
   start 0x771200 — 0x7711fd ret 4 -> 0x771200 push ebp). FULLY PURE:
   slot scan player+0x1580 (4 x dword, stride 0x20) for 0x1dd FULL
   dword (0x7711b0..0x7711bf; index feeds only the DEAD js guard
   0x7711c8), then the void-id list scan [player+0x1754..0x1758):
   count = sar(end-begin,2) sampled; FULL-dword count gate (0x7711df);
   per elem FULL-dword == void_id (0x7711e6 je TRUE; UNSIGNED jb
   loop). result = slot_hit && count != 0 && elem_hit. */

export const HUD_7711A0_VA_HEAD = 0x007711a0;
export const HUD_7711A0_VA_SLOT_SCAN = 0x007711b0;
export const HUD_7711A0_VA_SLOT_JE = 0x007711b6;
export const HUD_7711A0_VA_SLOT_LOOP = 0x007711bf;
export const HUD_7711A0_VA_FALSE = 0x007711c1;
export const HUD_7711A0_VA_TEST_IDX = 0x007711c8;
export const HUD_7711A0_VA_JS_GUARD = 0x007711ca;
export const HUD_7711A0_VA_COUNT_SAR = 0x007711dc;
export const HUD_7711A0_VA_COUNT_GATE = 0x007711df;
export const HUD_7711A0_VA_ELEM_CMP = 0x007711e6;
export const HUD_7711A0_VA_ELEM_JE = 0x007711e8;
export const HUD_7711A0_VA_ELEM_LOOP = 0x007711f0;
export const HUD_7711A0_VA_TRUE = 0x007711f9;
export const HUD_7711A0_VA_RET = 0x007711fd;
export const HUD_7711A0_ID_1DD = 0x1dd;
export const HUD_7711A0_SLOT_COUNT = 4;
export const HUD_7711A0_SLOT_STRIDE = 0x20;
export const HUD_7711A0_SLOTS_OFF = 0x1580;
export const HUD_7711A0_LIST_BEGIN_OFF = 0x1754;
export const HUD_7711A0_LIST_END_OFF = 0x1758;

/* 0x7711b0..0x7711bf — 4-slot 0x1dd scan, FULL dword (0x101dd miss). */
export function hud7711a0VoidSlotHit(slot0, slot1, slot2, slot3) {
  const id = HUD_7711A0_ID_1DD;
  return (u32(slot0) === id || u32(slot1) === id || u32(slot2) === id ||
          u32(slot3) === id) ? 1 : 0;
}

/* 0x7711df test edx,edx ; je FALSE — FULL dword count gate. */
export function hud7711a0VoidListGate(count) {
  return u32(count) !== 0 ? 1 : 0;
}

/* 0x7711e6 cmp dword [eax],esi ; je TRUE — FULL dword elem eq. */
export function hud7711a0VoidElemHit(elem, voidId) {
  return u32(elem) === u32(voidId) ? 1 : 0;
}

/* Composed: slot_hit && count != 0 && elem_hit (0x7711b6 je -> list
   scan; 0x7711df je FALSE; 0x7711e8 je TRUE). */
export function hud7711a0VoidHas(slotHit, count, elemHit) {
  if (slotHit === 0) return 0;
  if (u32(count) === 0) return 0;
  return elemHit !== 0 ? 1 : 0;
}

/* ============ ABI v29: the 0x771410 id-walk loop ============
   (notes hud-v29-771410/NOTES.md; cpu-dump/00771410.txt +
   0077153f.txt). PACKED TRUE START (0x77140d..0x77140f int3 pads),
   0x00771410..0x00771545 ret 0. The 0x2dd walk over ids; per
   iteration r1 = 0x771200(player, id, dead-flag) is a HOST sample;
   LOW(r1) selects PATH A (edition arm [g_game+0x26584] != 0x2b FULL
   dword; 0x733ff0 edge iff id == 0x1e4; THE one observable store
   iff id UNSIGNED < [g_game+0x1a740+0x688]: *([g_game+0x1a740+
   0x67c] + (id>>5)*4) |= 1 << (id & 0x1f); then ALWAYS the room
   fire: sar(end-begin,2) over [room+0x2a404]/[0x2a408], 0x75d1d0
   edge iff (int32)id < (int32)room_count SIGNED && begin[id] != 0
   FULL dword) vs PATH B (0x7706e0 edge ALWAYS — the second 0x771200
   call is effect-DEAD; LOW(r3)/LOW(r4) byte skips; 0x72fd10 edge;
   0x75d850 edge iff r5 != 0). Walk bound cmp esi,0x2dd ; jl SIGNED
   (wasm32 compare-flip class: i64 sign-extend form). Tail: mode ==
   5 FULL dword -> 0x75d850 edge with arg = (int32)((end-begin) &
   0xfffffffc) > 0x1e8 SIGNED ? dword[begin+0x1e8] : 0. */

export const HUD_771410_VA_HEAD = 0x00771410;
export const HUD_771410_VA_LOOP_HEAD = 0x00771420;
export const HUD_771410_VA_CALL_771200 = 0x00771424;
export const HUD_771410_VA_TEST_AL = 0x00771429;
export const HUD_771410_VA_JE_PATH_B = 0x0077142b;
export const HUD_771410_VA_EDITION_CMP = 0x00771432;
export const HUD_771410_VA_EDITION_JE = 0x0077143f;
export const HUD_771410_VA_CHALLENGE_CMP = 0x00771441;
export const HUD_771410_VA_CHALLENGE_JNE = 0x00771447;
export const HUD_771410_VA_CALL_733FF0 = 0x00771454;
export const HUD_771410_VA_BIT_BOUND_CMP = 0x00771459;
export const HUD_771410_VA_BIT_BOUND_JAE = 0x0077145f;
export const HUD_771410_VA_WORD_SHR = 0x00771469;
export const HUD_771410_VA_WORD_LEA = 0x0077146c;
export const HUD_771410_VA_BIT_AND = 0x00771473;
export const HUD_771410_VA_BTS = 0x00771476;
export const HUD_771410_VA_BIT_STORE = 0x00771479;
export const HUD_771410_VA_ROOM_LOAD = 0x0077147b;
export const HUD_771410_VA_ROOM_SAR = 0x0077148e;
export const HUD_771410_VA_ROOM_JGE = 0x00771493;
export const HUD_771410_VA_ELEM_LOAD = 0x00771495;
export const HUD_771410_VA_ELEM_TEST = 0x00771498;
export const HUD_771410_VA_ELEM_JE = 0x0077149a;
export const HUD_771410_VA_CALL_75D1D0 = 0x007714a1;
export const HUD_771410_VA_PATH_B = 0x007714a8;
export const HUD_771410_VA_DEAD_CALL_771200 = 0x007714ac;
export const HUD_771410_VA_CALL_7706E0 = 0x007714b6;
export const HUD_771410_VA_HC_TEST = 0x007714bb;
export const HUD_771410_VA_HC_JNE = 0x007714bd;
export const HUD_771410_VA_CALL_9305F0 = 0x007714c6;
export const HUD_771410_VA_TRINKET_TEST = 0x007714cb;
export const HUD_771410_VA_TRINKET_JNE = 0x007714cd;
export const HUD_771410_VA_CALL_72FD10 = 0x007714dc;
export const HUD_771410_VA_LIST_TEST = 0x007714e1;
export const HUD_771410_VA_LIST_JE = 0x007714e3;
export const HUD_771410_VA_CALL_75D850 = 0x007714e8;
export const HUD_771410_VA_INC = 0x007714ed;
export const HUD_771410_VA_BOUND_CMP = 0x007714ee;
export const HUD_771410_VA_BOUND_JL = 0x007714f4;
export const HUD_771410_VA_TAIL_MODE_CMP = 0x007714fa;
export const HUD_771410_VA_TAIL_MODE_JNE = 0x00771501;
export const HUD_771410_VA_SPAN_MASK = 0x00771516;
export const HUD_771410_VA_TAIL_CMP = 0x00771519;
export const HUD_771410_VA_TAIL_JG = 0x0077151e;
export const HUD_771410_VA_TAIL_XOR = 0x00771520;
export const HUD_771410_VA_TAIL_CALL_0 = 0x00771525;
export const HUD_771410_VA_TAIL_RET = 0x00771530;
export const HUD_771410_VA_TAIL_ARG_LOAD = 0x00771531;
export const HUD_771410_VA_TAIL_CALL_ARG = 0x0077153a;
export const HUD_771410_VA_RET = 0x00771545;
export const HUD_771410_HOST_VA_733FF0 = 0x00733ff0;
export const HUD_771410_HOST_VA_75D1D0 = 0x0075d1d0;
export const HUD_771410_HOST_VA_75D850 = 0x0075d850;
export const HUD_771410_HOST_VA_9305F0 = 0x009305f0;
export const HUD_771410_HOST_VA_72FD10 = 0x0072fd10;
export const HUD_771410_HOST_VA_7706E0 = 0x007706e0;
export const HUD_771410_HOST_VA_771200 = 0x00771200;
export const HUD_771410_GAME_GLOBAL = 0x00c71678;
export const HUD_771410_ROOM_GLOBAL = 0x00c7169c;
export const HUD_771410_PLAYER_MODE_OFF = 0x13c0;
export const HUD_771410_PLAYER_TRINKET_RECV_OFF = 0x1508;
export const HUD_771410_ROOM_BEGIN_OFF = 0x2a404;
export const HUD_771410_ROOM_END_OFF = 0x2a408;
export const HUD_771410_GAME_26584_OFF = 0x26584;
export const HUD_771410_BITSET_BASE_OFF = 0x1a740;
export const HUD_771410_BITSET_COUNT_OFF = 0x688;
export const HUD_771410_BITSET_PTR_OFF = 0x67c;
export const HUD_771410_BEGIN_1E8_OFF = 0x1e8;
export const HUD_771410_WALK_BOUND = 0x2dd;
export const HUD_771410_CHALLENGE_ID = 0x1e4;
export const HUD_771410_CHALLENGE_ARG = 0x126;
export const HUD_771410_EDITION_SKIP = 0x2b;
export const HUD_771410_TAIL_THRESHOLD = 0x1e8;
export const HUD_771410_TAIL_MODE = 5;
export const HUD_771410_BIT_MASK = 0x1f;
export const HUD_771410_SPAN_MASK = 0xfffffffc;
export const HUD_771410_WORD_SHIFT = 5;
export const HUD_771410_WORD_STRIDE = 4;
export const HUD_771410_MASK_BIT_STORE = 1;
export const HUD_771410_MASK_HOST_733FF0 = 2;
export const HUD_771410_MASK_HOST_75D1D0 = 4;
export const HUD_771410_MASK_HOST_7706E0 = 8;
export const HUD_771410_MASK_HOST_9305F0 = 0x10;
export const HUD_771410_MASK_HOST_72FD10 = 0x20;
export const HUD_771410_MASK_HOST_75D850 = 0x40;

/* 0x7714ee cmp esi,0x2dd ; 0x7714f4 jl — SIGNED (i64 sign-extend
   form; 0xffffffff = -1 CONTINUES the walk). */
export function hud771410WalkContinue(id) {
  return (u32(id) | 0) < HUD_771410_WALK_BOUND ? 1 : 0;
}

/* 0x771429 test al,al ; je path B — LOW BYTE (0x100 CLOSED). */
export function hud771410PathAOpen(r771200) {
  return (u32(r771200) & 0xff) !== 0 ? 1 : 0;
}

/* 0x771432 cmp dword [eax+0x26584],0x2b ; je skip — FULL dword. */
export function hud771410EditionGate(gGame26584) {
  return u32(gGame26584) !== HUD_771410_EDITION_SKIP ? 1 : 0;
}

/* 0x771441 cmp esi,0x1e4 ; jne — FULL dword; open -> 0x733ff0. */
export function hud771410ChallengeGate(id) {
  return u32(id) === HUD_771410_CHALLENGE_ID ? 1 : 0;
}

/* 0x771459 cmp esi,[ebx+0x688] ; jae skip — UNSIGNED, inside the
   edition-open arm. */
export function hud771410BitSetOpen(gGame26584, id, bitsetCount) {
  if (hud771410EditionGate(gGame26584) === 0) return 0;
  return u32(id) < u32(bitsetCount) ? 1 : 0;
}

/* 0x771473 and ecx,0x1f ; 0x771476 bts eax,ecx — bit index masked
   to [0,31], FULL-dword word. */
export function hud771410BitWord(bitsWord, id) {
  return (u32(bitsWord) | (1 << (u32(id) & HUD_771410_BIT_MASK))) >>> 0;
}

/* 0x771469 shr ecx,5 ; 0x77146c lea edx,[eax+ecx*4] — word index
   id >> 5, dword stride, full 32-bit wrap. */
export function hud771410BitAddr(bitsPtr, id) {
  return (u32(bitsPtr) + (u32(id) >>> HUD_771410_WORD_SHIFT) *
    HUD_771410_WORD_STRIDE) >>> 0;
}

/* 0x77148c sub ; 0x77148e sar eax,2 — ARITHMETIC shift (negative
   spans stay negative); result is the uint32 bit pattern. */
export function hud771410RoomCountSar(begin, end) {
  return (((u32(end) - u32(begin)) | 0) >> 2) >>> 0;
}

/* 0x771491 cmp esi,eax ; 0x771493 jge skip — SIGNED (i64 sign-
   extend form). */
export function hud771410RoomFireOpen(roomCount, id) {
  return (u32(id) | 0) < (u32(roomCount) | 0) ? 1 : 0;
}

/* 0x771498 test eax,eax ; je skip — FULL dword (0x100 fires). */
export function hud771410ElemFireOpen(elem) {
  return u32(elem) !== 0 ? 1 : 0;
}

/* 0x7714bb test al,al ; jne skip — LOW BYTE (0x100 CLOSED). */
export function hud771410HcSkipOpen(r7706e0) {
  return (u32(r7706e0) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7714cb test al,al ; jne skip — LOW BYTE (0x100 CLOSED). */
export function hud771410TrinketSkipOpen(r9305f0) {
  return (u32(r9305f0) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7714e1 test eax,eax ; je skip — FULL dword (0x100 fires). */
export function hud771410ListFireOpen(r72fd10) {
  return u32(r72fd10) !== 0 ? 1 : 0;
}

/* 0x7714fa cmp dword [edi+0x13c0],5 ; jne — FULL dword. */
export function hud771410TailFire(mode) {
  return u32(mode) === HUD_771410_TAIL_MODE ? 1 : 0;
}

/* 0x771516 and eax,0xfffffffc ; 0x771519 cmp eax,0x1e8 ; 0x77151e
   jg — SIGNED on the MASKED span (0x1e9 masks to 0x1e8 CLOSED;
   negative spans stay negative). */
export function hud771410TailLargeGate(begin, end) {
  const masked = (u32(end) - u32(begin)) & HUD_771410_SPAN_MASK;
  return (masked | 0) > HUD_771410_TAIL_THRESHOLD ? 1 : 0;
}

/* 0x771520 xor eax,eax vs 0x771531 mov eax,[ecx+0x1e8] — the
   0x75d850 arg selector; begin1e8 is dword[begin+0x1e8] (sample,
   required only when the large gate opens). */
export function hud771410TailArg(begin1e8, begin, end) {
  return hud771410TailLargeGate(begin, end) !== 0 ? u32(begin1e8) : 0;
}

/* The composed per-iteration dispatch bitmask (0x771420.. machine
   order). Bits: BIT_STORE 1 | HOST_733FF0 2 | HOST_75D1D0 4 |
   HOST_7706E0 8 | HOST_9305F0 0x10 | HOST_72FD10 0x20 |
   HOST_75D850 0x40. The dead r2 0x771200 call has no effect. */
export function hud771410IterMask({
  id = 0, r771200 = 0, gGame26584 = 0, bitsetCount = 0, roomCount = 0,
  elem = 0, r7706e0 = 0, r9305f0 = 0, r72fd10 = 0,
} = {}) {
  let mask = 0;
  if (hud771410PathAOpen(r771200) !== 0) {
    if (hud771410EditionGate(gGame26584) !== 0) {
      if (hud771410ChallengeGate(id) !== 0) mask |= HUD_771410_MASK_HOST_733FF0;
      if (u32(id) < u32(bitsetCount)) mask |= HUD_771410_MASK_BIT_STORE;
    }
    if (hud771410RoomFireOpen(roomCount, id) !== 0 &&
        hud771410ElemFireOpen(elem) !== 0) {
      mask |= HUD_771410_MASK_HOST_75D1D0;
    }
  } else {
    mask |= HUD_771410_MASK_HOST_7706E0;
    if (hud771410HcSkipOpen(r7706e0) === 0) {
      mask |= HUD_771410_MASK_HOST_9305F0;
      if (hud771410TrinketSkipOpen(r9305f0) === 0) {
        mask |= HUD_771410_MASK_HOST_72FD10;
        if (hud771410ListFireOpen(r72fd10) !== 0) {
          mask |= HUD_771410_MASK_HOST_75D850;
        }
      }
    }
  }
  return mask;
}

/* 0x771514 sub ; 0x771516 and eax,0xfffffffc — the tail span mask. */
export function hud771410SpanMasked(begin, end) {
  return ((u32(end) - u32(begin)) & HUD_771410_SPAN_MASK) >>> 0;
}

/* ============ ABI v30: HasCollectible 0x007706e0 branch selection ============
   The four pre-gate windows of FUN_007706e0 (0x007706e0..0x00770c92)
   between the v24 walk and the v25/v26/v27/v28 regions: interior gate
   (byte 0x20a9 + 26614 jge SIGNED + cfg 0x8000), held-id gate (FULL),
   negative-id arm (jns SIGNED -> 0x9e04b0 LOW passthrough), flag byte
   gate (param_3, 0x7707d4), 0x147/0x148 arm (0x771550(0x15) LOW,
   0x264f8 signed mod-4, 0x7cb6e0 count jle SIGNED table), 0x139 arm
   (mode 0xa FULL direct / 0x930680(0x70) LOW + mode 0x1f FULL chain /
   byte[v+0x132] LOW / room-game shared gate with 26630 ja UNSIGNED +
   byte 26589 LOW), 0x3b arm (0x7da770 LOW), 0x131/0x101/0xe7/0xb6
   byte-2028 bit arms (LOW + imm), 0x7db8d0 14a99 gate (FULL eq 1/2),
   and the 0x76-arm host path (0x9305f0(&player[0x1508],0x76), LOW). */

export const HUD_7706E0_VA_FALSE = 0x0077075a;
export const HUD_7706E0_VA_INTERIOR_HEAD = 0x0077076f;
export const HUD_7706E0_VA_INTERIOR_26614_LOAD = 0x00770778;
export const HUD_7706E0_VA_INTERIOR_26614_CMP = 0x0077077d;
export const HUD_7706E0_VA_INTERIOR_26614_JGE = 0x00770784;
export const HUD_7706E0_VA_INTERIOR_CFG_B8 = 0x00770786;
export const HUD_7706E0_VA_INTERIOR_CFG_AND = 0x0077078c;
export const HUD_7706E0_VA_INTERIOR_CFG_JE = 0x00770794;
export const HUD_7706E0_VA_HELD_HEAD = 0x00770796;
export const HUD_7706E0_VA_HELD_TEST = 0x0077079c;
export const HUD_7706E0_VA_HELD_CMP = 0x007707a0;
export const HUD_7706E0_VA_HELD_BYTE = 0x007707a4;
export const HUD_7706E0_VA_HELD_JNE_TRUE = 0x007707ab;
export const HUD_7706E0_VA_NEG_TEST = 0x007707b1;
export const HUD_7706E0_VA_NEG_JNS = 0x007707b3;
export const HUD_7706E0_VA_NEG_CALL = 0x007707bc;
export const HUD_7706E0_VA_NEG_RET = 0x007707c1;
export const HUD_7706E0_VA_FLAG_CMP = 0x007707d4;
export const HUD_7706E0_VA_FLAG_JNE_EPILOGUE = 0x007707d8;
export const HUD_7706E0_VA_CMP_147 = 0x007707de;
export const HUD_7706E0_VA_CMP_148 = 0x007707e6;
export const HUD_7706E0_VA_1550_CALL = 0x007707f4;
export const HUD_7706E0_VA_1550_TEST = 0x007707f9;
export const HUD_7706E0_VA_MOD4_AND = 0x00770808;
export const HUD_7706E0_VA_MOD4_JNS = 0x0077080d;
export const HUD_7706E0_VA_MOD4_FIXUP = 0x0077080f;
export const HUD_7706E0_VA_COUNT_CALL = 0x0077081b;
export const HUD_7706E0_VA_COUNT_CMP = 0x00770820;
export const HUD_7706E0_VA_COUNT_JLE = 0x00770826;
export const HUD_7706E0_VA_RULE_N_LE1_MOD0 = 0x00770831;
export const HUD_7706E0_VA_RULE_N_LE1_MOD1 = 0x00770850;
export const HUD_7706E0_VA_RULE_N_LE1_CHK = 0x0077083f;
export const HUD_7706E0_VA_RULE_N_GT1_CHK = 0x00770828;
export const HUD_7706E0_VA_RULE_N_GT1_MOD1 = 0x0077084b;
export const HUD_7706E0_VA_CMP_139 = 0x0077085c;
export const HUD_7706E0_VA_MODE_A_CMP = 0x00770868;
export const HUD_7706E0_VA_CALL_930680 = 0x00770879;
export const HUD_7706E0_VA_930680_TEST = 0x0077087e;
export const HUD_7706E0_VA_MODE_1F_CMP = 0x00770886;
export const HUD_7706E0_VA_ROOM_BEGIN_CMP = 0x007708a9;
export const HUD_7706E0_VA_PAIR_CALL = 0x007708b4;
export const HUD_7706E0_VA_RESOLVE_CALL = 0x007708c6;
export const HUD_7706E0_VA_CMOVNE = 0x007708d0;
export const HUD_7706E0_VA_BYTE132_CMP = 0x007708d3;
export const HUD_7706E0_VA_BYTE132_JNE = 0x007708da;
export const HUD_7706E0_VA_ROOM_8_CMP = 0x007708e0;
export const HUD_7706E0_VA_ROOM_8_JNE = 0x007708e9;
export const HUD_7706E0_VA_GAME_TEST = 0x007708ef;
export const HUD_7706E0_VA_GAME_JE = 0x007708f6;
export const HUD_7706E0_VA_26630_CMP = 0x007708fc;
export const HUD_7706E0_VA_26630_JA = 0x00770903;
export const HUD_7706E0_VA_26589_CMP = 0x00770909;
export const HUD_7706E0_VA_SHARED_JNE_TRUE = 0x00770a3e;
export const HUD_7706E0_VA_CMP_3B = 0x00770994;
export const HUD_7706E0_VA_CALL_7DA770 = 0x0077099b;
export const HUD_7706E0_VA_7DA770_TEST = 0x007709a0;
export const HUD_7706E0_VA_BIT_131 = 0x007709c5;
export const HUD_7706E0_VA_BIT_101 = 0x007709eb;
export const HUD_7706E0_VA_BIT_E7 = 0x00770a11;
export const HUD_7706E0_VA_BIT_B6 = 0x00770a37;
export const HUD_7706E0_VA_CALL_7DB8D0 = 0x00770a46;
export const HUD_7706E0_VA_CMP_14A = 0x00770a4b;
export const HUD_7706E0_VA_7DB8D0_CMP_1 = 0x00770a53;
export const HUD_7706E0_VA_7DB8D0_AL_RET = 0x00770a58;
export const HUD_7706E0_VA_CMP_99 = 0x00770a6d;
export const HUD_7706E0_VA_7DB8D0_CMP_2 = 0x00770a75;
export const HUD_7706E0_VA_LADDER = 0x00770a7e;
export const HUD_7706E0_VA_76_CMP = 0x00770af3;
export const HUD_7706E0_VA_76_JNE = 0x00770af6;
export const HUD_7706E0_VA_CALL_9305F0_76 = 0x00770aff;
export const HUD_7706E0_VA_76_TEST = 0x00770b04;
export const HUD_7706E0_VA_76_JNE_TRUE = 0x00770b06;
export const HUD_7706E0_VA_CHAIN_7DB8D0 = 0x00770a44;
export const HUD_7706E0_VA_EPILOGUE = 0x00770c3e;
export const HUD_7706E0_VA_TRUE = 0x00770c29;
export const HUD_7706E0_VA_REGION_C = 0x00770b0c;
export const HUD_7706E0_HOST_VA_9E04B0 = 0x009e04b0;
export const HUD_7706E0_HOST_VA_771550 = 0x00771550;
export const HUD_7706E0_HOST_VA_7CB6E0 = 0x007cb6e0;
export const HUD_7706E0_HOST_VA_930680 = 0x00930680;
export const HUD_7706E0_HOST_VA_A23920 = 0x00a23920;
export const HUD_7706E0_HOST_VA_90C300 = 0x0090c300;
export const HUD_7706E0_HOST_VA_7DA770 = 0x007da770;
export const HUD_7706E0_HOST_VA_7DB8D0 = 0x007db8d0;
export const HUD_7706E0_HOST_VA_9305F0 = 0x009305f0;
export const HUD_7706E0_GAME_GLOBAL = 0x00c71678;
export const HUD_7706E0_ROOM_GLOBAL = 0x00c7169c;
export const HUD_7706E0_OFF_20A9 = 0x20a9;
export const HUD_7706E0_OFF_26614 = 0x26614;
export const HUD_7706E0_OFF_CFG_B8 = 0xb8;
export const HUD_7706E0_OFF_HELD_ID = 0x2ef4;
export const HUD_7706E0_OFF_HELD_FLAG = 0x2ef0;
export const HUD_7706E0_OFF_1FC8 = 0x1fc8;
export const HUD_7706E0_OFF_264F8 = 0x264f8;
export const HUD_7706E0_OFF_13C0 = 0x13c0;
export const HUD_7706E0_OFF_1508 = 0x1508;
export const HUD_7706E0_OFF_1E4C = 0x1e4c;
export const HUD_7706E0_OFF_ROOM_BEGIN = 0x4b3d8;
export const HUD_7706E0_OFF_ROOM_END = 0x4b3dc;
export const HUD_7706E0_OFF_ROOM_8 = 8;
export const HUD_7706E0_OFF_ROOM_DEFAULT = 0x14;
export const HUD_7706E0_OFF_V_132 = 0x132;
export const HUD_7706E0_OFF_26630 = 0x26630;
export const HUD_7706E0_OFF_26589 = 0x26589;
export const HUD_7706E0_OFF_2028 = 0x2028;
export const HUD_7706E0_ID_147 = 0x147;
export const HUD_7706E0_ID_148 = 0x148;
export const HUD_7706E0_ID_139 = 0x139;
export const HUD_7706E0_ID_9 = 9;
export const HUD_7706E0_ID_3B = 0x3b;
export const HUD_7706E0_ID_131 = 0x131;
export const HUD_7706E0_ID_101 = 0x101;
export const HUD_7706E0_ID_E7 = 0xe7;
export const HUD_7706E0_ID_B6 = 0xb6;
export const HUD_7706E0_ID_14A = 0x14a;
export const HUD_7706E0_ID_99 = 0x99;
export const HUD_7706E0_ID_76 = 0x76;
export const HUD_7706E0_ARG_15 = 0x15;
export const HUD_7706E0_ARG_70 = 0x70;
export const HUD_7706E0_264F8_MOD_MASK = 0x80000003;
export const HUD_7706E0_CFG_B8_BIT = 0x8000;
export const HUD_7706E0_2028_BIT_131 = 0x10;
export const HUD_7706E0_2028_BIT_101 = 8;
export const HUD_7706E0_2028_BIT_E7 = 0x20;
export const HUD_7706E0_2028_BIT_B6 = 0x40;
export const HUD_7706E0_26614_THRESHOLD = 2;
export const HUD_7706E0_COUNT_LE1 = 1;
export const HUD_7706E0_7DB8D0_EQ_1 = 1;
export const HUD_7706E0_7DB8D0_EQ_2 = 2;
export const HUD_7706E0_MODE_A = 0xa;
export const HUD_7706E0_MODE_1F = 0x1f;
export const HUD_7706E0_ROOM_8_EQ = 2;
export const HUD_7706E0_EXIT_FALSE_INTERIOR = 0;
export const HUD_7706E0_EXIT_TRUE_HELD = 1;
export const HUD_7706E0_EXIT_NEGATIVE_ARM = 2;
export const HUD_7706E0_EXIT_EPILOGUE_FLAG = 3;
export const HUD_7706E0_EXIT_TRUE_147148 = 4;
export const HUD_7706E0_EXIT_TRUE_139 = 5;
export const HUD_7706E0_EXIT_TRUE_9 = 6;
export const HUD_7706E0_EXIT_TRUE_3B = 7;
export const HUD_7706E0_EXIT_TRUE_BITS = 8;
export const HUD_7706E0_EXIT_TRUE_14A99 = 9;
export const HUD_7706E0_EXIT_TRUE_LADDER = 10;
export const HUD_7706E0_EXIT_TRUE_TAILGATE = 11;
export const HUD_7706E0_EXIT_REGION_C = 12;
export const HUD_7706E0_STAGE_76_ARM = 1;
export const HUD_7706E0_STAGE_NEGATIVE = 2;
export const HUD_7706E0_STAGE_1550 = 4;
export const HUD_7706E0_STAGE_COUNT = 8;
export const HUD_7706E0_STAGE_930680 = 0x10;
export const HUD_7706E0_STAGE_PAIR = 0x20;
export const HUD_7706E0_STAGE_7DA770 = 0x40;
export const HUD_7706E0_STAGE_7DB8D0 = 0x80;
export const HUD_7706E0_STAGE_LADDER = 0x100;
export const HUD_7706E0_STAGE_TAIL = 0x200;
export const HUD_7706E0_ARM_BIT_147 = 1;
export const HUD_7706E0_ARM_BIT_148 = 2;
export const HUD_7706E0_ARM_BIT_139 = 4;
export const HUD_7706E0_ARM_BIT_9 = 8;
export const HUD_7706E0_ARM_BIT_3B = 0x10;
export const HUD_7706E0_ARM_BIT_131 = 0x20;
export const HUD_7706E0_ARM_BIT_101 = 0x40;
export const HUD_7706E0_ARM_BIT_E7 = 0x80;
export const HUD_7706E0_ARM_BIT_B6 = 0x100;
export const HUD_7706E0_ARM_BIT_14A = 0x200;
export const HUD_7706E0_ARM_BIT_99 = 0x400;
export const HUD_7706E0_ARM_BIT_76 = 0x800;

/* 0x77076f..0x770794 — interior gate. LOW byte 0x20a9; 0x26614 cmp
   dword,2 ; jge skip — SIGNED; cfg bit 0x8000 je FALSE. */
export function hud7706e0InteriorFalse(byte20a9, game26614, cfgB8) {
  if ((u32(byte20a9) & 0xff) === 0) return 0;
  if (i32(game26614) >= HUD_7706E0_26614_THRESHOLD) return 0;
  return (u32(cfgB8) & HUD_7706E0_CFG_B8_BIT) === 0 ? 1 : 0;
}

/* 0x770796..0x7707ab — held-id TRUE gate. held_id FULL zero test +
   equality; held_flag LOW byte. */
export function hud7706e0HeldTrue(heldId, id, heldFlag) {
  if (u32(heldId) === 0 || u32(id) !== u32(heldId)) return 0;
  return (u32(heldFlag) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7707b1..0x7707b3 — jns: SIGNED id < 0 (i64 sign-extend form). */
export function hud7706e0IdNegative(id) {
  return i32(id) < 0 ? 1 : 0;
}

/* 0x7707bc..0x7707c1 — the 0x9e04b0 al passthrough (LOW byte). */
export function hud7706e0TrinketReturn(r9e04b0) {
  return (u32(r9e04b0) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7707d4 cmp byte [ebp+0xc],0 ; jne epilogue — LOW byte flag. */
export function hud7706e0FlagEpilogue(flag) {
  return (u32(flag) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7707de/0x7707e6 — FULL dword 0x147/0x148. */
export function hud7706e0Arm147148Open(id) {
  return u32(id) === HUD_7706E0_ID_147 || u32(id) === HUD_7706E0_ID_148
    ? 1 : 0;
}

/* 0x770808 and 0x80000003 ; jns ; dec/or/inc — SIGNED mod-4 of the
   masked value (value -3..3 in Int32). */
export function hud7706e0Mod4(game264f8) {
  return i32(u32(game264f8) & HUD_7706E0_264F8_MOD_MASK) % 4;
}

/* 0x7707f4..0x770856 — the 0x147/0x148 arm TRUE table: r1550 LOW
   open; count vs 1 SIGNED (jle); mod {0,1} selects the id. */
export function hud7706e0Arm147148Hit(id, r1550, mod4, count) {
  if ((u32(r1550) & 0xff) === 0) return 0;
  const m = i32(mod4) | 0;
  if (i32(count) <= HUD_7706E0_COUNT_LE1) {
    if (m === 0) return u32(id) === HUD_7706E0_ID_147 ? 1 : 0;
    if (m === 1) return u32(id) === HUD_7706E0_ID_148 ? 1 : 0;
    return 0;
  }
  if (m !== 0 && m !== 1) return 0;
  return u32(id) === HUD_7706E0_ID_147 || u32(id) === HUD_7706E0_ID_148
    ? 1 : 0;
}

/* 0x77085c — FULL dword 0x139. */
export function hud7706e0Arm139Open(id) {
  return u32(id) === HUD_7706E0_ID_139 ? 1 : 0;
}

/* 0x770868..0x770886 — mode FULL compares; 0x930680 result LOW. */
export function hud7706e0139ModeGate(mode, r930680) {
  if (u32(mode) === HUD_7706E0_MODE_A) return 1;
  if ((u32(r930680) & 0xff) === 0) return 0;
  return u32(mode) !== HUD_7706E0_MODE_1F ? 1 : 0;
}

/* 0x7708d3 cmp byte [ecx+0x132],0 ; jne TRUE — LOW byte. */
export function hud7706e0139Byte132(byte132) {
  return (u32(byte132) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7708e0..0x770910 — the v28-G2 SHARED room-game gate: room_8 == 2
   FULL, g_game != 0 FULL, 26630 ja UNSIGNED > 0 || 26589 LOW byte. */
export function hud7706e0RoomGameTrue(room8, gGame, gGame26630,
                                      gGame26589) {
  if (u32(room8) !== HUD_7706E0_ROOM_8_EQ || u32(gGame) === 0) return 0;
  if (u32(gGame26630) > 0) return 1;
  return (u32(gGame26589) & 0xff) !== 0 ? 1 : 0;
}

/* 0x770994..0x7709a2 — FULL id 0x3b + LOW 0x7da770 result. */
export function hud7706e0Arm3bOpen(id, r7da770) {
  if (u32(id) !== HUD_7706E0_ID_3B) return 0;
  return (u32(r7da770) & 0xff) !== 0 ? 1 : 0;
}

/* 0x7709c5..0x770a3e — test byte [p+0x2028], imm (LOW byte + mask);
   id compares FULL dword. */
export function hud7706e0ArmBitOpen(id, byte2028) {
  const b = u32(byte2028) & 0xff;
  if (u32(id) === HUD_7706E0_ID_131) {
    return (b & HUD_7706E0_2028_BIT_131) !== 0 ? 1 : 0;
  }
  if (u32(id) === HUD_7706E0_ID_101) {
    return (b & HUD_7706E0_2028_BIT_101) !== 0 ? 1 : 0;
  }
  if (u32(id) === HUD_7706E0_ID_E7) {
    return (b & HUD_7706E0_2028_BIT_E7) !== 0 ? 1 : 0;
  }
  if (u32(id) === HUD_7706E0_ID_B6) {
    return (b & HUD_7706E0_2028_BIT_B6) !== 0 ? 1 : 0;
  }
  return 0;
}

/* 0x770a53/0x770a75 — FULL dword equality on the 0x7db8d0 result
   (0x14a -> r == 1, mov al,al; 0x99 -> r == 2, TRUE exit). */
export function hud7706e014a99Gate(id, r7db8d0) {
  if (u32(id) === HUD_7706E0_ID_14A) {
    return u32(r7db8d0) === HUD_7706E0_7DB8D0_EQ_1 ? 1 : 0;
  }
  if (u32(id) === HUD_7706E0_ID_99) {
    return u32(r7db8d0) === HUD_7706E0_7DB8D0_EQ_2 ? 1 : 0;
  }
  return 0;
}

/* 0x770b04 test al,al ; jne TRUE — LOW byte of the 0x9305f0(0x76)
   result (the UNIQUE 0x76-id host path; fires iff the v28 gate
   reached the arm: r_771200 LOW closed && id == 0x76). */
export function hud7706e0Arm76Open(r9305f0) {
  return (u32(r9305f0) & 0xff) !== 0 ? 1 : 0;
}

/* Composed branch selection (E1): strict machine order over the v30
   gates + the v25 9-arm/ladder laws + the v28 tail gate. */
export function hud7706e0BranchPlan(inputs) {
  const id = u32(inputs.id);
  const interiorFalse = hud7706e0InteriorFalse(
    inputs.byte20a9, inputs.game26614, inputs.cfgB8);
  const heldTrue = hud7706e0HeldTrue(inputs.heldId, id, inputs.heldFlag);
  const idNegative = hud7706e0IdNegative(id);
  const flagEpilogue = hud7706e0FlagEpilogue(inputs.flag);
  const arm147148Open = hud7706e0Arm147148Open(id);
  const mod4 = hud7706e0Mod4(inputs.game264f8);
  const arm139 = hud7706e0Arm139Open(id);
  const arm3b = hud7706e0Arm3bOpen(id, inputs.r7da770);
  const armBits = hud7706e0ArmBitOpen(id, inputs.byte2028);
  const arm14a99 = hud7706e014a99Gate(id, inputs.r7db8d0);
  const ladderOpen = hud770a7eOpen(inputs.countA);
  const tailGate = hud770ae2Open(inputs.r771200, id, inputs.r9305f076);
  const arm76 = hud7706e0Arm76Open(inputs.r9305f076);
  const roomGame = hud7706e0RoomGameTrue(
    inputs.room8, inputs.gGame, inputs.gGame26630, inputs.gGame26589);

  let exitKind = HUD_7706E0_EXIT_REGION_C;
  let result = 0;
  let stages = 0;
  let armBitsOut = 0;
  let edges = 0;
  let done = false;

  if (interiorFalse !== 0) {
    exitKind = HUD_7706E0_EXIT_FALSE_INTERIOR;
    done = true;
  } else if (heldTrue !== 0) {
    exitKind = HUD_7706E0_EXIT_TRUE_HELD;
    result = 1;
    done = true;
  } else if (idNegative !== 0) {
    exitKind = HUD_7706E0_EXIT_NEGATIVE_ARM;
    result = hud7706e0TrinketReturn(inputs.r9e04b0);
    stages |= HUD_7706E0_STAGE_NEGATIVE;
    edges += 1;
    done = true;
  } else if (flagEpilogue !== 0) {
    exitKind = HUD_7706E0_EXIT_EPILOGUE_FLAG;
    done = true;
  } else if (arm147148Open !== 0) {
    stages |= HUD_7706E0_STAGE_1550;
    edges += 1;
    if ((u32(inputs.r77155015) & 0xff) !== 0) {
      stages |= HUD_7706E0_STAGE_COUNT;
      edges += 1;
    }
    if (hud7706e0Arm147148Hit(id, inputs.r77155015, mod4,
                              inputs.count7cb6e0) !== 0) {
      exitKind = HUD_7706E0_EXIT_TRUE_147148;
      result = 1;
      done = true;
      armBitsOut |= id === HUD_7706E0_ID_147
        ? HUD_7706E0_ARM_BIT_147 : HUD_7706E0_ARM_BIT_148;
    }
  } else if (arm139 !== 0) {
    const modeGate = hud7706e0139ModeGate(inputs.mode, inputs.r930680);
    if (u32(inputs.mode) !== HUD_7706E0_MODE_A) {
      stages |= HUD_7706E0_STAGE_930680;
      edges += 1;
    }
    if (modeGate !== 0 && u32(inputs.roomBegin) !== u32(inputs.roomEnd)) {
      stages |= HUD_7706E0_STAGE_PAIR;
      edges += 2;
    }
    if (modeGate !== 0 &&
        (hud7706e0139Byte132(inputs.byte132) !== 0 || roomGame !== 0)) {
      exitKind = HUD_7706E0_EXIT_TRUE_139;
      result = 1;
      done = true;
    }
  } else if (id === HUD_7706E0_ID_9) {
    stages |= HUD_7706E0_STAGE_1550;
    edges += 1;
    if (hud770915Open(id, inputs.r7715505d) !== 0) {
      const seed = hud770915Seed(inputs.p183004, inputs.p18300458);
      const d = hud770915Draw(seed);
      if (d.fatal === 0 &&
          (hud770915Hit(d.draw) !== 0 ||
           hud770915TailGate(inputs.game26614) !== 0)) {
        exitKind = HUD_7706E0_EXIT_TRUE_9;
        result = 1;
        done = true;
        armBitsOut |= HUD_7706E0_ARM_BIT_9;
      }
    }
  } else if (arm3b !== 0) {
    stages |= HUD_7706E0_STAGE_7DA770;
    edges += 1;
    exitKind = HUD_7706E0_EXIT_TRUE_3B;
    result = 1;
    done = true;
    armBitsOut |= HUD_7706E0_ARM_BIT_3B;
  } else if (armBits !== 0) {
    exitKind = HUD_7706E0_EXIT_TRUE_BITS;
    result = 1;
    done = true;
    if (id === HUD_7706E0_ID_131) armBitsOut |= HUD_7706E0_ARM_BIT_131;
    else if (id === HUD_7706E0_ID_101) armBitsOut |= HUD_7706E0_ARM_BIT_101;
    else if (id === HUD_7706E0_ID_E7) armBitsOut |= HUD_7706E0_ARM_BIT_E7;
    else armBitsOut |= HUD_7706E0_ARM_BIT_B6;
  }

  if (!done) {
    stages |= HUD_7706E0_STAGE_7DB8D0;
    edges += 1;
    if (arm14a99 !== 0) {
      exitKind = HUD_7706E0_EXIT_TRUE_14A99;
      result = 1;
      done = true;
      armBitsOut |= id === HUD_7706E0_ID_14A
        ? HUD_7706E0_ARM_BIT_14A : HUD_7706E0_ARM_BIT_99;
    }
  }

  if (!done) {
    stages |= HUD_7706E0_STAGE_LADDER;
    edges += ladderOpen !== 0 ? 3 : 1;
    if (ladderOpen !== 0) {
      const d = hud770a7eDraw(inputs.countB, inputs.extra);
      if (id === hud770a7eTableEntry(d.draw)) {
        exitKind = HUD_7706E0_EXIT_TRUE_LADDER;
        result = 1;
        done = true;
      }
    }
  }

  if (!done) {
    stages |= HUD_7706E0_STAGE_TAIL;
    if (id === HUD_7706E0_ID_76 && (u32(inputs.r771200) & 0xff) === 0) {
      stages |= HUD_7706E0_STAGE_76_ARM;
      armBitsOut |= HUD_7706E0_ARM_BIT_76;
    }
    if (tailGate !== 0) {
      exitKind = HUD_7706E0_EXIT_TRUE_TAILGATE;
      result = 1;
    }
  }

  return {
    exitKind, result, stages, armBits: armBitsOut, hostEdgeCount: edges,
    interiorFalse, heldTrue, idNegative, flagEpilogue,
    arm147148: arm147148Open !== 0
      ? hud7706e0Arm147148Hit(id, inputs.r77155015, mod4,
                              inputs.count7cb6e0) : 0,
    arm139, roomGame, arm9: 0, arm3b, bitArm: armBits, arm14a99,
    ladderOpen, ladderHit: 0, arm76, tailGate,
  };
}

/* ============ ABI v31 (1): the HasCollectible sibling leaf 0x00771620
   (`bool __thiscall has(p, id)`, ret 4; the first caller-bearing
   unlanded PURE body of the hud-v31-scan band). width = 1 + LOW(r_8b)
   != 0 || LOW(r_1ca) != 0 (the 0x1ca call short-circuited when the 0x8b
   call opened, 0x77163f jne); slot scan p+0x16c0 stride 4 i < width
   UNSIGNED (jb) with (slot & 0x7fff) == id FULL + 0x8000 bit; list word
   (i16)[p[0x1748] + id*4 + 2] > 0 SIGNED (jg); held (p[0x2ef8] &
   0x7fff) == id FULL + 0x8000 bit. Byte gates uint32 + & 0xff. ============ */

export const HUD_771620_VA_HEAD = 0x00771620;
export const HUD_771620_VA_WIDTH_1 = 0x0077162b;
export const HUD_771620_VA_WIDTH_2 = 0x00771653;
export const HUD_771620_VA_CALL_8B = 0x00771638;
export const HUD_771620_VA_TEST_8B = 0x0077163d;
export const HUD_771620_VA_CALL_1CA = 0x0077164a;
export const HUD_771620_VA_TEST_1CA = 0x0077164f;
export const HUD_771620_VA_SLOTS_LEA = 0x00771658;
export const HUD_771620_VA_SLOT_LOAD = 0x00771663;
export const HUD_771620_VA_SLOT_AND = 0x00771667;
export const HUD_771620_VA_SLOT_CMP = 0x0077166c;
export const HUD_771620_VA_SLOT_TEST = 0x00771670;
export const HUD_771620_VA_SLOT_JNE_TRUE = 0x00771676;
export const HUD_771620_VA_LOOP_CMP = 0x0077167c;
export const HUD_771620_VA_LOOP_JB = 0x0077167e;
export const HUD_771620_VA_LIST_LOAD = 0x00771683;
export const HUD_771620_VA_WORD_CMP = 0x00771689;
export const HUD_771620_VA_WORD_JG = 0x0077168f;
export const HUD_771620_VA_HELD_LOAD = 0x00771691;
export const HUD_771620_VA_HELD_AND = 0x00771699;
export const HUD_771620_VA_HELD_CMP = 0x0077169e;
export const HUD_771620_VA_HELD_JNE_FALSE = 0x007716a0;
export const HUD_771620_VA_HELD_TEST = 0x007716a2;
export const HUD_771620_VA_HELD_JNE_TRUE = 0x007716a8;
export const HUD_771620_VA_FALSE = 0x007716aa;
export const HUD_771620_VA_RET_FALSE = 0x007716b2;
export const HUD_771620_VA_TRUE = 0x007716b5;
export const HUD_771620_VA_RET_TRUE = 0x007716bd;
export const HUD_771620_HOST_VA_7706E0 = 0x007706e0;
export const HUD_771620_OFF_SLOTS = 0x16c0;
export const HUD_771620_OFF_LIST = 0x1748;
export const HUD_771620_OFF_HELD = 0x2ef8;
export const HUD_771620_OFF_WORD = 2;
export const HUD_771620_ID_8B = 0x8b;
export const HUD_771620_ID_1CA = 0x1ca;
export const HUD_771620_SLOT_MASK = 0x7fff;
export const HUD_771620_SLOT_BIT = 0x8000;
export const HUD_771620_WIDTH_BASE = 1;
export const HUD_771620_ARG_FLAG = 0;
export const HUD_771620_STAGE_SLOT = 1;
export const HUD_771620_STAGE_LIST = 2;
export const HUD_771620_STAGE_HELD = 4;

/* 0x77163d test al,al ; jne 0x771653 — LOW byte of the 0x8b call. */
export function hud771620EightBOpen(r8b) {
  return (u32(r8b) & 0xff) !== 0 ? 1 : 0;
}

/* 0x77164f test al,al ; je 0x771658 — LOW byte of the 0x1ca call. */
export function hud771620OneCaOpen(r1ca) {
  return (u32(r1ca) & 0xff) !== 0 ? 1 : 0;
}

/* 0x77162b/0x771653 — width 1 + (8b open || 1ca open). */
export function hud771620ScanWidth(r8b, r1ca) {
  return HUD_771620_WIDTH_BASE +
    (hud771620EightBOpen(r8b) !== 0 || hud771620OneCaOpen(r1ca) !== 0
      ? 1 : 0);
}

/* 0x77163f jne — the 0x1ca call fires ONLY when the 0x8b call closed. */
export function hud771620OneCaEdgeNeeded(r8b) {
  return hud771620EightBOpen(r8b) === 0 ? 1 : 0;
}

/* 0x771667 and 0x7fff ; cmp FULL ; test 0x8000 ; jne TRUE. */
export function hud771620SlotHit(slot, id) {
  if (u32(slot & HUD_771620_SLOT_MASK) !== u32(id)) return 0;
  return (u32(slot) & HUD_771620_SLOT_BIT) !== 0 ? 1 : 0;
}

/* 0x77167c cmp ecx,edi ; jb — UNSIGNED loop bound. */
export function hud771620LoopContinue(index, width) {
  return u32(index) < u32(width) ? 1 : 0;
}

/* 0x771689 cmp word ptr,0 ; jg — SIGNED 16-bit (0xffff = -1 closed). */
export function hud771620ListWordTrue(word) {
  return (((u32(word) << 16) >> 16) | 0) > 0 ? 1 : 0;
}

/* 0x771699..0x7716a8 — (held & 0x7fff) == id FULL + 0x8000 bit. */
export function hud771620HeldTrue(held, id) {
  if (u32(held & HUD_771620_SLOT_MASK) !== u32(id)) return 0;
  return (u32(held) & HUD_771620_SLOT_BIT) !== 0 ? 1 : 0;
}

/* Composed plan (L9): slot scan -> list word -> held; TRUE exit
   0x7716b5 (shared); slot1 consumed only when width == 2. */
export function hud771620Plan(inputs) {
  const id = u32(inputs.id);
  const width = hud771620ScanWidth(inputs.r8b, inputs.r1ca);
  const edge = 1 + hud771620OneCaEdgeNeeded(inputs.r8b);
  const s0 = hud771620SlotHit(inputs.slot0, id);
  const s1 = width === 2 ? hud771620SlotHit(inputs.slot1, id) : 0;
  const word = hud771620ListWordTrue(inputs.listWord);
  const held = hud771620HeldTrue(inputs.held, id);

  let result;
  let stages;
  if (s0 !== 0 || s1 !== 0) {
    result = 1;
    stages = HUD_771620_STAGE_SLOT;
  } else if (word !== 0) {
    result = 1;
    stages = HUD_771620_STAGE_SLOT | HUD_771620_STAGE_LIST;
  } else if (held !== 0) {
    result = 1;
    stages = HUD_771620_STAGE_SLOT | HUD_771620_STAGE_LIST |
      HUD_771620_STAGE_HELD;
  } else {
    result = 0;
    stages = HUD_771620_STAGE_SLOT | HUD_771620_STAGE_LIST |
      HUD_771620_STAGE_HELD;
  }

  return {
    result, stages, hostEdgeCount: edge, width,
    eightBOpen: hud771620EightBOpen(inputs.r8b),
    oneCaOpen: hud771620OneCaOpen(inputs.r1ca),
    oneCaEdge: hud771620OneCaEdgeNeeded(inputs.r8b),
    slot0Hit: s0, slot1Hit: s1, listWordTrue: word, heldTrue: held,
  };
}

/* ============ ABI v32: the HasCollectible sibling-family leaf
   0x007716c0 (`bool __stdcall is_trinket_id(id)`, ret 4; the
   hud-v31-scan "next frontier" — PURE leaf, 0 E8 / 0 ind / 0 stores,
   2 callers 0x6ec2f2 + 0x77174d). FULL dword id arg; masked = id &
   0x7fff (UNSIGNED); TRUE iff masked == 0x29 || == 0x87 (shared TRUE
   exit 0x7716dd; FALSE epilogue 0x7716d7). NO byte gates (no test
   al/al — full-dword equality after the full-dword and), NO signed
   compare. ============ */

export const HUD_7716C0_VA_HEAD = 0x007716c0;
export const HUD_7716C0_VA_AND = 0x007716c6;
export const HUD_7716C0_VA_CMP_A = 0x007716cb;
export const HUD_7716C0_VA_JE_A = 0x007716ce;
export const HUD_7716C0_VA_CMP_B = 0x007716d0;
export const HUD_7716C0_VA_JE_B = 0x007716d5;
export const HUD_7716C0_VA_FALSE = 0x007716d7;
export const HUD_7716C0_VA_RET_FALSE = 0x007716da;
export const HUD_7716C0_VA_TRUE = 0x007716dd;
export const HUD_7716C0_VA_RET_TRUE = 0x007716e0;
export const HUD_7716C0_ID_A = 0x29;
export const HUD_7716C0_ID_B = 0x87;
export const HUD_7716C0_ID_MASK = 0x7fff;
export const HUD_7716C0_STAGE_COMPARE = 1;

/* 0x7716c6 and eax,0x7fff — FULL dword mask (bit 15 cleared). */
export function hud7716c0IdMasked(id) {
  return u32(id & HUD_7716C0_ID_MASK);
}

/* 0x7716cb cmp eax,0x29 ; 0x7716ce je 0x7716dd — FULL equality. */
export function hud7716c0OpenA(id) {
  return hud7716c0IdMasked(id) === HUD_7716C0_ID_A ? 1 : 0;
}

/* 0x7716d0 cmp eax,0x87 ; 0x7716d5 je 0x7716dd — FULL equality. */
export function hud7716c0OpenB(id) {
  return hud7716c0IdMasked(id) === HUD_7716C0_ID_B ? 1 : 0;
}

/* TRUE exit 0x7716dd (shared); FALSE epilogue 0x7716d7. */
export function hud7716c0Result(id) {
  return (hud7716c0OpenA(id) !== 0 || hud7716c0OpenB(id) !== 0) ? 1 : 0;
}

/* Composed plan: masked -> open_a -> open_b -> exit; single
   straight-line stage; hostEdgeCount 0 (no E8 in the body). */
export function hud7716c0Plan({ id = 0 } = {}) {
  const masked = hud7716c0IdMasked(id);
  const openA = hud7716c0OpenA(id);
  const openB = hud7716c0OpenB(id);
  return {
    result: (openA !== 0 || openB !== 0) ? 1 : 0,
    stages: HUD_7716C0_STAGE_COMPARE,
    hostEdgeCount: 0,
    maskedId: masked,
    openA,
    openB,
  };
}

/* ============ ABI v33: the HasCollectible sibling-family WIDTH leaf
   0x007717c0 (`int __thiscall collectible_width(player)`, ret c3 —
   NO stack args). The "missed body" class: the hud-v31-scan band
   table CONFLATED this body INSIDE the 0x7716f0 HOST row (0x7716f0's
   FALSE-epilogue ret @0x7717bb followed by a 2-byte int3 pad;
   decode_span's >=3-byte pad stop walked through); the corrected
   re-scan's E8-target entry list caught it — 4 callers 0x68ecc7 /
   0x68ef35 / 0x6ec314 / 0x778df9. width = 1 + (LOW(r_8b) != 0 ||
   LOW(r_1ca) != 0); the 0x1ca edge is SHORT-CIRCUITED when
   LOW(r_8b) != 0 (0x7717d1 jne 0x7717ea). Byte gates (u32 & 0xff,
   0x100 CLOSED); no signed compare (je/jne zero-tests only).
   ============ */

export const HUD_7717C0_VA_HEAD = 0x007717c0;
export const HUD_7717C0_VA_CALL_8B = 0x007717ca;
export const HUD_7717C0_VA_TEST_8B = 0x007717cf;
export const HUD_7717C0_VA_JNE_8B = 0x007717d1;
export const HUD_7717C0_VA_CALL_1CA = 0x007717dc;
export const HUD_7717C0_VA_TEST_1CA = 0x007717e1;
export const HUD_7717C0_VA_WIDTH_1 = 0x007717e3;
export const HUD_7717C0_VA_JE_1CA = 0x007717e8;
export const HUD_7717C0_VA_WIDTH_2 = 0x007717ea;
export const HUD_7717C0_VA_RET = 0x007717f0;
export const HUD_7717C0_ID_8B = 0x8b;
export const HUD_7717C0_ID_1CA = 0x1ca;
export const HUD_7717C0_FLAG = 0;
export const HUD_7717C0_WIDTH_BASE = 1;
export const HUD_7717C0_HOST_7706E0 = 0x007706e0;
export const HUD_7717C0_STAGE_8B = 1;
export const HUD_7717C0_STAGE_1CA = 2;

/* 0x7717cf test al,al ; 0x7717d1 jne 0x7717ea — LOW byte of the
   HasCollectible(p, 0x8b, 0) result. */
export function hud7717c0EightBOpen(r8b) {
  return u32(r8b & 0xff) !== 0 ? 1 : 0;
}

/* 0x7717e1 test al,al ; 0x7717e8 je 0x7717ef — LOW byte of the
   HasCollectible(p, 0x1ca, 0) result. */
export function hud7717c0OneCaOpen(r1ca) {
  return u32(r1ca & 0xff) !== 0 ? 1 : 0;
}

/* 0x7717d1 jne 0x7717ea — the 0x1ca edge fires ONLY when the 0x8b
   edge closed (hostEdgeCount = 1 + this). */
export function hud7717c0OneCaEdgeNeeded(r8b) {
  return hud7717c0EightBOpen(r8b) === 0 ? 1 : 0;
}

/* 0x7717e3 mov eax,1 ; 0x7717ea mov eax,2 — width = 1 + (L1 || L2). */
export function hud7717c0Width(r8b, r1ca) {
  return HUD_7717C0_WIDTH_BASE +
    (hud7717c0EightBOpen(r8b) !== 0 || hud7717c0OneCaOpen(r1ca) !== 0);
}

/* Composed plan: stage 8b -> (open ? width 2, no 1ca edge) ->
   stage 1ca -> width 1/2; hostEdgeCount = 1 + oneCaEdge;
   pureComplete 1 (both edges in-family landed laws). */
export function hud7717c0Plan({ r8b = 0, r1ca = 0 } = {}) {
  const r8bOpen = hud7717c0EightBOpen(r8b);
  const r1caOpen = hud7717c0OneCaOpen(r1ca);
  const oneCaEdge = hud7717c0OneCaEdgeNeeded(r8b);
  return {
    result: HUD_7717C0_WIDTH_BASE + (r8bOpen !== 0 || r1caOpen !== 0),
    stages: HUD_7717C0_STAGE_8B | (oneCaEdge !== 0 ? HUD_7717C0_STAGE_1CA : 0),
    hostEdgeCount: 1 + oneCaEdge,
    pureComplete: 1,
    r8bOpen,
    r1caOpen,
    oneCaEdge,
  };
}

/* ============ ABI v34: the 0x007716f0 loop-control islands
   (NARROWED — the body is the virtual-eax HOST of the
   0x7716c0/0x7716f0 sibling pair; Lua registration names it
   "TryHoldTrinket", evidence note only). Body 0x007716f0..0x007717bb
   (ret 4; 1 caller 0x6ec22a). E8 census: 2 x 0x7706e0 (landed
   v25-v30) + 1 x 0x7716c0 (landed v32); indirect 1: the HOST virtual
   edge (*(*(game+0x26620)))[0x50](p) @0x77177c — sampled r_v.
   Store census: 2 in-frame cookie locals, zero observable. The loop
   walks player+0x16c0 (stride 4) with the width RECOMPUTED at every
   loop back (0x771706) — the recompute is byte-identical to the
   v33 0x7717c0 width leaf, so hud7717c0Width is REUSED (never
   re-derived). Gates: loop jae UNSIGNED (0x771738), masked_35 FULL
   (0x771745), iso LOW test (0x771752), slot_zero FULL (0x77175c),
   game gate SIGNED jl 0x77176c, virtual LOW test (0x77177e), slot
   dispatch FULL (0x771782..0x771793), bl LOW test (0x771795). The
   r_v==0 virtual edge STILL reaches the bl gate (0x771780 jmp
   merge). ============ */

export const HUD_7716F0_VA_HEAD = 0x007716f0;
export const HUD_7716F0_VA_WIDTH_1 = 0x00771712;
export const HUD_7716F0_VA_CALL_8B = 0x00771717;
export const HUD_7716F0_VA_TEST_8B = 0x0077171c;
export const HUD_7716F0_VA_JNE_8B = 0x0077171e;
export const HUD_7716F0_VA_CALL_1CA = 0x0077172a;
export const HUD_7716F0_VA_TEST_1CA = 0x0077172f;
export const HUD_7716F0_VA_JE_1CA = 0x00771731;
export const HUD_7716F0_VA_WIDTH_2 = 0x00771733;
export const HUD_7716F0_VA_LOOP_CMP = 0x00771738;
export const HUD_7716F0_VA_LOOP_JAE = 0x0077173a;
export const HUD_7716F0_VA_SLOT_LOAD = 0x0077173c;
export const HUD_7716F0_VA_SLOT_AND = 0x00771740;
export const HUD_7716F0_VA_SLOT_CMP = 0x00771745;
export const HUD_7716F0_VA_SLOT_JNE = 0x00771748;
export const HUD_7716F0_VA_CALL_7716C0 = 0x0077174d;
export const HUD_7716F0_VA_TEST_ISO = 0x00771752;
export const HUD_7716F0_VA_JE_ISO = 0x00771754;
export const HUD_7716F0_VA_BL_1 = 0x00771756;
export const HUD_7716F0_VA_BL_0 = 0x0077175a;
export const HUD_7716F0_VA_SLOT_TEST = 0x0077175c;
export const HUD_7716F0_VA_JE_SLOT_ZERO = 0x0077175e;
export const HUD_7716F0_VA_GAME_LOAD = 0x00771760;
export const HUD_7716F0_VA_GAME_CMP = 0x00771765;
export const HUD_7716F0_VA_GAME_JL = 0x0077176c;
export const HUD_7716F0_VA_VTABLE_LOAD = 0x0077176e;
export const HUD_7716F0_VA_VIRTUAL_CALL = 0x0077177c;
export const HUD_7716F0_VA_TEST_V = 0x0077177e;
export const HUD_7716F0_VA_DISP_CMP_35 = 0x00771782;
export const HUD_7716F0_VA_DISP_JE_35 = 0x00771785;
export const HUD_7716F0_VA_DISP_CMP_40 = 0x00771787;
export const HUD_7716F0_VA_DISP_JNE_40 = 0x0077178a;
export const HUD_7716F0_VA_DISP_CMP_1C = 0x0077178c;
export const HUD_7716F0_VA_MERGE_JNE = 0x00771793;
export const HUD_7716F0_VA_BL_TEST = 0x00771795;
export const HUD_7716F0_VA_BL_JNE = 0x00771797;
export const HUD_7716F0_VA_LOOP_CONT = 0x00771799;
export const HUD_7716F0_VA_LOOP_INC = 0x0077179c;
export const HUD_7716F0_VA_LOOP_BACK = 0x007717a3;
export const HUD_7716F0_VA_TRUE = 0x007717a8;
export const HUD_7716F0_VA_RET_TRUE = 0x007717b0;
export const HUD_7716F0_VA_FALSE = 0x007717b3;
export const HUD_7716F0_VA_RET_FALSE = 0x007717bb;
export const HUD_7716F0_OFF_SLOTS = 0x16c0;
export const HUD_7716F0_SLOT_STRIDE = 4;
export const HUD_7716F0_SLOT_MASK = 0x7fff;
export const HUD_7716F0_SLOT_35 = 0x35;
export const HUD_7716F0_SLOT_40 = 0x40;
export const HUD_7716F0_GAME_GLOBAL = 0x00c71678;
export const HUD_7716F0_GAME_FIELD_26614 = 0x26614;
export const HUD_7716F0_GAME_FIELD_26620 = 0x26620;
export const HUD_7716F0_GAME_FIELD_26584 = 0x26584;
export const HUD_7716F0_GAME_GATE_MIN = 2;
export const HUD_7716F0_GAME_DISPATCH_MODE = 0x1c;
export const HUD_7716F0_HOST_VTABLE_ENTRY = 0x50;
export const HUD_7716F0_HOST_VA_7706E0 = 0x007706e0;
export const HUD_7716F0_HOST_VA_7716C0 = 0x007716c0;
export const HUD_7716F0_HOST_VA_VIRTUAL = 0;
export const HUD_7716F0_STAGE_8B = 1;
export const HUD_7716F0_STAGE_1CA = 2;
export const HUD_7716F0_STAGE_ISO = 4;
export const HUD_7716F0_STAGE_VIRTUAL = 8;
export const HUD_7716F0_EXIT_CONTINUE = 0;
export const HUD_7716F0_EXIT_TRUE = 1;
export const HUD_7716F0_EXIT_FALSE = 2;
export const HUD_7716F0_ITER_CAP = 2;

/* 0x771738 cmp edi,esi ; 0x77173a jae 0x7717b3 — UNSIGNED: the
   iteration runs while index < width. */
export function hud7716f0LoopContinue(index, width) {
  return u32(index) < u32(width) ? 1 : 0;
}

/* 0x771740 and eax,0x7fff ; 0x771745 cmp eax,0x35 ; 0x771748 jne —
   FULL mask + FULL equality (bit 15 cleared). */
export function hud7716f0Masked35(slot) {
  return u32(slot & HUD_7716F0_SLOT_MASK) === HUD_7716F0_SLOT_35 ? 1 : 0;
}

/* 0x771752 test al,al ; 0x771754 je 0x77175a — LOW byte of the
   0x7716c0(arg) result (the v32 is_trinket_id leaf). */
export function hud7716f0IsoOpen(rIso) {
  return u32(rIso & 0xff) !== 0 ? 1 : 0;
}

/* 0x771756 mov bl,1 / 0x77175a xor bl,bl — masked_35 AND iso_open. */
export function hud7716f0BlSet(slot, rIso) {
  return (hud7716f0Masked35(slot) !== 0 && hud7716f0IsoOpen(rIso) !== 0)
    ? 1 : 0;
}

/* 0x77175c test ecx,ecx ; 0x77175e je 0x7717a8 — FULL dword zero
   test on the slot: 0 -> early TRUE exit. */
export function hud7716f0SlotZero(slot) {
  return u32(slot) === 0 ? 1 : 0;
}

/* 0x771765 cmp [eax+0x26614],2 ; 0x77176c jl 0x771782 — SIGNED
   (int32) game+0x26614 >= 2 opens the virtual edge. */
export function hud7716f0GameGate(game26614) {
  return i32(game26614) >= HUD_7716F0_GAME_GATE_MIN ? 1 : 0;
}

/* 0x77177e test al,al ; 0x771793 jne 0x7717a8 — LOW byte of the
   virtual edge result (consumed iff the edge fires). */
export function hud7716f0VirtualTrue(rV) {
  return u32(rV & 0xff) !== 0 ? 1 : 0;
}

/* 0x771782..0x771793 — FULL dword dispatch on the game-gate-closed
   path: slot==0x35 -> bl gate; slot==0x40 && game+0x26584==0x1c ->
   bl gate; else TRUE exit. 1 = the bl gate is reached. */
export function hud7716f0DispatchGate(slot, game26584) {
  return (u32(slot) === HUD_7716F0_SLOT_35 ||
          (u32(slot) === HUD_7716F0_SLOT_40 &&
           u32(game26584) === HUD_7716F0_GAME_DISPATCH_MODE)) ? 1 : 0;
}

/* 0x771795 test bl,bl ; 0x771797 jne 0x7717a8 — LOW byte of bl:
   nonzero -> TRUE exit. */
export function hud7716f0BlGate(bl) {
  return u32(bl & 0xff) !== 0 ? 1 : 0;
}

/* Composed machine-order continuation: loop gate AND !slot_zero AND
   !bl AND (game_gate ? !virtual_true : dispatch_gate). The r_v==0
   virtual edge still reaches the bl gate (0x771780 jmp 0x771793). */
export function hud7716f0IterContinue({
  index = 0, width = 1, slot = 0, rIso = 0,
  game26614 = 0, game26584 = 0, rV = 0,
} = {}) {
  if (hud7716f0LoopContinue(index, width) === 0) return 0;
  if (hud7716f0SlotZero(slot) !== 0) return 0;
  if (hud7716f0BlSet(slot, rIso) !== 0) return 0;
  if (hud7716f0GameGate(game26614) !== 0) {
    if (hud7716f0VirtualTrue(rV) !== 0) return 0;
  } else if (hud7716f0DispatchGate(slot, game26584) === 0) {
    return 0;
  }
  return 1;
}

/* Per-iteration composed plan (one loop pass). exitKind:
   EXIT_FALSE (loop gate closed) / EXIT_TRUE (any TRUE exit) /
   EXIT_CONTINUE (all gates passed). virtualEdge = slot != 0 &&
   game_gate (the host edge; the slot==0 early TRUE skips it).
   hostEdgeCount = 1 [0x8b] + (LOW(r_8b)==0 ? 1 : 0) [0x1ca] +
   isoEdge [masked_35] + virtualEdge. pureComplete = 1 iff the
   iteration fired no host edge. */
export function hud7716f0IterPlan({
  index = 0, r8b = 0, r1ca = 0, slot = 0, rIso = 0,
  game26614 = 0, game26584 = 0, rV = 0,
} = {}) {
  const width = hud7717c0Width(r8b, r1ca);
  const loopContinue = hud7716f0LoopContinue(index, width);
  const masked35 = hud7716f0Masked35(slot);
  const isoEdge = masked35;
  const bl = (masked35 !== 0 && hud7716f0IsoOpen(rIso) !== 0) ? 1 : 0;
  const slotZero = hud7716f0SlotZero(slot);
  const gameGate = hud7716f0GameGate(game26614);
  const virtualEdge = (slotZero === 0 && gameGate !== 0) ? 1 : 0;
  const virtualTrue = hud7716f0VirtualTrue(rV);
  const dispatchGate = hud7716f0DispatchGate(slot, game26584);
  const blGate = hud7716f0BlGate(bl);
  let exitKind = HUD_7716F0_EXIT_CONTINUE;
  if (loopContinue === 0) {
    exitKind = HUD_7716F0_EXIT_FALSE;
  } else if (slotZero !== 0 ||
             (gameGate !== 0 && virtualTrue !== 0) ||
             (gameGate === 0 && dispatchGate === 0) ||
             blGate !== 0) {
    exitKind = HUD_7716F0_EXIT_TRUE;
  }
  const oneCaEdge = hud7717c0OneCaEdgeNeeded(r8b);
  const hostEdgeCount = 1 + oneCaEdge + isoEdge + virtualEdge;
  return {
    width,
    loopContinue,
    masked35,
    isoEdge,
    bl,
    slotZero,
    gameGate,
    virtualEdge,
    virtualTrue,
    dispatchGate,
    blGate,
    exitKind,
    hostEdgeCount,
    pureComplete: virtualEdge === 0 ? 1 : 0,
  };
}

/* Full-body composed plan over both iterations. Iteration 1's
   samples are consumed (edges counted, gates evaluated as exits)
   only when iteration 0 CONTINUED — the PE recomputes the width at
   the 0x7717a3 loop back before the iteration-1 0x8b call. result
   = the ret-4 value (1 TRUE / 0 FALSE); exitKind = EXIT_TRUE /
   EXIT_FALSE for the whole call (a CONTINUE at i==1 resolves to
   FALSE at the next gate: i==2 >= width, width <= 2). */
export function hud7716f0Plan({
  r8b0 = 0, r1ca0 = 0, slot0 = 0, rIso0 = 0,
  game26614_0 = 0, game26584_0 = 0, rV0 = 0,
  r8b1 = 0, r1ca1 = 0, slot1 = 0, rIso1 = 0,
  game26614_1 = 0, game26584_1 = 0, rV1 = 0,
} = {}) {
  const it0 = hud7716f0IterPlan({
    index: 0, r8b: r8b0, r1ca: r1ca0, slot: slot0, rIso: rIso0,
    game26614: game26614_0, game26584: game26584_0, rV: rV0,
  });
  const it1 = hud7716f0IterPlan({
    index: 1, r8b: r8b1, r1ca: r1ca1, slot: slot1, rIso: rIso1,
    game26614: game26614_1, game26584: game26584_1, rV: rV1,
  });
  const iter1Ran = it0.exitKind === HUD_7716F0_EXIT_CONTINUE ? 1 : 0;
  let result = 0;
  let exitKind = HUD_7716F0_EXIT_FALSE;
  if (it0.exitKind === HUD_7716F0_EXIT_TRUE ||
      (iter1Ran !== 0 && it1.exitKind === HUD_7716F0_EXIT_TRUE)) {
    result = 1;
    exitKind = HUD_7716F0_EXIT_TRUE;
  }
  const hostEdgeCount =
    it0.hostEdgeCount + (iter1Ran !== 0 ? it1.hostEdgeCount : 0);
  const pureComplete =
    (it0.virtualEdge === 0 && (iter1Ran === 0 || it1.virtualEdge === 0))
      ? 1 : 0;
  return {
    width0: it0.width,
    loopContinue0: it0.loopContinue,
    masked350: it0.masked35,
    isoEdge0: it0.isoEdge,
    bl0: it0.bl,
    slotZero0: it0.slotZero,
    gameGate0: it0.gameGate,
    virtualEdge0: it0.virtualEdge,
    virtualTrue0: it0.virtualTrue,
    dispatchGate0: it0.dispatchGate,
    blGate0: it0.blGate,
    exit0: it0.exitKind,
    width1: it1.width,
    loopContinue1: it1.loopContinue,
    masked351: it1.masked35,
    isoEdge1: it1.isoEdge,
    bl1: it1.bl,
    slotZero1: it1.slotZero,
    gameGate1: it1.gameGate,
    virtualEdge1: it1.virtualEdge,
    virtualTrue1: it1.virtualTrue,
    dispatchGate1: it1.dispatchGate,
    blGate1: it1.blGate,
    exit1: it1.exitKind,
    iter1Ran,
    result,
    exitKind,
    hostEdgeCount,
    pureComplete,
  };
}


/* ============ ABI v35: the 0x76143f CALLER-GUARD laws (the v34
   handoff candidate "0x770ca0 caller guards (0x76143f cmp
   [edi+0x15e0],0x226 gate class)" — band 0x770000..0x772000
   PURE-EXHAUSTED; the 0x770ca0 HOST row itself is ZHL-named
   Entity_Player::GetCollectibleNum (W29-C4 16-byte exact), the
   translatable surface is the caller-guard layer at 0x76143f —
   HasCollectible(p,0x226,0) (0x007706e0, LANDED v25-v30, an
   UNCONDITIONAL in-family call) inside draw span A 0x760c8c..
   0x762d4c). Region 0x7613e8..0x7614b4 (54 insns, E8 5, ind 0,
   mem-stores 3 all the in-frame cookie [ebp-0x1c8] — zero
   observable). Machine order: acc = sum(0x15ac,0x15a8); FULL-dword
   gate A [edi+0x15c0]==0x226 (cmp dword ; jne 0x761418) -> acc =
   sum(0x15cc,0x15c8); FULL-dword gate B [edi+0x15e0]==0x226
   (cmp dword ; jne 0x761436) -> acc = sum(0x15ec,0x15e8) — LAST
   match wins; call 0x7706e0(p,0x226,0) UNCONDITIONAL (0x76143f,
   in-family sample r_226); LOW(r_226)!=0 (test al,al 0x761444 ;
   je 0x762806) opens the block: 0x78f840 x2 (0x226/0x227) +
   0x75f0e0 (0x228) — host edges — then the pure 4-slot 0x228 scan
   (stride 0x20, FULL cmp dword, je; UNSIGNED jb eax,4), SIGNED
   index js gate (0x7614a0), 0x791420(p, acc, idx) with the SELECTED
   accumulator, merge 0x762806. Gates FULL-dword except r_226
   (LOW byte, 0x100 CLOSED). ============ */

export const HUD_76143F_VA_GATE_15C0 = 0x007613fa;
export const HUD_76143F_VA_JNE_15C0 = 0x00761404;
export const HUD_76143F_VA_SUM_15C0 = 0x00761406;
export const HUD_76143F_VA_STORE_15C0 = 0x00761412;
export const HUD_76143F_VA_GATE_15E0 = 0x00761418;
export const HUD_76143F_VA_JNE_15E0 = 0x00761422;
export const HUD_76143F_VA_SUM_15E0 = 0x00761424;
export const HUD_76143F_VA_STORE_15E0 = 0x00761430;
export const HUD_76143F_VA_CALL_HAS = 0x0076143f;
export const HUD_76143F_VA_TEST_AL = 0x00761444;
export const HUD_76143F_VA_JE_SKIP = 0x00761446;
export const HUD_76143F_VA_BLOCK = 0x0076144c;
export const HUD_76143F_VA_CALL2_A = 0x00761459;
export const HUD_76143F_VA_CALL2_B = 0x0076146b;
export const HUD_76143F_VA_CALL3 = 0x00761481;
export const HUD_76143F_VA_SCAN_CMP = 0x00761488;
export const HUD_76143F_VA_SCAN_JE = 0x0076148e;
export const HUD_76143F_VA_SCAN_INC = 0x00761490;
export const HUD_76143F_VA_SCAN_STRIDE = 0x00761491;
export const HUD_76143F_VA_SCAN_CMP_4 = 0x00761494;
export const HUD_76143F_VA_SCAN_JB = 0x00761497;
export const HUD_76143F_VA_SCAN_FAIL = 0x00761499;
export const HUD_76143F_VA_SCAN_FOUND = 0x0076149e;
export const HUD_76143F_VA_TEST_IDX = 0x007614a0;
export const HUD_76143F_VA_PUSH_ACC = 0x007614a7;
export const HUD_76143F_VA_CALL4 = 0x007614af;
export const HUD_76143F_VA_MERGE = 0x007614b4;
export const HUD_76143F_VA_SKIP = 0x00762806;
export const HUD_76143F_OFF_BASE_LO = 0x15a8;
export const HUD_76143F_OFF_BASE_HI = 0x15ac;
export const HUD_76143F_OFF_15C0 = 0x15c0;
export const HUD_76143F_OFF_15C8 = 0x15c8;
export const HUD_76143F_OFF_15CC = 0x15cc;
export const HUD_76143F_OFF_15E0 = 0x15e0;
export const HUD_76143F_OFF_15E8 = 0x15e8;
export const HUD_76143F_OFF_15EC = 0x15ec;
export const HUD_76143F_ACC_COOKIE_OFF = 0x1c8;
export const HUD_76143F_CLASS_226 = 0x226;
export const HUD_76143F_SCAN_ID = 0x228;
export const HUD_76143F_SCAN_COUNT = 4;
export const HUD_76143F_SCAN_STRIDE = 0x20;
export const HUD_76143F_HOST_7706E0 = 0x007706e0;
export const HUD_76143F_HOST_78F840 = 0x0078f840;
export const HUD_76143F_HOST_75F0E0 = 0x0075f0e0;
export const HUD_76143F_HOST_791420 = 0x00791420;
export const HUD_76143F_STAGE_BASE = 1;
export const HUD_76143F_STAGE_15C0 = 2;
export const HUD_76143F_STAGE_15E0 = 4;

/* 0x7613fa / 0x761418 cmp dword [reg+off],0x226 — FULL 32-bit
   equality (0x100226 must NOT open). */
export function hud76143fClass226(field) {
  return u32(field) === HUD_76143F_CLASS_226 ? 1 : 0;
}

/* 0x7613ee / 0x76140c / 0x76142a add eax,[reg+off] — 32-bit
   wrapping add of the two field dwords. */
export function hud76143fPairSum(lo, hi) {
  return ((u32(lo) + u32(hi)) >>> 0) >>> 0;
}

/* 0x7613e8..0x761430: acc = sum(base_lo,base_hi); if class_226(
   field_15c0): acc = sum(c8,cc); if class_226(field_15e0): acc =
   sum(e8,ec) — the 15e0 write OVERWRITES the 15c0 write (LAST
   match wins). */
export function hud76143fAccumulate({
  baseLo = 0, baseHi = 0, field15c0 = 0, c8 = 0, cc = 0,
  field15e0 = 0, e8 = 0, ec = 0,
} = {}) {
  let acc = hud76143fPairSum(baseLo, baseHi);
  if (hud76143fClass226(field15c0) !== 0) acc = hud76143fPairSum(c8, cc);
  if (hud76143fClass226(field15e0) !== 0) acc = hud76143fPairSum(e8, ec);
  return acc;
}

/* 0x761444 test al,al ; 0x761446 je 0x762806 — LOW byte of the
   in-family 0x7706e0 result (0x100 CLOSED). */
export function hud76143fHasOpen(r226) {
  return u32(r226 & 0xff) !== 0 ? 1 : 0;
}

/* 0x761494 cmp eax,4 ; 0x761497 jb 0x761488 — UNSIGNED loop gate. */
export function hud76143fScanContinue(index) {
  return u32(index) < HUD_76143F_SCAN_COUNT ? 1 : 0;
}

/* 0x761488 cmp dword [esi],0x228 ; 0x76148e je — FULL-dword
   equality (0x100228 must NOT match). */
export function hud76143fScanFound(slot) {
  return u32(slot) === HUD_76143F_SCAN_ID ? 1 : 0;
}

/* 0x761486..0x761499: FIRST index in [0,4) whose slot == 0x228,
   else 4 (the UNSIGNED jb bound runs out). */
export function hud76143fScanIndex(slot0, slot1, slot2, slot3) {
  const slots = [u32(slot0), u32(slot1), u32(slot2), u32(slot3)];
  for (let i = 0; i < HUD_76143F_SCAN_COUNT; i += 1) {
    if (hud76143fScanFound(slots[i]) !== 0) return i;
  }
  return HUD_76143F_SCAN_COUNT;
}

/* 0x76149e test eax,eax ; 0x7614a0 js 0x762806 — SIGNED (int32)
   index >= 0 (structurally dead on-path, pinned class). */
export function hud76143fIdxOk(idx) {
  return i32(idx) >= 0 ? 1 : 0;
}

/* Composed machine-order caller-guard plan. call_fires = 1 (the
   0x7706e0(p,0x226,0) edge is unconditional); has_open opens the
   block (3 + scan-gated edges); host_edge_count = 1 + block_edges;
   pure_complete = 1 iff the block stays closed. */
export function hud76143fGuardPlan({
  baseLo = 0, baseHi = 0, field15c0 = 0, c8 = 0, cc = 0,
  field15e0 = 0, e8 = 0, ec = 0, r226 = 0,
  slot0 = 0, slot1 = 0, slot2 = 0, slot3 = 0,
} = {}) {
  const class15c0 = hud76143fClass226(field15c0);
  const class15e0 = hud76143fClass226(field15e0);
  const acc = hud76143fAccumulate({
    baseLo, baseHi, field15c0, c8, cc, field15e0, e8, ec,
  });
  const hasOpen = hud76143fHasOpen(r226);
  const scanIndex = hud76143fScanIndex(slot0, slot1, slot2, slot3);
  const scanFound = scanIndex < HUD_76143F_SCAN_COUNT ? 1 : 0;
  const idxOk = hud76143fIdxOk(scanIndex);
  let blockEdges = 0;
  if (hasOpen !== 0) {
    blockEdges = 3;
    if (scanFound !== 0 && idxOk !== 0) blockEdges += 1;
  }
  return {
    acc,
    stageBase: 1,
    class15c0,
    stage15c0: class15c0,
    class15e0,
    stage15e0: class15e0,
    callFires: 1,
    hasOpen,
    scanIndex,
    scanFound,
    idxOk,
    blockEdges,
    hostEdgeCount: 1 + blockEdges,
    pureComplete: hasOpen === 0 ? 1 : 0,
  };
}

/* ============ ABI v36: the 0x7616ad CALLER-GUARD laws (the v35
   handoff "span-A 0x7616ad conditional (LOW(r_771550) gate before
   0x771620(p,0x79))" — draw span A 0x760c8c..0x762d4c). The site is
   dispatch case 13 of the span's two-level switch (0x760908 movzx
   byte[eax+0x762f2c] ; 0x76090f jmp [eax*4+0x762ec0], table[13] =
   0x76169a). Bounded block 0x76169a..0x7616bd (14 insns, E8 3, ind 0,
   stores 0): r_1550 = 0x771550(p,0x79,0) UNCONDITIONAL in-family
   v17-narrowed sample (0x7616a0) — the gates decide the LATER edges;
   LOW(r_1550)!=0 (test al,al 0x7616a5 ; je 0x7616bd) -> r_1620 =
   0x771620(p,0x79) in-family v31-landed (0x7616ad); LOW(r_1620)!=0
   (test al,al 0x7616b2 ; jne 0x7616bd) -> host 0x7db0a0(p) (0x7616b8,
   3 callers). Merge 0x7616bd -> host continuation: count=0x7cb6e0(p,
   0x6d) (0x7616c1), count > 1 SIGNED (cmp eax,1 ; jle 0x762806) &&
   FULL [p+0x1ef0]==0 (cmp dword ; jne 0x762806) -> OBSERVABLE store
   [p+0x1ef0]=1 (0x7616dc), jmp 0x762806. The 0x7db0a0 edge fires iff
   LOW(r_1550)!=0 && LOW(r_1620)==0; continuation stays host (only its
   gate laws exported). All guard gates LOW-byte (u32 & 0xff, 0x100
   CLOSED); count_open SIGNED int32; slot_empty FULL dword. */

export const HUD_7616AD_VA_CASE = 0x0076169a;
export const HUD_7616AD_VA_PUSH_FLAG = 0x0076169a;
export const HUD_7616AD_VA_PUSH_ID_1550 = 0x0076169c;
export const HUD_7616AD_VA_MOV_ECX_1550 = 0x0076169e;
export const HUD_7616AD_VA_CALL_1550 = 0x007616a0;
export const HUD_7616AD_VA_TEST_1550 = 0x007616a5;
export const HUD_7616AD_VA_JE_MERGE_1550 = 0x007616a7;
export const HUD_7616AD_VA_PUSH_ID_1620 = 0x007616a9;
export const HUD_7616AD_VA_CALL_1620 = 0x007616ad;
export const HUD_7616AD_VA_TEST_1620 = 0x007616b2;
export const HUD_7616AD_VA_JNE_MERGE_1620 = 0x007616b4;
export const HUD_7616AD_VA_CALL_7DB0A0 = 0x007616b8;
export const HUD_7616AD_VA_MERGE = 0x007616bd;
export const HUD_7616AD_VA_COUNT_PUSH = 0x007616bd;
export const HUD_7616AD_VA_COUNT_CALL = 0x007616c1;
export const HUD_7616AD_VA_COUNT_CMP = 0x007616c6;
export const HUD_7616AD_VA_COUNT_JLE = 0x007616c9;
export const HUD_7616AD_VA_1EF0_CMP = 0x007616cf;
export const HUD_7616AD_VA_1EF0_JNE = 0x007616d6;
export const HUD_7616AD_VA_STORE_1EF0 = 0x007616dc;
export const HUD_7616AD_VA_TAIL_JUMP = 0x007616e6;
export const HUD_7616AD_VA_SKIP = 0x00762806;
export const HUD_7616AD_VA_DISPATCH_MOVZX = 0x00760908;
export const HUD_7616AD_VA_DISPATCH_JMP = 0x0076090f;
export const HUD_7616AD_DISPATCH_TABLE_VA = 0x00762ec0;
export const HUD_7616AD_DISPATCH_BYTE_TABLE_VA = 0x00762f2c;
export const HUD_7616AD_DISPATCH_CASE = 13;
export const HUD_7616AD_ARG_ID = 0x79;
export const HUD_7616AD_ARG_FLAG = 0;
export const HUD_7616AD_COUNT_ID = 0x6d;
export const HUD_7616AD_OFF_1EF0 = 0x1ef0;
export const HUD_7616AD_HOST_771550 = 0x00771550;
export const HUD_7616AD_HOST_771620 = 0x00771620;
export const HUD_7616AD_HOST_7DB0A0 = 0x007db0a0;
export const HUD_7616AD_HOST_7CB6E0 = 0x007cb6e0;
export const HUD_7616AD_STAGE_1550 = 1;
export const HUD_7616AD_STAGE_1620 = 2;
export const HUD_7616AD_STAGE_7DB0A0 = 4;
export const HUD_7616AD_STAGE_COUNT = 8;
export const HUD_7616AD_STAGE_STORE = 0x10;

/* 0x7616a5 test al,al ; 0x7616a7 je — LOW byte of the in-family
   0x771550 sample (0x100 CLOSED). */
export function hud7616ad1550Open(r1550) {
  return u32(r1550 & 0xff) !== 0 ? 1 : 0;
}

/* The 0x771620(p,0x79) edge fires ONLY when guard A is open. */
export function hud7616ad1620EdgeNeeded(r1550) {
  return u32(r1550 & 0xff) !== 0 ? 1 : 0;
}

/* 0x7616b2 test al,al ; 0x7616b4 jne — LOW byte of the in-family
   0x771620 result (0x100 CLOSED). */
export function hud7616ad1620Open(r1620) {
  return u32(r1620 & 0xff) !== 0 ? 1 : 0;
}

/* The host 0x7db0a0 edge fires ONLY when guard A is open AND guard B
   is closed. */
export function hud7616ad7db0a0EdgeNeeded(r1550, r1620) {
  return u32(r1550 & 0xff) !== 0 && u32(r1620 & 0xff) === 0 ? 1 : 0;
}

/* 0x7616c6 cmp eax,1 ; 0x7616c9 jle 0x762806 — SIGNED count > 1
   (int32; 0xffffffff as -1 closes). */
export function hud7616adCountOpen(count) {
  return i32(count) > 1 ? 1 : 0;
}

/* 0x7616cf cmp dword [edi+0x1ef0],0 ; 0x7616d6 jne — FULL dword
   zero-test (0x100 must NOT be empty). */
export function hud7616adSlotEmpty(field1ef0) {
  return u32(field1ef0) === 0 ? 1 : 0;
}

/* Composed machine-order plan (see the header docstring). */
export function hud7616adGuardPlan({
  r1550 = 0, r1620 = 0, count = 0, field1ef0 = 0,
} = {}) {
  const edge1550 = 1; /* unconditional in-family sample */
  const edge1620 = hud7616ad1620EdgeNeeded(r1550);
  const edge7db0a0 = hud7616ad7db0a0EdgeNeeded(r1550, r1620);
  const countOpen = hud7616adCountOpen(count);
  const slotEmpty = hud7616adSlotEmpty(field1ef0);
  const store1ef0 = countOpen !== 0 && slotEmpty !== 0 ? 1 : 0;
  return {
    edge1550,
    edge1620,
    edge7db0a0,
    hostEdgeCount: 1 + edge1620 + edge7db0a0,
    countOpen,
    slotEmpty,
    store1ef0,
    pureComplete: edge7db0a0 === 0 && store1ef0 === 0 ? 1 : 0,
  };
}
/* ============ ABI v37: the 0x76280f caller-guard laws (0x76280f
   push 0x298, UNCONDITIONAL — the LAST span-A site, the shared tail
   block of draw span A; evidence: section-notes/hud-v37-76280f/
   NOTES.md + cpu-dump/0076280f.txt) + the span-B unconditional
   0x7706e0 caller-guard CLASS (138 strict imm-imm sites in draw span
   B 0x763570..0x770000, byte-verified census). ============ */

export const HUD_76280F_VA_HEAD = 0x00762806;
export const HUD_76280F_VA_PUSH_FLAG = 0x00762806;
export const HUD_76280F_VA_PUSH_ID = 0x00762808;
export const HUD_76280F_VA_MOV_ECX = 0x0076280d;
export const HUD_76280F_VA_CALL_7706E0 = 0x0076280f;
export const HUD_76280F_VA_TEST = 0x00762814;
export const HUD_76280F_VA_JE_MERGE = 0x00762816;
export const HUD_76280F_VA_BLOCK = 0x00762818;
export const HUD_76280F_VA_CALL_5B1500 = 0x00762825;
export const HUD_76280F_VA_TEST_5B = 0x00762830;
export const HUD_76280F_VA_JE_5B = 0x00762832;
export const HUD_76280F_VA_TEST_CL = 0x00762834;
export const HUD_76280F_VA_JE_CL = 0x00762836;
export const HUD_76280F_VA_LOAD_1E74 = 0x00762838;
export const HUD_76280F_VA_CLAMP_CMP = 0x00762843;
export const HUD_76280F_VA_CMOVL = 0x00762847;
export const HUD_76280F_VA_STORE_1E74 = 0x00762850;
export const HUD_76280F_VA_CALL_758A70 = 0x00762856;
export const HUD_76280F_VA_MERGE = 0x0076285b;
export const HUD_76280F_VA_MERGE_HEAD = 0x00762861;
export const HUD_76280F_VA_DISPATCH_ADD = 0x0076286d;
export const HUD_76280F_VA_DISPATCH_CMP = 0x00762872;
export const HUD_76280F_VA_DISPATCH_MOVZX = 0x0076287d;
export const HUD_76280F_VA_DISPATCH_JMP = 0x00762884;
export const HUD_76280F_VA_NOTCH = 0x0076288b;
export const HUD_76280F_DISPATCH_TABLE_VA = 0x00763184;
export const HUD_76280F_DISPATCH_BYTE_TABLE_VA = 0x007631a8;
export const HUD_76280F_ARG_ID = 0x298;
export const HUD_76280F_ARG_FLAG = 0;
export const HUD_76280F_CLAMP_MIN = 0x384;
export const HUD_76280F_OFF_1E74 = 0x1e74;
export const HUD_76280F_GATE_5B_ARG0 = 0x40000;
export const HUD_76280F_GATE_5B_ARG1 = 0;
export const HUD_76280F_CALL_758A70_ARG0 = 2;
export const HUD_76280F_CALL_758A70_ARG1 = 0;
export const HUD_76280F_CALL_758A70_ARG2 = 0;
export const HUD_76280F_HOST_7706E0 = 0x007706e0;
export const HUD_76280F_HOST_5B1500 = 0x005b1500;
export const HUD_76280F_HOST_758A70 = 0x00758a70;
export const HUD_76280F_STAGE_OPEN = 1;
export const HUD_76280F_STAGE_5B = 2;
export const HUD_76280F_STAGE_ARM = 4;
export const HUD_76280F_STAGE_STORE = 8;
export const HUD_76280F_STAGE_758A70 = 0x10;

/* 0x762814 test al,al ; 0x762816 je 0x76285b — LOW byte of the
   in-family 0x7706e0 result (0x100 CLOSED; gate A). */
export function hud76280fHasOpen(r298) {
  return (u32(r298) & 0xff) !== 0 ? 1 : 0;
}

/* 0x762830 test al,al ; 0x762832 je 0x76288b — LOW byte of the host
   0x5b1500 result (gate B). */
export function hud76280f5b1500Open(r5b) {
  return (u32(r5b) & 0xff) !== 0 ? 1 : 0;
}

/* 0x762834 test cl,cl ; 0x762836 je 0x76288b — LOW byte of the arm
   byte [ebp-0x1c0] (gate C). */
export function hud76280fArmOpen(cl) {
  return (u32(cl) & 0xff) !== 0 ? 1 : 0;
}

/* 0x762843 cmp eax,0x384 ; 0x762847 cmovl eax,ecx — SIGNED max(field,
   0x384) on int32 (0xffffffff as -1 clamps UP; 0x80000000 clamps UP;
   0x1000 stays). */
export function hud76280fClamp1e74(field) {
  const f = i32(field);
  return f < HUD_76280F_CLAMP_MIN ? HUD_76280F_CLAMP_MIN : f;
}

/* Gates A && B && C — the OBSERVABLE [p+0x1e74]=clamp store fires
   (and the 0x758a70 edge fires, machine order store-then-call). */
export function hud76280fStoreNeeded(r298, r5b, cl) {
  return hud76280fHasOpen(r298) !== 0 && hud76280f5b1500Open(r5b) !== 0 &&
    hud76280fArmOpen(cl) !== 0 ? 1 : 0;
}

/* Composed machine-order plan of the 0x76280f caller-guard layer. */
export function hud76280fGuardPlan({
  r298 = 0, r5b = 0, cl = 0, field = 0,
} = {}) {
  const hasOpen = hud76280fHasOpen(r298);
  const edge5b = hasOpen;
  const armOpen = hud76280fArmOpen(cl);
  const store = hud76280fStoreNeeded(r298, r5b, cl);
  return {
    edge7706e0: 1,
    hasOpen,
    edge5b1500: edge5b,
    armOpen,
    clamp1e74: hud76280fClamp1e74(field),
    store1e74: store,
    edge758a70: store,
    hostEdgeCount: edge5b + store,
    pureComplete: hasOpen === 0 ? 1 : 0,
  };
}

export function hud76280fVaHead() { return HUD_76280F_VA_HEAD; }
export function hud76280fVaPushFlag() { return HUD_76280F_VA_PUSH_FLAG; }
export function hud76280fVaPushId() { return HUD_76280F_VA_PUSH_ID; }
export function hud76280fVaMovEcx() { return HUD_76280F_VA_MOV_ECX; }
export function hud76280fVaCall7706e0() { return HUD_76280F_VA_CALL_7706E0; }
export function hud76280fVaTest() { return HUD_76280F_VA_TEST; }
export function hud76280fVaJeMerge() { return HUD_76280F_VA_JE_MERGE; }
export function hud76280fVaBlock() { return HUD_76280F_VA_BLOCK; }
export function hud76280fVaCall5b1500() { return HUD_76280F_VA_CALL_5B1500; }
export function hud76280fVaTest5b() { return HUD_76280F_VA_TEST_5B; }
export function hud76280fVaJe5b() { return HUD_76280F_VA_JE_5B; }
export function hud76280fVaTestCl() { return HUD_76280F_VA_TEST_CL; }
export function hud76280fVaJeCl() { return HUD_76280F_VA_JE_CL; }
export function hud76280fVaLoad1e74() { return HUD_76280F_VA_LOAD_1E74; }
export function hud76280fVaClampCmp() { return HUD_76280F_VA_CLAMP_CMP; }
export function hud76280fVaCmovl() { return HUD_76280F_VA_CMOVL; }
export function hud76280fVaStore1e74() { return HUD_76280F_VA_STORE_1E74; }
export function hud76280fVaCall758a70() { return HUD_76280F_VA_CALL_758A70; }
export function hud76280fVaMerge() { return HUD_76280F_VA_MERGE; }
export function hud76280fVaMergeHead() { return HUD_76280F_VA_MERGE_HEAD; }
export function hud76280fVaDispatchAdd() { return HUD_76280F_VA_DISPATCH_ADD; }
export function hud76280fVaDispatchCmp() { return HUD_76280F_VA_DISPATCH_CMP; }
export function hud76280fVaDispatchMovzx() { return HUD_76280F_VA_DISPATCH_MOVZX; }
export function hud76280fVaDispatchJmp() { return HUD_76280F_VA_DISPATCH_JMP; }
export function hud76280fVaNotch() { return HUD_76280F_VA_NOTCH; }
export function hud76280fDispatchTableVa() { return HUD_76280F_DISPATCH_TABLE_VA; }
export function hud76280fDispatchByteTableVa() { return HUD_76280F_DISPATCH_BYTE_TABLE_VA; }
export function hud76280fArgId() { return HUD_76280F_ARG_ID; }
export function hud76280fArgFlag() { return HUD_76280F_ARG_FLAG; }
export function hud76280fClampMin() { return HUD_76280F_CLAMP_MIN; }
export function hud76280fOff1e74() { return HUD_76280F_OFF_1E74; }
export function hud76280fGate5bArg0() { return HUD_76280F_GATE_5B_ARG0; }
export function hud76280fGate5bArg1() { return HUD_76280F_GATE_5B_ARG1; }
export function hud76280fCall758a70Arg0() { return HUD_76280F_CALL_758A70_ARG0; }
export function hud76280fCall758a70Arg1() { return HUD_76280F_CALL_758A70_ARG1; }
export function hud76280fCall758a70Arg2() { return HUD_76280F_CALL_758A70_ARG2; }
export function hud76280fHost7706e0() { return HUD_76280F_HOST_7706E0; }
export function hud76280fHost5b1500() { return HUD_76280F_HOST_5B1500; }
export function hud76280fHost758a70() { return HUD_76280F_HOST_758A70; }
export function hud76280fStageOpen() { return HUD_76280F_STAGE_OPEN; }
export function hud76280fStage5b() { return HUD_76280F_STAGE_5B; }
export function hud76280fStageArm() { return HUD_76280F_STAGE_ARM; }
export function hud76280fStageStore() { return HUD_76280F_STAGE_STORE; }
export function hud76280fStage758a70() { return HUD_76280F_STAGE_758A70; }

/* ============ ABI v37: span-B unconditional 0x7706e0 caller-guard
   CLASS (138 strict imm-imm sites; row = [va, id, flag, kind,
   test_va, jcc_va, tgt_va]; kind 0 = continuation-on-open / kind 1 =
   continuation-on-closed; all flags 0). ============ */

export const HUD_SPANB_SPAN_B_BEGIN = 0x00763570;
export const HUD_SPANB_SPAN_B_END = 0x00770000;
export const HUD_SPANB_UNCOND_COUNT = 138;
export const HUD_SPANB_SITE_ROW_STRIDE = 0x1c;
export const HUD_SPANB_GATE_KIND_CONT_ON_OPEN = 0;
export const HUD_SPANB_GATE_KIND_CONT_ON_CLOSED = 1;
export const HUD_SPANB_SAMPLE_IS_LOW = 1;
export const HUD_SPANB_HOST_7706E0 = 0x007706e0;

export const SPANB_SITES = [
  [0x00763714, 0x298, 0, 0, 0x00763719, 0x0076371b, 0x0076395a],
  [0x00763967, 0x29f, 0, 0, 0x00763974, 0x00763976, 0x00763a48],
  [0x00763a55, 0x2ae, 0, 0, 0x00763a5a, 0x00763a5c, 0x00763b36],
  [0x00763c99, 0x2a6, 0, 0, 0x00763ca4, 0x00763ca6, 0x00763cb1],
  [0x00763cb5, 0x72, 0, 1, 0x00763cba, 0x00763cbc, 0x00763d1a],
  [0x00763d0d, 0x72, 0, 0, 0x00763d12, 0x00763d14, 0x00763e56],
  [0x00763de1, 0x18b, 0, 0, 0x00763dec, 0x00763dee, 0x00763df6],
  [0x00763dfa, 0x44, 0, 0, 0x00763e05, 0x00763e07, 0x00763e0f],
  [0x00763e16, 0x149, 0, 0, 0x00763e21, 0x00763e23, 0x00763e2b],
  [0x00763e32, 0xe5, 0, 0, 0x00763e3f, 0x00763e41, 0x00763e47],
  [0x007640c6, 0x130, 0, 1, 0x007640cb, 0x007640cd, 0x007640e1],
  [0x00764945, 0x258, 0, 0, 0x00764952, 0x00764954, 0x00764966],
  [0x007649b0, 0x197, 0, 0, 0x007649b5, 0x007649b7, 0x007649de],
  [0x00764c4d, 0x78, 0, 1, 0x00764c52, 0x00764c54, 0x00764c67],
  [0x00764f3b, 0xf5, 0, 1, 0x00764f40, 0x00764f42, 0x00764ff5],
  [0x00765002, 0x95, 0, 0, 0x00765007, 0x00765009, 0x00765056],
  [0x00765063, 0x213, 0, 0, 0x00765068, 0x0076506a, 0x007651be],
  [0x00765138, 0x76, 0, 0, 0x0076513d, 0x0076513f, 0x0076514b],
  [0x00765155, 0x34, 0, 0, 0x0076515a, 0x0076515c, 0x0076516e],
  [0x00765286, 0x98, 0, 0, 0x00765293, 0x00765295, 0x007652a7],
  [0x007652cf, 0x136, 0, 0, 0x007652d4, 0x007652d6, 0x007652f0],
  [0x0076535f, 0x231, 0, 0, 0x00765364, 0x00765366, 0x0076537a],
  [0x00765387, 0x14a, 0, 0, 0x00765394, 0x00765396, 0x007653a8],
  [0x007653d0, 0x170, 0, 0, 0x007653dd, 0x007653ed, 0x00765418],
  [0x0076551f, 0x2b7, 0, 0, 0x00765524, 0x00765526, 0x00765580],
  [0x0076578e, 0x7, 0, 0, 0x00765793, 0x00765795, 0x007657a7],
  [0x007657b1, 0x5a, 0, 0, 0x007657b6, 0x007657b8, 0x007657ca],
  [0x007657d7, 0xd8, 0, 0, 0x007657dc, 0x007657de, 0x007657f0],
  [0x0076583c, 0x6d, 0, 0, 0x00765851, 0x00765853, 0x0076589c],
  [0x007658ab, 0x28e, 0, 0, 0x007658b0, 0x007658b2, 0x0076595b],
  [0x007659e0, 0x2cc, 0, 0, 0x007659e5, 0x007659e7, 0x00765a2f],
  [0x007661f2, 0x2b6, 0, 0, 0x007661f7, 0x007661ff, 0x0076621c],
  [0x00766222, 0x3b, 0, 0, 0x00766227, 0x00766229, 0x00766276],
  [0x007662b3, 0x78, 0, 1, 0x007662b8, 0x007662ba, 0x007662c9],
  [0x00766646, 0x197, 0, 0, 0x0076664b, 0x0076664d, 0x0076667e],
  [0x00766a43, 0x201, 0, 0, 0x00766a48, 0x00766a4a, 0x00766a64],
  [0x00766ad9, 0x19f, 0, 0, 0x00766ade, 0x00766ae0, 0x00766b06],
  [0x00766b0f, 0xb6, 0, 0, 0x00766b14, 0x00766b16, 0x00766b38],
  [0x00766b3e, 0x3b, 0, 0, 0x00766b43, 0x00766b45, 0x00766b79],
  [0x00766b82, 0x23d, 0, 1, 0x00766b87, 0x00766b89, 0x00766b94],
  [0x00766bb5, 0x1ed, 0, 1, 0x00766bba, 0x00766bbc, 0x00766bce],
  [0x00766c45, 0x9d, 0, 0, 0x00766c4a, 0x00766c4c, 0x00766cc9],
  [0x00766dc7, 0x213, 0, 0, 0x00766dd4, 0x00766dd6, 0x00766de8],
  [0x00766df9, 0x95, 0, 0, 0x00766dfe, 0x00766e00, 0x00766e73],
  [0x00766e79, 0x4, 0, 1, 0x00766e7e, 0x00766e80, 0x00766eba],
  [0x00766ef3, 0x136, 0, 0, 0x00766ef8, 0x00766efa, 0x00766f24],
  [0x00766f2d, 0x231, 0, 0, 0x00766f32, 0x00766f34, 0x00766f60],
  [0x00766f69, 0x14a, 0, 0, 0x00766f6e, 0x00766f70, 0x00766fa2],
  [0x00766fab, 0xf5, 0, 1, 0x00766fb0, 0x00766fb2, 0x00766fbd],
  [0x00766ff6, 0x175, 0, 0, 0x00767007, 0x00767009, 0x0076703b],
  [0x007678ae, 0x5, 0, 1, 0x007678b3, 0x007678b5, 0x007678c8],
  [0x007678f3, 0x95, 0, 0, 0x007678f8, 0x007678fa, 0x0076790e],
  [0x00767f3e, 0x23c, 0, 0, 0x00767f43, 0x00767f45, 0x00767f77],
  [0x00767f80, 0x252, 0, 0, 0x00767f85, 0x00767f87, 0x00767fa1],
  [0x00767faa, 0x256, 0, 1, 0x00767fb5, 0x00767fb7, 0x00767fc9],
  [0x00767fea, 0x2cc, 0, 0, 0x00767fef, 0x00767ff1, 0x00768033],
  [0x007681ba, 0x197, 0, 0, 0x007681bf, 0x007681c1, 0x007681f4],
  [0x007681fd, 0x95, 0, 1, 0x00768202, 0x00768204, 0x0076822c],
  [0x00768269, 0xe9, 0, 0, 0x0076826e, 0x00768270, 0x007682a2],
  [0x007682ab, 0x133, 0, 1, 0x007682b0, 0x007682b2, 0x007682c2],
  [0x007682e3, 0xd6, 0, 1, 0x007682e8, 0x007682ea, 0x007682fc],
  [0x007684b0, 0x6, 0, 1, 0x007684b5, 0x007684b7, 0x007684f9],
  [0x00768577, 0x5, 0, 1, 0x0076857c, 0x0076857e, 0x0076858d],
  [0x00768cdd, 0x252, 0, 0, 0x00768ce2, 0x00768ce4, 0x00768d15],
  [0x00768d1e, 0x2b7, 0, 0, 0x00768d23, 0x00768d25, 0x00768d79],
  [0x00768d82, 0x2cc, 0, 0, 0x00768d87, 0x00768d89, 0x00768dbe],
  [0x00768f26, 0xe6, 0, 0, 0x00768f2b, 0x00768f2d, 0x00768f47],
  [0x00768f9a, 0x82, 0, 1, 0x00768f9f, 0x00768fa1, 0x00768fb5],
  [0x00768fe1, 0x12b, 0, 1, 0x00768fe6, 0x00768fe8, 0x00768ff8],
  [0x00769041, 0x12c, 0, 1, 0x00769046, 0x00769048, 0x00769058],
  [0x00769079, 0x132, 0, 1, 0x0076907e, 0x00769080, 0x00769090],
  [0x007690b1, 0x133, 0, 1, 0x007690b6, 0x007690b8, 0x007690c8],
  [0x007690e9, 0x13a, 0, 0, 0x007690ee, 0x007690f0, 0x0076910a],
  [0x00769113, 0x197, 0, 0, 0x00769118, 0x0076911a, 0x0076914d],
  [0x0076930f, 0x254, 0, 1, 0x00769314, 0x00769316, 0x00769328],
  [0x00769341, 0x250, 0, 1, 0x00769346, 0x00769348, 0x0076935a],
  [0x00769395, 0x23a, 0, 0, 0x0076939a, 0x0076939c, 0x007693ae],
  [0x007693b7, 0xb6, 0, 1, 0x007693bc, 0x007693be, 0x00769416],
  [0x00769441, 0x84, 0, 0, 0x00769446, 0x00769448, 0x00769466],
  [0x0076946f, 0x20c, 0, 0, 0x00769474, 0x00769476, 0x00769488],
  [0x00769491, 0x105, 0, 1, 0x00769496, 0x00769498, 0x007694aa],
  [0x007694c3, 0xb9, 0, 1, 0x007694c8, 0x007694ca, 0x007695eb],
  [0x00769601, 0x30, 0, 1, 0x00769606, 0x00769608, 0x0076966b],
  [0x00769684, 0xa9, 0, 0, 0x00769689, 0x0076968b, 0x007696a9],
  [0x007696b2, 0x131, 0, 1, 0x007696b7, 0x007696b9, 0x007696c9],
  [0x007696df, 0x68, 0, 0, 0x007696e4, 0x007696e6, 0x007696f8],
  [0x007696fe, 0x5, 0, 1, 0x00769703, 0x00769705, 0x00769714],
  [0x00769793, 0x95, 0, 0, 0x00769798, 0x0076979a, 0x007697df],
  [0x007697e8, 0xe9, 0, 0, 0x007697ed, 0x007697ef, 0x00769815],
  [0x0076981e, 0xde, 0, 0, 0x00769823, 0x00769825, 0x0076987f],
  [0x00769888, 0xe0, 0, 0, 0x0076988d, 0x0076988f, 0x007698a1],
  [0x007698aa, 0xdd, 0, 0, 0x007698af, 0x007698b1, 0x007698c3],
  [0x007698cc, 0x13b, 0, 0, 0x007698d1, 0x007698d3, 0x007698e5],
  [0x0076990d, 0x135, 0, 1, 0x00769912, 0x00769914, 0x00769957],
  [0x007699f5, 0x14b, 0, 0, 0x007699fa, 0x007699fc, 0x00769a0e],
  [0x00769a17, 0x171, 0, 0, 0x00769a1c, 0x00769a1e, 0x00769a44],
  [0x00769a4d, 0x18d, 0, 0, 0x00769a52, 0x00769a54, 0x00769a66],
  [0x00769a6f, 0x215, 0, 0, 0x00769a74, 0x00769a76, 0x00769a88],
  [0x00769a91, 0x101, 0, 1, 0x00769a96, 0x00769a98, 0x00769aaa],
  [0x00769ac3, 0x13d, 0, 1, 0x00769ac8, 0x00769aca, 0x00769adc],
  [0x00769af5, 0x103, 0, 1, 0x00769afa, 0x00769afc, 0x00769b0e],
  [0x00769b27, 0x1c5, 0, 0, 0x00769b2c, 0x00769b2e, 0x00769b40],
  [0x00769b49, 0x1ce, 0, 0, 0x00769b4e, 0x00769b50, 0x00769b76],
  [0x00769b7f, 0x1ee, 0, 0, 0x00769b84, 0x00769b86, 0x00769b98],
  [0x00769ba1, 0x214, 0, 0, 0x00769ba6, 0x00769ba8, 0x00769bba],
  [0x00769bc3, 0x211, 0, 0, 0x00769bc8, 0x00769bca, 0x00769bdc],
  [0x00769be5, 0x21c, 0, 0, 0x00769bea, 0x00769bec, 0x00769bfe],
  [0x00769c07, 0xd5, 0, 1, 0x00769c0c, 0x00769c0e, 0x00769c23],
  [0x00769c48, 0x1fa, 0, 0, 0x00769c4d, 0x00769c4f, 0x00769c61],
  [0x00769d0f, 0xb6, 0, 1, 0x00769d14, 0x00769d16, 0x0076a377],
  [0x00769d6b, 0x23c, 0, 1, 0x00769d70, 0x00769d72, 0x0076a353],
  [0x00769dcb, 0x67, 0, 1, 0x00769dd0, 0x00769dd2, 0x0076a32f],
  [0x00769e68, 0x59, 0, 0, 0x00769e6d, 0x00769e6f, 0x00769e98],
  [0x00769ea1, 0x13b, 0, 1, 0x00769ea6, 0x00769ea8, 0x0076a232],
  [0x00769f30, 0x229, 0, 0, 0x00769f35, 0x00769f37, 0x00769f60],
  [0x00769f69, 0x1ee, 0, 0, 0x00769f6e, 0x00769f70, 0x00769fc9],
  [0x00769fcf, 0x6, 0, 1, 0x00769fd4, 0x00769fd6, 0x0076a308],
  [0x0076a07a, 0x18e, 0, 1, 0x0076a07f, 0x0076a081, 0x0076a2ba],
  [0x0076a0da, 0x231, 0, 0, 0x0076a0df, 0x0076a0e1, 0x0076a10a],
  [0x0076a113, 0x14a, 0, 0, 0x0076a118, 0x0076a11a, 0x0076a143],
  [0x0076a14c, 0x84, 0, 0, 0x0076a151, 0x0076a153, 0x0076a1ce],
  [0x0076a1d7, 0x103, 0, 0, 0x0076a1dc, 0x0076a1de, 0x0076a259],
  [0x0076a447, 0x13d, 0, 1, 0x0076a44c, 0x0076a44e, 0x0076aa72],
  [0x0076a504, 0xb6, 0, 1, 0x0076a509, 0x0076a50b, 0x0076a9da],
  [0x0076a592, 0x68, 0, 0, 0x0076a597, 0x0076a599, 0x0076a5cd],
  [0x0076a5d3, 0x45, 0, 0, 0x0076a5d8, 0x0076a5da, 0x0076a61f],
  [0x0076a625, 0x6, 0, 1, 0x0076a62a, 0x0076a62c, 0x0076a965],
  [0x0076a6d0, 0xdd, 0, 0, 0x0076a6d5, 0x0076a6d7, 0x0076a725],
  [0x0076a72e, 0x150, 0, 0, 0x0076a733, 0x0076a735, 0x0076a77a],
  [0x0076a783, 0x231, 0, 0, 0x0076a788, 0x0076a78a, 0x0076a7be],
  [0x0076a7c7, 0x14a, 0, 1, 0x0076a7cc, 0x0076a7ce, 0x0076a9da],
  [0x0076aaca, 0x73, 0, 1, 0x0076aacf, 0x0076aad1, 0x0076ab99],
  [0x0076e6af, 0x184, 0, 0, 0x0076e6b4, 0x0076e6b6, 0x0076e7e4],
  [0x0076f74c, 0x1ec, 0, 0, 0x0076f751, 0x0076f753, 0x0076f76d],
  [0x0076fca0, 0x22a, 0, 0, 0x0076fca5, 0x0076fca7, 0x0076fd17],
  [0x0076fd4e, 0xd, 0, 0, 0x0076fd53, 0x0076fd55, 0x0076fd84],
  [0x0076fd8d, 0x15e, 0, 0, 0x0076fd92, 0x0076fd94, 0x0076fe09],
  [0x0076fffd, 0x130, 0, 1, 0x00770002, 0x00770004, 0x00770018],
];

export function hudSpanbUncondCount() { return HUD_SPANB_UNCOND_COUNT; }
export function hudSpanbUncondVa(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[0]) : 0;
}
export function hudSpanbUncondId(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[1]) : 0;
}
export function hudSpanbUncondFlag(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[2]) : 0;
}
export function hudSpanbUncondKind(idx) {
  const r = SPANB_SITES[idx];
  return r ? r[3] : 0;
}
export function hudSpanbUncondTestVa(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[4]) : 0;
}
export function hudSpanbUncondJccVa(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[5]) : 0;
}
export function hudSpanbUncondTgtVa(idx) {
  const r = SPANB_SITES[idx];
  return r ? u32(r[6]) : 0;
}

/* Shared test al,al law: LOW byte (0x100 CLOSED). */
export function hudSpanbSampleOpen(sample) {
  return (u32(sample) & 0xff) !== 0 ? 1 : 0;
}

/* kind 0: continuation on open; kind 1: continuation on closed. */
export function hudSpanbContinuation(kind, sample) {
  const open = hudSpanbSampleOpen(sample);
  if (kind === HUD_SPANB_GATE_KIND_CONT_ON_OPEN) {
    return open;
  }
  return open === 0 ? 1 : 0;
}

/* Composed per-site plan (row table + gate law + class floor). */
export function hudSpanbSitePlan({ idx = 0, sample = 0 } = {}) {
  const r = SPANB_SITES[idx];
  if (!r) {
    return {
      va: 0, id: 0, flag: 0, kind: 0, sampleOpen: 0,
      continuation: 0, hostEdgeCountMin: 0, pureComplete: 1,
    };
  }
  const cont = hudSpanbContinuation(r[3], sample);
  return {
    va: u32(r[0]), id: u32(r[1]), flag: u32(r[2]), kind: r[3],
    sampleOpen: hudSpanbSampleOpen(sample), continuation: cont,
    hostEdgeCountMin: cont !== 0 ? 1 : 0,
    pureComplete: cont !== 0 ? 0 : 1,
  };
}

export function hudSpanbSpanBBegin() { return HUD_SPANB_SPAN_B_BEGIN; }
export function hudSpanbSpanBEnd() { return HUD_SPANB_SPAN_B_END; }
export function hudSpanbUncondCountConst() { return HUD_SPANB_UNCOND_COUNT; }
export function hudSpanbSiteRowStride() { return HUD_SPANB_SITE_ROW_STRIDE; }
export function hudSpanbGateKindContOnOpen() { return HUD_SPANB_GATE_KIND_CONT_ON_OPEN; }
export function hudSpanbGateKindContOnClosed() { return HUD_SPANB_GATE_KIND_CONT_ON_CLOSED; }
export function hudSpanbSampleIsLow() { return HUD_SPANB_SAMPLE_IS_LOW; }
export function hudSpanbHost7706e0() { return HUD_SPANB_HOST_7706E0; }

/* ============ ABI v38: span-B FAR-GUARDED 0x7706e0 caller-guard
   CLASS (the v37 census EXCLUDED these rows from the 138-site strict
   imm-imm table: each has a call-BYPASS conditional branch in the
   block PREFIX — a jcc whose target jumps PAST the call; the gate
   consumes a PRIOR in-family sample (test al,al), the call fires on
   the fall-through). Landed subset (census6-final.py, byte-verified)
   = 67 rows: direct gate `test al,al; je|jne` (LOW-byte sample law),
   imm-imm args (flag 0 / id), EACH with >= 1 host E8 within 0x400
   after va+5 (the continuation floor, this unit). Row = [va, id,
   flag, kind, test_va, jcc_va, tgt_va]; kind 0 = je (cont-on-open),
   kind 1 = jne (cont-on-closed). Excluded (stay host): 18
   field-cmp / test-cl gates, 2 far-flag 0x763c7a/0x763d64, 3
   shared-tail 0x763d2b/0x76674b/0x768235, 1 runtime-flag 0x769cac,
   1 widen 0x765f8a. ============ */

export const HUD_SPANB_FAR_COUNT = 67;
export const HUD_SPANB_FAR_SITE_ROW_STRIDE = 0x1c;
export const HUD_SPANB_FAR_VA_FIRST = 0x00763c42;
export const HUD_SPANB_FAR_VA_LAST = 0x0076e6db;
export const HUD_SPANB_FAR_SAMPLE_IS_LOW = 1;
export const HUD_SPANB_FAR_HOST_7706E0 = 0x007706e0;

export const SPANB_FAR_SITES = [
  [0x00763c42, 0x243, 0, 1, 0x00763c2d, 0x00763c2f, 0x00763d1a],
  [0x00763c58, 0x2a6, 0, 0, 0x00763c4f, 0x00763c51, 0x00763c75],
  [0x00763ccb, 0x213, 0, 1, 0x00763cba, 0x00763cbc, 0x00763d1a],
  [0x00763ce1, 0xe5, 0, 0, 0x00763cd8, 0x00763cda, 0x00763d29],
  [0x00763d41, 0xe5, 0, 0, 0x00763d38, 0x00763d3a, 0x00763d62],
  [0x00763d7a, 0x18b, 0, 0, 0x00763d69, 0x00763d6b, 0x00763d83],
  [0x00763ea6, 0x76, 0, 0, 0x00763e94, 0x00763e96, 0x00763f23],
  [0x00763ebc, 0x18b, 0, 0, 0x00763eab, 0x00763ead, 0x00763ec5],
  [0x00764f55, 0x99, 0, 1, 0x00764f40, 0x00764f42, 0x00764ff5],
  [0x00764f6f, 0xa9, 0, 1, 0x00764f5a, 0x00764f5c, 0x00764fdd],
  [0x00764f93, 0x2, 0, 0, 0x00764f85, 0x00764f87, 0x00764fdd],
  [0x0076507d, 0x95, 0, 0, 0x00765068, 0x0076506a, 0x007651be],
  [0x00765212, 0x76, 0, 0, 0x00765202, 0x00765204, 0x00765279],
  [0x00765331, 0xe5, 0, 0, 0x00765320, 0x00765322, 0x00765352],
  [0x00765489, 0x3b, 0, 0, 0x0076547b, 0x0076547d, 0x007654ea],
  [0x00765b29, 0x3b, 0, 0, 0x00765b1b, 0x00765b1d, 0x00765b92],
  [0x00766762, 0x2, 0, 0, 0x00766750, 0x00766752, 0x007667d7],
  [0x00766778, 0x99, 0, 1, 0x00766767, 0x00766769, 0x007667c7],
  [0x007667ac, 0xf5, 0, 1, 0x0076679b, 0x0076679d, 0x007667c7],
  [0x00766aaf, 0x72, 0, 0, 0x00766aa5, 0x00766aa7, 0x00766ad0],
  [0x00766b50, 0x290, 0, 0, 0x00766b43, 0x00766b45, 0x00766b79],
  [0x00766cef, 0x76, 0, 0, 0x00766ce5, 0x00766ce7, 0x00766d4e],
  [0x00766d0e, 0x149, 0, 0, 0x00766d01, 0x00766d03, 0x00766d29],
  [0x00766d8e, 0x76, 0, 0, 0x00766d84, 0x00766d86, 0x00766dbe],
  [0x00766d9d, 0x44, 0, 0, 0x00766d93, 0x00766d95, 0x00766dbe],
  [0x00766e95, 0x7, 0, 0, 0x00766e8b, 0x00766e8d, 0x00766e9e],
  [0x00766ea4, 0xc, 0, 1, 0x00766e9a, 0x00766e9c, 0x00766eba],
  [0x0076820f, 0x213, 0, 1, 0x00768202, 0x00768204, 0x0076822c],
  [0x00768221, 0xe0, 0, 1, 0x00768214, 0x00768216, 0x0076822c],
  [0x007684cf, 0x1b8, 0, 1, 0x007684c2, 0x007684c4, 0x007684f9],
  [0x00768fac, 0xb5, 0, 1, 0x00768f9f, 0x00768fa1, 0x00768fb5],
  [0x007693c6, 0x3, 0, 1, 0x007693bc, 0x007693be, 0x00769416],
  [0x007693f5, 0x14b, 0, 1, 0x007693e8, 0x007693ea, 0x00769416],
  [0x007694d6, 0x73, 0, 1, 0x007694c8, 0x007694ca, 0x007695eb],
  [0x007694ec, 0x9f, 0, 1, 0x007694db, 0x007694dd, 0x007695eb],
  [0x00769524, 0x150, 0, 1, 0x00769513, 0x00769515, 0x007695eb],
  [0x0076953a, 0x17b, 0, 1, 0x00769529, 0x0076952b, 0x007695eb],
  [0x00769550, 0x166, 0, 1, 0x0076953f, 0x00769541, 0x007695eb],
  [0x00769613, 0xed, 0, 1, 0x00769606, 0x00769608, 0x0076966b],
  [0x00769635, 0x132, 0, 1, 0x00769628, 0x0076962a, 0x0076966b],
  [0x00769662, 0x150, 0, 1, 0x00769655, 0x00769657, 0x0076966b],
  [0x007697b2, 0x21c, 0, 0, 0x007697a5, 0x007697a7, 0x007697bb],
  [0x00769857, 0x13c, 0, 0, 0x0076984a, 0x0076984c, 0x0076986f],
  [0x00769866, 0x45, 0, 1, 0x0076985c, 0x0076985e, 0x0076987f],
  [0x0076994e, 0x250, 0, 1, 0x00769941, 0x00769943, 0x00769957],
  [0x00769cd6, 0x95, 0, 1, 0x00769cc5, 0x00769cc7, 0x0076a39b],
  [0x00769d95, 0x101, 0, 1, 0x00769d84, 0x00769d86, 0x0076a353],
  [0x00769de1, 0x13d, 0, 1, 0x00769dd0, 0x00769dd2, 0x0076a32f],
  [0x00769df7, 0x131, 0, 1, 0x00769de6, 0x00769de8, 0x0076a32f],
  [0x00769e32, 0x68, 0, 1, 0x00769e24, 0x00769e26, 0x0076a32f],
  [0x00769ecb, 0x191, 0, 1, 0x00769eba, 0x00769ebc, 0x0076a232],
  [0x00769ee1, 0x269, 0, 1, 0x00769ed0, 0x00769ed2, 0x0076a232],
  [0x00769ef7, 0x26a, 0, 1, 0x00769ee6, 0x00769ee8, 0x0076a232],
  [0x00769ff3, 0x3, 0, 1, 0x00769fe5, 0x00769fe7, 0x0076a308],
  [0x0076a0a1, 0x45, 0, 1, 0x0076a093, 0x0076a095, 0x0076a2ba],
  [0x0076a471, 0x101, 0, 1, 0x0076a460, 0x0076a462, 0x0076aa72],
  [0x0076a49b, 0x103, 0, 1, 0x0076a48a, 0x0076a48c, 0x0076aa29],
  [0x0076a4c5, 0x95, 0, 1, 0x0076a4b4, 0x0076a4b6, 0x0076aa0c],
  [0x0076a551, 0x84, 0, 1, 0x0076a540, 0x0076a542, 0x0076a9a8],
  [0x0076a649, 0x3, 0, 1, 0x0076a63b, 0x0076a63d, 0x0076a965],
  [0x0076a7dd, 0x18e, 0, 1, 0x0076a7cc, 0x0076a7ce, 0x0076a9da],
  [0x0076a84b, 0x213, 0, 0, 0x0076a83e, 0x0076a840, 0x0076a886],
  [0x0076ab37, 0xb9, 0, 1, 0x0076ab2a, 0x0076ab2c, 0x0076ab99],
  [0x0076ae77, 0x279, 0, 1, 0x0076ae6a, 0x0076ae6c, 0x0076ae8d],
  [0x0076df28, 0x75, 0, 1, 0x0076df1e, 0x0076df20, 0x0076df50],
  [0x0076e6c5, 0x116, 0, 0, 0x0076e6b4, 0x0076e6b6, 0x0076e7e4],
  [0x0076e6db, 0x90, 0, 0, 0x0076e6ca, 0x0076e6cc, 0x0076e7e4],
];

export function hudSpanbFarCount() { return HUD_SPANB_FAR_COUNT; }
export function hudSpanbFarVa(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[0]) : 0;
}
export function hudSpanbFarId(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[1]) : 0;
}
export function hudSpanbFarFlag(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[2]) : 0;
}
export function hudSpanbFarKind(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? r[3] : 0;
}
export function hudSpanbFarTestVa(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[4]) : 0;
}
export function hudSpanbFarJccVa(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[5]) : 0;
}
export function hudSpanbFarTgtVa(idx) {
  const r = SPANB_FAR_SITES[idx];
  return r ? u32(r[6]) : 0;
}

/* Shared bypass-gate test al,al law: LOW byte (0x100 CLOSED). */
export function hudSpanbFarSampleOpen(sample) {
  return (u32(sample) & 0xff) !== 0 ? 1 : 0;
}

/* kind 0 (je bypass): the OPEN path falls through into the call ->
   continuation on open; kind 1 (jne bypass): the OPEN path jumps
   past the call -> continuation on closed. */
export function hudSpanbFarContinuation(kind, sample) {
  const open = hudSpanbFarSampleOpen(sample);
  if (kind === HUD_SPANB_GATE_KIND_CONT_ON_OPEN) {
    return open;
  }
  return open === 0 ? 1 : 0;
}

/* Composed per-site plan (row table + bypass gate law + class
   floor). */
export function hudSpanbFarSitePlan({ idx = 0, sample = 0 } = {}) {
  const r = SPANB_FAR_SITES[idx];
  if (!r) {
    return {
      va: 0, id: 0, flag: 0, kind: 0, sampleOpen: 0,
      continuation: 0, hostEdgeCountMin: 0, pureComplete: 1,
    };
  }
  const cont = hudSpanbFarContinuation(r[3], sample);
  return {
    va: u32(r[0]), id: u32(r[1]), flag: u32(r[2]), kind: r[3],
    sampleOpen: hudSpanbFarSampleOpen(sample), continuation: cont,
    hostEdgeCountMin: cont !== 0 ? 1 : 0,
    pureComplete: cont !== 0 ? 0 : 1,
  };
}

export function hudSpanbFarCountConst() { return HUD_SPANB_FAR_COUNT; }
export function hudSpanbFarSiteRowStride() { return HUD_SPANB_FAR_SITE_ROW_STRIDE; }
export function hudSpanbFarVaFirst() { return HUD_SPANB_FAR_VA_FIRST; }
export function hudSpanbFarVaLast() { return HUD_SPANB_FAR_VA_LAST; }
export function hudSpanbFarSampleIsLow() { return HUD_SPANB_FAR_SAMPLE_IS_LOW; }
export function hudSpanbFarHost7706e0() { return HUD_SPANB_FAR_HOST_7706E0; }

/* ============================================================
   ABI v39 - span-B recorded-residual laws (independently
   transcribed from the PE decode; section-notes/hud-v39-frontier/).
   ============================================================ */

export const HUD_SPANB_ARG_D13_SITE_VA = 0x00763c58;
export const HUD_SPANB_ARG_D13_SETNE_VA = 0x00763c63;
export const HUD_SPANB_ARG_D13_BASE = 0xd;
export const HUD_SPANB_ARG_2N5_SITE_VA = 0x00763d41;
export const HUD_SPANB_ARG_2N5_LEA_VA = 0x00763d4f;
export const HUD_SPANB_ARG_2N5_BASE = 5;
export const HUD_SPANB_ARG_2N5_OPEN_MUL = 2;
export const HUD_SPANB_WIDEN_SITE_VA = 0x00765f96;
export const HUD_SPANB_WIDEN_SAMPLE_ID = 0x105;
export const HUD_SPANB_WIDEN_MASK = 0xff;
export const HUD_SPANB_FARFLAG_A_VA = 0x00763c7a;
export const HUD_SPANB_FARFLAG_B_VA = 0x00763d64;
export const HUD_SPANB_RUNTIME_FLAG_VA = 0x00769cac;

/* xor ecx,ecx ; setne cl ; add ecx,0xd -- LOW-byte gate. */
export function hudSpanbArgD13(sample) {
  return HUD_SPANB_ARG_D13_BASE + ((sample & 0xff) !== 0 ? 1 : 0);
}
/* xor ecx,ecx ; setne cl ; lea ecx,[ecx*2+5]. */
export function hudSpanbArg2n5(sample) {
  return HUD_SPANB_ARG_2N5_BASE + ((sample & 0xff) !== 0 ? 1 : 0) * HUD_SPANB_ARG_2N5_OPEN_MUL;
}
/* movzx esi,al -- widen outlier's widen step. */
export function hudSpanbWidenByte(sample) {
  return sample & HUD_SPANB_WIDEN_MASK;
}
