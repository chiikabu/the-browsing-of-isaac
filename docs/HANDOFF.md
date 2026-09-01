# Handoff — read this first (2026-09-01, harness round 3)

One page to orient a fresh session. Everything below is committed on
`codex/decomp`. Do the two session-start steps in AGENTS.md, then pick a front.

## Orient in two commands

```
node scripts/decomp/status.mjs          # live family ABIs, open boundaries, verification freshness, tree-consistency ERRORS/WARNINGS
node scripts/decomp/brief.mjs <VA|idx>  # one-call orientation for a specific Update boundary (+ live-bridge lane delivery)
```

If status prints an **ERRORS** block, the tree holds somebody's unfinished
unit (stranded mutant, JSON drift, header/model ABI skew) — repair that
before anything else; the unit gate refuses such a tree.

Censuses go through the prebuilt PE index — never hand-roll a decoder:
`python scripts/decomp/tools/pequery.py batch "body 0x.. ;; callers 0x.. ;; writers 0x.. ;; fieldrefs 0x<disp> 0x<func>"`
(`npm run decomp:index`, ≈50 s; decode config **v2** carries the object-field
`fld` table). The whole unit gate is `node scripts/decomp/verify-unit.mjs`
(preflight → slice build → everything in parallel; `--handoff` adds strict
preflight + `npm test`; sets up the emsdk env itself). Standalone suites still
REQUIRE emsdk on PATH:
`export EMSDK=$HOME/emsdk; export PATH=$HOME/emsdk:$HOME/emsdk/upstream/emscripten:$PATH`.

## Verified state at handoff

- Update slice **ABI 101** (idx-3 leaf-5 `0x74f090` fold landed; count still
  24 open / 27 resolved). `decomp:verify-slice` differential **5392 cases
  pass**, `leaf5=2p/4h` (both 0x74f090 verdicts exercised), 210 s.
- Slice suite **864/864**; `npm test` **3894/3894** (warm ~80 s).
- Tree consistency (`verify-unit.mjs --preflight`) clean: no literal ABI pins
  in any suite, JSON canonical and in sync with the model layout, no
  stranded mutants.
- recomp host selftest **82/0**, `tests/recomp-host.test.js` **33/33**;
  wide-op differential vs Unicorn all green; boot module relinks clean
  (272,269,106 B, 0 undefined / 0 duplicate symbols) — unchanged this round.
- `node scripts/check-repo-safety.mjs` passes; no binary-derived material tracked.

## What changed this round (the flow, not the port)

The 2026-08-31 ABI-101 unit was found **stranded**: the cpp carried a
hand-applied `/* MUTANT */` (inverted 0x74f090 verdict, built and on disk),
the JSON was re-indented (74k-line diff), frontier/port log not updated,
slice suite 93-red on literal `abiVersion, 100` pins. Every one of those is
now mechanically caught or impossible:

- `scripts/decomp/lib/consistency.mjs` — shared checks (status.mjs, gate
  stage 0, toolkit test): ABI agreement header/model/JSON, cpp size pins,
  JSON layout drift + canonical form, stranded mutants, literal ABI pins,
  frontier freshness, uncommitted unit files.
- `scripts/decomp/slice-json.mjs check|fmt|sync` — the only writer of
  `decomp/game-update-slice.json`. `sync` found the spec had drifted from the
  model layout for many versions (139 lanes missing, 255 stale offsets, 9
  events missing) and back-filled it.
- `scripts/decomp/mutate.mjs --file F --from A --to B -- <cmd>` — crash-safe
  mutation checks (stash + journal + tag + sha256 restore). Hand-edited
  mutants are banned in AGENTS.md.
- `verify-unit.mjs` restaged: 1 s preflight, slice build once + abi.json
  check, then all gates in parallel (wall ≈ the differential).
- `pequery.py fieldrefs DISP [FUNC]` — exact `[reg+disp]` object-field
  census (r/w/rw/addr + base register), whole-.text or per function.
- `brief.mjs` prints live-bridge lane delivery — which exposed that the
  shipped bridge delivers **0 of 6** `opaque0092f1c0*` lanes: the entire
  92f1c0 try_pure ladder (ABI v86→v101) is dormant in the live tick.
- All 15 family suites pin ABI symbolically (`HEADER_ABI_VERSION` parsed
  from the `.h`); 700+ literals swept.

## Two work fronts

### A. Hand-decomp boundaries (the verified per-boundary track)
The Update slice is `Game::Update` translated to a zero-import wasm slice with a
JS oracle + 5392-case differential. **The free boundary removals are
exhausted** — idx 2/3/4/5/8/11/22/35 are assessed and pinned (read them with
`brief.mjs <idx>`; verdicts are the `assessment20260831*` keys). All remaining
open boundaries are stays-host or narrowed; genuine removal needs shipped-path
capture blobs or depth-translation of standing blockers (entity-list
`0x4186c0`, player-entry stores `0x7abe20`, ANM2::Load, rain-create).
**Highest-value count-neutral unit:** wire the 92f1c0 receiver capture
(`opaque0092f1c0Ready/Mode/Counter/Limit/Field14/GameType0`) into
`web/js/native-update-bridge.js` `captureUpdateLanes` + the bridge suite, so
the v86→v101 narrows actually run live; then re-measure the tick. Other ready
narrow: idx 4 mode-3 `0x82eb90` fold. Rules + measured lessons: `AGENTS.md`;
unit procedure: `docs/unit-runbook.md`; archived narratives:
`docs/decomp-history.md`.

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
`docs/recomp-architecture.md §18`, `docs/recomp-boot.md §10`. `pequery.py
fieldrefs` is the right tool for "who writes this map / this count field".

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
- Green can lie six ways (see AGENTS.md); mutation-check every new assertion
  **through `mutate.mjs`**, never by hand-editing a tracked file.
- Never hardcode the ABI number in a test — pin against the family's
  `*_ABI_VERSION` and `HEADER_ABI_VERSION`; the preflight refuses literals.
- `decomp/game-update-slice.json` is written only by `slice-json.mjs sync`.
- Commit a landed unit before the session ends; an uncommitted unit is
  invisible to the next session's orientation.
- Original-binary defects are reproduced and pinned, never "fixed".
- Tooling note for Claude Code sessions on this machine: heredocs through the
  Bash tool lose backslashes (`\s` → `s`); write files with the Write tool
  or spell backslashes as `String.fromCharCode(92)`.
