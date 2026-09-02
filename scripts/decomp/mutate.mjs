#!/usr/bin/env node
// Crash-safe mutation check: apply ONE textual mutant to a tracked source,
// run a command that must FAIL on it, and restore the file byte-identical no
// matter how the command ends.
//
//   node scripts/decomp/mutate.mjs --file native/decomp/game_update_slice.cpp \
//        --from 'result(game_type_0, flags_2654c) != 0u' \
//        --to   'result(game_type_0, flags_2654c) == 0u' \
//        -- node scripts/decomp/build-game-update-slice.mjs
//   node scripts/decomp/mutate.mjs --file F --from A --to B -- node --test tests/decomp-room-pure-helpers.test.js
//   node scripts/decomp/mutate.mjs check      # any stranded mutant on disk? (exit 1 if so)
//   node scripts/decomp/mutate.mjs restore    # put back every stranded original
//
// Contract:
//  - the pre-write bytes are stashed under output/decomp/_scratch/mutants/<sha>.bin
//    and journaled in .mutation-journal.jsonl BEFORE the mutant is written, so
//    a hard kill (Ctrl+C, OOM, terminal closed) leaves a recoverable trail that
//    `mutate.mjs check` / `restore` and the gate's consistency preflight see;
//  - the mutant text is tagged /* MUTANT */ (or // MUTANT) so a stranded copy
//    is also caught by the marker scan even without the journal;
//  - restore is verified by sha256 of the bytes (text compares lie across CRLF);
//  - exit 0 = MUTANT KILLED (command failed as it must); exit 1 = MUTANT
//    SURVIVED (command passed — the assertions do not discriminate); exit 2 =
//    usage/restore problem.
//  - the SOURCE is restored, not the command's OUTPUTS: a command that writes
//    a result artifact (build_selftest.py -> output/recomp/host/build-selftest.json,
//    build-game-update-slice.mjs -> the slice wasm) leaves the MUTANT's
//    artifact behind. Re-run the clean command once after a KILLED run before
//    anything consumes those artifacts (tests/recomp-host.test.js read the
//    mutant's 4 failures until the selftest was rebuilt clean, 2026-09-01).
//
// Why: the 2026-08-31 unit left `/* MUTANT: inverted verdict */` in the
// shipped cpp — the check was done by hand-editing, the session died between
// "watch it fail" and "put it back", and the next build shipped the mutant.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { delimiter } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const JOURNAL = join(ROOT, ".mutation-journal.jsonl");
const STASH = join(ROOT, "output", "decomp", "_scratch", "mutants");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const rel = (p) => resolve(p).slice(ROOT.length).replace(/\\/g, "/").replace(/^\//, "");
const journalEntries = () => existsSync(JOURNAL)
  ? readFileSync(JOURNAL, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
const journal = (o) => appendFileSync(JOURNAL, JSON.stringify({ ts: new Date().toISOString(), ...o }) + "\n");

function stranded() {
  const last = new Map();
  for (const e of journalEntries()) last.set(e.file, e);
  const out = [];
  for (const [file, e] of last) {
    if (e.mode !== "record") continue;
    const abs = join(ROOT, file);
    if (!existsSync(abs)) continue;
    if (sha256(readFileSync(abs)) !== e.sha256) out.push({ file, e });
  }
  return out;
}

function writeRetry(path, bytes) {
  // Windows transient locks (AV/OneDrive) fail writes with EBUSY/-4094; a
  // mutant must never survive a failed restore, so retry with a real budget.
  for (let attempt = 0; ; attempt += 1) {
    try { writeFileSync(path, bytes); return; } catch (e) {
      if (attempt >= 200) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(25 * (attempt + 1), 500));
    }
  }
}

const argv = process.argv.slice(2);
if (argv[0] === "check") {
  const s = stranded();
  for (const { file, e } of s) console.log(`STRANDED ${file} (label ${e.label}, recorded ${e.ts})`);
  console.log(s.length ? `${s.length} stranded mutant(s) — run: node scripts/decomp/mutate.mjs restore` : "clean — no stranded mutants");
  process.exit(s.length ? 1 : 0);
}
if (argv[0] === "restore") {
  let bad = 0;
  for (const { file, e } of stranded()) {
    const stash = join(STASH, `${e.sha256}.bin`);
    if (!existsSync(stash)) { console.log(`CANNOT RESTORE ${file}: stash ${e.sha256.slice(0, 12)} missing`); bad += 1; continue; }
    writeRetry(join(ROOT, file), readFileSync(stash));
    journal({ mode: "restored", file, sha256: e.sha256, from: e.label });
    console.log(`RESTORED ${file} -> ${e.sha256.slice(0, 12)}`);
  }
  process.exit(bad ? 2 : 0);
}

const opt = {};
let cmd = null;
for (let i = 0; i < argv.length; i += 1) {
  if (argv[i] === "--") { cmd = argv.slice(i + 1); break; }
  if (argv[i].startsWith("--")) opt[argv[i].slice(2)] = argv[++i];
}
if (!opt.file || opt.from == null || opt.to == null || !cmd?.length) {
  console.error("usage: mutate.mjs --file F --from TEXT --to TEXT [--label L] -- <command...>   |   mutate.mjs check | restore");
  process.exit(2);
}
const file = resolve(ROOT, opt.file);
const original = readFileSync(file);
const origSha = sha256(original);
const text = original.toString("utf8");
const occurrences = text.split(opt.from).length - 1;
if (occurrences !== 1) { console.error(`--from must match exactly once in ${rel(file)}; matched ${occurrences}`); process.exit(2); }
const tag = /\.(c|cc|cpp|h|hpp|js|mjs|ts)$/.test(file) ? " /* MUTANT */" : "";
const mutant = Buffer.from(text.replace(opt.from, opt.to + tag), "utf8");
if (mutant.equals(original)) { console.error("mutant is byte-identical to the original"); process.exit(2); }

mkdirSync(STASH, { recursive: true });
const stash = join(STASH, `${origSha}.bin`);
if (!existsSync(stash)) writeFileSync(stash, original);
const label = opt.label ?? `${opt.from.slice(0, 40)} -> ${opt.to.slice(0, 40)}`;
journal({ mode: "record", file: rel(file), label, sha256: origSha });

let restored = false;
const restore = () => {
  if (restored) return;
  writeRetry(file, original);
  const back = sha256(readFileSync(file));
  if (back !== origSha) { console.error(`RESTORE FAILED for ${rel(file)}: ${back.slice(0, 12)} != ${origSha.slice(0, 12)}`); process.exitCode = 2; return; }
  restored = true;
  journal({ mode: "restored", file: rel(file), sha256: origSha, from: label });
};
for (const sig of ["SIGINT", "SIGTERM", "SIGHUP", "SIGBREAK"]) {
  try { process.on(sig, () => { restore(); process.exit(130); }); } catch { /* not on this platform */ }
}
process.on("uncaughtException", (e) => { console.error(e); restore(); process.exit(2); });
process.on("exit", restore);

const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
const env = { ...process.env, EMSDK: emsdk, PATH: [emsdk, join(emsdk, "upstream", "emscripten"), process.env.PATH].join(delimiter) };
writeRetry(file, mutant);
console.log(`MUTANT APPLIED ${rel(file)} (${label})`);
const t0 = Date.now();
const r = spawnSync(cmd[0] === "node" ? process.execPath : cmd[0], cmd.slice(1), {
  cwd: ROOT, env, encoding: "utf8", maxBuffer: 256 * 1024 * 1024, shell: false, timeout: 60 * 60 * 1000,
});
restore();
const secs = ((Date.now() - t0) / 1000).toFixed(1);
const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`;
const failLine = out.split("\n").find((l) => /mismatch|✖|not ok|AssertionError|Error:|failed/.test(l));
if (r.status !== 0) {
  console.log(`MUTANT KILLED — command exited ${r.status} after ${secs}s${failLine ? `\n    ${failLine.trim().slice(0, 200)}` : ""}`);
  console.log(`RESTORED ${rel(file)} sha256 ${origSha.slice(0, 12)} (verified)`);
  process.exit(0);
}
console.log(`MUTANT SURVIVED — command exited 0 after ${secs}s; the assertions do not discriminate this mutant`);
console.log(`RESTORED ${rel(file)} sha256 ${origSha.slice(0, 12)} (verified)`);
process.exit(1);
