import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* Verify the Game::Render ROOT SLICE wiring end to end:
     1. build-game-render-slice.mjs  -> zero-import abi.json artifact;
     2. the render slice differential (tests/decomp-game-render-slice.test.js);
     3. the frame-path wiring surface (tests/decomp-frame-render-root.test.js,
        tests/decomp-frame-path-render-wiring.test.js) — loader, driver vs
        oracle, shared-buffer session, bridge per-frame drive, non-fatal
        missing module.
   Emits output/decomp/game-render-slice/verification.json.
   The root slice is a typed-host ABI, NOT a PE-free render: host kinds (GL
   bind / entity / grid / RT pops / 817830) are counted events. */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const output = join(root, "output", "decomp", "game-render-slice");
const wasmPath = join(output, "game-render-slice.wasm");
const abiPath = join(output, "abi.json");

const build = spawnSync(process.execPath, [join(root, "scripts", "decomp", "build-game-render-slice.mjs")], { cwd: root, stdio: "inherit" });
if (build.error) throw build.error;
if (build.status !== 0) throw new Error(`render slice build failed with status ${build.status}`);

const testFiles = [
  "tests/decomp-game-render-slice.test.js",
  "tests/decomp-frame-render-root.test.js",
  "tests/decomp-frame-path-render-wiring.test.js",
];
const run = spawnSync(process.execPath, ["--test", ...testFiles], { cwd: root, encoding: "utf8" });
const stdout = run.stdout || "";
const pass = run.status === 0;

const summary = {
  pass: (stdout.match(/pass (\d+)/) || [])[1] || "0",
  fail: (stdout.match(/fail (\d+)/) || [])[1] || "0",
  tests: (stdout.match(/tests (\d+)/) || [])[1] || "0",
};

const wasmBytes = readFileSync(wasmPath);
const module = new WebAssembly.Module(wasmBytes);
const instance = new WebAssembly.Instance(module, {});
const abiVersion = instance.exports.isaac_game_render_slice_abi_version();
const abi = JSON.parse(readFileSync(abiPath, "utf8"));

const report = {
  schemaVersion: 1,
  root: "Game::Render",
  result: pass ? "pass" : "fail",
  command: `node --test ${testFiles.join(" ")}`,
  abiVersion,
  wasmSha256: createHash("sha256").update(wasmBytes).digest("hex"),
  wasmBytes: wasmBytes.length,
  zeroImports: WebAssembly.Module.imports(module).length === 0,
  gameObjectMinSize: instance.exports.isaac_game_render_slice_game_object_min_size(),
  abi: {
    stateSize: abi.stateSize,
    runtimeInputsSize: abi.runtimeInputsSize,
    eventsSize: abi.eventsSize,
    rootVa: abi.rootVa,
    entityRenderVa: abi.entityRenderVa,
    exports: abi.exports.length,
  },
  tests: summary,
  suites: ["render slice differential", "frame render root driver", "frame path render wiring"],
  timestamp: new Date().toISOString(),
};
mkdirSync(output, { recursive: true });
writeFileSync(join(output, "verification.json"), JSON.stringify(report, null, 2) + "\n");
if (!pass) {
  console.error(stdout.slice(-4000));
  throw new Error(`render slice verification FAILED (${summary.fail} failing tests)`);
}
console.log(`RENDER SLICE VERIFIED — ${summary.tests} tests, ${summary.pass} pass, ABI ${abiVersion}, zero-import ${report.zeroImports}`);
