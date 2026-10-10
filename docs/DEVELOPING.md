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

A build that ships its boot trail (the archive windows a boot reads) shows the
loading bar in bytes: the startup download, then the boot's own reads, which are
most of a first visit's wait; a build without one shows a moving segment while the
engine starts. The dancing Isaac is an 84-frame loop of 42 px pixel art, drawn on a canvas at a
whole number of device pixels per art pixel.

Downloads run in parallel. Hosts that support range requests stream archive
windows on demand; others download whole chunks in the background. Once the boot
is done, the windows a first run reads (shipped as `runTrail`, and remembered from
this browser's own first run) are fetched while the player is still on the menus,
so the first room doesn't wait on the network.

### Touch controls

`scripts/recomp/web/touch_controls.mjs` draws only the sticks, the pause mark
and the item bar. Everything else is the game's own HUD and menus, read from
game memory by `touch_game.mjs`. Every action is a keyboard key, paced on game
frames by `touch_input.mjs`.

- Movement is eight-way and firing four-way (the game only shoots in four
  directions), each with a little hysteresis so a thumb resting between two
  directions doesn't flicker between them. A stick lifted and touched again
  near the same spot within a second keeps its base, so repeated taps aim at once.
- The item bar's art and the menus' BACK note are extracted from the game's
  archives at build time (`build_hud` in `scripts/recomp/assets/page_assets.py`).
- Tapping a menu row moves the game's own cursor there one step at a time. Rows
  closer together on screen than a fingertip (40 CSS px) are picked by the first
  tap and chosen by a second; a tap between rows does nothing. Upright, a pad
  under the picture steps the cursor.
- A hidden tab opens the pause menu and mutes the sound; a tap skips a cutscene.
- Rumble comes from the game itself (screen shakes and taking damage) and follows
  the RUMBLE option.

### Controllers

The game polls XInput; `host_shims_xinput.c` provides `XInput1_4.dll`'s
`XInputGetState`, `XInputGetCapabilities` and `XInputSetState`, and asks the page
(`gamepad.mjs`), which reads the browser's Gamepad API: the first four pads in
the browser's order are slots 0..3, the standard mapping laid out as XInput names
it, rumble played on the pad's vibration actuator. The page's own menus (EDIT
FILE, the mod browser) take the d-pad, A and B while they are open, and the game
sees a resting pad meanwhile.

### Saves and mods

- Saves and options live in IndexedDB and load before the engine starts.
  **EDIT FILE** on the file screen exports a slot as a ZIP or imports a ZIP or a
  PC `.dat` save.
- Mods have their own store (`isaac-mods`); enabled mods are seeded before the
  engine scans for them, so a new mod loads when the page restarts. The MODS
  screen opens the mod browser (`mod_browser.mjs`): two pages of the game's own
  MODS paper, a searchable list and the chosen mod's description, over a
  catalogue built by `scripts/recomp/assets/modpack.py`. A ZIP or folder can be
  imported too. Workshop descriptions are cleaned of BBCode on the way in and
  scroll when they are long; a catalogue built before `modpack.py` kept them whole
  can carry a `descriptions.json` beside it with the full texts.
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

Shipping removes the Wasm `name` custom section from the distribution copy;
the original build keeps its profiler and stack names. Use
`ship.py build --keep-wasm-names` when preparing a profiling distribution.
Executable sections and other custom sections remain byte-identical.
Compression now considers files from 1 KiB, including page modules and Lua;
both the probe and final encoding must save at least 5%. Windowed archives
retain their raw range contract. Neither change reduces asset quality.

The dispatcher uses 32-byte function pages and 8-byte continuation pages
instead of dense tables spanning every guest text address. Callable cache
entries retain both the function ID and pointer; diagnostic counting and
timing stay on the diagnostic path. Entry-first calls and continuation-first
returns still have different lookup precedence.
Wrapped-function continuations dispatch to the original `__lifted` body,
not its public fast-path wrapper. Split-function continuations dispatch
through their owning trampoline so pending jumps cross parts correctly;
function prototypes do not establish block ownership.

The unchanged-value path of `0x00a14c00` compares the first active matching
uniform's latest payload using the incoming type's width. It performs no
guest allocation or write. Changed values, missing entries, unsafe aliases,
and unsupported types retain the original version/snapshot machinery.
`ISAAC_FASTPATH_VERIFY=1` executes both paths and compares CPU state and
captured guest data; the original remains authoritative. This mode is for
correctness, not timing. `ISAAC_FASTPATH=0` disables all native shortcuts,
so it is not a uniform-only performance control.

Client-array uploads end at the last referenced attribute byte, not at an
extra trailing stride. Packed/half-float widths and mixed-type alignment
are covered by real WebGL2 pixel tests:

```sh
node --test tests/recomp-dispatch.test.js tests/recomp-fastpath.test.js tests/recomp-gl-clientarrays.test.js
```

For matched browser measurements, use identical assets, seed, input,
throttle, and warmup; run variants sequentially without builds or tests.
Pool FPS as total presented intervals divided by total interval time.
`profile_load.mjs` reads the native `#canvas` GPU identity, not an unrelated
HUD canvas. CPU throttling is not proof of performance on physical low-end
hardware.

**Stock shader compatibility.**

The native WebGL backend repairs the loop-index declarations in the
fingerprinted stock Bloom and Hallucination fragments. Their original
declarations failed GLSL ES 1.00 compilation in ANGLE. The repair preserves
their equations and iteration counts; custom shaders are not rewritten.

The reduced-resolution bloom experiment was removed after both final
matched comparisons regressed FPS. Bloom renders at its original resolution;
there is no reduced-bloom switch or compositor.

Rebuild the native module and verify actual bloom in gameplay, including
subsequent ordinary draws, rather than inferring delivery from shader
compilation alone. The host regressions run with:

```sh
python scripts/recomp/host/build_selftest.py
```

See [decomp-port.md](decomp-port.md) for verification and measured FPS gains
from the retained optimizations.

Audio uploads borrow guest PCM only for the synchronous backend call.
WebAudio owns the converted samples afterward, including queued versions
whose guest buffers have been replaced or deleted. Aligned 16-bit uploads
use signed `HEAP16` reads; unaligned data retains little-endian decoding.
No audio format, sample rate, asset quality, or game logic is reduced.

When reusing an old bundle after frontend changes, regenerate page assets:

```sh
python scripts/recomp/assets/page_assets.py build .scratch/game-bundle
```

The HUD and mod-browser art are generated from the game archives. A stale
bundle can pass its own manifest check while lacking assets required by the
current frontend; run the actual page as well as checking the distribution.

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
node --test tests/recomp-dispatch.test.js tests/recomp-trampoline.test.js
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

### Window recipes

Most of the archive bytes a boot reads are 16-bit WAV sound effects, and a KAGE
archive's version-2 (MiniZ) compression barely touches them. A version-0 archive
(entries only XORed and byte-permuted) can instead ship each 1 MiB window as a
*recipe*: the entries' plain bytes, with the PCM coded losslessly (FLAC-style
fixed predictors, Rice codes, stereo side channels). The page's
[`recipe.js`](../scripts/recomp/web/recipe.js) rebuilds the window into the
archive's exact bytes; the engine reads version-0 archives itself.

```sh
python scripts/recomp/assets/archive.py repack --version 0 <in.a> <out.a>   # per DLC archive
python scripts/recomp/assets/recipe.py size <out.a>                          # what recipes would save
python scripts/recomp/assets/portable.py chunks <dist> <out> --part-mib 1 --window-gz \
    --recipe resources/packed/afterbirthp.a resources/packed/afterbirth.a ...
```

A window ships as a recipe (flag 2) only when that takes at least 1.6% off it;
windows of Ogg or PNG entries ship as they are. The game's own `sfx.a` is
already version 0, so its recipes need no repack. Recipes shrank stream B
from 525.8 to 454.0 MB, and a cold boot's reads from 171.8 to 119.9 MB.

The shipped sound is near-lossless:
[`lossy.py`](../scripts/recomp/assets/lossy.py) `trim` rounds away the low
bits of each 1024-frame block that sit at least 6 dB under that moment's
quietest spectral band (lossyWAV's rule; digital silence keeps every bit). It
rewrites the archive in place, with the same layout and fresh entry
checksums, and the recipe coder then never sends those bits.

```sh
python scripts/recomp/assets/lossy.py trim <v0.a> <trimmed.a> --margin 6
```

The page also starts with `VSync=1` in `options.ini`. With VSync off, the
game's own frame limiter spins to a 60 Hz deadline that drifts against the
browser's vsync, and every ~25th frame takes two vsyncs.

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
- Steam and EOS online features are stubbed out.
- Language packs aren't mounted; the game runs in English.

## Where things are

- [`scripts/recomp/host`](../scripts/recomp/host): the host layer.
- [`scripts/recomp/lift`](../scripts/recomp/lift): the lifter and module builds.
- [`scripts/recomp/assets`](../scripts/recomp/assets): archives, shipping, portable builds, mod catalogues.
- [`scripts/recomp/web`](../scripts/recomp/web): the page, boot, touch controls and browser drivers.
- [`tests`](../tests): test suites.
- [decomp-port.md](decomp-port.md) and [recomp-architecture.md](recomp-architecture.md): the working logs of the port.
