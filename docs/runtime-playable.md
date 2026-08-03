# Runtime playable status

## Authoritative Phase 4 checkpoint (2026-08-03, post-IRET fix)

Phase 4 is complete in the local Path B runtime. The single release probe
`phase5-iret-cache-release-floor2` uses the production intro and original local
PE archive, then proves the complete interaction path:

- title, save, main menu, and character screenshots;
- acknowledged browser-to-guest Enter input at every transition;
- `RNG Start Seed: 3W3E GJ7M`, player initialization, Basement
  `Level::Init`, and `Room 1.2(Start Room)`;
- a rendered floor screenshot plus a different post-W movement screenshot;
- `runStarted=true`, `floorReady=true`, and `gameplayInputProved=true` in the
  machine-readable JSON.

The independent one-file run `phase6-standalone-iret-floor1` repeats all seven
stages from `output/isaac-repentance-standalone.html`, including acknowledged
navigation and movement, with no recorded error or crash context. The HTML is
1,052,648,409 bytes (SHA-256
`3DB9BF34B4C5C119C63D1F7DFB079E2020440146770A009F2133910EA0C88C87`).

The final `Menu Save Init` blocker was a BoxedWine JIT control-flow bug. Wine's
`set_full_cpu_context` executed `IRET` at `0x7bcb2960`, but a block containing a
forward branch also emitted the following instruction. The JIT fell through to
`0x7bcb2961` with restored `ECX=0x40010006`, used it as a context pointer, and
raised `c0000005` while unwinding `OutputDebugStringA`. Isaac's crash reporter
then recursively entered its logger and slept forever. `jitOther.h` now exits
the translated block immediately after both 16-bit and 32-bit IRET helpers.

The rejected game-mutex bypass is not part of the active tree or artifacts.
The post-fix evidence has no `0x7bcb2961` fault, no recursive mutex sleep, and
an empty error list. Measured cached-replay guest cadence is **8.93 FPS median**
(107 deltas; 112 ms median, 148 ms p95). Phase 4 is playable, but the separate
60 FPS optimization goal is not met and must not be claimed as complete.
The standalone proof measures **8.547 FPS median** (100 deltas; 117 ms median,
161 ms p95); this is a historical metric. `npm test` passes 35/35.

The final runtime is JS `31BA195E...`, WASM `61AA1E74...`, index
`8C794225...`, and standalone HTML `7F381319...` (1,052,643,363 bytes).
`phase6-final-standalone-uncached-default-o3-warm60-floor1` is the authoritative
served acceptance: `runStarted`, `floorReady`, and `gameplayInputProved` are
true; all seven stages are saved; the error count is zero. Its 125 samples
measure **10.75268817204301 FPS median** (93 ms median, 124 ms p95, 140 ms p99,
144 ms max).

The accepted default is `jit-cache=false`. The old safe cache `278D3304...`
froze at swap #2 after runtime relink and remains embedded/opt-in only until
regenerated. Served acceptance is authoritative.

Direct-file boot smoke `phase6-final-standalone-file-smoke1` also passes. It
navigates `file:///.../isaac-repentance-standalone.html`; at 120 seconds it has
one swap, logs `Binding of Isaac Repentance+ v1.9.7.17.J460`, and records no
errors. Its JSON SHA-256 is
`7CB658F2F1056EB598619F95F5A0DB5AC01C49D0CF6A670C6B4851185BB0D1CB`.
The expected black early-boot screenshot hashes to
`7A5175F59992A07616D58B06A310B2A3909C43DF6D406A736EF54995563A09ED`.
This is a boot smoke only; served acceptance remains the full visual/floor proof.

The separate 60 FPS target remains unmet. Wasm-GC was not applied because GC
types are independent of linear memory; BoxedWine/Emscripten C++ and guest RAM
use linear memory rather than authored Wasm-GC types
([Wasm-GC overview](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md)).
jsDelivr's size, MIME, and immutable public-cache restrictions make it unsuitable
for the private proprietary payload
([jsDelivr restrictions](https://github.com/jsdelivr/jsdelivr#restrictions),
[data API restrictions](https://github.com/jsdelivr/data.jsdelivr.com#restrictions)).
GitHub's normal 100 MiB file ceiling is another delivery constraint
([GitHub large-file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)).
Private source repositories now exist at
[the-browsing-of-isaac](https://github.com/doej13367/the-browsing-of-isaac) and
the [BoxedWine fork](https://github.com/doej13367/the-browsing-of-isaac-boxedwine)
on branch `isaac-browser`; both were created privately.

The sections below are chronological engineering notes. Labels such as “current
blocker” describe their dated checkpoint, not the authoritative state above.

## Host (isaac-host.wasm)
OK — Playwright x2, WebGL filled.

## Path B progress
DONE:
- Full English packs in `isaac.zip` (+ `run.bat` launcher)
- Offline steam_api PE stub (`scripts/build-steam-stub-pe.py`) — **cdecl-correct** no-ops
- EOSSDK soft-fail stub
- Wine 5.0 + debian10 + OpenGL SDL Boxedwine
- Pack strips Windows CRT that shadows Wine
- **SteamStub DRM** unpacked (Steamless) → entry `.text` `0x6efc46`
- **CPUID leaf 4 + 7** in Boxedwine (`cpu.cpp` rebuilt into `web/emu/boxedwine.wasm`)
- **Null-execute crash fixed** (SteamAPI RegisterCallback cdecl)
- **int 0x98 boxeddrv host (FIXED)** — first-class `Int98` opcode

## Root cause of null-execute (FIXED)

Static C++ initializer at `0x4068c0` calls `SteamAPI_RegisterCallback` twice during CRT `_initterm`. Our PE stub used **`ret 8` (stdcall)** while Valve SteamAPI C exports are **`__cdecl`**. Double stack cleanup corrupted `_initterm` → `ret` to address **0**.

Fix: plain `ret` on Register/Unregister; `SteamInternal_SteamAPI_Init` returns `0` (OK).

## Root cause of display #GP / post-int98 pagefault (FIXED)

Guest `winex11.drv.so` uses **int 0x98** (boxeddrv) for GDI/window/WGL host calls. The host only handled int 0x99/9A/9B.

### Bug 1: missing handler → #GP
Without a handler, every CreateWindow path raised #GP → SEH → page fault reading `0xFFFFFFFF` at the `int 0x98` instruction.

### Bug 2: IntIb is DECODE_BRANCH_NO_CACHE → null next-op
The first int98 stub lived under `normal_intIb`. **IntIb** is flagged `DECODE_BRANCH_NO_CACHE`, so `op->next` is NULL. `NEXT()` then did `op->next->pfn(...)` / `normalDispatch(cpu, NULL)` → guest faults on the **instruction immediately after** every int98 (`add esp, N`), with bogus CR2 values (2, 6, 0, …).

### Fix
Decode **int 0x98 as first-class `Int98`** (same flags as Int99: chainable, not BRANCH_NO_CACHE):

| File | Change |
|------|--------|
| `decoder.h` | `Int98` enum after `Int9B` |
| `decoder.cpp` | flags `{0,1,1,0,0,0,0}`, name, route imm==0x98 → Int98 |
| `cpu_init.h` | `INIT_CPU(Int98, int98)` |
| `normal_other.h` | `normal_int98` OPCALL (index→EAX table) |
| `jitOther.h` | `dynamic_int98` → emulateSingleOp |

Host table (partial): index **88→3** (gdi version probe), **45** GetDeviceCaps, **7** CreateWindow TRUE, **79** CreateDC, **77** GetSurface NULL, **64** fake HGLRC, etc.

### Proof (`int98-fixed` probe, 100s)
| Check | Before | After Int98 fix |
|-------|--------|-----------------|
| page fault after int98 | every call | **none** |
| version mismatch spam | yes (botched binary patch) | **none** |
| int98 index 88 | →3 then crash | →3, continues |
| CreateWindow (7) | #GP / fault | **→1, continues** |
| CreateDC (79) | fault | **→1** |
| MIPS | drop to 0 after crash | **steady ~45** |
| minidump / EXIT | yes | **no** |
| canvas nonblack | 0 | 0 (WGL still stub) |

## Boxeddrv WGL host (partial — ready, not yet exercised by game)

`boxeddrvCall()` in `glcommon.cpp` now implements:

| Index | Op | Host behavior |
|------:|----|---------------|
| 7 | CreateWindow | Ensure SDL/WebGL window (`boxeddrv: SDL window ready`) |
| 64 | wglCreateContext | `SDL_GL_CreateContext` (ES 3.0 on Emscripten) |
| 67 | wglMakeCurrent | `SDL_GL_MakeCurrent` |
| 72 | wglSwapBuffers | `SDL_GL_SwapWindow` |
| 70/71 | Choose/SetPixelFormat | return format 1 / TRUE |
| 45 | GetDeviceCaps | resolution/BPP/planes + safe defaults |

### Proof (`isaac-direct`, 180s)
- `loaddll`: **isaac-ng.exe** @ 0x400000, steam_api, **OPENGL32**, EOSSDK, OpenAL, Lua, libcurl
- `boxeddrv: SDL window ready` on CreateWindow
- **No page faults / no minidump**
- Steady ~42 MIPS for full 3 minutes
- **No WGL indices (63–72)** yet → game has not reached GLFW context create
- Canvas `nonblack=0`

### Progress past PE load (2026-08-02)

HANGCHK + PE RE isolated a **chain of stalls** after DLL load. Applied PE patches in `tools/isaac-ng.unpacked.exe` (also `isaac-small.zip`):

| Step | Symptom | Fix | Script |
|------|---------|-----|--------|
| 1 | Hang in `ole32!CoInitialize` (ret `0x93114c`) for minutes | Skip call → S_OK (`add esp,4; xor eax,eax; nop`) | `scripts/_patch_coinit_skip.py` |
| 2 | After SteamAPI_Init: hang in GLFW `LoadLibrary(dinput8.dll)` (ret `0xa80639`) | Skip load → NULL module (no DirectInput) | `scripts/_patch_dinput_skip.py` |
| 3 | Hang in GLFW keytable `MapVirtualKeyW` (ret `0xa80e5c`) | Stub `0xa80d30` → `Sleep` optional + `ret` | `scripts/_patch_glfw_keytable_skip.py` |
| 4 | **Current:** hang in `RegisterClassExW(L"GLFW3 Helper")` (ret `0xa813ab`) | Open — see below | |

**Proof after patches 1–3** (`hangchk` / `long-wgl`):
- `[ISAAC_STUB] SteamInternal_SteamAPI_Init OK (offline)` ✓
- `boxeddrv: SDL window ready` ✓
- Steady ~50 MIPS, explorer present
- **No** `CLASS_RegisterClass name=L"GLFW3 Helper"` for ≥4 min
- **No** WGL int98 64/67/72; canvas `nonblack=0`

### CreateDesktop error 0 — ROOT CAUSED (2026-08-02)

**Cause:** Wine **version mismatch** after partial FS patches. `boxedwine.zip` ships a newer Wine stack (user32 ~2.2MB, explorer 212KB, winex11 258KB, wineserver 694KB, ntdll 2.8MB). Experiments replaced only `user32`/`explorer`/`winex11` with **debian10 Wine 5.0** copies (1.2MB / 199KB / 155KB). Client `CreateDesktopW` then talked to a mismatched wineserver protocol → **NULL handle + GetLastError=0**.

**Fix applied:**
1. Restore matching stack from `boxedwine.zip.prepatch`: large `user32.dll.so`, `explorer.exe.so`, `winex11.drv.so`.
2. Strip conflicting Wine binaries from `debian10.zip` (`user32`, `explorer`, `winex11`, `ntdll`, `kernel32`, `wine`, `wine-preloader`, `wineserver`) so overlays cannot re-introduce the mismatch.
3. `WaitForInputIdle` on **large** user32 at `0x9c7b7` → instant `xor eax,eax; ret 8` (yields/timeouts under Boxedwine are unreliable).
4. PE: keep CoInit/dinput/keytable skips; **remove force-atom** (real RegisterClass works now).

**Proof (`desk-restore` / `desk-realrc`):**
```
CreateDesktop OK (no manage_desktop error 0)
WineAppBar atom=c013, Shell_TrayWnd atom=c014
boxeddrv: SDL window ready
int98 CreateWindow (index 7) + caps
winex11.drv loaded
```

### RegisterClass GLFW3 Helper — FIXED

**Proof (`direct-realrc`):**
```
[ISAAC_STUB] SteamInternal_SteamAPI_Init OK (offline)
CLASS_RegisterClass name=L"GLFW3 Helper" hinst=0x400000 ...
RegisterClassExW name=L"GLFW3 Helper" atom=c011 wndproc=0xa80a40 ... class=0x12e8dd8
```

Real atom **c011** (not forced 0xC001). `create_class` succeeds with matching Wine desktop objects.

### winex11 force-load + CreateWindow — FIXED (2026-08-02)

**Cause of nodrv:** Instant WFI races explorer before it sets `__wine_display_device_guid`, so `load_desktop_driver` returns NULL → `nodrv_CreateWindow`.

**Fix:** Binary-patch large `user32.dll.so` `load_desktop_driver` / `load_driver` fail paths to `LoadLibraryW(L"winex11.drv")` (stack-built UTF-16 name). Instant WFI kept at `0x9c7b7`.

**Also:** Main SDL window now created with `SDL_WINDOW_OPENGL` (`knativescreenSDL.cpp`) so `SDL_GL_CreateContext` can bind the canvas.

**Proof (`force-x11c` / `wgl-glwin`):**
```
Loaded L"C:\windows\system32\winex11.drv" at 0xc2e50000: builtin
boxeddrv: CreateDesktopWindow ok          (int98 index=6)
RegisterClassExW name=L"GLFW3 Helper" atom=c011
RegisterClassExW name=L"GLFW30" atom=c012
GetClassNameW 0x10030 …                   (real HWND created)
boxeddrv: GL context created id=4096
```
No more `nodrv_CreateWindow` / explorer-failed errors.

### WGL path — major progress (2026-08-02 evening)

**Fixed: `wglChoosePixelFormat` infinite loop**
- Guest opengl32 enumerated formats forever (`PFD_DRAW_TO_BITMAP mismatch` spam).
- Cause: `DescribePixelFormat` advertised unbounded formats / mismatched PFD flags.
- Fix: binary-patch `winex11.drv.so` Describe → only format 1 with flags `0x25` (WINDOW|OPENGL|DOUBLEBUFFER); Choose → always 1.
- Also stub `opengl32.dll.so` Choose/Describe/Set/GetPixelFormat (format 1 / filled PFD).
- **Critical:** strip `debian10.zip`’s `opengl32.dll.so` so it cannot overlay boxedwine’s patched copy.

**Fixed: host GL bind after CreateContext**
- `bindHostGlProcs()` after `SDL_GL_MakeCurrent` resolves all `pgl*` via `SDL_GL_GetProcAddress`.
- Proof: `boxeddrv: host GL bound pglGetString=0x1cef pglClear=0x1cb7 pglViewport=0x1d35`
- Main window has `SDL_WINDOW_OPENGL`; case 67 MakeCurrent forced TRUE on host.

**Fixed: GLFW past CreateContext / version string**
- `RegisterClass` GLFW3 Helper + GLFW30, real HWND `0x10030`
- `boxeddrv: GL context created id=4096` (int98 64)
- `glGetString(GL_VERSION)` stub returns desktop `"3.3.0"` (WebGL’s `"WebGL 2.0…"` fails GLFW `sscanf("%d.%d")`)
- MakeCurrent stubs return TRUE so GLFW no longer errors “Invalid window handle”

**Proof (`wgl-gpa-stub` / `wgl-glstr`):**
```
SteamInternal_SteamAPI_Init OK
winex11.drv loaded + CreateDesktopWindow ok
RegisterClass GLFW3 Helper atom=c011, GLFW30 atom=c012
host GL bound + GL context created id=4096
NO "version string retrieval is broken"
NO "Failed to make context current"
```

### WGL MakeCurrent TEB + SwapBuffers — FIXED (2026-08-02)

**Root cause of MakeCurrent FALSE:** opengl32 called `funcs->wgl` slot **+0x18** (DescribePixelFormat) instead of **+0x10** (MakeCurrent). With `drv_ctx=0x1000` as “format index”, Describe returned **0** → MakeCurrent failed. Patch: `ff 52 18` → `ff 52 10` (and release-current path).

**Proof (`wgl-vtfix` / `wgl-depthf` / `wgl-shader`):**
```
boxeddrv: GL context created id=4096
boxeddrv: wglMakeCurrent ok (forced TRUE)   # int98 67, TEB glTable live
wglGetProcAddress returning glGetStringi / glCreateShader / …
boxeddrv: wglSwapBuffers                    # int98 72
int99 gl: GetString, GetIntegerv, Clear, Enable, ClearDepth, Viewport, …
```

**Also fixed:**
| Issue | Fix |
|-------|-----|
| `glClearDepth` null on WebGL | Custom handler → `glClearDepthf` |
| Desktop GLSL ES precision | `glShaderSource` injects `precision mediump float` + `#version 300 es` |
| Shader compile error for KAGE_IndexedTextureShader | Gone after rewrite |

### Current blocker: crash after OpenAL / theoraplayer init

Past GL + audio + video library init the game still SEH-crashes:
```
[INFO] OpenAL Soft 1.1 … OK
[INFO] Theoraplayer Video Playback Library (2.0) …
[INFO] Caught exception, writing minidump...
page fault on read access to 00000000 at 0xA8C5C1
```
Also: `Renderbuffer ID: 14 size 8x-2147483648` (bogus height) — possible FBO path bug.

Canvas still `nonblack=0` (only one early SwapBuffers before crash; no menu draw).

### Paths forward
1. Diagnose null-deref at isaac `0xA8C5C1` (resource/save/FBO?).
2. Fix renderbuffer size / remaining GL desktop→ES gaps.
3. Prefer full `isaac.zip` assets if `isaac-small` is insufficient for menu.
4. Menu paint: repeated SwapBuffers + `nonblack>0`.

## EXIT codes (reference)

| Code | Meaning here |
|------|----------------|
| 53 / `0x35` | Packed DRM Steam fail (low byte) **or** deliberate exit |
| `-1073741515` / `0xC0000135` | True `STATUS_DLL_NOT_FOUND` |
| `-1073740972` / `0xC0000354` | Post-exception / minidump path after display/driver fault |

## Criterion 4 status

- WGL context + swap on WebGL canvas: **done**
- Intro paint on a 960x540 canvas: **done**
- Unchanged production intro and stable title/save path: **done**
- Character-select navigation/use through the browser input bridge: **done**
- Gameplay run initialization, visible Basement floor, and movement: **done**
- Served release proof: **done** (`phase5-iret-cache-release-floor2`)
- One-file standalone proof: **done** (`phase6-standalone-iret-floor1`)
- Final served acceptance: **done** (`phase6-final-standalone-uncached-default-o3-warm60-floor1`); 10.75268817204301 FPS median
- 60 FPS performance target: **unmet**
- Wasm-GC migration: **not applied**; it would not move linear-memory C++/guest RAM to GC types
- Private source repositories: **created privately**
- jsDelivr/CDN payload delivery: **unsuitable under default size, MIME, caching, and privacy constraints**
- Direct-file boot smoke: **done** (`phase6-final-standalone-file-smoke1`); served run remains the full visual/floor proof

## Evidence
- `int98-fixed.json` / `int98-fixed.log` — Int98 host fixed; full window/GDI path; no crash
- `scripts/build-steam-stub-pe.py` — cdecl SteamAPI stubs
- `third_party/Boxedwine/.../cpu.cpp` — CPUID 4+7
- `third_party/Boxedwine/.../normal_other.h` — `normal_int98`
- `third_party/Boxedwine/.../decoder.{h,cpp}` — Int98 opcode
- `tools/isaac-ng.unpacked.exe`

## Progress 2026-08-02 (session continue)

### Fixed
- **FBO clamp**: `8x-2147483648` now clamps **both** dims → `960x540` (was leaving width=8).
- **PE null-skip** at `0xA8C5A7` (prior) + **`0x7EA7CE`** (`test esi; je` before `[esi+0x38]`).
- **Shaders from disk**: extracted via official `ResourceExtractor`; `isaac-minui.zip` includes `resources/shaders/*` + main-menu UI loose files.
  - Shader init no longer logs "Failed to load vertex shader".
- **WebGL for-loop rewrite** in `glShaderSource` for Bloom/Hallucination (`for(i=` → `for(int i=`).
- **sfx.a** added to minui pack (avoids multi-minute failed loose-sample opens).

### Proven path (wgl-minui / minui2)
```
Steam offline OK → winex11 → GLFW → GL ctx → SwapBuffers
→ Lua scripts OK → load archives (~180s without large packs)
→ Shader Initialization (ColorOffset/HQ4X/… OK; Bloom/Hallucination were ES for-loop fails)
→ begin list mods → HQ4X size 480x270 → second SwapBuffers
```
No page fault after PE patches. Canvas still `nonblack=0` pending more frame swaps after SFX/menu load.

### Artifacts
| Zip | Purpose |
|-----|---------|
| `web/emu/isaac-minui.zip` | small + shaders + UI gfx + sfx.a + patched exe (~57MB) |
| `web/emu/isaac-menu.zip` | full packs (too slow to load in WASM, ~1.1GB) |
| `extracted_work/` | ResourceExtractor output (local) |

### Remaining for criterion 4
1. Repeated SwapBuffers / main menu pixels (`nonblack>0`)
2. Root-cause client rect 8×INT_MIN (GetClientRect) so clamp not required
3. Character select / floor (p4-floor)


## Present-path diagnosis (2026-08-02)

### Root cause of SwapBuffers stopping after HQ4X
1. **SFX sample load** blocks the main thread (RIFF parse / 1500+ opens) for minutes.
   - PE skip: `0x9ab970` bank load + `0xa2b5c2` per-sample open jump to fail epilogue.
2. After samples skipped: game reaches HQ4X then **C++ exception** (Lua stack trace + minidump) while parsing further assets (high MIPS, **zero int99 GL** after HQ4X).
3. Canvas stays black because **no guest draws** run after HQ4X before exception — not only a present-path issue.

### Present infrastructure added
- `boxeddrv_autoPresent()` from emscripten mainloop after guest swaps =2.
- Tracks guest FBO via `glBindFramebuffer`; blits complete FBOs only (save/restore bindings).
- Guest wglSwapBuffers also blits offscreen FBO before SDL_GL_SwapWindow.

### Still open for nonblack>0
- Survive/fix post-HQ4X exception so menu draw loop starts.
- GetClientRect still returns garbage (FBO clamp masks 8×INT_MIN).
- FBO often depth-only during setup — blit correctly skipped until color-complete.

## Progress 2026-08-02 (paint7–paint12)

### Present path FIXED
- Root cause of black canvas despite autoPresent: **WebGL forbids blit onto a multisampled default FB** (`GL_INVALID_OPERATION on multisampled framebuffer`). Canvas had `antialias:true` (samples=4).
- Fixes:
  1. `web/emu/index.html` patches `getContext` → `{ antialias: false }` before any GL context.
  2. `SDL_GL_MULTISAMPLEBUFFERS/SAMPLES=0` in boxeddrv + knativescreenSDL.
  3. Guest `glRenderbufferStorageMultisample` demoted to non-MS.
  4. `boxeddrv_blitGuestFboToDefault`: skip depth-only FBOs; correct sample query; MS resolve path; **direct blit ok=1 samples=0/0**.
- Proof: `boxeddrv: direct blit FBO 3 -> default ok=1 samples=0/0`.

### Post-HQ4X: no longer a silent hang
- paint6: font ASSERT `TeamMeatEx12.fnt` → page fault `6F5198` (null+0x38).
- paint7+: TeamMeatEx fonts + PE null-skip at `6F5198` → no ASSERT/fault.
- Long ~100 MIPS stretch after HQ4X was **PNG/ANM2 decode** (not infinite loop); 1300 achievement icons made it multi-minute.
- Stripped bulk `gfx/ui/achievement/*` icons; kept `Achievements.anm2` + Paper/frame/bgblack sheets.
- **Intro cutscene loads and advances** (paint12):
  ```
  playing cutscene 1 (Intro).
  Cutscene: correct anm2 timing: f0 -> f160 -> f289 -> f477 -> f1414
  ```
  Assets: `gfx/cutscenes/intro.anm2` + frames + PascalCase aliases (`MenuShadow`, `MenuOverlay`, `Intro6`).
- Guest **wglSwapBuffers count climbed to 11–16** (was stuck at 2).

### Window Width: 0 — FIXED → **nonblack>0 PROVED**
- Root cause: guest helpers at `0xa19340` / `0xa193c0` (window/framebuffer size getters used by resolution setup) returned **0** when GLFW path `[0xc73680]==0`, so resolution math produced `Window Width: 0`, garbage HQ4X sizes, empty textures.
- PE patch (in `tools/isaac-ng.unpacked.exe` + `isaac-nosfx.zip`):
  - `0xa19340` → `mov eax, 960; ret`
  - `0xa193c0` → `mov eax, 540; ret`
- Also: `preserveDrawingBuffer: true` on WebGL context so `readPixels` after swap works for probes.
- Proof (`wgl-paint15` / `wgl-paint16`, WAIT≥540s):
  ```
  Viewport: 960x540
  Framebuffer Width: 960  Render Width: 960  Window Width: 960
  Multiplier: 2.25  DP per point: 1.0  Point Scale: 2.0
  HQ4X size: 960x540
  playing cutscene 1 (Intro).
  Cutscene: correct anm2 timing: f551 → … → f3469
  sample t=540..600  nonblackSamples=4115  (stride 126 over a 960×540 canvas)
  ```
- Evidence is copied into `output/playwright/`; session-local originals may also exist under `%TEMP%`.

### Menu manager (partial)
- After full intro + skip keys (`wgl-menu1`):  
  `Music ID 63 out of bounds` → `Menu Manager Init` → `Menu Title Init` → `Menu Save Init` → `AnmCache: cannot remove reference to (null)` → caught C++ exception.
- Exact diagnostic capture (`phase4-fastintro-fault3`) identifies the invalid object and guest call chain:
  ```
  [ANMCACHE_PROBE] return=0040bd65 filename=069d5304
  data=00000000 size=3f800000 capacity=3f800000
  0040bd65 <- 009d8f8e <- 00987c7d <- 00959df9 <- 00954e71 <- 009ab6f7
  ```
- Static reconstruction: `0x987c78` calls GameMenu init `0x9d8ee0`; that calls the animation loader at `0x40bd50` with the inline animation object at `GameMenu+0x18`. The loader then calls AnmCache remove-reference `0x40e2b0`. Its apparent string header is impossible: null heap data with a heap-sized capacity and float `1.0` in both size fields.
- Lifecycle capture `phase4-fastintro-v2-edi-boundary1` proves the apparent header corruption is actually a wrong receiver:
  ```
  00987c03 (before call 009ef5c0): manager=068d770c global=068d770c
  00987c0e (after call 009ef5c0):  manager=068d78e8 global=068d770c
  delta = +0x1dc
  ```
  The fresh constructor at `0x986568` had correctly initialized `manager+0x30c` as an empty MSVC small string (`data=0 size=0 capacity=0x0f`). `0x9ef5c0` violated the caller's EDI-preservation assumption, so the next `lea ecx,[edi+0x2f4]` selected an unrelated float-bearing object.
- Minimal candidate repair (`scripts/patch-phase4-edi-restore.py`): redirect only the call at `0x987c09` through `push edi; call 0x9ef5c0; pop edi; ret` in audited INT3 padding at `0x9afd89`.
- Proof `phase4-edi-fix1`: before and after the wrapped call, `manager=global=068d770c`; the valid animation header remains `data=0 size=0 capacity=0x0f`. No AnmCache warning, caught exception, or page fault occurs through `t=720`; `Menu Character Init` is reached.
- Empty intro stub caused earlier faults; full intro restored.
- `isaac-nosfx-fastintro.zip` changes only both duplicate intro `FrameNum` values from `4522` to `60`; it is diagnostic-only. Production `isaac-nosfx.zip` remains unchanged.
- `isaac-nosfx-fastintro-v2.zip` is the repeatable diagnostic successor: it preserves all 17 animation tracks and each track's first real frame, while collapsing the timeline to two frames. It reached the same baseline crash and exact EDI signature, so it is suitable for faster A/B probes.
- Free-helper `jle` experiment caused worse null writes — **reverted**.

### Stable title / character initialization

- Candidate PE SHA-256: `37CA11FEC3FA4AA4116847541217BB2BEA1B17195A3DB69964D5D4937365E6D6`.
- `phase4-edi-fix1` survives the old post-Save failure boundary for four additional guest minutes and initializes all main-menu screens, including `Menu Game Init` and `Menu Character Init`.
- `scripts/phase4_assets.py` adds only the proven-missing Gaper ANM2 and its two referenced PNGs, with copies under both `gfx/` and `resources/gfx/`. `phase4-floor3.partial.log` no longer records the Gaper open failure.
- The current Phase 4 archive also installs the dedicated ISteamApps offline object. Its subscribed-app and DLC-installed methods return true, replacing the earlier `AFTERBIRTH_DLC_NOT_INSTALLED` diagnostic path with the real title path.
- At that historical checkpoint, `phase4-safeintro-dlc6` was the strongest saved title proof but did not prove character-select navigation or a floor. The final Phase 5 and Phase 6 probes now prove both.

### Current input and framebuffer boundary

- `web/emu/index.html` forwards focused canvas keys to the exported `boxedwine_inject_key`; `knativeinputSDL.cpp` routes SDL scancodes through the existing X11 path.
- The present bridge keeps the active draw FBO separate from the last presentable non-default FBO, restores framebuffer zero correctly, and flips the blit destination vertically for browser orientation.
- Served/embedded proof-build SHA-256: JS `61995FEEB90C37A85B381D7E9D492F3FD492D055A361F69D62A1C55D2920D634`; WASM `B42E588B382EEF59128A2443A8C3D7B2AA2D4DC4BB96B46C2B413B31110EB954`.
- `phase5-iret-cache-release-floor2` supersedes the earlier diagnostic boundary: it saves every navigation stage, acknowledges browser-key delivery, initializes the run, renders the floor, and records movement. `phase6-standalone-iret-floor1` independently repeats this from the one-file artifact.
- Accepted runtime SHA-256: JS `31BA195E955CDB552946B6C216EA4DCE2810E6B8BB1A441F975737A602FB4703`; WASM `61AA1E74994EE00BD762544B79B802C6C871E111144AFE4F2DD39E0925A3FB9D`; index `8C7942255C8BD467BB0E1272F724E3B976A614B89F404BC36D900F3284F6CA25`. The old safe cache is `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379`, but it is embedded/opt-in only because it froze at swap #2 after relink.
- Final acceptance JSON SHA-256: `ABCEF0BE0BE4CAA3F28708895D3263D9F66E56622C66F8CC1F1A8CC66007CFFC`.

### Music-call no-op experiment (reverted)

- Snapshot `tools/isaac-ng.unpacked.exe.pre-menu8` replaced VAs `0x7E1D50` and `0x7E1E70` with `xor eax; ret 8`.
- `wgl-menu9`, `wgl-menu10`, and `wgl-menu12` reached `t=730`, `nonblackSamples=4115`, and 16 swaps without Music ID assertions or faults, but never logged any `Menu * Init` milestone. Screenshots remained in the intro sequence.
- Verdict: inconclusive for the post-save crash. Current executable and `isaac-nosfx.zip` restored original prologues `55 8B EC 51 53`; music stubs are not deployed.
- Current executable SHA-256: `5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200`.
- Current `isaac-nosfx.zip` SHA-256: `1EC35FABB49F0E60DA18D12A1685167EF30E940A1085C0B652FEBB87636A84DB`.

### Next steps (priority)
1. Regenerate and revalidate the safe cache before enabling it by default.
2. Continue optimization toward the unmet 60 FPS target without treating Wasm-GC as a linear-memory optimization.
3. Keep the private source repositories synchronized while excluding proprietary archives and generated standalone output.
4. Use a delivery path compatible with private/proprietary large files; default jsDelivr GitHub delivery is unsuitable.
5. Keep the 35/35 test suite, served floor proof, and direct-file boot smoke green.

### Artifacts
| Item | Role |
|------|------|
| `web/emu/isaac-nosfx.zip` (~148MB) | Lean: packs + shaders + fonts + main-menu/stage UI + intro + Achievements.anm2; no sfx/music/afterbirth bulk |
| `web/emu/isaac-nosfx-phase4.zip` | Full-intro EDI repair + SteamApps stub + three minimal floor assets |
| `web/emu/isaac-nosfx-phase4-safeintro.zip` | Local two-frame intro variant for accelerated evidence runs |
| `web/emu/isaac-phase5-playable.zip` | Served production-intro release archive |
| `web/emu/isaac-phase5-playable-jit-modules.zip` | Release replay JIT cache |
| `web/emu/isaac-phase6-full.zip` | Full local archive embedded into the standalone |
| `output/isaac-repentance-standalone.html` | Final artifact: 1,052,643,363 bytes, SHA-256 `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764`; proprietary and ignored |
| `web/emu/index.html` | Canvas configuration plus focused-key SDL-scancode input bridge |
| `glcommon.cpp` | resolve blit, viewport clamp, autoPresent |
| `glfunctions_ext2.cpp` | MS renderbuffer demote + size clamp |
| `tools/isaac-ng.unpacked.exe` | PE skips: coinit, dinput, keytable, a8c5c1, 7ea7ce, sfx, 6F5198 |
