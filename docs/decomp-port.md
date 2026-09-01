# Native WebAssembly port track

The `codex/decomp` branch replaces the long-term x86-emulation bottleneck with a
measured static-port workflow. This is not a claim that decompiler output can be
compiled unchanged: recovered C still needs types, object layouts, platform
boundaries, and behavioral tests before it becomes trustworthy source.

## CURRENT STATE — do not read this file for the live numbers

This file is a **chronological log** (newest entries near the top). Every
"live numbers" block in it — including the 2026-08-20 one preserved below —
goes stale within days and has repeatedly cost units that trusted it. The live
state is derived from the tree:

```
node scripts/decomp/status.mjs     # families, open boundaries, verification
```

and the current hand-off pointer lives in `decomp/frontier.json`. Censuses go
through `python scripts/decomp/tools/pequery.py` (prebuilt PE index).

Historical snapshot (2026-08-20, STALE — kept for the removal trail):
Next VA (idx 4 `opaqueCall008318a0` leftovers): **0x0082eb90**. ABI 99, boundaries **31** (events **1056** @v128; runtime **15504**: v126 armed carrier @996; v127 F3 shop-restock set+pack; v128 sfxUpd set+scalars). idx 4 STAYS; idx 23 REMOVED at v115; idx 24 + idx 33 REMOVED at v119; idx 41 REMOVED at v120; idx 47 REMOVED at v121; idx 19 REMOVED at v122; idx 38 law pack v123 (STAYS); idx 46 REMOVED at v124; idx 25 REMOVED at v125; idx 40 REMOVED at v126.


| | value |
|---|---|
| harness + perf round 2 (2026-08-31) | **Token-lean unit harness + the two remaining hot spots.** (1) **Family-suite wasm build cache** (`tests/wasm-build-cache.mjs` + an 18-file mechanical wrap of every suite's `buildWasm`): clang+em++ spawns keyed by sha256(cpp+header+EXPORTS+tag); mutants hash differently so mutation checks still really build, restores hit the cache. Measured: room suite **8m46s cold → 11.2s warm (47×)**; FULL `npm test` **~37 min → 1m17s fully warm (3888/3888)**; `ISAAC_WASM_BUILD_CACHE=0` opts out; cache under `output/decomp/wasm-build-cache/`. (2) **Fused runtime writer** `writeRuntimeInputsForLayout` (game-update-model.mjs): the live tick no longer materializes the 4208-key normalized object per write — same precedence chain (menu-aux lanes always win incl. isnil=1 defaults, timer lanes win only in array form, caller keys, door-slot flatten, packed zero) resolved per lane tag into the SAME `writeField`; byte-equivalence vs normalize+writeStruct pinned over 8 adversarial input shapes (flat-key-vs-lane precedence both directions, string anm2 names, undefined/null, randomized key subsets) in tests/decomp-frame-path-fastpath.test.js; all 6 frame-path call sites swapped. Measured: node session tick fast **5.6 → 0.76 ms** (lockstep 7.0 → 2.5), live browser Update tick **4.9 → 2.25 ms** — cumulative from the session start **18.1 → 2.25 ms (8×)**, render 0.89 ms, ~5× headroom under the 16.7 ms budget. 120-tick lockstep-vs-fast differential still 0 mismatches, hostTotals identical; frame-path/bridge/state-patch suites 82/82. (3) **Agent workflow harness**: `scripts/decomp/brief.mjs <VA\|idx>` — one-call unit orientation (boundary status from the slice JSON + function shape from the PE index via node:sqlite + next commands); `pequery.py batch "q ;; q ;; ..."` — N censuses in one process/tool call; `scripts/decomp/verify-unit.mjs` (npm run decomp:gate) — the whole AGENTS.md verification block in one call with one PASS/FAIL line per gate, first-failure excerpts only, and the emsdk env set up internally (the measured 82-phantom-failure class); `.claude/agents/decomp-scout.md` (read-only evidence gatherer, fixed ≤60-line report) + `.claude/agents/decomp-unit.md` (full unit executor with compressed runbook contract, fixed hand-off format). Runbook/AGENTS.md updated to route through these. Gate run post-change: slice+pipeline 857/857, differential 5387 pass, safety pass, diff clean. |
| tooling + fast path (2026-08-31) | **Session-orientation toolkit + shipped-tick fast driver.** (1) `scripts/decomp/status.mjs` derives the live state from the tree (family ABI greps + slice JSON + frontier.json + build artifacts) — doc checkpoint narratives are no longer the orientation path; `decomp/frontier.json` is the hand-off pointer every unit updates. (2) `scripts/decomp/tools/` PE toolkit: `build-pe-index.py` one-time full linear decode (capstone skipdata resync; 763 dword jump tables byte-scanned, validated ≥2 targets, masked + recorded as `jtab` xrefs; 2,082,541 insns, 373 resync bytes; decode config `linear+skipdata+jtab-mask v1`) into SQLite (88 MB, ~50 s) with mem_r/mem_w/mem_rw(+_idx scaled-index) absolute-displacement xrefs via capstone access bits, rel32 call/jmp/jcc edges, `call [slot]` build-time resolution (257), IAT import map (622), int3+call-target function segmentation (19,038 starts), .rdata/.data strings; `pequery.py` census CLI (writers/readers/xrefs-to/callers/callees/body/disasm/sig/addr/strings/imports/meta) + `verify` replaying AGENTS.md ground truths — 0xc7169c writers {0x009aaab0, 0x009ab8cc} exact, 0x40c7f0 73 direct callers exact, 0x74d4a0 1+0 exact, 0xc79100/0xc7b640 zero-writer confirmed, 0x8068f0 = 225-insn body / 1 direct caller (byte-scan-confirmed; the old "19 callsites" note was body-internal callsites). Census scripts are now BANNED in favor of pequery (AGENTS.md session-start block; AGENTS.md slimmed 42→15 KB with v65–v82 narratives archived verbatim to docs/decomp-history.md). (3) **Fast driver `runNativeGameUpdateTickWasmOnly`** (frame-path.mjs): the shipped browser tick no longer steps the JS oracle in lockstep every rAF — measured 15.9 ms/tick session cost in-browser (26 ms node) with the wasm step at ~1 µs; the fast driver replicates the lockstep continuation chain reading `continuationKind` from the wasm events struct, same recapture seams (drainPatches/recaptureAfter before each resume), same one-path F4 post-Pass-A recount ladder. `lockstep = true` stays the default for every API (tests/legacy callers unchanged); the browser bridge opts into fast with `?lockstep=1` as the debug escape hatch. Hot-path model fixes with identical semantics: layout-entries WeakMap cache in read/writeStruct (was re-materializing 4208 `Object.entries` pairs per struct op), frozen zero-template for `normalizeRuntimeInputsForLayout` (was rebuilding + ~6× copying a 4208-key object per tick, ~10 ms), in-place menu-aux/timer lane assigners (delegating copying wrappers keep the exported helpers' contracts). Equivalence pinned by tests/decomp-frame-path-fastpath.test.js: 120 patched/runtime-varied ticks, byte-identical state/events/continuations/hostTotals lockstep-vs-fast; mutant (readKind→-999, kills all resumes) FAILS the differential and was restored (recapture seam not exercised by this corpus — bridge B8 is the only live recaptureAfter consumer, noted honestly). Measured in the live page: Update tick **18.1 → 4.9 ms** (render 0.74 ms; 60 fps budget 16.7 ms now has headroom; pre-fix the Update tick alone busted it at ~55 tps ceiling). Slice+pipeline suites 857/857 green post-edit. (4) **Room family suite repaired 82 fail → 155/155 green** — the failures predate this unit (left by the died-mid-landing v88/v89 units): 72 were hardcoded `assert.equal(abi(), 87)`-style pins that every past ABI bump hand-sedded to the then-current number and the v88 bump missed (stale "wasm ABI 75"/"(74)" message strings prove the sed history); ALL numeric abi() pins are now `ROOM_PURE_ABI_VERSION` (112 sites). The remaining 3 exposed a REAL defect-class-9 bug in the landed v89 deco lane: `isaac_room_deco_render_target` inverted the `0x99ab0c comiss/jbe` gate (`if (!(probe <= 0.0f)) return` — skips on ordered `probe > 0`, the exact opposite of the machine). Re-confirmed from the instruction stream via `pequery.py disasm 0x99ab00` (comiss xmm0,xmm1 / jbe 0x99ab83 = skip on <=0-or-NaN, setter 0x7b9940 @0x99ab1d on the fall-through) and against the independent JS oracle `roomDecoRenderTarget` (which was correct); fixed to `if (!(probe > 0.0f)) return` (NaN still skips, matching unordered jbe). v89 fixed-edge + LCG-differential + mutation-check tests all green after the one-line fix. Also: `.git/index.lock` was stale since 2026-08-21 (zero git processes) — git was silently unusable for 10 days, which is why the whole port tree sat uncommitted; removed. (5) **Bridge capture packs implemented for the specced-but-never-landed §W31/v139 seams** — tests/decomp-frame-input-bridge.test.js carried complete specs (torn-read/over-cap/arm matrices) for four producers that did not exist; the suite was 9-red. Landed in web/js/native-update-bridge.js following the captureUpdateB8/TailPath house pattern (all-or-nothing groups, READ-ONLY guest sampling, absence = byte-for-byte monolith): `captureUpdateGreedProbe` (player-vector walk [gp+0x1baa8]/[+0x1baac], cap 8, per-row f2c/f3bc/161c/parent-1e68/20a9-low-byte, parent_161c read ONLY under a live parent ptr, parent_is_self pointer equality), `captureUpdateB16Blob` (MSVC action-map presence walk from [Game+0x1bbd8] for keys {0x38,0x39,0x40,0x46} — node _Left+0/_Parent+4/_Right+8/_Isnil+0xd/key+0x10; gate39 = mode!=0x2c && SIGNED-odd stage <8 && diff 0; 0x46 REPLACES maskB with 0x7f per cmovne 0x6f96ec; Room src vector +0x1b10..+0x1b1c,+0x1b24,+0x1b28 skipping +0x1b20; desc +0x44/+0x54; reused echoes ambientRoom1d18/b3b7WidthC/b3b7Height10 in the same group), `captureUpdateB16SpawnRows` (+ exported UPDATE_CAPTURE_B16_SPAWN_ROOM_OFFSETS; interior type-7 enumeration outer-x/inner-y, gated on roomB16NeedsType7Grid/NeedsLavaBandGrid module truth with lavaPost derived via the 0x3f6b851f decay; both-closed = zero pack with NO grid scan; cap 64), `captureUpdateB1RainRows` (v139 idx13/idx35: desc [+0x58] seed chain, TWO xorshift steps per row, corner pick/world-xy via the landed roomB1 laws, count = unsigned min(4/6/8 seam base, decor 0x78-stride count), zero-seed fatal → EMPTY patch, host-domain outcome lanes explicit 0), all wired into `captureUpdateLanes` (new b16ArmState/b1RainOwnerState params; per-pack group independence pinned by the lanes tests). Bridge suite 21/21; gate39 parity mutant killed (2 tests) and restored green. Frame-input-bridge VK pin updated for the landed movement keys (KeyW → 0x57; KeyQ pins the still-unmapped arm). web/js/app.js in-run sprite resolver now resolves each path segment case-insensitively against MEMFS (mount preserves the archive's inconsistent casing — gfx/Monsters vs gfx/effects; uploads went 2→8); web/game + web/proto harnesses fetch the served `/@decomp/wasm/game-update-slice.wasm` instead of requiring binary copies in web/ (which tripped check-repo-safety); repo-root scratch (200+ files) atticked to `.scratch/attic-20260831/` with .gitignore blocks so future sessions cannot litter the root; root `section-notes/`+`cpu-dump/` merged into canonical `output/decomp/5129df723e64/`. |
| Update slice | **ABI 99** — state 524 / constants 32 / runtime **15504** / events **1056** / boundaries **31** |
| Opaque boundaries | **31** — **v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45) REMOVED record idx 45 `playerManagerUpdateHeartbeatSfxUpdate` (count 32→31; 18th removal since v79)**: under the `sfxUpdReady` voucher the whole update lane (predicate 0x0092e560 + volume 0x0092df40 + pitch 0x0092e050) runs IN-MODULE via `gameUpdateSliceSfxUpdFrame` — gates BY REFERENCE pmSfxEntryGate; pending-clears land as `sfxUpdPendingMask` bits; busy short-circuit publishes walkCount/busyApplied; volume eff = minss(max-with-0 * argVol * master) minss-second-on-NaN; pitch raw bit-copy; S1 vol-mem bits; device vtbl +0x38/+0x48/+0x58 = standing audio-backend platform leaves behind sfxVolSetVoice/sfxDevVolumeCalls/sfxPitchSetVoice/sfxDevPitchCalls; G3 NO_SAMPLES warn twin typed (@604 precedent). NEW runtime scalars @15484..15504 + events @1020..1056; ready=0 keeps monolith byte-for-byte: coarse @328 fires ONLY on capture absence. Model+cpp rewired identically (combinator 0x92e620 BY REFERENCE only), wasm rebuilt (109060 B); mutants M-A/M-B/M-C kill; 832/832 + 79/79 + DIFFERENTIAL PASSED 5321 (@1056B). Prior: v127 idx 38 F3 removal (33→32) | Prior: v126 idx 40 armed-carrier removal (34→33) | Prior: v125 idx 25 stats removal (35→34) | Prior: v124 idx 46 play removal (36→35) |**v127 (update-v127-706c-restock-removal) REMOVED record idx 38 `opaqueRoomUpdateTailMid706cExpire` (count 33→32; 17th removal since v79)**: ADDENDUM-3 F3 capture contract implemented verbatim — under the `shopRestockReady` voucher the whole body 0x008158a0 runs IN-MODULE via `gameUpdateSlice706cRestockFrame` over the landed v123 laws (shop gate warn+ret; hash-zero fatal twin as typed drop; bucket select; counter inc cap255 host copy-back; idiv_pos SIGNED trunc + f32 pos per-op rounding; vcall arm behind voucher rows; xorshift{2,7,7} single chain; cursor advance/reset). NEW runtime pack @14684..15484 (8 scalars + 6 per-item lanes cap 32) + events @1000..1020 (warn/create1/create2/seed_zero_drop/copy_back_ready); creates/vcall/0x6eef60 stay platform leaves/captures behind typed carriers. ready=0/over-cap keeps the monolith byte-for-byte: coarse @216 fires ONLY on capture absence. Model+cpp rewired identically, wasm rebuilt (108725 B); mutants M-A/M-B/M-C kill; 909/909 + DIFFERENTIAL PASSED 5321 (@1020B guards). Prior: v126 idx 40 armed-carrier removal (34→33) | Prior: v125 idx 25 stats removal (35→34) | Prior: v124 idx 46 play removal (36→35) |**v126 (update-v126-7230-spawn-removal) REMOVED record idx 40 `opaqueRoomUpdateTailMid7230Spawn` (count 34→33; 16th removal since v79; clearPathFlagStore/type5DoorForcedRerun removal-carrier precedent: ONE new typed event `tailMid7230SpawnArmed` @996, events 996→1000)**: arming-identity theorem — fresh decode cpu-dump/008054ab.txt re-verified branch-by-branch (gate pre>0 SIGNED jle @0x8054b3 && pre%5==0 SIGNED idiv jne @0x8054c1; arm body pos 0x813460 → genrand 0x6eef60 → push chain {0,0xc5d838,0xc5d5dc,0,eax,0,0,0xc7b640,pos_out,3,4} → create 0x428b20 → RTTI 0xaf08b1; tail RE-READ [Room+0x7230] @0x805515 + UNCONDITIONAL dec @0x80551e..21). The gate input is SLICE STATE (roomTimer7230 @296) — no capture-absence arm; the retired coarse increment was exactly [gate open] and the armed carrier fires iff it armed (same expression/tick/order), IS the host cue for the v95 arg-prep replay; pure countdown dec stays in-module. Coarse @224 STAYS in the events ABI but NEVER fires. Model+cpp rewired identically, wasm rebuilt (108497 B); mutants M-A/M-B/M-C kill with sha256-identical restores; slice+siblings 907/907 green; DIFFERENTIAL PASSED — 5321 cases (guards now expect 1000 B); live-frame PASSED. Prior: **v125 (update-v125-tcs-stats-removal) REMOVED record idx 25 `roomTriggerClearStats` (35→34)**: full-capture theorem under the standing `tcsStatsVecReady` voucher — gates closed = proven pure skip (clearCount==1 FULL-DWORD else ret; comiss jbe NaN closes), gates open = six typed carriers publish the full residual in PE order; guest-alloc 0x69ee50 = standing allocator platform leaf behind `tcsStatsGrowthCalls`; model+cpp rewired identically (coarse @168 to the ready==0 else arm), wasm rebuilt. Prior: **v124 (update-v124-heartbeat-play-removal) REMOVED record idx 46 `playerManagerUpdateHeartbeatSfxPlay` (36→35; record-1/idx-47 template, model/cpp untouched; fresh decode cpu-dump/0092dc30.txt; typed leaves @604/@608/@612 + v96 continuation plan carry every arming arm; stale-wasm repair closed the case-157 differential mismatch)**. Prior: **v123 idx 38 law pack exports-only, boundary STAYS (F4 blockers)** |
| Differential | **5321 cases, `result: pass`** (ABI **99**, v114 rebuild re-run), zero Wasm imports / **554 slice exports** (549 requested + 5 Emscripten runtime exports: wave-27's 548 + the S3 `entity_surface_rtti_fold`; module 107991 B after the v115 emsdk rebuild — toolchain drift vs the wave-32 99152 B, no test pins the byte size). Lane guards: abi96Lanes=44/44 + **abi97Lanes=4/4** (walker capture lanes @14276..14288) + **abi98Lanes=9/9** (record-12 transition pack lanes @14292..14324) + **abi99Lanes=89/89** (entity-surface REBIND pack: ready @14328 + 8x44 B blobs @14332..14684) delivered, events 6+3+3+1@988B, live-frame 988/988 B (verifier throws if a lane is ever neutered). Wave-31 adds the S2 **10 deterministic B8 theorem arms** (dt-b8-pure/mini/cap448/wideready/mono/overcap/overcap-wide/gatemiss/zerocells/negcells, branch-verified draw-free, ABI v110 arm-coverage guard) + the 20 playerHUD capped-run support rows (5291→5320; 5291 = S1's standing volume + 29 new rows). Wave-32 (W32-S5/S6/C1 merge): S6 replaced the 2 dead deterministic A/B 409030-pair rows (v107 originals never opened the pair gate — flag_111 0x100 low byte 0 + the mode!=0 row hosted the arm; rebindAbPack counts were lucky random hits) with correct mode=0 pure rows (PE 0x4212ce je 0x4213f7) — the pair-pure path is now deterministically exercised at ANY draw budget (capped 500: rebindAbPack=2/370); the C1 ambientVelX/Y7460 f32 draws were staged |0 into the u32 lanes (module always 0) — now full-width u32 patterns incl. the sentinel-bits as INTEGERS (never the float value, which would diverge from the u32→f32 lane conversion) so the 0x24ee0 host arm is discriminated; + 1 record-15 B3B7 law-pack row (b3b7SparseReady=1, first corpus draw of @868/@8012.. — the monolith-only gap) → 5320→5321. Wave-29 adds the C1 **rebind of the 36 never-drawn lanes** (18 phone-home probe samples @6800..6868, 92f1c0 limit/field14 @6872/6876, 4212c0 A/B pack @7656..7688, tcsStats vector @7960..7984 — all reached + law-flipping in the differential: rebind956110=127/4197, rebind92f1c0=375/3393, rebindAbPack=4/3787, rebindTcsStats=1/3790) + the S5 mid-restock guards (pure=4, mono=8, fatalDrop=1) + the 10 capture-only event census (emission=209) + the mid-restock typed drop event @984 (events 984→988). Wave-30 re-run @ ABI 99 with the S1 15 deterministic theorem arms + full-capture invariant (midRestock pure/mono/fatalDrop **9/9/2**) + the C1/C2/S5 **6-row listener-registry JSON drop** + the **C11-G landing** (last unconditional per-case `normalizeRuntimeInputsForLayout` deleted — value-identical by construction; capped 1024 MB re-run: peak heap total **957.6 MB** / wall **210.3 s** vs 977.4 MB / 427.4 s pre-G; headroom restored to 66.4 MB) + captureOnly=224. |
| Families | Update 99 · Room **78** · Exit 47 · render-shell **69** · frame-opaque 64 · Lua **71** · ProcessInput 52 · PlayerHUD 39 · PM 41 · HUD **38** · room-transition 20 · frame-effect **33** · PGD 33 · SFX **40** · ANM2 **61** · render root slice **35** · log 23 · alloc **4** · GameState **13** |
| game-state v2 (2026-08-18) | Family **1→2 (atomic)**: **`GameState::DeleteRerun` 0x009c8410 LANDED** (exact ZHL 24-byte `void DeleteRerun()`; ret-body 0x9c8410..0x9c84ba, 0xab B — steam arm RETs @0x9c8483, NO 0x9c79a0 reset tail unlike Delete; 5 callers). 8 laws (v1 template shapes, Rerun offsets): steam presence FULL-dword 0x9c842b/0x9c8451 AND Manager+0x2a3a4 cloud LOW-BYTE 0x9c8430 -> steam arm; stat-name SSO +0x1fe0c/+0x1fe20 (FULL-dword cmp 0x9c843f); vtbl+0x34 result LOW-BYTE 0x9c846a -> vtbl+0x18; fallback filename EMPTY gate on the SHARED +0x1fdbc (0x9c8484; exit v46 field) -> logger(1, 0xb7f1e0 — Rerun's OWN warn string) then filename SSO +0x1fdc4/+0x1fdd8 -> CRT remove IAT 0xb187cc; common tail ret 0x9c84ba. Byte-gate uint32+&0xff, no uint8_t; oracle parity (fixed + 400 deterministic draws); 10 mutants killed, sha256-verified byte-identical restores. **`GameState::write` 0x009c9340 CENSUSED + IRREDUCIBLE typed-host lease** (exact ZHL 23-byte `bool write(GameStateIO**)`; span 0x9c9340..0x9cad3b CROSSES the v1 band edge; 3 callers): serializer tree — 124 E8 (103x row-writer 0x683410 + in-band 0x9c8d20 x4 / 0x9c87e0 / 0x9c85d0 + sub-serializers 0x9d77e0/0x9d45c0/0x9cec80/0x9d84d0 + leaves), 106 stream vtbl+0x1c (IO field +0x1fe24), SEH + GS cookie 0xbf93b4, seed-fatal log "Error: Game Start Seed was not set.\n", `ret 4`; all 159 stores stack-local; no vtbl slots; shared-VA lease with exit `ISAAC_EXIT_958ED0_WRITE_VA`. NOTES: game-state-v1/ + game-state-v2/. Next: serializer-lane laws (W25-F15-gsband2, ABI 2→3; their census game-state-v2-band/NOTES.md) then GameStateIO family at 0x9cad40..0x9cb0xx. |
| game-state v3 (2026-08-18) | Family **2→3 (atomic)**: **serializer tree 0x9c84c0..0x9c8d20 leaf laws LANDED (18 laws R1..R18)** — PURE-OPEN decision gates of the six typed-host write-helper rows (bodies stay host, exit-v41/pgd-v26 peel style; full-span census: 84 E8 / 78 stream-vtbl in-tree; write 0x9c9340 lease + 0x9cad40 Exit cloud write UNCHANGED, IRREDUCIBLE evidence in section-notes/game-state-v2-band/NOTES.md). 0x9c84c0 bitmap drain: lane count UNSIGNED max cmovb 0x9c850e, clear-iff-count 0x9c851e, lane-0 flush 0x9c8550, lane bit select 0x9c85ad. 0x9c85d0 lane builder: flush-every-8 0x9c8661, remainder flush 0x9c86a0, source bitmap bit 0x9c864a. 0x9c86e0/0x9c87e0 twin triple serializers: 0x80000000 sentinel layout gate 0x9c870b/0x9c880b. 0x9c88e0 flat serializer: flags byte (2 nonzero tests 0x9c8ca3/0x9c8cb0), blob-dump gate 0x9c8ce6, child recursion gate 0x9c8d04, constant result al=1 0x9c8d11. 0x9c8d20 mega serializer: slot presence WORD gate 0x9c8ff8, 0x3800 table bound 0x9c90e5, signed floor div-0x78 element counts 0x9c90f1/0x9c91d7, zero-count skips 0x9c9132/0x9c921b, intrusive-list walk empty+tail 0x9c9195/0x9c91d5. Byte-gate uint32+&0xff discipline (no uint8_t); 18/18 mutants killed, sha256-verified restores; suite 10/10 targeted-pass. |
| game-state v4 (2026-08-18) | Family **3→4 (atomic)**: **GameStateIO save-orchestrator hosts 0x9cad40/0x9caea0 decision laws LANDED (6 laws S1..S6)** — the cloud-write host A (0x9cad40..0x9cae9f: DeleteRerun + 0x683930 name checksum + GameState::write + vtbl+0x34 close) and the rerun host B (0x9caea0..0x9cb019: vtbl+0x24 + read_rerun + success byte store + DeleteRerun fallback); write/DeleteRerun calls STAY typed-host (family-landed); A/B body selection documented EXIT-side (0x958fa1 steam+cloud gates → host A; 0x95a0eb +0x26589 gate → host B). S1 pool_select FULL-dword arm `[0xc7de78] ? +0x30 : 0xc7f618` (0x9cad68/0x9caecd) · S2 name_gate LOW-BYTE checksum AL 0x9cadb6 · S3 open_gate LOW-BYTE vtbl+0x30 AL 0x9cadcb/0x9caf2d · S4 rerun_gate LOW-BYTE vtbl+0x24 AL 0x9caf18 · S5 rerun_success LOW-BYTE read_rerun AL → byte [GameState+0x1fded]=1 store (0x9caf89/0x9cafe9) · S6 io_dtor FULL-dword GameStateIO* +0x1fe24 presence (0x9cad58/0x9caebd; GameState twin of exit v46 same-field law). Leased typed-host: **GameState::read_rerun 0x009d7d50 exact ZHL `__thiscall bool GameState::read_rerun(GameStateIO** gameStateIO)`** (0x9d7d50..0x9d8182, IRREDUCIBLE — GS cookie 0xbf93b4 + version parse + checksum 0x96696996 + DeleteRerun restore call). Helper cluster re-census: 0x9d45c0 (0x321a-B giant serializer), 0x9d77e0, 0x9cec80, 0x9d84d0 (0x79-B u32-array leaf — v2 "string writes" comment corrected), 0x9d84a0, 0x9d8550 — ALL typed-host, 0 pure-leaf; band table + PE pins in section-notes/game-state-v4-io/NOTES.md; suite targeted green, 13/13 mutants killed sha256-verified. |
| game-state v5 (2026-08-18) | Family **4→5 (atomic)**: **write-span loop/decision laws LANDED (23 laws: U1 + W1..W22 + N1)** — the v2 typed-host write 0x9c9340 lease stays whole (SEH/GS + call recipe; IRREDUCIBLE), its LANE-FREE internal loop/decision gates peeled (exit-v41/pgd-v26 style; census game-state-v4-cloud/NOTES.md). U1 0x9c8d20 element-loop bounds UNSIGNED 0x9c9157/0x9c9249 · W1/W4 count gates UNSIGNED 0x9c9ca0/0x9c9d17 · W2 hash probe `(idx+hash)&(cap-1)` 0x9c9cc0 · W3/W5 hash/value loop bounds · W6 reorder SIGNED entry test 0x9c9dc5 (I64 compare-flip) · W7/W9 reorder WORD pending flushes 0x9c9dcc/0x9c9e07 · W8 reorder run word `((pending-1)|0x8000)&0xffff` 0x9c9dd5 · W10 div-0xc count magic 0x2aaaaaab **TRUNCATION (no-add form; NOT the R16 floor class)** 0x9ca858 · W11 resize `>0xff` UNSIGNED · W12 count byte & 0xff · W13/W14 div-0xc entry+bound · W15/W16 7-lane count 7 + countdown 0x9caa9c/0x9cac22 · W17/W18 SIGNED byte-count gates (i8 compare-flip; 0x80..0xff negative skip) 0x9cab2a/0x9cab70 (+twins) · W19..W21 checksum mode-0 finalize gate/pad/ror-add 0x9cacb2..0x9cacdc (the v3-census "SSO shrink" label CORRECTED to the pad+fold — acc [ebx+0x14]=state+8) · W22 checksum stream word `acc^0x96696996` + store +0x1fda4 0x9cad00 · N1 0x683930 name-open gate FULL-dword steam presence 0x68394a (helper body; F9's S2 gates its call-site AL). Byte-gate uint32+&0xff / & 0xffff, no uint8_t; suite targeted green; 25 mutants killed sha256-restored. |
| game-state v6 (2026-08-19) | Family **5→6 (atomic)**: **reader row 0x9cb020 format-gate laws LANDED (18 laws: R1..R14 + T1..T4)** (census game-state-v6-reader/NOTES.md) — the recursive GameState save-loader 0x9cb020..0x9cb618 (545 insns / 1 ret @0x9cb5fb / 35 E8 / 31 ind / 39 stores; fastcall-style `bool GameState::read(GameStateIO*)` ecx=this, edx=io; 4 callers = 0x9cb5ee SELF-recursion + 0x9cbe40 + 0x9cbf83 + 0x9d1df0; ZHL EMPTY) stays typed-host (vtbl+0x14 stream reads + 0x683410 row writes + alloc 0xb187e0 / ctors 0x827f70 0x6eee10 0x4d3080 + self-recursion). R1..R10 FULL-dword UNSIGNED format gates on the io+8 counter (`cmp dword [edi+8],N ; jb`; io+8 set by read_rerun @0x9d7e8f; the 0x9d1de2 caller pre-gates the same field at 0x67): R1 >=0x3b flags-byte read 0x9cb122 · R2 >=0x46 u16@+0x20 0x9cb466 · R3 >=0x47 u32@+0x1c 0x9cb179 · R4 >=0x5b u32-direct@+0x30 arm 0x9cb254 · R5 >=0x67 flags processing (bit0/bit1 sub-object reads) 0x9cb500 · R6 >=0x6c u32@+0x5c 0x9cb4d0 · R7 >=0x88 u32@+0x24 0x9cb1cb · R8 >=0x96 u64@+0x48 0x9cb3ae · R9 >=0x9e float@+0x58 0x9cb49a · R10 OLD-format `format < 0x47` 8-B compat read (jae skip; 0x9cb302 — twin threshold of R3, opposite polarity). R11/R12 byte-gates `test al,1/al,2 ; je` -> sub +0x64 (alloc 0x24 + 0x827f70 + u32 + 0x20-B row) / +0x6c (alloc 0x7c + 0x6eee10 + RECURSIVE read) 0x9cb53b/0x9cb5ad · R13 `((byte&0xff)!=0)?1:0` setne 0x9cb2aa · R14 `field0 == 4` old-store gate 0x9cb33b. Fixed-count serializer loop laws (write-span peel, W16 lane7 countdown class): T1/T2 0x9c9c30 0xe-iteration u32 loop (GameState+0x164 stride 4; count store 0x9c9c24, `sub,1 ; jne` 0x9c9c57) · T3/T4 0x9c9d66 0x14-iteration 0x9c8d20 element loop (values +0x16e08 stride 0xb8, holders +0x1942c stride 0xc; count 0x9c9d6c, `sub,1 ; jne` 0x9c9d95). 18 laws all uint32 (byte gates mask & 0xff inside; format gates full-dword), PE-pinned, oracle-mirrored; 25/25 mutants killed sha256-restored (baseline cpp f862dbe0… / model cc30df1e…); targeted suite green incl. the merged ABI 7.
| game-state v10 (2026-08-19) | Family **9→10 (atomic)**: **body C 0x9ce720 io+8 dispatch + the full-field reader giant 0x9d05d0..0x9d45b6 LANDED (111 laws)** (census game-state-v10-body-c/NOTES.md) — body C (0x9ce720..0x9cec73, ret 4, 1 caller 0x9cda14) stays typed-host; 8 laws: the io+8 5-band u32-array count (0x57/0x69/0x70/0x7a -> 0x1a/0x1b/0x1c/0x1d/0x1f, sbb/cmovb 0x9ce73d..0x9ce766) + the mgr-vector count_fits `count <= vecsize` (0x9ce9c0 + twin 0x9ceaea; 0x2a404/0x2a408 + 0x2a410/0x2a414) + `>=0x4a/>=0x37/>=0x4e` io+8 gates + sbb defaults (0x35 -> 0x1ff/0x2dd and 0x78/0xbe; 0x77 -> 0xe/0xf). The reader giant (SEH 0xb0f39e + GS 0xbf93b4, ret 4, 0x3fe7 B, `bool (void* dest, GameStateIO*)`; 7 callers incl. the 0x9cc1a0 entry x4 + read_rerun x2 + 0x90c933; ZHL EMPTY) stays typed-host; 103 laws: **74 io+8 format gates** (72 `>= N` 0x1e..0xa9 + 2 ABOVE arms 0x23/0x24; the READER-ROW pre-gate `io+8>=0x67` @0x9d1de2 dispatches the +0x100 head to the v6 0x9cb020 row) + 9 dispatch/count/cap laws (lane counts 1..4/2..4, count 0xf/0x10, format range [0x2f,0x90], count cap 0x2222222, idx<=size, slot cap <3, clamps 0x14/0xa) + 6 SIGNED laws (head >=0, head < 0x148-stride vecsize, count >0, idx < vecsize, 0x7fff-masked idx < vecsize, value <0) + 8 LOW-BYTE/result gates (byte!=0 setne + byte-count entry, byte==1, byte!=0xff, u32 count !=0, io-ready AL==0, 0x72fd10/0x9c7350/0x9cff40 results) + 6 UNSIGNED loop bounds (byte idx, fixed 2/6/8, word idx, u32 idx). Byte-gate discipline uint32+&0xff; wasm 918 exports (response-file build); suite 42/42; mutants 23/23 KILLED, sha256-verified restores (cpp 449046a2..).
| game-state v9 (2026-08-19) | Family **8→9 (atomic)**: **the full-field read entry 0x9cc1a0..0x9ce596 LANDED (50 laws)** (census game-state-v9-giant/NOTES.md) — the SEH 0xb0f33b + GS cookie 0xbf93b4 giant thiscall `bool read(GameStateIO* io, bool check)` that OWNS the 4 read_pill callers + Delete @0x9cc254 + the io+8 format store @0x9cc352 (3 callers 0x918366/0x95a1f7/0x9ce677; ZHL EMPTY) stays typed-host. 27 gs-format gates `GameState+0x1fdf0 >= 0x2b..0x9b` FULL-dword UNSIGNED (0x9cc761..0x9cc4c1) · 3 io+8 gates `>= 0x56/0x7c/0xa5` (0x9cccb7/0x9cd1d9/0x9cd246; the 0x7b x2 + 0x21 sites pinned to V4/V6) · the io+8→variant-count DISPATCH (9 bands 0x89..0x20f, 0x9cce5d..0x9ccf06) + second-pass `>0x1fb` (0x9ccfc3) + +0x164 13/14-u32 count (0x9ccc64) · UNSIGNED bounds (0x1fb count 0x9ccf1e, 0x19d1c table 0x9cd158, 0x50 byte-array 0x9cdbe0/0x9cdc31, 0x4d byte-arm 0x9cdb63, word 0x25 cutoff 0x9cdf86, word idx<count 0x9cdf42/0x9cdfab, SIGNED %2B8 0x9cdc62) · SIGNED movsx8 gates (count>0 0x9cd772/0x9cd830/0x9ce30f/0x9ce3a9; jl loop bounds 0x9cd86e/0x9cda01/0x9cdec9/0x9ce170/0x9ce358/0x9ce3e7) · LOW-BYTE `==0`/`!=0` gates (0x9cc301/0x9ce54d/0x9ce55f) · checksum gates (streamed==expected || expected==mgr+0xf98 0x9cc313/0x9cc31c; final match 0x9ce545, magic 0x96696996) · u16 clamps `>= 0x35/0x1a` (0x9cc3e7/0x9ccb13). 21/21 mutants killed; suite 36/36; draws 200. Heights: buildWasm export flags moved to an em++ response file (662 exports exceed the Windows 32K argv limit). |
| game-state v8 (2026-08-19) | Family **7→8 (atomic)**: **per-element pill reader 0x9cb620..0x9cc18d LANDED (20 laws V1..V20)** (census game-state-v8-body/NOTES.md) — the SEH 0xb0f300 + GS cookie body that OWNS the reader-row callers 0x9cbe40/0x9cbf83 (this call `bool read_pill(holders, values, GameStateIO*)` ecx=this, 3 stack args; 4 callers 0x9ccf75/0x9ccfe8/0x9ce33f/0x9ce3ce — ALL inside the giant 0x9cc1a0..0x9ce596 read entry; ZHL EMPTY) stays typed-host (vtbl+0x14 stream reads + 0x683410 row writes + vector/string ops + the two 0x9cb020 array-element calls). V1 io-ready LOW-BYTE `(vtbl+0x10 AL & 0xff) == 0` 4 sites (0x9cb65d/0x9cbe30/0x9cbec0/0x9cbf70) · V2..V5 io+8 format gates FULL-dword UNSIGNED `>= 0x3d/0x4b/0x7b/0x7d` (0x9cba1b/0x9cbb0a/0x9cbb77/0x9cb671) · V6..V9 GameState+0x1fdf0 format gates `>= 0x21/0x3f/0x49/0x82` (0x9cbd86/0x9cb835/0x9cbfad/0x9cb875) · V10 slot-count FULL-dword `!= 0` 0x9cbbb1 · V11 string-copy ptr gate 0x9cbb3a · V12 slot bool SIGNED setg `(int64)(int32)>0` 0x9cbc57 (0x80000000.. negative) · V13 slot-table bound UNSIGNED `byte_off < 0x3800` (448x0x20 @+0x68) 0x9cbdc0 · V14..V17 +0x74/+0x88 0x78-stride array entry/bounds 0x9cbe08/0x9cbe50/0x9cbf43/0x9cbf93 · V18/V19 fixed-8 u16 loop count/countdown 0x9cc11b/0x9cc145 · V20 flag-byte gate `(byte & 0xff) != 0` → 6 bit-ORs into +0x44 0x9cb93b..0x9cba72. Suite **30/30**, **23/23 mutants killed** (sha256-verified restores; fn-level anchors). Handoff: giant read entry 0x9cc1a0..0x9ce596 + the 0x9d1xxx full-field reader (0x9d1df0 arm) — own bands. |
| game-state v7 (2026-08-19) | Family **6→7 (atomic)**: **write-loop leftovers LANDED (7 laws: X1..X2 + Y1..Y5)** after W27-F9's 5→6 (reader row 0x9cb020 R1..R14 + fixed-count loops T1..T4; census game-state-v6-loops/NOTES.md) — the 0x9c9340 peel's remaining lane-free rows, bodies stay typed-host. X1 reorder-table loop bound `((remaining-1)!=0)` u32 0x9c9dfe/0x9c9e05 (0x1fb-entry countdown, W16 shape, 0x100 wide-present) · X2 reorder value word `entry & 0xffff` 0x9c9dc2/0x9c9df0 · Y1 7-lane lane base `0x1ead0 + lane*0x320` 0x9caa97/0x9cac1c · Y2/Y3 loop-1 element ptrs `lane + i8(i)*0xb8 − 0x31c` / `lane + i8(i)*0xc − 0x1ac` 0x9cab43/0x9cab53 (movsx i8 index 0x9cab40) · Y4/Y5 loop-2 element ptrs `− 0x194` / `− 0x24` 0x9cabc4/0x9cabca (movsx 0x9cabc1) — all u32-wrap arithmetic, PE byte-truth pinned, oracle-mirrored, 9/9 mutants killed sha256-restored; v6 rows + v5 W1..W22/U1/N1 + v4 S1..S6 + write/read leases stay. |
| game-state v1 (2026-08-18) | **New family FOUNDED** (`game_state_pure_helpers.*` / `game-state-pure-model.mjs` / `decomp-game-state-pure-helpers.test.js`, ABI 1; suite = the new test file, 7/7, self-builds wasm; 8 mutants killed + byte-identical sha256 restores). Band census 0x009c7000..0x009ca000 with the corrected E8-target tooling: 15 bodies, all HOST/dead/thunk except the one caller-bearing pure-decision target — **`GameState::Delete` 0x009c8350 LANDED** (exact ZHL 24-byte; body 0x9c8350..0x9c8409, 0xba B, NO ret — both arms tail-jmp the shared reset 0x9c79a0). 8 laws: steam context FULL-dword `[SteamInternal_ContextInit()] != 0` (0x9c836b, repeat 0x9c8394) AND Manager+0x2a3a4 cloud byte LOW-BYTE (& 0xff, shared exit/PGD field) -> steam arm vs fallback; stat-name SSO select (size +0x1fe08 vs 0x10 FULL-dword; ptr = inline this+0x1fdf4 u32-wrap or load32); vtbl+0x34 result LOW-BYTE gate (0x9c83ad); filename EMPTY FULL-dword (size +0x1fdbc — SAME field as exit v46 `isaac_exit_958ed0_local_filename_present`); filename SSO select (+0x1fdc0/+0x1fdac); host leaves Steam IAT 0xb18a1c / remove 0xb187cc / logger 0xa112c0. 5 direct rel32 callers. Next frontier: `GameState::DeleteRerun` 0x009c8410 (exact ZHL; stat-name +0x1fe0c/+0x1fe20, fallback filename +0x1fdc4/+0x1fdd8), then `GameState::write` 0x009c9340 (save serializer). |
| wave-11 frame-opaque v50 (2026-08-16) | Family 49→50: assigned docs candidate `0x421b3c` — Rule-12 resolved: mid-instruction inside the v41-landed shuffle loop (0x421a50..0x421b43; the 0x421b3c linear decode was the SEH-cookie call rel32; the adjacent 0x421b50 body is v30-landed) and handoff peers 0x9b6840 (v2-landed MenuGate pure gate) / 0x9a2b30 (HUD::PostUpdate host, PlayerHUD) / 0x840c60 (text_out host). Landed next band body instead: `0x004242b0` SEH dispatch peel (0x4242b0..0x424305 ret; SEH handler 0xaf0d10, cookie [0xbf93b4]; thiscall this=ecx; 0 E8, 2 INDIRECT host calls; 8 callers) NARROWED — pure laws: sub_gate FULL-DWORD ([this+4]!=0, test ecx,ecx/je), al_gate LOW-BYTE (test al,al/je on the vcall result — 0x100→0, 0x1ff→1; defect-class covered), cb_gate FULL-DWORD ([0xc7e814]!=0), fire_cb chain (sub!=0 && (al&0xff)!=0 && cb!=0 in order); host leaves vtable call 0x4242e1 + callback call 0x4242f1; shared indirect global 0xc7e814 (same pin as 423cc0); 10 exports, 5 mutants planned, family suite runs 49→50 lockstep; Update ABI untouched 93. NEXT: 0x424380 (function after the int3 pad; 0 E8, 2 E8 calls 0x424440/0x424540; needs census). |
| wave-12 frame-opaque v51 (2026-08-16) | Family 50→51: assigned `0x424380` — Rule-12 resolved: MID-INSTRUCTION (byte at 0x424380 is the 3rd byte of `89 40 08` `mov [eax+8],eax` @0x42437b+2; linear decode misreads `0866c7` as `or byte [esi-0x39],ah`). Re-derived true prologue from the 10x cc int3 pad (0x424306..0x42430f): **`0x00424310` SEH ctor** (0x424310..0x42441b ret; SEH handler 0xaf192d — DIFFERENT from 4242b0's 0xaf0d10 — cookie [0xbf93b4]; thiscall this=ecx; straight-line, no branches; **7 callers** 0x6f1ba6/0x857000/0x950d7a/0x956b44/0x956c36/0x95c4f3/0x95c5d7, `lea ecx,[x+0x10]; call` ctor pattern) NARROWED — pure laws: this+0x00/0x10=0, capacity this+0x14=0xf (FULL-DWORD store @0x424349), byte this+0=0 (LOW-BYTE store @0x424350), alloc size 0x14 before HOST alloc 0xa0f4c0 (NO post-alloc null test — eax used unconditionally), node self-links [eax]=[eax+4]=[eax+8]=eax (FULL-DWORD node address stored, not truncated), word magic 0x101 at node+0xc (16-bit store), this+0x18=node, 18 final-state dword-zero offsets (0x00,0x10,0x1c,0x20..0x34,0x48..0x50,0x8c..0xa0; +0x18 node / +0x14 cap NOT zero), HOST sub-init 0x424440 thiscall this (exit family's residual host boundary — kept host, never inlines the 0x424540 tree-erase chain); 13 exports, 6 mutants, family suite +2 tests; Update ABI untouched 93. NEXT: 0x00424440 (sub-init, 14 callers, 1 E8 to 0x424540) / fresh 0x00424420 (thiscall wrapper, 1 host) / 0x424530 band. |
| wave-13 frame-opaque v52 (2026-08-16) | Family 51→52: assigned `0x00424440` — verify-open: only a HOST-pin constant in family files (424310's subinit_host_va); EXIT family only COMMENTS it as its residual host (no export/event — no duplication conflict: exit keeps calling whole 0x424440 host; we transcribe the prefix laws around the host erase). Landed **`0x00424440` sub-init peel** (0x424440..0x424501 ret; thiscall this; straight-line, no branches; **14 callers** 0x424404 (INSIDE the v51 424310 ctor!)/0x426a83/0x6f1bc6/0x6f446f/0x857020/0x8e547c/0x8e56e2/0x8e5752/0x8eba12/0x950d9a/0x958b66/0x981284/0x9812d4/0x9ab185; 1 E8 to 0x424540 _Tree erase — HOST, pinned in room/render-shell/game-render) **NARROWED** — pure laws: tree head = re-load node [this+0x18], erase arg read = [node+4] (@0x42444d push [esi+4]); node RE-self-links [node]=[node+4]=[node+8]=node FULL-DWORD after erase; this+0x1c=0; 3 copy pairs (0x20→0x24, 0x2c→0x30, 0x98→0x9c) where the THIRD is a SNAPSHOT (+0x98 read @0x424472 BEFORE the zero storm, +0x9c written LAST @0x4244fa); 16 DWORD-zero stores (0x1c/0x3c/0x40/0x44/0x54/0x58/0x5c/0x60/0x64/0x68/0x70/0x78/0x7c/0x80/0x84/0x88); DWORD +0x38=0xffffffff (NOT a zero member); BYTE +0x6c=1 and BYTE +0x74=0 (c6 LOW-BYTE width laws, not dword members). 18 exports, 6 mutants, 63/63 family suite. NEXT: 0x424540 stays host; remaining frame-opaque host bodies 0x006fd7c0 / 0x0098dba0 / 0x00426b00+ band (verify open first). |
| wave-10 frame-opaque v49 (2026-08-16) | Family 48→49: `0x00424220` mode dispatch (0x424220..0x42429a ret, jump table 0x42429c; 2 callers 0x423d03 inside the 423cc0 band + 0x954f9e) NARROWED — pure laws: dispatch selection (mode-1 wrap dec + unsigned ja>4 + table 0→CASE_A / 1,2,4→CASE_B / 3→DEFAULT), CASE_B FULL-DWORD eq gate ([obj+0x4b3d8]==[obj+0x4b3dc] → PATH2), PATH1 rtti null→0xdeadbeef else [rtti+0xc] (423970 shape), PATH2 wrap delta [q+0x1baac]-[q+0x1baa8] + mask test delta&0xfffffffc (FULL-DWORD) → DEFAULT, then [GetPlayer(0)+0x1618] (423950 shape; host 0x417870 exact-ZHL `Game::GetPlayer(unsigned int)`); host leaves 0x90b070 + 0x417870 stay host; 13 exports, 4 mutants, 57/57 family suite; Update ABI untouched 93. NEXT: 0x421b3c / 0x9a2b30 / HUD text_out 0x840c60. |
| room-transition v14 | Family 13→14: `0x004288a0` sorted-map lower-bound walk (address-stable, identify-zhl empty; `ret 8`; 204 direct E8 callers image-wide — a shared map primitive; called from our SFX-prep at 0x9567cd; PM/room/hud families only reference the VA as host). **FULLY PURE** (0 calls in 0x4288a0..0x4288e8). Laws: root=[this], node=[root+4], out={node,0,root}; BYTE gate `[node+0xd]`; SIGNED dword `[node+0x10] >= key` (jge) → out[8]=node BEFORE the move, flag=1, follow [node+0]; else flag=0, follow [node+8]; byte gate repeats. `iteration_limit`+`truncated` bound the structural walk (a cyclic chain loops forever in the machine too). New export `isaac_room_transition_engine_4288a0_lookup` (mem-plan); 2 new tests; 7 mutants (signed/unsigned, out8-after-move, branch swap, entry-gate polarity, root fold, model strict->>, byte-vs-dword loop gate) all caught, restores byte-identical. NEXT_VA `0x004288f0` (12-B map getter, ret 4). |
| Suite | Update slice+pipeline+frame-path+wiring **931/931 (0 skipped)** (v115 re-run; +2 v115 removal tests, v107 mode-feed drives flipped to the carrier)  · wiring suite **60/60** (59 wave-31 + the W32-S5 capture-precedence test) · `decomp:verify-slice` **DIFFERENTIAL PASSED — 5321 cases, ABI 99** (abi96Lanes=44/44 + **abi97Lanes=4/4** + **abi98Lanes=9/9** + **abi99Lanes=89/89** delivered, events 13@988B; live-frame guard PASSED — 23 host kinds, events 988/988 B, memory 4194304 B stable; script capped `--max-old-space-size=1024` at the package.json level; rebind guards: 956110=146, 92f1c0=344, abPack=6, tcsStats=1, captureOnly=272, midRestock pure/mono/fatalDrop=8/8/5; capped 500-draw budget: rebindAbPack=2/370 ≥ 1 — the S6 deterministic A/B pair-pure rows hold at ANY budget; B8 deterministic arms: dt-b8-* 10/10 branch-verified + ABI v110 arm-coverage guard; W32-S5 precedence row: record-15 b3b7SparseReady=1 law-pack draw (first corpus exercise of @868/@8012..) + C1 full-width ambientVelX/Y7460 draws) · `npm test` **3388/3388 PASS (0 fail)** — all 49 wave-32 reds resolved (S1 log-family repair 175/175, F6 room canonical cpp, render-host-gl ABI mirror; wave-31 deferred log pins now green; flag-before-glob `--test-concurrency=2`) · wasm 0 imports / **554 exports** (module 99152 B) · boundaries **43** · family ABIs: Update 99 · Room 77 · Exit 47 · render-shell 68 · frame-opaque 64 · Lua 70 · ProcessInput 52 · PlayerHUD 39 · PM 41 · HUD 37 · room-transition 20 · frame-effect 32 · PGD 33 · SFX 39 · ANM2 60 · render root slice 34 · log 23 · alloc 4 · GameState 12 |
| wave-4 (16 agents, 2026-08-15) | 16 parallel units across 13 families, all verified independently + full-suite green (npm test 1596→1642, +46 tests): SFX v12 XML ATTR/CHILD find `0x413bf0`/`0x413c70` PURE-complete (6 exports, 5 mutants) + SFX v13 `.ogg` suffix compare `0x00423480` PURE (7 exports, 7 mutants; fixed same-wave red differential) · room v54 B15 spawn relay `0x00428b20` PURE (7 exports, 4 mutants) · render-shell v43 item add/update `0x00a14c00` NARROWED (31 exports, 7 mutants) · frame-opaque v42 id-vector getter/walk trio `0x4253b0`/`0x4253c0`/`0x4253d0` PURE×3 (18 exports, 9 mutants) · process-input v35 FCO/RCO sibling `0x009be2a0` PURE islands (25 exports, 7 mutants) · playerhud v32 RecomputeStats `0x84ca00` mask-dispatch laws NARROWED (4 exports, 6 mutants) · HUD v18 per-slot flag-loop island (6 exports, 2 mutants) · PM v22 GetHeartLimit `0x007caa00` PURE (13 exports, 4 mutants) · frame-effect v18 mode-4 SFX arm completion (2 exports, 6 mutants) · lua v42 class-create template body (22 exports, 5 mutants) · PGD v13 bestiary row-walk laws (21 exports, 5 mutants) · room-transition v14 sorted-map lower-bound walk `0x004288a0` PURE (1 export, 7 mutants) · log v9 deleting-dtor island template (10 exports, 2 mutants) · ANM2 v47 corrected the v33 `0x0040ace0` extras name→index PE-truth FOLD (hit path = stage-2 id-lookup `id*0x54+[elem+8]`, NOT raw index; plan 44→76 B, 7 mutants) · Update record idx 3 `0x92f1c0` confirmed IRREDUCIBLE (0x4186c0 unconditional) + closed a v86/v87 green-but-unmutated gate gap (2 new full-word tests, byte-narrow mutant was surviving; slice 157→159/159). No Update boundary count change (49) — all units are depth/family landings; verify-slice still 5255 cases ABI 91 pass. |
| wave-14 (7 agents, 2026-08-16) | 8 units across 7 families, all verified individually (family suites) + full-chain green (npm test 1902→1918, +16 tests; verify-slice 5255 @ ABI 93; **Update ABI untouched 93**): SFX v23 TryRedirectPath probe walk 0x8f5ad0 (3 subagent crashes → coordinator landed INLINE: probe-walk state machine 0x8f5b60..0x8f5bc1 — mask 0x7fff / UNSIGNED cap 0x8000 jae / FULL-WORD key pair / the cap EVICTS even a matched node (dtor 0x40d040 + sized-free 0x24 0xaef15c) / machine-exact jae+jne shared 0x8f5b9e: count>0x8000 unreachable-but-transcribed FOUND; 5 exports + 13 consts, 6 mutants incl. the no-op-mutant lesson (identical expr killed 0 tests → replaced); 105/105) · process-input v46 GetTrinketMultiplier 0x009bea80 EXACT 18-B ZHL (43-site census; 33 exports, 6 mutants; RAW unmasked id to BOTH host calls 0x7cb6e0×2, id&0x7fff only for index+SIGNED range gate, end RE-READ per iteration, SIGNED int32 return; 0x7cb6e0 stays HUD-family host; 68/68) · PGD v23 PGDADSED 0x92b230 BYTE-store (c6 84 08 14 0f 00 00 01 — corrected the v22 'dword' shorthand) + PGDK41 0x92b270 41-bit popcount gate (TryUnlock threshold >=5; 46 exports, 4 mutants; the whole 0x92b22a..0x92b2e0 span narrowed; clang response-file for 708 export flags at 33.7K argv; 175/175) · render-shell v53 0xa156e0 CS-owning scalar deleting dtor (vftable 0xb81c0c slot 0, reach ONLY via virtual dispatch — address-taken census 1 hit; FULL-dword cs gate + LOW-BYTE [ebp+8]&1 self-free flag; 17 exports, 6 mutants; DeleteCriticalSection [0xb18274] + 2 sized frees host; 91/91) · lua v52 DrawString wrapper 0x8a8fc0 (127 insns SEH; v51's mid-body ret trap + v52 body; 2 prior crashes → 3rd dispatch landed: wrapper + vec helper 0x8baab0 (100 insns) + getref 0x8bb070 (36 insns, nil-path ret); 70 exports, 6 mutants; IAT lua_type/touserdata/checklstring/checknumber/error stay host; 133/133) · room v64 ambient 0x7f01c0 PURE islands (10 exports + 6 structs, 5 mutants; sqrt 0x435a50 VERIFIED CRT primitive — cvtss2sd/ucomisd/sqrtsd/cvtsd2ss == existing 7230 finish_sqrt; lane tables 0xbacbf0/0xbacab0 .rdata-verified; SIGNED idiv quot/rem; B&&C&&D bounds arm is DEAD machine code documented; 75/75) · Update record-0 0x84c170 tail CENSUS-COMPLETE (ALREADY-LANDED v83/v84 disposition: sole caller 0x9a2bb2 covers the whole reachable surface; checkpoint CORRECTED — the 'sized-free 0xaef15c' leaf is actually 0x84bf30 get-or-insert, nearest aef15c sites are a separate 0x84b9xx fn; fatal-log structurally dead; no ABI bump, 177/177 slice). NEXT: 0x9e4260 PGD shared Rebirth-save snapshot reader (PGD_COUNT_PROBE_NEXT_VA advanced) · 0x009bea80's 0x7cb6e0 HUD-side removal · room 0x7f0544 range-hit tail island · 0xa15730 sibling dtor · lua 0x85c050 depth · SFX Load depth 0x92e560/0x92e300 vtable leaves (v7-landed) · Update: record 9 0xc57b18 capture-ABI / record 4 guest-memory bridge. |
| wave-16 (32 agents, 2026-08-16) | 32 units (28 Part-A landers + 4 Part-B censors; user-directed) — all verified post-merge (family suites individually; npm test 1918→1983, +65 tests; verify-slice 5255 @ ABI 93; **Update ABI untouched 93**; boundary count 49 unchanged — landings are leaves + proofs per mandate). ABI MERGE (Part C-1): SFX 24→25 · PGD 24→25 · render-shell 54→55 · lua 53→54 · room 64→65 — header+model+all test pins atomically, 0 stale pins, 16 files. SFX v25 (6 blocks): a path-arm concat caller gates 0x92d93a (SSO 0x10 cmovae, unsigned strict-jb wrap limit; 4 exports 5 mut) · b attr-value scanners 0x416b70/0x416920 (entry/text/dispatch tables, named/numeric/literal arms, ';' error law; 7 exports 5 mut) · c numeric/amp entity scans 0x416e80 (hex/dec run fold, low-byte folds, amp consume/emit; 7 exports; 3rd-dispatch audit + 6 mutants) · d atoi gates 0x92d528/0x92da3a (**IAT identity corrected: 0xb187a8 = atoi, not strtoul**; 5 exports 5 mut) · e emplace/destroy/resize siblings (v25e partial; model comment only, cpp never landed — coordinator reconciled) · f file-open post-gates 0xa178d0 (retry/out/alloc/guard FULL-word; 6 exports 5 mut). PGD v25 (4 blocks): m 0x9e4af0 audit = ALREADY-LANDED v11 (Rule-12 STOP; SIGNED-only laws 12/12, conflation corrected) · n stage-4 tally 0x9e4618 (23 exports, 5 mut; found v24 note missed edi NOT reset across loops) · o importer 0x92b2e0 residual (crashed mid-append, completed by writer-flush + coordinator test fixes; 40+ exports; suffix scan backward dec, Rebirth rewrite, open/io gates) · p per-section handler rows (8 exports 4 mut; independent oracle caught 6 wrong hand-written expectation rows). render-shell v55 (3 blocks): j/k/l 0xb81c0c slots 2/3/4 (16+32+16 exports; gates byte/full-word discriminations; (t·M)>>82 4-lane 128-bit mul 200k pairs 0 mism; **0xb81c0c vftable FULLY decoded**). lua v54 (3 blocks): g PUSH_I64_PAIR 0x85c030 (BigInt composite; census 4→5 true E8) · h getArgObject 0x8baa50 (27 exports, 86 callers; roster 0x8baa50-vs-0x8baab0 conflation corrected) · i consolidation v36/v39 pins re-pointed + 0x85c590 tail IAT/CF (23 exports 4 mut). room v65 (4 blocks incl. v65r): q 0x7f0544 range-hit tail (cmov POST-call f394 class-1; shape A/B arg lists; TLS gate) · r outer-loop count/continue 0x7f051b (zero-only entry gate, per-iter re-read) · s payload shapes 0x7f0673 (5-arg frames per bounds-dest; 0x6fd7c0 host) · t GetPlayer 0x417870 (count/index/slot pure, empty-fatal host leaf). Part B censors (4): record1 0x92e300 (118 insns; **L5 OPEN divergent: pending-mask over-reports disabled/empty groups**, untested; L1-L3 device slots irreducible) · record5 0x98dba0 (latch NOT in closure; empty-arm at max narrowing; entity-surface capture contract next) · record10 0x4212c0 (R1-R5 ranked; R3 log-split + R4 equalFlags capture = smallest open units; 0x421400/0x40a030 = render-shell v18 AnimationState::Render verified) · RANK.md full 49-record table (2 removal-ready: idx 10 arm-level, idx 1 split-shaped; 47 no). Coordinator merge fixes (all mutation-checked): 2 model signed-coercions (`|0` on value lanes), 4 test-row mispins (guard/limit/emitted/mutant discriminators that agreed with correct behavior), 1 corpus-test ordering relocation (node --test declaration order), 1 missing `const native` binding (zero-executed-assertions class), 1 sfx test-file permutation recovery from a botched relocation (restored + re-moved cleanly). Census outputs at output/decomp/5129df723e64/section-notes/update-boundary-census/. NEXT (per RANK): idx 10 R3 log-split + R4 equalFlags blob; idx 1 L5 action-gate; 0x85bfd0 PUSH_I32_SEXT; 0xa17f40/0xa17ea0 open bodies; room 0x7f072f fail-path re-entry. |
| wave-17 (10 agents, 2026-08-16) | 10 units (7 lost wave-16 batch-2 landers recovered + 3 RANK-driven), all verified individually + full chain (npm test 1983→2030, +47 tests; verify-slice 5255 @ ABI 94; **Update ABI advanced 93→94** via record-10 R3 + record-1 L5; boundary count 49 unchanged — removals are leaf-shaped, not boundary). ANM2 48→49: 0x40b000 IsEventTriggered SSO wrapper (gate [this+0x34] FULL-dword, SSO cap<0x10 jb strict, host 0x40add0 BY REFERENCE) · 0x40b030 const-char twin (raw argv passthrough pinned; 386 E8 callers) · 0x40b060 WasEventTriggered twin (call target 0x40ae70 vs 0x40add0 delta pinned) · 0x40ae70 104-caller SSO name->flag walk (**bitfield +0x1c vs frame-opaque twin +0x18 delta pinned**, assert-log then walk continues — M5 folded-early-out rejected; 5 exports). **v21 GetFrame-int floor regression FOUND + FIXED**: the cpp export had lost its floor (cvttss2si direct vs model floor+convert) — restored floorss→cvttss2si, mutant anchor realigned (was a silent no-op). HUD 22→23: 0x7cb6e0 walk/RNG/twin/recursion PREP laws (27 exports; rng receiver consts .rdata-verified {2,7}/0x19, NOT MTRNG 0x8fd3c0; **repaired a pre-existing leftover: v18's mutant1 (& 0xff fold) was still applied in the cpp from a crashed run** — SIGNED jl restored; 5 mutants, 71/71). PlayerHUD 32→33: 0x84cc40 stat-bar tween driver (588 insns, 15 exports; the 84dxxx StatHUD band now FULLY consumed — 84d6b0/84d8xx/v18-v21, next real frontier outside family; 4 mutants, 71/71). PM 25→26: 0x7db0a0 small-host island (map_count/delta/proceed/size-gate/flag_next, SIGNED max(0,...) cmovs + 8-BIT add wrap; Rule-12 skipped 0x7dd380 = already v25; 6 exports, 5 mutants, 137/137). lua 54→55: **0x85bfd0 PUSH_I32_SEXT pusher-table ROW 3** (cdq sign law; **pusher table COMPLETE 4/4** — f32/u32/u16/sext; v40 FOURTH_I32_SEXT pin re-pointed to row; 4 mutants, 155/155). Update 93→94 (R3 + L5): record-10 R3 log-split — 0x40adde fatal log 'AnimationData is NULL' → **typed host event @508**, post-log probe flow pure on BOTH field_4 arms (drop of the v91 field_4!=0 gates per machine); 2 exports (log_needed FULL-DWORD, probe_pure_false), 4 mutants, 192/192 + verifier 5255 @ 94; record-1 L5 — **pending-mask loop action-gated** (group enabled byte 0x92e340 + UNSIGNED count precede every [e+0x29] store: disabled/empty groups set NO mask bits), cpp+model identical, 4 mutants incl. cpp killed by verify-slice differential, 192/192. NEXT: record-10 R4 equalFlags capture (serves record 4 too) → R1 A/B subobject pack + ANM2 by-reference → R2 (needs records idx 12/4); ANM2 0x40b090 (116 callers) + 0x40bf30 ReplaceSpritesheet exact-ZHL OPEN; SFX 0x92cf40 Preload; room 0x7f072f fail-path re-entry. |
| wave-21 (34 units, 2026-08-18) | 34 subagents (14 family landers + update-slice depth units + censors; coordinator merged + full-chain green: npm test 2618→2705 (+87), slice 632→656 (+24), verify-slice 5268 @ ABI 95, events 912→932, boundary count stays 49). FAMILY LANDINGS (ABI bumps in bold): Room **70** 0x7f92b0 probe leaf + the emsdk `__builtin_bit_cast` finding · Exit **44** 0x6f0040 pure · render-shell **57** 0xa13fa0 factory + net audit · frame-opaque **57** 0x424cd0 + 0x424d70 · Lua **57** MakeShockwave/Play · PM **30** 0x7db360 · PlayerHUD **37** 0x857400 · SFX **28** djb2/FNV hashes · HUD **27** 0x770c3e · room-transition **16** xorshift128+ + bit setter · frame-effect **21** 0x81fd60 (RespawnEnemies) · render-slice **21** kind-45 (eighth type-9 a102e0 pack at 0x00818228) · ANM2 **51** pure-finds trio + Load depth-10 laws. UPDATE-SLICE (ABI stays 95, exports 453→484): record-0 tween seam (4 laws: hud_stat_recompute_row_stride/entry_valid/slot_runs/owner_byte) + typed probe events hudStatWalkProbe1/2/3 COMMITTED at 920/924/928 (the S2 offset -1 handoff resolved; events 912→932 atomically: model EVENTS_LAYOUT + cpp struct + static_asserts + JSON rows + both wires at the same offsets) · record-4 modes (14 laws: mode1 manager-block/clear-walk/player-171-store/sfx-manager-store-plan/tail-mode-set/tail-830950-call + mode2 lane-gate/direct-tail-gate/fast-reset/player-418-next + mode4 walk-call-gate/name-string-gate/final-reset-gate + walk_pure_skip — all 14 wired into the build export list) · record-12 705ee0 write-plan (8 laws + the rewind seam events @912/916 struct offsets pinned) · events 912→920→932. CENSORS: live-frame guard made permanent (events-size + host-kind pins, 932/932 B) · real-capture corpus 96.2% coverage · C3 whitelist fix · assertion census **69/465 untested slice exports** · taint-census dataflow fix (C7 latent bug) · ANM2 band-2 scan · claimed-lane audit · memory/corpus profile ~40% trim candidates. BOUNDARY COUNT STAYS 49. NEXT FRONTIERS: record-10 R2 unlock after the record-12/4 lanes merge · ANM2::Load record-22 removal Unit A/B shape · 0x84cc40 tween walker host · second render-shell band 0xa17000..0xa1a000 · room 0x7f96f0 · PI 0x9bfc00 SSE leaf → HUD lane · HUD 0x771200 · record-9 TAIL-A laws at ABI 96. |
| wave-22 (32 units, 2026-08-18) | 32 subagents (update-slice depth units + record close-outs + censors; coordinator merged + full-chain green: npm test 2705→2788 (+83), slice 656→687 (+31), verify-slice 5268 @ ABI 96 with the new abi96Lanes=44/44 delivery guard, events 932→956, runtimeInputs 13736→14276, **Update ABI 95→96**, boundary count stays 49). LANDINGS: record-12 LIVE seam (rewind_705ee0 slot/game scalars + 0x20b payload blob + opaqueCall006fd7c0Ready @11592..13736 with the stores/save_state emissions wired in cpp+model) · record-22 Unit A (23 engine_anm2 typed host-leaf laws: H1 prologue, H2 filename assign arms, H3/H4 cache pair VAs + 0xc798b8/bc/c0 globals, v8 loadgraphics wire, LoadImage leaf 0x9588a0, H6 anim-apply targets, v8_wire_decision + prefix_typed_host_events; §lane-requests = the 3 typed events + 9 capture lanes merged into the ABI-96 tail) · record-9 TAIL-A laws (8ef990_taila_slot_empty/sfx_id + else-reset triple; the slot pair + optional seed lanes merged @14200..14212) · record-10 R2 prefix laws (true_probe_reached/prefix_plan/8318a0_drop, blob-gated v92 precedent; the 12-word manager blob + interior event merged @14152..14200/@936) · record-0 probe2_live + fatal-empty law (typed event @940) · live-capture host-kind delta 25→15 (wave-21 23-kind frame-1 set unchanged; steady kinds 25→15) · ABI-96 plan (C11 lanes.json) executed: record-4 SFX-manager store-plan capture + per-player entry pack @13736..14152 (cap ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX==8) + record-10 blob + record-9 + the record-22 ANM2::Load pre-lane half @14212..14276 (loadgraphics_flags u8x32); events = opaque_008318a0_sfx_manager_stores@932 · frame_opaque_4212c0_true_probe_interior@936 · hud_stat_walk_fatal_empty@940 · engine_anm2_prefix_filename_assign/cache_fetch/loadimage @944/948/952 (W22-S2 §lane-requests; C11/S2 events reconciled per the coordinator: C11 trio first, S2 trio after) · C11 §1 gaps closed (model RUNTIME_INPUTS_LAYOUT += b18/record-12 keys; JSON b18 rows re-pinned to 11068..11592) · verifier latent fixes surfaced by the merge's first post-wave run: whole-row pass-through spreads (flattenUpdateListTimersRuntime / flattenOpaque0092e300VoicesRuntime) reordered in the corpus whitelist literal so the f32-bit conversions win (walk-oracle clobber), menuAux RT_PLAN kind-2 field case (n.left vs n.Left), anm2-v52 randomized-differential per-anim record seed. Next frontier: record-22 Unit B (49→48, the standing LoadImage/cache decision folds H5+H6a/H6b+H1 and removes the boundary), record-10 interior host removal after the capture lanes activate (true-probe_blob + @936). |
| wave-23 (32 units, 2026-08-18) | 32 subagents (update-slice LIVE-seam units + family landers + censors; coordinator merged + full-chain green: npm test 2788→2860 (+72), slice 687→716 (+29), verify-slice 5272 @ ABI 96 with the live-capture-driven lane draws, events/runtime sizes frozen at 956/14276, **boundaries 49→48 — FIRST REMOVAL SINCE v79**). BOUNDARY: record idx 21 `opaqueRoomTransitionEnginePrefix` **REMOVED** (W23-S1 Unit B fold: prefix_fold_ready / cache_fetch_decision / loadimage_decision / anim_apply_decision laws + typed emissions @944/948/952; moved to resolvedBoundaries with abiV98 evidence; residual platform-only under the standing LoadImage/cache decision; coarse counter byte-for-byte on any partial capture). RECORD-10 INTERIOR **LIVE seam** (W23-S2): blob-gated @936 typed event + opaque_edge drop on the covered arm (residual host when the blob is absent), scratch exports `4212c0_true_probe_prefix_plan_address/words` — next RANK action = record-10 removal eval (S2 handoff). RECORD-4 **sfx_manager_store_plan LIVE** (W23-S4): @932 typed emission on the pure mode-1 arm over the 13736..14152 pack (per-entry candidate_found law, count cap 8, byte-for-byte inert on gate misses; no new exports). RECORD-0 WALKER laws (W23-S3): `hud_stat_walk_site_k8_skipped` (walk-site mask arm, bit-8-clear skip) + `hud_stat_walker_k7_target` (owner LOW-BYTE ? clamped*100 : probe3*clamped*100 — the S2 caveat true home) + `hud_stat_walker_k6_probe_leaf_va` (mask-free 3-leaf dispatch); JSON abiV99; record 0 stays NARROWED (never removes). FAMILY LANDINGS (ABI bumps in bold): Room **72** music-path collect walk · Exit **46** host-leaf close · render-shell **59** 0xa152a0/a153a0 band + 0xa15550..0xa157f0 laws (mutation round-trips) · frame-opaque **58** 0x424e60/0x424e80/0x424ef0 band (34 laws) · Lua **59** 0x8b9760 · PM **32** net · HUD **29** 0x771410 · room-transition **18** residue · frame-effect **23** 0x820170 · PGD **28** 0x929b40 host-leaf · SFX **30** ducking wrapper · ANM2 **53** SwapANM2 · render root slice **23** 0x8182de · log 20 / PlayerHUD 38 unchanged (iocluster/getters residue). LIVE-CAPTURE driven-lane deltas: the corpus draws now exercise the ABI-96 lanes (record-4 pack, record-10 blob, record-9 TAIL-A, record-22 pre-lane, b18/rewind word arrays); whitelist audit FINAL (1998 layout keys / 1946 delivered / 1011 drawn / 47 guards / 68 not-delivered = pre-existing dead lanes; C1 loop-built-array-vs-lazyTopLevelBindings machinery gap closed; C2 b18/rewind delivery edit validated). VERIFIER TRIM −37% re-validated (pool staging + pack pooling + typed-array writes + stale-wasm skip; 5272-case differential ~247 s). Boundary RANK next: record idx 10 removal evaluation (capture lanes + @936 live, S2 handoff). |
| wave-24 (32 units, 2026-08-18) | 32 subagents (update-slice depth units — record 10 REMOVAL eval + record 0/4/12 folds + family landers + censors; coordinator merged + full-chain green: npm test 2860→2955 (+95), slice 716→728 (+12), verify-slice 5272 @ ABI 96, events/runtime sizes frozen at 956/14276, **boundaries 48→47 — second removal since v79**). BOUNDARY: record idx 10 `opaqueCall004212c0` **REMOVED at ABI v99** (W24-S1 eval: the leaf census proved every remaining host firing is a typed/platform leaf — pair plan v95, false-probe clear v91/v94/v95, true-probe interior LIVE seam v98 (@936 + blob @14152..14200 + 48-B prefix-plan scratch + edge drop) — or a capture-absence gate miss (pair/probe/blob/equal-flags vouchers; equal-flags over-cap counts reproduce v76 byte-for-byte); residual = the standing platform logger @508 + gate-miss vouchers ONLY. Full-capture theorem: with every voucher live + field_4!=0 the record NEVER fires; resolvedBoundaries now has 4 entries (idx 10 = 4th, abiV99 evidence); `opaqueCall004212c0` stays in the events ABI and still fires byte-for-byte on gate misses). RECORD-4 **MODE-1 WALK STORE FOLD** (W24-S4): full per-entry write transcription (walk 0x8319b2..0x831b0d + manager block 0x831c64..0x831e31) → 3 new laws `8318a0_mode1_walk_entry_zero_arm` (type-0 FULL-DWORD zero-arm → e+0x1398/e+0x139a at 4 sites; byte gates b173/b1398/b139a/b34, ptr7c FULL-DWORD) + `_walk_entry_171_zero` (0x831a95..0x831af8 e+0x171=0 iff zero-arm || FULL-DWORD w3fc==4) + `_reset_span_clear_writes` (0xb/0x10 && field_14==0x18304 → whole-span b171=0/w410=1); the v98 candidate_found derivation CORRECTED (the 0x831ae4 flag clear is unreachable for type==0 — zero-arm exits at 0x831af8 — so mode==1 && type==0 scored rows now FIRE the @932 seam, machine truth); store-plan rows corrected to the PE encodings (row0 node+4 byte = 0x4, row7 = 0xfffffeb0, row8 = 0xfffffeac); JSON abiV98 + 3 helper rows at the merge. RECORD-12 **SaveState depth** (W24-S3): 0x6f9000 fresh census — 19 call sites = 17 direct E8 + 2 virtual (v95 '18 E8' corrected; host_calls law 18→17), 38 observable store sites all target the slot (0 direct Game stores); re-derived vs the wave-22 LIVE seam: exactly ONE store value became lane-decidable — [state+0x78]=[game+0x264f8] (= rewind_705ee0_game_frame_264f8@11624) landed as `savestate_frame_dword_dst` + the 0xe-blob source ADDRESS (payload_blob_addr + 0x216c4) landed as `savestate_blob14_source_addr`; SaveState stays a typed-host leaf (record 12 NOT removal-shaped). RECORD-0 **WALKER body depth** (W24-S2): the 0x84cc40 walker's 4 direct E8 leaves' call ordering + probe chain lawed — `hud_stat_walker_probe1_clamped` (0x84d199..0x84d1c2, seam twin gates: maxss/minss [0,1] NaN->0 THEN probe2 BOOL LOW-BYTE & 0xff gate; wired as the k6/k7 block's clamped value, oracle parity bit-identical) + `hud_stat_walker_e8_call_order` (positions 0..3 = 0x7f92b0/0x749830/0x7f96f0/0x84ca00 — the RecomputeStats seam LAST, swap-back rows only; completes the v98 site-dispatch law); lane requests @14276+ (hud_stat_walker_player_a/b + b_frame328) + walker probe typed events @956/960/964; ABI 96; JSON abiV100. FAMILY LANDINGS (ABI bumps in bold): Room **73** devil/angel tail · ANM2 **54** load-graphics cache + band-4 getters (ReplaceSpritesheet) · HUD **30** 0x76arm/7706e0 windows · Lua **60** StopLoopingSounds · SFX **31** SetPan/GetVolume/ClearVec · PM **34** B3/B5 + HasInstantDeathCurse · PGD **29** dispatcher · room-transition **18** closed (residue) · exit **46** closed (host-leaf) · render-shell **61** chain + ColorMod · frame-opaque **59** CompletionWidget · frame-effect **25** VoidDoor + AnyoneHasTrinket · render root slice **24** tenth pack (0x818338) · log **21** sink Close · **GameState family FOUNDED** (ABI 1; `GameState::Delete` 0x009c8350, 8 laws; 7/7 suite). LIVE-FRAME seam measurements: record-10 dropped 120/120 (voucher-absent frames byte-for-byte), @932/@944-952 firing on the covered arms; verifier −26% trimF re-validated. Exports 526→**533** (S2 x2 + S3 x2 + S4 x3; module ~96.6 KB); JSON sha 6f5af331… → f444e846… (S1 repair verified: no ghost lanes, rootSymbol Game::Update, 47/4). Boundary RANK next shortlist: **idx 1 (0x0092e300)** static-vtable-fold L4/L5 re-eval. |
| wave-26 (merge, 2026-08-19) | ABI-97 FREEZE-LIFT merge (PLAN update-v102-abi97-plan; all 32 units closed; full chain green: npm test 3015→3085 (+70), slice 735→752 (+17 incl. the ABI-97 pin group), verify-slice 5272 @ ABI 97 + abi97Lanes=4/4 guard + live-frame 968/968 B, runtime 14276→14292, events 956→968, **Update ABI 96→97**). LANDINGS: **walker freeze-lift** (record-0): 4 committed runtime lanes `hud_stat_walker_player_a/b` @14276/14280 (swap-OUT/IN ptrs; capture 0x9bef22 push edx / 0x9bef09 push edi, A=[ebx+8] B=[ebx+0xc]), `hud_stat_walker_b_frame328` @14284 (the exact [B+0x328] deref of the RESET/TWEEN split, PE 0x84ccc8), `hud_stat_walk_probe1_arg` @14288 ([Game+0x18300] ROOM word, PE 0x84d188) + 3 typed walker probe events `hud_stat_walker_probe1/2/3` @956/960/964 (reached/arm/probe-k6; twins of the seam @920/924/928; fire only when the capture is LIVE — player_a|player_b != 0; the k6/k7 (void) law stand-ins replaced with LIVE lane reads, pass-through per the v101 bit-identical contract). **record-4 store-plan APPLICATION arm** (148-B step scratch `IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan`, store_mask 0x1ff = the 9 block sites 0x831e31..0x831f34, rows via the v96 plan law over the captured globals @13736..13748) + 3 exports `_apply_plan`/`_address`/`_words`; host apply contract = native-update-bridge §5. **record-12 transition laws** (7 LANE-FREE laws: `6fd7c0_args_valid`/`validate_fail_kind`/`fatal_string_va`/`fatal_level`/`blue_room_reach`/`blue_room_apply_index`/`engine_prefix_fires` — family frame-effect BY REFERENCE; the 9 capture lanes @14292..14328 + 3 typed events @968/972/976 STAGED for ABI-98). FAMILY LANDINGS: room grid bodies v75 (4 laws + 4-wave residue repair: v72 M1 / v73 M4 / v74 M2 / v65r M3 restored), ANM2 cache-clear v56 (11/11 residue restore — the C12 audit's 8 stranded strands closed, suite back to 249/249), HUD is_trinket_id v32, Lua SetAmbientSound v62 + PlayerHUD closure getters v63, SFX Load decisions v33, PM B18 v38 + FirstBirthrightOwner v37, PGD save-verifier v31 (4-dword magic cascade), FO band close (0x425360 dead; 0x424420 4-caller correction), FE 0x7ee7e0 decision seams v26 (184/184), render slice pack-11 v26 (cont 50, events 452), log v23 zero-law closure, GameState v4 IO orchestrator + v5 write-loop laws (div-0xc truncation magic + checksum finalize correction); hardening (update-v102-hardening): 4 gap files routed through writeSourceRetry (HUD 58, log 45 incl. 6 defective read-back restores replaced with cleanOriginal, PlayerHUD 42, game-render-slice 2). PRE-EXISTING FIXES: room v60 t1000.store_450 (cpp dropped the 0x74 arm — restored `((m74 != 0) || (m78 != 0))`, PE 0x7ef733) + room v63 l1.quot (cpp movzx→movsx sign-extend, PE 0x7f0013 `0f bf`) — LAW fixes, verified green. |
| wave-30 (merge, 2026-08-19) | WAVE-30 MERGE (all 32 units closed; full chain green: slice 769/769, verify-slice 5276→**5291** @ ABI 99 (S1 deterministic theorem arms + full-capture invariant + the B8 over-cap row; abi96/97/98/99Lanes guards all delivered; live-frame **988/988 B**) + rebind guards (956110=127, 92f1c0=375, abPack=4, tcsStats=1, captureOnly=224, midRestock pure/mono/fatalDrop=**9/9/2**), npm 3263→**3312**, wasm 99152 B / **554 exports** / 0 imports, **boundaries 46→45 — FOURTH removal since v79**). LANDINGS: **record idx 39 REMOVED at ABI v108** (S1 — full-capture theorem: the v46 pure walk applies under the all-or-nothing desc pack (owner hook + desc ac/ae/seed58, room [Game+0x18300] / desc=[Room+4]; pack @692/@828..840); residual = seed==0 typed drop @984 + capture-absence gate misses only, byte-for-byte; mono→pure transition measured T0 120→T1 0) · **record idx 12 removal-readiness** (S4 arms audit: every seam typed/platform or another row's counter or capture-absence gate miss — 45→44 wave-31) · **S2 entity-surface capture impl** (accept-pure @980 120/120) · **S3 record-16 B8 grid bridge** (capture + copy-back, pure 40/120) · **S5 record-4 apply verifier** (no collisions post-rebind) · **S6 removal-scan** (idx 39 only removal-shaped) · families: Lua 68 (206/206) · render-shell 67 (7/7) · anm2 v59-census + 9 stranded mutants restored (257/257) · sfx 37 (dtor-forest) · GameState 10 (body C + 0x9d05d0 giant, 111 laws; 42/42) · room v78-census · hud 36 (0x7616ad) · frame-opaque 63 (0x425a70 dup-seam pins) · PI v51 · FE 30 (214/214) · render slice 32 (events 516 B) · alloc v2 (23/23) · F12 closed-verify floor (log +bias restored 175; pm 185/185) · F14 docs-coherence (7 duplicate-VA seams). MERGE-OWNED FIXES: **JSON single pass** (record-39 → resolvedBoundaries abiV108, boundaries 46→45, the 6 stale state24ecc8ef990Listener rows DROPPED (4 runtime @7180..7192 collide sfxStopVoice12 + 2 events @632/636 collide tcsStats), 2108→2104 runtime / 259→257 events; nothing else moved, base sha acd2e39c) · **slice-test pins** (idx-39 'stays' pins flipped to resolvedBoundaries; 41 boundary-count pins 46→45) · **C6 gap fix** (render-wiring record-15 3-mutant cycle routes web/js/native-update-bridge.js writes through the 120-attempt writeSourceRetry) · **C11-G URGENT** (last unconditional per-case normalizeRuntimeInputsForLayout deleted at verifier ~7442 — value-identical by construction; capped rerun peak heap total 957.6 MB / wall 210.3 s; headroom 66.4 MB) · **hud v36 suite repairs** (2 stale abi()===35 pins → 36; 770c3e_result strict branch restored to count_gt_1 per the model oracle + cpp comment) · **render-root scratch stride fix** (v32 events 516 B > the old +0x200 events→baseSeq gap — clear_events' 516-B memory.fill overlapped base_seq[0]; baseSeq moved to +0x400, countSeq/outSlots/gridSlots follow; entity excursion suite 9/9 + render-wiring 56/56). RANK wave-31: 1) idx 12 REMOVAL (45→44), 2) idx 5/32 + idx 16 post-capture removal evals, 3) F14 7 duplicate-VA dedupe, 4) Lua 14 wrappers, 5) FE 0x8208e0/0x820910, 6) render-shell 0xa19bf0, 7) GameState 0x9cec80..0x9d05d0 + 0x9d45c0 re-census, 8) anm2 0x40e110/0x40c000 census, 9) hud 0x76280f, 10) room 0x7fe220, 11) C2/C5 ledger refresh |
| wave-31 (merge, 2026-08-20) | WAVE-31 MERGE (all 32 units closed; full chain green: slice 770/770 (S1 record-12 removal pins + the merge v110 pin group; C9 strip −3), pipeline 6/6, verify-slice 5291→**5320** @ ABI 99 (S2 10 deterministic B8 theorem arms dt-b8-* + ABI v110 arm-coverage guard + 20 playerHUD support rows; abi96/97/98/99Lanes guards all delivered; live-frame **988/988 B**; rebind guards 956110=127, 92f1c0=375, abPack=4, tcsStats=1, captureOnly=253, midRestock pure/mono/fatalDrop=**9/9/2**), npm 3312→**3354** (3341 pass / 13 fail — all 13 log-family stale pins from the wave-31 log landings, deferred to wave-32 RANK #8; hud v21/v22 stale abi-36 pins FIXED at this merge), wasm 99152 B / **554 exports** / 0 imports (deterministic double-build sha 7b89f349…, byte-identical to baseline — the S3 dedupe touched FAMILY exports only, no slice export removed; 0x92f1c0 Update/HUD + 0x801ee0 Update/Room pairs INTENTIONAL, both stay), **boundaries 45→43 — FIFTH+SIXTH removals since v79 (wave-31 made TWO)**). LANDINGS: **record idx 12 REMOVED at ABI v109** (S1 — full-capture theorem: under the two-voucher pack (opaqueCall006fd7c0Ready @13732 AND transition6fd7c0Ready @14324 both nonzero = packLive) every record-12-seam firing is typed/platform or another row's counter; NO bare 6fd7c0 event slot exists (only the Mode4Sfx variant @108 row 19); W30-S4 live-seam 240-frame measurement + residual audit (arms-240.json, per-arm table A..F over 492 ticks); event slots @104/108/112/116 + residual counters (rows 11/19/20/22 + typed events) STAY committed); **record idx 16 opaqueRoomUpdatePrefixB8 REMOVED at ABI v110** (S2 — full-capture theorem: the W30-S3 bridge grid record (captureUpdateB8 all-or-nothing costs int32[448]/trails int16[448], cap b8_max_cells 448, ready room_b8_blob_ready @204) + seam fill + post-tick copy-back make the coarse @148 NEVER fire when armed; every firing is a capture-absence gate miss (no-blob/over-cap/caller-mismatch → byte-for-byte mono residual, exactly once per reachable tick; single emission site cpp 9496 / model 10176 / wasm differential-pinned); the counter STAYS @148); **S3 dup-VA dedupe COMPLETE** (7 pairs: 0x408c90 Exit-owns/FO-pins FO 63→64 · 0x801ee0 INTENTIONAL Update/Room · 0x92f1c0 INTENTIONAL Update/HUD · 0x6f9400/0x6f95a0 RShell-owns/PI-pins PI 50→51 · 0xa159d0 RShell-owns/Exit-pins Exit 46→47 · 0x217a0 FO-owns/RShell-pins RShell 67→68; suites exit 28/28 · FO 103/103 · PI 71/71 · RShell 128/128 · slice 40/40 · root 9/9); **S5 walker re-verify** (no drift 5291→5320); **S6 residual arms census** (25 host kinds); FAMILY LANDINGS (ABI bumps in bold): Lua **69** (0x8983e0 trio + Spawn/GridSpawn/RenderText/ExecuteCommand/GetPlayerTypeByName/UpdateStrangeAttractor + mod-band; 213/213; ZHL Isaac_GetItemIdByName + Seeds::String2Seed), render-shell **68** (dedupe owner), ANM2 **59** (0x40bcb0 SSO AD-walk; 261/261), SFX **38** (0xa2bb10 hook layer; 152/152), GameState **11** (0x9cf000/0x9cff40/0x9d0440 + writer-giant split 0x9d45c0/0x9d71b0; 46/46), HUD **37** (0x76280f + 138-site span-B table; 16/16; 2 inherited residues repaired), FE **31** (0x8208e0 pure + 0x820910 seams + 0xba9fe4 float correction; 223/223), Room v79-census (0x7fe220 SEH host; 120/120; 16 inherited mutants repaired), frame-opaque v64-census (0x426a50 cluster; 103/103; stale dup ABI-v41 blocks cut), playerhud v41-census (band fully owned), alloc **3** (0x40cf50 + 0x40d040; 28/28), RTE **20** (0x42a040 INSERT seam; 51/51), F12 closed-floor (exit 27→28 verified). CENSORS: C1 whitelist CLEAN (5320) · C2 json 0 mismatches · C4 zhl (0x92cfb0 re-confirmed) · C6 hardening 0 gaps · C7 assertions 0 true unasserted (588 wave-30 exports) · C9 events — dangling emitter `emitState24ecc8ef990Listener` (writes the wave-30-dropped FindFound/AcceptMask keys) STRIPPED at this merge from scripts/decomp/game-update-model.mjs (fn + call site @8252) + the 3 live tests referencing the dropped keys; zero dangling refs (the pure helper exports isaac_game_update_slice_8ef990_listener_count/walk_accept stay) · C10 liveframe guard 988/988 (app.js gap persists: midRestockOwner/guestWrite/entity-surface/B8 absent — structural bridge item, may defer) · C11 memory 945.8 MB heap / 78.2 MB headroom (H trim CONFIRMED for wave-32, NOT this merge) · C12 export census 0 violators · C3 docs fixed at this merge (this row + CURRENT STATE) · C8 npm9 re-run at quiesce → 13 residual log fails (all deferred wave-32 RANK #8). RANK wave-32: 1) idx 5/32 leave close-out + idx 0 tail + 0x83b850 re-audit (census depth, no removal shape), 2) 0x7f83b0 room-clear deep-body + 0x7ec00 room frontier, 3) GameState 0x9d77e0 sub-object serializer + 0x9d8190 SEH writer gates, 4) FE 0x820aa0/0x820ac0, 5) SFX 0xa2bcb0 list-clear seams + 0x92e7d0/0x92e7f0 destroy wrappers, 6) Lua remaining closures (0x8c2850 TimeCounter census row; the 39-band), 7) render slice 0x8186ad (18th pack) + 0x8187a1 (5th seam group) + 8th group end, 8) ANM2 Host seals + log 167/175 suite repair if still red, 9) H trim (C11), 10) pid/cross-family hygiene |
| wave-32 (merge, 2026-08-20) | WAVE-32 MERGE (all 32 units closed; full chain green: slice 770/770, wiring **60/60** (incl. the S5 capture-precedence test), verify-slice 5320→**5321** @ ABI 99 (S6 A/B pair deterministic rows + the C1 ambientVel full-width draw + the first record-15 B3B7 law-pack corpus row; abi96/97/98/99Lanes guards all delivered; live-frame **988/988 B**; rebind guards 956110=146, 92f1c0=344, abPack=6, tcsStats=1, captureOnly=272, midRestock pure/mono/fatalDrop=**8/8/5**; capped 500-draw: rebindAbPack=2/370), npm 3354→**3388** (3388 pass / **0 fail**) — the S1 log-family repair closed the 13 wave-31 deferred log pins + the 49 C8 reds, wasm 99152 B / **554 exports** / 0 imports, boundaries stay **43**). MERGE-OWNED FIXES: **GameState F5 v12 CLOSED** (the lost-tail landing had shipped laws + accessors into the cpp but left the v2-era duplicate 9d77e0 accessors (redefinition -> family wasm build broke), the ABI pins at 11, and NO v12 test block — deduped + pins migrated + 4-test v12 block (accessor census / 21-law differential / self-check / gate-edge pins); suite 50/50) · **S5 default-clobber fix LANDED** (update-v110-bridgecapture §4: toRuntimeInputs no longer rides roomGridCells=15 / b3b7SparseReady=0 / midRestockOwner0x209=1 over the capture-emitted lanes — { ...captured, ...extraRuntime } clobbered live captures (b8Stash never armed, 48-lane B3B7 pack dead-gated, owner force-open); the session-level defaults still supply the MENU-CLOSED arm on the no-capture path; + wiring precedence test (B8 arms with 135 captured cells through the real toRuntimeInputs, owner-0 row @692, b3b7 honest-absent mono) + verifier row) · **C1 ambientVel silent-zero FIXED** (update-v109-whitelist12: f32 draws staged |0 into the u32 lanes @240/@244 -> module always 0; now full-width u32 with sentinel-bits-as-integers discrimination) · **S6 A/B pair rows FIXED** (the v107 deterministic rows were DEAD — flag_111 0x100 low-byte closed the gate + the mode!=0 row hosted the arm; replaced with mode=0 pure rows; pair-pure path now deterministic at any budget) · H-TRIM **DROPPED** (v1 shared-pool collision caught at case 284; single-pass corpus has no positive CPU delta; retention cap-busts) · idx 5/32 + idx 0 NO NEW PEEL (runtime registry PLAYERSCAN_RELEASE_CALLBACK_GLOBAL_VA 101 readers/0 writers + IsIdxLocalPlayer no-match-TRUE arm unpublishable under ABSENT discipline; verifier 821 @ 500 draws PASSED) · JSON **no row change** (S5 fix is default-construction, not layout — the 3 keys stay @200/@868/@692 in RUNTIME_INPUTS_LAYOUT; S6 replaced rows in place; verifier-only corpus). LANDINGS (wave): S1 log REPAIR (5 stranded mutant bodies restored; suite **175/175**; cpp sha = wave-28 certified) · S3/S3b app.js capture wiring (web/js/capture-wiring.js + installUpdateCapture block; probe B8 40→0 host edges under arms, accept-pure 120/120, restock coarse persists honestly) · S4 room-clear 0x7f83b0 census (no capture-feasible island; record stays NARROWED) · S5 bridge matrix (2136 lanes; category **c=0** — no pure-path lane the browser never feeds) · S6 record-4/walker quiesce · S8 residue (0 residual dup exports) · F-families: Lua **70** (6 39-band wrappers incl. GetMousePosition/ScreenToWorld/RegisterMod/GetItemConfig/GetFreeNearPosition/RenderScaledText; 218/218) · render-shell **68** (a1xxxx band closed; host pins) · ANM2 **60** (0x40c380 SSO ctor; 265/265) · SFX **39** (0xa2bcb0 list-clear seams + 0x92e7d0/0x92e7f0 wrappers; 154/154) · Room v80-CENSUS (0x7fec00 = Room::Update + 12 canonical cpp law repairs; 120/120; V80 candidates staged → wave-33) · HUD v37 (F7 v38 unit status: family files stayed at **37** — the 88 far-guarded span-B + 0x771800 re-audit edit did NOT survive the socket truncation; suite green at 37; re-ranked) · FE **32** (0x820aa0 GetDungeonRockIdx + 0x820ac0 TurnGold landed; 0x820c00 WorldToScreenPosition registered-but-unlanded → wave-33) · render slice **34** (0x8186ad 18th pack) · alloc **4** (0x40ccd0 string assign) · PI **52** (0x9c6110 pure island) · F14/F12 ABI sweep 12/12 GREEN · censors: C1 whitelist (5320 PASSED; ambientVel fixed here) · C2 0 · C3 docs (THIS row) · C4 zhl (3 exact hits incl. GameState::write_rerun 0x9d8190) · C5 ledger43 · C6 0/0 · C7 0 true unasserted · C8 npm10 RED baseline attributed (log 13 + room 35 + render-host-gl 1 — ALL resolved at this merge) · C9 PASS · C11 memory (H NOT merge-ready → dropped, stay at head) · C12 0 violators. RANK wave-33: 1) GameState leaves 0x9d8660/0x9d8820/0x9d8a20 (landed ABI 12 at this merge — next: the three unpinned reserve rows 0x9d88a0/0x9d8960/0x9d8af0), 2) Room v80 candidates roomUpdateEntitySkipGate + roomUpdateDietFlag (ABI 78), 3) FE 0x820c00 WorldToScreenPosition + the 820aa0/820ac0 band continuation, 4) HUD 0x771800 head re-audit + span-B far-guarded 0x7706e0 caller-guard laws (the F7 v38 unit — edits lost at wave-32, re-land), 5) Lua 0x898530 Explode + 0x8991f0..0x8995c0 band, 6) SFX 0xa2bd60 copy-pair + 0x92e900 grow seams, 7) render slice 0x818703 (19th pack) + 5th seam group, 8) ANM2 0x40c5b0 pair ctor + 0x40c300 band, 9) idx 15/42/23 leaves browser-feasibility (bridge now wired — re-audit the 5 unsamplable leaves), 10) verifier H re-eval on a multi-pass corpus |
| wave-28 (merge, 2026-08-19) | WAVE-28 MERGE (all 32 units closed; full chain green: slice 758→764 (S3 rtti_fold + accept-AL correction + resume-fold; S4 census trio; S2-flipped pins), verify-slice 5272 @ ABI 99 + abi96/97/98Lanes + NEW **abi99Lanes=89/89** + live-frame 984/984 B, runtime 14328→14684, events 980→984, **Update ABI 98→99**, npm 3209/3209, wasm 99133 B / 554 exports / 0 imports). LANDINGS: **record-0 0x84c170 tail close-out** (S1 — fresh four-edge census; ZHL anchors StatHUD::RecomputeStats 0x84ca00 / PlayerManager::FirstCollectibleOwner 0x9be080; fatal-fmt correction; IRREDUCIBLE middle 0x83b850 → boundary STAYS, abiV103); **record-16 B8 grid capture-feed FREEZE** (S2 — k-blob costs int32[448]/trails int16[448] exported scratch + ready room_b8_blob_ready @204 + count room_grid_cells @200; host fills BEFORE resume_room_update_prefix_b2 + copies back AFTER; the missing abiV95 key + abiV98 staged on idx 16); **entity-surface pack REBIND** (S3 — the v95 provisional rows @8040..8396 / @640 removed (collided with the committed b3b7 lanes / tcsStats region) and rebound to the tail: ready @14328 + 8x44 B capture blobs @14332..14684 + accept-pure proof event @980; the RTTI-block bl-fold law `isaac_game_update_slice_entity_surface_rtti_fold` + the walk_step accept-AL byte-gate correction land in-module (abiV106 on idx 5/32); ABI 99 commits the rebind); **record-15/42/23 lane-request census CLOSED** (S4 — every predicate read maps to a committed lane; zero new rows; capture-contract pins for the b3b7 38-lane pack @8008..9956 + tailPath @10056..10972 + clearPathGameMode0 @7888). FAMILY LANDINGS: Room **76** 0x7fa2a0 · Lua **66** 0x8b9a80 Fadein · PM **41** 0x7dbe70 B23 (band CLOSED) · HUD **34** 0x7716f0 · FE **28** 0x8206e0 · PGD **33** (PGDRO/PGDUNL/PGDADDIT; pure islands COMPLETE) · SFX **35** (a2b1 cluster; 17 rest bodies) · ANM2 **58** (string gates) · render slice **28** (a102e0 pack-13 @0x818497) · GameState **8** (pill reader 0x9cb620) · log **23** (base-class quartet; family COMPLETE) · render-shell **65** 0xa18460 · playerhud **39** 9bfc00 cluster · frame-opaque **61** 0x425360 · RTE **19** (band residue) · Exit frontier CLOSED (no re-land). CENSOR CLOSEOUTS: C2 overlap resolution (M1 stale-row rebind + M2 b3b7B5Type bytes 32→128) · C8 npm evidence (3150/3150 @ `--test-concurrency=2` via the mandatory `--` separator) · C10 bridge gap FIXED (captureUpdateLanes now emits the 9 transition lanes @14292..14324 from the game buffer — game0 = [Game+0] mode word, roomType8/asubroom flag via guestRead, ready voucher; collectHostEvents emits the 3 typed events @968/972/976 as host kinds) · C11 package.json cap (`decomp:verify-slice` now `--max-old-space-size=1024`) · C7 assertions re-census (the 77 model-mirror names all covered via the wasm-export surface — true violators **0**) · C5 ledger refresh. RANK: boundaries **46** (no removals this wave); next shortlist: bridge-end capture contracts (record-12 live seams, b3b7/tailPath/clearPath host captures) → idx 9 next (nothing peelable → ledger refresh) → family frontiers (Lua 0x8b9b20 Queue, render-shell 0xa184e0.., anm2 0x408170 census, sfx 0xa2b7f0 full peel, gamestate 0x9cc1a0, room 0x7fa7d0, hud 0x770ca0, frame-opaque 0x425b70/0x426980, playerhud 0x9bfd40). |
| wave-29 (merge, 2026-08-19) | WAVE-29 MERGE (all 32 units closed; full chain green: slice 764→769 (S1 record-12 live probes + S2/S3/S4 captures + S5 mid-restock + S6 8.2 close-out + the merge pin group), verify-slice 5272→**5276** @ ABI 99 with the NEW rebind guards (956110=127, 92f1c0=375, abPack=4, tcsStats=1, captureOnly=209, midRestock pure/mono/fatalDrop=4/8/1) + live-frame **988/988 B**, runtime 14684 stays, events **984→988** (the mid-restock typed drop `mid_restock_seed_zero_drop` @984 — module field + EVENTS_LAYOUT + JSON row + abiV107 evidence, ONE new event per the 5 CHECK), npm 3209→**3263**, wasm 99133→**99152 B** / 554 exports / 0 imports). MERGE-OWNED FIXES: **JSON single pass** (parse-checked, sha 6f5f9568...→acd2e39c...): C1 rebind of the 36 never-drawn lanes to the module-truth offsets (18 `frame_opaque_98dba0_956110_*` @6800..6868 — was stale 7108..7176; `opaque_0092f1c0_limit/field_14` confirmed @6872/6876; `frame_opaque_4212c0_ab_pack_*` x9 @7656..7688 — was 6872..6904; `tcs_stats_vec_*` x7 @7960..7984 — was 8356..8380; compiled-struct offsetof pins + wasm load-constants prove the truth — C1's README table shifted these by one slot, the module loads at 6872/6876/6880/6884 = limit/field14/foldReady/voiceCount and the A/B pack ends 7688 with b15_rain_ready @7692, so JSON/verifier/tests use the COMPILED offsets); dropped the 2 obsolete rows (state24ecc8ef990ListenerIds/Bits — no module fields; the 4 scalar listener rows + the @632/@636 event twins stay per C1 2); `engineAnm2LayerNames` bytes 4→256; **record idx 39 abiV107 key**; **verifier**: 36-lane whitelist + discriminating corpus draws (fixed rows drive the A/B pair advance/rewind, the 92f1c0 case-2 pure tail and the tcsStats growth sim), the 10 capture-only events pinned explicitly (roomTriggerOutput x4 + savestate x6; model emission census 209), S5 midRestock guards kept; **package.json**: `node --test --test-concurrency=2 tests/*.test.js` (flag BEFORE the glob — C8: node 24 ignores concurrency after a glob); **HUD v27 cStrict restoration** (F7's refactor dropped the `held_id==0 -> NON-strict` gate — PE 0x770c44 test/je 0x770c75; the JS mirror + the N1/N2/N3 mutation anchors + the differential pinned it; restored in `hud_post_update_pure_helpers.cpp`, wasm rebuilt, HUD suite 125/125 — a real mutant caught by the merge); **C12 export execution re-verify**: the 74 grep-unasserted exports (of 554) all EXECUTE on the shipped module (0 failures) + 12/12 targeted behavioral spot-checks; the 6fd7c0 ABI-v104 family is the C7 mirror class (camelCase model imports + differential), rtti_fold/walk_step/resume_* are directly asserted → **true unasserted = 0**. LANDINGS: bridge captures record-12 probes (S1) + record-15 B3B7 (S2, 42/42 wiring) + record-42 tailPath (S3) + record-23 mode (S4) + record-39 mid-restock (S5, typed drop + C3-fix) + 8.2 nonLane close-out (S6, 4 helpers) + JSON helpers 318; family landings: Lua **67** MusicManager band FULLY landed (8 wrappers) · render-shell **66** · room **77** (120/120) · frame-opaque **62** (26 laws) · sfx **36** (148/148) · hud **35** · fe **29** (GetBossVictoryJingle, 206/206) · GameState **9** giant (50 laws, 36/36) · ProcessInput 50 · PlayerHUD 39 (6-stranded-mutant restore, 89/89) · PM 41 · PGD 33 (4 census rows) · ANM2 boundary CLOSED (+2 drift fixes, 257/257) · render root slice **31** (3 packs, events 500B) · log 23 (F15 residue FIXED, 175/175) · PI frontier CLOSED · FO band-rest census CLOSED · whitelist PASS (C1) · json audit 0 mismatches (C2) · docs CLEAN (C3) · zhl 2 hits (C4) · ledger PASS (C5) · hardening 0/0 (C6) · assertions 459/459 (C7) · npm7 aborted (churn) · events PASS (C9) · liveframe CONFIRMED (C10) · memory PASS (C11) · export census (C12). RANK: next shortlist = **record-39 removal completion** (desc capture wiring + the typed field + full-capture theorem 46→45), **idx 5/32 entity-surface capture IMPLEMENTATION** (pack committed @14332..14684), **idx 16 B8 capture-feed bridge impl**, family frontiers (gamestate body C 0x9ce720 + 0x9d14xx reader, render-shell 0xa186f0.., sfx 0xb9c4dc dtor-forest census, room 0x7fa920, hud 0x771800 PE-split, anm2 0x40d240, lua next closure, FE 0x8207a0 SEH, C1 36-lane corpus draws post-rebind); wave-30 merge items G (verifier normalize delete @7158) + the npm flag-before-glob script (now fixed). |
| wave-27 (merge, 2026-08-19) | ABI-98 FREEZE-LIFT merge (PLAN update-v104-abi98-plan + lanes.json; all 32 units closed incl. F16b's PM B20; full chain green: npm test 3085→3150 (+65), slice 752→758 (+6 incl. the ABI v104 group + the staged-pack→committed flips), verify-slice 5272 @ ABI 98 + abi97Lanes=4/4 + **abi98Lanes=9/9** guard + live-frame 980/980 B, runtime 14292→14328, events 968→980, **Update ABI 97→98**). LANDINGS: **record-12 transition pack COMMITTED** — 9 runtime lanes `transition6fd7c0Game0/AltPathProbe/RouteProbe/PlayerLoopProbe/RoomType8/RoomSubroomFlag44/BlueRoomProbe/EnginePredProbe/Ready` @14292..14324 + the 3 typed events `frameEffect6fd7c0StageTransition/PlayerLoop/RoomDispatch` @968/972/976; the 6 capture-dependent laws LANDED as exports (`6fd7c0_stage_transition_reach`/`anim0xc_route`/`player_loop_reach`/`room_dispatch_reach`/`engine_room_arg`/`terminal_265c0_clear`); the record-12 k-block live behind the two-voucher ready gate (`transition6fd7c0Ready` @14324 AND `opaqueCall006fd7c0Ready` @13732 — either 0 keeps the pre-v104 residual byte-for-byte); blue_room_reach + engine_prefix_fires go LIVE (engine_room_arg consumes the BlueRoomProbe result, terminal_265c0_clear the EnginePredProbe); the **ApplyTerminals latent fix** in the model seam (the pre-existing `dual` arg bug — the family law reads dualGateNonzero — corrected in BOTH branches); record-4 bridge APPLY consumer (37-word plan, pack-sensitive snapshots); walker guestRead + capture group (browser lanes arm the walker probes); family landings: ANM2 hash grow/insert v57 (253/253), HUD 0x7717c0 width leaf v33 (missed-body class), Lua GetAmbientSoundVolume v64 + MusicManager Play/Crossfade v65 (lit-2), PM B19/B21/B22 v39 + B20 v40 (13-slot pick + RNG kernels), PGD sanitizer/unlock/count v32 (cluster census CLOSED; the merge re-pinned 2 stale wasm-ABI 31→32 pins in the v25n/v26 wasm differentials), SFX audio-wrapper v34, FE GetRoomConfigStage + 0x7eed10 v27 (189/189), render slice pack-12 v27 (64/64), render-shell 0xa182c0 v65 (host-rows), log engine-megablock lease transfer to Lua (ABI 22), GameState reader v6 + loops v7 (26/26); **room v70 leftover-M2 removal** at the merge (the sel==1 stage-scale arm `acc = summed * SCALE_Q_BITS` was found replaced by a stray mutant in room_pure_helpers.cpp — restored; the wasm lockstep + the v70 mutation discrimination suite green again); C8 npm5 evidence (3078/3085, 7 mid-run HUD-flip reds) + the S4 duplicate-chain incident + hardening verified; JSON single pass (append-only): abiVersion 97→98, events +3, runtime +9, translatedHelpers +6, record-12 abiV103; RANK.md live pins 98/14328/980/553 exports, next-shortlist none removal-shaped (record-12 live DONE · record-4 apply DONE · walker capture DONE → idx 9 TAIL-A feed → idx 16 B8 blob → entity-surface → b3b7/tailPath/clearPath → restock → menu census); merge record: **758/758 slice · 5272 @ ABI 98 · abi98Lanes=9/9 · npm 3150/3150 · wasm 98952 B, 0 imports / 553 exports · boundaries 46**, helpers 313, JSON rows runtime 2110 / events 258. |
| wave-25 (final, 2026-08-18) | Final wave — coordinator merge + full-chain green (npm test 2955→3015 (+60), slice 728→735 (+7 incl. 2 flipped merge pins), verify-slice 5272 @ ABI 96, events/runtime frozen at 956/14276, **boundaries 47→46 — third removal since v79**). BOUNDARY: record idx 1 `opaqueCall0092e300` **REMOVED at ABI v100** (W25-S1 eval: full-capture theorem — with every voucher live (ready / group_count∈[0,8] / packs / voice-blob / voice_count∈[0,32] / sound-group-walk-ready + v95 quiescence per `isaac_game_update_slice_0092e300_walk_exact`) the v88 walk applies in-module and `opaque_call_0092e300` NEVER fires; residual = typed device-stop `opaque0092e300Slot3c` @484 + voucher-absence gate misses only, byte-for-byte; device-stream census closed the 0xc79100 fold — zero image references, runtime-mutable, no static channel writer in .text, 4× per-voice re-reads; resolvedBoundaries → **5** with abiV100 evidence). RECORD-0 WALKER ISLANDS (W25-S2): 4 lane-free PURE islands landed `(void)`-lawed in the k6/k7 block — `hud_stat_walker_row_arm` (swap-gate 0x84cc9d/0x84cca0 + swap-back 0x84d659/0x84d65b: entry==A→1 / B→2 / else 0, FULL-DWORD, A first), `hud_stat_walker_reset_split` (walker-site RESET/TWEEN 0x84ccc8: SIGNED (frame264f8−B.f328)>1, COMPOSES `hud_stat_tail_recompute_mode`), `hud_stat_walker_swap_store` (0x84cca6 arm-1 entry:=B / 0x84d666 arm-2 entry:=A pre-seam / passthrough), `hud_stat_walker_probe1_arg` (0x84d188 `[Game+0x18300]` ROOM ptr word, FULL-DWORD identity) — 4 new exports (533→537), ABI stays 96, zero layout bytes; JSON record idx 0 gains `abiV101` evidence (S2 §6b draft, appended in ONE single-pass merge pass, every other byte identical; JSON sha 31183B4E… → **1DA0724D…** (46/5/96, abiV101 present, 2097 runtime rows @14276 / 252 events @956 / 299 translatedHelpers)). BRIDGE §5 (W25-S4): native-update-bridge capture lanes LANDED (record-10 manager blob, record-4 pack, record-22 pre-lane half, record-12 slots — READ-ONLY per tick, ready-gated, byte-for-byte residual when absent). RECORDS 3/7/11 proof-closed (all stay host with censuses). FAMILY LANDINGS (ABI bumps in bold): Room **74** door-create 0x7f9df0 (2 laws) · ANM2 **55** copy-ctor 0x407690 (plan/apply/layer-string laws + 40-site census; the 4-stranded R1-R4 residue sweep VERIFIED; 2 mid-merge restore strands fixed at the merge) · HUD **31** 0x771620 · PGD **30** PGDISP checksum/writer · game-state **3** serializer tree 0x9c84c0..0x9c8d20 (18 laws; the v3 serializer floor-law deterministic red now GREEN) · SFX **32** stream census · render-shell **62** fld trio + 0x407490 Lua-lease correction · Lua **61** IsPlaying · PM **35** B9 · FO **60** CompletionWidget::Render · FE certify-only · render slice **25** pack-11 · log **22** 0xa25440 getter. MEMORY: the 15 GB incident was an UNCAPPED verifier process (leak root); capped `--max-old-space-size=1024` run peaks at **949 MB RSS** (sampled), npm test runs at `--test-concurrency=2` (parent RSS 42.8 MB). WRITESOURCE HARDENING (C12 recommendation): room `withMutant` (30 defs) + all remaining anm2 single-shot writes routed through a module-level `writeSourceRetry` (120 attempts, `Math.min(25*(attempt+1),500)` backoff — the wave-23 render-shell budget) so a crashed restore can never strand a mutant again. |
| wave-20 (32 units, 2026-08-18) | 32 subagents (14 family landers + update-slice depth units + 12 censors; coordinator merged + full-chain green: npm test 2543→2618 (+75), slice 612→632 (+20), verify-slice 5268 @ ABI 95, Update ABI stays 95, boundary count stays 49). FAMILY LANDINGS (ABI bumps in bold): Room **69** 0x7f83b0 record-27 trigger-clear audio always-body · Exit **43** 0xa648b0 decision surface · render-shell **56** 0xa15570 is-pow2 gate (corrected the v48 "bare ret stub" misread; A15550_NEXT_VA 0xa15590→0xa15570) · frame-opaque **56** 0x424c40 pair-ctor seams · frame-opaque **57** 0x424cd0 0x40c7f0-twin ctor release-chain seams + FUN_00424d70 float-gate laws (22 + 17 exports; the twin's INLINE double IRREDUCIBLE release chain [test obj → virtual [[obj]+0xc] → test al → [0xc7163c] registry → callback(pair)] as a 3-input gate law; the 4 ucomiss/lahf/test-ah-0x44 ordered-equality gates with the NaN directions — update iff ANY pair ordered-NOT-equal, NaN never counts as NE, +0/-0 equal; cvttss2si + `add ax,ax` 16-bit low-half doubling pushed twice @0x424dde; float-field PE store order +0x14/+0x18/+0x10/+0x1c; 5 mutants) · frame-opaque **58** 0x424e60 indexed-dword getter (0x2bc + index*4 32-bit-wrap geometry; 2 callers) + 0x424e80 SEH string-teardown dtor tables (ZERO direct callers — the 0 is the pin; 5-teardown receiver/callee/call-site laws; callees 0x407f10/0x4087a0 new HOST pins + v26 0x40d040) + 0x424ef0 attach-loop SIGNED gate landed in the i64 sign-extend form (wasm32 compare-flip class: em++ unsigned-compare flip on 0xffffffff; 9 + 13 + 12 exports, 5 mutants) · Lua **56** vecband 0x85bfd0 pusher row 3 re-point · ProcessInput **49** 0x9bee80 · PlayerHUD **36** 0x858870 ordinal-suffix leaf (first pure island of the 0x8588xx band) · PM **29** 0x7db330 scale island · HUD **26** 0x7706e0 tail · room-transition **15** 0x4288f0/0x428910 getters · frame-effect **20** 6fdc10 player-body seams · PGD **26** PGDREADER2 + PGDIVER · SFX **27** 0xa17180 build decision layer · log **19** cross-family logger combine 0xa5a7a0. UPDATE-SLICE LAWS (ABI stays 95, exports-only): records 20/21 705ee0 call-ARG/order (frozen −1, ret-4, self-loading receiver; 8 call-sites censused) · record 21/22 ANM2::Load latch one-shot (+0x141 latch byte Game+0x1b97d; engine_anm2 latch/load-arm/latch-after-load laws) · record 46 SFX Play continuation mirrors (window_open/seed/voice_select/pick_offset/volume_clamped forwarders + composed continuation plan) · record-0 tail laws (hud_stat_tail_owner_mode 0x84c1a6 setne / fatal_empty 0x84c1cf / recompute_mode 0x84ca3f setg + typed event hudStatWalkFatalEmpty; sized-free 0xaef15c REFUTED for the tail closure — 3702 image-wide callers, 0 in the closure) · ANM2 wrapper trio exports at ABI 50 (0x40b1a0/0x40b1d0/0x40b200 by-reference plans; EXPORTS rows added by the coordinator merge). BOUNDARY-RELEVANT: record-1 (0x0092e300) 49→48 removal CLOSED OUT (vtable not static — runtime audio-backend stream); record-10 R2 true-probe interior stays blocked on records idx 12/4 + SFX-manager [0xc7169c] capture lanes (ABI-95 freeze); record-0 boundary stays (IRREDUCIBLE 0x83b850 middle + PlayerHUD loop). CENSORS: whitelist defect class-6 FIXED (25 rankDisplay*/hudMessageText* runtime-input keys were never named → lanes dead; builder whitelist at verify-game-update-slice.mjs ~5110; delivered keys 1858→1883) · build-list gaps CLOSED (26 defined-not-exported: 19 update + 4 frame-effect 6fe410 + 3 anm2 trio — EXPORTS rows merged) · record-1 WalkExact mirror leak FIXED (27 negative-capture tuples: `groupCount < 0` gate added to opaque0092e300WalkExact; module+law always returned 0) · stale-docs ledger refreshed (Families/Suite/differential rows + SFX frontier rerouted to family NOTES) · ABI census (model==header==tests, 18 families) · live-frame host inventory: **25 distinct per-frame kinds** (probe-live-120.mjs, all 120/120) · ANM2 gap scan: **6 open caller-bearing candidates** (0x408ef0/0x40cdc0/0x40cdd0/0x408f70/0x40c7c0/0x408fc0), all others landed/host/dead. NEXT FRONTIERS: ANM2 pure finds 0x40cdc0/0x40cdd0/0x40c7c0 (+ getter twins 0x408ef0/0x408f70/0x408fc0) · ProcessInput 0x9bfb20 · PM 0x7db360 · Lua 0x8b9490/0x8b95a0 · record idx 12 0x6fd7c0 FUN_00705ee0 nine-store interior (unlocks record-10 R2) · record-0 tween walker 0x84cc40. |
| wave-19 (16 units, 2026-08-17) | 16 subagents from RANK handoffs + family frontiers; chain green after merge (npm test 2527->2543; verify-slice 5268 ABI 95; Update ABI stays 95). LANDED: PM v28 0x7db2d0 advance island (map/delta/proceed/nibble-wrap flag store — 5 exports, 6 mutants, 5415-case differential; corrected stale v27 NOTES handoff) · process-input v48 0x9beba0 avg-player-position walk (64 exports incl. 42 accessors; 2 indirect host preds + 2 asserts + 3 cache posts as POST events; 7 mutants; superseded the v47 28-insn span estimate) · PlayerHUD v35 0x85af30 year/10000-decomp pack (mulhi 0xd1b71759/0x51eb851f magic, 9 exports; fixed oracle mulhi signed-shift bug) · Exit v42 0x8d3250 host-plan/GetLayer Cursor/list-destroy laws (9 exports, 9 mutants) · frame-opaque v55 0x499d60 atan2 wrapper PURE (CRT _CIatan2 x87 pinned primitive via IAT 0xb187f8; 179 callers law-coverable) + FUN_004248a0 13 scalar seams incl. the xorps-0 mulss loop1 quirk (19 exports, 7 mutants) · frame-opaque v56 0x424c40 pair-ctor seams (36 insns; 2x 0x40c4a0 pair attach HOST — alloc 0xa0f4c0 0x18 + sub-ctor 0x40cc10 + vtable 0xb1a6e0 + [0xc7163c] IRREDUCIBLE registry gate, exit-pinned 0x40c7f0 sibling pair ctor — 15 exports, 5 mutants; 7-dword zero table with the 0x24-BEFORE-0x20 PE store-order law + byte-gated 0xff no-store sentinel + return-this; 3 callers 0x6f190b/0x6f191a/0x6f2358 in the two big enclosing ctors; the 0x424d6a mid region NAMED FUN_00424d70 (0x424d70..0x424e55, B's caller 0x424de8) stays HOST; suite 76/76) · HUD v25 0x770a7e/0x770942 RNG-path preps (coordinator repaired the crashed landing: i64 sign-extend for the wasm32 signed-compare flip — third instance of the class after rain_frame + pm3; M2/M7 mutant anchors + v21/v22 export-count pins; suite 83/83) · record-9 listener: v94-negative IRREDUCIBLE CONFIRMED with final JSON assessment + pinned test (2 mutants) · record-1 L5/L4: removal candidate 49->48 CLOSED (SoundEffects.zhl has no +0x20/vtable; L1-L3 stay typed-host) · record-10 R3/R4/R1: all verified landed; JSON staleness found (record-10 events 544/548 vs model 556/560 + missing equalFlags entries — coordinator fixes) · SFX: Play-continuation loop assessed fully landed (docs L502 stale; next 0xa17180) · room: 0x7f072f confirmed landed; frontier 0x7f83b0 (record-27 always-audio, HOST) recorded · frame-effect 0x6fdc10: store census completed (467 insns / 32 calls / 40 data stores) + rule-11 landed-verification (agent died mid-edit; census + NOTES landed) · lua/pgd/anm2/log frontiers: rule-11 analysis yielded recorded nexts (lua 0x8b9270 vec-helper band; pgd 0x41d670 sibling reader; anm2 0x40c7f0/0x40d040/0x40c440 candidates; log 0xa5a7a0 path-combine host-classification audit with 46-call census). |
| wave-18 (64 units, 4 batches, 2026-08-17) | 64 subagents across all 18 Update records + 8 family bodies (user-directed escalation), all settled post-merge; boundary count 49 unchanged (mandate: leaves + proofs, not removals). Update records: R4 equal-flags probe walk in-module · R1 A/B pack + ANM2 by-reference (A2 arm CLOSED pure) · R32 956110 phone-home (6 exports) · R9 listener capture contract · R2 menu-update FULL census (real 645 insns; '7007B/1987insns' was a 3-fn window) · R8 menu-open census (IRREDUCIBLE host + 5 laws) · R11 re-decompile (false-noreturn PROVEN, frame-effect v19, 20 v3 exports) · R3 gate-4186c0 (skip-arm impossibility from the instruction stream) · R21 ANM2::Load depth (S4-starLayerMask doc-only: 0 reads in 135-fn closure) · R4 mode-3 HEAD host edge DROPPED · R43 death arg-prep · R44 PM3 quiet/NaN gates · R46 Play depth (monolithic -&gt; 3 typed leaves) · R47 STOP fold (+0x29 vs record-1 +0x08 pinned) · R39 mid-restock seed-zero drop PROVEN · R37 TailMid (28 exports) · R35 rain bijection sweep (B15 laws) · R34 ambient B13 · R16 B8 grid blob pure-replaces-host · R18 TriggerOutput CLOSED pure 3-phase ('TriggerOutput(9)' label WRONG — 3 sites arg 0/9/eax-10) · R6 notify (signed INT32_C imul promotion defect caught pre-ship) · R7 smart-handle STOP (Manager-global receiver proof) · R48 lua_pcallk (6 args @512..532; RANK 0xfff0b9d8 mislabel = LUA_REGISTRYINDEX) · R0 tail recompute IRREDUCIBLE re-proof + FCO 8 laws (RNG** NEVER read) · R1 L4 quiescence (LAST in-module leaf) · R5 entity surface ([[player+0x370]+0x14] accept predicates PURE + captured) · R23 ClearPath · R25 stats (7 laws + growth sim) · R29 awards-bit7 (head + 2 pure helpers; dead-result law deliberately unwired) · R31 TriggerClear (6 call-arg laws) · R22 RewindDepth (6 laws; reviewer found HIGH eligible-boolean + MEDIUM predicate-by-reference) · R20 SaveState (21 serialization laws) · R30 awards-greed · R26/R27 room-audio (xorshift32 rnd + comiss NaN) · R24 door-slots · R33 clear-doors (stale-snapshot guard) · R38/R40/R34 tail-mid (17+ exports) · R13-R19 B1..B11 fragments (B2 pool selection fully in-module; mode-4 SFX) · R36 water-b16 (0x7067c0 PURE). Family units: SFX v26 (SfxPreload Rule-12 + lost v25e bodies + SfxOpenBodies 13 exports) · ANM2 v50 (B090 + ReplaceSpritesheet; 0x80c0c census 80 vs '150') · room v65 FailPath/GetPlayer · frame-opaque v54 0x424580 band · log v18 (fdlock uint32/int32 fix) · exit v41 · PlayerHUD v34 0x856f50 · PM v27 · HUD v24 (RNG 0x7e9020 = SEPARATE xorshift32 LCG not MT). Coordinator wave-end repairs: 3 family Werror fixes, pickup bound 0x13 restore, search_seed restore, duplicate return, comment-anchor mutant fix, 8 model/probe-test repairs, and the **wave-18 layout merge** (layout.json -&gt; model lanes: STATE 524 / CONSTANTS 32 / RUNTIME 11592 / EVENTS 912; static size pins inline). Coordinator post-merge chain fixes: shipped-probe pointer/scratch materialization (walk_exact), FCO probe stale-scratch zero-pad + wrong row, rain readFrame FRAME_BASE + float seeds, tailmid/706c missing export list (17 tailmid_706c exports never added) + probe extras/argsFn for multi-arg laws, B1 resume constants param, verifier key Pending_09 + defaults + signed-view compares (b16/B8), **rain_frame -O3 whole-struct-store sink** (fatal path field-wise stores), and the **pm3 empty-arm dispatch miscompile** (-O2/-O3/-O1 rewrote the count==0+playing STOP arm into the MONOLITHIC heartbeat default; fixed by dispatch-inside-wire-arm restructure + shared emit_sfx_stop_fold helper + noinline split laws — case 495 differential). Update ABI 95 idempotent. Next frontiers per RANK: idx 10 R3 fatal-log split (0x40adde) + R1 A/B interior; idx 1 L5 pending-mask + L4 quiescent gate (removal-shaped via static-vtable-fold); idx 3/4/9 design-level blockers; 0x006fdc10 P1 re-census; family frontiers (lua 0x8a8fc0 chain, ANM2 0x40b090/0x40acd0, room 0x7f072f). |
| wave-18 (batch 2b, 2026-08-17) | update-slice unit R17PrefixB9B11 — record idx 17 `opaqueRoomUpdatePrefixB9B11` (v48 wire; span 0x00803ce5..0x00804110): B9 challenge-result laws + B10 fatal gate (typed-event) + B11 camera/manager decision laws landed (ABI converges at 95; 18 exports, all uint32_t params, 0 uint8_t): challenge_gate (result!=0 FULL-DWORD ∧ active LOW-BYTE ∧ age==4 ∧ type==0x11 FULL-DWORD ∧ !((flags>>3)&1) LOW-BYTE), free helper/path/ptr sub-laws, free heap lo/hi (u32 wrap + sbb borrow UNSIGNED), b10_enemies (SIGNED cmovg max(0,sum)), b10_fatal_needed (SIGNED ≤0 ∧ >0), mode_hooks (FULL type 0xb/0x11 ∧ LOW byte — PE reads Game+0x265e8, prior NOTES said 0x997a, capture contract unchanged), flag_11f4 / double_409030 (LOW), stage_1a (FULL 0x1a), age1 (LOW active ∧ age==1), tempfx flag/list/candidate/walk (LOW/FULL/FULL/stride-0x10). Typed-host bodies (bodies STAY host; 6 name-only event carriers Free/ModeHooks/Flag11f4/B10Fatal/Manager/Camera on the ready arm only, ready=0 keeps v48 monolith; coordinator merge assigns offsets 632..656). 3 mutants caught (mode-hooks type inversion; b10 clamp drop; stage-1a low-byte). Family suite 562/580 (18 peer mid-flight: stale layout pins + other units' wasm probes + 2 peer model-wire tests; MY v95 group 12/12 incl. shipped-wasm probe since the module was rebuilt at ABI 95 with all 18 exports); standalone wasm-vs-model wide probe 161/161 0 divergences; g++ -fsyntax-only clean. |
| wave-18 (batch 2a, 2026-08-16) | update-slice unit R0FCO9be080 — record idx 0 FCO `0x009be080` (exact ZHL `PlayerManager::FirstCollectibleOwner(CollectibleType, RNG**, bool)`, 174 direct rel32 callers): FRESH census — arg2 RNG** `[ebp+0xc]` NEVER READ, no CRT/genrand draw (the xorshift draw lives in sibling RandomCollectibleOwner 0x009be150) → NO RNG typed-host lands; pure decision subset landed in-module as 8 update-slice exports (twin_flag bool-3rd-arg gate 0x9be0a7..0x9be0c6 LOW byte + config + config[0xb8] bit31; list_empty FULL dword 0x9be0ce; slot_checkable FULL dword [p+0x2c]==0 0x9be0d9; has_collectible_hit LOW byte 0x9be0e9/0x9be105; twin_check_needed shared byte THEN ptr 0x9be0ed/0x9be0f9; walk_next iter+4 wrap 0x9be10d; walk_continue FULL dword 0x9be110; walk_owner composite over count×5-word probes {ptr,f2c,has1,twin,has2}); sparse `hud_stat_owner_byte` capture STAYS; record 0 count 49; Update ABI 94→95 (idempotent wave bump; zero events/runtime layout — coordinator merges); 3 suite-caught JS mutants + 1 C++ mutant caught by a standalone emscripten driver, all sha256-restored byte-identical; FCO suite groups 6/6 green (284-test family suite: 264 pass / 18 fail — all failures = stale pre-wave wasm probes + peers' mid-merge model states); wasm rebuild deferred to the coordinator's wave-end atomic merge (tree mid-merge under the layout STOP rule); next frontier: HasCollectible 0x7706e0 capture contract → in-module owner derivation at the StatHUD tail callsite 0x84c19b. |
| wave-18 (batch 1, 2026-08-16) | update-slice unit R2MenuUpdate — record idx 2 MenuGateUpdate 0x009b6840 (HOST, was UNASSESSED — head census 45 insns only): FULL body census (section-notes/update-v95-menu-update-census/NOTES.md). TRUE extent 0x9b6840..0x9b7180 (645 reachable insns, single ret 0x9b7180 SEH epilogue; the RANK "7007 B / 1987 insns" figure includes sibling functions 0x9b7190 [sole caller 0x6fc5b7] / 0x9b7650 exit-predicate / 0x9b7680 idx 8). Call forms: 46 direct E8 + 3 indirect (virtual [vt+0x1c]/[vt+0xc] + global fnptr [0xc7f60c]); ANM2-family heavy (0x40b430x9/0x408b90x5/0x40a5d0/0x40a380/0x40aaf0/0x408e00x2/0x409030x2/0x425130), FCO PlayerManager::FirstCollectibleOwner 0x9be080 (ZHL exact; 0x2b1, rng Game+0x1baa8, tag 1), room/player walks 0x6edfa0/0x90aeb0x2/0x90b100/0x907b60/0x9b7f90/0x417870x3, 16x fatal log 0xa112c0, 0xa288a0. LANDED 7 v95 zero-layout laws (ABI 95 idempotent; no layout/event edits — coordinator wave-18 STOP): 9b6840_mode_latch_needed (A2 FULL-DWORD !=2 store 1/2, WIRED at all 3 emit sites; 0x425130 verified not to touch the fields) / fco_probe_needed (A1 FULL-DWORD begin==end) / walk_count_needed (UNSIGNED !=0) / walk_entry_needed (FULL-DWORD 5 && 0x64) / tail_render_needed (A8 FULL-DWORD mode==1 + LOW-BYTE byte) / anim_layer_ok (SIGNED jg) / anim_id_ok (SIGNED js/jl). 4 mutants caught (low-byte vs FULL-DWORD x3, eq-flip), sha256-verified restores; 10/10 v95 tests green; boundary count 49 unchanged, record STAYS HOST (ANM2-heavy + FCO + Room walk). NEXT frontier: 0x009b7f90 sub-helper census (called by the body, inside the idx-8 window, separate function), then the record split via coordinator-merged captures. |
| wave-18 playerhud v34 (2026-08-16) | PlayerHUD 33→34: landed the first genuine pure island of the 0x856f50+ band — the v31 recorded next VA `0x00856f50` (FUN_00856e10 ret 4 @ 0x856f4a, int3 pad 0x856f4d..0x856f4f). Pure leaf gate (0x00856f50..0x00856f61, rets 0x856f5e/0x856f61): thiscall no-arg predicate returning 1 iff [this+8]==2 || [this+8]==0 — FULL-DWORD compares (cmp eax,2; je + test eax,eax; je), 0 E8 / 0 stores / 0 indirect; sole direct rel32 caller 0x0085a554. Census of the band: 0x856f70 SEH ctor (5 E8), 0x857280 ctor (7 E8 + 2 indirect), 0x857630 (2 E8), 0x8576c0 (2 E8 + 3 indirect), 0x857900 (4 E8), 0x857950 (7 E8 + indirect), 0x857b00 (4 E8 + 2 indirect), 0x857e40 (4 E8 + 6 indirect), 0x8583e0 `Leaderboard::get_leaderboard` zhl (5 E8) — all HOST; nothing else pure in the band. 5 exports (gate + field_off + va/ret_va/next_va), 4 mutants M71–M74 (dropped ==0 arm / dropped ==2 arm / low-byte mask 0x100 / next-VA drift) all killed; family suite 75/75 @ ABI 34. NEXT: 0x00856f70 SEH ctor host (blocked; MSVC SSO/vector machinery) — family frontier beyond the band is the 0x85a230-band census (v33 handoff). |
| wave-18 frame-opaque v54 (2026-08-16) | Family 53→54: `0x00424580` light-quad renderer NARROWED laws (0x424580..0x42489b ret; thiscall + 4 xmm floats + 4 stack floats arg0/min/max/r; 8 E8 = 4x atan2 wrapper 0x499d60 + 4x packed-ARGB unpack 0xa0f550 — both HOST leaves, unpack already landed in process_input v27; 2 callers 0x424a2f/0x424b3f both inside FUN_004248a0). Full band census incl. B = 0x4248a0..0x424c32 (SEH, 9 E8 + 2 indirect: smart-handle 0x40c7f0 IRREDUCIBLE-PROVEN v71, [0xc7163c] registry IRREDUCIBLE, virtual release, allocs/CRT; 1 caller 0x424de8). 13 exports: host_va/end_va/call_sites/atan_va/unpack_va/iteration_count (cvttss2si SIGNED bound + jle loop)/radius_ok (ordered dist²>=r²)/x_idx16 (LOW-16 movzx ax)/dy_f32 (y16 quantize)/angle_deg (×57.2958 + 360 iff deg<0 ordered, jbe NaN-safe)/angle_ok (min<=deg<=max ordered)/byte_scale (×255 LOW-BYTE)/cell_off ((stride16*y16+x16)*4). 4 mutants M1–M4 (iter +1 drop / full-dword x_idx16 / strict > radius / byte clamp) all killed, sha256-restored; end_va corrected 0x42459c→0x42489c post-mutant (ret @0x42489b). Family suite 69/69 @ ABI 54. NEXT: 0x499d60 atan2 wrapper (pure CRT math law unit) / 0x00424c40 band. |
| wave-12 (8+1 agents, 2026-08-16) | 9 units across 9 families (3 subagent crashes resumed — Room + Lua partial-edits completed INLINE: Lua v50 needed 6 test-fixture fixes after a mid-edit crash left v47 tests broken on site-count 21→25 + helper 12→14 boundaries; all verified independently + full-suite green, npm test 1855→1878, +23 tests): SFX v21 parent XML reader element-dispatch + sound-gate (4 exports, 5 mutants; 102/102) · process-input v44 0x009be9c0 PURE-removed (25 exports, 6 mutants; CORRECTED v43 handoff inversion: 0x184 membership je's to FOUND; 66/66) · room v62 0x7efa50 Room::Update-style body NARROWED (5 exports, 12 mutants; restock/bomb/grid/walk pure islands; 68/68) · log v17 the v1-era logger body finally re-peeled (3 laws + 4 VA pins, 5 mutants; caught D-LOG-15/16/17 folds; 137/137) · lua v50 install helpers 0x89fde0/0x89fd80 (completed the crashed partial INLINE: imports + site-count 21→25 + helper 12→14 + OOR boundaries; 123/123) · PGD v21 AddBoss exact-ZHL (31 exports, 6 mutants; 164/164) · frame-opaque v51 0x424310 SEH ctor (13 exports, 6 mutants; assigned 0x424380 was mid-instruction — re-derived true prologue; 60/60) · render-shell v51 0xa155f0 inverse-lerp NARROWED (12 exports, 5 mutants; divss no-guard → ±inf pinned; 87/87). No Update boundary count change (49). |
| wave-11 (9+1 agents, 2026-08-16) | 10 units across 10 families (3 subagent crashes resumed with salvaged notes; all verified independently + full-suite green, npm test 1833→1855, +22 tests): SFX v20 pool allocator arm-select + OOM slot (2 exports, 4 mutants; AUDIT found the v15 'OOM stays host' claim WRONG — cmovne is pure; 100/100) · process-input v43 0x009be990 PURE-removed (21 exports, 5 mutants; 65/65) · room v61 B15 bind TAIL dispatch + lerp (3 exports, 8 mutants; MILESTONE: the whole 0x7ef420 bind is now pure-covered for every branch — only host call sites remain; 64/64) · log v16 sibling dtor wrapper 0xa523e0 — the last unlanded sibling vtable slot (5 exports, 6 mutants; handoff 0xa83fd0 was stale, landed at v6; 129/129) · lua v49 FontRenderSettings wrappers 0x8a89e0 + 0x8a8a40 (30 exports, 5 mutants; handoff 0x8a8a00 corrected to true prologue 0x8a89e0; key 0xc82986; 123/123) · PGD v20 AddChallenge dispatcher (28 exports, 8 mutants; 0x2d-entry table pinned; 160/160) · frame-opaque v50 0x4242b0 SEH dispatch peel (10 exports, 5 mutants; assigned 0x421b3c was a mid-instruction artifact; 58/58) · render-shell v50 0xa155c0 clamped-lerp PURE (12 exports, 6 mutants; 2M-case pre-flight; 85/85) · record-0 tail AUDIT: already pure at v93 + fixed a real C++/PE divergence (probe2 clamp-zero gate full-word→low-byte per PE test al,al) + 3 discriminating test groups (slice 174→177). No Update boundary count change (49). |
| wave-10 (9+2 agents, 2026-08-16) | 11 units across 10 families (4 subagent crashes: 2 resumed with salvaged census, 1 partial-edit completed INLINE by the coordinator — log v15 missing test group with variant-enum correction, 1 negative-assessment inline — record-9 probes; all verified independently + full-suite green, npm test 1808→1833, +25 tests): SFX v19 attrs iter-plan (5 mutants; 98/98) · process-input v42 0x009be850 twin-accumulator (43 exports, 6 mutants; 64/64) · room v60 type-1000 dispatch head (5 exports, 6 mutants; b4-type-1000 overlap dismissed correctly; 62/62) · log v15 dtor-wrapper pair 0xa84030/0xa83fa0 (3 exports + 32B plan; 6-mutant plan; coordinator completed the crashed partial: v15 test group + variant-enum fix SINK=0/NEIGHBOR=1; 127/127) · lua v48 9 wrapper bodies + getArgVector helper (58 exports, 8 mutants; one shared arg-conduct template + per-site laws incl. Lerp box8 vtable 0xb753c8; 119/119) · frame-opaque v49 0x424220 mode dispatch (13 exports, 4 mutants; CASE_B reuses v43 423970/423950 shapes; 56/56) · render-shell v49 0xa15590 next-pow2 PURE (8 exports, 5 mutants; 0x80000000+ corner PE-unreachable, port completes with OR-accumulation→0 documented; 83/83) · PGD v19 sibling mutator pairs (90 exports, 8 mutants; shape-corrected: 2 wrapper/helper pairs not 4 bodies; 156/156) · ANM2 v48 float-min 0x40c780 (66 callers) + SSO sized-eq 0x40c790 (5 mutants; 0x409030/0x409100 leaves confirmed already-pure at v47; 175/175) · record idx 9 probe arms NEGATIVE inline (0xc57b18+0x74 listener fires before eligibility — v90 blocker; v89/v93 discriminating pins verified; Update ABI stays 93). No Update boundary count change (49). |
| wave-9 (10+2 agents, 2026-08-16) | 12 units across 11 families (6 subagent crashes resumed — 3 with salvaged census, 3 completed INLINE by the coordinator: PGD partial header-18, SFX v17 ABI pin, record-9 probes negative assessment; all verified independently + full-suite green, npm test 1780→1808, +28 tests): SFX v18 utf8-append helper 0x416dc0 + attrs leaf gate tables (7 exports, 4 mutants; XML cluster decision-complete; 96/96) · process-input v41 0x009be7f0 HasTemporaryEffect PURE (28 exports, 6 mutants; assigned 0x9be750 already landed — rule-12; 63/63) · room v59 chain 0x7ef611 + type-6 dispatch 0x7ef69a decisions (6 exports, 6 mutants; 60/60) · log v14 0xa52890 fd lock/unlock (31 exports, 6 mutants; IAT-verified LockFileEx/UnlockFileEx; pinned D-LOG-12/13/14 quirks; 125/125) · lua v47 NINE closure-install helpers 0x8a0400..0x89fee0 (3 shapes incl. new DUAL_IMM; 8 mutants; 115/115) · frame-opaque v47 0x423cc0 render body NARROWED (15 exports, 5 mutants) + v48 0x4240b0 icon-pos composer (8 exports, 4 mutants; assigned 0x956110 already landed; 53/53) · render-shell v48 0xa15550 clamp01 PURE-COMPLETE (9 exports, 4 mutants; NaN/+0.0 sign normalization; 81/81) · PGD v18 AddBestiaryKill 0x92acb0 exact-ZHL (70 exports, 6 mutants; byte table verified byte-for-byte; completed the crashed partial header-18 edit IN PLACE; 152/152) · record idx 9 probes NEGATIVE assessment (0xc57b18+0x74 listener fires before eligibility with real side effects — v90 blocker confirmed; v89/v93 discriminating pins verified standing; Update ABI stays 93; no boundary change). Crash-resilience matured: notes-first recovery recovered 3 units that would previously have been lost. No Update boundary count change (49). |
| wave-8 (10+2 agents, 2026-08-16) | 12 units across 11 families (3 subagent crashes resumed with salvaged census; 1 partial-edit completed by the coordinator — SFX v17 missing ABI pin; all verified independently + full-suite green, npm test 1742→1780, +38 tests; **Update ABI advanced 91→93**): SFX v17 text scanner 0x416e80 decision laws (skip/text/entity/numeric scans; coordinator completed the crashed partial edit — 1 ABI pin; 94/94) · process-input v39 0x009be670 PURE 3-site + 0x009be6b0 NARROWED 41-site owner/quality select (61/61) · room v58 0x7ef4a2..0x7ef5d5 store-pack relayout law (58/58; sxw sign-extend + qword-const-swap mutants caught) · log v13 0xa52880 flush slot (22 exports, 6 mutants; import-directory-verified fflush IAT 0xb1891c) · lua v46 3 install-helpers 0x8a0460/0x8a0500/0x8a05a0 (40 exports, 7 mutants; corrected census: 0x8a0500 is a SECOND dual; 114/114) · frame-opaque v46 wrapper + 0x423aa0 SEH body (22 exports, 6 mutants; 51/51) · render-shell v47 0xa153a0 vec18 grow (36 exports, 5 mutants; 1.5x growth via wrap, unsigned gates; 79/79) · PGD v17 GetBestiaryKillCount 0x92b100 + GetBestiaryEncounterCount 0x92b190 both exact-ZHL (60 exports, 6 mutants; corrected: kill entry 0x92b100 not 0x92b110 mid-instruction trap; 142/142) · **Update ABI v92** record idx 5 0x98dba0 walk EMPTY-vector arm NARROWED (pure-skip proof event; fatal log host; slice 167/167) · **Update ABI v93** record idx 9 0x8ef990 iterate-arm JOIN blob-gated pure (RTE v13 956780 gate imported in-module — cross-family wasm link; Play 0x92dc30 the sole residual host call on gate-closed; slice 174/174). Crash-resilience matured: 3 of 12 crashed (vs 8 in waves 5-6), all resumed from salvage. No Update boundary count change (49). |
| wave-7 (10+1 agents, 2026-08-16) | 11 units across 10 families (1 subagent crash resumed with salvaged census; all verified independently + full-suite green, npm test 1712→1742, +30 tests): SFX v16 children parse 0x416770 decision layer NARROWED (10 exports, 4 mutants; verified 0xc71640 byte 0xed default-arm-never-stores) · process-input v38 0x009be630 slot-search sibling PURE (21 exports, 6 mutants; corrected v37: 0x9be700 DEAD, live next 0x9be670) · room v57 sub-list copy law REPLACED a wrong untested v56 JS stub (real 8-dword zero-break/8-cap loop; 4 mutants; 56/56) · log v12 0x00a84060 neighbor dtor inner (24 exports, 8 mutants; IAT-verified _EOS_LobbyDetails_Release@4) · PM v25 0x007dd380 PURE leaf whole (21 callers, 5 mutants) · lua v45 0x8a80d0+ band: 3 wrapper bodies + 2 helper geometries (49 exports, 6 mutants; corrected v47: 0x8a82c0 is a TAIL of 0x8a8270) · frame-opaque v45 0x4239b0 state-initializer (7 exports, 7 mutants; converted a process-input-family HOST VA into in-module; 0x4257c0 confirmed already-landed interior of 0x4257b0) · render-shell v46 0xa152a0 vec18 push (22 exports, 5 mutants; harness fix: 648 exports crossed cmdline limit -> buildWasm now uses @exports.rsp response file) · PGD v16 0x92b070 GetBestiaryDeathCount exact-ZHL (29 exports, 6 mutants; corrected v15: 0x92b0c0 is mid-instruction, real entry 0x92b070; the named clear-order law was already landed at v15) · HUD v22 0x831fa1 mode-2 _Tree walk-ORDER plan (7 exports, 5 mutants; independent PE-trace interpreter as truth; node/gate/host-pair census plan with EVENT_CAP 128). Crash-resilience discipline held (notes-first + atomic edits): only 1 of 11 crashed this wave vs 8 in waves 5-6. No Update boundary count change (49). |
| wave-6 (10+2 agents, 2026-08-16) | 12 units across 12 families (3 subagent crashes resumed with salvaged census; 2 partial-edit crashes completed INLINE by the coordinator: room v56 + HUD v21). All verified independently + full-suite green, npm test 1683→1712, +29 tests: SFX v15 pool allocator 0x416510 + attrs parse 0x4165a0 pure laws (13 exports, 5 mutants) · room v56 0x007ef420 B15 bind type-5 pure laws INLINE (7 exports + 2 VA getters, 3 mutants; the bind config-loader FULL body stays host with 8 calls) · PM v24 0x007caad0 TryPreventDeath dispatch NARROWED (6 exports, 5 mutants; verified 0x7588a0 IMPURE host leaf) · lua v44 luaL_unref dtor 0x008a80b0 (17 exports, 6 mutants; handoff-correction: 0x8a80c0 is NOT a body, misaligned decode inside push 0xfff0b9d8) · frame-opaque v44 0x004254b0 Pass-A neighbor NARROWED (10 exports, 6 mutants; magicdiv/0x68 + cvttss2si verified) · render-shell v45 0x00a150d0 allocator-counter (38 exports; completed the crashed partial-edit ABI bump IN PLACE) · log v11 0x00a52410 inner dtor NARROWED (25 exports, 8 mutants; import-directory-verified fclose IAT 0xb1890c) · PGD v15 reader bestiary count-probe 0x92aea0 (39 exports, 6 mutants; float==+0.0 gate with row-exact NaN/-0.0) · HUD v21 0x008318a0 mode-2 _Tree successor-walk gates INLINE (5 exports, 3 mutants; completed the crashed partial-edit ABI 21 IN PLACE) · process-input v37 0x009be530 RCO-family sibling PURE (41 exports, 6 mutants). Wasm-build concurrency race found+fixed: npm test (parallel files) raced 3 builders over render_shell_pure_helpers.cpp (open-errno UNKNOWN); the v45 mutant test now retries the source write with backoff (1712/1712 parallel; no npm-script change). No Update boundary count change (49). |
| wave-5 (12+2 agents, 2026-08-16) | 14 units across 11 families (4 crashed mid-analysis and were resumed with salvaged census; all verified independently + full-suite green, npm test 1642→1683, +41 tests): SFX v14 nested XML parser `0x00416040` decision layer NARROWED (14 exports, 5 mutants) · process-input v36 `0x009be3e0` PlayerManager::RandomTrinketOwner exact-ZHL PURE islands (52 exports, 6 mutants; corrected v34 scale const 0x2f800000→verified 0x2f7ffffe in both) · room v55 B15 rain loop CF (11 exports, 6 mutants; fixed room B1 ShuffleRemainder JS SIGNED-%-oracle defect to UNSIGNED div) · log v10 fopen rb/wb/ab open helpers (41 exports, 5 mutants; PE asymmetry: write fopen ALWAYS fires, read null-path gated) · PM v23 `0x007caaa0` bit-test sibling PURE (4 exports, 4 mutants) · lua v43 3 `vector::at` template sites (15 exports, 5 mutants) · frame-opaque v43 5 PURE getters + NARROWED copy-ctor `0x425430` (35 exports, 9 mutants; corrected v42 handoff caller 0x65ecf2→0x6f365d) · render-shell v44 `0x00a14f90` list-walk/table-dispatch (27 exports, 5 mutants) · PGD v14 section-11 sub-block framing (30 exports, 6 mutants; dead-store count-word corrected) · HUD v19 `0x007cb6e0` count resolver (27 laws + plan, 4 mutants; signed magic 0xb60b60b7 verified 600k draws) + HUD v20 0x008318a0 mode-2/3 signed-advance island PURE-COMPLETE + rewrite gate NARROWED (44 exports, 5 mutants) · Update record idx 9 `0x8ef990` tests-only hardening (iterate arm FULLY HOST with 4 named blockers; v89 mutation artifact ADDED: 3 proven mutants + wide byte-gate drives; slice 159/159, ABI 91 unchanged). 3 of the 4 crashed agents were worker kernel exit-1 events with intact censuses — resumed units landed; the HUD v19 wasm-vs-JS 'failure' was a concurrent-build race (4.6M-iteration differential probe: zero divergence; full suite green). No Update boundary count change (49). |
| wave-5 frame-opaque v43 (2026-08-16) | Family 42→43: the tiny pure getter/gate band `0x00421800` `lea eax,[ecx+0x14]` (47 callers) / `0x00424530` `mov eax,ecx` identity (184) / `0x00423950` `mov eax,[ecx+0x1618]` id getter (3) / `0x00423960` `mov eax,[ecx+0x4b3d8]; cmp eax,[ecx+0x4b3dc]; setne al; ret` MP-vec nonempty — **LOW-BYTE overlay law** (eax = BEGIN with only al overlaid, NOT a zero-extended bool) (3) / `0x00423970` `mov eax,[ecx+0x378]; test; je 0xdeadbeef; mov eax,[eax+0xc]` RTTI subobject entry getter (2) — five FULLY PURE bodies, 239 combined direct E8 callers — plus NARROWED `0x00425430` SEH+GS copy-ctor (1 caller `0x6f365d`; the v42 handoff's "0x65ecf2" was 0x4253c0's caller — corrected): copy prologue+loop k=0..0x15 dword `[base+0x34k+4]=[base+0x34k]` (last dst 0x448), byte-zero store `[this+0x450]=dl(0)` (dl = post-countdown edx), 0xaef638 init-call contract (cdecl dest `this+0xc`, elem 0x34, count 0x15, cookie 0x425410) pure; calls 0xaef638 + 0x4265d0 stay host. 35 new exports; 9 mutants (offset, identity, setne, overlay, deadbeef, copy-bound, copy-shift, count, zero-off) all KILLED, restore byte-identical sha256. Independent PE-truth refs per body (a421800Ref/a424530Ref/a423960Ref/a423970Ref/a425430CopyRef) transcribed from the instruction stream; wasm memory copy differential (ref vs JS oracle vs wasm) on 0x113200. Family suite **48/48 pass, ABI 43**, zero wasm imports. NEXT VA `0x004254b0` (269-insn 0x4254b0..0x4257ab neighbor, 5 calls incl. family-pure 0x90abf0 + host 0xaef15c/0xaf08bd/0x4267f0×2 — NARROWABLE) · alternates `0x00421840` (1 call 0x423020) / `0x004239a0` (1 store). |
| wave-5 pgd v14 (2026-08-16) | Family 13→14: **PGDSEC11** — the writer's section-11 sub-block framing inside `0x009282e0` (before the v13 PGDTROW walks) + the reader gates in the section-11 handler `0x009276e1`. Header `[id=11][cap=total<<2][sub-blocks=4]` — the ROW TOTAL (count_word) is a DEAD STORE at `[ebp-0xc]` (0x928acd), never streamed; the third header dword is the sub-block count 4 (corrects the v1 generic "id/cap/count" doc for section 11). `total` = 32-bit wrap sum of the four bestiary count words in machine order `c0+(c1+(c2+c3))` (0x928aa6..0x928ac1); cap = total<<2 (0x928ad0). Per walk step s the writer streams tag (4,2,3,1 @ 0x928b4b/0x928c11/0x928cd4/0x928d97) then sub-block cap = count[walk-slot count-off]<<2 (0x928b6e..0x928dc6). Reader gates: UNSIGNED `jbe` subcount==0 whole-section skip; (tag-1)>3 UNSIGNED invalid (slot=tag-1, cross-law w/ v2); SIGNED `jle` cap>0 then rows=cap>>2 (UNSIGNED shr); sub-loop back UNSIGNED `jb`; row-loop back SIGNED `jl`. 30 new exports; 6 mutants (drop sum term, signed subcount gate, signed tag gate, unsigned cap gate, signed sub-loop, unsigned row-loop) all caught, restore byte-identical. |
| log v9 | Family 8→9: the classified sink/neighbor deleting-dtor ISLAND — `0x00a83fa0` log-sink deleting dtor (vtbl+0 of 0x00ba5184) + `0x00a84030` neighbor deleting dtor (no exact ZHL; both address-stable). One template, two instances: `test byte ptr [ebp+8], 1` delete-flag gate (LOW BYTE bit 0 — 0x2/0x102/0xfffffffe do NOT delete, 0x101/0x1ff do), return-this, `ret 4`. Deltas pinned, never homogenised: sink stores vtable 0xba5184 IN the wrapper (0xa83fa6) then calls inner 0xa52410, sized-delete 0x10, body 0x26 bytes; neighbor stores NO wrapper vtable (inner 0xa84060 stores 0xba5520 at 0xa84089), sized-delete 0x30, body 0x20 bytes. Inner bodies stay host (SEH+GS) — NARROWED not removed. **Primary-task verify**: the 0xa112c0 split is ALREADY fully asserted + mutation-covered (LA..LH + differentials at ABI 8, 3286 callsites) — no green-but-unasserted law found, no test added there. NEXT_VA `0x00a52610` (vtbl+0x28 fopen "wb"/"ab" open helper). 10 new exports; 2 mutants (delete gate `&0xff`-narrow, sink free-size fold) both caught, restore byte-identical. |
| log v12 (2026-08-16) | Family 11→12: the NEIGHBOR dtor inner body `0x00a84060` — completing the dtor-island pair (v11 peeled the sink inner `0x00a52410`). SEH+GS, 53 insns / 0x7d bytes, plain `ret`, this=ecx; 2 inbound transfers (wrapper `0xa84036` call + SEH funclet `0xb14783` tail-jump `lea ecx,[ebp-0x40]; jmp`), 0 raw dword refs. Laws (deltas vs the sink pinned, never homogenised): guest-free gate `test edx,edx` FULL-DWORD on the path cell +0x20 (0x100/0x1ff/0xffffffff fire, 0 skips); path cell NULLed only on the free arm (0xa840a8); **EOS release UNCONDITIONAL** — `push [esi+0x28]; call [0xb180a4]` (`_EOS_LobbyDetails_Release@4`, eossdk-win32-shipping) fires even when the lobby cell is 0 and receives the PRE-null value (the NULL store at 0xa840bb comes AFTER the call); lobby cell NULLed ALWAYS; vtable chain 0xba5520→0xba2218 with BOTH stores unconditional (no sink-style conditional mid arm); sub-object dtor 0x426980 at +0x10 ALWAYS and LAST; NO state-cell store in this body (the sink wrote [esi+4] twice); SEH handler 0xaf09f0 (differs from the sink's 0xb12420). Host stays: shared allocator 0xa648b0, EOS release IAT, sub-object dtor, SEH/GS frame. 24 new exports; 8 mutants. Next exact frontier: the vtbl+0x20 flush slot `0x00a52880` (`push [ecx+0xc]; call [0xb1891c] fflush; pop ecx; ret`, 0xb bytes, unconditional, verified in the v12 census). |
| log v13 (2026-08-16) | Family 12→13: the SIBLING vtbl+0x20 flush slot `0x00a52880` (`push [ecx+0xc]; call [0xb1891c] fflush; pop ecx; ret` — 0xb bytes / 4 insns / plain ret @ 0x00a5288a). The ONLY reach is the vtable slot dword at 0x00b9e960 (.rdata raw 0x79cf60): zero direct .text call/jmp/jcc/push/mov/imm refs, 1 raw occurrence, inbound 0 — NOT dead. Laws: FILE* field offset +0xc (FULL 32-bit cell); fflush IAT [0xb1891c] api-ms-win-crt-stdio-l1-1-0.dll!fflush verified from the PE import directory this unit (IAT RVA 0x71891c); the call is UNCONDITIONAL — no FILE* test / state / guard read of any kind, fires for every input incl. NULL (D-LOG-11 flush-all); ret width 0 with the push/pop balanced (0 callee stack cleanup); EAX untouched between call and ret so the slot returns fflush’s own result (host value, law only). The sink 0x00ba5184 vtbl+0x20 is the DIFFERENT nop 0x0040c200 (v6 law) — delta pinned. Census (hash-bound, v9 method re-run): whole-.text 2094319 insns / 469 undec; fflush IAT call sites 6 (0x8604ac, 0x9e74d8, 0xa52883, 0xa647b1, 0xa83fe2, 0xa84011). Host stays: the CRT fflush body. 22 new exports; 6 mutants (gate insert, field offset +0x8, IAT→fwrite, ret 4, ret-fold 0, vtbl slot +0x1c). Next exact frontier: `0x00a52890` (body right after the int3 pad — fd lock/unlock helper: _get_osfhandle 0xb188f0, kernel32 UnlockFileEx 0xb18254, _errno 0xb18898, EINVAL 0x16 error arm, first_ret 0xa52902, 26 direct callers). |
| frame-effect v18 | Family 17→18: the 6fd7c0 **H1 mode-4 SFX early arm** (0x006fd81c..0x006fd877) completion — the last unexported pure law was the SFXManager receiver `lea ecx,[esi+0x2a324]` = `[0xc7169c]+0x2a324` (shared by the mode-4 seed 0xbb and the anim-0xc special seed 0xd7 tails). New exports: `sfx_manager_off` (0x2a324) + `sfx_manager_receiver(base)` (32-bit wrap). **Oracle repairs pinned by new tests**: `SfxPlayArgs` loop 1→0 (machine `push 0` at 0x006fd84c; header `SFX_PLAY_LOOP = 0` — latent drift, previously untested), `Mode4SfxEarly`/`SfxRareHit` boolean→1/0. The whole arm now has behavioural coverage (previously zero): FULL-dword mode gate with wide 0x100/-1 edges, seeds 0xbb/0xd7, unsigned `%20` rare hit, closed-gate seed-keeping remap 0x25/0x12d, six-slot Play pack through memory (loop=0 pinned), base global 0xc7169c, receiver wrap (0xffffffff→0x2a323, 64 randomized), 6 mutants caught (receiver offset, loop, seed, modulus, ABI, model drift). 93/93 family tests. NEXT: sequential band parked HOST (0x0081fd60/0x00820170), 0x0081ee20 irreducible — no open frame-effect pure island remains in the 6fd7c0 body. |
| lua v42 | Family 41→42: the class-create template **BODY control flow** (`0x008a7e10 − 0x210·r`, 8 sites, first ret `0x8a8017`, `ret 8`, 0x207-byte body / 0x210 span) — one proven template + the v17 per-index laws (rule-1 shape). FULL-WORD arm gate on `lua_type(L,-1)` (`test eax,eax / jne ALREADY`; 0x100 IS ALREADY): CREATE arm = settop(-2) once + 3 iterations, builder A/B/C (`0x85d040`/`0x85d2c0`/`0x85d500`) with the `__gc` closure record (pushcclosure(gc,0) + absindex(-2) + pushstring("__gc") + rotate(-2,1) + rawset) on iterations 1–2 only, then pushvalue(-k)/rawsetp(REGISTRYINDEX, key rel −k) k=1..3 (PE order −1, −2, −3); ALREADY arm = `__class`/`__const` rawget pair + rotate(−3,1)/rotate(−2,1). Per-instance name VAs PE-verified for all 8 (EntityPtr 0xb701e4 … EntityRef 0xb70704, matches kClasses[]). 22 new exports; 5 mutants (low-byte arm gate, gc-record boundary `<`, store-rel off-by-one, builder index wrap, ret 8→4) all caught, restore byte-identical; suite 99→**102 pass**; wasm 0 imports. NEXT_VA `0x008a8020` (next body after the template band). |
| frame-opaque v41 | Family 40→41: `0x00421a20..0x00421b43` (ret 4) — the v40 `0x004218e0` constructor's **Fisher-Yates delegate-table shuffle** tail (93 insns, 0 resyncs; no exact ZHL). Per 0x3c-stride collection begin!=end gate, init PRNG (0x8fd3c0, seed [group+0x10]), shuffle for i=count..1: `j = PRNG_next % (esi+1)` (div ebx, **divisor descends count+1..2** — NOT the constant count) then swap 0x14-byte records (movups 16B + dword @+0x10); count<=0 jle skips (single record -> nothing to shuffle). **Count law transcription fix**: the PE `imul ecx; sar edx,3` operates on the **32-BIT high register**, NOT the 64-bit product — so the result is NOT `floor(span/0x14)-1` (that closed form shows 0/1 variance at large spans); transcribed exactly and pinned (C++/JS verified against a 2nd independent python transcription: 500k draws, 0 mismatch; +12 samples + 400-draw LCG wasm/JS/ref). `shuffle_prng_bound` stays **0x270** (MT init bound inside 0x8fd3c0, 624); the **0x271 at 0x421a64 is an unrelated local** — do not re-fix. Laws: `count` / `slot_off` (idx*0x14) / `word_to_index` (word%divisor, unsigned div, div0-guarded) / `needs_swap` (j!=i) / `collection_nonempty` / `collection_stride` (0x3c) / `record_size` (0x14) / `prng_{init,next,bound}_va` / `loop_va` / `end_va`. Host leaves: 0x8fd3c0/0x8fd410 PRNG, 0x421bf0, 0x8f4890 — NARROWED not removed. NEXT_VA `0x00421b50` (v30-landed). 12 new exports; 7 mutants (sar full-64, sign-fix, dec, add, div guard, swap polarity, slot_off-1) all caught. Two test-side arithmetic fixes (`0xfffffffc`→−1 not 0x0ccccccc; `0xffffffff%5`→0 not 4) — source was right. |
| frame-opaque v40 | Family 39→40: `0x004218e0` delegate-table bitmap constructor (no exact ZHL; 0x9f8-frame SEH+GS; this=ecx, arg id; 8 direct E8 callers 0x691c45..0x6f8579). Builds a 0x25-record **xorshift(3,13,7) hash chain** (this+0x28+i*0x3c) from the input id, fills the +0x8ac/+0x8bc 0x68-entry bitmap arrays (0x423090 BY REF), then transfers membership bits A→B (bts/btr). Laws: `hash_step` pure xorshift(3,13,7); `chain_value(id,i)` = hash^i(id) (ESI feedback, record[i]=i-th iterate); `bit_transfer_a/b`. Explains how the +0x8ac/+0x8bc pair from v30(421b50)/v38(421720)/v39(4217a0) is **populated** — the whole bitmap family now consistently typed across v30/v38/v39/v40. NEXT_VA `0x00421a20`. 13 new exports; 7 mutants (3 shifts, chain off-by-one/fold, transfer polarity, count) all caught; one test compare fixed (wasm i32 sign-extend). **Strategic note**: this session re-audited the Update frontier's top recommendation (record idx 3 no-eligible-entry skip) and RE-TRANSCRIBED it from the instruction stream — found NOT implementable (case 0 unconditionally calls `0x4186c0` BEFORE the walk; empty vector ≠ pure). Recorded as a negative addendum; frame-opaque band remains the verified frontier. |
| frame-opaque v39 | Family 38→39: `0x00421770` field getter `[this+0x26584]` (37 callers) + `0x00421780`/`0x00421790` Game ptr adders (`[0xc71678]+0x26630`/`+0x18910`, 8+4 callers) + `0x004217a0` 64-bit bitmap membership over `[this+0x26548]` (29 callers). Key law: the PE's `bts edx,eax` **WRAPS the bit index mod 32** — lo 0x20..0x3f lands on the SECOND dword at bit (lo−0x20); `lo_is_hi = (clamped&0x3f)>=0x20` (cmovae, 0x20 IS high); clamp id [0,0x34] signed; pair stride 8. **Paired-redundancy** finding pinned: on x86 `1<<(clamped&0x1f)` ≡ `1<<(clamped&0x3f)` (shl masks count mod 32 anyway), so the body's `&0x1f` is observably redundant — the mod-32 wrap is hardware, not the mask. 0x8ac/0x8bc bitmap contract now spans v30/v38/v39 consistently. NEXT_VA `0x004217f3`. 24 new exports; 7 mutants (clamp ×2, bit-seed, stride, lo_is_hi, A/B swap, game_add) all caught — one my-test row fixed (0x80000000 is signed-int32 negative → clamp 0); restore byte-identical. |
| frame-opaque v38 | Family 37→38: `0x00421720` bitset membership test (no exact ZHL; ret 4; this=ecx, id=[ebp+8]; 6 direct E8 callers 0x422b19..0x422cb8; **FULLY PURE** — zero calls, zero stores). Laws: `word_off` = (id>>5)*4 wrap-free; `bit_mask` = 1<<(id&0x1f); `membership` = either of the +0x8ac / +0x8bc dword arrays has the bit. Receiver layout **matches the v30 421b50 contract** (BITMAP_A_OFF 0x8ac / BITMAP_B_OFF 0x8bc — cross-family consistency). NEXT_VA `0x00421770` (one-liner getter `mov eax,[ecx+0x26584]; ret`). 10 new exports; 5 mutants (shift, mask, OR→AND, second-word drop, offset) all caught; two of my test-side math errors fixed (0xffffffff word index 0x1ffffffc; wasm i32 sign-extend coerced) — source was right. |
| frame-opaque v37 | Family 36→37: `0x00421620` std::string::assign(const char*) + `0x00421680` assign-with-growth core (no exact ZHL; 18 + 109 direct E8 callers). Family-owned string family user-assign half. Pure laws: max-cap gate `0x7fffffff - old_cap < len` (UNSIGNED strict < — equality does NOT throw) → throw `0x40ccc0`; SSO source decode cap<0x10 STRICT; request = existing+add; `growth_needed` request>0xf; `grow_cap` = request|0xf clamp 0x7fffffff then min 0x16 (host alloc `0x40cf00(cap+1)` + memcpy IAT `0xaf05df` ×2 + NUL@request). **PE-dead clause found + pinned**: the 0x16 cmovb floor at 0x4216c5 is UNREACHABLE (request|0xf ≥ 0x1f for every request>0xf) — reproduced, tested, not corrected. **Incident (self-inflicted, repaired)**: a patch script corrupted the model's v33–v36 function bodies; all 73 functions reconstructed from verified constants and the suite re-validated to 41/41 before the v37 group. NEXT_VA `0x00421720` (bitset membership test). 16 new exports; 7 mutants all caught; restore byte-identical. |
| frame-opaque v36 | Family 35→36: `0x004215e0` std::string copy-assign with **NO** self-alias guard (no exact ZHL; ret 8; this=ecx, src=[ebp+8], second stack arg DEAD; **1** direct E8 caller 0x68d320). The v35 move-assign twin minus the guard: UNCONDITIONAL host string-dtor `0x40d040(this)` + SSO block copy 0x18 B (16 movups + 8 movq) + steal-reset `[src+0x10]=0` / `[src+0x14]=0xf` / `byte[src]=0` (constants — pinned-absent `has_guard()`=0, `ret_args()`=8; the dtor byte-identical to v35's non-alias path). Rule-1 repeated-structure: one template, N bodies — the family's string-assign twin of record. NEXT_VA `0x00421618`. 16 new exports; 7 mutants (cap-echo, copy sizes ×2, guard flip, ret-args, size 0, cap 0xf) all caught, restore byte-identical. |
| frame-opaque v35 | Family 34→35: `0x004215a0` std::string move-assign with SELF-ALIAS guard (no exact ZHL; ret 4; this=ecx, src=[ebp+8]; 28 direct E8 callers 0x687b2d..0x689bcd resource-loader band). Typed plan over the shared host string-dtor `0x40d040` BY REFERENCE (1288 direct callers; exit/playerhud host leaf) — NARROWED not removed. Pure laws: self-alias FULL-dword equality (`cmp esi,edi; je`) → PURE no-op (no dtor, no copy, no reset); non-alias → host dtor + SSO block copy **0x18 B** (16 movups + 8 movq, data +0 / size +0x10 / cap +0x14 PE order, **SSO-UNCONDITIONAL** — the copy never branches on src cap) + source steal-reset `[src+0x10]=0` / `[src+0x14]=0xf` / `byte[src]=0` — size, cap and data byte are **CONSTANTS**, never echoing src (0xf when src_cap=0x100 pins it). NEXT_VA `0x004215e0`. 16 new exports; 7 mutants (low-byte alias — needed a 0x100-vs-0x000 edge added to the test after the first run, honest report; dtor inversion; cap-echo; copy sizes ×2; cap 0xf; size 0) all caught, restore byte-identical. |
| frame-opaque v34 | Family 33→34: `0x004214b0` set-overlay-animation-by-mode (no exact ZHL; ret 4; this=ecx; arg=mode; caller 0x592758 with receiver `[0xc71678]+0x1d2ec` — the Game manager subobject shared with 4212c0/421400; also 0x4afef5/0x4aff6e; **anchor correction**: v33 receipt's "next function 0x004214c0" is 0x10 mid-body — int3 pad 0x4214a1..0x4214af, real entry 0x4214b0). Typed plan over the ANM2 five-callee set BY REFERENCE (Load 0x40bd50 / LoadGraphics 0x40c000 / GetLayer 0x40b220 / SetOverlayFrame 0x40a5d0 / Rewind 0x40a1b0) — NARROWED not removed. Pure laws: `mode > 4` **UNSIGNED** ja gate → NO stores (both [this]=1 and [this+4]=mode gated); record = this + mode*0x38 (mode*7*8, u32 wrap); mode 2/3 → GetLayer(4) + `or [layer+0x8c],0x20` (OR store); SSO key decode cap `jb 0x10` STRICT (cap==0x10 is HEAP); `[anim+0x34]` FULL-dword cmp gate; have_eq = (cmp_result==0) (xor 0 / sbb+or nonzero); skip SetOverlay iff have_eq && key-flag LOW==0 && playing-flag LOW==0 (0x42155e/0x421563); SetOverlayFrame return **LOW-BYTE** (0x100 → not ran) → Rewind(anim+0x30) + `mov byte [anim+0x44],1` (assignment). NEXT_VA `0x004215a0`. 35 new exports; 7 mutants (signed/unsigned, +0x38 vs *0x38, full-word vs low-byte ×2, OR drop, jb vs <=, mode-3 drop) all caught, restore byte-identical. |
| render-shell v45 | Family 44→45: `0x00a150d0` render-shell class method — vtable slot **+0x14** of the `0xb81bac` class vtable (slots +0 a145e0 / +4 a149a0 / +0xc a14f90 pinned v39/v42/v44; a14f90's NEXT_METHOD_VA handoff). No exact ZHL; SEH+GS; ret; this=ecx. **Allocator-counter machinery**: Phase A per-element inner-dword tracked-free + collapse + retain-last; Phase B vec rewalk pushing `inner_count-1`. Pure laws (all memory host-owned — NARROWED, not removed): counter select `[0xc7de78]` FULL-dword ? +0x30 : `0xc7f618` (**+0x30 add WRAPS**: 0xffffffff→0x2f); 64-bit counter decrement `lo -= [ptr-4]` wrap + **sbb borrow = UNSIGNED strict <** + `hi -= borrow` (SAME template as a149a0 v42 — cross-pinned); FULL-dword inner-ptr gate (0x100 frees); `[elem+8] > 7` **SIGNED** free gate (0xffffffff does NOT); vec18 MAGIC div by 0x18 (re-derived ×3, C-truncation, = v42 law); inner dword count SAR; **42c920 grow gate = cmp/je EQUALITY** (x2 sites 0xa151cb/0xa15259, = a14c00 GROW_VA); retain-last load addr `begin+count*4-4`; push_value `inner_count-1` (empty → 0xffffffff); retain_end `begin+4`. Host leaves: free IAT `[0xb187dc]`, grow `0x42c920`, counter select load `[0xc7de78]`, all memory. 38 exports; 4 mutants (counter select, sbb polarity → `>=`, grow gate → `!=`, last-dword `-4` dropped) all caught, restore sha256 byte-identical. NEXT_VA `0x00a152a0` (vec18 push leaf, a14c00 PUSH_VA). |
| render-shell v43 | Family 42→43: `0x00a14c00` render-shell item add/update method (no exact ZHL; ret 0x10 @ 0xa14f0c; SEH+GS prologue; this=ecx; args name@[ebp+8] C-str, type@[ebp+0xc], data@[ebp+0x10], arg4@[ebp+0x14] NEVER read; 45 direct E8 callers 0x4095c3..0x9945c8). Typed plan (all memory host-owned — NARROWED, not removed). Pure laws: **type→size dispatch** = `cmp type,0x1c; ja` (UNSIGNED, exclusive) + 29-entry jump table `0xa14f10` (extracted as raw dwords: idx 0..7 err B, 8..0x1c → size 4/8/0xc/0x10/0x18/0x20/0x24/0x30/0x40, >0x1c err A; both errors → logger `0xa112c0` level 0x10 + size 0); error-band msg select = 0xb81b40 (type≤7) / 0xb81aec (type>0x1c) / 0 valid. **Template coverage**: SAME vec18 magic div (0x2aaaaaab signed C-trunc /0x18) + SAME 0x18-element inner layout (+0xc/+0x10/+0x14) as a149a0 v42 — cross-ABI pinned; v42's `[elem+8] > 7` SIGNED gate now explained ([elem+8] IS the type, only data types 8..0x1c own an inner array). 2 new laws; 7 mutants (mask, ≤ bounds ×2, ≥ bounds ×2, table sizes ×2) all caught, restore byte-identical. NEXT_VA `0x00a14f90` (next SEH body after the 29-dword table). |
| render-shell v42 | Family 41→42: `0x00a149a0` a14620-object virtual destructor body (no exact ZHL; ret; this=ecx; virtual dtor at vtable `0xb81bac` slot +4 = a145e0 CALL_HOST_VA_0). Typed plan (all memory host-owned — NARROWED, not removed). Pure laws: ptr-free FULL-dword gates at 5 sites (pair elems / slots / string / array base / inner dwords); tracked-free counter select `[0xc7de78]` FULL-dword ? +0x30 : `0xc7f618` (0x100 selects); 64-bit counter decrement `lo -= [ptr-4]` wrap + **sbb borrow = UNSIGNED strict <** + `hi -= borrow`; vec18 count = MAGIC SIGNED div by 0x18 (**C-truncation**, not floor — 0x2aaaaaab imul / sar 2 / shr 31 / add, wrap-u32 span, 1M-draw brute force 0 mismatches); `[elem+8] > 7` **SIGNED** gate (0x100 frees, 0xffffffff does NOT); inner dword count `(end-begin)>>2` **SAR**; `[this+4] &= ~1`; `[this+0x10]=0`. Host leaves: IAT free `[0xb187dc]`, `0x4149d0` vector destroy per 0x18 element. NEXT_VA `0x00a14bf0` (thunk `add ecx,0xc; jmp 0x4149d0`). 20 new exports; 7 mutants (low-byte ×2, borrow `<=`, unsigned gate, u32-div fold, `shr` not `sar`, bit1 clear) all caught, restore byte-identical. |
| render-shell v41 | Family 40→41: `0x00a147e0` vertex/pixel shader string wrapper (no exact ZHL; ret 0x10; SEH+GS prologue; this=ecx; [ebp+8]/[ebp+0xc] forwarded, [ebp+0x10]=vertex name, [ebp+0x14]=pixel name; 20 direct E8 callers 0x6802f6..0x6821cc). Typed plan (all memory host-owned — NARROWED, not removed). Pure laws: registry null FULL-dword gates (0xa1481f/0xa14885, 0x100 IS an object); per-object 4-slot vtable template ×2 (init +0xc / length +4 / fill +0x14 / release +0 — slot order pinned); dup size = len+1 (0xa1483b lea ecx,[esi+1]); NUL terminator at buf[len] — OFFSET = length, not len+1 (0xa1485b/0xa148c1); buf FULL-dword null gates; local 2-pair table [ebp-0x28] stride 8 {buf1,flag1,buf2,flag2} → arg2 of the nested in-family `0xa14620` (BY REFERENCE, v40); free buf1/buf2 (cl=1); return = nested `al` BYTE (0x100 → 0). Host leaves: registry `0xa178d0` (this `0xc37a10`), 4 vtable slots ×2, alloc `a0f4e0`, free `a648b0`, logger level 8 with msgs `0xb81b18` "Failed to load vertex shader" / `0xb81b84` "Failed to load pixel shader". NEXT_VA `0x00a149a0` (v39 a149a0 virtual dtor body). 21 new exports; 7 mutants (low-byte ×2, +1 fold, NUL-offset, slot swap, flag swap, full-word result) all caught, restore byte-identical. |
| render-shell v40 | Family 39→40: `0x00a14620` string/pair-table object init (no exact ZHL; ret 0xc; SEH+GS prologue; this=ecx; args src C-string @[ebp+8], pair table stride 8 @[ebp+0xc], arg2 @[ebp+0x10]). Typed plan (object outside the Game buffer — NARROWED, not removed). Pure laws: free-old FULL-dword gate (0xa1464a `[this+8]!=0` → host FREE a648b0 cl=1 + store 0); strdup size = len+1 with SECOND strlen RE-DERIVED for the IAT memcpy `[0xb1893c]` count (0xa14695..0xa146a9 — folded-mutant caught); pair-count scan = leading nonzero-flag run (pair0 FULL-dword gate 0xa146c5, step 0xa146d4 — 0x100 IS set); alloc size = count*8 as 64-bit with overflow SATURATION to 0xffffffff (seto/neg/or at 0xa146db — never folds low 32); fill loop UNSIGNED jb (0xa1477c, signed mutant fails at count 0x80000000); null pair ptr → slot dup 0; flag copy verbatim + `[this+4]|=1` on the true tail arm; vtable tail `[[this]]+8` gate call with arg2 → LOW-BYTE `test al,al` (0x100 → AL 0 → false arm) → `[[this]]+4` returns 0 / `[[this]]+0x28`(arg0) + flag bit returns 1. Host leaves: a648b0 FREE/ALLOC (cl 1/0), a0f4e0 operator-new wrapper, memcpy IAT, 3 vtable slots. NEXT_VA `0x00a147e0` (SEH sibling; calls 0xa14620 at 0xa148f6). 28 new exports; 7 mutants (low-byte, +1 fold, saturation fold, signed loop, flag bit, full-word tail) all caught, restore byte-identical. |
| v95 record 10 (R1) | VA `0x004212c0` flag_111 409030-PAIR **A/B subobject capture pack + ANM2 state-update plan BY REFERENCE** (ABI 94→95 converge; new runtime pack + 2 typed events). The live pair (A=+0x38 `Game+0x1d324`, B=+0x58 `Game+0x1d344`) is decided PURELY in-module over the `abPackReady`-gated pack (a/b `float10` = `[Game+0x1d334]/[0x1d354]` frame bits, a/b `layer104` = `[[sub]+0x104]` owner `_playbackSpeed`, a/b `frameBound` = `[data+0x30]` length via field4, a/b `loopFlag` = byte `[data+0x34]`) using the frame-opaque 409030/408d00 laws; `0x408d00` AdvancePosition / `0x40a1b0` Rewind fire as TYPED host events (`frameOpaque4212c0409030Advance`/`Rewind`; ANM2-family bodies mutate heap AnimationData outside the Game capture — record-1 v85/v88 typed-event precedent). Machine order preserved: ADVANCE_MID = `0x408d00(trunc_sum)` then `[state+0x10]=sum` UNTRUNCATED (PE 0x4090e1..0x4090e6; host stores `float10Out` after the advance); NO_LOOP = optional `0x408d00(length-1)` gated SIGNED `(length-1)>=trunc(floor(frame))` + ALWAYS low-byte `[state+0x14]=0` (PE 0x4090cf, 8-bit store — `flag4c` 0x1234→0x1200); REWIND = `0x40a1b0` (flag14 survives). Bound compare SIGNED `jl` (negative `trunc_sum` still advances; unsigned mutant rewinds). Pack ready=0 keeps the pre-v95 always-host pair arm; pair events publish ONLY when the whole record resolves pure (true-probe interior defers them). Plan scratch `isaac_game_update_slice_4212c0_anm2_plan_address` (2 entries {receiverOff, path, advanceTarget, float10Out, clearFlag14} + live/advance/rewind/pure) for host dispatch. Residual host: R2 true-probe interior (0x421343, needs records idx 12/4), 40add0 platform log (v94), R4 walk frontier (peer). |
| v91 record 10 | VA `0x004212c0` secondary==3 FALSE-PROBE arm. PE `0x42132f..0x42133b` `push 0xb1c00c; mov ecx,edi(A); call 0x40add0; test al,al; je 0x4213de`. The 0x40add0 probe walks the animation-name list at `[[A]+0x8c]/+0x90` vs the literal 0xb1c00c and returns a bit test of `[A+0x18]`. Pure-FALSE when the list is EMPTY (`frameOpaque40add0NeedsHost(field4!=0, listCount==0)==0` → al=0, no stores) or the host-resolved `matchIndex`/`bitfield18` show the bit clear (behind `probeResolved`); the false arm `0x4213de..0x4213ea` is a pure clear (flag4c low==0 → mode=0, secondary=0; else ret) with NO calls. Probe-TRUE (`0x421343` interior: manager stores + 92e430 + 6fd7c0 + 8318a0) stays host. `probeReady=0` keeps the pre-v91 always-host. Runtime 6732→6756 (ProbeReady/ProbeResolved/Add0Field4/ListCount/MatchIndex/Bitfield18). 8 slice tests incl. wide shapes + presence guard; mutants: JS resolved-guard, JS empty-list, C++ resolved-polarity (differential case 2815). NARROWED not removed, count stays 49. |
| v95 record 6 | VA `0x00746560` notify body (both Update sites) string-build DECISION laws landed as 6 pure exports (ABI 94→95 converge; no struct/event change): `746560_string_data_ptr` = UNSIGNED `cap>=0x10` cmovae SSO-vs-heap (widget arg selection @74660c/746617); `746560_string_found` = `_Mysize!=0` setne (widget 4th arg, Game+0x216ea store @840b91); `746560_free_plan` = the MSVC `_Tidy_deallocate` length/capacity gates (`cap<0x10` NONE, `cap+1<0x1000` SMALL, `ptr-*(ptr-4)-4 > 0x1f` LARGE operator delete — all UNSIGNED, wrap); `746260_walk_count` = SIGNED `trunc(span/28)` magic 0x92492493 sar4 (verified 300k spans; caught an INT32_C sign promotion via standalone wasm differential); `746260_index_matches` = `acc & ~clear & (1<<(index&31)) != 0`; `7460b0_gate_26584` = FULL-DWORD `[Game+0x26584]==0x2c`. String content builders (0x7460b0/0x746260 tails + 0x745ca0) + intern-alloc 0xa2c370 + ANM2 widget 0x840b00 stay typed-host. 5 mutants caught. Record NARROWED not removed (count stays 49). Next: capture contract for 0x7460b0 map-lookup inputs (Game+0x1bbd8 key-9/key-0x10 value gates) + 0x6f9400/0x6f95a0 predicate outputs. |
 59|| ANM2 v31 | Family 30→31: `0x0040ac30` `SetOverlayFrame(int)` (EXACT ZHL 18 B) + `0x0040ac50`. Both gate on `[this+0x54]` FULL-dword (0x100 IS set). Setter: gate closed → pure no-op (0 host); open → `cvtdq2ps(frame)` + host `0x408e00` advance on `this+0x50` (plan 32 B). Getter (ret @ 0x40ac5f): gate closed → −1; open → `cvttss2si([this+0x60])` truncation (plan 20 B, fully pure; reuses the v5 cvttss2si law). Mutants: low-byte gate, rounding, JS polarity — all killed. |
| ANM2 v32 | Family 31→32: `0x0040ac70` id-based anim-element lookup (address-stable) + `0x0040ac60` forwarder.
| ANM2 v47 | Family 46→47: **v33 found-path fold CORRECTED** on `0x0040ace0` extras name→index (ret 4 @ 0x40adcc; 69 direct callers). v33 returned the raw index on hit and early-outed when `[this+4]==0` — both folds. The machine's hit path `je 0x40ad6d` (strcmp==0) FALLS THROUGH into a stage-2 id-lookup continuation (0x40ad6d..0x40adcc): `[this+4]` re-read (null → log + RELOAD), count2 `[anim+0x24]`, elems2 `[anim+0x20]` stride 0x10, id_arr `[this+0xc]` stride 4, `[elem]==foundExtrasIndex` (ebx) && id_val≥0 SIGNED (js) && id_val<`[elem+0xc]` SIGNED (jl) → `result = id_val*0x54+[elem+8]` else 0; the stage-1 null log does NOT stop the walk. Stage-2 elems layout = the v32 0x40ac70 id-lookup contract byte-for-byte; the v34 "0x40ad6b duplicate of 0x40ac70" note corrected (0x40ad6d is the intra-function fall-through — 0 direct callers; 0x40ad6b itself is the `ret 4` immediate bytes). Plan 44→76 B (+anim2/count2/elems2/id_arr/id_val/elem_byte_offset/found2/stage2_log); END_VA 0x40ad61→0x40adcc. 7 mutants (raw-index fold reinsert, stride 0x8, js gate dropped, limit ≤, id_arr from anim, null early-out reinsert, count2 gate dropped) all killed. |
| ANM2 v46 | Family 45→46: `0x0040c6f0` hash-table probe (ret; no receiver). `idx = (key-1) & (end-1)` UNSIGNED (key=`0xc78db8`, end=`[0xc78dbc]+[0xc78dc0]`); `result = [base + idx*4]` (base=`0xc78db4`). The four globals are **RUNTIME inputs** (v82 flags precedent; writer census v46: 0xc78dbc has 4 direct writers 0x78c2b6/0x78c65d/0x78c72e/0x78d3a6, others register-held — none constant). Pure. Mutants: mask `&end`, key-1 dropped — killed. |
| ANM2 v45 | Family 44→45: `0x0040ca70` ORDERED memcmp (ret; ecx=a, edx=b, n=[ebp+8]). dword loop while n>=4 then byte tail; returns ORDER of the first differing byte, UNSIGNED (sbb/or → a<b −1, a>b +1), 0 equal. Distinct from v38's sized-eq 0x40cae0 (1/0). The trailing push `0xb1a6c8`/call `[0xb184d4]`/int3 after the rets is DEAD (no branch reaches it) — recorded, not modeled. Mutants: order inverted, off-by-one `i<=n` (killed by the byte-n-differs edge) — killed. |
| ANM2 v44 | Family 43→44: `0x0040d0e0` float-vector ctor (ret 0x10 = 4 float args). Pure layout pin: `[this+0x10..0x1c]`=0, arg0→`+0x0c`, arg1→`+0x20`, arg2→`+0x24`, arg3 REPLICATED to `+0x00/+0x04/+0x08/+0x28` (the PE's own design, reproduced verbatim). No calls/branches; NaN bits pass through. Mutants: arg swap at +0x24, replicate dropped at +0x28 — killed. |
| ANM2 v43 | Family 42→43: `0x0040c340` SSO C-string ctor (ret 4; `std::string(const char*)`). Zero-init SSO (`[this]=0`, size 0, cap 0xf), **pure inline strlen** (the length decode is the translated arm), then host STRING_ASSIGN `0x40ccd0(this, cstr, len)` continuation (pureComplete=0; assign stays host per v7). Same narrowing class as v42. Mutants: strlen `+=2`, host flag dropped — killed. |
| ANM2 v42 | Family 41→42: `0x0040c310` self-assign-guarded string assign (ret 4; ANM2 operator=). `cmp this,src; je` → **self-alias is a pure no-op** (host event DROPPED); else src std::string SSO decode (cap `[src+0x14]` jb 0x10 inline : heap `[src]`, size `[src+0x10]`) → host STRING_ASSIGN `0x40ccd0` continuation (pureComplete=0 on that arm, its assign is a host leaf). A narrowing in the v65-family class: pure gate + host continuation. Mutants: alias `==`→`!=`, SSO `<=` boundary (killed by cap==0x10 src edge) — killed. |
| ANM2 v41 | Family 40→41: `0x0040bbf0` 0x6c-byte struct copy (ret 4; this=ecx=dest, [ebp+8]=src). Field-by-field in PE order: dword pairs +0x00..+0x28, byte +0x2c, movups +0x30 and +0x40 (16 B each), movq +0x50 (8 B), dwords +0x58/+0x5c, byte +0x60, dwords +0x64/+0x68. PADDING GAPS (0x2d..0x2f, 0x61..0x63) are NOT written by the PE — pinned by test. Truly pure; the layout IS the contract (pins the ANM2 element struct). Mutants: skip-field-0x58, movups-start-shift — killed. |
| ANM2 v40 | Family 39→40: `0x0040b520` +0x84/+0x88 name→index (ret 4). Same sub-array as v39: count `[this+0x88]` (SIGNED `jle`/`jl`) / base `[this+0x84]` / stride **0x18** — elements are INLINE 24-byte structs (NOT pointer slots like the v37/v38 layer array); name SSO at elem+0, cap elem+0x14. 2-byte strcmp vs the arg C-string. Match → index; no match / count<=0 → **−1** (v37's layer walk returns 0 — different convention). Truly pure. Mutants: stride +1, miss→0 — killed; jle→==0 proven observably-equivalent (guard fires before the loop for any negative count; INT_MIN edge pins the guard). |
| ANM2 v39 | Family 38→39: `0x0040b4d0` +0x84/+0x88 bounded getter (ret 4). count `[this+0x88]` / base `[this+0x84]` / stride 0xc (`lea [edi+edi*2]`; `lea [eax+ecx*4]` = index*12). index<0 (js) OR index>=count (SIGNED jl) → side-effect log 0xa112c0(0x10, 0xb1a6a8 `"%s: No null with Id %d\n"`, this-name SSO, index); the RESULT is computed UNCONDITIONALLY (the log does not skip the return): base + index*0xc. this-name SSO cap `[this+0x14]`. Same +7c/+80-layer-array family pattern but a NEW sub-array layout (base/count at +0x84/+0x88). Mutants: unsigned bounds, stride +1, log polarity — all killed. |
| ANM2 v38 | Family 37→38: `0x0040b310` layer name→slot **SIZED** eq (ret 4, SEH). count `[this+0x80]` / base `[this+0x7c]` / stride 0xa0; arg = std::string* (size +0x10 / cap +0x14 / chars +0). Each slot holds a POINTER to the element; name std::string at elem+8, SSO cap elem+0x1c (`jb` strict < 0x10). Compare = the `0x40cae0` helper: size EQUAL **and** byte-equal → 1; first equal slot → `base + i*0xa0` (SLOT address); none / count==0 → 0; null slots are the empty string. Heap locals (cap>=0x10) take an MSVC sized-free `0xaef15c` + block validation (`ja` → noreturn IAT `0xb18894`) — both platform primitives, no game-logic edge (`local_heap_count` reports the transient count). Differs from v37: length-bounded compare (not strcmp) + slot-address return + std::string arg. Mutants: size-check dropped, signed loop (killed by count=UINT_MAX), arg SSO boundary `>` (killed), local SSO boundary `>` (killed by cap==0x10 edge) — all killed. |
| ANM2 v37 | Family 36→37: `0x0040b44a` layer-array name→index (ret 4). count `[this+0x80]` / base `[this+0x7c]` / stride 0xa0; each slot holds a POINTER to the element; name at elem+8 (SSO cap elem+0x1c, jb strict < 0x10 for inline); match → `base + index*0xa0` (element address, like v36); count 0 / miss → 0. Truly pure (no log). Model count field kept SIGNED (plan int32) while loop unsigned (PE 3b f3; 72 jb). The heap string lives at `[elem+8]`. Mutants: cap <= (killed by cap==0x10), signed loop (killed by count=UINT_MAX), stride +1, match polarity — all killed. |
| ANM2 v36 | Family 35→36: `0x0040b23a` bounds-checked element getter (SEH, ret 4). arg index vs `[this+0x80]` SIGNED count (js / jge); out of range → log 0xa112c0(0x10, 0xb1a68c) + 0; in range → `[this+0x7c] + index*0xa0` (lea [esi+esi*4]; shl 5; the family LAYER_STATE_STRIDE). Plan 48 B, pure except range log. The 0x40b1d0/0x40b200 wrappers assessed as 0x40add0-call duplicates. Mutants: unsigned count, stride +1, log polarity — all killed. |
| ANM2 v35 | Family 34→35: `0x0040b0c0` three-stage index lookup (ret 0xc — args dataName, extraName, id). Stage 1: AD name walk `0x0040bcd0` BY REFERENCE (base `[this+0x74]`, count `[this+0x78]`, stride 0x13c) → data block; miss → 0. Stage 2: extras walk count `[this+0x88]`/list `[this+0x84]` (SSO stride 0x18) vs extraName; miss → fail log 0xa112c0(1, 0xb1a650). Stage 3: inner id-match on data: elems `[data+0x20]` stride 0x10, count `[data+0x24]`; `[elem]==id` with signed bounds → `id*0x54+[elem+8]`. Plan 60 B, pure except fail log. The 0x40b000/0x40b030/0x40b060/0x40b090 wrappers assessed as thin 0x40add0-call duplicates. Mutants: AD walk dropped, fail-log polarity, stage-3 upper bound — all killed. |
| ANM2 v34 | Family 33→34: `0x0040af10` GetAnimation two-stage (entry after 3 int3 pad at 0x40af0d). Stage 1 name→index: `[this+4]==0` log; data=`[this]`; count `[data+0x90]`; list `[data+0x8c]` (SSO stride 0x18); miss → −1 (unlike v33's 0). Stage 2 inner id-match + min-delta scan: inner=`[this+4]` re-read; elems `[inner+0x28]` **8-byte stride (sib scale 8 — `39 1c c8`)**, count `[inner+0x2c]`; frameInt=cvttss2si(`[this+0x10]`); match [elems+i*8]==outer → payload [elems+i*8+4]; keep smallest POSITIVE delta's payload (esi min-scan, starts −1), else −1. Plan 60 B, pure except null-log. The strip 0x40ad6b/0x40add0/0x40ae70 assessed as duplicates of 0x40ac70 + the frame-opaque 0x40add0 walk (recorded). Mutants: stride 8→4, min→max, delta<=0→<0 — all killed. |
| ANM2 v33 | Family 32→33: `0x0040ace0` extras-array name→index walk (entry after 5 int3 pad at 0x40acdb; the v32 notes' next VA corrected to 0x40ace0). `[this+4]==0` → log 0xa112c0("AnimationData is NULL") + straight to `[[this]+0x88]` (NO reload — differs from 0x40ac70; defect reproduced); walk base `[this]`, count `[[this]+0x88]`, list `[[this]+0x84]` (stride 0x18); SSO string (cap `[elem+0x14]`<0x10 inline else heap `[elem]`) strcmp vs name; equal → RAW index (no stride multiply); miss/count0 → 0. Plan 44 B, pure except null-log (logger split). Mutants: SSO polarity, index→stride, null-log polarity — all killed. Next: 0x40ad6b / 0x40add0. | Lookup: `[this+4]==0` → log 0xa112c0("AnimationData is NULL") + RELOAD (defect reproduced); count `[anim+0x24]`; loop idArr `[this+0xc]` (stride 4) + elems `[anim+0x20]` (stride 0x10): match `[elem]==id` && idVal>=0 (signed js) && idVal<`[elem+0xc]` (signed jge) → `idVal*0x54+[elem+8]`; miss → 0. Plan 56 B, pure except null-log (logger split). Forwarder: `push 0; add ecx,0x50; call 0x40882e; ret` (plan 24 B, always 1 host call). Mutants: unsigned limit, id-match dropped, reload dropped — all killed. |
| v90 record 10 | VA `0x004212c0` (`opaqueCall004212c0`) flag_111 409030-PAIR gate. PE `0x421300..0x421316` `cmp byte [esi+0x111],0; lea edi,[esi+0x38]; call 0x409030; lea ecx,[esi+0x58]; call 0x409030` — each 409030 is a PURE no-op (`mov edi,[esi+4]; test edi,edi; je 0x4090eb; cmp byte [esi+0x14],0; je 0x4090eb` → store-free epilogue) when field4==0 or flag14 low byte==0. A=+0x38 gate reads the captured `field3c`/`flag4c`; B=+0x58 gate reads runtime `field5c`/`flag6c` (Game+0x1d2ec+0x5c/+0x6c = Game+0x1d348/0x1d358) behind `pairReady` (ready=0 keeps the pre-v90 always-host). Both gates no-op → flag_111 folds to 0 so the secondary==3 arm (0x42131b) still applies its pure clear; one live gate keeps host (defect class 1: the live call stores into the subobject; state apply must not fold post-call bytes). Runtime 6720→6732. Events unchanged. `mode==1` clear (0x4212d4..0x4212fa) still runs before the pair on the pure path. 7 slice tests incl. wide 0x100 shapes; NARROWED not removed, count stays 49. |
| v89 record 9 | VA `0x008ef990` (`State24ecc_Update`, `opaqueState24eccUpdate`) state==2 arm translated PURE; FIXES a v59 fold defect that shipped ~30 versions green. PE `0x8ef99e cmp [edi],1 / jne 0x8efdec` is a TWO-way gate: 0x8efdec `cmp eax,2 / jne exit`, and state==2 decrements `mode24ed8` (`lea eax,[ecx-1]`, 32-bit wrap) then `test ecx,ecx / jg skip` clears `state24ecc` when the PRE value <= 0. The v59 fold treated every state!=1 as a no-op and both oracle+C++ mirrored the miss — the decrement of a captured field (`mode24ed8` state @56 / binary `Game+0x24ed8`) was silently dropped; corpus only proved host/skip. Now in-module: state==2 → `mode24ed8 -= 1` (wrap) + `state24ecc=0` when pre<=0; ready==0 keeps the always-host fallback (host owns the arm); state==1 ready-byte==0 stays the v59 no-op; state>2 no-op. Mutants killed: `pre<=0`→`pre<0`, drop-decrement, `st24===2`→`3`. Fixed corpus +5 rows (mode24ed8 8/1/0/-1/0x80000000); guards state2≥1, changed≥1. Remaining host: state==1 ready-byte!=0 full body (6 vtable calls `[0xc57b18]+0x74` modes 0xe/0xf/0x16/0x17/0x14/0x15, manager walks `0x9b9480`/`0x9b9310`, SFXManager::Play `0x92dc30` by reference, `0x425ac0`/`0x956780`/`0x90a670`/`0x90b0e0`, dtors `0x409100` x2, `0x9bfa70`/`0xa205a0`/`0x9bac00`/`0x9bfb20`/`0x9b9450`). NARROWED not removed — count stays 49. v90 ASSESSMENT (2026-08-14): `0xc57b18` = global LISTENER REGISTRY singleton — `[0xc57b18]=0xb827f4` .rdata vtbl (~40 slots `0xa1f950..0xa212c0`); gate `0xa205a0` = vtbl+0x28 find wrapper; dispatch slot vtbl+0x74 = `0xa20fb0` = locked container walk (`ret 0x14`, 8 indirect calls, iterates 8-byte (elem,fn) pairs `[obj+8..obj+0xc]`, per-element `[[elem]+0x34](mode)` via the 0xa209e0 callback; "Invalid mutex object specified" log on null sub-object; `[0xc7e814]` hook). The six arms' accept results are per-element VIRTUAL Notify(mode) — host-only, so the state==1 body is NOT blob-gateable; IRREDUCIBLE in the current surface. Blocker for idx 9 depth: the listener/element class surface. Manager-contract evidence recovered (2026-08-14, screen survey — the `[0xc71678]+0x1baa8` registry's predicate family, all pure / 0 E8 except noted): 0x9b9480 = qualifying-count; 0x9b9310(idx) = k-th qualifying entry (shared filter: `e=[p+0x1e68]`, qualify iff `e!=0 && [e+0x161c]!=-1 && [e+0x161c]<[p+0x161c] && e!=p`); 0x9b9450(ptr) = index-of or -1; 0x9bac00(id) = entry with `[e+0x1618]==id` or 0; 0x9bfa70 = active-count (complement filter + `[p+0x20a9]!=0`, disjoint from qualifying — `qualify+active<=count` invariant); 0x9bfb20 has 1 E8 (0x7d93b0) — not pure, stays host. Registry container: `[ecx]`..`[ecx+4]` = 4-byte entry-pointer array; entry fields 0x1618/0x161c/0x1e68/0x20a9/0x2c/0x3bc. |
| v88 record 1 | VA `0x0092e300` SFX sound-group walk split: `soundGroupWalkReady` @6716 (runtime 6716→6720). In-module outer 0x1b8 group walk + inner 0x38 voice walk via the frozen SFX helper set by reference; [entry+0x29] pending-byte stores + pending-mask published to scratch (`scratch_sound_group_pending` / walk plan); impossible-stop arms proven by census; ready=0 keeps the pre-v50 monolithic residual byte-for-byte. |
| v88 verification repair (2026-08-14) | The v88 tree's slice build was broken (`playerhud 856e10_move_ctor` took `const uint8_t* src` but writes it — a mid-flight v31 unit), and the suite that inherited it ran no green verifier. Repairs: (1) move-ctor/range-move src made non-const (ABI unchanged); (2) **real defects**: the Pass-A resume mismatch arm dead-gated the boolean `frameOpaque4257b0PassBNeedsHostRecaptured` with `!== 0` (`false !== 0` == true — every mismatch emitted the Pass B host edge; PE 0x00425894 je skips it; differential case 915, regression test + four-arm isolation + mutant); `frameOpaque98dba0Manager2a35c` typed u32 in the layout while the C++ field is f32 (corpus floats truncated to 0 — mode-2 approach target read 0; case 3753; now f32); the stat-walk test seeds read the six pack f32 lanes as float values while the ABI carries raw bits (verifier already converted at 4112/4150 — the slice tests were the only float-convention stragglers; 9 v84 tests repaired to the bits contract); BINARY_LAYOUT typed 18 C++-float lanes u32 (capture/apply round-trips read bit patterns as magnitudes; all 18 now f32). (3) **harness neutering (per-key whitelist class)**: `flattenUpdateListTimersRuntime` and `flattenMenuAuxTreeRuntime` were pass-through stubs — the tail-sweep timers and the menu-aux 32-node tree NEVER reached the wasm (coverage guards: sweep pure=0 / menu-aux blob=0); both expanded + wired into `normalizeRuntimeInputsForLayout` (two separate Object.assigns — one call lets the second `{...out}` source clobber the first's lanes back to packed zeros); the model's `continueAfterMenuUpdate` called `menuAuxTreeErase` on the raw array-form runtime instead of the normalized flat lanes. (4) stale harness/mirrors: adapter rows fed the model an unshaped 10-key runtime (model took the monolithic residual; the wasm always sees the full zero struct) — adapter now shapes exactly like the real bridge; the sparse-apply comparison compared raw values where BINARY_LAYOUT types say u32 (`value24ed0` -1 vs 4294967295); the 4257b0 list_out comparison was arm-blind on the Pass-A mismatch arm (module publishes post-Pass-A bytes, the model's unconditional local pass-b rewrote +8); `outcome.ranPassA`/`listGrow` never existed (pass-a-pure/grow arms uncountable); guard messages now carry the counters; ProcessInput v34 stale `w.abi()===33` pins and `rco9be140ScaleValue`/`BestInitValue` missing imports; 9be140 oracles: missing `f32FromBits` and a signed `IdNegative` (`0x80000000 < 0` is false in doubles); room 824a70 oracles computed doubles where the PE uses mulss/addss/subss (pos_axis/z/scale), the LC write-needed oracle missed the u32 wrap, `IsaacRoomAmbient824a70LayerColorPlan.alpha` typed int32 in the header (float written as 1 → f32 read of bits 1), and the room lockstep test read the 7230 grid struct at shifted offsets (index is @16, seed_fatal @16 / seed_out @20); render-host-gl.js `RENDER_SLICE_ABI_VERSION` mirrored 10 against model/C++ 20. |
| v87 record 4 | VA `0x008318a0` HUD-v5 try_pure wire. Runtime 6708→6716 (`ready` @6708 / `mode` @6712). Events unchanged. Modes 1..4 still host (case 0 always E8 `0x4186c0`). Walk host stays. Record STAYS 49. Next VA `0x008ef990`. |
| v85 record 1 | VA `0x0092e300` StopAll wire: consume frozen SFX `isaac_sfx_stop_all_plan` BY REFERENCE. Runtime 5500→6696 (`voiceBlobReady` @5500 / `voiceCount` @5504 / `firstVoice[8]` @5508 / 32×9-u32 packs @5540 + pad @6692). v50 group gate UNCHANGED as fallback; ready=0 / missing blob = v84 byte-for-byte. Enabled nonempty all-null-channel walk DROPS (StopAll has no `[entry+4]=-1`). Live channel still hosts (vtbl +0x38/+0x44/+0x3c). Record NARROWED not removed (count stays 49). |
| v82 record 0 | flags → runtime inputs (census correction + clobber fix): `Game+0x2365c`/`0x23670` are WRITTEN during the record by `0x83bb6f` (register-held base; v81's static-disp census missed it), so state apply would fold the host's post-call bytes back to the pre-step capture. Moved to RUNTIME_INPUTS_LAYOUT @4532/@4533 u8 (struct 4536); BINARY_LAYOUT keeps 0x2365c/0x23670; state capture/apply lines deleted; JS normalize + verifier whitelist + corpus seed + post-apply expectation all updated (the verifier now seeds runtime-only binary bytes into the game buffer pre-run and expects them unchanged post-apply — a real bridge's contract). Mutants: `||`→`&&` fails; `& 0x100` gate fails (proves the runtime channel is live). |
| v84 record 0 | StatHUD tail walk-arm lane (PE 0x84c170..0x84c2b9, recv StatHUD = Game+0x233a8 = Game+0x1da04+0x59a4): lane active iff managerStatFlag&0xff != 0 && hudStatWalkBlobReady==1 && 1 <= ((end-begin)>>2) <= 8 (the PE's `sar eax,2` at 0x84c1be); FCO host byte (0x9be080) -> owner store Game+0x23654 (StatHUD+0x2ac); per-player slot get-or-insert 0x84bf30 (predA 0x90b100 FOUND-path opaque vtable host byte + TRUE-PURE translated predB 0x7db700; first-free insert at StatHUD+0x114 + free*0xcc); RecomputeStats 0x84ca00 with constant mask 0xfffffeff -> 9 tweens via `isaac_playerhud_stat_bar_tween` BY REFERENCE (the 0x1b8 zero-target tween k=8 skipped; k=6 owner-gated clamped*100 vs (1-probe3)*clamped*100 with probe clamp maxss 0.0-then-minss 1.0, NaN->0.0, probe2==0 zeroing after clamp; k=7 probe3*clamped*100; k=9 f32[Game+0x1adb4]*100); countdown law 0x84c224..0x84c2b0 ticks the 20 tween timers POST-walk; scratch_hud_stat_walk[13] u32 published (ownerByte, post-walk slotPtr0/1, slot0/1 {current,delta,prev,timer}; v78 pattern, NO state fields; reset in `isaac_game_update_slice_reset_scratch`); runtime 4628 -> 5180; count==0 falls back to the v83 countdown lane (unchanged), count>8 -> host residual; walk lane dispatched FIRST at both record-0 emission sites 0x6fb3b8/0x6fb3d0, v83 countdown lane as the count==0 fallback. |
| v83 record 0 | StatHUD tail countdown lane (PE 0x84c224..0x84c2b0): the 2x10 signed counters at recv+0x128 + g*0xcc + k*0x14 (recv = Game+0x233a8 = Game+0x1da04+0x59a4; counters Game+0x234d0+0x14k / Game+0x2359c+0x14k) tick once per record call (2nd only on the postUpdateDelay>0 early-return path). Lane active iff managerStatFlag&0xff != 0 && hudStatCountdownReady==1 && ((end-begin)>>2)==0 (walk-empty); wasm ticks scratch_hud_stat_countdown and publishes address/count (v78 scratch pattern, NO state fields); lane OFF on non-empty player vector (walk runs -> stat_bar_tween 0x84d6b0 writes [tween+0x10] == counter bytes -> stale capture, defect class 1). FCO 0x9be080 + owner byte recv+0x2ac + walk (0x84bf30/0x84ca00) stay host; ready=0 keeps v82 byte-for-byte. Verifier: countdown lane arms counted + off-lane scratch-zero pin. |
| v81 record 0 | loop gate peel: `Game+0x2365c`/`0x23670` (the 0x83b280 2-slot loop's per-slot flag bytes, read at `0x009a2b85`/`+0x14` stride, gated `0x009a2b90 cmp byte [edi],0 / je 0x009a2ba3`) become state @522/@523. NOTE (v82): the "ZERO writers image-wide" census claim was WRONG — `0x83bb6f` in 0x83b850 phase 2 writes both bytes through a register-held base. Semantics of the gate peel itself are unaffected (the step-start values were exact); the fields were moved to runtime inputs at v82. Pins: 3 behavior arms (both-clear/no-event, flag0, flag1) + layout/binary/spec pins; verifier guard extended (flagSet≥1, flagClear≥1); mutant `||`→`&&` fails at case 285. |
| v80 record 0 | latch narrowing: `Game+0x23680` (HUD::PostUpdate history one-shot latch; 2026-08-11 base correction: the v80 chain recorded 0x23580 from a misread 0x1d904 base — the Exit family pins 0x1da04/0x233a8 and the PE callsite `lea esi,[edi+0x1da04]` fix it). PE `0x009a2b67 cmp byte [ebx+0x5c7c],0 / jne 0x009a2b83`: set → skip `0x83b850` RecomputeAll + its store; clear → full block + store. Step-start state capture is exact (sole writer is the record itself). Monolith path mirrors the latch so the apply round-trip never clears the byte. Behavioural pins: 5-arm slice test (clear/set/history-gate-closed/monolith/pure). Differential mutation-checked both arms. |
| v79 record 2 | `opaqueGlobal4aba0Refresh` translated: JS oracle `globalTree4aba0Refresh` hand-traced from PE `0x006fb414..0x006fb474` + advance `0x00414a80`; C++ `isaac_game_update_slice_global_tree_4aba0_pure` verbatim; 32×24-byte node packs in runtime inputs (3764 + i·24); result byte sparse state @520; verifier probe fixed (typed array → NaN → nullptr → -1: probe now writes the pack into the dead runtime-inputs scratch and passes a real pointer); spec JSON 129 fields / 114 runtime inputs |
| record 50 assessed | `opaqueCall008607a0` (Update tail 0x006fbba5, last call before `ret @ 0x006fbbba`) — census COMPLETE, count stays 49. Exactly one reach image-wide (single E8, no table/jmp/reg forms). Body: gate `test byte [eax],2` on `eax=[*0xc71690]`; clear arm = no-op (v57 drops, 6-arm pin); set arm = Lua-platform only (lua_rawgeti/pushinteger/pcallk/pushvalue/luaL_ref/settop/luaL_unref + stack error ctor 0x85c080 + 0x8727d0), ZERO Game stores in the whole closure. REMOVAL BLOCKER: `lua_pcallk` runs a registry-indexed Lua function (0xfff0b9d8) that can be mod bytecode calling back into the game — not statically side-effect-free. Next frontier: record 0 HUD trio. |
| v78 wire | record 49 consumed by reference (local `update_list_sweep` copy deleted; evict-flags scratch export added to build list); SFX v9 XML-read PE-truth tests restored to execution (missing const import; now 80/80) |
| Wave-2/2.5 landings | PM 19 `isaac_pm_walk_tick_plan` · Exit 36 `0x007df690` · ProcessInput 26 `FUN_00954b40` (32 exports) · ANM2 8 `0x40c000` LoadGraphics lane · Room 51 walk spin + spawn-exit-position laws · PGD 9 PGDEX/PGDCT rows · RTE 12 `0x0040a1b0` Rewind + `0x00408c90` bitset · frame-effect 11 (band) · render-shell 33 `0x00827bc0` probe-B lane (NARROWED) · frame-path module-backed drivers (ProcessInput/Exit/Lua/playerhud/log) · update slice ABI 77 ANM2 lane · lua 26 error-path callee bodies · PlayerHUD 18 `isaac_playerhud_stat_bar_tween` (`0x84d6b0`, jnp-on-EQUAL NaN idiom, 5 mutants) · SFX 9 append-arm skip law · frame-opaque 31 record-49 removal (51→50) |

**Authoritative source is always the tree, never this file:**
`grep "ABI_VERSION = " scripts/decomp/*-model.mjs`. Docs here have lagged by
3–9 versions repeatedly, and six work units have opened on already-landed
targets as a direct result (AGENTS.md rule 11 exists for this).

## First vertical slice

The first slice starts from stable REPENTOGON signatures for the simulation,
renderer, input, save/shutdown, and Lua boundaries. The local pipeline finds
those roots in an unpacked, user-owned PE, imports that PE into Ghidra, follows
direct call edges, and decompiles a bounded call-graph neighborhood.
When an exact version-sensitive signature is missing, the inventory records
ranked byte-similarity candidates as heuristics only. A candidate must still be
validated through call context or runtime evidence before it becomes a port root.
Validated addresses can be recorded in the ignored, hash-bound
`output/decomp/<binary-hash>/verified-roots.json`; the runner rejects a stale
hash, unknown symbol, non-executable RVA, or empty evidence list.

```powershell
npm run decomp:inventory
npm run decomp:analyze
```

By default the runner prefers `tools/isaac-ng.unpacked.exe`, then `ISAAC_EXE`,
then the standard Steam install path. Override it with
`node scripts/decomp/run-ghidra.mjs --input C:\path\to\isaac-ng.exe`.

Generated inventories, manifests, and decompiler text are written to
`output/decomp/<binary-hash>/`. Ghidra projects are written to
`re/ghidra_project/`. Both directories are ignored. Never commit an executable,
game resource, decompiler listing, or other binary-derived game material.
The first `decomp:analyze` run performs whole-program analysis; later runs reuse
the hash-keyed project and only rerun the bounded exporter. Pass `--reanalyze`
directly to the runner when signatures or analysis settings change and the
cached program needs another whole-program pass.

## Port order

1. Recover and validate `Game::Update` plus a shallow call graph against runtime
   traces. Establish deterministic frame-state snapshots.
2. Replace Win32/OpenGL/OpenAL/input calls with a small explicit host ABI.
3. Rebuild the Lua boundary around WebAssembly-compatible Lua 5.3 and compare
   registration names and script-visible behavior.
4. Port the renderer after simulation behavior is stable, initially targeting
   WebGL 2 and keeping asset decoding outside the core module.
5. Grow the translated region based on profiles until the emulator is no longer
   on the per-frame path, then remove it.

The acceptance target is behavioral parity first, then a 60 Hz frame budget.
Each translated slice should have a native-vs-Wasm state comparison so plausible
but incorrect decompiler output cannot silently become the new implementation.

## Implemented Game::Update prefix

`native/decomp/game_update_slice.cpp` is the first compilable translation. It
contains the verified timer, scalar-decay, and transition-progress prefix of
`Game::Update`. Transition side effects are emitted as typed events, keeping the
portable core independent of Win32, rendering, audio, saves, and Steam.
Sparse capture/apply adapters map only the recovered offsets and leave every
untranslated byte untouched, providing the boundary for emulator-vs-Wasm state
snapshots while the port is still hybrid.

ABI v2 also translates the completed-transition switch structurally. Modes
1/2/3/4/11 emit queue-screen events for IDs 2/3/19/1/17, including the observed
black fade and payload-copy requirement. Exact REPENTOGON signatures identify
modes 5/6 as conditional restart-game flows and mode 7 as `NextVictoryLap`.
Modes 8/10 remain explicitly opaque; mode 9 records its empty switch body.
Every completed mode emits the observed transition-gate clear.

ABI v3 corrects and extends the following boundary: `HUD::PostUpdate` is called
once only when transition progress is active. If `Game+0x264f4` is positive, it
is decremented, HUD post-update is called once more, and `Game::Update` returns.
The event ABI now reports the exact call count and early-return decision. The
unresolved controller guard at the function entry remains an explicit precondition.
Its exact `FirstCollectibleOwner(689, ...)` callee ties part of the guard to
Glitched Crown handling, but that is not enough evidence to name the controller.

ABI v4 advances through three consecutive early-exit gates. The `Game+0x1d520`
branch now clears its `+0x1d63c` one-shot byte, preserves the three observed
opaque side-effect boundaries, translates the `+0x24ecc/+0x24ed0/+0x24ed8`
state writes, and distinguishes return from the jump to the shared tail at VA
`0x006fbbaa`. Gates at `+0x1d654` and `+0x1ba78` emit their opaque calls and
exact return/HUD behavior. The next untranslated sequential gate is now
`Game+0x1b83c`. None of the four opaque callees has an exact REPENTOGON ZHL
signature, so the ABI uses address-stable event names instead of guessed symbols.

ABI v5 ports the next `Game+0x1b83c` branch without guessing across an opaque
mutation. The first phase emits calls for VA `0x008318a0`, VA `0x0098dba0`, and
`HUD::PostUpdate`, then returns a resume continuation. After the host applies
those side effects and recaptures the sparse Game fields, the resume export
reproduces VA `0x006f0070` exactly as `Game[0x1b83c] != 0 &&
Game[0x1ba74] != 0`. A true result clears `Game+0x265c0` and returns; a false
result enters the shared tail. The next untranslated sequential gate is now
`Game+0x1c034`.

ABI v6 translates both sides of the `Game+0x1c034` state machine up to the
timed-transition block. Exact REPENTOGON signatures identify
`GenericPrompt::IsActive`, `GenericPrompt::Update(false)`, and
`ItemOverlay::Update(false)`. The small `IsActive` body is translated directly;
both mutating updates emit host events and use recapture/resume exports before
testing their output fields. The submitted GenericPrompt path now constructs
the observed black mode-7 transition with exact float32 `0.08` rate/increment.
A dedicated runtime-input struct carries the global-range predicate used by the
ItemOverlay branch instead of mixing global state into the sparse Game object.
The next sequential block begins at `Game+0x26598`, the timed-transition value.

ABI v7 translates that timed-transition block. The runtime-input ABI carries the
opaque 64-bit clock result and its global baseline as split 32-bit words. The
portable core reproduces the original reciprocal division exactly as
`(counter * 0x431bde82d7b634db) >> 82`, including unsigned subtraction and the
inclusive 3000 boundary. It also implements the float32 progress decrement,
status writes, forced completion, ordered address-stable cleanup events, and
the final HUD return. The next sequential code begins with the global/menu
conditions following VA `0x006fb837`.

ABI v8 advances through those global/menu conditions. It replaces the earlier
boolean range input with the exact raw byte length of the global
`[+0x4b3d8,+0x4b3dc)` vector, adds the two controlling global bytes, and pauses
around VA `0x009b7680` and VA `0x009b6840` so `Game+0x23a74` can be recaptured.
The complete VA `0x009b7650` helper is translated as the empty-or-one-entry exit
predicate. The nested list clear after the menu update and the VA `0x008ef990`
early-return call remain explicit host actions. When those gates fall through,
`Game+0x265c0` increments with x86 32-bit wrap and the slice hands off at the
VA `0x0098dba0` / VA `0x004212c0` per-frame calls. The next sequential block
starts at the `Game+0x67788` counter at VA `0x006fb92e`.

ABI v9 translates the effect counters at `Game+0x67788` and `Game+0x68d6c`, the
wrapped frame counters, and the ordered frame-manager handoff
(VA `0x00802980`, exact `PlayerManager::Update`, VA `0x004257b0`) with
recapture after the opaque stage/room transition effects.

ABI v10 finishes the sequential `Game::Update` body after that handoff. After
sparse recapture, `resume_frame_manager_updates` translates the fade float
machine at `Game+0x26514`/`Game+0x26518` (constants
`DAT_00baa0b4`/`DAT_00baa0c4`/`DAT_00baa454`), the shake lerp at
`Game+0x67738`/`0x6773c`/`0x67740` with abs mask `DAT_00bacb40`, and the
`Game+0x269e0` timer. It then emits `HUD::PostUpdate`, the host list walk when
`Game+0x67730 != 0`, address-stable `opaqueCall008607a0`, and
`RETURN_AFTER_GAME_UPDATE` at `LAB_006fbbaa`. Residual host events still cover
opaque callees inside the function; the sequential instruction stream of
`Game::Update` is complete.

The shipped simulation tick selector is `scripts/decomp/frame-path.mjs`. It
loads the zero-import Wasm slice, runs the full continuation chain, and delivers
residual host events through an explicit `HostHandler`. Default mode is
`native-wasm` when the slice module is available. Residual handlers must never
re-enter x86 PE emulation (`createLoggingHostHandler` and
`createResidualHostHandler` reject emulator / Boxedwine / pe-emu kinds;
`usesX86Emulation` stays `false`).

### Hybrid capture/apply path

The portable core works on a sparse state struct; the host boundary is a
Game-object-sized byte buffer (`GAME_OBJECT_MIN_SIZE` = `0x68d70`, matching
`ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE`). Only recovered offsets in
`BINARY_LAYOUT` are captured or applied; every untranslated byte is left
untouched.

**`runHybridGameUpdateTick(slice, { gameObject, ... })`** (never selects PE):

1. `loadGameObjectIntoScratch` — copy the external `Uint8Array` into the Wasm
   scratch Game object (`isaac_game_update_slice_game_object_address`).
2. `captureSparseStateFromScratch` — Wasm
   `isaac_game_update_slice_capture_scratch` → read sparse `STATE_LAYOUT`.
3. `runNativeGameUpdateTick` — pure translated control flow + continuation
   chain; residual events go to the `HostHandler`.
4. Optional recapture patches from the handler (`drainPatches` /
   `recaptureAfter`) merge into sparse state after host events that can mutate
   later predicates (evidence rule §5).
5. `applySparseStateToScratch` — write sparse state then Wasm
   `isaac_game_update_slice_apply_scratch`.
6. `exportGameObjectFromScratch` — copy scratch back into the same
   `gameObject` buffer.

**`createResidualHostHandler({ bodies, recaptureAfter, onEvent })`** runs
native residual *bodies* without PE:

| Kind class | Behavior |
|------------|----------|
| Platform/IO (`PLATFORM_IO_HOST_KINDS`: e.g. `opaqueCall008607a0`, `transitionQueueScreen`, `listUpdate6772c`, `hudMessageTextOut`) | Counted; body is a no-op (acceptable long residual). |
| Game-logic residual | Optional per-kind `bodies[kind]`, else default stub that records execution with `usesX86Emulation: false`. Specific peels replace the default via `bodies`. |
| Emulator-routed names | Throw; must not re-enter PE. |

`createLoggingHostHandler` remains the count/log-only variant (same PE ban).
The hybrid tick defaults to `createResidualHostHandler` when no handler is
passed.

**`createNativeUpdateSession`** owns multi-frame state for browser/dev ticks:

- Allocates a live `Uint8Array(GAME_OBJECT_MIN_SIZE)` when no external
  `gameObject` is supplied, seeds it with `writeSparseFieldsToGameObject`.
- Each `session.tick()`: write current sparse fields into the live buffer →
  `runHybridGameUpdateTick` → adopt `result.state` as the next sparse source of
  truth. Untranslated buffer bytes survive across ticks.
- Exposes `session.gameObject`, `session.state`, `hostTotals`,
  `residualExecuted`; `usesX86Emulation` is always `false`.

### Game-object sparse buffer lifecycle

```
JS sparse state  ──writeSparseFields──►  live Game-object buffer (0x68d70)
                                              │
                         loadGameObjectIntoScratch
                                              ▼
                                    Wasm scratch Game object
                                              │
                         capture_scratch → STATE_LAYOUT
                                              ▼
                              native Update + residual HostHandler
                                              │
                         apply_scratch ← STATE_LAYOUT
                                              ▼
                                    Wasm scratch Game object
                                              │
                         exportGameObjectFromScratch
                                              ▼
                         live Game-object buffer (sparse fields updated;
                         untranslated bytes preserved)
                                              │
                         readSparseFields / result.state
                                              ▼
                                    JS sparse state (next tick)
```

Helpers: `writeSparseFieldsToGameObject` / `readSparseFieldsFromGameObject`
(offset layout only), `loadGameObjectIntoScratch` /
`exportGameObjectFromScratch`, `captureSparseStateFromScratch` /
`applySparseStateToScratch`. This lifecycle is the hybrid host boundary while
the port is incomplete; it is **not** a live map of PE guest `Game*` RAM.

### Browser integration (platform host)

`scripts/serve.mjs` mounts decomp artifacts into the static server so the
browser can load the slice without bundling ignored outputs under `web/`:

| Mount | Source tree |
|-------|-------------|
| `/@decomp/wasm/*` | `output/decomp/wasm-slice/*` |
| `/@decomp/scripts/*` | `scripts/decomp/*` |

On the platform host page (`web/index.html` → `web/js/app.js`):

- Boot loads `web/js/native-update-bridge.js`, which imports
  `/@decomp/scripts/frame-path.mjs` and fetches
  `/@decomp/wasm/game-update-slice.wasm`.
- When the slice loads, `bootNativeUpdateBridge` builds
  `createResidualHostHandler` (no PE) and
  `createNativeUpdateSession(slice, { onHostEvent: host })`, then returns
  `mode=native-wasm`, `usesX86Emulation=false`, and `tick: () => session.tick()`.
- rAF (`createFrameLoop` in `app.js`) owns the simulation tick via that
  residual `HostHandler` path: `nativeBridge.tick(time)` runs hybrid
  capture/apply + residual bodies **without** re-entering PE; paint remains
  `Module._isaac_tick` (host stub phases), not a ported `Game::Render`.
- If the Wasm slice is unavailable, the bridge reports
  `emulator-x86` / `usesX86Emulation=true` and `tick` is a no-op; rAF still
  paints only.

### Path B (removed 2026-08-07)

Path B — `web/emu/` (Boxedwine → Wine → `isaac-ng.exe`), which ran the **full**
game under x86 PE emulation every frame (Update + Render + input) and never
loaded the decomp slice — has been **removed from the repository** by owner
directive: its measured frame cost made it unwanted, not a baseline worth
keeping. Its runtime, page, guest images, build/benchmark/packaging harness,
tests, evidence docs, and the `third_party/Boxedwine` submodule are gone. There
is no longer any playable full-PE fallback; the native root slices plus a live
sparse bridge from PE guest RAM are now the only route to a playable frame.

The `emulator-x86` / `usesX86Emulation` naming survives in
`scripts/decomp/frame-path.mjs` and `web/js/native-update-bridge.js` purely as
the **guard**: residual host kinds named `emulator` / `boxedwine` / `pe-emu`
still throw, so a regression that tries to re-enter PE fails loudly.

### Render root slice browser wiring — Game::Render ABI v4 (2026-08-08)

The Game::Render root slice (ABI **v4**, zero-import, 43 exports; sources
`native/decomp/game_render_slice.cpp` + `render_shell_pure_helpers.cpp`;
driver `scripts/decomp/frame-render-root.mjs`) is now **wired into the browser
frame path** on the same JS-owned Game-object buffer as the Update session:

- **Per-rAF alphabet** (`web/js/app.js`): DOM key edges → `inputBridge.setKey`
  (then `Module._isaac_key_event` for the guest) → `nativeBridge.tick(time,
  extraRuntime)` (Update tick **and** one Render tick, deduped per frame) →
  `nativeBridge.renderTick(time)` (cached result when already driven) →
  paint fallback `Module._isaac_tick` only while the GL host draws nothing.
- **Bridge** (`web/js/native-update-bridge.js`): loads the render slice
  non-fatally (`loadRenderRoot`, default on), builds `createNativeRenderSession`
  over `session.gameObject` (0x68d70 serves 0x3bb20), exposes `renderSession`,
  `renderMode`, `renderTick`, `setRenderHost` (runtime-swappable host), and
  `renderErrors`. A missing/stale render module never gates the Update tick.
- **Input bridge** (`scripts/decomp/frame-input-bridge.mjs`): Escape held →
  Update runtime overrides `globalMenuGuard4b3ca=0 / globalMenuEnable2a3a5=1 /
  globalRangeByteLength=0` — exactly the PE gate triple the Update slice
  already translates (`continueGameUpdateMenuGates` opens when guard==0 &&
  enable!=0 && rangeLength==0 && menuState23a74==0). Release restores the
  closed-menu defaults. `applyToGameObject` is a documented no-op until the
  sparse ABI captures input fields. This is keyboard → native menu gates, not
  a ProcessInput pin (the pure helpers remain device-poll islands).
- **GL host** (`web/js/render-host-gl.js`): typed host events (kind/hostVa/
  hostRepeat) become real WebGL2 scissor+clear draws; `endFrame()` returns the
  draw count and the paint stub is skipped only when draws > 0. The slice is a
  typed-host ABI, **not** a PE-free render: entity/grid geometry and textures
  are not in the sparse capture yet, so tiles are kind-tinted placeholders —
  draw counts are real, pixels are not yet equivalent.
- **Build/verify chain**: `npm run decomp:build-render-slice` →
  `output/decomp/game-render-slice/{game-render-slice.wasm,abi.json}`;
  `npm run decomp:verify-render-slice` → runs the slice differential +
  frame-render-root driver + bridge wiring suites (33 tests) and emits
  `verification.json` (`result: "pass"`, zero-import enforced).
- **Verification**: `tests/decomp-frame-render-root.test.js` (loader contract,
  closed gate byte preservation, driver-vs-oracle lockstep over every
  continuation, entity+grid recapture excursion, shared-buffer session);
  `tests/decomp-frame-path-render-wiring.test.js` (catalog, serve mount, real
  bridge boot over HTTP, per-frame dedupe, extraRuntime/statePatch forwards,
  setRenderHost swap, missing-module non-fatal); `tests/decomp-frame-input-
  bridge.test.js` and `tests/decomp-render-host-gl.test.js`. Update ABI stays
  **v64** — no Update field changed.
- **Honest limits**: host kinds (GL bind / entity / grid / RT pops / 817830
  trunk+tail) are counted events; real per-entity draws need the entity/grid
  capture contract (next boundary); ProcessInput stays unpinned; docs tables
  above this section predate the render wiring and the ABI-64 Update model.

### ABI v76 (Update slice; v75..v76 landed; opaque 52 -> 51; 2026-08-10)

Tracked checkpoint ABI **v76** (per AGENTS.md; v69..v75 entries are kept there).
Opaque boundaries: **52 -> 51** — record 34 `opaqueCall0098dba0Timer`
(container `0x0098dba0`) is REMOVED and moved to `resolvedBoundaries`.

**v76 work unit — timer-interior MT19937 wired in-module.** The draw the PE
performs at `0x0098de79` (`call Isaac::genrand_int32 0x006eef60`) is now
computed IN-MODULE from the Room family's recovered MT19937 law
(`isaac_room_genrand_next` / `roomGenrandNext`, consumed by reference, never
re-derived). New runtime inputs `frameOpaque98dba0TimerMtReady` (u32, 3212)
and `frameOpaque98dba0TimerMtiIn` (i32, 3216); new event
`frameOpaque98dba0TimerMtIndexOut` (i32, 464). Runtime 3212 -> 3220, events
464 -> 468; state 508 / constants 32 unchanged. `mt_in` is signed: the PE
index dispatch is signed (`jl`/`jne` @ 0x006eefb4/0x006eefbf), so cold-625
and strict-624 reload paths stay reachable. The model draws on a LOCAL COPY
of the state — the shared `genrandState` is never mutated model-side (the H5
ambient stage keeps its own per-boundary capture). `mtAdvanced` is the single
PE-exact formula `(useCrtRand & 0xff) == 0` (@ 0x006eef8a low-byte test).

Fallback arms byte-for-byte: ready=0 (pre-v66), pureReady=0 (v66-v69),
mtReady=0 (v70 host-drawn), CRT-active (v70 host rand(); scoped bracket
unreachable from Game::Update). Removal license identical to v71
`0x004257b0`: the live arm's remaining host content is only the two
`_libm_sse2_{cos,sin}_precise` f64 results (CRT-math standing decision) and
genrand debug-ring internals (raw alloc/backtrace per frozen Room contract —
value-invisible). Corpus: 6 new fixed completeState cases (mt pure arm with
`0xdeadbeef` poison sample, cold-625 canonical first word `0xd091bb5c`,
strict-624 reload, crt-set fallback, wide-byte crt 0x100, mtReady=0 fallback)
+ randomized mt draws; Wasm scratch verified word-for-word after each resume.

**Session blocker (not this unit's files):** `room_transition_engine_pure_helpers.cpp`
was truncated to 0 bytes at 14:50:33 by the concurrent rte-v11 unit's own
edit (`open('w')` + OSError; `.bak-v11` is a copy of the empty file). rte-v11
reconstructed it. Until it landed, `decomp:verify-slice` (which rebuilds the
slice from sources) could not link.

### ABI v68 (Update slice; v67..v68 landed; opaque 54; 2026-08-08)

Tracked checkpoint moves to **v68**. Opaque boundaries stay **54** — ABI v68
wires the Play entry gate of an already-host SFX boundary; it does not remove a
boundary count.

**v68 work unit — PM3 heartbeat PLAY gate (SFXManager::Play @ 0x0092dc30).**
The PM3 intensity heartbeat PLAY residual (event
`player_manager_update_heartbeat_sfx_play`, decided by
`isaac_pm_intensity_wire_decide` at ABI v44) was emitted UNGATED through v67:
the driver host edge always ran. The v60 stop fold and v62 volume-update fold
wire the entry-table gate `isaac_pm_sfx_entry_gate` (v5 PMS) for their
residuals; the PLAY lane was the one heartbeat host still emitting on every
PLAY, including rows where the exact-ZHL `SFXManager::Play(int ID, float
Volume, int FrameDelay, bool Loop, float Pitch, float Pan)` (44-byte match)
returns before touching any state.

Machine transcription of the play entry (PE offsets relative to 0x0092dc30):
`test edi,edi / js 0x92de8b` (id < 0), `imul esi,edi,0x1b8; add esi,[ebx]`
then count = (u32[this+4]-u32[this])/0x1b8 signed with `cmp edi,eax; jge
0x92de8b` (id >= count) — both side-effect-free returns through the epilogue
0x92de8b (no log, no counter write). `cmp dword [esi+0x190],0 / ja 0x92dcd1`
is the sample-count gate: zero keeps the warn log (`push 0xb7b1fc` = "[warn]
Sound %d has no samples.\n", level 1 via 0x00a112c0) and returns. The
previously-noted `0x92dcd1 cmp byte [esi+0x198],0 / jne 0x92dcf4` is a LOAD
path, not a return: entry not preloaded calls 0x92cfb0 SoundEffect::Load,
logs "[warn] Sound %d was not preloaded.\n", increments [manager+0xc], and
CONTINUES into the play body. So for the play lane only MISS is a pure
no-op; NO_SAMPLES keeps a warn-log host; DISABLED and LIVE keep the host
body. That differs from the mutator folds: the v60/v61 stop and v62/v63
volume folds drop both MISS and DISABLED because those bodies return on
DISABLED.

Landing: `game_update_slice.cpp` PLAY arm now decides
`host = sfx_stop_ready == 0 || sfx_play_gate != ISAAC_PM_SFX_GATE_MISS`,
reusing the v60 captures (sfxStopReady / sfxStopSpan / sfxStopVoices190 /
sfxStopEnabled198, runtime 2080..2096). JS oracle mirrors it in
`game-update-model.mjs`; the v62 comment "ready=1 keeps" was corrected to
`ready=0` while there. Verify corpus gained 8 PLAY-shaped rows (MISS x3
incl. negative span and id==count, NO_SAMPLES, DISABLED, DISABLED byte
0x100, LIVE, ready=0 fallback) and the SFXINFO counters have
play_skip/play_host/play_fb; a coverage throw demands all three classes.
No struct/event/export change: state 508 / runtime 2156 / events 412 stay.

**Next exact site:** the Playing body span 0x92dcf4..0x92de8b is LAWED, not
host: every pure island is a landed family law (SFX v5 SP block, v26b SP-B,
v1/v2/v3 volume/pan/word/start-tail; W19SfxFrontier §1-3
instruction-by-instruction) and the record-46 PLAY continuation mirrors
landed at ABI v96 (window_open/seed/voice_select/pick_offset/volume_clamped).
Future SFX units should read the family NOTES (sfx-v26-open-bodies →
sfx-v27-a17180 → sfx-v28-hashpair LANDED (0xa159d0 djb2 + 0xa15ab0 FNV-1a,
8 fold laws); next: 0xa5a7a0 canonicalizer family (last host callee of the
a17180 build body) or attempt bodies 0xa17f40/0xa17ea0), not this
historical line.



Tracked checkpoint ABI **v63**. Opaque boundaries stay **54** — v63 is a
write-lane fold, not a boundary removal.

**v63 work unit — Game::Update common-tail WRITE lane (PE 0x006fb38a).**
The PE every pass after the HUD-draw tail executes:
`mov byte [eax+0x29fb8], 0` (PE 0x006fb395) then re-reads and normalizes the
transition mode: `[Game+0x29fb8] + [edi+0x265bc]'s mode is kept only if 8/9,
else cleared to 0` (PE 0x006fb39c..0x006fb3ac). Both writes were **silently
unmodeled through ABI v62** — the byte clear and the mode normalize ran on the
PE (and on Path B) but neither the JS model nor the C++ slice emitted them, so
the differential compared two implementations that were both missing the same
writes (the v61 lesson, byte-lane variant).

| Lane | PE evidence | JS | C++ |
|------|-------------|----|-----|
| byte clear | `0x006fb395 mov byte [eax+0x29fb8], 0` | `state.transitionTailByte29fb8 = 0` | `state->transition_tail_byte_29fb8 = 0` |
| mode keep-8/9 | `0x006fb39c..0x006fb3ac` keep-only-if-8/9 else 0 | `if (mode !== 8 && mode !== 9) mode = 0` | same via `transition_mode` |

Placed immediately before the v61 `opaqueCall009a2b30` sweep lane; order vs.
the v61 lane is pinned by the PE (`mov byte` and the `[0x29fb8] re-read`
precede `0x006fb3b6`'s ecx load).

- **New sparse field** `transitionTailByte29fb8` (u8, binary `Game+0x29fb8`,
  state layout offset 476 → state size **480**; spec `fields` 117 → 118).
- **No new runtime inputs or events** (events stay 396, runtime 2096).
- **Verification** — differential **5144 cases pass** (5141 + 3 new pinned
  byte/mode tail cases); counters `tailWriteBytePins = 3`,
  `tailWriteModePins = 3753`, guard thrown when either is 0. Wasm
  `game-update-slice.wasm` 29601 B, zero imports, 95 exports
  (`abi.json imports: []`). Decomp unit+integration gate **29/29**;
  `npm run decomp:verify-slice` exit 0; `npm test` 806 pass / 19 fail (the
  known env-only CLI/PWA/standalone baseline); `check-repo-safety` pass;
  `git diff --check` clean.
- **Mutation battery — 4/4 killed and reverted**: M1 JS byte-clear dropped,
  M2 JS keep-8/9 dropped, M3 C++ byte-clear dropped, M4 C++ keep-8/9 dropped
  (M3/M4 as expression/comment-dropped forms because `-Werror` host syntax
  rejects dead-branch locals; each rebuild printed `Built … (29601 bytes)`
  before the differential failed).
- **Lesson** — a dual-side silent omission is not limited to calling lanes:
  unconditional byte writes + conditional normalizes in the common tail can
  be missing on *both* sides while the differential stays green. When
  re-transcribing a shared tail, walk the PE instruction stream for **stores**
  as well as calls, and pin the byte with a non-zero input (0xff) plus the
  mode normalize with a 4 (non-8/9) input.

### ABI v62 (Update slice; v61..v62 landed; opaque 54; 2026-08-07)

Tracked checkpoint ABI **v62**. Opaque boundaries stay **54** — v62 is an
entry-gate fold, not a boundary removal.

**v62 work unit — PM3 SFX volume-update residual gate (VA 0x0092df40 +
twin 0x0092e050; PM3 callsites 0x009bb7c9 / 0x009bb7dd; receiver
Game+0x2a324, sound id 0x1fc).** The PM3 heartbeat branch that keeps an
already-playing intensity sound volume-correct runs BOTH bodies every pass,
and both have the exact v5 PMS entry-gate shape already folded for the v60
stop call:

- `0x92df51` `test esi,esi; js` -> MISS (id < 0): pure return.
- `0x92df5c..0x92df6d`: 0x1b8-stride count via the 0x94f2095 magic
  (sar 4, shr 1f, add) — same count math as the stop gate.
- `0x92df71` `cmp esi,count; jge`: MISS (id >= count) -> pure return.
- `0x92df7f` `cmp [entry+0x190],0` — voices == 0 -> NO_SAMPLES ->
  warn-log host (0x92df90..0x92df9e call 0xa112c0, args 1/0xb7b1fc/id).
- `0x92dfa8` `cmp byte [entry+0x198],0; je`: DISABLED -> pure return.
- LIVE -> per-voice volume host (writes [entry+0x194]).

ABI v62 wires the SAME isaac_pm_sfx_entry_gate + mutator_pure_complete
over the SHARED PM3 SFX entry captures (the v60 sfx_stop_* runtime fields
@ 2080-2092; no layout change — runtime stays 2096) so MISS and DISABLED
drop BOTH update calls, NO_SAMPLES keeps the warn-log host, LIVE keeps the
volume host, and ready=0 keeps the pre-v62 always-host residual. ABI
pins: header `ISAAC_GAME_UPDATE_SLICE_ABI_VERSION = 62`, model
ABI_VERSION 62, spec abiVersion 62, tests 62.

Verification: differential **5141 cases** pass (8 new pinned UPDATE-shaped
cases: raw0=20 => clamp 1.0 + sfxPlaying => wire decides UPDATE; gate
classes MISS x3 / NO_SAMPLES / DISABLED / DISABLED-wide (0x100 byte test)
/ LIVE / ready=0); sfxUpdatePureSkip **158** / Host **13** / Fallback **149**
all > 0 (guard). wasm 29546 bytes, zero imports. Mutants killed + reverted
on both sides: JS force-host, JS force-drop, C++ host-on-ready-1
(MISS/DISABLED emit) and C++ never-emit — all rejected. **Lesson:** C++
mutants must keep the gate variables referenced; dead `if (1)/if (0)`
mutants fail the -Werror host syntax check BEFORE the build, so the stale
wasm makes the differential falsely pass and the mutant wrongly "survives".
Unit suite 28/28; npm test 19 env-only baseline failures unchanged (CLI
PWA/standalone server suites). Re-transcription of both 0x92df40 and
0x92e050 done branch-by-branch from the PE above.

Next candidates: 0x0082ee40 engine-body float resets (player loop remains
host), the walk-counter 0x98de38 sound tail is already a typed pure event,
and the 0x009b7680 menu-refresh body stays a large host (its find-miss
path only sets field 0xfac = -1; the rest of the body always runs).

### ABI v61 (Update slice; v60..v61 landed; opaque 53 -> 54; 2026-08-07)

The tracked checkpoint is ABI **v61**. Opaque boundaries: **53 -> 54** —
v61 does NOT add a new host body; it *counts* one that was silently missing:
the transition-tail sweep at VA 0x009a2b30 ran on the PE every frame (two
calls on the delay path) but neither the JS oracle nor the C++ step modeled
it, so the native path simply skipped real game logic and the differential
stayed green on both sides. Wiring it puts the honest counter back to **54**.

**v61 work unit — VA 0x009a2b30 transition-tail sweep (callsite pairs
0x006fb3b8 / 0x006fb3d0; receiver Game + 0x1da04).** PE re-transcription of
the Game::Update common tail `0x006fb38a`:

- `0x6fb395`: `byte[global+0x29fb8] = 0` (unconditional write).
- `0x6fb39c`-`0x6fb3ac`: `[Game+0x265bc]` kept only when 8 or 9, else 0.
- `0x6fb3b6`-`0x6fb3b8`: `ecx = Game+0x1da04`; call 0x009a2b30 (every pass).
- `0x6fb3bd`-`0x6fb3c5`: `[Game+0x264f4]` (postUpdateDelay) `<= 0` skips;
  `0x6fb3c7`-`0x6fb3d0`: dec, `ecx = Game+0x1da04`, call 0x009a2b30 again,
  then Game::Update EARLY-RETURNS (`0x6fb3d5` epilogue).

`0x009a2b30` body (host, kept as one typed residual): 8 x 0x6dc-stride slot
updates (call 0x842230 when the slot head dword is non-null), a
`[global+0x2a384] <= 0`-gated middle block (`0x5c7c` init + 0x83b850 +
two 0x83b280 calls when allowed), and the unconditional 0x84c170 tail on
`receiver + 0x59a4`. No exact REPENTOGON ZHL signature match.

ABI v61 change: one new event `opaqueCall009a2b30` @ offset 392 (events
392 -> 396); ABI pins bumped in C++ header, JS model, spec JSON (abiVersion
61, opaqueBoundaries now 54 with the 0x009a2b30 record), and tests. The
model emits `+= 1` right before the `postUpdateDelay > 0` check and `+= 1`
inside the delay branch (after the decrement), mirroring the PE exactly;
resume chains spread events and never re-run the tail.

Verification: differential **5133 cases** pass (3 new pinned
postUpdateDelay = 1/2/3 cases; opaque9a2b30 once **2253**, twice **2880**);
wasm 29499 bytes, zero imports. Mutants killed and reverted on both sides:
JS first-emission drop, JS second-emission `+= 0`, C++ first-emission drop,
C++ second-emission `+= 0` — every mutant is rejected by the differential;
comment-only "mutants" correctly survive (no behavior change). A new unit
test asserts the once/twice PE sites via `stepGameUpdateSlice` directly.
Unit suite 28/28 (slice+pipeline); npm test 823 / 804 pass /
19 env-only baseline failures (unchanged).

Lesson logged: a differential that compares only the two port
implementations cannot see a call both sides omit. PE re-transcription of
every step lane caught this one; the guard pattern (count once/twice cases,
require both > 0) locks it against regression.

Next candidates: 0x009b7680 menu registry find-miss fast path (verify
first), the walk-counter sound tail 0x98de38 as a typed pure event, and the
room-transition-engine body float resets (`0x0082ee40` blob path).


### ABI v60 (Update slice; v59..v60 landed; opaque 53; 2026-08-07)

The tracked checkpoint is ABI **v60**. Opaque boundaries: **53** (unchanged —
v60 closes one host edge, it does not remove the boundary: MISS/DISABLED drop
the call, but NO_SAMPLES and LIVE keep the host body; the boundary stays).

**v60 work unit — `PlayerManager_Update` SFX-stop entry gate (VA 0x0092e230;
callsite `0x009bb7a2`; receiver Game+0x2a324).** The PM3 STOP residual always
incremented `playerManagerUpdateHeartbeatSfxStop` (always host). v60 re-wires
that emission through the exact gate already proven in the PM SFX helper
family, re-transcribed from the PE:

- `0x92e246`-`0x92e25d`: index sign gate — `test esi,esi; js` (idx<0) exits;
  `cmp esi,eax; jge` (idx >= group count) exits. Both are pure MISS.
- group count = `(end - begin) / 0x1b8` via the `imul 0x94f2095; sar edx,4`
  magic division (440-byte stride) — pure.
- entry `[edi+0x190]` voice count: `cmp [edi+0x190],0; ja walk` — the
  `== 0` (NO_SAMPLES) branch runs the warn-log host call @ `0x00a112c0`.
- walk `cmp byte ptr [edi+0x198],0; je exit` — DISABLED (flag 0) is a pure
  no-op; `flag != 0` (LIVE) runs the per-voice stop loop host
  (`0x92e292`..`0x92e2ec`, vtable).

Four new runtime inputs feed the gate at the STOP emission site (2080..2092;
runtime struct 2080 -> 2096): `sfxStopReady` (u32; 0 preserves the pre-v60
always-host residual), `sfxStopSpan` (s32 = `(end - begin) | 0`), `sfxStopVoices190`
(u32 = `[entry+0x190]`), `sfxStopEnabled198` (u8 = `[entry+0x198]`, widened
test `& 0xff`). Both JS (`pmSfxEntryGate` / `pmSfxMutatorPureComplete` in
`player-manager-update-pure-model.mjs`) and C++
(`isaac_pm_sfx_entry_gate` / `isaac_pm_sfx_mutator_pure_complete`) sides
implement the same decision matrix: MISS || DISABLED -> host call dropped;
ready==0 -> legacy always-host; NO_SAMPLES -> warn-log host kept; LIVE ->
stop loop host kept.

State **476** / runtime **2096** / events **392**. ABI version equality: C++
header, JS model, spec JSON, verifier, and tests all pinned to 60.

Wiring bug found and fixed while landing: the model carries three runtime
maps (step inline map, `normalizeRuntimeInputsForLayout`, and the
`resumeGameUpdateRoomUpdateHead` resume inline map). The step map had the
sfx fields but the resume map did not, so resume-path cases still saw
`ready === 0` and kept the host edge after the first step reported a pure
skip — fixed by mirroring the four captures in the resume map. The
normalizer (verifier-facing) already had them.

Verification: differential **5130 cases** pass (8 new pinned STOP cases:
MISS span = -1, in-range MAGIC span, NO_SAMPLES, DISABLED, DISABLED with
widened parent 0x100, LIVE, ready = 0 legacy, torn span); sfxStop pure-skip
**129**, host **35**, fallback **148**; wasm 29471 bytes, zero imports.
Mutants, both sides, killed and reverted: JS gate forced host, C++ gate
forced host, JS byte test widened to u32, C++ byte-mask dropped — all
rejected by the pinned cases; reverted exactly.

Unit suite 27/27 (slice+pipeline); full npm test 823 / 804 pass /
19 env-only baseline failures (unchanged).

Honest counter: opaque boundaries stay **53** — MISS/DISABLED are now pure
no-ops on the Game::Update path, but the NO_SAMPLES warn-log and LIVE stop
loop remain host, so the boundary at `0x0092e230` is narrowed, not removed.
Next candidates: the remaining frame-opaque family bodies
(`0x006fd7c0` / `0x0098dba0` / `0x00421b3c`), and the generic-prompt
sub-blocks (`0x009a2b30` / `0x009b6840`) noted in v59.


### ABI v59 (Update slice; v58..v59 landed; opaque 53; 2026-08-06)

The tracked checkpoint is ABI **v59**. `Game::Update` is instruction-complete
up to the epilogue; the remaining Update work is depth, collapsing opaque
boundaries. Opaque boundaries: **53** (unchanged — v59 gates one host edge,
it does not remove the boundary: when the entry gate is open the body still
runs host).

**v59 work unit — `State24ecc_Update` (VA 0x008ef990) entry no-op gate
(call @ 0x006fb8fc).** Re-transcribed the PE entry gates branch-by-branch:

- `0x8ef99e: cmp dword ptr [ecx], 1` / `jne exit` — the whole body is a
  no-op unless `state24ecc == 1`.
- `0x8ef9af: cmp byte ptr [ecx+0x22ed0], 0` / `je exit` — a second no-op gate;
  nothing but the SEH prologue runs before either gate, and both exits restore
  the frame exactly, so the both-closed path is side-effect-free.

The old `opaque_call_008ef990` host edge was pure-gated at the Game::Update
callsite: with the capture present, the host call drops entirely whenever
`state24ecc != 1` or `byte[Game+0x22ed0] == 0`; the `RETURN_AFTER_STATE_24ECC_UPDATE`
early return still fires on every state-24 branch (PE-exact). Two new runtime
inputs capture the byte (`state24ecc22ed0Ready` @ 2072, `state24ecc22ed0Flag` @
2076); `ready == 0` preserves the pre-v59 always-host behavior byte-for-byte.

State **476** / runtime **2080** / events **392**. ABI version equality: C++
header, JS model, spec JSON, verifier, and tests all pinned to 59.

Verification: differential **5122 cases** pass (pure-skip `State24ecc` 239,
host-gate 649; 6 new hand cases incl. `state24ecc: 0x7ffffff0` + flag and
`state24ecc: 2` + flag with `ready: 1`); wasm 29346 bytes, zero imports.
Mutants, both sides, killed and reverted: JS `!ready || flag != 0` (dropping
the `state24ecc === 1` term) — differential case 43 (`state24ecc: 2`, flag
255, ready 1) rejects; C++ `gate_ready == 0 || gate_byte != 0` — same case
rejects. Unit suite 27/27 (slice+pipeline); full npm test 823 / 804 pass /
19 env-only baseline failures (unchanged).

Next boundary: the two generic-prompt sub-blocks remain candidates at
`0x009a2b30` / `0x009b6840` depth, which the gate-and-early-return pattern
above can reach once their internal branch sets are fully transcribed.


### ABI v58 (Update slice; v57..v58 landed; opaque 53)

The tracked checkpoint is ABI **v58**. `Game::Update` is instruction-complete
(epilogue 0x006fbbba); the remaining Update work collapses opaque boundaries.

v58 folds the **`ItemOverlay::Update` state-1 countdown block** (VA
`0x009aca90`, `call 0x9aca90` @ `0x006fb5a2`, receiver `Game+0x1c034`). PE
truth verified branch-by-branch:

- At entry, `ItemOverlay::Update` reads the menu/range gate: when the menu is
  closed (`menuState23a74 == 0`) or a pause overlay/range is active
  (`globalRangeByteLength != 0`), state 1 is the **pure countdown**:
  `dec dword ptr [ecx+0x119c]` (counter = `Game+0x1d1d0`), then
  `cmp ...,0 ; jg stay` — signed on the **wrapped** 32-bit decrement. If the
  wrapped value is still > 0 the overlay waits another frame
  (`CONTINUE_AT_TIMED_TRANSITION`); on 0 or negative it flips state to 2
  (`RESUME_AFTER_ITEM_OVERLAY_UPDATE`). The PE's `dec` wraps: counter
  `INT_MIN -> INT_MAX` stays, `0 -> -1` flips; the C++ side computes in
  unsigned to avoid signed-overflow UB and re-casts for the signed `jg`.
- States 0 (idle) and 2+ keep the pre-v58 behavior: `itemOverlayUpdateCalls`
  increments and the host still runs the 43-callee merchant/overlay UI body on
  the resume edge. That residual keeps the boundary count at **53/58**.

1 sparse state field appended (struct 472 -> 476 bytes, `Game+0x1d1d0`,
offset 0x1d1d0 in `BINARY_LAYOUT`); no constants/events/runtime change.
The countdown arithmetic lives in both `stepGameUpdateSlice` (JS, `|0` wrap)
and the C++ step export (`uint32_t` wrap + `int32_t` signed `> 0`). The
recapture override (`resumeItemOverlayState`) still applies only to host
state-2 entries; the fold's own `2` output matches the host resume default.

Verified: 5116 differential cases (abiVersion 58) — new counter families all
> 0 (pure-stay 1016 / pure-flip 24 / host 2514 / overlay-resume 474),
`abi.json` zero imports / wasm 29480 bytes, `verification.json` pass. Mutants
killed on both sides: JS stay-predicate inversion (`>= 0`) fails the v58 unit
test (12 !== 10); C++ same inversion fails the differential (INT_MIN corpus
case), both reverted. `git diff --check` clean; safety checker passed.

### ABI v57 (Update slice; v56..v57 landed; opaque 53)

The tracked checkpoint is ABI **v57**. `Game::Update` is instruction-complete
(epilogue 0x006fbbba); the remaining Update work collapses opaque boundaries.

v57 gates the **LuaEngine frame-unref residual `0x008607a0`** — the LAST
sequential host call in `Game::Update` (PE `call 0x8607a0` @ `0x006fbba5`,
right before the epilogue). Branch-by-branch re-transcription:

- Pure prologue: reads `engine = *(DAT_00c71690)`, `flagObj = *(engine)`,
  `flag = *(u8*)flagObj`; writes only stack locals (materialize this+0/+4/+8,
  SEH try level, REGISTRYINDEX `0xfff0b9d8`).
- Gate at `0x008607b6`: `test byte ptr [flagObj], 2 ; je skip`. When bit 1 is
  CLEAR the whole body is a PE-proven complete no-op (nothing outside the
  stack is touched before the skip) — the Update slice now DROPS the call
  entirely when the hybrid host supplied the captured flag
  (`luaFrameUnrefReady=1`, `luaFrameUnrefFlagByte` bit 1 clear).
- When bit 1 is SET the host still executes the `FUN_00872980` materialize
  residual + `luaL_unref` pair and `opaqueCall008607a0` increments as before;
  ready=0 (capture missing) keeps the exact pre-v57 always-host behavior.

2 runtime captures appended (struct 2064 -> 2072 bytes); no sparse state/event
layout change. The boundary stays on the opaque list (the active path is Lua
VM platform IATs), but the unconditional per-frame host edge on the sequential
tail is now a pure decision: 97 pure-skip / 39 active / 146 fallback cases in
the differential corpus. Verified: 5110 differential cases (abiVersion 57),
`abi.json` zero imports / 95 exports, `verification.json` pass. Mutants killed
on both sides (JS gate inversion → unit test; C++ gate flip → differential
case 111) and reverted. Trust `decomp/game-update-slice.json` +
`native/decomp/*.h` over this log (docs lag).



The tracked checkpoint is ABI **v56**. `Game::Update` is instruction-complete
(epilogue 0x006fbbba); the remaining Update work collapses opaque boundaries.

v55 landed the HUD_Message::text_out (0x00840c60) peel: the 0xa4/0x40 gate,
the exact `strcmp`-equivalence over the 3 captured dwords (w0/w1 + EOS) and the
`if (bytes > ...)` recursion were folded; only the two `std::string` writes
stay host.

v56 fully translates the rank-display body of **VA 0x00857450** (the
Game+0x1d650 state machine) — pure in both the JS oracle (`rankDisplayBodyFold`)
and the C++ export (`isaac_game_update_slice_857450_body`). Branch-by-branch
re-transcription from the instruction stream:

- Block A (`sw==0`): 0x409030 state-update pair when byte+0x119, Play
  "Loading" replay gate (`ptr+0x44==0 || byte+0x54==0`), IsPlaying gate for
  "DisplayRankStart" (`AL && byte+0x39c && byte+0x39d`), exact 20-byte compare
  of the "DisplayRankStart" literal (5 captured dwords incl. the NUL byte)
  gating Play "DisplayRank", then `[esi+4]==4` gates Play "Appear" (`sw=1`).
- Block 1 (`sw==1`): 0x409030 pair on `byte+0x22d==0`, Loading/Idle/state-4
  transitions with post-call recaptures (`st_upd` / `st_after_loading` /
  `st_after_idle`), and the b3b0 tail clear (`dword+0x158==0 || byte+0x54==0`).
- Any other `sw` jumps straight to the common tail (both manager bytes at
  Game+0x4aa70/+0x4aba0 stay host residual).

21 runtime captures appended (struct 1980 -> 2064 bytes), 4 sparse outputs
(state `456 -> 472`), 4 chain-summary events (events `376 -> 392`). The host
still executes the anm2 Play/IsPlaying calls; the model now emits the exact
chain summary (`rankDisplayCalls`/`StateUpd`/`PlayMask`/`IsPlaying`) and all
sparse writes before them, so the boundary was REMOVED from the opaque list
(54 -> 53) and recorded in `resolvedBoundaries`. Verified: differential 5110
cases (incl. 86 rank-fold cases; EOS-byte and tail-gate mutants killed on
both sides), `abi.json` zero imports / 95 exports,
`verification.json` result pass. Trust `decomp/game-update-slice.json` +
`native/decomp/*.h` over this log (docs lag).


### ABI v54 (Update slice; v51..v54 landed; opaque 57 -> 56; historical)

The tracked checkpoint is ABI **v54** (v51-v53 landed since the v48 log).
`Game::Update` is instruction-complete (epilogue 0x006fbbba); all remaining
Update work collapses opaque boundaries. v54 removed the menu-aux boundary:
0x006fb870..0x006fb900 wrapper-aux sentinel self-links, `_Mysize` clear and
menu+0x12a4 clear are pure transforms of three captured runtime inputs
(`menu_aux_sentinel_ready` / `_sentinel_addr` / `_menu_addr`; struct
1956 -> 1968 bytes); the 0x0041d030 walk is pure (v51); the two raw frees and
the five wrapper writes stay host. Empty tree pure-complete (0 visits);
malformed / ready-without-sentinel fall back identically to pre-v54. Verified:
differential 5110 cases, abi.json zero imports / 93 exports, verification.json
pass. Trust `decomp/game-update-slice.json` + `native/decomp/*.h` over this
log (docs lag).

### Companion families (verified wave; ABIs at most recent landing, check headers)

- room helpers **v49** (spawn search-head pure core + clamp SITE A/B + door-proximity
  gate; v48 search-head iteration; v49 entity-proximity walk type ladder + 20.0f
  strictly-above reject + cmova latch fold). PATH_LROOM consumes render v30 0x81f8b0
  sparsify.
- frame-opaque **v24/v25** (0x40cfe0 default ctor; 0x40cca0 zero-init sibling:
  dword store + cap 0; byte-vs-dword law pinned by mutants).
- frame-effect **v7** (0x006fe3d0 MoveToRandomRoom frontier peel).
- sfx **v5** (0x92d140 C/D attribute walks); exit **v33** (Game::Exit root
  typed continuation plan: 41-event PE-ordered plan, full-dword steam-gate
  fix with wide-value mutants; anm2_reset_count now populated); player-manager
  **v10** (53/53 restored); render **v30** (0x81f8b0 row spars); allocator
  **v1** registered in frame-path-roots (15 ids);
  pgd **v7** (v6 named the importer 0x0092b2e0 and fixed the
  LAST_ARRAY_STORE_VA pin; v7 translated the sibling import 0x0092b930
  PGDEX 31-row coverage law incl. its own 161-arm event remap 0x0041ddb0);
  processInput **v24**; room-transition **v4**; lua **v20**
  (EntityRef data-builder band, 6 members / 17 exports); anm2 **v6** (v6 = the
  whole 0x0040a5d0 walk+apply residual as one pure plan
  `isaac_anm2_walk_apply_plan`: unsigned 0x13c-stride name walk, miss warn
  log + hit state-apply routing, `host_call_count`==1 both paths; the
  receivers 0x00408830/0x00408970 stay host with their own plans; the
  v5 test-suite reconciliation fixed 4 wrong expectations — Play-gate skip
  0, floor `>>>0` bit compare, advance iterations 2, corpus int32
  resetFlag — 50/50 green with mutation checks; 0x00857450's five ANM2
  edges documented as the future wiring interface in
  section-notes/anm2-v6/NOTES.md, not wired into Update); hud **v9** (v10
  deep-chain continuation in flight); player-manager **v17** (`0x7c9ea0` update_red_hearts plan; v16 `isaac_pm_heal_plan` translated the SEH heal burst `0x007ca2d0` — Ultra Greed coin ANM2, spawn thunks, 20-hidden-MT-draw RNG burst, midas-freeze tail; v17 `isaac_pm_heal_emit_plan` closed the 12-callsite clamp wrapper `0x007ca7c0` (game-mode/dead/red gates, emitted capacity law, emit-flag low byte, cap storeback); `heal_host_va` records 0; 8+1 exports asserted; 105/105 family tests; mutants killed: gate, store-ge, store-invert, flag-full-dword, capacity swap, min-alias).
  playerhud **v16/v17** (v16 fixed four PE divergences, mutation-pinned;
  v17 added the pure UpdateHearts call-site plan — twin path issues
  UpdateHearts(hud+0x10,6,player) then UpdateHearts(hud+0x70,6,twin),
  single path UpdateHearts(hud+0x10,0x18,player); second call re-reads
  [player+0x1d98] live; 26/26 family tests green with 4 v17 mutants
  killed).
### Hybrid status

On the platform host, when the slice is served:

- **Update control flow** is native-wasm hybrid capture/apply
  (`runHybridGameUpdateTick` / `createNativeUpdateSession`).
- **Residual callees** execute through `createResidualHostHandler` as native
  stubs or peels (not pure translated bodies, and not PE).
- **Sparse session state** lives in a JS-owned Game-object buffer + sparse
  struct; it is **not** yet live `Game*` capture/apply from PE guest RAM.
- **Path B** remains 100% PE for the full playable loop.

Do not claim an FPS win until the live playable loop owns native Update with
measured parity against the original.

Next work ports remaining opaque callee bodies (especially VA `0x00802980` and
frame-manager helpers) and the other port roots (`Game::Render` at
`0x00806c20`, `ProcessInput`, `Exit`, LuaEngine) so residual host events shrink
to platform/IO only.

ABI v17 peels pure companions B0, B2, B6, B10, B12 shell, B14, B15 rain timer,
B16 water/lava float shell, B17, mid-tail `Room+0x706c` expire countdown, and
mid-tail `Room+0x7230` from VA `0x00802980` and splits the former mid host: pure
B0 entry clear of `Room+0x7220` via `isaac_room_entry_clear_7220` runs in
`continue_to_frame_manager_updates` before residual `opaqueRoomUpdatePrefix`
(B1–B11 without pure B0/B2-countdown/B6/B10); on
`RESUME_AFTER_ROOM_UPDATE_PREFIX` pure B2 `Room+0x7764` collectible-timer
countdown via `isaac_room_countdown_dec_if_nonnegative` (`if >= 0 then --`, so
0 becomes -1; host pool/spawn and set-to-60 stay residual), pure B6
`Room+0x7298` countdown, pure B10 boss snapshot
`Room+0x7224 = max(0, +0x12c8 + +0x12cc)` via `isaac_room_boss_count_snapshot`,
then pure B12 clear-delay shell via `isaac_room_clear_delay_step` on sparse Room
fields `+0x11ec/+0x12c0/+0x12c4/+0x723c/+0x8` plus resolved descriptor subtype
and runtime `Game[0x997a]`; then B12 clear host fragments (ABI v19/v21):
`roomTriggerOutput` (exact `Room::TriggerOutput(9)`), nested
`opaqueCall006fd7c0` with `RESUME_AFTER_ROOM_CLEAR_NESTED` (27) recapture for
type 0x10 subtype 3, `opaqueRoomUpdateClearPath` (player-flag + door-slot
`FUN_00710dd0`), pure `Room::TriggerClear` entry via
`isaac_room_trigger_clear_entry` + ordered `roomTriggerClearStats` /
`roomTriggerClearAudio` / `roomTriggerClearAwards` residual body when
`(flags&9)==0`, always `opaqueRoomUpdateClearDoors` →
`RESUME_AFTER_ROOM_UPDATE_CLEAR` (26) → `opaqueRoomUpdateAmbient` (B13) →
`RESUME_AFTER_ROOM_UPDATE_HEAD` (24) pure B14 camera/FX via
`isaac_room_camera_fx_lerp_step` on `+0x70cc…+0x70f8`, pure B15
`Room+0x7214--`, pure B16 `Room+0x7240`/`+0x7740` water/lava float shell via
`isaac_room_water_lava_float_step` (PE `DAT_00baa120=0.1`,
`DAT_00baa454=1.0`, `DAT_00baa3f4=0.92`, `DAT_00baa020=0.001`; runtime
`challenge0x123` from `FUN_009305f0(0x123)`; host residual keeps type-7 grid
walks, `FUN_00823540`; pure `|0x100` peeled in ABI v20), pure B17
`Room+0x722c--`, pure mid-tail `isaac_room_countdown_dec_expire_neg1` on
`Room+0x706c` (host `FUN_008158a0` on expire stays residual), pure
`Room+0x7230--` (periodic spawn residual), then ABI v20 ordered tail host
residuals `opaqueRoomUpdateTailRain` / `WaterHost` / `Entity` / `Path` plus
exact `PlayerManager::Update` and VA `0x004257b0`. Continuations: prefix (25)
→ clear (26) → head (24). Freestanding helpers remain in
`native/decomp/room_pure_helpers.{h,cpp}` (helpers ABI v8; pure B16 includes
descriptor `|0x100` band; TriggerClear entry wired into Update clear-path;
door early-out still freestanding) with oracle
`scripts/decomp/room-pure-model.mjs`.
B10 fatal deathspawn warn stays host residual. B8 path-cost decay deferred:
needs full `Room+0x76c`/`+0xe6c` grids (not sparse).

ABI v18 wires freestanding `isaac_frame_opaque_4212c0_try_pure` into
`continue_after_menu_update` after VA `0x0098dba0`. Sparse Game fields
`+0x1d2ec` (mode), `+0x1d2f0` (secondary), `+0x1d328` (field_3c), `+0x1d338`
(flag_4c), `+0x1d3fd` (flag_111) plus runtime `frameOpaque4212c0SlotChar`
(resolved byte at receiver+56*(secondary+6)) feed the pure-complete shell.
When residual is unreachable (`mode==0` no-op; mode==1 scalar clear;
secondary==3 with field_3c==0 clear both), sparse mode/secondary are applied and
`opaqueCall004212c0` is skipped. When `flag_111!=0` or
`(secondary==3 && field_3c!=0)`, sparse fields are left untouched and the host
event fires for the full body (`FUN_00409030` pair / `FUN_0040add0` path /
nested `0x006fd7c0` / `0x008318a0`). Helpers ABI remains v1.

ABI v19 fragments the former monolithic `opaqueRoomUpdateClear` into four host
events after pure B12 clear-delay shell: exact `Room::TriggerOutput(9)`
(`roomTriggerOutput`, VA `0x00823080`) when clear-side and
`(roomDescFlags44 & 1)==0`; nested `FrameEffect_6fd7c0` for type 0x10 subtype 3
with dedicated `RESUME_AFTER_ROOM_CLEAR_NESTED` so the host can recapture Game
sparse (`counter265c0` / room transition) before type-5 doors; clear-path
residual `opaqueRoomUpdateClearPath` (player-flag clear, door-slot
`FUN_00710dd0`, optional exact `Room::TriggerClear(false)` at `0x008068f0`
when `(flags&9)==0`; skipped for type 0x10 subtype 2/3); always-run type-5
door loop `opaqueRoomUpdateClearDoors`. Sparse `roomDescFlags44` is the
resolved descriptor flags at `*(Room+0x4)+0x44`. ABI v19 also splits
former `opaqueRoomUpdatePrefix` into ordered host residuals
`opaqueRoomUpdatePrefixB1` → `B2` → `B3B11` (continuations 28 / 29 / 25). No
pure islands require recapture between those host segments; pure B2/B6/B10 stay
post-prefix.

ABI v20 peels pure B16 descriptor `|0x100` band into
`isaac_room_water_lava_float_step` (room pure helpers ABI v8; PE
`DAT_00baa3d8`/`DAT_00baa3e8` post-add pre-clamp water test) and splits the
former monolithic `opaqueRoomUpdateTail` into ordered host residuals
`opaqueRoomUpdateTailRain` (B15 spawn) → `opaqueRoomUpdateTailWaterHost`
(B16 grid/`FUN_00823540` + mid-tail; **ABI v24 splits** into conditional
`TailWaterB16` + always `TailMid`) → `opaqueRoomUpdateTailEntity` (B18) →
`opaqueRoomUpdateTailPath` (B19+B20), all emitted on
`resume_room_update_head` after pure B14/B15/B16/B17/706c/7230 with no
intermediate continuations. `FrameOpaque_4257b0` was always-emitted until
ABI v24 pure gate.

ABI v21 peels pure `Room::TriggerClear` entry (`Flags |= 1`, `ClearCount++`
int16 wrap via `isaac_room_trigger_clear_entry`) out of
`opaqueRoomUpdateClearPath`. Sparse `roomDescClearCount4a` is ClearCount at
`*(Room+0x4)+0x4a`. When clear path runs and pre-entry `(flags & 9) == 0`,
the pure entry updates sparse flags/count, then residual host covers the body
from `FUN_009e5960` onward (must not re-run entry or ClearCount doubles; ABI
v30 splits that residual into stats/audio/awards). `opaqueRoomUpdateClearPath`
is now player-flag clear + door-slot `FUN_00710dd0` only. Room pure helpers ABI
remains v8; freestanding `isaac_door_helper_710dd0_early_out` is still not
wired into Update residual.

ABI v22 wires `FrameEffect_6fd7c0` pure terminals (dual-gate `counter265c0`
clear + always `byte67744=0` via `isaac_frame_effect_6fd7c0_apply_terminals`)
into `resume_room_clear_nested` / `resume_room_transition_effect` after host
residual; mode-4 SFX early skips pure terminals.

ABI v23 peels pure B18 `Room+0x7894=0` and pure B19 `Room+0x7769=0` terminal
flag clears (via `isaac_room_entry_clear_7220`) out of
`opaqueRoomUpdateTailEntity` / `opaqueRoomUpdateTailPath` on
`resume_room_update_head`. Sparse zero-extended `roomFlag7894` /
`roomFlag7769` are recaptured after ambient; residual entity walk and path
rebuild+B20 exclude those stores. Always writing 0 matches the machine
(already-zero flags stay zero). Room pure helpers ABI remains v8. Update ABI
is 23.

ABI v24 peels three residual boundaries without mid-engine host splits:

1. **FrameOpaque_4257b0 pure gate** — emit `opaqueCall004257b0` only when
   `timedTransitionCleanupMode < 2` (`isaac_frame_opaque_4257b0_needs_host`).
   `mode >= 2` is a pure no-op; skip is safe (no sparse post-state). Pass A/B
   vector walks stay host when the gate is open.

2. **Engine pure sparse dual-gate under `0x006fd7c0`** — freestanding
   `FUN_0082ee40` helpers ABI v1 already exist. Full mid-body setup/start/player
   islands still cannot move after the whole CALL (player loop reads `this+0x1c`
   written in setup). ABI v24 wires only the **already-sparse dual-gate stores**
   that P4 already depends on: after host residual without those stores / P4,
   when `!mode4 && !early_skip_setup(gate1ba78, site_anim)` apply
   `predicate1ba74=0` and `gate1b83c=1`, then P4. Site anim is fixed per resume
   (effect-expire `20`, clear-nested `0`). Early-skip correctly skips pure
   dual-gate writes. Remaining engine islands (ANM2, slot/dim, non-sparse
   setup/start, player float reset) stay freestanding; host still owns log /
   ANM2 / player loop / SFX / non-sparse fields inside `opaqueCall006fd7c0`.

3. **B16 grid residual split** — room pure helpers ABI v9 adds
   `isaac_room_b16_needs_*` (PE `DAT_00baa198` bits `0x3e4ccccd` = 0.2f).
   Former `opaqueRoomUpdateTailWaterHost` splits into conditional
   `opaqueRoomUpdateTailWaterB16` and always `opaqueRoomUpdateTailMid`.

ABI v25 wires **FUN_00710dd0 pure early-out** with eight resolved door runtime
slots (`Room+0x724[i]` present + `+0x3a0`/`+0x8`/`+0xc`; room pure helpers ABI
v10 aggregates `isaac_door_slots_710dd0_any_needs_host` /
`any_type5_needs_host`):

1. **Clear-path split** — `opaqueRoomUpdateClearPath` is player-flag only;
   new `opaqueRoomUpdateClearDoorSlots` emits the clear-path door loop only
   when any present slot fails pure early-out.
2. **Type-5 gate** — `opaqueRoomUpdateClearDoors` uses pure type-5 early-out
   when the door snapshot is still valid (clear-path door residual skipped /
   not entered / nested path). When clear-path doors ran, type-5 is forced
   (host may have written `field_c=5` or opened doors).
3. **`resume_room_clear_nested`** now takes `runtime_inputs` for the type-5
   gate.

ABI v26 fragments former monolithic `opaqueCall006fd7c0` under both Update
sites (effect-expire anim=20 and B12 nested anim=0):

1. **Mode-4** — `opaqueCall006fd7c0Mode4Sfx` only (SFX early; no shell/engine/P4).
2. **Main path ordered residuals** — `opaqueFrameEffect6fd7c0Shell`
   (705ee0/blue-room) → `opaqueRoomTransitionEnginePrefix` (FUN_0082ee40 H0 log
   + H1 optional ANM2; always before early-skip) →
   `opaqueRoomTransitionEngineBody` only when
   `!early_skip_setup(gate1ba78, site_anim)` (setup/player/start/SFX without
   pure dual-gate stores).
3. **Pure dual-gate + P4** still apply on existing resumes when mode!=4.
4. **No mid-engine continuation** this unit: non-dual-gate setup/start fields
   and player vector stay host inside body (sparse expand deferred).

Also freestanding **FUN_0070ee40 pure early-out** (`door+0x149==0`) in room
pure helpers ABI v11 — nested inside 710dd0 OPEN_TAIL; not Update-wired.
Room prefix/tail residuals: no new pure islands (B8 path-cost still needs
full grids; B1/B3–B11/B15–B20 host-only).

Update ABI was 26. Events size 204.

ABI v27 wires **MenuGate_Update pure early-out** (VA `0x009b6840`, frame opaque
pure helpers ABI v2 `isaac_menu_gate_update_needs_host`) into gate `1d520`,
`continue_after_menu_open`, and `resume_item_overlay`. Emit
`opaqueCall009b6840` only when `menuState23a74 != 0` and not
`(gate1b83c != 0 && predicate1ba74 != 0)` — PE prologue early return, no writes.
Residual menu body stays host. Analysis of dual-site hot hosts
`opaqueCall0098dba0` (receiver `Game+0x25ecc`) and `opaqueCall009b7680`
(MenuGate_Open) found **no pure-complete peels**: `0098dba0` always walks the
player vector (fatal if empty) before its float state machine; Open always
mutates and calls many residual hosts.

ABI v28 expands engine pure sparse on `0x006fd7c0` resumes to full
`FUN_0082ee40` start-state (`gate1b83c=1`, `engineField8/C` at `0x1b844/0x1b848`,
`engineFloat22c/230` at `0x1ba68/0x1ba6c` via
`isaac_room_transition_engine_82ee40_apply_start_state` with slot=-1) plus
`predicate1ba74` clear when `!mode4 && !early_skip`. Host body residual excludes
those stores.

ABI v29 mid-engine pure setup multi-continuation:

1. Shell + engine prefix emit, then pause `RESUME_AFTER_ENGINE_PREFIX` (30)
   (mode-4 still jumps to site final cont without mid-pause).
2. Hybrid host supplies post-shell `engineCallRoom` / `engineCallDim` /
   `engineGame18304` (blue-room may rewrite stack room to `-0x10`).
3. Pure setup via `isaac_room_transition_engine_82ee40_apply_setup` writes
   sparse `engineField4/10/14/18/1c/20/24` + `predicate1ba74=0` when
   `!early_skip`; then `opaqueRoomTransitionEngineBody` is player-loop +
   `Game+0x1bb74` write only.
4. Site resumes keep pure start-state + P4. `engineSiteAnim` event carrier
   (20 site A / 0 site B). State 392, runtime 180, events 208.

ABI v30 residual host fragmentation (no new pure islands):

1. **Room::TriggerClear body** — replace monolithic `roomTriggerClear` with
   ordered `roomTriggerClearStats` (`FUN_009e5960` + optional stage-progress) /
   `roomTriggerClearAudio` (gated `007f7a40` + always `007f83b0` + playSound==0
   `SFXManager::Play`) / `roomTriggerClearAwards` (non-greed music suite +
   optional `Flags|0x10000` + `(Flags>>7)&1` awards + greed special +
   `FUN_00705ee0`). Host owns mode!=2/3 and Flags bit7 gates; pure entry
   unchanged.
2. **FrameOpaque_4257b0** — after pure mode gate (`mode < 2`), emit
   `opaqueCall004257b0PassA` (ID ensure walk) then `opaqueCall004257b0PassB`
   (0x68 list tick). mode>=2 still pure no-op for both.
3. **B13 ambient** — reconfirmed no pure islands (RNG/spawn suite /
   `FUN_008024f0`/`007f01c0`/`00824800`…); remains single
   `opaqueRoomUpdateAmbient`.

Events size 220. State/runtime unchanged (392 / 180) at v30.

**FUN_0070ee40** stays freestanding.

ABI v31 (two residual peels on the hot path):

1. **FUN_0098dba0 multi-cont** — freestanding pure islands (frame opaque helpers
   ABI v3) wired into Update at both call sites (gate `1b83c` batch + frame-aux):
   host `opaqueCall0098dba0PlayerWalk` → `RESUME_AFTER_98DBA0_PLAYER_WALK` (31)
   with runtime `bVar2` / `Manager+0x2a35c` / `Game+0x216e9`; pure counter step
   (optional `FUN_00746560(1)`); host timer residual; pure mode/float step;
   gated exact `HUD_Message::text_out`; pure clamp. Site carrier selects post
   resume (HUD + `RESUME_AFTER_GATE_1B83C_UPDATES` vs `FrameOpaque_4212c0` +
   `RESUME_AFTER_FRAME_AUX_UPDATES`). Sparse receiver `Game+0x25ecc` pack.

2. **Room::TriggerClear residual pure gates** — sparse `difficulty269c8` at
   `Game+0x269c8` (PE int-index `0x9a72`). Room pure helpers ABI **v12**:
   `isaac_room_trigger_clear_is_greed_mode` / `needs_non_greed_host` /
   `needs_awards_bit7_walk`. Ordered host fragments:
   stats (always) → audioNonGreed (`7f7a40`, !greed) → audio always
   (`7f83b0`+SFX) → awardsNonGreed (!greed) → awardsBit7 ((flags>>7)&1==0) →
   awardsGreed (mode 2/3) → awardsTail (`705ee0` always).

**High-heat reconfirm (no pure peels this unit):** B13 ambient (RNG/spawn suite
stays single `opaqueRoomUpdateAmbient`); engine player-loop residual
(`opaqueRoomTransitionEngineBody` — player vector + `Game+0x1bb74`; Update path
player arg is always 0); `PlayerManager::Update` (PM0 dual-zero gate only
gates TriggerDeath; PM2/PM3 always run — no whole-call pure skip).

State 416 / runtime 192 / events 248. Update ABI was **31**.

ABI v32 residual host fragmentation + pure gates on the hot fallthrough:

1. **TailMid PE-ordered split** (room pure helpers ABI **v13**):
   - `opaqueRoomUpdateTailMid` = always curse `FUN_00820910` + `FUN_00801ee0` +
     `FUN_00800500` (excludes expire/restock/spawn)
   - `opaqueRoomUpdateTailMid706cExpire` pure-gated by
     `isaac_room_706c_needs_expire_host(pre)` when pre>0 && (pre-1)<1
     (`FUN_008158a0` only)
   - `opaqueRoomUpdateTailMidRestock` always (challenge 0x209 host-internal gates)
   - `opaqueRoomUpdateTailMid7230Spawn` pure-gated by
     `isaac_room_7230_needs_spawn_host(pre)` when pre>0 && pre%5==0
   Pre-timers captured before pure countdown peels on `resume_room_update_head`.

2. **B18 entity walk pure gate** — emit `opaqueRoomUpdateTailEntity` only when
   pre-clear `Room+0x7894` nonzero via `isaac_room_b18_needs_entity_walk_host`.
   Pure flag clear still always writes 0. Path residual (B19+B20) stays always
   (B20 trail list is not flag-gated).

3. **PlayerManager::Update ordered fragments** — replace monolithic
   `playerManagerUpdateCalls` with:
   - `playerManagerUpdateDeath` when pure dual-zero PM0
     (`gate1b83c==0 && gate1ba78==0`) — PM1 `TriggerDeath` walk
   - `playerManagerUpdateHeartbeat` always — PM2 intensity max + PM3 SFX

**Reconfirmed no pure peels this unit:** B13 ambient; engine player-loop body
(player vector + `Game+0x1bb74`; float resets need player objects); 4257b0 Pass
A/B bodies (heap ID list / 0x68 records); B8 path-cost (full grids).

State 416 / runtime 192 / events **264**. Update ABI was **32**.

ABI v33 pure-adjacent peels on the hot fallthrough:

1. **FrameOpaque_4257b0 Pass A/B empty gates** (frame opaque helpers ABI **v4**):
   - runtime `frameOpaque4257b0IdCount` = `FUN_009b9480()` result
   - runtime `frameOpaque4257b0ListCount` = pre-Pass-A `(end-begin)/0x68`
   - Pass A only when mode `< 2` and `id_count != 0`
   - Pass B when mode `< 2` and (`id_count != 0` may insert **or**
     `list_count != 0`); both empty → pure no-op open-gate body

2. **B8 path-cost pure gate** (room pure helpers ABI **v14**):
   - former `opaqueRoomUpdatePrefixB3B11` → always `B3B7` / pure-gated `B8` /
     always `B9B11`
   - gate: `frameCounter264f8 % 3 == 0 && roomGridCells > 0` via
     `isaac_room_b8_needs_path_cost_host`
   - freestanding pure cell/grid step (`isaac_room_b8_path_cost_cell_step` /
     `grid_step`) for later blob wire; when gate open host still owns the
     `Room+0x76c`/`+0xe6c` walk (full grids not sparse runtime blobs this unit)

**Reconfirmed no Update peel this unit:** B13 ambient (RNG/spawn suite);
engine player-loop body (player objects + interleaved host 82eb90/7abcc0);
HUD pure-complete idle (`isaac_hud_post_update_try_pure` still freestanding —
seven call sites, missing `runtime_inputs` on several resumes, Manager global).

State 416 / runtime **204** / events **272**. Update ABI was **33**.

ABI v34 pure peels on the hot fallthrough:

1. **B8 full pure grid apply** (capped scratch blobs, MAX **448** cells =
   Room+0x76c..+0xe6c layout):
   - runtime `roomB8BlobReady` + module scratch
     `isaac_game_update_slice_b8_{costs,trails}_address`
   - when B8 gate open and blob ready: pure
     `isaac_room_b8_path_cost_grid_step` mutates scratch; **no**
     `opaqueRoomUpdatePrefixB8` host residual
   - when gate open and blob not ready: host residual over live Room grids
     (backward-compatible with ABI v33 host path)

2. **Engine empty-player pure `Game+0x1bb74=0`**:
   - sparse `enginePlayer1bb74` at Game+0x1bb74
   - pure setup always writes 0 (Update path player arg is always 0)
   - runtime `enginePlayerCount` = Game+0x1baa8 vector size
   - body host residual only when count > 0; empty vector is pure-complete
     after setup (empty loop + pure 1bb74 write)

**Reconfirmed residual:** B13 ambient; non-empty player-loop hosts
(82eb90/7abcc0/7abe20 + float resets); HUD pure-complete idle unwired.

State **420** / runtime **212** / events **272**. Update ABI was **34**.

ABI v35 pure peel on the hot fallthrough:

1. **Engine non-empty player-loop pure float reset** (player-object runtime):
   - runtime `enginePlayerBlobReady` + module scratch
     `isaac_game_update_slice_engine_player_{eligible,f360,f364,f410}_address`
     (MAX **8** = `ISAAC_ENGINE_PLAYER_MAX`)
   - hybrid host fills `eligible[i]` when `player[i]+0x2c==0` for
     `i in [0, enginePlayerCount)`
   - when blob ready and count fits MAX: pure
     `isaac_room_transition_engine_82ee40_player_entry_float_reset` writes
     PE `DAT_00c7b640/644` into `+0x360/+0x364` and `+0x410=0` for each
     eligible entry; **body host residual only if any eligible** and then
     owns only `82eb90` / `7abcc0` / `7abe20` (excludes float stores)
   - all-ineligible with blob ready → pure-complete body (no host)
   - blob not ready → full body residual (hosts+floats) as v34
   - empty `enginePlayerCount==0` still pure-complete after setup (`1bb74=0`)

**Reconfirmed residual:** B13 ambient; player-loop hosts
(`82eb90`/`7abcc0`/`7abe20` when any eligible and `player_loop_needs_host`);
nested PlayerHUD residual (`0x00842230`); gate `1ba78` HUD always-host.

State **420** / runtime **216** / events **272**. Update ABI was **35**.

ABI v36 pure gate on engine player-loop residual:

1. **FUN_0082eb90 pure predicate** (helpers ABI **v2**):
   `isaac_room_transition_engine_82eb90_predicate(field_1c)` returns true for
   `field_1c ∈ {3, 0xc, 0xd, 0xb}` (PE at VA `0x0082eb90`).
2. **Player-loop host residual** only when any eligible **and**
   `isaac_room_transition_engine_player_loop_needs_host(field_1c)`:
   - 82eb90 true → residual may call `FUN_007abcc0` (entry+0x173 gate inside host)
   - else if `field_1c == 0x14` (anim 20) → residual may call `FUN_007abe20`
   - Update site B anim 0 with blob ready → pure-complete for those hosts after
     float resets; site A anim 20 still emits body residual for 7abe20

3. **HUD::PostUpdate pure-complete idle wire** (helpers ABI **v1**):
   `isaac_hud_post_update_try_pure(mask, history, stat)` on safe sites only:
   step transition + post-delay; `resume_98dba0` GATE_1B83C;
   `continue_timed_transition`; `resume_item_overlay` +
   `resume_frame_manager_updates` (both take `runtime_inputs`).
   Runtime adds `playerHudOccupiedMask` / `managerHistoryCount` /
   `managerStatFlag` (size **228**). Gate `1ba78` **always hosts** HUD
   (PE batches `0x0092f1c0` then HUD with no recapture).

State **420** / runtime **228** / events **272**. Update ABI was **36**.

### ABI v37 — B13 ambient pure 824800 + ordered host fragments

On `resume_room_update_clear` (now takes `runtime_inputs`):

1. Pure `isaac_room_ambient_824800_float_step` on sparse
   `roomAmbientCount7454` / `roomAmbientIntensity7458` / `roomAmbientFlag745c`
2. Ordered PE host fragments (pure gates where recovered):
   - H0 `8024f0` unless flags early-out
   - H1 `7f01c0` when needs_host
   - H2 stage spawn when may_rng after greed remap
   - H3 mode SFX **always**
   - H4 `824800` spawn when needs after pure float
   - H5 `824a70` **always**
   - H6 `24ee0` when vel != PE zero vector
   - H7 `74e9b0` **always**
   - H8 special `0x10/0x23` when needs_host
3. Summary `opaqueRoomUpdateAmbient = 1` when any fragment residual emits

Runtime adds `ambientDescPresent` / `ambientDescId` / `ambientPlayerCount` /
`ambientVelX7460` / `ambientVelY7464` / `ambientStage` / `ambientStageType`.

State **432** / runtime **256** / events **308**. Update ABI was **37**.

### ABI v38 � pure-gate ambient H3 / H7

Uses room pure helpers **v16**:
1. **H3 mode SFX** � emit only when `mode_sfx_needs_host(mode_26584, roomTransitionMode1830c)`
   (pure skip when `mode != 0x2c && 1830c == 2`)
2. **H7 74e9b0** � emit only when `!74e9b0_pure_false(difficulty, ambient_stage, flags_2654c)`
3. **H5 824a70** remains always-host

Sparse Game: `mode_26584` @ `+0x26584`, `flags_2654c` @ `+0x2654c`.
State **440** / runtime **256** / events **308**. Update ABI was **38**.

### ABI v39 � gate 1ba78 recapture + H5 824a70 pure needs_host

1. **Gate 1ba78:** emit `opaqueCall0092f1c0` then `RESUME_AFTER_92F1C0` (32). Host applies residual and recaptures HUD scalars; `resume_92f1c0` runs `try_pure` then `RETURN_AFTER_GATE_1BA78`. Do **not** pure-skip on pre-call inputs (`0x0092f1c0` reaches `Level::Init` / HUD invalidate).
2. **H5 824a70:** `isaac_room_ambient_824a70_needs_host` (room helpers **v17**) pure-gates body residual. Runtime: `ambientStageId` / `ambientRoomSubtype1bb0` / `ambientRoomActive` / `ambientRoomEntry11f0` (+ existing `engineGame18304`).

State **440** / runtime **272** / events **308**. Update ABI was **39**.

### ABI v40 � PlayerHUD UpdateHearts peel (0x008422c5)

When `playerHudBlobReady` and occupied mask:
1. Pure P0 entry heart-byte clear
2. Host **PlayerHUD::UpdateHearts** exact ZHL `0x00841e20` � 1 call or 2 (twin gate pure predicate)
3. Pure P1 critical blink + P2 active-slot countdown
4. Host gfx residual (LoadImage/ANM2/trinket bulk)
5. Pure P3 float + P4 char countdown (pred from runtime)
6. Dirty notify host when countdown dirty
7. History/stat residuals separate

Without blob: monolithic `hudPostUpdateCalls`. Hybrid applies pure scratch after hosts in PE order.

State **440** / runtime **328** / events **328**. Update ABI was **40**.

### ABI v41 — multi-slot PlayerHUD packs

`HUD::PostUpdate` PE-loops eight slots (`HUD+i*0x6dc`). When `playerHudBlobReady`:

1. For each set bit in `playerHudOccupiedMask` (0..7), peel that slot from
   `player_hud_slots[i]` (52-byte pack: twin/type/3bc/hearts/flag1519/tramp/
   active0-3/float6b8/tailChars/tailPred).
2. Per occupied slot: pure P0-P4 + host UpdateHearts (1|2) + gfx + optional dirty.
3. Host event counters **sum** across slots (e.g. two occupied -> gfx residual 2).
4. History/stat residuals once after the full PlayerHUD loop (PE order).

Without blob: monolithic `hudPostUpdateCalls` as before. Legacy ABI v40 flat
slot-0 field names still accepted by the JS oracle as pack[0].

State **440** / runtime **692** / events **328**. Update ABI was **41**.

### ABI v42 — B1 outer gate + mid-restock pure wire

1. **B1:** `isaac_room_b1_frame_in_room_gate` on `continue_to_frame_manager_updates` — emit `opaqueRoomUpdatePrefixB1` only when Room active and frame-in-room age == 1 (inputs: ambientRoomActive / ambientRoomEntry11f0). Missing runtime forces residual (nullptr path).
2. **Mid-restock:** `isaac_room_mid_restock_needs_host` on `resume_room_update_head` — shop type + midRestockOwner0x209 + active + age>1. Default owner 0 pure-skips.

State **440** / runtime **696** / events **328**. Update ABI was **42**.

### ABI v43 — B1 once-flag pure wire

1. Sparse `gameFlags1839c` / `game_flags_1839c` at `Game+0x1839c` (float-slot
   `0x60e7`); capture/apply + layout lockstep.
2. On `continue_to_frame_manager_updates`, when outer B1 gate is open and
   `isaac_room_b1_once_flag_clear(pre)`: pure `isaac_room_b1_flag_or_80000`
   into sparse state **before** host residual.
3. Host residual `opaqueRoomUpdatePrefixB1` still owns SFX + spawn (and may
   dual-OR; OR is idempotent). Spawn/SFX fragmentation deferred (buffer
   begin/end + sfx gate inputs).

State **444** / runtime **696** / events **328**. Update ABI was **43**.

### ABI v44 — PM2 intensity pure + PM3 residual plan wire

`isaac_pm_intensity_wire_decide` is now wired on `resume_room_update_head`
(after optional death residual):

1. Runtime: `pmIntensityPlayerCount` / `pmIntensitySfxPlaying` /
   `pmIntensityBlobReady` + packs `pmIntensityRaw[i]` / `Flags[i]` /
   `Dead[i]` for `i in 0..7` (offsets 696..803; runtime **804**).
2. Events: monolithic `playerManagerUpdateHeartbeat` (MONOLITHIC) plus
   split `playerManagerUpdateHeartbeatSfxUpdate` / `SfxPlay` / `SfxStop`
   (offsets 328/332/336; events **340**). Pure-complete NONE emits none.
3. Default lockstep: `count=1` `blob=0` forces MONOLITHIC (matches prior
   always-heartbeat behavior when packs are not filled).
4. Hybrid residual HostHandler bodies for B1 SFX/spawn and PM3 SFX kinds
   are PE-free with exact Play imms; platform/IO for audio fragments.

State **444** / runtime **804** / events **340**. Update ABI was **44**.

### ABI v45 — B1 residual plan wire (SFX/SPAWN split)

`isaac_room_b1_wire_decide` is wired on `continue_to_frame_manager_updates`
(after pure B0 entry clear):

1. Runtime packs: `b1SfxReady` / `b1BufferReady` / `b1DescField40` /
   `b1NestedField10` / `b1Begin183a4` / `b1End183a8` (offsets 804..827;
   runtime **828**). Outer uses existing ambient active/entry; stage from
   `ambientStage`; boss from `ambientRoomSubtype1bb0`; room type + difficulty
   + flags sparse.
2. Events: monolithic `opaqueRoomUpdatePrefixB1` plus split
   `opaqueRoomUpdatePrefixB1Sfx` / `B1Spawn` (offsets 340/344; events **348**).
   Pure-complete NONE emits none. SFX_SPAWN emits both in PE order.
3. Default lockstep: `sfxReady=0` forces MONOLITHIC under open outer gate.
4. `resume_frame_aux` / `stage_transition` / `room_transition` now pass
   runtime into the B1 wire (scratch runtime).
5. Residual HostHandler bodies for B1 SFX/SPAWN are PE-free with exact Play
   imms (id `0xbe`).

State **444** / runtime **828** / events **348**. Update ABI was **45**.

### ABI v46 — mid-restock pure-complete body wire

`isaac_room_mid_restock_wire_decide` on `resume_room_update_head` (after mid
host residual, before 7230 spawn):

1. Runtime packs: `midRestockDescReady` / `DescAc` / `DescAe` / `DescSeed58`
   (offsets 828..843; runtime **844**). Outer gate still uses room type +
   owner + ambient active/entry.
2. **PURE_COMPLETE:** pure RNG body applies `roomDescShortAe` (state **448**)
   and skips `opaqueRoomUpdateTailMidRestock`.
3. **HOST_FATAL** (seed==0) and **MONOLITHIC** (`descReady=0`): keep host
   residual. Default `descReady=0` matches prior always-host under open outer.
4. H5 ambient residual still gated host at `0x00824bb3` (genrand×8 body;
   freestanding pure posts remain HostHandler metadata).

State **448** / runtime **844** / events **348**. Update ABI was **46**.

### ABI v47 — H5 residual fragment past pure prep

When `isaac_room_ambient_824a70_needs_host` is true:

1. Summary `opaqueRoomUpdateAmbient824a70 += 1` (residual open).
2. If `h5BodyBlobReady`: pure `isaac_room_ambient_824a70_body_bounds` yields
   `ambient824a70LoopCount` (1 or 5 from age); host residual fragments:
   - `opaqueRoomUpdateAmbient824a70Genrand += loop * 7` (R0–R3,R5–R7)
   - `opaqueRoomUpdateAmbient824a70Create += loop` (create/ANM2/GetLayer/vcall;
     conditional R4 genrand inside create body)
3. Without blob: summary only (HostHandler monolithic body, prior behavior).

Runtime packs: `h5BodyBlobReady` + Room floats `f14/f18/f1c/f20` + `room1d18`
(offsets 844..867; runtime **868**). Events **360**.

HostHandler residual bodies for summary / genrand / create carry PE-exact imms
(create type `0x3e8`, variant `0x8a`, GetLayer, genrand VA `0x006eef60`).

State **448** / runtime **868** / events **360**. Update ABI was **47**.

### ABI v48 — B3B7 + B9B11 residual plan wire

`isaac_room_b3b7_wire_decide` / `isaac_room_b9b11_wire_decide` on
`resume_room_update_prefix_b2` (after B2 host, around pure-gated B8):

1. Runtime packs (offsets 868..927; runtime **928**):
   - B3B7: `b3b7SparseReady` + TempEffects `teByte7321`/`teBegin`/`teEnd` +
     `descType0` + `treeCount7238` + `widthC`/`height10`. Outer uses existing
     `ambientRoomActive` / `ambientRoomEntry11f0` + state `frameCounter264f8`.
   - B9B11: `b9b11InputsReady` + `challengeResultNonzero` +
     `roomByte11f4`/`1d0d`/`7321` + TempFX list begin/end. Reuses ambient
     active/entry/`ambientRoom1d18`, state `roomType8` / `roomDescFlags44` /
     boss counts / `roomBossSnapshot7224` (pre-pure-B10), `globalClearSkip997a`.
2. Events: parent counters only (events **360** unchanged):
   - `!ready` → `residual_kind` MONOLITHIC → `opaqueRoomUpdatePrefixB3B7` /
     `B9B11` += 1 (lockstep prior always-host).
   - packs ready → HOST / ALWAYS_HOST; `host_needed` still 1 (FCO + manager
     chain always host) → same parent counters. Pure-gated `needs_*` drive
     HostHandler fragment pure posts when emit detail carries sparse packs.
3. Default lockstep: `b3b7SparseReady=0` / `b9b11InputsReady=0`.
4. B8 pure grid path unchanged between the two wires.

Still host (address-stable): B3 FCO/challenge/TE call, B4–B7 entity/grid bodies;
B9 FCO query + free body, B10 fatal, B11 manager/camera/Rewind/tempfx body.

State **448** / runtime **928** / events **360**. Update ABI is **48**.

### Multi-root frame path + pure-helper advances (post-v48)

`scripts/decomp/frame-path-roots.mjs` catalogs port roots Update / Render /
ProcessInput / Exit / LuaEngine and freestanding pure-helper modules under
`output/decomp/<name>-pure/`. `selectFramePathRoots` / `loadFramePathRoots` /
`createMultiRootFrameSession` select `native-wasm` without PE when modules
load. `scripts/serve.mjs` mounts `/@decomp/pure/*` → `output/decomp/*`.
`web/js/native-update-bridge.js` probes pure roots on boot (missing/stale ABI
non-fatal; Update tick stays PE-free).

H5 HostHandler: `applyH5GenrandPurePosts` applies PE-ordered pure posts between
always-on genrand slots when `event.genrandSamples` (≥7 dwords/loop) is set.
Full pure-complete still blocked by `Isaac::genrand_int32` + create residual.

| Pure helper | ABI | Next residual VA |
|-------------|-----|------------------|
| Render shell | **11** | stage-overlay / GetStageID host |
| ProcessInput | **9** | rumble vcall `0x00a1f65a` |
| Exit | **13** | residual `0x009b4810` |
| LuaEngine | **9** | SetReference wrapper `0x008a80e0` |
| Room | **26** | H5 genrand `0x00824bb3` / B1 SFX `0x00802a53` |
| Frame-opaque | **5** | 4212c0 residual gate `0x00409030` |

Post-v48 freestanding peels (Update ABI **48** wires B3B7/B9B11 plans):
- H5 create R4 anim_frame pure posts + HostHandler `applyH5CreatePurePosts`
- B1 spawn-iter pure pack (seed/shuffle/corner/world CF)
- Render a14270 alloc/throw pure prep (heap body still host)
- ProcessInput a68490 ns scale + post-tick delta pure
- Exit 408830 free/alloc pure CF
- Lua method-helper IAT-chain pure args (absindex/rotate/rawset)
- Frame-opaque 98dba0 timer pure step (genrand dword consumer)
- HostHandler 4257b0 Pass A/B pure-skip gates + timer sample path

Inventory (ignored notes): ~65 game-logic residual host kinds remain on the
Update HostHandler path after excluding 7 platform/IO kinds.

### PM2 intensity pure helpers ABI v3 (freestanding; Update-wired in ABI v44)

`native/decomp/player_manager_update_pure_helpers.{h,cpp}` +
`scripts/decomp/player-manager-update-pure-model.mjs` +
`tests/decomp-player-manager-update-pure-helpers.test.js`. Update ABI **v44**
wires `isaac_pm_intensity_wire_decide` into the frame path; residual PM3
hosts carry PE-exact SFX id `0x1fc` and Play imms.

PE (`PlayerManager::Update` @ `0x009bb5d0`, exact ZHL; callsite `0x006fba52`):

1. **PM0/PM1** — dual-zero death walk already fragmented (Update ABI v32)
2. **PM2** `0x009bb6b0…0x009bb76e` — pure max-clamp over player vector
3. **PM3** `0x009bb770…` — sound id `0x1fc`; pure `comiss` gate + host SFX

| Freestanding export (v3) | Role |
|--------------------------|------|
| `isaac_pm_intensity_*` eligible/clamp/contrib/max | PM2 pure island (v1 retained) |
| `isaac_pm_intensity_plan_from_{players,arrays}` | one-shot maxVol + start/stop gates |
| `isaac_pm_intensity_sfx_residual_kind` | NONE / UPDATE / PLAY / STOP |
| `isaac_pm_intensity_heartbeat_pure_complete` | residual_kind == NONE |
| `isaac_pm_intensity_heartbeat_plan` | deep plan: kind + pure_complete + PE Play imms |
| `isaac_pm_intensity_wire_decide` | empty / blob / incomplete / mono pure-complete matrix |
| `isaac_pm_intensity_play_{frame_delay,loop,pitch,pan}` | PE-exact Play args (2, 1, 1.0f, 0) |

**Empty player vector is not pure-complete by itself:** PE leaves maxVol=0 then
still runs PM3; pure-complete only when quiet **and** hybrid
`FUN_0092e560(0x1fc)==0` (not playing). Empty + not playing → whole heartbeat
pure skip; empty + playing → host STOP only.

#### Pure-complete decision matrix (Update-wired in ABI v44)

`isaac_pm_intensity_wire_decide(count, blob_ready, sfx_playing, packs, pack_count, out)`:

| Inputs | `residual_kind` | pure-complete? | PM2 pure? |
|--------|-----------------|----------------|-----------|
| `count==0` (no pack needed) | NONE / STOP | NONE only if `!sfx_playing` | yes (maxVol=0) |
| `blob_ready` && `1..MAX` packs covering count | NONE/UPDATE/PLAY/STOP | NONE only | yes |
| `count>0` && `!blob_ready` | **MONOLITHIC** | no | no |
| `blob_ready` but `pack_count < count` | **MONOLITHIC** | no | no (refuse under-max) |
| `count > PLAYER_MAX` | **MONOLITHIC** | no | no |

`IsaacPlayerManagerHeartbeatPlan` carries PE-exact host imms so a future wire
does not re-derive Play args:

- UPDATE: `0x0092df40(0x1fc, maxVol)` then `0x0092e050(0x1fc, 1.0f)`
- PLAY: `0x00956780()` then exact `SFXManager::Play` @ `0x0092dc30(0x1fc,
  maxVol, FrameDelay=2, Loop=1, Pitch=1.0f, Pan=0)`
- STOP: `0x0092e230(0x1fc)`
- NONE: no host
- MONOLITHIC: whole `playerManagerUpdateHeartbeat` host (PM2+PM3)

#### Update wire (ABI v44 applied)

On the existing heartbeat site (after optional death; `resume_room_update_head`):

```
// runtime:
//   pmIntensityPlayerCount = (end-begin)>>2 at Game+0x1baa8
//   pmIntensitySfxPlaying  = FUN_0092e560(0x1fc) != 0   // hybrid probe
//   pmIntensityBlobReady   + packs[i] {raw_1ea8, flags_168, dead_173}
//     for i in 0..min(count, ISAAC_PM_INTENSITY_PLAYER_MAX=8)-1

hb = isaac_pm_intensity_wire_decide(count, blob_ready, sfx_playing,
                                    packs, pack_count, &plan);

if (plan.pure_complete) {
  // residual NONE — do not emit heartbeat host
} else if (plan.residual_kind == MONOLITHIC) {
  emit playerManagerUpdateHeartbeat; // whole PM2+PM3
} else if (plan.residual_kind == UPDATE) {
  emit playerManagerUpdateHeartbeatSfxUpdate;
  // host: 0x0092df40(plan.sfx_id, plan.max_vol);
  // host: 0x0092e050(plan.sfx_id, plan.play_pitch);
} else if (plan.residual_kind == PLAY) {
  emit playerManagerUpdateHeartbeatSfxPlay;
  // host: 0x00956780();
  // host: exact Play 0x0092dc30(... PE imms ...);
} else { // STOP
  emit playerManagerUpdateHeartbeatSfxStop;
  // host: 0x0092e230(plan.sfx_id);
}
```

When blob ready, pure PM2 replaces the entity walk; host residual is PM3
branch only (maxVol from pure plan). When count==0 without blob, pure PM2 is
implicit (maxVol=0); only hybrid is-playing is required for pure-complete or
STOP. Default `count=1` `blob=0` keeps MONOLITHIC until hybrid fills packs.

Notes: `output/decomp/5129df723e64/section-notes/player-manager-update/`.

### Mid-tail restock outer pure gate (room helpers ABI v18; freestanding)

`isaac_room_mid_restock_needs_host` peels the PE outer conjuncts for
`opaqueRoomUpdateTailMidRestock` (always-emitted host residual in Update ABI
v32…v41). **No Update ABI bump** — body stays host until lockstep proves a
pure-complete skip with live owner resolution on `resume_room_update_head`.

PE (post-`FUN_00800500`, pre-`Room+0x7230` in `0x00802980`):

1. `Room+0x8 == 2` (shop)
2. exact ZHL `PlayerManager::FirstCollectibleOwner(0x209, …)` @ `0x009be080` ≠ 0  
   (residual inventory “challenge 0x209” is a misnomer — collectible ownership)
3. `Room[0] != 0` (active)
4. `(int)(Game+0x264f8) - Room+0x11f0 > 1` (frame-in-room age)

Hybrid input: `collectible_owner_0x209_nonzero` (pointer truthy → 1). Body:
descriptor `+0xac`/`+0xae` short gate + exact `RNG::RandomInt` @ `0x007e9020` +
short write at `desc+0xae` remains host.

Notes: `output/decomp/5129df723e64/section-notes/mid-restock-outer/NOTES.md`.

### B1 first-frame pure islands (room helpers ABI v20 + v22; once-flag Update-wired v43)

`opaqueRoomUpdatePrefixB1` (~VA `0x00802a40`…`0x00802e20`) is **not**
pure-complete on the Update path. Outer gate (v42) + once-flag OR (v43) are
Update-wired; SFX/spawn body stay host under the monolithic residual until
buffer begin/end + SFX gate sparse inputs land. Helpers ABI **v22** peels
SFX Play imms, Fisher-Yates remainder, residual plan, and a freestanding
pure-complete wire matrix (**no Update ABI bump**).

| Helper | Role |
|--------|------|
| `isaac_room_b1_frame_in_room_gate` | outer: Room active && age==1 (Update-wired v42) |
| `isaac_room_b1_once_flag_clear` | `(Game+0x1839c & 0x80000)==0` (gate for pure OR) |
| `isaac_room_b1_flag_or_80000` | pure once-flag `\|= 0x80000` (Update-wired v43) |
| `isaac_room_b1_corner_indices` | four interior-corner grid indices from W/H |
| `isaac_room_b1_sfx_needs_host` | nested boss-room SFX residual gate |
| `isaac_room_b1_sfx_id` / `…_play_{volume,frame_delay,loop,pitch,pan}` | PE-exact Play imms (id=`0xbe`, Vol=1, Delay=2, Loop=0, Pitch=1, Pan=0) |
| `isaac_room_b1_host_va_*` | fragment VAs: SFX `0x00802a53`, pre `0x00956780`, Play `0x0092dc30` (exact ZHL), spawn `0x00802b60`, pos `0x00802da4`, entity `0x00802dc4`, cleanup `0x00802e1a` |
| `isaac_room_b1_spawn_buffer_nonempty_bits` | dword `Game+0x183a4 != +0x183a8` |
| `isaac_room_b1_once_path_needs_spawn_host` | once clear && buffer nonempty |
| `isaac_room_b1_spawn_base_count` | owner/quality of 0x89 → 4/6/8 |
| `isaac_room_b1_spawn_count_clamp` | `min_u(base, signed len/0x78)` |
| `isaac_room_b1_rng_xorshift` | PE shifts 1/9/29 |
| `isaac_room_b1_shuffle_remainder` / `…_needs_swap` | Fisher-Yates rem; swap iff rem≠0 |
| `isaac_room_b1_buffer_elem_{stride,offset}` | stride `0x78`; `index*0x78` |
| `isaac_room_b1_spawn_radius` | `24.0f` (`0x41c00000`) into `FUN_00813520` |
| `isaac_room_b1_corner_pick` | `corners[rng&3]` |
| `isaac_room_b1_corner_world_xy` | idiv W → xy (`DAT_00baa904=40`, `DAT_00baaa00=120`) |
| `isaac_room_b1_entity_post_spawn_mark` | `entity+0x32c = -1` |
| `isaac_room_b1_residual_plan` | full plan when all inputs available (NONE/SFX/SPAWN/SFX_SPAWN) |
| `isaac_room_b1_wire_decide` | readiness matrix → NONE or MONOLITHIC or fragments |

**Once-flag Update wire (ABI v43 applied):**

1. Sparse `uint32_t game_flags_1839c` at `Game+0x1839c` (float-slot `0x60e7`).
2. When outer B1 gate is open and `once_flag_clear(pre)`: pure
   `flag_or_80000` into sparse state **before** host residual.
3. Host residual still monolithic for SFX + spawn (dual-OR idempotent).
4. Later: emit host spawn only when `once_path_needs_spawn_host(pre, begin, end)`
   once buffer sparse lands; pure-complete once-path when buffer empty.
5. Optional fragments (not shipped): `opaqueRoomUpdatePrefixB1Sfx` @
   `0x00802a53` (`FUN_00956780` + exact `SFXManager::Play` with pure imms),
   `opaqueRoomUpdatePrefixB1Spawn` @ `0x00802b60`…`0x00802e1a`.

#### Pure-complete decision matrix (freestanding; not Update-wired)

`isaac_room_b1_wire_decide(outer_ready, sfx_ready, buffer_ready, …)`:

| Inputs | residual_kind | pure-complete? |
|--------|---------------|----------------|
| `!outer_ready` | MONOLITHIC | no |
| outer closed | NONE | yes (no sfx/buffer pack needed) |
| outer open + `!sfx_ready` | MONOLITHIC | no |
| outer open + once clear + `!buffer_ready` | MONOLITHIC | no (pure flag still dual-safe) |
| outer open + all ready + !sfx + !spawn | NONE | yes (flag-only pure when once clear) |
| outer open + all ready + sfx/spawn | SFX / SPAWN / SFX_SPAWN | no |

**Why not wire now:** SFX gate needs room type/desc/difficulty/stage/nested/boss
plus buffer begin/end for spawn; only outer + once-flag are sparse on Update.
Host residual remains: SFX `0x00956780`/`0x0092dc30`, buffer `0x00752830`,
owner/quality `0x009be6b0`/`0x007cb6e0`, shuffle/spawn `0x00428b20`, cleanup
`0x00708e20`. Next residual host VAs: **`0x00802a53`** (SFX) /
**`0x00802b60`** (spawn setup) / **`0x00802da4`** (position) /
**`0x00802dc4`** (spawn). Notes:
`output/decomp/5129df723e64/section-notes/room-prefix-b1/NOTES.md`.

### H5 FUN_00824a70 body pure islands (room helpers ABI v19 + v21 + v22 posts; freestanding)

When `isaac_room_ambient_824a70_needs_host` is true, the body still hosts
RNG/entity/ANM2. Freestanding peels (not Update-wired):

1. **Bounds setup** `0x00824b4c…0x00824bad` — age, `loop_count` (age==0 → 5 else 1),
   room float spans (`DAT_00baa904=40`, `DAT_00baab7c=500`) via
   `isaac_room_ambient_824a70_body_bounds`
2. **Y override rule** `0x00824c3a` — age≠0 → y = room+0x1c + `DAT_00baab98` (600)
3. **Color RGB** `0x00824d50…0x00824e50` — PE-order stage_id / Room+0x1d18 / dim
   via `isaac_room_ambient_824a70_body_color` (bits-exact immediates)
4. **Post-RNG unit-float posts** (helpers ABI **v21**; consume host genrand dword only):
   - `isaac_room_ambient_824a70_body_unit_float` — MSVC u32→f32 + `DAT_00ba9ff4`
   - `isaac_room_ambient_824a70_body_pos_axis` — `base + unit·span` (R0 x / R1 y)
   - `isaac_room_ambient_824a70_body_z` — `−0.25 − unit·0.5` (R2)
   - `isaac_room_ambient_824a70_body_scale` — `unit·0.3 + 0.7` (R7)
5. **Residual posts beyond unit-float** (helpers ABI **v22**; freestanding):
   - `isaac_room_ambient_824a70_body_flag_bit` — R5/R6 `genrand & 1` (entity store host)
   - `isaac_room_ambient_824a70_body_anim_frame_genrand_needed` — R4 gate count≠0
   - `isaac_room_ambient_824a70_body_anim_frame` — unsigned `genrand % count`
   - `isaac_room_ambient_824a70_body_anim_frame_f32` — A2 `cvtdq2ps` prep
   - create/GetLayer imm enums: type `0x3e8`, variant `0x8a`, layer `0`, data `0xb1bc54`
6. **LC layer color write** — notes only (needs `layer*`; stack alpha at
   `[esp+0x50]` not pure-defined; scale `[esp+0x54]` dead-store in residual)

Host residual starts at first genrand **`0x00824bb3`** (still single host event
`opaqueRoomUpdateAmbient824a70`). **No Update ABI bump.**

Notes: `output/decomp/5129df723e64/section-notes/ambient-h5-body/NOTES.md`,
`output/decomp/5129df723e64/section-notes/h5-824a70-host-residual/NOTES.md`.

### PlayerHUD residual pure helpers ABI v1 (freestanding; not Update ABI)

`native/decomp/playerhud_post_update_pure_helpers.{h,cpp}` +
`scripts/decomp/playerhud-post-update-pure-model.mjs` +
`tests/decomp-playerhud-post-update-pure-helpers.test.js`. **No Update ABI
bump** — occupied slots always host `PlayerHUD::UpdateHearts` and the bulk
gfx residual; pure islands are not a pure-complete skip gate.

| Peel | VA / notes |
|------|------------|
| P0 entry clear | 24× `*(hud+0x11+i*0x10)=0` @ `0x00842290` |
| Twin hearts gate | pure predicate → host `UpdateHearts` @ `0x00841e20` (exact ZHL) |
| P1 critical blink | int16 @ `+0xa`; `frame%45<10` → `((9-rem)*255)/9` |
| P2 active countdown | 4× nonnegative @ `+0x1a8` stride `0x1c` |
| P3 tail float | `+0x6b8` ±0.25; exact SSE `minss`/`maxss` (NaN → second operand: 1.0 / 0.0) after host pred `0x00956110` |
| P4 tail char | `+0xc/+0xd/+0xe` signed positive dec |
| P5 walk clear | `+0x6a0/0x6a4` stride-0xc SP clears; host teardown `0x0084bba0` |
| P6/P7 list clears | heads `[ebp-0x1450]` / `[ebp-0x143c]`; host teardown `0x00415800`+free(0x1c) / `0x0083b830`; enable-store `+0x6ac` |
| Tail rebuild | gate byte `+0x6ad`; FIXED rdata `0x00b63a18` vs CONFIG string (`0x40d0c0`); pred args `0x00956110` |
| Host residual | UpdateHearts, active/trinket gfx, LoadImage, ANM2, dirty `0x009a6110` |

Notes: `output/decomp/5129df723e64/section-notes/playerhud-842230/NOTES.md`;
tail sweep evidence: `output/decomp/5129df723e64/section-notes/playerhud-v14/NOTES.md`
and `.../playerhud-v15/NOTES.md`.

Ambient always-host H3/H5/H7 PE-mapped (`ambient-always-host/` notes): room pure
helpers **v16** freestanding (mode-sfx dim2 skip + play gate; 74e9b0 pure-false;
mineshaft pure classify; 824a70 cadence; challenge bit leaf). **No Update ABI
bump** — SFX/spawn/curse-mask residual bodies stay host.

Next peel: first host call after P0 — **`0x008422c5`**
(`PlayerHUD::UpdateHearts`); or deeper active-item host edge
`0x0084240d` (`FUN_007706e0`); prove/split `0x0092f1c0` for gate-1ba78 HUD
pure; optional Update-wire of ambient pure-false gates when sparse fields land;
other port roots (`Game::Render`, `ProcessInput`, `Exit`, `LuaEngine::*`).

### ProcessInput pure helpers ABI v24 (freestanding; root still unpinned)

`native/decomp/process_input_pure_helpers.{h,cpp}` +
`scripts/decomp/process-input-pure-model.mjs` +
`tests/decomp-process-input-pure-helpers.test.js`. **No ProcessInput pin** —
ZHL `static void Game::ProcessInput()` has 0 exact hits on this PE; do not
promote mask helpers or Manager poll VAs to that symbol.

| Peel | VA / notes |
|------|------------|
| Mask A/B pure | `0x006f9400` / `0x006f95a0` after host map `0x004288a0` |
| GetDeviceType range | exact ZHL `0x00a6f620` (lock/unlock host) |
| FUN_006f9730 | complete pure Game quiet-gate |
| Manager early skip + float approach | shell `0x00954cd0` head / post-poll 2-slot |
| v3 poll-prefix gate | `param_1 != 0` → host prefix |
| v3 platform branch | `DAT_00c73680==0` → host `0x00a69f60(0x10001,0)` else `(*DAT_00c7378c)()` |
| v3 `FUN_00a6de60` entry | enable `DAT_00c7e300`, reenter `DAT_00c9ba98`, SAR32 vector count, loop_needed |
| **v4** device enable / query ok | `[dev+0]!=0` @ `0x00a6dedc`; status==0 @ `0x00a6df3d` |
| **v4** button bit + edge | unrolled slots 0..0xe; press/release/silent edge matrix |
| **v4** axis normalize | i16 `+0x8000/65535*2-1`; u8 `/127.5-1`; float changed + cb gate |
| **v4** DIERR reacquire | `0x8007001e` / `0x8007000c` @ `0x00a6e70b` |
| **v4** index / device continue | unsigned `jb` after inc; outer recount SAR |
| **v4** axis type dispatch | table `0x00a6ef14` / jtable `0x00a6eee0` (type≤`0x2c`) |

**Manager poll host chain** (shell `0x00954cd0`, when `param_1 != 0`):

1. host platform: `0x00a69f60` **or** `(*DAT_00c7378c)` (no exact ZHL)
2. host `FUN_00a6de60` — pure entry + walk pure islands peeled; **host residual**
   starts at device body IAT/query (`0x00a6dee5` / `0x00a6df30`) and owns
   callbacks, QPC (`0xaefe80`, IAT `0xb18234`/`0xb18238`), COM vtable path
   (`0x00a6e702`), `0x00a6da10` / `0x00a6dd30` / `0x00a648b0`
3. host `FUN_00a1fc00` — pattern collides `Entity_Familiar::Shoot` (not that
   symbol at this callsite)
4. always: host `0x0095b310` (pattern collides `LuaEngine::RegisterClasses`;
   disproven by every-frame Manager caller), host `0x009c34f0`, pure 2-slot
   float approach + optional host `0x00424130`

| **v23** state-2 tail call sites | `0x00955463…0x009554a0`: host A `0x7e17b0` (this=+0x29fbc, unconditional); byte gate `[+0x2a3a6]`; host B `0xa264f0` (this=`[0xc7999c]`, edx=0); `cmove` anim select Idle `0xb1bc54` / Clicked `0xb7c444`; ANM2::Play `0x40a380` (recv `+0x4b2a8`, reset=0) |
| **v24** GLFW window tail | `0x009554a5…0x00955580` (finishes `FUN_00954cd0`): win=`[0xc7999c]`; assert `_wassert` IAT `0xb18884` (`L"window != NULL"` @ `0xb9bbcc`, file `0xb9bbf0` line `0x310`); poll gate `DAT_00c73680`→host `0xa69f60(0x10001,0)`; direct copy when `[win+0x70]==0x34003` (`+0x1e0/+0x1e8` doubles) else host `(*DAT_00c736a0)`; cvtpd2ps; `ucomiss+lahf+test ah,0x44+jp` ordered equality vs `+0x4b3bc/+0x4b3c0`; timer `+0x4b3c4` matched→`>0?−1`, else reset `0x12c` (300); `inc [+0x4abbc]` unconditional (same parity field as state-2) |

Manager shell `FUN_00954cd0` is now **complete through its epilogue** (`ret 4`
@ `0x00955599`). Depth chain peeled to ABI v36: v30 cleanup_current_state
`0x00959670` -> v31 Cutscene::Show `0x0095e7c0` -> v32 NightmareScene::Show
`0x00921ce0` -> v33 FirstCollectibleOwner `0x009be080` -> v34
RandomCollectibleOwner `0x009be140` -> v35 address-stable RNG**-variant
`0x009be2a0` (single caller `0x006eca9d`) -> v36 RNG-returning RCO sibling
`0x009be3e0` (PlayerManager::RandomTrinketOwner, exact ZHL 10 B; 10 rel32
E8 sites: 0x5348fc 0x663ada 0x6641b1 0x6bccdc 0x71711d 0x71716a 0x717969
0x7179bb 0x71d1b4 0x71d53c) -> v37 address-stable RCO/RTO-family sibling
`0x009be530` (no exact ZHL; 7 rel32 E8 sites 0x506e07 0x50f3ce 0x53bb1d
0x5400f0 0x54101a 0x54ae57 0x54bce3; same xorshift draw as v36 WITHOUT the
collect/id/out tail — 4 candidate gates, ret 8, single epilogue) -> v38
address-stable slot-match sibling `0x009be630` (no exact ZHL; 23 rel32 E8
sites 0x60d1c6 0x65105b 0x6de9d5 0x6deaee 0x6deaff 0x6e0cdc 0x6e13fb
0x7113ec 0x7304a1 0x7304ae 0x73050f 0x730ad1 0x73adbe 0x73add3 0x74a67f
0x7fb3b4 0x815285 0x815297 0x815547 0x8166ab 0x9a448a 0x9a4499 0x9a44b3;
this = g_Game + 0x1baa8, arg1 BY-VALUE needle slot, ret 4, TWO epilogues
0x009be664 / 0x009be66b, int3 pad 0x009be66e; PURE linear search over
players — gates [p+0x2c]==0 dword, [p+0x20a9]==0 low byte, [p+0x13c0]==
needle dword; NO xorshift/float/seed assert in this body) -> v39 two
sibling bodies as ONE template unit: address-stable PURE slot-0x19
predicate `0x009be670` (no exact ZHL; 3 rel32 E8 sites 0x6df8ba 0x6e07c4
0x9a44a7; ret 4; TWO epilogues 0x009be6a3 TRUE / 0x009be6a8 FALSE, int3
pad 0x009be6ab; body NEVER reads arg1 — the needle 0x19 is an IMMEDIATE
`cmp dword [p+0x13c0],0x19`; EMPTY list returns 1 — inverse of v38's
not-found 0; bound captured ONCE) + address-stable NARROWED
owner/quality select `0x009be6b0` (no exact ZHL; **41 rel32 E8 sites**
— the real frontier; caller 0x004e7b7d `mov ecx,[0xc71678] / push 0x97 /
lea ecx,[ecx+0x1baa8] / call`, arg1 BY-VALUE needle; ret 4; TWO
epilogues 0x009be73c early accept / 0x009be747 winner, int3 pad
0x009be74a; pure walk + path selection + accept/winner CF AROUND host
0x7cb6e0 status (thiscall player, needle; SIGNED setg >1 path B / >0
path C) and 0x7706e0 query (cdecl 0x1b7/0; LOW-byte accept gate); path A
field!=0==needle && byte2ef0!=0 forces bl=1; bound RE-READ per
iteration) -> v40 **GetNumCollectibles** `0x009be750` (EXACT ZHL 19 B:
`__thiscall int PlayerManager::GetNumCollectibles(CollectibleType type);`;
3 rel32 E8 sites 0x7f9332 0x7fb4fe 0x8162e6; this = g_Game + 0x1baa8,
arg1 BY-VALUE type needle, ret 4 @ 0x009be7e7, int3 pad 0x009be7ea;
NARROWED: pure walk + 32-bit wrap sum AROUND host 0x72fd10
ItemConfig::GetCollectible (exact ZHL 13 B — HUD do-not-reopen) twin-get
computed ONCE pre-walk (flag = twin!=0 && bit31([twin+0xb8])) and host
0x770ca0 Entity_Player::GetCollectibleNum (exact ZHL 16 B) per player +
per twin; slot dword [p+0x2c]==0 gate; flag LOW-byte twin-call gate).
Still
**not** a ProcessInput pin.
-> v41 **HasTemporaryEffect** `0x009be7f0` (EXACT ZHL 8-B prologue
pattern `558bec8b11568b71`: `__thiscall bool PlayerManager::
HasTemporaryEffect(ItemConfig_Item *item);`; 2 rel32 E8 sites 0x6bdcb5
0x7fe7ee; this = PlayerManager container (g_Game + 0x1baa8 at callers),
arg1 BY-VALUE item needle, ret 4, TWO epilogues 0x009be839 NOT-FOUND /
0x009be841 FOUND, int3 pad 0x009be844; **PURE** (0 E8 / 0 stores): bool
scan over players — gates [p+0x2c]==0 dword + [p+0x1519]==0 low byte,
then temp-effect vector [p+0x150c..p+0x1510) stride 0x10 comparing
[entry]==needle dword; FIRST hit returns 1 mid-walk; EMPTY list -> 0
(v38 polarity, NOT v39 9be670's TRUE-on-empty — the needle is never
read); list end CAPTURED ONCE (esi @ 0x009be7f6); vec end captured per
candidate).
-> v42 address-stable slot-accumulator walk `0x009be850` (no exact ZHL;
family precedent a9be530/a9be630/a9be670/a9be6b0; **1 rel32 E8 site
0x00772bcf** — `mov ecx,[0xc71678] / push 0x70 / lea ecx,[ecx+0x1baa8] /
call`; this = PlayerManager container (g_Game + 0x1baa8), arg1 = 0x70
pushed but NEVER read in the body (dead arg, class v39 9be670), ret 4 @
0x009be97f single epilogue, int3 pad 0x009be982, 306 B; **NARROWED** —
2 host calls to 0x930220 (thiscall find-or-append accumulator, ret 0xc;
its 7-site census includes our 0x009be8c6 / 0x009be961) stay host; ALL
gates + full arg-prep pure: outer loop per player (count = SAR32(end-
begin,2) RE-DERIVED per iteration @ 0x009be966/96a, UNSIGNED index
compare jb @ 0x009be973); host1 gate SIGNED ((vecA_end - vecA_begin) &
~3) > 0x1c0 && slot = [vecA_begin+0x1c0] != 0 (vecA =
[[0xc7169c]+0x2a41c..+0x2a420]) -> host 0x930220(player+0x1508,
&buf16{slot,0,[slot+0x78],0},1,1); player RE-FETCHED + begin RE-READ
after the call; twin = [player+0x1e6c]; byte [twin+0x1519]==0 AND
[twin+0x150c..+0x1510) non-empty -> marker scan stride 0x10 for
[entry+0]==0 && [entry+4]==0x70 -> SKIP host2 (jump to tail); else
host2 gate (identical predicate, vecA re-read) -> host 0x930220(twin+
0x1508, buf16, 1, 1)).
Next ProcessInput step (v43 handoff, verifiable): **`0x009be990`** — the
next sibling right after the 0x009be982 int3 pad (span dump 0x009be990:
2-rets bool scan over players — [player+0x3fc] FULL-dword test==0
advance / ==3 advance / else FOUND al=1; 0 E8 / 0 stores — **PURE**;
2-site census 0x004531b6 / 0x0049118a, this = g_Game+0x1baa8).
-> v43 **0x009be990 LANDED** (ABI 42->43; 21 exports; 5 mutants; PURE-
complete — 0 E8 / 0 indirect / 0 mem-stores, both AL consumers pinned).
-> v44 **0x009be9c0 LANDED** (ABI 43->44; 25 exports; 6 mutants; PURE-
complete — 0 E8 / 0 indirect / 0 mem-stores; 1-site census 0x006c83b3,
this = g_Game+0x1baa8 via getter 0x00417860).  NOTE: the v43 handoff text
read "[player+0x184] ==0/==1/==2/==3 advance else FOUND" — INVERTED; the
machine je's to FOUND on each member (test order 0,3,1,2), i.e. **FOUND
iff FULL dword [player+0x184] IN {0,1,2,3}**, gated by byte
[player+0x20a9]==0; begin/end captured ONCE at entry (end NEVER re-read).
Next ProcessInput step (v44 handoff, verifiable): **`0x009bea10`** —
the sibling right after the 0x009bea01 int3 pad (span dump 0x009bea10:
write-all players `mov byte [player+0x410], bl` loop, stride 4, arg1 low
byte from [ebp+8]; 0 E8 / 0 indirect / **1 mem-store** — NOT pure;
NARROWED-class: the per-player store is the boundary; transcribe the
loop/gate laws, keep the store host).
-> **0x009bea10 LANDED OUTSIDE this family** — the game-update-slice
family ports it as `player_flag_410_broadcast` (Update ABI v50 (a),
`opaque_call_009bea10` event + `scratch_player_flag_410`; pure value
broadcast into the slice's own scratch, verified element-by-element in
verify-game-update-slice.mjs).  Do NOT re-land in process-input.
-> v45 **0x009bea40 LANDED** (ABI 44->45; 25 exports; 6 mutants; PURE-
complete — 0 E8 / 0 indirect / 0 mem-stores; the first body after the
0x009bea10 int3 pad).  __thiscall ret 0 f32-sum walk: sum = +0.0f;
FULL dword [p+0x2c]==0 AND byte [p+0x20a9]==0 -> xmm0 = addss(xmm0,
f32 [p+0x156c]) (f32 round-to-nearest-even per add); begin/end captured
ONCE at entry (end NEVER re-read); empty -> +0.0f; returns f32 (single
epilogue ret 0x009bea70; consumers cvttss2si 0x43-/0x37- and mulss).
3-site census 0x0065ab45 / 0x006c8fdd / 0x007fb912, this =
g_Game+0x1baa8 via getter 0x00417860 (first two) / `lea ecx,[esi+
0x1baa8]` (third).
-> v46 **0x009bea80 LANDED** (ABI 45->46; 33 exports; 5+ mutants; NARROWED
— 2 E8s to HOST `0x007cb6e0` (HUD-family count resolver ABI v19
`ISAAC_HUD_COUNT_7CB6E0_*`, NOT exact-ZHL, body owned by hud-post-update,
also pinned by player-manager-update as `PM_TD_HOST_VA_COLLECTIBLE_COUNT`;
typed host event — do-not-reopen), 0 indirect, 3 mem-stores ALL [esp+N]
locals (zero observable stores).  **EXACT ZHL 18 B**: `__thiscall int
PlayerManager::GetTrinketMultiplier(int TrinketID);`; this =
g_Game+0x1baa8, arg1 = raw TrinketID BY VALUE, ret 4 @ 0x009beb27
(single epilogue), int3 pad 0x009beb2a, 170 B; **43 rel32 E8 sites**
(representative 0x005ce064 / 0x007fb900 / 0x00816757).  Pure slot-flag
gates + walk + 32-bit wrap sum around the two host status results: slot
flag (=1 iff SIGNED (id&0x7fff) < SAR32([g+0x2a414]-[g+0x2a410],2) &&
slotArray[id&0x7fff]!=0 && bit31([slot+0xb8])) computed ONCE pre-walk
([g] = 0xc7169c); walk players [this+0..this+4) stride 4; FULL dword
[p+0x2c]==0 -> host1 0x7cb6e0(p, RAW id) sum += eax; flag LOW byte != 0
&& [p+0x1e6c]!=0 -> host2 0x7cb6e0(twin, RAW id) sum += eax; END RE-READ
per iteration (this reloaded from local [esp+0x14] — matches
9be6b0/9be750); empty -> 0; return sum (SIGNED int32 consumer cvtdq2ps @
0x007fb90f).
Next ProcessInput step (v46 handoff, verifiable): **`0x009beb30`** —
the sibling right after the 0x009beb2a int3 pad (span dump 0x009beb30:
starts `push ebp; mov ebp,esp; push ebx; mov bh,byte [ebp+8]`; class
unexamined).
-> v47 **0x009beb30 LANDED** (ABI 46->47; 33 exports; 6 mutants;
NARROWED — 1 E8 to HOST `0x007db6b0` (`Entity_Player::
HasInstantDeathCurse`, EXACT ZHL 14 B `__thiscall bool
Entity_Player::HasInstantDeathCurse();`, PURE body 36 insns 0 E8/0
indirect/0 stores; typed host event this unit per the ONE-BODY mandate
— candidate for a future pure peel), 0 indirect, 0 mem-stores (ZERO
observable stores).  NO exact ZHL for the body -> address-stable prefix
`A9BEB30`; `__thiscall` ret 4 @ 0x009beb9b, int3 pad 0x009beb9e, 110 B;
**3 rel32 E8 sites** 0x0073ada9 / 0x0073bd21 / 0x00748819 (all
`lea ecx,[..+0x1baa8]`, arg = uint32 mode BY VALUE low byte only,
return consumed `test al,al` BOOL).  All/any instant-death walk: bh =
arg&0xff seeds bl (echo); begin/end CAPTURED ONCE at entry (end NEVER
re-read — matches a9bea40/9be9c0/9be990); empty or no eligible player
(FULL dword [p+0x2c]==0 && byte [p+0x20a9]==0) -> **ret arg&0xff ECHO**
(NOT 0/1); per candidate a = [p+0x134c]+[p+0x1344] (32-bit wrap);
SIGNED a >= [p+0x1340] -> al=1 without host, else host(player) ->
al=(host!=0); mode byte != 0 -> AND (all must match), == 0 -> OR (any
matches); return byte.
Next ProcessInput step (v47 handoff, verifiable): **`0x009beba0`** —
-> v48 **`0x009beba0` LANDED** (ABI 47->48; 64 exports; 7 mutants;
NARROWED (NOT PURE-removed) — avg-player-position walk; NO exact ZHL ->
address-stable prefix `A9BEBA0`; `__thiscall` ret 8 (fast epilogue
0x009bebe9, main epilogue 0x009bee74), int3 pad 0x009bee77, 0x2d7 B;
**9 rel32 E8 sites** 0x004ac128 / 0x00800524 / 0x00943032 / 0x00943850
/ 0x00943a4d / 0x00943e6d / 0x009446fd / 0x009940a5 / 0x009940fc (all
`lea ecx,[..+0x1baa8]`; arg1 = float2 out, arg2 = mode byte 0/1).
2 INDIRECT host predicates (vtable slot `[[gitem+0x370]+0x14]`, byte
result) + 2 E8 assert calls 0x00a112c0 ("Gamestate corrupted or has new
data!", msg 0x00b7e6bc, code 0x10) stay typed host events; observable
stores (*out float2, cache floats 0xc9436c/0xc94370 — past .data raw
end -> 0 at load, cacheTs 0xc5c4d4) are POST events (laws compute the
VALUES, slice applies the stores).  Fast path (mode&0xff!=0 &&
[gobj+0x4abbc]==cacheTs) -> *out = cached float2, no stores; slow walk:
eligible players [this+0..+4) (slot [p+0x2c]==0 && (watch [p+0x13c0]!=
0x23 || byte [p+0x20a9]!=0)) then EVERY entry of [this+0xd0..+0xd4);
gobj scan [gobj+0x4b3d8..+0x4b3dc) for [gitem+0xc]==[elem+0x1618];
FOUND -> host pred gates accumulate; EMPTY/NOT-FOUND -> accumulate
[elem+0x33c]/[elem+0x340] (f32); FINALIZE: cacheTs store always,
SIGNED count>0 -> avg sum/count (divss), else fallback player0
[g_Game+0x1baa8][0] pos; cache + *out = avg-or-fallback.
Next ProcessInput step (v48 handoff, verifiable): **`0x009bee80`** —
the sibling right after the 0x009bee77 int3 pad (starts
`push ebx; mov ebx,esp; sub esp,8; and esp,0xfffffff8` — MSVC EH
prologue, `mov eax,fs:[0]`; HEAVY, class unexamined).
-> v49 **`0x009bee80` CLASSIFIED HOST** (ABI 48->49): the VA IS the
true function start (int3 pad before it, full body 0x009bee80..
0x009bf52f, jmp 0x009befd1 into its OWN shared epilogue, ret 8 @
0x009befe4) — MSVC C++ EH entity swap/relink routine (fs:[0] chain,
handler 0xb0eb55, 20+ E8, 2 indirect, 40+ stores, index/field swap +
linked-list surgery on two entities; this = g_Game+0x1baa8, arg1/arg2
= entity pair; 2 callers 0x005c4560/0x007acfd6).  NO pure surface ->
do-not-reopen.  The 0x009bf530 sibling is HOST too (second EH
function, handler 0xb0eb95); 0x009bf990/0x009bfa00 are PM-family
pins (PM_TD_GHOST), 0x009bfae0 is the game-update greed helper.
-> v49 **`0x009bfa70` LANDED** (ABI 48->49; 32 exports; 7 mutants;
PURE — 0 E8 / 0 indirect / 0 observable stores (single [ebp-4]
local save); NO exact ZHL -> address-stable prefix `A9BFA70`;
`__thiscall` ret plain @ 0x009bfadd, int3 pad 0x009bfade, 0x70 B;
**4 rel32 E8 sites** 0x006622bf / 0x0066233d (via getter 0x00417860
= `lea eax,[ecx+0x1baa8]`) / 0x008ef9c2 / 0x008efe49 (lea/add
+0x1baa8 on g_Game).  Count of slots p where [p+0x2c]==0 &&
[p+0x3bc]==0 && (link [p+0x1e68]==0 || linkIdx [link+0x161c]==-1 ||
SIGNED linkIdx >= SIGNED [p+0x161c] (jge) || link==p) && byte
[p+0x20a9]!=0; begin/end captured on entry, [begin+idx*4] walk.
Secondary host-pull candidate: `0x007db6b0` (Entity_Player::
HasInstantDeathCurse, exact ZHL 14 B, PURE — PM-family body; only if
a future PM/PI frontier points there).
`0x009be700` / `0x009be720` / `0x009be780` / `0x009be7a0` stay DEAD (0
inbound E8 sites). Next ProcessInput step (v49 handoff, verifiable):
**`0x009bfae0`** — sibling after the 0x009bfade int3 pad (game-update
greed helper FUN_009bfae0, 1 E8 0x7d93b0 — claimed lane, do-not-reopen
for PI); next open census candidate `0x009bfb20` (5 E8 / 1 store).
Verify:
`node --test --test-concurrency=1 tests/decomp-process-input-pure-helpers.test.js`.
-> v50 **`0x009bfb20` CLASSIFIED HOST** (ABI stays 49; no laws land):
true function start confirmed (int3 pad 0x009bfb17..0x009bfb1f; prev
ret @ 0x009bfb16); span 0x009bfb20..0x009bfbf6, `__thiscall` ret 4,
arg1 = uint32 idx; mutating slot-op with up to **3
`Entity_Player::RevivePlayerGhost` (0x7d93b0, exact ZHL 22 B)** +
subject-getter 0x00417800 (frame-opaque-claimed PURE leaf) + OOB
assert a112c0(8, "%d to %d.%d" @0xb7e990, idx, count); 2 direct rel32
callers 0x008efd5c (update-v95 slot-op callee set B arm) / 0x0091235b.
**v49 "0x009bfbe0 assert stub" record CORRECTED** — 0x009bfbe0 is the
assert tail of 0x009bfb20, NOT a function.  PI band 0x009bee80..
0x009bfc00 fully classified/CLOSED; `0x009bfc00` (SSE leaf ×1/15, sole
caller 0x0077007b) routes to the HUD HasCollectible lane, not PI.
Verify:
`node --test --test-concurrency=1 tests/decomp-process-input-pure-helpers.test.js`.
-> v50 **`0x009ba980` LANDED** (ABI 49->50; 16 exports; 5 mutants;
**PURE** — 0 E8 / 0 indirect / 0 stores; 7 insns / 2 rets
0x009ba980..0x009ba998, int3 pad 0x009ba999, 0x19 B; **EXACT ZHL
14 B `static bool PlayerManager::CoopBabiesOnly();`** (libzhl
PlayerManager.zhl:44; consumed by LuaIsaac.cpp:442
`!CoopBabiesOnly()`).  static — body IGNORES ecx (no receiver); reads
g_Game [0xc71678] + **0x26548 challenge bitset**, bit 4 (0x10) = Coop
Babies challenge flag (field cross-confirmed: frame-opaque 0x4217a0
bitmap, render-shell 4217A0_BITSET_OFF, room RANGE_HIT 26548, exit
field_26548).  `mov eax,[g]; mov eax,[eax+0x26548]; and eax,0x10;
or eax,0; je false; mov al,1; ret; xor al,al; ret`.  **3 rel32 E8
sites** 0x009bae7e / 0x009bb081 / 0x009bb288 — all inside the
unclaimed HOST state machine 0x9bac40, each `test al,al` right after
the call.  Laws: `cbo9ba980_{flag_bit4_set,result_true,result_false}`
(Mask gate FULL dword & 0x10, uint32_t param; WIDE drives) +
13 accessors.  **BAND RE-NET 0x009b0000..0x009bfc00 (this unit):
exactly ONE unlanded caller-bearing PURE body (0x9ba980) — the full
classification table is in section-notes/process-input-v50-band/
NOTES.md; the band ledger below the wave-22 tail is now CLOSED.**
Everything else HOST / claimed-lane (update 0x9b6840/0x9b7190/
0x9b7650/0x9b7680; frame-opaque 0x9b9310/0x9b9480; exit 0x9b4810/
0x9b5cb0/0x9b9150; PM 0x9bb5d0/0x9bc120; room 0x9bb840; game-update
0x9bfae0) / dead / setter-with-store (0x9b1910/0x9b1950/0x9b5250/
0x9b9570).  Next frontier: 0x009ba9a0 (SEH EH sibling — HOST,
classify-not-land); next ABI bump needs a candidate OUTSIDE this
band.  Do not reopen the wave-22 tail 0x9bfc00..0x9c0000.
Verify:
`node --test --test-concurrency=1 tests/decomp-process-input-pure-helpers.test.js`.
-> v52 **`0x009c6110` LANDED** (ABI 51->52; 18 exports; 4 mutants; PURE-class
island with ONE out-param store — band 0x9c6000..0x9c7000 residual below the
GameState band edge 0x9c7000; W32-F14 residual census; family-free zone, no
exact ZHL -> address-stable prefix `A9C6110`).  cdecl TWO stack args (arg1 =
[ebp+8] in-state ptr, arg2 = [ebp+0xc] out-state ptr), plain ret, SINGLE ret
@0x009c612e, int3 @0x009c612f; 0 E8 / 0 indirect; ZERO direct rel32 callers
(full E8 census) — reached ONLY as an address-taken callback (`push 0x9c6110`
@0x009c60c4, visitor arg to the HOST walk 0x00a51c60, picker owner
0x009c60a0..0x009c60d8 — walk/picker/twin 0x9c60e0 stay HOST).  Law: state==1u
(FULL-DWORD cmp [ecx],1 / jne) -> store `(field8 != 0u) ? 2u : 4u` via the
sbb/and/add chain (xor edx,edx / cmp edx,[eax+8] / sbb eax,eax / and
eax,0xfffffffe / add eax,4); gate-miss arm returns the state unchanged.  Zero
uint8_t, zero byte masks — both gates FULL-DWORD (wide drives prove 0x100/
0x1ff/0x80000000/0xffffffff).  Exports: `isaac_a9c6110_{gate,value,
next_state,field8_ofs,state_ofs,match_state,value_two,value_four,va,
first_ret_va,ret_va,int3_va,body_bytes,sites,pointer_ref_va,host_walk_va,
walk_owner_va,next_va}`.  Suite 72/72 (family wasm self-build, serialized).
Band census (16 bodies, 0x9c6000..0x9c7000) + the 0x9c6e30..0x9c7076
GameState-band-edge CROSS correction (GameState's "0x9c7000 dead body" row is
a mid-body mis-split of 0x9c6e30, ret 8 @0x9c7076) are in
section-notes/update-v109-frontier-hunt/NOTES.md.  Next PI frontier: none open
below 0x9c7000 (rest HOST); GameState band 0x9c7000+ unchanged.
Verify:
`node --test --test-concurrency=1 tests/decomp-process-input-pure-helpers.test.js`.

### LuaEngine pure helpers ABI v4 (freestanding; not Update ABI)

`native/decomp/lua_engine_pure_helpers.{h,cpp}` +
`scripts/decomp/lua-engine-pure-model.mjs` +
`tests/decomp-lua-engine-pure-helpers.test.js`. **No Lua boot ABI, no
Update wire.** Pins: Init `0x008604c0`, RegisterClasses `0x00866960`,
RunBundledScript `0x0086e5e0` (hash-bound multi-evidence); destroy
`0x0086e520` exact ZHL unique.

| Peel | VA / notes |
|------|------------|
| v1 frame unref gate + ZHL inlines | `0x008607a0` bit2; GetMaskedPointer / GetLuaDebug |
| v2 Init mask mix + boot predicates | pointer-mask post `0x00a68490`; custom newstate / debug / requiref |
| v2 heap tracker base | Init `0x0086066c` / RunBundled `0x0086e607` |
| v3 tracked-alloc commit | header+payload+add64 (Init registry `0xc`, RunBundled `0x131`) |
| v3 Init field stores | `+0x18` state; null/nonnull `+0x10`/`+0x14` |
| v3 RegisterClasses entry | state-ready + relative stack `-2` |
| v3 RunBundled fopen gate | handle non-null → fclose residual |
| v3 FUN_0086e6c0 islands | list empty, MSVC SSO/free/align, load/pcall fail flag |
| **v4** destroy pure islands | list empty + node+8 payload; self-link reset; count clear; registry present + free size 8; field null stores |
| **v4** list unlink pure | FUN_0086e6c0 match-remove prev/next stores + count dec wrap |
| **v4** materialize call imms | FUN_00872980 nargs=2 nresults=1 + call_ok; registry object state/ref pass-through |
| **v4** RegisterClasses install imms | userdata size 4 + closure nups 0 (table-install partial) |

Host residual: full Lua VM IAT, RegisterClasses ~31KB body beyond size/nups,
`FUN_0086e6c0` script IO/VM, `fopen`/`strncpy`/`malloc`, destroy host walk
`0x00870e00` + `luaL_unref`/`free`/`lua_close`, materialize rawgeti/pcall/ref.
Next: deeper RegisterClasses pure table-install islands (names/closure
wiring stay host), or optional Lua boot ABI after Update/Render/Input.
Verify: `node --test tests/decomp-lua-engine-pure-helpers.test.js`.

`HUD::PostUpdate` pure-complete idle shell (`isaac_hud_post_update_try_pure`,
helpers ABI v1) is **wired on safe Update sites** (ABI v36). Nested residual
bodies and gate `1ba78` remain host. Predicate inputs are three scalars
(PlayerHUD occupied mask + Manager `+0x2a384` / `+0x2a37c`).

Safe-site wire (ABI v36):
- step transition + post-delay
- `resume_98dba0_player_walk` when site is GATE_1B83C
- `continue_timed_transition` while progress > 0
- `resume_item_overlay` / `resume_frame_manager_updates` (both take
  `runtime_inputs`)

Still residual:
- gate `1ba78` hosts `0x0092f1c0` then recaptures for try_pure HUD (ABI v39)
- nested PlayerHUD UpdateHearts/gfx/dirty bodies after pure islands P0–P4
  (multi-slot packs wired ABI v41); HistoryHUD; StatHUD walk

Full per-site safety matrix under ignored
`output/decomp/5129df723e64/section-notes/hud-post-update/NOTES.md`.

### Game::Exit pure helpers ABI v8 (freestanding; not Update ABI)

`native/decomp/exit_pure_helpers.{h,cpp}` + `scripts/decomp/exit-pure-model.mjs`
+ `tests/decomp-exit-pure-helpers.test.js`. **No Exit slice JSON, no frame-loop
wire, no Update ABI change.**

PE map of Exit (VA `0x006fa0c0` through `ret 4` @ `0x006fa534`) shows the
Ghidra listing is **truncated** by a false noreturn on logger `0x00a112c0`.
Post-log pure field peels, nested `0x006f43b0` / pure-complete `0x006f4520`,
the residual host walk after ItemOverlay state clear, the pure prefix of
terminal residual `0x009b5cb0`, pure islands inside nested residual
`0x008d3250`, pure islands inside PlayerManager residual `0x009b9150`, pure
islands inside HUD-adjacent residual `0x009a27d0`, and pure islands inside
follow-on residual `0x009a19a0` are machine-backed (see ignored
`section-notes/exit-residual-2/NOTES.md`, `section-notes/exit-9b5cb0/NOTES.md`,
`section-notes/exit-8d3250/NOTES.md`, `section-notes/exit-9b9150/NOTES.md`,
`section-notes/exit-9a27d0/NOTES.md`, `section-notes/exit-9a19a0/NOTES.md`).

| Peel | Notes |
|------|--------|
| Session / overlay / PGD / GameState predicates | v1 retained |
| PE-ordered early teardown T0/T1/T2/T4 | around host `0x008d26c0`, exact `ANM2::Reset` @ `0x00407f10` (Game+0x1d528), vector dtor |
| Vector `+0x25ebc` CF | stride `0x38`, dtor this = elem+8, end←begin |
| SFX stop-id table | five immediates for residual `0x0092e230` |
| `Manager+0x15` readonly clear | after ReadOnly log |
| Post-log pure pack | Game gates `+0x1ba78`/`+0x1b83c`, floats `DAT_00c7b640/644`, `+0x1ba80=50`, … |
| ItemOverlay state clear | `+0x1c034`/`+0x1c038` ← 0 |
| Residual `0x00421260` pure peels | mode pair `+0x1d2ec/+0x1d2f0←0`; volume predicate; `Manager+0x2a334=1.0f`; `+0x2a338←0x3ba3d70a`; host ANM2 + exact `SoundEffects::ClearVolumeModifier` @ `0x0092e430` residual |
| Residual pure nest Game+0x18990 | outer `0x25` × mid 2, strides `0xc4`/`0x2c`; entity copy `+0x30→+0x34` stride `0x5c` when flag/count gate open |
| Map value `+0x28` clear | after host element walk on Game+0x1a738 map |
| Residual `0x009b5cb0` pure prefix (v4) | this=`Game+0x23a74`: `[this]=0`, `[this+8]=2`, `[this+0x24/0x28]=0`, byte `[this+0x1454]=0`; then five host residuals |
| Nested residual `0x008d3250` pure islands (v5) | this=`Game+0x23a74+0x838` (`Game+0x242ac`): P0 `+0x10/+0x14/+0x30..38`; P1 `+0x44..4c`; P2 `+0x58..60`; P3 `+0x178=-1` + four zeros; cursor-layer gate `+0x40d`; P4 copy `+0x18→+0x1c` + `+0x24..2c=0`; list gate `+0x1e8`; post-host list empty |
| Residual `0x009b9150` pure islands (v6) | this=`Game+0x1baa8` (ZHL PlayerManager layout hint): P0 `+0xc8/+0xcc=0`; player-list host gate `((end-begin)&~3)` + post-host end←begin; extra-list `@+0xd0/+0xd4` signed count + clear-end; ptr host gate; esau slots `@+0x80` clear; mid `+0x7c=0` + byte `+0x5c=1`; tail four dwords `@+0x60←-1` |
| Residual `0x009a27d0` pure islands (v7) | this=`Game+0x1da04` (near ZHL HUD @ `0x1d9ac`): no pure entry prefix; 11 slot-flag bytes `+0x3ce4+i*0x1f4←0` after each `0x00840f70`/`ANM2::Reset`/`0x00709150` triple; tail pure byte `+0x54cd←0`; host residual body + tail-jmp `0x0084bfd0` this=`+0x59a4` |
| Residual `0x009a19a0` pure islands (v8) | this=`Game+0x1da04` (same): P0 `+0x5490=-1.0f`, `+0x5494/+0x5498=-1`, byte `+0x549c=0`, `+0x54d0/+0x54d8=2`, byte `+0x54d4=0`; per-slot ×8 stride `0x6dc` dword `+4←this_addr` + word `+8←i` before host `0x00841cf0`; tail pure byte `+0x54cc←1`; host `0x0083abb0` + tail-jmp `0x0084bfd0` this=`+0x59a4` |
| Terminal | `+0x265c0=0`, word `+0x2658a=0` (clears session + skip-IO) |
| Nested `0x006f43b0` | pure prefix / mid / tail islands; hosts `0x00424440`, `0x009e53a0` residual |
| Nested pure-complete `0x006f4520` | scalar/float stores + copy `+0x269d4→+0x269d8`; seven effect slots |
| Game::Exit root plan (v33) | typed continuation plan: 41 PE-ordered events (HOST/PURE/VECTOR_DTOR_LOOP/MAP_WALK kinds), decision fields for every gate, 13 pure segments map to existing applies; `isaac_exit_root_plan` / `isaac_exit_root_7df690_receiver` / ANM2 reset table exports; entry gate low-byte, overlay full-dword, steam first-dword full-word (wide-value mutants) |

Exact ZHL on Exit callees (re-run): `ItemOverlay::Update` @ `0x009aca90`,
`PersistentGameData::SaveToSteamCloud` @ `0x00928ee0`, `ANM2::Reset` @
`0x00407f10`, `SoundEffects::ClearVolumeModifier` @ `0x0092e430`,
`GenericPrompt::Initialize` @ `0x008378e0` (arg `true`, this=`Game+0x23a74+0x47c`),
`ANM2::GetLayer(const char*)` @ `0x0040b430` (arg `"Cursor"`, this=
`0x008d3250+0x304`; body-confirmed; short catalog pattern). Cloud/local PGD and
continue write/delete otherwise address-stable. Residual receivers with layout
hints only: `PlayerManager` @ Game+0x1baa8 (`0x009b9150` pure peels done; body
hosts residual), `Room*` @ +0x18300 (`0x007384d0`), HUD-adjacent @ Game+0x1da04
(`0x009a27d0` + `0x009a19a0` pure peels done; body hosts residual).

**Not** full Exit ABI: ordered residual hosts after pure 18990 nest stay
untranslated (`0x00686950`, `0x007384d0`, host body of `0x009b9150`, host body
of `0x009a27d0`, host body of `0x009a19a0` (`0x00841cf0`×8 / `0x0083abb0` /
tail `0x0084bfd0`), `0x0040e910`, map walk `0x0069d690`/`0x0040c7f0`, and
residual hosts inside `0x009b5cb0` / nested `0x008d3250`: `0x00408830`×2 /
`0x009b4810` / `0x0040c7f0`×2 / `ANM2::Reset` / optional `ANM2::GetLayer` /
`0x00415800` list destroy / `GenericPrompt::Initialize`). Next Exit step:
PE-split residual `0x0040e910` (global list / COM release) or host residual
body of `0x009a27d0` / `0x009a19a0` — still not forced into a slice ABI.
The v33 root plan is the driver-facing skeleton only; the residual HOST
bodies above are the remaining boundaries.
Verify: `node --test tests/decomp-exit-pure-helpers.test.js`.

`Game::Render` / frame shell: entity root remains exact ZHL `Game::Render` @
`0x00806c20` (host mega-event). Frame shell `FUN_0080ea80` @ `0x0080ea80` has
**no** pure entry prefix — always-host RT prolog through `0x0080eb1c`, then
PE-mapped pure gates (G0 option `ManagerOpts+0x2a3c3` → epilog `0x0080f1ce`;
G1 manager fade poll; camera float add; stage 0x39; **non-39 fade pure**
G10–G12/P4–P8 before host `9956e0`; tree post-erase; entity/grid loop bounds;
aux `+0x2a3c5`; **aux nested 817830 pure decision** G13 (reuses G1/P4a/P4b at
`0x0080f13a`…`0x0080f176`); **RT-pop depth** P9 at `0x0080f1b5`; epilog
`Game+0x11f6` oneshot). **`FUN_00817830`** @ `0x00817830` body pure islands
peeled after always-host exact ZHL `Game::GetStageID` @ `0x00738470`: stage
slot open, stage-id special {4,5,6,0x1b,0x1c} + room bit5 flag, body continue
on `Game+0x7240`/special, view-span + u32→f32 scale pre-floor, stage-0x2c
color pack, special base_t + fade blend (v4); residual open at `0x00817adc`
pure prefix (manager frame→shader scales P17/P18) + post-call pure gates
G21 L-room type ∈ [9,12] / G22 room+desc open / G23 type==9 (v5);
**`opaque_call_00a14050` body pure** G24 lookup continue / G25 bind ok /
P19 try_bind `DAT_00c379b8` + post-return L-room init loop structure
(G26/P20) + type-9 cell0/cell1 float packs (v6) — freestanding helpers ABI
**v6** in `native/decomp/render_shell_pure_helpers.*` (not a full Render
slice ABI; Update ABI unchanged). Host residual: floor `0x00af0917`, color
ctors `0x00682ed0`/`0x00682f20`, a14050 nested **`0x00a159d0`** /
**`0x00416440`** / **`0x00a14270`** (callsite still `0x00817b2f`; string
`"KAGE_ColorTextureShader"` hardcoded in callee), then when G21 exact ZHL
`Room::GetLRoomAreaDesc` @ `0x0081f8b0` and later draw hosts including
`Isaac::GetRenderPosition` @ `0x0067f310`. Notes:
`output/decomp/5129df723e64/section-notes/render-advance-2/` …
`…/render-advance-7/`. Next shell peel: nested host **`0x00a159d0`** /
post-G21 **`0x0081f8b0`** / further type-9 a10690 packs, or stage-overlay
after G7 dual open. Verify:
`node --test tests/decomp-render-shell-pure-helpers.test.js`.

**Game::Render root slice ABI v3** (`decomp/game-render-slice.json`,
`native/decomp/game_render_slice.{h,cpp}`,
`scripts/decomp/game-render-model.mjs`,
`tests/decomp-game-render-slice.test.js`): the shell fragment ABI is now
**v2 → v3** (continuations 25 / host events 29, zero Wasm imports, wasm
built with every export `-Wl,--export`). v2 made the three top poll sites and
the overlay probe/Vector producer pure (helper ABI v31): sparse
presence-byte runtime inputs, `resume_overlay_gate`+`resume_aux_gate` take the
probe/vector results, and the top-poll host events are gone (the PE discards
both results at VA 0x0080eb48). **v3** split the `BODY_817830` mega-edge into
exact-ZHL `Game::GetStageID` @ `0x00738470` (typed host 29, receiver echoed
`inputs.datC71678`, push 0) + pure `resume_817830_gate`: on an empty stage
slot (Game+0x1d80+0x13c*[Game+0x1d18]) or when neither
(stage ∈ {4,5,6,0x1b,0x1c} ∧ [*(Game+4)+0x54] ≥ 0 ∧ ([*(Game+4)+0x44]>>5)&1)
nor comiss [Game+0x7240] > +0.0 (NaN closes) holds, the 0x66dc-byte body is
skipped natively to RT_POP (receiver DAT_00c798e0, arg0 1) with
`bodySkipped=1`; both aux open routes (direct fade at VA 0x0080f14a and the
poll hit) feed the new host chain. `isaac_game_render_slice_817830_slot_offset`
pins the 0x13c stride (imul low 32). Verify:
`node --test tests/decomp-game-render-slice.test.js` (12 tests: ABI pins +
JSON coherence, sparse census, fixed PE-truth pins with wide 0x100/0x101/
0x1ff/0xffffffff drives, v3 gate differential incl. NaN/-0.0, v4 prefix
differential (blend/scales/chain/ladder + cross-helper agreement with the
render-shell family + KAGE hash pin), 300 deterministic random chain walks
incl. continuations 25–28, byte-width discipline, 10 mutants
G0/boost-mask/epilog-one-shot/slot-exit/blend-NaN/ladder-span/key-compare/
store-mask/minss-clamp/found-control with restored re-pins). Notes:
`output/decomp/5129df723e64/section-notes/render-slice-v3/`,
`…/render-slice-v4/`.
**v4** split the body again at the pure prefix: the open path now enters
`AT_TRUNK_817830` (host 30, runs `0x00817830…0x00817adb` — entrance, trunk
float math, color ctors `0x00682ed0`/`0x00682f20`, floor `0x00af0917` — with
the frame SAVED for the tail; the trunk itself stays host because of the
three uninitialized-stack reads `[esp+0x2c]`/`[esp+0x44]`/`[esp+0x118]`) and
then `resume_817830_prefix` peels `0x00817adc…0x00817b53` natively from
POST-TRUNK recaptures (stageId, `[*(Game+4)+0x54]`, `[*(Game+4)+0x44]`,
`[Game+0x7240]`, `[mgr+0x264f8]` (new input `mgr264f8`), `DAT_00c379bc` head
(new input `datC379bc`), the a14050 lower-bound walk result
bound.isnil/key/ptr, `[roomdesc+0x48]` type):
P14/P15 blend t (`tail_blend_398` — special {4,5,6,0x1b,0x1c} ∧ word54
signed ≥ 0 ∧ flags bit5 → clamp(word54/30.0f, +0, 1.0), lerp only when
comiss fade > +0.0 — NaN/-0.0 keep the base; no post-blend clamp), P17/P18
shader scales (`tail_scale_28/18/80` = frame×0.01f / ×0.5f / ×0.1f — the
multipliers are the .rdata f32 constants, so 60×0.01f = 0x3f199999, one ulp
below the f64-0.6 rounding), the a14050 chain plan (search key = a159d0
hash of `"KAGE_ColorTextureShader"` @ `0x00b1a5b0` = `0xb3d14323`, pinned by
`isaac_game_render_slice_817830_kage_hash`; plan = byte isnil == 0 ∧ key ≥
boundKey ∧ bound ≠ head), and the type ladder (`(u32)(type-9) ≤ 3` →
tail `0x00817b53`, else `0x0081d20a`). Plan FOUND emits recapture
`AT_A14050_VALUE_817830` (27) so the host dereferences `[bound+0x14]` and
byte `[value+4]` on live memory (never on FAIL); `resume_817830_a14050_value`
runs the pure chain resume (store `DAT_00c379b8 = value` iff value ≠ 0 ∧
byte&1 — byte test, wide drives) and re-derives the blend/scales/ladder
from refreshed recaptures, then emits `AT_TAIL_817830` (host 31) which
resumes the saved trunk frame at `events.tail_start_va` with the four prefix
locals injected (`[esp+0x398]/[esp+0x28]/[esp+0x18]/[esp+0x80]`) and runs to
the shared exit `0x0081def9/0x0081df0c`; after the tail the RT-pop chain runs
as after the v3 mega-edge. Remaining in FUN_00817830: the `0x00817b53`
(L-room plan) / `0x0081d20a` tail bodies, still host under the saved-frame
contract.
Next: the `0x00817b53` tail body (exact-ZHL `Room::GetLRoomAreaDesc` plan,
post-call pure gates G22/G23) or the `0x0081d20a` tail.


Exact signature identities at a recovered address can be checked with:

```powershell
node scripts/decomp/identify-zhl-address.mjs 0x0092e300 0x009b6840
```

```powershell
npm run decomp:verify-slice
```

The command first checks the C++ source and builds a native x64 object with host
Clang, builds a raw standalone Wasm module, then compares Wasm state and event snapshots with the independent
JavaScript model over fixed boundary cases and 5,000 deterministic randomized
cases. Outputs remain under ignored `output/decomp/wasm-slice/`.

### Parallel round 1 — structural findings and standing decisions

Three facts recovered in this round change how the remaining work is scoped.

**1. `Game::Update` is instruction-complete.** `LAB_006fbbaa` is not a handoff to
a further block: it is the `Game::Update` epilogue (SEH cookie restore, pops,
`ret` at `0x006fbbba`, then padding). No instruction exists past it in the root.
The sequential instruction frontier that earlier checkpoints advanced is
therefore **finished**, and every remaining Update work unit is *depth* —
collapsing the opaque boundaries listed in `decomp/game-update-slice.json` —
not sequence. Reports that describe "the next sequential VA" for this root are
describing something that no longer exists.

**2. `Isaac::genrand_int32` is recovered, so the RNG is no longer a PE blocker.**
See the Room v40 section. The generator is a real MT19937 whose every constant
was read out of this binary rather than assumed from the stock algorithm. What
remains host on that call is a CRT-`rand` override gate and a value-neutral
debug ring, not the number stream.

**3. Two previously-landed peels were wrong and were corrected on machine
evidence**, rather than being left in place because their tests were green:

| Peel | Was | Is | Proof |
|------|-----|----|-------|
| ProcessInput `pov_axis1` west | `+1.0f` | `0.0f` | `cmp eax,0x6978` / `jb` is strict, so `pov == 27000` falls into `xorps xmm0` @ `0x00a6de50` |
| Frame-opaque `956110` walk | fixed count folded once | bound re-derived per step | PE reloads `[edi+0x4b3d8]`/`[edi+0x4b3dc]` and re-does `sar 2` **after** every `vtbl+0x30` call |

Both are the failure mode AGENTS.md warns about: a plausible reading that
survives its own tests. Treat a green differential corpus as necessary, not
sufficient — the oracle can be wrong in the same direction as the translation.

#### Standing decision: the guest allocator is a platform primitive

Peels in Update, Render, Exit, ProcessInput and LuaEngine all terminate at the
same place — `operator new` / `operator delete`, `0x00a0f4c0` / `0x00a0f500`,
the tracked heap `0x00a648b0`, and the `malloc`/`free` IAT
(`0x00b187e0` / `0x00b187dc`, api-ms-win-crt-heap-l1-1-0). Modelling the MSVC
heap to unblock them would be the single largest source of unverifiable
assumptions in the port, and it is not required for behavioral parity:

- **Allocator *wrappers* are game logic and must be translated.** Header layout,
  accounting counters, size clamps, the `block+4` payload bias, and the
  ordering of frees are all read back by the game's own code, so they are
  externally observable and belong in the pure translation. ProcessInput v16
  did exactly this for `0x00a648b0`.
- **Raw allocation is a platform primitive and stays an explicit host action**,
  in the same category as Win32/OpenGL/OpenAL/input under "Port order" step 2.
  Guest *addresses* are not externally observable to game logic: the native
  runtime may satisfy an allocation from any conforming allocator provided the
  wrapper-visible contract above is preserved.

#### The logger's format-and-emit tail is a platform primitive (standing decision, 2026-08-08)

`0x00a112c0` is the process-wide logger — cdecl varargs `(uint32 level,
const char* fmt, ...)`, **3286 direct rel32 callsites** across every family,
**zero address escapes**, and **no callsite consumes its return value**. Its
body splits cleanly in two.

**The level-gate is game logic and must be translated** (landed as the `log`
pure-helper family, ABI v1, `native/decomp/log_pure_helpers.*`): the guard
equality (`cmp [0xc7de48],1 ; je` — full-dword `==`, so guard `0x101` does NOT
block), the listener gate (`[0xc79bd8] != 0` plus a FULL 32-bit
`test [0xc79bdc], ebx`), the low-byte emit and console gates (`test bl,bl` —
`level & 0xff` only, so level `0x100` with no listener is a silent no-op), the
guard state machine (0 → 1 → 2 / 0), the prefix selection
(`lea eax,[ebx-1] ; cmp eax,0xf ; ja` — **UNSIGNED and STRICT**, so level `0x10`
takes the table while level `0x11` and the level-0 wrap take the empty default;
byte table `0x00a114bc`), the append window (dest = `buf+strlen`,
count = `0x2800 - len`, 32-bit wrap, no clamp), the atLineStart law
(`buf[len-1] == 0x0a`), and the callsite marshalling law
(vararg dwords = `(add-esp-N - 8)/4`, va_list at `[ebp+0x10]`).

**The tail is a platform primitive**, in the same category as raw allocation and
CRT math. A residual whose only remaining host content is this tail does NOT
count as untranslated game logic, and no unit may stall on one. The import
directory resolves it to `__stdio_common_vsprintf` (api-ms-win-crt-stdio, via
the option shims `0x00420a80`/`0x00709bc0`), `OutputDebugStringA` (KERNEL32),
the CriticalSection quartet + `Sleep`, and the log.txt sink (fopen/fwrite/fflush,
vtable `0x00ba5184`). The formatter bodies are not in this image; there is
nothing to transcribe.

**Falsifier:** any game logic that reads the log buffer
(`0x00c7b648..0x00c7de47`) back, branches on a formatting result, or observes
message count/order — a serialized message counter, a hash over log content, RNG
seeded from a format length, or a re-read of log.txt. **Censused at decision
time and NOT live in this binary:** a whole-`.text` linear decode (2,094,686
instructions, with a raw-byte superset scan agreeing exactly on every global)
finds no buffer reference outside the logger — the only in-range hits are the
integer constant `0x00c7ce0c` = `0xffffffff/0x148` in vector `max_size`
arithmetic, not addresses — no consumer of the return value at any of the 3286
sites, no outside reader of the atLineStart byte, and only lifecycle virtual
calls on the sink. If a future peel finds game logic re-reading it, report it;
do not work around it.

Two original-binary defects are reproduced and pinned by that family: **D-LOG-1**
— when the append length is 0 the atLineStart law reads the never-written
pre-buffer byte `0x00c7b647` (one reference in all of `.text`, zero writers, BSS
zero), so an empty append **clears** the flag; and **D-LOG-2** — the init-failure
reset path is structurally dead because `0x00a15770` ends `mov al,1` on every
path.

Measured payoff: the **78 family-recorded host-log edges** (frame-opaque 21,
anm2 15, PM 12, exit 9, hud 7, frame-effect 5, process-input 4, render-shell 2,
game-render 2, pgd 1) each downgrade from "untranslated game logic" to
"platform-primitive I/O behind a pure gate". Honest counter: **narrowed, not
removed** — per-family wiring through `isaac_log_emit_plan` is follow-on work
owned by each family. Level 2 (`NET`) is never passed by any callsite.

**D-LOG-3 RESOLVED at log v3 — the v2 qualification is retired.** The v2 unit
found the shutdown pin is conditional (`cmp [0xc7de48],2` at `0x00a71bac`) and
warned a process that never emitted a message would arrive with guard 0 and
leave the logger fully live. **That antecedent is unreachable in this binary**,
proven at v3 rather than assumed:

- the guard has exactly **4 writers** (`0xa11328`=1, `0xa1133b`=2, `0xa11381`=0,
  `0xa71bec`=1) and **zero address escapes** — all six raw LE-dword occurrences
  across all five sections match an already-enumerated instruction's disp32,
  leftovers 0;
- `0x00a71bac` is reachable only through `0x00a71770`'s entry (1 direct caller,
  no tail/cond/register forms, 0 inbound transfers into the body), and that
  caller `0x0093140e` sits in `IsaacMain`;
- in `IsaacMain`'s per-instruction CFG, **`0x00931172` dominates `0x0093140e`** —
  a `call 0x00a112c0` at level **1** (`"Command Line: 
"`). Level 1's low byte
  is nonzero, so the v1 emit gate passes regardless of listener state;
- guard 0 → `0xa11328` (1) → `0xa15770` returns AL=1 on every path (D-LOG-2) →
  `0xa1133b` (2). The only writer of 0 is structurally dead;
- the exception path is the sole orphan block, and its handler returns from
  `IsaacMain` without reaching the teardown.

**So the guard is 2 at teardown on every normal shipped path** (1 only in the
transient `0xa11328..0xa1133b` window), and the v1 claim — after the teardown
pins guard = 1, all 3286 sites are no-ops — stands for shipped runs with its
antecedent now proven. The instruction-level fact remains modelled and tested:
`guard := 1` IS conditional, and `isaac_log_teardown_leaves_logger_live(0)`
still returns 1 function-locally. This is a proven-unreachable antecedent, not a
defect to pin.

Also measured at v2, contradicting the expectation that motivated that unit:
**zero family log edges become proven post-teardown no-ops.** Transitive closure
from the guard store is 154 functions / 15 logger callsites in 8 functions, all
engine/CRT infrastructure; of exit's 16 logger-carrying functions only the two
shared platform primitives (`0x00a157f0`/`0x00a159a0` lock-unlock and the
allocator wrapper `0x00a648b0`) are in the closure, and **none** of exit's 14
game-logic log edges are reachable — the CRT exit path never re-enters
Game/Room/Player code. Narrowed, not removed.

#### Win32 synchronization primitives are platform primitives — with a concurrency falsifier that is ALREADY LIVE (standing decision, 2026-08-08)

Escalated per throughput rule 4: multiple families now stall on the same edges.
`InitializeCriticalSection`, `EnterCriticalSection`, `TryEnterCriticalSection`,
`LeaveCriticalSection`, `DeleteCriticalSection` and `Sleep` are KERNEL32 imports
(`[0xb18278]`, `[0xb18270]`, `[0xb1826c]`, `[0xb18268]`, `[0xb18274]`,
`[0xb182d8]`, all resolved from the import directory). Their bodies are not in
this image; there is nothing to transcribe.

**They are platform primitives.** A residual whose only remaining host content
is Win32 synchronization does NOT count as untranslated game logic, and no unit
may stall on one. **Everything around them is game logic and must be
translated**: which arm is taken, what is stored, and — critically — the
ORDERING of stores relative to the calls. The log family's D-LOG-9 is exactly
that kind of finding (destroy frees the critical section *before* clearing the
ready bit, so for six instructions the holder advertises ready with a dangling
pointer); it is a real defect precisely because the ordering is game logic.

**Falsifier, and it is NOT hypothetical here.** Any behaviour that depends on
real concurrency: contention, an observed `TryEnterCriticalSection` failure, a
recursive-acquire count that another thread must unbalance, or a wait that only
another thread can satisfy. **D-LOG-8 is a live instance** — the logger's
INFINITE lock arm spins `Sleep(0x3e8)` forever on a byte with no bound, and in a
single-threaded Wasm port nothing can ever set that byte. Such a site is NOT
covered by this decision: model the predicate faithfully, pin the original
behaviour, and report it. Do not quietly assume single-threadedness makes locks
free — assume it only where you have shown no cross-thread dependency exists.

#### CRT math imports are platform primitives (standing decision, 2026-08-07)

`FUN_0041d540` / `FUN_0041d520` are three instructions each (`cvtss2sd` /
`call` / `cvtsd2ss`) around IAT thunks that the import directory resolves to
**`api-ms-win-crt-math-l1-1-0.dll!_libm_sse2_cos_precise`** and
**`!_libm_sse2_sin_precise`**. The bodies are not in this image: there is
nothing to transcribe, and bit-exactness cannot be established from the binary
under analysis.

**CRT math imports are therefore platform primitives**, in the same category as
raw allocation, Win32, OpenGL and input. A residual whose only remaining host
content is a CRT math import does NOT count as untranslated game logic, and no
work unit should stall on one. The v66 unit hit this at the `0x0098de58` timer
body and correctly stopped rather than inventing an implementation.

This decision carries a caveat the allocator decision does not, and it must not
be buried. These values feed `Game+0x264ec`/`+0x264f0` (screen shake) through a
**recursive** update — `x' = 0.5*x + mag*cos(theta)`, `mag = (float)(int)timer /
10.0f`, `theta = u32rand * 2^-32 * 3.14f * 2` — so a last-ULP difference
compounds across frames rather than washing out. The decision is that this is
acceptable because no better evidence exists in the image, NOT that the
difference is proven immaterial.

**Falsifier:** any differential divergence traced to a CRT math result, or any
game logic that serializes, hashes, compares for equality, or seeds RNG from
one of these values. Report it; do not work around it.

Consequently a residual whose only remaining host content is raw
allocation/free does **not** count as an untranslated game-logic boundary, and
no work unit should model the heap as a side effect of an unrelated peel. If a
future peel finds game logic that depends on a pointer *value* — ordering
comparisons, hashing on an address, serialization of a pointer, or RNG seeded
from an address — that is a counterexample to this decision and must be
reported rather than worked around.

#### Multi-root catalog covers every pure-helper family

`PURE_HELPER_MODULES` in `scripts/decomp/frame-path-roots.mjs` previously
registered 5 of the 11 built pure-helper families, so six zero-import Wasm
modules were being produced and served but never loadable through the frame
path. All eleven are now registered and ABI-checked:

| Kind | Ids |
|------|-----|
| Primary roots (gate `usesX86Emulation`) | `render`, `processInput`, `exit`, `luaEngine` |
| Companions (never gate PE status) | `room`, `frameOpaque`, `frameEffect`, `hudPostUpdate`, `playerHud`, `playerManager`, `roomTransitionEngine` |

New exports `FRAME_PATH_COMPANION_PURE_IDS` and `ALL_PURE_HELPER_IDS`.
Companions resolve by id, `pureName`, directory, or PascalCase; they receive a
mode only when the caller actually probed them, so existing consumers keep their
exact shape. `web/js/native-update-bridge.js` now boots all eleven instead of
four; a missing or stale-ABI companion stays non-fatal and never gates the
Update tick. `scripts/serve.mjs` already mounted the whole tree.
