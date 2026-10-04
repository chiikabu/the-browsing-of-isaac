/**
 * Browser keyboard -> native Game::Update slice INPUT BRIDGE.
 *
 * ============================ HONESTY STATEMENT ============================
 * THIS MODULE IS NOT DECOMPILER OUTPUT. Nothing here was recovered from the
 * PE. `Game::ProcessInput` is unpinned in this build (zero exact-ZHL hits),
 * the message pump is untranslated, and the Update slice has NO keyboard
 * field of any kind: `decomp/game-update-slice.json` contains no VK, no key
 * bits, and no scancode. The Update slice only ever *observes* state that
 * something else already wrote into guest memory / the Manager globals.
 *
 * So this module models, in JavaScript, what the PE's message pump and
 * `Game::ProcessInput` would have left behind in guest memory for the Update
 * slice to capture. Every key -> field mapping below is a BRIDGE CONVENTION
 * invented here, marked `[BRIDGE CONVENTION]`. Only the predicates that
 * consume those fields are recovered, and each is cited to the tracked source
 * that verifies it (`native/decomp/game_update_slice.cpp` line numbers plus
 * the field/runtime-input records in `decomp/game-update-slice.json`).
 *
 * Recovered (cited, not invented):
 *   - Sparse field names/offsets: `decomp/game-update-slice.json` "fields",
 *     mirrored in `BINARY_LAYOUT` of `scripts/decomp/game-update-model.mjs`.
 *   - Runtime-input names/sources: same file, "runtimeInputs".
 *   - The menu-open gate conjunction: `game_update_slice.cpp:1752-1755`.
 *   - The menu-gate exit predicate: `game_update_slice.cpp:1647-1653`.
 *   - The generic-prompt active gate: `game_update_slice.cpp:1457-1458`.
 *   - The generic-prompt mode-7 transition: `game_update_slice.cpp:1535-1536`.
 *
 * ===================== KNOWN BLOCKER (do not paper over) ===================
 * `globalRangeByteLength` (raw `uint32(end - begin)` over
 * `*0x00c7169c + [0x4b3d8, 0x4b3dc)`) is the THIRD conjunct of the menu-open
 * gate at `game_update_slice.cpp:1754`. It is NOT keyboard-derived. With the
 * browser session's `createDefaultNativeRuntimeInputs()` value of **8**,
 * toggling `globalMenuGuard4b3ca`/`globalMenuEnable2a3a5` alone produces
 * ZERO observable change in the Update tick (measured: the entire events
 * struct and the entire sparse state are deep-equal to the no-key baseline).
 * The menu lane cannot open until that capture is either supplied from a real
 * Manager read or overridden.
 *
 * This bridge therefore also drives `globalRangeByteLength` to 0 while the
 * menu lane is latched open (`emptyGlobalRangeOnMenuOpen`, default true) and
 * says so out loud. That is legitimate only because the value it replaces is
 * itself synthetic: `createDefaultNativeRuntimeInputs()` documents its own
 * defaults as chosen "to exercise pure-gated residual hosts on common play",
 * not captured from the PE. NEITHER 8 NOR 0 IS PE TRUTH IN THE BROWSER
 * SESSION TODAY. Set `emptyGlobalRangeOnMenuOpen: false` once a real Manager
 * range capture exists, and call `describeMenuOpenGate()` to see exactly which
 * conjunct is blocking.
 *
 * ============================ PER-TICK CONTRACT ============================
 * DOM handler (any time):   bridge.setKeyByCode(e.code, true/false, e.key)
 * rAF, in this exact order:
 *     const extraRuntime = bridge.toRuntimeInputs();   // runtime-input lane
 *     const statePatch   = bridge.toStatePatch();      // sparse-state lane
 *     nativeBridge.tick(time, extraRuntime, statePatch);
 *     bridge.consumeEdges();                           // ONCE per tick, after
 *
 * `nativeBridge.tick` forwards `(extraRuntime, statePatch)` to
 * `createNativeUpdateSession.tick(extraRuntime, statePatch)` in
 * `scripts/decomp/frame-path.mjs`. The presentation layer reads
 * `bridge.snapshot().menu.selection`.
 *
 * `consumeEdges()` is the tick barrier: it drains the press/release edge log
 * and retires the one-shot lane phases (menu-open pending, submit armed).
 * IT MUST RUN AFTER THE TICK. Calling it before the tick instead degrades the
 * open edge: `openPending` retires early, the patch publishes
 * `menuState23a74 = 1` on the very first tick, the recovered conjunct at
 * cpp:1755 (`menu_state_23a74 == 0`) then fails, and the menu-open host edge
 * VA 0x009b7680 is never emitted.
 *
 * `applyToGameObject(buffer)` writes the same sparse menu fields directly into
 * a Game-object buffer. DO NOT use it with `createNativeUpdateSession`:
 * `tick()` calls `writeSparseFieldsToGameObject(liveGameObject, sparseState)`
 * at the top of every tick, which re-stamps the previous tick's values over
 * anything written into the buffer. It exists for callers that drive
 * `runHybridGameUpdateTick` on their own buffer. Sessions must use
 * `toStatePatch()`.
 *
 * DOM-free and Node-safe: no `window`, `document`, `KeyboardEvent`, timers, or
 * `node:` imports. Served to the browser at /@decomp/scripts/ by scripts/serve.mjs.
 *
 * VK TABLE PROVENANCE: `web/platform/input.js` already owns a Win32 VK table
 * and `codeToVk`. It is NOT imported here: this module is served from
 * `/@decomp/scripts/` while `web/` is the document root (`scripts/serve.mjs`
 * `root = <repo>/web`), so no single relative specifier resolves in both Node
 * and the browser (`../../web/platform/input.js` -> `/web/platform/input.js`
 * in the browser, which 404s; `scripts/platform/input.js` in Node, which does
 * not exist). The six VK codes the menu lane needs are therefore re-derived
 * minimally below, and `tests/decomp-frame-input-bridge.test.js` asserts they
 * are value-identical to `web/platform/input.js` so the two cannot drift.
 */

import { createDefaultNativeRuntimeInputs } from "./frame-path.mjs";
import {
  BINARY_LAYOUT,
  GAME_OBJECT_MIN_SIZE,
  UPDATE_CONTINUATION,
} from "./game-update-model.mjs";

/**
 * Win32 virtual key codes used by this bridge.
 * Re-derived (see header) and pinned against `web/platform/input.js` by test.
 */
export const BRIDGE_VK = Object.freeze({
  RETURN: 0x0d,
  ESCAPE: 0x1b,
  LEFT: 0x25,
  UP: 0x26,
  RIGHT: 0x27,
  DOWN: 0x28,
  A: 0x41,
  D: 0x44,
  S: 0x53,
  W: 0x57,
});

/**
 * [BRIDGE CONVENTION] WASD / arrows as a1f280 pair0 analog sample.
 * The merge law (`managerPollA1f280DirBitsMerge`) is recovered. The key-to-axis
 * mapping is not. Does NOT write Game+0x2650c / +0x26510.
 */
export const A1F280_AXIS_DIR_THRESH = 0;
export const A1F280_AXIS_MAGNITUDE = 1;

/** Menu-lane actions this bridge understands. All names are local to it. */
export const MENU_ACTION = Object.freeze({
  TOGGLE: "menu_toggle",
  PREV: "menu_prev",
  NEXT: "menu_next",
  SUBMIT: "menu_submit",
});

/**
 * [BRIDGE CONVENTION] Default VK -> menu action map.
 * No PE evidence pins any of these; they are the conventional Isaac menu keys.
 */
export const DEFAULT_MENU_KEYMAP = Object.freeze({
  [BRIDGE_VK.ESCAPE]: MENU_ACTION.TOGGLE,
  [BRIDGE_VK.UP]: MENU_ACTION.PREV,
  [BRIDGE_VK.LEFT]: MENU_ACTION.PREV,
  [BRIDGE_VK.DOWN]: MENU_ACTION.NEXT,
  [BRIDGE_VK.RIGHT]: MENU_ACTION.NEXT,
  [BRIDGE_VK.RETURN]: MENU_ACTION.SUBMIT,
});

/**
 * KeyboardEvent.code -> VK for the keys this bridge maps.
 * Minimal re-derivation; value-parity with `web/platform/input.js` is asserted
 * by the test suite.
 */
const CODE_TO_VK = Object.freeze({
  Enter: BRIDGE_VK.RETURN,
  NumpadEnter: BRIDGE_VK.RETURN,
  Escape: BRIDGE_VK.ESCAPE,
  ArrowLeft: BRIDGE_VK.LEFT,
  ArrowUp: BRIDGE_VK.UP,
  ArrowRight: BRIDGE_VK.RIGHT,
  ArrowDown: BRIDGE_VK.DOWN,
  KeyA: BRIDGE_VK.A,
  KeyD: BRIDGE_VK.D,
  KeyS: BRIDGE_VK.S,
  KeyW: BRIDGE_VK.W,
});

/** Map a KeyboardEvent-like `code` (or `key` fallback) to a VK, 0 if unmapped. */
export function bridgeCodeToVk(code, key = "") {
  if (code && CODE_TO_VK[code] != null) return CODE_TO_VK[code];
  if (key && CODE_TO_VK[key] != null) return CODE_TO_VK[key];
  return 0;
}

/**
 * Recovered sparse Game-object fields this bridge writes.
 * Offsets are quoted from `decomp/game-update-slice.json` "fields" and are
 * cross-checked against `BINARY_LAYOUT` at module load (see below).
 */
export const MENU_LANE_SPARSE_FIELDS = Object.freeze({
  menuState23a74: Object.freeze({
    binaryOffset: 0x23a74,
    note: "Game+0x23a74; receives VA 0x009b7680 / VA 0x009b6840; recaptured before the translated VA 0x009b7650 exit predicate",
  }),
  genericPromptActiveObject: Object.freeze({
    binaryOffset: 0x267ac,
    note: "Game+0x267ac; first recovered GenericPrompt::IsActive operand (GenericPrompt+0x34)",
  }),
  genericPromptActiveFlag: Object.freeze({
    binaryOffset: 0x267bc,
    note: "Game+0x267bc; second recovered GenericPrompt::IsActive operand (GenericPrompt+0x44)",
  }),
  genericPromptSubmittedSelection: Object.freeze({
    binaryOffset: 0x268a4,
    note: "Game+0x268a4; value 1 starts the mode-7 transition when genericPromptPostUpdateFlag is zero",
  }),
  genericPromptPostUpdateFlag: Object.freeze({
    binaryOffset: 0x268a8,
    note: "Game+0x268a8; nonzero suppresses the mode-7 transition",
  }),
});

/**
 * Recovered runtime inputs this bridge drives (names/sources quoted from
 * `decomp/game-update-slice.json` "runtimeInputs").
 */
export const MENU_LANE_RUNTIME_INPUTS = Object.freeze({
  globalMenuGuard4b3ca: Object.freeze({
    source: "byte at *0x00c7169c + 0x4b3ca (Manager+0x4b3ca)",
    browserDefault: 1,
    note: "low byte must be ZERO before VA 0x009b7680 can open the menu object",
  }),
  globalMenuEnable2a3a5: Object.freeze({
    source: "byte at *0x00c7169c + 0x2a3a5 (Manager+0x2a3a5)",
    browserDefault: 0,
    note: "low byte must be NONZERO before VA 0x009b7680 can open the menu object",
  }),
  globalRangeByteLength: Object.freeze({
    source: "*0x00c7169c + [0x4b3d8, 0x4b3dc) raw uint32(end - begin)",
    browserDefault: 8,
    note: "NOT keyboard-derived; must be 0 for the menu-open gate (cpp:1754) and is also the menu-gate exit predicate operand (cpp:1651-1652)",
  }),
});

/** Update-slice continuations this bridge can steer the tick into. */
export const MENU_LANE_CONTINUATIONS = Object.freeze({
  RESUME_AFTER_GENERIC_PROMPT_UPDATE: UPDATE_CONTINUATION.RESUME_AFTER_GENERIC_PROMPT_UPDATE,
  RETURN_AFTER_GENERIC_PROMPT_TRANSITION: UPDATE_CONTINUATION.RETURN_AFTER_GENERIC_PROMPT_TRANSITION,
  RESUME_AFTER_MENU_OPEN: UPDATE_CONTINUATION.RESUME_AFTER_MENU_OPEN,
  RESUME_AFTER_MENU_UPDATE: UPDATE_CONTINUATION.RESUME_AFTER_MENU_UPDATE,
  RETURN_AFTER_MENU_GATE_EXIT: UPDATE_CONTINUATION.RETURN_AFTER_MENU_GATE_EXIT,
});

/** Host-event kinds the menu lane emits (residual bodies stay host). */
export const MENU_LANE_HOST_EVENT_KINDS = Object.freeze([
  "opaqueCall009b7680", // menu open body
  "opaqueCall009b6840", // MenuGate_Update body (pure early-out gated)
  "menuAuxListClear", // monolithic menu-aux erase residual
  "genericPromptUpdate", // GenericPrompt::Update(false)
]);

/**
 * [BRIDGE CONVENTION] Sentinel written into `genericPromptActiveObject`.
 * The PE stores a real GenericPrompt object pointer here; the browser sparse
 * session has no such object. Only `!= 0` is tested (cpp:1457), so any nonzero
 * value selects the prompt lane. 1 is NOT a recovered pointer value.
 */
export const GENERIC_PROMPT_ACTIVE_SENTINEL = 1;

/**
 * [BRIDGE CONVENTION] Selection value the bridge starts a freshly opened menu
 * at. 1 is the ONLY selection value with a recovered predicate
 * (cpp:1536 `generic_prompt_submitted_selection == 1`); there is no recovered
 * menu-entry count anywhere in the slice, so the arrow keys walk an unbounded
 * (clamped at 0) integer rather than a real entry list.
 */
export const MENU_SELECTION_ON_OPEN = 1;

/* Fail loudly if the tracked layout ever moves under us. */
for (const [name, spec] of Object.entries(MENU_LANE_SPARSE_FIELDS)) {
  const tracked = BINARY_LAYOUT[name];
  if (!tracked || tracked.offset !== spec.binaryOffset) {
    throw new Error(
      `frame-input-bridge: ${name} offset drifted from BINARY_LAYOUT ` +
        `(bridge 0x${spec.binaryOffset.toString(16)}, tracked ` +
        `${tracked ? `0x${tracked.offset.toString(16)}` : "<missing>"})`,
    );
  }
}

function writeBinaryField(view, name, value) {
  const field = BINARY_LAYOUT[name];
  switch (field.type) {
    case "i32":
      view.setInt32(field.offset, value | 0, true);
      return;
    case "u32":
      view.setUint32(field.offset, value >>> 0, true);
      return;
    case "u8":
      view.setUint8(field.offset, value & 0xff);
      return;
    case "f32":
      view.setFloat32(field.offset, Math.fround(value), true);
      return;
    default:
      throw new Error(`frame-input-bridge: unsupported field type ${field.type} for ${name}`);
  }
}

/**
 * Report, conjunct by conjunct, whether the recovered menu-open gate at
 * `native/decomp/game_update_slice.cpp:1752-1755` would fire.
 * Pure diagnostic — no state, no side effects.
 *
 * @param {object} runtimeInputs runtime-input object (as passed to session.tick)
 * @param {object} [sparseState] sparse state (only `menuState23a74` is read)
 * @returns {{opens:boolean, blockedBy:string[], conjuncts:object[]}}
 */
export function describeMenuOpenGate(runtimeInputs = {}, sparseState = {}) {
  const conjuncts = [
    {
      name: "globalMenuGuard4b3ca",
      site: "game_update_slice.cpp:1752",
      required: "(value & 0xff) == 0",
      value: (runtimeInputs.globalMenuGuard4b3ca ?? 0) & 0xff,
      ok: ((runtimeInputs.globalMenuGuard4b3ca ?? 0) & 0xff) === 0,
      ownedByBridge: true,
    },
    {
      name: "globalMenuEnable2a3a5",
      site: "game_update_slice.cpp:1753",
      required: "(value & 0xff) != 0",
      value: (runtimeInputs.globalMenuEnable2a3a5 ?? 0) & 0xff,
      ok: ((runtimeInputs.globalMenuEnable2a3a5 ?? 0) & 0xff) !== 0,
      ownedByBridge: true,
    },
    {
      name: "globalRangeByteLength",
      site: "game_update_slice.cpp:1754",
      required: "value == 0",
      value: (runtimeInputs.globalRangeByteLength ?? 0) >>> 0,
      ok: ((runtimeInputs.globalRangeByteLength ?? 0) >>> 0) === 0,
      /* NOT keyboard-derived. See the header's KNOWN BLOCKER section. */
      ownedByBridge: false,
    },
    {
      name: "menuState23a74",
      site: "game_update_slice.cpp:1755",
      required: "value == 0",
      value: (sparseState.menuState23a74 ?? 0) | 0,
      ok: ((sparseState.menuState23a74 ?? 0) | 0) === 0,
      ownedByBridge: true,
    },
  ];
  return {
    opens: conjuncts.every((c) => c.ok),
    blockedBy: conjuncts.filter((c) => !c.ok).map((c) => c.name),
    conjuncts,
  };
}

/**
 * Create the DOM-free keyboard -> Update-slice menu-lane bridge.
 *
 * @param {object}  [options]
 * @param {object}  [options.keymap] VK -> MENU_ACTION map (default DEFAULT_MENU_KEYMAP)
 * @param {boolean} [options.emptyGlobalRangeOnMenuOpen=true] drive the
 *   non-keyboard `globalRangeByteLength` capture to 0 while the lane is open;
 *   see the header's KNOWN BLOCKER section before turning this off
 * @param {boolean} [options.submitRequiresMenuOpen=true] [BRIDGE CONVENTION]
 *   Enter only arms the generic prompt while the menu lane is latched open, so
 *   a stray Enter during gameplay cannot hijack the tick
 */
export function createInputBridge({
  keymap = DEFAULT_MENU_KEYMAP,
  emptyGlobalRangeOnMenuOpen = true,
  submitRequiresMenuOpen = true,
} = {}) {
  const vkDown = new Set();
  /** Edge log for the current tick; drained by consumeEdges(). */
  let pressed = [];
  let released = [];

  /* ---- latched menu-lane model (all [BRIDGE CONVENTION]) ---- */
  let menuOpen = false; // Escape toggles
  let openPending = false; // one tick with menuState23a74 == 0 so cpp:1755 passes
  let selection = 0; // arrow-adjusted; written to genericPromptSubmittedSelection
  let submitArmed = false; // Enter; one tick of prompt-active + submitted selection
  /* One trailing patch after the lane goes idle, so a close edge is observed
     by the session instead of leaving the last open-lane values latched. */
  let closeNeedsPublish = false;

  function actionFor(vk) {
    return keymap[vk] ?? null;
  }

  function applyPressAction(action) {
    switch (action) {
      case MENU_ACTION.TOGGLE:
        if (menuOpen) {
          /* Close: guard back to 1, enable back to 0, menuState back to 0. */
          menuOpen = false;
          openPending = false;
          submitArmed = false;
          selection = 0;
        } else {
          menuOpen = true;
          openPending = true;
          selection = MENU_SELECTION_ON_OPEN;
        }
        return;
      case MENU_ACTION.PREV:
        if (!menuOpen) return;
        selection = Math.max(0, selection - 1);
        return;
      case MENU_ACTION.NEXT:
        if (!menuOpen) return;
        selection += 1;
        return;
      case MENU_ACTION.SUBMIT:
        if (submitRequiresMenuOpen && !menuOpen) return;
        submitArmed = true;
        return;
      default:
    }
  }

  /**
   * Record a key transition. Press edges are applied to the latched model
   * immediately; auto-repeat (a press while already down) is ignored.
   * @param {number} vk Win32 virtual key code
   * @param {boolean} down true for keydown, false for keyup
   * @returns {{vk:number, action:string|null, edge:"press"|"release"|null}}
   */
  function setKey(vk, down) {
    const code = vk | 0;
    if (!code) return { vk: 0, action: null, edge: null };
    const action = actionFor(code);
    if (down) {
      if (vkDown.has(code)) return { vk: code, action, edge: null };
      vkDown.add(code);
      pressed.push(code);
      applyPressAction(action);
      return { vk: code, action, edge: "press" };
    }
    if (!vkDown.has(code)) return { vk: code, action, edge: null };
    vkDown.delete(code);
    released.push(code);
    return { vk: code, action, edge: "release" };
  }

  /**
   * `setKey` addressed by KeyboardEvent.code (with optional `key` fallback).
   * @param {string} keyCode KeyboardEvent.code
   * @param {boolean} down
   * @param {string} [key] KeyboardEvent.key
   */
  function setKeyByCode(keyCode, down, key = "") {
    return setKey(bridgeCodeToVk(keyCode, key), down);
  }

  /**
   * Release every held key. Does NOT close the menu lane: losing window focus
   * drops keys, it does not dismiss an open menu. [BRIDGE CONVENTION]
   */
  function clear() {
    for (const vk of [...vkDown]) setKey(vk, false);
    vkDown.clear();
  }

  function heldActions() {
    const out = new Set();
    for (const vk of vkDown) {
      const action = actionFor(vk);
      if (action) out.add(action);
    }
    return out;
  }

  /** Current menu-lane latch, for diagnostics/tests/presentation. */
  function menuLane() {
    return {
      open: menuOpen,
      openPending,
      selection,
      submitArmed,
      /* menuState23a74 the next toStatePatch() will publish. */
      menuState23a74: menuOpen && !openPending ? 1 : 0,
    };
  }

  /**
   * Non-destructive view of the tracker.
   * @returns {{vkDown:Set<number>, actions:Set<string>, edges:{pressed:number[], released:number[]}, menu:object}}
   */
  function snapshot() {
    return {
      vkDown: new Set(vkDown),
      actions: heldActions(),
      edges: { pressed: [...pressed], released: [...released] },
      menu: menuLane(),
    };
  }

  /**
   * Runtime inputs for this tick, merged over `createDefaultNativeRuntimeInputs()`.
   * Only the three menu-lane runtime inputs are touched.
   * @param {object|null} [base] extra runtime inputs applied under the bridge's
   * @returns {object}
   */
  function toA1f280AxisSamples() {
    let x = 0;
    let y = 0;
    if (vkDown.has(BRIDGE_VK.A)) x -= A1F280_AXIS_MAGNITUDE;
    if (vkDown.has(BRIDGE_VK.D)) x += A1F280_AXIS_MAGNITUDE;
    if (vkDown.has(BRIDGE_VK.W)) y -= A1F280_AXIS_MAGNITUDE;
    if (vkDown.has(BRIDGE_VK.S)) y += A1F280_AXIS_MAGNITUDE;
    if (!menuOpen) {
      if (vkDown.has(BRIDGE_VK.LEFT)) x -= A1F280_AXIS_MAGNITUDE;
      if (vkDown.has(BRIDGE_VK.RIGHT)) x += A1F280_AXIS_MAGNITUDE;
      if (vkDown.has(BRIDGE_VK.UP)) y -= A1F280_AXIS_MAGNITUDE;
      if (vkDown.has(BRIDGE_VK.DOWN)) y += A1F280_AXIS_MAGNITUDE;
    }
    return {
      readyAl: 1,
      fillPair0Al: 1,
      pair0: {
        x,
        y,
        dirThresh: A1F280_AXIS_DIR_THRESH,
        priorDirBits: 0,
      },
    };
  }

  function toRuntimeInputs(base = null) {
    const out = { ...createDefaultNativeRuntimeInputs(), ...(base || {}) };
    /* [W32-S5 merge fix, update-v110-bridgecapture §4] The three
       capture-emitted keys must NOT ride the bridge defaults: the bridge
       tick merges { ...captured, ...extraRuntime } with this object LAST,
       so a default here clobbers a live capture emission — roomGridCells
       15 vs the captured cells (e.g. 135) forever fails the b8Stash
       arming equality (effCells === b8Capture.cells) and the record-16
       pure in-place grid step + copy-back can NEVER arm once a guestRead
       answers the Room grids; b3b7SparseReady 0 dead-gates the 48-lane
       record-15 law pack; midRestockOwner0x209 1 force-opens the owner
       gate where native may be gate-closed. The session merges
       createDefaultNativeRuntimeInputs() itself at tick time, so dropping
       them here is INVISIBLE on the no-capture path (the session defaults
       still reach the module: 15/0/1 = the documented MENU-CLOSED arm)
       while capture-emitted lanes keep their values when present. */
    delete out.roomGridCells;
    delete out.b3b7SparseReady;
    delete out.midRestockOwner0x209;
    /* [BRIDGE CONVENTION] Escape latch -> the two recovered menu-open bytes.
       Closed reproduces the PE-documented browser defaults (guard 1, enable 0). */
    out.globalMenuGuard4b3ca = menuOpen ? 0 : 1;
    out.globalMenuEnable2a3a5 = menuOpen ? 1 : 0;
    /* [BRIDGE CONVENTION, NOT keyboard-derived] see header KNOWN BLOCKER. */
    if (menuOpen && emptyGlobalRangeOnMenuOpen) out.globalRangeByteLength = 0;
    return out;
  }

  /**
   * Sparse-state delta for this tick, for `session.tick(runtime, statePatch)`.
   * Keys are exactly `createDefaultNativeState()` field names.
   * @returns {object|null} null when the lane is idle and nothing must change
   */
  function toStatePatch() {
    const lane = menuLane();
    const promptActive = submitArmed;
    if (!menuOpen && !promptActive) {
      /* Idle: publish the closed-lane values once so a close edge is observed,
         then go quiet so the session's own state is left alone. */
      if (!closeNeedsPublish) return null;
      closeNeedsPublish = false;
      return {
        menuState23a74: 0,
        genericPromptActiveObject: 0,
        genericPromptActiveFlag: 0,
        genericPromptSubmittedSelection: 0,
        genericPromptPostUpdateFlag: 0,
      };
    }
    closeNeedsPublish = true;
    return {
      /* [BRIDGE CONVENTION] the PE's VA 0x009b7680 body is what actually sets
         Game+0x23a74; the browser residual host is a counting stub, so the
         bridge publishes the post-open value one tick later (openPending). */
      menuState23a74: lane.menuState23a74,
      /* [BRIDGE CONVENTION] sentinel, not a recovered GenericPrompt pointer. */
      genericPromptActiveObject: promptActive ? GENERIC_PROMPT_ACTIVE_SENTINEL : 0,
      genericPromptActiveFlag: promptActive ? 1 : 0,
      /* [BRIDGE CONVENTION] arrow-walked selection; only ==1 has a recovered
         predicate (cpp:1536). */
      genericPromptSubmittedSelection: promptActive ? selection | 0 : 0,
      /* Recovered: nonzero here suppresses the mode-7 transition (cpp:1535). */
      genericPromptPostUpdateFlag: 0,
    };
  }

  /**
   * Write the sparse menu fields straight into a Game-object buffer.
   * NOT for `createNativeUpdateSession` (see header) — use `toStatePatch()`.
   * @param {Uint8Array} buffer Game-object buffer, >= GAME_OBJECT_MIN_SIZE
   * @returns {object} the field values written
   */
  function applyToGameObject(buffer) {
    if (!(buffer instanceof Uint8Array)) {
      throw new Error("applyToGameObject requires a Uint8Array game-object buffer");
    }
    if (buffer.byteLength < GAME_OBJECT_MIN_SIZE) {
      throw new Error(
        `applyToGameObject requires >= ${GAME_OBJECT_MIN_SIZE} bytes, got ${buffer.byteLength}`,
      );
    }
    const lane = menuLane();
    const promptActive = submitArmed;
    const fields = {
      menuState23a74: lane.menuState23a74,
      genericPromptActiveObject: promptActive ? GENERIC_PROMPT_ACTIVE_SENTINEL : 0,
      genericPromptActiveFlag: promptActive ? 1 : 0,
      genericPromptSubmittedSelection: promptActive ? selection | 0 : 0,
      genericPromptPostUpdateFlag: 0,
    };
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    for (const [name, value] of Object.entries(fields)) writeBinaryField(view, name, value);
    return fields;
  }

  /**
   * Tick barrier. Call EXACTLY ONCE per Update tick, AFTER the tick.
   * Drains the press/release edge log and retires the one-shot lane phases.
   * @returns {{pressed:number[], released:number[]}}
   */
  function consumeEdges() {
    const edges = { pressed, released };
    pressed = [];
    released = [];
    /* The menu-open host edge (VA 0x009b7680) was delivered on the tick just
       run; from here on the lane reports menuState23a74 == 1. */
    if (openPending) openPending = false;
    /* Enter is a one-shot submit, mirroring a message-pump edge, not a level. */
    submitArmed = false;
    return edges;
  }

  return {
    setKey,
    setKeyByCode,
    clear,
    snapshot,
    toRuntimeInputs,
    toA1f280AxisSamples,
    toStatePatch,
    applyToGameObject,
    consumeEdges,
    describeMenuOpenGate: (runtimeInputs = null, sparseState = null) =>
      describeMenuOpenGate(runtimeInputs || toRuntimeInputs(), sparseState || {
        menuState23a74: menuLane().menuState23a74,
      }),
    get menu() {
      return menuLane();
    },
    get keymap() {
      return keymap;
    },
    get emptyGlobalRangeOnMenuOpen() {
      return emptyGlobalRangeOnMenuOpen;
    },
  };
}

export default {
  BRIDGE_VK,
  MENU_ACTION,
  DEFAULT_MENU_KEYMAP,
  MENU_LANE_SPARSE_FIELDS,
  MENU_LANE_RUNTIME_INPUTS,
  MENU_LANE_CONTINUATIONS,
  MENU_LANE_HOST_EVENT_KINDS,
  bridgeCodeToVk,
  describeMenuOpenGate,
  createInputBridge,
};
