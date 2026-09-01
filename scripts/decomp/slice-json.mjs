#!/usr/bin/env node
// Canonical reader/writer + sync for decomp/game-update-slice.json.
//
//   node scripts/decomp/slice-json.mjs check   # canonical format + layout sync report (exit 1 on drift)
//   node scripts/decomp/slice-json.mjs fmt     # rewrite in the canonical form (indent 1, LF, trailing LF)
//   node scripts/decomp/slice-json.mjs sync    # make runtimeInputs/events rows mirror the model layouts, then fmt
//
// Why: the JSON is the authoritative tracked spec, but nothing kept it in
// step with the model. Measured 2026-09-01: 139 layout lanes had no JSON row,
// 254 rows carried stale offsets (a whole B16 block described an earlier
// draft), 9 events were missing — and one unit re-serialized the file at
// indent 2, turning a 3-key change into a 74,117-line diff. Every writer of
// this file goes through writeSlice(); the consistency checks
// (scripts/decomp/lib/consistency.mjs) fail the gate on drift.
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const SLICE_PATH = join(ROOT, "decomp", "game-update-slice.json");
export const SLICE_INDENT = 1; // the committed form since the file was born; indent 2 costs +100 KB and a whole-file diff

export function canonical(obj, indent = SLICE_INDENT) {
  return JSON.stringify(obj, null, indent) + "\n";
}
export function readSlice(path = SLICE_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}
export function writeSlice(obj, path = SLICE_PATH) {
  writeFileSync(path, canonical(obj));
}
export function isCanonical(path = SLICE_PATH) {
  const raw = readFileSync(path, "utf8");
  return canonical(JSON.parse(raw)) === raw;
}

const laneBytes = (f) => f.bytes ?? f.size ?? (f.type === "u8" ? 1 : f.type === "u16" ? 2 : 4);

/** Compare model layouts against the JSON rows. Pure; used by check/sync and the gate. */
export function layoutDrift(spec, { RUNTIME_INPUTS_LAYOUT, EVENTS_LAYOUT }) {
  const drift = { missingInputs: [], staleInputs: [], missingEvents: [], staleEvents: [] };
  const rows = new Map(spec.runtimeInputs.map((r) => [r.name, r]));
  for (const [name, f] of Object.entries(RUNTIME_INPUTS_LAYOUT)) {
    const r = rows.get(name);
    if (!r) drift.missingInputs.push({ name, offset: f.offset, type: f.type, bytes: laneBytes(f) });
    else if (r.offset !== f.offset || (r.type !== f.type && r.type !== "struct") || (r.bytes ?? r.size) !== laneBytes(f)) {
      drift.staleInputs.push({ name, json: { offset: r.offset, type: r.type, bytes: r.bytes ?? r.size }, layout: { offset: f.offset, type: f.type, bytes: laneBytes(f) } });
    }
  }
  const evs = new Map(spec.events.map((e) => [e.name, e]));
  for (const [name, f] of Object.entries(EVENTS_LAYOUT)) {
    const e = evs.get(name);
    if (!e) drift.missingEvents.push({ name, offset: f.offset, type: f.type ?? "u32", bytes: laneBytes(f) });
    else if (e.offset !== f.offset) drift.staleEvents.push({ name, json: e.offset, layout: f.offset });
  }
  drift.total = drift.missingInputs.length + drift.staleInputs.length + drift.missingEvents.length + drift.staleEvents.length;
  return drift;
}

/** Bring the JSON rows in line with the model layouts. Existing rows keep every
 *  note key they carry (abiVNN evidence); only offset/type/bytes are corrected.
 *  Rows the model does not know (struct summaries like hudStatPlayers[i]) are
 *  left alone. New rows are appended in layout order. */
export function syncFromLayout(spec, layouts, { note } = {}) {
  const drift = layoutDrift(spec, layouts);
  const rows = new Map(spec.runtimeInputs.map((r) => [r.name, r]));
  for (const s of drift.staleInputs) {
    const r = rows.get(s.name);
    r.offset = s.layout.offset; if (r.type !== "struct") r.type = s.layout.type;
    if ("size" in r && !("bytes" in r)) r.size = s.layout.bytes; else r.bytes = s.layout.bytes;
  }
  for (const m of drift.missingInputs) {
    const row = { name: m.name, offset: m.offset, type: m.type, bytes: m.bytes, direction: "in" };
    if (note) row[note.key] = note.text;
    spec.runtimeInputs.push(row);
  }
  const evs = new Map(spec.events.map((e) => [e.name, e]));
  for (const s of drift.staleEvents) evs.get(s.name).offset = s.layout;
  for (const m of drift.missingEvents) {
    const row = { name: m.name, offset: m.offset, type: m.type, bytes: m.bytes, direction: "out" };
    if (note) row[note.key] = note.text;
    spec.events.push(row);
  }
  return drift;
}

async function loadModel() {
  return import(pathToFileURL(join(ROOT, "scripts", "decomp", "game-update-model.mjs")).href);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const cmd = process.argv[2];
  if (cmd === "fmt") {
    const before = readFileSync(SLICE_PATH, "utf8");
    const spec = JSON.parse(before);
    writeSlice(spec);
    const after = readFileSync(SLICE_PATH, "utf8");
    console.log(before === after ? "already canonical" : `reformatted: ${before.length} -> ${after.length} bytes`);
  } else if (cmd === "check" || cmd === "sync") {
    const spec = readSlice();
    const model = await loadModel();
    const fmtOk = isCanonical();
    if (cmd === "check") {
      const d = layoutDrift(spec, model);
      console.log(`format: ${fmtOk ? "canonical" : "NON-CANONICAL (run: slice-json.mjs fmt)"}`);
      console.log(`layout drift: ${d.total} (inputs missing ${d.missingInputs.length} / stale ${d.staleInputs.length}; events missing ${d.missingEvents.length} / stale ${d.staleEvents.length})`);
      for (const m of d.missingInputs.slice(0, 10)) console.log(`  missing input ${m.name} @${m.offset}`);
      for (const s of d.staleInputs.slice(0, 10)) console.log(`  stale input ${s.name}: json @${s.json.offset} ${s.json.type}/${s.json.bytes} vs layout @${s.layout.offset} ${s.layout.type}/${s.layout.bytes}`);
      for (const m of d.missingEvents.slice(0, 10)) console.log(`  missing event ${m.name} @${m.offset}`);
      if (spec.abiVersion !== model.ABI_VERSION) console.log(`abiVersion ${spec.abiVersion} != model ABI_VERSION ${model.ABI_VERSION}`);
      process.exit(d.total || !fmtOk || spec.abiVersion !== model.ABI_VERSION ? 1 : 0);
    } else {
      const noteArg = process.argv.find((a) => a.startsWith("--note="));
      let note = null;
      if (noteArg) { const [key, ...rest] = noteArg.slice(7).split("="); note = { key, text: rest.join("=") }; }
      const d = syncFromLayout(spec, model, { note });
      writeSlice(spec);
      console.log(`synced: inputs +${d.missingInputs.length} fixed ${d.staleInputs.length}; events +${d.missingEvents.length} fixed ${d.staleEvents.length}; written canonical`);
    }
  } else {
    console.error("usage: slice-json.mjs check|fmt|sync [--note=key=text]");
    process.exit(2);
  }
}
