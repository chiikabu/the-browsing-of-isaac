/**
 * Minimal static file server with optional COOP/COEP for future pthreads.
 * Serves web/ as the site root, plus decomp integration mounts:
 *   /@decomp/wasm/*     → output/decomp/wasm-slice/*
 *   /@decomp/pure/*     → output/decomp/* (pure-helper Wasm modules)
 *   /@decomp/scripts/*  → scripts/decomp/*
 * so the browser frame path can fetch the zero-import Update slice, pure
 * helper modules for non-Update roots, and ES modules.
 */
import http from "node:http";
import { readFileSync, existsSync, statSync, readdirSync, rmSync, mkdirSync, writeFileSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname, resolve, dirname, normalize, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const root = resolve(projectRoot, "web");
const decompWasmRoot = resolve(projectRoot, "output", "decomp", "wasm-slice");
const decompPureRoot = resolve(projectRoot, "output", "decomp");
const decompScriptsRoot = resolve(projectRoot, "scripts", "decomp");
const isolate = process.env.COOP_COEP === "1";
export const SERVE_HOST = "127.0.0.1";

/* Saved game instance auto-mount: the browser page fetches the game from
   the fresh instance archived in game-instance/isaac-phase6-full.zip
   (extracted into the ignored .scratch/game-instance/) instead of mounting
   a Steam install. Nothing from any Steam library is ever read. An explicit
   $ISAAC_GAME_ROOT (or .game-root file) still overrides the zip for other
   machines; otherwise the zip is the only source. $ISAAC_INSTANCE_ZIP
   overrides the archive location itself. */
function detectGameRoot() {
  const explicit = process.env.ISAAC_GAME_ROOT;
  if (explicit) return explicit;
  try {
    const cfg = readFileSync(join(projectRoot, ".game-root"), "utf8").trim();
    if (cfg) return cfg;
  } catch {
    /* optional */
  }
  return null;
}

const instanceZip =
  process.env.ISAAC_INSTANCE_ZIP ||
  join(projectRoot, "game-instance", "isaac-phase6-full.zip");
const instanceRoot = join(projectRoot, ".scratch", "game-instance");

function instanceMarker() {
  try {
    const m = JSON.parse(
      readFileSync(join(instanceRoot, ".extracted.json"), "utf8")
    );
    if (m && m.source === instanceZip) {
      const st = statSync(instanceZip);
      if (m.size === st.size && m.mtimeMs === st.mtimeMs) return true;
    }
  } catch {
    /* not extracted yet */
  }
  return false;
}

function extractInstance() {
  if (!existsSync(instanceZip)) return null;
  if (instanceMarker()) return instanceRoot;
  const tmp = instanceRoot + ".tmp";
  try {
    rmSync(tmp, { recursive: true, force: true });
    mkdirSync(tmp, { recursive: true });
    execFileSync("tar", ["-xf", instanceZip, "-C", tmp], { stdio: "ignore" });
    const st = statSync(instanceZip);
    writeFileSync(
      join(tmp, ".extracted.json"),
      JSON.stringify({ source: instanceZip, size: st.size, mtimeMs: st.mtimeMs })
    );
    rmSync(instanceRoot, { recursive: true, force: true });
    renameSync(tmp, instanceRoot);
    return instanceRoot;
  } catch (e) {
    try {
      rmSync(tmp, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    console.error(`game instance extraction failed: ${e.message}`);
    return null;
  }
}

let gameRoot = detectGameRoot(); // explicit override only
let instanceReady = null;
if (!gameRoot) {
  // Lazy async: extract the saved instance in the background so the server
  // starts listening immediately; the first /@game* request awaits it.
  instanceReady = new Promise((resolveInstance) => {
    // Defer one tick: extractInstance() is synchronous (tar of ~600 MB) and
    // must not block module load / server listen.
    setTimeout(() => {
      const root = extractInstance();
      gameRoot = root;
      resolveInstance(root);
    }, 0);
  });
}
async function waitForGameRoot() {
  if (instanceReady) await instanceReady;
  return gameRoot;
}

function listGameFiles() {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, name.name);
      if (name.isDirectory()) {
        walk(p);
      } else if (name.isFile()) {
        files.push({
          path: p.slice(gameRoot.length).replace(/^[\\/]+/, "").replace(/\\/g, "/"),
          size: statSync(p).size,
        });
      }
    }
  };
  walk(gameRoot);
  files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return files;
}

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".wasm": "application/wasm",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".map": "application/json",
};

function safeJoin(base, relativePath) {
  const cleaned = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const file = resolve(base, cleaned);
  if (!file.startsWith(base)) return null;
  return file;
}

function sendFile(res, file) {
  if (!file || !existsSync(file) || statSync(file).isDirectory()) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const ext = extname(file);
  res.writeHead(200, {
    "Content-Type": types[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(readFileSync(file));
}

function createServer() {
  return http.createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      try {
        res.writeHead(500);
        res.end(String(error && error.message ? error.message : error));
      } catch {
        /* reply already sent */
      }
    });
  });
}

async function handleRequest(req, res) {
    if (isolate) {
      res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    }
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/") urlPath = "/index.html";

    // Local Isaac install auto-mount (browser native frame path). When the
    // server can see the Steam install, the page mounts it automatically.
    if (urlPath === "/@game-index.json") {
      if (!(await waitForGameRoot())) {
        res.writeHead(404);
        res.end("no game root configured");
        return;
      }
      const files = listGameFiles();
      const rootName =
        gameRoot === instanceRoot && existsSync(instanceZip)
          ? basename(instanceZip).replace(/\.zip$/, "")
          : basename(gameRoot);
      res.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" });
      res.end(
        JSON.stringify({
          ok: true,
          rootName,
          files,
        })
      );
      return;
    }
    if (urlPath.startsWith("/@game/")) {
      if (!(await waitForGameRoot())) {
        res.writeHead(404);
        res.end("no game root configured");
        return;
      }
      const rel = urlPath.slice("/@game/".length);
      sendFile(res, safeJoin(gameRoot, rel));
      return;
    }

    // Decomp integration mounts (browser native frame path).
    if (urlPath.startsWith("/@decomp/wasm/")) {
      const rel = urlPath.slice("/@decomp/wasm/".length);
      sendFile(res, safeJoin(decompWasmRoot, rel));
      return;
    }
    if (urlPath.startsWith("/@decomp/pure/")) {
      const rel = urlPath.slice("/@decomp/pure/".length);
      sendFile(res, safeJoin(decompPureRoot, rel));
      return;
    }
    if (urlPath.startsWith("/@decomp/scripts/")) {
      const rel = urlPath.slice("/@decomp/scripts/".length);
      sendFile(res, safeJoin(decompScriptsRoot, rel));
      return;
    }

    const file = join(root, urlPath.replace(/^\//, ""));
    if (!file.startsWith(root) || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404);
      res.end("not found");
      return;
    }
    const ext = extname(file);
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(readFileSync(file));
}

export function startServer({ port = Number(process.env.PORT || 8765), log = console.log } = {}) {
  const server = createServer();
  return new Promise((resolveStart, rejectStart) => {
    const onError = (error) => rejectStart(error);
    server.once("error", onError);
    server.listen(port, SERVE_HOST, () => {
      server.off("error", onError);
      const address = server.address();
      const listeningPort = typeof address === "object" && address ? address.port : port;
      log(`Serving ${root} at http://${SERVE_HOST}:${listeningPort}/`);
      resolveStart(server);
    });
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
