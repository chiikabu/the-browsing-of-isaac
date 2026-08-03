# Phase 0 blockers

## Resolved
- Game install, Emscripten 6.0.5, Ghidra 12.1.2, REPENTOGON, Boxedwine build + Wine FS + isaac.zip

## Open (criterion 4)
- Full resources.packed not in browser mount for PE path (~1.4GB)
- SteamAPI offline soft-fail
- The separate 60 FPS target remains unmet; historical playable probes measured 8.93 FPS served and 8.547 FPS standalone.
- Final served acceptance `phase6-final-standalone-uncached-default-o3-warm60-floor1` passes at 10.75268817204301 FPS median; direct-file early-boot smoke also passes.
- Wasm-GC is not a linear-memory optimization for the existing BoxedWine/Emscripten C++ and guest-RAM architecture.
- Private source repositories were created; default jsDelivr delivery remains unsuitable for the large proprietary/private payload.
