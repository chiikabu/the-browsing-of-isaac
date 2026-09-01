/**
 * Content-hash cache for the family suites' self-built wasm modules.
 *
 * Every family test file compiles its C++ with clang (-fsyntax-only) and
 * em++ on every run — including once per MUTANT inside the mutation-check
 * tests. Both are pure functions of the source bytes, so the whole build is
 * cached by sha256(source files + extra key material): a warm run skips
 * every spawn, and a mutant hashes differently so it always really builds.
 * Restores hash back to the original -> cache hit. Correctness is untouched:
 * a cache entry is only ever written from a build that just succeeded, and
 * the entry IS the byte-for-byte wasm that build produced.
 *
 * Disable with ISAAC_WASM_BUILD_CACHE=0 (every build runs the real spawns).
 * Cache lives under output/decomp/wasm-build-cache/ (gitignored via /output/).
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const CACHE_VERSION = "v1";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, "output", "decomp", "wasm-build-cache");

const enabled = () => process.env.ISAAC_WASM_BUILD_CACHE !== "0";

/**
 * Run `build()` unless an identical build is cached.
 * @param {object} o
 * @param {string[]} o.files   source files whose BYTES define the build
 * @param {string}   o.wasmPath output the build writes
 * @param {Function} o.build   the real (spawning) build function
 * @param {string}   [o.extra] additional key material (EXPORTS list, flags)
 * @param {string}   [o.tag]   human-readable cache-file prefix
 */
export function withWasmBuildCache({ files, wasmPath, build, extra = "", tag = "wasm" }) {
  if (!enabled()) {
    build();
    return;
  }
  const h = createHash("sha256");
  h.update(CACHE_VERSION);
  for (const f of files) {
    h.update("\0file\0");
    h.update(readFileSync(f));
  }
  h.update("\0extra\0");
  h.update(extra);
  const key = h.digest("hex").slice(0, 24);
  const entry = join(cacheDir, `${tag}-${key}.wasm`);
  if (existsSync(entry)) {
    mkdirSync(dirname(wasmPath), { recursive: true });
    copyFileSync(entry, wasmPath);
    return;
  }
  build();
  // Only a build that just succeeded (and produced the artifact) is cached.
  if (existsSync(wasmPath)) {
    mkdirSync(cacheDir, { recursive: true });
    // Write-then-rename so a concurrent reader never sees a torn entry; a
    // concurrent writer of the same key produces identical bytes anyway.
    const tmp = `${entry}.tmp-${process.pid}`;
    copyFileSync(wasmPath, tmp);
    try {
      renameSync(tmp, entry);
    } catch {
      try { rmSync(tmp); } catch { /* best effort */ }
    }
  }
}
