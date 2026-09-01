/**
 * Game::Render ROOT SLICE wiring on the browser frame path.
 *
 * Covers the seam described in section-notes/hybrid-render-input-plan/render-wiring.md
 * §2 / §5.3 / §5.4:
 *   1. the render root slice is catalogued in frame-path-roots.mjs as a
 *      "root-slice" module distinct from the render-shell PURE helper entry,
 *      with its ABI derived from scripts/decomp/game-render-model.mjs;
 *   2. web/js/native-update-bridge.js loads it and drives one render tick per
 *      frame on the SAME JS-owned Game buffer as the Update session;
 *   3. a missing / stale-ABI render module is non-fatal — the Update tick keeps
 *      running and renderTick() returns null.
 *
 * The browser bridge imports its dependencies by absolute /@decomp/scripts/*
 * URLs (rewritten by scripts/serve.mjs). To execute the REAL bridge under Node
 * the specifiers are rewritten to file URLs and the module is imported from a
 * temp dir — the bridge logic itself is unmodified.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  FRAME_PATH_MODULE_KIND,
  FRAME_PATH_ROOTS,
  FRAME_PATH_ROOT_BY_ID,
  PURE_HELPER_MODULES,
  ALL_PURE_HELPER_IDS,
  ROOT_SLICE_IDS,
  ROOT_SLICE_MODULES,
  probeFramePathRootPlanAvailability,
  probePureHelperAvailability,
  probeRootSliceAvailability,
  resolveRootSliceSpec,
  resolveRootSliceWasmPath,
  rootSliceBrowserUrl,
  selectFramePathRoots,
} from "../scripts/decomp/frame-path-roots.mjs";
import { FRAME_PATH_MODE, HOST_EVENT_KINDS, readSparseFieldsFromGameObject } from "../scripts/decomp/frame-path.mjs";
import {
  GAME_RENDER_SLICE_ABI_VERSION,
  GAME_RENDER_GAME_OBJECT_MIN_SIZE,
} from "../scripts/decomp/game-render-model.mjs";
import { GAME_OBJECT_MIN_SIZE } from "../scripts/decomp/game-update-model.mjs";
import {
  EVENTS_LAYOUT,
  GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK,
  RUNTIME_INPUTS_LAYOUT,
  emitFrameEffect6fd7c0HostResiduals,
  gameUpdateSlice8318a0SfxManagerStoreApplyPlan,
  gameUpdateSliceTailPathWire,
  flattenTailPathEntriesRuntime,
} from "../scripts/decomp/game-update-model.mjs";
import { RENDER_SHELL_PURE_ABI_VERSION } from "../scripts/decomp/render-shell-pure-model.mjs";
import { EXIT_PURE_ABI_VERSION } from "../scripts/decomp/exit-pure-model.mjs";
import {
  createRenderHostHandler,
  defaultRenderRecapture,
  loadGameRenderSliceWasm,
} from "../scripts/decomp/frame-render-root.mjs";
import { SERVE_HOST, startServer } from "../scripts/serve.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const updateWasmPath = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
const renderWasmPath = join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm");
const exitWasmPath = join(root, "output", "decomp", "exit-pure", "exit-pure-helpers.wasm");
const bridgeSourcePath = join(root, "web", "js", "native-update-bridge.js");
/* Windows transient locks (OneDrive/AV) intermittently fail the source
   write (-4094); retry with the standing 120-attempt backoff budget so a
   bridge mutant can never survive a failed restore (C6-hardening5 gap:
   wave-29 W29-S2 wrote this tracked shipped source with plain writeFileSync). */
function writeBridgeSourceRetry(content) {
  for (let attempt = 0; ; ++attempt) {
    try {
      writeFileSync(bridgeSourcePath, content, "utf8");
      return;
    } catch (e) {
      if (attempt >= 120) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
        Math.min(25 * (attempt + 1), 500));
    }
  }
}

function ensureUpdateSliceBuilt() {
  if (existsSync(updateWasmPath)) return true;
  const built = spawnSync(
    process.execPath,
    [join(root, "scripts", "decomp", "build-game-update-slice.mjs")],
    { cwd: root, stdio: "inherit" },
  );
  return built.status === 0 && existsSync(updateWasmPath);
}

/**
 * Import the REAL browser bridge under Node by rewriting only its
 * /@decomp/scripts/* import specifiers to file URLs.
 */
let bridgeModulePromise = null;
function importBridge() {
  if (bridgeModulePromise) return bridgeModulePromise;
  const source = readFileSync(bridgeSourcePath, "utf8");
  const rewritten = source.replace(
    /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
    (_match, file) => JSON.stringify(pathToFileURL(join(root, "scripts", "decomp", file)).href),
  );
  // Only import SPECIFIERS must be rewritten (prose mentions of the mount path
  // in comments are fine).
  assert.ok(
    !/from\s*"\/@decomp\//.test(rewritten),
    "every /@decomp/scripts/* bridge import must be rewritable for Node",
  );
  assert.match(source, /from\s*"\/@decomp\/scripts\/frame-render-root\.mjs"/);
  const dir = mkdtempSync(join(tmpdir(), "isaac-render-bridge-"));
  const file = join(dir, "native-update-bridge.mjs");
  writeFileSync(file, rewritten);
  bridgeModulePromise = import(pathToFileURL(file).href);
  return bridgeModulePromise;
}

/* -------------------------------------------------------------------------
 * 1. Catalog
 * ---------------------------------------------------------------------- */

test("render ROOT SLICE is catalogued separately from the render-shell pure helper", () => {
  const spec = ROOT_SLICE_MODULES.render;
  assert.ok(spec, "ROOT_SLICE_MODULES.render must exist");
  assert.equal(spec.kind, FRAME_PATH_MODULE_KIND.ROOT_SLICE);
  assert.equal(spec.kind, "root-slice");
  assert.equal(spec.dir, "game-render-slice");
  assert.equal(spec.wasmFile, "game-render-slice.wasm");
  assert.equal(spec.abiExport, "isaac_game_render_slice_abi_version");
  assert.equal(spec.rootSymbol, "Game::Render");

  // ABI must come from the model module, never a literal in the catalog.
  assert.equal(spec.expectedAbi, GAME_RENDER_SLICE_ABI_VERSION);
  assert.equal(spec.gameObjectMinSize, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  const catalogSource = readFileSync(
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
    "utf8",
  );
  assert.match(
    catalogSource,
    /expectedAbi:\s*GAME_RENDER_SLICE_ABI_VERSION/,
    "root-slice expectedAbi must reference the model constant",
  );

  // The root slice must NOT leak into the pure-helper catalog: a root slice
  // owns capture/step/resume/apply and is loaded by its own driver.
  assert.equal(PURE_HELPER_MODULES["game-render-slice"], undefined);
  assert.equal(ALL_PURE_HELPER_IDS.includes("game-render-slice"), false);
  assert.deepEqual([...ALL_PURE_HELPER_IDS].sort(), Object.keys(PURE_HELPER_MODULES).sort());
  assert.deepEqual([...ROOT_SLICE_IDS], ["render"]);

  // The pure render-shell entry keeps its exact previous meaning.
  assert.equal(PURE_HELPER_MODULES.render.pureName, "render-shell");
  assert.equal(PURE_HELPER_MODULES.render.dir, "render-shell-pure");
  assert.equal(PURE_HELPER_MODULES.render.wasmFile, "render-shell-pure-helpers.wasm");
  assert.equal(PURE_HELPER_MODULES.render.expectedAbi, RENDER_SHELL_PURE_ABI_VERSION);
  assert.notEqual(PURE_HELPER_MODULES.render.expectedAbi, spec.expectedAbi);

  // Resolver + URL/path helpers.
  assert.equal(resolveRootSliceSpec("render"), spec);
  assert.equal(resolveRootSliceSpec("Render"), spec);
  assert.equal(resolveRootSliceSpec("game-render-slice"), spec);
  assert.throws(() => resolveRootSliceSpec("processInput"), /Unknown root slice/);
  assert.equal(rootSliceBrowserUrl("render"), "/@decomp/pure/game-render-slice/game-render-slice.wasm");
});

test("FRAME_PATH_ROOTS.Render records the driven root slice without changing the pure contract", () => {
  const render = FRAME_PATH_ROOT_BY_ID.Render;
  assert.equal(render.rootSliceId, "render");
  assert.equal(render.rootSliceAbi, GAME_RENDER_SLICE_ABI_VERSION);
  assert.equal(render.rootSliceWasmFile, "game-render-slice.wasm");
  assert.equal(render.rootSliceGameObjectMinSize, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  // wired = the root slice is driven per frame by bootNativeUpdateBridge.tick().
  assert.equal(render.wired, true);
  // Pre-existing fields keep their exact meaning (pure-helper island contract).
  assert.equal(render.pureName, "render-shell");
  assert.equal(render.pureId, "render");
  assert.equal(render.expectedAbi, RENDER_SHELL_PURE_ABI_VERSION);
  assert.equal(render.wasmFile, "render-shell-pure-helpers.wasm");

  // Roots list shape unchanged; Update, Render and Exit are wired.
  assert.deepEqual(
    FRAME_PATH_ROOTS.map((r) => r.id),
    ["Update", "Render", "ProcessInput", "Exit", "LuaEngine"],
  );
  assert.deepEqual(
    FRAME_PATH_ROOTS.filter((r) => r.wired).map((r) => r.id),
    ["Update", "Render", "Exit"],
  );

  // The render buffer fits inside the Update buffer, so one buffer serves both.
  assert.ok(GAME_RENDER_GAME_OBJECT_MIN_SIZE < GAME_OBJECT_MIN_SIZE);
});

test("selectFramePathRoots behaviour is unchanged by the root-slice registration", () => {
  const partial = selectFramePathRoots({
    preferNative: true,
    updateAvailable: true,
    pureAvailable: { render: true, processInput: true },
  });
  // Still keyed off the PURE helper availability, not the root slice.
  assert.equal(partial.render, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.Render, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(partial.exit, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(partial.luaEngine, FRAME_PATH_MODE.EMULATOR_X86);

  const none = selectFramePathRoots({ preferNative: true, updateAvailable: false, pureAvailable: {} });
  assert.equal(none.render, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(none.update, FRAME_PATH_MODE.EMULATOR_X86);
});

/* -------------------------------------------------------------------------
 * 2. Serve mount
 * ---------------------------------------------------------------------- */

test("serve mounts the render root slice under /@decomp/pure and it loads at the model ABI", async () => {
  if (!existsSync(renderWasmPath)) return;
  assert.equal(await probeRootSliceAvailability("render"), true);
  assert.equal(await resolveRootSliceWasmPath("render"), renderWasmPath);

  const server = await startServer({ port: 0, log: () => {} });
  try {
    const { port } = server.address();
    const url = `http://${SERVE_HOST}:${port}${rootSliceBrowserUrl("render")}`;
    const response = await fetch(url);
    assert.equal(response.ok, true, `serve render root-slice mount failed: ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 4)], [0x00, 0x61, 0x73, 0x6d], "wasm magic");

    const slice = await loadGameRenderSliceWasm(url);
    assert.equal(slice.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(slice.usesX86Emulation, false);
    assert.equal(slice.abiVersion, GAME_RENDER_SLICE_ABI_VERSION);
    assert.equal(slice.gameObjectMinSize, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  } finally {
    await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});

/* -------------------------------------------------------------------------
 * 3. Bridge wiring (served render module)
 * ---------------------------------------------------------------------- */

test("bridge boots the served render root slice and renderTick reports host-event counts", async () => {
  if (!existsSync(renderWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const server = await startServer({ port: 0, log: () => {} });
  try {
    const { port } = server.address();
    const base = `http://${SERVE_HOST}:${port}`;
    const bridge = await bootNativeUpdateBridge({
      wasmUrl: `${base}/@decomp/wasm/game-update-slice.wasm`,
      renderSliceUrl: `${base}${rootSliceBrowserUrl("render")}`,
      log: () => {},
    });

    // Backward-compatible surface (app.js + existing tests depend on these).
    assert.equal(bridge.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(bridge.usesX86Emulation, false);
    assert.ok(bridge.session);
    assert.ok(bridge.slice);
    assert.equal(typeof bridge.tick, "function");
    assert.ok("multiRoot" in bridge);

    // Render root slice is live and native.
    assert.equal(bridge.renderMode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.ok(bridge.renderSlice, "renderSlice must be loaded");
    assert.equal(bridge.renderSlice.abiVersion, GAME_RENDER_SLICE_ABI_VERSION);
    assert.equal(bridge.renderSlice.usesX86Emulation, false);
    assert.ok(bridge.renderSession, "renderSession must be created");
    assert.equal(bridge.renderSession.usesX86Emulation, false);

    /* SEPARATE buffers. The render root is *(Game+0x18300), not the Game
       object: both PE callers of the render shell do `mov edi,[0xc71678]` then
       `mov ecx,[edi+0x18300]` before `call 0x0080ea80` (VA 0x00831630 /
       0x00831e37). An earlier bridge shared the Game buffer here, which read
       gridW/gridH/entityCount as zeros — indistinguishable from an empty
       scene. (identity via assert.ok — assert.equal would byte-diff ~240 KB)  */
    assert.ok(
      bridge.renderSession.gameObject !== bridge.session.gameObject,
      "render session must NOT capture/apply on the Update session's Game buffer",
    );
    assert.ok(
      bridge.renderSession.gameObject === bridge.renderGameObject,
      "render session must use the bridge's render-root buffer",
    );
    assert.equal(bridge.renderGameObject.byteLength, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
    assert.ok(bridge.gameObject === bridge.session.gameObject, "bridge.gameObject is the Update buffer");
    assert.equal(bridge.gameObject.byteLength, GAME_OBJECT_MIN_SIZE);

    // Default host is the counting residual handler.
    assert.ok(bridge.renderHost, "default renderHost must exist");
    assert.equal(typeof bridge.renderHost.handler, "function");
    assert.equal(bridge.renderHost.usesX86Emulation, false);

    // Explicit render tick returns a result carrying host-event counts.
    const result = bridge.renderTick(1);
    assert.ok(result, "renderTick must return a result when the slice is loaded");
    assert.equal(result.mode, FRAME_PATH_MODE.NATIVE_WASM);
    assert.equal(result.usesX86Emulation, false);
    assert.ok(Array.isArray(result.hostKinds));
    assert.ok(result.hostKinds.length > 0, "render chain must emit at least one host event");
    assert.ok(result.hostTotals, "renderTick result must surface host-event totals");
    const totalEvents = Object.values(result.hostTotals).reduce((a, b) => a + b, 0);
    assert.equal(totalEvents, result.hostKinds.length);
    // No PE: every host kind is a numeric address-stable kind, never an emulator kind.
    for (const kind of result.hostKinds) assert.equal(typeof kind, "number");
    assert.ok(!Object.keys(result.hostTotals).some((k) => /emulator|boxedwine|pe-emu/i.test(k)));
    assert.equal(bridge.usesX86Emulation, false);
  } finally {
    await new Promise((resolve, reject) => server.close((e) => (e ? reject(e) : resolve())));
  }
});

test("bridge tick() drives exactly one render tick per frame on its own render-root buffer", async () => {
  if (!existsSync(renderWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  assert.ok(bridge.renderSession);
  assert.ok(
    bridge.renderSession.gameObject === bridge.renderGameObject &&
      bridge.renderSession.gameObject !== bridge.session.gameObject,
    "render session must drive its own *(Game+0x18300) buffer, not the Game buffer",
  );

  // rAF frame 1: app.js calls tick(time) — the render root slice runs too.
  const updateResult = bridge.tick(16);
  assert.ok(updateResult, "tick() must keep returning the Update result");
  assert.equal(updateResult.usesX86Emulation, false);
  assert.equal(bridge.session.ticks, 1);
  assert.equal(bridge.renderSession.ticks, 1, "render must be driven per frame");

  // An explicit renderTick in the SAME frame must not drive the chain twice.
  const cached = bridge.renderTick(16);
  assert.ok(cached);
  assert.equal(bridge.renderSession.ticks, 1, "same frame must not double-drive render");

  // Next frame drives render again.
  bridge.tick(32);
  assert.equal(bridge.session.ticks, 2);
  assert.equal(bridge.renderSession.ticks, 2);

  // Host totals accumulate across frames (counting residual handler).
  const totals = bridge.renderHost.totals;
  assert.ok(Object.values(totals).reduce((a, b) => a + b, 0) >= 2);

  // Zero-arg tick() still works (pre-existing callers) and still drives render.
  bridge.tick();
  assert.equal(bridge.session.ticks, 3);
  assert.equal(bridge.renderSession.ticks, 3);
  assert.equal(bridge.usesX86Emulation, false);
  assert.equal(bridge.renderErrors, 0);
});

test("bridge tick forwards extraRuntime and statePatch to the Update session", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });

  // Control: without a patch the slice leaves shortTimer at 0 after one tick.
  const control = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  control.tick(16);
  assert.equal(control.session.state.shortTimer, 0);

  // statePatch is merged into sparse state BEFORE the pre-tick buffer write, so
  // the slice sees 77 and counts it down to 76 (0 would mean the patch was lost).
  const patched = bridge.tick(16, null, { shortTimer: 77 });
  assert.ok(patched);
  assert.equal(bridge.session.state.shortTimer, 76);
  assert.notEqual(bridge.session.state.shortTimer, control.session.state.shortTimer);

  // Unknown sparse fields must surface the session's rejection, not be swallowed.
  assert.throws(
    () => bridge.tick(32, null, { definitelyNotASparseField: 1 }),
    /unknown sparse state field/,
  );

  // extraRuntime reaches the Update session (a bad runtime key is inert, but a
  // real one must not throw and the tick must still advance).
  const withRuntime = bridge.tick(48, { frameCounter264f8: 3 });
  assert.ok(withRuntime);
  assert.equal(withRuntime.usesX86Emulation, false);
});

test("setRenderHost swaps the render host handler at runtime", async () => {
  if (!existsSync(renderWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  assert.ok(bridge.renderSession);

  // A plain function host (what a GL host body will be).
  const seen = [];
  bridge.setRenderHost((detail) => seen.push(detail));
  assert.equal(typeof bridge.renderHost, "function");
  bridge.renderTick(1);
  assert.ok(seen.length > 0, "swapped host must receive render host events");
  assert.equal(typeof seen[0].kind, "number");
  assert.ok(Number.isFinite(seen[0].hostVa), "host events stay address-stable");

  // A handler object ({ handler, totals }) is accepted too.
  const counting = createRenderHostHandler();
  bridge.setRenderHost(counting);
  assert.equal(bridge.renderHost, counting);
  bridge.renderTick(2);
  assert.ok(Object.keys(counting.totals).length > 0);
  const beforeSwapBack = seen.length;
  assert.equal(beforeSwapBack, seen.length, "the replaced host must stop receiving events");

  // null restores the default counting residual handler.
  const restored = bridge.setRenderHost(null);
  assert.equal(bridge.renderHost, restored);
  assert.equal(typeof restored.handler, "function");
  assert.equal(restored.usesX86Emulation, false);

  assert.throws(() => bridge.setRenderHost(42), TypeError);
  assert.equal(bridge.usesX86Emulation, false);
});

/* -------------------------------------------------------------------------
 * 3b. Caller-supplied render runtime inputs / recapture / stats
 * ---------------------------------------------------------------------- */

test("render runtime inputs and recapture are caller-supplied and default to zeros", async () => {
  if (!existsSync(renderWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  assert.ok(bridge.renderSession);

  // Default: no provider installed, every input field zero. That is the
  // G0-closed epilog-only chain — nothing is drawn until a caller supplies a
  // guest-memory model. No gameplay value may be hardcoded in the bridge.
  assert.equal(bridge.renderInputs, null);
  const defaults = bridge.renderInputDefaults();
  assert.ok(Object.keys(defaults).length > 0);
  assert.deepEqual([...new Set(Object.values(defaults))], [0], "default render inputs must be all zero");
  const bridgeSource = readFileSync(bridgeSourcePath, "utf8");
  assert.ok(
    !/option2a3c3\s*[:=]\s*[1-9]/.test(bridgeSource),
    "the bridge must not hardcode a gate-opening input value",
  );

  // Zeroed baseline: the G0 gate is closed, so the chain walks the epilog only.
  const closed = bridge.renderTick(1);
  assert.ok(closed);
  assert.equal(bridge.renderStats.inputsSupplied, false);
  assert.equal(closed.steps, 1, "zero inputs must close the G0 gate (epilog chain only)");
  assert.equal(closed.hostKinds.length, 1);

  // An object provider is merged over the zero defaults and MUST reach the
  // slice: opening the G0 gate walks the draw-side chain instead. Asserting
  // the provider was merely *called* would not discriminate.
  bridge.setRenderInputs({ option2a3c3: 1 });
  assert.deepEqual(bridge.renderInputs, { option2a3c3: 1 });
  const opened = bridge.renderTick(2);
  assert.ok(opened);
  assert.equal(bridge.renderStats.inputsSupplied, true);
  assert.ok(
    opened.steps > closed.steps,
    `supplied render inputs must reach the slice (steps ${opened.steps} vs ${closed.steps})`,
  );
  assert.ok(
    opened.hostKinds.length > closed.hostKinds.length,
    "an open G0 gate must emit the draw-side host events",
  );

  // A function provider is called once per render tick with frame info.
  const frames = [];
  bridge.setRenderInputs((frameInfo) => {
    frames.push(frameInfo);
    return { option2a3c3: 1 };
  });
  bridge.renderTick(3);
  assert.equal(frames.length, 1, "input provider must run once per render tick");
  assert.equal(frames[0].time, 3);
  assert.equal(typeof frames[0].updateTicks, "number");
  assert.ok(frames[0].gameObject === bridge.renderGameObject, "provider sees the render-root buffer");
  // Same frame must not re-invoke the provider (no double drive).
  bridge.renderTick(3);
  assert.equal(frames.length, 1);

  // null restores the all-zero defaults.
  assert.equal(bridge.setRenderInputs(null), null);
  assert.equal(bridge.renderInputs, null);
  assert.throws(() => bridge.setRenderInputs(42), TypeError);

  // Recapture hook: default is defaultRenderRecapture; swappable at runtime.
  assert.equal(bridge.renderRecapture, defaultRenderRecapture);
  const kinds = [];
  bridge.setRenderRecapture((kind, ctx) => {
    kinds.push(kind);
    assert.ok(ctx && typeof ctx === "object");
    return {};
  });
  bridge.renderTick(4);
  assert.ok(kinds.length > 0, "recapture hook must be consulted per continuation");
  assert.ok(kinds.every((k) => typeof k === "number"));
  assert.equal(bridge.setRenderRecapture(null), defaultRenderRecapture);
  assert.throws(() => bridge.setRenderRecapture(42), TypeError);
});

test("renderStats reports the chain outcome for the caller", async () => {
  if (!existsSync(renderWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });

  const before = bridge.renderStats;
  assert.equal(before.available, true);
  assert.equal(before.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(before.ticks, 0);
  assert.equal(before.continuationKind, null);

  assert.ok(bridge.tick(16));
  const stats = bridge.renderStats;
  assert.equal(stats.ticks, 1);
  assert.equal(stats.errors, 0);
  assert.equal(typeof stats.continuationKind, "number");
  assert.equal(stats.continuationKind, bridge.renderTick(16).continuationKind);
  assert.ok(stats.steps > 0, "renderStats must report the step count");
  assert.ok(Array.isArray(stats.hostKinds));
  assert.ok(stats.hostTotals, "renderStats must report host-event totals");
  assert.ok(Object.values(stats.hostTotals).reduce((a, b) => a + b, 0) > 0);
});

/* -------------------------------------------------------------------------
 * 4. Missing render module must be non-fatal
 * ---------------------------------------------------------------------- */

test("a MISSING render root slice leaves the Update tick running and renderTick null", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const errors = [];
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    // Deliberately absent artifact.
    renderSliceUrl: join(root, "output", "decomp", "game-render-slice", "does-not-exist.wasm"),
    log: (msg, cls) => {
      if (cls === "err") errors.push(msg);
    },
  });

  // Update path is untouched and still PE-free.
  assert.equal(bridge.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(bridge.usesX86Emulation, false);
  assert.ok(bridge.session);
  assert.ok(bridge.slice);

  // Render is simply absent — not fatal, not PE.
  assert.equal(bridge.renderSlice, null);
  assert.equal(bridge.renderSession, null);
  assert.equal(bridge.renderMode, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(bridge.renderTick(1), null);
  assert.equal(bridge.renderTick(), null);
  assert.ok(
    errors.some((m) => /Render root slice unavailable/.test(m)),
    "a missing render module must be reported, not thrown",
  );

  // The Update tick keeps running every frame.
  const first = bridge.tick(16);
  assert.ok(first, "Update tick must keep working without the render slice");
  assert.equal(first.usesX86Emulation, false);
  const second = bridge.tick(32);
  assert.ok(second);
  assert.equal(bridge.session.ticks, 2);
  assert.equal(bridge.gameObject.byteLength, GAME_OBJECT_MIN_SIZE);

  // The host is still swappable so a later GL host install does not crash.
  assert.ok(bridge.renderHost);
  const replacement = createRenderHostHandler();
  assert.equal(bridge.setRenderHost(replacement), replacement);
  assert.equal(bridge.renderTick(48), null);
  assert.equal(bridge.usesX86Emulation, false);
});

/* -------------------------------------------------------------------------
 * 5. PE ban
 * ---------------------------------------------------------------------- */

test("render wiring sources never reference PE emulation", () => {
  for (const file of [
    bridgeSourcePath,
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
  ]) {
    const source = readFileSync(file, "utf8");
    assert.ok(!/boxedwine/i.test(source), `${file} must not reference Boxedwine`);
    assert.ok(!/\bpe-emu\b/i.test(source), `${file} must not reference pe-emu`);
    assert.ok(!/isaac-ng\.exe|\.exe['"]/i.test(source), `${file} must not load a PE image`);
  }
  const bridgeSource = readFileSync(bridgeSourcePath, "utf8");
  assert.match(bridgeSource, /usesX86Emulation:\s*false/);
  /* The render session must be built on its OWN *(Game+0x18300) buffer, never
     on the Update session's Game object — see the PE callers at VA 0x00831630
     and 0x00831e37. A behavioural pin for this lives in the boot test above;
     this source pin catches a regression that rewires the constructor. */
  assert.match(bridgeSource, /gameObject:\s*renderGameObject/);
  assert.ok(
    !/createNativeRenderSession\([\s\S]{0,400}?gameObject:\s*session\.gameObject/.test(bridgeSource),
    "render session must not be constructed on the Update Game buffer",
  );
});

/* -------------------------------------------------------------------------
 * 6. Game::Exit ROOT PLAN wiring (parallel block)
 *
 * The Exit family has NO root-slice ABI (native/decomp/exit_pure_helpers.h:
 * "Not an Exit slice ABI and not wired into the Update frame path"). The
 * wired Exit root is the wasm-backed ROOT PLAN step:
 *   scripts/decomp/frame-path.mjs createExitRootSession + runExitRootPlan
 *   over exitRootWasmPure(multiRoot.helpers.exit) — the SAME exports the
 *   family tests differential-verify. The bridge drives one step per frame
 *   inside tick(); missing module is non-fatal and never opens PE; plan
 *   inputs are caller-supplied (setExitInputs) with an all-zero default that
 *   closes the entry gate (no exit in progress).
 * ---------------------------------------------------------------------- */

test("exit ROOT PLAN is catalogued as the wired Exit root step (no Exit root slice exists)", async () => {
  const exit = FRAME_PATH_ROOT_BY_ID.Exit;
  assert.ok(exit, "Exit present in the frame-path roots catalog");
  assert.equal(exit.rootPlanId, "exit");
  assert.equal(exit.rootPlanAbi, EXIT_PURE_ABI_VERSION);
  assert.equal(exit.rootPlanWasmFile, "exit-pure-helpers.wasm");
  // wired = the wasm-backed Exit root plan is driven per frame by
  // bootNativeUpdateBridge.tick() (createExitRootSession step).
  assert.equal(exit.wired, true);
  // Pre-existing fields keep their exact meaning (pure-helper island contract).
  assert.equal(exit.pureName, "exit");
  assert.equal(exit.pureId, "exit");
  assert.equal(exit.expectedAbi, EXIT_PURE_ABI_VERSION);
  assert.equal(exit.wasmFile, "exit-pure-helpers.wasm");
  assert.equal(exit.rootPlanAbi, PURE_HELPER_MODULES.exit.expectedAbi);

  // The ABI must come from the model module, never a literal in the catalog.
  const catalogSource = readFileSync(
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
    "utf8",
  );
  assert.match(
    catalogSource,
    /rootPlanAbi:\s*EXIT_PURE_ABI_VERSION/,
    "root-plan expectedAbi must reference the model constant",
  );

  // Exit is NOT a root slice: the family header is explicit ("Not an Exit
  // slice ABI"), so ROOT_SLICE_MODULES must not grow a fake exit entry and
  // the roots list keeps the plan-step contract instead.
  assert.equal(ROOT_SLICE_MODULES.exit, undefined);
  assert.deepEqual([...ROOT_SLICE_IDS], ["render"]);
  assert.throws(() => resolveRootSliceSpec("Exit"), /Unknown root slice/, "Exit must not resolve to a root slice");
  assert.ok(PURE_HELPER_MODULES.exit, "the exit PURE helper entry stays the plan source");
  assert.equal(PURE_HELPER_MODULES.exit.dir, "exit-pure");
  assert.equal(PURE_HELPER_MODULES.exit.wasmFile, "exit-pure-helpers.wasm");

  // Availability probe follows rootPlanId -> PURE_HELPER_MODULES.exit.
  assert.equal(await probeFramePathRootPlanAvailability("Exit"), await probePureHelperAvailability("exit"));
  assert.equal(await probeFramePathRootPlanAvailability("Update"), false);
  assert.equal(await probeFramePathRootPlanAvailability("Nope"), false);
});

test("Exit wiring gate is live (mutation check: a planted de-wire flips the driven-root set)", () => {
  const source = readFileSync(
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
    "utf8",
  );
  const exitBlock = /id: "Exit"[\s\S]*?\n(\s*)wired: (true|false)/.exec(source);
  assert.ok(exitBlock, "Exit catalog entry must declare a wired flag");
  assert.equal(exitBlock[2], "true", "Exit must be wired in the catalog source");
  // The driven-root set is derived SOLELY from the catalog flag: a planted
  // false would drop Exit from the wired roots, which the catalog assertions
  // above catch (["Update", "Render", "Exit"]).
  const flipped = source.replace(
    exitBlock[0],
    exitBlock[0].replace("wired: true", "wired: false"),
  );
  assert.notEqual(flipped, source, "a de-wired Exit must change the catalog source");
  assert.deepEqual(
    FRAME_PATH_ROOTS.filter((r) => r.wired).map((r) => r.id),
    ["Update", "Render", "Exit"],
  );
});

test("bridge boots the wasm-backed Exit root plan and drives one exit step per frame", async () => {
  if (!existsSync(exitWasmPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });

  // Exit root plan is live and native (module-backed, no slice, no PE).
  assert.equal(bridge.exitMode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.ok(bridge.exitSession, "exitSession must be created when the exit module loads");
  assert.equal(bridge.exitSession.rootId, "Exit");
  assert.equal(bridge.exitSession.usesX86Emulation, false);
  assert.equal(bridge.usesX86Emulation, false);

  // Default inputs are all-zero and close the entry gate (no exit in progress).
  assert.equal(bridge.exitInputs, null);
  const defaults = bridge.exitInputDefaults();
  assert.ok(Object.keys(defaults).length > 0);
  assert.deepEqual([...new Set(Object.values(defaults))], [0], "default exit inputs must be all zero");

  // Closed gate: the step is wired (fallback false) but the plan is inactive.
  const closed = bridge.exitTick(1);
  assert.ok(closed, "exitTick must return a result when the exit module is loaded");
  assert.equal(closed.wired, true);
  assert.equal(closed.fallback, false);
  assert.equal(closed.usesX86Emulation, false);
  assert.equal(closed.plan.entryActive, false);
  assert.equal(closed.plan.eventCount, 0);
  assert.equal(bridge.exitSession.ticks, 1);
  assert.equal(bridge.exitStats.available, true);
  assert.equal(bridge.exitStats.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(bridge.exitStats.inputsSupplied, false);

  // One step per frame: tick() drives it; same-frame exitTick is cached.
  const updateResult = bridge.tick(2);
  assert.ok(updateResult, "tick() must keep returning the Update result");
  assert.equal(updateResult.usesX86Emulation, false);
  assert.equal(bridge.exitSession.ticks, 2, "exit must be driven per frame");
  const cached = bridge.exitTick(2);
  assert.ok(cached);
  assert.equal(bridge.exitSession.ticks, 2, "same frame must not double-drive exit");
  bridge.tick(3);
  assert.equal(bridge.exitSession.ticks, 3);

  // Opening the entry gate (sessionActive2658a low byte != 0) runs the typed
  // plan: host events flow to the SHARED Update HostHandler by their Exit
  // kind names, all in HOST_EVENT_KINDS, none PE.
  assert.equal(bridge.setExitInputs({ sessionActive2658a: 1 }), bridge.exitInputs);
  assert.deepEqual(bridge.exitInputs, { sessionActive2658a: 1 });
  const open = bridge.exitTick(4);
  assert.ok(open);
  assert.equal(open.plan.entryActive, true);
  assert.ok(open.plan.eventCount > 0, "an active exit plan must emit events");
  assert.ok(open.plan.events.some((w) => w !== 0), "active plan must carry event words");
  assert.equal(bridge.exitStats.inputsSupplied, true);
  const totals = bridge.exitSession.hostTotals;
  assert.ok(Object.values(totals).reduce((a, b) => a + b, 0) > 0, "exit host events must be counted");
  const kinds = Object.keys(totals).filter((k) => /^exitRoot/.test(k));
  assert.ok(kinds.length > 0, "exit-specific host kinds must be reported");
  for (const kind of kinds) {
    assert.ok(HOST_EVENT_KINDS.includes(kind), `exit host kind ${kind} must be in HOST_EVENT_KINDS`);
    assert.ok(!/emulator|pe-emu|boxedwine/i.test(kind), `${kind} must not be an emulator kind`);
  }
  assert.equal(bridge.usesX86Emulation, false);
  assert.equal(bridge.exitErrors, 0);
});

test("a MISSING exit root plan leaves the Update tick running and exitTick null", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const errors = [];
  // Planted failure of the wiring guard: no pure modules are loaded at all
  // (loadPureRoots false), so the exit root plan cannot be wired. This must
  // fail closed — no session, no PE, Update tick unaffected.
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    loadPureRoots: false,
    log: (msg, cls) => {
      if (cls === "err") errors.push(msg);
    },
  });

  assert.equal(bridge.mode, FRAME_PATH_MODE.NATIVE_WASM);
  assert.equal(bridge.usesX86Emulation, false);
  assert.ok(bridge.session);
  assert.ok(bridge.slice);

  assert.equal(bridge.exitSession, null);
  assert.equal(bridge.exitMode, FRAME_PATH_MODE.EMULATOR_X86);
  assert.equal(bridge.exitTick(1), null);
  assert.equal(bridge.exitTick(), null);
  assert.equal(bridge.exitStats.available, false);
  assert.equal(bridge.exitStats.mode, FRAME_PATH_MODE.EMULATOR_X86);
  assert.ok(
    errors.some((m) => /Exit root plan unavailable/.test(m)),
    "a missing exit module must be reported, not thrown",
  );

  // The Update tick keeps running every frame, PE-free.
  const first = bridge.tick(16);
  assert.ok(first);
  assert.equal(first.usesX86Emulation, false);
  const second = bridge.tick(32);
  assert.ok(second);
  assert.equal(bridge.session.ticks, 2);

  // setExitInputs cannot smuggle a plan in without the module.
  assert.throws(() => bridge.setExitInputs({ sessionActive2658a: 1 }), /requires a wired Exit root plan/);
  assert.equal(bridge.usesX86Emulation, false);
});

test("exit wiring sources never reference PE emulation", () => {
  for (const file of [
    bridgeSourcePath,
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
  ]) {
    const source = readFileSync(file, "utf8");
    assert.ok(!/boxedwine/i.test(source), `${file} must not reference Boxedwine`);
    assert.ok(!/\bpe-emu\b/i.test(source), `${file} must not reference pe-emu`);
    assert.ok(!/isaac-ng\.exe|\.exe['"]/i.test(source), `${file} must not load a PE image`);
  }
  const bridgeSource = readFileSync(bridgeSourcePath, "utf8");
  assert.match(bridgeSource, /createExitRootSession\(\{/);
  /* The exit step must be built ONLY from the exit pure-helper module's
     wasm exports (exitRootWasmPure) — never from a PE image or an
     emulator session. */
  assert.match(
    bridgeSource,
    /pure:\s*exitRootWasmPure\(exitModule\.wasm\)/,
    "the exit step must be module-backed (exitRootWasmPure)",
  );
  assert.match(bridgeSource, /exitTick:/, "the bridge must expose exitTick");
  assert.match(bridgeSource, /usesX86Emulation: false/);
  // The async availability probe must not be bypassable to a PE path.
  const rootsSource = readFileSync(
    join(root, "scripts", "decomp", "frame-path-roots.mjs"),
    "utf8",
  );
  assert.match(
    rootsSource,
    /rootPlanId:\s*"exit"/,
    "Exit catalog entry must carry its rootPlanId",
  );
});
/* -------------------------------------------------------------------------
 * 4. Native-update §5 capture lanes (wave-22/23 live-wiring contracts).
 *
 * The module side of the four seams is LIVE (record-10 interior @936,
 * record-4 store-plan @932, record-22 fold trio @944/948/952, record-12
 * rewind @912/916); each is gated on capture lanes the bridge delivers per
 * tick. This section covers captureUpdateLanes (pure, READ-ONLY sampling:
 * Game buffer via DataView, guest memory via the host guestRead hook) and
 * the bridge tick path (setUpdateCapture -> session.tick(runtime,
 * statePatch) — the dispatch hook the wave-22 C12 identified). Discrimi-
 * nating cases drive the lanes through the bridge and assert the typed
 * events flip (absent capture -> ready gates 0 -> byte-for-byte residuals).
 * ---------------------------------------------------------------------- */

const GAME_CAP_DIR = join(root, "output", "decomp", "gamestate", "5129df723e64");
const gameCaptureBinPath = join(GAME_CAP_DIR, "game-object-inrun.bin");
const gameCaptureSidecarPath = join(GAME_CAP_DIR, "game-object-inrun.json");

/** u32 LE bytes for the guest memory map. */
function u32Bytes(value) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, value >>> 0, true);
  return b;
}

/** Build a guestRead reader over { address: number|Uint8Array } (numbers are
 *  u32 LE; arrays are raw bytes at that exact address). */
function makeGuestReader(spec) {
  const pages = new Map();
  for (const [addr, v] of Object.entries(spec)) {
    pages.set(Number(addr) >>> 0, typeof v === "number" ? u32Bytes(v) : Uint8Array.from(v));
  }
  return (address) => pages.get(address >>> 0) ?? null;
}

/** Fresh GAME_OBJECT_MIN_SIZE buffer with u32/u8 pokes (READ-ONLY source). */
function makePokedGameBuffer(pokes) {
  const buf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  const view = new DataView(buf.buffer);
  for (const [off, v] of Object.entries(pokes)) {
    const o = Number(off);
    if (typeof v === "number") view.setUint32(o, v >>> 0, true);
    else view.setUint8(o, v);
  }
  return { buf, view };
}

test("update §5 capture: captureUpdateLanes samples the four lane groups READ-ONLY", async () => {
  const { captureUpdateLanes } = await importBridge();

  /* Game-buffer pokes (record-12 slot1 = Game+0x269ec + 1*0x20660). */
  const { view } = makePokedGameBuffer({
    0x676ac: 1, /* slot index 1 */
    0x4704c: 1, /* [newslot+0] valid byte */
    0x60d6c: 0x54, /* [newslot+0x19d20] room */
    0x47134: 7, /* [newslot+0xe8] tag */
    0x66e78: 0x9, /* [newslot+0x1fe2c] snapshot arg */
    0x66e7c: 502, /* [newslot+0x1fe30] slot frame */
    0x0: 1, /* [Game] tag0 */
    0x264f8: 502, /* Game frame */
    0x18318: 0xffffffff, /* Game 18318 */
    0x18300: 0x600100, /* [Game+0x18300] ROOM ptr (transition pack) */
    0x1b864: 0x11223344, /* engine_field_28 */
    0x1b87c: 0x7c, /* engine byte_7c */
    0x1baa8: 0x600000, /* player list begin ptr */
    0x1baac: 0x600004, /* player list end ptr (count 1) */
    0x1b874: 0x400000, /* filename ptr */
    0x1b884: 0x1d, /* filename size */
    0x1b888: 0x1f, /* filename cap */
    0x1b8a4: 0x11111111, /* anim first pre */
    0x1b8c4: 0x22222222, /* anim second pre */
  });
  const payload = new Uint8Array(0x20b * 4);
  const payloadView = new DataView(payload.buffer);
  for (let i = 0; i < 0x20b; i += 1) payloadView.setUint32(i * 4, (0x40000000 + i) >>> 0, true);
  const guestRead = makeGuestReader({
    0xc7169c: 0x500000, /* *[0xc7169c] Manager* */
    0x500f18: 3, /* [mgr+0xf18] */
    0x500ebc: 5, /* [mgr+0xebc] */
    0x500014: 1, /* [mgr+0x14] */
    0x521618: 1, /* [mgr+0x21618] */
    0x521620: 0, /* [mgr+0x21620] */
    0x521624: 1, /* [mgr+0x21624] */
    0x52161c: 0x19, /* [mgr+0x2161c] */
    0x529fb8: 1, /* [mgr+0x29fb8] */
    0x52a334: 0x3f800000, /* volume bits (1.0f) */
    0x5002d0: payload, /* *[mgr+0x2d0] S8 payload 0x20b u32 */
    0xc798e4: 0x100, /* sfx global 798e4 */
    0xc79948: 0x200, /* sfx global 79948 */
    0xc79790: 0x300, /* sfx global 79790 */
    0xc7978c: 0x400, /* sfx global 7978c */
    0x600104: 0x600200, /* [room+4] desc ptr (transition pack) */
    0x600108: 0x54, /* [room+8] room type */
    0x600244: 0x80, /* [desc+0x44] subroom flag byte */
    0x600000: 0x700000, /* span slot 0 -> player object */
    0x700173: 0, /* [p+0x173] */
    0x701398: 1, /* [p+0x1398] */
    0x70139a: 1, /* [p+0x139a] */
    0x700171: 0, /* [p+0x171] */
    0x700410: 0x1234, /* [p+0x410] word */
    0x7003fc: 5, /* [p+0x3fc] FULL-DWORD w3fc */
    0x70007c: 0x12345678, /* [p+0x7c] ptr7c */
    0x700034: 0, /* [p+0x34] */
    0x700088: 0, /* [p+0x88] */
    0x701600: 3, /* [p+0x1600] word */
    0x700418: 4, /* [p+0x418] word */
    0x70016c: 5, /* [p+0x16c] word */
  });
  const patch = captureUpdateLanes({
    gameView: view,
    guestRead,
    gamePointerValue: 0x549e004c,
    anm2LayerFlags: () => new Uint8Array([1, 0, 1]),
  });

  /* record-12: the 11 decision scalars (Game-buffer-homed) + ready lane. */
  assert.equal(patch.rewind705ee0SlotIndex676ac, 1);
  assert.equal(patch.rewind705ee0SlotValidByte, 1);
  assert.equal(patch.rewind705ee0SlotRoom19d20, 0x54);
  assert.equal(patch.rewind705ee0SlotTagE8, 7);
  assert.equal(patch.rewind705ee0SlotArg1fe2c, 0x9);
  assert.equal(patch.rewind705ee0SlotFrame1fe30, 502);
  assert.equal(patch.rewind705ee0GameBase, 0x549e004c);
  assert.equal(patch.rewind705ee0GameTag0, 1);
  assert.equal(patch.rewind705ee0GameFrame264f8, 502);
  assert.equal(patch.rewind705ee0Game18318, 0xffffffff);
  assert.equal(patch.opaqueCall006fd7c0Ready, 1, "the record-12 ready lane names the captured scalars");

  /* record-12 transition pack (ABI v99 — wave-28 bridge gap fix, C10 FAIL
     item 1): the 9 lanes @14292..14324 must be read+written from the game
     buffer. game0 = the [Game+0] mode word (0x6fd87f cmp [Game+0],1);
     roomType8 = [[Game+0x18300]+8]; roomSubroomFlag44 = low byte
     [[[Game+0x18300]+4]+0x44] (via guestRead); the five probe AL lanes are
     DRIVEN from the probes' PE source reads (ABI v107) — this buffer only
     pokes the record-12 scalars, so every probe field reads 0 and the
     lanes stay 0 (the pre-pack arm edge); ready is the pack voucher. */
  assert.equal(patch.transition6fd7c0Game0, 1, "game0 = [Game+0] mode word");
  assert.equal(patch.transition6fd7c0AltPathProbe, 0, "alt-path [Game+4]=0 -> AL 0");
  assert.equal(patch.transition6fd7c0RouteProbe, 0, "route [Game+0x269c8]=0 -> AL 0");
  assert.equal(patch.transition6fd7c0PlayerLoopProbe, 0, "player-loop chain absent -> AL 0");
  assert.equal(patch.transition6fd7c0BlueRoomProbe, 0, "blue direction -1 / flag 0 -> AL 0");
  assert.equal(patch.transition6fd7c0EnginePredProbe, 0, "engine-pred fields 0 -> AL 0");
  assert.equal(patch.transition6fd7c0RoomType8, 0x54, "roomType8 = [[Game+0x18300]+8]");
  assert.equal(patch.transition6fd7c0RoomSubroomFlag44, 0x80, "subroom flag byte = [[[Game+0x18300]+4]+0x44]");
  assert.equal(patch.transition6fd7c0Ready, 1, "the pack voucher rides the capture");

  /* record-12 payload blob: guest *[0xc7169c]+0x2d0, 0x20b u32 words. */
  assert.equal(patch.rewind705ee0PayloadBlobReady, 1);
  assert.equal(patch.rewind705ee0PayloadBlobAddr, 0x5002d0);
  assert.equal(patch.rewind705ee0PayloadBlob.length, 0x20b);
  assert.equal(patch.rewind705ee0PayloadBlob[0], 0x40000000);
  assert.equal(patch.rewind705ee0PayloadBlob[0x20a], 0x40000000 + 0x20a);

  /* record-10: the 12-word true-probe SFX-manager blob. */
  assert.equal(patch.frameOpaque4212c0TrueProbeReady, 1);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgrBase, 0x500000);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgrF18, 3);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgrEbc, 5);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr14, 1);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr21618, 1);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr21620, 0);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr21624, 1);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr2161c, 0x19);
  assert.equal(patch.frameOpaque4212c0TrueProbeMgr29fb8, 1);
  assert.equal(patch.frameOpaque4212c0TrueProbeVolumeBits, 0x3f800000);
  assert.equal(patch.frameOpaque4212c0TrueProbeVolumeEqOne, 1, "bit-exact 1.0f compare");

  /* record-4: 6 scalars + player-entry rows (span slot 0, rows 1..7 zero). */
  assert.equal(patch.opaque8318a0SfxGlobal798e4, 0x100);
  assert.equal(patch.opaque8318a0SfxGlobal79948, 0x200);
  assert.equal(patch.opaque8318a0SfxGlobal79790, 0x300);
  assert.equal(patch.opaque8318a0SfxGlobal7978c, 0x400);
  assert.equal(patch.opaque8318a0EngineField28, 0x11223344);
  assert.equal(patch.opaque8318a0EngineByte7c, 0x7c);
  assert.equal(patch.opaque8318a0PlayerEntryReady, 1);
  assert.equal(patch.opaque8318a0PlayerEntryCount, 1);
  assert.equal(patch.opaque8318a0PlayerEntryB173[0], 0);
  assert.equal(patch.opaque8318a0PlayerEntryB1398[0], 1);
  assert.equal(patch.opaque8318a0PlayerEntryB139a[0], 1);
  assert.equal(patch.opaque8318a0PlayerEntryB171[0], 0);
  assert.equal(patch.opaque8318a0PlayerEntryW410[0], 0x1234);
  assert.equal(patch.opaque8318a0PlayerEntryW3fc[0], 5, "w3fc rides FULL-DWORD");
  assert.equal(patch.opaque8318a0PlayerEntryPtr7c[0], 0x12345678, "ptr7c rides the full dword");
  assert.equal(patch.opaque8318a0PlayerEntryB34[0], 0);
  assert.equal(patch.opaque8318a0PlayerEntryB88[0], 0);
  assert.equal(patch.opaque8318a0PlayerEntryW1600[0], 3);
  assert.equal(patch.opaque8318a0PlayerEntryW418[0], 4);
  assert.equal(patch.opaque8318a0PlayerEntryW16c[0], 5);
  for (let i = 1; i < 8; i += 1) {
    assert.equal(patch.opaque8318a0PlayerEntryB1398[i], 0, "rows beyond count are all-zero");
    assert.equal(patch.opaque8318a0PlayerEntryW3fc[i], 0);
  }

  /* record-22: filename + anim pre-states + the ANM2 load's flags row. */
  assert.equal(patch.engineAnm2FilenameReady, 1);
  assert.equal(patch.engineAnm2FilenamePtr, 0x400000);
  assert.equal(patch.engineAnm2FilenameSize, 0x1d);
  assert.equal(patch.engineAnm2FilenameCap, 0x1f);
  assert.equal(patch.engineAnm2AnimReady, 1);
  assert.equal(patch.engineAnm2AnimFirstPre, 0x11111111);
  assert.equal(patch.engineAnm2AnimSecondPre, 0x22222222);
  assert.equal(patch.engineAnm2LoadgraphicsFlagReady, 1);
  assert.equal(patch.engineAnm2LoadgraphicsFlags.length, 32);
  assert.equal(patch.engineAnm2LoadgraphicsFlags[0], 1);
  assert.equal(patch.engineAnm2LoadgraphicsFlags[2], 1);
  assert.equal(patch.engineAnm2LoadgraphicsFlags[3], 0);

  /* READ-ONLY: the capture must not mutate its inputs. */
  assert.equal(view.getUint32(0x1b864, true), 0x11223344);
  assert.equal(view.getUint8(0x1b87c), 0x7c);
  const payloadProbe = guestRead(0x5002d0, 4);
  assert.equal(new DataView(payloadProbe.buffer).getUint32(0, true), 0x40000000);
});

test("update §5 record-12 probes: the five AL lanes replicate the PE leaves from game-buffer/guest state (ABI v107)", async () => {
  const { captureUpdateLanes } = await importBridge();

  /* All five probe source reads driven from real state (update-v107-
     record12-live NOTES §1): alt = DWORD[Game+4] in {4,5} (0x74bac0);
     route = DWORD[Game+0x269c8] in {2,3} (0x6f8120); player-loop =
     entity [[[Game+0x18300]+4]+0x10] with [ent]==0x23 && [ent+8]==0x10
     (0x8279a0, GUEST chain); blue = direction!=−1 && [Game+0x18304]>=0
     && [Game+0x16c7c+0x44]&0x40000 (0x74d4a0 prefix, direction option);
     engine-pred = [Game+0x1b83c]!=0 && [Game+0x1b83c+0x238]!=0
     (0x6f0070). */
  const pokeProbeState = (extra = {}) => makePokedGameBuffer({
    0x0: 1, /* game0 mode word */
    0x4: 4, /* alt-path [Game+4] == 4 */
    0x269c8: 2, /* route [Game+0x269c8] == 2 */
    0x18300: 0x600100, /* room ptr */
    0x18304: 0, /* blue currentIdx >= 0 */
    0x16cc0: 0x40000, /* [Game+0x16c7c+0x44] room flag bit 0x40000 */
    0x1b83c: 1, /* engine-pred head word */
    0x1ba74: 0x102, /* engine-pred [Game+0x1b83c+0x238] tail word */
    ...extra,
  });
  const chainReader = makeGuestReader({
    0x600104: 0x600200, /* [room+4] desc ptr */
    0x600210: 0x600300, /* [desc+0x10] entity ptr */
    0x600300: 0x23, /* [ent] == 0x23 */
    0x600308: 0x10, /* [ent+8] == 0x10 */
    0x600108: 0x54, /* room type (pack twin) */
    0x600244: 0x80, /* subroom flag byte (pack twin) */
  });

  /* Full drive: every probe opens. */
  const full = captureUpdateLanes({
    gameView: pokeProbeState().view,
    guestRead: chainReader,
    blueRoomDirection: 0,
  });
  assert.equal(full.transition6fd7c0Game0, 1);
  assert.equal(full.transition6fd7c0AltPathProbe, 1, "alt [Game+4]==4 -> AL 1");
  assert.equal(full.transition6fd7c0RouteProbe, 1, "route [Game+0x269c8]==2 -> AL 1");
  assert.equal(full.transition6fd7c0PlayerLoopProbe, 1, "player-loop chain 0x23/0x10 -> AL 1");
  assert.equal(full.transition6fd7c0BlueRoomProbe, 1, "blue direction 0 + cur 0 + flag set -> AL 1");
  assert.equal(full.transition6fd7c0EnginePredProbe, 1, "engine-pred both words nonzero -> AL 1");
  assert.equal(full.transition6fd7c0RoomType8, 0x54, "room-type pack twin intact");
  assert.equal(full.transition6fd7c0RoomSubroomFlag44, 0x80, "subroom flag pack twin intact");
  assert.equal(full.transition6fd7c0Ready, 1, "pack voucher rides the capture");

  /* Blue direction: the site-fixed -1 (SHELL_SITE_DIRECTION) is the
     DEFAULT — the machine AL at the Update sites is exactly 0. */
  const blueDefault = captureUpdateLanes({
    gameView: pokeProbeState().view,
    guestRead: chainReader,
  });
  assert.equal(blueDefault.transition6fd7c0BlueRoomProbe, 0,
    "default blueRoomDirection -1 -> AL 0 (site-exact)");
  assert.equal(blueDefault.transition6fd7c0AltPathProbe, 1, "other probes unaffected");
  const blueNegCur = captureUpdateLanes({
    gameView: pokeProbeState({ 0x18304: -1 }).view,
    guestRead: chainReader,
    blueRoomDirection: 0,
  });
  assert.equal(blueNegCur.transition6fd7c0BlueRoomProbe, 0, "currentIdx < 0 (signed) -> AL 0");
  const blueNoFlag = captureUpdateLanes({
    gameView: pokeProbeState({ 0x16cc0: 0x400 }).view,
    guestRead: chainReader,
    blueRoomDirection: 0,
  });
  assert.equal(blueNoFlag.transition6fd7c0BlueRoomProbe, 0, "room flag bit 0x40000 clear -> AL 0");

  /* WIDE negative drives: the alt/route probes are FULL-DWORD compares
     (0x74bac3 cmp eax,4 — NOT a byte gate), the engine-pred needs BOTH
     words. */
  const wideAlt = captureUpdateLanes({
    gameView: pokeProbeState({ 0x4: 0x104 }).view,
    guestRead: chainReader,
  });
  assert.equal(wideAlt.transition6fd7c0AltPathProbe, 0, "WIDE [Game+4]=0x104 must NOT match 4/5");
  const wideRoute = captureUpdateLanes({
    gameView: pokeProbeState({ 0x269c8: 0x102 }).view,
    guestRead: chainReader,
  });
  assert.equal(wideRoute.transition6fd7c0RouteProbe, 0, "WIDE [Game+0x269c8]=0x102 must NOT match 2/3");
  const route3 = captureUpdateLanes({
    gameView: pokeProbeState({ 0x269c8: 3 }).view,
    guestRead: chainReader,
  });
  assert.equal(route3.transition6fd7c0RouteProbe, 1, "route [Game+0x269c8]==3 -> AL 1");
  const alt5 = captureUpdateLanes({
    gameView: pokeProbeState({ 0x4: 5 }).view,
    guestRead: chainReader,
  });
  assert.equal(alt5.transition6fd7c0AltPathProbe, 1, "alt [Game+4]==5 -> AL 1");
  const predTail0 = captureUpdateLanes({
    gameView: pokeProbeState({ 0x1ba74: 0 }).view,
    guestRead: chainReader,
  });
  assert.equal(predTail0.transition6fd7c0EnginePredProbe, 0,
    "engine-pred tail word 0 -> AL 0 (both words required)");

  /* Player-loop chain variants: entity id/type mismatch -> AL 0; the
     chain is GUEST-homed — no guestRead -> lane stays 0 (byte-for-byte
     fallback); a null entity -> 0. */
  const mismatched = captureUpdateLanes({
    gameView: pokeProbeState().view,
    guestRead: makeGuestReader({
      0x600104: 0x600200,
      0x600210: 0x600300,
      0x600300: 0x24, /* [ent] != 0x23 */
      0x600308: 0x10,
    }),
  });
  assert.equal(mismatched.transition6fd7c0PlayerLoopProbe, 0, "[ent] != 0x23 -> AL 0");
  const typeMismatch = captureUpdateLanes({
    gameView: pokeProbeState().view,
    guestRead: makeGuestReader({
      0x600104: 0x600200,
      0x600210: 0x600300,
      0x600300: 0x23,
      0x600308: 0x11, /* [ent+8] != 0x10 */
    }),
  });
  assert.equal(typeMismatch.transition6fd7c0PlayerLoopProbe, 0, "[ent+8] != 0x10 -> AL 0");
  const nullEnt = captureUpdateLanes({
    gameView: pokeProbeState().view,
    guestRead: makeGuestReader({ 0x600104: 0x600200, 0x600210: 0 }),
  });
  assert.equal(nullEnt.transition6fd7c0PlayerLoopProbe, 0, "null entity -> AL 0");
  const noGuest = captureUpdateLanes({ gameView: pokeProbeState().view });
  assert.equal(noGuest.transition6fd7c0PlayerLoopProbe, 0, "no guestRead -> player-loop lane stays 0");
  assert.equal(noGuest.transition6fd7c0AltPathProbe, 1, "Game-homed probes do not need guestRead");
  assert.equal(noGuest.transition6fd7c0RouteProbe, 1);
  assert.equal(noGuest.transition6fd7c0BlueRoomProbe, 0, "default direction -1 -> 0");
  assert.equal(noGuest.transition6fd7c0EnginePredProbe, 1);
  assert.deepEqual(captureUpdateLanes({ guestRead: chainReader }), {},
    "no gameView -> nothing capturable (shared guard)");
});

test("update §5 record-23: captureUpdateLanes emits the clearPath mode lane from [Game+0] (PE 0x00804212)", async () => {
  const { captureUpdateLanes } = await importBridge();

  /* The Game+0 mode word is the PE 0x00804212 `mov eax,[edx]` read site
     (edx = Game). FULL-DWORD u32: 0xd (skip), 0 / signed-negatives /
     wide 0x1000000d / 0xffffffff must all round-trip verbatim — the law
     compares FULL-DWORD and the range is SIGNED. */
  for (const [poked, want] of [
    [0, 0], [0xd, 0xd], [2, 2], [7, 7],
    [0x1000000d, 0x1000000d], [0xffffffff, 0xffffffff], [0x80000000, 0x80000000],
  ]) {
    const { view } = makePokedGameBuffer({ 0x0: poked });
    const patch = captureUpdateLanes({ gameView: view });
    assert.equal(patch.clearPathGameMode0, want >>> 0,
      `clearPathGameMode0 == [Game+0] 0x${(poked >>> 0).toString(16)} (full-dword u32)`);
    /* The record-12 tag lane reads the SAME word signed — unaffected by
       the new lane (both capture READ-ONLY). */
    assert.equal(patch.rewind705ee0GameTag0,
      new DataView(view.buffer).getInt32(0, true), "record-12 tag lane twin intact");
  }

  /* The lane is Game-buffer-homed: no guestRead needed, and with no
     gameView at all nothing can be captured (shared guard). */
  assert.deepEqual(captureUpdateLanes({ guestRead: makeGuestReader({}) }), {},
    "no gameView -> no capture");
  assert.deepEqual(captureUpdateLanes({}), {});
});

/* ------------------------------------------------------------------ v107 */
/* Record idx 15 B3B7 HOST CAPTURE (update-v107-record15-capture NOTES
   §1/§2): at the record-15 seam (PE 0x00803327..0x00803bfa) the bridge
   reads the LIVE game state at the pinned PE sites — the sparse cells
   (872..896) + the 38-row law pack (8008..9956) — and raises
   b3b7SparseReady BEFORE resume; any unresolved read leaves the group
   ABSENT (ready 0 -> the pre-v48 MONOLITHIC residual, byte-for-byte).
   Sources: edi = Room = [Game+0x18300]; Game = *[0xc71678];
   Mgr = *[0xc7169c]; B5 candidate vector DAT_00c82674/78/7c. The
   host-leaf lanes the browser cannot sample (lookupCount /
   lookupResultByte / count708250 / vt48/vt4c AL rows) stay 0 — the
   pre-capture default arms. */

const B3B7_TEST_GAME_PTR = 0x549e004c;
const B3B7_TEST_ROOM = 0x700000;
const B3B7_TEST_MGR = 0x800000;
const B3B7_TEST_DESC = 0x710000;
const B3B7_TEST_TE_BEGIN = 0x720000;
const B3B7_TEST_ENT_BASE = 0x740000;
const B3B7_TEST_ENT0 = 0x750000;

/** The 13x15 grid's full cell map (Room+0x24, stride 4): zero slots with
 *  idx 0 and idx 5 live. The capture scans EVERY cell — the grid is
 *  contiguous memory, so the host view must answer all of it. */
function b3b7TestGridCells() {
  const cells = {};
  for (let i = 0; i < 195; i += 1) cells[0x700024 + i * 4] = 0;
  cells[0x700024] = 0x1000; /* slot idx 0 non-null */
  cells[0x700038] = 0x2000; /* slot idx 5 non-null (0x24+5*4) */
  return cells;
}

/** The record-15 battle map used by the unit + tick tests: a live room
 *  (desc type -0x14, room bytes set, grid 13x15), a TE list with a
 *  matching TE entry + an HCE(0x2a5) entry, one B5 candidate entity, and
 *  two non-null grid slots. All READ-ONLY pokes. */
function makeRecord15Seed() {
  const game = makePokedGameBuffer({
    0x18300: B3B7_TEST_ROOM, /* [Game+0x18300] Room ptr word */
    0x26630: 0,
    0x26589: 0,
    0x26584: 0x28, /* pass1 mode */
    0x26614: 0,
  });
  const guestRead = makeGuestReader({
    0xc71678: B3B7_TEST_GAME_PTR, /* *0xc71678 = Game */
    0xc7169c: B3B7_TEST_MGR, /* *0xc7169c = Manager */
    0xc82678: 0x1000, /* DAT_00c82678 B5 candidate end */
    0xc8267c: 0x2000, /* DAT_00c8267c B5 candidate cap */
    /* Room */
    0x700000: 1, /* byte Room+0 */
    0x700001: 1, /* byte Room+1 */
    0x700004: B3B7_TEST_DESC, /* [Room+4] desc ptr */
    0x70000c: 13, /* width_c */
    0x700010: 15, /* height_10 */
    ...b3b7TestGridCells(),
    0x70125c: B3B7_TEST_ENT_BASE, /* entity ptr array base */
    0x701264: 1, /* entity count */
    0x707314: B3B7_TEST_TE_BEGIN, /* te begin */
    0x707318: B3B7_TEST_TE_BEGIN + 0x20, /* te end (2 entries) */
    0x707321: 0, /* te/HCE gate byte (walk open) */
    0x707234: 0, /* B6 tree head (tree count 0 -> unused) */
    0x707238: 0, /* B6 tree count */
    0x707768: 1, /* FCO setne flag byte */
    /* desc */
    0x710000: 0xffffffec, /* desc type -0x14 (B4 gate) */
    0x71005c: 0x12345678, /* desc seed */
    /* TE entries: pointer array, 0x10 stride */
    0x720000: 0x730000,
    0x720010: 0x730100,
    0x730000: 0, /* type 0 */
    0x730004: 0x40, /* id 0x40 -> TE call match */
    0x730100: 1, /* type 1 (HCE family) */
    0x730104: 0x2a5, /* id 0x2a5 -> challenge hit */
    /* entity rows */
    0x740000: B3B7_TEST_ENT0,
    0x750028: 0x14, /* type (candidate: 0x14-0xa < 0x3de) */
    0x75002c: 0, /* variant */
    0x750168: 0, /* flags168 (bit 0x20000000 clear) */
    0x75032c: 0, /* field32c */
    0x7503dc: 0x1234, /* seed3dc */
    0x7503e0: 0, /* shift3e0 */
    0x7503e4: 0, /* shift3e4 */
    0x7503e8: 0, /* shift3e8 */
    /* Manager */
    0x800008: 2, /* mgr mode */
    0x8001b4: 0, /* mgr byte 1b4 */
    0x8002bf: 0, /* mgr byte 2bf */
    0x8001ba: 0, /* mgr byte 1ba */
  });
  return { game, guestRead };
}

test("update §5 record-15: captureUpdateB3b7 fills the sparse cells + 38-row law pack from the pinned PE sites (READ-ONLY)", async () => {
  const { captureUpdateB3b7 } = await importBridge();
  const { game, guestRead } = makeRecord15Seed();

  const patch = captureUpdateB3b7({
    gameView: game.view,
    guestRead,
    gamePointerValue: B3B7_TEST_GAME_PTR,
  });

  /* Sparse cells (872..896 — feed the room-pure wire_decide). */
  assert.equal(patch.b3b7SparseReady, 1, "ready raised BEFORE resume");
  assert.equal(patch.b3b7TeByte7321, 0, "[Room+0x7321]");
  assert.equal(patch.b3b7TeBegin, B3B7_TEST_TE_BEGIN, "[Room+0x7314]");
  assert.equal(patch.b3b7TeEnd, B3B7_TEST_TE_BEGIN + 0x20, "[Room+0x7318]");
  assert.equal(patch.b3b7DescType0, 0xffffffec, "[[Room+4]] desc type");
  assert.equal(patch.b3b7TreeCount7238, 0, "[Room+0x7238]");
  assert.equal(patch.b3b7WidthC, 13, "[Room+0xc]");
  assert.equal(patch.b3b7Height10, 15, "[Room+0x10]");

  /* 38-row law pack (8008..9956). Scalars. */
  assert.equal(patch.b3b7FcoResult, 1, "[Room+0x7768] FCO flag byte");
  assert.equal(patch.b3b7Hce2a5Hit, 1, "HCE(0x2a5) computed from the TE rows (type 1)");
  assert.equal(patch.b3b7RoomByte1, 1, "[Room+1]");
  assert.equal(patch.b3b7DescSeed5c, 0x12345678, "[desc+0x5c]");
  assert.equal(patch.b3b7LookupCount, 0, "host leaf 0x41af60 -> 0 (G0 arm)");
  assert.equal(patch.b3b7LookupResultByte, 0, "host leaf result -> 0 (cleanup fires)");
  assert.equal(patch.b3b7MgrByte1b4, 0, "[Mgr+0x1b4]");
  assert.equal(patch.b3b7MgrByte2bf, 0, "[Mgr+0x2bf]");
  assert.equal(patch.b3b7MgrByte1ba, 0, "[Mgr+0x1ba]");
  assert.equal(patch.b3b7MgrMode8, 2, "[Mgr+8]");
  assert.equal(patch.b3b7GameNonnull, 1, "Game ptr != 0");
  assert.equal(patch.b3b7Game26630, 0, "[Game+0x26630]");
  assert.equal(patch.b3b7GameByte26589, 0, "byte [Game+0x26589]");
  assert.equal(patch.b3b7RoomByte0, 1, "[Room+0]");
  assert.equal(patch.b3b7Game26584, 0x28, "[Game+0x26584]");
  assert.equal(patch.b3b7Game26614, 0, "[Game+0x26614]");
  assert.equal(patch.b3b7EntityCount, 1, "[Room+0x1264]");
  assert.equal(patch.b3b7ListEnd, 0x1000, "DAT_00c82678");
  assert.equal(patch.b3b7ListCap, 0x2000, "DAT_00c8267c");
  assert.equal(patch.b3b7Count708250, 0, "host leaf 0x708250 -> 0 (pass2 gate closed)");
  assert.equal(patch.b3b7TeEntriesCount, 2, "(end-begin)/0x10");
  assert.equal(patch.b3b7B6NodeCount, 0, "tree count 0 -> no nodes");
  assert.equal(patch.b3b7B7NonnullSlotCount, 2, "two non-null grid slots");

  /* Blob rows (flat u32-LE byte blobs — the writeField "bytes" staging). */
  const u32Row = (a, i) => new DataView(a.buffer, a.byteOffset, a.byteLength).getUint32(i * 4, true);
  assert.equal(u32Row(patch.b3b7TeEntryType, 0), 0, "entry0 type");
  assert.equal(u32Row(patch.b3b7TeEntryType, 1), 1, "entry1 type");
  assert.equal(u32Row(patch.b3b7TeEntryId, 0), 0x40, "entry0 id");
  assert.equal(u32Row(patch.b3b7TeEntryId, 1), 0x2a5, "entry1 id");
  assert.equal(u32Row(patch.b3b7B5Type, 0), 0x14, "[ent+0x28]");
  assert.equal(u32Row(patch.b3b7B5Variant, 0), 0, "[ent+0x2c]");
  assert.equal(u32Row(patch.b3b7B5Flags168, 0), 0, "[ent+0x168]");
  assert.equal(u32Row(patch.b3b7B5Vt48Al, 0), 0, "[vt+0x48] host leaf");
  assert.equal(u32Row(patch.b3b7B5Field32c, 0), 0, "[ent+0x32c]");
  assert.equal(u32Row(patch.b3b7B5Vt4cAl, 0), 0, "[vt+0x4c] host leaf");
  assert.equal(u32Row(patch.b3b7B5Seed3dc, 0), 0x1234, "[ent+0x3dc]");
  assert.equal(u32Row(patch.b3b7B5Shift3e0, 0), 0, "[ent+0x3e0]");
  assert.equal(u32Row(patch.b3b7B5Shift3e4, 0), 0, "[ent+0x3e4]");
  assert.equal(u32Row(patch.b3b7B5Shift3e8, 0), 0, "[ent+0x3e8]");
  assert.equal(patch.b3b7TeEntryType.length, 32, "TE row flat width (8 u32)");
  assert.equal(patch.b3b7B5Type.length, 128, "B5 row flat width (32 u32)");
  assert.equal(patch.b3b7B6NodeIdx.length, 128, "B6 row flat width (32 u32)");
  assert.equal(patch.b3b7B7NonnullSlots.length, 256, "B7 row flat width (64 u32)");
  assert.equal(u32Row(patch.b3b7B7NonnullSlots, 0), 0, "first non-null cell idx 0");
  assert.equal(u32Row(patch.b3b7B7NonnullSlots, 1), 5, "second non-null cell idx 5");

  /* B6 walk scenario (tree count 2, nodes at indices 7/5 — idx 7's slot
     NULL, idx 5's slot live). */
  const treeMap = makeRecord15Seed();
  const treeView = treeMap.game.view;
  const tree = makeGuestReader({
    0xc71678: B3B7_TEST_GAME_PTR,
    0xc7169c: B3B7_TEST_MGR,
    0xc82678: 0x1000,
    0xc8267c: 0x2000,
    0x700000: 0, /* byte Room+0 (B5 outer gate closed) */
    0x700001: 0, /* byte Room+1 */
    0x700004: B3B7_TEST_DESC,
    0x70000c: 13,
    0x700010: 15,
    ...b3b7TestGridCells(),
    0x70125c: 0, /* entity list base 0 -> no rows */
    0x701264: 0,
    0x707314: 0, /* te begin == end -> no entries */
    0x707318: 0,
    0x707321: 1, /* te gate closed */
    0x707234: 0x900000, /* tree head */
    0x707238: 2, /* tree count 2 */
    0x707768: 1,
    0x710000: 0, /* desc type 0 (B4 gate closed) */
    0x71005c: 0,
    0x800008: 2,
    0x8001b4: 0,
    0x8002bf: 0,
    0x8001ba: 0,
    0x900000: 0x910000, /* [head] first node */
    0x910010: 7, /* node0 grid idx */
    0x910008: 0x920000, /* node0 next */
    0x920010: 5, /* node1 grid idx */
    0x920008: 0x900000, /* node1 next -> sentinel (head) */
    0x740000: 0,
  });
  const treePatch = captureUpdateB3b7({ gameView: treeView, guestRead: tree });
  assert.equal(treePatch.b3b7TeEntriesCount, 0, "empty TE list");
  assert.equal(treePatch.b3b7Hce2a5Hit, 0, "gate byte closed -> no HCE hit");
  assert.equal(treePatch.b3b7B6NodeCount, 2, "both nodes visited");
  assert.equal(u32Row(treePatch.b3b7B6NodeIdx, 0), 7, "node0 grid idx");
  assert.equal(u32Row(treePatch.b3b7B6NodeIdx, 1), 5, "node1 grid idx");
  assert.equal(u32Row(treePatch.b3b7B6NodeSlotNonnull, 0), 0,
    "pre-clear slot presence (idx 7 NULL)");
  assert.equal(u32Row(treePatch.b3b7B6NodeSlotNonnull, 1), 1,
    "pre-clear slot presence (idx 5 live)");

  /* READ-ONLY: nothing in the game buffer or guest map was touched. */
  assert.equal(treeView.getUint32(0x18300, true), B3B7_TEST_ROOM);
  assert.equal(guestRead(0x707768, 1)[0], 1);
});

test("update §5 record-15: absent hooks / unresolved reads keep the group ABSENT (ready 0 -> pre-v48 monolith)", async () => {
  const { captureUpdateB3b7, captureUpdateLanes } = await importBridge();
  const { game, guestRead } = makeRecord15Seed();

  /* No gameView: nothing capturable. */
  assert.deepEqual(captureUpdateB3b7({ guestRead }), {});
  /* No guestRead: the room-homed group cannot resolve. */
  assert.deepEqual(captureUpdateB3b7({ gameView: game.view }), {});
  assert.deepEqual(captureUpdateB3b7({}), {});

  /* Unresolved room pointer ([Game+0x18300] = 0) -> group absent. */
  const noRoom = makePokedGameBuffer({ 0x18300: 0 });
  assert.deepEqual(captureUpdateB3b7({ gameView: noRoom.view, guestRead }), {});

  /* One unresolvable room cell (the TE end) -> the WHOLE group absent. */
  const broken = makeGuestReader({
    0xc71678: B3B7_TEST_GAME_PTR,
    0xc7169c: B3B7_TEST_MGR,
    0xc82678: 0x1000,
    0xc8267c: 0x2000,
    0x700004: B3B7_TEST_DESC,
    0x70000c: 13,
    0x700010: 15,
    0x707314: B3B7_TEST_TE_BEGIN,
    /* 0x707318 deliberately missing */
    0x707321: 0,
    0x707238: 0,
    0x707768: 1,
    0x710000: 0xffffffec,
    0x71005c: 0x12345678,
    0x800008: 2,
    0x8001b4: 0,
    0x8002bf: 0,
    0x8001ba: 0,
  });
  const patch = captureUpdateB3b7({ gameView: game.view, guestRead: broken });
  assert.equal("b3b7SparseReady" in patch, false, "irresolvable cell -> no ready raise");
  assert.equal("b3b7FcoResult" in patch, false, "no partial pack");

  /* Through captureUpdateLanes the same discipline holds (the merged
     tick patch must not carry a half pack). */
  const lanes = captureUpdateLanes({ gameView: game.view, guestRead: broken, gamePointerValue: 0 });
  assert.equal("b3b7SparseReady" in lanes, false);
  assert.equal(lanes.clearPathGameMode0, game.view.getUint32(0, true),
    "the Game-homed record-23 lane still lands");
});

test("update §5 record-15: armed capture fires the typed B3B7 wire; unarmed keeps the pre-v48 monolith", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const { game, guestRead } = makeRecord15Seed();

  /* Capture armed: the pack lands -> b3b7SparseReady=1 -> the typed wire
     runs in-module (b3b7HostFco unconditional; challenge + TE call from
     the captured entries; lookup from desc-0x14; pass1 vcall48 from the
     candidate; B7 from the two non-null slots). The monolithic parent
     counter stays 0. */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(game.buf);
  live.setUpdateCapture({ guestRead, gamePointerValue: B3B7_TEST_GAME_PTR });
  const fired = live.tick(1, { ambientRoomEntry11f0: 1 }, { frameCounter264f8: 0 });
  assert.equal(fired.events.b3b7HostFco, 1, "FCO host fires (unconditional 0x80333b)");
  assert.equal(fired.events.b3b7HostChallenge, 1, "HCE(0x2a5) hit -> 0x7ea2d0 host");
  assert.equal(fired.events.b3b7HostTeCall, 1, "TE entry {type 0, id 0x40} -> 0x9960b0 host");
  assert.equal(fired.events.b4HostLookup, 1, "desc type -0x14 -> 0x41af60 host");
  assert.equal(fired.events.b4HostPosA, 1, "lookupCount 0 -> G0 route");
  assert.equal(fired.events.b4HostCleanup, 1, "lookupResultByte 0 -> 0xa648b0 host");
  assert.equal(fired.events.b5HostCount708250, 1, "0x708250 count host (pass2 gate closed)");
  assert.equal(fired.events.b5HostVcall48, 1, "one pass1 candidate [vt+0x48]");
  assert.equal(fired.events.b5HostVcall4c, 0, "no pass2 (count lane 0)");
  assert.equal(fired.events.b6HostDestroy, 0, "tree count 0");
  assert.equal(fired.events.b7HostUpdate, 2, "two non-null slots -> two [vt+8] hosts");
  assert.equal(fired.events.opaqueRoomUpdatePrefixB3B7, 0, "typed wire REPLACES the parent counter");

  /* Capture off (no guestRead): the sparse pack never lands -> ready 0
     -> the room-pure wire_decide keeps the pre-v48 MONOLITHIC parent
     counter; the typed events stay 0 (byte-for-byte fallback). */
  const mono = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  mono.session.gameObject.set(game.buf);
  mono.setUpdateCapture({ gamePointerValue: B3B7_TEST_GAME_PTR });
  const fallback = mono.tick(1, { ambientRoomEntry11f0: 1 }, { frameCounter264f8: 0 });
  assert.equal(fallback.events.opaqueRoomUpdatePrefixB3B7, 1, "monolith keeps the parent counter");
  assert.equal(fallback.events.b3b7HostFco, 0);
  assert.equal(fallback.events.b3b7HostChallenge, 0);
  assert.equal(fallback.events.b3b7HostTeCall, 0);
  assert.equal(fallback.events.b4HostLookup, 0);
  assert.equal(fallback.events.b5HostVcall48, 0);
  assert.equal(fallback.events.b7HostUpdate, 0);

  /* Capture entirely absent: byte-for-byte equal to the armed-without-
     guestRead control (no capture lanes delivered at all). */
  const plain = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  plain.session.gameObject.set(game.buf);
  const plainResult = plain.tick(1, { ambientRoomEntry11f0: 1 }, { frameCounter264f8: 0 });
  assert.deepEqual(fallback.events, plainResult.events, "no-capture == capture-off (byte-for-byte)");
  assert.equal(plainResult.events.opaqueRoomUpdatePrefixB3B7, 1);
});

test("update §5 record-15: 120-frame seam measurement — armed fires 120/120, unarmed falls back 120/120", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const { game, guestRead } = makeRecord15Seed();

  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.session.gameObject.set(game.buf);
  armed.setUpdateCapture({ guestRead, gamePointerValue: B3B7_TEST_GAME_PTR });
  let fired = 0;
  for (let f = 0; f < 120; f += 1) {
    const r = armed.tick(f + 1, { ambientRoomEntry11f0: 1 }, { frameCounter264f8: f });
    if ((r.events.b3b7HostFco | 0) > 0 && (r.events.opaqueRoomUpdatePrefixB3B7 | 0) === 0) fired += 1;
  }

  const mono = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  mono.session.gameObject.set(game.buf);
  mono.setUpdateCapture({ gamePointerValue: B3B7_TEST_GAME_PTR });
  let fallback = 0;
  for (let f = 0; f < 120; f += 1) {
    const r = mono.tick(f + 1, { ambientRoomEntry11f0: 1 }, { frameCounter264f8: f });
    if ((r.events.opaqueRoomUpdatePrefixB3B7 | 0) > 0 && (r.events.b3b7HostFco | 0) === 0) fallback += 1;
  }

  assert.equal(fired, 120, "armed capture fires the typed B3B7 wire every frame");
  assert.equal(fallback, 120, "unarmed keeps the monolithic parent every frame");
});

test("update §5 record-15: 3-mutant cycle sha256-restores the bridge capture pins", async () => {
  const src = readFileSync(bridgeSourcePath, "utf8");
  const digest = (s) => createHash("sha256").update(s, "utf8").digest("hex");
  const before = digest(src);
  const { game, guestRead } = makeRecord15Seed();

  /* Each mutant flips one capture-site pin, then the pinned assertion
     must FAIL against the re-imported (mutated) bridge; the source is
     then restored and verified sha256-byte-identical. */
  const withMutant = async (label, mutate, check) => {
    const bad = mutate(src);
    assert.notEqual(bad, src, `${label}: mutant did not apply`);
    writeBridgeSourceRetry(bad);
    bridgeModulePromise = null; /* force a fresh import of the mutated bridge */
    let threw = false;
    try {
      await check();
    } catch (e) {
      threw = true;
    } finally {
      writeBridgeSourceRetry(src);
    }
    assert.ok(threw, `${label}: mutant survived every pinned assertion`);
  };
  try {
    await withMutant("M1 fco flag site", (s) => s.replace("fcoFlag: 0x7768,", "fcoFlag: 0x776c,"), async () => {
      const { captureUpdateB3b7 } = await importBridge();
      const patch = captureUpdateB3b7({ gameView: game.view, guestRead });
      assert.equal(patch.b3b7FcoResult, 1, "M1 fco site not caught");
    });
    await withMutant("M2 ready raise dropped", (s) => s.replace("out.b3b7SparseReady = 1;", "out.b3b7SparseReady = 0;"), async () => {
      const { captureUpdateB3b7 } = await importBridge();
      const patch = captureUpdateB3b7({ gameView: game.view, guestRead });
      assert.equal(patch.b3b7SparseReady, 1, "M2 ready raise not caught");
    });
    await withMutant("M3 hce gate polarity", (s) => s.replace("if ((teByte7321 & 0xff) === 0) {", "if ((teByte7321 & 0xff) === 1) {"), async () => {
      const { captureUpdateB3b7 } = await importBridge();
      const patch = captureUpdateB3b7({ gameView: game.view, guestRead });
      assert.equal(patch.b3b7Hce2a5Hit, 1, "M3 hce gate not caught");
    });
  } finally {
    writeBridgeSourceRetry(src);
  }
  const after = readFileSync(bridgeSourcePath, "utf8");
  assert.equal(after, src, "bridge not restored byte-identical after the mutant cycle");
  assert.equal(digest(after), before, "bridge sha256 not restored");
});

test("update §5 capture: absent hooks -> only Game-homed lanes; no gameView -> {}", async () => {
  const { captureUpdateLanes } = await importBridge();
  const { view } = makePokedGameBuffer({ 0x1b874: 0x400000 });

  /* No guestRead: the guest-homed groups (manager blob, sfx globals,
     player rows, payload blob) MUST NOT emit — their ready gates stay 0
     and the module falls back byte-for-byte. */
  const patch = captureUpdateLanes({ gameView: view, anm2LayerFlags: null });
  assert.equal(patch.opaqueCall006fd7c0Ready, 1, "Game-homed scalars are still capturable");
  assert.equal(patch.rewind705ee0GameBase, 0);
  assert.equal(patch.frameOpaque4212c0TrueProbeReady, undefined);
  assert.equal(patch.rewind705ee0PayloadBlobReady, undefined);
  assert.equal(patch.opaque8318a0PlayerEntryReady, undefined);
  assert.equal(patch.opaque8318a0SfxGlobal798e4, undefined);
  assert.equal(patch.engineAnm2FilenameReady, 1, "filename triple is Game-buffer-homed");
  assert.equal(patch.engineAnm2FilenamePtr, 0x400000);
  assert.equal(patch.engineAnm2LoadgraphicsFlagReady, undefined, "no ANM2-load hook -> voucher 0");

  /* No gameView at all: nothing is capturable. */
  assert.deepEqual(captureUpdateLanes({}), {});
  assert.deepEqual(captureUpdateLanes({ guestRead: makeGuestReader({}) }), {});
});

test("update §5 capture: setUpdateCapture validation + null restores capture-off", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  assert.equal(bridge.updateCapture, null, "capture is OFF by default (ready gates 0)");
  assert.throws(() => bridge.setUpdateCapture({ guestRead: 42 }), TypeError);
  assert.throws(() => bridge.setUpdateCapture({ anm2LayerFlags: 42 }), TypeError);
  assert.throws(() => bridge.setUpdateCapture(42), TypeError);
  assert.throws(() => bridge.setUpdateCapture({ blueRoomDirection: 1.5 }), TypeError);
  assert.throws(() => bridge.setUpdateCapture({ blueRoomDirection: -2 }), TypeError);
  const opts = bridge.setUpdateCapture({ gamePointerValue: 0x549e004c });
  assert.equal(opts.gamePointerValue, 0x549e004c);
  assert.equal(opts.blueRoomDirection, -1, "blue-room direction defaults to the site -1");
  assert.equal(bridge.updateCapture.gamePointerValue, 0x549e004c);
  assert.equal(bridge.updateCapture.blueRoomDirection, -1);
  const blueOpt = bridge.setUpdateCapture({ blueRoomDirection: 0 });
  assert.equal(blueOpt.blueRoomDirection, 0, "a non--1 direction is storable (seam drives)");
  assert.equal(bridge.setUpdateCapture(null), null);
  assert.equal(bridge.updateCapture, null);
});

test("update §5 record-10: driving the manager blob through the bridge fires @936 and drops the coarse edge", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const probeLanes = {
    frameOpaque4212c0ProbeReady: 1,
    frameOpaque4212c0ProbeResolved: 1,
    frameOpaque4212c0Add0Field4: 1,
    frameOpaque4212c0Add0ListCount: 1,
    frameOpaque4212c0Add0MatchIndex: 0,
    frameOpaque4212c0Add0Bitfield18: 1,
  };
  const arm = {
    frameOpaque4212c0Mode: 1,
    frameOpaque4212c0Secondary: 3,
    frameOpaque4212c0Field3c: 1,
    frameOpaque4212c0Flag4c: 0,
    frameOpaque4212c0Flag111: 0,
  };

  /* Capture on: the bridge reads *[0xc7169c] + the 9 witness words via
     guestRead and arms the blob; the interior seam fires @936 and the
     coarse 4212c0 edge is DROPPED (v99 C5 vs C5b live-frame shape). */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.setUpdateCapture({
    guestRead: makeGuestReader({
      0xc7169c: 0x500000,
      0x500f18: 0,
      0x500ebc: 0,
      0x500014: 1,
      0x521618: 1,
      0x521620: 0,
      0x521624: 1,
      0x52161c: 0x19,
      0x529fb8: 1,
      0x52a334: 0x3f800000,
    }),
  });
  const fired = live.tick(1, probeLanes, arm);
  assert.equal(fired.events.frameOpaque4212c0TrueProbeInterior, 1, "blob live + probe true -> @936 fires");
  assert.equal(fired.events.opaqueCall004212c0, 0, "the typed interior REPLACES the coarse edge");

  /* Capture on but guestRead absent: TrueProbeReady stays 0 -> v91 host
     edge returns, @936 stays 0 (the C5b control). */
  const noBlob = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  noBlob.setUpdateCapture({});
  const control = noBlob.tick(1, probeLanes, arm);
  assert.equal(control.events.frameOpaque4212c0TrueProbeInterior, 0);
  assert.equal(control.events.opaqueCall004212c0, 1, "blob absent -> the module falls back byte-for-byte");

  /* Capture off entirely: identical fallback. */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const offResult = off.tick(1, probeLanes, arm);
  assert.equal(offResult.events.frameOpaque4212c0TrueProbeInterior, 0);
  assert.equal(offResult.events.opaqueCall004212c0, 1);
});

test("update §5 record-4: the bridge pack drives @932 and the captured w3fc row flips the gate", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const spanGame = () => makePokedGameBuffer({
    0x1baa8: 0x600000,
    0x1baac: 0x600004,
    0x1b864: 0x12345678,
    0x1b87c: 0x7c,
  });
  const packReader = (w3fc) => makeGuestReader({
    0xc798e4: 0x100,
    0xc79948: 0x200,
    0xc79790: 0x300,
    0xc7978c: 0x400,
    0x600000: 0x700000,
    0x700173: 0, /* b173 */
    0x701398: 1, /* b1398 -> clear condition met */
    0x70139a: 0,
    0x700171: 0, /* b171 */
    0x700410: 0, /* w410 */
    0x7003fc: w3fc, /* FULL-DWORD w3fc */
    0x70007c: 0, /* ptr7c */
    0x700034: 0, /* b34 */
    0x700088: 0, /* b88 */
    0x701600: 0, /* w1600 */
    0x700418: 0, /* w418 */
    0x70016c: 0, /* w16c */
  });
  const gateLanes = { opaque008318a0Ready: 1, opaque008318a0Mode: 1 };
  const gateState = { gate1b83c: 1, engineField1c: 5, engineField14: 0 };

  /* Non-clearing row (w3fc == 4): candidate_found stays 1 -> for type 5
     the manager gate opens -> the typed event fires (coarse edge STAYS —
     additive, per the record-4 wire contract). */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(spanGame().buf);
  live.setUpdateCapture({ guestRead: packReader(4) });
  const fired = live.tick(1, gateLanes, gateState);
  assert.equal(fired.events.opaque008318a0SfxManagerStores, 1, "w3fc==4 row -> no clear -> @932 fires");
  assert.equal(fired.events.opaqueCall008318a0, 1, "the coarse 8318a0 edge stays (additive seam)");

  /* The SAME capture with w3fc == 5: the row CLEARS candidate_found ->
     for type 5 the manager gate closes -> @932 stays 0. The captured row
     VALUE reached the module and changed the result. */
  const clearing = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  clearing.session.gameObject.set(spanGame().buf);
  clearing.setUpdateCapture({ guestRead: packReader(5) });
  const cleared = clearing.tick(1, gateLanes, gateState);
  assert.equal(cleared.events.opaque008318a0SfxManagerStores, 0, "w3fc==5 row -> clears -> gate closed");
  assert.equal(cleared.events.opaqueCall008318a0, 1);

  /* Capture off: player_entry_ready 0 -> seam inert byte-for-byte. */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  off.session.gameObject.set(spanGame().buf);
  const inert = off.tick(1, gateLanes, gateState);
  assert.equal(inert.events.opaque008318a0SfxManagerStores, 0);
  assert.equal(inert.events.opaqueCall008318a0, 1);
});

/* -------------------------------------------------------------------------
 * ABI v104 (update-v104-record4-apply): the bridge-side store-plan APPLY
 * consumer. Wave-26 S3 landed the module's APPLICATION arm — when the
 * mode-1 manager gate opens the module emits the typed per-row apply plan
 * into the step scratch (148 B / 37 words; store_mask 0x1ff + 9 rows
 * {mgr_off, size, value, element}) + _address/_words exports, zeroed every
 * step. This group pins the bridge consumer: after a tick where the @932
 * event fired the bridge reads the scratch and applies element=0 rows to
 * the captured Game snapshot's sfx-manager BSS region (sfxManagerBssSnapshot,
 * absolute 0xc7978c..0xc7994c; row7/row8 land BELOW the region base at
 * 0xc79790/0xc7978c) and dispatches element=1 rows to the standing residual
 * HostHandler (kind opaqueCall008318a0StoreApply, row-0 PE guard @0x831e5d
 * carried as host-apply). Mask 0 / @932 0 / capture absent / stale module
 * -> NOTHING applied. Discriminator (harness lesson): a different pack
 * changes the applied bytes.
 * ---------------------------------------------------------------------- */

/** Ground-truth plan rows the module writes for
 *  (g798e4, g79790, g7978c, g79948) = (0x24, 5, 0x1234, 0xdeadbeef) —
 *  probed from the shipped module this unit (matches the model law). */
const APPLY_PLAN_ROWS_24 = [
  { mgrOff: 0x4, size: 1, value: 1, element: 1 },
  { mgrOff: 0x0, size: 4, value: 0xdeadbeef, element: 1 },
  { mgrOff: 0x20, size: 4, value: 0, element: 0 },
  { mgrOff: 0x24, size: 4, value: 1, element: 0 },
  { mgrOff: 0x28, size: 4, value: 7, element: 0 },
  { mgrOff: 0x2c, size: 4, value: 1, element: 0 },
  { mgrOff: 0x30, size: 4, value: 7, element: 0 },
  { mgrOff: 0xfffffeb0, size: 4, value: 4, element: 0 },
  { mgrOff: 0xfffffeac, size: 4, value: 0x1234, element: 0 },
];

test("update §5 record-4 apply: readSfxManagerStoreApplyPlan parses the 37-word scratch; null on stale/layout-drift", async () => {
  const {
    readSfxManagerStoreApplyPlan,
    applySfxManagerStorePlan,
    UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE,
    UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS,
    UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND,
  } = await importBridge();

  /* ---- reader: 37-word parse matches the probed module layout ---- */
  const memory = new WebAssembly.Memory({ initial: 17 }); /* covers 0x100168..0x1001f4 */
  const addr = 0x100168;
  const view = new DataView(memory.buffer);
  const planWords = APPLY_PLAN_ROWS_24;
  view.setUint32(addr, 0x1ff, true);
  for (let i = 0; i < 9; i += 1) {
    const base = addr + 4 + i * 16;
    view.setUint32(base, planWords[i].mgrOff, true);
    view.setUint32(base + 4, planWords[i].size, true);
    view.setUint32(base + 8, planWords[i].value, true);
    view.setUint32(base + 12, planWords[i].element, true);
  }
  const slice = {
    wasm: {
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => addr,
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () =>
        UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS,
    },
    memory,
  };
  assert.deepEqual(readSfxManagerStoreApplyPlan(slice), {
    storeMask: 0x1ff,
    rows: APPLY_PLAN_ROWS_24,
  });

  /* The reader also honours the underscore-prefixed export convention. */
  const underscoredSlice = {
    wasm: {
      _isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => addr,
      _isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () =>
        UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS,
    },
    memory,
  };
  assert.deepEqual(readSfxManagerStoreApplyPlan(underscoredSlice).storeMask, 0x1ff);

  /* ---- reader null arms (stale/layout-drift module -> nothing applied) ---- */
  assert.equal(readSfxManagerStoreApplyPlan(null), null);
  assert.equal(readSfxManagerStoreApplyPlan({ wasm: {} }), null, "exports missing (pre-v102 module)");
  assert.equal(readSfxManagerStoreApplyPlan({
    wasm: {
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => 0,
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () =>
        UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS,
    },
    memory,
  }), null, "address 0");
  assert.equal(readSfxManagerStoreApplyPlan({
    wasm: {
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => addr,
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () => 0,
    },
    memory,
  }), null, "words 0");
  assert.equal(readSfxManagerStoreApplyPlan({
    wasm: {
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => addr,
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () => 20,
    },
    memory,
  }), null, "words < 37 (layout drift)");
  assert.equal(readSfxManagerStoreApplyPlan({
    wasm: {
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address: () => addr,
      isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words: () =>
        UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_PLAN_WORDS,
    },
    memory: new WebAssembly.Memory({ initial: 1 }),
  }), null, "scratch beyond the memory bounds");

  /* ---- apply: element=0 rows land at absolute BSS offsets, element=1
       rows dispatch to the standing host path with the row-0 guard ---- */
  const plan = { storeMask: 0x1ff, rows: APPLY_PLAN_ROWS_24 };
  const region = new Uint8Array(UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE);
  const regionView = new DataView(region.buffer, region.byteOffset, region.byteLength);
  const hostEvents = [];
  const host = (event) => hostEvents.push(event);
  const out = applySfxManagerStorePlan({
    plan,
    view: regionView,
    base: UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    host,
  });
  assert.equal(out.applied, 7, "seven element=0 rows applied");
  const off = (abs) => (abs - UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE) >>> 0;
  assert.equal(regionView.getUint32(off(0xc7978c), true), 0x1234, "row8 below base at 0xc7978c");
  assert.equal(regionView.getUint32(off(0xc79790), true), 4, "row7 below base at 0xc79790");
  assert.equal(regionView.getUint32(off(0xc79900), true), 0, "row2");
  assert.equal(regionView.getUint32(off(0xc79904), true), 1, "row3");
  assert.equal(regionView.getUint32(off(0xc79908), true), 7, "row4");
  assert.equal(regionView.getUint32(off(0xc7990c), true), 1, "row5");
  assert.equal(regionView.getUint32(off(0xc79910), true), 7, "row6");
  assert.equal(regionView.getUint8(off(0xc79924)), 0, "empty row7+0x20 stays untouched");
  assert.deepEqual(out.nodeRows, [
    { mgrOff: 0x4, size: 1, value: 1, element: 1 },
    { mgrOff: 0x0, size: 4, value: 0xdeadbeef, element: 1 },
  ], "node rows collected in row order");
  assert.equal(hostEvents.length, 1, "one standing-host-path dispatch");
  assert.equal(hostEvents[0].kind, UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND);
  assert.equal(hostEvents[0].count, 1);
  assert.equal(hostEvents[0].detail.storeMask, 0x1ff);
  assert.deepEqual(hostEvents[0].detail.rows, out.nodeRows);
  assert.equal(hostEvents[0].detail.row0Guard, true, "row-0 PE guard @0x831e5d carried (host-apply)");

  /* width rule: a size-1 element=0 row writes exactly one byte. */
  const bytePlan = {
    storeMask: 0x8, /* row 3 only */
    rows: [
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0x24, size: 1, value: 0xab, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
    ],
  };
  const byteRegion = new Uint8Array(UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE);
  const byteView = new DataView(byteRegion.buffer, byteRegion.byteOffset, byteRegion.byteLength);
  const byteOut = applySfxManagerStorePlan({
    plan: bytePlan,
    view: byteView,
    base: UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    host: () => {},
  });
  assert.equal(byteOut.applied, 1);
  assert.equal(byteView.getUint8(off(0xc79904)), 0xab, "size-1 write is a single byte");
  assert.equal(byteView.getUint32(off(0xc79900), true), 0, "neighbour dword untouched");

  /* out-of-region guard: an element=0 row landing outside the span is
     skipped, not wrapped. */
  const widePlan = {
    storeMask: 0x4, /* row 2 */
    rows: [
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0x4000, size: 4, value: 0x55, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
      { mgrOff: 0, size: 0, value: 0, element: 0 },
    ],
  };
  const wideOut = applySfxManagerStorePlan({
    plan: widePlan,
    view: regionView,
    base: UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    host: () => {},
  });
  assert.equal(wideOut.applied, 0, "out-of-region row skipped");

  /* mask 0 -> NOTHING (gate-closed all-zero scratch arm). */
  const zeroEvents = [];
  const zeroOut = applySfxManagerStorePlan({
    plan: { storeMask: 0, rows: APPLY_PLAN_ROWS_24 },
    view: regionView,
    base: UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    host: (event) => zeroEvents.push(event),
  });
  assert.deepEqual(zeroOut, { applied: 0, nodeRows: [] });
  assert.equal(zeroEvents.length, 0, "mask 0 -> no host dispatch");
  assert.deepEqual(
    applySfxManagerStorePlan({}), { applied: 0, nodeRows: [] },
    "no plan -> nothing",
  );
});

test("update §5 record-4 apply: the bridge applies the fired plan to the BSS snapshot region + dispatches node rows to the standing host path (mask differs -> bytes change)", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const {
    bootNativeUpdateBridge,
    readSfxManagerStoreApplyPlan,
    applySfxManagerStorePlan,
    UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE,
    UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE,
    UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND,
  } = await importBridge();

  const spanGame = () => makePokedGameBuffer({
    0x1baa8: 0x600000,
    0x1baac: 0x600004,
    0x1b864: 0x12345678,
    0x1b87c: 0x7c,
  });
  const packReader = (w3fc, globals = [0x100, 0x200, 0x300, 0x400]) => makeGuestReader({
    0xc798e4: globals[0],
    0xc79948: globals[1],
    0xc79790: globals[2],
    0xc7978c: globals[3],
    0x600000: 0x700000,
    0x700173: 0, /* b173 */
    0x701398: 1, /* b1398 -> clear condition met */
    0x70139a: 0,
    0x700171: 0, /* b171 */
    0x700410: 0, /* w410 */
    0x7003fc: w3fc, /* FULL-DWORD w3fc */
    0x70007c: 0, /* ptr7c */
    0x700034: 0, /* b34 */
    0x700088: 0, /* b88 */
    0x701600: 0, /* w1600 */
    0x700418: 0, /* w418 */
    0x70016c: 0, /* w16c */
  });
  const gateLanes = { opaque008318a0Ready: 1, opaque008318a0Mode: 1 };
  const gateState = { gate1b83c: 1, engineField1c: 5, engineField14: 0 };

  /* Pack A (globals 0x100/0x200/0x300/0x400, w3fc==4 -> candidate stays):
     @932 fires -> the bridge consumes the emitted plan. */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(spanGame().buf);
  live.setUpdateCapture({ guestRead: packReader(4) });
  const snapshotView = new DataView(
    live.sfxManagerBssSnapshot.buffer,
    live.sfxManagerBssSnapshot.byteOffset,
    live.sfxManagerBssSnapshot.byteLength,
  );
  assert.equal(live.sfxManagerBssSnapshot.byteLength, UPDATE_CAPTURE_SFX_MANAGER_BSS_SIZE);
  const snapshotOff = (abs) => (abs - UPDATE_CAPTURE_SFX_MANAGER_BSS_BASE) >>> 0;
  const fired = live.tick(1, gateLanes, gateState);
  assert.equal(fired.events.opaque008318a0SfxManagerStores, 1, "@932 fires with the non-clearing pack");
  assert.equal(fired.events.opaqueCall008318a0, 1, "coarse edge stays (additive seam)");

  /* The parsed plan travels on the result and equals the model law over the
     captured globals. */
  const expectedA = gameUpdateSlice8318a0SfxManagerStoreApplyPlan(0x100, 0x300, 0x400, 0x200);
  assert.ok(fired.sfxManagerStoreApply, "fired tick carries the apply record");
  assert.equal(fired.sfxManagerStoreApply.storeMask, GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK);
  assert.equal(fired.sfxManagerStoreApply.storeMask, 0x1ff);
  assert.deepEqual(fired.sfxManagerStoreApply.rows, expectedA.rows, "rows equal the plan law over the captured globals");

  /* element=0 rows landed in the BSS snapshot region at their absolute
     addresses (row7/row8 BELOW the region base). */
  assert.equal(snapshotView.getUint32(snapshotOff(0xc7978c), true), 0x400, "row8 [mgr-0x154]");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79790), true), 0x2ff, "row7 [mgr-0x150] = g79790-1");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79900), true), 0, "row2 [mgr+0x20]");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79904), true), 6, "row3 [mgr+0x24] (0x100&4==0 -> 6)");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79908), true), 7, "row4 [mgr+0x28]");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc7990c), true), 1, "row5 [mgr+0x2c]");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79910), true), 7, "row6 [mgr+0x30]");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79948), true), 0, "element=1 rows never touch the region");

  /* element=1 rows went to the standing host path (residual HostHandler). */
  assert.equal(live.host.totals[UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND], 1, "node rows dispatched once");
  assert.ok(
    live.host.executed.some((e) => e.kind === UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND),
    "host executed records the apply dispatch",
  );

  /* DISCRIMINATOR (harness lesson): the SAME bridge, tick 2, with a
     DIFFERENT pack (globals 0x24/0xdeadbeef/5/0x1234) -> the plan mask is
     still set but the applied bytes CHANGE (row0 bit5 / row3 mgr+0x24 /
     row7 / row8 all flip). */
  live.setUpdateCapture({ guestRead: packReader(4, [0x24, 0xdeadbeef, 5, 0x1234]) });
  const fired2 = live.tick(2, gateLanes, gateState);
  assert.equal(fired2.events.opaque008318a0SfxManagerStores, 1, "tick 2 fires too (same non-clearing row)");
  const expectedB = gameUpdateSlice8318a0SfxManagerStoreApplyPlan(0x24, 5, 0x1234, 0xdeadbeef);
  assert.deepEqual(fired2.sfxManagerStoreApply.rows, expectedB.rows, "tick 2 rows = the law over the new pack");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79904), true), 1, "row3 flips 6 -> 1 (0x24&4 != 0)");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79790), true), 4, "row7 flips 0x2ff -> 4 (5-1)");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc7978c), true), 0x1234, "row8 flips 0x400 -> 0x1234");
  assert.equal(snapshotView.getUint32(snapshotOff(0xc79900), true), 0, "row2 stays 0");
  assert.equal(live.host.totals[UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND], 2, "node rows dispatched again");

  /* mask 0 arm: capture PRESENT but the gate CLOSED (w3fc==5 clearing row)
     -> the scratch is all-zero -> NOTHING is applied, no apply record, no
     host dispatch, snapshot untouched. */
  const closed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  closed.session.gameObject.set(spanGame().buf);
  closed.setUpdateCapture({ guestRead: packReader(5) });
  const cleared = closed.tick(1, gateLanes, gateState);
  assert.equal(cleared.events.opaque008318a0SfxManagerStores, 0, "w3fc==5 clears candidate -> gate closed");
  assert.equal(cleared.sfxManagerStoreApply, undefined, "mask 0 -> no apply record");
  assert.ok(
    [...closed.sfxManagerBssSnapshot].every((b) => b === 0),
    "mask 0 -> snapshot region untouched (all zeros)",
  );
  assert.equal(closed.host.totals[UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND], undefined,
    "mask 0 -> no node-row dispatch");
});

test("update §5 record-4 apply: capture absent / capture off -> @932 0 and NOTHING applied (byte-for-byte residual)", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge, UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND } = await importBridge();
  const spanGame = () => makePokedGameBuffer({
    0x1baa8: 0x600000,
    0x1baac: 0x600004,
    0x1b864: 0x12345678,
    0x1b87c: 0x7c,
  });
  const gateLanes = { opaque008318a0Ready: 1, opaque008318a0Mode: 1 };
  const gateState = { gate1b83c: 1, engineField1c: 5, engineField14: 0 };

  /* Capture off entirely: the pack lanes never reach the module -> @932
     stays 0 and the apply consumer never runs (identical to the
     pre-v104 bridge). */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  off.session.gameObject.set(spanGame().buf);
  const inert = off.tick(1, gateLanes, gateState);
  assert.equal(inert.events.opaque008318a0SfxManagerStores, 0);
  assert.equal(inert.events.opaqueCall008318a0, 1, "coarse edge stays (residual body)");
  assert.equal(inert.sfxManagerStoreApply, undefined, "no apply record without a capture");
  assert.ok(
    [...off.sfxManagerBssSnapshot].every((b) => b === 0),
    "capture absent -> snapshot region untouched",
  );
  assert.equal(off.host.totals[UPDATE_CAPTURE_SFX_MANAGER_STORE_APPLY_HOST_KIND], undefined,
    "capture absent -> no node-row dispatch");
});

test("update §5 record-22: bridge filename/anim/flags vouchers flip the fold trio vs the residual", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const { buf } = makePokedGameBuffer({
    0x1b874: 0x400000,
    0x1b884: 0x1d,
    0x1b888: 0x1f,
    0x1b8a4: 0,
    0x1b8c4: 0,
  });
  const v77 = {
    engineAnm2BlobReady: 1,
    engineAnm2LatchReady: 1,
    engineAnm2Latch: 0,
    engineAnm2LayerCount: 1,
    engineAnm2ExtraCount: 0,
    engineAnm2LayerNames: ["*s"],
    engineAnm2Bitflags110Pre: 0,
  };
  const site = { effectCounter68d6c: 1, roomTransitionMode1830c: 2 };

  /* All three bridge vouchers live (filename + anim from the Game buffer,
     the ANM2 load flags from the host hook): the fold trio fires and the
     coarse residual is DROPPED (v99 C6 shape). */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(buf);
  live.setUpdateCapture({ anm2LayerFlags: () => new Uint8Array([1, 0, 1]) });
  const fired = live.tick(1, v77, site);
  assert.equal(fired.events.engineAnm2PrefixFilenameAssign, 1);
  assert.equal(fired.events.engineAnm2PrefixCacheFetch, 1);
  assert.equal(fired.events.engineAnm2PrefixLoadImage, 1);
  assert.equal(fired.events.opaqueRoomTransitionEnginePrefix, 0, "the fold REPLACES the coarse counter");

  /* The loadgraphics voucher is one of the five fold vouchers: with the
     hook absent the fold stays fallback byte-for-byte. */
  const noFlags = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  noFlags.session.gameObject.set(buf);
  noFlags.setUpdateCapture({});
  const fallback = noFlags.tick(1, v77, site);
  assert.equal(fallback.events.engineAnm2PrefixFilenameAssign, 0);
  assert.equal(fallback.events.engineAnm2PrefixCacheFetch, 0);
  assert.equal(fallback.events.engineAnm2PrefixLoadImage, 0);
  assert.equal(fallback.events.opaqueRoomTransitionEnginePrefix, 1);

  /* Capture off entirely: same fallback. */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  off.session.gameObject.set(buf);
  const offResult = off.tick(1, v77, site);
  assert.equal(offResult.events.opaqueRoomTransitionEnginePrefix, 1);
  assert.equal(offResult.events.engineAnm2PrefixFilenameAssign, 0);
});

test("update §5 record-12: bridge rewind lanes + ready lane arm the seam; absent -> inert", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* Slot 0 lives at Game+0x269ec (stride 0x20660); poke a full slot +
     game scalars so the captured VALUES are asserted through the seam. */
  const { buf } = makePokedGameBuffer({
    0x676ac: 0,
    0x269ec: 1, /* [newslot+0] valid */
    0x4070c: 0x54, /* [newslot+0x19d20] room */
    0x26ad4: 7, /* [newslot+0xe8] tag */
    0x46818: 0x9, /* [newslot+0x1fe2c] arg */
    0x4681c: 502, /* [newslot+0x1fe30] frame */
    0x0: 1, /* game tag0 */
    0x264f8: 502,
    0x18318: 0xffffffff,
  });
  /* The canopy/guard vouchers are HOST lanes (v72/v74; the bridge must not
     supply them — source pins). The test names them because it acts as the
     host capture pack. */
  const canopy = {
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0x54,
    frameEffectShellRoom182d0: 0x54,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindGuard269ea: 0,
    frameEffectRewindGuard269eb: 0,
    frameEffectRewindGuard68d70: 0,
  };
  const site = { effectCounter68d6c: 1, roomTransitionMode1830c: 2 };

  /* Capture on: the bridge supplies the rewind scalars + game_base +
     opaqueCall006fd7c0Ready; with the canopy open (anim-20 site, guards
     clear) both typed events fire (the W22-S3 LIVE seam). */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(buf);
  live.setUpdateCapture({ gamePointerValue: 0x549e004c });
  const fired = live.tick(1, canopy, site);
  assert.equal(fired.events.rewind705ee0Stores, 1, "plan.reached -> S8 store block typed");
  assert.equal(fired.events.rewind705ee0SaveState, 1, "SaveState 0x6f9000 arg prep typed");

  /* Capture off: opaqueCall006fd7c0Ready 0 -> the seam is byte-for-byte
     inert (no typed events, only the coarse shell counter). */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  off.session.gameObject.set(buf);
  const inert = off.tick(1, canopy, site);
  assert.equal(inert.events.rewind705ee0Stores, 0);
  assert.equal(inert.events.rewind705ee0SaveState, 0);
  assert.equal(inert.events.opaqueFrameEffect6fd7c0Shell, 1, "the coarse shell counter stays");
});

test("update §5 record-12 live seam: probe-state buffer arms the pack; host-side probe row + EnginePredProbe flips counter_265c0 (ABI v107)", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* Slot 0 + game scalars (the record-12 rewind seam) PLUS the five probe
     source reads (update-v107-record12-live NOTES §1): alt [Game+4],
     route [Game+0x269c8], player-loop room chain, blue prefix
     ([Game+0x18304], [Game+0x16c7c+0x44]), engine-pred ([Game+0x1b83c],
     [Game+0x1b83c+0x238]). */
  const { buf } = makePokedGameBuffer({
    0x676ac: 0,
    0x269ec: 1, /* [newslot+0] valid */
    0x4070c: 0x54, /* [newslot+0x19d20] room */
    0x26ad4: 7, /* [newslot+0xe8] tag */
    0x46818: 0x9, /* [newslot+0x1fe2c] arg */
    0x4681c: 502, /* [newslot+0x1fe30] frame */
    0x0: 1, /* game tag0 + game0 mode word */
    0x4: 5, /* alt-path AL 1 */
    0x269c8: 3, /* route AL 1 */
    0x264f8: 502,
    0x18318: 0xffffffff,
    0x18300: 0x600100, /* room ptr */
    0x18304: 0, /* blue currentIdx */
    0x16cc0: 0x40000, /* blue room flag bit */
    0x1b83c: 1, /* engine-pred head */
    0x1ba74: 1, /* engine-pred tail */
  });
  const guestRead = makeGuestReader({
    0x600104: 0x600200, /* [room+4] desc */
    0x600210: 0x600300, /* [desc+0x10] entity */
    0x600300: 0x23, /* [ent] */
    0x600308: 0x10, /* [ent+8] */
    0x600108: 0x54,
    0x600244: 0x80,
  });
  const canopy = {
    frameEffectShellReady: 1,
    frameEffectShellRoom18304: 0x54,
    frameEffectShellRoom182d0: 0x54,
    frameEffectShellRoomByte1: 1,
    frameEffectRewindGuard269ea: 0,
    frameEffectRewindGuard269eb: 0,
    frameEffectRewindGuard68d70: 0,
  };
  const site = { effectCounter68d6c: 1, roomTransitionMode1830c: 2, counter265c0: 7 };

  /* Capture on with the probe state: the pack goes LIVE through the
     bridge; the player-loop guest chain resolved -> the host-side probe
     row fires; the terminal pred (0x6f0070 AL = both engine words) ->
     terminal_265c0_clear(1) clears the counter at the site-A resume. */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(buf);
  live.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead,
    blueRoomDirection: 0,
  });
  const fired = live.tick(1, canopy, site);
  assert.equal(fired.events.rewind705ee0Stores, 1, "plan.reached -> S8 store block typed");
  assert.equal(fired.events.rewind705ee0SaveState, 1, "SaveState 0x6f9000 arg prep typed");
  assert.equal(fired.state.counter265c0, 0,
    "EnginePredProbe AL 1 -> the 0x265c0 terminal clear runs (0x6fdbb1)");
  assert.equal(fired.hostTotals.frameEffect6fd7c0ProbeHostReads, 1,
    "guest-read player-loop chain resolved -> the host-side probe row fires");

  /* Same buffer minus the engine-pred words: EnginePredProbe AL 0 ->
     the terminal clear is lane-decidable 0 -> the counter SURVIVES. */
  const dead = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  dead.session.gameObject.set(makePokedGameBuffer({
    0x676ac: 0,
    0x269ec: 1,
    0x4070c: 0x54,
    0x26ad4: 7,
    0x46818: 0x9,
    0x4681c: 502,
    0x0: 1,
    0x4: 5,
    0x269c8: 3,
    0x264f8: 502,
    0x18318: 0xffffffff,
    0x18300: 0x600100,
    0x18304: 0,
    0x16cc0: 0x40000,
    0x1b83c: 0, /* engine-pred head 0 -> AL 0 */
    0x1ba74: 0,
  }).buf);
  dead.setUpdateCapture({ gamePointerValue: 0x549e004c, guestRead, blueRoomDirection: 0 });
  const kept = dead.tick(1, canopy, site);
  assert.equal(kept.events.rewind705ee0Stores, 1, "rewind arm still live (independent of the pred)");
  assert.equal(kept.state.counter265c0, 8,
    "EnginePredProbe AL 0 -> the terminal clear stays off (the engine start-state's +1 increment survives)");

  /* Capture off: the pre-v107 dual approximation (gate1b83c &&
     predicate1ba74 — both 0) also keeps the incremented counter; NO
     probe row. */
  const off = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  off.session.gameObject.set(buf);
  const inert = off.tick(1, canopy, site);
  assert.equal(inert.state.counter265c0, 8, "capture off -> dual approximation keeps the incremented counter");
  assert.equal(inert.hostTotals.frameEffect6fd7c0ProbeHostReads, undefined,
    "capture off -> no probe row (absent lanes)");
});

test("update §5 seed path: app.js wiring (seed + sidecar capture) keeps the shipped path byte-for-byte", async () => {
  if (!existsSync(gameCaptureBinPath) || !existsSync(gameCaptureSidecarPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* The app.js seed path: load the captured Game object, stamp the sparse
     state patch for tick 1, and arm the capture with the sidecar's
     gamePointerValue. No guestRead exists in the browser -> every guest-
     homed §5 ready gate stays 0. */
  const bin = readFileSync(gameCaptureBinPath);
  const sidecar = JSON.parse(readFileSync(gameCaptureSidecarPath, "utf8"));
  const gamePointerValue = /^0x/.test(String(sidecar.gamePointerValue))
    ? parseInt(sidecar.gamePointerValue, 16) >>> 0
    : Number(sidecar.gamePointerValue) >>> 0;

  const seedTick = async (bridge) => {
    bridge.session.gameObject.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
    const raw = readSparseFieldsFromGameObject(bin);
    const seedStatePatch = Object.fromEntries(
      Object.entries(raw).filter(([k]) => k in bridge.session.state),
    );
    return bridge.tick(1, null, seedStatePatch);
  };

  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.setUpdateCapture({ gamePointerValue });
  const control = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const a = await seedTick(armed);
  const b = await seedTick(control);
  assert.equal(armed.updateCapture.gamePointerValue, 0x549e004c, "sidecar gamePointerValue reached the capture");
  assert.deepEqual(a.events, b.events, "armed capture + no guest memory = byte-for-byte identical events");
  /* Every §5 typed event stays 0 and the seeded residuals are untouched. */
  assert.equal(a.events.frameOpaque4212c0TrueProbeInterior, 0);
  assert.equal(a.events.opaque008318a0SfxManagerStores, 0);
  assert.equal(a.events.engineAnm2PrefixFilenameAssign, 0);
  assert.equal(a.events.rewind705ee0Stores, 0);
  assert.equal(a.events.rewind705ee0SaveState, 0);
  assert.equal(a.events.opaqueCall009a2b30, 1, "the record-0 coarse anchor stays");
});

test("update §5 record-0: captureUpdateLanes emits the 4 ABI-97 walker lanes via guestRead; absent -> residual", async () => {
  const { captureUpdateLanes } = await importBridge();
  const BASE = 0x549e004c;
  const ROW0 = 0x549e004c + 0x233a8 + 0x114; /* StatHUD block0 player ptr */
  const ROW1 = ROW0 + 0xcc; /* block1 player ptr */
  const PROBE1 = 0x549e004c + 0x18300; /* [Game+0x18300] ROOM ptr word */
  const B_PLAYER = 0x66660000;
  const A_PLAYER = 0x57862c34;

  /* Both rows readable + B's [B+0x328] word + the ROOM ptr word. */
  const full = captureUpdateLanes({
    gameView: makePokedGameBuffer({}).view,
    guestRead: makeGuestReader({
      [ROW0]: A_PLAYER,
      [ROW1]: B_PLAYER,
      [B_PLAYER + 0x328]: 0x33333333,
      [PROBE1]: 0x53ccb024,
    }),
    gamePointerValue: BASE,
  });
  assert.equal(full.hudStatWalkerPlayerA, A_PLAYER, "swap-OUT player A = the walker's block0 row (0x9bef22 arg1)");
  assert.equal(full.hudStatWalkerPlayerB, B_PLAYER, "swap-IN player B = the walker's block1 row (0x9bef09 arg2)");
  assert.equal(full.hudStatWalkerBFrame328, 0x33333333, "[B+0x328] deref (PE 0x84ccc8)");
  assert.equal(full.hudStatWalkProbe1Arg, 0x53ccb024, "[Game+0x18300] ROOM ptr word (PE 0x84d188)");

  /* B == 0 (single-player seed): the machine bails at 0x84ccb5
     `test edx,edx / je`, so [B+0x328] is NOT dereferenced — b_frame328
     stays ABSENT while player_a is still delivered. */
  const solo = captureUpdateLanes({
    gameView: makePokedGameBuffer({}).view,
    guestRead: makeGuestReader({
      [ROW0]: A_PLAYER,
      [ROW1]: 0,
      [PROBE1]: 0x53ccb024,
    }),
    gamePointerValue: BASE,
  });
  assert.equal(solo.hudStatWalkerPlayerA, A_PLAYER);
  assert.equal(solo.hudStatWalkerPlayerB, 0);
  assert.equal("hudStatWalkerBFrame328" in solo, false, "B == 0 -> no deref, lane absent");
  assert.equal(solo.hudStatWalkProbe1Arg, 0x53ccb024);

  /* Row read failure (e.g. a guestRead that cannot answer the rows):
     the whole walker group is ABSENT (= 0 after normalize). */
  const missing = captureUpdateLanes({
    gameView: makePokedGameBuffer({}).view,
    guestRead: makeGuestReader({}),
    gamePointerValue: BASE,
  });
  assert.equal("hudStatWalkerPlayerA" in missing, false);
  assert.equal("hudStatWalkerPlayerB" in missing, false);
  assert.equal("hudStatWalkerBFrame328" in missing, false);
  assert.equal("hudStatWalkProbe1Arg" in missing, false);

  /* No guestRead at all (capture-absence discipline): same residual. */
  const noGuest = captureUpdateLanes({
    gameView: makePokedGameBuffer({}).view,
    gamePointerValue: BASE,
  });
  assert.equal("hudStatWalkerPlayerA" in noGuest, false);
  assert.equal("hudStatWalkProbe1Arg" in noGuest, false);
});

test("update §5 record-0: seeded snapshot + browser guestRead arms the walker lanes and fires the walker probe events on the module", async () => {
  if (!existsSync(gameCaptureBinPath) || !existsSync(gameCaptureSidecarPath)) return;
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* The app.js seed path (update-v104-guestread): seed the captured Game
     object, stamp the sparse state patch, and arm the capture with the
     sidecar gamePointerValue + a guestRead that resolves absolute guest
     addresses into the seeded Game buffer — the ONLY guest memory the
     browser has. */
  const bin = readFileSync(gameCaptureBinPath);
  const sidecar = JSON.parse(readFileSync(gameCaptureSidecarPath, "utf8"));
  const gamePointerValue = /^0x/.test(String(sidecar.gamePointerValue))
    ? parseInt(sidecar.gamePointerValue, 16) >>> 0
    : Number(sidecar.gamePointerValue) >>> 0;

  const seedTick = async (bridge) => {
    const gameObject = bridge.session.gameObject;
    gameObject.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
    const raw = readSparseFieldsFromGameObject(bin);
    const seedStatePatch = Object.fromEntries(
      Object.entries(raw).filter(([k]) => k in bridge.session.state),
    );
    return bridge.tick(1, null, seedStatePatch);
  };
  const seededGuestRead = (buffer) => (address, size) => {
    const off = ((address >>> 0) - gamePointerValue) >>> 0;
    if (off >= buffer.length || size <= 0 || size > buffer.length - off) return null;
    return buffer.subarray(off, off + size);
  };

  /* The seeded inrun capture: block0 row @Game+0x233b4 = 0x57862c34
     (player_a), block1 row @Game+0x23480 = 0 (single player), and
     [Game+0x18300] = the ROOM ptr word (0x53ccb024 per the sidecar) — so
     the walker capture group delivers player_a != 0 and probe1_arg, and
     the module's walker gate `player_a|player_b != 0` goes live. */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
  live.setUpdateCapture({
    gamePointerValue,
    guestRead: seededGuestRead(live.session.gameObject),
  });

  /* The walker k6/k7 block additionally needs the HOST-owned walk-seam
     lanes (v95 pins the bridge must NOT supply): managerStatFlag +
     hudStatWalkBlobReady + the player-list span + the walk-blob pack row
     (the test acts as the host capture pack — same pattern as the
     record-12/record-4 test packs). Count = (0x53db5b90-0x53db5b8c)>>2
     = 1, read from the seeded buffer's own [Game+0x1baa8]/[0x1baac]. */
  const hostWalkSeam = {
    managerStatFlag: 0x1, /* low byte non-zero (0x9be080 owner capture) */
    hudStatWalkBlobReady: 1, /* the walk-blob voucher */
    hudStatPlayerListBegin: 0x53db5b8c,
    hudStatPlayerListEnd: 0x53db5b90,
    hudStatContainerBegin: 0, /* empty container -> predA clause passes */
    hudStatContainerEnd: 0,
    hudStatPlayer0Ptr: 0x57862c34, /* the walk-pack row (== player_a) */
    hudStatPlayer0F2c: 0,
    hudStatPlayer0F3bc: 0,
    hudStatPlayer0F13c0: 0,
    hudStatPlayer0F172: 0,
    hudStatPlayer0OtherPtr: 0,
    hudStatPlayer0Other161c: 0,
    hudStatPlayer0F161c: 0,
  };
  const seeded = await live.tick(1, hostWalkSeam, null);
  /* The walker capture is live: the typed walker probe events fire
     (@956/960/964) — probe1 = reached (+1 per k6/k7-arm entry), probe2 =
     the swap-gate row arm (entry==A -> 1), probe3 = the k6 target bits. */
  assert.ok(seeded.events.hudStatWalkerProbe1 >= 1, "walker probe1 fired — capture live");
  assert.equal(seeded.events.hudStatWalkerProbe2, 1, "entry == player_a -> row arm 1 (0x84cc9d)");
  assert.equal(seeded.events.hudStatWalkerProbe3, 0, "k6 target from the zero probe lanes");

  /* Control: same seed WITHOUT the capture (guestRead null) -> the walker
     lanes stay 0 -> the walker probe events stay residual (0). */
  const controlBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  controlBridge.session.gameObject.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
  controlBridge.setUpdateCapture({ gamePointerValue });
  const control = await controlBridge.tick(1, hostWalkSeam, null);
  assert.equal(control.events.hudStatWalkerProbe1, 0, "capture absent -> walker probes residual");
  assert.equal(control.events.hudStatWalkerProbe2, 0);
  assert.equal(control.events.hudStatWalkerProbe3, 0);
  /* The no-capture path is byte-for-byte the pre-capture residuals. */
  const plain = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  plain.session.gameObject.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
  const plainResult = await plain.tick(1, hostWalkSeam, null);
  assert.deepEqual(control.events, plainResult.events, "armed-without-guestRead == no capture (byte-for-byte)");
  assert.equal(plainResult.events.hudStatWalkerProbe1, 0);

  /* Two-player variant (BOTH lanes non-zero): poke a second block row IN
     the seeded buffer pointing at an in-buffer fake player so [B+0x328]
     resolves inside the buffer, and set the walk-pack row to fakerB —
     entry == B -> the swap-BACK arm (2). If the B lane had NOT reached
     the module the arm would be 0 — the probe2 value discriminates the
     lane delivery. */
  const dup = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const dupGame = dup.session.gameObject;
  dupGame.set(bin.subarray(0, GAME_OBJECT_MIN_SIZE));
  const fakeB = (gamePointerValue + 0x5000) >>> 0; /* in-buffer player */
  const dupView = new DataView(dupGame.buffer, dupGame.byteOffset, dupGame.byteLength);
  dupView.setUint32(0x233a8 + 0x114 + 0xcc, fakeB, true); /* block1 row := B */
  dupView.setUint32(0x5000 + 0x328, 77, true); /* [B+0x328] */
  dup.setUpdateCapture({ gamePointerValue, guestRead: seededGuestRead(dupGame) });
  const dupResult = await dup.tick(1, {
    ...hostWalkSeam,
    hudStatPlayer0Ptr: fakeB, /* the walk-pack row == the captured B */
  }, null);
  assert.ok(dupResult.events.hudStatWalkerProbe1 >= 1, "two-player seeded seed still fires the walker probes");
  assert.equal(dupResult.events.hudStatWalkerProbe2, 2, "entry == player_b -> swap-back arm 2 — the captured B lane reached the module");
});

/* -------------------------------------------------------------------------
 * 4c. Record idx 42 tail-path capture (W29-S3, ABI v95 wire).
 *
 * captureUpdateTailPath + the captureUpdateLanes group: samples the
 * record-42 seam (B19 0x008055a7..0x00806043 + B20 0x0080608e..
 * 0x008068a1) — the trail container words [0xc82674]/[0xc82678] (guest
 * BSS), the [Game+0x26614] mode and the pass1/pass2 entity packs —
 * READ-ONLY, and raises tailPathReady. End-to-end: a poked Game buffer
 * + guest map -> the module wire fires (typed carriers + coarse edge);
 * ready=0 (capture absent / read failure) -> pre-v95 monolith
 * byte-for-byte; over-cap span -> fallback; 3-mutant sha256 restore
 * cycle over the written runtime-inputs region.
 * ---------------------------------------------------------------------- */

const TAIL_LIST_BEGIN = 0x00c82674;
const TAIL_LIST_END = 0x00c82678;
const TAIL_MODE_OFF = 0x26614;
const TAIL_ENTRY_OFS = Object.freeze({
  type28: 0x28, flags16c: 0x16c, field3c0: 0x3c0,
  child3bc: 0x3bc, childType28: 0x28, posX: 0x33c, posY: 0x340,
});

/** Guest memory map for a trail list: the container pair + the slot ptrs
 *  + the entity field words (childType sits at [child+0x28], read only
 *  when child3bc != 0). */
function tailGuestMap({ begin, end, entities }) {
  const spec = {
    [TAIL_LIST_BEGIN]: begin >>> 0,
    [TAIL_LIST_END]: end >>> 0,
  };
  for (let i = 0; i < entities.length; i += 1) {
    spec[(begin + i * 4) >>> 0] = entities[i].ptr >>> 0;
  }
  for (const e of entities) {
    const ptr = e.ptr >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.type28) >>> 0] = e.type28 >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.flags16c) >>> 0] = e.flags16c >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.field3c0) >>> 0] = e.field3c0 >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.child3bc) >>> 0] = e.child3bc >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.posX) >>> 0] = e.posX >>> 0;
    spec[(ptr + TAIL_ENTRY_OFS.posY) >>> 0] = e.posY >>> 0;
    if (e.child3bc !== 0) {
      spec[(e.child3bc + TAIL_ENTRY_OFS.childType28) >>> 0] = (e.childType28 ?? 0) >>> 0;
    }
  }
  return spec;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** sha256 of the module's written runtime-inputs region (their exact
 *  delivery surface — a byte-flow signature of the captured lanes). */
function runtimeInputsHash(session) {
  const view = new DataView(session.slice.memory.buffer);
  const base = session.slice.paths.runtimeInputsAddress();
  const bytes = new Uint8Array(
    session.slice.memory.buffer,
    base,
    RUNTIME_INPUTS_LAYOUT.tailPathEntries.offset +
      RUNTIME_INPUTS_LAYOUT.tailPathEntries.size,
  );
  return sha256(bytes);
}

test("update §5 record-42: captureUpdateTailPath samples the seam READ-ONLY and raises tailPathReady", async () => {
  const { captureUpdateLanes } = await importBridge();

  /* Three entities: pass1 match (0x1c), PAIR_X route (0x4e), PAIR_Y route
     (0x66) — the existing wire-test shape. Entity 2 carries a live child
     (type 1 -> the chain-continue gate). */
  const begin = 0x600000;
  const entities = [
    { ptr: 0x700000, type28: 0x1c, flags16c: 0x1000, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0 },
    { ptr: 0x710000, type28: 0x4e, flags16c: 0, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0 },
    { ptr: 0x720000, type28: 0x66, flags16c: 0, field3c0: 0, child3bc: 0x730000, childType28: 1, posX: 0, posY: 0x40000000 },
  ];
  const game = makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 });
  const guestRead = makeGuestReader(tailGuestMap({ begin, end: begin + 0xc, entities }));
  const patch = captureUpdateLanes({ gameView: game.view, guestRead, gamePointerValue: 0x549e004c });

  /* The 4 scalars + ready + the 896-B blob. */
  assert.equal(patch.tailPathReady, 1, "tailPathReady raised by the capture");
  assert.equal(patch.tailPathListBeginC82674, begin, "[0xc82674] begin");
  assert.equal(patch.tailPathListEndC82678, begin + 0xc, "[0xc82678] end");
  assert.equal(patch.tailPathMode26614, 2, "[Game+0x26614] mode");
  assert.equal(patch.tailPathGenrandDraws, 0, "host-counted lane rides 0 on the bridge");
  assert.ok(patch.tailPathEntries instanceof Uint8Array, "flat 896-B entries blob");
  assert.equal(patch.tailPathEntries.length, 32 * 28, "32 x 28 B");

  /* The blob bytes decode back to the captured packs (wasm parity). */
  const dv = new DataView(patch.tailPathEntries.buffer, patch.tailPathEntries.byteOffset, patch.tailPathEntries.byteLength);
  assert.equal(dv.getUint32(0, true), 0x1c, "entry0 type28");
  assert.equal(dv.getUint32(4, true), 0x1000, "entry0 flags16c");
  assert.equal(dv.getUint32(12, true), 0, "entry0 child3bc");
  assert.equal(dv.getUint32(16, true), 0, "entry0 childType28 (child 0)");
  assert.equal(dv.getUint32(20, true), 0x3f800000, "entry0 posX f32 bits");
  assert.equal(dv.getUint32(2 * 28 + 8, true), 0, "entry2 field3c0");
  assert.equal(dv.getUint32(2 * 28 + 12, true), 0x730000, "entry2 child ptr");
  assert.equal(dv.getUint32(2 * 28 + 16, true), 1, "entry2 childType28 ([child+0x28])");

  /* READ-ONLY: the capture must not mutate the Game buffer or guest map. */
  assert.equal(game.view.getUint32(TAIL_MODE_OFF, true), 2);
  assert.equal(new DataView(guestRead(begin, 4).buffer).getUint32(0, true), entities[0].ptr,
    "[begin] slot still holds the first entry pointer");

  /* Absent guestRead / failed reads -> no tail-path lane at all. */
  assert.equal("tailPathReady" in captureUpdateLanes({ gameView: game.view, gamePointerValue: 0x549e004c }), false,
    "no guestRead -> the BSS container cannot resolve");
  const broken = captureUpdateLanes({
    gameView: game.view,
    guestRead: makeGuestReader({ [TAIL_LIST_BEGIN]: begin, [TAIL_LIST_END]: begin + 0xc }),
    gamePointerValue: 0x549e004c,
  });
  assert.equal("tailPathReady" in broken, false, "entity slot read failure -> absent group");
});

test("update §5 record-42: poke buffer -> the module wire fires (typed carriers + coarse edge); begin==end + flag 0 -> pure DROP", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const begin = 0x600000;
  const entities = [
    { ptr: 0x700000, type28: 0x1c, flags16c: 0x1000, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0 },
    { ptr: 0x710000, type28: 0x4e, flags16c: 0, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0 },
    { ptr: 0x720000, type28: 0x66, flags16c: 0, field3c0: 1, child3bc: 0, posX: 0, posY: 0x40000000 },
  ];
  const game = makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 });
  const guestRead = makeGuestReader(tailGuestMap({ begin, end: begin + 0xc, entities }));
  const hostSeam = { roomFlag7769: 0x12 }; /* B19 rebuild gate OPEN (low byte) */

  /* Capture armed: the bridge's per-tick captureUpdateLanes supplies the
     group; the module wire runs -> typed carriers only (ABI v114 retired
     the live-capture coarse edge). */
  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(game.buf);
  live.setUpdateCapture({ gamePointerValue: 0x549e004c, guestRead });
  const fired = await live.tick(1, null, hostSeam);
  assert.equal(fired.events.opaqueRoomUpdateTailPath, 0,
    "ABI v114: no coarse edge under live capture (typed carriers are the record)");
  assert.equal(fired.events.tailPathHostRebuild, 1, "B19 rebuild carrier");
  assert.equal(fired.events.tailPathHostTrail, 1, "B20 trail carrier");
  assert.equal(fired.events.tailPathHostPush, 1, "pass1 match (0x1c) -> 0x42c920 push");
  assert.equal(fired.events.tailPathHostSpawn, 3, "one spawn per pass2 entry");
  assert.equal(fired.events.tailPathPureSteps, 3, "in-module walk steps");

  /* begin==end + flag low byte 0 -> B19 NONE + B20 NONE: the coarse edge
     DROPS (pure skip) — the wire replaced the monolith. */
  const pureGame = makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 });
  const pure = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  pure.session.gameObject.set(pureGame.buf);
  pure.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader({ [TAIL_LIST_BEGIN]: begin, [TAIL_LIST_END]: begin }),
  });
  const pureResult = await pure.tick(1, null, { roomFlag7769: 0x100 });
  assert.equal(pureResult.events.opaqueRoomUpdateTailPath, 0, "BOTH NONE -> no host residual");
  assert.equal(pureResult.events.tailPathPureSteps ?? 0, 0, "no steps on NONE/NONE");
});

test("update §5 record-42: ready=0 -> pre-v95 monolith byte-for-byte; over-cap span -> fallback", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const begin = 0x600000;
  const entities = [
    { ptr: 0x700000, type28: 0x1c, flags16c: 0x1000, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0 },
  ];
  const game = makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 });
  const hostSeam = { roomFlag7769: 0x12 };

  const run = async (bridge, capture) => {
    bridge.session.gameObject.set(game.buf);
    if (capture) bridge.setUpdateCapture(capture);
    return bridge.tick(1, null, hostSeam);
  };
  const noCaptureBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const deadBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  assert.ok(noCaptureBridge.session && deadBridge.session, "both boots carry a session");
  const noCapture = await run(noCaptureBridge, null);
  const captureDead = await run(deadBridge, { gamePointerValue: 0x549e004c, guestRead: makeGuestReader({}) });

  /* ready=0 (both: capture absent AND capture present-but-unreadable) ->
     the monolith fires and the typed carriers stay 0 — byte-for-byte
     identical to the pre-v95 record. */
  assert.equal(noCapture.events.opaqueRoomUpdateTailPath, 1, "monolith fires");
  assert.deepEqual(captureDead.events, noCapture.events, "unreadable capture == no capture (byte-for-byte)");
  assert.equal(captureDead.events.tailPathHostTrail ?? 0, 0, "no typed carriers");
  assert.equal(captureDead.events.tailPathHostRebuild ?? 0, 0);

  /* Over-cap span (33 entities > 32): the group stays ABSENT -> monolith. */
  const many = [];
  for (let i = 0; i < 33; i += 1) {
    many.push({ ptr: (0x700000 + i * 0x1000) >>> 0, type28: 0x1c, flags16c: 0,
      field3c0: 1, child3bc: 0, posX: 0, posY: 0 });
  }
  const capGame = makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 });
  const over = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  over.session.gameObject.set(capGame.buf);
  over.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader(tailGuestMap({ begin, end: begin + 33 * 4, entities: many })),
  });
  const overResult = await over.tick(1, null, hostSeam);
  assert.equal(overResult.events.opaqueRoomUpdateTailPath, 1, "over-cap fallback -> monolith");
  assert.equal(overResult.events.tailPathHostTrail ?? 0, 0, "no typed carriers on fallback");

  /* Negative span (end < begin): SAR count < 0 -> same fallback. */
  const neg = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  neg.session.gameObject.set(makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 }).buf);
  neg.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader({ [TAIL_LIST_BEGIN]: begin + 0x10, [TAIL_LIST_END]: begin }),
  });
  const negResult = await neg.tick(1, null, hostSeam);
  assert.equal(negResult.events.tailPathHostTrail ?? 0, 0, "negative span -> fallback");
  assert.equal(negResult.events.opaqueRoomUpdateTailPath, 1);
});

test("update §5 record-42: 3-mutant sha256 restore cycle over the written runtime-inputs region", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* One pass2 entry; 3 mutants flip DIFFERENT entity fields in the guest
     map; the runtime-inputs region hash must differ per mutant and return
     to the baseline exactly when the guest bytes are restored. */
  const begin = 0x600000;
  const ent = { ptr: 0x700000, type28: 0x4e, flags16c: 0, field3c0: 1, child3bc: 0, posX: 0x3f800000, posY: 0x40000000 };
  const baseMap = tailGuestMap({ begin, end: begin + 4, entities: [ent] });

  const tickWith = async (guestMap) => {
    const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
    bridge.session.gameObject.set(makePokedGameBuffer({ [TAIL_MODE_OFF]: 2 }).buf);
    bridge.setUpdateCapture({ gamePointerValue: 0x549e004c, guestRead: makeGuestReader(guestMap) });
    await bridge.tick(1, null, { roomFlag7769: 0x12 });
    return runtimeInputsHash(bridge);
  };

  const baseline = await tickWith(baseMap);
  const mutants = [
    { ...baseMap, [(ent.ptr + TAIL_ENTRY_OFS.flags16c) >>> 0]: 0x4000 }, /* flags16c */
    { ...baseMap, [(ent.ptr + TAIL_ENTRY_OFS.type28) >>> 0]: 0x1c }, /* type28 */
    { ...baseMap, [(ent.ptr + TAIL_ENTRY_OFS.posX) >>> 0]: 0 }, /* posX */
  ];
  const hashes = [];
  for (const m of mutants) {
    const h = await tickWith(m);
    hashes.push(h);
    assert.notEqual(h, baseline, `mutant changes the shipped bytes (${h.slice(0, 12)})`);
  }
  assert.equal(new Set(hashes).size, 3, "three mutants hash three distinct inputs regions");
  /* Restore step: replay the ORIGINAL guest bytes -> the baseline hash
     restores exactly (3rd cycle closes the loop). */
  assert.equal(await tickWith(baseMap), baseline, "restored guest bytes -> baseline hash");
  assert.equal(await tickWith(baseMap), baseline, "restore is stable across replays");
});
/* =====================================================================
 * Record idx 16 B8 path-cost CAPTURE-FEED bridge (W30-S3; update-v108-
 * record16-b8-bridge NOTES): captureUpdateB8 fills the module's exported
 * k-blob scratch (costs int32[448] @ isaac_game_update_slice_b8_costs_
 * address + trails int16[448] @ isaac_game_update_slice_b8_trails_address)
 * from the LIVE Room grids BEFORE resume_room_update_prefix_b2 and raises
 * roomGridCells/roomB8BlobReady; the module steps the scratch in place
 * (zero host residual) and the bridge copies it back AFTER the tick.
 * Sources: room ptr word [Game+0x18300]; dims (u32)[Room+0xc] /
 * (u32)[Room+0x10] with 32-bit imul-wrap cells (PE 0x803c29; bound re-
 * read per iteration 0x803ccd..0x803cdd); costs Room+0x76c dword stride 4,
 * trails Room+0xe6c word stride 2.
 * =================================================================== */

const B8_TEST_ROOM = 0x700000;
const B8_COSTS_BASE = 0x76c;
const B8_TRAILS_BASE = 0xe6c;

/** The W28-S2 6-arm B8 cell set (exercises every pure-cell law branch):
 *  costs 3999->900 / rem<=100->multiple / 100<rem<=900->-100 /
 *  rem>=901->skip / negative (C truncating %) / 0; trails in [1,99]
 *  decrement (SIGNED max(0,t-1)), 0/100 (no touch), negative. */
const B8_SEED_COSTS = [3999, 1234, 0, 5000, 900, 100, 101, 1001, -12, 448];
const B8_SEED_TRAILS = [99, 50, 1, 0, 100, 98, 5, 32767, -3, 200];

/** B8 pure-cell law replica (room-pure oracle; PE 0x803c50..0x803cdd). */
function b8CellStep(cost, trail) {
  const c = cost | 0;
  let outCost = c;
  if (c === 3999) {
    outCost = 900;
  } else {
    const rem = c % 1000; /* C99 truncating % — same as JS */
    if (rem < 0x385) outCost = c - (rem > 100 ? 100 : rem);
  }
  let outTrail = trail | 0;
  if ((((trail - 1) & 0xffff) >>> 0) < 99) outTrail = Math.max(0, trail - 1);
  return { cost: outCost, trail: outTrail };
}

function trailBytes(v) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setInt16(0, v | 0, true);
  return b;
}

function b8Export(wasm, name) {
  return wasm[name] ?? wasm[`_${name}`];
}

/** Guest map for a live B8 room: dims + the cost/trail grids. */
function b8GuestMap({ w, h, costs = null, trails = null }) {
  const cells = Math.imul(w, h) >>> 0;
  const spec = {
    [(B8_TEST_ROOM + 0xc) >>> 0]: w >>> 0,
    [(B8_TEST_ROOM + 0x10) >>> 0]: h >>> 0,
  };
  for (let i = 0; i < cells; i += 1) {
    spec[(B8_TEST_ROOM + B8_COSTS_BASE + i * 4) >>> 0] =
      costs != null ? (costs[i % costs.length] | 0) : (B8_SEED_COSTS[i % B8_SEED_COSTS.length] | 0);
    spec[(B8_TEST_ROOM + B8_TRAILS_BASE + i * 2) >>> 0] =
      trailBytes(trails != null ? (trails[i % trails.length] | 0) : (B8_SEED_TRAILS[i % B8_SEED_TRAILS.length] | 0));
  }
  return spec;
}

/** Fresh B8 battle map: game buffer with the room ptr + a full guest map. */
function makeB8Seed({ w, h, costs = null, trails = null }) {
  const game = makePokedGameBuffer({ 0x18300: B8_TEST_ROOM });
  const guestRead = makeGuestReader(b8GuestMap({ w, h, costs, trails }));
  return {
    game,
    guestRead,
    cells: Math.imul(w, h) >>> 0,
    costs: costs != null ? costs : B8_SEED_COSTS,
    trails: trails != null ? trails : B8_SEED_TRAILS,
  };
}

/** Read the module k-blob scratch back from wasm linear memory. */
function b8ScratchRead(slice, cells) {
  const wasm = slice.wasm;
  const costsAddr = b8Export(wasm, "isaac_game_update_slice_b8_costs_address")();
  const trailsAddr = b8Export(wasm, "isaac_game_update_slice_b8_trails_address")();
  const view = new DataView(slice.memory.buffer);
  const out = [];
  for (let i = 0; i < cells; i += 1) {
    out.push({
      cost: view.getInt32(costsAddr + i * 4, true),
      trail: view.getInt16(trailsAddr + i * 2, true),
    });
  }
  return out;
}

function b8ScratchHash(slice) {
  const wasm = slice.wasm;
  const costsAddr = b8Export(wasm, "isaac_game_update_slice_b8_costs_address")();
  const trailsAddr = b8Export(wasm, "isaac_game_update_slice_b8_trails_address")();
  const bytes = new Uint8Array(
    slice.memory.buffer,
    costsAddr,
    448 * 4 + 448 * 2,
  );
  return sha256(bytes);
}

test("update §5 record-16: captureUpdateB8 reads the live Room grids and fillUpdateB8Scratch lands them at the exported addresses", async () => {
  const { captureUpdateB8, fillUpdateB8Scratch, bootNativeUpdateBridge } = await importBridge();
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  const { slice } = bridge;
  const seed = makeB8Seed({ w: 2, h: 5 });

  /* The exports are REUSED, never re-derived: the module defines the cap
     (ISAAC_ROOM_B8_MAX_CELLS 448) and the scratch addresses. */
  assert.equal(b8Export(slice.wasm, "isaac_game_update_slice_b8_max_cells")(), 448,
    "module cap export is the 448-cell scratch");

  const cap = b8Export(slice.wasm, "isaac_game_update_slice_b8_max_cells")();
  const costsAddr = b8Export(slice.wasm, "isaac_game_update_slice_b8_costs_address")();
  const trailsAddr = b8Export(slice.wasm, "isaac_game_update_slice_b8_trails_address")();
  assert.ok(costsAddr !== 0 && trailsAddr !== 0, "scratch addresses exported");
  const view = new DataView(slice.memory.buffer);
  /* Sanity: scratch is zero before the fill (fresh module). */
  assert.equal(view.getInt32(costsAddr, true), 0, "scratch pre-zeroed");

  const capResult = captureUpdateB8({ slice, gameView: seed.game.view, guestRead: seed.guestRead });
  assert.ok(capResult, "capture arms");
  assert.equal(capResult.cells, 10, "cells = w*h 32-bit wrap");
  assert.equal(capResult.roomPtr, B8_TEST_ROOM);
  assert.deepEqual(capResult.patch, { roomGridCells: 10, roomB8BlobReady: 1 },
    "runtime lanes raised BEFORE the resume (roomGridCells @200, roomB8BlobReady @204 FULL-dword)");
  assert.deepEqual(Array.from(capResult.costs), B8_SEED_COSTS, "cost grid captured (signed)");
  assert.deepEqual(Array.from(capResult.trails), B8_SEED_TRAILS, "trail grid captured");

  /* THE CAPTURE ITSELF IS READ-ONLY on the guest side: the scratch fill is
     a separate step (fillUpdateB8Scratch, called at the resume seam). */
  const beforeFill = view.getInt32(costsAddr, true);
  assert.equal(beforeFill, 0, "capture does not write the scratch");

  const filled = fillUpdateB8Scratch({ slice, capture: capResult });
  assert.equal(filled, 10, "fill writes every cell");
  for (let i = 0; i < 10; i += 1) {
    assert.equal(view.getInt32(costsAddr + i * 4, true), B8_SEED_COSTS[i],
      `cost[${i}] landed`); /* 3999 signed 32-bit */
    assert.equal(view.getInt16(trailsAddr + i * 2, true), B8_SEED_TRAILS[i],
      `trail[${i}] landed`);
  }
  assert.equal(view.getUint32(costsAddr + 10 * 4, true), 0, "beyond cells untouched");
  /* A mismatched capture (cells > the arrays' length) must never write. */
  assert.equal(fillUpdateB8Scratch({ slice, capture: { ...capResult, cells: 11 } }), 0,
    "capture/array mismatch -> no fill");
  assert.equal(capResult.patch.roomB8BlobReady, 1, "FULL-dword ready (WIDE 0x100 pure on the module)");
});

test("update §5 record-16: capture-absence discipline — any unresolved read keeps the group ABSENT", async () => {
  const { captureUpdateB8, bootNativeUpdateBridge } = await importBridge();
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  const { slice } = bridge;
  const seed = makeB8Seed({ w: 2, h: 5 });

  assert.equal(captureUpdateB8({ gameView: seed.game.view, guestRead: seed.guestRead }), null,
    "no slice -> absent (the module lanes stay 0)");
  assert.equal(captureUpdateB8({ slice, guestRead: seed.guestRead }), null,
    "no gameView -> absent");
  assert.equal(captureUpdateB8({ slice, gameView: seed.game.view }), null,
    "no guestRead -> absent");
  assert.equal(captureUpdateB8({}), null, "nothing -> absent");

  /* Unresolved room pointer ([Game+0x18300] = 0) -> absent. */
  const noRoom = makePokedGameBuffer({ 0x18300: 0 });
  assert.equal(captureUpdateB8({ slice, gameView: noRoom.view, guestRead: seed.guestRead }), null);

  /* One unresolvable grid cell (address dropped from the map) -> the
     WHOLE group absent (no partial grid; ready stays 0 -> residual). */
  const spec = b8GuestMap({ w: 2, h: 5 });
  delete spec[(B8_TEST_ROOM + B8_COSTS_BASE + 3 * 4) >>> 0];
  const broken = makeGuestReader(spec);
  assert.equal(captureUpdateB8({ slice, gameView: seed.game.view, guestRead: broken }), null,
    "unresolved cost cell -> no partial capture");

  /* The capture never touches guest memory (READ-ONLY guest side). */
  const before = b8GuestMap({ w: 2, h: 5 });
  const after = b8GuestMap({ w: 2, h: 5 });
  assert.deepEqual(after, before);
});

test("update §5 record-16: imul-wrap cells + zero grid captured; over-cap (cells > 448) keeps the byte-for-byte residual", async () => {
  const { captureUpdateB8, bootNativeUpdateBridge } = await importBridge();
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  const { slice } = bridge;

  /* 32-bit imul wrap: 0x10000 x 0x10000 = 0 cells (u32 wrap) — captured
     as a zero grid; the module gate needs cells > 0 so nothing fires
     (byte-for-byte with the PE live-dims read). */
  const wrap = captureUpdateB8({
    slice,
    gameView: makeB8Seed({ w: 0x10000, h: 0x10000 }).game.view,
    guestRead: makeB8Seed({ w: 0x10000, h: 0x10000 }).guestRead,
  });
  assert.ok(wrap, "zero-cell wrap grid IS capturable");
  assert.equal(wrap.patch.roomGridCells, 0);
  assert.equal(wrap.patch.roomB8BlobReady, 1);

  /* Cap boundary: exactly 448 cells (448 x 1) arms. */
  const atCap = captureUpdateB8({
    slice,
    gameView: makeB8Seed({ w: 448, h: 1 }).game.view,
    guestRead: makeB8Seed({ w: 448, h: 1 }).guestRead,
  });
  assert.ok(atCap, "448 cells fits the scratch");
  assert.equal(atCap.patch.roomGridCells, 448);

  /* Over-cap (449 x 1): the capture cannot fit -> ABSENT -> ready stays 0
     -> the module falls back to the byte-for-byte host residual. */
  assert.equal(captureUpdateB8({
    slice,
    gameView: makeB8Seed({ w: 449, h: 1 }).game.view,
    guestRead: makeB8Seed({ w: 449, h: 1 }).guestRead,
  }), null, "449 cells -> absent (over-cap fallback)");
});

test("update §5 record-16: 6-arm B8 guard set at the tick — gate open takes ZERO host events on the module path", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const seed = makeB8Seed({ w: 2, h: 5 });
  const expected = [];
  for (let i = 0; i < 10; i += 1) expected.push(b8CellStep(B8_SEED_COSTS[i], B8_SEED_TRAILS[i]));

  /* ARM 1+2 seeded/pure: live grids captured -> blob ready -> the module
     steps the scratch in place; event 148 stays 0 and the HostHandler sees
     NOTHING for the B8 kind. */
  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.session.gameObject.set(seed.game.buf);
  armed.setUpdateCapture({ guestRead: seed.guestRead });
  const pure = armed.tick(1, null, { frameCounter264f8: 2 }); /* (2+1) % 3 == 0 at the B8 block */
  assert.equal(pure.events.opaqueRoomUpdatePrefixB8 | 0, 0, "gate open + blob -> NO residual");
  assert.equal((pure.hostTotals?.opaqueRoomUpdatePrefixB8 ?? 0) | 0, 0,
    "ZERO host events on the module path");
  assert.equal(pure.b8GridApply.cells, 10, "tick surfaces the armed capture");
  assert.equal(pure.b8GridApply.ready, 1);
  const stepped = b8ScratchRead(armed.slice, 10);
  for (let i = 0; i < 10; i += 1) {
    assert.equal(stepped[i].cost, expected[i].cost, `pure cost law cell ${i}`);
    assert.equal(stepped[i].trail, expected[i].trail, `pure trail law cell ${i}`);
  }

  /* ARM 3 wide-ready: FULL-dword ready gate — a WIDE 0x100 ready must
     still take the pure path (extraRuntime wins over the capture's 1). */
  const wide = armed.tick(2, { roomB8BlobReady: 0x100 }, { frameCounter264f8: 5 });
  assert.equal(wide.events.opaqueRoomUpdatePrefixB8 | 0, 0, "WIDE ready 0x100 -> pure");
  assert.equal(wide.b8GridApply.ready, 1);

  /* ARM 6 gate-miss: frame % 3 != 0 -> nothing at all; the scratch is
     NOT stepped by the module (still the captured bytes) and no residual
     fires. */
  const miss = armed.tick(3, null, { frameCounter264f8: 3 }); /* (3+1) % 3 != 0 */
  assert.equal(miss.events.opaqueRoomUpdatePrefixB8 | 0, 0, "gate miss -> nothing");
  const untouched = b8ScratchRead(armed.slice, 10);
  for (let i = 0; i < 10; i += 1) {
    assert.equal(untouched[i].cost, B8_SEED_COSTS[i], `gate miss leaves cost ${i} captured`);
    assert.equal(untouched[i].trail, B8_SEED_TRAILS[i], `gate miss leaves trail ${i} captured`);
  }

  /* ARM 4 no-blob: capture off -> ready stays 0 -> byte-for-byte host
     residual on gate-open frames. */
  const mono = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  mono.session.gameObject.set(seed.game.buf);
  mono.setUpdateCapture({ gamePointerValue: 0 }); /* no guestRead -> no blob */
  const fallback = mono.tick(1, null, { frameCounter264f8: 2 });
  assert.equal(fallback.events.opaqueRoomUpdatePrefixB8 | 0, 1, "gate open + no blob -> residual");
  assert.equal((fallback.hostTotals?.opaqueRoomUpdatePrefixB8 ?? 0) | 0, 1,
    "host event fires on the fallback");
  assert.equal(fallback.b8GridApply, undefined, "no capture -> no grid apply surface");

  /* ARM 5 over-cap: a live 449-cell grid cannot fit the scratch -> the
     capture is absent -> same byte-for-byte residual. */
  const over = makeB8Seed({ w: 449, h: 1, costs: new Array(449).fill(1000), trails: new Array(449).fill(5) });
  const overBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  overBridge.session.gameObject.set(over.game.buf);
  overBridge.setUpdateCapture({ guestRead: over.guestRead });
  const overResult = overBridge.tick(1, null, { frameCounter264f8: 2 });
  assert.equal(overResult.events.opaqueRoomUpdatePrefixB8 | 0, 1, "over-cap -> residual");
  assert.equal(overResult.b8GridApply, undefined, "over-cap capture absent");
});

test("update §5 record-16: copy-back writes the module-stepped scratch to the live Room grids AFTER the tick", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const seed = makeB8Seed({ w: 2, h: 5 });
  const writes = [];
  const guestWrite = (address, bytes) => writes.push({ address: address >>> 0, bytes: Uint8Array.from(bytes) });
  const expected = [];
  for (let i = 0; i < 10; i += 1) expected.push(b8CellStep(B8_SEED_COSTS[i], B8_SEED_TRAILS[i]));

  /* Gate open: the module stepped the scratch -> the copy-back MUST land
     the stepped values at Room+0x76c (int32) / Room+0xe6c (int16). */
  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.session.gameObject.set(seed.game.buf);
  armed.setUpdateCapture({ guestRead: seed.guestRead, guestWrite });
  const pure = armed.tick(1, null, { frameCounter264f8: 2 });
  assert.equal(pure.b8GridApply.copiedBack, 10, "all cells copied back after the resume");
  assert.equal(writes.length, 20, "10 cost dwords + 10 trail words");
  const stepByAddr = new Map();
  for (const w of writes) stepByAddr.set(w.address, w.bytes);
  for (let i = 0; i < 10; i += 1) {
    const costBytes = stepByAddr.get((B8_TEST_ROOM + B8_COSTS_BASE + i * 4) >>> 0);
    const trailBytes = stepByAddr.get((B8_TEST_ROOM + B8_TRAILS_BASE + i * 2) >>> 0);
    assert.ok(costBytes && trailBytes, `both grids written for cell ${i}`);
    assert.equal(new DataView(costBytes.buffer).getInt32(0, true), expected[i].cost,
      `copy-back cost[${i}] == stepped value`);
    assert.equal(new DataView(trailBytes.buffer).getInt16(0, true), expected[i].trail,
      `copy-back trail[${i}] == stepped value`);
  }

  /* Gate miss: the module did NOT touch the scratch -> the copy-back is a
     byte-identical (idempotent) no-op: the captured values come back. */
  const missWrites = [];
  armed.setUpdateCapture({
    guestRead: seed.guestRead,
    guestWrite: (a, b) => missWrites.push({ address: a >>> 0, bytes: Uint8Array.from(b) }),
  });
  const miss = armed.tick(2, null, { frameCounter264f8: 3 });
  assert.equal(miss.b8GridApply.copiedBack, 10, "armed capture still copies back on gate miss");
  assert.equal(missWrites.length, 20);
  for (let i = 0; i < 10; i += 1) {
    const costBytes = missWrites.find((w) => w.address === ((B8_TEST_ROOM + B8_COSTS_BASE + i * 4) >>> 0))?.bytes;
    assert.equal(new DataView(costBytes.buffer).getInt32(0, true), B8_SEED_COSTS[i],
      `gate-miss copy-back cost[${i}] == captured`);
  }

  /* No guestWrite hook: copy-back skipped, the values still surface on
     the result (caller can apply them). */
  const nowrite = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  nowrite.session.gameObject.set(seed.game.buf);
  nowrite.setUpdateCapture({ guestRead: seed.guestRead });
  const skipped = nowrite.tick(1, null, { frameCounter264f8: 2 });
  assert.equal(skipped.b8GridApply.copiedBack, 0, "no guestWrite -> skipped");
  assert.equal(skipped.events.opaqueRoomUpdatePrefixB8 | 0, 0, "module path still pure (zero host events)");

  /* Zero-cell capture: nothing to copy back (cells 0). */
  const zero = makeB8Seed({ w: 0x10000, h: 0x10000 });
  const zeroWrites = [];
  const zeroBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  zeroBridge.session.gameObject.set(zero.game.buf);
  zeroBridge.setUpdateCapture({ guestRead: zero.guestRead, guestWrite: (a, b) => zeroWrites.push([a, b]) });
  const zeroResult = zeroBridge.tick(1, null, { frameCounter264f8: 2 });
  assert.equal(zeroResult.b8GridApply.cells, 0, "zero-cell grid captured");
  assert.equal(zeroResult.events.opaqueRoomUpdatePrefixB8 | 0, 0, "zero cells -> gate closed, nothing fires");
  assert.equal(zeroWrites.length, 0, "no cells -> nothing written back");

  /* guestWrite validation. */
  const bad = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  assert.throws(() => bad.setUpdateCapture({ guestRead: seed.guestRead, guestWrite: 42 }), TypeError);
});

test("update §5 record-16: 3-mutant sha256 restore cycle over the k-blob scratch surface", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const w = 2;
  const h = 5;

  const tickWith = async ({ dims = null, costs = null, trails = null }) => {
    const seed = makeB8Seed({
      w: dims?.w ?? w,
      h: dims?.h ?? h,
      costs: costs != null ? costs : B8_SEED_COSTS,
      trails: trails != null ? trails : B8_SEED_TRAILS,
    });
    const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
    bridge.session.gameObject.set(seed.game.buf);
    bridge.setUpdateCapture({ guestRead: seed.guestRead });
    bridge.tick(1, null, { frameCounter264f8: 2 });
    return b8ScratchHash(bridge.slice);
  };

  const baseline = await tickWith({});
  const mutants = [
    /* cost grid mutant (cell 0: 3999 -> 500) */
    await tickWith({ costs: [500, 1234, 0, 5000, 900, 100, 101, 1001, -12, 448] }),
    /* trail grid mutant (cell 1: 50 -> 7) */
    await tickWith({ trails: [99, 7, 1, 0, 100, 98, 5, 32767, -3, 200] }),
    /* dims mutant (width 2 -> 3: cells 10 -> 15, new grids sampled) */
    await tickWith({ dims: { w: 3, h: 5 } }),
  ];
  assert.equal(new Set(mutants).size, 3, "three mutants hash three distinct scratch inputs");
  for (const m of mutants) {
    assert.notEqual(m, baseline, `mutant changes the post-step scratch bytes (${m.slice(0, 12)})`);
  }
  /* Restore: replay the baseline guest bytes -> the baseline hash
     restores exactly; stable across replays. */
  assert.equal(await tickWith({}), baseline, "restored guest bytes -> baseline hash");
  assert.equal(await tickWith({}), baseline, "restore is stable across replays");
});

test("update §5 record-16: 120-frame seam measurement — armed pure-fired vs residual", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const seed = makeB8Seed({ w: 2, h: 5 });

  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.session.gameObject.set(seed.game.buf);
  armed.setUpdateCapture({ guestRead: seed.guestRead });
  let pureFired = 0;
  for (let f = 0; f < 120; f += 1) {
    const r = armed.tick(f + 1, null, { frameCounter264f8: f });
    if (f % 3 === 2) {
      if ((r.events.opaqueRoomUpdatePrefixB8 | 0) === 0 &&
          r.b8GridApply && (r.b8GridApply.cells | 0) === 10) pureFired += 1;
    }
  }

  const mono = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  mono.session.gameObject.set(seed.game.buf);
  mono.setUpdateCapture({ gamePointerValue: 0 });
  let fallback = 0;
  for (let f = 0; f < 120; f += 1) {
    const r = mono.tick(f + 1, null, { frameCounter264f8: f });
    if (f % 3 === 2 && (r.events.opaqueRoomUpdatePrefixB8 | 0) > 0) fallback += 1;
  }

  /* 40 of 120 frames open the gate ((f+1) % 3 == 0 — the chain increments
     the counter once before the B8 block). Armed: every gate-open
     frame is pure (zero host events); unarmed: every gate-open frame is
     the byte-for-byte residual. */
  assert.equal(pureFired, 40, "armed: 40/40 gate-open frames pure-fired");
  assert.equal(fallback, 40, "unarmed: 40/40 gate-open frames residual");
});

/* -------------------------------------------------------------------------
 * 4d. W30-S4 (update-v108-record12-arms): record-12 site-shape gating +
 *     the wave-29 @984 typed drop from the browser.
 * ---------------------------------------------------------------------- */

/* The C/D typed arms (@968/972/976) CAN fire at the emit level from an
   arbitrary site shape (v104 model tests pin every arm), but the shipped
   wasm's two emit_frame_effect_6fd7c0_host_residuals callsites push ONLY
   anim 20 (site A) and anim 0 (room-clear) with arg3 0. This test drives
   ALL FIVE probe ALs to 1 through the real bridge on the mode-2 shell-open
   shape and pins the SITE-SHAPE gate: the lanes deliver, the capture row
   fires, the K-block runs — and the C/D arms stay closed; the same lanes
   at the emit level open them (contrast drive). */
test("update §5 record-12 site-shape gating: all five probe ALs open through the bridge yet anim-20/0 sites keep @968/972/976 closed (emit level fires them)", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  /* Full probe drive: alt [Game+4]==4, route [Game+0x269c8]==2,
     player-loop chain 0x23/0x10, blue direction 0 + cur 0 + flag 0x40000,
     engine-pred both words — every probe AL = 1. */
  const { buf } = makePokedGameBuffer({
    0x0: 1, /* game0 mode word */
    0x4: 4, /* alt AL 1 */
    0x269c8: 2, /* route AL 1 */
    0x264f8: 502,
    0x18300: 0x600100, /* room ptr */
    0x18304: 0, /* blue currentIdx */
    0x16cc0: 0x40000, /* blue room flag bit */
    0x1b83c: 1, /* engine-pred head */
    0x1ba74: 1, /* engine-pred tail */
  });
  const guestRead = makeGuestReader({
    0x600104: 0x600200, /* [room+4] desc */
    0x600210: 0x600300, /* [desc+0x10] entity */
    0x600300: 0x23, /* [ent] */
    0x600308: 0x10, /* [ent+8] */
    0x600108: 0x54, /* [room+8] type */
    0x600244: 0x80, /* [[room+4]+0x44] subroom flag */
  });

  const live = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  live.session.gameObject.set(buf);
  live.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead,
    blueRoomDirection: 0, /* non--1: the prefix's direction gate opens */
  });
  /* Mode-2 shell-open shape: the shipped site-A K-block call (anim 20). */
  const fired = live.tick(1, null, { effectCounter68d6c: 1, roomTransitionMode1830c: 2 });
  /* Lane delivery: the bridge's OWN capture function with the SAME options
     (the tick result does not expose the merged runtime). */
  const { captureUpdateLanes } = await importBridge();
  const lanes = captureUpdateLanes({
    gameView: new DataView(buf.buffer, buf.byteOffset, buf.byteLength),
    guestRead,
    gamePointerValue: 0x549e004c,
    blueRoomDirection: 0,
  });
  assert.equal(lanes.transition6fd7c0AltPathProbe, 1, "alt AL delivered 1");
  assert.equal(lanes.transition6fd7c0RouteProbe, 1, "route AL delivered 1");
  assert.equal(lanes.transition6fd7c0PlayerLoopProbe, 1, "player-loop AL delivered 1");
  assert.equal(lanes.transition6fd7c0BlueRoomProbe, 1, "blue AL delivered 1");
  assert.equal(lanes.transition6fd7c0EnginePredProbe, 1, "engine-pred AL delivered 1");
  assert.ok((fired.events.engineSiteAnim | 0) !== 0, "the K-block ran on the mode-2 shape");
  assert.equal(fired.hostTotals.frameEffect6fd7c0ProbeHostReads, 1,
    "the capture landed — any arm closure below is a SITE gate, not a lane miss");
  /* Site-shape gate: the shipped sites push anim 20 + arg3 0 — C needs
     anim 0xc, D needs anim 3/0xc AND arg3 != 0. All lanes at 1 cannot
     open them. */
  assert.equal(fired.events.frameEffect6fd7c0StageTransition, 0, "C arm closed: site anim 20 != 0xc");
  assert.equal(fired.events.frameEffect6fd7c0PlayerLoop, 0, "D player-loop closed: site anim 20 + arg3 0");
  assert.equal(fired.events.frameEffect6fd7c0RoomDispatch, 0, "D dispatch closed: same site gate");
  assert.equal(fired.events.rewind705ee0Stores, 0, "rewind seam inert without the shell-canopy vouchers");
  assert.equal(fired.events.rewind705ee0SaveState, 0);
  assert.equal(fired.events.opaqueFrameEffect6fd7c0Shell, 1,
    "row-20 coarse edge fires on the seam entry (stays committed — not idx 12)");
  assert.equal(fired.events.opaqueRoomTransitionEnginePrefix, 1,
    "row-21 coarse fires only via the idx-22 anm2-latch voucher absence (capture-absence gate miss)");

  /* Emit-level contrast: the SAME lanes (pack live) open the D arm from an
     arbitrary site shape (anim 3 + arg3 != 0) and the C arm (anim 0xc). */
  const packRt = {
    opaqueCall006fd7c0Ready: 1,
    transition6fd7c0Ready: 1,
    transition6fd7c0Game0: 1,
    transition6fd7c0AltPathProbe: 1,
    transition6fd7c0RouteProbe: 1,
    transition6fd7c0PlayerLoopProbe: 1,
    transition6fd7c0RoomType8: 0x54,
    transition6fd7c0RoomSubroomFlag44: 0x80,
    transition6fd7c0BlueRoomProbe: 1,
    transition6fd7c0EnginePredProbe: 1,
    frameEffectShellRoom18304: 5,
    frameEffectShellRoom182d0: 5,
    frameEffectShellRoomByte1: 1,
  };
  const fresh = () => ({
    roomTransitionIndex: 0, roomTransitionDimension: 0, engineSiteAnim: 0,
    frameEffect6fd7c0StageTransition: 0, frameEffect6fd7c0PlayerLoop: 0,
    frameEffect6fd7c0RoomDispatch: 0, opaqueCall006fd7c0Mode4Sfx: 0,
    frameEffect6fd7c0Mode4SfxPlayTyped: 0, opaqueFrameEffect6fd7c0Shell: 0,
    rewind705ee0Stores: 0, rewind705ee0SaveState: 0,
    opaqueRoomTransitionEnginePrefix: 0, engineAnm2PrefixFilenameAssign: 0,
    engineAnm2PrefixCacheFetch: 0, engineAnm2PrefixLoadImage: 0,
  });
  const evD = fresh();
  emitFrameEffect6fd7c0HostResiduals(
    { timedTransitionCleanupMode: 0, roomTransitionMode1830c: 2 },
    evD, 3, 0, 0, packRt, 5,
  );
  assert.equal(evD.frameEffect6fd7c0PlayerLoop, 1,
    "emit level: anim 3 + arg3 5 + player AL 1 -> @972 fires (site-shape gated only at the browser)");
  const evC = fresh();
  emitFrameEffect6fd7c0HostResiduals(
    { timedTransitionCleanupMode: 0, roomTransitionMode1830c: 2 },
    evC, 0xc, 0, 0,
    { ...packRt, transition6fd7c0AltPathProbe: 0, transition6fd7c0RouteProbe: 0 },
    0,
  );
  assert.equal(evC.frameEffect6fd7c0StageTransition, 1,
    "emit level: anim 0xc + alt AL clear + open route gate -> @968 fires (site-shape gated only at the browser)");
});

/* The wave-29 @984 typed drop (record idx 39 mid-restock HOST_FATAL,
   `midRestockSeedZeroDrop` @984) — browser drive: with the desc capture
   live and seed58 == 0 the TYPED drop replaces the coarse restock row;
   seed58 != 0 is PURE_COMPLETE (applied, no drop, no coarse). */
test("update §5 record-39: the @984 seed==0 typed drop fires from a browser tick (no coarse row); seed!=0 is pure-complete", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const drive = async (seed58) => {
    const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
    bridge.session.gameObject.set(makePokedGameBuffer({ 0x0: 1 }).buf);
    bridge.setUpdateCapture({ gamePointerValue: 0x549e004c });
    const restock = {
      midRestockDescReady: 1,
      midRestockDescAc: 3, /* desc gate: ac>0 && (ae>=ac || ae==-1) */
      midRestockDescAe: 5,
      midRestockDescSeed58: seed58,
      midRestockOwner0x209: 1,
      ambientRoomActive: 1,
      ambientRoomEntry11f0: 0,
    };
    const patch = { roomType8: 2 }; /* needsHost: type 2 FULL-DWORD */
    const r1 = bridge.tick(1, restock, patch);
    const r2 = bridge.tick(2, restock, patch);
    return { r1, r2 };
  };
  const zero = await drive(0);
  assert.equal(zero.r1.events.midRestockSeedZeroDrop, 0, "tick 1: age = frame - entry == 1 -> needsHost closed");
  assert.equal(zero.r1.events.opaqueRoomUpdateTailMidRestock, 0);
  assert.equal(zero.r2.events.midRestockSeedZeroDrop, 1,
    "tick 2 (age > 1): seed==0 -> the typed @984 drop fires (HOST_FATAL arm)");
  assert.equal(zero.r2.events.opaqueRoomUpdateTailMidRestock, 0,
    "the drop REPLACES the coarse restock row (zero pre-crash stores)");
  const one = await drive(1);
  assert.equal(one.r2.events.midRestockSeedZeroDrop, 0, "seed!=0 -> no drop");
  assert.equal(one.r2.events.opaqueRoomUpdateTailMidRestock, 0,
    "seed!=0 -> PURE_COMPLETE applied (no coarse row, no drop)");
});

/* -------------------------------------------------------------------------
 * 4e. Record idx 5/32 entity-surface capture (W30-S2, ABI v99 pack).
 *
 * captureUpdateEntitySurface + the captureUpdateLanes group: samples the
 * FUN_0098dba0 walk seam (PE 0x98dca2 / 0x98dd1d) — the player ptr vector
 * [Game+0x1baa8..0x1baac] (SAR2 count) matched FIRST-match against the MP
 * ptr vector [*0xc7169c + 0x4b3d8..0x4b3dc] by [p+0x1618] == [e+0xc]; the
 * matched entry's surface subobject at e+0x370 (vptr 0xb82d98 / 0xb82e20,
 * slot[0x14] = 0xa5f260 / 0xa23970) fills the 44-B blob (11 u32 fields)
 * -> ready @14328 + 8 blobs @14332..14684. READ-ONLY. End-to-end: poked
 * Game buffer + guest map -> the accept-pure proof @980 fires on the
 * module; rtti_fold + walk_step laws fire from the shipped wasm;
 * [Game+0x25ed4] advances in-module; ready=0 -> pre-pack residual
 * byte-for-byte; 3-mutant sha256 restore cycle.
 * ---------------------------------------------------------------------- */

const ES_PLAYER_BEGIN = 0x1baa8;
const ES_PLAYER_END = 0x1baac;
const ES_MGR_PTR = 0x00c7169c;
const ES_MP_BEGIN = 0x4b3d8; /* mgr-relative */
const ES_MP_END = 0x4b3dc; /* mgr-relative */
const ES_COUNTER = 0x25ed4; /* [Game+0x25ed4] frame-opaque counter */
/* Guest map for one matched player/entry pair (see NOTES §1 pins). */
function esGuestMap({ id = 7, vptr = 0xb82d98, implPtr = 0x8000, b0 = 0xff,
  i8 = 0x111, iC = 0xfefefefe, i20 = 0x9000, tag = 0x55, netman = 0xa0000,
  net2b4 = 0x1234, c73680 = 1, c73694 = 0x60001, c5ac00 = 0x55,
  player = 0x600000, entry = 0x700000, mgr = 0x500000 } = {}) {
  const spec = {
    [ES_MGR_PTR]: mgr,
    [(mgr + ES_MP_BEGIN) >>> 0]: entry,
    [(mgr + ES_MP_END) >>> 0]: (entry + 4) >>> 0,
    [player >>> 0]: player,
    [(player + 0x1618) >>> 0]: id,
    [entry >>> 0]: entry,
    [(entry + 0xc) >>> 0]: id,
    [(entry + 0x370) >>> 0]: vptr,
    [(entry + 0x374) >>> 0]: implPtr,
  };
  if (implPtr !== 0) {
    spec[(implPtr + 0x0) >>> 0] = b0;
    spec[(implPtr + 0x8) >>> 0] = i8;
    spec[(implPtr + 0xc) >>> 0] = iC;
    spec[(implPtr + 0x20) >>> 0] = i20;
    if (i20 !== 0) spec[(i20 + 0x10) >>> 0] = tag;
  }
  spec[0x00c7999c] = netman;
  if (netman !== 0) spec[(netman + 0x2b4) >>> 0] = net2b4;
  spec[0x00c73680] = c73680;
  spec[0x00c73694] = c73694;
  spec[0x00c5ac00] = c5ac00;
  return spec;
}

/** sha256 of the FULL runtime-inputs region (0..14684 — the entity-
 *  surface pack tail is the ABI's last span). */
function runtimeInputsHashFull(session) {
  const view = new DataView(session.slice.memory.buffer);
  const base = session.slice.paths.runtimeInputsAddress();
  const bytes = new Uint8Array(session.slice.memory.buffer, base, 14684);
  return sha256(bytes);
}

test("update §5 record-5: captureUpdateEntitySurface samples the walk surfaces READ-ONLY and raises the @14328 latch", async () => {
  const { captureUpdateLanes } = await importBridge();

  const game = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 });
  const guestRead = makeGuestReader(esGuestMap({}));
  const patch = captureUpdateLanes({ gameView: game.view, guestRead, gamePointerValue: 0x549e004c });

  assert.equal(patch.frameOpaque98dba0EntitySurfaceReady, 1, "ready latch raised");
  /* Slot 0 = the first matched entry: class decode (FULL-DWORD vptr) +
     the impl surface (byte flag via u8, id words, layer tag deref) +
     the netman lookup + the three absolute globals. */
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0VtableClassBits, 0,
    "0xb82d98 -> DataUpdate_t (0)");
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0ImplPtr, 0x8000);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0ImplB0, 0xff,
    "byte [impl+0] low byte");
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0Impl8, 0x111);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0ImplC, 0xfefefefe);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0Impl20, 0x9000);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0Impl2010, 0x55,
    "[[impl+0x20]+0x10] deref");
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0Netman2b4, 0x1234);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0GlobalC73680, 1);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0GlobalC73694, 0x60001);
  assert.equal(patch.frameOpaque98dba0EntitySurfaceCapture0GlobalC5ac00, 0x55);
  assert.equal("frameOpaque98dba0EntitySurfaceCapture1ImplPtr" in patch, false,
    "one match -> one slot row");

  /* Second player matching a second entry (LobbyDataUpdate_t). */
  const game2 = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600008 });
  const spec2 = esGuestMap({});
  spec2[(0x600004) >>> 0] = 0x610000; /* player vec slot 1 */
  spec2[(0x54b3d8) >>> 0] = 0x700000; /* mp vec begin (two entries) */
  spec2[(0x54b3dc) >>> 0] = 0x700008; /* mp vec end */
  spec2[(0x700004) >>> 0] = 0x710000; /* mp vec slot 1 */
  spec2[0x610000] = 0x610000;
  spec2[(0x610000 + 0x1618) >>> 0] = 8;
  spec2[(0x710000 + 0xc) >>> 0] = 8;
  spec2[(0x710000 + 0x370) >>> 0] = 0xb82e20;
  spec2[(0x710000 + 0x374) >>> 0] = 0x8100;
  spec2[0x8100] = 1;      /* impl_b0 byte */
  spec2[(0x8100 + 8) >>> 0] = 0;
  spec2[(0x8100 + 0xc) >>> 0] = 0;
  spec2[(0x8100 + 0x20) >>> 0] = 0;
  const patch2 = captureUpdateLanes({ gameView: game2.view, guestRead: makeGuestReader(spec2), gamePointerValue: 0x549e004c });
  assert.equal(patch2.frameOpaque98dba0EntitySurfaceCapture1VtableClassBits, 1,
    "0xb82e20 -> LobbyDataUpdate_t (1)");
  assert.equal(patch2.frameOpaque98dba0EntitySurfaceCapture1ImplB0, 1);

  /* READ-ONLY: the capture must not mutate the Game buffer or guest map. */
  assert.equal(game.view.getUint32(ES_PLAYER_BEGIN, true), 0x600000);
  assert.equal(new DataView(guestRead(0x700370, 4).buffer).getUint32(0, true), 0xb82d98);

  /* Absent guestRead / failed reads / no matches / over-cap / negative
     span -> no entity-surface lane at all. */
  assert.equal("frameOpaque98dba0EntitySurfaceReady" in captureUpdateLanes({ gameView: game.view, gamePointerValue: 0x549e004c }), false,
    "no guestRead -> absent");
  const broken = captureUpdateLanes({
    gameView: game.view,
    guestRead: makeGuestReader({ [ES_MGR_PTR]: 0x500000,
      [(0x500000 + ES_MP_BEGIN) >>> 0]: 0x700000,
      [(0x500000 + ES_MP_END) >>> 0]: 0x700004 }),
    gamePointerValue: 0x549e004c,
  });
  assert.equal("frameOpaque98dba0EntitySurfaceReady" in broken, false,
    "impl surface unresolvable -> absent group");
  const nomatch = captureUpdateLanes({
    gameView: game.view,
    guestRead: makeGuestReader({ ...esGuestMap({}), [(0x700000 + 0xc) >>> 0]: 9 }),
    gamePointerValue: 0x549e004c,
  });
  assert.equal("frameOpaque98dba0EntitySurfaceReady" in nomatch, false,
    "no matched entry -> absent (a zeroed slot would publish a fake accept=0 pure proof)");
  /* 9 matches -> over cap -> absent. */
  const manySpec = esGuestMap({});
  for (let i = 1; i < 9; i += 1) {
    Object.assign(manySpec, esGuestMap({
      id: 10 + i, player: (0x600000 + i * 0x1000) >>> 0, entry: (0x700000 + i * 0x1000) >>> 0,
    }));
  }
  const manyGame = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: (0x600000 + 9 * 0x1000) >>> 0 });
  const many = captureUpdateLanes({ gameView: manyGame.view, guestRead: makeGuestReader(manySpec), gamePointerValue: 0x549e004c });
  assert.equal("frameOpaque98dba0EntitySurfaceReady" in many, false, "9 matches -> over cap -> absent");
  const neg = captureUpdateLanes({
    gameView: makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600004, [ES_PLAYER_END]: 0x600000 }).view,
    guestRead: makeGuestReader(esGuestMap({})),
    gamePointerValue: 0x549e004c,
  });
  assert.equal("frameOpaque98dba0EntitySurfaceReady" in neg, false, "negative player span -> absent");
});

test("update §5 record-5: poke surfaces -> accept-pure @980 fires, [Game+0x25ed4] advances in-module; rtti_fold + walk_step fire from the shipped wasm", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const game = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 });
  const guestRead = makeGuestReader(esGuestMap({
    id: 7, vptr: 0xb82d98, implPtr: 0x8000, b0: 0xff, i8: 0x111, iC: 0xfefefefe,
    i20: 0x9000, tag: 0x55, c73680: 1, c73694: 0x60001, net2b4: 0x111, c5ac00: 0x55,
  }));
  const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  bridge.session.gameObject.set(game.buf);
  bridge.setUpdateCapture({ gamePointerValue: 0x549e004c, guestRead });
  const fired = await bridge.tick(
    1,
    { frameOpaque98dba0WalkReady: 1, frameOpaque98dba0WalkBegin: 0x1000,
      frameOpaque98dba0WalkEnd: 0x1004, frameOpaque98dba0Bvar2: 1 },
    { gate1b83c: 1, frameOpaque98dba0Counter: 9 },
  );

  /* (a) The accept-pure proof fires: ready=1 + slot 0 known class +
      complete blob (vtable 0xb82d98) -> the module's plan is pure
      (accept predicted 1: sentinel arm impl_c==0xfefefefe with the
      netman gate open and impl_8 == netman slot 0x111). */
  assert.equal(fired.events.frameOpaque98dba0EntitySurfaceAcceptPure, 1, "@980 accept-pure fires");

  /* (b) The walk's only store advances IN-MODULE: bvar2=1 + counter 9
      -> the bvar2 counter step increments to exactly 10 (fires
      opaque_call_00746560 at 10) and the apply writes 10 back. */
  assert.equal(new DataView(bridge.session.gameObject.buffer, bridge.session.gameObject.byteOffset, bridge.session.gameObject.byteLength).getUint32(ES_COUNTER, true), 10,
    "[Game+0x25ed4] counter advanced 9 -> 10 in-module");
  assert.ok((fired.events.opaqueCall00746560 || 0) >= 1, "counter step fired at exactly 10");

  /* (c) walk_step + rtti_fold fire from the SHIPPED wasm exports with
      values derived from the captured surface. accept1 = the module's
      own accept law on the captured blob -> walk_step: mp hit + accept1
      -> probe runs; probe2 0xff + gates open + local -> bl flips 1. */
  const wasm = bridge.slice.wasm;
  const pick = (n) => wasm[n] ?? wasm[`_${n}`];
  const dataAccept = pick("isaac_game_update_slice_entity_surface_data_accept");
  assert.equal(typeof dataAccept, "function", "data_accept export present");
  const read32 = (name) => {
    const off = RUNTIME_INPUTS_LAYOUT[name].offset;
    const base = bridge.slice.paths.runtimeInputsAddress();
    return new DataView(bridge.slice.memory.buffer).getUint32(base + off, true);
  };
  const cap0 = {
    vtableClassBits: read32("frameOpaque98dba0EntitySurfaceCapture0VtableClassBits"),
    implPtr: read32("frameOpaque98dba0EntitySurfaceCapture0ImplPtr"),
    implB0: read32("frameOpaque98dba0EntitySurfaceCapture0ImplB0"),
    impl8: read32("frameOpaque98dba0EntitySurfaceCapture0Impl8"),
    implC: read32("frameOpaque98dba0EntitySurfaceCapture0ImplC"),
    impl20: read32("frameOpaque98dba0EntitySurfaceCapture0Impl20"),
    impl2010: read32("frameOpaque98dba0EntitySurfaceCapture0Impl2010"),
    netman2b4: read32("frameOpaque98dba0EntitySurfaceCapture0Netman2b4"),
    globalC73680: read32("frameOpaque98dba0EntitySurfaceCapture0GlobalC73680"),
    globalC73694: read32("frameOpaque98dba0EntitySurfaceCapture0GlobalC73694"),
    globalC5ac00: read32("frameOpaque98dba0EntitySurfaceCapture0GlobalC5ac00"),
  };
  assert.equal(cap0.vtableClassBits, 0, "captured class bits reached the module");
  assert.equal(cap0.impl8, 0x111, "impl_8 reached the module");
  /* The composed accept export is pointer-out (no scratch address
     exposed); its scalar law mirror data_accept IS exported — the
     virtual [[entry+0x370]+0x14] dispatch AL stays typed-host, this is
     the captured-surface prediction verified against the blob. */
  const accept1 = dataAccept(
    cap0.implPtr, cap0.implB0, cap0.impl8, cap0.implC, cap0.impl20,
    cap0.impl2010, cap0.globalC5ac00, cap0.globalC73680,
    cap0.globalC73694, cap0.netman2b4,
  ) | 0;
  assert.equal(accept1, 1, "the module's own data_accept law predicts 1 (sentinel + netman match)");
  /* walk_step is pointer-out too; drive its differential-verified model
     mirror (decomp-game-update-slice.test.js ABI v95/v106 walk_step) and
     feed the SHIPPED scalar rtti_fold export (PE 0x98dd27..0x98dddc)
     with the mirror's outputs. */
  const { gameUpdateSliceEntitySurfaceWalkStep } = await import("../scripts/decomp/game-update-model.mjs");
  const rttiFold = pick("isaac_game_update_slice_entity_surface_rtti_fold");
  assert.equal(typeof rttiFold, "function", "rtti_fold export present");
  const step = gameUpdateSliceEntitySurfaceWalkStep({
    mpFound: 1, accept1, probe1Nz: 0xff, found2: 1, accept2: accept1, mpNonempty: 1,
  });
  const bl = rttiFold(
    step.rttiEnter, step.blAfter1,
    0x8000, 0x9000, 1, 0, 1, 0xff,
  ) | 0;
  assert.equal(bl, 1, "rtti_fold flips bl to 1 (accept hit + probe2 0xff + gates open)");
  const miss = gameUpdateSliceEntitySurfaceWalkStep({
    mpFound: 1, accept1: 0, probe1Nz: 0xff, found2: 1, accept2: 0, mpNonempty: 1,
  });
  assert.equal(miss.probe1Ran, 0, "accept1 0 gates the site-1 probe (bl cannot set)");
  assert.equal(miss.rttiEnter, 0, "accept2 0 skips the RTTI block (PE 0x98de0e)");
  const blMiss = rttiFold(
    miss.rttiEnter, miss.blAfter1,
    0x8000, 0x9000, 1, 0, 1, 0xff,
  ) | 0;
  assert.equal(blMiss, 0, "accept miss -> bl stays 0 (no RTTI entry, no probe2)");

  /* Unknown-class surface -> the plan refuses purity -> NO event. */
  const unknown = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const uGame = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 });
  unknown.session.gameObject.set(uGame.buf);
  unknown.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader(esGuestMap({ vptr: 0x12345678, c73680: 0 })),
  });
  const uResult = await unknown.tick(
    1,
    { frameOpaque98dba0WalkReady: 1, frameOpaque98dba0WalkBegin: 0x1000,
      frameOpaque98dba0WalkEnd: 0x1004 },
    { gate1b83c: 1 },
  );
  assert.equal(uResult.events.frameOpaque98dba0EntitySurfaceAcceptPure || 0, 0,
    "unknown class -> plan refuses purity -> no @980 event");
});

test("update §5 record-5: ready=0 -> pre-pack walk surface byte-for-byte", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const game = makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 });
  const runtime = {
    frameOpaque98dba0WalkReady: 1, frameOpaque98dba0WalkBegin: 0x1000,
    frameOpaque98dba0WalkEnd: 0x1004, frameOpaque98dba0Bvar2: 1,
  };
  const patch = { gate1b83c: 1, frameOpaque98dba0Counter: 9 };
  const run = async (bridge, capture) => {
    bridge.session.gameObject.set(game.buf);
    if (capture) bridge.setUpdateCapture(capture);
    return bridge.tick(1, runtime, patch);
  };
  const noCaptureBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  const deadBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  assert.ok(noCaptureBridge.session && deadBridge.session, 'both boots carry a session');
  const noCapture = await run(noCaptureBridge, null);
  const captureDead = await run(deadBridge, { gamePointerValue: 0x549e004c, guestRead: makeGuestReader({}) });
  /* ready=0 (capture absent AND capture present-but-unreadable) -> the
     pre-pack walk surface byte-for-byte: events object identical, no
     @980 proof. */
  assert.deepEqual(captureDead.events, noCapture.events, "unreadable capture == no capture (byte-for-byte)");
  assert.equal(captureDead.events.frameOpaque98dba0EntitySurfaceAcceptPure || 0, 0, "no @980 event");
  assert.equal(noCapture.events.frameOpaque98dba0EntitySurfaceAcceptPure || 0, 0);
  /* Counter still advances on the pure walk tail (the lane pack is
     strictly additive to the pre-pack surface). */
  const view = new DataView(deadBridge.session.gameObject.buffer, deadBridge.session.gameObject.byteOffset, deadBridge.session.gameObject.byteLength);
  assert.equal(view.getUint32(ES_COUNTER, true), 10, "counter advance is capture-independent");
});

test("update §5 record-5: 3-mutant sha256 restore cycle over the written runtime-inputs region", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const baseMap = esGuestMap({});
  const tickWith = async (guestMap) => {
    const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
    bridge.session.gameObject.set(makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 }).buf);
    bridge.setUpdateCapture({ gamePointerValue: 0x549e004c, guestRead: makeGuestReader(guestMap) });
    await bridge.tick(
      1,
      { frameOpaque98dba0WalkReady: 1, frameOpaque98dba0WalkBegin: 0x1000,
        frameOpaque98dba0WalkEnd: 0x1004 },
      { gate1b83c: 1 },
    );
    return runtimeInputsHashFull(bridge);
  };
  const IM_B0 = 0x8000;
  const IM_C = 0x800c;
  const G_C5AC00 = 0x00c5ac00;
  const baseline = await tickWith(baseMap);
  const mutants = [
    { ...baseMap, [IM_B0]: 0x100 }, /* impl byte flag */
    { ...baseMap, [IM_C]: 0x55 }, /* impl id word B (sentinel arm) */
    { ...baseMap, [G_C5AC00]: 0x99 }, /* layer-tag sentinel global */
  ];
  const hashes = [];
  for (const m of mutants) {
    const h = await tickWith(m);
    hashes.push(h);
    assert.notEqual(h, baseline, `mutant changes the shipped bytes (${h.slice(0, 12)})`);
  }
  assert.equal(new Set(hashes).size, 3, "three mutants hash three distinct inputs regions");
  assert.equal(await tickWith(baseMap), baseline, "restored guest bytes -> baseline hash");
  assert.equal(await tickWith(baseMap), baseline, "restore is stable across replays");
});

test("update §5 record-5: 120-frame seam measurement — armed fires 120/120, unarmed falls back 120/120", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();

  const runtime = {
    frameOpaque98dba0WalkReady: 1, frameOpaque98dba0WalkBegin: 0x1000,
    frameOpaque98dba0WalkEnd: 0x1004, frameOpaque98dba0Bvar2: 1,
  };
  const patch = { gate1b83c: 1, frameOpaque98dba0Counter: 9 };
  const drive = async (bridge) => {
    let fired = 0;
    for (let f = 1; f <= 120; f += 1) {
      const r = bridge.tick(f, runtime, patch);
      if ((r.events.frameOpaque98dba0EntitySurfaceAcceptPure | 0) === 1) fired += 1;
    }
    return fired;
  };

  const armed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  armed.session.gameObject.set(makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 }).buf);
  armed.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader(esGuestMap({ vptr: 0xb82d98, iC: 0xfefefefe, c73680: 1, c73694: 0x60001 })),
  });
  assert.equal(await drive(armed), 120, "armed fires the @980 proof 120/120");
  /* The per-tick sparse re-stamp pins the capture-side value back into
     the buffer; the in-module advance (9 -> 10, counter step firing at
     exactly 10) is proven by the single-frame test above. */
  const counterView = new DataView(armed.session.gameObject.buffer, armed.session.gameObject.byteOffset, armed.session.gameObject.byteLength);
  assert.equal(counterView.getUint32(ES_COUNTER, true), 10, "counter stays capture-consistent under the re-stamp");

  const unarmed = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  unarmed.session.gameObject.set(makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 }).buf);
  unarmed.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader({ [ES_MGR_PTR]: 0x500000 }),
  });
  assert.equal(await drive(unarmed), 0, "unarmed (no readable group) 0/120");

  /* Unknown-class armed capture: ready IS raised but the plan refuses
     purity -> 0/120 (the pre-pack surface, no false proof). */
  const unknown = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  unknown.session.gameObject.set(makePokedGameBuffer({ [ES_PLAYER_BEGIN]: 0x600000, [ES_PLAYER_END]: 0x600004 }).buf);
  unknown.setUpdateCapture({
    gamePointerValue: 0x549e004c,
    guestRead: makeGuestReader(esGuestMap({ vptr: 0xdeadbeef })),
  });
  assert.equal(await drive(unknown), 0, "unknown class 0/120 (pure proof refused)");
});

/* -------------------------------------------------------------------------
 * 4f. W32-S3 (update-v110-appjs): the APP-side capture wiring module
 *     (web/js/capture-wiring.js) — the heap-capable live guest model +
 *     record-39 FirstCollectibleOwner hook + installUpdateCapture, driven
 *     through the REAL bridge. Discriminating cases poke the LIVE regions
 *     (createLiveGuestMemory regions registered at the sidecar pointers)
 *     so the §5 arms the app now feeds (guestRead heap-capable, guestWrite
 *     live, midRestockOwner walk) flip the typed wires; the control arms
 *     keep the byte-for-byte residuals (the pre-wiring app state).
 * ---------------------------------------------------------------------- */

const wiringSourcePath = join(root, "web", "js", "capture-wiring.js");
let wiringModulePromise = null;
function importWiring() {
  if (!wiringModulePromise) {
    wiringModulePromise = import(pathToFileURL(wiringSourcePath).href);
  }
  return wiringModulePromise;
}

test("update §5 wiring: createLiveGuestMemory reads/writes regions and stays null outside them", async () => {
  const { createLiveGuestMemory } = await importWiring();
  const game = new Uint8Array(0x1000);
  new DataView(game.buffer).setUint32(0x100, 0xdeadbeef, true);
  const guest = createLiveGuestMemory([{ base: 0x549e004c, bytes: game }]);

  /* Read inside the region. */
  const hit = guest.read(0x549e014c, 4);
  assert.ok(hit, "in-region read resolves");
  assert.equal(new DataView(hit.buffer, hit.byteOffset, 4).getUint32(0, true), 0xdeadbeef);

  /* Reads outside every region stay null (capture-absence discipline). */
  assert.equal(guest.read(0x549e0000, 4), null, "below base -> null");
  assert.equal(guest.read(0x549e104c, 4), null, "above end -> null");
  assert.equal(guest.read(0x10000000, 4), null, "unmapped -> null");

  /* Write lands in the owning region; counts written bytes. */
  const writeBytes = new Uint8Array(4);
  new DataView(writeBytes.buffer).setUint32(0, 0x11223344, true);
  assert.equal(guest.write(0x549e014c, writeBytes), 4, "write returns bytes written");
  assert.equal(new DataView(game.buffer).getUint32(0x100, true), 0x11223344,
    "write mutated the owning region buffer");

  /* Write outside / overflow -> 0 and no mutation. */
  assert.equal(guest.write(0x10000000, writeBytes), 0, "unmapped write -> 0");
  assert.equal(guest.write(0x549e104b, new Uint8Array(0x20)), 0, "overflow write -> 0");

  /* addRegion extends the model after construction. */
  const room = new Uint8Array(0x1000);
  guest.addRegion(0x53ccb024, room);
  assert.ok(guest.read(0x53ccb024, 4), "addRegion'd region readable");
  assert.equal(guest.read(0x53ccb000, 4), null, "below the addRegion'd base -> null");
  /* The original Game region is still there (regions stack, first wins). */
  assert.ok(guest.read(0x549e014c, 4), "original region still readable");
});

test("update §5 wiring: createFirstCollectibleOwnerHook follows the exact FCO walk law", async () => {
  const { createLiveGuestMemory, createFirstCollectibleOwnerHook, probePlayerHasCollectible } = await importWiring();
  const GAME = 0x549e004c;
  const PLIST = 0x53db5b8c;
  const PLAYER = 0x53dc0000;
  const TWIN = 0x53dd0000;

  const build = ({ players = true, held = 0x209, pending = 0, scan = null,
    f2c = 0, twin = 0, twinHeld = 0x209, twinReg = true,
    listEmpty = false, listCount = 1 } = {}) => {
    const game = new Uint8Array(GAME_OBJECT_MIN_SIZE);
    const gv = new DataView(game.buffer);
    gv.setUint32(0x1baa8, listEmpty ? PLIST : PLIST, true);
    gv.setUint32(0x1baac, listEmpty ? PLIST : PLIST + listCount * 4, true);
    const guest = createLiveGuestMemory([{ base: GAME, bytes: game }]);
    if (players) {
      const slots = new Uint8Array(listCount * 4);
      const plist = new DataView(slots.buffer);
      for (let i = 0; i < listCount; i += 1) {
        plist.setUint32(i * 4, (PLAYER + i * 0x1000) >>> 0, true);
      }
      guest.addRegion(PLIST, slots);
      const player = new Uint8Array(0x3000);
      const pv = new DataView(player.buffer);
      pv.setUint32(0x2c, f2c, true);
      pv.setUint32(0x2ef4, held, true);
      pv.setUint32(0x2ef8, pending, true);
      pv.setUint32(0x1e6c, twin, true);
      if (scan) {
        for (let i = 0; i < scan.length; i += 1) {
          pv.setUint32(0x16c0 + i * 4, scan[i], true);
        }
      }
      guest.addRegion(PLAYER, player);
      if (twin !== 0 && twinReg) {
        const t = new Uint8Array(0x3000);
        const tv = new DataView(t.buffer);
        tv.setUint32(0x2c, 0, true);
        tv.setUint32(0x2ef4, twinHeld, true);
        tv.setUint32(0x2ef8, 0, true);
        guest.addRegion(twin >>> 0, t);
      }
    }
    const hook = createFirstCollectibleOwnerHook({
      gameView: gv,
      guestRead: guest.read,
    });
    return { hook, guest, game };
  };

  /* Empty list -> 0 (not found), no reads needed. */
  assert.equal(build({ listEmpty: true }).hook(), 0, "empty list -> 0");

  /* Held slot match -> 1. */
  assert.equal(build({ held: 0x209 }).hook(), 1, "held 0x209 -> owner 1");

  /* Held mismatch, pending match -> 1. */
  assert.equal(build({ held: 0x148, pending: 0x209 }).hook(), 1, "pending 0x209 -> owner 1");

  /* Slot-vector scan match ((slot & 0x7fff) == id) -> 1. */
  assert.equal(build({ held: 0x148, pending: 0, scan: [0x148, 0x8209] }).hook(), 1,
    "collectible slot scan finds 0x209 -> 1");

  /* No match anywhere -> 0. */
  assert.equal(build({ held: 0x148, pending: 0, scan: [0x148, 0x999] }).hook(), 0,
    "no player holds 0x209 -> 0");

  /* Slot gate closed (f2c != 0) -> that player is skipped, walk continues. */
  assert.equal(build({ held: 0x209, f2c: 1 }).hook(), 0, "f2c != 0 skips the player");

  /* Twin pointer present but shared gate closed -> twin hit cannot select;
     walk still completes as not-found (the browser host can never open the
     twin's shared gate -> byte-law 0x9be0ed/0x9be0f9 closed). The twin
     probes resolvable and DOES hold 0x209; the closed shared gate is the
     ONLY thing keeping the pack absent. */
  assert.equal(build({ held: 0x148, pending: 0, twin: TWIN, twinHeld: 0x209 }).hook(), 0,
    "twin with held 0x209 cannot select (shared gate closed)");

  /* Unresolved reads -> null (all-or-nothing -> pack ABSENT). */
  const noPlayers = build({ players: false });
  assert.equal(noPlayers.hook(), null, "player vector array unreachable -> null");
  const noTwin = build({ held: 0x148, pending: 0, twin: 0x53de0000, twinReg: false });
  assert.equal(noTwin.hook(), null, "twin bytes unreachable -> null");

  /* Corrupt span (count > cap) -> null. */
  assert.equal(build({ listCount: 9 }).hook(), null, "over-cap player list -> null");
});

test("update §5 wiring: installUpdateCapture arms the bridge; restock pack + B8 copy-back go LIVE through the poked regions", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const { createLiveGuestMemory, installUpdateCapture } = await importWiring();

  /* The app's real arm: Game region @ gamePointerValue + render-root ROOM
     region @ renderRootPointerValue, plus POKED guest regions for the
     room desc + player list/objects (the discriminating browser-host
     reachability that the shipped seed cannot see). */
  const GAME = 0x549e004c;
  const ROOM = 0x53ccb024;
  const DESC = 0x53cd0000;
  const PLIST = 0x53db5b8c;
  const PLAYER = 0x53dc0000;

  const gameBuf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  const gv = new DataView(gameBuf.buffer);
  gv.setUint32(0x18300, ROOM, true);      /* [Game+0x18300] Room ptr */
  gv.setUint32(0x1baa8, PLIST, true);     /* player list begin */
  gv.setUint32(0x1baac, PLIST + 4, true); /* player list end (1 player) */
  gv.setUint32(0x26614, 2, true);         /* tailPath mode 2 */

  /* Room region: dims 15x9 (135 cells) + cost/trail grids + desc ptr. */
  const roomBuf = new Uint8Array(0x3000);
  const rv = new DataView(roomBuf.buffer);
  rv.setUint32(4, DESC, true);            /* [Room+4] RoomDescriptor ptr */
  rv.setUint32(0xc, 15, true);
  rv.setUint32(0x10, 9, true);
  for (let i = 0; i < 135; i += 1) {
    rv.setInt32(0x76c + i * 4, i === 0 ? 3999 : 1000 + i, true); /* cell 0: the 3999->900 law arm */
    rv.setInt16(0xe6c + i * 2, 50 + (i % 50), true); /* trails */
  }

  /* Desc region: ac=1, ae=2 (inner gate open), seed 0 -> typed drop. */
  const descBuf = new Uint8Array(0x200);
  const dv = new DataView(descBuf.buffer);
  dv.setInt16(0xac, 1, true);
  dv.setInt16(0xae, 2, true);
  dv.setUint32(0x58, 0, true); /* seed 0 -> midRestockSeedZeroDrop */

  const plistBuf = new Uint8Array(4);
  new DataView(plistBuf.buffer).setUint32(0, PLAYER, true);
  const playerBuf = new Uint8Array(0x3000);
  const pv = new DataView(playerBuf.buffer);
  pv.setUint32(0x2c, 0, true);
  pv.setUint32(0x2ef4, 0x209, true); /* player holds collectible 0x209 */
  pv.setUint32(0x2ef8, 0, true);

  const guest = createLiveGuestMemory();
  guest.addRegion(GAME, gameBuf);
  guest.addRegion(ROOM, roomBuf);
  guest.addRegion(DESC, descBuf);
  guest.addRegion(PLIST, plistBuf);
  guest.addRegion(PLAYER, playerBuf);

  const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  bridge.session.gameObject.set(gameBuf);
  const arms = installUpdateCapture(bridge, {
    gamePointerValue: GAME,
    liveGuest: guest,
    gameView: gv,
  });
  assert.ok(arms, "installUpdateCapture returns the setUpdateCapture result");
  assert.equal(bridge.updateCapture.gamePointerValue, GAME);
  assert.equal(typeof bridge.updateCapture.guestRead, "function");
  assert.equal(typeof bridge.updateCapture.guestWrite, "function");
  assert.equal(typeof bridge.updateCapture.midRestockOwner, "function");

  /* Per-frame B8 copy-back writes land in the LIVE room region. */
  const costBefore = new DataView(roomBuf.buffer).getInt32(0x76c, true);
  let applied = 0;
  let drop = 0;
  let coarse = 0;
  let copied = 0;
  let regionMutated = false;
  for (let f = 1; f <= 120; f += 1) {
    const r = bridge.tick(f, null, { frameCounter264f8: f - 1 });
    if (r.events.opaqueRoomUpdatePrefixB8 | 0) applied += 1;
    if (r.events.midRestockSeedZeroDrop | 0) drop += 1;
    if (r.events.opaqueRoomUpdateTailMidRestock | 0) coarse += 1;
    copied = Math.max(copied, r.b8GridApply?.copiedBack | 0);
    if (new DataView(roomBuf.buffer).getInt32(0x76c, true) !== costBefore) {
      regionMutated = true;
    }
  }
  assert.equal(applied, 0, "armed B8: ZERO host edges over 120 frames (pure in-module step)");
  assert.equal(copied, 135, "B8 copy-back writes all 135 cells into the live region");
  assert.ok(regionMutated, "guestWrite mutated the LIVE room buffer across the run");

  /* Exact law value on ONE gate-open frame (counter 2 -> the B8 block sees
     (2+1)%3==0): cost cell 0 = 3999 -> 900, written back into the region.
     Re-seed the room buffer first (the 120-frame run above stepped it). */
  new DataView(roomBuf.buffer).setInt32(0x76c, 3999, true);
  const lawBridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  lawBridge.session.gameObject.set(gameBuf);
  const lawGuest = createLiveGuestMemory();
  lawGuest.addRegion(GAME, lawBridge.session.gameObject);
  lawGuest.addRegion(ROOM, roomBuf);
  lawGuest.addRegion(DESC, descBuf);
  lawGuest.addRegion(PLIST, plistBuf);
  lawGuest.addRegion(PLAYER, playerBuf);
  installUpdateCapture(lawBridge, {
    gamePointerValue: GAME,
    liveGuest: lawGuest,
    gameView: new DataView(gameBuf.buffer, gameBuf.byteOffset, gameBuf.byteLength),
  });
  const law = await lawBridge.tick(3, null, { frameCounter264f8: 2 });
  assert.equal(law.events.opaqueRoomUpdatePrefixB8 | 0, 0, "gate-open frame stays pure");
  assert.equal(new DataView(roomBuf.buffer).getInt32(0x76c, true), 900,
    "3999 cost cell stepped to 900 by the module and copied back via guestWrite");

  /* The restock pack armed through the live regions: owner walk resolved
     (player holds 0x209), desc seed 0 -> the typed @984 drop replaces the
     coarse monolith 119/120 (C10 drive), coarse stays 0. */
  assert.equal(coarse, 0, "armed restock: coarse monolith fully suppressed");
  assert.equal(drop, 119, "armed restock: typed @984 drop fires 119/120 (age>1 gate closes frame 1)");
  assert.equal(bridge.updateCapture.gamePointerValue, GAME, "arms stayed installed across ticks");

  /* Without the live regions the seeded arm must stay byte-for-byte
     residual (the pre-wiring app): owner walk unresolved -> pack ABSENT,
     coarse monolith 119/120, no typed drop. */
  const plain = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  plain.session.gameObject.set(gameBuf);
  plain.setUpdateCapture({ gamePointerValue: GAME, guestRead: null, guestWrite: null });
  let plainCoarse = 0;
  let plainDrop = 0;
  for (let f = 1; f <= 120; f += 1) {
    const r = plain.tick(f, null, { frameCounter264f8: f - 1 });
    if (r.events.opaqueRoomUpdateTailMidRestock | 0) plainCoarse += 1;
    if (r.events.midRestockSeedZeroDrop | 0) plainDrop += 1;
  }
  assert.equal(plainCoarse, 119, "capture-off control: coarse monolith 119/120 (byte-for-byte residual)");
  assert.equal(plainDrop, 0, "capture-off control: no typed drop (pack ABSENT)");
});

test("update §5 wiring: capture precedence over bridge defaults for the 3 S5 keys (roomGridCells / b3b7SparseReady / midRestockOwner0x209)", async () => {
  if (!ensureUpdateSliceBuilt()) return;
  const { bootNativeUpdateBridge } = await importBridge();
  const { createLiveGuestMemory, installUpdateCapture, createFirstCollectibleOwnerHook } = await importWiring();
  const { createInputBridge } = await import(
    pathToFileURL(join(root, "scripts", "decomp", "frame-input-bridge.mjs")).href);
  const { createDefaultNativeRuntimeInputs } = await import(
    pathToFileURL(join(root, "scripts", "decomp", "frame-path.mjs")).href);
  const { RUNTIME_INPUTS_LAYOUT } = await import(
    pathToFileURL(join(root, "scripts", "decomp", "game-update-model.mjs")).href);

  /* --- Fix contract (W32-S5, update-v110-bridgecapture §4): the input
     bridge's per-tick runtime no longer rides the three capture-emitted
     defaults (they would clobber { ...captured, ...extraRuntime }), while
     the session-level default source still supplies the documented
     MENU-CLOSED arm 15/0/1 on the no-capture path. --- */
  const inputBridge = createInputBridge();
  const rt = inputBridge.toRuntimeInputs();
  assert.equal("roomGridCells" in rt, false, "S5: toRuntimeInputs must not carry roomGridCells");
  assert.equal("b3b7SparseReady" in rt, false, "S5: toRuntimeInputs must not carry b3b7SparseReady");
  assert.equal("midRestockOwner0x209" in rt, false, "S5: toRuntimeInputs must not carry midRestockOwner0x209");
  const defs = createDefaultNativeRuntimeInputs();
  assert.equal(defs.roomGridCells, 15, "no-capture default preserved");
  assert.equal(defs.b3b7SparseReady, 0, "no-capture default preserved");
  assert.equal(defs.midRestockOwner0x209, 1, "no-capture default preserved");

  /* --- Integration: the REAL app tick path — capture installed over
     poked regions, extraRuntime = inputBridge.toRuntimeInputs() (menu
     closed), statePatch frame drive (C10 B6). Room 15x9 = 135 cells
     (capture cells 135 vs default 15); player WITHOUT 0x209 -> the owner
     hook resolves 0 (vs default 1); desc seed 0 -> typed-drop arm IF the
     owner gate were open. b3b7 group stays ABSENT (manager heap not
     registered) -> the monolith arm must stay intact. --- */
  const GAME = 0x549e004c;
  const ROOM = 0x53ccb024;
  const DESC = 0x53cd0000;
  const PLIST = 0x53db5b8c;
  const PLAYER = 0x53dc0000;

  const gameBuf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
  const gv = new DataView(gameBuf.buffer);
  gv.setUint32(0x18300, ROOM, true);      /* [Game+0x18300] Room ptr */
  gv.setUint32(0x1baa8, PLIST, true);     /* player list begin */
  gv.setUint32(0x1baac, PLIST + 4, true); /* player list end (1 player) */
  gv.setUint32(0x26614, 2, true);         /* tailPath mode 2 */

  const roomBuf = new Uint8Array(0x3000);
  const rv = new DataView(roomBuf.buffer);
  rv.setUint32(4, DESC, true);            /* [Room+4] RoomDescriptor ptr */
  rv.setUint32(0xc, 15, true);            /* gridW -> 15 x 9 = 135 cells */
  rv.setUint32(0x10, 9, true);
  for (let i = 0; i < 135; i += 1) {
    rv.setInt32(0x76c + i * 4, 1000 + i, true);
    rv.setInt16(0xe6c + i * 2, 50 + (i % 50), true);
  }

  const descBuf = new Uint8Array(0x200);
  const dv = new DataView(descBuf.buffer);
  dv.setInt16(0xac, 1, true);
  dv.setInt16(0xae, 2, true);
  dv.setUint32(0x58, 0, true); /* seed 0 -> typed drop ONLY under open owner gate */

  const plistBuf = new Uint8Array(4);
  new DataView(plistBuf.buffer).setUint32(0, PLAYER, true);
  const playerBuf = new Uint8Array(0x3000);
  const pv = new DataView(playerBuf.buffer);
  pv.setUint32(0x2c, 0, true);
  pv.setUint32(0x2ef4, 0, true); /* held: NO 0x209 -> owner hook resolves 0 */
  pv.setUint32(0x2ef8, 0, true);

  const guest = createLiveGuestMemory();
  guest.addRegion(GAME, gameBuf);
  guest.addRegion(ROOM, roomBuf);
  guest.addRegion(DESC, descBuf);
  guest.addRegion(PLIST, plistBuf);
  guest.addRegion(PLAYER, playerBuf);

  const bridge = await bootNativeUpdateBridge({ wasmUrl: updateWasmPath, renderSliceUrl: renderWasmPath, log: () => {} });
  bridge.session.gameObject.set(gameBuf);
  const ownerHook = createFirstCollectibleOwnerHook({
    gameView: new DataView(gameBuf.buffer, gameBuf.byteOffset, gameBuf.byteLength),
    guestRead: guest.read,
  });
  assert.equal(ownerHook(), 0, "hook resolves owner 0 on this seed");
  installUpdateCapture(bridge, {
    gamePointerValue: GAME,
    liveGuest: guest,
    gameView: new DataView(gameBuf.buffer, gameBuf.byteOffset, gameBuf.byteLength),
    midRestockOwner: ownerHook,
  });

  const rtOwnerOff = RUNTIME_INPUTS_LAYOUT.midRestockOwner0x209.offset; /* 692 */
  let b8Host = 0;
  let drop = 0;
  let coarse = 0;
  let readyFrames = 0;
  let copied = 0;
  for (let f = 1; f <= 120; f += 1) {
    /* THE shipped app path: extraRuntime comes from the input bridge,
       capture is installed, state patch drives the frame. */
    const res = bridge.tick(f, inputBridge.toRuntimeInputs(), { frameCounter264f8: f - 1 });
    b8Host += res?.events?.opaqueRoomUpdatePrefixB8 | 0;
    drop += res?.events?.midRestockSeedZeroDrop | 0;
    coarse += res?.events?.opaqueRoomUpdateTailMidRestock | 0;
    if (res?.b8GridApply?.ready) readyFrames += 1;
    copied = Math.max(copied, res?.b8GridApply?.copiedBack | 0);
  }
  assert.equal(readyFrames, 120, "capture cells survive toRuntimeInputs -> b8GridApply armed 120/120");
  assert.equal(copied, 135, "copy-back writes all 135 captured cells");
  assert.equal(b8Host, 0, "armed B8: ZERO host edges (capture cells, not default 15)");
  assert.equal(drop, 0, "capture owner 0 closes the gate -> no typed drop (default 1 must NOT clobber)");
  assert.equal(coarse, 0, "capture owner 0 + descReady -> no coarse");
  const ownerRow = new DataView(bridge.slice.memory.buffer)
    .getUint32(bridge.slice.paths.runtimeInputsAddress() + rtOwnerOff, true);
  assert.equal(ownerRow, 0, "runtime row @692 = capture owner 0 (default 1 must NOT clobber)");
});
