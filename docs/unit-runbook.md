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
  landed targets); brief gives target status + function shape + the next
  commands in one call. If the target is resolved, report that and take the
  frontier pointer instead.
- If the PE index is missing: `npm run decomp:index` (≈1 min, one-time).

## 1. Evidence pass (batched, from the index)

```powershell
python scripts/decomp/tools/pequery.py batch "addr 0x<VA> ;; body 0x<VA> ;; callers 0x<VA> ;; callees 0x<VA>"
node scripts/decomp/identify-zhl-address.mjs 0x<VA1> 0x<VA2> ...   # one batch
```

Batch EVERY index query into as few `batch` calls as possible — one process,
one tool call, one combined output.

Census questions (writers/readers of a global, address escapes, byte
patterns) go through `pequery.py writers|readers|xrefs-to|sig`. Do NOT write
a new census script; if the toolkit genuinely cannot answer, extend
`pequery.py` with a new subcommand as part of the unit.

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

1. `decomp/game-update-slice.json` — fields/runtime inputs/events/evidence,
   ABI version bump.
2. `native/decomp/game_update_slice.{h,cpp}` — translation + static asserts
   (no `uint8_t` scalar params; layouts pinned).
3. `scripts/decomp/game-update-model.mjs` — independent oracle (reason from
   the instruction stream, not from your C++).
4. Tests: fixed edge cases first, then randomized differential; wire new
   runtime inputs through the verifier whitelist and PROVE delivery (a case
   where the new input changes the result).
5. Mutation check every new assertion: break translation, watch it fail,
   restore byte-identical (hash bytes, not text).

## 4. Verify (one call, compact output)

```powershell
node scripts/decomp/verify-unit.mjs --suite tests/decomp-<family>.test.js
```

Runs the whole required gate (slice+pipeline tests, the named family suite,
the 5387-case differential, repo safety, `git diff --check`) with the emsdk
environment set up for you, and prints one PASS/FAIL line per gate. Add
`--full` for the whole `npm test` before a hand-off. Family suites cache
their wasm builds by source hash (`tests/wasm-build-cache.mjs`), so a warm
gate is minutes, not tens of minutes; `ISAAC_WASM_BUILD_CACHE=0` forces
real builds.

Plus: abi.json zero imports + new exports listed; verification.json
`result: "pass"`; JSON parses; no stale ABI constants tracked anywhere.

## 5. Hand off

- Prepend the unit's row to `docs/decomp-port.md` (newest-first log).
- Update `decomp/frontier.json`: exact next VA, one-line notes, date, ABI.
- Report: boundaries removed (or "count unchanged, blocker is X at 0xVA"),
  what is translated vs host, whether the live frame path changed.
