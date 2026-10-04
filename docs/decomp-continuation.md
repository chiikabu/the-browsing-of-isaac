# Decomp parallel-orchestration — continuation handoff

Written at a session boundary to let a future session resume the multi-agent
`codex/decomp` port without re-deriving what was learned. Read this, then
`AGENTS.md` (the "Throughput" section and the expanded defect-class list are
new), then `docs/decomp-port.md`.

**Nothing here is committed.** The entire `decomp/`, `native/decomp/`,
`scripts/decomp/` tree is untracked but persists on disk. A future session picks
up from the working tree as-is.

## Status at last update

The earlier v51/v52 model-vs-JSON inconsistency is **resolved**: both now report
**53**, opaque boundaries **57**. Verify before trusting:

```
node --test tests/decomp-game-update-slice.test.js tests/decomp-pipeline.test.js
npm run decomp:verify-slice
node --test tests/decomp-frame-path.test.js
```

A transient `Unexpected slice ABI version N; expected N+1` from the frame-path
test just means the model bumped before the wasm was rebuilt — rebuild, do not
"fix" the expectation.

### Three Update-side correctness handoffs are OUTSTANDING

All three were confirmed by other sections, all live in
`native/decomp/game_update_slice.cpp`, and all are **boundary-count-neutral**
(they remove divergences, not boundaries). Consume the other family's helpers —
do not re-derive:

1. **F4 — `4257b0` Pass-B gate. RESOLVED ON THE SLICE SIDE, BROKEN IN THE DRIVER.**
   The Update slice has consumed the recaptured gate since Update ABI **v53**
   (`game_update_slice.cpp` ~3165-3205), so the old "conservative export wired at
   `:2429`" claim is dead. Frame-opaque **v27** froze the capture contract
   (`Game+0x1bbe0`/`+0x1bbe4` read together — the append can reallocate and move
   BOTH; post count via the PE's **signed** magic division, not unsigned
   `delta/0x68`; recapture ONLY when the Pass A host ran).
   **The live defect is now the opposite of the old one:**
   `scripts/decomp/frame-path.mjs:5687-5688` supplies the PRE-Pass-A count and
   `web/js/native-update-bridge.js` never supplies the recaptured one, so if
   Pass A inserts into an empty list the port **DROPS** a Pass B the original
   runs — wrong-state, worse than the earlier over-host.
2. **anim-20 fold.** The fold at `game_update_slice.cpp:1734` is faithful for
   anim 0 only. For anim 20 it folds a bound the PE re-derives **three times per
   iteration** (`0x0082f010`/`38`/`c3`) and inverts host/float-reset ordering.
   Rewire against the room-transition-engine **v8** helpers (verified against the
   instruction stream). Also unmodelled: mid-loop `count == 0` fatal at
   `0x0082f025`, and an unsigned `jae` clamp-to-element-0 at `0x0082f040` which
   is a latent original defect — reproduce it.
3. **F5 — HUD post-update recapture.** `Manager+0x2a384` (`0x009a2b5a`) and
   `+0x2a37c` (`0x0084c178` via `0x009a2bb2`) are read **after** the eight
   `call 0x842230` bodies. In `maybe_emit_hud_post_update` (~lines 798–861),
   recapture both after the slot loop before deciding `hud_history_residual` /
   `hud_stat_residual` (~lines 853–854). Use
   `isaac_hud_post_update_snapshot_safe` — it names when a pre-dispatch snapshot
   is still valid, so the rule is "recapture unless snapshot_safe".

## The MT19937 wire (the highest-value pending integration)

`Isaac::genrand_int32` @ `0x006eef60` is fully recovered (Room v41) as a real
MT19937, every constant proven from the binary; its only host content is raw
alloc / `RtlCaptureStackBackTrace` (platform primitives under the standing
allocator decision), so it is **game-logic complete**. Room wrote the exact
capture contract in
`output/decomp/5129df723e64/section-notes/room-v41-genrand-close/NOTES.md` §3:

| Field | Address | Size | Direction | Notes |
|-------|---------|------|-----------|-------|
| `mt[624]` | `0x00C7AC70` | 2496 B | read/write | BSS; a twist rewrites every word, so apply writes all of it |
| `mti` | `0x00C34F04` | 4 B | read/write | `.data`, initial `0x271` |
| `useCrtRand` | `0x00C7AC68` | 1 B | read only | BSS default 0; nonzero only in `Menu_Character::Reset`→`Seeds::set_start_seed` (new-run-seed), which `Game::Update` never reaches; nonzero ⇒ `mt[]` NOT advanced (early return `0x006eefa9` precedes state access) |

`mt[]` (BSS) and `mti` (`.data`) are NOT adjacent → two separate sparse fields.
Room's `roomAmbient824a70GenrandStreamPlan` and `isaac_room_genrand_call_residual`
are **frozen byte-for-byte** so the Update side builds against them. Consume,
never re-derive, and never edit `room_pure_helpers.*`.

## Pending cross-section handoff — F4 recaptured gate

frame-opaque v21 left `isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured`
(PE-exact, takes the post-Pass-A count) beside the old conservative export wired
at `game_update_slice.cpp:2429`. The Update side must recapture the `0x68`-stride
list count AFTER Pass A (a continuation) and switch the gate to the `_recaptured`
form. Until then the port emits one Pass B host event the original does not
(extra host events, not wrong state).

Also: frame-opaque v21's F1 fix (98dba0 mode-1) intentionally changed shipped
hybrid Update behaviour — `events->hud_message_text_out` now fires on
mode==1/bVar2==0 ticks and the sparse counter resets. `game_update_slice.cpp:1646`
already consumes the value as `fallthrough`. Do not treat that event-stream delta
as a regression.

## Per-section state on disk (refreshed 2026-08-07 from `grep ABI_VERSION = scripts/decomp/*-model.mjs`)

Several are AHEAD of the last cleanly-reported checkpoint because this session's
agents were interrupted mid-unit — treat any un-reconciled bump as **needs
verification**, run that section's test first.

| Section | Files (`native/decomp/…`, `scripts/decomp/…`, `tests/…`) | ABI on disk | Next VA / task |
|---------|------|-----|----------------|
| **Update (tracked)** | `game_update_slice.*`, `game-update-model.mjs`, build/verify scripts | **69** (model == JSON; opaque **54**; runtime 2356) | v69 wired the PM0/PM1 death walk (`0x009bb5d0`), dropping the host event on 3 proven no-op arms. Next: `0x0098de4a` timer interior (genrand + float stores). **`0x008068f0` assessed and DECLINED — 0 of its 7 records removable, see AGENTS.md** |
| **Render shell** | `render_shell_pure_helpers.*` | **31** (game-logic complete) | — |
| **Render root slice** | `game_render_slice.*`, `game-render-model.mjs` | **4** (composed; WIRED into the live frame path on its own `*(Game+0x18300)` buffer) | `0x00817b53` / `0x0081d20a` tail bodies |
| **Room** | `room_pure_helpers.*` | **49** | audit F2 (3 sfx-id helpers) + next VA `0x00812fa7` L-room clamp — VERIFY, doc was 6 versions stale |
| **Room transition** | `room_transition_engine_pure_helpers.*` | **10** (`0x0082ee40` whole body + composed `0x007abe20`; NO sequential frontier left inside it — all 229 insns transcribed, 47 stores / 12 call sites censused) | `0x0040bd50` `ANM2::Load` (anm2-family territory). Counter can only move from 2 by **Update-slice wiring** of `isaac_room_transition_engine_7abe20_body_plan` |
| **Exit** | `exit_pure_helpers.*` | **34** (`0x008d26c0` game-logic complete under the logger split) | `0x0040d040` string tidy/deallocate — **1321 reach sites** (1288 rel32 + 33 jmp tails), highest leverage in the family |
| **Lua** | `lua_engine_pure_helpers.*` | **24** (property-accessor surface PROVABLY COMPLETE at **383**; 5 upvalue disciplines; both-sided law counterexample pinned) | install side closed — depth target `0x008c32d0`, else the `0x0089e610..0x008a06a0` install-helper band |
| **Frame-opaque** | `frame_opaque_pure_helpers.*` | **29** (Pass A + Pass B both fully translated; 4 LIVE at-risk params fixed) | `0x00421343` 4212c0 secondary==3 interior. **`0x004257b0` is a REMOVAL CANDIDATE — see below** |
| **Frame-effect** | `frame_effect_pure_helpers.*` | **9** (`0x008279a0` fully translated — `pure_complete=1`, the family's first; `0x006fd7c0` at v8; `0x006fe2f0` landed at v5) | `0x0081e9d0` candidate producer (~169 insns) — converts 2 of 8 search sample fields from host to derived |
| **PM** | `player_manager_update_pure_helpers.*` | **17** (v15 `isaac_pm_urh_*`; v16 `isaac_pm_heal_*` sealed the SEH heal host; v17 `isaac_pm_heal_emit_plan` sealed the sibling clamp wrapper) | `0x007ca840` — next address-stable sibling (the `0x007791f0` CASE0 tail and the heal/emit wrapper bodies have no untranslated control flow; their callers still host-call the pure plans) |
| **HUD** | `hud_post_update_pure_helpers.*` | **11** | audit F5 (try_pure wiring, Update-wired) |
| **PlayerHUD** | `playerhud_post_update_pure_helpers.*` | **16** (v16: 4 PE-verified correctness fixes — take_result byte mask, list-clear gate inversion, tail-float NaN minss clamp, dirty-notify arg 0x2e→1; red suite fixed 2026-08-07) | next: re-census the remaining PlayerHUD host residuals |
| **SFX** | `sfx_pure_helpers.*` | **7** (`0x0092e230` whole body + `0x0092e300`, previously unmodelled; both NARROWED, logger split covers their only non-device host edge) | `0x0092cf40` `Preload(int id)` — **NOT `0x0092cfb0`**, which landed at v3 |
| **PGD** | `pgd_pure_helpers.*` | **7** | `0x00927244` section-3 deserializer; promote the 5 unidentified arrays |
| **log** (shared) | `log_pure_helpers.*` | **5** (level-gate + lifecycle + lock/unlock + destroy; **D-LOG-1..10** pinned; ready-bit lifecycle closed; 64 tests / 601,976 assertions) | `0x00a68440` `KAGE::MutexBase` (same template, critsec arm deleted) + `0x00a68490` ns clock |
| **ANM2** | `anm2_pure_helpers.*` | **6** | `0x00408e00` frame/scale advance |

**Logger lock protocol (log v4) — two new defects and one refuted hypothesis.**
`0x00a157fe`/`0x00a159a3` are NOT instances of the lazy-init template; only the
`F6 /0 ib` bit-0 predicate is shared. They are a distinct 2-instance
**assert-only guard** with no allocation, no `InitializeCriticalSection`, no
`bts`, and **no store to the flags byte on any path** — the pair reads the ready
bit and never sets it. Consequences, all pinned:
- **D-LOG-6 is observable from the lock path** and *disarms* the assert that
  exists to catch an uninitialised mutex: the alloc-failure arm publishes flags
  bit 0 = 1 while storing a NULL `CRITICAL_SECTION*`. Faults are
  `EnterCriticalSection(NULL)`, `TryEnterCriticalSection(NULL)`, and in unlock a
  **store** to `byte [0x00000018]` *before* the API call.
- **D-LOG-7** — a successful TIMED acquire jumps over `mov byte [esi+0x18],1`,
  returning TRUE while the owned byte stays 0; the next INFINITE acquire then
  sees a free mutex, re-enters the recursive CS, and one unlock unbalances it.
- **D-LOG-8** — the INFINITE spin has **no bound**: `Sleep(0x3e8)` forever while
  still holding the critical section, only exit is the byte reading 0. A
  re-entrant INFINITE lock on the same thread spins forever.
Corollary proven: in every non-D-LOG-6 state the re-entrant assert is
unreachable from the logger's own callsite (guard == 2 has one writer, dominated
by the init call, which sets bit 0 on both arms).
Census refinement (stated, not silently rewritten): `HOLDER_FLAGS_READERS = 0`
is correct as an absolute-displacement census but under-describes reality — the
two real readers are indirect (`[eax+4]`/`[esi+4]`). A new
`..._INDIRECT_READERS = 2` sits beside it, both pinned by `static_assert`.

**`0x004257b0` IS A BOUNDARY-REMOVAL CANDIDATE (frame-opaque v29).** No
untranslated game logic remains inside it: Pass A count/fetch/pair laws
(`0x009b9480`, `0x009b9310`, `0x00417800`, `0x0090ac70`, `0x004264c0`) and the
Pass B interior are all pure. The only residue is the `0x00426640` grow (guest
allocator) and the `0xa112c0` log bursts (logger split) — both platform
primitives under standing decisions, so neither counts as untranslated game
logic. **The count stays 54 until the Update owner rewires Pass A** on the
frozen contract; frame-opaque cannot do it (slice not theirs). What the Update
unit must consume, by reference, never re-derived:
`9b9480_count` for id_count · `pairs_from_samples` + the v27 evolution for
Pass A · the v27 F4 recapture rule for the Pass B gate · v28 `pass_b_apply` for
Pass B · grow and log bursts as host events. The frozen capture contract is
`PASS A FROZEN CAPTURE CONTRACT (v29)` in `frame_opaque_pure_helpers.h`, pinned
by test: all reads are read-only and captured ONCE before Pass A.

**Logger ready-bit lifecycle CLOSED (log v5), plus a corrected census.**
SET has exactly 1 site (`0x00a157ad`, indirect — **zero absolute setters**),
READ 2 (`0x00a157fe`/`0x00a159a3`), CLEAR exactly 2 absolute
(`0x00a71be5` teardown, `0x00b16b51` atexit dtor). Reachable states are
S0 DOWN `(0,NULL)` (image-initial AND post-destroy), S1 LIVE `(1,p)`, and
S2 FAILED `(1,NULL)` = D-LOG-6; **`(0, non-NULL)` is proven unreachable**.
Destroy-then-lock DOES reach the NULL fault — the assert arm is not an early
return, it falls through — so D-LOG-6 and destroy differ only in the
diagnostic: D-LOG-6 leaves the bit set and DISARMS the assert, destroy clears
it and RE-ARMS it.

**v4's "`0x00a15730` has zero references" was WRONG** and is corrected here: it
has **10 `E9` tail entries** (8 frame funclets, 2 absolute thunks for statics
`0x00c57b2c`/`0x00c5ab20`). v4 enumerated direct calls and raw dwords only and
structurally could not see the `jmp` channel — rule 10 again. It is live
unwind/static-destruction code.

Two more defects pinned: **D-LOG-9** — destroy deletes AND frees the critical
section *before* clearing the ready bit, so for 6 instructions the holder
advertises ready=1 with a dangling pointer and a concurrent lock passes the
assert into a freed CS (correct order would be clear-then-free). **D-LOG-10** —
the two destroy sites disagree about the vptr: the teardown leaves
`0x00b81c0c` (a later virtual lock still reaches the real body), the atexit
destructor stores base vtable `0x00ba04b4` whose `+0xc`/`+0x10` are both
`_purecall`. Neither is reachable on the shipped path.

**Contract hazard, documented not silently changed:** v4's
`isaac_log_lock_null_critsec_reached` is scoped to D-LOG-6 (it also requires the
ready bit) and therefore returns 0 for the post-destroy S0 state even though the
machine dereferences anyway. v5 left it alone and added
`isaac_log_lock_null_deref_reached` for the unconditional control-flow fact,
pinning both where they agree and the one state where they diverge.

**Handoff to the Update-slice owner (frame-effect v8).** Of `0x006fd7c0`'s
three boundary records, **record 21's residual is a provable no-op** whenever
`needs_705ee0` is false AND `blue_room_eligible` is false. Both are already
pure exports (frame-effect v2/v7) — the Update side simply is not consuming
them to drop the event. Record 20 stays host (`FUN_00956780` id remap over a
global counter + `SFXManager::Play`); record 21's other arm keeps
`FUN_00705ee0` (rewind snapshot) + `Level::TryInitializeBlueRoom`.

Two corrections from that unit worth carrying: v7's `shell_plan` asserted
`hostEngine`/`applyTerminals` **unconditionally**, but on the anim-0xc edge
neither runs — `0x006fd8d2 test ecx,ecx / je 0x006fdbec` lands PAST the log
call at `0x006fdbe4`, so nothing is even logged. And the SFXManager receiver
base is the global at **`0x00c7169c`**, NOT g_Game at `0x00c71678` — the same
body reads g_Game four other times, so the two are pinned separately and must
never be merged.

**Three recorded census facts about `0x0082ee40` were WRONG (room-transition
v10), each now pinned by a test.** Anyone reading the older description would
have worked from all three:
- "entity-spawn vector walk" — it is a **player** vector walk over
  `Game+0x1baa8`; its mid-loop fatal string is
  `"PlayerManager::GetPlayer() : There are no players!"`.
- "10 callees" — it is **12 call sites / 11 distinct callees**. The 11th is
  reachable ONLY through `call dword ptr [0x00b18894]`
  (`_invalid_parameter_noinfo_noreturn`, read from the import directory), which
  an `e8`-only census structurally cannot see — rule 10 again.
- "0x37c bytes" — stops at `pop ebx` and drops the 3-byte `ret 0x14`. True
  extent `0x0082ee40..0x0082f1bf` = **0x37f**.

It also found a store the family had never modelled: `0x0082efcb
mov dword [edx+0x1bb74], eax`, sitting inside the setup block so
`apply_setup`'s single struct write was never the whole block. Displacement
census bounds the claim: 10 instructions touch `+0x1bb74` and this is the only
one storing a non-zero value.

**The `0x0092e230` census was wrong on every checkable number (SFX v7).** Size
`0x56` is the offset of the FIRST `ret 4`; the body is `0xc5` / 73 instructions
and runs to a second `ret 4`. "One callee" is four call sites. The `0x00a112c0`
edge is not an assert but the shared LOGGER at level 1 ("…has no samples"), so
the standing logger split covers it. `0x0092e300` was not modelled at all — the
v1 header forbade it, which is exactly how the two siblings would have been
merged.

**Vtable channel: negative, and that IS the finding.** Neither VA appears in
`.rdata`/`.data`/`.rsrc`/`.reloc`; neither is a virtual method. The vtable
dispatch is INTERNAL, on the per-voice channel objects. The only immediates are
a script-binding registration — counted as a reach channel, never used to name
anything.

Two new narrowings beyond v60/v50: on `0x0092e230`'s LIVE arm with all channel
pointers null the body issues **zero** device calls and its entire effect is the
unconditional pure store `entry+4 = -1`; and on `0x0092e300` an **enabled,
non-empty** group whose channels are all null is a complete no-op — the v50 gate
only closes on "every group disabled or empty", so it kept that case as host.

Two divergences make merging the siblings WRONG: `0x0092e2a0` writes the
`entry+4 = -1` sentinel and `0x0092e300` never does; and `0x0092e3a2`
substitutes the wrapper's `+0x08` loop byte for the `[vtbl+0x44]` query when the
pointer goes null — a different FIELD, on a stage the sibling lacks entirely.

**"Audit F7" DOES NOT EXIST — stop propagating it.** This table defines only
F4 and F5; every `_briefs` grep hit for "F7" is a false positive on the binary's
SHA-256 (`…5DF72…`). Exit v34 closed it on substance anyway: `0x00685bc0`
(`map_lower_bound`) was re-transcribed from the instruction stream and the model
matches branch-for-branch — root `= [[map]+4]`, triple init, empty on
`cmp byte [esi+0xd],0 / jne`, `jns` → record-left/else-right, loop while
`next isnil == 0`, `ret 8`. **CLEAN, nothing outstanding.**

**`ANM2::Load` is NOT an untouched edge — this corrects the record-22 handoff.**
The Exit family already peels all three of its entry gates
(`isaac_exit_anm2_load_path_present` on the `+0x10` size,
`_path_is_self` on `cmp esi,edi`, `_graphics_needed` low-byte), the post stores
`+0x109`/`+0x10c`, the layer/sheet loop CF, and shadow-name equality — plus the
loadgraphics callee `0x0040c000` (v23) and `0x00408640` (v24). Its surviving
host content is the string/parse hosts, `0x0040e2b0`, `Manager::LoadImage
0x009588a0`, and one logger edge at `0x0040e02e`. Anyone assessing record 22's
removal must start from that, not from scratch.

Corrected count: Exit has **24** logger callsites across its 83 referenced
functions, not ~9. The standing split retires the LAST host edge in exactly two
of them; v34 closed the one that was still open.

**Cross-cutting: the logger `0x00a112c0` is the single highest-leverage target.**
It is referenced by 10 families (frame-opaque 21 sites, anm2 15, PM 12, exit 9,
hud 7, frame-effect 5, process-input 4, render-shell 2, game-render 2, pgd 1)
and is where every family's "residual host log" funnels. Per throughput rule 4
this wants a standing decision plus a small shared family — recover the pure
level-gate, declare the vsnprintf/IO tail a platform primitive, falsifier: game
logic that reads the log buffer back. One unit retires a host edge everywhere.

All 15 families are registered in `scripts/decomp/frame-path-roots.mjs`
(`ALL_PURE_HELPER_IDS`) and served by `scripts/serve.mjs`. Orchestrator-owned
(no section agent edits): `docs/*`, `AGENTS.md`, `frame-path*.mjs`,
`tests/decomp-frame-path.test.js`, `web/js/native-update-bridge.js`, all git.

## Two defects found in OUR OWN tooling (both cost real correctness)

**1. `uint8_t` helper parameters are silently wrong — measured, not theoretical.**
A helper modelling an x86 byte test must not take a `uint8_t` parameter: the
Wasm ABI does not narrow i32 args and `-O2` deletes the in-body mask as provably
redundant, so the shipped module diverges from the PE above `0xff`. One family
probed all 18 of its byte parameters against the **shipped** modules at `0x100`
and found **18 of 18 divergent, none merely shape** (a gate answering LIVE where
the PE says DISABLED; `try_pure` answering host where the PE takes the pure
no-op). Post-fix: 0 of 18. Another family confirmed nine divergent exports the
same way.

It hid for ~28 ABI versions because **the oracle was right and every Wasm-side
draw was pre-masked `& 0xff`** — the differential never presented the divergent
input. Fix shape: widen the **parameter** to `uint32_t` + explicit in-body mask
(struct **fields** stay `uint8_t`; stores truncate), add a prototype-parser guard,
drive gates with **unmasked** wide values, and add one **mask-drop mutant per
mask site** so the differential rather than the static check is what discriminates.

Re-censused **2026-08-08 with a multi-line-aware parser**, then FIXED. The
earlier census used a single-line grep whose pattern was
`uint8_t\s+\w*(raw|byte|flag|arg)` — wrong TYPE (these were `int8_t`), wrong
NAMES, and the parameters sit on separate lines. A three-way miss, which is why
they survived while the family was recorded CLEAN.

**They were a LIVE bug, not latent.** Probed against the SHIPPED v28 module with
unmasked wide values: **all four divergent at `0x100`** (8/20 probes), and three
of the four are **wrong state, not merely wrong shape**:

| param | shipped module | PE |
|---|---|---|
| `flag_4c = 0x100` | kept `*mode = 1` | clears to 0 |
| `slot_char = 0x100` | kept `*mode = 1` | clears to 0 |
| `flag_111 = 0x100` | answered HOST-required | takes the pure no-op |
| s3 `flag_4c = 0x100` | skipped the clear-both | performs it |

All four PE sites are `cmp byte ptr, 0` + `je/jne` — **low-byte zero tests**, no
`movsx`, no signed relational branch anywhere in `0x004212c0..0x004213fc`. Fixed
at frame-opaque v29: widened to `uint32_t` with explicit in-body masks,
compile-time signature pins, one mask-drop mutant per site (4/4 killed
behaviourally), and a **multi-line-aware census in the test** that also asserts
it actually SEES all ten parameters — guarding the empty-census trap.

**Remaining exposure: 2**, both `isaac_playerhud_active_book_overlay_id`
(`has_collectible_0x248`, `_0x26b`). PlayerHUD is owned by another toolchain — flagged, not fixed.

**2. `VA -> file offset` must come from the section table.** A `.text`-only
formula (`0x400 + (va - 0x401000)`) is off by **`0xE00`** for `.rdata`, and
because the bad offset still lands inside the section it returns **plausible
garbage rather than failing**. `"unknown"` was recorded as `"stage 8"`, `"%s%s"`
as `"htBegin"`. Correct table and a section-aware `fo()` are in `AGENTS.md`.
`.data`'s raw size (`0x69e00`) is far below its virtual size (`0xa4aa4`) —
addresses past the raw end are **zero at load**, not file-backed. Re-check any
constant sourced from a raw offset read of a non-`.text` address; numeric
constants cross-validated another way are unaffected.

## Standing decisions (do not re-litigate)

1. **The guest allocator is a platform primitive.** Allocator *wrappers* are game
   logic and must be translated (header layout, accounting, payload bias, free
   order — all observable). Raw `malloc`/`free`/`new`/`delete` stay host and do
   NOT count as untranslated game logic. Falsifier: game logic depending on a
   pointer *value* (ordering, hashing, serialization, address-seeded RNG) —
   report it, it refutes the decision.
2. **Reproduce original-binary defects, never correct them.** This is a
   behavioral-parity port. Pin each with a test and note it. (Known so far: a
   `malloc(3)` used as a 214M-entry buffer; an unclamped array subscript on
   `[desc+0x10]==0`; a pocket-slot clamp saturating at 3; asymmetric save-bool
   normalization dropping `0x80..0xff`; several signed/unsigned bound splits.)
3. **A green differential is necessary, not sufficient.** Eight-plus landed peels
   shipped wrong *with passing tests* because the JS oracle repeated the C++
   misreading, or a wrong assertion pinned the wrong answer.

## Defect classes to check at translation time (all have bitten this port)

- post-call value folded to a pre-call snapshot (AGENTS.md rule 5)
- recapture taken **unconditionally** where the PE recaptures on only one path
- compare strictness (`jb` vs `jbe`, `<` vs `<=`) or signedness misread
- full-word test where the PE tests a low byte (`test al,…`)
- loop bound folded once where the PE re-derives it per iteration
- NaN direction of `comiss`/`ucomiss` + `cmov`/`jcc` inverted
- constant assumed where the callee rewrites through a pointer (the `0x00956780`
  `&id` store — ~700 callsites, recurs everywhere `SFXManager::Play` is called)
- near-identical siblings merged (two RNG streams `0xc5d2a0`/`0xc5d2b0`; two angle
  multipliers one ULP apart `2f7ffffe`/`2f800000`; two gate globals) — keep separate
- straddling `mov word` stores touching two byte-fields at once

## Test/tooling traps (all cost real time; all silent)

- **Wasm scratch buffers at `0x100000` (1 MiB) and above.** Low addresses corrupt
  the module's own switch/const tables; tens-of-KB addresses sit inside
  emscripten's 64 KiB shadow stack and corrupt helper locals. Both silent — only
  table-driven / local-heavy helpers go wrong, arithmetic-only ones keep passing.
  (Earlier "32768+" advice was WRONG.)
- **`next() % n` on the shared test LCG draws from low bits, period `2^k`.** A
  measured 400-trial corpus covered 5 of 10 values. Draw from HIGH bits. Add a
  test asserting the corpus actually reaches every seeded value.
- **Mutation-check every new test** (break the translation the way the PE tempts
  you, confirm the test FAILS, revert, hash-verify byte-identical). A build-error
  catch does NOT count — re-run with the code compiling. A harness that reports
  "all survived" is misparsing output; take verdicts from exit codes. A restore
  loop that aborts mid-way leaves BOTH files mutated — hash-verify after EACH
  restore. On Windows a compiler can hold the `.cpp` open; retry the write.
- **Header-only constants are invisible to the Wasm differential.** Mutate the
  `.h` too and assert every exported constant's literal value in the header test.
- **Assert PE truth, not only C++/JS agreement** (`sub x,x` clears CF; a `dec` on
  a known-nonzero value can't wrap). Agreement catches divergence; truth catches
  both sides being wrong together.
- **Bias randomized draws to the arithmetic's real boundaries** (`0`, `1`, the
  exact overflow point, `0xffffffff`) and force exact equality pairs.

## ZHL catalog caveat

An exact signature match is necessary but NOT sufficient (a 24-byte exact match
at `0x0095b310` is disproven at its callsite; `Game::Update` misses its own
pattern). A miss does NOT mean the function is absent. Pattern length is evidence
strength (7 bytes is weak, 42 strong). Staleness is **per-function** in this
build — a match that contradicts the body is evidence against the pattern.

## How to resume

1. Reconcile the Update v51/v52 state (top of this doc).
2. Re-run the full suite at a quiescent point to re-establish real numbers —
   several sections advanced this session but were never verified as a set, and
   coverage figures reported before the LCG fix were overstated:
   `npm test` · `npm run decomp:verify-slice` · `node scripts/check-repo-safety.mjs` · `git diff --check`
3. Re-run the stale-state audit (read-only) once the in-flight fixes land — the
   prior 11 findings (`section-notes/stale-state-audit/NOTES.md`) are mostly
   routed; a fresh sweep against the corrected surface is due.
4. Model split that worked: **Fable** for hard sections (Update slice, Render
   root-slice composition, Lua structural, Room continuations, frame-opaque
   correctness, PM TriggerDeath); **Opus** for mechanical gruntwork (Exit
   residuals, ProcessInput state arms, SFX/PGD/ANM2 sibling walks). One agent per
   section, disjoint files, each self-heals its own test first.

## Honest status

Update opaque boundaries: **58 → 57** (one removed outright: `0x009bea10`;
several narrowed to pure gates). RNG recovered and game-logic complete; wire
in progress. Render section game-logic complete; root-slice ABI started. Lua
`RegisterClasses` has no untranslated control flow. Nothing outside the Update
hybrid tick is wired into the live frame loop. No FPS claim exists or is
justified. The port is far from complete — the remaining 57 boundaries are the
hard core that was already hard before this session.

## 2026-08-23 recovery session — what broke, what was fixed, exact next frontier

**Symptom:** `npm test` never completed; 9 of the 36 suites either hung
indefinitely or exceeded any patience budget. The previous session's final
wave (family ABI bumps anm2 46→77 and friends) was landed WITHOUT a single
completing verification run — `_runv84.cmd`/`_runsuite.cmd` at repo root date
from that fight and their output files are empty.

**Root-cause class 1 — poisoned mutant sources (the big one).** Mutation
round-trip tests rewrite the family `.cpp` with a mutant, rebuild, assert the
pins fire, then restore. Every suite run killed mid-round-trip (box
degradation kills, coordinator kill sweeps, harness caps) left the MUTANT on
disk permanently. Confirmed poisoned sites repaired this session:
- `anm2_pure_helpers.cpp` tree_next `_Isnil` polarity (`== 0u` where the M1
  anchor + PE `je` require `!= 0u`) — this one made the WASM WALK CYCLE
  through low static data: the deterministic stall behind "anm2 hangs".
- 20 further anm2 sites restored programmatically from their own test anchors
  (seed%count, NULL_FRAME_COUNT, takes_b, both XML CALL_VAs, eq==0, b_cap,
  latch normalize, layer_owners swap, gate==0, delete_size, cur<=end_hi+1,
  IDENTITY byte_off, GLOBAL_BASE_DELTA, ALIGN_MASK, req_hi carry, splice nla,
  splice_r node==parent, XML semi/invalid-cp/missing-eq).
- `log_pure_helpers.cpp` FILE* gate shipped byte-narrowed where its own pin
  says full-dword.
- `game_state_pure_helpers.cpp` adjacency `!= 2u` vs header pin `cmp ecx,1`.
- `playerhud_post_update_pure_helpers.cpp` needed-gate `(int32_t)x > 0` vs
  full-dword citation.
- `render_shell_pure_helpers.cpp` ×4: next_cap clamp off-by-one (+1u),
  a156e0 flags_clear 0xfe instead of 0xfffffffe, a159a0 gate missing bit-0
  mask, a1a600 truncation_word 0xff instead of WORD_MASK.
- `hud_post_update_pure_helpers.cpp` ×4 incl. two found by the residual
  builder (7716c0 id 0x28-vs-0x29; 771620 slot-scan/list-word reorder).
- `game_render_slice.cpp`: a102e0_16 lroomNextVa self-reference instead of
  _17 (v34 comment + host_arg0 already said _17); a102e0_12 y missing the
  xorps/addss `+ 0.0f`.

**Root-cause class 2 — v87 attrs unit was never runnable as designed.**
The value-class scan hardcodes PE VAs 0xb1ab60/0xb1ac60, which sit below
poke()'s scratch floor and beyond the JS shadow array — the oracle read
`undefined` and spun forever. Fix: tests seed synthesized terminator tables
at the real VAs directly into wasm linear memory and hand the oracle an
extended view (`seedXmlClassTables()`/`xmlOracleMem()` in the test). Plus two
genuine v87 defects fixed against the dump
(`section-notes/cpu-dump/004165a0.txt`): report-only helper re-read [slot]
instead of reusing ecx after the machine's 0x004165ee store, and prologue
pre-loaded missing_eq_va before the name gate (gate-fail must stay 0).

**Suite status after repair (solo, --test-concurrency=1):** lua PASS 286/286 ·
room PASS 121/121 · log PASS 179/179 · game-state PASS 83/83 · playerhud PASS
103/103 · game-render PASS 95/95 · render-shell PASS 142/142 · hud-post PASS
140/140 · **anm2 completes in ~17 min but is 249/334 — see next frontier**.
Slice+pipeline 838/838 · verify-slice PASS (5321 cases, ABI 99) ·
check-repo-safety PASS · git diff --check clean.

**NEXT FRONTIER — anm2 tail band, 85 failing tests, v12..v99 units that were
landed blind.** Failing inventory lives in `_anm2_final3.log`. Known clusters:
(a) walk-apply/anim-apply band: applyVa arm selection diverges
    (wasm 0x4089d0 vs oracle 0x408b10 for flag=0x100) — needs the
    0x00408xxx dump-range adjudication like v87 got;
(b) SSO trampoline fixed edges v12/v15 (v13/v14 siblings pass — compare
    against the passing sibling's law);
(c) assorted stale mutant anchors ("mutant did not apply") — same repair as
    above: update replace-string to current source, never delete checks;
(d) one WRONG PIN already flipped WITH evidence: v87 loopAgain 0→1
    (cpu-dump 004165a0.txt lines 0x00416756 cmp/jne 0x4165c8).
Method that works (used for tree_next + v87): standalone private-build probe
(`em++` the cpp directly, replicate the world, bisect wasm-call vs oracle-call
with stderr markers), then fix source to its own citations.

**Process guards learned (expensive way):**
- NEVER `taskkill /IM node.exe` globally — it orphans nothing but kills every
  running suite mid-mutation, which is WHAT POISONS THE SOURCES. Kill exact
  PIDs only.
- node:test buffers ALL reporter output on redirected stdout; a killed run
  loses everything. Liveness = child-process CPU + em++ grandchild spawns,
  never log tails.
- A suite that "hangs" may be a wasm export looping on a poisoned module
  built seconds earlier by its own mutation test. The per-load progress probe
  (appendFileSync in loadExports printing Error().stack frame 2) finds the
  stall site in one run.

## Outcome (2026-08-23, post-repair integration)
- anm2 pure-helpers family repaired to GREEN: full-file run 334/334, fail=0 (~8.5 min solo). Clusters adjudicated against cpu-dump evidence with per-cluster root causes (walk/apply arm selector low-byte fix per 0x0040a661/0x0040a666; v12/v25 SSO target arms; 12 stale mutant anchors re-anchored; several poisoned-source restores; count-offset and gate-width corrections). Only files touched: native/decomp/anm2_pure_helpers.cpp + tests/decomp-anm2-pure-helpers.test.js.
- Exit family advanced: EXIT_PURE_ABI_VERSION 47->48; 0x0040d040 reconciled as ALREADY FROZEN in alloc family (v3 AL) — consumed by reference, census pinned EXIT_TIDY_REACH_* = 1288/33/0/1321, new exports isaac_exit_tidy_* with mutation-proven pins. Suite 32/32.
- Evidence packs for future units: output/decomp/5129df723e64/section-notes/anm2-recovery-evidence/ (pack-a applyVa law: byte-compare @0x0040a661 selects {0x408830, 0x408970}; 0x4089d0/0x408b10 are internal addresses of FUN_00408970 with zero inbound refs; pack-b four identical 23-byte SSO trampolines + structural diffs).
- POST-REPAIR INTEGRATION BATTERY: node --test --test-concurrency=2 tests/*.test.js (all 36 files) = 3806/3806 pass, fail=0, ~35 min. Baseline EXCLUDED-ANM2 caveat superseded. Report: _battery_report.md.

### Boundary-clearing campaign waves v129–v131 (same day)
- Wave v129: idx20 frame-effect shell + idx44 heartbeat arming-identity REMOVED (31→29 opaque).
- Wave v130: idx36 WaterB16 narrowed — coarse retired on full-carry conjunction (blob live AND gate open AND neither spawn-walk arm); removal blocked on missing spawn-walk capture contract.
- Wave v131: idx30 AwardsGreed REMOVED (29→28) via NEW greed-probe capture contract (voucher @15504, element-major rows cap 8 stride 28, events 1056→1076) consuming Room ABI-81 frozen greed-probe/fire laws by reference.
- Verified each wave: slice suite fail=0 (now 835 tests), differential 5339 cases PASS, live-frame guard PASS, wasm rebuilt clean.
- Remaining 28 records: idx26/27 need multi-lane capture contracts over frozen audio/music tail plans (dynamic iteration loops); idx28 shares the 0x7fb250 spawner; idx29 narrows conditionally (head plan frozen, ~16 helper inputs lack capture rows, spawn-loop stays host by design); idx43/48/7 declined with documented blockers; menu gates reachable-every-frame HOST-RESIDUAL.
- Repeatable recipe established: evidence scout → capture-contract design → integrator consumption → theorem arms + mutation checks → ledger count pins.

### Depoison incident + standing prevention rule (same day)
- Post-v131 integration capture went RED (375/285/580 nondeterministic fails): forensic proof that THREE family sources carried stranded mutants/torn writes from CONCURRENT suite runs (an orphaned npm-test attempt overlapped its retry; both executed mutation round-trips on the same cpp files; restores are byte-exact to already-poisoned before-images so poison self-perpetuates).
- Repaired: anm2 (~15 sites incl. commented-out live store, swapped v82/v83 splice reads, VA swaps), log (5 anchor-verified sites), room (~1500 torn lines reconstructed from model laws/header structs/test FROM anchors + pre-tear snapshot .snapshots/2026-08-23T02-29-01Z adopted and itself repaired).
- Mechanical cleanliness proof: all 510 replace(FROM,TO) anchors across the three test files confirmed present verbatim in their cpps (anm2 220/220, log 98/98, room 192/192); clang -fsyntax-only -Werror sweep 19/19 family sources CLEAN; suites re-run SOLO green (anm2 334/334, log 179/179, room 132/132).
- STANDING RULE (violations cost hours, three incidents documented): NEVER run two instances of the same mutation-testing suite concurrently; NEVER run any test suite while another suite may be inside a mutation round-trip window (its source file is briefly a deliberate mutant); treat any suite failure spike as possible tree poison FIRST — clang-sweep the cpps before debugging tests.

### Depoison pass 2 + final battery v3 (same day)
- Pass 2 covered the two families pass 1 missed: playerhud_post_update_pure_helpers.cpp (16 sites incl. field-offset drift, signed-gate mutant, xorps sign-flip drop, hearts twin slot swap) and render_shell_pure_helpers.cpp (6 sites incl. A19CA0 VA-drift, src_off 0x08-vs-0x04, lerp operand swap, gate mask bit-drift, med3 negation). Mechanical anchor scanner now reports 100% FROM-present on both files. Suites solo green: playerhud 103/103, render-shell 142/142.
- Root cause of re-poisoning: concurrent suite executions overlapping mutation round-trip windows (standing rule violated by orchestration itself). Rule enforced thereafter: single test-runner instance at a time.
- FINAL BATTERY V3: steps 1/2/4/5 GREEN — slice+pipeline 842/842 pass 0 fail (~30 s); verify-game-update-slice DIFFERENTIAL PASSED 5344 cases ABI 99 + live-frame guard PASS 23/23 host kinds, events 1100/1100 B (~145 s); repo-safety pass (5827 tracked paths, 6.7 s); git diff --check clean exit 0. Step 3 REGRESSION — full suite (36 files, concurrency 2) = tests 3821 / pass 3790 / fail 31 / cancelled 0 / skipped 0, ~26 min. Failing families: anm2 v55 copyctor (3), frame-effect v37 mutants (1), game-render slice a102e0 continuationKind chain (3), game-state v14/v16/v18/v19 differentials+mutants (9), hud-post-update v21/v22/v25–v27/v32/v35 differentials+round-trips (15) — the last being exactly the sites pass 2 repaired. Fingerprint identical to both prior poison incidents (wasm≠JS oracle AND "mutant did not apply"/"mutant survived" anchors dead): deterministic source/binary poison across five family cpps, NOT flaky, NOT a test bug; per standing rule treat as tree poison FIRST (clang-sweep cpps + anchor scan before debugging tests). Full failing-test list with first assertion messages: _battery_report.md "FINAL BATTERY V3". Sources untouched by the battery run.
### Depoison pass 3 + final battery v4 (same day)
- Pass 3 swept the five families that went red post-v131 and repaired 17 stranded mutants total: anm2 ×2 (v55 copyctor owner-offset; one interruption leftover caught by split-count assertion), frame-effect ×1 (v37 signed bounds), game-render ×1 (twelfth-pack emit drift), game-state ×5 (v14 zero-arm, v16 magic-offset slip, v18 dropped js gate + low-byte fold, v19 off-by-one), hud-post ×8 (signedness trio 770a7e/557b00/770c3e, tree_empty head compare, visit gate polarity, ID mask 7716c6, test-al low byte 761444, gate_1f84 full-dword restore).
- Root-cause verdict: all 31 prior failures were stranded mutants — NOT wasm collisions or stale builds. Method caveat recorded: naive replace-anchor scans miss multi-occurrence laws and cancellation leftovers; rescan sources after ANY cancelled suite run.
- FINAL BATTERY V4: steps 1–5 ALL GREEN — slice+pipeline 842/842 pass 0 fail (~2 s); verify-game-update-slice DIFFERENTIAL PASSED 5344 cases ABI 99 + live-frame guard PASS 23/23 host kinds, events 1100/1100 B (~144 s); full suite (36 files, concurrency 2) = tests 3821 / pass 3821 / fail 0 / cancelled 0 / skipped 0 (~27.5 min); repo-safety pass (5827 tracked paths, ~6 s); git diff --check clean exit 0.

### Campaign waves v133–v135 + v49 fix closeout
- Wave v133: idx26/27 narrowed to typed-spawn-carrier records — TcaTailRow ×8 capture lanes @16780..17536 consuming frozen ABI-81 audio tail plans by reference; events→1108; runtime +760.
- Wave v134: awards head capture-live — awardsHeadReady voucher @17540 + 27×u32 src pack + eight roomAwardsHead carriers; idx29 six exits retire, SPAWN_LOOP stays typed-host.
- Wave v135: idx28 AwardsNonGreed RESOLVED (28→27 opaque / 24 resolved) via contracts-deep-music tcaDmGateReady voucher @17652 + fire carrier @1140; PE corrections pinned (probe 0x009e9b50; vec pair is Manager-base).
- v49 fix: anm2 event-trigger SSO select restored to PE `jb` unsigned strict below (cap < 0x10 → inline) — transcription slip from an earlier depoison pass; M2 anchor applies again; suite solo 334/334.
- Standing rule reminder honored throughout: single test-runner instance; no global kills.

### Room ABI v83 spawn-loop translation verified (same day)
- 0x007fb250 SPAWN-LOOP continuation 0x7fb7be..0x7fe087 translated into Room-family pure helpers (ROOM_PURE_ABI_VERSION 82→83): pos walk 0x813520 / rng 0x7e90f0 / entity create 0x428b20 (v54 law callee) / gates 0x812c90+0x822820 / re-dispatch 0x6ee340 landed as laws/typed carriers; 63 fixed-edge assertions + differential + mutation-checked pins.
- This was idx29's never-retiring exit blocker: with the continuation frozen, idx29's consumption wave can convert its SPAWN_LOOP arm from standing typed-host to captured rows.
- Suite verify: room solo `node --test --test-concurrency=1 tests/decomp-room-pure-helpers.test.js` GREEN — tests 138 / pass 138 / fail 0 / skipped 0 (~9.4 min; v83 7fb250 head-plan fixed edges + LCG differential + mutation checks green, alongside newly landed v84/v85 groups). Full-tree battery V5B all green: slice+pipeline 847/847, verify-game-update-slice DIFFERENTIAL PASSED 5364 cases ABI 99 + live-frame guard 23/23 (events 1148/1148 B), full suite 3835/3835 pass 0 fail across all 36 files (~32.3 min), repo-safety clean, git diff --check clean.

### Boundary-clearing waves v136–v139 (same day)
- Wave v136: idx26 roomTriggerClearAudioNonGreed RESOLVED (27→26 opaque) — ABI-67 head gates/fail chain wired in-module (40-row tca40HeadPack @17696..17852 consuming frozen isaac_room_trigger_clear_audio_7f7a40_gates/fail laws by reference); predecessor regressions found and fixed on arrival (missing v135 deep-music block in cpp; awards_tail edge; model dup keys).
- Wave v137: idx27 head pack landed (39 rows @17856..18012); stays NARROWED — ALT spawn tail had no capture lanes.
- Wave v138: contracts-b16-spawn Option A consumed (+1044 B rows @18392..? per landed base correction; events→1100) — idx36 spawn-walk narrowing; three incidents caught by differential/static asserts (model mask always-true, missing greed_probe_elem_count, ledger splices).
- Wave v139: idx13/idx35 narrowed via b1_rain_rows[64]×14-word blob (@18392..21999; events→1172) — seven falsifiers mutation-checked red.
- Evidence bank additions: b16-leaves (leaf 0x714610 = ZERO calls, pure guest-modelable memory math — blockers are input carriers not host ops; thunk = VCRUNTIME140!__RTDynamicCast GridEntity→GridEntity_Pit), b3b7-leaves (31 leaf bodies behind the five dispatches; RTTI-anchored vtable discovery: Entity base 0xB6730C, GridEntity base 0xB686E8; 5710 insns / 183 guest stores enumerated), contracts-deep-music (consumed as v135).
- FINAL VERIFIED STATE: slice+pipeline 851/851 · differential 5373 cases PASS · live-frame guard 23/23 · full tree 3854/3854 fail 0 · repo-safety clean · diff-check clean. Ledger: 25 opaque / 26 resolved.

### Boundary-clearing waves v136–v137 (same day)
- Wave v136: idx26 roomTriggerClearAudioNonGreed RESOLVED (27→26 opaque / 24→25 resolved) — ABI-67 head gates/fail chain wired in-module: 40-row tca40HeadPack @17696..17852 (voucher + RanBits bitmap + gate/seam rows + packed-RAN host-result rows + fail-chain rows consuming frozen isaac_room_trigger_clear_audio_7f7a40_gates/fail laws BY REFERENCE); predecessor regressions found and fixed on arrival (cpp missing the entire v135 deep-music block; awards_tail edge guarded wrong; model dup keys; stale v133 coarse assertion).
- Wave v137: idx27 head pack landed (voucher tca83B0HeadPackReady @17856 + 39 rows @17860..18012 covering windows A/C/D/E/F); stays NARROWED — ALT spawn tail capture lanes designed (see §6 companion + §8 consumption plan in contracts-audio-head-83b0/NOTES.md), implementation pending.
- Verification per wave: slice suite fail=0 (now 847 tests), verifier DIFFERENTIAL PASSED 5364 cases ABI 99, live-frame guard 23/23, events 1148/1148 B.
- Integrator also repaired four predecessor regressions found on arrival and improved verifier differential diagnostics permanently (exact layout-key diffs instead of JSON blob).

### Campaign closeout — depoison pass 3, waves v140–v142, idx29+idx28 resolved
- Depoison pass 3 swept the five families that went red and repaired 17 stranded mutants (anm2 ×2 incl. an interruption leftover caught by split-count assertion; frame-effect signed-bounds; game-render twelfth-pack emit drift; game-state ×5; hud-post ×8 signedness/gate/polarity sites). Root-cause verdict: all failures were stranded mutants, NOT wasm collisions.
- Wave v140: idx29 SPAWN_LOOP consumption landed (route-split retirement matrix, capture rows runtime→22572/events→1204); ten theorem arms M-A..M-J mutation-proven.
- Wave v141: three blocking probe laws frozen in Room family (0x9b92c0 vector-at with OOB defect pinned; 0x7cb6e0 count resolver; 0x7c3980 six-counter roll) then consumed BY REFERENCE — idx28 AwardsNonGreed RESOLVED (25→24 opaque / 26→27 resolved), and the v140 "indirect vtable leaf @0x7fbabf" blocker PROVEN A MISDECODE (fresh span dump: zero indirect calls in window).
- FINAL BATTERY V142 (exclusive capture): slice+pipeline 853/853 · differential verifier 5385 cases PASS ABI 99 · live-frame guard 23/23 · events 1244/1244 B · full tree 3861/3861 pass 0 fail across all 36 files · repo-safety clean · diff-check clean.
- Remaining 24 opaque records all carry documented permanent blockers (entity-create typed-host class, virtual dispatch surfaces, lua_pcallk mod bytecode, TriggerDeath mid-walk mutation, unbounded string content, engine-global band) or are new translation-unit sized jobs (B3B7 grid Update bodies ×15 enumerated with insns in b3b7-leaves evidence bank).

### Campaign verified complete — FINAL BATTERY V7 all green (same day, late)
- **FINAL BATTERY V7: 5/5 GREEN — 3868/3868 pass / fail 0 across all 36 files.** First simultaneous all-green since the prior session's unverified wave broke things.
- Post-v135 waves v136–v139 landed: idx26 RESOLVED (head gates/fail chain), idx27 head pack + ALT lanes consumed, idx13/35 narrowed via b1_rain_rows[64]×14-word blob, idx4 rt_band_pop carrier implemented.
- Depoison pass 2 fixed playerhud ×16 sites + render-shell ×6 sites; pass 3 fixed anm2 ×2 + frame-effect ×1 + game-render ×1 + game-state ×5 + hud-post ×8. Mechanical anchor scanner confirmed 100% FROM-present post-repair.
- v49 SSO select transcription slip fixed (cap <= → cap < per PE jb); eax_closed mask restored (& 0xffffff00u); M3 anchor now genuinely applies.
- Evidence bank: b16-leaves (leaf 0x714610 = zero calls, pure memory math), b3b7-leaves (31 leaf bodies, RTTI-anchored vtable discovery: Entity base 0xB6730C, GridEntity base 0xB686E8), lane-w-leaves (GridEntity_Pit flood-swap + FallIn snap), contracts-audio-head + contracts-audio-head-83b0 + contracts-b16-spawn + contracts-deep-music + contracts-awards + contracts-b1-rain + contracts-idx4-engine-band design docs.
- Room ABI v82→83→85 progression: music bodies + ALT tail + spawn-loop + probes + small GridEntity Update batch all frozen as laws with differentials and mutation proofs.
