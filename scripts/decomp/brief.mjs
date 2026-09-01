#!/usr/bin/env node
// One-call unit orientation: `node scripts/decomp/brief.mjs <VA|boundary-idx>`
// Emits the compact brief a work unit needs to START — target status from the
// slice JSON, function bounds + call-shape from the PE index, and the exact
// next commands — so an agent spends one tool call, not ten, orienting.
// Options: --json.

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const argv = process.argv.slice(2).filter((a) => a !== "--json");
const wantJson = process.argv.includes("--json");
if (argv.length !== 1) {
  console.error("usage: node scripts/decomp/brief.mjs <0xVA | boundary-idx> [--json]");
  process.exit(2);
}

const out = { target: argv[0], warnings: [] };

// -- resolve target against the slice JSON --------------------------------
const slice = JSON.parse(
  readFileSync(join(ROOT, "decomp", "game-update-slice.json"), "utf8"),
);
out.abiVersion = slice.abiVersion;
const asIdx = /^\d{1,2}$/.test(argv[0]) ? Number(argv[0]) : null;
const asVa = /^0x[0-9a-fA-F]+$/.test(argv[0]) ? parseInt(argv[0], 16) : null;
const norm = (va) => (typeof va === "string" ? parseInt(va, 16) : va);
const open = slice.opaqueBoundaries ?? [];
const resolved = slice.resolvedBoundaries ?? [];
let rec = null;
if (asIdx != null) rec = open.find((b) => b.idx === asIdx) ?? null;
if (!rec && asVa != null) {
  rec = open.find((b) => norm(b.targetVa) === asVa) ?? null;
}
if (rec) {
  out.boundary = {
    idx: rec.idx,
    va: rec.targetVa,
    name: rec.name,
    operation: rec.operation,
    // Only the LATEST evidence generation — the full history is in the JSON.
    latestEvidence: Object.keys(rec)
      .filter((k) => /^abiV\d+$/.test(k))
      .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)))
      .slice(-1)
      .map((k) => `${k}: ${String(rec[k]).slice(0, 400)}`)[0] ?? null,
    // Standing verdicts (stays-host / narrow-only / declined) — read these
    // BEFORE planning a unit; they exist to stop re-derivation.
    assessments: Object.keys(rec)
      .filter((k) => /^assessment/.test(k))
      .map((k) => `${k}: ${String(rec[k]).slice(0, 500)}`),
    status: "OPEN",
  };
} else if (asIdx != null || asVa != null) {
  const done = resolved.find(
    (b) => b.idx === asIdx || (asVa != null && norm(b.targetVa ?? b.va) === asVa),
  );
  if (done) {
    out.boundary = { status: "RESOLVED — pick another target", idx: done.idx ?? null };
    out.warnings.push("target is already resolved; run status.mjs for the open list");
  } else if (asIdx != null) {
    out.warnings.push(`no boundary with idx ${asIdx}; treating input as invalid`);
  }
}

// -- PE index facts -------------------------------------------------------
const va = asVa ?? (rec ? norm(rec.targetVa) : null);
if (va != null && Number.isFinite(va)) {
  const idxBase = join(ROOT, "output", "decomp");
  let dbPath = null;
  if (existsSync(idxBase)) {
    for (const d of readdirSync(idxBase)) {
      const p = join(idxBase, d, "index", "pe-index.sqlite");
      if (existsSync(p)) dbPath = p;
    }
  }
  if (!dbPath) {
    out.warnings.push("PE index missing — npm run decomp:index");
  } else {
    const db = new DatabaseSync(dbPath, { readOnly: true });
    const f = db
      .prepare("SELECT start,end,ninsn FROM func WHERE start<=? AND end>?")
      .get(va, va);
    if (f) {
      out.func = {
        start: `0x${Number(f.start).toString(16).padStart(8, "0")}`,
        end: `0x${Number(f.end).toString(16).padStart(8, "0")}`,
        insns: Number(f.ninsn),
      };
      const callers = db
        .prepare("SELECT COUNT(*) n FROM xref WHERE dst=? AND kind='call'")
        .get(f.start);
      const callees = db
        .prepare(
          "SELECT COUNT(*) n, COUNT(DISTINCT dst) d FROM xref WHERE src>=? AND src<? AND kind IN ('call','call_mem','call_slot','call_reg')",
        )
        .get(f.start, f.end);
      out.func.directCallers = Number(callers.n);
      out.func.callSites = Number(callees.n);
      out.func.distinctCallees = Number(callees.d);
      const escapes = db
        .prepare("SELECT COUNT(*) n FROM xref WHERE dst=? AND kind IN ('addr','jtab','call_slot')")
        .get(f.start);
      out.func.indirectEvidence = Number(escapes.n);
    } else {
      out.warnings.push("VA not inside any indexed function (data? mid-body label?)");
    }
    db.close();
  }
}

// -- next commands --------------------------------------------------------
out.next = [
  va != null
    ? `python scripts/decomp/tools/pequery.py batch "body 0x${va.toString(16)} ;; callers 0x${va.toString(16)}"`
    : "node scripts/decomp/status.mjs   # pick an OPEN boundary first",
  va != null ? `node scripts/decomp/identify-zhl-address.mjs 0x${va.toString(16)}` : null,
  "docs/unit-runbook.md — the order of operations",
  "node scripts/decomp/verify-unit.mjs — the completion gate",
].filter(Boolean);

if (wantJson) {
  console.log(JSON.stringify(out, null, 1));
} else {
  console.log(`== unit brief: ${out.target} (Update slice ABI ${out.abiVersion}) ==`);
  if (out.boundary) {
    const b = out.boundary;
    console.log(`boundary: ${b.status}${b.idx != null ? `  idx ${b.idx}` : ""}${b.va ? `  ${b.va}` : ""}${b.name ? `  ${b.name}` : ""}`);
    if (b.operation) console.log(`  op: ${b.operation}`);
    for (const a of b.assessments ?? []) console.log(`  ! ${a}`);
    if (b.latestEvidence) console.log(`  ${b.latestEvidence}`);
  }
  if (out.func) {
    const f = out.func;
    console.log(`func: ${f.start}..${f.end}  insns ${f.insns}  directCallers ${f.directCallers}  callSites ${f.callSites} (${f.distinctCallees} distinct)  indirectEvidence ${f.indirectEvidence}`);
  }
  for (const w of out.warnings) console.log(`! ${w}`);
  console.log("next:");
  for (const n of out.next) console.log(`  ${n}`);
}
