# Phase 4 evidence manifest

All proprietary inputs and derived archives remain local to the user's machine.
The runtime stays on Path B: the original PE32 binary under Wine inside
Boxedwine/WASM.

## Current result

| Gate | Evidence-backed status |
|---|---|
| EDI / AnmCache failure | Root-caused and repaired with an eight-byte ABI wrapper |
| Final save-menu failure | Fixed in BoxedWine: IRET now terminates its JIT block |
| Stable title | Proven after the unchanged production intro |
| Character select usable | Proven by visible screenshot and acknowledged input transition |
| Basic floor | Proven by seed/player/level/room logs and visible floor screenshot |
| Movement | Proven by acknowledged W input and distinct `floor-moved` screenshot |
| Standalone one-file acceptance | Proven by `phase6-standalone-iret-floor1` |
| Tests | 35/35 passing (`npm test`) |
| Historical performance | 8.93 FPS served / 8.547 FPS standalone median |
| Final served acceptance | Proven by `phase6-final-standalone-uncached-default-o3-warm60-floor1` |
| Final measured cadence | 10.75268817204301 FPS median; 93 ms median, 124 ms p95, 140 ms p99, 144 ms max across 125 samples |
| 60 FPS target | Unmet |

Authoritative probe: `output/playwright/phase5-iret-cache-release-floor2`.
Its JSON reports all seven stage screenshots, `runStarted=true`,
`floorReady=true`, `gameplayInputProved=true`, and `err=[]`.

Independent packaging proof: `output/playwright/phase6-standalone-iret-floor1`.
It repeats the seven-stage path from the single generated HTML file with the same
three success booleans, acknowledged navigation and gameplay input, `err=[]`, and
an empty crash list. The standalone contains all runtime dependencies and is not
a thin launcher.

Final served acceptance:
`output/playwright/phase6-final-standalone-uncached-default-o3-warm60-floor1`.
Its JSON records `runStarted=true`, `floorReady=true`,
`gameplayInputProved=true`, all seven stages
(`menus-loaded,title,save,main-menu,character,floor,floor-moved`), and zero
errors. JSON SHA-256:
`ABCEF0BE0BE4CAA3F28708895D3263D9F66E56622C66F8CC1F1A8CC66007CFFC`.

Final stage-image SHA-256 anchors:

- title: `0536A6D3C950D7A55F29ABEEF9BB93A5AA8D7852F1146EB11A34EECF2A9C55D3`
- save: `F3395F6AB7C208EA2A6809665C62530D30DD0A3A491920FD40574337BED45DA9`
- main menu: `D88409ECA62A7E1CAEA11306A37A9E45436BD6937B45C02367CD0CB670EFAD31`
- character: `5896C717713061D756A4D7453B54A0E87822C85FD37EB3C15942B3790ABC7E50`
- floor: `03361275970DF40973E651AE6FE7DBE3059C67BDEEA11D2AE5EA001ACB383251`
- moved floor: `1DFF4BD9425990C639771F33B46DFC4145A890337E405B8AA2878A8CC5B5978C`

## Final Menu Save root cause and fix

The apparent AnmCache/logger mutex hang was secondary. A `+seh` trace showed
Wine handling the `OutputDebugStringA` event for `Reading chunk 3`, executing
`IRET` at `0x7bcb2960`, then incorrectly running `0x7bcb2961`. At that point
`ECX` was the restored exception code `0x40010006`, not a context pointer, so
the next load faulted. Isaac's top-level filter entered its crash reporter,
which recursively called the non-reentrant logger and slept forever.

The minimal emulator fix is in
`third_party/Boxedwine/source/emulation/cpu/jit/jitOther.h`: both IRET helpers
call `blockExit()` immediately after interpreter emulation. No game mutex or
save-selection bypass is shipped.

Evidence anchors:

- JSON: `A85BD173B96B93DB6D755CBE75BC1DD6EDAB2918C178EE2B838CAD23423E45FB`
- floor PNG: `D2E22BFD5FD473F9920142A1755088C401C6870D3DB620ECD3323BE25AA52041`
- moved PNG: `AEF69E8D5577B9D0870EDAEDBEBA0E4C511BFDE1DB18B634389C75D4F3E8DDA0`
- proof-build JS: `61995FEEB90C37A85B381D7E9D492F3FD492D055A361F69D62A1C55D2920D634`
- release WASM: `B42E588B382EEF59128A2443A8C3D7B2AA2D4DC4BB96B46C2B413B31110EB954`
- proof-build index: `974481D3FF209975727DD2FB7AD8C081B8539AD2D9C6D4B5D6CE2FE112F4019D`
- playable JIT cache: `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379`

Standalone evidence anchors:

- JSON: `463E19B88AFDF541CB518FE1616DB6B4E6312B2FA5C2088E5217414FA2F0A911`
- floor PNG: `15F71DADE30E03FBAA8B40133296B0A03BD11BD7EA766B9308051FC81A28282C`
- moved PNG: `F9D18606ACA65A5A69E16755F4D4578C73B956E2B7C38FCB2A93B7C34D8DAE6F`
- historical accepted standalone HTML: `3DB9BF34B4C5C119C63D1F7DFB079E2020440146770A009F2133910EA0C88C87`
- final standalone HTML: `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764` (1,052,643,363 bytes)

## Current local artifacts

| Artifact | SHA-256 | Role |
|---|---|---|
| `tools/isaac-ng.unpacked.exe` | `5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200` | Lean baseline PE |
| `tools/isaac-ng.unpacked.phase4.exe` | `37CA11FEC3FA4AA4116847541217BB2BEA1B17195A3DB69964D5D4937365E6D6` | EDI-preservation PE |
| `native/steam_stub/steam_api.dll` | `24C4A142B1DAE3C386C1BAD21431CE4FBD1C97F2AF01EFA745540FFEDE8D6CBF` | Offline Steam stub with dedicated ISteamApps behavior |
| `web/emu/isaac-nosfx.zip` | `1EC35FABB49F0E60DA18D12A1685167EF30E940A1085C0B652FEBB87636A84DB` | Immutable lean baseline archive |
| `web/emu/isaac-nosfx-phase4.zip` | `2202ABEF619D622AE7EEAB7176B09D6B7E7A972060C3A40F5AEF4B133B1A316D` | Full-intro Phase 4 candidate |
| `web/emu/isaac-nosfx-phase4-safeintro.zip` | `CA5B33202B16506F6ADB434801F342CF94D336B237852E95A7C60CF717E251B9` | Local accelerated evidence/runtime candidate |
| `web/emu/boxedwine.js` | `31BA195E955CDB552946B6C216EA4DCE2810E6B8BB1A441F975737A602FB4703` | Accepted served runtime glue |
| `web/emu/boxedwine.wasm` | `61AA1E74994EE00BD762544B79B802C6C871E111144AFE4F2DD39E0925A3FB9D` | Accepted served runtime |
| `web/emu/index.html` | `8C7942255C8BD467BB0E1272F724E3B976A614B89F404BC36D900F3284F6CA25` | Accepted served page |
| `web/emu/isaac-phase5-playable.zip` | `CBB4AB286FB9CFAB36929357842AEF6C02A1A5FD168B52631208ED7D347D6AE5` | Served production-intro release archive |
| `web/emu/isaac-phase5-playable-jit-modules.zip` | `278D3304C955912BEF9A5C2B45A49210C16BF7AE93135E1C6511FA8FB2E2D379` | Old safe cache; embedded/opt-in only until regenerated |
| `web/emu/isaac-phase6-full.zip` | `CFE569DF184C482C4854C65F82427E95B960D170EA15B5C56CEEBFA795DC4566` | Full standalone game archive input |
| `output/isaac-repentance-standalone.html` | `7F381319A767673C01A2219410B48B762AD0F4FA60B22C2CC88E1909CE768764` | Final artifact; 1,052,643,363 bytes |

## EDI root cause and minimal repair

Baseline evidence: `output/playwright/phase4-fastintro-fault3.{log,json,png}`.

```text
Menu Manager Init
Menu Title Init
Menu Save Init
[ANMCACHE_PROBE] return=0040bd65 filename=069d5304
data=00000000 size=3f800000 capacity=3f800000
0040bd65 <- 009d8f8e <- 00987c7d <- 00959df9 <- 00954e71 <- 009ab6f7
AnmCache: cannot remove reference to (null)
Caught exception
```

Boundary evidence:
`output/playwright/phase4-fastintro-v2-edi-boundary1.{log,json,png}`.

```text
0098656d constructor exit: filename data=0 size=0 capacity=0x0f
00987c03 before 009ef5c0: manager=068d770c global=068d770c
00987c0e after  009ef5c0: manager=068d78e8 global=068d770c
```

The `+0x1dc` delta selected an unrelated float-bearing receiver. The animation
object was valid; `0x9ef5c0` violated the caller's EDI-preservation assumption.

`scripts/patch-phase4-edi-restore.py` redirects only the call at `0x987c09` to
audited executable padding at `0x9afd89`:

```asm
push edi
call 0x9ef5c0
pop edi
ret
```

Repair evidence: `output/playwright/phase4-edi-fix1.{log,json}` plus its stage
PNGs. The manager remains equal to the global pointer, the valid small-string
header survives, the old AnmCache warning disappears, and the runtime reaches
`Menu Game Init` and `Menu Character Init` without a caught exception or page
fault through `t=720`.

## Runtime layers after the EDI repair

### Offline SteamApps behavior

`scripts/build-steam-stub-pe.py` now selects a dedicated interface object when
the requested interface starts with `STEAMAPPS`. Its relevant ISteamApps slots
return English language strings and report subscribed apps / installed DLC as
available. `scripts/make-phase4-runtime.py` installs this DLL into the Phase 4
archives.

The earlier diagnostic frame
`output/playwright/phase4-navprobe2-menus-loaded-flipy.png` visibly reported
`AFTERBIRTH_DLC_NOT_INSTALLED`. The later local runtime evidence
`phase4-safeintro-dlc6` has the current stub, reaches the complete menu initializer
set, and captures the real title frame instead of that diagnostic prompt.

### Minimal floor aliases

`scripts/phase4_assets.py` adds only the three files first proven missing after
the EDI repair:

| Local asset | SHA-256 |
|---|---|
| `010.000_Frowning Gaper.anm2` | `18F1029F102ADD01B756E8ADB8FE44368D3298DF343913FF6023CC158082BF81` |
| `Monsters/Classic/Monster_000_Bodies01.png` | `22F92247267281CE8761D472A27C64CAF078513A685438C25A8F91CAEFF47BCF` |
| `Monsters/Classic/Monster_024_FrowningGaper.png` | `A6E1C71C9064D373B2ED1C90BC3753934DEC446A67D9546024F02E83234AE7DE` |

Each file is written under both `gfx/` and `resources/gfx/` to preserve the
established Boxedwine case/path aliases. `phase4-floor3.partial.log` no longer
contains the earlier Gaper open failure. This proves the minimal data fix, not a
floor entry.

### Full-intro versus safeintro

`isaac-nosfx-phase4.zip` keeps the production 4,522-frame intro. The local
`isaac-nosfx-phase4-safeintro.zip` has the same entry set and differs in exactly
two files: `gfx/cutscenes/intro.anm2` and its `resources/gfx/` alias. Each Scene
timeline is collapsed to two frames while retaining every animation track and
the first real frame from each track. It is a local acceleration aid, not proof
by itself that the unchanged production-intro path passes. The later
`phase5-iret-cache-release-floor2` proof supplies that production-intro result.

### Browser input bridge

`web/emu/index.html` maps focused canvas keys to SDL scancodes and calls the
exported `boxedwine_inject_key`. The export in
`platform/sdl/knativeinputSDL.cpp` reuses Boxedwine's SDL-scancode-to-X11 path;
`XServer::key` walks from the focused window toward its parents to find a guest
event target.

The final served and standalone proofs acknowledge every Enter transition through
character select, then acknowledge D/S/A/W gameplay input. Their JSON records
`navigationConfirmation="browser-key-bridge"`, `navigationStage="floor"`, and
`gameplayInputProved=true`; the floor and moved-floor images are distinct. Input
delivery is therefore proven end to end without relying on the temporary
`X11_KEY_PROBE` diagnostic.

### Framebuffer selection and orientation

The current GL bridge tracks the active draw FBO separately from the last valid
non-default present FBO. Binding framebuffer zero restores the default draw
target without discarding the last presentable color buffer. The present blit
also reverses the destination Y coordinates, matching the browser canvas
orientation. `phase4-navprobe2-menus-loaded-flipy.png` is the saved visual proof
for the required vertical correction.

These changes are included in the release hashes above. Both authoritative probes
save nonblack title, save, main-menu, character, floor, and moved-floor images;
the earlier post-navigation black-frame diagnostic is superseded.

## Evidence paths

- Root cause: `output/playwright/phase4-fastintro-fault3.*`
- EDI boundary: `output/playwright/phase4-fastintro-v2-edi-boundary1.*`
- Repair survival: `output/playwright/phase4-edi-fix1.*`
- Minimal aliases: `output/playwright/phase4-floor3.partial.log`
- SteamApps/title candidate: `output/playwright/phase4-safeintro-dlc6.*`
- Served release proof: `output/playwright/phase5-iret-cache-release-floor2.*`
- Standalone proof: `output/playwright/phase6-standalone-iret-floor1.*`
- One-file artifact: `output/isaac-repentance-standalone.html`
- Final served acceptance: `output/playwright/phase6-final-standalone-uncached-default-o3-warm60-floor1.*`
- Direct-file boot smoke: `output/playwright/phase6-final-standalone-file-smoke1.*`

## Completion boundary and remaining work

Phase 4 functional proof is complete from the historical served and standalone
runs and the final served acceptance. The 8.93 FPS served and 8.547 FPS
standalone figures belong to historical proofs. The accepted final runtime
measures 10.75268817204301 FPS median across 125 samples; 60 FPS remains unmet.

The accepted default is `jit-cache=false`. The old safe-cache archive froze at
swap #2 after the runtime relink, so it remains embedded and opt-in only until it
is regenerated. Served acceptance is authoritative.

Direct-file boot smoke also passes: `phase6-final-standalone-file-smoke1`
navigates `file:///.../isaac-repentance-standalone.html`, records one swap at
120 seconds, logs `Binding of Isaac Repentance+ v1.9.7.17.J460`, and has
`err=[]`. JSON SHA-256 is
`7CB658F2F1056EB598619F95F5A0DB5AC01C49D0CF6A670C6B4851185BB0D1CB`;
the expected black early-boot screenshot is
`7A5175F59992A07616D58B06A310B2A3909C43DF6D406A736EF54995563A09ED`.
This is boot smoke only; the served run is the full visual/floor proof.

Wasm-GC was not applied: it affects code authored for GC reference types, whereas
BoxedWine/Emscripten C++ state and emulated guest RAM use WebAssembly linear
memory ([Wasm-GC overview](https://github.com/WebAssembly/gc/blob/main/proposals/gc/Overview.md)).
jsDelivr's default GitHub path rejects packages over 150 MB and individual files
over 20 MB, serves HTML as `text/plain`, and uses immutable public CDN caching,
which conflicts with this proprietary/private payload
([jsDelivr restrictions](https://github.com/jsdelivr/jsdelivr#restrictions),
[data API restrictions](https://github.com/jsdelivr/data.jsdelivr.com#restrictions)).
GitHub's normal repository path also blocks files over 100 MiB
([GitHub large-file limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)).
Private source repositories now exist at
[the-browsing-of-isaac](https://github.com/doej13367/the-browsing-of-isaac) and
the [BoxedWine fork](https://github.com/doej13367/the-browsing-of-isaac-boxedwine)
on branch `isaac-browser`; both were created privately.
Proprietary archives and standalone output stay local/ignored. The current test
suite passes 35/35.
