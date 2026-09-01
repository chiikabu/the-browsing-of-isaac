import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as M from "../scripts/decomp/game-render-model.mjs";
import * as RS from "../scripts/decomp/render-shell-pure-model.mjs";

/* Game render root slice ABI v3 — differential against the independent JS
   oracle, JSON coherence, sparse capture/apply census, recapture-discipline
   pins, wasm byte-width discipline (wide unmasked drives), and native-side
   mutation checks.

   v2 delta: the three poll sites (top pair VA 0x0080eb3e/0x0080eb43, fade
   pair VA 0x0080ed15/0x0080ed1e, aux pair VA 0x0080f158/0x0080f161) and the
   overlay 0x0074ea50 probe + 0x00812d00 Vector producer are pure-complete at
   render-shell helper ABI v31 and run inside the resumes from sparse runtime
   inputs (presence bytes + per-site manager words + Room sparse reads).
   resume_overlay_probe / resume_overlay_draw no longer exist; the top-poll
   host events are gone (their results are DISCARDED by the PE at VA 0x0080eb48).

   v3 delta: the 0x00817830 aux-body entrance is a typed host chain now —
   exact-ZHL Game::GetStageID @ 0x00738470 (host 29, receiver echoed
   inputs.datC71678, push 0) then pure resume_817830_gate (continuation 25)
   over the POST-CALL reads: empty stage slot closes natively at VA 0x0081def9
   (bodySkipped=1, RT_POP arg0 1), stage set {4,5,6,0x1b,0x1c} + room word54
   signed >= 0 + room flags bit5 opens, else comiss [Game+0x7240] > +0.0
   (NaN closes). isaac_game_render_slice_817830_slot_offset pins the 0x13c
   stride (imul low 32). Both aux open routes feed the new host chain.

   ROOT SLICE ABI, NOT A PE-FREE RENDER. Nothing here is wired into the live
   frame loop and no performance claim is made. */


const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sliceSource = join(root, "native", "decomp", "game_render_slice.cpp");
/* Wave-26 hardening (update-v102-hardening GAP D): 120-attempt retried
   source write so a crashed/failed mutant restore can never strand a
   mutant in the tracked game_render_slice.cpp (Windows open-lock
   EUNKNOWN class; room/anm2 convention). */
const writeSourceRetry = (content) => {
  for (let attempt = 0; ; ++attempt) {
    try {
      writeFileSync(sliceSource, content, "utf8");
      return;
    } catch (e) {
      if (attempt >= 120) throw e;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0,
        Math.min(25 * (attempt + 1), 500));
    }
  }
};
const helperSource = join(root, "native", "decomp", "render_shell_pure_helpers.cpp");
const outDir = join(root, "output", "decomp", "game-render-slice");
const wasmPath = join(outDir, "game-render-slice.wasm");
const jsonPath = join(root, "decomp", "game-render-slice.json");

function firstExisting(paths, label) {
  const found = paths.find((p) => p && existsSync(p));
  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

const EXPORTS = [
  "isaac_game_render_slice_capture",
  "isaac_game_render_slice_apply",
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
  "isaac_game_render_slice_resume_817830_type9_cell1",
  "isaac_game_render_slice_resume_817830_type9_cell2",
  "isaac_game_render_slice_resume_817830_type9_cell3",
  "isaac_game_render_slice_resume_817830_type9_cell4",
  "isaac_game_render_slice_resume_817830_type9_cell5",
  "isaac_game_render_slice_resume_817830_type9_cell6",
  "isaac_game_render_slice_resume_817830_type9_a102e0_0",
  "isaac_game_render_slice_resume_817830_type9_a102e0_1",
  "isaac_game_render_slice_resume_817830_type9_a102e0_2",
  "isaac_game_render_slice_resume_817830_type9_a102e0_3",
  "isaac_game_render_slice_resume_817830_type9_a106e0",
  "isaac_game_render_slice_resume_817830_type9_a106e0_2",
  "isaac_game_render_slice_resume_817830_type9_a102e0_4",
  "isaac_game_render_slice_resume_817830_type9_a102e0_5",
  "isaac_game_render_slice_resume_817830_type9_a102e0_6",
  "isaac_game_render_slice_resume_817830_type9_a102e0_7",
  "isaac_game_render_slice_resume_817830_type9_a102e0_8",
  "isaac_game_render_slice_resume_817830_type9_a102e0_9",
  "isaac_game_render_slice_resume_817830_type9_a102e0_10",
  "isaac_game_render_slice_resume_817830_type9_a102e0_11",
  "isaac_game_render_slice_resume_817830_type9_a106e0_3",
  "isaac_game_render_slice_resume_817830_type9_a106e0_4",
  "isaac_game_render_slice_resume_817830_type9_a102e0_12",
  "isaac_game_render_slice_resume_817830_type9_a102e0_13",
  "isaac_game_render_slice_resume_817830_type9_a102e0_14",
  "isaac_game_render_slice_resume_817830_type9_a102e0_15",
  "isaac_game_render_slice_resume_817830_type9_a102e0_16",
  "isaac_game_render_slice_resume_817830_type9_a102e0_17",
  "isaac_game_render_slice_resume_817830_type9_a102e0_18",
  "isaac_game_render_slice_resume_817830_type9_a102e0_19",
  "isaac_game_render_slice_resume_817830_type9_a102e0_20",
  "isaac_game_render_slice_resume_817830_type9_a102e0_21",
  "isaac_game_render_slice_resume_817830_type9_a102e0_22",
  "isaac_game_render_slice_resume_817830_type9_a102e0_23",
  "isaac_game_render_slice_resume_817830_type9_a102e0_24",
  "isaac_game_render_slice_resume_817830_type9_a102e0_25",
  "isaac_game_render_slice_resume_817830_type9_a102e0_26",
  "isaac_game_render_slice_resume_817830_type9_a102e0_27",
  "isaac_game_render_slice_resume_817830_type9_a102e0_29",
  "isaac_game_render_slice_resume_817830_type9_a102e0_30",
  "isaac_game_render_slice_resume_817830_type9_a106e0_8",
  "isaac_game_render_slice_resume_817830_type9_a102e0_31",
  "isaac_game_render_slice_resume_817830_type9_a102e0_32",
  "isaac_game_render_slice_resume_817830_type9_a102e0_33",
  "isaac_game_render_slice_resume_817830_type9_a102e0_34",
  "isaac_game_render_slice_resume_817830_type9_a106e0_9",
  "isaac_game_render_slice_resume_817830_type9_a102e0_37",
  "isaac_game_render_slice_resume_817830_type9_a102e0_38",
  "isaac_game_render_slice_resume_817830_type9_a106e0_10",
  "isaac_game_render_slice_resume_817830_type9_a102e0_42",
  "isaac_game_render_slice_resume_817830_type9_a106e0_11",
  "isaac_game_render_slice_resume_817830_type9_a102e0_43",
  "isaac_game_render_slice_resume_817830_type9_a102e0_44",
  "isaac_game_render_slice_resume_817830_type9_a102e0_45",
  "isaac_game_render_slice_resume_817830_type9_a102e0_46",
  "isaac_game_render_slice_resume_817830_type9_a106e0_12",
  "isaac_game_render_slice_resume_817830_type9_a102e0_47",
  "isaac_game_render_slice_resume_817830_type9_a102e0_48",
  "isaac_game_render_slice_resume_817830_type9_a102e0_49",
  "isaac_game_render_slice_resume_817830_type9_a102e0_50",
  "isaac_game_render_slice_resume_817830_type9_a102e0_51",
  "isaac_game_render_slice_resume_817830_type9_a102e0_52",
  "isaac_game_render_slice_resume_817830_type9_a102e0_53",
  "isaac_game_render_slice_resume_817830_type9_a102e0_54",
  "isaac_game_render_slice_resume_817830_type9_a102e0_55",
  "isaac_game_render_slice_resume_817830_type9_a102e0_56",
  "isaac_game_render_slice_resume_817830_type9_a102e0_57",
  "isaac_game_render_slice_resume_817830_type9_a102e0_58",
  "isaac_game_render_slice_resume_817830_type9_a102e0_59",
  "isaac_game_render_slice_resume_817830_type9_a102e0_60",
  "isaac_game_render_slice_resume_817830_type9_a102e0_61",
  "isaac_game_render_slice_resume_817830_type9_a102e0_62",
  "isaac_game_render_slice_resume_817830_type9_a102e0_63",
  "isaac_game_render_slice_resume_817830_type9_a102e0_64",
  "isaac_game_render_slice_resume_817830_type9_a102e0_65",
  "isaac_game_render_slice_resume_817830_type9_a102e0_66",
  "isaac_game_render_slice_resume_817830_type9_a102e0_67",
  "isaac_game_render_slice_resume_817830_type9_a102e0_68",
  "isaac_game_render_slice_resume_817830_type9_a102e0_69",
  "isaac_game_render_slice_resume_817830_type9_a102e0_70",
  "isaac_game_render_slice_resume_817830_type9_a102e0_71",
  "isaac_game_render_slice_resume_817830_type9_a102e0_72",
  "isaac_game_render_slice_resume_817830_type9_a102e0_73",
  "isaac_game_render_slice_resume_817830_type9_a102e0_74",
  "isaac_game_render_slice_resume_817830_type9_a102e0_75",
  "isaac_game_render_slice_resume_817830_type9_a102e0_76",
  "isaac_game_render_slice_resume_817830_type9_a102e0_77",
  "isaac_game_render_slice_resume_817830_type9_a102e0_78",
  "isaac_game_render_slice_resume_817830_type9_a102e0_79",
  "isaac_game_render_slice_resume_817830_type9_a102e0_80",
  "isaac_game_render_slice_resume_817830_type9_a102e0_81",
  "isaac_game_render_slice_resume_817830_type9_a102e0_82",
  "isaac_game_render_slice_resume_817830_type9_a102e0_83",
  "isaac_game_render_slice_resume_817830_type9_a102e0_84",
  "isaac_game_render_slice_resume_817830_type9_a102e0_85",
  "isaac_game_render_slice_resume_817830_type9_a102e0_86",
  "isaac_game_render_slice_resume_817830_type9_a102e0_87",
  "isaac_game_render_slice_resume_817830_type9_a102e0_88",
  "isaac_game_render_slice_resume_817830_type9_a102e0_89",
  "isaac_game_render_slice_resume_817830_type9_a102e0_90",
  "isaac_game_render_slice_resume_817830_type9_a102e0_91",
  "isaac_game_render_slice_resume_817830_type9_a102e0_92",
  "isaac_game_render_slice_resume_817830_type9_a102e0_93",
  "isaac_game_render_slice_resume_817830_type9_a102e0_94",
  "isaac_game_render_slice_resume_817830_type9_a102e0_95",
  "isaac_game_render_slice_resume_817830_type9_a102e0_96",
  "isaac_game_render_slice_resume_817830_type9_a102e0_97",
  "isaac_game_render_slice_resume_817830_type9_a102e0_98",
  "isaac_game_render_slice_resume_817830_type9_a102e0_99",
  "isaac_game_render_slice_resume_817830_type9_a102e0_100",
  "isaac_game_render_slice_resume_817830_type9_a102e0_101",
  "isaac_game_render_slice_resume_817830_type9_a102e0_102",
  "isaac_game_render_slice_resume_817830_type9_a102e0_103",
  "isaac_game_render_slice_resume_817830_type9_a102e0_104",
  "isaac_game_render_slice_resume_817830_type9_a102e0_105",
  "isaac_game_render_slice_resume_817830_type9_a102e0_106",
  "isaac_game_render_slice_resume_817830_type9_a102e0_107",
  "isaac_game_render_slice_resume_817830_type9_a102e0_108",
  "isaac_game_render_slice_resume_817830_type9_a102e0_109",
  "isaac_game_render_slice_resume_817830_type9_a102e0_40",
  "isaac_game_render_slice_resume_817830_type9_a102e0_41",
  "isaac_game_render_slice_resume_817830_type9_a102e0_39",
  "isaac_game_render_slice_resume_817830_type9_a102e0_35",
  "isaac_game_render_slice_resume_817830_type9_a102e0_36",
  "isaac_game_render_slice_resume_817830_type9_a106e0_7",
  "isaac_game_render_slice_resume_817830_type9_a102e0_28",
  "isaac_game_render_slice_resume_817830_lroom_join_9394",
  "isaac_game_render_slice_lroom_gate_type10_eq",
  "isaac_game_render_slice_resume_817830_type9_a106e0_5",
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

function buildWasm() {
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting([
    process.env.CLANGXX,
    join(emsdk, "upstream", "bin", "clang++.exe"),
    join(emsdk, "upstream", "bin", "clang++"),
  ], "Host clang++");
  const emxx = firstExisting([
    process.env.EMXX,
    join(emsdk, "upstream", "emscripten", "em++.exe"),
    join(emsdk, "upstream", "emscripten", "em++"),
  ], "Emscripten em++");
  const syntax = spawnSync(clang, [
    sliceSource,
    "-std=c++20",
    "-I", join(root, "native", "decomp"),
    "-fsyntax-only",
    "-Wall",
    "-Wextra",
    "-Werror",
  ], { cwd: root, encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  const exportArgs = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
  const built = spawnSync(emxx, [
    sliceSource,
    helperSource,
    "-std=c++20",
    "-O2",
    "-I", join(root, "native", "decomp"),
    "--no-entry",
    "-sSTANDALONE_WASM=1",
    "-sERROR_ON_UNDEFINED_SYMBOLS=1",
    ...exportArgs,
    "-o", wasmPath,
  ], { cwd: root, encoding: "utf8" });
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

let exp;
let view;
function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(
    WebAssembly.Module.imports(module).length,
    0,
    "game render slice wasm must be zero-import",
  );
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const out = { memory: wasm.memory };
  for (const name of EXPORTS) {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    out[name] = fn;
  }
  return out;
}

/* Scratch layout — everything at 0x100000+ (below sits module data and the
   64 KiB emscripten shadow stack; low writes corrupt them SILENTLY).
   A_EVENTS (1368 bytes / 0x4b0) ends at 0x1006b0 -- exactly 16 bytes
   under the seq base, so the buffers HOLD this unit (v56: events grew
   864 -> 888 bytes, seq bumped 0x100560 -> 0x100580; v57: -> 912
   bytes, seq -> 0x1005a0; v58: -> 936 bytes, seq -> 0x1005c0; v59:
   -> 960 bytes, seq -> 0x1005e0; v60: -> 984 bytes, seq -> 0x100600;
   v61: -> 1008 bytes, held at 16-byte margin; v62: -> 1032 bytes,
   seq -> 0x100620; v63: -> 1056 bytes, seq -> 0x100640; v64: -> 1080
   bytes, seq -> 0x100660; v65: -> 1104 bytes, held at 16-byte margin;
   v66: -> 1128 bytes, seq -> 0x100680; v67: -> 1152 bytes, seq ->
   0x1006a0; v68: -> 1176 bytes, seq -> 0x1006c0; v69: -> 1200 bytes,
   HELD at the same 16-byte margin -- next unit (1224/0x4c0) MUST
   bump). */
const A_STATE = 0x100000;
const A_INPUTS = 0x100100;
const A_EVENTS = 0x100200;
const A_BASE_SEQ = 0x100800;
const A_COUNT_SEQ = 0x100900;
const A_OUT_SLOTS = 0x100a00;
const A_GRID_SLOTS = 0x100c00;
const A_OUT_TYPE = 0x101300;
const A_GAME = 0x110000;
const A_74F690_OBJ = 0x160000;

const u32 = (v) => (v ?? 0) >>> 0;

function writeStruct(addr, fields, obj) {
  for (let i = 0; i < fields.length; i += 1) {
    view.setUint32(addr + i * 4, u32(obj[fields[i]]), true);
  }
}
function readStruct(addr, fields) {
  const out = {};
  for (let i = 0; i < fields.length; i += 1) {
    out[fields[i]] = view.getUint32(addr + i * 4, true);
  }
  return out;
}
function writeSeq(addr, arr) {
  for (let i = 0; i < arr.length; i += 1) view.setUint32(addr + i * 4, u32(arr[i]), true);
}

function compareEvents(label, jsEv) {
  const wasmEv = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
  for (const f of M.GAME_RENDER_EVENT_FIELDS) {
    assert.equal(wasmEv[f] >>> 0, u32(jsEv[f]), `${label}: events.${f}`);
  }
  return wasmEv;
}

const f32bits = (v) => {
  const b = new DataView(new ArrayBuffer(4));
  b.setFloat32(0, Math.fround(v), true);
  return b.getUint32(0, true);
};
const fwdOfF32 = (bits) => {
  const b = new DataView(new ArrayBuffer(4));
  b.setUint32(0, bits >>> 0, true);
  return b.getFloat32(0, true);
};

function defaultInputs() {
  const o = {};
  for (const f of M.GAME_RENDER_INPUT_FIELDS) o[f] = 0;
  return o;
}
function defaultState() {
  const o = {};
  for (const f of M.GAME_RENDER_STATE_FIELDS) o[f] = 0;
  return o;
}

/* Drive one chain entry on BOTH sides and compare the full events block. */
function makeRnd(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
}

function both(label, state, inputs, call) {
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, state);
  writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, inputs);
  const jsEv = call.js();
  call.wasm();
  return { wasmEv: compareEvents(label, jsEv), jsEv };
}

test("build, ABI pins, JSON coherence", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);

  assert.equal(M.GAME_RENDER_SLICE_ABI_VERSION, 73);
  assert.equal(exp.isaac_game_render_slice_abi_version() >>> 0, 73);
  assert.equal(exp.isaac_game_render_slice_state_size() >>> 0,
    M.GAME_RENDER_STATE_FIELDS.length * 4);
  assert.equal(exp.isaac_game_render_slice_runtime_inputs_size() >>> 0,
    M.GAME_RENDER_INPUT_FIELDS.length * 4);
  assert.equal(exp.isaac_game_render_slice_events_size() >>> 0,
    M.GAME_RENDER_EVENT_FIELDS.length * 4);
  assert.equal(exp.isaac_game_render_slice_state_size() >>> 0, 108);
  assert.equal(exp.isaac_game_render_slice_runtime_inputs_size() >>> 0, 248);
  assert.equal(exp.isaac_game_render_slice_events_size() >>> 0, 1368);
  assert.equal(exp.isaac_game_render_slice_game_object_min_size() >>> 0,
    M.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  assert.equal(exp.isaac_game_render_slice_root_va() >>> 0, 0x0080ea80);
  assert.equal(exp.isaac_game_render_slice_entity_render_va() >>> 0, 0x00806c20);
  assert.equal(M.GAME_RENDER_VA_SHELL, 0x0080ea80);
  assert.equal(M.GAME_RENDER_VA_ENTITY_RENDER, 0x00806c20);

  /* vtable + recapture truth tables: wasm vs model over every kind */
  for (let k = 0; k <= 47; k += 1) {
    assert.equal(exp.isaac_game_render_slice_host_is_vtable(k),
      M.gameRenderHostIsVtable(k) ? 1 : 0, `vtable kind ${k}`);
  }
  for (let c = 0; c <= 61; c += 1) {
    assert.equal(exp.isaac_game_render_slice_continuation_needs_recapture(c),
      M.gameRenderContinuationNeedsRecapture(c), `recapture cont ${c}`);
  }
  /* the folded-bound discipline is structural: the entity/tree/grid
     continuations REQUIRE recapture and the terminal ones do not */
  assert.equal(exp.isaac_game_render_slice_continuation_needs_recapture(
    M.GAME_RENDER_CONTINUE_AT_TREE_ERASE), 1);
  assert.equal(exp.isaac_game_render_slice_continuation_needs_recapture(
    M.GAME_RENDER_CONTINUE_AT_ENTITY), 1);
  assert.equal(exp.isaac_game_render_slice_continuation_needs_recapture(
    M.GAME_RENDER_CONTINUE_AT_GRID_ENTRY), 1);
  assert.equal(exp.isaac_game_render_slice_continuation_needs_recapture(
    M.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0), 0);
  /* v2: the overlay gate is the SINGLE overlay recapture; the removed probe/
     draw hosts must not be referenced anywhere in the ABI surface */
  assert.equal(M.gameRenderContinuationNeedsRecapture(
    M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE), 1);

  /* JSON coherence */
  const json = JSON.parse(readFileSync(jsonPath, "utf8"));
  assert.equal(json.abiVersion, M.GAME_RENDER_SLICE_ABI_VERSION);
  assert.equal(json.rootVa, "0x0080ea80");
  assert.equal(json.rootSymbol, "opaque_call_0080ea80");
  assert.equal(parseInt(json.gameObjectMinSize, 16),
    M.GAME_RENDER_GAME_OBJECT_MIN_SIZE);
  /* every JSON field offset matches the model's sparse window */
  const offByName = {
    gameMode: M.GAME_RENDER_OFF.gameMode,
    gridW: M.GAME_RENDER_OFF.gridW,
    gridH: M.GAME_RENDER_OFF.gridH,
    flag11f6: M.GAME_RENDER_OFF.flag11f6,
    cameraBaseX: M.GAME_RENDER_OFF.cameraBaseX,
    cameraBaseY: M.GAME_RENDER_OFF.cameraBaseY,
    entityArrayEntry: M.GAME_RENDER_OFF.entityArray,
    entityCountEntry: M.GAME_RENDER_OFF.entityCount,
    fadeSrcR: M.GAME_RENDER_OFF.fadeSrcR,
    fadeSrcG: M.GAME_RENDER_OFF.fadeSrcG,
    fadeSrcB: M.GAME_RENDER_OFF.fadeSrcB,
    fadeSrcA: M.GAME_RENDER_OFF.fadeSrcA,
    fadeWord1b6c: M.GAME_RENDER_OFF.fadeWord6c,
    fadeDstR: M.GAME_RENDER_OFF.fadeDstR,
    fadeDstG: M.GAME_RENDER_OFF.fadeDstG,
    fadeDstB: M.GAME_RENDER_OFF.fadeDstB,
    fadeDstA: M.GAME_RENDER_OFF.fadeDstA,
    stage1d18: M.GAME_RENDER_OFF.stage1d18,
    overlaySwapFlag: M.GAME_RENDER_OFF.overlaySwapFlag,
    overlayScaleX: M.GAME_RENDER_OFF.overlayScaleX,
    overlayScaleY: M.GAME_RENDER_OFF.overlayScaleY,
    overlayColorWhite: M.GAME_RENDER_OFF.overlayColor,
    overlayDrawFlag: M.GAME_RENDER_OFF.overlayDrawFlag,
    treeHead7308: M.GAME_RENDER_OFF.treeHead,
    treeCount730c: M.GAME_RENDER_OFF.treeCount,
  };
  for (const f of json.fields) {
    assert.ok(f.name in offByName, `unknown JSON field ${f.name}`);
    assert.equal(parseInt(f.binaryOffset, 16), offByName[f.name],
      `JSON offset for ${f.name}`);
  }
  assert.equal(json.fields.length, Object.keys(offByName).length,
    "JSON fields must cover exactly the recovered sparse window");
  /* continuation table: requiresRecapture mirrors the exported truth */
  for (const c of json.continuations) {
    assert.equal(
      exp.isaac_game_render_slice_continuation_needs_recapture(c.kind),
      c.requiresRecapture ? 1 : 0,
      `JSON requiresRecapture kind ${c.kind} (${c.name})`,
    );
  }
  /* host events: the mega-event and the vtable entries stay unresolved */
  const entity = json.hostEvents.find(
    (h) => h.kind === M.GAME_RENDER_HOST_ENTITY_806C20);
  assert.equal(entity.zhl, "Game::Render");
  assert.equal(entity.targetVa, "0x00806c20");
  for (const h of json.hostEvents) {
    if (h.dispatch === "vtable") {
      assert.equal(h.targetVa, "UNRESOLVED",
        `vtable host ${h.name} must not guess a target`);
      assert.equal(exp.isaac_game_render_slice_host_is_vtable(h.kind), 1);
    }
  }
  /* v2 removed the four pure hosts from the event table entirely */
  const names = json.hostEvents.map((h) => h.name);
  for (const gone of ["poll6f9400", "poll6f95a0", "stage74ea50", "stage812d00"]) {
    assert.ok(!names.includes(gone), `v1 host ${gone} must be gone`);
  }
  const contNames = json.continuations.map((c) => c.name);
  for (const gone of ["atTopPolls", "at74ea50", "at812d00"]) {
    assert.ok(!contNames.includes(gone), `v1 continuation ${gone} must be gone`);
  }
  assert.equal(json.runtimeInputs.length, M.GAME_RENDER_INPUT_FIELDS.length,
    "JSON runtimeInputs must cover every model input field");
  for (const ri of json.runtimeInputs) {
    assert.ok(M.GAME_RENDER_INPUT_FIELDS.includes(ri.name),
      `unknown JSON runtime input ${ri.name}`);
  }
  /* no FPS / no wired-in claim */
  assert.match(json.status, /Not wired into the live frame loop/);
  assert.match(json.status, /no performance claim/);
});

test("sparse capture/apply census (byte-preserving, marker-gated)", () => {
  const size = M.GAME_RENDER_GAME_OBJECT_MIN_SIZE;
  /* deterministic fill */
  let seed = 0x5eed0001;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const mem = new Uint8Array(exp.memory.buffer);
  for (let i = 0; i < size; i += 1) mem[A_GAME + i] = (rnd() >>> 24) & 0xff;
  const snapshot = mem.slice(A_GAME, A_GAME + size);

  /* capture parity */
  assert.equal(exp.isaac_game_render_slice_capture(A_GAME, size, A_STATE), 1);
  const wasmState = readStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS);
  const gameView = new DataView(exp.memory.buffer, A_GAME, size);
  const jsState = M.gameRenderCapture(gameView, size);
  for (const f of M.GAME_RENDER_STATE_FIELDS) {
    assert.equal(wasmState[f] >>> 0, u32(jsState[f]), `capture.${f}`);
  }
  /* size guard */
  assert.equal(exp.isaac_game_render_slice_capture(A_GAME, size - 1, A_STATE), 0);
  assert.equal(M.gameRenderCapture(gameView, size - 1), null);

  /* apply with NO markers: every byte preserved */
  assert.equal(exp.isaac_game_render_slice_apply(A_STATE, A_GAME, size), 1);
  for (let i = 0; i < size; i += 1) {
    if (mem[A_GAME + i] !== snapshot[i]) {
      assert.fail(`apply with no markers touched byte 0x${i.toString(16)}`);
    }
  }

  /* flag marker: exactly one byte, low 8 bits only (wide value masked) */
  const st = { ...wasmState, flagCleared: 1, flag11f6: 0x1a00 };
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, st);
  exp.isaac_game_render_slice_apply(A_STATE, A_GAME, size);
  const diffs = [];
  for (let i = 0; i < size; i += 1) {
    if (mem[A_GAME + i] !== snapshot[i]) diffs.push(i);
  }
  assert.deepEqual(diffs, [M.GAME_RENDER_OFF.flag11f6]);
  assert.equal(mem[A_GAME + M.GAME_RENDER_OFF.flag11f6], 0x00,
    "wide flag value writes its LOW BYTE");
  mem.set(snapshot, A_GAME);

  /* tree marker: exactly the count dword */
  const st2 = { ...wasmState, treeCleared: 1, treeCount730c: 0 };
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, st2);
  exp.isaac_game_render_slice_apply(A_STATE, A_GAME, size);
  const diffs2 = [];
  for (let i = 0; i < size; i += 1) {
    if (mem[A_GAME + i] !== snapshot[i]) diffs2.push(i);
  }
  for (const d of diffs2) {
    assert.ok(d >= M.GAME_RENDER_OFF.treeCount && d < M.GAME_RENDER_OFF.treeCount + 4,
      `tree apply touched 0x${d.toString(16)}`);
  }
  assert.equal(view.getInt32(A_GAME + M.GAME_RENDER_OFF.treeCount, true), 0);
  mem.set(snapshot, A_GAME);

  /* overlay marker: scales + the 0x2c-byte white block, nothing else */
  const st3 = {
    ...wasmState, overlayWritten: 1,
    overlayScaleXBits: f32bits(1.5), overlayScaleYBits: f32bits(-2.25),
  };
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, st3);
  exp.isaac_game_render_slice_apply(A_STATE, A_GAME, size);
  const expected = new Set();
  for (let i = 0; i < 4; i += 1) expected.add(M.GAME_RENDER_OFF.overlayScaleX + i);
  for (let i = 0; i < 4; i += 1) expected.add(M.GAME_RENDER_OFF.overlayScaleY + i);
  for (let i = 0; i < 0x2c; i += 1) expected.add(M.GAME_RENDER_OFF.overlayColor + i);
  for (let i = 0; i < size; i += 1) {
    const changed = mem[A_GAME + i] !== snapshot[i];
    if (changed && !expected.has(i)) {
      assert.fail(`overlay apply touched 0x${i.toString(16)}`);
    }
  }
  assert.equal(view.getUint32(A_GAME + M.GAME_RENDER_OFF.overlayColor, true), 0x3f800000);
  assert.equal(view.getUint32(A_GAME + M.GAME_RENDER_OFF.overlayColor + 0x28, true), 0);
  /* JS apply produces byte-identical results on a copy */
  const copy = new Uint8Array(snapshot);
  const copyView = new DataView(copy.buffer);
  M.gameRenderApply(
    Object.fromEntries(M.GAME_RENDER_STATE_FIELDS.map((f) => [f, st3[f]])),
    copyView, size);
  for (let i = 0; i < size; i += 1) {
    assert.equal(mem[A_GAME + i], copy[i], `js/wasm apply byte 0x${i.toString(16)}`);
  }
  mem.set(snapshot, A_GAME);
});


test("chain fixed scenarios (PE-truth pins + wide byte drives)", () => {
  const S = defaultState();
  const I = defaultInputs();

  /* G0 closed � wide option byte 0x100 has a ZERO low byte (PE cmp byte).
     The skip path still hosts the epilog chain. */
  let r = both("G0 wide-closed", S, { ...I, option2a3c3: 0x100 }, {
    js: () => M.gameRenderStep(S, { ...I, option2a3c3: 0x100 }),
    wasm: () => exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_EPILOG_825DE0);
  assert.equal(r.wasmEv.bodySkipped, 1);
  assert.equal(r.wasmEv.hostVa >>> 0, 0x00825de0);

  /* G0 open via wide 0x101 (byte 1): BOTH paths (fade NaN and fade > 0)
     take the RT rebind cluster. The top polls at VA 0x0080eb3e/0x0080eb43
     are pure READ-ONLY calls whose results the PE DISCARDS (eax overwritten
     at VA 0x0080eb48) � v2 emits no poll event on either path. */
  const nan = 0x7fc00000;
  r = both("G1 NaN", S, { ...I, option2a3c3: 0x101, mgrFade26518Bits: nan }, {
    js: () => M.gameRenderStep(S, { ...I, option2a3c3: 0x101, mgrFade26518Bits: nan }),
    wasm: () => exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_REBIND);
  r = both("G1 fade-open", S,
    { ...I, option2a3c3: 1, mgrFade26518Bits: f32bits(0.5) }, {
      js: () => M.gameRenderStep(S, { ...I, option2a3c3: 1, mgrFade26518Bits: f32bits(0.5) }),
      wasm: () => exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS),
    });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_REBIND);

  /* fade prep: bit9 override pack {0,0,0} + word50 zero (G2) */
  r = both("prep bit9", S, I, {
    js: () => M.gameRenderResumeFadePrep(S, I, f32bits(0.25), f32bits(0.5),
      f32bits(0.75), f32bits(1), 0xabcd1234, 1 << 9),
    wasm: () => exp.isaac_game_render_slice_resume_fade_prep(A_STATE, A_INPUTS,
      f32bits(0.25), f32bits(0.5), f32bits(0.75), f32bits(1), 0xabcd1234,
      1 << 9, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeLocalRBits, 0);
  assert.equal(r.wasmEv.fadeWord50, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BIND_A1DFD0);

  /* prep without bit9 keeps the re-read locals; bit9 tests EXACTLY bit 9 */
  r = both("prep no-bit9", S, I, {
    js: () => M.gameRenderResumeFadePrep(S, I, 0x11, 0x22, 0x33, 0x44, 0x55, 1 << 8),
    wasm: () => exp.isaac_game_render_slice_resume_fade_prep(A_STATE, A_INPUTS,
      0x11, 0x22, 0x33, 0x44, 0x55, 1 << 8, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeLocalRBits, 0x11);
  assert.equal(r.wasmEv.fadeWord50, 0x55);

  /* fade stage: c79904 cmove (bit2 CLEAR -> 6), stage39 fan-out, camera */
  const inpC = { ...I, datC798e4: 0xfb, mgrCamX2650cBits: f32bits(2),
    mgrCamY2650cBits: 0, mgrCamY26510Bits: f32bits(3) };
  r = both("stage39", S, inpC, {
    js: () => M.gameRenderResumeFadeStage(S, inpC, 0x39, f32bits(10), f32bits(20), 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_stage(A_STATE, A_INPUTS,
      0x39, f32bits(10), f32bits(20), 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.gC79904Value, 6, "c798e4 bit2 clear selects 6");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_STAGE39);
  assert.equal(r.wasmEv.hostReceiver, 0x776c);
  assert.equal(r.wasmEv.cameraXBits >>> 0, f32bits(12));
  assert.equal(r.wasmEv.cameraYBits >>> 0, f32bits(23));
  const inpC2 = { ...I, datC798e4: 0x104 };
  r = both("c79904 wide bit2", S, inpC2, {
    js: () => M.gameRenderResumeFadeStage(S, inpC2, 3, 0, 0, 1 << 9),
    wasm: () => exp.isaac_game_render_slice_resume_fade_stage(A_STATE, A_INPUTS,
      3, 0, 0, 1 << 9, A_EVENTS),
  });
  assert.equal(r.wasmEv.gC79904Value, 1, "bit2 set selects 1 (full-word test, not a byte)");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY,
    "bit9 of the SECOND flags read skips the fade block");
  assert.equal(r.wasmEv.needsRecapture, 1);


  /* fade polls (v2 pure): 6f9400/6f95a0 masks assembled from the sparse
     presence bytes + the manager words READ AT THE POLL SITE. The presence
     bytes are x86 byte tests: wide values keep their low byte. */
  const inpP = { ...I, mgrMode26584: 0, mgrWord0Now: 3, mgrDifficulty269c8: 0,
    mgrFade2651cBits: f32bits(0.5), mgrFade26518Bits: f32bits(0.25) };
  /* presence39 (poll-A bit1) is gate39-gated; gate39 open (stage 3 odd
     < 8, mode != 0x2c, difficulty not 2/3) -> bit1 set -> P4b combined
     bit0 CLEAR -> base is the plain product, not the select 1.0f. */
  r = both("polls bit1-only", S, { ...inpP, present39: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present39: 1 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollABits, 0x02, "presence39 -> poll-A bit1 (gate open)");
  assert.equal(r.wasmEv.pollSelectsOne, 0, "P4b tests bit0 only");
  assert.equal(r.wasmEv.fadeBaseBits >>> 0, f32bits(0.125));
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);

  /* gate39 CLOSED (mode == 0x2c) kills the bit39 presence -> pollA = 0 */
  r = both("polls gate39 closed", S, { ...inpP, mgrMode26584: 0x2c, present39: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, mgrMode26584: 0x2c, present39: 1 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollABits, 0, "mode 0x2c closes gate39");

  /* presence46 replaces the whole B mask with 0x7f; presence4f ORs bit6 */
  r = both("polls present46", S, { ...inpP, present46: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present46: 1 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollBBits, 0x7f, "0x46 present replaces the whole B mask");
  r = both("polls present4f", S, { ...inpP, present46: 1, present4f: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present46: 1, present4f: 1 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollBBits, 0x7f | 0x40, "0x4f ORs bit6 after the replace");

  /* presence bytes are BYTE semantics (the PE loads a byte; the ABI takes
     uint32 and re-narrows in the body): 0x101 IS present, 0x100 is NOT. */
  r = both("polls wide present38", S, { ...inpP, present38: 0x100 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present38: 0x100 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollABits, 0, "0x100 -> byte 0 -> NOT present");
  assert.equal(r.wasmEv.pollSelectsOne, 0);
  assert.equal(r.wasmEv.fadeBaseBits >>> 0, f32bits(0.125), "plain product");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);
  r = both("polls wide present38b", S, { ...inpP, present38: 0x101 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present38: 0x101 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollABits, 0x01, "0x101 -> byte 1 -> IS present");
  assert.equal(r.wasmEv.pollSelectsOne, 1);
  assert.equal(r.wasmEv.fadeBaseBits >>> 0, 0x3f800000, "select -> exactly 1.0f");

  /* select open (presence38) + Game+8 == 8 opens the boost without probes */
  r = both("polls select + mode8", S, { ...inpP, present38: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present38: 1 }, 8),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      8, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollSelectsOne, 1);
  assert.equal(r.wasmEv.fadeBoost, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
  /* mode 0x1d also opens; 0x1e does not */
  r = both("mode 1d", S, inpP, {
    js: () => M.gameRenderResumeFadePolls(S, inpP, 0x1d),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0x1d, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeBoost, 1);
  assert.equal(r.wasmEv.pollSelectsOne, 0);
  r = both("mode 1e", S, inpP, {
    js: () => M.gameRenderResumeFadePolls(S, inpP, 0x1e),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0x1e, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeBoost, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);

  /* pollB bit0 (presence3f) suppresses the select even with pollA bit0 */
  r = both("polls notB", S, { ...inpP, present38: 1, present3f: 1 }, {
    js: () => M.gameRenderResumeFadePolls(S, { ...inpP, present38: 1, present3f: 1 }, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollSelectsOne, 0, "pollB bit0 suppresses the select");

  /* v5: the 0x74efd0 probe BODY is pure. boost_74efd0_al differential —
     every PE branch of FUN_0074efd0 (VA 0x0074efd0..0x0074f02e) pinned. */
  const probeIn = (over) => ({
    ...I, mgrMode26584: 0, mgrDifficulty269c8: 0, mgrWord0Now: 4,
    mgrWord1Now: 5, mgrFlags2654c: 0, mgr26550: 0, mgrWord0c: 0,
    present38: 0, present39: 0, present3a: 0, present3b: 0, present3c: 0,
    present3d: 0, present3e: 0, present3f: 0, present40: 0, present41: 0,
    present42: 0, present43: 0, present44: 0, present46: 0, present4f: 0,
    ...over,
  });
  const probeAl = (over) => {
    const inp = probeIn(over);
    writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
    writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, inp);
    const js = M.gameRenderBoost74efd0Al(inp);
    const wasm = exp.isaac_game_render_slice_boost_74efd0_al(A_INPUTS) >>> 0;
    assert.equal(wasm, js, `boost_74efd0_al ${JSON.stringify(over)}`);
    return wasm;
  };
  /* difficulty == 2 / 3 -> AL=0 (VA 0x74efdf/0x74efe4), wide 0x102 opens */
  assert.equal(probeAl({ mgrDifficulty269c8: 2 }), 0, "diff 2 closes");
  assert.equal(probeAl({ mgrDifficulty269c8: 3 }), 0, "diff 3 closes");
  assert.equal(probeAl({ mgrDifficulty269c8: 0x102 }), 1, "wide diff 0x102 opens");
  /* (this0-1) unsigned <= 5 && flags bit16 -> AL=0 (VA 0x74f003) */
  assert.equal(probeAl({ mgrWord0Now: 1, mgrFlags2654c: 0x10000 }), 0,
    "this0=1 + bit16 closes");
  /* the (this0-1)<=5 test is observable ONLY at this0 in {3,4}: elsewhere
     the post-flag path yields 0 anyway, so 5/6/7/0/0x100 all pin the law
     but do not discriminate (documented, not asserted as 1). */
  assert.equal(probeAl({ mgrWord0Now: 7, mgrFlags2654c: 0x10000 }), 0,
    "this0=7 skips the flag test and falls to the 0 tail");
  assert.equal(probeAl({ mgrWord0Now: 0, mgrFlags2654c: 0x10000 }), 0,
    "this0=0 wraps unsigned -> skips the flag test, 0 tail");
  assert.equal(probeAl({ mgrWord0Now: 0x100, mgrFlags2654c: 0x10000 }), 0,
    "this0=0x100 skips the flag test, 0 tail");
  assert.equal(probeAl({ mgrWord0Now: 4, mgrFlags2654c: 0x10000 }), 0,
    "bit16 closes the this0==4 arm");
  assert.equal(probeAl({ mgrWord0Now: 3, mgrFlags2654c: 0x10000, mgr26550: 2 }), 0,
    "bit16 closes the this0==3 poll arm before the combine");
  assert.equal(probeAl({ mgrWord0Now: 4, mgrFlags2654c: 0x1000 }), 1,
    "flags bit12 does NOT close");
  /* this4 must be 4 or 5 (VA 0x74f008/0x74f00d) */
  assert.equal(probeAl({ mgrWord1Now: 3 }), 0, "this4=3 closes");
  assert.equal(probeAl({ mgrWord1Now: 6 }), 0, "this4=6 closes");
  assert.equal(probeAl({ mgrWord1Now: 4 }), 1, "this4=4 opens");
  /* this0==4 -> AL=1; this0==5 -> AL=0 (VA 0x74f012/0x74f017) */
  assert.equal(probeAl({ mgrWord0Now: 5 }), 0, "this0=5 closes");
  /* this0==3 -> bit2 of the 0x748490 poll combine (VA 0x74f01e/0x74f023) */
  /* 0x74f023 is test al,2: VALUE 2 (bit1), i.e. poll-A's GATED present39
     or mgr_or bit1 — present3a (value 4) never triggers. */
  assert.equal(probeAl({ mgrWord0Now: 3, mgr26550: 2 }), 1,
    "mgr_or bit1 via mgr26550 opens");
  assert.equal(probeAl({ mgrWord0Now: 3, mgrWord0c: 2 }), 1,
    "mgr_or bit1 via mgr+0xc opens");
  assert.equal(probeAl({ mgrWord0Now: 3, present39: 1 }), 1,
    "poll-A value-2 (present39, gate open) opens");
  assert.equal(probeAl({ mgrWord0Now: 3, present39: 0x101 }), 1,
    "wide presence 0x101 IS present");
  assert.equal(probeAl({ mgrWord0Now: 3, present39: 0x100 }), 0,
    "wide presence 0x100 is byte 0 -> no value-2");
  assert.equal(probeAl({ mgrWord0Now: 3, present3a: 1 }), 0,
    "present3a (value 4) does NOT match test al,2");
  assert.equal(probeAl({ mgrWord0Now: 3, present40: 1 }), 0,
    "poll-B value-2 (present40) suppresses the combine");
  assert.equal(probeAl({ mgrWord0Now: 3 }), 0, "no value-2 anywhere -> AL=0");
  assert.equal(probeAl({}), 1, "this0=4/this4=5 default opens");

  /* resume gate: AL true + RE-READ [mgr+0x1830c] == 1 -> boost + FADE_CLOSE */
  r = both("probeA boost", S, probeIn({ mgr1830c: 1 }), {
    js: () => M.gameRenderResumeBoost74efd0(S, probeIn({ mgr1830c: 1 }), 1),
    wasm: () => exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE,
      A_INPUTS, 1, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeBoost, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_FADE_CLOSE);
  /* AL true but the RE-READ manager word != 1 -> probe B (wide 2 and 0x101) */
  r = both("probeA mgr-mismatch", S, probeIn({ mgr1830c: 2 }), {
    js: () => M.gameRenderResumeBoost74efd0(S, probeIn({ mgr1830c: 2 }), 2),
    wasm: () => exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE,
      A_INPUTS, 2, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_827BC0);
  r = both("probeA mgr-wide", S, probeIn({ mgr1830c: 0x101 }), {
    js: () => M.gameRenderResumeBoost74efd0(S, probeIn({ mgr1830c: 0x101 }), 0x101),
    wasm: () => exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE,
      A_INPUTS, 0x101, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_827BC0,
    "mgr1830c 0x101 != 1 -> probe B");
  /* AL false (difficulty 2) + mgr word == 1 -> probe B */
  r = both("probeA al-false", S, probeIn({ mgrDifficulty269c8: 2, mgr1830c: 1 }), {
    js: () => M.gameRenderResumeBoost74efd0(S,
      probeIn({ mgrDifficulty269c8: 2, mgr1830c: 1 }), 1),
    wasm: () => exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE,
      A_INPUTS, 1, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeBoost, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_827BC0);
  /* the fade-polls else path no longer emits a host (v5) */
  r = both("polls else no-host", S, inpP, {
    js: () => M.gameRenderResumeFadePolls(S, inpP, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
      0, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_NONE,
    "v5: 0x74efd0 body is pure, no host event");
  /* probe B wide AL */
  r = both("probeB wide", S, I, {
    js: () => M.gameRenderResumeBoost827bc0(S, I, 0xff00),
    wasm: () => exp.isaac_game_render_slice_resume_boost_827bc0(A_STATE, A_INPUTS,
      0xff00, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeBoost, 0, "AL byte of 0xff00 is 0");


  /* fade close: minss/maxss NaN pins + G12 force + lerp + c379b8. */
  const inpF = { ...I, mgrWord0: 0x0d, mgrWord1: 1, mgr67734Bits: 0 };
  /* minss: NaN base + boost -> (NaN + 0.6) = NaN -> minss(NaN, 1.0) = 1.0 */
  r = both("close NaN boost", S, inpF, {
    js: () => M.gameRenderResumeFadeClose(S, inpF, nan, 1, 1 << 2,
      0, 0, 0, 0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
      nan, 1, 1 << 2, 0, 0, 0, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeForceFull, 0, "flags bit2 SET blocks the force");
  assert.equal(r.wasmEv.fadeTBits >>> 0, 0x3f800000,
    "minss(NaN, 1.0) is the SECOND operand");
  /* no boost, NaN base -> t = maxss(NaN, 0) = 0 (second operand) */
  r = both("close NaN max", S, I, {
    js: () => M.gameRenderResumeFadeClose(S, I, nan, 0, 0,
      0, 0, 0, 0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
      nan, 0, 0, 0, 0, 0, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeTBits, 0, "maxss(NaN, 0) is the SECOND operand");
  /* G12 force with snapshot words + bit2 clear; alpha is the RAW 1b7c */
  r = both("close force", S, inpF, {
    js: () => M.gameRenderResumeFadeClose(S, inpF, f32bits(0.25), 0, 0,
      f32bits(0.5), f32bits(0.75), f32bits(1), f32bits(0.1),
      f32bits(0.2), f32bits(0.3), 0xdeadbeef),
    wasm: () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
      f32bits(0.25), 0, 0, f32bits(0.5), f32bits(0.75), f32bits(1),
      f32bits(0.1), f32bits(0.2), f32bits(0.3), 0xdeadbeef, A_EVENTS),
  });
  assert.equal(r.wasmEv.fadeForceFull, 1);
  assert.equal(r.wasmEv.fadeTBits >>> 0, 0x3f800000, "forced fade is exactly 1.0f");
  assert.equal(r.wasmEv.fadeColorBitsR >>> 0, f32bits(0.5), "t=1 lerp lands on src");
  assert.equal(r.wasmEv.fadeColorBitsA >>> 0, 0xdeadbeef, "alpha is the RAW re-read");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_COLOR_BIND);
  assert.equal(r.wasmEv.hostReceiver, 0x1618);

  /* c379b8: snap null -> no store; wide byte 0x100 has bit0 CLEAR */
  const inpBnull = { ...I, datC379b8Snap: 0, datC379b8Now: 0x777 };
  r = both("c379b8 null", S, inpBnull, {
    js: () => M.gameRenderResumeFadeClose(S, inpBnull, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.c379b8StoreApplied, 0);
  assert.equal(r.wasmEv.c379b8NextValue >>> 0, 0x777);
  r = both("c379b8 wide snap", S, { ...I, datC379b8Snap: 0x9000, datC379b8Now: 0x777 }, {
    js: () => M.gameRenderResumeFadeClose(S, { ...I, datC379b8Snap: 0x9000, datC379b8Now: 0x777 },
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.c379b8StoreApplied, 1, "store runs whenever snap != 0");
  assert.equal(r.wasmEv.c379b8NextValue >>> 0, 0x777,
    "snapshot byte 0x100 has bit0 clear -> keep the current global");

  /* tree erase: head echo + posts + args */
  r = both("tree erase", S, I, {
    js: () => M.gameRenderResumeTreeErase(S, I, 0xcafe0000, 0x1234),
    wasm: () => exp.isaac_game_render_slice_resume_tree_erase(A_STATE, A_INPUTS,
      0xcafe0000, 0x1234, A_EVENTS),
  });
  assert.equal(r.wasmEv.treeHead >>> 0, 0xcafe0000);
  assert.equal(r.wasmEv.treePostsApplied, 1);
  assert.equal(r.wasmEv.hostArg0, 0x7308);
  assert.equal(r.wasmEv.hostArg1, 0x1234);
  assert.equal(r.wasmEv.hostVa >>> 0, 0x00424540);

  /* RT pop: depth 1 -> 0 clears the base; depth 0 wraps and does NOT */
  const inpR1 = { ...I, datC79790: 1 };
  r = both("rt pop 1", S, inpR1, {
    js: () => M.gameRenderResumeRtPopFinal(S, inpR1),
    wasm: () => exp.isaac_game_render_slice_resume_rt_pop_final(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.rtDepthAfter, 0);
  assert.equal(r.wasmEv.rtBaseCleared, 1);
  const inpR0 = { ...I, datC79790: 0 };
  r = both("rt pop 0 wraps", S, inpR0, {
    js: () => M.gameRenderResumeRtPopFinal(S, inpR0),
    wasm: () => exp.isaac_game_render_slice_resume_rt_pop_final(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.rtDepthAfter >>> 0, 0xffffffff,
    "sub wraps; cmove sees ZF clear");
  assert.equal(r.wasmEv.rtBaseCleared, 0);
  /* rt pop check: refreshed depth zero logs a diagnostic */
  r = both("rt pop check", S, inpR0, {
    js: () => M.gameRenderResumeRtPopCheck(S, inpR0),
    wasm: () => exp.isaac_game_render_slice_resume_rt_pop_check(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.rtAssertNeeded, 1);
  assert.equal(r.wasmEv.hostArg0 >>> 0, 0x00b655e4);
  assert.equal(r.wasmEv.hostArg1, 0x10);

  /* epilog one-shot: byte value == 1 EXACTLY, wide drives too */
  for (const [flagValue, fires] of [[0, 0], [1, 1], [2, 0], [0xff, 0],
    [0x100, 0], [0x101, 1], [0x201, 1], [0xffffff01, 1], [0x1ff, 0]]) {
    r = both(`epilog ${flagValue}`, S, I, {
      js: () => M.gameRenderResumeEpilog(S, flagValue),
      wasm: () => exp.isaac_game_render_slice_resume_epilog(A_STATE, flagValue, A_EVENTS),
    });
    assert.equal(r.wasmEv.flag11f6Cleared, fires, `oneshot fires(${flagValue})`);
    assert.equal(r.wasmEv.continuationKind,
      fires ? M.GAME_RENDER_CONTINUE_AT_EPILOG_826AE0
            : M.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  }
  r = both("epilog final", S, I, {
    js: () => M.gameRenderResumeEpilogFinal(S),
    wasm: () => exp.isaac_game_render_slice_resume_epilog_final(A_STATE, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0);
  assert.equal(r.wasmEv.hostVa >>> 0, 0x00820fd0);
});


test("entity loop recapture semantics (fold not expressible)", () => {
  const S = defaultState();
  const runBoth = (label, entry, baseSeq, countSeq) => {
    writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
    writeSeq(A_BASE_SEQ, baseSeq);
    writeSeq(A_COUNT_SEQ, countSeq);
    const js = M.gameRenderResumeEntity(S, entry, baseSeq, countSeq);
    exp.isaac_game_render_slice_resume_entity(A_STATE, entry, A_BASE_SEQ,
      A_COUNT_SEQ, Math.min(baseSeq.length, countSeq.length), A_OUT_SLOTS, A_EVENTS);
    const wasmEv = compareEvents(label, js);
    const slots = [];
    for (let i = 0; i < js.slots.length; i += 1) {
      slots.push(view.getUint32(A_OUT_SLOTS + i * 4, true));
    }
    assert.deepEqual(slots, js.slots.map((s) => s >>> 0), `${label}: slots`);
    return { wasmEv, js };
  };

  /* entry gate closed: no iteration, straight to the grid recapture */
  let r = runBoth("entry 0", 0, [1], [1]);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GRID_ENTRY);
  assert.equal(r.wasmEv.entityRenderCalls, 0);

  /* gate open with no samples: at least one host call required, never
     invented */
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
  const jsNo = M.gameRenderResumeEntity(S, 3, [], []);
  exp.isaac_game_render_slice_resume_entity(A_STATE, 3, 0, 0, 0, A_OUT_SLOTS, A_EVENTS);
  compareEvents("no samples", jsNo);
  assert.equal(jsNo.sampleExhausted, 1);
  assert.equal(jsNo.continuationKind, M.GAME_RENDER_CONTINUE_AT_ENTITY);

  /* shrink: entry says 5, the count re-read after call 2 says 2 -> stops.
     A folded [0,5) reading would run 5 calls; the recapture stops at 2. */
  r = runBoth("shrink", 5, [0x1000, 0x1000, 0x1000, 0x1000, 0x1000],
    [5, 2, 2, 2, 2]);
  assert.equal(r.wasmEv.entityRenderCalls, 2);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GRID_ENTRY);

  /* grow: entry says 2 but the re-read count after call 2 says 5 -> the
     PE keeps looping; with only 2 samples supplied the slice reports
     exhaustion instead of inventing iteration 3. */
  r = runBoth("grow", 2, [0x1000, 0x1000], [2, 5]);
  assert.equal(r.wasmEv.entityRenderCalls, 2);
  assert.equal(r.wasmEv.sampleExhausted, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_ENTITY);

  /* the base moves mid-loop (Game::Render reallocated the array): slot
     addresses use the base recaptured for THAT iteration */
  r = runBoth("moving base", 3, [0x1000, 0x2000, 0x3000], [3, 3, 3]);
  assert.equal(r.wasmEv.entityRenderCalls, 3);
  assert.equal(view.getUint32(A_OUT_SLOTS + 0, true), 0x1000);
  assert.equal(view.getUint32(A_OUT_SLOTS + 4, true), 0x2004);
  assert.equal(view.getUint32(A_OUT_SLOTS + 8, true), 0x3008);

  /* 32-bit wrap of the slot arithmetic */
  r = runBoth("slot wrap", 2, [0xfffffffc, 0xfffffffc], [2, 2]);
  assert.equal(view.getUint32(A_OUT_SLOTS + 0, true), 0xfffffffc);
  assert.equal(view.getUint32(A_OUT_SLOTS + 4, true), 0x00000000);

  /* count 0xffffffff: unsigned compare keeps looping past any signed bound;
     64 samples all consumed then exhaustion */
  const big = new Array(64).fill(0x4000);
  const bigCounts = new Array(64).fill(0xffffffff);
  r = runBoth("unsigned count", 0xffffffff, big, bigCounts);
  assert.equal(r.wasmEv.entityRenderCalls, 64);
  assert.equal(r.wasmEv.sampleExhausted, 1);
});

test("grid loop: folded product asymmetry + null-slot gates", () => {
  const S = defaultState();
  const runBoth = (label, w, h, slots) => {
    writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
    writeSeq(A_GRID_SLOTS, slots);
    const js = M.gameRenderResumeGrid(S, w, h, slots);
    exp.isaac_game_render_slice_resume_grid(A_STATE, w, h, A_GRID_SLOTS,
      slots.length, A_EVENTS);
    return { wasmEv: compareEvents(label, js), js };
  };

  /* signed jle: zero and negative products skip the loop entirely */
  let r = runBoth("zero", 0, 5, []);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  r = runBoth("negative", 3, -1, []);
  assert.equal(r.wasmEv.gridCellCount >>> 0, 0xfffffffd);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  /* imul wrap: 0x10000 * 0x10000 wraps to 0 -> jle skips */
  r = runBoth("wrap to 0", 0x10000, 0x10000, []);
  assert.equal(r.wasmEv.gridCellCount, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  /* wrap negative: 0x8000 * 0x10000 = INT_MIN -> jle skips */
  r = runBoth("wrap negative", 0x8000, 0x10000, []);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);

  /* null slots are skipped without a call; repeat counts non-null only */
  r = runBoth("null gates", 3, 2, [0, 0x100, 0, 0x200, 0, 0]);
  assert.equal(r.wasmEv.gridCellCount, 6);
  assert.equal(r.wasmEv.gridDrawCalls, 2);
  assert.equal(r.wasmEv.hostRepeat, 2);
  assert.equal(r.wasmEv.hostArg0 >>> 0, 0x100, "first NON-NULL slot value");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GRID);
  /* all-null full supply -> no host at all */
  r = runBoth("all null", 2, 2, [0, 0, 0, 0]);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE);
  /* under-supply is reported, never invented */
  r = runBoth("under-supplied", 4, 4, [1, 2]);
  assert.equal(r.wasmEv.sampleExhausted, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GRID);
});

test("overlay + aux chain (v2 pure probe/vector, dual order, third poll site)", () => {
  const S = defaultState();

  /* G7 dual gate needs mode 5 AND room type 0x59 */
  let r = both("overlay closed", S, defaultInputs(), {
    js: () => M.gameRenderResumeOverlayGate(S, defaultInputs(), 5, 0x58,
      0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
      5, 0x58, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_AUX_GATE);

  /* Open-probe inputs: probe AL = 4217a0_test(bitset, 0x2f). this0 = 6 with
     poll-B bit1 PRESENT (present40) keeps mode_adj == 6; this4 = 4 asks for
     the probe; the 64-bit limb bit 47 (hi limb bit 15 -> 0x8000) answers 1. */
  const openProbe = {
    present40: 1, mgrWord0Now: 6, mgrWord1Now: 4, mgrMode26584: 0,
    mgrDifficulty269c8: 0, mgrFlags2654c: 0, bitset26548Lo: 0,
    bitset2654cHi: 0x8000, mgr26550: 0, mgrWord0c: 0,
  };
  const IProbe = { ...defaultInputs(), ...openProbe };
  r = both("overlay probe open", S, IProbe, {
    js: () => M.gameRenderResumeOverlayGate(S, IProbe, 5, 0x59,
      f32bits(7), f32bits(9), 1, 0),
    wasm: () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
      5, 0x59, f32bits(7), f32bits(9), 1, 0, A_EVENTS),
  });
  /* draw position + stores computed BEFORE the flag branch; order A */
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_ANIM_RENDER);
  assert.equal(r.wasmEv.overlayFirstOff, 0x6e70);

  /* AABB plan + scroll/floor math pin: room 80..120/140..220 -> vec (100,180);
     scroll (400,200); camera (7,9). preX = ((400-338)*0.5+(100-60)*0.65)*2
     +0.5 = 114.5 -> floor 114 -> /2 = 57 -> +7 = 64. preY: ((180-140)*0.65
     + (200-182)*0.5)*2 +0.5 = 70.5 -> 70 -> /2 = 35 -> +9 = 44. */
  const IDrawRoom = { ...IProbe, roomDesc: 0, roomDescNested: 0, roomType48: 0,
    roomWidthC: 0, roomAabb14Bits: f32bits(80), roomAabb18Bits: f32bits(140),
    roomAabb1cBits: f32bits(120), roomAabb20Bits: f32bits(220),
    datC78dc4Bits: f32bits(400), datC78edcBits: f32bits(200),
    datC3793cBits: f32bits(1.5), datC37940Bits: f32bits(2.5) };
  r = both("overlay draw skip wide", S, IDrawRoom, {
    js: () => M.gameRenderResumeOverlayGate(S, IDrawRoom, 5, 0x59,
      f32bits(7), f32bits(9), 0x100, 0x100),
    wasm: () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
      5, 0x59, f32bits(7), f32bits(9), 0x100, 0x100, A_EVENTS),
  });
  assert.equal(r.wasmEv.overlayPosXBits >>> 0, f32bits(64));
  assert.equal(r.wasmEv.overlayPosYBits >>> 0, f32bits(44));
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_NONE, "draw flag byte 0 -> skip");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_AUX_GATE);
  assert.equal(r.wasmEv.overlayStoresApplied, 1);
  assert.equal(r.wasmEv.overlayScaleXBits >>> 0, f32bits(1.5), "scale stores echo");

  /* order B on the swap byte (wide drives) */
  r = both("overlay order B", S, IDrawRoom, {
    js: () => M.gameRenderResumeOverlayGate(S, IDrawRoom, 5, 0x59,
      0, 0, 0x101, 0x201),
    wasm: () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
      5, 0x59, 0, 0, 0x101, 0x201, A_EVENTS),
  });
  assert.equal(r.wasmEv.overlayFirstOff, 0x6e90, "swap byte 1 -> B then A");
  assert.equal(r.wasmEv.overlaySecondOff, 0x6e70);
  assert.equal(r.wasmEv.hostRepeat, 2);
  assert.equal(r.wasmEv.hostArg0 >>> 0, 0x00c7b640, "clamp DAT_00c7b640");

  /* G7 open + probe CLOSED (bit 47 clear) -> aux gate, no draw at all */
  const IProbeClosed = { ...defaultInputs(), present40: 1, mgrWord0Now: 6,
    mgrWord1Now: 4, mgrFlags2654c: 0, bitset2654cHi: 0, mgr26550: 0,
    mgrWord0c: 0 };
  r = both("probe closed", S, IProbeClosed, {
    js: () => M.gameRenderResumeOverlayGate(S, IProbeClosed, 5, 0x59, 0, 0, 1, 0),
    wasm: () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
      5, 0x59, 0, 0, 1, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_AUX_GATE);

  /* aux gate: wide option bytes; fade > 0 direct; polls recapture */
  r = both("aux closed wide", S, { ...defaultInputs(), option2a3c5: 0xff00 }, {
    js: () => M.gameRenderResumeAuxGate(S, { ...defaultInputs(), option2a3c5: 0xff00 }),
    wasm: () => exp.isaac_game_render_slice_resume_aux_gate(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
  assert.equal(r.wasmEv.hostReceiver >>> 0, 0xc798e0);
  const inpA = { ...defaultInputs(), option2a3c5: 1, mgrFade26518Bits: f32bits(2) };
  r = both("aux direct body", S, inpA, {
    js: () => M.gameRenderResumeAuxGate(S, inpA),
    wasm: () => exp.isaac_game_render_slice_resume_aux_gate(A_STATE, A_INPUTS, A_EVENTS),
  });
  /* v3: the body entrance now hosts Game::GetStageID FIRST. */
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830);
  assert.equal(r.wasmEv.hostVa >>> 0, 0x00738470, "Game::GetStageID");
  assert.equal(r.wasmEv.hostReceiver >>> 0, 0, "receiver = inputs.datC71678");
  assert.equal(r.wasmEv.hostArg0, 0, "push 0 (unused=false)");
  const inpA2 = { ...defaultInputs(), option2a3c5: 0x101, mgrFade26518Bits: 0 };
  r = both("aux recapture", S, inpA2, {
    js: () => M.gameRenderResumeAuxGate(S, inpA2),
    wasm: () => exp.isaac_game_render_slice_resume_aux_gate(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_AUX_POLLS);
  /* aux polls: pure masks over sparse presence; bit0 select -> body */
  const IHit = { ...defaultInputs(), present38: 1 };
  r = both("aux poll hit", S, IHit, {
    js: () => M.gameRenderResumeAuxPolls(S, IHit),
    wasm: () => exp.isaac_game_render_slice_resume_aux_polls(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollSelectsOne, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
    "v3: poll-hit now hosts GetStageID first");
  /* miss: pollB BIT0 (present3f) clears the select; pollB bit1 (present40)
     does NOT (test al,1 tests bit 0 only). */
  const IMiss = { ...defaultInputs(), present38: 1, present3f: 1 };
  r = both("aux poll miss", S, IMiss, {
    js: () => M.gameRenderResumeAuxPolls(S, IMiss),
    wasm: () => exp.isaac_game_render_slice_resume_aux_polls(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollSelectsOne, 0);
  const IHit2 = { ...defaultInputs(), present38: 1, present40: 1 };
  r = both("aux poll bit1 no-clear", S, IHit2, {
    js: () => M.gameRenderResumeAuxPolls(S, IHit2),
    wasm: () => exp.isaac_game_render_slice_resume_aux_polls(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.pollSelectsOne, 1, "pollB bit1 does not clear bit0");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830,
    "the select stays a hit -> GetStageID host");
  r = both("rt pop begin", S, defaultInputs(), {
    js: () => M.gameRenderResumeRtPopBegin(S, defaultInputs()),
    wasm: () => exp.isaac_game_render_slice_resume_rt_pop_begin(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
});

test("v3 817830 gate: GetStageID host chain + pure body-needed decision", () => {
  const S = defaultState();
  const I = defaultInputs();
  let r;

  /* the slot-offset law (imul [Game+0x1d18], 0x13c, VA 0x0081785f) */
  const offCases = [
    [0, 0], [1, 0x13c], [2, 0x278], [7, 0x8a4], [0x20e, 0x28948],
    [0xffffffff, 0xfffffec4], [0x1000000, 0x3c000000], [0x80000000, 0],
    [0x12345678, 0x789abc20],
  ];
  for (const [stage, want] of offCases) {
    assert.equal(exp.isaac_game_render_slice_817830_slot_offset(stage >>> 0) >>> 0,
      M.gameRender817830SlotOffset(stage) >>> 0, `slotOffset oracle(${stage})`);
    assert.equal(exp.isaac_game_render_slice_817830_slot_offset(stage >>> 0) >>> 0,
      want >>> 0, `slotOffset pin(${stage})`);
  }

  /* G14: empty slot -> body skipped, straight to the RT pop chain */
  r = both("gate empty slot", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 4, 0, 0, 0, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      4, 0, 0, 0, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
  assert.equal(r.wasmEv.hostReceiver >>> 0, 0xc798e0);
  assert.equal(r.wasmEv.hostArg0, 1, "push 1");

  /* G19: fade > 0 opens the body even with a non-special stage */
  r = both("gate fade open", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 9, 0x1234, 0, 0,
      f32bits(1e-4)),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      9, 0x1234, 0, 0, f32bits(1e-4), A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_TRUNK_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_BODY_817830_TRUNK);
  assert.equal(r.wasmEv.hostVa >>> 0, 0x00817830);

  /* G15+G16+G17: stage 5 + room word54 signed >= 0 + flags bit5 -> body */
  r = both("gate special", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 5, 1, 0, 0x20, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      5, 1, 0, 0x20, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_TRUNK_817830);
  /* word54 NEGATIVE (jl) closes; wide value 0x80000000 is negative */
  r = both("gate word54 neg", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 0x1b, 1, 0x80000000, 0x20, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      0x1b, 1, 0x80000000, 0x20, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
  /* flags bit5 CLEAR closes; bit5 via a WIDE value (0x100020) stays set */
  r = both("gate flags bit5", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 6, 1, 1, 0x100020, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      6, 1, 1, 0x100020, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_TRUNK_817830);
  r = both("gate flags clear", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 0x1c, 1, 1, 0x10, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      0x1c, 1, 1, 0x10, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
  /* stage outside the special set with zero fade closes */
  r = both("gate stage outside", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 0x1d, 1, 1, 0x20, 0),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      0x1d, 1, 1, 0x20, 0, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1);
  /* G19 NaN: comiss sets CF -> NOT ja -> closed. The comiss is only reached
     when the room-special path did NOT open, so a NaN fade with a NON-special
     stage closes. (For a special stage the room path opens first and the
     comiss is never consulted.) */
  r = both("gate NaN fade", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 9, 1, 1, 0x20, 0x7fc00000),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      9, 1, 1, 0x20, 0x7fc00000, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1, "NaN fade closes (not > 0)");
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180);
  r = both("gate NaN fade special", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 4, 1, 1, 0x20, 0x7fc00000),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      4, 1, 1, 0x20, 0x7fc00000, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 0,
    "special-stage room path opens before the comiss is consulted");
  /* -0.0f is not > 0 */
  r = both("gate neg zero", S, I, {
    js: () => M.gameRenderResume817830Gate(S, I, 9, 1, 0, 0, 0x80000000),
    wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
      9, 1, 0, 0, 0x80000000, A_EVENTS),
  });
  assert.equal(r.wasmEv.bodySkipped, 1, "-0.0f is not > 0");
  /* wide stage values: only the EXACT set members open */
  for (const st of [0, 1, 3, 7, 0x100, 0x1b0001, 0x1c0001, 0xffffffff]) {
    r = both(`gate wide stage ${st}`, S, I, {
      js: () => M.gameRenderResume817830Gate(S, I, st, 1, 1, 0x20, 0),
      wasm: () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
        st, 1, 1, 0x20, 0, A_EVENTS),
    });
    assert.equal(r.wasmEv.bodySkipped, 1, `wide stage ${st} is not special`);
  }
  /* the full chain: aux gate open -> GetStageID host -> gate closed on an
     empty slot -> RT pop */
  const inpC = { ...defaultInputs(), option2a3c5: 1, mgrFade26518Bits: f32bits(2),
    datC71678: 0x0c71678 };
  r = both("chain aux->gsid->gate", S, inpC, {
    js: () => M.gameRenderResumeAuxGate(S, inpC),
    wasm: () => exp.isaac_game_render_slice_resume_aux_gate(A_STATE, A_INPUTS, A_EVENTS),
  });
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830);
  assert.equal(r.wasmEv.hostReceiver >>> 0, 0x0c71678, "datC71678 echoed");
});


/* ---------------- v4: 0x00817830 pure prefix pins -------------------------
   PE-truth scenarios for the peeled span 0x00817adc..0x00817b53:
   P14/P15 blend t, P17/P18 shader scales, the a14050 chain plan, the
   type ladder, the a14050 value-store resume, and agreement with the
   render-shell helper family (cross-helper differential: two independent
   transcriptions of the same instruction spans must agree). */
function prefixBoth(label, world, foundDeref) {
  const S = defaultState();
  const I = { ...defaultInputs(), mgr264f8: world.mgr264f8,
    datC379bc: world.treeHeadC379bc };
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Prefix(S, I, world.stageId,
      world.roomWord54, world.roomFlags44, world.fade7240, world.mgr264f8,
      world.treeHeadC379bc, world.boundIsnil, world.boundKey,
      world.boundPtr, world.roomDescType48),
    wasm: () => exp.isaac_game_render_slice_resume_817830_prefix(A_STATE,
      A_INPUTS, world.stageId, world.roomWord54, world.roomFlags44,
      world.fade7240, world.mgr264f8, world.treeHeadC379bc,
      world.boundIsnil, world.boundKey, world.boundPtr,
      world.roomDescType48, A_EVENTS),
  });
}

function valueBoth(label, world, valueAt14, byteAt4) {
  const S = defaultState();
  const I = { ...defaultInputs(), mgr264f8: world.mgr264f8 };
  return both(label, S, I, {
    js: () => M.gameRenderResume817830A14050Value(S, I, world.stageId,
      world.roomWord54, world.roomFlags44, world.fade7240, world.mgr264f8,
      world.roomDescType48, valueAt14, byteAt4),
    wasm: () => exp.isaac_game_render_slice_resume_817830_a14050_value(
      A_STATE, A_INPUTS, world.stageId, world.roomWord54, world.roomFlags44,
      world.fade7240, world.mgr264f8, world.roomDescType48, valueAt14,
      byteAt4, A_EVENTS),
  });
}

test("v4 817830 prefix: blend/scales/chain/ladder PE-truth + cross-helper", () => {
  /* KAGE hash pin: a159d0(DAT_00b1a5b0 "KAGE_ColorTextureShader"). */
  assert.equal(exp.isaac_game_render_slice_817830_kage_hash() >>> 0,
    0xb3d14323);
  assert.equal(M.gameRender817830KageHash() >>> 0, 0xb3d14323);
  assert.equal(RS.renderShellA159d0Hash("KAGE_ColorTextureShader") >>> 0,
    0xb3d14323);

  const S = defaultState();
  const I = defaultInputs();
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
  writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, I);

  /* --- P14/P15 blend t (VA 0x00817a8b..0x00817ae6) ----------------------- */
  /* special stage 5 + word54 15 (signed>=0) + flags bit5 -> base 15/30 =
     0.5; fade 0 -> no lerp -> blend 0.5 = 0x3f000000 */
  let r = prefixBoth("v4 blend special no-lerp", {
    stageId: 5, roomWord54: 15, roomFlags44: 0x20, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, 0x3f000000);
  assert.equal(r.wasmEv.a14050Found, 1);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830);

  /* fade 2.0 -> blend = 0.5 + (1-0.5)*2 = 1.5 (no clamp after blend) */
  r = prefixBoth("v4 blend lerp", {
    stageId: 5, roomWord54: 15, roomFlags44: 0x20, fade7240: f32bits(2),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 12,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(1.5));
  assert.equal(r.wasmEv.tailStartVa >>> 0, M.GAME_RENDER_VA_BODY_817830_LROOM);

  /* NaN fade -> comiss sets CF -> jbe -> NO lerp (NaN direction pin) */
  r = prefixBoth("v4 blend NaN fade no-lerp", {
    stageId: 5, roomWord54: 15, roomFlags44: 0x20, fade7240: 0x7fc00000,
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, 0x3f000000);

  /* -0.0 fade -> not > 0 -> no lerp */
  r = prefixBoth("v4 blend -0 fade no-lerp", {
    stageId: 0x1b, roomWord54: 15, roomFlags44: 0x20, fade7240: 0x80000000,
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, 0x3f000000);

  /* special needs G15 (stage) AND word54 signed>=0 AND flags bit5; each
     miss zeroes the base, and the lerp then yields 0 + 1*fade */
  r = prefixBoth("v4 blend not-special stage", {
    stageId: 0x1d, roomWord54: 15, roomFlags44: 0x20, fade7240: f32bits(2),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 13,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.tailStartVa >>> 0, M.GAME_RENDER_VA_BODY_817830_OTHER);
  r = prefixBoth("v4 blend word54 neg", {
    stageId: 5, roomWord54: 0x80000000, roomFlags44: 0x20,
    fade7240: f32bits(2), mgr264f8: 0, treeHeadC379bc: 0x11223344,
    boundIsnil: 0, boundKey: 0, boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(2));
  r = prefixBoth("v4 blend flags clear", {
    stageId: 6, roomWord54: 15, roomFlags44: 0x10, fade7240: f32bits(2),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(2));
  /* wide flags value keeps bit5 */
  r = prefixBoth("v4 blend wide flags bit5", {
    stageId: 6, roomWord54: 15, roomFlags44: 0x100020, fade7240: f32bits(2),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(1.5));
  /* minss clamp: word54 90 -> 90/30 = 3 -> base 1.0 */
  r = prefixBoth("v4 blend clamp one", {
    stageId: 0x1c, roomWord54: 90, roomFlags44: 0x20, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, 0x3f800000);

  /* --- P17/P18 scales (VA 0x00817af4..0x00817b26) ------------------------ */
  r = prefixBoth("v4 scales 60", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 60, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailScale28Bits >>> 0, 0x3f199999);    /* 60*0.01f */
  assert.equal(r.wasmEv.tailScale18Bits >>> 0, f32bits(30));    /* 60*0.5  */
  assert.equal(r.wasmEv.tailScale80Bits >>> 0, f32bits(3));     /* 30*0.1  */
  r = prefixBoth("v4 scales neg", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: -60, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.tailScale28Bits >>> 0, 0xbf199999);    /* -60*0.01f */
  assert.equal(r.wasmEv.tailScale18Bits >>> 0, f32bits(-30));
  assert.equal(r.wasmEv.tailScale80Bits >>> 0, f32bits(-3));

  /* --- a14050 chain plan (VA 0x00a1407b..0x00a1408c) ---------------------- */
  /* FAIL: isnil byte nonzero; WIDE 0x100 has byte 0 -> passes the gate */
  r = prefixBoth("v4 plan isnil byte", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0x100,
    boundKey: 0, boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.a14050Found, 1);
  r = prefixBoth("v4 plan isnil set", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 1,
    boundKey: 0, boundPtr: 0x55667788, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.a14050Found, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_GETLROOM_81F8B0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_GETLROOM);
  /* FAIL: key < boundKey (unsigned) */
  r = prefixBoth("v4 plan key below", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0,
    boundKey: 0xb3d14324, boundPtr: 0x55667788, roomDescType48: 13,
  }, false);
  assert.equal(r.wasmEv.a14050Found, 0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_BODY_817830_OTHER);
  /* FAIL: bound == map head (sentinel) */
  r = prefixBoth("v4 plan sentinel", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0, boundKey: 0,
    boundPtr: 0x11223344, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.a14050Found, 0);
  /* FOUND at the exact key (>=, not >) */
  r = prefixBoth("v4 plan key equal", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 0,
    boundKey: 0xb3d14323, boundPtr: 0x55667788, roomDescType48: 12,
  }, false);
  assert.equal(r.wasmEv.a14050Found, 1);

  /* --- a14050 value store resume (VA 0x00a1409c..0x00a140a8) -------------- */
  const w = { stageId: 5, roomWord54: 15, roomFlags44: 0x20,
    fade7240: f32bits(2), mgr264f8: 60, roomDescType48: 9 };
  /* value 0 -> no store even with byte&1 */
  r = valueBoth("v4 store value zero", w, 0, 0x101);
  assert.equal(r.wasmEv.c379b8StoreApplied, 0);
  assert.equal(r.wasmEv.c379b8NextValue >>> 0, 0);
  assert.equal(r.wasmEv.continuationKind, M.GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830);
  /* byte even -> no store */
  r = valueBoth("v4 store byte even", w, 0x1234, 2);
  assert.equal(r.wasmEv.c379b8StoreApplied, 0);
  /* WIDE 0x100 -> byte 0 -> no store (byte-width discipline) */
  r = valueBoth("v4 store wide byte", w, 0x1234, 0x100);
  assert.equal(r.wasmEv.c379b8StoreApplied, 0);
  /* WIDE 0x101 -> byte 1 -> store */
  r = valueBoth("v4 store wide byte odd", w, 0x1234, 0x101);
  assert.equal(r.wasmEv.c379b8StoreApplied, 1);
  assert.equal(r.wasmEv.c379b8NextValue >>> 0, 0x1234);
  /* value 0xffffffff + byte 1 -> store the full value */
  r = valueBoth("v4 store full value", w, 0xffffffff, 1);
  assert.equal(r.wasmEv.c379b8StoreApplied, 1);
  assert.equal(r.wasmEv.c379b8NextValue >>> 0, 0xffffffff);
  /* the value resume re-derives the tail locals and the ladder */
  assert.equal(r.wasmEv.tailBlend398Bits >>> 0, f32bits(1.5));
  assert.equal(r.wasmEv.tailScale28Bits >>> 0, 0x3f199999);
  assert.equal(r.wasmEv.tailScale18Bits >>> 0, f32bits(30));
  assert.equal(r.wasmEv.tailScale80Bits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.tailStartVa >>> 0, M.GAME_RENDER_VA_BODY_817830_LROOM);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_GETLROOM_81F8B0);
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* --- cross-helper differential vs the render-shell family -------------- */
  const specialOf = (stage, word54, flags) => {
    const st = u32(stage);
    const sp = st === 4 || st === 5 || st === 6 || st === 0x1b || st === 0x1c;
    return sp && (word54 | 0) >= 0 && ((u32(flags) >>> 5) & 1) !== 0 ? 1 : 0;
  };
  for (const wd of [
    { stageId: 5, roomWord54: 15, roomFlags44: 0x20, fade7240: f32bits(2) },
    { stageId: 0x1d, roomWord54: 15, roomFlags44: 0x20, fade7240: f32bits(0) },
    { stageId: 6, roomWord54: 90, roomFlags44: 0x20, fade7240: 0x7fc00000 },
    { stageId: 0x1c, roomWord54: -1, roomFlags44: 0x100020,
      fade7240: f32bits(0.25) },
  ]) {
    const base = prefixBaseViaBoth(wd);
    const sp = specialOf(wd.stageId, wd.roomWord54, wd.roomFlags44);
    assert.equal(base, RS.renderShell817830SpecialBaseT(sp, wd.roomWord54),
      "P14 agrees with render-shell");
    const blendBits = M.gameRenderResume817830Prefix(defaultState(),
      defaultInputs(), wd.stageId, wd.roomWord54, wd.roomFlags44,
      wd.fade7240, 0, 0, 0, 0, 0, 9).tailBlend398Bits;
    assert.equal(blendBits >>> 0,
      f32bits(RS.renderShell817830FadeBlendT(base, fwdOfF32(wd.fade7240))),
      "P15 agrees with render-shell");
  }
  const scales = M.gameRenderResume817830Prefix(defaultState(),
    defaultInputs(), 0, 0, 0, 0, 60, 0, 0, 0, 0, 9);
  const rsScales = RS.renderShell817830ShaderScales(Math.fround(60));
  assert.equal(scales.tailScale28Bits >>> 0, f32bits(rsScales.mul01));
  assert.equal(scales.tailScale18Bits >>> 0, f32bits(rsScales.mul05));
  assert.equal(scales.tailScale80Bits >>> 0, f32bits(rsScales.mul005));
  for (const ty of [0, 8, 9, 10, 11, 12, 13, 0x109]) {
    const e = M.gameRenderResume817830Prefix(defaultState(), defaultInputs(),
      0, 0, 0, 0, 0, 0, 1, 0, 0, ty); /* isnil 1 -> fail -> tail emitted */
    assert.equal(e.tailStartVa >>> 0 === M.GAME_RENDER_VA_BODY_817830_LROOM,
      RS.renderShell817830LroomTypeRange(ty), `ladder agrees at type ${ty}`);
  }
  const plan = M.gameRenderResume817830Prefix(defaultState(), defaultInputs(),
    0, 0, 0, 0, 0, 0x11223344, 0, 0xb3d14323, 0x55667788, 9);
  assert.equal(plan.a14050Found,
    RS.renderShellA14050ChainPlan(0xb3d14323, 0, 0xb3d14323, 0x55667788,
      0x11223344) === RS.RENDER_SHELL_A14050_CHAIN_PLAN_FOUND ? 1 : 0,
    "chain plan agrees with render-shell");
  const store = M.gameRenderResume817830A14050Value(defaultState(),
    defaultInputs(), 0, 0, 0, 0, 0, 9, 0x1234, 0x101);
  const rsResume = RS.renderShellA14050ChainResume(0x1234, 0x101, 0);
  assert.equal(store.c379b8StoreApplied, rsResume.ok ? 1 : 0);
  assert.equal(store.c379b8NextValue >>> 0, rsResume.c379b8 >>> 0);
});

function prefixBaseViaBoth(wd) {
  /* P14 base from the wasm export via the events blend (fade 0 -> no lerp) */
  const S = defaultState();
  const I = { ...defaultInputs(), mgr264f8: 0 };
  const r = both("v4 helper base", S, I, {
    js: () => M.gameRenderResume817830Prefix(S, I, wd.stageId,
      wd.roomWord54, wd.roomFlags44, f32bits(0), 0, 0, 1, 0, 0, 9),
    wasm: () => exp.isaac_game_render_slice_resume_817830_prefix(A_STATE,
      A_INPUTS, wd.stageId, wd.roomWord54, wd.roomFlags44, f32bits(0), 0, 0,
      1, 0, 0, 9, A_EVENTS),
  });
  const bits = r.wasmEv.tailBlend398Bits >>> 0;
  const dv = new DataView(new ArrayBuffer(4));
  dv.setUint32(0, bits, true);
  return dv.getFloat32(0, true);
}

function lroomBoth(label, roomPtr, nested, type48, scaleA8, mul005, mul05, offC) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830LroomPack(S, I, roomPtr, nested, type48,
      scaleA8, mul005, mul05, offC),
    wasm: () => exp.isaac_game_render_slice_resume_817830_lroom_pack(A_STATE,
      A_INPUTS, roomPtr, nested, type48, scaleA8, mul005, mul05, offC, A_EVENTS),
  });
}

test("v6 817830 lroom pack: 12+6 loops, G22/G23, P22 cell0 + mutant pin", () => {
  /* 12-quad + 6-pair always run before G22. */
  let r = lroomBoth("v6 type9 cell0", 0x1000, 0x2000, 9,
    f32bits(4), f32bits(1), f32bits(2), f32bits(3));
  assert.equal(r.wasmEv.lroomQuadInits, 12);
  assert.equal(r.wasmEv.lroomPairInits, 6);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690);
  assert.equal(r.wasmEv.type9Cell0HalfABits >>> 0, f32bits(2)); /* 4*0.5 */
  assert.equal(r.wasmEv.type9Cell0XBits >>> 0, f32bits(4));     /* 1+3 */
  assert.equal(r.wasmEv.type9Cell0YBits >>> 0, f32bits(4));     /* 2+2 */
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* G22 closed: null Room* */
  r = lroomBoth("v6 G22 room null", 0, 0x2000, 9, 0, 0, 0, 0);
  assert.equal(r.wasmEv.lroomQuadInits, 12);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_A975);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_A975);
  /* G22 closed: null nested */
  r = lroomBoth("v6 G22 nested null", 0x1000, 0, 9, 0, 0, 0, 0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_A975);

  /* G23: type 10/11/12 join 0x819394; wide 0x109 is not 9 */
  for (const ty of [10, 11, 12, 8, 13, 0x109]) {
    r = lroomBoth(`v6 G23 type ${ty}`, 0x1000, 0x2000, ty, 0, 0, 0, 0);
    assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_9394,
      `type ${ty} is not 9`);
    assert.equal(r.wasmEv.type9Cell0XBits >>> 0, 0, `no cell0 on type ${ty}`);
  }

  /* prefix type-9 FAIL now emits the GetLRoom host, not the whole tail */
  r = prefixBoth("v6 prefix type9 -> LROOM host", {
    stageId: 0, roomWord54: 0, roomFlags44: 0, fade7240: f32bits(0),
    mgr264f8: 0, treeHeadC379bc: 0x11223344, boundIsnil: 1,
    boundKey: 0, boundPtr: 0, roomDescType48: 9,
  }, false);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_GETLROOM_81F8B0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_BODY_817830_PACK);

  /* cross-helper: P22 agrees with render-shell */
  const cell = RS.renderShell817830Type9Cell0(4, 1, 2, 3);
  const packed = M.gameRenderResume817830LroomPack(defaultState(),
    defaultInputs(), 0x1000, 0x2000, 9, f32bits(4), f32bits(1), f32bits(2),
    f32bits(3));
  assert.equal(packed.type9Cell0HalfABits >>> 0, f32bits(cell.halfA));
  assert.equal(packed.type9Cell0XBits >>> 0, f32bits(cell.outX));
  assert.equal(packed.type9Cell0YBits >>> 0, f32bits(cell.outY));
});

function cell1Both(label, scale70, halfA, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell1(S, I, scale70, halfA, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell1(A_STATE,
      A_INPUTS, scale70, halfA, mul05, A_EVENTS),
  });
}

test("v7 817830 type9 P23 cell1 after host a10690 + mutant pin", () => {
  /* scale70=4, halfA=2, mul05=2 → halfB=2, sum=4, y2=6 */
  let r = cell1Both("v7 cell1", f32bits(4), f32bits(2), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_NEXT);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_NEXT);
  assert.equal(r.wasmEv.type9Cell1HalfBBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9Cell1SumBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9Cell1Y2Bits >>> 0, f32bits(6));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* cross-helper: P23 agrees with render-shell */
  const cell = RS.renderShell817830Type9Cell1(4, 2, 2);
  const ev = M.gameRenderResume817830Type9Cell1(defaultState(),
    defaultInputs(), f32bits(4), f32bits(2), f32bits(2));
  assert.equal(ev.type9Cell1HalfBBits >>> 0, f32bits(cell.halfB));
  assert.equal(ev.type9Cell1SumBits >>> 0, f32bits(cell.outSum));
  assert.equal(ev.type9Cell1Y2Bits >>> 0, f32bits(cell.outY2));

  /* second-site callsite stays distinct from the first a10690 */
  r = cell1Both("v7 cell1 next != first", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690);
});

function cell2Both(label, halfB, offsetAc, mul05, halfA) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell2(S, I, halfB, offsetAc, mul05,
      halfA),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell2(A_STATE,
      A_INPUTS, halfB, offsetAc, mul05, halfA, A_EVENTS),
  });
}

test("v8 817830 type9 cell2 after host a10690 + mutant pin", () => {
  /* halfB=2, ac=3, mul05=2, halfA=4 → x2=5, y3=4, sum2=8 */
  let r = cell2Both("v8 cell2", f32bits(2), f32bits(3), f32bits(2), f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL2);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL2);
  assert.equal(r.wasmEv.type9Cell2X2Bits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9Cell2Y3Bits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9Cell2Sum2Bits >>> 0, f32bits(8));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: y3 = halfB+mul05; x2 = halfB+ac; sum2 = y3+halfA */
  const ev = M.gameRenderResume817830Type9Cell2(defaultState(),
    defaultInputs(), f32bits(2), f32bits(3), f32bits(2), f32bits(4));
  assert.equal(ev.type9Cell2X2Bits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9Cell2Y3Bits >>> 0, f32bits(Math.fround(2 + 2)));
  assert.equal(ev.type9Cell2Sum2Bits >>> 0, f32bits(Math.fround(4 + 4)));

  r = cell2Both("v8 cell2 next != second", f32bits(1), f32bits(0), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_NEXT);
});

function cell3Both(label, scale6c, offsetA8, y3, offsetAc, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell3(S, I, scale6c, offsetA8, y3,
      offsetAc, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell3(A_STATE,
      A_INPUTS, scale6c, offsetA8, y3, offsetAc, mul05, A_EVENTS),
  });
}

test("v9 817830 type9 cell3 after host a10690 + mutant pin", () => {
  /* scale6c=2, a8=3, y3=4, ac=1, mul05=2 → x3=5, y4=5, sum3=7 */
  let r = cell3Both("v9 cell3", f32bits(2), f32bits(3), f32bits(4), f32bits(1),
    f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL3);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL3);
  assert.equal(r.wasmEv.type9Cell3X3Bits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9Cell3Y4Bits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9Cell3Sum3Bits >>> 0, f32bits(7));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x3 = scale6c+a8; y4 = y3+ac; sum3 = x3+mul05 */
  const ev = M.gameRenderResume817830Type9Cell3(defaultState(),
    defaultInputs(), f32bits(2), f32bits(3), f32bits(4), f32bits(1),
    f32bits(2));
  assert.equal(ev.type9Cell3X3Bits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9Cell3Y4Bits >>> 0, f32bits(Math.fround(4 + 1)));
  assert.equal(ev.type9Cell3Sum3Bits >>> 0, f32bits(Math.fround(5 + 2)));

  r = cell3Both("v9 cell3 next != third", f32bits(1), f32bits(0), f32bits(0),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL2);
});

function cell4Both(label, offsetA8, scale70, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell4(S, I, offsetA8, scale70, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell4(A_STATE,
      A_INPUTS, offsetA8, scale70, mul05, A_EVENTS),
  });
}

test("v10 817830 type9 cell4 after host a10690 + mutant pin", () => {
  /* a8=3, scale70=4, mul05=2 → dbl=6, ac=10, sum4=12, y5=9 */
  let r = cell4Both("v10 cell4", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL4);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL4);
  assert.equal(r.wasmEv.type9Cell4DblBits >>> 0, f32bits(6));
  assert.equal(r.wasmEv.type9Cell4AcBits >>> 0, f32bits(10));
  assert.equal(r.wasmEv.type9Cell4Sum4Bits >>> 0, f32bits(12));
  assert.equal(r.wasmEv.type9Cell4Y5Bits >>> 0, f32bits(9));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: dbl=a8+a8; ac=dbl+70; sum4=ac+mul05; y5=mul05+a8+70 */
  const ev = M.gameRenderResume817830Type9Cell4(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9Cell4DblBits >>> 0, f32bits(Math.fround(3 + 3)));
  assert.equal(ev.type9Cell4AcBits >>> 0, f32bits(Math.fround(6 + 4)));
  assert.equal(ev.type9Cell4Sum4Bits >>> 0, f32bits(Math.fround(10 + 2)));
  assert.equal(ev.type9Cell4Y5Bits >>> 0,
    f32bits(Math.fround(Math.fround(2 + 3) + 4)));

  r = cell4Both("v10 cell4 next != fourth", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL3);
});

function cell5Both(label, scale6c, offset10, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell5(S, I, scale6c, offset10, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell5(A_STATE,
      A_INPUTS, scale6c, offset10, mul05, A_EVENTS),
  });
}

test("v11 817830 type9 cell5 after host a10690 + mutant pin", () => {
  /* scale6c=3, offset10=4, mul05=2 → dbl=6, ac=10, sum5=12, y6=9 */
  let r = cell5Both("v11 cell5", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A10690);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A10690);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL5);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL5);
  assert.equal(r.wasmEv.type9Cell5DblBits >>> 0, f32bits(6));
  assert.equal(r.wasmEv.type9Cell5AcBits >>> 0, f32bits(10));
  assert.equal(r.wasmEv.type9Cell5Sum5Bits >>> 0, f32bits(12));
  assert.equal(r.wasmEv.type9Cell5Y6Bits >>> 0, f32bits(9));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: dbl=6c+6c; ac=dbl+10; sum5=ac+mul05; y6=mul05+10+6c */
  const ev = M.gameRenderResume817830Type9Cell5(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9Cell5DblBits >>> 0, f32bits(Math.fround(3 + 3)));
  assert.equal(ev.type9Cell5AcBits >>> 0, f32bits(Math.fround(6 + 4)));
  assert.equal(ev.type9Cell5Sum5Bits >>> 0, f32bits(Math.fround(10 + 2)));
  assert.equal(ev.type9Cell5Y6Bits >>> 0,
    f32bits(Math.fround(Math.fround(2 + 4) + 3)));

  r = cell5Both("v11 cell5 next != fifth", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL4);
});

function cell6Both(label, halfA94, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9Cell6(S, I, halfA94, offsetC, scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_cell6(A_STATE,
      A_INPUTS, halfA94, offsetC, scale28, A_EVENTS),
  });
}

test("v12 817830 type9 cell6 after host a10690 + mutant pin", () => {
  /* identity pack from dump 00817f06: [esp+0x94]/[esp+0xc]/[esp+0x28] */
  let r = cell6Both("v12 cell6", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_CELL6);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_CELL6);
  assert.equal(r.wasmEv.type9Cell6XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9Cell6YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9Cell6AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x=half_a94, y=offset_c, angle=scale_28 (movss copies) */
  const ev = M.gameRenderResume817830Type9Cell6(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9Cell6XBits >>> 0, f32bits(3));
  assert.equal(ev.type9Cell6YBits >>> 0, f32bits(4));
  assert.equal(ev.type9Cell6AngleBits >>> 0, f32bits(2));
  assert.notEqual(ev.type9Cell6XBits >>> 0, ev.type9Cell6YBits >>> 0);

  r = cell6Both("v12 cell6 next != sixth a10690", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL5);
});

function a102e00Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e00(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_0(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v13 817830 type9 first a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 → x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e00Both("v13 a102e0_0", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_NEXT);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_NEXT);
  assert.equal(r.wasmEv.type9A102e0XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x = mul05 + eax_x; y = eax_y + 0 */
  const ev = M.gameRenderResume817830Type9A102e00(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e0XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e0YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e0XBits >>> 0, ev.type9A102e0YBits >>> 0);

  r = a102e00Both("v13 a102e0_0 next != first a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_CELL6);
});

function a102e01Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e01(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_1(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v14 817830 type9 second a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 → x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e01Both("v14 a102e0_1", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_1);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_1);
  assert.equal(r.wasmEv.type9A102e01XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e01YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x = mul05 + eax_x; y = eax_y + 0 */
  const ev = M.gameRenderResume817830Type9A102e01(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e01XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e01YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e01XBits >>> 0, ev.type9A102e01YBits >>> 0);

  r = a102e01Both("v14 a102e0_1 next != second a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_NEXT);
});

function a102e02Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e02(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_2(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v15 817830 type9 third a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 → x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e02Both("v15 a102e0_2", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_2);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_2);
  assert.equal(r.wasmEv.type9A102e02XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e02YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x = mul05 + eax_x; y = eax_y + 0 */
  const ev = M.gameRenderResume817830Type9A102e02(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e02XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e02YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e02XBits >>> 0, ev.type9A102e02YBits >>> 0);

  r = a102e02Both("v15 a102e0_2 next != third a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_1);
});

function a102e03Both(label, eaxX, eaxY, mul14) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e03(S, I, eaxX, eaxY, mul14),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_3(A_STATE,
      A_INPUTS, eaxX, eaxY, mul14, A_EVENTS),
  });
}

test("v16 817830 type9 fourth a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul14=2 → x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e03Both("v16 a102e0_3", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0);
  assert.equal(r.wasmEv.type9A102e03XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e03YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x = mul14 + eax_x; y = eax_y + 0 */
  const ev = M.gameRenderResume817830Type9A102e03(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e03XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e03YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e03XBits >>> 0, ev.type9A102e03YBits >>> 0);

  r = a102e03Both("v16 a102e0_3 next != fourth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_2);
});

function a106e0Both(label, offset9c, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e0(S, I, offset9c, offsetC, scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0(A_STATE,
      A_INPUTS, offset9c, offsetC, scale28, A_EVENTS),
  });
}

test("v17 817830 type9 first a106e0 pack after host a106e0 + mutant pin", () => {
  /* identity pack from dump 008180b4: [esp+0x9c]/[esp+0xc]/[esp+0x28] */
  let r = a106e0Both("v17 a106e0", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3);
  assert.equal(r.wasmEv.type9A106e0XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e0YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e0AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* independent oracle: x=offset_9c, y=offset_c, angle=scale_28 (movss copies) */
  const ev = M.gameRenderResume817830Type9A106e0(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e0XBits >>> 0, f32bits(3));
  assert.equal(ev.type9A106e0YBits >>> 0, f32bits(4));
  assert.equal(ev.type9A106e0AngleBits >>> 0, f32bits(2));
  assert.notEqual(ev.type9A106e0XBits >>> 0, ev.type9A106e0YBits >>> 0);

  r = a106e0Both("v17 a106e0 next != previous a106e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3);
});



function a102e04Both(label, eaxX, eaxY, mul14) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e04(S, I, eaxX, eaxY, mul14),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_4(A_STATE,
      A_INPUTS, eaxX, eaxY, mul14, A_EVENTS),
  });
}

test("v18 817830 type9 fifth a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul14=2 -> x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e04Both("v18 a102e0_4", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4);
  assert.equal(r.wasmEv.type9A102e04XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e04YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e04(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e04XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e04YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e04XBits >>> 0, ev.type9A102e04YBits >>> 0);

  r = a102e04Both("v18 a102e0_4 next != fifth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4);
});

function a102e05Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e05(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_5(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v19 817830 type9 sixth a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 -> x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e05Both("v19 a102e0_5", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5);
  assert.equal(r.wasmEv.type9A102e05XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e05YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e05(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e05XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e05YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e05XBits >>> 0, ev.type9A102e05YBits >>> 0);

  r = a102e05Both("v19 a102e0_5 next != sixth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5);
});

function a102e06Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e06(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_6(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v20 817830 type9 seventh a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 -> x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e06Both("v20 a102e0_6", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6);
  assert.equal(r.wasmEv.type9A102e06XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e06YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e06(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e06XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e06YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e06XBits >>> 0, ev.type9A102e06YBits >>> 0);

  r = a102e06Both("v20 a102e0_6 next != seventh a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6);
});

function a102e07Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e07(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_7(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v21 817830 type9 eighth a102e0 pack after host a102e0 + mutant pin", () => {
  /* eax_x=3, eax_y=4, mul05=2 -> x=5, y=4 (y = ret_y + 0.0f) */
  let r = a102e07Both("v21 a102e0_7", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_2);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_2);
  assert.equal(r.wasmEv.type9A102e07XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e07YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e07(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e07XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e07YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e07XBits >>> 0, ev.type9A102e07YBits >>> 0);

  r = a102e07Both("v21 a102e0_7 next != eighth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
});

function a106e02Both(label, offset40, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e02(S, I, offset40, offsetC, scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_2(A_STATE,
      A_INPUTS, offset40, offsetC, scale28, A_EVENTS),
  });
}

test("v22 817830 type9 second a106e0 seam after host a106e0 + mutant pin", () => {
  /* identity pack from dump 00818273: [esp+0x40]/[esp+0xc]/[esp+0x28] */
  let r = a106e02Both("v22 a106e0_2", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_7);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_7);
  assert.equal(r.wasmEv.type9A106e02XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e02YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e02AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e02GateBits >>> 0, 1);
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A106e02(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e02XBits >>> 0, f32bits(3));
  assert.equal(ev.type9A106e02YBits >>> 0, f32bits(4));
  assert.equal(ev.type9A106e02AngleBits >>> 0, f32bits(2));
  assert.equal(ev.type9A106e02GateBits >>> 0, 1,
    "byte-gate: mov byte [esp+0x140],1 read back as uint32_t & 0xff");
  assert.notEqual(ev.type9A106e02XBits >>> 0, ev.type9A106e02YBits >>> 0);

  r = a106e02Both("v22 a106e0_2 next != second a106e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_2);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
});

function a102e08Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e08(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_8(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v23 817830 type9 ninth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 008182de: eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 */
  let r = a102e08Both("v23 a102e0_8", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_8);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_8);
  assert.equal(r.wasmEv.type9A102e08XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e08YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e08(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e08XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e08YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e08XBits >>> 0, ev.type9A102e08YBits >>> 0);

  r = a102e08Both("v23 a102e0_8 next != ninth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_7);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
});

function a102e09Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e09(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_9(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v24 817830 type9 tenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 00818338 (after-push mul read [esp+0x18]; resume-time
     slot [esp+0x14]): eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 */
  let r = a102e09Both("v24 a102e0_9", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_9);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_9);
  assert.equal(r.wasmEv.type9A102e09XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e09YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e09(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e09XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e09YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e09XBits >>> 0, ev.type9A102e09YBits >>> 0);

  r = a102e09Both("v24 a102e0_9 next != tenth a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_8);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
});

function a102e010Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e010(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_10(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v25 817830 type9 eleventh a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 0081838b (after-push mul read [esp+0x18]; resume-time
     slot [esp+0x14], same after-push shape as v24): eax_x=3, eax_y=4,
     mul_05=2 -> x=5, y=4 */
  let r = a102e010Both("v25 a102e0_10", f32bits(3), f32bits(4), f32bits(2));
  /* v26: the v25 pack now emits the typed twelfth a102e0 @ 0x008183e7 */
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10);
  assert.equal(r.wasmEv.type9A102e010XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e010YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e010(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e010XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e010YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e010XBits >>> 0, ev.type9A102e010YBits >>> 0);

  r = a102e010Both("v25 a102e0_10 next != eleventh a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_9);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10);
});

function a102e011Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e011(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_11(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v26 817830 type9 twelfth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 008183e7 (no-push mul read [esp+0x14] directly, same
     shape as v23; first push is the arg lea at 0x0081840d, AFTER the
     recaptures): eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. v27: the pack
     now emits the typed third a106e0 seam @ 0x0081842c (cont 51). */
  let r = a102e011Both("v26 a102e0_11", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3);
  assert.equal(r.wasmEv.type9A102e011XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e011YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e011(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e011XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e011YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e011XBits >>> 0, ev.type9A102e011YBits >>> 0);

  r = a102e011Both("v26 a102e0_11 next != twelfth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
});

function a106e03Both(label, offset48, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e03(S, I, offset48, offsetC, scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
      A_INPUTS, offset48, offsetC, scale28, A_EVENTS),
  });
}

test("v27 817830 type9 third a106e0 seam after host a106e0 + mutant pin", () => {
  /* identity pack from dump 0081842c: [esp+0x48]/[esp+0xc]/[esp+0x28] */
  let r = a106e03Both("v27 a106e0_3", f32bits(3), f32bits(4), f32bits(2));
  /* v28: the v27 seam now emits the typed thirteenth a102e0 @ 0x00818497 */
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11);
  assert.equal(r.wasmEv.type9A106e03XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e03YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e03AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e03GateBits >>> 0, 1);
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A106e03(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e03XBits >>> 0, f32bits(3));
  assert.equal(ev.type9A106e03YBits >>> 0, f32bits(4));
  assert.equal(ev.type9A106e03AngleBits >>> 0, f32bits(2));
  assert.equal(ev.type9A106e03GateBits >>> 0, 1,
    "byte-gate: mov byte [esp+0x140],1 read back as uint32_t & 0xff");
  assert.notEqual(ev.type9A106e03XBits >>> 0, ev.type9A106e03YBits >>> 0);

  r = a106e03Both("v27 a106e0_3 next != third a106e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11);
});

function a102e012Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e012(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_12(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

function a102e013Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e013(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_13(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v28 817830 type9 thirteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 00818497 (after-push mul read [esp+0x18]; resume-time
     slot [esp+0x14], same after-push shape as v24/v25): eax_x=3, eax_y=4,
     mul_05=2 -> x=5, y=4. v29: the pack now emits the typed fourteenth
     a102e0 @ 0x008184ee (cont 53). */
  let r = a102e012Both("v28 a102e0_12", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_12);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11);
  assert.equal(r.wasmEv.type9A102e012XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e012YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e012(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e012XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e012YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e012XBits >>> 0, ev.type9A102e012YBits >>> 0);

  r = a102e012Both("v28 a102e0_12 next != thirteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_12);
});

function a102e014Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e014(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_14(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v29 817830 type9 fourteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 008184ee (after-push mul read [esp+0x18]; resume-time
     slot [esp+0x14], same after-push shape as v24/v25): eax_x=3, eax_y=4,
     mul_05=2 -> x=5, y=4. v30: the pack now emits the typed fifteenth
     a102e0 @ 0x00818547 (cont 54). */
  let r = a102e013Both("v29 a102e0_13", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13);
  assert.equal(r.wasmEv.type9A102e013XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e013YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e013(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e013XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e013YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e013XBits >>> 0, ev.type9A102e013YBits >>> 0);

  r = a102e013Both("v29 a102e0_13 next != fourteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_12);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13);
});

function a102e015Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e015(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
      A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v30 817830 type9 fifteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 00818547 (after-push mul read [esp+0x18]; resume-time
     slot [esp+0x14], same after-push shape as v24/v25): eax_x=3, eax_y=4,
     mul_05=2 -> x=5, y=4. v31: the pack now emits the typed sixteenth
     a102e0 @ 0x0081859a (cont 55). */
  let r = a102e014Both("v30 a102e0_14", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14);
  assert.equal(r.wasmEv.type9A102e014XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e014YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e014(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e014XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e014YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e014XBits >>> 0, ev.type9A102e014YBits >>> 0);

  r = a102e014Both("v30 a102e0_14 next != fifteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14);
});

test("v31 817830 type9 sixteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 0081859a (NO next-host push before the mul read
     [esp+0x14] directly, same no-push shape as v23/v26; the first push
     is the arg lea at 0x008185c0, AFTER the recaptures): eax_x=3, eax_y=4,
     mul_05=2 -> x=5, y=4. v32: the pack now emits the typed fourth
     a106e0 seam @ 0x008185e8 (cont 56). */
  let r = a102e015Both("v31 a102e0_15", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4);
  assert.equal(r.wasmEv.type9A102e015XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e015YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e015(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e015XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e015YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e015XBits >>> 0, ev.type9A102e015YBits >>> 0);

  r = a102e015Both("v31 a102e0_15 next != sixteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4);
});

function a106e04Both(label, offsetA8, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e04(S, I, offsetA8, offsetC,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(
      A_STATE, A_INPUTS, offsetA8, offsetC, scale28, A_EVENTS),
  });
}

test("v32+v33 817830 type9 fourth a106e0 seam after host a106e0 + mutant pin", () => {
  /* v68 conversion: the seam now emits the remain AT_LROOM_REMAIN_
     817830 (30); hostArg0 / lroomNextVa stay the seventeenth a102e0
     @ 0x00818656. */
  let r = a106e04Both("v33 a106e0_4", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16);
  assert.equal(r.wasmEv.type9A106e04XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e04YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e04AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e04GateBits >>> 0, 1);
  /* v68 conversion: remain kind (30) needs no recapture (both sides). */
  assert.equal(r.wasmEv.needsRecapture, 0);

  const ev = M.gameRenderResume817830Type9A106e04(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e04XBits >>> 0, f32bits(3));
  assert.equal(ev.type9A106e04YBits >>> 0, f32bits(4));
  assert.equal(ev.type9A106e04AngleBits >>> 0, f32bits(2));
  assert.equal(ev.type9A106e04GateBits >>> 0, 1,
    "byte-gate: mov byte [esp+0x140],1 read back as uint32_t & 0xff");
  assert.notEqual(ev.type9A106e04XBits >>> 0, ev.type9A106e04YBits >>> 0);

  r = a106e04Both("v33 a106e0_4 next != fourth seam", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16);
});

function a102e016Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e016(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

function a102e017Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e017(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v33 817830 type9 seventeenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 00818656 (next-host push ecx at 0x0081865e BEFORE the
     mul read [esp+0x18]; resume-time slot [esp+0x14] after-push shape):
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4; stores y -> [esp+0x3c],
     x -> [esp+0x38] (post-push). v34: the pack now emits the typed
     AT_TYPE9_A102E0_17_817830 (58) to the eighteenth type-9 a102e0 @
     0x008186ad (hostArg0 / lroomNextVa = 0x008186ad). */
  let r = a102e016Both("v33 a102e0_16", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17);
  assert.equal(r.wasmEv.type9A102e016XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e016YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e016(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e016XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e016YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e016XBits >>> 0, ev.type9A102e016YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e016(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e016YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  r = a102e016Both("v33 a102e0_16 next != sixteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17);
});

test("v34+v35 817830 type9 eighteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 008186ad (next-host push ecx at 0x008186b5 BEFORE the
     mul read [esp+0x18]; resume-time slot [esp+0x14] after-push shape):
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4; stores y -> [esp+0x44],
     x -> [esp+0x40] (post-push; zero store [esp+0x6c] stays host).
     v35: the pack now emits the typed AT_TYPE9_A102E0_18_817830 (59) to
     the nineteenth type-9 a102e0 @ 0x00818703 (hostArg0 / lroomNextVa =
     0x00818703). */
  let r = a102e017Both("v35 a102e0_17", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18);
  assert.equal(r.wasmEv.type9A102e017XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e017YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e017(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e017XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e017YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e017XBits >>> 0, ev.type9A102e017YBits >>> 0);
  assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18,
    "typed host carries the nineteenth a102e0 arg0");

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e017(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e017YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  r = a102e017Both("v35 a102e0_17 next != eighteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18);
});

function a102e018Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e018(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_18(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

function a102e019Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e019(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_19(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

function a106e05Both(label, offset30, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e05(S, I, offset30, offsetC,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_5(
      A_STATE, A_INPUTS, offset30, offsetC, scale28, A_EVENTS),
  });
}

test("v35 817830 type9 nineteenth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 00818703 (next-host push ecx at 0x0081870b BEFORE the
     mul read [esp+0x18]; resume-time slot [esp+0x14] after-push shape):
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4; stores y -> [esp+0xa0],
     x -> [esp+0x9c] (post-push; zero store [esp+0x14] stays host).
     v35: the pack now emits the typed AT_TYPE9_A102E0_19_817830 (60) to
     the twentieth type-9 a102e0 @ 0x0081875c (hostArg0 / lroomNextVa =
     0x0081875c). */
  let r = a102e018Both("v35 a102e0_18", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19);
  assert.equal(r.wasmEv.type9A102e018XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e018YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e018(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e018XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e018YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e018XBits >>> 0, ev.type9A102e018YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e018(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e018YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  r = a102e018Both("v35 a102e0_18 next != nineteenth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19);
});

test("v35 817830 type9 twentieth a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack from dump 0081875c (NO next-host push before the mul read
     [esp+0x14] directly, same no-push shape as v23/v26/v31; the first
     push is the arg lea at 0x00818782, AFTER the recaptures): eax_x=3,
     eax_y=4, mul_05=2 -> x=5, y=4; stores x -> [esp+0x64], y ->
     [esp+0x6c] (post-push, x stored BEFORE y). v35: the pack now emits
     the typed AT_TYPE9_A106E0_5_817830 (61) to the fifth type-9 a106e0
     @ 0x008187a1 (hostArg0 / lroomNextVa = 0x008187a1). */
  let r = a102e019Both("v35 a102e0_19", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_5);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_5);
  assert.equal(r.wasmEv.type9A102e019XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e019YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e019(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e019XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e019YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e019XBits >>> 0, ev.type9A102e019YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e019(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e019YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  r = a102e019Both("v35 a102e0_19 next != twentieth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_5);
});

test("v35 817830 type9 fifth a106e0 seam after host a106e0 + mutant pin", () => {
  /* identity pack from dump 008187a1: [esp+0x30]/[esp+0xc]/[esp+0x28]
     (all three instruction operands AFTER the next-host push ecx at
     0x008187d5; resume-time slots [esp+0x2c]/[esp+8]/[esp+0x24]).
     v36: the seam now emits the typed AT_TYPE9_A102E0_20_817830 (62) to
     the twenty-first a102e0 @ 0x0081880c (peeled this ABI). */
  let r = a106e05Both("v36 a106e0_5", f32bits(3), f32bits(4), f32bits(2));
  /* v36: the seam now emits the typed AT_TYPE9_A102E0_20_817830 (62)
     to the twenty-first a102e0 @ 0x0081880c (was kind 30 LROOM_REMAIN
     at ABI v35). */
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20);
  assert.equal(r.wasmEv.type9A106e05XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e05YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e05AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e05GateBits >>> 0, 1);
  /* v36: the typed continuation recaptures (post-host float reads). */
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A106e05(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e05XBits >>> 0, f32bits(3));
  assert.equal(ev.type9A106e05YBits >>> 0, f32bits(4));
  assert.equal(ev.type9A106e05AngleBits >>> 0, f32bits(2));
  assert.equal(ev.type9A106e05GateBits >>> 0, 1,
    "byte-gate: mov byte [esp+0x140],1 read back as uint32_t & 0xff");
  assert.notEqual(ev.type9A106e05XBits >>> 0, ev.type9A106e05YBits >>> 0);
  assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20,
    "v36: the typed continuation carries pack-21 as arg0");

  r = a106e05Both("v35 a106e0_5 next != fifth seam", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_5);
  /* v36: typed continuation -> hostVa is the a102e0 leaf, arg0 pack-21 */
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
});

test("deep nested continuations (v26/v27 recapture contracts)", () => {
  const S = defaultState();
  const I = defaultInputs();
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);

  /* sprite pair B decided on the RECAPTURED pointer; null-after -> no call */
  writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, I);
  let js = M.gameRenderResumeSpritePairA(0x5000, 0, 1, 2, 3, 4);
  exp.isaac_game_render_slice_resume_sprite_pair_a(0x5000, 0, 1, 2, 3, 4, A_EVENTS);
  let ev = compareEvents("pairA null-after", js);
  assert.equal(ev.continuationKind, M.GAME_RENDER_CONTINUE_NESTED);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE);
  /* stale pair-B cache on the recaptured sprite -> vtable +0x48 dispatch */
  js = M.gameRenderResumeSpritePairA(0x5000, 0x6000, 1, 2, 3, 4);
  exp.isaac_game_render_slice_resume_sprite_pair_a(0x5000, 0x6000, 1, 2, 3, 4, A_EVENTS);
  ev = compareEvents("pairA dispatch", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_VT_408590_PAIR_B);
  assert.equal(ev.hostReceiver >>> 0, 0x6000, "receiver is the RECAPTURED sprite");
  assert.equal(ev.hostVtableSlot, 0x48);
  assert.equal(exp.isaac_game_render_slice_host_is_vtable(ev.hostKind), 1);
  /* matching cache -> no dispatch */
  js = M.gameRenderResumeSpritePairA(0x5000, 0x6000, 3, 4, 3, 4);
  exp.isaac_game_render_slice_resume_sprite_pair_a(0x5000, 0x6000, 3, 4, 3, 4, A_EVENTS);
  ev = compareEvents("pairA cached", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE);

  /* shared ptr: WIDE AddRef result 0x100 -> AL byte 0 -> ABORT (dest stays
     zeroed, no release, no hook) */
  js = M.gameRenderResumeSharedPtr(I, 0x100, 0x7000, 1);
  exp.isaac_game_render_slice_resume_shared_ptr(A_INPUTS, 0x100, 0x7000, 1, A_EVENTS);
  ev = compareEvents("sharedptr wide abort", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE);
  /* AddRef ok + RE-READ dest control nonzero -> release dispatch */
  js = M.gameRenderResumeSharedPtr(I, 1, 0x7000, 0);
  exp.isaac_game_render_slice_resume_shared_ptr(A_INPUTS, 1, 0x7000, 0, A_EVENTS);
  ev = compareEvents("sharedptr release", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_VT_40C550_RELEASE);
  assert.equal(ev.hostReceiver >>> 0, 0x7000, "receiver is the RE-READ control");
  assert.equal(ev.hostVtableSlot, 0x0c);
  /* AddRef ok + dest null + release-result byte set + hook installed */
  const inpHook = { ...I, datC7163c: 0xdead1000 };
  writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, inpHook);
  js = M.gameRenderResumeSharedPtr(inpHook, 1, 0, 0x101);
  exp.isaac_game_render_slice_resume_shared_ptr(A_INPUTS, 1, 0, 0x101, A_EVENTS);
  ev = compareEvents("sharedptr hook", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_HOOK_C7163C);
  assert.equal(ev.hostVa >>> 0, 0xdead1000);
  /* release-result wide 0x100 -> byte 0 -> no hook */
  js = M.gameRenderResumeSharedPtr(inpHook, 1, 0, 0x100);
  exp.isaac_game_render_slice_resume_shared_ptr(A_INPUTS, 1, 0, 0x100, A_EVENTS);
  ev = compareEvents("sharedptr no hook", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE);

  /* once-init: the guard RE-READ decides; -1 constructs, anything else
     means a racing thread already finished */
  js = M.gameRenderResumeOnceInit(0xffffffff);
  exp.isaac_game_render_slice_resume_once_init(0xffffffff, A_EVENTS);
  ev = compareEvents("once construct", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_ONCE_CTOR);
  assert.equal(ev.hostVa >>> 0, 0x006ef590);
  assert.equal(ev.allocCalls, 2);
  js = M.gameRenderResumeOnceInit(0);
  exp.isaac_game_render_slice_resume_once_init(0, A_EVENTS);
  ev = compareEvents("once skip", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE);
  js = M.gameRenderResumeOnceInit(0xfffffffe);
  exp.isaac_game_render_slice_resume_once_init(0xfffffffe, A_EVENTS);
  ev = compareEvents("once -2 skip", js);
  assert.equal(ev.hostKind, M.GAME_RENDER_HOST_NONE,
    "-2 is NOT -1: the resume compares the exact uninit sentinel");

  /* room type: split stage snapshots; float tables read from the SAME
     linear memory by both sides */
  const gameViewAll = new DataView(exp.memory.buffer);
  const roomIdx = 7;
  view.setFloat32(A_74F690_OBJ + 0x183b0 + roomIdx * 4, 0.55, true);
  view.setFloat32(A_74F690_OBJ + 0x18654 + roomIdx * 4, 0.35, true);
  const jsRt = M.gameRenderResumeRoomType(gameViewAll, S, A_74F690_OBJ,
    roomIdx, 3, 5, 0x99, roomIdx, 0, 0);
  exp.isaac_game_render_slice_resume_room_type(A_STATE, A_74F690_OBJ, roomIdx,
    3, 5, 0x99, roomIdx, 0, 0, A_OUT_TYPE, A_EVENTS);
  compareEvents("room type", jsRt.events);
  assert.equal(view.getUint32(A_OUT_TYPE, true), jsRt.type >>> 0);
  /* entry TYPE4 path: mode!=0x2c would return stage_type_4 — but the slice
     pins mode 0x2c; negative idx returns the type4 word */
  const jsRt2 = M.gameRenderResumeRoomType(gameViewAll, S, 0, -3, 3, 5,
    0xabc, 0, 0, 0);
  exp.isaac_game_render_slice_resume_room_type(A_STATE, 0, -3, 3, 5, 0xabc,
    0, 0, 0, A_OUT_TYPE, A_EVENTS);
  compareEvents("room type neg idx", jsRt2.events);
  /* stage split: entry stage decides the -10 gate, POST stage the dispatch */
  const jsRt3 = M.gameRenderResumeRoomType(gameViewAll, S, 0, -10, 7, 3,
    0x77, 0, 0, 0);
  exp.isaac_game_render_slice_resume_room_type(A_STATE, 0, -10, 7, 3, 0x77,
    0, 0, 0, A_OUT_TYPE, A_EVENTS);
  compareEvents("room type -10 womb", jsRt3.events);
  assert.equal(view.getUint32(A_OUT_TYPE, true), 4,
    "-10 with ENTRY stage 7 returns const 4 regardless of the post stage");
});

test("deterministic randomized chain differential (300)", () => {
  const S = defaultState();
  let seed = 0x8e4d5c01;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  const hi = (n) => rnd() >>> (32 - n);            /* HIGH bits, never % */
  const pick = (arr) => arr[hi(8) % arr.length >>> 0]; /* index from high 8 */
  const fadePool = [0, f32bits(0.5), f32bits(1), f32bits(-1), 0x7fc00000,
    0x80000000, f32bits(1e-4)];
  const bytePool = () => rnd(); /* FULL 32-bit, unmasked byte drives */

  for (let n = 0; n < 300; n += 1) {
    const world = {
      option2a3c3: bytePool(),
      option2a3c5: bytePool(),
      fade: pick(fadePool),
      flagsG2: rnd(),
      flagsG10: rnd(),
      flagsG12: rnd(),
      stage: pick([0x39, 3, 0, -1, 0x39, hi(6)]),
      gameModeEd55: pick([8, 0x1d, 0, 5, hi(5)]),
      gameModeEf08: pick([5, 5, 0, 8, hi(4)]),
      roomType: pick([0x59, 0x59, 0x58, 0, hi(7)]),
      pres38: pick([0, 1, 0x100, rnd()]),
      pres39: pick([0, 1, rnd()]),
      pres3a: pick([0, 1, rnd()]),
      pres3f: pick([0, 1, rnd()]),
      pres40: pick([0, 1, rnd()]),
      pres41: pick([0, 1, rnd()]),
      pres46: pick([0, 1, rnd()]),
      pres4e: pick([0, 1, rnd()]),
      pres4f: pick([0, 1, rnd()]),
      bitset26548Lo: rnd(), bitset2654cHi: rnd(),
      mgrFlags2654c: rnd(), mgrWord0Now: pick([6, 6, 0, 4, 3, rnd()]),
      mgrWord1Now: pick([4, 5, 0, rnd()]),
      mgrDifficulty269c8: pick([0, 0, 0, 2, 3, rnd()]),
      mgr1830cAfter: pick([1, 1, 0, 2, rnd()]),
      al827bc0: bytePool(), al74ea50: bytePool(),
      entryCount: pick([0, 1, 2, 3, 5, 0xffffffff]),
      posX: pick(fadePool), posY: pick(fadePool),
      flag6f49: bytePool(), flag6eb0: bytePool(),
      rtDepthCheck: pick([0, 1, 2, 0xffffffff]),
      rtDepthFinal: pick([0, 1, 2, 0xffffffff]),
      epilogFlag: pick([0, 1, 2, 0x100, 0x101, rnd()]),
      dst: [rnd(), rnd(), rnd(), rnd()],
      fadeReads: [rnd(), rnd(), rnd(), rnd(), rnd()],
      treeHead: rnd(), headRight4: rnd(),
      /* v3 817830-gate draws (post-GetStageID reads) */
      stageId: pick([0, 4, 5, 6, 0x1b, 0x1c, 9, 0x1d, rnd()]),
      slotValue: pick([0, 1, rnd()]),
      roomWord54: pick([0, 1, 0x80000000, -1, rnd()]),
      roomFlags44: pick([0, 0x20, 0x100020, 0x10, rnd()]),
      fade7240: pick(fadePool),
      mgr264f8: 60,
      treeHeadC379bc: 0x11223344,
      boundIsnil: 0,
      boundKey: 0xb3d14323,
      boundPtr: 0x55667788,
      roomDescType48: 9,
      valueAt14: 0x1234,
      byteAtValuePlus4: 0x101,
      roomPtr: 0x1000,
      nestedDesc: 0x2000,
      scaleA8Bits: 0x40800000,
      mul005Bits: 0x3f800000,
      mul05Bits: 0x40000000,
      offsetCBits: 0x40400000,
      scale70Bits: 0x40800000,
      halfABits: 0x40000000,
      halfBBits: 0x40000000,
      offsetAcBits: 0x40400000,
      scale6cBits: 0x40000000,
      offsetA8Bits: 0x40400000,
      y3Bits: 0x40800000,
      offset10Bits: 0x40800000,
      halfA94Bits: 0x40400000,
      scale28Bits: 0x40000000,
      offset40Bits: 0x40c00000,
      offset48Bits: 0x40a00000,
      offset30Bits: 0x40400000,
      offset9cBits: 0x40a00000,
      eaxXBits: 0x40400000,
      eaxYBits: 0x40800000,
      mul14Bits: 0x3f000000,
    };
    /* entity sequences: bounded, with grows/shrinks and wraps */
    const segLen = 1 + (hi(3) & 3);
    world.baseSeq = [];
    world.countSeq = [];
    for (let i = 0; i < segLen; i += 1) {
      world.baseSeq.push(rnd());
      world.countSeq.push(pick([0, 1, 2, segLen, segLen + 1, 0xffffffff]));
    }
    const slotsLen = hi(3) & 7;
    world.slots = [];
    for (let i = 0; i < slotsLen; i += 1) world.slots.push(pick([0, 0, rnd()]));
    world.gridW = pick([0, 1, 2, 3, -1, 0x10000]);
    world.gridH = pick([0, 1, 2, 3, -2, 0x10000]);

    const I = {
      ...defaultInputs(),
      option2a3c3: world.option2a3c3,
      option2a3c5: world.option2a3c5,
      mgrFade26518Bits: world.fade,
      mgrFade2651cBits: pick(fadePool),
      mgr26550: rnd() & 0xf, mgrWord0c: rnd() & 0xf,
      pres38: world.pres38,
      pres39: world.pres39,
      pres3a: world.pres3a,
      pres3f: world.pres3f,
      pres40: world.pres40,
      pres41: world.pres41,
      pres46: world.pres46,
      pres4e: world.pres4e,
      pres4f: world.pres4f,
      mgrWord0Now: world.mgrWord0Now,
      mgrWord1Now: world.mgrWord1Now,
      mgrFlags2654c: world.mgrFlags2654c,
      mgrDifficulty269c8: world.mgrDifficulty269c8,
      bitset26548Lo: world.bitset26548Lo,
      bitset2654cHi: world.bitset2654cHi,
      mgr1830c: world.mgr1830cAfter,
      mgr67734Bits: pick(fadePool),
      mgrCamX2650cBits: pick(fadePool), mgrCamY26510Bits: pick(fadePool),
      datC798e4: rnd(),
      datC379b8Snap: pick([0, rnd()]), datC379b8Now: rnd(),
      c379b8Byte4: bytePool(),
      datC78dc4Bits: pick(fadePool), datC78edcBits: pick(fadePool),
      datC3793cBits: rnd(), datC37940Bits: rnd(),
      datC79790: world.rtDepthCheck, datC7978c: rnd(),
      datC71678: rnd(), datC7163c: pick([0, rnd()]),
      mgr264f8: world.mgr264f8,
      datC379bc: world.treeHeadC379bc,
    };

    /* lock-step walk; both sides must agree at every stop */
    let carried = { locals: [0, 0, 0], base: 0, boost: 0, camera: [0, 0] };
    let stepIndex = 0;
    const drive = (label, jsCall, wasmCall) => {
      writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
      writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, I);
      const js = jsCall();
      wasmCall();
      return { ev: compareEvents(`case ${n} step ${stepIndex} ${label}`, js), js };
    };
    let { ev } = drive("step",
      () => M.gameRenderStep(S, I),
      () => exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS));
    let guard = 0;
    /* v35: the nineteenth/twentieth a102e0 pack peels and the fifth
       a106e0 seam peel add the 59/60/61 hops to the open body chain
       (25..61 -> 30 -> 20 -> 21 -> 1/22 -> 23); the longest legal
       chain is 59 steps, so the guard must sit above that to only
       catch true loops. */
    while (ev.continuationKind !== M.GAME_RENDER_CONTINUE_AT_EPILOG_820FD0 &&
           guard < 60) {
      guard += 1;
      stepIndex += 1;
      const k = ev.continuationKind;
      if (k === M.GAME_RENDER_CONTINUE_AT_EPILOG_825DE0) {
        ({ ev } = drive("epilog",
          () => M.gameRenderResumeEpilog(S, world.epilogFlag),
          () => exp.isaac_game_render_slice_resume_epilog(A_STATE, world.epilogFlag, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_RT_REBIND) {
        ({ ev } = drive("prep",
          () => M.gameRenderResumeFadePrep(S, I, world.fadeReads[0],
            world.fadeReads[1], world.fadeReads[2], world.fadeReads[3],
            world.fadeReads[4], world.flagsG2),
          () => exp.isaac_game_render_slice_resume_fade_prep(A_STATE, A_INPUTS,
            world.fadeReads[0], world.fadeReads[1], world.fadeReads[2],
            world.fadeReads[3], world.fadeReads[4], world.flagsG2, A_EVENTS)));
        carried.locals = [ev.fadeLocalRBits, ev.fadeLocalGBits, ev.fadeLocalBBits];
      } else if (k === M.GAME_RENDER_CONTINUE_AT_BIND_A1DFD0) {
        ({ ev } = drive("stage",
          () => M.gameRenderResumeFadeStage(S, I, world.stage,
            world.fadeReads[0], world.fadeReads[1], world.flagsG10),
          () => exp.isaac_game_render_slice_resume_fade_stage(A_STATE, A_INPUTS,
            world.stage, world.fadeReads[0], world.fadeReads[1], world.flagsG10,
            A_EVENTS)));
        carried.camera = [ev.cameraXBits, ev.cameraYBits];
      } else if (k === M.GAME_RENDER_CONTINUE_AT_STAGE39 ||
                 k === M.GAME_RENDER_CONTINUE_AT_COLOR_BIND ||
                 k === M.GAME_RENDER_CONTINUE_AT_TREE_ERASE_ENTRY) {
        ({ ev } = drive("tree",
          () => M.gameRenderResumeTreeErase(S, I, world.treeHead, world.headRight4),
          () => exp.isaac_game_render_slice_resume_tree_erase(A_STATE, A_INPUTS,
            world.treeHead, world.headRight4, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_FADE_POLLS) {
        ({ ev } = drive("polls",
          () => M.gameRenderResumeFadePolls(S, I, world.gameModeEd55),
          () => exp.isaac_game_render_slice_resume_fade_polls(A_STATE, A_INPUTS,
            world.gameModeEd55, A_EVENTS)));
        carried.base = ev.fadeBaseBits;
        carried.boost = ev.fadeBoost;
      } else if (k === M.GAME_RENDER_CONTINUE_AT_BOOST_74EFD0) {
        ({ ev } = drive("boostA",
          () => M.gameRenderResumeBoost74efd0(S, I, world.mgr1830cAfter),
          () => exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE,
            A_INPUTS, world.mgr1830cAfter, A_EVENTS)));
        if (ev.fadeBoost) carried.boost = 1;
      } else if (k === M.GAME_RENDER_CONTINUE_AT_BOOST_827BC0) {
        ({ ev } = drive("boostB",
          () => M.gameRenderResumeBoost827bc0(S, I, world.al827bc0),
          () => exp.isaac_game_render_slice_resume_boost_827bc0(A_STATE, A_INPUTS,
            world.al827bc0, A_EVENTS)));
        carried.boost = ev.fadeBoost;
      } else if (k === M.GAME_RENDER_CONTINUE_AT_FADE_CLOSE) {
        ({ ev } = drive("close",
          () => M.gameRenderResumeFadeClose(S, I, carried.base, carried.boost,
            world.flagsG12, carried.locals[0], carried.locals[1],
            carried.locals[2], world.dst[0], world.dst[1], world.dst[2],
            world.dst[3]),
          () => exp.isaac_game_render_slice_resume_fade_close(A_STATE, A_INPUTS,
            carried.base, carried.boost, world.flagsG12, carried.locals[0],
            carried.locals[1], carried.locals[2], world.dst[0], world.dst[1],
            world.dst[2], world.dst[3], A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TREE_ERASE ||
                 k === M.GAME_RENDER_CONTINUE_AT_ENTITY) {
        writeSeq(A_BASE_SEQ, world.baseSeq);
        writeSeq(A_COUNT_SEQ, world.countSeq);
        const jsE = (() => {
          writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
          writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, I);
          return M.gameRenderResumeEntity(S, world.entryCount, world.baseSeq,
            world.countSeq);
        })();
        exp.isaac_game_render_slice_resume_entity(A_STATE, world.entryCount,
          A_BASE_SEQ, A_COUNT_SEQ,
          Math.min(world.baseSeq.length, world.countSeq.length), A_OUT_SLOTS,
          A_EVENTS);
        ev = compareEvents(`case ${n} step ${stepIndex} entity`, jsE);
        if (ev.continuationKind === M.GAME_RENDER_CONTINUE_AT_ENTITY) {
          /* exhaustion: pretend the next recapture closes the loop */
          world.entryCount = 0;
        }
      } else if (k === M.GAME_RENDER_CONTINUE_AT_GRID_ENTRY) {
        writeSeq(A_GRID_SLOTS, world.slots);
        const jsG = (() => {
          writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
          return M.gameRenderResumeGrid(S, world.gridW, world.gridH, world.slots);
        })();
        exp.isaac_game_render_slice_resume_grid(A_STATE, world.gridW,
          world.gridH, A_GRID_SLOTS, world.slots.length, A_EVENTS);
        ev = compareEvents(`case ${n} step ${stepIndex} grid`, jsG);
        if (ev.continuationKind === M.GAME_RENDER_CONTINUE_AT_GRID &&
            ev.sampleExhausted) {
          /* under-supplied grids re-enter with a full supply next round */
          world.gridW = 0;
        }
      } else if (k === M.GAME_RENDER_CONTINUE_AT_GRID ||
                 k === M.GAME_RENDER_CONTINUE_AT_OVERLAY_GATE) {
        ({ ev } = drive("overlayGate",
          () => M.gameRenderResumeOverlayGate(S, I, world.gameModeEf08, world.roomType,
            world.posX, world.posY, world.flag6f49, world.flag6eb0),
          () => exp.isaac_game_render_slice_resume_overlay_gate(A_STATE, A_INPUTS,
            world.gameModeEf08, world.roomType, world.posX, world.posY,
            world.flag6f49, world.flag6eb0, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_ANIM_RENDER ||
                 k === M.GAME_RENDER_CONTINUE_AT_AUX_GATE) {
        ({ ev } = drive("auxGate",
          () => M.gameRenderResumeAuxGate(S, I),
          () => exp.isaac_game_render_slice_resume_aux_gate(A_STATE, A_INPUTS, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_AUX_POLLS) {
        ({ ev } = drive("auxPolls",
          () => M.gameRenderResumeAuxPolls(S, I),
          () => exp.isaac_game_render_slice_resume_aux_polls(A_STATE, A_INPUTS, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_GET_STAGE_ID_817830) {
        ({ ev } = drive("gsidGate",
          () => M.gameRenderResume817830Gate(S, I, world.stageId,
            world.slotValue, world.roomWord54, world.roomFlags44,
            world.fade7240),
          () => exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
            world.stageId, world.slotValue, world.roomWord54,
            world.roomFlags44, world.fade7240, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TRUNK_817830) {
        /* v4: post-TRUNK recaptures -> pure prefix -> conditional a14050
           value recapture -> tail host -> rt pop chain */
        ({ ev } = drive("prefix",
          () => M.gameRenderResume817830Prefix(S, I, world.stageId,
            world.roomWord54, world.roomFlags44, world.fade7240,
            world.mgr264f8, world.treeHeadC379bc, world.boundIsnil,
            world.boundKey, world.boundPtr, world.roomDescType48),
          () => exp.isaac_game_render_slice_resume_817830_prefix(A_STATE,
            A_INPUTS, world.stageId, world.roomWord54, world.roomFlags44,
            world.fade7240, world.mgr264f8, world.treeHeadC379bc,
            world.boundIsnil, world.boundKey, world.boundPtr,
            world.roomDescType48, A_EVENTS)));
        if (ev.continuationKind === M.GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830) {
          ({ ev } = drive("a14050Value",
            () => M.gameRenderResume817830A14050Value(S, I, world.stageId,
              world.roomWord54, world.roomFlags44, world.fade7240,
              world.mgr264f8, world.roomDescType48, world.valueAt14,
              world.byteAtValuePlus4),
            () => exp.isaac_game_render_slice_resume_817830_a14050_value(
              A_STATE, A_INPUTS, world.stageId, world.roomWord54,
              world.roomFlags44, world.fade7240, world.mgr264f8,
              world.roomDescType48, world.valueAt14,
              world.byteAtValuePlus4, A_EVENTS)));
        }
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TAIL_817830 ||
                 k === M.GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830) {
        ({ ev } = drive("rtBegin",
          () => M.gameRenderResumeRtPopBegin(S, I),
          () => exp.isaac_game_render_slice_resume_rt_pop_begin(A_STATE, A_INPUTS, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_LROOM_PACK_817830) {
        ({ ev } = drive("lroomPack",
          () => M.gameRenderResume817830LroomPack(S, I, world.roomPtr,
            world.nestedDesc, world.roomDescType48, world.scaleA8Bits,
            world.mul005Bits, world.mul05Bits, world.offsetCBits),
          () => exp.isaac_game_render_slice_resume_817830_lroom_pack(A_STATE,
            A_INPUTS, world.roomPtr, world.nestedDesc, world.roomDescType48,
            world.scaleA8Bits, world.mul005Bits, world.mul05Bits,
            world.offsetCBits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL1_817830) {
        ({ ev } = drive("type9Cell1",
          () => M.gameRenderResume817830Type9Cell1(S, I, world.scale70Bits,
            world.halfABits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell1(A_STATE,
            A_INPUTS, world.scale70Bits, world.halfABits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL2_817830) {
        ({ ev } = drive("type9Cell2",
          () => M.gameRenderResume817830Type9Cell2(S, I, world.halfBBits,
            world.offsetAcBits, world.mul05Bits, world.halfABits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell2(A_STATE,
            A_INPUTS, world.halfBBits, world.offsetAcBits, world.mul05Bits,
            world.halfABits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL3_817830) {
        ({ ev } = drive("type9Cell3",
          () => M.gameRenderResume817830Type9Cell3(S, I, world.scale6cBits,
            world.offsetA8Bits, world.y3Bits, world.offsetAcBits,
            world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell3(A_STATE,
            A_INPUTS, world.scale6cBits, world.offsetA8Bits, world.y3Bits,
            world.offsetAcBits, world.mul05Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL4_817830) {
        ({ ev } = drive("type9Cell4",
          () => M.gameRenderResume817830Type9Cell4(S, I, world.offsetA8Bits,
            world.scale70Bits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell4(A_STATE,
            A_INPUTS, world.offsetA8Bits, world.scale70Bits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL5_817830) {
        ({ ev } = drive("type9Cell5",
          () => M.gameRenderResume817830Type9Cell5(S, I, world.scale6cBits,
            world.offset10Bits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell5(A_STATE,
            A_INPUTS, world.scale6cBits, world.offset10Bits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_CELL6_817830) {
        ({ ev } = drive("type9Cell6",
          () => M.gameRenderResume817830Type9Cell6(S, I, world.halfA94Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_cell6(A_STATE,
            A_INPUTS, world.halfA94Bits, world.offsetCBits, world.scale28Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_0_817830) {
        ({ ev } = drive("type9A102e00",
          () => M.gameRenderResume817830Type9A102e00(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_0(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_1_817830) {
        ({ ev } = drive("type9A102e01",
          () => M.gameRenderResume817830Type9A102e01(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_1(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_2_817830) {
        ({ ev } = drive("type9A102e02",
          () => M.gameRenderResume817830Type9A102e02(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_2(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_3_817830) {
        ({ ev } = drive("type9A102e03",
          () => M.gameRenderResume817830Type9A102e03(S, I, world.eaxXBits,
            world.eaxYBits, world.mul14Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_3(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul14Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_817830) {
        ({ ev } = drive("type9A106e0",
          () => M.gameRenderResume817830Type9A106e0(S, I, world.offset9cBits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0(A_STATE,
            A_INPUTS, world.offset9cBits, world.offsetCBits, world.scale28Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_4_817830) {
        ({ ev } = drive("type9A102e04",
          () => M.gameRenderResume817830Type9A102e04(S, I, world.eaxXBits,
            world.eaxYBits, world.mul14Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_4(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul14Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_5_817830) {
        ({ ev } = drive("type9A102e05",
          () => M.gameRenderResume817830Type9A102e05(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_5(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_6_817830) {
        ({ ev } = drive("type9A102e06",
          () => M.gameRenderResume817830Type9A102e06(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_6(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830) {
        ({ ev } = drive("type9A102e07",
          () => M.gameRenderResume817830Type9A102e07(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_7(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830) {
        ({ ev } = drive("type9A106e02",
          () => M.gameRenderResume817830Type9A106e02(S, I, world.offset40Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_2(A_STATE,
            A_INPUTS, world.offset40Bits, world.offsetCBits, world.scale28Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830) {
        ({ ev } = drive("type9A102e08",
          () => M.gameRenderResume817830Type9A102e08(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_8(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830) {
        ({ ev } = drive("type9A102e09",
          () => M.gameRenderResume817830Type9A102e09(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_9(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830) {
        ({ ev } = drive("type9A102e010",
          () => M.gameRenderResume817830Type9A102e010(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_10(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830) {
        ({ ev } = drive("type9A102e011",
          () => M.gameRenderResume817830Type9A102e011(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_11(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830) {
        ({ ev } = drive("type9A106e03",
          () => M.gameRenderResume817830Type9A106e03(S, I, world.offset48Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
            A_INPUTS, world.offset48Bits, world.offsetCBits, world.scale28Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830) {
        ({ ev } = drive("type9A106e04",
          () => M.gameRenderResume817830Type9A106e04(S, I, world.offsetA8Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(A_STATE,
            A_INPUTS, world.offsetA8Bits, world.offsetCBits, world.scale28Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830) {
        ({ ev } = drive("type9A102e012",
          () => M.gameRenderResume817830Type9A102e012(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_12(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830) {
        ({ ev } = drive("type9A102e013",
          () => M.gameRenderResume817830Type9A102e013(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_13(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830) {
        ({ ev } = drive("type9A102e014",
          () => M.gameRenderResume817830Type9A102e014(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_14(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830) {
        ({ ev } = drive("type9A102e015",
          () => M.gameRenderResume817830Type9A102e015(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830) {
        ({ ev } = drive("type9A102e016",
          () => M.gameRenderResume817830Type9A102e016(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830) {
        ({ ev } = drive("type9A102e017",
          () => M.gameRenderResume817830Type9A102e017(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830) {
        ({ ev } = drive("type9A102e018",
          () => M.gameRenderResume817830Type9A102e018(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_18(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830) {
        ({ ev } = drive("type9A102e019",
          () => M.gameRenderResume817830Type9A102e019(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_19(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830) {
        ({ ev } = drive("type9A106e05",
          () => M.gameRenderResume817830Type9A106e05(S, I, world.offset30Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_5(A_STATE,
            A_INPUTS, world.offset30Bits, world.offsetCBits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_20_817830) {
        ({ ev } = drive("type9A102e020",
          () => M.gameRenderResume817830Type9A102e020(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_20(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830) {
        ({ ev } = drive("type9A102e021",
          () => M.gameRenderResume817830Type9A102e021(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_21(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830) {
        ({ ev } = drive("type9A102e022",
          () => M.gameRenderResume817830Type9A102e022(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_22(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830) {
        ({ ev } = drive("type9A102e023",
          () => M.gameRenderResume817830Type9A102e023(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_23(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180) {
        I.datC79790 = world.rtDepthCheck; /* the required inputs refresh */
        ({ ev } = drive("rtCheck",
          () => M.gameRenderResumeRtPopCheck(S, I),
          () => exp.isaac_game_render_slice_resume_rt_pop_check(A_STATE, A_INPUTS, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_RT_POP_RESTORE) {
        I.datC79790 = world.rtDepthFinal; /* second refresh */
        ({ ev } = drive("rtFinal",
          () => M.gameRenderResumeRtPopFinal(S, I),
          () => exp.isaac_game_render_slice_resume_rt_pop_final(A_STATE, A_INPUTS, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_EPILOG_826AE0) {
        ({ ev } = drive("epilogFinal",
          () => M.gameRenderResumeEpilogFinal(S),
          () => exp.isaac_game_render_slice_resume_epilog_final(A_STATE, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830) {
        /* the sixth a106e0 seam @ 0x0081895a is not peeled yet (parked
           since ABI 39): the chain terminates here by construction. */
        break;
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830) {
        ({ ev } = drive("type9A102e024",
          () => M.gameRenderResume817830Type9A102e024(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_24(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830) {
        ({ ev } = drive("type9A102e025",
          () => M.gameRenderResume817830Type9A102e025(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_25(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830) {
        ({ ev } = drive("type9A102e026",
          () => M.gameRenderResume817830Type9A102e026(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_26(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830) {
        ({ ev } = drive("type9A102e027",
          () => M.gameRenderResume817830Type9A102e027(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_27(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830) {
        ({ ev } = drive("type9A106e07",
          () => M.gameRenderResume817830Type9A106e07(S, I, world.offset48Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_7(A_STATE,
            A_INPUTS, world.offset48Bits, world.offsetCBits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830) {
        ({ ev } = drive("type9A102e028",
          () => M.gameRenderResume817830Type9A102e028(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_28(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830) {
        ({ ev } = drive("type9A102e029",
          () => M.gameRenderResume817830Type9A102e029(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_29(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830) {
        ({ ev } = drive("type9A106e08",
          () => M.gameRenderResume817830Type9A106e08(S, I, world.offset40Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_8(A_STATE,
            A_INPUTS, world.offset40Bits, world.offsetCBits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830) {
        ({ ev } = drive("type9A102e031",
          () => M.gameRenderResume817830Type9A102e031(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_31(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830) {
        ({ ev } = drive("type9A102e032",
          () => M.gameRenderResume817830Type9A102e032(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_32(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830) {
        ({ ev } = drive("type9A102e033",
          () => M.gameRenderResume817830Type9A102e033(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_33(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830) {
        ({ ev } = drive("type9A102e034",
          () => M.gameRenderResume817830Type9A102e034(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_34(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830) {
        ({ ev } = drive("type9A106e09",
          () => M.gameRenderResume817830Type9A106e09(S, I, world.offset9cBits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_9(A_STATE,
            A_INPUTS, world.offset9cBits, world.offsetCBits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_35_817830) {
        ({ ev } = drive("type9A102e035",
          () => M.gameRenderResume817830Type9A102e035(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_35(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830) {
        ({ ev } = drive("type9A102e036",
          () => M.gameRenderResume817830Type9A102e036(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_36(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830) {
        ({ ev } = drive("type9A102e037",
          () => M.gameRenderResume817830Type9A102e037(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_37(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830) {
        ({ ev } = drive("type9A102e038",
          () => M.gameRenderResume817830Type9A102e038(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_38(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830) {
        ({ ev } = drive("type9A106e010",
          () => M.gameRenderResume817830Type9A106e010(S, I, world.offset90Bits,
            world.offset8Bits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_10(A_STATE,
            A_INPUTS, world.offset90Bits, world.offset8Bits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830) {
        ({ ev } = drive("type9A102e039",
          () => M.gameRenderResume817830Type9A102e039(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_39(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830) {
        ({ ev } = drive("type9A102e040",
          () => M.gameRenderResume817830Type9A102e040(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_40(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830) {
        ({ ev } = drive("type9A102e041",
          () => M.gameRenderResume817830Type9A102e041(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_41(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830) {
        ({ ev } = drive("type9A102e042",
          () => M.gameRenderResume817830Type9A102e042(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_42(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_11_817830) {
        ({ ev } = drive("type9A106e011",
          () => M.gameRenderResume817830Type9A106e011(S, I, world.offset30Bits,
            world.offsetCBits, world.scale28Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_11(A_STATE,
            A_INPUTS, world.offset30Bits, world.offsetCBits,
            world.scale28Bits, A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_43_817830) {
        ({ ev } = drive("type9A102e043",
          () => M.gameRenderResume817830Type9A102e043(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_43(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830) {
        ({ ev } = drive("type9A102e044",
          () => M.gameRenderResume817830Type9A102e044(S, I, world.eaxXBits,
            world.eaxYBits, world.mul05Bits),
          () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_44(A_STATE,
            A_INPUTS, world.eaxXBits, world.eaxYBits, world.mul05Bits,
            A_EVENTS)));
      } else if (k === M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830) {
        /* pack 45 @ 0x0081a04d is not peeled yet (parked at ABI 53): */
        break;
      } else {
        assert.fail(`case ${n}: unexpected continuation ${k}`);
      }
    }
    assert.ok(guard < 60, `case ${n}: chain did not terminate`);
  }
});

test("byte-width discipline on the slice boundary", () => {
  /* No uint8_t scalar parameter anywhere in the slice header: the Wasm ABI
     does not narrow i32 args and -O2 deletes masks on uint8_t params. */
  const sliceHdr = readFileSync(
    join(root, "native", "decomp", "game_render_slice.h"), "utf8");
  assert.deepEqual(sliceHdr.match(/\buint8_t\s+[A-Za-z_]\w*\s*[,)]/g) ?? [], [],
    "uint8_t scalar parameter left in game_render_slice.h");
  assert.deepEqual(sliceHdr.match(/\buint8_t\s+isaac_game_render_slice_\w+\s*\(/g) ?? [], [],
    "uint8_t return type left in game_render_slice.h");
  /* wide drives across the slice boundary were exercised above; pin the
     three sharpest ones again as direct calls */
  const S = defaultState();
  writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, S);
  writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS,
    { ...defaultInputs(), option2a3c3: 0x100 });
    const iBody = M.GAME_RENDER_EVENT_FIELDS.indexOf("bodySkipped");
  const iFlag = M.GAME_RENDER_EVENT_FIELDS.indexOf("flag11f6Cleared");
  assert.ok(iBody >= 0 && iFlag >= 0, "event fields for byte-width pins exist");
  exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS);
  assert.equal(view.getUint32(A_EVENTS + iBody * 4, true), 1,
    "0x100 option byte is 0 -> skipped");
  exp.isaac_game_render_slice_resume_epilog(A_STATE, 0x101, A_EVENTS);
  assert.equal(view.getUint32(A_EVENTS + iFlag * 4, true), 1,
    "0x101 flag byte is 1 -> oneshot");
  exp.isaac_game_render_slice_resume_epilog(A_STATE, 0x100, A_EVENTS);
  assert.equal(view.getUint32(A_EVENTS + iFlag * 4, true), 0,
    "0x100 flag byte is 0 -> no oneshot");
});

test("mutation checks: planted slices must fail their own pins", () => {
  /* Every mutant rebuilds the slice with ONE flipped term and re-runs a PE-
     truth scenario; the assertion must throw, proving the pin discriminates.
     The source is restored in a finally before anything can escape. */
  const withMutant = (label, mutate, check) => {
    const raw = readFileSync(sliceSource, "utf8");
    const base = raw.replace(/\r\n/g, "\n");
    const bad = mutate(base);
    assert.notEqual(bad, base, `${label}: mutant did not apply`);
    writeSourceRetry(bad.replace(/\n/g, "\r\n"));
    let threw = false;
    try {
      exp = loadExports();
      view = new DataView(exp.memory.buffer);
      check();
    } catch {
      threw = true;
    } finally {
      writeSourceRetry(raw);
    }
    assert.ok(threw, `${label}: mutant survived every pinned assertion`);
  };

  try {
    withMutant("M1: step G0 gate inverted",
      (b) => b.replace(
        "static_cast<uint8_t>(inputs->option_2a3c3 & 0xffu)) == 0) {",
        "static_cast<uint8_t>(inputs->option_2a3c3 & 0xffu)) != 0) {"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS,
          { ...defaultInputs(), option2a3c3: 0x101 });
        exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind, M.GAME_RENDER_CONTINUE_AT_RT_REBIND,
          "M1: 0x101 byte 1 opens the body");
        assert.equal(ev.bodySkipped, 0, "M1: body is not skipped");
      });

    withMutant("M2 boost827bc0 mask drop",
      (b) => b.replace(
        "events->fade_boost = (al_827bc0 & 0xffu) != 0u ? 1u : 0u;",
        "events->fade_boost = al_827bc0 != 0u ? 1u : 0u;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_boost_827bc0(A_STATE, A_INPUTS,
          0x100, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.fadeBoost, 0, "M2: AL of 0x100 is 0 -> no boost");
      });

    withMutant("M3 epilog oneshot inverted",
      (b) => b.replace(
        "if (ran != 0) {\n    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_826AE0,",
        "if (ran == 0) {\n    emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_EPILOG_826AE0,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        exp.isaac_game_render_slice_resume_epilog(A_STATE, 0x101, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.flag11f6Cleared, 1, "M3: oneshot fires for byte 1");
        assert.equal(ev.continuationKind, M.GAME_RENDER_CONTINUE_AT_EPILOG_826AE0,
          "M3: firing goes through the 0x826ae0 finalizer");
      });

    withMutant("M4 817830 gate slot-exit inverted",
      (b) => b.replace(
        "if (slot_value_after == 0u) {",
        "if (slot_value_after != 0u) {"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_gate(A_STATE, A_INPUTS,
          4, 0, 0, 0x20, 0, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert(ev.bodySkipped === 1, "M4: empty slot skips the body");
        assert(ev.continuationKind === M.GAME_RENDER_CONTINUE_AT_RT_POP_A19180,
          "M4: closed slot goes to the RT pop chain");
      });

    /* ---------------- v4: 0x00817830 prefix mutations ---------------- */

    withMutant("M5: blend comiss NaN direction inverted",
      (b) => b.replace(
        "if (!(fade > 0.0f)) {\n    return base_t;\n  }",
        "if (fade > 0.0f) {\n    return base_t;\n  }"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_prefix(A_STATE, A_INPUTS,
          5, 15, 0x20, 0x7fc00000, 0, 0x11223344, 1, 0, 0x55667788, 9,
          A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.tailBlend398Bits >>> 0, 0x3f000000,
          "M5: NaN fade keeps the base (no lerp)");
      });

    withMutant("M6: ladder span narrowed to <4",
      (b) => b.replace(
        "return adj <= 3u ? ISAAC_GAME_RENDER_VA_BODY_817830_LROOM",
        "return adj < 3u ? ISAAC_GAME_RENDER_VA_BODY_817830_LROOM"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_prefix(A_STATE, A_INPUTS,
          0, 0, 0, 0, 0, 0x11223344, 1, 0, 0, 12, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.tailStartVa >>> 0, M.GAME_RENDER_VA_BODY_817830_LROOM,
          "M6: type 12 is inside the 9..12 ladder");
      });

    withMutant("M7: chain plan key compare flipped to >",
      (b) => b.replace(
        "key >= bound_key_after &&",
        "key > bound_key_after &&"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_prefix(A_STATE, A_INPUTS,
          0, 0, 0, 0, 0, 0x11223344, 0, 0xb3d14323, 0x55667788, 9,
          A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.a14050Found, 1, "M7: exact key is FOUND (>=)");
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830,
          "M7: found path recaptures the value");
      });

    withMutant("M8: a14050 value-store byte gate mask dropped",
      (b) => b.replace(
        "(byte_at_value_plus_4_after & 0xffu & 1u) != 0u)",
        "byte_at_value_plus_4_after != 0u)"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_a14050_value(A_STATE,
          A_INPUTS, 0, 0, 0, 0, 0, 9, 0x1234, 0x100, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.c379b8StoreApplied, 0,
          "M8: wide 0x100 has byte 0 -> no store");
      });

    withMutant("M9: minss clamp direction inverted",
      (b) => b.replace(
        "const float clamped = raw > 1.0f ? 1.0f : raw;",
        "const float clamped = raw > 1.0f ? raw : 1.0f;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_prefix(A_STATE, A_INPUTS,
          0x1c, 90, 0x20, 0, 0, 0x11223344, 1, 0, 0x55667788, 9, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.tailBlend398Bits >>> 0, 0x3f800000,
          "M9: 90/30 clamps to base 1.0");
      });

    withMutant("M10: found-path control flow inverted",
      (b) => b.replace(
        "if (found == 0) {\n    /* FAIL: the PE returns al=0 at 0x00a140b6",
        "if (found != 0) {\n    /* FAIL: the PE returns al=0 at 0x00a140b6"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_prefix(A_STATE, A_INPUTS,
          0, 0, 0, 0, 0, 0x11223344, 0, 0, 0x55667788, 9, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_A14050_VALUE_817830,
          "M10: found plan recaptures the value deref");
      });

    /* ---------------- v5: pure 0x74efd0 probe body mutations ------------- */

    const probeAlPin = (label, inputs, want) => () => {
      writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
      writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS,
        { ...defaultInputs(), mgrMode26584: 0, mgrWord0Now: 4, mgrWord1Now: 5,
          ...inputs });
      const al = exp.isaac_game_render_slice_boost_74efd0_al(A_INPUTS) >>> 0;
      assert.equal(al, want, label);
    };

    withMutant("M11: difficulty early-false ANDed",
      (b) => b.replace(
        "if (difficulty == 2 || difficulty == 3) return 0;",
        "if (difficulty == 2 && difficulty == 3) return 0;"),
      probeAlPin("M11: difficulty 2 closes the probe", { mgrDifficulty269c8: 2 }, 0));

    withMutant("M12: flag early-false mask bit 16 -> 12",
      (b) => b.replace(
        "if ((inputs->mgr_flags_2654c & 0x10000u) != 0u) {",
        "if ((inputs->mgr_flags_2654c & 0x1000u) != 0u) {"),
      probeAlPin("M12: flags bit12 does NOT close",
        { mgrWord0Now: 1, mgrFlags2654c: 0x1000 }, 1));

    withMutant("M13: this0==4 arm flips to AL=0",
      (b) => b.replace(
        "if (this0 == 4u) return 1;",
        "if (this0 == 4u) return 0;"),
      probeAlPin("M13: this0=4 opens", {}, 1));

    withMutant("M14: poll combine bit2 -> bit1",
      (b) => b.replace(
        "return (combined & 2u) != 0u ? 1u : 0u;",
        "return (combined & 1u) != 0u ? 1u : 0u;"),
      probeAlPin("M14: combine bit2 opens", { mgrWord0Now: 3, mgr26550: 2 }, 1));

    withMutant("M15: mgr_or dropped from the poll combine",
      (b) => b.replace(
        "const uint32_t combined = (~m.poll_b) & (m.poll_a | mgr_or);",
        "const uint32_t combined = (~m.poll_b) & m.poll_a;"),
      probeAlPin("M15: mgr+0xc bit2 opens", { mgrWord0Now: 3, mgrWord0c: 2 }, 1));

    withMutant("M16: resume gate ORed instead of ANDed",
      (b) => b.replace(
        "if (boost_74efd0_al(inputs) != 0u && mgr_1830c_after == 1u) {",
        "if (boost_74efd0_al(inputs) != 0u || mgr_1830c_after == 1u) {"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS,
          { ...defaultInputs(), mgrDifficulty269c8: 2 });
        exp.isaac_game_render_slice_resume_boost_74efd0(A_STATE, A_INPUTS,
          1, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_BOOST_827BC0,
          "M16: AL=0 + mgr word 1 still probes B");
        assert.equal(ev.fadeBoost, 0, "M16: no boost on the false arm");
      });

    withMutant("M17: this4 set narrowed to {4}",
      (b) => b.replace(
        "if (this4 != 4u && this4 != 5u) return 0;",
        "if (this4 != 4u) return 0;"),
      probeAlPin("M17: this4=5 opens", { mgrWord1Now: 5 }, 1));

    withMutant("M18: G23 type==9 inverted",
      (b) => b.replace(
        "if (isaac_render_shell_817830_room_type_eq_9(\n          static_cast<int32_t>(room_type48_after)) == 0) {",
        "if (isaac_render_shell_817830_room_type_eq_9(\n          static_cast<int32_t>(room_type48_after)) != 0) {"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_lroom_pack(A_STATE, A_INPUTS,
          0x1000, 0x2000, 9, 0, 0, 0, 0, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A10690,
          "M18: type 9 remains the typed a10690 host");
        assert.equal(ev.lroomQuadInits, 12, "M18: 12 quads still ran");
      });

    withMutant("M19: P23 next VA stays at first a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_NEXT;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell1(A_STATE, A_INPUTS,
          0x40800000, 0x40000000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_NEXT,
          "M19: P23 next callsite is the second type-9 a10690");
      });

    withMutant("M20: cell2 next VA stays at second a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL2;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_NEXT;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell2(A_STATE, A_INPUTS,
          0x40000000, 0x40400000, 0x40000000, 0x40800000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL2,
          "M20: cell2 next callsite is the third type-9 a10690");
      });
    withMutant("M21: cell3 next VA stays at third a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL3;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL2;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell3(A_STATE, A_INPUTS,
          0x40000000, 0x40400000, 0x40800000, 0x3f800000, 0x40000000,
          A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL3,
          "M21: cell3 next callsite is the fourth type-9 a10690");
      });

    withMutant("M22: cell4 next VA stays at fourth a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL4;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL3;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell4(A_STATE, A_INPUTS,
          0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL4,
          "M22: cell4 next callsite is the fifth type-9 a10690");
      });

    withMutant("M23: cell5 next VA stays at fifth a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL5;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL4;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell5(A_STATE, A_INPUTS,
          0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL5,
          "M23: cell5 next callsite is the sixth type-9 a10690");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A10690_CELL5,
          "M23: host_arg0 is the sixth type-9 a10690");
      });

    withMutant("M24: cell6 next VA stays at sixth a10690",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_CELL6;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A10690_CELL5;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell6(A_STATE, A_INPUTS,
          0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_CELL6,
          "M24: cell6 next is the first type-9 a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_CELL6,
          "M24: host_arg0 is the first type-9 a102e0");
      });

    withMutant("M25: cell6 x recapture swapped with y",
      (b) => b.replace(
        "events->type9_cell6_x_bits = half_a_94_bits;",
        "events->type9_cell6_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_cell6(A_STATE, A_INPUTS,
          0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9Cell6XBits >>> 0, 0x40400000,
          "M25: x is the [esp+0x94] recapture, not [esp+0xc]");
        assert.equal(ev.type9Cell6YBits >>> 0, 0x40800000,
          "M25: y stays the [esp+0xc] recapture");
      });

    withMutant("M26: a102e0_0 next VA stays at first a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_NEXT;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_CELL6;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_0(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_NEXT,
          "M26: next is the second type-9 a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_NEXT,
          "M26: host_arg0 is the second type-9 a102e0");
      });

    withMutant("M27: a102e0_0 x addss swapped operands to y-only",
      (b) => b.replace(
        "const float out_x = bits_to_f32(mul_05_bits) + bits_to_f32(eax_x_bits);",
        "const float out_x = bits_to_f32(eax_y_bits) + bits_to_f32(eax_y_bits);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_0(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e0XBits >>> 0, 0x40a00000,
          "M27: x is mul_05 + eax_x (2+3=5), not eax_y+eax_y");
        assert.equal(ev.type9A102e0YBits >>> 0, 0x40800000,
          "M27: y stays eax_y + 0");
      });

    withMutant("M28: a102e0_1 next VA stays at second a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_1;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_NEXT;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_1(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_1,
          "M28: next is the third type-9 a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_1,
          "M28: host_arg0 is the third type-9 a102e0");
      });

    withMutant("M29: a102e0_1 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_1_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_1_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_1(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e01XBits >>> 0, 0x40a00000,
          "M29: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e01YBits >>> 0, 0x40800000,
          "M29: y stays eax_y + 0");
      });

    withMutant("M30: a102e0_2 next VA stays at third a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_2;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_1;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_2(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_2,
          "M30: next is the fourth type-9 a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_2,
          "M30: host_arg0 is the fourth type-9 a102e0");
      });

    withMutant("M31: a102e0_2 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_2_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_2_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_2(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e02XBits >>> 0, 0x40a00000,
          "M31: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e02YBits >>> 0, 0x40800000,
          "M31: y stays eax_y + 0");
      });

    withMutant("M32: a102e0_3 remain VA stays at fourth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_2;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0,
          "M32: next is the first type-9 a106e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0,
          "M32: host_arg0 is the first type-9 a106e0");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M32: host leaf is a106e0");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A106E0,
          "M32: typed HOST_A106E0");
      });

    withMutant("M33: a102e0_3 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_3_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_3_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e03XBits >>> 0, 0x40a00000,
          "M33: x is mul_14 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e03YBits >>> 0, 0x40800000,
          "M33: y stays eax_y + 0");
      });

    withMutant("M34: a106e0 remain VA stays at first a106e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_3;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3,
          "M34: next is the fifth type-9 a102e0");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M34: typed HOST_A102E0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_3,
          "M34: host_arg0 is the fifth type-9 a102e0");
      });

    withMutant("M35: a106e0 x recapture swapped with y",
      (b) => b.replace(
        "events->type9_a106e0_x_bits = offset_9c_bits;",
        "events->type9_a106e0_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e0XBits >>> 0, 0x40400000,
          "M35: x is the [esp+0x9c] recapture, not [esp+0xc]");
        assert.equal(ev.type9A106e0YBits >>> 0, 0x40800000,
          "M35: y stays the [esp+0xc] recapture");
      });

    withMutant("M36: a102e0_4 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_4_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_4_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e04XBits >>> 0, 0x40a00000,
          "M36: x is mul_14 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e04YBits >>> 0, 0x40800000,
          "M36: y stays eax_y + 0");
      });

    withMutant("M37: a102e0_4 remain VA stays at fifth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_4;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_3;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4,
          "M37: next is the sixth type-9 a102e0");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M37: typed HOST_A102E0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_4,
          "M37: host_arg0 is the sixth type-9 a102e0");
      });

    withMutant("M38: a102e0_5 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_5_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_5_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_5(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e05XBits >>> 0, 0x40a00000,
          "M38: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e05YBits >>> 0, 0x40800000,
          "M38: y stays eax_y + 0");
      });

    withMutant("M39: a102e0_5 next VA stays at seventh a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_5;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_4;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_5(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5,
          "M39: next is the seventh type-9 a102e0");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M39: typed HOST_A102E0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_5,
          "M39: host_arg0 is the seventh type-9 a102e0");
      });

    withMutant("M40: a102e0_6 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_6_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_6_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_6(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e06XBits >>> 0, 0x40a00000,
          "M40: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e06YBits >>> 0, 0x40800000,
          "M40: y stays eax_y + 0");
      });

    withMutant("M41: a102e0_6 typed host VA stays at eighth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_6;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_5;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_6(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_7_817830,
          "M41: typed host continuation is the eighth a102e0 pack");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6,
          "M41: next is the eighth type-9 a102e0");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M41: host leaf is 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_6,
          "M41: host_arg0 is the eighth type-9 a102e0");
        assert.equal(ev.needsRecapture, 1, "M41: eighth pack requires recapture");
      });

    withMutant("M42: a102e0_7 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_7_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_7_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_7(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e07XBits >>> 0, 0x40a00000,
          "M42: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e07YBits >>> 0, 0x40800000,
          "M42: y stays eax_y + 0");
      });

    withMutant("M43: a102e0_7 next-remain VA stays at a106e0_2",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_2;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_6;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_7(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_2,
          "M43: next remain is the a106e0 @ 0x00818273");
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_2_817830,
          "M43: typed host continuation is the second a106e0 seam");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M43: host leaf is 0x00a106e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_2,
          "M43: host_arg0 is the a106e0 @ 0x00818273");
        assert.equal(ev.needsRecapture, 1, "M43: second a106e0 seam requires recapture");
      });

    withMutant("M44: a106e0_2 gate mask dropped to 0xff00",
      (b) => b.replace(
        "events->type9_a106e0_2_gate_bits = (1u & 0xffu);",
        "events->type9_a106e0_2_gate_bits = (1u & 0xff00u);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_2(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e02GateBits >>> 0, 1,
          "M44: gate is byte 1 masked & 0xff, not 0x100");
      });

    withMutant("M45: a106e0_2 x recapture swapped to y",
      (b) => b.replace(
        "events->type9_a106e0_2_x_bits = offset_40_bits;",
        "events->type9_a106e0_2_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_2(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e02XBits >>> 0, 0x40400000,
          "M45: x is offset_40 recapture, not offset_c");
        assert.equal(ev.type9A106e02YBits >>> 0, 0x40800000,
          "M45: y stays offset_c");
      });

    withMutant("M46: a106e0_2 typed host VA stays at ninth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_7;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_2;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_2(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_8_817830,
          "M46: typed host continuation is the ninth a102e0 pack");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M46: host leaf is 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_7,
          "M46: host_arg0 is the ninth type-9 a102e0 @ 0x008182de");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_7,
          "M46: next is the ninth type-9 a102e0 @ 0x008182de");
      });

    withMutant("M47: a102e0_8 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_8_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_8_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_8(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e08XBits >>> 0, 0x40a00000,
          "M47: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e08YBits >>> 0, 0x40800000,
          "M47: y stays eax_y + 0");
      });

    withMutant("M48: a102e0_8 typed host VA regressed to ninth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_8;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_7;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_8(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,
          "M48: typed host continuation is the tenth a102e0 pack");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_8,
          "M48: next is the tenth type-9 a102e0 @ 0x00818338");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_8,
          "M48: host_arg0 is the tenth type-9 a102e0 @ 0x00818338");
      });

    withMutant("M49: a102e0_8 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_8(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_9_817830,
          "M49: the tenth a102e0 is a typed HOST_A102E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M49: host kind is the typed a102e0 leaf");
        assert.equal(ev.needsRecapture, 1,
          "M49: tenth pack continuation requires recapture");
      });

    withMutant("M50: a102e0_9 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_9_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_9_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_9(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e09XBits >>> 0, 0x40a00000,
          "M50: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e09YBits >>> 0, 0x40800000,
          "M50: y stays eax_y + 0");
      });

    withMutant("M51: a102e0_9 typed host VA regressed to tenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_9;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_8;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_9(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_10_817830,
          "M51: typed host continuation is the eleventh a102e0 pack");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_9,
          "M51: next is the eleventh type-9 a102e0 @ 0x0081838b");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_9,
          "M51: host_arg0 is the eleventh type-9 a102e0 @ 0x0081838b");
      });

    withMutant("M52: a102e0_10 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_10_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_10_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_10(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e010XBits >>> 0, 0x40a00000,
          "M52: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e010YBits >>> 0, 0x40800000,
          "M52: y stays eax_y + 0");
      });

    withMutant("M53: a102e0_10 typed host VA regressed to eleventh a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_10;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_9;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_10(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,
          "M53: typed host continuation is the twelfth a102e0 pack");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10,
          "M53: next is the twelfth type-9 a102e0 @ 0x008183e7");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_10,
          "M53: host_arg0 is the twelfth type-9 a102e0 @ 0x008183e7");
      });

    withMutant("M54: a102e0_10 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_10(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_11_817830,
          "M54: the twelfth a102e0 is a typed HOST_A102E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M54: host kind is the typed a102e0 leaf");
        assert.equal(ev.needsRecapture, 1,
          "M54: twelfth pack continuation requires recapture");
      });

    withMutant("M55: a102e0_11 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_11_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_11_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_11(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e011XBits >>> 0, 0x40a00000,
          "M55: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e011YBits >>> 0, 0x40800000,
          "M55: y stays eax_y + 0");
      });

    withMutant("M56: a102e0_11 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_11(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,
          "M56: the third a106e0 is a typed HOST_A106E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A106E0,
          "M56: host kind is the typed a106e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M56: host Va is the a106e0 leaf @ 0x00a106e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3,
          "M56: host_arg0 is the third type-9 a106e0 @ 0x0081842c");
        assert.equal(ev.needsRecapture, 1,
          "M56: third a106e0 seam continuation requires recapture");
      });

    withMutant("M57: a102e0_11 typed host VA regressed to twelfth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_3;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_10;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_11(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_3_817830,
          "M57: typed host continuation is the third a106e0 seam");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3,
          "M57: next is the third type-9 a106e0 @ 0x0081842c");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_3,
          "M57: host_arg0 is the third type-9 a106e0 @ 0x0081842c");
      });

    withMutant("M58: a106e0_3 x recapture swapped to y",
      (b) => b.replace(
        "events->type9_a106e0_3_x_bits = offset_48_bits;",
        "events->type9_a106e0_3_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e03XBits >>> 0, 0x40400000,
          "M58: x is the [esp+0x48] recapture, not [esp+0xc]");
        assert.equal(ev.type9A106e03YBits >>> 0, 0x40800000,
          "M58: y stays the [esp+0xc] recapture");
      });

    withMutant("M59: a106e0_3 gate mask dropped to 0xff00",
      (b) => b.replace(
        "events->type9_a106e0_3_gate_bits = (1u & 0xffu);",
        "events->type9_a106e0_3_gate_bits = 0xff00u;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e03GateBits >>> 0, 1,
          "M59: byte store 1 widened to (1u & 0xff) = 1");
      });

    withMutant("M60: a106e0_3 next-host VA regressed to third a106e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_3;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,
          "M60: typed host continuation is the thirteenth a102e0 pack");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M60: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11,
          "M60: host_arg0 is the thirteenth type-9 a102e0 @ 0x00818497");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11,
          "M60: next is the thirteenth type-9 a102e0 @ 0x00818497");
        assert.equal(ev.needsRecapture, 1,
          "M60: thirteenth pack continuation requires recapture");
      });

    withMutant("M61: a106e0_3 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_3(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_12_817830,
          "M61: the thirteenth a102e0 is a typed HOST_A102E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M61: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M61: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11,
          "M61: host_arg0 is the thirteenth type-9 a102e0 @ 0x00818497");
        assert.equal(ev.needsRecapture, 1,
          "M61: thirteenth pack continuation requires recapture");
      });

    withMutant("M62: a102e0_12 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_12_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_12_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_12(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e012XBits >>> 0, 0x40a00000,
          "M62: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e012YBits >>> 0, 0x40800000,
          "M62: y stays eax_y + 0");
      });

    withMutant("M63: a102e0_12 typed host next-VA drifts to fourteenth a102e0",
      (b) => b.replace(
        "events->type9_a102e0_12_y_bits = f32_to_bits(out_y);\n"
        + "  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_11;",
        "events->type9_a102e0_12_y_bits = f32_to_bits(out_y);\n"
        + "  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_12;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_12(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_13_817830,
          "M63: typed host continuation stays the fourteenth a102e0 pack");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M63: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M63: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_12,
          "M63: host_arg0 stays the fourteenth type-9 a102e0 @ 0x008184ee");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_11,
          "M63: converted next is the thirteenth type-9 a102e0 @ 0x00818497");
        assert.equal(ev.needsRecapture, 1,
          "M63: fourteenth pack continuation requires recapture");
      });

    withMutant("M64: a102e0_12 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_12_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_12_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_12_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_12_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_12(A_STATE,
          A_INPUTS, 0x40000000, 0x80000000, 0x3f000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e012YBits >>> 0, 0x00000000,
          "M64: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e012XBits >>> 0, 0x40200000,
          "M64: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M65: a102e0_13 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_13_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_13_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_13(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e013XBits >>> 0, 0x40a00000,
          "M65: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e013YBits >>> 0, 0x40800000,
          "M65: y stays eax_y + 0");
      });

    withMutant("M66: a102e0_13 typed host VA regressed to fourteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_13;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_12;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_13(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_14_817830,
          "M66: typed host continuation is the fifteenth a102e0 pack");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M66: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M66: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13,
          "M66: host_arg0 is the fifteenth type-9 a102e0 @ 0x00818547");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_13,
          "M66: next is the fifteenth type-9 a102e0 @ 0x00818547");
        assert.equal(ev.needsRecapture, 1,
          "M66: fifteenth pack continuation requires recapture");
      });

    withMutant("M67: a102e0_13 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_13_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_13_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_13_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_13_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_13(A_STATE,
          A_INPUTS, 0x40000000, 0x80000000, 0x3f000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e013YBits >>> 0, 0x00000000,
          "M67: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e013XBits >>> 0, 0x40200000,
          "M67: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M68: a102e0_14 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_14_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_14_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_14(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e014XBits >>> 0, 0x40a00000,
          "M68: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e014YBits >>> 0, 0x40800000,
          "M68: y stays eax_y + 0");
      });

    withMutant("M69: a102e0_14 typed host VA regressed to fifteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_14;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_13;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_14(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_15_817830,
          "M69: typed host continuation is the sixteenth a102e0 pack");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M69: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M69: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14,
          "M69: host_arg0 is the sixteenth type-9 a102e0 @ 0x0081859a");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_14,
          "M69: next is the sixteenth type-9 a102e0 @ 0x0081859a");
        assert.equal(ev.needsRecapture, 1,
          "M69: sixteenth pack continuation requires recapture");
      });

    withMutant("M70: a102e0_14 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_14_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_14_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_14_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_14_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_14(A_STATE,
          A_INPUTS, 0x40000000, 0x80000000, 0x3f000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e014YBits >>> 0, 0x00000000,
          "M70: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e014XBits >>> 0, 0x40200000,
          "M70: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M71: a102e0_15 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_15_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_15_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e015XBits >>> 0, 0x40a00000,
          "M71: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e015YBits >>> 0, 0x40800000,
          "M71: y stays eax_y + 0");
      });

    withMutant("M72: a102e0_15 next-remain VA regressed to sixteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_4;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_14;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,
          "M72: typed host continuation is the fourth a106e0 seam");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A106E0,
          "M72: host kind is the typed a106e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M72: host Va is the a106e0 leaf @ 0x00a106e0");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4,
          "M72: next is the fourth type-9 a106e0 @ 0x008185e8");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4,
          "M72: host_arg0 is the fourth type-9 a106e0 @ 0x008185e8");
        assert.equal(ev.needsRecapture, 1,
          "M72: fourth a106e0 seam continuation requires recapture");
      });

    withMutant("M73: a102e0_15 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_15_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_15_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_15_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_15_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
          A_INPUTS, 0x40000000, 0x80000000, 0x3f000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e015YBits >>> 0, 0x00000000,
          "M73: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e015XBits >>> 0, 0x40200000,
          "M73: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M74: a106e0_4 x recapture swapped to y",
      (b) => b.replace(
        "events->type9_a106e0_4_x_bits = offset_a8_bits;",
        "events->type9_a106e0_4_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e04XBits >>> 0, 0x40400000,
          "M74: x is the [esp+0xa8] recapture, not [esp+8]");
        assert.equal(ev.type9A106e04YBits >>> 0, 0x40800000,
          "M74: y stays the [esp+8] recapture");
      });

    withMutant("M75: a106e0_4 gate mask dropped to 0xff00",
      (b) => b.replace(
        "events->type9_a106e0_4_gate_bits = (1u & 0xffu);",
        "events->type9_a106e0_4_gate_bits = 0xff00u;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e04GateBits >>> 0, 1,
          "M75: byte store 1 widened to (1u & 0xff) = 1");
      });

    withMutant("M76: a106e0_4 next-remain VA regressed to the seam itself",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_4;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
          "M76: converted continuation is the remain kind (30)");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M76: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M76: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16,
          "M76: next is the seventeenth type-9 a102e0 @ 0x00818656");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16,
          "M76: host_arg0 is the seventeenth type-9 a102e0 @ 0x00818656");
        assert.equal(ev.needsRecapture, 1,
          "M76: seventeenth pack continuation requires recapture");
      });

    withMutant("M77: a102e0_15 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_15(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_4_817830,
          "M77: the fourth a106e0 is a typed HOST_A106E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A106E0,
          "M77: host kind is the typed a106e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M77: host Va is the a106e0 leaf @ 0x00a106e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_4,
          "M77: host_arg0 is the fourth type-9 a106e0 @ 0x008185e8");
        assert.equal(ev.needsRecapture, 1,
          "M77: fourth a106e0 seam continuation requires recapture");
      });

    withMutant("M78: a102e0_16 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_16_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_16_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e016XBits >>> 0, 0x40a00000,
          "M78: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e016YBits >>> 0, 0x40800000,
          "M78: y stays eax_y + 0");
      });

withMutant("M79: a102e0_16 next-remain VA regressed to sixteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_17;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,
          "M79: typed host continuation is the eighteenth a102e0 pack");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M79: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M79: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17,
          "M79: host_arg0 is the eighteenth type-9 a102e0 @ 0x008186ad");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17,
          "M79: next is the eighteenth type-9 a102e0 @ 0x008186ad");
        assert.equal(ev.needsRecapture, 1,
          "M79: eighteenth pack continuation requires recapture");
      });

    withMutant("M80: a102e0_16 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_16_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_16_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_16_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_16_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(A_STATE,
          A_INPUTS, 0x40000000, 0x80000000, 0x3f000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e016YBits >>> 0, 0x00000000,
          "M80: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e016XBits >>> 0, 0x40200000,
          "M80: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M81: a106e0_4 converted remain emit regressed to typed seventeenth",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;\n"
        + "  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_16;\n"
        + "  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_16_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_4(A_STATE,
          A_INPUTS, 0x40400000, 0x40800000, 0x40000000, A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
          "M81: the converted seam emits LROOM_REMAIN (30)");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M81: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M81: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16,
          "M81: host_arg0 stays the seventeenth type-9 a102e0 @ 0x00818656");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_16,
          "M81: next stays the seventeenth type-9 a102e0 @ 0x00818656");
        assert.equal(ev.needsRecapture, 1,
          "M81: seventeenth pack continuation requires recapture");
      });

    withMutant("M82: a102e0_16 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_16(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_17_817830,
          "M82: the eighteenth a102e0 is a typed HOST_A102E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M82: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M82: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_17,
          "M82: host_arg0 is the eighteenth type-9 a102e0 @ 0x008186ad");
        assert.equal(ev.needsRecapture, 1,
          "M82: eighteenth pack continuation requires recapture");
      });

    withMutant("M83: a102e0_17 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_17_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_17_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e017XBits >>> 0, 0x40a00000,
          "M83: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e017YBits >>> 0, 0x40800000,
          "M83: y stays eax_y + 0");
      });

    withMutant("M84: a102e0_17 next-remain VA regressed to eighteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_18;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_17;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,
          "M84: typed host continuation is the nineteenth a102e0 pack");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M84: host kind is the typed a102e0 leaf");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18,
          "M84: next is the nineteenth a102e0 @ 0x00818703");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18,
          "M84: host_arg0 is the nineteenth a102e0 @ 0x00818703");
        assert.equal(ev.needsRecapture, 1,
          "M84: nineteenth pack continuation requires recapture");
      });

    withMutant("M85: a102e0_17 y drops the xorps addss (+0.0f)",
      (b) => b.replace(
        "const float out_y = bits_to_f32(eax_y_bits) + 0.0f;\n"
        + "  events->type9_a102e0_17_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_17_y_bits = f32_to_bits(out_y);",
        "const float out_y = bits_to_f32(eax_y_bits);\n"
        + "  events->type9_a102e0_17_x_bits = f32_to_bits(out_x);\n"
        + "  events->type9_a102e0_17_y_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(A_STATE,
          A_INPUTS, f32bits(0.5), f32bits(-0), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e017YBits >>> 0, 0x00000000,
          "M85: y = eax_y + 0.0f normalizes -0.0 to +0.0");
        assert.equal(ev.type9A102e017XBits >>> 0, 0x40200000,
          "M85: x = mul_05 + eax_x (0.5+2=2.5)");
      });

    withMutant("M86: a102e0_17 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_17(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_18_817830,
          "M86: the nineteenth a102e0 is a typed HOST_A102E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A102E0,
          "M86: host kind is the typed a102e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A102E0,
          "M86: host Va is the a102e0 leaf @ 0x00a102e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_18,
          "M86: host_arg0 is the nineteenth type-9 a102e0 @ 0x00818703");
        assert.equal(ev.needsRecapture, 1,
          "M86: nineteenth pack continuation requires recapture");
      });

    withMutant("M87: a102e0_18 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_18_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_18_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_18(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e018XBits >>> 0, 0x40a00000,
          "M87: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e018YBits >>> 0, 0x40800000,
          "M87: y stays eax_y + 0");
      });

    withMutant("M88: a102e0_18 next-remain VA regressed to nineteenth a102e0",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_19;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_18;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_18(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_19_817830,
          "M88: typed host continuation is the twentieth a102e0 pack");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19,
          "M88: next is the twentieth type-9 a102e0 @ 0x0081875c");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_19,
          "M88: host_arg0 is the twentieth type-9 a102e0 @ 0x0081875c");
      });

    withMutant("M89: a102e0_19 x store swapped to y",
      (b) => b.replace(
        "events->type9_a102e0_19_x_bits = f32_to_bits(out_x);",
        "events->type9_a102e0_19_x_bits = f32_to_bits(out_y);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_19(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A102e019XBits >>> 0, 0x40a00000,
          "M89: x is mul_05 + eax_x (2+3=5), not eax_y");
        assert.equal(ev.type9A102e019YBits >>> 0, 0x40800000,
          "M89: y stays eax_y + 0");
      });

    withMutant("M90: a102e0_19 typed emit regressed to LROOM_REMAIN",
      (b) => b.replace(
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830,",
        "emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a102e0_19(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_5_817830,
          "M90: the fifth a106e0 is a typed HOST_A106E0, not kind 30");
        assert.equal(ev.hostKind, M.GAME_RENDER_HOST_A106E0,
          "M90: host kind is the typed a106e0 leaf");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_A106E0,
          "M90: host Va is the a106e0 leaf @ 0x00a106e0");
        assert.equal(ev.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_5,
          "M90: host_arg0 is the fifth type-9 a106e0 @ 0x008187a1");
        assert.equal(ev.needsRecapture, 1,
          "M90: fifth a106e0 seam continuation requires recapture");
      });

    withMutant("M91: a106e0_5 x recapture swapped to y",
      (b) => b.replace(
        "events->type9_a106e0_5_x_bits = offset_30_bits;",
        "events->type9_a106e0_5_x_bits = offset_c_bits;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_5(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e05XBits >>> 0, 0x40400000,
          "M91: x is the [esp+0x30] recapture, not [esp+0xc]");
        assert.equal(ev.type9A106e05YBits >>> 0, 0x40800000,
          "M91: y stays the [esp+0xc] recapture");
      });

    withMutant("M92: a106e0_5 gate mask dropped to 0xff00",
      (b) => b.replace(
        "events->type9_a106e0_5_gate_bits = (1u & 0xffu);",
        "events->type9_a106e0_5_gate_bits = (1u & 0xff00u);"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_5(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.type9A106e05GateBits >>> 0, 1,
          "M92: byte store 1 widened to (1u & 0xff) = 1");
      });

    withMutant("M93: a106e0_5 next-remain VA regressed to the seam itself",
      (b) => b.replace(
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_20;",
        "events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A106E0_5;"),
      () => {
        writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
        writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS, defaultInputs());
        exp.isaac_game_render_slice_resume_817830_type9_a106e0_5(A_STATE,
          A_INPUTS, f32bits(3), f32bits(4), f32bits(2), A_EVENTS);
        const ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
        assert.equal(ev.continuationKind,
          M.GAME_RENDER_CONTINUE_AT_LROOM_REMAIN_817830,
          "M93: remain continuation is kind 30");
        assert.equal(ev.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20,
          "M93: next remain is the twenty-first a102e0 @ 0x0081880c");
        assert.equal(ev.hostVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20,
          "M93: remain host VA is pack-21 @ 0x0081880c");
      });
  } finally {
    /* restored build re-pins the three sharpest scenarios: every mutant above
       must have left the slice source pristine again. */
    exp = loadExports();
    view = new DataView(exp.memory.buffer);
    writeStruct(A_STATE, M.GAME_RENDER_STATE_FIELDS, defaultState());
    writeStruct(A_INPUTS, M.GAME_RENDER_INPUT_FIELDS,
      { ...defaultInputs(), option2a3c3: 0x100 });
    exp.isaac_game_render_slice_step(A_STATE, A_INPUTS, A_EVENTS);
    let ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
    assert(ev.bodySkipped === 1, "restored: 0x100 closes the body");
    exp.isaac_game_render_slice_resume_boost_827bc0(A_STATE, A_INPUTS, 0x100, A_EVENTS);
    ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
    assert(ev.fadeBoost === 0, "restored: 0x100 does not boost");
    exp.isaac_game_render_slice_resume_epilog(A_STATE, 0x101, A_EVENTS);
    ev = readStruct(A_EVENTS, M.GAME_RENDER_EVENT_FIELDS);
    assert(ev.flag11f6Cleared === 1, "restored: 0x101 fires the oneshot");
  }
});


function a102e020Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e020(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_20(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v36 817830 type9 twenty-first a102e0 pack after host a102e0 + mutant pin", () => {
  /* pack-21 from dump continuation (PE re-decoded this unit): after the
     call @ 0x0081880c: xorps xmm0,xmm0 (+0.0f normalizer); push ecx at
     0x00818814 BEFORE the mul read [esp+0x18] (resume-time slot
     [esp+0x14], after-push shape); ret_y = [eax+4], ret_x = [eax];
     x = mul_05 + ret_x; y = ret_y + 0.0f; stores y -> [esp+0x3c] THEN
     x -> [esp+0x38]; identity arg-setup stays host (feeds pack-22).
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. v36: emits the typed
     AT_TYPE9_A102E0_21_817830 (63) to the twenty-second a102e0
     @ 0x00818866 (hostArg0 / lroomNextVa = 0x00818866). */
  /* self-contained setup (late groups re-bind exp/view; cf. the v35
     mutation harness group) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  let r = a102e020Both("v36 a102e0_20", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_21_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_21);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_21);
  assert.equal(r.wasmEv.type9A102e020XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e020YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e020(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e020XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e020YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e020XBits >>> 0, ev.type9A102e020YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e020(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e020YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  /* wide mul/ret drives kill any narrowing mutant */
  const ew = M.gameRenderResume817830Type9A102e020(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e020XBits >>> 0,
    f32bits(Math.fround(4 + 1076)));

  r = a102e020Both("v36 a102e0_20 next != twentieth a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_20);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_21);
});


function a102e021Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e021(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_21(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v37 817830 type9 twenty-second a102e0 pack after host a102e0 + mutant pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack-22 from PE decode (this unit): after the call @ 0x00818866:
     xorps xmm0,xmm0 (+0.0f); push ecx at 0x0081886e BEFORE the mul read
     [esp+0x18] (resume-time slot [esp+0x14], after-push shape);
     ret_y = [eax+4], ret_x = [eax]; x = mul_05 + ret_x; y = ret_y + 0.0f;
     ZERO store [esp+0x6c]=0 @ 0x0081888d stays HOST (same class as the
     _18-pack zero store); stores y -> [esp+0x4c] THEN x -> [esp+0x48];
     identity src is [esp+0x30] -> [esp+0x68] (NOT pack-21's [esp+0xac]);
     angle [esp+0x28] -> [esp]; push eax feeds pack-23.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. v37: emits the typed
     AT_TYPE9_A102E0_22_817830 (64) to the twenty-third a102e0
     @ 0x008188b9 (hostArg0 / lroomNextVa = 0x008188b9). */
  let r = a102e021Both("v37 a102e0_21", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_22_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_22);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_22);
  assert.equal(r.wasmEv.type9A102e021XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e021YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e021(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e021XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e021YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e021XBits >>> 0, ev.type9A102e021YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e021(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e021YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  /* wide mul drive with raw bits (0x40800000 = 4.0f) kills narrowing */
  const ew = M.gameRenderResume817830Type9A102e021(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e021XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  r = a102e021Both("v37 a102e0_21 next != twenty-first a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_21);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_22);
});


function a102e022Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e022(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_22(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v38 817830 type9 twenty-third a102e0 pack after host a102e0 + mutant pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack-23 from PE decode (NOTES §6 + this unit): after the call
     @ 0x008188b9: xorps xmm0,xmm0 (+0.0f); push ecx at 0x008188c1
     BEFORE the mul read [esp+0x18] (resume-time slot [esp+0x14],
     after-push shape); ret_y = [eax+4], ret_x = [eax]; x = mul_05 +
     ret_x; y = ret_y + 0.0f; ZERO store [esp+0x14]=0 @ 0x008188e0
     stays HOST; stores y -> [esp+0x44] THEN x -> [esp+0x40]; identity
     src is [esp+0xac] -> [esp+0x10] (like packs 19/21); angle
     [esp+0x28] -> [esp]; push eax feeds pack-24.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. v38: emits the typed
     AT_TYPE9_A102E0_23_817830 (65) to the twenty-fourth a102e0
     @ 0x0081890f (hostArg0 / lroomNextVa = 0x0081890f). */
  let r = a102e022Both("v38 a102e0_22", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_23_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_23);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_23);
  assert.equal(r.wasmEv.type9A102e022XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e022YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e022(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e022XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e022YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e022XBits >>> 0, ev.type9A102e022YBits >>> 0);

  /* xorps xmm0,xmm0 + addss xmm1,xmm0 normalizes -0.0 eax_y to +0.0 */
  const en = M.gameRenderResume817830Type9A102e022(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e022YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0");

  /* wide mul drive with raw bits (0x40800000 = 4.0f) kills narrowing */
  const ew = M.gameRenderResume817830Type9A102e022(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e022XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  r = a102e022Both("v38 a102e0_22 next != twenty-second a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_22);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_23);
});


function a102e023Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e023(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_23(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v39 817830 type9 twenty-fourth a102e0 pack -- chain break to a106e0 + mutant pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack-24 from PE decode (this unit): after the call @ 0x0081890f:
     xorps XMM1,XMM1 (shape deviation -- prior packs normalized in
     XMM0); ret_y = [eax+4]; y = ret_y + 0.0f; mul read [esp+0x14] and
     x = mul_05 + ret_x happen BEFORE any next-host push (pre-push
     shape); NO zero store; four lea/push arg pairs + identity stores
     ([esp+0xa0] <- x, [esp+0xa8] <- y) stay host and feed the SIXTH
     a106e0 @ 0x0081895a.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. v39: emits the typed
     AT_TYPE9_A106E0_6_817830 (66) to the sixth a106e0 @ 0x0081895a
     (hostArg0 / lroomNextVa = 0x0081895a). */
  let r = a102e023Both("v39 a102e0_23", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_6_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_6);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_6);
  assert.equal(r.wasmEv.type9A102e023XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e023YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e023(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e023XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e023YBits >>> 0, f32bits(Math.fround(4 + 0)));
  assert.notEqual(ev.type9A102e023XBits >>> 0, ev.type9A102e023YBits >>> 0);

  /* the -0.0 normalizer holds with the XMM1 shape too */
  const en = M.gameRenderResume817830Type9A102e023(defaultState(),
    defaultInputs(), f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(en.type9A102e023YBits >>> 0, 0x00000000,
    "y = eax_y + 0.0f normalizes -0.0 to +0.0 (xmm1 normalizer)");

  /* -0.0 through BOTH sides: the wasm normalizer (addss xmm,xmm1 with
     xmm1=0) must normalize too -- kills a dropped-+0.0f mutant */
  r = a102e023Both("v39 a102e0_23 -0.0 eax_y", f32bits(2), f32bits(-0),
    f32bits(4));
  assert.equal(r.wasmEv.type9A102e023YBits >>> 0, 0x00000000,
    "wasm y = eax_y + 0.0f normalizes -0.0 to +0.0");
  assert.equal(r.jsEv.type9A102e023YBits >>> 0, 0x00000000);

  /* wide mul drive with raw bits (0x40800000 = 4.0f) kills narrowing */
  const ew = M.gameRenderResume817830Type9A102e023(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e023XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  r = a102e023Both("v39 a102e0_23 next != twenty-third a102e0", f32bits(1),
    f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_23);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_6);
});


test("v40 LROOM join gate 0x00819394 (type==10 full-dword eq) + census pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  assert.equal(M.GAME_RENDER_VA_LROOM_GATE_9394, 0x00819394);
  assert.equal(M.GAME_RENDER_VA_LROOM_GATE_JNE_9398, 0x00819398);
  assert.equal(M.GAME_RENDER_VA_TYPE10_FIRST_PACK_9720, 0x00819720);
  /* the gate law: cmp dword [eax+0x48], 0xa -- FULL dword UNSIGNED eq.
     Wide drives kill any byte/narrowing mutant (0x1000000a has the
     right low byte but is NOT 0xa). */
  assert.equal(M.gameRenderLroomGateType10Eq(0xa), 1);
  assert.equal(M.gameRenderLroomGateType10Eq(0x1000000a), 0);
  assert.equal(M.gameRenderLroomGateType10Eq(0xffff000a), 0);
  assert.equal(M.gameRenderLroomGateType10Eq(9), 0);
  assert.equal(M.gameRenderLroomGateType10Eq(0xb), 0);
  assert.equal(M.gameRenderLroomGateType10Eq(0xffffffff), 0);
  assert.equal(exp.isaac_game_render_slice_lroom_gate_type10_eq(0xa) >>> 0, 1);
  assert.equal(exp.isaac_game_render_slice_lroom_gate_type10_eq(0x1000000a) >>> 0, 0);

  /* fall-through arm: type == 10 -> the type-10 draw chain continues;
     next unpeeled host call is the first post-gate a102e0 pack. */
  let r = both("v40 join9394 type10", defaultState(), defaultInputs(), {
    js: () => M.gameRenderResume817830LroomJoin9394(defaultState(), 0xa),
    wasm: () => exp.isaac_game_render_slice_resume_817830_lroom_join_9394(
      A_STATE, 0xa, A_EVENTS),
  });
  /* v41: the fall-through now emits the typed AT_TYPE9_A102E0_24_
     817830 (67) to pack @ 0x00819720 (was kind-30 remain at ABI 40). */
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_24_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE10_FIRST_PACK_9720);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE10_FIRST_PACK_9720);
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* join arm: type != 10 -> the pinned LROOM join 0x0081a975. */
  r = both("v40 join9394 other", defaultState(), defaultInputs(), {
    js: () => M.gameRenderResume817830LroomJoin9394(defaultState(), 9),
    wasm: () => exp.isaac_game_render_slice_resume_817830_lroom_join_9394(
      A_STATE, 9, A_EVENTS),
  });
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_A975);
  r = both("v40 join9394 wide-low-byte", defaultState(), defaultInputs(), {
    js: () => M.gameRenderResume817830LroomJoin9394(defaultState(), 0x1000000a),
    wasm: () => exp.isaac_game_render_slice_resume_817830_lroom_join_9394(
      A_STATE, 0x1000000a, A_EVENTS),
  });
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_LROOM_JOIN_A975);

  /* seeded differential */
  let seed = 0x85ebca6b;
  const lcg = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed;
  };
  for (let i = 0; i < 200; ++i) {
    const t = lcg();
    const want = t >>> 0 === 0xa
      ? M.GAME_RENDER_VA_TYPE10_FIRST_PACK_9720
      : M.GAME_RENDER_VA_LROOM_JOIN_A975;
    const ev = M.gameRenderResume817830LroomJoin9394(defaultState(), t);
    assert.equal(ev.lroomNextVa >>> 0, want);
  }
});


function a102e024Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e024(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_24(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e025Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e025(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_25(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v41 type-10 run packs 1+2 (a102e0 @ 0x00819720 / 0x00819773) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 1 from PE decode: after the call @ 0x00819720: xorps (+0.0f);
     push ecx @ 0x00819728 BEFORE the mul read [esp+0x18] (resume slot
     [esp+0x14], after-push shape); ret_y=[eax+4], ret_x=[eax];
     x = mul_05 + ret_x; y = ret_y + 0.0f; ZERO store [esp+0x58]=0
     @ 0x0081973c stays HOST; stores y -> [esp+0x3c], x -> [esp+0x38];
     identity src [esp+0xc] -> [esp+0x5c]; angle [esp+0x28]; feeds
     pack 2 @ 0x00819773.
     pack 2: same shape; ZERO store [esp+0x6c]=0 @ 0x0081979a stays
     HOST; stores y -> [esp+0x64], x -> [esp+0x60]; identity src
     [esp+0xac] -> [esp+0x68]; feeds pack 3 @ 0x008197c9 (parked).
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e024Both("v41 a102e0_24", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_25_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_25);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_25);
  assert.equal(r.wasmEv.type9A102e024XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e024YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e024(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e024XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e024YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e024Both("v41 a102e0_24 -0.0 both sides", f32bits(2), f32bits(-0),
    f32bits(4));
  assert.equal(r.wasmEv.type9A102e024YBits >>> 0, 0x00000000,
    "wasm y normalizes -0.0 to +0.0 (pack 24)");
  assert.equal(r.jsEv.type9A102e024YBits >>> 0, 0x00000000);

  r = a102e025Both("v41 a102e0_25", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_26_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_26);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_26);
  assert.equal(r.wasmEv.type9A102e025XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e025YBits >>> 0, f32bits(4));

  const en2 = a102e025Both("v41 a102e0_25 -0.0 both sides", f32bits(2),
    f32bits(-0), f32bits(4));
  assert.equal(en2.wasmEv.type9A102e025YBits >>> 0, 0x00000000,
    "wasm y normalizes -0.0 to +0.0 (pack 25)");

  /* wide drives kill narrowing mutants on both packs */
  const ew1 = M.gameRenderResume817830Type9A102e024(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e024XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e025(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e025XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e024Both("v41 a102e0_24 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_24);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_25);
  r = a102e025Both("v41 a102e0_25 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_25);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_26);
});


function a102e026Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e026(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_26(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e027Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e027(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_27(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v42 type-10 run packs 3+4 (a102e0 @ 0x008197c9 / 0x00819818) + chain-break pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 3 from PE decode: push ecx @ 0x008197d1 BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); TWO zero
     stores ([esp+0x10]=0 AND [esp+0x14]=0 -- the second zeroes the mul
     slot itself) stay HOST; stores y -> [esp+0x74], x -> [esp+0x70].
     Pack 4 @ 0x00819818: PRE-PUSH shape (reads before the four lea/
     push pairs); NO zero store; identity stores via the arg pushes.
     Chain BREAKS: pack 4 feeds the SEVENTH a106e0 @ 0x00819863.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e026Both("v42 a102e0_26", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_27_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_27);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_27);
  assert.equal(r.wasmEv.type9A102e026XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e026YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e026(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e026XBits >>> 0, f32bits(Math.fround(2 + 3)));

  r = a102e027Both("v42 a102e0_27", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_7_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_7);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_7);
  assert.equal(r.wasmEv.type9A102e027XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e027YBits >>> 0, f32bits(4));
  /* v43: the a106e0_7 target is peeled -> the typed continuation
     needs recapture (was a parked terminal at ABI 42). */
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* -0.0 through BOTH sides on both packs (normalizer law) */
  r = a102e026Both("v42 a102e0_26 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e026YBits >>> 0, 0x00000000);
  r = a102e027Both("v42 a102e0_27 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e027YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e026(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e026XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e027(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e027XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e026Both("v42 a102e0_26 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_26);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_27);
  r = a102e027Both("v42 a102e0_27 next != a102e0", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
});


function a106e07Both(label, offset48, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e07(S, I, offset48, offsetC,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_7(
      A_STATE, A_INPUTS, offset48, offsetC, scale28, A_EVENTS),
  });
}
function a102e028Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e028(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_28(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v43 seventh a106e0 seam + twenty-eighth a102e0 pack + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* SEVENTH a106e0 seam from PE decode: dest-copy cluster class.
     Identity recaptures [esp+0x48]/[esp+0xc]/[esp+0x28] (all AFTER the
     push ecx @ 0x00819887; resume slots [esp+0x44]/[esp+8]/[esp+0x24]).
     Byte-gate widen: mov byte [esp+0x140],1 ; read-back -> gate =
     (1u & 0xff). Dest-copies stay HOST. Emits the typed
     AT_TYPE9_A102E0_28_817830 (72) to pack 28 @ 0x008198ce. */
  let r = a106e07Both("v43 a106e0_7", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_28_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_28);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_28);
  assert.equal(r.wasmEv.type9A106e07XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e07YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e07AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e07GateBits >>> 0, 1);
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A106e07(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A106e07GateBits >>> 0, 1,
    "byte-gate: mov byte [esp+0x140],1 read back as uint32_t & 0xff");
  assert.notEqual(ev.type9A106e07XBits >>> 0, ev.type9A106e07AngleBits >>> 0);

  /* TWENTY-EIGHTH a102e0 pack: PRE-PUSH shape (no next-host push before
     the mul read [esp+0x14]); y=ret_y+0.0f; x=mul_05+ret_x; no zero
     store. eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4. Emits typed
     AT_TYPE9_A102E0_29_817830 (73) @ 0x00819928 (parked). */
  r = a102e028Both("v43 a102e0_28", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_29_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_29);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_29);
  assert.equal(r.wasmEv.type9A102e028XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e028YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on the a102e0 pack (normalizer law) */
  r = a102e028Both("v43 a102e0_28 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e028YBits >>> 0, 0x00000000);
  assert.equal(r.jsEv.type9A102e028YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew = M.gameRenderResume817830Type9A102e028(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e028XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* identity law on the seam: raw copies, not sums */
  const ei = M.gameRenderResume817830Type9A106e07(defaultState(),
    defaultInputs(), 0x11223344, 0x55667788, 0x12345678);
  assert.equal(ei.type9A106e07XBits >>> 0, 0x11223344);
  assert.equal(ei.type9A106e07YBits >>> 0, 0x55667788);

  /* next != self on both */
  r = a106e07Both("v43 a106e0_7 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_7);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_28);
  r = a102e028Both("v43 a102e0_28 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_28);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_29);
});


function a102e029Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e029(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_29(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e030Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e030(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_30(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v44 packs 29+30 (a102e0 @ 0x00819928 / 0x0081997b) + chain-break pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 29 from PE decode: push ecx @ 0x00819930 BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); y=ret_y+
     0.0f; x=mul_05+ret_x; ZERO store [esp+0x6c]=0 @ 0x0081994f stays
     HOST; stores y -> [esp+0x64], x -> [esp+0x60]; identity src
     [esp+0x48] -> [esp+0x68] (the a106e0_7 identity-source slot);
     angle [esp+0x28]. Emits typed AT_TYPE9_A102E0_30_817830 (74) to
     pack 30 @ 0x008199d1.
     pack 30: same after-push shape; ZERO store [esp+0x14]=0
     @ 0x008199a2 zeroes the mul slot itself (HOST); identity src
     [esp+0xac] -> [esp+0x10]; stores y -> [esp+0x74], x -> [esp+0x70].
     CHAIN BREAK: pack 30 feeds the EIGHTH a106e0 @ 0x00819a1c.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e029Both("v44 a102e0_29", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_30_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_30);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_30);
  assert.equal(r.wasmEv.type9A102e029XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e029YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e029(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e029XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e029YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e030Both("v44 a102e0_30", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_8_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_8);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_8);
  /* v45: the eighth a106e0 seam is peeled -> the typed continuation
     needs recapture (was a parked terminal at ABI 44). */
  assert.equal(r.wasmEv.needsRecapture, 1);
  assert.equal(r.wasmEv.type9A102e030XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e030YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on both packs */
  r = a102e029Both("v44 a102e0_29 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e029YBits >>> 0, 0x00000000);
  r = a102e030Both("v44 a102e0_30 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e030YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e029(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e029XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e030(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e030XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e029Both("v44 a102e0_29 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_29);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_30);
  r = a102e030Both("v44 a102e0_30 chain break", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
});


function a106e08Both(label, offset40, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e08(S, I, offset40, offsetC,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_8(
      A_STATE, A_INPUTS, offset40, offsetC, scale28, A_EVENTS),
  });
}
function a102e031Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e031(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_31(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v45 eighth a106e0 seam + thirty-first a102e0 pack + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* EIGHTH a106e0 seam from PE decode: dest-copy cluster class.
     Identity recaptures [esp+0x40]/[esp+0xc]/[esp+0x28] (all AFTER the
     push ecx @ 0x00819a40; resume slots [esp+0x3c]/[esp+8]/[esp+0x24]).
     Byte-gate widen: gate = (1u & 0xff). Dest-copies stay HOST. Emits
     the typed AT_TYPE9_A102E0_31_817830 (76) to pack 31 @ 0x00819a87. */
  let r = a106e08Both("v45 a106e0_8", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_31_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_31);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_31);
  assert.equal(r.wasmEv.type9A106e08XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e08YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e08AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e08GateBits >>> 0, 1);
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* identity law: raw bits, not sums */
  const ei = M.gameRenderResume817830Type9A106e08(defaultState(),
    defaultInputs(), 0x11223344, 0x55667788, 0x12345678);
  assert.equal(ei.type9A106e08XBits >>> 0, 0x11223344);
  assert.equal(ei.type9A106e08YBits >>> 0, 0x55667788);
  assert.equal(ei.type9A106e08AngleBits >>> 0, 0x12345678);

  /* THIRTY-FIRST a102e0 pack: PRE-PUSH shape (no next-host push before
     the mul read [esp+0x14]); y=ret_y+0.0f; x=mul_05+ret_x; no zero
     store. Emits typed AT_TYPE9_A102E0_32_817830 (77) @ 0x00819ade
     (parked). */
  r = a102e031Both("v45 a102e0_31", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_32_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_32);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_32);
  assert.equal(r.wasmEv.type9A102e031XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e031YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on the a102e0 pack (normalizer law) */
  r = a102e031Both("v45 a102e0_31 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e031YBits >>> 0, 0x00000000);
  assert.equal(r.jsEv.type9A102e031YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew = M.gameRenderResume817830Type9A102e031(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e031XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both */
  r = a106e08Both("v45 a106e0_8 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_8);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_31);
  r = a102e031Both("v45 a102e0_31 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_31);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_32);
});


function a102e032Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e032(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_32(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e033Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e033(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_33(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v46 type-10 run packs 5+6 (a102e0 @ 0x00819ade / 0x00819b31) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 5 from PE decode: push ecx @ 0x00819ae6 BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); y=ret_y+
     0.0f; x=mul_05+ret_x; ZERO store [esp+0x6c]=0 @ 0x00819b05 stays
     HOST; stores y -> [esp+0x64], x -> [esp+0x60]; identity src
     [esp+0x40] -> [esp+0x68] (pack-32's own source slot). Emits typed
     AT_TYPE9_A102E0_33_817830 (78) to pack 6 @ 0x00819b31.
     pack 6: same after-push shape; ZERO store [esp+0x14]=0
     @ 0x00819b58 zeroes the mul slot itself (HOST); stores y ->
     [esp+0x74], x -> [esp+0x70]; identity src [esp+0x48] -> [esp+0x10].
     Emits typed AT_TYPE9_A102E0_34_817830 (79) to pack 7 @ 0x00819b84
     (parked). eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e032Both("v46 a102e0_32", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_33_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_33);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_33);
  assert.equal(r.wasmEv.type9A102e032XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e032YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e032(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e032XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e032YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e033Both("v46 a102e0_33", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_34_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_34);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_34);
  assert.equal(r.wasmEv.type9A102e033XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e033YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on both packs (normalizer law) */
  r = a102e032Both("v46 a102e0_32 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e032YBits >>> 0, 0x00000000);
  r = a102e033Both("v46 a102e0_33 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e033YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e032(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e032XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e033(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e033XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e032Both("v46 a102e0_32 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_32);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_33);
  r = a102e033Both("v46 a102e0_33 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_33);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_34);
});


function a102e034Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e034(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_34(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a106e09Both(label, offset9c, offsetC, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e09(S, I, offset9c, offsetC,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_9(
      A_STATE, A_INPUTS, offset9c, offsetC, scale28, A_EVENTS),
  });
}

test("v47 pack-34 chain-break + NINTH a106e0 seam (0x00819bcf) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack-34 from PE decode: PRE-PUSH shape (reads before the first
     lea/push at 0x00819baa): y=ret_y+0.0f; x=mul_05+ret_x; NO zero
     store; identity stores ([esp+0x84]<-x, [esp+0x8c]<-y) stay host.
     CHAIN BREAK: emits the typed AT_TYPE9_A106E0_9_817830 (80) to the
     NINTH a106e0 seam @ 0x00819bcf.
     The ninth-seam aftermath: dest-copy cluster class; identity x =
     [esp+0x9c] (read AFTER push ecx @ 0x00819bf3, resume slot
     [esp+0x98]); byte-gate widen gate = (1u & 0xff). Emits typed
     AT_TYPE9_A102E0_35_817830 (81) to pack 35 @ 0x00819c3d (parked).
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for pack-34. */
  let r = a102e034Both("v47 a102e0_34", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_9_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_9);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_9);
  assert.equal(r.wasmEv.type9A102e034XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e034YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e034(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e034XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e034YBits >>> 0, f32bits(Math.fround(4 + 0)));

  /* -0.0 through BOTH sides on pack-34 (normalizer law) */
  r = a102e034Both("v47 a102e0_34 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e034YBits >>> 0, 0x00000000);
  assert.equal(r.jsEv.type9A102e034YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew = M.gameRenderResume817830Type9A102e034(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e034XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* NINTH a106e0 seam: identity trio + gate widen */
  let s = a106e09Both("v47 a106e0_9", f32bits(6), f32bits(7), f32bits(8));
  assert.equal(s.wasmEv.type9A106e09XBits >>> 0, f32bits(6));
  assert.equal(s.wasmEv.type9A106e09YBits >>> 0, f32bits(7));
  assert.equal(s.wasmEv.type9A106e09AngleBits >>> 0, f32bits(8));
  assert.equal(s.wasmEv.type9A106e09GateBits >>> 0, 1);
  assert.equal(s.wasmEv.needsRecapture, 1);
  const si = M.gameRenderResume817830Type9A106e09(defaultState(),
    defaultInputs(), 0x11223344, 0x55667788, 0x12345678);
  assert.equal(si.type9A106e09XBits >>> 0, 0x11223344);
  assert.equal(si.type9A106e09YBits >>> 0, 0x55667788);
  assert.equal(si.type9A106e09AngleBits >>> 0, 0x12345678);
  assert.equal(si.type9A106e09GateBits >>> 0, 1);

  s = a106e09Both("v47 a106e0_9 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(s.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_9);
  assert.equal(s.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_35);
});


function a102e035Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e035(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_35(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e036Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e036(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_36(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v48 type-10 run packs 7+8 (a102e0 @ 0x00819c3d / 0x00819c94) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 7 from PE decode: push ecx @ 0x00819c45 BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); y=ret_y+
     0.0f; x=mul_05+ret_x; NO zero store; stores y -> [esp+0x3c],
     x -> [esp+0x38]; identity src [esp+0x40] -> [esp+0x58]; angle
     [esp+0x28]. Emits typed AT_TYPE9_A102E0_36_817830 (82) to pack 8
     @ 0x00819c94.
     pack 8: push ecx @ 0x00819c9c BEFORE the mul read; ZERO store
     [esp+0x6c]=0 @ 0x00819cbb stays HOST; stores y -> [esp+0x4c],
     x -> [esp+0x48]; identity src [esp+0x9c] -> [esp+0x68] (the
     a106e0_9 x-source slot). Emits typed AT_TYPE9_A102E0_37_817830
     (83) to pack 9 @ 0x00819cea (parked).
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e035Both("v48 a102e0_35", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_36_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_36);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_36);
  assert.equal(r.wasmEv.type9A102e035XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e035YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e035(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e035XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e035YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e036Both("v48 a102e0_36", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_37_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_37);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_37);
  assert.equal(r.wasmEv.type9A102e036XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e036YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on both packs (normalizer law) */
  r = a102e035Both("v48 a102e0_35 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e035YBits >>> 0, 0x00000000);
  r = a102e036Both("v48 a102e0_36 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e036YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e035(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e035XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e036(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e036XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e035Both("v48 a102e0_35 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_35);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_36);
  r = a102e036Both("v48 a102e0_36 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_36);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_37);
});

function a102e037Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e037(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_37(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e038Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e038(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_38(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v49 packs 37+38 (a102e0 @ 0x00819cea / 0x00819d3d) + chain-break pin", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 37 from PE decode: push ecx @ 0x00819cf2 BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); y=ret_y+
     0.0f; x=mul_05+ret_x; ZERO store [esp+0x14]=0 @ 0x00819d11 zeroes
     the mul slot itself (HOST); stores y -> [esp+0x64], x ->
     [esp+0x60]; identity src [esp+0x40] -> [esp+0x10]; angle
     [esp+0x28]. Emits typed AT_TYPE9_A102E0_38_817830 (84) to pack 38
     @ 0x00819d3d.
     pack 38: PRE-PUSH shape (no next-host push before 0x00819d63); NO
     zero store; four lea/push arg pairs + identity stores ([esp+0x74]
     <- x, [esp+0x7c] <- y) stay host. CHAIN BREAK: emits the typed
     AT_TYPE9_A106E0_10_817830 (85) to the TENTH a106e0 @ 0x00819d7f.
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e037Both("v49 a102e0_37", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_38_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_38);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_38);
  assert.equal(r.wasmEv.type9A102e037XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e037YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e037(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e037XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e037YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e038Both("v49 a102e0_38", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_10_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_10);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_10);
  assert.equal(r.wasmEv.type9A102e038XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e038YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on both packs */
  r = a102e037Both("v49 a102e0_37 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e037YBits >>> 0, 0x00000000);
  r = a102e038Both("v49 a102e0_38 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e038YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e037(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e037XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e038(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e038XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e037Both("v49 a102e0_37 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_37);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_38);
  r = a102e038Both("v49 a102e0_38 chain break", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A106E0);
});


function a106e010Both(label, offset90, offset8, scale28) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e010(S, I, offset90, offset8,
      scale28),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_10(
      A_STATE, A_INPUTS, offset90, offset8, scale28, A_EVENTS),
  });
}
function a102e039Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e039(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_39(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v50 TENTH a106e0 seam (0x00819d7f) + pack-39 (0x00819ded) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* TENTH a106e0 seam from PE decode: dest-copy cluster class.
     Identity recaptures are PRE-PUSH: [esp+0x90] -> x and [esp+8] -> y
     are read BEFORE the push ecx @ 0x00819dcf (resume-time slots
     [esp+0x90]/[esp+8] directly); angle [esp+0x28] post-push.
     Byte-gate widen: gate = (1u & 0xff). Dest-copies stay HOST.
     Emits typed AT_TYPE9_A102E0_39_817830 (86) to pack 39 @ 0x00819ded. */
  let r = a106e010Both("v50 a106e0_10", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_39_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_39);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_39);
  assert.equal(r.wasmEv.type9A106e010XBits >>> 0, f32bits(3));
  assert.equal(r.wasmEv.type9A106e010YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.type9A106e010AngleBits >>> 0, f32bits(2));
  assert.equal(r.wasmEv.type9A106e010GateBits >>> 0, 1);
  assert.equal(r.wasmEv.needsRecapture, 1);

  /* identity law: raw bits, not sums */
  const ei = M.gameRenderResume817830Type9A106e010(defaultState(),
    defaultInputs(), 0x11223344, 0x55667788, 0x12345678);
  assert.equal(ei.type9A106e010XBits >>> 0, 0x11223344);
  assert.equal(ei.type9A106e010YBits >>> 0, 0x55667788);
  assert.equal(ei.type9A106e010AngleBits >>> 0, 0x12345678);

  /* THIRTY-NINTH a102e0 pack: after-push shape; standard addss law. */
  r = a102e039Both("v50 a102e0_39", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_40_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_40);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_40);
  assert.equal(r.wasmEv.type9A102e039XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e039YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on pack-39 (normalizer law) */
  r = a102e039Both("v50 a102e0_39 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e039YBits >>> 0, 0x00000000);
  assert.equal(r.jsEv.type9A102e039YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew = M.gameRenderResume817830Type9A102e039(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew.type9A102e039XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both */
  r = a106e010Both("v50 a106e0_10 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_10);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_39);
  r = a102e039Both("v50 a102e0_39 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_39);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_40);
});


function a102e040Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e040(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_40(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e041Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e041(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_41(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v51 type-10 run packs 9+10 (a102e0 @ 0x00819e47 / 0x00819e9d) + mutant pins", () => {
  /* self-contained setup (late groups re-bind exp/view) */
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* pack 9 from PE decode: push ecx @ 0x00819e4f BEFORE the mul read
     [esp+0x18] (resume slot [esp+0x14], after-push shape); y=ret_y+
     0.0f; x=mul_05+ret_x; ZERO store [esp+0x6c]=0 @ 0x00819e6e stays
     HOST; stores y -> [esp+0x4c], x -> [esp+0x48]; identity src
     [esp+0x94] -> [esp+0x68]; angle [esp+0x28]. Emits typed
     AT_TYPE9_A102E0_41_817830 (88) to pack 10 @ 0x00819e9d.
     pack 10: same after-push shape; ZERO store [esp+0x14]=0
     @ 0x00819ec4 zeroes the mul slot itself (HOST); stores y ->
     [esp+0x44], x -> [esp+0x40]. Emits typed
     AT_TYPE9_A102E0_42_817830 (89) to pack 11 @ 0x00819ef3 (parked).
     eax_x=3, eax_y=4, mul_05=2 -> x=5, y=4 for both. */
  let r = a102e040Both("v51 a102e0_40", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_41_817830);
  assert.equal(r.wasmEv.hostKind, M.GAME_RENDER_HOST_A102E0);
  assert.equal(r.wasmEv.hostVa >>> 0, M.GAME_RENDER_VA_A102E0);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_41);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_41);
  assert.equal(r.wasmEv.type9A102e040XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e040YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.needsRecapture, 1);

  const ev = M.gameRenderResume817830Type9A102e040(defaultState(),
    defaultInputs(), f32bits(3), f32bits(4), f32bits(2));
  assert.equal(ev.type9A102e040XBits >>> 0, f32bits(Math.fround(2 + 3)));
  assert.equal(ev.type9A102e040YBits >>> 0, f32bits(Math.fround(4 + 0)));

  r = a102e041Both("v51 a102e0_41", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.jsEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_42_817830);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_42);
  assert.equal(r.wasmEv.lroomNextVa >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_42);
  assert.equal(r.wasmEv.type9A102e041XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e041YBits >>> 0, f32bits(4));

  /* -0.0 through BOTH sides on both packs (normalizer law) */
  r = a102e040Both("v51 a102e0_40 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e040YBits >>> 0, 0x00000000);
  r = a102e041Both("v51 a102e0_41 -0.0", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(r.wasmEv.type9A102e041YBits >>> 0, 0x00000000);

  /* wide drives kill narrowing mutants */
  const ew1 = M.gameRenderResume817830Type9A102e040(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew1.type9A102e040XBits >>> 0, f32bits(Math.fround(4 + 1076)));
  const ew2 = M.gameRenderResume817830Type9A102e041(defaultState(),
    defaultInputs(), f32bits(1076), f32bits(-4), 0x40800000);
  assert.equal(ew2.type9A102e041XBits >>> 0, f32bits(Math.fround(4 + 1076)));

  /* next != self on both packs */
  r = a102e040Both("v51 a102e0_40 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_40);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_41);
  r = a102e041Both("v51 a102e0_41 next != self", f32bits(1), f32bits(0),
    f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_41);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_42);
});

function a102e043Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e043(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_43(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e044Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e044(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_44(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v53 packs 43+44 (a102e0 @ 0x00819fa0 / 0x00819ffa) + mutant pins", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  let r = a102e043Both("v53 _43", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_44_817830);
  assert.equal(r.wasmEv.type9A102e043XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.needsRecapture, 1);
  r = a102e044Both("v53 _44", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e044XBits >>> 0, f32bits(5));
  /* -0.0 both sides */
  let rn = a102e043Both("-0 p43", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(rn.wasmEv.type9A102e043YBits >>> 0, 0);
  rn = a102e044Both("-0 p44", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(rn.wasmEv.type9A102e044YBits >>> 0, 0);
  /* next != self */
  r = a102e043Both("n!=s p43", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, 0x00819fa0);
  r = a102e044Both("n!=s p44", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, 0x00819ffa);
});

function a102e045Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e045(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_45(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}
function a102e046Both(label, eaxX, eaxY, mul05) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e046(S, I, eaxX, eaxY, mul05),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_46(
      A_STATE, A_INPUTS, eaxX, eaxY, mul05, A_EVENTS),
  });
}

test("v54 packs 45+46 (a102e0 @ 0x0081a04d / 0x0081a0a3) + mutant pins", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  let r = a102e045Both("v54 _45", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_45_817830);
  assert.equal(r.wasmEv.type9A102e045XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.needsRecapture, 1);
  r = a102e046Both("v54 _46", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A106E0_12_817830);
  assert.equal(r.wasmEv.type9A102e046XBits >>> 0, f32bits(5));
  /* -0.0 both sides */
  let rn = a102e045Both("-0 p45", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(rn.wasmEv.type9A102e045YBits >>> 0, 0);
  rn = a102e046Both("-0 p46", f32bits(2), f32bits(-0), f32bits(4));
  assert.equal(rn.wasmEv.type9A102e046YBits >>> 0, 0);
  /* next != self */
  r = a102e045Both("n!=s p45", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, 0x0081a04d);
  r = a102e046Both("n!=s p46", f32bits(1), f32bits(0), f32bits(0));
  assert.notEqual(r.wasmEv.hostArg0 >>> 0, 0x0081a0a3);
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A106E0_12);
});

/* v54 mutant pins */
test("v54 mutant pins (pack-45/46)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M111: pack-45 x law is mul05+eax_x (not identity): exact-bits pin */
  {
    const r = a102e045Both("M111 p45 x=addss", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e045XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e045XBits >>> 0, f32bits(3));
  }
  /* M112: pack-46 zero-store law: -0 input must yield +0 bits (not skip,
     not -0 passthrough) */
  {
    const rn = a102e046Both("M112 p46 y-store", f32bits(2), f32bits(-0),
      f32bits(4));
    assert.equal(rn.wasmEv.type9A102e046YBits >>> 0, 0);
    assert.notEqual(rn.wasmEv.type9A102e046YBits >>> 0, 0x80000000);
  }
});

function a106e012Both(label) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A106e012(S, I),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a106e0_12(
      A_STATE, A_INPUTS, A_EVENTS),
  });
}

test("v55 TWELFTH a106e0 seam @ 0x0081a0ee (gate-only law) + mutant pins", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* typed gate law: byte store 1 widened through dword reload */
  let r = a106e012Both("v55 seam12");
  assert.equal(r.wasmEv.type9A106e012GateBits >>> 0, 1);
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830);
  assert.equal(r.wasmEv.needsRecapture, 1);
  assert.equal(r.wasmEv.lroomNextVa >>> 0,
    M.GAME_RENDER_VA_HOST_A0F550_CALLSITE);
  assert.equal(r.wasmEv.hostArg0 >>> 0,
    M.GAME_RENDER_VA_HOST_A0F550_CALLSITE);
  /* non-recapture pin: x/y/angle quads stay cleared (PE shows no scalar
     reads in this seam's continuation -- catches false scalar writes) */
  assert.equal(r.wasmEv.type9A106e012XBits === undefined
    || r.wasmEv.type9A106e012XBits === 0, true);
});

/* v55 mutants */
test("v55 mutant pins (seam12)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M113: gate law exactness -- gate must be exactly 1 (1&0xff); a mutant
     storing 0 or the raw byte-width-8 value fails */
  {
    const r = a106e012Both("M113 seam12 gate=1 exact");
    assert.equal(r.wasmEv.type9A106e012GateBits >>> 0, 1);
    assert.notEqual(r.wasmEv.type9A106e012GateBits >>> 0, 0);
    assert.notEqual(r.wasmEv.type9A106e012GateBits >>> 0, 0x100);
  }
  /* M114: terminal dispatch -- kind must be the draw-band station (96),
     not the seam's own kind (95) and not any pack kind */
  {
    const r = a106e012Both("M114 seam12 kind=96");
    assert.equal(r.wasmEv.continuationKind >>> 0, 96);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 95);
  }
});

function a102e047Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e047(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_47(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e048Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e048(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_48(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e049Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e049(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_49(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v56 SECOND-cluster packs 47+48+49 (transform-chained @ 0x0081ac33/0x0081ac8e/0x0081acec)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e047Both("v56 _47", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e047XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e047YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_48_817830);
  r = a102e048Both("v56 _48", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e048XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_49_817830);
  r = a102e049Both("v56 _49", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e049XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_50_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_50);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e047Both("-0 p47", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e047YBits >>> 0, 0);
  rn = a102e048Both("-0 p48", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e048YBits >>> 0, 0);
  rn = a102e049Both("-0 p49", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e049YBits >>> 0, 0);
});

/* v56 mutants */
test("v56 mutant pins (chained packs)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M115: x is the ADDER law (chain + rx), not identity -- exact pin */
  {
    const r = a102e047Both("M115 p47 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e047XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e047XBits >>> 0, f32bits(3));
  }
  /* M116: pack-49 dispatches to PARKED pack-50 kind (100), not self (99) */
  {
    const r = a102e049Both("M116 p49 kind->100", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 100);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 99);
  }
});

function a102e050Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e050(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_50(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e051Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e051(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_51(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e052Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e052(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_52(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v57 SECOND-cluster packs 50+51+52 (transform-chained @ 0x0081ad42/0x0081adbb/0x0081ae1c)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e050Both("v57 _50", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e050XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e050YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_51_817830);
  r = a102e051Both("v57 _51", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e051XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_52_817830);
  r = a102e052Both("v57 _52", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e052XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_53_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_53);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e050Both("-0 p50", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e050YBits >>> 0, 0);
  rn = a102e051Both("-0 p51", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e051YBits >>> 0, 0);
  rn = a102e052Both("-0 p52", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e052YBits >>> 0, 0);
});

/* v57 mutants */
test("v57 mutant pins (chained packs 50-52)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M117: pack-50 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e050Both("M117 p50 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e050XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e050XBits >>> 0, f32bits(3));
  }
  /* M118: pack-52 dispatches to PARKED pack-53 kind (103), not
     self (102) */
  {
    const r = a102e052Both("M118 p52 kind->103", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 103);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 102);
  }
});

function a102e053Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e053(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_53(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e054Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e054(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_54(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e055Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e055(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_55(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v58 SECOND-cluster packs 53+54+55 (transform-chained @ 0x0081aed3/0x0081af4c/0x0081afaa)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e053Both("v58 _53", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e053XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e053YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_54_817830);
  r = a102e054Both("v58 _54", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e054XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_55_817830);
  r = a102e055Both("v58 _55", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e055XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_56_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_56);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e053Both("-0 p53", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e053YBits >>> 0, 0);
  rn = a102e054Both("-0 p54", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e054YBits >>> 0, 0);
  rn = a102e055Both("-0 p55", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e055YBits >>> 0, 0);
});

/* v58 mutants */
test("v58 mutant pins (chained packs 53-55)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M119: pack-53 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e053Both("M119 p53 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e053XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e053XBits >>> 0, f32bits(3));
  }
  /* M120: pack-55 dispatches to PARKED pack-56 kind (106), not
     self (105) */
  {
    const r = a102e055Both("M120 p55 kind->106", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 106);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 105);
  }
});

function a102e056Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e056(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_56(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e057Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e057(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_57(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e058Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e058(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_58(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v59 SECOND-cluster packs 56+57+58 (transform-chained @ 0x0081b005/0x0081b05e/0x0081b0d7)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e056Both("v59 _56", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e056XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e056YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_57_817830);
  r = a102e057Both("v59 _57", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e057XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_58_817830);
  r = a102e058Both("v59 _58", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e058XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_59_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_59);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e056Both("-0 p56", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e056YBits >>> 0, 0);
  rn = a102e057Both("-0 p57", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e057YBits >>> 0, 0);
  rn = a102e058Both("-0 p58", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e058YBits >>> 0, 0);
});

/* v59 mutants */
test("v59 mutant pins (chained packs 56-58)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M121: pack-56 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e056Both("M121 p56 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e056XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e056XBits >>> 0, f32bits(3));
  }
  /* M122: pack-58 dispatches to PARKED pack-59 kind (109), not
     self (108) */
  {
    const r = a102e058Both("M122 p58 kind->109", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 109);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 108);
  }
});

function a102e059Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e059(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_59(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e060Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e060(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_60(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e061Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e061(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_61(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v60 SECOND-cluster packs 59+60+61 (transform-chained @ 0x0081b135/0x0081b193/0x0081b1ec)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e059Both("v60 _59", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e059XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e059YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_60_817830);
  r = a102e060Both("v60 _60", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e060XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_61_817830);
  r = a102e061Both("v60 _61", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e061XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_62_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_62);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e059Both("-0 p59", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e059YBits >>> 0, 0);
  rn = a102e060Both("-0 p60", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e060YBits >>> 0, 0);
  rn = a102e061Both("-0 p61", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e061YBits >>> 0, 0);
});

/* v60 mutants */
test("v60 mutant pins (chained packs 59-61)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M123: pack-59 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e059Both("M123 p59 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e059XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e059XBits >>> 0, f32bits(3));
  }
  /* M124: pack-61 dispatches to PARKED pack-62 kind (112), not
     self (111) */
  {
    const r = a102e061Both("M124 p61 kind->112", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 112);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 111);
  }
});

function a102e062Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e062(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_62(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e063Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e063(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_63(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e064Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e064(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_64(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v61 SECOND-cluster packs 62+63+64 (transform-chained @ 0x0081b265/0x0081b2c6/0x0081b321)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e062Both("v61 _62", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e062XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e062YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_63_817830);
  r = a102e063Both("v61 _63", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e063XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_64_817830);
  r = a102e064Both("v61 _64", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e064XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_65_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_65);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e062Both("-0 p62", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e062YBits >>> 0, 0);
  rn = a102e063Both("-0 p63", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e063YBits >>> 0, 0);
  rn = a102e064Both("-0 p64", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e064YBits >>> 0, 0);
});

/* v61 mutants */
test("v61 mutant pins (chained packs 62-64)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M125: pack-62 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e062Both("M125 p62 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e062XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e062XBits >>> 0, f32bits(3));
  }
  /* M126: pack-64 dispatches to PARKED pack-65 kind (115), not
     self (114) */
  {
    const r = a102e064Both("M126 p64 kind->115", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 115);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 114);
  }
});

function a102e065Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e065(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_65(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e066Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e066(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_66(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e067Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e067(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_67(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v62 SECOND-cluster packs 65+66+67 (transform-chained @ 0x0081b37d/0x0081b3f9/0x0081b457)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e065Both("v62 _65", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e065XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e065YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_66_817830);
  r = a102e066Both("v62 _66", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e066XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_67_817830);
  r = a102e067Both("v62 _67", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e067XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_68_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_68);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e065Both("-0 p65", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e065YBits >>> 0, 0);
  rn = a102e066Both("-0 p66", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e066YBits >>> 0, 0);
  rn = a102e067Both("-0 p67", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e067YBits >>> 0, 0);
});

/* v62 mutants */
test("v62 mutant pins (chained packs 65-67)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M127: pack-65 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e065Both("M127 p65 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e065XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e065XBits >>> 0, f32bits(3));
  }
  /* M128: pack-67 dispatches to PARKED pack-68 kind (118), not
     self (117) */
  {
    const r = a102e067Both("M128 p67 kind->118", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 118);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 117);
  }
});

function a102e068Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e068(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_68(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e069Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e069(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_69(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e070Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e070(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_70(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v63 SECOND-cluster packs 68+69+70 (transform-chained @ 0x0081b4b2/0x0081b50b/0x0081c00c)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e068Both("v63 _68", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e068XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e068YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_69_817830);
  r = a102e069Both("v63 _69", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e069XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_70_817830);
  r = a102e070Both("v63 _70", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e070XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_71_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_71);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e068Both("-0 p68", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e068YBits >>> 0, 0);
  rn = a102e069Both("-0 p69", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e069YBits >>> 0, 0);
  rn = a102e070Both("-0 p70", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e070YBits >>> 0, 0);
});

/* v63 mutants */
test("v63 mutant pins (chained packs 68-70)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M129: pack-68 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e068Both("M129 p68 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e068XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e068XBits >>> 0, f32bits(3));
  }
  /* M130: pack-70 dispatches to PARKED pack-71 kind (121), not
     self (120) */
  {
    const r = a102e070Both("M130 p70 kind->121", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 121);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 120);
  }
});

function a102e071Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e071(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_71(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e072Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e072(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_72(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e073Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e073(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_73(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v64 SECOND-cluster packs 71+72+73 (transform-chained @ 0x0081c067/0x0081c0c5/0x0081c11b)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e071Both("v64 _71", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e071XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e071YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_72_817830);
  r = a102e072Both("v64 _72", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e072XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_73_817830);
  r = a102e073Both("v64 _73", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e073XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_74_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_74);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e071Both("-0 p71", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e071YBits >>> 0, 0);
  rn = a102e072Both("-0 p72", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e072YBits >>> 0, 0);
  rn = a102e073Both("-0 p73", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e073YBits >>> 0, 0);
});

/* v64 mutants */
test("v64 mutant pins (chained packs 71-73)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M131: pack-71 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e071Both("M131 p71 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e071XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e071XBits >>> 0, f32bits(3));
  }
  /* M132: pack-73 dispatches to PARKED pack-74 kind (124), not
     self (123) */
  {
    const r = a102e073Both("M132 p73 kind->124", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 124);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 123);
  }
});

function a102e074Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e074(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_74(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e075Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e075(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_75(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e076Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e076(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_76(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v65 SECOND-cluster packs 74+75+76 (transform-chained @ 0x0081c194/0x0081c1f5/0x0081c250)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e074Both("v65 _74", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e074XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e074YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_75_817830);
  r = a102e075Both("v65 _75", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e075XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_76_817830);
  r = a102e076Both("v65 _76", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e076XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_77_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_77);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e074Both("-0 p74", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e074YBits >>> 0, 0);
  rn = a102e075Both("-0 p75", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e075YBits >>> 0, 0);
  rn = a102e076Both("-0 p76", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e076YBits >>> 0, 0);
});

/* v65 mutants */
test("v65 mutant pins (chained packs 74-76)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M133: pack-74 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e074Both("M133 p74 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e074XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e074XBits >>> 0, f32bits(3));
  }
  /* M134: pack-76 dispatches to PARKED pack-77 kind (127), not
     self (126) */
  {
    const r = a102e076Both("M134 p76 kind->127", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 127);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 126);
  }
});

function a102e077Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e077(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_77(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e078Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e078(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_78(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e079Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e079(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_79(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v66 SECOND-cluster packs 77+78+79 (transform-chained @ 0x0081c2ac/0x0081c328/0x0081c386)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e077Both("v66 _77", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e077XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e077YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_78_817830);
  r = a102e078Both("v66 _78", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e078XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_79_817830);
  r = a102e079Both("v66 _79", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e079XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_80_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_80);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e077Both("-0 p77", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e077YBits >>> 0, 0);
  rn = a102e078Both("-0 p78", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e078YBits >>> 0, 0);
  rn = a102e079Both("-0 p79", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e079YBits >>> 0, 0);
});

/* v66 mutants */
test("v66 mutant pins (chained packs 77-79)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M135: pack-77 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e077Both("M135 p77 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e077XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e077XBits >>> 0, f32bits(3));
  }
  /* M136: pack-79 dispatches to PARKED pack-80 kind (130), not
     self (129) */
  {
    const r = a102e079Both("M136 p79 kind->130", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 130);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 129);
  }
});

function a102e080Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e080(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_80(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e081Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e081(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_81(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e082Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e082(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_82(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v67 SECOND-cluster packs 80+81+82 (transform-chained @ 0x0081c3e1/0x0081c43a/0x0081c4b6)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e080Both("v67 _80", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e080XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e080YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_81_817830);
  r = a102e081Both("v67 _81", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e081XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_82_817830);
  r = a102e082Both("v67 _82", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e082XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_83_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_83);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e080Both("-0 p80", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e080YBits >>> 0, 0);
  rn = a102e081Both("-0 p81", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e081YBits >>> 0, 0);
  rn = a102e082Both("-0 p82", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e082YBits >>> 0, 0);
});

/* v67 mutants */
test("v67 mutant pins (chained packs 80-82)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M137: pack-80 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e080Both("M137 p80 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e080XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e080XBits >>> 0, f32bits(3));
  }
  /* M138: pack-82 dispatches to PARKED pack-83 kind (133), not
     self (132) */
  {
    const r = a102e082Both("M138 p82 kind->133", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 133);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 132);
  }
});

function a102e083Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e083(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_83(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e084Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e084(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_84(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e085Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e085(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_85(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v68 SECOND-cluster packs 83+84+85 (transform-chained @ 0x0081c514/0x0081c56f/0x0081c5c8)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e083Both("v68 _83", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e083XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e083YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_84_817830);
  r = a102e084Both("v68 _84", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e084XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_85_817830);
  r = a102e085Both("v68 _85", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e085XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_86_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_86);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e083Both("-0 p83", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e083YBits >>> 0, 0);
  rn = a102e084Both("-0 p84", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e084YBits >>> 0, 0);
  rn = a102e085Both("-0 p85", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e085YBits >>> 0, 0);
});

/* v68 mutants */
test("v68 mutant pins (chained packs 83-85)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M139: pack-83 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e083Both("M139 p83 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e083XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e083XBits >>> 0, f32bits(3));
  }
  /* M140: pack-85 dispatches to PARKED pack-86 kind (136), not
     self (135) */
  {
    const r = a102e085Both("M140 p85 kind->136", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 136);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 135);
  }
});

function a102e086Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e086(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_86(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e087Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e087(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_87(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}
function a102e088Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e088(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_88(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("v69 SECOND-cluster packs 86+87+88 (transform-chained @ 0x0081c64a/0x0081c6a8/0x0081c706)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* chained adder law: x = chain + rx, y = 0 + ry */
  let r = a102e086Both("v69 _86", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e086XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e086YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_87_817830);
  r = a102e087Both("v69 _87", f32bits(10), f32bits(-6), f32bits(0.5));
  assert.equal(r.wasmEv.type9A102e087XBits >>> 0,
    f32bits(Math.fround(0.5 + 10)));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_88_817830);
  r = a102e088Both("v69 _88", f32bits(1), f32bits(2), f32bits(64));
  assert.equal(r.wasmEv.type9A102e088XBits >>> 0, f32bits(65));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_89_817830);
  /* parked dispatch target */
  assert.equal(r.wasmEv.hostArg0 >>> 0, M.GAME_RENDER_VA_TYPE9_A102E0_89);
  /* -0 normalizer through the adder y-law on all three */
  let rn = a102e086Both("-0 p86", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e086YBits >>> 0, 0);
  rn = a102e087Both("-0 p87", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e087YBits >>> 0, 0);
  rn = a102e088Both("-0 p88", f32bits(2), f32bits(-0), f32bits(1));
  assert.equal(rn.wasmEv.type9A102e088YBits >>> 0, 0);
});

/* v69 mutants */
test("v69 mutant pins (chained packs 86-88)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M141: pack-86 x is the ADDER law (chain + rx), not identity --
     exact pin */
  {
    const r = a102e086Both("M141 p86 x=add", f32bits(3), f32bits(4),
      f32bits(2));
    assert.equal(r.wasmEv.type9A102e086XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e086XBits >>> 0, f32bits(3));
  }
  /* M142: pack-88 dispatches to PARKED pack-89 kind (139), not
     self (138) */
  {
    const r = a102e088Both("M142 p88 kind->139", f32bits(1), f32bits(2),
      f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0, 139);
    assert.notEqual(r.wasmEv.continuationKind >>> 0, 138);
  }
});
function a102e089Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e089(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_89(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e090Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e090(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_90(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e091Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e091(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_91(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e092Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e092(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_92(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e093Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e093(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_93(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e094Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e094(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_94(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e095Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e095(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_95(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e096Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e096(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_96(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e097Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e097(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_97(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e098Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e098(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_98(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e099Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e099(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_99(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0100Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0100(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_100(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0101Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0101(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_101(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0102Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0102(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_102(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0103Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0103(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_103(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0104Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0104(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_104(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0105Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0105(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_105(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0106Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0106(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_106(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0107Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0107(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_107(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0108Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0108(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_108(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

function a102e0109Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0109(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_109(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}

test("cluster-closure packs 89-109 (transform-chained)", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  let r;
  r = a102e089Both("closure _89", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e089XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e089YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_90_817830);
  r = a102e090Both("closure _90", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e090XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e090YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_91_817830);
  r = a102e091Both("closure _91", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e091XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e091YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_92_817830);
  r = a102e092Both("closure _92", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e092XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e092YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_93_817830);
  r = a102e093Both("closure _93", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e093XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e093YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_94_817830);
  r = a102e094Both("closure _94", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e094XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e094YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_95_817830);
  r = a102e095Both("closure _95", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e095XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e095YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_96_817830);
  r = a102e096Both("closure _96", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e096XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e096YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_97_817830);
  r = a102e097Both("closure _97", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e097XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e097YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_98_817830);
  r = a102e098Both("closure _98", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e098XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e098YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_99_817830);
  r = a102e099Both("closure _99", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e099XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e099YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_100_817830);
  r = a102e0100Both("closure _100", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0100XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0100YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_101_817830);
  r = a102e0101Both("closure _101", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0101XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0101YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_102_817830);
  r = a102e0102Both("closure _102", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0102XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0102YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_103_817830);
  r = a102e0103Both("closure _103", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0103XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0103YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_104_817830);
  r = a102e0104Both("closure _104", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0104XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0104YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_105_817830);
  r = a102e0105Both("closure _105", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0105XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0105YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_106_817830);
  r = a102e0106Both("closure _106", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0106XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0106YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_107_817830);
  r = a102e0107Both("closure _107", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0107XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0107YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_108_817830);
  r = a102e0108Both("closure _108", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0108XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0108YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_109_817830);
  r = a102e0109Both("closure _109", f32bits(3), f32bits(4), f32bits(2));
  assert.equal(r.wasmEv.type9A102e0109XBits >>> 0, f32bits(5));
  assert.equal(r.wasmEv.type9A102e0109YBits >>> 0, f32bits(4));
  assert.equal(r.wasmEv.continuationKind,
    M.GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830);
  /* terminal station instance @ 0x0081dab9 */
  assert.equal(r.wasmEv.hostArg0 >>> 0, 0x0081dab9);
});


test("cluster-closure mutant pins", () => {
  exp = loadExports();
  view = new DataView(exp.memory.buffer);
  /* M143: pack-89 x-law exactness */
  {
    const r = a102e089Both("M143 x=add", f32bits(3), f32bits(4), f32bits(2));
    assert.equal(r.wasmEv.type9A102e089XBits >>> 0, f32bits(5));
    assert.notEqual(r.wasmEv.type9A102e089XBits >>> 0, f32bits(3));
  }
  /* M144: terminal remain kind */
  {
    const r = a102e0109Both("M144 terminal kind", f32bits(1), f32bits(2), f32bits(0));
    assert.equal(r.wasmEv.continuationKind >>> 0,
      M.GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830);
    assert.equal(r.wasmEv.hostArg0 >>> 0, 0x0081dab9);
  }
});
