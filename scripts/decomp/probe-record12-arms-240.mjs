/* W30-S4 (update-v108-record12-arms): record-12 arms + walker group 240-frame
   BROWSER live-seam measurement over the recorded inrun capture, with the
   wave-29 typed drop @984 (midRestockSeedZeroDrop) driven under seed==0.
   Real bridge (wasm slice) + seeded Game buffer + in-buffer guestRead.
   FRESH bridge per config (sequential-session confound: the mode-2 shape
   changes the downstream flow; hostTotals are session-cumulative).
   Capped: b1 240 + b2 240 + b3 5 + b4 5 = 490 ticks. */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const capDir = join(root, "output", "decomp", "gamestate", "5129df723e64");
const notesDir = join(root, "section-notes", "update-v108-record12-arms");
const bin = readFileSync(join(capDir, "game-object-inrun.bin"));
const sidecar = JSON.parse(readFileSync(join(capDir, "game-object-inrun.json"), "utf8"));
const gameBase = Number(sidecar.gamePointerValue);
const wasmUrl = join(root, "output", "decomp", "wasm-slice", "game-update-slice.wasm");

const source = readFileSync(join(root, "web", "js", "native-update-bridge.js"), "utf8");
const rewritten = source.replace(
  /"\/@decomp\/scripts\/([A-Za-z0-9._-]+\.mjs)"/g,
  (_m, f) => JSON.stringify(pathToFileURL(join(root, "scripts", "decomp", f)).href),
);
const bridgeDir = mkdtempSync(join(tmpdir(), "isaac-v108-record12-arms-"));
const bridgeFile = join(bridgeDir, "native-update-bridge.mjs");
writeFileSync(bridgeFile, rewritten);
const { bootNativeUpdateBridge, captureUpdateLanes } = await import(pathToFileURL(bridgeFile).href);

const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
const guestRead = (addr, size) => {
  const off = (addr >>> 0) - gameBase;
  if (off < 0 || off + size > bin.byteLength) return null;
  return bin.subarray(off, off + size);
};
const u32 = (off) => view.getUint32(off, true);
const i32 = (off) => view.getInt32(off, true);
const hex = (n) => "0x" + (n >>> 0).toString(16);

/* Walker seam (C4a precedent — the k6/k7 walk-seam lanes the bridge must NOT
   supply; row values read from the seeded buffer's own words). */
const listBegin = u32(0x1baa8) >>> 0;
const listEnd = u32(0x1baac) >>> 0;
const walkerA = u32(0x233a8 + 0x114) >>> 0;
const walkerB = u32(0x233a8 + 0x114 + 0xcc) >>> 0;
const hostWalkSeam = {
  managerStatFlag: 0x1,
  hudStatWalkBlobReady: 1,
  hudStatPlayerListBegin: listBegin,
  hudStatPlayerListEnd: listEnd,
  hudStatContainerBegin: 0,
  hudStatContainerEnd: 0,
  hudStatPlayer0Ptr: walkerA,
  hudStatPlayer0F2c: 0,
  hudStatPlayer0F3bc: 0,
  hudStatPlayer0F13c0: 0,
  hudStatPlayer0F172: 0,
  hudStatPlayer0OtherPtr: 0,
  hudStatPlayer0Other161c: 0,
  hudStatPlayer0F161c: 0,
};

const MODE2_PATCH = { effectCounter68d6c: 1, roomTransitionMode1830c: 2 };
const RESTOCK_LANES = {
  midRestockDescReady: 1,
  midRestockDescAc: 3, /* signed int16 gate: ac>0 && (ae>=ac || ae==-1) */
  midRestockDescAe: 5,
  midRestockOwner0x209: 1,
  ambientRoomActive: 1,
  ambientRoomEntry11f0: 0,
};

const SEAM_EVENTS = [
  "opaqueCall006fd7c0Mode4Sfx", "frameEffect6fd7c0Mode4SfxPlayTyped",
  "frameEffect6fd7c0StageTransition", "frameEffect6fd7c0PlayerLoop",
  "frameEffect6fd7c0RoomDispatch", "opaqueFrameEffect6fd7c0Shell",
  "rewind705ee0Stores", "rewind705ee0SaveState", "opaqueRoomTransitionEnginePrefix",
  "engineAnm2PrefixFilenameAssign", "engineAnm2PrefixCacheFetch", "engineAnm2PrefixLoadImage",
  "midRestockSeedZeroDrop", "opaqueRoomUpdateTailMidRestock",
];
const WALKER_EVENTS = [
  "hudStatWalkProbe1", "hudStatWalkProbe2", "hudStatWalkProbe3",
  "hudStatWalkerProbe1", "hudStatWalkerProbe2", "hudStatWalkerProbe3",
];

async function runConfig(name, frames, { patchEvery = null, patchTick1 = null, extra = null, capture = true } = {}) {
  const bridge = await bootNativeUpdateBridge({
    wasmUrl,
    renderSliceUrl: join(root, "output", "decomp", "game-render-slice", "game-render-slice.wasm"),
    log: () => {},
  });
  bridge.session.gameObject.set(bin);
  if (capture) bridge.setUpdateCapture({ gameView: view, guestRead, gamePointerValue: gameBase });

  const totals = {};
  const evSums = {};
  const probeTotals = { alt: 0, route: 0, player: 0, blue: 0, engine: 0 };
  const seamFrames = [];
  let counterDeltas = 0;
  let prevCounter = null;
  let prevTotals = {};
  let walkerLaneFrames = 0;
  const continuations = [];
  for (let i = 0; i < frames; i += 1) {
    const patch = patchEvery ? { ...patchEvery } : (patchTick1 && i === 0 ? { ...patchTick1 } : null);
    const rt = extra ? { ...hostWalkSeam, ...extra } : { ...hostWalkSeam };
    const r = bridge.tick(i + 1, rt, patch);
    const h = r.hostTotals ?? {};
    for (const [k, v] of Object.entries(h)) {
      const d = v - (prevTotals[k] ?? 0);
      if (d > 0) totals[k] = (totals[k] ?? 0) + d;
    }
    prevTotals = { ...h };
    const e = r.events ?? {};
    for (const k of SEAM_EVENTS.concat(WALKER_EVENTS)) {
      const v = e[k] | 0;
      if (v !== 0) evSums[k] = (evSums[k] ?? 0) + v;
    }
    if ((e.engineSiteAnim | 0) !== 0) seamFrames.push(i + 1);
    if (continuations.length < 3) continuations.push({ tick: i + 1, ck: r.continuationKind });
    /* Lane delivery: the bridge's OWN capture function with the SAME
       options the bridge used (blueRoomDirection default -1) — the tick
       result does not expose the merged runtime, so the probe reads the
       per-frame lane values from the capture source directly. */
    const lanes = captureUpdateLanes({
      gameView: view, guestRead, gamePointerValue: gameBase,
    });
    if (lanes.transition6fd7c0AltPathProbe) probeTotals.alt += 1;
    if (lanes.transition6fd7c0RouteProbe) probeTotals.route += 1;
    if (lanes.transition6fd7c0PlayerLoopProbe) probeTotals.player += 1;
    if (lanes.transition6fd7c0BlueRoomProbe) probeTotals.blue += 1;
    if (lanes.transition6fd7c0EnginePredProbe) probeTotals.engine += 1;
    if (lanes.hudStatWalkerPlayerA !== 0 || lanes.hudStatWalkerPlayerB !== 0) walkerLaneFrames += 1;
    if (prevCounter !== null && (r.state?.counter265c0 | 0) !== prevCounter) counterDeltas += 1;
    prevCounter = r.state?.counter265c0 | 0;
  }
  return { name, frames, seamFrames, evSums, totals, probeTotals, counterDeltas, counterFinal: prevCounter, walkerLaneFrames, continuations };
}

/* capture OFF control (pre-v107 residual baseline, 1 frame per site shape). */
const control = await runConfig("c-off", 1, { capture: false });
/* capture OFF + mode-2 shape (residual F edge control). */
const controlOpen = await runConfig("c-off-mode2", 1, { capture: false, patchTick1: MODE2_PATCH });

const results = [];
results.push(await runConfig("b1", 240, {})); /* steady inrun */
results.push(await runConfig("b2", 240, { patchTick1: MODE2_PATCH })); /* mode-2 shell-open */
results.push(await runConfig("b3-seed0", 5, { patchEvery: { roomType8: 2 }, extra: { ...RESTOCK_LANES, midRestockDescSeed58: 0 } }));
results.push(await runConfig("b4-seed1", 5, { patchEvery: { roomType8: 2 }, extra: { ...RESTOCK_LANES, midRestockDescSeed58: 1 } }));

const totalTicks = results.reduce((a, c) => a + c.frames, 0) + control.frames + controlOpen.frames;

console.log(`=== record-12 arms 240-frame browser seam (${totalTicks} ticks, fresh session per config) ===`);
console.log("gameBase:", gameBase.toString(16), "| game0:", u32(0), "| altWord:", u32(4),
  "| routeWord:", u32(0x269c8), "| blueCur:", i32(0x18304), "| blueFlag:", hex(u32(0x16cc0)),
  "| engHead:", u32(0x1b83c), "| engTail:", u32(0x1ba74));
console.log("walker rows: A", hex(walkerA), "B", hex(walkerB), "| list [", hex(listBegin), ",", hex(listEnd), ")");
for (const c of [control, controlOpen, ...results]) {
  console.log(`\n-- ${c.name} (${c.frames} frames) --`);
  console.log("seam entries (K-block frames):", c.seamFrames.length, JSON.stringify(c.seamFrames.slice(0, 6)));
  console.log("probe AL hits/frame:", JSON.stringify(c.probeTotals));
  console.log("walker capture-live frames:", `${c.walkerLaneFrames}/${c.frames}`);
  for (const k of SEAM_EVENTS.filter((k) => (c.evSums[k] ?? 0) !== 0)) console.log(`  ${k.padEnd(44)} ${c.evSums[k]}`);
  const walkerHits = WALKER_EVENTS.filter((k) => (c.evSums[k] ?? 0) !== 0);
  for (const k of walkerHits) console.log(`  ${k.padEnd(44)} ${c.evSums[k]}`);
  if (walkerHits.length === 0) console.log("  (walker probe events 0)");
  console.log("counter_265c0 transitions:", c.counterDeltas, "final:", c.counterFinal);
  if (c.continuations.length) console.log("early continuations:", JSON.stringify(c.continuations));
}
writeFileSync(join(notesDir, "arms-240.json"), JSON.stringify({ totalTicks, control, controlOpen, results }, null, 2));