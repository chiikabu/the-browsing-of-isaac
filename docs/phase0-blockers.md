# Phase 0 blockers

## Resolved
- Game install, Emscripten 6.0.5, Ghidra 12.1.2, REPENTOGON

## Removed (2026-08-07) — Path B / BoxedWine
The whole Path B x86-emulation runtime was removed from the repository by owner
directive because its measured frame cost made it unwanted. The blocker list
below previously carried the Path B / Candidate F / Candidate H entries: the
resources.packed browser-mount gap for the PE path, the SteamAPI offline
soft-fail, the historical 8.93 / 8.547 / 10.75 FPS probe medians, the sealed
cold benchmark bundle and TestJit batch evidence, the cold-cache-only packaging
rule, the "Wasm-GC does not optimize the BoxedWine/Emscripten linear-memory
architecture" finding, and the jsDelivr delivery assessment. Those measurements
happened and are not retracted; they simply no longer describe anything shipped
here. The evidence documents that held them (`docs/phase4-evidence.md`,
`docs/runtime-playable.md`, `docs/reproducibility.md`,
`docs/candidate-h-release.md`) were deleted with the emulator.

## Open
- The 60 FPS target is unmet. No playable full-frame path exists in this
  repository right now: the native port owns the Update tick and a wired Render
  root slice, while full Render/Input/Exit/Lua root slices and a live sparse
  bridge from PE guest RAM remain outstanding. See `docs/decomp-port.md`.
- No physical Chromebook validation has been performed.
