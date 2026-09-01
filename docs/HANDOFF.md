# Handoff — read this first (2026-08-31, round 9)

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
- recomp host selftest **82/0**, `tests/recomp-host.test.js` **33/33**.
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
seeded boot gets through win32 init → CRT → Steam → **EOS** → GL "4.6.0" →
libtheora/libvorbis → **two `SwapBuffers`** → 31,423 guest heap allocs (peak
53.5 MiB) → the version banner `Repentance+ v1.9.7.17.J460`, guard intact
after `main`. Reproduce:
`cd output/recomp/lift/boot && node boot_integration.mjs ../../host/isaac.segs.bin main`
(logs: `run-fix1.log` traced, `run-gu2.log` untraced).

**Exact next unit (B) — the archive mount, inside the guest.** The boot fails
to open every packed archive, 33 `AnmCache` loads fail behind it, and the HUD
dereferences the null ANM2 at `0x009a26c2`. This is **not** an FS-shim
problem: `ISAAC_FS_TRACE=1` shows the archives are never `fopen`ed at all.
The decision happens in `0x00a179c0` → `0x00a17180` → `0x00a16c60`, which
resolves relative paths only through a per-mount-root `std::map`. In the
trapped run there is exactly one mount root
(`[0x00c379e8]`=`0x00d09ca4`, `[0x00c379ec]`=`0x00d09ca8`), its map at
`0x00d09c30` has `_Mysize == 0`, and the loaded-archive count `[0x00c37b14]`
is 0 — nothing ever populated the index, and mounting scans nothing
(`0x00a16e00`, 54 insns, no FS API). Two threads to pull: what fills a mount
root's map, and the archive list `0x009aa040` walks at `[0x00bfae60]` (no
writer in `.text`). `0x00a17180` has an absolute drive-letter branch that
bypasses the VFS — a lever if the names can be made absolute. Full analysis:
`docs/recomp-architecture.md §18`, `docs/recomp-boot.md §10`.

**Debugging tools (use these before adding a printf):**
- `ISAAC_FS_TRACE=1` — logs every FS probe the shim answers, and how.
- `ISAAC_DUMP32=0xc379e8:4,0xc37b14:2` — prints guest dwords after `main`
  traps. Guest memory is identity-mapped into the wasm heap and the harness
  still holds the module after the abort, so an engine static costs nothing
  to read. A relink is ~7 minutes; this is free.
- `python scripts/recomp/oracle/wideops.py` — one x86 instruction at a time
  vs Unicorn. Run it before any ~17-minute full rebuild after a lifter
  change; it is what caught the Ghidra SLEIGH `PSLLD`/`PSLLQ` per-lane-count
  defect that had been silently miscompiling 12 real sites.

**Rebuilding** (only if you change the lifter): `emit.py` (~400 s; exact
invocation recorded in `output/recomp/lift/gu/summary.json` → `argv`, and in
recomp-architecture.md §17.6) → `patch_reentry.py --dir output/recomp/lift/gu
--exe tools/isaac-ng.unpacked.exe` → `build_boot.py --dir
output/recomp/lift/gu` (compile ~576 s, link ~425 s). `--trace-va` and
`--hand-written` are both load-bearing — without `--trace-va`
`dispatch_tbl.c` does not even compile. **A host-only change needs no
re-lift**: `build_boot.py` reuses the lifted objects (~16 s + ~355 s link).

## Ground rules that bite (from AGENTS.md, do not relearn the hard way)
- The tree wins over any doc "checkpoint" number — status.mjs is truth.
- Counts are exact index censuses, never `~`; zero-at-load `.data` is constant
  only with an empty writer census bounded to the censused range.
- Green can lie six ways (see AGENTS.md); mutation-check every new assertion.
- Never hardcode the ABI number in a test — pin against the family's
  `*_ABI_VERSION` (a two-digit-only regex already broke once at v100).
- Original-binary defects are reproduced and pinned, never "fixed".
