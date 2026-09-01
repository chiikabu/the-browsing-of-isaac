import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  executableRanges,
  findCatalogEntry,
  findSignatureMatches,
  parsePe,
  parseSignature,
  rankSignatureCandidates,
  rawOffsetToRva,
  readZhlSignatures,
} from "./pe-signatures.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const options = { analyze: true, maxFunctions: 64, reanalyze: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--inventory-only") options.analyze = false;
    else if (arg === "--reanalyze") options.reanalyze = true;
    else if (arg === "--input") options.input = argv[++i];
    else if (arg === "--ghidra-home") options.ghidraHome = argv[++i];
    else if (arg === "--output") options.output = argv[++i];
    else if (arg === "--max-functions") options.maxFunctions = Number.parseInt(argv[++i], 10);
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!Number.isInteger(options.maxFunctions) || options.maxFunctions < 1 || options.maxFunctions > 512) {
    throw new Error("--max-functions must be an integer from 1 through 512");
  }
  return options;
}

function resolveInside(root, candidate, label) {
  const absolute = resolve(candidate);
  const rel = relative(resolve(root), absolute);
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) return absolute;
  throw new Error(`${label} must remain inside ${root}`);
}

function firstExisting(candidates, label) {
  const hit = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!hit) throw new Error(`${label} was not found. Checked:\n${candidates.filter(Boolean).join("\n")}`);
  return resolve(hit);
}

function defaultInput(explicit) {
  if (explicit) return firstExisting([resolve(explicit)], "Input PE");
  return firstExisting([
    join(repoRoot, "tools", "isaac-ng.unpacked.exe"),
    process.env.ISAAC_EXE,
    "C:/Program Files (x86)/Steam/steamapps/common/The Binding of Isaac Rebirth/isaac-ng.exe",
  ], "Input PE");
}

function defaultGhidraHome(explicit) {
  if (explicit) return firstExisting([resolve(explicit)], "Ghidra home");
  return firstExisting([
    process.env.GHIDRA_HOME,
    join(homedir(), "Tools", "ghidra"),
    join(homedir(), "Tools", "ghidra_12.1.2_PUBLIC"),
  ], "Ghidra home");
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function parseRva(value, label) {
  if (typeof value !== "string" || !/^0x[0-9a-f]+$/i.test(value)) {
    throw new Error(`${label} must be a hexadecimal RVA string`);
  }
  const rva = Number.parseInt(value.slice(2), 16);
  if (!Number.isSafeInteger(rva)) throw new Error(`${label} is outside the safe integer range`);
  return rva;
}

export function loadVerifiedRoots(path, inventory) {
  if (!existsSync(path)) return [];
  const verification = JSON.parse(readFileSync(path, "utf8"));
  if (verification.schemaVersion !== 1) throw new Error(`Unsupported verified-root schema in ${path}`);
  if (verification.inputSha256 !== inventory.input.sha256) {
    throw new Error(`Verified roots are bound to a different executable hash: ${path}`);
  }
  if (!Array.isArray(verification.roots)) throw new Error(`Verified roots must be an array: ${path}`);

  const configured = new Set(inventory.roots.map((root) => root.symbol));
  const seen = new Set();
  return verification.roots.map((root, index) => {
    const label = `verified root ${index}`;
    if (!root || !configured.has(root.symbol)) throw new Error(`${label} is not a configured port symbol`);
    if (seen.has(root.symbol)) throw new Error(`Duplicate verified root: ${root.symbol}`);
    seen.add(root.symbol);
    const rva = parseRva(root.rva, `${label} RVA`);
    const section = inventory.pe.sections.find((candidate) =>
      (candidate.characteristics & 0x20000000) !== 0 &&
      rva >= candidate.rva &&
      rva < candidate.rva + Math.max(candidate.virtualSize, candidate.rawSize));
    if (!section) throw new Error(`${label} does not lie in an executable PE section`);
    if (!Array.isArray(root.evidence) || !root.evidence.length || root.evidence.some((item) => typeof item !== "string" || !item.trim())) {
      throw new Error(`${label} requires at least one non-empty evidence item`);
    }
    return {
      symbol: root.symbol,
      rva,
      confidence: "locally-verified",
      reason: root.evidence.join("; "),
    };
  });
}

function cmdQuote(value) {
  if (/[\r\n"]/.test(value)) throw new Error(`Unsupported character in command argument: ${value}`);
  return `"${value}"`;
}

export function buildInventory(input, rootsPath = join(repoRoot, "decomp", "port-roots.json")) {
  const buffer = readFileSync(input);
  const pe = parsePe(buffer);
  const config = JSON.parse(readFileSync(rootsPath, "utf8"));
  const ranges = executableRanges(pe, buffer.length);
  const catalogRoot = resolve(repoRoot, config.catalogRoot);
  const catalogCache = new Map();

  const roots = config.roots.map((root) => {
    const catalogPath = resolve(catalogRoot, root.catalog);
    let entries = catalogCache.get(catalogPath);
    if (!entries) {
      entries = readZhlSignatures(catalogPath);
      catalogCache.set(catalogPath, entries);
    }
    const entry = findCatalogEntry(entries, root.symbol);
    const signature = parseSignature(entry.pattern);
    const rawMatches = findSignatureMatches(buffer, signature, ranges);
    const matches = rawMatches.map((rawOffset) => ({
      rawOffset,
      rva: rawOffsetToRva(pe, rawOffset),
    }));
    const nearMatches = rawMatches.length === 0
      ? rankSignatureCandidates(buffer, signature, ranges).map((candidate) => ({
          ...candidate,
          rva: rawOffsetToRva(pe, candidate.rawOffset),
        }))
      : [];
    return {
      ...root,
      catalog: relative(repoRoot, catalogPath).replaceAll("\\", "/"),
      patternLength: entry.pattern.length / 2,
      declaration: entry.declaration,
      status: matches.length === 1 ? "unique" : matches.length === 0 ? "missing" : "ambiguous",
      matches,
      nearMatches,
    };
  });

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    input: {
      path: input,
      byteLength: buffer.length,
      sha256: sha256(buffer),
    },
    pe: {
      machine: `0x${pe.machine.toString(16)}`,
      format: "PE32",
      imageBase: `0x${pe.imageBase.toString(16)}`,
      entryRva: `0x${pe.entryRva.toString(16)}`,
      sections: pe.sections,
    },
    roots,
  };
}

function writeSeeds(path, inventory, verifiedRoots) {
  const lines = ["# symbol\trva\treason"];
  const seeded = new Set();
  for (const root of inventory.roots) {
    if (root.status !== "unique") continue;
    lines.push(`${root.symbol}\t0x${root.matches[0].rva.toString(16)}\t${root.reason}`);
    seeded.add(root.symbol);
  }
  for (const root of verifiedRoots) {
    if (seeded.has(root.symbol)) continue;
    lines.push(`${root.symbol}\t0x${root.rva.toString(16)}\t${root.confidence}: ${root.reason}`);
    seeded.add(root.symbol);
  }
  writeFileSync(path, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const input = defaultInput(options.input);
  const inventory = buildInventory(input);
  const shortHash = inventory.input.sha256.slice(0, 12);
  const outputRoot = resolveInside(
    join(repoRoot, "output"),
    options.output ? resolve(options.output) : join(repoRoot, "output", "decomp", shortHash),
    "Decompiler output",
  );
  mkdirSync(outputRoot, { recursive: true });

  const inventoryPath = join(outputRoot, "inventory.json");
  const seedsPath = join(outputRoot, "roots.tsv");
  const verificationPath = join(outputRoot, "verified-roots.json");
  const verifiedRoots = loadVerifiedRoots(verificationPath, inventory);
  inventory.localVerifiedRoots = verifiedRoots;
  writeFileSync(inventoryPath, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
  writeSeeds(seedsPath, inventory, verifiedRoots);

  const summary = inventory.roots.map((root) => `${root.status.padEnd(9)} ${root.symbol}`).join("\n");
  console.log(`Input: ${input}`);
  console.log(`SHA-256: ${inventory.input.sha256}`);
  console.log(`Entry RVA: ${inventory.pe.entryRva}`);
  console.log(summary);
  if (verifiedRoots.length) console.log(`locally verified: ${verifiedRoots.map((root) => root.symbol).join(", ")}`);
  console.log(`Inventory: ${inventoryPath}`);

  const uniqueCount = inventory.roots.filter((root) => root.status === "unique").length;
  if (!uniqueCount) throw new Error("No configured port roots matched this executable");
  if (!options.analyze) return;

  const ghidraHome = defaultGhidraHome(options.ghidraHome);
  const headless = join(ghidraHome, "support", process.platform === "win32" ? "analyzeHeadless.bat" : "analyzeHeadless");
  if (!existsSync(headless)) throw new Error(`Ghidra headless launcher is missing: ${headless}`);

  const projectRoot = resolveInside(repoRoot, join(repoRoot, "re", "ghidra_project"), "Ghidra project");
  const projectName = `IsaacDecomp_${shortHash}`;
  const projectFile = join(projectRoot, `${projectName}.gpr`);
  const projectLock = join(projectRoot, `${projectName}.lock`);
  if (existsSync(projectLock)) {
    throw new Error(
      `Ghidra project is already locked: ${projectLock}\n` +
      "Wait for the active analysis to finish. If Ghidra crashed, verify no analyzer is running before removing the stale lock.",
    );
  }
  const scriptPath = join(repoRoot, "scripts", "decomp", "ghidra");
  const manifestPath = join(outputRoot, "manifest.json");
  const decompiledPath = join(outputRoot, "decompiled");
  mkdirSync(projectRoot, { recursive: true });
  mkdirSync(decompiledPath, { recursive: true });

  const programArgs = existsSync(projectFile)
    ? options.reanalyze
      ? ["-process", basename(input), "-analysisTimeoutPerFile", "1800"]
      : ["-process", basename(input), "-noanalysis"]
    : ["-import", input, "-analysisTimeoutPerFile", "1800"];
  const args = [
    projectRoot,
    projectName,
    ...programArgs,
    "-scriptPath", scriptPath,
    "-postScript", "ExportPortSlice.java",
    seedsPath,
    manifestPath,
    decompiledPath,
    String(options.maxFunctions),
  ];
  console.log(`Launching Ghidra ${ghidraHome}`);
  const executable = process.platform === "win32" ? (process.env.ComSpec || "cmd.exe") : headless;
  const processArgs = process.platform === "win32"
    ? ["/d", "/s", "/c", `"${[headless, ...args].map(cmdQuote).join(" ")}"`]
    : args;
  const result = spawnSync(executable, processArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "inherit",
    windowsVerbatimArguments: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Ghidra exited with status ${result.status}`);
  if (!existsSync(manifestPath)) throw new Error("Ghidra completed without producing a manifest");
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Decompiler output: ${decompiledPath}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  }
}
