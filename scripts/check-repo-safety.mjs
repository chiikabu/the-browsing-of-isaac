import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const maximumTrackedBytes = 5 * 1024 * 1024;
const forbiddenPrefixes = [
  "extracted_resources/",
  "extracted_work/",
  "output/",
  "tools/",
];
const forbiddenExact = new Set([
  "ResourceExtractor_log.txt",
  "docs/pe-imports.json",
  "docs/phase1-binary-recovery.json",
  "docs/strings-interesting.txt",
  "web/isaac-host.js",
  "web/isaac-host.wasm",
]);
const forbiddenExtensions = new Set([
  ".7z", ".a", ".anm2", ".b", ".dat", ".dll", ".exe", ".jpeg", ".jpg",
  ".mp3", ".ogg", ".ogv", ".pak", ".png", ".rar", ".so", ".stb", ".ttf",
  ".wasm", ".wav", ".zip",
]);

// These are explicitly local-only locations. They are evaluated only for
// untracked/ignored files; a tracked payload under one of these roots still
// fails the tracked-file policy above.
const privateRoots = [
  ".scratch/",
  "re/ghidra_project/",
  "extracted_resources/",
  "extracted_work/",
  "tools/",
  "output/",
  "node_modules/",
  // Locally owned game instance archive auto-mounted by scripts/serve.mjs.
  "game-instance/",
];
const privateExact = new Set([
  "native/eos_stub/EOSSDK-Win32-Shipping.dll",
  "native/openal_stub/OpenAL32.dll",
  "native/steam_stub/steam_api.dll",
]);

const trackedLargeExceptions = new Map([
  ["third_party/REPENTOGON/libs/zydis:src/Generated/InstructionDefinitions.inc", {
    maxBytes: 6 * 1024 * 1024,
    sha256: "ac035ca1070b8144a1239ad89d706fa4960f79071aad37a9bb348cf3607ec0ad",
  }],
]);

function git(cwd, args) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function normalize(path) {
  return path.replaceAll("\\", "/").replace(/^\.\//, "");
}

function extension(path) {
  const name = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot);
}

function violationsForTracked(path) {
  const violations = [];
  if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) {
    violations.push("local/proprietary path");
  }
  if (forbiddenExact.has(path)) violations.push("binary-derived/generated file");
  if (forbiddenExtensions.has(extension(path))) violations.push("binary/archive/media extension");
  return violations;
}

function isPrivateWebArtifact(path) {
  return path === "web/isaac-host.js" || path === "web/isaac-host.wasm";
}

function isPrivateLocalPath(path) {
  return privateExact.has(path) ||
    privateRoots.some((prefix) => path.startsWith(prefix)) ||
    isPrivateWebArtifact(path);
}

function fileInfo(root, path) {
  try {
    const info = lstatSync(resolve(root, ...path.split("/")));
    return info.isFile() ? info : null;
  } catch {
    return null;
  }
}

function largeFileException(repository, path, localPath, size) {
  const exception = trackedLargeExceptions.get(`${repository}:${path}`);
  if (!exception || size > exception.maxBytes) return false;
  return createHash("sha256").update(readFileSync(localPath)).digest("hex") === exception.sha256;
}

function repositories(root) {
  let output;
  try {
    output = git(root, ["submodule", "status", "--recursive"]);
  } catch {
    throw new Error("Repository safety check requires an initialized Git worktree.");
  }

  const repos = [{ directory: root, name: ".", isSuperproject: true }];
  const uninitialized = [];
  for (const line of output.split(/\r?\n/)) {
    if (!line) continue;
    const match = line.match(/^.[0-9a-f]{40}\s+(.+?)(?:\s+\(|$)/i);
    if (!match) throw new Error(`Could not parse submodule status: ${line}`);
    const path = normalize(match[1]);
    if (line[0] === "-") {
      uninitialized.push(`${path} @ ${line.slice(1, 41)}`);
      continue;
    }
    const directory = resolve(root, ...path.split("/"));
    if (!normalize(relative(root, directory)).match(/^(?!\.\.)(?:[^/]+(?:\/|$))*$/)) {
      throw new Error(`Submodule path escapes repository: ${path}`);
    }
    repos.push({ directory, name: path, isSuperproject: false });
  }
  if (uninitialized.length) {
    throw new Error(
      "Submodules are not initialized:\n" +
      uninitialized.map((item) => `- ${item}`).join("\n") +
      "\nRun git submodule update --init --recursive.",
    );
  }
  return repos;
}

function untrackedOrIgnoredPaths(repo) {
  const output = git(repo.directory, ["status", "--porcelain=v1", "-z", "--ignored", "--untracked-files=all"]);
  return output.split("\0").filter(Boolean).flatMap((entry) => {
    if (!entry.startsWith("?? ") && !entry.startsWith("!! ")) return [];
    return [{ kind: entry.slice(0, 2) === "!!" ? "ignored" : "untracked", path: normalize(entry.slice(3)) }];
  });
}

export function checkRepositorySafety(root = process.env.REPO_SAFETY_ROOT || defaultRoot) {
  const absoluteRoot = resolve(root);
  const failures = [];
  let trackedCount = 0;
  let localCount = 0;

  for (const repo of repositories(absoluteRoot)) {
    const tracked = git(repo.directory, ["ls-files", "-z"]).split("\0").filter(Boolean).map(normalize);
    trackedCount += tracked.length;
    for (const path of tracked) {
      const label = repo.name === "." ? path : `${repo.name}: ${path}`;
      // Submodules intentionally contain upstream source media. The
      // proprietary/path/extension policy is for this repository's payload;
      // every worktree still gets the tracked-size policy below.
      if (repo.isSuperproject) {
        for (const reason of violationsForTracked(path)) failures.push(`${label}: ${reason}`);
      }
      const info = fileInfo(repo.directory, path);
      if (info && info.size > maximumTrackedBytes) {
        const localPath = resolve(repo.directory, ...path.split("/"));
        if (!largeFileException(repo.name, path, localPath, info.size)) {
          failures.push(`${label}: ${info.size} bytes exceeds ${maximumTrackedBytes}`);
        }
      }
    }

    for (const { kind, path } of untrackedOrIgnoredPaths(repo)) {
      const superPath = repo.name === "." ? path : `${repo.name}/${path}`;
      if (isPrivateLocalPath(superPath)) continue;
      const info = fileInfo(repo.directory, path);
      const dangerous = forbiddenExtensions.has(extension(path)) ||
        (info && info.size > maximumTrackedBytes);
      if (dangerous) failures.push(`${superPath}: dangerous ${kind} file outside an explicit private root`);
      localCount++;
    }
  }

  if (failures.length) return { failures, trackedCount, localCount };
  return { failures: [], trackedCount, localCount };
}

function main() {
  try {
    const result = checkRepositorySafety();
    if (result.failures.length) {
      console.error("Repository safety check failed:\n" + result.failures.map((item) => `- ${item}`).join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log(`Repository safety check passed (${result.trackedCount} tracked paths; ${result.localCount} non-private local paths scanned).`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
