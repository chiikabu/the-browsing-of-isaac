# the-browsing-of-isaac

Static recompilation of *The Binding of Isaac: Repentance* (Windows x86) to
WebAssembly: Ghidra p-code → C → Emscripten, with a host layer for Win32,
OpenGL, OpenAL and CRT calls. The full-game runtime does not interpret or
emulate x86, and does not reimplement gameplay. Behavior-preserving host fast
paths supplement the lifted code; original game behavior and bugs are retained.

**This source repository contains no game data, lifted sources or compiled
module.** Local builds require your own legally owned executable and assets.

## Play

[Open the browser game](https://chiikabu.github.io/the-browsing-of-isaac/).
The page is hosted on GitHub Pages; its separate payload is served by jsDelivr.
Use a current browser with WebAssembly JSPI, WebGL2 and WebAudio support;
Chromium is the browser used by the verification tools.

The page starts automatically. Its loading screen stays up until a loaded native
cutscene, menu or playable room is ready; audio output stays silent until then.
The original intro is visible, and Enter skips it normally. Add `?autoplay=0`
to start with a Play button instead.

| Key | Action |
| --- | --- |
| Enter | Confirm / advance menus |
| WASD | Move |
| Arrow keys | Shoot |
| Escape | Pause / back |
| F | Toggle fullscreen |

Click the game if it does not have keyboard focus. Browser audio policies may
require a click or keypress before sound can play.

The loading bar and Isaac-font percentage measure bootstrap delivery, WebAssembly
instantiation and filesystem/CRT preparation. Each preparation phase contributes
25%; only delivery has byte-level progress. Native initialization has no measured
remainder, so the bar switches to a moving activity segment instead of freezing
at 75%. The percentage is hidden during this phase; reduced-motion settings keep
the segment still. Startup reaches 100% when the loaded intro, menu or live room
is ready. Background downloads do not affect startup completion. Neither the
percentage nor the activity segment estimates time remaining.

Engine downloads and independent range checks overlap with bounded concurrency.
Exact-range hosts stream archive windows; unreliable range hosts download whole
chunks in the background without blocking startup on the full archive set.
Compressed archive windows decode only when read. Immutable window URLs preserve
the browser's download cache. Add `?stats=1` for loading diagnostics.

### Saves and mods

- Saves and options persist in this browser's IndexedDB and load before the
  engine starts. They belong to the current site and browser profile, not a
  cloud account. Export a backup before clearing site data or changing hosts.
- In the file-selection screen, **EDIT FILE** offers **EXPORT FILE** and
  **IMPORT FILE**. Export downloads a ZIP; import accepts a ZIP or a native
  `.dat` save, maps it to the selected slot, and reloads the page.
- Add `?saves=1` for the separate Saves dialog, with whole-store ZIP/JSON
  export, import and reset. `?persist=0` disables save persistence for testing.
- Choose **IMPORT MOD** in the mods list, or **EDIT FILE → MODS**, to import
  a ZIP or folder. RAR and 7z are not supported by this importer.
- Mods use a separate IndexedDB store (`isaac-mods`). The page remembers which
  mods are enabled and seeds only those before the engine scans its directories.
  Mod compatibility is not guaranteed.

## Requirements for development

- Python 3.11+ with `pypcode`, Node.js 20+, and your own game executable and assets.
- Emscripten 6.x (6.0.5+) with the emsdk environment activated; set `EMSDK`
  if needed.
- Ghidra and its supported Java runtime for analysis and lifting.
- A C++20-capable host `clang++` for native/decomp verification. Slice builds
  accept `CLANGXX` and `EMXX` overrides.
- Playwright's Chromium for browser drivers (`npx playwright install chromium`).

The first lift and link are expensive. See the [boot notes](docs/recomp-boot.md)
and [architecture history](docs/recomp-architecture.md) for input layout and
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
running. Add `?stats=1` for runtime diagnostics.

For subsequent module changes:

```sh
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build --no-compress
```

Reload the browser after shipping. Module files are copied, not linked;
`--no-compress` avoids compression during local iteration. Lifted-object cache
receipts validate both build inputs and object bytes; missing or mismatched
receipts trigger recompilation.

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

# Loading progress, background downloads, worker reads and output-audio gate
node --test tests/recomp-portable.test.js tests/recomp-audio.test.js tests/recomp-web.test.js tests/recomp-ship.test.js

# Real-page smoke with save persistence disabled
node scripts/recomp/web/drive_interactive.mjs "http://127.0.0.1:8200/?frames=1500&persist=0" output/recomp/local-smoke

# Loading: visible native title and advancing gameplay
node scripts/recomp/web/drive_boot.mjs "http://127.0.0.1:8200/play.html?ISAAC_EPOCH=1700000000" output/recomp/boot-check visits=2 cpu=4 gl=hw profile=0 timeout=600

# Separate hardware-rendered CPU attribution
node scripts/recomp/web/profile_play.mjs "http://127.0.0.1:8200/?persist=0" output/recomp/local-profile cpu=1 gl=hw seconds=10
```

The interactive smoke uses software rendering. Automated game drivers mute
speaker output; native mixing and WebAudio still run. Drivers for saves, mods,
floors and stress workloads also live in [`scripts/recomp/web`](scripts/recomp/web).
Run timing comparisons sequentially with fresh output/profile directories,
without competing builds, profilers or game tabs. Frame counters alone do not
prove readiness, and page CPU profiles exclude workers, GPU and browser-process
costs.

The full decomp handoff gate has a separate legacy-host prerequisite:

```sh
node scripts/build-wasm.mjs
node scripts/decomp/verify-unit.mjs --handoff
```

These commands require an activated emsdk environment; the legacy host is not
the recomp module. See the [unit runbook](docs/unit-runbook.md) and
[oracle specification](scripts/recomp/oracle/SPEC_FORMAT.md) for focused checks.

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
20 MB limit: `--chunks 33` does not guarantee compliance for every asset set.
Chunks are XOR-scrambled and inline modules minified by default; `--plain`
disables both. Scrambling is not encryption.

### Updating the public release

This repository's `main` serves the page. `chiikabu/boi-portable` stores the
payload; binary chunks do not belong in this source repository. A local vanilla
bundle is **not** the deployed optimized bundle. Verify every instance file
against the deployed manifest before replacing it.

For the existing production asset layout, use its byte-verified bundle:

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
its published bytes. Regenerate the full pack: the historical `--html-only`
path can lose compressed-window metadata. The portable packer handles
compression; separate dist `.br`/`.gz` siblings are not used.

Commit A chunks first, then pin the page's A base to that immutable payload
commit. Preserve commit ancestry and publish the same generated page to both
repositories through their release PRs. Purge mutable `@main` URLs, not immutable
commit URLs. Replace `<payload-commit>` below with the published commit:

```sh
node scripts/recomp/assets/purge_cdn.mjs .scratch/publish-chunks gh/chiikabu/boi-portable@main
node scripts/recomp/assets/check_deployed.mjs \
    https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@<payload-commit> \
    https://chiikabu.github.io/the-browsing-of-isaac/ .scratch/publish-chunks
```

The verifier checks A in full and B by 64 KiB prefixes. Also verify the public
page through visible title and advancing gameplay; a successful push or purge
is not deployment proof. See the [release history](docs/decomp-port.md) for
previous payload-integrity checks, not a substitute for checking a new release.

## Performance and limitations

- No consistent 60 FPS claim is established. Crowded combat can be slower, and
  CPU throttling does not reproduce a physical Chromebook's GPU or memory limits.
- Existing checks do not prove every floor, save, mod or visual effect. Known
  Bloom/Hallucination shader diagnostics remain. Slow or mod-specific leaks are
  not ruled out.
- Steam/EOS online services are stubbed. Language archives are deliberately not
  mounted because they would shadow English assets.
- Rendering, simulation cadence and audio quality must not be reduced to improve
  benchmark numbers. Presentation counts are not simulation ticks.
- `--thin-lto` and `--simd` are opt-in compiler experiments, not defaults; prior
  comparisons did not establish a repeatable gain across workloads.

Historical measurements and correctness scope live in the
[port log](docs/decomp-port.md), [architecture log](docs/recomp-architecture.md)
and [handoff notes](docs/HANDOFF.md). Those documents are chronological;
`npm run decomp:status` reports live port state. Earlier raw-asset loading
measurements are not performance claims for the portable CDN release.

## Source map

- [`scripts/recomp/host`](scripts/recomp/host): host layer and fast paths.
- [`scripts/recomp/lift`](scripts/recomp/lift): lifter, code generation and module builds.
- [`scripts/recomp/assets`](scripts/recomp/assets): archives, shipping, portable builds and mod catalogues.
- [`scripts/recomp/web`](scripts/recomp/web): page, boot pipeline and browser drivers.
- [`tests`](tests): Node test suites.
- [Decomp port](docs/decomp-port.md) and [unit runbook](docs/unit-runbook.md): incremental native/Wasm work.

## Disclaimer

*The Binding of Isaac: Repentance* belongs to Nicalis, Inc. and Edmund McMillen.
This project is not affiliated with or endorsed by them. The tools operate on a
copy you already own; their output is not redistributable. Personal project,
no warranty.
