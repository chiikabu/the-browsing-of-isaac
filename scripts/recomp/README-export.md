# Bulk export: every function out of `isaac-ng.unpacked.exe`

Stage 1 of the machine-driven decompilation pipeline. One command analyses the binary
with Ghidra headless and then exports, for *every* recovered function:

* a metadata record (`functions.jsonl`),
* Ghidra's decompiled C (`c/**.c`),
* the decompiler's **high P-Code** plus the raw per-instruction **P-Code** (`pcode/**.json.gz`).

The P-Code is the important artifact. It is a typed, SSA-form, machine-readable IR — a
far better input for mechanical lifting to LLVM IR / C than Ghidra's pretty-printed C.

Everything lives under `output/recomp/` (git-ignored via the existing `/output/` rule).

---

## Reproduce

```bash
# from the repo root
node scripts/recomp/export-all.mjs --stage all
```

or one stage at a time (each is independently resumable):

```bash
node scripts/recomp/export-all.mjs --stage analyze   --analyze-heap 10G
node scripts/recomp/export-all.mjs --stage recover   --recover-heap 6G
node scripts/recomp/export-all.mjs --stage inventory --heap 6G
node scripts/recomp/export-all.mjs --stage decompile --threads 8 --timeout 240 --heap 6G --max-functions 4000
node scripts/recomp/export-all.mjs --stage merge
node scripts/recomp/export-all.mjs --stage report
```

Measured wall clock on 16 cores / 32 GB (shared with other work): analyze 22 min 29 s,
recover 4 min 53 s, inventory 23 s, decompile 22 min, merge+report 6 s.

`--max-functions N` on the decompile stage is a *batch size*, not a cap: the driver
relaunches the JVM until the queue drains, so it bounds per-JVM memory and checkpoints
progress every N functions.

Options:

| flag | default | meaning |
| --- | --- | --- |
| `--input` | `tools/isaac-ng.unpacked.exe` | PE to analyse |
| `--ghidra-home` | `$GHIDRA_HOME`, else `~/Tools/ghidra_12.1.2_PUBLIC` | Ghidra install |
| `--project-dir` | `output/recomp/ghidra_project` | Ghidra project location |
| `--project-name` | `IsaacRecomp` | Ghidra project name |
| `--out` | `output/recomp/export` | artifact root |
| `--threads` | `8` | decompiler worker threads (one `DecompInterface` + one `decompile.exe` each) |
| `--timeout` | `180` | per-function decompile timeout, seconds |
| `--heap` / `--analyze-heap` / `--recover-heap` | `10G` / `10G` / `5G` | `-Xmx` for the export / analysis / recovery JVM (`GHIDRA_HEADLESS_MAXMEM`) |
| `--recover-rounds` | `20` | recovery / gap-disassembly rounds per JVM launch |
| `--recover-batches` | `8` | max JVM launches per recovery phase; stops early on convergence |
| `--gap-min-run` | `16` | smallest undefined `.text` run the gap disassembler will try |
| `--max-functions` | `0` (all) | decompile batch size per JVM launch (0 = one launch for everything) |
| `--force` | off | re-run the analyze and recover stages even when their markers exist |
| `--no-c` / `--no-pcode` / `--no-raw-pcode` | on | drop an artifact class |
| `--no-skip-list` | off | decompile the recovered mid-function fragments too (see "raw-P-Code-only policy") |

The driver deliberately uses its **own** Ghidra project (`output/recomp/ghidra_project`)
so it never collides with `re/ghidra_project`, which `scripts/decomp/run-ghidra.mjs` owns.

### Notes on the analysis stage

* Launched via `support/analyzeHeadless.bat` with `GHIDRA_HEADLESS_MAXMEM` set from
  `--analyze-heap` (the batch file defaults to a useless 2G).
* No `-analysisTimeoutPerFile`: analysis must run to completion or the export is wrong.
* Analyzer selection is Ghidra's default set. Two choices matter:
  * **Function ID stays enabled** — the FID bookmark on a function entry is how we tell
    library code from game code (`fid: true` in `functions.jsonl`). On *this* binary it
    finds almost nothing; see "What this binary actually looks like" below.
  * **Decompiler Parameter ID stays disabled** (Ghidra's default). It would add hours,
    and the export stage recovers the same prototypes anyway: every function's
    `HighFunction` prototype is written into its P-Code JSON.
* The stage writes `output/recomp/export/analyze-done.json` with the wall clock and the
  exact command; re-running the stage is a no-op unless `--force` is passed.

### Notes on the recovery stage

Ghidra's auto-analysis found 14,025 functions covering **81.7%** of `.text`. The recovery
stage takes that to **24,170 functions / 96.86%**. It runs in two phases, both iterative,
both convergent:

**Phase A — `RecoverMissingFunctions.java`.** Auto-analysis disassembles far more `.text`
than it attributes to functions: it left **834,760 bytes** of `.text` instructions inside
no function at all, reachable only through jump tables and indirect calls the analyzers
could not resolve. Nothing downstream can export code that is not in a function, so this
creates one at the head of every such run. Each new function's body absorbs part of the
run and exposes the next entry, so it converges over ~35 rounds. Result: +4,035 functions,
uncovered instruction bytes 834,760 -> 50,247.

**Phase B — `DisassembleGaps.java`, then Phase A again.** 484,439 bytes of `.text` were
not even *disassembled*, so there was nothing to attach a function to. Sampling those
regions shows dense, unambiguous x86 (the largest, 22,650 bytes at `0x00653175`, starts
`MOV EAX,[EDI+0x168] / AND EAX,0x20 / JZ ...` with SSE arithmetic throughout — 6.16 bits
of entropy per byte). So this disassembles at the head of every non-padding undefined run,
following flow, and then re-runs Phase A. Result: 6,337 gap heads disassembled and +6,110
more functions.

What is left after both phases, measured by `ReportUncovered.java`:

| `.text` bytes | | |
| --- | ---: | ---: |
| total addressable | 7,430,656 | 100% |
| inside a function body | 7,197,472 | 96.86% |
| instructions in no function | 9,635 | 0.13% |
| defined data | 42,518 | 0.57% |
| undefined — pure `cc`/`90`/`00` padding | 135,610 | 1.82% |
| undefined — anything else | 45,421 | 0.61% |

That last row is the only real frontier left: 45 KB in 3,847 runs, largest 1,929 bytes.

`ReportUncovered.java` is the read-only diagnostic behind these decisions — it writes
`uncovered.tsv` (one row per contiguous uncovered run, with incoming reference counts and
the first two instructions) so every classification above is measured, not guessed.

Caveat, and it matters downstream: only 186 of the 10,145 recovered entries start with a
classic MSVC prologue. The rest are *continuations* — Ghidra split one real function into
several, and the recovery pass names the pieces. Their raw P-Code is real and correct for
the address range they cover, but a "function" flagged `recovered: true` with
`looksLikePrologue = false` in `recovered-functions.tsv` should be treated as a fragment
to be stitched back onto its neighbour, not as a standalone function. Those 9,959
fragments are exactly the set the raw-P-Code-only policy applies to.

---

## Output layout

```
output/recomp/export/
  analyze-done.json          wall clock + exact headless command for the analysis
  recover-done.json          coverage-recovery marker (count + wall clock)
  recovered-functions.tsv    every function the recovery pass created
  recover-parts/             per-batch receipts: part-NN.tsv (functions), gaps-NN.tsv (disassembly)
  uncovered.tsv              diagnostic: .text instruction runs in no function
  ghidra-stats.json          program-wide .text coverage counters
  functions.raw.jsonl        one record per function, straight from Ghidra
  functions.jsonl            functions.raw.jsonl + ZHL names + decompile status  <-- the inventory
  names.json                 compact { "0x004a1230": "ANM2::Update", ... } for the lifter
  zhl-stats.json             REPENTOGON signature match counts
  summary.json / summary.md  the report
  c/<shard>/<VA>.c           decompiled C, one file per function
  pcode/<shard>/<VA>.pcode.json.gz
  raw-pcode-only.txt         VAs the decompiler is deliberately not invoked on
  status/decomp-<stamp>.jsonl   append-only decompile results (resume ledger, one file per JVM pass)
  decompile-complete.marker  written only when the queue drained
  logs/                      driver + Ghidra logs
```

`<shard>` is the top 16 bits of the entry VA as 4 hex digits (`0x004a1230` -> `004a`).
That keeps ~100-200 directories of a few hundred files each instead of one directory
with tens of thousands of entries. `<VA>` is the entry point as 8 lowercase hex digits,
no `0x`. So `FUN_004a1230` lands in `c/004a/004a1230.c` and
`pcode/004a/004a1230.pcode.json.gz`.

---

## `functions.jsonl`

One JSON object per line, ordered by entry VA. Fields:

| field | meaning |
| --- | --- |
| `va`, `minVa`, `maxVa`, `endVa` | entry point, body extent (`endVa` is exclusive) |
| `bodyBytes`, `bodyRanges` | body size in bytes; number of disjoint address ranges |
| `instructionCount` | instructions inside the body |
| `name`, `qualifiedName`, `namespace`, `symbols`, `mangled` | Ghidra naming. `symbols` is every symbol at the entry; `mangled` is the MSVC `?...` symbol if one survived demangling |
| `defaultName` | `true` when the name is still `FUN_*`/`SUB_*` |
| `zhlName`, `zhlDeclaration`, `zhlCatalog` | **real symbol name** recovered by matching REPENTOGON's `libzhl/functions/*.zhl` byte signatures against the binary. Only uniquely-matching signatures are used, and `zhlName` is only set when the match lands exactly on the function entry |
| `zhlInteriorName`, `zhlInteriorOffset` | a unique ZHL signature that landed *inside* this function's body rather than at its entry (offset from the entry). Set only for single-range bodies. This means Ghidra started the function in the wrong place, or inlined two functions into one — treat it as a lead, not a name |
| `callingConvention`, `stackPurge`, `stackPurgeValid`, `stackFrameSize` | ABI as Ghidra sees it. `stackPurge` is the `ret N` value |
| `returnType`, `parameterCount`, `parameters[]`, `prototype`, `varArgs`, `noReturn` | signature; each parameter carries `name`/`type`/`size`/`storage` |
| `signatureSource` | `DEFAULT` / `ANALYSIS` / `IMPORTED` / `USER_DEFINED` |
| `external`, `thunk`, `thunkTarget`, `inline` | linkage |
| `recovered` | this function was created by the coverage-recovery pass, not by Ghidra's auto-analysis. Cross-reference `recovered-functions.tsv` for whether it starts with a real prologue |
| `fid`, `bookmarks[]` | `fid` is true when Ghidra's Function ID analyzer bookmarked the entry — i.e. a known library (CRT/STL/MFC/boost) function that does **not** need translating |
| `hasSeh`, `sehFsSegment`, `sehHandlerCallee` | SEH detection: `FS:`-segment access anywhere in the body (the classic `mov fs:[0], esp` handler chain) or a call to an `_SEH_prolog`/`__except_handler`/`__CxxFrameHandler`-style helper |
| `directCalls`, `indirectCalls` | call-site counts |
| `computedJumps`, `unresolvedComputedJumps` | computed (indirect) jumps, and how many of them Ghidra could not resolve to any destination — i.e. jump tables it failed to recover |
| `inText` | body starts inside `.text` |
| `callees[]` | every call destination VA referenced from the body |
| `decompile` | `{ok, error, ms, cBytes, cPath, pcodePath, pcodeGzBytes, highOps, highBlocks, rawOps, skipped}` |

`decompile.ok === null` means the function was never attempted.
`decompile.skipped === true` means the raw-P-Code-only policy applied (see below): raw
P-Code was exported, the decompiler was never invoked, so there is no C and no high P-Code.

### The raw-P-Code-only policy

Measured on this binary: invoking the decompiler on a **recovered mid-function fragment**
costs **27.5 s on average** versus **0.2 s** for a normal function — 137x — because the
decompiler follows flow out of the fragment and re-derives the high P-Code of the whole
enclosing region. Eight consecutive fragments at `0x0066894d`-`0x00668e1a` each produced
~47,700 high P-Code ops: the same region, eight times, at ~80 s apiece.

So functions listed in `raw-pcode-only.txt` (generated from `recovered-functions.tsv`,
every recovered entry with `looksLikePrologue = false`) get **raw P-Code only**. Their raw
P-Code is exact and complete for their address range — it is what a mechanical lifter
consumes — and their high P-Code is redundant with their neighbours'. Pass
`--no-skip-list` to disable the policy and decompile everything; budget roughly 30
extra CPU-hours.

---

## P-Code JSON schema (`isaac-pcode/1`)

Gzipped UTF-8 JSON, one file per function. Readable keys on purpose: gzip removes the
repetition and downstream consumers are agents, not humans counting bytes.

```jsonc
{
  "schema": "isaac-pcode/1",
  "va": "0x004a1230",
  "name": "FUN_004a1230",
  "qualifiedName": "...",
  "callingConvention": "__thiscall",
  "bodyBytes": 412,
  "decompiled": true,
  "decompileError": null,
  "decompileMs": 84,

  // Decompiler-recovered prototype (this is why Decompiler Parameter ID is not needed).
  "prototype": {
    "model": "__thiscall", "returnType": "int", "returnStorage": "EAX:4",
    "varArgs": false, "noReturn": false, "inline": false, "extraPop": 4,
    "params": [ { "name": "this", "type": "void *", "size": 4,
                  "storage": "ECX:4", "isParameter": true, "isGlobal": false, "pc": null } ]
  },
  "locals":  [ /* HighSymbol, same shape as params */ ],
  "globals": [ /* HighSymbol */ ],
  "jumpTables": [ { "switch": "0x004a12a0", "cases": ["0x004a12c0", "..."] } ],

  // High P-Code: SSA, register/stack/varnode normalised, arranged as a CFG.
  "high": {
    "blocks": [
      { "index": 0, "start": "0x004a1230", "stop": "0x004a1244",
        "in": [], "out": [1, 2],
        "ops": [
          { "seq": 17, "addr": "0x004a1234", "op": "INT_ADD", "opcode": 19,
            "output": { "space": "unique", "offset": "0x1000", "size": 4,
                        "kind": "unique", "id": 42 },
            "inputs": [ { "space": "register", "offset": "0x0", "size": 4,
                          "kind": "register", "register": "EAX", "id": 41, "def": 12 },
                        { "space": "const", "offset": "0x4", "size": 4, "kind": "const" } ] }
        ] }
    ],
    "blockCount": 3,
    "opCount": 57
  },

  // Raw P-Code: exactly what SLEIGH emits per machine instruction, no simplification.
  "raw": {
    "instructions": [
      { "addr": "0x004a1230", "length": 1, "bytes": "55", "text": "PUSH EBP",
        "ops": [ { "op": "COPY", "opcode": 1, "output": {...}, "inputs": [ {...} ] } ] }
    ],
    "instructionCount": 118,
    "opCount": 331
  }
}
```

Reconstructing SSA: every varnode carries `id` (Ghidra's `VarnodeAST` unique id) and,
when it is not an input, `def` — the `seq` of the op that defines it. Ops carry `seq`
(unique within the function) and `addr` (the machine instruction they came from).
`high` is `null` when the decompiler failed; `raw` is always present because it comes
straight from the listing and does not depend on the decompiler succeeding.

---

## Resumability

* **analyze** — guarded by `analyze-done.json`; the Ghidra project is saved so no later
  stage ever re-analyses.
* **recover** — guarded by `recover-done.json`. It is the only stage that writes to the
  Ghidra database, so it runs without `-readOnly` and must complete before the inventory.
* **inventory** — cheap (single pass), just re-runs.
* **decompile** — every finished function appends one line to
  `status/decomp-<stamp>.jsonl`. On startup the script reads *all* status files, builds
  the set of completed VAs, and queues only what is missing. Partial trailing lines are
  ignored (the reader requires a line to end with `}`). The driver re-launches the JVM
  until `decompile-complete.marker` appears or a pass makes no progress, so a crash at
  function 14,000 costs one JVM restart, not the previous 14,000 functions.
* **merge / report** — pure functions of the files on disk; run them any time to get a
  current snapshot, including mid-decompile.

## What this binary actually looks like (measured, not assumed)

Two facts change how you should read the output:

**1. The CRT is dynamically linked, so Function ID finds almost nothing.**
`isaac-ng.unpacked.exe` imports 622 symbols from 28 DLLs, of which 191 come from 13
CRT/C++ runtime DLLs (`MSVCP140.dll`, `VCRUNTIME140.dll`, and the `api-ms-win-crt-*`
UCRT set). Lua, OpenAL, libcurl, steam_api and EOSSDK are DLLs too. There is therefore
almost no statically-linked library body in `.text` for Ghidra's FID databases to match —
FID identifies **80 of 24,170 functions (5,021 bytes, 0.07% of function bytes)**.

Do **not** plan on "FID says library, skip it" as a way to cut the workload here. It cuts
essentially nothing. What *is* in `.text` that is not hand-written game logic is
header-inlined C++ template code (STL containers, strings, math) which is compiled into
the game's own functions and cannot be excluded at function granularity. Normalising
addresses out of the decompiled C and hashing the bodies finds only **1,683 redundant
structural clones across 335 groups (10.9% of decompiled functions)** — the template code
is inlined *into* distinct functions, not duplicated *as* functions.

**2. Ghidra's function recovery is the binding constraint, not the decompiler.**
The decompiler succeeds on **99.97%** of the functions it is invoked on (15,469 of
15,473; 4 failures, 3 of them 240 s timeouts). Function *discovery* is where the work is:
auto-analysis attributed only 81.7% of `.text`; the recovery stage takes it to 96.86%.
The residue is dominated by unresolved jump tables — 3,107 functions still contain a
computed jump Ghidra could not resolve to any destination (3,127 sites).

## Tuning

* Each decompile worker spawns a native `decompile.exe`. Budget roughly 0.3-0.7 GB of
  *native* memory per worker on top of the JVM heap. On a 32 GB box shared with other
  work, `--threads 6` with `--heap 10G` is a safe starting point; raise `--threads`
  toward the core count when the machine is idle.
* `--timeout` is per function. Very large functions (>50 KB of body) are the ones that
  hit it; they show up in `summary.json -> decompileErrors`.
