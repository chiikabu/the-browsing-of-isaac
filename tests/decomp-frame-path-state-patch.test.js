/**
 * createNativeUpdateSession(...).tick(extraRuntime, statePatch)
 *
 * The browser input bridge cannot reach the slice by writing sparse bytes into
 * the live Game-object buffer: tick() re-stamps every sparse field from its own
 * sparseState BEFORE the hybrid capture, so a raw buffer write is overwritten
 * within the same tick. `statePatch` is the supported lane; these tests pin
 * both that it lands and that it lands *before* the pre-tick buffer write.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const wasmPath = join(repoRoot, "output", "decomp", "wasm-slice", "game-update-slice.wasm");

const FP = await import(new URL("../scripts/decomp/frame-path.mjs", import.meta.url).href);

/* Game+0x23a74 — menuState23a74 (decomp/game-update-slice.json). */
const MENU_STATE_GAME_OFFSET = 0x23a74;

function newSession() {
  return FP.loadGameUpdateSliceWasm(wasmPath).then((slice) =>
    FP.createNativeUpdateSession(slice, { onHostEvent: FP.createResidualHostHandler() }),
  );
}

const haveWasm = existsSync(wasmPath);
const opts = haveWasm ? {} : { skip: `missing ${wasmPath}` };

test("baseline: without a state patch the menu lane stays closed", opts, async () => {
  const session = await newSession();
  session.tick();
  assert.equal(session.state.menuState23a74, 0, "menuState23a74 must not move on its own");
});

test("statePatch reaches the slice and survives the tick", opts, async () => {
  const session = await newSession();
  const result = session.tick(null, { menuState23a74: 1 });
  // result.state is what the slice's apply produced, not the JS patch object:
  // seeing 1 here proves the patch was merged BEFORE the pre-tick buffer write
  // and was therefore visible to capture(). Applying it after the write would
  // leave the slice capturing the stale 0 and this assertion would fail.
  assert.equal(result.state.menuState23a74, 1, "slice must observe the patched value");
  assert.equal(session.state.menuState23a74, 1, "session state carries it forward");
});

test("statePatch is written into the live Game-object buffer", opts, async () => {
  const session = await newSession();
  session.tick(null, { menuState23a74: 7 });
  const view = new DataView(
    session.gameObject.buffer,
    session.gameObject.byteOffset,
    session.gameObject.byteLength,
  );
  assert.equal(
    view.getInt32(MENU_STATE_GAME_OFFSET, true),
    7,
    "Game+0x23a74 must hold the patched menu state",
  );
});

test("a later tick without a patch keeps the previously patched value", opts, async () => {
  const session = await newSession();
  session.tick(null, { menuState23a74: 1 });
  session.tick();
  assert.equal(session.state.menuState23a74, 1, "patched state is sticky, not per-tick");
});

test("unknown sparse field names throw instead of silently no-op'ing", opts, async () => {
  const session = await newSession();
  assert.throws(
    () => session.tick(null, { menuStat23a74: 1 }),
    /unknown sparse state field in statePatch: menuStat23a74/,
    "a typo must fail loudly",
  );
  // A rejected patch must not have been half-applied.
  assert.equal(session.state.menuState23a74, 0);
});

test("runtime inputs and state patch are independent lanes", opts, async () => {
  const session = await newSession();
  const result = session.tick({ globalMenuGuard4b3ca: 0 }, { menuState23a74: 1 });
  assert.equal(result.state.menuState23a74, 1);
  // The runtime-input lane must not have been mistaken for a state field.
  assert.ok(!("globalMenuGuard4b3ca" in session.state));
});
