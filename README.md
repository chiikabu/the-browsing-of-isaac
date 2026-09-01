# Isaac Repentance+ — Browser WebAssembly host

Self-contained static web page that mounts **your** Binding of Isaac:
Repentance(+) install and runs the browser platform host (WebGL2, MEMFS/OPFS
mount, input, rAF). The shipped simulation tick is a verified **native/Wasm
decomp port** of the original binary — see `docs/decomp-port.md` and `AGENTS.md`.

## Path B (BoxedWine x86 emulation) — REMOVED 2026-08-07

Path B ran the original PE32 binary under an x86 emulator (BoxedWine → Wine)
compiled to WebAssembly. It was the playable baseline from Phase 2 through
Candidate H. It has been **removed from this repository in full** by owner
directive: it measured **11.36 FPS median** on the tested desktop (88 ms median
frame, 122 ms p95, 7.46 FPS 1%-low), which made it unwanted rather than a
baseline worth carrying.

Those measurements are not retracted — they happened, and the honest 60 FPS
failure they recorded is why the native port is the only remaining route. What
was removed, and is therefore no longer buildable or reproducible from this
tree:

- `web/emu/` — the emulator page, `boxedwine.js`/`.wasm` runtime, Wine/Debian
  guest images, Isaac guest packs, JIT-cache archives, offline PWA
  bootstrap/service worker, and guest `steam_api` stubs.
- `third_party/Boxedwine` — the emulator submodule (`.gitmodules` entry and
  index entry removed).
- The build/packaging chain: `rebuild-boxedwine`, `rebuild-gl-present`,
  `build-candidate-h-runtime`, `build-standalone-html`, `build-offline-pwa`,
  `serve-standalone`, `serve-offline-pwa`, `stage-benchmark-bundle`,
  `pack-isaac-app`, and the Phase 4–6 guest-image Python builders.
- The benchmark/audit harness that existed only to measure the emulator:
  `benchmark-*.mjs`, `run-benchmark-campaign.mjs`, `run-wgl-*.mjs` and the other
  Playwright probes, `audit-jitprofile-*`, `audit-browser-memory-trace`,
  `audit-idbfs-persistence`, `audit-warm-standalone-resume`, and the benchmark
  save-overlay builders.
- The evidence documents whose whole subject was that runtime:
  `docs/candidate-h-release.md`, `docs/reproducibility.md`,
  `docs/runtime-playable.md`, `docs/phase4-evidence.md`.

There is now **no playable full-PE fallback**. Full native root slices for
Render/Input/Exit/Lua and a live sparse bridge from PE guest RAM are the
outstanding work; `docs/decomp-port.md` holds the exact next boundary.

The `usesX86Emulation` flag and the `emulator` / `boxedwine` / `pe-emu` residual
host kinds survive in `scripts/decomp/frame-path.mjs` and
`web/js/native-update-bridge.js` deliberately: they now exist only as a guard
that throws if anything tries to re-enter x86 emulation.

## Requirements

- Legal Steam install of the game (this repo never ships game files).
- Node 18+, Emscripten 6.x (`%USERPROFILE%\emsdk`).
- Chromium-based browser with WebGL2. Chromebook/ChromeOS support requires
  physical-device validation, which has not been performed.

## Development-host quick start

```bat
cd path\to\the-browsing-of-isaac
call %USERPROFILE%\emsdk\emsdk_env.bat
npm run build:wasm
npm test
npm run serve
```

Open `http://127.0.0.1:8765/`. The page auto-mounts the locally owned game
instance archived at `game-instance/isaac-phase6-full.zip` (extracted once into
the ignored `.scratch/game-instance/`); `$ISAAC_INSTANCE_ZIP` overrides that
archive path and `$ISAAC_GAME_ROOT` (or a `.game-root` file) overrides the mount
with a directory. **Choose game directory** and drag-and-drop still work.

## Decomp-work quick start

```bat
npm run decomp:status
```

prints the live port state (family ABI versions, the open-boundary worklist,
verification freshness) derived from the tree — never trust a doc's
"checkpoint" narrative over it. `decomp/frontier.json` holds the last unit's
hand-off pointer. Binary censuses go through the prebuilt instruction/xref
index: `npm run decomp:index` once (≈1 min), then
`python scripts/decomp/tools/pequery.py <writers|readers|callers|body|sig|...>`.
Per-unit procedure: `docs/unit-runbook.md`. Rules and measured lessons:
`AGENTS.md` (archived checkpoint narratives: `docs/decomp-history.md`).

## Layout

| Path | Role |
|------|------|
| `web/` | Static deliverable (HTML, JS, WASM, platform copy) |
| `platform/` | Pure JS path/input/mount/frame helpers (unit-tested) |
| `native/isaac_host.cpp` | Emscripten host (GL, PE load, sigscan, Lua hooks) |
| `native/decomp/`, `decomp/`, `scripts/decomp/` | Native/Wasm decomp port, oracles, verifier |
| `docs/` | Phase 0, RE notes, build flags, imports, decomp port log |
| `game-instance/` | Local-only game instance archive (ignored) |
| `third_party/REPENTOGON` | Community signature database |

## License / legal

You must own the game. All original, modified, extracted, chunked, embedded, or
packaged game payloads are private/local-only. Do not commit, publish, upload,
attach to a release, place on a CDN or shared cloud drive, package, or
redistribute `isaac-phase6-full.zip`, its chunk files, executables,
`resources/packed`, extracted assets, or containers containing them. Splitting a
proprietary archive into chunks and keeping a repository private do not grant
redistribution rights.
