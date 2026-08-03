# Path B — Boxedwine PE runner

## Current verified runtime

The post-fix release probe `phase5-iret-cache-release-floor2` proves the full
production-intro path through title, save, main menu, character select, a
rendered Basement floor, and acknowledged movement. Its JSON has
`runStarted=true`, `floorReady=true`, `gameplayInputProved=true`, and `err=[]`.

The last menu crash was a BoxedWine JIT IRET fall-through. The current release
calls `blockExit()` after IRET emulation; no game-mutex bypass is included.
Median guest cadence in that historical cached proof is 8.93 FPS. It proves
playability but does not meet the separate 60 FPS target.

The historical `phase6-standalone-iret-floor1` probe repeats the seven-stage
path and movement proof and measures 8.547 FPS median. Its original artifact was
1,052,648,409 bytes, SHA-256
`3DB9BF34B4C5C119C63D1F7DFB079E2020440146770A009F2133910EA0C88C87`.
The final standalone is 1,052,643,363 bytes, SHA-256
`7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764`.
The test suite passes 35/35.

The authoritative served acceptance
`phase6-final-standalone-uncached-default-o3-warm60-floor1` proves all seven
stages, run/floor/input success, and zero errors. Its 125 samples measure
10.75268817204301 FPS median (93 ms median, 124 ms p95, 140 ms p99, 144 ms max).
The 60 FPS target remains unmet. Wasm-GC was not applied because
BoxedWine/Emscripten C++ and guest RAM use
linear memory rather than authored GC types
([Wasm-GC overview](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md)).
Default jsDelivr GitHub delivery is unsuitable for the proprietary/private
payload because of its 150 MB package and 20 MB file limits, `text/plain` HTML,
and immutable public caching
([jsDelivr restrictions](https://github.com/jsdelivr/jsdelivr#restrictions),
[data API restrictions](https://github.com/jsdelivr/data.jsdelivr.com#restrictions)).
GitHub normally blocks repository files over 100 MiB
([GitHub large-file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)).
Private source repositories now exist at
[the-browsing-of-isaac](https://github.com/doej13367/the-browsing-of-isaac) and
the [BoxedWine fork](https://github.com/doej13367/the-browsing-of-isaac-boxedwine)
on branch `isaac-browser`; both were created privately.

## Required files (this folder)

| File | Role | Approx size |
|------|------|-------------|
| `boxedwine.js` + `boxedwine.wasm` | Post-IRET emulator release | ~4.1 MB |
| `boxedwine.zip` | Wine root FS (matched stack) | ~104 MB |
| `debian10.zip` | Overlay (stripped conflicting Wine/OGL) | ~76 MB |
| `isaac-nosfx.zip` | Immutable lean baseline | ~148 MB |
| `isaac-nosfx-phase4.zip` | Current full-intro EDI repair + SteamApps stub + minimal floor aliases | ~148 MB |
| `isaac-nosfx-phase4-safeintro.zip` | Local two-frame intro evidence/runtime candidate | ~148 MB |
| `isaac-phase5-playable.zip` | Served release archive used by the final proof | ~279 MB |
| `isaac-phase5-playable-jit-modules.zip` | Release replay JIT cache | ~2.9 MB |
| `isaac-phase6-full.zip` | Full local archive embedded in the standalone | ~566 MB |
| `isaac-savedir.zip` | options.ini 960×540 home overlay | tiny |
| `isaac.zip` | Full English packs (optional, slow) | ~1.4 GB |

## Build / pack

```bat
:: rebuild GL/present after source edits
node scripts/rebuild-gl-present.mjs

:: pack full game from Steam (optional)
node scripts/pack-isaac-app.mjs

:: rebuild current Phase 4 local artifacts
python scripts/build-steam-stub-pe.py
python scripts/patch-phase4-edi-restore.py
python scripts/make-phase4-runtime.py
python scripts/make-phase4-safeintro.py

:: build the one-file local artifact
npm run build:standalone

:: verify all repository/runtime checks
npm test
```

Stubs: `native/steam_stub`, `native/eos_stub` (offline).

## Run

```bat
npm run serve
```

```
http://127.0.0.1:8765/emu/?overlay=debian10;isaac-savedir&app=isaac-phase5-playable&p=isaac-ng.exe&resolution=960x540&sound=0
```

One-file local artifact:

```bat
npm run serve:standalone
```

Open `http://127.0.0.1:8765/`. The standalone embeds all runtime dependencies,
including the full Phase 6 archive and JIT cache. It and the proprietary game
archives are intentionally ignored and must not enter the private source
repositories. Default jsDelivr delivery is unsuitable for these large
private/proprietary files. Direct `file://` boot is supported by a smoke test,
but the served run remains the authoritative full visual/floor proof.

## Observed status (2026-08-03)

| Check | Result |
|-------|--------|
| Wine boot + isaac-ng load | OK (offline Steam stubs) |
| GLFW / WGL / shaders / HQ4X | OK |
| Window metrics | Forced 960×540 (PE + options) |
| Canvas **nonblack** | **OK** — intro cutscene paint (`nonblackSamples=4115`, stride 126) |
| Production intro and title/save | **OK** in served release and standalone proofs |
| Character select entry/use | **OK** with acknowledged browser-key transitions |
| Gameplay run / floor / movement | **OK** with run logs and distinct floor images |
| Served release proof | **OK**: `phase5-iret-cache-release-floor2` |
| One-file standalone proof | **OK**: `phase6-standalone-iret-floor1` |
| Final served acceptance | **OK**: `phase6-final-standalone-uncached-default-o3-warm60-floor1`; 10.75268817204301 FPS median |
| Direct-file boot smoke | **OK**: `phase6-final-standalone-file-smoke1`; early boot only |
| Test suite | **35/35 passing** |
| 60 FPS | **Unmet** |
| Wasm-GC | **Not applied**; linear-memory runtime would require a GC-type rewrite |
| Private source repositories | **Created privately** |
| jsDelivr/CDN payload delivery | **Unsuitable by default** |

The former post-title crash was traced to EDI: call site `0x987c09` returned from `0x9ef5c0` with EDI changed from the global manager to `manager+0x1dc`. The Phase 4 executable redirects that call through a wrapper at `0x9afd89` that preserves EDI. The current `steam_api.dll` supplies a dedicated SteamApps interface, English-language strings, and true subscription/DLC checks. The final save-menu blocker was a separate JIT IRET fall-through; both IRET helpers now terminate the translated block after interpreter emulation.

The browser build includes the focused-key → SDL scancode → guest input bridge
and the framebuffer selection/Y-flip repair. Both final probes save title, save,
main-menu, character, floor, and moved-floor images and acknowledge every input,
superseding the earlier black-frame diagnostic.

## Probes

```bat
set SCRATCH=%TEMP%\isaac-probe
mkdir %SCRATCH%
set TAG=wgl-paint
set WAIT_MS=600000
node scripts/run-wgl-paint7.mjs
set TAG=wgl-menu
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs

set APP=isaac-phase5-playable
set TAG=phase5-iret-cache-release-floor2
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs

set STANDALONE_HTML=output\isaac-repentance-standalone.html
set TAG=phase6-standalone-iret-floor1
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs

set STANDALONE_HTML=
set APP=isaac-phase5-playable
set TAG=phase6-final-standalone-uncached-default-o3-warm60-floor1
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs
```

SHA-256 anchors:

- `isaac-nosfx-phase4.zip`: `2202ABEF619D622AE7EEAB7176B09D6B7E7A972060C3A40F5AEF4B133B1A316D`
- `isaac-nosfx-phase4-safeintro.zip`: `CA5B33202B16506F6ADB434801F342CF94D336B237852E95A7C60CF717E251B9`
- served/embedded proof-build `boxedwine.js`: `61995FEEB90C37A85B381D7E9D492F3FD492D055A361F69D62A1C55D2920D634`
- served/embedded proof-build `boxedwine.wasm`: `B42E588B382EEF59128A2443A8C3D7B2AA2D4DC4BB96B46C2B413B31110EB954`
- served/embedded proof-build `index.html`: `974481D3FF209975727DD2FB7AD8C081B8539AD2D9C6D4B5D6CE2FE112F4019D`
- accepted `boxedwine.js`: `31BA195E955CDB552946B6C216EA4DCE2810E6B8BB1A441F975737A602FB4703`
- accepted `boxedwine.wasm`: `61AA1E74994EE00BD762544B79B802C6C871E111144AFE4F2DD39E0925A3FB9D`
- accepted `index.html`: `8C7942255C8BD467BB0E1272F724E3B976A614B89F404BC36D900F3284F6CA25`
- `isaac-phase5-playable.zip`: `CBB4AB286FB9CFAB36929357842AEF6C02A1A5FD168B52631208ED7D347D6AE5`
- old safe cache `isaac-phase5-playable-jit-modules.zip`: `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379` (embedded/opt-in only)
- `isaac-phase6-full.zip`: `CFE569DF184C482C4854C65F82427E95B960D170EA15B5C56CEEBFA795DC4566`
- historical accepted standalone: `3DB9BF34B4C5C119C63D1F7DFB079E2020440146770A009F2133910EA0C88C87`
- final `output/isaac-repentance-standalone.html`: `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764` (1,052,643,363 bytes)
- final served JSON: `ABCEF0BE0BE4CAA3F28708895D3263D9F66E56622C66F8CC1F1A8CC66007CFFC`
- direct-file smoke JSON: `7CB658F2F1056EB598619F95F5A0DB5AC01C49D0CF6A670C6B4851185BB0D1CB`

The accepted default is `jit-cache=false`. The old safe-cache archive froze at
swap #2 after runtime relink and remains embedded/opt-in only until regenerated.

Direct-file smoke `phase6-final-standalone-file-smoke1` loads
`file:///.../isaac-repentance-standalone.html`, records one swap at 120 seconds,
logs `Binding of Isaac Repentance+ v1.9.7.17.J460`, and has `err=[]`. Its black
early-boot screenshot is expected and hashes to
`7A5175F59992A07616D58B06A310B2A3909C43DF6D406A736EF54995563A09ED`.
This is boot smoke only; the served run supplies the complete visual/floor proof.

See `docs/phase4-evidence.md`, `docs/runtime-playable.md`, and `docs/reproducibility.md`.
