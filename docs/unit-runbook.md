# Work-unit runbook (single boundary, start to finish)

Self-contained procedure for one decomp work unit. Read AGENTS.md for rules;
this file is the order of operations. Past delegation waves died mid-analysis
mostly from re-deriving context and re-implementing censuses — both are now
one command each. A unit that follows this list touches the binary only
through the toolkit and finishes with the verification block green.

## 0. Orient (2 commands, no doc reading)

```powershell
node scripts/decomp/status.mjs
```

- Confirms your target is still OPEN (units have been wasted on landed
  targets). If it is not in the open list, report that and take the frontier
  pointer instead.
- If the PE index is missing: `npm run decomp:index` (≈1 min, one-time).

## 1. Evidence pass (batched, from the index)

```powershell
python scripts/decomp/tools/pequery.py addr 0x<VA>        # orientation
python scripts/decomp/tools/pequery.py body 0x<VA>        # annotated disasm
python scripts/decomp/tools/pequery.py callers 0x<VA>     # all call forms
python scripts/decomp/tools/pequery.py callees 0x<VA>
node scripts/decomp/identify-zhl-address.mjs 0x<VA1> 0x<VA2> ...   # one batch
```

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

## 4. Verify (all of it, name the harness in your report)

```powershell
node --test tests/decomp-game-update-slice.test.js tests/decomp-pipeline.test.js
npm run decomp:verify-slice
npm test
node scripts/check-repo-safety.mjs
git diff --check
```

Plus: abi.json zero imports + new exports listed; verification.json
`result: "pass"`; JSON parses; no stale ABI constants tracked anywhere.

## 5. Hand off

- Prepend the unit's row to `docs/decomp-port.md` (newest-first log).
- Update `decomp/frontier.json`: exact next VA, one-line notes, date, ABI.
- Report: boundaries removed (or "count unchanged, blocker is X at 0xVA"),
  what is translated vs host, whether the live frame path changed.
