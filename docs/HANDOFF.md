# Handoff — read this first (2026-09-04, recomp rounds 26-29: fixes, video, bundle, automated player)

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
- Slice suite **864/864**; `npm test` **3923/3923** (warm ~84 s).
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
  framebuffer/window metrics, and enters mods-init. **It then plays**: a
  scripted run reaches a Basement and walks between rooms; one 30-minute
  soak presented **142,680 frames (79 fps)**, 1.12 billion dispatches, 0
  misses, no stall. **That run was lucky**: two later runs both hung
  shortly after the first room containing enemies, once after the game's
  own `CellSpace::insert: x1 > x2` assertion and once in an entity-trail
  ring-buffer loop at `0x00942c0e` whose capacity field is zero
  (§21.32). That is the next unit of work. See front B below.
- **Audio runs end to end, in node and in the browser** (§21.39,
  2026-09-04): with the DLC archives mounted, the `resources/` root back
  and the sound-source open un-patched, a 240-s debug-profile node run
  uploads **92 PCM buffers (5.7 MB, 33.8 s of audio), plays 17,
  queues/unqueues 85/61 music stream buffers**, peaks at 354 MiB of guest
  heap and exits clean after 3,540 frames; the fast browser module under
  headless Chromium uploads **329 buffers (42 MB, 385 s of audio), plays
  102**, WebAudio context running, **1,501 frames in 67.6 s wall**. The
  boot spends ~65 s (debug profile) mounting 1.2 GB of archives through
  the windowed reader before the first real frame.
- The browser build is **interactive** (§21.39 round 25): JSPI, live
  keyboard/mouse, 41 fps overall / 49-59 in play under headless Chromium;
  `drive_interactive.mjs` reaches a run with held Enters and walks (§21.40).
- **Round 26**: the mount no longer checksums every archive entry
  (`ISAAC_ARCHIVE_VERIFY=1` restores it): the debug boot's second frame at
  2.9 s instead of 65 s, the browser's 1,500 frames in 48.7 s instead of
  67.6. **Video plays** (`ISAAC_CUTSCENE`, the Epilogue's `.ogv` decoded,
  shown and finished; twelve SSE intrinsics implemented and oracle-checked).
  The archive toolchain (`scripts/recomp/assets/`) reverses all three
  container versions with a 27,236/27,236 checksum proof; lossless PNG and
  Vorbis q3 music shrink the mounted set 1,070 → 750 MB, validated in-engine.
  The raw string-table keys (`#BASEMENT_NAME`) turned out to be the
  entry-first lifter bug (§21.41), fixed the same day: the banner reads
  "Basement".
- **Round 28: the shipping bundle** (§21.43, 2026-09-04). `.scratch/game-bundle`
  is **733,800,939 bytes in 22 files, 37.87 % of the 1,937,711,471-byte
  instance**: the ten archives the engine mounts (1,069,689,641 →
  733,456,838 bytes: lossless PNG, music at Vorbis **q4** -- q3 is 9.8 %
  smaller, outside the 5 % rule -- and the 2,453 entries a later mount
  shadows dropped, last-mount-wins read off the 0x00a17dc1 insert), the Lua
  under `resources/scripts` and `savedatapath.txt`. Dropped by census
  (`ISAAC_FS_TRACE=1` + a host-level fs hook + `run_web.mjs`'s new
  `served_files.json`): `repentance.a`, the 11 language packs, the loose tree
  (read 0 times), the executables and run-time state. Built and checked by
  `scripts/recomp/assets/bundle.py` (manifest `.bundle.json` with sha256s;
  `tests/recomp-bundle.test.js` 5/5). **Proven from the bundle**: node
  timeline (Basement, 3,000 frames, 0 asserts, 39 PCM uploads / 11 plays),
  node cutscene (the Epilogue `finished playing`), browser (3,001 frames,
  Basement, 314 uploads / 14 plays, 76.8 s wall) -- and the engine's own log
  is line-for-line identical to the pre-bundle run (523/523, 750/750).
  The fast browser module itself is 50,769,868 bytes (code section 49.2 MB,
  name section 0.4 MB) and **11,341,999 bytes gzipped** -- serve it with
  `Content-Encoding` and it is 1.5 % of the bundle.
- **Round 27 (2026-09-04, §21.42): the fast profile's dispatch census had
  a wrong name on its top entry.** The four 17.75 M-dispatch fragments were
  not the CRT memcpy (a vcruntime import) but the `switch (i & 3)` cases
  of Bob Jenkins' `isaac()` -- the v2 archive keystream refill, 256
  dispatches per call, 71 M of 93 M. Nine exact host wrappers
  (`host_fastpath.c`, `WRAP_PATCHES`): `isaac()`, the keystream XOR,
  `ArchivedFile::read`'s window path, `Mutex::Lock/Unlock`, the handle
  `AddRef/TryAddRef/Release` and the owner check. **Verified: 16,169,397
  calls compared, 0 mismatches** (`ISAAC_FASTPATH_VERIFY=1`; the stub
  report now prints a per-wrapper census). Dispatches **92.55 M -> 11.25 M**;
  on one module, A/B medians of three pairs: boot to frame 3 **4,615 ->
  2,913 ms**, steady gameplay 30 -> 27 ms per 60 frames, whole module run
  **10,979 -> 9,597 ms**; the floor-load window alone is 0.7 s slower
  (§21.42 says what was tested: with V8 tier-up off the host wins every
  phase, 11,137 -> 8,938 ms, so it is the compiler's timing). Browser
  (`web-r27`, fast module, headless Chromium): 3,000 frames, Basement,
  `main` 0, 0 asserts, WebAudio running, 77.4 s including the archive
  fetch -- GL-bound at ~50 fps in play, as before. `node --test
  tests/recomp-*.test.js` **122/122**; selftest **229/0** (seven mutants
  killed through `mutate.mjs`).
- **Everything together** (2026-09-04): the automated player on the fast
  profile with the round-27 fastpaths, booted from the shipping bundle
  (`ISAAC_INSTANCE_DIR=.scratch/game-bundle`), 20,000 frames: the same
  census as the debug profile on the original instance (8 rooms incl. a
  Lust miniboss room, 11 transitions, 5 runs, 4 deaths, 3 pickups), 0
  asserts, 0 raw string keys, **0 fastpath mismatches**, 1,694 PCM uploads /
  1,518 plays, 61 M dispatches (200 M before the fastpaths), main 0.
- **Round 30 (2026-09-04, §21.45): a floor descent and a boss through the
  game's own debug console.** `ISAAC_CONSOLE="cmd1;cmd2"` on the node
  driver seeds `options.ini` (`EnableDebugConsole=1`, `SaveCommandHistory=1`,
  `VSync=0` -- with a file present `OptionsConfig::SetVSync(1)` asks for a
  monitor the headless host has not got) and `cmd_history.txt` into the
  RAM-FS only, opens the console with the grave key (GLFW key 0x60) once the
  explorer's run has started, recalls each command from the history with
  UP -- typed characters cannot reach it: the console reads text through
  GLFW's char callback, i.e. WM_CHAR, which the host never builds
  (`TranslateMessage` is a stub); a host change of one of two shapes is
  written up in §21.45 -- verifies the input line's text in guest memory,
  Enter, and closes. Debug profile, epoch 1700000000: `stage 2` ran at
  frame 488 (`Level::Init m_Stage 2, m_StageType 0 Seed 1037090446` that
  frame; the explorer's room list reset to Basement II, three rooms walked,
  3,000 frames, 0 asserts); `debug 3; debug 4; goto s.boss.1010` put the
  explorer in **`Room 5.1010(Monstro)`** (room -3, `bosses 1`, the NPC
  census reading `t20.0` at the centre), 295 frames of hunting later
  **`TriggerBossDeath: 0 bosses remaining`**, the boss item `5.100.659`
  spawned, the door reopened, 4,000 frames, 0 asserts, main 0. **No trapdoor
  in a `goto`'d boss room by the engine's own rule** (Room::Update's clear
  path branches on room index -3; the trapdoor spawns belong to the floor's
  real boss room). The explorer now knows the floor, the room config's
  type/variant, the live-boss counter, the trapdoor's vtable in the grid
  (it walks onto one it sees) and suspend/resume; `tests/recomp-console.test.js`
  (9) + four explorer tests. Both runs went quiet for **474 s at the music
  restart** (frames 360-420; the first boss attempt sat >10 min there and
  was killed): round 14j's node-on-Windows heap class, not the game.
- `node scripts/check-repo-safety.mjs` passes; no binary-derived material tracked.

## What changed this round (rounds 22-25: audio root cause, threads, JSPI)

The port was silent for three reasons, none of them audio code, all of
them ours (§21.39):

1. **The sounds were not in the instance.** Every Repentance sample and
   the title theme live in `afterbirth.a` / `afterbirthp.a` /
   `repentance.a` (1.2 GB), never seeded. They are in
   `.scratch/game-instance/resources/packed/` now, registered lazily and
   served through 1 MB windows (`host_shims_fs.c`, `isaacLazyPread` in
   both drivers) -- never loaded whole.
2. **The archive index was unreachable.** Its keys are `resources/<path>`
   and the project's own `0x009ab970` patch had removed the `resources/`
   mount root. The round-10 override is back (`lift_patches.py PATCHES`).
3. **The open itself was patched out.** `0x00a2b5c2` ("branch forced" in
   §19.5) skips the open of every sound source after construction. Undone
   by a block-level lift patch (`BLOCK_PATCHES`, plus `LIFT-PATCH REENTRY`
   markers mkdispatch honours).

Around it: guest thread jobs run as per-frame slices with a join on
thread-handle waits (host_shims_module.c); the guest heap is 768 MiB (the
catalogue is 269 MB of PCM) and the host base moved to `0x34000000`
(isaac_host.h, build flags, `gen_shims.py` reads the shim base from the
header); observe-only probes and string probes; `RaiseException`
0x406D1388 swallowed; the browser build is interactive under JSPI
(round 25, `run_web.mjs interactive=1`).

New pins: `tests/recomp-threads.test.js` (6), `tests/recomp-archives.test.js`
(6), `tests/recomp-memory.test.js` (2), `tests/recomp-jspi.test.js` (5);
selftest 196 checks (two stale pins fixed: the import canary is 728, the
adopted-thread contract runs with slices off).

## Try it yourself

```
node scripts/recomp/web/run_web.mjs output/recomp/web-live 4000 serve=1 port=8099 fast=1     "input=420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter,900:d:150,1150:w:150" keep=200
```

Interactive (round 25; the module yields to the event loop every frame and
takes real keyboard/mouse input):

```
node scripts/recomp/web/run_web.mjs output/recomp/web-live 4000 interactive=1 port=8099 fast=1
```

The automated player (round 29, §21.44): 20,000 frames of rooms, pickups,
hunting, deaths and restarts on a pinned floor, with a census at the end
(`explorer: {...}` -- transitions, rooms, runs, deaths, pickups, counters):

```
cd .scratch/game-instance && ISAAC_EPOCH=1700000000 ISAAC_MAX_FRAMES=20000 ISAAC_DRIVE=explore node ../../output/recomp/lift/boot-fast/boot_integration.mjs ../../output/recomp/host/isaac.segs.bin main
```

The debug console (round 30, §21.45): `ISAAC_CONSOLE="cmd1;cmd2"` runs the
game's own commands once the run has started (a floor: `stage 2`; a boss:
`debug 3;debug 4;goto s.boss.1010`), by history recall -- nothing is written
to the instance; `console: {...}` at the end says what ran and when:

```
cd .scratch/game-instance && ISAAC_EPOCH=1700000000 ISAAC_MAX_FRAMES=4000 ISAAC_DRIVE=explore ISAAC_EXPLORE_CENSUS=1 ISAAC_CONSOLE="debug 3;debug 4;goto s.boss.1010" node ../../output/recomp/lift/boot/boot_integration.mjs ../../output/recomp/host/isaac.segs.bin main
```

To drive that page with real key presses under Playwright (state-driven:
Enter, held, until the game's own log says a run started, then walk; exit 0
only if the picture changed and `main` returned 0):

```
node scripts/recomp/web/drive_interactive.mjs "http://127.0.0.1:8099/boot_web.html?frames=1500&ISAAC_YIELD=1" output/recomp/web-drive
```

`serve=1` holds the local server open and prints the URL instead of driving a
headless browser; `fast=1` serves the speed-profile module (`build_boot.py
--web --fast`), which is the one that renders gameplay at ~50 fps. It loads
~300 MB of assets before the first frame.

The shipping bundle (round 28, §21.43): build it from the optimised instance,
check it, and run either driver from it (`ISAAC_INSTANCE_DIR=<dir>` on the
node driver, `instance=<dir>` on the web runner; the cwd rule still applies):

```
python scripts/recomp/assets/bundle.py build .scratch/game-instance-opt .scratch/game-bundle --original .scratch/game-instance --strict
python scripts/recomp/assets/bundle.py check .scratch/game-bundle
cd .scratch/game-bundle && ISAAC_INSTANCE_DIR=C:/Users/Luca/Desktop/isaac/.scratch/game-bundle ISAAC_EPOCH=1700000000 ISAAC_MAX_FRAMES=3000     ISAAC_INPUT="420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter,900:d:150,1150:w:150"     node ../../output/recomp/lift/boot-fast/boot_integration.mjs ../../output/recomp/host/isaac.segs.bin main
node scripts/recomp/web/run_web.mjs output/recomp/web-bundle 3000 fast=1 instance=.scratch/game-bundle     "input=420:Enter,470:Enter,520:Enter,580:Enter,640:Enter,700:Enter,760:Enter,900:d:150,1150:w:150" keep=500
```

`bundle.py classify <instance> --all` shows every file's verdict and rule;
`run_web.mjs` writes `served_files.json` (every file it served, requests and
bytes) next to `web-run.log`.

**Boot cost in the browser:** the DLC archives (1.2 GB) are fetched as 1 MB
byte slices while the engine verifies every entry at mount, so the first
frame takes a while; the node driver does the same from disk. Shrinking that
(skipping the per-entry checksum pass, or repacking only the entries the
game uses) is optimisation work, not correctness.

## What the port does NOT do yet (front B)

The engine loop is no longer the blocker -- a 30-minute session runs clean.
What is missing is feature surface and verification depth, and none of it
is started:

- ~~Browser gameplay is unverified.~~ **It is verified** (§21.38): the fast
  browser module (`build_boot.py --web --fast`, served by `run_web.mjs
  fast=1`) runs **1,500 frames in 44.9 s** under headless Chromium with
  software WebGL2, delivers every scripted input, returns 0 from `main`,
  and `output/recomp/web-gameplay/frame_1500.png` shows a Basement room
  with Isaac, the HUD, the minimap and two enemies. The old 1-fps figure
  was the debug module.
- ~~No audio yet.~~ **Audio plays, in node and in the browser** (§21.39):
  samples decode, bind and play; the title music streams. Headless
  Chromium, fast module, the HANDOFF timeline: **329 PCM uploads (42 MB,
  385 s of audio), 102 plays, 308/76 stream buffers queued/unqueued,
  WebAudio context running, 1,501 frames in 67.6 s wall** including the
  1.2 GB archive mount over `?off=&len=` byte slices, `main` returned 0.
  Node (debug profile, 240 s): 92-99 uploads, 17-23 plays, peak guest heap
  354 MiB.
- ~~Video is unverified.~~ **Video plays** (§21.40): `ISAAC_CUTSCENE=300:3`
  makes the frame present call `Manager::ShowCutscene(3)` (the Epilogue:
  anm2, then `001_Epilogue.ogv`, then the credits); the clip is decoded by
  the theoraplayer worker slice, uploaded frame by frame, logs `finished
  playing`, and the game returns to the title menu. It needed libtheora's
  `emms; ret` (a hand-written body) and twelve SSE intrinsics that had been
  aborting stubs, each now oracle-checked against Unicorn.
- ~~The start-room ping-pong (open, floor-dependent).~~ **Resolved
  (2026-09-04, §21.40): it was our square root.** `recomp_fsqrt_f64` was
  declared `double(double)` while the lifter passes bit patterns, so the
  game's `sqrtf` wrapper (0x00435a50) returned 0 for every vector length
  and the door-touch check fired for the first open door in slot order
  every frame; the `CellSpace::insert: x1 > x2` grind and the
  `Invalid entity position: inf/-nan` asserts were the same zero. With the
  bits-typed helper, epochs 1700000000/1/2 do **zero** transitions and
  zero asserts before any movement key (the "one transition" the old
  timeline expected was the defect stopping early). Replay a floor with
  `ISAAC_EPOCH=<unix seconds>`; `ISAAC_ROOM_PROBE=1` dumps the door-check
  inputs at every engine log line, `ISAAC_ROOM_TEST=1` runs the lifted
  door check in situ (far player must not fire, near player must).
- ~~The string table shows raw keys.~~ **Resolved (§21.41): 813 lifted
  functions started at their lowest block instead of their entry** (Ghidra
  bodies that absorbed a lower block; the string-table loader's second
  half returned through the loader's own epilogue). `lift.py` emits
  `goto L_<entry>` first now; `lift_patches.py --entry-first` gives the
  existing tree the same goto at build time; the HUD reads "The Sad
  Onion" instead of `#THE_SAD_ONION_NAME`. Any lifter change that
  reorders blocks must keep `tests/recomp-entry-first.test.js` green.
- **Round 29: gameplay is exercised by an automated player** (§21.44).
  `ISAAC_DRIVE=explore` on the node driver reads room, doors, players and
  the pooled NPC objects from the guest heap and plays: doors, hunting,
  sidesteps, death, the next run. 20,000 frames on one seed: **62 room
  transitions, 9 distinct rooms (shop, treasure, curse), 10 runs, 9
  deaths, 0 asserts**; enemies spawn, move, take damage and die; the
  player is killed (`Game Over. Killed by (244.0)`) and the game-over
  screen leads to the next run. The rendered browser run shows the head
  turn and the tears (`drive_interactive.mjs` holds ArrowLeft and keeps
  `shot_fire.png`).
- Pickups too: the explorer walks into keys, hearts, bombs and coins
  (a key raised the counter at `Entity_Player+0x135c` from 0 to 1; pedestal
  items in a shop are abandoned with no coins), and door choice spreads
  over the least-used door so a floor is walked, not bounced.
- ~~**Gameplay depth beyond that is untested**: pedestal collectibles, the
  trapdoor and floor descent, bosses, save/load.~~ **Round 30 (§21.45)
  exercised a floor change (`stage 2`: Level::Init, the new floor's rooms)
  and a boss fight (`goto s.boss.1010`: Monstro, its death, the reopened
  door, the boss item) through the debug console.** Still open: the real
  descent (the trapdoor spawns only in the floor's own boss room, which
  the explorer must reach by walking -- a door preference toward the
  level's boss-room index is the next unit), pedestal collectibles (the
  explorer now tries them after the other pickups), save/load.
- ~~**Gameplay depth is untested.**~~ The scripted input is a timeline keyed
  to presented frames, not a player: combat, damage, item pickup, floor
  descent, bosses and save/load have never been exercised. A run so far
  walks between two or three rooms.
- **Online is stubbed** (Steam, EOS), by choice.
- ~~The instance is missing DLC archives.~~ They are mounted (lazy,
  windowed). The **language packs stay unmounted on purpose**: the mount
  loop overwrites an equal-hash entry, so a mounted pack would shadow
  English assets; the log's "Failed to open archive file 'packed/*.a'"
  lines are those.
- ~~No shipping build has been measured.~~ **It has, and it is 20x faster**
  (§21.37): the same 1,380-frame gameplay scenario runs in **26 s with
  `--fast` against 525 s with the default profile**, i.e. **53 fps** with
  room transitions and enemies. Every gameplay "grind" and "stall"
  measured before this was the debug instrumentation -- a bounds check and
  a VA-trace store per guest access. Measure with `--fast`; debug with the
  default and read its wall times as roughly 20x inflated.

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
- `ISAAC_EPOCH=<unix seconds>` — pins the run RNG seed: the same floor,
  every run (§21.40). `ISAAC_HEAP_TRACE=1` — every guest heap call with
  its result and the guest return address (§21.41). `ISAAC_ROOM_PROBE=1`
  — the door-touch inputs at every engine log line.
- `python scripts/recomp/lift/lift_patches.py --dir output/recomp/lift/gu
  --entry-first --check` — exit 1 if any goto-shaped lifted function would
  start below its entry (§21.41; `build_boot.py` applies the fix itself).
- A PROBE wrapper's "result" line is EAX when the lifted body returns to
  the wrapper — for a tail jump that is before the jump runs (§21.41).
- `ISAAC_DRIVE=explore` (node) — the automated player (§21.44);
  `ISAAC_EXPLORE_CENSUS=1` adds the NPC census; `ISAAC_INPUT_WATCH=1`
  (timeline mode) prints the engine's key-state tables every 30 frames.
  `ISAAC_DISPATCH_WATCH` counts DISPATCHED entries only (indirect calls,
  tail jumps): a direct callee reads 0 there even when it runs every frame.
- `ISAAC_FS_TRACE=1` — logs every FS probe the shim answers, and how.
- `ISAAC_DUMP32=0xc379e8:4,0xc37b14:2` — prints guest dwords after `main`
  traps. Guest memory is identity-mapped into the wasm heap and the harness
  still holds the module after the abort, so an engine static costs nothing
  to read. A relink is ~7 minutes; this is free.
- `python scripts/recomp/oracle/wideops.py` — one x86 instruction at a time
  vs Unicorn. Run it before any ~17-minute full rebuild after a lifter
  change; it is what caught the Ghidra SLEIGH `PSLLD`/`PSLLQ` per-lane-count
  defect that had been silently miscompiling 12 real sites.

**Rebuilding** (only if you change the lifter): `lift_parallel.py --jobs 12
<the emit.py argv recorded in output/recomp/lift/gu/summary.json → argv>`
(**80 s on 12 cores**, byte-identical to the 1,460-s sequential `emit.py`,
recomp-architecture.md §21.26) → `patch_reentry.py --dir output/recomp/lift/gu
--exe tools/isaac-ng.unpacked.exe --cont output/recomp/lift/gu/call_cont.txt`
→ `build_boot.py --dir output/recomp/lift/gu` (recompiles only the TUs whose
text changed, §21.24; a full compile is ~576 s, the -O0 link ~8 s). `--trace-va` and
`--hand-written` are both load-bearing — without `--trace-va`
`dispatch_tbl.c` does not even compile. **A host-only change needs no
re-lift**: `build_boot.py` reuses the lifted objects (~16 s + ~355 s link).

**Rounds 14h-14i (2026-09-02): the crawl measured, the lift parallel.**
The room-entry crawl (nothing logged for 20 s at a time after the first
spawn) is *not* the dispatcher's table (census: 24.4 M dispatches, 0 misses;
bench `ISAAC_BENCH_DISPATCH`: 0.11 us per dispatch) and *not* V8 lazy
compilation (`--trace-wasm-compilation-times`: Liftoff 1.1 s total by the
first room, TurboFan 20.6 s on background threads), yet the V8 profile puts
61 s of *self* time in `isaac_lifted_dispatch` under one per-room reset
(`sub_007f2800`). **Round 14j then found it is not guest work at all** (§21.27): a V8
`--prof` tick log of the silent window puts 65% of ticks in ntdll.dll
directly under the `call_indirect`, the process at 100% CPU and not
paging, no compile churn, and the phase's wall time nondeterministic (two
runs exit after ~100 s with identical dispatch counts, four sit for hours).
Symbolized (`scripts/recomp/profile/prof_ntdll.py`, then capstone on
ntdll): 3,312 of the 3,587 ntdll ticks sit on ONE instruction of an
unexported free-list walk in the Windows NT heap allocator (a linked-list
loop checking encoded block headers, ntdll RVA 0x102da), i.e. node's
malloc/free on the main thread, called by V8 under the call_indirect (lazy
compiles, code publishing). A fragmented NT heap walks O(n) per call, which
is why the wall time depends on allocation history. This is Windows-node
specific: Chrome (PartitionAlloc) and Linux (glibc) do not have that walk.
**Round 15c (2026-09-03): THE GAME PLAYS -- the room-entry crawl was a
missing `case` label** (§21.30). A lifted function's dispatch loop starts
`pc_ = <entry>`, but the block set that gets `case` labels came from
`block_starts()`, which marks branch targets and the lowest address in the
body -- so a function whose body absorbed a lower range had no case for its
own entry, fell to `default:`, parked a jump to itself and was dispatched
again forever, executing no guest instruction (3.8 billion dispatches of
`sub_0093805f` at 20 M/s, found with the new `ISAAC_HEARTBEAT=<n>`). Six
functions had it. The fix is `block_starts(body) | {start}` in `lift.py`;
`check_lifted.py` now enforces the invariant inside `build_boot.py`, and
`recomp_run_pending` aborts on a no-progress park cycle instead of
spinning. The same scripted run now presents **13,860 frames at a median
4 ms**, does **654 room transitions**, and exits on its budget. Next: one
45-s stall that remains early in the engine `Mutex` path (`0x00a157f0`),
which recovers.

**Rounds 15d-15e:** the game opens `music.a` and `videos.a` once it is
playing, so both drivers now seed them lazily (registered by size, read on
first open). That pushes the module past `INITIAL_MEMORY`, and growing a
wasm memory copies the whole heap -- a 200-s play run went from 7,980
frames to **900** until the default was raised. It is **768 MiB** now
(`--initial-memory` overrides; 1536 MiB buys another ~10%). Also: the
stub-hit recorder was a linear scan run on all 66.5 M stub calls of a
ten-minute run and is now an import-index table.

**Round 15a claimed `--no-wasm-tier-up` was 41x; round 15b withdrew it**
(§21.28-21.29). The baseline's ~4,400-s silent phase is real; the flag
run's 145 s was this session killing it, and an independent run with the
flag stayed silent past 250 s. What survives: both runs log the same
1,577 stamped lines, and menu frames were a median 33 ms with the flag
against 38 without.

**Two harness defects made that measurement unfalsifiable, both now
fixed** -- and both are worth knowing before you measure anything:
- The `RECOMP_VA` tick was every 2^20 lifted instructions, which inside
  the crawl is minutes, so no wall-clock deadline (`ISAAC_EXIT_AFTER`,
  the stall watchdog, `ISAAC_PROFILE`) could fire there. Now
  `RECOMP_TICK_MASK`, 2^16.
- `build_boot.py` hashed only each TU's own text, so a `recomp_rt.h` edit
  rebuilt nothing. The hash now folds in all headers + the flags and
  prints `lift : dependency fingerprint <hex>`.

**Next:** the fair A/B is equal wall budget, not time-to-finish -- same
`ISAAC_EXIT_AFTER` with and without `ISAAC_V8_FLAGS=--no-wasm-tier-up`,
comparing how far the guest got. Then the same in Chromium (`tierup=0`),
which is the one that matters for the port. If both crawl, split the giant
lifted functions (`0x005d4380` is 42,671 instructions). **Next:** the flag batch
(`--no-wasm-tier-up`, `--no-wasm-dynamic-tiering`, `--no-wasm-inlining`)
via `scripts/recomp/profile/prof_stuck.ps1 -NodeFlags ...`, eager
compilation with a long wait, and splitting the giant lifted functions.
The lift is parallel and byte-identical (above, §21.25-21.26).

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
