#!/usr/bin/env node
/**
 * Record-16 B8 path-cost capture-feed — 120-frame seam measurement
 * (W30-S3; update-v108-record16-b8-bridge NOTES): the armed bridge
 * captures the live Room grids (captureUpdateB8), fills the exported
 * k-blob scratch at the resume_room_update_prefix_b2 seam, the module
 * steps it IN PLACE when the gate opens ((f+1) % 3 == 0 watching the
 * patched counter; the chain increments once before the B8 block), and
 * the copy-back writes the stepped grids back. Unarmed = byte-for-byte
 * host residual on every gate-open frame.
 *   - ARMED: 40/40 gate-open frames pure (event 148 == 0, zero host
 *     events, copy-back landed).
 *   - UNARMED: 40/40 gate-open frames residual (event 148 == 1).
 *   - 3-mutant sha256 restore cycle over the post-step scratch span
 *     (cost grid / trail grid / dims), frame-1 hashes.
 * Capped runs only; <= 500 draws (120 ticks x ~4 lanes).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const updateWasmPath = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
const renderWasmPath = join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm");
const bridgeSourcePath = join(root, "web", "js", "native-update-bridge.js");
const { GAME_OBJECT_MIN_SIZE } = await import(
  pathToFileURL(join(root, "scripts", "decomp", "game-update-model.mjs")).href);

if (!existsSync(updateWasmPath)) {
  const built = spawnSync(
    process.execPath,
    [join(root, "scripts", "decomp", "build-game-update-slice.mjs")],
    { cwd: root, stdio: "inherit" },
  );
  if (built.status !== 0 || !existsSync(updateWasmPath)) process.exit(2);
}

const source = readFileSync(bridgeSourcePath, "utf8");
const rewritten = source.replace(
  /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
  (_match, file) => JSON.stringify(pathToFileURL(join(root, "scripts", "decomp", file)).href),
);
const dir = mkdtempSync(join(tmpdir(), "isaac-record16-b8-120-"));
const bridgeFile = join(dir, "native-update-bridge.mjs");
writeFileSync(bridgeFile, rewritten);
const { bootNativeUpdateBridge } = await import(pathToFileURL(bridgeFile).href);

/* ---- the record-16 battle map ---- */
const ROOM = 0x700000;
const COSTS = [3999, 1234, 0, 5000, 900, 100, 101, 1001, -12, 448];
const TRAILS = [99, 50, 1, 0, 100, 98, 5, 32767, -3, 200];
function u32(v) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, v >>> 0, true);
  return b;
}
function i16(v) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setInt16(0, v | 0, true);
  return b;
}
function guestMap({ w, h }) {
  const cells = Math.imul(w, h) >>> 0;
  const map = new Map([
    [(ROOM + 0xc) >>> 0, u32(w >>> 0)],
    [(ROOM + 0x10) >>> 0, u32(h >>> 0)],
  ]);
  for (let i = 0; i < cells; i += 1) {
    map.set((ROOM + 0x76c + i * 4) >>> 0, u32(COSTS[i % COSTS.length] >>> 0));
    map.set((ROOM + 0xe6c + i * 2) >>> 0, i16(TRAILS[i % TRAILS.length]));
  }
  return map;
}
const guestRead = (address, size) => guestMap({ w: 2, h: 5 }).get(address >>> 0) ?? null;

const gameBuf = new Uint8Array(GAME_OBJECT_MIN_SIZE);
new DataView(gameBuf.buffer).setUint32(0x18300, ROOM, true);

function beExport(wasm, name) {
  return wasm[name] ?? wasm[`_${name}`];
}
function scratchHash(slice) {
  const ca = beExport(slice.wasm, "isaac_game_update_slice_b8_costs_address")();
  return createHash("sha256")
    .update(new Uint8Array(slice.memory.buffer, ca, 448 * 4 + 448 * 2))
    .digest("hex");
}

/* ---- 120-frame seam: armed (pure-fired) vs unarmed (residual) ---- */
const FRAMES = 120;
const armed = await bootNativeUpdateBridge({
  wasmUrl: updateWasmPath,
  renderSliceUrl: renderWasmPath,
  log: () => {},
});
armed.session.gameObject.set(gameBuf);
const guestMapArmed = guestMap({ w: 2, h: 5 });
armed.setUpdateCapture({
  guestRead: (a, s) => guestMapArmed.get(a >>> 0) ?? null,
  guestWrite: () => {},
});
let fired = 0;
let firedCopyback = 0;
for (let f = 0; f < FRAMES; f += 1) {
  const r = armed.tick(f + 1, null, { frameCounter264f8: f });
  if (f % 3 === 2) {
    if ((r.events.opaqueRoomUpdatePrefixB8 | 0) === 0 && r.b8GridApply) {
      fired += 1;
      firedCopyback += r.b8GridApply.copiedBack | 0;
    }
  }
}

const mono = await bootNativeUpdateBridge({
  wasmUrl: updateWasmPath,
  renderSliceUrl: renderWasmPath,
  log: () => {},
});
mono.session.gameObject.set(gameBuf);
mono.setUpdateCapture({ gamePointerValue: 0 });
let fallback = 0;
for (let f = 0; f < FRAMES; f += 1) {
  const r = mono.tick(f + 1, null, { frameCounter264f8: f });
  if (f % 3 === 2 && (r.events.opaqueRoomUpdatePrefixB8 | 0) > 0) fallback += 1;
}

/* ---- 3-mutant sha256 restore cycle (frame-1 hashes) ---- */
const tickWith = async ({ w = 2, h = 5, costs = null, trails = null }) => {
  const map = guestMap({ w, h });
  const specCosts = costs ?? COSTS;
  const specTrails = trails ?? TRAILS;
  const cells = Math.imul(w, h) >>> 0;
  for (let i = 0; i < cells; i += 1) {
    map.set((ROOM + 0x76c + i * 4) >>> 0, u32(specCosts[i % specCosts.length] >>> 0));
    map.set((ROOM + 0xe6c + i * 2) >>> 0, i16(specTrails[i % specTrails.length]));
  }
  const bridge = await bootNativeUpdateBridge({
    wasmUrl: updateWasmPath,
    renderSliceUrl: renderWasmPath,
    log: () => {},
  });
  bridge.session.gameObject.set(gameBuf);
  bridge.setUpdateCapture({ guestRead: (a, s) => map.get(a >>> 0) ?? null });
  bridge.tick(1, null, { frameCounter264f8: 2 });
  return { hash: scratchHash(bridge.slice), bridge };
};
const baseline = await tickWith({});
const mutants = [
  await tickWith({ costs: [500, 1234, 0, 5000, 900, 100, 101, 1001, -12, 448] }),
  await tickWith({ trails: [99, 7, 1, 0, 100, 98, 5, 32767, -3, 200] }),
  await tickWith({ w: 3, h: 5 }),
];
const restored = await tickWith({});
const restored2 = await tickWith({});

console.log(
  `record16 landed: armed pure-fired ${fired}/120 gate-open frames (zero host events, ` +
  `${firedCopyback} cells copied back) ; unarmed residual ${fallback}/120`,
);
console.log(
  `record16 ratio: fired ${fired}/${FRAMES} vs residual ${fallback}/${FRAMES} ` +
  `(gate opens on ${FRAMES / 3} frames: (f+1) % 3 == 0 at the B8 block)`,
);
console.log(
  `record16 sha256 cycle: baseline ${baseline.hash.slice(0, 16)}; ` +
  `mutants ${mutants.map((m) => (m.hash === baseline.hash ? "SAME" : "diff")).join("/")}; ` +
  `restore ${restored.hash === baseline.hash ? "exact" : "FAIL"} / ${restored2.hash === baseline.hash ? "exact" : "FAIL"}`,
);