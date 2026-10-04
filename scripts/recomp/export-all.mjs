#!/usr/bin/env node
// Bulk export driver: analyze the Isaac PE once with Ghidra headless, then export a
// complete function inventory, decompiled C, and P-Code for every recovered function.
//
// Every stage is resumable. Nothing here estimates: all numbers written to
// output/recomp/export/summary.json come from files produced by the stages below.
//
//   node scripts/recomp/export-all.mjs --stage all
//   node scripts/recomp/export-all.mjs --stage analyze
//   node scripts/recomp/export-all.mjs --stage inventory
//   node scripts/recomp/export-all.mjs --stage decompile --threads 8
//   node scripts/recomp/export-all.mjs --stage merge,report

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { createInterface } from "node:readline";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  executableRanges,
  findSignatureMatches,
  parsePe,
  parseSignature,
  rawOffsetToRva,
  readZhlSignatures,
} from "../decomp/pe-signatures.mjs";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, "..", "..");

const STAGES = ["analyze", "recover", "inventory", "decompile", "merge", "report"];

function parseArgs(argv) {
  const o = {
    stages: null,
    input: null,
    ghidraHome: null,
    projectDir: join(repoRoot, "output", "recomp", "ghidra_project"),
    projectName: "IsaacRecomp",
    out: join(repoRoot, "output", "recomp", "export"),
    threads: 8,
    timeout: 180,
    heap: "10G",
    analyzeHeap: "10G",
    recoverHeap: "5G",
    recoverRounds: 20,
    recoverBatches: 8,
    gapMinRun: 16,
    maxFunctions: 0, // 0 = all
    force: false,
    emitC: true,
    emitPcode: true,
    emitRawPcode: true,
    noSkipList: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[++i];
      if (v === undefined) throw new Error(`${a} requires a value`);
      return v;
    };
    switch (a) {
      case "--stage": o.stages = next().split(",").map((s) => s.trim()).filter(Boolean); break;
      case "--input": o.input = next(); break;
      case "--ghidra-home": o.ghidraHome = next(); break;
      case "--project-dir": o.projectDir = resolve(next()); break;
      case "--project-name": o.projectName = next(); break;
      case "--out": o.out = resolve(next()); break;
      case "--threads": o.threads = Number.parseInt(next(), 10); break;
      case "--timeout": o.timeout = Number.parseInt(next(), 10); break;
      case "--heap": o.heap = next(); break;
      case "--analyze-heap": o.analyzeHeap = next(); break;
      case "--recover-heap": o.recoverHeap = next(); break;
      case "--recover-rounds": o.recoverRounds = Number.parseInt(next(), 10); break;
      case "--recover-batches": o.recoverBatches = Number.parseInt(next(), 10); break;
      case "--gap-min-run": o.gapMinRun = Number.parseInt(next(), 10); break;
      case "--max-functions": o.maxFunctions = Number.parseInt(next(), 10); break;
      case "--force": o.force = true; break;
      case "--no-c": o.emitC = false; break;
      case "--no-pcode": o.emitPcode = false; break;
      case "--no-raw-pcode": o.emitRawPcode = false; break;
      case "--no-skip-list": o.noSkipList = true; break;
      default: throw new Error(`Unknown argument: ${a}`);
    }
  }
  if (!o.stages) o.stages = ["all"];
  if (o.stages.length === 1 && o.stages[0] === "all") o.stages = STAGES.slice();
  for (const s of o.stages) if (!STAGES.includes(s)) throw new Error(`Unknown stage: ${s}`);
  if (!Number.isInteger(o.threads) || o.threads < 1 || o.threads > 64) throw new Error("--threads 1..64");
  if (!Number.isInteger(o.timeout) || o.timeout < 5) throw new Error("--timeout >= 5");
  return o;
}

function firstExisting(candidates, label) {
  const hit = candidates.filter(Boolean).find((c) => existsSync(c));
  if (!hit) throw new Error(`${label} not found. Checked:\n  ${candidates.filter(Boolean).join("\n  ")}`);
  return resolve(hit);
}

function defaultInput(explicit) {
  if (explicit) return firstExisting([resolve(explicit)], "Input PE");
  return firstExisting([
    join(repoRoot, "tools", "isaac-ng.unpacked.exe"),
    process.env.ISAAC_EXE,
  ], "Input PE");
}

function defaultGhidraHome(explicit) {
  if (explicit) return firstExisting([resolve(explicit)], "Ghidra home");
  return firstExisting([
    process.env.GHIDRA_HOME,
    join(homedir(), "Tools", "ghidra_12.1.2_PUBLIC"),
    join(homedir(), "Tools", "ghidra"),
  ], "Ghidra home");
}

function cmdQuote(v) {
  if (/[\r\n"]/.test(v)) throw new Error(`Unsupported character in command argument: ${v}`);
  return `"${v}"`;
}

function runHeadless(ctx, args, { heap, logName }) {
  const headless = join(ctx.ghidraHome, "support", process.platform === "win32" ? "analyzeHeadless.bat" : "analyzeHeadless");
  if (!existsSync(headless)) throw new Error(`Ghidra headless launcher is missing: ${headless}`);
  const env = {
    ...process.env,
    GHIDRA_HEADLESS_MAXMEM: heap,
    GHIDRA_HEADLESS_JAVA_OPTIONS: "-XX:ParallelGCThreads=6 -XX:CICompilerCount=4",
  };
  const logPath = join(ctx.logDir, logName);
  const fd = openSync(logPath, "a");
  const started = Date.now();
  const printable = [headless, ...args].map(cmdQuote).join(" ");
  console.log(`[headless] heap=${heap} log=${logPath}`);
  console.log(`[headless] ${printable}`);
  let result;
  try {
    result = spawnSync(
      process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : headless,
      process.platform === "win32" ? ["/d", "/s", "/c", `"${printable}"`] : args,
      {
        cwd: repoRoot,
        env,
        stdio: ["ignore", fd, fd],
        windowsVerbatimArguments: process.platform === "win32",
        maxBuffer: 1 << 30,
      },
    );
  } finally {
    closeSync(fd);
  }
  const wallMs = Date.now() - started;
  if (result.error) throw result.error;
  console.log(`[headless] exit=${result.status} wall=${(wallMs / 1000).toFixed(1)}s`);
  return { status: result.status, wallMs, logPath, command: printable };
}

function tailFile(path, lines = 40) {
  if (!existsSync(path)) return "";
  const text = readFileSync(path, "utf8");
  return text.split(/\r?\n/).slice(-lines).join("\n");
}

// ---------------------------------------------------------------- stage: analyze

function stageAnalyze(ctx) {
  const marker = join(ctx.out, "analyze-done.json");
  if (existsSync(marker) && !ctx.opts.force) {
    const prev = JSON.parse(readFileSync(marker, "utf8"));
    console.log(`[analyze] already done in ${(prev.wallMs / 1000).toFixed(1)}s on ${prev.finishedAt}; use --force to redo`);
    return prev;
  }
  mkdirSync(ctx.opts.projectDir, { recursive: true });
  const gpr = join(ctx.opts.projectDir, `${ctx.opts.projectName}.gpr`);
  const imported = existsSync(gpr) && statSync(gpr).size > 0;
  const args = [
    ctx.opts.projectDir,
    ctx.opts.projectName,
    ...(imported ? ["-process", ctx.programName] : ["-import", ctx.input]),
    "-log", join(ctx.logDir, "ghidra-analyze.log"),
    "-scriptPath", ctx.scriptPath,
    // No -analysisTimeoutPerFile: the default is "run to completion".
    // Analyzer tuning: FID stays on (it is how we identify CRT/STL library code).
    // "Decompiler Parameter ID" stays off (Ghidra default): the per-function decompile
    // in the export stage recovers the same prototypes and committing them here costs hours.
  ];
  const started = new Date();
  const run = runHeadless(ctx, args, { heap: ctx.opts.analyzeHeap, logName: "analyze.stdout.log" });
  const record = {
    startedAt: started.toISOString(),
    finishedAt: new Date().toISOString(),
    wallMs: run.wallMs,
    exitStatus: run.status,
    command: run.command,
    heap: ctx.opts.analyzeHeap,
    input: ctx.input,
    inputSha256: ctx.inputSha256,
  };
  if (run.status !== 0) {
    writeFileSync(join(ctx.out, "analyze-failed.json"), `${JSON.stringify(record, null, 2)}\n`);
    throw new Error(`Ghidra analysis exited ${run.status}. Tail of ${run.logPath}:\n${tailFile(run.logPath)}`);
  }
  writeFileSync(marker, `${JSON.stringify(record, null, 2)}\n`);
  return record;
}

// ---------------------------------------------------------------- stage: recover

// Ghidra's auto-analysis leaves runs of disassembled .text instructions inside no
// function (code only reachable through jump tables and indirect calls it could not
// resolve). Nothing downstream can export code that is not in a function, so create one
// at the head of every such run and iterate until it converges. This WRITES to the
// Ghidra database, so it must run before the inventory.
function stageRecover(ctx) {
  const marker = join(ctx.out, "recover-done.json");
  if (existsSync(marker) && !ctx.opts.force) {
    const prev = JSON.parse(readFileSync(marker, "utf8"));
    console.log(`[recover] already done: ${prev.created} functions in ${(prev.wallMs / 1000).toFixed(1)}s; use --force to redo`);
    return prev;
  }
  const partDir = join(ctx.out, "recover-parts");
  mkdirSync(partDir, { recursive: true });
  let created = 0;
  let wallMs = 0;
  let batch = 0;

  const runScript = (script, outPath, rounds, logName, label) => {
    const args = [
      ctx.opts.projectDir,
      ctx.opts.projectName,
      "-process", ctx.programName,
      "-noanalysis",
      "-log", join(ctx.logDir, "ghidra-recover.log"),
      "-scriptPath", ctx.scriptPath,
      "-postScript", script, outPath, ...rounds,
    ];
    const run = runHeadless(ctx, args, { heap: ctx.opts.recoverHeap, logName });
    wallMs += run.wallMs;
    if (run.status !== 0) {
      throw new Error(`${label} exited ${run.status}. Tail of ${run.logPath}:\n${tailFile(run.logPath)}`);
    }
    return existsSync(outPath) ? Math.max(0, countLines(outPath) - 1) : 0;
  };

  const recoverLoop = () => {
    for (;;) {
      batch += 1;
      const part = join(partDir, `part-${String(batch).padStart(2, "0")}.tsv`);
      const made = runScript("RecoverMissingFunctions.java", part, [String(ctx.opts.recoverRounds)],
        "recover.stdout.log", "Function recovery");
      created += made;
      console.log(`[recover] batch ${batch}: +${made} functions (total ${created})`);
      if (made <= 10 || batch >= ctx.opts.recoverBatches) break;
    }
  };

  // Phase A: attach functions to code Ghidra disassembled but never attributed.
  recoverLoop();
  // Phase B: some .text was never disassembled at all, so there is nothing to attach a
  // function to. Disassemble those gaps first, then run the recovery loop again.
  for (let gapBatch = 1; gapBatch <= ctx.opts.recoverBatches; gapBatch += 1) {
    const gapOut = join(partDir, `gaps-${String(gapBatch).padStart(2, "0")}.tsv`);
    const heads = runScript("DisassembleGaps.java", gapOut,
      [String(ctx.opts.gapMinRun), String(ctx.opts.recoverRounds)],
      "gaps.stdout.log", "Gap disassembly");
    console.log(`[recover] gap batch ${gapBatch}: disassembled ${heads} gap heads`);
    if (heads <= 20) break;
  }
  recoverLoop();

  // One TSV, header from the first part. Only the RecoverMissingFunctions parts describe
  // created functions; the gaps-*.tsv files are disassembly receipts, not functions.
  const parts = readdirSync(partDir).filter((f) => f.startsWith("part-") && f.endsWith(".tsv")).sort();
  const lines = [];
  let header = "round\tva\trunBytes\tbodyBytes\tfirstInsn\tlooksLikePrologue";
  for (const p of parts) {
    const text = readFileSync(join(partDir, p), "utf8").split(/\r?\n/);
    if (text.length) header = text[0] || header;
    for (const l of text.slice(1)) if (l.trim()) lines.push(l);
  }
  writeFileSync(join(ctx.out, "recovered-functions.tsv"), `${[header, ...lines].join("\n")}\n`);
  const record = { finishedAt: new Date().toISOString(), wallMs, batches: batch, created: lines.length };
  writeFileSync(marker, `${JSON.stringify(record, null, 2)}\n`);
  console.log(`[recover] ${lines.length} functions created in ${(wallMs / 1000).toFixed(1)}s across ${batch} batch(es)`);
  return record;
}

// -------------------------------------------------------------- stage: inventory

function stageInventory(ctx) {
  const rawPath = join(ctx.out, "functions.raw.jsonl");
  const statsPath = join(ctx.out, "ghidra-stats.json");
  const args = [
    ctx.opts.projectDir,
    ctx.opts.projectName,
    "-process", ctx.programName,
    "-noanalysis",
    "-readOnly",
    "-log", join(ctx.logDir, "ghidra-inventory.log"),
    "-scriptPath", ctx.scriptPath,
    "-postScript", "ExportInventory.java", rawPath, statsPath, String(ctx.opts.maxFunctions),
  ];
  const run = runHeadless(ctx, args, { heap: ctx.opts.heap, logName: "inventory.stdout.log" });
  if (run.status !== 0 || !existsSync(rawPath)) {
    throw new Error(`Inventory export failed (exit ${run.status}). Tail of ${run.logPath}:\n${tailFile(run.logPath)}`);
  }
  const stats = JSON.parse(readFileSync(statsPath, "utf8"));
  console.log(`[inventory] functions=${stats.functionCount} wall=${(run.wallMs / 1000).toFixed(1)}s`);
  return { wallMs: run.wallMs, stats };
}

// -------------------------------------------------------------- stage: decompile

function countLines(path) {
  if (!existsSync(path)) return 0;
  const text = readFileSync(path, "utf8");
  let n = 0;
  for (let i = 0; i < text.length; i += 1) if (text.charCodeAt(i) === 10) n += 1;
  return n;
}

function statusFiles(ctx) {
  const dir = join(ctx.out, "status");
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.startsWith("decomp-") && f.endsWith(".jsonl")).map((f) => join(dir, f));
}

// The coverage-recovery pass creates a function at the head of every orphan instruction
// run. Only ~3% of those runs start with a real prologue; the rest are mid-function
// fragments. Invoking the decompiler on a fragment costs ~27s (vs 0.2s for a normal
// function) and just re-derives the high P-Code of the whole enclosing region, which its
// neighbours already produced. Their raw P-Code - the thing a mechanical lifter actually
// consumes - is exact either way, so they get raw P-Code only.
function buildRawOnlyList(ctx) {
  const src = join(ctx.out, "recovered-functions.tsv");
  const dst = join(ctx.out, "raw-pcode-only.txt");
  if (!existsSync(src) || ctx.opts.noSkipList) {
    writeFileSync(dst, "");
    return { path: dst, count: 0 };
  }
  const vas = [];
  for (const line of readFileSync(src, "utf8").split(/\r?\n/).slice(1)) {
    const f = line.split("\t");
    if (f.length >= 6 && f[1] && f[5].trim() === "false") vas.push(f[1]);
  }
  const unique = [...new Set(vas)].sort();
  writeFileSync(dst, `${unique.join("\n")}\n`);
  console.log(`[decompile] raw-P-Code-only policy applies to ${unique.length} recovered mid-function fragments -> ${dst}`);
  return { path: dst, count: unique.length };
}

function stageDecompile(ctx) {
  const statusDir = join(ctx.out, "status");
  mkdirSync(statusDir, { recursive: true });
  const rawPath = join(ctx.out, "functions.raw.jsonl");
  if (!existsSync(rawPath)) throw new Error(`Run the inventory stage first: ${rawPath} is missing`);
  const rawOnly = buildRawOnlyList(ctx);

  let totalWall = 0;
  let pass = 0;
  let lastDone = -1;
  for (;;) {
    pass += 1;
    const before = statusFiles(ctx).reduce((n, f) => n + countLines(f), 0);
    if (before === lastDone && pass > 1) {
      console.log(`[decompile] no progress in pass ${pass - 1}; stopping with ${before} status records`);
      break;
    }
    lastDone = before;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const args = [
      ctx.opts.projectDir,
      ctx.opts.projectName,
      "-process", ctx.programName,
      "-noanalysis",
      "-readOnly",
      "-log", join(ctx.logDir, "ghidra-decompile.log"),
      "-scriptPath", ctx.scriptPath,
      "-postScript", "ExportDecompiled.java",
      ctx.out,
      String(ctx.opts.threads),
      String(ctx.opts.timeout),
      String(ctx.opts.maxFunctions),
      ctx.opts.emitC ? "1" : "0",
      ctx.opts.emitPcode ? "1" : "0",
      ctx.opts.emitRawPcode ? "1" : "0",
      stamp,
      rawOnly.count ? rawOnly.path : "-",
    ];
    const run = runHeadless(ctx, args, { heap: ctx.opts.heap, logName: "decompile.stdout.log" });
    totalWall += run.wallMs;
    const after = statusFiles(ctx).reduce((n, f) => n + countLines(f), 0);
    console.log(`[decompile] pass ${pass}: exit=${run.status} status records ${before} -> ${after}`);
    const doneMarker = join(ctx.out, "decompile-complete.marker");
    if (run.status === 0 && existsSync(doneMarker)) {
      console.log(`[decompile] complete after ${pass} pass(es)`);
      break;
    }
    if (pass >= 25) {
      console.log("[decompile] giving up after 25 passes");
      break;
    }
  }
  return { wallMs: totalWall, passes: pass };
}

// ------------------------------------------------------------------ stage: merge

export function extractZhlSymbol(declaration) {
  // e.g. "__thiscall LayerState* ANM2::GetLayer(int layer);"
  const open = declaration.indexOf("(");
  if (open < 0) return null;
  const head = declaration.slice(0, open);
  const m = head.match(/([A-Za-z_~][A-Za-z0-9_]*(?:\s*::\s*[A-Za-z_~][A-Za-z0-9_]*)*)\s*$/);
  if (!m) return null;
  return m[1].replace(/\s+/g, "");
}

function zhlFiles(root) {
  return readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".zhl"))
    .map((e) => join(e.parentPath ?? e.path, e.name))
    .sort();
}

export function buildZhlMap(inputPath) {
  const catalogRoot = join(repoRoot, "third_party", "REPENTOGON", "libzhl", "functions");
  const result = { byVa: new Map(), stats: { catalogs: 0, entries: 0, unique: 0, ambiguous: 0, missing: 0, mapped: 0 } };
  if (!existsSync(catalogRoot)) {
    console.log(`[merge] ZHL catalog missing (${catalogRoot}); skipping symbol recovery`);
    return result;
  }
  const buffer = readFileSync(inputPath);
  const pe = parsePe(buffer);
  const ranges = executableRanges(pe, buffer.length);
  const files = zhlFiles(catalogRoot);
  result.stats.catalogs = files.length;
  for (const file of files) {
    const rel = file.slice(repoRoot.length + 1).replaceAll("\\", "/");
    for (const entry of readZhlSignatures(file)) {
      result.stats.entries += 1;
      let sig;
      try { sig = parseSignature(entry.pattern); } catch { continue; }
      const matches = findSignatureMatches(buffer, sig, ranges);
      if (matches.length === 0) { result.stats.missing += 1; continue; }
      if (matches.length > 1) { result.stats.ambiguous += 1; continue; }
      result.stats.unique += 1;
      const rva = rawOffsetToRva(pe, matches[0]);
      if (rva === null) continue;
      const va = pe.imageBase + rva;
      const symbol = extractZhlSymbol(entry.declaration);
      const key = `0x${va.toString(16).padStart(8, "0")}`;
      if (!result.byVa.has(key)) {
        result.byVa.set(key, { symbol, declaration: entry.declaration, catalog: rel, patternBytes: sig.length });
        result.stats.mapped += 1;
      }
    }
  }
  return result;
}

async function readJsonl(path, onRecord) {
  if (!existsSync(path)) return 0;
  const rl = createInterface({ input: createReadStream(path, { encoding: "utf8" }), crlfDelay: Infinity });
  let n = 0;
  for await (const line of rl) {
    const t = line.trim();
    if (!t) continue;
    let rec;
    try { rec = JSON.parse(t); } catch { continue; }
    onRecord(rec);
    n += 1;
  }
  return n;
}

async function stageMerge(ctx) {
  const rawPath = join(ctx.out, "functions.raw.jsonl");
  if (!existsSync(rawPath)) throw new Error(`Missing ${rawPath}; run --stage inventory`);

  const status = new Map();
  let statusLines = 0;
  for (const f of statusFiles(ctx)) {
    statusLines += await readJsonl(f, (rec) => { if (rec.va) status.set(rec.va, rec); });
  }
  console.log(`[merge] read ${statusLines} decompile status records covering ${status.size} unique functions`);

  const zhl = buildZhlMap(ctx.input);
  console.log(`[merge] ZHL: ${zhl.stats.entries} signatures in ${zhl.stats.catalogs} catalogs -> ` +
    `${zhl.stats.unique} unique / ${zhl.stats.ambiguous} ambiguous / ${zhl.stats.missing} unmatched; ` +
    `${zhl.stats.mapped} distinct VAs named`);

  // A ZHL signature normally starts at the function entry, but if Ghidra split or
  // mis-started a function the match can land inside the body instead. Track both, and
  // keep them in separate fields so "zhlName" always means "entry-exact".
  const zhlVas = [...zhl.byVa.keys()].map((k) => Number.parseInt(k.slice(2), 16)).sort((a, b) => a - b);
  const zhlKeyOf = (n) => `0x${n.toString(16).padStart(8, "0")}`;
  const firstAtOrAfter = (v) => {
    let lo = 0;
    let hi = zhlVas.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (zhlVas[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const zhlUsed = new Set();

  // Functions created by the coverage-recovery pass, not by Ghidra's auto-analysis.
  const recovered = new Set();
  const recoveredPath = join(ctx.out, "recovered-functions.tsv");
  if (existsSync(recoveredPath)) {
    for (const line of readFileSync(recoveredPath, "utf8").split(/\r?\n/).slice(1)) {
      const va = line.split("\t")[1];
      if (va) recovered.add(va);
    }
    console.log(`[merge] ${recovered.size} functions came from the coverage-recovery pass`);
  }

  const outPath = join(ctx.out, "functions.jsonl");
  const chunks = [];
  const names = Object.create(null);
  let count = 0;
  let zhlHits = 0;
  let zhlInteriorHits = 0;
  await readJsonl(rawPath, (rec) => {
    const st = status.get(rec.va) || null;
    const z = zhl.byVa.get(rec.va) || null;
    if (z) { zhlHits += 1; zhlUsed.add(rec.va); }
    let zi = null;
    let ziOffset = null;
    // Only trust an interior match when the body is one contiguous range; otherwise the
    // [minVa, maxVa] hull can straddle unrelated functions and the attribution is noise.
    if (!z && rec.minVa && rec.maxVa && rec.bodyRanges === 1) {
      const lo = Number.parseInt(rec.minVa.slice(2), 16);
      const hi = Number.parseInt(rec.maxVa.slice(2), 16);
      const idx = firstAtOrAfter(lo);
      if (idx < zhlVas.length && zhlVas[idx] <= hi) {
        const key = zhlKeyOf(zhlVas[idx]);
        zi = zhl.byVa.get(key) || null;
        ziOffset = zhlVas[idx] - Number.parseInt(rec.va.slice(2), 16);
        if (zi && !zhlUsed.has(key)) {
          zhlInteriorHits += 1;
          zhlUsed.add(key);
        }
      }
    }
    const merged = {
      ...rec,
      recovered: recovered.has(rec.va),
      zhlName: z ? z.symbol : null,
      zhlDeclaration: z ? z.declaration : null,
      zhlCatalog: z ? z.catalog : null,
      zhlInteriorName: zi ? zi.symbol : null,
      zhlInteriorOffset: zi ? ziOffset : null,
      decompile: st
        ? {
            ok: st.ok,
            error: st.error ?? null,
            ms: st.ms ?? null,
            cBytes: st.cBytes ?? null,
            cPath: st.cPath ?? null,
            pcodePath: st.pcodePath ?? null,
            pcodeGzBytes: st.pcodeGzBytes ?? null,
            highOps: st.highOps ?? null,
            highBlocks: st.highBlocks ?? null,
            rawOps: st.rawOps ?? null,
            skipped: st.skipped === true,
          }
        : { ok: null, error: "not attempted", ms: null, cBytes: null, cPath: null, pcodePath: null, pcodeGzBytes: null, highOps: null, highBlocks: null, rawOps: null, skipped: false },
    };
    const best = merged.zhlName || (rec.defaultName ? null : rec.name);
    if (best) names[rec.va] = best;
    chunks.push(JSON.stringify(merged));
    count += 1;
    if (chunks.length >= 4096) { appendChunk(outPath, chunks, count === chunks.length); }
  });
  appendChunk(outPath, chunks, count === chunks.length);
  if (mergeFirstWrite) writeFileSync(outPath, "");
  zhl.stats.matchedFunctionEntry = zhlHits;
  zhl.stats.matchedFunctionInterior = zhlInteriorHits;
  zhl.stats.matchedNoFunction = zhl.stats.mapped - zhlUsed.size;
  console.log(`[merge] wrote ${count} records to ${outPath}`);
  console.log(`[merge] ZHL placement: ${zhlHits} at a function entry, ${zhlInteriorHits} inside a body, ` +
    `${zhl.stats.matchedNoFunction} at an address Ghidra never made a function`);
  writeFileSync(join(ctx.out, "zhl-stats.json"), `${JSON.stringify(zhl.stats, null, 2)}\n`);
  // Compact VA -> best-known-name map for the downstream lifter (ZHL name wins over
  // Ghidra's; default FUN_* names are omitted).
  writeFileSync(join(ctx.out, "names.json"), `${JSON.stringify(names, null, 0)}\n`);
  console.log(`[merge] names.json: ${Object.keys(names).length} functions have a non-default name`);
  return { count, zhlHits, zhlStats: zhl.stats };
}

let mergeFirstWrite = true;
function appendChunk(path, chunks, _first) {
  if (!chunks.length) return;
  const text = `${chunks.join("\n")}\n`;
  if (mergeFirstWrite) {
    writeFileSync(path, text);
    mergeFirstWrite = false;
  } else {
    // eslint-disable-next-line global-require
    const fd = openSync(path, "a");
    try { writeFileSync(fd, text); } finally { closeSync(fd); }
  }
  chunks.length = 0;
}

// ----------------------------------------------------------------- stage: report

function dirBytes(root) {
  let bytes = 0;
  let files = 0;
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try { entries = readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else { try { bytes += statSync(p).size; files += 1; } catch { /* ignore */ } }
    }
  }
  return { bytes, files };
}

const LIBRARY_NAME_RE = /^(std::|boost::|_?std_|__?imp_|operator |`|type_info|__crt|_Cnd_|_Mtx_|_Thrd_|_Xtime)/;

async function stageReport(ctx) {
  const fnPath = join(ctx.out, "functions.jsonl");
  if (!existsSync(fnPath)) throw new Error(`Missing ${fnPath}; run --stage merge`);
  const statsPath = join(ctx.out, "ghidra-stats.json");
  const gstats = existsSync(statsPath) ? JSON.parse(readFileSync(statsPath, "utf8")) : null;

  const s = {
    total: 0,
    inText: 0,
    external: 0,
    thunks: 0,
    fid: 0,
    fidInText: 0,
    zhlNamed: 0,
    defaultNamed: 0,
    libraryByName: 0,
    withSeh: 0,
    withIndirectCall: 0,
    withComputedJump: 0,
    withUnresolvedComputedJump: 0,
    unresolvedComputedJumpSites: 0,
    decompOk: 0,
    decompFail: 0,
    decompRawOnly: 0,
    decompMissing: 0,
    bytesTotal: 0,
    bytesInText: 0,
    bytesFid: 0,
    bytesZhl: 0,
    bytesThunk: 0,
    bytesLibraryByName: 0,
    bytesGameCandidate: 0,
    defaultNamedInText: 0,
    bytesDefaultNamedInText: 0,
    namedInText: 0,
    bytesNamedInText: 0,
    zeroInstruction: 0,
    recovered: 0,
    bytesRecovered: 0,
    instrTotal: 0,
    highOps: 0,
    rawOps: 0,
  };
  const errorHistogram = new Map();
  const biggest = [];

  await readJsonl(fnPath, (r) => {
    s.total += 1;
    const size = r.bodyBytes || 0;
    s.bytesTotal += size;
    s.instrTotal += r.instructionCount || 0;
    if (r.external) s.external += 1;
    if (r.thunk) s.thunks += 1;
    if (r.fid) s.fid += 1;
    if (r.zhlName) s.zhlNamed += 1;
    if (r.defaultName) s.defaultNamed += 1;
    if (r.hasSeh) s.withSeh += 1;
    if ((r.indirectCalls || 0) > 0) s.withIndirectCall += 1;
    if ((r.computedJumps || 0) > 0) s.withComputedJump += 1;
    if ((r.unresolvedComputedJumps || 0) > 0) {
      s.withUnresolvedComputedJump += 1;
      s.unresolvedComputedJumpSites += r.unresolvedComputedJumps;
    }
    const libByName = LIBRARY_NAME_RE.test(r.name || "");
    if (libByName) s.libraryByName += 1;
    if ((r.instructionCount || 0) === 0) s.zeroInstruction += 1;
    if (r.recovered) { s.recovered += 1; s.bytesRecovered += size; }
    if (r.inText) {
      s.inText += 1;
      s.bytesInText += size;
      if (r.fid) { s.fidInText += 1; s.bytesFid += size; }
      if (r.zhlName) s.bytesZhl += size;
      if (r.thunk) s.bytesThunk += size;
      if (libByName) s.bytesLibraryByName += size;
      if (!r.fid && !r.thunk && !libByName) s.bytesGameCandidate += size;
      const named = !r.defaultName || !!r.zhlName;
      if (named) { s.namedInText += 1; s.bytesNamedInText += size; }
      else { s.defaultNamedInText += 1; s.bytesDefaultNamedInText += size; }
    }
    const d = r.decompile || {};
    if (d.ok === true) {
      s.decompOk += 1;
      s.highOps += d.highOps || 0;
      s.rawOps += d.rawOps || 0;
    } else if (d.skipped) {
      s.decompRawOnly += 1;
      s.rawOps += d.rawOps || 0;
    } else if (d.ok === false) {
      s.decompFail += 1;
      const key = String(d.error || "unknown").slice(0, 120);
      errorHistogram.set(key, (errorHistogram.get(key) || 0) + 1);
      s.rawOps += d.rawOps || 0;
    } else {
      s.decompMissing += 1;
    }
    if (r.inText && size > 0) {
      biggest.push([size, r.va, r.zhlName || r.name]);
      if (biggest.length > 4000) { biggest.sort((a, b) => b[0] - a[0]); biggest.length = 40; }
    }
  });
  biggest.sort((a, b) => b[0] - a[0]);
  biggest.length = Math.min(biggest.length, 25);

  const cDir = join(ctx.out, "c");
  const pDir = join(ctx.out, "pcode");
  const cSize = dirBytes(cDir);
  const pSize = dirBytes(pDir);

  const text = gstats ? gstats.textSection : null;
  const coverage = text
    ? {
        textVirtualBytes: text.virtualSize,
        textAddressBytes: text.addressBytes,
        bytesInFunctionBodies: gstats.coverage.functionBodyBytesInText,
        bytesInInstructionsNotInFunction: gstats.coverage.instructionBytesInTextOutsideFunctions,
        bytesDefinedData: gstats.coverage.dataBytesInText,
        bytesUndefined: gstats.coverage.undefinedBytesInText,
        percentInFunctions: +(100 * gstats.coverage.functionBodyBytesInText / text.addressBytes).toFixed(3),
      }
    : null;

  const summary = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    input: { path: ctx.input, bytes: statSync(ctx.input).size, sha256: ctx.inputSha256 },
    ghidra: { home: ctx.ghidraHome, project: join(ctx.opts.projectDir, `${ctx.opts.projectName}.gpr`) },
    analyze: existsSync(join(ctx.out, "analyze-done.json"))
      ? JSON.parse(readFileSync(join(ctx.out, "analyze-done.json"), "utf8"))
      : null,
    functions: s,
    coverage,
    programStats: gstats,
    zhl: existsSync(join(ctx.out, "zhl-stats.json")) ? JSON.parse(readFileSync(join(ctx.out, "zhl-stats.json"), "utf8")) : null,
    artifacts: {
      cFiles: cSize.files,
      cBytes: cSize.bytes,
      pcodeFiles: pSize.files,
      pcodeBytesGz: pSize.bytes,
    },
    decompileErrors: [...errorHistogram.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30)
      .map(([error, count]) => ({ error, count })),
    largestTextFunctions: biggest.map(([bytes, va, name]) => ({ va, bytes, name })),
  };
  const outJson = join(ctx.out, "summary.json");
  writeFileSync(outJson, `${JSON.stringify(summary, null, 2)}\n`);

  const pct = (n, d) => (d ? `${(100 * n / d).toFixed(2)}%` : "n/a");
  const md = [
    "# Isaac bulk export summary",
    "",
    `Generated: ${summary.generatedAt}`,
    `Input: \`${ctx.input}\` (${summary.input.bytes} bytes, sha256 ${summary.input.sha256})`,
    "",
    "## Functions",
    `- total recovered: **${s.total}** (${s.inText} in .text, ${s.external} external)`,
    `- decompiler invoked on: ${s.decompOk + s.decompFail} functions`,
    `- decompiled OK: **${s.decompOk}** (${pct(s.decompOk, s.decompOk + s.decompFail)} of those invoked, ${pct(s.decompOk, s.total)} of all functions)`,
    `- decompile failed: ${s.decompFail}`,
    `- raw P-Code only by policy (recovered mid-function fragments): ${s.decompRawOnly}`,
    `- never attempted: ${s.decompMissing}`,
    `- FID (library) identified: **${s.fid}** (${s.fidInText} in .text)`,
    `- ZHL-named game functions: **${s.zhlNamed}**`,
    `- library-looking by name (std::/boost::/CRT): ${s.libraryByName}`,
    `- thunks: ${s.thunks}`,
    `- default \`FUN_*\` names: ${s.defaultNamed}`,
    `- with SEH: **${s.withSeh}**`,
    `- with indirect calls: ${s.withIndirectCall}`,
    `- with computed jumps: ${s.withComputedJump}`,
    `- with UNRESOLVED computed jumps: **${s.withUnresolvedComputedJump}** (${s.unresolvedComputedJumpSites} sites)`,
    `- total instructions in functions: ${s.instrTotal}`,
    `- created by the coverage-recovery pass (not Ghidra auto-analysis): ${s.recovered} (${s.bytesRecovered} bytes)`,
    "",
    "## .text coverage",
    coverage
      ? [
          `- .text addressable bytes: ${coverage.textAddressBytes}`,
          `- bytes inside a recognized function body: ${coverage.bytesInFunctionBodies} (${coverage.percentInFunctions}%)`,
          `- instruction bytes NOT in any function: ${coverage.bytesInInstructionsNotInFunction}`,
          `- defined data bytes in .text: ${coverage.bytesDefinedData}`,
          `- undefined bytes in .text: ${coverage.bytesUndefined}`,
        ].join("\n")
      : "- (ghidra-stats.json missing)",
    "",
    "## Library vs game logic (by .text bytes)",
    `- total bytes in .text function bodies: ${s.bytesInText}`,
    `- FID library bytes: ${s.bytesFid} (${pct(s.bytesFid, s.bytesInText)} of function bytes)`,
    `- thunk bytes: ${s.bytesThunk} (${pct(s.bytesThunk, s.bytesInText)})`,
    `- library-named bytes: ${s.bytesLibraryByName} (${pct(s.bytesLibraryByName, s.bytesInText)})`,
    `- ZHL-named bytes: ${s.bytesZhl} (${pct(s.bytesZhl, s.bytesInText)})`,
    `- game-candidate bytes (not FID, not thunk, not library-named): ${s.bytesGameCandidate} (${pct(s.bytesGameCandidate, s.bytesInText)})`,
    `- .text functions with a real name (FID/demangler/ZHL): ${s.namedInText} (${s.bytesNamedInText} bytes)`,
    `- .text functions still \`FUN_*\`: ${s.defaultNamedInText} (${s.bytesDefaultNamedInText} bytes)`,
    `- functions with zero disassembled instructions: ${s.zeroInstruction}`,
    "",
    "## Artifacts",
    `- decompiled C files: ${summary.artifacts.cFiles} (${summary.artifacts.cBytes} bytes)`,
    `- P-Code files (gzip): ${summary.artifacts.pcodeFiles} (${summary.artifacts.pcodeBytesGz} bytes)`,
    `- high P-Code ops exported: ${s.highOps}`,
    `- raw P-Code ops exported: ${s.rawOps}`,
    "",
  ].join("\n");
  writeFileSync(join(ctx.out, "summary.md"), `${md}\n`);
  console.log(md);
  return summary;
}

// ------------------------------------------------------------------------ main

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const input = defaultInput(opts.input);
  const ghidraHome = defaultGhidraHome(opts.ghidraHome);
  const out = opts.out;
  const logDir = join(out, "logs");
  mkdirSync(logDir, { recursive: true });
  const ctx = {
    opts,
    input,
    inputSha256: createHash("sha256").update(readFileSync(input)).digest("hex"),
    programName: basename(input),
    ghidraHome,
    out,
    logDir,
    scriptPath: join(repoRoot, "scripts", "recomp", "ghidra"),
  };
  console.log(`[export-all] input=${input}`);
  console.log(`[export-all] sha256=${ctx.inputSha256}`);
  console.log(`[export-all] ghidra=${ghidraHome}`);
  console.log(`[export-all] project=${join(opts.projectDir, `${opts.projectName}.gpr`)}`);
  console.log(`[export-all] out=${out}`);
  console.log(`[export-all] stages=${opts.stages.join(",")}`);

  const timings = {};
  for (const stage of opts.stages) {
    const t0 = Date.now();
    console.log(`\n===== stage: ${stage} =====`);
    if (stage === "analyze") await stageAnalyze(ctx);
    else if (stage === "recover") await stageRecover(ctx);
    else if (stage === "inventory") await stageInventory(ctx);
    else if (stage === "decompile") await stageDecompile(ctx);
    else if (stage === "merge") await stageMerge(ctx);
    else if (stage === "report") await stageReport(ctx);
    timings[stage] = Date.now() - t0;
    console.log(`===== stage ${stage} took ${(timings[stage] / 1000).toFixed(1)}s =====`);
  }
  writeFileSync(join(out, "stage-timings.json"), `${JSON.stringify({ at: new Date().toISOString(), timings }, null, 2)}\n`);
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((e) => {
    console.error(e.stack || String(e));
    process.exitCode = 1;
  });
}
