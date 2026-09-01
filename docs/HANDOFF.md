# Handoff — read this first (2026-08-31, round 8)

One page to orient a fresh session. Everything below is committed on
`codex/decomp`; `git status` is clean. Do the two session-start steps in
AGENTS.md, then pick a front.

## Orient in two commands

```
node scripts/decomp/status.mjs          # live family ABIs, open boundaries, verification freshness
node scripts/decomp/brief.mjs <VA|idx>  # one-call orientation for a specific Update boundary
```

Censuses go through the prebuilt PE index — never hand-roll a decoder:
`python scripts/decomp/tools/pequery.py batch "body 0x.. ;; callers 0x.. ;; writers 0x.."`
(build once with `npm run decomp:index`). The whole unit gate is
`node scripts/decomp/verify-unit.mjs [--suite <file>] [--full]` (sets up the
emsdk env itself). Full family suites REQUIRE emsdk on PATH:
`export EMSDK=$HOME/emsdk; export PATH=$HOME/emsdk:$HOME/emsdk/upstream/emscripten:$PATH`.

## Verified state at handoff

- Update slice **ABI 100**. `npm test` **3891/3891** (warm ~1m34s; the
  family suites cache their wasm builds — `tests/wasm-build-cache.mjs`).
- `decomp:verify-slice` differential **5387 cases pass**.
- recomp host selftest **77/0**, `tests/recomp-host.test.js` **33/33**.
- recomp lifter wide-op differential vs Unicorn **12 instructions x 200
  vectors, all green** (`scripts/recomp/oracle/wideops.py`,
  `tests/recomp-wideops.test.js`).
- recomp boot module relinks clean: 272,269,106 B wasm, 0 undefined /
  0 duplicate symbols.
- `node scripts/check-repo-safety.mjs` passes; no binary-derived material tracked.

## Two work fronts

### A. Hand-decomp boundaries (the verified per-boundary track)
The Update slice is `Game::Update` translated to a zero-import wasm slice with a
JS oracle + 5387-case differential. **The free boundary removals are
exhausted** — this session assessed and pinned idx 2/3/4/5/8/11/22/35 (read
them with `brief.mjs <idx>`; verdicts are the `assessment20260831*` keys in
`decomp/game-update-slice.json`). All remaining open boundaries are stays-host
or narrowed; genuine removal now needs either shipped-path capture blobs or
depth-translation of standing blockers (entity-list `0x4186c0`, player-entry
stores `0x7abe20`, ANM2::Load, rain-create). Two count-neutral **ready
narrows** are pinned with exact laws+fields if you want a warm-up unit: idx 3
(`0x74f090` fold) and idx 4 (mode-3 `0x82eb90` fold). Rules + measured lessons:
`AGENTS.md`; archived checkpoint narratives: `docs/decomp-history.md`; unit
procedure: `docs/unit-runbook.md`.

### B. Recomp machine track (the path to a running port — higher leverage)
`scripts/recomp/` statically recompiles the whole PE to wasm (**96.73%** of
.text lifted, 26 lift failures left and none of them a wide-varnode gap). A
seeded boot now gets through win32 init → CRT → Steam → **EOS** → GL "4.6.0"
→ asset load → libtheora/libvorbis → **two `SwapBuffers`** → 31,423 guest
heap allocs (peak 53.5 MiB) → the version banner
`Repentance+ v1.9.7.17.J460`, guard intact after `main`. Reproduce:
`cd output/recomp/lift/boot && node boot_integration.mjs ../../host/isaac.segs.bin main`
(log kept at `output/recomp/lift/boot/run-gu2.log`).

**Exact next unit (B) — host FS, not the lifter.** After the Lua layer misses
`resources/scripts/main.lua`, the game **re-opens every packed archive and
every open fails**, including `graphics.a` and `animations.a` which the same
run seeded and read during asset load. 33 `AnmCache failed to load` follow and
the HUD dereferences the null ANM2 at `0x009a26c2` (`guest read of 4 bytes at
0x30`). Two separable parts: (a) `BOOT_ARCHIVES` in `boot_integration.mjs`
seeds five — `music.a`, `sfx.a`, `videos.a`, `afterbirth.a` are never seeded;
(b) the seeded ones fail the **second** open, so the shim FS refuses a re-open
the first pass allowed — diagnose (b) first or the added archives fail the
same way. Details: `docs/recomp-boot.md §10`, `decomp/frontier.json` →
`machineTrack`, `docs/recomp-architecture.md §17`.

**Rebuilding the module** (only if you change the lifter):
`emit.py` (~400 s; the exact invocation is recorded in
`output/recomp/lift/gu/summary.json` → `argv`, and in recomp-architecture.md
§17.6) → `patch_reentry.py --dir output/recomp/lift/gu --exe tools/isaac-ng.unpacked.exe`
→ `build_boot.py --dir output/recomp/lift/gu` (compile ~576 s, link ~425 s).
`--trace-va` and `--hand-written` are both load-bearing — without `--trace-va`
`dispatch_tbl.c` does not even compile. Verify a new p-code lowering with
`python scripts/recomp/oracle/wideops.py` (one x86 instruction at a time vs
Unicorn) BEFORE that ~17-minute rebuild: it is what caught the Ghidra SLEIGH
`PSLLD`/`PSLLQ` per-lane-count defect that had been silently miscompiling 12
real sites.

## Ground rules that bite (from AGENTS.md, do not relearn the hard way)
- The tree wins over any doc "checkpoint" number — status.mjs is truth.
- Counts are exact index censuses, never `~`; zero-at-load `.data` is constant
  only with an empty writer census bounded to the censused range.
- Green can lie six ways (see AGENTS.md); mutation-check every new assertion.
- Never hardcode the ABI number in a test — pin against the family's
  `*_ABI_VERSION` (a two-digit-only regex already broke once at v100).
- Original-binary defects are reproduced and pinned, never "fixed".
