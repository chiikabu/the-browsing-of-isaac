# Isaac Repentance+ — Browser WebAssembly host

Self-contained static web page that mounts **your** Binding of Isaac: Repentance(+) install and runs the browser platform host (WebGL2, MEMFS/OPFS mount, input, rAF). Path **B** targets execution of the original PE32 binary under an x86 emulator (Boxedwine); see `docs/`.

## Current Path B checkpoint

Phase 4 is complete. The served release proof `phase5-iret-cache-release-floor2` runs the unchanged production intro, navigates title → save → main menu → character select, starts a Basement run, renders the floor, and proves movement with a distinct post-input frame. The final blocker was a BoxedWine JIT IRET fall-through; the release exits the translated block immediately after IRET.

The historical one-file proof `phase6-standalone-iret-floor1` repeats the same path and measured 8.547 FPS median. Its original size/hash remain in the evidence ledger. The final standalone is 1,052,643,363 bytes with SHA-256 `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764`. `npm test` passes 35/35.

Functional completion does not imply the separate 60 FPS target; it remains unmet. Wasm-GC was not applied because it operates on authored GC reference types, while BoxedWine/Emscripten C++ state and guest RAM live in WebAssembly linear memory ([Wasm-GC overview](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md)). jsDelivr's default GitHub delivery restrictions exclude packages over 150 MB and individual files over 20 MB, serve HTML as `text/plain`, and immutable public CDN caching conflicts with this proprietary/private payload ([jsDelivr restrictions](https://github.com/jsdelivr/jsdelivr#restrictions), [data API restrictions](https://github.com/jsdelivr/data.jsdelivr.com#restrictions)). GitHub also blocks files over 100 MiB in normal repositories ([GitHub large-file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)). Private source repositories were created at [the-browsing-of-isaac](https://github.com/doej13367/the-browsing-of-isaac) and the [BoxedWine fork](https://github.com/doej13367/the-browsing-of-isaac-boxedwine) on branch `isaac-browser`.

The accepted served runtime is JS `31BA195E955CDB552946B6C216EA4DCE2810E6B8BB1A441F975737A602FB4703`, WASM `61AA1E74994EE00BD762544B79B802C6C871E111144AFE4F2DD39E0925A3FB9D`, and index `8C7942255C8BD467BB0E1272F724E3B976A614B89F404BC36D900F3284F6CA25`. `phase6-final-standalone-uncached-default-o3-warm60-floor1` proves the complete seven-stage path with no errors at 10.75268817204301 FPS median (125 samples; 93 ms median, 124 ms p95, 140 ms p99, 144 ms max). The default is `jit-cache=false`: the old safe-cache archive froze at swap #2 after the runtime relink and remains embedded/opt-in only until regenerated. Served acceptance is authoritative. `phase6-final-standalone-file-smoke1` separately proves direct `file://` early boot (one swap, version logged, no errors); it is not a floor proof.

See `docs/phase4-evidence.md` for the proof ledger and `docs/reproducibility.md` for local rebuild/run instructions.

## Requirements

- Legal Steam install of the game (this repo never ships game files).
- Node 18+, Emscripten 6.x (`%USERPROFILE%\emsdk`).
- Chromium-based browser (Chromebook OK) with WebGL2.

## Quick start

```bat
cd path\to\the-browsing-of-isaac
call %USERPROFILE%\emsdk\emsdk_env.bat
npm run build:wasm
npm test
npm run serve
```

Open `http://127.0.0.1:8765/`. Use **Choose game directory** or drag-and-drop the Steam game folder.

## Layout

| Path | Role |
|------|------|
| `web/` | Static deliverable (HTML, JS, WASM, platform copy) |
| `platform/` | Pure JS path/input/mount/frame helpers (unit-tested) |
| `native/isaac_host.cpp` | Emscripten host (GL, PE load, sigscan, Lua hooks) |
| `docs/` | Phase 0, RE notes, build flags, imports |
| `third_party/REPENTOGON` | Community signature database |
| `third_party/Boxedwine` | Emulator source for Path B |

## License / legal

You must own the game. Do not redistribute `isaac-ng.exe` or `resources/packed`.
