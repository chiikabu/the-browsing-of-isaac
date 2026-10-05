# the-browsing-of-isaac

Static recompilation of *The Binding of Isaac: Repentance* (Windows x86) to
WebAssembly. Ghidra p-code to C to Emscripten, linked against a host layer that
implements the Win32, OpenGL, OpenAL and CRT calls the engine makes. No
interpreter, no emulator, no gameplay reimplemented. Engine code is not patched;
original bugs are reproduced, not fixed.

**This repo contains no game data, no lifted sources and no compiled module.**
Those are derived from a copyrighted executable and are built locally from your
own copy.

## Layout

| | |
|---|---|
| `scripts/recomp/host` | host layer, ~25k lines of C, plus hand-written fast paths |
| `scripts/recomp/lift` | p-code lifter, codegen, `build_boot.py` |
| `scripts/recomp/assets` | KAGE archive format, bundle/ship/portable/modpack |
| `scripts/recomp/web` | page, boot pipeline, Playwright drivers |
| `tests` | `node:test` suites |
| `docs` | build notes, round by round |

## Requirements

Python 3.11+, Node 20+, emsdk, Ghidra, and a copy of the game. First build is a
couple of hours, mostly lifter and linker.

## Build

```sh
npm install

# tables and memory image, read from your own exe
python scripts/recomp/host/boot_tables.py
python scripts/recomp/host/memimage.py
python scripts/recomp/host/verify_memimage.py
python scripts/recomp/host/gen_shims.py

# lift (slow)
python scripts/recomp/lift/lift.py
python scripts/recomp/lift/lift_patches.py --dir output/recomp/lift/gu

# host selftest before anything bigger
python scripts/recomp/host/build_selftest.py

# assets and dist
python scripts/recomp/assets/bundle.py build <game-dir> .scratch/game-bundle --strict
python scripts/recomp/assets/ship.py build

# module, then serve
python scripts/recomp/lift/build_boot.py --web --fast
node scripts/recomp/web/serve_dist.mjs .scratch/game-dist 8000
```

Optional asset passes, in this order, before `ship.py`:

```sh
python scripts/recomp/assets/optimize.py music     <in.a> <out.a> --quality 2
python scripts/recomp/assets/optimize.py halve-sfx <in.a> <out.a>
python scripts/recomp/assets/optimize.py layout    <in.a> <out.a> --order <order.txt>
python scripts/recomp/assets/optimize.py huffman   <in.a> <out.a>
```

`huffman` packs static-Huffman deflate blocks. The format flushes every 0x400
bytes, so each block carried its own Huffman header; building those tables was
77.6% of archive inflate time. Costs ~1% of bundle size.

## Local optimization loop

Once the lift, asset bundle, and memory image exist, rebuild the full game:

```sh
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build --no-compress
node scripts/recomp/web/serve_dist.mjs .scratch/game-dist 8200
```

Open http://127.0.0.1:8200/?stats=1. The server is loopback-only; keep its
terminal running. After each module change, rebuild the module, rerun `ship.py`
to rebuild the dist, and reload the browser. Module files are copied, not linked.
`--no-compress` skips compression for local iteration.

Lifted-object `.sha` receipts bind the source/header/flag fingerprint to the
object's own SHA-256. Missing, legacy, or mismatched receipts force a rebuild;
unverified objects are never adopted. The first build after this cache-format
change recompiles the lifted objects.

Inputs: Enter for menus, WASD to move, arrow keys to shoot, Escape to pause
or go back, and F for fullscreen.

Use this recomp page for the full game. `npm run serve` serves the separate
decomp-slice host, not this runtime.

### Verify

Run the existing smoke driver:

```sh
node scripts/recomp/web/drive_interactive.mjs "http://127.0.0.1:8200/?frames=1500&persist=0" output/recomp/local-smoke
```

The smoke driver uses a software renderer. Profile hardware rendering separately
with a page V8 CPU profile (worker, GPU, and browser-process costs are not sampled):

```sh
node scripts/recomp/web/profile_play.mjs "http://127.0.0.1:8200/?persist=0" output/recomp/local-profile cpu=1 gl=hw seconds=10
```

Local verification (2026-10-04): Windows Chrome 150 with an RTX 2060 SUPER
rendered the menus and two Basement rooms, accepted movement, shooting, and
pause/resume, and produced nonzero WebAudio output. The separate SwiftShader
smoke ran 1,500 frames and returned `mainRc: 0`, with no game assertions or
page errors. Captures and receipts are under `output/recomp/local-smoke/`.
The hardware page profile captured 581 frames in 10.142 seconds, with 85.1%
idle samples; see `output/recomp/local-profile/play.cpuprofile` and
`summary.txt`. This is a short local baseline, not an all-floor/mod/save
regression or proof of an FPS improvement.

### Loading measurements (2026-10-05)

The loading build is `255e9c7fee333892cf91021bd9d56baae36db03f829bcc55a9fea298cb582008`
(55,556,882 Wasm bytes). No rendering, simulation, assets, or audio quality
were reduced:

- The archive inflater bulk-copies nonwrapping, disjoint matches and fills
  distance-one runs. Wrapping, overlapping, and malformed cases retain the
  scalar path. PNG Paeth uses equivalent bounded integer arithmetic.
- `isaac_fs_seed_adopt` transfers an allocated buffer to the RAM-FS only on
  success. Browser/Node loaders no longer make a second C copy of temporary
  asset buffers. This removes **44,349,021 aggregate bytes of eager-archive
  copies/temporary allocations per boot**, not a measured peak-RAM reduction.
  Borrowed C buffers still use the copying API; mod Lua bytes remain available
  for their second consumer, MEMFS.
- Compression caching now distinguishes an unprobed `--no-compress` build
  from a genuine incompressible result, checks sibling presence/size, and
  honors changed compression settings. Disabling Brotli removes stale `.br`
  files. The actual HTTP server delivered Wasm as **7,961,218 Brotli bytes**
  and the memory image as **2,967,425 bytes**, both decoding to their recorded
  hashes. Together: 64,203,097 raw bytes to 10,928,643 encoded bytes (**83.0%
  smaller**). This is not an 83% reduction in all game traffic.
- Reader read-ahead now respects its existing speculative concurrency limit.
  A demand read can still start when speculative slots are occupied. Window
  size, portable packing, cache capacity, and game data are unchanged.
- Cold visits no longer fetch the generic shipped boot trail by default.
  `?trail=1` opts in; this origin's own recorded trail remains enabled on
  subsequent visits.

Raw-serving A/B runs on Windows Chrome 151 / RTX 2060 SUPER, CPU4, hardware
GL, 1280×720, profiling off:

| Navigation boundary, mean of two runs | Previous build | Loading build |
| --- | ---: | ---: |
| Cold profile → visible native title | 25.699 s | 23.985 s |
| Retained profile → visible native title | 22.496 s | 21.276 s |
| Cold profile → advancing playable room | 35.780 s | 35.481 s |
| Retained profile → advancing playable room | 33.738 s | 33.902 s |

The repeated pair reversed module order. Observed title reductions were
**6.7% cold / 5.4% warm**; no meaningful first-playable improvement was
established. These runs precede the reader scheduling/default-prefetch
changes. Cold means a fresh browser profile, not a cold OS/server cache.
Warm retains browser cache, but does not prove Wasm code-cache reuse. Playable
timing includes title capture and menu input; initial run seeds varied.

A separate native-seeded `3JY1 6FLR` sweep closed the console and verified
matching stage seeds and advancing gameplay:

| Stage command | Previous build | Loading build |
| --- | ---: | ---: |
| 2, first | 0.885 s | 0.894 s |
| 8, first | 1.306 s | 1.255 s |
| 2, repeated | 1.133 s | 1.100 s |
| 8, repeated | 1.160 s | 1.068 s |

Four transitions per module are not a repeatable all-floor speedup.
Receipts: `output/recomp/load-native-comparison.json` and
`output/recomp/load-floor-seeded-{baseline,candidate}/floors.json`.

With the same loading Wasm, compression, and bounded reader, two cold visits
per policy reversed order under **CPU4 / CDP `net=25` / 20 ms latency**:

| Mean boundary | Shipped trail enabled | Cold default |
| --- | ---: | ---: |
| Navigation → visible native title | 205.584 s | 172.438 s |
| Navigation → advancing playable room | 218.417 s | 189.318 s |
| Server-accounted encoded response bodies | 533.696 MB | 457.019 MB |

Observed reductions: **16.1% title, 13.3% first-playable, 76.68 MB / 14.4%
response bodies**. Server counters cover the entire driver, including
speculation after readiness; they are not readiness-only physical wire
traffic. The concurrency cap alone did not establish a latency gain.

One unthrottled local cold comparison was 23.553→22.377 s title and
35.929→31.648 s playable. This is a regression check, not a repeated
fast-link speedup claim. The default's warm visit retained all **477**
recorded trail entries and reached title/playable at 21.239/32.744 s.
A final default-policy seeded floor sweep passed **9/9 checks**, with four
console-closed, advancing-gameplay transitions.

The earlier raw-serving network attempt hit its 180 s deadline before
title; it remains a failed receipt, not a readiness sample. Completed
comparisons used a 600 s deadline. Receipts:
`output/recomp/load-reader-{network,repeat}-comparison.json` and
`output/recomp/load-floor-final-default/floors.json`.

Separate first-presentation-to-600 attribution profiles sampled inflater
self time at 2,161.7 → 1,501.1 ms and unfilter at 1,366.3 → 1,093.7 ms.
These are profiler-affected page-isolate observations, not readiness times
or whole-system CPU. Research follows
[V8's compilation pipeline](https://v8.dev/docs/wasm-compilation-pipeline),
[streaming/code-cache requirements](https://v8.dev/blog/wasm-code-caching),
and [Emscripten's optimization guidance](https://emscripten.org/docs/optimizing/Optimizing-Code.html).
The existing normal HTTP path already instantiates the original streaming
response at a stable hashed URL; no redundant replacement was added.

#### Verify loading

```sh
python scripts/recomp/host/build_selftest.py
python scripts/recomp/assets/ship.py check .scratch/game-dist
node --test tests/recomp-build.test.js tests/recomp-host.test.js tests/recomp-fastpath.test.js tests/recomp-web.test.js tests/recomp-ship.test.js tests/recomp-mods.test.js
node scripts/recomp/web/drive_boot.mjs "http://127.0.0.1:8200/play.html?ISAAC_EPOCH=1700000000" output/recomp/boot-check visits=2 cpu=4 gl=hw profile=0 timeout=600
node scripts/recomp/web/drive_floors.mjs "http://127.0.0.1:8200/play.html?ISAAC_EPOCH=1700000000" output/recomp/floor-timing options=opts-iteminfo.ini timing=1 profile=0 cpu=4 gl=hw stages=2,8,2,8 seed=3JY16FLR
```

For the full handoff gate, first build the separate legacy host test
prerequisite with `node scripts/build-wasm.mjs` in an activated emsdk
environment, then run `node scripts/decomp/verify-unit.mjs --handoff`.
That prerequisite is not the recomp module used by the loading benchmark.

Add `net=25` to the boot command for the capped-link scenario, and
`&trail=1` to its URL for the shipped-trail control. Use fresh output/profile
directories and run comparisons sequentially, without concurrent builds,
tests, profilers, or other active game tabs.

`drive_boot` distinguishes visible title, advancing gameplay, and diagnostic
frame counts. Frame 1/300/600 and menu state 5 do not prove readiness.
`drive_floors timing=1` measures stage-command submission through console
closure and advancing gameplay; its default console-open retention mode is
still not gameplay FPS. `net=25` applies page-target CDP throttling, not a
verified whole-process physical link. Consumed archive-window bytes are not
wire bytes: hash-versioned slices can hit the browser HTTP cache.

Automated game drivers now launch Chromium with **`--mute-audio`**.
Speaker output is muted; native mixing and WebAudio still run. The muted
audio driver observed six running-context samples, all above 0.005 RMS.
Its receipt names this `musicSignalPresent`, not speaker audibility.

Host selftest: **574 checks, zero failures/warnings**. Twenty native, seven
compression-cache, and one reader-scheduler behavioral mutants were killed
and restored. Exhaustive Paeth arithmetic comparison covered all 16,777,216
byte triples. A six-presentation original-lifted comparison reported zero
mismatches, including 45,136 archive-ring comparisons; this is not full-game
equivalence. A real enabled Lua mod executed through MEMFS; live browser
smoke exercised movement, firing, pause/resume, and running audio behind
output mute. Existing Bloom/Hallucination shader diagnostics remain; not
every visual effect, mod, save, floor, or physical Chromebook was verified.

The handoff also repaired a stranded HUD timer mutation against the PE store
at `0x0084d708` (150, then 149 after countdown), and recovered an all-NUL logger
source from the intact index. Corrupt bytes were preserved privately;
vanished unindexed edits could not be recovered, and the zeroing mechanism
is unproven. Ten family suites now use PID-private mutable source copies;
eight more use private artifact directories. Tests no longer overwrite tracked
translations or canonical consumer modules. HUD compilation passes spaced
paths as separate compiler arguments; both affected behavioral tests passed.
Obsolete source/planning-note tests were removed, not re-pinned; 31 mixed
tests no longer assert private disassembly/header text. Runtime ABI agreement,
PE table checks and behavioral corpora remain. FontSettings mutation checks
now execute a private mutated model rather than its cached original import.
Render header and bridge mutants also stay private.
Failed gate stages now save captured diagnostics under
`output/decomp/unit-gate/` instead of hiding later failures behind summary limits.
Preflight rejects NUL-corrupted family source; its isolated regression passed
and rejected a guard-removal mutant. Rebuilt companions loaded through the
production API at their declared ABIs.

Final `node scripts/decomp/verify-unit.mjs --handoff`: **PASS**.
Full npm suite: **4,085 passed, zero failed**; native/Wasm differential:
**5,392 cases passed**. Slice ABI101: **685 exports, zero imports**.
All 72 watched C++/header/model/bridge/canonical-module files retained their
SHA-256 hashes with zero observed write events. Receipt:
`output/recomp/load-handoff-verification.json`.

### Crowded-room optimization measurements

The 2026-10-04 build includes guarded native vertex packing and audio pair
accumulation, a hot/cold indirect-dispatch split, and a fix for timestamp
prefixes accumulating in Emscripten's unterminated stderr buffer. Rendering
resolution, effects, entities, game updates, and audio quality were not reduced.

The initial kernel-only comparison showed **no demonstrated FPS improvement**:

| Fixed-room comparison | Original module FPS | Kernel-only module FPS |
| --- | ---: | ---: |
| Original first | 29.25 | 29.46 |
| Updated first | 29.96 | 30.00 |
| Pooled, 1,800 presentation intervals per module | 29.60 | 29.73 |

Each run used hardware GL, 4× Chrome CPU throttling, seed `3JY1 6FLR`,
stage 8, 16 item grants, 18 `spawn 27.0` commands, 180 warmup presentations,
and 900 measured presentation intervals. These are Host spawn commands, not
a guarantee that 18 enemies remain alive throughout combat. The item preset
stacks Brimstone, Chocolate Milk, Technology, Dr. Fetus, and Epic Fetus; it is
not 16 tear-doubling items. The updated p95 interval was 70.4 ms, versus
69.5–70.3 ms originally. The small mean difference is within run variation;
**consistent 60 FPS remains unmet**.

Reproduce against the currently served module:

```sh
node scripts/recomp/web/profile_load.mjs "http://127.0.0.1:8200/?ISAAC_EPOCH=1700000000" output/recomp/crowded-check options=opts-iteminfo.ini stage=8 items=16 spawn=18 frames=900 warmframes=180 seed=3JY16FLR cpu=4 gl=hw profile=0
```

`profile=0` excludes CPU sampling from timing comparisons. Use `profile=1`
separately for attribution. The driver verifies console commands, item delivery,
seed logs, stage, and logical room index. Its default input fires without WASD;
knockback can still leave the room, which fails the run instead of silently
benchmarking an easier room. A longer explosive run did fail this guard at
GameFrame 1753 and is excluded. `move=1` is a different, moving-floor workload.

The four valid receipts are under
`output/recomp/opt-stationary-{baseline,candidate}-{a,c}/`. Each advanced 450
GameFrames in room 84. Setup ended a few GameFrames apart, so this is a matched
scenario, not a byte-identical replay. Windows Chromium 151 and an RTX 2060
SUPER were used; CPU throttling does not emulate Chromebook GPU, memory,
thermals, or operating-system pressure. No physical Chromebook was tested.

A separate pre-dispatch-split build soak kept the same stage/room and fired
the base weapon without item grants or enemy spawns for 36,000 intervals (719.55 seconds).
Mean was 50.03 FPS; first/last 120-interval windows were 52.18/51.06 FPS.
Forced GC ran only before warmup and after measurement. Renderer private
memory fell from 1,276.8 to 1,245.2 MiB; live JS heap from 4.26 to 4.21 MiB.
Guest touched span stayed 351.4 MiB, with live bytes increasing by 483,680.
There were no page errors, heap allocation failures, or refused corrupt frees;
audio remained running with nonzero output. This bounded, single-room run
does not rule out leaks during floor transitions, heavier combat, or mods,
and does not establish the logger bug as the cause of the reported slowdown.

```sh
node scripts/recomp/web/profile_load.mjs "http://127.0.0.1:8200/?ISAAC_EPOCH=1700000000" output/recomp/session-check options=opts-iteminfo.ini stage=8 items=0 spawn=0 frames=36000 warmframes=600 seed=3JY16FLR cpu=4 gl=hw profile=0 gc=1
```

The recorded soak is `output/recomp/opt-session-soak/summary.json`.
`gc=1` records CDP heap use, raw guest-heap reports, and Windows process memory
outside the measured interval. It is not an in-game garbage-collection policy.

The preceding `d530a210a82a` module also passed `drive_floors.mjs` over ten cycles of stages
2/4/6/8/10/12: **60 floor loads, 65 checks**, 387.25 seconds. Every load had
a fresh matching native stage log; every process-memory sample was finite
and positive, without query errors. Renderer working set started at 1,300
MiB and ended at 1,182 MiB; after startup it ranged from 1,164 to 1,253 MiB,
with repeated rises followed by drops rather than a sustained climb.
GPU-process working set ended at 408 MiB versus 449 MiB initially.

This probe used CPU1/hardware GL at 1280×720, with the console open.
Its approximately 60 FPS readings are **not gameplay performance evidence**.
It measures working set, not private allocations or VRAM, and does not
force GC or census the guest heap. Slow leaks, mod-specific retention,
room exploration and dense-combat aging remain unexcluded. Receipt:
`output/recomp/opt-floor-retention-evidence.json`; raw data:
`output/recomp/opt-floor-retention-extended/floors.json`.

```sh
node scripts/recomp/web/drive_floors.mjs "http://127.0.0.1:8200/play.html?frames=600000&ISAAC_EPOCH=1700000000" output/recomp/floor-check options=opts-iteminfo.ini gl=hw cpu=1 stages=2,4,6,8,10,12,2,4,6,8,10,12
```

That command runs two cycles; the recorded extended probe repeated the
six-stage sequence ten times. It does not share the explicitly seeded
crowded-room fixture and must not be pooled with its FPS results.

The dispatch split keeps thunk decoding and failure diagnostics outside the
common call path. In the linked Wasm, `recomp_call_indirect` shrank from
2,711 to 43 body bytes and no longer reserves a 512-byte stack frame.
Cache lookup and dispatch ordering are unchanged. Chained adjustor-thunk
checks exercise the original destructor's memory write, signed ECX
adjustments, guest RET, and adjacent-memory preservation.

That split also showed no FPS gain: a base-weapon, scattered-Host comparison
pooled 49.37 FPS before (`70f6e78e0676`) and 49.24 after (`d530a210a82a`).
Each side has two 900-interval runs in reversed order; all stayed in room 84
and advanced 450 GameFrames per measured run. Per-run p95 was 41.6–41.9 ms
before and 41.1–43.0 ms after. Receipts:
`output/recomp/opt-scatter-normal-{control,candidate}-{a,b}/`.

`scatter=1` uses [the Lua entity API](https://wofsauge.github.io/IsaacDocs/rep/Isaac.html#spawn)
to place Hosts across the upper room and requires a native `load_hosts=18`
count for this fixture. This avoids initial overlap with the player; it does
not lock position or weaken room-transition checks. Do not pool these runs
with the original overlapping-spawn fixture.

For explosive workloads, `arena=1` additionally calls
[`Room:RemoveDoor`](https://wofsauge.github.io/IsaacDocs/rep/Room.html#removedoor)
and requires a native zero-door count before sampling. This changes only the
benchmark room; player physics and the production game remain unchanged.
An unsealed scattered run exited at GameFrame 273 and was discarded.

The bounded-arena comparison, before compiler experiments, also showed no
gain: original `6cdd81a5fd14` pooled 31.08 FPS; kernels/logger/dispatch
`d530a210a82a` pooled 30.81 FPS. Each has two reversed-order 900-interval
runs. Per-run p95 was 66.3–67.2 ms versus 66.0–68.6 ms. All four verified
18 initial Hosts, zero doors, room 84 and 450 measured GameFrames, with no
page errors. Receipts: `output/recomp/opt-arena-heavy-{baseline,candidate}-{a,b}/`.

```sh
node scripts/recomp/web/profile_load.mjs "http://127.0.0.1:8200/?ISAAC_EPOCH=1700000000" output/recomp/arena-check options=opts-iteminfo.ini stage=8 items=16 spawn=18 scatter=1 arena=1 frames=900 warmframes=180 seed=3JY16FLR cpu=4 gl=hw profile=0
```

The 2:1 presentation/GameFrame ratio matches the original parity gate:
`0x009551cf` tests `[Manager+0x4abbc] & 1`, skipping the `0x006fadc0`
call on odd passes; `0x00955580` increments that shell counter. The
simulation counter at `Game+0x264f8` increments inside `0x006fadc0`.
Removing alternate presentations or doubling updates would not be a
behavior-preserving pacing fix. Evidence: `output/recomp/opt-frame-cadence.json`.

#### Compiler experiments

`build_boot.py` accepts opt-in `--thin-lto` and `--simd`; neither changes the
default build. Fast host code already uses SIMD. The additional SIMD option
enables it for lifted guest code too. Variant output directories and object
cache suffixes are distinct, so experiments do not replace the normal build.

```sh
python scripts/recomp/lift/build_boot.py --web --fast --thin-lto --simd --jobs 3
```

The combined variant (`1eb4fef45f74`, 58,832,847 bytes) versus the normal
build (`d530a210a82a`, 55,556,901 bytes) pooled 49.22→49.46 FPS in the
ordinary scattered crowd. The heavy arena pooled 28.81→30.96 FPS, but one
valid control run fell to 27.29 FPS; the other was 30.52 FPS. That slow run
is retained, not discarded. These samples do not establish a repeatable gain
or justify promoting the larger module. All eight runs stayed in room 84
and advanced 450 GameFrames, with no page errors. Full results:
`output/recomp/opt-compiler-comparison.json`.

With `EMCC_CFLAGS="-O3 -msimd128 -flto=thin"`, the host checks and both
native/Wasm PE oracles also passed their existing case sets. Receipt:
`output/recomp/opt-compiler-verification.json`. This is not a full-game
equivalence proof or a measurement of startup/memory cost.

A later isolated-flag round used the same fixtures, with two runs per build
in control/SIMD/ThinLTO/ThinLTO/SIMD/control order:

| Build | Wasm bytes | Ordinary crowd FPS | Heavy arena FPS |
| --- | ---: | ---: | ---: |
| Normal | 55,556,901 | 44.52 | 30.79 |
| `--simd` | 55,101,813 | 46.53 | 29.02 |
| `--thin-lto` | 58,848,751 | 47.53 | 31.01 |

All twelve runs passed the room/seed/count checks and advanced 450
GameFrames, without page errors. Heavy p95 intervals were 65.6–67.1 ms
normally, 67.8–78.1 ms with SIMD, and 68.0–69.4 ms with ThinLTO. The later
ordinary controls were slower than earlier controls; do not pool rounds to
claim a causal gain. The SIMD heavy runs themselves varied from 27.15 to
31.15 FPS. **Normal compilation remains the default**: neither flag showed
a repeatable improvement across both workloads, and ThinLTO enlarged the
module. Receipts: `output/recomp/opt-single-{normal,heavy}-comparison.json`.

Correctness checks:

```sh
python scripts/recomp/host/build_selftest.py
python scripts/recomp/oracle/quad_pack.py
python scripts/recomp/oracle/audio_pairs.py
node --test tests/recomp-host-log.test.js tests/recomp-build.test.js tests/recomp-fastpath.test.js tests/recomp-console.test.js tests/recomp-web.test.js tests/recomp-jspi.test.js tests/recomp-ship.test.js
```

Results: 479 host checks, 85 Node tests, native/Wasm packing oracle
(671 accepted + 53 rejected cases), and audio oracle
(1,914 accepted + 249 rejected cases), all passing; 49 behavioral mutants
were killed and restored. The focused oracles execute original PE instructions
and use an independent hardware SSE witness for NaN propagation; see
[`SPEC_FORMAT.md`](scripts/recomp/oracle/SPEC_FORMAT.md) for exact scope.
These checks do not prove full-game equivalence, all mods/saves, or 60 FPS.

## Portable builds

The shipping page (payload on jsDelivr, this repo has no game data):

https://chiikabu.github.io/the-browsing-of-isaac/

```sh
# single .html, payload inline, no network
python scripts/recomp/assets/portable.py offline .scratch/game-dist out/isaac.html

# page + payload beside it, for a static host
python scripts/recomp/assets/portable.py chunks .scratch/game-dist out/ --chunks 33 \
    --base https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/c
```

Payload is split by access pattern, not size. Whole-read files are gzipped; the
four windowed archives are stored raw on 1 MiB boundaries and fetched with
`Range`, the range carried in the URL fragment. Hosts that ignore `Range` get
whole chunks instead. `--chunks 33` keeps every file under jsDelivr's 20 MB
limit. Chunks are XOR-scrambled and the inlined modules minified by default;
`--plain` disables both.

## Mods

`IMPORT MOD` in the in-game mods list opens a picker. `.zip` or folder, stored
in IndexedDB (`isaac-mods`, separate from saves) and seeded before `main`, so
the engine's own directory scan finds them. RAR/7z are rejected; no browser can
decode them.

Enabled state is kept by the page, not the engine. The engine writes
`disable.it` and greys the row, then ignores that file on the next start, so a
disabled mod is simply not seeded.

`modpack.py` builds a browsable catalogue for a CDN:

```sh
python scripts/recomp/assets/modpack.py <mods-dir> out/mods --base https://cdn.example.com/mods
```

## Tests

```sh
npm test
python scripts/recomp/host/build_selftest.py
```

Drivers under `scripts/recomp/web` (`drive_boot`, `drive_saves`, `drive_mods`,
`drive_floors`, `profile_play`, ...) run the real page in headless Chrome.

## Source/decomp tooling

The merged source tree also includes the native/Wasm decomp port:
`native/decomp/` contains C++ slices, `decomp/` contains port state and oracles,
`platform/` contains JavaScript platform helpers, `scripts/decomp/` contains
analysis and verification tools, and `web/` contains the separate browser host.
These supplement, rather than replace, the `scripts/recomp/` workflow above.
See `docs/decomp-port.md` and `docs/unit-runbook.md` for port boundaries and
the per-unit workflow.

### Verify

After `npm install`, run:

```sh
npm run decomp:status
npm run repo:check
npm test
```

`decomp:status` reports live ABI versions, open boundaries, and verification
freshness. `repo:check` checks repository safety; only the root branding images
`apple-touch-icon.png` and `favicon-32.png` are exempt from the PNG restriction,
and the file-size limit still applies. `npm test` runs the Node suites.
These commands do not include a page/assets build.

Full native/Wasm builds and oracle verification additionally require Python
3.11+, a legally owned game executable and local assets, Emscripten 6.x
(6.0.5+), and a C++20-capable host clang++. Load the emsdk environment and set
`EMSDK` as needed; slice builds accept `CLANGXX` and `EMXX` overrides.
Ghidra analysis requires Ghidra and its supported Java runtime. Browser checks
require Playwright's Chromium and WebGL2. Keep the Node 20+ requirement above.
Generated binaries, game data, and oracle inputs remain local; this merge
does not supply them or rebuild the published page/assets.

## Notes

`docs/HANDOFF.md` to orient, `docs/recomp-architecture.md` for the long version,
including the changes that measured worse and were reverted.

## Disclaimer

*The Binding of Isaac: Repentance* is property of Nicalis, Inc. and Edmund
McMillen. Not affiliated with or endorsed by them. No game code or assets here;
the tools operate on a copy you already own, and their output is not
redistributable. Personal project, no warranty.
