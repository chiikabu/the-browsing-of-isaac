# Isaac native/Wasm decomp port

This repository replaces the per-frame x86-emulation path with a verified
native WebAssembly port. Continue that real objective. Do not redefine success
as a demo, a wrapper around the emulator, or a small slice with green tests.
The port is complete only when the shipped frame path no longer depends on x86
emulation and runtime behavior is verified against the original.

## Session start — do these before anything else

1. `node scripts/decomp/status.mjs` — the live state (family ABI versions, the
   open-boundary worklist, verification freshness, warnings). **Docs lag the
   tree by design; the tree wins.** Three units in one session were wasted
   opening already-landed targets because they trusted a checkpoint narrative.
2. Read `decomp/frontier.json` — the last unit's hand-off pointer. If status
   warns it is stale, re-rank from the open-boundary list instead.
3. Census with the prebuilt index, never a new script:
   `python scripts/decomp/tools/pequery.py <cmd>` (writers / readers /
   xrefs-to / callers / callees / body / disasm / sig / addr / strings /
   imports / verify). Build once per binary hash with
   `npm run decomp:index` (≈1 min). Every prior session that hand-rolled a
   census re-hit the same measured traps (decode halting at the first bad
   byte, phantom back-scan sites, jump-table bytes decoded as code,
   register-held call sites invisible to a static-disp census). The index
   engineered those out: full linear decode with resync, jump tables masked
   and recorded, scaled-index displacement xrefs, `call [slot]` resolution,
   capstone-access-bit read/write classification. `pequery.py verify` replays
   this repo's measured ground truths against the index.
4. At hand-off, update `decomp/frontier.json` (next VA, notes, date, ABI).

## The machine track (static recompilation) — check it before hand-translating

`scripts/recomp/` is a parallel, machine-heavy pipeline (docs:
`docs/recomp-architecture.md`, `docs/recomp-boot.md`,
`docs/recomp-host-boundary.md`). State measured 2026-08-31: Ghidra headless
bulk export of EVERY function (decompiled C + P-code, ~50 min machine time,
under ignored `output/recomp/`); a SLEIGH-p-code→C lifter that covers 96.18%
of `.text` (21,375 functions, 99.66% success) compiling to a ~38 MB wasm
module; a 7-step boot layer (memimage, IAT shims, TEB/SEH, TLS, `_initterm`);
a Unicorn ground-truth oracle + differential harness. The lifted module BOOTS:
all 121 CRT initialisers run, `main()` executes deep into engine init (heap
peak 52.5 MiB, the game's own logger prints, SwapBuffers reached) before
trapping on a NULL object caused by the EMPTY shim filesystem + unwritten
worker/Steam/EOS shims. Reproduce:
`cd output/recomp/lift/boot && node boot_integration.mjs ../../host/isaac.segs.bin boot|main`.
Hand-translation (this file's rules) remains the verified-per-boundary track;
the recomp track is the coverage track. They meet at the hybrid plan in
`docs/recomp-architecture.md` §8. Prefer machine passes (bulk export, lifter,
oracle vectors, pequery censuses) over token-driven re-derivation wherever
the question is mechanical.

## Worktree and artifact safety

- Work on `codex/decomp` unless the user explicitly selects another branch.
- The worktree may contain unrelated user changes. Edit only files required
  for the current boundary; never reset or discard work.
- The executable and all binary-derived output are local evidence, not source.
  Never commit game executables, assets, Ghidra projects, decompiler listings,
  disassembly dumps, runtime captures, or generated Wasm/native objects.
- Private roots stay ignored: `/tools/`, `/output/`, `/re/ghidra_project/`.
  Confirm generated files with `git check-ignore -v` before finishing.
- Canonical analysis input: `tools/isaac-ng.unpacked.exe`, SHA-256
  `5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200`.
  Every RVA/VA/signature/decompile is version-bound; re-inventory if the hash
  changes (`scripts/decomp/tools/pe.py` hard-fails on a mismatch).
- Scratch files belong under `output/decomp/_scratch/` or `.scratch/`, never
  the repo root. One-off scripts you want to keep become named tools under
  `scripts/decomp/tools/`; everything else dies with the session.

## Authoritative tracked sources

- `decomp/port-roots.json` — signature-backed root requests.
- `decomp/game-update-slice.json` — recovered offsets, predicates, boundaries,
  receivers, evidence, runtime inputs, host-event ordering.
- `decomp/frontier.json` — hand-off pointer (small, always current).
- `native/decomp/game_update_slice.{h,cpp}` — freestanding C++20 translation
  and sparse Game-object capture/apply ABI.
- `scripts/decomp/game-update-model.mjs` — independent JS behavioral oracle.
  Never derive it mechanically from the C++.
- `scripts/decomp/verify-game-update-slice.mjs` — deterministic native-vs-Wasm
  differential corpus and recapture/resume driver.
- `scripts/decomp/build-game-update-slice.mjs` — warning-clean native build,
  explicit Wasm exports, zero-import ABI report.
- `scripts/decomp/frame-path.mjs`, `web/js/native-update-bridge.js` — shipped
  frame-path selector and platform-host boot of the native Update session.
- `scripts/decomp/status.mjs` — live state, derived from the tree.
- `scripts/decomp/tools/` — PE toolkit (`pe.py`, `build-pe-index.py`,
  `pequery.py`).
- `docs/decomp-port.md` — chronological log (newest near the top).
- `docs/decomp-history.md` — archived checkpoint narratives and the
  do-not-re-open negative results (v65..v82 era).

Generated analysis belongs under `output/decomp/<first-12-sha256>/`; the
cached Ghidra project under `re/ghidra_project/`. Both are ignored.

## Evidence rules

1. Start from exact machine control flow: the instructions at the boundary,
   the complete decompiler body, call receivers/arguments, every branch that
   determines externally visible behavior.
2. Run `node scripts/decomp/identify-zhl-address.mjs <VA>...` for each
   recovered call target (batch all VAs in one invocation). Use a source-level
   name only for an exact matching signature; otherwise keep an address-stable
   name like `opaque_call_009b7680`.
3. Never name a function from proximity, a string reference, one caller, or a
   plausible decompiler type. Record such evidence without promoting a guess.
4. Translate complete small helpers when all paths are understood. Keep larger
   or stateful functions as typed host events until their bodies are ported.
5. If an opaque call can mutate a later predicate, stop at a continuation,
   execute the host action, recapture the sparse fields, resume. Never use
   stale pre-call state for a post-call decision.
6. Preserve x86/float semantics explicitly: 32-bit wrap, low-byte tests,
   signed comparisons, raw bit copies, float32 rounding, NaN direction, call
   ordering, exact early-return boundaries.

Decompiler output is evidence only — never paste it into tracked source, never
treat decompiler types as authoritative.

## Port workflow

1. Record the current VA; disassemble the whole bounded block including all
   exits and the next safe handoff (`pequery.py body/disasm`).
2. Resolve callees (index + ZHL); keep generated artifacts under ignored
   `output/decomp/`.
3. Update `decomp/game-update-slice.json` before or with code: fields, runtime
   inputs, predicates, boundaries, receivers, ordering, continuations,
   evidence.
4. Increment the ABI version whenever a layout, field meaning, continuation,
   event, or exported contract changes; keep C++ static assertions, JS
   layouts, verifier expectations, exports, tests, docs synchronized.
5. Implement the C++ translation and a separately reasoned JS oracle; fixed
   edge cases first, then deterministic randomized differential coverage.
6. Advance `docs/decomp-port.md` (prepend — the log is newest-first) and
   `decomp/frontier.json` to the exact next untranslated instruction. Never
   claim an FPS improvement until measured in the actual browser frame loop.

## Throughput: measured ways to decompile faster

The unit of progress is boundaries removed and sites covered — report those.

1. **Hunt repeated structure before translating instructions.** Byte-diff
   sibling candidates first (8 Lua class-create helpers = one 528-byte
   template + 25 differing bytes = one unit for all 8; install-record model
   covered 95 sites, builder model 413).
2. **Validate with whole-body census, not hand-picked cases** (0 mismatches
   over 3377 pushes beats case-by-case reasoning and is faster).
3. **Peel the probe, collapse the cascade.** Prefer boundaries whose removal
   converts many host edges into one pure decision; check reachability from
   the frame path before choosing a target — a leaf peel of off-frame-path
   code shrinks nothing.
4. **Escalate cross-cutting blockers to a standing decision or a new family;
   never stop at them repeatedly** (the allocator stalled four sections until
   one policy decision unblocked all).
5. **When two corrections share a defect class, run a class-wide audit
   immediately** (one stale-state audit found 11 instances in one sweep).
6. **Write capture contracts at section boundaries.** Frozen byte-for-byte
   helper contracts are what make parallel sections safe.
7. **Prefer exact-ZHL targets, but an exact match is necessary, not
   sufficient** (a 24-byte exact match was disproven at its callsite; a miss
   does not mean absent; a 7-byte pattern is weak).
8. **Batch the evidence pass**: all VAs through the tools in one invocation,
   dump spans once, then work from files.
9. **Translate right the first time — the known defect classes.** Every
   correction to a landed peel was one of: post-call value folded to a
   pre-call snapshot; recapture taken unconditionally where the PE recaptures
   on one path only; strict/non-strict or signed/unsigned misread; full-word
   test where the PE tests a low byte; loop bound folded once where the PE
   re-derives per iteration; NaN direction of `comiss`/`cmov` inverted;
   constant assumed where the callee rewrites through a pointer. Check each at
   translation time; mutation-check each at test time. A green differential
   with an oracle derived from your own C++ catches none of them, and a wrong
   assertion actively locks the bug in. When two helpers model the same
   instruction range, assert they agree.
10. **A census is only as complete as its reach-site enumeration.** Enumerate
    every call form (direct, register-held, thunk, table); decode linearly
    from a known anchor; re-derive surprising counts from a second anchor;
    close the argument by proving your channel is the only one. Report the
    censused number, never a `~`. The index's decode config is recorded in
    `pequery.py meta` — cite it with any count. The worst failure mode is a
    clean-looking EMPTY result from a decoder that silently halted; the index
    builder counts resync bytes precisely so that cannot happen silently.
    When scripting restores, hash bytes, not decoded text (text-mode reads
    CRLF-normalize and self-verify wrongly).
11. **Verify the assigned target is still open before doing anything else**
    (status.mjs first; then the family header/model/tests and the instruction
    stream). Count assertions per export, not tests per file.
12. **Keep the honest counter.** Narrowed is not removed. A unit that leaves
    the boundary reports the count unchanged and names the exact blocker.

## PE geometry: section table only, zero-at-load is not file content

`VA -> file offset` must go through the section table (pe.py enforces this; a
fixed `.text`-only formula was wrong by 0xE00 for `.rdata` and returned
plausible garbage). Addresses past a section's raw size are zero at load and
not file-backed — `pe.py` raises/flags instead of returning bytes; two "float
constants" pinned in four places at once were actually `.reloc` bytes read
through a bad formula, and the true value (writer census: 5023 readers, 0
writers) was `+0.0f`. A zero-at-load address is a constant only if its writer
census is empty, and the claim is bounded to the exact range censused
(`0xc79100..0xc7910f` is constant zero; `0xc79110` IS written). Cross-check
any suspicious constant against `pequery.py writers`.

## A green suite can mean "nothing was asserted"

The measured ways green has lied here, in ascending nastiness:

1. Helpers imported and export-listed, never exercised by any test.
2. A masked differential (every Wasm-side draw pre-masked `& 0xff`, so the
   divergent input was never presented — hid the uint8 ABI defect for 28
   versions).
3. A wrong assertion pinning the incorrect answer, sometimes with a comment
   rationalising it.
4. A wrong "PE truth" reference repeating the same misreading as the C++ and
   the JS oracle — three independent-looking implementations agreed and all
   three were wrong. Defence: re-transcribe the reference branch-by-branch
   from the instruction stream, not from your understanding.
5. Green in one harness reported as green in another (a unit cited the
   differential while its own behavioural tests threw `ReferenceError` before
   the first assertion). Name the harness when you claim a pass; mutation-
   check inherited assertions that have never executed.
6. The harness silently neutering the input: an expectation coinciding with
   pre-zeroed scratch; the two sides driven with different inputs; the
   verifier's per-key whitelist delivering a new corpus key as zero, making
   every new differential case a silent no-op. When you add a runtime input,
   prove delivery: assert a case where the new input CHANGES the result.

A work unit is complete when each new helper has at least one behavioural
assertion and a mutant proving that assertion discriminates — never merely
when the suite is green. Mutation-check every new test: break the translation
deliberately, confirm the test fails, revert, report.

Never hardcode the current ABI number in a test (`assert.equal(abi(), 87)`).
Every bump then requires a whole-file sed, and the one missed sweep left the
room suite 82-red for days (stale "wasm ABI 75" message strings recorded three
generations of that sed). Pin against the family's exported
`*_ABI_VERSION` constant.

## Known toolchain defect: `uint8_t` parameters are silently wrong

A helper modeling an x86 byte test must NOT take a `uint8_t` parameter: the
Wasm ABI does not narrow i32 arguments and `-O2` deletes the in-body mask.
Nine exports shipped divergent this way. Required, in every family: take
`uint32_t` and re-narrow explicitly in the body; static-assert no `uint8_t`
scalar parameter remains; drive byte-gate exports across the boundary with
wide values (`0x100`, `0x1ff`, `0xffffffff`) without pre-masking; prove with a
behavioural mutant that drops the mask.

## Standing decisions (full text in docs/decomp-port.md)

- **Win32 synchronization primitives** (CriticalSection quartet + `Sleep`) are
  platform primitives, but the ORDERING of stores around them is game logic.
  Live falsifier D-LOG-8: a wait only another thread can satisfy — model the
  predicate, pin behaviour, report; never assume single-threadedness silently.
- **Logger `0x00a112c0` splits**: level-gate is game logic (translated, `log`
  family), the vsnprintf/OutputDebugString/file tail is platform.
- **CRT math imports** (`_libm_sse2_{sin,cos}_precise`) are platform
  primitives — bodies not in the image. Falsifier: divergence traced to a CRT
  math result, or game logic that serializes/hashes/compares/seeds RNG from
  one.
- **Guest allocator**: wrappers are game logic (translate); raw
  malloc/free/new/delete stay host. Falsifier: game logic depending on a
  pointer *value*.
- Original-binary defects are reproduced and pinned, never corrected.
- Wasm test scratch at `0x100000`+; randomized corpus indices from the shared
  LCG's **high** bits, never `% n`.

## Required verification for every ABI work unit

```powershell
node --test tests/decomp-game-update-slice.test.js tests/decomp-pipeline.test.js
npm run decomp:verify-slice
npm test
node scripts/check-repo-safety.mjs
git diff --check
```

Also verify: `output/decomp/wasm-slice/abi.json` reports zero Wasm imports and
lists every new export; `verification.json` reports `result: "pass"` with
meaningful cases for each new continuation; `decomp/game-update-slice.json`
parses; no stale ABI version/field/struct size remains anywhere tracked;
proprietary and generated outputs still ignored.

## Tidy handoff

End every unit with: one exact next VA in `decomp/frontier.json`, one passing
verification report (name the harness), synchronized ABI metadata, no tracked
binary-derived material, and no new repo-root scratch. Report what is
translated, what remains an address-stable host action, and whether the code
is integrated into the live frame loop. A verified slice is progress; it is
not proof the full decomp or FPS objective is complete.
