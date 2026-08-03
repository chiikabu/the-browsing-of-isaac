import { execFileSync } from "node:child_process";
import { statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
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

function extension(path) {
  const name = path.slice(path.lastIndexOf("/") + 1).toLowerCase();
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot);
}

function violationsFor(path) {
  const normalized = path.replaceAll("\\", "/");
  const violations = [];
  if (forbiddenPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    violations.push("local/proprietary path");
  }
  if (forbiddenExact.has(normalized)) violations.push("binary-derived/generated file");
  if (forbiddenExtensions.has(extension(normalized))) violations.push("binary/archive/media extension");
  if (/^web\/emu\/boxedwine\.(?:js|wasm)(?:\.|$)/i.test(normalized)) {
    violations.push("generated BoxedWine runtime");
  }
  return violations;
}

let tracked;
try {
  tracked = execFileSync("git", ["ls-files", "-z"], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).split("\0").filter(Boolean);
} catch {
  console.error("Repository safety check requires an initialized Git worktree.");
  process.exit(2);
}

const failures = [];
for (const path of tracked) {
  for (const reason of violationsFor(path)) failures.push(`${path}: ${reason}`);
  const localPath = resolve(root, ...path.split("/"));
  try {
    const info = statSync(localPath);
    if (info.isFile() && info.size > maximumTrackedBytes) {
      failures.push(`${path}: ${info.size} bytes exceeds ${maximumTrackedBytes}`);
    }
  } catch {
    // A deleted tracked file is Git's concern; it cannot leak new payload data.
  }
}

if (failures.length) {
  console.error("Repository safety check failed:\n" + failures.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log(`Repository safety check passed (${tracked.length} tracked paths).`);
