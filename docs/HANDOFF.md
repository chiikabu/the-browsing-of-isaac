# Handoff — read this first (2026-09-02, harness round 3 + recomp boot round 14e)

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
- recomp host selftest **130/0**, `tests/recomp-host.test.js` **35/35**
  (two new pins: vbase-ctor purges + `PURGE_PATCHES` vs the shim table;
  every `missing_fns.c` body pops its return address); boot module relinks
  clean at `-O0` (~2.5 min host-only; `--opt-link` for shipping).
- Boot (from the instance dir) seeds the whole extracted instance tree
  (11,197 files, 243 MB) + 6 small archives, parses `players.xml` and the
  other xml tables, loads every UI anm2, prints `Viewport: 960x540` and the
  framebuffer/window metrics, and enters mods-init. See front B below.
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

**Round 10b (2026-09-01): the msvcp140 iostream layer.** `host_shims_msvcp.c`
re-implements the streambuf / basic_ios / istream / ostream / iostream members
on the real MSVC x86 object layout (54 imports; abi-notes at
`output/decomp/_scratch/msvcp140/abi-notes.md`). It also found the GENERAL
baked-purge class: the lifter bakes each host-import call's stack purge into
the caller at lift time, so a purge corrected in `gen_shims.py` after a lift
needs a `PURGE_PATCHES` entry in `scripts/recomp/lift/lift_patches.py`
(`--check` lists stale sites; `build_boot.py` recompiles only the touched TUs).

**Round 11 (2026-09-02): four walls, three of them round-10 misdiagnoses
(recomp-architecture.md §20.3, §21; the rules are now in AGENTS.md).**
(1) The "callee-saved register leak" was round 10b's own curation:
`??0basic_iostream` / `??0basic_ostream` are vbase constructors and pop a
hidden `most_derived` int, so their purges are the measured 8 / 12, not the
decorated-name 4 / 8; the lifted stringstream ctor under-popped and its
epilogue restored ebx/esi/edi one slot low (`edi == cookie ^ ebp` was the
tell). (2) The instance is a ResourceExtractor dump, not a Steam layout, and
KAGE tries the archive index before a root's loose map, so round 10's restored
`resources/` root made the stale small archives (config.a's Afterbirth+
`players.xml`) shadow the Repentance+ files: the `0x009ab970` lift patch is
gone (canonical stub), the boot seeds the whole extracted tree, RAM-FS
16,384 slots. (3) The six hand-written callees in `missing_fns.c` never
emulated `ret`; each call left its return address on the guest stack
(`rc_ret(s)`, test-pinned). (4) Every `SteamXxx()` accessor other than the two init-dance slots
(`0x00bf93c8`, `0x00c5c510`) now reads NULL (`steam_fake_slots` allow-list in
`host_shims_steam.c`): the fake 16-slot vtable cannot serve real interfaces
— `ISteamUGC` +0x128 was a NULL call, and `ISteamApps::BIsDlcInstalled`
(+0x1c, pops 4) served by `CSteamAPIContext_ReleaseInterface` (pops 8)
drifted the stack and returned `edi = esi`, which is what the "dead Sprite
string" in Menu Save Init really was. Selftest-pinned and mutation-checked. New tool: the
CRT noreturn shim prints the last 512 VAs, live registers and the guest stack
from ESP (`isaac_dump_trap_context`); `recomp_mem_fault` walks the stack
too; `ISAAC_LOG_TIME=1` stamps log lines; `ISAAC_WATCH=0xLO:0xHI[:w]` is a
runtime guest-memory watch (prints writer VA + value). A full boot takes
~11-12 min of wall time, 567 s of it PNG decoding in lifted code (the
4096² font atlases dominate; §21.7) — a host PNG decode is the fix when it
matters. The guest heap layout moves between runs (time-seeded RNG): never
compare a register image from one run with a dump from another.

**Round 11c / 12 (2026-09-02, commits f9dc764, 13c1488, + frame cap):** the
import census now counts register-held loads of an IAT slot (`mov r32,[slot]`
… `call r32`), which is how `LoadImageA`, `SendMessageA` and 25 other
imports are reached; each has a signature-derived purge and a running
verdict (`tests/recomp-host.test.js` refuses a reachable NEVER_CALLED /
unknown-purge import; mutation-checked). With them the boot leaves engine
init: every menu initialises (Title … Online Awards) and the game's frame
loop runs. Its first frames re-created the render target every frame because
the GL shim answered 0 to `GL_RENDERBUFFER_WIDTH/HEIGHT`; the shim now
remembers renderbuffer storage per name (selftest 134). Because the loop only
ends on window close, `ISAAC_MAX_FRAMES=N` posts one `WM_QUIT` through
`PeekMessageW` after N presented frames (`SwapBuffers` counts and stamps
every 60th) so a run returns from `main` normally (§21.10; selftest 136).

**Measured (round 12, 5-frame bounded run):** the main loop runs at
**~135 ms per frame** in the debug build (frames 4–6: 143/137/132 ms);
frames 1–2 are the loading screen during init, frame 3 comes 418 s later
(menu init + first-frame asset loads). The cap ends the run cleanly
(`WM_QUIT` → `Isaac is shutting down...`); the first shutdown trapped on an
unlifted adjustor thunk `0x0069d1f0` (hand-written now) and the host atexit
table was silently dropping destructors past 64 (now 1024). Per-frame shim
traffic: ~40k `Enter/LeaveCriticalSection` stub calls per frame (the
biggest single cost candidate), one `_EOS_Platform_Tick`.

**Round 12d (commit bb53dfd) — the measurement that changed the plan.**
The guest-instruction profiler (`ISAAC_PROFILE=1`) blamed PNG unfilter
37% / inflate_fast 27% / adler32 8.7% / premultiply 8%. Exact host versions
of three of them (`host_fastpath.c`, installed by `lift_patches.py`
`WRAP_PATCHES` as wrappers: `ISAAC_FASTPATH=0` lifted, `ISAAC_FASTPATH_VERIFY=1`
both + byte compare, default host) verified **0 mismatches over 533 PNG
decodes** — and frame 3 still came at 416 s (418–470 s before). 54% of the
lifted instructions gone, 0 s saved: the boot's minutes are **host-side
wall time** (shims, FS, allocator, JS glue) that a tick profiler cannot
see. Shutdown now passes `~Thread` (adoption sets the done flag) and then
reached the unlifted 6-byte element destructor `0x00a67fd0` through the
CRT's `__ehvec_dtor` (hand-written in `missing_fns.c`).

**Round 12e (the profile answered):** `node --cpu-prof` on the boot put
**95.4% of wall time in `guest_malloc`** -- the round-2 first-fit walk
over every block. Replaced by segregated explicit free lists with
two-way coalescing (same header, footer added, same guards and meter;
mutation-checked pins in the selftest). **Boot to frame 3: 416 s -> 10.6 s;
frame loop 135 ms -> 1-3 ms per frame; clean shutdown, main returned 0.**
Rule added to AGENTS.md: speed units start from a wall-time profile of the
whole process, never from the guest-instruction histogram (it was off by
30x here).

**Round 12f:** the RAM-FS got a hash index (fs_find was a strcmp over
all 16,384 slots) and lazy file bytes (the driver registers the 11,197
instance files with their sizes; bytes are read on first open through
`Module.isaacLazyRead`). A 5-frame boot reads 643 files (31 MB) and takes
**12.4 s start to exit**; the host heap no longer carries the 208 MB copy.

**Round 13 (2026-09-02): THE GAME RENDERS.** `build_boot.py --web` links
the same lifted objects for the browser (host TUs rebuilt with
`-DISAAC_WEB=1`, MEMFS, WebGL2); `host_gl_webgl.c` forwards the whole
opengl32 surface to WebGL2 (the census of §21.17 showed nothing needed
translation beyond a GLSL ES precision header); `scripts/recomp/web/run_web.mjs`
runs it under Playwright's headless Chromium (SwiftShader), serving the
instance from a local HTTP server, and writes the presented frames as
PNGs. 5-frame run: main returned 0, 0 GL errors, 36 draws, frame 4 = the
main menu's paper backdrop; frame 120 of a 120-frame run = the Repentance+
Beta welcome popup, text and fonts intact. Run it:
`python scripts/recomp/lift/build_boot.py --web && node scripts/recomp/web/run_web.mjs output/recomp/web-run 120`
then open `output/recomp/web-run/frame_*.png`. `ISAAC_GL_CHECK=1` as a
trailing `K=V` argument names any GL error's caller.

**Round 14a (2026-09-02): INPUT WORKS, the menus are navigable.** Scripted
key/mouse timelines (`input=420:Enter,470:Enter,520:Enter` on the web
runner, `ISAAC_INPUT=...` on the node driver) become Win32 messages in a
real queue that GLFW's own pump and WndProc consume (§21.18). Enter x3
takes the game from the beta notice through the title to FILE SELECT and
the main menu. Gotchas recorded: the DirectInput "Message" window is
created last (keys must target the GLFW30 window), and the focus messages
must be sent before any key.

**Rounds 14b-14c (2026-09-02): the run starts.** Enter x7 (beta notice,
title, file select, NEW RUN, character select) starts a new run under
the web build. Three lifter gaps fell on the way in, each fixed in the
lifter and re-lifted (a lifter change is a whole-tree re-lift + full
recompile, ~25 min; keep gu-prev*/ for rollback): the jump-table bound
took a bare `cmp` as the table size (§21.19, censused over all 785 table
jumps), the 20k-instruction cap dropped the entity-spawn factory
`0x005d4380`, and jump tables embedded in `.text` failed whole functions
(§21.20; now soft stops). With the cap raised and the soft stops in, the tree lifts with 0 failures (23,238 functions, 42 TUs) and the spawn factory runs: the first entity spawns (Type 6, Variant 19) -- and both builds then hit V8's 'Maximum call stack size exceeded' with a flat guest stack, the subject of round 14d.

**Rounds 14d-14e:** the run's first entity spawn exposed two more
walls: guest tail jumps compiled as nested native calls (V8's "Maximum
call stack size exceeded" with a flat guest stack; fixed by the tail-jump
trampoline, §21.21 -- the loop lives only in caller frames) and the x87
register-convention CRT helpers `_CIfmod`/`_CIatan2` (§21.22). With the trampoline, the x87 helpers and the gap shims, the headless play run passes the first entity spawn with no native stack growth and no trap: the start room loads, its entities spawn, and the run is then inside a room-entry crawl -- a 20-second rapidxml attribute-parse stall (FUN_004165a0, parse_node/parse_element recursion over a document in the guest heap) with slow asset loads around it and no frame for minutes. That crawl is round 14h's wall; the V8 profile of it is the next measurement.

**Exact next unit (B):** read the first gameplay frames (web run
`input=420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter keep=50`,
1100 frames) and drive the player (`frame:w:30` holds W for 30 frames;
arrows shoot). Then: compare Game::Update under lifted code with the
hand-decomp slices, audio (OpenAL -> Web Audio), the per-job thread
design of §21.16, a live view (worker + OffscreenCanvas), and the PNG
chain as the remaining boot-speed unit.
walls (both index-verified, 2026-09-01): the only `CreateThread` is the
theoraplayer worker (`0x00aab120`); nothing on the init chain waits on it, so
the stub costs only video decode. **The frame loop** lives inside `main` at
`0x931231..0x931453` (entered after `0x9aa040` engine init returns): per frame
`glfwGetTime` (QPC) → `0x9ab6d0` (Steam `RunCallbacks`, EOS tick,
`push 1; call 0x954cd0` update+input: half-rate on `[Manager+0x4abbc]` parity,
`pollEvents` = `PeekMessageW`/`DispatchMessageW` loop, `GetCursorPos`, gamepad
`0xa6de60` via XInput/DirectInput COM) → `0x9555c0` render → inline
`glfwSwapBuffers` (`0xa7fb00`, `SwapBuffers` @`0xa7fb73`) → two `lua_gc` →
exit test `[window+0x1c]` (`glfwWindowShouldClose`) → pacing `Sleep(ms)`
@`0x9313cc` + spin `0x931438` until `glfwGetTime()-start ≥ 1/60`. Two spin
risks: `QueryPerformanceFrequency` must be non-zero (0 → NaN →
`Sleep(0x7fffffff)`); and `0x8fb120` mods-init starts a `_beginthreadex`
worker and renders `loading.anm2` until it joins — only when the mods vector
is non-empty (empty `mods/` skips it). GL goes through epoxy `.data` slots
(e.g. `epoxy_glClear [0xc0f960]`), not the IAT. Full analysis:
`docs/recomp-architecture.md §19`, `docs/recomp-boot.md §10`.

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
- A curated import purge must equal the callee's `ret N` (hidden MSVC
  params: vbase `most_derived`, by-value class returns), and every
  hand-written guest callee must emulate its `ret`. A callee-saved register
  holding `cookie ^ ebp` names the frame whose epilogue popped one slot low.
- The instance is an extracted tree; the canonical exe's `0x009ab970` patch
  (no `resources/` root) is load-bearing. Do not restore it.
- Tooling note for Claude Code sessions on this machine: heredocs through the
  Bash tool lose backslashes (`\s` → `s`) — a C `"
"` written that way
  became a raw newline and broke a build; write such files with the Write
  tool or spell backslashes as `String.fromCharCode(92)`.
