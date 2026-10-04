// Tree-consistency checks shared by status.mjs (warnings), verify-unit.mjs
// (gate 0, fails fast) and tests/decomp-toolkit.test.js (npm test).
//
// Each check is a measured failure class from this repo, not style:
//  - stranded mutant: a mutation cycle died between write(mutant) and
//    restore(); the cpp sat inverted on disk with a /* MUTANT */ marker and
//    the next build shipped it (ABI 101, 2026-08-31).
//  - hardcoded ABI pins: `assert.equal(spec.abiVersion, 100)` x72 left the
//    slice suite 93-red after the 101 bump; the room suite sat 82-red once.
//  - header/model/JSON version skew, cpp struct-size pin disagreement.
//  - JSON spec drift from the model layout (139 lanes / 254 offsets, 2026-09-01).
//  - non-canonical JSON indent (a 3-key change became a 74k-line diff).
//  - frontier.json older than the tree (hand-off pointer stale).
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { isCanonical, readSlice, layoutDrift } from "../slice-json.mjs";

const stripCComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
const rel = (ROOT, p) => p.slice(ROOT.length).replace(/\\/g, "/").replace(/^\//, "");

/** family key -> { model, header, source, test } (paths that exist, else null). */
export function familyFiles(ROOT) {
  const out = {};
  const modelDir = join(ROOT, "scripts", "decomp");
  for (const f of readdirSync(modelDir)) {
    if (!/-model\.mjs$/.test(f) || /\.(bak|mutbak)/.test(f)) continue;
    const key = f.replace(/-pure-model\.mjs$|-model\.mjs$/, "");
    const snake = key.replace(/-/g, "_");
    const header = [`${snake}_pure_helpers.h`, `${snake}_slice.h`, `${snake}.h`]
      .map((h) => join(ROOT, "native", "decomp", h)).find(existsSync) ?? null;
    const source = header && existsSync(header.replace(/\.h$/, ".cpp")) ? header.replace(/\.h$/, ".cpp") : null;
    const test = [`decomp-${key}-pure-helpers.test.js`, `decomp-${key}-slice.test.js`, `decomp-${key}.test.js`]
      .map((t) => join(ROOT, "tests", t)).find(existsSync) ?? null;
    out[key] = { model: join(modelDir, f), header, source, test };
  }
  return out;
}

/** Every ISAAC_*_ABI_VERSION value in a header, comments stripped. */
export function headerAbi(headerPath) {
  const txt = stripCComments(readFileSync(headerPath, "utf8"));
  return [...txt.matchAll(/ISAAC_[A-Z0-9_]*ABI_VERSION\s*=\s*(\d+)/g)].map((m) => Number(m[1]));
}
export function modelAbi(modelPath) {
  const m = readFileSync(modelPath, "utf8").match(/export const [A-Z0-9_]*ABI_VERSION\s*=\s*(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Line numbers of literal ABI pins (`assert.equal(<abi expr>, 88)`) in a test file. */
export function hardcodedAbiPins(testPath) {
  const re = /assert\.(?:equal|strictEqual)\(\s*(?:spec\.abiVersion|[A-Z][A-Z0-9_]*ABI_VERSION|[\w.()]*\babi\(\))\s*,\s*\d+\s*[,)]/;
  const hits = [];
  readFileSync(testPath, "utf8").split("\n").forEach((l, i) => { if (re.test(l)) hits.push(i + 1); });
  return hits;
}

const laneEnd = (f) => f.offset + (f.bytes ?? f.size ?? (f.type === "u8" ? 1 : f.type === "u16" ? 2 : 4));

/**
 * @param {string} ROOT repo root
 * @param {{strict?: boolean}} o strict = hand-off mode: stale frontier and hardcoded pins are errors
 * @returns {Promise<{errors: string[], warnings: string[], info: object}>}
 */
export async function runConsistencyChecks(ROOT, { strict = false } = {}) {
  const errors = [], warnings = [], info = {};
  const fams = familyFiles(ROOT);

  // 1. header vs model ABI, per family
  for (const [key, f] of Object.entries(fams)) {
    const mv = modelAbi(f.model);
    if (!f.header) { warnings.push(`${key}: no native header found for ${rel(ROOT, f.model)}`); continue; }
    const hv = headerAbi(f.header);
    if (!hv.length) { warnings.push(`${key}: ${rel(ROOT, f.header)} carries no ISAAC_*_ABI_VERSION enum`); continue; }
    if (!hv.every((v) => v === hv[0])) errors.push(`${key}: header ABI enums disagree: ${hv.join(",")}`);
    if (mv != null && mv !== hv[0]) errors.push(`${key}: model ABI ${mv} != header ABI ${hv[0]} (${rel(ROOT, f.header)})`);
  }

  // 2. Update slice: JSON abiVersion, canonical form, layout drift, cpp size pins
  const gu = fams["game-update"];
  let model = null, spec = null;
  try { model = await import(pathToFileURL(gu.model).href); } catch (e) { errors.push(`game-update model failed to import: ${e.message}`); }
  try { spec = readSlice(); } catch (e) { errors.push(`game-update-slice.json does not parse: ${e.message}`); }
  if (spec && model) {
    if (spec.abiVersion !== model.ABI_VERSION) errors.push(`game-update-slice.json abiVersion ${spec.abiVersion} != model ABI_VERSION ${model.ABI_VERSION}`);
    if (!isCanonical()) errors.push("game-update-slice.json is not canonical (node scripts/decomp/slice-json.mjs fmt)");
    const d = layoutDrift(spec, model);
    info.layoutDrift = d.total;
    if (d.total) errors.push(`game-update-slice.json drifts from the model layout: inputs ${d.missingInputs.length} missing / ${d.staleInputs.length} stale, events ${d.missingEvents.length} missing / ${d.staleEvents.length} stale (node scripts/decomp/slice-json.mjs sync)`);
    const src = readFileSync(gu.source, "utf8");
    const pins = [...src.matchAll(/sizeof\(IsaacGameUpdateSliceRuntimeInputs\) == (\d+)/g)].map((m) => Number(m[1]));
    if (!pins.every((p) => p === pins[0])) errors.push(`cpp sizeof(RuntimeInputs) pins disagree: ${[...new Set(pins)].join(",")}`);
    if (pins[0] !== model.ABI_SIZES.runtimeInputs) errors.push(`cpp sizeof(RuntimeInputs)==${pins[0]} but model ABI_SIZES.runtimeInputs=${model.ABI_SIZES.runtimeInputs}`);
    const rtEnd = Math.max(...Object.values(model.RUNTIME_INPUTS_LAYOUT).map(laneEnd));
    if (rtEnd > model.ABI_SIZES.runtimeInputs) errors.push(`runtime layout ends at ${rtEnd}, past ABI_SIZES.runtimeInputs ${model.ABI_SIZES.runtimeInputs}`);
    const evPins = [...src.matchAll(/sizeof\(IsaacGameUpdateSliceEvents\) == (\d+)/g)].map((m) => Number(m[1]));
    if (evPins.length && (!evPins.every((p) => p === evPins[0]) || evPins[0] !== model.ABI_SIZES.events)) errors.push(`cpp sizeof(Events) pins ${[...new Set(evPins)].join(",")} vs model ${model.ABI_SIZES.events}`);
  }

  // 3. stranded mutants: MUTANT markers in translation sources, journal, backup files
  const markerFiles = [];
  for (const f of Object.values(fams)) for (const p of [f.header, f.source, f.model]) {
    if (p && /\bMUTANT\b/.test(readFileSync(p, "utf8"))) markerFiles.push(rel(ROOT, p));
  }
  if (markerFiles.length) errors.push(`MUTANT marker left in tracked source (a mutation cycle did not restore): ${markerFiles.join(", ")}`);
  const journal = join(ROOT, ".mutation-journal.jsonl");
  if (existsSync(journal)) {
    const last = new Map();
    for (const l of readFileSync(journal, "utf8").split("\n").filter(Boolean)) { const e = JSON.parse(l); last.set(e.file, e); }
    for (const [file, e] of last) {
      const abs = join(ROOT, file);
      if (e.mode !== "record" || !existsSync(abs)) continue;
      const sha = createHash("sha256").update(readFileSync(abs)).digest("hex");
      if (sha !== e.sha256) errors.push(`stranded mutant per .mutation-journal.jsonl: ${file} (${e.label}) — node scripts/decomp/mutation-journal.mjs restore ${file}`);
    }
  }
  for (const d of ["native/decomp", "scripts/decomp"]) {
    for (const f of readdirSync(join(ROOT, d))) {
      if (/\.(mutbak|bak\d*|orig|new)$/.test(f)) warnings.push(`leftover backup ${d}/${f} (a mutation cycle or hand edit did not clean up)`);
    }
  }

  // 4. hardcoded ABI pins in tests (AGENTS.md rule; strict = error)
  const pinFiles = [];
  for (const f of Object.values(fams)) {
    if (!f.test) continue;
    const hits = hardcodedAbiPins(f.test);
    if (hits.length) {
      pinFiles.push(rel(ROOT, f.test));
      (strict ? errors : warnings).push(`${rel(ROOT, f.test)}: ${hits.length} hardcoded ABI pin(s) (lines ${hits.slice(0, 4).join(",")}${hits.length > 4 ? ",…" : ""}) — pin against the header/model constant`);
    }
  }
  info.hardcodedAbiPinFiles = pinFiles;

  // 5. frontier freshness + working tree
  try {
    const frontier = JSON.parse(readFileSync(join(ROOT, "decomp", "frontier.json"), "utf8"));
    if (model && frontier.updatedAbi < model.ABI_VERSION) (strict ? errors : warnings).push(`frontier.json written at ABI ${frontier.updatedAbi}, tree is at ${model.ABI_VERSION} — hand-off pointer stale`);
  } catch (e) { errors.push(`frontier.json: ${e.message}`); }
  try {
    const st = execFileSync("git", ["status", "--porcelain", "--untracked-files=no"], { cwd: ROOT, encoding: "utf8" });
    const dirty = st.split("\n").filter(Boolean).map((l) => l.slice(3).trim());
    info.dirtyTracked = dirty;
    const unit = dirty.filter((p) => /^(decomp|native\/decomp|scripts\/decomp|tests)\//.test(p));
    if (unit.length) warnings.push(`unit in flight — ${unit.length} tracked decomp file(s) modified, uncommitted: ${unit.slice(0, 6).join(", ")}${unit.length > 6 ? ", …" : ""}`);
  } catch { /* not a git checkout */ }

  return { errors, warnings, info };
}

export function formatReport({ errors, warnings }) {
  const lines = [];
  for (const e of errors) lines.push(`  ✖ ${e}`);
  for (const w of warnings) lines.push(`  ! ${w}`);
  if (!lines.length) lines.push("  ok — header/model/JSON/cpp agree; no stranded mutants; no hardcoded ABI pins");
  return lines.join("\n");
}
