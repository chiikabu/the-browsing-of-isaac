import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as SNAP from "../scripts/decomp/game-state-snapshot.mjs";
import { GAME_OBJECT_MIN_SIZE } from "../scripts/decomp/game-update-model.mjs";
import { GAME_RENDER_GAME_OBJECT_MIN_SIZE } from "../scripts/decomp/game-render-model.mjs";

/* Captured-Game-state loader.
 *
 * The captures this exercises are binary-derived local evidence: they live
 * under the ignored /output/ root and are NEVER committed, so a clean checkout
 * has none. Every capture-dependent test therefore skips with an explicit
 * message instead of failing. The module-contract tests below always run.
 *
 * Evidence for the addresses asserted here (tools/isaac-ng.unpacked.exe,
 * SHA-256 5129DF72...):
 *   g_Game global   VA 0x00c71678  — FUN_00753cf0 is exactly
 *                     mov eax,[0xc71678] ; add eax,0x23a74 ; ret
 *                     (Game+0x23a74 == BINARY_LAYOUT.menuState23a74), and
 *                     0x00952817 does push 0x68e88 / operator new /
 *                     call 0x006f1020 / mov [0xc71678],eax.
 *   render receiver *(Game+0x18300) — both callers of the render shell
 *                     FUN_0080ea80 do  mov edi,[0xc71678] ;
 *                     mov ecx,[edi+0x18300] ; call 0x0080ea80
 *                     (VA 0x00831630 and 0x00831e37), so gridW/gridH/
 *                     entityArray/entityCount are NOT Game fields.
 */

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const captureDir = join(repoRoot, "output", "decomp", "gamestate", SNAP.GAME_STATE_BINARY_SHA12);

const MISSING = join(repoRoot, "output", "decomp", "gamestate", "__no_such_capture__", "x.bin");

function skipMessage(file) {
  return `no capture on disk at ${file} — run the live-process capture first ` +
    "(binary-derived evidence is gitignored and absent on a clean checkout)";
}

/* --------------------------------------------------------------------------
 * Module contract — always runs, no capture required.
 * ------------------------------------------------------------------------ */

test("constants stay pinned to the tracked ABI and the PE evidence", () => {
  assert.equal(SNAP.GAME_OBJECT_MIN_SIZE, GAME_OBJECT_MIN_SIZE);
  assert.equal(SNAP.GAME_OBJECT_MIN_SIZE, 0x68d70);
  assert.equal(SNAP.GAME_RENDER_GAME_OBJECT_MIN_SIZE, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  assert.equal(SNAP.GAME_RENDER_GAME_OBJECT_MIN_SIZE, 0x3bb20);
  assert.equal(SNAP.GAME_GLOBAL_VA, 0x00c71678);
  assert.equal(SNAP.RENDER_ROOT_POINTER_OFFSET, 0x18300);
  assert.equal(SNAP.GAME_STATE_BINARY_SHA12, "5129df723e64");
});

test("render-root probe offsets match the tracked game-render-slice.json fields", () => {
  const slice = JSON.parse(readFileSync(join(repoRoot, "decomp", "game-render-slice.json"), "utf8"));
  const tracked = new Map();
  for (const f of slice.fields) {
    if (typeof f.binaryOffset === "string" && f.binaryOffset.startsWith("0x")) {
      tracked.set(f.name, Number.parseInt(f.binaryOffset, 16));
    }
  }
  // Probe name -> the tracked field it must mirror. Drift here silently turns a
  // real capture into "no entities / no grid" (or worse, plausible garbage).
  const pins = {
    gameMode: "gameMode",
    gridW: "gridW",
    gridH: "gridH",
    flag11f6: "flag11f6",
    cameraBaseX: "cameraBaseX",
    cameraBaseY: "cameraBaseY",
    entityArray: "entityArrayEntry",
    entityCount: "entityCountEntry",
    stage1d18: "stage1d18",
  };
  for (const [probe, field] of Object.entries(pins)) {
    assert.ok(tracked.has(field), `game-render-slice.json is missing field ${field}`);
    assert.equal(
      SNAP.RENDER_ROOT_PROBES[probe].offset,
      tracked.get(field),
      `probe ${probe} must sit at the tracked ${field} offset`,
    );
  }
  // The Game-object probes are pinned against BINARY_LAYOUT-documented offsets.
  assert.equal(SNAP.GAME_OBJECT_PROBES.menuState23a74.offset, 0x23a74);
  assert.equal(SNAP.GAME_OBJECT_PROBES.renderRootPointer.offset, SNAP.RENDER_ROOT_POINTER_OFFSET);
});

test("served URLs land under the /@decomp/pure/* mount serve.mjs already has", () => {
  // scripts/serve.mjs: /@decomp/pure/* -> output/decomp/*
  assert.equal(
    SNAP.gameObjectSnapshotUrl("inrun"),
    "/@decomp/pure/gamestate/5129df723e64/game-object-inrun.bin",
  );
  assert.equal(
    SNAP.renderRootSnapshotUrl("inrun"),
    "/@decomp/pure/gamestate/5129df723e64/render-root-inrun.bin",
  );
  assert.match(SNAP.GAME_STATE_SNAPSHOT_DIR, /^output\/decomp\/gamestate\//);
});

test("a missing capture is optional by default and explicit when required", async () => {
  const warnings = [];
  const got = await SNAP.loadGameObjectSnapshot(MISSING, { warn: (m) => warnings.push(m) });
  assert.equal(got, null, "absent capture must resolve to null, not throw");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /not found/);

  await assert.rejects(
    () => SNAP.loadGameObjectSnapshot(MISSING, { required: true }),
    (err) => {
      assert.ok(err instanceof SNAP.GameStateSnapshotMissingError);
      assert.equal(err.missing, true);
      return true;
    },
  );
});

test("loadGameObjectSnapshotOrZeros keeps the current zero-buffer boot path", async () => {
  const r = await SNAP.loadGameObjectSnapshotOrZeros(MISSING);
  assert.equal(r.seeded, false);
  assert.equal(r.buffer.byteLength, GAME_OBJECT_MIN_SIZE);
  assert.ok(r.reason && /not found/.test(r.reason));
  assert.ok(SNAP.describeSnapshot(r.buffer).allZero, "fallback must be the all-zero buffer");
});

test("a short capture is rejected rather than silently padded", async () => {
  await assert.rejects(
    () => SNAP.loadGameObjectSnapshot(new Uint8Array(16), { minSize: GAME_OBJECT_MIN_SIZE }),
    /is 16 bytes, expected >= 429424/,
  );
});

/* --------------------------------------------------------------------------
 * Non-degeneracy predicates, and the mutation check that they discriminate.
 * ------------------------------------------------------------------------ */

/** Reasons a Game-object capture is degenerate (empty array => healthy). */
export function gameObjectDefects(buffer) {
  const d = SNAP.describeSnapshot(buffer, SNAP.GAME_OBJECT_PROBES);
  const out = [];
  if (buffer.byteLength < GAME_OBJECT_MIN_SIZE) out.push("short");
  if (d.allZero) out.push("allZero");
  if (d.nonZeroRatio < 0.05) out.push("almostAllZero");
  if ((d.values.renderRootPointer >>> 0) === 0) out.push("renderRootPointerNull");
  return out;
}

/** Reasons a render-root capture cannot produce entity/grid draws. */
export function renderRootDefects(buffer) {
  const d = SNAP.describeSnapshot(buffer, SNAP.RENDER_ROOT_PROBES);
  const v = d.values;
  const out = [];
  if (buffer.byteLength < GAME_RENDER_GAME_OBJECT_MIN_SIZE) out.push("short");
  if (d.allZero) out.push("allZero");
  if ((v.vtable >>> 0) === 0) out.push("vtableNull");
  if (!(v.gridW > 0 && v.gridW <= 64)) out.push("gridW");
  if (!(v.gridH > 0 && v.gridH <= 64)) out.push("gridH");
  if (!(v.entityCount > 0 && v.entityCount < 4096)) out.push("entityCount");
  if ((v.entityArray >>> 0) === 0) out.push("entityArrayNull");
  return out;
}

test("MUTATION: the non-degeneracy predicates actually discriminate", () => {
  // Build a synthetic *healthy* render root, then break one field at a time.
  const good = new Uint8Array(GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  const gv = new DataView(good.buffer);
  gv.setUint32(0x00, 0x56bc3000, true); // vtable
  gv.setInt32(0x0c, 15, true);          // gridW
  gv.setInt32(0x10, 9, true);           // gridH
  gv.setUint32(0x125c, 0x55588024, true); // entity array
  gv.setUint32(0x1264, 3, true);        // entity count
  for (let i = 0x2000; i < 0x2000 + 0x8000; i += 1) good[i] = (i & 0xff) || 1;
  assert.deepEqual(renderRootDefects(good), [], "the synthetic healthy buffer must pass");

  const mutate = (fn) => { const b = good.slice(); fn(new DataView(b.buffer)); return b; };
  assert.deepEqual(renderRootDefects(mutate((v) => v.setUint32(0x1264, 0, true))), ["entityCount"]);
  assert.deepEqual(renderRootDefects(mutate((v) => v.setInt32(0x0c, 0, true))), ["gridW"]);
  assert.deepEqual(renderRootDefects(mutate((v) => v.setInt32(0x10, 0, true))), ["gridH"]);
  assert.deepEqual(renderRootDefects(mutate((v) => v.setUint32(0x125c, 0, true))), ["entityArrayNull"]);
  assert.deepEqual(renderRootDefects(mutate((v) => v.setUint32(0x00, 0, true))), ["vtableNull"]);
  // The all-zero buffer the frame path uses today must be rejected on every count.
  const zero = new Uint8Array(GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  assert.deepEqual(
    renderRootDefects(zero),
    ["allZero", "vtableNull", "gridW", "gridH", "entityCount", "entityArrayNull"],
  );
  assert.deepEqual(
    gameObjectDefects(new Uint8Array(GAME_OBJECT_MIN_SIZE)),
    ["allZero", "almostAllZero", "renderRootPointerNull"],
  );
});

/* --------------------------------------------------------------------------
 * Capture-dependent — skipped with an explicit message when absent.
 * ------------------------------------------------------------------------ */

for (const label of ["menu", "inrun"]) {
  const file = join(captureDir, `game-object-${label}.bin`);
  test(`captured Game object (${label}) loads with the right shape and is non-degenerate`,
    { skip: existsSync(file) ? false : skipMessage(file) }, async () => {
      const buf = await SNAP.loadGameObjectSnapshot(file, { required: true });
      assert.ok(buf instanceof Uint8Array);
      assert.equal(buf.byteLength, GAME_OBJECT_MIN_SIZE,
        "the capture must be exactly GAME_OBJECT_MIN_SIZE (0x68d70) bytes");
      assert.deepEqual(gameObjectDefects(buf), [],
        "captured Game object must not look like the zero buffer");

      const d = SNAP.describeSnapshot(buf, SNAP.GAME_OBJECT_PROBES);
      assert.ok(d.nonZeroRatio > 0.2,
        `expected a densely populated object, got ${(d.nonZeroRatio * 100).toFixed(1)}% non-zero`);
      // *(Game+0x18300) is the render shell receiver; it must be a real pointer.
      assert.notEqual(d.values.renderRootPointer >>> 0, 0);
      // Player vector [begin,end) at Game+0x1baa8/+0x1baac must be ordered.
      const pb = d.values.playerVectorBegin >>> 0;
      const pe = d.values.playerVectorEnd >>> 0;
      assert.ok(pe >= pb, `player vector end 0x${pe.toString(16)} < begin 0x${pb.toString(16)}`);
      assert.equal((pe - pb) % 4, 0, "player vector span must be a whole number of pointers");
    });
}

{
  const file = join(captureDir, "render-root-inrun.bin");
  test("captured in-run render root has a live room: grid + entities",
    { skip: existsSync(file) ? false : skipMessage(file) }, async () => {
      const buf = await SNAP.loadRenderRootSnapshot(file, { required: true });
      assert.equal(buf.byteLength, GAME_RENDER_GAME_OBJECT_MIN_SIZE);
      assert.deepEqual(renderRootDefects(buf), [],
        "an in-run render root must have a non-empty grid and entity list");

      const v = SNAP.describeSnapshot(buf, SNAP.RENDER_ROOT_PROBES).values;
      // The PE grid loop is `imul [this+0x10],[this+0xc]` then a null test per
      // slot at [this+0x24 + i*4] (VA 0x0080eed3..0x0080eee9). At least one
      // slot must be non-null or no GRID_80C810 host can ever be emitted.
      const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      let nonNull = 0;
      for (let i = 0; i < v.gridW * v.gridH; i += 1) {
        if (dv.getUint32(0x24 + i * 4, true) !== 0) nonNull += 1;
      }
      assert.ok(nonNull > 0, "no non-null grid slot: the grid draw loop would be a no-op");
      assert.ok(nonNull <= v.gridW * v.gridH);
    });
}

{
  const file = join(captureDir, "game-object-inrun.json");
  test("capture sidecar records the provenance needed to re-derive the dump",
    { skip: existsSync(file) ? false : skipMessage(file) }, () => {
      const j = JSON.parse(readFileSync(file, "utf8"));
      assert.equal(
        j.binarySha256,
        "5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200",
      );
      assert.equal(j.gameGlobalVaPreferred, "0x00c71678");
      assert.equal(j.gameObjectSize, "0x68d70");
      assert.equal(j.renderRootPtrOffset, "0x18300");
      assert.equal(j.gameObjectBytes, GAME_OBJECT_MIN_SIZE);
      assert.notEqual(j.gamePointerValue, "0x00000000");
      assert.ok(typeof j.aslrRelocated === "boolean");
      assert.ok(j.moduleBase && /^0x[0-9a-f]{8}$/.test(j.moduleBase));
      assert.ok(j.capturedAtUtc);
    });
}
