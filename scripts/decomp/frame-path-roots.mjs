/**
 * Multi-root frame-path registry for the native/Wasm decomp port.
 *
 * Conceptual roots match decomp/port-roots.json:
 *   Game::Update (wired live tick), Game::Render, Game::ProcessInput,
 *   Game::Exit, LuaEngine::{Init,RegisterClasses,RunBundledScript}.
 *
 * Two module kinds are catalogued (see FRAME_PATH_MODULE_KIND):
 *   PURE_HELPER_MODULES  — freestanding zero-import islands under
 *     output/decomp/<name>-pure/*.wasm (Render / ProcessInput / Exit /
 *     LuaEngine / companions). Loaded and held; individual functions called.
 *   ROOT_SLICE_MODULES   — full root translations with the Update-slice
 *     capture/step/resume/apply contract, driven per frame over a JS-owned
 *     sparse Game-object buffer. Game::Render (ABI from game-render-model.mjs)
 *     is driven by scripts/decomp/frame-render-root.mjs on the SAME buffer as
 *     the Update session.
 * Selecting native mode for an available module never routes through PE.
 *
 * This module does not import frame-path.mjs (avoids ESM cycles). String mode
 * values match FRAME_PATH_MODE in frame-path.mjs.
 */

import { ABI_VERSION } from "./game-update-model.mjs";
import {
  GAME_RENDER_SLICE_ABI_VERSION,
  GAME_RENDER_GAME_OBJECT_MIN_SIZE,
} from "./game-render-model.mjs";
import { RENDER_SHELL_PURE_ABI_VERSION } from "./render-shell-pure-model.mjs";
import { PROCESS_INPUT_PURE_ABI_VERSION } from "./process-input-pure-model.mjs";
import { EXIT_PURE_ABI_VERSION } from "./exit-pure-model.mjs";
import { LUA_ENGINE_PURE_ABI_VERSION } from "./lua-engine-pure-model.mjs";
import { ROOM_PURE_ABI_VERSION } from "./room-pure-model.mjs";
import { FRAME_OPAQUE_PURE_ABI_VERSION } from "./frame-opaque-pure-model.mjs";
import { FRAME_EFFECT_PURE_ABI_VERSION } from "./frame-effect-pure-model.mjs";
import { HUD_POST_UPDATE_PURE_ABI_VERSION } from "./hud-post-update-pure-model.mjs";
import { PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION } from "./playerhud-post-update-pure-model.mjs";
import { PM_UPDATE_PURE_ABI_VERSION } from "./player-manager-update-pure-model.mjs";
import { ROOM_TRANSITION_ENGINE_PURE_ABI_VERSION } from "./room-transition-engine-pure-model.mjs";
import { ANM2_PURE_ABI_VERSION } from "./anm2-pure-model.mjs";
import { SFX_PURE_ABI_VERSION } from "./sfx-pure-model.mjs";
import { PGD_PURE_ABI_VERSION } from "./pgd-pure-model.mjs";
import { ALLOC_PURE_ABI_VERSION } from "./alloc-pure-model.mjs";
import { LOG_PURE_ABI_VERSION } from "./log-pure-model.mjs";

/** Match FRAME_PATH_MODE without importing frame-path.mjs (cycle-safe). */
const MODE_NATIVE_WASM = "native-wasm";
const MODE_EMULATOR_X86 = "emulator-x86";

/**
 * Port root ids (conceptual group of decomp/port-roots.json).
 * Update is the wired hybrid tick; others are freestanding pure helpers.
 */
export const PORT_ROOT_IDS = Object.freeze({
  UPDATE: "update",
  RENDER: "render",
  PROCESS_INPUT: "processInput",
  EXIT: "exit",
  LUA_ENGINE: "luaEngine",
  /** Freestanding companion (not a top-level port-roots symbol). */
  ROOM: "room",
});

/**
 * Pure-helper module catalog: loadPureHelperWasm(id) keys.
 * Layout on disk: output/decomp/<dir>/<wasmFile>
 * Browser URL: /@decomp/pure/<dir>/<wasmFile> (scripts/serve.mjs).
 */
export const PURE_HELPER_MODULES = Object.freeze({
  render: Object.freeze({
    id: "render",
    rootSymbol: "Game::Render",
    pureName: "render-shell",
    dir: "render-shell-pure",
    wasmFile: "render-shell-pure-helpers.wasm",
    abiExport: "isaac_render_shell_pure_helpers_abi_version",
    expectedAbi: RENDER_SHELL_PURE_ABI_VERSION,
    reason: "Top-level frame renderer",
  }),
  processInput: Object.freeze({
    id: "processInput",
    rootSymbol: "Game::ProcessInput",
    pureName: "process-input",
    dir: "process-input-pure",
    wasmFile: "process-input-pure-helpers.wasm",
    abiExport: "isaac_process_input_pure_helpers_abi_version",
    expectedAbi: PROCESS_INPUT_PURE_ABI_VERSION,
    reason: "Input boundary",
  }),
  exit: Object.freeze({
    id: "exit",
    rootSymbol: "Game::Exit",
    pureName: "exit",
    dir: "exit-pure",
    wasmFile: "exit-pure-helpers.wasm",
    abiExport: "isaac_exit_pure_helpers_abi_version",
    expectedAbi: EXIT_PURE_ABI_VERSION,
    reason: "Save and shutdown boundary",
  }),
  luaEngine: Object.freeze({
    id: "luaEngine",
    rootSymbol: "LuaEngine",
    pureName: "lua-engine",
    dir: "lua-engine-pure",
    wasmFile: "lua-engine-pure-helpers.wasm",
    abiExport: "isaac_lua_engine_pure_helpers_abi_version",
    expectedAbi: LUA_ENGINE_PURE_ABI_VERSION,
    reason: "Lua runtime boundary",
  }),
  room: Object.freeze({
    id: "room",
    rootSymbol: "Room",
    pureName: "room",
    dir: "room-pure",
    wasmFile: "room-pure-helpers.wasm",
    abiExport: "isaac_room_pure_helpers_abi_version",
    expectedAbi: ROOM_PURE_ABI_VERSION,
    reason: "Room pure peels (Update-wired companions)",
  }),
  frameOpaque: Object.freeze({
    id: "frameOpaque",
    rootSymbol: "Game::Update frame-opaque callees",
    pureName: "frame-opaque",
    dir: "frame-opaque-pure",
    wasmFile: "frame-opaque-pure-helpers.wasm",
    abiExport: "isaac_frame_opaque_pure_helpers_abi_version",
    expectedAbi: FRAME_OPAQUE_PURE_ABI_VERSION,
    reason: "Frame-opaque callee peels (98dba0 / 956110 / 4212c0)",
  }),
  frameEffect: Object.freeze({
    id: "frameEffect",
    rootSymbol: "FrameEffect_6fd7c0",
    pureName: "frame-effect",
    dir: "frame-effect-pure",
    wasmFile: "frame-effect-pure-helpers.wasm",
    abiExport: "isaac_frame_effect_pure_helpers_abi_version",
    expectedAbi: FRAME_EFFECT_PURE_ABI_VERSION,
    reason: "Frame effect 6fd7c0 peels",
  }),
  hudPostUpdate: Object.freeze({
    id: "hudPostUpdate",
    rootSymbol: "HUD::PostUpdate",
    pureName: "hud-post-update",
    dir: "hud-post-update-pure",
    wasmFile: "hud-post-update-pure-helpers.wasm",
    abiExport: "isaac_hud_post_update_pure_helpers_abi_version",
    expectedAbi: HUD_POST_UPDATE_PURE_ABI_VERSION,
    reason: "HUD post-update pure shell (Update-wired on safe sites)",
  }),
  playerHud: Object.freeze({
    id: "playerHud",
    rootSymbol: "PlayerHUD post-update",
    pureName: "playerhud-post-update",
    dir: "playerhud-post-update-pure",
    wasmFile: "playerhud-post-update-pure-helpers.wasm",
    abiExport: "isaac_playerhud_post_update_pure_helpers_abi_version",
    expectedAbi: PLAYERHUD_POST_UPDATE_PURE_ABI_VERSION,
    reason: "PlayerHUD residual peels",
  }),
  playerManager: Object.freeze({
    id: "playerManager",
    rootSymbol: "PlayerManager::Update",
    pureName: "player-manager-update",
    dir: "player-manager-update-pure",
    wasmFile: "player-manager-update-pure-helpers.wasm",
    abiExport: "isaac_player_manager_update_pure_helpers_abi_version",
    expectedAbi: PM_UPDATE_PURE_ABI_VERSION,
    reason: "PlayerManager::Update peels (Update-wired PM2/PM3)",
  }),
  roomTransitionEngine: Object.freeze({
    id: "roomTransitionEngine",
    rootSymbol: "FUN_0082ee40 room transition engine",
    pureName: "room-transition-engine",
    dir: "room-transition-engine-pure",
    wasmFile: "room-transition-engine-pure-helpers.wasm",
    abiExport: "isaac_room_transition_engine_pure_helpers_abi_version",
    expectedAbi: ROOM_TRANSITION_ENGINE_PURE_ABI_VERSION,
    reason: "Room transition engine peels",
  }),
  anm2: Object.freeze({
    id: "anm2",
    rootSymbol: "ANM2",
    pureName: "anm2",
    dir: "anm2-pure",
    wasmFile: "anm2-pure-helpers.wasm",
    abiExport: "isaac_anm2_pure_helpers_abi_version",
    expectedAbi: ANM2_PURE_ABI_VERSION,
    reason: "Animation system peels (cross-cutting: Exit / Room H5 / Render)",
  }),
  sfx: Object.freeze({
    id: "sfx",
    rootSymbol: "SFXManager",
    pureName: "sfx",
    dir: "sfx-pure",
    wasmFile: "sfx-pure-helpers.wasm",
    abiExport: "isaac_sfx_pure_helpers_abi_version",
    expectedAbi: SFX_PURE_ABI_VERSION,
    reason: "Audio manager peels (Update PM3 / Exit / frame-effect)",
  }),
  pgd: Object.freeze({
    id: "pgd",
    rootSymbol: "PersistentGameData",
    pureName: "pgd",
    dir: "pgd-pure",
    wasmFile: "pgd-pure-helpers.wasm",
    abiExport: "isaac_pgd_pure_helpers_abi_version",
    expectedAbi: PGD_PURE_ABI_VERSION,
    reason: "Save-state format and checksum peels",
  }),
  alloc: Object.freeze({
    id: "alloc",
    rootSymbol: "Allocator",
    pureName: "alloc",
    dir: "alloc-pure",
    wasmFile: "alloc-pure-helpers.wasm",
    abiExport: "isaac_alloc_pure_helpers_abi_version",
    expectedAbi: ALLOC_PURE_ABI_VERSION,
    reason: "Guest allocation wrappers (game logic) peels",
  }),
  log: Object.freeze({
    id: "log",
    rootSymbol: "Logger",
    pureName: "log",
    dir: "log-pure",
    wasmFile: "log-pure-helpers.wasm",
    abiExport: "isaac_log_pure_helpers_abi_version",
    expectedAbi: LOG_PURE_ABI_VERSION,
    reason: "Logger 0x00a112c0 level-gate (shared residual-log edge, 3286 callsites across 10 families)",
  }),
});

/**
 * Module kinds in this registry.
 *
 * "pure-helper": freestanding zero-import islands (no capture/apply/step); the
 *   caller invokes individual exported functions.
 * "root-slice": a full root translation with the Update-slice shape —
 *   capture(game*, size, state*) / step(state*, inputs*, events*) / typed
 *   resume chain / apply(state*, game*, size) — driven per frame over a
 *   JS-owned sparse Game-object buffer.
 */
export const FRAME_PATH_MODULE_KIND = Object.freeze({
  PURE_HELPER: "pure-helper",
  ROOT_SLICE: "root-slice",
});

/**
 * Root-slice module catalog — distinct from PURE_HELPER_MODULES.
 *
 * A root slice is NOT a pure-helper island: it owns a continuation chain and a
 * sparse Game-object capture/apply contract, so it is loaded by its own driver
 * (scripts/decomp/frame-render-root.mjs `loadGameRenderSliceWasm`) rather than
 * by `loadPureHelperWasm`. Registering it here keeps one catalog of what the
 * browser frame path may load without ever widening the pure-helper contract.
 *
 * Layout on disk: output/decomp/<dir>/<wasmFile>
 * Browser URL: /@decomp/pure/<dir>/<wasmFile> (scripts/serve.mjs maps
 * /@decomp/pure/* -> output/decomp/*).
 *
 * `expectedAbi` is imported from the model module; never hardcode it here.
 */
export const ROOT_SLICE_MODULES = Object.freeze({
  render: Object.freeze({
    id: "render",
    kind: FRAME_PATH_MODULE_KIND.ROOT_SLICE,
    rootId: "Render",
    portId: PORT_ROOT_IDS.RENDER,
    rootSymbol: "Game::Render",
    sliceName: "game-render-slice",
    dir: "game-render-slice",
    wasmFile: "game-render-slice.wasm",
    abiExport: "isaac_game_render_slice_abi_version",
    expectedAbi: GAME_RENDER_SLICE_ABI_VERSION,
    /** Shared with the Update session buffer (0x68d70 >= 0x3bb20). */
    gameObjectMinSize: GAME_RENDER_GAME_OBJECT_MIN_SIZE,
    driverModule: "scripts/decomp/frame-render-root.mjs",
    reason: "Game::Render root slice: per-frame capture/step/resume/apply",
  }),
});

/** Every registered root-slice module id. */
export const ROOT_SLICE_IDS = Object.freeze(Object.keys(ROOT_SLICE_MODULES));

/** Resolve a ROOT_SLICE_MODULES entry from id, dir, sliceName, or root id. */
export function resolveRootSliceSpec(name) {
  if (!name || typeof name !== "string") {
    throw new Error(`root slice name required; got ${name}`);
  }
  if (ROOT_SLICE_MODULES[name]) return ROOT_SLICE_MODULES[name];
  const match = Object.values(ROOT_SLICE_MODULES).find(
    (m) => m.dir === name || m.sliceName === name || m.rootId === name,
  );
  if (match) return match;
  throw new Error(
    `Unknown root slice "${name}"; expected one of: ${ROOT_SLICE_IDS.join(", ")}`,
  );
}

/** Browser URL for a root-slice wasm artifact (scripts/serve.mjs mount). */
export function rootSliceBrowserUrl(name) {
  const spec = resolveRootSliceSpec(name);
  return `/@decomp/pure/${spec.dir}/${spec.wasmFile}`;
}

/** Disk path (Node) or browser URL for a root-slice wasm artifact. */
export async function resolveRootSliceWasmPath(name) {
  const spec = resolveRootSliceSpec(name);
  if (isBrowserEnvironment()) return rootSliceBrowserUrl(spec.id);
  const { dirname, join, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  return join(projectRoot, "output", "decomp", spec.dir, spec.wasmFile);
}

/** Probe whether a root-slice wasm artifact is present (fs or fetch HEAD). */
export async function probeRootSliceAvailability(name) {
  try {
    const spec = resolveRootSliceSpec(name);
    if (isBrowserEnvironment()) {
      if (typeof fetch !== "function") return false;
      const response = await fetch(rootSliceBrowserUrl(spec.id), { method: "HEAD" });
      return response.ok;
    }
    const { existsSync } = await import("node:fs");
    return existsSync(await resolveRootSliceWasmPath(spec.id));
  } catch {
    return false;
  }
}

/**
 * Probe whether a root's wasm-backed PLAN STEP artifact is available.
 * Resolves the FRAME_PATH_ROOTS entry by its PascalCase id ("Exit"), follows
 * its `rootPlanId` to the pure-helper catalog, and delegates to
 * probePureHelperAvailability. Returns false when the entry has no root plan
 * (Update) or is unknown.
 */
export async function probeFramePathRootPlanAvailability(id) {
  try {
    const root = FRAME_PATH_ROOT_BY_ID[id];
    if (!root || !root.rootPlanId) return false;
    return probePureHelperAvailability(root.rootPlanId);
  } catch {
    return false;
  }
}

/** Primary multi-root pure modules for the frame path (excludes companions). */
export const FRAME_PATH_PURE_ROOT_IDS = Object.freeze([
  "render",
  "processInput",
  "exit",
  "luaEngine",
]);

/**
 * Companion pure modules: freestanding peels that are not top-level port-roots.
 * They never gate `usesX86Emulation` (that stays a primary-root decision), but
 * they are loadable, ABI-checked, and served the same way so the PE-free
 * surface can grow one family at a time.
 */
export const FRAME_PATH_COMPANION_PURE_IDS = Object.freeze([
  "room",
  "frameOpaque",
  "frameEffect",
  "hudPostUpdate",
  "playerHud",
  "playerManager",
  "roomTransitionEngine",
  "anm2",
  "sfx",
  "pgd",
  "alloc",
  "log",
]);

/** Every registered pure-helper module id (primary roots + companions). */
export const ALL_PURE_HELPER_IDS = Object.freeze([
  ...FRAME_PATH_PURE_ROOT_IDS,
  ...FRAME_PATH_COMPANION_PURE_IDS,
]);

/**
 * Conceptual port-roots list (Update + pure helpers).
 * Aligns with decomp/port-roots.json grouping.
 */
export const FRAME_PATH_ROOTS = Object.freeze([
  Object.freeze({
    id: "Update",
    portId: PORT_ROOT_IDS.UPDATE,
    symbol: "Game::Update",
    symbols: Object.freeze(["Game::Update"]),
    pureName: null,
    wired: true,
    reason: "Top-level simulation tick",
    expectedAbi: ABI_VERSION,
    wasmFile: "game-update-slice.wasm",
  }),
  Object.freeze({
    id: "Render",
    portId: PORT_ROOT_IDS.RENDER,
    symbol: "Game::Render",
    symbols: Object.freeze(["Game::Render"]),
    pureName: "render-shell",
    pureId: "render",
    /* Wired: bootNativeUpdateBridge loads the Game::Render ROOT SLICE and its
       tick() drives one render tick per rAF frame on the SAME JS-owned Game
       buffer as the Update session. This flag tracks the root slice being
       driven per frame, NOT the render-shell pure helpers below (those are
       still load-and-hold islands). Draw-side hosts remain typed events. */
    wired: true,
    reason: "Top-level frame renderer",
    /* Pure-helper island ABI (unchanged contract for existing consumers). */
    expectedAbi: RENDER_SHELL_PURE_ABI_VERSION,
    wasmFile: "render-shell-pure-helpers.wasm",
    /* Root-slice contract driven on the frame path (ROOT_SLICE_MODULES.render). */
    rootSliceId: "render",
    rootSliceAbi: GAME_RENDER_SLICE_ABI_VERSION,
    rootSliceWasmFile: "game-render-slice.wasm",
    rootSliceGameObjectMinSize: GAME_RENDER_GAME_OBJECT_MIN_SIZE,
  }),
  Object.freeze({
    id: "ProcessInput",
    portId: PORT_ROOT_IDS.PROCESS_INPUT,
    symbol: "Game::ProcessInput",
    symbols: Object.freeze(["Game::ProcessInput"]),
    pureName: "process-input",
    pureId: "processInput",
    wired: false,
    reason: "Input boundary",
    expectedAbi: PROCESS_INPUT_PURE_ABI_VERSION,
    wasmFile: "process-input-pure-helpers.wasm",
  }),
  Object.freeze({
    id: "Exit",
    portId: PORT_ROOT_IDS.EXIT,
    symbol: "Game::Exit",
    symbols: Object.freeze(["Game::Exit"]),
    pureName: "exit",
    pureId: "exit",
    /* Wired: bootNativeUpdateBridge drives the Game::Exit ROOT PLAN once per
       frame in tick() — runExitRootPlan over exitRootWasmPure(module.wasm),
       the same exports the family tests differential-verify. There is NO
       ROOT_SLICE_MODULES.exit: the family header is explicit ("Not an Exit
       slice ABI"), so this is a plan-step wiring, not a capture/step/resume
       slice. Like the Render root, the step is non-fatal when the module is
       missing and never opens x86 PE emulation; the plan's guest-memory
       inputs are caller-supplied (setExitInputs), all-zero default closes the
       entry gate. */
    wired: true,
    /* The exit pure-helper module whose root-plan exports drive the step. */
    rootPlanId: "exit",
    rootPlanAbi: EXIT_PURE_ABI_VERSION,
    rootPlanWasmFile: "exit-pure-helpers.wasm",
    reason: "Save and shutdown boundary",
    expectedAbi: EXIT_PURE_ABI_VERSION,
    wasmFile: "exit-pure-helpers.wasm",
  }),
  Object.freeze({
    id: "LuaEngine",
    portId: PORT_ROOT_IDS.LUA_ENGINE,
    symbol: "LuaEngine",
    symbols: Object.freeze([
      "LuaEngine::Init",
      "LuaEngine::RegisterClasses",
      "LuaEngine::RunBundledScript",
    ]),
    pureName: "lua-engine",
    pureId: "luaEngine",
    wired: false,
    reason: "Lua runtime boundary",
    expectedAbi: LUA_ENGINE_PURE_ABI_VERSION,
    wasmFile: "lua-engine-pure-helpers.wasm",
  }),
]);

export const FRAME_PATH_ROOT_ID = Object.freeze({
  UPDATE: "Update",
  RENDER: "Render",
  PROCESS_INPUT: "ProcessInput",
  EXIT: "Exit",
  LUA_ENGINE: "LuaEngine",
});

export const FRAME_PATH_ROOT_BY_ID = Object.freeze(
  Object.fromEntries(FRAME_PATH_ROOTS.map((r) => [r.id, r])),
);

export const FRAME_PATH_ROOT_BY_PURE_NAME = Object.freeze(
  Object.fromEntries(
    FRAME_PATH_ROOTS.filter((r) => r.pureName).map((r) => [r.pureName, r]),
  ),
);

/**
 * Platform/IO residual kinds acceptable long-term without PE.
 * HostHandler may no-op these after counting (presentation, Lua unref, clocks,
 * SFX platform IO). Kept in sync with PLATFORM_IO_HOST_KINDS in frame-path.mjs.
 */
export const MULTI_ROOT_PLATFORM_IO_KINDS = Object.freeze([
  "opaqueCall008607a0", // luaL_unref path
  "transitionQueueScreen",
  "listUpdate6772c",
  "hudMessageTextOut",
  /* ABI v44: PM3 SFX residual bodies are audio platform IO (no PE). */
  "playerManagerUpdateHeartbeatSfxUpdate",
  "playerManagerUpdateHeartbeatSfxPlay",
  "playerManagerUpdateHeartbeatSfxStop",
]);

export const PLATFORM_IO_RESIDUAL_REGISTRY = Object.freeze({
  kinds: MULTI_ROOT_PLATFORM_IO_KINDS,
  description:
    "Platform/IO residual kinds acceptable long-term without PE (no-op after count)",
  isPlatformIo(kind) {
    return MULTI_ROOT_PLATFORM_IO_KINDS.includes(kind);
  },
  has(kind) {
    return MULTI_ROOT_PLATFORM_IO_KINDS.includes(kind);
  },
});

export function isPlatformIoResidualKind(kind) {
  return MULTI_ROOT_PLATFORM_IO_KINDS.includes(kind);
}

function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function exported(wasm, name) {
  const value = wasm[name] ?? wasm[`_${name}`];
  if (typeof value !== "function") throw new Error(`Missing Wasm export: ${name}`);
  return value;
}

/** Resolve PURE_HELPER_MODULES entry from id, pureName, or PascalCase root id. */
export function resolvePureHelperSpec(name) {
  if (!name || typeof name !== "string") {
    throw new Error(`pure helper name required; got ${name}`);
  }
  if (PURE_HELPER_MODULES[name]) return PURE_HELPER_MODULES[name];
  const byPure = Object.values(PURE_HELPER_MODULES).find((m) => m.pureName === name);
  if (byPure) return byPure;
  const byDir = Object.values(PURE_HELPER_MODULES).find((m) => m.dir === name || m.dir === `${name}-pure`);
  if (byDir) return byDir;
  const pascal = {
    Render: "render",
    ProcessInput: "processInput",
    Exit: "exit",
    LuaEngine: "luaEngine",
    Room: "room",
    FrameOpaque: "frameOpaque",
    FrameEffect: "frameEffect",
    HudPostUpdate: "hudPostUpdate",
    HUDPostUpdate: "hudPostUpdate",
    PlayerHud: "playerHud",
    PlayerHUD: "playerHud",
    PlayerManager: "playerManager",
    RoomTransitionEngine: "roomTransitionEngine",
    Anm2: "anm2",
    ANM2: "anm2",
    Sfx: "sfx",
    SFX: "sfx",
    Pgd: "pgd",
    PGD: "pgd",
  };
  if (pascal[name] && PURE_HELPER_MODULES[pascal[name]]) {
    return PURE_HELPER_MODULES[pascal[name]];
  }
  throw new Error(
    `Unknown pure helper "${name}"; expected one of: ${Object.keys(PURE_HELPER_MODULES).join(", ")}`,
  );
}

async function loadWasmBytes(source) {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (typeof source !== "string") {
    throw new Error("Wasm source must be a path, URL, or byte buffer");
  }
  const looksUrl =
    /^(https?:)?\/\//.test(source) ||
    source.startsWith("/") ||
    source.startsWith("./") ||
    source.startsWith("../") ||
    source.startsWith("@") ||
    source.includes("://");
  if (isBrowserEnvironment() || (typeof fetch === "function" && looksUrl && !/^[A-Za-z]:[\\/]/.test(source))) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Failed to fetch pure-helper Wasm: ${response.status} ${source}`);
    }
    return new Uint8Array(await response.arrayBuffer());
  }
  const { readFileSync } = await import("node:fs");
  return new Uint8Array(readFileSync(source));
}

/**
 * Resolve default filesystem / browser URL for a pure-helper module.
 * Disk: output/decomp/<dir>/<wasmFile>
 * Browser: /@decomp/pure/<dir>/<wasmFile>
 */
export async function resolvePureHelperWasmPath(name) {
  const spec = resolvePureHelperSpec(name);
  if (isBrowserEnvironment()) {
    return `/@decomp/pure/${spec.dir}/${spec.wasmFile}`;
  }
  const { dirname, join, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  return join(projectRoot, "output", "decomp", spec.dir, spec.wasmFile);
}

/**
 * Load a freestanding pure-helper Wasm module (zero imports) with ABI check.
 *
 * @param {string} name Module id ("render"|"processInput"|"exit"|"luaEngine"|"room"),
 *   pureName ("render-shell"), or root id ("Render").
 * @param {string|Uint8Array|ArrayBuffer} [wasmSource] Optional path/URL/bytes override.
 */
export async function loadPureHelperWasm(name, wasmSource = null) {
  const spec = resolvePureHelperSpec(name);
  let source = wasmSource;
  if (source == null) {
    source = await resolvePureHelperWasmPath(spec.id);
  }

  const bytes = await loadWasmBytes(source);
  const module = await WebAssembly.compile(bytes);
  const imports = WebAssembly.Module.imports(module);
  if (imports.length !== 0) {
    throw new Error(
      `Pure helper "${spec.id}" must have zero Wasm imports; got ${imports.length}`,
    );
  }
  const instance = await WebAssembly.instantiate(module, {});
  const wasm = instance.exports;
  const abiVersion = exported(wasm, spec.abiExport)() | 0;
  const expectedAbi = spec.expectedAbi | 0;
  if (abiVersion !== expectedAbi) {
    throw new Error(
      `Unexpected pure helper ABI version for ${spec.id}: ${abiVersion}; expected ${expectedAbi}`,
    );
  }

  return {
    id: spec.id,
    name: spec.pureName,
    rootId: spec.id,
    rootSymbol: spec.rootSymbol,
    mode: MODE_NATIVE_WASM,
    usesX86Emulation: false,
    abiVersion,
    expectedAbi,
    wasm,
    memory: wasm.memory instanceof WebAssembly.Memory ? wasm.memory : null,
    source: typeof source === "string" ? source : "<bytes>",
    abiExport: spec.abiExport,
    dir: spec.dir,
    wasmFile: spec.wasmFile,
  };
}

/**
 * Probe whether a pure-helper Wasm artifact is available (Node fs or browser fetch head).
 */
export async function probePureHelperAvailability(name) {
  try {
    const spec = resolvePureHelperSpec(name);
    if (isBrowserEnvironment()) {
      const url = `/@decomp/pure/${spec.dir}/${spec.wasmFile}`;
      if (typeof fetch !== "function") return false;
      const response = await fetch(url, { method: "HEAD" });
      return response.ok;
    }
    const { existsSync } = await import("node:fs");
    const path = await resolvePureHelperWasmPath(spec.id);
    return existsSync(path);
  } catch {
    return false;
  }
}

/** Alias used by some call sites / tests. */
export async function probePureHelperWasm(name) {
  return probePureHelperAvailability(name);
}

/**
 * Resolve mode per port root without PE for available pure modules.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.preferNative=true]
 * @param {boolean} [opts.updateAvailable=false]
 * @param {Record<string, boolean>} [opts.pureAvailable]
 *   Keys: render, processInput, exit, luaEngine (and optional room).
 * @param {Record<string, boolean>} [opts.available]
 *   Alternate map: root ids (Update, Render, …) or pureNames / port ids.
 * @returns {Record<string, string>} modes by port id (update, render, …)
 *   and PascalCase root ids (Update, Render, …) for convenience.
 */
export function selectFramePathRoots({
  preferNative = true,
  updateAvailable = false,
  pureAvailable = null,
  available = null,
} = {}) {
  const pure = { ...(pureAvailable || {}) };

  // Map alternate `available` keys into pure/update flags.
  if (available && typeof available === "object") {
    if (available.Update === true || available.update === true) updateAvailable = true;
    if (available.Update === false || available.update === false) updateAvailable = false;
    const pairs = [
      ["render", ["Render", "render", "render-shell"]],
      ["processInput", ["ProcessInput", "processInput", "process-input"]],
      ["exit", ["Exit", "exit"]],
      ["luaEngine", ["LuaEngine", "luaEngine", "lua-engine"]],
      ["room", ["Room", "room"]],
      ["frameOpaque", ["FrameOpaque", "frameOpaque", "frame-opaque"]],
      ["frameEffect", ["FrameEffect", "frameEffect", "frame-effect"]],
      ["hudPostUpdate", ["HudPostUpdate", "HUDPostUpdate", "hudPostUpdate", "hud-post-update"]],
      ["playerHud", ["PlayerHud", "PlayerHUD", "playerHud", "playerhud-post-update"]],
      ["playerManager", ["PlayerManager", "playerManager", "player-manager-update"]],
      [
        "roomTransitionEngine",
        ["RoomTransitionEngine", "roomTransitionEngine", "room-transition-engine"],
      ],
      ["anm2", ["Anm2", "ANM2", "anm2"]],
      ["sfx", ["Sfx", "SFX", "sfx"]],
      ["pgd", ["Pgd", "PGD", "pgd"]],
    ];
    for (const [id, keys] of pairs) {
      for (const key of keys) {
        if (available[key] === true) pure[id] = true;
        if (available[key] === false) pure[id] = false;
      }
    }
  }

  const pick = (avail) =>
    preferNative && avail ? MODE_NATIVE_WASM : MODE_EMULATOR_X86;

  const modes = {
    update: pick(!!updateAvailable),
    render: pick(!!pure.render),
    processInput: pick(!!pure.processInput),
    exit: pick(!!pure.exit),
    luaEngine: pick(!!pure.luaEngine),
  };
  // Companions only appear when the caller probed them; absent keys stay absent
  // so existing consumers keep their exact shape.
  for (const id of FRAME_PATH_COMPANION_PURE_IDS) {
    if (pure[id] !== undefined) {
      modes[id] = pick(!!pure[id]);
    }
  }

  // PascalCase aliases for FRAME_PATH_ROOTS consumers.
  modes.Update = modes.update;
  modes.Render = modes.render;
  modes.ProcessInput = modes.processInput;
  modes.Exit = modes.exit;
  modes.LuaEngine = modes.luaEngine;

  return modes;
}

/** True when every multi-root mode entry is native-wasm (no PE). */
export function multiRootUsesX86Emulation(modes) {
  if (!modes || typeof modes !== "object") return true;
  const keys = ["update", "render", "processInput", "exit", "luaEngine"];
  for (const key of keys) {
    if (modes[key] !== MODE_NATIVE_WASM) return true;
  }
  return false;
}

export function allFramePathRootsNative(modes) {
  return !multiRootUsesX86Emulation(modes);
}

/**
 * Probe which pure helpers are available (Node filesystem).
 * @param {string[]} [modules] subset of PURE_HELPER_MODULES keys
 */
export async function probeAvailablePureHelpers(modules = FRAME_PATH_PURE_ROOT_IDS) {
  const pureAvailable = Object.create(null);
  for (const id of modules) {
    pureAvailable[id] = await probePureHelperAvailability(id);
  }
  return pureAvailable;
}

/**
 * Load pure-helper Wasm modules for selected roots; skip missing gracefully.
 *
 * @param {object} [opts]
 * @param {boolean} [opts.preferNative=true]
 * @param {boolean} [opts.updateAvailable=false]
 * @param {string[]} [opts.modules] pure module ids to load
 * @param {Record<string, string|Uint8Array>} [opts.sources] optional per-id overrides
 * @returns {Promise<{
 *   preferNative: boolean,
 *   updateAvailable: boolean,
 *   pureAvailable: Record<string, boolean>,
 *   modules: Record<string, object|null>,
 *   modes: Record<string, string>,
 *   usesX86Emulation: boolean,
 *   loadErrors: Record<string, string>,
 *   platformIoKinds: readonly string[],
 * }>}
 */
export async function loadFramePathRoots({
  preferNative = true,
  updateAvailable = false,
  modules = FRAME_PATH_PURE_ROOT_IDS.slice(),
  sources = null,
} = {}) {
  const pureAvailable = Object.create(null);
  const loaded = Object.create(null);
  const loadErrors = Object.create(null);

  for (const id of modules) {
    let available = false;
    try {
      available = await probePureHelperAvailability(id);
    } catch {
      available = false;
    }
    pureAvailable[id] = false;
    loaded[id] = null;
    if (!available && !(sources && sources[id])) {
      continue;
    }
    try {
      const mod = await loadPureHelperWasm(id, sources?.[id] ?? null);
      loaded[id] = mod;
      pureAvailable[id] = true;
    } catch (error) {
      loadErrors[id] = error?.message || String(error);
      pureAvailable[id] = false;
      loaded[id] = null;
    }
  }

  const modes = selectFramePathRoots({
    preferNative,
    updateAvailable,
    pureAvailable,
  });

  return {
    preferNative,
    updateAvailable: !!updateAvailable,
    pureAvailable: Object.freeze({ ...pureAvailable }),
    modules: Object.freeze({ ...loaded }),
    modes: Object.freeze({ ...modes }),
    usesX86Emulation: multiRootUsesX86Emulation(modes),
    loadErrors: Object.freeze({ ...loadErrors }),
    platformIoKinds: MULTI_ROOT_PLATFORM_IO_KINDS,
    roots: FRAME_PATH_ROOTS,
  };
}

/**
 * Multi-root frame session: holds Update session + pure helper modules.
 *
 * `usesX86Emulation` is false only when Update and every requested pure root
 * selected native-wasm (no PE). The Update tick itself never re-enters PE when
 * `updateSession` is a native hybrid session.
 *
 * @param {object} opts
 * @param {object} [opts.updateSession] native Update session (createNativeUpdateSession)
 * @param {object} [opts.roots] result of loadFramePathRoots
 * @param {object} [opts.modes] optional modes override
 * @param {Record<string, object>} [opts.helpers] optional pure modules by id
 */
export function createMultiRootFrameSession({
  updateSession = null,
  roots = null,
  modes = null,
  helpers = null,
} = {}) {
  const resolvedModes =
    modes ||
    roots?.modes ||
    selectFramePathRoots({
      preferNative: true,
      updateAvailable: !!updateSession,
      pureAvailable: roots?.pureAvailable || {},
    });

  const pureModules = Object.create(null);
  const fromRoots = roots?.modules || {};
  const fromHelpers = helpers || {};
  for (const id of FRAME_PATH_PURE_ROOT_IDS) {
    pureModules[id] = fromHelpers[id] || fromRoots[id] || null;
  }
  for (const id of FRAME_PATH_COMPANION_PURE_IDS) {
    if (fromRoots[id] || fromHelpers[id]) {
      pureModules[id] = fromHelpers[id] || fromRoots[id] || null;
    }
  }

  const allNative = !multiRootUsesX86Emulation(resolvedModes);
  const updateNative =
    !!updateSession &&
    updateSession.usesX86Emulation === false &&
    (resolvedModes.update === MODE_NATIVE_WASM || resolvedModes.Update === MODE_NATIVE_WASM);

  return {
    mode: updateNative ? MODE_NATIVE_WASM : MODE_EMULATOR_X86,
    modes: Object.freeze({ ...resolvedModes }),
    /** False only when Update + all primary pure roots are native-wasm. */
    usesX86Emulation: !allNative,
    updateUsesX86Emulation: !updateNative,
    allRootsNative: allNative,
    roots: roots || null,
    updateSession,
    helpers: Object.freeze({
      Render: pureModules.render || null,
      ProcessInput: pureModules.processInput || null,
      Exit: pureModules.exit || null,
      LuaEngine: pureModules.luaEngine || null,
      render: pureModules.render || null,
      processInput: pureModules.processInput || null,
      exit: pureModules.exit || null,
      luaEngine: pureModules.luaEngine || null,
      room: pureModules.room || null,
      frameOpaque: pureModules.frameOpaque || null,
      frameEffect: pureModules.frameEffect || null,
      hudPostUpdate: pureModules.hudPostUpdate || null,
      playerHud: pureModules.playerHud || null,
      playerManager: pureModules.playerManager || null,
      roomTransitionEngine: pureModules.roomTransitionEngine || null,
      anm2: pureModules.anm2 || null,
      sfx: pureModules.sfx || null,
      pgd: pureModules.pgd || null,
    }),
    pureModules: Object.freeze({ ...pureModules }),
    platformIoRegistry: PLATFORM_IO_RESIDUAL_REGISTRY,
    platformIoKinds: MULTI_ROOT_PLATFORM_IO_KINDS,
    get ticks() {
      return updateSession ? updateSession.ticks : 0;
    },
    get state() {
      return updateSession ? updateSession.state : null;
    },
    get gameObject() {
      return updateSession ? updateSession.gameObject : null;
    },
    get hostTotals() {
      return updateSession?.hostTotals ?? null;
    },
    get residualExecuted() {
      return updateSession?.residualExecuted ?? null;
    },
    /**
     * Drive one Update hybrid tick. Pure helper roots are held for later
     * frame-path wiring (not invoked here).
     */
    tick(extraRuntime = null) {
      if (!updateSession || typeof updateSession.tick !== "function") {
        throw new Error("multi-root session has no native Update session to tick");
      }
      return updateSession.tick(extraRuntime);
    },
  };
}

/**
 * Async convenience: load pure helpers + wrap an optional Update session.
 * Prefer createMultiRootFrameSession({ updateSession, roots }) when roots
 * were already loaded via loadFramePathRoots.
 */
export async function createMultiRootFrameSessionAsync({
  preferNative = true,
  updateSession = null,
  updateAvailable = null,
  modules = FRAME_PATH_PURE_ROOT_IDS.slice(),
  sources = null,
} = {}) {
  const roots = await loadFramePathRoots({
    preferNative,
    updateAvailable: updateAvailable ?? !!updateSession,
    modules,
    sources,
  });
  return createMultiRootFrameSession({ updateSession, roots });
}
