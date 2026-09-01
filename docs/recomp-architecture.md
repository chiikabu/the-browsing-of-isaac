# Static recompilation architecture for `isaac-ng.unpacked.exe` → WebAssembly

**Status:** prototype measured, recommendation made.
**Date:** 2026-08-09.
**Scope:** the LIFTER stage — how x86-32 machine code becomes compilable code.
Does not cover the Ghidra inventory, the Unicorn oracle, or the import/host
census; those are separate workstreams and this design consumes their output.

**Provenance.** Every number in §1–§6 traces to a command in
`scripts/recomp/lift/` run against `tools/isaac-ng.unpacked.exe` on this
machine (emcc 6.0.5, Node 24.15 / V8, 16 cores). §7 and the engine-limit
constants come from a companion literature/source survey run the same day;
those are attributed inline and were **not** re-measured here. Anything I
could not verify is marked **UNVERIFIED**.

> One provenance caveat: the `/EHsc`-vs-`/EHa` and Lua-VM findings quoted in
> §5.3 and §9 were measured by the companion survey against the *Steam
> original* `isaac-ng.exe` (9,362,440 B), not this unpacked copy
> (9,176,064 B). The `.text` virtual size is identical (`0x716134`), so the
> code findings should carry over, but they are second-hand here.

---

## 0. Executive summary

**Static recompilation of this binary to wasm is viable, and the prototype
proves it end to end.** An 851-line mechanical p-code→C emitter (1,412
lines including the PE reader, driver, and hand-written runtime) lifted
7,963 functions (4.80 MB of `.text`, 1.31 M x86 instructions) with a 99.7%
success rate, produced 290 MB of C, and emcc compiled and linked all of it
into a **24.3 MB wasm module in ~4 minutes wall-clock** that V8 compiles in
**49 ms**. Three lifted functions were verified byte-identical against the
existing hand-written translations over 20,000 randomized inputs each.

The two things everyone worries about turned out to be non-problems *given
the right emitter design*, and catastrophic *given the wrong one*:

- **EFLAGS cost is zero if flags are function-local C scalars.** The wasm
  for the lifted `basic_string` destructor contains no flag computation at
  all — clang deleted all six flags per instruction and fused `cmp`/`jb`
  into a single `i32.ge_u`. Route the same state through a `CpuState*`
  instead (the remill/rev.ng shape) and the module gets **1.94× bigger and
  ~3× slower**.
- **Compile time and module size are fine.** 4-minute builds, 24 MB
  modules, 49 ms browser compile. Not 400 MB, not 30 hours.

**Round 2 (§11) drove the lifter from the real Ghidra inventory and the
host-boundary census and produced the number that matters: 96.18% of
`.text` — 21,375 functions, 2.01 M instructions — lifted at a 99.66%
success rate into 440 MB of C, compiled and linked to a 37.95 MB wasm
module in 7.2 minutes, which V8 compiles in **227 ms** and instantiates
in 429 ms. The round-1 extrapolation of "≈ 37.6 MB at 5.06 wasm bytes per
x86 byte" held exactly: the real module is 5.02.

Round 2 also dissolved what round 1 called the top risk. The inventory
reports 3,127 unresolved computed jumps in 3,107 functions; instruction-level
classification shows **2,874 of them are `jmp reg` indirect tail calls**
(99.7% are the last instruction of the body), **764 are switch tables the
emitter now recovers into `br_table`**, and only **44 functions** need an
intra-function dispatch structure — which costs +18% on an affected
function and **0.036% of the module**. The entire hand-written CPU surface
is **32 intrinsics**; the entire host surface is **587 import shims**, of
which the census says only 125 symbols need real behaviour.

**Recommendation: hybrid.** Bulk-lift everything for coverage; keep the
hand-written translations where they exist and let the lifter call into
them by address. See §8.

---

## 1. What was built

```
scripts/recomp/lift/
  pe.py           PE32 reader (read-only; never executes the image)
  scan.py         function-start discovery from direct call targets
  lift.py         SLEIGH p-code -> C emitter          <- the core
  emit.py         driver: lift a VA set, write C + CpuState header
  build_wasm.py   parallel emcc build with time/memory instrumentation
  recomp_rt.h/.c  hand-written runtime (memory, p-code helpers, boundary)
  harness.c       differential test vs native/decomp
  bench.c         runtime cost: lifted vs hand-written, same module
```

Pipeline: `PE32 → pypcode/SLEIGH raw p-code → C → emcc → wasm → node`.

**Why p-code and not remill/rev.ng/RetDec.** SLEIGH is the only lifting
front end in this space that is (a) alive, (b) Apache-2.0-clean, (c) has
first-class x86-32 semantics including x87/SSE/segments, and (d) is already
in the pipeline. `pypcode` 3.3.3 (vendoring SLEIGH from Ghidra 12.x)
installed from PyPI and worked first try. Full landscape survey in §7.

**Emitter design** (`lift.py`), three decisions that turned out to matter:

1. **Root-register mapping.** SLEIGH's register space is byte-addressed
   (142 root registers, max offset `0x2236`). Each varnode is resolved to
   the maximal named register covering it, so `AL`/`AH`/`AX`/`EAX` all
   alias one C variable correctly and for free.
2. **Per-function register cache.** Each lifted function declares plain C
   locals for the roots it touches, loads them from the shared `CpuState`
   at entry, and spills/reloads only around calls and at return. Their
   addresses never escape, so SROA/mem2reg promote them to SSA and dead
   flags get DCE'd. **This is the single most important decision in the
   whole design** — see §3.
3. **Identity memory addressing.** Guest VA == wasm linear-memory offset.
   `MEMR32(a)` is `memcpy` from `(void*)(uintptr_t)a`, which clang lowers
   to a bare `i32.load offset=…`. This matches what the existing
   `native/decomp` helpers already assume
   (`reinterpret_cast<uint8_t*>(addr)`), so lifted and hand-written code
   share one address space with zero translation.

Flags are kept function-local and **not** propagated across calls by
default (`--spill-flags` restores the conservative behaviour). This is an
assumption, not a theorem: no MSVC-generated function passes EFLAGS through
a `call`. It is measurably worth 1.4× runtime (§3).

---

## 2. Correctness: the vertical slice

Three functions lifted mechanically — no per-function hand-authored logic —
compiled into the same wasm module as the existing hand-written
translations, and differentially tested in Node.

| VA | what | bytes | reference | result |
|---|---|---|---|---|
| `0x00423480` | MSVC `traits::compare` | 116 | semantics documented in `exit_pure_helpers.cpp` | **PASS** 0/20000 |
| `0x0040d040` | `basic_string` tidy/deallocate | 76 | `isaac_frame_opaque_40d040_tidy_plan` + `_apply_reset` | **PASS** 0/20000 |
| `0x00685bc0` | `std::map<string,…>::lower_bound` | 128 | `isaac_exit_map_lower_bound` | **PASS** 0/5001 |

Reproduce:

```
python scripts/recomp/lift/emit.py --exe tools/isaac-ng.unpacked.exe \
  --va 0x0040d040 --va 0x00685bc0 --va 0x00423480 \
  --out output/recomp/lift/slice --module lifted
emcc -O2 -o output/recomp/lift/slice/test.cjs \
  -I scripts/recomp/lift -I output/recomp/lift/slice -I native/decomp \
  output/recomp/lift/slice/lifted.c scripts/recomp/lift/recomp_rt.c \
  scripts/recomp/lift/harness.c native/decomp/exit_pure_helpers.cpp \
  native/decomp/frame_opaque_pure_helpers.cpp -sINITIAL_MEMORY=64MB -sEXIT_RUNTIME=1
node output/recomp/lift/slice/test.cjs 20000
```

`lower_bound` is the interesting one: the lifted `sub_00685bc0` calls the
lifted `sub_00423480` through the emulated guest stack, walking a synthetic
MSVC red-black tree built in shared linear memory, and produces a
bit-identical out-triple and return value against the hand-written C++.

**Two side findings worth recording.**

- **Calling-convention recovery is a non-problem for the lifter, and a real
  problem for humans.** `0x00423480` is `ecx = s1, edx = len1, [esp+4] = s2,
  [esp+8] = len2` — a compiler-invented convention with no name. The lifter
  reproduced it automatically because the convention is *encoded in the
  instructions it is already lifting*. My hand-written test harness got it
  wrong on the first attempt and produced 2023/4000 mismatches until I read
  the call site. This is a direct argument for the uniform
  `void f(CpuState*)` signature: it makes convention recovery unnecessary
  for correctness.
- **A real emitter bug the differential test caught.** SLEIGH materialises
  constant-address memory operands as bare `ram`-space varnodes (`u = ram[b18894:4]`),
  *not* as `LOAD` ops. The first emitter treated those as address constants.
  Silent wrong-value bug, found immediately by execution. Any lifter needs
  a differential oracle from day one; this is exactly what the Unicorn
  oracle workstream is for.

---

## 3. The measurement that decides the emitter design

Same 499 functions, same compiler flags, three register/flag representations.

| design | C source | wasm `-O2` | lifted `lower_bound` |
|---|---|---|---|
| **register cache + function-local flags** (chosen) | 8.31 MB | **587,338 B** | **592–699 ns/call** |
| register cache + flags spilled across calls | 8.63 MB | 806,265 B (+37%) | 942–954 ns/call |
| everything through `CpuState*` (remill/rev.ng shape) | 7.90 MB | 1,136,863 B (**+94%**) | 1854–2060 ns/call (**~3×**) |

Note the C source is *smallest* for the worst design. Source size is not
the metric; emitted wasm is.

**Why.** With locals, LLVM sees pure SSA and deletes everything unused.
Here is the entire lifted `0x0040d040` prologue in wasm (`wasm-dis` output,
`output/recomp/lift/slice/only.wat`):

```wat
(func $1 (param $0 i32)
 (local $1 i32) ... (local $7 i32)
 (local.set $7 (i32.load offset=80 (local.get $0)))   ;; EIP
 ...
 (if (i32.ge_u (local.tee $2 (i32.load offset=20 align=1 (local.get $4)))
               (i32.const 16))
```

Twenty-six x86 instructions, each of which SLEIGH expands into 6 flag
computations (including `popcount` for PF and `sborrow` for OF) — 123 p-code
ops total — and **not one flag survives**. `cmp ecx,0x10` + `jb` became a
single `i32.ge_u` folded into the `if`. Total: 7 locals, no parity table,
no overflow arithmetic.

This resolves the standing question in the literature. Trail of Bits had to
write three custom dead-store-elimination passes for McSema because
remill's `State` is behind a pointer; Arancini reports its own dead-flag
pass is worth only ~2% because its flags are SSA values. **Both are right.**
The determining factor is not the optimizer, it is whether the flag lives
somewhere the optimizer is allowed to delete. Put it in an `alloca`-backed
local and a stock `-O2` gives you Rellume-quality flag elision for free.

**Consequence:** do not build a custom flag-liveness analysis. Build the
register cache instead. It is ~40 lines and it subsumes the problem.

---

## 4. Scaling: measured, not extrapolated

Full run over all 7,986 function starts recovered from direct call targets.

### Lift

| | |
|---|---|
| functions requested / lifted / failed | 7,986 / **7,963** / 23 (**99.7%**) |
| `.text` bytes covered | 4,803,097 of 7,430,452 (**64.5%**) |
| x86 instructions | 1,313,933 |
| p-code ops | 5,706,164 (4.34 per instruction) |
| C emitted | **290,624,459 B**, 8,450,702 lines |
| expansion | **60.5 C bytes / x86 byte**, 6.43 C lines / x86 insn |
| lift wall time | **173 s** single-threaded Python |

The 23 failures are all wide-varnode residue: 16 `subreg size` (SSE
sub-register reads reached through `CALLOTHER` arguments), 4 wide
`INT_NEGATE`, 2 wide `INT_SRIGHT`, 1 SLEIGH `BadDataError`. All are
mechanical to finish; none is a design problem.

### Compile and link (emcc 6.0.5, `-O2`, 32 TUs of ~250 functions each, 14 jobs)

| | |
|---|---|
| compile wall / CPU | **181 s** / 1,504 s |
| peak RSS, worst single TU | **895 MB** (23.4 MB of C) |
| object files | 25.9 MB total |
| link wall / peak RSS | **41.5 s** / **915 MB** |
| **output wasm** | **24,294,973 B** |
| **wasm bytes per x86 byte** | **5.06** |
| exported functions | 7,979 |

### Browser load (Node 24 / V8, raw `WebAssembly.compile` on the 24.3 MB module)

| | |
|---|---|
| `WebAssembly.compile` | **49 ms** |
| `WebAssembly.instantiate` | **13 ms** |
| exports resolved | 7,985 (7,979 lifted functions) |

### Extrapolation to 100% of `.text`

At the measured 5.06 wasm bytes per x86 byte, the full 7,430,452-byte
`.text` yields **≈ 37.6 MB of wasm** from **≈ 450 MB of C** in ~50 TUs,
built in **≈ 5 minutes wall-clock** on 14 cores with **< 1 GB per process**.

Against the hard engine limits (read from V8 `src/wasm/wasm-limits.h`):
`kV8MaxWasmModuleSize` 1 GiB, `kV8MaxWasmDefinedFunctions` 1,000,000,
`kV8MaxWasmFunctionSize` 7,654,321 B, `kV8MaxWasmTableSize` 10,000,000.
A 37.6 MB module with ~15,000 functions sits at 3.7% of the module limit and
1.5% of the function limit. **There is no size wall here.**

37.6 MB is a large download for a browser game, but it is a *download*
problem (Brotli, split modules, streaming) not a *feasibility* problem, and
the game already ships ~1 GB of assets.

**`-Oz` is a trap here.** The same 32 TUs built at `-Oz` produce
**27,782,727 B — 14% *larger* than `-O2`** (5.78 vs 5.06 wasm bytes per x86
byte), because the size passes skip exactly the inlining and
store-forwarding that eliminate the `CpuState` spill/reload boundary. On a
3-function slice `-Oz` *was* 19% smaller than `-O2` (6,619 vs 8,186 B), so
this only shows up at scale. **Measure, don't assume: use `-O2`.**

### Runtime cost

`bench.c`, same wasm module, same workload (64 probes into a 512-node
`std::map<string,…>`, 1500 reps), lifted `0x00685bc0` vs hand-written
`isaac_exit_map_lower_bound`:

| | ns/call |
|---|---|
| hand-written C++ translation | 134–219 |
| **mechanically lifted** | **592–699** |
| ratio | **≈ 3.4×** |

Lifted `0x0040d040` (SSO path, no call): 47 ns/call.

Caveat: `lower_bound` is pointer-chasing with a nested call per level, so
it pays the spill/reload boundary nine times per call — a pessimistic case.
A leaf compute function would do better. **The host-vs-wasm component was
not measured** (no native C toolchain on this machine); published figures
put wasm at 1.45–1.55× native for well-formed compiled C (Jangda et al.,
USENIX ATC 2019), so the lifted-vs-native figure is plausibly 4–6× but is
**UNVERIFIED here**.

---

## 5. What must still be hand-written

The lift is mechanical. These are not, and they are the actual project.

### 5.0 Computed jumps: the top risk, re-measured and mostly dissolved

**Superseded by §11.** The first pass of this document flagged mid-function
computed jumps as the thing that could hard-fail the build. Measuring
against the complete Ghidra inventory reduced it to **44 functions**, and
the structure that handles them costs **+18% wasm on an affected function**
and **0.04% on the module**. Read §11 before acting on anything in §5.1.

### 5.1 Indirect control flow — the top risk

Measured over the 4.8 MB lifted:

| | count | notes |
|---|---|---|
| direct calls | 35,916 | free |
| indirect calls, target from a **constant** slot | **14,031** | only **498 distinct slots** — the IAT plus a few global fn-ptrs. Resolvable at lift time from the import table. |
| indirect calls, **computed** target | **12,884** | C++ vtable dispatch. Needs a runtime address→funcref table. |
| computed jumps (`jmp [tbl+idx*4]`) | **568** | MSVC switch tables, in 476 functions |
| tail calls | 73 | |

The 14,031 constant-slot calls collapse to a 498-entry name table — that is
a *good* number and it is the same set the import/host census workstream is
producing. Wire it in and half the indirect-call problem disappears.

The 12,884 computed calls all target **function entries**, so a sorted
address→`funcref` table plus `call_indirect` is sound and cheap. V8's
10 M-entry table limit is not a constraint.

**The 568 computed jumps are the real hazard.** Their targets are
*mid-function basic blocks*, and wasm has no computed goto: LLVM's
WebAssembly backend fails outright with `"WebAssembly hasn't implemented
computed gotos"` on `indirectbr`/`blockaddress`. There is exactly one good
outcome — **recover the jump table statically**, emit a C `switch`, let LLVM
lower it to `br_table`, which is free. Every unrecovered table is a
hand-annotation. Ghidra recovers most MSVC x86 tables but is known to
mis-handle the two-level `movzx`-index form (Ghidra issue #6695, open since
2024-07-05). Budget a per-site annotation file, XenonRecomp-style.

My prototype currently punts all of these to `recomp_jump_indirect()`.
**Making jump tables real is the first thing to build next.**

### 5.2 The `CALLOTHER` set — surprisingly small

Across 1.31 M lifted instructions there are **2,144 `CALLOTHER` sites in
only 26 distinct kinds**:

```
LOCK, UNLOCK, in, swi, paddsw, pmulhw, psllw, psraw,
cpuid + 18 cpuid_* sub-leaf variants
```

That is a one-afternoon hand-write list, not a research project. `cpuid`
returns a fixed synthetic CPU; `LOCK`/`UNLOCK` are no-ops in a
single-threaded wasm build; `in` and `swi` (int3) abort; the four MMX ops
need real implementations.

### 5.3 SEH and the FS segment — cheaper than expected

SLEIGH models `fs:[0]` as `FS_OFFSET + 0`, a plain flat address. So the
whole MSVC x86 exception-registration chain lifts as ordinary loads and
stores into a synthetic TEB you place in linear memory. Concretely, in
lifted `sub_006eef60` (`Isaac::genrand_int32`, which carries a full
`_except_handler4` frame plus a `/GS` cookie), the prologue became
`u9100_4 = FS_OFFSET + 0` and a `MEMW32` — no special handling at all.

So: **set `FS_OFFSET` to a fake TEB and the SEH prologue/epilogue cost is
two memory ops per function and nothing else**, as long as nothing throws.
An actual dispatcher (`_except_handler4`, `__CxxFrameHandler3`) is a
separate hand-written component and can be deferred; it is imported from
`VCRUNTIME140.dll`, so it is *not even in the 7.4 MB you are lifting*.

### 5.4 Everything else

- **Host boundary**: the 498 IAT slots → OpenGL/SDL/Steam/CRT shims. This
  is the bulk of the remaining project-months and is ordinary porting work.
- **Indirect dispatch table**: generated from the function inventory.
- **Function boundaries**: 51 lifted bodies exceeded 8 KB, covering 739 KB —
  these are recursive-descent runaways that fell through a real function
  end into the neighbour. They still produce *correct* code (the neighbour
  is duplicated, not corrupted) but they inflate the module and they mean
  the boundary set is wrong. **Replace `scan.py` with the Ghidra inventory**
  as soon as it exists; that also fixes the 64.5% coverage.
- **x87 80-bit precision is lossy.** `ST0..7` are modelled as `double` in
  the low 8 bytes, the same tradeoff remill makes. 53-bit mantissa instead
  of 64-bit. For a 2D roguelike this is almost certainly invisible, but it
  is a real semantic deviation and must be on the risk list.

---

## 6. Where this is WORSE than hand translation

Stated plainly, because this is the part that decides whether to pivot.

1. **~3.4× slower per function, measured.** The hand-written
   `isaac_exit_map_lower_bound` is idiomatic C++ operating on typed
   pointers; the lifted version threads an emulated stack and a 2,776-byte
   register file. No optimizer recovers that gap.
2. **No types, no names, no comprehension.** Hand translation produces
   `IsaacFrameOpaque40d040Plan` with field names and a documented ABI. The
   lifter produces `u24d80_1` and `s->ESI`. You cannot read it, review it,
   diff it against intent, or fix a gameplay bug in it. **A lifted binary
   is a working artifact, not a codebase.** Everything the current
   `native/decomp` effort has built — the pure/host split, the ABI
   versioning, the differential test corpus — is discarded by a pure lift.
3. **Correctness is all-or-nothing and unverifiable by inspection.** Hand
   translation gives per-function evidence. A lift gives you "it ran". The
   only defence is an execution oracle over a huge input space, which is
   why the Unicorn workstream is load-bearing rather than optional.
4. **The 35.5% of `.text` I did not cover is invisible.** Hand translation
   knows what it hasn't done. A lifter silently omits whatever the function
   inventory missed, and you discover it as a runtime "unresolved indirect
   call to 0x…" mid-playtest.
5. **Mid-function indirect jumps can hard-fail the compile**, not degrade.
   Hand translation never has this failure mode.
6. **Modding.** Isaac's value is substantially its mod ecosystem. Lifted
   code cannot be patched or extended; hand-translated code can.

---

## 7. Tool landscape (why not use an existing lifter)

Surveyed 2026-08-09 with dates and issue numbers; full detail in the
research log. Ranked by usability *for this job*:

| tool | status | verdict |
|---|---|---|
| **SLEIGH / pypcode** | alive; pypcode 4.0.0 on PyPI 2026-05-16, vendors Ghidra 12.1 SLEIGH; `lifting-bits/sleigh` v12.1.2 2026-06-08, Apache-2.0 | **chosen.** Decoder only — you write the lifter. That turned out to be ~900 lines. |
| **remill** | alive, revived: v6.0.1 2026-04-21, last commit 2026-06-30, Apache-2.0. Full x86-32 incl. x87/SSE/MMX/segments. IR is retargetable (no `llvm.x86.*` intrinsics; `native_float80_t` falls back to `double` on non-x86). Scaling: issue #762 — 85 MB binary needed partitioning into 38 modules on 24 GB. | **strongest alternative.** Semantics library, not a whole-binary tool — you still write PE loading, function discovery, jump tables. Its `State`-behind-a-pointer shape is exactly the design my A/B measured at 1.94× bigger / ~3× slower. |
| **elfconv** | Apache-2.0, pushed 2026-08-01. remill → LLVM → Emscripten → wasm, runs CPython in-browser. | **existence proof that remill IR reaches wasm.** AArch64 only; x86-64 "NOT yet end-to-end" as of 2026-08-08; ELF only. |
| **evmar/theseus** | x86-32 PE → Rust → wasm32. Created 2026-03-12, pushed 2026-08-02. One Rust fn per *basic block* + continuation trampoline, so irreducible CFG never reaches the wasm backend. Expansion 22–35× source. | **read the design, do not depend on it.** No LICENSE file — all rights reserved. Author: "probably won't work on a program you try." |
| **mcsema** | archived 2022-08-23; required IDA Pro; AGPL | dead |
| **anvill / rellic** | anvill last real commit 2022-12, main branch needs a *closed-source* Ghidra plugin; rellic's 2025 commit disabled CI | dead / wrong role |
| **rev.ng** | very alive (pushed 2026-08-07) and the best PE/`__thiscall` model on paper — but issue #552: a **304 KiB** binary took 9.9 GB and 25+ h; 1 MiB and 4 MiB OOM'd. PE IAT unimplemented (#478, open). QEMU **GPLv2** helpers are linked into the output. | **killed three ways.** |
| **RetDec** | lifter frozen since 2022-12, LLVM 8, CI 100% broken, `bad_alloc` on a 1 MB PE. Lead dev, issue #45: "it has never been our goal to produce LLVM IR or C that could be recompiled." | dead |
| **p-code→LLVM projects** | newest code in the category is LukeSerne/Ghidra-to-LLVM, 2023-06-04, x86-64 only | none usable |
| **Ghidra C export** | arXiv:2202.12336: 70–89% of individual functions recompile, **1.7% of whole binaries**. Ghidra #8102 open since 2025-05-04. | not a recompilation source |
| angr/VEX, Triton, miasm, BAP, Dyninst, Reko, Mergen | all alive, all analysis/SymEx/instrumentation | wrong category |

**The 851-line emitter beat every off-the-shelf option on this binary**,
mostly because the off-the-shelf options either target the wrong thing
(readable C), the wrong ISA (x86-64/AArch64), or use a state representation
that costs 2× in wasm.

---

## 8. Recommended pipeline

```
                       tools/isaac-ng.unpacked.exe  (read-only)
                                     |
   ┌──────────────────┬──────────────┴───────────┬─────────────────────┐
   │                  │                          │                     │
Ghidra headless   import/host census      Unicorn oracle          (this repo's
function          498 IAT slots ->        golden CPU+memory        existing
inventory +       host shim names         traces per function      hand ports)
jump tables            │                       │                        │
   │                   │                       │                        │
   └────────┬──────────┘                       │                        │
            v                                  │                        │
     scripts/recomp/lift/emit.py               │                        │
     (SLEIGH p-code -> C, per-function         │                        │
      register cache, identity memory)         │                        │
            │                                  │                        │
            ├── lifted_NNN.c  (~50 TUs)        │                        │
            ├── recomp_state.h                 │                        │
            ├── dispatch.c  (VA -> funcref)    │                        │
            └── missing.txt ──────────────┐    │                        │
                                          v    v                        v
                            hand-written boundary layer  <───────────────┘
                            - 26 CALLOTHER intrinsics
                            - 498 IAT shims (GL/SDL/Steam/CRT)
                            - fake TEB + SEH dispatcher (deferrable)
                            - override table: VA -> hand-written impl
                                          |
                                    emcc -O2, parallel
                                          |
                                  ~37 MB wasm module
                                          |
                            differential replay vs oracle
```

### The hybrid, concretely

The lifter already emits every call as `sub_XXXXXXXX(CpuState*)`. Make that
name a **weak symbol** and the hybrid falls out of the linker for free:

```c
/* generated */
__attribute__((weak)) void sub_00685bc0(CpuState *s) { /* lifted body */ }

/* hand-written override, linked in later, wins */
void sub_00685bc0(CpuState *s) {
  s->EAX = isaac_exit_map_lower_bound(s->ECX, MEMR32(s->ESP + 4),
                                      MEMR32(s->ESP + 8));
  s->EIP = MEMR32(s->ESP); s->ESP += 12;   /* ret 8 */
}
```

Because both sides already use identity addressing over the same linear
memory, no marshalling is needed beyond the register/stack ABI shim — and
§2 proves the two produce identical results on identical memory. Every
hand-written translation in `native/decomp` keeps its value: it becomes the
*fast, readable, moddable* implementation of a function that also has a
mechanical fallback. Nothing is thrown away, and coverage stops being the
bottleneck.

This also gives a free continuous correctness check: run both
implementations of an overridden function on the same state and diff — the
harness in §2 is exactly that, and it generalizes.

### Explicitly rejected alternatives

- **remill as the lifter.** Would work, and elfconv proves it reaches wasm,
  but its `State`-behind-a-pointer IR is the design my A/B measured at
  1.94× module size and ~3× runtime, and undoing that is what anvill was
  for — and anvill is dead behind a closed-source dependency.
- **One giant lifted function with a dispatch loop** (the rev.ng `root`
  shape). `kV8MaxWasmFunctionSize` is 7,654,321 bytes and lifted x86 expands
  5×; a single function cannot hold `.text`.
- **A global `switch` dispatcher over all block addresses.**
  `kV8MaxWasmFunctionBrTableSize` is 65,520 and LLVM's `LowerBR_JT` does not
  split `br_table`. Use `call_indirect` through a table instead.
- **memory64.** Destroys the guard-page trick that makes wasm32 bounds
  checks free; measured elsewhere at 10–100% penalty. The image needs
  ~9.2 MB and the heap is under your control — stay on wasm32.

---

## 9. Risks, ranked

| risk | severity | evidence | mitigation |
|---|---|---|---|
| **20,148 dynamic indirect calls; 43% of real functions never direct-called** | **critical** | §11.4b / §11.5, measured over 96% of `.text` | sorted address→funcref table + `call_indirect`; runtime trap on an unknown target feeding an annotation loop. This is now the top risk. |
| **73 lift failures (wide SSE / x87 residue)** | medium | §11.4b | finish the wide-varnode paths; all mechanical |
| **~3.4× slower than hand-written** | medium | §4, measured in-module | acceptable for a 2014 2D game; hybrid overrides for hot paths |
| **x87 → `double` precision loss** | medium | ST0..7 modelled with a 53-bit mantissa | audit the x87 sites; the binary is SSE2-dominant |
| **3.82% of `.text` still uncovered** | medium | 7,146,356 of 7,430,452 bytes | mostly data-in-code plus the 73 failures |
| **SEH dispatch not implemented** | low-medium | 2,571 real functions carry SEH; prologues lift for free through `FS_OFFSET` | defer — the unwinder is imported from VCRUNTIME140, not lifted |
| **44 functions need a pc dispatch loop** | **low** | §11.1 / §11.2: +18% on an affected function, **0.036% on the module** | `--dispatch auto`; LLVM folds the loop away where `pc_` is constant |
| **440 MB of C per build** | low | §11.4b | 43 TUs, parallel, < 1 GB per process |
| **Self-modifying code / packing** | **none** | already unpacked; Lua is an external DLL | — |

---

## 10. If I had one week of compute

**Round 2 completed days 1-3 of the original plan** (§11). Coverage is 96.18%,
the IAT is bound, the jump tables are recovered. Revised plan:

1. **Day 1 — the dispatch table.** Emit a sorted VA→`funcref` table from the
   14,211 real entries plus every recovered jump-table target, and turn
   `recomp_call_indirect` into a real `call_indirect`. 43% of real functions
   are reachable *only* this way, so nothing runs until this exists.
   *Deliverable: a module where an unknown indirect target is a logged trap,
   not a link error.*
2. **Day 1-2 — static initialisers and boot.** Run the 117 C++ + 4 C static
   initialisers via the `_initterm` bounds in `__scrt_common_main_seh`, set
   `FS_OFFSET` to a synthetic TEB, then enter `main` at `0x00931050`.
   *Deliverable: the first import the lifted binary actually demands at
   runtime, in order.*
3. **Day 2-4 — differential replay against the Unicorn oracle.** It agrees
   3/3 with hand-verified work and runs 1,428 vectors/s/core; at 16 cores
   that is ~2 M vectors/day. Replay every lifted function: oracle-recorded
   entry state in, compare exit state and memory diff.
   *Deliverable: pass rate per function and a triage list. This is the only
   scalable correctness argument that exists.*
4. **Day 4-5 — the 587 import shims, demand-ordered.** Only 125 symbols /
   5,779 call sites need real behaviour; the CRT is `/MD` so UCRT calls map
   to musl/emscripten equivalents, and Lua is an external DLL (14,011 call
   sites, 62% of IAT traffic, **zero bytes to lift**) — build Lua 5.3.3 from
   source into the same module.
   *Deliverable: the first frame that reaches the GL layer.*
5. **Day 5-6 — close the 73 lift failures and the 3.82% coverage gap**, then
   re-run steps 1-3. *Deliverable: >99% coverage with the same pass rate.*
6. **Day 6-7 — wire the hybrid.** Weak symbols plus an override table; make
   every existing `native/decomp` translation an override; generalize the
   §2 harness across all of them. *Deliverable: proof that hand and lifted
   code coexist at scale.*

**Do not spend the week on:** a custom flag-liveness pass (§3 — `-O2` already
does it), a general computed-goto machinery (§11.1 — 44 functions, and
`--dispatch auto` already handles them), evaluating remill/rev.ng further
(§7), or shrinking the emitted C (build time and module size are fine).

**Abort criteria.** If step 1 leaves a large tail of indirect targets that
resolve to no known function, or step 3 shows a low per-function pass rate
that does not concentrate in a fixable category, the mechanical path does
not close and the hybrid degenerates into hand translation with extra
steps. Both are cheap to test, which is why they are first.

---

## 11. Round 2: computed jumps, the real inventory, and IAT resolution

Everything in §1–§10 was measured against a function-start set recovered
from direct call targets alone (7,986 starts, 64.5% of `.text`). The
Ghidra headless export and the host-boundary census have since landed and
the lifter now consumes both. This section supersedes §5.0/§5.1 where they
disagree.

### 11.1 The computed-goto problem is 44 functions, not 3,107

The inventory reports **3,127 `unresolvedComputedJumps` sites in 3,107
functions** — 13% of all records — which would be a serious problem if all
of them needed a computed-goto structure. They do not.

I disassembled every computed jump in every function the inventory lists
(`scripts/recomp/lift/jumptables.py`) and classified it by operand form:

| form | sites | what it actually is |
|---|---|---|
| `jmp reg` | **2,874** | indirect **tail call**. 2,865 of them (99.7%) are the last instruction of the function body. Classic MSVC lazy-import/vtable thunk: `call resolver; mov [slot],eax; pop ebp; jmp eax`. |
| `jmp [idx*4 + TBL]` | **764** | real switch table — **recovered**, 7,572 entries, 6,004 landing inside the owning function |
| `jmp [IMM]` | **103** | IAT slot tail call |
| unclassified | **35** | genuinely needs a dispatch structure |

A tail call needs `call_indirect` followed by `return`, which the lifter
already emits and which costs nothing structurally: the callee's `ret`
consumes the caller's return address off the shared guest stack, exactly
as on x86. Ghidra calls these "unresolved" because it cannot name a
target, not because they branch into the middle of a function.

**Functions that genuinely need an intra-function dispatch structure: 44**
(35 unclassified sites + 9 non-tail `jmp reg`), holding **6,998 bytes** —
0.09% of `.text`. Of those 44, **21 are real function entries and 23 are
Ghidra fragments** that get folded into their parents anyway (§11.3). The
full-binary lift independently lands on the same figure: **44 functions,
47 unresolved sites** (§11.4b), against 758 recovered tables and 2,977
tail calls.

Cross-check against the inventory's own field: of the 3,107 functions with
`unresolvedComputedJumps`, 2,945 are real entries and 162 are fragments —
so the fragment filter does *not* shrink that number. The reduction from
3,107 to 44 comes entirely from separating tail calls from computed gotos,
which is a distinction the `unresolvedComputedJumps` counter does not make.

### 11.2 What the structures cost, measured

Three emissions of the same 44 functions, `-O2`, all exported:

| computed-jump handling | C source | wasm | vs. trap |
|---|---|---|---|
| `--dispatch off` (runtime trap) | 544,565 | **49,743** | — |
| `--dispatch auto` (loop on the 33 that need it) | 557,436 | **58,717** | **+18.0%** |
| `--dispatch force` (loop on all 42 lifted) | 560,626 | **58,717** | +18.0% |

Two results worth keeping:

1. **+18% wasm on an affected function; 0.036% on the module.** 8,974
   extra bytes against a ~25 MB module. The dispatch loop is affordable
   even if the affected set grew by 100×.
2. **`force` and `auto` produce byte-identical wasm.** When no computed
   jump writes `pc_`, LLVM proves the switch has one reachable case and
   folds the entire loop away. So the loop is self-limiting: wrapping
   functions that don't need it is free, and targeting is a C-size
   optimisation, not a correctness or performance one.

I also re-tested the premise. **`indirectbr`/computed `goto` now compiles
for wasm** in emcc 6.0.5 (LLVM 21) at `-O0` and `-O2` — the historical
`"WebAssembly hasn't implemented computed gotos"` hard failure is gone.
The emitter still does not use it: an explicit `switch` over recovered
targets is strictly better because LLVM lowers a dense one to `br_table`.
Verified: the two lifted switch functions produce **6 `br_table`
instructions** in the output wasm.

Structure emitted at a recovered site (no cost to any other block):

```c
  jt41ddbd = <computed target>;
  switch (jt41ddbd) {
    case 0x41ddc4u: goto L_0041ddc4;
    case 0x41ddcau: goto L_0041ddca;
    ...                              /* 161 targets -> one br_table */
    default: break;
  }
  /* spill */ recomp_jump_indirect(s, jt41ddbd); return;
```

### 11.3 Fragments: the decision, and why it is safe either way

Ghidra's gap-recovery pass added 10,145 entries of which only **186 have a
real prologue**; the other **9,959 are mid-function fragments** covering
1,455,468 bytes. Real function entries: **14,211** (= 14,025 `recovered:false`
+ 186 recovered-with-prologue), which is the set the coordinator's
independent diff also arrived at.

**Decision: `--fragments absorb` is the default.** Fragments are removed
from the *boundary* set so a branch into one stays an internal edge and
the parent is lifted whole. They are kept as *lift targets* of last
resort: after the real functions are lifted, any fragment whose entry byte
is still uncovered gets lifted standalone, so absorbing can never open a
coverage hole. `--fragments split` restores the old behaviour for A/B.

Measured A/B over the same first 1,000 inventory rows:

| mode | functions emitted | x86 bytes lifted | wasm `-O2` |
|---|---|---|---|
| `split` (every row is a function) | 999 | 235,158 | 1,066,527 |
| **`absorb`** (fragments folded, 128 rescued) | 912 | 215,005 | **1,003,389** |

Absorbing lifts **8.6% fewer x86 bytes** (that difference is pure
duplication) and produces **5.9% smaller wasm**.

Worth stating explicitly, because it is a property of this design rather
than of the fragment data: **treating a fragment as a function is not a
correctness bug here.** With a uniform `void f(CpuState*)` ABI over shared
guest memory, `jmp frag` lifts to `sub_frag(s); return;`, the fragment's
`ret` pops the same return address the real `ret` would have, and control
lands in the same place. Splitting costs code duplication, call overhead,
and inflated byte counts — not wrong answers. That is why the earlier
64.5%-coverage run produced correct code despite 51 runaway bodies.

### 11.4 IAT-resolvable indirect calls

The census maps 622 import symbols to their IAT slot VAs. The emitter now
tracks `unique = *[ram]CONST` within an instruction, so
`call dword ptr [slot]` becomes a direct call to a named shim
(`imp_api_ms_win_crt_heap__free(s)`) instead of a runtime dispatch. Same
for `jmp [slot]` tail calls.

On a 1,000-function sample: 34 distinct shims bound, and
**`callind_const_unresolved` = 0** — every constant-slot indirect call
resolved. 414 indirect calls remained, all genuinely dynamic.

### 11.4b Full-coverage lift, driven by the real inventory

```
python scripts/recomp/lift/emit.py --exe tools/isaac-ng.unpacked.exe \
  --ghidra-functions output/recomp/export/functions.jsonl \
  --fragments-tsv   output/recomp/export/recovered-functions.tsv \
  --imports         output/recomp/census/imports.json \
  --va-file output/recomp/lift/ghidra_all.txt --dispatch auto \
  --out output/recomp/lift/gabs --module lifted --split 500
```

| | round 1 (own scanner) | **round 2 (real inventory)** |
|---|---|---|
| function starts | 7,986 | 24,170 rows → 14,211 real + rescued fragments |
| functions emitted | 7,963 | **21,375** (73 failed, **99.66%**) |
| `.text` covered | 4,803,097 (64.5%) | **7,146,356 (96.18%)** |
| x86 instructions | 1,313,933 | **2,009,975** |
| p-code ops | 5,706,164 | 8,470,164 |
| C emitted | 290.6 MB | **440.4 MB** (13.0 M lines, 43 TUs) |
| C bytes / x86 byte | 60.5 | **58.3** |
| lift wall time | 173 s | **270 s** |

Control-flow resolution over the whole binary:

| | |
|---|---|
| direct calls | 62,943 |
| **switch tables recovered** | **758 → 7,150 targets** |
| **indirect tail calls** (`jmp reg` / `jmp [slot]`) | **2,977** |
| **unresolved computed jumps** | **47, in 44 functions** |
| **import shims bound** (`call [IAT]` → named host call) | **587 distinct**, used by 3,814 functions |
| indirect calls still dynamic | **20,148** |
| of those, still through a constant slot | 544 (globals in `.data`, not the IAT) |
| CALLOTHER intrinsics to hand-write | **32 kinds** |
| missing callees needing stubs | 36 |

### 11.4c Build and load of the 96%-coverage module

emcc 6.0.5, `-O2`, 45 TUs, 14 parallel jobs, everything exported so nothing
is dead-stripped.

| | |
|---|---|
| C input | **440,457,208 B** across 45 TUs |
| compile wall / CPU | **274.5 s** / 1,988.5 s |
| peak RSS, worst TU | **1,457.7 MB** (a 49.6 MB TU) |
| object files | 40.8 MB |
| link wall / peak RSS | **158.6 s** / **1,349 MB** |
| **output wasm** | **37,952,773 B** |
| **wasm bytes per x86 byte** | **5.02** |
| exported functions | 21,375 |
| **total build** | **7.2 minutes** |

Loaded in Node 24 / V8 from the raw bytes:

| | |
|---|---|
| `WebAssembly.compile` | **227 ms** |
| `WebAssembly.instantiate` | **429 ms** |
| exports resolved | 21,381 |

**The §4 extrapolation held.** From a 500-function sample I predicted
"≈ 37.6 MB of wasm" for the whole of `.text` at 5.06 bytes per x86 byte;
the real thing at 96.18% coverage is **37.95 MB at 5.02**. Against V8's
limits: 3.7% of the 1 GiB module cap, 2.1% of the 1 M function cap.

Two practical notes for whoever builds this next:

- **The linker is now the serial bottleneck**, not compilation: 158.6 s and
  1.35 GB for one `wasm-ld` + `wasm-opt` pass that cannot be parallelised.
  Compilation is 274.5 s wall but 1,988 s CPU, so it keeps scaling with
  cores; the link does not.
- **Sub-TU balance matters.** One 49.6 MB TU took 247 s and 1.46 GB by
  itself. `--split` on function *count* produces wildly uneven TUs because
  body sizes span 37 B (p50) to 63,810 B; splitting on cumulative *bytes*
  would cut both wall time and peak memory.

The 73 failures are the same wide-varnode residue as before (37 SSE
sub-register reads reached through `CALLOTHER` arguments, 22 SLEIGH
`BadDataError`, 10 wide `INT_NEGATE`/`INT_SRIGHT`, 2 bodies over the
20,000-instruction cap, 2 wide loads).

**Where the C mass is**, matching the inventory's advice to optimise for
big functions: 772 functions of ≥2 KB hold 4,317,145 x86 bytes and produce
**222 MB — half the total C** — at 51.5 C bytes per x86 byte, while the
14,992 functions under 128 bytes run at 64.6.

### 11.5 Function-start set actually used

`--ghidra-functions output/recomp/export/functions.jsonl` plus
`--fragments-tsv output/recomp/export/recovered-functions.tsv`. Derived
counts I use in extrapolations, stated so they are not silently adopted:

- **14,211 real function entries** (Ghidra, prologue-filtered). I use this,
  not the census's 29,392 and not Ghidra's raw 24,170.
- **6,112 (43%)** of those real entries are never the target of a direct
  call — reachable only through vtables and function pointers. That is the
  population the address→funcref dispatch table must cover.
- **557 real functions of ≥2 KB hold 2,822,499 bytes — 49%** of all real
  function bytes. Emitter effort belongs on the big ones.
- 2,571 real entries carry SEH.

Identity addressing (guest VA == wasm linear-memory offset) is now
load-bearing beyond convenience: the renderer uses client-side vertex
arrays (`glVertexAttribPointer`/`glDrawElements` with raw caller pointers,
no `glGenBuffers` anywhere), so guest pointers are handed straight to the
GL layer. **Do not introduce a base offset.**

## 12. Round 3: dynamic dispatch, x87, and the residual

### 12.1 VA → wasm function: measured, and binary search is disqualified

Identity addressing means a guest code pointer *is* a VA, so every dynamic
indirect call must map a 32-bit VA to a wasm function index. Measured in
wasm over the real 21,375-entry set, 2.6 M lookups, VAs drawn from the
actual entry set in xorshift order (`scripts/recomp/lift/bench_dispatch.c`):

| strategy | memory | ns/lookup | net of 1.99 ns array-read baseline |
|---|---|---|---|
| A sorted binary search | 86 KB | **81.33** | 79.3 |
| B direct-mapped `uint16` over `.text` | **14.2 MB** | **3.98** | **2.0** |
| C open-addressed hash, 2^15, Knuth mult | 196 KB | 10.23 | 8.2 |
| C′ same, 2^16 + murmur3 finalizer | 384 KB | **6.92** | 4.9 |
| `call_indirect` alone | — | 4.57 | 2.6 |
| **B + `call_indirect` (the real cost)** | | **≈ 4.6** | |

**Binary search is disqualified**: 81 ns per virtual call, in a C++ game
that dispatches constantly, is the difference between shipping and not.
The direct-mapped table costs 14.2 MB of linear memory and **≈ 2 ns**;
with the `call_indirect` that follows, a dynamic indirect call costs
**≈ 4.6 ns**, against ~2.6 ns for a static one. That is inside the
"tens of nanoseconds is fine" bar with an order of magnitude to spare.

The table must stay byte-granular: only 75.7% of entries are 16-byte
aligned and **13.0% are not even 2-byte aligned**, so a 4-byte-granular
table needs a hash for the 4,004 unaligned entries and ends up *slower*
(7.16 ns) than the flat one. If 14.2 MB is ever unacceptable, the 384 KB
murmur hash at 6.92 ns is the fallback — not binary search.

Better still and not yet built: every one of the 14,666 code pointers in
data is reloc-listed, so the loader could **rewrite each slot from VA to
dense id at image-load time**, making dispatch a bare `call_indirect` with
no lookup at all. Left as a documented optimisation because it breaks any
code that compares or arithmetically manipulates function pointers, and I
have not proven this binary does not.

### 12.2 A virtual call through a real `.rdata` vtable — end to end

`scripts/recomp/lift/vtable_test.c`. Not a static argument: the PE regions
are copied to their real VAs in linear memory, and mechanically lifted code
reads a genuine vtable out of `.rdata`.

Call site is the real MSVC thiscall dispatcher at `0x006ee110`
(`mov ecx,[esi+0x590]; mov eax,[ecx]; call [eax+0x28]`). Two different real
vtables are pointed at it:

```
  [0x00b81270+0x28] = 0x009f3140      xor eax,eax ; ret
  [0x00b812b8+0x28] = 0x009f3160      mov eax,[ecx+0x48] ; ret
```

```
  vtbl 0x00b81270 -> EAX=0x00000000 expect=0x00000000  tail=1  PASS
  vtbl 0x00b812b8 -> EAX=0xcafebabe expect=0xcafebabe  tail=1  PASS
  vtbl 0x00b812b8 -> EAX=0x12345678 expect=0x12345678  tail=1  PASS
  RESULT: ALL PASS
```

Same call site, same object layout, different vptr → different lifted
override, with the value read out of the object by the second override.
The dispatch really does select on vtable contents, and the tail `jmp` to
`0x006acb00` fires. **C++ virtual dispatch works under static
recompilation.**

This also validates the production memory layout: built with
**`-sGLOBAL_BASE=13631488`** (0xD00000), which puts emscripten's data,
stack and heap above the image so guest VAs `0x00400000–0x00CFE000` are
addressable linear memory. Identity addressing is not a prototype
convenience — it links.

### 12.3 The residual: what a dynamic call can reach and we have not lifted

Recovered independently from the PE relocation table
(`scripts/recomp/lift/codeptrs.py`): **14,666 code pointers in data** —
11,420 in `.rdata`, 3,246 in `.data` — exactly matching the census count.
11,097 distinct targets.

| | count | |
|---|---|---|
| distinct targets that ARE a lifted entry | **8,989** | 81.0% |
| distinct targets NOT lifted | 2,108 | |
|   mid-function (inside a known body) | 43 | |
|   outside every known function body | **2,065** | |

Restricted to the 222 **vtable-shaped runs** (≥ 3 consecutive 4-byte-strided
pointers = 6,415 slots), which is what a virtual call actually reaches:

| | count | |
|---|---|---|
| slots whose target is lifted | **5,985** | **93.30%** |
| slots whose target is not | 430 | 80 distinct targets |

**The 2,065 non-vtable misses are not dispatch targets at all.** Their
first instruction is `lea ecx,[ebp-0x2c]` / `mov ecx,[ebp-0x14]` —
mid-frame code using the parent's frame pointer, i.e. **C++ EH funclets**,
not functions. All 3,978 slots pointing at them live in `.rdata` with a
dominant stride of **8** (a two-dword table, consistent with an MSVC
`__ehfuncinfo` unwind map), and only 10.8% sit in a vtable-shaped run.
They are reachable only through `__CxxFrameHandler3`, which is imported
from VCRUNTIME140 and is not code we lift. They are, however, most of the
3.82% `.text` coverage gap.

**The 80 unlifted vtable targets are real functions Ghidra missed** — tiny
C++ virtual accessors that nothing calls directly:

```
  0x005ccc00 x74   xor al, al ; ret
  0x0042bc90 x48   ret 8
  0x006a80c0 x29   xor al, al ; ret 8
  0x009f3130 x24   fldz ; ret
  0x0042bc00 x19   mov al, 1 ; ret 4
  0x00a9ff60 x10   fld dword ptr [ecx + 0x38] ; ret
```

Only 6 of the 80 are in the Ghidra inventory at all. So the fix is
mechanical and was applied: **feed the code-pointer targets back as
function starts.** The union set is 26,241 entries (24,170 inventory rows
+ 2,071 targets the inventory never knew about).

### 12.4 The 73 lift failures, named exactly

| x86 instruction | count | why |
|---|---|---|
| `pmovsxwd` | 18 | 16-byte SSE varnode arithmetic |
| `pandn` | 6 | wide `INT_NEGATE` |
| `pmulld`, `pmaddubsw`, `psrad` | 3 each | wide arithmetic / wide `INT_SRIGHT` |
| `maxps`, `vpcmpeqb`, `vpinsrd` | 2 each | 16- and **32-byte** (AVX) varnodes |
| `pshufb`, `pabsd`, `minps`, `vcvttss2usi`, `vcvttsd2usi`, `vcvttpd2uqq` | 1 each | SSSE3 / AVX-512 |
| `lds` | 1 | 6-byte far-pointer load — data misdecoded as code |
| SLEIGH `BadDataError` (body could not be decoded) | 22 | |

Every one is a wide-varnode arithmetic path, and **44 of the 73 sit at
VA ≥ 0xA00000 — the CRT / vendor tail.** That code is a `/MD` import
surface we are replacing with musl/emscripten, so most of these never need
to lift at all. The 27 in game code (0x500000–0x8FFFFF) do, and they need
the same thing: elementwise lowering for 16/32-byte `INT_*` ops. Mechanical,
not a design problem.

### 12.5 The x87 model, stated plainly

`ST0..ST7` are 10-byte SLEIGH registers. **The model stores an IEEE-754
binary64 in the low 8 bytes and zeroes the top two**; every `FLOAT_*` op
goes through C `double`. This is the same tradeoff remill makes
(`typedef double native_float80_t`).

Measured over the 24,170 inventory bodies: **655 functions use x87** (589
game, 66 CRT tail), **4,670 x87 instructions**, of which:

| | count | share |
|---|---|---|
| `fstp` + `fld` (load / store) | **4,205** | **90.0%** |
| arithmetic (`fmul` `fadd` `fdiv` `fsub` `faddp` …) | ~400 | 8.6% |
| `fld1` / `fldz` constants | 41 | |

What this means for the Lua boundary, which is the hot path:

- **`fld m64` → `fstp m64` is bit-exact under this model.** A `lua_Number`
  returned in `st(0)` and stored back to memory as a double round-trips
  with zero loss. That is exactly the 90% case.
- `fld m32` → `fstp m32` is likewise exact (float→double→float is exact).
- `fld m80` / `fstp m80` (true `long double`): **zero occurrences** in this
  binary, so the 64-bit-mantissa format is never actually materialised.
- `lua_Integer` returns in `edx:eax`, which are two ordinary registers in
  the `CpuState` — no modelling issue at all.

**Where it is lossy**: an arithmetic *chain* that hardware would have kept
at 64-bit mantissa between operations. On real x86 that does not happen
here either, because MSVC's CRT startup sets the x87 precision control to
53-bit (`_PC_53`), making the hardware round to double at every step — and
I measured that **this binary never executes `fldcw` inside a real function
body** (the 9 hits from a linear sweep are all data misdecoded as code; a
sweep restricted to Ghidra bodies finds 2, both with implausible operands
like `[ebx - 0x5425cc00]`). So the game never changes the precision it is
given, and in our port we are the one who gives it — the CRT is a DLL we
replace. The remaining honest gap is the **15-bit exponent range**:
overflow and underflow thresholds differ from binary64 at the extremes.
Marked as a known deviation, not measured against the oracle yet.

### 12.6 Closing the residual: code pointers as function starts

The 80 unlifted vtable targets and the 2,071 addresses the inventory never
knew about are all reachable evidence of function entries, so the start set
became the **union of the Ghidra inventory and every code pointer stored in
data** (26,241 entries).

| | round 2 (`gabs`) | **round 3 (`gu`)** |
|---|---|---|
| functions emitted | 21,375 | **23,381** (73 failed) |
| `.text` covered | 96.18% | **96.44%** |
| C emitted | 440.4 MB | 441.8 MB |
| **vtable slots whose target is lifted** | 5,985 / 6,415 (93.30%) | **6,408 / 6,415 (99.89%)** |
| all code-pointer targets lifted | 8,989 / 11,097 (81.0%) | **11,059 / 11,097 (99.66%)** |
| import shims bound | 587 | 591 |

**Seven vtable slots (6 distinct targets) out of 6,415 remain unlifted.**
That is the residual the coordinator asked for: after the dispatch table is
built, a virtual call has a 0.11% chance of reaching a target we do not
have, and each one is a named address that can be triaged by hand.

### 12.7 Byte-balanced translation units

`--split-bytes` replaces `--split N-functions`. Body sizes span 37 B (p50)
to 63,810 B, so splitting on count produced one 49.6 MB TU that alone took
247 s and 1.46 GB — half the build's critical path.

| | count-split (`gabs`) | **byte-split (`gu`)** |
|---|---|---|
| TUs | 45 | 37 |
| TU size min / median / **max** | — / — / **49.6 MB** | 3.6 / 12.3 / **12.5 MB** |

The largest TU shrank **4×**. Compile is already parallel, so this mostly
cuts peak memory and the tail latency of the slowest job.

### 12.8 Oracle replay at scale — a partial result, reported as such

`oracle_replay.py` + `oracle_replay.c` + `oracle_replay.mjs`: pick leaf
functions (no calls of any kind, so the module is self-contained), pull
`pure_only` vectors, replay each one in wasm, compare. **7,189 vectors
across 194 functions replay in a few seconds**, so this scales to the whole
binary — the mechanism works and it is the right correctness engine.

The result is **not yet a lifter accuracy number**, and it would be
dishonest to present it as one:

| comparison | functions passing |
|---|---|
| every register + `esp_delta` + memory writes | **74 / 194 (38.1%)** |
| EAX + `esp_delta` + memory writes only | **104 / 194 (53.6%)** |

Failure kinds at the looser setting: EAX 49, wasm trap 22, memory writes 18.

**Known harness gap, not (necessarily) a lifter gap.** The stable vector
schema exposes only `ecx`, `edx`, `stack` and `mem` as *inputs*, but
reports `ebx/esi/edi/ebp` as *outputs*. For a callee-saved register the
expected output is the oracle's own entry value, which the contract does
not publish — so my harness starts them at zero and every preserving
function mismatches. Tightening from EAX-only to all-registers costs
exactly 30 functions, which is that effect. The 22 traps are very likely
the same cause one step further on: a function that uses the caller's EBP
for locals dereferences `0 - 0x10`.

Three things this exercise did establish, all of them real:

1. **The replay harness found two bugs in itself before it found any in the
   lifter** — a field-by-field stream parser that drifted one dword and
   silently corrupted every later record (fixed by making the format
   length-prefixed and self-delimiting), and an incorrect guest frame
   (the oracle's stack top is `0x30001000`, entry ESP `0x30000FFC`, args at
   ESP+4 upward). Both produced confident, wrong numbers first.
2. **The guest image must not be lifted without being loaded.** Before
   `orc_load_image` existed, every vector trapped, because pointers read
   out of `.data`/`.rdata` were zero and the first dereference went out of
   bounds. Obvious in hindsight; it is the kind of thing a static argument
   never surfaces.
3. **Host-side state must live outside guest reach.** Running many vectors
   in one process, a lifted function's wild write corrupted the dispatch
   table itself: 1,429 vectors reported "not in module" purely as cascade
   damage, and running one vector per function made that number zero. In
   the real port the dispatch table, the CpuState and every host structure
   sit in the same wasm linear memory as the guest. **They need to be
   placed above the guest's plausible address range, or the first wild
   pointer in 7 MB of lifted code takes down the runtime rather than the
   guest.** That is an architecture requirement this exercise produced and
   nothing else would have.

**Next step, and it is cheap**: ask the oracle workstream to publish the
full entry register state (or to document a fixed seed for
`ebx/esi/edi/ebp`). That single field turns this from a 53.6% number with a
known confound into a real per-function accuracy figure over thousands of
functions.

## 13. Round 4: integration — the lifted module boots

First time any of this has run together. Lifted module (23,381 functions,
96.44% of `.text`) + host layer (`scripts/recomp/host/`, 8 TUs) + the
2.83 MiB segmented memory image, linked into one wasm module and executed.

```
python scripts/recomp/lift/mkstubs.py    --dir output/recomp/lift/gu --no-import-stubs
python scripts/recomp/lift/mkdispatch.py --dir output/recomp/lift/gu
emcc -O2 <39 lifted .o> <8 host .o> -sGLOBAL_BASE=268435456 \
     -sINITIAL_MEMORY=402653184 -sALLOW_MEMORY_GROWTH=1 -sSTACK_SIZE=1048576
node output/recomp/lift/boot/boot_integration.mjs \
     output/recomp/host/isaac.segs.bin main
```

**It links: 38,180,576 bytes, zero unresolved symbols.**

### 13.1 The first blocking VA

```
0x00aefa02   call 0xaf0645          ; -> jmp [0x00b18890] -> _set_app_type
```

- **Call site `0x00aefa02`**, inside `FUN_00aef9ff`.
- `FUN_00aef9ff` is **XI initialiser #2** — `[0x00b18c14] = 0x00aef9ff` — so
  the boot path got into the C static-initialiser table and the second
  entry is `__scrt_common_main_seh`'s startup helper.
- The host reports `0x00aefa07`, which is the *return address* the `call`
  pushed, not the call site. Both are useful; the instruction is at
  `0x00aefa02`.
- Reason: `api-ms-win-crt-runtime-l1-1-0.dll!_set_app_type`, verdict REAL,
  1 measured call site, **not implemented yet**. It is a host gap, not a
  lifter gap.

Everything before it worked, on real game code:

| step | result |
|---|---|
| place memory image | **50 segments** from `isaac.segs.bin` |
| layout check | **OK** (see 13.2) |
| verify placed image | OK |
| relocations | skipped (preferred base) |
| bind IAT | **622 / 622 slots**, 0 outside image |
| install fake TEB/PEB | `fs:[0]` chain head `0xFFFFFFFF` |
| **run TLS callback** | **`0x00aefec1` ran to completion** |
| `_initterm` XI | entered, blocked in entry #2 |

**The TLS callback at `0x00aefec1` is the first real, mechanically lifted
game code to execute end to end in this project**, through the host's IAT
binding and the dispatch table, and it returned normally.

`__RTDynamicCast` is not the wall yet — nothing gets far enough to reach
it. The wall is the CRT startup import surface, which is small and known.

### 13.2 Memory layout: verified in the running module

Adopted the host layer's map (`isaac_host.h`) rather than my earlier
`GLOBAL_BASE=13631488`, which put host state only 8 KiB above the image
end — one `.data` overrun from the runtime. Printed by
`isaac_layout_check()` from inside the linked module:

```
  image           0x00400000 .. 0x00cfe000
  guest heap      0x00d00000 .. 0x0cd00000
  guest stack top 0x0dff0000
  fake TEB        0x0e000000
  shim tokens     0x0f000000 .. 0x0f0026e0     (622 imports x 16)
  guard           0x0ff00000 .. 0x10000000     (1 MiB)
  host static     0x100387e4                   GLOBAL_BASE = 0x10000000
  host malloc     0x1013c7f8
  dispatch entries 23381
  layout OK
```

Guest regions are contiguous and low; every host byte is above a 1 MiB
guard. **Identity addressing is untouched** — the image is still real
linear memory at `0x00400000`, which is the whole reason the model works.
The guard is armed with a position-dependent pattern at boot and checked
after every stage; **intact after boot**. No address is hardcoded in the
lifter's integration code — it all comes from `isaac_host.h` macros, so a
later boundary move needs no change here.

### 13.3 The critical path to `main`, in order

One blocking VA is a fact; the ordered list of everything that blocks is a
work queue. `scripts/recomp/lift/mksurvey.py` generates a **survey build**:
strong overrides for the 601 imports the host has not hand-written, each
logging its symbol and guest call site once and then performing the
callee's own return using the host's **measured `arg_bytes`** — `ret 0` for
cdecl, `ret N` for stdcall — so the guest stack stays synchronised while
only the semantics are faked.

**This is a survey and its later entries are not trustworthy.** After the
first faked return the guest's state is a lie, so anything downstream may
be a consequence rather than a cause. The *order in which imports are first
demanded* is real evidence, and that is all it is offered as.

Result — the boot path demands exactly these, in this order:

| # | import | call site (ret) | conv | args | sites |
|---|---|---|---|---|---|
| 1 | `_set_app_type` | `0x00aefa07` | cdecl | 0 | 1 |
| 2 | `_set_fmode` | `0x00aefa12` | cdecl | 0 | 1 |
| 3 | `__p__commode` | `0x00aefa1e` | cdecl | 0 | 1 |
| 4 | `_crt_atexit` | `0x00aef596` | cdecl | 0 | 1 |
| 5 | `_configure_narrow_argv` | `0x00aefa4b` | cdecl | 0 | 1 |
| 6 | `InitializeSListHead` | `0x00aef955` | stdcall | 4 | 1 |
| 7 | `_controlfp_s` | `0x00af0524` | cdecl | 0 | 1 |
| 8 | `_configthreadlocale` | `0x00aefa84` | cdecl | 0 | 1 |
| 9 | `_initialize_narrow_environment` | `0x00aefa93` | cdecl | 0 | 1 |
| 10 | `InitializeCriticalSectionAndSpinCount` | `0x00aef1a3` | stdcall | 8 | 1 |
| 11 | `GetModuleHandleW` | `0x00aef1ae` | stdcall | 4 | 5 |
| 12 | `IsProcessorFeaturePresent` | `0x00af0256` | stdcall | 8 | 4 |
| 13 | `memset` | `0x00af027b` | cdecl | 0 | **444** |
| 14 | `IsDebuggerPresent` | `0x00af0322` | stdcall | 0 | 1 |
| 15 | `SetUnhandledExceptionFilter` | `0x00af0342` | stdcall | 4 | 3 |
| 16 | `UnhandledExceptionFilter` | `0x00af034c` | stdcall | 4 | 2 |

**All sixteen are CRT startup, and fifteen of them have a single-digit
call-site count.** None is a graphics, audio, Steam or Lua entry point.
`memset` is a musl forward. This is the entire critical path between a
linked module and `main`, and it is a day of host work, not a research
problem.

After #16 the survey stops on a different kind of blocker: the guest
executes `int 3`, which reaches the lifter's `swi` CALLOTHER intrinsic and
aborts. That is almost certainly **survey-induced** — faking
`IsDebuggerPresent` / `SetUnhandledExceptionFilter` /
`UnhandledExceptionFilter` walks the CRT into its `__scrt_fastfail` /
`__report_gsfailure` path, which ends in a deliberate breakpoint. It is
exactly the class of downstream artefact the survey warns about, and it is
why the strict build traps at #1 instead.

Two things the survey settles regardless:

- **`__RTDynamicCast` is not the wall yet.** It never appears. Nothing gets
  far enough. The wall is the CRT startup import surface above it.
- **`__CxxFrameHandler3` is not demanded either**, consistent with the
  independent finding that all 1,833 of its references are `jmp` tails of
  `__ehhandler$` trampolines and none is on a normal path.

### 13.4 Two integration bugs found by linking, not by reasoning


1. **Duplicate weak symbols.** Both layers emitted
   `__attribute__((weak)) imp_<stem>__<symbol>` for the same 591 imports.
   Two weak definitions do not collide — the linker silently picks one,
   and picking mine would have replaced the host's informative trap (which
   names the DLL, symbol, stdcall argument bytes and call-site count) with
   a bare abort. `mkstubs.py --no-import-stubs` now omits them entirely for
   integrated builds. Neither layer was wrong on its own; the defect only
   exists in the pair.
2. **The cdecl placeholder is gone.** `mkstubs.py` used to emit
   `s->EIP = MEMR32(s->ESP); s->ESP += 4;` for every import — correct for
   263 cdecl imports, wrong for 315 stdcall ones, and wrong *silently*: the
   guest stack ends up short by the argument bytes and every later frame is
   garbage. All placeholders now abort and name the symbol. A module that
   runs without its host layer should fail immediately, not drift.

## 14. Round 5: past CRT startup, into condition-variable detection

Rebuilt against the host layer with the 16 startup imports implemented
(`host_shims_crtstartup.c`) plus `__RTDynamicCast`, the guest heap arena
and the guarded `memset`. Strict build, no faking.

### 14.1 The new stopping point

```
0x00aef20b   push 7
0x00aef20d   call 0xaf0244        ; noreturn: fatal-exit path
0x00aef212   int3                 ; ExceptionAddress recorded here
```

Trap is reported at `0x00af0346` (returns to `0x00af034c`) —
`kernel32.dll!UnhandledExceptionFilter`, which the host deliberately traps
because there is no honest return value. **That is the messenger, not the
cause.** The host's exception dump names the cause:

```
[isaac][k32] UnhandledExceptionFilter(0x0dfedfc0) -- an exception escaped every handler.
[isaac][k32]   code 0x40000015 flags 0x00000001 at 0x00aef212, 0 parameters
```

`0x40000015` is `STATUS_FATAL_APP_EXIT` — the CRT deliberately aborting.

**Root cause: `FUN_00aef191`, the CRT's condition-variable feature
detection.** Fully disassembled:

| VA | instruction | outcome |
|---|---|---|
| `0x00aef19d` | `call [0xb181b4]` `InitializeCriticalSectionAndSpinCount` | ok |
| `0x00aef1a8` | `call [0xb18240]` `GetModuleHandleW(L"api-ms-win-core-synch-l1-2-0.dll")` | **NULL** |
| `0x00aef1b9` | `call [0xb18240]` `GetModuleHandleW(L"kernel32.dll")` | **NULL** |
| `0x00aef1c3` | `je 0xaef20b` | **taken -> fatal exit** |
| `0x00aef1cb` | `call [0xb182b0]` `GetProcAddress(h, "SleepConditionVariableCS")` | not reached |
| `0x00aef1d9` | `call [0xb182b0]` `GetProcAddress(h, "WakeAllConditionVariable")` | not reached |
| `0x00aef1fc` | `call [0xb181a4]` `CreateEventW(0,1,0,0)` | not reached — the fallback |
| `0x00aef20b` | `push 7; call 0xaf0244` | fatal exit |

**The single decision that stops the boot is `GetModuleHandleW(L"kernel32.dll")`
returning NULL at `0x00aef1b9`.** Returning NULL for the api-set DLL is
fine — the code is written to fall back — but returning NULL for
`kernel32.dll` too leaves it no path except abort.

The fix chain, in order, is fully determined by the disassembly:

1. `GetModuleHandleW(L"kernel32.dll")` returns a non-NULL pseudo-handle.
2. `GetProcAddress` for `"SleepConditionVariableCS"` / `"WakeAllConditionVariable"`
   may return NULL — the code checks both and falls through to `0x00aef1f5`.
3. `CreateEventW(NULL, TRUE, FALSE, NULL)` must return non-NULL, or the
   same `0x00aef20b` abort fires from one branch later.

That is three imports, and the binary itself specifies exactly what each
must do. Nothing here is a lifter problem.

### 14.2 What now works that did not

| | |
|---|---|
| 16 CRT startup imports | all execute, none trap |
| `_initterm` XI entry #2 (`FUN_00aef9ff`) | **completed** |
| progress inside XI | reached `FUN_00aef191`, several frames deeper |
| `__RTDynamicCast` | never reached — still not the wall |
| guard after the longer run | **intact** |
| `memset` guard / heap arena | not tripped |

Two of the host's honestly-partial shims reported their limits out loud
during the run, exactly as designed, and neither was fatal:

```
[isaac][crt] _controlfp_s(new=0x10000, mask=0x30000) asks to change the FP
             control word ... wasm has no x87 control word (caller 0x00af0524)
[isaac][k32] GetModuleHandleW("api-ms-win-core-synch-l1-2-0.dll") -> NULL
```

The `_controlfp_s` line is worth pairing with §12.5: the caller is
requesting `_PC_24`/`_PC_53` precision control, and this binary never
executes `fldcw`, so the request cannot be honoured and does not need to
be. The host logging it rather than silently ignoring it is what makes
that checkable.

**`_initterm` did not complete.** 121 static initialisers remain the
milestone; the run gets into the C table (XI) and dies inside its second
entry's callee tree, before the C++ table (XC) is reached at all.

**Heap high-water mark: not available.** `isaac_heap_report()` is wired
into the driver but the run traps before `main`, so no allocation traffic
of consequence has happened. The 64.0 MiB floor / 262.1 MiB ceiling band
stands unrefined.

### 14.3 The next work queue — and why it is static this time

**The survey build produced nothing new**, and that is the correct
outcome rather than a failure. It overrides only imports the host has NOT
hand-written; the blocker is `UnhandledExceptionFilter`, which the host
implements *and deliberately traps*, and the true cause is
`GetModuleHandleW` deliberately returning NULL. Faking either would mean
overriding a considered host decision from the outside — exactly the
"two mechanisms that happen to disagree" failure this project keeps
finding. So the dynamic technique is out of road until the host changes
that answer.

`scripts/recomp/lift/initterm_queue.py` gives the queue statically
instead: walk the direct-call graph from all **121** `_initterm` entries
and report every IAT import reachable, ordered by call depth.

**It over-approximates on purpose** — a call site on a branch never taken
still counts, and indirect calls are invisible to it. It is a priority
list, not an execution trace. 321 functions within depth 6, **67 distinct
imports**.

Depth 0 — called directly from an initializer body:

| import | table | site | measured sites |
|---|---|---|---|
| `strncpy` | XC | `0x0040688e` | 73 |
| `FlsSetValue` | XI | `0x00ae9a9e` | 7 |
| **`SteamAPI_RegisterCallback`** | XC | `0x0040697e` | 5 |
| `FlsAlloc` | XI | `0x00ae9a73` | 2 |

Depth 1 — the immediate next tranche, minus the 16 already done:

`GetProcAddress` (12 sites), `__stdio_common_vsprintf` (10),
`GetStdHandle` (2), `WriteConsoleA` (2), `CreateEventW` (1),
`__setusermatherr` (1), `_set_new_mode` (1), `_libm_sse2_sin_precise` (26),
`_invalid_parameter_noinfo_noreturn` (1458).

Depth 2 — the allocator and string core: `memset` (444), `memmove` (306),
`free` (283), `memcpy` (272), `malloc` (134), `?_Xlength_error@std@@YAXPBD@Z`
(38), `CloseHandle` (13), `GetCurrentProcess` (10), `LoadLibraryA` (9),
`toupper` (6), `_initialize_onexit_table`, `GetEnvironmentVariableA`,
`OpenProcessToken`, `strtol`, `GetSystemInfo`, `LookupPrivilegeValueA`,
`AdjustTokenPrivileges`, `GetLargePageMinimum`.

Depth 3-6 — `strstr`, `InitializeCriticalSection`, `strncpy_s`,
`QueryPerformanceCounter`/`Frequency`, `strcat_s`, `BCryptGenRandom`,
`_register_onexit_function`, `_CxxThrowException` (72),
`strncmp`, `GetLastError`, `VirtualAlloc`/`Free`/`Query`,
`OutputDebugStringA`, `Enter`/`Leave`/`TryEnterCriticalSection`, `Sleep`,
`TerminateProcess`, `GetNumaHighestNodeNumber`.

Three observations that change priorities:

1. **`SteamAPI_RegisterCallback` is a depth-0 static initializer.** A C++
   global constructor registers a Steam callback before `main`. Steam is
   not a late-stage concern that can be deferred behind the renderer.
2. **`LoadLibraryA` / `GetProcAddress` appear at depth 2 / 1.** Combined
   with the `GetModuleHandleW` blocker, the CRT and the game both do
   runtime feature detection, so the host needs a coherent story for
   "module handles and exported symbols" rather than per-call answers.
3. **`_CxxThrowException` at depth 4 with 72 sites.** C++ exceptions may
   be reachable during initialisation after all, which is a different
   claim from §5.3's "`__CxxFrameHandler3` is never on a normal path" —
   throwing and unwinding are separate mechanisms. Worth an early check.

### 14.4 Guard and heap

The guard held through both the strict and survey runs of the deeper boot:
**intact**, 0 corrupted words of the 262,144 checked, after 622 IAT binds,
a TLS callback and several frames of real CRT initialisation.

**Heap high-water mark: still unavailable.** `isaac_heap_report()` is
wired into the driver, but the run traps inside XI before any meaningful
allocation, so there is no number to report and the 64.0 MiB /
262.1 MiB band stands unrefined. It will come from the first run that
reaches `main`.

## 15. Round 6: the module layer clears the CRT, into the last XI entry

Rebuilt against the host layer with module handles, `GetProcAddress`
returning shim tokens, `CreateEventW`, and the depth-0/1 queue.

### 15.1 `_initterm` did NOT complete — but the CRT wall is gone

Stated plainly, because it is the milestone that was asked about: **the
121 static initialisers did not finish.** XC's 117 C++ entries were never
reached. What did happen:

- **XI entries 1-3 completed.**
- The run is inside **XI entry #4** — `[0x00b18c20] = 0x00ae9a40`, the
  `FlsAlloc`/`FlsSetValue` initialiser from the depth-0 queue — three call
  levels down at `FUN_00aea110`.

`FUN_00aef191`, last round's blocker, **now passes**. The module layer
behaved exactly as designed and the CRT took the fallback it was always
written to take:

```
[isaac][mod] 29 modules resolvable (EXE + 28 import DLLs); handles 0x0e010000..0x0e02d000
[isaac][mod] GetModuleHandleW("api-ms-win-core-synch-l1-2-0.dll") -> NULL  not one of the 29
```

`kernel32.dll` resolved, `GetProcAddress` returned NULL for both condition
-variable symbols, the code fell through to `CreateEventW`, and execution
continued past the function that aborted last round. **Making the rule
produce the blocker rather than special-casing it worked.**

### 15.2 The new stopping point

```
0x00aea116   lea eax, [ebp-8]
0x00aea119   push eax
0x00aea11a   call dword ptr [0xb18238]     ; kernel32!QueryPerformanceCounter
0x00aea120   mov eax, [ebp-8]              ; <- seeds a hash from the counter
```

- **Call site `0x00aea11a`** (host reports it correctly, with the return
  address `0x00aea120` alongside).
- IAT slot `0x00b18238`, `kernel32.dll!QueryPerformanceCounter`,
  **verdict=PROVIDED, 8 measured call sites** — classified as forwardable,
  not yet forwarded.
- Owner `FUN_00aea110`, reached from XI #4 `FUN_00ae9a40` at depth 3 via
  `FUN_00aea6b0`. Its body is a `lowbias32`-style avalanche
  (`imul 0x7feb352d`, `imul 0x846ca68b`) over the counter value — a seed
  generator, so a monotonic counter is all it needs.

`QueryPerformanceFrequency` (5 sites) sits at the same depth in the static
walk and should be done in the same change.

### 15.3 The module report is clean

```
[isaac][mod]   29 modules resolvable
[isaac][mod]   3 distinct NULL results:
[isaac][mod]          1 x  module not present: api-ms-win-core-synch-l1-2-0.dll
[isaac][mod]          1 x  kernel32.dll!SleepConditionVariableCS not provided
[isaac][mod]          1 x  kernel32.dll!WakeAllConditionVariable not provided
```

**All three are deliberate probes whose NULL the caller handles**, and the
disassembly in §14.1 proves it: the api-set miss drives the
`GetModuleHandleW(L"kernel32.dll")` retry, and the two missing symbols
drive the `CreateEventW` fallback at `0x00aef1f5`. **Zero unexplained
gaps.** The report is a to-do list that is currently empty, which is the
right shape for it to have.

### 15.4 Heap and guard

**Heap high-water: 0 bytes. 0 allocations, 0 frees.** The run still stops
before any allocation of consequence, so the 64.0 MiB floor / 262.1 MiB
ceiling band is **unrefined** and the 242 MiB reservation still cannot be
narrowed on evidence. `isaac_heap_report()` is wired in and printing; it
needs a run that reaches `main`.

**Guard: intact.** 0 of 262,144 words corrupted, now across a run that
resolves 622 IAT slots, executes a TLS callback, completes three static
initialisers and descends three frames into a fourth.

### 15.5 Still unverified, and why this run says nothing about it

`_libm_sse2_*_precise`'s XMM0 register convention is flagged UNVERIFIED
by the host layer. **This run provides no evidence either way**: those 26
sites are all in the XC table, and XC is never reached. The first run that
completes XI and enters C++ global construction is the one that will
exercise them.

Likewise `_CxxThrowException` (72 sites, depth 4): not reached, so the
"throw is plausible during initialisation even though unwind is not"
question stays open.

## 16. Round 7: the first lifter-side failure

Rebuilt against the host layer with the 371-trap sweep, deterministic
timing and the module layer.

### 16.1 `_initterm` still did not complete — and the failure changed kind

Plainly: **no. XC's 117 C++ entries were never reached.** But the failure
is now a different species, and that is the news.

`QueryPerformanceCounter` works, so `FUN_00aea110` (the QPC seed hash) and
everything above it now pass. Execution continues into
`FUN_00ae9cc0 -> FUN_00aea190 -> FUN_00aea6b0 -> FUN_00aea1b0 ->
FUN_00aea2a0`, and there it stops with a **raw wasm trap — "memory access
out of bounds" — inside lifted code**, not a host trap:

```
at boot.wasm.sub_00aea2a0  wasm-function[14759]
at boot.wasm.sub_00aea1b0  wasm-function[14758]
at boot.wasm.sub_00ae9cc0  wasm-function[14785]
```

**This is the first blocker in six rounds that is not a missing host
import.** Every previous one was "the host has not written this yet". This
one is the lifted code computing a pointer it should not have.

`FUN_00aea2a0` is **ChaCha20** — the `rol 16 / 12 / 8 / 7` quarter-round
pattern is unmistakable, over a 64-byte state copied in with four
`movups`. It is the CRT's internal RNG block function, refilled by
`FUN_00aea1b0` when its counter at `[esi+0x80]` runs out, and reached
because `FUN_00ae9cc0` reads `fs:[0x18]` (the TEB self-pointer) and
initialises the generator.

### 16.2 Bounds-checked lifted code, and instruction-level attribution

A wasm OOB trap names a function and nothing else. Two additions fix that,
both off by default and free in a normal build:

- **`-DRECOMP_MEM_CHECK=1`** makes every `MEMR*`/`MEMW*` validate the guest
  address against `[0x1000, ISAAC_HOST_BASE_VA)` and report width and
  direction before aborting.
- **`emit.py --trace-va`** emits `RECOMP_VA(addr)` before every
  instruction. `RECOMP_VA` expands to nothing unless `RECOMP_MEM_CHECK` is
  on, so the normal module is byte-identical; with checking on, a bad
  pointer names the instruction that computed it.

With checking enabled on the owning TU, the failure resolves from "OOB
somewhere in a 662-byte function" to:

```
[recomp][MEM] guest read of 4 byte(s) at 0x00000000 is outside the guest
              address space.
```

**A null-pointer read of exactly 4 bytes.** Not a wild pointer, not a
stack overrun: a dereference of NULL. That rules out the wide-varnode
(`movups`) path, which goes through `memcpy` on a 16-byte span and would
have reported 16 — the faulting access is an ordinary 32-bit load.

Attributing it to a specific guest VA needs the `--trace-va` build of the
whole module, which is what the tooling above exists for.

### 16.3 Symbol-table diff: clean

53 newly-strong host symbols were an opportunity for the duplicate-weak
defect that only exists in the pair. Measured with `llvm-nm` over the
built objects rather than by reading source:

| | |
|---|---|
| host strong symbols | 158 |
| host weak symbols | 625 |
| lifter weak symbols | 70 |
| lifter strong symbols | 11 |
| **host strong overriding a lifter weak** | **2** — `recomp_call_indirect`, `recomp_jump_indirect` (the intended contract) |
| **strong in both layers** | **0** |
| **weak in both layers** | **0** |

Clean. The two overrides are exactly the documented dispatch contract and
nothing else collides.

A different build defect did bite, and it is worth recording because it
cost a full run: the link script carried a **hardcoded object list** and
silently omitted `host_shims_forward.o` when that TU appeared. The run
then reported `QueryPerformanceCounter` as unimplemented when it had in
fact been implemented — a build-system lie that looked exactly like a
host gap. The script now globs and excludes, rather than enumerating.

### 16.4 Heap and guard

**Heap: still 0 allocations, 0 frees, peak 0 bytes.** The ChaCha20 refill
sits before any allocation of consequence, so the 64.0 / 262.1 MiB band is
**still unrefined** after five rounds. It needs XC.

**Guard: intact**, now across a run that additionally clears the module
layer, the deterministic clock and several more CRT frames.

### 16.5 What this run still says nothing about

`_libm_sse2_*_precise` (26 sites, XMM0 convention UNVERIFIED) and
`_CxxThrowException` (72 sites) are both XC-only. XC is not reached, so
**neither has any evidence yet**, and the questions stay open exactly as
they were.

## Appendix: reproduction

```bash
PY=C:/Users/Luca/AppData/Local/hermes/hermes-agent/venv/Scripts/python.exe
$PY -m pip install pypcode          # 3.3.3, vendors Ghidra SLEIGH

# function starts (9.6 s)
$PY scripts/recomp/lift/scan.py tools/isaac-ng.unpacked.exe \
    output/recomp/lift/func_starts.txt

# full lift (173 s)
$PY scripts/recomp/lift/emit.py --exe tools/isaac-ng.unpacked.exe \
    --va-file output/recomp/lift/func_starts.txt \
    --out output/recomp/lift/full --module lifted --split 250 \
    --stats output/recomp/lift/full/stats.json

# build + measure (181 s compile, 42 s link).  Note --opt=-O2 must use '='
# or argparse eats the leading dash.
$PY scripts/recomp/lift/build_wasm.py --dir output/recomp/lift/full \
    --opt=-O2 --jobs 14

# design A/B
$PY scripts/recomp/lift/emit.py ... --state-only     # remill shape
$PY scripts/recomp/lift/emit.py ... --spill-flags    # conservative flags

# --- round 2: the real inventory (this is the pipeline to use) ---
$PY scripts/recomp/lift/emit.py --exe tools/isaac-ng.unpacked.exe \
    --ghidra-functions output/recomp/export/functions.jsonl \
    --fragments-tsv    output/recomp/export/recovered-functions.tsv \
    --imports          output/recomp/census/imports.json \
    --va-file output/recomp/lift/ghidra_all.txt --dispatch auto \
    --out output/recomp/lift/gabs --module lifted --split 500 \
    --stats output/recomp/lift/gabs/stats.json          # 270 s

$PY scripts/recomp/lift/mkstubs.py --dir output/recomp/lift/gabs
$PY scripts/recomp/lift/build_wasm.py --dir output/recomp/lift/gabs \
    --opt=-O2 --jobs 14

# computed-jump classification on its own (jumptables.py is also importable)
$PY scripts/recomp/lift/emit.py ... --dispatch off|auto|all|force
```

Round-2 flags:

| flag | meaning |
|---|---|
| `--ghidra-functions` | function starts + body extents from the headless export |
| `--fragments-tsv` + `--fragments absorb\|split` | fold Ghidra's 9,959 mid-function fragments into their parents (default) or keep them as separate functions |
| `--imports` | bind `call [IAT slot]` to a named host shim |
| `--dispatch off\|auto\|all\|force` | computed-jump handling: trap / only where needed (default) / any function with a computed jump / every function (cost measurement) |

Artifacts: `output/recomp/lift/` (gitignored via the existing `/output/`
rule in `.gitignore` — verified with `git check-ignore -v`).
