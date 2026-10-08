# Developing

How the game becomes a web page, how to build it from your own copy, and how a
release goes out. The [README](../README.md) is the overview.

## How it works

*The Binding of Isaac: Repentance+* for Windows is statically recompiled to
WebAssembly: Ghidra p-code → C → Emscripten. A host layer stands in for Win32,
OpenGL, OpenAL and the C runtime. Nothing is emulated and no gameplay is
rewritten, so the game behaves exactly like the PC version, bugs included.

This repository holds the tools only. It contains no game data, lifted sources
or compiled module; a build needs your own copy of the game.

## The page

The page lives on GitHub Pages and streams its payload from jsDelivr. It needs
WebAssembly JSPI, WebGL 2 and WebAudio, and checks for them rather than for
browser names.

It starts on its own and keeps the loading screen up until the intro, a menu or
a room is ready to show. URL options:

| Option | Effect |
| --- | --- |
| `?autoplay=0` | Start with a Play button |
| `?touch=1` / `?touch=0` | Force the touch controls on or off |
| `?stats=1` | Loading and runtime diagnostics |
| `?saves=1` | A dialog for the whole save store |
| `?persist=0` | Don't keep saves (for testing) |

The loading bar covers download, WebAssembly start-up and file system setup, a
quarter each; while the engine initialises it shows a moving segment. The
dancing Isaac is a 120-frame pixel-art strip stepped by CSS.

Downloads run in parallel. Hosts that support range requests stream archive
windows on demand; others download whole chunks in the background.

### Touch controls

`scripts/recomp/web/touch_controls.mjs` draws only the sticks, the pause mark
and the item bar. Everything else is the game's own HUD and menus, read from
game memory by `touch_game.mjs`. Every action is a keyboard key, paced on game
frames by `touch_input.mjs`.

- The sticks are eight-way with a little hysteresis, so a thumb resting between
  two directions doesn't flicker between them.
- The item bar's art is extracted from the game's archives at build time
  (`build_hud` in `scripts/recomp/assets/page_assets.py`).
- Tapping a menu row moves the game's own cursor there one step at a time, then
  confirms once the menu has settled.
- Rumble comes from the game itself (screen shakes and taking damage) and follows
  the RUMBLE option.

### Saves and mods

- Saves and options live in IndexedDB and load before the engine starts.
  **EDIT FILE** on the file screen exports a slot as a ZIP or imports a ZIP or a
  PC `.dat` save.
- Mods have their own store (`isaac-mods`); enabled mods are seeded before the
  engine scans for them, so a new mod loads when the page restarts. The MODS
  screen opens the mod browser (`mod_browser.mjs`): two pages of the game's own
  MODS paper, a searchable list and the chosen mod's description, over a
  catalogue built by `scripts/recomp/assets/modpack.py`. A ZIP or folder can be
  imported too. Workshop descriptions are cleaned of BBCode on the way in.
- Lua mods run on Lua 5.3.3 built into the host (`scripts/recomp/host/lua_build.py`);
  the game's calls into it go through `host_lua.c`, which formats `luaL_error`
  and `lua_pushfstring` arguments off the guest stack.

## Requirements

- Your own copy of the game.
- Python 3.11+ with `pypcode`, and Node.js 20+.
- Emscripten 6.0.5+ with emsdk activated (set `EMSDK` if needed).
- Ghidra and its Java runtime, for analysis and lifting.
- A C++20 `clang++` for the native decomp checks (`CLANGXX`/`EMXX` override it).
- Playwright's Chromium for the browser drivers: `npx playwright install chromium`.

The first lift and link take a while. [recomp-boot.md](recomp-boot.md) and
[recomp-architecture.md](recomp-architecture.md) cover inputs and the pipeline.
Everything generated stays local.

## Build and run

```sh
npm install

# Tables, memory image and host shims from your executable
python scripts/recomp/host/boot_tables.py
python scripts/recomp/host/memimage.py
python scripts/recomp/host/verify_memimage.py
python scripts/recomp/host/gen_shims.py

# Lift, then check the host
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

# Bundle the game files (replace <game-dir>), build the module, ship, serve
python scripts/recomp/assets/bundle.py build <game-dir> .scratch/game-bundle --strict
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build
python scripts/recomp/assets/ship.py check .scratch/game-dist
node scripts/recomp/web/serve_dist.mjs .scratch/game-dist 8200
```

Then open http://127.0.0.1:8200/.

After a change to the module:

```sh
python scripts/recomp/lift/build_boot.py --web --fast --jobs 3
python scripts/recomp/assets/ship.py build --no-compress
```

`npm run serve` runs the separate decomp-slice host, not the full game. The
`native/decomp/`, `decomp/`, `platform/` and `web/` trees belong to that
hand-translation track.

## Tests

```sh
npm test
npm run repo:check
python scripts/recomp/host/build_selftest.py

# Page, loading, audio, shipping and touch
node --test tests/recomp-portable.test.js tests/recomp-audio.test.js tests/recomp-web.test.js tests/recomp-ship.test.js
node --test tests/recomp-touch.test.js tests/recomp-touch-game.test.js tests/recomp-host-input.test.js

# Boot the real page and play a few frames
node scripts/recomp/web/drive_interactive.mjs "http://127.0.0.1:8200/?frames=1500&persist=0" output/recomp/local-smoke
node scripts/recomp/web/drive_boot.mjs "http://127.0.0.1:8200/play.html?ISAAC_EPOCH=1700000000" output/recomp/boot-check visits=2 cpu=4 gl=hw profile=0 timeout=600

# CPU profile of a live session
node scripts/recomp/web/profile_play.mjs "http://127.0.0.1:8200/?persist=0" output/recomp/local-profile cpu=1 gl=hw seconds=10
```

More drivers (saves, mods, floors, stress) are in
[`scripts/recomp/web`](../scripts/recomp/web). The decomp track has its own gate,
`node scripts/decomp/verify-unit.mjs`; see the [unit runbook](unit-runbook.md).

## Portable builds and releases

```sh
# One HTML file with everything inside; works offline
python scripts/recomp/assets/portable.py offline .scratch/game-dist .scratch/isaac.html

# A page plus payload chunks for a static host
python scripts/recomp/assets/portable.py chunks .scratch/game-dist .scratch/portable-local --chunks 33 \
    --base https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/c

# Optional mod catalogue
python scripts/recomp/assets/modpack.py <mods-dir> out/mods --base https://cdn.example.com/mods
```

Chunks stay under jsDelivr's 20 MB file limit. They are lightly scrambled (not
encrypted) and the inline modules minified; `--plain` turns both off.

### Publishing

`main` of this repository serves the page; `chiikabu/boi-portable` holds the
payload. Build from the published bundle, reuse the existing key, and pin the
page to the payload commit:

```sh
python scripts/recomp/assets/ship.py build --bundle .scratch/publish-bundle \
    --dist .scratch/publish-dist --copy --no-compress
python scripts/recomp/assets/ship.py check .scratch/publish-dist
python scripts/recomp/assets/portable.py chunks .scratch/publish-dist .scratch/publish-chunks \
    --chunks 33 --part-mib 19 --window-gz --key-of index.html \
    --base https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/c \
    --base-b https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@79d199a/c \
    --catalogue https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@main/mods

# After pushing the chunks
node scripts/recomp/assets/purge_cdn.mjs .scratch/publish-chunks gh/chiikabu/boi-portable@main
node scripts/recomp/assets/check_deployed.mjs \
    https://cdn.jsdelivr.net/gh/chiikabu/boi-portable@<payload-commit> \
    https://chiikabu.github.io/the-browsing-of-isaac/ .scratch/publish-chunks
```

## Known gaps

- Busy fights can drop below 60 fps on slower machines.
- The Bloom and Hallucination shaders log warnings.
- Steam and EOS online features are stubbed out.
- Language packs aren't mounted; the game runs in English.

## Where things are

- [`scripts/recomp/host`](../scripts/recomp/host): the host layer.
- [`scripts/recomp/lift`](../scripts/recomp/lift): the lifter and module builds.
- [`scripts/recomp/assets`](../scripts/recomp/assets): archives, shipping, portable builds, mod catalogues.
- [`scripts/recomp/web`](../scripts/recomp/web): the page, boot, touch controls and browser drivers.
- [`tests`](../tests): test suites.
- [decomp-port.md](decomp-port.md) and [recomp-architecture.md](recomp-architecture.md): the working logs of the port.
