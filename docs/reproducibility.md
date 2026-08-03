# Reproducibility guide (Chromebook / static page)

## Current verified boundary

`phase5-iret-cache-release-floor2` is the authoritative post-fix release probe.
It runs the production intro, survives every save chunk, navigates title to
character select, starts Basement, renders a floor, and acknowledges movement.
The machine-readable result records `runStarted`, `floorReady`, and
`gameplayInputProved` as true with an empty error list.

Historical served proof-build hashes are:

- `boxedwine.js`: `61995FEEB90C37A85B381D7E9D492F3FD492D055A361F69D62A1C55D2920D634`
- `boxedwine.wasm`: `B42E588B382EEF59128A2443A8C3D7B2AA2D4DC4BB96B46C2B413B31110EB954`
- playable JIT cache: `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379`

Measured gameplay cadence in that historical cache-replay probe is 8.93 FPS
median. The historical `phase6-standalone-iret-floor1` acceptance run repeats
the full path and measures 8.547 FPS median; its original artifact was
1,052,648,409 bytes with SHA-256
`3DB9BF34B4C5C119C63D1F7DFB079E2020440146770A009F2133910EA0C88C87`.

The final standalone is 1,052,643,363 bytes with SHA-256
`7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764`.
The authoritative served acceptance
`phase6-final-standalone-uncached-default-o3-warm60-floor1` records
`runStarted=true`, `floorReady=true`, `gameplayInputProved=true`, all seven stage
images, and zero errors. Its 125 samples measure 10.75268817204301 FPS median
(93 ms median, 124 ms p95, 140 ms p99, 144 ms max). The test suite passes
35/35. The 60 FPS target remains unmet.

Wasm-GC was not applied because it operates on authored GC types rather than the
linear memory used by BoxedWine/Emscripten C++ and guest RAM
([Wasm-GC overview](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md)).
Default jsDelivr GitHub delivery is unsuitable: packages over 150 MB and files
over 20 MB are excluded, HTML is served as `text/plain`, and immutable public CDN
caching conflicts with the proprietary/private payload
([jsDelivr restrictions](https://github.com/jsdelivr/jsdelivr#restrictions),
[data API restrictions](https://github.com/jsdelivr/data.jsdelivr.com#restrictions)).
Normal GitHub repositories also reject files over 100 MiB
([GitHub large-file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)).
Private source repositories now exist at
[the-browsing-of-isaac](https://github.com/doej13367/the-browsing-of-isaac) and
the [BoxedWine fork](https://github.com/doej13367/the-browsing-of-isaac-boxedwine)
on branch `isaac-browser`; both were created privately.

## 1. Own the game

Install Binding of Isaac: Repentance(+) on Steam. Do **not** copy game files into this repository for distribution. The agent/build only uses files you provide from your legitimate install.

## 2. Tooling

```bat
git clone https://github.com/emscripten-core/emsdk.git %USERPROFILE%\emsdk
cd %USERPROFILE%\emsdk
emsdk install latest
emsdk activate latest
call emsdk_env.bat
```

Node 18+ required for tests/serve/probes. Playwright is used for headless paint probes (`npm i playwright`).

Optional: Ghidra for deeper RE (community offsets also used via REPENTOGON/public notes).

## 3. Path B layout (current deliverable)

Static page under `web/emu/`:

| File | Role | Approx size |
|------|------|-------------|
| `index.html` | Boot page (`antialias:false`, `preserveDrawingBuffer:true`) | small |
| `boxedwine.js` + `boxedwine.wasm` | Post-IRET emulator release | ~4.1 MB |
| `boxedwine.zip` | Wine root FS (matched stack) | ~104 MB |
| `debian10.zip` | Overlay (stripped conflicting Wine/OpenGL) | ~76 MB |
| `isaac-nosfx.zip` | Immutable lean baseline (no sfx.a/music.a) | ~148 MB |
| `isaac-nosfx-phase4.zip` | Full-intro EDI repair + SteamApps stub + minimal floor aliases | ~148 MB |
| `isaac-nosfx-phase4-safeintro.zip` | Local two-frame intro evidence/runtime candidate | ~148 MB |
| `isaac-phase5-playable.zip` | Served release archive used by the final Phase 4 proof | ~279 MB |
| `isaac-phase5-playable-jit-modules.zip` | Replay JIT cache | ~2.9 MB |
| `isaac-phase6-full.zip` | Full local archive embedded by the standalone packer | ~566 MB |
| `isaac-savedir.zip` | Wine home overlay with `options.ini` 960×540 | tiny |

Full English packs live in `isaac.zip` / Steam install for optional fuller runs (slow under WASM).

## 4. Build / rebuild

```bat
cd <this-repo>
call %USERPROFILE%\emsdk\emsdk_env.bat

:: Incremental GL/present rebuild (after glcommon / knativescreen edits)
node scripts/rebuild-gl-present.mjs

:: Or CPU-only rebuild
node scripts/rebuild-boxedwine.mjs

:: Pack from Steam install (optional full zip)
node scripts/pack-isaac-app.mjs

:: Rebuild the current Phase 4 local artifacts
python scripts/build-steam-stub-pe.py
python scripts/patch-phase4-edi-restore.py
python scripts/make-phase4-runtime.py
python scripts/make-phase4-safeintro.py

:: Build the one-file local artifact
npm run build:standalone

:: Verify repository/runtime invariants
npm test
```

`tools/isaac-ng.unpacked.exe` and `web/emu/isaac-nosfx.zip` are retained as the immutable lean baseline. The Phase 4 builders copy `tools/isaac-ng.unpacked.phase4.exe` into the Phase 4 archives as `isaac-ng.exe`, install the dedicated SteamApps-compatible `steam_api.dll`, and add only the three floor-asset aliases documented in `phase4-evidence.md`.

## 5. Run (local / Chromebook)

```bat
npm run serve
```

Open:

```
http://127.0.0.1:8765/emu/?overlay=debian10;isaac-savedir&app=isaac-nosfx&p=isaac-ng.exe&resolution=960x540&sound=0
```

Final candidate URL:

```
http://127.0.0.1:8765/emu/?overlay=debian10;isaac-savedir&app=isaac-phase5-playable&p=isaac-ng.exe&resolution=960x540&sound=0
```

This served path is authoritative. Its final accepted tag is
`phase6-final-standalone-uncached-default-o3-warm60-floor1`. Direct-file boot
smoke also passes as `phase6-final-standalone-file-smoke1`, but it is only an
early-boot check; the served run remains the full visual/floor proof.

The final proof uses the unchanged production intro. The older
`isaac-nosfx-phase4-safeintro` archive remains only a historical acceleration
aid; it is no longer the acceptance boundary.

To serve the one-file artifact:

```bat
npm run serve:standalone
```

Open `http://127.0.0.1:8765/`. The generated HTML embeds the WASM runtime, root
and overlay archives, full Phase 6 app archive, and replay JIT cache. It is a
local proprietary artifact and is intentionally ignored by version control.

Chromebook notes:

- The served path is the authoritative full visual/floor proof. Direct `file://` early-boot smoke also passes, but it is not yet a full floor-path acceptance.
- Single-threaded host (no SharedArrayBuffer required for default path).
- First boot loads large zips (~minutes on slow devices).

## 6. Final Phase 4 probes

```bat
set SCRATCH=%TEMP%\isaac-probe
mkdir %SCRATCH%

:: Served release
set APP=isaac-phase5-playable
set TAG=phase5-iret-cache-release-floor2
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs

:: One-file standalone
set STANDALONE_HTML=output\isaac-repentance-standalone.html
set TAG=phase6-standalone-iret-floor1
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs

:: Final served acceptance
set STANDALONE_HTML=
set APP=isaac-phase5-playable
set TAG=phase6-final-standalone-uncached-default-o3-warm60-floor1
set NAV_GAP_SEC=5
set WAIT_MS=900000
node scripts/run-wgl-menu.mjs
```

Success is the seven-image sequence `menus-loaded,title,save,main-menu,character,floor,floor-moved`, plus `runStarted=true`, `floorReady=true`, `gameplayInputProved=true`, `navigationStage="floor"`, `err=[]`, and an empty crash context. The saved served and standalone JSON files both satisfy this boundary.

Direct-file smoke `phase6-final-standalone-file-smoke1` navigates directly to
`file:///.../isaac-repentance-standalone.html`. At 120 seconds it records one
swap, logs `Binding of Isaac Repentance+ v1.9.7.17.J460`, and has `err=[]`.
Its JSON SHA-256 is
`7CB658F2F1056EB598619F95F5A0DB5AC01C49D0CF6A670C6B4851185BB0D1CB`.
The early screenshot is expectedly black and has SHA-256
`7A5175F59992A07616D58B06A310B2A3909C43DF6D406A736EF54995563A09ED`.
This proves direct-file boot only; the served run remains the full visual/floor
acceptance.

## 7. PE patches (tools/isaac-ng.unpacked.exe)

| Site | Purpose |
|------|---------|
| CoInit / dinput / keytable skips | Unblock hang before GLFW |
| `0xA8C5A7`, `0x7EA7CE` | Null object skips post OpenAL |
| `0x9ab970`, `0xa2b5c2` | Skip sfx bank / per-sample open |
| `0x6F5198` | Null field skip post-SFX |
| `0xa19340` / `0xa193c0` | **Force window size getters → 960 / 540** |
| Candidate `0x987c09` → wrapper at `0x9afd89` | Preserve EDI across `0x9ef5c0`; fixes the proven wrong GameMenu receiver |

Reverted experiments are not part of the current executable:

- Free/ref helper `0xA648EF` remains original `test edx; je`; the `jle` experiment caused worse null writes.
- Music-call no-ops at `0x7E1D50` and `0x7E1E70` were tested, then restored to original `55 8B EC 51 53` prologues.

Current fingerprints:

- `tools/isaac-ng.unpacked.exe`: `5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200`
- `web/emu/isaac-nosfx.zip`: `1EC35FABB49F0E60DA18D12A1685167EF30E940A1085C0B652FEBB87636A84DB`
- Candidate `tools/isaac-ng.unpacked.phase4.exe`: `37CA11FEC3FA4AA4116847541217BB2BEA1B17195A3DB69964D5D4937365E6D6`
- `native/steam_stub/steam_api.dll`: `24C4A142B1DAE3C386C1BAD21431CE4FBD1C97F2AF01EFA745540FFEDE8D6CBF`
- `web/emu/isaac-nosfx-phase4.zip`: `2202ABEF619D622AE7EEAB7176B09D6B7E7A972060C3A40F5AEF4B133B1A316D`
- `web/emu/isaac-nosfx-phase4-safeintro.zip`: `CA5B33202B16506F6ADB434801F342CF94D336B237852E95A7C60CF717E251B9`
- `web/emu/boxedwine.js`: `31BA195E955CDB552946B6C216EA4DCE2810E6B8BB1A441F975737A602FB4703`
- `web/emu/boxedwine.wasm`: `61AA1E74994EE00BD762544B79B802C6C871E111144AFE4F2DD39E0925A3FB9D`
- `web/emu/index.html`: `8C7942255C8BD467BB0E1272F724E3B976A614B89F404BC36D900F3284F6CA25`
- `web/emu/isaac-phase5-playable.zip`: `CBB4AB286FB9CFAB36929357842AEF6C02A1A5FD168B52631208ED7D347D6AE5`
- `web/emu/isaac-phase5-playable-jit-modules.zip`: `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379`
- `web/emu/isaac-phase6-full.zip`: `CFE569DF184C482C4854C65F82427E95B960D170EA15B5C56CEEBFA795DC4566`
- old safe cache: `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379` (embedded/opt-in only)
- `output/isaac-repentance-standalone.html`: `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764` (1,052,643,363 bytes)
- final acceptance JSON: `ABCEF0BE0BE4CAA3F28708895D3263D9F66E56622C66F8CC1F1A8CC66007CFFC`

The accepted default is `jit-cache=false`. The old safe cache froze at swap #2
after runtime relink and remains embedded/opt-in only until regenerated. The
historical completed served and standalone proofs retain their proof-build hashes
at the top of this guide; earlier Phase 4 diagnostics remain history.

Steamless unpack is required (entry in `.text`); offline `steam_api` PE stub is cdecl-correct.

## 8. Boxedwine host patches (summary)

- Int98 boxeddrv: CreateWindow, GetDeviceCaps (incl. DESKTOP*RES), WGL 64/67/70–72
- Host GL bind + MakeCurrent forced TRUE; glClearDepthf; ClampColor no-op
- glShaderSource: `#version 300 es` + precision + `for(int i=`
- Renderbuffer size clamp; Multisample demoted to non-MS
- Present: `boxeddrv_autoPresent` + MS-safe blit; `antialias:false` on canvas
- glViewport / glTexImage2D clamps for garbage dimensions
- Browser input bridge: focused key events map to SDL scancodes and call exported `boxedwine_inject_key`; BoxedWine routes them through the focused X11 window's parent chain
- Framebuffer presentation: active draw FBO is tracked separately from the last non-default present FBO; destination Y is reversed during the browser blit
- IRET control flow: both JIT IRET helpers terminate the translated block after interpreter emulation
- Standalone packer: embeds every runtime dependency into one locally served HTML file

## 9. Status (honest)

| Gate | Status |
|------|--------|
| Static page + wasm + mount path | Done |
| Steam offline boot under Wine/WASM | Done |
| WGL context + swaps | Done |
| **Canvas nonblack (intro cutscene)** | **Done** (`nonblack>0`) |
| Stable title/save after production intro | **Done** |
| Character select entry/use | **Done** with acknowledged browser-key transitions |
| Basic floor and movement | **Done** with distinct floor/floor-moved frames |
| Served release proof | **Done**: `phase5-iret-cache-release-floor2` |
| One-file standalone proof | **Done**: `phase6-standalone-iret-floor1` |
| Final served acceptance | **Done**: `phase6-final-standalone-uncached-default-o3-warm60-floor1`; 10.75268817204301 FPS median |
| Direct-file boot smoke | **Done**: `phase6-final-standalone-file-smoke1`; early boot only, not floor proof |
| Test suite | **35/35 passing** |
| 60 FPS target | **Unmet** |
| Wasm-GC | **Not applied**: it does not optimize linear-memory C++/guest RAM without a GC-type rewrite |
| Private source repositories | **Created privately** |
| jsDelivr/CDN payload delivery | **Unsuitable by default**: size, MIME, immutable caching, and privacy constraints |
| Full music/sfx packs | Optional; asserts Music ID out of bounds without `music.a` |
| Lua mod API load | Scripts run at boot; full mod pack untested on menu |

## 10. Artifacts / evidence paths

- `docs/phase4-evidence.md` — authoritative Phase 4 evidence ledger and exact hashes  
- `docs/runtime-playable.md` — live session progress and blockers  
- `docs/build-flags.json`, `docs/pe-imports.json`, `docs/re-notes.md`  
- Probe outputs: `output/playwright/`; final served tag is `phase6-final-standalone-uncached-default-o3-warm60-floor1`; direct-file boot smoke is `phase6-final-standalone-file-smoke1`  
- Standalone: `output/isaac-repentance-standalone.html` (local/ignored)  
- Tests: `npm test` — 35/35 passing on 2026-08-03

## 11. Chromebook delivery checklist

1. Copy the required served files or the locally generated standalone onto the device.  
2. Use the served path for authoritative visual/floor validation; direct `file://` is supported only as a proven boot smoke so far.  
3. Preserve COOP/COEP/CORP response headers for the standalone server.  
4. Keep proprietary archives and generated standalone files out of the private source-only repositories.  
5. Do not use default jsDelivr GitHub delivery for the large private payload; its size, MIME, immutable-cache, and privacy model do not fit.  
6. Treat 8.547 FPS as historical; the accepted served median is 10.75268817204301 FPS and 60 FPS remains unmet.  
