import test from "node:test";
import rawAssert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  ALLOC_PURE_ABI_VERSION,
  ALLOC_VA_TRACKED_WRAPPER,
  ALLOC_VA_THIN_ALLOC_STACK,
  ALLOC_VA_THIN_ALLOC_ECX,
  ALLOC_VA_FREE_WRAPPER,
  ALLOC_VA_SIZED_DELETE_SHIM,
  ALLOC_VA_SB_ALLOC,
  ALLOC_VA_STRING_CTOR,
  ALLOC_VA_UNSCALED_RELEASE,
  ALLOC_VA_STRING_TIDY,
  ALLOC_VA_SB_THROW_HELPER,
  ALLOC_VA_SB_THROW_CTOR,
  ALLOC_VA_XLENGTH_THROW,
  ALLOC_VA_OOM_OBSERVER,
  ALLOC_IAT_MALLOC,
  ALLOC_IAT_FREE,
  ALLOC_IAT_INVALID_PARAMETER,
  ALLOC_IAT_XLENGTH_ERROR,
  ALLOC_TRACKED_ROOT_VA,
  ALLOC_TRACKED_ACCT_OFF_LO,
  ALLOC_TRACKED_ACCT_OFF_HI,
  ALLOC_FALLBACK_ACCT_LO_VA,
  ALLOC_FALLBACK_ACCT_HI_VA,
  ALLOC_OBSERVER_LIST_VA,
  ALLOC_OOM_OBSERVER_ARG,
  ALLOC_FREE_STACK_ZERO_WORDS,
  ALLOC_HEADER_SIZE,
  ALLOC_SB_BIG_MIN,
  ALLOC_SB_PAD,
  ALLOC_SB_ALIGN_MASK,
  ALLOC_SB_STASH_BACK_OFF,
  ALLOC_SB_OVERFLOW_MIN,
  ALLOC_SB_DELTA_MAX,
  ALLOC_XLENGTH_MSG_VA,
  ALLOC_XLENGTH_STRING_VA,
  ALLOC_XLENGTH_STRING_MSG_VA,
  ALLOC_XLENGTH_DEQUE_VA,
  ALLOC_XLENGTH_DEQUE_MSG_VA,
  ALLOC_SB_RELEASE_X4_VA,
  ALLOC_SB_RELEASE_X4_ELEMENT_BYTES,
  ALLOC_SB_RELEASE_X4_RET_BYTES,
  ALLOC_CALLERS_SB_RELEASE_X4,
  ALLOC_CALLERS_XLENGTH_STRING,
  ALLOC_CALLERS_XLENGTH_DEQUE,
  ALLOC_CALLERS_A648B0,
  ALLOC_CALLERS_A0F4C0,
  ALLOC_CALLERS_A0F4E0,
  ALLOC_CALLERS_A0F500,
  ALLOC_CALLERS_SB_ALLOC,
  ALLOC_CALLERS_XLENGTH,
  ALLOC_CALLERS_OOM_OBSERVER,
  ALLOC_CALLERS_SB_THROW,
  ALLOC_SB_RELEASE_TEMPLATE_SITES,
  ALLOC_DIDOD_CALLSITE_VA,
  ALLOC_DIDOD_STRIDE,
  ALLOC_DIDOD_SATURATED_LO,
  ALLOC_DIDOD_MALLOC_ARG,
  ALLOC_CALLERS_STRING_CTOR,
  ALLOC_CALLERS_STRING_TIDY,
  ALLOC_CALLERS_UNSCALED_RELEASE,
  ALLOC_UNSCALED_RELEASE_CALLER_1,
  ALLOC_UNSCALED_RELEASE_CALLER_2,
  ALLOC_SB_THROW_VTABLE_VA,
  ALLOC_BAD_ALLOC_EXCEPTION_VTABLE_VA,
  ALLOC_STR_SSO_CAP,
  ALLOC_STR_SSO_CAP_VALUE,
  ALLOC_STR_SSO_COPY_LEN,
  ALLOC_STR_CTOR_SAT,
  ALLOC_TIDY_RESET_SIZE,
  ALLOC_TIDY_RESET_CAP,
  ALLOC_TIDY_RESET_FIRST_BYTE,
  ALLOC_VA_STRING_ASSIGN,
  ALLOC_CALLERS_STRING_ASSIGN,
  ALLOC_STR_ASSIGN_MAX_LEN,
  ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA,
  ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA,
  ALLOC_IAT_MEMMOVE,
  ALLOC_IAT_MEMCPY,
  ALLOC_STR_ASSIGN_ABORT_VA,
  ALLOC_STR_ASSIGN_THROW_VA,
  ALLOC_MODE_ALLOC,
  ALLOC_MODE_FREE,
  ALLOC_MODE_ACCOUNT,
  ALLOC_ACTION_ALLOC,
  ALLOC_ACTION_FREE,
  ALLOC_ACTION_ACCOUNT,
  ALLOC_ACTION_NONE,
  ALLOC_SB_KIND_ZERO,
  ALLOC_SB_KIND_SMALL,
  ALLOC_SB_KIND_BIG,
  ALLOC_SB_KIND_THROW,
  allocA648b0Mode,
  allocA648b0Action,
  allocAcctBlockVa,
  allocAcctIsFallback,
  allocMode2TargetVa,
  allocMode2SelectsFallback,
  allocMode2ClearsFallback,
  allocMode2FoldLo,
  allocMode2FoldHi,
  allocClampNeeded,
  allocClampedLo,
  allocClampedHi,
  allocMallocArg,
  allocAcctAddHi,
  allocHeaderValue,
  allocResult,
  allocOomObserverNeeded,
  allocFreeNeeded,
  allocFreeBase,
  allocAcctSubLo,
  allocAcctSubBorrow,
  allocAcctSubHi,
  allocFreeSubtractsAllocCarry,
  allocAcctAllocLo,
  allocAcctAllocHi,
  allocRoundtrip,
  allocA648b0Plan,
  allocA0f4c0ModeCl,
  allocA0f4c0SizeHi,
  allocA0f4c0Edx,
  allocA0f4e0PushedLo,
  allocA0f500ModeCl,
  allocA0f500StackZeroWords,
  allocAef15cSizeDropped,
  allocSbIsBig,
  allocSbOverflow,
  allocSbRawRequest,
  allocSbPayload,
  allocSbStashVa,
  allocSbAllocCalled,
  allocSbKind,
  allocSbPlan,
  allocSbrIsBig,
  allocSbrAdjustedSize,
  allocSbrDelta,
  allocSbrValid,
  allocSbrFreeArg,
  allocSbrPlan,
  allocSbRoundtripValid,
  allocXlengthMsgVa,
  allocXlengthStringMsgVa,
  allocXlengthDequeMsgVa,
  allocC740ByteSize,
  allocC740IsBig,
  allocC740AdjustedSize,
  allocC740Plan,
  allocStrCtorSso,
  allocStrCtorSrcUsesHeap,
  allocStrCtorCap,
  allocStrCtorAllocArg,
  allocStrCtorCopyLen,
  allocStrCtorPlan,
  allocStrTidyReleaseNeeded,
  allocStrTidySizeArg,
  allocStrTidyPlan,
  allocStrAssignGrowNeeded,
  allocStrAssignThrows,
  allocStrAssignRoundSaturated,
  allocStrAssignGrowSaturated,
  allocStrAssignNewCap,
  allocStrAssignAllocArg,
  allocStrAssignFastUsesHeap,
  allocStrAssignCopyLen,
  allocStrAssignFastHelperVa,
  allocStrAssignGrowHelperVa,
  allocStrAssignReleaseNeeded,
  allocStrAssignReleaseSizeArg,
  allocStrAssignPlan,
  allocAbiVersion,
} from "../scripts/decomp/alloc-pure-model.mjs";

/* Executed-assertion counter: the report quotes how many checks actually
   ran, not just how many test blocks passed. */
let ASSERTIONS = 0;
const assert = new Proxy(rawAssert, {
  apply(target, thisArg, args) {
    ASSERTIONS += 1;
    return Reflect.apply(target, thisArg, args);
  },
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);
    if (typeof value === "function") {
      return (...args) => {
        ASSERTIONS += 1;
        return value.apply(target, args);
      };
    }
    return value;
  },
});

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const header = join(root, "native", "decomp", "alloc_pure_helpers.h");
const source = join(root, "native", "decomp", "alloc_pure_helpers.cpp");
const outDir = join(root, "output", "decomp", "alloc-pure");
const wasmPath = join(outDir, "alloc-pure-helpers.wasm");

function firstExisting(paths, label) {
  const found = paths.find((path) => path && existsSync(path));
  assert.ok(found, `${label} not found:\n${paths.filter(Boolean).join("\n")}`);
  return found;
}

const EXPORTS = [
  "isaac_alloc_a648b0_mode",
  "isaac_alloc_a648b0_action",
  "isaac_alloc_acct_block_va",
  "isaac_alloc_acct_is_fallback",
  "isaac_alloc_mode2_target_va",
  "isaac_alloc_mode2_selects_fallback",
  "isaac_alloc_mode2_clears_fallback",
  "isaac_alloc_mode2_fold_lo",
  "isaac_alloc_mode2_fold_hi",
  "isaac_alloc_clamp_needed",
  "isaac_alloc_clamped_lo",
  "isaac_alloc_clamped_hi",
  "isaac_alloc_malloc_arg",
  "isaac_alloc_acct_add_hi",
  "isaac_alloc_header_value",
  "isaac_alloc_result",
  "isaac_alloc_oom_observer_needed",
  "isaac_alloc_free_needed",
  "isaac_alloc_free_base",
  "isaac_alloc_acct_sub_lo",
  "isaac_alloc_acct_sub_borrow",
  "isaac_alloc_acct_sub_hi",
  "isaac_alloc_free_subtracts_alloc_carry",
  "isaac_alloc_acct_alloc_lo",
  "isaac_alloc_acct_alloc_hi",
  "isaac_alloc_roundtrip",
  "isaac_alloc_a648b0_plan",
  "isaac_alloc_a0f4c0_mode_cl",
  "isaac_alloc_a0f4c0_size_hi",
  "isaac_alloc_a0f4c0_edx",
  "isaac_alloc_a0f4e0_pushed_lo",
  "isaac_alloc_a0f500_mode_cl",
  "isaac_alloc_a0f500_stack_zero_words",
  "isaac_alloc_aef15c_size_dropped",
  "isaac_alloc_sb_is_big",
  "isaac_alloc_sb_overflow",
  "isaac_alloc_sb_raw_request",
  "isaac_alloc_sb_payload",
  "isaac_alloc_sb_stash_va",
  "isaac_alloc_sb_alloc_called",
  "isaac_alloc_sb_kind",
  "isaac_alloc_sb_plan",
  "isaac_alloc_sbr_is_big",
  "isaac_alloc_sbr_adjusted_size",
  "isaac_alloc_sbr_delta",
  "isaac_alloc_sbr_valid",
  "isaac_alloc_sbr_free_arg",
  "isaac_alloc_sbr_plan",
  "isaac_alloc_sb_roundtrip_valid",
  "isaac_alloc_xlength_msg_va",
  "isaac_alloc_c740_byte_size",
  "isaac_alloc_c740_is_big",
  "isaac_alloc_c740_adjusted_size",
  "isaac_alloc_c740_plan",
  "isaac_alloc_str_ctor_sso",
  "isaac_alloc_str_ctor_src_uses_heap",
  "isaac_alloc_str_ctor_cap",
  "isaac_alloc_str_ctor_alloc_arg",
  "isaac_alloc_str_ctor_copy_len",
  "isaac_alloc_str_ctor_plan",
  "isaac_alloc_str_tidy_release_needed",
  "isaac_alloc_str_tidy_size_arg",
  "isaac_alloc_str_tidy_plan",
  "isaac_alloc_str_assign_grow_needed",
  "isaac_alloc_str_assign_throws",
  "isaac_alloc_str_assign_round_saturated",
  "isaac_alloc_str_assign_grow_saturated",
  "isaac_alloc_str_assign_new_cap",
  "isaac_alloc_str_assign_alloc_arg",
  "isaac_alloc_str_assign_fast_uses_heap",
  "isaac_alloc_str_assign_copy_len",
  "isaac_alloc_str_assign_fast_helper_va",
  "isaac_alloc_str_assign_grow_helper_va",
  "isaac_alloc_str_assign_release_needed",
  "isaac_alloc_str_assign_release_size_arg",
  "isaac_alloc_str_assign_plan",
  "isaac_alloc_xlength_string_msg_va",
  "isaac_alloc_xlength_string_msg_va",
  "isaac_alloc_xlength_deque_msg_va",
  "isaac_alloc_pure_helpers_abi_version",
];

import { withWasmBuildCache } from "./wasm-build-cache.mjs";
/* Content-hash build cache: skips the clang+em++ spawns when the
   EXACT source bytes (mutants included) were built before. Disable
   with ISAAC_WASM_BUILD_CACHE=0. See tests/wasm-build-cache.mjs. */
function buildWasm() {
  withWasmBuildCache({
    tag: "alloc-pure-helpers",
    files: [source, header],
    extra: typeof EXPORTS !== "undefined" ? JSON.stringify(EXPORTS) : "",
    wasmPath,
    build: buildWasmUncached,
  });
}
function buildWasmUncached() {
  mkdirSync(outDir, { recursive: true });
  const emsdk = process.env.EMSDK || join(homedir(), "emsdk");
  const clang = firstExisting(
    [
      process.env.CLANGXX,
      join(emsdk, "upstream", "bin", "clang++.exe"),
      join(emsdk, "upstream", "bin", "clang++"),
    ],
    "Host clang++",
  );
  const emxx = firstExisting(
    [
      process.env.EMXX,
      join(emsdk, "upstream", "emscripten", "em++.exe"),
      join(emsdk, "upstream", "emscripten", "em++"),
    ],
    "Emscripten em++",
  );
  const syntax = spawnSync(
    clang,
    [
      source,
      "-std=c++20",
      "-I",
      join(root, "native", "decomp"),
      "-fsyntax-only",
      "-Wall",
      "-Wextra",
      "-Werror",
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr || syntax.stdout);
  const exportArgs = EXPORTS.flatMap((name) => [`-Wl,--export=${name}`]);
  const built = spawnSync(
    emxx,
    [
      source,
      "-std=c++20",
      "-O2",
      "-I",
      join(root, "native", "decomp"),
      "--no-entry",
      "-sSTANDALONE_WASM=1",
      "-sERROR_ON_UNDEFINED_SYMBOLS=1",
      ...exportArgs,
      "-o",
      wasmPath,
    ],
    { cwd: root, encoding: "utf8" },
  );
  assert.equal(built.status, 0, built.stderr || built.stdout);
}

function loadExports() {
  buildWasm();
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.equal(
    WebAssembly.Module.imports(module).length,
    0,
    "alloc pure helpers must be zero-import",
  );
  const instance = new WebAssembly.Instance(module, {});
  const wasm = instance.exports;
  const exp = (name) => {
    const fn = wasm[name] ?? wasm[`_${name}`];
    assert.equal(typeof fn, "function", `missing export ${name}`);
    return fn;
  };
  const out = { memory: wasm.memory };
  for (const name of EXPORTS) {
    out[name] = exp(name);
  }
  return out;
}

/* Wasm scratch lives at 0x100000+ (pure-helper static data + 64 KiB shadow
   stack stay below that, see the sibling family tests). */
const SCRATCH = 0x100000;

/* The shared deterministic LCG: seed = seed*1664525 + 1013904223 (mod 2^32).
   Bit k has period 2^(k+1), so ALL draws come from the HIGH bits — `% n` on
   this generator collapses a corpus onto a handful of values. */
function makeLcg(seed) {
  let s = seed >>> 0 || 0x9e3779b9;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s;
  };
}

function pick(rnd, n) {
  return Math.floor((rnd() / 0x100000000) * n);
}

function u(v) {
  return v >>> 0;
}
function s(v) {
  return v | 0;
}

/* IsaacAllocA648b0Plan: 21 x int32 -> 84 bytes */
const A648_SIZE = 84;
const A648_OFF = {
  mode: 0,
  action: 4,
  acctVa: 8,
  acctIsFallback: 12,
  clampApplied: 16,
  mallocArg: 20,
  mallocCalled: 24,
  acctAddLo: 28,
  acctAddHi: 32,
  headerValue: 36,
  headerStoreNeeded: 40,
  observerNeeded: 44,
  observerArg: 48,
  resultBias: 52,
  returnsZero: 56,
  freeCalled: 60,
  freeArg: 64,
  headerVa: 68,
  mode2FoldNeeded: 72,
  mode2TargetVa: 76,
  noEffect: 80,
};
const A648_U32 = new Set([
  "acctVa",
  "mallocArg",
  "acctAddLo",
  "acctAddHi",
  "headerValue",
  "observerArg",
  "resultBias",
  "freeArg",
  "headerVa",
  "mode2TargetVa",
]);

/* IsaacAllocRoundTrip: 8 x int32 -> 32 bytes */
const RT_SIZE = 32;
const RT_OFF = {
  addLo: 0,
  addHi: 4,
  header: 8,
  subValue: 12,
  residueLo: 16,
  residueHi: 20,
  residueNonzero: 24,
  clampApplied: 28,
};
const RT_U32 = new Set(["addLo", "addHi", "header", "subValue", "residueLo", "residueHi"]);

/* IsaacAllocSbPlan: 11 x int32 -> 44 bytes */
const SB_SIZE = 44;
const SB_OFF = {
  kind: 0,
  allocCalled: 4,
  allocArg: 8,
  throwNeeded: 12,
  nullAborts: 16,
  nullReturned: 20,
  payload: 24,
  stashVa: 28,
  stashValue: 32,
  stashNeeded: 36,
  returnsNullImmediately: 40,
};
const SB_U32 = new Set(["allocArg", "payload", "stashVa", "stashValue"]);

/* IsaacAllocSbReleasePlan: 8 x int32 -> 32 bytes */
const SBR_SIZE = 32;
const SBR_OFF = {
  isBig: 0,
  adjustedSize: 4,
  sizeArgDropped: 8,
  delta: 12,
  valid: 16,
  abortNeeded: 20,
  freeArg: 24,
  headerReadNeeded: 28,
};
const SBR_U32 = new Set(["adjustedSize", "delta", "freeArg"]);

/* IsaacAllocC740Plan: 11 x int32 -> 44 bytes (v2) */
const C740_SIZE = 44;
const C740_OFF = {
  byteSize: 0,
  isBig: 4,
  adjustedSize: 8,
  delta: 12,
  valid: 16,
  abortNeeded: 20,
  freeArg: 24,
  sizeArgDropped: 28,
  headerReadNeeded: 32,
  retBytes: 36,
  argOrderPtrFirst: 40,
};
const C740_U32 = new Set(["byteSize", "adjustedSize", "delta", "freeArg"]);

/* IsaacAllocStrCtorPlan: 9 x int32 -> 36 bytes (v3) */
const STRCTOR_SIZE = 36;
const STRCTOR_OFF = {
  sso: 0,
  srcUsesHeap: 4,
  allocNeeded: 8,
  allocArg: 12,
  cap: 16,
  capSaturated: 20,
  copyLen: 24,
  sizeOut: 28,
  retBytes: 32,
};
const STRCTOR_U32 = new Set(["allocArg", "cap", "copyLen", "sizeOut"]);

/* IsaacAllocStrTidyPlan: 14 x int32 -> 56 bytes (v3) */
const STRTIDY_SIZE = 56;
const STRTIDY_OFF = {
  releaseNeeded: 0,
  sizeArg: 4,
  isBig: 8,
  adjustedSize: 12,
  delta: 16,
  valid: 20,
  abortNeeded: 24,
  freeArg: 28,
  sizeArgDropped: 32,
  headerReadNeeded: 36,
  resetSize: 40,
  resetCap: 44,
  resetFirstByte: 48,
  resetApplies: 52,
};
const STRTIDY_U32 = new Set([
  "sizeArg",
  "adjustedSize",
  "delta",
  "freeArg",
  "resetSize",
  "resetCap",
  "resetFirstByte",
]);

/* IsaacAllocStrAssignPlan: 25 x int32 -> 100 bytes (v4) */
const STRASSIGN_SIZE = 100;
const STRASSIGN_OFF = {
  growNeeded: 0,
  throws: 4,
  allocNeeded: 8,
  allocArg: 12,
  capOut: 16,
  roundSaturated: 20,
  growSaturated: 24,
  sizeOut: 28,
  fastUsesHeap: 32,
  copyLen: 36,
  fastHelperVa: 40,
  growHelperVa: 44,
  nulOffset: 48,
  nulByte: 52,
  releaseNeeded: 56,
  releaseSizeArg: 60,
  releaseIsBig: 64,
  releaseDelta: 68,
  releaseValid: 72,
  releaseAbortNeeded: 76,
  releaseFreeArg: 80,
  bufOutIsNew: 84,
  sizeArgDropped: 88,
  retBytes: 92,
  returnsThis: 96,
};
const STRASSIGN_U32 = new Set([
  "allocArg",
  "capOut",
  "sizeOut",
  "copyLen",
  "fastHelperVa",
  "growHelperVa",
  "nulOffset",
  "releaseSizeArg",
  "releaseDelta",
  "releaseFreeArg",
]);

function readPlan(view, base, off, u32Fields) {
  const out = {};
  for (const name of Object.keys(off)) {
    out[name] = u32Fields.has(name)
      ? view.getUint32(base + off[name], true)
      : view.getInt32(base + off[name], true);
  }
  return out;
}

function assertPlan(actual, expected, off, u32Fields, label) {
  for (const name of Object.keys(off)) {
    const want = u32Fields.has(name) ? u(expected[name]) : s(expected[name]);
    assert.equal(actual[name], want, `${label}.${name}`);
  }
}

let wasm;
let view;

test("build alloc pure helpers wasm (zero imports, ABI v4)", () => {
  wasm = loadExports();
  view = new DataView(wasm.memory.buffer);
  if (wasm.memory.buffer.byteLength < SCRATCH + 0x10000) {
    wasm.memory.grow(
      Math.ceil((SCRATCH + 0x10000 - wasm.memory.buffer.byteLength) / 65536),
    );
    view = new DataView(wasm.memory.buffer);
  }
  assert.ok(
    wasm.memory.buffer.byteLength >= SCRATCH + 0x10000,
    "linear memory too small for the scratch region",
  );
  assert.equal(wasm.isaac_alloc_pure_helpers_abi_version(), ALLOC_PURE_ABI_VERSION);
  assert.equal(ALLOC_PURE_ABI_VERSION, 4);
});

test("wasm module declares no imports", () => {
  const module = new WebAssembly.Module(readFileSync(wasmPath));
  assert.deepEqual(WebAssembly.Module.imports(module), []);
});

test("constants and PE census agree with the header contract", () => {
  assert.equal(ALLOC_VA_TRACKED_WRAPPER, 0x00a648b0);
  assert.equal(ALLOC_VA_THIN_ALLOC_STACK, 0x00a0f4c0);
  assert.equal(ALLOC_VA_THIN_ALLOC_ECX, 0x00a0f4e0);
  assert.equal(ALLOC_VA_FREE_WRAPPER, 0x00a0f500);
  assert.equal(ALLOC_VA_SIZED_DELETE_SHIM, 0x00aef15c);
  assert.equal(ALLOC_VA_SB_ALLOC, 0x0040cf00);
  assert.equal(ALLOC_VA_SB_THROW_HELPER, 0x0040cee0);
  assert.equal(ALLOC_VA_XLENGTH_THROW, 0x004170d0);
  assert.equal(ALLOC_VA_OOM_OBSERVER, 0x00a23200);
  assert.equal(ALLOC_IAT_MALLOC, 0x00b187e0);
  assert.equal(ALLOC_IAT_FREE, 0x00b187dc);
  assert.equal(ALLOC_IAT_INVALID_PARAMETER, 0x00b18894);
  assert.equal(ALLOC_IAT_XLENGTH_ERROR, 0x00b184d4);
  assert.equal(ALLOC_TRACKED_ROOT_VA, 0x00c7de78);
  assert.equal(ALLOC_TRACKED_ACCT_OFF_LO, 0x30);
  assert.equal(ALLOC_TRACKED_ACCT_OFF_HI, 0x34);
  assert.equal(ALLOC_FALLBACK_ACCT_LO_VA, 0x00c7f618);
  assert.equal(ALLOC_FALLBACK_ACCT_HI_VA, 0x00c7f61c);
  assert.equal(ALLOC_OBSERVER_LIST_VA, 0x00c37974);
  assert.equal(ALLOC_OOM_OBSERVER_ARG, 0x7fcb9dd6);
  assert.equal(ALLOC_FREE_STACK_ZERO_WORDS, 2);
  assert.equal(ALLOC_HEADER_SIZE, 4);
  assert.equal(ALLOC_SB_BIG_MIN, 0x1000);
  assert.equal(ALLOC_SB_PAD, 0x23);
  assert.equal(ALLOC_SB_ALIGN_MASK, 0xffffffe0);
  assert.equal(ALLOC_SB_STASH_BACK_OFF, 4);
  assert.equal(ALLOC_SB_OVERFLOW_MIN, 0xffffffdd);
  assert.equal(ALLOC_SB_DELTA_MAX, 0x1f);
  assert.equal(ALLOC_XLENGTH_MSG_VA, 0x00b1b160);
  assert.equal(ALLOC_XLENGTH_STRING_VA, 0x0040ccc0);
  assert.equal(ALLOC_XLENGTH_STRING_MSG_VA, 0x00b1a714);
  assert.equal(ALLOC_XLENGTH_DEQUE_VA, 0x0040cad0);
  assert.equal(ALLOC_XLENGTH_DEQUE_MSG_VA, 0x00b1a6c8);
  assert.equal(ALLOC_SB_RELEASE_X4_VA, 0x0040c740);
  assert.equal(ALLOC_SB_RELEASE_X4_ELEMENT_BYTES, 4);
  assert.equal(ALLOC_SB_RELEASE_X4_RET_BYTES, 8);
  assert.equal(ALLOC_CALLERS_SB_RELEASE_X4, 57);
  assert.equal(ALLOC_CALLERS_XLENGTH_STRING, 82);
  assert.equal(ALLOC_CALLERS_XLENGTH_DEQUE, 12);
  assert.equal(ALLOC_CALLERS_A648B0, 459);
  assert.equal(ALLOC_CALLERS_A0F4C0, 739);
  assert.equal(ALLOC_CALLERS_A0F4E0, 214);
  assert.equal(ALLOC_CALLERS_A0F500, 1);
  assert.equal(ALLOC_CALLERS_SB_ALLOC, 614);
  assert.equal(ALLOC_CALLERS_XLENGTH, 86);
  assert.equal(ALLOC_CALLERS_OOM_OBSERVER, 45);
  assert.equal(ALLOC_CALLERS_SB_THROW, 202);
  assert.equal(ALLOC_SB_RELEASE_TEMPLATE_SITES, 2617);
  assert.equal(ALLOC_DIDOD_CALLSITE_VA, 0x00a6e7b0);
  assert.equal(ALLOC_DIDOD_STRIDE, 0x14);
  assert.equal(ALLOC_DIDOD_SATURATED_LO, 0xffffffff);
  assert.equal(ALLOC_DIDOD_MALLOC_ARG, 3);
  // v3: string-surface identities, censuses and law constants
  assert.equal(ALLOC_VA_STRING_CTOR, 0x0040cf50);
  assert.equal(ALLOC_VA_STRING_TIDY, 0x0040d040);
  assert.equal(ALLOC_VA_UNSCALED_RELEASE, 0x0040d000);
  assert.equal(ALLOC_VA_SB_THROW_CTOR, 0x0040cde0);
  assert.equal(ALLOC_CALLERS_STRING_CTOR, 370);
  assert.equal(ALLOC_CALLERS_STRING_TIDY, 1288);
  assert.equal(ALLOC_CALLERS_UNSCALED_RELEASE, 2);
  assert.equal(ALLOC_UNSCALED_RELEASE_CALLER_1, 0x0041416b);
  assert.equal(ALLOC_UNSCALED_RELEASE_CALLER_2, 0x0068753c);
  assert.equal(ALLOC_SB_THROW_VTABLE_VA, 0x00b1a740);
  assert.equal(ALLOC_BAD_ALLOC_EXCEPTION_VTABLE_VA, 0x00b1a724);
  assert.equal(ALLOC_STR_SSO_CAP, 0x10);
  assert.equal(ALLOC_STR_SSO_CAP_VALUE, 0xf);
  assert.equal(ALLOC_STR_SSO_COPY_LEN, 16);
  assert.equal(ALLOC_STR_CTOR_SAT, 0x7fffffff);
  assert.equal(ALLOC_TIDY_RESET_SIZE, 0);
  assert.equal(ALLOC_TIDY_RESET_CAP, 0xf);
  assert.equal(ALLOC_TIDY_RESET_FIRST_BYTE, 0);
  // enum coherence: the three real modes equal their action numbers
  assert.equal(ALLOC_MODE_ALLOC, ALLOC_ACTION_ALLOC);
  assert.equal(ALLOC_MODE_FREE, ALLOC_ACTION_FREE);
  assert.equal(ALLOC_MODE_ACCOUNT, ALLOC_ACTION_ACCOUNT);
  assert.equal(ALLOC_ACTION_NONE, 3);
});

test("header records the PE evidence for the wrapper family", () => {
  const h = readFileSync(header, "utf8");
  assert.match(h, /0x00a648b0/);
  assert.match(h, /0x00a0f4c0/);
  assert.match(h, /0x00a0f4e0/);
  assert.match(h, /0x00a0f500/);
  assert.match(h, /0x00aef15c/);
  assert.match(h, /0x0040cf00/);
  assert.match(h, /0x0040cee0/);
  assert.match(h, /0x004170d0/);
  assert.match(h, /0x00a23200/);
  assert.match(h, /movzx eax, cl/);
  assert.match(h, /movlpd/);
  assert.match(h, /sbb \[esi\+4\], 0/);
  assert.match(h, /0x7fcb9dd6/);
  assert.match(h, /0x00b1b160/);
  assert.match(h, /0x0040c740/);
  assert.match(h, /0x0040ccc0/);
  assert.match(h, /0x00b1a714/);
  assert.match(h, /0x0040cad0/);
  assert.match(h, /0x00b1a6c8/);
  assert.match(h, /0x00bd5bcc/);
  assert.match(h, /0x00b1a740/);
  assert.match(h, /0x0040cf50/);
  assert.match(h, /0x0040d040/);
  assert.match(h, /0x0040d000/);
  assert.match(h, /0x00b1a724/);
  assert.match(h, /0x7fffffff/);
  assert.match(h, /movups/);
  assert.match(h, /370/);
  assert.match(h, /1288/);
  assert.match(h, /0x00af1310/);
  assert.match(h, /0x00bf93b4/);
  assert.match(h, /D-ALLOC-1/);
  assert.match(h, /never corrected/i);
  assert.match(h, /0xffffffdd/);
  assert.match(h, /0x1f/);
  assert.match(h, /2617/);
  assert.match(
    h,
    new RegExp(`ISAAC_ALLOC_PURE_HELPERS_ABI_VERSION = ${ALLOC_PURE_ABI_VERSION}\\b`),
  );
  const s = readFileSync(source, "utf8");
  assert.match(s, /movzx eax, cl/);
  assert.match(s, /adc/);
  assert.match(s, /sbb/);
  assert.match(s, /D-ALLOC-1/);
  assert.match(s, /REPRODUCED, never corrected/i);
  assert.match(s, /uint8_t/); // the toolchain-defect guard text is present
  assert.match(s, /no export\s+takes a uint8_t\/uint16_t scalar parameter/i);
  const m = readFileSync(join(root, "scripts", "decomp", "alloc-pure-model.mjs"), "utf8");
  // the oracle is written as its own PE reading, not a C++ transliteration:
  // it must carry the same defect pin and the same address-stable identities
  assert.match(m, /D-ALLOC-1/);
  assert.match(m, /movzx eax, cl/);
  assert.match(m, /sbb \[esi\+4\], 0/);
  assert.match(m, /NOT transliterated/);
});

test("AA: mode dispatch reads the LOW BYTE only (wide drives)", () => {
  // The mode register is a BYTE test (`movzx eax, cl`). Real callers leave
  // `this` in the upper 24 bits of ECX, so the export must narrow a WIDE
  // argument in the body. These are the 0x100/0x1ff/0xffffffff drives: a
  // full-word mutant answers NONE for all of them.
  const cases = [
    [0x00000000, 0, ALLOC_ACTION_ALLOC],
    [0x00000001, 1, ALLOC_ACTION_FREE],
    [0x00000002, 2, ALLOC_ACTION_ACCOUNT],
    [0x00000003, 3, ALLOC_ACTION_NONE],
    [0x000000ff, 0xff, ALLOC_ACTION_NONE],
    [0x00000100, 0, ALLOC_ACTION_ALLOC],
    [0x00000101, 1, ALLOC_ACTION_FREE],
    [0x00000102, 2, ALLOC_ACTION_ACCOUNT],
    [0x000001ff, 0xff, ALLOC_ACTION_NONE],
    [0x7fff0000, 0, ALLOC_ACTION_ALLOC],
    [0x80000001, 1, ALLOC_ACTION_FREE],
    [0xffffff02, 2, ALLOC_ACTION_ACCOUNT],
    [0xffffffff, 0xff, ALLOC_ACTION_NONE],
  ];
  for (const [ecx, mode, action] of cases) {
    assert.equal(wasm.isaac_alloc_a648b0_mode(ecx), mode, `mode(${ecx})`);
    assert.equal(allocA648b0Mode(ecx), mode, `model mode(${ecx})`);
    assert.equal(wasm.isaac_alloc_a648b0_action(ecx), action, `action(${ecx})`);
    assert.equal(allocA648b0Action(ecx), action, `model action(${ecx})`);
  }
  // the discriminating pair: 0x100 is mode byte 0 (ALLOC), 0xff is 0xff (NONE)
  assert.notEqual(wasm.isaac_alloc_a648b0_action(0x100), wasm.isaac_alloc_a648b0_action(0xff));
});

test("AB: accounting block select and the mode-2 fold asymmetry", () => {
  assert.equal(wasm.isaac_alloc_acct_block_va(0), ALLOC_FALLBACK_ACCT_LO_VA);
  assert.equal(wasm.isaac_alloc_acct_block_va(0x1234), 0x1264);
  assert.equal(wasm.isaac_alloc_acct_block_va(0xffffffff), 0x2f);
  assert.equal(wasm.isaac_alloc_acct_is_fallback(0), 1);
  assert.equal(wasm.isaac_alloc_acct_is_fallback(1), 0);
  // mode-2 fold target ignores the fallback select: tracked == 0 -> VA 0x30
  assert.equal(wasm.isaac_alloc_mode2_target_va(0), 0x30);
  assert.equal(wasm.isaac_alloc_mode2_target_va(0x1234), 0x1264);
  assert.equal(wasm.isaac_alloc_mode2_selects_fallback(), 0);
  assert.equal(wasm.isaac_alloc_mode2_clears_fallback(), 0);
  assert.equal(allocMode2SelectsFallback(), 0);
  assert.equal(allocMode2ClearsFallback(), 0);
  // 64-bit fold: add / adc
  assert.equal(wasm.isaac_alloc_mode2_fold_lo(0x10, 0x20), 0x30);
  assert.equal(wasm.isaac_alloc_mode2_fold_hi(0x10, 0x20, 0x10, 0x20), 0x30);
  assert.equal(wasm.isaac_alloc_mode2_fold_hi(0x10, 0x20, 0xffffffff, 1), 0x31); // carry
  assert.equal(wasm.isaac_alloc_mode2_fold_lo(0xffffffff, 1), 0);
  assert.equal(allocMode2FoldLo(0xffffffff, 1), 0);
  assert.equal(allocMode2FoldHi(0x10, 0x20, 0xffffffff, 1), 0x31);
});

test("AC: alloc arm — clamp is hi-dword-only, +4 wraps (DIDOD)", () => {
  // `test ebx,ebx ; jne clamp`: ONLY size_hi != 0 clamps. The lo-side
  // `cmp edi,-1 ; jbe` is a DEAD branch, so lo == 0xffffffff does NOT clamp.
  assert.equal(wasm.isaac_alloc_clamp_needed(0xffffffff, 0), 0);
  assert.equal(wasm.isaac_alloc_clamp_needed(0, 1), 1);
  assert.equal(wasm.isaac_alloc_clamp_needed(0xffffffff, 1), 1);
  assert.equal(wasm.isaac_alloc_clamp_needed(0x80000000, 0), 0);
  assert.equal(u(wasm.isaac_alloc_clamped_lo(0xffffffff, 0)), 0xffffffff);
  assert.equal(wasm.isaac_alloc_clamped_lo(0x12345678, 1), 0);
  assert.equal(wasm.isaac_alloc_clamped_hi(0xffffffff, 0xffffffff), 0);
  // add edi,4 ; push edi — 32-bit WRAP
  assert.equal(wasm.isaac_alloc_malloc_arg(0xffffffff, 0), 3); // DIDOD
  assert.equal(wasm.isaac_alloc_malloc_arg(0xfffffffc, 0), 0);
  assert.equal(wasm.isaac_alloc_malloc_arg(0, 1), 4); // clamp -> 0 + 4
  assert.equal(wasm.isaac_alloc_malloc_arg(0x100, 0), 0x104);
  assert.equal(wasm.isaac_alloc_malloc_arg(0xffffffff, 1), 4);
  // acct_add_hi == carry(clamped_lo + 4)
  assert.equal(wasm.isaac_alloc_acct_add_hi(0xffffffff, 0), 1);
  assert.equal(wasm.isaac_alloc_acct_add_hi(0xfffffffc, 0), 1);
  assert.equal(wasm.isaac_alloc_acct_add_hi(0xfffffffb, 0), 0);
  assert.equal(wasm.isaac_alloc_acct_add_hi(0xffffffff, 1), 0); // clamped
  // header == malloc arg (the +4 lives INSIDE the header)
  assert.equal(wasm.isaac_alloc_header_value(0xffffffff, 0), 3);
  assert.equal(wasm.isaac_alloc_header_value(0x20, 0), 0x24);
  // payload bias +4, wrap
  assert.equal(wasm.isaac_alloc_result(0x1000), 0x1004);
  assert.equal(wasm.isaac_alloc_result(0xfffffffc), 0);
  // oracle agrees everywhere above
  assert.equal(allocMallocArg(0xffffffff, 0), 3);
  assert.equal(allocMallocArg(0xfffffffc, 0), 0);
  assert.equal(allocMallocArg(0, 1), 4);
  assert.equal(allocAcctAddHi(0xffffffff, 0), 1);
  assert.equal(allocAcctAddHi(0xfffffffb, 0), 0);
  assert.equal(allocHeaderValue(0x20, 0), 0x24);
  assert.equal(allocResult(0xfffffffc), 0);
});

test("AD: free arm — null gate, ptr-4, SUBTRACT with borrow only", () => {
  assert.equal(wasm.isaac_alloc_free_needed(0), 0);
  assert.equal(wasm.isaac_alloc_free_needed(1), 1);
  assert.equal(wasm.isaac_alloc_free_base(0x1000), 0xffc);
  assert.equal(u(wasm.isaac_alloc_free_base(0)), 0xfffffffc);
  // `sub [esi], eax` — a SUBTRACT, never an add (mutant M4)
  assert.equal(wasm.isaac_alloc_acct_sub_lo(0x10, 4), 0xc);
  assert.notEqual(wasm.isaac_alloc_acct_sub_lo(0x10, 4), 0x14);
  assert.equal(u(wasm.isaac_alloc_acct_sub_lo(0, 1)), 0xffffffff);
  // borrow: unsigned below
  assert.equal(wasm.isaac_alloc_acct_sub_borrow(0, 10), 1);
  assert.equal(wasm.isaac_alloc_acct_sub_borrow(10, 10), 0);
  assert.equal(wasm.isaac_alloc_acct_sub_borrow(11, 10), 0);
  assert.equal(wasm.isaac_alloc_acct_sub_borrow(0xffffffff, 0), 0);
  // `sbb [esi+4], 0` — borrow propagation only (mutant M2: drop the borrow)
  assert.equal(u(wasm.isaac_alloc_acct_sub_hi(0, 0, 10)), 0xffffffff);
  assert.equal(wasm.isaac_alloc_acct_sub_hi(0x20, 0x10, 4), 0x20); // no borrow
  assert.equal(u(wasm.isaac_alloc_acct_sub_hi(0x20, 0x10, 0x20)), 0x1f); // borrow
  // alloc side: TRUE 64-bit add
  assert.equal(wasm.isaac_alloc_acct_alloc_lo(0x10, 3), 0x13);
  assert.equal(wasm.isaac_alloc_acct_alloc_hi(0x20, 0x10, 3, 1), 0x21);
  assert.equal(wasm.isaac_alloc_acct_alloc_hi(0x20, 0xffffffff, 1, 1), 0x22); // carry
  assert.equal(allocAcctSubLo(0x10, 4), 0xc);
  assert.equal(allocAcctSubBorrow(0, 10), 1);
  assert.equal(allocAcctSubHi(0, 0, 10), 0xffffffff);
  assert.equal(allocAcctSubHi(0x20, 0x10, 0x20), 0x1f);
  assert.equal(allocAcctAllocHi(0x20, 0xffffffff, 1, 1), 0x22);
});

test("D-ALLOC-1: free never subtracts the alloc carry — REPRODUCED, pinned", () => {
  /* Original-binary defect, pinned per the standing decision: the alloc
     side accounts (clamped_lo + 4) as a 64-bit add; the free side subtracts
     the 32-bit header with borrow propagation ONLY (`sbb [esi+4], 0`). The
     borrow of the free-side lo sub cancels the alloc-side lo carry exactly,
     so the pair nets to +add_hi — a permanent 0x1'00000000 residue per
     carried alloc, whatever the counters started at. This is the shipped
     behaviour; it is reproduced here, never corrected. */
  assert.equal(wasm.isaac_alloc_free_subtracts_alloc_carry(), 0);
  assert.equal(allocFreeSubtractsAllocCarry(), 0);
  const rt = wasm.isaac_alloc_roundtrip;
  const base = SCRATCH + 0x100;
  // DIDOD case: (0xffffffff, 0) -> malloc(3), header 3, residue (0, 1)
  rt(0xffffffff, 0, base);
  assertPlan(readPlan(view, base, RT_OFF, RT_U32), {
    addLo: 3,
    addHi: 1,
    header: 3,
    subValue: 3,
    residueLo: 0,
    residueHi: 1,
    residueNonzero: 1,
    clampApplied: 0,
  }, RT_OFF, RT_U32, "roundtrip(0xffffffff,0)");
  // (0xfffffffc, 0) -> malloc(0), still a carried add
  rt(0xfffffffc, 0, base);
  assertPlan(readPlan(view, base, RT_OFF, RT_U32), {
    addLo: 0,
    addHi: 1,
    header: 0,
    subValue: 0,
    residueLo: 0,
    residueHi: 1,
    residueNonzero: 1,
    clampApplied: 0,
  }, RT_OFF, RT_U32, "roundtrip(0xfffffffc,0)");
  // non-carried: no residue
  rt(0x40, 0, base);
  assertPlan(readPlan(view, base, RT_OFF, RT_U32), {
    addLo: 0x44,
    addHi: 0,
    header: 0x44,
    subValue: 0x44,
    residueLo: 0,
    residueHi: 0,
    residueNonzero: 0,
    clampApplied: 0,
  }, RT_OFF, RT_U32, "roundtrip(0x40,0)");
  // clamped alloc: add_hi is 0 after the clamp, no residue
  rt(0xffffffff, 1, base);
  assertPlan(readPlan(view, base, RT_OFF, RT_U32), {
    addLo: 4,
    addHi: 0,
    header: 4,
    subValue: 4,
    residueLo: 0,
    residueHi: 0,
    residueNonzero: 0,
    clampApplied: 1,
  }, RT_OFF, RT_U32, "roundtrip(0xffffffff,1)");
  // oracle agrees on the same pins
  assert.deepEqual(
    {
      addLo: allocRoundtrip(0xffffffff, 0).addLo,
      addHi: allocRoundtrip(0xffffffff, 0).addHi,
      residueHi: allocRoundtrip(0xffffffff, 0).residueHi,
    },
    { addLo: 3, addHi: 1, residueHi: 1 },
  );
  assert.deepEqual(
    {
      addLo: allocRoundtrip(0x40, 0).addLo,
      residueHi: allocRoundtrip(0x40, 0).residueHi,
    },
    { addLo: 0x44, residueHi: 0 },
  );
  // residue independence of the starting counter: run the full chain through
  // the native scalars from several starting pairs and confirm the pair nets
  // to exactly (start + add_hi, 0) — never (start, 0).
  for (const [lo, hi] of [[0, 0], [0x10, 0x20], [0xffffffff, 0xffffffff], [0x12345678, 0x9abcdef0]]) {
    for (const [slo, shi] of [[0xffffffff, 0], [0xfffffffc, 0], [0x40, 0]]) {
      const arg = u(wasm.isaac_alloc_malloc_arg(slo, shi));
      const addHi = u(wasm.isaac_alloc_acct_add_hi(slo, shi));
      const lo1 = u(wasm.isaac_alloc_acct_alloc_lo(lo, arg));
      const hi1 = u(wasm.isaac_alloc_acct_alloc_hi(hi, lo, arg, addHi));
      const lo2 = u(wasm.isaac_alloc_acct_sub_lo(lo1, arg));
      const hi2 = u(wasm.isaac_alloc_acct_sub_hi(hi1, lo1, arg));
      assert.equal(lo2, u(lo), `residue lo must cancel for start (${lo},${hi}) size (${slo},${shi})`);
      assert.equal(hi2, u(hi + addHi), `residue hi == add_hi (D-ALLOC-1)`);
      assert.equal(hi2 !== u(hi), addHi !== 0, `residue is the alloc carry`);
    }
  }
});

test("AE: a648b0 plan — full resolution, wide ecx, OOM arm", () => {
  const plan = wasm.isaac_alloc_a648b0_plan;
  const base = SCRATCH + 0x200;
  // alloc success
  plan(0, 0, 0x40, 0, 0x1234, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 0, action: ALLOC_ACTION_ALLOC, acctVa: 0x1264, acctIsFallback: 0,
    clampApplied: 0, mallocArg: 0x44, mallocCalled: 1, acctAddLo: 0x44,
    acctAddHi: 0, headerValue: 0x44, headerStoreNeeded: 1, observerNeeded: 0,
    observerArg: 0, resultBias: 4, returnsZero: 0, freeCalled: 0, freeArg: 0,
    headerVa: 0, mode2FoldNeeded: 0, mode2TargetVa: 0, noEffect: 0,
  }, A648_OFF, A648_U32, "alloc success");
  // DIDOD: carried alloc
  plan(0, 0, 0xffffffff, 0, 0, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 0, action: ALLOC_ACTION_ALLOC, acctVa: ALLOC_FALLBACK_ACCT_LO_VA,
    acctIsFallback: 1, clampApplied: 0, mallocArg: 3, mallocCalled: 1,
    acctAddLo: 3, acctAddHi: 1, headerValue: 3, headerStoreNeeded: 1,
    observerNeeded: 0, observerArg: 0, resultBias: 4, returnsZero: 0,
    freeCalled: 0, freeArg: 0, headerVa: 0, mode2FoldNeeded: 0,
    mode2TargetVa: 0, noEffect: 0,
  }, A648_OFF, A648_U32, "DIDOD alloc");
  // OOM: malloc NULL -> observer broadcast, NO header store (M7)
  plan(0, 0, 0x40, 0, 0x1234, 1, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 0, action: ALLOC_ACTION_ALLOC, acctVa: 0x1264, acctIsFallback: 0,
    clampApplied: 0, mallocArg: 0x44, mallocCalled: 1, acctAddLo: 0,
    acctAddHi: 0, headerValue: 0, headerStoreNeeded: 0, observerNeeded: 1,
    observerArg: ALLOC_OOM_OBSERVER_ARG, resultBias: 0, returnsZero: 1,
    freeCalled: 0, freeArg: 0, headerVa: 0, mode2FoldNeeded: 0,
    mode2TargetVa: 0, noEffect: 0,
  }, A648_OFF, A648_U32, "OOM alloc");
  // wide ecx: 0x100 is mode byte 0 -> ALLOC (full-word mutant -> NONE)
  plan(0x100, 0, 0x40, 0, 0, 0, base);
  assert.equal(readPlan(view, base, A648_OFF, A648_U32).action, ALLOC_ACTION_ALLOC);
  // 0x101 -> mode byte 1 -> FREE
  plan(0x101, 0x1000, 0, 0, 0, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 1, action: ALLOC_ACTION_FREE, acctVa: ALLOC_FALLBACK_ACCT_LO_VA,
    acctIsFallback: 1, clampApplied: 0, mallocArg: 0, mallocCalled: 0,
    acctAddLo: 0, acctAddHi: 0, headerValue: 0, headerStoreNeeded: 0,
    observerNeeded: 0, observerArg: 0, resultBias: 0, returnsZero: 1,
    freeCalled: 1, freeArg: 0xffc, headerVa: 0xffc, mode2FoldNeeded: 0,
    mode2TargetVa: 0, noEffect: 0,
  }, A648_OFF, A648_U32, "free with pointer");
  // free null gate: nothing at all happens
  plan(1, 0, 0, 0, 0, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 1, action: ALLOC_ACTION_FREE, acctVa: ALLOC_FALLBACK_ACCT_LO_VA,
    acctIsFallback: 1, clampApplied: 0, mallocArg: 0, mallocCalled: 0,
    acctAddLo: 0, acctAddHi: 0, headerValue: 0, headerStoreNeeded: 0,
    observerNeeded: 0, observerArg: 0, resultBias: 0, returnsZero: 1,
    freeCalled: 0, freeArg: 0, headerVa: 0, mode2FoldNeeded: 0,
    mode2TargetVa: 0, noEffect: 1,
  }, A648_OFF, A648_U32, "free null gate");
  // account arm: fold target ignores the fallback select
  plan(2, 0, 0, 0, 0x1234, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 2, action: ALLOC_ACTION_ACCOUNT, acctVa: 0x1264, acctIsFallback: 0,
    clampApplied: 0, mallocArg: 0, mallocCalled: 0, acctAddLo: 0,
    acctAddHi: 0, headerValue: 0, headerStoreNeeded: 0, observerNeeded: 0,
    observerArg: 0, resultBias: 0, returnsZero: 1, freeCalled: 0, freeArg: 0,
    headerVa: 0, mode2FoldNeeded: 1, mode2TargetVa: 0x1264, noEffect: 0,
  }, A648_OFF, A648_U32, "account");
  plan(2, 0, 0, 0, 0, 0, base);
  assert.equal(readPlan(view, base, A648_OFF, A648_U32).mode2TargetVa, 0x30);
  // NONE
  plan(3, 0, 0, 0, 0, 0, base);
  assertPlan(readPlan(view, base, A648_OFF, A648_U32), {
    mode: 3, action: ALLOC_ACTION_NONE, acctVa: ALLOC_FALLBACK_ACCT_LO_VA,
    acctIsFallback: 1, clampApplied: 0, mallocArg: 0, mallocCalled: 0,
    acctAddLo: 0, acctAddHi: 0, headerValue: 0, headerStoreNeeded: 0,
    observerNeeded: 0, observerArg: 0, resultBias: 0, returnsZero: 1,
    freeCalled: 0, freeArg: 0, headerVa: 0, mode2FoldNeeded: 0,
    mode2TargetVa: 0, noEffect: 1,
  }, A648_OFF, A648_U32, "none");
  // oracle agreement on the same scenarios
  for (const scenario of [
    { ecx: 0, edx: 0, sizeLo: 0x40, sizeHi: 0, tracked: 0x1234, mallocNull: 0 },
    { ecx: 0, edx: 0, sizeLo: 0xffffffff, sizeHi: 0, tracked: 0, mallocNull: 0 },
    { ecx: 0, edx: 0, sizeLo: 0x40, sizeHi: 0, tracked: 0x1234, mallocNull: 1 },
    { ecx: 0x100, edx: 0, sizeLo: 0x40, sizeHi: 0, tracked: 0, mallocNull: 0 },
    { ecx: 1, edx: 0x1000, sizeLo: 0, sizeHi: 0, tracked: 0, mallocNull: 0 },
    { ecx: 1, edx: 0, sizeLo: 0, sizeHi: 0, tracked: 0, mallocNull: 0 },
    { ecx: 2, edx: 0, sizeLo: 0, sizeHi: 0, tracked: 0x1234, mallocNull: 0 },
    { ecx: 2, edx: 0, sizeLo: 0, sizeHi: 0, tracked: 0, mallocNull: 0 },
    { ecx: 3, edx: 0, sizeLo: 0, sizeHi: 0, tracked: 0, mallocNull: 0 },
  ]) {
    plan(scenario.ecx, scenario.edx, scenario.sizeLo, scenario.sizeHi, scenario.tracked, scenario.mallocNull, base);
    const got = readPlan(view, base, A648_OFF, A648_U32);
    assertPlan(got, allocA648b0Plan(scenario), A648_OFF, A648_U32, `model plan ${JSON.stringify(scenario)}`);
  }
});

test("AF: thin wrapper call shapes", () => {
  assert.equal(wasm.isaac_alloc_a0f4c0_mode_cl(), 0);
  assert.equal(wasm.isaac_alloc_a0f4c0_size_hi(), 0);
  assert.equal(wasm.isaac_alloc_a0f4c0_edx(), 0);
  // 0x00a0f4e0 pushes the FULL ECX BEFORE `xor cl, cl` — the pushed size
  // keeps its own low byte (order pin)
  assert.equal(wasm.isaac_alloc_a0f4e0_pushed_lo(0x123456ab), 0x123456ab);
  assert.equal(wasm.isaac_alloc_a0f4e0_pushed_lo(0x100), 0x100);
  assert.equal(wasm.isaac_alloc_a0f500_mode_cl(), 1);
  assert.equal(wasm.isaac_alloc_a0f500_stack_zero_words(), 2);
  assert.equal(wasm.isaac_alloc_aef15c_size_dropped(), 1);
  assert.equal(allocA0f4e0PushedLo(0x123456ab), 0x123456ab);
  assert.equal(allocA0f500StackZeroWords(), 2);
});

test("AG: 0x0040cf00 aligned alloc — kinds, overflow, alignment", () => {
  // unsigned 0x1000 gate
  assert.equal(wasm.isaac_alloc_sb_is_big(0xfff), 0);
  assert.equal(wasm.isaac_alloc_sb_is_big(0x1000), 1);
  assert.equal(wasm.isaac_alloc_sb_is_big(0xffffffff), 1);
  // overflow: (size+0x23) wraps to <= size; first fires at 0xffffffdd
  assert.equal(wasm.isaac_alloc_sb_overflow(0xffffffdc), 0);
  assert.equal(wasm.isaac_alloc_sb_overflow(0xffffffdd), 1);
  assert.equal(wasm.isaac_alloc_sb_overflow(0xffffffff), 1);
  assert.equal(wasm.isaac_alloc_sb_overflow(0x1000), 0);
  // kinds
  assert.equal(wasm.isaac_alloc_sb_kind(0), ALLOC_SB_KIND_ZERO);
  assert.equal(wasm.isaac_alloc_sb_kind(1), ALLOC_SB_KIND_SMALL);
  assert.equal(wasm.isaac_alloc_sb_kind(0xfff), ALLOC_SB_KIND_SMALL);
  assert.equal(wasm.isaac_alloc_sb_kind(0x1000), ALLOC_SB_KIND_BIG);
  assert.equal(wasm.isaac_alloc_sb_kind(0xffffffdd), ALLOC_SB_KIND_THROW);
  // alloc_called: zero and throw paths never call 0x00a0f4c0
  assert.equal(wasm.isaac_alloc_sb_alloc_called(0), 0);
  assert.equal(wasm.isaac_alloc_sb_alloc_called(1), 1);
  assert.equal(wasm.isaac_alloc_sb_alloc_called(0xfff), 1);
  assert.equal(wasm.isaac_alloc_sb_alloc_called(0x1000), 1);
  assert.equal(wasm.isaac_alloc_sb_alloc_called(0xffffffdd), 0);
  // aligned payload: (raw + 0x23) & ~0x1f (mutant M5)
  assert.equal(wasm.isaac_alloc_sb_payload(0x1000), 0x1020);
  assert.equal(wasm.isaac_alloc_sb_payload(0x101d), 0x1040);
  assert.equal(wasm.isaac_alloc_sb_payload(0), 0x20);
  assert.equal(wasm.isaac_alloc_sb_payload(0xffffffff), 0x20); // wrap
  assert.equal(wasm.isaac_alloc_sb_payload(0x1d), 0x40);
  assert.equal(wasm.isaac_alloc_sb_stash_va(0x1020), 0x101c);
  assert.equal(u(wasm.isaac_alloc_sb_stash_va(0)), 0xfffffffc);
  assert.equal(wasm.isaac_alloc_sb_raw_request(0x1000), 0x1023);
  assert.equal(wasm.isaac_alloc_sb_raw_request(0xffffffff), 0x22);
  // oracle agreement
  assert.equal(allocSbIsBig(0xffffffff), 1);
  assert.equal(allocSbOverflow(0xffffffdd), 1);
  assert.equal(allocSbKind(0xffffffdd), ALLOC_SB_KIND_THROW);
  assert.equal(allocSbAllocCalled(0xffffffdd), 0);
  assert.equal(allocSbPayload(0x101d), 0x1040);
  assert.equal(allocSbPayload(0xffffffff), 0x20);
  assert.equal(allocSbRawRequest(0xffffffff), 0x22);
});

test("AG: sb_plan — zero/small/big/throw, null handling", () => {
  const sp = wasm.isaac_alloc_sb_plan;
  const base = SCRATCH + 0x300;
  // zero: NULL immediately, no allocator call
  sp(0, 0x1234, base);
  assertPlan(readPlan(view, base, SB_OFF, SB_U32), {
    kind: ALLOC_SB_KIND_ZERO, allocCalled: 0, allocArg: 0, throwNeeded: 0,
    nullAborts: 0, nullReturned: 0, payload: 0, stashVa: 0, stashValue: 0,
    stashNeeded: 0, returnsNullImmediately: 1,
  }, SB_OFF, SB_U32, "sb zero");
  // small: raw handed back; NULL is returned UNCHECKED
  sp(0x40, 0x1234, base);
  assertPlan(readPlan(view, base, SB_OFF, SB_U32), {
    kind: ALLOC_SB_KIND_SMALL, allocCalled: 1, allocArg: 0x40, throwNeeded: 0,
    nullAborts: 0, nullReturned: 0, payload: 0x1234, stashVa: 0, stashValue: 0,
    stashNeeded: 0, returnsNullImmediately: 0,
  }, SB_OFF, SB_U32, "sb small");
  sp(0x40, 0, base);
  assert.equal(readPlan(view, base, SB_OFF, SB_U32).nullReturned, 1);
  // big success: payload aligned, raw stashed at payload-4
  sp(0x1000, 0x1040, base);
  assertPlan(readPlan(view, base, SB_OFF, SB_U32), {
    kind: ALLOC_SB_KIND_BIG, allocCalled: 1, allocArg: 0x1023, throwNeeded: 0,
    nullAborts: 0, nullReturned: 0, payload: 0x1060, stashVa: 0x105c,
    stashValue: 0x1040, stashNeeded: 1, returnsNullImmediately: 0,
  }, SB_OFF, SB_U32, "sb big");
  // big NULL: noreturn invalid-parameter abort
  sp(0x1000, 0, base);
  assertPlan(readPlan(view, base, SB_OFF, SB_U32), {
    kind: ALLOC_SB_KIND_BIG, allocCalled: 1, allocArg: 0x1023, throwNeeded: 0,
    nullAborts: 1, nullReturned: 0, payload: 0, stashVa: 0, stashValue: 0,
    stashNeeded: 0, returnsNullImmediately: 0,
  }, SB_OFF, SB_U32, "sb big null");
  // throw: noreturn, nothing after is reachable
  sp(0xffffffdd, 0x1234, base);
  assertPlan(readPlan(view, base, SB_OFF, SB_U32), {
    kind: ALLOC_SB_KIND_THROW, allocCalled: 0, allocArg: 0, throwNeeded: 1,
    nullAborts: 0, nullReturned: 0, payload: 0, stashVa: 0, stashValue: 0,
    stashNeeded: 0, returnsNullImmediately: 0,
  }, SB_OFF, SB_U32, "sb throw");
  // oracle agreement
  for (const scenario of [
    { size: 0, raw: 0x1234 },
    { size: 0x40, raw: 0x1234 },
    { size: 0x40, raw: 0 },
    { size: 0x1000, raw: 0x1040 },
    { size: 0x1000, raw: 0 },
    { size: 0xffffffdd, raw: 0x1234 },
    { size: 0x1000, raw: 0xffffffff },
  ]) {
    sp(scenario.size, scenario.raw, base);
    assertPlan(readPlan(view, base, SB_OFF, SB_U32), allocSbPlan(scenario), SB_OFF, SB_U32, `model sb ${JSON.stringify(scenario)}`);
  }
});

test("AH: aligned-release template — <=0x1f validation and free arg", () => {
  // delta == 0x1f is VALID (`cmp delta,0x1f ; ja abort` — unsigned ABOVE;
  // mutant M6 reads `< 0x1f` and would abort here)
  assert.equal(wasm.isaac_alloc_sbr_delta(0x40, 0x1d), 0x1f);
  assert.equal(wasm.isaac_alloc_sbr_valid(0x40, 0x1d), 1);
  // delta == 0x20 is INVALID (abort)
  assert.equal(wasm.isaac_alloc_sbr_delta(0x40, 0x1c), 0x20);
  assert.equal(wasm.isaac_alloc_sbr_valid(0x40, 0x1c), 0);
  // delta == 0 (raw exactly 0x1f below the payload)
  assert.equal(wasm.isaac_alloc_sbr_valid(0x40, 0x3c), 1);
  // small sizes never validate: vacuously valid
  assert.equal(wasm.isaac_alloc_sbr_is_big(0xfff), 0);
  assert.equal(wasm.isaac_alloc_sbr_is_big(0x1000), 1);
  assert.equal(wasm.isaac_alloc_sbr_adjusted_size(0xfff), 0xfff);
  assert.equal(wasm.isaac_alloc_sbr_adjusted_size(0x1000), 0x1023);
  // free arg: big valid -> raw; big invalid -> 0 (abort, nothing freed);
  // small -> payload
  assert.equal(wasm.isaac_alloc_sbr_free_arg(0x1000, 0x40, 0x1d), 0x1d);
  assert.equal(wasm.isaac_alloc_sbr_free_arg(0x1000, 0x40, 0x1c), 0);
  assert.equal(wasm.isaac_alloc_sbr_free_arg(0x40, 0x1234, 0), 0x1234);
  // wrap: raw above the payload wraps the delta high -> invalid
  assert.equal(wasm.isaac_alloc_sbr_delta(0x20, 0xffffffff), 0x1d);
  assert.equal(wasm.isaac_alloc_sbr_valid(0x20, 0xffffffff), 1);
  // oracle agreement
  assert.equal(allocSbrDelta(0x40, 0x1d), 0x1f);
  assert.equal(allocSbrValid(0x40, 0x1d), 1);
  assert.equal(allocSbrValid(0x40, 0x1c), 0);
  assert.equal(allocSbrFreeArg(0x1000, 0x40, 0x1d), 0x1d);
  assert.equal(allocSbrFreeArg(0x1000, 0x40, 0x1c), 0);
  assert.equal(allocSbrAdjustedSize(0x1000), 0x1023);
});

test("AH: sbr_plan — full template resolution", () => {
  const spr = wasm.isaac_alloc_sbr_plan;
  const base = SCRATCH + 0x400;
  spr(0x1000, 0x40, 0x1d, base);
  assertPlan(readPlan(view, base, SBR_OFF, SBR_U32), {
    isBig: 1, adjustedSize: 0x1023, sizeArgDropped: 1, delta: 0x1f,
    valid: 1, abortNeeded: 0, freeArg: 0x1d, headerReadNeeded: 1,
  }, SBR_OFF, SBR_U32, "sbr big valid");
  spr(0x1000, 0x40, 0x1c, base);
  assertPlan(readPlan(view, base, SBR_OFF, SBR_U32), {
    isBig: 1, adjustedSize: 0x1023, sizeArgDropped: 1, delta: 0x20,
    valid: 0, abortNeeded: 1, freeArg: 0, headerReadNeeded: 1,
  }, SBR_OFF, SBR_U32, "sbr big invalid");
  spr(0x40, 0x1234, 0, base);
  assertPlan(readPlan(view, base, SBR_OFF, SBR_U32), {
    isBig: 0, adjustedSize: 0x40, sizeArgDropped: 1, delta: 0,
    valid: 1, abortNeeded: 0, freeArg: 0x1234, headerReadNeeded: 0,
  }, SBR_OFF, SBR_U32, "sbr small");
  for (const scenario of [
    { size: 0x1000, payload: 0x40, raw: 0x1d },
    { size: 0x1000, payload: 0x40, raw: 0x1c },
    { size: 0x40, payload: 0x1234, raw: 0 },
    { size: 0x1001, payload: 0x20, raw: 0xffffffff },
  ]) {
    spr(scenario.size, scenario.payload, scenario.raw, base);
    assertPlan(readPlan(view, base, SBR_OFF, SBR_U32), allocSbrPlan(scenario), SBR_OFF, SBR_U32, `model sbr ${JSON.stringify(scenario)}`);
  }
});

test("AH: 0x0040cf00 -> release round trip is valid for EVERY raw", () => {
  // PE-truth law: delta = 0x1f - ((raw + 3) mod 32) is always in [0, 0x1f],
  // so the payload the allocator builds always passes the release check.
  assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(0), 1);
  assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(0x1d), 1);
  assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(0x1c), 1);
  assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(0xffffffff), 1);
  assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(0xffffffdd), 1);
  const rnd = makeLcg(0x51b0);
  for (let i = 0; i < 300; ++i) {
    const raw = rnd();
    assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(raw), 1, `raw ${u(raw).toString(16)}`);
    assert.equal(allocSbRoundtripValid(raw), 1, `model raw ${u(raw).toString(16)}`);
  }
  // every residue class mod 32 is covered by construction above (0..0x1f
  // edge list plus the draw), so the law is not sampling luck
  const residues = new Set();
  for (let raw = 0; raw < 0x40; ++raw) {
    residues.add(((raw + 3) & 31));
    assert.equal(wasm.isaac_alloc_sb_roundtrip_valid(raw), 1, `raw ${raw}`);
  }
  assert.equal(residues.size, 32);
});

test("AI: throw metadata stays address-stable", () => {
  assert.equal(wasm.isaac_alloc_xlength_msg_va(), ALLOC_XLENGTH_MSG_VA);
  assert.equal(wasm.isaac_alloc_xlength_msg_va(), 0x00b1b160);
  assert.equal(allocXlengthMsgVa(), 0x00b1b160);
});

test("AI v2: xlength-class sibling throws pin their msg VAs (host bodies)", () => {
  // 0x0040ccc0 `push 0xb1a714; call [0xb184d4]; int3` — "string too long",
  // 82 raw rel32 e8 callsites (bytescan, this unit).
  assert.equal(wasm.isaac_alloc_xlength_string_msg_va(), 0x00b1a714);
  assert.equal(allocXlengthStringMsgVa(), 0x00b1a714);
  assert.equal(wasm.isaac_alloc_xlength_deque_msg_va(), 0x00b1a6c8);
  // 0x0040cad0 — "deque<T> too long", 12 callsites (anm2 hash grow via
  // 0x40ca65 among them).
  assert.equal(allocXlengthDequeMsgVa(), 0x00b1a6c8);
  // The three msg VAs are DISTINCT — no collapsed throw metadata.
  const msgs = [
    wasm.isaac_alloc_xlength_msg_va(),
    wasm.isaac_alloc_xlength_string_msg_va(),
    wasm.isaac_alloc_xlength_deque_msg_va(),
  ];
  assert.equal(new Set(msgs).size, 3);
});

test("AJ: 0x0040c740 u32 deallocate — count*4 scaling, gates, edges", () => {
  const bs = wasm.isaac_alloc_c740_byte_size;
  const big = wasm.isaac_alloc_c740_is_big;
  const adj = wasm.isaac_alloc_c740_adjusted_size;

  // lea ecx,[eax*4] — the NEW law: element count scaled by 4 inside the
  // wrapper (callers push count = (end-begin)>>2; room B20 0x80687f).
  assert.equal(u(bs(0)), 0);
  assert.equal(u(bs(1)), 4);
  assert.equal(u(bs(0x18)), 0x60);
  assert.equal(u(bs(0x3ff)), 0xffc);
  assert.equal(u(bs(0x400)), 0x1000); // the wrapper's own big gate edge
  assert.equal(u(bs(0xffffffff)), 0xfffffffc); // *4 32-bit wrap
  assert.equal(u(bs(0x40000000)), 0); // wrap to 0: UNSIGNED small below

  // cmp ecx,0x1000 ; jb — UNSIGNED over byte_size: big iff count >= 0x400.
  assert.equal(big(0x3ff), 0);
  assert.equal(big(0x400), 1);
  assert.equal(big(0x40000000), 0); // byte_size wraps to 0 — SMALL (mu)
  assert.equal(big(0xffffffff), 1); // byte_size 0xfffffffc — BIG (mu)
  assert.equal(big(0x80000000), 0); // byte_size 0 — SMALL

  // big: +0x23; small: untouched.
  assert.equal(u(adj(0)), 0);
  assert.equal(u(adj(0x3ff)), 0xffc);
  assert.equal(u(adj(0x400)), 0x1023);
  assert.equal(u(adj(0x40000000)), 0); // small path: wrap stays 0
  assert.equal(u(adj(0xffffffff)), 0x1f); // 0xfffffffc + 0x23 wraps to 0x1f

  // constant pins
  assert.equal(ALLOC_SB_RELEASE_X4_RET_BYTES, 8);
  assert.equal(ALLOC_CALLERS_SB_RELEASE_X4, 57);
});

test("AJ: c740_plan — full resolution, delta 0x1f/0x20 edges, small/big", () => {
  const c740 = wasm.isaac_alloc_c740_plan;
  const base = SCRATCH + 0x900;
  const plan = (count, payload, raw) => {
    c740(count, payload, raw, base);
    return readPlan(view, base, C740_OFF, C740_U32);
  };

  // small (count < 0x400): no header read, no validation, payload freed.
  let p = plan(0x10, 0x2000, 0x1ff0);
  assert.equal(u(p.byteSize), 0x40);
  assert.equal(s(p.isBig), 0);
  assert.equal(u(p.adjustedSize), 0x40);
  assert.equal(u(p.delta), 0);
  assert.equal(s(p.valid), 1);
  assert.equal(s(p.abortNeeded), 0);
  assert.equal(u(p.freeArg), 0x2000); // the payload itself
  assert.equal(s(p.headerReadNeeded), 0);
  assert.equal(s(p.sizeArgDropped), 1);
  assert.equal(s(p.retBytes), 8);
  assert.equal(s(p.argOrderPtrFirst), 1);

  // big valid: raw = [payload-4]; delta = payload - raw - 4.
  p = plan(0x400, 0x2040, 0x2010);
  assert.equal(u(p.byteSize), 0x1000);
  assert.equal(s(p.isBig), 1);
  assert.equal(u(p.adjustedSize), 0x1023);
  assert.equal(u(p.delta), 0x2c); // 0x2040 - 0x2010 - 4
  assert.equal(s(p.valid), 0); // 0x2c > 0x1f -> ABORT
  assert.equal(s(p.abortNeeded), 1);
  assert.equal(u(p.freeArg), 0); // nothing is freed on the abort path
  assert.equal(s(p.headerReadNeeded), 1);

  // delta exactly 0x1f is VALID (`cmp eax,0x1f ; ja` — unsigned above).
  p = plan(0x400, 0x2040, 0x201d);
  assert.equal(u(p.delta), 0x1f);
  assert.equal(s(p.valid), 1);
  assert.equal(s(p.abortNeeded), 0);
  assert.equal(u(p.freeArg), 0x201d); // raw selected on big valid

  // delta 0x20 goes the other way.
  p = plan(0x400, 0x2040, 0x201c);
  assert.equal(u(p.delta), 0x20);
  assert.equal(s(p.valid), 0);
  assert.equal(s(p.abortNeeded), 1);
  assert.equal(u(p.freeArg), 0);

  // wrap: payload - raw - 4 wraps to a small value -> valid.
  p = plan(0x400, 0x10, 0x40);
  assert.equal(u(p.delta), 0xffffffcc); // 0x10 - 0x40 - 4 = 0xffffffcc
  assert.equal(s(p.valid), 0);

  // zero count on the small path still forwards the payload (the free-side
  // null gate at 0xa648b0 is what makes (0,0) a no-op).
  p = plan(0, 0, 0);
  assert.equal(u(p.byteSize), 0);
  assert.equal(s(p.isBig), 0);
  assert.equal(u(p.freeArg), 0);
  assert.equal(s(p.abortNeeded), 0);

  // direct oracle parity on the same edge battery
  const oracle = allocC740Plan;
  for (const [count, payload, raw] of [
    [0x10, 0x2000, 0x1ff0],
    [0x400, 0x2040, 0x2010],
    [0x400, 0x2040, 0x201d],
    [0x400, 0x2040, 0x201c],
    [0x400, 0x10, 0x40],
    [0, 0, 0],
  ]) {
    assertPlan(plan(count, payload, raw), oracle({ count, payload, raw }), C740_OFF, C740_U32, `c740 plan(${count},${payload.toString(16)},${raw.toString(16)})`);
  }
});

test("AK: 0x0040cf50 string ctor — SSO/len gates, capacity rounding", () => {
  const sso = wasm.isaac_alloc_str_ctor_sso;
  const srcHeap = wasm.isaac_alloc_str_ctor_src_uses_heap;
  const cap = wasm.isaac_alloc_str_ctor_cap;
  const arg = wasm.isaac_alloc_str_ctor_alloc_arg;
  const clen = wasm.isaac_alloc_str_ctor_copy_len;

  // cmp eax,0x10 ; jae big — UNSIGNED size gate (sizes 0..0xf inline)
  assert.equal(sso(0), 1);
  assert.equal(sso(0xf), 1);
  assert.equal(sso(0x10), 0);
  assert.equal(sso(0xffffffff), 0);

  // cmp [edi+0x14],0x10 ; jb — source data at [src] iff cap >= 0x10
  assert.equal(srcHeap(0), 0);
  assert.equal(srcHeap(0xf), 0);
  assert.equal(srcHeap(0x10), 1);
  assert.equal(srcHeap(0xffffffff), 1);

  // cap: SSO fixed 0xf; big min(size|0xf, 0x7fffffff) — cmova UNSIGNED
  assert.equal(cap(0), 0xf);
  assert.equal(cap(0xf), 0xf);
  assert.equal(cap(0x10), 0x1f);
  assert.equal(cap(0x11), 0x1f);
  assert.equal(cap(0x1f), 0x1f);
  assert.equal(cap(0x20), 0x2f);
  assert.equal(cap(0x7ffffff0), 0x7fffffff);
  assert.equal(cap(0x7ffffff1), 0x7fffffff); // |0xf = 0x7fffffff == SAT
  assert.equal(cap(0x7fffffff), 0x7fffffff);
  assert.equal(cap(0x80000000), 0x7fffffff); // 0x8000000f > SAT -> clamp
  assert.equal(cap(0xffffffff), 0x7fffffff);

  // lea ecx,[ebx+1] — alloc arg = cap+1 (round-up to 16); SSO: no alloc
  assert.equal(arg(0), 0);
  assert.equal(arg(0xf), 0);
  assert.equal(arg(0x10), 0x20);
  assert.equal(arg(0x11), 0x20);
  assert.equal(arg(0x1f), 0x20);
  assert.equal(arg(0x20), 0x30);
  assert.equal(u(arg(0x80000000)), 0x80000000); // 0x7fffffff + 1 wraps

  // copy len: SSO FIXED 16 (movups); big size+1 (the NUL is copied)
  assert.equal(clen(0), 16);
  assert.equal(clen(0xf), 16);
  assert.equal(clen(0x10), 0x11);
  assert.equal(clen(0x1f), 0x20);
  assert.equal(u(clen(0xffffffff)), 0); // size+1 wraps

  // oracle agrees
  assert.equal(allocStrCtorSso(0x10), 0);
  assert.equal(allocStrCtorSrcUsesHeap(0x10), 1);
  assert.equal(allocStrCtorCap(0x20), 0x2f);
  assert.equal(allocStrCtorCap(0x80000000), 0x7fffffff);
  assert.equal(allocStrCtorCap(0x7ffffff1), 0x7fffffff);
  assert.equal(allocStrCtorAllocArg(0x10), 0x20);
  assert.equal(allocStrCtorAllocArg(0x80000000), 0x80000000);
  assert.equal(allocStrCtorCopyLen(0), 16);
  assert.equal(allocStrCtorCopyLen(0x10), 0x11);
});

test("AK: str_ctor_plan — full resolution, SSO vs big, saturation", () => {
  const ctor = wasm.isaac_alloc_str_ctor_plan;
  const base = SCRATCH + 0xa00;
  const plan = (srcCap, srcSize) => {
    ctor(srcCap, srcSize, base);
    return readPlan(view, base, STRCTOR_OFF, STRCTOR_U32);
  };
  // SSO: no allocation ever; src data from the src object itself
  let p = plan(0x8, 0x5);
  assert.equal(s(p.sso), 1);
  assert.equal(s(p.srcUsesHeap), 0);
  assert.equal(s(p.allocNeeded), 0);
  assert.equal(u(p.allocArg), 0);
  assert.equal(u(p.cap), 0xf);
  assert.equal(s(p.capSaturated), 0);
  assert.equal(u(p.copyLen), 16); // fixed movups copy
  assert.equal(u(p.sizeOut), 5);
  assert.equal(s(p.retBytes), 4);
  // SSO with heap source (src cap >= 0x10 but small size)
  p = plan(0x80, 0xf);
  assert.equal(s(p.sso), 1);
  assert.equal(s(p.srcUsesHeap), 1);
  assert.equal(u(p.cap), 0xf);
  assert.equal(u(p.copyLen), 16);
  // big: cap = size|0xf; alloc arg = cap+1; copy size+1
  p = plan(0x80, 0x20);
  assert.equal(s(p.sso), 0);
  assert.equal(s(p.srcUsesHeap), 1);
  assert.equal(s(p.allocNeeded), 1);
  assert.equal(u(p.allocArg), 0x30);
  assert.equal(u(p.cap), 0x2f);
  assert.equal(s(p.capSaturated), 0);
  assert.equal(u(p.copyLen), 0x21);
  assert.equal(u(p.sizeOut), 0x20);
  // saturation: size >= 0x80000000 clamps the cap (cmova)
  p = plan(0x80, 0x80000000);
  assert.equal(s(p.sso), 0);
  assert.equal(u(p.cap), 0x7fffffff);
  assert.equal(s(p.capSaturated), 1);
  assert.equal(u(p.allocArg), 0x80000000);
  // 0x7ffffff1 rounds to EXACTLY the SAT value — NOT marked saturated
  p = plan(0x80, 0x7ffffff1);
  assert.equal(u(p.cap), 0x7fffffff);
  assert.equal(s(p.capSaturated), 0);
  // oracle parity on the same battery
  for (const [srcCap, srcSize] of [
    [0x8, 0x5],
    [0x80, 0xf],
    [0x80, 0x20],
    [0, 0],
    [0x80, 0x80000000],
    [0x80, 0x7ffffff1],
    [0xffffffff, 0xffffffff],
    [0x10, 0x10],
  ]) {
    assertPlan(plan(srcCap, srcSize), allocStrCtorPlan({ srcCap, srcSize }), STRCTOR_OFF, STRCTOR_U32, `ctor(${srcCap.toString(16)},${srcSize.toString(16)})`);
  }
});

test("AL: 0x0040d040 string tidy — release gate, cap+1 size arg", () => {
  const rel = wasm.isaac_alloc_str_tidy_release_needed;
  const siz = wasm.isaac_alloc_str_tidy_size_arg;

  // cmp ecx,0x10 ; jb skip — UNSIGNED release gate
  assert.equal(rel(0), 0);
  assert.equal(rel(0xf), 0);
  assert.equal(rel(0x10), 1);
  assert.equal(rel(0xfff), 1);
  assert.equal(rel(0xffffffff), 1);
  // inc ecx — release size = cap + 1 (the NUL slot)
  assert.equal(u(siz(0xf)), 0x10);
  assert.equal(u(siz(0x10)), 0x11);
  assert.equal(u(siz(0xfff)), 0x1000); // the template's own 0x1000 edge
  assert.equal(u(siz(0xffffffff)), 0); // wrap
  // oracle agrees
  assert.equal(allocStrTidyReleaseNeeded(0x10), 1);
  assert.equal(allocStrTidyReleaseNeeded(0xf), 0);
  assert.equal(allocStrTidySizeArg(0xfff), 0x1000);
  assert.equal(allocStrTidySizeArg(0xffffffff), 0);
});

test("AL: str_tidy_plan — release template over cap+1 + reset state", () => {
  const tidy = wasm.isaac_alloc_str_tidy_plan;
  const base = SCRATCH + 0xb00;
  const plan = (cap, payload, raw) => {
    tidy(cap, payload, raw, base);
    return readPlan(view, base, STRTIDY_OFF, STRTIDY_U32);
  };
  // SSO (cap 0xf): NO release, NO free; reset still applies
  let p = plan(0xf, 0x2000, 0x1ff0);
  assert.equal(s(p.releaseNeeded), 0);
  assert.equal(u(p.sizeArg), 0x10);
  assert.equal(s(p.isBig), 0);
  assert.equal(u(p.adjustedSize), 0x10);
  assert.equal(u(p.delta), 0);
  assert.equal(s(p.valid), 1);
  assert.equal(s(p.abortNeeded), 0);
  assert.equal(u(p.freeArg), 0); // nothing freed
  assert.equal(s(p.headerReadNeeded), 0);
  assert.equal(s(p.sizeArgDropped), 1);
  assert.equal(u(p.resetSize), 0);
  assert.equal(u(p.resetCap), 0xf);
  assert.equal(u(p.resetFirstByte), 0);
  assert.equal(s(p.resetApplies), 1);
  // small release (cap 0x100): payload freed directly, vacuous valid
  p = plan(0x100, 0x2000, 0x1ff0);
  assert.equal(s(p.releaseNeeded), 1);
  assert.equal(u(p.sizeArg), 0x101);
  assert.equal(s(p.isBig), 0);
  assert.equal(u(p.freeArg), 0x2000); // the payload itself
  assert.equal(s(p.valid), 1);
  assert.equal(s(p.resetApplies), 1);
  // big release: cap 0xfff -> size 0x1000; delta 0x1f VALID -> raw
  p = plan(0xfff, 0x2040, 0x201d);
  assert.equal(s(p.releaseNeeded), 1);
  assert.equal(u(p.sizeArg), 0x1000);
  assert.equal(s(p.isBig), 1);
  assert.equal(u(p.adjustedSize), 0x1023);
  assert.equal(u(p.delta), 0x1f);
  assert.equal(s(p.valid), 1);
  assert.equal(s(p.abortNeeded), 0);
  assert.equal(u(p.freeArg), 0x201d);
  assert.equal(s(p.headerReadNeeded), 1);
  assert.equal(s(p.resetApplies), 1);
  // big invalid: delta 0x20 -> noreturn abort; NOTHING frees/resets
  p = plan(0xfff, 0x2040, 0x201c);
  assert.equal(u(p.delta), 0x20);
  assert.equal(s(p.valid), 0);
  assert.equal(s(p.abortNeeded), 1);
  assert.equal(u(p.freeArg), 0);
  assert.equal(s(p.resetApplies), 0);
  assert.equal(s(p.releaseNeeded), 1);
  // wrap delta: payload 0x10, raw 0x40 -> 0xffffffcc, invalid
  p = plan(0xfff, 0x10, 0x40);
  assert.equal(u(p.delta), 0xffffffcc);
  assert.equal(s(p.valid), 0);
  assert.equal(s(p.abortNeeded), 1);
  // oracle parity on the same battery
  for (const [cap, payload, raw] of [
    [0xf, 0x2000, 0x1ff0],
    [0x100, 0x2000, 0x1ff0],
    [0xfff, 0x2040, 0x201d],
    [0xfff, 0x2040, 0x201c],
    [0xfff, 0x10, 0x40],
    [0, 0, 0],
    [0xffffffff, 0x20, 0xffffffff],
  ]) {
    assertPlan(plan(cap, payload, raw), allocStrTidyPlan({ cap, payload, raw }), STRTIDY_OFF, STRTIDY_U32, `tidy(${cap.toString(16)},${payload.toString(16)},${raw.toString(16)})`);
  }
});

test("AM: 0x0040ccd0 string assign — grow gate, capacity law, length throw", () => {
  const grow = wasm.isaac_alloc_str_assign_grow_needed;
  const thr = wasm.isaac_alloc_str_assign_throws;
  const rSat = wasm.isaac_alloc_str_assign_round_saturated;
  const gSat = wasm.isaac_alloc_str_assign_grow_saturated;
  const ncap = wasm.isaac_alloc_str_assign_new_cap;
  const aarg = wasm.isaac_alloc_str_assign_alloc_arg;
  const fheap = wasm.isaac_alloc_str_assign_fast_uses_heap;
  const clen = wasm.isaac_alloc_str_assign_copy_len;
  const rel = wasm.isaac_alloc_str_assign_release_needed;
  const rsiz = wasm.isaac_alloc_str_assign_release_size_arg;

  // cmp edi,ecx ; ja grow — UNSIGNED; n == cap FITS (memmove path)
  assert.equal(grow(0x10, 0x10), 0);
  assert.equal(grow(0x11, 0x10), 1);
  assert.equal(grow(0, 0), 0);
  assert.equal(grow(0x10, 0xf), 1);
  assert.equal(grow(0xffffffff, 0xffffffff), 0);
  assert.equal(grow(0xffffffff, 0xfffffffe), 1);
  // cmp edi,0x7fffffff ; ja throw — the IN-BODY length gate
  assert.equal(thr(0x7fffffff), 0);
  assert.equal(thr(0x80000000), 1);
  assert.equal(thr(0xffffffff), 1);
  assert.equal(thr(0), 0);
  // round-sat: (n|0xf) > 0x7fffffff. DEAD for every n <= 0x7fffffff
  // (the OR can only set bits already set in 0x7fffffff) — but a real
  // instruction law: the first reachable n is 0x80000000, which the
  // length gate throws on BEFORE the cap calc (dead-branch pin, same
  // character as the alloc arm's `cmp edi,-1 ; jbe`).
  assert.equal(rSat(0x7ffffff0), 0);
  assert.equal(rSat(0x7ffffff1), 0);
  assert.equal(rSat(0x7fffffff), 0); // 0x7fffffff|0xf == 0x7fffffff
  assert.equal(rSat(0x80000000), 1);
  assert.equal(rSat(0xffffffff), 1);
  for (let i = 0; i <= 0x7fffffff; i = i * 2 + 1) {
    assert.equal(rSat(i), 0, `roundSat(${i.toString(16)})`);
  }
  // grow-sat: cap > 0x7fffffff - (cap>>1) (UNSIGNED shr half)
  assert.equal(gSat(0), 0);
  assert.equal(gSat(0x55555555), 0); // + half == 0x7fffffff exactly
  assert.equal(gSat(0x55555556), 1); // first firing
  assert.equal(gSat(0x1000), 0);
  assert.equal(gSat(0x7fffffff), 1);
  assert.equal(gSat(0xffffffff), 1);
  // new_cap: clamped candidates, cmovb max
  assert.equal(u(ncap(0x10, 0x20)), 0x30); // geo (0x18+0x18) > round 0x1f
  assert.equal(u(ncap(0x40, 0x10)), 0x4f); // round 0x4f > geo 0x18
  assert.equal(u(ncap(0x1000, 0x1000)), 0x1800);
  assert.equal(u(ncap(0x7ffffff0, 0x10)), 0x7fffffff);
  assert.equal(u(ncap(0x7fffffff, 0x10)), 0x7fffffff); // round == SAT: kept
  assert.equal(u(ncap(0x10, 0x55555555)), 0x7fffffff); // geo == SAT exactly
  assert.equal(u(ncap(0x10, 0x55555556)), 0x7fffffff); // grow-sat clamps
  assert.equal(u(ncap(0x80000000, 0x10)), 0x7fffffff); // round-sat (dead)
  assert.equal(u(ncap(0xffffffff, 0xffffffff)), 0x7fffffff);
  // alloc_arg: lea ecx,[ebx+1] — only the growing non-throwing path
  assert.equal(u(aarg(0x20, 0x10)), 0x30); // grow: new_cap 0x2f + 1
  assert.equal(aarg(0x10, 0x10), 0); // fits — no allocation
  assert.equal(aarg(0x80000000, 0x10), 0); // noreturn throw — no allocation
  assert.equal(u(aarg(0x40000000, 0x10)), 0x40000010);
  // fast-path data select: cap >= 0x10 -> [this]
  assert.equal(fheap(0xf), 0);
  assert.equal(fheap(0x10), 1);
  assert.equal(fheap(0xffffffff), 1);
  // copy length: n on both paths
  assert.equal(u(clen(0)), 0);
  assert.equal(u(clen(0x10)), 0x10);
  assert.equal(u(clen(0xffffffff)), 0xffffffff);
  // release gate: grow && cap >= 0x10
  assert.equal(rel(0x10, 0x10), 0); // not growing
  assert.equal(rel(0x11, 0x10), 1);
  assert.equal(rel(0x11, 0xf), 0); // SSO old buffer — nothing to free
  assert.equal(rel(0x1000, 0xfff), 1);
  assert.equal(rel(0, 0xf), 0);
  // lea ecx,[eax+1] — the release size dword
  assert.equal(u(rsiz(0xf)), 0x10);
  assert.equal(u(rsiz(0xfff)), 0x1000); // the template's own 0x1000 edge
  assert.equal(u(rsiz(0xffffffff)), 0); // wrap
  // copy-helper identity pins
  assert.equal(wasm.isaac_alloc_str_assign_fast_helper_va(), ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA);
  assert.equal(wasm.isaac_alloc_str_assign_grow_helper_va(), ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA);
  assert.equal(ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA, 0x00af08bd);
  assert.equal(ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA, 0x00af05df);
  assert.equal(ALLOC_IAT_MEMMOVE, 0x00b18748);
  assert.equal(ALLOC_IAT_MEMCPY, 0x00b18760);
  // oracle parity on a fixed battery
  for (const [n, cap] of [
    [0x10, 0x10], [0x11, 0x10], [0x10, 0xf], [0, 0],
    [0x10, 0x20], [0x40, 0x10], [0x1000, 0x1000],
    [0x7ffffff0, 0x10], [0x7fffffff, 0x10], [0x80000000, 0x10],
    [0xffffffff, 0xffffffff], [0x10, 0x55555555], [0x10, 0x55555556],
    [0x40000000, 0x10], [0xfff, 0xfff], [0x1000, 0xfff],
  ]) {
    assert.equal(s(grow(n, cap)), allocStrAssignGrowNeeded(n, cap), `grow(${n.toString(16)},${cap.toString(16)})`);
    assert.equal(s(rSat(n)), allocStrAssignRoundSaturated(n), `rSat(${n.toString(16)})`);
    assert.equal(s(gSat(cap)), allocStrAssignGrowSaturated(cap), `gSat(${cap.toString(16)})`);
    assert.equal(u(ncap(n, cap)), allocStrAssignNewCap(n, cap), `newCap(${n.toString(16)},${cap.toString(16)})`);
    assert.equal(u(aarg(n, cap)), allocStrAssignAllocArg(n, cap), `allocArg(${n.toString(16)},${cap.toString(16)})`);
    assert.equal(s(rel(n, cap)), allocStrAssignReleaseNeeded(n, cap), `rel(${n.toString(16)},${cap.toString(16)})`);
  }
  assert.equal(s(thr(0x80000000)), allocStrAssignThrows(0x80000000));
  assert.equal(s(fheap(0xf)), allocStrAssignFastUsesHeap(0xf));
  assert.equal(u(clen(0x10)), allocStrAssignCopyLen(0x10));
  assert.equal(u(rsiz(0xfff)), allocStrAssignReleaseSizeArg(0xfff));
});

test("AM: str_assign_plan — fit vs grow vs release/abort vs throw", () => {
  const plan = wasm.isaac_alloc_str_assign_plan;
  const base = SCRATCH + 0xc00;
  const run = (n, cap, payload, raw) => {
    plan(n, cap, payload, raw, base);
    return readPlan(view, base, STRASSIGN_OFF, STRASSIGN_U32);
  };
  // fit, SSO old buffer: no alloc, no release, object untouched
  let p = run(5, 0xf, 0x2000, 0x1ff0);
  assert.equal(s(p.growNeeded), 0);
  assert.equal(s(p.throws), 0);
  assert.equal(s(p.allocNeeded), 0);
  assert.equal(u(p.allocArg), 0);
  assert.equal(u(p.capOut), 0xf);
  assert.equal(s(p.roundSaturated), 0);
  assert.equal(s(p.growSaturated), 0);
  assert.equal(u(p.sizeOut), 5);
  assert.equal(s(p.fastUsesHeap), 0); // data at the object itself
  assert.equal(u(p.copyLen), 5);
  assert.equal(u(p.fastHelperVa), 0x00af08bd); // memmove — overlap-safe
  assert.equal(u(p.growHelperVa), 0x00af05df); // memcpy
  assert.equal(u(p.nulOffset), 5);
  assert.equal(s(p.nulByte), 0);
  assert.equal(s(p.releaseNeeded), 0);
  assert.equal(s(p.releaseIsBig), 0);
  assert.equal(u(p.releaseDelta), 0);
  assert.equal(s(p.releaseValid), 1); // vacuous
  assert.equal(s(p.releaseAbortNeeded), 0);
  assert.equal(u(p.releaseFreeArg), 0);
  assert.equal(s(p.bufOutIsNew), 0);
  assert.equal(s(p.sizeArgDropped), 1);
  assert.equal(s(p.retBytes), 8);
  assert.equal(s(p.returnsThis), 1);
  // fit with a BIG old cap: the release block is unreachable, so the
  // delta/valid/abort/free fields stay vacuous even though isBig is 1
  p = run(0x1000, 0x2000, 0x2040, 0x201c);
  assert.equal(s(p.growNeeded), 0);
  assert.equal(u(p.capOut), 0x2000);
  assert.equal(s(p.fastUsesHeap), 1); // data at [this]
  assert.equal(s(p.releaseNeeded), 0);
  assert.equal(u(p.releaseSizeArg), 0x2001);
  assert.equal(s(p.releaseIsBig), 1);
  assert.equal(u(p.releaseDelta), 0); // never computed
  assert.equal(s(p.releaseValid), 1); // vacuous
  assert.equal(s(p.releaseAbortNeeded), 0);
  assert.equal(u(p.releaseFreeArg), 0);
  assert.equal(s(p.bufOutIsNew), 0);
  // grow, small release: cap 0x10 -> payload freed directly, vacuous valid
  p = run(0x100, 0x10, 0x4000, 0x3ff0);
  assert.equal(s(p.growNeeded), 1);
  assert.equal(s(p.allocNeeded), 1);
  assert.equal(u(p.allocArg), 0x110); // new_cap 0x10f + 1
  assert.equal(u(p.capOut), 0x10f);
  assert.equal(s(p.roundSaturated), 0);
  assert.equal(s(p.growSaturated), 0);
  assert.equal(s(p.fastUsesHeap), 0); // select not executed on grow
  assert.equal(s(p.releaseNeeded), 1);
  assert.equal(u(p.releaseSizeArg), 0x11);
  assert.equal(s(p.releaseIsBig), 0);
  assert.equal(u(p.releaseFreeArg), 0x4000); // the old payload itself
  assert.equal(s(p.bufOutIsNew), 1);
  // grow, big release VALID: cap 0xfff -> size 0x1000; delta 0x1f -> raw
  p = run(0x1000, 0xfff, 0x2040, 0x201d);
  assert.equal(s(p.growNeeded), 1);
  assert.equal(u(p.capOut), 0x17fe); // max(0x100f, 0xfff+0x7ff)
  assert.equal(u(p.allocArg), 0x17ff);
  assert.equal(s(p.releaseNeeded), 1);
  assert.equal(u(p.releaseSizeArg), 0x1000);
  assert.equal(s(p.releaseIsBig), 1);
  assert.equal(u(p.releaseDelta), 0x1f);
  assert.equal(s(p.releaseValid), 1);
  assert.equal(s(p.releaseAbortNeeded), 0);
  assert.equal(u(p.releaseFreeArg), 0x201d); // raw
  assert.equal(s(p.bufOutIsNew), 1);
  // grow, big release INVALID: delta 0x20 -> IAT [0xb18894] noreturn;
  // size/cap were already stored but the buf swap is unreached
  p = run(0x1000, 0xfff, 0x2040, 0x201c);
  assert.equal(s(p.releaseNeeded), 1);
  assert.equal(u(p.releaseDelta), 0x20);
  assert.equal(s(p.releaseValid), 0);
  assert.equal(s(p.releaseAbortNeeded), 1);
  assert.equal(u(p.releaseFreeArg), 0);
  assert.equal(s(p.bufOutIsNew), 0);
  assert.equal(u(p.capOut), 0x17fe); // stored before the abort
  assert.equal(u(p.sizeOut), 0x1000);
  // wrap delta: payload 0x10, raw 0x40 -> 0xffffffcc, invalid
  p = run(0x1000, 0xfff, 0x10, 0x40);
  assert.equal(u(p.releaseDelta), 0xffffffcc);
  assert.equal(s(p.releaseValid), 0);
  assert.equal(s(p.releaseAbortNeeded), 1);
  // length throw: n > 0x7fffffff -> noreturn BEFORE every store — cap
  // stays the old value, no alloc, no release, no swap
  p = run(0x80000000, 0x10, 0x4000, 0x3ff0);
  assert.equal(s(p.growNeeded), 1);
  assert.equal(s(p.throws), 1);
  assert.equal(s(p.allocNeeded), 0);
  assert.equal(u(p.allocArg), 0);
  assert.equal(u(p.capOut), 0x10); // old cap — nothing was stored
  assert.equal(s(p.roundSaturated), 0);
  assert.equal(s(p.growSaturated), 0);
  assert.equal(s(p.releaseNeeded), 0);
  assert.equal(u(p.releaseFreeArg), 0);
  assert.equal(s(p.bufOutIsNew), 0);
  assert.equal(u(p.sizeOut), 0x80000000);
  // oracle parity on the same battery
  for (const [n, cap, payload, raw] of [
    [5, 0xf, 0x2000, 0x1ff0],
    [0x1000, 0x2000, 0x2040, 0x201c],
    [0x100, 0x10, 0x4000, 0x3ff0],
    [0x1000, 0xfff, 0x2040, 0x201d],
    [0x1000, 0xfff, 0x2040, 0x201c],
    [0x1000, 0xfff, 0x10, 0x40],
    [0x80000000, 0x10, 0x4000, 0x3ff0],
    [0, 0, 0, 0],
    [0xffffffff, 0xffffffff, 0x20, 0xffffffff],
    [0x11, 0x10, 0x20, 0xffffffff],
  ]) {
    assertPlan(run(n, cap, payload, raw), allocStrAssignPlan({ n, cap, payload, raw }), STRASSIGN_OFF, STRASSIGN_U32, `assign(${n.toString(16)},${cap.toString(16)},${payload.toString(16)},${raw.toString(16)})`);
  }
});

test("v3 census rows: 0x40cde0 / 0x40cee0 / 0x40d000 stay host", () => {
  // 0x40cde0 bad_alloc ctor: a 12-byte CONSTANT writer (xorps/movq zero
  // [this+4..0xb], then [this+4]=0xb1a724, [this]=0xb1a740) — no branch,
  // no IAT, no SEH, no input besides `this`. Exception plumbing, host.
  assert.equal(ALLOC_VA_SB_THROW_CTOR, 0x0040cde0);
  assert.equal(ALLOC_SB_THROW_VTABLE_VA, 0x00b1a740); // [this]
  assert.equal(ALLOC_BAD_ALLOC_EXCEPTION_VTABLE_VA, 0x00b1a724); // [this+4]
  // 0x40cee0: call 0x40cde0 ; push 0xbd5bcc ; push eax ;
  // call 0xaf05eb (->_CxxThrowException) ; int3 — the body reads NO stack
  // argument, so there is NO count gate HERE; the 202 callsites keep
  // their own count predicates (v2 census already recorded that).
  assert.equal(ALLOC_CALLERS_SB_THROW, 202);
  // 0x40d000 unscaled release: instruction-for-instruction the v1 AH
  // template (mov ecx,[ebp+0xc] ; mov eax,[ebp+8] ; cmp 0x1000 ; jb ;
  // [eax-4]...; ret 8); the arithmetic is already exported as the AH
  // laws + aef15c size-drop pin — landing a second export set would
  // duplicate frame-opaque v26's VA/end/ret/site pins. Census row only.
  assert.equal(ALLOC_VA_UNSCALED_RELEASE, 0x0040d000);
  assert.equal(ALLOC_CALLERS_UNSCALED_RELEASE, 2);
  assert.equal(ALLOC_UNSCALED_RELEASE_CALLER_1, 0x0041416b);
  assert.equal(ALLOC_UNSCALED_RELEASE_CALLER_2, 0x0068753c);
  // the census rows are recorded in the header (address-stable evidence)
  const h = readFileSync(header, "utf8");
  assert.match(h, /12-byte/);
  assert.match(h, /no stack argument/i);
  assert.match(h, /0x00b1a724/);
});

test("v4 census row: 0x0040ccd0 string assign lands; 1062 lea-corrected sites", () => {
  // Root + census (this unit: capstone linear decode with resync over the
  // whole .text — the raw bytescan reads 1057 by skipping past e8 bytes
  // inside other instructions' displacement windows; the lea-corrected
  // channel reproduces every pinned family census exactly, so 1062 is the
  // canonical count).
  assert.equal(ALLOC_VA_STRING_ASSIGN, 0x0040ccd0);
  assert.equal(ALLOC_CALLERS_STRING_ASSIGN, 1062);
  assert.equal(ALLOC_STR_ASSIGN_MAX_LEN, 0x7fffffff);
  // helper identity pins (thunks resolved through the import directory)
  assert.equal(ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA, 0x00af08bd);
  assert.equal(ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA, 0x00af05df);
  // the grow-path abort and length-throw sites (both noreturn)
  assert.equal(ALLOC_STR_ASSIGN_ABORT_VA, 0x0040cdaf);
  assert.equal(ALLOC_STR_ASSIGN_THROW_VA, 0x0040cdb5);
  // the throw site is one of the 82 pinned xlength-string callers
  // (0x0040ccc0 census includes 0x40cdb5; cross-checked this unit) and the
  // release site calls 0x00aef15c (3725-site census includes 0x40cd9a)
  const h = readFileSync(header, "utf8");
  assert.match(h, /string ASSIGN \(v4, AM\)/);
  assert.match(h, /memmove/);
  assert.match(h, /memcpy/);
  assert.match(h, /1062 lea-corrected/);
  assert.match(h, /IN-BODY length gate/);
});

test("randomized differential: scalar exports vs the JS oracle (LCG high bits)", () => {
  const rnd = makeLcg(0xa11c);
  const u32 = () => rnd();
  const i32v = () => s(rnd());
  const loDraw = () => {
    const branch = pick(rnd, 5);
    if (branch === 0) return 0;
    if (branch === 1) return 0xffffffff;
    if (branch === 2) return 0xfffffffc;
    if (branch === 3) return 0x1000;
    return rnd();
  };
  const hiDraw = () => {
    const branch = pick(rnd, 4);
    if (branch === 0) return 0;
    if (branch === 1) return 1;
    if (branch === 2) return 0x80000000;
    return rnd();
  };
  const ecxDraw = () => {
    const branch = pick(rnd, 6);
    if (branch === 0) return 0x100;
    if (branch === 1) return 0x101;
    if (branch === 2) return 0x1ff;
    if (branch === 3) return 0xffffffff;
    if (branch === 4) return pick(rnd, 4); // 0..3 real modes
    return rnd();
  };
  for (let i = 0; i < 600; ++i) {
    const ecx = ecxDraw();
    assert.equal(u(wasm.isaac_alloc_a648b0_mode(ecx)), allocA648b0Mode(ecx), `mode(${u(ecx).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_a648b0_action(ecx)), allocA648b0Action(ecx), `action(${u(ecx).toString(16)})`);
  }
  for (let i = 0; i < 600; ++i) {
    const tracked = u32();
    assert.equal(u(wasm.isaac_alloc_acct_block_va(tracked)), allocAcctBlockVa(tracked), "acctBlockVa");
    assert.equal(s(wasm.isaac_alloc_acct_is_fallback(tracked)), allocAcctIsFallback(tracked), "acctIsFallback");
    assert.equal(u(wasm.isaac_alloc_mode2_target_va(tracked)), allocMode2TargetVa(tracked), "mode2TargetVa");
  }
  for (let i = 0; i < 600; ++i) {
    const lo = loDraw();
    const hi = hiDraw();
    assert.equal(s(wasm.isaac_alloc_clamp_needed(lo, hi)), allocClampNeeded(lo, hi), "clampNeeded");
    assert.equal(u(wasm.isaac_alloc_clamped_lo(lo, hi)), allocClampedLo(lo, hi), "clampedLo");
    assert.equal(u(wasm.isaac_alloc_clamped_hi(lo, hi)), allocClampedHi(lo, hi), "clampedHi");
    assert.equal(u(wasm.isaac_alloc_malloc_arg(lo, hi)), allocMallocArg(lo, hi), "mallocArg");
    assert.equal(u(wasm.isaac_alloc_acct_add_hi(lo, hi)), allocAcctAddHi(lo, hi), "acctAddHi");
    assert.equal(u(wasm.isaac_alloc_header_value(lo, hi)), allocHeaderValue(lo, hi), "headerValue");
    assert.equal(u(wasm.isaac_alloc_result(lo)), allocResult(lo), "result");
    assert.equal(u(wasm.isaac_alloc_acct_alloc_lo(lo, hi)), allocAcctAllocLo(lo, hi), "acctAllocLo");
    assert.equal(u(wasm.isaac_alloc_acct_alloc_hi(hi, lo, hi, u(wasm.isaac_alloc_acct_add_hi(lo, hi)))), allocAcctAllocHi(hi, lo, hi, allocAcctAddHi(lo, hi)), "acctAllocHi");
    const tlo = u32();
    const thi = u32();
    const flo = u32();
    const fhi = u32();
    assert.equal(u(wasm.isaac_alloc_mode2_fold_lo(tlo, flo)), allocMode2FoldLo(tlo, flo), "mode2FoldLo");
    assert.equal(u(wasm.isaac_alloc_mode2_fold_hi(thi, fhi, tlo, flo)), allocMode2FoldHi(thi, fhi, tlo, flo), "mode2FoldHi");
  }
  for (let i = 0; i < 600; ++i) {
    const edx = u32();
    const header = u32();
    assert.equal(s(wasm.isaac_alloc_free_needed(edx)), allocFreeNeeded(edx), "freeNeeded");
    assert.equal(u(wasm.isaac_alloc_free_base(edx)), allocFreeBase(edx), "freeBase");
    assert.equal(u(wasm.isaac_alloc_acct_sub_lo(edx, header)), allocAcctSubLo(edx, header), "acctSubLo");
    assert.equal(s(wasm.isaac_alloc_acct_sub_borrow(edx, header)), allocAcctSubBorrow(edx, header), "acctSubBorrow");
    assert.equal(u(wasm.isaac_alloc_acct_sub_hi(edx, edx, header)), allocAcctSubHi(edx, edx, header), "acctSubHi");
    assert.equal(s(wasm.isaac_alloc_oom_observer_needed(i32v())), allocOomObserverNeeded(i32v()), "oomObserverNeeded");
  }
  for (let i = 0; i < 600; ++i) {
    const ecx = u32();
    assert.equal(u(wasm.isaac_alloc_a0f4e0_pushed_lo(ecx)), allocA0f4e0PushedLo(ecx), "a0f4e0PushedLo");
  }
  for (let i = 0; i < 600; ++i) {
    const size = loDraw();
    assert.equal(s(wasm.isaac_alloc_sb_is_big(size)), allocSbIsBig(size), "sbIsBig");
    assert.equal(s(wasm.isaac_alloc_sb_overflow(size)), allocSbOverflow(size), "sbOverflow");
    assert.equal(u(wasm.isaac_alloc_sb_raw_request(size)), allocSbRawRequest(size), "sbRawRequest");
    assert.equal(s(wasm.isaac_alloc_sb_alloc_called(size)), allocSbAllocCalled(size), "sbAllocCalled");
    assert.equal(s(wasm.isaac_alloc_sb_kind(size)), allocSbKind(size), "sbKind");
    assert.equal(u(wasm.isaac_alloc_sbr_adjusted_size(size)), allocSbrAdjustedSize(size), "sbrAdjustedSize");
    const raw = u32();
    assert.equal(u(wasm.isaac_alloc_sb_payload(raw)), allocSbPayload(raw), "sbPayload");
    assert.equal(u(wasm.isaac_alloc_sb_stash_va(raw)), allocSbStashVa(raw), "sbStashVa");
    const payload = u32();
    assert.equal(u(wasm.isaac_alloc_sbr_delta(payload, raw)), allocSbrDelta(payload, raw), "sbrDelta");
    assert.equal(s(wasm.isaac_alloc_sbr_valid(payload, raw)), allocSbrValid(payload, raw), "sbrValid");
    assert.equal(u(wasm.isaac_alloc_sbr_free_arg(size, payload, raw)), allocSbrFreeArg(size, payload, raw), "sbrFreeArg");
    assert.equal(s(wasm.isaac_alloc_sb_roundtrip_valid(raw)), allocSbRoundtripValid(raw), "sbRoundtripValid");
  }
  for (let i = 0; i < 300; ++i) {
    const count = u32();
    assert.equal(u(wasm.isaac_alloc_c740_byte_size(count)), allocC740ByteSize(count), `c740ByteSize(${u(count).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_c740_is_big(count)), allocC740IsBig(count), `c740IsBig(${u(count).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_c740_adjusted_size(count)), allocC740AdjustedSize(count), `c740Adjusted(${u(count).toString(16)})`);
  }
  /* v3 AK scalars (120 draws): size draws bias the SSO cut (0xf/0x10),
     the big cut (0x1000), the cmova saturation (0x7ffffff1/0x80000000)
     and the wrap. */
  const ctorSizeDraw = () => {
    const branch = pick(rnd, 8);
    if (branch === 0) return 0;
    if (branch === 1) return 0xf;
    if (branch === 2) return 0x10;
    if (branch === 3) return 0x11;
    if (branch === 4) return 0x7ffffff1;
    if (branch === 5) return 0x80000000;
    if (branch === 6) return 0xffffffff;
    return rnd();
  };
  for (let i = 0; i < 120; ++i) {
    const srcSize = ctorSizeDraw();
    const srcCap = u32();
    assert.equal(s(wasm.isaac_alloc_str_ctor_sso(srcSize)), allocStrCtorSso(srcSize), `strCtorSso(${u(srcSize).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_ctor_src_uses_heap(srcCap)), allocStrCtorSrcUsesHeap(srcCap), `strCtorSrcUsesHeap(${u(srcCap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_ctor_cap(srcSize)), allocStrCtorCap(srcSize), `strCtorCap(${u(srcSize).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_ctor_alloc_arg(srcSize)), allocStrCtorAllocArg(srcSize), `strCtorAllocArg(${u(srcSize).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_ctor_copy_len(srcSize)), allocStrCtorCopyLen(srcSize), `strCtorCopyLen(${u(srcSize).toString(16)})`);
  }
  /* v3 AL scalars (80 draws): cap draws bias the release gate and the
     template's 0x1000 edge through size = cap+1. */
  for (let i = 0; i < 80; ++i) {
    const cap = loDraw();
    assert.equal(s(wasm.isaac_alloc_str_tidy_release_needed(cap)), allocStrTidyReleaseNeeded(cap), `strTidyRelease(${u(cap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_tidy_size_arg(cap)), allocStrTidySizeArg(cap), `strTidySizeArg(${u(cap).toString(16)})`);
  }
  /* v4 AM scalars (50 draws): n draws bias the grow cut, the length
     gate and the (dead-in-body) round saturation; cap draws bias the
     geometric saturation at 0x55555555/0x55555556 and the SSO cut. */
  const assignNDraw = () => {
    const branch = pick(rnd, 10);
    if (branch === 0) return 0;
    if (branch === 1) return 0xf;
    if (branch === 2) return 0x10;
    if (branch === 3) return 0x11;
    if (branch === 4) return 0xfff;
    if (branch === 5) return 0x1000;
    if (branch === 6) return 0x7fffffff;
    if (branch === 7) return 0x80000000;
    if (branch === 8) return 0xffffffff;
    return rnd();
  };
  const assignCapDraw = () => {
    const branch = pick(rnd, 10);
    if (branch === 0) return 0;
    if (branch === 1) return 0xf;
    if (branch === 2) return 0x10;
    if (branch === 3) return 0xfff;
    if (branch === 4) return 0x1000;
    if (branch === 5) return 0x55555555;
    if (branch === 6) return 0x55555556;
    if (branch === 7) return 0x7fffffff;
    if (branch === 8) return 0xffffffff;
    return rnd();
  };
  for (let i = 0; i < 50; ++i) {
    const n = assignNDraw();
    const cap = assignCapDraw();
    assert.equal(s(wasm.isaac_alloc_str_assign_grow_needed(n, cap)), allocStrAssignGrowNeeded(n, cap), `assignGrow(${u(n).toString(16)},${u(cap).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_assign_throws(n)), allocStrAssignThrows(n), `assignThrows(${u(n).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_assign_round_saturated(n)), allocStrAssignRoundSaturated(n), `assignRoundSat(${u(n).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_assign_grow_saturated(cap)), allocStrAssignGrowSaturated(cap), `assignGrowSat(${u(cap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_assign_new_cap(n, cap)), allocStrAssignNewCap(n, cap), `assignNewCap(${u(n).toString(16)},${u(cap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_assign_alloc_arg(n, cap)), allocStrAssignAllocArg(n, cap), `assignAllocArg(${u(n).toString(16)},${u(cap).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_assign_fast_uses_heap(cap)), allocStrAssignFastUsesHeap(cap), `assignFastHeap(${u(cap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_assign_copy_len(n)), allocStrAssignCopyLen(n), `assignCopyLen(${u(n).toString(16)})`);
    assert.equal(s(wasm.isaac_alloc_str_assign_release_needed(n, cap)), allocStrAssignReleaseNeeded(n, cap), `assignRel(${u(n).toString(16)},${u(cap).toString(16)})`);
    assert.equal(u(wasm.isaac_alloc_str_assign_release_size_arg(cap)), allocStrAssignReleaseSizeArg(cap), `assignRelSize(${u(cap).toString(16)})`);
  }
  // constant exports
  assert.equal(wasm.isaac_alloc_mode2_selects_fallback(), allocMode2SelectsFallback());
  assert.equal(wasm.isaac_alloc_mode2_clears_fallback(), allocMode2ClearsFallback());
  assert.equal(wasm.isaac_alloc_free_subtracts_alloc_carry(), allocFreeSubtractsAllocCarry());
  assert.equal(wasm.isaac_alloc_a0f4c0_mode_cl(), allocA0f4c0ModeCl());
  assert.equal(wasm.isaac_alloc_a0f4c0_size_hi(), allocA0f4c0SizeHi());
  assert.equal(wasm.isaac_alloc_a0f4c0_edx(), allocA0f4c0Edx());
  assert.equal(wasm.isaac_alloc_a0f500_mode_cl(), allocA0f500ModeCl());
  assert.equal(wasm.isaac_alloc_a0f500_stack_zero_words(), allocA0f500StackZeroWords());
  assert.equal(wasm.isaac_alloc_aef15c_size_dropped(), allocAef15cSizeDropped());
  assert.equal(wasm.isaac_alloc_xlength_msg_va(), allocXlengthMsgVa());
  assert.equal(wasm.isaac_alloc_xlength_string_msg_va(), allocXlengthStringMsgVa());
  assert.equal(wasm.isaac_alloc_xlength_deque_msg_va(), allocXlengthDequeMsgVa());
});

test("randomized differential: the three plans + round trip", () => {
  const rnd = makeLcg(0xb1a2);
  const u32 = () => rnd();
  const a648 = wasm.isaac_alloc_a648b0_plan;
  const rt = wasm.isaac_alloc_roundtrip;
  const sp = wasm.isaac_alloc_sb_plan;
  const spr = wasm.isaac_alloc_sbr_plan;
  const base = SCRATCH + 0x500;
  const base2 = SCRATCH + 0x600;
  const base3 = SCRATCH + 0x700;
  const base4 = SCRATCH + 0x800;
  for (let i = 0; i < 400; ++i) {
    const scenario = {
      ecx: u32(),
      edx: u32(),
      sizeLo: u32(),
      sizeHi: u32(),
      tracked: u32(),
      mallocNull: pick(rnd, 2),
    };
    a648(scenario.ecx, scenario.edx, scenario.sizeLo, scenario.sizeHi, scenario.tracked, scenario.mallocNull, base);
    assertPlan(readPlan(view, base, A648_OFF, A648_U32), allocA648b0Plan(scenario), A648_OFF, A648_U32, `plan ${JSON.stringify(scenario)}`);
    // round trip with the same size pair
    rt(scenario.sizeLo, scenario.sizeHi, base2);
    assertPlan(readPlan(view, base2, RT_OFF, RT_U32), allocRoundtrip(scenario.sizeLo, scenario.sizeHi), RT_OFF, RT_U32, `rt(${u(scenario.sizeLo).toString(16)},${u(scenario.sizeHi).toString(16)})`);
  }
  for (let i = 0; i < 300; ++i) {
    const scenario = { size: u32(), raw: u32() };
    sp(scenario.size, scenario.raw, base3);
    assertPlan(readPlan(view, base3, SB_OFF, SB_U32), allocSbPlan(scenario), SB_OFF, SB_U32, `sb ${JSON.stringify(scenario)}`);
  }
  for (let i = 0; i < 300; ++i) {
    const scenario = { size: u32(), payload: u32(), raw: u32() };
    spr(scenario.size, scenario.payload, scenario.raw, base4);
    assertPlan(readPlan(view, base4, SBR_OFF, SBR_U32), allocSbrPlan(scenario), SBR_OFF, SBR_U32, `sbr ${JSON.stringify(scenario)}`);
  }
  for (let i = 0; i < 200; ++i) {
    const scenario = { count: u32(), payload: u32(), raw: u32() };
    wasm.isaac_alloc_c740_plan(scenario.count, scenario.payload, scenario.raw, base4);
    assertPlan(readPlan(view, base4, C740_OFF, C740_U32), allocC740Plan(scenario), C740_OFF, C740_U32, `c740 ${JSON.stringify(scenario)}`);
  }
  /* v3 AK/AL plans (100 + 100 draws). */
  const ctor = wasm.isaac_alloc_str_ctor_plan;
  const tidy = wasm.isaac_alloc_str_tidy_plan;
  const base5 = SCRATCH + 0xa00;
  const base6 = SCRATCH + 0xb00;
  for (let i = 0; i < 100; ++i) {
    const scenario = { srcCap: u32(), srcSize: u32() };
    ctor(scenario.srcCap, scenario.srcSize, base5);
    assertPlan(readPlan(view, base5, STRCTOR_OFF, STRCTOR_U32), allocStrCtorPlan(scenario), STRCTOR_OFF, STRCTOR_U32, `ctor ${JSON.stringify(scenario)}`);
  }
  for (let i = 0; i < 100; ++i) {
    const scenario = { cap: u32(), payload: u32(), raw: u32() };
    tidy(scenario.cap, scenario.payload, scenario.raw, base6);
    assertPlan(readPlan(view, base6, STRTIDY_OFF, STRTIDY_U32), allocStrTidyPlan(scenario), STRTIDY_OFF, STRTIDY_U32, `tidy ${JSON.stringify(scenario)}`);
  }
  /* v4 AM plans (50 draws). */
  const assign = wasm.isaac_alloc_str_assign_plan;
  const base7 = SCRATCH + 0xc00;
  for (let i = 0; i < 50; ++i) {
    const scenario = { n: u32(), cap: u32(), payload: u32(), raw: u32() };
    assign(scenario.n, scenario.cap, scenario.payload, scenario.raw, base7);
    assertPlan(readPlan(view, base7, STRASSIGN_OFF, STRASSIGN_U32), allocStrAssignPlan(scenario), STRASSIGN_OFF, STRASSIGN_U32, `assign ${JSON.stringify(scenario)}`);
  }
});

test("ZZZ executed assertion count", () => {
  console.log(`executed assertions: ${ASSERTIONS}`);
  assert.ok(ASSERTIONS > 15000, `expected >15000 assertions, ran ${ASSERTIONS}`);
});
