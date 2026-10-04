#!/usr/bin/env node
// family-guard.mjs — incident-specific guard against repeating the 2026-08-21
// lua_engine_pure_helpers.cpp destruction (a wrong-family backup was copied
// over the target; git could not restore because the tree is untracked).
//
// Usage:
//   node scripts/decomp/family-guard.mjs <target-cpp-or-h> <candidate-file>
//       Verify the candidate belongs to the target's family BEFORE any copy/restore.
//       Exit 0 = safe to copy. Exit 1 = REFUSE (reason printed).
//
//   node scripts/decomp/family-guard.mjs --check <file>
//       Validate an existing file's family identity in place.

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function fail(reason) {
  console.error(`FAMILY-GUARD: REFUSE — ${reason}`);
  console.error("FAMILY-GUARD: do NOT copy this candidate over the target.");
  process.exit(1);
}

function ok(msg) {
  console.log(`FAMILY-GUARD: OK — ${msg}`);
  process.exit(0);
}

function readFile(p) {
  if (!fs.existsSync(p)) fail(`file not found: ${p}`);
  return fs.readFileSync(p, "utf8");
}

// Family stem: basename without extension(s), e.g.
// lua_engine_pure_helpers.cpp -> lua_engine_pure_helpers
function familyStem(file) {
  const base = path.basename(file);
  const stem = base.replace(/\.(cpp|h|hpp|cc|hh)(\..*)?$/i, "");
  if (!stem || stem === base)
    fail(`cannot derive a family stem from "${base}" (expected a .cpp/.h decomp file)`);
  return stem;
}

// Find sibling header for a target file: same dir, same stem, .h preferred;
// fall back to the target itself when it IS the header.
function familyHeader(target) {
  const dir = path.dirname(target);
  const stem = familyStem(target);
  const hAbs = path.join(dir, `${stem}.h`);
  if (/\.h$/i.test(target)) {
    if (!fs.existsSync(path.resolve(ROOT, target))) fail(`target header not found: ${target}`);
    return path.resolve(ROOT, target);
  }
  if (!fs.existsSync(hAbs)) fail(`no sibling header ${stem}.h next to target — cannot derive family ABI macro`);
  return path.resolve(ROOT, hAbs);
}

// ABI macro token from the intact family header, e.g.
// ISAAC_ANM2_PURE_HELPERS_ABI_VERSION / ISAAC_ALLOC_ABI_VERSION ...
function abiMacro(headerAbs) {
  const text = fs.readFileSync(headerAbs, "utf8");
  // Prefer explicit enum-style definitions; fall back to any *_ABI_VERSION token.
  const m =
    text.match(/\b([A-Z][A-Z0-9_]*_PURE_HELPERS_ABI_VERSION)\b/) ||
    text.match(/\b([A-Z][A-Z0-9_]*_ABI_VERSION)\b/);
  if (!m) fail(`no *_ABI_VERSION token found in intact family header ${path.basename(headerAbs)} — cannot derive family identity`);
  return m[1];
}

const argv = process.argv.slice(2);

if (argv[0] === "--check") {
  const file = argv[1];
  if (!file) fail("usage: family-guard.mjs --check <file>");
  const stem = familyStem(file);
  const text = readFile(file);

  if (/\.h$/i.test(file)) {
    const macro = abiMacro(path.resolve(ROOT, file));
    if (!text.includes(macro))
      fail(`${path.basename(file)} does not declare its own ABI macro ${macro} — header may be foreign or truncated`);
    ok(`${path.basename(file)} declares ${macro} — family identity consistent with stem "${stem}"`);
  }

  const includeOk = new RegExp(`#\\s*include\\s*"${stem}\\.h"`).test(text);
  if (!includeOk) fail(`candidate ${path.basename(file)} never includes its own family header "${stem}.h"`);
  const macro = abiMacro(familyHeader(file));
  if (!text.includes(macro)) fail(`candidate ${path.basename(file)} lacks family ABI macro ${macro} — wrong-family backup?`);
  ok(
    `${path.basename(file)} includes "${stem}.h" and references ${macro} — family identity consistent`,
  );
}

const [targetArg, candArg] = argv;
if (!targetArg || !candArg) {
  console.log("Usage:\n  node scripts/decomp/family-guard.mjs <target-cpp-or-h> <candidate-file>\n  node scripts/decomp/family-guard.mjs --check <file>");
  process.exit(1);
}

const target = path.resolve(ROOT, targetArg);
const cand = path.resolve(ROOT, candArg);

if (!fs.existsSync(target)) fail(`target not found: ${targetArg}`);

const stem = familyStem(target);
const candText = readFile(cand);
const headerAbs = familyHeader(target);
const macro = abiMacro(headerAbs);

// Check 1: target stem must appear in the candidate's #include line(s).
const includes = [...candText.matchAll(/#\s*include\s*"([^"]+)"/g)].map((m) => m[1]);
const incHit = includes.find((inc) => path.basename(inc).replace(/\.h$/i, "") === stem);
if (!incHit) {
  fail(
    `candidate ${path.basename(cand)} includes [${includes.slice(0, 4).join(", ")}${includes.length > 4 ? ", ..." : ""}] but NEVER includes "${stem}.h" — it belongs to another family.`,
  );
}

// Check 2: candidate must reference the family's ABI macro from the intact header.
if (!candText.includes(macro)) {
  fail(
    `candidate ${path.basename(cand)} lacks ABI macro ${macro} (from intact header ${path.basename(headerAbs)}) — wrong-family backup.`,
  );
}

ok(
  `candidate ${path.basename(cand)} includes "${incHit}" and references ${macro}; safe to use as source for ${path.basename(target)}.`,
);
