/**
 * Boot isaac-nosfx, wait for intro cutscene, spam skip keys, probe for
 * title/character menu and nonblack canvas. Evidence → SCRATCH/wgl-menu*.
 */
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import {
  createReadStream,
  readFileSync,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  BENCHMARK_MOVEMENT_INPUT,
  BENCHMARK_SEED_NUMERIC,
  BENCHMARK_SEED_INPUT,
  createBenchmarkEvidence,
  parseBenchmarkConfig,
  sha256Canonical,
  summarizeFrameDeltas,
  updateBenchmarkEvidence,
} from "./benchmark-contract.mjs";

async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex").toUpperCase();
}

async function fileIdentity(role, urlPath, sourcePath) {
  const info = statSync(sourcePath);
  if (!info.isFile()) throw new Error(`benchmark asset is not a file: ${sourcePath}`);
  return {
    role,
    url: urlPath,
    bytes: info.size,
    sha256: await sha256File(sourcePath),
    sourcePath,
  };
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const web = join(root, "web");
const benchmarkConfig = parseBenchmarkConfig(process.env);
const benchmarkSavePath = benchmarkConfig.enabled ? resolve(benchmarkConfig.save) : null;
if (benchmarkConfig.enabled && (!isAbsolute(benchmarkConfig.save) || !existsSync(benchmarkSavePath))) {
  throw new Error("BENCH_SAVE must be an existing absolute path");
}
const benchmarkSaveSha256 = benchmarkConfig.enabled ? await sha256File(benchmarkSavePath) : null;
const benchmarkOverlayName = benchmarkConfig.enabled
  ? `__bench_${benchmarkSaveSha256.slice(0, 12).toLowerCase()}`
  : null;
const runtimeDir = process.env.RUNTIME_DIR
  ? resolve(process.env.RUNTIME_DIR)
  : null;
if (benchmarkConfig.enabled) {
  if (!runtimeDir || !existsSync(runtimeDir) || !statSync(runtimeDir).isDirectory()) {
    throw new Error("BENCHMARK mode requires RUNTIME_DIR with boxedwine.js and boxedwine.wasm");
  }
  for (const name of ["boxedwine.js", "boxedwine.wasm"]) {
    const path = join(runtimeDir, name);
    if (!existsSync(path) || !statSync(path).isFile()) throw new Error(`missing benchmark runtime asset: ${path}`);
  }
}
const standalonePath = process.env.STANDALONE_HTML
  ? resolve(process.env.STANDALONE_HTML)
  : null;
if (benchmarkConfig.enabled && standalonePath) {
  throw new Error("BENCHMARK mode requires individually hashed runtime assets, not STANDALONE_HTML");
}
const scratch = process.env.SCRATCH || join(root, "output", "playwright");
const waitMs = Number(process.env.WAIT_MS || 720000);
const tag = process.env.TAG || "wgl-menu";
const app = process.env.APP || (benchmarkConfig.enabled ? "isaac-phase6-full" : "isaac-nosfx");
if (benchmarkConfig.enabled && app !== "isaac-phase6-full") {
  throw new Error("BENCHMARK mode pins APP=isaac-phase6-full");
}
if (benchmarkConfig.enabled && process.env.OVERLAY) {
  throw new Error("BENCHMARK mode derives OVERLAY from BENCH_SAVE");
}
const overlay = process.env.OVERLAY || (benchmarkConfig.enabled
  ? `debian10;${benchmarkOverlayName}`
  : "debian10;isaac-savedir");
const overlayQuery = overlay.split(";").map(encodeURIComponent).join(";");
const waitForX11KeyProbe = process.env.WAIT_FOR_X11_KEY_PROBE === "1";
const navGapSec = Math.max(1, Number.parseInt(process.env.NAV_GAP_SEC || "15", 10) || 15);
const gameplayWarmupMs = Math.max(0, Number.parseInt(process.env.GAMEPLAY_WARMUP_MS || "0", 10) || 0);
const sound = process.env.SOUND === "1" || process.env.SOUND === "true" ? "true" : "false";
if (benchmarkConfig.enabled && sound !== "false") throw new Error("BENCHMARK mode requires SOUND=0");
const exportJitCache = process.env.EXPORT_JIT_CACHE
  ? resolve(process.env.EXPORT_JIT_CACHE)
  : null;
const cpuProfilePath = process.env.CPU_PROFILE_PATH
  ? resolve(process.env.CPU_PROFILE_PATH)
  : null;
if (benchmarkConfig.enabled && (cpuProfilePath || exportJitCache)) {
  throw new Error("BENCHMARK mode forbids CPU_PROFILE_PATH and EXPORT_JIT_CACHE");
}
const privateAssets = new Map();
if (benchmarkConfig.enabled) {
  privateAssets.set(`/emu/${benchmarkOverlayName}.zip`, benchmarkSavePath);
}
mkdirSync(scratch, { recursive: true });
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".wasm": "application/wasm",
  ".zip": "application/zip",
};
const allowedControlKeys = new Set([
  "Enter",
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Escape",
]);
let controlPage = null;
const servedRequests = [];

function pathIsInside(parent, candidate) {
  const rel = relative(parent, candidate);
  return rel !== "" && !rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel);
}

const server = await new Promise((r) => {
  const s = createServer(async (req, res) => {
    const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
    if (requestUrl.pathname === "/control") {
      const key = requestUrl.searchParams.get("key");
      if (!controlPage || !allowedControlKeys.has(key)) {
        res.writeHead(400);
        res.end("invalid control key");
        return;
      }
      try {
        const result = await pressGuestKey(key);
        console.log("control key", key, JSON.stringify(result));
        res.writeHead(result.acknowledged ? 200 : 409, {
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify(result));
      } catch (error) {
        res.writeHead(500);
        res.end(error.message);
      }
      return;
    }
    let p;
    try {
      p = decodeURIComponent(requestUrl.pathname);
    } catch {
      res.writeHead(400);
      res.end("bad path encoding");
      return;
    }
    if (p.includes("\\")) {
      res.writeHead(400);
      res.end("bad path separator");
      return;
    }
    if (p === "/" && standalonePath) {
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Cross-Origin-Opener-Policy": "same-origin",
        "Cross-Origin-Embedder-Policy": "require-corp",
        "Cross-Origin-Resource-Policy": "same-origin",
      });
      createReadStream(standalonePath).pipe(res);
      return;
    }
    if (p === "/") p = "/emu/index.html";
    const privateAsset = privateAssets.get(p);
    const runtimeAsset = /^\/emu\/boxedwine\.(?:js|wasm)$/.test(p);
    const f = privateAsset || (runtimeDir && runtimeAsset
      ? join(runtimeDir, p.slice(p.lastIndexOf("/") + 1))
      : join(web, p.replace(/^\//, "")));
    const allowedRoot = runtimeDir && runtimeAsset ? runtimeDir : web;
    if ((!privateAsset && !pathIsInside(allowedRoot, f)) || !existsSync(f) || !statSync(f).isFile()) {
      res.writeHead(404);
      res.end("nf");
      return;
    }
    const fileStat = statSync(f);
    servedRequests.push({ path: p, bytes: fileStat.size, privateAsset: Boolean(privateAsset) });
    res.writeHead(200, {
      "Content-Type": types[extname(f)] || "application/octet-stream",
      "Content-Length": fileStat.size,
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Resource-Policy": "same-origin",
      ...(benchmarkConfig.enabled ? { "Cache-Control": "no-store" } : {}),
    });
    createReadStream(f).pipe(res);
  });
  s.listen(0, "127.0.0.1", () => r(s));
});

const port = server.address().port;
const wineDebug = process.env.WINEDEBUG || "-all,+debugstr";
if (benchmarkConfig.enabled && wineDebug !== "-all,+debugstr") {
  throw new Error("BENCHMARK mode pins WINEDEBUG=-all,+debugstr");
}
const env = `%22WINEDEBUG:${wineDebug}%22`;
const extraParams = process.env.EXTRA_QUERY
  ? process.env.EXTRA_QUERY.replace(/^[?&]/, "")
  : "";
if (benchmarkConfig.enabled && /(?:^|&)jit-cache=/.test(extraParams)) {
  throw new Error("EXTRA_QUERY cannot override jit-cache in BENCHMARK mode");
}
if (benchmarkConfig.enabled && extraParams) {
  throw new Error("BENCHMARK mode forbids EXTRA_QUERY overrides");
}
const extraQuery = extraParams ? `&${extraParams}` : "";
const benchmarkQuery = benchmarkConfig.enabled
  ? `&jit-cache=${benchmarkConfig.cacheMode === "warm" ? "true" : "false"}`
  : "";
const standaloneExtraQuery = extraParams ? `?${extraParams}` : "";
const benchmarkUrl = benchmarkConfig.enabled ? (() => {
  const params = new URLSearchParams({
    overlay,
    app,
    p: "isaac-ng.exe",
    resolution: "960x540",
    sound: "false",
    storage: "memory",
    env: `"WINEDEBUG:${wineDebug}"`,
    "jit-cache": benchmarkConfig.cacheMode === "warm" ? "true" : "false",
  });
  return `http://127.0.0.1:${port}/emu/index.html?${params}`;
})() : null;
const url = benchmarkUrl || (standalonePath && process.env.STANDALONE_FILE_URL === "1"
  ? `${pathToFileURL(standalonePath).href}${standaloneExtraQuery}`
  : standalonePath
  ? `http://127.0.0.1:${port}/${standaloneExtraQuery}`
  : `http://127.0.0.1:${port}/emu/index.html?overlay=${overlayQuery}` +
    `&app=${encodeURIComponent(app)}&p=isaac-ng.exe&resolution=960x540&sound=${sound}&storage=memory&env=${env}${benchmarkQuery}${extraQuery}`);
console.log(url);

let benchmarkIdentity = null;
let benchmarkIdentitySha256 = null;
let benchmarkAssetSources = [];
if (benchmarkConfig.enabled) {
  const emu = join(web, "emu");
  const runtime = runtimeDir || emu;
  const assetSpecs = [
    ["index", "/emu/index.html", join(emu, "index.html")],
    ["shell", "/emu/boxedwine-shell.js", join(emu, "boxedwine-shell.js")],
    ["css", "/emu/boxedwine.css", join(emu, "boxedwine.css")],
    ["runtime-js", "/emu/boxedwine.js", join(runtime, "boxedwine.js")],
    ["runtime-wasm", "/emu/boxedwine.wasm", join(runtime, "boxedwine.wasm")],
    ["rootfs", "/emu/boxedwine.zip", join(emu, "boxedwine.zip")],
    ["debian-overlay", "/emu/debian10.zip", join(emu, "debian10.zip")],
    ["app", `/emu/${app}.zip`, join(emu, `${app}.zip`)],
    ["benchmark-overlay", `/emu/${benchmarkOverlayName}.zip`, benchmarkSavePath],
  ];
  if (benchmarkConfig.cacheMode === "warm") {
    assetSpecs.push(["server-jit-cache", `/emu/${app}-jit-modules.zip`, join(emu, `${app}-jit-modules.zip`)]);
  }
  benchmarkAssetSources = [];
  for (const [role, urlPath, sourcePath] of assetSpecs) {
    if (!existsSync(sourcePath)) throw new Error(`missing benchmark asset: ${sourcePath}`);
    benchmarkAssetSources.push(await fileIdentity(role, urlPath, sourcePath));
  }
  const normalizedQuery = [...new URL(url).searchParams.entries()]
    .sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey.localeCompare(rightKey) || leftValue.localeCompare(rightValue));
  const queryKeys = normalizedQuery.map(([key]) => key);
  if (new Set(queryKeys).size !== queryKeys.length) throw new Error("benchmark query contains duplicate keys");
  const input = {
    name: benchmarkConfig.inputScript,
    seed: BENCHMARK_SEED_INPUT.map(([key, scanCode]) => ({ key, scanCode, holdMs: 1000, settleMs: 500 })),
    movement: BENCHMARK_MOVEMENT_INPUT.map((event) => ({ ...event })),
  };
  benchmarkIdentity = {
    schemaVersion: 1,
    assets: benchmarkAssetSources.map(({ sourcePath: _sourcePath, ...asset }) => asset),
    execution: {
      app,
      program: "isaac-ng.exe",
      overlay: ["debian10", benchmarkOverlayName],
      resolution: "960x540",
      sound: false,
      storage: "memory",
      wineDebug,
      seed: benchmarkConfig.seed,
      seedNumeric: BENCHMARK_SEED_NUMERIC,
      cacheMode: benchmarkConfig.cacheMode,
      cacheMeaning: benchmarkConfig.cacheMode === "warm"
        ? "bundled server-cache replay in a fresh browser"
        : "server JIT cache disabled in a fresh browser",
      warmupMs: benchmarkConfig.warmupMs,
      measureMs: benchmarkConfig.measureMs,
    },
    query: normalizedQuery,
    input: { ...input, sha256: sha256Canonical(input) },
  };
  benchmarkIdentitySha256 = sha256Canonical(benchmarkIdentity);
}

const playwright = await import("playwright");
const lines = [];
let benchmarkEvidence = benchmarkConfig.enabled
  ? createBenchmarkEvidence(Number.MAX_SAFE_INTEGER)
  : null;
let benchmarkEvidenceError = null;
const benchmarkSeedInputs = [];
const suppressedConsoleLines = new Map();
const browser = await playwright.chromium.launch({ headless: true });
const page = await browser.newPage();
const cpuProfiler = cpuProfilePath
  ? await page.context().newCDPSession(page)
  : null;
let cpuProfileActive = false;
async function startCpuProfile() {
  if (!cpuProfiler || cpuProfileActive) return;
  await cpuProfiler.send("Profiler.enable");
  await cpuProfiler.send("Profiler.start");
  cpuProfileActive = true;
  console.log("CPU profile started", cpuProfilePath);
}
async function stopCpuProfile() {
  if (!cpuProfiler || !cpuProfileActive) return;
  const { profile } = await cpuProfiler.send("Profiler.stop");
  cpuProfileActive = false;
  writeFileSync(cpuProfilePath, JSON.stringify(profile));
  console.log("CPU profile saved", cpuProfilePath);
}
controlPage = page;
page.setDefaultTimeout(10000);
page.on("pageerror", async (error) => {
  lines.push(`pageerror: ${error.message}`);
  try {
    const jitLastCall = await page.evaluate(() => {
      const module = globalThis.Module;
      if (!module?._wasm_jit_debug_last_call_ptr || !module.HEAPU32) return null;
      const ptr = module._wasm_jit_debug_last_call_ptr() >>> 2;
      const tableIndex = module.HEAPU32[ptr] | 0;
      const groupId = module.wasmJitRuntimeGroupBySlot
        ? module.wasmJitRuntimeGroupBySlot.get(tableIndex)
        : undefined;
      const group = groupId === undefined || !module.wasmJitRuntimeGroups
        ? undefined
        : module.wasmJitRuntimeGroups.get(groupId);
      return {
        tableIndex,
        eip: module.HEAPU32[ptr + 1] >>> 0,
        cpuPtr: module.HEAPU32[ptr + 2] >>> 0,
        groupId: groupId === undefined ? -1 : groupId,
        groupEntry: group?.entryBySlot?.get(tableIndex) ?? -1,
      };
    });
    lines.push(`jit-last-call: ${JSON.stringify(jitLastCall)}`);
  } catch (diagnosticError) {
    lines.push(`jit-last-call-unavailable: ${diagnosticError.message}`);
  }
  writeFileSync(join(scratch, tag + ".partial.log"), lines.join("\n"));
});
page.on("crash", () => lines.push("page crash"));
page.on("console", (m) => {
  const t = m.text();
  const repetitive = /ensureContinuousNative|\[LevelGenerator\] fail|not enough dead ends|failed to generate level too often|^generate\.\.\.$/i.test(t);
  if (repetitive) {
    const signature = t.replace(/\d+/g, "#");
    const count = (suppressedConsoleLines.get(signature) || 0) + 1;
    suppressedConsoleLines.set(signature, count);
    if (count > 12) return;
  }
  lines.push(t);
  if (benchmarkConfig.enabled && lines.length - 1 >= benchmarkEvidence.seedSubmittedLineIndex) {
    try {
      updateBenchmarkEvidence(benchmarkEvidence, t, lines.length - 1);
    } catch (error) {
      benchmarkEvidenceError = error.message;
      benchmarkEvidence.error = error.message;
      benchmarkEvidence.status = "invalid-log-order";
    }
  }
  if (/ANM(?:CACHE_PROBE|_LIFECYCLE)|ISAAC_FAULT(?:_SITE)?_PROBE|WASM MAIN SYSCALL|WASM SCHED STACK|WASM THREAD (?:EXIT|DELETE)|WASM ISAAC MUTEX SLEEP|Caught exception|page fault/i.test(t)) {
    // Preserve the exact diagnostic even if the emulated process wedges immediately.
    writeFileSync(join(scratch, tag + ".partial.log"), lines.join("\n"));
  }
  if (
    /ANM(?:CACHE_PROBE|_LIFECYCLE)|ISAAC_FAULT(?:_SITE)?_PROBE|ISAAC_STUB|boxeddrv:|HQ4X|cutscene|Cutscene|TitleMenu|GameMenu|Character|ASSERT|nonblack|Window Width|SwapBuffers|direct blit|playing cutscene|main menu|Caught|page fault|ERROR|begin list|Shader Init/i.test(
      t
    )
  ) {
    console.log(">>", t.slice(0, 320));
  }
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 180000 });

async function sample(tSec) {
  const timeout = new Promise((resolve) =>
    setTimeout(
      () => resolve({ t: tSec, w: 0, h: 0, nonblack: 0, rgbRange: 0, timedOut: true }),
      15000
    )
  );
  return Promise.race([page.evaluate((t) => {
    const c = document.documentElement.classList.contains("boxedwine-direct-canvas")
      ? document.getElementById("canvas")
      : (document.getElementById("present-canvas") || document.getElementById("canvas"));
    let nonblack = 0,
      w = 0,
      h = 0,
      minRgb = 255,
      maxRgb = 0;
    if (c) {
      w = c.width;
      h = c.height;
      try {
        const context2d = c.getContext("2d");
        if (context2d) {
          const px = context2d.getImageData(0, 0, w, h).data;
          const step = Math.max(1, Math.floor((w * h) / 4096));
          for (let i = 0; i < w * h; i += step) {
            const o = i * 4;
            const rgb = px[o] + px[o + 1] + px[o + 2];
            if (rgb) nonblack++;
            minRgb = Math.min(minRgb, rgb);
            maxRgb = Math.max(maxRgb, rgb);
          }
        } else {
          const gl = c.getContext("webgl2") || c.getContext("webgl");
          if (!gl) throw new Error("canvas context unavailable");
          const px = new Uint8Array(w * h * 4);
          gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
          const step = Math.max(1, Math.floor((w * h) / 4096));
          for (let i = 0; i < w * h; i += step) {
            const o = i * 4;
            const rgb = px[o] + px[o + 1] + px[o + 2];
            if (rgb) nonblack++;
            minRgb = Math.min(minRgb, rgb);
            maxRgb = Math.max(maxRgb, rgb);
          }
        }
      } catch (e) {}
    }
    let jitLastCall = null;
    let jitThreads = null;
    try {
      if (globalThis.Module?._wasm_jit_debug_last_call_ptr && globalThis.Module.HEAPU32) {
        const ptr = globalThis.Module._wasm_jit_debug_last_call_ptr() >>> 2;
        jitLastCall = {
          tableIndex: globalThis.Module.HEAPU32[ptr] | 0,
          eip: globalThis.Module.HEAPU32[ptr + 1] >>> 0,
        };
      }
      if (globalThis.Module?._wasm_jit_debug_threads_ptr && globalThis.Module.HEAPU32) {
        const ptr = globalThis.Module._wasm_jit_debug_threads_ptr() >>> 2;
        jitThreads = [];
        for (let slot = 0; slot < 256; slot++) {
          const offset = ptr + slot * 4;
          const tid = globalThis.Module.HEAPU32[offset] >>> 0;
          if (!tid) continue;
          jitThreads.push({
            tid,
            pid: globalThis.Module.HEAPU32[offset + 1] >>> 0,
            tableIndex: globalThis.Module.HEAPU32[offset + 2] | 0,
            eip: globalThis.Module.HEAPU32[offset + 3] >>> 0,
          });
        }
      }
    } catch (e) {}
    return { t, w, h, nonblack, rgbRange: maxRgb - minRgb, jitLastCall, jitThreads };
  }, tSec), timeout]);
}

async function spamSkipKeys(rounds = 8) {
  // Prefer Enter/Space only — Escape can open pause UI and stall the cutscene.
  const keys = ["Enter", "Space"];
  try {
    await page.locator("#present-canvas").click({ position: { x: 480, y: 270 } });
  } catch (e) {}
  for (let r = 0; r < rounds; r++) {
    for (const k of keys) {
      await page.keyboard.down(k);
      await page.waitForTimeout(50);
      await page.keyboard.up(k);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(150);
  }
}

async function focusCanvas() {
  try {
    return await page.evaluate(() => {
      const canvas = document.getElementById("present-canvas") || document.getElementById("canvas");
      if (canvas) {
        canvas.tabIndex = -1;
        canvas.focus();
      }
      return document.activeElement === canvas;
    });
  } catch (e) {
    return false;
  }
}

const guestScanCodes = Object.freeze({
  Enter: 40,
  Escape: 41,
  Tab: 43,
  Space: 44,
  ArrowRight: 79,
  ArrowLeft: 80,
  ArrowDown: 81,
  ArrowUp: 82,
  a: 4,
  d: 7,
  e: 8,
  g: 10,
  j: 13,
  m: 16,
  s: 22,
  w: 26,
  3: 32,
  7: 36,
});
const navigationInputs = [];
const gameplayInputs = [];
let frameStats = null;
let benchmarkMemory = null;
let benchmarkTiming = null;

async function resetFrameStats() {
  return page.evaluate(() => {
    if (!globalThis.Module || typeof Module._boxedwine_reset_frame_stats !== "function") return false;
    Module._boxedwine_reset_frame_stats();
    return true;
  });
}

async function readFrameStats() {
  return page.evaluate(() => {
    if (!globalThis.Module || typeof Module._boxedwine_frame_sample_count !== "function" ||
        typeof Module._boxedwine_frame_delta_us !== "function") return null;
    const count = Module._boxedwine_frame_sample_count();
    const deltasUs = [];
    for (let i = 0; i < count; i++) deltasUs.push(Module._boxedwine_frame_delta_us(i));
    const sorted = deltasUs.filter((value) => value > 0).sort((a, b) => a - b);
    if (!sorted.length) return { count: 0, deltasUs: [] };
    const percentile = (p) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
    const medianUs = percentile(0.5);
    return {
      count: sorted.length,
      medianUs,
      p95Us: percentile(0.95),
      p99Us: percentile(0.99),
      maxUs: sorted[sorted.length - 1],
      medianFps: 1000000 / medianUs,
      deltasUs,
    };
  });
}

async function readBenchmarkMemory() {
  return page.evaluate(() => ({
    wasmBytes: globalThis.Module?.HEAPU8?.buffer?.byteLength ?? null,
    jsHeapBytes: globalThis.performance?.memory?.usedJSHeapSize ?? null,
    jitByteEntries: globalThis.Module?.wasmJitCache?.size ?? null,
    jitCompiledEntries: globalThis.Module?.wasmJitCompiledCache?.size ?? null,
    jitGroupEntries: globalThis.Module?.wasmJitRuntimeGroups?.size ?? null,
  }));
}

async function pressGuestKey(key, holdMs = 1000) {
  const canvasFocused = await focusCanvas();
  const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
  const scanCode = guestScanCodes[normalizedKey];
  if (!scanCode) throw new Error(`no SDL scancode for ${key}`);

  const injectState = async (down) => page.evaluate(({ scanCode, down }) => {
    const module = globalThis.Module;
    if (!module) {
      return { available: false, method: "none", value: null, error: "Module unavailable" };
    }

    let method;
    let inject;
    if (typeof module._boxedwine_inject_key === "function") {
      method = "direct-export";
      inject = (down) => module._boxedwine_inject_key(scanCode, down);
    } else if (typeof module.ccall === "function") {
      method = "ccall";
      inject = (down) =>
        module.ccall(
          "boxedwine_inject_key",
          "number",
          ["number", "number"],
          [scanCode, down]
        );
    } else {
      return { available: false, method: "none", value: null, error: "native export unavailable" };
    }

    try {
      return { available: true, method, value: Number(inject(down)) };
    } catch (error) {
      return {
        available: false,
        method,
        value: null,
        error: String(error && error.message ? error.message : error),
      };
    }
  }, { scanCode, down });

  // Use separate browser tasks for keydown and keyup. That guarantees the
  // emulation loop gets CPU time while the key is held instead of queuing both
  // transitions inside one JavaScript callback.
  const downResult = await injectState(1);
  await page.waitForTimeout(holdMs);
  const upResult = await injectState(0);
  await page.waitForTimeout(500);
  const nativeResult = {
    available: downResult.available && upResult.available,
    method: downResult.method,
    down: downResult.value,
    up: upResult.value,
    acknowledged: downResult.value === 1 && upResult.value === 1,
    error: downResult.error || upResult.error,
  };

  if (nativeResult.available) {
    const result = { key, scanCode, canvasFocused, ...nativeResult };
    console.log("native guest key", JSON.stringify(result));
    return result;
  }

  if (benchmarkConfig.enabled) {
    throw new Error(`benchmark requires native guest input for ${key}: ${nativeResult.error || "unavailable"}`);
  }

  console.log(
    "native guest key unavailable; using Playwright keyboard fallback",
    JSON.stringify({ key, scanCode, canvasFocused, ...nativeResult })
  );
  await page.keyboard.down(key);
  await page.waitForTimeout(holdMs);
  await page.keyboard.up(key);
  await page.waitForTimeout(500);
  const result = {
    key,
    scanCode,
    canvasFocused,
    available: false,
    method: "playwright-keyboard",
    down: 1,
    up: 1,
    acknowledged: true,
    nativeError:
      nativeResult.error ||
      `native returned down=${nativeResult.down}, up=${nativeResult.up}`,
  };
  console.log("browser guest key fallback", JSON.stringify(result));
  return result;
}

async function enterBenchmarkSeed() {
  benchmarkEvidence = createBenchmarkEvidence(lines.length);
  benchmarkEvidenceError = null;
  benchmarkSeedInputs.length = 0;
  for (const [key, expectedScanCode] of BENCHMARK_SEED_INPUT) {
    const result = await pressGuestKey(key, 1000);
    benchmarkSeedInputs.push({ holdMs: 1000, settleMs: 500, ...result });
    if (result.scanCode !== expectedScanCode || !result.available || !result.acknowledged ||
        !new Set(["direct-export", "ccall"]).has(result.method)) {
      throw new Error(`native benchmark seed delivery failed for ${key}`);
    }
  }
  return {
    key: "FixedSeed",
    scanCode: null,
    method: "native-sequence",
    down: 1,
    up: 1,
    available: true,
    acknowledged: true,
    sequence: benchmarkSeedInputs.map((input) => ({ ...input })),
  };
}

async function clickGuestMouse(x = 8, y = 8, holdMs = 1000) {
  const canvasFocused = await focusCanvas();
  const injectState = (down) => page.evaluate(({ x, y, down }) => {
    if (!globalThis.Module || typeof Module._boxedwine_inject_mouse !== "function") {
      return { available: false, value: null };
    }
    return { available: true, value: Number(Module._boxedwine_inject_mouse(x, y, down)) };
  }, { x, y, down });
  const downResult = await injectState(1);
  await page.waitForTimeout(holdMs);
  const upResult = await injectState(0);
  await page.waitForTimeout(500);
  const result = {
    key: "MouseLeft",
    x,
    y,
    canvasFocused,
    available: downResult.available && upResult.available,
    method: "direct-mouse-export",
    down: downResult.value,
    up: upResult.value,
    acknowledged: downResult.value === 1 && upResult.value === 1,
  };
  console.log("native guest mouse", JSON.stringify(result));
  return result;
}

const samples = [];
function savePartial() {
  writeFileSync(join(scratch, tag + ".partial.log"), lines.join("\n"));
  writeFileSync(
    join(scratch, tag + ".partial.json"),
    JSON.stringify(
      { samples, navigationInputs, gameplayInputs, lines: lines.length },
      null,
      2
    )
  );
}

let last = 0;
let cutsceneSeen = false;
let skipRounds = 0;
const stageShots = [];
let gameplayInputProved = false;
let gameplayExerciseAttempted = false;
let runStarted = false;
let floorReady = false;
let navigationStage = "boot";
let navigationStageAt = 0;
let navigationAwaitingDelivery = false;
let navigationDeliveryCount = 0;
async function advanceNavigation(nextStage, t, deliveredKeyDowns) {
  const previousStage = navigationStage;
  navigationDeliveryCount = deliveredKeyDowns;
  // The legacy native host activates a Wine window through a mouse click, but
  // that click is focus/fullscreen only: it does not dismiss Isaac's title.
  // Keep all four menu transitions as explicit Enter presses.
  let focusClick = null;
  if (previousStage === "title") {
    focusClick = await clickGuestMouse();
  }
  const delivery = benchmarkConfig.enabled && previousStage === "character"
    ? await enterBenchmarkSeed()
    : await pressGuestKey("Enter");
  if (focusClick) delivery.focusClick = focusClick;
  navigationInputs.push({ t, previousStage, nextStage, ...delivery });
  if (!delivery.acknowledged) {
    navigationStageAt = t;
    console.log(
      `guest key was not acknowledged (down=${delivery.down}, up=${delivery.up}); keeping ${previousStage}`
    );
    return false;
  }
  navigationStage = nextStage;
  navigationAwaitingDelivery = waitForX11KeyProbe;
  navigationStageAt = t;
  console.log(
    waitForX11KeyProbe
      ? `browser key bridge succeeded; waiting for X11 probe before ${nextStage}`
      : `browser key bridge succeeded; navigation advanced to ${nextStage}`
  );
  return true;
}
async function captureStage(name) {
  if (stageShots.includes(name)) return;
  const path = join(scratch, `${tag}-${name}.png`);
  try {
    const selector = await page.evaluate(() =>
      document.documentElement.classList.contains("boxedwine-direct-canvas")
        ? "#canvas" : "#present-canvas"
    );
    const png = await page.locator(selector).screenshot({ animations: "disabled" });
    // Known blank compositor captures are 2–4 KiB; real title/floor frames are
    // at least 15 KiB. Reject transitions without delaying guest navigation;
    // the next milestone retries the current stage automatically.
    if (png.length >= 8000) {
      writeFileSync(path, png);
      stageShots.push(name);
      console.log("stage screenshot", name, path, `bytes=${png.length}`);
      return true;
    }
    const rejectedPath = join(scratch, `${tag}-${name}-solid-rejected.png`);
    writeFileSync(rejectedPath, png);
    console.log("stage screenshot rejected solid frame", name, rejectedPath, `bytes=${png.length}`);
  } catch (e) {
    console.log("stage screenshot failed", name, e.message);
  }
  return false;
}

async function exerciseGameplayInput() {
  await focusCanvas();
  const schedule = benchmarkConfig.enabled
    ? BENCHMARK_MOVEMENT_INPUT
    : ["d", "s", "a", "w"].map((key) => ({ key, holdMs: 1000, settleMs: 750 }));
  for (const event of schedule) {
    const result = await pressGuestKey(event.key, event.holdMs);
    if (benchmarkConfig.enabled && (result.scanCode !== event.scanCode || !result.available || !result.acknowledged)) {
      throw new Error(`native benchmark movement failed for ${event.key}`);
    }
    gameplayInputs.push({ ...result, holdMs: event.holdMs, settleMs: event.settleMs });
    await page.waitForTimeout(250);
  }
  gameplayInputProved = gameplayInputs.every((input) => input.acknowledged);
}
// denser sampling after the typical intro/paint window so Menu Init is not missed
const milestones = [60, 120, 180, 240, 300, 315, 330, 345, 360];
for (let t = 360 + navGapSec; t <= Math.ceil(waitMs / 1000); t += navGapSec) {
  milestones.push(t);
}

for (const t of milestones) {
  if (t * 1000 > waitMs) break;
  await page.waitForTimeout((t - last) * 1000);
  last = t;

  let text = lines.join("\n");
  if (!cutsceneSeen && /playing cutscene/i.test(text)) {
    cutsceneSeen = true;
    console.log(
      "cutscene detected at t~",
      t,
      app.includes("safeintro")
        ? "-- waiting for local safe cutoff"
        : "-- skip (Enter/Space)"
    );
  }
  if (
    !app.includes("safeintro") &&
    cutsceneSeen &&
    !/Menu Manager Init/i.test(text)
  ) {
    // The first large burst crosses the slow WASM cutscene boundary reliably.
    // Smaller follow-ups keep input flowing without monopolizing the event loop.
    const firstBurst = app.includes("navprobe") ? 1 : 36;
    await spamSkipKeys(skipRounds === 0 ? firstBurst : 18);
    skipRounds++;
  }
  text = lines.join("\n");

  const snap = await sample(t);
  samples.push(snap);
  savePartial();
  const swaps = lines.filter((l) => /wglSwapBuffers/i.test(l)).length;
  const cutFrames = lines.filter((l) => /Cutscene: correct anm2/i.test(l)).length;
  const cutEnd = lines.some((l) => /Cutscene End/i.test(l));
  console.log(
    "sample",
    JSON.stringify(snap),
    "swaps",
    swaps,
    "cutFrames",
    cutFrames,
    "cutEnd",
    cutEnd
  );

  // Log menu milestones; only early-exit once Character/Game init (past Save crash).
  const menuReady =
    /Menu Title Init|Menu Manager Init|Menu Save Init|Menu Character Init|Menu Game Init/i.test(
      text
    );
  if (menuReady) {
    console.log(
      "menu milestone at t~",
      t,
      lines
        .filter((l) => /Menu \w+ Init|Caught exception|page fault/i.test(l))
        .slice(-8)
        .map((l) => l.slice(0, 120))
        .join(" | ")
    );
  }
  if (benchmarkConfig.enabled) {
    runStarted = Boolean(benchmarkEvidence.seed && !benchmarkEvidence.error);
    floorReady = Boolean(benchmarkEvidence.status === "ready" && benchmarkEvidence.guestCallback);
    if (benchmarkEvidence.error || benchmarkEvidenceError) {
      console.log("benchmark evidence failed", benchmarkEvidence.error || benchmarkEvidenceError);
      break;
    }
  } else {
    if (!runStarted && /RNG Start Seed:/i.test(text)) {
      runStarted = true;
      await resetFrameStats();
      console.log("new run started; reset guest frame probe");
    }
    const runFrameStats = runStarted ? await readFrameStats() : null;
    floorReady = Boolean(runStarted && runFrameStats && runFrameStats.count >= 30);
  }
  const gameplayReady = floorReady;
  const allMenusReady =
    /Menu Online Awards Init/i.test(text) &&
    !/Caught exception|page fault/i.test(text);
  const deliveredKeyDowns = lines.filter((line) =>
    /\[X11_KEY_PROBE\].*down=1.*delivered=1/i.test(line)
  ).length;
  if (
    waitForX11KeyProbe &&
    navigationAwaitingDelivery &&
    deliveredKeyDowns > navigationDeliveryCount
  ) {
    navigationAwaitingDelivery = false;
    navigationDeliveryCount = deliveredKeyDowns;
    navigationStageAt = t;
    console.log("guest key delivered; visible stage is now", navigationStage);
  }
  if (
    allMenusReady &&
    !gameplayReady &&
    !navigationAwaitingDelivery &&
    ["title", "save", "main-menu", "character"].includes(navigationStage)
  ) {
    await captureStage(navigationStage);
  }
  if (allMenusReady && navigationStage === "boot") {
    await captureStage("menus-loaded");
    navigationStage = "title";
    navigationStageAt = t;
  } else if (
    allMenusReady &&
    !gameplayReady &&
    !navigationAwaitingDelivery &&
    t >= navigationStageAt + navGapSec
  ) {
    if (navigationStage === "title") {
      await advanceNavigation("save", t, deliveredKeyDowns);
    } else if (navigationStage === "save") {
      await advanceNavigation("main-menu", t, deliveredKeyDowns);
    } else if (navigationStage === "main-menu") {
      await advanceNavigation("character", t, deliveredKeyDowns);
    } else if (navigationStage === "character") {
      await advanceNavigation("floor", t, deliveredKeyDowns);
    }
  }
  if (gameplayReady && !/Caught exception|page fault/i.test(text)) {
    await captureStage("floor");
  }
  if (
    gameplayReady &&
    !gameplayExerciseAttempted &&
    !/Caught exception|page fault/i.test(text)
  ) {
    gameplayExerciseAttempted = true;
    if (benchmarkConfig.enabled) {
      await exerciseGameplayInput();
      console.log(`benchmark warmup for ${benchmarkConfig.warmupMs} ms`);
      const warmupStartMs = performance.now();
      await page.waitForTimeout(benchmarkConfig.warmupMs);
      const warmupEndMs = performance.now();
      if (!await resetFrameStats()) throw new Error("benchmark frame-stat reset export unavailable");
      const memoryStart = await readBenchmarkMemory();
      const measurementStartMs = performance.now();
      await page.waitForTimeout(benchmarkConfig.measureMs);
      const measurementEndMs = performance.now();
      const rawFrameStats = await readFrameStats();
      frameStats = rawFrameStats ? summarizeFrameDeltas(rawFrameStats.deltasUs) : null;
      const memoryEnd = await readBenchmarkMemory();
      benchmarkMemory = {
        start: memoryStart,
        end: memoryEnd,
        wasmGrowthBytes: memoryStart.wasmBytes === null || memoryEnd.wasmBytes === null
          ? null : memoryEnd.wasmBytes - memoryStart.wasmBytes,
        peakIsSampled: true,
        wasmPeakBytes: Math.max(memoryStart.wasmBytes || 0, memoryEnd.wasmBytes || 0) || null,
      };
      benchmarkTiming = {
        warmup: { startMs: warmupStartMs, endMs: warmupEndMs, requestedMs: benchmarkConfig.warmupMs },
        measurement: {
          startMs: measurementStartMs,
          endMs: measurementEndMs,
          requestedMs: benchmarkConfig.measureMs,
          actualMs: measurementEndMs - measurementStartMs,
        },
      };
    } else {
      await startCpuProfile();
      if (gameplayWarmupMs) {
        console.log(`warming gameplay/JIT for ${gameplayWarmupMs} ms before measurement`);
        await page.waitForTimeout(gameplayWarmupMs);
      }
      await resetFrameStats();
      await exerciseGameplayInput();
      await page.waitForTimeout(5000);
      frameStats = await readFrameStats();
    }
    console.log("guest frame stats", JSON.stringify(frameStats));
    await captureStage("floor-moved");
    const snap2 = await sample(t + 5);
    samples.push(snap2);
    console.log("gameplay-stable sample", JSON.stringify(snap2));
    if (!benchmarkConfig.enabled) await stopCpuProfile();
    break;
  }
  // If we hit Save Init then exception, keep sampling a bit for evidence then stop.
  if (
    /Menu Save Init/i.test(text) &&
    /Caught exception|page fault/i.test(text) &&
    t >= 480
  ) {
    console.log("post-SaveInit fault -- capturing evidence and stopping");
    break;
  }
}

// Final skip burst + sample only if the cutscene never reached the menu.
if (
  !app.includes("safeintro") &&
  cutsceneSeen &&
  !/Menu Manager Init/i.test(lines.join("\n"))
) {
  for (let burst = 0; burst < 3; burst++) {
    await spamSkipKeys(10);
    await page.waitForTimeout(10000);
    savePartial();
    if (/ANM(?:CACHE_PROBE|_LIFECYCLE)|ISAAC_FAULT(?:_SITE)?_PROBE|Caught exception|page fault/i.test(lines.join("\n"))) break;
  }
  const snap = await sample(last + 10);
  samples.push(snap);
  console.log("post-skip sample", JSON.stringify(snap));
}

await stopCpuProfile();

// Screenshot for evidence
const pngPath = join(scratch, tag + ".png");
try {
  const selector = await page.evaluate(() =>
    document.documentElement.classList.contains("boxedwine-direct-canvas")
      ? "#canvas" : "#present-canvas"
  );
  await page.locator(selector).screenshot({ path: pngPath });
  console.log("screenshot", pngPath);
} catch (e) {
  console.log("screenshot failed", e.message);
}

if (exportJitCache) {
  console.log("exporting JIT cache", exportJitCache);
  const downloadPromise = page.waitForEvent("download", { timeout: 300000 });
  const started = await page.evaluate(async () => {
    if (typeof saveJitModules !== "function") return false;
    await saveJitModules();
    return true;
  });
  if (!started) throw new Error("saveJitModules is unavailable");
  const download = await downloadPromise;
  await download.saveAs(exportJitCache);
  console.log("JIT cache saved", exportJitCache);
}

const snap = samples[samples.length - 1] || { w: 0, h: 0, nonblack: 0 };
const info = lines
  .filter((l) => /OutputDebugStringA/i.test(l))
  .map((l) => {
    const m = l.match(/OutputDebugStringA \"(.*)\"/);
    return m ? m[1].slice(0, 220) : l.slice(0, 220);
  })
  .filter((l) => /INFO|ERROR|WARN|ASSERT/i.test(l));

const out = {
  snap,
  samples,
  swaps: lines.filter((l) => /wglSwapBuffers/i.test(l)).length,
  cutsceneSeen,
  cutEnd: lines.some((l) => /Cutscene End/i.test(l)),
  cutFrames: lines.filter((l) => /Cutscene: correct anm2/i.test(l)).length,
  menuHints: lines
    .filter((l) =>
      /TitleMenu|GameMenu|CharacterMenu|SaveSelect|main menu|Cutscene End|playing cutscene|Window Width/i.test(
        l
      )
    )
    .slice(0, 40),
  infoTail: info.slice(-60),
  err: lines
    .filter((l) => /PROBE|seh:|exception|page fault|null function|AnmCache/i.test(l))
    .slice(-200),
  stageShots,
  gameplayInputProved,
  navigationStage,
  navigationAwaitingDelivery,
  navigationConfirmation: waitForX11KeyProbe ? "x11-key-probe" : "browser-key-bridge",
  navGapSec,
  navigationInputs,
  gameplayInputs,
  frameStats,
  runStarted,
  floorReady,
  suppressedConsoleLines: Object.fromEntries(suppressedConsoleLines),
  crashContext: (() => {
    const index = lines.findIndex((l) =>
      /AnmCache: cannot remove|Caught exception|page fault/i.test(l)
    );
    return index < 0 ? [] : lines.slice(Math.max(0, index - 80), index + 160);
  })(),
  boxed: lines
    .filter((l) => /boxeddrv:|direct blit|Window Width|HQ4X/i.test(l))
    .slice(0, 40),
};
writeFileSync(join(scratch, tag + ".json"), JSON.stringify(out, null, 2));
writeFileSync(join(scratch, tag + ".log"), lines.join("\n"));
console.log(
  JSON.stringify(
    {
      snap: out.snap,
      samples: out.samples,
      swaps: out.swaps,
      cutsceneSeen: out.cutsceneSeen,
      cutEnd: out.cutEnd,
      cutFrames: out.cutFrames,
      menuHints: out.menuHints.slice(0, 20),
      infoTail: out.infoTail.slice(-30),
      err: out.err,
    },
    null,
    2
  )
);
await browser.close();
server.close();
