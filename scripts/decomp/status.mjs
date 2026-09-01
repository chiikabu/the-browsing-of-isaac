#!/usr/bin/env node
// Live decomp status — derived from the TREE, never from docs.
// Run this FIRST in every session/unit: `node scripts/decomp/status.mjs`
// Docs and checkpoint narratives lag by design; this does not.
//
// Sources (all authoritative):
//   scripts/decomp/*-model.mjs        ABI_VERSION per family
//   decomp/game-update-slice.json     boundaries, fields, runtime, events
//   decomp/game-render-slice.json     render slice
//   decomp/frontier.json              hand-off pointer (next target, owner notes)
//   output/decomp/wasm-slice/*.json   last local build/verify results (untracked)
//   output/decomp/<hash12>/index/     PE index presence
// Options: --json for machine-readable output.

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const wantJson = process.argv.includes("--json");
const out = { families: {}, updateSlice: null, renderSlice: null, frontier: null,
              localBuild: {}, peIndex: null, warnings: [] };

// -- family ABI versions from model files --------------------------------
const modelDir = join(ROOT, "scripts", "decomp");
for (const f of readdirSync(modelDir)) {
  if (!f.endsWith("-model.mjs") || f.includes(".bak") || f.includes(".mutbak")) continue;
  const text = readFileSync(join(modelDir, f), "utf8");
  const m = text.match(/ABI_VERSION\s*=\s*(\d+)/);
  if (m) out.families[f.replace(/-pure-model\.mjs$|-model\.mjs$/, "")] = Number(m[1]);
}

// -- slice JSONs ----------------------------------------------------------
function sliceSummary(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  const d = JSON.parse(readFileSync(p, "utf8"));
  return {
    abiVersion: d.abiVersion,
    rootSymbol: d.rootSymbol,
    rootVa: d.rootVa,
    open: (d.opaqueBoundaries ?? []).map((b) => ({
      idx: b.idx, va: b.targetVa, name: b.name,
      op: (b.operation ?? "").slice(0, 60),
    })),
    resolvedCount: (d.resolvedBoundaries ?? []).length,
    fields: (d.fields ?? []).length,
    runtimeInputs: (d.runtimeInputs ?? []).length,
    events: (d.events ?? []).length,
    translatedHelpers: (d.translatedHelpers ?? []).length,
    block: d.block,
  };
}
out.updateSlice = sliceSummary("decomp/game-update-slice.json");
out.renderSlice = sliceSummary("decomp/game-render-slice.json");

// -- frontier pointer -----------------------------------------------------
const frontierPath = join(ROOT, "decomp", "frontier.json");
if (existsSync(frontierPath)) {
  out.frontier = JSON.parse(readFileSync(frontierPath, "utf8"));
} else {
  out.warnings.push("decomp/frontier.json missing — units have no recorded hand-off pointer");
}

// -- local build/verify artifacts (untracked; may be stale) ---------------
for (const [key, rel] of [
  ["abi", "output/decomp/wasm-slice/abi.json"],
  ["verification", "output/decomp/wasm-slice/verification.json"],
]) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) { out.localBuild[key] = null; continue; }
  const d = JSON.parse(readFileSync(p, "utf8"));
  out.localBuild[key] = {
    mtime: statSync(p).mtime.toISOString(),
    ...(key === "abi"
      ? { abiVersion: d.abiVersion, imports: (d.imports ?? []).length, exports: (d.exports ?? []).length }
      : { abiVersion: d.abiVersion, result: d.result, cases: d.cases ?? d.caseCount }),
  };
}

// -- PE index -------------------------------------------------------------
const idxBase = join(ROOT, "output", "decomp");
if (existsSync(idxBase)) {
  for (const d of readdirSync(idxBase)) {
    const p = join(idxBase, d, "index", "pe-index.sqlite");
    if (existsSync(p)) {
      out.peIndex = { hash12: d, path: p, mb: Math.round(statSync(p).size / 1e6) };
    }
  }
}
if (!out.peIndex) out.warnings.push(
  "PE index missing — build once: python scripts/decomp/tools/build-pe-index.py");

// -- consistency warnings -------------------------------------------------
const live = out.families["game-update"];
if (out.updateSlice && live != null && out.updateSlice.abiVersion !== live) {
  out.warnings.push(
    `game-update-slice.json abiVersion=${out.updateSlice.abiVersion} != game-update-model.mjs ABI_VERSION=${live} — trust the model, fix the JSON`);
}
if (out.frontier?.updatedAbi != null && live != null && out.frontier.updatedAbi < live) {
  out.warnings.push(
    `frontier.json written at ABI ${out.frontier.updatedAbi}, tree is at ${live} — pointer may be stale`);
}
const agents = readFileSync(join(ROOT, "AGENTS.md"), "utf8");
for (const m of agents.matchAll(/Update ABI \*\*(\d+)\*\*/g)) {
  if (live != null && Number(m[1]) !== live) {
    out.warnings.push(`AGENTS.md mentions Update ABI ${m[1]}, tree is at ${live} — the tree wins`);
  }
}

// -- print ---------------------------------------------------------------
if (wantJson) {
  console.log(JSON.stringify(out, null, 1));
} else {
  console.log("== decomp status (derived from tree) ==");
  console.log("family ABI versions:");
  for (const [k, v] of Object.entries(out.families).sort())
    console.log(`  ${k}: ${v}`);
  const u = out.updateSlice;
  if (u) {
    console.log(`\nUpdate slice: ABI ${u.abiVersion} (json)  root ${u.rootSymbol} @ ${u.rootVa}`);
    console.log(`  fields ${u.fields} / runtimeInputs ${u.runtimeInputs} / events ${u.events} / helpers ${u.translatedHelpers}`);
    console.log(`  OPEN boundaries: ${u.open.length}   resolved: ${u.resolvedCount}`);
    for (const b of u.open)
      console.log(`    [${String(b.idx).padStart(2)}] ${b.va}  ${b.name}  ${b.op}`);
  }
  const r = out.renderSlice;
  if (r) console.log(`\nRender slice: ABI ${r.abiVersion}  open ${r.open.length} / resolved ${r.resolvedCount}`);
  if (out.frontier) {
    console.log(`\nfrontier.json (hand-off pointer):`);
    console.log(`  next: ${out.frontier.next}`);
    if (out.frontier.notes) console.log(`  notes: ${out.frontier.notes}`);
    console.log(`  updated: ${out.frontier.updated} at Update ABI ${out.frontier.updatedAbi}`);
  }
  console.log(`\nlocal build artifacts (untracked, informational):`);
  for (const [k, v] of Object.entries(out.localBuild))
    console.log(`  ${k}: ${v ? JSON.stringify(v) : "absent (run the build/verify scripts)"}`);
  console.log(`PE index: ${out.peIndex ? `${out.peIndex.hash12} (${out.peIndex.mb} MB)` : "MISSING"}`);
  if (out.warnings.length) {
    console.log("\nWARNINGS:");
    for (const w of out.warnings) console.log(`  ! ${w}`);
  }
}
