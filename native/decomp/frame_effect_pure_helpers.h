#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from FrameEffect_6fd7c0 (VA 0x006fd7c0), the
   address-stable room-transition host used from Game::Update effect-expire
   and B12 type-0x10 subtype-3 clear. These are freestanding translations of
   pure predicates / rewrites / terminal stores only — not a full body port.

   ABI v22 wires P4 terminals into Update residual resumes:
   opaqueCall006fd7c0 host residual excludes pure terminals; after recapture,
   resume_room_transition_effect / resume_room_clear_nested apply P4 when
   timedTransitionCleanupMode != 4 (mode-4 SFX early has no engine/P4).
   Do not re-apply if the host still runs a full CALL that includes P4.

   Helpers ABI v2 re-derives the whole body from PE `.text`
   (0x006fd7c0…0x006fdbfd, thiscall, `ret 0x14`) and adds: the ordered
   validation classifier plus its fatal-string selection, the mode-4 SFX
   immediates, the anim-0xc special gate and its greed `lea` rewrite
   arithmetic, the player branch, the player-path room-type classifier at
   0x006fdad2, the camera-distance float island at 0x006fd960, the exact
   `cmovne` blue-room store, the recovered argument order for the room
   transition engine, and combined entry / null-player shell plans.

   Argument recovery (thiscall, `this` = Game in ecx):
     [ebp+8]    room index   (ebx)
     [ebp+0xc]  arg2         (forwarded to blue-room probe and the engine)
     [ebp+0x10] anim         (edi)
     [ebp+0x14] player       (0 at every current Update call site)
     [ebp+0x18] dimension    (esi)

   Boundary note: FUN_0082ee40 (the room-transition engine) is owned by
   `room_transition_engine_pure_helpers.*`. These helpers stop at its call
   site and only describe the receiver offset and argument order. */

/* Helpers ABI v3 peels the nested stage host FUN_006fdc10
   (0x006fdc10…0x006fe2de, thiscall `ret 0xc`, args
   [ebp+8] flag byte / [ebp+0xc] kind / [ebp+0x10] player-or-0; the shell
   calls it as (0, 6, 0)). It carries its own SEH frame: the exception path
   stays host, the body does not. Its fatal string is
   "Invalid animation passed to Game::StartStageTransition()", but there is
   no exact ZHL match, so the address-stable name is kept and
   `StartStageTransition` is NOT promoted. */

/* Helpers ABI v5 peels FUN_006fe2f0 (0x006fe2f0…0x006fe3bf, thiscall
   `ret 8`, args [ebp+8] / [ebp+0xc] forwarded to the room change), the
*   sibling immediately after FUN_006fdc10. Receiver is the same object whose
   +0x1baa8/+0x1baac hold the player-vector bounds and +0x18300 the room
   pointer (the tail re-reads +0x18300 through the global at 0x00c71678).

   Helpers ABI v19 recensuses FUN_006fdc10 (linear decode, 467 insns +
   13 int3 padding, first_ret 0x006fe2de `ret 0xc`, 31 E8 + 1 indirect
   0xb18894) and pins every v3 export behaviourally for the first time.
   The old Ghidra decompile was truncated by a FALSE noreturn on 0x00a112c0
   after the "[Frame %d] Starting stage transition" log — the machine
   returns from it and continues at 0x006fdd7b. Five model-oracle drifts
   were repaired (mask_bit complement, stage_bump add-vs-bump,
   slot_addr_clamped negative-count guard, entry_plan host705ee0 = kind!=5,
   partner_blocks id==0 vs id==-1). New islands: kind_needs_705ee0 (the
   0x00705ee0(-1) gate), stage_record_field_off / stage_record_needs_key
   (+0x238 vs +0x240 existing-field select), registry_slot_addr (+0x1d4,
   consumes registry_has_slot by reference), prize_entry_bump_gate
   (byte+0xd / dword+0x10 / base 0x1bbd8 / counter 0x269c4),
   string_data_ptr (SSO select at 0x006fdcdc, cap field +0x14).

   Body, read from the instruction stream:

     count0 = ([this+0x1baac] - [this+0x1baa8]) sar 2   ; SIGNED shift
     if (count0 == 0) goto tail            ; test/je — zero only; a NEGATIVE
                                           ;   count ENTERS the walk
     i = 0
     loop:
       head = (end - begin) sar 2          ; RE-DERIVED from the registers
       if (head == 0) {                    ;   re-read after every call
         log 0x00a112c0(0x10, 0x00b7e6bc)  ; level 0x10 — NOT the fatal 8
         re-read end / begin               ; same memory; nothing changed
       }                                   ; [statically dead: see below]
       slot = (i <u (end - begin) sar 2) ? begin + i*4
                                          : begin       ; jae SKIPS the lea —
                                           ; ORIGINAL DEFECT: out-of-range
                                           ; index addresses element 0
       FUN_007a6680(*slot, 0)              ; host, per player
       re-read end / begin; ++i
       if (i <u (end - begin) sar 2) goto loop  ; UNSIGNED jb over the
                                                ; SIGNED sar count
     tail:
       FUN_0073fc80(this, [ebp+8], [ebp+0xc])   ; exact Level::ChangeRoom
       FUN_00802980([this+0x18300])
       Isaac::genrand_int32()              ; 0x006eef60 — ONE MT19937 draw,
                                           ;   stream advances before 7ebe20
       r = FUN_007ebe20(ecx=[room+8], edx=[room+4], push [room+0x1bb0])
                                           ; caller cleans the stack arg
       [this+0x1ad90] = (r == -1) ? 0 : r  ; cmp/jne/mov — pure normalize

   The head empty-log is STATICALLY DEAD on every reachable path: the
   prologue guarantees a nonzero count on iteration one, and the loop-end
   check re-derives the count from the same re-read registers the head uses,
   so entering the head implies the previous check saw the same nonzero
   value. The branch is still translated as the machine has it, and a test
   pins the invariant instead of deleting the arm. When the vector empties
   AT the head anyway (synthetic state), the machine still dereferences the
   base pointer and calls FUN_007a6680 once — the same defect family as the
   slot clamp.

   ZHL collision recorded, NOT promoted: 0x007a6680 matches a 12-byte
   pattern for `Entity_Player::SpawnSaturnusTears()` declared with NO
   arguments, but this call site pushes one argument, does not clean the
   stack afterwards (so the callee is `ret 4`), and the callee reads
   `byte ptr [ebp+8]` in its prologue — the declaration is contradicted at
   this build's call site, so the address-stable name is kept.
   0x0073fc80 IS promoted in comments only: exact 44-byte
   `Level::ChangeRoom(int targetRoomIDX, int dimension)`, argument order
   confirmed by the push sequence and the `ret 8` of this wrapper.
   0x006eef60 is the recovered MT19937 (Room owns the capture contract);
   here it stays a host boundary whose only modelled property is that
   exactly one draw advances the stream before FUN_007ebe20 runs.
   0x00802980 / 0x007ebe20 have no ZHL match and stay address-stable;
   0x007ebe20 uses a custom convention (ecx / edx registers plus one
   caller-cleaned stack argument). */

/* Helpers ABI v6 peels FUN_0085afb0 (0x0085afb0…0x0085b031, plain `ret` —
   the CALLER cleans two stack args with `add esp,8`), the small
   stage-record key builder called once from FUN_006fdc10 @ 0x006fdccd.
   Custom convention: ecx = out string object, edx = the integer formatted
   into the key, [ebp+8] pushed and NEVER read, [ebp+0xc] = selector.

   Body, read from the instruction stream:

     if (selector <=u 3)                    ; cmp eax,3; ja skip — UNSIGNED
       sprintf-like 0x0041e420(0x00c7f490, 0x20, fmt[selector], edx)
                                            ; cdecl, add esp,0x10
     out[+0] = 0 (dword) ; out[+0x10] = 0 ; out[+0x14] = 0xf ;
     byte out[+0] = 0                       ; fresh SSO string init
     len = inline strlen(0x00c7f490)
     FUN_0040ccd0(out, 0x00c7f490, len)     ; the frame-opaque-v20-modelled
                                            ;   assign(ptr,len)
     return out (eax)

   The jump table at 0x0085b034 CROSSES the textual arm order — reading the
   arms top-to-bottom would swap cases 1 and 2. Table-verified mapping:
     case 0 → 0x00b6e844 "%d_scores_solo_R+"
     case 1 → 0x00b6e81c "%d_times_solo_R+"
     case 2 → 0x00b6e858 "%d_scores_coop_R+"
     case 3 → 0x00b6e830 "%d_times_coop_R+"
   A selector above 3 skips the sprintf but the assign STILL reads the
   global buffer, so the out string receives whatever 0x00c7f490 currently
   holds (initially empty — the buffer is BSS). Reproduced, not corrected.
   identify 0x0085afb0 / 0x0041e420 → none, both address-stable; the
   sprintf-like and the raw side of the assign stay host. */

/* Helpers ABI v7 peels FUN_006fe3d0 (0x006fe3d0...0x006fe40b, thiscall
   `ret 0xc`, args [ebp+8] bool / [ebp+0xc] int seed / [ebp+0x10] player).
   EXACT ZHL: 15-byte pattern for
   `Game::MoveToRandomRoom(bool iAmErrorRoom, int Seed, Entity_Player*)`,
   and every one of the five call sites (0x5b3e6b, 0x7781d1, 0x778289,
   0x7b5f5e, 0x7c53bc) loads ecx = Game from 0x00c71678 and pushes
   (bool byte, seed, player) in that order. The source-level name is
   PROMOTED for comments; the exported symbols keep the address-stable
   6fe3d0 prefix.

  Body, read from the instruction stream (0x006fe3d0...0x006fe409):

    eax = [0x00c71678]                    ; g_Game read (mov eax,[imm])
    [eax + 0x18318] = -1                  ; dword store BEFORE the pack call;
                                          ;   Game+0x18318 is the Update slice's
                                          ;   room_transition_marker_18318
    pack = 0x00740860(ecx = this,         ; host, thiscall, ret 8
                      arg0 = [ebp+8],
                      arg1 = [ebp+0xc])
    0x006fd7c0(ecx = this,                ; the frame-effect shell, ret 0x14
               room  = pack,              ; result of the host pack
               arg2  = -1,                ; push -1  (0x006fe3dd)
               anim  = 3,                 ; push 3   (0x006fe3ee)
               player= [ebp+0x10],        ; forwarded (0x006fe3df)
               dim   = -1)                ; push -1  (0x006fe3f0)
    ret 0xc

  The stack contract is exact: six dwords are pushed before the pack call;
  0x00740860's `ret 8` consumes the two forwarded caller args, `push eax`
  adds the pack result as the shell's FIRST argument, and the shell's
  `ret 0x14` consumes the remaining five. The seven pushed dwords balance
  exactly against ret 8 + ret 0x14, so the epilogue's `pop esi` restores
  the real saved register.

  ZHL collision recorded, NOT promoted: 0x00740860 matches a 46-byte
  pattern for `Level::GetRandomRoomIndex(bool IAmErrorRoom, unsigned int
  Seed)`, but its only call site in this build passes ecx = Game and its
  body reads Game-shaped offsets (+0x18300 room pointer, +0x1830c
  transition mode) and calls the exact `Game::GetRoomDescriptorsOffsets-
  ArrayForDimension(-1)` (0x0060d010) on the same receiver. The declared
  class is contradicted at this build's call site, so the address-stable
  name is kept and only the exact-`Game` callee inside is named in
  comments. The RNG mixing inside 0x00740860 uses shift constants 2 / 15
  / 25 (data at 0x00b1f588 = (2, 15) and 0x00b1f590 = 25) and logs
  "RNG Seed is zero!\n" (0x00b6bf54) at level 0x10 when the seed is 0.
  All of that stays host; only the byte gate on arg0 and the arg
  formation are modelled here. */

/* Helpers ABI v8 translates the two regions of FrameEffect_6fd7c0 that no
   earlier version modelled at all, both re-read linearly from the
   instruction stream (330 instructions, 0x006fd7c0…0x006fdbfd plus int3
   padding to 0x006fdc10; capstone 5.0.7 CS_MODE_32, 0 resyncs from the
   function start).

   (A) The anim-0xc special TAIL at 0x006fd8c1…0x006fd8ef. Through v7 the
   shell plan asserted `host_engine = 1` and `apply_terminals = 1`
   unconditionally. That is WRONG for this edge: when the five-condition
   anim-0xc gate opens and Game::IsGreedMode is FALSE the machine calls the
   nested stage host (0, 6, 0) and then LEAVES — either a plain return when
   the player argument is null (0x006fd8d2 test ecx,ecx; je 0x006fdbec,
   which lands PAST the log call at 0x006fdbe4, so nothing is logged), or a
   "TeleportUp" host call plus the shared SFX epilogue, which also returns.
   Neither sub-branch reaches FUN_0082ee40, the P4 terminals, FUN_00705ee0
   or the blue-room probe. Only the greed-TRUE edge continues into the body
   (lea ebx,[edi-0xe]; lea edi,[ebx+5]; jmp 0x006fd8f5).

   (B) The player-present POSITION SEARCH at 0x006fd912…0x006fdacf: a
   bounded 50-attempt loop that asks the room for a candidate position,
   rejects it on a camera-distance test, builds a capsule around it, queries
   the entities inside that capsule, and accepts the candidate only when no
   entity in the capsule blocks it. Live code: of the 44 direct rel32
   callsites of 0x006fd7c0, 36 pass a player argument that is not the
   literal 0, so this branch is NOT dead (the three Update-slice records and
   the frame-opaque 0x004213c2 interior all pass 0 and take the null-player
   shell instead).

   Machine facts this translation is built to keep exactly:

     * The ORIGINAL player position is snapshotted ONCE, before the loop
       (0x006fd934/0x006fd93a, reading player+0x33c/+0x340). The loop
       back-edge is 0x006fd946, NOT 0x006fd934, so re-sampling it per
       attempt would be wrong.
     * player+0x370 and room+0x20 ARE re-read every attempt, AFTER the
       candidate call (0x006fd960 / 0x006fd973), so the camera limit must be
       re-derived per attempt and must never be folded once.
     * Game+0x26614 (the mode) is sampled AFTER the entity query, once per
       attempt (0x006fd9e9), and is reloaded from its stack home inside the
       inner scan (0x006fda39) — a pre-query snapshot would be defect
       class 1.
     * The entity count is read once per attempt (0x006fd9d4) and IS folded
       across the inner scan; the inner scan compares against it UNSIGNED
       (0x006fda35 jae) while the attempt counter compares SIGNED
       (0x006fda6f cmp eax,0x32; jl).
     * `cmp eax,2; jl` on the mode is SIGNED; `cmp eax,0x3dd; ja` on
       (type - 0xa) is UNSIGNED.
     * comiss + jae: an UNORDERED compare (either operand NaN) leaves CF
       set, so `jae` is not taken and the attempt CONTINUES into the probe.
     * The candidate is copied with movss (raw bit moves), so the accepted
       position is modelled as raw 32-bit patterns, not as arithmetic.
     * When all 50 attempts fail the machine jumps straight to the
       set-position call (0x006fda78) keeping the ORIGINAL snapshot and
       WITHOUT running the query-vector destructor; the destructor runs only
       on an accepting attempt. Reproduced, not repaired.

   Host leaves inside the search, all address-stable and all left host:
   FUN_0081e9d0 (candidate), Capsule::constructor 0x00945190 (13-byte exact
   ZHL, corroborated at this call site by the xmm2 size argument and the
   1.0f multiplier vector at 0x00c3793c), FUN_0041ab50 (capsule entity
   query), FUN_00a648b0 / FUN_004175b0 (guest allocator — platform
   primitive), FUN_007cd950 (set position) and the FUN_008279a0 entry gate.

   (C) The shared SFX epilogue's argument pack at 0x006fd83a…0x006fd861,
   and one correction: the SFXManager receiver is built from the global at
   0x00c7169c (0x006fd82c mov esi,[0xc7169c]; 0x006fd858 lea ecx,
   [esi+0x2a324]), NOT from the g_Game global at 0x00c71678 that this same
   function reads at 0x006fd8a7 / 0x006fd912 / 0x006fd9e1 / 0x006fdb5f.
   Both VAs are pinned so the distinction cannot be lost again. */

/* Helpers ABI v9 translates FUN_008279a0 WHOLE — the last host boolean
   gating region B of the position search, called at 0x006fd91d. It is the
   first function in this family with `pure_complete = 1`: zero calls, four
   exits, all translated.

   Instruction stream (capstone 5.0.7 / cs_version (5,0,1280), CS_ARCH_X86,
   CS_MODE_32, detail off; linear decode from the int3 run that ends at
   0x0082799f, 0 resyncs inside the body):

     0x008279a0  8b 41 04        mov eax,[ecx+4]
     0x008279a3  8b 40 10        mov eax,[eax+0x10]
     0x008279a6  85 c0           test eax,eax
     0x008279a8  74 0e           je  0x008279b8
     0x008279aa  83 78 08 10     cmp dword ptr [eax+8],0x10
     0x008279ae  75 08           jne 0x008279b8
     0x008279b0  83 38 23        cmp dword ptr [eax],0x23
     0x008279b3  75 03           jne 0x008279b8
     0x008279b5  b0 01           mov al,1
     0x008279b7  c3              ret
     0x008279b8  32 c0           xor al,al
     0x008279ba  c3              ret

   COUNT CORRECTION: the body is **12** instructions over 27 bytes
   (0x008279a0…0x008279ba inclusive), not 11 — the shared false label
   `xor al,al; ret` is two of them. thiscall, plain `ret`, so ZERO stack
   arguments, and ZERO calls.

   Widths, checked one by one because the family's defect list demands it:
   all three tests are FULL DWORD. `test eax,eax` is the 32-bit pointer;
   `83 78 08 10` and `83 38 23` are `cmp r/m32, imm8` with the immediate
   SIGN-EXTENDED to 0x00000010 / 0x00000023. Nothing here is a byte compare,
   and because both are equality tests through `jne`, signedness cannot
   matter. The only byte-sized operation in the function is the RESULT.

   RETURN SHAPE — the reason this needs two exports. The machine writes only
   AL and leaves the upper 24 bits of EAX holding the pointer it last loaded:

     accept        EAX = (cfg & 0xffffff00) | 1
     reject at +8  EAX =  cfg & 0xffffff00      ; nonzero whenever cfg has
     reject at +0  EAX =  cfg & 0xffffff00      ;   any bit above bit 7
     cfg == 0      EAX = 0

   So a consumer that tested the full word would disagree with one that
   tests AL for every cfg whose low byte is clear. Censused: all 15 direct
   callers do `test al,al` immediately after the call (0x00428f68 also
   stores the byte with `mov [edi+0x18],al` first), so the upper bits are
   unobservable in this build — but the exact EAX is exported and pinned so
   the distinction cannot be lost.

   RECEIVER, identified from the callsite and not assumed:

     0x006fd912  mov eax,[0x00c71678]        ; g_Game
     0x006fd917  mov ecx,[eax+0x18300]       ; Game -> Room
     0x006fd91d  call 0x008279a0             ; thiscall, this = Room
     0x006fd922  test al,al                  ; LOW BYTE
     0x006fd924  je  0x006fdad2

   The base is the g_Game global 0x00c71678, NOT the SFXManager base
   0x00c7169c that the SAME function reads at 0x006fd82c — the exact trap
   the v8 unit found here. Both VAs stay pinned and a test asserts they
   differ. `[Room+4]` is the ROOM DESCRIPTOR: this family already proved
   that at 0x006fdae5 (`mov eax,[ecx+4]` / `test byte [eax+0x44],1` with the
   same ecx), which is ISAAC_FRAME_EFFECT_ROOM_DESC_FLAG_OFF. Inherited,
   not re-derived. `[desc+0x10]` is a further pointer kept address-stable as
   `cfg`; its +0 and +8 dwords are named by offset only.

   The descriptor load is UNCONDITIONAL — there is no null check on
   `[ecx+4]` before `mov eax,[eax+0x10]` dereferences it. Reproduced: the
   translation exposes the post-dereference fields and never invents a null
   guard, and the JS reference faults instead of returning false.

   REACH CENSUS (whole `.text` linear decode, 2,094,217 instructions with a
   1-byte resync loop, 469 resyncs; raw LE-dword scan over all five
   sections): 15 direct rel32 calls, 0 `jmp` tail entries, 0 `call/jmp
   [imm32]`, 0 `mov reg,imm32` materialisations (hence 0 register-held
   calls), and ZERO raw dword hits anywhere in .text/.rdata/.data/.rsrc/
   .reloc — the address is never taken, so there is no vtable slot and no
   jump-table entry. The call set is COMPLETE at 15:
     0x00428f68 0x004d78bb 0x005bd7ee 0x005d0a4f 0x0060f19d 0x00653c59
     0x0065a420 0x0066fce3 0x00673099 0x006b27e5 0x006b28ae 0x006b2d38
     0x006b2dae 0x006e1157 0x006fd91d
   Every one of the 15 passes a Room: eleven load `[<g_Game>+0x18300]`
   inline, four go through 0x00407480 (whose whole body is
   `mov eax,[ecx+0x18300]; ret`, so it is the same field — an arithmetic
   identity, not a promoted name).

   SIBLING CHECK (defect class "near-identical siblings merged"): the exact
   27-byte body occurs EXACTLY ONCE in `.text`. Five further sites carry the
   same predicate INLINED — 0x004d8851, 0x00596d5c, 0x006ab52b, 0x006e5b67,
   0x007f0803 — with identical offsets (+4, +0x10, +8, +0) and identical
   literals (0x10, 0x23); four spell the exit as `jne fail` and 0x007f0803
   inverts the last branch to `je success`, which is the same law. They are
   recorded as corroboration and NOT merged into this export: they are bare
   branches with no AL result, and this export stays bound to 0x008279a0.

   No exact ZHL match for 0x008279a0 (nor for 0x00407480 / 0x0043eec0), so
   all three keep address-stable names. Nothing is named from the literals:
   0x10 and 0x23 are recorded as immediates at their offsets, not as a room
   type or a stage id. */

enum { ISAAC_FRAME_EFFECT_PURE_HELPERS_ABI_VERSION = 51 };

enum {
  /* FUN_006fdc10 nested stage host (ABI v3). */
  ISAAC_FRAME_EFFECT_6FDC10_VA = 0x006fdc10u,
  ISAAC_FRAME_EFFECT_6FDC10_FATAL_STR_VA = 0x00b68544u,
  ISAAC_FRAME_EFFECT_6FDC10_LOG_STR_VA = 0x00b683bcu,
  ISAAC_FRAME_EFFECT_6FDC10_NO_PLAYERS_STR_VA = 0x00b7e6bcu,
  ISAAC_FRAME_EFFECT_HOST_INVALID_PARAM_VA = 0x00b18894u, /* IAT, noreturn */
  ISAAC_FRAME_EFFECT_HOST_RAW_RELEASE_VA = 0x00aef15cu,   /* platform */
  ISAAC_FRAME_EFFECT_HOST_A519A0_VA = 0x00a519a0u,
  ISAAC_FRAME_EFFECT_HOST_A51790_VA = 0x00a51790u,
  ISAAC_FRAME_EFFECT_HOST_85AFB0_VA = 0x0085afb0u,
  ISAAC_FRAME_EFFECT_HOST_85AE10_VA = 0x0085ae10u,
  ISAAC_FRAME_EFFECT_HOST_SCORE_STAGE_VA = 0x009e5a30u, /* exact ScoreSheet::AddFinishedStage */
  ISAAC_FRAME_EFFECT_HOST_6F9400_VA = 0x006f9400u,
  ISAAC_FRAME_EFFECT_HOST_6F95A0_VA = 0x006f95a0u,
  ISAAC_FRAME_EFFECT_HOST_4264C0_VA = 0x004264c0u,
  ISAAC_FRAME_EFFECT_HOST_9303F0_VA = 0x009303f0u,
  ISAAC_FRAME_EFFECT_6FDC10_KIND_MAX = 6,
  ISAAC_FRAME_EFFECT_6FDC10_MODE_OPEN = 2,   /* mov [ebp-0x30],2 + cmovne */
  ISAAC_FRAME_EFFECT_6FDC10_STAGE_OFF = 0x1d650,
  ISAAC_FRAME_EFFECT_6FDC10_COUNT_OFF = 0x26630,
  ISAAC_FRAME_EFFECT_6FDC10_FLAG_BYTE_OFF = 0x26638,
  ISAAC_FRAME_EFFECT_6FDC10_FLAG_FIELD_OFF = 0x2654c,
  ISAAC_FRAME_EFFECT_6FDC10_FLAG_BIT = 0x10000,
  ISAAC_FRAME_EFFECT_6FDC10_MASK_FIELD_OFF = 0x26550,
  ISAAC_FRAME_EFFECT_6FDC10_MASK_BIT = 2,
  ISAAC_FRAME_EFFECT_6FDC10_PUSH_STRIDE = 0xc,
  ISAAC_FRAME_EFFECT_6FDC10_PARTNER_OFF = 0x1e68,
  ISAAC_FRAME_EFFECT_6FDC10_ID_OFF = 0x161c,
  ISAAC_FRAME_EFFECT_6FDC10_PLAYERS_BEGIN_OFF = 0x1baa8,
  ISAAC_FRAME_EFFECT_6FDC10_PLAYERS_END_OFF = 0x1baac,
  ISAAC_FRAME_EFFECT_6FDC10_REGISTRY_SLOT = 0x1d4,
  ISAAC_FRAME_EFFECT_6FDC10_STAGE_MIN = 1,
  ISAAC_FRAME_EFFECT_6FDC10_STAGE_MAX = 6,
  ISAAC_FRAME_EFFECT_6FDC10_TIMER_VALUE = 8,
  ISAAC_FRAME_EFFECT_6FDC10_SSO_CAPACITY = 0xf,
  ISAAC_FRAME_EFFECT_6FDC10_SSO_BYTES = 0x10,
  /* ABI v19: stage-record existing-field select (0x006fdc9f jne /
     0x006fdca1 cmp [esi+0x238] / 0x006fdcb5 cmp [esi+0x240]). */
  ISAAC_FRAME_EFFECT_6FDC10_STAGE_KEY_EMPTY_FIELD = 0x238,
  ISAAC_FRAME_EFFECT_6FDC10_STAGE_KEY_OPEN_FIELD = 0x240,
  /* ABI v19: SSO data-ptr select reads the capacity at object+0x14
     (0x006fdcdc cmp [eax+0x14],0x10). */
  ISAAC_FRAME_EFFECT_6FDC10_STRING_CAP_OFF = 0x14,
  /* ABI v19: prize-entry bump gate (0x006fe1ff cmp byte [eax+0xd],0;
     0x006fe209 cmp dword [eax+0x10],0x10; jg; 0x006fe213 cmp eax,
     [ebx+0x1bbd8]; 0x006fe21f inc [ebx+0x269c4]). */
  ISAAC_FRAME_EFFECT_6FDC10_PRIZE_BYTE_OFF = 0xd,
  ISAAC_FRAME_EFFECT_6FDC10_PRIZE_SIZE_OFF = 0x10,
  ISAAC_FRAME_EFFECT_6FDC10_PRIZE_MAX_SIZE = 0x10,
  ISAAC_FRAME_EFFECT_6FDC10_PRIZE_BASE_OFF = 0x1bbd8,
  ISAAC_FRAME_EFFECT_6FDC10_PRIZE_COUNTER_OFF = 0x269c4
};

enum {
  /* Callee VAs. Exact ZHL where noted; others stay address-stable. */
  ISAAC_FRAME_EFFECT_6FD7C0_VA = 0x006fd7c0u,
  ISAAC_FRAME_EFFECT_HOST_FATAL_LOG_VA = 0x00a112c0u,
  ISAAC_FRAME_EFFECT_HOST_956780_VA = 0x00956780u,   /* mode-4 SFX prep */
  ISAAC_FRAME_EFFECT_HOST_SFX_PLAY_VA = 0x0092dc30u, /* exact SFXManager::Play */
  ISAAC_FRAME_EFFECT_HOST_IS_ALT_PATH_VA = 0x0074bac0u,  /* exact Level::IsAltPath */
  ISAAC_FRAME_EFFECT_HOST_IS_GREED_VA = 0x006f8120u,     /* exact Game::IsGreedMode */
  ISAAC_FRAME_EFFECT_HOST_BLUE_ROOM_VA = 0x0074d4a0u,    /* exact Level::TryInitializeBlueRoom */
  ISAAC_FRAME_EFFECT_HOST_NESTED_STAGE_VA = 0x006fdc10u,
  ISAAC_FRAME_EFFECT_HOST_705EE0_VA = 0x00705ee0u,
  ISAAC_FRAME_EFFECT_HOST_ENGINE_VA = 0x0082ee40u,   /* owned elsewhere */
  ISAAC_FRAME_EFFECT_HOST_DUAL_GATE_VA = 0x006f0070u,
  ISAAC_FRAME_EFFECT_HOST_425AC0_VA = 0x00425ac0u,
  ISAAC_FRAME_EFFECT_HOST_8279A0_VA = 0x008279a0u,
  ISAAC_FRAME_EFFECT_HOST_81E9D0_VA = 0x0081e9d0u,
  ISAAC_FRAME_EFFECT_HOST_CAPSULE_CTOR_VA = 0x00945190u, /* exact Capsule::constructor */
  ISAAC_FRAME_EFFECT_HOST_41AB50_VA = 0x0041ab50u,
  /* Fatal message VAs pushed before the shared log call. */
  ISAAC_FRAME_EFFECT_FATAL_ROOM_STR_VA = 0x00b68490u,
  ISAAC_FRAME_EFFECT_FATAL_ANIM_STR_VA = 0x00b684ccu,
  ISAAC_FRAME_EFFECT_FATAL_DIM_STR_VA = 0x00b68508u,
  ISAAC_FRAME_EFFECT_FATAL_LEVEL = 8,      /* push 8 */
  /* Game-relative offsets used by the body. */
  ISAAC_FRAME_EFFECT_MODE_OFF = 0x26614,          /* timedTransitionCleanupMode */
  ISAAC_FRAME_EFFECT_ROOM_INDEX_A_OFF = 0x18304,
  ISAAC_FRAME_EFFECT_ROOM_INDEX_B_OFF = 0x182d0,
  ISAAC_FRAME_EFFECT_ROOM_PTR_OFF = 0x18300,
  ISAAC_FRAME_EFFECT_TRANSITION_MODE_OFF = 0x1830c,
  ISAAC_FRAME_EFFECT_ENGINE_THIS_OFF = 0x1b83c,
  ISAAC_FRAME_EFFECT_COUNTER_265C0_OFF = 0x265c0,
  ISAAC_FRAME_EFFECT_BYTE_67744_OFF = 0x67744,
  ISAAC_FRAME_EFFECT_SFX_MANAGER_OFF = 0x2a324,   /* manager + this */
  ISAAC_FRAME_EFFECT_PLAYER_TIMER_OFF = 0x13bc,
  ISAAC_FRAME_EFFECT_PLAYER_CAMERA_OFF = 0x370,
  ISAAC_FRAME_EFFECT_ROOM_DESC_FLAG_OFF = 0x44,
  ISAAC_FRAME_EFFECT_ROOM_TYPE_OFF = 8,
  /* Immediates. */
  ISAAC_FRAME_EFFECT_ROOM_BIAS = 0x14,
  ISAAC_FRAME_EFFECT_ROOM_MAX_BIASED = 0xbc,
  ISAAC_FRAME_EFFECT_ANIM_MAX = 0x16,
  ISAAC_FRAME_EFFECT_DIM_LIMIT = 3,
  ISAAC_FRAME_EFFECT_MODE4 = 4,
  /* CORRECTED IN ABI v4. These are the literals the shell SEEDS into the
     player stack slot before `call 0x00956780`; they are NOT the id that
     reaches SFXManager::Play. 0x00956780 takes ecx = &id, never reads the
     incoming value, and once its gate passes overwrites the slot with
     0x25 — or 0x12d when its mixed counter is a multiple of 20. The shell
     re-reads the slot at 0x006fd85e, immediately before `call 0x0092dc30`.
     Only a closed gate leaves the seed intact. */
  ISAAC_FRAME_EFFECT_SFX_SEED_MODE4 = 0xbb,
  ISAAC_FRAME_EFFECT_SFX_SEED_SPECIAL = 0xd7,
  ISAAC_FRAME_EFFECT_SFX_REMAP_COMMON = 0x25,  /* 0x00956806 */
  ISAAC_FRAME_EFFECT_SFX_REMAP_RARE = 0x12d,   /* 0x0095686e */
  ISAAC_FRAME_EFFECT_SFX_RARE_MODULUS = 20,    /* esi % 20 == 0 */
  ISAAC_FRAME_EFFECT_HOST_SFX_REMAP_VA = 0x00956780u,
  ISAAC_FRAME_EFFECT_BLUE_ROOM_INDEX = -0x10,
  ISAAC_FRAME_EFFECT_PLAYER_TIMER_FLOOR = 0x3c,
  ISAAC_FRAME_EFFECT_GREED_ROOM_DELTA = -0xe, /* lea ebx,[edi-0xe] */
  ISAAC_FRAME_EFFECT_GREED_ANIM_DELTA = 5,    /* lea edi,[ebx+5] */
  ISAAC_FRAME_EFFECT_ANIM_SPECIAL = 0xc,
  ISAAC_FRAME_EFFECT_ENGINE_ARG_COUNT = 5
};

/* Ordered validation failure kinds (PE evaluates room, then anim, then dim;
   the dimension argument is not even loaded until the first two pass). */
enum {
  ISAAC_FRAME_EFFECT_VALIDATE_OK = 0,
  ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ROOM = 1,
  ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ANIM = 2,
  ISAAC_FRAME_EFFECT_VALIDATE_FAIL_DIM = 3
};

/* Engine argument slots in callee order (the PE pushes them in reverse). */
enum {
  ISAAC_FRAME_EFFECT_ENGINE_ARG_ROOM = 0,
  ISAAC_FRAME_EFFECT_ENGINE_ARG_ARG2 = 1,
  ISAAC_FRAME_EFFECT_ENGINE_ARG_ANIM = 2,
  ISAAC_FRAME_EFFECT_ENGINE_ARG_PLAYER = 3,
  ISAAC_FRAME_EFFECT_ENGINE_ARG_DIM = 4
};

/* P1 — prolog validation (machine: unsigned room+0x14 <= 0xbc,
   unsigned anim <= 0x16, signed dimension < 3). Returns 1 if all pass. */
int32_t isaac_frame_effect_6fd7c0_args_valid(int32_t room_index,
                                             uint32_t anim,
                                             int32_t dimension);

/* H1 gate — Game+0x26614 (timedTransitionCleanupMode) == 4 forces SFX-only
   residual and skips the transition engine + pure terminals. Returns 1 when
   that early residual is required. */
int32_t isaac_frame_effect_6fd7c0_mode4_sfx_early(
    int32_t timed_transition_cleanup_mode);

/* P2 — if room_index == -2, force *dimension = 0 (cmp ebx,-2; xor esi,esi). */
void isaac_frame_effect_6fd7c0_force_dim_room_neg2(int32_t room_index,
                                                   int32_t* dimension);

/* H2 pure arithmetic after host Game::IsGreedMode returned true on the
   anim-0xc special path: room = -2, anim = 3. */
void isaac_frame_effect_6fd7c0_greed_rewrite_neg2_anim3(int32_t* room_index,
                                                        uint32_t* anim);

/* H3 predicate for the player==0 shell (Update call sites): whether
   FUN_00705ee0(-1) runs before the engine.
     anim == 3 || anim == 0x10
     || (room_indices_equal && room_byte1_nonzero && anim != 0xc)
   room_indices_equal is Game[0x18304]==Game[0x182d0]; room_byte1_nonzero is
   *(u8*)(*(Game+0x18300)+1) != 0 — caller supplies resolved booleans. */
int32_t isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
    uint32_t anim,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero);

/* H4 eligibility — blue-room probe runs when anim == 0 and
   (dimension < 0 || dimension == room_transition_mode_1830c). Host still
   owns Level::TryInitializeBlueRoom. */
int32_t isaac_frame_effect_6fd7c0_blue_room_eligible(
    uint32_t anim,
    int32_t dimension,
    int32_t room_transition_mode_1830c);

/* H4 pure store after TryInitializeBlueRoom returns true: room = -0x10. */
void isaac_frame_effect_6fd7c0_apply_blue_room_index(int32_t* room_index);

/* P3 — player+0x13bc floor: *timer = max(*timer, 0x3c). Player-present path
   only (not reachable from current Update sites with player==0). */
void isaac_frame_effect_6fd7c0_player_timer_floor_3c(int32_t* player_field_13bc);

/* P4 — post-engine terminals:
     if (dual_gate_nonzero) *counter_265c0 = 0;   // FUN_006f0070 result
     *byte_67744 = 0;
   dual_gate_nonzero is the already-translated dual-nonzero predicate
   (Game[0x1b83c] && Game[0x1ba74]). */
void isaac_frame_effect_6fd7c0_apply_terminals(int32_t* counter_265c0,
                                               int32_t dual_gate_nonzero,
                                               uint8_t* byte_67744);

/* ---- ABI v2 peels ---- */

/* P1 ordered classifier (PE 0x006fd7f3…0x006fd810). Returns VALIDATE_*.
   Order matters: an out-of-range room reports ROOM even when anim is also
   out of range, because the machine branches on the first failure. */
int32_t isaac_frame_effect_6fd7c0_validate_fail_kind(int32_t room_index,
                                                     uint32_t anim,
                                                     int32_t dimension);

/* Fatal message VA pushed for a given failure kind; 0 for VALIDATE_OK.
   All three paths converge on 0x00a112c0(8, string) and then return
   normally through the same epilogue — no engine, no terminals. */
uint32_t isaac_frame_effect_6fd7c0_fatal_string_va(int32_t fail_kind);

/* PE `push 8` shared by all three fatal paths. */
int32_t isaac_frame_effect_6fd7c0_fatal_level(void);

/* SEED literals written into the player stack slot before the shared SFX
   tail: 0xbb on the mode-4 early path, 0xd7 on the anim-0xc non-greed path.
   These are pre-call values only — see the enum note. Do not treat either as
   the id handed to SFXManager::Play; use
   isaac_frame_effect_6fd7c0_sfx_play_id for that. */
int32_t isaac_frame_effect_6fd7c0_mode4_sfx_seed(void);
int32_t isaac_frame_effect_6fd7c0_special_sfx_seed(void);

/* Effective id at `call 0x0092dc30`, given host-observed outcomes of the
   0x00956780 remap: a closed gate leaves the seed; an open gate yields the
   common id, or the rare one when its counter lands on a multiple of 20.
   The caller must sample both flags after the remap call — the seed alone
   never determines the result. */
int32_t isaac_frame_effect_6fd7c0_sfx_play_id(int32_t seed_id,
                                              int32_t remap_gate_open,
                                              int32_t rare_hit);

/* PE 0x0095685b…0x0095686c: the rare id is taken when the mixed counter is
   an exact multiple of 20. */
int32_t isaac_frame_effect_6fd7c0_sfx_rare_hit(uint32_t mixed_counter);

/* Whether the Level::IsAltPath probe runs at all: anim == 0xc && *Game == 1
   (PE 0x006fd87a…0x006fd882). */
int32_t isaac_frame_effect_6fd7c0_alt_path_probe_needed(uint32_t anim,
                                                        int32_t game_field0);

/* Full anim-0xc special gate. All five conditions, with the host-resolved
   IsAltPath / room comparison booleans supplied by the caller:
     anim == 0xc && game_field0 == 1 && !is_alt_path
     && room_indices_equal && room_byte1_nonzero
   When open the machine then probes Game::IsGreedMode. */
int32_t isaac_frame_effect_6fd7c0_anim0xc_special_gate(
    uint32_t anim,
    int32_t game_field0,
    int32_t is_alt_path,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero);

/* Greed rewrite arithmetic in its general PE form (32-bit wrap):
   room' = anim - 0xe (lea ebx,[edi-0xe]); anim' = room' + 5 (lea edi,[ebx+5]).
   The gate pins anim to 0xc, so live values are -2 and 3. */
int32_t isaac_frame_effect_6fd7c0_greed_room_rewrite(uint32_t anim);
int32_t isaac_frame_effect_6fd7c0_greed_anim_rewrite(uint32_t anim);

/* PE 0x006fd8fa: cmp [ebp+0x14],0; je null-player shell. */
int32_t isaac_frame_effect_6fd7c0_player_present(uint32_t player);

/* PE 0x006fd904…0x006fd90c: the player-present branch is entered only for
   anim 3 or anim 0xc; anything else falls into the shared shell tail. */
int32_t isaac_frame_effect_6fd7c0_player_anim_gate(uint32_t anim);

/* Player-path room-type classifier at PE 0x006fdad2…0x006fdb08 (reached with
   anim == 3 after the camera probe returned false):
     type 0xb or 0x11 → 0x425ac0 only when (desc[0x44] & 1) == 0
     type 0xa or 3    → always 0x425ac0
     otherwise        → straight to the 0x705ee0 tail
   Returns 1 when the 0x00425ac0 call site is reached. */
int32_t isaac_frame_effect_6fd7c0_player_needs_425ac0(int32_t room_type,
                                                      int32_t room_desc_flag_44);

/* Camera-distance island at PE 0x006fd973…0x006fd98f. DAT constants are
   30.0f (0x00baa8d0), 20.0f (0x00baa87c) and 40.0f (0x00baa904); the
   subtractions are applied in machine order as f32. */
float isaac_frame_effect_6fd7c0_camera_limit(float room_field_20,
                                             float player_field_370);

/* PE `comiss xmm1,xmm0; jae` — the taken branch skips the capsule block, so
   the block runs when the compare is NOT above-or-equal. Unordered (NaN)
   leaves CF set, so jae is not taken and the block runs: NaN → 1. */
int32_t isaac_frame_effect_6fd7c0_camera_probe_continue(float probe,
                                                        float limit);

/* PE `addss xmm2, [0x00baa904]` on the continue path: player+0x370 + 40.0f. */
float isaac_frame_effect_6fd7c0_camera_bias(float player_field_370);

/* Exact blue-room store: PE uses `mov ecx,-0x10; cmovne ebx,ecx`, so the
   room index is replaced only when the host probe returned true and is
   otherwise passed through unchanged. */
int32_t isaac_frame_effect_6fd7c0_blue_room_apply_cmov(int32_t room_index,
                                                       int32_t probe_result);

/* Room-transition engine call shape (FUN_0082ee40, owned by
   room_transition_engine_pure_helpers). Receiver is Game + 0x1b83c; the five
   stack arguments in callee order are room, arg2, anim, player, dim.
   Writes min(len, 5) slots and returns the full count (5). Null out →
   count only. */
uint32_t isaac_frame_effect_6fd7c0_engine_args(int32_t* out_args,
                                               uint32_t len,
                                               int32_t room_index,
                                               int32_t arg2,
                                               uint32_t anim,
                                               uint32_t player,
                                               int32_t dimension);

int32_t isaac_frame_effect_6fd7c0_engine_this_off(void);

/* Entry plan: validation + mode-4 early, pure from the arguments plus the
   mode field and *Game. Nothing here needs a host sample. */
typedef struct IsaacFrameEffect6fd7c0EntryPlan {
  int32_t fail_kind;         /* VALIDATE_* */
  int32_t host_fatal;        /* fail_kind != OK → 0xa112c0 then plain return */
  uint32_t fatal_string_va;  /* selected message (0 when valid) */
  int32_t mode4_sfx_early;   /* mode == 4 → SFX tail, no engine/terminals */
  int32_t host_956780;       /* = mode4_sfx_early */
  int32_t host_sfx_play;     /* = mode4_sfx_early */
  int32_t sfx_id_seed;       /* SEED written pre-call (0xbb), not the Play id */
  int32_t host_id_remap;     /* = mode4_sfx_early: 0x00956780 rewrites the slot */
  int32_t host_is_alt_path;  /* anim == 0xc && *Game == 1 (probe runs) */
  int32_t reaches_body;      /* !host_fatal && !mode4_sfx_early */
  int32_t pure_cf_ok;        /* CF peels runnable */
} IsaacFrameEffect6fd7c0EntryPlan;

void isaac_frame_effect_6fd7c0_entry_plan(IsaacFrameEffect6fd7c0EntryPlan* out,
                                          int32_t room_index,
                                          uint32_t anim,
                                          int32_t dimension,
                                          int32_t timed_transition_cleanup_mode,
                                          int32_t game_field0);

/* Null-player shell plan (the shape every current Update call site takes).
   Caller supplies the room-index equality and Room+1 booleans plus the
   transition mode; room/anim/dim are the values after any greed rewrite. */
typedef struct IsaacFrameEffect6fd7c0ShellPlan {
  int32_t force_dim_zero;     /* room == -2 → dim forced to 0 */
  int32_t effective_dim;      /* dim after that rewrite */
  int32_t host_705ee0;        /* shell predicate */
  int32_t blue_room_eligible; /* anim == 0 && (dim < 0 || dim == mode) */
  int32_t host_try_blue_room; /* = blue_room_eligible */
  int32_t host_engine;        /* always 1 — FUN_0082ee40 */
  int32_t apply_terminals;    /* always 1 — P4 after the engine */
  int32_t pure_cf_ok;
} IsaacFrameEffect6fd7c0ShellPlan;

void isaac_frame_effect_6fd7c0_shell_plan(
    IsaacFrameEffect6fd7c0ShellPlan* out,
    int32_t room_index,
    uint32_t anim,
    int32_t dimension,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero,
    int32_t room_transition_mode_1830c);

/* ---- FUN_006fdc10 nested stage host (ABI v3) ----
   Reached from the shell's anim-0xc non-greed edge as (0, 6, 0). The whole
   body is far too large and stateful to port, but these islands are pure. */

/* PE 0x006fdc40: cmp esi,6; ja fatal — unsigned. Failure logs
   0xa112c0(8, 0x00b68544) and falls into the epilogue with no other work. */
int32_t isaac_frame_effect_6fdc10_kind_valid(uint32_t kind);

/* PE 0x006fdc49…0x006fdc70. Two dword-nonzero tests (`cmp ...,0; jbe`, which
   for unsigned is exactly "is zero") and one LOW-BYTE test on +0x26638.
   All three must pass for the stage-record block to run. */
int32_t isaac_frame_effect_6fdc10_stage_block_gate(uint32_t this_count_26630,
                                                   uint32_t global_count_26630,
                                                   int32_t global_flag_26638);

/* PE 0x006fdc83…0x006fdc9c: edi starts 0, a stack temp holds 2, and
   `cmovne edi, temp` selects 2 when the pointer range is non-empty. The
   result is stored into stage+8. */
int32_t isaac_frame_effect_6fdc10_stage_mode(uint32_t mp_begin,
                                             uint32_t mp_end);

/* PE 0x006fdcfc: the embedded string is released only when its capacity
   reached the heap threshold. Shares the allocator-wrapper release
   arithmetic already modelled in frame_opaque_pure_helpers ABI v20. */
int32_t isaac_frame_effect_6fdc10_string_needs_free(uint32_t capacity);

/* PE 0x006fdd2f…0x006fdd3d: size 0, capacity 0xf, first byte cleared.
   Any pointer may be null and that store is skipped. */
void isaac_frame_effect_6fdc10_string_reset(uint32_t* size_field,
                                            uint32_t* capacity_field,
                                            uint8_t* inline_buffer);

/* PE 0x006fdd92: cmp byte [ebp+8], al with al zeroed — LOW BYTE only. */
int32_t isaac_frame_effect_6fdc10_flag_arg_zero(uint32_t flag_arg);

/* PE 0x006fdd8c: and ecx,0x10000. */
int32_t isaac_frame_effect_6fdc10_flag_bit(uint32_t field_2654c);

/* PE 0x006fddb8…0x006fddda:
     combined = probe_a | (field_26550 | field_0c)
     combined &= ~probe_b
     test al,2                      ; low byte
   Returns 1 when the extra scoring call runs. */
int32_t isaac_frame_effect_6fdc10_mask_bit(uint32_t field_26550,
                                           uint32_t field_0c,
                                           uint32_t probe_a,
                                           uint32_t probe_b);

/* PE 0x006fde1c: cmp [edx+0x44],[edx+0x48]; je slow path.
   Inline append happens only when the end pointer differs from the limit. */
int32_t isaac_frame_effect_6fdc10_inline_push_ok(uint32_t end_ptr,
                                                 uint32_t limit_ptr);

/* PE 0x006fde30: add dword [edx+0x44], 0xc. */
int32_t isaac_frame_effect_6fdc10_push_stride(void);

/* PE 0x006fde64…0x006fde83. The per-player body is SKIPPED when all of:
   partner pointer non-null, partner id != -1, partner id < own id (SIGNED),
   and the partner is not the player itself. */
int32_t isaac_frame_effect_6fdc10_partner_blocks(uint32_t partner_ptr,
                                                 int32_t partner_id,
                                                 int32_t own_id,
                                                 uint32_t player_ptr);

/* PE `sub eax,ecx; sar eax,2` — signed arithmetic shift on a pointer range. */
int32_t isaac_frame_effect_6fdc10_vector_count(uint32_t begin, uint32_t end);

/* PE 0x006fe12b / 0x006fe17a: cmp idx,count; jae/jb around `lea base+idx*4`.
   ORIGINAL DEFECT PRESERVED: when the index is not below the count the
   machine leaves the base pointer in place, so an out-of-range index reads
   element 0 instead of failing. Do not "fix" this. */
uint32_t isaac_frame_effect_6fdc10_slot_addr_clamped(uint32_t begin,
                                                     uint32_t count,
                                                     uint32_t index);

/* PE 0x006fe193 / 0x006fe277: (end - begin) & 0xfffffffc. */
int32_t isaac_frame_effect_6fdc10_registry_span(uint32_t begin, uint32_t end);

/* PE 0x006fe198: cmp eax,0x1d4; jg — SIGNED. A span at or below the slot
   offset yields no entry at all (the register is zeroed instead). */
int32_t isaac_frame_effect_6fdc10_registry_has_slot(int32_t span);

/* PE 0x006fe051…0x006fe06b: stage in [1,6] SIGNED and the 0x10000 flag set. */
int32_t isaac_frame_effect_6fdc10_stage_index_gate(int32_t stage,
                                                   uint32_t field_2654c);

/* PE 0x006fe06d…0x006fe07a: the stage index is incremented when the
   companion field is 4 or 5, and only those two values. */
int32_t isaac_frame_effect_6fdc10_stage_bump(int32_t stage, int32_t field_4);

/* PE 0x006fe07b: cmp esi,1; je skip — the timer is only stamped when the
   bumped stage is not 1. */
int32_t isaac_frame_effect_6fdc10_stage_sets_timer(int32_t bumped_stage);

int32_t isaac_frame_effect_6fdc10_timer_value(void);

/* ABI v19. PE 0x006fdd5c: cmp esi,5; je skip the `push -1; call 0x00705ee0`
   pair. Reached for every non-fatal kind, so the gate is kind <= 6 AND
   kind != 5 — independent of the stage-record block. */
int32_t isaac_frame_effect_6fdc10_kind_needs_705ee0(uint32_t kind);

/* ABI v19. PE 0x006fdc9f (jne 0x6fdcb5) + 0x006fdca1/0x006fdcb5: the
   existing-field slot consulted is +0x238 when the stage is empty
   (mode == 0) and +0x240 when it is open (mode != 0). */
uint32_t isaac_frame_effect_6fdc10_stage_record_field_off(uint32_t mode);

/* ABI v19. PE 0x006fdca1…0x006fdcbc: the key-builder path (call 0x0085afb0
   at 0x006fdcc2) runs exactly when the consulted field is empty. */
int32_t isaac_frame_effect_6fdc10_stage_record_needs_key(
    uint32_t mode, int32_t has_empty_field, int32_t has_open_field);

/* ABI v19. PE 0x006fe198…0x006fe1a9 (and 0x006fe27c…0x006fe28d): span
   = (end-begin)&~3 computed by registry_span; when span > 0x1d4 SIGNED the
   machine loads [begin+0x1d4], otherwise the register is zeroed. The load
   is caller-resolved; this returns the slot ADDRESS (wrap). Consumes
   registry_has_slot by reference. */
uint32_t isaac_frame_effect_6fdc10_registry_slot_addr(uint32_t begin,
                                                      int32_t span);

/* ABI v19. PE 0x006fe1ff…0x006fe21f: the [this+0x269c4] counter is
   incremented only when byte [obj+0xd] == 0, dword [obj+0x10] <= 0x10
   (SIGNED), and obj != [this+0x1bbd8]. */
int32_t isaac_frame_effect_6fdc10_prize_entry_bump_gate(uint32_t byte_d,
                                                        int32_t field_10,
                                                        uint32_t obj_ptr,
                                                        uint32_t base_ptr);

/* ABI v19. PE 0x006fdcdc…0x006fdce2: cmp [obj+0x14],0x10; jb — an SSO
   string with capacity >= 0x10 carries its data in [obj], otherwise the
   object itself is the inline buffer. heap_ptr is the caller-resolved
   load of [obj]. */
uint32_t isaac_frame_effect_6fdc10_string_data_ptr(uint32_t obj,
                                                   uint32_t heap_ptr,
                                                   uint32_t capacity);

/* ABI v20. Pure decision seams around the still-host leaf calls of the
   same body — every gate below selects a host call (0x4264c0/0x425a70/
   0x4259b0/0x426560, 0x417870, 0x7d2470, 0xa112c0) or a stateful store
   from captured values only. None of them writes memory. */

/* PE 0x006fde8e / 0x006fdeb3: cmp dword [global+0x26614],2; jge skip —
   SIGNED. The per-player body is entered only while this companion mode
   stays below 2 (checked once before 0x4264c0 and once after). */
int32_t isaac_frame_effect_6fdc10_player_body_mode_gate(int32_t mode_26614);

/* PE 0x006fdea6…0x006fdeab: and ecx,eax; cmp ecx,-1; je skip. The body
   survives 0x4264c0's return only when (return & partner_id) != 0xffffffff
   — any zero bit pair keeps it alive. */
int32_t isaac_frame_effect_6fdc10_player_body_ret_gate(int32_t ret_4264c0,
                                                       int32_t partner_id);

/* PE 0x006fdebc: cmp byte [this+0x1c030],0; jne skip — LOW BYTE. */
int32_t isaac_frame_effect_6fdc10_player_body_flag_gate(uint32_t flag_1c030);

/* PE 0x006fded2: test al,al; jne skip — LOW BYTE of 0x425a70's return. The
   0x4259b0 call runs only when AL was zero. */
int32_t isaac_frame_effect_6fdc10_player_body_needs_4259b0(
    uint32_t ret_425a70);

/* PE 0x006fdef4: test eax,eax; je skip — FULL dword of 0x426560's return.
   The +0xc float add (movss/addss [0xbaa454]) runs only on a nonzero
   result. */
int32_t isaac_frame_effect_6fdc10_player_body_float_add_ok(
    int32_t ret_426560);

/* PE 0x006fdf32: test eax,eax (eax = [ebp+0x10], arg 3); jne skip — FULL
   dword. The 0x417870 result store runs only when that argument is zero
   (the real callsite passes 0). */
int32_t isaac_frame_effect_6fdc10_record_417870_gate(uint32_t arg_10);

/* PE 0x006fdf89: test eax,eax; 0x006fdf95 setne al; 0x006fdf98 stores the
   byte — [this+0x1ba8c] becomes (0x9be080 return != 0) ? 1 : 0. FULL
   dword test, byte result. */
int32_t isaac_frame_effect_6fdc10_record_9be080_ret_ne_zero(
    int32_t ret_9be080);

/* PE 0x006fdfc4: cmp esi,[global+0x1baac]; je skip (and the loop's
   0x006fe047 jne). Pointer inequality, NOT the vector count: ranges
   shorter than one element still walk when the pointers differ. */
int32_t isaac_frame_effect_6fdc10_camera_walk_enter(uint32_t begin,
                                                    uint32_t end);

/* PE 0x006fdfda: test ecx,ecx; je skip; 0x006fdfde: cmp dword
   [elem+0x2c],0; jne skip — both FULL dword. The camera-scale block runs
   only for entries with a non-null [0] whose [0x2c] is zero. */
int32_t isaac_frame_effect_6fdc10_camera_elem_gate(uint32_t elem_0,
                                                   int32_t elem_2c);

/* PE 0x006fe1a9: cmp byte [elem+0x1519],0; jne skip — LOW BYTE. The
   registry slot scan (stride 0x10 over [0x150c..0x1510)) runs only while
   that byte is clear. */
int32_t isaac_frame_effect_6fdc10_registry_scan_gate(uint32_t byte_1519);

/* PE 0x006fe107 / 0x006fe153 / 0x006fe230: test; jne skip-log — FULL
   dword. The "no players" log 0xa112c0(0x10, 0xb7e6bc) runs exactly when
   the sar'd count is zero (three instances of the same decision). */
int32_t isaac_frame_effect_6fdc10_registry_head_log_needed(int32_t count);

/* ABI v21. Pure decision seams of FUN_0081fd60 (Lua-bound
   Room:RespawnEnemies, 0x0081fd60…0x0082016d — 341 insns, SEH host body,
   census-81fd60-body.json). Every gate below selects a host call or a
   stateful store of the still-host body from captured values only; none
   writes memory. Byte tests are LOW BYTE (`& 0xff`) on uint32_t scalars —
   no byte-width scalar parameters. */

/* PE 0x0081fe53: cmp dx,word [data+0x44]; 0x0081fe57: jae skip — the
   spawn slot loop runs only while the u16 slot count is nonzero (the
   loop bound is movzx word at 0x0081ff8f). */
int32_t isaac_frame_effect_81fd60_spawn_loop_runs(uint32_t count_44);

/* PE 0x0081fe60: test esi,esi; 0x0081fe62: jne continue — FULL dword.
   A zero seed trips the fatal "RNG Seed is zero!" log 0xa112c0(0x10,
   0xb6bf54) + int3 at 0x0081fe73. */
int32_t isaac_frame_effect_81fd60_seed_valid(uint32_t seed);

/* PE 0x0081fea7: cmp byte [stage+8],0; 0x0081feae: jbe skip — LOW BYTE.
   The per-slot spawn block runs only while the slot record's byte at +8
   is set. */
int32_t isaac_frame_effect_81fd60_slot_open_gate(uint32_t byte_8);

/* PE 0x0081ff04..0x0081ff14: the 0x7ed310 respawn call is SKIPPED only
   when the record byte at +0xd is clear (LOW BYTE) AND the computed
   position index is >= [rec+0x10] (cmp eax,[ecx+0x10]; jl proceed —
   SIGNED) AND the record pointer equals *out ([ebp-0x10], the 0x7ed310
   out slot). */
int32_t isaac_frame_effect_81fd60_respawn_skip_gate(
    uint32_t byte_d, int32_t pos, int32_t field_10, uint32_t rec_ptr,
    uint32_t out_ptr);

/* PE 0x0081ff2f: test al,al (0x7ed310 return); 0x0081ff31: je skip — LOW
   BYTE. The block continues only on a nonzero AL. */
int32_t isaac_frame_effect_81fd60_respawn_return_gate(uint32_t ret_7ed310);

/* PE 0x0081ff33: cmp dword [ebp-0x10],0; 0x0081ff37: je skip — FULL dword
   of the 0x7ed310 out pointer. */
int32_t isaac_frame_effect_81fd60_respawn_out_gate(uint32_t out_ptr);

/* PE 0x0081ffab: test edi,edi (sar'd count); 0x0081ffad: je skip — FULL
   dword. The vtable walk of the pushed respawns runs only for a nonzero
   count. */
int32_t isaac_frame_effect_81fd60_walk1_enter(int32_t count);

/* PE 0x0081ffc3: test al,al (vtable+0x48 return); 0x0081ffc5: je skip —
   LOW BYTE. The two flag-clear stores [data+0x44] &= ~2 / &= ~0x80
   (0x0081ffca/0x0081ffd1) run only on a nonzero AL. */
int32_t isaac_frame_effect_81fd60_walk1_flag_gate(uint32_t ret_vtbl48);

/* PE 0x0081ffe6: cmp dword [ebp-0x30],0; 0x0081ffea: jbe skip — FULL
   dword (the list-1 tail slot written by the host 0x4e45c0 push). */
int32_t isaac_frame_effect_81fd60_list2_enter(uint32_t tail_30);

/* PE 0x0081fff2: cmp dword [this+0x1264],edi(0); 0x0081fff8: jbe skip —
   FULL dword array count (array base [this+0x125c]). */
int32_t isaac_frame_effect_81fd60_loop2_enter(uint32_t count_1264);

/* PE 0x0082001f..0x0082002d: the door-slot block is SKIPPED only when the
   record byte at +0xd is clear (LOW BYTE) AND the slot value is >=u
   [rec+0x10] (cmp esi,[eax+0x10]; jb proceed — UNSIGNED) AND the record
   pointer differs from the list-1 node ([ebp-0x3c]). */
int32_t isaac_frame_effect_81fd60_door_open_gate(
    uint32_t byte_d, uint32_t slot, int32_t field_10, uint32_t rec_ptr,
    uint32_t node_ptr);

/* PE 0x0082004b..0x0082005f: the vtable+0x28 call runs only when the
   record byte at +0xd is clear (LOW BYTE) AND the slot seed >= [rec+0x10]
   (cmp ecx,[eax+0x10]; jl skip — SIGNED) AND the record pointer differs
   from the list-1 node ([ebp-0x34]). */
int32_t isaac_frame_effect_81fd60_vtbl28_gate(
    uint32_t byte_d, int32_t seed_32c, int32_t field_10, uint32_t rec_ptr,
    uint32_t node_ptr);

/* PE 0x00820086: cmp dword [slot+0xc],1; 0x0082008a: je skip — FULL dword.
   The door slot reset (store [slot+0xc]=1 + 0x70ee40 call) runs only when
   the slot mode is not 1. */
int32_t isaac_frame_effect_81fd60_slot_needs_reset(int32_t mode_c);

/* PE 0x0082009a..0x008200c2: the "Open" string assign 0x40ccd0(…, 0xb1d644)
   at 0x008200d1 runs when either loaded type ([slot+0x15c] / [slot+0x160])
   is 7, 8 or 0x1d (six cmp/je pairs). */
int32_t isaac_frame_effect_81fd60_slot_type_open(int32_t type_15c,
                                                 int32_t type_160);

/* PE 0x008200f8..0x0082010e: the invalid-param host call [0xb18894] runs
   only when (size & ~3) >=u 0x1000 (jb skip) AND (begin - header - 4) >u
   0x1f (jbe skip) — both FULL dword, unsigned. */
int32_t isaac_frame_effect_81fd60_free_invalid_param(uint32_t size_and3,
                                                     uint32_t delta);

/* ABI v22. Remaining pure decision seams of FUN_0081fb70
   LRoomTileDesc::GetRandomTile (0x0081fb70…0x0081fd51, `ret 8`, exact
   ZHL; census-81fb70-body.json in frame-effect-v22-next: 202 insns /
   482 bytes / 5 host log calls 0xa112c0 / 1 direct caller 0x0081ed21).
   Every gate below is a FULL-dword zero-test (`test reg,reg`) selecting a
   host fatal log+int3 or an unsigned div from captured values only; the
   body has NO byte-width tests. None writes memory. */

/* PE 0x0081fbd2: test esi,esi (esi = seed); 0x0081fbd4: jne continue —
   FULL dword. A zero seed trips the fatal "RNG Seed is zero!" log
   0xa112c0(0x10, 0xb6bf54) + int3 at 0x0081fbe5. */
int32_t isaac_frame_effect_81fb70_seed_valid(uint32_t seed);

/* PE 0x0081fc19/0x0081fcc1 (draw 1) and 0x0081fc59/0x0081fd00 (draw 2):
   test esi,esi; jne continue — FULL dword. A zero chain draw trips the
   same fatal (mix(0)=0, so only reachable through a zero seed). */
int32_t isaac_frame_effect_81fb70_mixed_valid(uint32_t mixed);

/* PE 0x0081fc08: test ecx,ecx (ecx = abs1+abs2, 32-bit wrap); 0x0081fc0a:
   je skip-div — FULL dword. total==0 → rem 0 → the unsigned pick falls
   to rect B. */
int32_t isaac_frame_effect_81fb70_total_gate(uint32_t total);

/* PE 0x0081fc4c (dx2) / 0x0081fcf4 (dx1) / 0x0081fc82 (dy2) / 0x0081fd29
   (dy1): test reg,reg; je skip-div — FULL dword of the RAW delta bit
   pattern (a negative delta is a huge unsigned divisor). The dy gates
   also drop the third chain draw; the observable remainder is 0 either
   way. */
int32_t isaac_frame_effect_81fb70_delta_gate(uint32_t delta);

/* ABI v23. Pure decision seams of FUN_00820170, the Lua Room method
 * "TrySpawnBlueWombDoor" (0x00820170…0x00820445 `ret 0xc`; region
 * 0x00820170..0x008204ae incl. the CS re-check tail; census-820170-body.json
 * in frame-effect-v23-820170: 224 insns / 831 bytes / 14 E8 (10 main + 4
 * CS-tail) / 3 direct callers 0x5fbdda (0,1,1), 0x73ed73 (0,0,0), 0x806a57
 * (0,0,1) / Lua binder 0x86c719 "TrySpawnBlueWombDoor" @ 0xb73b78 + bind
 * helper fill 0x890fa8 — v18's "0 dword hits" superseded). SEH scope
 * DECODED (host): C++ EH frame, handler stub 0xb01801, FuncInfo 0xbc2460
 * (magic 0x19930522), unwind entry {try_level=-1, handler=0xb017f0} = the
 * 0xc8108c critical-section wrapper; protected scope 0x008203a4..0x008204aa
 * (fs:[0x2c] TLS deref + CS enter/re-check/leave with try-level [ebp-4]).
 * Everything from 0x8203a4 stays host; every law below is an SEH-free
 * captured-value test. Byte decisions are LOW BYTE (& 0xff) on uint32_t
 * scalars — family rule, no byte-width params. "1" = the PROCEED arm. */
int32_t isaac_frame_effect_820170_arg3_gate(uint32_t arg3);

/* PE 0x008201a4 test bl,bl (bl = [ebp+0x10]&0xff) / 0x008201a6 jne; the
   same byte re-tested at 0x00820262/0x00820266 (jne) and 0x008202d0/
   0x008202d4 (je -> return 0): arg3 nonzero skips the entry-gate cluster,
   the room-shape cluster and the overflow chain. */
int32_t isaac_frame_effect_820170_stage_gate(uint32_t stage_26584);

/* PE 0x008201a8 cmp [ecx+0x26584],0x2c / 0x008201af je -> return 0. FULL
   dword equality: stage != 0x2c proceeds. */
int32_t isaac_frame_effect_820170_level_flag_gate(uint32_t byte_136);

/* PE 0x008201ba cmp byte [eax+0x136],0 / 0x008201c1 jne — LOW BYTE
   (g_Level+0x136): nonzero proceeds past the type gate. */
int32_t isaac_frame_effect_820170_level_type_gate(uint32_t type_8);

/* PE 0x008201c3 cmp [eax+8],2 / 0x008201c7 jne -> return 0. FULL dword:
   level type != 2 proceeds. */
int32_t isaac_frame_effect_820170_queue_gate(uint32_t count_26630);

/* PE 0x008201cd cmp [ecx+0x26630],0 / 0x008201d4 ja — UNSIGNED: the
   spawn-queue count > 0 proceeds. */
int32_t isaac_frame_effect_820170_game_flag_gate(uint32_t byte_26589);

/* PE 0x008201d6 cmp byte [ecx+0x26589],0 / 0x008201dd je -> return 0.
   LOW BYTE: nonzero proceeds. */
int32_t isaac_frame_effect_820170_arg2_norm(uint32_t arg2, uint32_t f);

/* PE 0x008201f7 test al,al (al = 0x44bfb0 AnyoneHasTrinket ret) /
   0x008201fe cmovne ecx,edx — the stored arg2 becomes
   (f != 0) ? 1 : (arg2 & 0xff); the low byte feeds arg2_gate. */
int32_t isaac_frame_effect_820170_room_sync_gate(uint32_t ret8,
                                                 uint32_t stage_18314);

/* PE 0x00820224 cmp eax,[ecx+0x18314] / 0x0082022a jne -> return 0:
   [0x740bc0 GetRoomByIdx ret + 8] must equal [g_Game+0x18314]. FULL
   dword equality. */
int32_t isaac_frame_effect_820170_probe_bit2_gate(uint32_t mask_a,
                                                  uint32_t mask_b);

/* PE 0x00820256 test al,2 / 0x0082025a cmove esi,ebx — LOW BYTE bit 2 of
   (~mask_b & mask_a): bit set -> the door slot base probes base+1, clear
   -> stays base. mask_a = 0x6f9400ret | [g+0x26550] | [g+0xc]; mask_b =
   0x6f95a0ret (both mask builders stay host). */
int32_t isaac_frame_effect_820170_room_byte_gate(uint32_t byte_7f);

/* PE 0x00820268 cmp byte [eax+0x7f],0 / 0x0082026c je skips the bound
   check — LOW BYTE ([0x706940ret]+0x7f): nonzero -> room_bound_gate
   runs. */
int32_t isaac_frame_effect_820170_room_bound_gate(uint32_t idx,
                                                  uint32_t limit_40);

/* PE 0x0082026e cmp esi,[eax+0x40] / 0x00820271 jge -> return 0 —
   SIGNED: idx < [0x706940ret]+0x40 proceeds. */
int32_t isaac_frame_effect_820170_slot8_gate(uint32_t idx);

/* PE 0x00820277 cmp esi,8 / 0x0082027a jne -> return 0. FULL dword
   equality: the door slot base must be exactly 8. */
int32_t isaac_frame_effect_820170_room_kind_gate(uint32_t kind_4);

/* PE 0x00820283 cmp eax,4 / 0x00820286 je; 0x0082028c cmp eax,5 /
   0x0082028f je -> return 0. FULL dword: [0x706940ret]+4 not in {4,5}
   proceeds. */
int32_t isaac_frame_effect_820170_slot_free_gate(uint32_t slot,
                                                 uint32_t state_394);

/* PE 0x008202a2 test edx,edx / 0x008202a4 je continues; 0x008202a6 cmp
   [edx+0x394],-8 / 0x008202ad je -> return 0 (the 8-slot busy scan at
   0x8202a0..0x8202ba). Proceeds iff slot==0 OR state != 0xfffffff8. */
int32_t isaac_frame_effect_820170_overflow_gate(uint32_t count_264fc,
                                                uint32_t limit_26504);

/* PE 0x008202bc/0x008202c2 cmp / 0x008202c8 jle skips — SIGNED:
   [g_Game+0x264fc] > [g_Game+0x26504] enters the arg2/arg3 chain. */
int32_t isaac_frame_effect_820170_arg2_gate(uint32_t arg2n);

/* PE 0x008202ca cmp byte [ebp+0xc],0 / 0x008202ce jne — LOW BYTE of the
   NORMALIZED arg2 (arg2_norm output): nonzero proceeds. */
int32_t isaac_frame_effect_820170_tick_state_gate(uint32_t state_18308);

/* PE 0x008202e1 cmp [edi+0x18308],-8 / 0x008202e7 jne skips the fast
   path — FULL dword: [g_Game+0x18308] == 0xfffffff8 takes the
   tick_idx_gate/slot_null_gate fast path. */
int32_t isaac_frame_effect_820170_tick_idx_gate(uint32_t idx_1831c);

/* PE 0x008202e9 test esi,esi / 0x008202eb js skips — SIGNED:
   [g_Game+0x1831c] >= 0 eligible for the fast path. */
int32_t isaac_frame_effect_820170_slot_null_gate(uint32_t slot);

/* PE 0x008202ed cmp [ebx+esi*4+0x724],0 / 0x008202f5 je fast-forward;
   0x00820389/0x00820391 je loop-exit candidate; 0x008203c4/0x008203c6
   jne skips the 0x7eea90 create. FULL dword: slot ptr == 0. */
int32_t isaac_frame_effect_820170_rng_valid_gate(uint32_t state);

/* PE 0x00820316 test edi,edi (edi = [[this+4]+0x58] RNG state) /
   0x00820318 jne continue — FULL dword: state != 0, else fatal log
   0xa112c0(0x10, 0xb6bf54 "RNG Seed is zero!\n") + int3 @ 0x00820329
   (the v21/v22 seed-valid analog). */
int32_t isaac_frame_effect_820170_bit_probe_gate(uint32_t word,
                                                 uint32_t mask);

/* PE 0x00820384 test [ecx+eax*4],edx / 0x00820387 je loops on — FULL
   dword: (word & mask) != 0 checks the candidate slot; word =
   bitmap[esi>>5] (always 0), mask = 1 << (esi & 0x1f), esi = (i+base)&7
   (the signed mod-8 fixup path is dead: edi+base never sets bit 31). */
/* PE 0x00820404 cmp byte [ebp+8],0 / 0x00820408 je skips 0x70f810 —
   LOW BYTE: arg1 nonzero runs the third door method. */
int32_t isaac_frame_effect_820170_arg1_gate(uint32_t arg1);

/* ABI v24. Pure decision seams of FUN_008204b0, the Lua Room method
 * "TrySpawnTheVoidDoor" (0x008204b0..0x0082061e `ret 4` first_ret; region
 * 0x008204b0..0x008206dd incl. the CS-protected tail; census-8204b0-body.json
 * in frame-effect-v24-8204b0: 150 insns / 557 bytes / 11 E8 (4 main + 3
 * spawn-work + 4 CS) / 2 direct callers 0x73ed62 (0), 0x806a60 (0) — both
 * arms also call the v23 0x820170 sibling / Lua binder 0x86c72a
 * "TrySpawnTheVoidDoor" @ 0xb73b90 — the sole raw dword hit). SEH scope
 * DECODED (host): C++ EH + GS frame, handler stub 0xb01831, FuncInfo
 * 0xbc248c (magic 0x19930522), unwind entry {try_level=-1, handler=
 * 0xb01820} = the 0xc8108c critical-section wrapper; protected scope
 * 0x00820621..0x008206d8 (fs:[0x2c] TLS deref + CS enter/re-check/leave
 * with try-level [ebp-4] + the internal spawn work: 0x7eea90 factory,
 * slot-mark store 0xfffffff7, 0x710fa0/0x710dd0 door methods; cookie at
 * [ebp-0x24]). Everything from 0x820621 stays host; every law below is an
 * SEH-free captured-value test up to (exclusive) 0x820621. Byte decisions
 * are LOW BYTE (& 0xff) on uint32_t scalars — family rule, no byte-width
 * params. "1" = the PROCEED arm. */
int32_t isaac_frame_effect_8204b0_arg1_gate(uint32_t arg1);

/* PE 0x008204db cmp byte [ebp+8],0 (arg1 = the only stack arg, `ret 4`) /
   0x008204e4 jne skips the entry gates; re-tested 0x00820518/0x0082051c
   (jne skips the slot checks) and 0x008205f0/0x008205f4 (jne jumps
   straight to the spawn tail @ 0x820621) — LOW BYTE. */
int32_t isaac_frame_effect_8204b0_stage_gate(uint32_t stage_26584);

/* PE 0x008204e6 cmp [g_Game+0x26584],0x2c / 0x008204ed je -> return 0.
   FULL dword equality: stage != 0x2c proceeds (only on the arg1==0
   path). */
uint32_t isaac_frame_effect_8204b0_probe_candidate(uint32_t base_g0,
                                                   uint32_t gmask_26550,
                                                   uint32_t gmask_c,
                                                   uint32_t mask_6f9400ret,
                                                   uint32_t mask_6f95a0ret);

/* PE 0x008204f3 mov esi,[g+0x26550]; 0x008204f9 mov ebx,[g_Game+0]
   (ebx = *g_Game = the probe BASE); 0x008204fb or esi,[g+0xc];
   0x008204fe call 0x6f9400 (m1); 0x00820505 or edi,m1|esi;
   0x00820507 call 0x6f95a0 (m2); 0x0082050c not eax; 0x0082050e and
   eax,edi (~m2 & merged); 0x00820510 lea edi,[ebx+1]; 0x00820513 test
   al,2 / 0x00820515 cmove edi,ebx — VALUE: base_g0 + (1 when LOW BYTE
   bit 2 of (~m2 & (m1 | gmask_26550 | gmask_c)) is set, else 0); m1/m2
   are the host mask-builder returns (captured). */
int32_t isaac_frame_effect_8204b0_slot9_gate(uint32_t candidate);

/* PE 0x00820522 cmp edi,9 / 0x00820525 jne -> return 0. FULL dword
   equality: the probe candidate must be exactly 9 (the slot8_gate analog
   of the 0x820170 body, fence 9). */
int32_t isaac_frame_effect_8204b0_descriptor_kind_gate(uint32_t kind8);

/* PE 0x0082052b mov esi,[ebp-0x10] (this); 0x0082052e mov eax,[esi+4];
   0x00820531 mov eax,[eax+0x10]; 0x00820534 cmp [eax+8],5 / 0x00820538
   jne -> return 0. FULL dword: [[this+4]+0x10]+8 == 5 proceeds (only on
   the arg1==0 path). */
int32_t isaac_frame_effect_8204b0_dim_gate(uint32_t dim_18304);

/* PE 0x00820544 cmp [g_Game+0x18304],0 / 0x0082054b jl -> return 0 —
   SIGNED: [g+0x18304] >= 0 proceeds (only on the arg1==0 path). */
int32_t isaac_frame_effect_8204b0_kind23_gate(uint32_t kind_269c8);

/* PE 0x00820551 mov eax,[g_Game+0x269c8]; 0x00820557 cmp eax,2 /
   0x0082055a je 0x820601; 0x00820560 cmp eax,3 / 0x00820563 je 0x820601
   — FULL dword: kind in {2,3} takes the flag tail (the 0x820601
   `or [g+0x1839c],0x200000` store stays host), else the room-getter
   path runs. */
uint32_t isaac_frame_effect_8204b0_bound_select(uint32_t slot_40,
                                                uint32_t stage_26584,
                                                uint32_t queue_26630,
                                                uint32_t lv_flag_18c,
                                                uint32_t lv_type_8,
                                                uint32_t game_flag_26589);

/* PE 0x00820572 mov ecx,0xc; 0x00820577 cmp [edx+0x40],ecx / 0x0082057a
   je keeps 0xc; 0x0082057c cmp [ebx+0x26584],0 / 0x00820583 jne -> 0xb;
   0x00820585 cmp [ebx+0x26630],0 / 0x0082058c ja -> 0xb (UNSIGNED);
   0x00820593 cmp byte [g_Level+0x18c],0 / 0x0082059a jne keeps 0xc;
   0x0082059c cmp [g_Level+8],2 / 0x008205a0 jne -> 0xb; 0x008205a2 cmp
   byte [g_Game+0x26589],0 / 0x008205a9 jne keeps 0xc; 0x008205ab
   mov ecx,0xb — VALUE, ORDER-SENSITIVE: 0xc iff slot_40==0xc, else
   (stage==0 && queue==0 && lv_flag byte != 0), else (stage==0 &&
   queue==0 && lv_flag byte == 0 && lv_type==2 && game_flag byte != 0);
   every other chain state lands 0xb. LOW BYTE on the two flag bytes. */
int32_t isaac_frame_effect_8204b0_room_byte_gate(uint32_t byte_7f);

/* PE 0x008205b0 cmp byte [edx+0x7f],0 / 0x008205b7 je skips the
   bound-recalc arm — LOW BYTE ([0x706940ret]+0x7f). */
uint32_t isaac_frame_effect_8204b0_bound_recalc(uint32_t bound,
                                                uint32_t slot_40);

/* PE 0x008205b9 mov eax,[edx+0x40]; 0x008205bc test eax,eax /
   0x008205c0 cmove ecx,[ebp-0x10] — VALUE: (slot_40 != 0) ? slot_40 :
   bound (the cmove select; bound = bound_select output). */
int32_t isaac_frame_effect_8204b0_room_type3_gate(uint32_t type_80);

/* PE 0x008205c4 cmp [edx+0x80],3 / 0x008205cb je 0x820601 — FULL dword:
   [0x706940ret]+0x80 == 3 takes the flag tail. */
int32_t isaac_frame_effect_8204b0_bound_min_gate(uint32_t bound);

/* PE 0x008205cd cmp ecx,0xc / 0x008205d0 jl 0x820601 — SIGNED: the
   (possibly recalculated) bound < 0xc takes the flag tail. */
int32_t isaac_frame_effect_8204b0_flag_bit_gate(uint32_t flag_1839c);

/* PE 0x008205d2 test [g_Game+0x1839c],0x200000 / 0x008205dc jne 0x820601
   — FULL dword: the flag bit is already set -> the flag tail (idempotent
   store; 0x820601 itself stays host). */
int32_t isaac_frame_effect_8204b0_room_byte0_gate(uint32_t byte_7f);

/* PE 0x008205f6 cmp byte [eax+0x7f],0 (eax = the second 0x706940 ret) /
   0x008205fa je 0x820621 — LOW BYTE: ZERO takes the spawn tail (the
   byte-0 twin of room_byte_gate). */
int32_t isaac_frame_effect_8204b0_bound_spawn_gate(uint32_t candidate,
                                                   uint32_t limit_40);

/* PE 0x008205fc cmp edi,[eax+0x40] / 0x008205ff jl 0x820621 — SIGNED:
   the probe candidate < [0x706940ret]+0x40 takes the spawn tail, else
   the flag tail (return 0). */

/* ABI v25. Pure decision seams of FUN_0044bfb0, the exact-ZHL query
 * PlayerManager::AnyoneHasTrinket (0x0044bfb0..0x0044c06d, TWO `ret 4`
 * epilogues — main arm @ 0x44c059, the +0x1e6c second-match arm @
 * 0x44c06d; census-v24-leaves.json in frame-effect-v24-leaves: 75 insns /
 * 0 resyncs / 192 bytes / 2 E8 (2x the ZHL-empty item query 0x771550) /
 * 0 indirect / 0 field stores — pure query, plain frame, NO SEH / 106
 * direct callers incl. 0x8201ee (the v23 820170 census site) / 0 raw
 * dword hits). Reads: g_Level 0xc7169c [+0x2a410,+0x2a414) trinket slot
 * array, player list [this+0, this+4) flat 4-ptr array, [item+0xb8]
 * has-flag bit 31, [elem+0x2c] active, [elem+0x1e6c] alternate item.
 * The 0x771550 AL results are captured inputs. Byte decisions are LOW
 * BYTE (& 0xff) on uint32_t scalars — family rule, no byte-width
 * params. "1" = the PROCEED arm. */
int32_t isaac_frame_effect_44bfb0_trinket_index(uint32_t trinket);

/* PE 0x0044bfd6 and ecx,0x7fff — idx = trinket & 0x7fff (15-bit mask;
   the bound test below runs on this masked value). */
int32_t isaac_frame_effect_44bfb0_bound_gate(uint32_t idx, uint32_t count);

/* PE 0x0044bfdf cmp ecx,eax / 0x0044bfe1 jge -> not-found — SIGNED:
   (int32)idx < (int32)count; count = ([g_Level+0x2a414]-[g_Level+
   0x2a410]) sar 2. */
int32_t isaac_frame_effect_44bfb0_slot_null_gate(uint32_t slot);

/* PE 0x0044bfe6 test eax,eax / 0x0044bfe8 je -> not-found — FULL dword:
   [trinkets_start + idx*4] != 0 proceeds. */
int32_t isaac_frame_effect_44bfb0_has_flag_gate(uint32_t flag_b8);

/* PE 0x0044bff0 and eax,0x80000000; 0x0044bff5 or eax,0; 0x0044bff8 je
   -> not-found — FULL dword bit 31 of [item+0xb8] (the has-trinket
   flag). */
int32_t isaac_frame_effect_44bfb0_walk_enter(uint32_t head, uint32_t tail);

/* PE 0x0044c007 cmp esi,[edi+4] / 0x0044c00a je -> empty — FULL dword:
   this->head != this->tail proceeds (the flat 4-ptr list walk). */
int32_t isaac_frame_effect_44bfb0_active_gate(uint32_t elem_2c);

/* PE 0x0044c012 cmp dword [edi+0x2c],0 / 0x0044c016 jne skips the check
   — FULL dword: [elem+0x2c] == 0 proceeds (active item). */
int32_t isaac_frame_effect_44bfb0_match_gate(uint32_t al);

/* PE 0x0044c022 test al,al / 0x0044c024 jne -> found — LOW BYTE: the
   0x771550 return AL nonzero (matched). */
int32_t isaac_frame_effect_44bfb0_second_probe_gate(uint32_t found,
                                                    uint32_t al);

/* PE 0x0044c026 cmp byte [ebp+0xb],al / 0x0044c029 je -> continue — LOW
   BYTE pair: the +0x1e6c alternate probe runs iff found != 0 AND the
   first probe's AL == 0. */
int32_t isaac_frame_effect_44bfb0_alt_null_gate(uint32_t alt);

/* PE 0x0044c031 test ecx,ecx / 0x0044c033 je -> continue — FULL dword:
   [elem+0x1e6c] != 0 proceeds. */
int32_t isaac_frame_effect_44bfb0_walk_continue(uint32_t node_addr,
                                                uint32_t tail);

/* PE 0x0044c047 cmp esi,[eax+4] / 0x0044c04a jne -> loop — FULL dword:
   node_ptr != this->tail continues the walk. */
int32_t isaac_frame_effect_44bfb0_result_gate(uint32_t found_node);

/* PE 0x0044c04e test edi,edi / 0x0044c050 setne al (main arm);
   0x0044c05c mov edi,[edi+0x1e6c]; 0x0044c062 test edi,edi; 0x0044c066
   setne al (second-match arm — setne lands BETWEEN the pops; flags from
   the pre-pop test) — FULL dword: found node != 0. */

/* Combined entry plan for the nested stage host. */
typedef struct IsaacFrameEffect6fdc10Plan {
  int32_t kind_valid;       /* kind <= 6 */
  int32_t host_fatal;       /* !kind_valid → log then plain return */
  uint32_t fatal_string_va;
  int32_t stage_block;      /* the three-condition gate opened */
  int32_t stage_mode;       /* 2 when the pointer range is non-empty else 0 */
  int32_t host_705ee0;      /* PE 0x006fdd5c: kind != 5 (v19 law) */
  int32_t host_log;         /* always 1 once the kind is valid */
  int32_t pure_cf_ok;
  int32_t pure_complete;    /* always 0 — the body is large and stateful */
} IsaacFrameEffect6fdc10Plan;

void isaac_frame_effect_6fdc10_entry_plan(IsaacFrameEffect6fdc10Plan* out,
                                          uint32_t kind,
                                          uint32_t this_count_26630,
                                          uint32_t global_count_26630,
                                          int32_t global_flag_26638,
                                          uint32_t mp_begin,
                                          uint32_t mp_end);

/* ABI v26. Pure decision seams of FUN_007ee7e0, the Room grid-cell setter
 * (0x007ee7e0..0x007eea8f — one int3 pad byte then sibling 0x007eea90, the
 * v24 "factory" host; TWO `ret 8` epilogues: 0x7ee932 is the shared al=0
 * exit of arms A/B, 0x7eea8c is the default arm's al=1 exit; receiver ebx
 * = ecx = Room; args [ebp+8] x / [ebp+0xc] y; census-7ee7e0-body.json in
 * frame-effect-v26-7ee7e0: 197 insns / 0 resyncs / 687 bytes / 19 calls
 * (15 direct: 3x 0xa112c0 log, 3x 0x6eef60 genrand, 3x 0xa0f4c0 alloc,
 * 3x 0x709c40 ctor, 3x 0x709db0 init + 4 indirect: 2x vtbl[0] release
 * with push 1, 2x vtbl[4] release) / 30 stores (3 grid-cell stores
 * [ebx+idx*4+0x24] @ 0x7ee906/0x7ee9ee/0x7eea68, 3 vtable installs, per-
 * arm object-field stores) / 24 direct rel32 callers — ALL inside
 * 0x0081ee20 — / 0 raw dword hits / identify-zhl EMPTY / SEH + GS frame
 * (handler stub 0xb00ebb, cookie global 0xbf93b4)). Reads: [ebx+4] desc,
 * [ebx+8] mode, [ebx+0xc] width, [ebx+0x10] height, type10 = [[[ebx+4]+
 * 0x10]+0x10] (the setter's OWN cfg-class member at [cfg+0x10] — NOT the
 * 0x81fb20/81ecc0 [cfg+0x48] family TYPE_OFF), [type10+0xc], cell array
 * [ebx+idx*4+0x24], marker array [ebx+idx*4+0x76c]; idx = x + width*y.
 * Every gate selects a host call (log / genrand / alloc / ctor / init /
 * vtbl release) or a stateful store of the still-host body from captured
 * values only; none of them writes memory. ALL FULL-dword decisions — the
 * body has ZERO byte gates (no cmp byte / movzx), so the family low-byte
 * rule has no surface here; no byte-width params. "1" = the arm it names
 * is taken. The arm-B crash seams (NULL [vtbl+4] derefs @ 0x7eea15 and
 * @ 0x7eea07) are reproduced, not repaired. */
uint32_t isaac_frame_effect_7ee7e0_grid_index(uint32_t x, uint32_t y,
                                              uint32_t width);

/* PE 0x007ee819 test edi,edi; js LOG / 0x007ee823 cmp edi,height*width;
   0x007ee825 jl skip — SIGNED: log 0xa112c0(0x10,0xb6c190) when idx < 0
   or idx >= width*height; the log path CONTINUES into the cell gate. */
int32_t isaac_frame_effect_7ee7e0_index_oob_log(uint32_t idx, uint32_t width,
                                                uint32_t height);

/* PE 0x007ee839 cmp [ebx+edi*4+0x24],0; 0x007ee83e jne 0x7ee91f — FULL
   dword: an occupied cell skips the set (shared al=0 return). */
int32_t isaac_frame_effect_7ee7e0_cell_occupied(uint32_t cell);

/* PE 0x007ee844 cmp [ebx+8],0x10; 0x007ee848 jne 0x7eea21 — mode != 0x10
   goes to the default arm. */
int32_t isaac_frame_effect_7ee7e0_mode_open(uint32_t mode8);

/* PE 0x007ee84e mov eax,[ebx+4]; 0x007ee851 mov eax,[eax+0x10];
   0x007ee854 mov edx,[eax+0x10]; 0x007ee857 cmp edx,2; je 0x7eea21;
   0x007ee860 cmp edx,3; je 0x7eea21 — type10 ∈ {2,3} selects the default
   arm (the setter's [cfg+0x10] member, NOT the [cfg+0x48] type). */
int32_t isaac_frame_effect_7ee7e0_type_default_arm(uint32_t type10);

/* PE 0x007ee869 test esi,esi (y); jne 0x7ee935 (arm-B check) /
   0x007ee871 cmp ecx,2 (x); jne 0x7eea21 — y==0 with x==2 is arm A. */
int32_t isaac_frame_effect_7ee7e0_arm_a_selected(uint32_t x, uint32_t y);

/* PE 0x007ee935 cmp esi,3; je 0x7ee943 / 0x007ee93a cmp esi,4; jne
   0x7eea21; 0x007ee943 cmp ecx,0xe; jne 0x7eea21; 0x007ee94c cmp
   [eax+0xc],1; jne 0x7eea21 — y∈{3,4} + x==0xe + [type10+0xc]==1 is
   arm B. */
int32_t isaac_frame_effect_7ee7e0_arm_b_selected(uint32_t x, uint32_t y,
                                                 uint32_t type_c);

/* PE 0x007ee882 (arm A) / 0x007ee95e (arm B) test edi,edi; js LOG;
   cmp edi,0x1c0; jl skip — SIGNED: the shared bounds LOG
   0xa112c0(0x10,0xb6c138) when idx < 0 or idx >= 0x1c0. */
int32_t isaac_frame_effect_7ee7e0_arm_ab_bounds_log(uint32_t idx);

/* PE 0x007ee89d cmp edi,0x1bf; ja 0x7ee91f — UNSIGNED cap — then
   0x007ee8a5 cmp [ebx+edi*4+0x76c],0x384; jg 0x7ee91f — SIGNED marker —
   arm A's silent skip (shared al=0 return). */
int32_t isaac_frame_effect_7ee7e0_arm_a_skip(uint32_t idx, int32_t marker);

/* PE 0x007ee979 test edi,edi; js 0x7eea15 / 0x007ee981 cmp edi,0x1c0;
   jge 0x7eea15 — SIGNED re-check; 0x7eea15 is xor ecx,ecx; mov eax,[ecx];
   call [eax+4] — a NULL-vtbl deref, reproduced not repaired. Arm A's cap
   is UNSIGNED 0x1bf; arm B's is SIGNED 0x1c0 — the two arms disagree. */
int32_t isaac_frame_effect_7ee7e0_arm_b_crash_oob(uint32_t idx);

/* PE 0x007ee98d cmp [ebx+edi*4+0x76c],0x384; jg 0x7eea07 — SIGNED;
   0x7eea07 reads the still-EMPTY cell and calls [vtbl+4] — NULL deref,
   reproduced not repaired (arm A returns 0 on the same marker law). */
int32_t isaac_frame_effect_7ee7e0_arm_b_crash_marker(int32_t marker);

/* ABI v27. Pure laws of the resumed sibling run AFTER the v26 0x7ee7e0
 * landing — 0x7eece0 Room::GetRoomConfigStage (PURE-OPEN) and 0x7eed10
 * the captured-value filter (PURE-OPEN). The third observed sibling,
 * 0x7eeeb0 (the SEH effect-copy body between the filter and 0x7ef420),
 * stays HOST with written evidence only — see the NOTES record
 * (census-v27-siblings.json in frame-effect-v27-siblings; identify-zhl
 * fresh: 0x7eece0 EXACT 16-byte Room::GetRoomConfigStage, 0x7eed10 and
 * 0x7eeeb0 EMPTY).
 *
 * 0x7eece0 (0x007eece0..0x007eed03, 14 insns / 35 bytes / 0 resyncs /
 * 1 call @ 0x7eecf8 = 0xa112c0 log / 0 indirect / 2 plain `ret` @
 * 0x7eecf0 and 0x7eed02 / 0 field stores / 2 direct callers 0x543bbc,
 * 0x6c0ab3 / 1 raw dword hit @ 0x86c3b7 = Lua binder `push 0x7eece0`
 * with name VA 0xb73850 "gnPlayerHUDs" (0x88fd10 binder) / no frame
 * (naked thiscall getter, ZERO stack args)). Body: cfg = [ecx+4] @
 * 0x7eece0; test cfg; je 0x7eecf1 (LOG tail) @ 0x7eece5; cfg10 =
 * [cfg+0x10] @ 0x7eece7; test cfg10; je 0x7eecf1 @ 0x7eecec; stage =
 * [cfg10+0] @ 0x7eecee; ret @ 0x7eecf0. The shared LOG tail
 * 0x7eecf1..0x7eed02 pushes 0xb6c2a8 (" button config\n") and level 4,
 * calls 0xa112c0, then xor eax,eax; ret — the null chains RETURN 0 and
 * the log emission stays HOST (the laws below reproduce the value path;
 * the log is a side effect of the same class as the v26 index_oob_log
 * seam). Callers gate on the result: 0x543bbc stage-in-{1,2,3};
 * 0x6c0ab3 jump table on stage <= 0x1a. ZERO byte gates (no cmp byte /
 * movzx) and no byte-width params — the family low-byte rule has no new
 * surface here. */
int32_t isaac_frame_effect_7eece0_config_gate(uint32_t cfg, uint32_t cfg10);

int32_t isaac_frame_effect_7eece0_config_stage(uint32_t cfg, uint32_t cfg10,
                                               uint32_t stage);

/* 0x7eed10 (0x007eed10..0x007eeea9, 124 insns / 409 bytes / 0 resyncs /
 * 0 calls / 0 indirect / 8 plain `ret` (0x7eed46, 0x7eed66, 0x7eee16,
 * 0x7eee32, 0x7eee4d, 0x7eee7c, 0x7eee98, 0x7eeea8 — the shared false
 * exit 0x7eeea5 `xor al,al; pop ebp; ret`) / 0 field stores / 3 direct
 * callers 0x7eda99, 0x7edca5, 0x7eef27 / 0 raw dword hits /
 * identify-zhl EMPTY; plain frame, caller cleans 0xc (add esp,0xc @
 * 0x7eef2c)). Custom convention: ecx = type, edx = subtype, [ebp+8] =
 * arg_a, [ebp+0xc] = arg_b, [ebp+0x10] = flag BYTE. The two global byte
 * reads [0xc7169c]+0x20dcc (sfx mgr) @ 0x7eed18 and [0xc71678]+0x269ea
 * (g_Game) @ 0x7eed26 OR into al (audio_gate), which feeds the 0x3e8
 * subtype 0xa1/0x9c arms. The full decision tree below is a pure
 * captured-value classifier (0 calls, 0 stores). FOUR byte gates in the
 * body (0x7eed18, 0x7eed26, 0x7eedae, 0x7eee8b) — the family low-byte
 * rule applies: uint32_t scalars masked & 0xff. */
int32_t isaac_frame_effect_7eed10_audio_gate(uint32_t gate_a, uint32_t gate_b);

int32_t isaac_frame_effect_7eed10_filter(uint32_t type, uint32_t subtype,
                                         uint32_t arg_a, uint32_t arg_b,
                                         uint32_t flag, uint32_t gate_a,
                                         uint32_t gate_b);

/* 0x7eeeb0 (0x007eeeb0..0x007ef41a, 384 insns / 1386 bytes / 0 resyncs /
 * 16 direct calls: 2x 0xa0f4c0 alloc @ 0x7ef0fa/0x7ef158, 1x 0x7eed10
 * filter @ 0x7eef27, 0x6ee340 @ 0x7ef035, 0x417430 @ 0x7ef05b,
 * 0x6e1d70 @ 0x7ef0d1, 0x827f70 @ 0x7ef106, 0x4d7190 @ 0x7ef176,
 * 0x4d3130 @ 0x7ef18b, 0x6eee10 @ 0x7ef19f, 0x4d7130 @ 0x7ef1b1,
 * 0x592200 @ 0x7ef257, 0x417170 @ 0x7ef26e, 0x6a89d0 @ 0x7ef2af,
 * 0x499d60 @ 0x7ef3c6, 0xaefca0 @ 0x7ef3fd / 1 indirect call
 * [eax+0xc] @ 0x7ef328 / 8 `ret 0xc` epilogues (0x7ef1c8, 0x7ef221,
 * 0x7ef2e2, 0x7ef33d, 0x7ef372, 0x7ef3ac, 0x7ef3ea, 0x7ef417; the
 * first @ 0x7ef1c8 is an EARLY exit — branches cross it to the shared
 * false exit 0x7ef39a) / 58 memory stores / 6 direct callers (0x5c1039,
 * 0x6e16a7, 0x6eb617, 0x7efdbf, 0x7efdd4, 0x7efe97, every one loads
 * ecx = Room and pushes (source, out) + flag) / 0 raw dword hits /
 * identify-zhl EMPTY; SEH + GS frame (handler stub 0xb00f6d, cookie
 * global 0xbf93b4, fs-chain registration @ 0x7eeed1 + restore in all 8
 * epilogues)). HOST — the SEH effect-copy body with type/subtype/float
 * arms, descriptor-field copies, allocs + vector fills, destructor
 * scopes and one vtbl dispatch; NOT landable; written evidence only. */

/* ABI v28. Pure laws of FUN_008206e0 (0x008206e0..0x00820711, 16 insns /
 * 49 bytes / 0 resyncs / 0 calls / 0 indirect / 2 plain `ret` @ 0x82070a
 * and 0x820710 / 0 field stores / 1 direct caller 0x7eb4ce / 0 raw dword
 * hits / identify-zhl EMPTY), the stage-id selector recorded at v24 as
 * the priority-1 next VA after the 0x8204b0 VoidDoor landing and left
 * unassessed through v27 (which worked the 0x7ee band). Bounded census:
 * census-8206e0-body.json in frame-effect-v28-8206e0; int3 pad
 * 0x820711..0x82071f, sibling 0x00820720.
 *
 * Convention: thiscall, ecx = Room-shaped receiver ([this+4] = desc —
 * the same Room+4 descriptor chain the family pins as
 * ISAAC_FRAME_EFFECT_ROOM_DESC_FLAG_OFF), ZERO stack args (both epilogues
 * are plain `ret`). Instruction stream (capstone 5.0.7 / CS_MODE_32,
 * linear decode, 0 resyncs):
 *
 *   0x008206e0  mov eax,[0xc71678]        ; g_Game (unconditional)
 *   0x008206e5  mov eax,[eax+4]           ; chapter = [g_Game+4]
 *   0x008206e8  cmp eax,4 ; je 0x82070b   ; FULL dword
 *   0x008206ed  cmp eax,5 ; je 0x82070b   ; FULL dword — the chapter arm
 *   0x008206f2  mov eax,[ecx+4]           ; desc — ONLY off the chapter arm
 *   0x008206f5  mov ecx,0x1a              ; 26
 *   0x008206fa  mov eax,[eax+0x44]        ; flags dword = [desc+0x44]
 *   0x008206fd  shr eax,6                 ; LOGICAL shift right 6
 *   0x00820700  test al,1                 ; bit 0 of AL = bit 6 of the
 *                                         ;   ORIGINAL flags dword
 *   0x00820702  mov eax,9
 *   0x00820707  cmovne eax,ecx            ; bit6 set -> 0x1a (26), else 9
 *   0x0082070a  ret
 *   0x0082070b  mov eax,0x29              ; 41 — chapter 4 or 5
 *   0x00820710  ret
 *
 * Caller formation (caller-7eb4ce.py, lea-corrected): 0x7eb4b0
 * `cmp esi,0x10` arm of the room stage-id selector (parent also reads
 * [g_Game+0x269c8] and [edi+0x18304]); 0x7eb4b5..0x7eb4ca walks
 * [[ebx+4]+0x10]+0x10 == {2,3}; 0x7eb4cc `mov ecx,ebx` (thiscall) then
 * `call 0x8206e0` with ZERO pushed args; 0x7eb4d3 `mov ebx,eax` — the
 * FULL-dword result is the next selector value.
 *
 * Byte-gate note: the only byte-width op is `test al,1` on a REGISTER
 * after a full-dword read + LOGICAL shift; there is no `cmp byte [mem]`
 * and no movzx. The gate input is the full desc_flags dword; the law is
 * ((flags >> 6) & 1), declared uint32_t (family low-byte rule: no
 * byte-width scalar params, explicit mask). The chapter compare is FULL
 * dword — equality, so signedness cannot matter (0x100 / 0xffffffff /
 * 0x80000000 compare by value). */
int32_t isaac_frame_effect_8206e0_chapter_41_gate(uint32_t chapter);

int32_t isaac_frame_effect_8206e0_desc_bit6(uint32_t desc_flags_44);

uint32_t isaac_frame_effect_8206e0_result(uint32_t chapter,
                                          uint32_t desc_flags_44);

typedef struct IsaacFrameEffect8206e0Plan {
  int32_t deref_game;    /* 1 — [0xc71678] read unconditional @ 0x8206e0 */
  int32_t deref_chapter; /* 1 — [eax+4] read unconditional @ 0x8206e5 */
  int32_t chapter_41;    /* chapter == 4 || chapter == 5 */
  int32_t desc_deref;    /* = !chapter_41 — [ecx+4] runs ONLY off the arm */
  int32_t flag_deref;    /* = !chapter_41 — [desc+0x44] likewise */
  int32_t desc_bit6;     /* ((flags >> 6) & 1) — valid when desc_deref */
  uint32_t result;       /* 0x29 on the chapter arm; 0x1a : 9 otherwise */
  int32_t host_calls;    /* always 0 */
  int32_t pure_complete; /* always 1 — zero-call body, all translated */
} IsaacFrameEffect8206e0Plan;

void isaac_frame_effect_8206e0_entry_plan(IsaacFrameEffect8206e0Plan* out,
                                          uint32_t chapter,
                                          uint32_t desc_flags_44);

enum {
  ISAAC_FRAME_EFFECT_8206E0_VA = 0x008206e0u,
  ISAAC_FRAME_EFFECT_8206E0_END_VA = 0x00820711u, /* past final `ret` @ 0x820710 */
  ISAAC_FRAME_EFFECT_8206E0_NEXT_VA = 0x00820720u, /* after int3 pad 0x820711..0x82071f */
  ISAAC_FRAME_EFFECT_8206E0_RET_BYTES = 0,      /* plain `ret`, zero stack args */
  ISAAC_FRAME_EFFECT_8206E0_INSN_COUNT = 16,
  ISAAC_FRAME_EFFECT_8206E0_BYTE_LEN = 49,
  ISAAC_FRAME_EFFECT_8206E0_CALL_INSNS = 0,
  ISAAC_FRAME_EFFECT_8206E0_DIRECT_CALLERS = 1,
  ISAAC_FRAME_EFFECT_8206E0_RAW_DWORD_HITS = 0,
  ISAAC_FRAME_EFFECT_8206E0_CALLSITE_VA = 0x007eb4ceu,
  ISAAC_FRAME_EFFECT_8206E0_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_8206E0_CHAPTER_OFF = 0x4,  /* [g_Game+4] = chapter */
  ISAAC_FRAME_EFFECT_8206E0_DESC_OFF = 0x4,     /* [this+4] = Room desc */
  ISAAC_FRAME_EFFECT_8206E0_DESC_FLAG_OFF = 0x44, /* = ROOM_DESC_FLAG_OFF */
  ISAAC_FRAME_EFFECT_8206E0_FLAG_BIT = 6,       /* shr eax,6; test al,1 */
  ISAAC_FRAME_EFFECT_8206E0_RESULT_CHAPTER = 0x29, /* 41 */
  ISAAC_FRAME_EFFECT_8206E0_RESULT_BIT6 = 0x1a, /* 26 */
  ISAAC_FRAME_EFFECT_8206E0_RESULT_CLEAR = 9,
  ISAAC_FRAME_EFFECT_8206E0_RET_A_VA = 0x0082070au, /* miss arm ret */
  ISAAC_FRAME_EFFECT_8206E0_RET_B_VA = 0x00820710u  /* chapter arm ret */
};

/* ABI v29. Pure laws of FUN_00820720 (0x00820720..0x0082079c, 46 insns /
 * 124 bytes / 0 resyncs / 1 call / 0 indirect / 4 plain `ret` @ 0x82074e,
 * 0x82078b, 0x820793, 0x82079b / 0 field stores / 2 direct callers
 * 0x7fee72 + 0x7ff7fe / 0 raw dword hits), the sibling recorded at v28 as
 * NEXT_VA (int3 pad 0x82079c..0x82079f, next function 0x8207a0). Bounded
 * census: census-820720-body.json in frame-effect-v29-820720.
 *
 * ZHL PROMOTED (comments only — exported symbols keep the address-stable
 * 820720 prefix, family v7 convention): EXACT 13-byte pattern
 * `56 8b 35 .. .. .. .. 57 8b f9 83 3e 0d` for
 * `__thiscall uint32_t Room::GetBossVictoryJingle()` (Room.zhl), and the
 * call-site signature AGREES at both callers: 0x7fee6f/0x7ff7f9 load
 * ecx = Room-shaped receiver ([this+4] desc / [this+8] type read by the
 * callers — the same Room+4 descriptor chain this family pins as
 * ISAAC_FRAME_EFFECT_ROOM_DESC_FLAG_OFF), ZERO stack args (plain `ret`),
 * FULL-dword uint32_t result (caller-1 compares it with the SFX manager
 * music field [0xc7169c+0x2a2c8] and pushes it to 0x7e1d50; caller-2
 * tests it as a bool). GetBossVictoryJingle is therefore the source-level
 * name used in comments; per the v7 rule nothing else is renamed.
 *
 * Convention: thiscall, ecx = Room receiver (mov edi,ecx @ 0x820728),
 * ZERO stack args. Instruction stream (capstone 5.0.7 / CS_MODE_32,
 * linear decode, 0 resyncs):
 *
 *   0x00820720  push esi
 *   0x00820721  mov esi,[0xc71678]        ; g_Game (unconditional)
 *   0x00820727  push edi
 *   0x00820728  mov edi,ecx               ; this = Room
 *   0x0082072a  cmp dword [esi],0xd ; jne 0x820735  ; [g_Game+0] == 13
 *   0x0082072f  cmp [esi+4],1 ; je 0x82074a         ;   && chapter == 1
 *                                           ;   -> ret 0 — the first zero arm
 *   0x00820735  mov ecx,esi ; call 0x74bae0 ; HOST thiscall(ecx=Game),
 *                                           ;   ZERO stack args, plain ret;
 *                                           ;   full-dword result compared
 *   0x0082073c  cmp eax,4 ; jne 0x82074f   ; == 4 (FULL dword)
 *   0x00820741  cmp [esi+0x18304],-0xa ; jne 0x82074f  ; == -10 (FULL dword)
 *   0x0082074a  pop edi; xor eax,eax; pop esi; ret   ; ret 0 — second zero arm
 *   0x0082074f  mov eax,[esi+0x18300]      ; room = [g_Game+0x18300]
 *   0x00820755  cmp [eax+8],6 ; je 0x820794 ; [room+8] type == 6 (FULL dword)
 *                                           ;   -> ret 0x5c
 *   0x0082075b  cmp byte [eax+0x7228],0 ; jne 0x820794 ; byte flag != 0
 *                                           ;   -> ret 0x5c (BYTE gate)
 *   0x00820764  mov eax,[esi+4]            ; chapter = [g_Game+4] (re-read)
 *   0x00820767  cmp eax,4 ; je 0x82078c    ; FULL dword -> ret 0x2a
 *   0x0082076c  cmp eax,5 ; je 0x82078c    ; FULL dword -> ret 0x2a
 *   0x00820771  mov eax,[edi+4]            ; desc — ONLY on the final arm
 *   0x00820774  mov ecx,0x61               ; 97
 *   0x0082077b  mov eax,[eax+0x44]         ; flags dword = [desc+0x44]
 *   0x0082077e  shr eax,6                  ; LOGICAL shift right 6
 *   0x00820781  test al,1                  ; bit 0 of AL = bit 6 of the
 *                                          ;   ORIGINAL flags dword
 *   0x00820783  mov eax,0x53               ; 83
 *   0x00820788  cmovne eax,ecx             ; bit6 set -> 0x61 (97), else 0x53
 *   0x0082078b  ret
 *   0x0082078c  pop edi; mov eax,0x2a; pop esi; ret  ; 42 — chapter 4/5 arm
 *   0x00820794  pop edi; mov eax,0x5c; pop esi; ret  ; 92 — room gate arm
 *   0x0082079b  ret                       ; (same arm as 0x82078b path)
 *
 * Arm order as compiled (the result law preserves it exactly):
 *   ret 0  (game_0==0xd && chapter==1)
 *   ret 0  (host_result==4 && [g_Game+0x18304]==-10)
 *   ret 0x5c (room_type==6 || byte [room+0x7228] != 0)
 *   ret 0x2a (chapter 4/5)
 *   ret 0x61 : 0x53 (desc flags bit 6)
 *
 * Caller formation (caller-census.py / caller-7fee72.py /
 * caller-7ff7fe.py, lea-corrected):
 *   caller-1 0x7fee72 (fn 0x7fec00, this = edi @ 0x7fec19 stored to
 *   [ebp-0x2c] @ 0x7fec28): after SFX-manager music-id checks
 *   ([0xc7169c+0x2a2c8] in {9,0x1a,0x29}, byte [g_Game+0x265e8]==0 and
 *   the 0x6f8120 probe) 0x7fee6f `mov ecx,[ebp-0x2c]` then `call
 *   0x820720`; result: 0x7fee77 `test eax,eax; je skip`, 0x7fee81
 *   `cmp [ecx+0x2a2c8],eax; je skip`, 0x7fee9d `push eax` to 0x7e1d50 —
 *   the FULL dword is the next music id.
 *   caller-2 0x7ff7fe: after `mov ecx,[0xc71678]; call 0x6f8120; test
 *   al,al` 0x7ff7f9 `mov edx,[ebp-0x2c]; mov ecx,edx; call 0x820720`,
 *   then 0x7ff803 `test eax,eax; je 0x7ff85e` — bool use, consistent
 *   with the uint32_t return (0 == keep current jingle).
 *
 * Byte-gate note: the ONLY byte-width memory op is `cmp byte ptr
 * [room+0x7228],0` — a zero-test on the room byte flag (written at
 * 0x7f3006 from ([desc2+0x44]>>4)&1 per cpu-dump 007f2390.txt); the law
 * takes uint32_t and masks & 0xff (family low-byte rule: no byte-width
 * scalar params, explicit mask). The desc-bit test is `shr eax,6` LOGICAL + `test al,1`
 * on a register — the gate input is the FULL desc_flags dword, law
 * ((flags >> 6) & 1). All other compares are FULL dword equality
 * (0xd, 1, 4, -0xa, 6, 4, 5) — signedness cannot matter for any of them
 * (0x100 / 0x80000000 / 0xfffffff6 compare by value).
 *
 * 0x74bae0 stays HOST (identify-zhl EMPTY; not in any family): cdecl-ish
 * thiscall on Game (ecx = g_Game from BSS), plain `ret`, reads
 * [g_Game+0x269c8] {2,3} first; its full-dword result is lawed as the
 * `host_result` input. The room byte field 0x7228 is written by the
 * 0x7f2390-band effect copy (cpu-dump 007f2390.txt, `and al,1;
 * mov byte ptr [edi+0x7228],al`); documented as a Room byte flag, not
 * promoted. */
int32_t isaac_frame_effect_820720_zero_gate(uint32_t game_0,
                                            uint32_t chapter);

int32_t isaac_frame_effect_820720_host_zero_gate(int32_t host_result,
                                                 int32_t game_18304);

int32_t isaac_frame_effect_820720_room_5c_gate(int32_t room_type_8,
                                               uint32_t room_byte_7228);

int32_t isaac_frame_effect_820720_chapter_42_gate(uint32_t chapter);

int32_t isaac_frame_effect_820720_desc_bit6(uint32_t desc_flags_44);

uint32_t isaac_frame_effect_820720_result(uint32_t game_0, uint32_t chapter,
                                          int32_t host_result,
                                          int32_t game_18304,
                                          int32_t room_type_8,
                                          uint32_t room_byte_7228,
                                          uint32_t desc_flags_44);

typedef struct IsaacFrameEffect820720Plan {
  int32_t deref_game;   /* 1 — [0xc71678] + [g_Game+0] read @0x820721/0x82072a */
  int32_t deref_chapter; /* 1 — re-read @0x820764 UNCONDITIONAL; the FIRST
                            read @0x82072f is gated on game_0==0xd */
  int32_t zero_gate;    /* game_0==0xd && chapter==1 -> ret 0 */
  int32_t host_74bae0_fires; /* 1 iff zero_gate==0 — call @0x820737 runs
                                only off the first zero arm */
  int32_t deref_18304;  /* 1 iff zero_gate==0 && host_result==4 — the
                           [g+0x18304] read @0x820741 runs only there */
  int32_t host_zero;    /* host_result==4 && game_18304==-10 -> ret 0 */
  int32_t deref_room;   /* 1 iff zero_gate==0 && host_zero==0 — the
                           [g+0x18300] read @0x82074f runs only when both
                           ret-0 arms miss */
  int32_t room_5c;      /* room_type_8==6 || byte room_7228 != 0 -> ret 0x5c */
  int32_t chapter_42;   /* chapter==4 || chapter==5 -> ret 0x2a */
  int32_t desc_deref;   /* 1 iff zero==0 && host_zero==0 && room_5c==0 &&
                           chapter_42==0 — [this+4] read @0x820771 runs
                           ONLY on the final arm */
  int32_t flag_deref;   /* = desc_deref — [desc+0x44] @0x82077b likewise */
  int32_t desc_bit6;    /* ((flags >> 6) & 1) — valid when desc_deref */
  uint32_t result;      /* 0 / 0x5c / 0x2a / 0x61 / 0x53 in arm order */
  int32_t host_calls;   /* always 1 — 0x74bae0 stays host */
  int32_t pure_complete; /* always 0 — the host call is inside the body */
} IsaacFrameEffect820720Plan;

void isaac_frame_effect_820720_entry_plan(IsaacFrameEffect820720Plan* out,
                                          uint32_t game_0, uint32_t chapter,
                                          int32_t host_result,
                                          int32_t game_18304,
                                          int32_t room_type_8,
                                          uint32_t room_byte_7228,
                                          uint32_t desc_flags_44);

enum {
  ISAAC_FRAME_EFFECT_820720_VA = 0x00820720u,
  ISAAC_FRAME_EFFECT_820720_END_VA = 0x0082079cu, /* past final `ret` @ 0x82079b */
  ISAAC_FRAME_EFFECT_820720_NEXT_VA = 0x008207a0u, /* after int3 pad 0x82079c..0x82079f */
  ISAAC_FRAME_EFFECT_820720_RET_BYTES = 0,      /* plain `ret` x4, zero stack args */
  ISAAC_FRAME_EFFECT_820720_INSN_COUNT = 46,
  ISAAC_FRAME_EFFECT_820720_BYTE_LEN = 124,
  ISAAC_FRAME_EFFECT_820720_CALL_INSNS = 1,
  ISAAC_FRAME_EFFECT_820720_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_820720_RAW_DWORD_HITS = 0,
  ISAAC_FRAME_EFFECT_820720_CALLSITE_A_VA = 0x007fee72u,
  ISAAC_FRAME_EFFECT_820720_CALLSITE_B_VA = 0x007ff7feu,
  ISAAC_FRAME_EFFECT_820720_HOST_74BAE0_VA = 0x0074bae0u,
  ISAAC_FRAME_EFFECT_820720_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_820720_GAME_0_EXPECT = 0xd,  /* cmp [g_Game+0],0xd */
  ISAAC_FRAME_EFFECT_820720_CHAPTER_1_EXPECT = 1, /* cmp [g_Game+4],1 */
  ISAAC_FRAME_EFFECT_820720_HOST_RESULT_EXPECT = 4,
  ISAAC_FRAME_EFFECT_820720_GAME_18304_OFF = 0x18304u, /* = ROOM_INDEX_A_OFF */
  ISAAC_FRAME_EFFECT_820720_GAME_18304_EXPECT = -10,   /* 0xfffffff6 */
  ISAAC_FRAME_EFFECT_820720_ROOM_PTR_OFF = 0x18300u,   /* = ROOM_PTR_OFF */
  ISAAC_FRAME_EFFECT_820720_ROOM_TYPE_OFF = 0x8,       /* [room+8] type */
  ISAAC_FRAME_EFFECT_820720_ROOM_TYPE_5C = 6,
  ISAAC_FRAME_EFFECT_820720_ROOM_7228_OFF = 0x7228u,   /* byte flag (BYTE gate) */
  ISAAC_FRAME_EFFECT_820720_CHAPTER_OFF = 0x4,         /* [g_Game+4] = chapter */
  ISAAC_FRAME_EFFECT_820720_DESC_OFF = 0x4,            /* [this+4] Room desc */
  ISAAC_FRAME_EFFECT_820720_DESC_FLAG_OFF = 0x44,      /* = ROOM_DESC_FLAG_OFF */
  ISAAC_FRAME_EFFECT_820720_FLAG_BIT = 6,              /* shr eax,6; test al,1 */
  ISAAC_FRAME_EFFECT_820720_RESULT_ZERO = 0,           /* xor eax,eax @0x82074b */
  ISAAC_FRAME_EFFECT_820720_RESULT_5C = 0x5c,          /* 92 */
  ISAAC_FRAME_EFFECT_820720_RESULT_2A = 0x2a,          /* 42 */
  ISAAC_FRAME_EFFECT_820720_RESULT_BIT6 = 0x61,        /* 97 — cmovne value */
  ISAAC_FRAME_EFFECT_820720_RESULT_CLEAR = 0x53,       /* 83 */
  ISAAC_FRAME_EFFECT_820720_RET_ZERO_VA = 0x0082074eu,
  ISAAC_FRAME_EFFECT_820720_RET_BIT6_VA = 0x0082078bu,
  ISAAC_FRAME_EFFECT_820720_RET_2A_VA = 0x00820793u,
  ISAAC_FRAME_EFFECT_820720_RET_5C_VA = 0x0082079bu
};

/* ABI v30. (A) Pure decision seams of FUN_008207a0 (0x008207a0..0x008208b2,
 * 86 insns / 275 bytes / 0 resyncs / 5 calls / 0 indirect / 1 plain `ret`
 * @ 0x8208b2 / 4 field stores + 1 RMW / 2 direct callers 0x5fa76f +
 * 0x70088f / 0 raw dword hits), the SEH intro-action body first recorded
 * (uncensused) in the v29 frontier note. Bounded census:
 * census-8207a0-body.json in frame-effect-v30-8207a0. The Ghidra status
 * record's 1713 cBytes includes the __try/__except funclets; the main
 * body's machine extent is 275 B. NOT PURE-OPEN — 5 direct calls and two
 * stateful store sites ((1) the re-entry flag `or [edi+0x44],0x40`,
 * (2) the entity loop [array[i]+0x450]=1) sit inside; the translated
 * surface is the decision-seams class (v20 style): the four-gate entry
 * conjunction that selects the whole action block, the desc-value arg
 * formation for the family's own 0x6fe410 dispatcher call, the post-loop
 * byte gate that selects the 0xa648b0 allocator call, and the constant
 * result. The exception path stays host (v3 rule): the prologue registers
 * the handler 0xaf1690 (a GS-cookie trampoline, `xor ecx,eax` +
 * __security_check_cookie style) and `mov dword ptr [ebp-4],0` @ 0x820890
 * leaves the guarded region before the final allocator call.
 *
 * Convention: thiscall, ecx = Room receiver (mov ebx,ecx @ 0x8207c8;
 * caller-2 0x70088f loads ecx = [g_Game+0x18300] directly, caller-1
 * 0x5fa76f loads it via the Game getter 0x407480 `mov eax,[ecx+0x18300];
 * ret` — both pass the room), ZERO stack args, plain `ret`, result ALWAYS
 * 0 (single merge point 0x82089f `xor al,al`; both callers ignore it).
 * Instruction stream (capstone 5.0.7 / CS_MODE_32, linear decode,
 * 0 resyncs):
 *
 *   0x008207a0  push ebp ; mov ebp,esp ; push -1 ; push 0xaf1690 ;
 *   0x008207aa  mov eax,fs:[0] ; push eax ; sub esp,0x18 ; push ebx ;
 *   0x008207b7  mov eax,[0xbf93b4] ; xor eax,ebp ; push eax ;
 *   0x008207bf  lea eax,[ebp-0xc] ; mov fs:[0],eax   ; SEH + GS prologue
 *   0x008207c8  mov ebx,ecx               ; this = Room
 *   0x008207ca  mov esi,[0xc71678]        ; g_Game
 *   0x008207d0  cmp dword [esi],1 ; jne 0x82089f   ; [g_Game+0] == 1
 *                                           ;   (FULL dword) -> gate A
 *   0x008207d9  test dword [esi+0x1839c],0x10000 ; je 0x82089f
 *                                           ;   bit 16 (FULL dword) -> B
 *   0x008207e9  mov eax,[esi+0x18304] ; cmp eax,[esi+0x182d0] ; jne 0x82089f
 *                                           ;   equality (FULL dword) -> C
 *   0x008207fb  mov edi,[esi+0x1adbc] ; test byte [edi+0x44],0x40 ; jne 0x82089f
 *                                           ;   BYTE gate, bit 6 CLEAR -> D
 *   0x0082080b  lea eax,[ebp-0x14] ; push eax ; call 0x812d00  ; HOST(out)
 *   0x00820814  or dword [edi+0x44],0x40    ; re-entry flag store (stateful)
 *   0x00820818  mov eax,[ebx+4] ; test eax,eax ; je 0x820822 ;
 *   0x0082081f  mov eax,[eax+0x5c]          ; desc select: desc ? [desc+0x5c] : 0
 *   0x00820822  push 0 ; push eax ; push 0 ; push 0 ; push 0xc7b640 ;
 *   0x0082082e  lea eax,[ebp-0x14] ; mov ecx,esi ; push eax ; push 0x6e ;
 *   0x00820836  push 5 ; call 0x6fe410      ; FAMILY v10 dispatcher,
 *                                           ;   ecx = g_Game, pack =
 *                                           ;   (5, 0x6e, [ebp-0x14],
 *                                           ;    0xc7b640, 0, 0,
 *                                           ;    desc_value, 0)
 *   0x0082083d  mov ecx,[0xc71678] ; push 8 ; call 0x703670  ; HOST(g_Game, 8)
 *   0x0082084a  push 0 ; push 0 ; push -1 ; push 0x73 ; push 0x3e8 ;
 *   0x00820857  lea eax,[ebp-0x24] ; lea ecx,[ebx+0x1218] ; push eax ;
 *   0x00820861  call 0x41af60             ; HOST(ecx=[this+0x1218],
 *                                          ;   out struct @ [ebp-0x24]:
 *                                          ;   +0 byte flag, +0x4 array,
 *                                          ;   +0xc count)
 *   0x00820866  mov esi,[ebp-0x18] ; xor ecx,ecx ; mov edx,[ebp-0x20] ;
 *   0x0082086e  test esi,esi ; je 0x820884
 *   0x00820872  mov eax,[edx+ecx*4] ; inc ecx ; mov [eax+0x450],1 ;
 *   0x00820880  cmp ecx,esi ; jb 0x820872    ; UNSIGNED loop: count-bounded
 *                                           ;   stateful store (host)
 *   0x00820884  cmp byte [ebp-0x24],0 ; jne 0x82089f ; BYTE gate -> E
 *   0x0082088a  push 0 ; push 0 ; mov cl,1 ; mov [ebp-4],0 ;
 *   0x00820897  call 0xa648b0 ; add esp,8   ; v8-known guest allocator,
 *                                           ;   fires iff the byte is 0
 *   0x0082089f  xor al,al ; mov ecx,[ebp-0xc] ; mov fs:[0],ecx ; pop ecx ;
 *   0x008208ab  pop edi ; pop esi ; pop ebx ; mov esp,ebp ; pop ebp ; ret
 *
 * Caller formation (caller-census.py, lea-corrected):
 *   caller-1 0x5fa76f: `mov ecx,[0xc71678]; call 0x407480; mov ecx,eax;
 *   call 0x8207a0` — 0x407480 is the trivial `mov eax,[ecx+0x18300]; ret`
 *   Room getter; the result of the call is ignored (jmp 0x5fa9b5).
 *   caller-2 0x70088f: `mov ecx,[0xc71678]; mov ecx,[ecx+0x18300];
 *   call 0x8207a0` — direct [g_Game+0x18300] Room load. Both receivers
 *   are the Room; [this+4] is the family ROOM_DESC_FLAG_OFF chain and
 *   [this+0x1218] feeds the 0x41af60 host receiver.
 *
 * Byte-gate note: TWO byte-width memory ops — `test byte ptr
 * [edi+0x44],0x40` (entry gate D on the Game-owned flag object
 * [[g_Game+0x1adbc]+0x44]) and `cmp byte ptr [ebp-0x24],0` (post-loop
 * gate E on the 0x41af60 out byte) — both lawed as uint32_t inputs
 * masked & 0xff (family low-byte rule). `test dword ptr
 * [esi+0x1839c],0x10000` is a FULL-dword bit test (law ((flags >> 16)
 * & 1)). Every other comparison is FULL-dword equality (==1, a == b) —
 * signedness cannot matter for any of them.
 *
 * Host leaves, all address-stable, all stay HOST:
 *   0x812d00  — one stack arg (out ptr); reads [g_Game+0x18300] ->
 *              [room+4] desc chain internally; fills [ebp-0x14]
 *   0x6fe410  — the family's own v10 dispatcher (its seams are already
 *              lawed there; this call site only forms the pack)
 *   0x703670  — game host, one stack arg (8), plain call
 *   0x41af60  — SEH host (handler 0xaf1635), thiscall ecx = [this+0x1218],
 *              6 stack args incl. the out struct at [ebp-0x24]
 *   0xa648b0  — v8-known guest allocator (reads [0xc7de78]); fires iff
 *              the post-loop byte gate passes; cl = 1 for the call
 * The entity store loop (0x820866..0x820882, [array[i]+0x450]=1,
 * count-bounded, UNSIGNED jb) is a stateful write of host outputs — NOT
 * translated; the count/array pair are lawed only as entry-gate-scoped
 * side-effect inputs, never dereferenced by a law.
 *
 * (B) FUN_008208c0 (0x008208c0..0x008208d2, 4 insns / 19 bytes /
 * 0 resyncs / 0 calls / 0 indirect / 1 plain `ret` @ 0x8208d2 /
 * 0 stores / 2 direct callers 0x5f5b31 + 0x6ca104 / 1 raw dword hit
 * @ 0x86c8c3 — the imm32 of `push 0x8208c0` @ 0x86c8c2, a callback
 * registration table), the next pure sibling after the 0x8207a0 int3 pad
 * (0x8208b3..0x8208bf). PURE-OPEN — the whole body translates.
 *
 * Convention: thiscall, ecx = Room receiver (both callers load eax =
 * [g_Game+0x18300] via the 0x407480 getter then mov ecx,eax), ZERO stack
 * args. Instruction stream:
 *
 *   0x008208c0  movss xmm0,[ecx+0x7240]   ; f32 room field (FULL dword)
 *   0x008208c8  comiss xmm0,[0xba9fe4]    ; vs +0.0f (bits 0x00000000 —
 *                                           ;   CORRECTED v31: measured from
 *                                           ;   .rdata 0x7a85e4; the v30
 *                                           ;   text said -18.0f/0xc1900000
 *                                           ;   — that read mis-mapped the
 *                                           ;   .rdata offset through the
 *                                           ;   .text formula; Ghidra's
 *                                           ;   decompile of 0x8208c0 reads
 *                                           ;   `0.0 < *(float*)...` too)
 *   0x008208cf  seta al                   ; ordered && > ; NaN/equal -> 0
 *   0x008208d2  ret
 *
 * comiss sets ZF/PF/CF (unordered = all three set); seta is CF==0 &&
 * ZF==0, so the law is exactly `value > 0.0f` with NaN -> 0 — plain
 * IEEE strict-greater (every negative and -0.0 give 0; +denormal and
 * +Inf give 1). Both callers consume AL only (0x5f5b36
 * `movzx edx,al; test edx,edx`, 0x6ca109 `test al,al`); the upper 24
 * bits of EAX are unspecified at ret (seta writes AL only, movss never
 * touched EAX) — the law returns 0/1 in AL terms.
 *
 * identify-zhl FRESH (identify-zhl.json this dir): 0x8207a0, 0x8208c0
 * and the five host leaves (0x812d00 / 0x6fe410 / 0x703670 / 0x41af60 /
 * 0xa648b0) -> EMPTY, no family ownership conflicts; both siblings stay
 * address-stable. 0x8207a0's handler 0xaf1690 is a shared GS-cookie
 * trampoline (not a function boundary). */
int32_t isaac_frame_effect_8207a0_entry_gate(uint32_t game_0,
                                             uint32_t mode_flags_1839c,
                                             int32_t game_18304,
                                             int32_t game_182d0,
                                             uint32_t flag_byte_44);

/* desc ? [desc+0x5c] : 0 — the 0x6fe410 arg7 formation (PE 0x00820818 /
   0x0082081f; when desc == 0 the machine keeps eax from the test, 0). */
uint32_t isaac_frame_effect_8207a0_desc_value(uint32_t desc_ptr,
                                              uint32_t desc_5c);

/* PE 0x00820884 cmp byte [ebp-0x24],0 ; jne 0x82089f — 1 when the byte
   is 0: the 0xa648b0 allocator call fires. BYTE gate (mask & 0xff). */
int32_t isaac_frame_effect_8207a0_post_loop_gate(uint32_t out_byte_24);

/* Single merge point 0x0082089f xor al,al — the body ALWAYS returns 0;
   only the side effects vary. */
uint32_t isaac_frame_effect_8207a0_result(void);

typedef struct IsaacFrameEffect8207a0Plan {
  int32_t deref_game;       /* 1 — [0xc71678] + [g_Game+0] @0x8207ca/0x8207d0 */
  int32_t deref_mode_flags; /* 1 iff game_0==1 — [g+0x1839c] @0x8207d9 */
  int32_t deref_transition; /* 1 iff game_0==1 && bit16 — [g+0x18304] /
                               [g+0x182d0] @0x8207e9/0x8207ef */
  int32_t deref_flag_obj;   /* 1 iff ... && equal — [g+0x1adbc] @0x8207fb */
  int32_t deref_flag_byte;  /* = deref_flag_obj — byte [obj+0x44] @0x820801 */
  int32_t entry_gate;       /* the four-gate conjunction (A..D) */
  int32_t desc_deref;       /* 1 iff entry_gate — [this+4] @0x820818 */
  int32_t desc_5c_deref;    /* 1 iff entry_gate && desc != 0 — [desc+0x5c]
                               @0x82081f */
  uint32_t desc_value;      /* desc ? [desc+0x5c] : 0 — 0x6fe410 arg7 */
  int32_t post_loop_gate;   /* (byte & 0xff)==0 — the 0xa648b0 call fires */
  uint32_t result;          /* always 0 — xor al,al @0x82089f */
  int32_t host_calls;       /* always 5 — all five call sites stay host */
  int32_t pure_complete;    /* always 0 — host calls + stateful stores */
} IsaacFrameEffect8207a0Plan;

void isaac_frame_effect_8207a0_entry_plan(IsaacFrameEffect8207a0Plan* out,
                                          uint32_t game_0,
                                          uint32_t mode_flags_1839c,
                                          int32_t game_18304,
                                          int32_t game_182d0,
                                          uint32_t flag_byte_44,
                                          uint32_t desc_ptr,
                                          uint32_t desc_5c,
                                          uint32_t out_byte_24);

/* comiss xmm0,[0xba9fe4] + seta — 1 iff room_field_7240 > +0.0f,
   ordered (NaN -> 0, equal 0.0 -> 0; the +0.0f constant is the
   MEASURED .rdata value — CORRECTED v31, see the stream note). */
int32_t isaac_frame_effect_8208c0_above(float room_field_7240);

typedef struct IsaacFrameEffect8208c0Plan {
  int32_t deref_field;   /* always 1 — f32 [this+0x7240] read @0x8208c0 */
  int32_t above;         /* 0/1 — comiss+seta, ordered strict greater */
  int32_t host_calls;    /* always 0 */
  int32_t pure_complete; /* always 1 — whole body translated */
} IsaacFrameEffect8208c0Plan;

void isaac_frame_effect_8208c0_entry_plan(IsaacFrameEffect8208c0Plan* out,
                                          float room_field_7240);

enum {
  /* FUN_008207a0 SEH intro-action body (ABI v30). */
  ISAAC_FRAME_EFFECT_8207A0_VA = 0x008207a0u,
  ISAAC_FRAME_EFFECT_8207A0_END_VA = 0x008208b3u, /* past `ret` @ 0x8208b2 */
  ISAAC_FRAME_EFFECT_8207A0_NEXT_VA = 0x008208c0u, /* int3 pad 0x8208b3..0x8208bf */
  ISAAC_FRAME_EFFECT_8207A0_RET_BYTES = 0,    /* plain `ret`, zero stack args */
  ISAAC_FRAME_EFFECT_8207A0_INSN_COUNT = 86,
  ISAAC_FRAME_EFFECT_8207A0_BYTE_LEN = 275,
  ISAAC_FRAME_EFFECT_8207A0_CALL_INSNS = 5,
  ISAAC_FRAME_EFFECT_8207A0_INDIRECT_CALLS = 0,
  ISAAC_FRAME_EFFECT_8207A0_RET_VA = 0x008208b2u,
  ISAAC_FRAME_EFFECT_8207A0_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_8207A0_RAW_DWORD_HITS = 0,
  ISAAC_FRAME_EFFECT_8207A0_CALLSITE_A_VA = 0x005fa76fu,
  ISAAC_FRAME_EFFECT_8207A0_CALLSITE_B_VA = 0x0070088fu,
  ISAAC_FRAME_EFFECT_8207A0_HANDLER_VA = 0x00af1690u, /* pushed SEH handler */
  ISAAC_FRAME_EFFECT_8207A0_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_8207A0_GAME_0_EXPECT = 1,  /* cmp [g_Game+0],1 */
  ISAAC_FRAME_EFFECT_8207A0_MODE_FLAGS_OFF = 0x1839cu, /* bit 16 test */
  ISAAC_FRAME_EFFECT_8207A0_MODE_FLAG_BIT = 16, /* test 0x10000 */
  ISAAC_FRAME_EFFECT_8207A0_GAME_18304_OFF = 0x18304u, /* = ROOM_INDEX_A_OFF */
  ISAAC_FRAME_EFFECT_8207A0_GAME_182D0_OFF = 0x182d0u,
  ISAAC_FRAME_EFFECT_8207A0_GAME_FLAG_OBJ_OFF = 0x1adbcu,
  ISAAC_FRAME_EFFECT_8207A0_FLAG_OFF = 0x44u,      /* byte [obj+0x44] */
  ISAAC_FRAME_EFFECT_8207A0_FLAG_BIT = 6,          /* bit 6 within the byte */
  ISAAC_FRAME_EFFECT_8207A0_DESC_OFF = 0x4u,       /* [this+4] Room desc */
  ISAAC_FRAME_EFFECT_8207A0_DESC_5C_OFF = 0x5cu,   /* [desc+0x5c] */
  ISAAC_FRAME_EFFECT_8207A0_RECEIVER_1218_OFF = 0x1218u, /* 0x41af60 this */
  ISAAC_FRAME_EFFECT_8207A0_ENTRY_END_VA = 0x0082080bu, /* past gate D */
  ISAAC_FRAME_EFFECT_8207A0_RESULT = 0,            /* xor al,al @0x82089f */
  ISAAC_FRAME_EFFECT_8207A0_HOST_812D00_VA = 0x00812d00u,
  ISAAC_FRAME_EFFECT_8207A0_HOST_6FE410_VA = 0x006fe410u, /* family v10 dispatcher */
  ISAAC_FRAME_EFFECT_8207A0_HOST_703670_VA = 0x00703670u,
  ISAAC_FRAME_EFFECT_8207A0_HOST_41AF60_VA = 0x0041af60u,
  ISAAC_FRAME_EFFECT_8207A0_HOST_A648B0_VA = 0x00a648b0u, /* v8-known allocator */
  ISAAC_FRAME_EFFECT_8207A0_DISPATCH_ARG1 = 5,
  ISAAC_FRAME_EFFECT_8207A0_DISPATCH_ARG2 = 0x6e,
  ISAAC_FRAME_EFFECT_8207A0_DISPATCH_ARG4_VA = 0x00c7b640u,
  ISAAC_FRAME_EFFECT_8207A0_OUT_ENTITY_FLAG_OFF = 0x450u, /* loop store */
  ISAAC_FRAME_EFFECT_8207A0_ENTITY_LOOP_END_VA = 0x00820882u, /* the jb */
  /* FUN_008208c0 float-above getter (ABI v30). */
  ISAAC_FRAME_EFFECT_8208C0_VA = 0x008208c0u,
  ISAAC_FRAME_EFFECT_8208C0_END_VA = 0x008208d3u, /* past `ret` @ 0x8208d2 */
  ISAAC_FRAME_EFFECT_8208C0_NEXT_VA = 0x008208e0u, /* int3 pad 0x8208d3..0x8208df */
  ISAAC_FRAME_EFFECT_8208C0_RET_BYTES = 0,    /* plain `ret`, zero stack args */
  ISAAC_FRAME_EFFECT_8208C0_INSN_COUNT = 4,
  ISAAC_FRAME_EFFECT_8208C0_BYTE_LEN = 19,
  ISAAC_FRAME_EFFECT_8208C0_CALL_INSNS = 0,
  ISAAC_FRAME_EFFECT_8208C0_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_8208C0_RAW_DWORD_HITS = 1, /* imm32 of `push 0x8208c0`
                                                   @ 0x86c8c2 (callback table) */
  ISAAC_FRAME_EFFECT_8208C0_CALLSITE_A_VA = 0x005f5b31u,
  ISAAC_FRAME_EFFECT_8208C0_CALLSITE_B_VA = 0x006ca104u,
  ISAAC_FRAME_EFFECT_8208C0_HIT_VA = 0x0086c8c3u,
  ISAAC_FRAME_EFFECT_8208C0_FIELD_OFF = 0x7240u,     /* f32 [this+0x7240] */
  ISAAC_FRAME_EFFECT_8208C0_CONST_VA = 0x00ba9fe4u,  /* +0.0f bits 0x00000000
                                                       — CORRECTED v31 (the
                                                       v30 -18.0f/0xc1900000
                                                       claim mis-mapped the
                                                       .rdata read) */
  ISAAC_FRAME_EFFECT_8208C0_CONST_BITS = 0x00000000u
};
/* ABI v31. (A) Pure laws of FUN_008208e0 (0x008208e0..0x008208e0+0x25,
 * 8 insns / 37 bytes / 0 resyncs / 1 call (0x740bc0) / 0 indirect /
 * 1 plain `ret` @ 0x820904 / 0 field stores / 2 direct callers 0x7fbd1f +
 * 0x80df46 / 1 raw dword hit @ 0x86c8e5 — the imm32 of `push 0x8208e0`
 * @ 0x86c8e4 in a callback-registration block whose name string @
 * 0xb73d2c reads "IsCurrentRoomLastBoss"), the sibling recorded at v30
 * as the next pure candidate after the 0x8208c0 int3 pad
 * (0x8208d3..0x8208df). PURE-OPEN — the whole body translates: the one
 * host call's RESULT is lawed as a caller-resolved input (v29
 * host-law class).
 *
 * Convention: thiscall, ecx = Room receiver (caller-1 0x7fbd1f `mov
 * ecx,esi` with the [esi+4] desc chain / [esi+8] type reads around it;
 * caller-2 0x80df46 `mov ecx,ebx` with a [ebx+8] read after — the v29
 * receiver shape), ZERO stack args, plain `ret`, result 0/1 in AL only
 * (sete al; both callers consume AL only: 0x7fbd24 `test al,al; jne`,
 * 0x80df4b `test al,al; je`). Instruction stream (capstone 5.0.7 /
 * CS_MODE_32, linear decode, 0 resyncs):
 *
 *   0x008208e0  mov ecx,[0xc71678]        ; g_Game (read #1)
 *   0x008208e6  push -1                   ; arg2 = -1 (dimension)
 *   0x008208e8  push dword [ecx+0x18304]  ; arg1 = [g_Game+0x18304] (idx)
 *   0x008208ee  call 0x740bc0             ; HOST Game::GetRoomByIdx(idx,-1)
 *   0x008208f3  mov ecx,[eax+8]           ; ret8 = caller-resolved [ret+8]
 *   0x008208f6  mov eax,[0xc71678]        ; g_Game (read #2)
 *   0x008208fb  cmp ecx,[eax+0x18314]     ; ret8 == [g_Game+0x18314]
 *   0x00820901  sete al
 *   0x00820904  ret
 *
 * Law: FULL-dword equality (ret8 == game_18314) -> 0/1 — the SAME value
 * shape as this family's v23 820170_probe_bit2_gate (PE 0x820224
 * "[0x740bc0 ret + 8] == [g+0x18314]") and the room family's 0x7f7a40
 * abort law (PE 0x7f7bf6). 0x740bc0 is EXACT ZHL Game/Level::
 * GetRoomByIdx (Game.zhl/Level.zhl 40-byte pattern) — stays HOST here
 * (render-shell v15 and the other families law its own islands);
 * its result, [g+0x18304] and [g+0x18314] are all caller-resolved.
 * Registration: `push 0x8208e0; push 0xb73d2c; mov ecx,eax;
 * call 0x8906f0` @ 0x86c8e4; the name is promoted in COMMENTS ONLY
 * (v7 convention; exported symbols keep the address-stable prefix).
 *
 * (B) Decision seams of FUN_00820910 (0x00820910..0x00820a99 —
 * TWO plain `ret 8`: the normalize exit @ 0x820a6f and the raw-copy
 * exit @ 0x820a98; 64 insns / 393 bytes / 0 resyncs / 5 direct calls
 * (0x6eef60, 0x417870 x2, 0x6fe410, 0x435a50) + 1 indirect
 * (`call dword [edi+0xc]`, vtable) / 3 field stores ([desc+0x44] |=
 * 0x4000 unconditional, [edi+0x334], [edi+0x338] path-selected) /
 * 2 direct callers 0x74baa7 + 0x8053be / 2 raw dword hits @ 0x86c918
 * (registration imm32) and @ 0x8911ea (Lua-helper immediate)), the
 * stateful RNG-draw body registered as "MamaMegaExplosion" (name @
 * 0xb73d18, `call 0x8911d0` Lua-C helper @ 0x86c923). NOT PURE-OPEN —
 * one MT19937 draw advances the stream, three stores and a vtable call
 * sit inside; the translated surface is the decision-seams class (v20
 * style): the flag-store rewrite, the GetPlayer gate + pack arg
 * formation, the sentinel probe, the sqrt-scale gate, and the census
 * plan. The 0x7ee band + 0x81ee20 dispatcher stay CLOSED per v26/v27;
 * 0x820aa0 / 0x820ac0 (the siblings after the 0x820a99..0x820a9f pad)
 * are recorded for the next unit, not lawed here.
 *
 * Convention: thiscall, ecx = Room receiver (caller-1 0x74baa7 loads
 * ecx = [g_Game+0x18300], caller-2 0x8053be passes its own Room edi),
 * TWO stack args, `ret 8` (result ignored by both callers):
 *   [ebp+8]  param_1 — float2 pointer (the sentinel-probe operand)
 *   [ebp+0xc] param_2 — FULL dword (0x417870 gate + pack arg)
 * Instruction stream (capstone 5.0.7 / CS_MODE_32, linear decode):
 *
 *   0x00820910  push ebp ; mov ebp,esp ; and esp,-8 ; sub esp,0xc ;
 *   0x0082091c  push ebx/esi/edi ; mov ebx,ecx
 *   0x0082091e  mov eax,[ebx+4] ; 0x00820921 or dword [eax+0x44],0x4000
 *                                           ; STATE store — desc flags
 *   0x00820928  call 0x6eef60               ; HOST genrand draw (stream
 *                                           ;   advances, one draw)
 *   0x0082092d  mov esi,eax
 *   0x0082092f  mov eax,[ebp+0xc] ; test eax,eax ; jne 0x820942
 *   0x00820936  mov ecx,[0xc71678] ; push eax ; call 0x417870
 *                                           ; HOST Game::GetPlayer fires
 *                                           ;   iff arg2 == 0 (FULL dword)
 *   0x00820942  mov ecx,[0xc71678] ; push 0 ; push esi ; mov esi,[ebp+8] ;
 *   0x0082094e  push 0 ; push eax ; push 0xc7b640 ; push esi ; push 0x7f ;
 *   0x00820959  push 0x3e8 ; call 0x6fe410  ; FAMILY v10 dispatcher,
 *                                           ;   ecx = g_Game, pack =
 *                                           ;   (0x3e8, 0x7f, [ebp+8],
 *                                           ;    0xc7b640, pack_arg, 0,
 *                                           ;    rng, 0)
 *   0x00820963  movss xmm0,[esi] ; 0x00820967 mov edi,eax
 *   0x00820969  ucomiss xmm0,[0xc7b640] ; 0x00820970 lahf ;
 *   0x00820971  test ah,0x44 ; 0x00820974 jp 0x820a72   ; probe 1
 *   0x0082097a  movss xmm0,[esi+4] ; 0x0082097f ucomiss
 *           xmm0,[0xc7b644] ; 0x00820986 lahf ; test ah,0x44 ;
 *   0x0082098a  jp 0x820a72                          ; probe 2
 *   0x00820990  mov ecx,[0xc71678] ; push 0 ; call 0x417870
 *                                           ; HOST GetPlayer (2nd) —
 *                                           ;   ONLY on the match path
 *   0x0082099d  movss xmm0,[ebx+0x1c] ; subss xmm0,[ebx+0x14] ;
 *   0x008209a7  movss xmm4,[eax+0x33c] ; movss xmm1,[eax+0x340] ;
 *   0x008209b7  lea esi,[eax+0x33c] ; movss [esp+0x14],xmm4 ;
 *   0x008209c3  mulss xmm0,[0xbaa2d0] ; addss xmm0,[ebx+0x14] ;
 *   0x008209d0  subss xmm4,xmm0                  ; cxm = room-center-X,
 *                                           ;   dx = px - cxm
 *   0x008209d4  movss xmm0,[ebx+0x20] ; subss xmm0,[ebx+0x18] ;
 *   0x008209de  movss [esp+0xc],xmm4 ; mulss xmm0,[0xbaa2d0] ;
 *   0x008209ec  addss xmm0,[ebx+0x18] ; subss xmm1,xmm0  ; cy, dy
 *   0x008209f5  movaps xmm0,xmm1 ; movss [esp+0x10],xmm1 ;
 *   0x008209fe  mulss xmm0,xmm1 ; movaps xmm1,xmm4 ; mulss xmm1,xmm4 ;
 *   0x00820a09  addss xmm0,xmm1                  ; dd = dy*dy + dx*dx
 *   0x00820a0d  call 0x435a50                    ; HOST CRT sqrt
 *   0x00820a12  comiss xmm0,[0xba9fe4] ; 0x00820a19 movss xmm2,
 *           [esp+0xc] ; 0x00820a1f jbe 0x820a3d ; sqrt_res > 0.0f gate
 *           (the 0.0f constant at 0xba9fe4 — measured bits 0x00000000,
 *           the same corrected constant as 8208c0; 200.0f @ 0xbaaa94)
 *   0x00820a21  movss xmm1,[0xbaaa94] ; divss xmm1,xmm0 ;
 *   0x00820a2d  movss xmm0,[esp+0x10] ; mulss xmm2,xmm1 ; mulss xmm0,xmm1
 *   0x00820a3b  jmp 0x820a43                    ; s = 200.0f/sqrt_res
 *   0x00820a3d  movss xmm0,[esp+0x10]           ; keep raw deltas
 *   0x00820a43  movss xmm1,[esp+0x14] ; mov ecx,edi ; addss xmm0,[esi+4] ;
 *   0x00820a50  mov eax,[edi] ; addss xmm1,xmm2 ; movss [edi+0x338],xmm0 ;
 *   0x00820a5e  movss [edi+0x334],xmm1 ; 0x00820a66 call dword [eax+0xc]
 *                                           ; HOST indirect vtable call
 *   0x00820a69  pop edi/esi/ebx ; mov esp,ebp ; pop ebp ; ret 8
 *   0x00820a72  movss xmm0,[esi] ; mov ecx,edi ; movss xmm1,[esi+4] ;
 *   0x00820a7d  mov eax,[edi] ; movss [edi+0x334],xmm0 ;
 *   0x00820a87  movss [edi+0x338],xmm1 ; call dword [eax+0xc] ;
 *   0x00820a92  pop edi/esi/ebx ; mov esp,ebp ; pop ebp ; ret 8
 *
 * LAHF/JP gate algebra (pinned in the tests): after `ucomiss`, AH =
 * SF:ZF:0:AF:0:PF:1:CF; `test ah,0x44` ANDs bit 6 (ZF) and bit 2 (PF);
 * `jp` trips iff the parity of the AND result is EVEN iff (ZF == PF).
 * Ordered equal gives (1,0) -> odd parity -> NO jump (fall into the
 * normalize path); ordered greater/less gives (0,0) -> even -> jump;
 * unordered NaN gives (1,1) -> even -> jump. So the normalize path runs
 * iff BOTH probes are ORDERED-EQUAL to the sentinel pair — the law is
 * exactly `(x0 == c0) && (x1 == c1)` in f32 IEEE equality (NaN ->
 * false); Ghidra's decompile reads the same (`(*param_1 == DAT) &&
 * (param_1[1] == DAT)`). Sentinel pair (`.data`, measured):
 * c0 @ 0xc7b640 = 0x3760371c, c1 @ 0xc7b644 = 0x37873770. The sentinel
 * law is implemented as PURE BIT equality: c0/c1 are positive normal
 * floats (neither zero nor NaN), so for every f32 x the IEEE equality
 * x == c and the bit equality x_bits == c_bits agree (NaN -> false in
 * both, +-0.0 -> false in both).
 *
 * Host leaves, all address-stable, all stay HOST: 0x6eef60 (EXACT ZHL
 * Isaac::genrand_int32 — one draw advances the stream; v19 capture
 * contract), 0x417870 (EXACT ZHL Game::GetPlayer — called twice: gated
 * on arg2==0 then unconditionally on the match path), 0x6fe410 (this
 * family's own v10 dispatcher — seams lawed there; only the pack is
 * formed), 0x435a50 (CRT sqrt platform primitive, room-family law —
 * result feedback as an input), the vtable slot 0xc (indirect, on the
 * 0x6fe410 result). The desc-flag OR and the two path stores stay
 * stateful (host); only their VALUES are lawed/described. Caller
 * formation (census-8208e0.py, lea-corrected):
 *   caller-1 0x74baa7: push [ebp+0xc]; push [ebp+8] (float2); moves
 *   [arg1] into a Game position, stores [g+0x18394]/[g+0x18398] and
 *   ors [g+0x1839c],0x4000, then ecx = [g+0x18300]; result ignored.
 *   caller-2 0x8053be: push 0 (arg2); push 0xc7b640 (arg1 = the
 *   SENTINEL ADDRESS — the probe compares the pair against itself, so
 *   sentinel_match is ALWAYS 1 there -> normalize path); ecx = edi
 *   (Room); then the 0x801ee0 / 0x800500 curse band (CLOSED, untouched)
 *   and the [edi+0x722c] counter dec. */
int32_t isaac_frame_effect_8208e0_sync_gate(uint32_t ret8,
                                            uint32_t game_18314);

typedef struct IsaacFrameEffect8208e0Plan {
  int32_t deref_game;     /* always 1 — [0xc71678] @0x8208e0 and @0x8208f6 */
  int32_t deref_18304;    /* always 1 — [g_Game+0x18304] pre-call arg @0x8208e8 */
  int32_t host_740bc0;    /* always 1 — GetRoomByIdx call @0x8208ee */
  int32_t deref_ret8;     /* always 1 — [host_ret+8] @0x8208f3 */
  int32_t deref_18314;    /* always 1 — [g_Game+0x18314] @0x8208fb */
  int32_t sync_gate;      /* 0/1 — (ret8 == game_18314), sete al */
  int32_t host_calls;     /* always 1 */
  int32_t pure_complete;  /* always 1 — whole body translated */
} IsaacFrameEffect8208e0Plan;

void isaac_frame_effect_8208e0_entry_plan(IsaacFrameEffect8208e0Plan* out,
                                          uint32_t ret8,
                                          uint32_t game_18314);

/* PE 0x00820921 or dword [eax+0x44],0x4000 — the unconditional
   [this+4] desc-flag store VALUE (the store stays stateful/host; the
   stored dword is a pure rewrite of the caller-resolved flags). */
uint32_t isaac_frame_effect_820910_desc_flags_rewrite(uint32_t flags);

/* PE 0x0082092f mov eax,[ebp+0xc] ; test eax,eax ; jne 0x820942 — the
   FIRST Game::GetPlayer call (0x417870, ecx = g_Game, pushed arg2)
   fires exactly when arg2 == 0. FULL dword. */
int32_t isaac_frame_effect_820910_getplayer_gate(uint32_t arg2);

/* The 0x6fe410 pack arg4 (PE 0x0082093c / 0x00820950): arg2 when
   nonzero, else the GetPlayer result (caller-resolved). */
uint32_t isaac_frame_effect_820910_pack_arg(uint32_t arg2,
                                            uint32_t host_player);

/* PE 0x00820969/0x0082097f ucomiss + 0x00820971/0x00820987 lahf ;
   test ah,0x44 ; jp — lahf/jp algebra in the v31 block: the normalize
   path runs iff BOTH probes are ORDERED-EQUAL; the law is
   (x0 == c0) && (x1 == c1) with c0 = 0x3760371c, c1 = 0x37873770,
   implemented as BIT equality (equivalent for these constants — see
   the block note). Inputs are raw f32 bits (uint32_t). */
int32_t isaac_frame_effect_820910_sentinel_match(uint32_t x0_bits,
                                                 uint32_t x1_bits);

/* PE 0x00820a12 comiss xmm0,[0xba9fe4] (+0.0f, measured — the same
   corrected constant as 8208c0) ; jbe 0x820a3d — the 200.0f/sqrt_res
   scale (0xbaaa94 = 200.0f) runs only when the host sqrt result is
   ORDERED > 0.0f (NaN and -0.0 keep 1.0f). The result is an f32. */
float isaac_frame_effect_820910_dist_scale(uint32_t sqrt_res_bits);

typedef struct IsaacFrameEffect820910Plan {
  int32_t deref_desc;      /* always 1 — [this+4] @0x82091e */
  int32_t store_flags;     /* always 1 — [desc+0x44] |= 0x4000 @0x820921 */
  int32_t getplayer_gate;  /* 0/1 — (arg2 == 0) fires the first 0x417870 */
  int32_t draw;            /* always 1 — 0x6eef60 @0x820928, stream draw */
  int32_t deref_param1;    /* always 1 — the float2 probe [arg1]/[arg1+4] */
  int32_t sentinel_match;  /* 0/1 — (x0==c0)&&(x1==c1): normalize vs raw */
  int32_t deref_player;    /* 1 iff match — the 2nd 0x417870 result
                              [+0x33c]/[+0x340] on the normalize path */
  int32_t dist_gate;       /* 0/1 — (sqrt_res > 0.0f), the 200/sqrt scale */
  int32_t host_calls;      /* always 6 — 5 direct + 1 indirect [vt+0xc] */
  int32_t pure_complete;   /* always 0 */
} IsaacFrameEffect820910Plan;

void isaac_frame_effect_820910_entry_plan(IsaacFrameEffect820910Plan* out,
                                          uint32_t arg2,
                                          uint32_t x0_bits,
                                          uint32_t x1_bits,
                                          uint32_t sqrt_res_bits);

enum {
  /* FUN_008208e0 Room::IsCurrentRoomLastBoss (ABI v31). */
  ISAAC_FRAME_EFFECT_8208E0_VA = 0x008208e0u,
  ISAAC_FRAME_EFFECT_8208E0_END_VA = 0x00820905u, /* past `ret` @ 0x820904 */
  ISAAC_FRAME_EFFECT_8208E0_NEXT_VA = 0x00820910u, /* int3 pad 0x820905..0x82090f */
  ISAAC_FRAME_EFFECT_8208E0_RET_BYTES = 0,  /* plain `ret`, zero stack args */
  ISAAC_FRAME_EFFECT_8208E0_INSN_COUNT = 8,
  ISAAC_FRAME_EFFECT_8208E0_BYTE_LEN = 37,
  ISAAC_FRAME_EFFECT_8208E0_CALL_INSNS = 1,
  ISAAC_FRAME_EFFECT_8208E0_INDIRECT_CALLS = 0,
  ISAAC_FRAME_EFFECT_8208E0_RET_VA = 0x00820904u,
  ISAAC_FRAME_EFFECT_8208E0_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_8208E0_RAW_DWORD_HITS = 1, /* imm32 @0x86c8e5
                                                   (`push 0x8208e0` @0x86c8e4) */
  ISAAC_FRAME_EFFECT_8208E0_CALLSITE_A_VA = 0x007fbd1fu,
  ISAAC_FRAME_EFFECT_8208E0_CALLSITE_B_VA = 0x0080df46u,
  ISAAC_FRAME_EFFECT_8208E0_HIT_VA = 0x0086c8e5u,
  ISAAC_FRAME_EFFECT_8208E0_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_8208E0_GAME_18304_OFF = 0x18304u, /* host arg1 */
  ISAAC_FRAME_EFFECT_8208E0_HOST_ARG2 = 0xffffffffu, /* push -1 (dim) */
  ISAAC_FRAME_EFFECT_8208E0_RET8_OFF = 0x8u,      /* [host_ret+8] */
  ISAAC_FRAME_EFFECT_8208E0_GAME_18314_OFF = 0x18314u,
  ISAAC_FRAME_EFFECT_8208E0_HOST_740BC0_VA = 0x00740bc0u, /* GetRoomByIdx */
  ISAAC_FRAME_EFFECT_8208E0_LUA_NAME_VA = 0x00b73d2cu, /* "IsCurrentRoomLastBoss" */
  ISAAC_FRAME_EFFECT_8208E0_REG_HELPER_VA = 0x008906f0u, /* registration call */
  /* FUN_00820910 Room::MamaMegaExplosion (ABI v31). */
  ISAAC_FRAME_EFFECT_820910_VA = 0x00820910u,
  ISAAC_FRAME_EFFECT_820910_END_VA = 0x00820a99u, /* past `ret 8` @0x820a98 */
  ISAAC_FRAME_EFFECT_820910_NEXT_VA = 0x00820aa0u, /* int3 pad 0x820a99..0x820a9f */
  ISAAC_FRAME_EFFECT_820910_RET_BYTES = 8,
  ISAAC_FRAME_EFFECT_820910_INSN_COUNT = 64,
  ISAAC_FRAME_EFFECT_820910_BYTE_LEN = 393,
  ISAAC_FRAME_EFFECT_820910_CALL_INSNS = 5,  /* direct calls */
  ISAAC_FRAME_EFFECT_820910_INDIRECT_CALLS = 1, /* [vt+0xc] */
  ISAAC_FRAME_EFFECT_820910_RET_VA = 0x00820a98u, /* the raw-copy exit */
  ISAAC_FRAME_EFFECT_820910_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_820910_RAW_DWORD_HITS = 2, /* 0x86c918 + 0x8911ea */
  ISAAC_FRAME_EFFECT_820910_CALLSITE_A_VA = 0x0074baa7u,
  ISAAC_FRAME_EFFECT_820910_CALLSITE_B_VA = 0x008053beu,
  ISAAC_FRAME_EFFECT_820910_HIT_A_VA = 0x0086c918u,
  ISAAC_FRAME_EFFECT_820910_HIT_B_VA = 0x008911eau,
  ISAAC_FRAME_EFFECT_820910_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_820910_DESC_OFF = 0x4u,     /* [this+4] Room desc */
  ISAAC_FRAME_EFFECT_820910_DESC_FLAG_OFF = 0x44u,
  ISAAC_FRAME_EFFECT_820910_DESC_FLAG_BITS = 0x4000u,
  ISAAC_FRAME_EFFECT_820910_HOST_6EEF60_VA = 0x006eef60u, /* genrand */
  ISAAC_FRAME_EFFECT_820910_HOST_417870_VA = 0x00417870u, /* GetPlayer */
  ISAAC_FRAME_EFFECT_820910_HOST_6FE410_VA = 0x006fe410u, /* family v10 */
  ISAAC_FRAME_EFFECT_820910_HOST_435A50_VA = 0x00435a50u, /* CRT sqrt */
  ISAAC_FRAME_EFFECT_820910_DISPATCH_ARG1 = 0x3e8,
  ISAAC_FRAME_EFFECT_820910_DISPATCH_ARG2 = 0x7f,
  ISAAC_FRAME_EFFECT_820910_DISPATCH_ARG4_VA = 0x00c7b640u,
  ISAAC_FRAME_EFFECT_820910_SENTINEL_X0_VA = 0x00c7b640u,
  ISAAC_FRAME_EFFECT_820910_SENTINEL_X1_VA = 0x00c7b644u,
  ISAAC_FRAME_EFFECT_820910_SENTINEL_X0_BITS = 0x3760371cu, /* 1.3364e-05f */
  ISAAC_FRAME_EFFECT_820910_SENTINEL_X1_BITS = 0x37873770u, /* 1.6119e-05f */
  ISAAC_FRAME_EFFECT_820910_SCALE_200_VA = 0x00baaa94u, /* 200.0f */
  ISAAC_FRAME_EFFECT_820910_SCALE_200_BITS = 0x43480000u,
  ISAAC_FRAME_EFFECT_820910_ZERO_CONST_VA = 0x00ba9fe4u, /* +0.0f (measured) */
  ISAAC_FRAME_EFFECT_820910_VTABLE_SLOT = 0xcu,
  ISAAC_FRAME_EFFECT_820910_PLAYER_X_OFF = 0x33cu,
  ISAAC_FRAME_EFFECT_820910_PLAYER_Y_OFF = 0x340u,
  ISAAC_FRAME_EFFECT_820910_LUA_NAME_VA = 0x00b73d18u, /* "MamaMegaExplosion" */
  ISAAC_FRAME_EFFECT_820910_REG_HELPER_VA = 0x008911d0u /* Lua-C helper */
};
/* ABI v32. (A) Pure laws of FUN_00820aa0 (0x00820aa0..0x00820abc — 7
 * insns / 28 bytes / 0 resyncs / 0 calls / 0 indirect / 2 plain `ret`
 * @ 0x820ab4 + 0x820abb / 0 field stores / 0 direct callers (Lua-only:
 * the binding has no rel32 call site) / 1 raw dword hit @ 0x86c84c —
 * the imm32 of `push 0x820aa0` @ 0x86c84b in a registration block
 * whose name string @ 0xb73c94 reads "GetDungeonRockIdx"), the sibling
 * recorded at v31 as the next pure candidate after the 0x820910 int3
 * pad. PURE-OPEN: the two-branch getter is translated whole.
 *
 *   0x00820aa0  mov eax,[0xc71678]           ; g_Game (deref #1)
 *   0x00820aa5  test dword [eax+0x1839c],0x2000  ; FULL dword probe
 *   0x00820aaf  je  0x820ab5                 ; bit clear -> fallback
 *   0x00820ab1  or  eax,0xffffffff           ; ALWAYS -1 (eax = g_Game)
 *   0x00820ab4  ret
 *   0x00820ab5  mov eax,[ecx+0x768]          ; fallback [receiver+0x768]
 *   0x00820abb  ret
 *
 * Law: bit_gate = (flags_1839c & 0x2000) FULL dword; result =
 * bit ? -1 : rock768 with rock768 caller-resolved ([receiver+0x768] is
 * read ONLY on the clear-bit path). thiscall, ecx = the Room-shaped
 * Lua receiver, plain `ret`. The same dense flags field [g+0x1839c]
 * appears in the v31 record (0x820910 caller-1 ors 0x4000; the
 * 0x820ac0 caller-2 probes bit 0x1000000 directly after its call).
 * Registration: `push 0x820aa0; push 0xb73c94; mov ecx,eax;
 * call 0x88fd10` @ 0x86c84b; name in COMMENTS ONLY (v7 convention).
 *
 * (B) Decision seams of FUN_00820ac0 (0x00820ac0..0x00820bff — 79
 * insns / 319 bytes / 0 resyncs / 1 direct call 0x7ebd50 (EXACT 14-byte
 * ZHL `__thiscall bool Room::SpawnGridEntityDesc(int GridIndex,
 * GridEntityDesc *Desc)` — HOST) / 0 indirect / 1 plain `ret` @
 * 0x820bfe / 11 mov-stores / 2 direct callers 0x5a11af + 0x7f76fe /
 * 1 raw dword hit @ 0x86c93a (`push 0x820ac0` @ 0x86c939, name string
 * 0xb73e3c "TurnGold").
 *
 * SEH ASSESSMENT (this unit's question): the v31 frontier recorded this
 * body as "SEH-heavy"; direct decode CORRECTS that — the prologue is a
 * plain frame (`push ebp; mov ebp,esp; and esp,-8; sub esp,0xc8; push
 * esi/edi`): NO fs:[0] handler install, NO funclet/unwind registration,
 * NO GS cookie. The pure prefix before the first host effect (the two
 * aliased default-init stores) exists, so the prefix + the loop
 * decision surface land as seams (v30 0x8207a0 precedent); the host
 * call stays host.
 *
 *   0x00820ac0  push ebp ; mov ebp,esp ; and esp,-8 ; sub esp,0xc8
 *   0x00820acc  movaps xmm1,[0xbac7b0]      ; block A top: 1.0f x4
 *   0x00820ad3  lea edx,[esp+0x68]          ; tmp A
 *   0x00820ad7  movaps xmm0,[0xbabe60]      ; block A low
 *   0x00820ade  lea eax,[ecx+0x72a4]        ; dst A = this+0x72a4
 *   0x00820ae4  movaps xmm3,[0xbac7b0]      ; block B top: 1.0f x4
 *   0x00820aeb  cmp eax,edx ; 0x00820aed movaps xmm4,[0xbabe50]
 *   0x00820af4  push esi
 *   0x00820af5  mov dword [esp+0x2c],0 ; [esp+0x30],0 ; movq xmm2,[esp+0x2c]
 *   0x00820b0b  mov dword [esp+0x34],0 ; mov edx,[esp+0x34]
 *   0x00820b17  push edi ; mov [esp+0xc],ecx
 *   0x00820b1c  mov dword [esp+0x64],0 ; [esp+0x68],0 ; [esp+0x6c],0
 *   0x00820b34  je 0x820b45                ; ALIAS GATE A: dst!=tmp
 *   0x00820b36  movq [eax+0x20],xmm2 ; movups [eax],xmm1
 *   0x00820b3e  mov [eax+0x28],edx ; movups [eax+0x10],xmm0
 *   0x00820b45  lea eax,[ecx+0x72d0]       ; dst B
 *   0x00820b4b  lea esi,[esp+0xa0]         ; tmp B
 *   0x00820b52  cmp eax,esi ; 0x00820b54 je 0x820b65  ; ALIAS GATE B
 *   0x00820b56  movq [eax+0x20],xmm2 ; movups [eax],xmm1
 *   0x00820b5e  mov [eax+0x28],edx ; movups [eax+0x10],xmm0
 *   0x00820b65  xor esi,esi ; lea edi,[ecx+0x24]     ; grid ptr array
 *   0x00820b70  cmp esi,0x1bf ; 0x00820b76 ja 0x820be9 ; ENTRY UNSIGNED
 *   0x00820b78  mov eax,[edi] ; test eax,eax ; je 0x820be9 ; p==0 skip
 *   0x00820b7e  cmp dword [eax+4],0xe ; 0x00820b82 jne 0x820bc3
 *   0x00820b84  cmp dword [eax+8],3 ; 0x00820b88 je 0x820be9 ; skip
 *   0x00820b8a  movups xmm0,[eax+4] ; movups [esp+0x10],xmm0
 *   0x00820b93  mov dword [esp+0x14],3       ; pack slot 1 FORCED 3
 *   0x00820b9b  movups xmm0,[eax+0x14]
 *   0x00820b9f  lea eax,[esp+0x10] ; push eax ; push esi
 *   0x00820ba5  movups [esp+0x28],xmm0       ; tail @ Desc+0x20
 *   0x00820baa  call 0x7ebd50                ; HOST SpawnGridEntityDesc
 *   0x00820baf  movaps xmm3,[0xbac7b0] ; movaps xmm4,[0xbabe50]
 *   0x00820bbd  mov ecx,[esp+0xc] ; jmp 0x820be9
 *   0x00820bc3  add eax,0xe8 ; lea edx,[esp+0x44] ; cmp eax,edx
 *   0x00820bce  je 0x820be9                  ; ALIAS GATE C
 *   0x00820bd0  movq xmm0,[esp+0x64] ; mov edx,[esp+0x6c]
 *   0x00820bda  movq [eax+0x20],xmm0 ; movups [eax],xmm3
 *   0x00820be2  mov [eax+0x28],edx ; movups [eax+0x10],xmm4
 *   0x00820be9  inc esi ; add edi,4 ; cmp esi,0x1c0 ; jl 0x820b70
 *   0x00820bf9  pop edi ; pop esi ; mov esp,ebp ; pop ebp ; ret
 *
 * Constants (measured .rdata, imagebase-aware mapping — see the v31
 * correction note): block A = [1.0f x4 (0xbac7b0), 5.0f, 3.0f, 0.0f,
 * 0.8f (0xbabe60), 0, 0, 0] — dwords 0x3f800000 x4, 0x40a00000,
 * 0x40400000, 0x00000000, 0x3f4ccccd, 0, 0, 0; block B = [1.0f x4,
 * 3.0f, 1.8f, 0.0f, 0.8f (0xbabe50), 0, 0, 0]. Both 0x2c bytes; the
 * trailing zeros come from the zeroed stack locals [esp+0x2c..0x34] /
 * [esp+0x64..0x6c]. The three alias guards are the MSVC `cmp dst,tmp ;
 * je skip` copy-guards the compiler left when it folded a
 * default-constructed local into direct member stores — JIT-unreachable
 * in practice (stack cannot alias the object), translated as the
 * machine has it (v19 precedent), lawed as pointer inequality.
 *
 * The host-call pack (0x820b8e..0x820ba5) forms an 8-dword Desc:
 * [p+4], 3, [p+0xc], [p+0x10] then [p+0x14..0x23] at +0x20; the
 * +0x10..0x1f window is UNINITIALIZED stack in the machine — reproduced,
 * not corrected; the law covers the deterministic dwords only. Loop
 * bounds: entry open iff index <=u 0x1bf (cmp/ja UNSIGNED @0x820b70),
 * back-edge iff index < 0x1c0 (cmp/jl SIGNED @0x820bed). The kind/anim
 * compares are FULL dword (`cmp dword [p+4],0xe` / `cmp dword
 * [p+8],3`).
 *
 * Registration: `push 0x820ac0; push 0xb73e3c; mov ecx,eax;
 * call 0x88fdb0` @ 0x86c939 — "TurnGold" (comments only). The next
 * registration pushes 0x820c00 ("WorldToScreenPosition" @ 0xb73ddc,
 *  0x891290 @ 0x86c96c) — recorded for the next unit, NOT lawed here
 *  (LAWED under ABI v33: full census + law set in the v33 block below).
 * Caller formation (census-820aa0.py, lea-corrected):
 *   caller-1 0x5a11af: mov ecx,[0xc71678]; mov ecx,[ecx+0x18300];
 *   ZERO stack args; result ignored.
 *   caller-2 0x7f76fe: mov ecx,edi (Room); ZERO stack args; result
 *   ignored; gated by [room+0x1bb0]==0x3e && [g_Game+0x269c8]==3 &&
 *   [[room+4]+0x44] low bit; calls 0x820ac0 then probes
 *   [g_Game+0x1839c],0x1000000. */
int32_t isaac_frame_effect_820aa0_bit_gate(uint32_t flags_1839c);

uint32_t isaac_frame_effect_820aa0_result(uint32_t flags_1839c,
                                          uint32_t rock768);

typedef struct IsaacFrameEffect820aa0Plan {
  int32_t deref_game;     /* always 1 — [0xc71678] @0x820aa0 */
  int32_t deref_1839c;    /* always 1 — test dword [e+0x1839c],0x2000 @0x820aa5 */
  int32_t bit_gate;       /* 0/1 — (flags & 0x2000) != 0: the -1 path */
  int32_t deref_768;      /* 1 iff !gate — [ecx+0x768] fallback @0x820ab5 */
  int32_t host_calls;     /* always 0 */
  int32_t pure_complete;  /* always 1 — whole body translated */
} IsaacFrameEffect820aa0Plan;

void isaac_frame_effect_820aa0_entry_plan(IsaacFrameEffect820aa0Plan* out,
                                          uint32_t flags_1839c);

/* PE 0x00820aeb/0x00820b52/0x00820bcc cmp dst,tmp ; je skip — the three
   copy guards are FULL dword pointer inequality: the store runs iff
   dst != tmp (JIT-unreachable in practice, translated as the machine
   has it). */
int32_t isaac_frame_effect_820ac0_copy_gate(uint32_t dst, uint32_t tmp);

/* PE 0x00820b36..0x00820b41 / 0x00820b56..0x00820b61 — the 0x2c-byte
   default-init VALUES stored to [this+0x72a4] (block A) and
   [this+0x72d0] (block B). out[11] receives the 11 dwords; the stores
   themselves stay stateful/host. Block A: 1.0f x4, 5.0f, 3.0f, 0.0f,
   0.8f, 0, 0, 0; block B: 1.0f x4, 3.0f, 1.8f, 0.0f, 0.8f, 0, 0, 0. */
void isaac_frame_effect_820ac0_init_block_a(uint32_t out[11]);
void isaac_frame_effect_820ac0_init_block_b(uint32_t out[11]);

/* PE 0x00820b70/0x00820b76 cmp esi,0x1bf ; ja skip — the loop BODY
   entry guard is UNSIGNED: index <=u 0x1bf. */
int32_t isaac_frame_effect_820ac0_loop_entry_open(uint32_t index);

/* PE 0x00820bed/0x00820bf3 cmp esi,0x1c0 ; jl loop — the back-edge is
   SIGNED: index_next < 0x1c0. */
int32_t isaac_frame_effect_820ac0_loop_continue(int32_t index_next);

/* PE 0x00820b78/0x00820b7a test eax,eax ; je skip — FULL dword
   zero-test on the grid-cell pointer [this+0x24 + i*4]. */
int32_t isaac_frame_effect_820ac0_entry_nonzero(uint32_t p);

/* PE 0x00820b7e/0x00820b82 cmp dword [p+4],0xe ; jne rewrite — FULL
   dword kind compare: the SpawnGridEntityDesc arm. */
int32_t isaac_frame_effect_820ac0_kind_gate(uint32_t kind);

/* PE 0x00820b84/0x00820b88 cmp dword [p+8],3 ; je skip — FULL dword
   anim compare: equals 3 skips the host call. */
int32_t isaac_frame_effect_820ac0_anim_skip(uint32_t anim);

/* PE 0x00820b8e..0x00820ba5 — the 8 deterministic Desc dwords:
   [d0, 3, d_c, d_10, tail0, tail1, tail2, tail3] (slot 1 FORCED 3, the
   [esp+0x14]=3 store). The machine leaves the +0x10..0x1f window of
   the Desc uninitialized and places the tail at +0x20 — reproduced,
   not corrected; the law covers the deterministic dwords. */
void isaac_frame_effect_820ac0_grid_pack(uint32_t d0, uint32_t d_c,
                                         uint32_t d_10,
                                         const uint32_t tail[4],
                                         uint32_t out[8]);

typedef struct IsaacFrameEffect820ac0Plan {
  int32_t init_a;         /* always 1 — [this+0x72a4] block A @0x820b36 */
  int32_t init_b;         /* always 1 — [this+0x72d0] block B @0x820b56 */
  int32_t copy_gate_a;    /* 0/1 — dst_a != tmp_a @0x820aeb */
  int32_t copy_gate_b;    /* 0/1 — dst_b != tmp_b @0x820b52 */
  int32_t entry_nonzero;  /* 0/1 — [ptr] FULL zero-test @0x820b78 */
  int32_t kind_gate;      /* 0/1 — [p+4] == 0xe @0x820b7e */
  int32_t anim_skip;      /* 0/1 — [p+8] == 3 @0x820b84 */
  int32_t rewrite_arm;    /* 0/1 — !kind_gate: block B into [p+0xe8]
                             @0x820bc3 (alias gate C vs [esp+0x44]) */
  int32_t host_calls;     /* 1 site — 0x7ebd50, fires per open entry
                             (<= 0x1c0 times) */
  int32_t pure_complete;  /* always 0 */
} IsaacFrameEffect820ac0Plan;

void isaac_frame_effect_820ac0_entry_plan(IsaacFrameEffect820ac0Plan* out,
                                          uint32_t dst_a, uint32_t tmp_a,
                                          uint32_t dst_b, uint32_t tmp_b,
                                          uint32_t entry_ptr, uint32_t kind,
                                          uint32_t anim);

enum {
  /* FUN_00820aa0 Lua Room::GetDungeonRockIdx (ABI v32). */
  ISAAC_FRAME_EFFECT_820AA0_VA = 0x00820aa0u,
  ISAAC_FRAME_EFFECT_820AA0_END_VA = 0x00820abcu, /* past `ret` @ 0x820abb */
  ISAAC_FRAME_EFFECT_820AA0_NEXT_VA = 0x00820ac0u, /* int3 pad 0x820abc..0x820abf */
  ISAAC_FRAME_EFFECT_820AA0_RET_BYTES = 0,  /* plain `ret` x2, zero stack args */
  ISAAC_FRAME_EFFECT_820AA0_INSN_COUNT = 7,
  ISAAC_FRAME_EFFECT_820AA0_BYTE_LEN = 28,
  ISAAC_FRAME_EFFECT_820AA0_CALL_INSNS = 0,
  ISAAC_FRAME_EFFECT_820AA0_INDIRECT_CALLS = 0,
  ISAAC_FRAME_EFFECT_820AA0_RET_VA = 0x00820abbu, /* the fallback exit */
  ISAAC_FRAME_EFFECT_820AA0_DIRECT_CALLERS = 0, /* Lua-only binding */
  ISAAC_FRAME_EFFECT_820AA0_RAW_DWORD_HITS = 1, /* imm32 @0x86c84c
                                                   (`push 0x820aa0` @0x86c84b) */
  ISAAC_FRAME_EFFECT_820AA0_HIT_VA = 0x0086c84cu,
  ISAAC_FRAME_EFFECT_820AA0_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_820AA0_FLAGS_OFF = 0x1839cu, /* [g_Game+0x1839c] */
  ISAAC_FRAME_EFFECT_820AA0_FLAG_BIT = 0x2000u,   /* the tested bit */
  ISAAC_FRAME_EFFECT_820AA0_ROCK_OFF = 0x768u,    /* [receiver+0x768] */
  ISAAC_FRAME_EFFECT_820AA0_RESULT_NEG1 = 0xffffffffu, /* or eax,-1 */
  ISAAC_FRAME_EFFECT_820AA0_LUA_NAME_VA = 0x00b73c94u, /* "GetDungeonRockIdx" */
  ISAAC_FRAME_EFFECT_820AA0_REG_HELPER_VA = 0x0088fd10u, /* registration call */
  /* FUN_00820ac0 Lua Room::TurnGold (ABI v32). */
  ISAAC_FRAME_EFFECT_820AC0_VA = 0x00820ac0u,
  ISAAC_FRAME_EFFECT_820AC0_END_VA = 0x00820bffu, /* past `ret` @0x820bfe */
  ISAAC_FRAME_EFFECT_820AC0_NEXT_VA = 0x00820c00u, /* int3 pad 0x820bff */
  ISAAC_FRAME_EFFECT_820AC0_RET_BYTES = 0,
  ISAAC_FRAME_EFFECT_820AC0_INSN_COUNT = 79,
  ISAAC_FRAME_EFFECT_820AC0_BYTE_LEN = 319,
  ISAAC_FRAME_EFFECT_820AC0_CALL_INSNS = 1,  /* 0x7ebd50 */
  ISAAC_FRAME_EFFECT_820AC0_INDIRECT_CALLS = 0,
  ISAAC_FRAME_EFFECT_820AC0_RET_VA = 0x00820bfeu,
  ISAAC_FRAME_EFFECT_820AC0_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_820AC0_RAW_DWORD_HITS = 1, /* @0x86c93a */
  ISAAC_FRAME_EFFECT_820AC0_CALLSITE_A_VA = 0x005a11afu,
  ISAAC_FRAME_EFFECT_820AC0_CALLSITE_B_VA = 0x007f76feu,
  ISAAC_FRAME_EFFECT_820AC0_HIT_VA = 0x0086c93au,
  ISAAC_FRAME_EFFECT_820AC0_HOST_7EBD50_VA = 0x007ebd50u, /* SpawnGridEntityDesc */
  ISAAC_FRAME_EFFECT_820AC0_PTR_ARRAY_OFF = 0x24u,  /* [this+0x24] */
  ISAAC_FRAME_EFFECT_820AC0_GRID_COUNT = 0x1c0u,    /* 448 entries */
  ISAAC_FRAME_EFFECT_820AC0_BOUND_UNSIGNED = 0x1bfu, /* cmp/ja entry guard */
  ISAAC_FRAME_EFFECT_820AC0_KIND_VALUE = 0xeu,      /* [p+4] == 0xe */
  ISAAC_FRAME_EFFECT_820AC0_ANIM_VALUE = 3,         /* [p+8] == 3 */
  ISAAC_FRAME_EFFECT_820AC0_BLOCK_A_OFF = 0x72a4u,  /* init dst A */
  ISAAC_FRAME_EFFECT_820AC0_BLOCK_B_OFF = 0x72d0u,  /* init dst B */
  ISAAC_FRAME_EFFECT_820AC0_BLOCK_DWORDS = 0xbu,    /* 11 dwords = 0x2c B */
  ISAAC_FRAME_EFFECT_820AC0_REWRITE_TARGET_OFF = 0xe8u, /* [p+0xe8] */
  ISAAC_FRAME_EFFECT_820AC0_PACK_SLOT1 = 3,         /* forced slot 1 */
  ISAAC_FRAME_EFFECT_820AC0_CONST_VEC_A_VA = 0x00bac7b0u, /* 1.0f x4 */
  ISAAC_FRAME_EFFECT_820AC0_CONST_VEC_A0_VA = 0x00babe60u, /* block A low */
  ISAAC_FRAME_EFFECT_820AC0_CONST_VEC_B0_VA = 0x00babe50u, /* block B low */
  ISAAC_FRAME_EFFECT_820AC0_ONE_BITS = 0x3f800000u,  /* 1.0f */
  ISAAC_FRAME_EFFECT_820AC0_BLOCK_A_D4 = 0x40a00000u, /* 5.0f */
  ISAAC_FRAME_EFFECT_820AC0_THREE_BITS = 0x40400000u, /* 3.0f */
  ISAAC_FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS = 0x3f4ccccdu, /* 0.8f */
  ISAAC_FRAME_EFFECT_820AC0_BLOCK_B_D5 = 0x3fe66666u, /* 1.8f */
  ISAAC_FRAME_EFFECT_820AC0_LUA_NAME_VA = 0x00b73e3cu, /* "TurnGold" */
  ISAAC_FRAME_EFFECT_820AC0_REG_HELPER_VA = 0x0088fdb0u, /* registration call */
  /* FUN_00820c00 Lua Room::WorldToScreenPosition (ABI v33). */
  ISAAC_FRAME_EFFECT_820C00_VA = 0x00820c00u,
  ISAAC_FRAME_EFFECT_820C00_END_VA = 0x00820d28u, /* past `ret 0xc` @0x820d25
                                                     (3 B C2 0C 00) */
  ISAAC_FRAME_EFFECT_820C00_NEXT_VA = 0x00820d30u, /* int3 pad 0x820d28..0x820d2f
                                                      (SEH ring-record fn) */
  ISAAC_FRAME_EFFECT_820C00_RET_BYTES = 0xcu,
  ISAAC_FRAME_EFFECT_820C00_INSN_COUNT = 60,
  ISAAC_FRAME_EFFECT_820C00_BYTE_LEN = 296,
  ISAAC_FRAME_EFFECT_820C00_CALL_INSNS = 2, /* BOTH 0xaf0917 (floor thunk) */
  ISAAC_FRAME_EFFECT_820C00_INDIRECT_CALLS = 0,
  ISAAC_FRAME_EFFECT_820C00_RET_VA = 0x00820d25u,
  ISAAC_FRAME_EFFECT_820C00_DIRECT_CALLERS = 1,
  ISAAC_FRAME_EFFECT_820C00_CALLSITE_A_VA = 0x005fde52u, /* entity 0xa1 W2S */
  ISAAC_FRAME_EFFECT_820C00_RAW_DWORD_HITS = 2,
  ISAAC_FRAME_EFFECT_820C00_HIT_A_VA = 0x0086c96du, /* registration push */
  ISAAC_FRAME_EFFECT_820C00_HIT_B_VA = 0x008912b5u, /* Lua binder store */
  ISAAC_FRAME_EFFECT_820C00_LUA_NAME_VA = 0x00b73ddcu, /* "WorldToScreenPosition" */
  ISAAC_FRAME_EFFECT_820C00_REG_HELPER_VA = 0x00891290u, /* Lua row binder */
  ISAAC_FRAME_EFFECT_820C00_FLOOR_THUNK_VA = 0x00af0917u, /* jmp [0xb18840] */
  ISAAC_FRAME_EFFECT_820C00_FLOOR_IAT_VA = 0x00b18840u,  /* MSVCRT floor */
  ISAAC_FRAME_EFFECT_820C00_ARG_OUT_FRAME_OFF = 8,  /* [ebp+8] out Vector */
  ISAAC_FRAME_EFFECT_820C00_ARG_X_FRAME_OFF = 0xcu, /* [ebp+0xc] X */
  ISAAC_FRAME_EFFECT_820C00_ARG_Y_FRAME_OFF = 0x10u,/* [ebp+0x10] Y (reused
                                                       as the Y lane local) */
  ISAAC_FRAME_EFFECT_820C00_CAM_X_VA = 0x00c78dc4u, /* .data cam X global */
  ISAAC_FRAME_EFFECT_820C00_CAM_Y_VA = 0x00c78edcu, /* .data cam Y global */
  ISAAC_FRAME_EFFECT_820C00_ZOOM_A_VA = 0x00bf941cu, /* .data, init 1.0f */
  ISAAC_FRAME_EFFECT_820C00_ZOOM_B_VA = 0x00bf93e8u, /* .data, init 2.0f */
  ISAAC_FRAME_EFFECT_820C00_ROOM_X_OFF = 0x1204u, /* [this+0x1204] */
  ISAAC_FRAME_EFFECT_820C00_ROOM_Y_OFF = 0x1208u, /* [this+0x1208] */
  ISAAC_FRAME_EFFECT_820C00_GAME_X_OFF = 0x2650cu, /* [g_Game+0x2650c] */
  ISAAC_FRAME_EFFECT_820C00_GAME_Y_OFF = 0x26510u, /* [g_Game+0x26510] */
  ISAAC_FRAME_EFFECT_820C00_338_VA = 0x00baab20u,  /* .rdata 338.0f */
  ISAAC_FRAME_EFFECT_820C00_338_BITS = 0x43a90000u,
  ISAAC_FRAME_EFFECT_820C00_182_VA = 0x00baaa7cu,  /* .rdata 182.0f */
  ISAAC_FRAME_EFFECT_820C00_182_BITS = 0x43360000u,
  ISAAC_FRAME_EFFECT_820C00_60_VA = 0x00baa950u,   /* .rdata 60.0f */
  ISAAC_FRAME_EFFECT_820C00_60_BITS = 0x42700000u,
  ISAAC_FRAME_EFFECT_820C00_140_VA = 0x00baaa30u,  /* .rdata 140.0f */
  ISAAC_FRAME_EFFECT_820C00_140_BITS = 0x430c0000u,
  ISAAC_FRAME_EFFECT_820C00_HALF_VA = 0x00baa2d0u, /* .rdata 0.5f */
  ISAAC_FRAME_EFFECT_820C00_HALF_BITS = 0x3f000000u,
  ISAAC_FRAME_EFFECT_820C00_065_VA = 0x00baa324u,  /* .rdata 0.65f */
  ISAAC_FRAME_EFFECT_820C00_065_BITS = 0x3f266666u,
  ISAAC_FRAME_EFFECT_820C00_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game read @0x820cea */
  ISAAC_FRAME_EFFECT_820C00_NEXT_FN_VA = 0x00820d30u /* next function */
};

/* ABI v33: the law set of FUN_00820c00 (Lua Room::WorldToScreenPosition,
 * 0x00820c00 ret 0xc — thiscall, ecx = Room).
 *
 * CENSUS (lea-corrected): 60 insns / 296 B (0x820c00..0x820d28 past
 * `ret 0xc` @0x820d25; int3 pad 0x820d28..0x820d2f; next fn 0x820d30) /
 * 0 resyncs / 2 direct calls — BOTH 0xaf0917, the IAT thunk
 * `jmp [0xb18840]` = MSVCRT floor (hint 0xE0, name entry @0xbf78be;
 * import-directory resolved) / 0 indirect / 1 plain `ret 0xc` / 2
 * movss-stores (the out Vector) / 1 direct caller 0x5fde52 (entity-0xa1
 * path: pushes (Y@[eax+0x340], X@[eax+0x33c], &out), ecx = Room from
 * 0x407480(g_Game)) / 2 raw imm32 hits — 0x86c96d (`push 0x820c00` @
 * 0x86c96c: registration, name 0xb73ddc "WorldToScreenPosition", row
 * helper 0x891290 called @0x86c978) + 0x8912b5 (the Lua binder store
 * `mov dword ptr [eax],0x820c00` @0x8912b3 — generic rawget binder,
 * HOST). identify-zhl FRESH: NO exact match — the address-stable name
 * is kept, "WorldToScreenPosition" is NOT promoted.
 *
 * SEH: NONE — plain frame (`push ebp; mov ebp,esp; sub esp,8; push esi`),
 * no fs:[0], no GS cookie. The body is straight-line pure f32 math with
 * one host CRT primitive per lane.
 *
 *   0x00820c00  push ebp ; mov ebp,esp ; sub esp,8
 *   0x00820c06  movss xmm1,[0xc78dc4]        ; cam_x (.data global)
 *   0x00820c0e  subss xmm1,[0xbaab20]        ; - 338.0f (.rdata)
 *   0x00820c16  movss xmm0,[ebp+0xc]         ; X arg
 *   0x00820c1b  subss xmm0,[0xbaa950]        ; - 60.0f (.rdata)
 *   0x00820c23  movss xmm3,[0xbf941c]        ; zoom_a (.data, init 1.0f)
 *   0x00820c2b  mulss xmm3,[0xbf93e8]        ; * zoom_b (.data, init 2.0f)
 *   0x00820c33  push esi
 *   0x00820c34  mulss xmm1,[0xbaa2d0]        ; * 0.5f
 *   0x00820c3c  sub esp,8                    ; qword arg slot
 *   0x00820c3f  mov esi,ecx                  ; this snapshot
 *   0x00820c41  mulss xmm0,[0xbaa324]        ; * 0.65f
 *   0x00820c49  movss [ebp-4],xmm3           ; zoom local
 *   0x00820c4e  addss xmm1,xmm0
 *   0x00820c52  mulss xmm1,xmm3              ; * zoom
 *   0x00820c56  addss xmm1,[0xbaa2d0]        ; + 0.5f
 *   0x00820c5e  movss [ebp-8],xmm1
 *   0x00820c63  fld [ebp-8] ; 0x00820c66 fstp qword [esp]
 *   0x00820c69  call 0xaf0917                ; HOST floor (thunk)
 *   0x00820c6e  fstp dword [ebp-8]           ; f64 -> f32 store
 *   0x00820c71  fld [ebp-8] ; 0x00820c74 fstp dword [ebp-8] ; round-trip
 *   0x00820c77  movss xmm0,[ebp-8]
 *   0x00820c7c  divss xmm0,[ebp-4]           ; sx = floor(...)/zoom
 *   0x00820c81  movss xmm1,[0xc78edc]        ; cam_y (.data global)
 *   0x00820c89  subss xmm1,[0xbaaa7c]        ; - 182.0f
 *   0x00820c91  movss [ebp-8],xmm0           ; sx local
 *   0x00820c96  movss xmm0,[ebp+0x10]        ; Y arg
 *   0x00820c9b  subss xmm0,[0xbaaa30]        ; - 140.0f
 *   0x00820ca3  mulss xmm1,[0xbaa2d0]        ; * 0.5f
 *   0x00820cab  mulss xmm0,[0xbaa324]        ; * 0.65f
 *   0x00820cb3  addss xmm1,xmm0
 *   0x00820cb7  mulss xmm1,[ebp-4]           ; * zoom
 *   0x00820cbc  addss xmm1,[0xbaa2d0]        ; + 0.5f
 *   0x00820cc4  movss [ebp+0x10],xmm1        ; Y arg slot reused
 *   0x00820cc9  fld [ebp+0x10] ; 0x00820ccc fstp qword [esp]
 *   0x00820ccf  call 0xaf0917                ; HOST floor (thunk)
 *   0x00820cd4  fstp dword [ebp+0x10]
 *   0x00820cd7  fld [ebp+0x10] ; 0x00820cda add esp,8
 *   0x00820cdd  fstp dword [ebp+0x10]        ; round-trip
 *   0x00820ce0  movss xmm0,[ebp+0x10]
 *   0x00820ce5  divss xmm0,[ebp-4]           ; sy = floor(...)/zoom
 *   0x00820cea  mov ecx,[0xc71678]           ; g_Game
 *   0x00820cf0  mov eax,[ebp+8]              ; out
 *   0x00820cf3  movss xmm1,[ebp-8]
 *   0x00820cf8  addss xmm1,[esi+0x1204]      ; + Room+0x1204
 *   0x00820d00  addss xmm0,[esi+0x1208]      ; + Room+0x1208
 *   0x00820d08  pop esi
 *   0x00820d09  addss xmm1,[ecx+0x2650c]     ; + Game+0x2650c
 *   0x00820d11  addss xmm0,[ecx+0x26510]     ; + Game+0x26510
 *   0x00820d19  movss [eax],xmm1 ; 0x00820d1d movss [eax+4],xmm0
 *   0x00820d22  mov esp,ebp ; 0x00820d24 pop ebp ; 0x00820d25 ret 0xc
 *
 * The camera-to-screen math (family float-law convention: f32 bit-exact,
 * movss/mulss shapes):
 *
 *   zoom   = zoom_a * zoom_b                 ; TWO .data globals, NOT folded
 *   lane   = (cam_delta*0.5f + world_delta*0.65f) * zoom + 0.5f
 *   pixel  = f32(floor(f64(lane)))           ; HOST floor, caller-resolved
 *   s      = pixel / zoom                    ; divss AFTER the floor
 *   out    = f32(f32(s + Room+0x1204) + Game+0x2650c)   ; two addss
 *
 * Constants (measured .rdata, cross-pinned by the render-shell family:
 * 338.0f @0xbaab20 == RENDER_SHELL_F32_338_BITS, 182.0f @0xbaaa7c ==
 * RENDER_SHELL_F32_182_BITS, 0.65f @0xbaa324 == RENDER_SHELL_F32_0_65_BITS;
 * + 60.0f @0xbaa950, 140.0f @0xbaaa30, 0.5f @0xbaa2d0). The four .data
 * inputs (cam_x 0xc78dc4, cam_y 0xc78edc, zoom_a 0xbf941c, zoom_b
 * 0xbf93e8) stay LAW INPUTS — the caller 0x5fde52 consumes the cam pair
 * too. Every op rounds once; the floor runs in pixel space (+0.5f BEFORE
 * the call), the /zoom runs after. The Y arg slot [ebp+0x10] is reused
 * as the Y lane local; the fld/fstp round-trip pairs after each call are
 * f32->f64->f32 no-ops (kept out of the laws via the floored-bits input;
 * family CRT precedent: 820910 dist_scale sqrt_res_bits). */
float isaac_frame_effect_820c00_zoom_mul(uint32_t a_bits, uint32_t b_bits);
float isaac_frame_effect_820c00_cam_delta_x(uint32_t cam_x_bits);
float isaac_frame_effect_820c00_cam_delta_y(uint32_t cam_y_bits);
float isaac_frame_effect_820c00_world_delta_x(uint32_t x_bits);
float isaac_frame_effect_820c00_world_delta_y(uint32_t y_bits);
float isaac_frame_effect_820c00_screen_lane(float cam_delta,
                                            float world_delta, float zoom);
float isaac_frame_effect_820c00_divide_zoom(uint32_t floored_bits,
                                            float zoom);
float isaac_frame_effect_820c00_compose_x(float sx, uint32_t room_1204_bits,
                                          uint32_t game_2650c_bits);
float isaac_frame_effect_820c00_compose_y(float sy, uint32_t room_1208_bits,
                                          uint32_t game_26510_bits);

typedef struct IsaacFrameEffect820c00Plan {
  int32_t x_floor;        /* always 1 — floor call in the X lane @0x820c69 */
  int32_t y_floor;        /* always 1 — floor call in the Y lane @0x820ccf */
  int32_t compose_game;   /* always 1 — g_Game read @0x820cea + the
                             [+0x2650c]/[+0x26510] adds @0x820d09/0x820d11 */
  int32_t host_calls;     /* always 2 — the floor thunk, once per lane */
  int32_t pure_complete;  /* always 0 — the CRT floor stays host */
} IsaacFrameEffect820c00Plan;

void isaac_frame_effect_820c00_entry_plan(IsaacFrameEffect820c00Plan* out);

/* ABI v34: FUN_00820d30 SEH ring-record HOST body — pure type/subtype
 * skip prefix before first host call 0x7f0780 @0x820e61.
 * skip=1 → early epilogue 0x820f5c (no host work).
 * cmp type,0xd8 / 0x38d are SIGNED jg. Table 0x820f7c (71 bytes, idx
 * type-0x13) selects skip (0 → 0x820f5c) vs L_de7 (1). identify-zhl
 * EMPTY. 2 E8 callers 0x6d5ad7 / 0x6d5aeb. */
enum {
  ISAAC_FRAME_EFFECT_820D30_VA = 0x00820d30u,
  ISAAC_FRAME_EFFECT_820D30_RET_VA = 0x00820f6fu, /* ret 4 */
  ISAAC_FRAME_EFFECT_820D30_END_VA = 0x00820f72u,
  ISAAC_FRAME_EFFECT_820D30_NEXT_VA = 0x00820ff0u,
  ISAAC_FRAME_EFFECT_820D30_TABLE_VA = 0x00820f74u,
  ISAAC_FRAME_EFFECT_820D30_BYTE_TABLE_VA = 0x00820f7cu,
  ISAAC_FRAME_EFFECT_820D30_CALLER_COUNT = 2u,
  ISAAC_FRAME_EFFECT_820D30_CALLER_A = 0x006d5ad7u,
  ISAAC_FRAME_EFFECT_820D30_CALLER_B = 0x006d5aebu,
  ISAAC_FRAME_EFFECT_820D30_TYPE_D8 = 0xd8u,
  ISAAC_FRAME_EFFECT_820D30_TYPE_38D = 0x38du,
  ISAAC_FRAME_EFFECT_820D30_TYPE_EF = 0xefu,
  ISAAC_FRAME_EFFECT_820D30_TYPE_F4 = 0xf4u,
  ISAAC_FRAME_EFFECT_820D30_TYPE_194 = 0x194u,
  ISAAC_FRAME_EFFECT_820D30_TYPE_390 = 0x390u,
  ISAAC_FRAME_EFFECT_820D30_TYPE_396 = 0x396u,
  ISAAC_FRAME_EFFECT_820D30_TYPE_199 = 0x199u,
  ISAAC_FRAME_EFFECT_820D30_TABLE_BASE = 0x13u,
  ISAAC_FRAME_EFFECT_820D30_TABLE_SPAN = 0x46u
};

int32_t isaac_frame_effect_820d30_type_gt_d8(uint32_t type);
int32_t isaac_frame_effect_820d30_table_skip(uint32_t type);
int32_t isaac_frame_effect_820d30_skip_gate(uint32_t type, uint32_t subtype);

/* ABI v35: FUN_00821940 — one LOW-BYTE store + ret 4.
 * PE: 0x821940 `C6 81 A1 72 00 00 00` mov byte [ecx+0x72a1], 0
 *     0x821947 `C2 04 00` ret 4
 * 2 insns / 10 B / 0 E8 / 0 SEH / 0 fs:[0]. identify-zhl EMPTY.
 * 2 E8 callers 0x7778a9 / 0x7860b3 (GetRoom 0x407480; push 0; this=Room*).
 * 0x821000 is NOT an entry (mid-function fallthrough of 0x820fd0). */
enum {
  ISAAC_FRAME_EFFECT_821940_VA = 0x00821940u,
  ISAAC_FRAME_EFFECT_821940_RET_VA = 0x00821947u,
  ISAAC_FRAME_EFFECT_821940_END_VA = 0x0082194au,
  ISAAC_FRAME_EFFECT_821940_NEXT_VA = 0x00821950u, /* after int3 0x82194a..0x82194f */
  ISAAC_FRAME_EFFECT_821940_INSN_COUNT = 2u,
  ISAAC_FRAME_EFFECT_821940_BYTE_LEN = 10u,
  ISAAC_FRAME_EFFECT_821940_CALL_INSNS = 0u,
  ISAAC_FRAME_EFFECT_821940_DIRECT_CALLERS = 2u,
  ISAAC_FRAME_EFFECT_821940_CALLER_A = 0x007778a9u,
  ISAAC_FRAME_EFFECT_821940_CALLER_B = 0x007860b3u,
  ISAAC_FRAME_EFFECT_821940_STORE_OFF = 0x72a1u,
  ISAAC_FRAME_EFFECT_821940_STORE_VALUE = 0u, /* LOW-BYTE imm */
  ISAAC_FRAME_EFFECT_821940_RET_ARGS = 4u,
  ISAAC_FRAME_EFFECT_821940_SLOT_KEEP = 0xffffff00u /* dword at +0x72a1 keeps bits 8..31 */
};

uint32_t isaac_frame_effect_821940_store_off(void);
uint32_t isaac_frame_effect_821940_store_value(void);
uint32_t isaac_frame_effect_821940_ret_args(void);
/* pre = little-endian dword whose low byte sits at this+0x72a1.
   PE writes only that byte to 0; bits 8..31 unchanged. */
uint32_t isaac_frame_effect_821940_apply_slot(uint32_t pre);

/* ABI v36: FUN_00822cf0 — UNSIGNED index<=9 gate + slot receiver, then
 * typed-host 0x4e45c0 (SEH). 17 insns / 46 B / 1 E8 / 0 IND / 0 fs:[0].
 * identify-zhl EMPTY. 1 E8 caller 0x822d4d. ret 8.
 * Hop-1 0x822820 is HOST giant (exact ZHL Room::CanSpawnObstacleAtPosition). */
enum {
  ISAAC_FRAME_EFFECT_822CF0_VA = 0x00822cf0u,
  ISAAC_FRAME_EFFECT_822CF0_RET_VA = 0x00822d1bu,
  ISAAC_FRAME_EFFECT_822CF0_END_VA = 0x00822d1eu,
  ISAAC_FRAME_EFFECT_822CF0_NEXT_VA = 0x00822d20u,
  ISAAC_FRAME_EFFECT_822CF0_INSN_COUNT = 17u,
  ISAAC_FRAME_EFFECT_822CF0_BYTE_LEN = 46u,
  ISAAC_FRAME_EFFECT_822CF0_CALL_INSNS = 1u,
  ISAAC_FRAME_EFFECT_822CF0_DIRECT_CALLERS = 1u,
  ISAAC_FRAME_EFFECT_822CF0_CALLER_A = 0x00822d4du,
  ISAAC_FRAME_EFFECT_822CF0_INDEX_MAX = 9u, /* cmp eax,9 / ja skip — UNSIGNED */
  ISAAC_FRAME_EFFECT_822CF0_SLOT_OFF = 0x7328u,
  ISAAC_FRAME_EFFECT_822CF0_SLOT_SHIFT = 3u, /* *8 */
  ISAAC_FRAME_EFFECT_822CF0_RET_ARGS = 8u,
  ISAAC_FRAME_EFFECT_822CF0_HOST_4E45C0_VA = 0x004e45c0u,
  /* hop-1 census (not landed) */
  ISAAC_FRAME_EFFECT_822820_VA = 0x00822820u,
  ISAAC_FRAME_EFFECT_822820_HOST = 1u
};

uint32_t isaac_frame_effect_822cf0_index_ok(uint32_t index);
uint32_t isaac_frame_effect_822cf0_needs_host(uint32_t index);
uint32_t isaac_frame_effect_822cf0_slot_addr(uint32_t this_ptr, uint32_t index);
uint32_t isaac_frame_effect_822cf0_ret_args(void);
uint32_t isaac_frame_effect_822cf0_host_va(void);

/* ABI v37: FUN_00822d20 — SIGNED in-bounds gate then host
 * Room::GetGridIndexByTile 0x812e60 + v36 0x822cf0. 25 insns / 55 B /
 * 2 E8 / 0 IND / 0 fs:[0]. identify-zhl EMPTY. ret 0xc. 4 E8 callers. */
enum {
  ISAAC_FRAME_EFFECT_822D20_VA = 0x00822d20u,
  ISAAC_FRAME_EFFECT_822D20_RET_VA = 0x00822d54u,
  ISAAC_FRAME_EFFECT_822D20_END_VA = 0x00822d57u,
  ISAAC_FRAME_EFFECT_822D20_NEXT_VA = 0x00822d60u, /* 9 cc then SEH */
  ISAAC_FRAME_EFFECT_822D20_INSN_COUNT = 25u,
  ISAAC_FRAME_EFFECT_822D20_BYTE_LEN = 55u,
  ISAAC_FRAME_EFFECT_822D20_CALL_INSNS = 2u,
  ISAAC_FRAME_EFFECT_822D20_DIRECT_CALLERS = 4u,
  ISAAC_FRAME_EFFECT_822D20_CALLER_A = 0x007ed962u,
  ISAAC_FRAME_EFFECT_822D20_CALLER_B = 0x007ed974u,
  ISAAC_FRAME_EFFECT_822D20_CALLER_C = 0x007ed986u,
  ISAAC_FRAME_EFFECT_822D20_CALLER_D = 0x007ed998u,
  ISAAC_FRAME_EFFECT_822D20_WIDTH_OFF = 0xcu,  /* [this+0xc] SIGNED jge */
  ISAAC_FRAME_EFFECT_822D20_HEIGHT_OFF = 0x10u, /* [this+0x10] SIGNED jge */
  ISAAC_FRAME_EFFECT_822D20_RET_ARGS = 0xcu,
  ISAAC_FRAME_EFFECT_822D20_HOST_812E60_VA = 0x00812e60u /* exact GetGridIndexByTile */
};

uint32_t isaac_frame_effect_822d20_in_bounds(uint32_t x, uint32_t y,
                                            uint32_t width, uint32_t height);
uint32_t isaac_frame_effect_822d20_needs_host(uint32_t x, uint32_t y,
                                             uint32_t width, uint32_t height);
uint32_t isaac_frame_effect_822d20_ret_args(void);
uint32_t isaac_frame_effect_822d20_host_812e60_va(void);
uint32_t isaac_frame_effect_822d20_host_822cf0_va(void);

/* ABI v38: FUN_00820fd0 — aligned-frame HOST giant (2410 B / 590 insns /
 * 32 E8 + 7 IND, 0 fs:[0], 0 cookie, plain `ret` @0x821939, 1 E8 caller
 * 0x80f1ee). identify-zhl EMPTY. Pure skip prefix BEFORE any host effect:
 *   0x820ff3 comiss xmm0(0.0),[this+0x7240]; jae 0x821931 — ORDERED
 *   0.0f >= f32 (NaN is unordered → falls through);
 *   0x821000 mov eax,[0xc7169c]; cmp byte [eax+0x2a3c9],0; je 0x821931
 *   — LOW-BYTE manager gate.
 * Early epilogue 0x821931 skips the Game float swap-back @0x82191c/
 * 0x821929 and ALL 32 host calls. First host call 0x683680 @0x82105b.
 * Band tail: int3 pads, landed 0x821940, HOST giant 0x821950 (live BSS),
 * jump table 0x821f94..0x821fbf; next body is the SEH giant head. */
enum {
  ISAAC_FRAME_EFFECT_820FD0_VA = 0x00820fd0u,
  ISAAC_FRAME_EFFECT_820FD0_RET_VA = 0x00821939u, /* plain `ret` */
  ISAAC_FRAME_EFFECT_820FD0_END_VA = 0x0082193au,
  ISAAC_FRAME_EFFECT_820FD0_EARLY_VA = 0x00821931u,
  ISAAC_FRAME_EFFECT_820FD0_NEXT_VA = 0x00821fc0u,
  ISAAC_FRAME_EFFECT_820FD0_INSN_COUNT = 590u,
  ISAAC_FRAME_EFFECT_820FD0_BYTE_LEN = 2410u,
  ISAAC_FRAME_EFFECT_820FD0_CALL_INSNS = 32u,
  ISAAC_FRAME_EFFECT_820FD0_IND_CALLS = 7u,
  ISAAC_FRAME_EFFECT_820FD0_DIRECT_CALLERS = 1u,
  ISAAC_FRAME_EFFECT_820FD0_CALLER_A = 0x0080f1eeu,
  ISAAC_FRAME_EFFECT_820FD0_FIELD_OFF = 0x7240u, /* f32 [this+0x7240] */
  ISAAC_FRAME_EFFECT_820FD0_MGR_GLOBAL_VA = 0x00c7169cu,
  ISAAC_FRAME_EFFECT_820FD0_MGR_FIELD_OFF = 0x2a3c9u, /* cmp BYTE ptr */
  ISAAC_FRAME_EFFECT_820FD0_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_820FD0_FIRST_HOST_VA = 0x0082105bu,
  ISAAC_FRAME_EFFECT_820FD0_FIRST_HOST_CALLEE_VA = 0x00683680u
};

/* f_bits = RAW dword at this+0x7240. 1 iff ordered 0.0f >= f32
   (jae taken): +0.0/-0.0 equal or negative; NaN never early-exits. */
int32_t isaac_frame_effect_820fd0_gate_zero(uint32_t f_bits);

/* mgr_byte = byte loaded from [[0xc7169c]+0x2a3c9] (LOW-BYTE compare).
   1 iff that byte is zero. */
int32_t isaac_frame_effect_820fd0_mgr_byte_zero(uint32_t mgr_byte);

/* 1 → early epilogue 0x821931 (no host work); 0 → continue into the
   giant. Either gate alone decides. */
int32_t isaac_frame_effect_820fd0_skip_gate(uint32_t f_bits, uint32_t mgr_byte);

/* ABI v39: FUN_00823370 — Room snapshot/easing helper (457 B / 111 insns /
 * 1 E8 / 0 IND / 0 fs:[0], `ret 4` @0x823536 returning esi = out blob,
 * this=ecx). identify-zhl EMPTY. 5 E8 callers. Pure except ONE gated
 * predicate: type [this+8] ∉ {7,8,0x1d} → call 0x74efd0
 * Level::HasAbandonedMineshaft([0xc71678]); al!=0 && [Game+0x1830c]==1
 * still runs the lerp arm (both captured as parameters below).
 * Stage 0: out[0..5] ← [this+0x1b10/14/18/1c/24/28] (source skips 0x1b20).
 * Stage 1 lerp ×0.75 toward 1.0f ([0xbaa454]) on slots 0,1,2,5; toward
 * 0.0f on slots 3(+0xc),4(+0x10) — THREE f32 roundings each.
 * Arm A: flag bit9 ([this+4]+0x44 shr 9) → out[4] += 0.03f [0xbaa0a0].
 * Grid: [this+0x1d18]==0x20 && flag bit5 → n=(w-2)*(h-2) SIGNED imul;
 * scale = (float)(int)[this+4 chain +0x54] / n * [this+0x7740];
 * out0-=s; out2+=s*0.4f [0xbaa280]; out1+=s*0.4f; out5+=s*0.2f
 * [0xbaa198]; out3-=s*0.45f [0xbaa2b8].
 * Next body after int3 pad 0x823539..0x82353f is 0x00823540. */
enum {
  ISAAC_FRAME_EFFECT_823370_VA = 0x00823370u,
  ISAAC_FRAME_EFFECT_823370_RET_VA = 0x00823536u,
  ISAAC_FRAME_EFFECT_823370_END_VA = 0x00823539u,
  ISAAC_FRAME_EFFECT_823370_NEXT_VA = 0x00823540u,
  ISAAC_FRAME_EFFECT_823370_INSN_COUNT = 111u,
  ISAAC_FRAME_EFFECT_823370_BYTE_LEN = 457u,
  ISAAC_FRAME_EFFECT_823370_CALL_INSNS = 1u,
  ISAAC_FRAME_EFFECT_823370_DIRECT_CALLERS = 5u,
  ISAAC_FRAME_EFFECT_823370_CALLER_A = 0x005c51ebu,
  ISAAC_FRAME_EFFECT_823370_CALLER_B = 0x005c5281u,
  ISAAC_FRAME_EFFECT_823370_CALLER_C = 0x00778754u,
  ISAAC_FRAME_EFFECT_823370_CALLER_D = 0x007d3c96u,
  ISAAC_FRAME_EFFECT_823370_CALLER_E = 0x0082354du,
  ISAAC_FRAME_EFFECT_823370_TYPE_OFF = 0x8u,
  ISAAC_FRAME_EFFECT_823370_TYPE_FAST_A = 7u,
  ISAAC_FRAME_EFFECT_823370_TYPE_FAST_B = 8u,
  ISAAC_FRAME_EFFECT_823370_TYPE_FAST_C = 0x1du,
  ISAAC_FRAME_EFFECT_823370_COPY_COUNT = 6u,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_A = 0x1b10u,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_B = 0x1b14u,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_C = 0x1b18u,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_D = 0x1b1cu,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_E = 0x1b24u,
  ISAAC_FRAME_EFFECT_823370_COPY_SRC_F = 0x1b28u,
  ISAAC_FRAME_EFFECT_823370_PRED_SITE_VA = 0x008233c7u,
  ISAAC_FRAME_EFFECT_823370_HOST_PRED_VA = 0x0074efd0u,
  ISAAC_FRAME_EFFECT_823370_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_823370_FLAG_1830C_OFF = 0x1830cu,
  ISAAC_FRAME_EFFECT_823370_LERP_TARGET_BITS = 0x3f800000u, /* 1.0f @0xbaa454 */
  ISAAC_FRAME_EFFECT_823370_LERP_FACTOR_BITS = 0x3f400000u, /* 0.75f @0xbaa380 */
  ISAAC_FRAME_EFFECT_823370_LERP_CONST_SLOTS = 0x27u, /* bits 0,1,2,5 */
  ISAAC_FRAME_EFFECT_823370_CHAIN_PTR_OFF = 0x4u,   /* edx = [this+4] */
  ISAAC_FRAME_EFFECT_823370_FLAG_OFF = 0x44u,       /* ecx = [edx+0x44] */
  ISAAC_FRAME_EFFECT_823370_FLAG_BIT9 = 9u,
  ISAAC_FRAME_EFFECT_823370_ADD_A0A0_BITS = 0x3cf5c28fu, /* 0.03f @0xbaa0a0 */
  ISAAC_FRAME_EFFECT_823370_DIM_OFF = 0x1d18u,
  ISAAC_FRAME_EFFECT_823370_DIM_EXPECT = 0x20u,
  ISAAC_FRAME_EFFECT_823370_FLAG_BIT5 = 5u,
  ISAAC_FRAME_EFFECT_823370_GRID_W_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_823370_GRID_H_OFF = 0xcu,
  ISAAC_FRAME_EFFECT_823370_GRID_SUB = 2u,
  ISAAC_FRAME_EFFECT_823370_RAW54_OFF = 0x54u,
  ISAAC_FRAME_EFFECT_823370_K280_BITS = 0x3ecccccdu, /* 0.4f @0xbaa280 */
  ISAAC_FRAME_EFFECT_823370_K2B8_BITS = 0x3ee66666u, /* 0.45f @0xbaa2b8 */
  ISAAC_FRAME_EFFECT_823370_K198_BITS = 0x3e4ccccdu, /* 0.2f @0xbaa198 */
  ISAAC_FRAME_EFFECT_823370_K7740_OFF = 0x7740u,
  ISAAC_FRAME_EFFECT_823370_RET_ARGS = 4u
};

typedef struct IsaacFrameEffect823370Plan {
  int32_t copy_slots; /* always 6 */
  int32_t fast;       /* type8 in {7,8,0x1d} */
  int32_t lerp_runs;  /* fast || (pred_al != 0 && flag1830c == 1) */
  int32_t add_a0a0;   /* flag bit 9 -> out[4] += 0.03f */
  int32_t grid_path;  /* dim18 == 0x20 && flag bit 5 */
} IsaacFrameEffect823370Plan;

int32_t isaac_frame_effect_823370_type_fast(uint32_t type8);
int32_t isaac_frame_effect_823370_lerp_arm(uint32_t fast, uint32_t pred_al,
                                           uint32_t flag1830c);
int32_t isaac_frame_effect_823370_flag_bit9(uint32_t flag);
int32_t isaac_frame_effect_823370_grid_gate(uint32_t dim18, uint32_t flag);

/* v_bits = RAW f32 slot bits. Result = RAW f32 bits of
   v + (T - v)*0.75f with T = 1.0f (const) or T = 0.0f (zero):
   subss/mulss/addss — three separate roundings, machine order. */
uint32_t isaac_frame_effect_823370_lerp_const(uint32_t v_bits);
uint32_t isaac_frame_effect_823370_lerp_zero(uint32_t v_bits);

/* scale = (float)(int32)raw54_bits / (float)((int32)w-2)*((int32)h-2)
   * (float)k_bits — cvtdq2ps BOTH operands, divss then mulss.
   den == 0 follows IEEE (±inf/NaN), exactly like the PE. */
uint32_t isaac_frame_effect_823370_grid_scale(uint32_t raw54_bits, uint32_t w,
                                              uint32_t h, uint32_t k_bits);

/* src6 = values at this+0x1b10/14/18/1c/24/28 in that order; applies the
   copy + stage-1 lerp into out6 (slots 0,1,2,5 toward 1.0f; 3,4 toward
   0.0f). Null src/out skipped. */
void isaac_frame_effect_823370_apply_stage01(const uint32_t* src6,
                                             uint32_t* out6);

/* Arm A: out[4] += 0.03f (flag bit9 checked by caller via plan). */
void isaac_frame_effect_823370_apply_a0a0(uint32_t* out6);

/* Grid deltas: out0 -= s; out2 += s*0.4f; out1 += s*0.4f; out5 += s*0.2f;
   out3 -= s*0.45f, PE store order 0x8234eb..0x82352c. Null skipped. */
void isaac_frame_effect_823370_apply_grid(uint32_t* out6, uint32_t scale_bits);

void isaac_frame_effect_823370_entry_plan(IsaacFrameEffect823370Plan* out,
                                          uint32_t type8, uint32_t pred_al,
                                          uint32_t flag1830c, uint32_t dim18,
                                          uint32_t flag);


/* ABI v40: FUN_00823540 — SetColorModifier wrapper (70 B / 23 insns /
 * 2 E8 / 0 IND / 0 fs:[0], plain `ret` @0x823585, caller cleans).
 * identify-zhl body EMPTY; callee 0x7067c0 exact-ZHL
 * `Game::SetColorModifier(ColorModState*, bool lerp, float rate<xmm3>)`.
 * 2 E8 callers 0x7f7558 / 0x805373.
 * Pure seams: fills a 0x18-byte ColorModState local via the v39 easing
 * helper 0x823370 (call @0x82354d), then lerp bool =
 * LOW-BYTE [Game+0x183a0]==0 && LOW-BYTE [Game+0x269e9]==0
 * (@0x823557/0x823560, Game = [0xc71678]), then UNCONDITIONAL host
 * Game::SetColorModifier(&slot, lerp, rate=0.015f) with the rate in
 * xmm3 from [0xbaa078] (call @0x82357d).
 * Next: int3 pad 0x823586..0x82358f, then SEH giant 0x00823590 —
 * do not open as leaf. */
enum {
  ISAAC_FRAME_EFFECT_823540_VA = 0x00823540u,
  ISAAC_FRAME_EFFECT_823540_RET_VA = 0x00823585u,
  ISAAC_FRAME_EFFECT_823540_END_VA = 0x00823586u,
  ISAAC_FRAME_EFFECT_823540_NEXT_VA = 0x00823590u, /* SEH giant head */
  ISAAC_FRAME_EFFECT_823540_INSN_COUNT = 23u,
  ISAAC_FRAME_EFFECT_823540_BYTE_LEN = 70u,
  ISAAC_FRAME_EFFECT_823540_CALL_INSNS = 2u,
  ISAAC_FRAME_EFFECT_823540_DIRECT_CALLERS = 2u,
  ISAAC_FRAME_EFFECT_823540_CALLER_A = 0x007f7558u,
  ISAAC_FRAME_EFFECT_823540_CALLER_B = 0x00805373u,
  ISAAC_FRAME_EFFECT_823540_BLOB_HELPER_VA = 0x00823370u,
  ISAAC_FRAME_EFFECT_823540_BLOB_CALL_SITE_VA = 0x0082354du,
  ISAAC_FRAME_EFFECT_823540_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_823540_BYTE_A_OFF = 0x183a0u,
  ISAAC_FRAME_EFFECT_823540_BYTE_B_OFF = 0x269e9u,
  ISAAC_FRAME_EFFECT_823540_HOST_SITE_VA = 0x0082357du,
  ISAAC_FRAME_EFFECT_823540_HOST_7067C0_VA = 0x007067c0u,
  ISAAC_FRAME_EFFECT_823540_RATE_BITS = 0x3c75c28fu, /* 0.015f @0xbaa078 */
  ISAAC_FRAME_EFFECT_823540_BLOB_LOCAL_BYTES = 0x18u,
  ISAAC_FRAME_EFFECT_823540_RET_BYTES = 0u /* plain ret; caller cleans */
};

typedef struct IsaacFrameEffect823540Plan {
  int32_t blob_helper_calls; /* always 1 — 0x823370 into the local blob */
  int32_t lerp;              /* LOW-BYTE b183a0==0 && LOW-BYTE b269e9==0 */
  int32_t host_calls;        /* always 1 — SetColorModifier(&slot,lerp) */
} IsaacFrameEffect823540Plan;

/* lerp argument handed to Game::SetColorModifier. Both compares are
   cmp BYTE ptr — only bits 0..7 of each parameter are inspected. */
int32_t isaac_frame_effect_823540_flag_pair(uint32_t b183a0,
                                            uint32_t b269e9);
uint32_t isaac_frame_effect_823540_rate_bits(void);
uint32_t isaac_frame_effect_823540_host_va(void);
uint32_t isaac_frame_effect_823540_blob_helper_va(void);
uint32_t isaac_frame_effect_823540_ret_bytes(void);
void isaac_frame_effect_823540_entry_plan(IsaacFrameEffect823540Plan* out,
                                          uint32_t b183a0, uint32_t b269e9);

/* ABI v41 (A): FUN_008242d0 — PURE LEAF, the v39 grid_gate predicate as
 * a standalone thiscall bool. 28 B / 11 insns / 0 E8 / 0 IND / 0 SEH /
 * TWO rets (al=1 @0x8242e8, xor al,al @0x8242eb). identify-zhl EMPTY.
 * ZERO direct E8 callers — reached via a raw dword reference @0x86c9c2
 * inside .text (table dispatch); that dword is the only static ref in
 * the whole image. */
enum {
  ISAAC_FRAME_EFFECT_8242D0_VA = 0x008242d0u,
  ISAAC_FRAME_EFFECT_8242D0_RET_A_VA = 0x008242e8u, /* mov al,1 ; ret */
  ISAAC_FRAME_EFFECT_8242D0_RET_B_VA = 0x008242ebu, /* xor al,al ; ret */
  ISAAC_FRAME_EFFECT_8242D0_END_VA = 0x008242ecu,
  ISAAC_FRAME_EFFECT_8242D0_INSN_COUNT = 11u,
  ISAAC_FRAME_EFFECT_8242D0_BYTE_LEN = 28u,
  ISAAC_FRAME_EFFECT_8242D0_CALL_INSNS = 0u,
  ISAAC_FRAME_EFFECT_8242D0_DIRECT_CALLERS = 0u,
  ISAAC_FRAME_EFFECT_8242D0_DISPATCH_REF_VA = 0x0086c9c2u,
  ISAAC_FRAME_EFFECT_8242D0_DIM_OFF = 0x1d18u,
  ISAAC_FRAME_EFFECT_8242D0_DIM_EXPECT = 0x20u,
  ISAAC_FRAME_EFFECT_8242D0_CHAIN_PTR_OFF = 0x4u,
  ISAAC_FRAME_EFFECT_8242D0_FLAG_OFF = 0x44u,
  ISAAC_FRAME_EFFECT_8242D0_FLAG_BIT5 = 5u
};

/* dim18 = dword at this+0x1d18; flag = dword at [this+4]+0x44.
   1 iff dim18 == 0x20 && flag bit 5 set. Identical law to the v39
   grid_gate seam; kept separate so the standalone body stays
   test-pinned. */
int32_t isaac_frame_effect_8242d0_gate(uint32_t dim18, uint32_t flag);

/* ABI v41 (B): FUN_00824800 pure PREFIX peel of a mixed HOST body
 * (first ret @0x824869; `jbe 0x82486a` @0x824857 falls into the host
 * tail: push/push/call 0x7ea3e0 Room::GetTimeScale + mulss [esi+0x7458]).
 * Pure prefix before any host effect:
 *   cmp dword [esi+0x7454],0 ; jle 0x824a61      — SIGNED count gate
 *   movss xmm1,[esi+0x7458] ; comiss 0,xmm1 ; jae 0x824a61
 *                                                — ORDERED 0 >= f skip
 *   cmp byte [esi+0x745c],0 ; je +continue       — decay-arm byte gate
 *   subss xmm1,[0xbaa08c](0.02f) ; maxss xmm1,xmm0(0) ; store
 *   movss xmm0,[0xbaa06c](0.01f) ; comiss xmm0,xmm1 ; jbe host path
 *   else [esi+0x7458] = 0 ; ret @0x824869.
 * NO static reference to 0x00824800 anywhere in the image (computed or
 * virtual reach). identify-zhl EMPTY. */
enum {
  ISAAC_FRAME_EFFECT_824800_VA = 0x00824800u,
  ISAAC_FRAME_EFFECT_824800_FIRST_RET_VA = 0x00824869u,
  ISAAC_FRAME_EFFECT_824800_HOST_JCC_SITE_VA = 0x00824857u,
  ISAAC_FRAME_EFFECT_824800_HOST_JCC_TARGET_VA = 0x0082486au,
  ISAAC_FRAME_EFFECT_824800_SKIP_TARGET_VA = 0x00824a61u,
  ISAAC_FRAME_EFFECT_824800_PREFIX_BYTE_LEN = 106u,
  ISAAC_FRAME_EFFECT_824800_COUNT_OFF = 0x7454u,
  ISAAC_FRAME_EFFECT_824800_F_OFF = 0x7458u,
  ISAAC_FRAME_EFFECT_824800_ARM_BYTE_OFF = 0x745cu,
  ISAAC_FRAME_EFFECT_824800_DECAY_BITS = 0x3ca3d70au, /* 0.02f @0xbaa08c */
  ISAAC_FRAME_EFFECT_824800_THRESH_BITS = 0x3c23d70au /* 0.01f @0xbaa06c */
};

/* count = dword at this+0x7454. 1 iff SIGNED count > 0 (jle skips). */
int32_t isaac_frame_effect_824800_count_gate(uint32_t count);

/* f_bits = RAW dword at this+0x7458. 1 iff ORDERED 0.0f >= f32
   (jae skips; NaN never skips). Same law shape as the v38 gate_zero. */
int32_t isaac_frame_effect_824800_gate_zero(uint32_t f_bits);

/* Decay arm (byte at this+0x745c != 0): f' = maxss(f - 0.02f, +0.0f)
   — subss then maxss; maxss returns +0.0f if f-0.02f is NaN. */
uint32_t isaac_frame_effect_824800_decay_apply(uint32_t f_bits);

/* Threshold arm: 1 → CONTINUE into the host tail (ordered 0.01f <= f);
   0 → the zero-store-and-ret arm wins ([esi+0x7458] = 0 @0x824859). */
int32_t isaac_frame_effect_824800_clamp_needs_host(uint32_t f_bits);

/* ABI v42: FUN_00824ee0 — HOST spawn-effect giant, pure skip-gate peel.
 * 1268 B / 283 insns / 6 E8 + 1 IND / 0 SEH / plain `ret` @0x8253d3 /
 * ZERO direct E8 callers. identify-zhl body EMPTY; host callees pinned:
 * 0x6fd350 exact-ZHL Game::IsPaused, 0x6eef60 genrand, 0x6fe410 entity
 * create (type 0x3e8 var 0x63), virtual [edx+0xc], 0x812f50.
 * Pure skip gate @0x824ef6/0x824f0b — MSVC ordered-equality idiom
 * (ucomiss; lahf; test ah,0x44; jp/jnp): jp taken iff ORDERED EQUAL,
 * so jnp (skip) iff NOT-ordered-equal = unordered OR value-different
 * (+0/-0 compare EQUAL under ucomiss):
 *   ucomiss [edi+0x7460],[0xc7b640]; jp continue   (a != C0 falls thru)
 *   ucomiss [edi+0x7464],[0xc7b644]; jnp 0x8253cd  (b != C1 -> SKIP)
 * Skip target 0x8253cd is the shared epilogue. */
enum {
  ISAAC_FRAME_EFFECT_824EE0_VA = 0x00824ee0u,
  ISAAC_FRAME_EFFECT_824EE0_RET_VA = 0x008253d3u,
  ISAAC_FRAME_EFFECT_824EE0_END_VA = 0x00825724u, /* true end; 0x8253d3 ret is EARLY-return, fn continues */
  ISAAC_FRAME_EFFECT_824EE0_SKIP_TARGET_VA = 0x008253cdu,
  ISAAC_FRAME_EFFECT_824EE0_INSN_COUNT = 504u,
  ISAAC_FRAME_EFFECT_824EE0_BYTE_LEN = 2116u,
  ISAAC_FRAME_EFFECT_824EE0_CALL_INSNS = 6u,
  ISAAC_FRAME_EFFECT_824EE0_IND_CALLS = 1u,
  ISAAC_FRAME_EFFECT_824EE0_DIRECT_CALLERS = 0u,
  ISAAC_FRAME_EFFECT_824EE0_GATE_A_SITE_VA = 0x00824ef6u,
  ISAAC_FRAME_EFFECT_824EE0_GATE_B_SITE_VA = 0x00824f0bu,
  ISAAC_FRAME_EFFECT_824EE0_A_OFF = 0x7460u,
  ISAAC_FRAME_EFFECT_824EE0_B_OFF = 0x7464u,
  ISAAC_FRAME_EFFECT_824EE0_C0_BITS = 0x3760371cu, /* @0xc7b640 */
  ISAAC_FRAME_EFFECT_824EE0_C1_BITS = 0x37873770u, /* @0xc7b644 */
  ISAAC_FRAME_EFFECT_824EE0_HOST_ISPAUSED_VA = 0x006fd350u,
  ISAAC_FRAME_EFFECT_824EE0_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_824EE0_HOST_GENRAND_VA = 0x006eef60u,
  ISAAC_FRAME_EFFECT_824EE0_HOST_CREATE_VA = 0x006fe410u,
  ISAAC_FRAME_EFFECT_824EE0_HOST_812F50_VA = 0x00812f50u
};

/* The per-compare jnp condition: 1 iff NOT ordered-equal — i.e.
   either raw pattern is NaN (unordered) or the VALUES differ with
   +0.0f == -0.0f comparing EQUAL (ucomiss semantics). */
int32_t isaac_frame_effect_824ee0_ucomiss_ne(uint32_t x_bits,
                                             uint32_t c_bits);

/* 1 → skip to epilogue 0x8253cd (both gates say "already at/above the
   seeded state"); 0 → run the spawn-effect body. */
int32_t isaac_frame_effect_824ee0_skip_gate(uint32_t a_bits,
                                            uint32_t b_bits);

/* ABI v43: FUN_00825730 — exact-ZHL `bool Room::CanPickupGridEntity(
 * int GridIndex)` — PURE thiscall leaf. 105 B / 40 insns / 0 E8 /
 * 0 IND / 0 SEH / `ret 4` @0x825796 (al in eax). 5 E8 callers
 * 0x55d121/0x55d8cd/0x55d94f/0x55da17/0x5b1b0e.
 * Gate: idx >u 0x1bf -> 0; entity [this+idx*4+0x24] null -> 0;
 * flag [entity+0x3c]==0 -> 0; type = [entity+4]:
 *   {2,4,5,6,0x1a,0x16,0x1b} -> 1
 *   0xc -> [entity+0xc] <u 4 ? 1 : 0
 *   0xe -> [entity+0xc] != 0x3e8 ? 1 : 0   (pause-field value)
 *   else -> 0. */
enum {
  ISAAC_FRAME_EFFECT_825730_VA = 0x00825730u,
  ISAAC_FRAME_EFFECT_825730_RET_VA = 0x00825796u,
  ISAAC_FRAME_EFFECT_825730_END_VA = 0x00825799u,
  ISAAC_FRAME_EFFECT_825730_INSN_COUNT = 40u,
  ISAAC_FRAME_EFFECT_825730_BYTE_LEN = 105u,
  ISAAC_FRAME_EFFECT_825730_CALL_INSNS = 0u,
  ISAAC_FRAME_EFFECT_825730_DIRECT_CALLERS = 5u,
  ISAAC_FRAME_EFFECT_825730_CALLER_A = 0x0055d121u,
  ISAAC_FRAME_EFFECT_825730_CALLER_B = 0x0055d8cdu,
  ISAAC_FRAME_EFFECT_825730_CALLER_C = 0x0055d94fu,
  ISAAC_FRAME_EFFECT_825730_CALLER_D = 0x0055da17u,
  ISAAC_FRAME_EFFECT_825730_CALLER_E = 0x005b1b0eu,
  ISAAC_FRAME_EFFECT_825730_IDX_MAX = 0x1bfu,
  ISAAC_FRAME_EFFECT_825730_LIST_OFF = 0x24u,
  ISAAC_FRAME_EFFECT_825730_ENTITY_TYPE_OFF = 0x4u,
  ISAAC_FRAME_EFFECT_825730_ENTITY_FLAG_OFF = 0x3cu,
  ISAAC_FRAME_EFFECT_825730_ENTITY_SUB_OFF = 0xcu,
  ISAAC_FRAME_EFFECT_825730_SUB_MIN = 4u,
  ISAAC_FRAME_EFFECT_825730_PAUSE_FIELD = 0x3e8u,
  ISAAC_FRAME_EFFECT_825730_TYPE_0C = 0xcu,
  ISAAC_FRAME_EFFECT_825730_TYPE_0E = 0xeu,
  ISAAC_FRAME_EFFECT_825730_RET_ARGS = 4u
};

/* type/sub decision only: 1 iff type ∈ {2,4,5,6,0x1a,0x16,0x1b};
   type 0xc → sub_field <u 4; type 0xe → sub_field != 0x3e8. */
int32_t isaac_frame_effect_825730_type_ok(uint32_t etype,
                                          uint32_t sub_field);

/* Full gate: idx <=u 0x1bf AND has_entity AND flag_nonzero AND
   type_ok(etype, sub_field). */
int32_t isaac_frame_effect_825730_gate(uint32_t idx, uint32_t has_entity,
                                       uint32_t flag_nonzero,
                                       uint32_t etype, uint32_t sub_field);



/* ---- FUN_006fe2f0 player walk + room change tail (ABI v5) ---- */

enum {
  ISAAC_FRAME_EFFECT_6FE2F0_VA = 0x006fe2f0u,
  ISAAC_FRAME_EFFECT_6FE2F0_END_VA = 0x006fe3bfu, /* the `ret 8` */
  ISAAC_FRAME_EFFECT_6FE2F0_RET_BYTES = 8,
  ISAAC_FRAME_EFFECT_6FE2F0_LOG_LEVEL = 0x10,     /* push 0x10 — not the
                                                     fatal-path 8 */
  ISAAC_FRAME_EFFECT_6FE2F0_SLOT_STRIDE = 4,
  ISAAC_FRAME_EFFECT_6FE2F0_RESULT_OFF = 0x1ad90, /* normalized store */
  ISAAC_FRAME_EFFECT_6FE2F0_7EBE20_STACK_OFF = 0x1bb0, /* push [room+0x1bb0] */
  ISAAC_FRAME_EFFECT_6FE2F0_7EBE20_EDX_OFF = 4,        /* edx = [room+4] */
  ISAAC_FRAME_EFFECT_6FE2F0_7EBE20_ECX_OFF = 8,        /* ecx = [room+8] */
  ISAAC_FRAME_EFFECT_HOST_7A6680_VA = 0x007a6680u, /* ZHL collision — see doc */
  ISAAC_FRAME_EFFECT_HOST_CHANGE_ROOM_VA = 0x0073fc80u, /* exact Level::ChangeRoom */
  ISAAC_FRAME_EFFECT_HOST_802980_VA = 0x00802980u,
  ISAAC_FRAME_EFFECT_HOST_GENRAND_VA = 0x006eef60u, /* exact Isaac::genrand_int32 */
  ISAAC_FRAME_EFFECT_HOST_7EBE20_VA = 0x007ebe20u
};

enum {
  /* FUN_0085afb0 stage-record key builder (ABI v6). */
  ISAAC_FRAME_EFFECT_85AFB0_VA = 0x0085afb0u,
  ISAAC_FRAME_EFFECT_85AFB0_END_VA = 0x0085b031u, /* the plain `ret` */
  ISAAC_FRAME_EFFECT_85AFB0_RET_BYTES = 0,        /* caller add esp,8 */
  ISAAC_FRAME_EFFECT_85AFB0_SELECTOR_MAX = 3,     /* cmp/ja — unsigned */
  ISAAC_FRAME_EFFECT_85AFB0_BUF_VA = 0x00c7f490u, /* 0x20-byte BSS buffer */
  ISAAC_FRAME_EFFECT_85AFB0_BUF_SIZE = 0x20,
  ISAAC_FRAME_EFFECT_85AFB0_JUMP_TABLE_VA = 0x0085b034u,
  ISAAC_FRAME_EFFECT_85AFB0_INIT_CAPACITY = 0xf,  /* fresh SSO init */
  ISAAC_FRAME_EFFECT_85AFB0_FMT_SCORES_SOLO_VA = 0x00b6e844u, /* case 0 */
  ISAAC_FRAME_EFFECT_85AFB0_FMT_TIMES_SOLO_VA = 0x00b6e81cu,  /* case 1 */
  ISAAC_FRAME_EFFECT_85AFB0_FMT_SCORES_COOP_VA = 0x00b6e858u, /* case 2 */
  ISAAC_FRAME_EFFECT_85AFB0_FMT_TIMES_COOP_VA = 0x00b6e830u,  /* case 3 */
  ISAAC_FRAME_EFFECT_HOST_SPRINTF_VA = 0x0041e420u,
  ISAAC_FRAME_EFFECT_HOST_ASSIGN_VA = 0x0040ccd0u /* frame-opaque v20 model */
};

enum {
  /* FUN_006fe3d0 Game::MoveToRandomRoom forwarder (ABI v7). */
  ISAAC_FRAME_EFFECT_6FE3D0_VA = 0x006fe3d0u,
  ISAAC_FRAME_EFFECT_6FE3D0_END_VA = 0x006fe409u, /* the `ret 0xc` */
  ISAAC_FRAME_EFFECT_6FE3D0_RET_BYTES = 0xc,
  ISAAC_FRAME_EFFECT_GAME_GLOBAL_VA = 0x00c71678u, /* mov eax,[0xc71678] */
  ISAAC_FRAME_EFFECT_6FE3D0_SEED_OFF = 0x18318,  /* room_transition_marker_18318 */
  ISAAC_FRAME_EFFECT_6FE3D0_SEED_VALUE = -1,     /* the seeded marker value */
  ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG2 = -1,     /* push -1 (0x006fe3dd) */
  ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ANIM = 3,      /* push 3  (0x006fe3ee) */
  ISAAC_FRAME_EFFECT_6FE3D0_SHELL_DIM = -1,      /* push -1 (0x006fe3f0) */
  ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT = 5,
  ISAAC_FRAME_EFFECT_HOST_GET_RANDOM_ROOM_VA = 0x00740860u, /* ZHL collision -- see doc */
  ISAAC_FRAME_EFFECT_HOST_60D010_VA = 0x0060d010u, /* exact Game::GetRoomDescriptorsOffsetsArrayForDimension */
  ISAAC_FRAME_EFFECT_6FE3D0_RNG_SEED_FATAL_VA = 0x00b6bf54u, /* "RNG Seed is zero!\n" */
  ISAAC_FRAME_EFFECT_6FE3D0_RNG_SEED_FATAL_LEVEL = 0x10,
  ISAAC_FRAME_EFFECT_6FE3D0_MIX_SHIFT_A = 2,    /* 0x00b1f588 low dword */
  ISAAC_FRAME_EFFECT_6FE3D0_MIX_SHIFT_B = 15,   /* 0x00b1f588 high dword */
  ISAAC_FRAME_EFFECT_6FE3D0_MIX_SHIFT_C = 25    /* 0x00b1f590 */
};

/* PE `sub/sar 2` — bit-identical law to the FUN_006fdc10 walk; kept as a
   separate export so the sibling relationship stays test-pinned. */
int32_t isaac_frame_effect_6fe2f0_vector_count(uint32_t begin, uint32_t end);

/* PE 0x006fe30e: test edx,edx; je — the walk is skipped only when the
   signed count is exactly zero. A negative count (reversed bounds) ENTERS
   the walk and the unsigned index compares then treat it as huge. */
int32_t isaac_frame_effect_6fe2f0_walk_enter(int32_t count);

/* PE 0x006fe31b: test ecx,ecx; jne — the mid-loop no-players log fires only
   on a recomputed count of zero. Statically dead under the loop invariant
   (see the file doc); translated as the machine has it. */
int32_t isaac_frame_effect_6fe2f0_head_log_needed(int32_t count);

/* PE 0x006fe33f…0x006fe346: cmp esi,eax; jae skips the lea. ORIGINAL
   DEFECT PRESERVED: an out-of-range index leaves the base pointer live and
   addresses element 0. Bit-identical law to the FUN_006fdc10 clamp. */
uint32_t isaac_frame_effect_6fe2f0_slot_addr_clamped(uint32_t begin,
                                                     uint32_t count,
                                                     uint32_t index);

/* PE 0x006fe365: cmp esi,ecx; jb — UNSIGNED continue over the signed sar
   count, re-derived from re-read bounds after every call. */
int32_t isaac_frame_effect_6fe2f0_walk_continue(uint32_t index_next,
                                                int32_t count);

/* PE 0x006fe3ab…0x006fe3ba: cmp eax,-1; jne; mov 0 — the tail result is
   stored raw unless it is exactly -1, which becomes 0. */
int32_t isaac_frame_effect_6fe2f0_result_normalize(int32_t result);

/* Walk driver over host-recaptured vector bounds, in the ABI v18 recount
   style: begins[k]/ends[k] are the bounds observed before call k (k = 0 is
   the prologue read; the host recaptures after every FUN_007a6680 call).
   Writes up to out_len slot addresses and per-call flag bytes (bit0 = the
   out-of-range defect fired, bit1 = the head log fired) and returns the
   number of calls executed. Running out of samples stops the walk (the
   caller must sample). The bound is re-derived from sample k+1 after call
   k — never folded. */
uint32_t isaac_frame_effect_6fe2f0_walk_from_samples(uint32_t* out_slots,
                                                     uint8_t* out_flags,
                                                     uint32_t out_len,
                                                     const uint32_t* begins,
                                                     const uint32_t* ends,
                                                     uint32_t samples_len);

typedef struct IsaacFrameEffect6fe2f0Plan {
  int32_t initial_count;   /* signed sar-2 count from the prologue reads */
  int32_t walk_entered;    /* count != 0 — negative counts enter too */
  int32_t host_walk_call;  /* = walk_entered: at least one FUN_007a6680 */
  int32_t host_change_room; /* always 1 — exact Level::ChangeRoom */
  int32_t host_802980;     /* always 1 */
  int32_t host_genrand;    /* always 1 — one MT19937 draw before 7ebe20 */
  int32_t host_7ebe20;     /* always 1 — custom-convention callee */
  int32_t store_result;    /* always 1 — Game+0x1ad90, -1 normalized to 0 */
  int32_t pure_cf_ok;
  int32_t pure_complete;   /* always 0 — walk callee and tail stay host */
} IsaacFrameEffect6fe2f0Plan;

void isaac_frame_effect_6fe2f0_entry_plan(IsaacFrameEffect6fe2f0Plan* out,
                                          uint32_t begin,
                                          uint32_t end);

/* ---- FUN_0085afb0 stage-record key builder (ABI v6) ---- */

/* PE 0x0085afbd: cmp eax,3; ja — UNSIGNED; at or below 3 the sprintf runs. */
int32_t isaac_frame_effect_85afb0_sprintf_needed(uint32_t selector);

/* Format string VA per selector, from the VERIFIED jump table at
   0x0085b034 (the table crosses the textual arm order — cases 1 and 2
   would swap if read top-to-bottom). 0 when the sprintf is skipped.
   Implemented as a compare chain so the helper does not depend on linear
   memory. */
uint32_t isaac_frame_effect_85afb0_fmt_va(uint32_t selector);

/* Fresh-string init stores at 0x0085affb…0x0085b00f: dword 0 at +0, size 0,
   capacity 0xf, then the first BYTE cleared again. Null pointers skip only
   their own store. */
void isaac_frame_effect_85afb0_apply_init(uint32_t* buf_word0,
                                          uint32_t* size_field,
                                          uint32_t* cap_field,
                                          uint8_t* first_byte);

/* Inline strlen loop at 0x0085b012…0x0085b01c (lea/inc/test — counts to the
   NUL, terminator excluded). Null → 0. */
uint32_t isaac_frame_effect_85afb0_strlen(const uint8_t* s);

typedef struct IsaacFrameEffect85afb0Plan {
  int32_t sprintf_needed;   /* selector <= 3 (unsigned) */
  uint32_t fmt_string_va;   /* table-verified selection; 0 when skipped */
  int32_t host_sprintf;     /* = sprintf_needed — 0x0041e420(buf,0x20,fmt,edx) */
  int32_t stale_buffer;     /* = !sprintf_needed — the assign still reads the
                               global, so the out string receives whatever
                               0x00c7f490 currently holds (reproduced) */
  int32_t host_assign;      /* always 1 — FUN_0040ccd0(out, buf, strlen) */
  int32_t pure_cf_ok;
  int32_t pure_complete;    /* always 0 — sprintf/assign read guest memory */
} IsaacFrameEffect85afb0Plan;

void isaac_frame_effect_85afb0_entry_plan(IsaacFrameEffect85afb0Plan* out,
                                          uint32_t selector);

/* ---- FUN_006fe3d0 Game::MoveToRandomRoom forwarder (ABI v7) ---- */

/* PE 0x006fe3d7: mov eax,[0x00c71678] — the g_Game global read shape. The
   helper cannot read guest memory; the caller resolves the global. */
uint32_t isaac_frame_effect_6fe3d0_game_global_va(void);

/* PE 0x006fe3e4: mov dword [eax+0x18318], 0xffffffff. */
uint32_t isaac_frame_effect_6fe3d0_seed_offset(void);
int32_t isaac_frame_effect_6fe3d0_seed_value(void);

/* Pure dword store of the seed marker. Null pointer is skipped; the store
   targets the g_Game read, not the `this` register. */
void isaac_frame_effect_6fe3d0_apply_seed(uint8_t* game_ptr);

/* PE 0x007408b2 (inside the host pack): cmp byte ptr [ebp+8],0; je
   registry-scan — LOW BYTE only. 1 = the special candidates are skipped. */
int32_t isaac_frame_effect_6fe3d0_pack_skips_specials(uint32_t i_am_error_room);

/* The five shell arguments in callee order: {room_from_host, -1, 3,
   player, -1}. room comes from the HOST pack sample (never folded from a
   pre-call value); player is the caller's [ebp+0x10] forwarded bit-exact.
   Writes min(len, 5) slots and returns the full count (5). Null out →
   count only. */
uint32_t isaac_frame_effect_6fe3d0_shell_args(int32_t* out_args,
                                              uint32_t len,
                                              int32_t room_from_host,
                                              uint32_t player);

typedef struct IsaacFrameEffect6fe3d0Plan {
  int32_t host_740860;        /* Level::GetRandomRoomIndex-shaped host call */
  int32_t pack_skips_specials;/* low-byte gate on iAmErrorRoom */
  int32_t host_6fd7c0;        /* the frame-effect shell — always 1 */
  int32_t seed_store;         /* Game+0x18318 = -1 — always 1 */
  int32_t seed_store_first;   /* the store precedes the pack call — always 1 */
  int32_t error_forwarded;    /* [ebp+8] reaches the pack as arg0 — always 1 */
  int32_t seed_forwarded;     /* [ebp+0xc] reaches the pack as arg1 — always 1 */
  int32_t room_from_host;     /* shell room = host pack result — always 1 */
  int32_t arg2_const;         /* -1 — always 1 (machine constant) */
  int32_t anim_const;         /* 3 — always 1 (machine constant) */
  int32_t player_forwarded;   /* [ebp+0x10] reaches the shell — always 1 */
  int32_t dim_const;          /* -1 — always 1 (machine constant) */
  int32_t pure_cf_ok;
  int32_t pure_complete;      /* always 0 — pack and shell stay host */
} IsaacFrameEffect6fe3d0Plan;

void isaac_frame_effect_6fe3d0_entry_plan(IsaacFrameEffect6fe3d0Plan* out,
                                          uint32_t i_am_error_room,
                                          int32_t seed,
                                          uint32_t player);

/* ---- FrameEffect_6fd7c0 v8: special tail, SFX pack, position search ---- */

enum {
  /* (C) SFX epilogue. The receiver base is the 0x00c7169c global, NOT the
     g_Game global; see the file doc. */
  ISAAC_FRAME_EFFECT_SFX_BASE_GLOBAL_VA = 0x00c7169cu,
  ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT = 6u,
  ISAAC_FRAME_EFFECT_SFX_PLAY_VOLUME_BITS = 0x3f800000u, /* 1.0f */
  ISAAC_FRAME_EFFECT_SFX_PLAY_FRAME_DELAY = 2u,
  ISAAC_FRAME_EFFECT_SFX_PLAY_LOOP = 0u,
  ISAAC_FRAME_EFFECT_SFX_PLAY_PITCH_BITS = 0x3f800000u, /* 1.0f */
  ISAAC_FRAME_EFFECT_SFX_PLAY_PAN_BITS = 0u,

  /* (A) anim-0xc special tail. */
  ISAAC_FRAME_EFFECT_SPECIAL_TAIL_TELEPORT_STR_VA = 0x00b1dff0u, /* "TeleportUp" */
  ISAAC_FRAME_EFFECT_HOST_7ABE20_VA = 0x007abe20u,
  ISAAC_FRAME_EFFECT_SPECIAL_TAIL_6FDC10_ARG0 = 0u,
  ISAAC_FRAME_EFFECT_SPECIAL_TAIL_6FDC10_ARG1 = 6u,
  ISAAC_FRAME_EFFECT_SPECIAL_TAIL_6FDC10_ARG2 = 0u,

  /* (B) position search. */
  ISAAC_FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT = 0x32u,      /* cmp eax,0x32; jl */
  ISAAC_FRAME_EFFECT_SEARCH_PLAYER_POS_X_OFF = 0x33cu,
  ISAAC_FRAME_EFFECT_SEARCH_PLAYER_POS_Y_OFF = 0x340u,
  ISAAC_FRAME_EFFECT_SEARCH_PLAYER_370_OFF = 0x370u,
  ISAAC_FRAME_EFFECT_SEARCH_ROOM_20_OFF = 0x20u,
  ISAAC_FRAME_EFFECT_SEARCH_ENTITY_LIST_OFF = 0x1218u,  /* add ecx,0x1218 */
  ISAAC_FRAME_EFFECT_SEARCH_QUERY_KIND = 0xau,          /* push 0xa */
  ISAAC_FRAME_EFFECT_SEARCH_ENT_TYPE_OFF = 0x28u,
  ISAAC_FRAME_EFFECT_SEARCH_ENT_FLAGS_168_OFF = 0x168u,
  ISAAC_FRAME_EFFECT_SEARCH_ENT_FLAGS_438_OFF = 0x438u,
  ISAAC_FRAME_EFFECT_SEARCH_ENT_MASK_168 = 0x20000000u,
  ISAAC_FRAME_EFFECT_SEARCH_ENT_MASK_438 = 0x80000000u,
  ISAAC_FRAME_EFFECT_SEARCH_TYPE_RANGE_BIAS = 0xau,     /* lea eax,[ecx-0xa] */
  ISAAC_FRAME_EFFECT_SEARCH_TYPE_RANGE_MAX = 0x3ddu,    /* cmp eax,0x3dd; ja */
  ISAAC_FRAME_EFFECT_SEARCH_TYPE_SHORTCUT = 1u,         /* cmp ecx,1; je */
  ISAAC_FRAME_EFFECT_SEARCH_MODE_MIN = 2u,              /* cmp eax,2; jl */
  ISAAC_FRAME_EFFECT_SEARCH_TYPE_FLAGGED = 9u,          /* cmp ecx,9; jne */
  ISAAC_FRAME_EFFECT_SEARCH_SET_POS_ARG1 = 1u,          /* push 1 */
  ISAAC_FRAME_EFFECT_SEARCH_SET_POS_ARG2 = 1u,          /* push 1 */
  ISAAC_FRAME_EFFECT_HOST_8279A0_GATE_VA = 0x008279a0u,
  ISAAC_FRAME_EFFECT_HOST_81E9D0_CAND_VA = 0x0081e9d0u,
  ISAAC_FRAME_EFFECT_HOST_41AB50_QUERY_VA = 0x0041ab50u,
  ISAAC_FRAME_EFFECT_HOST_A648B0_FREE_VA = 0x00a648b0u,
  ISAAC_FRAME_EFFECT_HOST_4175B0_DTOR_VA = 0x004175b0u,
  ISAAC_FRAME_EFFECT_HOST_7CD950_SETPOS_VA = 0x007cd950u,
  ISAAC_FRAME_EFFECT_CAPSULE_MULTIPLIER_VA = 0x00c3793cu
};

/* (C) The six SFXManager::Play arguments in CALLEE order, as raw 32-bit
   patterns: {id, 1.0f, 2, 0, 1.0f, 0}. Recovered from the machine's stack
   build at 0x006fd83a…0x006fd861, where `push ecx` at 0x006fd850 is only
   stack reservation — 0x006fd851 immediately overwrites that slot with
   1.0f. Writes min(len, 6) slots; returns the full count. Null out →
   count only. */
uint32_t isaac_frame_effect_6fd7c0_sfx_play_args(uint32_t* out_args,
                                                 uint32_t len,
                                                 int32_t sfx_id);

/* The global whose load at 0x006fd82c supplies the SFXManager receiver
   base (receiver = *base + 0x2a324). Deliberately distinct from
   isaac_frame_effect_6fe3d0_game_global_va(). */
uint32_t isaac_frame_effect_6fd7c0_sfx_base_global_va(void);

/* ABI v18. The SFXManager receiver displacement `lea ecx,[esi+0x2a324]` at
   0x006fd858 (both sound paths share the build after 0x006fd82c). */
int32_t isaac_frame_effect_6fd7c0_sfx_manager_off(void);
uint32_t isaac_frame_effect_6fd7c0_sfx_manager_receiver(uint32_t base);

/* (A) anim-0xc special tail plan. `player` is the raw [ebp+0x14] argument;
   the machine tests the FULL word (test ecx,ecx), not a low byte. */
typedef struct IsaacFrameEffect6fd7c0SpecialTailPlan {
  int32_t host_6fdc10;        /* always 1 — call (this, 0, 6, 0) */
  int32_t player_null_return; /* player == 0 → plain ret, nothing logged */
  int32_t host_7abe20;        /* player != 0 → the "TeleportUp" host call */
  int32_t sfx_seed;           /* 0xd7 when the SFX epilogue is reached, else 0 */
  int32_t host_956780;        /* = host_7abe20 — the id remap */
  int32_t host_sfx_play;      /* = host_7abe20 — SFXManager::Play */
  int32_t host_log;           /* always 0 — the null return lands PAST the
                                 log call at 0x006fdbe4 */
  int32_t reaches_engine;     /* always 0 — neither sub-branch reaches
                                 FUN_0082ee40 */
  int32_t applies_terminals;  /* always 0 — no P4 on this edge */
  int32_t host_705ee0;        /* always 0 */
  int32_t host_blue_room;     /* always 0 */
  int32_t pure_cf_ok;
  int32_t pure_complete;      /* always 0 — 6fdc10 / 7abe20 / SFX stay host */
} IsaacFrameEffect6fd7c0SpecialTailPlan;

void isaac_frame_effect_6fd7c0_special_tail_plan(
    IsaacFrameEffect6fd7c0SpecialTailPlan* out, uint32_t player);

/* (B) Per-entity blocker predicate, 0x006fd9f5…0x006fda32. Returns 1 when
   the entity BLOCKS the candidate (control reaches 0x006fda3e), 0 when the
   inner scan advances to the next entity (0x006fda34).

   Machine shape, kept literally:
     if ((int32_t)mode >= 2 && type == 1)   goto check_168;   ; SIGNED
     if ((uint32_t)(type - 0xa) <= 0x3dd)   goto check_168;   ; UNSIGNED
     goto check_438;
     check_168: if ((flags_168 & 0x20000000) == 0) return 1;
     check_438: if (type != 9) return 0;
                if ((flags_438 & 0x80000000) == 0) return 1;
                return 0;
   The fallthrough out of the 0x168 test into the type-9 test is
   STRUCTURALLY DEAD for the 0x438 arm, and the arithmetic proves it: an
   entity only reaches the 0x168 test with type 1 (and mode >= 2) or with
   type inside the window 0xa..0x3e7, and 9 is in neither set. So a set
   0x20000000 bit always means "does not block", and type 9 reaches the
   0x438 test only through the direct `ja` edge from the range test, 9
   being BELOW the window. Verified by enumeration over every type in
   -20..0x400 crossed with seven modes: 6933 entities reach the 0x168 test,
   0 of them have type 9, and 0 block once the bit is set. The dead edge is
   translated as the machine has it and a test pins the invariant. */
int32_t isaac_frame_effect_6fd7c0_probe_blocks(int32_t mode,
                                               int32_t ent_type,
                                               uint32_t ent_flags_168,
                                               uint32_t ent_flags_438);

/* 0x006fda3e: cmp byte ptr [ebp-0x30],0; jne skips the inline free. LOW
   BYTE only — the parameter is deliberately 32-bit wide and re-narrowed in
   the body (see the toolchain defect note in AGENTS.md). */
int32_t isaac_frame_effect_6fd7c0_free_inline_needed(uint32_t query_flag);

/* 0x006fda6f: cmp eax,0x32; jl — SIGNED. */
int32_t isaac_frame_effect_6fd7c0_search_attempt_limit(void);
int32_t isaac_frame_effect_6fd7c0_search_continue(int32_t next_attempt);

/* One host-observed attempt of the position search. Every field is what the
   machine reads AFTER the corresponding host call, never before. */
typedef struct IsaacFrameEffect6fd7c0SearchSample {
  uint32_t cand_x_bits;    /* [ebp-0x18] after FUN_0081e9d0 (raw movss) */
  uint32_t cand_y_bits;    /* [ebp-0x14] after FUN_0081e9d0 (raw movss) */
  uint32_t player_370_bits;/* player+0x370, RE-READ this attempt */
  uint32_t room_20_bits;   /* room+0x20,   RE-READ this attempt */
  int32_t query_flag;      /* byte at [ebp-0x30]; only the low byte is tested */
  int32_t query_count;     /* [ebp-0x24], read once per attempt */
  int32_t query_first;     /* index of this attempt's first entity row */
  int32_t mode;            /* Game+0x26614, sampled AFTER the query */
} IsaacFrameEffect6fd7c0SearchSample;

typedef struct IsaacFrameEffect6fd7c0SearchEntity {
  int32_t type;        /* ent+0x28 */
  uint32_t flags_168;  /* ent+0x168 */
  uint32_t flags_438;  /* ent+0x438 */
} IsaacFrameEffect6fd7c0SearchEntity;

typedef struct IsaacFrameEffect6fd7c0SearchResult {
  int32_t attempts;          /* FUN_0081e9d0 invocations */
  int32_t host_capsule;      /* Capsule::constructor invocations */
  int32_t host_query;        /* FUN_0041ab50 invocations */
  int32_t host_free_inline;  /* FUN_00a648b0 invocations */
  int32_t host_dtor;         /* FUN_004175b0 invocations — 0 or 1 */
  int32_t accepted;          /* a candidate was accepted */
  int32_t accept_attempt;    /* 0-based accepting attempt, else -1 */
  int32_t exhausted;         /* all attempts used, original position kept */
  int32_t samples_exhausted; /* the caller ran out of samples */
  uint32_t out_x_bits;       /* raw pattern handed to FUN_007cd950 */
  uint32_t out_y_bits;
  int32_t from_candidate;    /* 1 = candidate adopted, 0 = original snapshot */
  int32_t host_set_position; /* always 1 */
  int32_t timer_out;         /* max(timer_in, 0x3c), SIGNED (cmovl) */
} IsaacFrameEffect6fd7c0SearchResult;

/* Drives 0x006fd92a…0x006fdab8 over host samples. `orig_*_bits` are the
   ONE pre-loop reads of player+0x33c/+0x340. Entities are a flat table
   indexed by each sample's query_first; a sample whose rows do not fit the
   table is treated as running out of samples. Returns the number of
   attempts executed. */
uint32_t isaac_frame_effect_6fd7c0_position_search(
    IsaacFrameEffect6fd7c0SearchResult* out,
    uint32_t orig_x_bits,
    uint32_t orig_y_bits,
    int32_t timer_in,
    const IsaacFrameEffect6fd7c0SearchSample* samples,
    uint32_t samples_len,
    const IsaacFrameEffect6fd7c0SearchEntity* entities,
    uint32_t entities_len);

/* Whole-branch plan for the player-present edge at 0x006fd8fa…0x006fd924.
   `gate_result` is FUN_008279a0's return; the machine tests AL only. */
typedef struct IsaacFrameEffect6fd7c0PlayerBranchPlan {
  int32_t player_present;   /* [ebp+0x14] != 0 — FULL word test */
  int32_t anim_gate;        /* anim == 3 || anim == 0xc */
  int32_t host_8279a0;      /* the gate call runs */
  int32_t runs_search;      /* gate AL != 0 → the 50-attempt search */
  int32_t falls_to_room_type;/* gate AL == 0 → the 0x006fdad2 classifier */
  int32_t reaches_engine;   /* the search path returns before FUN_0082ee40 */
  int32_t pure_cf_ok;
  int32_t pure_complete;
} IsaacFrameEffect6fd7c0PlayerBranchPlan;

void isaac_frame_effect_6fd7c0_player_branch_plan(
    IsaacFrameEffect6fd7c0PlayerBranchPlan* out,
    uint32_t player,
    uint32_t anim,
    uint32_t gate_result);

/* ---- FUN_008279a0 room-config gate (ABI v9) ---- */

enum {
  ISAAC_FRAME_EFFECT_8279A0_VA = 0x008279a0u,
  ISAAC_FRAME_EFFECT_8279A0_END_VA = 0x008279bau,  /* the false-arm `ret` */
  ISAAC_FRAME_EFFECT_8279A0_RET_BYTES = 0,         /* plain `ret`: no stack args */
  ISAAC_FRAME_EFFECT_8279A0_INSN_COUNT = 12,       /* 27 bytes; see the doc */
  ISAAC_FRAME_EFFECT_8279A0_BYTE_LEN = 27,
  ISAAC_FRAME_EFFECT_8279A0_CALL_COUNT = 0,
  ISAAC_FRAME_EFFECT_8279A0_DIRECT_CALLERS = 15,
  ISAAC_FRAME_EFFECT_8279A0_CALLSITE_VA = 0x006fd91du,
  /* Receiver chain read off the callsite, never assumed. */
  ISAAC_FRAME_EFFECT_8279A0_RECEIVER_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_8279A0_RECEIVER_ROOM_OFF = 0x18300u,     /* Game -> Room */
  ISAAC_FRAME_EFFECT_8279A0_ROOM_GETTER_VA = 0x00407480u,     /* mov eax,[ecx+0x18300]; ret */
  /* Field chain inside the body. */
  ISAAC_FRAME_EFFECT_8279A0_DESC_OFF = 4u,      /* mov eax,[ecx+4]      */
  ISAAC_FRAME_EFFECT_8279A0_CFG_OFF = 0x10u,    /* mov eax,[eax+0x10]   */
  ISAAC_FRAME_EFFECT_8279A0_FIELD8_OFF = 8u,    /* cmp dword [eax+8],..  */
  ISAAC_FRAME_EFFECT_8279A0_FIELD8_VALUE = 0x10,
  ISAAC_FRAME_EFFECT_8279A0_FIELD0_OFF = 0u,    /* cmp dword [eax],..    */
  ISAAC_FRAME_EFFECT_8279A0_FIELD0_VALUE = 0x23,
  /* Branch targets, so the oracle can be written over the PE's own labels. */
  ISAAC_FRAME_EFFECT_8279A0_TRUE_LABEL_VA = 0x008279b5u,   /* mov al,1  */
  ISAAC_FRAME_EFFECT_8279A0_FALSE_LABEL_VA = 0x008279b8u,  /* xor al,al */
  /* Inlined copies of the same predicate; corroboration only, NOT merged. */
  ISAAC_FRAME_EFFECT_8279A0_INLINE_COPIES = 5,
  ISAAC_FRAME_EFFECT_8279A0_INLINE_A_VA = 0x004d8851u,
  ISAAC_FRAME_EFFECT_8279A0_INLINE_B_VA = 0x00596d5cu,
  ISAAC_FRAME_EFFECT_8279A0_INLINE_C_VA = 0x006ab52bu,
  ISAAC_FRAME_EFFECT_8279A0_INLINE_D_VA = 0x006e5b67u,
  ISAAC_FRAME_EFFECT_8279A0_INLINE_E_VA = 0x007f0803u
};

/* Exit arms, in the order the machine evaluates them. */
enum {
  ISAAC_FRAME_EFFECT_8279A0_EXIT_NULL_CFG = 0, /* 0x008279a8 je  */
  ISAAC_FRAME_EFFECT_8279A0_EXIT_FIELD8 = 1,   /* 0x008279ae jne */
  ISAAC_FRAME_EFFECT_8279A0_EXIT_FIELD0 = 2,   /* 0x008279b3 jne */
  ISAAC_FRAME_EFFECT_8279A0_EXIT_TRUE = 3      /* 0x008279b5 mov al,1 */
};

/* The three sparse fields this decision is made of. `cfg_ptr` is the value
   the machine LOADED from [[Room+4]+0x10]; the helper cannot walk guest
   memory, so the caller resolves the two dereferences. There is deliberately
   no descriptor argument: the machine dereferences [Room+4] with no null
   check, and modelling a guard the PE does not have would be an invention. */

/* AL at `ret` — the only bits any of the 15 callers observes. */
int32_t isaac_frame_effect_8279a0_gate(uint32_t cfg_ptr,
                                       int32_t cfg_field_8,
                                       int32_t cfg_field_0);

/* The FULL 32-bit EAX at `ret`. `mov al,1` / `xor al,al` write one byte, so
   the upper 24 bits are the loaded pointer's. Reproduced, not tidied. */
uint32_t isaac_frame_effect_8279a0_eax(uint32_t cfg_ptr,
                                       int32_t cfg_field_8,
                                       int32_t cfg_field_0);

/* Which of the four exits the machine takes; ISAAC_FRAME_EFFECT_8279A0_EXIT_*.
   Ordered like the family's validate classifier: a null cfg reports
   EXIT_NULL_CFG even when the fields would also have failed, because the
   machine branches on the first test. */
int32_t isaac_frame_effect_8279a0_exit_arm(uint32_t cfg_ptr,
                                           int32_t cfg_field_8,
                                           int32_t cfg_field_0);

typedef struct IsaacFrameEffect8279a0Plan {
  int32_t deref_desc;     /* always 1 — [ecx+4] loaded with NO null check */
  int32_t deref_cfg;      /* always 1 — [desc+0x10] loaded unconditionally */
  int32_t cfg_present;    /* test eax,eax — FULL 32-bit pointer test */
  int32_t field8_match;   /* dword [cfg+8] == 0x10; 0 when not evaluated */
  int32_t field0_match;   /* dword [cfg+0] == 0x23; 0 when not evaluated */
  int32_t exit_arm;       /* ISAAC_FRAME_EFFECT_8279A0_EXIT_* */
  int32_t result_al;      /* the byte the callers test */
  uint32_t result_eax;    /* the full word at `ret` */
  int32_t host_calls;     /* always 0 — the body calls nothing */
  int32_t pure_complete;  /* always 1 — the whole function is translated */
} IsaacFrameEffect8279a0Plan;

void isaac_frame_effect_8279a0_plan(IsaacFrameEffect8279a0Plan* out,
                                    uint32_t cfg_ptr,
                                    int32_t cfg_field_8,
                                    int32_t cfg_field_0);

/* Receiver pins. Deliberately distinct from
   isaac_frame_effect_6fd7c0_sfx_base_global_va(): the SFXManager receiver in
   the SAME body comes from 0x00c7169c, this one from g_Game at 0x00c71678. */
uint32_t isaac_frame_effect_8279a0_receiver_global_va(void);
uint32_t isaac_frame_effect_8279a0_receiver_room_off(void);

/* The player-present branch with the gate DERIVED from the three fields
   instead of supplied by the host — the whole point of v9. Fills the same
   IsaacFrameEffect6fd7c0PlayerBranchPlan layout, and must agree field for
   field with isaac_frame_effect_6fd7c0_player_branch_plan called with
   isaac_frame_effect_8279a0_eax(...) as gate_result. */
void isaac_frame_effect_6fd7c0_player_branch_from_fields(
    IsaacFrameEffect6fd7c0PlayerBranchPlan* out,
    uint32_t player,
    uint32_t anim,
    uint32_t cfg_ptr,
    int32_t cfg_field_8,
    int32_t cfg_field_0);


/* ---- FUN_006fe410 start-effect dispatcher ENTRY (ABI v10) ----
 *
 * 0x006fe410..0x006fec17; `ret 0x20` @ 0x006fec17 = 8 dword stack args
 * ([ebp+8]..[ebp+0x24]), `ecx` = this, prologue `push ebp / mov ebp,esp /
 * and esp,-8 / sub esp,0x5c`. The jump table sits AFTER the epilogue at
 * 0x006fec1c (raw bytes b1 e4 6f 00 / bb e4 6f 00 / c5 e4 6f 00 / cf e4 6f
 * 00 / d9 e4 6f 00; linear decode, zero resyncs).
 *
 * Entry-region control flow:
 *
 *   0x006fe446 call 0x8646e0       7-arg marshal, host. Callee cleans 0x1c
 *                                   on the real path (SEH dispatch exits
 *                                   exist); the caller never adjusts esp —
 *                                   verified by the fixed esp-relative
 *                                   locals read right after the call.
 *   g_Game = [0x00c71678]; arg1 is copied to a local BEFORE the mode branch
 *                                   (0x006fe450/0x006fe454) — that copy is
 *                                   the value forwarded to 0x6f0090.
 *   cmp dword [Game+0x26614],2      SIGNED mode gate
 *   jl 0x006fe47f                   mode < 2 skips the host call
 *   mode >= 2: call 0x42b560(ecx=[Game+0x26620], &[ebp+8], &[ebp+0xc],
 *                                   &[ebp+0x1c]) — ret 0xc; the three
 *                                   pointer args mean arg1/arg2/arg6 slots
 *                                   MAY be rewritten, so the switch key is
 *                                   the POST-call arg2 while the forwarded
 *                                   arg1 stays the PRE-call copy.
 *   test esi,esi ; je 0x006fe4e3    player (arg5, [ebp+0x18]) == 0 skips
 *   mov eax,[esi+0x168]             the switch; [player+0x168] &
 *   and eax,0x20000000 ; je         0x20000000 must be SET; arg1 must be
 *   cmp ecx,0x3e8 ; jne             exactly 0x3e8 (unsigned equality).
 *   lea ebx,[arg2-0x16]             SWITCH LAW: add ebx,-0x16 (32-bit
 *   cmp ebx,4 ; ja 0x006fe4ea       wrap), cmp ebx,4; ja = UNSIGNED; the
 *   jmp [ebx*4+0x006fec1c]          wrapped index selects the table:
 *     0 -> 0x006fe4b1 [slot]=0x2e   1 -> 0x006fe4bb [slot]=0x35
 *     2 -> 0x006fe4c5 [slot]=0xcc   3 -> 0x006fe4cf [slot]=0x2c
 *     4 -> 0x006fe4d9 [slot]=0x2d
 *   0x006fe4e3 (skip / fallthrough): [slot] = arg2
 *   0x006fe4ea mov al,[ebp+0x24]    LOW-BYTE gate: and al,1; movzx eax,al
 *   0x006fe4fa call 0x6f0090        host, ret 8: ecx=[this+0x26580],
 *                                   stack (arg1, flag)
 *   result == 0 -> pop/leave, `ret 0x20` @ 0x006fe50d  (early return)
 *   result != 0 -> body continues at 0x006fe510
 *
 * MEASURED DEAD STORE (whole-function path census; see
 * output/decomp/5129df723e64/section-notes/frame-effect-6fe410-dispatch/):
 * the switch slot ([esp+0x10] == [ebp-0x58]) is read ONLY at 0x006fe7c0
 * (`or eax,[esp+0x10]`), and every path into that read passes one of the
 * three later writes 0x006fe713 (=1), 0x006fe765 (=0), 0x006fe78b (=0) —
 * the owning region is entered only through 0x006fe6a5 (jump census: the
 * sole entries are 0x006fe68f, 0x006fe694, 0x006fe6ad). The read at
 * 0x006febff happens after two pops and addresses [ebp-0x50], a DIFFERENT
 * physical slot. So the case constants are dynamically dead in this build:
 * the machine executes the switch and no consumer ever sees its result. A
 * future peel of the entry region may omit the dispatch entirely; the
 * observable behaviour is the 0x6f0090 call (receiver, arg1, flag) and the
 * result==0 early return. The plan pins slot_reaches_reader = 0 so the
 * claim cannot silently rot.
 *
 * No exact ZHL match for 0x6f0090 / 0x8646e0 / 0x42b560 (identify-zhl all
 * empty); all three keep address-stable host names. */
enum {
  ISAAC_FRAME_EFFECT_6FE410_VA = 0x006fe410u,
  ISAAC_FRAME_EFFECT_6FE410_END_VA = 0x006fec17u, /* the `ret 0x20` */
  ISAAC_FRAME_EFFECT_6FE410_RET_BYTES = 0x20,
  ISAAC_FRAME_EFFECT_6FE410_ARG_COUNT = 8,
  ISAAC_FRAME_EFFECT_6FE410_JUMP_TABLE_VA = 0x006fec1cu,
  ISAAC_FRAME_EFFECT_6FE410_TABLE_ENTRIES = 5,
  ISAAC_FRAME_EFFECT_6FE410_CASE_0 = 0x2e,
  ISAAC_FRAME_EFFECT_6FE410_CASE_1 = 0x35,
  ISAAC_FRAME_EFFECT_6FE410_CASE_2 = 0xcc,
  ISAAC_FRAME_EFFECT_6FE410_CASE_3 = 0x2c,
  ISAAC_FRAME_EFFECT_6FE410_CASE_4 = 0x2d,
  ISAAC_FRAME_EFFECT_6FE410_SWITCH_BIAS = -0x16, /* add ebx,-0x16 */
  ISAAC_FRAME_EFFECT_6FE410_SWITCH_CAP = 4,      /* cmp ebx,4; ja */
  ISAAC_FRAME_EFFECT_6FE410_GATE_ARG1 = 0x3e8,   /* cmp ecx,0x3e8 */
  ISAAC_FRAME_EFFECT_6FE410_GATE_PLAYER_MASK = 0x20000000u, /* [esi+0x168] */
  ISAAC_FRAME_EFFECT_6FE410_PLAYER_FLAGS_OFF = 0x168,
  ISAAC_FRAME_EFFECT_6FE410_RECEIVER_OFF = 0x26580, /* ecx=[this+0x26580] */
  ISAAC_FRAME_EFFECT_6FE410_CALL_VA = 0x006f0090u,
  ISAAC_FRAME_EFFECT_6FE410_MODE_FIELD_OFF = 0x26614, /* Game+0x26614 */
  ISAAC_FRAME_EFFECT_6FE410_MODE_CALL_VA = 0x0042b560u,
  ISAAC_FRAME_EFFECT_6FE410_MARSHAL_VA = 0x008646e0u,
  ISAAC_FRAME_EFFECT_6FE410_EARLY_RET_VA = 0x006fe50du,
  ISAAC_FRAME_EFFECT_6FE410_CONTINUE_VA = 0x006fe510u
};

/* cmp dword [Game+0x26614],2 ; jl skip — SIGNED mode >= 2 opens the host
   0x42b560 call. */
int32_t isaac_frame_effect_6fe410_mode_ge2(uint32_t mode);

/* The three-gate that precedes the switch: player != 0,
   [player+0x168] & 0x20000000 != 0, arg1 == 0x3e8. Any failure jumps to
   the slot=arg2 path. */
int32_t isaac_frame_effect_6fe410_switch_gate(uint32_t arg1,
                                              uint32_t player_nonzero,
                                              uint32_t player_flags_168);

/* The case-selection law alone: idx = arg2-0x16 (32-bit wrap), UNSIGNED
   idx <= 4 -> table constant, else arg2. The machine only APPLIES it when
   the gate is open; compose with entry_plan for the gated value. */
uint32_t isaac_frame_effect_6fe410_case_value(uint32_t arg2);

/* mov al,[ebp+0x24] ; and al,1 ; movzx eax,al — the low-bit byte gate
   forwarded as the second stack arg of the 0x6f0090 call. uint32_t on
   purpose: the Wasm ABI does not narrow, and a uint8_t parameter would
   disagree with the PE for any arg8 above 0xff. */
uint32_t isaac_frame_effect_6fe410_call_flag(uint32_t arg8);

typedef struct IsaacFrameEffect6fe410EntryPlan {
  int32_t mode_ge2;            /* signed [Game+0x26614] >= 2 */
  int32_t host_42b560;         /* == mode_ge2 */
  int32_t player_present;      /* arg5 != 0 */
  int32_t player_flag;         /* [arg5+0x168] & 0x20000000 */
  int32_t reaches_switch;      /* all three gates */
  int32_t switch_index;        /* 0..4 when the table fires, else -1 */
  uint32_t slot_value;         /* what the machine stores at [ebp-0x58] */
  int32_t slot_reaches_reader; /* 0 — MEASURED DEAD STORE (path census) */
  int32_t call_6f0090;         /* always 1 — every path past the dispatch */
  uint32_t call_arg1;          /* forwarded unchanged (pre-0x42b560 copy) */
  uint32_t call_flag;          /* arg8 & 1 */
  uint32_t receiver_off;       /* 0x26580 */
  int32_t early_return_on_zero; /* result==0 -> ret 0x20 @ 0x006fe50d */
  uint32_t continue_va;        /* 0x006fe510 */
  int32_t pure_cf_ok;          /* 1 — the entry control flow is translated */
  int32_t pure_complete;       /* 0 — 0x6f0090 and the body stay host */
} IsaacFrameEffect6fe410EntryPlan;

void isaac_frame_effect_6fe410_entry_plan(IsaacFrameEffect6fe410EntryPlan* out,
                                          uint32_t mode,
                                          uint32_t arg1,
                                          uint32_t arg2,
                                          uint32_t player_nonzero,
                                          uint32_t player_flags_168,
                                          uint32_t arg8);

/* ---- FUN_006fe410 result!=0 continuation (ABI v11) ----
 *
 * The body that runs when the 0x6f0090 factory call returns nonzero:
 * 0x006fe510..0x006fec17 (ret 0x20 @ 0x006fec17). Entry dispatch may be
 * omitted (dead store, v10) but the continuation itself is transcribed
 * below from the linear decode (543 instructions, 0 resyncs; the same
 * disasm file as v10).
 *
 * MACHINE FLOW (registers at 0x006fe510: edi = this, esi = player (arg5),
 * ebx = effect object returned by 0x6f0090, esp = ebp-0x68):
 *
 *  (1) HASH 1 (0x006fe510..0x006fe587) — PURE:
 *      V1 = 0xa68490()  (host; 64-bit value in edx:eax, see below)
 *      R1 = (V1 * 0x431bde82d7b634db) >> 82   ; 64-bit result
 *      [ebp-0x50] = R1.lo ; [ebp-0x30] = R1.hi
 *      The machine expands the 64x64->128 product with the four limb
 *      multiplies (b*d, b*c, a*d, a*c), keeps bits 64..127 in edx:ecx and
 *      shifts right by 0x12 (shrd/shr). The final value is exactly
 *      (V1*K) >> 82 — verified arithmetic identity, not an approximation.
 *  (2) head stores (0x006fe58b..0x006fe5d0): effect+0x34 = player?[p+0x28]:0,
 *      effect+0x38 = player?[p+0x2c]:0; then the [effect+0x3c8] list relink
 *      (host 0x4cf210 / 0x4cdcf0 — same list family as the Lua engine).
 *  (3) position copies (0x006fe5d4..0x006fe5fb): effect+0x33c/0x340 =
 *      [arg3]/[arg3+4]; effect+0x360/0x364 = [arg4]/[arg4+4]; then virtual
 *      call [vtable+4](effect, arg1copy, slot, arg6, arg7) — host, ret 0x10
 *      (the following esp-relative reads only balance for ret 0x10).
 *  (4) room counter (0x006fe613..0x006fe62d) — PURE law:
 *      old = [Game+0x18300 -> Room + 0x1214]; Room+0x1214 = old+1;
 *      effect+0x20 = old; then host 0x418500(Room+0x1218, effect) (push).
 *  (5) player-present Entity path (0x006fe63b..0x006fea8c):
 *      test player; je tail; 0x6b5b90(player, 1) IsActiveEnemy (host, AL);
 *      je tail; gate1 = [player+0x16c] & 0x10000000:
 *        SET  -> branch A (PURE stores): effect+0x16c |= 0x10000000,
 *                and |= 0x20 when arg1 not in {9, 7} (full-dword equality
 *                tests on the PRE-0x42b560 arg1 copy [ebp-0x54]);
 *                effect+0x168 = effect+0x168 (self-store, kept).
 *                Then the [player+0x264] entity struct copy
 *                (0x006fe6a5..0x006fe70b: fields +0x28..+0x38 and floats
 *                +0x33c..+0x364, movss raw), the slot flag word
 *                (0x006fe711..0x006fe7c0), and AddCharmed(effect, &struct,
 *                -1, 0, 0) @ 0x006fe7d7 — host.
 *                MEASURED DEAD STORE: the combined flag word computed at
 *                0x006fe7ba..0x006fe7c0 is stored to [ebp-0x8]
 *                (0x006fe7c8) and never read again in the whole body.
 *        CLEAR -> branch B (host): 0x417430(player, 0, 0x20000000) AL;
 *                if AL: 0x435c70(&struct, -1, 0, 0) then
 *                AddCharmed(effect, eax, -1, 0, 0) @ 0x006fe81e.
 *      shared: 0xaf08b1(player, 0, 0xc5d5dc, 0xc5d6ac, 0) -> A and
 *              0xaf08b1(effect, 0, 0xc5d5dc, 0xc5d6ac, 0) -> B (host,
 *              cdecl 5 args, caller add esp,0x14); A==0 or B==0 -> tail.
 *      0x417430(B, 0, 1) AL -> jne 0x6fe9a0 (skip both status applies).
 *      0x417430(player, 0, 0x1000000) AL -> AddBrimstoneMark(B, &struct,
 *              0x5a) @ 0x006fe8f0 (struct = 40 zero bytes, see below).
 *      0x417430(player, 0, 0x1000000) AL -> AddShrink(B, &struct, 0x5a,
 *              0, 0) @ 0x006fe970.
 *      [B+0x23c] > 0 (SIGNED jle) -> PURE stores: B+0x168 |= 0x1000000;
 *              B+0x16c = B+0x16c (self); B+0x3b4 = B+0x3b8.
 *      scale block (0x006fe9a0..0x006fea4e) — PURE f32, machine order:
 *              t1 = A.f48 * B.c38 ; B.c38 = t1
 *              t2 = t1 * B.3b4
 *              B.e8 = t2 * 1.0f ; B.e4 = t2 * 1.0f   (0xc3793c/0xc37940
 *                                                     = 0x3f800000, .data
 *                                                     file-backed, verified)
 *              B.f48 *= A.f48 ; B.f44 *= A.f44
 *              B.384 *= A.f44 ; B.380 *= A.f44
 *      virtual [vtable+0x4c](B) AL; if AL and A.f54 != B.f54: the
 *              [B+0xf54] relink (host 0x4cf210/0x4cdcf0, same list law).
 *  (6) tail (0x006fea8c..0x006feb8d): host 0x7078f0(effect) AL ->
 *      0x7079c0(effect, ...); byte [effect+0x172] == 0 -> skip to hash 2;
 *      [Game+0x67758] == [Game+0x6775c] -> skip; else host 0x9e24a0 x1/x2
 *      (second call only when the first leaves [esp+0x34] == [Game+0x67780])
 *      then the player walk over [Game+0x1baa8..0x1baac] — THE SAME LAW as
 *      FUN_006fe2f0 (v5): signed sar-2 count, zero-only enter test,
 *      per-iteration re-derived head count with the level-0x10 0xb7e6bc
 *      log, jae slot clamp defect, unsigned jb continue; per player:
 *      0x9e0680(ecx = *slot + 0x1fc8, 6, effect, arg3, arg4).
 *  (7) HASH 2 + ACCUMULATOR (0x006feb8d..0x006fec0e) — PURE:
 *      V2 = 0xa68490(); R2 = (V2 * 0x431bde82d7b634db) >> 82;
 *      [0xc7b630] += R2.lo - R1.lo ; [0xc7b634] += R2.hi - R1.hi (+ borrow)
 *      i.e. the 64-bit global accumulator at 0xc7b630:0xc7b634 gains
 *      (R2 - R1). The `mov eax,[esp+0x18]` at 0x006febf3 loads the effect
 *      pointer into a dead register (never consumed).
 *
 * The 40-byte status struct ([ebp-0x28..0x4]): dwords 0..3 = 0, floats
 * 4..7 = +0.0f from 0xc7b640/0xc7b644, dwords 8..9 = 0. 0xc7b640/0xc7b644
 * are 0x19840 bytes past .data's raw end (BSS, zero at load) with a
 * censused 5023 readers / 0 writers in .text — +0.0f for the process
 * lifetime (AGENTS.md measured instance). So the struct is 40 zero bytes.
 *
 * 0xa68490 (host, address-stable, ZHL-empty): head calls the two IAT
 * slots 0xb18238/0xb18234, divides and scales a double, then
 * 0xaefd70 converts to a 64-bit integer returned in edx:eax. Its exact
 * inputs stay host; only the downstream pure law is modelled.
 *
 * identify-zhl on every new callee (0xa68490, 0x417430, 0x435c70,
 * 0xaf08b1, 0x7078f0, 0x7079c0, 0x9e24a0, 0x9e0680, 0x418500, 0x4cf210,
 * 0x4cdcf0, 0x4a5d10): NO exact matches — all stay address-stable. The
 * four Entity calls (0x6b5b90 IsActiveEnemy, 0x6ad870 AddCharmed,
 * 0x6b5c10 AddShrink, 0x6b78d0 AddBrimstoneMark) are exact ZHL and stay
 * host (they mutate live entities; only their call SHAPE is recorded).
 *
 * Nothing here is wired into the Update slice (freestanding family rule).
 */

enum {
  ISAAC_FRAME_EFFECT_6FE410_CONTINUE_VA_ = 0x006fe510u, /* body start */
  ISAAC_FRAME_EFFECT_6FE410_HASH_VA = 0x00a68490u,
  ISAAC_FRAME_EFFECT_6FE410_HASH_K_LO = 0xd7b634dbu,
  ISAAC_FRAME_EFFECT_6FE410_HASH_K_HI = 0x431bde82u,
  ISAAC_FRAME_EFFECT_6FE410_HASH_SHIFT = 0x12,  /* shrd/shr on bits 64..127 */
  ISAAC_FRAME_EFFECT_6FE410_HASH_ACC_LO_VA = 0x00c7b630u,
  ISAAC_FRAME_EFFECT_6FE410_HASH_ACC_HI_VA = 0x00c7b634u,
  ISAAC_FRAME_EFFECT_6FE410_EFFECT_3C8_OFF = 0x3c8,
  ISAAC_FRAME_EFFECT_6FE410_EFFECT_3CC_OFF = 0x3cc,
  ISAAC_FRAME_EFFECT_6FE410_ROOM_COUNTER_OFF = 0x1214,
  ISAAC_FRAME_EFFECT_6FE410_ROOM_LIST_OFF = 0x1218,
  ISAAC_FRAME_EFFECT_6FE410_ROOM_PTR_OFF = 0x18300,
  ISAAC_FRAME_EFFECT_6FE410_PLAYER_GATE_16C = 0x10000000u,
  ISAAC_FRAME_EFFECT_6FE410_FLAG_20 = 0x20u,
  ISAAC_FRAME_EFFECT_6FE410_ARG1_SPECIAL_A = 9,
  ISAAC_FRAME_EFFECT_6FE410_ARG1_SPECIAL_B = 7,
  ISAAC_FRAME_EFFECT_6FE410_B_SHIELD_168 = 0x1000000u,
  ISAAC_FRAME_EFFECT_6FE410_B_23C_OFF = 0x23c,
  ISAAC_FRAME_EFFECT_6FE410_B_3B4_OFF = 0x3b4,
  ISAAC_FRAME_EFFECT_6FE410_B_3B8_OFF = 0x3b8,
  ISAAC_FRAME_EFFECT_6FE410_B_168_OFF = 0x168,
  ISAAC_FRAME_EFFECT_6FE410_B_16C_OFF = 0x16c,
  ISAAC_FRAME_EFFECT_6FE410_F54_OFF = 0xf54,
  ISAAC_FRAME_EFFECT_6FE410_WALK_RECV_OFF = 0x1fc8,
  ISAAC_FRAME_EFFECT_6FE410_WALK_ARG = 6,
  ISAAC_FRAME_EFFECT_6FE410_STATUS_STRUCT_SIZE = 0x28, /* 40 zero bytes */
  ISAAC_FRAME_EFFECT_6FE410_SCALE_1F_VA = 0x00c3793cu, /* 0x3f800000 */
  ISAAC_FRAME_EFFECT_6FE410_SCALE_2F_VA = 0x00c37940u, /* 0x3f800000 */
  ISAAC_FRAME_EFFECT_6FE410_ZERO_F_A_VA = 0x00c7b640u, /* BSS, +0.0f */
  ISAAC_FRAME_EFFECT_6FE410_ZERO_F_B_VA = 0x00c7b644u, /* BSS, +0.0f */
  ISAAC_FRAME_EFFECT_6FE410_TAIL_BYTE_OFF = 0x172,
  ISAAC_FRAME_EFFECT_6FE410_TAIL_EQ_A_OFF = 0x67758,
  ISAAC_FRAME_EFFECT_6FE410_TAIL_EQ_B_OFF = 0x6775c,
  ISAAC_FRAME_EFFECT_6FE410_TAIL_LIST_OFF = 0x67780,
  ISAAC_FRAME_EFFECT_6FE410_PLAYERS_BEGIN_OFF = 0x1baa8,
  ISAAC_FRAME_EFFECT_6FE410_PLAYERS_END_OFF = 0x1baac,
  ISAAC_FRAME_EFFECT_6FE410_PLAYERS_STRIDE = 4,
  ISAAC_FRAME_EFFECT_6FE410_TAIL_LOG_STR_VA = 0x00b7e6bcu,
  ISAAC_FRAME_EFFECT_6FE410_TAIL_LOG_LEVEL = 0x10,
  ISAAC_FRAME_EFFECT_6FE410_VTABLE_INIT_SLOT = 4,
  ISAAC_FRAME_EFFECT_6FE410_VTABLE_4C_SLOT = 0x4c,
  ISAAC_FRAME_EFFECT_6FE410_HOST_417430_VA = 0x00417430u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_435C70_VA = 0x00435c70u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_AF08B1_VA = 0x00af08b1u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_7078F0_VA = 0x007078f0u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_7079C0_VA = 0x007079c0u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_9E24A0_VA = 0x009e24a0u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_9E0680_VA = 0x009e0680u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_418500_VA = 0x00418500u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_4CF210_VA = 0x004cf210u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_4CDCF0_VA = 0x004cdcf0u,
  ISAAC_FRAME_EFFECT_6FE410_HOST_4A5D10_VA = 0x004a5d10u
};

/* (V * 0x431bde82d7b634db) >> 82 — the 64-bit hash law, identical at
   0x006fe510 and 0x006feb8d. V is the host 0xa68490 result (edx:eax).
   Implemented with 32-bit limb multiplies (the machine's own 4-product
   decomposition); out_lo/out_hi may be null. */
void isaac_frame_effect_6fe410_hash64(uint32_t v_lo, uint32_t v_hi,
                                      uint32_t* out_lo, uint32_t* out_hi);

/* Branch-A flag stores (0x006fe66a..0x006fe69f), reached only when
   [player+0x16c] & 0x10000000 is SET: effect+0x168 keeps its value
   (self-store) and effect+0x16c gains 0x10000000 plus 0x20 when arg1 is
   neither 9 nor 7 (full-dword equality tests on the pre-0x42b560 copy). */
void isaac_frame_effect_6fe410_effect_flags(uint32_t arg1,
                                            uint32_t flags_168_in,
                                            uint32_t flags_16c_in,
                                            uint32_t* out_168,
                                            uint32_t* out_16c);

/* Head stores: effect+0x34/0x38 = player fields or 0 (0x006fe58b..
   0x006fe5a1), and the room counter law (0x006fe61e..0x006fe62d):
   effect+0x20 = old; Room+0x1214 = old+1. */
void isaac_frame_effect_6fe410_head_stores(uint32_t player_nonzero,
                                           uint32_t player_field_28,
                                           uint32_t player_field_2c,
                                           uint32_t* effect_34,
                                           uint32_t* effect_38);
void isaac_frame_effect_6fe410_room_counter(uint32_t old_counter,
                                            uint32_t* room_field_1214,
                                            uint32_t* effect_field_20);

/* The scale block (0x006fe9a0..0x006fea46), f32 in machine order. Both
   0xc3793c and 0xc37940 hold 0x3f800000 (1.0f), verified from .data raw.
   Inputs are the post-walk field values the machine reads (B+0x3b4 AFTER
   the [B+0x23c]>0 store). Null struct out is skipped. */
typedef struct IsaacFrameEffect6fe410ScaleOut {
  float b_c38;  /* t1 = A.f48 * B.c38 */
  float b_e8;   /* t2 * 1.0f */
  float b_e4;   /* t2 * 1.0f */
  float b_f48;  /* B.f48 * A.f48 */
  float b_f44;  /* B.f44 * A.f44 */
  float b_384;  /* B.384 * A.f44 */
  float b_380;  /* B.380 * A.f44 */
} IsaacFrameEffect6fe410ScaleOut;

void isaac_frame_effect_6fe410_scale_fields(IsaacFrameEffect6fe410ScaleOut* out,
                                            float a_f48,
                                            float b_c38,
                                            float b_3b4,
                                            float b_f48,
                                            float b_f44,
                                            float b_384,
                                            float b_380,
                                            float a_f44);

/* 64-bit accumulator law (0x006febff..0x006fec0e):
   acc += (R2 - R1), all mod 2^32 per limb with borrow/carry. The caller
   supplies the current [0xc7b630]/[0xc7b634] values. */
void isaac_frame_effect_6fe410_acc_delta(uint32_t hash1_lo, uint32_t hash1_hi,
                                         uint32_t hash2_lo, uint32_t hash2_hi,
                                         uint32_t acc_lo, uint32_t acc_hi,
                                         uint32_t* out_lo, uint32_t* out_hi);

/* 0x006feb66: add ecx,0x1fc8 — the receiver sub-object of each walked
   player passed to 0x9e0680. */
uint32_t isaac_frame_effect_6fe410_walk_receiver(uint32_t slot);

/* The player-present Entity path (5) as a typed plan. `status_path` is
   player != 0 && IsActiveEnemy AL; the rest are host-observed booleans. */
typedef struct IsaacFrameEffect6fe410PlayerPathPlan {
  int32_t player_path;        /* status_path */
  int32_t host_is_active_enemy; /* = player_path */
  int32_t gate1_16c;          /* [player+0x16c] & 0x10000000 */
  int32_t effect_flag_store;  /* status_path && gate1 → branch A stores */
  uint32_t effect_168_out;    /* branch A law */
  uint32_t effect_16c_out;
  int32_t host_addcharmed;    /* status_path && (gate1 || al_gate1_417430) */
  int32_t host_435c70;        /* status_path && !gate1 && al_gate1_417430 */
  int32_t host_af08b1;        /* status_path (two calls: player, effect) */
  int32_t status_skip;        /* !status_path || !A || !B || al_b_417430 */
  int32_t host_417430_b;      /* !skip → 0x417430(B,0,1) */
  int32_t host_brimstone;     /* !skip && player_al_1 → AddBrimstoneMark */
  int32_t host_shrink;        /* !skip && player_al_2 → AddShrink */
  int32_t b_shield_store;     /* !skip && [B+0x23c] > 0 (SIGNED) */
  uint32_t b_168_out;         /* |= 0x1000000 when the store runs */
  uint32_t b_3b4_out;         /* = B+0x3b8 when the store runs */
  int32_t host_virtual_4c;    /* !skip → [vtable+0x4c](B) */
  int32_t host_list_relink2;  /* !skip && virtual_al && A.f54 != B.f54 */
  int32_t pure_cf_ok;
  int32_t pure_complete;      /* 0 — the entity callees stay host */
} IsaacFrameEffect6fe410PlayerPathPlan;

void isaac_frame_effect_6fe410_player_path_plan(
    IsaacFrameEffect6fe410PlayerPathPlan* out,
    uint32_t status_path,
    uint32_t gate1_16c,
    uint32_t arg1,
    uint32_t effect_168_in,
    uint32_t effect_16c_in,
    uint32_t al_gate1_417430,
    uint32_t a_nonzero,
    uint32_t b_nonzero,
    uint32_t al_b_417430,
    uint32_t player_al_1,
    uint32_t player_al_2,
    int32_t b_field_23c,
    uint32_t b_168_in,
    uint32_t b_3b8,
    uint32_t virtual_4c_al,
    uint32_t f54_differ);

/* The tail (6)+(7) as a typed plan. begin/end are the player-vector
   bounds read at 0x006feb1e; the walk law is the v5 6fe2f0 one (reused
   verbatim, cross-pinned). `second_9e24a0` is host-observed. */
typedef struct IsaacFrameEffect6fe410TailPlan {
  uint32_t hash1_lo;          /* (V1*K) >> 82 */
  uint32_t hash1_hi;
  uint32_t hash2_lo;
  uint32_t hash2_hi;
  uint32_t delta_lo;          /* R2 - R1 (64-bit) */
  uint32_t delta_hi;
  int32_t host_hash1;         /* 0xa68490 call 1 — always 1 */
  int32_t host_hash2;         /* 0xa68490 call 2 — always 1 */
  int32_t host_7078f0;        /* always 1 */
  int32_t host_7079c0;        /* = al_7078f0 */
  int32_t tail_byte_172;      /* [effect+0x172] != 0 */
  int32_t tail_eq;            /* [Game+0x67758] == [Game+0x6775c] */
  int32_t tail_walk_gate;     /* tail_byte_172 && !tail_eq */
  int32_t host_9e24a0;        /* tail_walk_gate (one call) */
  int32_t host_9e24a0_second; /* tail_walk_gate && second_9e24a0 */
  int32_t walk_entered;       /* sar-2 count != 0 (zero-only enter test) */
  int32_t host_acc_add;       /* always 1 */
  int32_t pure_cf_ok;
  int32_t pure_complete;      /* 0 — 0x9e0680/0x7078f0/0x7079c0 host */
} IsaacFrameEffect6fe410TailPlan;

void isaac_frame_effect_6fe410_tail_plan(IsaacFrameEffect6fe410TailPlan* out,
                                         uint32_t v1_lo,
                                         uint32_t v1_hi,
                                         uint32_t v2_lo,
                                         uint32_t v2_hi,
                                         uint32_t begin,
                                         uint32_t end,
                                         uint32_t tail_byte_172,
                                         uint32_t game_eq_67758_6775c,
                                         uint32_t al_7078f0,
                                         uint32_t second_9e24a0);


/* ---- FUN_0081e9d0 candidate position (ABI v12) ----
 *
 * 0x0081e9d0…0x0081ecb7 (ret 8 @ 0x0081eb81 / 0x0081ec00 / 0x0081ecb7),
 * thiscall, ecx = Room, [ebp+8] = out Vec2, [ebp+0xc] = margin f32.
 * 169 instructions, 746 bytes, 0 resyncs. Linear decode, capstone 5.0.7
 * CS_MODE_32, function start anchored by the preceding int3 run; the
 * first `ret 8` at 0x0081eb81 is the L-room arm-B exit, NOT the end —
 * arm A continues at 0x0081eb84 and the AABB tail at 0x0081ec03, then
 * six int3 bytes and sibling 0x0081ecc0.
 *
 * identify-zhl: 0x0081e9d0 none (address-stable). Callees:
 *   0x0081f8b0  exact ZHL Room::GetLRoomAreaDesc — HOST (render-shell
 *               already owns the body; this family only records the call)
 *   0x006eef60  exact Isaac::genrand_int32 / Random() 24-byte collision
 *               — HOST; only the downstream unit-float law is modelled
 *   0x00812f50  none — HOST (room family owns the clamp body)
 *
 * MACHINE FLOW (edi = Room after 0x0081e9db):
 *
 *  (1) TYPE GATE (0x0081e9dd…0x0081e9ec) — PURE, no null checks:
 *      eax = [[Room+4]+0x10]+0x48          ; same desc/cfg chain as v9
 *      add eax,-9 ; cmp eax,3 ; ja 0x81ec03
 *      UNSIGNED window: type ∈ [9, 12] → L-room, else AABB.
 *      The descriptor load is UNCONDITIONAL (v9 trap, reproduced).
 *
 *  (2) L-ROOM (type in window) — host 0x81f8b0 fills 8 floats, then
 *      PURE inset / area / pick / sample:
 *        wA = (b2+m) - (b0-m) ; wB = (b6+m) - (b4-m)
 *        comiss wB, wA ; jbe → wB<=wA OR unordered
 *          ja  (wB > wA):  yB0 = b5-m ; hA = (b5-m)-(b1-m) ; hB = (b7+m)-(b5-m)
 *          jbe          :  yB0 = b3+m ; hA = (b3+m)-(b1-m) ; hB = (b7+m)-(b3+m)
 *        absA = andps(hA*wA, 0x7fffffff) ; absB = andps(hB*wB, 0x7fffffff)
 *        weight = absA / (absA+absB)     ; 0/0 → NaN, reproduced
 *        u0 = unit(genrand) ; comiss u0, weight ; jb → arm A
 *          jb = u0 < weight OR unordered (NaN takes A)
 *        arm A: x = wA*u1 + (b0-m) ; y = u2*hA + (b1-m)
 *        arm B: x = wB*u1 + (b4-m) ; y = u2*hB + yB0
 *      Three genrand draws, then `ret 8`. No clamp.
 *
 *  (3) AABB (ja from the type gate) — PURE lerp then HOST clamp:
 *      u0,u1 = unit(genrand) x2
 *      tmp.x = (Room+0x1c - Room+0x14)*u0 + Room+0x14
 *      tmp.y = (Room+0x20 - Room+0x18)*u1 + Room+0x18
 *      0x812f50(ecx=Room, out, &tmp, m, m, m) — host, ret after
 *
 *  UNIT FLOAT (both paths, two encodings of the same law):
 *      L-room: xorps ; cvtsi2sd eax ; shr 31 ; addsd [eax*8+0xbacb00]
 *      AABB:   movd  ; cvtdq2pd     ; shr 31 ; addsd [eax*8+0xbacb00]
 *      then cvtpd2ps ; mulss [0xba9ff4]=0x2f800000 (2^-32).
 *      Signed i32→f64 + 2^32 when the sign bit is set. Table at
 *      0x00bacb00 is .rdata {0.0, 2^32} (section-table VA→raw).
 *
 *  REACH CENSUS (E8 rel32 over .text + raw LE-dword over all five
 *  sections; VA via section table, not a .text-relative formula):
 *      68 direct rel32 calls, 0 E9 tails. Raw dword hits: 2 in .text
 *      (0x0086c890, 0x0089112a — Lua `push 0x81e9d0` address-taken),
 *      0 in .rdata/.data/.rsrc/.reloc. No vtable slot.
 *      Family callsite 0x006fd958 pushes margin = 0.0f.
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81E9D0_VA = 0x0081e9d0u,
  ISAAC_FRAME_EFFECT_81E9D0_END_VA = 0x0081ecb7u,
  ISAAC_FRAME_EFFECT_81E9D0_NEXT_VA = 0x0081ecc0u, /* sibling after int3 */
  ISAAC_FRAME_EFFECT_81E9D0_RET_BYTES = 8,
  ISAAC_FRAME_EFFECT_81E9D0_INSN_COUNT = 169,
  ISAAC_FRAME_EFFECT_81E9D0_BYTE_LEN = 746,
  ISAAC_FRAME_EFFECT_81E9D0_CALL_INSNS = 9,
  ISAAC_FRAME_EFFECT_81E9D0_DIRECT_CALLERS = 68,
  ISAAC_FRAME_EFFECT_81E9D0_RAW_DWORD_HITS = 2,
  ISAAC_FRAME_EFFECT_81E9D0_CALLSITE_VA = 0x006fd958u,
  ISAAC_FRAME_EFFECT_81E9D0_ADDR_TAKEN_A_VA = 0x0086c890u,
  ISAAC_FRAME_EFFECT_81E9D0_ADDR_TAKEN_B_VA = 0x0089112au,
  ISAAC_FRAME_EFFECT_81E9D0_DESC_OFF = 4u,
  ISAAC_FRAME_EFFECT_81E9D0_CFG_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_81E9D0_TYPE_OFF = 0x48u,
  ISAAC_FRAME_EFFECT_81E9D0_TYPE_BIAS = 9u,   /* add eax,-9 */
  ISAAC_FRAME_EFFECT_81E9D0_TYPE_SPAN = 3u,   /* cmp eax,3 ; ja */
  ISAAC_FRAME_EFFECT_81E9D0_ROOM_X0_OFF = 0x14u,
  ISAAC_FRAME_EFFECT_81E9D0_ROOM_Y0_OFF = 0x18u,
  ISAAC_FRAME_EFFECT_81E9D0_ROOM_X1_OFF = 0x1cu,
  ISAAC_FRAME_EFFECT_81E9D0_ROOM_Y1_OFF = 0x20u,
  ISAAC_FRAME_EFFECT_81E9D0_LROOM_FLOATS = 8,
  ISAAC_FRAME_EFFECT_81E9D0_UNIT_SCALE_VA = 0x00ba9ff4u,
  ISAAC_FRAME_EFFECT_81E9D0_UNIT_SCALE_BITS = 0x2f800000u,
  ISAAC_FRAME_EFFECT_81E9D0_BIAS_TABLE_VA = 0x00bacb00u,
  ISAAC_FRAME_EFFECT_81E9D0_ABS_MASK_VA = 0x00bacb40u,
  ISAAC_FRAME_EFFECT_81E9D0_ABS_MASK_BITS = 0x7fffffffu,
  ISAAC_FRAME_EFFECT_81E9D0_HOST_81F8B0_VA = 0x0081f8b0u,
  ISAAC_FRAME_EFFECT_81E9D0_HOST_812F50_VA = 0x00812f50u,
  ISAAC_FRAME_EFFECT_81E9D0_HOST_GENRAND_VA = 0x006eef60u,
  ISAAC_FRAME_EFFECT_81E9D0_RET_LROOM_B_VA = 0x0081eb81u,
  ISAAC_FRAME_EFFECT_81E9D0_RET_LROOM_A_VA = 0x0081ec00u,
  ISAAC_FRAME_EFFECT_81E9D0_RET_AABB_VA = 0x0081ecb7u
};

enum {
  ISAAC_FRAME_EFFECT_81E9D0_ARM_A = 0, /* jb from weight compare */
  ISAAC_FRAME_EFFECT_81E9D0_ARM_B = 1  /* fallthrough, unit >= weight */
};

/* add eax,-9 ; cmp eax,3 ; ja — UNSIGNED. 1 when type ∈ [9,12]. */
int32_t isaac_frame_effect_81e9d0_lroom_type(uint32_t type48);

/* xorps/cvtsi2sd + bacb00[sign] + cvtpd2ps * 0x2f800000. */
float isaac_frame_effect_81e9d0_unit_float(uint32_t genrand);

/* dest = lo + (hi-lo)*unit, f32 machine order (AABB pre-clamp). */
float isaac_frame_effect_81e9d0_aabb_lerp(float lo, float hi, float unit);

/* andps with 0x7fffffff — in-body mask, full dword in / full dword out. */
uint32_t isaac_frame_effect_81e9d0_fabs_bits(uint32_t bits);

/* comiss a,b ; jb  — 1 when a < b OR unordered. */
int32_t isaac_frame_effect_81e9d0_comiss_jb(float a, float b);
/* comiss a,b ; jbe — 1 when a <= b OR unordered. */
int32_t isaac_frame_effect_81e9d0_comiss_jbe(float a, float b);

typedef struct IsaacFrameEffect81e9d0LRoomGeom {
  float width_a;
  float width_b;
  float height_a;
  float height_b;
  float origin_ax;
  float origin_ay;
  float origin_bx;
  float origin_by;
  float abs_area_a;
  float abs_area_b;
  float weight;
  int32_t b_gt_a; /* 1 iff wB > wA (ordered); NaN takes the jbe arm */
} IsaacFrameEffect81e9d0LRoomGeom;

/* Inset + area + weight from the 8-float GetLRoomAreaDesc buffer.
   Null out / null desc skipped. */
void isaac_frame_effect_81e9d0_lroom_geom(IsaacFrameEffect81e9d0LRoomGeom* out,
                                          const float* desc8,
                                          float margin);

/* 0 = arm A (jb), 1 = arm B. Null geom → A. */
int32_t isaac_frame_effect_81e9d0_lroom_arm(
    const IsaacFrameEffect81e9d0LRoomGeom* geom, float unit0);

/* Writes the accepted (x,y). Null outs skipped per pointer. */
void isaac_frame_effect_81e9d0_lroom_sample(
    float* out_x, float* out_y,
    const IsaacFrameEffect81e9d0LRoomGeom* geom,
    int32_t arm, float unit1, float unit2);

typedef struct IsaacFrameEffect81e9d0Plan {
  int32_t deref_desc;     /* always 1 — [ecx+4] with no null check */
  int32_t deref_cfg;      /* always 1 — [desc+0x10] */
  int32_t deref_type;     /* always 1 — [cfg+0x48] */
  int32_t lroom_path;     /* type in [9,12] */
  int32_t aabb_path;      /* !lroom_path */
  int32_t host_81f8b0;    /* = lroom_path */
  int32_t host_812f50;    /* = aabb_path */
  int32_t host_genrand;   /* 3 on L-room, 2 on AABB */
  int32_t pick_arm_a;     /* L-room && jb */
  int32_t pick_arm_b;     /* L-room && !jb */
  uint32_t out_x_bits;    /* L-room final / AABB pre-clamp */
  uint32_t out_y_bits;
  int32_t host_calls;     /* 81f8b0|812f50 plus the genrand count */
  int32_t pure_cf_ok;
  int32_t pure_complete;  /* 0 — 81f8b0 / 812f50 / 6eef60 stay host */
} IsaacFrameEffect81e9d0Plan;

/* `desc8` is ignored on the AABB path and may be null then.
   g0/g1/g2 are the host genrand draws in machine order (g2 unused on AABB). */
void isaac_frame_effect_81e9d0_entry_plan(IsaacFrameEffect81e9d0Plan* out,
                                          uint32_t type48,
                                          float margin,
                                          float room_14,
                                          float room_18,
                                          float room_1c,
                                          float room_20,
                                          const float* desc8,
                                          uint32_t g0,
                                          uint32_t g1,
                                          uint32_t g2);

/* ---- FUN_0081ecc0 random grid index (ABI v13) ----
 *
 * 0x0081ecc0…0x0081edca (ret 4 @ 0x0081ed53 / 0x0081edbe / 0x0081edca),
 * thiscall, ecx = Room, [ebp+8] = seed. 103 instructions, 269 bytes,
 * 0 resyncs. Linear decode, capstone 5.0.7 CS_MODE_32, function start
 * anchored by the six int3 bytes after 0x0081e9d0. Three int3 bytes then
 * sibling 0x0081edd0 (exact ZHL Room::GetBrokenWatchState — not this unit).
 *
 * identify-zhl: 0x0081ecc0 none (address-stable). Callees:
 *   0x0081fb70  exact ZHL LRoomTileDesc::GetRandomTile(XY*, uint seed)
 *               — HOST (ret 8, seed-mix + five fatal int3 paths)
 *   0x007e9020  exact ZHL RNG::RandomInt(unsigned max) — HOST; room
 *               family already owns the body. Stack RNG is
 *               {seed, 1, 9, 29} from .rdata 0x00b1f4ec / 0x00b1f4f4
 *
 * MACHINE FLOW (ebx = Room after 0x0081ecc7; [ebp-8] seeded with ebx):
 *
 *  (1) TYPE GATE (0x0081ecce…0x0081ece6) — PURE, same law as v12:
 *      edx = [[Room+4]+0x10]+0x48
 *      lea eax,[edx-9] ; shl edx,5 ; add edx,0xc35b80 ; cmp eax,3 ; ja AABB
 *      UNSIGNED window type ∈ [9,12] → L-room. Table row is ALWAYS
 *      formed (shl/add run before the ja). Consume v12
 *      isaac_frame_effect_81e9d0_lroom_type BY REFERENCE.
 *
 *  (2) L-ROOM — copy 8 dwords from the table row into a stack
 *      LRoomTileDesc, host 0x81fb70(out=&[ebp-0xc], seed). GetRandomTile
 *      OVERWRITES [ebp-8] (was Room*) with XY.y; XY.x lands at [ebp-0xc].
 *      Then PURE signed grid:
 *        test x / js fail ; cmp x, [Room+0xc] / jge fail
 *        test y / js fail ; cmp y, [Room+0x10] / jge fail
 *        eax = width * y + x   ; imul + add, 32-bit wrap
 *      `ret 4`.
 *
 *  (3) AABB (ja) — [ebp-8] is STILL Room*. Stack RNG at [ebp-0x1c]:
 *        [0]=seed, [4]=1, [8]=9, [0xc]=29
 *      host 0x7e9020(x1-x0) + x0 ; host 0x7e9020(y1-y0) + y0
 *      then the SAME signed grid / imul as (2). Table dwords 4..7 unused.
 *
 *  FAIL (shared 0x0081edc1): or eax,-1 ; ret 4.
 *
 *  REACH CENSUS (E8 rel32 over .text + raw LE-dword over all five
 *  sections; VA via section table):
 *      3 direct rel32 calls, 0 E9 tails. Raw dword hits: 2 in .text
 *      (0x0086c8a1, 0x0089118a — Lua `push 0x81ecc0` address-taken),
 *      0 in .rdata/.data/.rsrc/.reloc. No vtable slot.
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81ECC0_VA = 0x0081ecc0u,
  ISAAC_FRAME_EFFECT_81ECC0_END_VA = 0x0081edcau,
  ISAAC_FRAME_EFFECT_81ECC0_NEXT_VA = 0x0081edd0u, /* sibling after int3 */
  ISAAC_FRAME_EFFECT_81ECC0_RET_BYTES = 4,
  ISAAC_FRAME_EFFECT_81ECC0_INSN_COUNT = 103,
  ISAAC_FRAME_EFFECT_81ECC0_BYTE_LEN = 269,
  ISAAC_FRAME_EFFECT_81ECC0_CALL_INSNS = 3,
  ISAAC_FRAME_EFFECT_81ECC0_DIRECT_CALLERS = 3,
  ISAAC_FRAME_EFFECT_81ECC0_RAW_DWORD_HITS = 2,
  ISAAC_FRAME_EFFECT_81ECC0_CALLSITE_A_VA = 0x0068e070u,
  ISAAC_FRAME_EFFECT_81ECC0_CALLSITE_B_VA = 0x007f39a3u,
  ISAAC_FRAME_EFFECT_81ECC0_CALLSITE_C_VA = 0x007f4391u,
  ISAAC_FRAME_EFFECT_81ECC0_ADDR_TAKEN_A_VA = 0x0086c8a1u,
  ISAAC_FRAME_EFFECT_81ECC0_ADDR_TAKEN_B_VA = 0x0089118au,
  ISAAC_FRAME_EFFECT_81ECC0_DESC_OFF = 4u,
  ISAAC_FRAME_EFFECT_81ECC0_CFG_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_81ECC0_TYPE_OFF = 0x48u,
  ISAAC_FRAME_EFFECT_81ECC0_WIDTH_OFF = 0x0cu,
  ISAAC_FRAME_EFFECT_81ECC0_HEIGHT_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_81ECC0_TABLE_BASE = 0x00c35b80u,
  ISAAC_FRAME_EFFECT_81ECC0_ROW_STRIDE = 0x20u,
  ISAAC_FRAME_EFFECT_81ECC0_ROW_DWORDS = 8,
  ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFTS_VA = 0x00b1f4ecu,
  ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT3_VA = 0x00b1f4f4u,
  ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT1 = 1,
  ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT2 = 9,
  ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT3 = 29,
  ISAAC_FRAME_EFFECT_81ECC0_HOST_81FB70_VA = 0x0081fb70u,
  ISAAC_FRAME_EFFECT_81ECC0_HOST_7E9020_VA = 0x007e9020u,
  ISAAC_FRAME_EFFECT_81ECC0_RET_LROOM_VA = 0x0081ed53u,
  ISAAC_FRAME_EFFECT_81ECC0_RET_AABB_VA = 0x0081edbeu,
  ISAAC_FRAME_EFFECT_81ECC0_RET_FAIL_VA = 0x0081edcau,
  ISAAC_FRAME_EFFECT_81ECC0_FAIL = (int32_t)0xffffffff
};

/* v12 type gate BY REFERENCE: lea [type-9]; cmp 3; ja — UNSIGNED. */
int32_t isaac_frame_effect_81ecc0_lroom_type(uint32_t type48);

/* (type << 5) + DAT_00c35b80 — always formed, even on the AABB ja. */
uint32_t isaac_frame_effect_81ecc0_table_row_va(uint32_t type48);

/* Eight dword copy of the table row. Null out / null row skipped. */
void isaac_frame_effect_81ecc0_copy_row(int32_t* out8, const int32_t* row8);

/* test/js + cmp/jge — SIGNED. 1 iff 0 <= x < width && 0 <= y < height. */
int32_t isaac_frame_effect_81ecc0_grid_in_bounds(int32_t x, int32_t y,
                                                int32_t width, int32_t height);

/* imul width,y ; add x — low 32 bits. No bounds check. */
int32_t isaac_frame_effect_81ecc0_grid_index(int32_t x, int32_t y,
                                            int32_t width);

/* in-bounds ? index : -1. */
int32_t isaac_frame_effect_81ecc0_result(int32_t x, int32_t y, int32_t width,
                                        int32_t height);

/* AABB spans: *dx = x1-x0, *dy = y1-y0. Null outs skipped per pointer. */
void isaac_frame_effect_81ecc0_aabb_span(int32_t* dx, int32_t* dy, int32_t x0,
                                        int32_t y0, int32_t x1, int32_t y1);

/* AABB sample: *x = x0+rx, *y = y0+ry. Null outs skipped per pointer. */
void isaac_frame_effect_81ecc0_aabb_sample(int32_t* x, int32_t* y, int32_t x0,
                                          int32_t y0, int32_t rx, int32_t ry);

typedef struct IsaacFrameEffect81ecc0Plan {
  int32_t deref_desc;     /* always 1 — [ecx+4] with no null check */
  int32_t deref_cfg;      /* always 1 — [desc+0x10] */
  int32_t deref_type;     /* always 1 — [cfg+0x48] */
  int32_t lroom_path;     /* type in [9,12] */
  int32_t aabb_path;      /* !lroom_path */
  int32_t host_81fb70;    /* = lroom_path */
  int32_t host_7e9020;    /* 2 on AABB, 0 on L-room */
  int32_t host_calls;     /* 1 on L-room, 2 on AABB */
  int32_t in_bounds;      /* signed grid after host samples */
  int32_t result;         /* index or -1 */
  int32_t out_x;          /* L-room tile.x / AABB x0+rx */
  int32_t out_y;
  int32_t pure_cf_ok;
  int32_t pure_complete;  /* 0 — 81fb70 / 7e9020 stay host */
} IsaacFrameEffect81ecc0Plan;

/* L-room: host_a/host_b are GetRandomTile XY.
   AABB: host_a/host_b are the two RandomInt results; x0..y1 are table[0..3]. */
void isaac_frame_effect_81ecc0_entry_plan(IsaacFrameEffect81ecc0Plan* out,
                                          uint32_t type48,
                                          int32_t width,
                                          int32_t height,
                                          int32_t x0,
                                          int32_t y0,
                                          int32_t x1,
                                          int32_t y1,
                                          int32_t host_a,
                                          int32_t host_b);

/* ---- FUN_0081edd0 Room::GetBrokenWatchState (ABI v14) ----
 *
 * 0x0081edd0…0x0081ede9 (plain `ret` @ 0x0081ede9), thiscall, ecx = Room,
 * ZERO stack arguments. 6 instructions, 26 bytes, 0 resyncs, 0 calls.
 * Linear decode, capstone 5.0.7 / cs_version (5,0,1280), CS_MODE_32,
 * function start anchored by the three int3 bytes after 0x0081ecc0
 * (cpu-dump first_ret 0x0081ede9). Six int3 bytes then sibling
 * 0x0081edf0 (Lua `SetBrokenWatchState` — host: writes Room+0x1210
 * then calls 0x007ea2d0; not this unit).
 *
 * identify-zhl: EXACT 17-byte Room::GetBrokenWatchState
 *   "a1????????83b8????????16b802000000"
 * Source-level name PROMOTED for comments; exported symbols keep the
 * address-stable 81edd0 prefix. v12 type-gate / v13 unit-float unused
 * here (no type window, no float); consumed by reference, not re-derived.
 *
 * Instruction stream:
 *
 *   0x0081edd0  a1 78 16 c7 00        mov eax,[0x00c71678]     ; g_Game
 *   0x0081edd5  83 b8 84 65 02 00 16  cmp dword [eax+0x26584],0x16
 *   0x0081eddc  b8 02 00 00 00        mov eax,2
 *   0x0081ede1  74 06                 je  0x0081ede9
 *   0x0081ede3  8b 81 10 12 00 00     mov eax,[ecx+0x1210]
 *   0x0081ede9  c3                    ret
 *
 * MACHINE FLOW:
 *
 *  (1) GAME LOAD — UNCONDITIONAL. No null check on [0x00c71678].
 *      Helper cannot walk guest memory; caller recaptures
 *      mode = [g_Game+0x26584] and field = [Room+0x1210].
 *
 *  (2) MODE GATE — FULL DWORD. `83 /7 ib` sign-extends imm8 to
 *      0x00000016; `je` is equality so signedness cannot matter.
 *      `mov eax,2` runs BEFORE the je and does not touch flags
 *      (the cmp ZF is what the je consumes).
 *
 *  (3) SLOW HIT (ZF): EAX stays 2. `ret`.
 *
 *  (4) MISS: EAX = dword [ecx+0x1210]. No null check on ecx.
 *      `ret`.
 *
 *  Both live callers (0x0065a5bb, 0x006c9301) do
 *    ecx = [0x00c71678]; call 0x00407480; ecx = eax; call 0x81edd0;
 *    cmp eax,1 / jne
 *  so they observe the FULL dword (not AL). 0x00407480 is the same
 *  `mov eax,[ecx+0x18300]; ret` Room getter already pinned at v9.
 *
 *  REACH CENSUS (E8 / E9 rel32 over .text raw + raw LE-dword over
 *  all five sections; VA via section table):
 *      2 direct rel32 calls, 0 E9 tails. Raw dword hits: 1 in .text
 *      (0x0086c76f — Lua `push 0x81edd0` next to name VA 0x00b73b44
 *      "GetBrokenWatchState"), 0 in .rdata/.data/.rsrc/.reloc.
 *      No vtable slot.
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81EDD0_VA = 0x0081edd0u,
  ISAAC_FRAME_EFFECT_81EDD0_END_VA = 0x0081ede9u,
  ISAAC_FRAME_EFFECT_81EDD0_NEXT_VA = 0x0081edf0u, /* SetBrokenWatchState */
  ISAAC_FRAME_EFFECT_81EDD0_RET_BYTES = 0,
  ISAAC_FRAME_EFFECT_81EDD0_INSN_COUNT = 6,
  ISAAC_FRAME_EFFECT_81EDD0_BYTE_LEN = 26,
  ISAAC_FRAME_EFFECT_81EDD0_CALL_INSNS = 0,
  ISAAC_FRAME_EFFECT_81EDD0_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_81EDD0_RAW_DWORD_HITS = 1,
  ISAAC_FRAME_EFFECT_81EDD0_CALLSITE_A_VA = 0x0065a5bbu,
  ISAAC_FRAME_EFFECT_81EDD0_CALLSITE_B_VA = 0x006c9301u,
  ISAAC_FRAME_EFFECT_81EDD0_ADDR_TAKEN_VA = 0x0086c76fu,
  ISAAC_FRAME_EFFECT_81EDD0_LUA_NAME_VA = 0x00b73b44u,
  ISAAC_FRAME_EFFECT_81EDD0_GAME_GLOBAL_VA = 0x00c71678u, /* g_Game */
  ISAAC_FRAME_EFFECT_81EDD0_ROOM_GETTER_VA = 0x00407480u,
  ISAAC_FRAME_EFFECT_81EDD0_MODE_OFF = 0x26584u, /* Game+0x26584 */
  ISAAC_FRAME_EFFECT_81EDD0_MODE_SLOW = 0x16,    /* cmp imm, FULL dword */
  ISAAC_FRAME_EFFECT_81EDD0_FIELD_OFF = 0x1210u, /* Room+0x1210 */
  ISAAC_FRAME_EFFECT_81EDD0_SLOW_RESULT = 2,     /* mov eax,2 */
  ISAAC_FRAME_EFFECT_81EDD0_RET_VA = 0x0081ede9u,
  ISAAC_FRAME_EFFECT_81EDD0_SLOW_LABEL_VA = 0x0081ede9u,
  ISAAC_FRAME_EFFECT_81EDD0_FIELD_LABEL_VA = 0x0081ede3u
};

enum {
  ISAAC_FRAME_EFFECT_81EDD0_EXIT_SLOW = 0,  /* je 0x0081ede9 — EAX = 2 */
  ISAAC_FRAME_EFFECT_81EDD0_EXIT_FIELD = 1  /* fallthrough — EAX = [ecx+0x1210] */
};

/* FULL dword equality: mode == 0x16. 1 on the je arm. */
int32_t isaac_frame_effect_81edd0_mode_slow(uint32_t mode_26584);

/* Which exit: EXIT_SLOW or EXIT_FIELD. */
int32_t isaac_frame_effect_81edd0_exit_arm(uint32_t mode_26584);

/* EAX at `ret`: 2 on slow, else the recaptured Room+0x1210 dword. */
uint32_t isaac_frame_effect_81edd0_result(uint32_t mode_26584,
                                          uint32_t room_1210);

typedef struct IsaacFrameEffect81edd0Plan {
  int32_t deref_game;     /* always 1 — [0xc71678] with no null check */
  int32_t deref_mode;     /* always 1 — [game+0x26584] */
  int32_t mode_slow;      /* mode == 0x16 */
  int32_t field_path;     /* !mode_slow */
  int32_t deref_field;    /* = field_path — [ecx+0x1210] only on miss */
  uint32_t result;        /* 2 or room_1210 */
  int32_t host_calls;     /* always 0 */
  int32_t pure_complete;  /* always 1 */
} IsaacFrameEffect81edd0Plan;

void isaac_frame_effect_81edd0_entry_plan(IsaacFrameEffect81edd0Plan* out,
                                          uint32_t mode_26584,
                                          uint32_t room_1210);

/* ---- FUN_0081edf0 Lua SetBrokenWatchState (ABI v15) ----
 *
 * 0x0081edf0…0x0081ee12 (`ret 4` @ 0x0081ee12), thiscall, ecx = Room,
 * ONE stack argument [ebp+8] = state (FULL dword). 11 instructions,
 * 37 bytes, 0 resyncs, 1 call. Linear decode, capstone 5.0.7 /
 * cs_version (5,0,1280), CS_MODE_32, function start anchored by the
 * six int3 bytes after 0x0081edd0 (cpu-dump first_ret 0x0081ee12).
 * Eleven int3 bytes then sibling 0x0081ee20 (not this unit).
 *
 * identify-zhl: 0x0081edf0 none (address-stable). Callee 0x007ea2d0
 * none (already the room-family opaque challenge-body host). Lua
 * `RegisterClasses` binds this VA next to name 0x00b73c58
 * "SetBrokenWatchState" via `push 0x81edf0` at 0x0086c77f. Source
 * name stays COMMENT-ONLY; exported symbols keep the 81edf0 prefix.
 * v14 GetBrokenWatchState unused here; consumed by reference, not
 * re-derived.
 *
 * Instruction stream:
 *
 *   0x0081edf0  55                    push ebp
 *   0x0081edf1  8b ec                 mov  ebp, esp
 *   0x0081edf3  8b 45 08              mov  eax, [ebp+8]
 *   0x0081edf6  56                    push esi
 *   0x0081edf7  8b 35 9c 16 c7 00     mov  esi, [0x00c7169c]
 *   0x0081edfd  89 81 10 12 00 00     mov  [ecx+0x1210], eax
 *   0x0081ee03  e8 c8 b4 fc ff        call 0x007ea2d0
 *   0x0081ee08  f3 0f 11 86 d4 a2 02 00  movss [esi+0x2a2d4], xmm0
 *   0x0081ee10  5e                    pop  esi
 *   0x0081ee11  5d                    pop  ebp
 *   0x0081ee12  c2 04 00              ret  4
 *
 * MACHINE FLOW:
 *
 *  (1) ARG — FULL DWORD. `mov eax,[ebp+8]` then the store. No
 *      low-byte narrowing. Live callers push the literals 1 or 2.
 *
 *  (2) MANAGER SNAPSHOT — UNCONDITIONAL, BEFORE the host call.
 *      esi = [0x00c7169c]. No null check. This is the Manager*
 *      global, NOT g_Game at 0x00c71678 (the v8/v9 trap). Helper
 *      cannot walk guest memory; caller recaptures the pointer.
 *
 *  (3) FIELD STORE — UNCONDITIONAL. [ecx+0x1210] = state. No null
 *      check on ecx. Same Room+0x1210 dword v14 reads on the miss
 *      arm. Store runs BEFORE 0x007ea2d0, so the host sees the new
 *      value.
 *
 *  (4) HOST 0x007ea2d0 — UNCONDITIONAL thiscall, ecx still Room
 *      (never overwritten), ZERO stack arguments, float result in
 *      xmm0. Body stays host (room B3 already owns the challenge-
 *      body CF). Not re-derived here.
 *
 *  (5) SCALE STORE — UNCONDITIONAL movss. [esi+0x2a2d4] = xmm0,
 *      RAW bits, using the PRE-CALL esi snapshot. A host rewrite
 *      of [0xc7169c] would not be re-read. No null check on esi.
 *
 *  REACH CENSUS (E8 / E9 rel32 over .text raw + raw LE-dword over
 *  all five sections; VA via section table):
 *      4 direct rel32 calls, 0 E9 tails.
 *        0x0079e4e0 / 0x0079e541  Room getter 0x407480, push 2
 *        0x007c6f85               [Game+0x18300], push 1
 *        0x007c6fd0               [Game+0x18300], push 2
 *      Raw dword hits: 1 in .text (0x0086c780 — the imm32 of
 *      `push 0x81edf0` at 0x0086c77f), 0 in .rdata/.data/.rsrc/
 *      .reloc. No vtable slot.
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81EDF0_VA = 0x0081edf0u,
  ISAAC_FRAME_EFFECT_81EDF0_END_VA = 0x0081ee12u,
  ISAAC_FRAME_EFFECT_81EDF0_NEXT_VA = 0x0081ee20u, /* sibling after int3 */
  ISAAC_FRAME_EFFECT_81EDF0_RET_BYTES = 4,
  ISAAC_FRAME_EFFECT_81EDF0_INSN_COUNT = 11,
  ISAAC_FRAME_EFFECT_81EDF0_BYTE_LEN = 37,
  ISAAC_FRAME_EFFECT_81EDF0_CALL_INSNS = 1,
  ISAAC_FRAME_EFFECT_81EDF0_DIRECT_CALLERS = 4,
  ISAAC_FRAME_EFFECT_81EDF0_RAW_DWORD_HITS = 1,
  ISAAC_FRAME_EFFECT_81EDF0_CALLSITE_A_VA = 0x0079e4e0u,
  ISAAC_FRAME_EFFECT_81EDF0_CALLSITE_B_VA = 0x0079e541u,
  ISAAC_FRAME_EFFECT_81EDF0_CALLSITE_C_VA = 0x007c6f85u,
  ISAAC_FRAME_EFFECT_81EDF0_CALLSITE_D_VA = 0x007c6fd0u,
  ISAAC_FRAME_EFFECT_81EDF0_ADDR_TAKEN_VA = 0x0086c780u,
  ISAAC_FRAME_EFFECT_81EDF0_LUA_BIND_VA = 0x0086c77fu,
  ISAAC_FRAME_EFFECT_81EDF0_LUA_NAME_VA = 0x00b73c58u,
  ISAAC_FRAME_EFFECT_81EDF0_MGR_GLOBAL_VA = 0x00c7169cu, /* Manager*, NOT g_Game */
  ISAAC_FRAME_EFFECT_81EDF0_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_81EDF0_ROOM_GETTER_VA = 0x00407480u,
  ISAAC_FRAME_EFFECT_81EDF0_ROOM_PTR_OFF = 0x18300u, /* Game+0x18300 */
  ISAAC_FRAME_EFFECT_81EDF0_FIELD_OFF = 0x1210u,     /* Room+0x1210 */
  ISAAC_FRAME_EFFECT_81EDF0_SCALE_OFF = 0x2a2d4u,    /* Manager+0x2a2d4 */
  ISAAC_FRAME_EFFECT_81EDF0_HOST_7EA2D0_VA = 0x007ea2d0u,
  ISAAC_FRAME_EFFECT_81EDF0_RET_VA = 0x0081ee12u,
  ISAAC_FRAME_EFFECT_81EDF0_CALL_STATE_1 = 1, /* push 1 at 0x007c6f7d */
  ISAAC_FRAME_EFFECT_81EDF0_CALL_STATE_2 = 2  /* push 2 at the other three */
};

/* [ecx+0x1210] = state. Null out skipped. FULL dword. */
void isaac_frame_effect_81edf0_apply_store(uint32_t* room_1210,
                                           uint32_t state);

/* Manager* + 0x2a2d4, 32-bit wrap. The pre-call esi snapshot. */
uint32_t isaac_frame_effect_81edf0_scale_addr(uint32_t mgr);

/* movss identity: dest bits = host xmm0 bits. Null out skipped. */
void isaac_frame_effect_81edf0_apply_scale(uint32_t* dest_bits,
                                           uint32_t xmm0_bits);

typedef struct IsaacFrameEffect81edf0Plan {
  int32_t store_field;    /* always 1 — [ecx+0x1210] = state */
  uint32_t stored_state;  /* arg, FULL dword */
  int32_t deref_mgr;      /* always 1 — [0xc7169c], no null check */
  int32_t host_7ea2d0;    /* always 1 */
  int32_t store_scale;    /* always 1 — movss [esi+0x2a2d4], xmm0 */
  uint32_t scale_bits;    /* host xmm0 bits, identity */
  uint32_t scale_addr;    /* mgr + 0x2a2d4, 32-bit wrap */
  int32_t host_calls;     /* always 1 */
  int32_t pure_complete;  /* always 0 — 7ea2d0 stays host */
} IsaacFrameEffect81edf0Plan;

void isaac_frame_effect_81edf0_entry_plan(IsaacFrameEffect81edf0Plan* out,
                                          uint32_t state, uint32_t mgr,
                                          uint32_t xmm0_bits);

/* ---- NOTES: FUN_0081ee20 IRREDUCIBLE (unit stays host; v16 peels a callee) ----
 *
 * Sibling after eleven int3 following 0x0081edf0. Still OPEN as a unit.
 * Complete dump (cpu-dump 0081ee20.txt, --bytes 0x400 --no-stop-at-ret):
 *   VA 0x0081ee20 … shared ret 0x0081f128 (.text file+0x41e220)
 *   first_ret 0x0081eebf is the type-0xb epilogue only
 *   25 E8: 24× 0x007ee7e0 + 1× 0x0081fb20 @ 0x0081f0ac
 * identify-zhl: empty. 0 ZHL.
 *
 * NOT a Get/SetBrokenWatchState wrapper. Does not call 0x0081edd0 or
 * 0x0081edf0. v14/v15 stay BY REFERENCE, unused here.
 *
 * Shape (closed body 0x0081ee20…0x0081f128):
 *   thiscall, ecx saved in esi. [esi+4]+0x10 = cfg (v9/v12/v13 shape).
 *   Inline 8279a0 gate: test cfg; [cfg+8]==0x10; [cfg]==0x23 → je 0x81f122.
 *   Else type = [cfg+0x48] (v12 TYPE_OFF). Sequential cmp:
 *     0xb / 0xc / 9 / 0xa / default — signed walks, host 0x007ee7e0
 *     2, 3, 5, 7 → 0x0081fb20(out=&[esp+0x18]) then a clipped walk
 *   first_ret 0x0081eebf is the type-0xb epilogue only.
 *   Shared far exit 0x0081f122 (pop/ret @ 0x0081f128).
 *
 * Exact blocker (unit still not a complete small helper):
 *   (1) Multi-arm [cfg+0x48] dispatcher, shared far exit, not small.
 *   (2) 24 host calls to 0x007ee7e0 (grid-cell setter, ZHL-empty).
 *       Mutations are that host. Not a pure island.
 *
 * v16 peels the one complete small callee that fell out: 0x0081fb20.
 * 0x007ee7e0 / 0x008646e0 / 0x0042b560 / 0x006f0090 / 0x00a68490 stay host.
 */

/* ---- FUN_0081fb20 Room::GetLRoomTileDesc (ABI v16) ----
 *
 * 0x0081fb20…0x0081fb6b (`ret 4` @ 0x0081fb6b), thiscall, ecx = Room,
 * ONE stack argument [ebp+8] = out LRoomTileDesc* (FULL dword). 29
 * instructions, 78 bytes, 0 resyncs, 0 calls. Linear decode,
 * capstone 5.0.7 / cs_version (5,0,1280), CS_MODE_32, function start
 * anchored by the two int3 bytes after the 0x0081ee20 shared ret
 * (cpu-dump first_ret 0x0081fb6b). Two int3 bytes then sibling
 * 0x0081fb70 (exact ZHL LRoomTileDesc::GetRandomTile — v13 host;
 * v17 peels its pure islands).
 *
 * identify-zhl: EXACT 8-byte pattern for
 *   `LRoomTileDesc * Room::GetLRoomTileDesc(LRoomTileDesc * buffer)`
 *   "558bec8b41??8b55"
 * Source-level name PROMOTED for comments; exported symbols keep the
 * address-stable 81fb20 prefix. v13 table_row_va / copy_row consumed
 * BY REFERENCE, not re-derived. No type window here — callers gate
 * types 2/3/5/7; the copy runs for whatever [cfg+0x48] holds.
 *
 * Instruction stream:
 *
 *   0x0081fb20  55                    push ebp
 *   0x0081fb21  8b ec                 mov  ebp, esp
 *   0x0081fb23  8b 41 04              mov  eax, [ecx+4]
 *   0x0081fb26  8b 55 08              mov  edx, [ebp+8]
 *   0x0081fb29  56                    push esi
 *   0x0081fb2a  8b 40 10              mov  eax, [eax+0x10]
 *   0x0081fb2d  8b 70 48              mov  esi, [eax+0x48]
 *   0x0081fb30  c1 e6 05              shl  esi, 5
 *   0x0081fb33  81 c6 80 5b c3 00     add  esi, 0x00c35b80
 *   0x0081fb39  8b 06                 mov  eax, [esi]
 *   0x0081fb3b  89 02                 mov  [edx], eax
 *   … eight dword copies, stride 4, through [esi+0x1c] → [edx+0x1c]
 *   0x0081fb55  8b c2                 mov  eax, edx   ; AFTER dword 4,
 *                                                    ;   BEFORE dwords 5..7
 *   0x0081fb69  5e                    pop  esi
 *   0x0081fb6a  5d                    pop  ebp
 *   0x0081fb6b  c2 04 00              ret  4
 *
 * MACHINE FLOW:
 *
 *  (1) DESC / CFG / TYPE — UNCONDITIONAL. [ecx+4], [desc+0x10],
 *      [cfg+0x48]. No null check on ecx, desc, cfg, or out. Helper
 *      cannot walk guest memory; caller recaptures type48 and the
 *      eight table dwords. Reproduced: no invented null guard.
 *
 *  (2) ROW VA — PURE. esi = (type << 5) + DAT_00c35b80, 32-bit wrap.
 *      Same law as v13 isaac_frame_effect_81ecc0_table_row_va.
 *      shl 5 is a LOGICAL shift (no sign extend).
 *
 *  (3) EIGHT DWORD COPY — PURE. [out+0..0x1c] = [row+0..0x1c].
 *      Same law as v13 isaac_frame_effect_81ecc0_copy_row. Raw
 *      bits, not arithmetic. No type gate.
 *
 *  (4) RETURN — eax = edx = [ebp+8] (the out pointer). Identity.
 *      The `mov eax,edx` sits between dword 4 and dword 5; the
 *      remaining three stores still run. EAX is the buffer, not a
 *      field of it.
 *
 *  REACH CENSUS (E8 / E9 rel32 over .text raw + raw LE-dword over
 *  all five sections; VA via section table; 2,094,319 insns, 469
 *  resyncs):
 *      2 direct rel32 calls, 0 E9 tails.
 *        0x0081f0ac  family 0x0081ee20 types 2/3/5/7, lea [esp+0x18]
 *        0x009e2e16  types 2/3/5/7, lea [ebp-0x34], ecx=[ecx]
 *      Raw dword hits: 2 in .text
 *        0x0086c582  imm32 of `push 0x81fb20` @ 0x0086c581
 *        0x00890ac5  imm32 of `mov [eax],0x81fb20` @ 0x00890ac3
 *                    (inside the Lua binder called from 0x0086c58d)
 *      0 in .rdata/.data/.rsrc/.reloc. No vtable slot.
 *      Lua `RegisterClasses` binds this VA next to name 0x00b739d8
 *      "GetLRoomTileDesc".
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81FB20_VA = 0x0081fb20u,
  ISAAC_FRAME_EFFECT_81FB20_END_VA = 0x0081fb6bu,
  ISAAC_FRAME_EFFECT_81FB20_NEXT_VA = 0x0081fb70u, /* sibling after int3 */
  ISAAC_FRAME_EFFECT_81FB20_RET_BYTES = 4,
  ISAAC_FRAME_EFFECT_81FB20_INSN_COUNT = 29,
  ISAAC_FRAME_EFFECT_81FB20_BYTE_LEN = 78,
  ISAAC_FRAME_EFFECT_81FB20_CALL_INSNS = 0,
  ISAAC_FRAME_EFFECT_81FB20_DIRECT_CALLERS = 2,
  ISAAC_FRAME_EFFECT_81FB20_RAW_DWORD_HITS = 2,
  ISAAC_FRAME_EFFECT_81FB20_CALLSITE_A_VA = 0x0081f0acu,
  ISAAC_FRAME_EFFECT_81FB20_CALLSITE_B_VA = 0x009e2e16u,
  ISAAC_FRAME_EFFECT_81FB20_ADDR_TAKEN_A_VA = 0x0086c582u,
  ISAAC_FRAME_EFFECT_81FB20_ADDR_TAKEN_B_VA = 0x00890ac5u,
  ISAAC_FRAME_EFFECT_81FB20_LUA_BIND_VA = 0x0086c581u,
  ISAAC_FRAME_EFFECT_81FB20_LUA_NAME_VA = 0x00b739d8u,
  ISAAC_FRAME_EFFECT_81FB20_DESC_OFF = 4u,       /* Room+4 — v12/v13 */
  ISAAC_FRAME_EFFECT_81FB20_CFG_OFF = 0x10u,     /* desc+0x10 */
  ISAAC_FRAME_EFFECT_81FB20_TYPE_OFF = 0x48u,    /* cfg+0x48 */
  ISAAC_FRAME_EFFECT_81FB20_TABLE_BASE = 0x00c35b80u, /* v13 DAT, by ref */
  ISAAC_FRAME_EFFECT_81FB20_ROW_STRIDE = 0x20u,
  ISAAC_FRAME_EFFECT_81FB20_ROW_DWORDS = 8,
  ISAAC_FRAME_EFFECT_81FB20_RET_VA = 0x0081fb6bu,
  ISAAC_FRAME_EFFECT_81FB20_HOST_81FB70_VA = 0x0081fb70u /* sibling; v17 islands */
};

/* (type << 5) + DAT_00c35b80 — v13 table_row_va BY REFERENCE. */
uint32_t isaac_frame_effect_81fb20_table_row_va(uint32_t type48);

/* Eight dword copy of the table row. Null out / null row skipped.
   v13 copy_row BY REFERENCE. */
void isaac_frame_effect_81fb20_copy_row(int32_t* out8, const int32_t* row8);

/* eax = edx = [ebp+8]. Identity of the out pointer. */
uint32_t isaac_frame_effect_81fb20_return_out(uint32_t out_ptr);

typedef struct IsaacFrameEffect81fb20Plan {
  int32_t deref_desc;     /* always 1 — [ecx+4], no null check */
  int32_t deref_cfg;      /* always 1 — [desc+0x10] */
  int32_t deref_type;     /* always 1 — [cfg+0x48] */
  uint32_t table_row_va;  /* (type<<5)+0xc35b80, 32-bit wrap */
  int32_t copy_row;       /* always 1 — eight dwords, no type gate */
  uint32_t return_out;    /* [ebp+8], returned in eax */
  int32_t host_calls;     /* always 0 */
  int32_t pure_complete;  /* always 1 — zero calls */
} IsaacFrameEffect81fb20Plan;

void isaac_frame_effect_81fb20_entry_plan(IsaacFrameEffect81fb20Plan* out,
                                          uint32_t type48, uint32_t out_ptr);

/* ---- FUN_0081fb70 LRoomTileDesc::GetRandomTile (ABI v17) ----
 *
 * 0x0081fb70…0x0081fd51 (`ret 8` @ 0x0081fc9b / 0x0081fcbe /
 * 0x0081fd51), thiscall, ecx = LRoomTileDesc, TWO stack arguments
 * [ebp+8] = out XY* (FULL dword), [ebp+0xc] = seed (FULL dword).
 * 203 instructions, 484 bytes, 0 resyncs, 5 calls (all 0x00a112c0).
 * Linear decode, capstone 5.0.7 / cs_version (5,0,1280), CS_MODE_32,
 * function start anchored by the two int3 bytes after 0x0081fb20
 * (disasm-0081fb70.txt first_ret 0x0081fc9b). Twelve int3 bytes then
 * sibling 0x0081fd60 (SEH prologue, identify-zhl empty — PARK).
 *
 * identify-zhl: EXACT 15-byte pattern for
 *   `XY * LRoomTileDesc::GetRandomTile(XY * ret, unsigned int seed)`
 *   "558bec83ec2ca1????????53568945"
 * Source-level name PROMOTED for comments; exported symbols keep the
 * address-stable 81fb70 prefix. Callee 0x00a112c0 none (address-stable
 * host log). v13 RNG shifts 1/9/29 at 0x00b1f4ec / 0x00b1f4f4 and
 * aabb_span consumed BY REFERENCE, not re-derived.
 *
 * Body is host-heavy: five fatal log+int3 paths ("RNG Seed is zero!\n"
 * @ 0x00b6bf54, level 0x10) plus the this-walk of the 8-dword desc.
 * v17 peels only PURE islands (seed mix, bounds, signed-abs area,
 * unsigned rem, index math, XY stores). The log/int3 and the desc
 * dereference stay host; caller recaptures the eight dwords.
 *
 * MACHINE FLOW:
 *
 *  (1) BOUNDS — PURE, BEFORE the seed check. Four SIGNED subs:
 *      dx1=[+8]-[+0], dy1=[+0xc]-[+4],
 *      dx2=[+0x18]-[+0x10], dy2=[+0x1c]-[+0x14].
 *      ZHL LRoomTileDesc is XY _high[2] @0 / XY _low[2] @0x10.
 *
 *  (2) AREA — PURE. imul (32-bit) then cdq/xor/sub SIGNED abs.
 *      INT_MIN stays INT_MIN. total = abs1+abs2, 32-bit wrap, then
 *      used as an UNSIGNED divisor.
 *
 *  (3) SEED==0 — HOST. test esi,esi; je log 0xa112c0 + int3.
 *      Mix / XY never run. Reproduced, not repaired.
 *
 *  (4) SEED MIX — PURE. xorshift with v13 shifts (shr 1, shl 9,
 *      shr 29), LOGICAL. Three draws: pick, x, y. mix(0)=0; a
 *      later test esi,esi on mixed==0 is the same fatal.
 *
 *  (5) PICK — PURE. xor edx,edx; if total!=0: unsigned div.
 *      cmp rem, abs1 ; jb rect A (UNSIGNED). total==0 ⇒ rem=0
 *      ⇒ 0<u 0 is false ⇒ rect B (empty-tile).
 *
 *  (6) INDEX — PURE. umod(mixed, RAW delta as uint32); skip-div
 *      if delta==0 (rem=0). origin+rem, 32-bit wrap. A NEGATIVE
 *      delta is a huge unsigned divisor — original defect.
 *      dy==0 skips the third mix's last shift and the div;
 *      rem_y=0.
 *
 *  (7) XY OUT — PURE. [out]=x, [out+4]=y. eax = [ebp+8].
 *
 *  REACH CENSUS (E8 / E9 rel32 over .text raw + raw LE-dword over
 *  all five sections; VA via section table):
 *      1 direct rel32 call, 0 E9 tails.
 *        0x0081ed21  v13 FUN_0081ecc0 L-room path,
 *                    lea eax,[ebp-0xc]; push eax
 *      Raw dword hits: 0 in .text/.rdata/.data/.rsrc/.reloc.
 *      No vtable slot, not Lua-bound.
 *
 *  Nothing here is wired into the Update slice.
 */

enum {
  ISAAC_FRAME_EFFECT_81FB70_VA = 0x0081fb70u,
  ISAAC_FRAME_EFFECT_81FB70_END_VA = 0x0081fd51u,
  ISAAC_FRAME_EFFECT_81FB70_NEXT_VA = 0x0081fd60u, /* sibling after 12 int3 */
  ISAAC_FRAME_EFFECT_81FB70_RET_BYTES = 8,
  ISAAC_FRAME_EFFECT_81FB70_INSN_COUNT = 203,
  ISAAC_FRAME_EFFECT_81FB70_BYTE_LEN = 484,
  ISAAC_FRAME_EFFECT_81FB70_CALL_INSNS = 5,
  ISAAC_FRAME_EFFECT_81FB70_DIRECT_CALLERS = 1,
  ISAAC_FRAME_EFFECT_81FB70_RAW_DWORD_HITS = 0,
  ISAAC_FRAME_EFFECT_81FB70_INT3_PAD = 12,
  ISAAC_FRAME_EFFECT_81FB70_CALLSITE_VA = 0x0081ed21u,
  ISAAC_FRAME_EFFECT_81FB70_RET_A_VA = 0x0081fc9bu, /* dy2==0 */
  ISAAC_FRAME_EFFECT_81FB70_RET_B_VA = 0x0081fcbeu, /* dy2!=0 */
  ISAAC_FRAME_EFFECT_81FB70_RET_C_VA = 0x0081fd51u, /* rect A */
  ISAAC_FRAME_EFFECT_81FB70_HIGH_OFF = 0,
  ISAAC_FRAME_EFFECT_81FB70_LOW_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_81FB70_DESC_DWORDS = 8,
  ISAAC_FRAME_EFFECT_81FB70_XY_DWORDS = 2,
  ISAAC_FRAME_EFFECT_81FB70_HOST_LOG_VA = 0x00a112c0u,
  ISAAC_FRAME_EFFECT_81FB70_FATAL_STR_VA = 0x00b6bf54u,
  ISAAC_FRAME_EFFECT_81FB70_FATAL_LEVEL = 0x10u,
  /* v13 RNG shifts BY REFERENCE */
  ISAAC_FRAME_EFFECT_81FB70_RNG_SHIFTS_VA = 0x00b1f4ecu,
  ISAAC_FRAME_EFFECT_81FB70_RNG_SHIFT3_VA = 0x00b1f4f4u,
  ISAAC_FRAME_EFFECT_81FB70_RNG_SHIFT1 = 1,
  ISAAC_FRAME_EFFECT_81FB70_RNG_SHIFT2 = 9,
  ISAAC_FRAME_EFFECT_81FB70_RNG_SHIFT3 = 29
};

/* xorshift: x^=x>>1; x^=x<<9; x^=x>>29. LOGICAL, 32-bit wrap.
   v13 shifts BY REFERENCE. */
uint32_t isaac_frame_effect_81fb70_seed_mix(uint32_t seed);

/* cdq/xor/sub SIGNED abs. INT_MIN stays INT_MIN. */
int32_t isaac_frame_effect_81fb70_iabs(int32_t x);

/* imul low-32 then iabs. */
int32_t isaac_frame_effect_81fb70_area_abs(int32_t dx, int32_t dy);

/* unsigned rem; 0 if denom==0. denom is the RAW delta bit pattern. */
uint32_t isaac_frame_effect_81fb70_umod(uint32_t n, uint32_t d);

/* 1 iff rem <u area1 (jb → rect A). total==0 ⇒ rem=0 ⇒ B. */
int32_t isaac_frame_effect_81fb70_pick_a(uint32_t rem, uint32_t area1);

/* origin + rem, 32-bit wrap. */
int32_t isaac_frame_effect_81fb70_index(int32_t origin, uint32_t rem);

/* Four SIGNED deltas from the 8-dword desc. Null outs / null desc skipped.
   v13 aabb_span BY REFERENCE. */
void isaac_frame_effect_81fb70_bounds(int32_t* dx1, int32_t* dy1, int32_t* dx2,
                                      int32_t* dy2, const int32_t* desc8);

/* [out]=x, [out+4]=y. Null out skipped. */
void isaac_frame_effect_81fb70_apply_xy(int32_t* out_xy, int32_t x, int32_t y);

typedef struct IsaacFrameEffect81fb70Plan {
  int32_t seed_zero;      /* 1 iff seed==0 */
  int32_t fatal;          /* seed==0 or mixed0==0 or mixed1==0 */
  uint32_t mixed0;        /* first mix; 0 on seed==0 */
  int32_t pick_a;         /* jb rect A; 0 on seed==0 */
  int32_t out_x;
  int32_t out_y;
  int32_t apply_xy;       /* 1 iff happy path writes XY */
  int32_t host_calls;     /* 1 on fatal log, else 0 */
  int32_t pure_complete;  /* always 0 — log+int3 and this-walk stay host */
} IsaacFrameEffect81fb70Plan;

void isaac_frame_effect_81fb70_entry_plan(IsaacFrameEffect81fb70Plan* out,
                                          uint32_t seed, const int32_t* desc8);

/* ---- ABI v44: FUN_00827180 nearest-slot scan (pure thiscall leaf) ----
 *
 * 0x00827180..0x008271d8 (`ret 4` @0x008271d5), thiscall, ecx = this,
 * [ebp+8] = Vector* pos. 88 bytes / 27 insns / 0 resync
 * (census-v48-827180.json in frame-effect-v39-823370).
 *
 * 0 E8 / 0 indirect / no SEH / no /GS cookie / NO global writes — the
 * only memory touched is the caller's slot table. ZERO direct E8
 * callers and zero raw-dword refs anywhere in the image (computed/
 * virtual reach; the 0x824800 / 0x825de0 / 0x826ae0 / 0x826f80 band
 * shape). identify-zhl body EMPTY (ONE-batch rule).
 *
 * MACHINE FLOW: for i in 0..7 over [ecx+0x7744 + i*4]:
 *   p == 0 -> skip (test edx,edx; je next);
 *   xmm0 = pos.y - [p+0x340]; xmm1 = pos.x - [p+0x33c];
 *   xmm0 *= xmm0; xmm1 *= xmm1; xmm0 += xmm1 — sum = dy^2 + dx^2 with
 *   dy^2 as the addss DEST (operand order pinned);
 *   comiss T,sum ; ja 0x8271d3 -> return i — T > sum STRICT ORDERED:
 *   NaN never matches and equality does not match;
 * loop exhausted -> or eax,-1 -> return -1.
 * T = [0xbaac40] = 0x46610000 (14400.0f = 120^2).
 */
enum {
  ISAAC_FRAME_EFFECT_827180_VA = 0x00827180u,
  ISAAC_FRAME_EFFECT_827180_RET_VA = 0x008271d5u,
  ISAAC_FRAME_EFFECT_827180_END_VA = 0x008271d8u,
  ISAAC_FRAME_EFFECT_827180_NEXT_VA = 0x008271e0u,
  ISAAC_FRAME_EFFECT_827180_INSN_COUNT = 27u,
  ISAAC_FRAME_EFFECT_827180_BYTE_LEN = 88u,
  ISAAC_FRAME_EFFECT_827180_DIRECT_CALLERS = 0u,
  ISAAC_FRAME_EFFECT_827180_RAW_REFS = 0u,
  ISAAC_FRAME_EFFECT_827180_SLOT_BASE_OFF = 0x7744u,
  ISAAC_FRAME_EFFECT_827180_SLOT_COUNT = 8u,
  ISAAC_FRAME_EFFECT_827180_SLOT_PX_OFF = 0x33cu,
  ISAAC_FRAME_EFFECT_827180_SLOT_PY_OFF = 0x340u,
  ISAAC_FRAME_EFFECT_827180_THRESH_VA = 0x00baac40u,
  ISAAC_FRAME_EFFECT_827180_THRESH_BITS = 0x46610000u, /* 14400.0f */
  ISAAC_FRAME_EFFECT_827180_RET_NONE_BITS = 0xffffffffu
};

/* One table row as seen by the PE walk: pointer gate plus the two
   float fields the distance reads. The helper cannot read guest
   memory; the caller resolves the slots. */
typedef struct IsaacFrameEffect827180Slot {
  uint32_t present; /* PE: slot dword != 0 */
  uint32_t px_bits; /* [p+0x33c] */
  uint32_t py_bits; /* [p+0x340] */
} IsaacFrameEffect827180Slot;

/* comiss T,sum ; ja — STRICT ORDERED T > sum; NaN on either side -> 0. */
int32_t isaac_frame_effect_827180_dist_lt(uint32_t x_bits, uint32_t y_bits,
                                          uint32_t px_bits, uint32_t py_bits,
                                          uint32_t t_bits);

/* Full 8-row walk in PE order; FIRST match returns its index; -1 when
   none matches. */
int32_t isaac_frame_effect_827180_nearest(uint32_t x_bits, uint32_t y_bits,
                                          uint32_t t_bits,
                                          const IsaacFrameEffect827180Slot*
                                              slots);

/* ---- ABI v45: FUN_008279c0 field+0x20 getter (pure micro-leaf) ----
 *
 * 0x008279c0..0x008279ce (`ret` @0x008279cd), thiscall, returns xmm0.
 * 14 B / 3 insns / 0 resync. After 5xcc pad @0x008279bb..bf (the v53
 * hand-off "scan from 0x008279bb" — 0x00827995 was mid-`ret 4`).
 *
 * 0 E8 / 0 indirect / no SEH / no cookie / NO global writes.
 * 6 direct E8 callers (byte-scan): 0x5e2030 / 0x5e2350 / 0x655b10 /
 * 0x655b4e / 0x65a45f / 0x6730d8. Zero raw-dword refs; zero external
 * branchers-in. identify-zhl body EMPTY (ONE batch).
 *
 * MACHINE: xmm0 = [ecx+0x20]; subss [0xbaa8d0] (=30.0f, 0x41f00000);
 * ret. ONE f32 subtraction in PE order; load is bit-preserving.
 */
enum {
  ISAAC_FRAME_EFFECT_8279C0_VA = 0x008279c0u,
  ISAAC_FRAME_EFFECT_8279C0_RET_VA = 0x008279cdu,
  ISAAC_FRAME_EFFECT_8279C0_END_VA = 0x008279ceu,
  ISAAC_FRAME_EFFECT_8279C0_NEXT_VA = 0x008279d0u,
  ISAAC_FRAME_EFFECT_8279C0_INSN_COUNT = 3u,
  ISAAC_FRAME_EFFECT_8279C0_BYTE_LEN = 14u,
  ISAAC_FRAME_EFFECT_8279C0_FIELD_OFF = 0x20u,
  ISAAC_FRAME_EFFECT_8279C0_CONST_VA = 0x00baa8d0u,
  ISAAC_FRAME_EFFECT_8279C0_CONST_BITS = 0x41f00000u, /* 30.0f */
  ISAAC_FRAME_EFFECT_8279C0_DIRECT_CALLERS = 6u
};

/* movss + subss: one f32 subtraction, round-to-nearest. The helper
   cannot read guest memory; base_bits is [ecx+0x20]. */
float isaac_frame_effect_8279c0_field20_sub30(uint32_t base_bits);

/* ---- ABI v46: FUN_00827b70 special-quest-door window gate ----
 *
 * 0x00827b70..0x00827ba4 (plain `ret` @0x00827ba3). 52 B / 18 insns /
 * 0 resync. After 5xcc pad @0x00827b6b..6f. Frameless bool helper —
 * contcheck CLEAN (zero external branchers-in; the missing prologue
 * is genuine).
 *
 * 1 E8: host 0x00748490 (ecx=Game, result bit 1 of al) — captured as
 * a pred parameter per the v39 precedent. NO global writes; the Game
 * reads ([0xc71678] +0x1830c / +4 / +0) are resolved by the caller.
 * 6 direct E8 callers (byte-scan): 0x6b7006 / 0x77d498 / 0x79a7ce /
 * 0x7ba0f6 / 0x98e97f / 0x98ec74. Raw-dword ref @VA 0x86ca17
 * (dispatch table). identify-zhl body + callee EMPTY (ONE batch).
 *
 * MACHINE: [Game+0x1830c] != 1 -> fail; mode [Game+4] in {4,5} else
 * fail; stage [Game+0] == 2 -> pass; stage != 1 -> fail; else pass
 * iff host bit 1 set. FULL-dword compares.
 */
enum {
  ISAAC_FRAME_EFFECT_827B70_VA = 0x00827b70u,
  ISAAC_FRAME_EFFECT_827B70_RET_VA = 0x00827ba3u,
  ISAAC_FRAME_EFFECT_827B70_END_VA = 0x00827ba7u,
  ISAAC_FRAME_EFFECT_827B70_INSN_COUNT = 20u,
  ISAAC_FRAME_EFFECT_827B70_BYTE_LEN = 55u,
  ISAAC_FRAME_EFFECT_827B70_GAME_GLOBAL_VA = 0x00c71678u,
  ISAAC_FRAME_EFFECT_827B70_TRANSITION_MODE_OFF = 0x1830cu,
  ISAAC_FRAME_EFFECT_827B70_TRANSITION_MODE_VALUE = 1u,
  ISAAC_FRAME_EFFECT_827B70_MODE_OFF = 0x4u,
  ISAAC_FRAME_EFFECT_827B70_STAGE_OFF = 0x0u,
  ISAAC_FRAME_EFFECT_827B70_HOST_VA = 0x00748490u,
  ISAAC_FRAME_EFFECT_827B70_HOST_BIT_MASK = 0x2u,
  ISAAC_FRAME_EFFECT_827B70_DIRECT_CALLERS = 6u
};

int32_t isaac_frame_effect_827b70_gate(uint32_t transition_mode,
                                       uint32_t mode, uint32_t stage,
                                       int32_t host_bit1_set);

/* ---- ABI v47: FUN_00827bb0 Room::HasCurseMist (pure micro-leaf) ----
 *
 * 0x00827bb0..0x00827bbc (`ret` @0x00827bbb). 12 B / 5 insns /
 * 0 resync. After 4xcc pad @0x00827bbc.. — wait, pad AFTER body is
 * @0x00827bbc..bf; NEXT_VA 0x00827bc0.
 *
 * EXACT ZHL: `__thiscall bool Room::HasCurseMist();` — bit 13 of the
 * room-desc flags dword [[ecx+4]+0x44] (same flags dword as landed
 * bit 9 (v39 flag_bit9) and bit 5 (v41 gate); bit 13 is NEW).
 *
 * 0 E8 / 0 indirect / no SEH / no cookie / NO global writes.
 * 1 direct E8 caller (byte-scan): 0x78314a. Raw-dword ref @VA
 * 0x86ca2b (dispatch table). identify-zhl ONE batch named the body.
 *
 * MACHINE: eax = [[ecx+4]+0x44]; shr eax,13; and al,1; ret.
 */
enum {
  ISAAC_FRAME_EFFECT_827BB0_VA = 0x00827bb0u,
  ISAAC_FRAME_EFFECT_827BB0_RET_VA = 0x00827bbbu,
  ISAAC_FRAME_EFFECT_827BB0_END_VA = 0x00827bbcu,
  ISAAC_FRAME_EFFECT_827BB0_NEXT_VA = 0x00827bc0u,
  ISAAC_FRAME_EFFECT_827BB0_INSN_COUNT = 5u,
  ISAAC_FRAME_EFFECT_827BB0_BYTE_LEN = 12u,
  ISAAC_FRAME_EFFECT_827BB0_DESC_PTR_OFF = 0x4u,
  ISAAC_FRAME_EFFECT_827BB0_FLAGS_OFF = 0x44u,
  ISAAC_FRAME_EFFECT_827BB0_BIT_INDEX = 13u,
  ISAAC_FRAME_EFFECT_827BB0_DIRECT_CALLERS = 1u,
  ISAAC_FRAME_EFFECT_827BB0_DISPATCH_REF_VA = 0x0086ca2bu
};

/* FULL-dword flags in; (flags >> 13) & 1 out. */
int32_t isaac_frame_effect_827bb0_flag_bit13(uint32_t desc_flags);

/* ---- ABI v48: FUN_00827bc0 door-variant spawn window (pure leaf) ----
 *
 * 0x00827bc0..0x00827be4 (`ret` @0x00827be3). 36 B / 12 insns /
 * 0 resync. NO-PAD entry after v47; contcheck CLEAN (zero external
 * branchers-in; prologue-less frameless predicate is genuine).
 *
 * 1 E8: host 0x0074ea50 (ecx=Game, bool al) — captured as a pred
 * parameter per the v39/v46 precedent. NO global writes; the Game
 * read ([0xc71678]) is resolved by the caller.
 * 3 direct E8 callers (byte-scan): 0x762646 / 0x80ed7c / 0x9379d4.
 * Zero raw-dword refs. identify-zhl body + callee EMPTY (ONE batch).
 *
 * MACHINE: [ecx+8] == 5 else fail; d = [[ecx+4]+0x10];
 * [d+0x10] != 0x59 else fail... i.e. [d+0x10]==0x59 required; then
 * host pass -> al=1. FULL-dword compares, PE order.
 */
enum {
  ISAAC_FRAME_EFFECT_827BC0_VA = 0x00827bc0u,
  ISAAC_FRAME_EFFECT_827BC0_RET_VA = 0x00827be3u,
  ISAAC_FRAME_EFFECT_827BC0_END_VA = 0x00827be7u,
  ISAAC_FRAME_EFFECT_827BC0_INSN_COUNT = 14u,
  ISAAC_FRAME_EFFECT_827BC0_BYTE_LEN = 39u,
  ISAAC_FRAME_EFFECT_827BC0_FIELD8_OFF = 0x8u,
  ISAAC_FRAME_EFFECT_827BC0_FIELD8_VALUE = 5u,
  ISAAC_FRAME_EFFECT_827BC0_DESC_PTR_OFF = 0x4u,
  ISAAC_FRAME_EFFECT_827BC0_LIST_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_827BC0_TYPE_OFF = 0x10u,
  ISAAC_FRAME_EFFECT_827BC0_TYPE_VALUE = 0x59u,
  ISAAC_FRAME_EFFECT_827BC0_HOST_VA = 0x0074ea50u,
  ISAAC_FRAME_EFFECT_827BC0_DIRECT_CALLERS = 3u
};

int32_t isaac_frame_effect_827bc0_gate(uint32_t field8,
                                       uint32_t desc_type10,
                                       int32_t host_pass);

/* ---- ABI v49: FUN_00829920 record move-copy (pure thiscall leaf) ----
 *
 * 0x00829920..0x008299dd (`ret 4` @0x008299da). 189 B / 57 insns /
 * 0 resync. 3xcc pad after; NEXT_VA 0x008299e0.
 *
 * First post-band pure body past the MSVC CRT container close
 * (0x00827f30..0x00829710). Zero calls of ANY kind (no E8, no
 * indirect); no SEH/GS/fs; no global writes — writes go only through
 * the two pointer params. contcheck CLEAN: 2 direct E8 callers
 * (byte-scan), both inside FUN_00829710 (0x8297d6 / 0x8298d3); zero
 * branchers-in; zero raw-dword refs.
 *
 * MACHINE (thiscall dst=ecx, src=[esp+4]; returns eax=dst):
 * dst[+0x00..+0x13] = src (5 dwords); dst[+0x14]/+0x24/+0x28 zeroed;
 * movups dst[+0x14..+0x23] = src; movq dst[+0x24..+0x2b] = src;
 * src string reset (size +0x24 = 0, cap +0x28 = 0xf, buf[0] = 0);
 * dst[+0x2c..+0x40] = src (6 dwords); word +0x44, bytes +0x46/+0x47,
 * dwords +0x48..+0x58 = src. Record size 0x5c; SSO std::string at
 * +0x14 (buf/size/cap). The dst zero-stores precede the reloads, so
 * self-move (dst == src) is observable and preserved by the
 * translation's PE store order.
 */
enum {
  ISAAC_FRAME_EFFECT_829920_VA = 0x00829920u,
  ISAAC_FRAME_EFFECT_829920_RET_VA = 0x008299dau,
  ISAAC_FRAME_EFFECT_829920_END_VA = 0x008299ddu,
  ISAAC_FRAME_EFFECT_829920_NEXT_VA = 0x008299e0u,
  ISAAC_FRAME_EFFECT_829920_INSN_COUNT = 57u,
  ISAAC_FRAME_EFFECT_829920_BYTE_LEN = 189u,
  ISAAC_FRAME_EFFECT_829920_REC_SIZE = 0x5cu,
  ISAAC_FRAME_EFFECT_829920_STRING_OFF = 0x14u,
  ISAAC_FRAME_EFFECT_829920_SIZE_OFF = 0x24u,
  ISAAC_FRAME_EFFECT_829920_CAP_OFF = 0x28u,
  ISAAC_FRAME_EFFECT_829920_SSO_CAP_RESET = 0xfu,
  ISAAC_FRAME_EFFECT_829920_DIRECT_CALLERS = 2u
};

/* Returns dst bits (PE eax = esi). Null args: no writes, returns dst. */
int32_t isaac_frame_effect_829920_record_move(int32_t *dst,
                                              const int32_t *src);

/* ---- ABI v50: FUN_008299e0 signed-word pair strict-less (pure
 * ---- frameless cdecl leaf) ----
 *
 * 0x008299e0..0x00829a0b (`ret` @0x00829a05 early-false /
 * `ret` @0x00829a0a true-exit). 43 B / 21 insns / 0 resync. 5xcc pad
 * after; NEXT_VA 0x00829a10.
 *
 * Zero calls (no E8, no indirect); no SEH/GS/fs; no global writes;
 * reads only through the two param pointers (each record = one
 * dword: word +0 low, word +2 high). contcheck CLEAN: ZERO direct
 * E8 callers; zero external branchers-in; ONE raw-dword ref @VA
 * 0x00429c39 (comparator passed by pointer, functor style).
 *
 * MACHINE (cdecl a=[esp+4]/eax, b=[esp+8]/ecx): movzx dx,
 * word[a+2]; movzx si, word[b+2]; cmp dx,si -> jl TRUE; jne FALSE;
 * else mov ax, word[a]; cmp ax, word[b] -> jl TRUE; else FALSE.
 * BOTH compares are SIGNED 16-bit (jl on movzx-loaded halves).
 */
enum {
  ISAAC_FRAME_EFFECT_8299E0_VA = 0x008299e0u,
  ISAAC_FRAME_EFFECT_8299E0_RET_FALSE_VA = 0x00829a05u,
  ISAAC_FRAME_EFFECT_8299E0_RET_TRUE_VA = 0x00829a0au,
  ISAAC_FRAME_EFFECT_8299E0_END_VA = 0x00829a0bu,
  ISAAC_FRAME_EFFECT_8299E0_NEXT_VA = 0x00829a10u,
  ISAAC_FRAME_EFFECT_8299E0_INSN_COUNT = 21u,
  ISAAC_FRAME_EFFECT_8299E0_BYTE_LEN = 43u,
  ISAAC_FRAME_EFFECT_8299E0_HIGH_OFF = 0x2u,
  ISAAC_FRAME_EFFECT_8299E0_DIRECT_CALLERS = 0u,
  ISAAC_FRAME_EFFECT_8299E0_RAW_REF_VA = 0x00429c39u
};

int32_t isaac_frame_effect_8299e0_pair_less(uint32_t a, uint32_t b);

/* ---- ABI v51: FUN_00829a10 stage/mode/variant -> result map (pure
 * ---- frameless fastcall dispatch leaf) ----
 *
 * 0x00829a10..0x00829ad4 (10 rets, shared -1 default via the entry
 * or eax,-1). 196 B / 85 insns / 0 resync. 28xcc pad after;
 * NEXT_VA 0x00829af0.
 *
 * Zero calls; no SEH/GS/fs; only memory read is [esp+8]; no global
 * writes. contcheck CLEAN: 4 direct E8 callers (byte-scan)
 * 0x82a20c / 0x82a662 / 0x82b076 / 0x82b257; zero branchers-in;
 * zero raw-dword refs.
 *
 * MACHINE (fastcall stage=ecx, mode=edx, variant=[esp+8]):
 * ecx in {-1,12}: mode==3 -> 0; mode==10 -> mode-6(=4); else -1.
 * ecx==6:  mode==-1 -> 1; mode==14 && variant==11 -> 1;
 *          mode==14 && variant!=11 -> 3; mode==6 && variant==9 ->
 *          mode-5(=1); mode==6 && variant!=9 -> -1; mode==7 -> 3;
 *          else -1.
 * ecx==19: mode==-1 -> 5; mode==14 && variant==12 -> 5;
 *          mode==14 && variant!=12 -> 7; mode==6 && variant==10 ->
 *          mode-1(=5); mode==6 && variant!=10 -> -1; mode==7 -> 7;
 *          else -1.
 * ecx in {13,26}: mode==3 -> mode-1(=2); mode==10 -> mode-4(=6);
 *          else -1. All other stages -> -1.
 */
enum {
  ISAAC_FRAME_EFFECT_829A10_VA = 0x00829a10u,
  ISAAC_FRAME_EFFECT_829A10_END_VA = 0x00829ad4u,
  ISAAC_FRAME_EFFECT_829A10_NEXT_VA = 0x00829af0u,
  ISAAC_FRAME_EFFECT_829A10_INSN_COUNT = 85u,
  ISAAC_FRAME_EFFECT_829A10_BYTE_LEN = 196u,
  ISAAC_FRAME_EFFECT_829A10_RET_COUNT = 10u,
  ISAAC_FRAME_EFFECT_829A10_DIRECT_CALLERS = 4u,
  ISAAC_FRAME_EFFECT_829A10_FAIL_RET = -1
};

int32_t isaac_frame_effect_829a10_stage_mode_map(int32_t stage,
                                                 int32_t mode,
                                                 int32_t variant);

uint32_t isaac_frame_effect_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
