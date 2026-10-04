# Work-unit runbook (single boundary, start to finish)

Self-contained procedure for one decomp work unit. Read AGENTS.md for rules;
this file is the order of operations. Past delegation waves died mid-analysis
mostly from re-deriving context and re-implementing censuses — both are now
one command each. A unit that follows this list touches the binary only
through the toolkit and finishes with the verification block green.

## 0. Orient (2 commands, no doc reading)

```powershell
node scripts/decomp/status.mjs
node scripts/decomp/brief.mjs <0xVA | boundary-idx>
```

- status confirms your target is still OPEN (units have been wasted on
  landed targets) and runs the tree-consistency checks: an `ERRORS` block
  means the tree is not sane (stranded mutant, JSON drift, header/model
  ABI skew) — fix that first, it is somebody's unfinished unit.
- brief gives target status + function shape + the **live-bridge line**: if
  it says the bridge delivers 0 of N lanes for the boundary, an in-module
  narrow there is dormant in the shipped tick until the bridge captures the
  `*Ready` lane. Plan that capture as part of the unit or say so in the
  report. If the target is resolved, report that and take the frontier
  pointer instead.
- If the PE index is missing or predates decode config v2 (`pequery.py
  meta`): `npm run decomp:index` (≈50 s, one-time).

## 1. Evidence pass (batched, from the index)

```powershell
python scripts/decomp/tools/pequery.py batch "addr 0x<VA> ;; body 0x<VA> ;; callers 0x<VA> ;; callees 0x<VA> ;; fieldrefs 0x<disp> 0x<VA>"
node scripts/decomp/identify-zhl-address.mjs 0x<VA1> 0x<VA2> ...   # one batch
```

Batch EVERY index query into as few `batch` calls as possible — one process,
one tool call, one combined output.

Census questions go through `pequery.py`:
- globals: `writers|readers|xrefs-to ADDR` (absolute displacements);
- **object fields**: `fieldrefs DISP [FUNC]` — every `[reg+DISP]` operand,
  classified r/w/rw/addr with the base register, whole-.text or inside one
  function. "Nothing in this function writes Game+0x1ba84" is one query, not
  an eyeball pass over `body`. A displacement is shared by every object type
  that has a field there, so read the base register before counting a hit;
- byte patterns: `sig`.
Do NOT write a new census script; if the toolkit genuinely cannot answer,
extend `pequery.py` with a new subcommand as part of the unit.

Save any long dumps under `output/decomp/_scratch/<unit>/`, never repo root.

Sanity habits that have paid off (all measured):
- A surprising count gets re-derived from a second anchor
  (`disasm` around the sites; `sig` on the raw bytes).
- A "constant" global gets a writer census before you pin it.
- An empty result is checked against `pequery.py meta` decode stats before
  you believe it.

## 2. Decide the shape

- Whole body understood, all paths → translate (pure helper / in-module lane).
- Opaque callee that can mutate later predicates → continuation + recapture
  on exactly the paths the PE recaptures on.
- Irreducible host content (platform primitive per standing decisions, or
  unbounded side effects) → typed host event; record why in the JSON
  evidence field. Narrowed is a valid outcome; report the honest counter.

## 3. Land it (order matters)

1. `native/decomp/game_update_slice.{h,cpp}` — translation + static asserts
   (no `uint8_t` scalar params; every `sizeof(...RuntimeInputs) == N` pin
   updated together; ABI enum bumped).
2. `scripts/decomp/game-update-model.mjs` — independent oracle (reason from
   the instruction stream, not from your C++); `ABI_VERSION`, `ABI_SIZES`,
   `RUNTIME_INPUTS_LAYOUT` / `EVENTS_LAYOUT` for every new lane/event.
3. `decomp/game-update-slice.json` — boundary evidence (`abiV<N>` key on the
   record), `abiVersion`, then **`node scripts/decomp/slice-json.mjs sync`**
   to mirror the layouts into `runtimeInputs`/`events` rows and write the
   canonical form (indent 1). Never hand-serialize this file: a re-indent
   once turned a 3-key change into a 74,117-line diff, and 254 rows had
   drifted from the layout before the sync existed.
4. Tests: fixed edge cases first, then randomized differential; wire new
   runtime inputs through the verifier whitelist and PROVE delivery (a case
   where the new input changes the result — and a coverage counter that
   fails the differential when the arm is never reached). Pin ABI numbers
   symbolically (`ABI_VERSION`, `HEADER_ABI_VERSION`, `ABI_SIZES.*`), never
   as literals — the gate's preflight refuses literal pins.
5. Mutation check every new assertion **with the wrapper**, never by hand:

   ```powershell
   node scripts/decomp/mutate.mjs --file native/decomp/game_update_slice.cpp --from "<exact line>" --to "<mutant line>" -- bash -c "node scripts/decomp/build-game-update-slice.mjs && node --max-old-space-size=1024 scripts/decomp/verify-game-update-slice.mjs"
   ```

   It stashes the original bytes, journals the write, tags the mutant
   `/* MUTANT */`, runs the command, and restores sha256-identical in a
   `finally`/signal handler; `MUTANT KILLED` (command failed) is the
   evidence line for the report. It restores the SOURCE, not the command's
   outputs: after a killed run whose command writes artifacts (the slice
   wasm, `build-selftest.json`), run the clean command once more before
   anything reads them. A session that dies mid-cycle leaves a
   trail `mutate.mjs check` / `restore` and the preflight see. The ABI-101
   unit did this by hand, died between "watch it fail" and "put it back",
   and shipped the inverted cpp.

## 4. Verify (one call, compact output)

```powershell
node scripts/decomp/verify-unit.mjs                  # suites auto-detected from the dirty tree
node scripts/decomp/verify-unit.mjs --handoff        # + full npm test, strict preflight
```

Stage 0 is the instant preflight (≈1 s): header/model/JSON ABI agreement,
cpp size pins, JSON layout drift + canonical form, stranded mutants, literal
ABI pins in tests, frontier freshness. Stage 1 builds the slice wasm once
(skipped when it is newer than every source) and checks `abi.json` for zero
imports + the tree's ABI. Stage 2 runs everything else **in parallel**:
slice+pipeline+toolkit tests, the auto-detected family suites, the 5k-case
differential, repo safety, `git diff --check` (and `npm test` under
`--full`/`--handoff`). Wall time is the longest gate (~3.5 min: the
differential), not the sum. Family suites cache their wasm builds by source
hash (`tests/wasm-build-cache.mjs`); `ISAAC_WASM_BUILD_CACHE=0` forces real
builds.

## 5. Hand off

- Prepend the unit's row to `docs/decomp-port.md` (newest-first log).
- Update `decomp/frontier.json`: exact next VA, one-line notes, date, ABI
  (`updatedAbi` must equal the tree's ABI or `--handoff` fails).
- Commit the unit on `codex/decomp` once the gate passes. An uncommitted
  unit is invisible to the next session's orientation (status.mjs only
  warns "unit in flight") and is how the ABI-101 mutant survived a night.
- Report: boundaries removed (or "count unchanged, blocker is X at 0xVA"),
  what is translated vs host, whether the live frame path changed (brief's
  live-bridge line), and the `MUTANT KILLED` lines.
