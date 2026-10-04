# Decomp historical checkpoints (archived from AGENTS.md, 2026-08-31)

Version-bound narrative. Nothing here is the live state — run
`node scripts/decomp/status.mjs` for that. Kept because the negative
results ("assessed and declined, do not re-open") and the defect
post-mortems remain binding evidence.

## Current checkpoint

NOTE (2026-08-14): the live tree is Update ABI **91** (state 524 / runtime
6756 / events 500; idx 10 `0x004212c0` NARROWED at v90/v91 — flag_111
409030-pair gate plus the secondary==3 40add0 false-probe arm; runtime
`frameOpaque4212c0{ProbeReady,ProbeResolved,Add0Field4,Add0ListCount,
Add0MatchIndex,Add0Bitfield18}` @6732..6752, probeReady=0 keeps the
pre-v91 always-host). ANM2 family is at **46** (`0x0040ac30` SetOverlayFrame
(int) + `0x0040ac50` at v31; `0x0040ac70` id lookup + `0x0040ac60`
forwarder at v32). Verify with
`grep "ABI_VERSION = " scripts/decomp/*-model.mjs`; the narrative below
describes v82 and is historical.

ABI **v82** (Update slice, record 0 flag-runtime correction) is the tracked
checkpoint; wave-2.5 closed
2026-08-11 with frame-opaque **v31**, PlayerHUD **v18**, SFX **v9**, ANM2
**v9** (`0x0040bea0` Reload plan, landed by anm2-3). `Game::Update` is
**instruction-complete** (`ret` @ `0x006fbbba`); all remaining Update work is
depth. Opaque boundaries: **49** — record 0 (`opaqueCall009a2b30`) NARROWED at
v80/v81/v82: the HUD::PostUpdate history one-shot latch `Game+0x23580` (=
Game+0x1da04 + 0x5c7c) is sparse state @521. PE `0x009a2b67 cmp byte
[ebx+0x5c7c],0 / jne 0x009a2b83`: latch clear → full history residual
(0x83b850 RecomputeAll + 0x83b280 loop) and the model mirrors the PE store
0x009a2b77; latch set → only the loop runs (`hudHistoryLoopResidual` @476,
events 480). v81 gate-peeled the loop (per-slot flag bytes
`Game+0x2355c`/`0x23570`); **v82 CORRECTED the v81 census and moved the
flags to RUNTIME inputs**: the flags' real writer is `0x83bb6f` inside
0x83b850 phase 2 (`mov byte [recv+eax*4+4],1`, recv = Game+0x23558
REGISTER-HELD base — a static-disp census structurally cannot see it),
reachable whenever the `[0xc71678]+0x1baa8` manager registry (once-created
0x68e88-byte singleton: setters 0x952847/0x9597d0, teardown 0x9ab8a9) has
qualifying entries (type 0x1d/0x26 sub-node, `0x83bbc0` stores
`[recv+idx*0x14]` at 0x83bc2f, `[recv+eax*4] != 0`). State apply would fold
the host's post-call write back to the pre-step capture (defect class 1);
as runtime inputs @4532/@4533 (u8; runtime struct 4536 incl. tail padding)
the host supplies the current buffer bytes each tick and apply never
touches them (v75 engineAnm2Latch precedent). The `0x83abb0` ctor zeroes
slotPtrs, both flags AND the latch at construction (pre-Update; the latch's
Update-time writer set stays {0x9a2b77}). Latch set + BOTH flags clear →
pure no-op (no loop event); any flag set → `hudHistoryLoopResidual`. Record
STAYS: 0x83b850 is IRREDUCIBLE (phase 1 destructs stale nodes via
virtual-ish `[[node+8]]→[[+0xc]]` calls + `[0xc7163c]` call + sized-frees
0xaef15c; phase 2 sweeps the manager registry) — the peel is NOT available,
the residual stays host. Record 2 REMOVED at v79 (blob-gated pure
tree walk over `[0xc7987c]`, result byte `Game+0x4aba0` @520, node packs
@3764+i·24, gate misses keep the monolithic residual byte-for-byte);
record 49 REMOVED at frame-opaque v31 AND WIRED at slice v78; record 22
NARROWED at v77; `0x0098dba0` removed at v76, `0x004257b0` at v71.
State **524** / runtime **4536** / events **480**. Suite: `npm test`
**1173/1173** · `decomp:verify-slice` **5244 cases, ABI 82, result pass**
(blobLane=432, latchSet=207, latchMismatch=0, flagSet=306, flagClear=126) ·
abi.json **0 imports / 116 exports** · check-repo-safety pass ·
git diff --check clean.
Verifier notes (harness-neutering class, all caught by mutation):
(1) the record-2 direct-export probe originally passed the node Uint32Array
straight to the Wasm export — V8 coerces it to NaN → i32 0 → the module read
`nullptr` and returned -1. Fixed to write the pack into the dead
runtime-inputs scratch and pass a real pointer.
(2) the HUD blob lane (mask/blob/history/stat + 8×13 slot packs + latch +
v82 flags) was silently neutered SINCE v41: the whitelist build omitted
`playerHudBlobReady` and the slot flat keys, and the corpus draw used wrong
names (`playerHudTwinPtr` instead of `playerHudSlot0TwinPtr`) — blobLane=0
over all 5244 cases, so the per-slot pure islands were NEVER differentially
exercised. Fixed both; the permanent guard (blobLane>=50, latchSet>=1,
latchMismatch==0, flagSet>=1, flagClear>=1) throws if the lane is ever
neutered again. Mutations proven discriminating: latch flip `==0`/`!=0`
fails at case 244; v81 flag `||`→`&&` fails at case 285; v82 runtime
channel mutants (flags `||`→`&&`; gate on `& 0x100`) both fail, proving
the drawn runtime values actually reach the module. The verifier also now
seeds runtime-only binary bytes (the two flags) into the game buffer
pre-run and expects them unchanged post-apply — a real bridge's contract;
the JS model's `normalizeRuntimeInputsForLayout` and the verifier whitelist
both pass the new keys (another silent-zero trap).

Family ABI (authoritative: `grep "ABI_VERSION = " scripts/decomp/*-model.mjs`):
Update 82 · Room 51 · Exit 36 · render-shell 33 · frame-opaque 31 ·
ProcessInput 26 · Lua 26 · PlayerHUD 18 · PM 19 · HUD 12 · room-transition 12 ·
frame-effect 11 · PGD 9 · SFX 9 · ANM2 9 · render root slice 5 · log 5 ·
alloc 1.
Wave-2/2.5/3 landings: PM 19 walk-tick plan; Exit 36 0x007df690; ProcessInput
26 FUN_00954b40; ANM2 8 LoadGraphics lane + ANM2 9 Reload plan (0x40bea0);
Room 51 walk laws; PGD 9 PGDEX/PGDCT rows; RTE 12 AnimationState::Rewind;
frame-effect 11; render-shell 33 probe-B (NARROWED); frame-path module-backed
drivers; Lua 26 error-path callee bodies; PlayerHUD 18 `stat_bar_tween`;
SFX 9 append-arm skip law; frame-opaque 31 record-49 removal + slice v78
wire. Wave-3 delegation: 16 units spawned, ONE landed (anm2-3); the rest died
mid-analysis — coordinator executed the v78 wire inline.
Remaining work for PE-free frame path: 49 Update opaque boundaries
(AUDIT ranking: record 0 HUD trio assessment COMPLETE at v80/v81/v82 —
latch split, loop gate peel and the flags-to-runtime fix are all landed;
0x83b850 assessed IRREDUCIBLE (phase 1 virtual destructor calls +
`[0xc7163c]` + sized-frees; phase 2 registry sweep; `0x83bbc0` is the node
setter, `0x83abb0` the zeroing ctor) → stays a host residual; the next
removable piece is the **0x84c170 tail** at `0x009a2bb2`: RecomputeStats
0x84ca00 + FirstCollectibleOwner 0x9be080 + fatal log 0xa112c0 + sized-free
0x00aef15c (needs its own census + blob-gated pure). Record 50
`opaqueCall008607a0` is CENSUS-COMPLETE and pinned at its v57 maximum
narrowing: the set-arm `lua_pcallk` executes a runtime registry-indexed Lua
function (0xfff0b9d8) that can be mod bytecode with game-API side effects,
so the host event is required; closure is Lua-API-only with zero Game
stores); Input/Exit/Lua/Render roots unpinned; live rAF still Update-only
hybrid.
Next exact frontier: the record 0 `0x84c170` tail (census RecomputeStats
0x84ca00 / FirstCollectibleOwner 0x9be080 / fatal-log / sized-free
0x00aef15c edges first, then the blob-gated pure translation), then the
next removable record.

### Historical records (v65..v79) — do not re-open without new evidence

**Record 2 (`opaqueGlobal4aba0Refresh`) — REMOVED at ABI v79, do not
re-open.** The PE block `0x006fb414..0x006fb474` is a pure decision when the
captured `[0xc7987c]` intrusive tree is available: `cmp eax,esi / je` on the
Manager container range (begin==end skips the ENTIRE block, byte untouched),
then walk sentinel+0x20-nodes via the advance callee `0x00414a80` (f0d==0
side: land on a.next when live, else run-descend to the last dead node; f0d!=0
side: climb prevs while node == prev.child), accumulating a flag per node with
`+0x18 == 0`, finally `byte = (flag == 0)` via test/sete. The pure path is
blob-gated (ready=1, begin!=end, 1<=count<=32 packs); all gate misses keep
the v78 monolithic residual byte-for-byte. Capture contract: blob scalars
@runtime 3748-3760, 6 u32s per node @3764 + i·24, `globalTree4aba0Result`
sparse state @520; C++ static_asserts + JS layout pins + verifier probes
landed. Blob-less callers (the shipped frame path today) still take the
residual — honest caveat: the live path is unchanged.

**A negative result pinned at v65, do not "re-fix" it.** `0x00840b9c` writes
`Game+0x216e9` and `0x0098df54` re-reads that byte later in the same function,
which the model folds to a pre-call capture. That looks exactly like defect
class 1 (post-call value folded to a pre-call snapshot) and it is NOT one: the
counter tail requires `bl != 0` (`0x0098de34 test bl,bl / je`) while every
predecessor of the gate label `0x0098df47` requires `bl == 0`, and nothing
between them writes ebx. The two are mutually exclusive per invocation, so the
capture is correct. A test assertion pins this.

v69 wired the PM0/PM1 death walk at `0x009bb5d0` (`PlayerManager::Update`),
consuming the PM family's frozen death contract by reference. The residual now
DROPS `playerManagerUpdateDeath` on three PE-proven no-op arms (gate closed,
outer count 0, ready packs with zero eligible) — safe by fixed point: zero
eligible means zero TriggerDeath, so no mutation can invalidate the pre-walk
packs. Runtime 2156 → 2356 (`pmDeathPlayerCount`/`pmDeathBlobReady` + 6 lanes ×
8 players); state/constants/events unchanged; defaults reproduce the v68 event
stream byte-for-byte and the live frame path is v68-identical.
Deliberately NOT done: expanding the eligible mask into per-player TriggerDeath
host calls. TriggerDeath (`0x007a1090`) mutates live players and the vector
mid-walk, so pre-deciding later iterations from pre-walk packs would be defect
class 1. A test pins that no such expansion exists.

**Record 22 (`opaqueRoomTransitionEnginePrefix`) — NARROWED at v75/v77; removal
requires translating `ANM2::Load`.** The finding: **the gated callee latches its
own gate.** `ANM2::Load`'s receiver is `lea ecx,[edi+0x38]` and its
`0x0040bdb2 mov byte [esi+0x109],1` writes `this+0x38+0x109` == `this+0x141` —
the very byte that gates the arm. Displacement census: `0x1b97d` has ZERO
references image-wide, and disp `0x141` has exactly 3 writes image-wide, none in
the 15-function closure reachable from the engine base (built from the 21
`lea [Game+0x1b83c]` producers). So the arm is a **one-shot per Game object**,
not unreachable. v75 therefore drops the prefix host event whenever the latch's
low byte is set — the steady state — keeping the host only for the first load.
v77 wired the ANM2 load lane in-module (engineAnm2* inputs/events; state
520 / runtime 3748 / events 476). The other half is settled: the `0x00a112c0`
log at `0x0082ee96` is on the ALWAYS path (nothing branches above it) and the
standing logger split covers it, so it alone does not keep the record.
Skip-arm store census is empty — 2 own-frame writes unwound by `ret 0x14`, one
balanced `fs:[0]` SEH pair, one call (the logger) — which is what licenses the
drop. `ANM2::Load` itself has **6 observable stores**, two of them
unconditional, so the record survives. Correction: that arm has **five** call
sites, not two; the extra three are platform primitives (alloc shim,
`_invalid_parameter`, release).

**Record 21 (`opaqueFrameEffect6fd7c0Shell`) — FULLY ASSESSED at v74, no
further narrowing available.** v72 dropped its proven no-op arm, v73 retired the
blue-room edge, v74 proved `FUN_00705ee0` irreducible: nine observable Game
stores spanning `Game+0x269ea..0x676ac` with the payload from
`*0xc7169c+0x2d0` (outside the Game buffer), plus exact-ZHL
`Game::SaveState 0x006f9000` (45 pattern bytes; 1017 bytes, 19 calls, 2
virtual). The `-1` argument does NOT help: `0x00705f5a js 0x705f9b` sends every
negative arg straight to the write block, so `-1` is exactly the value that can
never dedupe. The bulk-copy count `0x20b` is loaded once, not re-derived. Its
only depth target is `Game::SaveState`, which is not a peel candidate.

**`0x0040c7f0` — ASSESSED AND DECLINED at v71, do not re-open.** It is a
hand-rolled thread-safe refcounted smart-handle assignment operator (154 bytes,
`ret 4`, 73 direct rel32 callers, 0 `jmp`/register/address-taken reaches — the
call set is complete). Every invocation keeps three irreducibly-host leaves on
the ALWAYS path: `operator new(0x18)` (covered by the allocator decision),
`operator new(0x1c)` + `InitializeCriticalSection` in a ctor whose cache bit is
provably always clear (so it is never the cached arm), and Enter/Leave on the
release path. Two further reachable arms are unbounded: an arbitrary virtual
payload dtor `[[ctrl+0x14]]+0x34](1)`, and `[0xc7163c] -> 0xa12240 -> 0xa121b0`,
a cross-subsystem registry walk under a SECOND lock (`[0xc7163c]` censused: 244
readers / 7 writers, two-valued `{0, 0xa12240}` — not constant, not provably
null, and NOT the logger, so the logger split does not cover it). No arm is
side-effect-free, so no record drops and no narrowing is available. Secondary
blocker: the receiver pair lives at `*0xc7169c + 0x4ae0c`, outside the Game
object the slice's capture ABI addresses. Note the VA is ALREADY a frozen
contract in the read-only Exit family (`ISAAC_EXIT_40C7F0_*`) — a wire would
re-derive it and still emit 2 host events. Bookkeeping: the JSON holds ONE
record for this VA; the `2` is the event value, not a record count.

**`0x008068f0` (`Room::TriggerClear`) — ASSESSED AND DECLINED at v69, do not
re-open without new evidence.** It carries 7 of the 54 records, but a full
instruction-stream read (225 instructions, 19 direct rel32 callsites, 0 resyncs)
shows **zero are removable**: every record keeps an irreducibly-host leaf on its
always-path — a 1390-line award-spawner at `0x7fb250` (unconditional when bit7
is clear), a 476-line music body at `0x7f83b0`, a 229-line one at `0x7f7a40`,
guest-alloc vector growth for stats, and a rewind snapshot at `0x705ee0`. Only
narrowing is available there. Also: the older census calling this body
"merchant/UI" is WRONG — it is room-clear stats/audio/awards/snapshot.

**BOUNDARY REMOVED at v71: `0x004257b0` (54 -> 52).** It held TWO records
(`opaqueCall004257b0PassA` and `PassB`); both are gone and the VA now sits in
`resolvedBoundaries`. The Update slice consumes the frame-opaque v29 frozen
contract by reference — `9b9480_count`, `pass_a_pairs_from_samples`,
`pass_a_count_evolution`, `list_count_from_bounds` (the PE's SIGNED magic
division, never unsigned `delta/0x68`), `pass_b_needs_host_recaptured`,
`pass_b_apply`. The recapture is taken on ONE path only (`id_count != 0`);
`Game+0x1bbe0`/`+0x1bbe4` are read together at one instant because the append
can reallocate and move both. Remaining host content is platform-only: the
`0x00426640` grow (verified a textbook `vector<0x68>::_Insert_reallocate`, no
game logic) and the `0xa112c0` bursts (logger split). Honest caveat: the pure
path is gated on a blob; blob absent, a count over a cap, or a recapture
disagreeing with the pure post count all fall back to the v70 host residuals
byte-for-byte, and the shipped frame path supplies no blob today.

**A family's `pure_complete` counts residual host CALLS — it does NOT mean the
arm is side-effect-free.** Measured at v72: `0x007abe20`'s plan reports
pure-complete under its precondition, and a consumer reading that as "safe to
drop the host event" would have been wrong. Every path through it
unconditionally stores `[entry+0x139a]`, `[entry+0x14c]`, `[entry+0x1398]` and
calls `ANM2::Reset` / `AnimationState::Rewind`, which zero heap arrays on
player-entry objects **outside the Game object the slice's capture/apply ABI
addresses**. Dropping a host event requires proving the arm writes nothing and
calls nothing — census the STORES, not just the calls. The v72 unit declined
the drop on exactly this basis and wired the other handoff instead.

v73 retired the blue-room edge on record 21 by proving
`Level::TryInitializeBlueRoom` (`0x0074d4a0`) a no-op on every Update
invocation: 1 direct caller image-wide and **zero** occurrences of the address
anywhere else in the image; on the `direction == -1` path all 189 instructions
write only own-frame slots (unwound by `ret 0xc`) plus a BALANCED `fs:[0]`
pair, with one read-only call. Both Update sites push `6a ff` unconditionally
(inbound-edge census: nothing can enter either push block past its first
instruction). Record 21's SOLE remaining blocker is now `FUN_00705ee0`;
resolving it removes the record and takes the count 52 -> 51 (record 21 is now
FULLY ASSESSED — see above — so this line is historical).

v68 wired the shared v5 PMS entry gate into the PM3 **PLAY** residual
(`SFXManager::Play @ 0x0092dc30`, exact 44-byte ZHL match): only **MISS**
(id < 0 PE 0x92dc73 js / id >= 0x1b8-stride count PE 0x92dc96 jge) is a
side-effect-free return and the play event is DROPPED; NO_SAMPLES keeps the
warn-log host (PE 0x92dcb5 call 0xa112c0, "[warn] Sound %d has no samples.");
DISABLED keeps the host because the play path LOADS the entry (PE 0x92dcda
call 0x92cfb0 SoundEffect::Load, "[warn] Sound %d was not preloaded.") and
CONTINUES the body — narrower than the v60/v62 mutator folds, which also drop
DISABLED. ready=0 keeps the pre-v68 always-host residual.

v67 landed the **Room capture contract** + the F4 driver recapture. Before
it, `isaac_game_update_slice_capture` left 35 state members carrying the
previous tick's struct values, so `createNativeUpdateSession` silently DISCARDED
caller-supplied Room state (33 of 36 sentinels came back zero) and the 7-event
room trigger-clear chain fired once per **Wasm module instance** instead of per
RoomDescriptor — the PE keys it to `[desc+0x44]`, re-tested live every frame at
VA 0x00804113 / 0x0080427f. Capture now assigns EVERY member (Game-homed from
the buffer, host-owned pinned 0) and the session threads its own sparse state
through `overlayHostOwnedState`. Contract: `HOST_OWNED_STATE_CONTRACT` in
`scripts/decomp/game-update-model.mjs` (35 overlay-managed fields ==
STATE_LAYOUT∖BINARY_LAYOUT, pinned by test).

v66 folded the `0x0098de4a` timer gate in `FUN_0098dba0` (signed `jle`, so
`0x80000000`/`0xffffffff` skip). A CORRECTNESS fix, not just a narrowing:
through v65 the port raised `opaqueCall0098dba0Timer` on EVERY resume, a host
event the original does not raise on the common path.

v65 typed the `0x00746560` notify boundary at both Update sites
(`0x006fb7d6` push 0, `0x0098de45` push 1) with two new pure exports — a
low-byte bit-0 flip (`xor al,1`, so param 2 stores 3) and a **signed**
`mode >= 2` deathmatch-suffix gate — and fixed a dual-side silent omission:
`0x00840bd7 mov byte [edi+8],1` writes `Game+0x216e8` (`hudMessageFlag8`),
a sparse field that was captured and applied but never written by either
side. Gated on `hostFun746560PostReady`; ready=0 reproduces pre-v65 exactly.
The `0x00746560` body stays host (unbounded string build + guest allocator +
ANM2 widget) — narrowed, not removed.

**Trust tracked source over this checkpoint.** ABI constants live in
`native/decomp/*.h` and `scripts/decomp/*-model.mjs`; docs lag. Verify with:
`grep "ABI_VERSION = " scripts/decomp/*-model.mjs`.

Standing decisions (full text in docs/decomp-port.md): Win32 synchronization
primitives (CriticalSection quartet + `Sleep`) are platform primitives, but the
ORDERING of stores around them is game logic, and the falsifier — a wait only
another thread can satisfy — is already live as D-LOG-8. The logger
`0x00a112c0` splits — its level-gate is game logic (translated, `log` family
v1), its vsnprintf/OutputDebugString/file tail is a platform primitive; 3286
callsites, falsifier censused clean (no buffer reader, no return consumer).
CRT math imports
(`_libm_sse2_{sin,cos}_precise` via `api-ms-win-crt-math-l1-1-0.dll`) are
platform primitives — the bodies are not in this image, so no unit may stall on
them; falsifier: any divergence traced to a CRT math result, or game logic that
serializes/hashes/compares/seeds RNG from one. The guest allocator is a
platform primitive (wrappers are game logic and must be translated; raw
malloc/free/new/delete stay host and do not count as untranslated game logic —
falsifier: game logic depending on a pointer *value*); original-binary defects
are **reproduced and pinned, never corrected**; mutation-check every new test
(break the translation deliberately, confirm the test fails, revert, report);
Wasm test scratch at `0x100000`+; draw randomized corpus indices from the
shared LCG's **high** bits, never `% n`.

Remaining work for PE-free frame path: 51 Update opaque boundaries;
game-logic residual hosts; full root slices for Render/Input/Exit/Lua
(Render slice ABI v5); live rAF still Update-only hybrid.
