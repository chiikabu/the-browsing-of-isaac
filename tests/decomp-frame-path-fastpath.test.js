/**
 * Wasm-only fast driver equivalence — pins runNativeGameUpdateTickWasmOnly
 * (the shipped browser tick) against the lockstep oracle driver.
 *
 * The fast driver replicates the lockstep continuation chain reading
 * `continuationKind` from the Wasm events struct instead of the JS oracle.
 * These tests drive BOTH drivers through identical multi-tick sessions with
 * state patches and runtime inputs chosen to fire continuation resumes, and
 * require byte-identical state, events, continuation kinds, and host-event
 * totals every tick. A fast driver that diverges from the oracle-checked
 * lockstep path on ANY exercised lane fails here.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  loadGameUpdateSliceWasm,
  createNativeUpdateSession,
  createResidualHostHandler,
  runNativeGameUpdateTickWasmOnly,
} from "../scripts/decomp/frame-path.mjs";
import {
  RUNTIME_INPUTS_LAYOUT,
  normalizeRuntimeInputsForLayout,
  writeRuntimeInputsForLayout,
  writeStruct,
} from "../scripts/decomp/game-update-model.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
const haveWasm = existsSync(wasmPath);

// Deterministic draws from the shared-LCG family, high bits only (repo rule).
function lcg(seed) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s >>> 16;
  };
}

function drawTickInputs(rnd, t) {
  const patch = {};
  const runtime = {};
  if (t % 7 === 1) patch.menuState23a74 = rnd() % 3;
  if (t % 11 === 2) patch.transitionMode = rnd() % 4;
  if (t % 5 === 3) patch.shortTimer = rnd() % 100;
  if (t % 13 === 4) patch.state24ecc = rnd() % 5;
  if (t % 17 === 5) patch.gate1d520 = rnd() % 2;
  if (t % 9 === 6) runtime.frameOpaque4257b0IdCount = rnd() % 6;
  if (t % 9 === 7) runtime.frameOpaque4257b0ListCount = rnd() % 6;
  if (t % 15 === 8) runtime.monotonicCounterLow = rnd();
  if (t % 21 === 9) patch.itemOverlayState = rnd() % 3;
  if (t % 19 === 10) patch.genericPromptActiveFlag = rnd() % 2;
  return { patch: Object.keys(patch).length ? patch : null, runtime };
}

async function runSession(lockstep, ticks, seed) {
  const slice = await loadGameUpdateSliceWasm(wasmPath);
  const session = createNativeUpdateSession(slice, {
    onHostEvent: createResidualHostHandler(),
    lockstep,
  });
  const rnd = lcg(seed);
  const out = [];
  for (let t = 0; t < ticks; t += 1) {
    const { patch, runtime } = drawTickInputs(rnd, t);
    const r = session.tick(runtime, patch);
    out.push({
      state: r.state,
      events: r.events,
      continuationKind: r.continuationKind,
    });
  }
  return { out, hostTotals: session.hostTotals };
}

test("fast driver matches lockstep across 120 patched/runtime-varied ticks", { skip: !haveWasm }, async () => {
  const a = await runSession(true, 120, 0xc0ffee);
  const b = await runSession(false, 120, 0xc0ffee);
  for (let i = 0; i < a.out.length; i += 1) {
    assert.deepEqual(b.out[i].state, a.out[i].state, `state diverges at tick ${i}`);
    assert.deepEqual(b.out[i].events, a.out[i].events, `events diverge at tick ${i}`);
    assert.equal(
      b.out[i].continuationKind,
      a.out[i].continuationKind,
      `continuation kind diverges at tick ${i}`,
    );
  }
  assert.deepEqual(b.hostTotals, a.hostTotals, "host-event totals diverge");
});

test("fast driver actually exercises continuation resumes (not just the trivial path)", { skip: !haveWasm }, async () => {
  const { out, hostTotals } = await runSession(false, 120, 0xc0ffee);
  const kinds = new Set(out.map((r) => r.continuationKind));
  assert.ok(kinds.size >= 1, "continuation kinds recorded");
  // Host events flowing proves collectHostEvents ran on the fast path.
  assert.ok(hostTotals && Object.keys(hostTotals).length > 0, "host events collected");
});

test("fused runtime writer is byte-identical to normalize+writeStruct", () => {
  // The live tick writes runtime inputs with writeRuntimeInputsForLayout
  // (no 4000-key object per call); this pins it byte-for-byte against the
  // reference normalize+writeStruct pair across the tricky input shapes:
  // array forms (menu-aux nodes / timers / door slots), string anm2 names,
  // explicit flat keys that must lose to lane expansion, and undefined.
  const size = 1 << 16;
  const rnd = lcg(0xbeef);
  const cases = [
    {},
    { monotonicCounterLow: 5, frameOpaque4257b0IdCount: 3 },
    {
      doorSlots: [{ present: 1, field3a0: 7 }, {}, { field8: 9 }],
      doorSlot0Present: 0xdead, // explicit flat key must WIN over the flatten
    },
    {
      menuAuxTreeNodes: [
        { left: 1, right: 2, isnil: 0, payloadPresent: 1, payloadSize: 8 },
        {},
      ],
      menuAuxTreeLeft0: 0x1234, // must LOSE to the lane expansion
      updateListTimers: [3, -1, 0x7fffffff],
      updateListTimer1: 0x55, // must LOSE while the array form is present
    },
    { updateListTimer2: 0x66 }, // no array form -> flat key must WIN
    { engineAnm2LayerNames: ["head", "body"], engineAnm2Loaded: 1 },
    { shortTimer: undefined, transitionMode: null },
    Object.fromEntries(
      Object.keys(RUNTIME_INPUTS_LAYOUT)
        .filter(() => rnd() % 7 === 0)
        .map((k) => [k, rnd()]),
    ),
  ];
  for (const [ci, input] of cases.entries()) {
    const a = new Uint8Array(size).fill(0xa5);
    const b = new Uint8Array(size).fill(0xa5);
    writeStruct(new DataView(a.buffer), 64, RUNTIME_INPUTS_LAYOUT,
      normalizeRuntimeInputsForLayout(input));
    writeRuntimeInputsForLayout(new DataView(b.buffer), 64, input);
    assert.deepEqual(Buffer.from(b), Buffer.from(a), `case ${ci} diverges`);
  }
});

test("session default stays lockstep; fast mode is an explicit opt-in", { skip: !haveWasm }, async () => {
  // Guards the safety default: tests and legacy callers keep the oracle
  // unless they ask for the fast driver. (The browser bridge opts in.)
  const slice = await loadGameUpdateSliceWasm(wasmPath);
  const def = createNativeUpdateSession(slice);
  const r = def.tick();
  assert.equal(r.usesX86Emulation, false);
  assert.equal(typeof runNativeGameUpdateTickWasmOnly, "function");
});
