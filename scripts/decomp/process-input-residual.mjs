/**
 * ProcessInput FUN_00a1f280 residual pure-post plan (freestanding HostHandler pin).
 *
 * Documents PE-ordered pure posts for the a1f280 residual chain after CRT clear:
 *   ready-gate vcall+0x78 @ 0x00a1f30a  (pure ABI v15)
 *   fill-present vcall+0x80 pair0/pair1 (pure ABI v13)
 *   axis-fill vcall+0x7c pair0/pair1     (pure ABI v14)
 *   action-query vcall+0x3c @ 0x00a1f4db (pure ABI v12)
 *   rumble vcall+0x84 @ 0x00a1f65a       (pure ABI v10; post-fill tail)
 *
 * Device method bodies, CRT clear bodies, and live guest fields remain host.
 * Game::ProcessInput root is still unpinned on this PE. No Update ABI wire.
 *
 * Future multi-root HostHandler can pin residual kinds using this plan when a
 * ProcessInput residual event lands; until then this module is documentation +
 * freestanding pure-post apply only (mirrors B1/H5 sample-path shape).
 *
 * Pure helpers live in process-input-pure-model.mjs; this module re-exports its
 * ABI as PROCESS_INPUT_RESIDUAL_PURE_ABI rather than naming a version here, so
 * there is no second copy to go stale. The a1f280 gate peels this plan cites
 * are unchanged since ABI v15 — later versions added a6de60 walk-callee
 * islands, the a6dab0 scan/connect islands, their init/thread callers, the
 * post-call recapture rules, and the Manager shell state table. Do not derive
 * residual gate CF mechanically from C++.
 */

import {
  PROCESS_INPUT_PURE_ABI_VERSION,
  A1F280_READY_CALL_VA,
  A1F280_VTBL_READY,
  A1F280_FILL_PAIR0_CALL_VA,
  A1F280_FILL_PAIR1_CALL_VA,
  A1F280_VTBL_FILL,
  A1F280_VTBL_AXIS_FILL,
  A1F280_AXIS_FILL_PAIR0_CALL_VA,
  A1F280_AXIS_FILL_PAIR1_CALL_VA,
  A1EED0_AXIS_FILL_CALL_VA,
  A1F280_ACTION_QUERY_CALL_VA,
  A1F280_VTBL_ACTION_QUERY,
  A1F280_VTBL_RUMBLE,
  A1F280_DIR_BIT_BASE_PAIR0,
  A1F280_DIR_BIT_BASE_PAIR1,
  A1F280_OFF_AXIS_PAIR0,
  A1F280_OFF_AXIS_PAIR1,
  A1F280_OFF_DIR_BITS,
  A1F280_OFF_DIR_THRESH,
  A1F280_OFF_REMAP_THRESH,
  A112C0_HOST_VA,
  managerPollA1f280BufferBytes,
  managerPollA1f280BufferCount,
  managerPollA1f280ReadyVcallOk,
  managerPollA1f280ReadyEarlyReturn,
  managerPollA1f280ReadyVtblSlot,
  managerPollA1f280ReadyCallVa,
  managerPollA1f280FillVcallOk,
  managerPollA1f280FillPair0Arg,
  managerPollA1f280FillPair1Arg,
  managerPollA1f280FillVtblSlot,
  managerPollA1f280FillCallVa,
  managerPollA1f280FillPair0CallVa,
  managerPollA1f280AxisFillVtblSlot,
  managerPollA1f280AxisFillCallVa,
  managerPollA1f280AxisFillPair0CallVa,
  managerPollA1eed0AxisFillCallVa,
  managerPollA1f280DirBitsMerge,
  managerPollA1f280FillAxisStoreBasePair0,
  managerPollA1f280FillAxisStoreBasePair1,
  managerPollA1f280FillDirBitBasePair0,
  managerPollA1f280FillDirBitBasePair1,
  managerPollA1f280AxisNegPart,
  managerPollA1f280AxisPosPart,
  managerPollA1f280ActionQueryVcallNeeded,
  managerPollA1f280ActionQueryVcallArg,
  managerPollA1f280ActionQueryVtblSlot,
  managerPollA1f280ActionQueryCallVa,
  managerPollA1f280ActionIndexAfterPush,
  managerPollA1f280ActionModeAfterPush,
  managerPollA1f280ActionIdOorLogNeeded,
  managerPollA1f280RumblePathNeeded,
  managerPollA1f280RumbleVcallArgs,
  managerPollA1f280RumbleNegTimerPath,
  managerPollA1f280RumbleVtblSlot,
  managerPollA1f280SuccessReturn,
  a112c0HostVa,
} from "./process-input-pure-model.mjs";

/** Residual-plan module version (not ProcessInput pure-helper ABI). */
export const PROCESS_INPUT_RESIDUAL_PLAN_VERSION = 1;

/** Pure-helper ABI this residual plan documents (ready/fill/axis gates). */
export const PROCESS_INPUT_RESIDUAL_PURE_ABI = PROCESS_INPUT_PURE_ABI_VERSION;

/**
 * Future HostHandler residual kinds for FUN_00a1f280 (not wired into Update).
 * Values are stable documentation constants for a later residual event pin.
 */
export const A1F280_RESIDUAL_NONE = 0;
/** Host still owns device [vtbl+0x78]() body @ 0x00a1f30a. */
export const A1F280_RESIDUAL_READY_VCALL = 1;
/**
 * Host owns fill-present [vtbl+0x80] and/or axis-fill [vtbl+0x7c] bodies
 * (pair0/pair1 + a1eed0 lead). Pure posts cover gates/args/merge.
 */
export const A1F280_RESIDUAL_FILL_AXIS = 2;
/** Host owns action-query [vtbl+0x3c](0) body @ 0x00a1f4db. */
export const A1F280_RESIDUAL_ACTION_QUERY = 3;
/** Host owns rumble [vtbl+0x84] body @ 0x00a1f65a (+ a68490 / aefe20). */
export const A1F280_RESIDUAL_RUMBLE = 4;
/** Whole a1f280 body still host (default before samples land). */
export const A1F280_RESIDUAL_MONOLITHIC = 5;

export const A1F280_RESIDUAL_KINDS = Object.freeze({
  none: A1F280_RESIDUAL_NONE,
  readyVcall: A1F280_RESIDUAL_READY_VCALL,
  fillAxis: A1F280_RESIDUAL_FILL_AXIS,
  actionQuery: A1F280_RESIDUAL_ACTION_QUERY,
  rumble: A1F280_RESIDUAL_RUMBLE,
  monolithic: A1F280_RESIDUAL_MONOLITHIC,
});

/* Host call-site / callee VAs still residual (device method bodies + CRT). */
export const A1F280_HOST_VA_ENTRY = 0x00a1f280;
export const A1F280_HOST_VA_CRT_CLEAR = 0x00af05df;
export const A1F280_HOST_VA_CRT_ZERO = 0x00af05e5;
export const A1F280_HOST_VA_READY = A1F280_READY_CALL_VA;
export const A1F280_HOST_VA_FILL_PAIR0 = A1F280_FILL_PAIR0_CALL_VA;
export const A1F280_HOST_VA_FILL_PAIR1 = A1F280_FILL_PAIR1_CALL_VA;
export const A1F280_HOST_VA_AXIS_PAIR0 = A1F280_AXIS_FILL_PAIR0_CALL_VA;
export const A1F280_HOST_VA_AXIS_PAIR1 = A1F280_AXIS_FILL_PAIR1_CALL_VA;
export const A1F280_HOST_VA_A1EED0_AXIS = A1EED0_AXIS_FILL_CALL_VA;
export const A1F280_HOST_VA_ACTION_QUERY = A1F280_ACTION_QUERY_CALL_VA;
export const A1F280_HOST_VA_RUMBLE = 0x00a1f65a;
export const A1F280_HOST_VA_A112C0 = A112C0_HOST_VA;
/** Parent Manager poll that calls a1fc00 → a1f280 (not ProcessInput pin). */
export const A1F280_HOST_VA_MANAGER_CALLSITE = 0x00954f78;
export const A1F280_HOST_VA_A1FC00 = 0x00a1fc00;

/**
 * PE-ordered pure-post slots inside FUN_00a1f280 after entry / CRT host.
 * Host still owns CRT bodies, device vcall bodies, a1eed0 lead fill, a112c0
 * log body, a68490 QPC, and rumble method body.
 */
export const A1F280_PURE_POSTS_PE_ORDER = Object.freeze([
  Object.freeze({
    slot: "A1F280_BUFFER_CLEAR",
    posts: Object.freeze(["buffer_bytes", "buffer_count"]),
    pureHelpers: Object.freeze([
      "managerPollA1f280BufferBytes",
      "managerPollA1f280BufferCount",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_READY_GATE",
    posts: Object.freeze([
      "ready_vcall_ok",
      "ready_early_return",
      "ready_vtbl_slot",
      "ready_call_va",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280ReadyVcallOk",
      "managerPollA1f280ReadyEarlyReturn",
      "managerPollA1f280ReadyVtblSlot",
      "managerPollA1f280ReadyCallVa",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_FILL_PAIR0",
    posts: Object.freeze([
      "fill_vcall_ok",
      "fill_pair0_arg",
      "fill_pair0_call_va",
      "fill_vtbl_slot",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280FillVcallOk",
      "managerPollA1f280FillPair0Arg",
      "managerPollA1f280FillPair0CallVa",
      "managerPollA1f280FillVtblSlot",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_AXIS_PAIR0",
    posts: Object.freeze([
      "axis_fill_pair0_call_va",
      "axis_fill_vtbl_slot",
      "dir_bits_merge",
      "axis_store_base_pair0",
      "dir_bit_base_pair0",
      "axis_neg_part",
      "axis_pos_part",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280AxisFillPair0CallVa",
      "managerPollA1f280AxisFillVtblSlot",
      "managerPollA1f280DirBitsMerge",
      "managerPollA1f280FillAxisStoreBasePair0",
      "managerPollA1f280FillDirBitBasePair0",
      "managerPollA1f280AxisNegPart",
      "managerPollA1f280AxisPosPart",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_FILL_PAIR1",
    posts: Object.freeze([
      "fill_vcall_ok",
      "fill_pair1_arg",
      "fill_call_va",
      "fill_vtbl_slot",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280FillVcallOk",
      "managerPollA1f280FillPair1Arg",
      "managerPollA1f280FillCallVa",
      "managerPollA1f280FillVtblSlot",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_AXIS_PAIR1",
    posts: Object.freeze([
      "axis_fill_call_va",
      "axis_fill_vtbl_slot",
      "dir_bits_merge",
      "axis_store_base_pair1",
      "dir_bit_base_pair1",
      "axis_neg_part",
      "axis_pos_part",
      "a1eed0_axis_fill_call_va",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280AxisFillCallVa",
      "managerPollA1f280AxisFillVtblSlot",
      "managerPollA1f280DirBitsMerge",
      "managerPollA1f280FillAxisStoreBasePair1",
      "managerPollA1f280FillDirBitBasePair1",
      "managerPollA1f280AxisNegPart",
      "managerPollA1f280AxisPosPart",
      "managerPollA1eed0AxisFillCallVa",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_ACTION_QUERY",
    posts: Object.freeze([
      "action_query_vcall_needed",
      "action_query_vcall_arg",
      "action_query_vtbl_slot",
      "action_query_call_va",
      "action_index_after_push",
      "action_mode_after_push",
      "action_id_oor_log_needed",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280ActionQueryVcallNeeded",
      "managerPollA1f280ActionQueryVcallArg",
      "managerPollA1f280ActionQueryVtblSlot",
      "managerPollA1f280ActionQueryCallVa",
      "managerPollA1f280ActionIndexAfterPush",
      "managerPollA1f280ActionModeAfterPush",
      "managerPollA1f280ActionIdOorLogNeeded",
    ]),
  }),
  Object.freeze({
    slot: "A1F280_RUMBLE",
    posts: Object.freeze([
      "rumble_path_needed",
      "rumble_vcall_args",
      "rumble_neg_timer_path",
      "rumble_vtbl_slot",
      "success_return",
    ]),
    pureHelpers: Object.freeze([
      "managerPollA1f280RumblePathNeeded",
      "managerPollA1f280RumbleVcallArgs",
      "managerPollA1f280RumbleNegTimerPath",
      "managerPollA1f280RumbleVtblSlot",
      "managerPollA1f280SuccessReturn",
    ]),
  }),
]);

/** Map pure-post kind → process-input-pure-model export name. */
export const A1F280_PURE_HELPER_BY_POST = Object.freeze({
  buffer_bytes: "managerPollA1f280BufferBytes",
  buffer_count: "managerPollA1f280BufferCount",
  ready_vcall_ok: "managerPollA1f280ReadyVcallOk",
  ready_early_return: "managerPollA1f280ReadyEarlyReturn",
  ready_vtbl_slot: "managerPollA1f280ReadyVtblSlot",
  ready_call_va: "managerPollA1f280ReadyCallVa",
  fill_vcall_ok: "managerPollA1f280FillVcallOk",
  fill_pair0_arg: "managerPollA1f280FillPair0Arg",
  fill_pair1_arg: "managerPollA1f280FillPair1Arg",
  fill_pair0_call_va: "managerPollA1f280FillPair0CallVa",
  fill_call_va: "managerPollA1f280FillCallVa",
  fill_vtbl_slot: "managerPollA1f280FillVtblSlot",
  axis_fill_pair0_call_va: "managerPollA1f280AxisFillPair0CallVa",
  axis_fill_call_va: "managerPollA1f280AxisFillCallVa",
  axis_fill_vtbl_slot: "managerPollA1f280AxisFillVtblSlot",
  a1eed0_axis_fill_call_va: "managerPollA1eed0AxisFillCallVa",
  dir_bits_merge: "managerPollA1f280DirBitsMerge",
  axis_store_base_pair0: "managerPollA1f280FillAxisStoreBasePair0",
  axis_store_base_pair1: "managerPollA1f280FillAxisStoreBasePair1",
  dir_bit_base_pair0: "managerPollA1f280FillDirBitBasePair0",
  dir_bit_base_pair1: "managerPollA1f280FillDirBitBasePair1",
  axis_neg_part: "managerPollA1f280AxisNegPart",
  axis_pos_part: "managerPollA1f280AxisPosPart",
  action_query_vcall_needed: "managerPollA1f280ActionQueryVcallNeeded",
  action_query_vcall_arg: "managerPollA1f280ActionQueryVcallArg",
  action_query_vtbl_slot: "managerPollA1f280ActionQueryVtblSlot",
  action_query_call_va: "managerPollA1f280ActionQueryCallVa",
  action_index_after_push: "managerPollA1f280ActionIndexAfterPush",
  action_mode_after_push: "managerPollA1f280ActionModeAfterPush",
  action_id_oor_log_needed: "managerPollA1f280ActionIdOorLogNeeded",
  rumble_path_needed: "managerPollA1f280RumblePathNeeded",
  rumble_vcall_args: "managerPollA1f280RumbleVcallArgs",
  rumble_neg_timer_path: "managerPollA1f280RumbleNegTimerPath",
  rumble_vtbl_slot: "managerPollA1f280RumbleVtblSlot",
  success_return: "managerPollA1f280SuccessReturn",
});

/** Unique pure helper names in first-appearance PE order. */
export const A1F280_PURE_HELPER_NAMES = Object.freeze([
  "managerPollA1f280BufferBytes",
  "managerPollA1f280BufferCount",
  "managerPollA1f280ReadyVcallOk",
  "managerPollA1f280ReadyEarlyReturn",
  "managerPollA1f280ReadyVtblSlot",
  "managerPollA1f280ReadyCallVa",
  "managerPollA1f280FillVcallOk",
  "managerPollA1f280FillPair0Arg",
  "managerPollA1f280FillPair0CallVa",
  "managerPollA1f280FillVtblSlot",
  "managerPollA1f280AxisFillPair0CallVa",
  "managerPollA1f280AxisFillVtblSlot",
  "managerPollA1f280DirBitsMerge",
  "managerPollA1f280FillAxisStoreBasePair0",
  "managerPollA1f280FillDirBitBasePair0",
  "managerPollA1f280AxisNegPart",
  "managerPollA1f280AxisPosPart",
  "managerPollA1f280FillPair1Arg",
  "managerPollA1f280FillCallVa",
  "managerPollA1f280AxisFillCallVa",
  "managerPollA1f280FillAxisStoreBasePair1",
  "managerPollA1f280FillDirBitBasePair1",
  "managerPollA1eed0AxisFillCallVa",
  "managerPollA1f280ActionQueryVcallNeeded",
  "managerPollA1f280ActionQueryVcallArg",
  "managerPollA1f280ActionQueryVtblSlot",
  "managerPollA1f280ActionQueryCallVa",
  "managerPollA1f280ActionIndexAfterPush",
  "managerPollA1f280ActionModeAfterPush",
  "managerPollA1f280ActionIdOorLogNeeded",
  "managerPollA1f280RumblePathNeeded",
  "managerPollA1f280RumbleVcallArgs",
  "managerPollA1f280RumbleNegTimerPath",
  "managerPollA1f280RumbleVtblSlot",
  "managerPollA1f280SuccessReturn",
]);

/** Host residual VA pack for future HostHandler bodies (not PE-emu). */
export function a1f280HostVas() {
  return Object.freeze({
    entry: A1F280_HOST_VA_ENTRY,
    crtClear: A1F280_HOST_VA_CRT_CLEAR,
    crtZero: A1F280_HOST_VA_CRT_ZERO,
    ready: A1F280_HOST_VA_READY,
    fillPair0: A1F280_HOST_VA_FILL_PAIR0,
    fillPair1: A1F280_HOST_VA_FILL_PAIR1,
    axisPair0: A1F280_HOST_VA_AXIS_PAIR0,
    axisPair1: A1F280_HOST_VA_AXIS_PAIR1,
    a1eed0Axis: A1F280_HOST_VA_A1EED0_AXIS,
    actionQuery: A1F280_HOST_VA_ACTION_QUERY,
    rumble: A1F280_HOST_VA_RUMBLE,
    a112c0: A1F280_HOST_VA_A112C0,
    managerCallsite: A1F280_HOST_VA_MANAGER_CALLSITE,
    a1fc00: A1F280_HOST_VA_A1FC00,
    vtbl: Object.freeze({
      ready: A1F280_VTBL_READY,
      fill: A1F280_VTBL_FILL,
      axisFill: A1F280_VTBL_AXIS_FILL,
      actionQuery: A1F280_VTBL_ACTION_QUERY,
      rumble: A1F280_VTBL_RUMBLE,
    }),
    fields: Object.freeze({
      dirBits: A1F280_OFF_DIR_BITS,
      dirThresh: A1F280_OFF_DIR_THRESH,
      remapThresh: A1F280_OFF_REMAP_THRESH,
      axisPair0: A1F280_OFF_AXIS_PAIR0,
      axisPair1: A1F280_OFF_AXIS_PAIR1,
      dirBitBasePair0: A1F280_DIR_BIT_BASE_PAIR0,
      dirBitBasePair1: A1F280_DIR_BIT_BASE_PAIR1,
    }),
  });
}

/** Interleave doc rows with pureHelpers resolved (HostHandler documentation). */
export function a1f280PurePostsInterleaveDoc() {
  return A1F280_PURE_POSTS_PE_ORDER.map((row) =>
    Object.freeze({
      slot: row.slot,
      posts: row.posts.slice(),
      pureHelpers: row.posts.map((p) => A1F280_PURE_HELPER_BY_POST[p]),
    }),
  );
}

function hasValue(v) {
  return v !== undefined && v !== null;
}

function normalizeAxisSample(pair, bitBase) {
  if (!pair || typeof pair !== "object") return null;
  const x = pair.x ?? pair.axisX ?? pair.outX;
  const y = pair.y ?? pair.axisY ?? pair.outY;
  if (!hasValue(x) || !hasValue(y)) return null;
  const dirThresh =
    pair.dirThresh ?? pair.threshold ?? pair.thresh ?? pair.dir_thresh ?? 0;
  const priorDirBits =
    pair.priorDirBits ?? pair.prior ?? pair.dirBits ?? pair.dir_bits ?? 0;
  return {
    x: Math.fround(+x),
    y: Math.fround(+y),
    dirThresh: Math.fround(+dirThresh),
    priorDirBits: priorDirBits >>> 0,
    bitBase: bitBase | 0,
  };
}

/**
 * Normalize residual samples from HostHandler event aliases.
 * Accepts flat object or { samples | gateSamples | a1f280Samples }.
 *
 * @returns {object|null}
 */
export function normalizeA1f280GateSamples(samples) {
  if (!samples || typeof samples !== "object") return null;
  const s =
    samples.a1f280Samples ??
    samples.gateSamples ??
    samples.samples ??
    samples;
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;

  const readyAl = s.readyAl ?? s.ready_al ?? s.readyAL;
  const fillPair0Al = s.fillPair0Al ?? s.fill_pair0_al ?? s.fillP0Al;
  const fillPair1Al = s.fillPair1Al ?? s.fill_pair1_al ?? s.fillP1Al;
  const modeCc = s.modeCc ?? s.mode_cc ?? s.actionMode ?? s.mode;
  const actionId = s.actionId ?? s.action_id;
  const bufferIndex = s.bufferIndex ?? s.buffer_index ?? s.index;
  const bufferCount = s.bufferCount ?? s.buffer_count ?? s.count;
  const bufferEnd14 = s.bufferEnd14 ?? s.end14 ?? s.bufferEnd;
  const bufferBegin10 = s.bufferBegin10 ?? s.begin10 ?? s.bufferBegin;
  const flagsByte8 = s.flagsByte8 ?? s.flags ?? s.rumbleFlags;
  const timer = s.timer ?? s.rumbleTimer;
  const savedIntensity = s.savedIntensity ?? s.intensity ?? s.rumbleIntensity;

  const pair0 = normalizeAxisSample(
    s.pair0 ?? s.axisPair0 ?? s.axis0,
    A1F280_DIR_BIT_BASE_PAIR0,
  );
  const pair1 = normalizeAxisSample(
    s.pair1 ?? s.axisPair1 ?? s.axis1,
    A1F280_DIR_BIT_BASE_PAIR1,
  );

  const hasAny =
    hasValue(readyAl) ||
    hasValue(fillPair0Al) ||
    hasValue(fillPair1Al) ||
    hasValue(modeCc) ||
    hasValue(bufferEnd14) ||
    hasValue(bufferBegin10) ||
    pair0 !== null ||
    pair1 !== null ||
    hasValue(timer) ||
    hasValue(flagsByte8);

  if (!hasAny) return null;

  return {
    readyAl: hasValue(readyAl) ? readyAl | 0 : null,
    fillPair0Al: hasValue(fillPair0Al) ? fillPair0Al | 0 : null,
    fillPair1Al: hasValue(fillPair1Al) ? fillPair1Al | 0 : null,
    modeCc: hasValue(modeCc) ? modeCc >>> 0 : null,
    actionId: hasValue(actionId) ? actionId | 0 : null,
    bufferIndex: hasValue(bufferIndex) ? bufferIndex >>> 0 : null,
    bufferCount: hasValue(bufferCount) ? bufferCount | 0 : null,
    bufferEnd14: hasValue(bufferEnd14) ? bufferEnd14 | 0 : null,
    bufferBegin10: hasValue(bufferBegin10) ? bufferBegin10 | 0 : null,
    flagsByte8: hasValue(flagsByte8) ? flagsByte8 | 0 : null,
    timer: hasValue(timer) ? Math.fround(+timer) : null,
    savedIntensity: hasValue(savedIntensity)
      ? Math.fround(+savedIntensity)
      : null,
    pair0,
    pair1,
  };
}

/**
 * Apply freestanding a1f280 pure posts when gate samples land.
 * PE CF: ready early-return skips fill/axis/action/rumble pure posts.
 * Host still owns every device vcall body.
 *
 * @param {object} samples gate / axis / rumble samples (see normalize)
 * @returns {object[]} applied slot packs (may be empty without samples)
 */
export function applyA1f280VcallGatePurePosts(samples = {}) {
  const s = normalizeA1f280GateSamples(samples);
  if (!s) return [];

  const applied = [];

  // A1F280_BUFFER_CLEAR — pure size/count when end/begin samples present.
  if (hasValue(s.bufferEnd14) && hasValue(s.bufferBegin10)) {
    applied.push(
      Object.freeze({
        slot: "A1F280_BUFFER_CLEAR",
        bufferBytes: managerPollA1f280BufferBytes(s.bufferEnd14, s.bufferBegin10) | 0,
        bufferCount: managerPollA1f280BufferCount(s.bufferEnd14, s.bufferBegin10) | 0,
        end14: s.bufferEnd14 | 0,
        begin10: s.bufferBegin10 | 0,
      }),
    );
  }

  // A1F280_READY_GATE — always emit imms; AL gate when sample lands.
  const readySlot = {
    slot: "A1F280_READY_GATE",
    readyVtblSlot: managerPollA1f280ReadyVtblSlot() >>> 0,
    readyCallVa: managerPollA1f280ReadyCallVa() >>> 0,
  };
  if (hasValue(s.readyAl)) {
    readySlot.readyAl = s.readyAl | 0;
    readySlot.readyOk = managerPollA1f280ReadyVcallOk(s.readyAl) ? 1 : 0;
    readySlot.readyEarlyReturn = managerPollA1f280ReadyEarlyReturn(s.readyAl)
      ? 1
      : 0;
  }
  applied.push(Object.freeze(readySlot));

  const early =
    hasValue(s.readyAl) && managerPollA1f280ReadyEarlyReturn(s.readyAl);
  if (early) {
    return applied;
  }

  // A1F280_FILL_PAIR0
  const fill0 = {
    slot: "A1F280_FILL_PAIR0",
    fillVtblSlot: managerPollA1f280FillVtblSlot() >>> 0,
    fillPair0Arg: managerPollA1f280FillPair0Arg() | 0,
    fillPair0CallVa: managerPollA1f280FillPair0CallVa() >>> 0,
  };
  if (hasValue(s.fillPair0Al)) {
    fill0.fillPair0Al = s.fillPair0Al | 0;
    fill0.fillOk = managerPollA1f280FillVcallOk(s.fillPair0Al) ? 1 : 0;
  }
  applied.push(Object.freeze(fill0));

  // A1F280_AXIS_PAIR0 — only when fill_ok or axis sample without AL (doc apply).
  const pair0FillOk =
    !hasValue(s.fillPair0Al) || managerPollA1f280FillVcallOk(s.fillPair0Al);
  if (pair0FillOk && s.pair0) {
    const p = s.pair0;
    const dirBits = managerPollA1f280DirBitsMerge(
      p.priorDirBits,
      p.x,
      p.y,
      p.dirThresh,
      A1F280_DIR_BIT_BASE_PAIR0,
    );
    applied.push(
      Object.freeze({
        slot: "A1F280_AXIS_PAIR0",
        axisFillCallVa: managerPollA1f280AxisFillPair0CallVa() >>> 0,
        axisFillVtblSlot: managerPollA1f280AxisFillVtblSlot() >>> 0,
        axisStoreBase: managerPollA1f280FillAxisStoreBasePair0() >>> 0,
        dirBitBase: managerPollA1f280FillDirBitBasePair0() >>> 0,
        x: p.x,
        y: p.y,
        dirThresh: p.dirThresh,
        priorDirBits: p.priorDirBits >>> 0,
        dirBitsMerged: dirBits >>> 0,
        axisNegX: managerPollA1f280AxisNegPart(p.x),
        axisPosX: managerPollA1f280AxisPosPart(p.x),
        axisNegY: managerPollA1f280AxisNegPart(p.y),
        axisPosY: managerPollA1f280AxisPosPart(p.y),
      }),
    );
  } else if (pair0FillOk) {
    applied.push(
      Object.freeze({
        slot: "A1F280_AXIS_PAIR0",
        axisFillCallVa: managerPollA1f280AxisFillPair0CallVa() >>> 0,
        axisFillVtblSlot: managerPollA1f280AxisFillVtblSlot() >>> 0,
        axisStoreBase: managerPollA1f280FillAxisStoreBasePair0() >>> 0,
        dirBitBase: managerPollA1f280FillDirBitBasePair0() >>> 0,
        purePostsFromSamples: false,
      }),
    );
  }

  // A1F280_FILL_PAIR1
  const fill1 = {
    slot: "A1F280_FILL_PAIR1",
    fillVtblSlot: managerPollA1f280FillVtblSlot() >>> 0,
    fillPair1Arg: managerPollA1f280FillPair1Arg() | 0,
    fillCallVa: managerPollA1f280FillCallVa() >>> 0,
  };
  if (hasValue(s.fillPair1Al)) {
    fill1.fillPair1Al = s.fillPair1Al | 0;
    fill1.fillOk = managerPollA1f280FillVcallOk(s.fillPair1Al) ? 1 : 0;
  }
  applied.push(Object.freeze(fill1));

  const pair1FillOk =
    !hasValue(s.fillPair1Al) || managerPollA1f280FillVcallOk(s.fillPair1Al);
  if (pair1FillOk && s.pair1) {
    const p = s.pair1;
    const dirBits = managerPollA1f280DirBitsMerge(
      p.priorDirBits,
      p.x,
      p.y,
      p.dirThresh,
      A1F280_DIR_BIT_BASE_PAIR1,
    );
    applied.push(
      Object.freeze({
        slot: "A1F280_AXIS_PAIR1",
        axisFillCallVa: managerPollA1f280AxisFillCallVa() >>> 0,
        axisFillVtblSlot: managerPollA1f280AxisFillVtblSlot() >>> 0,
        a1eed0AxisFillCallVa: managerPollA1eed0AxisFillCallVa() >>> 0,
        axisStoreBase: managerPollA1f280FillAxisStoreBasePair1() >>> 0,
        dirBitBase: managerPollA1f280FillDirBitBasePair1() >>> 0,
        x: p.x,
        y: p.y,
        dirThresh: p.dirThresh,
        priorDirBits: p.priorDirBits >>> 0,
        dirBitsMerged: dirBits >>> 0,
        axisNegX: managerPollA1f280AxisNegPart(p.x),
        axisPosX: managerPollA1f280AxisPosPart(p.x),
        axisNegY: managerPollA1f280AxisNegPart(p.y),
        axisPosY: managerPollA1f280AxisPosPart(p.y),
      }),
    );
  } else if (pair1FillOk) {
    applied.push(
      Object.freeze({
        slot: "A1F280_AXIS_PAIR1",
        axisFillCallVa: managerPollA1f280AxisFillCallVa() >>> 0,
        axisFillVtblSlot: managerPollA1f280AxisFillVtblSlot() >>> 0,
        a1eed0AxisFillCallVa: managerPollA1eed0AxisFillCallVa() >>> 0,
        axisStoreBase: managerPollA1f280FillAxisStoreBasePair1() >>> 0,
        dirBitBase: managerPollA1f280FillDirBitBasePair1() >>> 0,
        purePostsFromSamples: false,
      }),
    );
  }

  // A1F280_ACTION_QUERY
  const actionSlot = {
    slot: "A1F280_ACTION_QUERY",
    actionQueryVtblSlot: managerPollA1f280ActionQueryVtblSlot() >>> 0,
    actionQueryCallVa: managerPollA1f280ActionQueryCallVa() >>> 0,
    actionQueryArg: managerPollA1f280ActionQueryVcallArg() | 0,
    actionIndexAfterPush: managerPollA1f280ActionIndexAfterPush() >>> 0,
    actionModeAfterPush: managerPollA1f280ActionModeAfterPush() >>> 0,
  };
  if (hasValue(s.modeCc)) {
    actionSlot.modeCc = s.modeCc >>> 0;
    actionSlot.actionQueryNeeded = managerPollA1f280ActionQueryVcallNeeded(
      s.modeCc,
    )
      ? 1
      : 0;
  }
  if (hasValue(s.bufferIndex) && hasValue(s.bufferCount)) {
    actionSlot.bufferIndex = s.bufferIndex >>> 0;
    actionSlot.bufferCount = s.bufferCount | 0;
    actionSlot.actionIdOorLogNeeded = managerPollA1f280ActionIdOorLogNeeded(
      s.bufferIndex,
      s.bufferCount,
    )
      ? 1
      : 0;
  }
  applied.push(Object.freeze(actionSlot));

  // A1F280_RUMBLE — pure arg prep when timer/flags sample.
  if (hasValue(s.flagsByte8) || hasValue(s.timer)) {
    const flags = hasValue(s.flagsByte8) ? s.flagsByte8 | 0 : 0;
    const timer = hasValue(s.timer) ? s.timer : 0;
    const intensity = hasValue(s.savedIntensity) ? s.savedIntensity : 0;
    const pathNeeded = managerPollA1f280RumblePathNeeded(flags);
    const args = managerPollA1f280RumbleVcallArgs(timer, intensity);
    applied.push(
      Object.freeze({
        slot: "A1F280_RUMBLE",
        rumbleVtblSlot: managerPollA1f280RumbleVtblSlot() >>> 0,
        rumblePathNeeded: pathNeeded ? 1 : 0,
        rumbleNegTimerPath: managerPollA1f280RumbleNegTimerPath(timer) ? 1 : 0,
        rumbleVcallTimer: args.timer,
        rumbleVcallIntensity: args.intensity,
        successReturn: managerPollA1f280SuccessReturn() | 0,
      }),
    );
  }

  return applied;
}

/**
 * Residual wire decision from samples (future HostHandler pin).
 * Does not execute host bodies; pure-complete only when ready early-return.
 *
 * @param {object} [opts]
 * @returns {object} frozen plan
 */
export function a1f280ResidualPlan(opts = {}) {
  const s = normalizeA1f280GateSamples(opts) ?? normalizeA1f280GateSamples({
    readyAl: opts.readyAl,
    fillPair0Al: opts.fillPair0Al,
    fillPair1Al: opts.fillPair1Al,
    modeCc: opts.modeCc,
    pair0: opts.pair0,
    pair1: opts.pair1,
    flagsByte8: opts.flagsByte8,
    timer: opts.timer,
    savedIntensity: opts.savedIntensity,
    bufferEnd14: opts.bufferEnd14,
    bufferBegin10: opts.bufferBegin10,
  });

  if (!s) {
    return Object.freeze({
      residualKind: A1F280_RESIDUAL_MONOLITHIC,
      pureComplete: false,
      earlyReturn: false,
      readyOk: null,
      needsReadyHost: true,
      needsFillAxisHost: true,
      needsActionQueryHost: true,
      needsRumbleHost: true,
      hostVas: a1f280HostVas(),
    });
  }

  const hasReady = hasValue(s.readyAl);
  const readyOk = hasReady ? managerPollA1f280ReadyVcallOk(s.readyAl) : null;
  const earlyReturn = hasReady
    ? managerPollA1f280ReadyEarlyReturn(s.readyAl)
    : false;

  if (earlyReturn) {
    // Host ready body already assumed to have run; pure gate says epilog.
    return Object.freeze({
      residualKind: A1F280_RESIDUAL_NONE,
      pureComplete: true,
      earlyReturn: true,
      readyOk: false,
      needsReadyHost: false,
      needsFillAxisHost: false,
      needsActionQueryHost: false,
      needsRumbleHost: false,
      hostVas: a1f280HostVas(),
    });
  }

  // Ready sample missing → still need ready host body first.
  if (!hasReady) {
    return Object.freeze({
      residualKind: A1F280_RESIDUAL_READY_VCALL,
      pureComplete: false,
      earlyReturn: false,
      readyOk: null,
      needsReadyHost: true,
      needsFillAxisHost: true,
      needsActionQueryHost: true,
      needsRumbleHost: true,
      hostVas: a1f280HostVas(),
    });
  }

  // Ready ok path: fill/axis host remains until device method is ported.
  const modeCc = hasValue(s.modeCc) ? s.modeCc : null;
  const actionNeeded =
    modeCc === null ? true : managerPollA1f280ActionQueryVcallNeeded(modeCc);
  const rumbleNeeded = hasValue(s.flagsByte8)
    ? managerPollA1f280RumblePathNeeded(s.flagsByte8)
    : true;

  let residualKind = A1F280_RESIDUAL_FILL_AXIS;
  if (!actionNeeded && !rumbleNeeded) {
    // Fill/axis pure posts may have applied; host still owns method bodies.
    residualKind = A1F280_RESIDUAL_FILL_AXIS;
  } else if (actionNeeded && !rumbleNeeded) {
    residualKind = A1F280_RESIDUAL_ACTION_QUERY;
  } else if (rumbleNeeded && modeCc !== null && !actionNeeded) {
    residualKind = A1F280_RESIDUAL_RUMBLE;
  }

  return Object.freeze({
    residualKind,
    pureComplete: false,
    earlyReturn: false,
    readyOk: true,
    needsReadyHost: false,
    needsFillAxisHost: true,
    needsActionQueryHost: actionNeeded,
    needsRumbleHost: rumbleNeeded,
    modeCc,
    hostVas: a1f280HostVas(),
  });
}

/**
 * Shared residual pure-post path for a future HostHandler event.
 * Without samples: documentation-only PE interleave plan.
 * With samples: purePostsApplied from applyA1f280VcallGatePurePosts.
 *
 * @param {object} [event]
 */
export function a1f280PurePostsFromEvent(event = {}) {
  const samples =
    event?.a1f280Samples ??
    event?.gateSamples ??
    event?.samples ??
    event ??
    null;
  const normalized = normalizeA1f280GateSamples(samples);
  const hasSamples = normalized !== null;
  const plan = a1f280ResidualPlan(hasSamples ? normalized : {});
  return Object.freeze({
    purePostsPeOrder: a1f280PurePostsInterleaveDoc(),
    pureHelperNames: A1F280_PURE_HELPER_NAMES.slice(),
    purePostsApplied: hasSamples
      ? applyA1f280VcallGatePurePosts(samples)
      : null,
    purePostsFromSamples: hasSamples,
    residualPlan: plan,
    residualKind: plan.residualKind | 0,
    pureComplete: plan.pureComplete ? 1 : 0,
    hostVas: a1f280HostVas(),
    pureAbiVersion: PROCESS_INPUT_RESIDUAL_PURE_ABI,
    residualPlanVersion: PROCESS_INPUT_RESIDUAL_PLAN_VERSION,
    // Future HostHandler kind id (not registered in Update residual table).
    futureHostKind: "processInputA1f280",
    rootSymbol: "FUN_00a1f280",
    processInputPinned: false,
  });
}

/**
 * Residual label string for logs / HostHandler result metadata.
 * @param {object|null} [applied] plan or purePostsFromEvent result
 */
export function a1f280ResidualLabel(applied) {
  if (!applied) return "a1f280-monolithic-host";
  const kind =
    applied.residualKind ?? applied.residualPlan?.residualKind ?? null;
  if (applied.pureComplete || kind === A1F280_RESIDUAL_NONE) {
    return "a1f280-ready-early-pure-complete";
  }
  if (kind === A1F280_RESIDUAL_READY_VCALL) return "a1f280-ready-host";
  if (kind === A1F280_RESIDUAL_FILL_AXIS) return "a1f280-fill-axis-host";
  if (kind === A1F280_RESIDUAL_ACTION_QUERY) return "a1f280-action-query-host";
  if (kind === A1F280_RESIDUAL_RUMBLE) return "a1f280-rumble-host";
  if (kind === A1F280_RESIDUAL_MONOLITHIC) return "a1f280-monolithic-host";
  return "a1f280-host";
}

/**
 * Multi-root residual note: ProcessInput pure helpers are available under
 * frame-path-roots id "processInput", but no residual host kind is registered
 * on the Update HostHandler table yet. This export is the pin surface.
 */
export const PROCESS_INPUT_A1F280_RESIDUAL_NOTE = Object.freeze({
  residualPlanVersion: PROCESS_INPUT_RESIDUAL_PLAN_VERSION,
  pureAbiVersion: PROCESS_INPUT_RESIDUAL_PURE_ABI,
  pureRootId: "processInput",
  pureName: "process-input",
  hostFunction: "FUN_00a1f280",
  hostEntryVa: A1F280_HOST_VA_ENTRY,
  processInputPinned: false,
  updateHostHandlerWired: false,
  futureHostKind: "processInputA1f280",
  purePostsPeOrderSlots: A1F280_PURE_POSTS_PE_ORDER.map((r) => r.slot),
  residualKinds: A1F280_RESIDUAL_KINDS,
  nextHostVa: A1F280_HOST_VA_READY,
  notes:
    "Wire ready/fill/axis pure posts via applyA1f280VcallGatePurePosts when " +
    "a multi-root ProcessInput residual HostHandler event is introduced. " +
    "Device vcall bodies stay host until a concrete receiver is ported.",
});
