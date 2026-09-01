// gen-cluster-close.mjs — lands packs 96..109 across the game-render
// family in two assertion-guarded batches.
//   node scripts/decomp/gen-cluster-close.mjs 1   -> packs 96..102 (ABI 72)
//   node scripts/decomp/gen-cluster-close.mjs 2   -> packs 103..109 (ABI 73)
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const which = process.argv[2] ?? "1";
const H = "native/decomp/game_render_slice.h";
const C = "native/decomp/game_render_slice.cpp";
const M = "scripts/decomp/game-render-model.mjs";
const T = "tests/decomp-game-render-slice.test.js";
const J = "decomp/game-render-slice.json";
const G = "web/js/render-host-gl.js";

const SITE = {
  96: 0x0081d430, 97: 0x0081d486, 98: 0x0081d4f5, 99: 0x0081d556,
  100: 0x0081d5b1, 101: 0x0081d60d, 102: 0x0081d67c, 103: 0x0081d6da,
  104: 0x0081d735, 105: 0x0081d78e, 106: 0x0081d7fd, 107: 0x0081d85b,
  108: 0x0081d8b6, 109: 0x0081d90f,
};
const TERMINAL_STATION = 0x0081dab9;

const cfg = which === "1"
  ? { packs: [96, 97, 98, 99, 100, 101, 102], abiOld: 71, abiNew: 72,
      evszOld: 1256, evszNew: 1312, tag: "v72",
      seqMoves: [
        ["const A_BASE_SEQ = 0x100700;", "const A_BASE_SEQ = 0x100800;"],
        ["const A_COUNT_SEQ = 0x100800;", "const A_COUNT_SEQ = 0x100900;"],
        ["const A_OUT_SLOTS = 0x100900;", "const A_OUT_SLOTS = 0x100a00;"],
        ["const A_GRID_SLOTS = 0x100b00;", "const A_GRID_SLOTS = 0x100c00;"],
      ],
      json: ["\"abiVersion\": 71,", "\"abiVersion\": 72,"],
      gl: ["RENDER_SLICE_ABI_VERSION = 71;", "RENDER_SLICE_ABI_VERSION = 72;",
           "v58-v71: tracked bumps.", "v58-v72: tracked bumps."] }
  : { packs: [103, 104, 105, 106, 107, 108, 109], abiOld: 72, abiNew: 73,
      evszOld: 1312, evszNew: 1368, tag: "v73",
      seqMoves: [],
      json: ["\"abiVersion\": 72,", "\"abiVersion\": 73,"],
      gl: ["RENDER_SLICE_ABI_VERSION = 72;", "RENDER_SLICE_ABI_VERSION = 73;",
           "v58-v72: tracked bumps.", "v58-v73: tracked bumps."] };

const rd = (f) => readFileSync(f, "utf8");
const wr = (f, c) => {
  if (c.includes("\r")) throw new Error(`CRLF introduced in ${f}`);
  writeFileSync(f, c, "utf8");
};
function sub1(text, old, nw, label) {
  const n = text.split(old).length - 1;
  assert.equal(n, 1, `${label}: anchor count ${n} != 1\n---\n${old.slice(0, 140)}`);
  return text.replace(old, nw, 1);
}

// derive kind numbering from header's actual max
{
  const h = rd(H);
  const nums = [...h.matchAll(/_817830 = (\d+)/g)].map((m) => Number(m[1]));
  cfg.kindStart = Math.max(...nums) + 1;
}
cfg.kindOf = {}; // pack j -> kind const value for CONTINUE_AT..._{j}_817830
cfg.packs.forEach((p, k) => {
  const j = p + 1;
  cfg.kindOf[j] = cfg.kindStart + k;
});

// ---------- HEADER ----------
let h = rd(H);
h = sub1(h, `enum { ISAAC_GAME_RENDER_SLICE_ABI_VERSION = ${cfg.abiOld} };`,
  `enum { ISAAC_GAME_RENDER_SLICE_ABI_VERSION = ${cfg.abiNew} };`, "h.abi");
{
  // kinds: find current tail entry inside the enum
  const mH = [...h.matchAll(/  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_(\d+)_817830 = (\d+)\n\};/)];
  assert.equal(mH.length, 1, "header kinds tail ambiguous");
  const [lastName, lastNum] = [mH[0][1], mH[0][2]];
  let block = "";
  cfg.packs.forEach((p, idx) => {
    const j = p + 1, k = cfg.kindOf[j];
    block += `  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${j}_817830 = ${k}` +
      (idx === cfg.packs.length - 1 ? "\n};" : ",\n");
  });
  h = sub1(h,
    `  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${lastName}_817830 = ${lastNum}\n};`,
    `  ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${lastName}_817830 = ${lastNum},\n${block}`,
    "h.kinds");
  // VAs
  const lastPack = cfg.packs[cfg.packs.length - 1];
  h = sub1(h, `  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_${lastPack} = ${hex(SITE[lastPack])},\n`,
    `  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_${lastPack} = ${hex(SITE[lastPack])},\n` +
    cfg.packs.map((p) => `  ISAAC_GAME_RENDER_VA_TYPE9_A102E0_${p + 1} = ${hex(SITE[p + 1])},\n`).join(""),
    "h.vas");
  // event fields
  const fldAnchor = `  uint32_t type9_a102e0_${cfg.packs[0] - 1}_y_bits;\n}`;
  let flds = fldAnchor.slice(0, -1);
  for (const p of cfg.packs) {
    flds += `  uint32_t type9_a102e0_${p}_x_bits;\n  uint32_t type9_a102e0_${p}_y_bits;\n`;
  }
  flds += "}";
  h = sub1(h, fldAnchor, flds, "h.fields");
}
wr(H, h);

// decls live right before the closing extern block; append after the last _NN decl line
h = rd(H);
{
  const lastDecl = `int32_t isaac_game_render_slice_resume_817830_type9_a102e0_${cfg.packs[0] - 1}(const IsaacGameRenderSliceState* state`;
  const i = h.indexOf(lastDecl);
  assert.notEqual(i, -1, "decl anchor");
  const lineEnd = h.indexOf("\n", i) + 1;
  const add = cfg.packs.map((p) =>
    `int32_t isaac_game_render_slice_resume_817830_type9_a102e0_${p}(const IsaacGameRenderSliceState* state, const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits, uint32_t eax_y_bits, uint32_t chain_scalar_bits, IsaacGameRenderSliceEvents* events);\n`).join("");
  h = h.slice(0, lineEnd) + add + h.slice(lineEnd);
}
wr(H, h);
console.log("header OK");

// ---------- CPP ----------
let c = rd(C);
c = sub1(c, `static_assert(sizeof(IsaacGameRenderSliceEvents) == ${cfg.evszOld},`,
  `static_assert(sizeof(IsaacGameRenderSliceEvents) == ${cfg.evszNew},`, "c.assert");
{
  const lastName = cfg.packs[cfg.packs.length - 1] + 1;
  const anchor = `    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${lastName}_817830:\n      return 1;`;
  const cases = cfg.packs.map((p) =>
    `    case ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${p + 1}_817830:`).join("\n");
  c = sub1(c, anchor, `${cases}\n      return 1;`, "c.switch");
}
c = c.replace(/\n+\s*$/, "\n");

const cppFn = (p) => {
  const j = p + 1;
  const terminal = p === 109;
  const extra = terminal
    ? " Pack-109 is\n     TERMINAL: its continuation folds the a11130/a112a0 host\n     pair + the a0f550 draw-band station @ 0x0081dab9 + the final\n     67f310 draw-band run ending in int3 padding (~0x0081df75, end\n     of the containing function) -- no further pack calls exist."
    : " The second\n     setter + next-pack this prep stay host.";
  const emitBlock = terminal
    ? "  events->lroom_next_va = ISAAC_GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;\n  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830,\n       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,\n       1u);\n  events->host_arg0 = ISAAC_GAME_RENDER_VA_HOST_A0F550_TERMINAL_109;"
    : `  events->lroom_next_va = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_${j};\n  emit(events, ISAAC_GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${j}_817830,\n       ISAAC_GAME_RENDER_HOST_A102E0, ISAAC_GAME_RENDER_VA_A102E0, 0u, 0u,\n       1u);\n  events->host_arg0 = ISAAC_GAME_RENDER_VA_TYPE9_A102E0_${j};`;
  return `
int32_t
isaac_game_render_slice_resume_817830_type9_a102e0_${p}(
    const IsaacGameRenderSliceState* state,
    const IsaacGameRenderSliceRuntimeInputs* inputs, uint32_t eax_x_bits,
    uint32_t eax_y_bits, uint32_t chain_scalar_bits,
    IsaacGameRenderSliceEvents* events) {
  clear_events(events);
  if (state == nullptr || inputs == nullptr || events == nullptr) {
    return 0;
  }
  /* Transform-chained cluster law: setter 0xa0fe90 stores S->xy =
     (chain_scalar, 0.0) then adder 0xa10420 computes Q->xy =
     S->xy + pack_result->xy with this = pack result. Typed pair:
     x = addss(chain_scalar, eax_x), y = addss(0.0, eax_y).${extra}
  const float out_x = bits_to_f32(chain_scalar_bits) + bits_to_f32(eax_x_bits);
  const float out_y = 0.0f + bits_to_f32(eax_y_bits);
  events->type9_a102e0_${p}_x_bits = f32_to_bits(out_x);
  events->type9_a102e0_${p}_y_bits = f32_to_bits(out_y);
${emitBlock}
  return 1;
}
`;
};
c = c.replace(/\n+\s*$/, "\n") + cfg.packs.map(cppFn).join("");
wr(C, c);
console.log("cpp OK", rd(C).split("\n").length, "lines");

// ---------- MODEL ----------
let m = rd(M);
m = sub1(m, `export const GAME_RENDER_SLICE_ABI_VERSION = ${cfg.abiOld};`,
  `export const GAME_RENDER_SLICE_ABI_VERSION = ${cfg.abiNew};`, "m.abi");
{
  // kinds after the highest existing TYPE9_A102E0_NN kind export pair
  const prevLast = cfg.packs[0]; // first NEW pack; its predecessor is packs-1
  const prevJ = cfg.packs[0];
  void prevJ;
  const anchorName = `GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${prevLast - 1}_817830 = ${cfg.kindStart - 1};`;
  let block = "";
  for (const p of cfg.packs) {
    const j = p + 1, k = cfg.kindOf[j];
    block += `export const GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${j}_817830 = ${k};\nexport const TYPE9_A102E0_${j}_817830 = ${k};\n`;
  }
  m = sub1(m, `export const ${anchorName}\n`, `export const ${anchorName}\n${block}`, "m.kinds");
  // VAs
  const vaPrev = `GAME_RENDER_VA_TYPE9_A102E0_${prevLast - 1} = ${hex(SITE[prevLast - 1])};`;
  m = sub1(m, `export const ${vaPrev}\n`, `export const ${vaPrev}\n` +
    cfg.packs.map((p) => `export const GAME_RENDER_VA_TYPE9_A102E0_${p + 1} = ${hex(SITE[p + 1])};\nexport const TYPE9_A102E0_${p + 1} = ${hex(SITE[p + 1])};\n`).join(""),
    "m.vas");
  // fields
  const fldA = cfg.packs[0] - 1;
  m = sub1(m, `  "type9A102e0${fldA}XBits",\n  "type9A102e0${fldA}YBits",\n`,
    `  "type9A102e0${fldA}XBits",\n  "type9A102e0${fldA}YBits",\n` +
    cfg.packs.map((p) => `  "type9A102e0${p}XBits",\n  "type9A102e0${p}YBits",\n`).join(""),
    "m.fields");
  // recapture set
  const recA = cfg.packs[cfg.packs.length - 1] + 1;
  m = sub1(m, `  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${recA}_817830,\n`,
    `  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${recA}_817830,\n` +
    cfg.packs.map((p) => `  GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${p + 1}_817830,\n`).join(""),
    "m.recapt");
  // oracles: insert after the LAST oracle fn of the previous batch
  // (pack (first-1)'s fn end). Anchor on its unique tail.
  const prevP = cfg.packs[0] - 1;
  const ocTail =
    `  e.lroomNextVa = GAME_RENDER_VA_TYPE9_A102E0_${cfg.packs[0]};\n`
    + `  emit(e, GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${cfg.packs[0]}_817830,\n`
    + `    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);\n`
    + `  e.hostArg0 = GAME_RENDER_VA_TYPE9_A102E0_${cfg.packs[0]};\n`
    + `  return e;\n}`;
  let oracles = ocTail;
  for (const p of cfg.packs) {
    const j = p + 1, terminal = p === 109;
    const nextVa = terminal ? "GAME_RENDER_VA_HOST_A0F550_TERMINAL_109"
      : `GAME_RENDER_VA_TYPE9_A102E0_${j}`;
    const emitKind = terminal ? "GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830"
      : `GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${j}_817830`;
    oracles += `

/** Transform-chained cluster pack-${p} @ ${hx(SITE[p])}: same chained law;${terminal
      ? " TERMINAL -- its continuation folds the a11130/a112a0 pair + the\n * a0f550 station @ 0x0081dab9 + the final draw-band run."
      : ` emits kind ${cfg.kindOf[j]} to pack-${j} @ ${hx(SITE[j])}.`} */
export function gameRenderResume817830Type9A102e0${p}(
  state, inputs, eaxXBits, eaxYBits, chainScalarBits,
) {
  const e = gameRenderEmptyEvents();
  if (state == null || inputs == null) return e;
  e.type9A102e0${p}XBits = addssBits(chainScalarBits, eaxXBits);
  e.type9A102e0${p}YBits = addssBits(0, eaxYBits);
  e.lroomNextVa = ${nextVa};
  emit(e, ${emitKind},
    GAME_RENDER_HOST_A102E0, GAME_RENDER_VA_A102E0, 0, 0, 1);
  e.hostArg0 = ${nextVa};
  return e;
}`;
  }
  m = sub1(m, ocTail, oracles, "m.oracles");
}
wr(M, m);
console.log("model OK");

// ---------- TEST ----------
t = rd(T);
for (const [o, n] of cfg.seqMoves) t = sub1(t, o, n, `t.seq ${o}`);
// layout comment: rewrite size/head line + append v-note before the close
t = sub1(t,
  `   A_EVENTS (${cfg.evszOld} bytes / 0x4${(cfg.evszOld >> 8).toString(16)}) ends at`,
  `   A_EVENTS (${cfg.evszNew} bytes / 0x${cfg.evszNew.toString(16)}) ends at`, "t.layout.sz");
{
  const oldNote = which === "1"
    ? "   HELD at the same\n   16-byte margin -- next unit (1224/0x4c0) MUST\n   bump). */"
    : "   -> 1224 bytes, seq ->\n   0x100680 -- the stride moves with the events end -- no overlap). */";
  void oldNote;
  // simpler: replace the trailing close marker line by regex-free anchored text
  t = t.replace(/(bytes, seq ->[^*]*?-- the stride moves with the events end -- no\s+overlap)\)\. \*\//s,
    (_mm) => `${_mm.slice(0, _mm.length - "no overlap). */".length)}no overlap). v${70 + Number(which)}: -> ${cfg.evszNew} bytes${which === "1" ? ", whole scratch block moved (+0x100 OUT/GRID)" : ""}). */`);
}
// exports
{
  const prevExp = `  "isaac_game_render_slice_resume_817830_type9_a102e0_${cfg.packs[0] - 1}",\n`;
  t = sub1(t, prevExp, prevExp +
    cfg.packs.map((p) => `  "isaac_game_render_slice_resume_817830_type9_a102e0_${p}",\n`).join(""),
    "t.exports");
}
// ABI + size pins
t = sub1(t, `assert.equal(M.GAME_RENDER_SLICE_ABI_VERSION, ${cfg.abiOld});`,
  `assert.equal(M.GAME_RENDER_SLICE_ABI_VERSION, ${cfg.abiNew});`, "t.abi1");
t = sub1(t, `exp.isaac_game_render_slice_abi_version() >>> 0, ${cfg.abiOld});`,
  `exp.isaac_game_render_slice_abi_version() >>> 0, ${cfg.abiNew});`, "t.abi2");
t = sub1(t, `exp.isaac_game_render_slice_events_size() >>> 0, ${cfg.evszOld});`,
  `exp.isaac_game_render_slice_events_size() >>> 0, ${cfg.evszNew});`, "t.evsz");
// helpers + group + mutants at EOF
let grp = "\n" + cfg.packs.map((p) => `function a102e0${p}Both(label, eaxX, eaxY, chain) {
  const S = defaultState();
  const I = defaultInputs();
  return both(label, S, I, {
    js: () => M.gameRenderResume817830Type9A102e0${p}(S, I, eaxX, eaxY, chain),
    wasm: () => exp.isaac_game_render_slice_resume_817830_type9_a102e0_${p}(
      A_STATE, A_INPUTS, eaxX, eaxY, chain, A_EVENTS),
  });
}`).join("\n") + "\n";

grp += `\ntest("${cfg.tag} SECOND-cluster packs ${cfg.packs.join("+")} (transform-chained)", () => {\n  exp = loadExports();\n  view = new DataView(exp.memory.buffer);\n`;
for (const p of cfg.packs) {
  const j = p + 1, terminal = p === 109;
  grp += terminal
    ? `  r = a102e0${p}Both("${cfg.tag} _${p}", f32bits(3), f32bits(4), f32bits(2));\n  assert.equal(r.wasmEv.continuationKind,\n    M.GAME_RENDER_CONTINUE_AT_HOST_A0F550_817830);\n  /* terminal station instance */\n  assert.equal(r.wasmEv.hostArg0 >>> 0, 0x0081dab9);\n`
    : `  r = a102e0${p}Both("${cfg.tag} _${p}", f32bits(3), f32bits(4), f32bits(2));\n  assert.equal(r.wasmEv.continuationKind,\n    M.GAME_RENDER_CONTINUE_AT_TYPE9_A102E0_${j}_817830);\n  r = a102e0${j}Both; /* chained below */\n`;
}
grp += "});\n";
void grp;

t = t.replace(/\n+\s*$/, "\n") + grp + "\n";
wr(T, t);
console.log("test OK (group scaffold; pins refined below)");
