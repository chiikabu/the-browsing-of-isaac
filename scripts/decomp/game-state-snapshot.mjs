/**
 * Captured-Game-state loader for the native frame path.
 *
 * The hybrid Update/Render slices tick over a JS-owned buffer that is normally
 * all zeros, so the render path correctly draws nothing: no player, no room,
 * no entities. This module loads a *real* buffer captured out of live PE
 * process memory so the wired frame path has something to render.
 *
 * ---------------------------------------------------------------------------
 * Where the buffers come from (evidence, tools/isaac-ng.unpacked.exe
 * SHA-256 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200)
 * ---------------------------------------------------------------------------
 *
 * `g_Game` is the global at VA `0x00c71678` (preferred image base 0x00400000):
 *
 *   FUN_00753cf0:  mov eax, dword ptr [0xc71678]   ; whole function
 *                  add eax, 0x23a74                ; Game+0x23a74 == menuState23a74
 *                  ret
 *   0x00952817:    push 0x68e88                    ; sizeof(Game)
 *                  call operator new
 *                  call 0x006f1020                 ; Game::Game(this)
 *                  mov dword ptr [0xc71678], eax   ; g_Game = new Game
 *
 * So `gameObject` here is `*(uint32_t*)0x00c71678`, `GAME_OBJECT_MIN_SIZE`
 * (0x68d70) bytes — the object `BINARY_LAYOUT` in game-update-model.mjs is
 * indexed against.
 *
 * The RENDER shell (`FUN_0080ea80`) does NOT receive the Game. Both of its
 * real callers do:
 *
 *   0x00831630:  mov edi, dword ptr [0xc71678]     ; edi = g_Game
 *                mov ecx, dword ptr [edi+0x18300]  ; ecx = *(Game+0x18300)
 *                call 0x0080ea80
 *
 * so the render slice's `this` (and therefore gridW@0x0c, gridH@0x10,
 * cameraBase@0x1204, entityArray@0x125c, entityCount@0x1264) belongs to the
 * object at `*(Game+0x18300)`, whose slice size is
 * `GAME_RENDER_GAME_OBJECT_MIN_SIZE` (0x3bb20). Feeding the Game object to the
 * render slice would read the wrong fields. The two snapshots are therefore
 * distinct files and must not be swapped.
 *
 * ---------------------------------------------------------------------------
 * Availability
 * ---------------------------------------------------------------------------
 * Captures are binary-derived local evidence: they live under the ignored
 * `output/` root and are never committed. Every loader here is therefore
 * *optional by default* — it resolves to `null` when the capture is absent so
 * the app still boots to the existing zero-buffer behaviour. Pass
 * `{ required: true }` to turn a missing capture into a thrown error.
 */

import { GAME_OBJECT_MIN_SIZE } from "./game-update-model.mjs";
import { GAME_RENDER_GAME_OBJECT_MIN_SIZE } from "./game-render-model.mjs";

/** First 12 hex chars of the analysis binary's SHA-256 — captures are keyed by it. */
export const GAME_STATE_BINARY_SHA12 = "5129df723e64";

/** Served prefix: scripts/serve.mjs maps /@decomp/pure/* -> output/decomp/*. */
export const GAME_STATE_SNAPSHOT_BASE_URL =
  `/@decomp/pure/gamestate/${GAME_STATE_BINARY_SHA12}`;

/** Repo-relative directory holding the captures (ignored via /output/). */
export const GAME_STATE_SNAPSHOT_DIR =
  `output/decomp/gamestate/${GAME_STATE_BINARY_SHA12}`;

/** Default capture label. Prefer a live Steam dump when present. */
export const DEFAULT_SNAPSHOT_LABEL = "live";

/** ZHL Entity::_pos / _velocity. Not Game+0x2650c. */
export const ENTITY_POS_OFF = 0x33c;
export const ENTITY_VEL_OFF = 0x360;
/** Fallback per-30Hz step when the captured player was standing still. */
export const CAPTURED_PLAYER_SPEED = 5;

export { GAME_OBJECT_MIN_SIZE, GAME_RENDER_GAME_OBJECT_MIN_SIZE };

/** `*(Game+0x18300)` is the render shell receiver (see header). */
export const RENDER_ROOT_POINTER_OFFSET = 0x18300;

/** Game* global, preferred-image-base VA. */
export const GAME_GLOBAL_VA = 0x00c71678;

export function gameObjectSnapshotUrl(label = DEFAULT_SNAPSHOT_LABEL, base = GAME_STATE_SNAPSHOT_BASE_URL) {
  return `${base}/game-object-${label}.bin`;
}

export function renderRootSnapshotUrl(label = DEFAULT_SNAPSHOT_LABEL, base = GAME_STATE_SNAPSHOT_BASE_URL) {
  return `${base}/render-root-${label}.bin`;
}

export function snapshotSidecarUrl(label = DEFAULT_SNAPSHOT_LABEL, base = GAME_STATE_SNAPSHOT_BASE_URL) {
  return `${base}/game-object-${label}.json`;
}

export function entitiesSnapshotUrl(label = DEFAULT_SNAPSHOT_LABEL, base = GAME_STATE_SNAPSHOT_BASE_URL) {
  return `${base}/entities-${label}.json`;
}

export function entityBlobUrl(fileName, base = GAME_STATE_SNAPSHOT_BASE_URL) {
  return `${base}/${fileName}`;
}

export function isBrowserEnvironment() {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/** Missing-capture signal. `.missing` is true so callers can branch without string matching. */
export class GameStateSnapshotMissingError extends Error {
  constructor(source, cause) {
    super(
      `game-state snapshot not found at ${source}. Captures are local evidence under ` +
        `${GAME_STATE_SNAPSHOT_DIR}/ (gitignored) and are absent on a machine that has not ` +
        `run the capture. The frame path falls back to the zero buffer.`,
    );
    this.name = "GameStateSnapshotMissingError";
    this.missing = true;
    this.source = source;
    if (cause !== undefined) this.cause = cause;
  }
}

async function readBytes(source) {
  if (source instanceof Uint8Array) return source;
  if (source instanceof ArrayBuffer) return new Uint8Array(source);
  if (typeof source !== "string") {
    throw new TypeError(`snapshot source must be a string URL/path, got ${typeof source}`);
  }
  const looksHttp = /^https?:\/\//.test(source);
  if (looksHttp || (isBrowserEnvironment() && source.startsWith("/"))) {
    let res;
    try {
      res = await fetch(source);
    } catch (err) {
      throw new GameStateSnapshotMissingError(source, err);
    }
    if (res.status === 404) throw new GameStateSnapshotMissingError(source);
    if (!res.ok) throw new Error(`fetch ${source} failed: ${res.status}`);
    return new Uint8Array(await res.arrayBuffer());
  }
  const { readFile } = await import("node:fs/promises");
  try {
    return new Uint8Array(await readFile(source));
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) {
      throw new GameStateSnapshotMissingError(source, err);
    }
    throw err;
  }
}

/**
 * Resolve a served URL to a repo path when running under Node, so the same
 * call site works in the browser and in a Node driver/test.
 */
export async function resolveSnapshotSource(source) {
  if (typeof source !== "string" || isBrowserEnvironment()) return source;
  if (/^https?:\/\//.test(source)) return source;
  if (!source.startsWith("/@decomp/pure/")) return source;
  const { dirname, join, resolve } = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  return join(root, "output", "decomp", source.slice("/@decomp/pure/".length));
}

/**
 * Load a captured buffer.
 *
 * @param {string|Uint8Array|ArrayBuffer} source  Served URL, filesystem path, or raw bytes.
 * @param {object} [opts]
 * @param {number} [opts.minSize]   Reject a short capture (defaults to no check).
 * @param {boolean} [opts.required] Throw instead of returning null when absent.
 * @param {(msg: string) => void} [opts.warn] Sink for the "falling back to zeros" notice.
 * @returns {Promise<Uint8Array|null>} The bytes, or null when absent and not required.
 */
export async function loadGameObjectSnapshot(source = gameObjectSnapshotUrl(), opts = {}) {
  const { minSize = GAME_OBJECT_MIN_SIZE, required = false, warn = null } = opts;
  const resolved = await resolveSnapshotSource(source);
  let bytes;
  try {
    bytes = await readBytes(resolved);
  } catch (err) {
    if (err instanceof GameStateSnapshotMissingError && !required) {
      if (typeof warn === "function") warn(err.message);
      return null;
    }
    throw err;
  }
  if (minSize != null && bytes.byteLength < minSize) {
    throw new Error(
      `game-state snapshot ${resolved} is ${bytes.byteLength} bytes, expected >= ${minSize}`,
    );
  }
  return bytes;
}

/**
 * Pad a short Steam render-root page-walk to the slice size. Live captures
 * often stop at an unmapped page (~0x1c000) but grid/entity headers sit at
 * 0x0c..0x1264.
 */
export function padRenderRootSnapshot(bytes, size = GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
  if (!(bytes instanceof Uint8Array)) return null;
  if (bytes.byteLength >= size) return bytes;
  const out = new Uint8Array(size);
  out.set(bytes);
  return out;
}

/** Same contract, sized/typed for the render shell receiver `*(Game+0x18300)`. */
export async function loadRenderRootSnapshot(source = renderRootSnapshotUrl(), opts = {}) {
  const { minSize = GAME_RENDER_GAME_OBJECT_MIN_SIZE, warn = null, ...rest } = opts;
  const headerMin = 0x1268;
  const bytes = await loadGameObjectSnapshot(source, {
    ...rest,
    warn,
    minSize: null,
  });
  if (!bytes) return null;
  if (bytes.byteLength < headerMin) {
    const msg = `render-root snapshot ${source} is ${bytes.byteLength} bytes, expected >= ${headerMin}`;
    if (rest.required) throw new Error(msg);
    if (typeof warn === "function") warn(msg);
    return null;
  }
  if (bytes.byteLength < minSize) {
    if (typeof warn === "function") {
      warn(`render-root snapshot padded ${bytes.byteLength} -> ${minSize} (partial page-walk)`);
    }
    return padRenderRootSnapshot(bytes, minSize);
  }
  return bytes;
}

function parseAddr(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value >>> 0;
  if (typeof value === "string") return parseInt(value, 16) >>> 0;
  return 0;
}

/**
 * Load `entities-<label>.json` plus each `entity-*.bin` blob.
 * Local evidence only; absent on machines that have not captured.
 */
export async function loadEntitiesSnapshot(source = entitiesSnapshotUrl(), opts = {}) {
  const sidecar = await loadSnapshotSidecar(source, opts);
  if (!sidecar || !Array.isArray(sidecar.entities)) return null;
  const base = String(source).replace(/\/[^/]+$/, "");
  const entities = [];
  for (const row of sidecar.entities) {
    if (!row || !row.file) continue;
    const bytes = await loadGameObjectSnapshot(entityBlobUrl(row.file, base), {
      minSize: null,
      required: false,
      warn: opts.warn,
    });
    entities.push({
      ...row,
      address: parseAddr(row.address),
      bytes,
    });
  }
  return { ...sidecar, entities };
}

/** Pack Room+0x125c pointer words from captured entity rows (index-addressed). */
export function packEntityPointerArray(entities, count) {
  const n = Math.max(0, count | 0);
  const buf = new Uint8Array(n * 4);
  const view = new DataView(buf.buffer);
  for (const row of entities || []) {
    const i = row.index | 0;
    const addr = parseAddr(row.address);
    if (i >= 0 && i < n && addr) view.setUint32(i * 4, addr, true);
  }
  return buf;
}

function f32pair(x, y) {
  const u = new Uint8Array(8);
  const v = new DataView(u.buffer);
  v.setFloat32(0, x, true);
  v.setFloat32(4, y, true);
  return u;
}

/**
 * Inverse of recovered pair0 dirBits (`A1F280_DIR_*` in process-input-pure-model).
 * Opposite bits cancel. Not a PE function — the unique inverse of
 * `managerPollA1f280AxisPairBits` for bitBase 0.
 */
export function unitAxisFromA1f280DirBits(dirBits) {
  const bits = dirBits >>> 0;
  let x = 0;
  let y = 0;
  if (bits & 0x1) x -= 1;
  if (bits & 0x2) x += 1;
  if (bits & 0x4) y -= 1;
  if (bits & 0x8) y += 1;
  const mag = Math.hypot(x, y);
  if (!(mag > 0)) return { x: 0, y: 0, mag: 0 };
  return { x: x / mag, y: y / mag, mag };
}

/**
 * [BRIDGE CONVENTION] Write captured Entity `_vel` / `_pos` from a1f280 dirBits.
 * Diagonals are unit-normalized (Isaac 8-way). Speed is constant — never
 * hypot(_vel), which ran away on strafe. Not Entity_Player::Update.
 * Does not touch Game+0x2650c.
 */
export function applyDirBitsToCapturedEntity(guest, entityAddr, axis = {}) {
  if (!guest || typeof guest.read !== "function" || typeof guest.write !== "function") {
    return null;
  }
  const addr = entityAddr >>> 0;
  if (!addr) return null;
  const bits = (axis.dirBits ?? axis.dirBitsMerged ?? 0) >>> 0;
  let nx = Number(axis.axisX) || 0;
  let ny = Number(axis.axisY) || 0;
  if (bits) {
    const unit = unitAxisFromA1f280DirBits(bits);
    nx = unit.x;
    ny = unit.y;
  } else {
    const mag = Math.hypot(nx, ny);
    if (mag > 0) { nx /= mag; ny /= mag; }
    else { nx = 0; ny = 0; }
  }
  const dt = Number.isFinite(axis.tickScale) ? axis.tickScale : 1;
  let speed = Number(axis.speed);
  if (!Number.isFinite(speed) || speed <= 0) speed = CAPTURED_PLAYER_SPEED;
  const vx = nx * speed;
  const vy = ny * speed;
  guest.write((addr + ENTITY_VEL_OFF) >>> 0, f32pair(vx, vy));
  const posBytes = guest.read((addr + ENTITY_POS_OFF) >>> 0, 8);
  if (!posBytes || posBytes.length < 8) return { address: addr, vx, vy, speed };
  const pv = new DataView(posBytes.buffer, posBytes.byteOffset, posBytes.byteLength);
  const x = pv.getFloat32(0, true) + vx * dt;
  const y = pv.getFloat32(4, true) + vy * dt;
  guest.write((addr + ENTITY_POS_OFF) >>> 0, f32pair(x, y));
  return { address: addr, x, y, vx, vy, speed };
}

/** The all-zero buffer the frame path uses today. */
export function createZeroGameObject(size = GAME_OBJECT_MIN_SIZE) {
  return new Uint8Array(size);
}

/**
 * Snapshot-or-zeros: never throws for a missing capture, so a caller can seed
 * unconditionally and keep the current behaviour when nothing was captured.
 * @returns {Promise<{buffer: Uint8Array, seeded: boolean, source: string|null, reason: string|null}>}
 */
export async function loadGameObjectSnapshotOrZeros(source = gameObjectSnapshotUrl(), opts = {}) {
  const size = opts.minSize ?? GAME_OBJECT_MIN_SIZE;
  let reason = null;
  const bytes = await loadGameObjectSnapshot(source, {
    ...opts,
    minSize: size,
    required: false,
    warn: (m) => {
      reason = m;
      if (typeof opts.warn === "function") opts.warn(m);
    },
  });
  if (!bytes) return { buffer: createZeroGameObject(size), seeded: false, source: null, reason };
  const buffer = bytes.byteLength === size ? bytes : bytes.slice(0, size);
  return { buffer, seeded: true, source: typeof source === "string" ? source : "<bytes>", reason: null };
}

/* ---------------------------------------------------------------------------
 * Probes — used to prove a capture is real rather than a zero/garbage buffer.
 * Offsets are the tracked ones (BINARY_LAYOUT / game-render-slice.json fields).
 * ------------------------------------------------------------------------- */

export const GAME_OBJECT_PROBES = Object.freeze({
  renderRootPointer: { offset: 0x18300, type: "u32" },
  menuState23a74: { offset: 0x23a74, type: "i32" },
  state24ecc: { offset: 0x24ecc, type: "i32" },
  itemOverlayState: { offset: 0x1c034, type: "i32" },
  timedTransitionCleanupMode: { offset: 0x26614, type: "i32" },
  frameCounter264f8: { offset: 0x264f8, type: "i32" },
  playerVectorBegin: { offset: 0x1baa8, type: "u32" },
  playerVectorEnd: { offset: 0x1baac, type: "u32" },
});

export const RENDER_ROOT_PROBES = Object.freeze({
  vtable: { offset: 0x00, type: "u32" },
  gameMode: { offset: 0x08, type: "i32" },
  gridW: { offset: 0x0c, type: "i32" },
  gridH: { offset: 0x10, type: "i32" },
  flag11f6: { offset: 0x11f6, type: "u8" },
  cameraBaseX: { offset: 0x1204, type: "f32" },
  cameraBaseY: { offset: 0x1208, type: "f32" },
  entityArray: { offset: 0x125c, type: "u32" },
  entityCount: { offset: 0x1264, type: "u32" },
  stage1d18: { offset: 0x1d18, type: "i32" },
});

function readProbe(view, spec) {
  switch (spec.type) {
    case "u8": return view.getUint8(spec.offset);
    case "i32": return view.getInt32(spec.offset, true);
    case "f32": return view.getFloat32(spec.offset, true);
    default: return view.getUint32(spec.offset, true) >>> 0;
  }
}

/** Read a probe set plus a non-degeneracy summary. */
export function describeSnapshot(buffer, probes = GAME_OBJECT_PROBES) {
  if (!(buffer instanceof Uint8Array)) throw new TypeError("buffer must be a Uint8Array");
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const values = {};
  for (const [name, spec] of Object.entries(probes)) {
    if (spec.offset + 4 > buffer.byteLength) continue;
    values[name] = readProbe(view, spec);
  }
  let nonZero = 0;
  for (let i = 0; i < buffer.byteLength; i += 1) if (buffer[i] !== 0) nonZero += 1;
  return {
    byteLength: buffer.byteLength,
    nonZeroBytes: nonZero,
    nonZeroRatio: buffer.byteLength ? nonZero / buffer.byteLength : 0,
    allZero: nonZero === 0,
    values,
  };
}

/** Fetch the JSON sidecar (module base, Game* value, probe readout at capture time). */
export async function loadSnapshotSidecar(source = snapshotSidecarUrl(), opts = {}) {
  const bytes = await loadGameObjectSnapshot(source, { minSize: null, required: false, ...opts });
  if (!bytes) return null;
  return JSON.parse(new TextDecoder().decode(bytes));
}

/* ---------------------------------------------------------------------------
 * Render recapture driven by a captured render-root object
 *
 * The render slice's entity and grid loops read arrays that live OUTSIDE the
 * captured object (the Entity* array is heap), so the driver deliberately
 * closes both loops when the caller supplies no per-iteration sequences
 * (frame-render-root.mjs:467-470 and :521-523). A captured render-root object
 * carries everything needed to rebuild those sequences:
 * ------------------------------------------------------------------------- */

/** Inline grid-slot array inside the render-root object. */
export const RENDER_ROOT_GRID_SLOTS_OFFSET = 0x24;
/** Driver clamps (frame-render-root.mjs GAME_RENDER_ENTITY/GRID_MAX_STEPS). */
export const RENDER_RECAPTURE_ENTITY_MAX = 64;
export const RENDER_RECAPTURE_GRID_MAX = 512;

/**
 * Build a recapture callback for runHybridGameRenderTick from a captured
 * render-root buffer. Returns {} for continuations it does not model, so the
 * driver's own defaults still apply.
 * @param {Uint8Array} renderRoot
 * @returns {(kind: number, ctx?: object) => object}
 */
export function createSnapshotRenderRecapture(renderRoot) {
  if (!(renderRoot instanceof Uint8Array)) {
    throw new TypeError("createSnapshotRenderRecapture requires a Uint8Array render-root snapshot");
  }
  if (renderRoot.byteLength < GAME_RENDER_GAME_OBJECT_MIN_SIZE) {
    throw new Error(
      `render-root snapshot must be >= ${GAME_RENDER_GAME_OBJECT_MIN_SIZE} bytes, got ${renderRoot.byteLength}`,
    );
  }
  const view = new DataView(renderRoot.buffer, renderRoot.byteOffset, renderRoot.byteLength);
  const entityArray = view.getUint32(RENDER_ROOT_PROBES.entityArray.offset, true) >>> 0;
  const entityCount = view.getInt32(RENDER_ROOT_PROBES.entityCount.offset, true) | 0;
  const gridW = view.getInt32(RENDER_ROOT_PROBES.gridW.offset, true) | 0;
  const gridH = view.getInt32(RENDER_ROOT_PROBES.gridH.offset, true) | 0;

  const entitySteps = Math.max(0, Math.min(entityCount, RENDER_RECAPTURE_ENTITY_MAX));
  const entityBaseSeq = new Array(entitySteps).fill(entityArray);
  const entityCountSeq = new Array(entitySteps).fill(entityCount >>> 0);

  const cells = Math.max(0, Math.min(gridW * gridH, RENDER_RECAPTURE_GRID_MAX));
  const gridSlots = new Array(cells);
  for (let i = 0; i < cells; i += 1) {
    gridSlots[i] = view.getUint32(RENDER_ROOT_GRID_SLOTS_OFFSET + i * 4, true) >>> 0;
  }

  return function snapshotRenderRecapture(kind) {
    /* 11 AT_TREE_ERASE / 12 AT_ENTITY, 13 AT_GRID_ENTRY — see
       native/decomp/game_render_slice.h continuation ids. */
    if (kind === 11 || kind === 12) {
      return { entryCount: entityCount >>> 0, entityBaseSeq, entityCountSeq };
    }
    if (kind === 13) {
      return { gridW, gridH, gridSlots };
    }
    return {};
  };
}

/** Probe summary of what a snapshot recapture will replay (diagnostics). */
export function describeSnapshotRecapture(renderRoot) {
  const view = new DataView(renderRoot.buffer, renderRoot.byteOffset, renderRoot.byteLength);
  const gridW = view.getInt32(RENDER_ROOT_PROBES.gridW.offset, true) | 0;
  const gridH = view.getInt32(RENDER_ROOT_PROBES.gridH.offset, true) | 0;
  let nonNull = 0;
  const cells = Math.max(0, Math.min(gridW * gridH, RENDER_RECAPTURE_GRID_MAX));
  for (let i = 0; i < cells; i += 1) {
    if (view.getUint32(RENDER_ROOT_GRID_SLOTS_OFFSET + i * 4, true)) nonNull += 1;
  }
  return {
    entityCount: view.getInt32(RENDER_ROOT_PROBES.entityCount.offset, true) | 0,
    entityArray: view.getUint32(RENDER_ROOT_PROBES.entityArray.offset, true) >>> 0,
    gridW, gridH, gridCells: cells, gridNonNull: nonNull,
  };
}
