# Handoff — read this first (2026-08-31)

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

- Update slice **ABI 100**. `npm test` **3890/3890** (warm ~1m17s; the
  family suites cache their wasm builds — `tests/wasm-build-cache.mjs`).
- `decomp:verify-slice` differential **5387 cases pass**.
- recomp host selftest **77/0**, `tests/recomp-host.test.js` **33/33**.
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
`scripts/recomp/` statically recompiles the whole PE to wasm (96% of .text
lifted). It now **boots**: `build_boot.py` links a reproducible `boot.mjs`,
`isaac_fs_seed` seeds the packed archives, and a seeded run gets through win32
init → `ntdll!RtlVerifyVersionInfo` → 117 CRT initialisers → Steam → GL
"4.6.0" → asset loading with real textures, then traps on the undecoded lifted
function **`sub_00ab2d80`**. Reproduce:
`cd output/recomp/lift/boot && node boot_integration.mjs ../../host/isaac.segs.bin main`
(the 271 MB relink via `build_boot.py` is ~442 s).

**Exact next unit (B):** finish the lifter's SSE wide-op coverage so
`sub_00ab2d80` lifts. `lift.py`'s `lower_wide` already gained `INT_SRIGHT`
(this session, correct-by-construction but NOT yet oracle-verified — no psrad
function fully lifts yet). Remaining, all in `lower_wide`, all named in
`decomp/frontier.json` → `machineTrack`: wide `CALLOTHER` intrinsics
(`0x00ab2f9e`/`0x00ab2ff4`), `subreg` size 16/32, `INT_NEGATE` size 16
(~25 of the 36 unlifted `gu` functions). Verify each **per-function against the
Unicorn differential** (`scripts/recomp/oracle/differential.py`) BEFORE the
442 s boot rebuild — a wrong SSE lowering silently miscompiles. Deferred
follow-up: add `sfx.a` to `boot_integration.mjs` `BOOT_ARCHIVES` (audio-init
trap, later). Full boot state + fixes: `docs/recomp-boot.md §10`.

## Ground rules that bite (from AGENTS.md, do not relearn the hard way)
- The tree wins over any doc "checkpoint" number — status.mjs is truth.
- Counts are exact index censuses, never `~`; zero-at-load `.data` is constant
  only with an empty writer census bounded to the censused range.
- Green can lie six ways (see AGENTS.md); mutation-check every new assertion.
- Never hardcode the ABI number in a test — pin against the family's
  `*_ABI_VERSION` (a two-digit-only regex already broke once at v100).
- Original-binary defects are reproduced and pinned, never "fixed".
