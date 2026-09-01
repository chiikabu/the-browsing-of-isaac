#!/usr/bin/env node
// snapshot-decomp.mjs — point-in-time safety net for the decomp tree.
// Zero dependencies (node:fs/crypto/path only). Windows-safe (forward-slash relpaths).
//
// Usage:
//   node scripts/decomp/snapshot-decomp.mjs            take a snapshot
//   node scripts/decomp/snapshot-decomp.mjs --tag NAME take one + write .snapshots/<ts>.TAG pointer
//   node scripts/decomp/snapshot-decomp.mjs --verify   re-hash newest snapshot vs MANIFEST
//
// Scope (relative to repo root):
//   native/decomp/**                          everything
//   scripts/decomp/**                         everything (covers frame-path.mjs)
//   tests/decomp-*.test.js, tests/signatures.test.js
//   decomp/*.json                             top level only
//   web/js/native-update-bridge.js

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const SNAP_ROOT = path.join(ROOT, ".snapshots");
const KEEP = 10;

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function walkFiles(dir, out = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isDirectory() && e.name === "__pycache__") continue; // build noise
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, out);
    else if (e.isFile() && !/\.pyc$/i.test(e.name)) out.push(p);
  }
  return out;
}

function collectTargets() {
  // Returns [{abs, rel}] with forward-slash rel paths, deduped by abs path.
  const seen = new Set();
  const list = [];
  const add = (abs) => {
    if (!fs.existsSync(abs)) return;
    const key = path.resolve(abs);
    if (seen.has(key)) return;
    seen.add(key);
    if (!fs.statSync(abs).isFile()) return;
    list.push({ abs, rel: path.relative(ROOT, abs).split(path.sep).join("/") });
  };
  const addDir = (dir) => {
    for (const f of walkFiles(dir)) add(f);
  };

  addDir(path.join(ROOT, "native", "decomp"));
  addDir(path.join(ROOT, "scripts", "decomp"));

  const testsDir = path.join(ROOT, "tests");
  if (fs.existsSync(testsDir)) {
    for (const f of walkFiles(testsDir)) {
      const base = path.basename(f);
      if (/^decomp-.*\.test\.js$/.test(base) || base === "signatures.test.js") add(f);
    }
  }

  const decompJsonDir = path.join(ROOT, "decomp");
  if (fs.existsSync(decompJsonDir)) {
    for (const f of fs.readdirSync(decompJsonDir, { withFileTypes: true })) {
      if (f.isFile() && f.name.endsWith(".json")) add(path.join(decompJsonDir, f.name));
    }
  }

  add(path.join(ROOT, "web", "js", "native-update-bridge.js"));
  list.sort((a, b) => a.rel.localeCompare(b.rel));
  return list;
}

function readManifest(snapDir) {
  // -> Map<rel, sha256>
  const map = new Map();
  const mf = path.join(snapDir, "MANIFEST.sha256");
  if (!fs.existsSync(mf)) return map;
  for (const line of fs.readFileSync(mf, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([0-9a-f]{64})\s{2}(.+)$/);
    if (m) map.set(m[2], m[1]);
  }
  return map;
}

function newestSnapshotDirs() {
  if (!fs.existsSync(SNAP_ROOT)) return [];
  return fs
    .readdirSync(SNAP_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse(); // newest first
}

function cmdSnapshot(tag) {
  if (!fs.existsSync(SNAP_ROOT)) fs.mkdirSync(SNAP_ROOT, { recursive: true });

  // UTC timestamp, Windows-safe (no colons): 2026-08-21T09-30-00Z
  const d = new Date();
  const ts =
    d.getUTCFullYear() +
    "-" +
    String(d.getUTCMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getUTCDate()).padStart(2, "0") +
    "T" +
    String(d.getUTCHours()).padStart(2, "0") +
    "-" +
    String(d.getUTCMinutes()).padStart(2, "0") +
    "-" +
    String(d.getUTCSeconds()).padStart(2, "0") +
    "Z";
  const snapDir = path.join(SNAP_ROOT, ts);
  if (fs.existsSync(snapDir)) {
    console.error(`REFUSE: snapshot dir already exists: ${ts}`);
    process.exit(1);
  }

  // Most recent prior manifest for UNCHANGED detection — BEFORE mkdir so the
  // new snapshot never compares against itself.
  const prevDirs = newestSnapshotDirs();
  const prevManifest = prevDirs.length > 0 ? readManifest(path.join(SNAP_ROOT, prevDirs[0])) : new Map();
  fs.mkdirSync(snapDir, { recursive: true });

  const targets = collectTargets();
  if (targets.length === 0) {
    console.error("REFUSE: no target files found under scope. Run from repo root.");
    process.exit(1);
  }

  const rows = [];
  const summary = [];
  let totalBytes = 0;
  let nChanged = 0,
    nUnchanged = 0,
    nNew = 0;

  for (const { abs, rel } of targets) {
    const buf = fs.readFileSync(abs);
    const hash = sha256(buf);
    totalBytes += buf.byteLength;

    const destAbs = path.join(snapDir, ...rel.split("/"));
    fs.mkdirSync(path.dirname(destAbs), { recursive: true });
    // PLAIN COPY ONLY. Never hardlink: a hardlinked snapshot copy would mutate
    // whenever the working file is overwritten — the snapshot must stay
    // bit-immutable or a repeat of the 2026-08-21 incident is unrecoverable.
    fs.copyFileSync(abs, destAbs);

    rows.push(`${hash}  ${rel}`);
    let status;
    if (!prevManifest.has(rel)) {
      status = "NEW";
      nNew++;
    } else if (prevManifest.get(rel) === hash) {
      status = "UNCHANGED";
      nUnchanged++;
    } else {
      status = "CHANGED";
      nChanged++;
    }
    summary.push(`${status.padEnd(9)} ${hash}  ${rel}`);
  }

  fs.writeFileSync(path.join(snapDir, "MANIFEST.sha256"), rows.join("\n") + "\n");
  fs.writeFileSync(
    path.join(snapDir, "SUMMARY.txt"),
    [
      `snapshot: ${ts}`,
      tag ? `tag:      ${tag}` : null,
      `files:    ${targets.length}`,
      `total:    ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`,
      `changed:  ${nChanged}  unchanged: ${nUnchanged}  new: ${nNew}  (vs ${prevDirs[0] ?? "none"})`,
      "",
      ...summary,
      "",
    ]
      .filter((l) => l !== null)
      .join("\n"),
  );

  // Manifest hash of the manifest itself (self-check anchor).
  const manifestBytes = fs.readFileSync(path.join(snapDir, "MANIFEST.sha256"));
  const manifestSha = sha256(manifestBytes);

  if (tag) {
    if (!/^[A-Za-z0-9._-]+$/.test(tag)) {
      console.error(`REFUSE: invalid tag "${tag}" (allowed: A-Za-z0-9._-)`);
      process.exit(1);
    }
    fs.writeFileSync(path.join(SNAP_ROOT, `${ts}.${tag}`), `${ts}\n`);
    console.log(`TAGGED: ${tag} -> .snapshots/${ts}.TAG`);
  }

  console.log(`SNAPSHOT OK: .snapshots/${ts}/`);
  console.log(`  files:        ${targets.length}`);
  console.log(`  total:        ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.log(
    `  vs previous:  ${nChanged} changed, ${nUnchanged} unchanged, ${nNew} new (${prevDirs[0] ?? "no previous snapshot"})`,
  );
  console.log(`  manifest:     sha256 ${manifestSha}`);

  // Retention: keep newest KEEP dirs, prune older.
  const dirs = newestSnapshotDirs();
  for (const old of dirs.slice(KEEP)) {
    fs.rmSync(path.join(SNAP_ROOT, old), { recursive: true, force: true });
    console.log(`PRUNED: .snapshots/${old}/ (retention limit ${KEEP})`);
  }
}

function cmdVerify() {
  const dirs = newestSnapshotDirs();
  if (dirs.length === 0) {
    console.error("VERIFY FAIL: no snapshots found in .snapshots/");
    process.exit(1);
  }
  const snapDir = path.join(SNAP_ROOT, dirs[0]);
  const manifest = readManifest(snapDir);
  if (manifest.size === 0) {
    console.error(`VERIFY FAIL: .snapshots/${dirs[0]}/MANIFEST.sha256 missing or empty`);
    process.exit(1);
  }
  let ok = 0;
  const bad = [];
  for (const [rel, expected] of manifest) {
    const abs = path.join(snapDir, ...rel.split("/"));
    if (!fs.existsSync(abs)) {
      bad.push(`MISSING  ${rel}`);
      continue;
    }
    const actual = sha256(fs.readFileSync(abs));
    if (actual !== expected) bad.push(`HASH-MISMATCH  ${rel} (expected ${expected}, got ${actual})`);
    else ok++;
  }
  if (bad.length > 0) {
    console.error(`VERIFY FAIL: .snapshots/${dirs[0]}/ — ${ok}/${manifest.size} files OK:`);
    for (const b of bad) console.error(`  ${b}`);
    process.exit(1);
  }
  console.log(`VERIFY OK: .snapshots/${dirs[0]}/ — ${ok}/${manifest.size} files match MANIFEST.sha256`);
}

// ---- main ----
const argv = process.argv.slice(2);
if (argv.includes("--verify")) cmdVerify();
else {
  const tagIdx = argv.indexOf("--tag");
  const tag = tagIdx >= 0 ? argv[tagIdx + 1] : undefined;
  if (tagIdx >= 0 && !tag) {
    console.error("Usage: snapshot-decomp.mjs --tag <name>");
    process.exit(1);
  }
  cmdSnapshot(tag);
}
