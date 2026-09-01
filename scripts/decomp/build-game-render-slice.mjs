import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/* Build the Game::Render ROOT SLICE (ABI from game-render-model.mjs) and
   write output/decomp/game-render-slice/abi.json. The artifact is served at
   /@decomp/pure/game-render-slice/game-render-slice.wasm (scripts/serve.mjs)
   and driven per frame by web/js/native-update-bridge.js on the SAME
   JS-owned Game buffer as the Update session (0x3bb20 <= 0x68d70).
   Zero-import gate: a render slice that imports anything is not a root
   slice and the build fails. */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const sliceSource = join(root, "native", "decomp", "game_render_slice.cpp");
const helperSource = join(root, "native", "decomp", "render_shell_pure_helpers.cpp");
const includeDir = join(root, "native", "decomp");
const output = join(root, "output", "decomp", "game-render-slice");
const wasmPath = join(output, "game-render-slice.wasm");

const EXPORTS = [
  "isaac_game_render_slice_capture", "isaac_game_render_slice_apply",
  "isaac_game_render_slice_step",
  "isaac_game_render_slice_resume_fade_prep",
  "isaac_game_render_slice_resume_fade_stage",
  "isaac_game_render_slice_resume_fade_polls",
  "isaac_game_render_slice_boost_74efd0_al",
  "isaac_game_render_slice_resume_boost_74efd0",
  "isaac_game_render_slice_resume_boost_827bc0",
  "isaac_game_render_slice_resume_fade_close",
  "isaac_game_render_slice_resume_tree_erase",
  "isaac_game_render_slice_resume_entity",
  "isaac_game_render_slice_resume_grid",
  "isaac_game_render_slice_resume_overlay_gate",
  "isaac_game_render_slice_resume_aux_gate",
  "isaac_game_render_slice_resume_aux_polls",
  "isaac_game_render_slice_resume_817830_gate",
  "isaac_game_render_slice_817830_slot_offset",
  "isaac_game_render_slice_resume_817830_prefix",
  "isaac_game_render_slice_resume_817830_a14050_value",
  "isaac_game_render_slice_817830_kage_hash",
  "isaac_game_render_slice_resume_817830_lroom_pack",
  "isaac_game_render_slice_resume_rt_pop_begin",
  "isaac_game_render_slice_resume_rt_pop_check",
  "isaac_game_render_slice_resume_rt_pop_final",
  "isaac_game_render_slice_resume_epilog",
  "isaac_game_render_slice_resume_epilog_final",
  "isaac_game_render_slice_resume_sprite_pair_a",
  "isaac_game_render_slice_resume_shared_ptr",
  "isaac_game_render_slice_resume_room_type",
  "isaac_game_render_slice_resume_once_init",
  "isaac_game_render_slice_abi_version",
  "isaac_game_render_slice_state_size",
  "isaac_game_render_slice_runtime_inputs_size",
  "isaac_game_render_slice_events_size",
  "isaac_game_render_slice_game_object_min_size",
  "isaac_game_render_slice_root_va",
  "isaac_game_render_slice_entity_render_va",
  "isaac_game_render_slice_host_is_vtable",
  "isaac_game_render_slice_continuation_needs_recapture",
];

function firstExisting(paths, label) {
  const found = paths.find((path) => path && existsSync(path));
  if (!found) throw new Error(`${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

function run(executable, args, label) {
  const result = spawnSync(executable, args, { cwd: root, stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${label} failed with status ${result.status}`);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
const clang = firstExisting([
  process.env.CLANGXX,
  join(emsdk, "upstream", "bin", "clang++.exe"),
], "Host clang++");
const emxx = firstExisting([
  process.env.EMXX,
  join(emsdk, "upstream", "emscripten", "em++.exe"),
], "Emscripten em++");

mkdirSync(output, { recursive: true });
run(clang, [sliceSource, `-I${includeDir}`, "-std=c++20", "-fsyntax-only", "-Wall", "-Wextra", "-Werror"], "render slice host syntax check");
run(clang, [helperSource, `-I${includeDir}`, "-std=c++20", "-fsyntax-only", "-Wall", "-Wextra", "-Werror"], "render shell pure helper syntax check");

const exportArgs = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
run(emxx, [
  sliceSource,
  helperSource,
  `-I${includeDir}`,
  "-std=c++20",
  "-O2",
  "--no-entry",
  "-sSTANDALONE_WASM=1",
  "-sERROR_ON_UNDEFINED_SYMBOLS=1",
  ...exportArgs,
  "-o", wasmPath,
], "render slice wasm build");

const module = new WebAssembly.Module(readFileSync(wasmPath));
const imports = WebAssembly.Module.imports(module);
if (imports.length !== 0) {
  throw new Error(`render slice must be zero-import, found ${imports.length}`);
}
const instance = new WebAssembly.Instance(module, {});
const abi = {
  schemaVersion: 1,
  root: "Game::Render",
  source: "native/decomp/game_render_slice.cpp",
  helpersSource: "native/decomp/render_shell_pure_helpers.cpp",
  sourceSha256: sha256(sliceSource),
  helpersSourceSha256: sha256(helperSource),
  wasmSha256: sha256(wasmPath),
  wasmBytes: readFileSync(wasmPath).length,
  abiVersion: instance.exports.isaac_game_render_slice_abi_version(),
  stateSize: instance.exports.isaac_game_render_slice_state_size(),
  runtimeInputsSize: instance.exports.isaac_game_render_slice_runtime_inputs_size(),
  eventsSize: instance.exports.isaac_game_render_slice_events_size(),
  gameObjectMinSize: instance.exports.isaac_game_render_slice_game_object_min_size(),
  rootVa: "0x" + instance.exports.isaac_game_render_slice_root_va().toString(16),
  entityRenderVa: "0x" + instance.exports.isaac_game_render_slice_entity_render_va().toString(16),
  imports: [],
  exports: WebAssembly.Module.exports(module).map(({ name }) => name),
};
writeFileSync(join(output, "abi.json"), `${JSON.stringify(abi, null, 2)}\n`);
console.log(`Built ${wasmPath} (${abi.wasmBytes} bytes, abi v${abi.abiVersion}, ${abi.exports.length} exports)`);
