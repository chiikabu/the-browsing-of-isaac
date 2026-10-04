#!/usr/bin/env node
// The unit completion gate, in ONE call with a COMPACT report.
//
//   node scripts/decomp/verify-unit.mjs                 # standard gate (suites auto-detected from the dirty tree)
//   node scripts/decomp/verify-unit.mjs --suite tests/decomp-room-pure-helpers.test.js
//   node scripts/decomp/verify-unit.mjs --full          # + full npm test
//   node scripts/decomp/verify-unit.mjs --handoff       # --full + strict preflight (frontier current, no literal ABI pins)
//   node scripts/decomp/verify-unit.mjs --preflight     # only the instant consistency checks
//
// Stages:
//   0. preflight  — scripts/decomp/lib/consistency.mjs (≈1 s): header/model/
//      JSON ABI agreement, cpp size pins, JSON layout drift + canonical form,
//      stranded mutants (/* MUTANT */ markers, journal), hardcoded ABI pins in
//      tests, frontier freshness. A failure here stops the gate before any
//      15-minute suite runs.
//   1. slice build — build-game-update-slice.mjs (skipped when the wasm is
//      newer than every source it is built from), then abi.json must report
//      zero imports and the tree's ABI. The differential and the slice tests
//      both READ this wasm, so it is built once, up front, never concurrently.
//   2. parallel     — slice+pipeline tests, the family suites, the 5k-case
//      differential, repo safety, `git diff --check`, and `npm test` under
//      --full — all at once (16 cores; the family suites build into PID-scoped
//      dirs and their wasm builds are content-hash cached). Wall time is the
//      longest gate, not the sum.
//
// Sets up the emsdk environment itself (the family suites self-build wasm and
// fail en masse without it). Exit code 0 only when every gate passed.

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runConsistencyChecks, formatReport, familyFiles } from "./lib/consistency.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const wantHandoff = args.includes("--handoff");
const wantFull = args.includes("--full") || wantHandoff;
const onlyPreflight = args.includes("--preflight");
const suites = [];
for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--suite") suites.push(args[++i]);
}

// emsdk on PATH for every child (measured failure class: 82 phantom fails).
const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
const env = {
  ...process.env,
  EMSDK: emsdk,
  PATH: [emsdk, join(emsdk, "upstream", "emscripten"), process.env.PATH].join(delimiter),
};
if (!existsSync(join(emsdk, "upstream", "emscripten"))) {
  console.log(`! emsdk not found at ${emsdk} — self-building suites will fail`);
}

const results = [];
const T0 = Date.now();
function record(name, ok, secs, detail) {
  results.push({ name, ok, secs, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${secs}s)${detail ? `\n    ${detail}` : ""}`);
  return ok;
}
function summarize(ok, text) {
  if (ok) {
    const m =
      text.match(/DIFFERENTIAL PASSED[^\n]*/) ||
      text.match(/ℹ tests \d+[\s\S]*?ℹ fail \d+/) ||
      text.match(/Repository safety check passed[^\n]*/) ||
      text.match(/Built [^\n]*/);
    return m ? m[0].replace(/\n/g, "  ").replace(/ℹ /g, "") : "";
  }
  const failLines = text.split("\n").filter((l) => /✖|not ok|Error|error:|FAIL|AssertionError|mismatch/.test(l)).slice(0, 5);
  return (failLines.length ? failLines : text.split("\n").filter(Boolean).slice(-6)).join("\n    ");
}
function gateSync(name, cmd, cmdArgs, { timeoutMs = 15 * 60 * 1000 } = {}) {
  const t0 = Date.now();
  const r = spawnSync(cmd, cmdArgs, { cwd: ROOT, env, encoding: "utf8", timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024, shell: false });
  const ok = r.status === 0;
  return record(name, ok, ((Date.now() - t0) / 1000).toFixed(1), summarize(ok, `${r.stdout ?? ""}\n${r.stderr ?? ""}`));
}
function gateAsync(name, cmd, cmdArgs, { timeoutMs = 15 * 60 * 1000 } = {}) {
  return new Promise((resolveP) => {
    const t0 = Date.now();
    const child = spawn(cmd, cmdArgs, { cwd: ROOT, env, shell: false });
    let out = "";
    const cap = (b) => { if (out.length < 32 * 1024 * 1024) out += b.toString(); };
    child.stdout.on("data", cap);
    child.stderr.on("data", cap);
    const timer = setTimeout(() => { child.kill(); out += `\n[verify-unit] timeout after ${timeoutMs / 1000}s`; }, timeoutMs);
    child.on("close", (code) => {
      clearTimeout(timer);
      const ok = code === 0;
      resolveP(record(name, ok, ((Date.now() - t0) / 1000).toFixed(1), summarize(ok, out)));
    });
    child.on("error", (e) => { clearTimeout(timer); resolveP(record(name, false, ((Date.now() - t0) / 1000).toFixed(1), e.message)); });
  });
}

console.log(`== unit verification gate${wantHandoff ? " (hand-off)" : ""} ==`);

// -- 0. preflight ---------------------------------------------------------
{
  const t0 = Date.now();
  const cc = await runConsistencyChecks(ROOT, { strict: wantHandoff });
  const ok = cc.errors.length === 0;
  record("preflight consistency", ok, ((Date.now() - t0) / 1000).toFixed(1),
    ok ? (cc.warnings.length ? `${cc.warnings.length} warning(s):\n${formatReport({ errors: [], warnings: cc.warnings })}` : "")
       : formatReport(cc));
  if (!ok) {
    console.log("\nRESULT: FAIL — preflight consistency (fix the tree before running the suites)");
    process.exit(1);
  }
  // Auto-detect family suites from the dirty tree when none were named.
  if (suites.length === 0) {
    const fams = familyFiles(ROOT);
    for (const p of cc.info.dirtyTracked ?? []) {
      for (const [key, f] of Object.entries(fams)) {
        if (!f.test || key === "game-update") continue;
        const owned = [f.header, f.source, f.model].filter(Boolean).map((x) => x.slice(ROOT.length + 1).replace(/\\/g, "/"));
        if (owned.includes(p) && !suites.includes(f.test.slice(ROOT.length + 1).replace(/\\/g, "/"))) {
          suites.push(f.test.slice(ROOT.length + 1).replace(/\\/g, "/"));
        }
      }
    }
    if (suites.length) console.log(`    auto-detected family suite(s) from the dirty tree: ${suites.join(", ")}`);
  }
}
if (onlyPreflight) {
  console.log("\nRESULT: preflight PASS");
  process.exit(0);
}

// -- 1. slice build (once, before anything reads the wasm) ----------------
{
  const wasm = join(ROOT, "output", "decomp", "wasm-slice", "game-update-slice.wasm");
  const buildScript = join(ROOT, "scripts", "decomp", "build-game-update-slice.mjs");
  const inputs = [buildScript, join(ROOT, "native", "decomp", "game_update_slice.cpp"), join(ROOT, "native", "decomp", "game_update_slice.h")];
  const buildText = readFileSync(buildScript, "utf8");
  for (const m of buildText.matchAll(/join\(root, "native", "decomp", "([^"]+\.cpp)"\)/g)) {
    const p = join(ROOT, "native", "decomp", m[1]);
    if (existsSync(p)) { inputs.push(p, p.replace(/\.cpp$/, ".h")); }
  }
  const newest = Math.max(...inputs.filter(existsSync).map((p) => statSync(p).mtimeMs));
  const fresh = existsSync(wasm) && statSync(wasm).mtimeMs >= newest;
  if (fresh) {
    record("slice build", true, "0.0", `wasm newer than every source (${new Date(statSync(wasm).mtime).toISOString()}) — reused`);
  } else {
    gateSync("slice build", process.execPath, [buildScript]);
  }
  // Ask the MODULE, not a report about it: instantiate the freshly built
  // wasm (zero imports by contract) and read its exported ABI version.
  const abiPath = join(ROOT, "output", "decomp", "wasm-slice", "abi.json");
  let detail = "wasm missing"; let ok = false;
  if (existsSync(wasm)) {
    try {
      const mod = new WebAssembly.Module(readFileSync(wasm));
      const imports = WebAssembly.Module.imports(mod);
      const exportsN = WebAssembly.Module.exports(mod).length;
      const inst = new WebAssembly.Instance(mod, Object.fromEntries(imports.map((i) => [i.module, {}])));
      const fn = inst.exports.isaac_game_update_slice_abi_version ?? inst.exports._isaac_game_update_slice_abi_version;
      const abi = typeof fn === "function" ? fn() : undefined;
      const model = await import(new URL("./game-update-model.mjs", import.meta.url).href);
      const reportImports = existsSync(abiPath) ? (JSON.parse(readFileSync(abiPath, "utf8")).imports ?? []).length : "n/a";
      ok = imports.length === 0 && abi === model.ABI_VERSION;
      detail = `module imports ${imports.length} (abi.json says ${reportImports}), exports ${exportsN}, module ABI ${abi} (model ${model.ABI_VERSION})`;
    } catch (e) { detail = `wasm did not instantiate: ${e.message}`; }
  }
  record("slice wasm: zero imports + tree ABI", ok, "0.0", detail);
  if (results.some((r) => !r.ok)) {
    console.log(`\nRESULT: FAIL — ${results.filter((r) => !r.ok).map((r) => r.name).join(", ")}`);
    process.exit(1);
  }
}

// -- 2. everything else, in parallel --------------------------------------
// Under --full the family suites run INSIDE npm test; launching them
// standalone as well would run the same suite twice at once, and the family
// suites mutate their own cpp in place during mutation checks — two copies
// racing on one file is how a mutant gets stranded. So: standalone suites
// only when npm test is not part of this run.
const jobs = [
  gateAsync("verify-slice differential", process.execPath,
    ["--max-old-space-size=1024", "scripts/decomp/verify-game-update-slice.mjs"]),
  gateAsync("repo safety", process.execPath, ["scripts/check-repo-safety.mjs"]),
  gateAsync("git diff --check", "git", ["diff", "--check"]),
];
if (wantFull) {
  if (suites.length) console.log(`    (family suite(s) ${suites.join(", ")} run inside npm test under --full)`);
  // Run package.json's "test" script directly with the current node: no npm
  // launcher lookup (the old node_modules/npm path never existed here) and the
  // glob expanded by us, so the command is byte-for-byte what `npm test` runs.
  const script = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")).scripts?.test ?? "node --test tests/*.test.js";
  const parts = script.split(/\s+/).filter(Boolean);
  const files = parts.flatMap((p) => {
    const m = p.match(/^tests\/\*(\.test\.js)$/);
    if (!m) return p.startsWith("tests/") ? [p] : [];
    return readdirSync(join(ROOT, "tests")).filter((f) => f.endsWith(m[1])).sort().map((f) => `tests/${f}`);
  });
  const flags = parts.slice(1).filter((p) => p.startsWith("--"));
  jobs.push(gateAsync(`full npm test (${files.length} files; incl. slice+pipeline+toolkit + family suites)`, process.execPath,
    [...flags, ...files], { timeoutMs: 60 * 60 * 1000 }));
} else {
  jobs.push(gateAsync("slice+pipeline+toolkit tests", process.execPath,
    ["--test", "tests/decomp-game-update-slice.test.js", "tests/decomp-pipeline.test.js", "tests/decomp-toolkit.test.js"]));
  jobs.push(...suites.map((s) => gateAsync(`suite ${s}`, process.execPath, ["--test", s])));
}
await Promise.all(jobs);

const failed = results.filter((r) => !r.ok);
const wall = ((Date.now() - T0) / 1000).toFixed(1);
console.log(
  failed.length
    ? `\nRESULT: FAIL — ${failed.map((f) => f.name).join(", ")}  (wall ${wall}s)`
    : `\nRESULT: all gates PASS  (wall ${wall}s)`,
);
process.exit(failed.length ? 1 : 0);
