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
import { createHash } from "node:crypto";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { runConsistencyChecks } from "./lib/consistency.mjs";

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
      ? {
          imports: (d.imports ?? []).length,
          exports: (d.exports ?? []).length,
          // abi.json records the sha256 of the cpp it was built from; compare
          // with the cpp on disk so a module built from a mutant (or from a
          // since-edited source) is visible here instead of in a red suite.
          wasmMatchesSource: d.sourceSha256
            ? createHash("sha256").update(readFileSync(join(ROOT, d.source ?? "native/decomp/game_update_slice.cpp"))).digest("hex") === d.sourceSha256
            : null,
        }
      : { abiVersion: d.abiVersion, result: d.result, cases: d.cases ?? d.caseCount }),
  };
  if (key === "abi" && out.localBuild[key].wasmMatchesSource === false) {
    out.warnings.push("output/decomp/wasm-slice/game-update-slice.wasm was built from a DIFFERENT game_update_slice.cpp than the one on disk — rebuild before trusting a differential result");
  }
}

// -- recomp (machine) track ----------------------------------------------
out.recomp = null;
{
  const bootWasm = join(ROOT, "output", "recomp", "lift", "boot", "boot.wasm");
  const exportMarker = join(ROOT, "output", "recomp", "export", "decompile-complete.marker");
  const segs = join(ROOT, "output", "recomp", "host", "isaac.segs.bin");
  out.recomp = {
    bulkExportComplete: existsSync(exportMarker),
    memimage: existsSync(segs),
    bootModule: existsSync(bootWasm)
      ? { mb: Math.round(statSync(bootWasm).size / 1e6), mtime: statSync(bootWasm).mtime.toISOString() }
      : null,
    run: "cd output/recomp/lift/boot && node boot_integration.mjs ../../host/isaac.segs.bin main",
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

// -- consistency checks (shared with verify-unit.mjs gate 0 + toolkit test) -
// header/model/JSON ABI agreement, cpp size pins, JSON layout drift + canonical
// form, stranded mutants, hardcoded ABI pins in tests, frontier freshness,
// uncommitted unit files. Errors are things the gate refuses; warnings inform.
const live = out.families["game-update"];
out.errors = [];
try {
  const cc = await runConsistencyChecks(ROOT);
  out.errors.push(...cc.errors);
  out.warnings.push(...cc.warnings);
  out.dirtyTracked = cc.info.dirtyTracked ?? [];
} catch (e) {
  out.warnings.push(`consistency checks could not run: ${e.message}`);
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
  if (out.recomp) {
    const r = out.recomp;
    console.log(`recomp (machine) track: export=${r.bulkExportComplete ? "complete" : "absent"}` +
      ` memimage=${r.memimage ? "built" : "absent"}` +
      ` bootModule=${r.bootModule ? `${r.bootModule.mb} MB (${r.bootModule.mtime.slice(0, 10)})` : "absent"}`);
    if (r.bootModule) console.log(`  run: ${r.run}`);
  }
  if (out.errors?.length) {
    console.log("\nERRORS (the unit gate refuses these):");
    for (const e of out.errors) console.log(`  ✖ ${e}`);
  }
  if (out.warnings.length) {
    console.log("\nWARNINGS:");
    for (const w of out.warnings) console.log(`  ! ${w}`);
  }
}
