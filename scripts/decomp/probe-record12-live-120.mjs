/* W29-S1 record-12 BROWSER live-seam measurement (update-v107-record12-live):
   120 ticks of the REAL bridge over the recorded inrun capture. Capped run
   (120 draws). Reports which record-12 arms fire + the probe lane values. */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const capDir = join(root, "output", "decomp", "gamestate", "5129df723e64");
const bin = readFileSync(join(capDir, "game-object-inrun.bin"));
const sidecar = JSON.parse(readFileSync(join(capDir, "game-object-inrun.json"), "utf8"));
const gameBase = Number(sidecar.gamePointerValue);
const wasmUrl = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");

const source = readFileSync(join(root, "web", "js", "native-update-bridge.js"), "utf8");
const rewritten = source.replace(
  /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
  (_m, f) => JSON.stringify(pathToFileURL(join(root, "scripts", "decomp", f)).href),
);
const dir = mkdtempSync(join(tmpdir(), "isaac-v107-live-"));
const bridgeFile = join(dir, "native-update-bridge.mjs");
writeFileSync(bridgeFile, rewritten);
const { bootNativeUpdateBridge } = await import(pathToFileURL(bridgeFile).href);

/* Guest reader: the captured Game object lives at gameBase (in-buffer
   reads resolve from the bin); anything outside -> null (the room/desc/
   entity chain and manager blobs are NOT in the capture -> player-loop
   lane 0; payload/blob lanes absent). */
const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
const guestRead = (addr, size) => {
  const off = (addr >>> 0) - gameBase;
  if (off < 0 || off + size > bin.byteLength) return null;
  return bin.subarray(off, off + size);
};
const u32 = (off) => view.getUint32(off, true);

const bridge = await bootNativeUpdateBridge({
  wasmUrl,
  renderSliceUrl: join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm"),
  log: () => {},
});
bridge.session.gameObject.set(bin);
bridge.setUpdateCapture({ gameView: view, guestRead, gamePointerValue: gameBase });

const FRAMES = 120;
const totals = {};
const probeTotals = { alt: 0, route: 0, player: 0, blue: 0, engine: 0 };
let counter265c0Deltas = 0;
let prevCounter = null;
let events0 = null;
let prevTotals = {};
for (let i = 0; i < FRAMES; i += 1) {
  const r = bridge.tick(i + 1);
  const h = r.hostTotals ?? {};
  /* Per-frame deltas (hostTotals is cumulative across ticks). */
  for (const [k, v] of Object.entries(h)) {
    const d = v - (prevTotals[k] ?? 0);
    if (d > 0) totals[k] = (totals[k] ?? 0) + d;
  }
  prevTotals = { ...h };
  const rt = r.runtimeInputs ?? {};
  if (rt.transition6fd7c0AltPathProbe) probeTotals.alt += 1;
  if (rt.transition6fd7c0RouteProbe) probeTotals.route += 1;
  if (rt.transition6fd7c0PlayerLoopProbe) probeTotals.player += 1;
  if (rt.transition6fd7c0BlueRoomProbe) probeTotals.blue += 1;
  if (rt.transition6fd7c0EnginePredProbe) probeTotals.engine += 1;
  if (prevCounter !== null && (r.state.counter265c0 | 0) !== prevCounter) counter265c0Deltas += 1;
  prevCounter = r.state.counter265c0 | 0;
  if (events0 == null) events0 = { ...r.events };
}
const ev = totals;
const record12 = Object.fromEntries(
  Object.entries(totals).filter(([k]) =>
    /6fd7c0|705ee0|rewind|SaveState|EnginePrefix|ProbeHost/i.test(k)),
);
console.log("=== record-12 live-seam 120-frame measurement (inrun capture) ===");
console.log("gameBase:", gameBase.toString(16));
console.log("game0:", u32(0), "| altWord[Game+4]:", u32(4), "| routeWord[Game+269c8]:", u32(0x269c8));
console.log("blueCur[Game+18304]:", view.getInt32(0x18304, true), "| blueFlag[Game+16cc0]:", hex(u32(0x16c7c + 0x44)));
console.log("engHead[Game+1b83c]:", u32(0x1b83c), "| engTail[+0x238]:", u32(0x1b83c + 0x238));
console.log("probe lane hits (frames with AL=1):", JSON.stringify(probeTotals));
console.log("record-12 host kinds over 120 frames:");
for (const [k, v] of Object.entries(record12).sort()) console.log(`  ${k.padEnd(52)} ${v}`);
console.log("counter_265c0 transitions:", counter265c0Deltas, "final:", prevCounter);
console.log("events sample (frame 1):", JSON.stringify(events0));
function hex(n) { return "0x" + (n >>> 0).toString(16); }