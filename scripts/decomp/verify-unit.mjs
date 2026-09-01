#!/usr/bin/env node
// The unit completion gate, in ONE call with a COMPACT report.
//
//   node scripts/decomp/verify-unit.mjs                 # standard gate
//   node scripts/decomp/verify-unit.mjs --full          # + full npm test
//   node scripts/decomp/verify-unit.mjs --suite tests/decomp-room-pure-helpers.test.js
//
// Runs the required checks from AGENTS.md, prints one PASS/FAIL line per
// gate plus the first lines of any failure — never thousands of log lines
// into an agent's context. Sets up the emsdk environment itself (the
// family suites self-build wasm and fail en masse without it).
// Exit code 0 only when every gate passed.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const args = process.argv.slice(2);
const wantFull = args.includes("--full");
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
function gate(name, cmd, cmdArgs, { optional = false, timeoutMs = 15 * 60 * 1000 } = {}) {
  const t0 = Date.now();
  const r = spawnSync(cmd, cmdArgs, {
    cwd: ROOT, env, encoding: "utf8", timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024, shell: false,
  });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const ok = r.status === 0;
  const text = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
  let detail = "";
  if (ok) {
    // Surface the one line that proves substance, when the tool prints one.
    const m =
      text.match(/DIFFERENTIAL PASSED[^\n]*/) ||
      text.match(/ℹ tests \d+[\s\S]*?ℹ fail \d+/) ||
      text.match(/Repository safety check passed[^\n]*/);
    if (m) detail = m[0].replace(/\n/g, "  ").replace(/ℹ /g, "");
  } else {
    const failLines = text
      .split("\n")
      .filter((l) => /✖|not ok|Error|error:|FAIL|AssertionError/.test(l))
      .slice(0, 5);
    detail = (failLines.length ? failLines : text.split("\n").slice(-6)).join("\n    ");
  }
  results.push({ name, ok, secs, detail, optional });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  (${secs}s)${detail ? `\n    ${detail}` : ""}`);
  return ok;
}

console.log("== unit verification gate ==");
gate(
  "slice+pipeline tests",
  process.execPath,
  ["--test", "tests/decomp-game-update-slice.test.js", "tests/decomp-pipeline.test.js"],
);
for (const s of suites) gate(`suite ${s}`, process.execPath, ["--test", s]);
gate("verify-slice differential", process.execPath, [
  "--max-old-space-size=1024",
  "scripts/decomp/verify-game-update-slice.mjs",
]);
if (wantFull) {
  gate("full npm test", process.execPath, [
    join(ROOT, "node_modules", "npm", "bin", "npm-cli.js"), "test",
  ], { timeoutMs: 60 * 60 * 1000 });
}
gate("repo safety", process.execPath, ["scripts/check-repo-safety.mjs"]);
gate("git diff --check", "git", ["diff", "--check"]);

const failed = results.filter((r) => !r.ok);
console.log(
  failed.length
    ? `\nRESULT: FAIL — ${failed.map((f) => f.name).join(", ")}`
    : "\nRESULT: all gates PASS",
);
process.exit(failed.length ? 1 : 0);
