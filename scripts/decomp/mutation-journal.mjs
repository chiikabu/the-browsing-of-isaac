#!/usr/bin/env node
/** mutation-journal.mjs — crash-safe pre-write journal for in-place
 * mutant-cycle editing of family files.
 *
 * Problem this solves: a suite killed mid-mutant-cycle dies between
 * writeFile(mutant) and restore(); the finally{} never runs and the
 * family cpp/header/model stays MUTATED. Digest-based restore checks
 * baseline whatever is on disk, so they cannot see stranded damage.
 *
 * Usage:
 *   node scripts/decomp/mutation-journal.mjs record <file> <label>
 *       Snapshot <file> BEFORE a mutation write: appends
 *       {ts,mode:record,label,file,sha256} to .mutation-journal.jsonl
 *       and stashes the full pre-write bytes under
 *       .mutation-journal/<sha256>.bin (deduped by content hash).
 *   node scripts/decomp/mutation-journal.mjs restore <file>
 *       Restores the last recorded pre-write content for <file>.
 *       Refuses silently-clean files; exits 1 on damage/no-journal.
 *   node scripts/decomp/mutation-journal.mjs check <file>
 *       Compares disk sha256 vs the latest journal before-sha.
 *       Reports CLEAN / STRANDED / NO-JOURNAL. Exit 0 clean,
 *       1 stranded or error, 2 usage.
 *
 * Zero dependencies. Node >= 18. Run from repo root.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = process.cwd();
const JOURNAL = join(ROOT, ".mutation-journal.jsonl");
const STASH_DIR = join(ROOT, ".mutation-journal");
const USAGE = 2;

const sha256 = (buf) =>
  createHash("sha256").update(buf).digest("hex");
const fail = (msg, code = 1) => {
  console.error(`mutation-journal: ${msg}`);
  process.exit(code);
};
const entriesFor = (file) => {
  if (!existsSync(JOURNAL)) return [];
  return readFileSync(JOURNAL, "utf8")
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line))
    .filter((e) => e.mode === "record" && e.file === file);
};
const append = (obj) =>
  writeFileSync(JOURNAL, JSON.stringify(obj) + "\n", { flag: "a" });

const [mode, relFile, label] = process.argv.slice(2);
if (!relFile || (mode === "record" && !label)) {
  console.error(
    "usage: mutation-journal.mjs record <file> <label> | " +
      "restore <file> | check <file>");
  process.exit(USAGE);
}
const file = relFile;
const abs = resolve(ROOT, file);
if (!existsSync(abs)) fail(`${file}: no such file`);

const bytes = readFileSync(abs);
const diskSha = sha256(bytes);

if (mode === "record") {
  mkdirSync(STASH_DIR, { recursive: true });
  const stashPath = join(STASH_DIR, `${diskSha}.bin`);
  const fresh = !existsSync(stashPath);
  if (fresh) writeFileSync(stashPath, bytes);
  append({
    ts: new Date().toISOString(),
    mode: "record",
    label,
    file,
    sha256: diskSha,
  });
  console.log(
    `RECORDED ${file} ${diskSha.slice(0, 12)}… ` +
      `(stash ${fresh ? "created" : "deduped"}) label=${JSON.stringify(label)}`);
  process.exit(0);
}

const records = entriesFor(file);
if (records.length === 0) fail(`${file}: NO-JOURNAL (never recorded)`, 1);
const last = records[records.length - 1];

if (mode === "check") {
  if (diskSha === last.sha256) {
    console.log(`CLEAN ${file} ${diskSha.slice(0, 12)}… matches journal`);
    process.exit(0);
  }
  console.log(
    `STRANDED ${file} disk=${diskSha.slice(0, 12)}… ` +
      `journal=${last.sha256.slice(0, 12)}… (${last.label})`);
  process.exit(1);
}

if (mode === "restore") {
  if (diskSha === last.sha256) {
    console.log(`CLEAN-ALREADY ${file} — nothing to restore`);
    process.exit(0);
  }
  const stashPath = join(STASH_DIR, `${last.sha256}.bin`);
  if (!existsSync(stashPath)) {
    fail(`${file}: stash missing for ${last.sha256.slice(0, 12)}…`);
  }
  writeFileSync(abs, readFileSync(stashPath));
  append({
    ts: new Date().toISOString(),
    mode: "restored",
    from: last.label,
    file,
    sha256: last.sha256,
  });
  console.log(`RESTORED ${file} -> ${last.sha256.slice(0, 12)}…`);
  process.exit(0);
}

fail(`unknown mode ${mode}`, USAGE);
