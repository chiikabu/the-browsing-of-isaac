# Developing the-browsing-of-isaac

The technical side of the project: how the game becomes a web page, how to
build and verify it, and how a release is published. The [README](../README.md)
is the overview.

## What it is

A static recompilation of *The Binding of Isaac: Repentance+* (Windows x86) to
WebAssembly: Ghidra p-code → C → Emscripten, with a host layer for Win32,
OpenGL, OpenAL and CRT calls. The full-game runtime does not interpret or
emulate x86, and does not reimplement gameplay. Behavior-preserving host fast
paths supplement the lifted code; original game behavior and bugs are retained.

**This source repository contains no game data, lifted sources or compiled
module.** Local builds require your own legally owned executable and assets.

## The page

The page is hosted on GitHub Pages; its separate payload is served by jsDelivr.
It needs WebAssembly JSPI, WebGL2 and WebAudio; JSPI and WebGL2 feature
detection decides support, not user-agent names. Chromium is the browser the
verification tools use.

The page starts automatically. Its loading screen stays up until a loaded native
cutscene, menu or playable room is ready; audio output stays silent until then.
`?autoplay=0` starts with a Play button instead, `?stats=1` shows loading and
runtime diagnostics, `?touch=1`/`?touch=0` force the touch controls on or off,
`?saves=1` adds a whole-store saves dialog, `?persist=0` turns save persistence
off for testing.

The loading bar and Isaac-font percentage measure bootstrap delivery, WebAssembly
instantiation and filesystem/CRT preparation; each phase contributes 25% and
only delivery has byte-level progress. Native initialization has no measured
remainder, so the bar shows an activity segment instead of freezing at 75%.
Startup reaches 100% when the loaded intro, menu or live room is ready.

The loader's dancing Isaac (the [Specialist dance](https://tenor.com/view/isaac-tboi-dance-gif-7352492888219360785)
by dazlex) is a 120-frame, 42 px pixel-art strip inlined in `play.html` and
stepped by CSS: rebuilt on its native pixel grid from the published GIF, eight
colours, a transparent background, and a loop whose seam is smaller than an
ordinary frame step. Reduced-motion preferences hold its first frame.

Engine downloads and range checks overlap with bounded concurrency. Exact-range
hosts stream archive windows; unreliable range hosts download whole chunks in the
background without blocking startup. Compressed archive windows decode only when
read. Immutable window URLs preserve the browser's download cache.

### Touch controls

`scripts/recomp/web/touch_controls.mjs` draws nothing but sticks, a pause mark
and the item bar; everything else is the game's own HUD and menus, read out of
guest memory by `touch_game.mjs` (every offset cites the instruction that reads
it). Every action is one of the game's keyboard keys, paced on native frames by
`touch_input.mjs`.

- Sticks are eight-way with hysteresis (`createStickDirection`): a thumb resting
  on a sector edge keeps its direction, so diagonals never jitter.
- The item bar's art is extracted from the game's archives at build time
  (`scripts/recomp/assets/page_assets.py` `build_hud`): the collectibles' icons,
  each pocket pickup's own `HUD` frame, the charge bar, the bomb pickup, the HUD
  number font and the pause screen's paper buttons for the pause mark.
- Menu taps walk the game's own cursor to the tapped row, one key at a time,
  each step confirmed by the cursor in memory; confirms wait for the menu's paper
  to settle.
- Haptics come from the game: `Game::ShakeScreen` stores its timeout at
  `Game+0x26508` before it tests the RUMBLE option, and a hit starts the damage
  cooldown. The options' RUMBLE row gates both.

Rebuild the native engine when shipping these controls. Its `PeekMessageW` shim
must honor `PM_NOREMOVE`: the game's Ctrl lookahead otherwise deletes the
following item or pocket key.

### Saves and mods

- Saves and options persist in the browser's IndexedDB and load before the
  engine starts. **EDIT FILE** on the file-selection screen exports a file as a
  ZIP or imports a ZIP or native `.dat` into that slot.
- Mods live in their own store (`isaac-mods`); the page seeds the enabled ones
  before the engine scans its directories. On the game's MODS screen a hint paper
  opens the mod browser (B, or a tap): a CDN catalogue built by
  `scripts/recomp/assets/modpack.py`, searchable, with each mod's description,
  plus import from a ZIP or folder. RAR and 7z are refused.

## Requirements

- Python 3.11+ with `pypcode`, Node.js 20+, and your own game executable and assets.
- Emscripten 6.x (6.0.5+) with the emsdk environment activated; set `EMSDK`
  if needed.
- Ghidra and its supported Java runtime for analysis and lifting.
- A C++20-capable host `clang++` for native/decomp verification. Slice builds
  accept `CLANGXX` and `EMXX` overrides.
- Playwright's Chromium for browser drivers (`npx playwright install chromium`).

The first lift and link are expensive. See the [boot notes](recomp-boot.md)
and [architecture history](recomp-architecture.md) for input layout and
pipeline details. Generated binaries, game data and oracle inputs remain local.

## Build and run the full game

After preparing the local executable and analysis inputs:

```sh
npm install

# Tables, memory image and host shims from your executable
python scripts/recomp/host/boot_tables.py
python scripts/recomp/host/memimage.py
python scripts/recomp/host/verify_memimage.py
python scripts/recomp/host/gen_shims.py

# Lift and check the host
python scripts/recomp/lift/lift_parallel.py --jobs 4 \
    --exe tools/isaac-ng.unpacked.exe \
    --ghidra-functions output/recomp/export/functions.jsonl \
    --fragments-tsv output/recomp/export/recovered-functions.tsv \
    --imports output/recomp/census/imports.json \
    --shim-table output/recomp/host/shim-table.json \
    --va-file output/recomp/lift/starts_union.txt \
    --hand-written scripts/recomp/host/src/missing_fns.c \
    --dispatch auto --max-insns 100000 --split-va 0x30000 --trace-va \
    --out output/recomp/lift/gu --module lifted \
    --stats output/recomp/lift/gu/stats.json
python scripts/recomp/lift/patch_reentry.py --dir output/recomp/lift/gu \
    --exe tools/isaac-ng.unpacked.exe
python scripts/recomp/host/build_selftest.py

# Replace <game-dir> with your local game directory
python scripts/recomp/assets/bundle.py build <game-dir> .scratch/game-bundle --strict
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build
python scripts/recomp/assets/ship.py check .scratch/game-dist
node scripts/recomp/web/serve_dist.mjs .scratch/game-dist 8200
```

Open http://127.0.0.1:8200/. The server is loopback-only; keep its terminal
running.

For subsequent module changes:

```sh
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build --no-compress
```

Reload the browser after shipping. Module files are copied, not linked;
`--no-compress` avoids compression during local iteration. Lifted-object cache
receipts validate both build inputs and object bytes.

**`npm run serve` serves the separate decomp-slice host, not the full game.**
The `native/decomp/`, `decomp/`, `platform/` and `web/` trees support that
incremental porting track; they do not replace `scripts/recomp/`.

## Verify

```sh
npm run decomp:status
npm run repo:check
npm test
python scripts/recomp/host/build_selftest.py
python scripts/recomp/assets/ship.py check .scratch/game-dist

# Page, loading, audio, shipping and touch suites
node --test tests/recomp-portable.test.js tests/recomp-audio.test.js tests/recomp-web.test.js tests/recomp-ship.test.js
node --test tests/recomp-touch.test.js tests/recomp-touch-game.test.js tests/recomp-host-input.test.js

# Real-page smoke with save persistence disabled
node scripts/recomp/web/drive_interactive.mjs "http://127.0.0.1:8200/?frames=1500&persist=0" output/recomp/local-smoke

# Loading: visible native title and advancing gameplay
node scripts/recomp/web/drive_boot.mjs "http://127.0.0.1:8200/play.html?ISAAC_EPOCH=1700000000" output/recomp/boot-check visits=2 cpu=4 gl=hw profile=0 timeout=600

# Separate hardware-rendered CPU attribution
node scripts/recomp/web/profile_play.mjs "http://127.0.0.1:8200/?persist=0" output/recomp/local-profile cpu=1 gl=hw seconds=10
```

The interactive smoke uses software rendering. Automated game drivers mute
speaker output; native mixing and WebAudio still run. Drivers for saves, mods,
floors and stress workloads live in [`scripts/recomp/web`](../scripts/recomp/web).
Run timing comparisons sequentially, without competing builds, profilers or game
tabs. Frame counters alone do not prove readiness.

The full decomp handoff gate has a separate legacy-host prerequisite:

```sh
node scripts/build-wasm.mjs
node scripts/decomp/verify-unit.mjs --handoff
```

These commands require an activated emsdk environment. See the
[unit runbook](unit-runbook.md) and
[oracle specification](../scripts/recomp/oracle/SPEC_FORMAT.md) for focused checks.

## Portable builds and releases

```sh
# Single HTML file with its payload inline; no network required
python scripts/recomp/assets/portable.py offline .scratch/game-dist .scratch/isaac.html

# Page and separate payload chunks for a static host
python scripts/recomp/assets/portable.py chunks .scratch/game-dist .scratch/portable-local --chunks 33 \
    --base https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/c

# Optional CDN mod catalogue
python scripts/recomp/assets/modpack.py <mods-dir> out/mods --base https://cdn.example.com/mods
```

Chunking follows access patterns. Windowed archives use range requests; hosts
that ignore ranges download whole chunks. Check actual sizes against jsDelivr's
20 MB limit. Chunks are XOR-scrambled and inline modules minified by default;
`--plain` disables both. Scrambling is not encryption.

### Updating the public release

This repository's `main` serves the page. `chiikabu/boi-portable` stores the
payload; binary chunks do not belong in this source repository. A local vanilla
bundle is **not** the deployed optimized bundle. Verify every instance file
against the deployed manifest before replacing it.

```sh
python scripts/recomp/assets/ship.py build --bundle .scratch/publish-bundle \
    --dist .scratch/publish-dist --copy --no-compress
python scripts/recomp/assets/ship.py check .scratch/publish-dist
python scripts/recomp/assets/portable.py chunks .scratch/publish-dist .scratch/publish-chunks \
    --chunks 33 --part-mib 19 --window-gz --key-of index.html \
    --base https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/c \
    --base-b https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@79d199a/c \
    --catalogue https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/mods
```

Preserve the key, 19 MiB B-chunk geometry and compressed-window metadata
(`wl`, `wz`, `win`). Retain `@79d199a` only after all 28 rebuilt B chunks match
its published bytes. Commit A chunks first, then pin the page's A base to that
immutable payload commit. Purge mutable `@main` URLs, not immutable commit URLs:

```sh
node scripts/recomp/assets/purge_cdn.mjs .scratch/publish-chunks gh/chiikabu/boi-portable@main
node scripts/recomp/assets/check_deployed.mjs \
    https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@<payload-commit> \
    https://chiikabu.github.io/the-browsing-of-isaac/ .scratch/publish-chunks
```

The verifier checks A in full and B by 64 KiB prefixes. Also verify the public
page through visible title and advancing gameplay; a successful push or purge
is not deployment proof.

## Performance and limitations

- No consistent 60 FPS claim is established. Crowded combat can be slower, and
  CPU throttling does not reproduce a physical Chromebook's GPU or memory limits.
- Existing checks do not prove every floor, save, mod or visual effect. Known
  Bloom/Hallucination shader diagnostics remain.
- Steam/EOS online services are stubbed. Language archives are deliberately not
  mounted because they would shadow English assets.
- Rendering, simulation cadence and audio quality must not be reduced to improve
  benchmark numbers. Presentation counts are not simulation ticks.

Historical measurements and correctness scope live in the
[port log](decomp-port.md), [architecture log](recomp-architecture.md)
and [handoff notes](HANDOFF.md). `npm run decomp:status` reports live port state.

## Source map

- [`scripts/recomp/host`](../scripts/recomp/host): host layer and fast paths.
- [`scripts/recomp/lift`](../scripts/recomp/lift): lifter, code generation and module builds.
- [`scripts/recomp/assets`](../scripts/recomp/assets): archives, shipping, portable builds and mod catalogues.
- [`scripts/recomp/web`](../scripts/recomp/web): page, boot pipeline, touch controls and browser drivers.
- [`tests`](../tests): Node test suites.
- [Decomp port](decomp-port.md) and [unit runbook](unit-runbook.md): incremental native/Wasm work.
