#!/usr/bin/env node
/**
 * Record-15 B3B7 HOST CAPTURE — 120-frame seam measurement
 * (update-v107-record15-capture NOTES §5).
 *
 * Boots the REAL browser bridge (web/js/native-update-bridge.js, with
 * ONLY its /@decomp/scripts/* specifiers rewritten for plain Node — the
 * bridge itself is unmodified), seeds the Game buffer + guest map with
 * the record-15 battle map (live room, TE/HCE entries, one B5 candidate,
 * two non-null grid slots), then runs 120 ticks:
 *   - ARMED: captureUpdateB3b7 fills the sparse cells + 38-row pack and
 *     raises b3b7SparseReady BEFORE resume -> the typed B3B7 wire fires
 *     (fired counter).
 *   - UNARMED: no guestRead -> ready stays 0 -> the pre-v48 MONOLITHIC
 *     parent counter fires (fallback counter).
 *
 * Prints: landed + fired/fallback ratio (the W29-S2 reply contract).
 * Capped runs only: 120 frames per arm, one build, READ-ONLY samples.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const updateWasmPath = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
const renderWasmPath = join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm");
const bridgeSourcePath = join(root, "web", "js", "native-update-bridge.js");
const {
  GAME_OBJECT_MIN_SIZE,
} = await import(pathToFileURL(join(root, "scripts", "decomp", "game-update-model.mjs")).href);

if (!existsSync(updateWasmPath)) {
  const built = spawnSync(
    process.execPath,
    [join(root, "scripts", "decomp", "build-game-update-slice.mjs")],
    { cwd: root, stdio: "inherit" },
  );
  if (built.status !== 0 || !existsSync(updateWasmPath)) {
    console.error("record15-120: update slice build failed");
    process.exit(1);
  }
}

const source = readFileSync(bridgeSourcePath, "utf8");
const rewritten = source.replace(
  /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
  (_match, file) => JSON.stringify(pathToFileURL(join(root, "scripts", "decomp", file)).href),
);
const dir = mkdtempSync(join(tmpdir(), "isaac-record15-120-"));
const bridgeFile = join(dir, "native-update-bridge.mjs");
writeFileSync(bridgeFile, rewritten);
const { bootNativeUpdateBridge } = await import(pathToFileURL(bridgeFile).href);

/* ---- the record-15 battle map (same seed as the wiring tests) ---- */
const GAME_PTR = 0x549e004c;
const ROOM = 0x700000;
const MGR = 0x800000;
const DESC = 0x710000;
const TE_BEGIN = 0x720000;
const ENT_BASE = 0x740000;
const ENT0 = 0x750000;

const guest = new Map();
const put = (addr, v) => guest.set(addr >>> 0, typeof v === "number" ? u32(v) : Uint8Array.from(v));
function u32(v) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v >>> 0, true);
  return b;
}
put(0xc71678, GAME_PTR);
put(0xc7169c, MGR);
put(0xc82678, 0x1000);
put(0xc8267c, 0x2000);
/* Room */
put(ROOM + 0x0, 1);
put(ROOM + 0x1, 1);
put(ROOM + 0x4, DESC);
put(ROOM + 0xc, 13);
put(ROOM + 0x10, 15);
for (let i = 0; i < 195; i += 1) put(ROOM + 0x24 + i * 4, 0);
put(ROOM + 0x24, 0x1000);
put(ROOM + 0x38, 0x2000);
put(ROOM + 0x125c, ENT_BASE);
put(ROOM + 0x1264, 1);
put(ROOM + 0x7314, TE_BEGIN);
put(ROOM + 0x7318, TE_BEGIN + 0x20);
put(ROOM + 0x7321, 0);
put(ROOM + 0x7234, 0);
put(ROOM + 0x7238, 0);
put(ROOM + 0x7768, 1);
/* desc */
put(DESC + 0x0, 0xffffffec);
put(DESC + 0x5c, 0x12345678);
/* TE entries */
put(TE_BEGIN + 0x00, 0x730000);
put(TE_BEGIN + 0x10, 0x730100);
put(0x730000, 0);
put(0x730004, 0x40);
put(0x730100, 1);
put(0x730104, 0x2a5);
/* entities */
put(ENT_BASE, ENT0);
put(ENT0 + 0x28, 0x14);
put(ENT0 + 0x2c, 0);
put(ENT0 + 0x168, 0);
put(ENT0 + 0x32c, 0);
put(ENT0 + 0x3dc, 0x1234);
put(ENT0 + 0x3e0, 0);
put(ENT0 + 0x3e4, 0);
put(ENT0 + 0x3e8, 0);
/* Manager */
put(MGR + 0x8, 2);
put(MGR + 0x1b4, 0);
put(MGR + 0x2bf, 0);
put(MGR + 0x1ba, 0);
const guestRead = (address, size) => guest.get(address >>> 0) ?? null;

const gameBuf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
const gameView = new DataView(gameBuf.buffer);
gameView.setUint32(0x18300, ROOM, true);
gameView.setUint32(0x26630, 0, true);
gameView.setUint8(0x26589, 0);
gameView.setUint32(0x26584, 0x28, true);
gameView.setUint32(0x26614, 0, true);

/* ---- 120-frame seam: armed vs monolith ---- */
const FRAMES = 120;
const armed = await bootNativeUpdateBridge({
  wasmUrl: updateWasmPath,
  renderSliceUrl: renderWasmPath,
  log: () => {},
});
armed.session.gameObject.set(gameBuf);
armed.setUpdateCapture({ guestRead, gamePointerValue: GAME_PTR });
let fired = 0;
let firedPackMissing = 0;
for (let f = 0; f < FRAMES; f += 1) {
  const r = armed.tick(f + 1, null, { frameCounter264f8: f });
  if ((r.events.b3b7HostFco | 0) > 0 && (r.events.opaqueRoomUpdatePrefixB3B7 | 0) === 0) {
    fired += 1;
  } else {
    firedPackMissing += 1;
  }
}

const mono = await bootNativeUpdateBridge({
  wasmUrl: updateWasmPath,
  renderSliceUrl: renderWasmPath,
  log: () => {},
});
mono.session.gameObject.set(gameBuf);
mono.setUpdateCapture({ gamePointerValue: GAME_PTR });
let fallback = 0;
let fallbackTyped = 0;
for (let f = 0; f < FRAMES; f += 1) {
  const r = mono.tick(f + 1, null, { frameCounter264f8: f });
  if ((r.events.opaqueRoomUpdatePrefixB3B7 | 0) > 0 && (r.events.b3b7HostFco | 0) === 0) {
    fallback += 1;
  } else {
    fallbackTyped += 1;
  }
}

console.log(
  `record15 landed: sparse+38-row pack delivered ${fired}/120 (armed) ; ` +
  `fired/fallback = ${fired}/${fallback} (arm ${firedPackMissing} pack-miss, ` +
  `mono ${fallbackTyped} typed-leak)`,
);
console.log(`record15 ratio: fired ${fired}/${FRAMES} vs monolithic ${fallback}/${FRAMES}`);