# Handoff — read this first (2026-09-01, harness round 3 + recomp boot round 10)

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
- recomp host selftest **103/0** (was 82; wide directory-scan chain,
  `GetFullPathNameW` size protocol, 700-file capacity), `tests/recomp-host.test.js`
  + `recomp-wideops` **34/34**; boot module relinks clean at `-O0` in 133 s
  (284,065,116 B; `--opt-link` = the 272 MB wasm-opt build, ~9 min).
- Boot (from the instance dir) loads 6 archives + 476 loose files, **0 asset
  misses**, runs `main.lua`, stops at the first msvcp140 iostream call
  (`0x00684d24`). See front B below.
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

**Round 10 (2026-09-01): the archive/asset wall is down.** Three defects,
none in the archive code: the KAGE mount-root index is a **directory scan**
over `GetFullPathNameW → FindFirstFileW/FindNextFileW → wcstombs_s` and four
of those shims were wrong (size-query returned 0; W pair stubbed; unknown
stdcall purge on the register-held `FindNextFileW`); the install's 476 loose
`resources/` files (`.anm2`, shaders, Lua, xml) had never been seeded (only
archives), and the RAM-FS capacity could not hold them; and `0x009ab970` —
the function that creates the `resources/` mount root — was one of **this
project's own emulator-era hand patches** (`push ebp; mov ebp,esp` →
`xor eax,eax; ret`; pristine bytes in `tools/isaac-ng.unpacked.exe.pre-coinit`),
now undone by the re-applicable lift patch `scripts/recomp/lift/lift_patches.py`.
Boot now: 2 mount roots, 6 archives loaded (`[0x00c37b14]=6`), **0 `Could not
open`**, all shaders init, renderbuffers, OpenAL/theora, `enums.lua`+`main.lua`
run. Run it **from the instance dir** (the host Lua's libc is NODERAWFS):
`cd .scratch/game-instance && ISAAC_FS_TRACE=1 node ../../output/recomp/lift/boot/boot_integration.mjs ../../output/recomp/host/isaac.segs.bin main`.
Host-only relink is now **~2 min** (`build_boot.py` links at `-O0` by default:
474 s → 8 s; `--opt-link` for shipping).

**Exact next unit (B) — the MSVC C++ iostream runtime.** The boot stops at
`msvcp140.dll!basic_ios<char>::basic_ios()` called from `0x00684d24` inside
`0x00684ce0` = `std::stringstream(const std::string&)`, whose caller
`0x0067f420` (41 callers) is the game's whitespace tokenizer
(`vector<string> split(const string&)`: `>> string` loop until fail|bad) used
by the anm2/xml attribute parsers. 54 msvcp140 imports (~180 sites), five
stream constructors: `0x00414330` (`stringstream()`), `0x00684ce0`,
`0x008fb120` and `0x009036b0` (parse with `operator>>(size_t&)`),
`0x009e8010` (`fstream` via `_Fiopen`). Two viable routes: implement the
export subset on the real MSVC x86 object layout (reference:
`C:\Windows\SysWOW64\msvcp140.dll` 14.44 — basic_ios/iostream/streambuf
ctors+dtors, `_Init`, `sgetc/sbumpc/snextc/_Pninc`, `_Ipfx/_Osfx/setstate`,
the integer `>>`/`<<`, `write/put/flush`, `_Fiopen`; the virtuals
`underflow/uflow/overflow` live in the GAME's stringbuf/filebuf vtables and
must be invoked through the host→guest call path), or override the five
consumers at game level (needs exact MSVC `std::string`/`vector` layouts and
the guest allocator). Everything hit before that trap is proven; every other
msvcp import keeps trapping loudly until implemented. Scout facts for later
walls: the only `CreateThread` is the theoraplayer worker (`0x00aab120`);
nothing on the init chain waits on it, so the stub costs only video decode.
Full analysis: `docs/recomp-architecture.md §19`, `docs/recomp-boot.md §10`.

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
