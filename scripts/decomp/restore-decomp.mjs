#!/usr/bin/env node
// restore-decomp.mjs — inspect and surgically restore from .snapshots/ taken by
// snapshot-decomp.mjs. Zero dependencies. Windows-safe.
//
// Usage:
//   node scripts/decomp/restore-decomp.mjs list
//   node scripts/decomp/restore-decomp.mjs diff <snap>
//   node scripts/decomp/restore-decomp.mjs restore-file <snap> <relpath> [--force]
//   node scripts/decomp/restore-decomp.mjs restore-family <snap> <family-substring> [--force]
//
// Safety rules (born from the 2026-08-21 lua_engine_pure_helpers.cpp incident):
//   - snapshot copy hash is verified against MANIFEST.sha256 BEFORE any copy
//   - --force required when the current file differs from BOTH the snapshot copy
//     and the manifest (paranoid mode: never silently overwrite unknown content)
//   - every restore prints exactly what will change before it does it

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const SNAP_ROOT = path.join(ROOT, ".snapshots");

const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

function fail(msg) {
  console.error(`REFUSE: ${msg}`);
  process.exit(1);
}

function readManifest(snapName) {
  const snapDir = path.join(SNAP_ROOT, snapName);
  const mf = path.join(snapDir, "MANIFEST.sha256");
  if (!fs.existsSync(mf)) fail(`no MANIFEST.sha256 in .snapshots/${snapName}/ — not a snapshot dir`);
  const map = new Map();
  for (const line of fs.readFileSync(mf, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([0-9a-f]{64})\s{2}(.+)$/);
    if (m) map.set(m[2], m[1]);
  }
  return { snapDir, map };
}

function snapshotNames() {
  if (!fs.existsSync(SNAP_ROOT)) return [];
  return fs
    .readdirSync(SNAP_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{4}-\d{2}-\d{2}T/.test(e.name))
    .map((e) => e.name)
    .sort()
    .reverse();
}

function currentTreeFiles() {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.isFile()) out.push(p);
    }
  };
  for (const top of ["native/decomp", "scripts/decomp", "tests", "decomp", "web/js"]) {
    const abs = path.join(ROOT, top);
    if (fs.existsSync(abs)) walk(abs);
  }
  return out.map((p) => path.relative(ROOT, p).split(path.sep).join("/"));
}

function cmdList() {
  const names = snapshotNames();
  if (names.length === 0) {
    console.log("No snapshots found. Run: npm run snapshot");
    return;
  }
  for (const name of names) {
    const { map } = readManifest(name);
    let counts = "";
    const sumPath = path.join(SNAP_ROOT, name, "SUMMARY.txt");
    if (fs.existsSync(sumPath)) {
      const txt = fs.readFileSync(sumPath, "utf8");
      const m = txt.match(/changed:\s+(\d+)\s+unchanged:\s+(\d+)\s+new:\s+(\d+)/);
      const tagLine = fs
        .readdirSync(SNAP_ROOT)
        .find((f) => f.startsWith(`${name}.`) && !f.endsWith(".sha256"));
      const tag = tagLine ? ` [tag: ${tagLine.slice(name.length + 1)}]` : "";
      counts = m
        ? ` — ${m[1]} changed / ${m[2]} unchanged / ${m[3]} new${tag}`
        : tag;
    }
    console.log(`${name}  (${map.size} files)${counts}`);
  }
}

function cmdDiff(snapName) {
  const { snapDir, map } = readManifest(snapName);
  if (!fs.existsSync(snapDir)) fail(`snapshot .snapshots/${snapName}/ does not exist`);
  const currentSet = new Set(currentTreeFiles());
  let nChanged = 0,
    nMissing = 0,
    nExtra = 0;
  for (const [rel, snapHash] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const abs = path.join(ROOT, ...rel.split("/"));
    if (!fs.existsSync(abs)) {
      console.log(`MISSING  ${rel}  (snapshot has ${snapHash})`);
      nMissing++;
      continue;
    }
    const curHash = sha256(fs.readFileSync(abs));
    if (curHash !== snapHash) {
      console.log(`CHANGED  ${rel}\n         snap ${snapHash}\n         cur  ${curHash}`);
      nChanged++;
    }
  }
  const snapSet = new Set(map.keys());
  for (const rel of currentSet) {
    // only within snapshot scope dirs to keep EXTRA meaningful
    const scoped =
      rel.startsWith("native/decomp/") ||
      rel.startsWith("scripts/decomp/") ||
      /^tests\/(decomp-.*\.test\.js|signatures\.test\.js)$/.test(rel) ||
      /^decomp\/[^/]+\.json$/.test(rel) ||
      rel === "web/js/native-update-bridge.js";
    if (!scoped || snapSet.has(rel) || rel.includes("__pycache__") || /\.pyc$/i.test(rel)) continue;
    console.log(`EXTRA    ${rel}  (cur ${sha256(fs.readFileSync(path.join(ROOT, ...rel.split("/"))))}, not in snapshot)`);
    nExtra++;
  }
  console.log(
    `\nDIFF vs .snapshots/${snapName}/: ${nChanged} changed, ${nMissing} missing, ${nExtra} extra (${map.size} files in snapshot)`,
  );
  if (nChanged + nMissing > 0)
    console.log(
      `Next: node scripts/decomp/restore-decomp.mjs restore-file ${snapName} <relpath> [--force]`,
    );
}

// Verify snapshot copy integrity; returns absolute path of verified copy.
function verifiedCopy(snapDir, rel, expectedHash) {
  const srcAbs = path.join(snapDir, ...rel.split("/"));
  if (!fs.existsSync(srcAbs)) fail(`snapshot copy missing: .snapshots/${path.basename(snapDir)}/${rel}`);
  const actual = sha256(fs.readFileSync(srcAbs));
  if (actual !== expectedHash)
    fail(
      `snapshot copy corrupted: ${rel}\n  manifest ${expectedHash}\n  actual   ${actual}\nRefusing to restore from a bad source.`,
    );
  return srcAbs;
}

function planAndApply(snapName, rels, force) {
  const { snapDir, map } = readManifest(snapName);
  const plan = [];
  for (const rel of rels) {
    const expectedHash = map.get(rel);
    if (!expectedHash) fail(`${rel} is not in the manifest of .snapshots/${snapName}/`);
    verifiedCopy(snapDir, rel, expectedHash); // throws on corrupt source

    const destAbs = path.join(ROOT, ...rel.split("/"));
    const exists = fs.existsSync(destAbs);
    const curHash = exists ? sha256(fs.readFileSync(destAbs)) : null;

    // Paranoid rule: the current file differs from the snapshot state
    // (snapshot copy == manifest, verified above) -> require --force.
    const needsForce = exists && curHash !== expectedHash;

    plan.push({ rel, destAbs, curHash, expectedHash, exists, needsForce });
  }

  const forcedNeeded = plan.filter((p) => p.needsForce && !force);
  if (forcedNeeded.length > 0) {
    console.error(`REFUSE: paranoid mode — these files differ from BOTH snapshot and manifest; re-run with --force to overwrite:`);
    for (const p of forcedNeeded) console.error(`  ${p.rel}  (current ${p.curHash})`);
    process.exit(1);
  }

  console.log(`Plan against .snapshots/${snapName}/${force ? " (--force)" : ""}:`);
  for (const p of plan) {
    const oldH = p.exists ? p.curHash : "<absent>";
    const note = p.curHash === p.expectedHash ? "  (already identical — no write)" : "";
    console.log(`  ${p.rel}\n    old ${oldH}\n    new ${p.expectedHash}${note}`);
  }

  let written = 0;
  for (const p of plan) {
    if (p.exists && p.curHash === p.expectedHash) continue;
    fs.mkdirSync(path.dirname(p.destAbs), { recursive: true });
    fs.copyFileSync(path.join(snapDir, ...p.rel.split("/")), p.destAbs);
    written++;
    console.log(`RESTORED: ${p.rel}`);
  }
  console.log(`DONE: ${written} file(s) restored, ${plan.length - written} already identical.`);
}

function selectFamilyRels(map, familySubstr) {
  const rels = [...map.keys()].filter((r) => r.includes(familySubstr));
  if (rels.length === 0)
    fail(
      `no manifest paths contain "${familySubstr}". Try: list output or a shorter substring (e.g. lua_engine, anm2, frame_path).`,
    );
  return rels;
}

// ---- main ----
const [cmd, a, b, ...rest] = process.argv.slice(2);
const force = rest.includes("--force") || process.argv.includes("--force");

switch (cmd) {
  case "list":
    cmdList();
    break;
  case "diff":
    if (!a) fail("usage: restore-decomp.mjs diff <snap>");
    cmdDiff(a);
    break;
  case "restore-file": {
    if (!a || !b) fail("usage: restore-decomp.mjs restore-file <snap> <relpath> [--force]");
    planAndApply(a, [b], force);
    break;
  }
  case "restore-family": {
    if (!a || !b) fail("usage: restore-decomp.mjs restore-family <snap> <family-substring> [--force]");
    const { map } = readManifest(a);
    planAndApply(a, selectFamilyRels(map, b), force);
    break;
  }
  default:
    console.log(
      [
        "Usage:",
        "  node scripts/decomp/restore-decomp.mjs list",
        "  node scripts/decomp/restore-decomp.mjs diff <snap>",
        "  node scripts/decomp/restore-decomp.mjs restore-file <snap> <relpath> [--force]",
        "  node scripts/decomp/restore-decomp.mjs restore-family <snap> <family-substring> [--force]",
      ].join("\n"),
    );
    process.exit(cmd ? 1 : 0);
}
